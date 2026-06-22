# Workflow: Conversion

Use this workflow for D2L/Brightspace-derived projects where fidelity is primary.

## Default Mode

- Use `DEFAULT` unless the request explicitly asks for artifact-level redesign.

## Primary Goals

- Preserve course meaning and assignment intent.
- Remove LMS noise and broken scaffolding.
- Improve readability and navigation.
- Add interaction only where it clarifies learning flow.

## Source-of-Truth Pattern

- Canonical entry usually lives in `projects/<slug>/workspace/index.html`.
- Canonical sources usually include workspace runtime files (`main.jsx` / `main.js`, plus stylesheet if active).
- Reference and archive artifacts must be marked as `referenceOnly` in metadata.

## Reliable Upgrade Patterns

- Keep module sequence and assessment fidelity intact.
- For new clean Brightspace course builds, prefer the shared Next Step shell pattern in [`brightspace-shell-template.md`](brightspace-shell-template.md) over copying an older course workspace.
- Improve visual hierarchy with stronger section structure and spacing.
- Normalize path handling and resource lookup defensively when imports vary.
- Keep export-safe file references and avoid coupling to local-only assumptions.
- Treat local media as part of export readiness, not decoration: probe videos, convert questionable files to browser-safe H.264/AAC MP4 with `+faststart`, and verify playback from the workspace preview before packaging.
- Treat autosave as an export contract: response fields must keep focus while typing, restore after reload, and use stable storage keys that the target export bridge can track.
- For Brightspace ZIP to editable Word output, use the Word-native HTML import standard in [`BRIGHTSPACE_ZIP_CONVERSION_TO_DOCX.md`](BRIGHTSPACE_ZIP_CONVERSION_TO_DOCX.md).

## Responsive and Interaction Defaults

- Use clear spacing rhythm and touch-safe controls.
- Preserve keyboard focus states for interactive controls.
- Avoid adding heavy interaction wrappers when static content already communicates well.

## Common Failure Modes to Avoid

- Rewriting course concept when task asked for cleanup.
- Patching generated bundles without recording regeneration strategy.
- Mixing reference-only files into active execution paths.

## Conversion Playbook (Required Sequence)

Use this exact sequence for new conversion work. Keep scope inside `projects/<slug>/workspace/**` and `projects/<slug>/meta/**` unless intake/regeneration is explicitly required.

1. Intake + artifact generation
2. Preflight content audit
3. Shell normalization and placement
4. Interaction and lock behavior pass
5. Deploy readiness pass
6. Verification + handoff

## Step 1: Intake + Artifact Generation

Run the standard conversion pipeline first so all planning artifacts exist:

```bash
npm run incoming:refresh
npm run d2l-map -- --project <slug>
npm run blueprint -- --project <slug>
npm run assessment-map -- --project <slug>
npm run lesson-packets -- --project <slug>
npm run build:course-shell -- --project <slug>
```

## Step 2: Preflight Content Audit

Before editing UI logic, run a quick structural audit and record findings in handoff or project notes:

- Encoding artifacts: mojibake/replacement characters (for example `�`, `â€™`, `â€“`).
- Missing media references: `<video>/<audio>/<source>` entries with files not present in bundle.
- Broken resource paths (including `content`/`сontent` variant drift and malformed relative paths).
- Duplicate assessment listings across content and assignment buckets.
- Module title/order mismatches vs source LMS structure.

If missing media is detected:

- Prefer a graceful in-shell fallback note.
- If a canonical external source is provided (for example YouTube), add a source-specific override.
- Do not silently label broken media as converted.
- If a local MP4 exists but fails browser playback, repair it rather than removing it. A safe default is H.264 video, AAC audio, `yuv420p`, and `-movflags +faststart`.

## Step 3: Shell Normalization and Placement

Apply these placement rules consistently:

- Keep module sequence and lesson ordering faithful to source.
- Move quiz-like items into `Quizzes` library view.
- Move assignment/lab hand-ins into `Assignments` library view when course uses assignment tab UX.
- Remove duplicate quiz/assignment items from main module content lists once placed in libraries.
- Keep conversion-status labels truthful:
  - `converted` only when in-browser interaction is actually implemented (parsed source quiz data or local workspace implementation).
  - `not converted` when source is missing, launcher-only, or external-only.

## Step 4: Interaction and Lock Behavior Pass

When lock behavior is requested, apply the same release-condition model:

- All modules remain visible/selectable.
- Inside each module, content unlock is sequential.
- `mark complete + next` advances to next content item.
- Quizzes/assignments unlock only after module content completion (unless course-specific policy says otherwise).
- Mobile drawer/hamburger must preserve active section view while navigating modules.

## Step 5: Deploy Readiness Pass

Before publish, choose the active delivery target and run the matching readiness pass.

For SCORM:

- Prefer SCORM 2004 for courses with free-response autosave because it has a larger `cmi.suspend_data` budget than SCORM 1.2.
- Confirm tracked localStorage keys include every learner-response surface that must persist.
- Confirm the injected `scorm-bridge.js` appears before the first inline/local course script in the exported `index.html`, so LMS suspend data restores before the course reads localStorage.
- Confirm the bridge still installs its controls after `DOMContentLoaded` when it loads early in the document.
- Type into representative response fields, confirm focus is not lost after the first character, reload, and confirm the response restores.
- Run `npm run test:scorm` and `unzip -tq projects/<slug>/exports/<slug>-scorm-2004.zip`.
- Remember that zip-direct testing only proves browser-local storage. Cross-browser restore requires the package to be launched from Brightspace or another LMS with a SCORM API.

For Google Hosted:

- Confirm `projects/<slug>/meta/google-hosted.deploy.json` has `enabled`, `firebaseProjectId`, and `hostingSiteId`.
- Confirm export bundle contains real deploy files, not templates only:
  - `projects/<slug>/exports/google-hosted/firebase-config.json`
  - `projects/<slug>/exports/google-hosted/.firebaserc`
- Confirm storage sync uses one canonical key and bridge tracks that exact key.
- Confirm Google sign-in/auth domain behavior on deployed URL.

For Apps Script / Google Sites:

- Follow [`docs/ops/apps-script-drive-deploy.md`](../ops/apps-script-drive-deploy.md).
- Confirm `projects/<slug>/exports/apps-script/drive-assets/asset-manifest.json` exists after export.
- Confirm the uploaded Drive root is the `drive-assets` folder itself, not the parent folder.
- Confirm assignment/game/runtime text assets are served through embedded text maps, `blob:` URLs, `srcdoc`, or the guarded text-asset fetch shim rather than Apps Script wrapper pages.
- Confirm autosave is non-invasive: it may poll tracked keys and listen for storage events, but it must not patch `localStorage` or browser storage prototypes.
- Run `setDriveRootFolderId(...)` through a temporary no-argument helper, then run `rebuildDriveAssetIndex()`.
- Push with `clasp push --force`, create a version, and redeploy the exact deployment ID already embedded in Google Sites.
- Browser-check images, assignments, local games, slides/PDFs, autosave status, and any performance tools from the live `/exec` URL.

## Step 6: Verification Floor

For conversion changes, minimum verification is:

```bash
npm run verify -- --project <slug>
npm run typecheck
npm run build:studio
```

When UI behavior changed, also run:

```bash
npm run test:e2e:smoke
npm run test:e2e:project -- --project <slug>
```

Manual acceptance checklist:

- Module order and titles match source.
- Content/Quizzes/Assignments placement is correct for course policy.
- No obvious mojibake in sampled lessons across multiple modules.
- Missing media has graceful fallback or explicit embed override.
- Local Film Room media loads in the browser with no media error.
- Mobile sidebar/hamburger behavior is stable.
- Progress/lock behavior works and persists as expected.
- Autosaved responses restore after reload, and SCORM packages restore before course scripts read storage.
