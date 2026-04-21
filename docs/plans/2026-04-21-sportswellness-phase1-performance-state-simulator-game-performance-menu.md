# Sportswellness Phase 1 Performance State Simulator Game Performance Menu Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the imported `PerformanceStateStimulator` activity to the `sportswellness` course shell as a clickable `Phase 1 Performance State Simulator Game` item inside the `Performance` section.

**Architecture:** Reuse the existing iframe-backed Performance-tool pattern so the Phase 1 simulator lives on its own workspace page and does not alter the authored Phase 1 lesson or assignment runtime. Extend the same `PERFORMANCE_TOOLS` collection already used by the Phase 2 and Phase 3 game pages.

**Tech Stack:** Vanilla workspace shell JavaScript, static HTML/CSS, React via browser runtime for the standalone game page, Node `tsx --test` source-based regression tests.

---

### Task 1: Extend the Performance-menu contract test

**Files:**
- Modify: `scripts/tests/sportswellness-performance-menu.test.ts`

**Step 1: Write the failing test**

Add assertions that:
- `main.js` includes a `phase1-performance-state-simulator-game` entry
- the title is `Phase 1 Performance State Simulator Game`
- the viewer source points at `./performance/phase1-performance-state-simulator-game.html`
- the standalone HTML and app files exist and expose the imported simulator identity

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`
Expected: FAIL because the new Phase 1 tool files and runtime entry do not exist yet.

### Task 2: Build the standalone Phase 1 simulator page

**Files:**
- Create: `projects/sportswellness/workspace/performance/phase1-performance-state-simulator-game.html`
- Create: `projects/sportswellness/workspace/performance/phase1-performance-state-simulator-game.app.js`

**Step 1: Write minimal implementation**

Create a standalone page that:
- mirrors the current Performance game boot path
- mounts an adapted version of the imported `PerformanceStateStimulator` source
- stays isolated so the course shell can load it through an iframe

### Task 3: Add the third Performance tool entry

**Files:**
- Modify: `projects/sportswellness/workspace/main.js`
- Modify: `projects/sportswellness/meta/project.json`

**Step 1: Write minimal implementation**

Extend the Performance-menu contract with:
- `id: 'phase1-performance-state-simulator-game'`
- `title: 'Phase 1 Performance State Simulator Game'`
- `viewerSrc: './performance/phase1-performance-state-simulator-game.html'`

Record the injected Performance games in `project.json` so the workspace keeps explicit source-to-target traceability.

### Task 4: Verify and update handoff

**Files:**
- Modify: `docs/ops/ACTIVE_HANDOFF.md`
- Modify: `docs/ops/ARCHIVED_HANDOFFS.md`

**Step 1: Run verification**

Run:
- `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`
- `npx tsx --test scripts/tests/sportswellness-ui-state.test.ts`
- `npx tsx --test scripts/tests/sportswellness-phase3-assignment.test.ts`
- `npm run test:e2e:project -- --project sportswellness`

**Step 2: Record the new stop point**

Archive the prior active handoff entry and write the new active handoff with the expanded three-tool Performance state.
