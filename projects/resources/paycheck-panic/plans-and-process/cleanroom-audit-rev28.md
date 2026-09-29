# Clean-room re-audit of Paycheck Panic expansion Rev 28

**Date:** 2026-09-29 (independent re-audit from raw files; ChatGPT Round 28 verdict not read)
**Auditor:** Muse (clean-room subagent)
**Sources:** `product-records-v7.24.json` (recordVersion "7.24", marketModel "7.24.0", 98 transactions, 73 ledger accounts, 26 lifecycle edges), `EXPANSION-BRIEF.md`, `paycheck_panic_rev28_calculations.zip`, `rev28-integrity.py`, `rev28-calcs.py`, `cleanroom-audit-rev27.md` (as the repair target only)

## Verdict: CLEAN — 0 P0 / 0 P1 / 0 P2

Rev 28 closes the Rev 27 P1 exactly as specified — in the records, not in prose — and the closure is structural: removing the new guard makes the integrity suite fail. No new findings. Every regression target re-verified independently from the raw files.

## Method

Independent Python against the raw JSON and brief; no reliance on narrative claims, acceptance maps, or the integrity script's verdicts until each was checked structurally:

1. **Invoke-boundary audit:** enumerated all 18 `invokes` entries registry-wide (matching the corrected count); for each entry whose child transaction posts `credit personalCash`/`credit businessCash`, classified it as invoke-`when`-gated, child-self-guarded, min-capped, or mode-bound — verifying the executable variable definitions character-for-character.
2. **Independent mutation test:** copied the records to `/tmp/mut28`, deleted `"when"` from the `txn.phonePlanSwitch` invoke entry, and ran the unmodified `rev28-integrity.py` against the mutant: 4 failures (was 0). The suite is load-bearing on the new guard.
3. **Integrity vacuity audit:** read the new r28 sweep class (`_r28_invoke_needs_guard`, `_r28_invoke_when_ok`, `_r28_leg_reachable_via`, `_r28_mode_flags`, `_r28_executable_flag`) line by line; confirmed the sweep asserts exactly one invoke needs a guard, that it is the phone switch, and that the guard is the parent's executable `affordable` flag — not a prose mention.
4. **Hostile execution:** evaluated `affordable = 1 while personalCash >= required, else 0` at personalCash=$50, required=$340 → 0 → invoke blocked → personalCash stays $50.
5. **Regression sweep:** 33 affordable flags, the invariant (records + prose), both Rev 26 repairs, all 9 Rev 25 repairs, 26 lifecycle edges, 14 automatic cash legs, 99 calc rows re-run from source, 5 gambling EVs recomputed from outcome strings, one mortgage figure recomputed, prose↔records sampling, label drift, hash sidecars.

## P1 repair verification — affordability guard now crosses the invoke boundary

**Field path:** `transactions.registry["txn.phonePlanSwitch"].invokes[0]` →
`{"id": "txn.phoneTerminationSettlement", "mode": "switch", "when": "affordable == 1"}`

The Rev 27 clean-room P1 was that this invoke entry carried no `when`, so an unaffordable switch fired the child's cash leg (`when: isSwitch == 1 and switchCash > 0`) and drove personalCash to −$250. Rev 28 adds `"when": "affordable == 1"` — the parent's executable flag (`1 while personalCash >= required, else 0`), using the records' own per-invoke gating convention.

**Hostile trace (executable, verified field by field):** personalCash=$50, switch required=$340 → `affordable`=0 → the invoke entry's `when` fails → child never fires → personalCash stays $50. The −$250 path is gone.

**Registry-wide invoke audit (independent classification of all 11 entries reaching cash-moving children):**
- `txn.phonePlanSwitch → txn.phoneTerminationSettlement` (mode=switch): invoke-`when`-gated ✅ (the repair)
- `txn.phonePlanCancel → txn.phoneTerminationSettlement` (mode=cancel): invoke has no `when`, but the child's cash leg requires `isSwitch == 1`, and `isSwitch` is defined as `1 while mode == 'cancel'`→0 form with mode bound by the parent's invoke entry (`"mode": "cancel"`). The cash leg provably cannot fire in cancel mode; cancel posts only to `phoneObligation` debt. ✅ mode-bound
- 5 parents → `txn.overheadPayableSettlement`: child amount `payNow = min(businessCash, payable)` — executable min-cap. ✅
- 3 parents → `txn.propertyDispositionCore`: child leg `when: coverChosen == 1 and coverEligible == 1`; `coverEligible = 1 while personalCash >= deficiency, else 0` — executable guard. ✅
- `txn.propertyUpgradeSettlement → txn.housePurchaseSettlement`: child self-guards with its own `affordable = 1 while personalCash >= down, else 0`. ✅
- The 7 invoke entries whose children move no cash were excluded (verified no cash-credit legs).

No ungated invoke reaches a cash-moving child. The cancel path was additionally traced: `txn.phonePlanCancel` has no postings of its own, and the child's `isCancel`/`isSwitch` pair derives exclusively from the parent-bound `mode` field — there is no free variable a hostile state could flip.

**Why the new integrity class is structural, not mention-passing:** `_r28_invoke_needs_guard` computes reachability from executable definitions (mode-flag parsing of `1 while mode == 'x', else 0`, min-cap detection, child self-guard detection) — if any of those definitions were prose, the parse fails and the sweep fails closed. `_r28_invoke_when_ok` requires the invoke `when` to name a parent's flag whose definition starts `1 while`, contains `>=`, names the cash account, and ends `else 0`. The sweep asserts exactly one invoke needs the guard and that it is the phone switch. The embedded mutation test strips the guard and requires failure — and my independent end-to-end mutation (mutant records + unmodified script) produced 4 failures. The fifth pinning check the Rev 27 report required (`_psw_inv.get("when") == "affordable == 1"` joined with the executable `affordable` definition) is present and would have failed on v7.23.

## Confirmed clean (independent verification)

- **P1 repair target:** see above. Live brief prose states the rule: "affordability guards must cross invoke boundaries — a child transaction reached via an invoke entry is gated by the invoker's `when` condition; no ungated invoke may reach a cash-moving child."
- **33 affordable flags:** all 33 transactions with an `affordable` variable define it as the executable `1 while <cash> >= <cost>, else 0` pattern (0 non-matching).
- **Invariant:** `invariants.affordability` ("player-choice affordability invariant") exists as a first-class record entry and in live brief prose ("Player-choice affordability invariant", §589).
- **Rev 27 headline repair retained:** hostile $50/$700 medical case still blocked (affordable=0 → no legs post).
- **Deep-sweep fixes retained:** `txn.obligationPayment` affordable-guarded; `txn.taxArrearsCollection.collected = min(personalCash, arrearsBalance)`.
- **Rev 26 repair 1:** restart-advance amount is `max($200, outstanding overhead payable + $50 restart reserve)`; stale `min(requested, 200, cashOnHand)` absent from the records.
- **Rev 26 repair 2:** zero unguarded legs in `txn.sessionSettlement` and `txn.bigJobSettlement` — every posting and state change carries `settleOnce == 1`.
- **All 9 Rev 25 repairs:** sessionAbort + `session.abort` edge; mortgage settlement carries contractId; `coverEligible` guard; obligationPayment key union (claimId/policyId/periodId/contractId); arrears lifecycle edges; `txn.phoneLateFee`'s sole invoker is `txn.phoneSuspendService`; no `advanceId` identifier field (the two text occurrences are in the Rev 25 acceptance-map history prose describing the repair); authority recordVersion "7.24" / marketModel "7.24.0".
- **26 lifecycle edges:** all resolvers registered, all carry predecessor/successor/instanceKeys, and every resolver's stateChanges textually carry both predecessor and successor states (mechanical mutation + key carriage).
- **14 automatic cash-credit legs:** every one min-capped or executable-guarded; 0 uncovered.
- **Arithmetic:** regenerated `paycheck_panic_rev28_calculations.zip` from source — 99 figure rows in results.json + 90 CSV detail rows, 0 MISMATCH anywhere (independently counted, not trusting the script summary). Mortgage worked example independently recomputed: $496.53 matches. ZIP bundles `rev28-calcs.py` with `REV = 28`; README reads "Rev 28 calculations (recordVersion 7.24)".
- **Gambling:** all 5 EVs recomputed from the records' outcome strings — slots −0.89713, roulette −0.27027, lottery −1.00, lucky-7 −1.00, prize-wheel −0.80 — all negative, all match.
- **Integrity:** canonical run of `rev28-integrity.py`: 3,429 checks, 0 failures.
- **Prose↔records:** invoke-boundary rule, affordability invariant, restart formula, settleOnce, Rev 28 1-row map (P1) — all present in live prose with field paths matching the records. Rev 27 (1-row), Rev 26 (2-row), Rev 25 (9-row) maps retained as history with re-verification notes.
- **Label drift:** no stale operative labels. The single non-history `v7.23`/`rev27` regex hit is the legitimate `rev27-integrity.py` script-name reference inside the Rev 27 history map. The Rev 26 history paragraph's authority-pointer wart (claims v7.23 where v7.22 is meant) is a pre-existing, documented, non-operative history wart, left untouched per the preserve-history requirement.
- **Hashes:** all seven SHA-256 sidecars match the files they name (records, brief, ZIP, and the four scripts). Records SHA-256 `63fd4da4eea82961f1e5ce078402c15dcae98b7b430636bfeee82f544c00559f` matches the provenance inside the calcs package.
- **Shipped baseline:** `paycheck-panic-arcade.html` untouched (no expansion game code written — design/package only).

## Bottom line

**CLEAN: 0 P0 / 0 P1 / 0 P2.** Rev 28's one repair is executed in the records with an executable guard on the invoke entry, verified by an independent mutation test that makes the whole suite fail when the guard is removed, and confirmed by a registry-wide invoke audit that leaves no ungated cash path. All regressions pass. The design package is ready for Phase 1 coding (pending ChatGPT Round 28's independent verdict, which this audit did not read).
