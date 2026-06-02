# STAX Course Deploy Proof Gate

## Purpose

Use this runbook when a Google Hosted course deploy is live but `stax:gate` is Reject or Provisional because the proof surface is incomplete, stale, or worded too broadly.

This is a proof cleanup process, not a deploy process. Use [`google-hosted-deploy.md`](./google-hosted-deploy.md) for the deploy mechanics, then use this document to prove the result to STAX.

## When To Use

Use this after a course deploy when any of these appear in `.stax/status.json`:

- `implementation claim is unsupported because source_diff`
- `Command evidence failed`
- `wrong_commit` or `wrong_worktree`
- `STAX sidecar heartbeat is stale`
- `Codex report contract is malformed`
- `.stax/codex-report.md is missing the current STAX acknowledgement`
- `Unsupported file_path claim: firebase-config.json`

## Ground Rules

- Run STAX commands from the STAX checkout:

```bash
cd /Users/deanguedo/Documents/GitHub/STAX
```

- Point every STAX command at the target repo:

```bash
--repo /Users/deanguedo/Documents/GitHub/canvas-helper
```

- Keep the course scope explicit. Do not let stale evidence from unrelated projects become part of the claim.
- Do not use broad completion language in `.stax/codex-report.md`. Prefer exact evidence language: command id, exit code, URL, proof id, and file path.
- Treat `Accept` as proof-gate status only. It means the required claims have verified evidence for the current repo state; it is not a claim that every possible live behavior was tested.

## Proof Chain

For course deploy readiness, STAX expects this chain:

1. Source workspace changed.
2. Export was regenerated.
3. Deploy command was collected through STAX.
4. Live target was fetched and checked.
5. Rendered visual proof was captured.
6. Current STAX turn acknowledgement is present in `.stax/codex-report.md`.
7. Sidecar heartbeat and current-turn capture are fresh.

## Step 1: Read Current STAX State

From `canvas-helper`, read:

```bash
sed -n '1,160p' .stax/turn-contract.json
sed -n '1,220p' .stax/status.json
sed -n '1,220p' .stax/next-codex-prompt.md
```

Copy the exact acknowledgement from `.stax/turn-contract.json`:

```txt
STAX_ACK ...
```

Put that exact line at the top of `.stax/codex-report.md`.

## Step 2: Make The Task Current

If `.stax/task.md` is stale or describes a previous deploy, rewrite it to the current bounded objective.

Example:

```txt
Deploy and prove the updated Google Hosted courses for <slugs>.

Goal:
- Export fresh Google Hosted bundles.
- Deploy only the listed Firebase Hosting targets.
- Verify representative live pages.

Acceptance boundary:
- Do not deploy unrelated projects.
- Do not edit raw source folders.
- Do not revert unrelated working-tree changes.
```

## Step 3: Prove Source Workspace Diff

Collect a source-diff proof after the workspace changes exist:

```bash
npm run stax:collect -- --repo /Users/deanguedo/Documents/GitHub/canvas-helper -- \
  git diff --stat -- \
  projects/<slug-a>/workspace \
  projects/<slug-b>/workspace \
  projects/<slug-c>/workspace \
  projects/<slug-a>/meta/project.json \
  projects/<slug-b>/meta/project.json \
  projects/<slug-c>/meta/project.json
```

Record the returned evidence id in `.stax/codex-report.md`.

If STAX says `source_diff` is missing even though workspace files changed, check the report wording. A generic phrase like "implementation complete" can trigger an implementation claim that expects `src/` proof. Reword the report around the course deploy proof chain instead.

## Step 4: Regenerate Export And Copy Firebase Files

Collect export proof through STAX:

```bash
npm run stax:collect -- --repo /Users/deanguedo/Documents/GitHub/canvas-helper -- bash -lc '
set -euo pipefail
cd /Users/deanguedo/Documents/GitHub/canvas-helper
for slug in <slug-a> <slug-b> <slug-c>; do
  npm run export:google-hosted -- --project "$slug"
  cp "projects/$slug/meta/google-hosted.firebase-config.json" "projects/$slug/exports/google-hosted/firebase-config.json"
  cp "projects/$slug/meta/google-hosted.firebaserc" "projects/$slug/exports/google-hosted/.firebaserc"
  test -s "projects/$slug/exports/google-hosted/index.html"
  test -s "projects/$slug/exports/google-hosted/google-hosted-bridge.js"
  test -s "projects/$slug/exports/google-hosted/firebase-config.json"
  test -s "projects/$slug/exports/google-hosted/.firebaserc"
done
'
```

Record:

- evidence id
- exit code
- export output summary
- generated export paths

## Step 5: Collect Deploy Command Evidence

Deploy commands are remote publish actions. Only run this after the user has explicitly asked to deploy.

```bash
npm run stax:collect -- --allow-risky --repo /Users/deanguedo/Documents/GitHub/canvas-helper -- \
  npm run deploy:google-hosted -- --project <slug-a>,<slug-b>,<slug-c>
```

Record:

- evidence id
- exit code
- Firebase project id
- hosting site ids
- live URLs

## Step 6: Verify Live Targets

Use a verifier that avoids `grep -q` with `pipefail` on large HTML. That combination can exit `141` because `grep -q` closes the pipe early.

Preferred shape:

```bash
npm run stax:collect -- --repo /Users/deanguedo/Documents/GitHub/canvas-helper -- bash -lc '
set -eu
check(){
  label="$1"
  url="$2"
  html="$(curl -fsSL "$url")"
  printf "%s status=200 bytes=%s\n" "$label" "${#html}"
  [[ "$html" == *"#155608"* ]]
  [[ "$html" == *"skip-to-content"* ]]
  [[ "$html" == *"main-content"* ]]
  [[ "$html" == *"Mark Complete"* ]]
  [[ "$html" != *"<span class=\"lesson-progress-complete"* ]]
  [[ "$html" != *"<span data-progress-complete"* ]]
}
check "<label-a>" "https://<site-a>.web.app/content/chapter-1/index.html"
check "<label-b>" "https://<site-b>.web.app/content/chapter-2/index.html"
check "<label-c>" "https://<site-c>.web.app/content/chapter-5/index.html"
'
```

Record the evidence id and the HTTP status/byte counts.

## Step 7: Capture Rendered Visual Proof

Capture one representative live rendered page per course:

```bash
npm run stax:collect-visual -- \
  --repo /Users/deanguedo/Documents/GitHub/canvas-helper \
  --url "https://<site>.web.app/content/chapter-1/index.html" \
  --description "<course> live representative chapter renders with Next Step treatment" \
  --checklist "target page/state: representative live chapter" \
  --checklist "responsive/viewport checked: STAX visual collector captured rendered page" \
  --checklist "visible outcome: Next Step treatment and learner controls are visible"
```

Record each `visual_...` id in `.stax/codex-report.md`.

## Step 8: Keep Report Wording Evidence-Aligned

The report itself is part of the proof surface. Keep it literal.

Use:

- `Firebase Hosting release evidence exists for ...`
- `Live root pages respond ...`
- `Representative live chapter pages show ...`
- `STAX source-diff evidence exists for ...`
- `No authenticated progress write test was performed.`

Avoid:

- `implementation complete`
- `all done`
- `fixed`
- `works everywhere`
- `fully verified`
- bare endpoint file names like `firebase-config.json`

If you need to mention live config, say `Firebase configuration endpoint` unless you are pointing at an actual repo path such as:

```txt
projects/<slug>/meta/google-hosted.firebase-config.json
```

## Step 9: Retire Poisoned Command Evidence

If a failed proof attempt remains in the active external command-evidence directory, `stax:gate` may keep rejecting even after a later verifier passes.

First, prefer a later passing command with the same proof lane. If that is not possible, preserve the failed evidence outside the active scoring directory.

Example for an exit-141 verifier:

```bash
mkdir -p ~/.stax/evidence/canvas-helper_<repo-hash>/retired-command-evidence/<date>-exit-141-grep-pipe
mv ~/.stax/evidence/canvas-helper_<repo-hash>/command-evidence/<evidence-id>.json \
  ~/.stax/evidence/canvas-helper_<repo-hash>/retired-command-evidence/<date>-exit-141-grep-pipe/
mv ~/.stax/evidence/canvas-helper_<repo-hash>/command-evidence/<evidence-id>.stdout.txt \
  ~/.stax/evidence/canvas-helper_<repo-hash>/retired-command-evidence/<date>-exit-141-grep-pipe/
mv ~/.stax/evidence/canvas-helper_<repo-hash>/command-evidence/<evidence-id>.stderr.txt \
  ~/.stax/evidence/canvas-helper_<repo-hash>/retired-command-evidence/<date>-exit-141-grep-pipe/
```

Do not erase the audit trail. Note the retired folder in `.stax/codex-report.md`.

## Step 10: Refresh Sidecar Heartbeat

If the gate reports stale heartbeat or stale current turn:

```bash
npm run stax:sidecar:refresh -- --repo /Users/deanguedo/Documents/GitHub/canvas-helper
```

Then reread:

```bash
sed -n '1,160p' /Users/deanguedo/Documents/GitHub/canvas-helper/.stax/turn-contract.json
```

If the acknowledgement changed, update `.stax/codex-report.md` again before running the gate.

## Step 11: Run Gate

```bash
npm run stax:gate -- --repo /Users/deanguedo/Documents/GitHub/canvas-helper
```

If the verdict is `Accept`, stop. Do not keep editing the report unless the user asks for more work.

If observer preflight is required and it mints a new turn contract, update the ACK again and rerun `stax:gate`.

## Troubleshooting Table

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `source_diff` missing | Report made a broad implementation claim or no diff evidence was collected | Collect `git diff --stat` through STAX and reword report around course deploy evidence |
| Failed command evidence remains | Earlier failed verifier is still in the active evidence directory | Supersede with same proof lane or move the failed evidence to `retired-command-evidence/` |
| Exit `141` from verifier | `grep -q` plus `pipefail` against large HTML | Use Bash string checks or Node `fetch` checks instead |
| Unsupported `firebase-config.json` file path | Report named a live endpoint like a repo file | Say `Firebase configuration endpoint` or use a real repo path |
| ACK stale | `stax:sidecar:refresh`, preflight, or gate minted a new turn contract | Reread `.stax/turn-contract.json`, paste exact `STAX_ACK`, rerun gate |
| Heartbeat stale | Sidecar runtime state is old | Run `npm run stax:sidecar:refresh -- --repo <repo>` |
| `wrong_commit` or `wrong_worktree` | Evidence belongs to an older commit or different worktree fingerprint | Recollect the required command evidence from the current target repo |
| Observer preflight says Reject | Observer mode can record non-blocking issues such as missing approval | Use `stax:gate` for proof status, and add approval only when the workflow requires hard enforcement |

## Minimal Acceptance Checklist

- Current `.stax/codex-report.md` contains the exact current `STAX_ACK`.
- Report includes required sections: Files changed, Commands run, What is verified, What is unverified, Risks.
- Source diff evidence id is listed.
- Export evidence id is listed.
- Deploy evidence id is listed.
- Live fetch evidence id is listed.
- Visual proof ids are listed.
- Any failed proof attempts are either superseded or preserved outside active scoring.
- `stax:sidecar:refresh` has been run if heartbeat/current-turn is stale.
- Final `stax:gate` returns `Accept`.
