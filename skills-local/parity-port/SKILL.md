---
name: parity-port
description: Port lessons from the canonical course lane to a copy lane with contract checks and no wholesale overwrites.
---

Use when porting a lesson batch (e.g. R-round copy lane) from canonical source to a parallel course copy.

## Steps

1. Read the canonical lesson source and the copy's existing lesson file. Reconcile forward: adopt canonical content, preserve copy-lane fixes.
2. Never overwrite the copy file wholesale. Port section by section; keep stable IDs, metadata keys, and export selectors intact.
3. Maintain the no-unverified-adoption rule: every adopted claim must trace to a verified source (textbook fixture, prior record). Stage prose beats, don't silently absorb them.
4. Run the batch test suite for the ported lessons plus the content suite. Fix root causes; a confident patch never run against the repo's tests is not done.
5. Book the round record (packet + COMPLETION.json) before moving on.

## Rules

- Bio/Chem lanes stay untouched unless explicitly tasked. No new marks, no workload changes, no publish.
- If a port breaks an existing copy-lane test, the test is the contract — fix the port, not the test.
