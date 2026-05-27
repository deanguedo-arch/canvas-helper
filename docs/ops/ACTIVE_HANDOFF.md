# Handoff

- Project: `aboriginal-studies-30`
- Task: Refit unit cards to the provided reference screenshot.
- Status: STAX accepted; ready for user visual review

## Summary
- The AS30 unit cards now use the cropped reference divider asset and cropped reference right-side card texture instead of the earlier simplified divider/background treatment.
- Desktop and wider tablet cards preserve the full badge panel, description line, right-side botanical/contour texture, and patterned vertical divider.
- Cards compact only when the unit-list container is genuinely narrow, such as the expanded-sidebar Codex pane where the list is about 521px wide.

## Files changed
- `.stax/task.md`
- `.stax/codex-report.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/design/as30/assets/unit-card-right-texture.png`
- `docs/design/as30/assets/unit-card-divider-reference.png`
- `projects/aboriginal-studies-30/meta/build_sports_style_course.py`
- `projects/aboriginal-studies-30/workspace/styles.css`
- `projects/aboriginal-studies-30/workspace/assets/design/as30/unit-card-right-texture.png`
- `projects/aboriginal-studies-30/workspace/assets/design/as30/unit-card-divider-reference.png`
- `scripts/tests/aboriginal-studies-30-shell.test.ts`
- `projects/aboriginal-studies-30/meta/visual-checks/as30-reference-card-match-final-1672x941.png`
- `projects/aboriginal-studies-30/meta/visual-checks/as30-reference-card-match-collapsed-1143x1473.png`
- `projects/aboriginal-studies-30/meta/visual-checks/as30-reference-card-match-pane-expanded-943x1096.png`

## Verification run
- `node node_modules/tsx/dist/cli.mjs --test scripts/tests/aboriginal-studies-30-shell.test.ts`
  - exitCode: 0; 8 tests passed.
- `npm run verify -- --project aboriginal-studies-30`
  - exitCode: 0; metadata passed; no missing local assets, embeds, or course-shell resources.
- `npm run test:e2e:project -- --project aboriginal-studies-30`
  - exitCode: 0; 1 Chromium project contract passed.
- `npm run typecheck`
  - exitCode: 0.
- `npm run build:studio`
  - exitCode: 0.
- `git diff --check`
  - exitCode: 0.
- `npm run stax:preflight -- --observer`
  - exitCode: 1; local package is missing script `stax:preflight`.
- Visual proof captured:
  - `projects/aboriginal-studies-30/meta/visual-checks/as30-reference-card-match-final-1672x941.png`
  - `projects/aboriginal-studies-30/meta/visual-checks/as30-reference-card-match-collapsed-1143x1473.png`
  - `projects/aboriginal-studies-30/meta/visual-checks/as30-reference-card-match-pane-expanded-943x1096.png`
- STAX status:
  - `.stax/status.json` reports `Accept` with proof strength `Audit-grade`.

## Known risks / follow-up
- The 943px expanded-sidebar in-app preview leaves only about 521px for the unit list, so the cards intentionally compact there and cannot visually match the 1672px reference until the sidebar is collapsed or the preview is wider.
- This pass refit the unit-card surface only. The progress panel and full sidebar still differ from the provided whole-page reference.
- The local `canvas-helper` package does not expose `npm run stax:preflight`, `npm run stax:collect`, or `npm run stax:collect-visual`; STAX acceptance came from the sidecar/tooling state recorded under `.stax/`.
- No deploy, publish, sync, or release action was performed.

## Source-of-truth location
- Active workspace CSS: `projects/aboriginal-studies-30/workspace/styles.css`
- AS30 generator template: `projects/aboriginal-studies-30/meta/build_sports_style_course.py`
- Reference card assets: `projects/aboriginal-studies-30/workspace/assets/design/as30/`
- Regression test: `scripts/tests/aboriginal-studies-30-shell.test.ts`
- Active workspace entry: `projects/aboriginal-studies-30/workspace/index.html`

## Fragile areas / what might drift
- Re-running the AS30 builder can regenerate workspace files; keep the builder template and workspace CSS aligned.
- Unit-card visuals rely on `unit-card-left-t*.png`, `unit-card-right-texture.png`, and `unit-card-divider-reference.png`.
- The compact card behavior is container-width based: very narrow list containers will hide descriptions even on a large browser window if the expanded sidebar consumes too much width.

## Next prompt assumptions
- The reference screenshot is the visual target for the unit-card treatment.
- The card should stay full-width/reference-like when the content column is wide enough.
- No hosted course behavior has been changed or verified.

## Exact next command
`npm run test:e2e:project -- --project aboriginal-studies-30`

## Exact next file to open
`projects/aboriginal-studies-30/meta/visual-checks/as30-reference-card-match-final-1672x941.png`
