# World Religions 30 Option 1 Google Hosted Firebase Design

**Goal:** Publish `worldreligions30-option1` through the repo's shared Firebase Hosting flow so learners can sign in with Google and keep course progress plus chapter interactive work across devices.

**Recommended Approach:** Reuse the existing `google-hosted` export and deploy bridge already used elsewhere in this repo. Do not paste ad hoc Firebase initialization code into the course runtime. Instead, wire the course manifest, Firebase metadata, deploy metadata, and publish batch file into the shared bridge so Authentication, Firestore autosave, and restore behavior stay consistent with the established platform pattern.

**Why this approach:** The shared bridge already handles Google sign-in, localStorage tracking, autosave, restore, reload guards, and hosted deployment conventions. `worldreligions30-option1` only needs project-specific configuration and storage-key coverage. This minimizes risk and keeps the source of truth in project metadata rather than runtime one-offs.

**Project wiring:**
- Project slug: `worldreligions30-option1`
- Firebase project id: `calm-module-one`
- Firebase Hosting site id: `worldreligion`
- Firebase app config: use the provided `calm-module-one` web app credentials tied to the existing `worldreligion` Hosting site

**Tracked learner state:**
- Main course shell:
  - `worldreligions30-option1.progress`
  - `worldreligions30-option1.ui`
- Chapter interactives:
  - `worldreligions30-option1.assignment.chapter1interactive`
  - `worldreligions30-option1.assignment.chapter2interactive`
  - `worldreligions30-option1.assignment.chapter3interactive`
  - `worldreligions30-option1.assignment.chapter4interactive`
  - `worldreligions30-option1.assignment.chapter5interactive`
  - `worldreligions30-option1.assignment.chapter6interactive`
  - `worldreligions30-option1.assignment.chapter7interactive`
  - `worldreligions30-option1.assignment.chapter8interactive`
  - `worldreligions30-option1.assignment.chapter9interactive`
  - `worldreligions30-option1.assignment.chapter10interactive`

**Files to add or update:**
- Update `projects/worldreligions30-option1/meta/project.json` to opt into `google-hosted` and declare tracked storage keys.
- Add `projects/worldreligions30-option1/meta/google-hosted.deploy.json`.
- Add `projects/worldreligions30-option1/meta/google-hosted.firebase-config.json`.
- Add `projects/worldreligions30-option1/meta/google-hosted.firebaserc`.
- Add `publish-worldreligions30-option1.bat`.
- Add `scripts/tests/worldreligions30-option1-google-hosted.test.ts`.

**Deployment flow:**
1. Export the project with `npm.cmd run export:google-hosted -- --project worldreligions30-option1`.
2. Copy the tracked Firebase config and `.firebaserc` from project `meta` into the Google-hosted export.
3. Deploy with `npm.cmd run deploy:google-hosted -- --project worldreligions30-option1`.
4. Verify the live site serves the expected Firebase config, Google-hosted bridge, and course HTML.

**Verification:**
- Targeted metadata/export regression for `worldreligions30-option1`
- Shared Google-hosted export/deploy regressions
- Real export
- Real deploy
- Live fetch checks against `https://worldreligion.web.app/`
