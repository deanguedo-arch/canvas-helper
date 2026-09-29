# R09 record — pilot review + pattern freeze

## Gate reconstruction (package gap, recorded honestly)
- `09_ACCEPTANCE_AND_PROOF.md` and `templates/LESSON_REVIEW.json` are NOT in
  the delivered v2 package (specs present: 00/02/03/06/07). G2/G3 have no
  standalone definitions anywhere in the package; the acceptance matrix
  holds no R09/G1–G3 cases.
- Reconstructed operationally from the R09 ticket text + prior gate lines:
  - G1 = store ownership/migration/capacity (R02/R04, already IMPLEMENTED).
  - G2 = submission lifecycle + practice sessions persist firsts/revisions
    (R03 + R08 engine flow).
  - G3 = pilot surface works on desktop/mobile incl. source reading
    (R05/R06 components + R08 lesson path).
- Step-1 scenarios executed at the strongest level the sandbox allows
  (details below); visible-UI halves are scripted for outside-sandbox runs
  and marked NOT_RUN, never passed.

## G1–G3 scenario results
- **Navigation midway through practice: PASS (store-level proof).**
  `node /tmp/as30_r09_midpractice.js` → ALL PASS: wrong first persisted,
  handles dropped (navigation), store re-inited from the same bytes, run
  resumed with the first attempt + exposure intact, correct revision saved,
  first immutable. Output recorded in R09-COMPLETION.json commands.
- **Slow per-character writing: PASS (durable core) + NOT_RUN (timing).**
  Debounced draft commits + first-save gating + reload persistence are
  proven by STATE07 (real store) and L7-GATING (both written tasks). The
  R08 browser script types into both boxes, waits out the debounce, and
  asserts persistence across reload — NOT_RUN in-sandbox (no browser).
- **Storage denial: PASS (existing proof).** PRACT03 proves independent
  firsts save before feedback shows and failure keeps the draft; the
  supported/independent handlers render explicit save-failed messages and
  keep learner input in place (sliced + syntax-checked; live denial needs
  a browser → NOT_RUN).
- **Mobile Escape + source reading: NOT_RUN live.** Static preconditions
  pass: ROUTE05 (dialog focus restore), UI02 (named controls/landmarks),
  CONTENT05 (exactly the 4 specimen blockquotes), VIS06 (compact cards +
  disclosure), overflow assertions scripted in as30-r08-browser.cjs.
- **Bio same-text comparison: fixture frozen (VIS07 PASS, 7/7 visual
  suite).** Full-size screenshot inspection NOT_RUN in-sandbox; reference
  comparison rides with the outside browser run.

## Review pass (separate from the R08 implement pass; single agent, disclosed)
- Full learner-text read against T-01..T-05: goal taught with excerpts,
  sources/locators/quote checks, finished worked response + reasoning,
  supported wrong/correct paths + repair, fresh Source C independent task
  with saved-first-response, misconceptions located, organizer-as-visual
  rationale, Q28–31 bridge with zero new compulsory work — all recorded
  with quoted passages in `evidence/R09/lesson07-review.json`.
- Bridge page claims verified first-hand in the staged PDF: 12/12
  (five p25 purposes; p26 surrender/share + FN wants; p28
  contracts/oaths/ceded; p27 translator).
- Findings: 1 minor-clarity fix (supported method now names Source B;
  suites re-run 27/27, manifest regened); 1 observation (worked evidence
  paraphrases with citations beside the visible extracts — acceptable).
- No teacher/Elder/community review; candidate acceptance only.

## Freeze
- `evidence/R09/pattern-freeze.json`: file hashes for lesson-components,
  practice-engine, main, styles (any shared edit trips the freeze and
  forces re-freeze + re-proof) + semantic hashes for the L7 record and
  the 8 bank items (R10–R28 must not alter the pilot).
- New `LESSON-FREEZE` test in the lesson07 suite (11/11).

## Battery + doctor
- Full battery: 177/178 (only the pre-existing lead-owned shell file).
- `course:doctor --project aboriginal-studies-30` → PASS
  (legacy-snapshot-v1).

## Host-only blockers (separate, per step 5)
- Live browser proof (as30-r08-browser.cjs) needs an outside-sandbox run.
- Real-host export/Brightspace verification stays with the lead (R31).
- Lead integration review still pending; no publish performed.
