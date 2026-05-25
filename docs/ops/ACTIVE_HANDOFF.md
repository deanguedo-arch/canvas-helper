# Handoff

- Project: `aboriginal-studies-30`
- Task: Restore and polish the Theme 1 online booklet activity and consolidate its resources.
- Status: complete for local review

## Summary
- Theme 1 now includes Assignment 1.1, all numbered booklet questions 1-87, and Assignment 1.2.
- Fill-in-the-blank questions render as real inline inputs without repeating the full question above the blank line.
- Multiple-choice questions render as selectable choices, and question 37 renders as a fillable table.
- Prompt-specific resources now appear with the prompts they support:
  - Assignment 1.1 includes `Walking Together: The Oral Tradition`.
  - Question 56 includes the embedded `Road Allowance People` video.
  - Assignment 1.2 includes the embedded `Métis Self-Governance` video.
- Replaced the broken LearnAlberta oral tradition URL with the supplied local PDF at `workspace/assets/theme-1/readings/indigenous-worldviews.pdf`.
- Renamed the unit resource detail card to `Resources`.
- Added `Chapter 1` to the top of the Theme 1 resource list with the `Open Chapter` action.
- Renamed the online booklet header to `Theme 1 Questions`.
- Removed the redundant top resource-card grid from the online booklet; resources now live in the unit `Resources` list and prompt-specific links stay attached to the relevant questions.
- Section source labels remain in place for textbook page ranges and reading references.
- Removed all inline booklet image grids from the Theme 1 written assignment surface because they did not format well in this activity.
- The generator may still extract Theme 1 PDF images into workspace assets during rebuild, but the activity data no longer attaches those images to student prompts or sections.
- Theme 1 long-answer and table-answer textareas now use controlled auto-grow: students cannot manually drag-resize them, fields expand vertically while typing, and very long responses cap at a stable height with internal scrolling.
- Added a Google Stitch redesign brief at `projects/aboriginal-studies-30/meta/google-stitch-redesign-brief.md` so the current course shell can be sent out for a visual redesign without losing required structure.
- Kept the answer key out of the student-facing workspace and tests.
- Kept `reviewUnlockAll = true` so the whole course remains unlocked while editing.

## Files Changed
- `projects/aboriginal-studies-30/meta/build_sports_style_course.py`
- `projects/aboriginal-studies-30/meta/project.json`
- `projects/aboriginal-studies-30/meta/source-zip-audit.json`
- `projects/aboriginal-studies-30/workspace/course-data.js`
- `projects/aboriginal-studies-30/workspace/main.js`
- `projects/aboriginal-studies-30/workspace/styles.css`
- `projects/aboriginal-studies-30/workspace/assets/theme-1/readings/indigenous-worldviews.pdf`
- `projects/aboriginal-studies-30/workspace/assets/theme-1/images/**`
- `scripts/tests/aboriginal-studies-30-shell.test.ts`
- `.stax/task.md`
- `.stax/codex-report.md`
- `.stax/visual-proofs/manifest.json`
- `.stax/visual-proofs/visual_2026-05-25T18_18_14_332Z_8ad5829ebf68.png`
- `.stax/command-evidence/cmd_2026-05-25T18_18_25_873Z_0c3d6942392c.pointer.json`
- `.stax/visual-proofs/visual_2026-05-25T18_14_27_617Z_4a039bd52c19.png`
- `.stax/command-evidence/cmd_2026-05-25T18_14_42_634Z_0c3d6942392c.pointer.json`
- `.stax/visual-proofs/visual_2026-05-25T18_42_26_353Z_e2f4ad4bdf26.png`
- `.stax/command-evidence/cmd_2026-05-25T18_42_08_383Z_0c3d6942392c.pointer.json`
- `.stax/visual-proofs/visual_2026-05-25T18_51_36_543Z_76d7c89da8e6.png`
- `.stax/command-evidence/cmd_2026-05-25T18_51_21_184Z_0c3d6942392c.pointer.json`
- `.stax/visual-proofs/visual_2026-05-25T19_42_39_981Z_472d7e4110f9.png`
- `.stax/command-evidence/cmd_2026-05-25T19_42_30_597Z_0c3d6942392c.pointer.json`
- `projects/aboriginal-studies-30/meta/google-stitch-redesign-brief.md`
- `docs/ops/ACTIVE_HANDOFF.md`

## Verification Run
- `python projects/aboriginal-studies-30/meta/build_sports_style_course.py`
- `node node_modules/tsx/dist/cli.mjs --test scripts/tests/aboriginal-studies-30-shell.test.ts`
- `npm.cmd run validate:manifests -- --project aboriginal-studies-30`
- `npm.cmd run verify -- --project aboriginal-studies-30`
- `rg -n -i "Answer Key|AB_Studies_30_Combined_Answer_Key|AB-Studies-30-Theme-[0-9]-Key|teacher answer|View Slides|Phases|Performance|Tape catalog|tapes loaded|BrightSpace page|Brightspace page|Booklet page|figcaption" projects/aboriginal-studies-30/workspace`
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`
- `npm.cmd run test:e2e:project -- --project aboriginal-studies-30`
- `npm.cmd run test:e2e:smoke`
- Read back `projects/aboriginal-studies-30/meta/google-stitch-redesign-brief.md` and checked it includes required Stitch redesign constraints: Theme 1 Questions, View Chapter, Download PDF, Film Room, no Phases, and no Performance.
- Playwright DOM check on `http://127.0.0.1:8131/?section=unit&unit=theme-1` confirmed `.activity-response` and `.activity-table-response` have computed `resize: none`, grow after a long typed response, cap at 360px and 260px respectively, switch to internal scrolling, and still save input to `aboriginal-studies-30.activityResponses`.
- Playwright DOM check on `http://127.0.0.1:8130/?section=unit` confirmed the detail card title is `Resources`, `Chapter 1` appears with `Open Chapter`, the oral tradition resource points to `./assets/theme-1/readings/indigenous-worldviews.pdf`, the online booklet has 0 top activity resource cards, and prompt-specific resources remain present.
- Follow-up Playwright DOM check confirmed the online activity header reads `Theme 1 Questions` and the first resource row is `Chapter 1` with `Open Chapter`.
- Local PDF fetch check confirmed `indigenous-worldviews.pdf` returns HTTP 200 as `application/pdf` with length `1206122`.
- STAX visual proof: `visual_2026-05-25T18_18_14_332Z_8ad5829ebf68`
- STAX command evidence: `cmd_2026-05-25T18_18_25_873Z_0c3d6942392c`
- Current STAX visual proof: `visual_2026-05-25T18_42_26_353Z_e2f4ad4bdf26`
- Current STAX command evidence: `cmd_2026-05-25T18_42_08_383Z_0c3d6942392c`
- Latest STAX visual proof: `visual_2026-05-25T18_51_36_543Z_76d7c89da8e6`
- Latest STAX command evidence: `cmd_2026-05-25T18_51_21_184Z_0c3d6942392c`
- Controlled response-box STAX visual proof: `visual_2026-05-25T19_42_39_981Z_472d7e4110f9`
- Controlled response-box STAX command evidence: `cmd_2026-05-25T19_42_30_597Z_0c3d6942392c`
- Latest STAX observer preflight exited 0 and recorded Reject as non-blocking observer output.

## Known Risks / Follow-Up
- The online booklet saves responses to browser storage; there is not yet a teacher submission backend.
- `reviewUnlockAll` is intentionally on for editing; turn it off before student release.
- Some YouTube embeds may show provider-side restrictions, but the resource/source links remain available.
- The answer key was not converted into student feedback or self-check logic.
- Regeneration depends on the local Brightspace ZIP path, Course Materials folder, Theme 1 booklet PDF path, and the supplied `C:\Users\dean.guedo\Downloads\Indigenous-Worldviews.pdf`.
- STAX may still report unrelated stale ledger noise because the repo has older evidence from other tasks.

## Source-Of-Truth Location
- Generator: `projects/aboriginal-studies-30/meta/build_sports_style_course.py`
- Generated workspace: `projects/aboriginal-studies-30/workspace/index.html`
- Generated runtime/data: `projects/aboriginal-studies-30/workspace/course-data.js`, `projects/aboriginal-studies-30/workspace/main.js`, `projects/aboriginal-studies-30/workspace/styles.css`
- Extracted booklet image assets, not attached to the activity UI: `projects/aboriginal-studies-30/workspace/assets/theme-1/images/`
- Local oral tradition reading PDF: `projects/aboriginal-studies-30/workspace/assets/theme-1/readings/indigenous-worldviews.pdf`

## Fragile Areas / What Might Drift
- The generator deletes and rebuilds the workspace each run.
- Theme 1 questions are hand-structured from PDF extraction; future edits should happen in the generator, not directly in generated workspace files.
- Prompt-level video embeds depend on the source video URLs remaining embeddable.

## Next Prompt Assumptions
- The user wants Theme 1 reviewed locally before applying the same online-booklet treatment to Themes 2-4.
- If answer-key-based self-check is requested, it should be explicitly scoped so answers are not accidentally exposed.

## Exact Next Command
`Get-Content -Raw projects/aboriginal-studies-30/meta/google-stitch-redesign-brief.md`

## Exact Next File To Open
`projects/aboriginal-studies-30/meta/google-stitch-redesign-brief.md`
