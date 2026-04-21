# Forensicstudiesoption2 Module And Assignment Fidelity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `projects/forensicstudiesoption2` mirror the original `projects/forensics` module-card inventory and assignment content contract while preserving the option-2 shell styling.

**Architecture:** Treat `projects/forensics/workspace/main.jsx` plus `projects/forensics/workspace/d2l-map-data.js` as the content authority. Update the option-2 generator so chapter lesson pages use the same filtered content bucket as original Forensics, and assignment lanes use the same synthetic-lab-vs-source-assignment decisions as original Forensics instead of curated fallback summaries. Keep the option-2 shell runtime mostly intact and regenerate `course-data.js` plus chapter pages from the generator.

**Tech Stack:** Node, TypeScript/TSX tests, generated course data JS, static HTML generation

---

### Task 1: Lock The Source Contract With Failing Tests

**Files:**
- Modify: `scripts/tests/forensicstudiesoption2-content.test.ts`
- Test: `scripts/tests/forensicstudiesoption2-shell-behavior.test.ts`
- Reference: `projects/forensics/workspace/main.jsx`
- Reference: `projects/forensics/workspace/d2l-map-data.js`

**Step 1: Write the failing test**

- Add a source-based helper that reproduces the original Forensics lesson filtering rules:
  - drop `Unit Assessments`
  - drop the excluded XML assignment titles per module
  - keep only content resources for chapter lesson pages
  - keep the original synthetic lab assignment title per module for assignments
- Assert:
  - Chapter 1 page contains `Paper Bindle`, `Chain of Custody`, and `Crime Scene Safety`
  - Chapter pages do not contain `Unit Assessments`
  - Chapter pages do not contain filtered XML assignment titles such as `Introduction to Crime Scenes Assignment`
  - Assignment titles in option 2 match original Forensics assignment bucket titles such as `Crime Scene Certification Lab` and `Fingerprint Analysis Interactive Assignment`

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts`

Expected: FAIL because current generated chapter pages still leak `Unit Assessments` and current assignment titles still use raw XML assignment names.

**Step 3: Commit**

```bash
git add scripts/tests/forensicstudiesoption2-content.test.ts
git commit -m "test(forensicstudiesoption2): lock forensics fidelity contract"
```

### Task 2: Rebuild Chapter Lesson Inventory From Original Forensics Rules

**Files:**
- Modify: `scripts/build-forensicstudiesoption2-content.ts`
- Regenerate: `projects/forensicstudiesoption2/workspace/content/chapter-*/index.html`

**Step 1: Write minimal implementation**

- Add helper functions in the generator that mirror the original Forensics filter rules from `main.jsx`:
  - module title classification
  - excluded assignment title sets
  - `Unit Assessments` removal
- Use those helpers before building `lessons` for each chapter page.
- Generate chapter pages from the filtered content bucket only.

**Step 2: Run generator**

Run: `node scripts/build-forensicstudiesoption2-content.ts`

Expected: chapter pages regenerate without `Unit Assessments` lesson cards or leaked assignment-link pages.

**Step 3: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts`

Expected: the chapter-content portion of the test now passes or moves to the next failing assignment assertion.

**Step 4: Commit**

```bash
git add scripts/build-forensicstudiesoption2-content.ts projects/forensicstudiesoption2/workspace/content
git commit -m "fix(forensicstudiesoption2): align module content cards to forensics"
```

### Task 3: Rebuild Assignment Lanes From Original Forensics Assignment Buckets

**Files:**
- Modify: `scripts/build-forensicstudiesoption2-content.ts`
- Regenerate: `projects/forensicstudiesoption2/workspace/course-data.js`

**Step 1: Write minimal implementation**

- Replace the current “one curated lane per module” assignment generation with the original Forensics assignment bucket logic:
  - keep the synthetic lab assignment title for modules 1-8
  - use the original synthetic lab intro HTML from `projects/forensics/workspace/main.jsx`
  - do not surface filtered XML assignment titles as visible option-2 assignment lanes
- Preserve `interactivePath` and `interactiveKey` to the already-copied option-2 assignment runtimes.
- Make lane summaries excerpts of the real intro HTML instead of rewritten summaries.

**Step 2: Run generator**

Run: `node scripts/build-forensicstudiesoption2-content.ts`

Expected: `course-data.js` now titles module assignments like original Forensics and their assignment detail bodies use the original intro content.

**Step 3: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts`

Expected: PASS for assignment title and content fidelity assertions.

**Step 4: Commit**

```bash
git add scripts/build-forensicstudiesoption2-content.ts projects/forensicstudiesoption2/workspace/course-data.js
git commit -m "fix(forensicstudiesoption2): align assignment lanes to forensics"
```

### Task 4: Keep The Option-2 Runtime Compatible With The New Assignment Data

**Files:**
- Modify: `projects/forensicstudiesoption2/workspace/main.js`
- Test: `scripts/tests/forensicstudiesoption2-shell-behavior.test.ts`

**Step 1: Write the failing test**

- Add a focused assertion for the new assignment contract if needed:
  - the shell still renders assignment detail with source HTML content
  - no generic multi-brief filler remains if assignment lanes now carry a single source-faithful intro block

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-shell-behavior.test.ts`

Expected: FAIL only if runtime selectors or content assumptions still expect the old multi-brief structure.

**Step 3: Write minimal implementation**

- Only patch `main.js` if the regenerated data shape requires it.
- Prefer compatibility changes over redesign.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-shell-behavior.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add projects/forensicstudiesoption2/workspace/main.js scripts/tests/forensicstudiesoption2-shell-behavior.test.ts
git commit -m "fix(forensicstudiesoption2): keep shell aligned with fidelity data"
```

### Task 5: Verify And Handoff

**Files:**
- Modify: `docs/ops/ACTIVE_HANDOFF.md`
- Modify: `docs/ops/ARCHIVED_HANDOFFS.md`

**Step 1: Run focused verification**

Run:

```bash
npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts
npx tsx --test scripts/tests/forensicstudiesoption2-shell-behavior.test.ts
npm.cmd run verify -- --project forensicstudiesoption2
```

Expected: all pass

**Step 2: Update handoff docs**

- Record the new source-of-truth:
  - module lesson inventory mirrors original Forensics filter rules
  - assignment titles/content mirror original Forensics assignment bucket content
- Note that `projects/forensics/**` stayed untouched.

**Step 3: Commit**

```bash
git add docs/ops/ACTIVE_HANDOFF.md docs/ops/ARCHIVED_HANDOFFS.md docs/plans/2026-04-21-forensicstudiesoption2-module-assignment-fidelity.md
git commit -m "docs(ops): hand off forensicstudiesoption2 fidelity pass"
```
