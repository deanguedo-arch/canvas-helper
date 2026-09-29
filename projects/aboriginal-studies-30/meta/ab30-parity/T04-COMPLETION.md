# Ticket T04 completion record

Status: IMPLEMENTED — STOPPED AT LEAD GATE (persistence design needs approval before T05)
Baseline commit/source hashes: branch codex/math-engine-preflight @ 02a9fadc. Production untouched by this ticket (no workspace writes; scope was proposal + tests only).
Dirty-overlay/diff digest: ticket added store-design.md, field-registry.json, T04-run.log, state test + fixtures. git diff --check clean on all touched paths.
Writer/approved scope: pure store/migration proposal and tests; no production activation. Review boundary: LEAD APPROVAL REQUIRED for the migration/store/host design before T05 — this record is the approval package.

## Changed files and actual changes

- meta/ab30-parity/store-design.md (new): the proposal — host ownership map, v1 envelope schema (inside the SAME 3 key names), pure API, migration algorithm, concurrency rules, novel isolation, measured capacity outlook with lead options (a)–(d), rollback, and explicit non-decisions.
- meta/ab30-parity/field-registry.json (new): frozen legacy registry — 89 prompts / 102 booklet keys / 8 aliases / key patterns / unknown-key policy.
- scripts/tests/fixtures/ab30-parity/state-v1-fixtures.json (new): F01–F21 synthetic fixtures (F22 noted out-of-scope for store work).
- scripts/tests/aboriginal-studies-30-state.test.ts (new): Part 1 = pure reference implementation (storeMigrateFlatToV1, storeReadDraft, storeWriteDraft, storeResolveConflict, storeBeginRun, storeSubmitAttempt, storeResetRun, storeCheckVersion, storeExportSet, storeImportSet + storeValidateEnvelopeShape, storeMeasurePayload, storeCommitWithChecks, storeDeriveSaveStatus, storeResolveViewKey, storeFlattenForRollback, storeEmptyEnvelope); Part 2 = 14 STATE tests.
- No production files, manifests-of-record, or configs modified.

## Evidence

- `node --test scripts/tests/aboriginal-studies-30-state.test.ts`: 14/14 pass. Log: meta/ab30-parity/T04-run.log.
- STATE01/02-pure/03/04/05/06-pure/08/09/10-pure/11/12/13/14-pure/15 green at the pure level. Caught and fixed during T04: (1) import validation too shallow (non-object records slipped through — added storeValidateEnvelopeShape); (2) test-side modeling of tab interleaving, byte-vs-char assertions, duplicate identifier.
- Host ownership verified in repo code: SCORM legacy bridge collects exact tracked keys into suspend_data (60,000 chars 2004 / 3,500 1.2; over-budget save SKIPPED with explicit error, never truncated); restores overwrite local keys wholesale; cross-tab events only flush (last-writer-wins, no merge). Google-hosted bridge (disabled for AB30): exact-key Firestore mirror, whole-value overwrite both ways. Brightspace export: static, no save bridge.
- CAPACITY FINDING (STATE15, first-hand): typical-complete v1 envelope = 81,245 chars (OVER 60K); heavy = 275,981 (4.6× OVER); same learner text in CURRENT flat format = 31,159 (fits). The envelope costs ~2.6× (origins duplication for rollback fidelity). Integrity up, headroom down — the lead must pick options (a)–(d) in store-design.md §7 before T05. SCORM 1.2 declared unsupported for save/restore.
- `npx tsc --noEmit`: 51 errors repo-wide, ZERO in touched files.
- `npx tsx --test`: same environmental EPERM; lead/CI verification needed.
- STATE07 (real reload), STATE10-browser (real contention), STATE14-Studio (live identity), STATE06-host (real LMS failure): NOT RUN — impossible without production integration (T05) + browser (T23/T24). No mocks presented as those proofs.

## Learner-work impact

None — proposal only. Design preserves: all IDs/keys byte-exact, unknown/corrupt inputs, whitespace significance, no invented timestamps, novel isolation (Halfbreed = separate record, legacy never remaps), attempts append-only, rollback reconstructible (origins + raw verbatim; v1-only metadata explicitly reported as dropped on rollback).

## Content/source review

No content touched. novel-4-3-activation and outcomes-mapping holds carried forward from T03. No teacher/lead approvals claimed — lead approval of THIS design is the pending gate.

## Not run / failed / blocked

- tsx suite run: environmental EPERM; lead/CI must run (expect state 14/14).
- Browser/host proofs: NOT RUN (no browser; no production wiring yet) — see STATE list above.
- BLOCKED ON LEAD: persistence design approval + capacity options decision (a)–(d). T05 must not start without them.

## Next safe step

LEAD: review `meta/ab30-parity/store-design.md` + `T04-run.log`; approve/reject/amend the envelope/API/migration/host-boundary design; decide capacity options (a)–(d). Then authorize T05 (approved adapter integration) or redirect. Writer stopped: YES — at the contractual lead gate. No further queue tickets until approval.

## Lead approval (2026-09-23)

Design: APPROVED for T05 production integration. Capacity: option (a)+(b) — explicit over-budget UX + export path now (T05/T20); origin pruning after stability is declared (not in T05). T05 authorized.
