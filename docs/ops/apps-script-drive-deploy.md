# Apps Script Drive Deploy Workflow

## Purpose

Use this workflow when a course must stay inside the Google ecosystem and be embedded in Google Sites without Firebase Hosting or another external host.

This path is for large Canvas Helper courses where a single HTML file is not enough because the course includes images, PDFs, assignment runtimes, local interactive games, or other assets that need stable Google-backed delivery.

## Architecture

`npm run export:apps-script -- --project <slug>` writes a package under:

```bash
projects/<slug>/exports/apps-script/
```

The package has two parts:

- Apps Script shell files: `Code.gs`, `appsscript.json`, `.claspignore`, and `README-deploy.md`.
- Google Drive assets: `drive-assets/__canvas_helper_shell/index.html`, `drive-assets/text-assets/**`, `drive-assets/binary-assets/**`, and `drive-assets/asset-manifest.json`.

Apps Script serves the shell with `HtmlService`. Google Drive stores the exported course assets. Text assets are read by Apps Script and injected into the page as script-safe maps so assignment HTML, game HTML, CSS, and JS can load as raw text or `blob:` URLs. Binary assets stay Drive-backed, with image and PDF URLs rewritten by the generated asset resolver.

When `projects/<slug>/meta/project.json` declares `googleHosted.trackedStorageKeys`, the Apps Script package also injects an autosave bridge. The bridge polls tracked `localStorage` keys, listens for same-origin iframe storage events, and saves changed keys through `google.script.run` into private JSON files in the script owner's Drive. It does not patch browser storage prototypes, because the course shell, assignment runtimes, and game iframes must keep their native storage behavior.

## Large Course Pattern

Use this pattern for Google Sites delivery when the course is too large or too interactive for a single HTML export.

- Keep the generated Apps Script project small: only `Code.gs`, `appsscript.json`, `.claspignore`, and deploy notes belong in Apps Script.
- Put the exported `drive-assets` folder in Google Drive and set that exact folder as the Apps Script root. Do not point Apps Script at the parent course folder.
- Serve runtime text assets through Apps Script maps, not direct Drive pages. Assignments, games, CSS, and JS should resolve through `window.__CH_TEXT_ASSET__`, `window.__CH_ASSET__`, `blob:` URLs, `srcdoc`, or the guarded text-asset `fetch` shim.
- Leave binary assets Drive-backed. Images should resolve to Drive thumbnail/download style URLs; PDFs and slides should use preview/download behavior instead of raw Apps Script wrapper pages.
- Use Apps Script autosave as a non-invasive bridge. Poll tracked keys and listen for storage events; do not patch `localStorage`, `Storage.prototype`, `fetch` broadly, timers, or iframe messaging.
- Treat every deploy as versioned. Create a new Apps Script version, then redeploy the exact deployment ID already used by Google Sites. Creating a new deployment usually creates a different `/exec` URL and does not update the embedded one.
- Browser-verify from the live `/exec` URL in the same Google account context students will use. Command-line `curl` is not a reliable live check because Apps Script and Drive often return account or Drive wrapper pages outside the browser session.

## What We Learned From Sports Wellness

The working large-course path was:

1. Export an Apps Script package from the canonical workspace.
2. Upload the generated `drive-assets` folder to Google Drive.
3. Set the Drive root folder ID in Apps Script with a no-argument helper.
4. Run `rebuildDriveAssetIndex()`.
5. Push `Code.gs` with `clasp push --force`.
6. Create an immutable version with `clasp version`.
7. Redeploy every existing non-HEAD deployment ID to that version.
8. Verify the live `/exec` URL in a browser.

The broken paths were:

- Pasting browser files into Apps Script as `.gs` files. That creates server-side `document is not defined` errors.
- Serving game or assignment HTML through normal Apps Script wrapper pages. That causes `Missing runtime view`, blank game panels, or assignment `Failed to fetch` errors.
- Patching `localStorage` globally for autosave. That can break assignment and game runtimes, especially when the course uses iframes, `srcdoc`, or embedded game scripts.
- Assuming Google Sites updated because `clasp deploy` created a new deployment. The embedded URL only updates when the same deployment ID is redeployed.

## One-Time Setup

1. Generate the package:

```bash
npm.cmd run export:apps-script -- --project <slug>
```

2. Upload `projects/<slug>/exports/apps-script/drive-assets` to Google Drive.

Use the uploaded `drive-assets` folder as the root. The root folder must directly contain `asset-manifest.json`, `__canvas_helper_shell`, `text-assets`, and `binary-assets`.

3. Create or link a standalone Apps Script project in the export folder.

```bash
Set-Location "C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\<slug>\exports\apps-script"
clasp login
clasp create --type webapp --title "<slug>"
```

If `.clasp.json` already exists, keep using it. The exporter preserves it across reruns.

4. Push the shell files:

```bash
clasp push --force
```

5. Store the Drive root folder ID in Apps Script.

Apps Script's Run button cannot pass arguments into `setDriveRootFolderId(folderId)`. Add a temporary project helper in `Code.gs`, push it, run it once in the Apps Script editor, then remove or keep it intentionally:

```javascript
function setupCourseDrive() {
  return setDriveRootFolderId("DRIVE_ASSETS_FOLDER_ID");
}
```

The folder ID is the value after `/folders/` in the Google Drive URL for the uploaded `drive-assets` folder.

6. Rebuild the asset index:

```javascript
rebuildDriveAssetIndex()
```

Run `rebuildDriveAssetIndex()` in the Apps Script editor after setting the folder ID and after replacing the Drive assets.

7. Deploy as a web app.

Use the Apps Script `/exec` URL in Google Sites with `Insert > Embed > By URL`.

For cross-device autosave, learners must open the course while signed into a Google account. Anonymous access can load the course, but it cannot reliably identify the same learner across devices.
Generated autosave scripts prefer the signed-in user's email when Apps Script exposes it, fall back to Google's temporary active-user key, and fail instead of writing shared `anonymous` autosave records when neither key is available.

## Update And Redeploy Loop

Use this loop after changing course source files or exporter behavior.

1. Make edits in the canonical source, usually `projects/<slug>/workspace/**` or shared exporter code under `scripts/**`.

2. Run the focused tests for the changed path:

```bash
npm.cmd run test:apps-script
npx tsx --test scripts/tests/<slug>-apps-script-runtime.test.ts
```

3. Regenerate the package:

```bash
npm.cmd run export:apps-script -- --project <slug>
```

4. Replace the uploaded Google Drive `drive-assets` folder when assets changed.

If only `Code.gs` behavior changed and the existing Drive upload already has the needed files, a Drive re-upload may not be required. If files were added, removed, or renamed, refresh the uploaded folder and rerun `rebuildDriveAssetIndex()`.

5. Push Apps Script shell changes:

```bash
Set-Location "C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\<slug>\exports\apps-script"
clasp push --force
```

6. Create a new immutable Apps Script version:

```bash
clasp version "<short deploy note>"
```

7. List deployments and redeploy the exact deployment IDs used by Google Sites:

```bash
clasp deployments
clasp deploy -i <DEPLOYMENT_ID> -V <VERSION_NUMBER> -d "<short deploy note>"
```

Do not assume a new deployment updates an old embedded `/exec` URL. Existing URLs point at specific deployment IDs, so redeploy the ID already embedded in Google Sites.

8. Hard refresh the browser and verify the live `/exec` URL.

9. Confirm autosave creates or updates the private owner Drive folder:

```text
Canvas Helper Autosaves - <slug>
```

## Verification Checklist

Run the smallest checks that cover the changed behavior:

```bash
npm.cmd run test:apps-script
npx tsx --test scripts/tests/<slug>-apps-script-runtime.test.ts
npm.cmd run export:apps-script -- --project <slug>
```

Then verify the live Apps Script web app in the browser:

- Course shell loads without `Missing runtime view` messages.
- Lesson images render.
- Assignment pages open and do not show `Failed to fetch`.
- Performance games render and play inside their frames.
- Slides and PDFs open or download through Drive-backed URLs.
- The autosave pill reaches `Autosave ready` after a tracked value changes.
- A second browser session signed into the same Google account restores the saved progress.
- The Google Sites embed uses the same deployment ID that was redeployed.

## Troubleshooting

`Script function not found: doGet`

The deployment is not using the generated `Code.gs`, or the wrong Apps Script project was deployed. Push the package from `projects/<slug>/exports/apps-script` and redeploy.

`Drive asset not indexed: asset-manifest.json`

The stored folder ID is wrong or the index is stale. Set the folder ID to the uploaded `drive-assets` folder, not its parent, then run `rebuildDriveAssetIndex()`.

`ReferenceError: document is not defined`

A browser HTML or JS asset was pasted into Apps Script as `.gs`. Only the shell files belong in Apps Script. The generated `drive-assets` folder belongs in Google Drive.

`Missing runtime view: phase1`, `Missing runtime view: values`, or assignment pages fail to fetch

The assignment runtime is receiving a wrapper page or failed asset request instead of raw HTML. Check that the generated `Code.gs` contains `window.__CH_TEXT_ASSET_MAP__`, `window.__CH_TEXT_ASSET__`, blob URL generation, and the guarded text-asset fetch shim.

Blank performance game panel

The game iframe is usually pointing at an Apps Script wrapper URL instead of raw game HTML. The course runtime should load embedded text assets through `window.__CH_TEXT_ASSET__`, `blob:` URLs, or `srcdoc`, and local game CSS/JS must be inlined or present in `text-assets`.

`Failed to load ... userCodeAppPanel?asset=asset-40`

The live deployment is still running an older Apps Script shell. Push the current `Code.gs`, create a new version, and redeploy the exact deployment ID used by the browser URL.

Google `403` page inside an iframe

The Drive-backed file is not shared to the viewer, the URL is not a Drive preview/download URL, or the viewer is not signed into an account with access.

Console noise about SES, unrecognized iframe features, or dropped `postMessage`

These are common Apps Script sandbox warnings. Treat them as noise unless there is a visible course failure at the same time.

`Autosave unavailable`

The page did not get the Apps Script `google.script.run` bridge. Confirm the course is running from the deployed Apps Script `/exec` URL, not from local preview, a raw Drive file, or a copied HTML file.

`Autosave failed`

Open Apps Script executions and check the server error. Common causes are missing Drive authorization, Drive quota limits, or a deployment that has not been reauthorized after adding Drive write behavior.

Autosave does not follow the learner to another computer

Confirm the learner is signed into the same Google account in both sessions. The Apps Script bridge uses Google's active-user key; anonymous or mixed-account browser sessions cannot provide reliable cross-device identity.

## Source Of Truth

- Shared exporter: `scripts/lib/apps-script.ts`
- Export orchestration: `scripts/lib/exports/apps-script.ts`
- CLI entry: `scripts/export-apps-script.ts`
- Base export test: `scripts/tests/apps-script-export.test.ts`
- Project runtime tests: `scripts/tests/<slug>-apps-script-runtime.test.ts`
- Canonical course source: `projects/<slug>/workspace/**`
- Tracked autosave keys: `projects/<slug>/meta/project.json` under `googleHosted.trackedStorageKeys`
- Generated package: `projects/<slug>/exports/apps-script/**`
