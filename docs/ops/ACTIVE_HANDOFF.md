# Handoff

- Project: `sportswellness` Apps Script export/runtime
- Task: repair and document Drive-backed Apps Script delivery for assignments, performance games, and autosave
- Status: patched, exported, pushed, redeployed to Apps Script version `35`, and documented for reuse

## Summary
- The shared Apps Script exporter now injects script-safe `window.__CH_TEXT_ASSET_MAP__` and `window.__CH_TEXT_ASSET_MIME_MAP__` values containing Apps Script-served text assets read from Drive.
- The injected bootstrap exposes `window.__CH_TEXT_ASSET__(assetId)`, creates cached `blob:` URLs for embedded text assets, and includes a guarded `fetch` shim for mapped `?asset=` text requests.
- `sportswellness` now checks `window.__CH_TEXT_ASSET__` inside `fetchTextAsset()` and inlines embedded assignment runtime scripts inside `ensureScriptLoaded()` before falling back to network loading.
- The first Apps Script repair build restored assignments and games at version `26`; the current safe-autosave build supersedes it at version `35`.
- The Apps Script Drive deploy process is now documented as a reusable ops workflow covering Drive upload, root folder ID setup, asset indexing, `clasp` push/version/deploy, exact deployment-ID redeploys, and troubleshooting.
- The reusable large-course Google Sites pattern is now explicit: Apps Script stays as the shell, Drive stores assets, runtime text assets are embedded/served as text or `blob:` URLs, autosave polls tracked keys without storage prototype patches, and existing Google Sites deployment IDs must be redeployed in place.
- Apps Script autosave is now generated into `Code.gs`. It tracks the Sports Wellness storage keys from project metadata, restores remote progress after the shell loads, polls for changed keys, and saves through `google.script.run` into private Drive JSON files without patching browser storage prototypes.
- The regenerated Sports Wellness package was pushed, versioned as `35`, and all known non-HEAD deployments were redeployed to `@35`.

## Files changed
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/apps-script-drive-deploy.md`
- `docs/ops/FAST_PATHS.md`
- `docs/ops/README.md`
- `docs/workflows/conversion.md`
- `README.md`
- `ARCHITECTURE.md`
- `projects/sportswellness/meta/project.json`
- `docs/plans/2026-04-23-sportswellness-apps-script-runtime-design.md`
- `docs/plans/2026-04-23-sportswellness-apps-script-runtime.md`
- `projects/sportswellness/workspace/main.js`
- `projects/sportswellness/workspace/pdf-viewer.html`
- `scripts/lib/apps-script.ts`
- `scripts/tests/apps-script-export.test.ts`
- `scripts/tests/sportswellness-apps-script-runtime.test.ts`
- `scripts/tests/sportswellness-performance-menu.test.ts`
- Generated package refreshed under `projects/sportswellness/exports/apps-script/**`

## Verification run
- `npx tsx --test scripts/tests/apps-script-export.test.ts`
- `npx tsx --test scripts/tests/apps-script-export.test.ts scripts/tests/sportswellness-apps-script-runtime.test.ts`
- `npx tsx --test scripts/tests/apps-script-export.test.ts scripts/tests/sportswellness-apps-script-runtime.test.ts scripts/tests/sportswellness-performance-menu.test.ts`
- `npx tsx --test scripts/tests/apps-script-export.test.ts scripts/tests/sportswellness-apps-script-runtime.test.ts scripts/tests/sportswellness-performance-menu.test.ts scripts/tests/sportswellness-google-hosted.test.ts`
- `npx tsx --test scripts/tests/project-manifest-policy.test.ts`
- `npm.cmd run export:apps-script -- --project sportswellness`
- `rg -n "patchLocalStorage|Object\.getPrototypeOf|storageProto|setInterval|detectAndQueueSave|safeGetItem|saveCanvasHelperAutosave|__CH_TEXT_ASSET__" projects\sportswellness\exports\apps-script\Code.gs`
- `clasp push --force`
- `clasp version "sportswellness apps-script blob text assets"` created version `26`
- `clasp deploy -i <known deployment id> -V 26 -d "sportswellness apps-script blob text assets"` for all known non-HEAD deployments
- `clasp version "sportswellness apps-script autosave bridge"` created version `32`
- `clasp deploy -i <known deployment id> -V 32 -d "sportswellness apps-script autosave bridge"` for all known non-HEAD deployments
- `clasp version "sportswellness apps-script safe autosave polling"` created version `35`
- `clasp deploy -i <known deployment id> -V 35 -d "sportswellness apps-script safe autosave polling"` for all known non-HEAD deployments
- `clasp deployments`
- `rg -n "Apps Script Drive Deploy|apps-script-drive-deploy|Drive-backed|deployment ID|rebuildDriveAssetIndex" README.md ARCHITECTURE.md docs/ops docs/workflows`
- `rg -n "Large Course Pattern|What We Learned From Sports Wellness|non-invasive|exact deployment ID|browser storage prototypes" docs\ops\apps-script-drive-deploy.md docs\workflows\conversion.md README.md docs\ops\ACTIVE_HANDOFF.md`
- `git diff --check -- README.md ARCHITECTURE.md docs\ops\README.md docs\ops\FAST_PATHS.md docs\ops\apps-script-drive-deploy.md docs\workflows\conversion.md docs\ops\ACTIVE_HANDOFF.md`
- `npm.cmd run typecheck` was attempted and failed on unrelated existing `forensicstudiesoption2` and `worldreligions30-option1` TypeScript errors outside this task.

## Known risks / follow-up
- The Apps Script shell should work with the current Drive upload because the new `Code.gs` bootstrap turns embedded text assets into `blob:` URLs and also handles stale shell fetches for mapped text assets.
- For clean source alignment, the refreshed `projects/sportswellness/exports/apps-script/drive-assets` folder can still be re-uploaded to Drive and followed by `rebuildDriveAssetIndex()`, but that should not be required just to unbreak assignments and games.
- `curl` against the `/exec` URL still returns a Google Drive page from the unauthenticated command environment, so live visual verification should be done in the user's browser session.
- Autosave identity depends on the active Google account key. It should work cross-device only when learners use the same signed-in Google account; anonymous or mixed-account sessions can still be unreliable.
- Version `35` intentionally replaced the version `32` autosave prototype patch with polling because patching `localStorage` can interfere with assignments and game iframes.

## Source-of-truth location
- Shared Apps Script exporter: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\lib\apps-script.ts`
- Reusable deploy runbook: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\apps-script-drive-deploy.md`
- Export contract: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\scripts\tests\apps-script-export.test.ts`
- Sports Wellness runtime wiring: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\main.js`
- Sports Wellness autosave keys: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\meta\project.json`
- Generated Apps Script package: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\exports\apps-script`

## Fragile areas / what might drift
- Future Apps Script exports can change asset ids, so stale Drive uploads should be avoided when adding or removing assets.
- The bootstrap's `fetch` shim intentionally intercepts only URLs with an embedded text asset id in `window.__CH_TEXT_ASSET_MAP__`; direct asset references should prefer the generated `blob:` URLs returned by `window.__CH_ASSET__`.
- `toScriptSafeJson_()` is required because game and assignment HTML can contain closing script tags.
- The reusable Google Sites path depends on exact deployment-ID redeploys; future operators should not create a fresh deployment unless they also update the Google Sites embed URL.

## Next prompt assumptions
- The linked Apps Script project `1V7cgnWThyLZsf8Q93su7XdpLOtWMy-1KcSgsLnDM48TbpX_F0UBYUq-B` has version `35`.
- All known non-HEAD deployments point at `@35`, including the formerly working `@27 - good owne` deployment and the later `@33` / `@34` test deployments.
- Browser console warnings about SES, unrecognized iframe features, and dropped postMessage are Apps Script sandbox noise unless paired with a visible runtime failure.

## Exact next command
`Set-Location "C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\exports\apps-script"; clasp deployments`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\exports\apps-script\Code.gs`
