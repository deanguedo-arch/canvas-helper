# Biology 30 — Chapter 14
## The Reproductive System

Working Chapter 14 source and portable HTML, based on the supplied post-audit v8 Chapter 12/13 system. This is a **Codex integration/review handoff**, not a Brightspace-certified release. Chapters 11–13 and Chemistry were not modified. Chapters 15–20 have not been authored in this package.

## Open the course

Open `portable/Biology30_Chapter14.html` in a desktop browser. It contains the course runtime, embedded fonts/logo, images, question crops and 30-page chapter textbook. External videos require internet; the corresponding written explanations are local. The initial learner state is blank. Verification screenshots and print tests contain synthetic test responses, not student data.

The portable file contains client-side answer data for formative practice. It is **not a secure examination**.

## Included

| Component | Count / scope |
|---|---|
| Teaching sequence | 10 concept-based lessons plus chapter review |
| Required checks | 11; 26 selected-response questions and 22 written explanations |
| Worked examples | 10 lesson examples plus an integrated review example |
| Supported practice | 20 short guided selections |
| Independent transfer | Three selections and one written explanation, optional |
| Vocabulary | 65 term records, shared across lesson links, drawer and reader |
| Labeling | Six diagrams with 38 targets |
| Optional MC bank | 38 source-adapted/reviewed questions plus 20 authored application questions |
| Other generated practice | Term/reverse/scenario/error-correction flash cards, typed answers, eight sequences, five multiple-select items and diagram questions |
| Original textbook questions | 82 eligible questions, including multipart questions and paper-based thought labs |
| Embedded reading | Printed pp. 476–505; PDF pages 1–30 |
| Videos | Seven actual teacher-deck links, each with local written support |
| Optional writing | Four source-response activities plus an endocrine-disruptor extension |
| Navigation | All 23 course routes populated |

The generator assembles a finite offline pool of **409 representations**. Many representations test the same concept in a different form; this number does not mean 409 unrelated scenarios. Source questions not imported into this chapter retain a disposition in the developer ledger.

## Canonical ownership

- `scripts/content.py`: authored teaching copy, examples and core question/vocabulary definitions.
- `scripts/build_chapter.py`: chapter configuration, static lesson HTML and components inside copied v8 fixtures.
- `workspace/main.js` and `workspace/assets/*.js`: editable chapter runtime; not a new framework.
- `authoring/templates/`: copied v8 component fixtures, developer-only.
- `scripts/prepare_assets.py`: source crops, precisely authored schematics and lettering transformations.
- `scripts/prepare_textbook.py`: original textbook question crop boundaries and exclusions.
- `scripts/import_assessments.py`: explicit selected-source mappings and adaptation ledger.
- `scripts/assemble_portable.py`: embeds assets once, without moving teaching text or owning storage.
- `workspace/index.html`: derived canonical workspace output. Regenerate from the authoring scripts when making content changes.
- `portable/Biology30_Chapter14.html`: derived self-contained output. Do not edit this instead of its source owners.

## Rebuild

From the `chapter-14` directory, with Python 3.11+ and Node.js available:

```sh
python -m pip install beautifulsoup4 PyMuPDF Pillow python-pptx
python scripts/prepare_assets.py
python scripts/import_assessments.py
python scripts/prepare_textbook.py
python scripts/build_chapter.py
python scripts/patch_runtime.py
python scripts/assemble_portable.py
node scripts/export_practice_coverage.js
python scripts/finalize_handoff.py
python scripts/write_checksums.py
```

`prepare_assets.py` uses DejaVu Sans Bold to render four small letter labels in one source image; install that system font or set `BIOLOGY_LABEL_FONT` to a locally installed compatible font. No separate font files are distributed in this package. The course fonts remain embedded in the unchanged v8 stylesheet.

The source textbook PDF, source Chapter 14 PPT, source-assessment catalogue and selected assessment images are packaged. Other source Unit B items remain identifiable by their original ZIP paths/hashes, but their unused images are not copied into the student course.

## Test evidence

See `verification/verification-results.md`, `browser-results.json`, `additional-browser-results.json`, `static-checks.json`, `surface-matrix.json` and screenshots. The latest test runs passed 59 recorded DOM/runtime assertions, plus the separate static checks. The source test scripts are included.

**Important environment limit:** this environment blocked normal `file://` and localhost browser navigation. The interaction tests used Chromium with the real portable DOM/scripts and an explicit Map-backed storage test double. This verifies many UI/state transitions, but **not actual browser-origin persistence, device-specific file handling, genuine multi-tab delivery, native PDF-plugin behavior, or LMS storage**. Save/restore and conflict simulations must be repeated in Codex on a real origin.

## Preserved design

`workspace/styles.css` SHA-256:
`94fe523654289edd8b0f951dd6782f83dce7d08f5e18a3d903d25576fbfa0ba5`

`workspace/assets/textbook-practice.css` SHA-256:
`4101415cce977a4a8553754a01cea3d33ad194add1198db00ddc0ba99bfeea12`

These match the supplied v8 Chapter 12/13 stylesheet owners. No new course theme, framework, font service, global Save and Exit button or photo-upload control was introduced.

## Exact next action for Codex

1. Import Chapter 14 through the existing externally generated-course workflow. Keep the source owners above and declare regeneration rather than editing only the portable HTML.
2. Confirm all 23 routes and the generated/labeling/Textbook Practice states on a real browser origin, including a real refresh/close/reopen. Repeat save failure, two-tab revision conflict, another chapter open simultaneously and long-session resume tests.
3. Confirm that every used assessment stimulus and all original question continuations remain available after packaging. Do not remove answer keys from the executable formative bank; exclude developer authoring documents from the student resource library instead.
4. Check the candidate outcome codes against the division's current official Biology 30 register. Teacher-review the scientific copy and diagram answer maps. Review the seven external videos for current title, availability and content; a failed video must not block a lesson.
5. Complete editor/import/export compatibility and real Brightspace adapter/save-resume testing before creating or deploying a learner-release SCORM package.
6. Only then use this implementation checkpoint for Chapter 15. Reserve deferred Unit B test/review items for its optional unit-review reconciliation. Do not silently discard them or claim that every Unit B question was already imported here.

## Developer-only records

`authoring/` contains source identities, assessment answers, adaptation decisions, outcome candidates and review notes. These are **not student pages**. The complete editable ZIP is for the course builder; the portable HTML is the learner-preview artifact.
