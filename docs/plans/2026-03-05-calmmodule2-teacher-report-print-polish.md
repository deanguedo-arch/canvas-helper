# CALM Module 2 Teacher Report Print Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve the `calmmodule2` teacher export so the printed/PDF report is faster to grade and more polished on paper.

**Architecture:** Keep the export inside `projects/calmmodule2/workspace/main.jsx`, but add a compact top summary, a tighter budget comparison table, stronger empty-answer states, and more print-focused CSS. Lock the behavior with a focused regression test that checks for the new print-polish hooks.

**Tech Stack:** React-in-browser JSX, template-literal HTML export, node:test via `tsx`

---

### Task 1: Add failing teacher-report print-polish regression

**Files:**
- Create: `scripts/tests/calmmodule2-teacher-report-print-polish.test.ts`

**Step 1: Write the failing test**
- Assert that the teacher export includes:
  - a summary block near the top
  - a budget comparison table
  - print-specific empty-answer styling

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test scripts/tests/calmmodule2-teacher-report-print-polish.test.ts`
Expected: FAIL because the new report hooks are not present yet.

**Step 3: Write minimal implementation**
- Update only the teacher export template and helpers in `projects/calmmodule2/workspace/main.jsx`.

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test scripts/tests/calmmodule2-teacher-report-print-polish.test.ts`
Expected: PASS.

### Task 2: Verify existing export regressions still pass

**Files:**
- Modify: none unless a fix is required

**Step 1: Run focused regressions**

Run: `node --import tsx --test scripts/tests/calmmodule2-teacher-export.test.ts`
Expected: PASS.

Run: `node --import tsx --test scripts/tests/calmmodule2-money-section.test.ts`
Expected: PASS.

Run: `node --import tsx --test scripts/tests/calmmodule2-finish-cleanup.test.ts`
Expected: PASS.
