# Handoff

- Project: `repo-wide`
- Task: Rebuild Canvas Studio's front-facing shell as a high-end precision review workstation without changing course content or weakening the existing review workflow.
- Status: ready for teacher validation; implementation and automated verification are complete locally on `codex/studio-workflow-v2`.

## Summary

- The ChatGPT Pro visual audit was implemented as a Studio-shell redesign, not as a theme applied to learner courses.
- Studio now has four clear layers: global product navigation, contextual course controls, the course canvas, and the optional Review Set inspector.
- **Courses** and **Assessments** are separate top-level workspaces. Course-only controls disappear in Assessments.
- Focus is the default review layout. Split, Original/Current, device, zoom, Annotate, Full preview, Review Set, and Tools are consolidated into one responsive contextual toolbar.
- The shell now uses matte neutral surfaces, crisp borders, restrained shadows and radii, one blue action color, system typography, and no decorative gradients or glass effects.
- Project search is functional and supports `Command/Ctrl + K`.
- Operational commands are hidden behind **Tools** so they do not compete with visual review.
- Ending annotation or visiting Assessments pauses an unfinished note and screenshots instead of deleting the draft.
- Sticky global controls were removed after they exposed an iframe click-geometry race. Annotation and inspector affordances remain available while course interaction tests are now stable.
- No file under `projects/<slug>/workspace`, `raw`, or `exports` was changed.

## Files changed

- `app/studio/src/App.tsx`
- `app/studio/src/components/CourseToolbar.tsx`
- `app/studio/src/components/InspectionPanel.tsx`
- `app/studio/src/components/InspectorPanel.tsx`
- `app/studio/src/components/PreviewPane.tsx`
- `app/studio/src/components/Topbar.tsx`
- `app/studio/src/components/WorkspacePicker.tsx`
- `app/studio/src/hooks/useLayoutPreferences.ts`
- `app/studio/src/lib/types.ts`
- `app/studio/src/main.tsx`
- `app/studio/src/precision-editor.css`
- `app/studio/src/styles.css`
- `e2e/specs/inspection.spec.ts`
- `docs/plans/2026-08-11-canvas-studio-evolution-and-roadmap.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed

- Replaced the prototype-like all-in-one top area with a global `Topbar` and dedicated `CourseToolbar`.
- Added real course search, friendly Course/Page labels, explicit preview connection state, responsive wrapping, and a compact Tools drawer.
- Changed pane names from technical **Reference/Workspace** to teacher-facing **Original reference/Current course**.
- Defaulted new layout preferences to Focus and hid pane controls until requested.
- Simplified the empty inspector to Review Set only; the New annotation composer appears when annotation is active or a draft exists.
- Added an E2E regression proving Assessments is isolated and an unfinished course annotation returns as **Draft paused**.
- Added a visual-foundation record to the Studio evolution and roadmap document.

## Why this changed

- The workflow had become substantially stronger than its visual presentation. Excessive translucent cards, pills, shadows, duplicated controls, and technical labels made the product feel like a prototype.
- The teacher's dominant task is reviewing course output, annotating it, collecting evidence, and handing one bounded set to Codex. The shell now makes that hierarchy visible.

## Source of truth

- Product-level navigation and search: `app/studio/src/components/Topbar.tsx`.
- Course review controls: `app/studio/src/components/CourseToolbar.tsx`.
- Studio state and workflow orchestration: `app/studio/src/App.tsx`.
- Precision visual system and responsive behavior: `app/studio/src/precision-editor.css`.
- Review Set and source-safety contracts remain in their existing Studio/server modules; this pass did not replace them.
- Learner-course appearance and behavior remain owned by each project's declared canonical source or builder, not by Studio CSS.

## Verification run

- Passed: `npm run test:studio-inspection` — 51/51.
- Passed: `npm run build:studio`.
- Passed: `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts` — 16/16.
- Passed three consecutive times: `npm run test:e2e:smoke`.
- Passed: `npm run test:e2e:project -- --project e2e-fixture`.
- Live browser QA passed for Focus, Split, Annotate, Review Set, Tools, and the separate Assessments workspace at responsive desktop widths.
- Baseline only: `npm run typecheck` still reports established unrelated errors in legacy ELA, Forensics, Social 20, LLM dependency, and English-builder files; no diagnostic points into a touched Studio file.

## Fragile areas / watchouts

- Keep global and course toolbars in normal document flow unless a future sticky implementation has explicit iframe-interaction coverage. A moving overlay can intercept course controls during browser-driven scrolling.
- Keep `precision-editor.css` loaded after the legacy stylesheet until old declarations are deliberately retired; import order currently makes the visual migration low-risk.
- Preserve existing `data-testid` attributes and exact Courses/Assessments separation because the critical E2E workflow depends on those stable contracts.
- Do not style or inspect across the isolated iframe boundary. The Studio shell must remain independent of course subject, framework, and theme.
- The 1520-pixel toolbar breakpoint intentionally wraps before Course/Page or zoom values truncate.

## Next prompt should assume

- Branch: `codex/studio-workflow-v2`.
- The precision-editor work is currently uncommitted.
- The local branch was already one commit ahead of `origin/codex/studio-workflow-v2` before this visual pass; that pre-existing commit is outside this task and must not be rewritten or pushed accidentally.
- The teacher should validate the visual feel in the running Studio; implementation, security, and interaction gates already pass.
- Course content was not redesigned and should not be changed as part of Studio-shell polish.

## What still needs validation

- Teacher acceptance of the information density and two-row toolbar at medium desktop widths.
- Optional future accessibility audit for the complete shell, beyond the keyboard and semantic behavior covered by current tests.

## Known risks

- The new visual layer still overrides a legacy stylesheet. Consolidating those styles would reduce maintenance cost but would be a separate, larger refactor.
- Native `<select>` rendering varies slightly by operating system, although labels now wrap before available width becomes too narrow.
- Repository-wide typecheck is not a clean release gate until its unrelated baseline failures are resolved.

## Exact next command

`npm run studio:codex`

## Exact next file to open

`app/studio/src/precision-editor.css`

## Do not do next / warnings

- Do not restyle generated course HTML to match the Studio mockups.
- Do not reintroduce an API-backed assistant or expose source paths in the teacher-facing shell.
- Do not weaken preview isolation, Review Set bounds, screenshot ownership, or canonical-source resolution for visual convenience.
- Do not commit or push the pre-existing unrelated local commit as though it belongs to this redesign.
