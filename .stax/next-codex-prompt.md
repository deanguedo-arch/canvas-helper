STAX Sidecar rejected or held this task because proof is incomplete.

Do exactly one cleanup pass:
Approved proof surface for tests_passed: Run npm run test:apps-script through stax:collect in the target repo. Suggested command: npm run smoke:pipeline.

Address these proof gaps:
- Command evidence classifier: stale_proof for npm run test:apps-script.
- Visual/style claim lacks STAX-collected rendered visual proof.
- Command evidence provenance is not verified for npm run test:apps-script: wrong_commit.
- Command evidence freshness failed for npm run test:apps-script: wrong_commit.
- Command evidence provenance is not verified for npm run test:forensics35-workspace: wrong_commit.

Do not broaden scope. Do not claim tests passed without local command evidence. Update .stax/codex-report.md, then stop.
Risk to avoid: Command evidence risk: wrong commit: expected 049e8fa22b5c4ae1ab7de9331dbbd62c149e8d17, got c8b4b54bf8691f582c83f8403d5f21f9be960330.
