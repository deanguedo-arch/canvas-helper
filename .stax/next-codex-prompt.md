STAX Sidecar rejected or held this task because proof is incomplete.

Do exactly one cleanup pass:
Approved proof surface for course_deploy_ready: For course deploys, prove the source workspace changed, regenerate the export, collect the deploy command through STAX, verify the live target, and capture rendered visual proof. Capture or register the visual artifact from the STAX checkout/tooling repo with either npm run stax:collect-visual -- --repo /Users/deanguedo/Documents/GitHub/canvas-helper --url <local-preview-url> --description "<page/state verified>" --checklist "<target page/state>" --checklist "<responsive/viewport checked>" --checklist "<visible outcome>" or npm run stax:collect-visual -- --repo /Users/deanguedo/Documents/GitHub/canvas-helper --path <screenshot.png> --description "<page/state verified>" --checklist "<target page/state>" --checklist "<responsive/viewport checked>" --checklist "<visible outcome>", then rerun stax:gate.

Address these proof gaps:
- Claim-to-proof: implementation claim is unsupported because source_diff.
- Claim-to-proof: data claim is unsupported because data_validation, dry_run_artifact.
- .stax/codex-report.md is missing the current STAX acknowledgement from .stax/turn-contract.json.
- STAX acknowledgement is stale or does not match the current turn contract.
- STAX acknowledgement turnId does not match the current contract.

Do not broaden scope. Do not claim tests passed without local command evidence. Update .stax/codex-report.md, then stop.
Risk to avoid: Unsupported hard claim: implementation requires source_diff, behavior_test, command_evidence_after_diff.
