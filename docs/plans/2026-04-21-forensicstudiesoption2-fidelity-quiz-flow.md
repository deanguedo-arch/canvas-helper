# Forensic Studies Option 2 Fidelity and Quiz Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `forensicstudiesoption2` mirror Forensics more strictly by removing synthetic helper panels, rendering assignment instructions from source-faithful content, and changing quiz actions so `Generate Results` is the gate that unlocks `Check Answers` and `Retake Quiz`.

**Architecture:** Keep the option-2 shell and styling, but move assignment detail rendering closer to the original Forensics assignment surfaces by storing source-faithful instruction HTML in generated course data and rendering that directly. Simplify generated chapter pages so they only carry retained lesson content, not added assessment/helper sections. Update quiz state handling in the shell runtime so `quizComplete` is set by generating results rather than a separate `Mark Complete` action.

**Tech Stack:** Static HTML, browser-side JavaScript, generated `course-data.js`, `tsx` tests.

---

### Task 1: Lock the new quiz-action contract with tests

**Files:**
- Modify: `scripts/tests/forensicstudiesoption2-shell-behavior.test.ts`

**Step 1: Write the failing test**
- Assert `Mark complete` no longer appears in `workspace/main.js`.
- Assert `Generate Results` remains present.
- Assert `Check Answers` and `Retake Quiz` are disabled until results are generated.
- Assert the runtime stores completion through the generate-results path instead of a standalone mark-complete path.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-shell-behavior.test.ts`
Expected: FAIL because the runtime still has `Mark complete` and generate-results is not the gating action.

### Task 2: Lock strict Forensics content fidelity with tests

**Files:**
- Modify: `scripts/tests/forensicstudiesoption2-content.test.ts`

**Step 1: Write the failing test**
- Assert generated assignment brief data includes source-faithful instruction HTML rather than only summary/task/reminder cards.
- Assert chapter pages no longer render the synthetic `Assignments and quizzes` / `Assessment Lane` helper section.
- Assert chapter pages no longer render synthetic metric cards that are not part of the original Forensics module flow.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts`
Expected: FAIL because generated data/pages still contain synthetic helper surfaces.

### Task 3: Change quiz state handling in the shell

**Files:**
- Modify: `projects/forensicstudiesoption2/workspace/main.js`

**Step 1: Update the state flow**
- Remove the `Mark complete` action from authored quiz detail.
- Make `Generate Results` set `quizComplete`, stamp completion time, and open the report.
- Keep `Check Answers` and `Retake Quiz` disabled until results have been generated.

**Step 2: Update status copy**
- Keep the surface readable without introducing new non-Forensics helper text.

### Task 4: Replace assignment helper cards with source-faithful instructions

**Files:**
- Modify: `scripts/build-forensicstudiesoption2-content.ts`
- Modify: `projects/forensicstudiesoption2/workspace/main.js`

**Step 1: Generate assignment instruction payloads**
- Add source-faithful instruction HTML and any supporting individualized/identified fields to generated assignment brief data.
- Base the content on the original Forensics assignment XML or the authored Forensics fallback content already preserved in `projects/forensics/workspace/main.jsx`.

**Step 2: Render the source-faithful instructions**
- Replace summary/task/reminder cards in assignment detail with instruction blocks that read like the original Forensics assignment surfaces.

### Task 5: Remove synthetic chapter helper sections

**Files:**
- Modify: `scripts/build-forensicstudiesoption2-content.ts`

**Step 1: Simplify generated chapter pages**
- Remove `Assessment Lane`, assignment/quiz cards, and synthetic metrics from chapter pages.
- Leave the chapter shell focused on retained lesson content only.

### Task 6: Regenerate and verify

**Files:**
- Generated outputs only under `projects/forensicstudiesoption2/workspace/**`

**Step 1: Regenerate**

Run: `npx tsx scripts/build-forensicstudiesoption2-content.ts`

**Step 2: Run targeted tests**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-shell-behavior.test.ts scripts/tests/forensicstudiesoption2-content.test.ts`
Expected: PASS

**Step 3: Run project verification**

Run: `npm.cmd run verify -- --project forensicstudiesoption2`
Expected: PASS with only known external dependency warnings
