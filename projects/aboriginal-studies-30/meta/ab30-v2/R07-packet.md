# Muse bounded work packet
Read the master contract first. This packet does not override repository safety or authorize publication. Work only on the specified ticket.

# R07 — Reconcile source identities, official tasks and versioned novel profiles

**Depends on:** R06. **Owner:** Muse implementation; existing lead integration.

## Read for this ticket
- `07_SOURCES_ASSIGNMENTS_AND_WORKLOAD.md`
- `sources/SOURCE_MANIFEST.json`
- `contracts/EXPECTED_ITEM_HOMES.json`
- `contracts/SPECIAL_FIELD_SHAPES.json`
- `sources/page_previews/textbook-p27-attribution.png`

## Production targets
- `course-data.js`: task/profile records, assignments/resources, source labels, explicit questionIds.
- Source registry and exact prompt/field mapping for Themes2–4.
- Store alias/profile migration (lead-reviewed when needed).

## Execute in this order
1. Verify official booklet content, using parsed page text plus rendered tables where necessary. Implement source-level expected items and subfields from the mapping contract. Do not reconstruct missing prompt wording from a student/key.
2. Keep existing Theme1 mappings and canonical assignments. Ensure every source task has one primary home; cross-links reuse a record, not a second compulsory answer.
3. Activate Halfbreed ONLY as versioned new-candidate task profile. Preserve live/legacy Inconvenient Indian answers/prompts, conflicts and exports without conversion. Do not stamp a new approval date.
4. Correct the narrator/speaker boundary inLesson 7, internal authoring language, Q79source mismatch and documented historical errors via an editorial ledger. Date historical claims; verify current claims against primary sources before learner release.
5. Separate source-count completeness from mark math; keep current policy/weights, do not silently fix source inconsistencies. No automatically scored emotional disclosure, cultural identity or political agreement.

## Evidence required to pass
- 281source-level homes cover167numbered questions plus listed vocab/film/chart/memoir/critical tasks, with exact prompt/field source locators.
- Legacy and new novel profiles round-trip independently; no old response falsely attached to a new question.
- All current updates explicitly sourced/date-bounded; unresolved source/rights issues named and excluded from rollout, not filled with invention.

## Return
Write the completion record from `templates/TICKET_COMPLETION.json` into the evidence directory. Record actual changed file paths/hashes, commands, test results, screenshots and unresolved issues. Include the next ticket. Do not substitute a tests-only repair, weaken acceptance assertions, fabricate a review signature, publish or change provider settings. Run the relevant prior regressions after shared changes.
