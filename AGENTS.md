# Canvas Helper Agent Workflow

## First Read
- Read `projects/<slug>/meta/project.json`, `projects/<slug>/meta/section-map.json`, and `projects/<slug>/meta/style-guide.md` before editing a project.
- Treat `projects/<slug>/raw/` as immutable source history.
- Make all content, logic, and styling changes in `projects/<slug>/workspace/`.

## Editing Rules
- Preserve Brightspace export compatibility. Favor relative asset paths and avoid assumptions that require a custom server at publish time.
- Keep existing external CDN dependencies unless replacing them is part of the task.
- When references exist, use `projects/<slug>/references/extracted/` first and fall back to `references/raw/` only when needed.
- Prefer section-level edits that match the existing heading structure, class patterns, and interaction style from `meta/style-guide.md`.

## Commands
- `npm.cmd run studio`
- `npm.cmd run import -- "<path-to-html-or-txt-or-folder>"`
- `npm.cmd run analyze -- --project <slug>`
- `npm.cmd run refs -- --project <slug>`
- `npm.cmd run export:brightspace -- --project <slug>`

## Rebuilds
- Use `npm.cmd run rehydrate -- --project <slug> --force` only when you intentionally want to regenerate the editable workspace from `raw/original.html`.
- Re-import with `--force` when you want to replace the entire project from a fresh source export.
- For folder imports, prefer a staging folder like `projects/_incoming/<slug>/` so source bundles stay separate from generated project files.
