# SCORM Suspend Resume Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make exported SCORM packages preserve learner state in Brightspace by using an explicit suspend flow instead of relying only on browser unload events.

**Architecture:** Keep the fix inside the SCORM export/runtime path. Extend the generated bridge script so it writes suspend metadata (`cmi.exit`, incomplete status, commit/terminate flow) and expose an explicit save-and-exit action in exported packages, without rewriting project workspace code.

**Tech Stack:** TypeScript, Node.js, tsx test runner, exported browser runtime, SCORM 2004/1.2 bridge logic

---

### Task 1: Lock the expected suspend behavior in tests

**Files:**
- Modify: `scripts/tests/scorm-export.test.ts`
- Reference: `scripts/lib/scorm.ts`

**Step 1: Write the failing test**

Add assertions that the generated bridge script:
- sets `cmi.exit` to `suspend`
- sets incomplete status for SCORM 2004
- exposes an explicit save-and-exit control/action

**Step 2: Run test to verify it fails**

Run: `npm.cmd run test:scorm`
Expected: FAIL because the current bridge does not emit the suspend semantics or explicit exit action.

**Step 3: Commit**

```bash
git add scripts/tests/scorm-export.test.ts
git commit -m "test(scorm): cover suspend resume flow"
```

### Task 2: Implement explicit suspend semantics in the bridge

**Files:**
- Modify: `scripts/lib/scorm.ts`

**Step 1: Write minimal implementation**

Update the generated bridge runtime so it:
- initializes completion state defensively
- writes `cmi.exit = "suspend"` before final commit/terminate
- provides explicit `save`, `saveAndExit`, and `flush` helpers
- injects a small save-and-exit affordance into exported SCORM pages only

**Step 2: Run tests to verify they pass**

Run: `npm.cmd run test:scorm`
Expected: PASS

**Step 3: Commit**

```bash
git add scripts/lib/scorm.ts scripts/tests/scorm-export.test.ts
git commit -m "fix(scorm): suspend learner state on explicit exit"
```

### Task 3: Verify export integration and regenerate packages

**Files:**
- Reference: `scripts/lib/exporter.ts`
- Generated output: `projects/calm3new/exports/**`
- Generated output: `projects/calm-module/exports/**`
- Generated output: `projects/calmmodule2/exports/**`

**Step 1: Run focused verification**

Run:
- `npm.cmd run test:scorm`
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`

Expected: all PASS

**Step 2: Regenerate SCORM packages**

Run:
- `npm.cmd run export:scorm -- --project calm3new --version 2004`
- `npm.cmd run export:scorm -- --project calm3new --version 1.2`
- `npm.cmd run export:scorm -- --project calm-module --version 2004`
- `npm.cmd run export:scorm -- --project calmmodule2 --version 2004`

Expected: fresh zip packages and updated export folders for LMS validation

**Step 3: Capture follow-up**

Document that Brightspace validation must use the explicit save-and-exit flow before closing the SCO.
