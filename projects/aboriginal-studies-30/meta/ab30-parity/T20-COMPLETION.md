# Ticket T20 completion record

Status: IMPLEMENTED (queue reviewGate: no extra approval beyond the master contract)
Baseline commit/source hashes: dirty overlay continues from the T18 record; this ticket implements the All My Work collection in workspace/main.js (evidence collector + renderers + `mywork` route + nav wiring), adds the nav button in workspace/index.html, appends collection + print CSS in workspace/styles.css, and adds scripts/tests/aboriginal-studies-30-mywork.test.ts. NO store changes (collector consumes exportWork()).
Dirty-overlay/diff digest: cumulative overlay covers T01–T11 + T14/T16/T18-partial + T20 (uncommitted by contract). No Biology/Chemistry/brand files touched. No lesson, prompt, assignment, or stored-work semantics changed.
Writer/approved scope: collection/export UI; store export API (read-only use); print styles (queue allowedScope). No teacher/lead gate in this ticket.

## Changed files and actual changes

- workspace/main.js: `routeableSections` += mywork; render() branch; nav ref/map/handler; new evidence layer — evidenceLessonHome/evidenceLessonById/evidencePromptById/evidenceSubfieldLabel/resolveEvidenceRecord/collectWorkEvidence + evidenceStatusLabel/renderEvidenceGroups/renderEvidencePractice/renderEvidenceConflicts/renderMyWork/downloadEvidencePack. Resolution covers written/draft/booklet/formative/aliased-legacy/unmapped keys; table subfields resolve to row/column labels; attempts link to runs with exposure flags; conflicts resolve record titles.
- workspace/index.html: `#nav-mywork` "All My Work" button in Course Sections.
- workspace/styles.css: mywork screen styles + first-ever `@media print` block (chrome/toolbar hidden, evidence full-width, items kept on pages).
- scripts/tests/aboriginal-studies-30-mywork.test.ts (new): EVID01 grouping/context/links, EVID02 no-key-material, EVID03 honest empty, EVID04/COMP06 no-review-claims, EVID05/STATE11 round-trip + device-local runs, EVID06 route + nav, EVID07 print CSS, EVID08 conflicts/exposure/XSS, EVID09 odd-key robustness, EVID10 table-cell labels.

## Evidence

- `node --test scripts/tests/aboriginal-studies-30-mywork.test.ts`: 10/10 pass. Log: meta/ab30-parity/T20-run.log.
- Full battery same session: 109/109 across all 10 suites (22 parity + 18 state + 10 source + 8 route + 13 content + 13 practice + 4 theme2 + 5 theme3 + 6 theme4 + 10 mywork).
- Matrix step: STATE11 (round-trip, incl. the runs-stay-local boundary), ASSET04-auto (prompt/source context in evidence, keys excluded, print covers full collection), COMP05 (denominator untouched — collector is read-only), COMP06 (no review/mastery/host claims) — all green on the real collector/renderer.
- Rendered/state inspection: EVID01/EVID08/EVID10 assert on real renderer HTML over real store bytes (group links, chips, drafts, field labels, conflict counts, exposure flags); EVID06 proves the route parses + the nav button exists in the shell.
- `node --check` main.js: SYNTAX_OK. `npx tsc --noEmit`: ZERO errors in touched files.
- Caught and fixed during T20: (1) origins hold RECORD IDs not view keys — `written::X` records live as `assignment:X`, so the resolver treats `assignment:` recordIds as the normal written case (my first `aliased` labeling was wrong); (2) EVID05 initially demanded runs round-trip — importWork's T05 contract imports activity only, so the test now pins runs/exposure as device-local (design, not defect).

## Learner-work impact

None to existing work: collector is read-only over exportWork(); no records created, moved, or re-keyed; no denominator/role/completion change (COMP05 green). New surface only: the mywork route + evidence download + print. Alternate-mode evidence: assignment `links` arrays ride on written items verbatim (existing approved workflow; no new upload invented).

## Content/source review

No content touched. Submission honesty holds: every item is labelled Local only; the page header states nothing is submitted until the learner exports or hands it in; no teacher-reviewed/mastery/graded/host-confirmed string exists in code or render (EVID04 scans both paths).

## Not run / failed / blocked

- Real-browser print (pagination, page count, ink), desktop/narrow collection layout, keyboard through new controls, download→import across two real browsers: NOT RUN — need a browser/human (T23). Nearest first-hand evidence: exact renderer HTML asserted in-suite + print CSS rules pinned.
- npx tsx --test: same environmental EPERM; lead/CI verification needed.
- Nothing failed; nothing blocked.

## Next safe step

T21 (media + resilient local assets) is next and unblocked: audit every image/video/QR/link in AS30, repair into resilient local assets, keep full written pathways. The 4.1 "classroom resource" pointer and Moodle/NFB film pointers found in T16/T18 forensics are T21 inputs.
