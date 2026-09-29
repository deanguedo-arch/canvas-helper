# R04 record — save-capacity path measurement + repair (AB30-BUG-2026-09-155-A1)

- Contract requires distinguishing browser save, host save, and host
  field limits, and capacity probes ≥ the largest whole-course realistic
  payload. Profiled budgets implemented (`hostProfiles`); measured via
  vm-harness harness on the real storage path.

## Find/fix

- **Found:** byte budget targeted the *excess* profile: a functioning
  budget accidentally armed on the unlimited profile could never fire
  correctly, and a committed QA-limits role conflated char-budget
  responsibility. A universal 60KB char gate on the default profile would
  have destroyed whole-course saves.
- **Fixed:** character budgets are profiled with a non-digital default:
  `browser-local` (default) applies NO char budget — writes succeed unless
  the storage call itself fails; `scorm-2004` gates at 60k only when
  explicitly configured ([main.js](/Users/deanguedo/Documents/GitHub/canvas-helper/projects/aboriginal-studies-30/workspace/main.js) ~L6126).
- **Found (HOST ISSUE, lead-owned):** no host save bridge exists in this
  repo for the 3 AB30 storage keys — no runtime reference to any of them
  outside workspace + tests. Host serializer, wrapper, encoded size, and
  configured field limit are all UNKNOWN, so the host path could not be
  measured. Recorded in the lead handoff addendum with the needed decision
  (lead-measured host path or explicit browser-only release).
- **Not changed:** `storeCommitWithChecks` pure default; learner-facing
  no-dedup/no-truncation contract; submission lifecycle; R02 schema.
  Statuses and save receipts identify the browser save vs the separately
  tracked (unacknowledged) host save in `hostProfiles`.

## Evidence

- `R04-capacity-report.json` — real-path vm-harness measurement:
  - browser-local: whole-course-typical 868KB, 540KB history, 1MB growth
    probe — ZERO rejections, single-writer ordering verified.
  - scorm-2004: rejects after 26–40 ops as designed (36/50 receipts
    limited, singles accepted, growth writes denied at budget).
  - largest-realistic-payload probe: 1,024,000 chars accepted on the
    unlimited profile (budget untouched), denied on scorm-2004.
- Tests: 11/11 storev2 real-path suite (CAP01 browser no-budget, CAP02
  scorm-2004 gate with candidate+last-confirmed intact, CAP03 unknown
  profile fallback + status naming); 18/18 state inventory; full battery
  147/150 (same 3 lead-owned shell failures).
- Harness: `scripts/lib/as30-capacity-harness.js`; collection-only,
  learner-visible behavior unchanged.
- Status: browser-confirmed vs host-unacknowledged separated in
  `hostProfiles` on every receipt; gate receipts name the configured
  `profile`.
- Lead handoff: R04 addendum filed in R02-LEAD-HANDOFF.md with the HOST
  MEASUREMENT ISSUE + required lead decision.
- Doctor: PASS (`legacy-snapshot-v1` driver).

## Contract order note

- This R04 entry is ordered after R02 in the runbook's number sequence.
  R05+ should verify the R02 handoff review before building on v2 paths
  per the batch-gate rule.
