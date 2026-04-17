# Mental Wellness Option 2 Phase 3 Assignment Parity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the Phase 3 focus assignment to the shared Phase 1/Phase 2 shell, scoring, and print contract without changing unrelated assignments.

**Architecture:** The work stays inside the existing imported runtime. Phase 3 will be rebuilt in `assignment-runtime-main.js` using the same runtime-shell pattern Phase 2 now uses, then the shared sizing and field-card CSS will be extended to `#view-phase3`. Regression coverage will lock the shell copy, rubric scale, and sizing selectors before and after implementation.

**Tech Stack:** Plain HTML runtime strings, browser DOM APIs, localStorage persistence, scoped CSS, Node test runner, Playwright project-contract E2E.

---

### Task 1: Add the failing Phase 3 regression test

**Files:**
- Create: `scripts/tests/mentalwellness10-option2-phase3-assignment.test.ts`
- Modify: none

**Step 1: Write the failing test**

- Assert that the Phase 3 runtime contains:
  - `Assignment 03`
  - `Focus Master Blueprint`
  - `p1-step-nav-shell`
  - `p1-review-grid`
  - `p1-rubric-table`
- Assert that the Phase 3 review uses a `3`-level scale rather than `5`
- Assert that Phase 3 joins the shared sizing and field-card selectors in `styles.css`

**Step 2: Run test to verify it fails**

Run:

```bash
npx tsx --test scripts/tests/mentalwellness10-option2-phase3-assignment.test.ts
```

Expected: FAIL because the current runtime still uses the older Phase 3 shell and five-point scoring.

### Task 2: Rebuild the Phase 3 runtime

**Files:**
- Modify: `projects/mentalwellness10-option2/workspace/assignment-runtime-main.js`

**Step 1: Write the minimal implementation**

- Add a Phase 3 rubric scale helper and legacy-score normalization helper
- Replace the old Phase 3 shell with Phase 1-style shell builders and authored step markup
- Keep the existing concentration concepts but align labels and copy to the `main.js` contract
- Update save/load, summary, review, and print logic to the new shell and three-level rubric

**Step 2: Run the Phase 3 test**

Run:

```bash
npx tsx --test scripts/tests/mentalwellness10-option2-phase3-assignment.test.ts
```

Expected: PASS once the runtime matches the new shell and scoring model.

### Task 3: Extend the shared shell styling to Phase 3

**Files:**
- Modify: `projects/mentalwellness10-option2/workspace/styles.css`

**Step 1: Write the minimal implementation**

- Extend the shared assignment shell size selectors to include `#view-phase3`
- Add Phase 3 field-card wrappers and score-row/score-group handling where needed
- Keep the existing project palette and typography rules consistent with Phase 1/2

**Step 2: Re-run the targeted test**

Run:

```bash
npx tsx --test scripts/tests/mentalwellness10-option2-phase3-assignment.test.ts
```

Expected: PASS with the style assertions satisfied.

### Task 4: Validate the assignment end to end

**Files:**
- Modify: `docs/ops/ACTIVE_HANDOFF.md`

**Step 1: Run syntax and E2E verification**

Run:

```bash
node --check projects/mentalwellness10-option2/workspace/assignment-runtime-main.js
npm run test:e2e:project -- --project mentalwellness10-option2
```

Expected: PASS

**Step 2: Update the handoff**

- Record the Phase 3 parity pass, source of truth, known risks, and next validation steps in `docs/ops/ACTIVE_HANDOFF.md`

**Step 3: Final verification**

Run:

```bash
npx tsx --test scripts/tests/mentalwellness10-option2-phase3-assignment.test.ts
```

Expected: PASS and ready for manual Studio review.
