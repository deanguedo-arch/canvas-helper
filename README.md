# Canvas Helper

Canvas Helper is a local-first Node-powered workbench for importing Canvas course content, preserving immutable raw baselines, editing workspace copies, previewing them in a browser Studio, and exporting Brightspace, SCORM, Google-hosted, Apps Script, and standalone HTML deliverables.

Canvas Helper is a post-generation production environment:
`import -> normalize -> edit -> expand -> integrate -> export`.
External first-pass generation is officially supported, and Canvas Helper is where those artifacts are disciplined into export-ready course surfaces.

Repo-level intelligence defaults live in `config/intelligence.json`. Project-specific overrides can live in `projects/<slug>/meta/intelligence-policy.json` and/or `projects/<slug>/meta/project.json`.
Repo-level authoring enforcement defaults live in `config/authoring-preferences.json`. Project-specific overrides can live in `projects/<slug>/meta/authoring-preferences.json`.

## Quick Start

1. Install Node.js 20.19 or newer (Node 22.12+ is also supported) and npm 10 or newer
2. Run `npm install`
3. Start Studio with `npm run studio`
4. Use your platform launcher for a stable one-click Studio start:
   - Windows: `launch-canvas-helper.bat`
   - macOS: `./launch-canvas-helper.command` (or `./launch-canvas-helper.sh`)
5. For Codex desktop app on macOS, use:
   - `npm run studio:codex`
   - `npm run studio:codex:auto`
   - `npm run studio:codex:migrate` (run migration, then Studio)
   - `npm run studio:codex:session` (opens Studio + prints prompt starters)
   - See [docs/ops/codex-mac-workflow.md](docs/ops/codex-mac-workflow.md)
6. Optional advanced commands from the launcher:
   - `launch-canvas-helper.bat refresh` / `./launch-canvas-helper.command refresh`
   - `launch-canvas-helper.bat watch` / `./launch-canvas-helper.command watch`
7. The launcher auto-runs `npm run migrate:projects` so older repo layouts are normalized before Studio starts

## Main Commands

- `npm run studio`
- `npm run studio:auto` (optional advanced mode: Studio + watcher orchestration)
- `npm run studio:codex` (Codex desktop app shortcut on macOS)
- `npm run studio:codex:auto` (Codex desktop app + intake watcher on macOS)
- `npm run studio:codex:migrate` (Codex app + explicit project layout migration)
- `npm run studio:codex:session` (Codex app starter with prompt templates)
- `npm run course:create -- --slug <slug> --title "<title>" --course-code "<code>" --summary "<summary>"` (new Codex-authored, Studio-ready course)
- `npm run course:list -- --all` (all source-backed projects plus package/archive classifications)
- `npm run course:onboard -- --all [--apply]` (audit or transactionally onboard the existing catalog)
- `npm run verify:course-onboarding -- --all` (rendered reversible catalog acceptance)
- `npm run test:studio-release` (complete, isolated Studio release gate)
- `npm run import -- "<path-to-html-or-folder>" --slug <slug>`
- `npm run incoming:refresh`
- `npm run analyze -- --project <slug>`
- `npm run refs -- --project <slug>`
- `npm run d2l-map -- --project <slug>`
- `npm run convert:hss1010 -- --project hss1010`
- `npm run sync:course-images -- --project <slug>`
- `npm run blueprint -- --project <slug>`
- `npm run assessment-map -- --project <slug>`
- `npm run lesson-packets -- --project <slug>`
- `npm run intake:english-course -- --course <course> --brightspace-zip "<zip>" --teacher-resources-zip "<zip>"`
- `npm run intake:science-pilot -- --project <slug> --course-code "<code>" --title "<title>" --mode <conversion|generated-course> --brightspace-zip "<zip>" [--teacher-resources-zip "<zip>"]`
- `npm run build:english-course -- --course <course>`
- `npm run build:english-unit -- --project <unit-slug>`
- `npm run build:social30 -- --resource <resource-id> --only <issue-slug>`
- `npm run verify:english-course -- --course <course>`
- `npm run test:english-course`
- `npm run test:english-transaction`
- `npm run test:social-build`
- `npm run test:science-pilot`
- `npm run test:studio-inspection`
- `npm run validate:manifests`
- `npm run assessment:import -- --input "<file-or-dir>" [--slug <assessment-slug>]`
- `npm run assessment:export -- --assessment <assessment-slug>`
- `npm run test:assessments`
- `npm run test:scorm`
- `npm run test:apps-script`
- `npm run test:google-hosted`
- `npm run test:exports`
- `npm run test:e2e`
- `npm run test:e2e:smoke`
- `npm run test:e2e:project -- --project <slug>`
- `npm run export:brightspace -- --project <slug>`
- `npm run export:brightspace:zip -- --project <slug>`
- `npm run export:scorm -- --project <slug> [--version 2004|1.2]`
- `npm run export:apps-script -- --project <slug>`
- `npm run export:google-hosted -- --project <slug>`
- `npm run deploy:google-hosted`
- `npm run export:html -- --project <slug>`
- `npm run smoke:pipeline`
- `npm run typecheck`
- `npm run build:studio`

## Core Workflow

1. Drop HTML or bundle imports into `projects/incoming/`
2. Drop resources directly into `projects/resources/<slug>/`
3. Use Studio `Refresh Intake` or run `npm run incoming:refresh` (recommended); continuous watcher mode is optional (`npm run watch:incoming`)
4. Imported sources are snapshotted to `projects/processed/<slug>/source/`
5. Studio edits and previews the canonical project at `projects/<slug>/...`; if that canonical root is missing but the processed snapshot still exists, Studio rebuilds it automatically from `projects/processed/<slug>/source/`
6. Edit declared canonical sources only. For routine changes on eligible courses, use Studio **Edit** mode; otherwise edit the owning workspace, recipe, metadata override, or builder source identified by `course:doctor`.
7. Use Studio to compare raw vs workspace, or collect a reviewed Draft Changes batch before applying it.
8. Run `analyze` and `refs` to refresh workspace structure plus classified resource artifacts
9. Run `blueprint`, `assessment-map`, and `lesson-packets` to build outline-first planning artifacts before generation-heavy work
10. Run export commands as needed
11. Run `validate:manifests` when project source-of-truth metadata changed
12. Capture a handoff before stopping

## Create a Course in Codex and Open It in Studio

For a net-new course authored from scratch, start with the repository contract instead of copying an older project:

```bash
npm run course:create -- \
  --slug applied-learning-20 \
  --title "Applied Learning 20" \
  --course-code "AL 20" \
  --summary "Learners investigate evidence, make decisions, and explain their reasoning."
```

The command creates a validated `generated-course` project with canonical HTML and CSS, an immutable raw baseline, a prompt pack, and an explicitly enabled `direct-workspace-v1` authoring contract. It never overwrites an existing project. If Studio is already open, the new course appears in the picker automatically; opening **Edit** immediately shows the live visual map of Rename, text, link, and image targets.

Continue course development in `projects/<slug>/workspace/`. Keep normal teacher-editable content in the HTML, use `data-canvas-helper-edit-key` on durable elements, and use `data-canvas-helper-course-title` on every course-name surface that Rename must synchronize. JavaScript can add behavior, but content it replaces at runtime becomes visibly **Annotation only** because Studio cannot safely prove where to persist it.

Before handing off a new course, run:

```bash
npm run course:doctor -- --project <slug>
npm run verify -- --project <slug> --mode workspace
```

Then open it in Studio, inspect the Edit map, apply one reversible draft, reload, and Undo. Courses imported from Brightspace or built through the English/Social factories keep their owning intake and rebuild workflows; this command is the default for courses created from scratch in Codex.

## Bring an Existing Course Catalog Into Studio

Use a dry audit first, then apply the complete manifest batch transactionally:

```bash
npm run course:onboard -- --all
npm run course:onboard -- --all --apply --report .runtime/course-onboarding-report.json
npm run verify:course-onboarding -- --all
```

The onboarding workflow never equates “has HTML” with “safe to edit.” It assigns an explicit Direct, English factory, Social factory, preserved legacy snapshot, blocked, reference-only, or package-archive outcome. A legacy snapshot keeps the current workspace as the protected learner baseline, stores Studio changes as replayable course overrides, and quarantines any old builder that could replace those changes. Package-only directories remain accounted for without pretending an export is source.

The current catalog outcome and exceptions are recorded in [docs/audits/2026-08-13-course-catalog-onboarding.md](docs/audits/2026-08-13-course-catalog-onboarding.md). Future imported projects and courses created through `course:create` receive explicit Studio ownership at creation, so this bulk migration should not become a recurring manual catch-up step.

## Studio Direct Editing

Studio has a separate **Edit** mode only for projects that pass `course:doctor` and explicitly declare both a supported `authoring.driverId` and `authoring.studioEditing.enabled: true`. Unclassified inferred projects remain **not onboarded** even when their workspace can be previewed; the current source-backed catalog has been explicitly classified through `course:onboard`. Turning on Edit shows a server-authored map of the current page: supported regions receive restrained outlines, hover labels identify **Edit text**, **Edit link**, **Replace image**, or **Rename course**, and the page toolbar reports the visible editable-area count with a show/hide toggle. JavaScript-replaced or otherwise unsupported regions use a dashed **Annotation only** selection with the reason and a direct **Annotate this for Codex** action. Clicking surrounding layout automatically selects a nearby safe child only when the map can prove one.

Click a supported region, then save one or more changes into the course-specific **Draft Changes** panel. Drafts do not silently expire, follow the course between Studio and Full Preview, can be reopened for every patch type, and have local JSON backup/restore. Visual before/after frames accompany accessible text captions.

**Apply changes** preflights every draft before writing, obtains a cross-process filesystem lock, writes a durable recovery journal and complete checkpoint, safely rebases unchanged targets after unrelated page edits, and refuses a changed selected element. English and Social factories rebuild from stored overrides; legacy snapshots materialize overrides into their preserved baseline without running the quarantined old builder. Studio then runs `course:doctor`, workspace verification, and an isolated Playwright learner render that confirms the requested text, link, image, attributes, style, visibility, accessible names, alt text, heading text, and contrast survived course JavaScript. A failed check rolls back the entire batch. **Undo last batch** runs only when the complete checkpoint boundary still matches the applied result; newer Codex, builder, or manual work makes Undo unavailable instead of being overwritten.

The teacher editor decodes HTML entities, provides rich-text/list/link controls, emits only changed fields, rejects no-op drafts, restricts visual tokens by element type, and supports validated PNG/JPEG/GIF upload into the canonical project resource library. **Rename course** synchronizes marked sidebar and overview headings, document title, project metadata, stored course metadata, and declared runtime title data as one undoable operation. Background images, responsive source sets, semantic heading-level changes, layout redesign, new JavaScript activities, assessment/scoring logic, arbitrary HTML/CSS, complex section moves, family-wide changes, and publishing remain Codex or explicit command workflows.

Export status is computed from workspace bytes plus the actual generated artifact bytes or directory tree. CLI and Studio exports record the same evidence, and SCORM 1.2 and SCORM 2004 have independent freshness states. Use `npm run verify:course-editing-pilots` to repeat the reversible real Direct, English, and Social acceptance pilots; the command refuses to replace an existing Undo point and requires byte-for-byte restoration.

Legacy direct-course rebuilds must also fail closed. The onboarded Mental Health builder refuses to overwrite a workspace containing applied Studio edit markers unless an operator intentionally supplies `--allow-studio-edit-overwrite`; every newly onboarded legacy direct builder needs equivalent preservation or refusal behavior.

## Studio Inspect + Codex Handoff

Studio has no model-provider integration. Use **Annotate** when a change is outside safe direct-edit capabilities or when one or more visible course elements need focused work from Codex:

1. Open the project, turn on **Annotate**, then click an element or drag across one source-mapped learner-facing area. An ambiguous drag remains visual-only so it cannot point Codex at the wrong source.
2. Write what should change, optionally capture up to three marked course screenshots, and choose **Save annotation**.
3. Repeat for up to five annotations, edit or review them in the persistent Review Set, then choose **Copy Review Set for Codex** and paste the one handoff into a Codex task.

The right rail deliberately shows only the current annotation and the Review Set. Studio still resolves the canonical source, rebuild route, and validation command behind the scenes, then includes those details in the bounded copied handoff. Generated Social and English workspace HTML remains display output: Edit mode records course-only overrides and asks the owning builder to regenerate it rather than patching generated HTML.

**Open preview** opens a trusted full-page host while keeping the course itself isolated in a capability-scoped iframe. It has the same blue annotation mode: click or drag, add a note or screenshot, save to the shared Review Set, and copy the complete set without returning to Studio. **Return to Studio** closes a connected full preview and brings back the original Studio session. An already-open full preview can rejoin after Studio reload, and **Show** navigates its course iframe to the saved HTML page before reporting a confirmed highlight. Saved annotations, notes, and screenshot references survive for seven days; switching to another course asks before clearing the current set.

The live preview is served from a separate local loopback origin and communicates through bounded private bridges. Embedded frames use a private `MessageChannel`; a full preview receives a one-time session token, and its trusted Studio-origin host retains the opener only for bounded reload rejoin. The cross-origin course iframe never receives the opener or Studio channel. Each preview capability is limited to one project/root; a workspace preview can load only same-project reference material, never another project or workspace. The Inspector and packet builder make no external request, and selected course text is explicitly marked as untrusted content in the packet. For course fidelity, the live preview may load presentation-only HTTPS styles, fonts, images, media, and frames declared by the course. Older imported courses may also use a small, version-pinned set of legacy JavaScript runtimes. Studio syntax-rewrites approved external and inline-script dependencies through the capability-scoped local preview origin, registers each declared or transitively discovered source to that capability, accepts only exact library/path/query families and JavaScript MIME types, and applies bounded concurrency, fetch, redirect, size, timeout, parser, and memory-cache limits. Local/reference `HEAD` requests do not read or transform files, runtime `HEAD` is cache-only, and oversized local scripts are served unchanged. Arbitrary external scripts, form submissions, and nonlocal browser data connections remain blocked. The separate screenshot-capture browser keeps the stricter browser-network policy described below.

**Screenshot** is optional and course-only. It does not open an operating-system screen-sharing picker. Canvas Helper opens the exact capability-scoped local preview in a bounded capture browser, restores its saved scroll state, rechecks the full page identity (including course query and hash state) plus the selected element, draws the blue numbered marker, and blocks outside HTTP requests, WebSockets, WebRTC, service workers, and dedicated/shared workers. It verifies those guards in the main document and runnable local child frames while skipping empty or browser-generated blocked-error frames so iframe-heavy courses cannot stall capture. Each annotation may keep up to three PNGs under the ignored `.runtime/studio-review-sets/` cache. Display, removal, and copy all verify each path against the exact session, project, annotation, and selected node. Review Set V3 lists only those safe repo-relative paths—never base64 pixels, blob URLs, or absolute paths. Screenshot files and the private version-6 persistence record expire after seven days.

Use **What’s new** in the Studio header for the current concise product release. The durable release note is [docs/releases/2026-08-12-canvas-studio-direct-editing.md](docs/releases/2026-08-12-canvas-studio-direct-editing.md). Before publishing shared Studio behavior, run `npm run test:studio-release`; its ignored report is written to `.runtime/studio-release-report.json`.

## Workflow Types

Canvas Helper supports three official workflows:

- `conversion`: fidelity-first cleanup/enhancement for D2L/Brightspace-derived projects
- `generated-course`: import first-pass artifacts and expand them into complete production surfaces
- `injection/integration`: import and surgically place external activities while keeping provenance clear

Workflow guidance and prompt contracts live under `docs/workflows/`.

### English Course Factory

The English factory converts one Brightspace course plus one teacher-resource archive into profile-specific review-ready units. It shares the Next Step shell, Evidence Bank, autosave, hints, print behavior, responsiveness, and SCORM persistence without forcing Shakespeare, novels, film, drama, and short fiction into one activity layout.

See [docs/workflows/english-course-factory.md](docs/workflows/english-course-factory.md) for intake, safe rebuild ownership, activity profiles, review gates, and individual export commands.

### D2L / Common Cartridge Mapping

- `d2l-map` scans `projects/resources/<slug>/` for `imsmanifest.xml`
- It writes:
  - `projects/<slug>/meta/d2l-course-map.json`
  - `projects/<slug>/meta/d2l-course-map.md`
- Prompt-pack generation includes a D2L course-map summary when this artifact exists

### SCORM Export Notes

- `export:scorm` writes a SCORM package to `projects/<slug>/exports/<slug>-scorm-<version>.zip`
- It also writes an unpacked folder to `projects/<slug>/exports/scorm-2004/` or `projects/<slug>/exports/scorm-1-2/`
- SCORM 2004 is the recommended default for larger suspend-data payloads
- The SCORM export injects a bridge script that syncs workspace localStorage state into `cmi.suspend_data`
- For autosaved courses, the bridge must load before inline/local course scripts so LMS suspend data restores into `localStorage` before the course reads response state
- Before Brightspace upload, verify response fields accept continuous typing, reload restores saved work, `npm run test:scorm` passes, and `unzip -tq projects/<slug>/exports/<slug>-scorm-2004.zip` reports no errors
- SCORM cross-browser restore only works when launched through an LMS SCORM API; opening the zip or HTML directly can only prove browser-local storage
- Export commands now only mark the workspace as approved in `project.json`; they do not regenerate prompt-pack or other intelligence artifacts unless you run the intelligence-producing commands explicitly

### Local Media Notes

- Browser playback is part of export readiness. Local Film Room videos should be probed and verified, not trusted because they have an `.mp4` extension.
- If a video serves but does not play in Chrome or Brightspace, transcode it to H.264/AAC MP4 with `yuv420p` and `+faststart`, then point the builder or project metadata at that playback-safe source.
- Do not replace a full-film item with a short clip unless the course design changes; preserve the intended media length when repairing playback.

### Google Hosted Export Notes

- `export:google-hosted` writes a Firebase-ready bundle to `projects/<slug>/exports/google-hosted/`
- The bundle includes `google-hosted-bridge.js`, `firebase-config.template.json`, `firebase.json`, `.firebaserc.template`, and `README-deploy.md`
- The runtime bridge prompts the learner to sign in with Google and syncs tracked workspace localStorage state to Firestore at `projects/{slug}/users/{uid}`
- The repo generates the hosted bundle only; Firebase project setup and deployment remain manual teacher or admin steps outside the repo

### Apps Script Export Notes

- `export:apps-script` writes a clasp-ready Apps Script web-app package to `projects/<slug>/exports/apps-script/`
- The package uses a Drive-backed delivery model: Apps Script serves the shell with `HtmlService`, while exported course assets live under an uploaded `drive-assets/` folder in Google Drive
- This path is meant as a Google-ecosystem delivery option for Google Sites embedding, especially when you want school-managed Google deployment rather than external hosting
- Text assets are Apps Script-served and injected as raw text or `blob:` URLs so assignment pages, local games, CSS, and JS can run without fetching Apps Script wrapper pages
- When project metadata declares tracked storage keys, the package injects an Apps Script autosave bridge that syncs those `localStorage` keys to private Drive JSON files through `google.script.run` without patching browser storage prototypes
- For large Google Sites courses, keep Apps Script as the shell, keep assets in Drive, redeploy the exact existing deployment ID, and verify assignments/games/PDFs/autosave from the live `/exec` URL
- Follow [`docs/ops/apps-script-drive-deploy.md`](docs/ops/apps-script-drive-deploy.md) for the Drive upload, asset index, `clasp`, versioning, and exact deployment-ID redeploy loop

### Google Hosted Deploy Tool

- Add per-slug deploy metadata in `projects/<slug>/meta/google-hosted.deploy.json`
- Required fields:

```json
{
  "enabled": true,
  "firebaseProjectId": "subject-course-one",
  "hostingSiteId": "module-site-id"
}
```

- A slug appears in the deploy picker only when all of these exist:
  - `projects/<slug>/meta/google-hosted.deploy.json`
  - `projects/<slug>/exports/google-hosted/`
  - `projects/<slug>/exports/google-hosted/firebase-config.json`
  - `projects/<slug>/exports/google-hosted/.firebaserc`
- Run `npm run deploy:google-hosted` or `deploy-google-hosted.bat` (Windows) / `./deploy-google-hosted.command` (macOS)
- Deploy runs the same authoring deviation gate against exported `index.html` before Firebase deploy.
- Use the same override flags when needed:
  - `--accept-deviations all|<rule-id,rule-id>`
  - `--because "<reason>"`
  - `--update-preferences`
  - `--preference-scope repo|project`
- The deploy tool shows only configured slugs, lets you pick one or many, validates the Firebase Hosting site, and deploys to the configured project/site
- Firebase projects and Hosting sites must already exist; the deploy tool does not create infrastructure

### HSS1010 Section-Tab Conversion

- `convert:hss1010` transforms the legacy HSS1010 monolith into structured JSON + data-backed workspace output.
- `convert:hss1010` runs authoring-preference deviation checks before writing output.
- Blocking deviations fail fast and write:
  - `projects/<slug>/meta/deviation-report.json`
  - `projects/<slug>/meta/deviation-report.md`
- It writes:
  - `projects/hss1010/meta/course.json`
  - `projects/hss1010/meta/assessment.json`
  - `projects/hss1010/meta/source-map.json`
  - `projects/hss1010/meta/coverage-report.json`
  - `projects/hss1010/workspace/data/course.json`
  - `projects/hss1010/workspace/data/assessment.json`
- It regenerates:
  - `projects/hss1010/workspace/index.html`
  - `projects/hss1010/workspace/main.js`

Optional override flags for convert/export/deploy:

- `--accept-deviations all` or `--accept-deviations <rule-id,rule-id>`
- `--because "<reason>"`
- `--update-preferences`
- `--preference-scope repo|project`

### Course Image Manifest Sync

- `sync:course-images` validates approved images from `projects/<slug>/meta/images-manifest.json` and syncs them into course model blocks.
- Approved image entries must point to files under `projects/<slug>/workspace/assets/images/`.
- For `hss1010`, the command also refreshes workspace output (`index.html`, `main.js`, `hss-study.css`) using the already-interactive course model.
- First-time setup:
  - `npm run sync:course-images -- --project <slug> --init`
- Example manifest:

```json
{
  "schemaVersion": 1,
  "projectSlug": "hss1010",
  "images": [
    {
      "id": "anatomy-joint-motion",
      "sectionId": "anatomy",
      "src": "./assets/images/anatomy-joint-motion.webp",
      "alt": "Shoulder joint movement diagram",
      "title": "Joint Movement Overview",
      "caption": "Use this diagram during movement-mechanics practice.",
      "status": "approved",
      "insertAfterBlockId": "anatomy-interactive-movement"
    }
  ]
}
```

## Fast Agent Paths

- Use [docs/ops/FAST_PATHS.md](docs/ops/FAST_PATHS.md) to keep agent retrieval narrow for common tasks
- Repo-wide or multi-project continuation work should resume from `docs/ops/ACTIVE_HANDOFF.md`
- Run `npm run course:list -- --all` to see whether a project is actually `direct-ready`, `factory-ready`, `proposal-only`, or `blocked`; lifecycle `active` alone is not a readiness signal.
- For active migrated course work, run `npm run course:doctor -- --project <slug>` before using a course context; it validates source ownership and paths without changing the manifest
- When that doctor passes, use `npm run context:project -- --project <slug>` for the compact (at most 5,000 UTF-8 bytes) source-of-truth brief; it intentionally excludes whole blueprints, resource catalogs, and prompt-pack content and does not write files
- Studio does not call model providers. Annotate and Review Set never write course sources; Edit mode may write only an explicitly onboarded direct source or supported owning rebuild override through the transactional server workflow. Use the compact source contract for everything outside that boundary.
- An English factory course is only `factory-ready` when both source archives named by its recipe are materialized (not missing or LFS pointers). Its owned workspace, resource copies/extractions, and generated metadata are rollback-safe; recipes and teacher-authored custom paths are preserved.
- Social related-issues work is a proposal/rebuild workflow unless its manifest explicitly declares and enables the supported Studio adapter. In either case, name a checksum-verified resource in `projects/resources/social30-1-related-issues/resource-manifest.json`; never pass a personal `--zip` path or hand-edit the generated workspace.
- Start a new Science course with `intake:science-pilot`, not a generic factory. It copies and hashes the real ZIP sources, creates a blocked planning contract, and gives the red-team / green-team review the same small set of metadata files before one representative unit is built.
- Use `npm run headroom` only when you intentionally need to regenerate a prompt pack, with `--project <slug>` / `--all` for explicit targeting
- Use `npm run headroom:all` only when you intentionally need Canvas Helper-wide prompt-pack refresh
- If workflow is known, read [docs/workflows/README.md](docs/workflows/README.md) and the matching workflow guide before broad repo scans
- Use `npm run pack:subagent -- --project <slug>` when you want prompt-pack generation to start in subagent mode automatically

## Planning Workflow

1. `refs` extracts resources, classifies them (`outline`, `assessment`, `textbook`, `teacher-note`, `other`), and writes `resource-catalog.json`
2. `blueprint` builds `course-blueprint.json` from outline authority first and assessment demand second
3. `assessment-map` builds `assessment-map.json` from assessment resources without summarizing them away
4. `lesson-packets` writes outcome-bound lesson packet files under `projects/<slug>/meta/lesson-packets/`
5. `pack` or any command that refreshes intelligence rewrites `prompt-pack.md` with blueprint, assessment, and lesson-packet summaries above raw excerpts

## Assessment Library Workflow

Assessment authoring now has a global library, separate from course project slugs:

- root path: `projects/assessments/<assessment-slug>/`
- source files: `projects/assessments/<assessment-slug>/source/`
- canonical project: `projects/assessments/<assessment-slug>/assessment.project.json`
- import diagnostics: `projects/assessments/<assessment-slug>/import-result.json`
- Brightspace exports: `projects/assessments/<assessment-slug>/exports/brightspace/`

Studio now supports two top-level modes:

- `Course Studio` for project preview/edit workflows
- `Assessment Library` for PDF/DOCX import, question editing, validation, and Brightspace export

PDF ingest for assessments uses Canvas Helper’s native-first + OCR-fallback extraction path (`scripts/lib/pdf-text.ts`) and then deterministic question-extraction heuristics.

## PDF OCR Fallback

Native PDF text extraction stays primary. OCR is only used when a PDF has no selectable text or the extracted text is clearly garbled.

- macOS: install `tesseract` and `poppler` so `tesseract` and `pdftoppm` are on `PATH` (`brew install tesseract poppler`)
- Windows: install Tesseract OCR and Poppler so `tesseract.exe` and `pdftoppm.exe` are on `PATH`
- User-space fallback: install the binaries wherever you want, then point Canvas Helper at them with `CANVAS_HELPER_TESSERACT_PATH` and `CANVAS_HELPER_PDFTOPPM_PATH`
- If the binaries live outside `PATH`, set `CANVAS_HELPER_TESSERACT_PATH` and `CANVAS_HELPER_PDFTOPPM_PATH`
- `refs` now warns before extraction when OCR tools are missing and preserves existing `_extracted/` outputs for unchanged resources instead of wiping the directory first

## Learner modes

The workflow is controlled by an explicit learner mode, resolved in this order:

1. CLI flag `--learner-mode <off|collect|apply>`
2. `LEARNER_MODE` environment variable
3. `projects/<slug>/meta/project.json` or `projects/<slug>/meta/intelligence-policy.json`
4. `config/intelligence.json`
5. built-in safe fallback (`collect`)

### `off`

- collection: disabled
- application: disabled
- best for: clean baseline / debugging

### `collect`

- collection: enabled
- application: disabled
- best for: normal day-to-day work (safe default)

### `apply`

- collection: enabled
- application: enabled
- best for: trusted repeated project types

`launch-canvas-helper.command` and `launch-canvas-helper.bat` are the default startup paths.

## Authoring Preference Enforcement

The pipeline now enforces style/decision guardrails in conversion/export/deploy paths:

1. Resolve preferences from CLI/project/benchmark/repo sources.
2. Run deviation gate checks on generated/exported surfaces.
3. Fail fast on blocking deviations with concrete evidence.
4. Allow intentional override with explicit reason and optional preference updates.

Preference update behavior:

- `--accept-deviations ...` requires `--because`.
- Add `--update-preferences` to persist accepted deviations.
- Use `--preference-scope repo` when the decision should propagate across courses.

## Repo Guides

- Architecture: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- Agent operating rules: [`AGENTS.md`](./AGENTS.md)
- Contribution rules: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- Ops runbook: [`docs/ops/README.md`](./docs/ops/README.md)
