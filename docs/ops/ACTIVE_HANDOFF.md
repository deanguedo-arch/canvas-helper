# Handoff

- Project: `repo-wide`
- Task: Make Studio editability an automatic enforced acceptance requirement for every newly created or newly activated active course.
- Status: implementation and local validation complete; GitHub publication/check conclusions belong in PR #1 because adding run IDs here would create a new untested head

## Summary

- The user can simply ask Codex to make a course. Internal fast paths and commands are agent/CI implementation details, not user choices.
- New and newly activated active courses must declare `studio-routine-content-v1` and pass manifest ownership, doctor, complete learner inventory, rendered coverage floors, clean residue proof, and a real HTTP Apply/reload/Undo lifecycle.
- The gate is change-aware: it covers new active manifests, non-active→active transitions, safe-adapter onboarding, contract removal or governed-project deletion, and later governed project/resource/declared-builder changes. Git rename detection is disabled so a deletion cannot disappear into a similar new manifest.
- Policy inception is `350d2ad4f164520123a37210fd8185cac20c4b77`. Existing pre-inception courses remain explicit legacy migration work instead of being assigned an invented percentage.
- Direct creation emits the contract automatically. Fresh English factory and Social factory manifests receive the same obligation. Generic imports now begin `blocked` under proposal-only ownership; the existing science pilot remains blocked.
- No learner course content was changed. User-owned duplicate, resource, transaction, handoff, report, and test-result paths remain untouched and unstaged.

## Files changed

- Contract/policy: `app/shared/course-editability.ts`, `scripts/lib/types.ts`, `scripts/lib/project-manifest-policy.ts`, `scripts/lib/new-course-readiness.ts`.
- Enforcement/CI: `scripts/verify-new-course-readiness.ts`, `.github/workflows/new-course-readiness.yml`, `package.json`.
- Creation workflows: `scripts/lib/codex-course.ts`, `scripts/build-english-unit.ts`, `scripts/lib/english-unit/factory-build.ts`, `scripts/lib/course-onboarding.ts`, `scripts/lib/importer.ts`.
- Tests: `scripts/tests/new-course-readiness.test.ts`, `codex-course.test.ts`, `course-editability-inventory.test.ts`, `course-onboarding.test.ts`, `project-manifest-policy.test.ts`, `package-script-contract.test.ts`, `react-module-import.test.ts`.
- Documentation: `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `docs/ops/FAST_PATHS.md`, the real-time plans, the Codex/English/Social workflow guides, and the new audit packet.

## Verification run

- `npm run test:new-course-readiness` — 7/7 passed, including anchor integrity, malformed/new manifests, missing/unsafe contract, numerical-floor, activation, contract removal, deletion, shared-dependency, and legacy-grandfathering cases.
- `npm run test:course-editability` — 17/17 passed, including a real rendered fresh-course threshold through production Resolve.
- `npm run test:course-onboarding` — 3/3 passed.
- `npm run test:metadata-policy` — 29/29 passed.
- `LEARNER_MODE=off npx tsx --test --test-concurrency=1 scripts/tests/react-module-import.test.ts scripts/tests/doc-bundle-import.test.ts scripts/tests/project-recovery.test.ts` — 5/5 passed.
- `npm run test:studio-inspection` — 158/158 passed.
- `npm run validate:manifests` — all 65 manifests passed.
- `npm run build:studio` — passed, 85 modules.
- `git diff --check` — passed.
- `npm run typecheck -- --pretty false` — retained the same ten unrelated legacy builder/factory diagnostics; no diagnostic points at this change.
- `npm run test:english-course` — 168/186 passed and retained 18 unrelated baseline failures involving missing legacy workspaces and older content/evidence contracts; focused English transaction and changed-boundary tests passed.
- Pre-commit readiness smoke at policy inception — pass with zero required courses, which is expected because this change adds enforcement code rather than a learner course. Exact-head CI must repeat it after publication.

## Source of truth

- New-course policy and thresholds: `scripts/lib/new-course-readiness.ts`.
- Exact-head orchestrator: `scripts/verify-new-course-readiness.ts`.
- Versioned shared contract: `app/shared/course-editability.ts` and `scripts/lib/types.ts`.
- CI authority/artifacts: `.github/workflows/new-course-readiness.yml` and PR #1 checks.
- Product workflow: `docs/workflows/codex-studio-course.md`.
- Independent audit instructions: `docs/audits/2026-08-15-new-course-studio-editability-enforcement-audit.md`.

## Fragile areas / what might drift

- CI uses `fetch-depth: 0`. The durable `config/studio-editability-policy-v1.json` anchor keeps bootstrap safe across merge or squash histories; an unanchored or insufficient local checkout fails closed.
- A governed shared dependency is rechecked only when it is declared through the manifest, same-slug resource boundary, or English recipe source fields. New factories must keep dependencies explicit.
- Coverage thresholds prove ordinary teacher-content breadth, not arbitrary DOM mutation. Runtime quizzes, simulations, scoring, and behavior-rich components remain Annotation-only or require dedicated editors.
- The gate deliberately fails a new English/Social course that does not meet coverage; it does not lower the floor or silently activate it.
- The filesystem lock remains cooperative for external writers. Do not run Studio Apply concurrently with manual, Git, Codex, or standalone builder writes.

## Next prompt should assume

- Any from-scratch course request routes automatically to the Studio-aware Direct contract unless the user explicitly names an owning English/Social family.
- Any new import is previewable but blocked until onboarded and measured.
- Any new active course must pass the exact-head new-course workflow; do not hand-add a Studio flag or copy a legacy manifest.
- PR #1 remains unmerged unless the repository owner explicitly authorizes merge.

## What still needs validation

- Confirm the final push and PR executions of `New course Studio readiness` match the exact published head and inspect `new-course-studio-readiness-evidence`.
- Retain the existing Direct Editing release/census workflows at the same exact head.
- Independent ChatGPT Pro review should use the new audit packet and adversarial checklist.
- Teacher rollout, Brightspace/deployed-host, cross-browser SCORM, delayed-interaction, and full-WCAG acceptance remain separate product gates.

## Known risks / follow-up

- Existing legacy courses are not converted by this change; they remain the measured migration queue.
- A future new factory can be blocked by honest low coverage. The fix is source ownership/renderer/inventory work, not an exemption.
- Local `.runtime` reports and user-owned duplicate paths make a local worktree dirty; exact evidence must come from a clean checkout.

## Exact next command

`gh pr checks 1 --watch`

## Exact next file to open

`docs/audits/2026-08-15-new-course-studio-editability-enforcement-audit.md`

## Do not do next / warnings

- Do not merge PR #1 without repository-owner authorization.
- Do not add `editabilityContract` to current legacy manifests merely to improve a number.
- Do not weaken, skip, or average the coverage floors.
- Do not treat a blocked import, page map, no-target outcome, or partial lifecycle as active readiness.
- Do not stage or delete unrelated untracked reports, duplicate resources, transaction folders, or alternate handoff files.
