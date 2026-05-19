STAX Sidecar rejected or held this task because proof is incomplete.

Do exactly one cleanup pass:
Approved proof surface for tests_passed: Run npm run test:apps-script through stax:collect in the target repo. Suggested command: npm run smoke:pipeline.

Address these proof gaps:
- Command evidence classifier: stale_proof for node --test projects/course-showcase/meta/showcase-ui.test.mjs.
- Visual/style claim lacks STAX-collected rendered visual proof.
- Command evidence provenance is not verified for node --test projects/course-showcase/meta/showcase-ui.test.mjs: wrong_commit.
- Command evidence freshness failed for node --test projects/course-showcase/meta/showcase-ui.test.mjs: wrong_commit.
- Command evidence provenance is not verified for npm run test:apps-script: wrong_commit.

Do not broaden scope. Do not claim tests passed without local command evidence. Update .stax/codex-report.md, then stop.
Risk to avoid: Command evidence risk: wrong commit: expected 927c28ae8a35b38ca0b0dfcc074463cb3b6063bb, got d59bb3684ab4400b37d259e8a8611a8ddaa60056.
