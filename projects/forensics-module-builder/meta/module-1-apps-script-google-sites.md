# Forensics Module 1 Apps Script / Google Sites Handoff

Date: 2026-06-09

## Purpose

Record the manual no-`clasp` Google Apps Script deployment path for Forensics 25 Module 1.

This exists because district workstation restrictions may block `clasp`, but browser-based Apps Script editing is available. The goal is to get Module 1 running inside Google Sites while preserving the existing static module files as the source asset package.

## Current Status

Module 1 has been manually uploaded to Google Drive and served through a browser-created Apps Script project.

Working:

- Main Module 1 shell loads from Apps Script.
- Lesson route loads inside the shell.
- Lesson images work after being embedded as Drive `data:` URLs.
- Quiz renders and scores locally.
- Assignment works from the standalone Apps Script route `?view=assignment`.

Known limitation:

- The assignment React app does not reliably run when nested inside the main Apps Script page iframe. The stable direction is same-tab navigation to `?view=assignment`, with a `Back to module` button inside the assignment view.

## Google Drive Root

Use this Drive folder ID as the Module 1 asset root:

```text
1h6FwBN3GbDn0Swxyv-S1ZwIzehijTPAw
```

That folder must directly contain:

```text
index.html
lesson.html
module-1.js
module-1-data.js
styles.css
assignment/
assets/
```

Do not upload these as Google Docs. Disable Drive's upload conversion setting before uploading `.html` files.

## Current Code.gs Direction

The current Apps Script shell should:

- Serve the main module at `/exec`.
- Serve the assignment app at `/exec?view=assignment`.
- Serve the assignment bundle through `?asset=assignment-bundle`.
- Embed lesson images as base64 `data:` URLs.
- Replace broken nested assignment iframes with a same-tab assignment launcher.
- Add a `Back to module` link inside the assignment app.

Use this folder ID in `Code.gs`:

```javascript
const DEFAULT_DRIVE_ROOT_FOLDER_ID = '1h6FwBN3GbDn0Swxyv-S1ZwIzehijTPAw';
```

After changing `Code.gs`, run these Apps Script functions in the browser editor:

```text
setupModuleOneDrive
rebuildDriveAssetIndex
```

Then deploy a new web app version and hard refresh the `/exec` URL.

## Why Same-Tab Assignment Routing

The assignment bundle works when Apps Script serves it as its own page. It fails or shows only a dark empty panel when nested inside another Apps Script iframe.

Google Sites adds another embed layer, so the more stable delivery pattern is:

```text
Google Sites embed
  Apps Script module shell
    lesson rendered inline/srcdoc
    quiz rendered in shell
    assignment opens same Apps Script deployment at ?view=assignment
```

This avoids popups while also avoiding the nested iframe failure.

## Source Of Truth

Static Module 1 package:

```text
projects/forensics-module1/workspace/module-1-static/
```

Generator source:

```text
scripts/build-forensics-module1-static.ts
```

Broader static module-builder handoff:

```text
projects/forensics-module-builder/meta/google-sites-conversion.md
```

## Next Step

Finish verifying the same-tab assignment route inside the live Apps Script `/exec` URL:

```text
Main shell -> Assignments -> Open assignment -> ?view=assignment -> Back to module
```

If that passes, embed the Apps Script `/exec` URL in Google Sites.

After Module 1 is accepted, use this as the manual proof pattern for Modules 2-8 or convert the pattern into a generated Apps Script package for the module-builder outputs.

## Known Risks

- Apps Script and Google Sites both sandbox iframe content, so nested assignment apps can fail even when the standalone assignment page works.
- Drive upload conversion can silently turn `.html` files into Google Docs; those files will break Apps Script text serving.
- If files are replaced in Drive, rerun `rebuildDriveAssetIndex`.
- If the Apps Script deployment is updated, make sure Google Sites uses the latest `/exec` deployment URL or redeploys the same deployment ID.

## Exact Next Command

```powershell
git status --short --branch
```

## Exact Next File To Open

```text
projects/forensics-module-builder/meta/module-1-apps-script-google-sites.md
```
