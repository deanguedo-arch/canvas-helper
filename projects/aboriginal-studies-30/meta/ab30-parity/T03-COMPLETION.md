# Ticket T03 completion record

Status: IMPLEMENTED (SRC01–SRC08 automated green; +human halves pending lead/teacher)
Baseline commit/source hashes: branch codex/math-engine-preflight @ 02a9fadc; T03 inputs main.js 82b1b5ca…, course-data.js 87c05932… (changed by this ticket; index.html/styles.css untouched).
Dirty-overlay/diff digest: ticket touched course-data.js, main.js, 8 HTML mirrors, 8 DOCX handouts, 3 new manifests, 1 new test file. git diff --check clean on all touched paths (one pre-existing whitespace flag in unrelated math10c file, not mine).
Writer/approved scope: assignment data/exports; developer manifests. No approval gate beyond the master contract.

## Changed files and actual changes

- workspace/course-data.js: 16 criteria/rubric links (8 visible assignments) routed from private Google Docs to bundled local PDFs (same convention the 4 shells already used); `sourceAudit` block removed from the student bundle (values preserved in source-ledger.json; zero code references verified).
- workspace/main.js: `renderWrittenSteps` step 4 Conclude→Connect with criteria-faithful text + handout attribution; Interpret starters completed to the official 7; Statement example aligned + attributed. `libraryPageCounts` halfbreed 223→222 (verified).
- workspace/assets/assignments/html/*.html (8 visible): criteria links → path-correct `../../library/*.pdf`.
- workspace/assets/assignments/docx/*.docx (8 visible): resource text → `critical-response-*.pdf (in the course library)`; all 12 DOCX zip-valid after edit. 4 shell files untouched (no criteria URLs).
- meta/ab30-parity/assignment-manifest.json (new): 12 assignments (official source/hold, wording hash, observed required/optional modes, links, textbook, export parity) + versioned 4-3 record (legacy selected; Halfbreed candidate blocked-not-activated) + 5 holds.
- meta/ab30-parity/source-ledger.json (new): 13 local + 6 D2L sources with hashes/pages/roles, 4 variances with dispositions, moved sourceAudit values.
- meta/ab30-parity/editorial-log.json (new): E-T03-01..04 corrections + 1 observed-pre-existing note, all with before/after/source/reason.
- scripts/tests/aboriginal-studies-30-source.test.ts (new): 10 automated SRC tests incl. a dependency-free DOCX zip reader.
- Deliberately NOT changed: assignment prompt wording (even where holds exist — teacher decisions); shell booklet-Doc links (live booklet sources); WRITTEN_RUBRIC (verified faithful incl. its own "conclusion" wording, which is the rubric's essay-structure language, distinct from the criteria's Connect step).

## Evidence

- `node --test scripts/tests/aboriginal-studies-30-source.test.ts`: 10/10 pass. Log: meta/ab30-parity/T03-run.log.
- Source forensics (pypdf, read-only; D2L ZIP sha256 371449cbf5e175f6…): Theme 1 booklet (36 pp, Oct 2021) verifies 1.1 (pp.4-5, incl. pre-existing "Aborigional"→"Aboriginal" fix) and 1.2 (p.29) verbatim; Aug 2020 workbooks are SUPERSEDED for Theme 1 (different 1.1 essay) and UNVERIFIED-best-available for Theme 2 (different 2.1/2.2 tasks → holds, not silent adoption); novel-study PDF p.25 verifies legacy 4-3 verbatim (mode-wording difference logged as teacher decision); criteria/rubric bundled copies verified framework-identical to D2L-issued copies (6 copyedits + thanks-note + header variances logged, non-blocking); Halfbreed reader identified (M&S 2019, ISBN 9780771024092, 222 pp).
- Rendered proof (real renderers): assignment card steps run Statement>Evidence>Interpret>Connect, zero Google refs, criteria/rubric/indigenous-worldviews served as in-course viewer buttons; rubric header "Critical Response Rubric · 16 marks" + 3 criteria rows. Probes: /tmp/ab30evidence/t03_render_probe.js.
- Parity suite re-run: still 14/4 (the 4 T05/T06 reds unchanged — T03 undisturbed mapping).
- `npx tsc --noEmit`: 51 errors repo-wide, ZERO in touched files (1 transient error in the new test file fixed within the ticket).
- `npx tsx --test`: same environmental EPERM; lead/CI verification needed.
- SRC01: canonical wording hashes locked + official anchors; HTML/DOCX sentence parity proven for all 12 (no generation pipeline exists — recorded; mirrors are synced snapshots).
- SRC02: legacy anchors intact; no Halfbreed assignment renders; candidate blocked with reason + linked reader present.
- SRC03: zero answer-key fields/content in bundle (sole prior hit was the removed sourceAudit count); MC prompts carry no correctness fields; 5 holds owned.
- SRC04: required phrases + verbatim suggestions locked; no must-escalation.
- SRC05: no machine paths/audit in bundle; attribution remains.
- SRC06: steps order + 7 starters + attribution; rubric levels/weight/descriptors locked to verified PDF values.
- SRC07: coded page counts == real counts (all 7 chapters + textbook + halfbreed-fixed + criteria + rubric + glossary); every lesson/assignment printed ref resolves inside its PDF; boundary formula spot-checked. Folio ground truth needs human visual check (scanned chapters) — the +human half.
- SRC08: 5 log entries complete; outcomes mapping an explicit hold (doc not located).

## Learner-work impact

None. No IDs, storage keys, prompts, modes, or marks changed. Link routing changes only where criteria/rubric OPEN (private Doc → bundled PDF viewer). DOCX/HTML mirrors carry the same requirements text as before (sentence parity proven).

## Content/source review

No prompt/mode/policy words altered. Discrepancies LOGGED, not fixed: Attawapiskat 2015-vs-2023 recency + modes (T16/teacher); 4-3 mode wording (T18/teacher); 2.1 textbook-ref justification (T14/teacher); Theme 2-4 booklet wordings (holds). Workbook-vs-booklet version map recorded. Teacher approvals still required: 4-3 activation, assessment wording/modes, +human halves of SRC01/02/06/07/08. Lead review: T03 manifests + tsx verification.

## Not run / failed / blocked

- tsx suite run: environmental EPERM; lead/CI must run both suites (expect source 10/10, parity 14/4).
- Browser/visual proof + printed-folio ground truth: NOT RUN (no browser); folio check needs human eyes on scanned pages.
- DOCX Word-application open test: NOT RUN (no Word); zip integrity + re-extraction verified.
- Blocked on missing sources (recorded as holds, not worked around): Theme 2-4 official booklets (Google Docs), official outcomes document.

## Next safe step

T04 (scope: pure store/migration proposal + tests; NO production activation): inventory host save/export ownership of the 3 storage keys; freeze alias/legacy field registry; design the versioned store adapter + conflict-preserving migration as pure functions with fixtures (F01–F22); measure payload capacity. STOP for lead approval of the persistence design before T05. Writer stopped: no — T04 authorized under the same "keep going" directive unless the user stops.
