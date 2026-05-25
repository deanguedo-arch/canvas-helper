STAX Sidecar rejected or held this task because proof is incomplete.

Do exactly one cleanup pass:
Approved proof surface for tests_passed: Run npm run test:apps-script through stax:collect in the target repo. Suggested command: npm run smoke:pipeline.

Address these proof gaps:
- Command evidence classifier: non_execution_evidence for node node_modules/tsx/dist/cli.mjs --test scripts/tests/aboriginal-studies-30-shell.test.ts.
- Claim-to-proof: implementation claim is unsupported because behavior_test, source_diff, command_evidence_after_diff.
- Claim-to-proof: performance claim is unsupported because performance_benchmark, performance_baseline.
- Command evidence provenance is not verified for node node_modules/tsx/dist/cli.mjs --test scripts/tests/aboriginal-studies-30-shell.test.ts: wrong_worktree.
- Command evidence freshness failed for node node_modules/tsx/dist/cli.mjs --test scripts/tests/aboriginal-studies-30-shell.test.ts: wrong_worktree.

Do not broaden scope. Do not claim tests passed without local command evidence. Update .stax/codex-report.md, then stop.
Risk to avoid: Command evidence risk: input is not executable command evidence.
