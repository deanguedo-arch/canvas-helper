# Sportswellness Apps Script Runtime Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Repair the Drive-backed Apps Script export so Sports Wellness assignments, games, images, and inline slides render correctly inside the real web app deployment.

**Architecture:** Extend the shared Apps Script shell generator with raw text asset routing and embed-friendly Drive image URLs, then update the Sports Wellness workspace runtime to consume raw HTML for assignment parsing and Apps Script performance tool pages. Keep PDF downloads unchanged, but switch inline Drive-hosted PDF viewing to a preview iframe inside the existing viewer page.

**Tech Stack:** TypeScript, Node test runner, Apps Script shell generation, browser DOM runtime, plain HTML/JS viewer pages.

---

### Task 1: Lock the exporter contract in failing tests

**Files:**
- Modify: `scripts/tests/apps-script-export.test.ts`

**Step 1: Write the failing test**

Add assertions for:

- raw text asset routing in `Code.gs`
- bootstrap exposure of a raw asset helper
- embed-friendly Drive image URL generation

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/apps-script-export.test.ts`

Expected: FAIL on the new Apps Script export expectations.

**Step 3: Write minimal implementation**

Patch `scripts/lib/apps-script.ts` to generate the missing raw route and helper strings.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/apps-script-export.test.ts`

Expected: PASS

### Task 2: Lock the Sports Wellness runtime contract in failing tests

**Files:**
- Create: `scripts/tests/sportswellness-apps-script-runtime.test.ts`

**Step 1: Write the failing test**

Add source-based expectations for:

- raw HTML assignment-runtime fetching
- Apps Script performance iframe `srcdoc` fallback
- Drive preview fallback in `projects/sportswellness/workspace/pdf-viewer.html`

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/sportswellness-apps-script-runtime.test.ts`

Expected: FAIL because the runtime helpers are not present yet.

**Step 3: Write minimal implementation**

Patch the Sports Wellness workspace runtime and PDF viewer to satisfy the new contract.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/sportswellness-apps-script-runtime.test.ts`

Expected: PASS

### Task 3: Implement the shared Apps Script exporter fix

**Files:**
- Modify: `scripts/lib/apps-script.ts`

**Step 1: Add raw text asset routing**

- extend the asset route to accept a raw flag
- return literal text output for raw HTML fetches

**Step 2: Add the raw bootstrap helper**

- inject `window.__CH_ASSET_RAW__` for Apps Script text assets

**Step 3: Improve Drive image URLs**

- emit an image-friendly Drive URL shape for image assets
- leave non-image binary assets on their existing path

**Step 4: Re-run exporter test**

Run: `npx tsx --test scripts/tests/apps-script-export.test.ts`

Expected: PASS

### Task 4: Implement the Sports Wellness runtime fix

**Files:**
- Modify: `projects/sportswellness/workspace/main.js`
- Modify: `projects/sportswellness/workspace/pdf-viewer.html`

**Step 1: Add Apps Script asset helpers in `main.js`**

- detect Apps Script asset URLs
- fetch raw HTML when needed

**Step 2: Fix assignment runtime HTML loading**

- route assignment HTML parsing through the raw asset helper

**Step 3: Fix performance tool page loading**

- load Apps Script HTML game pages into the iframe with `srcdoc`
- preserve normal `src` behavior outside the Apps Script path

**Step 4: Fix inline PDF viewing**

- keep PDF.js for ordinary files
- switch Drive-hosted files to a Drive preview iframe fallback

**Step 5: Re-run runtime tests**

Run: `npx tsx --test scripts/tests/sportswellness-apps-script-runtime.test.ts scripts/tests/sportswellness-performance-menu.test.ts`

Expected: PASS

### Task 5: Regenerate and validate the live export package

**Files:**
- Generated: `projects/sportswellness/exports/apps-script/**`

**Step 1: Regenerate the Apps Script package**

Run: `npm.cmd run export:apps-script -- --project sportswellness`

Expected: Export completes successfully.

**Step 2: Re-run targeted tests**

Run: `npx tsx --test scripts/tests/apps-script-export.test.ts scripts/tests/sportswellness-apps-script-runtime.test.ts scripts/tests/sportswellness-performance-menu.test.ts`

Expected: PASS

**Step 3: Push the refreshed shell**

Run: `Set-Location "C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\exports\apps-script"; clasp push --force`

Expected: Clean push to the linked Apps Script project.

**Step 4: Create a fresh script version**

Run: `clasp version "sportswellness apps script runtime fix"`

Expected: New version created for redeploy.

