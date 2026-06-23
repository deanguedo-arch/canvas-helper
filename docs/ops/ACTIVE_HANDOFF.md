# Handoff

## Current Active Task: Social 30-1 Related Issue Shells

- Project: `social30-1-related-issue-1`, `social30-1-related-issue-2`, `social30-1-related-issue-3`, `social30-1-related-issue-4`
- Task: Build four separate Social Studies 30-1 related-issue shells from the uploaded Brightspace export and make them visible in Studio/Course Showcase.
- Status: complete / ready for visual review and later per-issue refinement

## Summary

- Added a reusable Social 30-1 conversion builder at `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-social30-related-issues.ts`.
- Generated four separate clean shells from `/Users/deanguedo/Downloads/D2LExport_6712_CBE System Social Studies 30-1 (Winter 2020)_202662203.zip`.
- Grouped the original seven Brightspace units into Alberta curriculum related issues:
  - Related Issue 1: U1 + U2, 23 lessons recovered
  - Related Issue 2: U3 + U4, 22 lessons recovered
  - Related Issue 3: U5 + U6, 23 lessons recovered
  - Related Issue 4: U7, 13 lessons recovered
- Each shell uses the shared Next Step course shell and includes lesson pages plus support pages:
  - Issue Inquiry
  - Source Analysis
  - Position Builder
  - Evidence Bank
  - Resources
- Imported lesson HTML is decoded from Brightspace, sanitized, and routed through local lesson hashes where possible.
- Copied recovered image/media/resource assets into each issue workspace instead of leaving broken Brightspace references.
- Registered all four projects in Studio project ordering and labels.
- Added all four Social 30-1 issues to the Course Showcase carousel/list.
- The 208MB Brightspace source ZIP is referenced rather than duplicated into each project raw folder.

## Files Changed

- `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-social30-related-issues.ts`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social30-1-related-issue-1/workspace/index.html`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social30-1-related-issue-1/meta/project.json`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social30-1-related-issue-1/meta/conversion-notes.md`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social30-1-related-issue-2/workspace/index.html`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social30-1-related-issue-2/meta/project.json`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social30-1-related-issue-2/meta/conversion-notes.md`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social30-1-related-issue-3/workspace/index.html`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social30-1-related-issue-3/meta/project.json`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social30-1-related-issue-3/meta/conversion-notes.md`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social30-1-related-issue-4/workspace/index.html`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social30-1-related-issue-4/meta/project.json`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social30-1-related-issue-4/meta/conversion-notes.md`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/app/studio/src/lib/project-display.ts`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/course-showcase/workspace/main.js`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md`

## Verification Run

- `npx tsx scripts/build-social30-related-issues.ts`
- `npm run verify -- --project social30-1-related-issue-1`
- `npm run verify -- --project social30-1-related-issue-2`
- `npm run verify -- --project social30-1-related-issue-3`
- `npm run verify -- --project social30-1-related-issue-4`
- `npm run build:studio`
- `npm run typecheck`

Verification notes:
- All four Social issue `npm run verify` commands passed.
- `npm run build:studio` passed.
- `npm run typecheck` still fails on unrelated pre-existing baseline generator files:
  - `scripts/build-ela-short-stories.ts`
  - `scripts/build-ela20-novel-study.ts`
  - `scripts/build-forensics-module1-static.ts`
- The new Social builder was initially flagged by typecheck and then fixed; it no longer appears in the remaining typecheck failure list.

## Known Risks / Follow-Up

- The shells are filled with recovered lessons/resources and ready for review, but they have not yet had the same per-activity polish pass as Short Stories, Othello, Feature Film, or Novel Study.
- Related Issue support pages are scaffolded as strong learner workflows, not yet curriculum-final assessment tasks.
- Resource quality depends on what the Brightspace ZIP exposed; some recovered items may need manual renaming or grouping for teacher-facing clarity.
- The Course Showcase was updated manually; if a future showcase generator exists, this entry should move into the generator/source-of-truth path.
- The repo worktree contains many unrelated dirty files from prior Novel Study/Feature Film workflow updates; do not assume all dirty files belong to the Social task.

## Source-Of-Truth Location

- Builder: `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-social30-related-issues.ts`
- Shared shell: `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/next-step-course-shell.ts`
- Source ZIP: `/Users/deanguedo/Downloads/D2LExport_6712_CBE System Social Studies 30-1 (Winter 2020)_202662203.zip`
- Project metadata:
  - `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social30-1-related-issue-1/meta/project.json`
  - `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social30-1-related-issue-2/meta/project.json`
  - `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social30-1-related-issue-3/meta/project.json`
  - `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/social30-1-related-issue-4/meta/project.json`

## Fragile Areas / What Might Drift

- Re-running the builder overwrites all four Social workspaces.
- If the shared Next Step shell changes, regenerate these issue shells to keep header/sidebar/progress behavior aligned with the current standard.
- Studio labels/order live in `app/studio/src/lib/project-display.ts`; Course Showcase entries live separately in `projects/course-showcase/workspace/main.js`.
- External Google Fonts and Material Symbols remain baseline shell dependencies and appear as verifier warnings, not missing local assets.

## Next Prompt Assumptions

- If the user says to keep polishing Social 30-1, start with Related Issue 1 in the direct Studio preview and compare against Short Stories/Feature Film shell behavior.
- If the user asks for SCORM, package each related issue separately rather than combining all four into one ZIP.
- If the user asks for bulk conversion process changes, generalize from this builder and the Feature Film/Short Stories shell patterns.

## Exact Next Command

`npx tsx scripts/build-social30-related-issues.ts --zip "/Users/deanguedo/Downloads/D2LExport_6712_CBE System Social Studies 30-1 (Winter 2020)_202662203.zip"`

## Exact Next File To Open

`/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-social30-related-issues.ts`

---

## Previous Active Task: Novel Study Clean Build

- Project: `ela20-1-novel-study-clean`
- Task: Add a Short Story Questions-style `Novel Study Questions` section under Reading Guide and integrate Writing Studio activities.
- Status: complete / ready for user visual review in Studio

## Summary

- Added a `Novel Study Questions` sidebar item directly under `Reading Guide`.
- Adapted the Short Stories question format for Novel Study:
  - section dropdown
  - dark document header
  - formative progress bar
  - `Show Hints`
  - `Print / PDF`
  - numbered prompts
  - response textareas
  - word counts
  - local autosave / reload restore
- Built the Novel Study Questions content from `/Users/deanguedo/Downloads/Copy of ELA 30-1 Unit 6 Extended Text cp/Copy of ELA 30-1 Unit 6 Extended Text cp.docx`:
  - Section 1: 9 questions
  - Section 2: 9 questions
  - Section 3: 6 questions
- Added a `Critical Analytical Essay Prep` synthesis area for working thesis and evidence planning.
- Removed `Introduction to Novel Study` from the canonical Novel Study lesson source list.
- Regenerated the workspace so the sidebar, lesson index, progress labels, Resources list, and next/previous lesson links now use a 3-lesson sequence:
  - Lesson 1: `Novel Unit Introduction`
  - Lesson 2: `Characteristics of a Novel`
  - Lesson 3: `How to Read a Novel`
- Cleaned the Novel Study builder's imported lesson sanitizer:
  - removes CBE footer noise
  - removes empty wrapper fragments
  - converts imported blockquotes into styled source callouts
  - flattens stray nested list markup from the Brightspace source
- Expanded the Reading Guide from three generic note boxes into five focused tools:
  - Reading plan
  - Character map
  - Conflict tracker
  - Passage log
  - Theme builder
- Rebuilt the Reading Guide into a running `Novel Evidence Notebook`, adapted from the Feature Film evidence-bank system:
  - novel title, reading pass, and current focus setup fields
  - first-reaction and working-pattern baseline notes
  - passage-entry form for chapter/page, evidence type, quotation or moment, context, author's choice, reader effect, theme/character connection, and usefulness as evidence
  - persistent evidence bank with evidence-type filtering, edit, delete, and `Mark strongest` controls
  - synthesis prompts that help turn saved passages into responses or critical essay evidence
  - `Print Reading Portfolio` action
  - hidden JSON response field `reading-evidence-bank-json` so saved passage cards use the existing shared response/autosave storage
- Matched the Feature Film Viewing Guide setup layout in the Novel Study Reading Guide so the novel title spans the full row and long selected dropdown values have enough visible width.
- Expanded the Writing Studio with:
  - stronger controlling-idea guidance
  - an evidence connection field
  - a revision checklist with persistent checkbox state
  - the existing print/PDF action
- Reworked the Writing Studio to match the Othello activity-picker pattern:
  - `Analytical Paragraph Builder` remains the default activity
  - the paragraph builder now uses the same instruction/form/bank pattern as the other Writing Studio tools
  - `Save paragraph` stores each paragraph attempt as a separate saved submission
  - the `Paragraph bank` supports multiple saved paragraph submissions, revision-check counts, remove controls, and bottom-positioned print/PDF
  - `Motif String Board` is available as a second workbook activity
  - motif evidence cards save into the existing responses key
  - board controls include instructions, an explicit `Save to board` action, motif filters, chapter sort, text-based remove controls, and bottom-positioned print/PDF
- Added `Author's Intent Toggle` as a third Writing Studio activity:
  - collapsed plot-level question dropdown with wrapped selected text and wrapped menu options
  - plot response field
  - pivot to author-level analysis
  - saved local archive of paired plot/author responses
  - new-analysis and remove controls
  - bottom-positioned print/PDF
  - external Firebase, Gemini, and Tailwind dependencies from the pasted standalone activity were not carried into the course
- Added a `Critical Essay` dropdown section directly after `Lessons`:
  - built from `/Users/deanguedo/Downloads/ELA 20-1 30-1 FORMAT Tips for Writing a Critical - Copy (1).pdf`
  - split into six writing lessons: `Topic and Thesis`, `Introduction`, `Body 1: Beginning`, `Body 2: Middle`, `Body 3: End`, and `Conclusion and Revision`
  - includes Alberta 30-1 critical/analytical assignment alignment through reporting categories: Thought and Understanding, Supporting Evidence, Form and Structure, Matters of Choice, and Matters of Correctness
  - adds student planning fields for each lesson using the shared local response storage
  - each page now opens with a top-positioned overview-style `I can...` outcomes block, followed by a `Lesson`, model move, application steps, and a specific purpose statement for the student planning space
  - each lesson page now includes a compact `Example` panel and a `Diploma tip` panel between the lesson explanation and application steps
  - the PDF's teacher-written guidance paragraphs are now integrated into the lesson bodies and application steps, including the introduction structure, thesis frame, no-first-person reminder, one-character/multiple-character body paragraph route, beginning/middle/end character-development prompts, epiphany/change language, and conclusion/human-condition guidance
  - individual writing lesson pages no longer show outcome category chips above the lesson content
- Extended the shared Next Step shell with backwards-compatible `navGroups` support so project builders can add dropdown nav sections after Lessons.
- Fixed shared Next Step shell sidebar state so route changes close unrelated dropdown groups and leave only the current top-level nav button active.
- Renamed `Source Resources` to `Course Resources` and added a short learner-facing purpose line.
- Updated the Novel Study builder so regeneration preserves `createdAt` and `importedAt` provenance while refreshing `updatedAt`.
- Regenerated `projects/ela20-1-novel-study-clean/workspace/index.html` from the canonical builder.
- Updated the old legacy renderer progress literal so it also derives from the current lesson source count.

## Files Changed

- `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-ela20-novel-study-clean.ts`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/next-step-course-shell.ts`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-novel-study-clean/workspace/index.html`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-novel-study-clean/meta/project.json`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-novel-study-clean/meta/conversion-notes.md`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md`

## Verification Run

- `npx tsx scripts/build-ela20-novel-study-clean.ts --zip "/Users/deanguedo/Downloads/D2LExport_6668_CBE System ELA 20-1 (Winter 2020)_202661808 (1).zip" --slug ela20-1-novel-study-clean`
- `npm run verify -- --project ela20-1-novel-study-clean`
- Generated workspace scan confirmed:
  - `Novel Study Questions`, `novel-study-questions`, `Section 1 Questions`, `Section 2 Questions`, `Section 3 Questions`, `data-novel-question`, and `Critical Analytical Essay Prep` are present
  - representative DOCX questions are present: `How does the novel begin?`, `Has the conflict changed? Explain.`, and `What overall influence did the setting have on the events of the novel and the characters?`
  - `Introduction to Novel Study`, `lesson-2-introduction-to-novel-study`, `20-1introtonovelstudy`, `0 / 4 lessons`, `0/4`, and `4 source lessons` no longer appear in the active clean builder/workspace/notes set
  - progress now reads `0 / 3 lessons` and `0/3`
  - `Characteristics of a Novel` is now Lesson 2; `How to Read a Novel` is now Lesson 3
  - no `CBe-learn`, `Calgary Board`, `<p></p>`, or `<div></div>` cleanup leftovers
  - `Reading plan`, `Passage log`, `Theme builder`, `Revision check`, `evidence-connection`, `Course Resources`, and `.source-callout` are present
  - `createdAt` and `importedAt` stayed at `2026-06-21T14:13:25.870Z`; `updatedAt` refreshed
- `npm run build:studio`
- Browser smoke against direct workspace preview confirmed:
  - `Novel Study Questions` route opens
  - Section 1 / Section 3 switching works
  - hints toggle visible
  - progress updates to `1 of 6 answered`
  - word count updates
  - Section 1 and Section 3 responses persist after reload
  - `Writing Studio` opens with the activity picker
  - selecting `Motif String Board` reveals the board activity
  - a quotation can be pinned as a motif evidence card
  - the old top-row `Pin to board`, `Export JSON`, and `Import JSON` controls are removed
  - motif filtering and chapter sort work
  - the motif card persists after reload
  - final refinement smoke confirmed the instructions block is visible, Print/PDF is at the bottom, `Save to board` creates separate saved cards, the board displays all saved cards, the old close icon is gone, test cards can be removed cleanly, and no browser console errors were logged
  - `Author's Intent Toggle` appears in the Writing Studio dropdown
  - selecting it opens the plot-level view
  - plot-level questions render in a wrapped dropdown instead of a clipped button stack
  - plot response pivots into the author-level view and appears in the reference block
  - saving creates a paired analysis in `Saved Analyses`
  - temporary browser-smoke analysis was removed cleanly
  - no external Firebase/Gemini/Tailwind runtime references are present in the generated workspace
  - no browser console errors
- Browser smoke after the paragraph-builder refinement confirmed:
  - `Analytical Paragraph Builder` opens as the default Writing Studio activity
  - `Save paragraph` creates a saved paragraph-bank card
  - the bank count updates to `1 saved paragraph` and `0 saved paragraphs`
  - active draft fields and revision checkboxes clear after saving so a new submission can start
  - test saved submissions can be removed cleanly
  - the paragraph builder has no horizontal overflow in the direct workspace preview
  - no browser console errors
- Browser smoke after the Author's Intent dropdown refinement confirmed:
  - the selected plot-level question wraps in the closed dropdown summary
  - opening the dropdown reveals all 8 prompt options in a scrollable menu
  - long menu options wrap without horizontal overflow
  - selecting a prompt updates the summary, marks the active option with `aria-selected="true"`, and closes the dropdown
  - no browser console errors
- Browser smoke after the Critical Essay dropdown addition confirmed:
  - sidebar order is `Overview`, `Lessons`, `Critical Essay`, `Reading Guide`, `Novel Study Questions`, `Writing Studio`, `Resources`
  - `Critical Essay` opens as a dropdown and routes to the `Critical Analytical Essay Guide`
  - the dropdown contains all six writing lesson pages
  - the index page shows six sequence cards and the five Alberta-style reporting categories
  - `Body Paragraph 2 - The Middle` opens from the dropdown and shows outcome tags and planning fields
  - a planning field autosaves and restores after reload; the temporary smoke-test text was removed afterward
  - no horizontal overflow and no browser console errors
- Browser smoke after the Critical Essay lesson refinement confirmed:
  - `Topic Control and Thesis` shows lesson instruction, `Model move`, `How to apply it`, `Success check`, and specific planning-space direction
  - `Body Paragraph 2 - The Middle` uses its own lesson copy and specific planning-space direction
  - the old `What this lesson covers` heading no longer appears in the generated workspace
  - no horizontal overflow and no browser console errors
- Browser smoke after the Critical Essay success-check refinement confirmed:
  - `Body Paragraph 2 - The Middle` now starts with the same `I can...` outcomes pattern used on the Overview page
  - the criteria rows are lower-case ability statements under the shared `I can...` lead-in, rather than repeated full `I can...` sentences
  - the instruction panel is titled `Lesson`, not `Mini lesson`
  - the individual page outcome chips are removed
  - no horizontal overflow and no browser console errors
- Browser smoke after adding Critical Essay examples and diploma tips confirmed:
  - `Body Paragraph 2 - The Middle` shows `Example` and `Diploma tip` panels after `Lesson`
  - diploma tip text is not duplicated with a second `Diploma tip:` prefix
  - no horizontal overflow and no browser console errors
- Browser/source smoke after expanding the Critical Essay PDF integration confirmed:
  - `Topic and Thesis` includes the intro/thesis/body/conclusion essay structure, beginning/middle/end character-development focus, no-first-person reminder, thesis frame, and one-character/multiple-character body route
  - hidden Critical Essay lesson source contains the PDF-specific introduction examples (`On the Rainy River`, `Sound of Metal`), Body 1 issue/trouble prompts, Body 2 past/new/epiphany prompts, Body 3 changed-character prompts, and conclusion/human-condition prompts
  - no horizontal overflow and no browser console errors
- Rebuilt after adapting the Feature Film evidence-notebook system to the Novel Study Reading Guide:
  - `npx tsx scripts/build-ela20-novel-study-clean.ts --zip "/Users/deanguedo/Downloads/D2LExport_6668_CBE System ELA 20-1 (Winter 2020)_202661808 (1).zip" --slug ela20-1-novel-study-clean`
  - `npm run verify -- --project ela20-1-novel-study-clean`
  - `npm run build:studio`
- Generated workspace scan confirmed `reading-notebook`, `reading-evidence-bank-json`, `Add passage evidence`, `Save passage`, `Evidence bank`, `Turn the bank into a response`, and `Print Reading Portfolio` are present.
- Browser smoke after the Reading Guide notebook update confirmed:
  - `#reading-guide` opens with the `Novel Reading Guide`
  - the notebook, hidden JSON store, save button, and evidence bank are present
  - a passage card can be saved with chapter/page, evidence type, quotation/moment, context, author's choice, effect, connection, and evidence-use notes
  - `Mark strongest` updates the card and summary
  - saved passage cards persist after reload through shared response storage
  - the temporary browser-smoke passage was removed cleanly
  - no horizontal overflow and no browser console errors
- Browser layout smoke after the Reading Guide setup refinement confirmed:
  - `Reading pass` and `Current focus` render as two equal-width controls under the full-width novel title
  - `Final evidence review` and `Turning point` fit without clipping at a 1117px learner-preview viewport
  - no horizontal overflow
- Rebuilt after the shared sidebar active-state fix:
  - `npx tsx scripts/build-ela20-novel-study-clean.ts --zip "/Users/deanguedo/Downloads/D2LExport_6668_CBE System ELA 20-1 (Winter 2020)_202661808 (1).zip" --slug ela20-1-novel-study-clean`
  - `npm run verify -- --project ela20-1-novel-study-clean`
  - `npm run build:studio`
- Browser route-state smoke confirmed Novel Study keeps exactly one active top-level nav button while moving through `Critical Essay`, `Reading Guide`, `Novel Study Questions`, `Writing Studio`, `Resources`, and `Lessons`; unrelated dropdown groups close correctly.
- `npm run typecheck` still fails on unrelated baseline files:
  - `scripts/build-ela-short-stories.ts`
  - `scripts/build-ela20-novel-study.ts`
  - `scripts/build-forensics-module1-static.ts`

## Known Risks / Follow-Up

- Studio iframe automation had click-coordinate issues at the 75% scaled preview, so interaction verification was done against the direct workspace preview URL.
- The shared Next Step shell remains a source of generated workspace changes when the builder is rerun.
- Sidebar active/open behavior is centralized in `scripts/lib/next-step-course-shell.ts`; regenerate affected workspaces after shell changes.
- `npm run typecheck` remains blocked by existing baseline generator errors outside this clean Novel Study builder.
- Existing localStorage completion state may still contain the removed lesson id in a learner browser, but progress only counts the current 3 active lesson ids.
- Novel Study Questions, Critical Essay planning fields, Analytical Paragraph Builder, Motif String Board, and Author's Intent Toggle all use the same responses storage key as the rest of the clean Novel Study build: `canvas-helper:ela20-1-novel-study-clean:responses`.
- Reading Guide evidence-bank persistence depends on the hidden JSON response field `reading-evidence-bank-json`; if SCORM storage is later centralized beyond localStorage, that field should remain part of the response bridge.

## Source-Of-Truth Location

- Builder: `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-ela20-novel-study-clean.ts`
- Workspace: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-novel-study-clean/workspace/index.html`
- Metadata: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-novel-study-clean/meta/project.json`
- Shared shell: `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/next-step-course-shell.ts`
- Source PDF for Critical Essay section: `/Users/deanguedo/Downloads/ELA 20-1 30-1 FORMAT Tips for Writing a Critical - Copy (1).pdf`

## Fragile Areas / What Might Drift

- Re-running the builder overwrites the workspace and refreshes `updatedAt`.
- The source ZIP path in Downloads is still part of the regenerate command.
- Response persistence depends on `canvas-helper:ela20-1-novel-study-clean:responses`.
- The Reading Guide stores saved evidence cards as JSON in `reading-evidence-bank-json`; hand-edited generated HTML can break the card controls if that hidden field or the `data-reading-evidence-*` hooks drift.
- Studio scaled preview can mislead browser automation clicks; use the direct `/preview/workspace/...` URL for precise interaction smoke tests.

## Next Prompt Assumptions

- The user likely wants to visually review the new Novel Study Questions and Writing Studio activity surfaces in Studio, then decide whether to export SCORM or further tune the question wording/hints/activity labels.

## Exact Next Command

```bash
npm run verify -- --project ela20-1-novel-study-clean
```

## Exact Next File To Open

```text
/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-ela20-novel-study-clean.ts
```

---

# Handoff

- Project: `ela20-1-feature-film`
- Task: Build a clean ELA 20-1 Feature Film course shell from the supplied Brightspace ZIP, make it selectable in Studio, and organize Lessons / Film Room / Resources like the Short Stories media patterns.
- Status: complete / ready for user visual review in Studio

## Summary

- Added a focused Brightspace builder for the supplied Feature Film export.
- Generated a clean Next Step shell workspace with 9 lessons:
  - 9 `Film Study` lessons
- Preserved imported lesson images and embedded YouTube film clips.
- Added course-specific support pages:
  - Viewing Guide
  - Film Study Questions
  - Film Room
  - Resources
- Added a Short Stories-style `Film Study Questions` page directly below `Viewing Guide` in the sidebar.
- Built `Film Study Questions` from `/Users/deanguedo/Downloads/Copy of ELA 30-1 Unit 6 Extended Text cp/Copy of ELA 30-1 Unit 7 Film Study.docx`:
  - `Film Technique Questions`: 22 prompts across shots, composition, movement, lighting, sound, and mise-en-scene
  - `Full Film Response`: 18 prompts for selected-film analysis after viewing
- Matched the Short Stories question surface:
  - question-set dropdown
  - dark critical-analysis document header
  - formative progress bar
  - `Show Hints`
  - `Print / PDF`
  - numbered prompts
  - response textareas
  - word counts
  - shared local autosave / reload restore
- Added `ela20-1-feature-film` to Studio's built-course shell list.
- Confirmed Studio at `http://127.0.0.1:5174/` can see and select the new project.
- Reworked Feature Film Film Room from loose video cards into the Short Stories-style media playlist:
  - one active video stage
  - right-side `Media Playlist` selector
  - ordered playlist reference panel
  - cleaner clip titles tied to source lessons
- Added reusable shared-shell support for `[data-film-select]` / `[data-film-panel]` switching so future converted courses can use the same pattern.
- Reworked Feature Film Resources from a flat card list into the Short Stories-style resource browser:
  - lesson-group dropdown
  - one active resource group at a time
  - cleaned imported link titles, replacing labels like `here` and `continuity`
  - external sources grouped by source lesson
- Reworked Feature Film Lessons from one long group into Short Stories-style expandable lesson groups:
  - removed the redundant `Introduction to Feature Film` lesson from the active sequence
  - removed `Characteristics of Feature Film` from the active sequence after visual review
  - removed `How to Critically View a Film` from the active sequence after visual review
  - `Film Study` is now the active lesson group with 9 lesson cards
  - shared shell now supports optional per-lesson groups while preserving the one-group fallback
- Tightened Feature Film lesson-card styling so the Lessons sequence matches the Novel Study / Short Stories horizontal card pattern:
  - Resources keeps its own responsive card grid
  - Lessons no longer inherit the two-column resource-card layout
- Rebuilt the Feature Film `Viewing Guide` into a running `Film Evidence Notebook`:
  - film title, viewing pass, and current focus setup fields
  - first-reaction and working-pattern baseline notes
  - evidence-entry form for scene/timestamp, technique, observation, director choice, viewer effect, theme/character connection, and usefulness as evidence
  - persistent evidence bank with technique filtering, edit, delete, and `Mark strongest` controls
  - synthesis prompts that help turn the bank into a response
  - `Print Evidence Portfolio` action
  - hidden JSON response field `viewing-evidence-bank-json` so saved evidence cards ride on the existing shared response/autosave storage
- Adjusted the Viewing Guide baseline notes so `First reaction` and `Working pattern` stack as full-width sections instead of sitting side by side.
- Added a `Critical Essay` dropdown section directly after `Lessons`, matching the Novel Study critical essay sequence:
  - six writing lessons: `Topic and Thesis`, `Introduction`, `Body 1: Beginning`, `Body 2: Middle`, `Body 3: End`, and `Conclusion and Revision`
  - film-adapted wording for director/filmmaker, film title, character development, scenes, timestamps, dialogue, performance, cinematography, editing, sound, lighting, and mise-en-scene
  - each lesson includes overview-style `I can...` statements, a full `Lesson`, model move, example, diploma tip, application steps, and directed student planning fields
  - the final active Film Study lesson now routes to `Critical Essay Guide` before `Viewing Guide`
- Picked up the shared Next Step shell sidebar fix so Film Study route changes close unrelated dropdown groups and leave only the current top-level nav button active.
- Updated the Feature Film metadata writer so rebuilds preserve `createdAt` and Brightspace `importedAt`, refreshing only `updatedAt`.
- Regenerated the Feature Film workspace with the shared scoped-print behavior so `Print / PDF` buttons clone only the current assignment/page instead of triggering a whole-course print.
- Re-exported the Feature Film SCORM 2004 package after the scoped-print fix.

## Files Changed

- `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-ela20-feature-film.ts`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/app/studio/src/lib/project-display.ts`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-feature-film/workspace/index.html`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-feature-film/meta/project.json`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-feature-film/meta/conversion-notes.md`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-feature-film/raw/D2LExport_6668_CBE System ELA 20-1 (Winter 2020)_202662240.zip`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-feature-film/exports/scorm-2004/index.html`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-feature-film/exports/ela20-1-feature-film-scorm-2004.zip`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/next-step-course-shell.ts`

## Verification Run

- `npx tsx scripts/build-ela20-feature-film.ts --zip "/Users/deanguedo/Downloads/D2LExport_6668_CBE System ELA 20-1 (Winter 2020)_202662240.zip" --slug ela20-1-feature-film`
- `npm run verify -- --project ela20-1-feature-film`
- Generated workspace scan confirmed `.film-room-shell`, `Media Playlist`, 4 `data-film-panel` clips, and `data-film-select` are present.
- Playwright file-level probe confirmed selecting `Elements of Film: Sound` switches to exactly `lesson-7-elements-of-film-continued-video-3`.
- Generated workspace scan confirmed `.resource-browser`, `Choose a lesson group`, 3 `data-resource-panel` groups, and cleaned resource titles are present.
- Playwright file-level probe confirmed selecting `Elements of Film - Continued` switches to exactly `resources-elements-of-film-continued`.
- Generated workspace scan confirmed `Film Study`, `.resource-lesson-group`, and `.lesson-card` are present in the lesson index.
- File-level probe confirmed the lesson sequence now has 9 cards and starts at `Film Study Introduction`.
- Playwright layout probe confirmed Feature Film lesson cards stack vertically with one full-width column, while Resources keeps its scoped grid.
- Removal probe confirmed `Introduction to Feature Film`, `Characteristics of Feature Film`, and `How to Critically View a Film` no longer appear in the sidebar or as lesson pages, and progress now reads `0 / 9 lessons`.
- Metadata probe confirmed `Module 5 - Feature Film` is no longer listed as an active lesson group in conversion notes.
- Generated workspace scan confirmed `Film Study Questions`, `film-study-questions`, `Film Technique Questions`, `Full Film Response`, `data-film-question-select`, `0 of 22 answered`, and `0 of 18 answered` are present.
- Generated workspace scan confirmed representative DOCX-derived prompts are present:
  - `Describe what panning is and why it is used in films.`
  - `Which film did you watch?`
  - `What motivates the protagonist in their struggle against the antagonist?`
- Playwright file-level probe confirmed:
  - `Film Study Questions` appears after `Viewing Guide` and before `Film Room`
  - question-set options are `Film Technique Questions` and `Full Film Response`
  - technique progress updates to `1 of 22 answered`
  - full-film progress updates to `1 of 18 answered`
  - word count updates to `5 words`
  - a typed response restores after reload
- Metadata probe confirmed `createdAt` and `importedAt` stay at `2026-06-22T16:21:46.272Z`, while `updatedAt` refreshes on regeneration.
- `npm run build:studio`
- `npm run test:e2e:smoke`
- `npm run typecheck` still fails on unrelated baseline errors listed below.
- Studio API check confirmed `ela20-1-feature-film` is present.
- Playwright dropdown probe found `ELA 20-1 Feature Film`.
- Workspace scan found no replacement-character encoding junk, old CBE footer lines, or shell-behaviour copy.
- Rebuilt after the Viewing Guide notebook update:
  - `npx tsx scripts/build-ela20-feature-film.ts --zip "/Users/deanguedo/Downloads/D2LExport_6668_CBE System ELA 20-1 (Winter 2020)_202662240.zip" --slug ela20-1-feature-film`
  - `npm run verify -- --project ela20-1-feature-film`
- Generated workspace scan confirmed `viewing-notebook`, `evidence-bank-panel`, `viewing-evidence-bank-json`, and `Print Evidence Portfolio` are present.
- Playwright preview probe confirmed:
  - `#viewing-guide` opens in the workspace preview
  - a film evidence moment can be added to the bank
  - `Mark strongest` updates the summary to `1 marked strongest`
  - hidden JSON storage is written
  - saved evidence cards persist after reload
  - cleared draft fields do not repopulate as stale duplicate notes after reload
- Playwright layout probe confirmed `.notebook-baseline` renders as a single grid column and the two baseline cards stack vertically in the Feature Film viewing-guide preview.
- Rebuilt after adding the Film Study Critical Essay section:
  - `npx tsx scripts/build-ela20-feature-film.ts --zip "/Users/deanguedo/Downloads/D2LExport_6668_CBE System ELA 20-1 (Winter 2020)_202662240.zip" --slug ela20-1-feature-film`
  - `npm run verify -- --project ela20-1-feature-film`
  - `npm run build:studio`
- Generated workspace scan confirmed:
  - `Critical Essay`, `critical-writing-topic-thesis`, `Topic and Thesis`, `Body 2: Middle`, `Conclusion and Revision`, and `Critical Essay Guide` are present
  - sidebar order places `Critical Essay` after `Lessons` and before `Viewing Guide`
  - film-specific lesson language is present, including `film creator`, `director or filmmaker`, `scene, timestamp`, and viewer/film evidence phrasing
  - the conclusion lesson routes onward to `Viewing Guide`
- Browser smoke confirmed:
  - `#critical-writing` opens with six writing sequence cards
  - sidebar order is `Overview`, `Lessons`, `Critical Essay`, `Viewing Guide`, `Film Study Questions`, `Film Room`, `Resources`
  - `#critical-writing-body-middle` shows `I can...`, `Lesson`, `Example`, `Diploma tip`, `How to apply it`, and `Student planning space`
  - the body-middle page uses film-specific wording such as `middle of the film`, `film evidence`, and `director`
  - no horizontal overflow and no browser console errors
- Rebuilt after the shared sidebar active-state fix:
  - `npx tsx scripts/build-ela20-feature-film.ts --zip "/Users/deanguedo/Downloads/D2LExport_6668_CBE System ELA 20-1 (Winter 2020)_202662240.zip" --slug ela20-1-feature-film`
  - `npm run verify -- --project ela20-1-feature-film`
  - `npm run build:studio`
- Browser route-state smoke confirmed Feature Film keeps exactly one active top-level nav button while moving through `Critical Essay`, `Viewing Guide`, `Film Study Questions`, `Resources`, and `Lessons`; unrelated dropdown groups close correctly.
- Rebuilt after the scoped-print update:
  - `npx tsx scripts/build-ela20-feature-film.ts --zip "/Users/deanguedo/Downloads/D2LExport_6668_CBE System ELA 20-1 (Winter 2020)_202662240.zip" --slug ela20-1-feature-film`
  - `npm run verify -- --project ela20-1-feature-film`
- Browser print smoke against the regenerated workspace confirmed:
  - clicking `Film Study Questions` `Print / PDF` calls print once
  - the temporary `.print-job-root` contains `Film Study Questions`
  - the temporary print root does not contain `Viewing Guide`, `Overview`, or `Lessons`
  - only the selected question-set worksheet document is visible in the cloned print root
  - clicking `Viewing Guide` print clones the Viewing Guide evidence portfolio without Film Study Questions
- Re-exported and verified SCORM:
  - `npm run export:scorm -- --project ela20-1-feature-film --version 2004`
  - `unzip -tq projects/ela20-1-feature-film/exports/ela20-1-feature-film-scorm-2004.zip`
  - `npm run test:scorm`
- Browser print smoke against `projects/ela20-1-feature-film/exports/scorm-2004/index.html` confirmed the exported package keeps the same scoped-print behavior.

## Known Risks / Follow-Up

- `npm run typecheck` still fails on unrelated baseline errors in older scripts:
  - `scripts/build-ela-short-stories.ts`
  - `scripts/build-ela20-novel-study.ts`
  - `scripts/build-forensics-module1-static.ts`
- The new Feature Film build preserves external YouTube embeds; offline SCORM playback would need a separate media-download/repair pass if required.
- The all-projects fallback option may still show the raw slug, but the built-course group shows the friendly `ELA 20-1 Feature Film` label.
- The Film Room playlist depends on the shared shell script; if a future project hand-edits generated HTML without re-running its builder, it can drift from the canonical script.
- Viewing Guide evidence-bank persistence depends on the shared response storage key `canvas-helper:ela20-1-feature-film:responses`; if SCORM storage is later centralized beyond localStorage, the hidden JSON response field should be included in that bridge.

## Source-Of-Truth Location

- Builder: `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-ela20-feature-film.ts`
- Workspace: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-feature-film/workspace/index.html`
- Metadata: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-feature-film/meta/project.json`
- Shared shell: `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/next-step-course-shell.ts`
- Source PDF for Critical Essay source language: `/Users/deanguedo/Downloads/ELA 20-1 30-1 FORMAT Tips for Writing a Critical - Copy (1).pdf`

## Fragile Areas / What Might Drift

- Re-running the builder overwrites `projects/ela20-1-feature-film/workspace/`.
- The original ZIP path in Downloads is part of the regenerate command.
- Studio's built-course ordering is currently maintained in `app/studio/src/lib/project-display.ts`.
- The Viewing Guide stores the evidence bank as JSON in `viewing-evidence-bank-json`; hand-edited generated HTML can break the card controls if that hidden field or the `data-evidence-*` hooks drift.
- Critical Essay planning fields use the shared response storage key `canvas-helper:ela20-1-feature-film:responses`.
- Print/PDF is currently scoped to the active `.course-page` or nearest `[data-writing-activity-panel]`. If a future page needs to print only a smaller inner panel, add a stable panel wrapper and point the print button at that scope.
- The repo worktree contains many unrelated dirty/deleted files; do not broad-reset.

## Next Prompt Assumptions

- The user likely wants to open Feature Film in Studio, compare it visually against Short Stories/Othello, and then refine styling/content.
- If the user asks for Brightspace delivery, use the latest regenerated SCORM 2004 package unless they request another export pass.

## Exact Next Command

```bash
open "/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-feature-film/exports/ela20-1-feature-film-scorm-2004.zip"
```

## Exact Next File To Open

```text
/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-ela20-feature-film.ts
```
