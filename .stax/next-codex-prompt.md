STAX Sidecar rejected or held this task because proof is incomplete.

Do exactly one cleanup pass:
Approved proof surface for tests_passed: Run npm run test:apps-script through stax:collect in the target repo. Suggested command: npm run smoke:pipeline.

Address these proof gaps:
- Command evidence classifier: stale_proof for npm run test:apps-script.
- Claim-to-proof: release_deploy claim is unsupported because target_environment_proof, rollback_plan, build_proof.
- Visual/style claim lacks STAX-collected rendered visual proof.
- Command evidence provenance is not verified for npm run test:apps-script: wrong_commit.
- Command evidence freshness failed for npm run test:apps-script: wrong_commit.

Do not broaden scope. Do not claim tests passed without local command evidence. Update .stax/codex-report.md, then stop.
Risk to avoid: Command evidence risk: wrong commit: expected e977f72de6d1a046e295bfc04c1e2062b84ef975, got c8b4b54bf8691f582c83f8403d5f21f9be960330.
