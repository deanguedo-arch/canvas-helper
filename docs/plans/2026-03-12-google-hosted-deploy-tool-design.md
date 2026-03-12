# Google Hosted Deploy Tool Design

## Goal

Add a local deploy workflow for Google-hosted exports that stays independent from Studio UI behavior and supports one Firebase project per subject with one Hosting site per module slug.

## Why

- Studio should keep owning content export only.
- Firebase infrastructure setup should remain manual and explicit.
- Deployment should be repeatable from local project folders without editing a batch file for every new course or module.
- The workflow must scale from a few CALM modules to many future course slugs.

## Recommendation

Use a Node deploy script with a thin Windows batch launcher.

- The Node script owns all discovery, validation, selection, and Firebase CLI orchestration.
- The batch file only launches the script.
- Deploy metadata lives per slug in `projects/<slug>/meta/google-hosted.deploy.json`.
- The tool shows only modules that are both configured and actually deployable.

This keeps deploy logic decoupled from Studio and resilient to future Studio workflow changes.

## Rejected Alternatives

### Pure batch-file deploy logic

Rejected because Windows batch is brittle for JSON parsing, validation, and multi-select workflows.

### Studio-managed Firebase deploy flow

Rejected because it couples deploy behavior to Studio implementation details and increases the risk that Studio changes break deployment behavior.

### Central manifest only

Rejected because a single global manifest can drift from the actual per-slug project folders and creates extra maintenance burden when the deployable unit is already a local slug project.

## Config Model

Each deployable slug gets:

`projects/<slug>/meta/google-hosted.deploy.json`

Proposed shape:

```json
{
  "enabled": true,
  "firebaseProjectId": "subject-course-one",
  "hostingSiteId": "module-site-id"
}
```

## Readiness Rules

A slug appears in the deploy picker only when all of the following are true:

- `projects/<slug>/meta/google-hosted.deploy.json` exists
- `enabled` is `true`
- `projects/<slug>/exports/google-hosted/` exists
- `projects/<slug>/exports/google-hosted/firebase-config.json` exists
- `projects/<slug>/exports/google-hosted/.firebaserc` exists

This avoids accidental deploys for half-configured or stale folders.

## Deploy Behavior

The deploy script should:

1. Scan local slug projects for deploy configs.
2. Filter to deployable slugs using the readiness rules.
3. Present a terminal picker with one or many selections.
4. For each selected slug:
   - read `firebaseProjectId` and `hostingSiteId`
   - validate the export bundle and config files
   - validate the Firebase target exists
   - deploy that slug's `exports/google-hosted/` bundle to the configured Hosting site
   - print a pass/fail result

## Firebase Boundary

The deploy tool should not create Firebase projects or Hosting sites.

It should fail clearly if:

- the Firebase project does not exist
- the Hosting site does not exist
- the local bundle is not fully configured

This keeps infrastructure management explicit and low-risk.

## Multi-Site Hosting Model

The intended long-term shape is:

- one Firebase project per subject
- one Hosting site per module slug
- shared Firebase Auth and Firestore per subject
- slug-separated Firestore content paths already handled by existing Google-hosted exports

## UX

The easiest operator flow is:

- run a single batch file
- see only deployable slugs
- choose one or many by number
- let the script deploy each selected slug and print results

The batch file remains generic forever. Per-slug Firebase details live in each slug's meta folder.

## Files Expected For Implementation

- `projects/<slug>/meta/google-hosted.deploy.json`
- `scripts/deploy-google-hosted.ts`
- `deploy-google-hosted.bat`
- `scripts/lib/cli.ts` updates if multi-select parsing helpers are needed
- docs updates in `README.md` and possibly `ARCHITECTURE.md`

## Testing Strategy

Add targeted tests for:

- deploy-config discovery
- readiness filtering
- invalid config handling
- one-or-many selection parsing
- generated deploy targeting behavior if helper functions are extracted

## Success Criteria

- A teacher can run one local launcher and see only configured deployable slugs.
- The tool can deploy one or many module slugs in a single run.
- The tool does not depend on Studio UI logic.
- Adding a new deployable module requires editing only that slug's meta config, not the launcher.
