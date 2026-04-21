# Forensic Studies Option 2 Full Cloud Save Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `forensicstudiesoption2` persist all learner work incrementally and export with an explicit Google-hosted tracked storage key list so Firebase autosave/restoration covers the full course.

**Architecture:** Add explicit project-level storage key metadata, add local persistence to each assignment that currently lacks it, then update Google-hosted export to honor explicit keys before falling back to source detection. Verify with failing-first tests, project verify, and project E2E.

**Tech Stack:** Vanilla JS, React, inline HTML assignment runtimes, Node/TypeScript export pipeline, Firebase-hosted export bridge, tsx tests.

---

### Task 1: Lock the explicit tracked-key contract with failing tests

**Files:**
- Modify: `scripts/tests/google-hosted-export.test.ts`
- Create or modify: `scripts/tests/forensicstudiesoption2-content.test.ts`
- Modify: `projects/forensicstudiesoption2/meta/project.json`

**Step 1: Write the failing test**

- Assert that Google-hosted export for `forensicstudiesoption2` uses the explicit tracked key list from project metadata.
- Assert the expected key list includes shell progress plus assignments 1-8.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts scripts/tests/forensicstudiesoption2-content.test.ts`

Expected: fail because metadata-first tracked key support does not exist yet and assignment coverage is incomplete.

**Step 3: Add minimal metadata contract**

- Add the explicit tracked storage key list in `projects/forensicstudiesoption2/meta/project.json`.

**Step 4: Re-run the failing test**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts scripts/tests/forensicstudiesoption2-content.test.ts`

Expected: still fail until export and assignment persistence code is added.

### Task 2: Make Google-hosted export honor explicit metadata keys

**Files:**
- Modify: `scripts/lib/exports/google-hosted.ts`
- Modify if needed: `scripts/lib/projects.ts`
- Test: `scripts/tests/google-hosted-export.test.ts`

**Step 1: Write the failing export assertion**

- Assert that when a project metadata file declares explicit tracked storage keys, export writes those keys into `google-hosted-bridge.js`.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts`

Expected: fail because export still uses source detection only.

**Step 3: Write minimal implementation**

- Read project metadata during export.
- If explicit Google-hosted tracked storage keys exist, use them.
- Otherwise keep current fallback detection.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts`

Expected: pass.

### Task 3: Add incremental persistence to assignment 2

**Files:**
- Modify: `projects/forensicstudiesoption2/workspace/assignments/module2assignment-app.jsx`
- Test: `scripts/tests/forensicstudiesoption2-content.test.ts`

**Step 1: Write the failing test**

- Assert assignment 2 defines a stable storage key and uses load/save localStorage calls.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts`

Expected: fail.

**Step 3: Write minimal implementation**

- Add `MODULE2_ASSIGNMENT_STORAGE_KEY`.
- Load saved state on init.
- Save state on relevant changes.

**Step 4: Re-run test**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts`

Expected: pass for assignment 2 coverage.

### Task 4: Add incremental persistence to assignment 3

**Files:**
- Modify: `projects/forensicstudiesoption2/workspace/assignments/module3assignment-app.jsx`
- Test: `scripts/tests/forensicstudiesoption2-content.test.ts`

**Step 1: Write the failing test**

- Assert assignment 3 defines a stable storage key and persists learner work.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts`

Expected: fail.

**Step 3: Write minimal implementation**

- Add a stable localStorage key.
- Persist answers, selected suspect, active tab, and relevant learner state.

**Step 4: Re-run test**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts`

Expected: pass for assignment 3 coverage.

### Task 5: Add incremental persistence to assignment 4

**Files:**
- Modify: `projects/forensicstudiesoption2/workspace/assignments/module4assignment.html`
- Test: `scripts/tests/forensicstudiesoption2-content.test.ts`

**Step 1: Write the failing test**

- Assert assignment 4 contains a stable storage key and an inline restore/save helper.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts`

Expected: fail.

**Step 3: Write minimal implementation**

- Add a storage key constant.
- Save all `textarea` and `select` values on change.
- Restore values on load.
- Persist active module selection if present.

**Step 4: Re-run test**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts`

Expected: pass for assignment 4 coverage.

### Task 6: Add incremental persistence to assignments 5 and 6

**Files:**
- Modify: `projects/forensicstudiesoption2/workspace/assignments/module5assignment.jsx`
- Modify: `projects/forensicstudiesoption2/workspace/assignments/module6assignment-app.jsx`
- Test: `scripts/tests/forensicstudiesoption2-content.test.ts`

**Step 1: Write the failing test**

- Assert assignments 5 and 6 define stable storage keys and persist learner state.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts`

Expected: fail.

**Step 3: Write minimal implementation**

- Add storage keys.
- Add load-on-init and save-on-change logic.

**Step 4: Re-run test**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts`

Expected: pass.

### Task 7: Audit assignments 1, 7, and 8 for full persistence coverage

**Files:**
- Modify: `projects/forensicstudiesoption2/workspace/assignments/module1assignment-app.jsx`
- Modify: `projects/forensicstudiesoption2/workspace/assignments/module7assignment-app.jsx`
- Modify: `projects/forensicstudiesoption2/workspace/assignments/module8assignment-app.jsx`
- Test: `scripts/tests/forensicstudiesoption2-content.test.ts`

**Step 1: Write the failing test**

- Assert the persisted assignments expose stable storage keys and save calls.

**Step 2: Run test to verify it fails if any gap remains**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts`

Expected: fail if coverage is incomplete.

**Step 3: Write minimal implementation**

- Expand saved slices only where needed to cover learner work.

**Step 4: Re-run test**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts`

Expected: pass.

### Task 8: Add project E2E contract if missing and verify

**Files:**
- Create or modify: `projects/forensicstudiesoption2/meta/e2e-contract.json`
- Modify selectors only if needed in workspace files

**Step 1: Write the failing run expectation**

- Run project E2E and let it fail if the contract is missing or selectors are insufficient.

**Step 2: Run test to verify it fails**

Run: `npm.cmd run test:e2e:project -- --project forensicstudiesoption2`

Expected: fail fast if contract/selectors are missing.

**Step 3: Write minimal implementation**

- Add the project E2E contract and any required stable selectors.

**Step 4: Re-run**

Run: `npm.cmd run test:e2e:project -- --project forensicstudiesoption2`

Expected: pass.

### Task 9: Run full verification and prepare export

**Files:**
- Modify if needed: `docs/ops/ACTIVE_HANDOFF.md`
- Modify if needed: `docs/ops/ARCHIVED_HANDOFFS.md`

**Step 1: Run targeted tests**

Run:
- `npx tsx --test scripts/tests/google-hosted-export.test.ts`
- `npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts`
- `npx tsx --test scripts/tests/forensicstudiesoption2-shell-behavior.test.ts`
- `npx tsx --test scripts/tests/forensicstudiesoption2-theme.test.ts`

Expected: all pass.

**Step 2: Run project verification**

Run: `npm.cmd run verify -- --project forensicstudiesoption2`

Expected: pass.

**Step 3: Run project E2E**

Run: `npm.cmd run test:e2e:project -- --project forensicstudiesoption2`

Expected: pass.

**Step 4: Export readiness**

Run: `npm.cmd run export:google-hosted -- --project forensicstudiesoption2`

Expected: export completes and writes `google-hosted-bridge.js` with the full tracked key list.
