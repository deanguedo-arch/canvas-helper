STAX Sidecar rejected or held this task because proof is incomplete.

Do exactly one cleanup pass:
Approved proof surface for course_deploy_ready: For course deploys, prove the source workspace changed, regenerate the export, collect the deploy command through STAX, verify the live target, and capture rendered visual proof. Capture or register the visual artifact from the STAX checkout/tooling repo with either npm run stax:collect-visual -- --repo C:\Users\dean.guedo\Documents\GitHub\canvas-helper --url <local-preview-url> --description "<page/state verified>" --checklist "<target page/state>" --checklist "<responsive/viewport checked>" --checklist "<visible outcome>" or npm run stax:collect-visual -- --repo C:\Users\dean.guedo\Documents\GitHub\canvas-helper --path <screenshot.png> --description "<page/state verified>" --checklist "<target page/state>" --checklist "<responsive/viewport checked>" --checklist "<visible outcome>", then rerun stax:gate.

Address these proof gaps:
- Claim-to-proof: behavior claim is unsupported because behavior_test, command_evidence_after_diff.
- Claim-to-proof: release_deploy claim is unsupported because build_proof, command_evidence_after_diff, target_environment_proof.
- Visual/style claim lacks STAX-collected rendered visual proof.
- Command evidence provenance is not verified for npm run test:apps-script: wrong_worktree.
- Command evidence freshness failed for npm run test:apps-script: wrong_worktree.

Do not broaden scope. Do not claim tests passed without local command evidence. Update .stax/codex-report.md, then stop.
Risk to avoid: Command evidence risk: human-pasted output is not local STAX command evidence.
