#!/usr/bin/env python3
"""Private, atomic admission state for participating Codex and Muse workers."""

from __future__ import annotations

import argparse
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
import fcntl
import json
import os
from pathlib import Path
import subprocess
from uuid import uuid4


def state_root(explicit: str | None = None) -> Path:
    return Path(explicit).expanduser().resolve() if explicit else Path.home() / ".local" / "state" / "canvas-helper" / "agent-router" / "default"


def now() -> datetime:
    return datetime.now(timezone.utc)


def read_state(root: Path) -> dict:
    file = root / "state.json"
    if not file.exists():
        return {"schemaVersion": 1, "mode": "auto", "active": None, "cooldown": None, "providerDisabled": None, "attempts": {}}
    value = json.loads(file.read_text(encoding="utf-8"))
    if value.get("schemaVersion") != 1 or value.get("mode") not in ("auto", "off"):
        raise ValueError("invalid shared admission state")
    return value


@contextmanager
def locked_state(root: Path):
    root.mkdir(parents=True, exist_ok=True, mode=0o700)
    os.chmod(root, 0o700)
    with (root / "control.lock").open("a+") as lock:
        fcntl.flock(lock.fileno(), fcntl.LOCK_EX)
        value = read_state(root)
        try:
            yield value
        finally:
            fcntl.flock(lock.fileno(), fcntl.LOCK_UN)


def write_state(root: Path, value: dict) -> None:
    temporary = root / f"state.{os.getpid()}.tmp"
    temporary.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    os.chmod(temporary, 0o600)
    temporary.replace(root / "state.json")


def status(root: Path) -> dict:
    with locked_state(root) as value:
        return dict(value)


def billing_verified(root: Path) -> bool:
    if os.environ.get("META_API_KEY", "").strip() or os.environ.get("MODEL_API_KEY", "").strip():
        return False
    try:
        proof = json.loads((root / "muse-billing-proof.json").read_text(encoding="utf-8"))
        observed = datetime.fromisoformat(proof["observedAt"])
        source = proof.get("source")
        if source == "user-confirmed-cli-subscription":
            version = subprocess.run(["muse", "--version"], capture_output=True, text=True, timeout=10, check=False)
            if version.returncode != 0 or proof.get("museVersion") != version.stdout.strip():
                return False
        return (
            proof.get("schemaVersion") == 1
            and source in ("supported-provider-account-status", "user-confirmed-cli-subscription")
            and proof.get("subscriptionActive") is True
            and proof.get("credentialSource") == "muse-code-login"
            and observed.tzinfo is not None
            and timedelta(0) <= now() - observed
            and (source == "user-confirmed-cli-subscription" or now() - observed < timedelta(hours=24))
        )
    except (OSError, ValueError, KeyError, json.JSONDecodeError, subprocess.TimeoutExpired):
        return False


def attest_muse_cli(root: Path) -> dict:
    if os.environ.get("META_API_KEY", "").strip() or os.environ.get("MODEL_API_KEY", "").strip():
        return {"recorded": False, "reason": "metered_environment_override"}
    version = subprocess.run(["muse", "--version"], capture_output=True, text=True, timeout=10, check=False)
    if version.returncode != 0:
        return {"recorded": False, "reason": "muse_binary_unavailable"}
    proof = {"schemaVersion": 1, "source": "user-confirmed-cli-subscription", "credentialSource": "muse-code-login", "subscriptionActive": True, "observedAt": now().isoformat(), "museVersion": version.stdout.strip(), "claim": "user-confirmed, not independently verified by installed CLI"}
    with locked_state(root):
        temporary = root / f"muse-billing-proof.{os.getpid()}.tmp"
        temporary.write_text(json.dumps(proof, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        os.chmod(temporary, 0o600)
        temporary.replace(root / "muse-billing-proof.json")
    return {"recorded": True, "source": proof["source"], "museVersion": proof["museVersion"], "validUntil": "CLI version changes or user revokes confirmation"}


def isolation_verified(root: Path) -> bool:
    try:
        proof = json.loads((root / "muse-isolation-proof.json").read_text(encoding="utf-8"))
        observed = datetime.fromisoformat(proof["observedAt"])
        version = subprocess.run(["muse", "--version"], capture_output=True, text=True, timeout=10, check=False)
        return (
            proof.get("schemaVersion") == 1
            and proof.get("source") == "live-disposable-boundary-check"
            and proof.get("profile") == "muse-file-tools-only-v1"
            and proof.get("externalReadAllowed") is True
            and proof.get("sparseSourceAbsent") is True
            and proof.get("writeOutsideDenied") is True
            and proof.get("descendantStopVerified") is True
            and version.returncode == 0
            and proof.get("museVersion") == version.stdout.strip()
            and observed.tzinfo is not None
            and timedelta(0) <= now() - observed < timedelta(days=30)
        )
    except (OSError, ValueError, KeyError, json.JSONDecodeError, subprocess.TimeoutExpired):
        return False


def set_mode(root: Path, mode: str) -> dict:
    if mode not in ("auto", "off"):
        raise ValueError("mode must be auto or off")
    with locked_state(root) as value:
        value["mode"] = mode
        if mode == "off" and value.get("active"):
            value["active"]["status"] = "quarantined_pending_stop"
        write_state(root, value)
        return dict(value)


def admit(root: Path, route: str, task_id: str, attempt_id: str) -> dict:
    if route not in ("luna", "muse"):
        raise ValueError("route must be luna or muse")
    with locked_state(root) as value:
        if value["mode"] == "off":
            return {"admitted": False, "reason": "routing_off"}
        if value.get("active"):
            return {"admitted": False, "reason": "worker_active_or_quarantined", "active": value["active"]}
        if route == "muse" and value.get("providerDisabled"):
            return {"admitted": False, "reason": "muse_disabled", "detail": value["providerDisabled"]}
        attempts = value.setdefault("attempts", {})
        prior = attempts.get(task_id, [])
        if attempt_id in prior:
            return {"admitted": False, "reason": "duplicate_attempt"}
        if len(prior) >= 2:
            return {"admitted": False, "reason": "correction_budget_exhausted"}
        cooldown = value.get("cooldown") if route == "muse" else None
        probe = False
        if cooldown:
            if now() < datetime.fromisoformat(cooldown["until"]):
                return {"admitted": False, "reason": "muse_cooldown", "until": cooldown["until"]}
            probe = True
        active = {
            "route": route,
            "taskId": task_id,
            "attemptId": attempt_id,
            "token": uuid4().hex,
            "ownerGeneration": uuid4().hex,
            "startedAt": now().isoformat(),
            "status": "running",
            "recoveryProbe": probe,
        }
        value["active"] = active
        attempts[task_id] = [*prior, attempt_id]
        if len(attempts) > 100:
            attempts.pop(next(iter(attempts)))
        write_state(root, value)
        return {"admitted": True, **active}


def release(root: Path, token: str, worker_stopped: bool, outcome: str) -> dict:
    if outcome not in ("success", "failure", "cancelled"):
        raise ValueError("invalid outcome")
    with locked_state(root) as value:
        active = value.get("active")
        if not active or active.get("token") != token:
            return {"released": False, "reason": "owner_token_mismatch"}
        if not worker_stopped:
            active["status"] = "quarantined"
            value["active"] = active
            write_state(root, value)
            return {"released": False, "reason": "worker_shutdown_unconfirmed", "active": active}
        if active.get("recoveryProbe"):
            if outcome == "success":
                value["cooldown"] = None
            else:
                value["providerDisabled"] = "recovery_trial_failed"
        value["active"] = None
        write_state(root, value)
        return {"released": True, "outcome": outcome}


def cooldown(root: Path, evidence: str, until: str | None = None) -> dict:
    proposed = datetime.fromisoformat(until) if until else now() + timedelta(hours=5, seconds=60)
    if proposed.tzinfo is None:
        raise ValueError("cooldown time must include timezone")
    with locked_state(root) as value:
        old = value.get("cooldown")
        if old and datetime.fromisoformat(old["until"]) > proposed:
            proposed = datetime.fromisoformat(old["until"])
        value["cooldown"] = {"until": proposed.isoformat(), "source": "provider" if until else "estimated-five-hours-plus-margin", "evidence": evidence[:240]}
        write_state(root, value)
        return dict(value["cooldown"])


def provider_state(root: Path, enabled: bool, reason: str) -> dict:
    with locked_state(root) as value:
        value["providerDisabled"] = None if enabled else reason[:160]
        write_state(root, value)
        return dict(value)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["status", "mode", "admit", "release", "cooldown", "provider-disable", "provider-enable", "attest-muse-cli"])
    parser.add_argument("--state-root")
    parser.add_argument("--mode", choices=["auto", "off"])
    parser.add_argument("--route", choices=["luna", "muse"])
    parser.add_argument("--task-id")
    parser.add_argument("--attempt-id")
    parser.add_argument("--token")
    parser.add_argument("--worker-stopped", choices=["true", "false"])
    parser.add_argument("--outcome", choices=["success", "failure", "cancelled"])
    parser.add_argument("--evidence")
    parser.add_argument("--until")
    parser.add_argument("--reason")
    args = parser.parse_args()
    root = state_root(args.state_root)
    if args.action == "status":
        result = status(root)
    elif args.action == "mode":
        result = set_mode(root, args.mode or "")
    elif args.action == "admit":
        result = admit(root, args.route or "", args.task_id or "", args.attempt_id or "")
    elif args.action == "release":
        result = release(root, args.token or "", args.worker_stopped == "true", args.outcome or "")
    elif args.action == "cooldown":
        result = cooldown(root, args.evidence or "subscription limit", args.until)
    elif args.action == "attest-muse-cli":
        result = attest_muse_cli(root)
    else:
        result = provider_state(root, args.action == "provider-enable", args.reason or "provider requires inspection")
    print(json.dumps(result, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
