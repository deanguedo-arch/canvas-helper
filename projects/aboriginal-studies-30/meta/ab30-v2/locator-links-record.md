# Source-locator links — record (outside R tickets; user-requested UX)

## Request
Scan the course for `Chapter N, printed p. P (supplied PDF p. Q)` locator
wording and replace the supplied-PDF assumption with a clickable prompt
that pops the woven textbook viewer open right at the source.

## Scan result (course-wide, course-data.js)
- 576 source locators total: 570 `Chapter N, printed p. P (supplied PDF
  p. Q)`, 1 `Chapter N profile, ...`, 5 Walking Together readings
  (external University of Alberta material, no woven target).
- Exactly ONE chapter/page mismatch found: L01 Source F claimed
  "Chapter 1, printed p. 76" — verified against the staged textbook PDF
  (file p. 84) that printed p. 76 opens CHAPTER THREE. Corrected to
  "Chapter 3 ..." in course-data.js + the R10 lesson review (no test
  pinned the wrong string).

## Implementation (R09-freeze-safe: no frozen file touched)
- NEW `workspace/source-locator-links.js`: progressive enhancement.
  Observes `#content-body`, and per rendered `.source-card` it strips
  the `(supplied PDF p. N)` tail (head + Locator row) and inserts a
  `Find this in the textbook: [Read here at page P]` prompt after the
  extract. The button reuses the frozen main.js reader contract
  verbatim (`data-open-chapter` = chapter file,
  `data-chapter-page` = PRINTED page; existing delegation opens the
  dialog viewer at the converted PDF page). Walking Together cards are
  detected and left untouched. Idempotent via data-locator-links marks.
- `workspace/index.html`: loads the script after main.js.
- No course-data.js changes except the one-word L01 chapter correction.

## Verification
- NEW `scripts/tests/aboriginal-studies-30-locator-links.test.ts` (5/5):
  all 571 Chapter locators parse and resolve inside their real chapter
  PDFs via the frozen main.js seam; 5 Walking Together skips pinned;
  tail-strip, button contract, escape, no-DOM boot guard, ship check.
- Render→parse integration probed on L44 (15/15 cards parse from
  frozen render output; sample button targets chapter-7.pdf p. 210).
- Full battery: 352/353 (only pre-existing lead-owned shell file).
  LESSON-FREEZE green. Doctor PASS (legacy-snapshot-v1).
- Asset manifest regened (new shipped file).

## Limitations
- Live-browser click proof NOT_RUN in-sandbox (frozen interaction
  pattern; delegation is pre-existing main.js behavior).
- Walking Together cards keep their locator text with no popup (no
  woven target exists).
