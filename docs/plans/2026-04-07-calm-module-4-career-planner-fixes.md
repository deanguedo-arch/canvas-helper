# CALM Module 4 Career Planner Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the Career Planner input focus-loss bug and make the header/actions/topics layout fit cleanly across the current workspace width.

**Architecture:** Keep the fix inside the existing project-local career planner component. Stop the one-character input bug by hoisting inline component definitions out of the `App` render path so React stops remounting the input tree on every keystroke, then make the header/actions/topics region wrap intentionally instead of forcing a single-row layout.

**Tech Stack:** React-in-browser JSX, Tailwind utility classes, `node:test` with targeted source assertions, Google Hosted export/deploy.

---

### Task 1: Add focused regression tests

**Files:**
- Modify: `scripts/tests/calm-module-4-workspace.test.ts`
- Test: `scripts/tests/calm-module-4-workspace.test.ts`

**Step 1: Write the failing test**

Add assertions that:
- `projects/calm-module-4/workspace/components/careerplanning.reference.jsx` defines `InputGroup` and `SectionCard` before `App`.
- the Career Planner top bar uses a wrapping header layout and topic buttons no longer force `whitespace-nowrap`.

**Step 2: Run test to verify it fails**

Run: `.\node_modules\.bin\tsx.cmd --test scripts/tests/calm-module-4-workspace.test.ts`

Expected: FAIL because the current component keeps helper components inside `App` and uses a cramped header/topic layout.

### Task 2: Apply the minimal component fix

**Files:**
- Modify: `projects/calm-module-4/workspace/components/careerplanning.reference.jsx`

**Step 1: Write minimal implementation**

Change only the Career Planner component file to:
- hoist `InputGroup` and `SectionCard` to top-level component declarations
- pass `isActive` into `SectionCard` instead of closing over `activeSection`
- let the top header/action area wrap
- keep the report button visible
- allow topic buttons to wrap their labels cleanly instead of forcing one-line pills

**Step 2: Run test to verify it passes**

Run: `.\node_modules\.bin\tsx.cmd --test scripts/tests/calm-module-4-workspace.test.ts`

Expected: PASS

### Task 3: Verify, export, and deploy

**Files:**
- Modify: `projects/calm-module-4/workspace/main.js`
- Modify: `projects/calm-module-4/exports/google-hosted/**` via export/deploy tooling

**Step 1: Rebuild the workspace runtime**

Run: `.\node_modules\.bin\esbuild.cmd projects/calm-module-4/workspace/main.jsx --bundle --platform=browser --outfile=projects/calm-module-4/workspace/main.js`

Expected: bundle succeeds

**Step 2: Run repo-required verification**

Run:
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`

Expected: both pass

**Step 3: Export and redeploy**

Run:
- `npm.cmd run export:google-hosted -- --project calm-module-4`
- `npm.cmd run deploy:google-hosted -- --project calm-module-4`

Expected: deploy succeeds to `https://calmmodule4.web.app`
