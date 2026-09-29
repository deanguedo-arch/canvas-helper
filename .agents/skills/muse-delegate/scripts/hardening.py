#!/usr/bin/env python3
"""Safety helpers for supervised Muse delegation."""

from __future__ import annotations

import fcntl
import json
import os
from pathlib import Path
import signal
import socket
import subprocess
import time
from datetime import datetime, timezone


METERED_CREDENTIAL_ENVS = ("META_API_KEY", "MODEL_API_KEY")


def metered_credential_override() -> str | None:
    """Return the documented pay-as-you-go override when it is present."""
    return next((name for name in METERED_CREDENTIAL_ENVS if os.environ.get(name, "").strip()), None)


def process_identity(pid: int) -> str | None:
    result = subprocess.run(
        ["ps", "-o", "lstart=", "-p", str(pid)],
        text=True,
        capture_output=True,
        check=False,
    )
    value = result.stdout.strip()
    return value or None


class AdmissionLease:
    """One-machine lease that prevents concurrent Muse subscription use."""

    def __init__(self, state_root: Path, run_id: str):
        self.lock_path = state_root / "active-run.lock"
        self.run_id = run_id
        self.acquired = False
        self._handle: object | None = None

    def acquire(self) -> tuple[bool, str]:
        self.lock_path.parent.mkdir(parents=True, exist_ok=True)
        handle = self.lock_path.open("a+", encoding="utf-8")
        try:
            fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            handle.seek(0)
            try:
                owner = json.loads(handle.read() or "{}")
                label = f"run {owner.get('runId', 'unknown')} (pid {owner.get('pid', 'unknown')})"
            except json.JSONDecodeError:
                label = "an unknown active run"
            handle.close()
            return False, label
        owner = {
            "schemaVersion": 1,
            "runId": self.run_id,
            "pid": os.getpid(),
            "processIdentity": process_identity(os.getpid()) or "unknown",
            "host": socket.gethostname(),
            "acquiredAt": datetime.now(timezone.utc).isoformat(),
        }
        handle.seek(0)
        handle.truncate()
        handle.write(json.dumps(owner, indent=2, sort_keys=True) + "\n")
        handle.flush()
        self._handle = handle
        self.acquired = True
        return True, "acquired"

    def release(self) -> None:
        if not self.acquired:
            return
        handle = self._handle
        if handle is not None:
            fcntl.flock(handle.fileno(), fcntl.LOCK_UN)
            handle.close()
        self._handle = None
        self.acquired = False


def terminate_process_group(process: subprocess.Popen[object], grace_seconds: int = 10) -> bool:
    """Terminate a process group and confirm no process remains in it."""
    def group_alive() -> bool:
        try:
            os.killpg(process.pid, 0)
            return True
        except ProcessLookupError:
            return False
        except PermissionError:
            return process.poll() is None

    if process.poll() is not None and not group_alive():
        return True
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except ProcessLookupError:
        return True
    deadline = time.monotonic() + grace_seconds
    while group_alive() and time.monotonic() < deadline:
        time.sleep(0.05)
    if group_alive():
        try:
            os.killpg(process.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
    final_deadline = time.monotonic() + grace_seconds
    while group_alive() and time.monotonic() < final_deadline:
        time.sleep(0.05)
    try:
        process.wait(timeout=1)
    except subprocess.TimeoutExpired:
        pass
    return not group_alive()


def classify_failure(return_code: int, provider_error_text: str, *, timed_out: bool, cancelled: bool) -> str:
    normalized = provider_error_text.lower()
    if cancelled:
        return "USER_CANCELLED"
    if timed_out:
        return "WORKER_TIMEOUT"
    if return_code == 2:
        return "CLI_INVOCATION_ERROR"
    if any(
        marker in normalized
        for marker in (
            "usage limit",
            "usage_limit",
            "quota exhausted",
            "quota_exhausted",
            "quota exceeded",
            "insufficient quota",
            "subscription limit",
        )
    ):
        return "SUBSCRIPTION_EXHAUSTED"
    if any(marker in normalized for marker in ("http 401", "unauthorized", "authentication required", "login required")):
        return "AUTH_REQUIRED"
    if any(marker in normalized for marker in ("permission denied", "approval denied", "sandbox denied", "not permitted by sandbox")):
        return "PERMISSION_DENIED"
    if any(marker in normalized for marker in ("http 429", "rate limit", "rate_limit", "temporarily throttled")):
        return "TRANSIENT_THROTTLE"
    if return_code != 0:
        return "UNCLASSIFIED"
    return "NONE"
