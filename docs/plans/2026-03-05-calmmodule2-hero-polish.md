# CALM Module 2 Hero Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refine the `calmmodule2` interactive experience with a focused surface-and-typography polish pass that preserves the current violet clay identity.

**Architecture:** Add a small reusable section-header pattern in `main.jsx`, upgrade shared component styling in workspace component files, and expand `styles.css` with consistent surface and typography tokens. Validate via focused regression tests that the new visual system hooks are present.

**Tech Stack:** React-in-browser JSX, workspace CSS, node:test via `tsx`

---

### Task 1: Add failing hero-polish regression

**Files:**
- Create: `scripts/tests/calmmodule2-hero-polish.test.ts`

**Step 1: Write the failing test**
- Assert that `main.jsx` defines and uses a reusable `SectionHeader` helper.
- Assert that `styles.css` includes the new section/surface polish classes.
- Assert that `KnowledgeDrop.jsx` and `HintToggle.jsx` use the shared polish classes.

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test scripts/tests/calmmodule2-hero-polish.test.ts`
Expected: FAIL because the new hero-polish hooks do not exist yet.

**Step 3: Write minimal implementation**
- Add only the code required for the test to pass.

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test scripts/tests/calmmodule2-hero-polish.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add scripts/tests/calmmodule2-hero-polish.test.ts projects/calmmodule2/workspace/main.jsx projects/calmmodule2/workspace/styles.css projects/calmmodule2/workspace/components/KnowledgeDrop.jsx projects/calmmodule2/workspace/components/HintToggle.jsx
git commit -m "feat: polish calmmodule2 surfaces and headings"
```

### Task 2: Verify existing focused regressions still pass

**Files:**
- Modify: none unless fixes are required

**Step 1: Run money/finish/export regressions**

Run: `node --import tsx --test scripts/tests/calmmodule2-money-section.test.ts`
Expected: PASS.

Run: `node --import tsx --test scripts/tests/calmmodule2-teacher-export.test.ts`
Expected: PASS.

Run: `node --import tsx --test scripts/tests/calmmodule2-finish-cleanup.test.ts`
Expected: PASS.

**Step 2: Commit if fixes are needed**

```bash
git add .
git commit -m "fix: keep calmmodule2 polish regressions green"
```
