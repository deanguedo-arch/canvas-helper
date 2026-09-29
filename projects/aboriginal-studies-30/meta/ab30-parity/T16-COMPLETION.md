# Ticket T16 completion record

Status: PARTIAL — STRUCTURE RESTORED, WORDING BLOCKED (same posture as T14: the booklet hold blocks only dependent wording/tasks. The film/report specifics additionally need access + teacher decisions.)
Baseline commit/source hashes: dirty overlay continues from the T14 record; this ticket touches NO production code or learner data. Adds meta/ab30-parity/theme-3-crosswalk.json + theme-3-workbook-forensics.md, scripts/tests/fixtures/ab30-parity/theme3-workbook-prompts.txt, scripts/tests/aboriginal-studies-30-theme3.test.ts; edits one assignment-manifest hold reason (fetch path).
Dirty-overlay/diff digest: cumulative overlay covers T01–T11 + T14-partial + T16-partial (uncommitted by contract). No Biology/Chemistry/brand files touched. No lesson, prompt, or assignment record altered (T3XW03 pins 3.1/report byte-identical).
Writer/approved scope: Theme 3 crosswalk/forensics/tests + ASSET03-auto (queue allowedScope). No teacher/lead gate in this ticket; decisions below are flagged, not taken.

## Changed files and actual changes

- meta/ab30-parity/theme-3-crosswalk.json (new): 35 items (t3-q01–30, reel-injun-sequence with 16 ri-entries, 3.1, attawapiskat-report, 2 unmapped workbook extras), ALL disposition `blocked`, lessonHome null, reservations namespaced + unique, filmAccess status unverified.
- meta/ab30-parity/theme-3-workbook-forensics.md (new): read-only D2L findings — contamination, unnumbered runs, Reel Injun inventory (chs 1,3,4,5,6,8; 2+7 omitted; no timestamps), workbook-3.2 numbering collision, version map, explicit did-not-do list.
- scripts/tests/fixtures/ab30-parity/theme3-workbook-prompts.txt (new): 176 curated prompt-only paras.
- scripts/tests/aboriginal-studies-30-theme3.test.ts (new): T3XW01 inventory/dispositions, T3XW02 analogue resolution + fixture hygiene, T3XW03 live-record pins + recency guard, T3XW04 no-booklet-claims + reservation safety, ASSET03-auto(T16) film-access honesty.
- assignment-manifest.json: theme-3-booklet hold reason gains forensics summary + exact human fetch path.

## Evidence

- `node --test scripts/tests/aboriginal-studies-30-theme3.test.ts`: 5/5 pass. Log: meta/ab30-parity/T16-run.log.
- Matrix step: parity (MAP06 + COMP05) + source (SRC01–08) + theme3 suites: 37/37 green, zero regressions.
- Forensics (first-hand): D2L ZIP holds no Theme 3 booklet PDF; workbook docx extracted read-only to /tmp; Google Doc unreachable from sandbox (same network block as T14).
- Version proofs: nine-category task (para 58) is the likely Q8 analogue (marked likely, not verified); current 3.1 has NO workbook analogue (different task); Attawapiskat recency stays 2015+ in the live record with an explicit no-2023-claim guard (T3XW03); duplicates watched for, none in workbook.
- No fixes needed during T16 (suite green first run; T14's lessons applied).

## Learner-work impact

None: zero production/runtime changes. Reservations (`theme-3-online-booklet::*`) are metadata only.

## Content/source review

No wording adopted. Teacher decisions queued (NOT taken): booklet-vs-workbook adoption per item; Attawapiskat 2023+ recency + output modes; 3.1 prompt authority; Reel Injun legitimate access or approved alternative + version/timestamps; 3.4/3.5 booklet disposition. Lead/CI: tsx verification (environmental EPERM here).

## Not run / failed / blocked

- BLOCKED (human): fetch the official Theme 3 booklet — GDoc link in the theme-3-assignment record, export, deliver to worker. Unblocks: T16 wording verification + T17 (which also needs T11).
- BLOCKED (human): teacher per-item + film/report decisions above.
- T16's "working forms" cannot ship until booklet wording verifies; keys reserved so wiring is mechanical.
- npx tsx --test: same environmental EPERM; lead/CI verification needed.
- Nothing failed.

## Next safe step

T17 is queue-next but doubly blocked (needs T11 + the T16 booklet). Next unblocked: T18 (Theme 4 + novel versions — same forensics-first approach; the novel activation carries its own teacher gate).
