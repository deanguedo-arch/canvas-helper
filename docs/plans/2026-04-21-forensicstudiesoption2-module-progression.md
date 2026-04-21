# Forensicstudiesoption2 Module Progression Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add module-card completion controls and unlock each module’s quiz and assignment only after all lesson cards in that module are marked complete.

**Architecture:** The parent shell stores module component progress in local storage and decides unlock state. Generated chapter iframes render all lesson cards, blur later cards until reached, and report completion events back to the shell through a small message bridge.

**Tech Stack:** Vanilla JS, generated HTML/CSS, localStorage, iframe `postMessage`, Node test runner, project generator script

---

### Task 1: Lock The New Contract With Failing Tests

**Files:**
- Modify: `scripts/tests/forensicstudiesoption2-shell-behavior.test.ts`
- Modify: `scripts/tests/forensicstudiesoption2-content.test.ts`

**Step 1: Write the failing test**

- Add shell assertions for:
  - module-component progress state in `main.js`
  - module-based unlock helpers
  - message listener support for chapter progress
- Add content assertions for:
  - generated chapter metadata includes component ids/count
  - generated chapter pages include `Mark Complete`
  - generated chapter pages include `Mark Complete + Next`
  - generated chapter pages include locked-state hooks

**Step 2: Run test to verify it fails**

Run:

```bash
npx tsx --test scripts/tests/forensicstudiesoption2-shell-behavior.test.ts
npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts
```

Expected: FAIL on the new module progression assertions

**Step 3: Commit**

```bash
git add scripts/tests/forensicstudiesoption2-shell-behavior.test.ts scripts/tests/forensicstudiesoption2-content.test.ts
git commit -m "test(forensicstudiesoption2): lock module progression contract"
```

### Task 2: Add Generated Component Metadata

**Files:**
- Modify: `scripts/build-forensicstudiesoption2-content.ts`

**Step 1: Write minimal implementation**

- Add stable lesson component ids for each generated lesson card
- Persist chapter-level component metadata into generated course data:
  - `componentIds`
  - `componentCount`

**Step 2: Regenerate outputs**

Run:

```bash
node scripts/build-forensicstudiesoption2-content.ts
```

**Step 3: Run tests to verify progress**

Run:

```bash
npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts
```

Expected: content contract moves closer to green, shell tests may still fail

**Step 4: Commit**

```bash
git add scripts/build-forensicstudiesoption2-content.ts projects/forensicstudiesoption2/workspace/course-data.js
git commit -m "feat(forensicstudiesoption2): generate module component metadata"
```

### Task 3: Add Chapter Card Completion Controls And Locking UI

**Files:**
- Modify: `scripts/build-forensicstudiesoption2-content.ts`
- Modify: `projects/forensicstudiesoption2/workspace/content/module-index.css`

**Step 1: Write minimal implementation**

- Render lesson cards with:
  - stable component id attributes
  - completion footer
  - `Mark Complete`
  - `Mark Complete + Next`
  - locked/active/complete state hooks
- Add chapter-page script to:
  - receive synced completion state from parent
  - apply blurred lock states
  - emit completion events
  - advance focus on `Mark Complete + Next`

**Step 2: Regenerate outputs**

Run:

```bash
node scripts/build-forensicstudiesoption2-content.ts
```

**Step 3: Run tests**

Run:

```bash
npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts
```

Expected: chapter-page progression tests pass

**Step 4: Commit**

```bash
git add scripts/build-forensicstudiesoption2-content.ts projects/forensicstudiesoption2/workspace/content/module-index.css projects/forensicstudiesoption2/workspace/content/chapter-*
git commit -m "feat(forensicstudiesoption2): add chapter card progression controls"
```

### Task 4: Replace Quiz-Order Unlocking In The Shell

**Files:**
- Modify: `projects/forensicstudiesoption2/workspace/main.js`
- Modify: `projects/forensicstudiesoption2/workspace/styles.css`

**Step 1: Write minimal implementation**

- Extend saved progress with module component completion storage
- Add helpers:
  - `getModuleComponentState`
  - `isModuleComplete`
  - `getNextIncompleteComponentId`
- Change unlock behavior:
  - chapters remain openable
  - quiz unlocks from module completion
  - assignment unlocks from module completion
- Add iframe message handling:
  - sync child progress on frame load
  - persist completion updates from child
  - rerender shell state when module completion changes

**Step 2: Run shell tests**

Run:

```bash
npx tsx --test scripts/tests/forensicstudiesoption2-shell-behavior.test.ts
```

Expected: shell unlock contract turns green

**Step 3: Commit**

```bash
git add projects/forensicstudiesoption2/workspace/main.js projects/forensicstudiesoption2/workspace/styles.css
git commit -m "feat(forensicstudiesoption2): unlock quizzes and assignments from module completion"
```

### Task 5: Run Final Focused Verification

**Files:**
- Modify if needed: `docs/ops/ACTIVE_HANDOFF.md`
- Modify if needed: `docs/ops/ARCHIVED_HANDOFFS.md`

**Step 1: Run focused verification**

Run:

```bash
npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts
npx tsx --test scripts/tests/forensicstudiesoption2-shell-behavior.test.ts
npm.cmd run verify -- --project forensicstudiesoption2
```

Expected: PASS

**Step 2: Update handoff**

- record the new module progression source of truth
- note that quizzes/assignments now unlock from module component completion

**Step 3: Commit**

```bash
git add docs/ops/ACTIVE_HANDOFF.md docs/ops/ARCHIVED_HANDOFFS.md
git commit -m "docs(ops): hand off module progression contract"
```
