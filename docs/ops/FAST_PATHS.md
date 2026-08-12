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
- Generated Social and English workspaces remain output; packets point to their builder/factory source and rebuild flow.
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
- Treat Studio as a local read-only inspection and handoff surface. Course changes belong in the declared canonical source or owning rebuild flow.

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
