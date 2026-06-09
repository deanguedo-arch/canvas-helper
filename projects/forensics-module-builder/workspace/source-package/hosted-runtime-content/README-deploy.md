# Google Hosted Deployment

- Project title: forensicstudiesoption2-nextstep-test
- Project slug: forensicstudiesoption2-nextstep-test
- Export target: `google-hosted`
- Tracked localStorage keys: forensicstudiesoption2-nextstep-test.progress, forensicstudiesoption2-nextstep-test.ui, forensics::module1assignment::v1, forensics::module2assignment::v1, forensics::module3assignment::v1, forensics::module4assignment::v1, forensics::module5assignment::v1, forensics::module6assignment::v1, forensics::module7assignment::v1, forensics::module8assignment::v1
- Auth mode: `google`

## What This Bundle Does

- Hosts the project workspace as a normal web app on Firebase Hosting.
- Prompts the learner to `Sign in with Google`.
- Saves the tracked browser state to Firestore at `projects/{slug}/users/{uid}`.
- Saves a normalized `progressSummary` beside the raw state for progress reporting.
- Restores saved progress on later launches from another browser or device.

## One-Time Firebase Setup

1. Create or choose a Firebase project for this class delivery target.
2. Enable Google Authentication in Firebase Authentication.
3. Enable Firestore in Native mode.
4. Add the hosted domain to Firebase Authentication authorized domains if your school uses a custom domain.
5. Install the Firebase CLI and log in with an account that can deploy the project.

## Required Bundle Edits Before Deploy

1. Create `firebase-config.json` beside this file using `firebase-config.template.json` as the starting point.
2. Replace every placeholder value with the web app config from Firebase project settings.
3. If you want to restrict sign-in to school domains, fill `allowedEmailDomains` in the config JSON.
4. Update `.firebaserc.template` with the actual Firebase project id and rename it to `.firebaserc` if you want CLI project aliases.

## Deploy Commands

```bash
firebase use <project-id>
firebase deploy --only hosting
```

If you also manage Firestore rules from the CLI:

```bash
firebase deploy --only firestore:rules
```

## Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectSlug}/users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Progress Report Export

After learners have saved progress, export a CSV from a local machine with access to a Firebase service account:

```bash
npm run report:progress -- --firebase-project <firebase-project-id> --course forensicstudiesoption2-nextstep-test --out progress.csv --service-account path/to/service-account.json
```

## Manual Verification

1. Open the hosted URL in browser A and sign in with a learner Google account.
2. Answer enough content to change one of the tracked storage keys.
3. Wait for the `Autosave ready` status.
4. Open the same hosted URL in browser B or another device with the same Google account.
5. Confirm the previous state restores automatically and the printable report still works.
