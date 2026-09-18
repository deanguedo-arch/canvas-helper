# Chapters 15–20 verification summary

## Actual recorded results

The six chapter reports contain **579 passing checks and no failing checks in those recorded suites**. This is not a count of independently graded student items or a certification of every scientific statement.

| Suite | 15 | 16 | 17 | 18 | 19 | 20 | Total |
|---|---:|---:|---:|---:|---:|---:|---:|
| static-science-results.json | 25 | 26 | 27 | 30 | 29 | 28 | 165 |
| browser-results.json | 40 | 40 | 40 | 40 | 40 | 42 | 242 |
| additional-browser-results.json | 19 | 19 | 19 | 19 | 19 | 19 | 114 |
| final-smoke-results.json | 10 | 8 | 9 | 11 | 9 | 11 | 58 |

The full browser-interaction and additional-browser suites were repeated on the final course outputs after all runtime and bank refinements. Browser and final-smoke JSON reports identify those HTML files by SHA-256. The final smoke run also blocked external HTTP/HTTPS requests, demonstrating core operation without the video network dependency in the test environment.

## What was checked

Exact stylesheet fingerprints; complete routes and check registries; local asset references; answer validity and varied positions; selected independent chromosome, probability, DNA, Hardy–Weinberg and population calculations; start/answer/feedback/writing gates; first-attempt preservation; guided hints; vocabulary drawer/Escape; all labeling maps; practice setup, mixed completion and retry; reset/cancel and completed-history preservation; Frayer collection and draft state; original-question selection, context, draft/save and enlargement; optional-work isolation; transfer history; responsive overflow; All My Work and Chromium print rendering; simulated save failures and revision conflicts.

Separate reproducibility tests confirm that canonical builds reproduce the six portable HTMLs exactly, and the editable schematic scripts reproduce all 76 paired teaching/labeling SVGs exactly. See each chapter's `reproducibility-results.json`.

## Environment and limits

Chromium loaded each actual HTML in an in-memory document. A deliberate Map-backed localStorage substitute exercised state transitions, payload restoration and failure handling. Direct file and localhost navigation both returned ERR_BLOCKED_BY_ADMINISTRATOR; the recorded attempt is included. Therefore these tests are **not** evidence of actual file/HTTPS-origin close/reopen persistence, operating-system printing, real multi-tab behavior, or Brightspace/SCORM persistence.

No complete SCORM package is claimed. No live LMS testing was performed.

## Source and visual acceptance

All 38 newly authored scientific schematic designs were visually reviewed, along with the selected source teaching-figure crops. Their active answer maps and underlying quantitative cases were reconciled. Two misleading source figure candidates were excluded rather than copied into the teaching. Source discrepancies and adaptations are documented outside the student pages.

The 493 original textbook numbered questions/selected supplied-data tasks retain subparts and full-page context; assets, geometry, IDs, scope and supporting references were checked. **Not every original question crop received a separate full-size visual reread.** Final teacher acceptance should review that original-question library. Those responses are saved, not automatically graded.

The 63 video records use links extracted from the supplied sources and include local written support. These are 63 chapter placements, not a claim of 63 unique videos that were watched end-to-end or certified currently available.

Lesson/topic coverage is mapped to the supplied generation plan, teacher decks and chapter sources. **Current official Alberta outcome codes remain unverified.** No invented code mapping is presented.

## Required acceptance before release

Run the imported courses on a normal origin with their native storage, check two tabs and two different chapters, review source-question crops/scope and external videos, confirm current outcome codes, then integrate and test the LMS adapter's launch/commit/close/resume path. Preserve existing teaching and the design lock while addressing those acceptance checks.
