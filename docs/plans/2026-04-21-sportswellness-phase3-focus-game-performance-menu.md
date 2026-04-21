# Sportswellness Phase 3 Focus Game Performance Menu Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the imported Inner Game focus activity to the `sportswellness` course shell as a clickable `Phase 3 Focus Game` item inside the `Performance` section.

**Architecture:** Keep the game isolated from the handwritten assignment runtime by mounting it from a dedicated workspace HTML page inside the course shell's `Performance` section. Update the shell runtime to render a small tool menu plus embedded viewer, and persist the selected performance tool in the same UI-state snapshot used by the rest of the course shell.

**Tech Stack:** Vanilla workspace shell JavaScript, static HTML/CSS, React via browser runtime for the standalone game page, Node `tsx --test` source-based regression tests.

---

### Task 1: Lock the Performance-menu contract with a failing test

**Files:**
- Create: `scripts/tests/sportswellness-performance-menu.test.ts`
- Modify: `projects/sportswellness/workspace/main.js`
- Create: `projects/sportswellness/workspace/performance/phase3-focus-game.html`
- Create: `projects/sportswellness/workspace/performance/phase3-focus-game.app.js`

**Step 1: Write the failing test**

Add a source-based test that asserts:
- `main.js` defines a `Phase 3 Focus Game` Performance tool entry
- the tool points at `./performance/phase3-focus-game.html`
- `renderPerformance()` outputs a clickable tool menu and iframe-backed viewer
- the standalone HTML/app files exist and include the focus-game labels

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`
Expected: FAIL because the menu contract and standalone page do not exist yet.

### Task 2: Build the standalone Phase 3 focus-game page

**Files:**
- Create: `projects/sportswellness/workspace/performance/phase3-focus-game.html`
- Create: `projects/sportswellness/workspace/performance/phase3-focus-game.app.js`

**Step 1: Write minimal implementation**

Create a dedicated static page that:
- loads React/ReactDOM/Babel in-browser
- mounts an adapted version of the imported `innergamegame` source
- keeps the game self-contained so the course shell only needs to iframe it

**Step 2: Run the targeted test**

Run: `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`
Expected: still FAIL until the shell menu wiring lands.

### Task 3: Replace the placeholder Performance cards with a real tool menu

**Files:**
- Modify: `projects/sportswellness/workspace/main.js`
- Modify: `projects/sportswellness/workspace/styles.css`

**Step 1: Write minimal implementation**

Update the shell runtime to:
- define a `PERFORMANCE_TOOLS` collection
- persist the active performance tool in UI state
- render a left-hand clickable menu plus right-hand viewer panel
- embed `./performance/phase3-focus-game.html` in the viewer

**Step 2: Run tests to verify green**

Run:
- `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`
- `npx tsx --test scripts/tests/sportswellness-ui-state.test.ts`

Expected: PASS.

### Task 4: Run adjacent regression checks and handoff update

**Files:**
- Modify: `docs/ops/ACTIVE_HANDOFF.md`
- Modify: `docs/ops/ARCHIVED_HANDOFFS.md`

**Step 1: Verify adjacent behavior**

Run:
- `npx tsx --test scripts/tests/sportswellness-phase3-content.test.ts`
- `npx tsx --test scripts/tests/sportswellness-phase3-assignment.test.ts`

Expected: PASS to confirm the Performance-menu insertion did not disturb the existing Phase 3 lesson or assignment contracts.

**Step 2: Record handoff**

Archive the prior active handoff entry, write the new active handoff, and include the new source-of-truth files plus exact next command.
