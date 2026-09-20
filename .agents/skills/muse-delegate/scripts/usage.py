#!/usr/bin/env python3
"""Track Muse delegation usage across observed five-hour windows."""

from __future__ import annotations

import argparse
from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
from typing import Iterator


LEDGER_FILENAME = "usage-windows.json"
WINDOW_HOURS = 5
TOKEN_KEYS = ("input_tokens", "cached_tokens", "output_tokens", "reasoning_tokens")


def empty_usage() -> dict[str, int]:
    return {
        "providerCalls": 0,
        "inputTokens": 0,
        "cachedInputTokens": 0,
        "uncachedInputTokens": 0,
        "outputTokens": 0,
        "reasoningTokens": 0,
    }


def _usage_objects(value: object) -> Iterator[dict[str, object]]:
    if isinstance(value, dict):
        usage = value.get("usage")
        if isinstance(usage, dict) and "input_tokens" in usage and "output_tokens" in usage:
            yield usage
        for key, child in value.items():
            if key != "usage":
                yield from _usage_objects(child)
    elif isinstance(value, list):
        for child in value:
            yield from _usage_objects(child)


def accumulate_event_usage(totals: dict[str, int], event: object) -> int:
    found = 0
    seen: set[tuple[int, int, int, int]] = set()
    for usage in _usage_objects(event):
        values = tuple(int(usage.get(key) or 0) for key in TOKEN_KEYS)
        if values in seen:
            continue
        seen.add(values)
        input_tokens, cached_tokens, output_tokens, reasoning_tokens = values
        totals["providerCalls"] += 1
        totals["inputTokens"] += input_tokens
        totals["cachedInputTokens"] += cached_tokens
        totals["uncachedInputTokens"] += max(0, input_tokens - cached_tokens)
        totals["outputTokens"] += output_tokens
        totals["reasoningTokens"] += reasoning_tokens
        found += 1
    return found


def read_ledger(runtime_root: Path) -> dict[str, object]:
    path = runtime_root / LEDGER_FILENAME
    if not path.is_file():
        return {"schemaVersion": 1, "windowHours": WINDOW_HOURS, "activeWindow": None, "completedWindows": []}
    return json.loads(path.read_text(encoding="utf-8"))


def write_ledger(runtime_root: Path, ledger: dict[str, object]) -> None:
    runtime_root.mkdir(parents=True, exist_ok=True)
    path = runtime_root / LEDGER_FILENAME
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(ledger, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary.replace(path)


def parse_time(value: str) -> datetime:
    parsed = datetime.fromisoformat(value)
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def new_window(started_at: str) -> dict[str, object]:
    start = parse_time(started_at)
    return {
        "windowId": start.strftime("%Y%m%dT%H%M%SZ"),
        "startedAt": start.isoformat(),
        "expectedWindowEndAt": (start + timedelta(hours=WINDOW_HOURS)).isoformat(),
        "finishedAt": None,
        "endedReason": None,
        "quotaWallAt": None,
        "runs": [],
        "totals": {"delegatedPrompts": 0, **empty_usage()},
    }


def finish_window(ledger: dict[str, object], window: dict[str, object], finished_at: str, reason: str) -> None:
    window["finishedAt"] = finished_at
    window["endedReason"] = reason
    window["elapsedSeconds"] = max(
        0,
        int((parse_time(finished_at) - parse_time(str(window["startedAt"]))).total_seconds()),
    )
    completed = ledger.setdefault("completedWindows", [])
    assert isinstance(completed, list)
    completed.append(window)
    if len(completed) > 100:
        del completed[:-100]
    ledger["activeWindow"] = None


def close_elapsed_window(runtime_root: Path, at: datetime | None = None) -> dict[str, object]:
    ledger = read_ledger(runtime_root)
    active = ledger.get("activeWindow")
    now = at or datetime.now(timezone.utc)
    if isinstance(active, dict) and now >= parse_time(str(active["expectedWindowEndAt"])):
        finish_window(ledger, active, str(active["expectedWindowEndAt"]), "five_hour_window_elapsed")
        write_ledger(runtime_root, ledger)
    return ledger


def record_run_usage(
    runtime_root: Path,
    *,
    run_id: str,
    started_at: str,
    finished_at: str,
    status: str,
    usage: dict[str, int],
    source: str = "muse-delegate",
    replace_existing: bool = False,
) -> dict[str, object]:
    ledger = read_ledger(runtime_root)
    active = ledger.get("activeWindow")
    if isinstance(active, dict) and parse_time(started_at) >= parse_time(str(active["expectedWindowEndAt"])):
        finish_window(ledger, active, str(active["expectedWindowEndAt"]), "five_hour_window_elapsed")
        active = None
    if not isinstance(active, dict):
        active = new_window(started_at)
        ledger["activeWindow"] = active

    runs = active.setdefault("runs", [])
    assert isinstance(runs, list)
    existing_index = next(
        (index for index, item in enumerate(runs) if isinstance(item, dict) and item.get("runId") == run_id),
        None,
    )
    if existing_index is not None and not replace_existing:
        return ledger
    run = {
        "runId": run_id,
        "source": source,
        "startedAt": started_at,
        "finishedAt": finished_at,
        "status": status,
        "usage": usage,
    }
    totals = active.setdefault("totals", {"delegatedPrompts": 0, **empty_usage()})
    assert isinstance(totals, dict)
    if existing_index is None:
        runs.append(run)
        totals["delegatedPrompts"] = int(totals.get("delegatedPrompts") or 0) + 1
    else:
        previous = runs[existing_index]
        previous_usage = previous.get("usage") if isinstance(previous, dict) else {}
        if isinstance(previous_usage, dict):
            for key, value in previous_usage.items():
                totals[key] = int(totals.get(key) or 0) - int(value)
        runs[existing_index] = run
    for key, value in usage.items():
        totals[key] = int(totals.get(key) or 0) + int(value)

    if status == "usage_limited":
        active["quotaWallAt"] = finished_at
        finish_window(ledger, active, finished_at, "usage_limit")
    write_ledger(runtime_root, ledger)
    return ledger


def usage_summary(ledger: dict[str, object]) -> dict[str, object]:
    active = ledger.get("activeWindow") if isinstance(ledger.get("activeWindow"), dict) else None
    completed = ledger.get("completedWindows") if isinstance(ledger.get("completedWindows"), list) else []
    walls = [window for window in completed if isinstance(window, dict) and window.get("endedReason") == "usage_limit"]
    return {
        "windowHours": ledger.get("windowHours", WINDOW_HOURS),
        "activeWindow": active,
        "latestQuotaWall": walls[-1] if walls else None,
        "completedWindowCount": len(completed),
        "quotaWallCount": len(walls),
    }


def print_summary(summary: dict[str, object]) -> None:
    active = summary.get("activeWindow")
    wall = summary.get("latestQuotaWall")
    if isinstance(active, dict):
        totals = active.get("totals") or {}
        print(f"Muse observed window: active since {active.get('startedAt')}")
        print(f"Expected five-hour boundary: {active.get('expectedWindowEndAt')}")
        print(
            "Observed usage: "
            f"{totals.get('delegatedPrompts', 0)} delegated prompts, "
            f"{totals.get('providerCalls', 0)} provider calls, "
            f"{totals.get('inputTokens', 0)} input tokens "
            f"({totals.get('cachedInputTokens', 0)} cached), "
            f"{totals.get('outputTokens', 0)} output tokens"
        )
    else:
        print("Muse observed window: no active window")
    if isinstance(wall, dict):
        totals = wall.get("totals") or {}
        print(f"Latest Muse quota wall: {wall.get('quotaWallAt')}")
        elapsed_seconds = int(wall.get("elapsedSeconds") or 0)
        print(f"Observed time from first tracked prompt to wall: {elapsed_seconds // 3600}h {(elapsed_seconds % 3600) // 60}m")
        print(
            "Usage before wall: "
            f"{totals.get('delegatedPrompts', 0)} delegated prompts, "
            f"{totals.get('providerCalls', 0)} provider calls, "
            f"{totals.get('inputTokens', 0)} input tokens "
            f"({totals.get('cachedInputTokens', 0)} cached), "
            f"{totals.get('outputTokens', 0)} output tokens"
        )
    else:
        print("Latest Muse quota wall: none observed")


def usage_from_session_export(export_path: Path) -> tuple[dict[str, int], str, str]:
    payload = json.loads(export_path.read_text(encoding="utf-8"))
    totals = empty_usage()
    timestamps: list[int] = []
    for event in payload.get("events", []):
        if not isinstance(event, dict):
            continue
        accumulate_event_usage(totals, event)
        value = event.get("recorded_at") or (event.get("envelope") or {}).get("recorded_at")
        if isinstance(value, int):
            timestamps.append(value)
    if not timestamps:
        raise ValueError("session export contains no timestamps")
    started = datetime.fromtimestamp(min(timestamps) / 1_000_000, timezone.utc).isoformat()
    finished = datetime.fromtimestamp(max(timestamps) / 1_000_000, timezone.utc).isoformat()
    return totals, started, finished


def import_session_export(runtime_root: Path, export_path: Path, run_id: str) -> None:
    totals, started, finished = usage_from_session_export(export_path)
    record_run_usage(
        runtime_root,
        run_id=run_id,
        started_at=started,
        finished_at=finished,
        status="completed",
        usage=totals,
        source="muse-session-export",
        replace_existing=True,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["status", "import-export"])
    parser.add_argument("--runtime-root", default=".runtime/muse-delegate")
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--export")
    parser.add_argument("--run-id")
    args = parser.parse_args()
    runtime_root = Path(args.runtime_root).expanduser().resolve()
    if args.action == "import-export":
        if not args.export or not args.run_id:
            parser.error("import-export requires --export and --run-id")
        import_session_export(runtime_root, Path(args.export).expanduser().resolve(), args.run_id)
    summary = usage_summary(close_elapsed_window(runtime_root))
    if args.json:
        print(json.dumps(summary, indent=2, sort_keys=True))
    else:
        print_summary(summary)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
