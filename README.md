# Canvas Helper

Canvas Helper is a local workspace for importing Canvas-generated interactive HTML, preserving an untouched raw copy, generating a safer editable workspace, previewing both versions side by side with a lightweight studio, and exporting a Brightspace-ready folder.

The editor is Cursor/Codex. This repo provides the project layout, manifests, preview server, reference extraction, and export tooling that make post-editing large generated Canvas pages practical.

## What It Does
- Imports `.html` files or `.txt` files that contain an HTML document.
- Imports a whole folder that contains one site file plus supporting materials.
- Preserves the untouched import at `projects/<slug>/raw/original.html`.
- Generates an editable copy at `projects/<slug>/workspace/`.
- Splits safe top-level shared components into `workspace/components/` when possible.
- Generates Codex-friendly metadata in `projects/<slug>/meta/`.
- Extracts supported reference materials from `references/raw/` into `references/extracted/`.
- Exports a Brightspace upload bundle from `workspace/`.

## Repo Layout
```text
app/studio/                  Vite + React studio shell
scripts/                     Import, analyze, reference, export, and rehydrate commands
projects/<slug>/raw/         Immutable source copy
projects/<slug>/workspace/   Editable project files
projects/<slug>/references/  Source and extracted reference material
projects/<slug>/meta/        Manifests, outline, style guide, import log
projects/<slug>/exports/     Brightspace export output
```

## Setup
1. Install Node.js.
2. Run `npm.cmd install`

PowerShell note: this machine blocks `npm.ps1`, so use `npm.cmd ...` instead of `npm ...`.

## Commands
- `npm.cmd run studio`
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`
- `npm.cmd run import -- "<path-to-html-or-txt-or-folder>"`
- `npm.cmd run analyze -- --project <slug>`
- `npm.cmd run refs -- --project <slug>`
- `npm.cmd run export:brightspace -- --project <slug>`
- `npm.cmd run rehydrate -- --project <slug> --force`

## Typical Workflow
1. Import a Canvas export:
   `npm.cmd run import -- "canvas code and references\CALM MODULE .HTML"`
2. Or import a whole source bundle folder:
   `npm.cmd run import -- "projects\_incoming\biology-module" --slug biology-module`
2. Open the studio:
   `npm.cmd run studio`
3. Edit files in `projects/<slug>/workspace/` with Cursor/Codex.
4. If you imported a folder, supporting files are copied into `references/raw/` and indexed automatically.
5. If you add more supporting material later, drop it into `projects/<slug>/references/raw/`.
6. Extract references:
   `npm.cmd run refs -- --project <slug>`
7. Export for Brightspace:
   `npm.cmd run export:brightspace -- --project <slug>`

## Recommended Drop-Folder Workflow
Use a staging folder under `projects/_incoming/` so your source bundle stays separate from the generated project files.

Example:
```text
projects/
  _incoming/
    biology-module/
      module.html
      teacher-notes.pdf
      activity-ideas.docx
      source-text/
        lesson-outline.md
```

Then run:
```powershell
npm.cmd run import -- "projects\_incoming\biology-module" --slug biology-module
```

What happens:
- The importer picks the best `.html` or `.txt` file in that folder as the site entrypoint.
- That file becomes `raw/original.html`.
- Any local site assets referenced by the HTML are copied into the raw/workspace runtime.
- All other supporting files are copied into `projects/<slug>/references/raw/`.
- Supported reference files are indexed into `references/extracted/`.

Do not point a folder import at `projects/<slug>` itself. Use a staging folder such as `projects/_incoming/<slug>` instead.

## Studio
The studio is intentionally minimal:
- Lists imported projects
- Toggles between `raw` and `workspace` preview modes
- Shows section metadata from `meta/section-map.json`
- Surfaces source file paths for opening in Cursor
- Displays the generated style guide and import log

Preview routes are served directly from the local `projects/` folder:
- `/preview/raw/<slug>/original.html`
- `/preview/workspace/<slug>/index.html`

## Reference Extraction
Supported extraction in v1:
- `.txt`
- `.md`
- `.html`
- `.pdf`
- `.docx`

Unsupported formats are still stored and indexed as `stored-only`.

## Brightspace Export
Exports are written to:
`projects/<slug>/exports/brightspace/`

The exporter copies the entire editable workspace, preserves relative paths, and writes `export-report.md` with upload guidance and dependency warnings.

## Included Sample
This repo now includes an imported sample project generated from:
- `canvas code and references/`

The sample project slug is:
- `projects/calm-module/`

Its sample reference extraction uses:
- `canvas code and references/CALM Module 1 - Personal Choices.pdf`
