# Handoff

- Project: sportswellness
- Task: Convert Phase 4 lesson content and align Phase 4A / 4B assignments to the unabridged chapter model.
- Status: in progress

## Files changed
- `docs/ops/ACTIVE_HANDOFF.md`
- `projects/sportswellness/meta/sources/Winning_the_First_Victory_Textbook_Chapter.docx`
- `projects/sportswellness/workspace/assets/readings/phase4-figures/phase4-cba-routine.png`
- `projects/sportswellness/workspace/assets/readings/phase4-figures/phase4-chapter-map.png`
- `projects/sportswellness/workspace/assets/readings/phase4-figures/phase4-confidence-account.png`
- `projects/sportswellness/workspace/assets/readings/phase4-figures/phase4-flat-tire-drill.png`
- `projects/sportswellness/workspace/assets/readings/phase4-figures/phase4-mental-cinema.png`
- `projects/sportswellness/workspace/main.js`
- `projects/sportswellness/workspace/assignment-runtime-main.js`
- `scripts/tests/sportswellness-phase4a-assignment.test.ts`
- `scripts/tests/sportswellness-phase4b-assignment.test.ts`

## What changed
- Converted the `Winning_the_First_Victory_Textbook_Chapter.docx` source into a new unabridged `PHASE_CONTENT['phase-4']` lesson block.
- Added a Phase 4 review quiz (`quiz-phase4-winning-the-first-victory`) with 12 multiple-choice questions and explanations.
- Extracted the five embedded chapter figures into `workspace/assets/readings/phase4-figures/` and wired them into the lesson flow.
- Updated the Phase 4 module card description so the home screen reflects confidence, envisioning, and pre-performance control instead of a placeholder shell.
- Rebuilt Assignment `04A` around the chapter's real confidence model: sources of confidence, Top Ten evidence, Daily E-S-P deposits, mental filter, What? So what? Now what?, butterflies-as-fuel, and the C-B-A bridge.
- Rebuilt Assignment `04B` around the chapter's real envisioning model: prop check, mental cinema, perspective choice, timing match, GoPro perspective, director's cut, flat tire drill, real-time rehearsal, and controllability checks.
- Preserved the existing ids, storage keys, mobile step-menu behavior, and `/15` three-level rubric shape while extending the saved payloads for the new fields.
- Added targeted regression coverage so the new Phase 4A / 4B chapter language stays locked in.
- Preserved the chapter source in-project under `projects/sportswellness/meta/sources/` so future edits do not depend on `Downloads/`.

## Why this changed
- The user had the full Phase 4 chapter and quiz ready for conversion and wanted it added in the same style and depth as the earlier converted phases.
- Phase 4 lesson content was still a placeholder, while the assignments already existed and needed a proper lesson/quiz surface to align with.
- After the lesson conversion landed, the user wanted `04A` and `04B` brought into line with the actual chapter wording and tools, not the older placeholder framing.

## Source of truth
- Canonical lesson + quiz runtime: `projects/sportswellness/workspace/main.js`
- Canonical Phase 4 assignment runtime: `projects/sportswellness/workspace/assignment-runtime-main.js`
- Imported Phase 4 source chapter: `projects/sportswellness/meta/sources/Winning_the_First_Victory_Textbook_Chapter.docx`
- Extracted Phase 4 figure assets: `projects/sportswellness/workspace/assets/readings/phase4-figures/`
- Active session handoff: `docs/ops/ACTIVE_HANDOFF.md`

## Fragile areas / watchouts
- The new Phase 4 lesson uses extracted DOCX figures with white backgrounds; they fit structurally but may still need a visual polish pass later.
- The lesson and quiz `sourcePdf` currently point to `./assets/slides/04-toolkit.pdf`, which is a valid Phase 4 PDF but not a dedicated export of the unabridged chapter.
- `PHASE_CONTENT` and assignment metadata live in the same large `main.js` file, so future Phase 4 edits should stay surgical to avoid disturbing other phases.
- `assignment-runtime-main.js` now contains the chapter-aligned Phase 4A / 4B runtime shells; future edits should preserve the existing ids, storage keys, and shared `p1` shell hooks.

## Next prompt should assume
- Phase 4 lesson content and review quiz are now live in the workspace.
- The assignments for Phase 4 (`a4a` confidence and `a4b` visualization) are now structurally aligned to the new lesson and chapter wording.
- The chapter source has been copied into `meta/sources`, so no future work should depend on the original file in `Downloads/`.

## What still needs validation
- Teacher-eye review of the new Phase 4 lesson plus Assignment `04A` / `04B` wording in preview.
- Manual preview pass on the refreshed Phase 4A / 4B step labels, mobile step toggle, and print/export wording.
- Decide whether to create a dedicated `phase4-toolkit-content.pdf` so the lesson and quiz source buttons point to the unabridged chapter instead of the slide deck.

## Known risks
- Because the chapter is intentionally unabridged, the Phase 4 lesson may feel denser than earlier phases until a pacing review is done in preview.
- If a dedicated Phase 4 chapter PDF is later added, both the lesson and quiz `sourcePdf` paths will need to be updated together.
- The new Phase 4 assignments preserve old storage keys, so legacy saved data should load, but a human preview pass is still worth doing to confirm that older localStorage values read naturally in the new prompts.

## Exact next command
`npm run test:e2e:project -- --project sportswellness`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/sportswellness/workspace/assignment-runtime-main.js`

## Do not do next / warnings
- Do not edit `projects/sportswellness/raw/**`.
- Do not replace the new Phase 4 lesson with a shortened summary pass unless the user explicitly asks to abridge it.
- Do not split Phase 4A / 4B into new runtime surfaces or new storage keys; the current workspace lesson/quiz + assignment runtime files are the canonical sources.

## Resume cue
Start from this exact prompt:

`Phase 4 lesson conversion and the 04A / 04B assignment alignment are both in place. Let's review the updated Phase 4 preview and decide whether any wording, figure treatment, or assignment prompts still need a teacher-eye polish pass.`
