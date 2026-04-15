# Mental Fitness Option 2 Gating Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add phase completion and 70 percent quiz-pass gating to Mental Fitness Option 2.

**Architecture:** Keep the current shell and lesson structure intact. Add local persistent completion state in `main.js`, derive unlock rules from phase and quiz relationships, and update the existing renderers so locked content stays visible while respecting the new gate rules.

**Tech Stack:** Vanilla JS, localStorage, static shell CSS.

---

### Task 1: Add persistent gating state

**Files:**
- Modify: `projects/mentalwellness10-option2/workspace/main.js`

**Steps:**
- Add localStorage-backed state for completed phases, passed quizzes, and quiz scores.
- Add helper functions for unlock checks and progress counts.
- Add one authoring bypass flag.

### Task 2: Gate phases, quizzes, and assignments

**Files:**
- Modify: `projects/mentalwellness10-option2/workspace/main.js`
- Modify: `projects/mentalwellness10-option2/workspace/styles.css`

**Steps:**
- Apply lock checks to home phase cards, quiz cards, and assignment cards.
- Add locked visuals and disabled interaction states.
- Keep all content visible for orientation.

### Task 3: Add completion actions

**Files:**
- Modify: `projects/mentalwellness10-option2/workspace/main.js`
- Modify: `projects/mentalwellness10-option2/workspace/styles.css`

**Steps:**
- Add `Mark complete` to phase detail.
- Add `Submit quiz` to quiz detail with 70 percent pass logic.
- Preserve retake behavior.

### Task 4: Wire top progress meter

**Files:**
- Modify: `projects/mentalwellness10-option2/workspace/main.js`

**Steps:**
- Replace hardcoded progress values.
- Reflect completed phases plus passed quizzes.
- Keep assignment runtime behavior untouched.
