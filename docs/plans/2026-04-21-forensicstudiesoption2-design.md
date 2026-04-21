# Forensic Studies Option 2 Design

## Goal

Create a new course project, `forensicstudiesoption2`, that preserves `projects/forensics` unchanged while presenting the same course content inside the `worldreligions30-option1` shell and styling system.

## Approved Direction

Use the World Religions Option 1 workspace shell as the starting contract, then replace its data, copy, and chapter content with Forensic Studies 25 sources. The old `projects/forensics` project remains read-only source material. All active edits land in `projects/forensicstudiesoption2/**`.

## Architecture

- New project slug: `forensicstudiesoption2`
- Workflow: generated-course shell conversion using imported Forensics content
- Source project for content and assignment assets: `projects/forensics`
- Source project for shell/runtime pattern: `projects/worldreligions30-option1`
- Canonical editable entry: `projects/forensicstudiesoption2/workspace/index.html`
- Canonical editable sources:
  - `projects/forensicstudiesoption2/workspace/index.html`
  - `projects/forensicstudiesoption2/workspace/main.js`
  - `projects/forensicstudiesoption2/workspace/styles.css`
  - `projects/forensicstudiesoption2/workspace/course-data.js`
  - `projects/forensicstudiesoption2/workspace/content/**`

## Data Model

- `course-data.js` will expose `window.FORENSIC_STUDIES_OPTION2_DATA`
- Chapters will represent the visible Forensics teaching modules plus exam and extra-credit modules
- Assignments will be explicit data records, not synthesized from chapters
- Quizzes will support both rebuilt authored quizzes and source-linked quiz shells through `quiz.sourcePath`
- Library items will support course-info PDFs and HTML references through `/preview/references/raw/forensics/...`

## Content Strategy

- Reuse the World Religions shell for navigation, chapter detail, quiz detail, assignments, and library surfaces
- Generate styled chapter landing pages in `workspace/content/chapter-*/index.html`
- Each chapter landing page will summarize the module, list the real source readings, and link into reference previews
- Real interactive assignments from `projects/forensics/workspace/assets` will be copied into the new project and surfaced as embedded assignment pages
- Quiz items that are not yet rebuilt into question sections will render as source-linked assessments instead of broken empty quiz cards

## Constraints

- Do not edit `projects/forensics/**`
- Do not edit `projects/worldreligions30-option1/**`
- Keep the new project isolated under `projects/forensicstudiesoption2/**`
- Preserve traceability back to Forensics source resources

## Verification

- Targeted shell contract test: `scripts/tests/forensicstudiesoption2-shell-behavior.test.ts`
- Project verification: `npm.cmd run verify -- --project forensicstudiesoption2`

