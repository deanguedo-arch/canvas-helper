# Phase 1 CTS audit repairs — 2026-09-17

## Summary
Local review candidate repaired against the two user-pasted audits and supplied asset addendum. Keep the school theme, twelve-topic sequence, 72 original response identities, 28 required assignment fields, two extensions, 15 formative checks, ten written review questions, three guided lab cases and nine learner figures. Candidate remains blocked; Studio editing, course exports, packaging and deployment remain disabled. Learner printing/backup is available.

## Files changed / source of truth
- `workspace/index.html`: canonical teaching, required-work statements, course guide/recovery disclosure, curated resources, checkpoint q3 wording, capstone wording, figure descriptions and checkpoint/My Work links.
- `workspace/main.js`: navigation activation event; current checkpoint r2 and separate historical archive; backup validation; storage-failure reporting; explicit reuse of earlier cue/goal responses; print-window fallback.
- `workspace/phase1-preview.js`: refresh state after replacement and every owned activation; full collection/checklist; three-case untimed state; checkpoint reset/incomplete rejection; validated parent-owned game persistence.
- `workspace/styles.css`: drawer breakpoint 1023px, stacked media, nested figure margins, normal-size live figure explanations and phone header spacing.
- `workspace/assets/phase1/{arousal-continuum,goal-control,stress-process,regulation-toolkit,performance-state-map,attention-field}.svg`: self-contained canonical diagrams. Original map/attention raster assets remain reference-only; same-pressure/body-signals/model-comparison content retained.
- Game canonical `workspace/assets/game/original/phase1-performance-state-simulator-game.app.js` and theme CSS; generated bundle rebuilt through the declared esbuild command and utility CSS through Tailwind 3.4.17. Original chase, pointer, drift and ±15 actions retained. Added pause/resume/end/restart/mute, cause-specific neutral feedback, parent messages and phone introduction outside arena. Normalized opaque file-protocol message origins. Guarded negative first-frame delta and checked action bounds before drift. Legacy Sports Wellness game source unchanged.
- Project/checkpoint/interaction/resource/capacity metadata; focused tests under `scripts/tests/sportswellness-phase1-{preview.test.ts,audit.cjs}`.

## Content-change record
Checkpoint r2 changes q3 only relative to r1: bodily signals now explicitly accompany reported nervousness. Answer remains Somatic State Anxiety (index 0). Original/replacement wording and rationale are in `checkpoint-content-review.json`; the previous five r1 revisions remain recorded. Earlier version results are retained separately and never satisfy r2 readiness. Written review question 8 now asks about a familiar comfortable breathing routine; technical “manual override” language and actual-student-profile rubric wording are replaced while save IDs/categories remain stable.

PDF learner links and the legacy four-video picker are withheld. Files remain preserved, and `withheld-resources.json` retains the 13 removed resource placements and their original HTML. Twenty optional support placements remain indexed from canonical HTML. The supplied audits are retained under `projects/resources/sportswellness-phase-1/reference/cts-audit-2026-09-17/`. Comfort/unforced breathing wording was checked against current NHS guidance; the Alberta curriculum page returned 403, so no new credit-alignment claim is made.

## Verification actually run
- `node --check` for main.js and phase1-preview.js.
- `npx tsx --test --test-name-pattern='preserves its source inventory' scripts/tests/sportswellness-phase1-preview.test.ts`: passed, including immutable raw fingerprint, preserved inventory, asset existence and blocked boundaries.
- `node scripts/tests/sportswellness-phase1-audit.cjs`: passed. Actual Chromium against local HTTP files: ordinary sidebar navigation to populated My Work; final text saving; escaped user text; checkpoint restore/reset, incomplete rejection, best score and duplicate prevention; invalid import and confirmed replacement refresh; safe printable popup; native game pause/resume; tracking-only feedback; navigation/end-round records; upper/lower end causes isolated with a controlled cooldown clock; malformed child payload and wrong-source rejection; tablet drawer; denied storage Save and Exit; phone Start geometry and direct file-preview exit saving.
- Inspected rendered tablet course and phone game introduction/summary screenshots. Phone Start was visible in a 390×844 runtime viewport. These are desktop Chromium viewport/component checks, not physical-touch, accessibility or Brightspace certification.
- Rebuilt only the local game bundle and utility CSS. Initial unversioned Tailwind invocation failed to find an executable; pinned declared 3.4.17 command succeeded.

## Known risks / follow-up
Independent student release remains deferred. Reconcile the original PDFs before reinstating them; check retained external videos/captions/age restrictions/school filtering in the actual student environment. Pilot the required-work route, workload, new-scenario walkthrough and manual Brightspace submission with the teacher. Broad project E2E, Studio lifecycle/readiness, full accessibility/physical-device checks, SCORM packaging tests and Brightspace resume/export proof were not run. No shared SCORM API changes.

The 60,000-character bridge capacity remains below the original 360,000-character response maximum; three additional untimed explanations add up to 15,000 before snapshots, notes, game debrief and envelopes. See `state-budget-report.json`. Resolve this before rollout; do not silently truncate or advertise LMS saving.

## Fragile areas
Keep original field IDs, immutable review snapshots, checkpoint-version separation and exact iframe/origin validation. For opaque file origins, postMessage uses `*` as transport target and still validates the exact source window and `null` origin. A separate Chromium file-preview check passed route-exit saving after normalizing file-protocol message origins to `null`; the exact source window remains required. Do not hand-edit generated game bundles or restore the withheld picker/PDF links from old handoff notes. Twenty-resource curation supersedes the original 33-placement inventory.

## Next prompt assumptions / exact next action
Build mode remains in effect. Review this local candidate, then authorize one planned rollout validation batch when ready. Do not package, deploy or promote from the audit verdict alone. Existing Biology/Chemistry changes and unrelated dirty files are preserved.

## Exact next file to open
`projects/sportswellness-phase-1/workspace/index.html` (start with `#course-guide`, then `#process-collection`).

## Repeated workflow audit follow-up — 2026-09-17
The new pasted audit is byte-identical to the earlier workflow audit (SHA256 `6dfa4ad6dbf58ff7ab75e432922f0325c285f3285dd31437bae94b562717ba0b`). Its missing-assets, blank collection, radio-reset and old-picker findings describe the pre-repair source. `repeated-audit-reconciliation.json` maps prior fixes and remaining work; no regression was inferred solely from repeated text.

Added the remaining visible activity-jump recommendation to all twelve topics. Files changed: canonical `workspace/index.html`, `workspace/styles.css`, interaction contract and static preservation test expectations. Links sit beneath the closed completion guides and use existing target/save IDs and the existing navigation owner; no runtime/state rewrite. Inspected desktop and phone rendered areas and clicked representative field/lab links in Chromium directly from the local HTML; required work opened and field focus moved. Full E2E/Studio/SCORM/Brightspace checks remain deferred. Preserve the 28 required assignment fields; the suggested 10–12-response redesign was not mandated and needs a separate design decision.

The v1 ZIP remains unchanged and predates these shortcuts. Next action: review the current `workspace/index.html` starting at `#course-guide`; request a new audit ZIP or rollout batch when needed. Exact next file remains `projects/sportswellness-phase-1/workspace/index.html`.
