# Handoff

- Project: general-psychology-20-independent-studies-202633108
- Task: Finish the fresh General Psychology 20 conversion shell and trim the import so the course starts at the real instructional modules
- Status: in progress

## Files changed
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\workspace\index.html
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\workspace\main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\workspace\index.html
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\app\server\routes\preview.ts
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\workspace\course-shell-data.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\workspace\assessment-delivery.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\meta\build-shell-from-manifest.ps1
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\meta\d2l-course-map.json
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\meta\d2l-course-map.md
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\meta\project.json
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md

## What changed
- Rebased the new project shell on the Experimental Psychology runtime baseline and retitled it to General Psychology 20.
- Added a PowerShell manifest generator so the cartridge can regenerate the workspace shell without the Node toolchain being required in this shell session.
- Trimmed the generated course shell to 9 modules by skipping the `Course Information` and `Student Resource Materials` wrappers.
- Preserved all D2L lesson/assignment items under the real instructional modules and kept assignment handoff cards for the 8 assignment items found in the manifest.
- Fixed the runtime crash by making the module count derive safely from `courseShellData.modules`.
- Hardened the HTML lesson sanitizer so lesson pages that still look like raw D2L source get a second-pass repair before rendering.
- Fixed preview response charset handling by BOM detection so UTF-16 D2L HTML files are no longer served as UTF-8.
- Replaced `response.text()` with byte-level decode (`arrayBuffer` + BOM/charset detection) in the workspace loader so UTF-16 lesson files render correctly even when browser fetch decoding is inconsistent.
- Bumped the workspace script revision query (`main.js?rev=genpsy20-v2`) so Studio pulls the updated loader immediately.
- Added title-based assignment routing (`Quiz` / `Assignment` / `Final Project`) so assignment-like lesson pages move to the Assignments tab.
- Added per-module assignment dedupe to prefer source-backed items over missing-source assessment shells when titles overlap.
- Bumped script revision again to `main.js?rev=genpsy20-v3` for immediate cache break after assignment routing changes.
- Normalized Module 1 `History of Psychological Thought` naming by mapping placeholder `Intro to Psych Explore` titles to source-aligned labels.
- Hid noisy Module 1 placeholder checkpoints (`Intro to Psych Q2/Q3/Q4/Q5` and `Well Done!`) from the module list.
- Bumped script revision to `main.js?rev=genpsy20-v4` after Module 1 nav normalization.
- Refined assignment routing so lesson pages with `Quiz` in the title remain in Content order (only true assessments/assignments route to Assignments).
- Bumped script revision to `main.js?rev=genpsy20-v6` after restoring in-section quiz ordering.
- Updated routing again so all `Quiz` title items are treated as assignments, with key normalization that strips `quiz` for dedupe (`Freud` and `Freud Quiz` resolve to one assignment entry).
- Bumped script revision to `main.js?rev=genpsy20-v8` for immediate refresh of quiz-to-assignment transfer behavior.
- Regenerated `workspace/assessment-delivery.js` from current assignment routing: all source-backed assignments/quizzes now map to `workspace-embed`; missing-source items stay `document-handin`.
- Added `meta/missing-assignment-sources.md` with the exact missing-source backlog (12 items).
- Bumped script revision to `main.js?rev=genpsy20-v9` to force-refresh the new delivery map.
- Added module-local fallback source mapping for missing assessment shells (e.g., `Learning Techniques (Matching)` -> `Learning Techniques Quiz`) and regenerated delivery.
- New delivery status: 40 mapped total, 38 `workspace-embed`, 2 still missing source.
- Updated `meta/missing-assignment-sources.md` to include recovered mappings and the reduced unresolved list.
- Bumped script revision to `main.js?rev=genpsy20-v10` after fallback mapping update.
- Added quiz-delivery detection so `workspace-embed` quiz items now label as `Workspace quiz` in module assignment lists.
- Replaced embedded launcher-page rendering for quiz-like assignment cards with a dedicated in-workspace quiz launcher shell (`renderQuizLauncher`) so these no longer show the raw purple-link page inside an iframe.
- Added async launcher parsing/cache for quiz pages (`parseQuizLauncherHtml` + `requestQuizLauncherData`) to pull the real quiz launch URL and learner instructions from the source HTML.
- Bumped script revision to `main.js?rev=genpsy20-v11` for immediate refresh of the new quiz launcher rendering.
- Used the supplemental ZIP `D2LCCExport_129096_23-24 _ General Psychology 20 _ Per 1(A-B) _ Sec S_202633143.zip` to recover packaged `quiz/*.xml` and `assignment/*.xml` payloads.
- Linked all assessment activities in `workspace/course-shell-data.js` to source files (`quiz=24/24`, `assignment=8/8`) so they no longer sit on missing-source placeholders.
- Updated quiz rendering guard in `workspace/main.js` so quiz activities with real `sourceHref` render as true in-browser quizzes even if legacy `assessment-delivery.js` still marks them as `workspace-embed`.
- Added sparse-QTI fallback messaging for exports that contain only empty `<item />` placeholders (no question bank payload).
- Updated `meta/missing-assignment-sources.md` to show zero missing paths and list the 3 quizzes that still require full question-bank export data.
- Bumped script revision to `main.js?rev=genpsy20-v12` for immediate cache break.

## Verification run
- Parsed `workspace/course-shell-data.js` successfully with PowerShell `ConvertFrom-Json`.
- Confirmed the generated shell now reports `moduleCount = 9`.
- Confirmed the first visible module is `Module 1: History of Psychological Schools of Thought`.
- Confirmed sample lesson source paths resolve inside `projects/resources/general-psychology-20-independent-studies-202633108`.
- Reviewed the HTML lesson metadata and confirmed the first lesson is flagged as `resourceKind: html` with a valid `sourceHref`.
- Re-validated assessment coverage after linking new ZIP payloads: `quiz=24/24`, `assignment=8/8`, `assessmentMissing=0`.
- Did not run `npm`/Node-based Studio verification in this shell because `node`, `npm`, and `git` are not on PATH here.
- Confirmed the original D2L ZIP only contains `сontent/...` HTML/media plus `imsmanifest.xml`; no `quiz/` QTI files are present in this export, which explains launcher-only quiz pages.

## Why this changed
- The user said the project still was not showing correctly in Canvas Studio and then asked to remove the course information and student resource wrappers.
- The import originally included those manifest wrapper nodes as separate modules, which made the shell feel like a raw import instead of the actual course.

## Source of truth
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\workspace\index.html
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\workspace\main.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\workspace\course-shell-data.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\workspace\assessment-delivery.js
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\meta\build-shell-from-manifest.ps1
- C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\meta\project.json

## Fragile areas / watchouts
- The cartridge still appears to omit the packaged assignment/QTI source files referenced by the manifest, so assignment cards remain external handoff placeholders.
- `workspace/course-shell-data.js` and `workspace/assessment-delivery.js` are generated outputs and should be rebuilt from `meta/build-shell-from-manifest.ps1` rather than hand-edited.
- The extracted `projects/resources/...` tree is the active import source for this slug; `genpsy-studio` remains reference-only and should not be merged into this runtime.
- The current validation issue is lesson rendering, where raw HTML source text is still surfacing in the workspace for every lesson and needs a live Studio reload check after the sanitizer patch.
- This latest charset fix requires restarting the local Studio server process to take effect.

## Next prompt should assume
- The course starts at Module 1 now, with the manifest wrapper nodes removed from the generated shell.
- The new slug is `general-psychology-20-independent-studies-202633108`.
- The shell should be treated as a fresh conversion project, not a replacement for `genpsy-studio`.

## What still needs validation
- Restart Studio server, hard refresh preview, then open the project and confirm:
  - lesson pages render as formatted content rather than raw XHTML
  - assignment-like items now appear under Assignments
  - duplicate assignment cards prefer source-backed versions
- Verify the sanitizer repair path does not disturb normal lessons or assignment embeds.
- Check whether any assignment source files can be recovered from another export, since the manifest references them but the current bundle lacks them.

## Known risks
- Because the Node toolchain is unavailable in this shell, the standard repo verification commands still were not run here.
- If Studio had cached the earlier 11-module shell, it may need a reload/restart to pick up the regenerated `course-shell-data.js`.

## Exact next command
`Restart Studio, then reopen General Psychology 20 Module 1 lesson 1`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\general-psychology-20-independent-studies-202633108\workspace\course-shell-data.js`

## Do not do next / warnings
- Do not bring `Course Information` or `Student Resource Materials` back into the visible module list unless the user asks for manifest wrappers explicitly.
- Do not merge `genpsy-studio` workspace files into this project.
- Do not hand-edit the generated shell data unless you are fixing a small emergency runtime issue.
