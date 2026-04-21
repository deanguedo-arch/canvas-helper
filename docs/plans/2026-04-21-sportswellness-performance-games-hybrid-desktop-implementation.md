# Sportswellness Performance Games Hybrid Desktop Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore the desktop side training card in the Sports Wellness `Performance` player while keeping the larger focused game view on tablet and phone.

**Architecture:** The change stays in the `sportswellness` workspace shell. `main.js` will render a desktop-only side rail inside player mode, and `styles.css` will define the split desktop grid plus the existing single-column responsive fallback. A source-based test will lock the new desktop shell contract before the runtime code changes.

**Tech Stack:** Vanilla JavaScript, HTML template strings, CSS, Node test runner, Playwright project E2E

---

### Task 1: Lock the hybrid desktop player contract in a failing test

**Files:**
- Modify: `scripts/tests/sportswellness-performance-menu.test.ts`

**Step 1: Write the failing test**

Add source expectations for:

- `performance-player-layout`
- `performance-player-sidebar`
- `performance-player-stage`
- `performance-player-menu`

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`

Expected: FAIL because the new desktop player shell snippets are not present yet.

**Step 3: Commit**

Do not commit in this session unless the user asks.

### Task 2: Implement the hybrid desktop player shell

**Files:**
- Modify: `projects/sportswellness/workspace/main.js`
- Modify: `projects/sportswellness/workspace/styles.css`

**Step 1: Write minimal implementation**

Update `renderPerformance()` so player mode renders:

- a `performance-player-layout` wrapper
- a `performance-player-sidebar` panel containing the menu heading and tool buttons
- a `performance-player-stage` wrapper around the existing toolbar and iframe

Keep launcher mode unchanged.

**Step 2: Add responsive CSS**

Define the split desktop layout and preserve the larger viewport-based iframe sizing. At the existing mobile breakpoint, collapse the player back to the focused single-column stage and hide the desktop sidebar.

**Step 3: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`

Expected: PASS

### Task 3: Verify the related shell behavior and refresh handoff docs

**Files:**
- Modify: `docs/ops/ACTIVE_HANDOFF.md`
- Modify: `docs/ops/ARCHIVED_HANDOFFS.md`

**Step 1: Run focused verification**

Run:

- `npx tsx --test scripts/tests/sportswellness-ui-state.test.ts`
- `npm run test:e2e:project -- --project sportswellness`

Expected: PASS

**Step 2: Refresh handoff**

Archive the prior active handoff and replace `docs/ops/ACTIVE_HANDOFF.md` with the updated hybrid desktop layout status, changed files, verification, risks, source-of-truth, and next-step details.

**Step 3: Commit**

Do not commit in this session unless the user asks.
