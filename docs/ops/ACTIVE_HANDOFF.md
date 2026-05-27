# Handoff

- Project: `aboriginal-studies-30`
- Task: Fix hamburger/collapsed behavior for accepted unit cards and remove AS sidebar badge.
- Status: ready for local visual review

## Summary
- Preserved the accepted desktop unit-card look.
- Removed the circular `AS` badge from the sidebar brand area in both the live workspace and the builder template.
- Fixed the hamburger/narrow breakage by overriding the generic mobile `.stack-card-button` one-column rule for `.unit-card`.
- Added smaller responsive unit-card sizing below `640px` while keeping the badge panel horizontal.

## Files Changed
- `.stax/task.md`
- `.stax/codex-report.md`
- `.stax/command-evidence/cmd_2026-05-26T20_36_44_334Z_0c3d6942392c.pointer.json`
- `.stax/visual-proofs/manifest.json`
- `.stax/visual-proofs/visual_2026-05-26T20_36_20_043Z_031c8664263b.png`
- `docs/ops/ACTIVE_HANDOFF.md`
- `projects/aboriginal-studies-30/meta/build_sports_style_course.py`
- `projects/aboriginal-studies-30/meta/visual-checks/as30-unit-cards-collapsed-hamburger-fix-1672x941.png`
- `projects/aboriginal-studies-30/meta/visual-checks/as30-unit-cards-mobile-hamburger-fix-760x941.png`
- `projects/aboriginal-studies-30/meta/visual-checks/as30-unit-cards-reference-fix-1672x941.png`
- `projects/aboriginal-studies-30/workspace/index.html`
- `projects/aboriginal-studies-30/workspace/styles.css`
- `scripts/tests/aboriginal-studies-30-shell.test.ts`

## Verification Run
- `node node_modules/tsx/dist/cli.mjs --test scripts/tests/aboriginal-studies-30-shell.test.ts`
  - Passed: 8 tests.
- `npm.cmd run verify -- --project aboriginal-studies-30`
  - Passed; no missing local assets, embeds, or course-shell resources.
  - External Google Fonts and Font Awesome remain warnings.
- `npm.cmd run test:e2e:project -- --project aboriginal-studies-30`
  - Passed: 1 test.
- Playwright screenshot/metrics:
  - `projects/aboriginal-studies-30/meta/visual-checks/as30-unit-cards-reference-fix-1672x941.png`
  - `projects/aboriginal-studies-30/meta/visual-checks/as30-unit-cards-collapsed-hamburger-fix-1672x941.png`
  - `projects/aboriginal-studies-30/meta/visual-checks/as30-unit-cards-mobile-hamburger-fix-760x941.png`
- STAX command evidence:
  - `cmd_2026-05-26T20_36_44_334Z_0c3d6942392c`
- STAX visual proof:
  - `visual_2026-05-26T20_36_20_043Z_031c8664263b`

## Known Risks / Follow-Up
- No Firebase or hosted deploy was performed.
- Narrow screens still wrap long theme titles; the fixed issue is the badge panel no longer becomes a full-width broken tile.
- The wider worktree still includes unrelated Course Showcase, generated AS30 DOCX, and other prior changes. Those were not reverted.
- STAX may still reject because stale/wrong-worktree evidence from older unrelated tasks remains in its proof gate.

## Source-Of-Truth Location
- AS30 generator:
  - `projects/aboriginal-studies-30/meta/build_sports_style_course.py`
- Active generated workspace:
  - `projects/aboriginal-studies-30/workspace/index.html`
  - `projects/aboriginal-studies-30/workspace/styles.css`
- Regression test:
  - `scripts/tests/aboriginal-studies-30-shell.test.ts`

## Fragile Areas / What Might Drift
- Re-running the AS30 builder can regenerate workspace files and DOCX artifacts.
- Unit-card visuals rely on the `unit-card-left-t*.png` crop assets and `unit-card-right-texture.png`.
- Mobile/narrow layout is screenshot-sensitive because long theme titles wrap.

## Next Prompt Assumptions
- The user is reviewing the local preview before any deploy.
- If approved, the next likely step is a hosted deploy or a similar pass on another AS30 section.

## Exact Next Command
`node node_modules/tsx/dist/cli.mjs --test scripts/tests/aboriginal-studies-30-shell.test.ts`

## Exact Next File To Open
`projects/aboriginal-studies-30/workspace/styles.css`
