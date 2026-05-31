# Handoff

- Project: `aboriginal-studies-30`
- Task: Fix tablet/mobile unit-card title visibility and hide the progress panel in top-sidebar mode.
- Status: STAX accepted; ready for user visual review

## Summary
- Unit-card titles no longer disappear in tablet/narrow layouts.
- The root cause was a generic `@media (max-width: 860px)` rule that changed all `.stack-card-button` grids to one column after the AS30 unit-card grid had been defined.
- The generic one-column rule now excludes `.unit-card`, so AS30 unit cards keep their badge/content/arrow grid at tablet and phone sizes.
- The large course progress panel is hidden at the top-sidebar breakpoint so tablet/phone views go from the sidebar/header directly into the Units section.
- The same fix is mirrored in the AS30 builder template so regeneration keeps the workspace CSS aligned.

## Files changed
- `.stax/task.md`
- `.stax/codex-report.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `projects/aboriginal-studies-30/meta/build_sports_style_course.py`
- `projects/aboriginal-studies-30/workspace/styles.css`
- `scripts/tests/aboriginal-studies-30-shell.test.ts`
- `projects/aboriginal-studies-30/meta/visual-checks/as30-responsive-title-progress-css760.png`
- `projects/aboriginal-studies-30/meta/visual-checks/as30-responsive-title-progress-css430.png`
- `projects/aboriginal-studies-30/meta/visual-checks/as30-responsive-title-progress-tablet-760x941.png`
- `projects/aboriginal-studies-30/meta/visual-checks/as30-responsive-title-progress-phone-430x941.png`

## Verification run
- `node node_modules/tsx/dist/cli.mjs --test scripts/tests/aboriginal-studies-30-shell.test.ts`
  - exitCode: 0; 8 tests passed.
- Browser check in the current in-app preview
  - viewport: `792x1974`
  - progress display: `none`
  - first unit title: visible
  - first unit card grid: `128px 582px 48px`
- Browser breakpoint captures
  - `projects/aboriginal-studies-30/meta/visual-checks/as30-responsive-title-progress-css760.png`
  - `projects/aboriginal-studies-30/meta/visual-checks/as30-responsive-title-progress-css430.png`
- `npm run verify -- --project aboriginal-studies-30`
  - exitCode: 0; metadata passed; no missing local assets, embeds, or course-shell resources.
- `npm run test:e2e:project -- --project aboriginal-studies-30`
  - exitCode: 0; 1 Chromium project contract passed.
- `npm run test:e2e:smoke`
  - exitCode: 0; 1 Chromium smoke contract passed.
- `npm run typecheck`
  - exitCode: 0.
- `npm run build:studio`
  - exitCode: 0.
- `git diff --check`
  - exitCode: 0.
- `npm run stax:preflight -- --observer`
  - exitCode: 1; local package is missing script `stax:preflight`.
- STAX sidecar gate
  - exitCode: 0; status `Accept`; proof strength `Audit-grade`.
  - Verified current command evidence for AS30 shell test, project verify, project e2e, smoke e2e, typecheck, studio build, and diff check.
  - Verified current visual evidence for tablet and phone responsive screenshots.

## Known risks / follow-up
- The local `canvas-helper` package does not expose `npm run stax:preflight`; STAX evidence was collected from the STAX tooling repo against this Canvas repo.
- This pass intentionally hides the progress panel only under the tablet/top-sidebar breakpoint. Desktop still keeps the progress panel.
- No deploy, publish, sync, or release action was performed.

## Source-of-truth location
- Active workspace CSS: `projects/aboriginal-studies-30/workspace/styles.css`
- AS30 generator template: `projects/aboriginal-studies-30/meta/build_sports_style_course.py`
- Regression test: `scripts/tests/aboriginal-studies-30-shell.test.ts`
- Active workspace entry: `projects/aboriginal-studies-30/workspace/index.html`

## Fragile areas / what might drift
- Re-running the AS30 builder can regenerate workspace files; keep the builder template and workspace CSS aligned.
- Generic `.stack-card-button` rules can accidentally override `.unit-card` because the cards share both classes.
- Mobile/tablet behavior depends on the `860px`, `760px`, and `640px` breakpoint order.

## Next prompt assumptions
- The user wants the top-sidebar/tablet view to show the Units section without the large course progress panel.
- Unit cards should keep visible titles at all supported widths, even when descriptions are hidden.
- No hosted course behavior has been changed or verified.

## Exact next command
`npm run test:e2e:project -- --project aboriginal-studies-30`

## Exact next file to open
`projects/aboriginal-studies-30/workspace/styles.css`
