---
name: bank-reconcile
description: Diff and reconcile question banks across course lanes, preserving counts and catching drift.
---

Use when reconciling banks after a port round (e.g. bank 376 → 400) or when counts disagree between lanes.

## Steps

1. Dump both banks (canonical + copy): total counts, per-lesson counts, IDs.
2. Diff: every added/missing/changed item must map to an intended port decision. Unexplained drift is a defect, not noise.
3. Verify choice arrays, answer keys, and pins survived the port byte-identical unless the round explicitly changed them.
4. Run the bank/batch suites green, then record the reconciled count in the round record.

## Rules

- Count mismatches block the round — never book a record over a red or unexplained diff.
- New suites that catch defects (like the 16 copy-lane defects) get committed as siblings of the code they guard, not left in /tmp.
