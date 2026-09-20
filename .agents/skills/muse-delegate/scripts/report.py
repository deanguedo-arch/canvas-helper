#!/usr/bin/env python3
"""Report the current state of a retained Muse delegation worktree."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import subprocess

from launch import changed_paths, git, path_is_allowed


def resolve_run_dir(value: str, workspace: Path) -> Path:
    supplied = Path(value).expanduser()
    if supplied.is_file() and supplied.name == "manifest.json":
        return supplied.parent.resolve()
    if supplied.is_dir():
        return supplied.resolve()
    return (workspace / ".runtime" / "muse-delegate" / value).resolve()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("run")
    parser.add_argument("--workspace", default=".")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    workspace = Path(args.workspace).expanduser().resolve()
    run_dir = resolve_run_dir(args.run, workspace)
    manifest_path = run_dir / "manifest.json"
    if not manifest_path.is_file():
        parser.error(f"manifest not found: {manifest_path}")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    worktree = Path(manifest["worktree"])
    if not worktree.is_dir():
        parser.error(f"retained worktree not found: {worktree}")

    paths = changed_paths(worktree)
    allowed = manifest.get("allowedPaths") or []
    violations = [path for path in paths if not path_is_allowed(path, allowed)]
    head = git(worktree, "rev-parse", "HEAD").stdout.strip()
    diff_check = git(worktree, "diff", "--check", check=False)
    diff_stat = git(worktree, "diff", "--stat", "HEAD", check=False).stdout.strip()
    final_path = Path(str(manifest.get("finalText") or run_dir / "final.txt"))
    final_text = final_path.read_text(encoding="utf-8") if final_path.is_file() else ""
    report = {
        "runId": manifest.get("runId"),
        "recordedStatus": manifest.get("status"),
        "baseCommit": manifest.get("baseCommit"),
        "currentHead": head,
        "headMatchesBase": head == manifest.get("baseCommit"),
        "worktree": str(worktree),
        "allowedPaths": allowed,
        "changedPaths": paths,
        "scopeViolations": violations,
        "diffCheckOk": diff_check.returncode == 0,
        "diffCheckOutput": (diff_check.stdout + diff_check.stderr).strip(),
        "diffStat": diff_stat,
        "finalText": final_text,
        "usage": manifest.get("usage") or {},
    }
    if args.json:
        print(json.dumps(report, indent=2, sort_keys=True))
        return 0 if report["headMatchesBase"] and not violations and report["diffCheckOk"] else 1

    print(f"Run: {report['runId']}")
    print(f"Recorded status: {report['recordedStatus']}")
    print(f"Worktree: {worktree}")
    print(f"HEAD: {head} ({'matches base' if report['headMatchesBase'] else 'DRIFTED FROM BASE'})")
    print(f"Changed files: {len(paths)}")
    for path in paths:
        print(f"  {path}")
    print(f"Scope: {'VIOLATION' if violations else 'within allowlist'}")
    print(f"Diff check: {'pass' if report['diffCheckOk'] else 'FAIL'}")
    usage = report["usage"]
    if usage:
        print(
            "Muse usage: "
            f"{usage.get('providerCalls', 0)} provider calls, "
            f"{usage.get('inputTokens', 0)} input tokens "
            f"({usage.get('cachedInputTokens', 0)} cached), "
            f"{usage.get('outputTokens', 0)} output tokens"
        )
    if diff_stat:
        print("\nTracked diff summary:\n" + diff_stat)
    if final_text:
        print("\nMuse final report:\n" + final_text)
    return 0 if report["headMatchesBase"] and not violations and report["diffCheckOk"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
