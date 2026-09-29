# Ticket T25 completion record — FINAL REVIEW + HANDOFF PACKET (T10–T25)

Status: IMPLEMENTED (plan executed to the contract boundary; everything completable is complete and recorded; everything remaining is explicitly human-owned below)
Baseline commit/source hashes: dirty overlay continues from the T24 record; this ticket adds only meta/ab30-parity/T25-COMPLETION.md (this file). No production, test, or export changes in T25. No Biology/Chemistry/brand files touched.
Dirty-overlay/diff digest: cumulative overlay covers T01–T11 + T14/T16/T18-partial + T20–T24 (uncommitted by contract). No lesson, prompt, assignment, stored-work, or completion semantics changed except the contracted T10 exemplar (Lesson 7 v2, T11-gated) and the T22-era nav/grouping repairs. No new compulsory workload, auto-grades, or LMS claims anywhere.
Writer/approved scope: final review + handoff packet (queue allowedScope). No gate cleared in this ticket — the list below is recorded, not self-approved.

## Final review (verified 2026-09-23)

- Completion map: T10 IMPLEMENTED · T11 PACKET-READY/BLOCKED · T12/T13 BLOCKED (no record — no work performed, correct) · T14/T16/T18 PARTIAL (structure, wording blocked) · T15/T17/T19 BLOCKED (no record — correct) · T20/T21/T22/T23/T24 IMPLEMENTED · T25 this packet.
- Every IMPLEMENTED/PARTIAL ticket has a `Tn-COMPLETION.md` + `Tn-run.log` (or protocol) in meta/ab30-parity/. No ticket claims work its log does not show.
- Battery: 117/118 under plain node (shell file needs the TS loader); shell suite 8/11 via the loader shim with exactly the 3 triaged pre-existing failures; `course:doctor` PASS; Brightspace candidate staged (97 files, byte-identical to workspace) with zip integrity OK, entry point present, zero absolute paths.
- Standing constraints held: Bio/Chem/brand untouched (no such files in any ticket diff); no compulsory-workload/auto-grade/LMS claims added (verified per-record); no deploy/publish/upload performed (export stamp reverted); teacher/lead gates recorded with blank approval blocks, never filled by the executor.
- Known-anomaly disposition: the 2026-09-23 external nav rewrite was kept per owner decision, re-verified (route 8/8, assets 4/4, doctor PASS), and honestly asserted in ROUTE07. No other worktree anomalies found.

## Evidence index

- Ticket records + logs: meta/ab30-parity/T00–T24 (COMPLETION + run logs), T10-lesson7-rendered.html, T11-GATE-PACKET.md, T18-novel-decision.md, T22-manual-protocol.md, theme-2/3/4-crosswalk.json + *-workbook-forensics.md.
- Machine proofs: scripts/tests/aboriginal-studies-30-*.test.ts (12 suites), scripts/as30-asset-manifest.js, meta/ab30-parity/asset-manifest.json + media-ledger.json.
- Staged candidate (NOT approved): projects/aboriginal-studies-30/exports/brightspace/ + aboriginal-studies-30-brightspace.zip + export-report.md, meta/studio-export-evidence.json.
- Scratch-only (not deliverables): /tmp/t23_capacity.js, /tmp/ts-register.mjs, /tmp/ts-resolve-loader.mjs, /tmp/t24_project_snapshot.json.

## EXACT PENDING HUMAN DECISIONS (nothing else remains)

TEACHER:
1. T11 exemplar approval — complete the teacher checklist + approval block in T11-GATE-PACKET.md (Lesson 7 `v2-exemplar-t10`, hash-bound). UNBLOCKS: T12, T13, T15, T17, T19.
2. Official booklet fetch — Theme 2, Theme 3, Theme 4 booklets via the GDoc links in the theme-N-assignment records; export (txt/docx/pdf) and deliver to the worker. UNBLOCKS: T14/T16/T18 wording verification + T15/T17/T19.
3. Theme 2 per-item decisions (T14 record §Content/source review): booklet-vs-workbook adoption per item; 2.1 Ch.1 pp. 2–3 justification; 2.2 required-vs-suggested structure; 2.1/2.2 response modes.
4. Theme 3 per-item + media decisions (T16 record): booklet-vs-workbook adoption per item; Attawapiskat 2023+ recency + output modes; 3.1 prompt authority; Reel Injun legitimate access (or approved alternative) + version/timestamps; 3.4/3.5 booklet disposition.
5. Theme 4 per-item decisions (T18 record) + NOVEL 4.3 DECISION (T18-novel-decision.md — teacher only): effective version (legacy Inconvenient Indian vs Halfbreed) + 4.3 choice prompts + response mode + chapter structure + World Issues denominator exclusion; plus the T03 mode-wording discrepancy on the legacy prompt.
6. Media permissions before release: in-copyright textbook extracts (T10 note), images/library PDFs (`unverified` in media-ledger.json), film access (`unverified`/ASSET03). Confirm or replace — no permission is claimed.
7. T22 manual protocol human halves (T22-manual-protocol.md — widths 1440/768/390/320 + 200%/400% zoom, keyboard, screen reader, motion) + Bio-parity side-by-side screenshots for Lesson 7 (T11 packet §anatomy). No conformance claimed until done.

LEAD:
8. T11 lead checklist (T11-GATE-PACKET.md): formative-key approach, save-gating truthfulness, Q28–31 byte-identity, full battery + tsx in CI, browser pass (desktop/narrow, keyboard, save→navigate→reload→revise over HTTP), hash confirmation.
9. Shell-triage fixes (T23 ledger): (a) stale `Course Overview` casing assertion — test-only fix; (b) stale `Work+Sans` assertion — test-only fix, MUST NOT re-add the CDN font (contradicts contracted T21); (c) lesson-`body` content gap — route into T11-gated content tickets, not a test edit.
10. tsx/CI verification runs — this sandbox cannot start tsx (IPC listen EPERM); all tsx-surface runs here used a plain-node loader shim over the same code paths. CI must run the repo-convention `tsx` commands.
11. Export-template + trim decisions (T24 findings): reword the "external CDN resources" boilerplate (actual posture: content links only, zero render deps); decide trim-before-upload of the 52.4M Archive.zip backups + .DS_Store the exporter copies outside the T21 allowlist.
12. Release approval + LMS upload + in-LMS testing of the staged 193M candidate (host size caps vs ~131M allowlist / 200M staged). The `workspaceApprovedAt` stamp was deliberately reverted — nothing here is approved.

## Learner-work impact

None in T25 (packet only). Whole-plan impact restated: saved answers, keys, completion semantics, and denominators preserved; formative additions save-gated with zero compulsory work; novel legacy keys readable forever.

## Content/source review

No content touched in T25. Whole-plan posture: Lesson 7 v2 is candidate-only (T11-gated); Themes 2–4 wording is forensics-only (booklet-gated); novel Halfbreed is staged-not-activated (decision-gated); media permissions are ledgered-not-approved.

## Not run / failed / blocked

- All items above are human-owned and NOT RUN by definition. Nothing the contract allows the executor to do remains undone.
- Blocked tickets T12/T13/T15/T17/T19 + T14/T16/T18 wording wait ONLY on decisions 1–5 above.

## Next safe step

Human side: work decisions 1–12 in order (T11 approval + booklet fetch first — they unblock five tickets). Executor side: on delivery of any booklet/approval/decision, resume at the owning ticket (T12/T13/T14b/T15/T16b/T17/T18b/T19) per that ticket's "Next safe step". No further executor action is available until a human decision lands.
