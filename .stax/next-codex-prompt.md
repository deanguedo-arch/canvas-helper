STAX Sidecar rejected or held this task because proof is incomplete.

Do exactly one cleanup pass:
Approved proof surface for tests_passed: Run npm run test:apps-script through stax:collect in the target repo. Suggested command: npm run smoke:pipeline.

Address these proof gaps:
- Command evidence classifier: non_execution_evidence for node --test projects/course-showcase/meta/showcase-ui.test.mjs.
- Claim-to-proof: implementation claim is unsupported because behavior_test, source_diff, command_evidence_after_diff.
- Visual/style claim lacks STAX-collected rendered visual proof.
- Command evidence provenance is not verified for node --test projects/course-showcase/meta/showcase-ui.test.mjs: wrong_worktree.
- Command evidence freshness failed for node --test projects/course-showcase/meta/showcase-ui.test.mjs: wrong_worktree.

Do not broaden scope. Do not claim tests passed without local command evidence. Update .stax/codex-report.md, then stop.
Risk to avoid: Command evidence risk: input is not executable command evidence.
