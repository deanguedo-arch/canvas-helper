# Firebase Progress Reporting

## Purpose

Firebase-hosted course exports can report the percentage of required student-facing web-app work that each learner has completed.

The report does not track work outside the web app. Worksheets, LMS-only submissions, optional resources, teacher-only content, and reference-only pages are excluded.

## Progress Rule

```txt
percentComplete = completedRequiredWebAppItems / totalRequiredWebAppItems
```

Required web-app items are exported from course shell data when available. The hosted bridge then reads the course's existing saved state and normalizes it into one reporting shape.

## Firestore Write Path

Each signed-in learner saves to:

```txt
projects/{courseSlug}/users/{studentId}
```

Each document includes the raw saved state plus:

```json
{
  "progressSummary": {
    "percentComplete": 65,
    "completedCount": 26,
    "requiredCount": 40,
    "completedItemIds": ["module-1-lesson-1"],
    "lastActivityId": "module-3-lesson-2",
    "updatedAt": "2026-04-13T20:30:00.000Z"
  }
}
```

## Identity

The progress system is provider-neutral. Firebase Authentication supplies the stable student id. The provider can be Google, Microsoft, email/password, or another Firebase-supported provider.

Domain restriction is optional. If a hosted bundle has `allowedEmailDomains` in `firebase-config.json`, the bridge blocks other email domains at sign-in time. Firestore rules should still enforce data access.

## CSV Export

Use a Firebase service account that can read Firestore.

```bash
npm run report:progress -- --firebase-project <firebase-project-id> --course <course-slug> --out progress.csv --service-account path/to/service-account.json
```

Multiple courses:

```bash
npm run report:progress -- --firebase-project <firebase-project-id> --courses course-a,course-b --out progress.csv --service-account path/to/service-account.json
```

All deployable Google-hosted courses in the repo:

```bash
npm run report:all -- --firebase-project <firebase-project-id> --service-account path/to/service-account.json
```

Windows launcher:

```txt
report-all-progress.bat
```

The launcher writes:

```txt
reports/latest-progress.csv
reports/progress-YYYY-MM-DD-HHMM.csv
```

The `report:all` command auto-discovers every project that is currently deployable through the Google-hosted Firebase flow. That means:

- deploy metadata exists and is enabled
- `firebase-config.json` exists
- `.firebaserc` exists
- the export bundle includes the current progress-reporting bridge

You can also set:

```txt
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
FIREBASE_PROJECT_ID=<firebase-project-id>
```

## Report Columns

```csv
studentName,studentEmail,studentId,courseSlug,percentComplete,completedCount,requiredCount,lastActivityId,lastActive
```

## Firestore Rules Baseline

Students should only read/write their own progress:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectSlug}/users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

For teacher/admin reporting, use a server-side export with a service account or add custom-claim rules for staff users.
