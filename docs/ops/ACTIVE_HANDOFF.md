# Handoff

- Project: `repo-wide`
- Task: Refine Canvas Studio usability and visual hierarchy before changing handoff semantics.
- Status: complete; visual hierarchy, first-use guidance, and readable display titles are ready and verified.

## Files changed

- `app/studio/src/App.tsx`
- `app/studio/src/components/CourseToolbar.tsx`
- `app/studio/src/components/ReviewSetPanel.tsx`
- `app/studio/src/lib/project-display.ts`
- `app/studio/src/precision-editor.css`
- `scripts/tests/studio-project-continuity.test.ts`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed

- Grouped preview controls separately from the Annotate, Full preview, Review Set, and Tools workflow actions.
- Removed the internal learner-policy label from the primary course toolbar.
- Made Annotate and Review Set clearer workflow actions while keeping Tools visually secondary.
- Replaced raw or awkward slug labels with readable course names such as `Social 10-1`, `ELA 20-1`, `Forensics 35`, and `CALM 3 New`, while preserving curated manifest titles.
- Replaced the empty Review Set's diagnostic-looking state with a concise three-step first-use guide and a neutral disabled handoff state.
- Increased the desktop Review Set rail width slightly without changing the course-first layout.

## Why this changed

- The completed A-H system was functionally strong but still made too many controls look equally important.
- New users needed an obvious path from Annotate to a saved Review Set and Codex handoff.
- Repository slugs are implementation identifiers, not polished product names.

## Verification run

- Passed: `npm run test:studio-inspection` — 86/86.
- Passed: `npm run build:studio`.
- Passed: `npm run test:e2e:smoke` — 1/1.
- Passed: `git diff --check`.
- Browser verified at `http://127.0.0.1:5186/`: course preview remained dominant; toolbar hierarchy, empty Review Set guidance, disabled handoff state, and representative display names rendered correctly.

## Source of truth

- Shared Studio presentation: `app/studio/src/precision-editor.css`.
- Course toolbar behavior: `app/studio/src/components/CourseToolbar.tsx`.
- Review Set first-use state: `app/studio/src/components/ReviewSetPanel.tsx`.
- Course display names: `app/studio/src/lib/project-display.ts`.

## Fragile areas / watchouts

- Keep course content inside isolated iframes; do not style learner courses through Studio CSS.
- Preserve `data-testid` selectors and the Focus/Split, Original/Current, and Full preview behaviors.
- Display formatting may need another generic token rule for future unconventional slugs; curated manifest titles remain authoritative.
- Unrelated local intake, resource, and duplicate test-result folders remain unstaged.

## Next prompt should assume

- Visual refinement phase is complete and should be committed before handoff-packet work begins.
- The next phase adds a compact default Codex handoff plus an explicit full-diagnostics option.
- Learner-course sources and generated outputs remain outside the change boundary.

## What still needs validation

- The final combined release candidate still requires the full `npm run test:studio-release` gate after the compact handoff and Verify Changes phases.
- Narrow-screen and full annotation interaction coverage will run again in the final release gate.

## Known risks

- The active Studio on port 5173 may still be an older server until it is restarted; the verified implementation ran through the current branch on port 5186.
- This phase does not yet change what gets copied to Codex or add post-handoff verification states.

## Exact next command

`rg -n "buildReviewSetPacket|preparedReviewSet|copyReviewSet" app/studio/src/lib/review-set.ts app/studio/src/App.tsx scripts/tests/codex-packet.test.ts`

## Exact next file to open

`app/studio/src/lib/review-set.ts`

## Do not do next / warnings

- Do not remove bounded safety, source ownership, rebuild, validation, or screenshot-path evidence from compact handoffs.
- Do not make full diagnostics the default.
- Do not edit learner-course workspace, raw, or export files for shared Studio behavior.
