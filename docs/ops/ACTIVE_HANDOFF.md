# Handoff

- Project: `repo-wide`
- Task: Make course authoring truthful, source-bound, transaction-safe, and ready for a Science pilot.
- Status: complete

## Files changed

- `scripts/lib/course-authoring/context.ts`, `scripts/lib/types.ts`, and authoring-context tests
- `scripts/build-social30-related-issues.ts`, `scripts/lib/social-resource-manifest.ts`, and `scripts/lib/social-build-staging.ts`
- `scripts/lib/english-unit/factory-build.ts` and `scripts/lib/english-unit/factory-transaction.ts`
- `scripts/intake-science-pilot.ts` and `scripts/lib/science-pilot-intake.ts`
- `projects/resources/social30-1-related-issues/resource-manifest.json`
- `projects/social30-1-related-issue-1-option-2/meta/project.json`, `meta/e2e-contract.json`, and generated `workspace/index.html`
- `docs/workflows/social-related-issues.md`, `docs/workflows/science-pilot.md`, `docs/ops/FAST_PATHS.md`, `README.md`, and `ARCHITECTURE.md`

## What changed

- `course:list` and `course:doctor` now distinguish direct workspace editing, English factory rebuilds, Social rebuilds, and planning-only work from a lifecycle label.
- Social 30-1 Related Issue 1 Option 2 now rebuilds only from the named, checksum-verified `social30-1-brightspace-winter-2020` source. Its builder stages output before promotion and never overwrites raw input or `meta/project.json`.
- The Social Evidence Bank now has a real learner interface, and its project E2E contract covers save, update, remove, reload, navigation, mobile, and scoped-print behavior.
- English factory output writes are now transactional. A failed late step restores the prior generated workspace and generated metadata while preserving recipe, custom components, custom assets, and raw source.
- English readiness now checks the recipe's two declared archives. Missing archives and unresolved LFS pointers block a factory rebuild instead of producing a misleading ready state.
- The new Science path is a source-backed intake only: it copies checksum-named ZIPs, creates a compact planning packet and red-team/green-team decision log, and deliberately creates no workspace, SCORM package, or generic Science factory.

## Why this changed

- Generated workspaces, hidden source archives, and broad context were making it too easy to work on the wrong thing or spend tokens without a safe path to a reliable course.
- Social and English now preserve their proven patterns while making ownership, source availability, and rollback behavior explicit.
- Science can start from real curriculum material and prove one representative unit before the repository standardizes a new subject-specific builder.

## Source of truth

- Course-driver and readiness policy: `scripts/lib/course-authoring/context.ts`.
- Social source and rebuild policy: `projects/resources/social30-1-related-issues/resource-manifest.json`, `scripts/build-social30-related-issues.ts`, and `scripts/lib/social-build-staging.ts`.
- English rebuild policy: `projects/<slug>/meta/english-unit.json`, `scripts/lib/english-unit/factory-build.ts`, and `scripts/lib/english-unit/factory-transaction.ts`.
- Science planning intake: `scripts/lib/science-pilot-intake.ts`, with the first project's `meta/science-pilot.json` and `meta/decision-log.md` becoming its canonical planning sources.
- Generated `workspace/**` and `exports/**` are never canonical sources. Rebuild them through their owning driver, and never hand-edit `raw/**`.

## Verification run

- Passed: `npm run test:science-pilot` (3), `npm run test:metadata-policy` (37), `npm run test:authoring-context` (16), `npm run test:social-build` (7), `npm run test:english-transaction` (6), `npm run test:scorm` (19), `npm run validate:manifests`, `npm run build:studio`, `npm run course:doctor -- --project social30-1-related-issue-1-option-2`, and `npm run test:e2e:project -- --project social30-1-related-issue-1-option-2`.
- `git diff --check` passed.
- The deprecated Social `--zip=<path>` form rejects before a rebuild can start.
- `npm run typecheck` still reports its known unrelated legacy ELA, Forensics, Social 20, and English-builder baseline errors; no touched-file error was reported.
- The full legacy `npm run test:english-course` suite still has pre-existing failures outside this change. The focused factory transaction suite passes.

## Fragile areas / watchouts

- The current Social resource is intentionally snapshot-backed under `projects/processed/**`; its checksum protects rebuilds, but promote it deliberately if the team adopts a permanent shared archive location.
- English factory output is disposable. Keep bespoke work only in the recipe, `workspace/components/**`, or `workspace/assets/custom/**`.
- The Science pilot must remain blocked until the decision log names one representative unit, real source mapping, learner loop, persistence needs, and verification boundary.
- `course:list -- --all` now exposes legacy invalid manifests and blocked projects honestly. Do not treat that report as permission to bulk-migrate unrelated courses.

## Next prompt should assume

- Branch: `codex/course-readiness-science-pilot`.
- Commit `adbc5588` contains the first course-readiness phase; this branch's follow-up commit contains the Social, English, Science, test, and documentation work.
- No actual Science archive has been supplied, so no real Science project has been created.
- The ChatGPT/Terra red-team/green-team process should use only the named packet listed in `docs/workflows/science-pilot.md`; do not give either reviewer a whole repository dump.
- Do not create a generic Science factory until a real representative unit has passed its decision and verification gates.

## What still needs validation

- Intake a real Science Brightspace ZIP (and teacher-resource ZIP if available), complete the decision log with both reviewers, then build and verify one representative unit.
- Upload the resulting release to the target Brightspace course and confirm save/restore in the target browsers and learner account. Local SCORM checks do not prove that external acceptance.

## Known risks

- Repository-wide typecheck and the old full English suite have unrelated failures that should be triaged as a separate maintenance task, not hidden in a course build.
- The Social source has provenance and checksum verification but remains snapshot-backed.
- A ChatGPT Pro review is only as good as the exact packet supplied; it cannot safely infer missing source files or external Brightspace behavior.

## Exact next command

`npm run intake:science-pilot -- --project <science-slug> --course-code "SCI 20" --title "Science 20" --mode conversion --brightspace-zip "<absolute-path-to-brightspace.zip>" --teacher-resources-zip "<absolute-path-to-teacher-resources.zip>"`

## Exact next file to open

`docs/workflows/science-pilot.md`

## Do not do next / warnings

- Do not hand-edit Social generated `workspace/index.html` or bypass the named-resource rebuild command.
- Do not add a fake or placeholder Science unit just to make the status active.
- Do not move raw source files or restore absent English archives from guessed paths.
- Do not use whole-project context for a reviewer when the project prompt pack and selected evidence are sufficient.
