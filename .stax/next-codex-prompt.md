STAX Sidecar rejected or held this task because proof is incomplete.

Do exactly one cleanup pass:
Approved proof surface for tests_passed: Run npm run test:apps-script through stax:collect in the target repo. Suggested command: npm run smoke:pipeline.

Address these proof gaps:
- Codex report contract is malformed because missing sections: Files changed, Commands run, What is verified, What is unverified, Risks.
- Claim-to-proof: test claim is unsupported because test_diff, command_evidence_after_diff.
- Claim-to-proof: behavior claim is unsupported because behavior_test, command_evidence_after_diff.
- Claim-to-proof: dependency claim is unsupported because dependency_inspection, dependency_build_proof.
- Claim-to-proof: migration claim is unsupported because migration_diff, migration_apply_proof, migration_rollback_proof.

Do not broaden scope. Do not claim tests passed without local command evidence. Update .stax/codex-report.md, then stop.
Risk to avoid: Malformed Codex report risk: fake-complete language can outrun the proof stack when files, commands, and residual unknowns are omitted.
