# Google Hosting Fast Runtime And Assignment Embed Runbook

## Purpose

Use this runbook when a deployed course or module should load quickly and show assignments inside the course window, while still keeping a separate "Open assignment in new window" escape hatch.

This process distills the final Forensics 25 result. It is meant to prevent the late-cycle fixes we had to make after deploy: slow first paint, blank nested Apps Script iframes, assignment media missing inside `srcdoc`, and deployed code drifting from local source.

## Proven End State

The target state is:

- The course shell loads first and feels immediate.
- Heavy lesson and assignment HTML is loaded only when the learner opens that view.
- Lessons render in the module window with `iframe.srcdoc` or equivalent same-page injection.
- Assignments render inline inside the Assignments view with `iframe.srcdoc`.
- Each assignment view keeps a visible "Open assignment in new window" link to the same deployment route.
- Assignment media and bundle references resolve inside the inline frame.
- Runtime-only deployed source is kept separate from full setup/cache source.
- Live verification checks the actual deployed URL, not only the editor save state.

Forensics 25 reached this state for Modules 1 and 2, with Modules 3, 4, 6, 7, and 8 already following the shared fast runtime path. Module 5 was a separate assignment bundle problem, not a failure of the fast runtime pattern.

## Source Files To Check First

For the Forensics 25 precedent:

- `docs/ops/ACTIVE_HANDOFF.md`
- `projects/forensics-module-builder/meta/module-1-apps-script-google-sites.md`
- `projects/forensics-module-builder/meta/module-2-apps-script-google-sites.md`
- `projects/forensics-module-builder/meta/modules-3-8-apps-script-google-sites.md`
- `projects/forensics-module-builder/tools/generate-module-1-2-runtime-code.py`
- `projects/forensics-module-builder/tools/generate-apps-script-code.py`

The raw copied conversation is saved at:

- `docs/ops/google-hosting-fast-runtime-source-conversation.md`

Use the raw transcript for evidence or archaeology. Use this runbook for execution.

## Runtime Split

Keep two Apps Script source types when the delivery path uses Drive and Apps Script.

Full setup/cache source:

- Owns Drive setup helpers.
- Owns asset index rebuild helpers.
- Can write render caches or rebuild Drive-backed data.
- Should be used after Drive assets are replaced or file IDs change.

Runtime-only source:

- Is the student-facing deployed `Code.gs`.
- Does not do Drive setup or cache-writing during normal page loads.
- Serves the shell first.
- Provides read-only routes and `google.script.run` hydration helpers.
- Is the source that should be pasted into Apps Script and deployed for learner use.

Rule: if Drive files change, use the full setup/cache source to rebuild the index/cache, then redeploy the runtime-only source again.

## Apps Script Route Contract

For Apps Script / Google Sites delivery, the deployed web app should expose predictable routes:

```text
/exec
/exec?view=lesson
/exec?view=assignment
/exec?asset=assignment-bundle
```

The shell route should set `HtmlService.XFrameOptionsMode.ALLOWALL` so Google Sites can embed it.

The shell should not inline all heavy lesson and assignment HTML into the first `/exec` response. Instead, it should include a small hydration script that:

- Calls server helpers through `google.script.run`.
- Shows a light loading frame while content hydrates.
- Writes lesson HTML into the lesson frame.
- Writes assignment HTML into the assignment frame.
- Re-runs on load, hash changes, and DOM mutation because the static shell may rebuild views after navigation.

The Forensics 25 working shape was:

```text
Google Sites embed
  Apps Script module shell
    lesson rendered inline/srcdoc
    quiz rendered in shell
    assignment rendered inline/srcdoc
    assignment can also open same deployment at ?view=assignment
```

## Assignment Embed Contract

Do not embed an Apps Script web app inside another Apps Script web app as a nested external iframe. That was the source of blank or dark assignment panels.

Use this assignment contract instead:

- Replace the assignment placeholder or launch card inside the course shell.
- Add a small toolbar above the inline assignment frame.
- Keep a link to `?view=assignment` with `target="_blank"` and `rel="noopener"`.
- Create an inline assignment iframe in the same page.
- Write the assignment HTML into that frame with `iframe.srcdoc`.
- Fall back to `document.open()`, `document.write()`, and `document.close()` only if `srcdoc` assignment fails.
- Give the assignment frame a stable class such as `assignment-frame`.
- Set an adequate min-height so the embedded app is usable without looking broken.

Acceptance text to look for in live verification:

- Module 1 example: `Crime Scene Certification Lab`
- Module 2 example: `AFIS`, `Plain Whorl`, or `Fingerprint Analysis Interactive Assignment`
- Shared escape hatch: `Open assignment in new window`

## Assignment Asset Patching

Inline `srcdoc` changes how relative paths resolve. Any assignment bundle that references local paths must be patched before serving.

Common problem:

```text
assignment/module2/
./module2/
./forensic-assignment-theme.css
./forensic-assignment-print.js
```

Fixes:

- Inline small assignment CSS and helper JS when practical.
- Serve large assignment bundles through `?asset=assignment-bundle`.
- Replace assignment media references with Drive-backed `data:` URLs or stable asset routes before the HTML enters `srcdoc`.
- For Drive-backed Apps Script, resolve file IDs from the Drive asset index, then build `data:<mime>;base64,...` URLs for images/SVGs that must work inside the inline frame.
- After Drive file replacement, rerun the setup/cache helper and redeploy runtime-only source.

This was essential for Module 2 because fingerprint and suspect assets under `assignment/module2/` did not resolve from inside the Apps Script `srcdoc` iframe.

## Fast Loading Rules

The first page response should be small and reliable.

Do:

- Serve shell HTML at `/exec`.
- Lazy-load heavy lesson HTML when the Lesson view opens.
- Lazy-load assignment HTML when the Assignment view opens.
- Use precomputed Drive indexes or render caches where needed.
- Remove setup/cache-writing helpers from the runtime-only deployed source.
- Use cache-busting query strings during live verification.

Avoid:

- Reading every Drive file during first paint.
- Rebuilding asset indexes during normal learner page loads.
- Embedding giant lesson image payloads in the initial shell response.
- Relying on a stale editor preview or old browser tab as proof.

## Bulk Course Workflow

Use this sequence when applying the pattern across multiple already deployed courses.

1. Build the target list.
   Use `projects/*/meta/google-hosted.deploy.json` plus `projects/*/exports/google-hosted/index.html` for Firebase Google Hosted courses. Use the Apps Script handoff matrix for Google Sites modules.

2. Identify the canonical source for each target.
   Edit workspace, generator, or runtime generator source. Do not patch generated export bundles as the source of truth.

3. Apply unlock gates before deployment checks.
   Examples from the unlocked hosted batch:
   - `AUTHORING_UNLOCK_ALL = true`
   - `reviewUnlockAll = true`
   - Preserve course-specific exclusions, such as Forensics 25 `chapter-8`.

4. Apply the fast runtime pattern for heavy Apps Script or Google Sites modules.
   Generate or update the runtime-only source. Keep full setup/cache source for asset rebuilds.

5. Apply the assignment embed contract.
   Inline assignment with `srcdoc`, keep the new-window route, and patch assignment assets.

6. Run local verification.
   Use generator tests, package/audit scripts, `node --check` on copied `.gs` sources, and local browser preview of lesson and assignment views.

7. Deploy.
   For Firebase Google Hosted, export each slug before deploy:

   ```bash
   npm run test:google-hosted
   npm run export:google-hosted -- --project <slug>
   npm run deploy:google-hosted
   ```

   For Apps Script, paste the runtime-only source into the existing Apps Script project, save, create a new version on the existing deployment ID, and keep the stable `/exec` URL.

8. Verify live.
   Open the deployed URL with a cache-busting query. Check shell, lesson, assignment, assignment media, the new-window link, and console errors.

## Live Verification Gate

Do not call the work done until the deployed target passes these checks:

- Shell becomes visible quickly.
- Lesson view opens and shows readable lesson content.
- Assignment view opens inside the course window.
- Assignment iframe contains the expected app text and first critical image/media.
- "Open assignment in new window" points to the standalone assignment route.
- The standalone assignment route still opens.
- No meaningful runtime console errors are present.
- If embedded in Google Sites, the Sites page is checked separately because Sites adds another iframe and can cache stale state.

For heavy Apps Script modules, use a fresh tab or a URL like:

```text
https://script.google.com/.../exec?bust=<timestamp>
```

## Known Traps And Fixes

Nested Apps Script iframe shows blank or dark panel:

- Replace the nested web app iframe with same-page `srcdoc` assignment rendering.

Assignment works in a new window but not inline:

- The assignment HTML is probably relying on relative paths that do not resolve inside `srcdoc`. Patch CSS, JS, image, and SVG references before serving.

Live page is still slow after the editor says deployed:

- Confirm the runtime-only source was deployed, not the full setup/cache source.
- Confirm cache-writing/setup helpers are not running during normal `/exec` loads.

Drive assets were replaced and the runtime broke:

- Temporarily use the full setup/cache source.
- Run the setup or rebuild helper.
- Redeploy the runtime-only source afterward.

Apps Script editor and local source disagree:

- Treat local `projects/<slug>/meta/module-N-apps-script-runtime-code.gs` or the generator as source of truth.
- Update local metadata after any emergency browser-editor patch.

Firebase Google Hosted deploy looks successful but old behavior remains:

- Re-run `npm run export:google-hosted -- --project <slug>`.
- Inspect `projects/<slug>/exports/google-hosted/` for expected flags or bridge markers.
- Redeploy and fetch the live served file to confirm the change is present.

`npm run typecheck` fails on unrelated files:

- Record it explicitly.
- Do not treat it as a regression unless the task touched the failing file.

## Exact Replication Prompt

Use this prompt shape for future bulk work:

```text
Mode: DEFAULT
Workflow: generated-course or conversion, as project metadata says
Targets: <slug list or module list>
Boundary: canonical workspace/generator/runtime source plus required deploy metadata only
Task: Apply the proven Google hosting fast runtime pattern:
- unlock requested authoring gates
- keep shell first paint light
- lazy-load heavy lesson and assignment HTML
- render assignment inline with srcdoc
- preserve Open assignment in new window
- patch assignment assets for srcdoc
- export/deploy selected targets
- verify live deployed URLs with cache-busting
Success criteria:
- shell loads fast
- lesson hydrates
- assignment renders inline
- assignment media appears
- new-window assignment route works
- no meaningful runtime console errors
```
