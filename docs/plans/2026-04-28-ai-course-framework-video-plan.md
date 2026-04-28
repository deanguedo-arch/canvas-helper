# AI Course Framework Video Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the assessment framework video as an introductory section in the AI course Assessment Pillars resource.

**Architecture:** The video is a workspace resource under `workspace/resources/media/` and is referenced from the canonical Assessment Pillars HTML with a relative path. The new intro uses the existing `section-slide` presentation model and does not alter the hub page or the preserved second resource page.

**Tech Stack:** Static HTML, Tailwind utility classes already present in the source page, Node test runner with `tsx`.

---

### Task 1: Add Regression Coverage

**Files:**
- Modify: `scripts/tests/ai-course-building-resources.test.ts`

**Step 1:** Add a test that reads `workspace/resources/dean-ai-assessment-pillars.html`, checks for `#framework-intro`, verifies the local video path, and asserts the section is between the hero copy and `#context`.

**Step 2:** Run `npx tsx --test scripts/tests/ai-course-building-resources.test.ts`.

**Expected:** The new test fails because `workspace/resources/media/ai-assessment-framework.mp4` does not exist yet.

### Task 2: Add Asset And Section

**Files:**
- Create: `projects/ai-course-building-resources/workspace/resources/media/ai-assessment-framework.mp4`
- Modify: `projects/ai-course-building-resources/workspace/resources/dean-ai-assessment-pillars.html`
- Modify: `projects/ai-course-building-resources/meta/project.json`

**Step 1:** Copy `C:\Users\dean.guedo\Downloads\AI_Assessment_Framework (1).mp4` into the workspace media folder with the normalized filename.

**Step 2:** Insert a new `section-slide` after the hero section and before `#context`.

**Step 3:** Add the video file path to `canonicalSources` in `project.json`.

### Task 3: Verify

**Step 1:** Run `npx tsx --test scripts/tests/ai-course-building-resources.test.ts`.

**Expected:** All tests in that file pass.

**Step 2:** Run `npm run verify -- --project ai-course-building-resources`.

**Expected:** Project verification passes or reports only unrelated pre-existing issues.
