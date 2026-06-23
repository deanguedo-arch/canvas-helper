# Google Script For Courses Runbook

## Purpose

Use this when a Canvas Helper course or module must become a fast-loading Google Apps Script web app, usually for Google Sites embedding or district Google account delivery.

This captures the final working Forensic Studies 25 process after the slow-load, blank-frame, assignment-inline, React bundle, authorization, and deployment-version issues were solved.

## Proven End State

A course Apps Script conversion is not done until all of these are true:

- The shell route opens quickly at the stable `/exec` URL.
- Lessons load inside the module window instead of leaving a slow or blank external frame.
- Assignments render inside the Assignments view.
- Assignments also keep an `Open assignment in new window` link.
- The direct assignment route works at `?view=assignment`.
- Assignment media, CSS, helper JS, React apps, and generated worksheets work in both inline and direct views.
- The active deployment is the existing deployment ID, not a new throwaway URL.
- The active deployment executes as the course owner, normally `Execute as Me`, so learners do not hit per-user authorization prompts.
- Live verification is done in the browser on the deployed `/exec` URL with a cache-busting query.

Forensic Studies 25 Module 5 reached this state on Jun 11, 2026 as Version 7 on the existing deployment ID.

## Source Of Truth

Treat local source and generators as authoritative.

For the Forensics 25 precedent:

```text
projects/forensics-module-builder/tools/generate-apps-script-code.py
projects/forensics-module-builder/meta/module-N-apps-script-code.gs
projects/forensics-module-builder/meta/module-N-apps-script-runtime-code.gs
projects/forensics-module-builder/meta/modules-2-8-apps-script-projects.md
projects/forensics-module-builder/meta/modules-3-8-apps-script-google-sites.md
```

For another course, map the equivalent source locations before editing:

```text
projects/<slug>/workspace/**
projects/<slug>/meta/project.json
projects/<slug>/exports/apps-script/**
scripts/lib/apps-script.ts
scripts/lib/exports/apps-script.ts
scripts/export-apps-script.ts
```

Do not make the Apps Script editor the only source of truth. If an emergency browser edit is required, copy the working fix back into the generator or local runtime file before calling the task finished.

## Runtime Split

Keep two generated Apps Script source shapes.

Full setup/cache source:

- Has Drive setup helpers.
- Has asset index rebuild helpers.
- Can write or rebuild render caches.
- Is useful after Drive files are uploaded, replaced, renamed, or moved.

Runtime-only source:

- Is the student-facing deployed `Code.gs`.
- Does not rebuild Drive indexes on normal page load.
- Does not write render caches on normal page load.
- Serves the small shell first.
- Lazy-loads lesson and assignment HTML after the shell is visible.
- Is the file normally pasted into Apps Script and redeployed.

Rule: use full setup/cache source only for setup or asset rebuilds, then redeploy runtime-only source for learners.

## Route Contract

Each deployed web app should expose predictable routes:

```text
/exec
/exec?view=app
/exec?view=lesson
/exec?view=assignment
/exec?asset=assignment-script&path=<assignment path>
```

The shell response must include:

```javascript
HtmlService.createHtmlOutput(html)
  .setTitle(PROJECT_TITLE)
  .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
```

The stable `/exec` URL matters. Google Sites and student links point to a deployment ID. Creating a new deployment creates a different URL and usually does not update the existing embed.

## Fast Loading Pattern

The first shell route should be light.

Do:

- Render the static module shell first.
- Hydrate lessons only when the lesson frame exists.
- Hydrate assignments only when the assignment view exists.
- Store rendered lesson/assignment HTML in runtime variables or fetch it through small server helpers.
- Write hydrated content into frames with `srcdoc` first.
- Fall back to `document.open()`, `document.write()`, and `document.close()` only when needed.
- Re-run hydration on `load`, `hashchange`, and DOM changes because the static shell may rebuild views.

Avoid:

- Reading every Drive file before first paint.
- Rebuilding Drive indexes during learner page loads.
- Loading assignment apps as nested Apps Script web apps inside another Apps Script web app.
- Treating Apps Script editor save state as proof that the live deployment changed.

For whole-course Drive-backed exports, the fast path has one extra requirement: visible course iframes must not stay pointed at nested Apps Script `?asset=...` wrapper pages built from the sandbox URL. Inside HtmlService, `window.location.href` is usually a `googleusercontent.com/userCodeAppPanel` URL. If the runtime appends `?asset=...` to that URL, the frame loads Google's sandbox bootstrap instead of course HTML and may throw `maeInit_ is not defined`.

The shell should render first, then a client bootstrap should watch for chapter, assignment, game, and viewer iframes. Build asset URLs from `ScriptApp.getService().getUrl()` injected by `Code.gs`, not from the sandbox location. Try the raw `?asset=<id>&raw=1` route and write it into a local `blob:` or `srcdoc` frame when fetch is allowed. If Apps Script blocks that fetch because the shell is running under `googleusercontent.com`, fall back to a normal iframe pointed at the correct deployed `/exec?asset=<id>` URL.

The deployed runtime should show status text while this happens:

```text
Loading chapter workspace...
Loading assignment workspace...
Still loading workspace...
```

If the shell appears but a chapter or assignment area is blank with no loading message, assume the live deployment is still running old `Code.gs` or the frame hydrator was not generated. If the loading message appears and console shows `Failed to fetch`, confirm that the fallback URL is `/exec?asset=...`, not `userCodeAppPanel?asset=...`.

Hydration scripts must be defensive. The final fix included this pattern:

```javascript
var observerTarget = document.body || document.documentElement;
if (observerTarget) {
  new MutationObserver(schedule).observe(observerTarget, { childList: true, subtree: true });
}
```

Do not observe `document.documentElement` unguarded. Direct `googleusercontent.com/userCodeAppPanel` loads can run before the expected node is available.

## PDF Viewer Contract

PDFs should stay Drive-backed, but the embedded viewer should not be a PDF.js fetch from inside Apps Script. The working World Religions 30 fix rewrites PDF viewer iframes to Drive preview URLs:

```text
https://drive.google.com/file/d/<FILE_ID>/preview
```

Keep the normal `Download PDF` link beside the viewer. The preview path is for reading in the course window; the download path is the fallback if Drive iframe viewing is blocked for a learner.

Watch for two Apps Script-specific traps:

- Nested viewer URLs can decode into `asset=asset-158?file=https://drive.google.com/uc?export=download&id=<FILE_ID>`, which means the file ID may appear as a sibling `id` query param instead of inside `file`.
- Expanded modal viewers may reuse an existing iframe and change only its `src`. The hydrator must observe iframe `src` attribute changes, not only newly inserted iframe nodes.

Acceptance checks:

- Library PDF renders inline with Drive viewer controls and page count.
- Expanded viewer renders the same PDF with Drive viewer controls.
- The viewer does not show `Unknown Canvas Helper asset id: asset-158?file=...`.
- Console has no current `Unexpected token '>'` or `window.__CH_ASSET__ is not a function` errors.

## Assignment Inline Contract

Assignments should appear in the module window and still be openable separately.

Required behavior:

- Replace the assignment placeholder or launch card with a real inline assignment frame.
- Add `Open assignment in new window` above or near the frame.
- Point that link to the same deployment at `?view=assignment`.
- Set `target="_blank"` and `rel="noopener"`.
- Write assignment HTML into the inline frame with `srcdoc`.
- Set a practical minimum frame height so the app is usable.

The working shape:

```text
Apps Script shell
  Assignment view
    Open assignment in new window -> /exec?view=assignment
    iframe.assignment-frame using srcdoc
      assignment app
```

Acceptance checks:

- The Assignment navigation opens without leaving the module shell.
- The assignment iframe contains the expected app title.
- The direct `?view=assignment` route contains the same assignment app.
- The direct route has a `Back to module` link.

## Assignment Asset Patching

`srcdoc` changes relative path behavior. Patch assignment assets before the HTML enters the inline frame.

Common references to handle:

```text
./forensic-assignment-theme.css
./forensic-assignment-print.js
./moduleN/
assignment/moduleN/
*.svg
*.png
*.jpg
*.js
```

Use these fixes:

- Inline small CSS and helper JS.
- Serve larger assignment scripts through an Apps Script asset route.
- Convert required assignment images/SVGs to Drive-backed `data:` URLs when they must work inside `srcdoc`.
- Rebuild the Drive asset index after Drive file IDs change.
- If a file is already embedded in the runtime source, do not also require a Drive upload for the same fix.

## React Or Generated Assignment Apps

React assignment apps need special care. Module 5 failed because the live assignment mixed a bundled React app with external React imports, causing React instance/runtime mismatch.

The final working pattern:

```text
module5assignment.jsx
module5assignment-entry.jsx
module5assignment.bundle.js
module5assignment.app.js
module5assignment.html
```

Local static package:

- `module5assignment.jsx` imports local packages such as `react` and `lucide-react`.
- `module5assignment-entry.jsx` mounts the app with `createRoot`.
- `module5assignment.bundle.js` is built as an IIFE for local static delivery.
- `module5assignment.html` loads the local bundle as a normal script.

Apps Script live runtime:

- `module5assignment.app.js` is a small clean ESM module.
- The runtime embeds that app module in `ASSIGNMENT_APP_MODULE_BUNDLES`.
- The runtime patches the assignment HTML so it imports the embedded app module through a blob URL.
- The deployed runtime stays small enough to paste and save in Apps Script.

Commands used for the Module 5 shape:

```bash
npx esbuild projects/forensics-module-builder/workspace/source-package/workspace-source/assignments/module5assignment-entry.jsx --bundle --format=iife --platform=browser --jsx=transform --outfile=projects/forensics-module-builder/workspace/source-package/workspace-source/assignments/module5assignment.bundle.js
npx esbuild /tmp/module5assignment-app-source.jsx --format=esm --platform=browser --jsx=transform --outfile=projects/forensics-module-builder/workspace/source-package/workspace-source/assignments/module5assignment.app.js
```

Do not paste a giant bundled assignment app into Apps Script if a smaller embedded ESM module will work. The oversized Code.gs path made the editor slow and fragile.

## Deployment Loop

Use this sequence for each module or course.

1. Confirm source-of-truth files.
   Identify the canonical workspace, generator, metadata, Drive folder ID, Apps Script project ID, and existing deployment ID.

2. Generate or update the runtime files.
   For Forensics 25 modules:

   ```bash
   python3 projects/forensics-module-builder/tools/generate-apps-script-code.py --module <N> --drive-folder-id <N>=<DRIVE_FOLDER_ID>
   python3 projects/forensics-module-builder/tools/generate-apps-script-code.py --module <N> --drive-folder-id <N>=<DRIVE_FOLDER_ID> --runtime-only
   ```

3. Validate generated source locally.

   ```bash
   python3 -m py_compile projects/forensics-module-builder/tools/generate-apps-script-code.py
   cp projects/forensics-module-builder/meta/module-<N>-apps-script-code.gs /tmp/module-<N>-full.js && node --check /tmp/module-<N>-full.js
   cp projects/forensics-module-builder/meta/module-<N>-apps-script-runtime-code.gs /tmp/module-<N>-runtime.js && node --check /tmp/module-<N>-runtime.js
   ```

4. If assets changed, update Drive first.
   Upload or replace the needed asset files. Run the full setup/cache source or helper if file IDs changed.

5. Paste runtime-only source into Apps Script.
   Use the existing Apps Script project. Replace `Code.gs`, save, then reopen or refresh the editor if you need to confirm Google received the saved source.

6. Edit the existing deployment.
   In Apps Script:

   ```text
   Deploy -> Manage deployments -> Edit active deployment
   Version -> New version
   Execute as -> Me (<owner account>)
   Who has access -> intended district/classroom audience
   Deploy
   ```

7. Keep the same `/exec` URL.
   Confirm the deployment result still shows the original deployment ID and URL.

8. Live-verify with cache busting.

   ```text
   https://script.google.com/.../exec?view=app&v=<version>&cb=<timestamp>#assignment
   https://script.google.com/.../exec?view=assignment&v=<version>&cb=<timestamp>
   ```

## Browser Verification Gate

Verify the live deployment in the same account context students will use.

For the module app:

- Overview renders.
- Lesson renders inside the module window.
- Assignment navigation renders the Assignments view.
- Assignment view contains `Open assignment in new window`.
- Inline assignment frame contains the expected app.
- No meaningful console errors appear.

For the direct assignment route:

- `?view=assignment` loads without an authorization prompt.
- Assignment app title appears.
- First interaction tab or slider works.
- Worksheet tab or required assignment state renders.
- `Back to module` points back to `?view=app#assignment`.

For Google Sites:

- Verify the Sites embed separately after the direct `/exec` route passes.
- Google Sites adds another iframe and can cache stale state.

Do not use `curl` as proof. Apps Script and Drive often return wrapper, redirect, or account-specific pages outside the browser session.

## Deployment Settings That Matter

Use `Execute as Me` for course delivery unless there is a deliberate reason to make every learner authorize the script.

What went wrong:

- Module 5 Version 6 was deployed as `Execute as User accessing the web app`.
- The live app then showed `Authorization required`.
- Changing the same deployment back to `Execute as Me (dean.guedo@eips.ca)` and deploying Version 7 removed the learner-facing auth prompt.

Keep access scoped to the intended audience, such as `Anyone within Elk Island Public Schools`, if that is the district requirement.

## Known Traps And Fixes

Blank or dark assignment panel:

- Do not nest an Apps Script web app inside another Apps Script shell.
- Render assignment HTML inline with `srcdoc`.

Assignment works in new window but not inline:

- Patch relative CSS, JS, image, and SVG references for `srcdoc`.
- Inline small support files or serve them through a runtime asset route.

Page title loads but the body is blank:

- Inspect inside the Apps Script sandbox iframe.
- Check for authorization prompts hidden behind the wrapper.
- Check console errors on the `googleusercontent.com/userCodeAppPanel` page.

`MutationObserver.observe` throws because target is not a Node:

- Guard the observer target with `document.body || document.documentElement`.

Live page still shows old behavior:

- Make sure you edited the existing deployment and selected `New version`.
- Use a cache-busting query.
- Confirm the stable `/exec` deployment ID did not change.

Apps Script editor save hangs:

- Open the same project in a fresh tab and check whether Google has the saved source.
- Keep runtime-only source small.
- Avoid pasting giant generated bundles when a small embedded module works.

Drive upload automation fails with file access:

- Prefer an embedded runtime fix if possible.
- If Drive upload is required, Chrome extension file access may need to be enabled.
- If file IDs change, rerun the Drive asset index rebuild.

`clasp` is unavailable:

- In this EIPS account, `clasp show-authorized-user --json` returned `loggedIn: false`, and OAuth was blocked by district policy.
- Use the logged-in Chrome Apps Script editor path unless EIPS IT whitelists the OAuth app.

## Future-Course Checklist

Before conversion:

- Identify slug/module list.
- Identify canonical workspace source.
- Identify assignment apps and frameworks.
- Identify Drive folder strategy.
- Identify Apps Script project IDs.
- Identify existing deployment IDs and live URLs.

Build:

- Generate full setup/cache source.
- Generate runtime-only source.
- Patch assignment inline frame behavior.
- Patch assignment assets for `srcdoc`.
- Build React/generated apps into a single compatible runtime shape.
- Keep shell first paint light.

Validate locally:

- Run syntax checks on generated `.gs` copied as `.js`.
- Run package/audit scripts if the project has them.
- Preview shell, lesson, inline assignment, and direct assignment locally.

Deploy:

- Paste runtime-only source.
- Save.
- Edit existing deployment.
- Select `New version`.
- Set `Execute as Me`.
- Keep the same `/exec` URL.

Verify live:

- Open `?view=app#assignment` with cache busting.
- Open `?view=assignment` with cache busting.
- Check assignment interaction and worksheet state.
- Check console errors.
- Then verify Google Sites embed if applicable.

Record:

- Update the module/course matrix with project ID, Drive folder ID, deployment ID, version, live URL, and verification result.
- Update `docs/ops/ACTIVE_HANDOFF.md` with the exact next file and command.
- Archive or correct stale notes that still claim a fixed module is broken.

## Exact Reuse Prompt

Use this prompt when applying the pattern to another course:

```text
Mode: DEFAULT
Workflow: generated-course or conversion, based on project metadata
Target: <course slug or module list>
Task: Convert this course/module set to the proven fast Google Apps Script runtime.
Boundary: canonical workspace/generator/runtime source plus required deploy metadata.
Requirements:
- light shell first paint
- lazy lesson hydration
- inline assignment iframe with srcdoc
- Open assignment in new window route
- direct ?view=assignment route
- patched assignment assets for srcdoc
- React/generated apps use one compatible runtime shape
- runtime-only deployed source
- existing deployment ID redeployed as a new version
- Execute as Me unless explicitly changed
- live browser verification with cache busting
Success criteria:
- shell, lesson, inline assignment, direct assignment, and worksheet/app interactions pass live
- no learner authorization prompt
- no meaningful runtime console errors
- project matrix and handoff are updated
```
