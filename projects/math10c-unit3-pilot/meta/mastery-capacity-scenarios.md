# Chapter 3 historical storage design probe, 2026-09-22

This earlier synthetic probe is superseded for admission by the authored eight-lesson path and current high-entropy stress fixture in `mastery-capacity-report.json`. Its 32-task ideal omits the third verification Lesson 3.2 actually needs. The current bounded state permits 41 work records and the measured authored path uses 41, including eight retained repairs. The table remains as a reproducible comparison of the earlier design, not as the current acceptance measurement.

These are synthetic sizing scenarios, not a complete learner-history acceptance test. Run `node scripts/tests/fixtures/math10c-mastery-capacity-probe.cjs` from the repo root to reproduce them. The probe uses the checked-in `State.encode` and SCORM state codec with an in-memory relaxation of the canonical 40-submission and 192-receipt validation limits for the larger rows. It does **not** change the canonical state schema. The fixture models eight fixed lesson records, eight lesson explanations, two notes, all eight completion IDs, 240 seen 3.6 variant indices, and composite task evidence for every one of the 32 targets; it does not include the 3.1 and 3.2 seen ledgers and drafts now measured separately in `mastery-capacity-report.json`. Each lesson has two constructed verifications, one transfer with reasoning, and one later-session retention task. The generated task prompts and working are high-entropy strings sized for storage measurement; they are not mathematical activities.

| Additional repair tasks | Work records | Receipts | Work characters in each of three fields | Application characters / 52,000 | SCORM envelope characters / 60,000 |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 32 | 160 | 40 | 26,654 | 18,669 |
| 8 | 40 | 192 | 40 | 30,516 | 21,237 |
| 0 | 32 | 160 | 160 | 38,174 | 35,673 |
| 8 | 40 | 192 | 160 | 44,916 | 42,501 |
| 12 | 44 | 208 | 160 | 48,280 | 45,901 |
| 16 | 48 | 224 | 160 | 51,664 | 49,325 |

This shows that the current **record-count limit**, rather than the byte envelope, blocks a modest repair history in this fixture. It does not justify simply raising both caps: longer problem/context fields, other learner records, selected errors, rechecks, and authentic question data may use the remaining space. At 56 work records with 24 repairs, the same 160-character-field fixture exceeds the self-imposed application limit even though its compressed SCORM envelope fits.

State 12 retains stage-supporting and selected work, all eight lesson drafts and seen ledgers, and a disclosed retirement count for older redundant, unselected submissions. Its retention rule preserves every displayed target stage and stage timestamp, unresolved gap signal, the two latest bounded errors per target and kind, and the newest submission. It retires only complete older work records together with their receipts. Current authentic-path and stress measurements are in `mastery-capacity-report.json`; the maximum-field stress case fails the 52,000-character preflight and also exceeds the SCORM 2004 envelope. If a candidate cannot fit either bound, admission fails without awarding evidence. Real learner history and Brightspace save/resume remain rollout checks.
