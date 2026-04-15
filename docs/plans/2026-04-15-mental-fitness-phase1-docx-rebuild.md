# Mental Fitness Phase 1 DOCX Rebuild Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the text-only Phase 1 lesson with a docx-derived reading that preserves inline figures while keeping the extracted quiz flow untouched.

**Architecture:** Keep the existing Option 2 shell and quiz routing. Override only the `phase-1` lesson data in `main.js`, extract the docx media into local reading assets, and extend the existing reading renderer/styles to support inline figure blocks without changing assignment runtime behavior.

**Tech Stack:** Vanilla JS data/rendering in `workspace/main.js`, CSS in `workspace/styles.css`, static reading assets in `workspace/assets/readings/phase1-figures/`.

---

### Task 1: Import the docx figure assets

**Files:**
- Create: `projects/mentalwellness10-option2/workspace/assets/readings/phase1-figures/*`

**Step 1:** Extract the embedded docx images into stable filenames.
**Step 2:** Keep the assets local to Option 2 so Firebase deploys them with the course.

### Task 2: Rebuild the Phase 1 lesson data

**Files:**
- Modify: `projects/mentalwellness10-option2/workspace/main.js`

**Step 1:** Replace the current text-only `phase-1` content model with a docx-derived structure.
**Step 2:** Keep the existing `quizId` and extracted quiz routing unchanged.
**Step 3:** Add inline figure metadata so the reading renderer can place the images in the correct sections.

### Task 3: Extend the reading renderer and styles

**Files:**
- Modify: `projects/mentalwellness10-option2/workspace/main.js`
- Modify: `projects/mentalwellness10-option2/workspace/styles.css`

**Step 1:** Add hero-image support and section-level figure rendering inside the existing reading template.
**Step 2:** Add figure styles that match the Option 2 shell rather than introducing a separate viewer aesthetic.
**Step 3:** Preserve the current quiz detail view and library behavior.

### Task 4: Manual validation

**Files:**
- Review only: `projects/mentalwellness10-option2/workspace/main.js`

**Step 1:** Open Phase 1 and confirm the figures render inline.
**Step 2:** Confirm the `Open phase quiz` button still routes to the extracted quiz.
**Step 3:** Confirm compact mode still holds together around the denser lesson layout.
