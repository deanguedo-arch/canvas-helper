# Google Hosted Export Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `google-hosted` export target that turns a project workspace into a Firebase-ready web app bundle with Google sign-in and cross-device save/resume for Google Classroom delivery.

**Architecture:** Reuse the existing export pipeline shape: copy the workspace into a target-specific export folder, inject a generated runtime bridge, and leave source workspace files unchanged. The Google-hosted bridge will translate existing browser state into Firebase Authentication + Firestore-backed persistence, while Studio and the local server expose the new export target alongside SCORM and single HTML.

**Tech Stack:** TypeScript, Node.js filesystem utilities, existing export pipeline, Firebase Hosting config generation, Firebase Auth/Firestore browser runtime, `node:test` via `tsx`, Studio React command hooks

---

### Task 1: Add failing export regression coverage

**Files:**
- Create: `scripts/tests/google-hosted-export.test.ts`
- Reference: `scripts/lib/exporter.ts`

**Step 1: Write the failing bundle-shape test**

Add a test that exports a fixture project to `google-hosted` and expects:
- `projects/<slug>/exports/google-hosted/index.html`
- `google-hosted-bridge.js`
- `firebase-config.template.json`
- `firebase.json`
- `README-deploy.md`

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts`
Expected: FAIL because no Google-hosted export path exists yet.

**Step 3: Write the failing runtime-injection test**

Add a second test that reads the exported HTML and expects the Google-hosted bridge to be injected before the first local script tag.

**Step 4: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts`
Expected: FAIL because no bridge injection exists yet.

### Task 2: Build the Google-hosted runtime generator

**Files:**
- Create: `scripts/lib/google-hosted.ts`
- Modify: `scripts/lib/exporter.ts`

**Step 1: Write the failing runtime-generation test**

Extend `scripts/tests/google-hosted-export.test.ts` to assert that the generated bridge script includes:
- Google sign-in entrypoint
- Firestore save/restore helpers
- project slug binding
- autosave status messaging

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts`
Expected: FAIL because no runtime generator exists yet.

**Step 3: Implement the bridge generator**

Create `scripts/lib/google-hosted.ts` with helpers to:
- normalize the export label
- inject `google-hosted-bridge.js` into HTML
- generate the runtime script
- generate Firebase config template files
- generate `README-deploy.md`

Keep the runtime narrow:
- popup Google sign-in
- restore state after auth
- save current local state into Firestore
- mirror the saved state back into local storage for project compatibility

**Step 4: Implement the export path**

Add `exportProjectToGoogleHosted(projectSlug)` to `scripts/lib/exporter.ts` so it:
- clears `projects/<slug>/exports/google-hosted/`
- copies the workspace
- detects local storage keys
- writes the generated bridge/config/docs files
- injects the bridge into the HTML entrypoint

**Step 5: Run tests**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts`
Expected: PASS

### Task 3: Add the CLI entrypoint

**Files:**
- Create: `scripts/export-google-hosted.ts`
- Modify: `package.json`

**Step 1: Write the failing CLI test or command check**

Add a small command-level assertion in `scripts/tests/google-hosted-export.test.ts` or a separate test that expects the repo to expose `npm.cmd run export:google-hosted -- --project <slug>`.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts`
Expected: FAIL because the script is missing.

**Step 3: Implement the CLI command**

Create `scripts/export-google-hosted.ts` mirroring the existing export command shape:
- parse `--project`
- call `exportProjectToGoogleHosted`
- print the output folder path and key generated files

Add to `package.json`:
- `"export:google-hosted": "tsx scripts/export-google-hosted.ts"`

**Step 4: Run tests**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts`
Expected: PASS

### Task 4: Expose the export in Studio and the local server

**Files:**
- Modify: `app/server/lib/types.ts`
- Modify: `app/server/lib/command-runner.ts`
- Modify: `app/studio/src/lib/types.ts`
- Modify: `app/studio/src/hooks/useProjectCommands.ts`

**Step 1: Add the new export command type**

Update shared command/export types so `google-hosted` is a recognized export target.

**Step 2: Wire the command runner**

Map the new export target to:
- `npm.cmd run export:google-hosted -- --project <slug>`

**Step 3: Add the Studio action**

Expose `Google Hosted` in the Studio export actions using the same command hook pattern as the existing export buttons.

**Step 4: Run typecheck**

Run: `npm.cmd run typecheck`
Expected: PASS

### Task 5: Add focused docs for teacher deployment

**Files:**
- Modify: `README.md`
- Modify: `ARCHITECTURE.md`

**Step 1: Update the README**

Document:
- what `google-hosted` export is for
- that it targets Google Classroom delivery
- that it requires a Firebase project
- the one-time teacher deployment flow

**Step 2: Update architecture docs**

Document:
- the new export boundary
- generated bridge ownership in `scripts/lib/google-hosted.ts`
- the separation between export bundle generation and actual Firebase deployment

**Step 3: Re-run targeted verification**

Run:
- `npx tsx --test scripts/tests/google-hosted-export.test.ts`
- `npm.cmd run typecheck`
Expected: PASS

### Task 6: Add manual verification and smoke coverage

**Files:**
- Modify: `scripts/smoke-local-pipeline.ts`
- Modify: `docs/ops/HANDOFF.md` only if the handoff workflow needs an added export note

**Step 1: Extend smoke coverage**

Update the smoke path so it can generate a `google-hosted` bundle for the smoke project without attempting deployment.

**Step 2: Run the smoke path**

Run: `npm.cmd run smoke:pipeline`
Expected: PASS with a generated `projects/smoke-calm-module/exports/google-hosted/` bundle.

**Step 3: Manual classroom-style verification**

Document and execute this manual check on a real Firebase project:
- export a real project to `google-hosted`
- deploy to Firebase Hosting
- open from a classroom-style link
- sign in with a school Google account
- answer content in browser A
- reopen in browser B or another device
- confirm state restores
- confirm the printable report still works

### Task 7: Final verification

**Files:**
- Reference: `scripts/lib/google-hosted.ts`
- Reference: `scripts/lib/exporter.ts`
- Reference: `scripts/tests/google-hosted-export.test.ts`

**Step 1: Run the verification floor**

Run:
- `npx tsx --test scripts/tests/google-hosted-export.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`
- `npm.cmd run smoke:pipeline`

Expected: all PASS

**Step 2: Capture handoff**

Record:
- Firebase project setup prerequisites
- the exact deploy command used outside the repo
- the hosted URL pattern
- any auth/domain restrictions needed for the school environment
