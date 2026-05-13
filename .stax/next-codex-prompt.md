STAX Sidecar rejected or held this task because proof is incomplete.

Do exactly one cleanup pass:
Approved proof surface for visual_ready: Capture rendered visual proof and run npm run smoke:pipeline through stax:collect. Suggested command: npm run smoke:pipeline.

Address these proof gaps:
- Claim-to-proof: behavior claim is unsupported because behavior_test, command_evidence_after_diff.
- Command evidence provenance is not verified for node -e const fs=require('fs'); const pkg=JSON.parse(fs.readFileSync('package.json','utf8')); console.log(process.cwd()); console.log(pkg.name);: wrong_worktree.
- Command evidence freshness failed for node -e const fs=require('fs'); const pkg=JSON.parse(fs.readFileSync('package.json','utf8')); console.log(process.cwd()); console.log(pkg.name);: wrong_worktree.
- Command evidence provenance is not verified for git status --short --branch: wrong_worktree.
- Command evidence freshness failed for git status --short --branch: wrong_worktree.

Do not broaden scope. Do not claim tests passed without local command evidence. Update .stax/codex-report.md, then stop.
Risk to avoid: Command evidence risk: human-pasted output is not local STAX command evidence.
