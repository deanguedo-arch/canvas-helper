# Shared SCORM Test Plan — Receipt/Codec Patch (Math 10C v0.5 context)

No tests executed for this planning task. Everything below is inspection of current
source. The future receipt/codec patch (exact save receipts + lossless state codec) is
absent from this worktree and must be reviewed separately; its recorded base still
matches per independent audit (`git apply --check` succeeds).

## 1. Current source inspected

- `scripts/lib/scorm.ts` — `normalizeScormVersion`, `getScormExportLabel`,
  `getScormZipLabel`, `findStorageKeysInScriptSources`, `injectScormBridgeTag`,
  `buildScormManifest`, `buildScormBridgeScript`. Runtime internals (inside the bridge
  closure): `persistStateToLms`, `persistToLms`, `save`, `saveAsync`, `saveAndExit`,
  `markCompleted`, `automaticControls` (`data-scorm-save-mode="automatic"`),
  `registerCourse`/`publishCourseState` (managed `course-state-v1` adapter),
  `collectStateFromLocalStorage`, `completionProgress`, `writeTracking`,
  `commitActionReports`. Budget constant: `maxSuspendChars` — 60000 for 2004, 3500 for
  1.2 (`buildScormBridgeScript`, line ~299); oversize guard in `persistStateToLms`
  (lines ~619–624) refuses the save, preserves the last LMS save, and warns — never
  truncates. Failure messages are user-visible "keep this tab open" strings.
- `scripts/lib/scorm-state-codec.ts` — `buildScormStateCodecRuntime`. Runtime:
  `PREFIX='CH10LZ1|'`, `LIMIT=1000000` (one-megabyte encode/decode limit), FNV-style
  `hash`, LZ-style `encode`/`decode` with integrity check; non-prefixed input passes
  through `decode` unchanged. Comment header: "Bounded lossless UTF-8 codec; compatible
  with the imported Chemistry save format."
- `scripts/lib/scorm-tracking.ts` — `resolveScormTracking`, `buildScormTrackingRuntime`,
  `ScormTrackingContract` (`schemaVersion: 1`, `adapter: "hash-pages-v1"`, `pageIds`,
  `defaultPageId`, optional `pageContainerId`/`state`/`actions`/`completion` with
  `storageKey`+`requiredIds`+`path`). `resolveScormTracking` fails closed on invalid
  contracts. `buildScormTrackingRuntime` shares the bridge session lifecycle.
- `scripts/lib/scorm-actions.ts` — `buildScormActionsRuntime` (ungraded SCORM 2004
  interaction analytics only; no learner writing copied).
- `scripts/lib/exports/scorm-package.ts` — `exportProjectToScormPackage`,
  `resolveTrackedScormStorageKeys`, `resolveScormPackageTitle`.
- Existing tests: `scripts/tests/scorm-state-codec.test.ts` (2 tests: Unicode roundtrip
  + corruption/oversize rejection), `scripts/tests/scorm-export.test.ts` (19 tests:
  version aliases, storage-key detection, manifest 2004/1.2, bridge API targeting,
  suspend + save-exit flow, `markCompleted` 2004/1.2, dynamic key tracking, iframe
  flush, oversized-save preservation), `scripts/tests/scorm-tracking.test.ts`
  (6 tests: exact required-list completion, unconnected-shell reporting, nested-path
  contract, invalid-contract failure, Social/ELA representative workspaces, real export
  with ZIP + workspace preservation), plus `codex-course.test.ts` and
  `new-course-readiness.test.ts` for the course contract.

Frozen measurement context (candidate-side, not repo constants): application guard
40,000 chars (NOT found in repo source — candidate policy, do not invent a repo owner
for it); repo envelope 60,000 chars (2004 `maxSuspendChars`); actual UI witness
19,211 application / 12,475 bridge envelope; decoder-admitted witnesses adversarial
metadata 211,276/215,194, ASCII 45,344/48,460, BMP 44,605/46,243, escaped 19,139/5,493,
repeated 14,121/4,565, supplementary 44,605/39,781. Protected until owner decision:
first attempts, current drafts, selected evidence, support flags, provenance, legacy
recovery. No text/history limit change authorized.

## 2. Smallest real test set — BEFORE the patch (baseline, must be green first)

1. `scripts/tests/scorm-state-codec.test.ts` — full file (roundtrip + rejection).
2. `scripts/tests/scorm-export.test.ts` — full file (all 19 tests; especially
   "SCORM 2004 reports an oversized save and preserves the last valid suspend_data",
   both `markCompleted` tests, both manifest tests, bridge API/flow tests).
3. `scripts/tests/scorm-tracking.test.ts` — full file (contract strictness + real-export
   preservation test).
4. `scripts/tests/codex-course.test.ts` + `scripts/tests/new-course-readiness.test.ts`
   — only if the patch touches manifest/editability-adjacent code; otherwise record as
   deferred with reason.

Rationale: the patch touches the save path shared by every SCORM course, so the whole
existing SCORM-focused set is the minimum baseline — not a sample of it.

## 3. Regression cases — AFTER the patch (all required)

Extend existing files where the behavior already lives; add ONE new focused file only
for receipt semantics that have no current home (see §4).

- Boolean save API compatibility: `save`, `saveAsync`, `saveAndExit`, `markCompleted`
  keep returning strict `boolean` (`true` only when committed) in both 2004 and 1.2
  harnesses. Extend the Fake-API harness in `scorm-export.test.ts` (it already returns
  `"true"` strings from fake `SetValue`/`Commit`; add assertions that bridge returns
  are real booleans, not LMS truthy strings).
- Exact receipt tuple: whatever the patch defines as the save receipt (e.g.
  persisted-suspend length/hash/commit outcome) must be asserted field-for-field,
  including a stable serialization. New focused file.
- Failed `SetValue`/`Commit`: fake API returning `"false"` on `cmi.suspend_data`
  write, on completion-status write, on exit write, and on `Commit` — each must yield
  `false`, preserve last-good LMS state, and surface the "keep this tab open" message.
  Extend `scorm-export.test.ts` near the oversized-save test.
- Reentrant/stale receipt: second `save()` with no intervening state change, and a
  save attempted after `Terminated`/`LMSFinish`, must not fabricate a fresh receipt;
  stale receipts must be detectable (exact assertion depends on patch shape — the test
  must fail if a post-terminate save reports success). New focused file.
- Unicode/raw/packed roundtrip: extend `scorm-state-codec.test.ts` with raw
  (non-prefixed passthrough), packed roundtrip over the frozen witness classes —
  adversarial metadata, ASCII, BMP, escaped, repeated, supplementary escapes — plus
  emoji/supplementary-plane content (existing test already covers `🧠` + `ΔH` + `é`;
  add the packed-form assertions at the witness sizes where feasible without
  multi-minute runtimes).
- Corruption/size rejection: extend `scorm-state-codec.test.ts` — bad header, bad hex,
  truncated token stream, hash mismatch, `expected > LIMIT` decode, `> LIMIT` encode —
  all throw with no partial output and no trimming (existing test covers the core;
  add truncated-token and non-UTF8-bytes cases).
- SCORM 1.2 and 2004 compatibility: every new save/receipt test runs against BOTH
  bridge versions (3500-char 1.2 budget vs 60000-char 2004 budget; `cmi.core.*` vs
  `cmi.*` keys; `markCompleted` lesson-status vs completion-status). Extend the
  version-parameterized harness in `scorm-export.test.ts`.
- Automatic-mode controls: `data-scorm-save-mode="automatic"` — control host hidden
  on success, shown (`display: flex`) on error; status event
  `canvas-helper:scorm-status` still dispatched in managed-state mode. Extend
  `scorm-export.test.ts` (existing `automaticControls` coverage is the anchor).
- Existing-course regression boundary: at least one test pinning a non-Math course —
  reuse the `scorm-tracking.test.ts` representative-workspace pattern
  (`social20-1-related-issue-1-option-2`, `ela10-2-writing-foundations`) or the
  Chemistry-format compatibility note in the codec header — proving the patch did not
  change another course's export bytes or tracking report. Extend `scorm-tracking.test.ts`.

## 4. Extend vs new

- Extend `scripts/tests/scorm-state-codec.test.ts`: Unicode/raw/packed roundtrip,
  corruption/size rejection additions.
- Extend `scripts/tests/scorm-export.test.ts`: boolean API, failed SetValue/Commit,
  1.2 + 2004 parity, automatic-mode controls.
- Extend `scripts/tests/scorm-tracking.test.ts`: existing-course regression boundary.
- NEW `scripts/tests/math10c-scorm-save-receipt.test.ts`: exact receipt tuple +
  reentrant/stale receipt — the only semantics with no current test home. Uses the
  existing `runScormBridgeHarness` Fake-API pattern (copied, not refactored out of the
  existing file — no drive-by refactor of the shared harness).

## 5. Explicitly not claimed

No tests were executed in this planning task. Repository/Studio/SCORM-package/
Brightspace/AT/teacher/learner acceptance has not run. This plan does not certify the
patch — it defines the gate the patch must pass before any Math 10C pilot export.
