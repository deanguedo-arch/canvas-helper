# Sports Wellness Google Hosted Firebase Design

## Goal

Deliver `sportswellness` through the repo's existing `Google Hosted` Firebase workflow so learners can sign in with Google, autosave progress, and resume on another computer without adding custom auth logic inside the course workspace.

## Chosen Approach

Use the shared Google Hosted export bridge that already exists in `scripts/lib/google-hosted.ts` and `scripts/lib/exports/google-hosted.ts`.

This approach keeps the implementation aligned with repo conventions:

- `sportswellness` remains a normal workspace-authored course.
- Firebase auth and Firestore sync stay in the shared bridge.
- Project-specific setup lives in metadata, generated export config, and a project publish batch file.

## Why This Approach

Two alternatives were considered and rejected:

1. Add custom Firebase code directly inside `projects/sportswellness/workspace/**`.
   This would duplicate the shared hosted bridge and make future changes harder to maintain.

2. Continue trying to use Apps Script for full delivery.
   The earlier test package proved Apps Script deploy mechanics work, but the full `sportswellness` package is too large for the direct push strategy already attempted.

The shared Google Hosted path already provides:

- Google sign-in
- Firestore persistence
- local-to-cloud autosave
- cross-device restore
- progress summary normalization for reporting

## Architecture

### 1. Shared Hosted Runtime

`export:google-hosted` injects `google-hosted-bridge.js` into the exported course shell. That bridge:

- loads Firebase config from `firebase-config.json`
- prompts the learner to sign in with Google
- watches tracked `localStorage` keys
- saves state to `projects/{slug}/users/{uid}` in Firestore
- restores prior state for the same Google account

`sportswellness` should reuse that path unchanged unless a project-specific gap appears.

### 2. Project-Specific Wiring

`sportswellness` needs four project-specific pieces:

- `projects/sportswellness/meta/project.json`
  - add `google-hosted` to export targets
  - declare `googleHosted.trackedStorageKeys` so the bridge tracks the course's actual persisted state
- `projects/sportswellness/meta/google-hosted.deploy.json`
  - declare the Firebase project id and Hosting site id used by the shared deploy command
- `projects/sportswellness/exports/google-hosted/firebase-config.json`
  - real Firebase web-app config copied in after export
  - `allowedEmailDomains: []` so any Google account works for now
- `publish-sportswellness.bat`
  - one-click local wrapper that runs export then deploy for this slug

### 3. Firebase Boundary

Firebase remains the remote system of record for synced learner progress.

Expected Firebase services:

- Firebase Hosting
- Firebase Authentication with Google provider enabled
- Firestore in Native mode

Expected Firestore document path:

- `projects/sportswellness/users/{uid}`

## Data Flow

1. User runs `publish-sportswellness.bat`.
2. `export:google-hosted` rebuilds the `sportswellness` hosted bundle.
3. The export contains `google-hosted-bridge.js`, `firebase.json`, and deploy docs/templates.
4. A real `firebase-config.json` and `.firebaserc` make the export deployable.
5. `deploy:google-hosted -- --project sportswellness` publishes the export to the configured Firebase Hosting site.
6. Learner opens the hosted course and signs in with Google.
7. Bridge tracks configured `localStorage` keys and autosaves to Firestore.
8. Learner opens the same hosted course elsewhere with the same Google account and the bridge restores the saved state.

## Error Handling

The design intentionally keeps error handling in the shared bridge:

- missing Firebase config -> bridge status error
- sign-in failure -> bridge status error
- Firestore rules/config failure -> autosave error status
- no prior remote state -> learner starts clean or keeps current local state according to existing bridge behavior

No new custom workspace UI will be added for auth errors unless the shared bridge proves insufficient.

## Testing Strategy

Use focused contract tests and export verification:

- extend Google Hosted export/deploy tests for the `sportswellness` wiring pattern
- verify `project.json` metadata and deploy config are valid
- run a real `sportswellness` `export:google-hosted`
- validate that the generated bundle contains the hosted bridge and preserved Firebase config

## Expected Outcome

After this work:

- `sportswellness` can be exported and deployed through the repo's Google Hosted path
- learners can sign in with any Google account
- progress autosaves and follows them across devices
- the user has a dedicated `publish-sportswellness.bat` just like the repo's other one-click publish scripts
