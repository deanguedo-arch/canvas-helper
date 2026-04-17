# Phase 4B Assignment Parity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild Phase 4B into the shared assignment shell with the same rubric, sizing, and print/report behavior used by the aligned Phase 2, Phase 3, and Phase 4A assignments.

**Architecture:** Replace the bespoke Phase 4B runtime block with shell-builder helpers, normalize saved score data into the shared three-level rubric model, and extend the shared assignment selectors so `#view-phase4b` inherits the same authored visual contract.

**Tech Stack:** Vanilla JS runtime, inline HTML string builders, scoped CSS in `styles.css`, Node test runner via `tsx`

---

### Task 1: Lock the expected Phase 4B contract with a failing test

**Files:**
- Create: `scripts/tests/mentalwellness10-option2-phase4b-assignment.test.ts`
- Modify: `projects/mentalwellness10-option2/workspace/assignment-runtime-main.js`
- Test: `scripts/tests/mentalwellness10-option2-phase4b-assignment.test.ts`

**Step 1: Write the failing test**

Assert that the Phase 4B runtime block contains:

- `Assignment 04B`
- `Visualization Master Blueprint`
- shared shell markers like `p1-step-nav-shell`, `p1-review-grid`, `p1-rubric-shell`
- rubric normalization helper and `/3` score reporting
- shared CSS selectors for `#view-phase4b`

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/mentalwellness10-option2-phase4b-assignment.test.ts`

Expected: FAIL because Phase 4B still uses the older shell and five-point rubric.

### Task 2: Rebuild the Phase 4B runtime

**Files:**
- Modify: `projects/mentalwellness10-option2/workspace/assignment-runtime-main.js`
- Test: `scripts/tests/mentalwellness10-option2-phase4b-assignment.test.ts`

**Step 1: Add shell/rubric helpers**

Add:

- Phase 4B step labels
- three-level rubric scale
- legacy score normalization helper
- shell builder and step markup builders
- updated summary/report generation

**Step 2: Rework init/mount logic**

Update `initP4BDom()` and the `phase4b` mount path so the rebuilt shell is inserted before save/load runs and the new score rows use the shared `phase2-score-row` / `phase2-score-group` contract.

**Step 3: Preserve data compatibility**

Keep `athlete_visualization_master_v1`, backup import/export, and normalize older saved score shapes during populate.

### Task 3: Extend shared assignment styling to Phase 4B

**Files:**
- Modify: `projects/mentalwellness10-option2/workspace/styles.css`
- Test: `scripts/tests/mentalwellness10-option2-phase4b-assignment.test.ts`

**Step 1: Extend shared shell selectors**

Add `#view-phase4b` to the same shared selector groups currently used by Phase 1, Phase 2, Phase 3, and Phase 4A for:

- grid containment
- typography scale
- step nav sizing
- review layout
- rubric table
- field-card wrappers
- mobile step menu treatment

**Step 2: Keep the contract shared**

Do not add a one-off visual system for Phase 4B. Only add selectors or rules that align it with the existing shared shell.

### Task 4: Verify and refresh handoff

**Files:**
- Modify: `docs/ops/ACTIVE_HANDOFF.md`
- Modify: `docs/ops/ARCHIVED_HANDOFFS.md`

**Step 1: Run targeted verification**

Run:

- `node --check projects/mentalwellness10-option2/workspace/assignment-runtime-main.js`
- `npx tsx --test scripts/tests/mentalwellness10-option2-phase4b-assignment.test.ts`
- `npx tsx --test scripts/tests/mentalwellness10-option2-phase2-assignments.test.ts scripts/tests/mentalwellness10-option2-phase3-assignment.test.ts scripts/tests/mentalwellness10-option2-phase4a-assignment.test.ts scripts/tests/mentalwellness10-option2-phase4b-assignment.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`
- `npm run test:e2e:project -- --project mentalwellness10-option2`

**Step 2: Update the active handoff**

Archive the current Phase 4A active handoff and replace it with a Phase 4B handoff that includes:

- summary
- files changed
- verification run
- known risks / follow-up
- source-of-truth location
- fragile areas / drift points
- next prompt assumptions
- exact next command
- exact next file to open
