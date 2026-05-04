# AI Course Shared Theme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply the Assessment Pillars styling system to both AI course resource pages.

**Architecture:** Extract the reusable Assessment Pillars theme into `workspace/resources/ai-course-theme.css`, link it from both pages, then restyle Jon’s generated shell and component templates to use the shared tokens. Keep the existing two-resource iframe hub and content data intact.

**Tech Stack:** HTML, Tailwind CDN, project source tests with `tsx --test`, Canvas Helper `html` and `google-hosted` exports.

---

### Task 1: Source Contract

**Files:**
- Modify: `scripts/tests/ai-course-building-resources.test.ts`

**Step 1: Write the failing test**

Add assertions that:
- `dean-ai-assessment-pillars.html` links `./ai-course-theme.css`.
- `jon-ai-resource.html` links `./ai-course-theme.css`.
- Jon’s page uses `html class="dark scroll-smooth"`.
- Jon’s body uses `bg-surface text-on-surface`.
- Jon’s top header uses `bg-surface/80` and `border-surface-variant`.
- Jon no longer uses the old page-shell classes `bg-slate-100` or `bg-slate-50`.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/ai-course-building-resources.test.ts`

Expected: FAIL because the shared theme file and Jon restyle do not exist yet.

### Task 2: Shared Theme File

**Files:**
- Create: `projects/ai-course-building-resources/workspace/resources/ai-course-theme.css`
- Modify: `projects/ai-course-building-resources/workspace/resources/dean-ai-assessment-pillars.html`
- Modify: `projects/ai-course-building-resources/workspace/resources/jon-ai-resource.html`

**Step 1: Create theme file**

Move reusable theme variables and shared behavior into `ai-course-theme.css`:
- Material Symbols base styling
- light and dark color tokens
- shared scrollbar
- presentation mode
- accordion/flip helpers
- small resource shell helpers used by Jon

**Step 2: Link both resource pages**

Add `<link rel="stylesheet" href="./ai-course-theme.css"/>` after fonts and before page-local styles.

**Step 3: Keep page-specific CSS local**

Leave Assessment-specific sliders, scale simulator, and deck CSS in the Assessment page. Leave Jon’s activity mechanics in Jon’s page.

### Task 3: Restyle Jon Shell

**Files:**
- Modify: `projects/ai-course-building-resources/workspace/resources/jon-ai-resource.html`

**Step 1: Update document shell**

Change the body/header/sidebar/main classes to use the shared Assessment palette and spacing.

**Step 2: Update dynamic template classes**

Change generated sections, cards, accordions, buttons, and table containers from slate/indigo light-theme classes to surface/primary/secondary theme classes.

**Step 3: Preserve behavior**

Keep existing JavaScript functions and data arrays intact except for class string changes.

### Task 4: Verification and Exports

**Files:**
- Generated: `projects/ai-course-building-resources/exports/single-html/ai-course-building-resources.html`
- Generated: `projects/ai-course-building-resources/exports/google-hosted/**`

**Step 1: Run focused tests**

Run:
`npx tsx --test scripts/tests/ai-course-building-resources.test.ts scripts/tests/ai-course-building-resources-google-hosted.test.ts scripts/tests/single-html-export.test.ts`

**Step 2: Run project checks**

Run:
`npm run verify -- --project ai-course-building-resources`
`npm run typecheck`
`npm run build:studio`

**Step 3: Regenerate exports**

Run:
`npm run export:html -- --project ai-course-building-resources`
`.\publish-ai-course-building-resources.bat`

**Step 4: Live check**

Fetch `https://digitalpresentation.web.app/resources/jon-ai-resource.html` and verify it contains `ai-course-theme.css`, `bg-surface`, and no old `bg-slate-100` shell.
