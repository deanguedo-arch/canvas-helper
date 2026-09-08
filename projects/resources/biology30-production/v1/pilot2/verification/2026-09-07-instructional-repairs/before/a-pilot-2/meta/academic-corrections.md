# Pilot 2 — practice, textbook and standards correction

Workspace SHA: `f39669f01779f98a1c8d7d3ec5fe7e1524100d9d55f0b9286c01f4de5603e865`. Status: **awaiting explicit review**; academic gaps remain.

Preserved baseline: `21363490e611251c01101cee0bc5925583d1b856b8285a87ee74838ddd1341e5` in [the content-addressed baseline](../raw/academic-correction-baselines/21363490e611251c01101cee0bc5925583d1b856b8285a87ee74838ddd1341e5/workspace/index.html).

## What changed

- 49 question locators corrected, including all twelve wrong-chapter Final Practice links. All 86 also link to an exact local explanation; background-only textbook support is labelled as background.
- 188 weak alternatives replaced; all 258 visible incorrect choices now have specific explanatory feedback.
- Visible correct positions: position 1: 21; position 2: 22; position 3: 22; position 4: 21. No correct answer, question prompt or grading key changed.
- Changed alternatives receive fresh single-character option IDs. Old answers remain in the same saved records and are shown with their original wording in the question and Process Collection. This is compatibility for an earlier attempt, not a new response-history feature.
- The source inventory now distinguishes 47 acceptable examples, five excellence examples and one local curriculum criterion. Excellence examples no longer become automatic core-gap requirements; required Program of Studies outcomes remain.

## Reproduction and ownership

Author in `scripts/lib/biology30-unit-a-pilot-2/practice-corrections.ts`, `contracts.ts`, `academic-evidence.ts` and `render-gate1.ts`. Never edit generated HTML. The contained final-academic builder snapshots the pre-correction HTML and metadata, rejects drift, validates authored changes and protected instruction, and promotes only a complete staged candidate.

`npm run build:biology30-unit-a-pilot-2 -- --project biology30-unit-a-pilot-2 --gate final-academic-review --baseline-workspace-sha 219eb5affa6005871952fe840f52790fc187c6d8b183d6257d3694ac503131dc`

`npx tsx scripts/check-biology30-unit-a-academic-corrections.ts`

The historical [source-grounded review](remaining-academic-review.md) remains attached to its original SHA. Its defects must not be mistaken for a review of this new candidate. [Current machine contract](academic-corrections.json) records every before/after locator, alternative, feedback, source level and exact explanation.

## Unchanged and not yet cleared

Core instruction, media paths, all written work, 86 question IDs, 40 Advanced Learning blocks, schema 6, scoring, 18 required routes and 1,505/295 minutes are preserved. No deployment, export, commit, push or B–D transfer is authorized by this correction.

- Thirteen complete transcript reviews and all fourteen illustrated-equivalent repairs
- Chapter 12/13 structure-function and hormone-source evidence gaps
- Practical-delivery and collaboration decisions
- Final Practice topic distribution and Diploma Challenge depth review; this batch preserves question meanings
- Measured workload, student comprehension, full exact-build teacher acceptance and later LMS validation

## Item-level map

| Item | Textbook | Support | Correct position |
| --- | --- | --- | --- |
| lesson-01-guided-1 | chapter-11, p.372, PDF 13 | direct; local #lesson-01-learn-1 | 3 |
| lesson-01-guided-2 | chapter-11, p.378, PDF 19 | direct; local #lesson-01-learn-2 | 1 |
| lesson-02-guided-01 | chapter-11, p.376, PDF 17 | direct; local #lesson-02-learn-2 | 4 |
| lesson-02-guided-02 | chapter-11, p.377, PDF 18 | background; local #lesson-02-learn-3 | 2 |
| lesson-03-guided-1 | chapter-11, p.380, PDF 21 | direct; local #lesson-03-learn-1 | 2 |
| lesson-03-guided-2 | chapter-11, p.382, PDF 23 | direct; local #lesson-03-learn-2 | 4 |
| lesson-04-guided-01 | chapter-11, p.396, PDF 37 | direct; local #lesson-04-learn-2 | 1 |
| lesson-04-guided-02 | chapter-11, p.398, PDF 39 | background; local #lesson-04-learn-2 | 3 |
| lesson-05-guided-01 | chapter-11, p.391, PDF 32 | direct; local #lesson-05-learn-2 | 4 |
| lesson-05-guided-02 | chapter-11, p.387, PDF 28 | background; local #lesson-05-learn-3 | 2 |
| chapter-11-practice-01 | chapter-11, p.372, PDF 13 | direct; local #lesson-01-learn-1 | 3 |
| chapter-11-practice-02 | chapter-11, p.378, PDF 19 | direct; local #lesson-01-learn-2 | 1 |
| chapter-11-practice-03 | chapter-11, p.370, PDF 11 | direct; local #lesson-01-learn-3 | 1 |
| chapter-11-practice-04 | chapter-11, p.369, PDF 10 | direct; local #lesson-04-learn-1 | 3 |
| chapter-11-practice-05 | chapter-11, p.374, PDF 15 | direct; local #lesson-02-learn-1 | 2 |
| chapter-11-practice-06 | chapter-11, p.376, PDF 17 | direct; local #lesson-02-learn-2 | 4 |
| chapter-11-practice-07 | chapter-11, p.377, PDF 18 | background; local #lesson-02-learn-3 | 2 |
| chapter-11-practice-08 | chapter-11, p.377, PDF 18 | direct; local #lesson-02-learn-2 | 1 |
| chapter-11-practice-09 | chapter-11, p.379, PDF 20 | background; local #lesson-03-learn-1 | 4 |
| chapter-11-practice-10 | chapter-11, p.382, PDF 23 | direct; local #lesson-03-learn-2 | 3 |
| chapter-11-practice-11 | chapter-11, p.385, PDF 26 | direct; local #lesson-04-learn-1 | 3 |
| chapter-11-practice-12 | chapter-11, p.398, PDF 39 | background; local #lesson-04-learn-2 | 4 |
| lesson-06-guided-01 | chapter-12, p.408, PDF 5 | direct; local #lesson-06-learn-1 | 2 |
| lesson-06-guided-02 | chapter-12, p.407, PDF 4 | direct; local #lesson-06-learn-2 | 1 |
| lesson-07-guided-01 | chapter-12, p.412, PDF 9 | direct; local #lesson-07-learn-1 | 4 |
| lesson-07-guided-02 | chapter-12, p.414, PDF 11 | direct; local #lesson-07-learn-2 | 3 |
| lesson-08-guided-01 | chapter-12, p.421, PDF 18 | direct; local #lesson-08-learn-2 | 1 |
| lesson-08-guided-02 | chapter-12, p.424, PDF 21 | direct; local #lesson-08-learn-3 | 2 |
| chapter-12-practice-01 | chapter-12, p.408, PDF 5 | direct; local #lesson-06-learn-1 | 1 |
| chapter-12-practice-02 | chapter-12, p.408, PDF 5 | direct; local #lesson-06-learn-1 | 2 |
| chapter-12-practice-03 | chapter-12, p.408, PDF 5 | direct; local #lesson-06-learn-1 | 3 |
| chapter-12-practice-04 | chapter-12, p.407, PDF 4 | direct; local #lesson-06-learn-2 | 4 |
| chapter-12-practice-05 | chapter-12, p.412, PDF 9 | direct; local #lesson-07-learn-1 | 3 |
| chapter-12-practice-06 | chapter-12, p.411, PDF 8 | direct; local #lesson-07-learn-1 | 2 |
| chapter-12-practice-07 | chapter-12, p.414, PDF 11 | direct; local #lesson-07-learn-2 | 4 |
| chapter-12-practice-08 | chapter-12, p.416, PDF 13 | direct; local #lesson-07-learn-2 | 1 |
| chapter-12-practice-09 | chapter-12, p.420, PDF 17 | direct; local #lesson-08-learn-1 | 4 |
| chapter-12-practice-10 | chapter-12, p.421, PDF 18 | direct; local #lesson-08-learn-2 | 1 |
| chapter-12-practice-11 | chapter-12, p.424, PDF 21 | direct; local #lesson-08-learn-3 | 2 |
| chapter-12-practice-12 | chapter-12, p.425, PDF 22 | direct; local #lesson-08-learn-3 | 3 |
| lesson-09-guided-01 | chapter-13, p.441, PDF 8 | direct; local #lesson-09-learn-2 | 2 |
| lesson-09-guided-02 | chapter-13, p.442, PDF 9 | direct; local #lesson-09-learn-3 | 4 |
| lesson-10-guided-01 | chapter-13, p.445, PDF 12 | direct; local #lesson-10-learn-2 | 3 |
| lesson-10-guided-02 | chapter-13, p.444, PDF 11 | direct; local #lesson-11-learn-1 | 1 |
| lesson-11-guided-01 | chapter-13, p.441, PDF 8 | direct; local #lesson-11-learn-2 | 1 |
| lesson-11-guided-02 | chapter-13, p.444, PDF 11 | direct; local #lesson-11-learn-1 | 3 |
| lesson-12-guided-01 | chapter-13, p.448, PDF 15 | direct; local #lesson-12-learn-1 | 4 |
| lesson-12-guided-02 | chapter-13, p.450, PDF 17 | direct; local #lesson-12-learn-2 | 2 |
| lesson-13-guided-1 | chapter-13, p.456, PDF 23 | direct; local #lesson-13-learn-1 | 4 |
| lesson-13-guided-2 | chapter-13, p.453, PDF 20 | direct; local #lesson-13-learn-3 | 2 |
| chapter-13-practice-01 | chapter-13, p.437, PDF 4 | direct; local #lesson-09-learn-1 | 1 |
| chapter-13-practice-02 | chapter-13, p.441, PDF 8 | direct; local #lesson-09-learn-2 | 3 |
| chapter-13-practice-03 | chapter-13, p.442, PDF 9 | direct; local #lesson-09-learn-3 | 3 |
| chapter-13-practice-04 | chapter-13, p.444, PDF 11 | direct; local #lesson-11-learn-1 | 1 |
| chapter-13-practice-05 | chapter-13, p.445, PDF 12 | direct; local #lesson-10-learn-2 | 2 |
| chapter-13-practice-06 | chapter-13, p.445, PDF 12 | direct; local #lesson-10-learn-3 | 4 |
| chapter-13-practice-07 | chapter-13, p.441, PDF 8 | direct; local #lesson-11-learn-2 | 1 |
| chapter-13-practice-08 | chapter-13, p.448, PDF 15 | direct; local #lesson-12-learn-1 | 4 |
| chapter-13-practice-09 | chapter-13, p.450, PDF 17 | direct; local #lesson-12-learn-2 | 3 |
| chapter-13-practice-10 | chapter-13, p.456, PDF 23 | direct; local #lesson-13-learn-1 | 2 |
| chapter-13-practice-11 | chapter-13, p.453, PDF 20 | direct; local #lesson-13-learn-3 | 2 |
| chapter-13-practice-12 | chapter-13, p.454, PDF 21 | direct; local #lesson-13-learn-4 | 3 |
| final-practice-core-01 | chapter-11, p.378, PDF 19 | direct; local #lesson-01-learn-2 | 1 |
| final-practice-core-02 | chapter-11, p.377, PDF 18 | background; local #lesson-02-learn-3 | 4 |
| final-practice-core-03 | chapter-11, p.379, PDF 20 | background; local #lesson-03-learn-1 | 3 |
| final-practice-core-04 | chapter-11, p.396, PDF 37 | direct; local #lesson-04-learn-2 | 4 |
| final-practice-core-05 | chapter-11, p.391, PDF 32 | direct; local #lesson-05-learn-2 | 1 |
| final-practice-core-06 | chapter-11, p.370, PDF 11 | direct; local #lesson-01-learn-3 | 2 |
| final-practice-core-07 | chapter-12, p.408, PDF 5 | direct; local #lesson-06-learn-1 | 1 |
| final-practice-core-08 | chapter-12, p.412, PDF 9 | direct; local #lesson-07-learn-1 | 2 |
| final-practice-core-09 | chapter-12, p.421, PDF 18 | direct; local #lesson-08-learn-2 | 4 |
| final-practice-core-10 | chapter-13, p.441, PDF 8 | direct; local #lesson-09-learn-2 | 3 |
| final-practice-core-11 | chapter-13, p.442, PDF 9 | direct; local #lesson-09-learn-3 | 4 |
| final-practice-core-12 | chapter-13, p.445, PDF 12 | direct; local #lesson-10-learn-2 | 1 |
| final-practice-core-13 | chapter-13, p.441, PDF 8 | direct; local #lesson-11-learn-2 | 3 |
| final-practice-core-14 | chapter-13, p.450, PDF 17 | direct; local #lesson-12-learn-2 | 2 |
| final-practice-core-15 | chapter-13, p.456, PDF 23 | direct; local #lesson-13-learn-1 | 2 |
| final-practice-core-16 | chapter-13, p.453, PDF 20 | direct; local #lesson-13-learn-3 | 3 |
| final-practice-core-17 | chapter-13, p.441, PDF 8 | background; local #lesson-11-learn-3 | 4 |
| final-practice-core-18 | chapter-13, p.453, PDF 20 | direct; local #lesson-13-learn-3 | 1 |
| final-practice-challenge-01 | chapter-11, p.378, PDF 19 | direct; local #lesson-01-learn-2 | 2 |
| final-practice-challenge-02 | chapter-11, p.380, PDF 21 | direct; local #l03-b02-heading | 4 |
| final-practice-challenge-03 | chapter-12, p.416, PDF 13 | direct; local #l07-b03-heading | 1 |
| final-practice-challenge-04 | chapter-13, p.448, PDF 15 | background; local #lesson-12-learn-3 | 3 |
| final-practice-challenge-05 | chapter-13, p.454, PDF 21 | direct; local #lesson-13-learn-4 | 3 |
| final-practice-challenge-06 | chapter-13, p.458, PDF 25 | background; local #lesson-13-learn-2 | 2 |
