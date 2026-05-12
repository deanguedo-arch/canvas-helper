# Handoff

- Project: psychology and forensics hosted course refresh
- Task: retain recovered local course work, add the General Psychology theme toggle pattern to Experimental Psychology, export/deploy active hosted targets, then commit and push
- Status: complete

## Summary
- Restored the missing General Psychology local guards caught by regression tests: authoring unlock stays off by default, and the final project PDF remains content instead of being moved into assignments.
- Added the persisted `Current` / `Next Step` theme toggle to Experimental Psychology 30, matching the General Psychology pattern and keeping the current theme as the default.
- Re-exported and deployed the active hosted targets: General Psychology 20, Experimental Psychology 30, Forensic Studies 35, and Forensic Studies 25 option2.
- Excluded calm, AI, sports, and the old duplicate `forensics` slug from deploy. The old `forensics` project targets the same `forensics25` hosting site and would overwrite option2.

## Files changed
- `projects/general-psychology-20-independent-studies-202633108/workspace/main.js`
- `projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js`
- `scripts/tests/experimental-psych-workspace.test.ts`
- Export-gate metadata timestamps and deviation reports under the four deployed projects' `meta/` folders
- `docs/ops/ACTIVE_HANDOFF.md`

## Verification run
- `npx.cmd tsx --test scripts/tests/experimental-psych-workspace.test.ts`
- `npx.cmd tsx --test scripts/tests/general-psychology-workspace.test.ts`
- `npx.cmd tsx --test scripts/tests/forensicstudiesoption2-theme.test.ts`
- `npm.cmd run test:forensics35-workspace`
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`
- `npm.cmd run validate:manifests`
- `npm.cmd run test:e2e:project -- --project general-psychology-20-independent-studies-202633108`
- `npm.cmd run test:e2e:project -- --project forensics35`
- `npm.cmd run test:e2e:project -- --project forensicstudiesoption2`
- `npm.cmd run export:google-hosted -- --project general-psychology-20-independent-studies-202633108`
- `npm.cmd run export:google-hosted -- --project experimental-psych-30-per-1-a-b-sec-s-202632352`
- `npm.cmd run export:google-hosted -- --project forensics35`
- `npm.cmd run export:google-hosted -- --project forensicstudiesoption2`
- `npm.cmd run deploy:google-hosted -- --project general-psychology-20-independent-studies-202633108`
- `npm.cmd run deploy:google-hosted -- --project experimental-psych-30-per-1-a-b-sec-s-202632352`
- `npm.cmd run deploy:google-hosted -- --project forensics35`
- `npm.cmd run deploy:google-hosted -- --project forensicstudiesoption2`
- Live marker checks:
  - `https://generalpsychology.web.app/main.js` contains `AUTHORING_UNLOCK_ALL = false`
  - `https://experimentalpsychology.web.app/main.js` contains `COURSE_THEME_MODES`
  - `https://forensics35.web.app/main.js` contains `Forensic Studies 35`
  - `https://forensics25.web.app/` contains `Forensic Studies 25`

## Known risks / follow-up
- Experimental Psychology has no project E2E contract, so coverage is a focused source test plus hosted marker verification.
- Firebase CLI deploy prints Node deprecation warnings for existing tooling dependencies; deploys still completed successfully.
- `forensics` and `forensicstudiesoption2` both map to the `forensics25` Firebase site. Use `forensicstudiesoption2` as the active deploy source unless explicitly reverting to the older project.

## Source-of-truth location
- General Psychology editable source: `projects/general-psychology-20-independent-studies-202633108/workspace/main.js`
- Experimental Psychology editable source: `projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js`
- Forensic Studies 35 editable source: `projects/forensics35/workspace/`
- Forensic Studies 25 option2 editable source: `projects/forensicstudiesoption2/workspace/`
- Hosted export output: `projects/<slug>/exports/google-hosted/`

## Fragile areas / what might drift
- General Psychology lock behavior depends on keeping `AUTHORING_UNLOCK_ALL = false` and avoiding unlock-all shortcuts in module completion.
- General Psychology final project PDFs should stay in the content sequence even though title heuristics still recognize final-project text.
- Experimental Psychology now stores theme mode in the existing workspace storage key; future state migrations should preserve `themeMode`.
- The active Forensics 25 deploy is `forensicstudiesoption2`, not the older `forensics` project.

## Next prompt assumptions
- The active hosted targets remain General Psychology 20, Experimental Psychology 30, Forensic Studies 35, and Forensic Studies 25 option2.
- Calm courses, AI presentation resources, Sports Wellness, and the old duplicate `forensics` slug stay out of deploy unless named explicitly.

## Exact next command
`git status --short --branch`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\experimental-psych-30-per-1-a-b-sec-s-202632352\workspace\main.js`
