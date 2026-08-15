# ChatGPT Pro audit packet: automatic Studio editability for new courses

- Date: 2026-08-15
- Repository: `deanguedo-arch/canvas-helper`
- Branch: `codex/studio-direct-editing-v1`
- Pull request: https://github.com/deanguedo-arch/canvas-helper/pull/1
- Policy inception: `350d2ad4f164520123a37210fd8185cac20c4b77`, durably anchored by `config/studio-editability-policy-v1.json`
- Audit target: the exact PR head and the `new-course-studio-readiness-evidence` artifact produced for that same SHA
- Requested disposition: `GREEN / GO`, `GO WITH CONDITIONS`, or `REQUEST CHANGES`

## Question being audited

Can the user simply ask Codex to make a course and rely on the repository to prevent that course from being accepted as active unless ordinary teacher content is genuinely editable in Studio?

This is not a claim that every DOM node is generically editable. The acceptance target is high coverage of ordinary teacher-authored content with complete, honest classification of the rest.

## Product outcome

The user does not select an internal fast path or remember a verification command. Codex routes a from-scratch request to the Studio-aware Direct generator and routes an explicitly requested English/Social family to its owning factory. Repository policy and CI then enforce the outcome.

A new course cannot be accepted as `active` or `ready-for-export` merely because it has HTML or a Studio flag. It must prove:

1. a valid migrated source-of-truth manifest;
2. a supported Direct, English factory, or Social factory driver;
3. explicit Studio editing, Rename, and image-asset support;
4. the versioned `studio-routine-content-v1` contract;
5. a complete adapter-owned learner-surface inventory;
6. complete rendered semantic reconciliation through production Resolve;
7. at least 90% primary block coverage;
8. at least 90% teacher-text code-unit coverage;
9. at least 80% coverage for every promised standard candidate category;
10. 100% synchronized course-name support;
11. at least 90% promised link/image capability coverage;
12. a clean, residue-free exact-head census;
13. one real HTTP Apply → learner reload → Undo lifecycle whose outcome is `pass`.

No-target, map-only, skipped-checkpoint, incomplete, truncated, dirty-worktree, residue, or failed-restoration results are failures.

## What changed

### Versioned acceptance marker

`app/shared/course-editability.ts` defines one closed schema/profile pair. `scripts/lib/types.ts` carries it in `authoring.editabilityContract`; `scripts/lib/project-manifest-policy.ts` preserves only the recognized shape and rejects using it with disabled editing, a legacy snapshot, or proposal-only ownership.

The marker does not grant write authority. It opts the course into measurable obligations enforced by production inventory, Resolve, Apply, rendered validation, and Undo paths.

### Official creation behavior

- `course:create` emits the Direct marker, complete static learner inventory, durable edit keys, synchronized course-name surfaces, ordinary headings/prose/lists/links/image/caption content, and an explicit Annotation-only runtime control.
- New English factory manifests default to the English adapter and the same readiness marker while preserving any pre-existing authoring contract instead of rewriting legacy ownership.
- Newly created Social 30 factory manifests receive the Social adapter and marker.
- A safe adapter newly onboarded onto an older course receives the marker only when it is actually being enrolled; existing already-onboarded catalog manifests are not mass-modified.
- Generic imports now start `blocked` under proposal-only ownership. They remain previewable but cannot silently claim active Studio readiness.
- The science pilot already starts blocked and remains outside the active gate until a learner factory exists.

### Change-aware enforcement

`scripts/lib/new-course-readiness.ts` compares the exact head with the correct policy base and classifies:

| Change | Required outcome |
| --- | --- |
| New active/ready manifest | Full gate required |
| New blocked/reference/archive manifest | Recorded, not accepted as active |
| Blocked/non-active → active/ready | Full gate required |
| Safe adapter newly enabled on an older active course | Full gate required |
| Later project change to a governed course | Full gate required |
| Later declared recipe/resource/builder dependency change | Full gate required |
| Governed manifest/project deleted or renamed | Full gate required; rename detection is disabled so the old path remains visible |
| Existing pre-inception active course with no contract | Remains legacy migration work; no new percentage is invented |
| Governed course removes or corrupts its marker | Full gate runs and fails static validation |

If the requested Git comparison base already contains the durable policy anchor, the gate uses that base. If it predates policy inception, the gate uses the reachable inception commit. A squash-merge bootstrap can use the anchored current head when the reviewed feature-branch SHA is no longer reachable and the requested pre-policy base is present. An unanchored or insufficient checkout otherwise fails closed.

Governed dependencies include the project boundary, same-slug resource boundary, repo-contained canonical/source/reference paths, and English recipe archive paths. Shared declared builder changes therefore remeasure affected governed courses without remeasuring unrelated legacy projects.

### Exact-head command and CI

`scripts/verify-new-course-readiness.ts`:

1. discovers required course changes;
2. validates the manifest contract;
3. runs `course:doctor` through the repository API;
4. builds a read-only rendered report only for required courses;
5. enforces every numerical/profile floor;
6. rejects dirty, drifting, or wrong-head evidence;
7. runs `verify:course-onboarding -- --project <slug>` for every course that cleared coverage;
8. writes a canonical content-free report with SHA-256 digest;
9. exits nonzero if any required course is not a full pass.

`.github/workflows/new-course-readiness.yml` runs on relevant pull requests, on `main`, and on the Direct Editing branch. It checks out full history plus LFS assets, installs Chromium, runs focused policy/generator tests, executes the exact-head gate, and uploads:

- `.runtime/new-course-readiness.json`;
- `.runtime/new-course-editability-report.json` when a course required measurement;
- `.runtime/course-onboarding-verification.json` when a lifecycle ran.

## Primary implementation files

- `app/shared/course-editability.ts`
- `scripts/lib/types.ts`
- `scripts/lib/project-manifest-policy.ts`
- `scripts/lib/new-course-readiness.ts`
- `scripts/verify-new-course-readiness.ts`
- `scripts/lib/codex-course.ts`
- `scripts/lib/importer.ts`
- `scripts/build-english-unit.ts`
- `scripts/lib/english-unit/factory-build.ts`
- `scripts/lib/course-onboarding.ts`
- `.github/workflows/new-course-readiness.yml`
- `scripts/tests/new-course-readiness.test.ts`
- `scripts/tests/course-editability-inventory.test.ts`
- `scripts/tests/codex-course.test.ts`
- `scripts/tests/course-onboarding.test.ts`

The inherited measurement and lifecycle authority remains in:

- `scripts/lib/course-editability/**`;
- `app/server/lib/course-editing.ts`;
- `app/server/lib/course-edit-transaction.ts`;
- `app/server/lib/course-edit-render-validation.ts`;
- `scripts/verify-course-onboarding.ts`.

## Auditor commands

Run from a clean full-history checkout of the exact PR head:

```bash
git status --short
git rev-parse HEAD
npm ci
npx playwright install chromium
npm run test:new-course-readiness
npm run test:course-editability
npm run test:course-onboarding
npm run test:metadata-policy
npm run validate:manifests
npm run build:studio
npm run verify:new-course-readiness -- --base 350d2ad4f164520123a37210fd8185cac20c4b77
```

For the current implementation-only change, the last command should report zero required courses because no learner course was added after policy inception. That is not threshold evidence by itself. The fresh generator’s real rendered threshold proof is in `course-editability-inventory.test.ts`; the policy’s adversarial discovery/scoring proof is in `new-course-readiness.test.ts`. The first future course change must cause the command to produce both a per-course rendered report and a lifecycle pass.

## Adversarial review checklist

The audit should try to invalidate these cases rather than accepting the happy path:

- add an active manifest without the marker;
- add an unreadable or malformed new manifest and confirm it fails rather than disappearing from discovery;
- add an active manifest with Studio editing disabled;
- add an active manifest using `legacy-snapshot-v1` or `proposal-only-v1`;
- add a blocked manifest, then promote it to active in a later commit;
- enable a Direct/English/Social adapter on an older active project that was not previously editable;
- remove the marker from a governed project;
- reduce total block or teacher-text coverage below 90%;
- remove a promised category entirely;
- reduce one promised category below 80%;
- reduce Rename below 100% or link/image capability support below 90%;
- return incomplete inventory, no candidates, truncated collection, storage writes, repository residue, or a dirty/wrong-head report;
- make a governed course depend on a shared declared builder, then change only that builder;
- make Apply succeed but Undo skip, fail, or restore anything other than the exact prior boundary;
- import arbitrary HTML and confirm it is blocked rather than silently active;
- confirm an unrelated edit to a pre-inception legacy course does not retroactively fail the whole catalog.

## Claims intentionally not made

- Existing legacy courses are not automatically converted by this change.
- The gate does not claim every DOM node is editable.
- Runtime quizzes, simulations, navigation state, scoring logic, and behavior-rich components can remain explicit Annotation-only or require dedicated editors.
- The current all-catalog incomplete inventories still prevent a global legacy percentage.
- Local rendered validation is not Brightspace upload/launch/resume acceptance, cross-browser SCORM acceptance, delayed-interaction proof, teacher usability acceptance, or full WCAG certification.
- A failed English/Social new-course gate is not bypassed. The owning renderer, inventory, or source model must be corrected before the course can be accepted as active.

## Verdict rubric

Return **REQUEST CHANGES** if any new active course can bypass the marker, inventory, numerical floors, clean exact-head residue proof, or reversible lifecycle; if a generic import is still silently active; if dependency changes can leave a governed course unmeasured; or if CI evidence does not match the PR head.

Return **GO WITH CONDITIONS** only for an explicitly external boundary such as teacher rollout or Brightspace acceptance, not for a repository bypass.

Return **GREEN / GO** when the static policy, rendered floor, lifecycle, change detection, generic-import quarantine, focused tests, and exact-head GitHub artifact all agree.
