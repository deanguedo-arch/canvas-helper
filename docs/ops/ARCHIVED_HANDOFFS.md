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
- 2026-03-26: docs/ops/ACTIVE_HANDOFF.md (pre-experimental-psych-assessment-delivery)
- 2026-03-26: docs/ops/ACTIVE_HANDOFF.md (pre-experimental-psych-release-conditions)
- 2026-03-26: docs/ops/ACTIVE_HANDOFF.md (pre-headroom-resume-prompt)
- 2026-03-27: docs/ops/ACTIVE_HANDOFF.md (pre-experimental-psych-hide-external-handins)
- 2026-03-28: docs/ops/ACTIVE_HANDOFF.md (pre-calmmodule2-responsive-sidebar-fix)
- 2026-03-28: docs/ops/ACTIVE_HANDOFF.md (pre-calmmodule2-activity-restore)
- 2026-03-28: docs/ops/ACTIVE_HANDOFF.md (pre-firebase-relaunch-batch)
- 2026-03-29: docs/ops/ACTIVE_HANDOFF.md (pre-calm-life-adventure-prototype)
- 2026-03-29: docs/ops/ACTIVE_HANDOFF.md (pre-calm-life-adventure-module1-rebuild)
- 2026-03-29: docs/ops/ACTIVE_HANDOFF.md (pre-calm-life-adventure-agi-parser-rebuild)
- 2026-03-29: docs/ops/ACTIVE_HANDOFF.md (pre-calm-life-adventure-parser-leniency-art-pass)
- 2026-03-29: docs/ops/ACTIVE_HANDOFF.md (pre-calm-life-adventure-agi-screen-rebuild)
- 2026-03-29: docs/ops/ACTIVE_HANDOFF.md (pre-calm-life-adventure-view-asset-extraction)
- 2026-03-29: docs/ops/ACTIVE_HANDOFF.md (pre-calm-life-adventure-pic-background-extraction)
- 2026-03-29: docs/ops/ACTIVE_HANDOFF.md (pre-calm-life-adventure-room-remap-stripdown)
- 2026-04-13: docs/ops/ACTIVE_HANDOFF.md (pre-repo-plan-status-handoff)
- 2026-04-16: docs/ops/ACTIVE_HANDOFF.md (pre-mentalwellness10-option2-phase2-lesson-quiz)
- 2026-04-16: docs/ops/ACTIVE_HANDOFF.md (pre-mentalwellness10-option2-phase2-assignment-alignment)
- 2026-04-16: docs/ops/ACTIVE_HANDOFF.md (pre-mentalwellness10-option2-phase3-assignment-parity)
- 2026-04-16: docs/ops/ACTIVE_HANDOFF.md (pre-mentalwellness10-option2-phase4a-assignment-parity)
- 2026-04-16: docs/ops/ACTIVE_HANDOFF.md (pre-mentalwellness10-option2-phase4b-assignment-parity)
- 2026-04-16: docs/ops/ACTIVE_HANDOFF.md (pre-mentalwellness10-option2-final-assignment-consistency-pass)
- 2026-04-17: docs/ops/ACTIVE_HANDOFF.md (pre-sportswellness-image-sizing)
- 2026-04-17: docs/ops/ACTIVE_HANDOFF.md (pre-worldreligions30-option1-quiz-completion-counter)

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

---

## 2026-04-17 | docs/ops/ACTIVE_HANDOFF.md (pre-worldreligions30-option1-quiz-completion-counter)

# Handoff

- Project: sportswellness
- Task: Reduce the lesson image footprint across the Sports Wellness phases without changing the lesson content structure.
- Status: in progress

## Files changed
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed
- Archived the previous `sportswellness` rename-and-phase3 parity handoff in `docs/ops/ARCHIVED_HANDOFFS.md`.
- Recorded the current investigation state for the lesson image-sizing pass.
- Preserved the exact resume question so the next session can start from the same decision point without re-discovery.

## Why this changed
- The current task shifted from phase content parity into UI refinement.
- The user explicitly asked for an active handoff that resumes at the image-sizing decision point.

## Source of truth
- Shared lesson image markup: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\main.js`
- Shared lesson image sizing rules: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\styles.css`
- Active session handoff: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md`

## Fragile areas / watchouts
- `.reading-hero-figure`, `.reading-media-grid`, `.reading-figure`, and their shared `img` rules are reused across phases, so one CSS change affects all authored lesson views.
- Lesson figure markup is rendered centrally from `renderPhaseDetail()` in `main.js`, so markup changes there have a broader blast radius than a CSS-only pass.
- The goal is a sizing refinement only. Do not remove images, captions, or alter the phase content structure.

## Next prompt should assume
- `sportswellness` is the only active Sports Wellness project slug.
- No production behavior has been changed yet for this image-sizing task.
- The shared selectors already identified are:
  - `projects/sportswellness/workspace/styles.css` around `.reading-hero-figure`, `.reading-figure`, and `.reading-media-grid`
  - `projects/sportswellness/workspace/main.js` inside `renderPhaseDetail()`

## What still needs validation
- The user needs to answer whether the reduction should apply only to the large top hero image, or to both the hero image and the in-section figures/cards across all phases.
- After that decision, implement with a targeted test-first pass and run targeted verification plus `build:studio`.

## Known risks
- Overshrinking figures could hurt readability for diagrams that need detail.
- If the change is too broad, it could make the lesson rhythm feel cramped instead of just more controlled.

## Exact next command
`rg -n "reading-hero-figure|reading-media-grid|reading-figure" projects/sportswellness/workspace/styles.css projects/sportswellness/workspace/main.js`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md`

## Do not do next / warnings
- Do not edit `projects/sportswellness/raw/**`.
- Do not resize individual phase images one by one unless the shared CSS path proves insufficient.
- Do not start implementation until the sizing scope question below is answered.

## Resume cue
Start from this exact prompt:

`I found the shared image styles, so this is a single sizing system rather than phase-by-phase content edits.

One question before I change it: do you want only the large top hero image reduced, or do you want both the hero image and the in-section figures/cards scaled down across all phases?`
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

## 2026-03-26 | docs/ops/ACTIVE_HANDOFF.md (pre-headroom-resume-prompt)

# Handoff

- Project: experimental-psych-30-per-1-a-b-sec-s-202632352
- Task: Add lesson completion tracking, module release-condition progress, and assignment-tab gating to the Experimental Psych workspace
- Status: ready for validation

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ARCHIVED_HANDOFFS.md

## What changed
- Added explicit lesson completion state to the workspace so non-assignment lesson items can be marked complete from the end of the reader.
- Added completed-state indicators to lesson items in the module list.
- Replaced the module-card assignment count chip with a release-condition progress block that shows completed lessons, module percentage, and assignment unlock status.
- Added a forensics-style module view switcher inside expanded modules with `Content` and `Assignments` tabs.
- Locked the assignments tab until a module reaches 100% completion across its visible lesson items.
- Kept assignment items inside their module, but moved access behind the release condition instead of always showing them in the dropdown.
- Preserved the existing single-sidebar/module-dropdown structure and current assessment-delivery behavior.

## Verification run
- `node --check projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js`

## Known risks / follow-up
- Release progress currently counts all visible lesson items in a module, including section summaries and PDF/html readings; if you want a narrower definition of “required lesson,” that should be encoded explicitly next.
- The assignments tab is disabled until full completion, but the Google Classroom/Docs destinations still depend on real URLs being added in `workspace/assessment-delivery.js`.
- Manual Studio QA is still needed for sidebar density, mobile spacing, and the lesson-completion footer.

## Source-of-truth location
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/assessment-delivery.js

## Fragile areas / what might drift
- Completion and view state are stored in local storage alongside the existing selection state, so future state-shape edits should keep migration compatibility in mind.
- Module progress is based on `getModuleBuckets(module).content`, so any later changes to hidden items or content filtering will also change release conditions.

## Next prompt assumptions
- Lesson completion is now explicit, not inferred automatically.
- Modules unlock their assignments tab only at 100% content completion.
- The old `3 assignments` chip is gone from module cards and replaced by a release-condition progress bar.

## Exact next command
- `npm run studio`

## Exact next file to open
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js`

---

## 2026-03-27 | docs/ops/ACTIVE_HANDOFF.md (pre-experimental-psych-hide-external-handins)

# Handoff

- Project: repo-wide
- Task: Add a resume-time Headroom prompt to the ops workflow so Cursor/Codex sessions ask before starting Headroom
- Status: complete

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/session-checklist.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/README.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ARCHIVED_HANDOFFS.md

## What changed
- Added a `Before You Change Code` step requiring a one-time Headroom prompt after reading `ACTIVE_HANDOFF.md` when resuming in Cursor or Codex and Headroom is available.
- Made the rule explicit that Headroom should not start automatically during handoff restore.

---

## 2026-03-29 | docs/ops/ACTIVE_HANDOFF.md (pre-calm-life-adventure-agi-screen-rebuild)

# Handoff

- Project: calm-life-adventure
- Task: Add parser leniency and replace the rough block scenes with more illustrated AGI-style room art for the Module 1 slice
- Status: ready for validation

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/styles.css
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ARCHIVED_HANDOFFS.md

## What changed
- Added fuzzy parser normalization so commands no longer need to match the exact phrase; the runtime now tolerates near-miss spellings, extra filler words, and rough natural phrasing before resolving the verb/noun pair.
- Expanded the command grammar with additional synonyms and phrase normalization so input like `check out the desk`, `grab planner`, or `head to office` can still land on the intended action.
- Reworked noun resolution to fuzzy-match room objects, exits, and inventory aliases instead of requiring exact alias text.
- Replaced the hard block scene backgrounds with inline illustrated SVG room art for the bedroom, hallway, classroom, and counselor office.
- Softened the hotspot treatment and shifted the screen typography so the rooms feel less like wireframes and more like authored retro scenes.

## Verification run
- `node --check projects/calm-life-adventure/workspace/main.js`
- `npx tsx -e "import { loadProjectManifest } from './scripts/lib/projects.ts'; const main = async () => { const manifest = await loadProjectManifest('calm-life-adventure'); console.log(manifest.slug, manifest.workspaceEntrypoint); }; main().catch((error) => { console.error(error); process.exit(1); });"`

## Why this changed
- The user specifically asked for leniency in typed input and called out that the previous rooms still looked nothing like a real Leisure Suit Larry/AGI-inspired scene.
- This pass tightens the interaction quality and moves the art direction closer to a usable retro adventure reference without changing the Module 1 puzzle structure again.

## Source of truth
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/index.html
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/styles.css

## Fragile areas / watchouts
- The parser is more forgiving now, but it is still a bounded prototype grammar rather than a full freeform parser.
- The rooms are illustrated SVG backdrops, not imported AGI scene assets, so they are still interpretive rather than authentic recreations.
- Hotspots remain visible/assistive so the prototype stays usable in a browser even while the parser gets stronger.

## Next prompt should assume
- `calm-life-adventure` still focuses on Module 1 only, but the parser now supports looser phrasing and mild misspellings.
- The room art is more illustrated and less blocky, though it is still custom browser art rather than true AGI asset reconstruction.
- The next big quality pass should focus on better character sprites/NPC animation, deeper parser responses, and stronger room-specific puzzle feedback.

## What still needs validation
- Open the project in Studio/Canvas Builder and try sloppy inputs like `look at the desk`, `grab the planner`, `go to office`, `talk with maya`, `check poster`, and mild misspellings to confirm the parser feels more forgiving.
- Review the four room screens visually and decide whether the new art is finally in the right direction or if we should pursue imported pixel-art scene assets next.
- Check that the puzzle still completes cleanly after the parser changes.

## Known risks
- If the input gets too loose, the parser may occasionally over-resolve to the wrong noun when multiple aliases are similar.
- The visual direction is improved, but still not a literal match to Sierra-authored painted backgrounds.

## Exact next command
`npm run studio`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/main.js`

## Do not do next / warnings
- Do not widen scope into Modules 2-4 until the parser feel and room art are actually approved.
- Do not move art/logic into `raw/original.html`; keep iterating in the workspace source files.

---

## 2026-03-29 | docs/ops/ACTIVE_HANDOFF.md (pre-calm-life-adventure-view-asset-extraction)

# Handoff

- Project: calm-life-adventure
- Task: Rebuild the Module 1 prototype into a more authentic AGI-style screen using the Leisure Suit Larry source bundle as the structural reference
- Status: ready for validation

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/styles.css
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ARCHIVED_HANDOFFS.md

## What changed
- Kept the existing Module 1 multi-step puzzle flow, but refit the presentation around a tighter AGI-style runtime: room-numbered status line, score state, single-screen monitor framing, and a more game-like message window.
- Reworked the room art into lower-resolution, crisp-edged SVG scenes that read more like authored AGI rooms instead of broad gradient panels.
- Added explicit room numbers to the CALM rooms and surfaced score, path count, plan state, and inventory count in the top status bar.
- Simplified the parser area into an AGI-like message window plus command line and quick word insert strip, while preserving the newer fuzzy parser behavior.
- Restyled the notebook and status panels so they support the game instead of dominating it like a lesson dashboard.

## Verification run
- `node --check projects/calm-life-adventure/workspace/main.js`
- `npx tsx -e "import { loadProjectManifest } from './scripts/lib/projects.ts'; const main = async () => { const manifest = await loadProjectManifest('calm-life-adventure'); console.log(manifest.slug, manifest.workspaceEntrypoint); }; main().catch((error) => { console.error(error); process.exit(1); });"`
- `curl -I --max-time 5 http://localhost:5173/`

## Why this changed
- The user called out that the earlier version still felt like clicking through a course artifact instead of playing something that actually resembles a Leisure Suit Larry / AGI adventure game.
- The extracted LSL source bundle confirmed the right reference model is room logic + message banks + object tables + a single low-resolution game screen, so this pass pivots the workspace toward that structure.

## Source of truth
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/index.html
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/styles.css

## Fragile areas / watchouts
- The visuals are now much closer to an AGI screen, but they are still hand-authored browser SVG scenes rather than decoded original AGI PIC/VIEW assets.
- The parser is intentionally lenient, so if more nouns get added later the fuzzy matching thresholds may need retuning to avoid ambiguous resolutions.
- The project still covers Module 1 only; the room-number/status treatment should stay consistent before Modules 2-4 are added.

## Next prompt should assume
- `calm-life-adventure` is still a standalone Studio project and currently covers only Module 1.
- The workspace now uses an AGI-style screen layout with room numbers, score, message window, parser, and lower-resolution room art.
- The next meaningful quality step is either true AGI asset decoding/reference extraction from the LSL source bundle or deeper room scripting/NPC animation, not another generic layout rewrite.

## What still needs validation
- Open `calm-life-adventure` in Studio/Canvas Builder and confirm the new screen feels materially closer to an AGI game.
- Play through the Module 1 path with short commands and sloppy phrasing to confirm the parser still feels forgiving after the UI rebuild.
- Check that the hotspots still line up with the new room art and that the score/plan state advances correctly through completion.

## Known risks
- Without actual decoded PIC/VIEW assets, this is still an adaptation of the source structure rather than a literal visual reconstruction.
- The side panels are quieter now, but if you want the screen to go even more authentic the next pass should probably remove more helper UI instead of adding new dashboard pieces.

## Exact next command
`npm run studio`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/main.js`

## Do not do next / warnings
- Do not widen this into Modules 2-4 until the Module 1 room feel is actually approved.
- Do not move authoring into `raw/original.html`; keep the game logic and art in the workspace source files.
- Added the same expectation to the ops runbook core operating loop so resume behavior is documented in the main repo workflow docs.

## Why this changed
- To make Headroom opt-in at resume time instead of an implicit background step, keeping the workflow reversible and user-directed.

## Source of truth
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/session-checklist.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/README.md

## Fragile areas / watchouts
- This is a docs/policy change only; there is no automated restore hook enforcing it.
- Future agent prompts or local launcher docs could drift if they restate resume behavior separately.

## Next prompt should assume
- After reading `docs/ops/ACTIVE_HANDOFF.md`, ask once whether to start Headroom when resuming in Cursor or Codex and Headroom is installed.
- Do not start Headroom automatically as part of handoff restore.

## What still needs validation
- Behavioral validation in the next resumed Cursor or Codex session to confirm the prompt happens at the right time.

## Known risks
- Agents that ignore ops docs or rely only on external instructions may still miss the prompt until their local rule stack is updated.

## Exact next command
`sed -n '1,40p' docs/ops/session-checklist.md`

---

## 2026-03-28 | docs/ops/ACTIVE_HANDOFF.md (pre-calmmodule2-activity-restore)

# Handoff

- Project: calmmodule2
- Task: Fix tablet/phone hamburger behavior and make the main sidebar collapsible in the CALM Module 2 workspace
- Status: ready for validation

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calmmodule2/workspace/main.jsx
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ARCHIVED_HANDOFFS.md

## What changed
- Added `isSidebarOpen` state to the CALM Module 2 workspace shell with a desktop-open/mobile-closed default.
- Reworked the left navigation into a responsive drawer so it slides over content on smaller screens and closes from a backdrop or close button.
- Added a sticky top bar in the main content area with a real menu toggle, so the sidebar can be opened on tablet/phone and collapsed again on larger screens.
- Updated section navigation clicks to close the drawer on smaller screens after selecting a section, which keeps the content readable on phones.

## Why this changed
- The previous shell had a permanently visible sidebar with no hamburger state, so the layout did not adapt cleanly to tablet or cellphone widths and the main navigation could not be collapsed.

## Source of truth
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calmmodule2/workspace/main.jsx
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calmmodule2/workspace/index.html

## Fragile areas / watchouts
- This workspace is a legacy standalone React/Babel page, so responsive behavior is defined directly in `main.jsx` rather than a shared app shell.
- Sidebar default-open behavior uses `window.innerWidth >= 1024`; if a later task changes the layout breakpoint, that threshold should move with it.
- The desktop collapsed state currently fully hides the sidebar rather than converting it to a mini-icon rail.

## Next prompt should assume
- CALM Module 2 now has one shared sidebar state for mobile, tablet, and desktop.
- On small screens the menu behaves like a drawer with a backdrop and closes after section selection.
- On larger screens the top-bar button can still collapse and reopen the main sidebar.

## What still needs validation

---

## 2026-03-28 | docs/ops/ACTIVE_HANDOFF.md (pre-firebase-relaunch-batch)

# Handoff

- Project: calmmodule2
- Task: Restore the richer advertising analyzer and three-scenario budget builder into the CALM Module 2 workspace, then bring Honesty and Maintaining content back into closer alignment with the original source material
- Status: ready for validation

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calmmodule2/workspace/main.jsx
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ARCHIVED_HANDOFFS.md

## What changed
- Reintroduced the historical `Ad Analyzer` activity to the Advertising section, including tactic scenarios, answer feedback, completion tracking, and the brand-deconstruction checkpoint prompt.
- Replaced the worksheet-style Managing Money assignment with the earlier `Budget Builder` experience, including the three living-situation tabs, side-by-side totals, and the random life-curveball control.
- Added the older budget/analyzer state helpers back into the current workspace runtime, while preserving the newer collapsible sidebar and mobile drawer shell.
- Updated progress counting and the teacher print/export report so the restored advertising and budgeting activities are represented in completion state and print output.
- Restored fuller source wording in the Honesty prompts and added back the missing conflict-context sentence plus more faithful communication activity copy in Maintaining Relationships.

## Why this changed
- The current CALM Module 2 workspace had drifted back to a simpler worksheet-style advertising/money flow, but the user wanted the richer previously-converted activities restored in the live source of truth.
- Honesty and Maintaining were not structurally reverted the same way, but they had condensed some original course wording, so the content was tightened back toward the source material without redesigning those sections.

## Source of truth
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calmmodule2/workspace/main.jsx
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calmmodule2/workspace/index.html

## Fragile areas / watchouts
- This workspace is still a legacy standalone React/Babel page, so the restored interactions, state migrations, and shell behavior all live in one large `main.jsx` file.
- Saved localStorage data can contain older section shapes; the load path now merges legacy and restored fields, but browser validation is still needed on a previously-used workspace.
- There is no `projects/calmmodule2/meta/e2e-contract.json`, so this change was verified with a focused bundle build rather than project E2E automation.

## Next prompt should assume
- CALM Module 2 now keeps the newer responsive sidebar shell, has the restored `Ad Analyzer` and three-scenario `Budget Builder`, and includes more source-faithful Honesty and Maintaining copy in the live workspace.
- Advertising progress now includes the analyzer/brand deconstruction pieces, and Managing Money progress now follows the scenario builder plus justification flow.

## What still needs validation
- Manual browser QA for the restored advertising and money sections, especially the analyzer progression, budget tab switching, curveball impact, and mobile/tablet wrapping inside the restored cards.
- Spot-check the Honesty and Maintaining sections to confirm the fuller prompt copy still reads well and does not create awkward wrapping on smaller screens.
- Confirm that previously-saved local data loads cleanly and that the teacher print report still opens with the restored section content.

## Known risks
- The teacher report now favors the restored scenario-based money data instead of the simpler worksheet budget table, so any old saved worksheet-only answers will be less prominent in print output.

## Exact next command
`npm run studio`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calmmodule2/workspace/main.jsx`

## Do not do next / warnings
- Do not edit `projects/calmmodule2/raw/**`; keep the restore work in the workspace source of truth only.

---

## 2026-03-29 | docs/ops/ACTIVE_HANDOFF.md (pre-calm-life-adventure-prototype)

# Handoff

- Project: repo-wide
- Task: Relaunch the updated CALM Module 2 workspace on Firebase and republish the `forensics35` and `forensics` hosted builds
- Status: complete

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calmmodule2/workspace/main.jsx
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics35/exports/google-hosted/firebase-config.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics35/exports/google-hosted/.firebaserc
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/exports/google-hosted/firebase-config.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/exports/google-hosted/.firebaserc
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ARCHIVED_HANDOFFS.md

## What changed
- Kept the latest CALM Module 2 workspace edits in place, including the restored activities, source-faithful content pass, and the desktop sidebar rail with the shared hamburger position.
- Re-exported Google-hosted builds for `calmmodule2`, `forensics35`, and `forensics`.
- Seeded deployable Firebase config files for `forensics35` and `forensics` from the same known-good `calm-module-one` Firebase web-app config already used by `calmmodule2`, changing only the `projectSlug` and local `.firebaserc` values needed for deploy.
- Published the three hosted builds to Firebase Hosting and verified that each site responds live over HTTPS.

## Verification run
- `npx esbuild projects/calmmodule2/workspace/main.jsx --bundle --format=esm --platform=browser --outfile=/tmp/calmmodule2-main-check.js`
- `npm run export:google-hosted -- --project calmmodule2`
- `npm run export:google-hosted -- --project forensics35`
- `npm run export:google-hosted -- --project forensics`
- `PATH="/tmp/canvas-helper-bin:$PATH" npm run deploy:google-hosted -- --project calmmodule2,forensics35,forensics`
- `curl -I -L --max-time 20 https://calmmodule2.web.app`
- `curl -I -L --max-time 20 https://forensics35.web.app`
- `curl -I -L --max-time 20 https://forensics25.web.app`

## Why this changed
- The user asked to relaunch CALM Module 2 on Firebase after the workspace fixes and to do the same for the two forensics projects.
- `forensics35` and `forensics` exported only template Firebase config files, so the deploy step needed minimal reversible config seeding before the existing deploy script could run successfully.

## Source of truth
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calmmodule2/workspace/main.jsx
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calmmodule2/meta/google-hosted.deploy.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics35/meta/google-hosted.deploy.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/forensics/meta/google-hosted.deploy.json

## Fragile areas / watchouts
- `forensics35` and `forensics` now have explicit Firebase deploy config files in `exports/google-hosted/`; if the shared Firebase app config changes later, those seeded files can drift from the `calmmodule2` baseline.
- The live `forensics` Hosting site id is `forensics25`, not `forensics`, because that is what the project deploy metadata points to.
- Export outputs and some project metadata files were regenerated by the export/deploy flow; treat the workspace files as canonical, not the generated hosting artifacts.

## Next prompt should assume
- `calmmodule2`, `forensics35`, and `forensics` have all been republished to Firebase Hosting on March 28, 2026.
- Live URLs currently responding with `HTTP 200` are `https://calmmodule2.web.app`, `https://forensics35.web.app`, and `https://forensics25.web.app`.
- CALM Module 2 still needs browser-level validation for the restored activities and latest sidebar behavior.

## What still needs validation
- Open the three live sites in a browser and confirm the intended content renders beyond the HTTP health check.
- For CALM Module 2 specifically, manually validate the desktop sidebar rail, tablet/mobile drawer behavior, restored advertising analyzer, and restored budget scenarios in the live hosted build.
- If future deploys are expected for `forensics35` and `forensics`, confirm whether the seeded `firebase-config.json` files should become part of the normal regeneration path instead of a one-off deploy aid.

## Known risks
- Because `forensics35` and `forensics` needed seeded Firebase config files, a future clean export that removes those files would block deploys again unless the export pipeline is updated.

## Exact next command
`open https://calmmodule2.web.app`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calmmodule2/workspace/main.jsx`

## Do not do next / warnings
- Do not treat `projects/*/exports/google-hosted/**` as canonical authoring sources; keep content changes in the workspace files and regenerate exports from there.
- Manual Studio/browser QA at phone, tablet, and desktop widths to confirm the drawer opens, closes, and does not trap content.
- Visual check that the sticky top bar and collapsed desktop state feel acceptable with long sections.

## Known risks
- The new drawer overlay may need minor spacing tuning if any section content relies on unusual top-of-page positioning.

## Exact next command
`npx esbuild projects/calmmodule2/workspace/main.jsx --bundle --format=esm --platform=browser --outfile=/tmp/calmmodule2-main-check.js`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calmmodule2/workspace/main.jsx`

## Do not do next / warnings
- Do not edit `projects/calmmodule2/raw/**`; keep the responsive fix in the workspace runtime only.

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/session-checklist.md`

## Do not do next / warnings
- Do not turn this into automatic Headroom startup without an explicit user request.

---

## 2026-03-28 | docs/ops/ACTIVE_HANDOFF.md (pre-calmmodule2-responsive-sidebar-fix)

# Handoff

- Project: experimental-psych-30-per-1-a-b-sec-s-202632352
- Task: Hide external hand-in assignments from the module assignments view while keeping workspace quiz assessments available
- Status: ready for validation

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ARCHIVED_HANDOFFS.md

## What changed
- Added an `isWorkspaceAssignment()` guard in the workspace shell so assignment lists only include items that are native workspace quizzes or have no external delivery override.
- Updated `getModuleBuckets()` so external hand-in assignments no longer appear in the module assignments tab or assignment counts.
- Left the existing reader-side quiz rendering untouched, so the in-workspace assessment flow still uses the existing XML-driven quiz UI.
- Kept Headroom running locally on `http://127.0.0.1:8787` for this session after the user explicitly asked to keep it on.

## Why this changed
- The user wanted external hand-in assignment surfaces hidden from the current Experimental Psychology workspace while preserving the built-in workspace quiz experience.

## Source of truth
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/assessment-delivery.js

## Fragile areas / watchouts
- This change filters assignment visibility at the bucket level; any future assignment metadata change in `assessment-delivery.js` can change what appears in the assignments tab.
- External hand-in activities still exist in project data; they are hidden from the current workspace assignment flow rather than deleted or converted.
- If a future task needs some external assignments visible again, the visibility rule should be widened intentionally instead of patching individual titles.

## Next prompt should assume
- The assignments tab should now surface only workspace-native quiz assessments.
- External hand-in assignments remain in source data but are hidden from the current module assignment view.
- The existing quiz renderer and quiz draft state were intentionally preserved.

## What still needs validation
- Manual Studio QA to confirm each module assignments tab now shows only the quiz items and no external hand-in cards.
- Manual check that module assignment counts and unlock messaging still feel correct after the filtered assignment set.

## Known risks
- Modules that only had external hand-ins may now show no assignments in the assignments tab, which is intentional for this pass but should be confirmed visually.

## Exact next command
`npm run studio`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js`

## Do not do next / warnings
- Do not reintroduce external hand-in cards by patching individual activity titles; keep the visibility rule centralized.

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

---

## 2026-03-26 | docs/ops/ACTIVE_HANDOFF.md (pre-experimental-psych-assessment-delivery)

# Handoff

- Project: experimental-psych-30-per-1-a-b-sec-s-202632352
- Task: Continue the Experimental Psych workspace style pass with uncodixfy constraints while preserving the current single-sidebar/module-dropdown layout
- Status: ready for validation

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ARCHIVED_HANDOFFS.md

## What changed
- Reworked the Experimental Psych workspace visual system in `workspace/main.js` without changing the current navigation structure.
- Removed the more decorative generated-dashboard treatment: radial/gradient page shell, oversized pill badges, uppercase overlines, sticky glassy top chrome, and heavy shadowing.
- Tightened the layout to a more conventional application shell with a narrower solid sidebar, calmer borders, flatter surfaces, and smaller radii.
- Replaced badge-heavy metadata with quieter rectangular chips and simplified reader metadata so the UI reads more like a production course tool than a concept dashboard.
- Shifted the reader surface to a warm paper panel against the dark shell to improve long-form lesson readability while keeping the existing item-list-plus-reader interaction model.
- Followed up with a broader style cleanup pass: denser module cards, stronger focus/active states, improved empty/loading treatment, and mobile spacing refinements.
- Improved reader typography for imported HTML: constrained line length, better heading rhythm, table styling, link treatment, blockquotes, and more textbook-like spacing.
- Removed the extra HTML reader title chrome so imported lesson pages rely on their own internal headings instead of duplicating titles above the content.
- Replaced the displayed course title in the sidebar with the simpler fixed label `Experimental Psychology 30`.
- Kept subsection collapse, selected-item persistence, sidebar toggle, and module dropdown behavior intact.
- Archived the prior module-framing handoff and replaced the active handoff with this style-refinement checkpoint.

## Why this changed
- The next task was explicitly a style refinement pass using `uncodixfy`, not another layout rebuild.
- The previous visual treatment still leaned toward AI-dashboard patterns that were louder than the course content and reader workflow needed.
- Experimental Psych benefits from stronger reading contrast and quieter navigation chrome now that the module structure is already locked.

## Source of truth
- Canonical editable entry: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js`
- Project metadata contract: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/project.json`
- Generated shell data remains derived output: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/course-shell-data.js`

## Fragile areas / watchouts
- This pass intentionally leaves the current render structure in place; follow-up refinements should stay style-level unless the task explicitly widens scope.
- The injected styles still live inside `main.js`, so future visual tweaks should be careful not to break event wiring while editing the large template literal.
- Reader HTML comes from sanitized imported content; some source pages may still expose edge-case spacing or nested Brightspace markup once reviewed in Studio.

## Next prompt should assume
- Subsection collapse is already implemented.
- The single-sidebar/module dropdown structure is in place.
- The current task line is style refinement with `uncodixfy`, not a layout rebuild.
- The workspace now uses a flatter dark shell with warm paper reader panels instead of the earlier gradient-heavy treatment.
- Module cards, topbar stats, and reader metadata have already been simplified away from pill-heavy dashboard styling.
- HTML lesson pages no longer get a duplicated outer title/header in the reader.
- The displayed course label is now `Experimental Psychology 30`.

## What still needs validation
- Manual Studio QA for desktop and mobile spacing after the style changes.
- Manual readability review on real lesson and assignment content in at least Module 1 and one later module.
- Visual check that expanded module dropdowns still feel scannable with long section lists after the denser card styling.
- Manual check that non-HTML items still feel clear now that HTML pages render without the outer title chrome.
- No project E2E contract run is available yet for this slug because `projects/experimental-psych-30-per-1-a-b-sec-s-202632352/meta/e2e-contract.json` does not exist.

## Known risks
- Because styling is injected from a single string in `main.js`, later fine-tuning can create accidental selector drift if edits are not kept surgical.
- The warm paper reader improves text contrast, but some imported HTML fragments may still need targeted typography cleanup after human review.
- Only syntax-level verification was run in this pass; full visual behavior still needs Studio validation.

## Exact next command
`npm run studio`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js`

## Do not do next / warnings
- Do not edit `projects/experimental-psych-30-per-1-a-b-sec-s-202632352/raw/**`.
- Do not hand-edit `workspace/course-shell-data.js`; regenerate it through the pipeline if structure changes are needed later.
- Do not treat this pass as permission to reintroduce an inner sidebar or rebuild the module rail layout.
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

---

## 2026-03-29 | docs/ops/ACTIVE_HANDOFF.md (pre-calm-life-adventure-module1-rebuild)

# Handoff

- Project: calm-life-adventure
- Task: Create a first playable standalone CALM adventure game project that opens in Studio/Canvas Builder and establishes the retro chapter-based direction
- Status: ready for validation

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/raw/original.html
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/index.html
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/styles.css
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/project.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ARCHIVED_HANDOFFS.md

## What changed
- Added a brand-new standalone project slug, `calm-life-adventure`, so the concept can be opened directly in Studio/Canvas Builder instead of being embedded into the current CALM module projects.
- Built a workspace-first retro adventure shell with four CALM chapters, room-to-room movement, stateful choices, stats, inventory, and a local story log.
- Mapped the first playable vertical slice across Modules 1-4: personal choices, resource choices, career/life choices, and transition/launch.
- Added localStorage-backed progress so the run can be reset or resumed while you work on the concept in the builder.
- Added a minimal raw placeholder only because Studio project discovery requires both raw and workspace entrypoints to register the project cleanly.

## Verification run
- `node --check projects/calm-life-adventure/workspace/main.js`
- `npx tsx -e "import { loadProjectManifest, listProjectSlugs } from './scripts/lib/projects.ts'; const main = async () => { const slugs = await listProjectSlugs(); console.log(slugs.includes('calm-life-adventure') ? 'FOUND' : 'MISSING'); const manifest = await loadProjectManifest('calm-life-adventure'); console.log(manifest.slug, manifest.canonicalEntry, manifest.authoringStatus); }; main().catch((error) => { console.error(error); process.exit(1); });"`

## Why this changed
- The user wanted to stop at planning and see a working version inside Canvas Builder, not just a design doc.
- A standalone project boundary is the safest way to iterate on the game direction without disturbing the existing CALM 1-4 course surfaces.

## Source of truth
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/index.html
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/styles.css
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/project.json

## Fragile areas / watchouts
- This is a workspace-authored prototype, not yet a content-complete game; the scene data is intentionally compact and should be treated as a playable vertical slice.
- The raw file is a registration placeholder, not a real import baseline.
- Firebase deploy metadata has not been configured yet, so this project is builder-ready before it is deploy-ready.

## Next prompt should assume
- `calm-life-adventure` now appears as a Studio project and can be opened like the rest of the repo projects.
- The current version is a retro browser adventure slice with four CALM chapters, simple room navigation, stat meters, inventory, and chapter completion gates.
- Future work should deepen content, add richer scene art/interaction, and then wire Firebase Hosting once the game direction is stable.

## What still needs validation
- Open the new project in Studio/Canvas Builder and confirm the project lists correctly, renders on desktop/tablet/mobile, and feels good enough to keep iterating.
- Play through the full vertical slice and make sure the chapter progression, item gating, and reset loop feel understandable.
- Decide whether the next pass should prioritize richer room art, more scenes per chapter, verb-style interactions, or Firebase deployment.

## Known risks
- The current vertical slice leans on button-based actions rather than a full Sierra-style verb parser, so the adventure feel is present but still lightweight.
- Since the project was created manually instead of through the importer, optional meta files like prompt packs and section maps are not generated yet.

## Exact next command
`npm run studio`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/main.js`

## Do not do next / warnings
- Do not move content authoring into `raw/original.html`; keep the game in the workspace files.
- Do not wire Firebase deploy config yet unless the gameplay direction survives the first builder review.

---

## 2026-03-29 | docs/ops/ACTIVE_HANDOFF.md (pre-calm-life-adventure-room-remap-stripdown)

# Handoff

- Project: calm-life-adventure
- Task: Start using decoded AGI room pictures and sprites from the Leisure Suit Larry source bundle so the game style comes from the real source data
- Status: ready for validation

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/extract-agi-view-assets.py
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/extract-agi-pic-assets.py
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/styles.css
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/views/vEgo/manifest.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/views/vReceptionist/manifest.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/pics/pic-10/manifest.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/pics/pic-11/manifest.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/pics/pic-14/manifest.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/pics/pic-15/manifest.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/pics/pic-16/manifest.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/pics/pic-21/manifest.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/pics/pic-22/manifest.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/pics/pic-31/manifest.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/project.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ARCHIVED_HANDOFFS.md

## What changed
- Added a reproducible AGI `PIC` extraction script that decodes original vector picture files into SVG room backgrounds using the AGI picture spec for colors, line actions, corner actions, relative/absolute lines, and fills.
- Exported real LSL room pictures into `workspace/assets/agi/pics/` and wired the live scene renderer to use decoded room backgrounds instead of the earlier hand-authored scene art.
- Kept the real decoded `VIEW` pipeline and `vEgo` sprite integration from the previous pass, so the player character and the room backgrounds are now both coming from source-derived AGI assets.
- Remapped the current Module 1 slice to use AGI room/picture ids that line up with real extracted rooms, and softened hotspot outlines so the current CALM nouns can sit on the original backgrounds while the deeper content remap is still in progress.
- Updated project metadata so both extraction scripts and the generated `PIC`/`VIEW` assets are part of the official regeneration path.

## Verification run
- `python3 -m py_compile projects/calm-life-adventure/meta/extract-agi-view-assets.py`
- `python3 -m py_compile projects/calm-life-adventure/meta/extract-agi-pic-assets.py`
- `python3 projects/calm-life-adventure/meta/extract-agi-view-assets.py --view 0 --view 166`
- `python3 projects/calm-life-adventure/meta/extract-agi-pic-assets.py --pic 10 --pic 11 --pic 14 --pic 15 --pic 16 --pic 21 --pic 22 --pic 31`
- `node --check projects/calm-life-adventure/workspace/main.js`
- `curl -I --max-time 5 http://localhost:5173/`

## Why this changed
- The user explicitly said the previous pass only changed the character and that we should not be afraid to strip the project down and use the actual LSL source bundle for the game style.
- This pass moves the project from “AGI-inspired custom art” to a real hybrid built from decoded AGI source assets, which is much closer to the actual request.

## Source of truth
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/extract-agi-view-assets.py
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/extract-agi-pic-assets.py
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/styles.css
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/project.json

## Fragile areas / watchouts
- The `PIC` decoder currently supports the common AGI actions and works for the rooms exported in this pass, but it does not yet implement the brush/pen plotting path used by a smaller subset of original pictures.
- The current Module 1 room logic and nouns are still CALM-driven while the backgrounds are now original LSL-style rooms, so the project is visually much more authentic but still semantically hybrid.
- Generated SVGs under `workspace/assets/agi/pics/**` and `workspace/assets/agi/views/**` should be regenerated, not hand-edited.

## Next prompt should assume
- `calm-life-adventure` now uses real decoded AGI room backgrounds and player sprite assets from the LSL source bundle.
- The next best step is likely a deeper content remap so the room hotspots, nouns, and scripted interactions match the imported AGI spaces more naturally while keeping CALM Module 1 learning goals.
- A later extractor pass can add support for the remaining pen-opcode pictures if we want full picture coverage from the original bundle.

## What still needs validation
- Open the project in Studio/Canvas Builder and confirm the new AGI background pictures actually render in the live preview.
- Check whether the new room/picture pairing feels materially closer to the target style, even before the deeper room-content rewrite.
- Decide which direction to take next: fully remap the room logic/content around the original AGI spaces, or continue expanding the decoder coverage first.

## Known risks
- I verified the picture extraction pipeline and visually sanity-checked the exported room images outside the app, but I did not complete a full in-browser interaction pass after the background swap.
- Because the content logic is still partly CALM-first while the environments are now LSL-derived, some hotspots may still feel semantically mismatched until the next rewrite pass.

## Exact next command
`npm run studio`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/extract-agi-pic-assets.py`

## Do not do next / warnings
- Do not hand-edit the generated AGI SVG assets under `workspace/assets/agi/**`; regenerate them from the extraction scripts.
- Do not broaden into Modules 2-4 yet; the best next investment is reconciling Module 1’s room logic with the now-real AGI environments.

---

## 2026-03-29 | docs/ops/ACTIVE_HANDOFF.md (pre-calm-life-adventure-pic-background-extraction)

# Handoff

- Project: calm-life-adventure
- Task: Start using decoded AGI source assets from the Leisure Suit Larry bundle instead of only hand-authored browser art
- Status: ready for validation

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/extract-agi-view-assets.py
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/styles.css
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/views/vEgo/manifest.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/assets/agi/views/vReceptionist/manifest.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/project.json
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ARCHIVED_HANDOFFS.md

## What changed
- Added a reproducible AGI `VIEW` extraction script that decodes source `VIEW.<id>` files from the extracted LSL bundle into SVG sprite assets using only Python stdlib and the AGI resource spec.
- Exported real LSL sprite sets into the workspace under `workspace/assets/agi/views/`, including `vEgo` and `vReceptionist`, with per-view `manifest.json` files and per-loop/per-cel SVG outputs.
- Replaced the placeholder CSS box-man in the runtime with actual decoded `vEgo` sprite frames, including directional loop selection and frame cycling as the player moves.
- Updated project metadata so the AGI extraction script and generated SVG sprite outputs are now part of the documented regeneration story for this project.

## Verification run
- `python3 -m py_compile projects/calm-life-adventure/meta/extract-agi-view-assets.py`
- `python3 projects/calm-life-adventure/meta/extract-agi-view-assets.py --view 0 --view 166`
- `node --check projects/calm-life-adventure/workspace/main.js`
- `npx tsx -e "import { loadProjectManifest } from './scripts/lib/projects.ts'; const main = async () => { const manifest = await loadProjectManifest('calm-life-adventure'); console.log(manifest.slug, manifest.workspaceEntrypoint); }; main().catch((error) => { console.error(error); process.exit(1); });"`
- `curl -I --max-time 5 http://localhost:5173/`

## Why this changed
- The user explicitly said we should be using the real LSL source bundle instead of continuing to fake the AGI look from scratch.
- `VIEW` resources are the cleanest first step because they can be decoded directly from the published AGI resource format and immediately improve the game with real source-derived sprite art.

## Source of truth
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/extract-agi-view-assets.py
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/main.js
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/workspace/styles.css
- /Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/project.json

## Fragile areas / watchouts
- The runtime now uses real decoded `VIEW` assets, but the room backgrounds are still custom SVG scenes because `PIC` extraction has not been implemented yet.
- The exported AGI SVG files are generated artifacts; they should be regenerated with the metadata script rather than hand-edited.
- The `vReceptionist` export is currently reference material only and is not yet wired into the room scenes.

## Next prompt should assume
- `calm-life-adventure` now includes a real AGI asset pipeline for `VIEW` files.
- The player sprite on screen comes from decoded LSL `vEgo` assets, not the earlier placeholder div sprite.
- The next serious authenticity step is a `PIC` decoder/exporter so room backgrounds can also come from the source bundle.

## What still needs validation
- Open the project in Studio/Canvas Builder and confirm the new player sprite renders correctly and advances frames while moving.
- Check that the relative `assets/agi/views/...` paths resolve correctly in the Builder preview.
- Decide whether the next pass should target `PIC` background extraction first or start wiring additional decoded NPC view assets into the current rooms.

## Known risks
- I verified the extraction pipeline and file outputs, but I did not fully automate a browser assertion that Studio resolves the new SVG asset paths in preview, so that still needs a real visual check.
- Because the room art is still hand-authored, the game is now a hybrid of real decoded AGI sprites plus custom browser backgrounds.

## Exact next command
`npm run studio`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/calm-life-adventure/meta/extract-agi-view-assets.py`

## Do not do next / warnings
- Do not hand-edit the generated SVG sprites under `workspace/assets/agi/views/**`; regenerate them from the extraction script.
- Do not widen into Modules 2-4 yet; the best next investment is finishing the source-asset path for Module 1 first.

---

## 2026-04-13 | docs/ops/ACTIVE_HANDOFF.md (pre-repo-plan-status-handoff)

# Handoff

- Project: hss1010
- Task: Begin Canvas Builder editing with original visual style preserved
- Status: ready

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\hss1010\meta\project.json
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md

## Verification run
- `npm.cmd run verify -- --project hss1010` (passed)
- project discovery check confirms `hss1010` present

## Known risks / follow-up
- Provided source folder `canvas code and references/HSS1010` currently has no importable HTML/TXT input (empty `HSSCODE`), so no new import was run from that location.

## Source-of-truth location
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\hss1010\workspace\index.html
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\hss1010\workspace\main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\hss1010\meta\project.json

## Fragile areas / what might drift
- External image/font/script dependencies are network-hosted.
- Re-import with `--force` can replace workspace source.

## Next prompt assumptions
- Keep original HSS1010 style intact.
- Limit changes to content/organization/functionality unless user requests design changes.

## Exact next command
`npm.cmd run studio`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\hss1010\workspace\index.html`


---

# Handoff

- Project: repo-wide
- Task: Add Firebase-hosted progress reporting for required in-app course completion
- Status: ready for validation

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\progress-report.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\google-hosted.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\exports\google-hosted.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\report-progress.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\report-all-progress.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\report-progress.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\progress-report.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\google-hosted-export.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\google-hosted-deploy.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\google-hosted-deploy.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\report-all-progress.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\package.json
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\firebase-progress-reporting.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\google-hosted-deploy.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\report-all-progress.bat
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\exports\google-hosted\*
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module\exports\google-hosted\*
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm-module-4\exports\google-hosted\*
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calm3new\exports\google-hosted\*
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\calmmodule2\exports\google-hosted\*
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\forensics\exports\google-hosted\*
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\forensics35\exports\google-hosted\*
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\experimental-psych-30-per-1-a-b-sec-s-202632352\exports\google-hosted\*
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\experimental-psych-30-per-1-a-b-sec-s-202632352\meta\google-hosted.deploy.json

## What changed
- Added a provider-neutral progress-report contract and extractor for required web-app completion.
- Added course-shell required-item extraction from `workspace/course-shell-data.js`.
- Updated Google-hosted exports to embed required progress items in `google-hosted-bridge.js`.
- Updated the hosted Firebase bridge to write `progressSummary`, `userEmail`, and `userName` beside existing saved state.
- Updated the hosted Firebase bridge to upgrade older saved documents on sign-in when progress reporting exists but the remote document still has no usable `progressSummary`.
- Added `npm run report:progress` to export Firestore student progress documents to CSV.
- Added focused tests for progress extraction, CSV formatting, and Google-hosted bridge inclusion.
- Added Firebase progress reporting documentation.
- Added a Google-hosted deployability guard so courses missing the current progress-reporting bridge are excluded from deploy.
- Documented the deploy readiness rule that `google-hosted-bridge.js` must include progress reporting markers.
- Added a shared Firestore report helper so CSV pull logic is reused by single-course and report-all flows.
- Added `npm run report:all` to auto-discover all deployable Google-hosted Firebase courses and write combined CSV output.
- Added `report-all-progress.bat` to write `reports/latest-progress.csv` plus a timestamped CSV without needing a manual course list.
- Regenerated the General Psychology Google-hosted export bundle so it includes the new progress reporting bridge.
- Restored General Psychology deploy readiness files from the existing public Firebase config and deploy metadata.
- Deployed General Psychology to Firebase Hosting site `generalpsychology`.
- Re-deployed General Psychology after adding the saved-document progress upgrade path.
- Exported and deployed `calm-module`, `calm-module-4`, `calm3new`, `calmmodule2`, and `forensics`.
- Restored missing deploy readiness files for `forensics35` from the existing public Firebase config and deployed it.
- Added deploy metadata/config for `experimental-psych-30-per-1-a-b-sec-s-202632352` using existing site `experimentalpsychology`, then exported and deployed it.

## Why this changed
- The district reporting need is percentage completion for required student-facing work inside Firebase-hosted course web apps.
- The existing Google-hosted bridge already persisted per-student state, so the smallest stable solution is to normalize progress at save time and pull CSV reports from Firestore.
- New Firebase sites need progress reporting attached automatically, so deploy readiness now fails closed when the export was not regenerated with the current bridge.

## Source of truth
- Reporting code: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\progress-report.ts
- Firebase hosted bridge: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\google-hosted.ts
- Export integration: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\exports\google-hosted.ts
- Reporting docs: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\firebase-progress-reporting.md
- Deploy readiness guard: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\google-hosted-deploy.ts
- Report-all entrypoint: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\report-all-progress.ts

## Fragile areas / watchouts
- Courses without `workspace/course-shell-data.js` can still save raw state and snapshot-derived progress, but may report `requiredCount: 0` until a required-item manifest is available.
- The browser bridge stores `userEmail` and `userName` when Firebase Auth provides them; confirm this is acceptable for the district privacy posture before production rollout.
- Firestore rules in generated deploy docs still only allow students to read/write their own document. CSV export uses a service account for reporting.
- Previously exported Firebase bundles for the listed deployed courses now include the progress bridge. Any other Firebase course not listed here still needs export/deploy.
- `npm run deploy:google-hosted` now hides/skips projects if `google-hosted-bridge.js` is missing `progressSummary`, `progressItems`, or `shouldUpgradeProgressSummary`.

## Next prompt should assume
- The current task is repo-wide Firebase progress reporting, not Forensics QA.
- Keep changes inside export/reporting code unless a course-specific adapter is explicitly needed.
- Do not edit `projects/<slug>/raw/**` or generated Firebase export bundles manually.

## What still needs validation
- `npm run test:progress-report` passed.
- `npm run test:google-hosted` passed after adding the progress-upgrade assertion.
- `npx tsx --test scripts/tests/google-hosted-deploy.test.ts` passed after adding the deploy guard.
- `npm run test:report-all-progress` passed.
- `npm run typecheck` passed.
- `npm run export:google-hosted -- --project general-psychology-20-independent-studies-202633108` passed.
- `npm run deploy:google-hosted -- --project general-psychology-20-independent-studies-202633108` passed twice, including the second deployment with the upgrade path.
- `npm run export:google-hosted` passed for `calm-module`, `calm-module-4`, `calm3new`, `calmmodule2`, `forensics`, `forensics35`, and `experimental-psych-30-per-1-a-b-sec-s-202632352`.
- `npm run deploy:google-hosted -- --project calm-module,calm-module-4,calm3new,calmmodule2,forensics` passed.
- `npm run deploy:google-hosted -- --project forensics35,experimental-psych-30-per-1-a-b-sec-s-202632352` passed after rewriting new JSON files as BOM-free UTF-8.
- Manually open https://generalpsychology.web.app/, sign in, complete a few items, and confirm Firestore receives `progressSummary`.
- Manually open each deployed course once with a test account to trigger progress-save upgrades, then run CSV reports.
- Deploy or locally test against a Firebase project before relying on live district reporting.

## Known risks
- The report command requires a Firebase service account with Firestore read permission.
- The first implementation uses generic completion-state detection. A course-specific adapter may be needed if a course stores completion in an unusual shape.
- Deployment emitted Node deprecation warnings for child-process shell args and `punycode`, but Firebase deployment completed successfully.
- `progress.csv` was locked/open during one rerun, so write failed with `EBUSY`; use a different `--out` path or close the CSV before rerunning.

## Exact next command
`npm run report:progress -- --firebase-project calm-module-one --course general-psychology-20-independent-studies-202633108 --out progress.csv --service-account <path-to-service-account.json>`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\progress-report.ts`

## Do not do next / warnings
- Do not hand-edit generated Firebase export bundles; regenerate them with `npm run export:google-hosted -- --project <slug>`.
- Do not treat client-side domain filtering as the reporting security model. Use Firestore rules or service-account exports for staff access.


---

# Handoff

- Project: mentalwellness10-option2
- Task: Replace the broken iframe assignment embed with in-DOM mounting of the real Mental Wellness assignment runtime inside option 2.
- Status: ready for validation

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\styles.css
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md

## What changed
- Removed the option 2 iframe-based assignment mount path.
- Added runtime asset loading in option 2 so assignment detail views fetch the real assignment DOM from `assignment-runtime.html` and inject the matching assignment view directly into the option 2 content area.
- Refactored `assignment-runtime-main.js` into a namespaced mountable runtime that initializes only the requested assignment view instead of trying to boot a whole standalone page.
- Exported the original assignment interaction functions so existing inline controls for steps, rubrics, save/load, and print/export still work after injection.
- Added scoped runtime support styles in option 2 so the injected assignment markup renders correctly without bringing over the old sidebar shell.

## Why this changed
- The iframe recovery path was the wrong architecture for the user requirement because it embedded a second app instead of integrating the assignment code into option 2.
- The earlier copied runtime also failed because it was loading the wrong JS entrypoint when copied into option 2.

## Source of truth
- Option 2 shell entry: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\index.html
- Option 2 shell logic: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\main.js
- Embedded assignment runtime logic: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js
- Embedded assignment DOM source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime.html

## Fragile areas / watchouts
- Assignment runtime styling still depends on Tailwind Play CDN loading in the option 2 page at runtime.
- If assignment view ids change in `assignment-runtime.html`, the option 2 runtime view map will drift.
- The copied assignment runtime is still a local fork; upstream option 1 changes will not sync automatically.

## Next prompt should assume
- Option 2 assignments now mount real assignment DOM directly, not an iframe.
- The remaining likely work is visual cleanup or any runtime-specific bug that shows up in preview validation.
- No automated validation has been run in this task.

## What still needs validation
- Open option 2 preview and click all six assignments.
- Confirm step navigation, rubric clicks, local save/load, and print/export buttons work for each assignment.
- Confirm Tailwind utility styling is present after the runtime assets load.

## Known risks
- If the preview environment blocks the Tailwind CDN load, the injected assignment content will function but appear under-styled.
- Because validation was not run, there may still be one runtime-specific bug in a specific assignment after first preview.

## Exact next command
`git status --short -- projects/mentalwellness10-option2/workspace/main.js projects/mentalwellness10-option2/workspace/styles.css projects/mentalwellness10-option2/workspace/assignment-runtime-main.js docs/ops/ACTIVE_HANDOFF.md`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\main.js`

## Do not do next / warnings
- Do not reintroduce an iframe or second embedded shell for assignments.
- Do not summarize the assignments into placeholder cards again; the assignment runtime itself is the source behavior now.


---

## 2026-04-15 | docs/ops/ACTIVE_HANDOFF.md (pre-mentalwellness10-option2-phase1-assignment-depth)

# Handoff

- Project: mentalwellness10-option2
- Task: Stabilize the Option 2 shell, restore local course materials, and add the converted Phase 1 lesson plus extracted quiz.
- Status: ready for validation

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\styles.css
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\index.html
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime.html
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\pdf-viewer.html
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assets\slides\00-diagnostic.pdf
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assets\slides\01-engine.pdf
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assets\slides\02-drive.pdf
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assets\slides\03-focus.pdf
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assets\slides\04-toolkit.pdf
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assets\readings\phase1-engine-content.pdf
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md

## What changed
- Reworked the compact Option 2 shell so tablet and mobile collapse into a top icon bar instead of a persistent left rail.
- Restored the Diagnostic phase and assignment, wired its save/progress behavior, and aligned its runtime styling with the Option 2 palette.
- Replaced external Google Drive course-material links with local PDFs plus an in-app PDF viewer.
- Cleaned the assignments overview cards so titles read clearly and the sub-step chips no longer clutter the list view.
- Added converted Phase 1 reading content under Phases and split the end-of-document quiz into the Quizzes section with its own detail view.

## Why this changed
- The user wanted Option 2 to behave like the stronger course shells already in the repo, keep materials inside the web app, and separate readings from quizzes the same way Forensics does.

## Source of truth
- Shell entry: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\index.html
- Shell logic: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\main.js
- Embedded assignment runtime logic: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js
- Embedded assignment DOM source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime.html
- Local course materials: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assets\slides\
- Phase 1 imported reading source: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assets\readings\phase1-engine-content.pdf

## Fragile areas / watchouts
- The Phase 1 lesson is a text-first conversion; original PDF images have not been preserved yet.
- `pdf-viewer.html` depends on the local PDF fetch path resolving correctly after deploy and may require a hard refresh when updated.
- Compact-mode layout relies on selector-heavy CSS around the sidebar/header structure and can drift if the shell markup changes.
- Assignment visual harmonization is applied with broad runtime selectors, so upstream runtime markup changes could break specific screens.

## Next prompt should assume
- Option 2 now has five phases including Diagnostic, seven assignments including Diagnostic, populated local course materials, and one extracted quiz.
- Phase 1 is the only converted lesson/quiz split so far; the remaining phases still use the existing shell until they are converted.
- No automated validation or deployment was run in this pass.

## What still needs validation
- Manual preview of compact header behavior across Home, Library, Performance, and Athletic Icons at tablet and mobile widths.
- Manual check that all five local PDFs render in the in-app viewer on the deployed target.
- Manual check that Phase 1 reading, extracted quiz navigation, and answer-key reveal work as expected.
- Manual spot-check of Diagnostic styling/readability after the last palette pass.

## Known risks
- The user explicitly wants preserved images; the current Phase 1 conversion does not include them yet.
- PDF rendering behavior can differ between local preview and Firebase hosting.
- There may still be section-specific compact-header spacing issues that were not validated in preview.

## Exact next command
`git status --short -- projects/mentalwellness10-option2/workspace docs/ops/ACTIVE_HANDOFF.md docs/ops/ARCHIVED_HANDOFFS.md`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\main.js`

## Do not do next / warnings
- Do not revert to external Google Drive links for the local course materials in Option 2.
- Do not collapse the Phase 1 lesson back into a single PDF-only card if the goal is Forensics-style structure.
- Do not assume the current Phase 1 conversion preserved images; that would require a separate extraction pass.


---

## 2026-04-16 | docs/ops/ACTIVE_HANDOFF.md (pre-world-religions-option2-shell)

# Handoff

- Project: mentalwellness10-option2
- Task: Fix split-screen scrolling in the Option 2 shell and make Assignment 00 require `Run Diagnostics` before the report/completion path unlocks.
- Status: complete

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\styles.css
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md

## What changed
- Compact split-screen widths now scroll correctly in the standalone course shell. The `compact-layout` path no longer traps long content behind `overflow: hidden`, and the embedded assignment runtime is allowed to expand into the page so the whole surface scrolls naturally.
- Assignment 00 no longer unlocks the report/completion path just from selecting scores. The learner now has to finish the five prompts, fill the operator log, and click `Run Diagnostics` before:
  - `Generate System Report (PDF)` enables
  - the end-of-assignment `Mark complete` button enables
- The Assignment 00 status copy now explains the exact next step at each state:
  - missing prompts
  - missing operator log
  - inputs complete but not verified
  - report unlocked / ready to complete
- The shell-side completion card now reads the persisted diagnostic readiness state instead of always allowing completion immediately.

## Why this changed
- The user reported that this course stopped scrolling when run in split screen, even though other Canvas Helper course shells still scrolled correctly.
- The user also wanted `Run Diagnostics` to behave like the actual verification/unlock step for Assignment 00, instead of leaving report/completion feeling disconnected or prematurely available.

## Source of truth
- Shell entry: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\index.html
- Shell logic: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\main.js
- Embedded assignment runtime logic: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js
- Embedded assignment styling: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\styles.css

## Fragile areas / watchouts
- Assignment 00 readiness is now stored in `diag_data.reportReady`. If the diagnostic payload shape changes again, keep that key aligned with the shell completion card.
- Compact-layout scrolling now relies on page-level scrolling rather than the previously trapped nested scroll path. Be careful with future `overflow` changes on `body`, `.content`, `.content-inner`, and `.assignment-runtime-mount`.
- The report flow still depends on `window.open()` and browser print behavior, so Builder/browser popup handling can still differ slightly from direct preview.

## Next prompt should assume
- Assignment 00 still uses the same five-question diagnostic and the same report payload, but the report is now intentionally gated behind `Run Diagnostics`.
- Editing any diagnostic score or the operator log clears the report-ready state until diagnostics are run again.
- The end-of-assignment `Mark complete` button for Assignment 00 is intentionally disabled until the diagnostic has been verified.
- Split-screen / compact-layout browsing now uses normal page scrolling in this project.

## What still needs validation
- Optional: do a Builder-specific non-headless popup spot-check if the user wants to compare print behavior there.
- Optional: mirror the same report-ready gating pattern into later assignments if the user wants a more explicit “verify then complete” flow elsewhere.
- Optional: if more compact-layout pages get special wrappers, spot-check them against the new page-level scroll behavior.

## Known risks
- The strict project E2E contract still only certifies the shared shell hooks, not deep module traversal.
- Assignment 00 still mixes newer shell markup with legacy inline runtime handlers, so id changes there remain easy to break.
- The Diagnostic route still opens the assignment section directly rather than keeping the phase tab visually active.

## Exact next command
`npm.cmd run studio`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js`

## Do not do next / warnings
- Do not remove `diag_data.reportReady` unless you also replace the shell-side completion gate.
- Do not restore compact-layout `overflow: hidden` behavior without re-testing direct workspace preview at split-screen widths.
- Do not re-enable Assignment 00 completion before diagnostics run unless the user explicitly wants a looser gate again.

---

## 2026-04-16 | docs/ops/ACTIVE_HANDOFF.md (pre-mentalwellness10-option2-phase2-lesson-quiz)

# Handoff

- Project: worldreligions30-option2
- Task: Build a new World Religions Option 2 shell with gated quizzes, local PDF library, collapsible navigation, and editorial restyling.
- Status: ready for validation

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\meta\project.json
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\raw\original.html
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\course-data.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\index.html
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\styles.css
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\pdf-viewer.html
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\worldreligions30-option2-results-report.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\worldreligions30-option2-student-choice.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\assets\library\Chapter 1.pdf
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\assets\library\Chapter 2.pdf
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\assets\library\Chapter 3.pdf
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\assets\library\Chapter 4.pdf
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\assets\library\Chapter 5.pdf
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\assets\library\Chapter 6.pdf
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\assets\library\Chapter 7.pdf
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\assets\library\Chapter 8.pdf
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\assets\library\Chapter 9.pdf
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\assets\library\Chapter 10.pdf
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\plans\2026-04-15-world-religions-option2-design.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\plans\2026-04-15-world-religions-option2.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ARCHIVED_HANDOFFS.md

## What changed
- Created a brand-new `worldreligions30-option2` project with its own `meta`, `raw`, and `workspace` source-of-truth structure.
- Parsed the World Religions chapter booklets and keyed copies into `workspace/course-data.js`, preserving chapter titles, objective items, written prompts, and teacher guidance.
- Built a new editorial shell with `Home`, `Library`, `Quizzes`, and `Assignments`, then removed the extra chapter tab so `Home` is the chapter surface.
- Added collapsible navigation, a local PDF library with in-shell viewing plus expanded full-page viewing, and gated chapter unlocks tied to quiz completion.
- Added quiz completion state, objective answer checking, teacher-guidance reveal after completion, and a `Retake Quiz` path that clears answers without re-locking the course.
- Added a polished `Generate Results` report flow for quizzes that opens a print-first results sheet for browser PDF saving.
- Fixed the `Generate Results` runtime failure by normalizing object-shaped `studentChoice` data in both the quiz tab and report generator.

## Why this changed
- The user wanted the Mental Fitness Option 2 course structure applied to World Religions using the chapter PDFs and quiz booklets as source material.
- The user then narrowed the behavior to a cleaner editorial shell with a collapsible rail, dropdown-based library selection, gated progression, and quiz completion/report behavior.

## Source of truth
- Project metadata: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\meta\project.json
- Canonical shell entry: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\index.html
- Canonical shell logic: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\main.js
- Canonical shell styling: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\styles.css
- Canonical parsed course data: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\course-data.js
- Local PDF viewer surface: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\pdf-viewer.html

## Fragile areas / watchouts
- Quiz rendering depends on the parsed structure in `course-data.js`; changes to booklet parsing or item shape will affect matching, objective scoring, and report generation.
- Student-choice data is currently object-shaped (`intro` plus `options`) in the parsed booklets, so future parser changes need to stay aligned with the normalization helpers in `workspace/main.js`.
- The results report still depends on popup/print behavior in the browser or Builder preview surface, so popup blocking or iframe restrictions can still interfere.
- The collapsed rail is intentionally minimal now; further icon/layout changes can easily make it feel off-center again.
- Library unlocks are tied to the same quiz-complete progression logic as chapters and assignments.

## Next prompt should assume
- `Home` now functions as the chapter lane; there is no separate visible `Chapters` tab.
- Chapter 1 starts unlocked, and each completed quiz unlocks the next chapter and its related surfaces.
- `Retake Quiz` clears answers and checked state but does not remove unlocked progression.
- The World Religions shell is new work and was committed without including unrelated `mentalwellness10-option2` edits or local report/reference files.

## What still needs validation
- Manual preview in Studio or Builder for the `Generate Results` print dialog and saved PDF layout.
- Manual check of the collapsed desktop rail and mobile nav presentation.
- Manual check that each chapter unlock chain behaves correctly from Quiz 1 to Quiz 10.

## Known risks
- `Generate Results` now opens correctly in a browser harness, but popup-restricted preview environments could still suppress the print window.
- Because no validation was run, there may still be display-level issues in collapsed mode or mobile layout.
- Parsed teacher-guidance sections are only as clean as the imported DOCX source text.

## Exact next command
`npm.cmd run studio`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\worldreligions30-option2\workspace\main.js`

## Do not do next / warnings
- Do not commit the unrelated `mentalwellness10-option2` workspace changes as part of this World Religions work.
- Do not edit `projects\worldreligions30-option2\raw\original.html` as if it is the live shell.
- Do not assume the report popup is production-safe until it is manually previewed in the target environment.

---

## 2026-04-16 | docs/ops/ACTIVE_HANDOFF.md (pre-mentalwellness10-option2-phase2-assignment-alignment)

# Handoff

- Project: mentalwellness10-option2
- Task: Rebuild the Phase 2 lesson and quiz from the `Mastering the Arena` DOCX in the same textbook-style pattern used for Phase 1, while leaving Phase 2 assignments untouched.
- Status: complete

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assets\readings\phase2-drive-content.pdf
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assets\readings\phase2-figures\phase2-growth-equation.png
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assets\readings\phase2-figures\phase2-integrated-discipline-system.png
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assets\readings\phase2-figures\phase2-motivation-continuum.png
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assets\readings\phase2-figures\phase2-person-situation.png
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assets\readings\phase2-figures\phase2-psychological-needs.png
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assets\readings\phase2-figures\phase2-recovery-continuum.png
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\mentalwellness10-option2-phase2-content.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\plans\2026-04-16-mentalwellness10-option2-phase2-design.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\plans\2026-04-16-mentalwellness10-option2-phase2-implementation.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ARCHIVED_HANDOFFS.md

## What changed
- Replaced the placeholder Phase 2 shell text in `workspace/main.js` with a full `Mastering the Arena` lesson built in the same sectioned textbook pattern used by the Phase 1 rebuild.
- Restored the fuller chapter density after the first abridged pass by expanding the explanatory prose, adding the overjustification and social-context material, and restoring review-question and answer-key sections.
- Added a new Phase 2 quiz, `quiz-phase2-integrated-discipline`, with ten multiple-choice questions tied to the chapter's core ideas: motivation quality, values, mindset, pride, recovery, and social context.
- Wired the Phase 2 lesson and quiz to a local source PDF, `phase2-drive-content.pdf`, instead of external references.
- Imported and attached six chapter figure assets so the lesson can render the same kind of in-flow visuals already used by the stronger textbook surfaces.
- Removed the hardcoded `Back to phase 1` quiz label so quiz detail navigation now reflects the active phase instead of incorrectly pointing every quiz back to Phase 1.
- Left `a2a` and `a2b` untouched on purpose. This pass is lesson-plus-quiz only.

## Why this changed
- The user wanted Phase 2 rebuilt with the same idea, style, and quality bar as the successful Phase 1 chapter conversion.
- The user explicitly narrowed scope to lesson content and quiz first, with assignments deferred until the lesson surfaces are solid.

## Source of truth
- Project metadata: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\meta\project.json
- Canonical shell entry: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\index.html
- Canonical lesson and quiz logic/data: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\main.js
- Canonical imported Phase 2 reading asset: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assets\readings\phase2-drive-content.pdf

## Fragile areas / watchouts
- The Phase 2 lesson content is inline in `workspace/main.js`, so future textbook edits can drift from the imported PDF if one side changes without the other.
- The six figure filenames are now part of the authored lesson data. Renaming or regenerating those assets without updating `main.js` will break inline figures.
- The new quiz explanations are authored against the chapter structure now in `main.js`; if the question set is later replaced with an instructor-provided bank, both the copy and answer key need to stay aligned.
- The quiz detail renderer now builds its back label from the phase code. If phase naming conventions change, keep that label logic readable.

## Next prompt should assume
- `phase-2` now has real lesson content and a linked quiz in the same authored style as Phase 1.
- Phase 2 assignments were intentionally not changed in this pass.
- The imported DOCX content is represented through local assets and inline lesson structures, not a separate runtime fetch.
- The next likely task is visual/manual validation or a follow-up content polish pass, not assignment rewrites unless the user asks for them.

## What still needs validation
- Manual Studio preview of the Phase 2 lesson to confirm figure sizing, table rhythm, and long-form readability match the Phase 1 quality bar.
- Manual pass through Quiz 02 to confirm the authored questions, feedback cards, and phase-back navigation feel right in the live shell.
- Optional content review against the source DOCX if the user wants tighter wording parity on any section headings or glossary entries.

## Known risks
- The project E2E contract passed, but it only verifies the shared shell hooks, not deep authored content quality inside the Phase 2 lesson.
- Existing uncommitted edits in `workspace/index.html` and `workspace/styles.css` remain outside this change set and should not be accidentally rolled into a Phase 2 commit without review.
- The local Phase 2 PDF was generated from the DOCX conversion pipeline, so a new source document revision would require regeneration to keep the file and inline lesson synchronized.

## Exact next command
`npm.cmd run studio`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\main.js`

## Do not do next / warnings
- Do not start editing `a2a` or `a2b` as part of this lesson pass unless the user explicitly changes scope.
- Do not move the Phase 2 figure assets out of `workspace\assets\readings\phase2-figures\` without updating their references in `main.js`.
- Do not assume the unrelated World Religions validation work is complete just because it has been archived out of the active handoff.

---

## 2026-04-16 | docs/ops/ACTIVE_HANDOFF.md (pre-mentalwellness10-option2-phase3-assignment-parity)

# Handoff

- Project: mentalwellness10-option2
- Task: Align, deepen, and restyle Phase 2 assignments `2A` and `2B` to the restored Phase 2 lesson and `phase2-drive-content.pdf`, using the Phase 1 shell language without changing the Phase 3/4 assignments.
- Status: ready for validation

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\styles.css
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\mentalwellness10-option2-phase2-assignments.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md

## What changed
- Rebuilt the live `2A` and `2B` assignment shells in `assignment-runtime-main.js` so they now use the Phase 1 hero/header rail, Phase 1 step-nav treatment, Phase 1 review grid, and Phase 1 rubric table language while preserving the richer Phase 2 content model and field ids.
- Added dedicated runtime shell/step builder functions for both Phase 2 assignments instead of relying on fragment-level DOM surgery, so remounts now reconstruct the full authored Phase 1-style surface before save/load logic runs.
- Added Phase 1-style mobile step-toggle behavior for `2A` and `2B`, including runtime step-label sync, so the reused nav shell still works under the Phase 1 responsive CSS rules.
- Extended the scoped Phase 1 typography, nav, rubric, and mobile rules in `styles.css` to `#view-values` and `#view-master`, so the Phase 2 assignments inherit the same authored visual system instead of only sharing class names.
- Added a regression test that locks the new Phase 1 shell markers into the Phase 2 runtime (`Assignment 02A/02B`, `p1-phase-subtitle`, `p1-step-nav-shell`, `p1-review-grid`, `p1-rubric-shell`, `p1-rubric-table`).
- Reworked the live Phase 2 assignment runtime in `assignment-runtime-main.js` so `2A` now matches the restored lesson: three core values, value definitions, standards, task bridge, decision filters, support environment, warning signs, and self-compassion.
- Rebuilt the live `2B` runtime around the `Master Config` / `Integrated Discipline System` model: system audit, pre/in/post defaults, if-then plans, weekly process action, daily check, weekly review, recovery checkpoint, pit crew check-in, and authentic pride.
- Added the final Phase 2 fidelity prompts drawn directly from the lesson/PDF logic: `2A` now asks "What is driving your effort right now?" using the chapter's pressure/guilt/values/identity/enjoyment/fear lens, and `2B` now includes an outcome/performance/process goal ladder plus a push-vs-back-off / deload threshold prompt.
- Fixed the Phase 2 `Final Synthesis` / `Live Summary` scaling issue in `styles.css` by removing flex layout from the shared summary preview containers and returning them to normal text flow, so longer Phase 2 summaries wrap like prose instead of fragmenting into per-word flex items.
- Preserved legacy stored data where reasonable by mapping older `task` and `recovery` fields into the new Phase 2 structure during populate.
- Updated the Phase 2 print reports so `2A` and `2B` export the new aligned fields instead of the stale Phase 4 / `User Blueprint` copy, including the motivation-quality prompt, goal ladder, and recovery threshold.
- Added a targeted Phase 2 assignment test that locks the new runtime copy, field ids, and stale-label regressions.
- Added the missing `setStepMarkup` helper used by the Phase 2 master-config runtime rewrite; without it, both Phase 2 assignment surfaces could fail at load time with `setStepMarkup is not defined`.
- Hardened the Phase 2 score rehydration path so legacy rubric keys from older `vb_data` / `mb_data` saves no longer crash the view by targeting missing score-button groups.
- Replaced the stale session-level Phase 2 upgrade gate with DOM-instance upgrade markers so remounted assignment views still receive the Phase 2 rewrite when you leave and re-enter `2A` or `2B`.
- Added a shared assignment-shell sizing layer in `styles.css` that applies the final Phase 1 grid containment, step-nav sizing, rubric sizing, and large-desktop typography rules to `#view-phase1`, `#view-values`, and `#view-master` together instead of letting Phase 2 rely on partial selector copies.
- Added a regression test that locks the shared desktop sizing selectors in place so future assignment styling work can extend the same shell instead of drifting Phase 1 and Phase 2 apart.
- Changed the live Phase 2 review scale from a five-point shell to a three-level rubric scale so the score buttons now match the `Proficient / Developing / Emerging` rubric language: `2A` totals are now out of `15`, `2B` totals are now out of `12`, and the print reports now render per-row scores out of `3`.
- Added Phase 2 score normalization so older local saves that still use `5 / 3 / 1` or the earlier five-button scale rehydrate cleanly into the new `3 / 2 / 1` review model.
- Added Phase 2 field-card upgrade classes in `assignment-runtime-main.js` plus the matching card-layout rules in `styles.css` so the `Understanding Narrative` cards and the Step 03/04 field cards stop clipping or stretching awkwardly under the shared Phase 1 sizing layer.

## Why this changed
- The user asked for `2A` and `2B` to feel like Phase 1, not just to contain aligned Phase 2 prompts, and the previous runtime still looked like the older glass-panel system.
- Reusing the Phase 1 shell language keeps hierarchy, typography, review structure, and mobile behavior consistent across assignments while preserving the denser Phase 2 content.
- The restored Phase 2 lesson and `phase2-drive-content.pdf` make motivation quality, values-to-action, recovery, and social context first-class concepts, and the assignments needed to reflect that same course logic.
- The prior Phase 2 runtime was thinner than both the shell spec and the restored lesson, and parts of `2A` were effectively broken or incomplete.
- The final fidelity pass closes the remaining gap between "aligned enough" and the specific concepts the chapter emphasizes most: motivation quality, goal type hierarchy, and recovery/deload judgment.
- The summary-preview bug was caused by shared CSS, not the summary copy itself: the preview paragraphs were styled as flex containers, which breaks sentence flow once the Phase 2 summaries became longer.
- The remaining visual mismatch after the shell restyle was sizing: Phase 2 still missed Phase 1's later grid and large-desktop scale rules, so the new shared CSS layer makes the shell contract explicit for reuse on later assignments.
- The user found one more review mismatch after the sizing pass: the audit controls still behaved like a five-point scale even though the rubric is explicitly three-level, and some of the larger field cards were clipping once the new size rules were applied.

## Source of truth
- Project metadata: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\meta\project.json
- Canonical assignment shell entry: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime.html
- Canonical live Phase 2 assignment behavior and print/export logic: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js
- Canonical shared assignment-shell sizing and typography contract for Phase 1 and Phase 2: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\styles.css
- Canonical Phase 2 lesson and reading reference: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\main.js
- Canonical imported Phase 2 reading asset: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assets\readings\phase2-drive-content.pdf

## Fragile areas / watchouts
- The live Phase 2 assignment UI is now upgraded in place by `assignment-runtime-main.js`; the old Phase 2 HTML in `assignment-runtime.html` still exists but is effectively dormant for `2A` and `2B`.
- The `Final Synthesis` / `Live Summary` cards also depend on the shared summary-preview rule in `styles.css`, so layout edits there affect `2A`, `2B`, and `Phase 3`.
- The Phase 1 / Phase 2 shell size parity now depends on the shared selectors at the end of `styles.css`; edits there affect both phases together by design.
- The Phase 2 field-card repair is now partly runtime-driven: `assignment-runtime-main.js` upgrades the authored label cards with `phase2-field-*` classes before the shared CSS takes over their layout.
- The runtime upgrade depends on existing shell ids such as `vb-step1`, `vb-step2`, `mb-step0`, and `mb-step4`. If those containers are renamed in HTML, the upgrade path will drift or fail.
- The legacy-storage fallback is intentional. Removing the `task` and `recovery` migrations without a data migration plan would strand older local saves.
- The assignment copy now tracks the restored lesson and `phase2-drive-content.pdf`; if that source content changes again, the assignment prompts and report sections need to move with it.

## Next prompt should assume
- `2A` and `2B` are now the active Phase 2 assignment surfaces and are aligned to the restored lesson, not the older placeholder/runtime copy.
- The source of truth for the live Phase 2 assignment experience is `assignment-runtime-main.js`, not the older static Phase 2 markup alone.
- Phase 3 and Phase 4 assignments were not changed in this pass.
- The next likely step is manual Studio review and small wording/layout polish, not another structural rebuild.

## What still needs validation
- Manual Studio pass through `2A` and `2B` to confirm the new Phase 1-style shell feels right visually, saves correctly, and remains coherent on desktop and mobile.
- Manual Studio pass should confirm the new shared sizing layer actually matches Phase 1 card widths, heading scale, rubric density, and step-nav rhythm on desktop.
- Manual Studio pass should specifically confirm that the new `3`-button review rows feel right and that `Understanding Narrative`, `When do you push and when do you back off?`, and the Step 03 filter/support cards no longer clip at the card edges.
- Manual Studio pass should specifically re-check the `Final Synthesis` and `Live Summary` cards after the CSS fix.
- Manual `Generate PDF` / print-preview check for both Phase 2 assignments to confirm the new report layouts read well with realistic student input.
- Optional save/load regression pass using an older local `mb_data` payload to confirm the legacy fallback is sufficient for existing browsers.
- Optional wording trim if the new summary copy feels too dense in the live UI.

## Known risks
- Because the runtime upgrades the dormant Phase 2 shell in place, a future editor could change `assignment-runtime.html` and think they changed the live Phase 2 UI when they did not.
- The new test is string-contract oriented. It protects structure and regressions well, but it does not replace a visual QA pass.
- The new shared sizing layer is robust for reuse, but later Phase 3/4 adoption should still be done in controlled passes rather than by assuming every assignment already conforms.
- This pass intentionally did not normalize the underlying static HTML for Phase 2, so future maintenance still requires care around the runtime/markup split.
- The three-level review conversion preserves legacy scores by normalization rather than migration, so any future rubric-scale change should be treated as a data-shape change and handled explicitly.

## Exact next command
`npm.cmd run studio`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\styles.css`

## Do not do next / warnings
- Do not edit the dormant Phase 2 blocks in `assignment-runtime.html` and assume those edits will automatically reflect the live Phase 2 experience.
- Do not remove the legacy `task` / `recovery` populate fallback unless you also migrate stored `mb_data`.
- Do not treat `phase2-drive-content.pdf` as optional reference-only material for this phase; it now informs the assignment prompts directly.

---

## 2026-04-16 | docs/ops/ACTIVE_HANDOFF.md (pre-mentalwellness10-option2-phase4a-assignment-parity)

# Handoff

- Project: mentalwellness10-option2
- Task: Rebuild the Phase 3 assignment into the shared Phase 1/Phase 2 shell system, carrying forward the learned rubric, sizing, field-card, save/load, and print-report fixes.
- Status: ready for validation

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\styles.css
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\mentalwellness10-option2-phase2-assignments.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\mentalwellness10-option2-phase3-assignment.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\plans\2026-04-16-mentalwellness10-option2-phase3-assignment-parity-design.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\plans\2026-04-16-mentalwellness10-option2-phase3-assignment-parity.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ARCHIVED_HANDOFFS.md

## Verification run
- `node --check projects/mentalwellness10-option2/workspace/assignment-runtime-main.js`
- `npx tsx --test scripts/tests/mentalwellness10-option2-phase3-assignment.test.ts`
- `npx tsx --test scripts/tests/mentalwellness10-option2-phase2-assignments.test.ts scripts/tests/mentalwellness10-option2-phase3-assignment.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`
- `npm run test:e2e:project -- --project mentalwellness10-option2`

## What changed
- Replaced the older Phase 3 runtime block in `assignment-runtime-main.js` with a full Phase 1-style assignment shell for `Assignment 03`, `Focus Master Blueprint`, including the hero/header rail, mastery score card, file-actions card, authored step nav, review grid, and rubric table language.
- Rebuilt the Phase 3 flow around the five-step contract already implied by the course shell: `00 Briefing`, `01 Arena Audit`, `02 Cues and Anchors`, `03 Fortress Routine and What-If Reset`, and `04 Review`.
- Carried Phase 2's structural lessons forward into Phase 3: explicit shell builders, DOM-instance upgrade behavior, mobile step-menu syncing, field-card wrappers for large inputs, and summary text that renders as prose instead of fragmented layout tokens.
- Converted Phase 3 review scoring to the same three-level rubric model used by the aligned Phase 2 assignments, with legacy saved values normalized into the new `3 / 2 / 1` scale instead of crashing or drifting.
- Updated the Phase 3 print/report output so it now exports the new shell title, the five-step content, and row scores out of `3` instead of the older five-point/five-step assumptions.
- Extended the shared assignment-shell selectors in `styles.css` to include `#view-phase3`, so Phase 3 now inherits the same desktop sizing, typography, nav sizing, rubric density, large-desktop corrections, and responsive behavior already shared by Phase 1 and Phase 2.
- Added a dedicated Phase 3 regression test that locks the new shell markers, three-level rubric behavior, and shared styling contract into place.
- Broadened the Phase 2 selector assertions to recognize that Phase 3 now legitimately joins the shared shell contract instead of being a one-off special case.

## Why this changed
- The user asked to move to Phase 3 and apply the same learned logic from the Phase 2 pass instead of leaving Phase 3 on the older shell and rubric system.
- Phase 3 still looked and behaved like the pre-parity assignment runtime, which would have left the course inconsistent after the Phase 2 rebuild.
- Reusing the same shell and rubric contract is the cleanest path toward eventually making the remaining assignments feel coherent instead of maintaining separate styling and scoring systems per phase.

## Source of truth
- Project metadata: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\meta\project.json
- Canonical assignment shell entry: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime.html
- Canonical live Phase 3 assignment behavior and print/export logic: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js
- Canonical shared assignment-shell sizing and typography contract for Phase 1, Phase 2, and Phase 3: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\styles.css
- Canonical course-side assignment contract reference: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\main.js

## Fragile areas / watchouts
- The live Phase 3 UI is still upgraded in place by `assignment-runtime-main.js`; the dormant Phase 3 markup in `assignment-runtime.html` is not the full live truth by itself.
- The shared shell selectors in `styles.css` now intentionally affect Phase 1, Phase 2, and Phase 3 together. Future selector edits there have a wider blast radius than before.
- Legacy `p3_data` saves are normalized into the new three-level rubric model rather than migrated permanently. Any future scoring-model change should be treated as a data-shape change.
- The new Phase 3 field-card behavior depends on runtime-applied wrapper classes before the shared CSS takes over layout, similar to the Phase 2 pattern.
- The print/report output still depends on browser popup and print-preview behavior, so the export path can vary slightly across preview surfaces.

## Next prompt should assume
- Phase 3 now uses the shared Phase 1/Phase 2 assignment shell contract instead of the older bespoke runtime.
- The live Phase 3 assignment title is `Focus Master Blueprint`.
- Phase 3 review rows now use a three-level rubric scale, not a five-point scale.
- Phase 4 has not been upgraded to the shared shell yet.
- The next likely step is manual Studio validation or a controlled Phase 4 pass, not another Phase 3 structural rebuild unless visual issues appear.

## What still needs validation
- Manual Studio pass through the Phase 3 assignment on desktop and mobile to confirm the new shell sizing, field-card spacing, and step-nav behavior feel consistent with Phase 1 and Phase 2.
- Manual save/load pass with realistic Phase 3 data to confirm the new runtime shell, summary, and review areas all persist correctly after leaving and re-entering the view.
- Manual `Generate Blueprint PDF` / print-preview check for Phase 3 to confirm the rebuilt report reads cleanly with longer narrative content and the new rubric scale.
- Optional check with an older local `p3_data` payload if you want to confirm the normalization path is sufficient for previously saved browsers.

## Known risks
- Because the runtime upgrades dormant HTML in place, a future editor could still change `assignment-runtime.html` and mistakenly assume they changed the live Phase 3 experience when they did not.
- The regression tests protect the shell contract and scoring model, but they do not replace a visual QA pass in Studio.
- The broader shared shell selector contract is the right long-term move, but it increases the chance that later styling edits affect multiple phases at once if they are not tested carefully.

## Exact next command
`npm.cmd run studio`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js`

## Do not do next / warnings
- Do not edit the dormant Phase 3 blocks in `assignment-runtime.html` and assume those edits will automatically change the live assignment.
- Do not switch Phase 3 back to a five-point review scale unless you also update the saved-data normalization and print-report assumptions.
- Do not extend the shared Phase 1/2/3 shell selectors to Phase 4 casually; do that as its own controlled pass.

---

## 2026-04-16 | docs/ops/ACTIVE_HANDOFF.md (pre-mentalwellness10-option2-phase4b-assignment-parity)

# Handoff

- Project: mentalwellness10-option2
- Task: Rebuild Phase 4A into the shared Phase 1/2/3 assignment shell system, carrying forward the learned rubric, sizing, field-card, save/load, and print-report fixes.
- Status: ready for validation

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\styles.css
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\mentalwellness10-option2-phase2-assignments.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\mentalwellness10-option2-phase3-assignment.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\mentalwellness10-option2-phase4a-assignment.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\plans\2026-04-16-mentalwellness10-option2-phase4a-assignment-parity-design.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\plans\2026-04-16-mentalwellness10-option2-phase4a-assignment-parity.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ARCHIVED_HANDOFFS.md

## Verification run
- `node --check projects/mentalwellness10-option2/workspace/assignment-runtime-main.js`
- `npx tsx --test scripts/tests/mentalwellness10-option2-phase4a-assignment.test.ts`
- `npx tsx --test scripts/tests/mentalwellness10-option2-phase2-assignments.test.ts scripts/tests/mentalwellness10-option2-phase3-assignment.test.ts scripts/tests/mentalwellness10-option2-phase4a-assignment.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`
- `npm run test:e2e:project -- --project mentalwellness10-option2`

## What changed
- Replaced the older Phase 4A runtime block in `assignment-runtime-main.js` with a full Phase 1-style shell for `Assignment 04A`, `Confidence Master Blueprint`, including the hero/header rail, mastery score card, file-actions card, authored step nav, review grid, and rubric table language.
- Rebuilt the Phase 4A flow around the confidence contract already implied by the course shell: `00 Briefing`, `01 Bank`, `02 Control`, `03 Conviction`, and `04 Review`.
- Carried the Phase 2 and Phase 3 shell lessons forward into Phase 4A: explicit shell builders, DOM-instance upgrade behavior, mobile step-menu syncing, field-card wrappers for large inputs, and summary text that renders as prose instead of clipped widgets.
- Converted Phase 4A review scoring to the same three-level rubric model used by aligned Phase 2 and Phase 3 assignments, with legacy saved values normalized into the new `3 / 2 / 1` scale instead of crashing or drifting.
- Expanded the live Confidence build around the current course contract by adding a cleaner bank-account step, daily deposit logic, explicit lockdown reframe field, cue/belief/attachment structure, and a stronger review synthesis section.
- Updated the Phase 4A print/report output so it now exports the new shell title, the revised confidence fields, and row scores out of `3` instead of the older `/25` model.
- Extended the shared assignment-shell selectors in `styles.css` to include `#view-phase4a`, so Phase 4A now inherits the same desktop sizing, typography, nav sizing, rubric density, large-desktop corrections, and responsive behavior already shared by Phase 1, Phase 2, and Phase 3.
- Added a dedicated Phase 4A regression test that locks the new shell markers, three-level rubric behavior, and shared styling contract into place.
- Broadened the earlier shared-selector tests so Phase 2 and Phase 3 recognize that Phase 4A now legitimately joins the same shell contract.

## Why this changed
- The user asked to move directly from the finished Phase 3 pass to `4A` and apply the same learned logic instead of leaving Confidence on the older shell and five-point rubric system.
- Phase 4A still looked and behaved like the pre-parity runtime, which would have left Phase 4 visually and behaviorally behind the rest of the aligned assignment sequence.
- Reusing the same shell and rubric contract is the cleanest path toward eventually making the remaining assignments feel coherent instead of maintaining separate styling and scoring systems per phase.

## Source of truth
- Project metadata: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\meta\project.json
- Canonical assignment shell entry: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime.html
- Canonical live Phase 4A assignment behavior and print/export logic: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js
- Canonical shared assignment-shell sizing and typography contract for Phase 1, Phase 2, Phase 3, and Phase 4A: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\styles.css
- Canonical course-side assignment contract reference: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\main.js

## Fragile areas / watchouts
- The live Phase 4A UI is still upgraded in place by `assignment-runtime-main.js`; the dormant Phase 4A markup in `assignment-runtime.html` is not the full live truth by itself.
- The shared shell selectors in `styles.css` now intentionally affect Phase 1, Phase 2, Phase 3, and Phase 4A together. Future selector edits there have a wider blast radius than before.
- Legacy `p4a_data` saves are normalized into the new three-level rubric model rather than migrated permanently. Any future scoring-model change should be treated as a data-shape change.
- The new Phase 4A field-card behavior depends on runtime-applied wrapper classes before the shared CSS takes over layout, similar to the Phase 2 and Phase 3 pattern.
- The print/report output still depends on browser popup and print-preview behavior, so the export path can vary slightly across preview surfaces.

## Next prompt should assume
- Phase 4A now uses the shared Phase 1/2/3 assignment shell contract instead of the older bespoke runtime.
- The live Phase 4A assignment title is `Confidence Master Blueprint`.
- Phase 4A review rows now use a three-level rubric scale, not a five-point scale.
- Phase 4B has not been upgraded to the shared shell yet.
- The next likely step is manual Studio validation or a controlled Phase 4B pass, not another Phase 4A structural rebuild unless visual issues appear.

## What still needs validation
- Manual Studio pass through the Phase 4A assignment on desktop and mobile to confirm the new shell sizing, field-card spacing, and step-nav behavior feel consistent with Phase 1, Phase 2, and Phase 3.
- Manual save/load pass with realistic Phase 4A data to confirm the rebuilt bank-account step, summary, and review areas all persist correctly after leaving and re-entering the view.
- Manual `Generate Blueprint PDF` / print-preview check for Phase 4A to confirm the rebuilt report reads cleanly with longer narrative content and the new rubric scale.
- Optional check with an older local `p4a_data` payload if you want to confirm the normalization path is sufficient for previously saved browsers.

## Known risks
- Because the runtime upgrades dormant HTML in place, a future editor could still change `assignment-runtime.html` and mistakenly assume they changed the live Phase 4A experience when they did not.
- The regression tests protect the shell contract and scoring model, but they do not replace a visual QA pass in Studio.
- The broader shared shell selector contract is the right long-term move, but it increases the chance that later styling edits affect multiple phases at once if they are not tested carefully.

## Exact next command
`npm.cmd run studio`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js`

## Do not do next / warnings
- Do not edit the dormant Phase 4A blocks in `assignment-runtime.html` and assume those edits will automatically change the live assignment.
- Do not switch Phase 4A back to a five-point review scale unless you also update the saved-data normalization and print-report assumptions.
- Do not extend the shared Phase 1/2/3/4A shell selectors to Phase 4B casually; do that as its own controlled pass.

---

## 2026-04-16 | docs/ops/ACTIVE_HANDOFF.md (pre-mentalwellness10-option2-final-assignment-consistency-pass)

# Handoff

- Project: mentalwellness10-option2
- Task: Rebuild Phase 4B into the shared Phase 1/2/3/4A assignment shell system, carrying forward the learned rubric, sizing, field-card, save/load, and print-report fixes.
- Status: ready for validation

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\styles.css
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\mentalwellness10-option2-phase2-assignments.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\mentalwellness10-option2-phase3-assignment.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\mentalwellness10-option2-phase4a-assignment.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\mentalwellness10-option2-phase4b-assignment.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\plans\2026-04-16-mentalwellness10-option2-phase4b-assignment-parity-design.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\plans\2026-04-16-mentalwellness10-option2-phase4b-assignment-parity.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ARCHIVED_HANDOFFS.md

## Verification run
- `node --check projects/mentalwellness10-option2/workspace/assignment-runtime-main.js`
- `npx tsx --test scripts/tests/mentalwellness10-option2-phase4b-assignment.test.ts`
- `npx tsx --test scripts/tests/mentalwellness10-option2-phase2-assignments.test.ts scripts/tests/mentalwellness10-option2-phase3-assignment.test.ts scripts/tests/mentalwellness10-option2-phase4a-assignment.test.ts scripts/tests/mentalwellness10-option2-phase4b-assignment.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`
- `npm run test:e2e:project -- --project mentalwellness10-option2`

## What changed
- Replaced the older Phase 4B runtime block in `assignment-runtime-main.js` with a full Phase 1-style shell for `Assignment 04B`, `Visualization Master Blueprint`, including the hero/header rail, mastery score card, file-actions card, authored step nav, review grid, and rubric table language.
- Rebuilt the Phase 4B flow around the visualization contract already implied by the course shell: `00 Briefing`, `01 Sanctuary`, `02 Performance`, `03 Reset`, and `04 Review`.
- Preserved the existing visualization data model and storage key (`athlete_visualization_master_v1`) while moving the live runtime onto the same DOM-upgrade, mobile step-menu, field-card, and print-report pattern already used by Phase 2, Phase 3, and Phase 4A.
- Converted Phase 4B review scoring to the same three-level rubric model used by the aligned assignments, with legacy saved values normalized into the new `3 / 2 / 1` scale instead of leaving the old five-point behavior in place.
- Expanded the live visualization build around the current course contract by adding a stronger sanctuary step, multisensory performance step, reset-drill step, full script synthesis area, and summary narrative block.
- Updated the Phase 4B print/report output so it now exports the new shell title, the revised visualization fields, and row scores out of `3` instead of the older `/25` model.
- Extended the shared assignment-shell selectors in `styles.css` to include `#view-phase4b`, so Phase 4B now inherits the same desktop sizing, typography, nav sizing, rubric density, large-desktop corrections, and responsive behavior already shared by Phase 1, Phase 2, Phase 3, and Phase 4A.
- Added a dedicated Phase 4B regression test that locks the new shell markers, three-level rubric behavior, and shared styling contract into place.
- Broadened the earlier shared-selector tests so Phase 2, Phase 3, and Phase 4A recognize that Phase 4B now legitimately joins the same shell contract.

## Why this changed
- The user asked to continue the same parity pass into `4B` instead of leaving Visualization on the older shell and five-point rubric system.
- Phase 4B still looked and behaved like the pre-parity runtime, which would have left the final assignment in the sequence visually and behaviorally behind the rest of the aligned assignments.
- Reusing the same shell and rubric contract is the cleanest path toward making the assignment sequence coherent instead of maintaining separate styling and scoring systems per phase.

## Source of truth
- Project metadata: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\meta\project.json
- Canonical assignment shell entry: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime.html
- Canonical live Phase 4B assignment behavior and print/export logic: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js
- Canonical shared assignment-shell sizing and typography contract for Phase 1, Phase 2, Phase 3, Phase 4A, and Phase 4B: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\styles.css
- Canonical course-side assignment contract reference: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\main.js

## Fragile areas / watchouts
- The live Phase 4B UI is still upgraded in place by `assignment-runtime-main.js`; the dormant Phase 4B markup in `assignment-runtime.html` is not the full live truth by itself.
- The shared shell selectors in `styles.css` now intentionally affect Phase 1, Phase 2, Phase 3, Phase 4A, and Phase 4B together. Future selector edits there have a wider blast radius than before.
- Legacy `athlete_visualization_master_v1` saves are normalized into the new three-level rubric model rather than migrated permanently. Any future scoring-model change should be treated as a data-shape change.
- The new Phase 4B field-card behavior depends on runtime-applied wrapper classes before the shared CSS takes over layout, similar to the Phase 2, Phase 3, and Phase 4A pattern.
- The print/report output still depends on browser popup and print-preview behavior, so the export path can vary slightly across preview surfaces.

## Next prompt should assume
- Phase 4B now uses the shared Phase 1/2/3/4A assignment shell contract instead of the older bespoke runtime.
- The live Phase 4B assignment title is `Visualization Master Blueprint`.
- Phase 4B review rows now use a three-level rubric scale, not a five-point scale.
- Phase 4A and Phase 4B now both sit on the shared shell contract.
- The next likely step is manual Studio validation of the rebuilt Phase 4 assignments or a final consistency pass across the whole assignment sequence.

## What still needs validation
- Manual Studio pass through the Phase 4B assignment on desktop and mobile to confirm the new shell sizing, field-card spacing, and step-nav behavior feel consistent with the already aligned assignments.
- Manual save/load pass with realistic Phase 4B data to confirm the rebuilt sanctuary, script, reset, and review areas all persist correctly after leaving and re-entering the view.
- Manual `Generate Blueprint PDF` / print-preview check for Phase 4B to confirm the rebuilt report reads cleanly with longer script and narrative content.
- Optional cross-pass check of Phase 4A and Phase 4B together if you want to validate the final phase as a consistent pair before moving on.

## Known risks
- Because the runtime upgrades dormant HTML in place, a future editor could still change `assignment-runtime.html` and mistakenly assume they changed the live Phase 4B experience when they did not.
- The regression tests protect the shell contract and scoring model, but they do not replace a visual QA pass in Studio.
- The broader shared shell selector contract is the right long-term move, but it increases the chance that later styling edits affect multiple phases at once if they are not tested carefully.

## Exact next command
`npm.cmd run studio`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js`

## Do not do next / warnings
- Do not edit the dormant Phase 4B blocks in `assignment-runtime.html` and assume those edits will automatically change the live assignment.
- Do not switch Phase 4B back to a five-point review scale unless you also update the saved-data normalization and print-report assumptions.
- Do not treat the shared shell selectors as Phase 4-only; they now intentionally cover the aligned assignment sequence together.

## 2026-04-16 | docs/ops/ACTIVE_HANDOFF.md (pre-worldreligions30-archive-variants)

# Handoff

- Project: mentalwellness10-option2
- Task: Final cross-phase consistency pass across the aligned assignments after the Phase 4A and 4B parity rebuilds.
- Status: ready for validation

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\styles.css
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\mentalwellness10-option2-phase2-assignments.test.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ARCHIVED_HANDOFFS.md

## Verification run
- `npx tsx --test scripts/tests/mentalwellness10-option2-phase2-assignments.test.ts`
- `npx tsx --test scripts/tests/mentalwellness10-option2-phase2-assignments.test.ts scripts/tests/mentalwellness10-option2-phase3-assignment.test.ts scripts/tests/mentalwellness10-option2-phase4a-assignment.test.ts scripts/tests/mentalwellness10-option2-phase4b-assignment.test.ts`
- `npm run test:e2e:project -- --project mentalwellness10-option2`

## What changed
- Performed a final cross-phase scan over the aligned assignment sequence instead of only trusting the parity tests.
- Confirmed there were no remaining stale five-point Phase 2/3/4 review rows, stale Phase 4 titles, or leftover pre-parity `4B` runtime hooks in the live assignment source.
- Found one real consistency gap: the explicit summary-preview text-flow CSS only covered `2A`, `2B`, and `3`, while `4A` and `4B` now use the same prose-summary pattern.
- Extended the shared summary-preview CSS block to include `#p4a-summary-preview` and `#p4b-summary-preview`, and extended the shared span rule with them too so all aligned assignment summaries now share the same explicit text-flow contract.
- Tightened the summary-preview regression test so future edits must keep `2A`, `2B`, `3`, `4A`, and `4B` on the same non-flex summary layout path.

## Why this changed
- The user asked for a final pass across all phases to catch anything still drifting after the parity work.
- Most of the assignment sequence was already aligned, but the summary-preview CSS block lagged behind the newer Phase 4 summary components.
- Fixing that now reduces the chance of future Phase 4 summary regressions if the shared preview styling is edited again later.

## Source of truth
- Canonical live assignment behavior: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\assignment-runtime-main.js
- Canonical shared assignment styling: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\styles.css
- Canonical cross-phase regression coverage: C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\mentalwellness10-option2-phase2-assignments.test.ts

## Fragile areas / watchouts
- The live assignments still upgrade dormant HTML in place, so `assignment-runtime-main.js` remains the live behavior source of truth.
- Shared selector blocks in `styles.css` now intentionally affect the aligned assignment sequence together, which is good for parity but raises the blast radius of future styling edits.
- The new summary-preview contract is explicit now, but it still depends on future Phase 4 summaries keeping the same prose-style preview pattern.

## Next prompt should assume
- Phase 2 through Phase 4B are aligned on the shared shell contract.
- The final cross-phase scan did not uncover any larger structural or scoring regressions beyond the summary-preview CSS gap.
- The next likely step is manual Studio validation or moving to a different project area, not another assignment-shell rebuild.

## What still needs validation
- Manual Studio pass across the aligned assignments, especially `4A` and `4B`, to confirm the summary cards still read correctly after the explicit summary-preview rule was broadened.
- Manual print-preview spot check if you want to confirm no long narrative cards or summaries wrap unexpectedly in browser print preview.

## Known risks
- The automated checks cover structure and selector contracts, but they do not replace visual QA in Studio.
- Because the shared rules are becoming more centralized, future CSS edits should continue to be validated across the full aligned sequence instead of just one phase.

## Exact next command
`npm.cmd run studio`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\mentalwellness10-option2\workspace\styles.css`

## Do not do next / warnings
- Do not assume dormant markup in `assignment-runtime.html` is the live source of truth for the rebuilt assignments.
- Do not break the shared summary-preview block back into phase-specific variants unless the runtime summary pattern actually diverges.

---

## 2026-04-17 | docs/ops/ACTIVE_HANDOFF.md (pre-sportswellness-image-sizing)

# Handoff

- Project: sportswellness
- Task: Collapse the old Mental Wellness variants into one canonical Sports Wellness shell, rename the active option2 project to `sportswellness`, and bring Phase 3 up to the same lesson/quiz/figure parity as the other authored phases.
- Status: ready for validation

## Summary
- Removed the extra Sports Wellness variants from Studio by deleting `mentalwellness10` and `mentalwellness10-option1`, then renamed the active `mentalwellness10-option2` project family to `sportswellness` across `projects/`, `projects/processed/`, and `projects/resources/`.
- Updated the live shell branding and project metadata so Studio now works against a single `sportswellness` slug and only exposes the `workspace` preview mode to avoid confusion with the untouched raw baseline.
- Rebuilt Phase 3 to match the other authored phases: it now has a real `Quiz 03` entry in the quiz library, a linked `quizId` from the lesson, and the five embedded document figures restored as named `phase3-figures` assets used by the lesson cards.

## Files changed
- `projects/sportswellness/workspace/main.js`
- `projects/sportswellness/workspace/index.html`
- `projects/sportswellness/workspace/assignment-runtime.html`
- `projects/sportswellness/workspace/assignment-runtime-main.js`
- `projects/sportswellness/workspace/assets/readings/phase3-focus-content.pdf`
- `projects/sportswellness/workspace/assets/readings/phase3-figures/*`
- `projects/sportswellness/meta/project.json`
- `projects/sportswellness/meta/e2e-contract.json`
- `projects/sportswellness/meta/prompt-pack.md`
- `projects/sportswellness/meta/content-outline.md`
- `projects/sportswellness/meta/import-log.md`
- `scripts/tests/sportswellness-phase2-content.test.ts`
- `scripts/tests/sportswellness-phase2-assignments.test.ts`
- `scripts/tests/sportswellness-phase3-content.test.ts`
- `scripts/tests/sportswellness-phase3-assignment.test.ts`
- `scripts/tests/sportswellness-phase3-parity.test.ts`
- `scripts/tests/sportswellness-phase4a-assignment.test.ts`
- `scripts/tests/sportswellness-phase4b-assignment.test.ts`
- Removed old project directories: `projects/mentalwellness10`, `projects/mentalwellness10-option1`, and their matching `processed` / `resources` mirrors

## Verification run
- `node --check projects/sportswellness/workspace/main.js`
- `node --check projects/sportswellness/workspace/assignment-runtime-main.js`
- `npx tsx --test scripts/tests/sportswellness-phase2-content.test.ts scripts/tests/sportswellness-phase2-assignments.test.ts scripts/tests/sportswellness-phase3-content.test.ts scripts/tests/sportswellness-phase3-assignment.test.ts scripts/tests/sportswellness-phase4a-assignment.test.ts scripts/tests/sportswellness-phase4b-assignment.test.ts scripts/tests/sportswellness-phase3-parity.test.ts`
- `npm.cmd run build:studio`
- `npm.cmd run test:e2e:project -- --project sportswellness`
- `npm.cmd run test:e2e:smoke`

## Known risks / follow-up
- The raw baseline still contains the original Mental Fitness label because it remains an immutable import artifact; confusion is mitigated by restricting this project to `workspace` preview only.
- Archived docs and historical handoffs still reference the old `mentalwellness10-option2` slug by design.

## Source-of-truth location
- `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\index.html`
- `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\main.js`
- `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\assignment-runtime-main.js`

## Fragile areas / what might drift
- The slug cleanup depends on `projects/`, `processed/`, and `resources/` staying aligned. Reintroducing old processed snapshots with the deleted slugs would make them visible to Studio again.
- Phase 3 figures are now wired by explicit file paths inside `PHASE_CONTENT['phase-3']`; renaming those assets without updating the lesson data will break the figures immediately.
- The Phase 1 assignment now reads from a new storage key and falls back to the option2-era key plus the older legacy key. If the storage migration logic is simplified later, existing local saves could be lost.

## Next prompt assumptions
- `sportswellness` is now the only active Sports Wellness project slug.
- Phase 3 should be edited in `projects/sportswellness/workspace/main.js`, not in any deleted `mentalwellness10*` project.

## Exact next command
`npm.cmd run studio`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\main.js`


