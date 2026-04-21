# Forensicstudiesoption2 Final Exam And Assignment Lock Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Forensics-only Assignment 8 and Final Exam lock behavior while removing Module 8 content access from the chapter surface.

**Architecture:** Keep the imported course data untouched and layer the special rules into `workspace/main.js`. Track assignment completion in shell local storage, infer completion from embedded assignment final-action clicks, hide Module 8 chapter rendering, and treat the Final Exam as a direct test launcher.

**Tech Stack:** Vanilla JS, same-origin iframe bridge, localStorage, Node test runner

---

### Task 1: Lock The Special Rules With Failing Tests

**Files:**
- Modify: `scripts/tests/forensicstudiesoption2-shell-behavior.test.ts`

**Step 1: Write the failing test**

- Add assertions for:
  - assignment completion state in `main.js`
  - Module 8 chapter filtering
  - Assignment 8 special unlock logic
  - Final Exam direct-test behavior
  - `Open test` replacing `Open quiz`

**Step 2: Run test to verify it fails**

Run:

```bash
npx tsx --test scripts/tests/forensicstudiesoption2-shell-behavior.test.ts
```

Expected: FAIL on the new Forensics-specific contract checks

### Task 2: Add Assignment Completion State

**Files:**
- Modify: `projects/forensicstudiesoption2/workspace/main.js`

**Step 1: Write minimal implementation**

- Extend saved progress with `assignmentComplete`
- Add helpers to:
  - read assignment completion
  - mark assignment completion
  - check whether Assignments 1-7 are complete
  - check whether the pre-final modules are complete

**Step 2: Run test**

Run:

```bash
npx tsx --test scripts/tests/forensicstudiesoption2-shell-behavior.test.ts
```

Expected: some assertions pass, chapter/test label assertions may still fail

### Task 3: Add Same-Origin Assignment Completion Detection

**Files:**
- Modify: `projects/forensicstudiesoption2/workspace/main.js`

**Step 1: Write minimal implementation**

- detect final-action clicks inside embedded assignment iframes
- map those actions to the active assignment id
- mark that assignment complete and rerender progress

**Step 2: Run test**

Run:

```bash
npx tsx --test scripts/tests/forensicstudiesoption2-shell-behavior.test.ts
```

Expected: assignment-completion helper assertions pass

### Task 4: Hide Module 8 Content And Convert Final Exam To Direct Test

**Files:**
- Modify: `projects/forensicstudiesoption2/workspace/main.js`

**Step 1: Write minimal implementation**

- hide `chapter-8` from visible chapter cards
- keep Assignment 8 in the assignments lane
- special-case `chapter-9`/`quiz-9` so the chapter card opens only the test
- rename learner-facing `Open quiz` buttons to `Open test`

**Step 2: Run test**

Run:

```bash
npx tsx --test scripts/tests/forensicstudiesoption2-shell-behavior.test.ts
```

Expected: shell behavior contract turns green

### Task 5: Run Focused Verification

**Files:**
- Modify if needed: `projects/forensicstudiesoption2/workspace/main.js`

**Step 1: Run verification**

Run:

```bash
npx tsx --test scripts/tests/forensicstudiesoption2-shell-behavior.test.ts
npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts
npm.cmd run verify -- --project forensicstudiesoption2
```

Expected: PASS
