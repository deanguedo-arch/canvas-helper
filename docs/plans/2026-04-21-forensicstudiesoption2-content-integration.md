# Forensic Studies Option 2 Content Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the remaining source-linked placeholders in `forensicstudiesoption2` with real chapter lesson content, authored quizzes, and richer assignment source briefs while preserving the existing option-2 shell and keeping `projects/forensics` untouched.

**Architecture:** Add a focused generator script that reads the canonical Forensics export map plus raw/exported resources under `projects/resources/forensics`, then rewrites `projects/forensicstudiesoption2/workspace/course-data.js` and `projects/forensicstudiesoption2/workspace/content/chapter-*/index.html`. Keep the shell runtime in `workspace/main.js` stable, only extending it where the generated assignment brief data needs to surface in the existing assignment detail view.

**Tech Stack:** TypeScript/TSX scripts, Node filesystem APIs, Cheerio for HTML/XML parsing, existing workspace HTML/CSS shell, source-based tests with Node test runner.

---

### Task 1: Add the failing integration test

**Files:**
- Create: `scripts/tests/forensicstudiesoption2-content.test.ts`
- Read: `projects/forensicstudiesoption2/workspace/course-data.js`
- Read: `projects/forensicstudiesoption2/workspace/content/chapter-2/index.html`

**Step 1: Write the failing test**
- Assert every quiz in `course-data.js` has authored question content instead of source-link-only placeholders.
- Assert at least one multi-brief assignment exists for a module with two source assignments.
- Assert a generated chapter page contains imported lesson content and local lesson-card structure instead of only traceability placeholders.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts`
Expected: FAIL because quizzes are still source-linked only, assignments do not include source briefs, and chapter pages do not contain imported lesson bodies.

### Task 2: Build the project-specific content generator

**Files:**
- Create: `scripts/build-forensicstudiesoption2-content.ts`
- Read: `projects/forensics/workspace/d2l-map-data.js`
- Read: `projects/resources/forensics/**`

**Step 1: Implement raw-source helpers**
- Import the D2L map.
- Resolve the Forensics export root under `projects/resources/forensics/`.
- Normalize `content`/`?ontent` path variants.
- Rewrite HTML asset links to `/preview/references/raw/forensics/...`.

**Step 2: Implement quiz parsing**
- Parse each QTI XML file.
- Emit authored `multipleChoice` items plus quiz metadata while preserving `sourcePath`.
- Support true/false classification when option text matches true/false patterns.

**Step 3: Implement assignment brief parsing**
- Parse assignment XML `instructor_text` into brief cards with title, points, submission mode, summary/task/reminder, and source path.
- Group all assignment briefs that belong to the same module under the existing option-2 assignment lane.

**Step 4: Implement chapter page generation**
- For each option-2 chapter, gather non-assignment, non-quiz lesson resources from the export map.
- Import cleaned lesson HTML where available; fall back to readable extracted text or a source-open note.
- Emit updated `projects/forensicstudiesoption2/workspace/content/chapter-*/index.html` files that preserve the option-2 theme and add actual lesson bodies.

### Task 3: Generate the workspace data and adapt the shell where needed

**Files:**
- Modify: `projects/forensicstudiesoption2/workspace/course-data.js`
- Modify: `projects/forensicstudiesoption2/workspace/main.js`
- Modify: `projects/forensicstudiesoption2/workspace/content/chapter-1/index.html`
- Modify: `projects/forensicstudiesoption2/workspace/content/chapter-2/index.html`
- Modify: `projects/forensicstudiesoption2/workspace/content/chapter-3/index.html`
- Modify: `projects/forensicstudiesoption2/workspace/content/chapter-4/index.html`
- Modify: `projects/forensicstudiesoption2/workspace/content/chapter-5/index.html`
- Modify: `projects/forensicstudiesoption2/workspace/content/chapter-6/index.html`
- Modify: `projects/forensicstudiesoption2/workspace/content/chapter-7/index.html`
- Modify: `projects/forensicstudiesoption2/workspace/content/chapter-8/index.html`
- Modify: `projects/forensicstudiesoption2/workspace/content/chapter-9/index.html`
- Modify: `projects/forensicstudiesoption2/workspace/content/chapter-10/index.html`

**Step 1: Run the generator**

Run: `npx tsx scripts/build-forensicstudiesoption2-content.ts`
Expected: `course-data.js` and all chapter pages regenerate with authored data.

**Step 2: Patch shell rendering only if needed**
- Extend `main.js` so assignment detail cards render source briefs cleanly when `assignment.briefs` exists.
- Keep chapter routing, quiz routing, and assignment iframe behavior unchanged.

### Task 4: Verify and hand off

**Files:**
- Modify: `docs/ops/ACTIVE_HANDOFF.md`
- Modify: `docs/ops/ARCHIVED_HANDOFFS.md`

**Step 1: Run focused verification**

Run:
- `npx tsx --test scripts/tests/forensicstudiesoption2-content.test.ts`
- `npx tsx --test scripts/tests/forensicstudiesoption2-shell-behavior.test.ts`
- `npx tsx --test scripts/tests/forensicstudiesoption2-theme.test.ts`
- `npm.cmd run verify -- --project forensicstudiesoption2`

Expected: PASS on all targeted tests and project verification.

**Step 2: Update handoff**
- Archive the previous active entry.
- Record the new content/quiz integration state, source-of-truth files, and remaining validation risks.
