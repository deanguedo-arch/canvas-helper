# Sports Wellness Performance Games Focused View Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn the Sports Wellness `Performance` section into a launcher that opens each game in a focused full-area player view on desktop, tablet, and phone.

**Architecture:** Keep the existing four game pages and URLs, but change the section shell in `workspace/main.js` and `workspace/styles.css`. Use a small ephemeral `activePerformanceView` state in the runtime, render either launcher or player markup, and size the iframe with responsive viewport-based rules so the selected game gets most of the content area.

**Tech Stack:** Vanilla JS runtime, static workspace HTML/CSS, iframe-hosted standalone React game pages, Node test runner via `tsx --test`

---

### Task 1: Lock the launcher/player contract with a failing test

**Files:**
- Modify: `scripts/tests/sportswellness-performance-menu.test.ts`
- Modify: `projects/sportswellness/workspace/main.js`

**Step 1: Write the failing test**

- Assert that `main.js` contains:
  - `activePerformanceView: 'menu'`
  - `function closePerformanceTool()`
  - `state.activePerformanceView = 'menu';`
  - `state.activePerformanceView = 'player';`
  - `performance-launcher`
  - `performance-player-shell`
  - `performance-player-toolbar`
  - `performance-player-frame`
  - `Back to training menu`

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`

Expected: FAIL because the runtime still renders the old side-by-side stage card and has no focused player state.

**Step 3: Write minimal implementation**

- Add the new state property and view-switch helpers.
- Update `renderPerformance()` to output launcher/player modes.
- Add the matching CSS hooks.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`

Expected: PASS

### Task 2: Add the focused launcher/player runtime state

**Files:**
- Modify: `projects/sportswellness/workspace/main.js`

**Step 1: Add the ephemeral view state**

- Add `activePerformanceView: 'menu'` to the runtime state object.

**Step 2: Wire the view transitions**

- `setSection('performance')` should reset the section to the launcher view.
- `openPerformanceTool(id)` should set the selected tool and switch to `player`.
- Add `closePerformanceTool()` to return to `menu`.

**Step 3: Avoid persistence drift**

- Keep `activePerformanceToolId` persistence as-is.
- Do not write `activePerformanceView` into the UI snapshot.

### Task 3: Replace the Performance markup with launcher/player modes

**Files:**
- Modify: `projects/sportswellness/workspace/main.js`

**Step 1: Render the launcher**

- Build a launcher surface that shows the tool intro plus the clickable game cards.
- Remove the always-open side-by-side player panel from the launcher view.

**Step 2: Render the focused player**

- Add a compact toolbar with:
  - back button
  - selected game title
  - short description line
- Render the iframe directly below that toolbar in a full-area wrapper.

**Step 3: Rebind actions**

- Tool buttons open the player.
- The back button returns to the launcher.

### Task 4: Add responsive launcher/player layout rules

**Files:**
- Modify: `projects/sportswellness/workspace/styles.css`

**Step 1: Replace the old split-shell layout**

- Keep the old menu card styles only where the launcher still uses them.
- Add new classes:
  - `.performance-launcher`
  - `.performance-launcher-grid`
  - `.performance-player-shell`
  - `.performance-player-toolbar`
  - `.performance-player-back`
  - `.performance-player-frame-wrap`
  - `.performance-player-frame`

**Step 2: Give the player the screen**

- Use viewport-aware height rules for the iframe:
  - large desktop height
  - tablet height based on available viewport
  - phone height with smaller offsets and no wasted card chrome

**Step 3: Keep mobile simple**

- Stack toolbar content cleanly on small widths.
- Avoid nested scroll containers around the iframe.

### Task 5: Run focused verification and refresh the handoff

**Files:**
- Modify: `docs/ops/ACTIVE_HANDOFF.md`
- Modify: `docs/ops/ARCHIVED_HANDOFFS.md`
- Verify: `scripts/tests/sportswellness-performance-menu.test.ts`
- Verify: `scripts/tests/sportswellness-ui-state.test.ts`

**Step 1: Run targeted checks**

Run:
- `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`
- `npx tsx --test scripts/tests/sportswellness-ui-state.test.ts`
- `npm run test:e2e:project -- --project sportswellness`

Expected: PASS

**Step 2: Record unrelated red check**

Run: `npx tsx --test scripts/tests/sportswellness-phase3-content.test.ts`

Expected: still FAIL on the pre-existing `Multiple-choice review` expectation in `projects/sportswellness/workspace/main.js`

**Step 3: Update the handoff**

- Archive the prior active handoff entry.
- Replace `docs/ops/ACTIVE_HANDOFF.md` with the focused-view state and verification results.
