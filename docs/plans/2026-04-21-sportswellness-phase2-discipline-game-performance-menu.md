# Sportswellness Phase 2 Discipline Game Performance Menu Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the imported `disciplinegame` activity to the `sportswellness` course shell as a second clickable Performance tool labeled `Phase 2 Architecture of Discipline Game`.

**Architecture:** Reuse the already-approved Performance-tool pattern by keeping the Phase 2 game isolated in its own workspace HTML page and adding a second item to the existing `PERFORMANCE_TOOLS` menu in the course shell. This keeps the Phase 2 lesson and assignment surfaces unchanged while extending the same iframe-backed tool system already used for the Phase 3 focus game.

**Tech Stack:** Vanilla workspace shell JavaScript, static HTML/CSS, React via browser runtime for the standalone game page, Node `tsx --test` source-based regression tests.

---

### Task 1: Extend the Performance-menu contract test

**Files:**
- Modify: `scripts/tests/sportswellness-performance-menu.test.ts`

**Step 1: Write the failing test**

Add assertions that:
- `main.js` includes a second `PERFORMANCE_TOOLS` entry for `phase2-discipline-game`
- the title is `Phase 2 Architecture of Discipline Game`
- the viewer source points at `./performance/phase2-discipline-game.html`
- the standalone HTML and app files exist and expose discipline-game identity strings

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`
Expected: FAIL because the new Phase 2 tool files and runtime entry do not exist yet.

### Task 2: Build the standalone Phase 2 discipline-game page

**Files:**
- Create: `projects/sportswellness/workspace/performance/phase2-discipline-game.html`
- Create: `projects/sportswellness/workspace/performance/phase2-discipline-game.app.js`

**Step 1: Write minimal implementation**

Create a standalone page that:
- mirrors the current Phase 3 game page boot path
- mounts an adapted version of the imported `disciplinegame` source
- stays self-contained so the course shell can load it through an iframe

### Task 3: Add the second Performance tool entry

**Files:**
- Modify: `projects/sportswellness/workspace/main.js`

**Step 1: Write minimal implementation**

Extend `PERFORMANCE_TOOLS` with:
- `id: 'phase2-discipline-game'`
- `title: 'Phase 2 Architecture of Discipline Game'`
- `viewerSrc: './performance/phase2-discipline-game.html'`

Keep the existing menu rendering and UI-state behavior unchanged so both games use the same shell contract.

### Task 4: Verify and update handoff

**Files:**
- Modify: `docs/ops/ACTIVE_HANDOFF.md`
- Modify: `docs/ops/ARCHIVED_HANDOFFS.md`

**Step 1: Run verification**

Run:
- `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`
- `npx tsx --test scripts/tests/sportswellness-ui-state.test.ts`
- `npm run test:e2e:project -- --project sportswellness`

**Step 2: Record the new stop point**

Update the active handoff with the expanded Performance-tool state and archive the previous active sportswellness entry.
