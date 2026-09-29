# Science 24 A–C layout, reader and workbook checkpoint

**Status:** Build candidate for teacher review. A, B and C remain blocked and previewable. This checkpoint supersedes the earlier visual candidate for the files named in [the exact hash record](science24-abc-layout-candidate-2026-09-24.json); it is not a course acceptance, export or LMS certification.

## What changed

| Area | Result | Canonical owner |
| --- | --- | --- |
| Required check headings | Label and title sit on separate lines; duplicate “required check” suffix removed from the ordinary lesson title. | A/B/C `workspace/index.html` and `unit-*.css` |
| Workbook key | Removed the large self-check block from each Textbook Library. The original 2023 key remains in a collapsed, attempt-first section of Textbook Practice. | A/B/C `workspace/index.html` |
| Unit C original workbook work | All 17 optional panels and their saved response controls moved from lessons to a lesson selector in Textbook Practice. The 17 `s24-c-l##-source-work` activity IDs and original workbook links are unchanged. Redundant embedded page previews were removed. | C `workspace/index.html`, `main.js`, `unit-c.css` |
| Textbook viewer | A gained B/C-style Expand and native resize controls. B/C page images are reading derivatives with outer printer registration marks trimmed; the PDF, original images, printed-page map and accessible text remain intact. | A `workspace/index.html`, `main.js`, `unit-a.css`; B/C `course-data.json`, compiled `course-data.js`, `index.html`, `assets/reader-pages/`; `scripts/prepare-science24-reader-pages.cjs` |
| Formula sheet | A now has a persistent compact launcher and a movable, resizable in-course window. Two rendered pages work without a PDF plug-in; Zoom pages allows sideways reading on a phone. The original PDF remains linked. | A `workspace/index.html`, `main.js`, `unit-a.css`, `assets/science24-formula-page-*.png`; `scripts/prepare-science24-formula-sheet.cjs` |

The formula PDF is the supplied source. Its periodic-table page uses older element names. The window labels it as the supplied table; updating that source content is a separate teacher decision.

## Focused verification

- Chromium scanned all 50 teaching/review required-check headings at 1594, 390 and 320 px: no label/title overlap, horizontal document overflow or page error.
- The Unit C Lesson 10 saved workbook note was written before relocation in an isolated persistent browser profile and opened afterward in Textbook Practice with the same ID, text and saved status. All 17 IDs are unique and their linked workbook files exist.
- A formula sheet opened and closed at desktop and phone widths, both page images decoded, keyboard arrow movement, pointer dragging, native corner resizing, Expand/Reset and phone zoom worked. No phone document overflow.
- A/B/C textbook viewers opened their mapped pages. B has 51 and C has 49 generated clean images, with no missing catalog or question-page image. Representative first, middle and last pages were inspected for retained instructional content and removed outer marks.
- A/C `main.js`, B/C compiled data and both preparation scripts passed `node --check`. Full course E2E, Studio lifecycle, readiness, export and Brightspace checks remain deferred to rollout.

## Review previews

- [Unit A Lesson 4 check](http://127.0.0.1:4182/#lesson-04) · [Formula sheet from any Unit A page](http://127.0.0.1:4182/#lesson-09)
- [Unit B textbook reader](http://127.0.0.1:4191/science24-unit-b/workspace/#lesson-10)
- [Unit C textbook reader](http://127.0.0.1:4191/science24-unit-c/workspace/#lesson-10) · [Unit C workbook practice](http://127.0.0.1:4191/science24-unit-c/workspace/#textbook-practice?topic=10&workbook=10)

Representative screenshots are under each unit's `meta/review-screenshots-layout/`; the exact hashes are in the candidate record. These local links require the existing preview servers.

## Teacher sign-off points

- [ ] Check a required-check heading and the Formula Sheet window on desktop and phone.
- [ ] Check the C Lesson 10 textbook page and original workbook panel in Textbook Practice.
- [ ] Decide whether the supplied, older periodic-table page should remain visible or be replaced before learner release.

No teacher sign-off has been recorded yet.
