# Mental Wellness Option 2 Phase 2 Lesson/Quiz Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild `mentalwellness10-option2` Phase 2 lesson and quiz from the approved DOCX source while preserving the existing Phase 1-style reading and quiz experience.

**Architecture:** Keep the existing shell and render pipeline. Replace only the Phase 2 lesson/quiz data in `workspace/main.js`, add the new reading assets under `workspace/assets/readings/`, and touch `workspace/styles.css` only if Phase 2 assets expose missing generic lesson styles. Use source-based tests first to lock the new content scope and the dynamic quiz back-navigation behavior.

**Tech Stack:** Vanilla JS runtime, static reading/quiz config in `workspace/main.js`, static assets in `workspace/assets/readings/`, Node test runner via `tsx --test`

---

### Task 1: Lock the approved Phase 2 scope with failing tests

**Files:**
- Create: `scripts/tests/mentalwellness10-option2-phase2-content.test.ts`
- Modify: `projects/mentalwellness10-option2/workspace/main.js`

**Step 1: Write the failing test**

- Assert that `main.js` contains:
  - a Phase 2 quiz id linked to `phase-2`
  - `phase2-drive-content.pdf`
  - `PHASE_CONTENT['phase-2']`
  - key chapter headings from the DOCX
  - `phase2-figures`
- Assert that the quiz detail back button is no longer hardcoded to `Back to phase 1`.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/mentalwellness10-option2-phase2-content.test.ts`

Expected: FAIL because the current runtime still has placeholder Phase 2 data and the quiz detail hardcodes `Back to phase 1`.

**Step 3: Write minimal implementation**

- Add the new Phase 2 quiz.
- Replace the Phase 2 lesson placeholder with the DOCX-derived lesson object.
- Make the quiz back button label dynamic from `active.phaseId`.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/mentalwellness10-option2-phase2-content.test.ts`

Expected: PASS

### Task 2: Add Phase 2 source assets

**Files:**
- Create: `projects/mentalwellness10-option2/workspace/assets/readings/phase2-drive-content.pdf`
- Create: `projects/mentalwellness10-option2/workspace/assets/readings/phase2-figures/*`

**Step 1: Copy or generate the assets**

- Save the DOCX as `phase2-drive-content.pdf`
- Copy the six extracted DOCX figure images into `phase2-figures/` with stable names

**Step 2: Verify assets exist**

Run: `Get-ChildItem -Recurse projects/mentalwellness10-option2/workspace/assets/readings/phase2*`

Expected: PDF and figure files listed

### Task 3: Rebuild Phase 2 lesson content

**Files:**
- Modify: `projects/mentalwellness10-option2/workspace/main.js`
- Modify: `projects/mentalwellness10-option2/workspace/styles.css` only if necessary

**Step 1: Replace Phase 2 lesson data**

- Build a new `PHASE_CONTENT['phase-2']` object with:
  - eyebrow
  - heading
  - subheading
  - hero figure
  - key ideas
  - section cards
  - comparison tables
  - glossary
  - `sourcePdf`
  - `quizId`

**Step 2: Keep the diff narrow**

- Reuse the existing section renderers and reading styles
- Add CSS only if Phase 2 content exposes a layout gap the current generic lesson system cannot handle

**Step 3: Verify parse safety**

Run: `node --check projects/mentalwellness10-option2/workspace/main.js`

Expected: no syntax errors

### Task 4: Add the Phase 2 quiz

**Files:**
- Modify: `projects/mentalwellness10-option2/workspace/main.js`

**Step 1: Create the new quiz object**

- Add a Phase 2 quiz tied to `phase-2`
- Use review-question-backed multiple-choice items derived from the chapter
- Point `sourcePdf` at `./assets/readings/phase2-drive-content.pdf`

**Step 2: Fix dynamic phase navigation**

- Replace the hardcoded `Back to phase 1` label with a label computed from the active quiz phase

**Step 3: Re-run the failing test**

Run: `npx tsx --test scripts/tests/mentalwellness10-option2-phase2-content.test.ts`

Expected: PASS

### Task 5: Run targeted verification

**Files:**
- Verify: `projects/mentalwellness10-option2/workspace/main.js`
- Verify: `projects/mentalwellness10-option2/workspace/styles.css`

**Step 1: Run targeted checks**

Run:
- `npx tsx --test scripts/tests/mentalwellness10-option2-phase2-content.test.ts`
- `node --check projects/mentalwellness10-option2/workspace/main.js`

**Step 2: Optional runtime spot-check**

Run: `npm.cmd run studio`

Expected:
- Phase 2 lesson opens with full chapter content
- Phase 2 quiz appears in the quiz library
- The quiz routes back to Phase 2, not Phase 1
