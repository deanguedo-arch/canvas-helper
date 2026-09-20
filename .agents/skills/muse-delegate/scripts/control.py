#!/usr/bin/env python3
"""Enable, disable, or inspect Canvas Helper Muse delegation."""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
import subprocess


OFF_VALUES = {"0", "false", "no", "off", "disabled"}
STATE_FILENAME = "delegation-state.json"
AUTOMATIC_MODE = "automatic-usage-cooldown"
DEFAULT_USAGE_COOLDOWN_MINUTES = 300
USAGE_LIMIT_PATTERNS = (
    re.compile(r"\busage[_ -]?limit(?:ed| reached| exceeded)?\b", re.IGNORECASE),
    re.compile(r"\bquota[_ -]?(?:is )?(?:exhausted|exceeded)\b", re.IGNORECASE),
    re.compile(r"\binsufficient[_ -]?quota\b", re.IGNORECASE),
    re.compile(r"\bresource[_ -]?exhausted\b", re.IGNORECASE),
    re.compile(r"\bsubscription.{0,40}\blimit\b", re.IGNORECASE),
)


def read_state(runtime_root: Path) -> dict[str, object] | None:
    state_path = runtime_root / STATE_FILENAME
    if not state_path.is_file():
        return None
    return json.loads(state_path.read_text(encoding="utf-8"))


def delegation_state(runtime_root: Path) -> tuple[bool, str]:
    environment = os.environ.get("MUSE_DELEGATION", "").strip().lower()
    if environment in OFF_VALUES:
        return False, f"MUSE_DELEGATION={environment}"
    try:
        state = read_state(runtime_root)
    except (OSError, json.JSONDecodeError) as error:
        return False, f"invalid delegation state: {error}"
    if state is None:
        return True, "enabled"
    if state.get("mode") == AUTOMATIC_MODE:
        disabled_until_raw = str(state.get("disabledUntil") or "")
        try:
            disabled_until = datetime.fromisoformat(disabled_until_raw)
        except ValueError:
            return False, "invalid automatic usage cooldown"
        if disabled_until.tzinfo is None:
            disabled_until = disabled_until.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) >= disabled_until:
            return True, f"automatic usage cooldown expired at {disabled_until.isoformat()}"
        return False, f"Muse usage cooldown until {disabled_until.isoformat()}"
    if state.get("enabled") is False:
        return False, str(state.get("reason") or "disabled locally")
    return True, "enabled"


def detect_usage_limit(value: str) -> str | None:
    for pattern in USAGE_LIMIT_PATTERNS:
        match = pattern.search(value)
        if match:
            return match.group(0)
    return None


def usage_cooldown_minutes() -> int:
    raw = os.environ.get("MUSE_DELEGATION_COOLDOWN_MINUTES", "").strip()
    if not raw:
        return DEFAULT_USAGE_COOLDOWN_MINUTES
    try:
        value = int(raw)
    except ValueError:
        return DEFAULT_USAGE_COOLDOWN_MINUTES
    return min(24 * 60, max(5, value))


def disable_for_usage_limit(runtime_root: Path, evidence: str) -> str:
    runtime_root.mkdir(parents=True, exist_ok=True)
    changed_at = datetime.now(timezone.utc)
    disabled_until = changed_at.timestamp() + usage_cooldown_minutes() * 60
    disabled_until_iso = datetime.fromtimestamp(disabled_until, tz=timezone.utc).isoformat()
    (runtime_root / STATE_FILENAME).write_text(
        json.dumps(
            {
                "schemaVersion": 1,
                "enabled": False,
                "mode": AUTOMATIC_MODE,
                "reason": "confirmed Muse usage limit",
                "evidence": evidence[:240],
                "changedAt": changed_at.isoformat(),
                "disabledUntil": disabled_until_iso,
            },
            indent=2,
            sort_keys=True,
        )
        + "\n",
        encoding="utf-8",
    )
    return disabled_until_iso


def clear_expired_automatic_state(runtime_root: Path) -> None:
    try:
        state = read_state(runtime_root)
    except (OSError, json.JSONDecodeError):
        return
    if state and state.get("mode") == AUTOMATIC_MODE:
        enabled, _reason = delegation_state(runtime_root)
        if enabled:
            (runtime_root / STATE_FILENAME).unlink(missing_ok=True)


def resolve_runtime_root(workspace: Path, explicit: str | None) -> Path:
    if explicit:
        return Path(explicit).expanduser().resolve()
    repo_root = subprocess.run(
        ["git", "-C", str(workspace), "rev-parse", "--show-toplevel"],
        check=True,
        text=True,
        capture_output=True,
    ).stdout.strip()
    return Path(repo_root).resolve() / ".runtime" / "muse-delegate"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["status", "enable", "disable"])
    parser.add_argument("--workspace", default=".")
    parser.add_argument("--runtime-root", help=argparse.SUPPRESS)
    parser.add_argument("--reason", default="disabled by user request")
    args = parser.parse_args()

    workspace = Path(args.workspace).expanduser().resolve()
    try:
        runtime_root = resolve_runtime_root(workspace, args.runtime_root)
    except subprocess.CalledProcessError as error:
        parser.error(error.stderr.strip() or "workspace is not a Git repository")
    state_path = runtime_root / STATE_FILENAME

    if args.action == "disable":
        runtime_root.mkdir(parents=True, exist_ok=True)
        state_path.write_text(
            json.dumps(
                {
                    "schemaVersion": 1,
                    "enabled": False,
                    "mode": "manual",
                    "reason": args.reason,
                    "changedAt": datetime.now(timezone.utc).isoformat(),
                },
                indent=2,
                sort_keys=True,
            )
            + "\n",
            encoding="utf-8",
        )
    elif args.action == "enable":
        state_path.unlink(missing_ok=True)

    enabled, reason = delegation_state(runtime_root)
    print(f"Muse delegation: {'enabled' if enabled else 'disabled'}")
    print(f"Reason: {reason}")
    print(f"Local state: {state_path}")
    try:
        from usage import close_elapsed_window, print_summary, usage_summary

        print_summary(usage_summary(close_elapsed_window(runtime_root)))
    except (OSError, json.JSONDecodeError, ValueError) as error:
        print(f"Muse usage ledger: unavailable ({error})")
    if os.environ.get("MUSE_DELEGATION", "").strip().lower() in OFF_VALUES:
        print("Environment override: remove MUSE_DELEGATION=off to enable delegation.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
