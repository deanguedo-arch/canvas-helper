---
name: acceptance-pack
description: Run the full batch + acceptance verification for a round and book the completion record in one motion.
---

Use at the end of a port/reconcile round (e.g. R29–R32 copy) to close it out.

## Steps

1. Run, in order: batch suites for the round's lessons, content/bank suites, acceptance suite, export-static check.
2. Any failure restarts the loop: fix root cause, re-run only the failed/affected checks plus gates the fix invalidated.
3. When all green, write the round record: packet, COMPLETION.json, handoff entry (summary, files, verification, risks, source-of-truth, next action).
4. Report: counts (lessons, bank total, battery), suites green, record location.

## Rules

- Never describe a deferred check as passed. Build-mode deferrals go in the handoff as deferred, not green.
- The record is the round's proof — no record, no close.
