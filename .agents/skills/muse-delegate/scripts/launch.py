#!/usr/bin/env python3
"""Launch a bounded Muse task in an isolated Git worktree."""

from __future__ import annotations

import argparse
import atexit
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import subprocess
import sys
from datetime import datetime, timezone
from typing import Iterable
from uuid import uuid4

from control import clear_expired_automatic_state, delegation_state, detect_usage_limit, disable_for_usage_limit
from hardening import AdmissionLease, classify_failure, metered_credential_override, terminate_process_group
from usage import accumulate_event_usage, empty_usage, record_run_usage, usage_from_session_export
from shared_state import admit as shared_admit, billing_verified, isolation_verified, provider_state, release as shared_release, state_root as default_shared_root


def run(
    command: list[str],
    *,
    cwd: Path | None = None,
    check: bool = True,
    timeout: int | None = None,
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, cwd=cwd, check=check, text=True, capture_output=True, timeout=timeout)


def git(workspace: Path, *args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return run(["git", "-C", str(workspace), *args], check=check)


def normalize_allow_path(value: str) -> str:
    raw = value.replace("\\", "/").strip()
    path = PurePosixPath(raw)
    if not raw or path.is_absolute() or ".." in path.parts or raw.startswith("./"):
        raise ValueError(f"allow paths must be normalized repo-relative paths: {value!r}")
    normalized = str(path).rstrip("/")
    if normalized in {"", "."}:
        raise ValueError("the repository root cannot be an allowed path")
    return normalized


def path_is_allowed(path: str, allowed: Iterable[str]) -> bool:
    normalized = path.replace("\\", "/").rstrip("/")
    return any(normalized == root or normalized.startswith(root + "/") for root in allowed)


def changed_paths(worktree: Path) -> list[str]:
    commands = [
        ["diff", "--name-only", "-z", "HEAD"],
        ["diff", "--cached", "--name-only", "-z"],
        ["ls-files", "--others", "--exclude-standard", "-z"],
    ]
    found: set[str] = set()
    for args in commands:
        output = git(worktree, *args).stdout
        found.update(item for item in output.split("\0") if item)
    return sorted(found)


def dirty_paths(workspace: Path) -> list[str]:
    output = git(workspace, "status", "--porcelain=v1", "-z", "--untracked-files=all").stdout
    records = [record for record in output.split("\0") if record]
    paths: list[str] = []
    index = 0
    while index < len(records):
        record = records[index]
        paths.append(record[3:])
        if len(record) >= 2 and record[0] in {"R", "C"}:
            index += 1
            if index < len(records):
                paths.append(records[index])
        index += 1
    return sorted(set(paths))


def source_drift_paths(workspace: Path, base_commit: str, allowed: list[str]) -> list[str]:
    tracked = git(workspace, "diff", "--name-only", "-z", base_commit, "--", *allowed).stdout
    changed = {item for item in tracked.split("\0") if item}
    changed.update(path for path in dirty_paths(workspace) if path_is_allowed(path, allowed))
    return sorted(changed)


def capture_snapshot(worktree: Path, run_dir: Path, paths: list[str]) -> tuple[list[dict[str, object]], list[str]]:
    snapshot_root = run_dir / "partial-files"
    snapshot_root.mkdir(exist_ok=True)
    artifacts: list[dict[str, object]] = []
    unsafe: list[str] = []
    for relative in paths:
        source = worktree / relative
        if not source.exists() and not source.is_symlink():
            artifacts.append({"path": relative, "kind": "deleted"})
            continue
        try:
            resolved = source.resolve(strict=True)
            resolved.relative_to(worktree.resolve())
        except (OSError, ValueError):
            unsafe.append(relative)
            continue
        mode = source.lstat().st_mode
        if not stat.S_ISREG(mode):
            unsafe.append(relative)
            continue
        destination = snapshot_root / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        artifacts.append({
            "path": relative,
            "kind": "regular",
            "sha256": hashlib.sha256(destination.read_bytes()).hexdigest(),
            "bytes": destination.stat().st_size,
            "snapshot": str(destination),
        })
    patch_path = run_dir / "tracked.patch"
    patch_path.write_text(git(worktree, "diff", "--binary", "HEAD").stdout, encoding="utf-8")
    artifacts.append({"path": "tracked.patch", "kind": "patch", "sha256": hashlib.sha256(patch_path.read_bytes()).hexdigest(), "snapshot": str(patch_path)})
    return artifacts, unsafe


def resolve_muse_binary(explicit: str | None) -> Path:
    candidates: list[Path] = []
    if explicit:
        candidates.append(Path(explicit).expanduser())
    if os.environ.get("MUSE_BIN"):
        candidates.append(Path(os.environ["MUSE_BIN"]).expanduser())
    discovered = shutil.which("muse")
    if discovered:
        candidates.append(Path(discovered))
    local_bins = sorted(
        (Path.home() / ".local" / "bin").glob("muse-bin-*"),
        key=lambda item: item.stat().st_mtime,
        reverse=True,
    )
    candidates.extend(local_bins)
    for candidate in candidates:
        if candidate.is_file() and os.access(candidate, os.X_OK):
            return candidate.resolve()
    raise FileNotFoundError("Muse was not found. Set MUSE_BIN to the executable path.")


def safe_name(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return normalized[:40] or "task"


def write_json(path: Path, value: object) -> None:
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary.replace(path)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workspace", default=".", help="Git workspace to delegate from")
    parser.add_argument("--prompt-file", required=True)
    parser.add_argument("--name", default="task")
    parser.add_argument("--allow-path", action="append", required=True)
    parser.add_argument(
        "--sparse-path",
        action="append",
        help="Optional repo-relative directory to materialize instead of checking out the full repository",
    )
    parser.add_argument("--base", default="HEAD")
    parser.add_argument("--muse-bin")
    parser.add_argument("--max-model-steps", type=int, default=20)
    parser.add_argument("--max-wall-clock-seconds", type=int, default=900)
    parser.add_argument("--reasoning-effort", choices=["none", "minimal", "low", "medium", "high", "xhigh", "max", "ultra"], default="high")
    parser.add_argument("--enable-web", action="store_true")
    parser.add_argument("--disable-shell", action="store_true", help="Disable Muse shell tools for a file-tools-only worker")
    parser.add_argument("--worktree-root", help=argparse.SUPPRESS)
    parser.add_argument("--runtime-root", help=argparse.SUPPRESS)
    parser.add_argument("--state-root", help=argparse.SUPPRESS)
    parser.add_argument("--automatic", action="store_true", help="Require verified subscription evidence for automatic routing")
    parser.add_argument("--task-id", help=argparse.SUPPRESS)
    parser.add_argument("--attempt-id", help=argparse.SUPPRESS)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    workspace = Path(args.workspace).expanduser().resolve()
    prompt_file = Path(args.prompt_file).expanduser().resolve()
    try:
        repo_root = Path(git(workspace, "rev-parse", "--show-toplevel").stdout.strip()).resolve()
        allowed = sorted(set(normalize_allow_path(item) for item in args.allow_path))
        sparse_paths = sorted(set(normalize_allow_path(item) for item in (args.sparse_path or [])))
        base_commit = git(repo_root, "rev-parse", f"{args.base}^{{commit}}").stdout.strip()
    except (subprocess.CalledProcessError, ValueError, FileNotFoundError) as error:
        print(f"muse-delegate preflight failed: {error}", file=sys.stderr)
        return 2
    runtime_root = Path(args.runtime_root).expanduser().resolve() if args.runtime_root else repo_root / ".runtime" / "muse-delegate"
    state_root = Path(args.state_root).expanduser().resolve() if args.state_root else default_shared_root()
    delegation_enabled, delegation_reason = delegation_state(runtime_root, state_root)
    if not delegation_enabled:
        print(f"muse-delegate is disabled: {delegation_reason}", file=sys.stderr)
        return 6
    clear_expired_automatic_state(runtime_root)
    try:
        muse_bin = resolve_muse_binary(args.muse_bin)
    except FileNotFoundError as error:
        print(f"muse-delegate preflight failed: {error}", file=sys.stderr)
        return 2
    if not prompt_file.is_file():
        print(f"muse-delegate preflight failed: prompt file does not exist: {prompt_file}", file=sys.stderr)
        return 2
    if args.max_model_steps < 1:
        print("muse-delegate preflight failed: --max-model-steps must be positive", file=sys.stderr)
        return 2
    if args.max_wall_clock_seconds < 1:
        print("muse-delegate preflight failed: --max-wall-clock-seconds must be positive", file=sys.stderr)
        return 2
    metered_override = metered_credential_override()
    if metered_override:
        print(
            f"muse-delegate refused: {metered_override} is set and may select metered Model API billing; "
            "remove it from this process environment before using subscription-only delegation.",
            file=sys.stderr,
        )
        return 10
    if args.automatic and not billing_verified(state_root):
        print("muse-delegate refused: stored credential subscription billing is unverified for automatic routing.", file=sys.stderr)
        return 10
    if args.automatic and not isolation_verified(state_root):
        print("muse-delegate refused: effective read/write isolation is unverified for automatic routing.", file=sys.stderr)
        return 10

    current_dirty = dirty_paths(repo_root)
    overlapping_dirty = [path for path in current_dirty if path_is_allowed(path, allowed)]
    if overlapping_dirty:
        print("muse-delegate refused because the source checkout has dirty changes inside the delegated boundary:", file=sys.stderr)
        for path in overlapping_dirty:
            print(f"  {path}", file=sys.stderr)
        return 2

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    run_id = f"{timestamp}-{safe_name(args.name)}-{uuid4().hex[:8]}"
    lease = AdmissionLease(state_root, run_id)
    lease_acquired, lease_reason = lease.acquire()
    if not lease_acquired:
        print(f"muse-delegate is busy: {lease_reason}", file=sys.stderr)
        return 8
    atexit.register(lease.release)
    shared_admission = shared_admit(state_root, "muse", args.task_id or run_id, args.attempt_id or run_id)
    if not shared_admission.get("admitted"):
        lease.release()
        print(f"muse-delegate is busy: {shared_admission.get('reason')}", file=sys.stderr)
        return 8
    worktree_root = Path(args.worktree_root).expanduser().resolve() if args.worktree_root else Path.home() / ".codex" / "worktrees" / "muse-delegate"
    worktree = worktree_root / f"{safe_name(repo_root.name)}-{run_id}"
    run_dir = runtime_root / run_id
    worktree.parent.mkdir(parents=True, exist_ok=True)
    run_dir.mkdir(parents=True, exist_ok=False)

    original_prompt = prompt_file.read_text(encoding="utf-8")
    effective_prompt = run_dir / "effective-prompt.md"
    effective_prompt.write_text(
        "\n".join(
            [
                "# Delegated execution invariants",
                "",
                "You are a delegated implementation worker. Work only in the supplied isolated worktree.",
                f"Starting commit: {base_commit}",
                "Allowed paths:",
                *[f"- {path}" for path in allowed],
                "",
                "Do not edit outside the allowed paths. Do not commit, push, merge, package, deploy, publish, or change branches.",
                "Read and obey the repository instructions that apply to the allowed boundary.",
                "Return exact checks, results, changed files, compatibility notes, and unresolved risks.",
                "",
                "# Task-specific contract",
                "",
                original_prompt.rstrip(),
                "",
            ]
        ),
        encoding="utf-8",
    )

    try:
        muse_version = run([str(muse_bin), "--version"], check=False, timeout=10).stdout.strip()
    except subprocess.TimeoutExpired:
        muse_version = "unavailable-version-check-timeout"
    manifest_path = run_dir / "manifest.json"
    manifest: dict[str, object] = {
        "schemaVersion": 1,
        "runId": run_id,
        "taskId": args.task_id or run_id,
        "attemptId": args.attempt_id or run_id,
        "ownerGeneration": shared_admission["ownerGeneration"],
        "status": "preparing",
        "workspace": str(repo_root),
        "worktree": str(worktree),
        "baseCommit": base_commit,
        "allowedPaths": allowed,
        "sparsePaths": sparse_paths,
        "sourceDirtyPathsExcluded": current_dirty,
        "promptSha256": hashlib.sha256(original_prompt.encode("utf-8")).hexdigest(),
        "museBinary": str(muse_bin),
        "museVersion": muse_version,
        "billingGuard": {
            "meteredEnvironmentOverride": False,
            "storedCredentialSubscriptionStatus": "verified-evidence-on-file" if billing_verified(state_root) else "unverifiable-by-installed-cli",
        },
        "admissionLease": str(lease.lock_path),
        "maxWallClockSeconds": args.max_wall_clock_seconds,
        "startedAt": datetime.now(timezone.utc).isoformat(),
    }
    write_json(manifest_path, manifest)

    try:
        worktree_args = ["worktree", "add", "--detach"]
        if sparse_paths:
            worktree_args.append("--no-checkout")
        worktree_args.extend([str(worktree), base_commit])
        git(repo_root, *worktree_args)
        if sparse_paths:
            git(worktree, "sparse-checkout", "init", "--cone")
            git(worktree, "sparse-checkout", "set", *sparse_paths)
            git(worktree, "checkout", "--detach", base_commit)
    except subprocess.CalledProcessError as error:
        manifest.update({"status": "worktree_failed", "error": error.stderr.strip()})
        write_json(manifest_path, manifest)
        git(repo_root, "worktree", "remove", "--force", str(worktree), check=False)
        shared_release(state_root, str(shared_admission["token"]), True, "failure")
        print(error.stderr, file=sys.stderr)
        return 2

    command = [
        str(muse_bin),
        "exec",
        "--json",
        "--workspace",
        str(repo_root),
        "--worktree",
        "existing",
        "--worktree-existing",
        str(worktree),
        "--trust-workspace",
        "--approval-mode",
        "never",
        "--no-foreign-personal-context",
        "--reasoning-effort",
        args.reasoning_effort,
        "--max-model-steps",
        str(args.max_model_steps),
        "--prompt-file",
        str(effective_prompt),
    ]
    if not args.enable_web:
        command.insert(-2, "--disable-web-tools")
    if args.disable_shell:
        command.insert(-2, "--disable-shell")

    transcript_path = run_dir / "events.jsonl"
    stderr_path = run_dir / "stderr.txt"
    final_text = ""
    provider_error_text = ""
    event_count = 0
    usage_totals = empty_usage()
    usage_source = "unavailable"
    muse_session_id = ""
    manifest["status"] = "running"
    write_json(manifest_path, manifest)
    print(f"Muse run: {run_id}", flush=True)
    print(f"Base: {base_commit}", flush=True)
    print(f"Worktree: {worktree}", flush=True)
    print(f"Allowed: {', '.join(allowed)}", flush=True)

    process: subprocess.Popen[str] | None = None
    return_code = 1
    timed_out = False
    cancelled = False
    worker_stopped = True
    worker_tmp = run_dir / "worker-tmp"
    worker_tmp.mkdir(mode=0o700)
    worker_env = os.environ.copy()
    worker_env.update({"TMPDIR": str(worker_tmp), "TMP": str(worker_tmp), "TEMP": str(worker_tmp)})
    try:
        with transcript_path.open("w", encoding="utf-8") as transcript, stderr_path.open("w", encoding="utf-8") as stderr_file:
            process = subprocess.Popen(
                command,
                stdout=transcript,
                stderr=stderr_file,
                text=True,
                start_new_session=True,
                env=worker_env,
            )
            try:
                return_code = process.wait(timeout=args.max_wall_clock_seconds)
            except subprocess.TimeoutExpired:
                timed_out = True
                worker_stopped = terminate_process_group(process)
                return_code = process.returncode if process.returncode is not None else 124
                print("Muse run exceeded its wall-clock limit; retained work will be handed back to Codex.", file=sys.stderr)
    except KeyboardInterrupt:
        cancelled = True
        if process:
            worker_stopped = terminate_process_group(process)
        return_code = 130
        print("Muse run interrupted; worktree retained for inspection.", file=sys.stderr)
    if process and not timed_out and not cancelled:
        worker_stopped = terminate_process_group(process, grace_seconds=1)

    if transcript_path.is_file():
        with transcript_path.open("r", encoding="utf-8", errors="replace") as transcript:
            for line in transcript:
                event_count += 1
                try:
                    event = json.loads(line)
                except json.JSONDecodeError:
                    continue
                payload_type = str(event.get("payload_type") or "")
                accumulate_event_usage(usage_totals, event)
                if usage_totals["providerCalls"]:
                    usage_source = "stream-events"
                stream = event.get("stream") or {}
                if not muse_session_id and isinstance(stream, dict) and stream.get("kind") == "session":
                    muse_session_id = str(stream.get("id") or "")
                if any(marker in payload_type for marker in ("error", "failed", "provider")):
                    provider_error_text += line
                if payload_type == "run.terminal.completed":
                    payload = event.get("payload") or {}
                    if isinstance(payload, dict):
                        final_text = str(payload.get("text") or "")
    if stderr_path.is_file():
        provider_error_text += stderr_path.read_text(encoding="utf-8", errors="replace")

    session_export_path = run_dir / "session-export.json"
    session_export_error = ""
    if muse_session_id:
        try:
            export = run(
                [str(muse_bin), "export", "--session", muse_session_id, "--out", str(session_export_path), "--redacted"],
                check=False,
                timeout=30,
            )
            if export.returncode == 0 and session_export_path.is_file():
                try:
                    exported_usage, _export_started, _export_finished = usage_from_session_export(session_export_path)
                    if exported_usage["providerCalls"]:
                        usage_totals = exported_usage
                        usage_source = "redacted-session-export"
                except (OSError, ValueError, json.JSONDecodeError) as error:
                    session_export_error = str(error)
            else:
                session_export_error = (export.stdout + export.stderr).strip() or f"Muse export exited {export.returncode}"
        except subprocess.TimeoutExpired:
            session_export_error = "Muse session export exceeded 30 seconds"

    paths = changed_paths(worktree)
    violations = [path for path in paths if not path_is_allowed(path, allowed)]
    artifacts, unsafe_paths = capture_snapshot(worktree, run_dir, paths)
    source_drift = source_drift_paths(repo_root, base_commit, allowed)
    diff_check = git(worktree, "diff", "--check", check=False)
    status = "completed"
    exit_code = return_code
    automatic_disabled_until = ""
    failure_reason = classify_failure(return_code, provider_error_text, timed_out=timed_out, cancelled=cancelled)
    if failure_reason == "SUBSCRIPTION_EXHAUSTED":
        status = "usage_limited"
        exit_code = 7
        automatic_disabled_until = disable_for_usage_limit(runtime_root, detect_usage_limit(provider_error_text) or "subscription limit", state_root)
    elif failure_reason == "AUTH_REQUIRED":
        status = "authentication_required"
        provider_state(state_root, False, "Muse authentication requires inspection")
    elif failure_reason == "PERMISSION_DENIED":
        status = "permission_hold"
    elif failure_reason == "WORKER_TIMEOUT":
        status = "worker_timeout" if worker_stopped else "worker_shutdown_unconfirmed"
        exit_code = 9
    elif failure_reason == "USER_CANCELLED":
        status = "cancelled" if worker_stopped else "worker_shutdown_unconfirmed"
        exit_code = 130
    elif return_code != 0:
        status = "muse_failed"
    elif not worker_stopped:
        status = "worker_shutdown_unconfirmed"
    elif violations:
        status = "scope_violation"
        exit_code = 4
    elif unsafe_paths:
        status = "unsafe_artifact"
        exit_code = 4
    elif len(paths) > 8:
        status = "changed_file_limit"
        exit_code = 4
    elif source_drift:
        status = "source_drift"
        exit_code = 4
    elif diff_check.returncode != 0:
        status = "diff_check_failed"
        exit_code = 5
    if not worker_stopped:
        status = "worker_shutdown_unconfirmed"
        exit_code = 9

    (run_dir / "final.txt").write_text(final_text, encoding="utf-8")
    finished_at = datetime.now(timezone.utc).isoformat()
    fallback = status in {"usage_limited", "worker_timeout", "worker_shutdown_unconfirmed", "muse_failed", "authentication_required"}
    if cancelled:
        next_action = "stop_user_cancelled"
    elif status == "permission_hold":
        next_action = "stop_permission_hold"
    elif not worker_stopped:
        next_action = "quarantine_worktree"
    elif fallback:
        next_action = "continue_in_current_codex_session"
    elif status == "completed":
        next_action = "review_delegated_changes"
    else:
        next_action = "reject_delegated_changes"
    result_path = run_dir / "result.json"
    result = {
        "schemaVersion": 1,
        "runId": run_id,
        "taskId": args.task_id or run_id,
        "attemptId": args.attempt_id or run_id,
        "ownerGeneration": shared_admission["ownerGeneration"],
        "outcome": "fallback" if fallback else ("completed" if status == "completed" else "rejected"),
        "reason": failure_reason if failure_reason != "NONE" else status.upper(),
        "nextAction": next_action,
        "partialChanges": bool(paths),
        "workerStopped": worker_stopped,
        "snapshotReady": worker_stopped and worktree.is_dir(),
        "worktree": str(worktree),
        "changedPaths": paths,
        "sourceDriftPaths": source_drift,
        "artifactManifest": str(run_dir / "artifacts.json"),
        "unsafeArtifactPaths": unsafe_paths,
        "checksRun": [{"command": "git diff --check", "exitCode": diff_check.returncode, "evidenceRef": str(manifest_path)}],
        "checksDeferred": [],
        "observedProvider": "muse-code-cli",
        "usage": {"source": usage_source, "values": usage_totals if usage_source != "unavailable" else None},
        "verification": "pending_codex_review",
        "automaticDisabledUntil": automatic_disabled_until,
    }
    write_json(run_dir / "artifacts.json", {"schemaVersion": 1, "artifactRefs": artifacts})
    if len((json.dumps(result, sort_keys=True) + "\n").encode("utf-8")) > 4_000:
        result = {
            "schemaVersion": 1, "runId": run_id, "taskId": args.task_id or run_id,
            "attemptId": args.attempt_id or run_id, "ownerGeneration": shared_admission["ownerGeneration"],
            "outcome": "rejected", "reason": "RESULT_SUMMARY_OVERFLOW",
            "nextAction": "inspect_full_manifest_and_reject_automatic_integration",
            "workerStopped": worker_stopped, "changedPaths": [], "checksRun": [],
            "observedProvider": "muse-code-cli", "artifactManifest": str(run_dir / "artifacts.json"),
            "usageSource": usage_source,
        }
        status = "result_summary_overflow"
        exit_code = 4
    if len((json.dumps(result, sort_keys=True) + "\n").encode("utf-8")) > 4_000:
        raise RuntimeError("Minimal worker result exceeds 4,000 UTF-8 bytes")
    write_json(result_path, result)
    manifest.update(
        {
            "status": status,
            "finishedAt": finished_at,
            "museExitCode": return_code,
            "eventCount": event_count,
            "changedPaths": paths,
            "scopeViolations": violations,
            "sourceDriftPaths": source_drift,
            "artifactRefs": artifacts,
            "unsafeArtifactPaths": unsafe_paths,
            "automaticDisabledUntil": automatic_disabled_until,
            "failureReason": failure_reason,
            "workerStopped": worker_stopped,
            "result": str(result_path),
            "diffCheckOk": diff_check.returncode == 0,
            "diffCheckOutput": (diff_check.stdout + diff_check.stderr).strip(),
            "transcript": str(transcript_path),
            "stderr": str(stderr_path),
            "finalText": str(run_dir / "final.txt"),
            "usage": usage_totals,
            "museSessionId": muse_session_id,
            "sessionExport": str(session_export_path) if session_export_path.is_file() else "",
            "sessionExportError": session_export_error,
        }
    )
    write_json(manifest_path, manifest)
    record_run_usage(
        runtime_root,
        run_id=run_id,
        started_at=str(manifest["startedAt"]),
        finished_at=finished_at,
        status=status,
        usage=usage_totals,
    )

    print(f"Status: {status}")
    print(
        "Muse usage: "
        f"{usage_totals['providerCalls']} provider calls, "
        f"{usage_totals['inputTokens']} input tokens "
        f"({usage_totals['cachedInputTokens']} cached), "
        f"{usage_totals['outputTokens']} output tokens"
    )
    print(f"Changed files: {len(paths)}")
    for path in paths:
        print(f"  {path}")
    if violations:
        print("Scope violations:", file=sys.stderr)
        for path in violations:
            print(f"  {path}", file=sys.stderr)
    if source_drift:
        print("Source changed inside the delegated boundary; preserve both versions and reject automatic integration.", file=sys.stderr)
    if automatic_disabled_until:
        print(f"Muse usage circuit open until: {automatic_disabled_until}", file=sys.stderr)
    if diff_check.returncode != 0:
        print(diff_check.stdout + diff_check.stderr, file=sys.stderr)
    print(f"Manifest: {manifest_path}")
    print(f"Result: {result_path}")
    if final_text:
        print("\nMuse final report:\n")
        print(final_text)
    shared_release(state_root, str(shared_admission["token"]), worker_stopped, "success" if status == "completed" else "failure")
    lease.release()
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
