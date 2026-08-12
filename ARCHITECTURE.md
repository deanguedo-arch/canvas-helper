# Canvas Helper Architecture

## What This Repo Is

Canvas Helper is a local-first post-generation course-content workbench. It imports course artifacts (including external first-pass outputs), preserves a raw baseline, creates an editable workspace copy, serves both views locally in Studio, and runs Node-based commands for normalization, analysis, references, export, packaging, and handoff support.

Its production pipeline is:
`import -> normalize -> edit -> expand -> integrate -> export`.

Official workflows:
- `conversion`
- `generated-course`
- `injection/integration`

## Why Local-First

- project data lives on disk under `projects/<slug>/...`
- preview routes serve local files directly
- Node handles filesystem operations and command execution
- the browser is a local operator shell, not the system of record
- the workflow must stay usable without hosted infrastructure

## System Diagram

```mermaid
flowchart LR
  A["projects/incoming/<bundle-or-html>"] --> B["scripts/lib/importer"]
  A2["projects/resources/<slug>/<file>"] --> R["resource refresh"]
  A3["projects/assessments/<assessment-slug>/source"] --> AS["assessment ingest/export engine"]
  B --> C["projects/<slug>/raw"]
  B --> D["projects/<slug>/workspace"]
  B --> E["projects/<slug>/meta"]
  B --> P["projects/processed/<slug>/source"]
  R --> F["projects/resources/<slug>/_extracted"]
  R --> RC["meta/resource-catalog.json"]
  RC --> CB["build-course-blueprint"]
  RC --> AM["build-assessment-map"]
  CB --> LP["build-lesson-packets"]
  AM --> LP
  CB --> E
  AM --> E
  LP --> E
  D --> PV["isolated preview server (127.0.0.1, read-only)"]
  C --> PV
  PV --> PF["course preview iframe"]
  PF <-. "private MessageChannel bridge" .-> H["app/studio React UI"]
  H --> I["app/server API routes"]
  I --> J["scripts/lib analyze/refs/export commands"]
  H --> IA["app/server assessment routes"]
  IA --> AS
  AS --> A3
  J --> E
  J --> K["scripts/lib/intelligence/collect"]
  K --> L["runtime intelligence artifacts"]
  L --> M["scripts/lib/intelligence/apply"]
  M --> E
```

## High-Level Boundaries

### Frontend

- location: `app/studio/`
- responsibility: UI state, controls, preview composition, command output display
- not responsible for: filesystem access, route logic, path validation, or direct command spawning
- shared e2e selectors (`data-testid`) for core Studio interactions live here

The teacher-facing release manifest lives in `app/studio/src/lib/studio-release-notes.ts` and powers the modal **What’s new** view. Inspection draft state and async cancellation live in `useInspectionDraft`; Review Set item creation, persistence, packet generation, screenshot ownership, and capture are exposed to `App.tsx` only through `lib/review-workbench.ts`. Compatibility aliases may remain at subsystem boundaries, but all Studio retention, screenshot, bridge, and packet ceilings originate in `app/shared/studio-quality.ts`, where UTF-8 bytes and JavaScript code units are named separately.

### Local Server

- location: `app/server/`
- responsibility: API endpoints, preview handlers, request parsing, path validation, command bridge, session-log writes
- not responsible for: frontend rendering or project transformation logic

Studio API routes and course preview routes have separate browser origins. The preview server is a separately allocated loopback port that serves only `GET`/`HEAD` preview assets, the early-injected preview bridge, and capability-scoped legacy runtime dependencies. Every course URL is prefixed by a random capability bound to one exact project/root. A workspace capability may additionally read only that same project's declared `raw` or `extracted` reference roots; raw/reference capabilities cannot cross into a workspace, and no capability can cross projects. Unscoped paths are denied. The live-preview CSP permits presentation-only HTTPS styles, fonts, images, media, and frames so the authored course remains visually faithful. Approved legacy dependencies are syntax-rewritten through a same-origin runtime relay instead of adding `https:` to `script-src`. The relay accepts exact versioned library/path/query families, binds declared and transitively discovered sources to the current preview capability, sends no credentials, revalidates bounded redirects, accepts only JavaScript MIME types, caps global cold-fetch concurrency and each response, times out cold fetches, keeps a bounded memory cache with capability-neutral transformed ESM templates, and pins known unversioned Tailwind, Babel, Lucide, React, and ReactDOM URLs. Local JavaScript is parsed only through 512 KiB and otherwise served byte-for-byte; approved relayed ESM is parsed only through 2 MiB and larger modules are rejected. Local/reference `HEAD` exits before file reads or transformation, relay `HEAD` is cache-only, and capability-tokenized response bodies are never cached. Arbitrary external scripts, form submissions, and nonlocal browser data connections remain blocked. The server exposes no Studio APIs, `display-capture` is denied through Permissions Policy, the allowed Studio parent is pinned through `frame-ancestors`, and contained real paths remain mandatory. Studio never reads a preview DOM. Embedded scroll, inspect, and selection events travel through a bounded private `MessageChannel` that is re-established after each frame load. Full preview uses a trusted Studio-origin host around the isolated course iframe. One-time bootstrap and session-only rejoin tokens keep its channel private while allowing the host to reconnect after Studio reload; the untrusted course never receives the Studio channel or opener.

Selected HTML pages now pass a server-side preflight before Studio mounts their iframe. The preflight accepts only an exact capability-scoped URL on the current isolated loopback origin, resolves it through the same contained preview paths, and reports bounded categories without exposing absolute paths: ready, missing or empty page, missing local script or stylesheet, unsupported remote runtime, unsupported page, or unreadable page. It recognizes static HTML, local runtimes, and only the exact remote runtime families already accepted by `preview-runtime-relay.ts`; adding a runtime requires updating that allowlist and its security tests rather than weakening CSP. Preflight success is not treated as proof that a JavaScript app rendered. The private bridge separately observes course-owned text or visual content and emits a bounded `preview-health` state; Studio converts an empty runtime, bridge timeout, or bounded runtime diagnostic into a teacher-facing recovery surface with Retry, page choice, collapsed details, and a sanitized `preview-issue-v1` Codex packet. Headless screenshot capture does not feed this live state: blocked external media or scripts during network-disabled capture are intentional secure-capture fallbacks, not learner-preview defects.

### Scripts / Engine

- location: `scripts/`
- responsibility: import, analyze, refs, export, packaging, rehydrate, smoke verification
- not responsible for: browser UI behavior

Export target orchestration now lives under `scripts/lib/exports/`, while target-specific runtime bridges stay beside their owning protocol modules such as `scripts/lib/scorm.ts` and `scripts/lib/google-hosted.ts`.

English course-family conversion lives under `scripts/lib/english-unit/`. `EnglishCourseManifestV1` inventories shared archives and allowed units; `EnglishUnitRecipeV2` holds durable unit decisions; `EnglishActivityProfileV1` selects content-specific activity renderers. Course intake, safe staged workspace promotion, and verification remain filesystem scripts rather than Studio state.

The English factory owns only declared generated workspace paths. Recipes and `workspace/components/**` / `workspace/assets/custom/**` are preserved authoring sources. All profiles use the shared Evidence Bank API from `scripts/lib/next-step-course-shell.ts`, while activity-local response storage remains separate from deliberate Evidence Bank contributions.

### Project Data

- location: `projects/<slug>/...`
- `raw/`: immutable imported baseline
- `workspace/`: editable output
- `meta/`: manifests, logs, prompt-pack, session log, optional policy overrides, benchmark selection (`benchmark-selection.json`), authoring overrides (`authoring-preferences.json`), deviation reports (`deviation-report.json`, `deviation-report.md`), and derived planning artifacts such as `resource-catalog.json`, `course-blueprint.json`, `assessment-map.json`, and `lesson-packets/`
- `projects/resources/<slug>/`: raw support files plus extracted text
- `projects/assessments/<assessment-slug>/`: global assessment-library items (`source/`, `assessment.project.json`, `import-result.json`, `exports/brightspace/`)
- `exports/`: generated output only

`projects/<slug>/meta/project.json` is the source-of-truth manifest contract for active authoring state.
Migrated active projects should explicitly declare:
- project/workflow classification (`projectType`, `preferredWorkflows`)
- canonical source-of-truth (`canonicalEntry`, `canonicalSources`)
- regeneration contract (`generatedOutputs`, `regenerateCommand`) where needed
- integration provenance (`injectedComponents`, `importedFirstPassOrigin`)
- lifecycle/export posture (`authoringStatus`, `exportTargets`, `referenceOnly`)
- optional explicit authoring ownership (`authoring.driverId`, `authoring.familyId`, source-resource IDs, and a focused quality profile) for newly onboarded projects; legacy projects remain visibly marked as inferred until migrated

### Compact Course Authoring Context

The `course:doctor`, `course:list`, and `context:project` commands form a read-only safety layer for active migrated course work. Their implementation lives in `scripts/lib/course-authoring/`.

- `course:doctor` reads the manifest without rehydrating a project, validates canonical paths against the current checkout, rejects traversal and symbolic-link escapes, and reports legacy absolute paths as normalized repo-relative values without rewriting metadata.
- `course:list` runs the same doctor-backed resolver before showing a readiness state: `direct-ready`, `factory-ready`, `proposal-only`, or `blocked`. It never equates lifecycle `active` with permission to edit or rebuild.
- `context:project` runs only after the doctor passes and emits a compact source-of-truth brief capped at 5,000 UTF-8 bytes. It excludes whole blueprints, resource catalogs, and prompt-pack bodies.
- English factory projects are classified from the staging/build contract: `meta/english-unit.json`, `workspace/components/**`, and `workspace/assets/custom/**` are editable; factory-owned workspace output remains protected. The doctor also checks that the recipe's Brightspace and teacher archives exist as real files rather than unresolved LFS pointers. A rollback-safe factory transaction covers generated workspace output, resource-library `teacher/**` and `_extracted/**` files, and generated metadata; recipes, prompt packs, custom components, raw imports, and resource `_sources/**` remain outside its write set.
- Social related-issues projects are proposal/rebuild-only. Their `authoring.sourceResourceIds` resolve through the checksum-verified `projects/resources/social30-1-related-issues/resource-manifest.json`; the doctor fails if that declared source is missing, an unresolved LFS pointer, or has drifted from its checksum. The Social builder stages a whole workspace and only promotes it after a valid HTML entrypoint exists, writing at most `workspace/**`, `meta/social-build.json`, and `meta/conversion-notes.md`; it never writes `raw/**` or `meta/project.json`.
- Studio deliberately has no model-provider integration or automatic source-write path. Its role is local preview, source-of-truth visibility, and safe handoff into an explicit Codex task; actual course edits remain in the declared canonical source or owning rebuild flow. The Inspector resolves only `exact`, `bounded`, or `unknown` source ownership from repository-side metadata and caps its Review Set V3 packet at 7.5 KB with repo-relative targets only. Selected preview text is labeled as untrusted course content, and unsafe local paths are omitted.

### Studio Inspector and screenshot boundary

The Inspector receives only opaque preview facts (temporary node ID, safe visible text, semantic label, and viewport geometry). The server derives edit targets, contributor paths, and rebuild commands from the selected project's declared authoring driver. A direct static workspace may additionally receive an exact current source line and a bounded surrounding excerpt; generated Social and English workspaces deliberately do not. That excerpt is local visual evidence only and never enters a copied handoff. A generated workspace is therefore never promoted into a primary source just because it is visible in the preview.

The visible Inspector is intentionally a teacher-facing annotation surface rather than a source dashboard. **Annotate** activates a blue mode bar and accepts an element click, a dragged rectangle, or keyboard traversal across mapped course content; keyboard entry temporarily focuses otherwise noninteractive mapped elements without changing their source markup. A drag becomes source-backed only when its endpoints share one unambiguous mapped owner; an ambiguous area remains visual-only and cannot be saved as if its start element owned the region. The rail shows the selected course text, one change note, optional screenshot controls, and a Review Set of at most five items with up to three screenshots each. Notes and screenshot references are editable. Source files, ownership labels, build commands, packet text, and bounded preview diagnostics are not rendered in that rail. The repository-side resolver still derives and revalidates those facts, and the Review Set packet still carries the safe repo-relative route Codex needs. The doctor-derived `GET /api/projects/<slug>/authoring-brief` route remains available to repository tooling but is not part of the default annotation UI.

Studio quality limits live in `app/shared/studio-quality.ts`. The shared contract separates expected local response budgets (two-second preview readiness, 500 ms visibly committed selection feedback, and 2.5-second capture result including the current-selection refresh) from longer hard recovery deadlines, and it owns the bounded browser-workbench project/session/item/screenshot retention limits. The client dispatches local `canvas-helper:studio-performance` events for regression tests without transmitting telemetry. Preview source decoration is cached only by exact path, mtime, and size in a 24-entry in-memory LRU; source changes always force reparse. Preview hover work is animation-frame coalesced, Canvas Helper overlays are excluded from course-index invalidation, mapped-node and keyboard candidate indexes are cached per page, late course mutations invalidate scroll discovery, and the runtime health observer disconnects after the first meaningful-content report while retaining a final bounded health check. An intake mutation always forces a new project-list request after the mutation completes.

Opening a workspace preview uses a separate trusted host tab with the course in a cross-origin iframe. The host bridge exposes the same blue **Annotate** mode, shared Review Set workflow, and **Return to Studio**; it never adds those controls inside the course document. Full-preview capture, save, note-edit, remove, clear, copy, cross-page **Show**, and return actions travel over the standalone private channel. A bounded rejoin token lets an already-open host reconnect after Studio reload, while a confirmed focus acknowledgement prevents **Show** from claiming success before the saved page, course query/hash state, and node are present. Course navigation invalidates any active unsaved selection. A connected return focuses the existing Studio session and closes the auxiliary preview. Studio remains the sole Review Set owner, performs every source resolution and revalidation, and sends only bounded item summaries plus the prepared packet back to the connected preview. A strict version-6 Studio-local record keeps the active set for seven days across reloads and fails visibly without crashing when browser storage is denied; the preview itself receives no persistent Review Set storage, filesystem access, or direct source-writing authority.

Optional screenshot annotation is deterministic and never requests desktop or tab sharing. Studio sends a bounded source-mapped selection to same-origin `POST /api/inspection/capture`. The server validates the exact capability-scoped `127.0.0.1` workspace-preview path, launches a headless Playwright page at the saved viewport, restores window and container scroll, blocks outside HTTP requests, all WebSockets, WebRTC peer connections, service workers, and dedicated/shared workers, then verifies those guards in the main document and every runnable local, `about:`, `data:`, or `blob:` child frame. Empty, uncommitted, and browser-generated blocked-error frames are skipped because they cannot run course code and are already isolated by the capture network policy. It rechecks the full page identity—including course query and hash state—plus fresh selected-element geometry before returning one marked viewport PNG. Capture is globally serialized; disconnect or the hard twenty-second deadline releases the slot even if capture work ignores abort, and a browser that finishes launching late is closed. `POST /api/inspection/screenshots` validates PNG signature, byte size, dimensions, the exact session/project/item/node owner, and a separate screenshot identity before writing atomically to the ignored `.runtime/studio-review-sets/<session>/` cache. Per-item/session limits are backed by a 150-file and 100 MiB global cache ceiling. Screenshot `GET`, verify, and `DELETE` all require that exact ownership tuple, so a safe-looking path or item-ID prefix cannot display, attach, or delete another annotation's evidence. Review Set V3 text contains only safe repo-relative screenshot paths—never pixels, base64, blob URLs, or absolute local paths—and labels screenshot pixels as untrusted course evidence. The internal Studio persistence record is independently versioned and strictly rehydrates only matching request/resolution identities. Both persisted metadata and cached sessions use a seven-day retention boundary.

### Intake and Resources

- `projects/incoming/`: one-shot import queue for HTML files and bundle folders
- `projects/processed/<slug>/source/`: latest kept import snapshot for that project
- `projects/resources/<slug>/`: canonical original reference files
- `projects/resources/<slug>/_extracted/`: generated extracted text for Studio and prompt-pack flows
- `projects/resources/social30-1-related-issues/resource-manifest.json`: the Social 30 related-issues source index. It may temporarily point at a kept `projects/processed/**/source/` snapshot with `availability: "snapshot-backed"`, but the builder still verifies the file's SHA-256 before use.
- `projects/<science-slug>/meta/science-pilot.json`: a planning-only Science course contract created by `intake:science-pilot`. It names checksum-copied source archives, the representative-unit boundary, a science learner-loop candidate, and required decisions. It begins `blocked` with `proposal-only-v1`; no generic Science factory or learner workspace is created until that pilot is approved.

Studio and the watcher both use the same local refresh engine. The `Refresh Intake` button runs a one-shot scan through the local server. The long-running watcher scans both `incoming` and `resources` with the same lock file so the two entry points do not collide.
If a canonical `projects/<slug>/` root is missing required manifest/raw/workspace artifacts but `projects/processed/<slug>/source/` still exists, project discovery re-imports from that processed snapshot to restore the canonical project automatically.

## Intelligence Model

The intelligence system is split into explicit layers:

- `collect/`: always-on signal gathering and persistence
- `apply/`: optional influence on prompt-pack generation and recommendations
- `config/`: policy defaults, flag resolution, and mode handling

Authoring preference enforcement is now part of the intelligence boundary:

- repo defaults: `config/authoring-preferences.json`
- project overrides: `projects/<slug>/meta/authoring-preferences.json`
- gate engine: `scripts/lib/intelligence/apply/deviation-gate.ts`
- resolver: `scripts/lib/intelligence/config/authoring-preferences.ts`
- outputs: per-project deviation reports in `meta/`

### Benchmark-Driven Generation

Approved generation patterns now live in `scripts/lib/benchmarks/`:

- `registry/`: benchmark records promoted from approved projects
- `recipes/`: reusable lesson and activity recipe definitions
- `load.ts`: deterministic JSON loading for registry assets
- `project-selection.ts`: project-level benchmark selection resolution from `projects/<slug>/meta/benchmark-selection.json`

This layer sits above observational intelligence and below project converters:

- pattern bank and memory ledger remain observational
- benchmark registry becomes the authoritative reuse layer for generation
- prompt packs can surface selected benchmark context
- converters such as `hss1010` can resolve benchmark + recipes intentionally instead of inferring style from memory alone

### Modes

- `off`: no learner collection, no learner application
- `collect`: collection only, no learner application
- `apply`: collection plus learner application in prompt-pack and recommendation flow

### Precedence

1. CLI override
2. `LEARNER_MODE` environment variable
3. project policy override
4. repo default policy
5. built-in safe default (`collect`)

## Core vs Experimental

### Core

- import
- analyze
- refs extraction
- assessment-library ingest (PDF/DOCX), validation, and Brightspace CSV export
- resource classification and chunk indexing
- course blueprint generation
- assessment mapping
- lesson packet generation
- Studio preview
- local command execution
- Brightspace export/package
- SCORM 2004 / 1.2 package export with suspend-data bridge
- Google-hosted export with Firebase Auth / Firestore resume bridge
- Apps Script export with a Drive-backed HtmlService web-app package for Google Sites embedding
- prompt-pack generation
- memory ledger and pattern-bank collection
- benchmark registry and recipe-driven generation selection
- Playwright-based Studio e2e automation with contract-driven project checks

## E2E Automation Layer

Browser automation is implemented as a small platform layer under `e2e/`:

- `e2e/playwright.config.ts`: shared runner and local Studio web-server boot
- `e2e/specs/core-project-contract.spec.ts`: reusable core checks
- `e2e/lib/load-project-contract.ts`: contract loading/validation
- `e2e/lib/project-open.ts`: common Studio project-open flow
- `e2e/lib/studio-fixtures.ts`: project-independent fixture descriptors for cross-project Studio behavior
- `e2e/playwright.release.config.ts`: release-only configuration with an owned port, no reused server, and `forbidOnly`

Project-specific expectations are declarative:

- `projects/<slug>/meta/e2e-contract.json`

Contract files define which checks are enabled for that project (mode toggles, navigation, quiz behaviors, fallback expectations) so coverage depth can vary by project without bespoke test sprawl.

Default command paths:

- platform smoke: `npm run test:e2e:smoke`
- project contract gate: `npm run test:e2e:project -- --project <slug>`
- complete Studio release gate: `npm run test:studio-release`

The release command is implemented by `scripts/run-studio-release.ts` and `scripts/lib/studio-release.ts`. It invokes only checked-in dependency entrypoints, owns a fresh loopback port, runs focused contracts, the production build, all inspection E2E, platform smoke, and the strict neutral fixture contract in that order, propagates the first failing exit code, and writes `.runtime/studio-release-report.json` with the branch, commit, dirty-tree status, and a deterministic SHA-256 fingerprint of the exact Studio source bytes that were tested. It fails if those source bytes change during the run. Ordinary developer E2E may still reuse its configured server; release E2E may not.

### Policy-Controlled

- intelligence influence on prompt packs
- recommendation steering

## Learner-mode Resolution

Precedence for the effective learner mode is explicit and deterministic:

1. CLI flag (`--learner-mode`)
2. `LEARNER_MODE` environment variable
3. project policy
4. repo default policy (`config/intelligence.json`)
5. safe default in `scripts/lib/intelligence/config/defaults.ts`

## Export Targets

- Brightspace folder/package: copies the workspace for LMS upload and optional zip packaging.
- SCORM 2004 / 1.2: copies the workspace, injects `scripts/lib/scorm.ts`, and emits LMS packages plus manifests.
- Google Hosted: copies the workspace, injects `scripts/lib/google-hosted.ts`, and emits a Firebase Hosting bundle under `projects/<slug>/exports/google-hosted/`.
- Apps Script: reuses the standalone HTML bundle, emits a thin `Code.gs` HtmlService shell, writes Drive-backed course assets under `projects/<slug>/exports/apps-script/drive-assets/`, and can inject a `google.script.run` autosave bridge for tracked `localStorage` keys.
- Single HTML: inlines local assets into one deliverable for static/offline handoff.

All conversion/export/deploy flows now run an authoring deviation preflight. Blocking deviations fail fast and write report artifacts before exiting.

The Apps Script path stops at deterministic package generation. Apps Script project creation, Drive upload, asset-index setup, web-app deployment, and Google Sites embedding remain explicit post-export operator steps outside the repo.

The Google-hosted path stops at deterministic bundle generation. Firebase deployment, project selection, auth domain setup, and Firestore rules remain explicit post-export operator steps outside the repo.

Google-hosted deploy metadata lives per slug in `projects/<slug>/meta/google-hosted.deploy.json`. Local deploy orchestration belongs in `scripts/`, not Studio, so a Windows launcher or CLI script can scan deployable slugs without depending on Studio UI logic. The intended long-term shape is one Firebase project per subject and one Hosting site per module slug.

Exports now avoid implicit intelligence regeneration. Export commands copy the workspace, generate delivery artifacts, and only mark the workspace approved in project manifest state. Prompt-pack, pattern-bank, and other intelligence artifacts refresh through their explicit commands.

## Placement Rules for New Code

- If it renders UI, it belongs in `app/studio/`
- If it handles HTTP-like requests or preview file serving, it belongs in `app/server/`
- If it mutates project files or runtime artifacts, it belongs in `scripts/`
- If it learns from project history, it belongs in `scripts/lib/intelligence/collect/`
- If it changes how intelligence influences current work, it belongs in `scripts/lib/intelligence/apply/`
- If it changes policy or defaults, it belongs in `scripts/lib/intelligence/config/`
- If it defines approved generation benchmarks or recipes, it belongs in `scripts/lib/benchmarks/`

## Planning Layer

- `refs` remains the explicit resource-ingest step, but now produces classified resource metadata in `meta/resource-catalog.json` and chunk manifests under `projects/resources/<slug>/_extracted/`
- `blueprint` builds `meta/course-blueprint.json` from outline resources first, then aligns performance demand to assessment resources
- `assessment-map` builds `meta/assessment-map.json` from assessment resources with task demands, verbs, failure points, and prerequisite knowledge
- `lesson-packets` builds `meta/lesson-packets/*.json` as the main lesson-construction unit, linking outcomes, assessments, misconceptions, practice, readiness evidence, and targeted source locators
- `prompt-pack.md` should prioritize blueprint, assessment map, and lesson packets above reference excerpts
- when a project opts into a benchmark, prompt-pack should surface the selected benchmark, source-support mode, and recipe set explicitly

## Course Conversion Pipeline (HSS1010)

- conversion modules live in `scripts/lib/conversion/`
- current conversion entrypoint is `scripts/convert-hss1010.ts` (`npm.cmd run convert:hss1010 -- --project hss1010`)
- pipeline responsibilities:
  - parse source chunks (`parseSource.ts`)
  - extract structured course and assessment models from legacy workspace HTML (`normalizeBlocks.ts`)
  - build source mapping (`buildSourceMap.ts`)
  - generate coverage audit (`auditCoverage.ts`)
  - render section-tab workspace shell/runtime (`renderCourse.ts`, `renderAssessment.ts`, `hss1010.ts`)
- generated project artifacts are written to `projects/<slug>/meta/` and `projects/<slug>/workspace/data/`

## Assessment Library Flow

- Studio `Assessment Library` mode calls local server routes under `/api/assessments`
- API surface:
  - `GET /api/assessments`
  - `POST /api/assessments/import`
  - `GET /api/assessments/:slug`
  - `PUT /api/assessments/:slug`
  - `DELETE /api/assessments/:slug`
  - `POST /api/assessments/:slug/export/brightspace`
- The server persists artifacts to `projects/assessments/<assessment-slug>/...` as the system of record
- PDF ingest uses `scripts/lib/pdf-text.ts` for native-first extraction with OCR fallback, then deterministic question extraction under `scripts/lib/assessments/`
- DOCX ingest and Brightspace export remain deterministic and filesystem-backed (no browser localStorage repository)

## Reasoning Rules for New Agents

- Start with the owning boundary, not the nearest file.
- Preserve local-first behavior.
- Keep Node as the engine and the browser as the local shell.
- Prefer explicit modules over hidden cross-layer coupling.
- Treat `raw/` and `exports/` as protected artifacts.
