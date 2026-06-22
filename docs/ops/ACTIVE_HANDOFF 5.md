# Handoff

## Summary

- Project: `forensics-module-builder`
- Task: Fix the remaining Module 5 assignment-app React/bundle issue.
- Status: source fixed and locally verified. Live deployment is pending because the Chrome extension file upload was blocked and the Apps Script editor automation became unavailable after an oversized Code.gs paste attempt.
- Current live Module 5 deployment is still Version 5 and should still be treated as partial until the smaller regenerated runtime source is pasted/deployed.

## Files Changed

- `docs/ops/ACTIVE_HANDOFF.md`
- `projects/forensics-module-builder/tools/generate-apps-script-code.py`
- `projects/forensics-module-builder/workspace/source-package/workspace-source/assignments/module5assignment.jsx`
- `projects/forensics-module-builder/workspace/source-package/workspace-source/assignments/module5assignment-entry.jsx`
- `projects/forensics-module-builder/workspace/source-package/workspace-source/assignments/module5assignment.bundle.js`
- `projects/forensics-module-builder/workspace/source-package/workspace-source/assignments/module5assignment.app.js`
- `projects/forensics-module-builder/workspace/source-package/workspace-source/assignments/module5assignment.html`
- `projects/forensics-module-builder/dist/module-5-static/assignment/module5assignment.jsx`
- `projects/forensics-module-builder/dist/module-5-static/assignment/module5assignment-entry.jsx`
- `projects/forensics-module-builder/dist/module-5-static/assignment/module5assignment.bundle.js`
- `projects/forensics-module-builder/dist/module-5-static/assignment/module5assignment.app.js`
- `projects/forensics-module-builder/dist/module-5-static/assignment/module5assignment.html`
- `projects/forensics-module-builder/meta/module-5-apps-script-code.gs`
- `projects/forensics-module-builder/meta/module-5-apps-script-runtime-code.gs`
- `projects/forensics-module-builder/packages/module-5-static.zip`
- `projects/forensics-module-builder/meta/modules-3-8-apps-script-google-sites.md`
- `projects/forensics-module-builder/meta/modules-2-8-apps-script-projects.md`

## Verification Run

- `npx esbuild projects/forensics-module-builder/workspace/source-package/workspace-source/assignments/module5assignment-entry.jsx --bundle --format=iife --platform=browser --jsx=transform --outfile=projects/forensics-module-builder/workspace/source-package/workspace-source/assignments/module5assignment.bundle.js`
- `npx esbuild /tmp/module5assignment-app-source.jsx --format=esm --platform=browser --jsx=transform --outfile=projects/forensics-module-builder/workspace/source-package/workspace-source/assignments/module5assignment.app.js`
- `python3 projects/forensics-module-builder/tools/generate-module.py --module 5`
- `python3 projects/forensics-module-builder/tools/audit-module.py projects/forensics-module-builder/dist/module-5-static`: passed with `issues: []`.
- `python3 projects/forensics-module-builder/tools/package-modules.py --module 5`
- `python3 -m py_compile projects/forensics-module-builder/tools/generate-apps-script-code.py`
- `python3 projects/forensics-module-builder/tools/generate-apps-script-code.py --module 5 --drive-folder-id 5=1IhHe1abV8AhCRAr3dAJIJOtkapchvwEF`
- `python3 projects/forensics-module-builder/tools/generate-apps-script-code.py --module 5 --drive-folder-id 5=1IhHe1abV8AhCRAr3dAJIJOtkapchvwEF --runtime-only`
- `cp projects/forensics-module-builder/meta/module-5-apps-script-code.gs /tmp/module-5-full.js && node --check /tmp/module-5-full.js`
- `cp projects/forensics-module-builder/meta/module-5-apps-script-runtime-code.gs /tmp/module-5-runtime.js && node --check /tmp/module-5-runtime.js`
- `node --check projects/forensics-module-builder/workspace/source-package/workspace-source/assignments/module5assignment.app.js`
- `node --check projects/forensics-module-builder/workspace/source-package/workspace-source/assignments/module5assignment.bundle.js`
- Local Playwright static assignment check at `http://127.0.0.1:8915/assignment/module5assignment.html`: rendered `BAC Impairment Simulator`, switched to `Assignment Worksheet`, rendered `Impaired Driving Assignment`, no error overlay.
- Local Playwright shell check at `http://127.0.0.1:8915/#assignment`: assignment iframe rendered `BAC Impairment Simulator`, switched to `Assignment Worksheet`, rendered `Impaired Driving Assignment`, no error overlay.

## Known Risks / Follow-Up

- Live deployment is not complete. The new 71 KB runtime source at `projects/forensics-module-builder/meta/module-5-apps-script-runtime-code.gs` still needs to be pasted into the Module 5 Apps Script project and redeployed on the existing deployment ID.
- The failed Drive upload returned the Chrome extension file-access error: `fileChooser.setFiles failed` / `Not allowed`.
- A temporary oversized 1.25 MB Code.gs paste was attempted before switching to the smaller `.app.js` embedding strategy. If the Apps Script editor opens slowly, replace the editor contents with the current 71 KB runtime file.
- Do not upload the bundle to Drive unless Chrome file uploads are fixed. The current runtime embeds `module5assignment.app.js` and patches the old Drive HTML in memory, so Drive upload is not required for the next deploy.
- Google Sites embed verification is still separate from direct `/exec` verification.

## Source-Of-Truth Location

- Module 5 assignment app source: `projects/forensics-module-builder/workspace/source-package/workspace-source/assignments/module5assignment.jsx`
- Module 5 local entry: `projects/forensics-module-builder/workspace/source-package/workspace-source/assignments/module5assignment-entry.jsx`
- Module 5 local standalone bundle: `projects/forensics-module-builder/workspace/source-package/workspace-source/assignments/module5assignment.bundle.js`
- Module 5 Apps Script clean ESM app module: `projects/forensics-module-builder/workspace/source-package/workspace-source/assignments/module5assignment.app.js`
- Module 5 deployed runtime source to paste: `projects/forensics-module-builder/meta/module-5-apps-script-runtime-code.gs`
- Shared Apps Script generator: `projects/forensics-module-builder/tools/generate-apps-script-code.py`

## Fragile Areas / What Might Drift

- The live Apps Script editor may currently contain the failed oversized Code.gs source or the previous Version 5 source. Treat local `module-5-apps-script-runtime-code.gs` as authoritative.
- Apps Script editor source can drift from local generated runtime files if edited by hand in Chrome.
- Chrome extension file upload requires Chrome extension file URL access; Drive file upload is currently blocked from automation.
- The local package uses `module5assignment.bundle.js`; the live Apps Script runtime embeds `module5assignment.app.js` and patches the existing Drive HTML in memory.

## Next Prompt Assumptions

- Treat Module 5 as fixed locally but not yet live-deployed.
- Treat Modules 1, 2, 3, 4, 6, 7, and 8 as fast runtime deployments and direct-browser verified.
- Use the user's logged-in Chrome/EIPS session for the next deploy if the Chrome extension is available again.
- If the Chrome extension is still unavailable, ask the user to reload/repair the extension or perform the paste/deploy manually from the exact file below.

## Exact Next Command

```bash
cp projects/forensics-module-builder/meta/module-5-apps-script-runtime-code.gs /tmp/module-5-runtime.js && node --check /tmp/module-5-runtime.js
```

## Exact Next File To Open

```text
projects/forensics-module-builder/meta/module-5-apps-script-runtime-code.gs
```
