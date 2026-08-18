# Exact-head Gate 0 audit — Canvas Studio inline editing V1

- Prepared: August 18, 2026
- Repository: [`deanguedo-arch/canvas-helper`](https://github.com/deanguedo-arch/canvas-helper)
- Branch: `codex/studio-inline-text-editing-v1`
- Behavioral commit audited: [`621078dd`](https://github.com/deanguedo-arch/canvas-helper/commit/621078dd126f8e633b11492a9be7f5eb5f468b0e)
- Integration base: [`84221330`](https://github.com/deanguedo-arch/canvas-helper/commit/842213301920798cc1f979c34218e939d4940f61) on `codex/studio-roadmap-phases`
- Local verdict: **GO WITH CONDITIONS** — the repository change is ready for independent exact-head review and a focused PR; hosted CI and external rollout acceptance remain outstanding.

## Important correction to the earlier audit prompt

The earlier instruction that Full Preview is display-only is stale for this branch. The current behavior supports an in-place caret at a safe text label in both embedded Studio and Full Preview. The caret is a trusted Studio-origin host layer above the isolated learner iframe; it is not a learner-frame `contenteditable` element.

Commits after the original inline baseline `26216b5a` add the Full Preview editing lease, active-caret transfer, keyboard compatibility, contextual controls, and full mapped-content parity. The final behavioral correction at `621078dd` ensures a source-safe heading or label containing an explicit `<br>` stays editable through the rich-text composer instead of making target resolution fail.

## Scope confirmed

- No structural authoring, block insertion, deletion, duplication, reordering, page management, or factory structural overrides were added.
- Browser typing, preview, and Save remain browser-local before Apply.
- Apply remains the first course-file and course-asset write and retains source re-resolution, lock, checkpoint, journal, rebuild/materialization, learner render validation, export staleness, and drift-safe Undo.
- Full Preview, embedded Studio, and Review & Apply use one authoritative draft controller.
- Runtime-owned, ambiguous, navigation, quiz, and simulation surfaces remain Annotation only.

## Exact behavioral evidence

The following commands ran from the clean behavioral commit `621078dd` unless noted otherwise:

| Check | Result |
| --- | --- |
| `npm run test:course-editing` | Passed, including the new explicit-line-break composer fallback and Apply/Undo safety cases. |
| `npm run test:studio-inspection` | Passed. |
| `npm run build:studio` | Passed; the existing bundle-size advisory remains non-blocking. |
| `npm run verify:typecheck-baseline` | Passed with exactly ten established unrelated diagnostics and none in changed files. Raw typecheck remains intentionally non-green. |
| `npm run test:studio-release` | Passed: 164 focused contracts, production build, 61 inspection E2E tests, platform smoke, and strict project contract. `.runtime/studio-release-report.json` recorded `workingTreeClean: true`, `sourceChangedDuringRun: false`, and `ok: true`. |
| `npm run verify:course-editing-pilots` | Passed 4/4 real adapters: Direct, English factory, Social factory, and legacy snapshot. Each completed Apply, applicable rebuild/materialization, learner render, reload, server restart, Undo, and byte-exact restoration. |
| `npm run verify:course-onboarding -- --all` | Passed 63/63 onboarded courses. Runtime-replaced or contrast-rejected targets were recorded as safe exclusions and restored, not counted as editable success. |

## Regression found and corrected during Gate 0

The first full-catalog run exposed two courses whose source-safe single-line elements contained explicit line breaks. The inline-caret capability attempted to derive a one-line editor and threw before the existing rich-text composer could handle them.

`app/server/lib/course-editing.ts` now declines the caret only for that shape and preserves the existing rich-text composer route. `scripts/tests/course-editing.test.ts` proves the element remains editable and that source bytes do not change during resolution. The corrected catalog sweep passed 63/63.

## Conditions before structural authoring

1. Push this exact branch and open a focused PR from `codex/studio-inline-text-editing-v1` to `codex/studio-roadmap-phases`.
2. Obtain independent review of the exact published PR head, including the trusted Full Preview caret boundary.
3. Require the PR-triggered hosted Studio release workflow to agree with the reviewed commit.
4. Integrate the inline branch before creating a recovery or structural-authoring branch.

The broader product rollout remains conditional on the planned five-teacher/twenty-session trial plus Brightspace/deployed-host, full-WCAG, delayed-interaction, and cross-browser SCORM acceptance. Those are not claimed by this local Gate 0 result.

## Auditor starting point

Read [`2026-08-17-safe-inline-text-editing-v1-audit.md`](./2026-08-17-safe-inline-text-editing-v1-audit.md) first, then verify the actual PR head. Reject any path that mutates the learner DOM before Apply, trusts browser HTML or a stale node ID, permits source drift to Save or Apply, creates a second draft authority, or lets learner keyboard/input/storage receive teacher editing events.
