# Archived Handoffs

This file retains previous handoffs after the single active handoff was standardized.

## Archive Index

Entries are listed in file order (older to newer within this archive).

- 2026-03-21: projects/forensics/meta/HANDOFF.md
- 2026-03-21: projects/hss1010/meta/HANDOFF.md
- 2026-03-21: projects/calm3new/meta/HANDOFF.md
- 2026-03-21: projects/calm-module-4/meta/HANDOFF.md
- 2026-03-21: docs/ops/ACTIVE_HANDOFF.md (pre-consolidation)
- 2026-03-21: docs/ops/ACTIVE_HANDOFF.md (pre-clarification-policy)
- 2026-03-21: projects/forensics35/meta/HANDOFF.md
- 2026-03-21: docs/ops/ACTIVE_HANDOFF.md (pre-workflow-refactor)
- 2026-03-23: docs/ops/ACTIVE_HANDOFF.md (pre-experimental-psych-conversion)

---

## 2026-03-21 | projects/forensics/meta/HANDOFF.md

# Handoff

- Project: forensics
- Task: split the Module 8 interactive assignment into separate activity files and keep the Module 7 DNA lab responsive
- Status: ready for validation

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module7assignment-app.jsx
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module7assignment.bundle.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module7assignment.html
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module8assignment.html
- /Users/deanguedo/Documents/GitHub/canvas-helper/canvas code and references/forensics/ASSIGMENTS CODE/module8assignment-career-matcher.jsx
- /Users/deanguedo/Documents/GitHub/canvas-helper/canvas code and references/forensics/ASSIGMENTS CODE/module8assignment-day-in-life.jsx
- /Users/deanguedo/Documents/GitHub/canvas-helper/canvas code and references/forensics/ASSIGMENTS CODE/module8assignment-case-role.jsx

## What changed
- Made the Module 7 DNA lab lanes responsive by shrinking the lane width and allowing horizontal scroll instead of clipping the ladder and suspect lanes.
- Expanded the Module 8 page into three interactive formats on the same assignment page: career matcher, day-in-the-life picker, and case-role simulation.
- Added separate source files for those three Module 8 activities in the reference folder so each activity can be opened or reused on its own.

## What still needs validation
- Open Module 7 DNA lab and confirm the ladder, Marker A, and suspect lanes are fully reachable without clipping.
- Open Module 8 assignment and confirm the three activity sections render and switch correctly.
- If you plan to use the split Module 8 source files in Studio, wire them into the app flow.

## Known risks
- The split Module 8 files are reference/source files only and are not yet wired into the workspace navigation.
- `module7assignment.bundle.js` was patched directly to match the JSX source, so any future rebuild should keep the bundle aligned.

## Exact next command
`/Users/deanguedo/Documents/GitHub/canvas-helper/launch-canvas-helper.command`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/workspace/assets/module8assignment.html`

## Do not do next / warnings
- Do not edit `projects/forensics/raw/**` or `projects/resources/forensics/**`.
- Do not overwrite the split Module 8 reference files unless you are intentionally changing their standalone versions.

---

## 2026-03-23 | docs/ops/ACTIVE_HANDOFF.md (pre-experimental-psych-conversion)

# Handoff

- Project: repo-wide
- Task: Tighten clarification-rule precedence so prompt completeness is authoritative and retrieval rules are subordinate
- Status: complete

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/AGENTS.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/.cursor/rules/canvas-mode.mdc
- /Users/deanguedo/Documents/GitHub/canvas-helper/.cursor/rules/default-mode.mdc
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/workflows/prompt-contract.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ARCHIVED_HANDOFFS.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md

## What changed
- Added `Clarification Precedence` to `AGENTS.md` and made clarification policy explicitly authoritative.
- Tightened `Surgical Default Rules` so additional targeted reads inside approved boundaries do not trigger extra questions.
- Added mode-overlay deference lines in `CANVAS` and `DEFAULT` files so overlays tune ambiguity threshold but do not override clarification policy.
- Added prompt-contract precedence note: clarification rule takes priority over read-discipline heuristics inside declared boundaries.

## Why this changed
- To remove residual collision between clarification and surgical-retrieval rules that could still cause unnecessary hesitation.

## Source of truth
- Clarification authority and precedence: `AGENTS.md`
- Mode clarification overlays: `.cursor/rules/canvas-mode.mdc` and `.cursor/rules/default-mode.mdc`
- Prompt-layer clarification precedence: `docs/workflows/prompt-contract.md`

## Fragile areas / watchouts
- This is rule-layer tightening, not runtime enforcement code.
- Behavioral quality still depends on prompt completeness and consistent rule interpretation.

## Next prompt should assume
- If prompt contract fields are complete and non-conflicting, execute without clarification.
- Ask exactly one clarification question only when constraints conflict or the task would cross declared boundaries/source-of-truth constraints.

## What still needs validation
- Behavioral validation on 3 real tasks (`conversion`, `generated-course`, `injection/integration`) to confirm reduced unnecessary questioning.

## Known risks
- This is a rule-layer tightening, not runtime enforcement code.
- Best follow-up is behavioral validation on 3 real tasks (`conversion`, `generated-course`, `injection/integration`) to confirm question frequency drops as intended.

## Exact next command
`rg -n "Clarification Policy|Clarification Precedence|Surgical Default Rules|Clarification Behavior|Clarification Rule" AGENTS.md .cursor/rules/canvas-mode.mdc .cursor/rules/default-mode.mdc docs/workflows/prompt-contract.md`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/AGENTS.md`

## Do not do next / warnings
- Do not add parallel clarification logic in unrelated docs that conflicts with these source-of-truth files.

---

## 2026-03-21 | projects/hss1010/meta/HANDOFF.md

# Handoff

- Project: hss1010
- Task: rebuild Lifestyle into a 5-module interactive section with module-scoped source-support routing and no dump-library fallback
- Status: ready for validation

## Files changed
- scripts/tests/hss1010-conversion.test.ts
- scripts/lib/conversion/hss1010-compose.ts
- projects/hss1010/workspace/index.html
- projects/hss1010/workspace/main.js
- projects/hss1010/workspace/data/course.json
- projects/hss1010/workspace/data/assessment.json
- projects/hss1010/meta/course.json
- projects/hss1010/meta/assessment.json
- projects/hss1010/meta/source-map.json
- projects/hss1010/meta/coverage-report.json
- projects/hss1010/meta/deviation-report.json
- projects/hss1010/meta/deviation-report.md
- projects/hss1010/meta/HANDOFF.md

## What changed
- Updated Lifestyle test expectations to require 5 named modules and activity IDs:
  - Fuel Decisions Lab
  - Movement Under Real Constraints
  - Supplement & Claim Forensics
  - Lifestyle Risk Tradeoff Simulator
  - Assignment Synthesis Studio
  - `data-study-activity="lifestyle-fuel-check"`
  - `data-study-activity="lifestyle-movement-plan"`
  - `data-study-activity="lifestyle-claim-forensics"`
  - `data-study-activity="lifestyle-risk-simulator"`
- Rewired `composeLifestyleSection(...)` to emit hero + all 5 modules instead of the previous hero + 2-module output.
- Added module-specific source-support routing using keyword categorization (`fuel`, `movement`, `forensics`, `risk`, `synthesis`) so supplements are attached to a relevant module instead of a generic deep library.
- Preserved full-content inclusion behavior, including `LIFESTYLE_SUPPLEMENT_PROOF`, while removing the `Lifestyle Deep Content Library` fallback pattern.
- Regenerated HSS1010 workspace/meta artifacts via conversion.

## What still needs validation
- Visual QA in Studio on the Lifestyle tab to verify flow quality and spacing consistency with Wellness/Anatomy.
- Content QA for risk/synthesis support cards because large extracted blocks may still feel dense and may need chunking or activity framing adjustments.
- Post-QA redeploy run for the hosted target when approved.

## Known risks
- Support-card routing is heuristic keyword matching; edge-case blocks can still land in a less-than-ideal module.
- Some extracted source cards are still long and may read as heavy without additional interaction wrappers.
- `projects/hss1010/**` is generated state in this workspace and may not all be intended for commit as-is.

## Exact next command
`npm.cmd run studio`

## Exact next file to open
`C:/Users/dean.guedo/Documents/GitHub/canvas-helper/scripts/lib/conversion/hss1010-compose.ts`

## Do not do next / warnings
- Do not reintroduce `Lifestyle Deep Content Library` or any generic dump section.
- Do not deploy before visual QA confirms the Lifestyle flow quality in Studio.
- Do not edit `projects/<slug>/raw/**` or `projects/<slug>/exports/**` for this task.

---

## 2026-03-21 | projects/calm3new/meta/HANDOFF.md

# Handoff

- Project: repo-wide
- Task: Implement the planned `google-hosted` export target with Firebase-ready runtime, CLI, Studio/server wiring, docs, and smoke/test coverage.
- Status: complete

## Files changed
- scripts/lib/google-hosted.ts
- scripts/lib/exporter.ts
- scripts/export-google-hosted.ts
- scripts/tests/google-hosted-export.test.ts
- scripts/smoke-local-pipeline.ts
- app/server/lib/types.ts
- app/server/lib/command-runner.ts
- app/studio/src/lib/types.ts
- app/studio/src/hooks/useProjectCommands.ts
- package.json
- README.md
- ARCHITECTURE.md
- projects/calm3new/meta/HANDOFF.md

## What changed
- Added `scripts/lib/google-hosted.ts` to generate the hosted runtime bridge, Firebase config templates, hosting config, deploy docs, and HTML bridge injection.
- Added `exportProjectToGoogleHosted(projectSlug)` and `npm.cmd run export:google-hosted -- --project <slug>`.
- Wired `Google Hosted` into Studio/server command routing.
- Added regression coverage for bundle shape, bridge injection, runtime content, and CLI exposure in `scripts/tests/google-hosted-export.test.ts`.
- Extended `npm.cmd run smoke:pipeline` to generate and assert a `projects/<slug>/exports/google-hosted/` bundle.
- Updated `README.md` and `ARCHITECTURE.md` to document the new target and its Firebase deployment boundary.

## What still needs validation
- Manual Firebase deployment and cross-device learner verification on a real school or test Google account.

## Known risks
- The hosted bridge depends on Firebase web config being filled before deployment; placeholder configs fail fast.
- Cross-device resume still depends on school popup-auth policy allowing `signInWithPopup`.
- The bridge relies on detected localStorage keys; projects with nonstandard persistence keys may need targeted adjustment.

## Exact next command
`npm.cmd run export:google-hosted -- --project calm3new`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\exports\google-hosted\README-deploy.md`

## Do not do next / warnings
- Do not deploy the bundle without replacing Firebase placeholder values first.
- Do not broaden Firestore rules beyond `request.auth.uid == userId` for v1.
- Do not assume Google Sites alone provides resume; the persistence contract is Firebase Hosting + Auth + Firestore.

---

## 2026-03-21 | projects/calm-module-4/meta/HANDOFF.md

# Handoff

- Project: calm-module-4
- Task: Finish the CALM Module 4 workspace surface and prepare the remaining Firebase app upload
- Status: blocked

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\calm-module-4\workspace\main.jsx
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\calm-module-4\workspace\main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\calm-module-4\workspace\components\careerplanning.reference.jsx
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\calm-module-4\workspace\components\resourcefulpeople.reference.jsx
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\calm-module-4\workspace\components\masterplan.reference.jsx
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\calm-module-4\workspace\components\resumebuilder.reference.jsx
- C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\calm-module-4\workspace\components\coverletterbuilder.reference.jsx

## What changed
- Added `Career Planner` as the visible label for the `portfolio` unit in the module list and kept it routed to the career-planning activity.
- Inserted `Resourceful People` immediately after `Career Planner` and `Master Plan` immediately after `Resourceful People`.
- Copied the Canvas activity code for `Resourceful People` and `Master Plan` into workspace component files so they render as full activities in the module flow.
- Kept the Resume Builder and Cover Letter Builder activities wired into the same workspace pattern and left their shell behavior responsive.
- Adjusted the Career Planning and Master Plan layouts so they fit better with the open sidebar and the widened workspace shell.
- Rebuilt the workspace bundle and verified the calm-module-4 project contract after the layout and ordering changes.
- The Firebase app upload is still pending. This slug does not yet have a `projects/calm-module-4/meta/google-hosted.deploy.json` file, so the deploy path is not ready yet.

## What still needs validation
- Create `projects/calm-module-4/meta/google-hosted.deploy.json` with the Firebase project id and hosting site id for this module.
- Generate or confirm the Google Hosted export bundle for `calm-module-4` if this upload will use the deploy tool.
- Run the Firebase deploy flow once the deploy config exists.
- Do a final browser pass in Studio with the sidebar open and closed to confirm the wide-shell layout still feels balanced.

## Known risks
- No Firebase deploy config currently exists for `calm-module-4`, so upload to the Firebase app is still blocked.
- The deploy config needs two concrete values (Firebase project id and hosting site id) before any upload can proceed.
- The repo still shows expected external font/CDN warnings in `npm run verify`.
- The workspace now depends on several copied activity components, so future layout changes should preserve the current unit order and shell assumptions.

## Exact next command
`npm.cmd run deploy:google-hosted`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\calm-module-4\meta\google-hosted.deploy.json`

---

## 2026-03-21 | docs/ops/ACTIVE_HANDOFF.md (pre-clarification-precedence-tightening)

# Handoff

- Project: repo-wide
- Task: Complete workflow operating-system refactor and deterministic clarification policy, then leave one clean continuation point
- Status: ready for validation

## Exact next command
`npm run validate:manifests`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/docs/workflows/prompt-contract.md`

---

## 2026-03-21 | docs/ops/ACTIVE_HANDOFF.md (pre-consolidation)

# Handoff

- Project: repo-wide
- Task: Add deterministic clarification-question policy to rule and prompt layers without widening scope
- Status: complete

## Exact next command
`rg -n "Clarification Policy|Clarification Behavior|Clarification Rule" AGENTS.md .cursor/rules/canvas-mode.mdc .cursor/rules/default-mode.mdc docs/workflows/prompt-contract.md`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/docs/workflows/prompt-contract.md`

---

## 2026-03-21 | docs/ops/ACTIVE_HANDOFF.md (pre-clarification-policy)

# Handoff

- Project: repo-wide
- Task: Refactor Canvas Helper operating model around workflow-aware rules, enforceable source-of-truth metadata, and two-mode prompting
- Status: ready for validation

## Exact next command
`npm run validate:manifests`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/docs/workflows/prompt-contract.md`

## Do not do next / warnings
- Do not edit `projects/calm-module-4/raw/**` or `projects/calm-module-4/exports/**` by hand.
- Do not attempt the Firebase upload until the deploy config file exists and the project/site ids are confirmed.

---

## 2026-03-21 | projects/forensics35/meta/HANDOFF.md

# Handoff

- Project: forensics35
- Task: restore full lesson content rendering in workspace and Google Hosted export, keep assignment/module filters, and publish stable hosting build
- Status: complete

## Files changed
- projects/forensics35/workspace/main.jsx
- projects/forensics35/workspace/main.js
- scripts/lib/exports/google-hosted.ts
- projects/forensics35/meta/google-hosted.deploy.json
- publish-forensics35.bat

## What changed
- Fixed Google Hosted exporter reference copying so deploys include course reference assets (assignment/quiz/content roots, Cyrillic `сontent` handling, manifest copy) instead of shipping only app shell files.
- Published `forensics35` after exporter fix; export included full reference payload and hosting release completed successfully on 2026-03-19.
- Updated workspace runtime path resolution to try `content`, Cyrillic `сontent`, and mojibake `Ñontent` variants so local workspace loads full lesson bodies instead of snippet fallback.
- Kept module cleanup behavior already requested in this session (excluded sections/extra assignment noise/final exam and removed broken progress UI).

## Verification run
- `./publish-forensics35.bat` (2026-03-19): export succeeded with 778 files; Firebase Hosting deploy succeeded with 773 hosted files and live release for site `forensics35`.

## What still needs validation
- Manual click-through in Studio workspace for Modules 1-6 to confirm each content page renders full body text (not snippet-only fallback) after hard refresh.
- Spot-check one assignment and one quiz per module for expected render mode and source loading.

## Known risks
- Legacy source paths still include mixed encodings in Brightspace exports; future imports may require the same root-variant fallback logic.
- Browser cache can present old bundle behavior until hard refresh/incognito reload.

## Exact next command
`./publish-forensics35.bat`

## Exact next file to open
`projects/forensics35/workspace/main.jsx`

## Do not do next / warnings
- Do not edit `projects/forensics35/raw/**`.
- Do not manually edit generated files under `projects/forensics35/exports/**`; regenerate via export/deploy scripts.

---

## 2026-03-21 | docs/ops/ACTIVE_HANDOFF.md (pre-workflow-refactor)

# Handoff

- Project: calm-module-4
- Task: Finish the CALM Module 4 workspace surface and prepare the remaining Firebase app upload
- Status: blocked

## Known risks
- No Firebase deploy config currently exists for `calm-module-4`, so upload to the Firebase app is still blocked.
- The deploy config needs two concrete values (Firebase project id and hosting site id) before any upload can proceed.

## Exact next command
`npm.cmd run deploy:google-hosted`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas helper\projects\calm-module-4\meta\google-hosted.deploy.json`
