# R08 record — Lesson 7 teaching specimen + real activity sequence

## Implemented
- **Lesson 7 rebuilt as `ab30-v2-l7.1`** from the v2 specimen: 7 taught
  sections (purpose/understanding organizer, Sources A+B, 4-step worked
  example with finished response, supported selection + repair, Source N
  narration boundary, Source C independent task, assigned-work bridge to
  Q28–31) plus the kept reflection. Nine v1 source cards collapse to the
  four specimen cards A/B/N/C; D lives bank-only as the transfer variant.
- **Specimen language applied:** removed "Earlier notes said four…",
  "load-bearing", "classic drift", "Compare, do not despair"; L7-LANGUAGE
  pins the ban list.
- **Narrator arbitration (deferred from R07):** Source N is textbook
  narration — verified first-hand in PDF text (B's quotation closes with
  "Ahnassay explains.", N is unquoted, a new quotation opens after it).
  The v1 speaker attribution on N was wrong and is corrected. Recorded in
  `evidence/R08/lesson07-bank-ledger.json` with the PDF evidence.
- **Source D verified verbatim** against the staged official PDF (file
  p37, de-hyphenated) with Archibald context confirmed.
- **New `supportedSelection` block** (lesson-components.js): real radios
  with pinned option ids, Check button, in-place live-region feedback,
  exposure-aware review note. Repair runs through the R03
  first-save→criteria→revision lifecycle via `independentTask` with a
  section-label override. `source-details` + `lesson-guide` testids added.
- **Bank:** 8 reviewed specimen items registered (6 objective + 2
  written), all formalMarks null / compulsory false; engine maps only
  reviewed multipleChoice items (`ab30-practice-bank-v1:1`); catalogue
  modes stay honestly not-offered until R29.
- **Sessions:** in-lesson checks run real engine sessions (one open
  supported run per item; first check = first attempt, later checks =
  revisions; exposure recorded). Selected-response runs resume through
  the generalized run renderer.
- **Q28–31 byte-identical**, same save keys; prior formative key kept so
  no saved work is orphaned (content version distinguishes the new task).

## Evidence
- New suite `scripts/tests/aboriginal-studies-30-lesson07.test.ts`: 10/10
  (structure, sources, language, bank pins, bank sync, wrong→revision
  session through the real store adapter, eligibility gate, gating on
  both written tasks, workload roles, handler presence + styles).
- Full battery: 176/177 (only the pre-existing lead-owned shell file,
  missing `scripts/lib/projects.js`, untouched by R08).
- CONTENT05/06/07/08 + STATE07 updated to the R08 pattern (no weakening:
  exact 4-card set, narration creator rule, hook-based gating checks).
- Route seam gained `bindSupportedSelections`; asset manifest regened.
- Browser proof scripted (`scripts/lib/as30-r08-browser.cjs`, syntax +
  selector checked) but NOT_RUN in-sandbox: no browser engine can launch
  here. Outside command: `node scripts/lib/as30-r08-browser.cjs`.
- Hashes: course-data eb060c31…, components 5ddf4709…, bank 4daff28d…,
  engine 8b700525…, main ce50fd31…, styles 938c55f2…, textbook ef788644…
  (matches the R00 source register).

## Limitations / carry to R09
- Screenshots + live click/keyboard/zoom/screen-reader proof NOT_RUN
  (sandbox); the R08 browser script + section list is ready for an
  outside-sandbox run.
- Bank items keep `AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW`
  until the R09 review pass; no teacher approval claimed or requested.
- Lead integration review still pending; no publish performed.
