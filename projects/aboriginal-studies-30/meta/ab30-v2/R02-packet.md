# Muse bounded work packet
Read the master contract first. This packet does not override repository safety or authorize publication. Work only on the specified ticket.


# R02 — Give learner state one writer and migrate safely

**Depends on:** R01. **Owner:** Muse implementation; existing lead integration.

## Read for this ticket
- `04_STATE_AND_CAPACITY_SPEC.md`
- `contracts/STATE_CONTRACT.d.ts`
- `tests/fixtures/legacy-states.json`
- `baseline/CODE_FINGERPRINTS.json`

## Production targets
- `learning-store.js`: schema, load/migrate, coordinated commit, `practiceRunStore` and public practice operations.
- `main.js`: `saveJson` (baseline371), `setSection`, `setActiveLesson`, other UI saves.
- Production migration functions plus unit/integration fixtures; not a test-only store.

## Execute in this order
1. Implement the v2 ACTIVITY envelope in the state contract: durable runs/exposure/counter belong inside `.activityResponses`; `.ui` is navigation only. Keep the three tracked key names.
2. Implement pure migration from actual legacy/v1 shapes and a production coordinator. Preserve exact raw strings, alias origins, unknown values, conflict candidates and existing IDs. Commit/verify activity before derived UI/progress; make crash recovery and repeat migration idempotent.
3. Adapt the actual practice methods to v2. Replace every whole-state `main.js` UI write with the store navigation-patch operation; search all direct localStorage writes to tracked keys and eliminate competing owners.
4. Provide revision/digest checking and the existing lead-approved cross-tab serialization/recovery mechanism. A compare-then-set loop alone is not a lock. Preserve both concurrent candidates.
5. Route this bounded production persistence patch and test results to the existing lead. Do not claim lead acceptance from a worker-written status field. Continue independent source/visual tasks while review occurs.

## Evidence required to pass
- Actual navigation/reload preserves run ID, complete option ordering, source versions, attempts and exposure.
- Legacy conflict fixtures round-trip; interrupted writes and repeated migration retain originals without duplicate submissions.
- Only the store writes tracked keys; two-tab conflict tests preserve both texts and last confirmed save.

## Gate
G1 ownership/migration; lead acceptance required before production integration.

## Return
Write the completion record from `templates/TICKET_COMPLETION.json` into the evidence directory. Record actual changed file paths/hashes, commands, test results, screenshots and unresolved issues. Include the next ticket. Do not substitute a tests-only repair, weaken acceptance assertions, fabricate a review signature, publish or change provider settings. Run the relevant prior regressions after shared changes.



## Handoff
Record actual changes, tests, source evidence, current hashes, limitations and next safe step. Do not mark a specified test PASS without running it. No nested agents, account changes or uncontrolled whole-course rewrite.