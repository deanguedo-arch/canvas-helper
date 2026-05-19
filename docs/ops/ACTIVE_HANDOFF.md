# Active Handoff

## Summary
Repaired and redeployed the active Google-hosted course sidebar save/sign-in behavior. The shared bridge now embeds into explicit sidebar hosts or known sidebar roots, Forensics 25 no longer has the duplicate top summary bar, and the follow-up CALM Module 2, CALM Module 3, and Sports Wellness regressions were fixed and live-verified. Auto color-matching is now also enabled so sign-in/save controls inherit sidebar theme colors per course at runtime.

## Files changed
- `scripts/lib/google-hosted.ts`
- `scripts/tests/google-hosted-export.test.ts`
- `scripts/tests/calm-google-hosted-sidebar-hosts.test.ts`
- `scripts/tests/calm-module-workspace.test.ts`
- `scripts/tests/sportswellness-google-hosted.test.ts`
- `scripts/tests/forensicstudiesoption2-theme.test.ts`
- `projects/calm-module/workspace/main.jsx`
- `projects/calmmodule2/workspace/main.jsx`
- `projects/calm3new/workspace/index.html`
- `projects/calm3new/workspace/styles.css`
- `projects/sportswellness/workspace/index.html`
- `projects/sportswellness/workspace/styles.css`
- `projects/forensicstudiesoption2/workspace/index.html`
- `projects/forensicstudiesoption2/workspace/styles.css`
- Generated Google-hosted export files under affected `projects/*/exports/google-hosted/`
- `.stax/task.md`
- `.stax/codex-report.md`

## Verification run
- Focused sidebar/save-control tests passed: 40 tests, 40 pass.
- Forensics 25/Google-hosted focused tests passed: 65 tests, 65 pass.
- `npm run verify -- --project sportswellness` passed.
- `npm run verify -- --project calmmodule2` passed.
- `npm run verify -- --project calm3new` passed.
- `npm run verify -- --project forensicstudiesoption2` passed.
- `npm run typecheck` passed.
- `npm run build:studio` passed.
- `npm run test:e2e:project -- --project sportswellness` passed.
- `npm run test:e2e:smoke` passed.
- Google-hosted exports and deploys completed for the active course sites, then CALM Module 2, CALM Module 3, and Sports Wellness were redeployed after the follow-up fixes.
- CALM Module 1 was also re-exported/redeployed after the broad live check caught its floating fallback.
- Live browser verification passed for `https://calm-module-one.web.app`, `https://calmmodule2.web.app`, `https://calm3new.web.app`, and `https://sportwellness.web.app`.

## Known risks / follow-up
- Firebase sign-in was not completed with a real Google account.
- `npm run stax:preflight -- --mode observer` cannot run because this repo does not expose that npm script.
- A pre-existing CALM Module 2 cleanup test still fails on `Supplementary Evidence (Optional)` when that older test is run directly.

## Source-of-truth location
- Shared bridge source: `scripts/lib/google-hosted.ts`
- CALM Module 2 canonical source: `projects/calmmodule2/workspace/main.jsx`
- CALM Module 3 canonical source: `projects/calm3new/workspace/index.html` and `projects/calm3new/workspace/styles.css`
- Sports Wellness canonical source: `projects/sportswellness/workspace/index.html` and `projects/sportswellness/workspace/styles.css`
- Forensics 25 canonical source: `projects/forensicstudiesoption2/workspace/index.html` and `projects/forensicstudiesoption2/workspace/styles.css`

## Fragile areas / what might drift
- Generated `exports/google-hosted/` files must be regenerated after workspace edits.
- React-rendered sidebars need explicit `[data-google-hosted-controls-host]` slots to avoid floating fallback behavior.
- Sports Wellness bar behavior depends on its existing responsive body classes.

## Next prompt assumptions
- User will hard refresh hosted pages before judging the latest deployed behavior.
- Future fixes should continue targeting explicit sidebar host slots instead of broad direct-child sidebar styling.

## Exact next command
`npm run deploy:google-hosted -- --project calmmodule2,calm3new,sportswellness`

## Exact next file to open
`scripts/lib/google-hosted.ts`
