# Handoff

- Project: `forensicstudiesoption2` and `general-psychology-20-independent-studies-202633108`
- Task: Match condensed sidebar behavior to the Forensics 35 responsive sidebar pattern.
- Status: complete locally, ready for hosted export/deploy if requested

## Files changed
- `projects/forensicstudiesoption2/workspace/main.js`
- `projects/forensicstudiesoption2/workspace/styles.css`
- `projects/general-psychology-20-independent-studies-202633108/workspace/main.js`
- `scripts/tests/forensicstudiesoption2-theme.test.ts`
- `scripts/tests/general-psychology-workspace.test.ts`
- `.stax/task.md`
- `.stax/codex-report.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed
- Aligned Forensic Studies 25 option2 compact navigation to the Forensics 35 breakpoint pattern: desktop left rail remains collapsible, while tablet and phone widths use the top navigation shell.
- Fixed the option2 tablet mismatch by changing the compact navigation query and CSS breakpoint to `max-width: 1023px`.
- Changed General Psychology compact navigation from a side overlay drawer to a top menu shell at `max-width: 1023px`.
- Kept General Psychology desktop behavior as a collapsible left rail.
- Kept the existing General Psychology Forensics-style quiz formatting intact.

## Why this changed
- The user reported that Forensic Studies 25 option2 worked on desktop and smaller phone widths, but the in-between tablet width broke. They asked for the sidebar to go to the top when condensed and for the Forensics 35 all-size sidebar behavior to be applied to General Psychology too.

## Source of truth
- Forensic Studies option2 shell: `projects/forensicstudiesoption2/workspace/index.html`
- Forensic Studies option2 behavior: `projects/forensicstudiesoption2/workspace/main.js`
- Forensic Studies option2 styling: `projects/forensicstudiesoption2/workspace/styles.css`
- General Psychology shell: `projects/general-psychology-20-independent-studies-202633108/workspace/index.html`
- General Psychology behavior/styling: `projects/general-psychology-20-independent-studies-202633108/workspace/main.js`

## Fragile areas / watchouts
- Forensic Studies option2 depends on the JS compact query and CSS breakpoint staying aligned.
- General Psychology now uses `compact-sidebar-open` for tablet/phone menu expansion; do not reintroduce the old side drawer transform rules.
- The in-app browser was opened to the local General Psychology preview during validation; hosted pages were not redeployed.

## Next prompt should assume
- Local workspace previews are updated and verified.
- The wider checkout remains dirty with unrelated `.stax/`, processed snapshot, and metadata noise.
- Do not stage broad dirty state; stage only the sidebar-related course files/tests/handoff/report files if committing this task.

## What still needs validation
- User visual acceptance in the Studio Tablet and Mobile controls.
- Hosted export/deploy if the user wants these sidebar changes live on Firebase.

## Known risks
- The rendered proof script validates the responsive behavior at 1180px, 820px, and 390px; it does not exhaust every possible viewport width.
- Existing external font/CDN warnings remain in project verification.
- STAX observer preflight cannot run from this repo because `stax:preflight` is not an available npm script.

## Exact next command
`npm run export:google-hosted -- --project forensicstudiesoption2,general-psychology-20-independent-studies-202633108`

## Exact next file to open
`projects/general-psychology-20-independent-studies-202633108/workspace/main.js`

## Do not do next / warnings
- Do not edit `projects/<slug>/raw/**`.
- Do not deploy unless the user explicitly asks for hosted refresh.
- Do not treat unrelated dirty files under `projects/processed/**` as part of this task.
