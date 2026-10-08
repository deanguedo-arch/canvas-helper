# Chapter 14 — verification results

Date: 17 September 2026. Status: working integration/review build; not learner-release certification.

## Passed with recorded evidence

- Exact v8 main and Textbook Practice stylesheet hashes; no new design overrides.
- Eleven configured required checks, correct ordinary/final question counts, unique DOM IDs and valid automatically checked MC answer membership.
- All 23 course routes open in the Chromium DOM test.
- Vocabulary-link resolution; drawer opening and Escape closing.
- Blank required-check blocking, wrong-first hints, correct-selection writing unlock, explicit written saving, saved-to-draft edit transition, first-try preservation and completed history.
- Guided first-wrong hint, later explanation, correction and required-progress isolation.
- All four generated practice modes start with saved item identities/options.
- An actual mixed set exercises multiple interaction kinds, completes, enters history and produces retry practice without changing the completed record.
- Reset confirmation cancel preserves the active run; confirming clears only unfinished practice and preserves history.
- A freshly created in-memory browser document restores the saved snapshot and option order from the provided storage payload.
- All six labeling activities render, accept their configured keys and save completed attempts.
- Independent transfer blocks blank submissions, saves the whole set and preserves the first submission across later attempts.
- Frayer fields start empty; collection works; editing returns work to Draft; eight selected words are enforced.
- Optional extension comparison criteria stay locked until a valid response is saved.
- Textbook responses move from Draft to Saved and back to Draft after an edit; question enlargement opens.
- Split-PDF dialog maps printed p. 495 to PDF page 20 of 30.
- All My Work displays collected test work; Chromium produced a six-page print artifact. Its opening page was visually inspected.
- No horizontal document overflow in the tested lesson, vocabulary, textbook and mixed-practice surfaces at widths 1469, 1117, 980, 760, 390 and 320 pixels. Desktop and mobile lesson-header screenshots were inspected.
- No broken decoded embedded images in the exercised DOM states and no JavaScript page errors in either completed test run.
- Stored test state remains free of embedded image payloads; tested saved state was approximately 34 KB, not a claim about every possible long session.
- Simulated quota failure produces an explicit NOT SAVED warning. Simulated changed-on-disk revision prevents an overwrite.

Counts: **40 primary DOM assertions + 19 additional assertions = 59 passed recorded checks**. This is a count of assertions in the scripts, not coverage of every possible question permutation.

## Content and media review

- Main teaching was authored from the Chapter 14 deck, chapter textbook, daily-plan pacing and relevant assessment expectations. Source discrepancies and adaptations are documented outside the learner course.
- Source figures/crops and letter targets were visually inspected. The final follicle worksheet crop was extended to retain the last label and cleaned of clipped neighboring material.
- The sperm source is the isolated figure from slide 11, not a guessed crop from a neighboring textbook panel.
- All 82 active textbook prompts retain original wording with required subparts and supporting context. Final thought-lab crop revisions were visually inspected separately. Fourteen exclusion records state why the default inventory omits certain practical, external-research or unsupported clinical/policy tasks.
- The hormone plots are explicitly schematic, not observed concentration data.
- Course-authored static student text contains no leftover Chapter 12/13 titles, “teacher-slide,” “teacher notes,” “source video,” “supplied textbook,” “assigned pages,” or pilot editorial commentary. Original source images may retain their original textbook instructions and attribution.
- Answer positions are balanced at build time; ordinary practice also stores a seeded presentation. Positions do not rerandomize on navigation.

## Not run / not certified

1. Real-origin localStorage behavior, file-launch behavior, localhost hosting, genuine cross-tab events and actual close/reopen persistence. Network/file navigation was blocked by the execution environment; the storage double is explicitly present in the test scripts, never in the student artifact.
2. Live Brightspace SCORM API integration, LMS suspend data, network interruption/recovery, gradebook behavior or deployment. The existing adapter boundary is retained; no SCORM certification is claimed.
3. Full operating-system PDF viewer/download/print workflow. The dialog mapping and Chromium print rendering were tested, not every browser's PDF plug-in.
4. Complete external-video viewing and current availability/content validation. IDs come from the teacher deck, and every video has a local written equivalent.
5. Formal assistive-technology/screen-reader audit and every breakpoint/interaction combination. Existing reference accessibility patterns were reused and several keyboard/modal interactions were exercised; this is not a WCAG conformance claim.
6. Exact current-year official outcome-code/wording verification; see authoring/outcome-coverage.json. The supplied Unit B scope is mapped, but the official 2014 program PDF retrieval failed.
7. Independent teacher sign-off on all question/diagram semantics. Programmatic answer-key membership and configured-label tests do not substitute for that review.
8. Full Unit B assessment integration. Thirty-eight selected source MC questions and four written tasks are present. Other physical items remain deferred or excluded in the source ledger, chiefly for later Chapter 15/unit-review reconciliation.

## Reproduce the browser tests

Install Playwright for Python and a local Chromium. The included scripts use `/usr/bin/chromium` by default; set `BIOLOGY_CHROMIUM` to a different installed executable when needed.

```sh
python -m pip install playwright
python scripts/verify_browser.py
python scripts/verify_additional.py
```

For release, run equivalent tests on a normal origin without the storage double. Do not use the in-memory tests as evidence that live LMS testing passed.
