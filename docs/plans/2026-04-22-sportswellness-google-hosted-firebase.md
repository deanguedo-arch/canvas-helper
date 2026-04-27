# Sports Wellness Google Hosted Firebase Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire `sportswellness` into the existing Google Hosted Firebase delivery path so learners can sign in with Google, autosave progress, and resume across computers, with a one-click publish batch file.

**Architecture:** Reuse the shared Google Hosted export bridge and deploy command. Add only the `sportswellness` metadata, Firebase config, and project publish wrapper needed to make the existing auth and Firestore sync flow work for this course.

**Tech Stack:** TypeScript, Node.js scripts, Firebase Hosting, Firebase Auth, Firestore, batch scripting, workspace metadata

---

### Task 1: Lock the project metadata contract

**Files:**
- Modify: `projects/sportswellness/meta/project.json`
- Test: `scripts/tests/google-hosted-export.test.ts`

**Step 1: Write the failing test**

Add a source-based assertion that a migrated active project can declare Google Hosted tracked storage keys for a real course export, using `sportswellness`-style keys.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts`
Expected: FAIL if the metadata contract or export assumptions do not yet match the new `sportswellness` wiring.

**Step 3: Write minimal implementation**

Update `projects/sportswellness/meta/project.json` to:

- add a `google-hosted` export target
- add `googleHosted.trackedStorageKeys`
- keep source-of-truth fields intact

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts`
Expected: PASS

### Task 2: Add deploy metadata for sportswellness

**Files:**
- Create: `projects/sportswellness/meta/google-hosted.deploy.json`
- Test: `scripts/tests/google-hosted-deploy.test.ts`

**Step 1: Write the failing test**

Add a focused test fixture or source-based assertion proving deploy config with `enabled`, `firebaseProjectId`, and `hostingSiteId` is recognized as deployable when required files exist.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/google-hosted-deploy.test.ts`
Expected: FAIL before the `sportswellness` deploy config exists.

**Step 3: Write minimal implementation**

Create `projects/sportswellness/meta/google-hosted.deploy.json` using the provided Firebase project id and the chosen Hosting site id for `sportswellness`.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/google-hosted-deploy.test.ts`
Expected: PASS

### Task 3: Add real Firebase config to the sportswellness hosted export

**Files:**
- Create or modify after export: `projects/sportswellness/exports/google-hosted/firebase-config.json`
- Create or modify after export: `projects/sportswellness/exports/google-hosted/.firebaserc`
- Test: `scripts/tests/google-hosted-export.test.ts`

**Step 1: Write the failing test**

Add or update a test that validates a generated Google Hosted export preserves a concrete `firebase-config.json` and `.firebaserc` when present.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts`
Expected: FAIL if the export does not preserve deploy-ready Firebase files.

**Step 3: Write minimal implementation**

Generate the `sportswellness` hosted export, then add:

- `firebase-config.json` with the provided Firebase web app config
- `allowedEmailDomains: []`
- `.firebaserc` targeting the chosen Firebase project id

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts`
Expected: PASS

### Task 4: Add the one-click publish script

**Files:**
- Create: `publish-sportswellness.bat`

**Step 1: Write the failing test**

If a lightweight source contract is appropriate, add a direct file-content assertion in an existing export/deploy test that checks the batch file calls:

- `npm.cmd run export:google-hosted -- --project sportswellness`
- `npm.cmd run deploy:google-hosted -- --project sportswellness`

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/google-hosted-deploy.test.ts`
Expected: FAIL before the batch file exists.

**Step 3: Write minimal implementation**

Create `publish-sportswellness.bat` matching the existing project publish script pattern.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/google-hosted-deploy.test.ts`
Expected: PASS

### Task 5: Build the real hosted export

**Files:**
- Generate: `projects/sportswellness/exports/google-hosted/**`

**Step 1: Run the export**

Run: `npm.cmd run export:google-hosted -- --project sportswellness`
Expected: a complete `google-hosted` export with `google-hosted-bridge.js`, deploy docs, and hosted shell files.

**Step 2: Apply deploy-ready Firebase files**

Copy or write the concrete Firebase files into the generated export:

- `firebase-config.json`
- `.firebaserc`

**Step 3: Re-run export if preservation behavior must be verified**

Run: `npm.cmd run export:google-hosted -- --project sportswellness`
Expected: the export preserves the real Firebase files.

### Task 6: Verify the shared hosted bridge against sportswellness

**Files:**
- Verify generated: `projects/sportswellness/exports/google-hosted/google-hosted-bridge.js`
- Verify generated: `projects/sportswellness/exports/google-hosted/README-deploy.md`

**Step 1: Check generated bridge content**

Confirm the export contains:

- Google sign-in copy
- Firestore sync path for the project slug
- autosave messaging
- tracked storage keys for `sportswellness`

**Step 2: Check deploy README**

Confirm the README still documents Firebase Hosting, Google Auth, Firestore, and cross-device restore.

### Task 7: Attempt deploy-ready verification

**Files:**
- Verify: `projects/sportswellness/meta/google-hosted.deploy.json`
- Verify: `publish-sportswellness.bat`

**Step 1: Run targeted tests**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts scripts/tests/google-hosted-deploy.test.ts`
Expected: PASS

**Step 2: Run the real export**

Run: `npm.cmd run export:google-hosted -- --project sportswellness`
Expected: PASS

**Step 3: Run the one-click publish script if Firebase site exists**

Run: `publish-sportswellness.bat`
Expected: export succeeds and deploy succeeds if the configured Firebase Hosting site already exists and the CLI is authenticated.

### Task 8: Refresh handoff

**Files:**
- Modify: `docs/ops/ACTIVE_HANDOFF.md`

**Step 1: Update active handoff**

Document:

- summary
- files changed
- verification run
- known deployment risks
- source-of-truth location

**Step 2: Final verification note**

Record whether deploy fully succeeded or whether a Firebase-side prerequisite remains.
