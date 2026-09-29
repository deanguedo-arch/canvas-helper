# Ticket T10 completion record

Status: IMPLEMENTED (queue reviewGate: no extra approval beyond the master contract)
Baseline commit/source hashes: dirty overlay continues from the T09 record; this ticket rewrites workspace/course-data.js Lesson 7 only (t1-l07-numbered-treaties → contentVersion v2-exemplar-t10, 21 blocks), extends workspace/lesson-components.js (independentTask responseKey/criteria gating), wires workspace/main.js renderV2Blocks (formativeResponse context), updates meta/ab30-parity/lesson-review-manifest.json (L7 entry only), adds scripts/tests/fixtures/ab30-parity/textbook-ch1-pp24-28.txt + meta/ab30-parity/T10-lesson7-rendered.html, extends scripts/tests/aboriginal-studies-30-content.test.ts (CONTENT01 cutover + 6 new tests). contracts/learning-contract.d.ts gains the three optional IndependentTaskBlock fields.
Dirty-overlay/diff digest: cumulative working-tree overlay covers T01–T10 (uncommitted by contract). No Biology/Chemistry/brand files touched. No other lesson touched: 49 lessons stay v1-legacy (proven by CONTENT01). Q28–31 prompts byte-identical (proven by CONTENT08).
Writer/approved scope: Lesson 7 data; its reviewed sources; narrow component fix (save-gated formative criteria). No teacher/lead gate in this ticket — but T11 (the exemplar review gate) is the mandatory next step before any bulk rewrite, and NO approval is claimed here.

## Changed files and actual changes

- workspace/course-data.js: Lesson 7 only. Removed v1 body/example/check; added goal/prerequisite/essentialQuestion + 21 v2 blocks (5 explanation, 9 source, 1 comparison, 1 workedExample, 1 supportedPractice, 1 independentTask, 1 reflection, 1 synthesis explanation). bookletQuestionIds, prompts, terms, textbook band untouched. Source correction applied: FIVE federal purposes (farming restored — earlier notes said four).
- workspace/lesson-components.js: independentTask gains optional responseKey/responseLabel/criteria. Criteria render only after a saved response exists (render-time store check); criteria-without-key render openly with a `criteria-without-response` validation issue (no gating theater); empty keys flagged `invalid-response-key`. Saved text escaped; throwing stores fail locked.
- workspace/main.js: renderV2Blocks passes formativeResponse (readCourseResponse) into the block context. Q28–31 boxes render through the unchanged renderLessonQuestions path (outside the v1/v2 branch).
- contracts/learning-contract.d.ts: responseKey/responseLabel/criteria documented on IndependentTaskBlock.
- meta/ab30-parity/lesson-review-manifest.json: L7 entry → (v2-exemplar-t10, unreviewed, reviewer null). Zero reviews claimed.
- scripts/tests/fixtures/ab30-parity/textbook-ch1-pp24-28.txt (new): pypdf extraction of textbook.pdf pp. 32–36 (= printed 24–28) with provenance header. chapter-1.pdf has no text layer (scans); textbook.pdf holds the same content with text.
- meta/ab30-parity/T10-lesson7-rendered.html (new): full Lesson 7 article rendered by production code, fresh + after save/reload, with the real attempt loop (first save, reload replay, revision).
- scripts/tests/aboriginal-studies-30-content.test.ts: CONTENT01 cutover (L7 v2, 49 v1); +CONTENT05 (attribution/quote-purity), +CONTENT06 (quote verification vs fixture + mutation control), +CONTENT07 (no agreement/identity language), +CONTENT08 (Q-record pins + formative role), +STATE07 (save/reload/gate loop), +FORMATIVE-GATE (validation/lock/unlock/XSS/throwing-store).

## Evidence

- `node --test scripts/tests/aboriginal-studies-30-content.test.ts`: 13/13 pass. Log: meta/ab30-parity/T10-run.log.
- Regression battery same session: 84/84 (22 parity + 18 state + 10 source + 8 route + 13 content + 13 practice).
- Matrix coverage for T10: CONTENT01–08 auto halves green (01–04 pre-existing, 05–08 new); PRACT03 green (practice suite, unchanged); STATE07 auto green (new); STATE07/PRACT03/CONTENT human + browser halves NOT RUN (no browser/human here; tracked for T11/T23).
- `node --check` on course-data.js + lesson-components.js + main.js: SYNTAX_OK. `npx tsc --noEmit`: ZERO errors in touched files.
- Source verification (first-hand): textbook identified as Contemporary Issues: Aboriginal Studies 30 (Les Éditions Duval, 2005) from its own title/copyright pages; printed→PDF mapping printed-24..28 = PDF pp. 32..36 confirmed by running heads; all 9 extracts verified contiguous substrings post-normalization (CONTENT06), each locator cites printed + PDF page.
- Pair-scope check (runbook step 1): worked pair = general textbook explanation (p.26) + one-adhesion retrospective (1899 Treaty 8); comparison caption + reasoning step 4 + response all state the one-adhesion limit. No treaty/event mixing: every extract names its treaty or its generality.
- Caught and fixed during T10: (1) NFD missed ﬁ/ﬂ ligatures → NFKD + dash folding in quoteNorm; (2) whitespace responseKey truthfully yields two codes — test corrected to both; (3) fixture sanity checks must use normalized text (raw has line breaks inside running heads).

## Learner-work impact

None to existing work: Q28–31 ids/labels/rows/kinds/numbers pinned byte-identical; response records and completion semantics unchanged; the new formative key resolves to role `formative` (CONTENT08) — zero new compulsory work, zero denominator change. Fresh installs start with criteria locked; existing envelopes unaffected (STATE01 green).

## Content/source review

Lesson 7 prose is new teacher-facing draft content, UNREVIEWED (manifest: unreviewed, reviewer null). Extracts are verified quotations; explanations/worked/supported/independent/criteria prose is executor-authored and needs T11 teacher review. NOTE for T11/lead: extracts quote an in-copyright textbook (©2005, all rights reserved) already shipped as the course PDF — short study extracts with full attribution, but no permission review is claimed; confirm fair-dealing/Access-Copyright posture before release. Holds carried forward: novel-4-3-activation, outcomes-mapping. M06 map + V02 video stay pending per the media register (comparison table carries the visual role; page teaches fully without media).

## Not run / failed / blocked

- CONTENT01–08 human halves (does the prose teach; are the limits right), desktop/mobile screenshots, keyboard/narrow-screen use, save→navigate→reload→revise over HTTP: NOT RUN — need a human and/or browser. Nearest first-hand evidence: T10-lesson7-rendered.html (exact renderer output, both states) + STATE07 reboot replay through real store bytes.
- npx tsx --test: same environmental EPERM; lead/CI verification needed (expect content 13/13 + prior suites unchanged).
- Nothing failed; nothing blocked.

## Next safe step

T11 (exemplar review gate) is next and MANDATORY before T12+: teacher checks first-time-learner comprehensibility against T10-lesson7-rendered.html + source set + test results; lead checks code/state integration. Per the runbook, approval applies to a specific lesson/content/component hash — the T11 packet must record the content hash of v2-exemplar-t10 + lesson-components.js + renderV2Blocks. T12–T19 stay blocked until T11 approval is recorded; T14/T16/T18/T20–T23 have no T11 dependency and may proceed in parallel under separately selected tickets.
