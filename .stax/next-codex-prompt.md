STAX Sidecar rejected or held this task because proof is incomplete.

Do exactly one cleanup pass:
Candidate proof surface for visual_ready: Capture rendered visual proof and run npm run smoke:pipeline through stax:collect. Suggested command: npm run smoke:pipeline. This is candidate-only, so treat it as a provisional hint until approved.

Address these proof gaps:
- Command evidence classifier: stale_proof for npm run test:e2e:smoke.
- Claim-to-proof: implementation claim is unsupported because source_diff, behavior_test, command_evidence_after_diff.
- Claim-to-proof: behavior claim is unsupported because behavior_test, command_evidence_after_diff.
- Claim-to-proof: visual claim is unsupported because rendered_visual_proof.
- Command evidence provenance is not verified for npm run test:e2e:smoke: wrong_commit.

Do not broaden scope. Do not claim tests passed without local command evidence. Update .stax/codex-report.md, then stop.
Risk to avoid: Command evidence risk: wrong commit: expected c0ddb7df006a39dfeb270959b85d1025f3c4a737, got e987411e880065bfce264347ac2311ecf5023659.
