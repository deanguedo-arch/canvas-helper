# Muse bounded work packet
Read the master contract first. This packet does not override repository safety or authorize publication. Work only on the specified ticket.


# R03 — Implement a complete first-submission and revision lifecycle

**Depends on:** R02. **Owner:** Muse implementation; existing lead integration.

## Read for this ticket
- `04_STATE_AND_CAPACITY_SPEC.md`
- `05_PRACTICE_AND_EVIDENCE_SPEC.md`
- `tests/fixtures/independent-responses.json`
- `contracts/DOM_TEST_CONTRACT.json`

## Production targets
- `learning-store.js`: draft/submit/revise/exposure operations.
- `lesson-components.js`: `renderIndependentTask` (baseline270) and supported controls.
- `main.js`: input/change/click handlers around2253, save announcements and All My Work.

## Execute in this order
1. Use versioned task identities on every new field; distinguish autosaved draft from immutable first submitted response. Do not use legacy origins as proof of a whole first attempt.
2. Add the visible Save first response control. It snapshots the complete current text once per command, commits, then immediately updates the comparison control without re-rendering the whole lesson or losing focus.
3. Keep criteria locked on storage failure; retain all unsaved text with a reachable retry/export path. Record exposure only when the criteria/model are actually opened, not merely unlocked.
4. Add Save revision with parentAttemptId. Keep both complete texts and accurate source/content version in All My Work/export. Double clicks and duplicate command retry must be idempotent.
5. Use autosave debounce and target-specific receipts. A local save never says submitted to teacher. Render untrusted/imported learner text using text nodes.

## Evidence required to pass
- Character-by-character whole first response and whole revision survive navigation, reload, export and fresh-context import.
- Successful explicit first-save unlocks criteria on the same page; failed save does not. No manual render call in browser tests.
- Supported/review exposure labels remain after reload; no automatic essay grade or mastery label.

## Return
Write the completion record from `templates/TICKET_COMPLETION.json` into the evidence directory. Record actual changed file paths/hashes, commands, test results, screenshots and unresolved issues. Include the next ticket. Do not substitute a tests-only repair, weaken acceptance assertions, fabricate a review signature, publish or change provider settings. Run the relevant prior regressions after shared changes.



## Handoff
Record actual changes, tests, source evidence, current hashes, limitations and next safe step. Do not mark a specified test PASS without running it. No nested agents, account changes or uncontrolled whole-course rewrite.