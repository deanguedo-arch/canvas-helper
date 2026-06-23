# Brightspace Shell Template

Use this pattern when a Brightspace ZIP should become a polished local course that matches the current Next Step shell instead of becoming another custom one-off build.

## Current Baseline

- Use `scripts/lib/next-step-course-shell.ts` as the shared shell renderer for new clean conversion builds.
- Treat the Short Stories and Feature Film builds as the visual/behavior baseline for the standard shell:
  - centered Next Step logo in the topbar
  - progress meter pinned on the right
  - dark sidebar with full and collapsed states
  - lesson subnav hidden in collapsed rail mode
  - overview `I can...` outcomes
  - grouped lesson sequence with horizontal/card lesson groups and dropdown behavior
  - bottom lesson controls
  - compact resource browser with one active group at a time
  - media playlist Film Room when video/audio is present
  - evidence notebook pattern for reading/viewing guides when students need to collect proof over time
  - question-bank pattern with one dropdown selector and one active question set
  - scoped `Print / PDF` buttons that print only the current assignment/page, not the full shell
  - stable autosave keys for SCORM
- Keep course-specific extraction in a course builder script, not in the shared shell.

## Bulk Module Creation Baseline

Before building many modules, lock every new module to this shell contract instead of copying a previous course workspace.

Required standard surfaces:

- `Overview` with student-facing purpose, `I can...` outcomes, progress summary, and no conversion/admin language.
- `Lessons` with grouped lesson cards and stable lesson ids.
- `Resources` with grouped dropdown browsing, cleaned titles, and no local path leakage.
- `Film Room` only when media exists, using the media playlist pattern rather than loose video cards.
- `Reading Guide`, `Viewing Guide`, or equivalent evidence notebook when students need to collect reusable evidence.
- A dedicated question section when source prompts are tied to readings, stories, films, scenes, or units.
- `Writing Studio` only for actual writing/planning work, not as a dumping ground for every worksheet.

Bulk-build rule:

- Build from the source ZIP and a focused builder every time.
- Do not start by cloning a finished workspace unless the task is explicitly a one-off visual comparison.
- Register the course in Studio/Course Showcase early so visual differences can be caught before SCORM packaging.
- Keep all generated workspace changes reproducible through the builder and `renderNextStepCourseShell(...)`.

## Builder Shape

A clean Brightspace builder should do four jobs:

1. Read the source ZIP and select the active course/module files.
2. Normalize content into lesson objects with `id`, `title`, `summary`, and sanitized `html`.
3. Render course-specific support sections such as Reading Guide, Writing Studio, Film Room, Resources, or question banks.
4. Pass those lessons and support sections to `renderNextStepCourseShell(...)`.

The shared shell owns:

- topbar/sidebar layout
- lesson routing
- progress tracking
- lesson completion
- response autosave
- print/PDF hooks
- resource-panel switching
- media-panel switching
- responsive sidebar behavior

## Source Of Truth

Project metadata should include both files as canonical sources:

- `projects/<slug>/workspace/index.html`
- the course builder script, such as `scripts/build-<course>.ts`
- `scripts/lib/next-step-course-shell.ts`

The workspace is the reviewable output, but the builder plus shell are the regeneration path.

## Storage And SCORM

Use the storage key base `canvas-helper:<slug>` unless the course has a strong reason to differ.

Expected tracked keys:

- `canvas-helper:<slug>:complete`
- `canvas-helper:<slug>:responses`

Before SCORM packaging, verify:

- typing in response fields does not blur after one character
- reload restores typed responses
- saved evidence-bank cards restore after reload when the course uses a reading/viewing notebook
- `scorm-bridge.js` is injected before the course script
- `npm run test:scorm` passes
- `unzip -tq projects/<slug>/exports/<slug>-scorm-2004.zip` passes

## Print/PDF Gate

`Print / PDF` is part of the assignment contract, not a generic browser action.

Before export, verify:

- the button creates a scoped print root for the current assignment/page
- hidden course pages are not exposed by print CSS
- inactive question sets remain hidden in the print clone
- a print button inside a smaller activity panel uses a stable wrapper such as `[data-writing-activity-panel]`
- the exported SCORM package keeps the same scoped-print behavior

## Media Gate

If a course includes local video, do this before export:

- probe media with `ffprobe`
- convert questionable files to browser-safe H.264/AAC MP4 with `-movflags +faststart`
- verify local Film Room playback in the browser
- record conversion notes in project metadata or handoff

Do not remove broken media silently. Either repair it or provide a truthful fallback.

## New Course Checklist

1. Create a focused builder under `scripts/`.
2. Import the ZIP and sanitize only the selected course/module files.
3. Feed normalized lessons into `renderNextStepCourseShell(...)`.
4. Add course-specific nav sections only when they have real student value.
5. Generate `meta/project.json` with canonical sources and regenerate command.
6. Run `npm run verify -- --project <slug>`.
7. Run a browser autosave check on at least one response field.
8. Run a browser scoped-print check for at least one assignment/guide page.
9. Add the course to Studio/Course Showcase for visual comparison.
10. Export SCORM 2004 and run the SCORM tests.
