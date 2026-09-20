#!/usr/bin/env python3
"""Launch a bounded Muse task in an isolated Git worktree."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from typing import Iterable
from uuid import uuid4

from control import clear_expired_automatic_state, delegation_state, detect_usage_limit, disable_for_usage_limit
from usage import accumulate_event_usage, empty_usage, record_run_usage, usage_from_session_export


def run(command: list[str], *, cwd: Path | None = None, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, cwd=cwd, check=check, text=True, capture_output=True)


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
    parser.add_argument("--max-model-steps", type=int, default=120)
    parser.add_argument("--reasoning-effort", choices=["none", "minimal", "low", "medium", "high", "xhigh", "max", "ultra"], default="high")
    parser.add_argument("--enable-web", action="store_true")
    parser.add_argument("--worktree-root", help=argparse.SUPPRESS)
    parser.add_argument("--runtime-root", help=argparse.SUPPRESS)
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
    delegation_enabled, delegation_reason = delegation_state(runtime_root)
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

    current_dirty = dirty_paths(repo_root)
    overlapping_dirty = [path for path in current_dirty if path_is_allowed(path, allowed)]
    if overlapping_dirty:
        print("muse-delegate refused because the source checkout has dirty changes inside the delegated boundary:", file=sys.stderr)
        for path in overlapping_dirty:
            print(f"  {path}", file=sys.stderr)
        return 2

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    run_id = f"{timestamp}-{safe_name(args.name)}-{uuid4().hex[:8]}"
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

    manifest_path = run_dir / "manifest.json"
    manifest: dict[str, object] = {
        "schemaVersion": 1,
        "runId": run_id,
        "status": "preparing",
        "workspace": str(repo_root),
        "worktree": str(worktree),
        "baseCommit": base_commit,
        "allowedPaths": allowed,
        "sparsePaths": sparse_paths,
        "sourceDirtyPathsExcluded": current_dirty,
        "promptSha256": hashlib.sha256(original_prompt.encode("utf-8")).hexdigest(),
        "museBinary": str(muse_bin),
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

    transcript_path = run_dir / "events.jsonl"
    final_text = ""
    usage_limit_evidence = ""
    event_count = 0
    usage_totals = empty_usage()
    muse_session_id = ""
    manifest["status"] = "running"
    write_json(manifest_path, manifest)
    print(f"Muse run: {run_id}", flush=True)
    print(f"Base: {base_commit}", flush=True)
    print(f"Worktree: {worktree}", flush=True)
    print(f"Allowed: {', '.join(allowed)}", flush=True)

    process: subprocess.Popen[str] | None = None
    return_code = 1
    try:
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1, errors="replace")
        assert process.stdout is not None
        with transcript_path.open("w", encoding="utf-8") as transcript:
            for line in process.stdout:
                transcript.write(line)
                transcript.flush()
                event_count += 1
                try:
                    event = json.loads(line)
                except json.JSONDecodeError:
                    message = line.strip()
                    if message:
                        print(f"[muse] {message}", flush=True)
                    if not usage_limit_evidence:
                        usage_limit_evidence = detect_usage_limit(message) or ""
                    continue
                payload_type = str(event.get("payload_type") or "")
                accumulate_event_usage(usage_totals, event)
                stream = event.get("stream") or {}
                if not muse_session_id and isinstance(stream, dict) and stream.get("kind") == "session":
                    muse_session_id = str(stream.get("id") or "")
                if not usage_limit_evidence and any(marker in payload_type for marker in ("error", "failed", "terminal", "provider")):
                    usage_limit_evidence = detect_usage_limit(line) or ""
                if payload_type == "run.terminal.completed":
                    payload = event.get("payload") or {}
                    if isinstance(payload, dict):
                        final_text = str(payload.get("text") or "")
                if event_count % 100 == 0:
                    print(f"[muse] {event_count} events processed", flush=True)
        return_code = process.wait()
    except KeyboardInterrupt:
        if process and process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                process.kill()
        return_code = 130
        print("Muse run interrupted; worktree retained for inspection.", file=sys.stderr)

    session_export_path = run_dir / "session-export.json"
    session_export_error = ""
    if muse_session_id:
        export = run(
            [str(muse_bin), "export", "--session", muse_session_id, "--out", str(session_export_path), "--redacted"],
            check=False,
        )
        if export.returncode == 0 and session_export_path.is_file():
            try:
                exported_usage, _export_started, _export_finished = usage_from_session_export(session_export_path)
                if exported_usage["providerCalls"]:
                    usage_totals = exported_usage
            except (OSError, ValueError, json.JSONDecodeError) as error:
                session_export_error = str(error)
        else:
            session_export_error = (export.stdout + export.stderr).strip() or f"Muse export exited {export.returncode}"

    paths = changed_paths(worktree)
    violations = [path for path in paths if not path_is_allowed(path, allowed)]
    diff_check = git(worktree, "diff", "--check", check=False)
    status = "completed"
    exit_code = return_code
    automatic_disabled_until = ""
    if return_code != 0 and usage_limit_evidence:
        status = "usage_limited"
        exit_code = 7
        automatic_disabled_until = disable_for_usage_limit(runtime_root, usage_limit_evidence)
    elif return_code != 0:
        status = "muse_failed"
    elif violations:
        status = "scope_violation"
        exit_code = 4
    elif diff_check.returncode != 0:
        status = "diff_check_failed"
        exit_code = 5

    (run_dir / "final.txt").write_text(final_text, encoding="utf-8")
    finished_at = datetime.now(timezone.utc).isoformat()
    manifest.update(
        {
            "status": status,
            "finishedAt": finished_at,
            "museExitCode": return_code,
            "eventCount": event_count,
            "changedPaths": paths,
            "scopeViolations": violations,
            "automaticDisabledUntil": automatic_disabled_until,
            "diffCheckOk": diff_check.returncode == 0,
            "diffCheckOutput": (diff_check.stdout + diff_check.stderr).strip(),
            "transcript": str(transcript_path),
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
    if automatic_disabled_until:
        print(f"Muse usage circuit open until: {automatic_disabled_until}", file=sys.stderr)
    if diff_check.returncode != 0:
        print(diff_check.stdout + diff_check.stderr, file=sys.stderr)
    print(f"Manifest: {manifest_path}")
    if final_text:
        print("\nMuse final report:\n")
        print(final_text)
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
