# Handoff

- Project: `ela20-1-novel-study-clean`
- Task: Add a Short Story Questions-style `Novel Study Questions` section under Reading Guide.
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
- Expanded the Writing Studio with:
  - stronger controlling-idea guidance
  - an evidence connection field
  - a revision checklist with persistent checkbox state
  - the existing print/PDF action
- Renamed `Source Resources` to `Course Resources` and added a short learner-facing purpose line.
- Updated the Novel Study builder so regeneration preserves `createdAt` and `importedAt` provenance while refreshing `updatedAt`.
- Regenerated `projects/ela20-1-novel-study-clean/workspace/index.html` from the canonical builder.
- Updated the old legacy renderer progress literal so it also derives from the current lesson source count.

## Files Changed

- `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-ela20-novel-study-clean.ts`
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
  - no browser console errors
- `npm run typecheck` still fails on unrelated baseline files:
  - `scripts/build-ela-short-stories.ts`
  - `scripts/build-ela20-novel-study.ts`
  - `scripts/build-forensics-module1-static.ts`

## Known Risks / Follow-Up

- Studio iframe automation had click-coordinate issues at the 75% scaled preview, so interaction verification was done against the direct workspace preview URL.
- The shared Next Step shell remains a source of generated workspace changes when the builder is rerun.
- `npm run typecheck` remains blocked by existing baseline generator errors outside this clean Novel Study builder.
- Existing localStorage completion state may still contain the removed lesson id in a learner browser, but progress only counts the current 3 active lesson ids.
- Novel Study Questions uses the same responses storage key as the rest of the clean Novel Study build: `canvas-helper:ela20-1-novel-study-clean:responses`.

## Source-Of-Truth Location

- Builder: `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-ela20-novel-study-clean.ts`
- Workspace: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-novel-study-clean/workspace/index.html`
- Metadata: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-novel-study-clean/meta/project.json`
- Shared shell: `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/next-step-course-shell.ts`

## Fragile Areas / What Might Drift

- Re-running the builder overwrites the workspace and refreshes `updatedAt`.
- The source ZIP path in Downloads is still part of the regenerate command.
- Response persistence depends on `canvas-helper:ela20-1-novel-study-clean:responses`.
- Studio scaled preview can mislead browser automation clicks; use the direct `/preview/workspace/...` URL for precise interaction smoke tests.

## Next Prompt Assumptions

- The user likely wants to visually review the new Novel Study Questions section in Studio and decide whether to export SCORM or further tune the question wording/hints.

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
- Updated the Feature Film metadata writer so rebuilds preserve `createdAt` and Brightspace `importedAt`, refreshing only `updatedAt`.

## Files Changed

- `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-ela20-feature-film.ts`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/app/studio/src/lib/project-display.ts`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-feature-film/workspace/index.html`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-feature-film/meta/project.json`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-feature-film/meta/conversion-notes.md`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-feature-film/raw/D2LExport_6668_CBE System ELA 20-1 (Winter 2020)_202662240.zip`
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
  - `Which film did you watch? Choose from: The Shawshank Redemption directed by Frank Darabont; Good Will Hunting directed by Gus Van Sant; Parasite directed by Bong Joon-ho; Sound of Metal directed by Darius Marder.`
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

## Known Risks / Follow-Up

- `npm run typecheck` still fails on unrelated baseline errors in older scripts:
  - `scripts/build-ela-short-stories.ts`
  - `scripts/build-ela20-novel-study.ts`
  - `scripts/build-forensics-module1-static.ts`
- The new Feature Film build preserves external YouTube embeds; offline SCORM playback would need a separate media-download/repair pass if required.
- The all-projects fallback option may still show the raw slug, but the built-course group shows the friendly `ELA 20-1 Feature Film` label.
- The Film Room playlist depends on the shared shell script; if a future project hand-edits generated HTML without re-running its builder, it can drift from the canonical script.

## Source-Of-Truth Location

- Builder: `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/build-ela20-feature-film.ts`
- Workspace: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-feature-film/workspace/index.html`
- Metadata: `/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-feature-film/meta/project.json`
- Shared shell: `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/lib/next-step-course-shell.ts`

## Fragile Areas / What Might Drift

- Re-running the builder overwrites `projects/ela20-1-feature-film/workspace/`.
- The original ZIP path in Downloads is part of the regenerate command.
- Studio's built-course ordering is currently maintained in `app/studio/src/lib/project-display.ts`.
- The repo worktree contains many unrelated dirty/deleted files; do not broad-reset.

## Next Prompt Assumptions

- The user likely wants to open Feature Film in Studio, compare it visually against Short Stories/Othello, and then refine styling/content.
- If the user asks for Brightspace delivery, export SCORM after visual approval.

## Exact Next Command

```bash
open "http://127.0.0.1:5174/"
```

## Exact Next File To Open

```text
/Users/deanguedo/Documents/GitHub/canvas-helper/projects/ela20-1-feature-film/workspace/index.html
```
