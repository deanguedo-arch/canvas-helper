# Canvas Helper

Canvas Helper is a local-first Node-powered workbench for importing Canvas course content, preserving immutable raw baselines, editing workspace copies, previewing them in a browser Studio, and exporting Brightspace-ready deliverables.

Repo-level intelligence defaults live in `config/intelligence.json`. Project-specific overrides can live in `projects/<slug>/meta/intelligence-policy.json` and/or `projects/<slug>/meta/project.json`.

## Quick Start

1. Install Node.js
2. Run `npm.cmd install`
3. Start Studio with `npm.cmd run studio`
4. On Windows, use explicit mode launchers:
   - `launch-canvas-helper-off.bat`
   - `launch-canvas-helper-collect.bat` (default/normal)
   - `launch-canvas-helper-apply.bat`
   - or `launch-canvas-helper.bat` and set `LEARNER_MODE` manually
5. The Windows launcher auto-runs `npm.cmd run migrate:projects` so older repo layouts are normalized before Studio starts

## Main Commands

- `npm.cmd run studio`
- `npm.cmd run studio:auto`
- `npm.cmd run import -- "<path-to-html-or-folder>" --slug <slug>`
- `npm.cmd run incoming:refresh`
- `npm.cmd run analyze -- --project <slug>`
- `npm.cmd run refs -- --project <slug>`
- `npm.cmd run blueprint -- --project <slug>`
- `npm.cmd run assessment-map -- --project <slug>`
- `npm.cmd run lesson-packets -- --project <slug>`
- `npm.cmd run assessment:import -- --input "<file-or-dir>" [--slug <assessment-slug>]`
- `npm.cmd run assessment:export -- --assessment <assessment-slug>`
- `npm.cmd run test:assessments`
- `npm.cmd run export:brightspace -- --project <slug>`
- `npm.cmd run export:brightspace:zip -- --project <slug>`
- `npm.cmd run export:html -- --project <slug>`
- `npm.cmd run smoke:pipeline`
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`

## Core Workflow

1. Drop HTML or bundle imports into `projects/incoming/`
2. Drop resources directly into `projects/resources/<slug>/`
3. Use Studio `Refresh Intake` or run `npm.cmd run incoming:refresh`
4. Imported sources are snapshotted to `projects/processed/<slug>/source/`
5. Edit only `projects/<slug>/workspace/`
6. Use Studio to compare raw vs workspace
7. Run `analyze` and `refs` to refresh workspace structure plus classified resource artifacts
8. Run `blueprint`, `assessment-map`, and `lesson-packets` to build outline-first planning artifacts before generation-heavy work
9. Run export commands as needed
10. Capture a handoff before stopping

## Planning Workflow

1. `refs` extracts resources, classifies them (`outline`, `assessment`, `textbook`, `teacher-note`, `other`), and writes `resource-catalog.json`
2. `blueprint` builds `course-blueprint.json` from outline authority first and assessment demand second
3. `assessment-map` builds `assessment-map.json` from assessment resources without summarizing them away
4. `lesson-packets` writes outcome-bound lesson packet files under `projects/<slug>/meta/lesson-packets/`
5. `pack` or any command that refreshes intelligence rewrites `prompt-pack.md` with blueprint, assessment, and lesson-packet summaries above raw excerpts

## Assessment Library Workflow

Assessment authoring now has a global library, separate from course project slugs:

- root path: `projects/assessments/<assessment-slug>/`
- source files: `projects/assessments/<assessment-slug>/source/`
- canonical project: `projects/assessments/<assessment-slug>/assessment.project.json`
- import diagnostics: `projects/assessments/<assessment-slug>/import-result.json`
- Brightspace exports: `projects/assessments/<assessment-slug>/exports/brightspace/`

Studio now supports two top-level modes:

- `Course Studio` for project preview/edit workflows
- `Assessment Library` for PDF/DOCX import, question editing, validation, and Brightspace export

PDF ingest for assessments uses Canvas Helper’s native-first + OCR-fallback extraction path (`scripts/lib/pdf-text.ts`) and then deterministic question-extraction heuristics.

## PDF OCR Fallback

Native PDF text extraction stays primary. OCR is only used when a PDF has no selectable text or the extracted text is clearly garbled.

- macOS: install `tesseract` and `poppler` so `tesseract` and `pdftoppm` are on `PATH` (`brew install tesseract poppler`)
- Windows: install Tesseract OCR and Poppler so `tesseract.exe` and `pdftoppm.exe` are on `PATH`
- User-space fallback: install the binaries wherever you want, then point Canvas Helper at them with `CANVAS_HELPER_TESSERACT_PATH` and `CANVAS_HELPER_PDFTOPPM_PATH`
- If the binaries live outside `PATH`, set `CANVAS_HELPER_TESSERACT_PATH` and `CANVAS_HELPER_PDFTOPPM_PATH`
- `refs` now warns before extraction when OCR tools are missing and preserves existing `_extracted/` outputs for unchanged resources instead of wiping the directory first

## Learner modes

The workflow is controlled by an explicit learner mode, resolved in this order:

1. CLI flag `--learner-mode <off|collect|apply>`
2. `LEARNER_MODE` environment variable
3. `projects/<slug>/meta/project.json` or `projects/<slug>/meta/intelligence-policy.json`
4. `config/intelligence.json`
5. built-in safe fallback (`collect`)

### `off`

- collection: disabled
- application: disabled
- best for: clean baseline / debugging

### `collect`

- collection: enabled
- application: disabled
- best for: normal day-to-day work (safe default)

### `apply`

- collection: enabled
- application: enabled
- best for: trusted repeated project types

`launch-canvas-helper-collect.bat` is the default explicit startup path.

## Repo Guides

- Architecture: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- Agent operating rules: [`AGENTS.md`](./AGENTS.md)
- Contribution rules: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- Ops runbook: [`docs/ops/README.md`](./docs/ops/README.md)
