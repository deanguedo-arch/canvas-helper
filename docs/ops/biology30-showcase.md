# Biology 30 teacher showcase

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
