# Biology 30 teacher showcase

## Current shared review selector

The current `biology30pilot.web.app` review selector includes Biology Chapters 11–20, Chemistry Unit A, and Social 30-1 Related Issue 1 Option Two. Its canonical selector and receipt are under `projects/biology30-unit-a-pilot-2/meta/review-selector/` and `meta/review-selector-deployment.json`. Do not deploy the older A/B/C/D command below over this selector.

For a Biology-only refresh, verify the three Biology workspaces and the preserved Chemistry workspace, then run `npx tsx scripts/deploy-biology30-current-review.mjs --deploy`. This owner stages the receipt's current course paths, refuses to publish existing Biology/Chemistry files that differ from the verified receipt and checks preserved core science paths against live bytes, deploys only the existing Hosting site, and verifies every staged file against live SHA-256 before updating the receipt. Without `--deploy` it stages only. A changed Chemistry deployment requires separate authorization/workflow, not bypassing this guard. After deployment, check the actual browser selector routes and record them in the receipt. Canonical course content is never rebuilt by this deployment owner.

## Historical A/B/C/D showcase workflow

One review site: https://biology30pilot.web.app. It contains the13-lesson A Pilot2 and current B/C/D workspaces. The selector is outside each course; it is not part of future SCORM packages. This is public teacher review, not learner release or teacher acceptance.

## Update and redeploy

1. Edit the unit's canonical authoring source. For generated courses, use its owning rebuild workflow and current `meta/project.json` regenerateCommand. Do not edit the staged Firebase copy.
2. Run from this checkout:

```bash
npx tsx scripts/deploy-biology30-showcase.ts --deploy
```

The command verifies all four workspaces, copies their current index/assets into isolated temporary staging, deploys only the existing `biology30pilot` Hosting site in `calm-module-one`, and checks every course/selector file against its staged SHA-256. Firebase uploads changed files; unchanged units remain available. The URL and selector do not need rebuilding by hand. Failure exits nonzero; the deployment receipt is updated only after live byte checks pass.

Without `--deploy`, the same command prepares local review files and prints their temporary location. It does not publish. Firebase CLI comes from the existing local dependency and uses the operator's current login. If authentication expires, restore Firebase login and rerun; do not change projects or sites.

## Ownership and links

- `scripts/templates/biology30-showcase/` owns the small header, selector and navigation controller.
- `scripts/deploy-biology30-showcase.ts` owns staging, fixed-site deployment and file verification. Its fixed unit map uses A Pilot2, never17-lesson production A.
- `docs/ops/biology30-showcase-deployment.json` is the authoritative last verified deployment receipt; compare current source hashes to it to determine freshness.

Links use `/#a/lesson-02` or `/#c/c-topic-transcription`. Copy review link preserves the selected unit and route. Old `/#lesson-02` links open A. Each browser remembers its last unit and each unit's route. Existing unit save keys remain unchanged and independent; showcase navigation has its own key. Moving A into a subfolder preserves its local saved work because the Firebase origin and course storage key stay the same.

The wrapper exposes no LMS API, sends no student answers to a server and introduces no grading. Browser storage restrictions still follow the existing course behavior. Source/raw/meta folders and review archives are not copied into Hosting. There is no automatic watcher or scheduled deploy.

## Verification

```bash
npx tsx --test scripts/tests/biology30-showcase.test.ts
```

Covers legacy A links, all four units' response persistence, unit switching, reload, browser Back, fresh direct links, narrow layout and staging restrictions. Hosting integration does not certify external-video playback or a real Brightspace SCORM round-trip. Last local/live browser evidence: `projects/resources/biology30-production/v1/pilot2/verification/2026-09-08-showcase/`.

Social Issue 1 is hosted at `/social30-1-issue1/index.html`. The current deployment owner adds it to the shared selector and retains hash-verified live science files when their local workspaces differ from the deployed receipt. Those retained bytes are staged only; local science work is not overwritten. The Social project contract uses the `legacy-social` evidence scenario to check its real response fields, manual Evidence Bank entries, reload, duplicate prevention and removal independence; it does not require the shared Evidence Bank API.
