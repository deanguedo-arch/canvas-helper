## Goal

Reconcile the ChatGPT edited AB30 candidate (described in the supplied delivery message) with the canonical course, producing one complete review candidate that keeps every v2 contract intact — then finish the remaining v2 queue (R27–R32) on the reconciled base.

## Success Criteria

- The candidate's useful changes (visual system, teaching, practice, assigned-work surfaces) are selectively integrated; nothing canonical is overwritten wholesale.
- All 50 lessons satisfy the v2 teaching contract; every adopted teaching word is quote-verified or explicitly marked first-pass.
- Assigned records stay byte-identical; no new marks, workload, or grading-policy change.
- Battery, freeze, and doctor gates hold at every integration step; final state is `LOCAL_CANDIDATE_COMPLETE` at best (no publish, no fabricated approvals).
- An honest handoff records what was taken, what was rejected, and what remains lead-owned.

## Context And Current Facts

- The local zip (`AB30_BIO_PARITY_EXECUTION_v2 (1).zip`) is the v2 **planning package** (specs, runbook, contracts, baseline), not the edited candidate. The candidate itself (`AB30_ChatGPT_Edited_Candidate.zip`) is **not present** on this machine; only its delivery message is available. Execution Phase 0 is blocked until the candidate is supplied.
- The candidate states its own base: "the last actual AB30 workspace you supplied for audit" — i.e. the stale 2026-09-23 audit shell (2 scripts, CDN fonts). Canonical has moved far past that: 45/50 v2 lessons, 7-script shell, frozen components, 360-item bank, source-locator links. Integration is therefore a **forward-port**, not a merge.
- Canonical v2 state (verified this session): R27 in flight with L46/L47 extracts verified but lessons unauthored; battery 352/353 (one pre-existing lead-owned shell failure); `LESSON-FREEZE` green; `course:doctor` PASS (`legacy-snapshot-v1`).
- Governing authorities: v2 runbook R00–R32 with gates G0–G6 (`02_ORDERED_RUNBOOK.md`, `09_ACCEPTANCE_AND_PROOF.md`); repo `AGENTS.md` generated-course/injection workflow (import → normalize → integrate; canonical ownership; no wholesale replacement).
- Standing constraints from the active goal: Bio/Chem untouched, no new marks/workload, no publish, no fabricated approvals, lead owns persistence/host integration.

## Constraints And Non-goals

- Do not pause or re-do verified v2 work (R00–R26 lessons, bank items, pins) to accommodate the candidate.
- Do not modify R09-frozen files (`main.js`, `lesson-components.js`, `practice-engine.js`, `styles.css`) or the Biology donor for candidate reasons; visual adoption goes through the same freeze-safe pattern as `source-locator-links.js`, or goes to the lead.
- Do not adopt candidate lesson prose without QUOTES verification against the staged textbook bands; unverified prose stays labeled `imported first-pass source`.
- Do not touch the canonical store, save-capacity path, or exporters based on candidate claims; persistence/host stays lead-owned.
- Non-goals: Brightspace/SCORM certification, teacher/community approval, newer-local-work recovery beyond the candidate diff, and any publish/deploy step.

## Key Decisions

1. **Finish R27–R28 canonical first; reconcile after.** In-flight lessons have verified extracts and are mechanical to complete. Pausing them for an unseen candidate wastes proven work, and the candidate cannot replace quote-verified lessons anyway. Read-only intake/diff of the candidate runs in parallel the moment it is supplied.
2. **Adopt by claim class, defaulting to canonical.** Visuals: diff candidate CSS against V-02/V-03 and adopt only what beats canonical without override stacking. Teaching: mine for L46–L50 gaps and demonstrated weaknesses only; every adopted sentence verified. Practice/saved-work: ideas only, never code — canonical store wins. Assigned work: byte-pinned records win; candidate surfaces must reconcile to them.
3. **Candidate prose is first-pass until proven.** Per the v2 contract and repo intake rules, external teaching enters as `imported first-pass source` and graduates only through the batch evidence pattern (band fixture, QUOTES, SOURCES, review record).
4. **One integration record, not ticket edits.** Reconciliation evidence lives in a standalone `meta/ab30-v2/candidate-reconciliation.md` plus per-lesson notes; existing R00–R26 completion records are history and are not rewritten.

## Recommended Approach

Five phases. Phases 0–1 are read-only and start as soon as the candidate is supplied; Phase 2 waits for R28; Phases 3–4 ride the existing R29–R32 gates.

- **Phase 0 — Intake (blocked on supply).** Copy the candidate zip to `projects/incoming/` untouched, fingerprint it (sha256), extract to a scratch dir outside the repo, and inventory: file list, shell version, lesson/route count, asset manifest. Confirm or correct its stated audit-zip base by diffing against the 09-23 baseline.
- **Phase 1 — Diff and classify (read-only).** Three diffs: (a) shell/components vs canonical (`index.html`, CSS, JS architecture); (b) lesson teaching vs canonical v2 (per-lesson: identical/better/worse/unverifiable); (c) assigned-work surfaces vs byte-pinned records. Output: a take/reject/hold table with one-line evidence per row. No production edits.
- **Phase 2 — Selective adoption (after R28).** In take order: visual tokens/components (freeze-safe only) → assigned-work surface fixes that reconcile to pins → teaching fills for genuine gaps (verified first) → practice wording (never store/export code). Each adoption is a small diff with its own test or review note; anything touching frozen files or persistence becomes a lead handoff item instead.
- **Phase 3 — Unified verification.** Re-run the accumulated gates on the union: full battery, freeze, doctor, plus the v2 R30 acceptance scope for touched surfaces (same-text visual check, lesson openings at desktop/mobile, practice-to-feedback trace, first-submission/revision survival). New failures are fixed in canonical; candidate code is never patched in place.
- **Phase 4 — Handoff.** Update the reconciliation record, refresh the audit snapshot zip, and close out R29–R32 per the runbook. Final status capped at `LOCAL_CANDIDATE_COMPLETE / HOST_NOT_VERIFIED` unless the lead verifies host paths.

## Work Plan

1. **Supply + intake candidate** (owner: user supplies; agent fingerprints/inventories). Depends on: user file. Touches: `projects/incoming/`, scratch only.
2. **Finish R27 (L46+L47) canonical** (agent). Depends on: none (extracts verified). Touches: `course-data.js`, `practice-data.js`, batch27 suite, manifests, reviews, R27 records.
3. **Finish R28 (L48–L50) canonical** (agent). Depends on: (2). Same surfaces as (2) for the last three lessons.
4. **Diff + take/reject/hold table** (agent, read-only). Depends on: (1). Output: reconciliation record draft; no production edits.
5. **Adopt takes in class order** (agent). Depends on: (3), (4). Visuals → assigned-work → teaching gaps → practice wording; frozen/persistence items diverted to a lead handoff list.
6. **Unified verification + refreshed audit zip** (agent). Depends on: (5). Battery, freeze, doctor, R30-scope checks, new snapshot zip.
7. **R29–R32 close-out** (agent + lead). Depends on: (6). Bank reconciliation, acceptance, export verify, honest handoff per runbook.

## Validation Plan

- Phase 0: `unzip -l` manifest + `sha256sum` recorded; base confirmed by diffing candidate shell against the 09-23 audit zip (expect near-identity).
- Phase 1: take/reject/hold table reviewed against V-02/V-03 (visuals), batch QUOTES method (teaching), and ASSIGNED pins (assigned work). No green-painted rows: each take cites its evidence.
- Phase 2: every adoption diff keeps `node --test scripts/tests/aboriginal-studies-30-*.test.ts` at 352/353-or-better (only the known shell failure), `LESSON-FREEZE` green, `course:doctor` PASS. Adopted teaching gets band verification + a review note before it counts.
- Phase 3: R30-scope manual + static checks on touched surfaces (lesson opening, worked→supported→independent trace, first-save gating, 390px render); any failure fixed in canonical, never in candidate code.
- Highest-risk validation: **adopted teaching verification** — candidate prose that fails QUOTES must be rejected or rewritten, and silent adoption is the failure mode to watch.

## Risks / Rollback

- **Candidate never supplied / differs from its description.** Plan degrades gracefully: Phases 2–4 become v2-only completion (R27–R32), which is already the active goal. No work is wasted.
- **Candidate built on stale shell.** Expected (stated base). Mitigation: forward-port posture; candidate shell/JS is reference-only and is never copied over canonical.
- **Visual adoption vs freeze.** Any take requiring frozen-file edits stops at the boundary and becomes a lead item with a freeze-safe alternative proposed.
- **Rollback:** each adoption is a small, independent diff; revert any single take without touching others. Canonical R00–R26 work is never at risk because it is never edited for reconciliation.

## Open Questions

1. **Candidate supply:** will you drop `AB30_ChatGPT_Edited_Candidate.zip` (or its path) on this machine so Phase 0 can run? Everything from Phase 1 on is drafted conditional on that file. No other open questions — all remaining decisions resolve from the runbook, repo rules, or the diff itself.
