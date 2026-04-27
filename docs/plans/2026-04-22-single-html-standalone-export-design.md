# Single HTML Standalone Export Design

- Date: 2026-04-22
- Scope: shared `export:html` pipeline with `sportswellness` as the proving project

## Problem

The existing single-HTML exporter only flattened direct HTML-linked assets. It did not preserve:

- local iframe pages
- assignment runtime HTML/JS loaded from script-held relative paths
- nested local assets referenced inside inlined JS

For `sportswellness`, that meant the single-file export dropped games, assignment runtime content, and other embedded course assets.

## Options considered

1. Keep the old exporter and patch `sportswellness` only.
2. Extend the shared exporter to recursively inline local HTML/CSS/JS and convert JS-held paths into embedded assets.
3. Replace single-file export with a recommendation to use Google Hosted only.

## Chosen approach

Option 2.

The exporter should remain a real product feature, not a project-specific workaround. The design uses:

- recursive standalone HTML bundling for local iframe/HTML dependencies
- JS path rewriting so local files referenced in scripts resolve through an embedded asset runtime
- streamed single-file writing so large exports do not require assembling the final document as one massive in-memory string
- a small source-of-truth fix in `sportswellness/assignment-runtime.html` so the assignment fragment loads `assignment-runtime-main.js` instead of recursively reloading the full course `main.js`

## Design notes

- Binary assets should not be cached as giant base64 strings in memory during bundle construction.
- The top-level single-HTML export can keep a lightweight asset manifest and runtime URL resolver.
- Nested HTML assets used as separate documents still need to be bundled standalone so they remain playable when loaded from the single exported HTML.
- The exporter must preserve existing external URLs and only rewrite local workspace resources.

## Validation target

`sportswellness` single-HTML export should complete from the normal `npm run export:html -- --project sportswellness` path and produce one file with no raw local refs to performance pages, assignment runtime files, or workspace assets.
