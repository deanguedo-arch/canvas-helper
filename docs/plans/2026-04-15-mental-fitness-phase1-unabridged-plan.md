# Mental Fitness Phase 1 Unabridged Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild Phase 1 in `mentalwellness10-option2` so it preserves the chapter in near-original order and wording, with the quiz kept separate in `Quizzes`.

**Architecture:** Keep the existing Option 2 reader shell and replace only the `PHASE_CONTENT['phase-1']` data model with a fuller Word-derived chapter structure. Reuse the current image pipeline and add source figures only if the new document contains missing chapter assets.

**Tech Stack:** Vanilla JS content model in `workspace/main.js`, existing CSS reader styles, local asset files under `workspace/assets/readings/phase1-figures/`.

---

### Task 1: Extract the Word source structure and media inventory

**Files:**
- Read: `C:\Users\dean.guedo\Downloads\Mastering_the_Performance_State_Textbook_Edition.docx`
- Optional update: `projects/mentalwellness10-option2/workspace/assets/readings/phase1-figures/**`

**Steps**

1. Extract the document XML and media inventory.
2. Identify the ordered non-quiz chapter flow for Phase 1.
3. Compare source media against the existing `phase1-figures` assets.
4. Copy only genuinely missing chapter figures into the project if needed.

### Task 2: Replace the selective Phase 1 rebuild with an unabridged chapter pass

**Files:**
- Modify: `projects/mentalwellness10-option2/workspace/main.js`

**Steps**

1. Locate `PHASE_CONTENT['phase-1']`.
2. Preserve the current approved hero image and source-PDF action.
3. Replace the current abbreviated section list with a near-original ordered chapter structure.
4. Keep glossary/tables/callouts in the phase body.
5. Keep the linked quiz action but do not embed quiz questions in the phase.

### Task 3: Keep the current quiz split intact

**Files:**
- Verify in-place only: `projects/mentalwellness10-option2/workspace/main.js`

**Steps**

1. Confirm the existing `Quiz 01` data remains unchanged.
2. Confirm the phase still points to the separate quiz route rather than embedding it.

### Task 4: Manual preview handoff

**Files:**
- No additional code files

**Steps**

1. Hand off with explicit manual preview checks for:
   - `Phases -> Phase 1`
   - figure presence/order
   - glossary/table continuity
   - `Quizzes -> Quiz 01`
2. No automated validation unless explicitly requested by the user.
