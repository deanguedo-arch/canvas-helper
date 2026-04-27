# Apps Script Drive-Backed Export Design

**Date:** 2026-04-22

## Goal

Make the `apps-script` export viable for large interactive courses such as `sportswellness` by replacing the oversized in-script payload approach with a thin Apps Script shell and a Drive-backed asset package.

## Recommended Approach

Reuse the shared single-HTML asset-registry bundle as the canonical source for the exported app, then split the result into two delivery layers:

1. A small clasp-ready Apps Script shell that serves the HTML app entrypoint and resolves asset URLs at runtime.
2. A `drive-assets/` package containing the exported HTML, CSS, JS, images, PDFs, and nested activity pages that will be uploaded to Google Drive.

Why this approach:

- The single-HTML bundle builder already understands iframe pages, JS-held asset references, and nested project assets.
- The current payload-chunk model already failed against real course size.
- Keeping Apps Script thin avoids source-size ceilings while staying inside the Google ecosystem.

## Export Shape

The generated export should now contain:

- `appsscript.json`
- `Code.gs`
- `.claspignore`
- `README-deploy.md`
- `drive-assets/asset-manifest.json`
- `drive-assets/__canvas_helper_shell/index.html`
- additional files under `drive-assets/` for every bundled asset

The generated Apps Script project should no longer emit `Index.html` or `PayloadChunk_*.gs`.

## Runtime Model

1. The exporter builds a standalone bundle with asset-registry mode enabled.
2. The shell HTML and text assets are written into `drive-assets/`.
3. `asset-manifest.json` records each asset id, relative path, MIME type, and whether it should be served through Apps Script or directly from Drive.
4. `Code.gs` provides:
   - `doGet(e)` for the app shell
   - `serveTextAsset_(assetId)` for HTML/CSS/JS/JSON text assets
   - Drive-index helpers backed by script properties
   - admin/setup helpers for storing the Drive root folder id and rebuilding the Drive file index
5. The returned shell injects `window.__CH_ASSET__(assetId)` so the exported runtime can resolve rewritten asset ids to either:
   - an Apps Script URL like `?asset=<assetId>` for text assets
   - a Google Drive download/view URL for binary assets

## Drive Storage Rules

- The Drive root folder is provided after export by uploading the `drive-assets/` folder and saving its folder id through an Apps Script helper.
- Apps Script should index files by relative path, not by assumed Drive URLs.
- Binary assets should stay Drive-backed to avoid Apps Script binary-serving complexity.
- Text assets should flow through Apps Script so same-origin HTML, CSS, and JS continue to load cleanly inside the web app.

## Risks and Constraints

- Google Drive URLs and Apps Script web-app URLs may have embedding or auth quirks that require minor runtime tuning.
- Large asset counts may make Drive indexing slow, so the initial pass should cache the relative-path-to-file-id map in script properties.
- Uploaded Drive folders are operational artifacts; the exporter can generate them, but upload remains a deployment step.
- The existing generated package under `projects/<slug>/exports/apps-script/` is now a deploy package, not the deployed app itself.

## Verification Strategy

Minimum verification for this pass:

- targeted Apps Script export contract test
- `npm.cmd run typecheck`
- real `sportswellness` export run
- targeted inspection of the generated `drive-assets/` package shape

## Source of Truth

- export orchestration: `scripts/lib/exports/apps-script.ts`
- Apps Script shell builders: `scripts/lib/apps-script.ts`
- shared bundle builder: `scripts/lib/exports/shared.ts`
- export contract test: `scripts/tests/apps-script-export.test.ts`
