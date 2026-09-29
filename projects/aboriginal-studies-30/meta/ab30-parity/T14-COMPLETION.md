# Ticket T14 completion record

Status: PARTIAL — STRUCTURE RESTORED, WORDING BLOCKED (queue reviewGate needs no extra approval; the booklet hold below blocks only dependent wording/tasks per the master contract. T14's "from the official booklet" core cannot complete until a human delivers the booklet.)
Baseline commit/source hashes: dirty overlay continues from the T11 record; this ticket touches NO production code or learner data. Adds meta/ab30-parity/theme-2-crosswalk.json + theme-2-workbook-forensics.md, scripts/tests/fixtures/ab30-parity/theme2-workbook-prompts.txt, scripts/tests/aboriginal-studies-30-theme2.test.ts; edits one assignment-manifest hold reason (fetch path).
Dirty-overlay/diff digest: cumulative working-tree overlay covers T01–T11 + T14-partial (uncommitted by contract). No Biology/Chemistry/brand files touched. No lesson, prompt, or assignment record altered (XW03 pins 2.1/2.2 byte-identical).
Writer/approved scope: Theme 2 crosswalk/forensics/tests (queue allowedScope). No teacher/lead gate in this ticket; teacher decisions below are flagged, not taken.

## Changed files and actual changes

- meta/ab30-parity/theme-2-crosswalk.json (new): 32 required items (t2-q01–28, t2-cr-1/2, 2.1, 2.2), ALL disposition `blocked` with reason + owningTicket T14, lessonHome null (no inferred mapping), runtime reservations namespaced + unique, workbook analogues only where evidenced (Q2 six-values likely; 2.1 verbatim para 137; 2.2 adapted from workbook 2.3).
- meta/ab30-parity/theme-2-workbook-forensics.md (new): read-only D2L findings — used-student-copy contamination, section-local numbering, assignment version divergence, reading gates, explicit did-not-do list.
- scripts/tests/fixtures/ab30-parity/theme2-workbook-prompts.txt (new): 91 curated prompt-only paras (name/answers/excerpts excluded).
- scripts/tests/aboriginal-studies-30-theme2.test.ts (new): XW01 inventory/dispositions, XW02 analogue resolution + fixture hygiene, XW03 live-record pins + verbatim link, XW04 no-booklet-claims + reservation safety.
- assignment-manifest.json: theme-2-booklet hold reason gains the forensics summary + exact human fetch path.

## Evidence

- `node --test scripts/tests/aboriginal-studies-30-theme2.test.ts`: 4/4 pass. Log: meta/ab30-parity/T14-run.log.
- Matrix step: parity (MAP06 disposition contract + COMP05 denominator stability) + source (SRC01–08) + theme2 suites: 36/36 green, zero regressions.
- Forensics (first-hand): D2L ZIP listing proves NO Theme 2 booklet PDF exists in the export (only Theme 1's Oct 2021 booklet + Aug 2020 workbooks); workbook docx extracted read-only to /tmp (never committed); Google Doc export attempted and unreachable from the sandbox (curl exit 28, docs.google.com 000/timeout).
- Version proofs: 2.1 prompt == workbook para 137 verbatim (XW03); workbook 2.1/2.2 are DIFFERENT tasks (Manitoba Act / Metis views) — recorded, not adopted; current 2.2 elements == workbook-2.3 required elements demoted to may-include (suggestion/requirement distinction preserved for teacher confirmation).
- Caught and fixed during T14: (1) para-index off-by-one from grep line numbers (fixture curation asserted non-empty, failed loudly, corrected); (2) XW02 length check wrong for one-word labels → non-empty; (3) XW04 raw-string "retained" check hit the allowed-set array → per-item disposition assertion.

## Learner-work impact

None: zero production/runtime changes. Reservations (`theme-2-online-booklet::*`) are metadata only — XW04 proves no live activity or key exists under that namespace.

## Content/source review

No wording adopted from the workbook into the course. The six-values analogue (para 157) is marked `likely`, not verified. Teacher decisions queued (NOT taken): booklet-vs-workbook adoption per item; 2.1 Ch.1 pp.2-3 justification; 2.2 required-vs-suggested structure; 2.1/2.2 response modes. Lead/CI: tsx verification (environmental EPERM here).

## Not run / failed / blocked

- BLOCKED (human): fetch the official Theme 2 booklet — open the GDoc link in the theme-2-assignment record, export (txt/docx/pdf), deliver the file to the worker. Unblocks: T14 wording verification + T15 teaching upgrade (which also needs T11).
- BLOCKED (human): teacher per-item adoption + 2.1/2.2 decisions above.
- T14's "working forms" output cannot ship until booklet wording verifies; the crosswalk reserves every runtime key so wiring is mechanical once it does.
- npx tsx --test: same environmental EPERM; lead/CI verification needed.
- Nothing failed.

## Next safe step

T15 is queue-next but doubly blocked (needs T11 approval + the T14 booklet). Per the runbook, unrelated permitted work continues under separately selected tickets: T16 (Theme 3, same forensics-first approach) is next. If the human delivers the Theme 2 booklet mid-stream, T14 resumes as T14b (wording verification + live wiring + lesson homes) without disturbing other tickets.
