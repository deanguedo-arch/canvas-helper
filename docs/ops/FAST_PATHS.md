# Fast Paths

Use these retrieval shortcuts before broader discovery. The point is to keep agent work surgical.

## Export Target Work

Read first:
- `app/shared/studio-commands.ts`
- `scripts/lib/exporter.ts`
- `scripts/lib/exports/<target>.ts`
- `scripts/lib/<target-runtime>.ts` when the target injects a browser bridge such as `scorm.ts` or `google-hosted.ts`
- the matching CLI script under `scripts/export-*.ts`
- `docs/ops/apps-script-drive-deploy.md` when the target is `apps-script` or the issue is Google Sites / Drive-backed delivery

Touch docs only if behavior changes:
- `README.md`
- `ARCHITECTURE.md`

Verification floor:
- targeted export test
- `npm run typecheck`

## Studio Command Wiring

Read first:
- `app/shared/studio-commands.ts`
- `app/server/lib/command-runner.ts`
- `app/studio/src/hooks/useProjectCommands.ts`
- `app/studio/src/lib/types.ts`

Do not start by searching the whole repo. The shared command contract is the source of truth.

## Codex-Created Studio Course

This is an internal agent retrieval path, not a choice the teacher has to make. When the user asks Codex to make a course, route here automatically unless an explicit English/Social/import workflow owns the source.

Read first:
- `docs/workflows/codex-studio-course.md`
- `scripts/create-codex-course.ts`
- `scripts/lib/codex-course.ts`
- `app/shared/project-discovery.ts`
- `projects/<slug>/meta/prompt-pack.md` after creation

Start every net-new course authored from scratch in Codex with:

```bash
npm run course:create -- --slug <slug> --title "<title>" --course-code "<code>" --summary "<summary>"
```

Rules:
- Never overwrite or copy a legacy project as the starting point.
- Author the created canonical workspace HTML/CSS, not raw or exports.
- Keep routine teacher-editable content source-owned and visibly mapped; runtime-replaced content must remain Annotation only.
- Use an owning factory workflow instead for imported, English, or Social conversion work.
- Keep the versioned `studio-routine-content-v1` manifest contract. A new active course, a newly activated course, or a later change to a governed course is rejected unless the automatic exact-head readiness gate passes.
- Generic imports and unresolved legacy sources remain `blocked`; previewability alone must never make them active or Studio-editable.

Verification floor:
- `npm run test:codex-course`
- `npm run test:new-course-readiness`
- `npm run course:doctor -- --project <slug>`
- `npm run verify -- --project <slug> --mode workspace`
- `npm run verify:new-course-readiness -- --base <comparison-sha>` after the course change is committed; CI supplies the comparison SHA automatically and records rendered coverage plus apply/reload/Undo evidence
- `npm run test:e2e:project -- --project <slug>` when learner interactions exist

## Existing Course Catalog Onboarding

Read first:
- `docs/audits/2026-08-13-course-catalog-onboarding.md`
- `scripts/lib/course-onboarding.ts`
- `scripts/onboard-courses.ts`
- `scripts/verify-course-onboarding.ts`
- `scripts/lib/course-authoring/context.ts`

Commands:

```bash
npm run course:onboard -- --all
npm run course:onboard -- --all --apply --report .runtime/course-onboarding-report.json
npm run verify:course-onboarding -- --all
```

Rules:
- Audit before applying. Every directory must be Direct, English factory, Social factory, legacy snapshot, blocked, reference-only, or package archive.
- Never create editability by flag alone. The declared driver, canonical boundary, transaction write set, and learner-render postcondition must agree.
- Use `legacy-snapshot-v1` only when the current workspace is the recoverable baseline and the old replacement builder cannot safely be used. Preserve and document that builder; do not call it from Studio.
- Do not create manifests for package-only directories until a canonical source is recovered or intentionally imported.
- A successful apply must doctor every enabled project, notify a running Studio, and produce a retain-only next audit.

Verification floor:
- `npm run test:course-onboarding`
- retain-only `npm run course:onboard -- --all`
- `npm run verify:course-onboarding -- --all`
- `npm run test:authoring-context`
- `npm run test:studio-inspection`
- `npm run build:studio`

## Studio Direct Editing

Read first:
- `app/shared/course-editing.ts`
- `app/server/lib/course-editing.ts`
- `app/server/lib/course-edit-transaction.ts`
- `app/server/lib/course-edit-render-validation.ts`
- `app/server/lib/course-edit-image.ts`
- `app/server/lib/course-edit-preview.ts`
- `app/server/lib/course-edit-preview-assets.ts`
- `app/server/routes/course-edits.ts`
- `app/shared/course-editability.ts`
- `scripts/lib/course-editability/inventory.ts`
- `scripts/lib/course-editability/rendered.ts`
- `scripts/lib/course-editability/scoring.ts`
- `scripts/lib/course-editability/report.ts`
- `scripts/lib/course-editing/html.ts`
- `scripts/lib/course-editing/overrides.ts`
- `scripts/lib/course-editing/export-freshness.ts`
- `app/studio/src/hooks/useCourseEditing.ts`
- `app/studio/src/lib/course-edit-storage.ts`
- `app/studio/src/components/CourseEditPanel.tsx`
- `app/shared/preview-bridge.ts`
- `app/server/preview-bridge-runtime.ts`

Rules:
- Enable Edit only for a passing `course:doctor` project with a declared supported adapter and explicit `authoring.studioEditing.enabled`. Previewability and inferred ownership are not editability.
- Keep the page editability map server-authored, bounded, keyed by opaque inspection node IDs, and informational only. Compare source signatures with the rendered DOM before drawing editable outlines; a visual map must never authorize a write.
- In Edit mode, keep action labels, visible-area count, outline toggle, runtime-owned dashed state, proximity-limited container targeting, and the direct Annotate fallback consistent in embedded and Full Preview.
- Keep typing preview server-normalized and presentation-only. The inert overlay must not mutate the learner subtree; Save stores the canonical patch/digest and Apply remains the first repository write.
- Keep every preview command/ACK bound to one session, monotonic revision, project, page, source digest, node, and canonical patch digest. A closed generation cannot be repainted.
- Keep pending image bytes fully decoded, bounded, memory-only, and capability scoped. Apply owns transactional materialization; an expired pending asset fails the batch residue-free.
- Treat element coverage as read-only evidence, never edit authority. Use adapter-owned learner inventories, rendered semantic collection, and actual Resolve parity; incomplete/truncated/state-writing surfaces receive no percentage.
- The browser sends only an opaque target identity and approved patch. It never supplies, selects, or stores a filesystem path.
- Preflight every draft before writing. Rebase an unrelated page change only when the selected element digest is unchanged; identify a stale draft by item and fail the whole batch without writes. Direct pages must still be declared canonical editable files.
- Sanitize rich text and URLs and apply only curated style tokens. Arbitrary HTML/CSS/JavaScript remains a Codex workflow.
- Direct adapters edit canonical workspace files. English and Social adapters store course-only metadata overrides and rebuild; never patch their generated workspace output as source.
- Atomically claim the complete-owner filesystem lock, snapshot the whole transactional write boundary, durably journal each phase and terminal cleanup, terminate timed-out process groups, validate static and rendered learner results, restore only known before/after/partial states, and retain only the latest successful batch for Undo. Unknown external crash state must remain untouched for manual recovery.
- Undo must prove the entire boundary still matches the applied result. Newer manual, Codex, or builder work disables Undo; never force a restore over drift.
- Keep Draft Changes per course and shared across Studio and Full Preview. Full Preview is a bridge consumer, not a second persistent owner.
- Keep draft baselines complete, use delta-only patches, reject no-ops, never silently expire drafts, and preserve strict JSON backup/restore.
- Keep image uploads content-addressed in the canonical project resource library and materialized through owning rebuilds. Keep Rename as one marked, checkpointed multi-surface operation.
- Reject ambiguous identical repeated content unless the canonical source supplies a durable edit key.
- Derive freshness from the target-specific manifest/metadata/workspace/exporter graph and artifact fingerprints recorded by exporters. Keep SCORM 1.2 and 2004 independent.
- Treat the lock as cooperative: do not run non-participating manual, Git, Codex, or builder writes concurrently with Direct Apply.
- Do not run any repository writer during `report:course-editability`; concurrent changes must fail its residue proof and make the aggregate non-publishable.

Verification floor:
- `npm run test:course-editing`
- `npm run test:course-editability`
- `npm run test:studio-inspection`
- `npm run verify:course-editing-pilots`
- `npm run test:exports` when artifact evidence changes
- `npm run test:e2e -- e2e/specs/inspection.spec.ts --grep "direct edits persist"`
- `npm run build:studio`
- `npm run report:course-editability -- --all --inventory-only --allow-incomplete`

## Studio Inspect + Codex Handoff

Read first:
- `app/shared/preview-bridge.ts`
- `app/shared/preview-health.ts`
- `app/shared/preview-path.ts`
- `app/shared/inspection.ts`
- `app/server/preview-server.ts`
- `app/server/lib/preview-runtime-relay.ts`
- `app/server/lib/preview-preflight.ts`
- `app/server/lib/preview-inspection.ts`
- `app/server/routes/inspection.ts`
- `app/server/lib/preview-capture.ts`
- `app/server/routes/preview-capture.ts`
- `app/server/routes/preview-preflight.ts`
- `app/server/lib/review-screenshots.ts`
- `app/server/routes/review-screenshots.ts`
- `app/studio/src/hooks/usePreviewScrollSync.ts`
- `app/studio/src/hooks/usePreviewRecovery.ts`
- `app/studio/src/hooks/useScreenshotAnnotation.ts`
- `app/studio/src/lib/review-set-storage.ts`
- `app/studio/src/components/InspectionPanel.tsx`
- `app/studio/src/components/ReviewSetPanel.tsx`

Rules:
- Keep preview on the isolated loopback origin with one scope-bound capability per project/root. A workspace capability may read only same-project `raw`/`extracted` references; raw/reference capabilities cannot enter a workspace and no capability can cross projects. Every preview resource request must validate that capability; never restore unscoped `/preview/**` access, iframe DOM reads, wildcard messaging, or a same-origin course shortcut.
- Preflight every selected HTML page through the exact isolated-preview origin before mounting it. Keep the response teacher-safe and bounded: missing page/runtime/style, unsupported runtime, empty source, or ready. After mount, require the private bridge's bounded `preview-health` report so a successful document load cannot hide an empty runtime. Keep Retry, page choice, and the preview-issue handoff in Studio; technical details stay collapsed by default.
- Preserve live course fidelity: allow presentation-only HTTPS styles, fonts, images, media, and frames in the isolated preview CSP. Keep arbitrary external scripts, form submissions, and nonlocal browser data connections blocked. Legacy script/module compatibility belongs only in the capability-scoped runtime relay: use exact versioned library/path/query allowlists, per-capability declared/transitive source binding, JavaScript-only MIME handling, no credentials, revalidated bounded redirects, pinned known unversioned runtimes, bounded concurrency/response/timeout/cache/parser limits, syntax-aware rewriting, and regression tests. Local/reference `HEAD` must exit before reads or transformation, relay `HEAD` must remain cache-only, local scripts over 512 KiB must remain untouched, and approved ESM over 2 MiB must be rejected. Never loosen `script-src` to `https:` or turn the relay into a general proxy.
- A preview selection is evidence, not source authority. Resolve canonical targets only through the project driver and fail closed as `unknown` when it cannot be proved.
- Generated Social and English workspaces remain output; Review Set packets point to their builder/factory source and rebuild flow, while eligible Edit-mode changes are stored as course-only metadata overrides consumed by that builder.
- Keep source routes, file paths, commands, packet text, and preview diagnostics out of the normal annotation UI. They remain resolver-owned data inside the copied Review Set packet.
- Review Set preparation is automatic after each save or note edit. Copy must stay disabled until every saved route has been revalidated against current repository state.
- A standalone workspace preview must preserve the original Studio session and expose Annotate, the shared Review Set, and the trusted return control only in the Studio-origin host, never inside the cross-origin course iframe. Keep one-time bootstrap, bounded reload rejoin, and focus-acknowledgement flows. Do not replace them with wildcard messaging, iframe DOM reads, URL-carried selection text, course-owned opener access, or preview-owned persistent storage.
- The strict versioned Studio-local Review Set may persist for seven days. Rehydrate only validated source requests and owner-bound `.runtime/studio-review-sets/` paths, restore the saved course scope, fail visibly without throwing when storage is denied, and clear on an approved course switch. Never trust arbitrary local-storage fields as source authority.
- Keep Studio quality budgets and local cache ceilings in `app/shared/studio-quality.ts`. Treat the normal response budget as an experience regression signal, not the hard recovery deadline. Preserve keyboard entry into mapped noninteractive course content, focus return after save/remove/exit, reduced-motion behavior, and the fixed narrow-screen annotation rail.
- Screenshot capture must remain deterministic and course-only. Keep `Permissions-Policy: display-capture=()` and never reintroduce `getDisplayMedia`. Validate the exact capability-scoped workspace path plus query/hash identity, invalidate active selections on course navigation, use fresh selected-element geometry, block outside HTTP, WebSocket, WebRTC, service-worker, and dedicated/shared-worker traffic, and verify those guards in the main document plus every runnable local, `about:`, `data:`, or `blob:` child frame. Skip only empty, uncommitted, or browser-generated blocked-error frames so remote-iframe-heavy courses cannot stall capture. Serialize capture with a hard cancellation deadline, and allow no more than three marked PNGs per item and fifteen per active session. Bind display, verify, and delete to the exact session/project/annotation/node owner; retain the global cache ceiling and copy only safe repo-relative paths—never pixels, base64, blob URLs, or absolute paths.
- Keep live-preview health separate from secure-capture fidelity. A blocked remote image, media frame, worker, or network request in the headless course-only capture is an intentional capture fallback, not proof that the learner-facing preview is defective. Only embedded/standalone live-preview bridge diagnostics may change the page recovery state.

Verification floor:
- `npm run test:studio-inspection`
- `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts`
- `npm run build:studio`

For a release candidate, replace the separate commands above with `npm run test:studio-release`. Its owned-port runner is the authoritative complete gate; inspect `.runtime/studio-release-report.json` for branch, commit, dirty-tree status, exact source fingerprint, versions, timing, counts, and the first failure. A source change during the run fails the gate.

Phase H ownership shortcuts:
- inspection draft lifecycle and cancellation: `app/studio/src/hooks/useInspectionDraft.ts` and `app/studio/src/lib/inspection-draft.ts`
- Review Workbench facade: `app/studio/src/lib/review-workbench.ts`
- all cross-boundary limits: `app/shared/studio-quality.ts`
- current release content: `app/studio/src/lib/studio-release-notes.ts`
- release orchestration: `scripts/run-studio-release.ts`, `scripts/lib/studio-release.ts`, and `e2e/playwright.release.config.ts`

## E2E Platform Work

Read first:
- `e2e/playwright.config.ts`
- `e2e/specs/core-project-contract.spec.ts`
- `e2e/lib/load-project-contract.ts`
- `e2e/lib/project-open.ts`
- `projects/<slug>/meta/e2e-contract.json`

Touch docs when behavior or policy changes:
- `ARCHITECTURE.md`
- `CONTRIBUTING.md`
- `AGENTS.md`

Verification floor:
- `npm run test:e2e:smoke`
- `npm run test:e2e:project -- --project <slug>` (when project contract changes)
- `npm run test:e2e:harness` (when contract validation or deep checks change)
- `npm run typecheck`

## Intelligence Policy Work

Read first:
- `scripts/lib/intelligence/config/policy.ts`
- `scripts/lib/intelligence/config/defaults.ts`
- `config/intelligence.json`

Then only open collect/apply modules that are directly affected.

## Compact Course Authoring Context

Read first:
- `scripts/lib/course-authoring/context.ts`
- `projects/<slug>/meta/project.json`
- `scripts/lib/english-unit/workspace-staging.ts` when the project uses `build:english-unit`
- `scripts/lib/social-resource-manifest.ts` and `scripts/lib/social-build-staging.ts` when the project uses `build:social30`

Use:
- `npm run course:list -- --all` to distinguish actual readiness from a project lifecycle label; do not treat `active` as permission to edit or rebuild.
- `npm run course:doctor -- --project <slug>` before building a compact course brief
- `npm run context:project -- --project <slug>` only after the doctor passes
- Treat Annotate as a local inspection and handoff surface. Edit mode may change a course only through its declared direct source or supported owning rebuild adapter.

Verification floor:
- `npm run test:authoring-context`
- `npm run test:metadata-policy`

## Import / Refs Work

Read first:
- `scripts/lib/importer.ts`
- `scripts/lib/references.ts`
- `scripts/lib/paths.ts`
- relevant tests in `scripts/tests/`

## English Course Factory

Read first:
- `docs/workflows/english-course-factory.md`
- `config/english/families/<course>.json`
- `projects/<slug>/meta/prompt-pack.md`
- `projects/<slug>/meta/english-unit.json`
- `scripts/lib/english-unit/factory-build.ts`
- the selected profile in `scripts/lib/english-unit/ela20-activity-profiles.ts`

Do not start from an old unit-specific builder. Rebuild through `npm run build:english-unit -- --project <slug>` and put bespoke sources only under preserved component/custom paths.

Verification floor:
- `npm run test:english-course`
- `npm run test:english-transaction`
- `npm run verify:english-course -- --course <course>`
- `npm run test:e2e:project -- --project <slug>`
- `npm run test:scorm`

## Social 30 Related-Issues Rebuild

Read first:
- `docs/workflows/social-related-issues.md`
- `projects/<slug>/meta/project.json`
- `projects/resources/social30-1-related-issues/resource-manifest.json`
- `scripts/lib/social-resource-manifest.ts`
- `scripts/lib/social-build-staging.ts`
- `scripts/build-social30-related-issues.ts`

Do not start from a personal Downloads path or manually alter `workspace/index.html`. Select a declared source by ID, check the project first, then rebuild one exact issue:

```bash
npm run course:doctor -- --project <issue-slug>
npm run build:social30 -- --resource <resource-id> --only <issue-slug>
```

Verification floor:
- `npm run test:social-build`
- `npm run course:doctor -- --project <issue-slug>`
- `npm run test:e2e:project -- --project <issue-slug>`
- `git diff --check`

## Science Pilot Intake

Read first:
- `docs/workflows/science-pilot.md`
- `scripts/lib/science-pilot-intake.ts`
- `projects/<science-slug>/meta/science-pilot.json` after intake
- `projects/<science-slug>/meta/decision-log.md` after the two review passes

Create a planning-only pilot from real ZIP sources:

```bash
npm run intake:science-pilot -- \
  --project <science-slug> \
  --course-code "SCI 20" \
  --title "Science 20" \
  --mode conversion \
  --brightspace-zip "<brightspace.zip>" \
  --teacher-resources-zip "<teacher-resources.zip>"
```

The command intentionally leaves the course blocked and creates no learner workspace. Use the shared planning packet for red-team and green-team review; build one representative unit only after their evidence is recorded.

Verification floor:
- `npm run test:science-pilot`
- `npm run validate:manifests`

## Handoff Resume

- open `docs/ops/ACTIVE_HANDOFF.md`

## Workflow-Aware Resume

When workflow type is known, read the matching workflow guide immediately after `ACTIVE_HANDOFF`:

- `docs/workflows/conversion.md`
- `docs/workflows/generated-course.md`
- `docs/workflows/injection-integration.md`
- `docs/workflows/prompt-contract.md` for prompt structure
- `docs/workflows/social-related-issues.md` for related-issues rebuilds
- `docs/workflows/science-pilot.md` for a source-backed Science pilot

For conversion work, use the ordered playbook in `docs/workflows/conversion.md`:
- Intake + artifact generation
- Preflight audit (encoding/media/paths/order)
- Placement + conversion-status normalization
- Lock behavior pass
- Deploy readiness pass
- Verification floor

## Workflow Shift (High-Confidence E2E)

Before: manual learner/archive passes + spot checks + `verify/typecheck/build`.

Now: define a project contract (`projects/<slug>/meta/e2e-contract.json`) with `assertionProfiles`, `modulePassTargets`, and `visibilityChecks`, then run:
- `npm run test:e2e:project -- --project <slug>`
- `npm run test:e2e:smoke`
- `npm run test:e2e:harness` (when validation/contract strictness changes)
- `npm run verify -- --project <slug>`
- `npm run typecheck`
- `npm run build:studio`

Opt-in new projects by adding their contract and stable `data-testid` hooks in the workspace/player UI so the deep suite can drive module passes consistently.
