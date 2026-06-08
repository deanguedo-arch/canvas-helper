STAX Sidecar rejected or held this task because proof is incomplete.

Do exactly one cleanup pass:
Approved proof surface for course_deploy_ready: For course deploys, prove the source workspace changed, regenerate the export, collect the deploy command through STAX, verify the live target, and capture rendered visual proof. Capture or register the visual artifact from the STAX checkout/tooling repo with either npm run stax:collect-visual -- --repo C:\Users\dean.guedo\Documents\GitHub\canvas-helper --url <local-preview-url> --description "<page/state verified>" --checklist "<target page/state>" --checklist "<responsive/viewport checked>" --checklist "<visible outcome>" or npm run stax:collect-visual -- --repo C:\Users\dean.guedo\Documents\GitHub\canvas-helper --path <screenshot.png> --description "<page/state verified>" --checklist "<target page/state>" --checklist "<responsive/viewport checked>" --checklist "<visible outcome>", then rerun stax:gate.

Address these proof gaps:
- Command evidence classifier: stale_proof for node C:\Users\DEAN~1.GUE\AppData\Local\Temp\stax-ai-course-live-verify.js.
- Claim-to-proof: implementation claim is unsupported because behavior_test, source_diff, command_evidence_after_diff.
- Claim-to-proof: visual claim is unsupported because rendered_visual_proof.
- Command evidence provenance is not verified for node C:\Users\DEAN~1.GUE\AppData\Local\Temp\stax-ai-course-live-verify.js: wrong_commit.
- Command evidence freshness failed for node C:\Users\DEAN~1.GUE\AppData\Local\Temp\stax-ai-course-live-verify.js: wrong_commit.

Do not broaden scope. Do not claim tests passed without local command evidence. Update .stax/codex-report.md, then stop.
Risk to avoid: Command evidence risk: wrong commit: expected 430279692b7c9926f262170ba87a5698a06e45b4, got a2b910320f2cd6ceae89db5551233628b2ff090f.
