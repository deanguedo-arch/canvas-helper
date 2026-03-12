# Google Hosted Deploy Tool Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a local deploy picker for Google-hosted exports that shows only configured slugs and deploys one or many selected bundles to their configured Firebase project and Hosting site.

**Architecture:** Keep deploy behavior outside Studio. Store Firebase deploy metadata per slug in `projects/<slug>/meta/google-hosted.deploy.json`, scan local projects from a dedicated Node script, validate readiness, and optionally launch it through a thin Windows batch wrapper.

**Tech Stack:** TypeScript, Node.js, existing CLI helpers, Windows batch launcher, Firebase CLI

---

### Task 1: Define deploy-config discovery and readiness helpers

**Files:**
- Create: `scripts/lib/google-hosted-deploy.ts`
- Test: `scripts/tests/google-hosted-deploy.test.ts`

**Step 1: Write the failing test**

Add tests that cover:
- a slug with `meta/google-hosted.deploy.json`, `exports/google-hosted/firebase-config.json`, and `exports/google-hosted/.firebaserc` is considered deployable
- a slug missing any required file is excluded
- config includes `enabled`, `firebaseProjectId`, and `hostingSiteId`

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/google-hosted-deploy.test.ts`
Expected: FAIL because helper module/functions do not exist yet

**Step 3: Write minimal implementation**

Implement helper functions to:
- load deploy config from `projects/<slug>/meta/google-hosted.deploy.json`
- validate config shape
- check readiness files in `projects/<slug>/exports/google-hosted/`
- return a normalized list of deployable slugs

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/google-hosted-deploy.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/google-hosted-deploy.ts scripts/tests/google-hosted-deploy.test.ts
git commit -m "feat(ops): add google hosted deploy discovery helpers"
```

### Task 2: Add selection parsing and deploy-target generation

**Files:**
- Modify: `scripts/lib/google-hosted-deploy.ts`
- Test: `scripts/tests/google-hosted-deploy.test.ts`

**Step 1: Write the failing test**

Add tests that cover:
- selecting one slug by menu index
- selecting multiple slugs by comma-separated indexes
- generating Firebase deploy targeting data for a slug with `firebaseProjectId` and `hostingSiteId`

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/google-hosted-deploy.test.ts`
Expected: FAIL because selection/deploy-target helpers are not implemented

**Step 3: Write minimal implementation**

Implement helpers to:
- parse one-or-many menu selections
- return selected deployable entries
- prepare deploy context with slug, export dir, Firebase project id, and Hosting site id

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/google-hosted-deploy.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/google-hosted-deploy.ts scripts/tests/google-hosted-deploy.test.ts
git commit -m "feat(ops): add deploy selection parsing"
```

### Task 3: Implement the deploy CLI script

**Files:**
- Create: `scripts/deploy-google-hosted.ts`
- Modify: `scripts/lib/google-hosted-deploy.ts`
- Modify: `package.json`
- Test: `scripts/tests/google-hosted-deploy.test.ts`

**Step 1: Write the failing test**

Add tests around extracted CLI-safe helpers, such as:
- formatting deployable entries for display
- rejecting empty deployable lists
- rejecting invalid selections

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/google-hosted-deploy.test.ts`
Expected: FAIL because CLI-facing behavior helpers are missing

**Step 3: Write minimal implementation**

Create `scripts/deploy-google-hosted.ts` that:
- scans deployable slugs
- prints a numbered list
- prompts for one-or-many selections
- validates Firebase deploy prerequisites
- writes any per-run Firebase target files if needed for site-specific deploys
- shells out to `firebase deploy --only hosting` from the selected export directory
- prints per-slug results

Add `deploy:google-hosted` to `package.json`.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/google-hosted-deploy.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/deploy-google-hosted.ts scripts/lib/google-hosted-deploy.ts scripts/tests/google-hosted-deploy.test.ts package.json
git commit -m "feat(ops): add google hosted deploy cli"
```

### Task 4: Add the Windows launcher

**Files:**
- Create: `deploy-google-hosted.bat`
- Test: manual verification only

**Step 1: Write the failing test**

No automated batch test. Define manual acceptance:
- running `deploy-google-hosted.bat` from repo root launches the Node deploy picker

**Step 2: Run manual verification to verify current failure**

Run: `deploy-google-hosted.bat`
Expected: FAIL because launcher does not exist yet

**Step 3: Write minimal implementation**

Add a thin batch wrapper that:
- resolves repo root
- resolves `npm.cmd`
- runs `npm.cmd run deploy:google-hosted`

**Step 4: Run manual verification to verify it passes**

Run: `deploy-google-hosted.bat`
Expected: deploy picker appears

**Step 5: Commit**

```bash
git add deploy-google-hosted.bat
git commit -m "feat(ops): add google hosted deploy launcher"
```

### Task 5: Add docs and sample config guidance

**Files:**
- Modify: `README.md`
- Modify: `ARCHITECTURE.md`
- Create: `docs/ops/google-hosted-deploy.md` or document inside existing ops guide

**Step 1: Write the failing test**

No automated doc test. Define manual acceptance:
- docs explain how to mark a slug deployable and run the deploy tool

**Step 2: Verify current docs gap**

Read current docs and confirm missing deploy-tool guidance.

**Step 3: Write minimal implementation**

Document:
- `projects/<slug>/meta/google-hosted.deploy.json`
- required readiness files
- single or multi-select deploy workflow
- Firebase boundary: targets must already exist

**Step 4: Run verification**

Run: `npm.cmd run typecheck`
Expected: PASS

**Step 5: Commit**

```bash
git add README.md ARCHITECTURE.md docs/ops/google-hosted-deploy.md
git commit -m "docs(ops): add google hosted deploy workflow"
```

### Task 6: End-to-end verification

**Files:**
- Modify only if verification exposes issues

**Step 1: Run targeted tests**

Run: `npm.cmd run test:google-hosted`
Expected: PASS

**Step 2: Run deploy-tool tests**

Run: `npx tsx --test scripts/tests/google-hosted-deploy.test.ts`
Expected: PASS

**Step 3: Run typecheck**

Run: `npm.cmd run typecheck`
Expected: PASS

**Step 4: Manual smoke**

Use one configured slug and verify:
- it appears in the picker
- an unconfigured slug does not appear
- selecting one slug works
- selecting multiple slugs works when configured

**Step 5: Commit**

```bash
git add -A
git commit -m "test(ops): verify google hosted deploy workflow"
```
