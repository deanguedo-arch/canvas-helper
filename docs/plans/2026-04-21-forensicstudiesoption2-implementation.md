# Forensic Studies Option 2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build `projects/forensicstudiesoption2` as a new World Religions-style shell that uses Forensics course content without modifying `projects/forensics`.

**Architecture:** Copy the World Religions Option 1 workspace shell into a new project, then replace the data model, chapter content, assignment embeds, and runtime assumptions so the shell is driven by explicit Forensics records. Keep all source links traceable to existing Forensics workspace assets or raw reference previews.

**Tech Stack:** Static HTML, CSS, browser-side JavaScript, existing Canvas Helper preview routes, targeted `tsx` tests.

---

### Task 1: Lock the contract with tests

**Files:**
- Test: `scripts/tests/forensicstudiesoption2-shell-behavior.test.ts`

**Step 1: Write the failing test**

The test already exists and asserts:
- the new project metadata and shell files exist
- the new shell uses `window.FORENSIC_STUDIES_OPTION2_DATA`
- chapter content pages, assignments, and library/reference links are wired
- the runtime supports `quiz.sourcePath`

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-shell-behavior.test.ts`
Expected: FAIL because `projects/forensicstudiesoption2/**` does not exist yet.

### Task 2: Scaffold the new project

**Files:**
- Create: `projects/forensicstudiesoption2/meta/project.json`
- Create: `projects/forensicstudiesoption2/workspace/index.html`
- Create: `projects/forensicstudiesoption2/workspace/main.js`
- Create: `projects/forensicstudiesoption2/workspace/styles.css`
- Create: `projects/forensicstudiesoption2/workspace/pdf-viewer.html`

**Step 1: Copy the World Religions shell files into the new project**

Run:
`Copy-Item -Recurse -Force projects/worldreligions30-option1/workspace projects/forensicstudiesoption2`

**Step 2: Replace metadata and shell identifiers**

Update the copied shell so titles, slug, and global data references point to `forensicstudiesoption2`.

### Task 3: Bring across real Forensics assignment assets

**Files:**
- Create: `projects/forensicstudiesoption2/workspace/assignments/**`

**Step 1: Copy Forensics assignment HTML and supporting bundle assets**

Run:
`Copy-Item -Recurse -Force projects/forensics/workspace/assets projects/forensicstudiesoption2/workspace/assignments`

**Step 2: Remove reference-only authoring sources from the surfaced path if they are not needed by the embedded HTML**

Keep the actual runtime assets and any referenced images/scripts intact.

### Task 4: Build the new course data source

**Files:**
- Create: `projects/forensicstudiesoption2/workspace/course-data.js`
- Create: `projects/forensicstudiesoption2/workspace/content/module-index.css`
- Create: `projects/forensicstudiesoption2/workspace/content/chapter-*/index.html`

**Step 1: Write the data records**

Create explicit arrays for:
- course metadata
- chapters
- assignments
- quizzes
- library items

**Step 2: Create chapter landing pages**

Each page should:
- match the World Religions shell styling
- summarize the module
- list real source readings/resources
- link to raw reference previews

### Task 5: Patch the runtime for generic shell behavior

**Files:**
- Modify: `projects/forensicstudiesoption2/workspace/main.js`

**Step 1: Replace World Religions-specific assumptions**

Update the runtime so it:
- reads `window.FORENSIC_STUDIES_OPTION2_DATA`
- honors explicit `data.assignments`
- honors explicit library items without forced chapter-number assumptions
- conditionally renders chapter content, library, quiz, and assignment actions
- supports source-linked quiz detail views via `quiz.sourcePath`

**Step 2: Keep the shell look-and-feel intact**

Do not redesign the shell. Only generalize it so the Forensics data model fits cleanly.

### Task 6: Verify the new project

**Files:**
- Verify existing project files only

**Step 1: Run the targeted shell test**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-shell-behavior.test.ts`
Expected: PASS

**Step 2: Run project verification**

Run: `npm.cmd run verify -- --project forensicstudiesoption2`
Expected: PASS or only known external-asset warnings

**Step 3: Update handoff state if this becomes the active resume target**

Record the new project as the active work item only after verification is complete.
