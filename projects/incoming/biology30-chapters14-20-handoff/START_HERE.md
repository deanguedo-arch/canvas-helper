# Biology 30 Chapters 15–20 — completed HTML/source handoff

## Start here

Each chapter is an actual assembled course, not a lesson outline. Open its `portable/Biology30_ChapterN.html` in a desktop browser for content review. Give the complete developer folder to Codex for source integration. The developer folders contain answer keys and provenance and must not be published as learner resources.

These are standalone HTML courses and editable source packages. **The ZIP is not an LMS-importable SCORM archive.** SCORM packaging, real-origin persistence verification and Brightspace certification are the next deployment stage, not assertions made by this handoff.

Chapters 11–14 remain unchanged. Chapters 15–20 use the exact approved main and Textbook Practice stylesheets, with the reference fonts embedded rather than supplied as font files.

## Included chapters

| Chapter | Title | Teaching lessons + review | Required checks | Original textbook questions/tasks |
|---|---|---:|---:|---:|
| 15 | Human Development | 11 + 1 | 12 | 85 |
| 16 | Cellular Reproduction | 12 + 1 | 13 | 98 |
| 17 | Patterns and Processes in Inheritance | 14 + 1 | 15 | 82 |
| 18 | Molecular Genetics | 12 + 1 | 13 | 93 |
| 19 | Genetic Diversity in Populations | 9 + 1 | 10 | 58 |
| 20 | Population Growth and Interactions | 11 + 1 | 12 | 77 |

Every chapter includes the overview, lessons, a self-contained optional extension, worked and supported practice, required checks, independent transfer practice, flash cards, typed practice, labeling, multiple choice, mixed practice, original Textbook Practice, All My Work, Core Vocabulary/Frayer work, the embedded chapter PDF and the Video Library. Optional unit-review topics are available in Chapters 15, 18 and 20; those reuse selected chapter questions rather than creating another required assessment.

## Ownership and rebuilding

Each chapter README identifies its canonical files. Ordinary teaching text lives in `workspace/index.html`; reviewed interaction/question data lives in `authoring/course-config.json`; original textbook identities/context live in `authoring/textbook-question-manifest.json`. Run `python scripts/build.py` from the relevant chapter folder. It refreshes reviewed embedded data and assets without overwriting teaching paragraphs from an old authoring snapshot.

All six portable outputs were rebuilt and were byte-identical. The supplied schematic generators were also run in separate temporary folders and reproduced the 76 teaching/labeling SVG files byte-for-byte. Keep label answer maps synchronized with any later diagram edit.

## Evidence and remaining acceptance

Read `VERIFICATION_SUMMARY.md` and each chapter's verification report. Final reports contain passing static/science, browser-interaction, additional-browser and final-smoke checks. Chromium used the actual course content but an explicitly substituted storage implementation because file and localhost navigation were blocked here. The reports do not certify real browser-origin saving, real cross-tab conflict behavior or LMS persistence.

Before learner deployment, Codex/teacher acceptance must complete real-origin saving and two-chapter isolation, current official Alberta outcome-code confirmation, the final full original-question crop/scope review, optional video-content/availability checks and the LMS launch/commit/resume checks. The course teaching and activities are already built; these are integration and acceptance tasks, not placeholders for writing the chapters.

See `CODEX_INTEGRATION_PROMPT.md` for the next exact implementation step.
