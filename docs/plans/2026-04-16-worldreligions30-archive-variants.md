# World Religions 30 Archive Variants Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expose two World Religions 30 course shell variants in Canvas Helper Studio, with both variants preserving the current content model while applying two levels of the approved archival visual treatment.

**Architecture:** Keep Studio unchanged and use the existing project-picker behavior by surfacing two independent project slugs: `worldreligions30-option1` and `worldreligions30-option2`. Reuse the same course data and interaction model in both projects, then differentiate them only through shell markup and styling intensity so the user can compare variants directly in Studio.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node test runner, existing Studio project manifest pipeline.

---

### Task 1: Lock variant discovery with a regression test

**Files:**
- Create: `scripts/tests/worldreligions30-variants.test.ts`

**Step 1: Write the failing test**

- Assert `listProjectSlugs()` includes both `worldreligions30-option1` and `worldreligions30-option2`.
- Assert both manifests resolve with `projectType: "generated-course"` and `preferredWorkflows` including `generated-course`.
- Assert both workspace entrypoints exist.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/worldreligions30-variants.test.ts`

**Step 3: Add the missing project files and metadata**

- Create the `worldreligions30-option1` project scaffold by copying the World Religions Option 2 canonical course shell.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/worldreligions30-variants.test.ts`

### Task 2: Build the Option 1 shell skin

**Files:**
- Create: `projects/worldreligions30-option1/meta/project.json`
- Create: `projects/worldreligions30-option1/raw/original.html`
- Create: `projects/worldreligions30-option1/workspace/index.html`
- Create: `projects/worldreligions30-option1/workspace/main.js`
- Create: `projects/worldreligions30-option1/workspace/styles.css`
- Create: `projects/worldreligions30-option1/workspace/course-data.js`
- Create: `projects/worldreligions30-option1/workspace/pdf-viewer.html`

**Steps:**
- Preserve the current course structure and behavior.
- Apply the approved archival palette and typography.
- Keep markup changes minimal and mostly style-driven.

### Task 3: Refine the existing Option 2 shell

**Files:**
- Modify: `projects/worldreligions30-option2/workspace/index.html`
- Modify: `projects/worldreligions30-option2/workspace/main.js`
- Modify: `projects/worldreligions30-option2/workspace/styles.css`

**Steps:**
- Preserve titles, sections, and ordering.
- Add light structural wrappers where needed for the stronger archive composition.
- Keep all current navigation and quiz/library behavior intact.

### Task 4: Verify and hand off

**Files:**
- Modify: `docs/ops/ACTIVE_HANDOFF.md`
- Modify: `docs/ops/ARCHIVED_HANDOFFS.md`

**Steps:**
- Run targeted variant test.
- Run JS syntax checks for both workspaces.
- Run `npm.cmd run build:studio`.
- Update handoff with both slugs, source-of-truth paths, and next validation command.
