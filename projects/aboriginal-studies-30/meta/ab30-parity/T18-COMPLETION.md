# Ticket T18 completion record

Status: PARTIAL — STRUCTURE RESTORED, WORDING + NOVEL BLOCKED (same posture as T14/T16 for the booklet; the novel half is additionally gated by the T18 review boundary: versioned teacher decision required, legacy preserved.)
Baseline commit/source hashes: dirty overlay continues from the T16 record; this ticket touches NO production code or learner data. Adds meta/ab30-parity/theme-4-crosswalk.json + theme-4-workbook-forensics.md + T18-novel-decision.md, scripts/tests/fixtures/ab30-parity/theme4-workbook-prompts.txt, scripts/tests/aboriginal-studies-30-theme4.test.ts; edits two assignment-manifest hold reasons (fetch paths).
Dirty-overlay/diff digest: cumulative overlay covers T01–T11 + T14/T16/T18-partial (uncommitted by contract). No Biology/Chemistry/brand files touched. No lesson, prompt, or assignment record altered (T4XW03 pins 4.2/4.3 byte-identical).
Writer/approved scope: Theme 4 crosswalk/forensics/novel packet/tests (queue allowedScope). No approval taken; novel decision is teacher-only by contract.

## Changed files and actual changes

- meta/ab30-parity/theme-4-crosswalk.json (new): 27 items (t4-q01–22, comparison-4-1 with 12 cat-entries + both columns, 4-2, novel-4-3, 2 unmapped workbook extras), ALL disposition `blocked`, lessonHome null, reservations namespaced + unique.
- meta/ab30-parity/theme-4-workbook-forensics.md (new): read-only D2L findings — contamination + form-ID noise, Q2-29 with duplicated Q4 (wb-q04a/b) and no Q1, 4.1 chart inventory, 4.2 viewing Qs, workbook-4.3≠novel, novel forensics, did-not-do list.
- meta/ab30-parity/T18-novel-decision.md (new): legacy-vs-candidate packet with verification facts, binding activation rule, teacher-only decision record (unfilled).
- scripts/tests/fixtures/ab30-parity/theme4-workbook-prompts.txt (new): 145 curated prompt-only paras.
- scripts/tests/aboriginal-studies-30-theme4.test.ts (new): T4XW01 inventory/dispositions, T4XW02 analogue resolution + fixture hygiene + duplicated-Q4 pins, T4XW03 live-record pins + no-Halfbreed guard, T4XW04 no-booklet-claims + reservation safety, CHART41-auto (12 cats × 2 columns), NOVEL-GATE (legacy live, candidate absent).
- assignment-manifest.json: theme-4-booklet + novel-4-3-activation hold reasons gain forensics + fetch paths.

## Evidence

- `node --test scripts/tests/aboriginal-studies-30-theme4.test.ts`: 6/6 pass. Log: meta/ab30-parity/T18-run.log.
- Matrix step: parity (MAP06 + COMP02) + source (SRC02) + state (STATE12) + theme4 suites: 56/56 green, zero regressions. SRC02 + STATE12 specifically re-prove legacy-novel isolation on the current tree.
- Forensics (first-hand): D2L ZIP holds no Theme 4 booklet PDF; workbook docx extracted read-only to /tmp; Google Doc unreachable from sandbox (same network block); Halfbreed PDF verified 222pp with Intro+24 chapters by heading extraction.
- Version proofs: workbook 4.1 chart = 12 categories × 2 columns exactly (CHART41); workbook 4.2 = 6 viewing Qs vs current opinion paragraph (different tasks); workbook 4.3 = pipelines research vs current novel response (different tasks); duplicated workbook Q4 tracked as wb-q04a/b (T4XW02).
- No fixes needed during T18 (suite green first run).

## Learner-work impact

None: zero production/runtime changes. Reservations (`theme-4-online-booklet::*`) are metadata only. Legacy 4.3 keys and work untouched; no candidate keys exist.

## Content/source review

No wording adopted. Teacher decisions queued (NOT taken): booklet-vs-workbook adoption per item; 4.1 booklet categories/columns/marks (watch the runbook's Q4 mismatch note when the booklet arrives); 4.2 task authority + film version; the NOVEL decision (effective version, 4.3 prompts, mode, chapter structure, denominator exclusion); 4.3-pipelines/4.4 booklet disposition; novel-PDF mode-wording discrepancy (T03 log). Lead/CI: tsx verification (environmental EPERM here).

## Not run / failed / blocked

- BLOCKED (human): fetch the official Theme 4 booklet — GDoc link in the theme-4-assignment record, export, deliver to worker. Unblocks: T18 wording verification + T19 (which also needs T11).
- BLOCKED (human): teacher novel decision via T18-novel-decision.md + per-item adoption decisions above.
- T18's "working forms" + "source-approved novel pathway" cannot ship until the booklet + decision arrive; keys reserved so wiring is mechanical.
- npx tsx --test: same environmental EPERM; lead/CI verification needed.
- Nothing failed.

## Next safe step

T19 is queue-next but doubly blocked (needs T11 + the T18 booklet). Next unblocked: T20 (All My Work + evidence export — builds on the approved T05 store, no booklet dependency).
