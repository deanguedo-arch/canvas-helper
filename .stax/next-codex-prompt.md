STAX Sidecar rejected or held this task because proof is incomplete.

Do exactly one cleanup pass:
Approved proof surface for tests_passed: Run npm run test:apps-script through stax:collect in the target repo. Suggested command: npm run smoke:pipeline.

Address these proof gaps:
- Claim-to-proof: implementation claim is unsupported because behavior_test, source_diff, command_evidence_after_diff.
- Claim-to-proof: behavior claim is unsupported because behavior_test, command_evidence_after_diff.
- Claim-to-proof: release_deploy claim is unsupported because build_proof, command_evidence_after_diff, target_environment_proof.
- Command evidence provenance is not verified for npm run test:apps-script: wrong_worktree.
- Command evidence freshness failed for npm run test:apps-script: wrong_worktree.

Do not broaden scope. Do not claim tests passed without local command evidence. Update .stax/codex-report.md, then stop.
Risk to avoid: Command evidence risk: human-pasted output is not local STAX command evidence.
