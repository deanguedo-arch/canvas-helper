# Course Showcase Desktop Preview Scale Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the Course Showcase desktop preview render at a real desktop viewport and scale down to fit the showcase laptop frame.

**Architecture:** Add a desktop-only viewport shell around the existing desktop iframe. CSS gives the iframe a fixed 1440 by 900 layout viewport, and JavaScript computes a width-based scale so that desktop layout fills the visible laptop frame without collapsing into tablet behavior.

**Tech Stack:** Static HTML, CSS, browser JavaScript, Node test runner.

---

### Task 1: Regression Test

**Files:**
- Modify: `projects/course-showcase/meta/showcase-ui.test.mjs`

**Step 1: Write the failing test**

Add a test that requires:
- `desktopViewportShell` in the HTML.
- `DESKTOP_PREVIEW_WIDTH = 1440` and `DESKTOP_PREVIEW_HEIGHT = 900` in the JS.
- CSS variables and transform rules for scaled desktop rendering.
- `ResizeObserver`-based scale updates.

**Step 2: Run test to verify it fails**

Run: `node --test projects/course-showcase/meta/showcase-ui.test.mjs`

Expected: fail because the desktop viewport shell and scale code do not exist yet.

### Task 2: Desktop Viewport Shell

**Files:**
- Modify: `projects/course-showcase/workspace/index.html`
- Modify: `projects/course-showcase/workspace/styles.css`
- Modify: `projects/course-showcase/workspace/main.js`

**Step 1: Implement minimal HTML/CSS/JS**

Wrap `#desktopFrame` in `#desktopViewportShell`, style the iframe to 1440 by 900, and compute a width-fit `--desktop-preview-scale`, `--desktop-preview-offset-x`, and `--desktop-preview-offset-y`.

**Step 2: Run focused source test**

Run: `node --test projects/course-showcase/meta/showcase-ui.test.mjs`

Expected: pass.

### Task 3: Browser Check

**Files:**
- No source edits expected.

**Step 1: Serve workspace locally**

Use a temporary local static server for `projects/course-showcase/workspace`.

**Step 2: Inspect desktop preview**

Use Playwright to confirm:
- `#desktopFrame` computed width is `1440px`.
- `#desktopFrame` computed height is `900px`.
- Transform scale is below `1`.
- The rendered iframe width fills the desktop preview shell.

### Task 4: Project Validation

**Files:**
- No source edits expected.

**Step 1: Run validator**

Run: `npm run validate:manifests -- --project course-showcase`

Expected: pass.
