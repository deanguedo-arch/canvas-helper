STAX Sidecar rejected or held this task because proof is incomplete.

Do exactly one cleanup pass:
Approved proof surface for tests_passed: Run npm run test:apps-script through stax:collect in the target repo. Suggested command: npm run smoke:pipeline.

Address these proof gaps:
- .stax/codex-report.md is missing the current STAX acknowledgement from .stax/turn-contract.json.
- STAX acknowledgement is stale or does not match the current turn contract.
- STAX acknowledgement turnId does not match the current contract.
- STAX acknowledgement statusHash does not match the current contract.
- STAX acknowledgement nextPromptHash does not match the current contract.

Do not broaden scope. Do not claim tests passed without local command evidence. Update .stax/codex-report.md, then stop.
Risk to avoid: Protocol failure: Codex did not prove it followed the current STAX sidecar contract.
