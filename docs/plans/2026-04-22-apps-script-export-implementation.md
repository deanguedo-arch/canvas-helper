# Apps Script Drive-Backed Export Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the oversized Apps Script payload export with a thin clasp-ready shell plus a Drive-backed asset package that can handle large courses such as `sportswellness`.

**Architecture:** Reuse the shared single-HTML asset-registry bundle, export its shell and assets into `drive-assets/`, generate an Apps Script shell that serves text assets and resolves binary assets through Drive, and document the Drive setup flow in the generated README.

**Tech Stack:** TypeScript, tsx, existing Canvas Helper export helpers, Google Apps Script, Google Drive

---

### Task 1: Lock the Drive-backed export contract in tests

**Files:**
- Modify: `scripts/tests/apps-script-export.test.ts`
- Read for helpers if needed: `scripts/tests/google-hosted-export.test.ts`

**Step 1: Write the failing test**

Assert that `exportProjectToAppsScript()` now creates:

- `appsscript.json`
- `Code.gs`
- `.claspignore`
- `README-deploy.md`
- `drive-assets/asset-manifest.json`
- `drive-assets/__canvas_helper_shell/index.html`

Assert that the generated shell includes:

- `doGet`
- `DriveApp`
- `PropertiesService`
- `setDriveRootFolderId`
- `rebuildDriveAssetIndex`
- `window.__CH_ASSET__`
- `HtmlService`

Assert that the export does **not** depend on `PayloadChunk_*.gs` or `Index.html`.

**Step 2: Run the test to verify it fails**

Run: `npx tsx --test scripts/tests/apps-script-export.test.ts`

Expected: FAIL against the old payload-chunk exporter.

### Task 2: Replace the shell builders

**Files:**
- Modify: `scripts/lib/apps-script.ts`

**Step 1: Build the new shell helpers**

Implement builders for:

- `appsscript.json`
- `.claspignore`
- `Code.gs`
- `README-deploy.md`
- `asset-manifest.json`

Remove the old compressed payload helpers and `PayloadChunk_*.gs` generation.

**Step 2: Run the targeted test**

Run: `npx tsx --test scripts/tests/apps-script-export.test.ts`

Expected: still FAIL until the export orchestration writes the new files.

### Task 3: Rewrite the export orchestration

**Files:**
- Modify: `scripts/lib/exports/apps-script.ts`
- Read: `scripts/lib/exports/shared.ts`

**Step 1: Implement the new export flow**

- Build the standalone bundle with asset-registry output.
- Write the shell HTML and asset files into `drive-assets/`.
- Generate `asset-manifest.json`.
- Preserve `.clasp.json` if it already exists in the export directory.
- Emit only the thin Apps Script shell files at the export root.

**Step 2: Run the targeted test**

Run: `npx tsx --test scripts/tests/apps-script-export.test.ts`

Expected: PASS

### Task 4: Run focused repo checks

**Files:**
- Modify only if needed: `package.json`

**Step 1: Verify the export boundary**

Run:

- `npx tsx --test scripts/tests/apps-script-export.test.ts`
- `npm.cmd run typecheck`

Expected: PASS, excluding any unrelated known-reds already in the repo.

### Task 5: Generate the real sportswellness package

**Files:**
- Output only under: `projects/sportswellness/exports/apps-script/`

**Step 1: Run the real export**

Run: `npm.cmd run export:apps-script -- --project sportswellness`

Expected: export completes with a thin shell and a large `drive-assets/` directory instead of hundreds of Apps Script payload files.

**Step 2: Inspect the output**

Record:

- shell file count
- drive asset file count
- export location
- whether `.clasp.json` was preserved

### Task 6: Refresh handoff

**Files:**
- Modify: `docs/ops/ACTIVE_HANDOFF.md`
- Modify: `docs/ops/ARCHIVED_HANDOFFS.md`

**Step 1: Update the handoff**

Capture:

- the new Apps Script export shape
- the deployment/setup expectation for uploading `drive-assets/`
- known constraints around Drive file indexing and embed behavior

**Step 2: Final verification**

Run:

- `npx tsx --test scripts/tests/apps-script-export.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run export:apps-script -- --project sportswellness`

Expected: PASS, except any explicitly documented unrelated repo failures
