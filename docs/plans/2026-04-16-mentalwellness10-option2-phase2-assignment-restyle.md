# Mental Wellness Option 2 Phase 2 Assignment Restyle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restyle `2A` and `2B` so they use the Phase 1 assignment shell, typography, and review architecture while preserving the current Phase 2 fields and logic.

**Architecture:** The live Phase 2 assignment UI is generated in `assignment-runtime-main.js`, so the restyle should happen there rather than in the dormant static HTML. Reuse the existing Phase 1 class vocabulary and extend the Phase 1 CSS selectors in `styles.css` so the same shell styling applies to `#view-values` and `#view-master`.

**Tech Stack:** Vanilla JS runtime templates, Tailwind utility classes in authored markup, repo-local CSS in `styles.css`, Node test runner string-contract tests.

---

### Task 1: Lock the restyle contract with tests

**Files:**
- Modify: `scripts/tests/mentalwellness10-option2-phase2-assignments.test.ts`

**Step 1: Write the failing test**

- Add a test that asserts the Phase 2 runtime contains:
  - `Assignment 02`
  - `p1-phase-subtitle`
  - `p1-step-nav`
  - `p1-step-btn`
  - `grid gap-5 xl:grid-cols-[1.15fr_0.85fr] p1-review-grid`
  - `rounded-2xl border border-slate-700 bg-slate-900/75 p-5`

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/mentalwellness10-option2-phase2-assignments.test.ts`

**Step 3: Write minimal implementation**

- Rebuild the live Phase 2 header and step markup in `assignment-runtime-main.js`.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/mentalwellness10-option2-phase2-assignments.test.ts`

### Task 2: Rebuild the live Phase 2 shell

**Files:**
- Modify: `projects/mentalwellness10-option2/workspace/assignment-runtime-main.js`

**Step 1: Rewrite the values header and steps**

- Replace the current incremental `2A` shell with:
  - Phase 1-style hero
  - Phase 1-style step nav
  - Phase 1-style cards for steps 0-4

**Step 2: Rewrite the master-config header and steps**

- Replace the current `2B` shell with the same Phase 1-style structure.

**Step 3: Update review scoring containers**

- Render `2A` / `2B` audit items as Phase 1-style audit cards rather than the older compact generic rows.

### Task 3: Extend Phase 1 shell CSS into Phase 2

**Files:**
- Modify: `projects/mentalwellness10-option2/workspace/styles.css`

**Step 1: Extend the existing Phase 1 shell selector blocks**

- Apply the `p1-phase-subtitle`, `p1-step-nav-shell`, `p1-step-btn`, `p1-review-grid`, and `p1-rubric-*` styling to `#view-values` and `#view-master`.

**Step 2: Keep the current summary-preview fix intact**

- Do not reintroduce flex layout in the summary cards.

### Task 4: Verification

**Files:**
- Modify if needed: `docs/ops/ACTIVE_HANDOFF.md`

**Step 1: Run targeted tests**

Run: `npx tsx --test scripts/tests/mentalwellness10-option2-phase2-assignments.test.ts`

**Step 2: Run syntax check**

Run: `node --check projects/mentalwellness10-option2/workspace/assignment-runtime-main.js`

**Step 3: Run project E2E gate**

Run: `npm run test:e2e:project -- --project mentalwellness10-option2`

**Step 4: Update active handoff**

- Record that the Phase 2 restyle now follows the Phase 1 shell language and that the live source of truth remains `assignment-runtime-main.js`.
