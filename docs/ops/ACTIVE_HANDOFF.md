# Handoff

- Project: `aboriginal-studies-30`
- Task: Remove the doubled unit-card divider after the container-width fit pass.
- Status: STAX accepted; ready for user visual review

## Summary
- The unit-card badge/text boundary now uses one 2px teal divider instead of the previous layered teal/copper stripe.
- The fix preserves the accepted card sizing and container-width compact behavior.
- The same CSS change is mirrored in the AS30 builder template so regeneration keeps the fix.

## Files changed
- `.stax/task.md`
- `.stax/codex-report.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `projects/aboriginal-studies-30/meta/build_sports_style_course.py`
- `projects/aboriginal-studies-30/workspace/styles.css`
- `scripts/tests/aboriginal-studies-30-shell.test.ts`
- `projects/aboriginal-studies-30/meta/visual-checks/as30-unit-cards-single-divider-compact-1143x1473.png`
- `projects/aboriginal-studies-30/meta/visual-checks/as30-unit-cards-single-divider-wide-1532x2048.png`

## Verification run
- `node node_modules/tsx/dist/cli.mjs --test scripts/tests/aboriginal-studies-30-shell.test.ts`
  - exitCode: 0; 8 tests passed.
- In-app browser reload and computed style check at `1143x1473`
  - after width: about `2px`; after background: `rgba(25, 193, 183, 0.86)`.
- Playwright visual capture at `1143x1473`
  - list width: `969`; compact grid: `104px 839px 24px`; divider width: `2px`.
- Playwright visual capture at `1532x2048`
  - list width: `1256`; full grid: `128px 1078px 48px`; divider width: `2px`.
- `npm run verify -- --project aboriginal-studies-30`
  - exitCode: 0; metadata passed; no missing local assets, embeds, or course-shell resources.
- `npm run test:e2e:project -- --project aboriginal-studies-30`
  - exitCode: 0; 1 project contract test passed.
- `npm run typecheck`
  - exitCode: 0.
- `npm run build:studio`
  - exitCode: 0.
- STAX command evidence collected from the STAX checkout/tooling repo:
  - shell regression: `cmd_2026-05-27T16_54_51_941Z_0c3d6942392c`
  - project verify: `cmd_2026-05-27T16_55_38_862Z_a31f5f3af22a`
  - project E2E: `cmd_2026-05-27T16_55_53_014Z_3103b2923da9`
  - typecheck: `cmd_2026-05-27T16_56_03_482Z_982c1455e5e7`
  - Studio build: `cmd_2026-05-27T16_56_25_260Z_b79b85db39e0`
- STAX visual proof collected from the STAX checkout/tooling repo:
  - `visual_2026-05-27T16_56_42_138Z_7fe291c1a561`
- STAX gate for `canvas-helper`
  - Status: Accept; proof strength: Audit-grade.

## Known risks / follow-up
- Human visual approval in the in-app browser is still the final polish check.
- The local screenshots are not hosted/Firebase proof; no deploy, publish, sync, or release was performed.
- The STAX proof tools live in the STAX checkout/tooling repo, not as local `canvas-helper` npm scripts.

## Source-of-truth location
- Active workspace CSS: `projects/aboriginal-studies-30/workspace/styles.css`
- AS30 generator template: `projects/aboriginal-studies-30/meta/build_sports_style_course.py`
- Regression test: `scripts/tests/aboriginal-studies-30-shell.test.ts`
- Active workspace entry: `projects/aboriginal-studies-30/workspace/index.html`

## Fragile areas / what might drift
- Re-running the AS30 builder can regenerate workspace files; keep the template and workspace CSS aligned.
- Unit-card visuals rely on `unit-card-left-t*.png` and `unit-card-right-texture.png`.
- The compact card behavior is container-width based: lists at or below `980px` use the compact card treatment.

## Next prompt assumptions
- The unit cards should keep the current responsive sizing.
- The badge/text boundary should show one divider stroke, not a teal/copper double stripe.
- No hosted course behavior has been changed or verified.

## Exact next command
`node node_modules/tsx/dist/cli.mjs --test scripts/tests/aboriginal-studies-30-shell.test.ts`

## Exact next file to open
`projects/aboriginal-studies-30/meta/visual-checks/as30-unit-cards-single-divider-compact-1143x1473.png`
