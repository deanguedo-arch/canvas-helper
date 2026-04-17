# World Religions 30 Option 1 Chapter 1 Assignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the Chapter 1 `Religion in Popular Culture` interactive assignment to `worldreligions30-option1` as an in-site assignment experience instead of a placeholder lane.

**Architecture:** Rebuild the provided React assignment source as a project-local HTML/CSS/JS runtime under `workspace/assignments/`, then wire Chapter 1 assignment metadata and detail rendering in `workspace/main.js` so the runtime launches from inside the World Religions course shell.

**Tech Stack:** Vanilla HTML, vanilla JS, scoped CSS, existing `worldreligions30-option1` course runtime, Node test runner via `tsx`

---

### Task 1: Lock the Chapter 1 assignment contract with a failing test

**Files:**
- Create: `scripts/tests/worldreligions30-option1-assignment1.test.ts`
- Modify: `projects/worldreligions30-option1/workspace/main.js`
- Test: `scripts/tests/worldreligions30-option1-assignment1.test.ts`

**Step 1: Write the failing test**

Assert that `projects/worldreligions30-option1/workspace/main.js` contains:

- authored Chapter 1 assignment metadata
- a real launch path for Assignment 1
- a branch in `renderAssignmentDetail()` for the authored Chapter 1 assignment
- an `Open interactive assignment` button or equivalent launch action

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/worldreligions30-option1-assignment1.test.ts`

Expected: FAIL because Assignment 1 is still a placeholder lane.

### Task 2: Create the local Chapter 1 assignment runtime

**Files:**
- Create: `projects/worldreligions30-option1/workspace/assignments/chapter1interactive.html`
- Create: `projects/worldreligions30-option1/workspace/assignments/chapter1interactive.css`
- Create: `projects/worldreligions30-option1/workspace/assignments/chapter1interactive.js`
- Reference only: `canvas code and references/World Religions/assingments/chapter1interactive`

**Step 1: Translate the source structure**

Rebuild the React component as plain HTML/JS while preserving:

- six-step navigation
- core fields
- stance selection
- final folio summary state

**Step 2: Add scoped persistence**

Use a project-local storage key such as:

- `worldreligions30-option1.assignment.chapter1interactive`

Persist:

- current step
- all text inputs
- stance selection

**Step 3: Keep the runtime visually aligned**

Use the Option 1 visual language:

- `Noto Serif`
- `Manrope`
- warm paper palette
- archival gold accents

Do not import React or add a new build step.

### Task 3: Wire Assignment 1 into the course shell

**Files:**
- Modify: `projects/worldreligions30-option1/workspace/main.js`
- Modify: `projects/worldreligions30-option1/workspace/styles.css`
- Test: `scripts/tests/worldreligions30-option1-assignment1.test.ts`

**Step 1: Author Chapter 1 assignment metadata**

Update `getAssignments()` so Chapter 1 has:

- authored summary
- assignment launch path
- an explicit marker that it is the interactive assignment

Leave the remaining assignments as placeholders.

**Step 2: Replace the Chapter 1 placeholder detail**

Update `renderAssignmentDetail()` so Assignment 1 renders:

- authored summary copy
- `Open chapter PDF`
- `Open quiz`
- `Open interactive assignment`
- `Back to assignments`

**Step 3: Embed or launch inside the site**

Use an in-site delivery path:

- embedded iframe in the assignment detail, or
- course-owned overlay frame

Prefer the smallest change that keeps the learner inside the course shell.

**Step 4: Add shell styling**

Add only the CSS needed for:

- assignment runtime frame/panel
- assignment actions
- assignment detail spacing

Do not redesign the rest of the course shell.

### Task 4: Verify the full World Religions Option 1 path

**Files:**
- Modify: `docs/ops/ACTIVE_HANDOFF.md` if stopping after implementation

**Step 1: Run targeted checks**

Run:

- `npx tsx --test scripts/tests/worldreligions30-option1-assignment1.test.ts`
- `npx tsx --test scripts/tests/worldreligions30-option1-written-response.test.ts scripts/tests/worldreligions30-variants.test.ts scripts/tests/worldreligions30-option1-assignment1.test.ts`
- `node --check projects/worldreligions30-option1/workspace/main.js`
- `node --check projects/worldreligions30-option1/workspace/assignments/chapter1interactive.js`
- `npm.cmd run build:studio`
- `npm.cmd run test:e2e:project -- --project worldreligions30-option1`

**Step 2: Refresh handoff if pausing**

If implementation stops before another task starts, update:

- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

Keep the handoff scoped to `worldreligions30-option1`.
