# CALM Module 3 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add doc-bundle import support and build `calmmodule3` as a fresh interactive module from the incoming workbook sources.

**Architecture:** Extend the importer so a folder containing only `docx`/`pdf` assets can still generate a starter workspace and indexed references. Then replace that starter workspace with a planner-first React module tailored to the extracted CALM Module 3 content, and run the normal learning/verification pipeline.

**Tech Stack:** TypeScript CLI scripts, React-in-browser JSX workspace, `mammoth`, `pdf-parse`, node:test via `tsx`

---

### Task 1: Add failing regression for doc-bundle import support

**Files:**
- Create: `scripts/tests/doc-bundle-import.test.ts`

**Step 1: Write the failing test**
- Assert that importing a temp folder containing only a `.docx` and `.pdf` bundle succeeds.
- Assert that the generated project has:
  - `workspace/index.html`
  - `references/raw` copies of the source docs
  - `references/extracted` output

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test scripts/tests/doc-bundle-import.test.ts`
Expected: FAIL because the importer still rejects non-html bundles.

**Step 3: Write minimal implementation**
- Upgrade `scripts/lib/importer.ts` only as far as needed to scaffold a doc-first project.

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test scripts/tests/doc-bundle-import.test.ts`
Expected: PASS.

### Task 2: Import calm 3 as calmmodule3

**Files:**
- Generated under: `projects/calmmodule3/**`

**Step 1: Run import**

Run: `npm run import -- "projects/_incoming/calm 3" --slug calmmodule3 --force`
Expected: PASS and generate the project scaffold plus references.

**Step 2: Inspect extracted references**
- Read the generated `prompt-pack`, reference index, and extracted text to guide the workspace build.

### Task 3: Build the first calmmodule3 workspace

**Files:**
- Modify: `projects/calmmodule3/workspace/index.html`
- Modify: `projects/calmmodule3/workspace/main.jsx`
- Modify: `projects/calmmodule3/workspace/styles.css`

**Step 1: Replace starter shell with planner-first module**
- Build the new section flow and interactive planner blocks.

**Step 2: Keep teacher export and progress patterns**
- Reuse proven report/progress logic where it fits the new module.

**Step 3: Run analysis and references**

Run:
- `npm run refs -- --project calmmodule3`
- `npm run analyze -- --project calmmodule3`

Expected: PASS and refresh prompt pack / pattern bank.

### Task 4: Verify project readiness

**Files:**
- Modify only if fixes are needed

**Step 1: Run tests and verification**

Run:
- `node --import tsx --test scripts/tests/doc-bundle-import.test.ts`
- `npm run verify -- --project calmmodule3`

Expected: PASS.
