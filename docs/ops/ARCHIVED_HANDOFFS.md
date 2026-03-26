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
- 2026-03-24: docs/ops/ACTIVE_HANDOFF.md (pre-experimental-psych-module1-lock-in)
- 2026-03-24: docs/ops/ACTIVE_HANDOFF.md (pre-experimental-psych-style-refinement)

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

---

## 2026-03-24 | docs/ops/ACTIVE_HANDOFF.md (pre-experimental-psych-style-refinement)

# Handoff

- Project: experimental-psych-30-per-1-a-b-sec-s-202632352
- Task: Lock module framing first (content then assignments) and harden planning derivation/linking so Experimental Psych can expand module-by-module using the forensics process
- Status: complete

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/curriculum-heuristics.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/course-blueprint.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/assessment-map.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-course-shell.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/course-shell.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/tests/course-planning.test.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/d2l-course-map.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/d2l-course-map.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/course-blueprint.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/assessment-map.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/lesson-packets/index.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/lesson-packets/unit-1--some-scientists-the-most-problematic-statistical-illusion-relates-to-ob-cc1840f3.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/lesson-packets/unit-2--use-unit-2-answer-key-experimental-psychology-30-assignment-2-concepts-59dd4c3d.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/lesson-packets/unit-3--use-unit-3-answer-key-experimental-psychology-30-assignment-3-concepts-4404f3a7.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/lesson-packets/unit-4--use-unit-4-answer-key-experimental-psychology-30-assignment-4-concepts-2076bdd0.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/course-shell-data.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ARCHIVED_HANDOFFS.md

## What changed
- Hardened unit/module number detection to parse `Module N`, `Unit N`, and shorthand `M#`/`U#` patterns during planning.
- Added outline segmentation fallback that can derive units from `Module`/`Unit` headers when `Assignment #N Overview` blocks are missing.
- Added deterministic assessment linking: explicit module/unit number match is applied first, keyword fallback only when explicit match is absent.
- Added shell-build lock guard: if generated shell collapses to one module while multiple module/unit numbers are detectable, build fails unless `--allow-single-module-lock` is passed.
- Updated module rendering framing for Experimental Psych: active module now always renders `Module Content` first and `Assignments` second in stacked sections.
- Added explicit empty states: `No content found in this module.` and `No assignments found in this module.`
- Removed global content/assignment mode toggle for Experimental Psych and kept module-local grouping behavior.
- Filtered non-instructional course-map modules from the generated shell so the workspace now keeps only the core modules and content, excluding `Course Information`, `Extra Credits`, and hidden teacher-resource buckets.
- Hydrated the shell with full extracted content bodies so workspace rendering can show the real lesson and assignment text instead of preview snippets.
- Reworked the workspace renderer to present content as readable article blocks and removed the Brightspace-style mark-complete controls.
- Reworked the workspace renderer again to remove wall-of-text behavior: each module section now uses an item list + selected-content reader pane, and HTML lessons load from source files with sanitized structure so headings, emphasis, and images render closer to Brightspace.
- Removed the duplicate inner sidebar from the workspace layout and moved lesson/assignment navigation into the active module card dropdown in the single left module rail.
- Added module-card click toggle behavior (expand/collapse on repeat click) and a topbar hamburger control to hide/show the main module sidebar for wider reading space.
- Added section-title propagation from nested Brightspace section folders into generated course-shell activities.
- Updated module dropdown rendering to group lessons by section title and added subsection-level collapse/uncollapse controls.
- Persisted subsection collapse state in local storage so expanded/collapsed section state survives rerenders.
- Regenerated `workspace/course-shell-data.js` so activities now carry `sectionTitle` metadata.
- Regenerated planning artifacts in strict order (`d2l-map -> blueprint -> assessment-map -> lesson-packets -> build:course-shell`).
- Added/updated planning tests to cover number extraction and deterministic explicit assessment-to-unit mapping.
- Added shell-plan regression coverage for excluding course information, extra credits, and hidden teacher modules.
- Added shell-plan regression coverage for section-title propagation from nested course-map folders.

## Why this changed
- The project needed the same forensics workflow gate: structure lock first, then expansion.
- Experimental Psych framing needed to match module-local assignment grouping before adding more module content.
- The previous derivation risked collapsing structure when heading styles differed from `Assignment #N Overview` patterns.

## Source of truth
- Canonical editable entry: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js`
- Canonical planning logic: `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/course-blueprint.ts`, `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/assessment-map.ts`, `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/curriculum-heuristics.ts`, `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-course-shell.ts`
- Generated shell artifact: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/course-shell-data.js` (regenerate; do not hand-edit)

## Fragile areas / watchouts
- Course map ordering can still reflect source title ambiguity where titles lack explicit module numbers (for this dataset, `Extra Credits` appears before `Module 4` because `Extra Credits` has no explicit sequence label).
- Assignment classification still depends on metadata (`kind/resourceKind/renderHint`) and may need further tightening if imports use nonstandard labels.
- The archived backup `projects/processed/experimental-psych-30-per-1-a-b-sec-s-202632352/source.backup-20260324-073924/` is safety state and should not be committed.

## Next prompt should assume
- Module 1 framing lock is implemented and validated in automation.
- The workspace shell now shows only the core instructional modules and content.
- The workspace now renders full lesson and assignment bodies rather than preview cards and completion toggles.
- The workspace now renders one selected lesson/assignment at a time in a dedicated reader pane instead of expanding all items inline.
- The workspace uses one module sidebar only; content and assignments for the active module are selected from that module's dropdown.
- Module dropdowns now expand inline without an internal scroll box, so expanded modules push subsequent modules down in the same rail.
- Section headings inside expanded modules are now clickable and can be collapsed/uncollapsed independently.
- Expansion to modules `2+` should reuse this framing and bucketing behavior without one-off UI overrides.
- Planning artifacts should continue to be regenerated by pipeline commands, not hand-edited.

## What still needs validation
- Manual Studio QA for Module 1 readability and framing against the forensics reference surface.
- Manual Studio QA for section-group collapse behavior (expanded by default, toggle close/open, selection continuity after toggle).
- Human sign-off on final HTML sanitization/display rules for edge-case lesson pages that include template-specific assets or unusual inline markup.
- Project E2E contract run currently cannot execute for this slug until `projects/<slug>/meta/e2e-contract.json` exists.

## Known risks
- If source titles stay inconsistent, auto-sequencing may still produce edge-case ordering within the remaining instructional modules, even though the non-instructional buckets are now excluded.
- Contract-driven E2E remains blocked for this project due to missing `meta/e2e-contract.json`.
- Existing unrelated repo changes remain in working tree and were intentionally excluded from scoped commit.

## Exact next command
`npm run studio`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js`

## Do not do next / warnings
- Do not edit `projects/experimental-psych-30-per-1-a-b-sec-s-202632352/raw/**`.
- Do not hand-patch `workspace/course-shell-data.js`; rerun the planning pipeline.
- Do not commit the processed source backup directory.

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

---

## 2026-03-24 | docs/ops/ACTIVE_HANDOFF.md (pre-experimental-psych-module1-lock-in)

# Handoff

- Project: experimental-psych-30-per-1-a-b-sec-s-202632352
- Task: Build the initial conversion pass for the imported Experimental Psychology 30 D2L export and make the planning artifacts filesystem-safe
- Status: complete

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/curriculum-heuristics.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/scripts/tests/course-planning.test.ts
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/project.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/d2l-course-map.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/d2l-course-map.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/course-blueprint.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/assessment-map.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/lesson-packets/index.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/lesson-packets/unit-1--some-scientists-the-most-problematic-statistical-illusion-relates-to-ob-cc1840f3.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/course-shell-data.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/index.html
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/import-log.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/prompt-pack.md

## What changed
- Imported the D2L ZIP into `projects/incoming/experimental-psych-30-per-1-a-b-sec-s-202632352` using `bsdtar` because the archive used nonstandard encoded folder names that `unzip` could not extract on macOS.
- Created the new conversion project and generated D2L mapping, course blueprint, assessment map, lesson packets, and course shell data for the imported course.
- Replaced the raw imported page with a custom course shell in `workspace/index.html` and `workspace/main.js` that reads the generated shell data, browses modules and activities, and tracks local completion state.
- Updated the project manifest so `workspace/main.js` is a canonical source, `workspace/course-shell-data.js` is a generated output, and the regen command is recorded.
- Fixed `toStableId(...)` so very long extracted statements are truncated and hashed, which keeps lesson packet filenames under filesystem limits without changing the underlying learning text.
- Added a regression test that proves long extracted statements still produce safe, repeatable stable IDs.

## Why this changed
- The imported D2L export needed a working conversion baseline, not just raw intake.
- The first lesson-packet build failed because one outcome title was derived from an extremely long extracted statement, so the ID generator needed to become filesystem-safe.

## Source of truth
- Canonical editable source: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/index.html`
- Canonical source files currently tracked in the manifest: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/index.html`, `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js`
- Generated planning artifacts: `projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/**`
- Derived build output: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/course-shell-data.js`

## Fragile areas / watchouts
- The D2L import still references shared HTML template assets that are not present locally, so verify warnings will continue until those paths are replaced or removed.
- OCR fallback is unavailable in this environment, so PDF-derived references that need OCR may remain under-processed.
- The blueprint currently collapsed to one unit, which means the next conversion pass likely needs manual structure refinement if the course should reflect the full 7-module D2L outline.

## Next prompt should assume
- The import and first planning pass are complete.
- The workspace now has a dedicated course shell; next work should focus on content refinement, module naming, and any manual restructuring needed to better match the full D2L export.

## What still needs validation
- Studio review of `workspace/index.html`, `workspace/main.js`, and `workspace/course-shell-data.js`.
- Manual refinement of the course structure if the one-unit blueprint is too compressed for the actual course intent.

## Known risks
- The imported course content may still need substantial human-guided normalization because the automated blueprint is overly coarse.
- Generated planning artifacts are derived output and should be regenerated rather than edited by hand.

## Exact next command
`npm run studio`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js`

## Do not do next / warnings
- Do not edit `projects/experimental-psych-30-per-1-a-b-sec-s-202632352/raw/**`.
- Do not hand-patch generated planning outputs unless you are intentionally fixing a regeneration bug.
- Do not treat the current one-unit blueprint as authoritative for final course structure without review.
