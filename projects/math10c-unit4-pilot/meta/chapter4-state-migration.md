# Chapter 4 state migration and compaction

- Storage namespace remains `math10c-unit4-pilot:review:v1` (SCORM-scoped by the established bridge).
- Current state is `chapter4-review-state-4`; policy is `c4-mastery-policy-3`; target contract is `c4-target-evidence-3`.
- State 1/2 tasks and drafts are retained. Their scores/completion claims are copied to `historicalResults` with the label “Earlier Chapter 4 results (historical; fresh demonstration required)”; they are not promoted to new evidence because component freshness/help cannot be reconstructed.
- State 3 drafts, task instances, first/final work and verifiable provenance are retained. Earlier stage claims remain labelled historical unless their stored receipts prove the current independence, variation and freshness rules. A prior transfer without its paired reasoning receipt cannot establish the current 75 stage.
- Existing task mathematics keeps its saved task instance. New evidence records carry task/contract version, mathematical fingerprint, presentation source, time, session, role and component results.
- First mathematical work, final correction, support sources, gap signals, target stages and exposure sources are protected.
- Compaction replaces only exact first/final duplicates with `sameAsFirst`, converts repeated component structures and attempt histories to reversible tuples, and shares repeated exposure fingerprints, exposure sources and provenance through dictionaries. Answers are not shortened, truncated or dropped.
- On load, compact evidence is expanded before policy calculations. Storage cannot create freshness or raise/lower a stage.
- If protected state exceeds 52,000 application characters, admission is refused and the visible draft remains in memory. The interface must not claim the evidence was saved.

Executable evidence: `scripts/tests/math10c-unit4-policy.test.cjs`, the full-path browser test, and `scripts/tests/math10c-unit4-scorm.test.ts`.
