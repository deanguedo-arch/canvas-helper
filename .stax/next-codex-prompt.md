STAX Sidecar rejected or held this task because proof is incomplete.

Do exactly one cleanup pass:
Approved proof surface for course_deploy_ready: For course deploys, prove the source workspace changed, regenerate the export, collect the deploy command through STAX, verify the live target, and capture rendered visual proof. Capture or register the visual artifact from the STAX checkout/tooling repo with either npm run stax:collect-visual -- --repo /Users/deanguedo/Documents/GitHub/canvas-helper --url <local-preview-url> --description "<page/state verified>" --checklist "<target page/state>" --checklist "<responsive/viewport checked>" --checklist "<visible outcome>" or npm run stax:collect-visual -- --repo /Users/deanguedo/Documents/GitHub/canvas-helper --path <screenshot.png> --description "<page/state verified>" --checklist "<target page/state>" --checklist "<responsive/viewport checked>" --checklist "<visible outcome>", then rerun stax:gate.

Address these proof gaps:
- Codex report contract is malformed because missing sections: Files changed, Commands run, What is verified, What is unverified, Risks.
- Command evidence classifier: stale_proof for git diff --stat -- tasks/next-step-course-builder-lite-extension.gs scripts/tests/apps-script-tracker-source.test.ts tasks/next-step-teacher-tracker-readme.md tasks/README.md docs/ops/ACTIVE_HANDOFF.md .stax/codex-report.md.
- Claim-to-proof: release_deploy claim is unsupported because build_proof, command_evidence_after_diff, target_environment_proof.
- Command evidence provenance is not verified for git diff --stat -- tasks/next-step-course-builder-lite-extension.gs scripts/tests/apps-script-tracker-source.test.ts tasks/next-step-teacher-tracker-readme.md tasks/README.md docs/ops/ACTIVE_HANDOFF.md .stax/codex-report.md: wrong_commit.
- Command evidence freshness failed for git diff --stat -- tasks/next-step-course-builder-lite-extension.gs scripts/tests/apps-script-tracker-source.test.ts tasks/next-step-teacher-tracker-readme.md tasks/README.md docs/ops/ACTIVE_HANDOFF.md .stax/codex-report.md: wrong_commit.

Do not broaden scope. Do not claim tests passed without local command evidence. Update .stax/codex-report.md, then stop.
Risk to avoid: Malformed Codex report risk: fake-complete language can outrun the proof stack when files, commands, and residual unknowns are omitted.
