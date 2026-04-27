# World Religions 30 Option 1 Google Hosted Firebase Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire `worldreligions30-option1` into the shared Firebase-hosted Google sign-in and autosave flow so learner state persists across devices.

**Architecture:** Reuse the repo's existing `google-hosted` export and deploy bridge. The implementation is project wiring only: manifest opt-in, Firebase metadata, deploy metadata, publish batch automation, and a project-specific regression that validates the metadata plus generated hosted output.

**Tech Stack:** Canvas Helper project metadata, Node test runner, Firebase Hosting, shared Google-hosted bridge, Firestore-backed autosave.

---

### Task 1: Add the failing project-hosting regression

**Files:**
- Create: `scripts/tests/worldreligions30-option1-google-hosted.test.ts`

**Step 1: Write the failing test**

Create a project-specific test that expects:
- `projects/worldreligions30-option1/meta/project.json` to opt into `google-hosted`
- explicit tracked storage keys for shell progress, shell UI state, and chapter 1-10 interactives
- `projects/worldreligions30-option1/meta/google-hosted.deploy.json`
- `projects/worldreligions30-option1/meta/google-hosted.firebase-config.json`
- `projects/worldreligions30-option1/meta/google-hosted.firebaserc`
- `publish-worldreligions30-option1.bat`
- deploy-ready hosted export files after export

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/worldreligions30-option1-google-hosted.test.ts`

Expected: FAIL because the Google-hosted metadata and publish batch file do not exist yet.

### Task 2: Wire project metadata for Google-hosted delivery

**Files:**
- Modify: `projects/worldreligions30-option1/meta/project.json`
- Create: `projects/worldreligions30-option1/meta/google-hosted.deploy.json`
- Create: `projects/worldreligions30-option1/meta/google-hosted.firebase-config.json`
- Create: `projects/worldreligions30-option1/meta/google-hosted.firebaserc`

**Step 1: Write minimal implementation**

Add:
- `google-hosted` export target
- tracked storage keys for the shell and all chapter interactives
- Firebase project id `calm-module-one`
- Hosting site id `worldreligion`
- provided Firebase web config plus `allowedEmailDomains: []`

**Step 2: Re-run the focused test**

Run: `npx tsx --test scripts/tests/worldreligions30-option1-google-hosted.test.ts`

Expected: still FAIL until the batch file exists and export artifacts are generated.

### Task 3: Add the publish batch file

**Files:**
- Create: `publish-worldreligions30-option1.bat`

**Step 1: Write minimal implementation**

Mirror the established project publish pattern:
- export Google-hosted bundle
- copy Firebase config and `.firebaserc` from project `meta`
- deploy the project through the shared deploy command

**Step 2: Re-run the focused test**

Run: `npx tsx --test scripts/tests/worldreligions30-option1-google-hosted.test.ts`

Expected: still FAIL until the export artifacts are generated.

### Task 4: Generate hosted output and verify the regression turns green

**Files:**
- Derived output only: `projects/worldreligions30-option1/exports/google-hosted/**`

**Step 1: Export hosted bundle**

Run: `npm.cmd run export:google-hosted -- --project worldreligions30-option1`

**Step 2: Copy tracked Firebase deploy files into the export**

Run via batch file in Task 5 or copy manually for the initial regression turn-green step.

**Step 3: Re-run the focused test**

Run: `npx tsx --test scripts/tests/worldreligions30-option1-google-hosted.test.ts`

Expected: PASS

### Task 5: Run shared regressions and deploy

**Files:**
- No new source files expected

**Step 1: Run shared Google-hosted regressions**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts scripts/tests/google-hosted-deploy.test.ts scripts/tests/worldreligions30-option1-google-hosted.test.ts`

Expected: PASS

**Step 2: Run the one-click publish flow**

Run: `cmd /c publish-worldreligions30-option1.bat`

Expected: export + deploy complete without error.

**Step 3: Verify live output**

Run:
- `curl.exe -L --silent https://worldreligion.web.app/`
- `curl.exe -L --silent https://worldreligion.web.app/firebase-config.json`
- `curl.exe -L --silent https://worldreligion.web.app/google-hosted-bridge.js`

Expected:
- live HTML loads
- Firebase config matches `calm-module-one`
- bridge includes Google sign-in UI and tracked storage keys
