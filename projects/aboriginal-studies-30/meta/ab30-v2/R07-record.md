# R07 record — source reconciliation (official booklets now verify Themes 2-4)

- Contract: verify official booklet content, implement source-level items
  + subfields from the mapping contract, activate Halfbreed ONLY as a
  versioned profile, correct wording drift with a ledger. The v2 package
  supplied the official texts the T14-T18 tickets were blocked on, so
  those pre-booklet contracts migrate here — strictly stronger, never
  weaker (every migrated pin still pins exact text or exact state).

## Find/fix

- **Found:** only Theme 1 had source-level records; Themes 2-4 lessons
  had empty work bindings; 4 assignment records carried workbook wording;
  4-3 carried the legacy novel with Halfbreed staged-but-blocked.
- **Fixed:** theme-2/3/4 online booklets authored with verbatim booklet
  wording (103 prompts: Q1-28/30/22, land-value + discrimination +
  reserve + characteristics + issues + comparison + Halfbreed tables,
  chronology blanks, MC, Reel Injun R1-R14, A2.1/A2.2/A3.1/A3.3/A4.1/
  A4.2/A4.3); every prompt carries file-page + printed-page locators
  and booklet marks. Theme-1 glossary table appended (Q1-87 frozen).
- **Fixed:** 27 lesson bindings from EXPECTED_ITEM_HOMES (numbered via
  bookletQuestionIds, unnumbered via 11 section-map entries); all 281
  homes resolve (field-manifest.json).
- **Fixed:** 2-1/2-2/attawapiskat/4-2 records + HTML/DOCX mirrors moved to
  official wording (ledger E-R07-01..04); manifest pins/anchors updated.
- **Fixed:** 4-3 versioned profiles — legacy byte-identical with
  original keys; v2-halfbreed official wording on `::v2-halfbreed`
  keys; card renders Halfbreed + legacy history (read-only text,
  continuing draft) only when legacy work exists. Teacher review
  pending; nothing transferred; no approval stamped.
- **Investigated, no defect:** Q79 (label/choices/home/section match;
  renderer auto-letters) and Lesson 7 narrator/speaker (no live
  "narrator" label; specimen arbitrates in R08). Source quirks
  preserved verbatim + ledgered, never smoothed.
- **Migrated:** SRC02/SRC04 (named attawapiskat must-exception),
  XW01/XW03/XW04 x3, NOVEL-GATE, shell prompt count 89->90, manifest
  versions/holds (6 holds: 3 resolved-booklet + novel-review +
  film-locators + outcomes-map).

## Evidence

- Transcriptions (reviewed JSON) + field-manifest.json (281 rows).
- Tests: 8/8 reconcile; 10/10 source; 15/15 XW/gate; battery 173/176
  (same 3 lead-owned shell); doctor PASS; node --check both files.
- Official PDFs: AB30-T1 81632538… (32pp), T2 9d696526… (20pp),
  T3 f8e0f22d… (23pp), T4 a154ca2b… (23pp).
- Open: film-locator-verification + novel-4-3-teacher-review holds.
