# ChatGPT audit packet — Canvas Studio and course editing

Prepared: August 13, 2026

Repository: [deanguedo-arch/canvas-helper](https://github.com/deanguedo-arch/canvas-helper)

Focused draft PR: [#1 — Harden Direct Editing and onboard the course catalog](https://github.com/deanguedo-arch/canvas-helper/pull/1)

Review base: [`codex/studio-roadmap-phases`](https://github.com/deanguedo-arch/canvas-helper/tree/codex/studio-roadmap-phases) at [`74b0c3ee`](https://github.com/deanguedo-arch/canvas-helper/commit/74b0c3ee7de150472c10f172a664ee658050f2ca)

Review head: [`codex/studio-direct-editing-v1`](https://github.com/deanguedo-arch/canvas-helper/tree/codex/studio-direct-editing-v1)

Implementation commits:

- [`ff4d60a1` — add safe Direct Editing](https://github.com/deanguedo-arch/canvas-helper/commit/ff4d60a12df8deee5d11fd69424b60fb994eeda4)
- [`1b221ee9` — harden editing and onboard the course catalog](https://github.com/deanguedo-arch/canvas-helper/commit/1b221ee9ad9594a7166572494448e1db32f6e0e1)

## August 13 independent follow-up and remediation

An independent review of PR head `45c6ab8b` returned **NO-GO / REQUEST CHANGES**. That verdict supersedes the earlier rollout language for the audited commit. The current review target is the latest head of [`codex/studio-direct-editing-v1`](https://github.com/deanguedo-arch/canvas-helper/tree/codex/studio-direct-editing-v1), not only the older pinned implementation links elsewhere in this packet.

The requested changes are implemented on the current branch:

| Independent finding | Current remediation and evidence entrypoint |
| --- | --- |
| Snapshot adapter omitted by shared validation | One exhaustive adapter predicate includes `legacy-snapshot`; storage plus HTTP/restart lifecycle coverage is in [`app/shared/course-editing.ts`](https://github.com/deanguedo-arch/canvas-helper/blob/codex/studio-direct-editing-v1/app/shared/course-editing.ts), [`course-edit-storage.test.ts`](https://github.com/deanguedo-arch/canvas-helper/blob/codex/studio-direct-editing-v1/scripts/tests/course-edit-storage.test.ts), and [`course-editing.test.ts`](https://github.com/deanguedo-arch/canvas-helper/blob/codex/studio-direct-editing-v1/scripts/tests/course-editing.test.ts). |
| Ownerless cross-process lock race | A complete fsynced owner file is published with an atomic no-replace claim; two independent Node processes race it in the focused test. See [`course-edit-transaction.ts`](https://github.com/deanguedo-arch/canvas-helper/blob/codex/studio-direct-editing-v1/app/server/lib/course-edit-transaction.ts). |
| Recovery overwrites post-crash external work | Recovery classifies exact-before, exact-after, known-partial, or unknown fingerprints. Unknown bytes are preserved under `manual-recovery`; an independent writer regression proves the boundary. |
| Identical repeated generated content can retarget | Repeated ambiguous identities are Annotation only and replay rejects them until the canonical builder supplies a durable `data-canvas-helper-edit-key`. See [`html.ts`](https://github.com/deanguedo-arch/canvas-helper/blob/codex/studio-direct-editing-v1/scripts/lib/course-editing/html.ts) and [`overrides.ts`](https://github.com/deanguedo-arch/canvas-helper/blob/codex/studio-direct-editing-v1/scripts/lib/course-editing/overrides.ts). |
| Cleanup can strand a journal | Durable `committed` and `rolled-back` states carry cleanup IDs; restart cleanup is idempotent even when backups are already absent. |
| Direct final compare-and-swap interval | Every direct source is reread immediately before atomic replacement. The remaining non-cooperating writer interval is explicitly unsupported: manual, Git, Codex, and standalone builder writes must not run concurrently unless they use the same lock protocol. |
| Image header checks and two-destination interruption | Uploads use bounded full Sharp decoding, full SHA-256 content names, retry-safe canonical/workspace publication, and learner-browser `complete`/natural-dimension checks. |
| Incomplete export input graph | Evidence schema V2 fingerprints target identity, workspace, normalized manifest, Studio title/edit metadata, package state, recursive local exporter dependencies, and artifact bytes. SCORM variants remain separate. |
| Unbounded JSON and multi-page snapshot source | Resolve, Rename, and Apply have explicit streaming byte ceilings; snapshot materialization loads and tests each declared page against its own source. |
| Acceptance bypasses the public route | The catalog verifier now uses actual HTTP handlers. Real Direct, English, Social, and snapshot pilots restart the HTTP server before route-level Undo. See [`http-route-harness.ts`](https://github.com/deanguedo-arch/canvas-helper/blob/codex/studio-direct-editing-v1/scripts/lib/course-editing/http-route-harness.ts). |
| Runtime/accessibility claims were too broad | Documentation now says bounded local settlement and edited-target heuristics, not proof of delayed interaction behavior or full WCAG acceptance. |
| No exact-head CI | [`studio-direct-editing.yml`](https://github.com/deanguedo-arch/canvas-helper/blob/codex/studio-direct-editing-v1/.github/workflows/studio-direct-editing.yml) runs on every PR revision and the branch, then uploads the source-locked release report plus pilot and catalog reports with the CI SHA. |

Current focused evidence from the remediation checkout:

- `npm run test:course-editing -- --test-reporter=dot` — 42/42 passed.
- `npm run verify:course-editing-pilots` — Direct, English, and Social passed together with HTTP restart and exact restoration; the added real snapshot pilot passed separately under the same lifecycle. The final gate reruns all four together.
- `npm run test:exports` — 55/55 SCORM, Google Hosted, and Apps Script tests passed before documentation-only follow-up.
- `npm run typecheck -- --pretty false` — the same ten established unrelated diagnostics remain; no diagnostic is in the remediation files.

The exact-head full catalog, Studio release gate, push, and GitHub Actions result must be recorded in the final handoff before this PR is reconsidered. The PR remains a draft and should not be merged merely because the implementation exists.

Focused comparison: [roadmap base → Direct Editing head](https://github.com/deanguedo-arch/canvas-helper/compare/codex/studio-roadmap-phases...codex/studio-direct-editing-v1)

Full stacked comparison: [`main` → Direct Editing head](https://github.com/deanguedo-arch/canvas-helper/compare/main...codex/studio-direct-editing-v1)

## Audit purpose

This packet gives an independent ChatGPT auditor the repository facts needed to decide whether Canvas Studio Direct Editing is genuinely safe, understandable, and maintainable across the current course catalog.

The audit should verify, rather than assume, that:

1. Studio shows teachers an honest visual boundary between editable source-owned content and annotation-only runtime content.
2. An applied edit survives the owning rebuild or snapshot materialization and remains visible after learner JavaScript runs.
3. Undo cannot overwrite newer Codex, builder, Studio, or manual work.
4. Separate Studio processes and interrupted multi-file batches cannot silently corrupt a course.
5. Legacy courses are preserved rather than regenerated through unsafe historical builders.
6. Net-new Codex and imported courses declare source ownership from creation instead of relying on inference.
7. Export freshness is tied to artifact bytes, not a generic status label.
8. The published catalog counts and exceptions match the actual repository.

Do not treat this document, test names, package scripts, or green static validation as proof by themselves. Inspect their implementations and reproduce the highest-risk checks.

## Scope and branch topology

PR #1 deliberately targets `codex/studio-roadmap-phases`, the branch from which Direct Editing was developed. That keeps the review to two implementation commits: 441 changed files, 26,046 additions, and 1,075 deletions at the time the implementation commit was pushed.

The earlier Studio roadmap is upstream context, not hidden work in this PR. It contains the course-first shell, Focus/Split review, Annotate, Review Sets, Full Preview continuity, stale-target recovery, preview recovery, accessibility/performance work, maintainability gates, and compact Codex verification loop. Read the [current-state roadmap audit](https://github.com/deanguedo-arch/canvas-helper/blob/codex/studio-roadmap-phases/docs/audits/2026-08-12-canvas-studio-current-state-and-next-step-audit.md) and [August 11 release note](https://github.com/deanguedo-arch/canvas-helper/blob/codex/studio-roadmap-phases/docs/releases/2026-08-11-canvas-studio.md) when auditing the complete product rather than only Direct Editing.

The full comparison to `main` includes 51 stacked commits and older English/course work inherited by the roadmap branch. Do not attribute every file in that full comparison to the August 12–13 Direct Editing change.

## What changed over the last few days

### August 11 — Studio roadmap completion

The upstream roadmap changed Studio from an engineering-oriented iframe shell into a course-first review workstation:

- searchable course selection and per-course continuity;
- Focus/Split and Original/Current comparison;
- desktop, tablet, mobile, and zoom review;
- element/area Annotation with course-only screenshots;
- bounded, persistent Review Sets and Full Preview continuity;
- source-aware Codex handoffs without exposing repository paths to teachers;
- stale-target relinking and preview failure recovery;
- keyboard, narrow-screen, accessibility, and performance contracts;
- a source-locked `test:studio-release` gate.

### August 12 — Direct Editing foundation and red-team hardening

The first Direct Editing commit added draft/apply/Undo support for explicitly supported course adapters. An independent audit then identified 23 concrete blind spots. The hardening work closed those findings inside the supported adapter boundary:

- Undo fingerprints the complete post-apply write boundary and fails closed after drift.
- A per-course filesystem lock coordinates separate Studio processes.
- Multi-file work uses atomic replacement, a durable phase journal, and recovery before the next mutation.
- Rebuild timeouts terminate the process group before course recovery begins.
- Every apply loads the finished learner page in isolated Chromium and asserts the requested rendered result.
- Render validation also checks visibility, image alt text, control names, heading text, and contrast.
- The preview shows a server-authored Edit map with supported actions and explicit Annotation-only reasons.
- Generated identity prefers durable keys and semantic signatures; unrelated page changes can rebase only an unchanged selected element.
- No-op drafts and no-op server changes are rejected; text-only edits do not inject styling.
- Drafts retain complete baselines, no longer expire after seven days, and support bounded JSON backup/restore.
- Rich text, selected-text links, visual comparisons, safe image upload, and dedicated course Rename replace raw HTML/URL editing.
- Rename synchronizes marked learner headings, browser title, project metadata, stored metadata, and declared runtime strings.
- Workspace and artifact bytes independently establish Brightspace, HTML, Google Hosted, Apps Script, SCORM 1.2, and SCORM 2004 freshness.
- Real Direct, English factory, and Social factory pilots survived applicable rebuild/reload and restored byte-for-byte with Undo.

The complete finding-by-finding record is [Studio Direct Editing rollout hardening](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/docs/audits/2026-08-12-studio-direct-editing-rollout-hardening.md).

### August 13 — explicit catalog onboarding and future-course path

The catalog was classified explicitly instead of making every legacy directory editable through inference:

| Outcome | Count | Meaning |
| --- | ---: | --- |
| Direct workspace | 28 | Studio writes declared canonical workspace files only. |
| English factory | 5 | Overrides replay through the staged English factory. |
| Social factory | 4 | Overrides replay through the checksum-backed Social factory. |
| Preserved legacy snapshot | 26 | Current workspace is protected; historical replacement builders are quarantined from Studio. |
| Blocked | 1 | `calm-module-4` retains an unresolved required lifecycle deviation. |
| Reference-only | 1 | `e2e-studio-secondary` remains test/reference material. |
| Package archive | 19 | No editable source was invented from package output. |

All 84 project directories now have an outcome. There are 65 explicit manifests and 63 active or ready source-backed projects with Studio editing enabled.

Other catalog work:

- Added transactional and idempotent `course:onboard`; any enabled-course doctor failure rolls back the manifest batch.
- Added `legacy-snapshot-v1`, which materializes course-only overrides into the current protected workspace without invoking the old builder.
- Added catalog-wide reversible learner-render acceptance.
- Removed obsolete picker filters hiding Social 30 issue courses.
- Built and onboarded Social 30 Option Two Issues 2–4 from the checksum-verified source.
- Made `course:create` produce a validated Direct course and signal an already-running Studio.
- Made imported projects declare Direct ownership at intake.
- Added explicit Git binary handling so PDF, Office, image, audio, video, and ZIP course assets are preserved byte-for-byte.

The full classification, runtime-only list, exceptions, and package archives are in [Course catalog Studio onboarding](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/docs/audits/2026-08-13-course-catalog-onboarding.md).

## What “every course” means now

Every source-backed active course is explicitly brought into the current Studio contract, but that does not mean every rendered DOM node is inline-editable.

- Forty-nine projects completed a reversible rendered text lifecycle.
- Twelve runtime-rendered projects correctly expose no safe source-owned text target. Their learner content routes to Annotation/Codex until ownership moves into canonical HTML or gains a dedicated adapter.
- Aboriginal Studies 30 and Sports Wellness have mappings, but sampled text edits were safely rejected because runtime replacement or existing contrast prevented the requested learner result.
- `calm-module-4` remains intentionally blocked.
- Nineteen package-only directories remain non-authorable until a canonical source is recovered or intentionally imported.

This distinction is central to the audit: visibility in the course picker is catalog coverage; an Edit outline is source-backed editability; Annotation-only is a supported and intentional outcome.

## Primary code to inspect

All links below are pinned to implementation commit `1b221ee9`.

### Mutation, recovery, and rendered truth

- [Apply, Rename, upload, and drift-safe Undo authority](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/app/server/lib/course-editing.ts)
- [Filesystem transaction and recovery boundary](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/app/server/lib/course-edit-transaction.ts)
- [Learner-render postconditions and accessibility checks](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/app/server/lib/course-edit-render-validation.ts)
- [Validated image asset workflow](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/app/server/lib/course-edit-image.ts)
- [Artifact-based export freshness](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/scripts/lib/course-editing/export-freshness.ts)

### Visual edit boundary and teacher workflow

- [Server-side inspection/edit map](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/app/server/lib/preview-inspection.ts)
- [Preview bridge runtime](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/app/server/preview-bridge-runtime.ts)
- [Teacher-facing edit panel](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/app/studio/src/components/CourseEditPanel.tsx)
- [Draft persistence, complete baselines, backup/restore](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/app/studio/src/lib/course-edit-storage.ts)
- [Browser-side course editing orchestration](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/app/studio/src/hooks/useCourseEditing.ts)

### Ownership, onboarding, and future courses

- [Authoring doctor and driver resolution](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/scripts/lib/course-authoring/context.ts)
- [Transactional catalog classifier](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/scripts/lib/course-onboarding.ts)
- [Catalog acceptance harness](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/scripts/verify-course-onboarding.ts)
- [Net-new Codex course creation](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/scripts/lib/codex-course.ts)
- [Import-time ownership](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/scripts/lib/importer.ts)
- [Codex-to-Studio course workflow](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/docs/workflows/codex-studio-course.md)

## Verification evidence

| Command | Recorded result |
| --- | --- |
| `npm run verify:course-onboarding -- --all` | 63/63 enabled projects passed; 49 full reversible learner-render cycles, 12 honest no-target outcomes, and two safe sampled rejections with exact restoration. |
| `npm run course:onboard -- --all` | Retain-only after apply: 28 Direct, 5 English, 4 Social, 26 snapshot, 1 blocked, 1 reference-only, 19 archives. |
| `npm run validate:manifests` | 65/65 manifests passed, including a fresh pre-commit run. |
| `npm run test:course-onboarding` | 2/2 passed, including idempotence and fail-closed unmanifested-source behavior. |
| `npm run test:course-editing -- --test-reporter=dot` | 28/28 passed. |
| `npm run test:authoring-context -- --test-reporter=dot` | 18/18 passed. |
| `npm run test:metadata-policy -- --test-reporter=dot` | 27/27 passed. |
| `npm run test:studio-inspection -- --test-reporter=dot` | 132/132 passed. |
| `npm run build:studio` | Passed again immediately before publication. |
| `npm run test:studio-release` | Source-locked pass: 132/132 focused contracts, build pass, 58/58 inspection E2E, smoke 1/1, strict project contract 1/1. |
| `git diff --cached --check` | Passed before the implementation commit. |

The final release report recorded `ok: true`, 524 fingerprinted source files, `sourceChangedDuringRun: false`, and source digest `d7f83382e2bb2019fedf76623ceeff7abaea87e689201457add0005c62b6646e`.

Repository-wide `npm run typecheck -- --pretty false` is not green. It exits 2 on established unrelated diagnostics in legacy ELA builders, a Forensics static builder, Social 20, and English factory render/resource code. No diagnostic was recorded in the new Direct Editing or onboarding files. The auditor should confirm this baseline distinction rather than reporting typecheck as fully passed.

## High-value adversarial checks

1. Apply a batch, change one checkpointed file outside Studio, and prove Undo refuses without changing any file.
2. Run two Studio server processes against one course and prove the filesystem lock serializes or rejects the second mutation.
3. Interrupt a multi-file batch at each journal phase and prove the next mutation restores a coherent boundary.
4. Target text that course JavaScript replaces after load and prove apply rolls back instead of accepting a static-file false positive.
5. Reorder repeated siblings and verify durable edit identity still resolves the intended target.
6. Change unrelated page content and verify only an unchanged selected-element digest can rebase.
7. Submit a true no-op and verify no checkpoint, style injection, file write, or export-stale transition occurs.
8. Rename Mental Health or another multi-surface course and verify sidebar, overview, runtime data, browser title, project metadata, rebuild, reload, and Undo.
9. Try malformed, oversized, dimension-bomb, and unsupported image uploads; verify no resource or course mutation survives.
10. Apply through one Direct, English, Social, and snapshot driver, then rebuild/materialize, reload, render, and Undo.
11. Inspect runtime-only courses in Edit mode and confirm unsupported regions visibly route to Annotation without authorizing a write.
12. Export SCORM 1.2 and SCORM 2004 separately and prove one artifact cannot make the other report fresh.
13. Run `course:create` while Studio is open and verify the new validated course appears without restarting.

## Known boundaries and unproven external acceptance

- Learner-render validation proves the local finished workspace, not Brightspace behavior after upload.
- Brightspace upload, deployed-host acceptance, and cross-browser SCORM save/restore remain per-export external checks.
- Snapshot onboarding preserves current canonical workspaces; it does not reconstruct missing historical factory inputs.
- Twelve runtime-only courses need canonical-content migration or a dedicated adapter before routine learner text becomes inline-editable.
- Aboriginal Studies 30 and Sports Wellness retain runtime/contrast debt.
- `calm-module-4` retains its explicit lifecycle deviation.
- Package archives can be valid releases while still lacking an authorable source.
- Running Codex or a builder after a Studio batch intentionally invalidates Undo.

## Local material intentionally excluded from GitHub

The publication did not broadly stage the dirty worktree. The following remain local and are not audit evidence for PR #1:

- duplicate/conflict copies whose names end in ` 2` or ` 3`;
- `docs/ops/ACTIVE_HANDOFF 6.md`;
- `projects/processed/**/source 2/**`;
- `test-results 2/**`;
- the untracked 1.3 GB `projects/resources/ela20-1-modern-play-crucible/_sources/**` media archive;
- generated `projects/**/exports/**` directories;
- leftover local factory transaction directories.

No raw import or generated export was added merely to make a project appear editable.

## Recommended reading order

1. This packet.
2. [PR #1 commits and files](https://github.com/deanguedo-arch/canvas-helper/pull/1/files).
3. [Studio current-state roadmap audit](https://github.com/deanguedo-arch/canvas-helper/blob/codex/studio-roadmap-phases/docs/audits/2026-08-12-canvas-studio-current-state-and-next-step-audit.md).
4. [Direct Editing finding closure](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/docs/audits/2026-08-12-studio-direct-editing-rollout-hardening.md).
5. [Catalog outcome and exceptions](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/docs/audits/2026-08-13-course-catalog-onboarding.md).
6. [Direct Editing release boundary](https://github.com/deanguedo-arch/canvas-helper/blob/1b221ee9ad9594a7166572494448e1db32f6e0e1/docs/releases/2026-08-12-canvas-studio-direct-editing.md).
7. [Current active handoff](https://github.com/deanguedo-arch/canvas-helper/blob/codex/studio-direct-editing-v1/docs/ops/ACTIVE_HANDOFF.md).
8. The primary code entrypoints listed above.

## Copy-ready prompt for ChatGPT

> Audit GitHub PR #1 in `deanguedo-arch/canvas-helper`, comparing `codex/studio-roadmap-phases` to `codex/studio-direct-editing-v1`. Start with `docs/audits/2026-08-13-chatgpt-studio-course-editing-audit-brief.md`, then verify every material claim against code, manifests, tests, and the PR diff. Do not accept documentation or package-script names as proof. Red-team source ownership, learner-render persistence, cross-process concurrency, interrupted transaction recovery, drift-safe Undo, runtime-overwrite detection, edit-map honesty, legacy snapshot safety, new-course onboarding, accessibility gates, image upload, Rename course, and artifact-based export freshness. Distinguish repository-proven behavior from Brightspace, deployed-host, and cross-browser acceptance that has not been run. Return: (1) overall verdict, (2) rollout blockers, (3) significant blind spots with exact GitHub file/line links, (4) claims confirmed with evidence, (5) claims overstated or unproved, (6) course classes sampled, (7) verification commands run and results, and (8) prioritized remediation order. Treat unrelated local-only files and the full stacked diff to `main` as outside this focused PR unless they materially invalidate a claim.
