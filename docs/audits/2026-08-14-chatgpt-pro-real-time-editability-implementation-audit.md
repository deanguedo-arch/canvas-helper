# ChatGPT Pro implementation audit — Studio live editing and measured editability

- Prepared: August 14, 2026
- Repository: [`deanguedo-arch/canvas-helper`](https://github.com/deanguedo-arch/canvas-helper)
- Pull request: [PR #1](https://github.com/deanguedo-arch/canvas-helper/pull/1)
- Accepted Direct Editing baseline: [`e71241433e173c7617dbf5ea5e5ddcc5bf712c11`](https://github.com/deanguedo-arch/canvas-helper/commit/e71241433e173c7617dbf5ea5e5ddcc5bf712c11)
- First plan-audit head: [`a5645d2ef8e40487b6afa7c9d4a95fadd8dc233a`](https://github.com/deanguedo-arch/canvas-helper/commit/a5645d2ef8e40487b6afa7c9d4a95fadd8dc233a)
- Implementation commit to audit: [`ef72243e1c7039bc8c7778a33dadf44c61947d60`](https://github.com/deanguedo-arch/canvas-helper/commit/ef72243e1c7039bc8c7778a33dadf44c61947d60)
- Implementation diff: [`a5645d2e…ef72243e`](https://github.com/deanguedo-arch/canvas-helper/compare/a5645d2ef8e40487b6afa7c9d4a95fadd8dc233a...ef72243e1c7039bc8c7778a33dadf44c61947d60)
- Census scheduler correction to audit: [`801330bee7f4ce17ebea37b828ef6791d8c37a54`](https://github.com/deanguedo-arch/canvas-helper/commit/801330bee7f4ce17ebea37b828ef6791d8c37a54)
- Scheduler-only diff: [`ef72243e…801330be`](https://github.com/deanguedo-arch/canvas-helper/compare/ef72243e1c7039bc8c7778a33dadf44c61947d60...801330bee7f4ce17ebea37b828ef6791d8c37a54)
- CI job-isolation correction to audit: [`f844f6beeee492257c7c3f148d0b852d76b2d562`](https://github.com/deanguedo-arch/canvas-helper/commit/f844f6beeee492257c7c3f148d0b852d76b2d562)
- Requested decision: independent implementation verdict; this document does not grade its own work

## Executive truth statement

The requested product is implemented locally through three checkpoints:

1. a read-only rendered editability census with adapter-owned learner-surface inventories and production Resolve parity;
2. immediate, non-mutating Studio and Full Preview overlays for supported draft changes;
3. a strengthened Codex-created course contract whose ordinary content passes a measured coverage threshold.

The inherited Direct Editing write boundary remains intact. Typing and Save do not write course files. Apply is still the only mutation path and still crosses target re-resolution, canonicalization, the per-course filesystem lock, complete checkpoint, durable transaction journal, owning rebuild or snapshot materialization, static and rendered validation, export-freshness invalidation, and drift-safe Undo.

This is not a claim that every visible element in every legacy course is editable. All 63 tracked source-backed projects are explicitly onboarded for the supported adapter workflow, but learner-surface inventory and element coverage remain separate evidence. The exact implementation-head inventory reports 57 of 65 manifests complete and names eight incomplete cases. An incomplete project receives no coverage percentage.

Teacher rollout, Brightspace/deployed-host behavior, cross-browser SCORM persistence, delayed interaction behavior, and full WCAG remain external acceptance. They must not be inferred from local Studio tests.

## Why this audit exists

The first real-time plan audit returned **REQUEST CHANGES**. It agreed with the product direction but found that the plan could still produce a dishonest percentage or an immediate-looking unsafe preview because these concepts were underspecified:

- every learner page, route, and required state;
- runtime-only content in the denominator;
- one non-overlapping candidate;
- read-only project and browser execution;
- DOM/runtime-state safety;
- preview/Apply canonicalization parity;
- zero-write image preview;
- message ordering and preview generations;
- stable reasons, truncation behavior, quantitative rollout, and the Studio reset matrix.

The normative response is [the Phase 0.5 contract](../plans/2026-08-14-studio-real-time-editability-phase-0-5-contracts.md). This audit asks whether commit `ef72243e` actually implements those contracts without weakening the independently accepted Direct Editing baseline, and whether the bounded scheduler correction at `801330be` changes any measurement or safety semantics.

## What is materially different now

### Before this implementation

- The visual map showed likely safe targets, but there was no element-level catalog census.
- A course-level result of 50 reversible pilots out of 63 enabled projects could not say how much content was editable.
- Draft controls did not show the actual learner-facing visual result while typing.
- Image selection used a persistence-oriented asset path rather than a true zero-write preview lifecycle.
- The fresh-course generator did not prove a ≥90% routine-content contract across block, text, category, and capability metrics.

### At `ef72243e`

- `npm run report:course-editability` exists and has a checked-in implementation and tests.
- Every supported adapter owns learner-surface inventory; missing or unprovable routes/states remain incomplete.
- Chromium enumerates rendered semantic candidates after learner JavaScript, so runtime-only content does not disappear.
- A candidate counts editable only after current source identity, rendered fingerprint, canonical owner, and the real read-only Resolve path agree.
- Coverage uses non-overlapping blocks plus a separate teacher-text code-unit ratio and separate capability opportunities.
- Studio shows green editable, purple synchronized Rename, and amber dashed Annotation-only boundaries before selection.
- Supported typing is normalized by the server and displayed in an inert overlay. It does not alter the learner subtree.
- Preview commands and acknowledgements carry a session and monotonic revision; stale or reordered messages fail closed.
- Save keeps the canonical patch and digest. Reopening navigates to the saved page, re-resolves current authority, and recreates the preview.
- Temporary image bytes are decoded, bounded, memory-only, and capability scoped until Apply.
- `course:create` generates standard editable headings, prose, lists, links, an image/caption, synchronized course-name surfaces, and an explicit Annotation-only runtime practice control.
- Exact Apply/rebuild/reload/restart/Undo pilots cover Direct, English factory, Social factory, and legacy snapshot adapters.

### At `801330be`

- The report loop honors the collector's existing maximum of two workers instead of opening all 730 declared surfaces serially.
- Each surface still receives its complete adapter declaration, uses its own fresh browser context, and retains the same per-surface timeout, memory, network, storage, Resolve, and residue rules.
- Results are written back by original surface index, preserving deterministic canonical order even when the second worker finishes first.
- The regression test proves the worker ceiling and result ordering. A real 30-surface course smoke completed with a clean residue proof.
- Preview, Apply, Undo, adapters, candidates, scoring, and course files are unchanged by this correction.

### At `f844f6be`

- The normal release gate and exhaustive census run as independent parallel jobs instead of competing for one 180-minute clock.
- The release job retains focused Direct Editing, census contracts, export contracts, full Studio E2E, all four real-adapter pilots, 63-course acceptance, and its existing evidence artifact.
- The standalone census retains the exact all-catalog command, LFS course assets, Chromium/OCR environment, fail-closed exit behavior, and report upload, with an independent 240-minute budget.
- The two artifacts have distinct names and must both come from the same exact head. No test, surface, candidate, or failure condition is removed.

## Disposition of every plan-audit P1

| Original finding | Implementation | Primary evidence to inspect |
| --- | --- | --- |
| No authoritative “every learner page” definition | Versioned `LearnerSurfaceInventory`; Direct/snapshot declarations; English/Social adapter inventories; incomplete error codes | [`course-editability.ts`](../../app/shared/course-editability.ts), [`inventory.ts`](../../scripts/lib/course-editability/inventory.ts), project manifests |
| Static page maps cannot see runtime-only content | Independent rendered Chromium semantic collector after bounded settlement | [`rendered.ts`](../../scripts/lib/course-editability/rendered.ts) |
| Candidate and 90% denominator were gameable | Non-overlapping primary block ownership; teacher-text code units; separate capability opportunities; per-kind floors | [`scoring.ts`](../../scripts/lib/course-editability/scoring.ts), [`codex-course.test.ts`](../../scripts/tests/codex-course.test.ts) |
| Read-only boundary could reach repair/materialization and persistent browser state | Mutation-prohibited project reader; fresh context per surface; deterministic environment; network/state instrumentation; repository before/after proof | [`read-only-project.ts`](../../scripts/lib/course-editability/read-only-project.ts), [`rendered.ts`](../../scripts/lib/course-editability/rendered.ts), [`report.ts`](../../scripts/lib/course-editability/report.ts) |
| DOM snapshot/restore could not preserve runtime identity | Preview is a separate inert overlay positioned above the target; the original subtree is not rewritten | [`preview-bridge-runtime.ts`](../../app/server/preview-bridge-runtime.ts), [`inspection.spec.ts`](../../e2e/specs/inspection.spec.ts) |
| Preview/Apply canonicalization was unspecified | Normalize Preview re-resolves and sanitizes; it returns canonical patch/digest; Apply repeats normalization and requires that digest | [`course-edit-preview.ts`](../../app/server/lib/course-edit-preview.ts), [`course-editing.ts`](../../app/server/lib/course-editing.ts) |
| Image preview had no zero-write architecture | Decoded bytes live only in bounded memory; scoped URL; Apply-owned transactional materialization; clear/failure expiry | [`course-edit-preview-assets.ts`](../../app/server/lib/course-edit-preview-assets.ts), [`course-editing.test.ts`](../../scripts/tests/course-editing.test.ts) |
| Bridge had no ordering/session model | Session, revision, project, page, map digest, node, patch digest; monotonic acceptance; clear closes generation | [`preview-bridge.ts`](../../app/shared/preview-bridge.ts), [`course-edit-preview.ts`](../../app/server/lib/course-edit-preview.ts) |

## Disposition of the plan-audit P2 improvements

- Stable, versioned reason codes are in `COURSE_EDITABILITY_REASON_CODES`.
- Truncation, no candidates, incomplete inventory, timeout, memory ceiling, undeclared runtime surface, browser-state write, and repository residue cannot publish a positive percentage.
- Candidate and capability evidence is aggregated without course text, HTML, URLs, asset bytes, local paths, source node IDs, or per-candidate fingerprints.
- Canonical JSON sorting and SHA-256 report digests are tested.
- Cross-surface duplicates collapse only by proven canonical ownership; repeated navigation cannot inflate the numerator.
- Native `<details>` is the current bounded non-route state, declared as `native-details-open`.
- The reset contract covers embedded/Full Preview, page/project/mode/layout/viewport changes, Cancel, Apply, rejection, drift, and disconnect.
- Screenshot and Review Set evidence actions are disabled while an unapplied overlay is visible.
- The rollout protocol requires at least five teachers and twenty sessions plus latency, completion, mismatch, rejection, confusion, false-map, and Codex-handoff metrics. Those sessions have not been fabricated.

## Source-of-truth map

### Measurement

- Schemas and reason registry: [`app/shared/course-editability.ts`](../../app/shared/course-editability.ts)
- Read-only project boundary: [`scripts/lib/course-editability/read-only-project.ts`](../../scripts/lib/course-editability/read-only-project.ts)
- Adapter inventories: [`scripts/lib/course-editability/inventory.ts`](../../scripts/lib/course-editability/inventory.ts)
- Rendered collector and Resolve reconciliation: [`scripts/lib/course-editability/rendered.ts`](../../scripts/lib/course-editability/rendered.ts)
- Deduplication and scoring: [`scripts/lib/course-editability/scoring.ts`](../../scripts/lib/course-editability/scoring.ts)
- Repository residue and report digest: [`scripts/lib/course-editability/report.ts`](../../scripts/lib/course-editability/report.ts)
- CLI: [`scripts/report-course-editability.ts`](../../scripts/report-course-editability.ts)
- Exact-head workflow/artifact: [`.github/workflows/studio-direct-editing.yml`](../../.github/workflows/studio-direct-editing.yml)

### Preview and Apply authority

- Patch/draft/pending-asset contracts: [`app/shared/course-editing.ts`](../../app/shared/course-editing.ts)
- Preview message contracts: [`app/shared/preview-bridge.ts`](../../app/shared/preview-bridge.ts)
- Preview session state: [`app/server/lib/course-edit-preview.ts`](../../app/server/lib/course-edit-preview.ts)
- Memory-only images: [`app/server/lib/course-edit-preview-assets.ts`](../../app/server/lib/course-edit-preview-assets.ts)
- Canonicalization, Apply, checkpoint, Undo: [`app/server/lib/course-editing.ts`](../../app/server/lib/course-editing.ts)
- Transaction/recovery: [`app/server/lib/course-edit-transaction.ts`](../../app/server/lib/course-edit-transaction.ts)
- Inert overlay and visual map: [`app/server/preview-bridge-runtime.ts`](../../app/server/preview-bridge-runtime.ts)
- HTTP routes: [`app/server/routes/course-edits.ts`](../../app/server/routes/course-edits.ts)

### Teacher workflow and new courses

- Main state machine: [`app/studio/src/hooks/useCourseEditing.ts`](../../app/studio/src/hooks/useCourseEditing.ts)
- Embedded/Full Preview bridge: [`app/studio/src/hooks/usePreviewScrollSync.ts`](../../app/studio/src/hooks/usePreviewScrollSync.ts)
- Editor and saved drafts: [`app/studio/src/components/CourseEditPanel.tsx`](../../app/studio/src/components/CourseEditPanel.tsx)
- Global reset/evidence rules: [`app/studio/src/App.tsx`](../../app/studio/src/App.tsx)
- Browser acceptance: [`e2e/specs/inspection.spec.ts`](../../e2e/specs/inspection.spec.ts)
- New-course generator: [`scripts/lib/codex-course.ts`](../../scripts/lib/codex-course.ts)
- New-course workflow: [`docs/workflows/codex-studio-course.md`](../workflows/codex-studio-course.md)
- Onboarding: [`scripts/lib/course-onboarding.ts`](../../scripts/lib/course-onboarding.ts)

## Catalog accounting

### Tracked GitHub catalog

The exact implementation commit contains 66 tracked project directories after excluding the shared `incoming`, `processed`, and `resources` roots:

- 65 project manifests;
- 63 explicitly enabled source-backed projects;
- one intentionally blocked project;
- one reference/test-only project;
- one tracked package-only archive.

The local working copy also contains 18 additional untracked package/archive directories, producing an 84-directory local onboarding report. Those user-owned local artifacts are not part of the GitHub commit and must not be confused with the tracked denominator.

The 63-course public-route acceptance passed again after implementation:

- 50 courses completed one safe rendered edit and exact restoration;
- 12 honestly returned `no-source-owned-text-target`;
- Aboriginal Studies 30 returned `no-learner-stable-text-target` after safely restoring its rejected runtime/contrast candidates.

That is adapter lifecycle evidence, not element coverage.

### Exact implementation-head learner inventory

Command: `npm run report:course-editability -- --all --inventory-only --allow-incomplete`

Result at `ef72243e`:

- 57 of 65 inventories complete;
- repository residue proof passed;
- five `snapshot-boundary-invalid`;
- two `driver-unsupported`;
- one `route-declaration-missing`.

The eight incomplete manifests are:

| Project | Inventory result |
| --- | --- |
| `aboriginal-studies-30` | `snapshot-boundary-invalid` |
| `calm-module-4` | `driver-unsupported` — intentionally disabled |
| `e2e-studio-secondary` | `driver-unsupported` — intentional fixture |
| `ela20-2-short-stories` | `snapshot-boundary-invalid` |
| `ela30-1-modern-drama` | `snapshot-boundary-invalid` |
| `ela30-1-shakespeare-othello` | `snapshot-boundary-invalid` |
| `ela30-2-short-stories-visual-literacy` | `snapshot-boundary-invalid` |
| `genpsy-studio` | `route-declaration-missing` |

These gaps are an explicit Phase 4 migration queue. They do not disable the already proven safe adapter workflow, but they prevent a complete element-coverage score.

### Rendered census and the concurrent-writer incident

A local all-catalog rendered run reached all 65 manifests and classified 34 projects as coverage-complete, but it exited nonzero and nulled aggregate block/text coverage. During that long run, an independent English/Social builder rewrote many course workspaces and created handoff files. The report named the changed project boundaries and `repository-git-state`; it did not publish a percentage.

That run is diagnostic only. Do not cite `34 / 65` as a product percentage or use its aggregate as release evidence. The exact-head GitHub workflow runs the same all-catalog command in an isolated checkout and uploads the canonical report; that artifact is the authority once complete.

A stable representative rerun after the storage/residue distinction was corrected passed:

- `e2e-fixture`: 13/21 primary blocks and 315/445 teacher-text code units;
- residue proof: pass.

Blocked browser storage writes invalidate their individual surface as `storage-write-attempt`. They are reported separately from persistent browser residue because every surface uses a fresh non-persistent context and the temporary browser profile is closed before the repository proof.

### Exact-head CI timeout and scheduler correction

Exact-head push run `31841579002` and PR run `31841583574` passed focused editing, census contracts, export contracts, and the complete Studio release gate. Both then hit the 180-minute job ceiling inside the rendered census:

- the push run reached project 55 of 65;
- the PR run reached project 57 of 65;
- the four real-adapter pilots and 63-course acceptance were skipped;
- artifact upload ran with only the already-complete Studio release report.

The logs show route-heavy projects consuming 5–49 minutes each while their surfaces were processed one at a time. Commit `801330be` corrects that implementation error by honoring the already-published `maximumWorkers: 2` limit. It does not loosen timeouts, skip surfaces, raise memory ceilings, change scoring, or publish incomplete percentages. The cancelled runs are retained as failure evidence; only a later green exact-head report artifact can serve as release evidence.

Corrected-head push run `31853405170` and PR run `31853410465` then both reached project 59 of 65 with bounded concurrency, but the monolithic job still expired before the remaining census surfaces and the downstream 27-minute pilot/catalog path could finish. Commit `f844f6be` resolves the composition error: the complete release gate and census now run in parallel with independent clocks and publish separate same-head artifacts. This is not a waiver or a timeout-only declaration of success; both jobs must finish green.

## Local verification at the implementation commit

| Command/evidence | Result |
| --- | --- |
| `npm run test:course-editability` | 17/17 passed, including bounded two-worker scheduling and canonical result order |
| `npm run test:studio-inspection` | 154/154 passed |
| `npm run verify:course-editing-pilots` | 4/4 adapters passed, byte-for-byte restored |
| `npm run verify:course-onboarding -- --all` | 63/63 enabled courses passed public-route acceptance |
| `npm run validate:manifests` | all 65 manifests passed |
| `npm run build:studio` | 85 modules built |
| `npm run test:studio-release` | 154 focused contracts, 58/58 inspection E2E, build, smoke, and strict project passed |
| Focused What’s New E2E | 2/2 passed after binding title/count assertions to the canonical release manifest |
| Representative rendered census | coverage complete; residue proof passed |
| 30-surface rendered concurrency smoke | `ela30-1-short-stories` complete; residue proof passed; 481/1,094 blocks and 29,591/59,035 text units |
| `git diff --check` | passed |
| `npm run typecheck -- --pretty false` | exited 2 with the same ten unrelated established builder/factory diagnostics; none is in implementation files |

The real adapter pilots are:

- Direct: `mental-health-wellness`;
- English factory: `ela20-1-short-stories-pilot`;
- Social factory: `social30-1-related-issue-1-option-2`;
- legacy snapshot: `ela10-2-writing-foundations`.

Each passed Apply, owning rebuild/materialization where applicable, learner-render verification, reload, HTTP server restart, Undo, and exact write-boundary restoration.

## Exact audit procedure

### 1. Confirm provenance

- `git fetch origin`
- `git show --stat --oneline ef72243e1c7039bc8c7778a33dadf44c61947d60`
- `git show --stat --oneline 801330bee7f4ce17ebea37b828ef6791d8c37a54`
- `git show --stat --oneline f844f6beeee492257c7c3f148d0b852d76b2d562`
- `git diff --check a5645d2ef8e40487b6afa7c9d4a95fadd8dc233a...ef72243e1c7039bc8c7778a33dadf44c61947d60`
- `git diff --check ef72243e1c7039bc8c7778a33dadf44c61947d60...801330bee7f4ce17ebea37b828ef6791d8c37a54`
- `gh pr view 1 --json url,state,isDraft,mergeable,headRefOid,baseRefName,statusCheckRollup`

Audit product behavior at `ef72243e`, then separately audit the report scheduler at `801330be` and CI job isolation at `f844f6be`. If PR #1 has a later head, verify that remaining descendants only publish audit/handoff material; they must not alter product or measurement behavior.

### 2. Inspect the safety-critical diff

Start with `git diff a5645d2e...ef72243e` limited to the measurement, preview, transaction, bridge, Studio hook/panel, and E2E files in the source-of-truth map above.

Trace these invariants through code rather than accepting test names:

1. coverage cannot enable Edit or authorize a target;
2. no inventory path reaches repair, import, builder, materialization, recovery, or asset publication;
3. runtime-created semantic content stays in the denominator;
4. an editable count requires actual current Resolve eligibility;
5. an incomplete, truncated, or unknown surface cannot emit a percentage;
6. the preview overlay never writes `innerHTML`, attributes, or styles on the learner target;
7. raw rich text, URLs, and images cannot bypass server normalization;
8. late, reordered, duplicated, or closed-session messages cannot repaint;
9. Save and reopen remain filesystem-read-only;
10. Apply revalidates the canonical digest and owns the first asset write;
11. failed Apply or expired images leave no residue and cannot partially publish;
12. Undo and crash recovery retain their accepted fail-closed behavior.

### 3. Run the focused gates

- `npm run test:course-editability`
- `npm run test:course-editing`
- `npm run test:studio-inspection`
- `npm run verify:course-editing-pilots`
- `npm run validate:manifests`
- `npm run build:studio`

### 4. Run catalog evidence without another writer

Ensure no builder, Studio Apply, Git mutation, manual editor, or other Codex task is writing the checkout.

- `npm run course:onboard -- --all`
- `npm run report:course-editability -- --all --inventory-only --allow-incomplete`
- `npm run report:course-editability -- --all --allow-incomplete`

Expected behavior is not “everything green.” Expected behavior is:

- retain-only onboarding for enabled tracked projects;
- explicit incomplete inventories where exhaustiveness is unproven;
- null aggregate coverage when any required project or surface is incomplete;
- nonzero residue failure if another writer changes any protected boundary;
- no course text or local absolute path in the report;
- identical exact-head inputs produce the same canonical evidence and digest when declared runtime outcomes are deterministic.

The all-rendered command is intentionally substantial because it opens every declared route/state and resolves every candidate. It may use at most the declared two isolated workers. Prefer the exact-head workflow artifact for independent evidence rather than weakening the collector.

### 5. Run the complete release gate

Run `npm run test:studio-release`, then inspect `.runtime/studio-release-report.json` and the exact-head GitHub Actions artifact. A local green run from a dirty working copy is supporting evidence, not a substitute for the clean exact-head workflow.

## Adversarial cases to inspect or add

- a static manifest that omits a real hash, query, tab, or module surface;
- source-backed and runtime-created identical text on one route;
- repeated mobile/desktop navigation mapped to one canonical owner;
- a page above the UI map's 4,000-entry ceiling;
- storage, IndexedDB, cache, cookie, service worker, worker, form, WebSocket, and external executable-network attempts;
- a source change between Normalize Preview and Apply;
- revisions 5, 6, then late 5; a late clear from a prior target; duplicated acknowledgements;
- a preview patch whose sanitized output differs from the raw browser patch;
- an image that passes headers but fails full decode, exceeds limits, expires, or is rebound to another project/page/target;
- Cancel, page/project switch, Original/Current, Focus/Split, viewport, zoom, Full Preview, reload, browser history, and disconnect while an overlay is visible;
- screenshot or Review Set action while an unapplied overlay is visible;
- two drafts in one Apply where the second is stale or its pending image expired;
- a non-participating builder changing the same project during census or Apply.

## Claims this audit must not accept without more evidence

- “Every visible part of every legacy course is editable.”
- “79% of legacy content is editable.” The 50/63 number is lifecycle success, not content coverage.
- “New courses are 95% editable.” The implemented contract proves a minimum threshold on the generated fixture; audit the exact report before stating a percentage for other templates.
- “The catalog has a publishable global element percentage.” It does not while required inventories or surfaces remain incomplete.
- “Local rendered validation proves Brightspace.” It does not.
- “Edited-target heuristics are a full WCAG audit.” They are not.
- “The filesystem lock prevents arbitrary external writers.” It coordinates participating Canvas Helper writers; the no-concurrent-external-writer contract remains.
- “Teacher acceptance is complete.” No synthetic test replaces the five-teacher/twenty-session rollout.

## Requested ChatGPT Pro output

Return one self-contained report with:

1. `VERDICT: GREEN / GO`, `GO WITH CONDITIONS`, `REQUEST CHANGES`, or `NO-GO`;
2. exact implementation SHA and PR head reviewed;
3. separate P0, P1, and P2 findings with file/line links;
4. explicit disposition for all eight original P1 findings and the P2 improvements;
5. whether the inherited Direct Editing GREEN baseline regressed;
6. whether the census denominator, read-only proof, and no-text report are honest;
7. whether preview is non-mutating by construction and has canonical Apply parity;
8. whether image preview is genuinely zero-write through Save and transactional at Apply;
9. whether the fresh-course threshold is measured and anti-gameable;
10. exact local and GitHub checks reviewed, including failures and retries;
11. a separate list of external acceptance still required;
12. a final merge recommendation for PR #1.

Severity meanings:

- **P0:** credible silent corruption, path/cross-project escape, write authorization from untrusted rendered state, unsafe Undo/recovery, script/CSS injection, or persistent learner-state mutation during preview.
- **P1:** dishonest coverage, incomplete denominator presented as complete, preview/Apply mismatch, stale retargeting, generated output treated as source, partial image publication, incomplete reset, or regression of the accepted transaction boundary.
- **P2:** maintainability, performance, upgrade nuisance, usability polish, additional diagnostics, or rollout improvements that do not invalidate safety or truth claims.

## Known limits and honest next work

- Migrate the eight explicit inventory gaps in small source-owned batches; do not improve the number by guessing states or enabling unsafe builders.
- Use the exact-head report reason histogram to prioritize ambiguous durable identity, runtime ownership, and unsupported structured components.
- Complete the five-teacher/twenty-session rollout with the predetermined task matrix and quantitative exit gates.
- Run separate Brightspace upload/launch/resume/score, deployed-host, cross-browser SCORM, and full accessibility acceptance.
- Do not merge PR #1 merely because this packet exists. Merge only after the independent verdict and exact-head checks support it; repository-owner authorization remains required.

## GitHub locations for the reviewer

- [PR #1](https://github.com/deanguedo-arch/canvas-helper/pull/1)
- [Implementation commit `ef72243e`](https://github.com/deanguedo-arch/canvas-helper/commit/ef72243e1c7039bc8c7778a33dadf44c61947d60)
- [Implementation comparison](https://github.com/deanguedo-arch/canvas-helper/compare/a5645d2ef8e40487b6afa7c9d4a95fadd8dc233a...ef72243e1c7039bc8c7778a33dadf44c61947d60)
- [Census scheduler correction `801330be`](https://github.com/deanguedo-arch/canvas-helper/commit/801330bee7f4ce17ebea37b828ef6791d8c37a54)
- [Scheduler-only comparison](https://github.com/deanguedo-arch/canvas-helper/compare/ef72243e1c7039bc8c7778a33dadf44c61947d60...801330bee7f4ce17ebea37b828ef6791d8c37a54)
- [CI job-isolation correction `f844f6be`](https://github.com/deanguedo-arch/canvas-helper/commit/f844f6beeee492257c7c3f148d0b852d76b2d562)
- [Accepted Direct Editing GREEN baseline](2026-08-13-studio-direct-editing-green-go-verdict.md)
- [Original audit protocol](2026-08-13-chatgpt-pro-real-time-editability-audit-plan.md)
- [Phase 0.5 contracts](../plans/2026-08-14-studio-real-time-editability-phase-0-5-contracts.md)
- [Current rollout plan](../plans/2026-08-13-studio-real-time-editability-and-rollout.md)
- [Active handoff](../ops/ACTIVE_HANDOFF.md)
