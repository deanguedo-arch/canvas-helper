# Sportswellness Performance Games Minimal Player Shell Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the descriptive Performance player header and tighten the outer shell so the selected game gets the maximum practical space on desktop, tablet, and mobile.

**Architecture:** The change stays inside the Sports Wellness shell. `main.js` will render a minimal player nav instead of the old title/header block, and `styles.css` will tighten the stage layout, reduce frame chrome, and rebalance desktop width toward the game surface. The source-based contract test will fail first and then lock the new shell.

**Tech Stack:** Vanilla JavaScript, HTML template strings, CSS, Node test runner, Playwright project E2E

---

### Task 1: Lock the minimal player shell contract in a failing test

**Files:**
- Modify: `scripts/tests/sportswellness-performance-menu.test.ts`

**Step 1: Write the failing test**

Add source expectations for:

- `performance-player-nav`
- `assert.doesNotMatch(source, /performance-player-head/)`

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`

Expected: FAIL because the minimal nav classname is not present yet and the old descriptive player head is still in the runtime template.

### Task 2: Implement the minimal player shell

**Files:**
- Modify: `projects/sportswellness/workspace/main.js`
- Modify: `projects/sportswellness/workspace/styles.css`

**Step 1: Write minimal implementation**

Replace the descriptive player toolbar markup with a minimal `performance-player-nav` that only carries the existing back/menu button.

**Step 2: Tighten the player shell CSS**

- reduce player shell gaps
- shrink the desktop sidebar width slightly
- hide the nav on desktop and show it on tablet/phone
- lighten the frame chrome and retune iframe heights

**Step 3: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`

Expected: PASS

### Task 3: Verify and refresh handoff docs

**Files:**
- Modify: `docs/ops/ACTIVE_HANDOFF.md`
- Modify: `docs/ops/ARCHIVED_HANDOFFS.md`

**Step 1: Run focused verification**

Run:

- `npx tsx --test scripts/tests/sportswellness-ui-state.test.ts`
- `npm run test:e2e:project -- --project sportswellness`
- `npx tsx --test scripts/tests/sportswellness-phase3-content.test.ts`

Expected:

- first two PASS
- Phase 3 content test remains the unrelated known-red on `Multiple-choice review`

**Step 2: Refresh handoff**

Archive the prior active handoff and replace `docs/ops/ACTIVE_HANDOFF.md` with the new minimal-player-shell status and verification.
