STAX Sidecar rejected or held this task because proof is incomplete.

Do exactly one cleanup pass:
Approved proof surface for build_ready: Run npm run assessment-map through stax:collect in the target repo.

Address these proof gaps:
- Command evidence classifier: non_execution_evidence for git status --short --branch.
- .stax/codex-report.md is missing the current STAX acknowledgement from .stax/turn-contract.json.
- STAX acknowledgement is stale or does not match the current turn contract.
- STAX acknowledgement turnId does not match the current contract.
- STAX acknowledgement statusHash does not match the current contract.

Do not broaden scope. Do not claim tests passed without local command evidence. Update .stax/codex-report.md, then stop.
Risk to avoid: Command evidence risk: input is not executable command evidence.
