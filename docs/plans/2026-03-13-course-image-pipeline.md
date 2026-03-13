# Course Image Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a stable phase-1 image workflow that lets us manually provide images, track approval state, validate assets, and sync approved visuals into section content.

**Architecture:** Add a manifest-driven sync utility in `scripts/lib/conversion` that mutates `course.json` by injecting/updating managed `figure` blocks per section. Add a CLI command that validates + syncs for a project and refreshes `hss1010` workspace output without recomposing sections.

**Tech Stack:** Node/TypeScript scripts, existing conversion models, existing test runner (`tsx --test`).

---

### Task 1: Add Manifest + Sync Domain Logic

**Files:**
- Create: `scripts/lib/conversion/course-images.ts`
- Test: `scripts/tests/course-images.test.ts`

**Step 1: Write the failing test**
- Add tests for:
  - approved entries are inserted as `figure` blocks in target section
  - existing managed figure blocks are updated (no duplicates)
  - draft/rejected entries are skipped
  - invalid section IDs are reported

**Step 2: Run test to verify it fails**
- Run: `npx tsx --test scripts/tests/course-images.test.ts`

**Step 3: Write minimal implementation**
- Implement manifest types and `applyCourseImageManifest(...)` + `validateCourseImageManifest(...)`.
- Use a managed-note marker (`image-manifest`) to safely update only injected blocks.

**Step 4: Run test to verify it passes**
- Run: `npx tsx --test scripts/tests/course-images.test.ts`

### Task 2: Add CLI Sync Command

**Files:**
- Create: `scripts/sync-course-images.ts`
- Modify: `package.json`

**Step 1: Write failing test**
- Extend tests to assert CLI-facing behavior through helper-level functions (validation errors, counts).

**Step 2: Run test to verify failure**
- Run: `npx tsx --test scripts/tests/course-images.test.ts`

**Step 3: Implement command**
- Add `sync:course-images` script and CLI:
  - reads `projects/<slug>/meta/course.json`
  - reads `projects/<slug>/meta/images-manifest.json`
  - validates approved image paths in `workspace/`
  - writes updated `meta/course.json` and `workspace/data/course.json`

**Step 4: Run test to verify pass**
- Run: `npx tsx --test scripts/tests/course-images.test.ts`

### Task 3: Ensure HSS Workspace Refresh Uses Synced Course Directly

**Files:**
- Modify: `scripts/lib/conversion/hss1010.ts`
- Test: `scripts/tests/hss1010-conversion.test.ts` (targeted assertion)

**Step 1: Write failing test**
- Add an assertion path proving renderer can use already-composed course without recomposition side effects.

**Step 2: Run test to verify failure**
- Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`

**Step 3: Implement**
- Add render option to skip re-compose when course is already interactive.
- Use that option from `sync-course-images` workspace refresh path.

**Step 4: Run tests**
- Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`

### Task 4: Render Real Image Figures

**Files:**
- Modify: `scripts/lib/conversion/renderCourse.ts`
- Test: `scripts/tests/course-images.test.ts`

**Step 1: Write failing test**
- Assert a `figure` block with image source renders `<img>` with caption/alt.

**Step 2: Run test to verify failure**
- Run: `npx tsx --test scripts/tests/course-images.test.ts`

**Step 3: Implement**
- Update `renderFigure(...)` to render inline image for `.png/.jpg/.jpeg/.webp/.gif/.svg`.

**Step 4: Run tests**
- Run:
  - `npx tsx --test scripts/tests/course-images.test.ts`
  - `npx tsx --test scripts/tests/hss1010-conversion.test.ts`

### Task 5: Documentation + Verification

**Files:**
- Modify: `README.md` (command and manifest example)

**Step 1: Add concise usage docs**
- Show command and required manifest fields.

**Step 2: Verify**
- Run:
  - `npm.cmd run typecheck`
  - `npx tsx --test scripts/tests/course-images.test.ts`
  - `npx tsx --test scripts/tests/hss1010-conversion.test.ts`

