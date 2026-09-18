# Biology 30 — Chapter 15: Human Development

## Files and ownership

- `workspace/index.html`: canonical student-facing teaching, shell, navigation and component markup. Edit ordinary lesson wording here.
- `workspace/main.js` and `workspace/assets/*.js`: canonical interaction code.
- `workspace/styles.css` and `workspace/assets/textbook-practice.css`: frozen approved styles. No per-chapter redesign.
- `authoring/course-config.json`: canonical reviewed question, vocabulary, guided, transfer and labeling data. The JSON inside index.html is refreshed from this file by the build.
- `authoring/textbook-question-manifest.json`: canonical original-question identities, crops, context and task scope.
- `workspace/assets/figures` / `labeling`: editable SVGs and credited source crops. Answer-map changes must be reconciled with course-config.json.
- `portable/Biology30_Chapter15.html`: derived single-file course; all core assets, fonts and the correct chapter PDF are embedded. Videos require internet, with local written equivalents.
- `authoring/lesson-content.json` and initial-authoring files: preserved generation provenance. They are NOT silently reapplied over later edits to canonical HTML.

## Rebuild

Use Python 3.10 or newer and install `beautifulsoup4`. From this chapter folder:

```sh
python scripts/build.py
```

This validates required routes/assets, refreshes embedded reviewed data/PDF, then assembles the portable HTML. It does not rewrite lessons from an older authoring snapshot or modify another chapter.

Optional schematic regeneration: install `cairosvg`, then run `python scripts/make_media.py`. The SVGs themselves are also directly editable. Reconcile an intentional key change with the config; do not change a label without its answer map.

## Included course content

11 teaching lessons plus the review; 12 required checks; 28 required selected-response items; 24 written explanations; 22 guided selections; 44 vocabulary terms; 6 labeling activities with 28 targets; 85 original textbook questions/selected supplied-data tasks; 22 reviewed source MC items plus 44 foundation and 11 authored application items. Additional families include flash retrieval, typed responses, ordering and multiple select where appropriate. One optional three-MC/one-written independent transfer set is present. Optional work does not increase required progress.

## Review and deployment

Start with the portable HTML for a content review. Give this entire folder/ZIP to Codex for import. Do not publish the developer ZIP as a student resource: it contains keys and provenance.

Read `verification/verification-results.md`. The browser tests used an explicit storage double because this environment blocked file and localhost navigation. Real-origin persistence, current outcome codes, final source-question crop review, optional video checks and Brightspace certification remain deployment acceptance tasks. This folder is not itself a SCORM archive.

Chapters 11–14 were not modified. Source discrepancies and adaptations are in developer documentation only, not in student lesson commentary.

## Repeat the supplied browser tests

Install Playwright and provide Chromium. These scripts deliberately use an in-memory document and storage test double, not real-origin localStorage. Set `BIOLOGY_CHROMIUM` for the main/additional suites if Chromium is not at `/usr/bin/chromium`.

```sh
python scripts/verify_browser.py
python scripts/verify_additional.py
python scripts/verify_final_smoke.py
```

The final-smoke script currently uses `/usr/bin/chromium`; change that executable path for another operating system. Run genuine browser-origin and LMS tests separately, without the storage substitute.
