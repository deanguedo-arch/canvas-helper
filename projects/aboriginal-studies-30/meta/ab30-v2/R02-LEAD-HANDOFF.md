# R02 lead integration handoff — single-writer store + v2 migration (REVIEW PENDING)

Status: IMPLEMENTED + TESTED_LOCAL. Lead acceptance: NOT_REVIEWED. No production
integration is claimed. This patch changes the T04-approved persistence adapter;
do not treat any worker-written field as approval.

## Bounded patch (2 production files)

- `projects/aboriginal-studies-30/workspace/learning-store.js`
  - Envelope schema `ab30-store-v2`: + `practice:{runs,exposure,counter}`,
    + `migrationHistory[]`. Keys unchanged, no fourth key.
  - Pure `storeMigrateToV2(activityRaw,uiRaw,progressRaw)`: flat/v1/v2/corrupt
    handling, deterministic (byte-identical retry), practice merge by
    ID+payload identity (same-ID differences -> preserved conflict
    candidates), exposure union, counter max, single-char origin labelled
    `legacy-first-write-artefact`, history entries carry source digests
    (exact raws returned, not persisted, to avoid budget blowup).
  - `init` coordinator: phased activity-first commit (activity durable, then
    ui/progress projection); crash between phases replays idempotently.
  - Practice methods moved to the envelope domain; run IDs stay `run:N`
    (counter now envelope-owned, monotonic, nav-proof).
  - `saveNavigation(patch)` / `saveProgress(patch)`: read-modify-write over
    current stored values, unknown props preserved, `__rev` versioned,
    target-specific receipts. `noteExternalChange` + held patches
    (`pendingHeld`, exportable) for the cross-tab minimum. No lock claimed.
  - `storeImportSet` merges practice/history; `exportWork` + `exportAllWork` /
    `importAllWork` aliases include coordinator state.
- `projects/aboriginal-studies-30/workspace/main.js`
  - `saveJson` routes ui/progress writes through the store (nav/progress
    allowlists). One degraded-only direct write remains (store absent).
  - Activity fallback flat-writer REMOVED (queues to pendingWrites instead).
  - Evidence collector reads runs/exposure from the envelope (ui fallback
    for legacy packs). Storage-event forwarding added.

## Deliberate semantic changes needing lead eyes

1. Nav/progress saves now pass the 60k budget check (previously bypassed it
   via direct writes). Over-budget nav persists in memory and self-heals on
   the next successful save. R04 reworks the budget model itself.
2. `EVID05` device-local-runs assertions replaced: runs/exposure are durable
   envelope data and round-trip with attempts linked (spec S-03). Old T05
   "runs do not transfer" invariant is intentionally retired.
3. Degraded mode (store missing) no longer flat-writes activity; writes queue
   in memory with honest `store-missing` status.
4. `finishPracticeRun` rollback restores prior status (was: forced
   'in-progress').

## Tests (all first-hand, this branch)

- New `scripts/tests/aboriginal-studies-30-storev2.test.ts`: 8/8 (3 package
  fixtures incl. corrupt + idempotency + F1 regression + cross-tab hold).
  Fixtures: `scripts/tests/fixtures/ab30-parity/v2-*.json` (exact package bytes).
- Full battery: 137/140; the 3 red are the pre-existing stale shell
  assertions (casing, Work+Sans, body[] schema), untouched by R02.
- `course:doctor`: PASS. R01 F1 mechanism re-check: runs survive nav saves.

## Lead review checklist

- [ ] v2 envelope + migration rules (idempotency, conflict preservation)
- [ ] Single-writer routing + degraded-mode behavior
- [ ] Cross-tab minimum adequacy / lock-upgrade decision
- [ ] Budget-check-on-nav side effects (pending R04 rework)
- [ ] Integrate under Build/Rollout rules; record acceptance identity + date

## R03 addendum (same pending review — lifecycle ops on the v2 envelope)

- New store ops: `writeDraft` (versioned draft + stale-revision guard),
  `submitFirstResponse` / `submitRevision` (immutable, commandId-idempotent,
  parent-linked, evidence-kind computed from committed/session exposure),
  `recordExposure` (committed kinds + session-held fallback),
  `submissionsForTask`. Envelope += `submissions[]`, `taskExposure{}`.
- UI: explicit Save first response / comparison toggle / Save revision in
  `renderIndependentTask`; surgical in-place unlock (no rerender, focus to
  toggle); learner text via textContent; autosave debounced 800ms with
  flush on save/nav/visibility/pagehide/unload; failure keeps text locked
  with retry/export messaging. No auto-grade/mastery wording added.
- Evidence: submissions joined per record, rendered First/Revision with
  kind + version. Import merges submissions by ID, exposure unioned.
- `FORMATIVE-GATE`/`STATE07` updated to submission-gating (draft alone no
  longer unlocks); `EVID05` already v2. Battery 144/147 (3 known stale).

## R04 addendum — capacity: profiled budgets + HOST MEASUREMENT ISSUE (lead-owned)

- Character budget is now profiled: `browser-local` (default) has NO char
  gate — only real storage failures; `scorm-2004` keeps the 60k gate when
  explicitly configured. Pure `storeCommitWithChecks` default unchanged.
- Measured on the real path (R04-capacity-report.json): browser-local
  accepts every scenario (whole-course-typical 868KB, history 540KB,
  1MB growth probe) with ZERO rejections; scorm-2004 rejects after 26–40
  ops (the old universal gate would have destroyed the course).
- HOST ISSUE (cannot proceed without lead): no host save bridge exists in
  this repo for the 3 AB30 keys (verified: no runtime references outside
  workspace+tests). Host serializer, wrapper, encoded size, and configured
  limit are all UNKNOWN. Needed: lead-measured host path or an explicit
  browser-only release decision before any host-tracked claim.
- No dedup, no truncation, no learner-limit changes were needed or made.
  Statuses/receipts label browser vs host separately (host: unacknowledged).

## Review record (LEAD ONLY — worker must not fill)

- Reviewer / date: ____ / ____
- Decision: ____  Conditions: ____
