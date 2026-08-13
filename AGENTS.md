# Canvas Helper Agent Contract

## Mission

Canvas Helper is a local-first production environment for course artifacts.

Its job is:

`import -> normalize -> edit -> expand -> integrate -> export`

Canvas Helper is not only a first-pass generator. External first-pass generation (for example Gemini Canvas) is officially supported. Canvas Helper then turns those artifacts into cleaner, integrated, export-ready deliverables.

## Official Workflows

### 1) `conversion`

Use for D2L/Brightspace-derived courses and similar conversion tasks.

Goals:
- preserve instructional fidelity
- strip LMS noise
- improve web presentation clarity
- add targeted interactions only when helpful

### 2) `generated-course`

Use for projects where first-pass artifacts come from Gemini Canvas or another external generator.

Goals:
- import first-pass artifacts into workspace
- normalize structure and behavior
- expand depth, hierarchy, navigation, and interaction quality
- produce coherent export-ready modules

### 3) `injection/integration`

Use for externally generated interactive activities inserted into existing course surfaces.

Goals:
- import and normalize component code
- place components surgically
- preserve traceability and source-of-truth clarity

## Codex-to-Studio New Course Contract

Every net-new learner course authored from scratch in Codex must begin with the checked-in scaffold command:

```bash
npm run course:create -- --slug <slug> --title "<title>" --course-code "<code>" --summary "<summary>"
```

- Run the command before adding lessons, activities, or assets. Do not handcraft a project root or copy a legacy course as the starting point.
- Continue authoring only in the created canonical files under `projects/<slug>/workspace/**` and operational metadata under `projects/<slug>/meta/**`.
- Keep routine teacher-editable text, links, and images in canonical HTML. JavaScript may attach behavior, but it must not replace those visible elements after load.
- Keep synchronized course-name surfaces marked with `data-canvas-helper-course-title` and durable repeated/reorderable content marked with `data-canvas-helper-edit-key`.
- The scaffold must remain `course:doctor`-passing, explicitly `direct-workspace-v1`, and Studio-editable. A running Studio discovers it automatically.
- If the course later requires a generated workspace or family builder, do not keep claiming Direct ownership. Introduce a supported adapter, stored overrides, rebuild path, and reversible pilot before enabling Edit for that generated boundary.
- Imported, conversion, English-factory, and Social-factory work must use their owning intake/factory workflow rather than this from-scratch scaffold.

Completion floor for a new Codex course:

- `npm run course:doctor -- --project <slug>`
- `npm run verify -- --project <slug> --mode workspace`
- visually inspect the Edit map in Studio
- apply one reversible draft, reload, and Undo
- add and run `npm run test:e2e:project -- --project <slug>` when learner interactions are added

## Existing Course Catalog Contract

Use the checked-in catalog workflow for legacy course onboarding; never make a project editable by adding only a boolean flag:

```bash
npm run course:onboard -- --all
npm run course:onboard -- --all --apply --report .runtime/course-onboarding-report.json
npm run verify:course-onboarding -- --all
```

- The audit must assign every project directory one explicit outcome: Direct, English factory, Social factory, preserved legacy snapshot, blocked, reference-only, or package archive.
- `legacy-snapshot-v1` preserves the current workspace as the learner baseline and quarantines any legacy builder that could replace Studio work. Do not run that old builder through Studio.
- Package/export-only directories are catalogued but are not editable sources. Recover or intentionally import a canonical source before creating an authorable manifest.
- Keep runtime-owned content visibly Annotation only. Catalog membership does not mean every rendered node is a safe direct-edit target.
- A catalog apply must be transactional, doctor every enabled project, signal a running Studio only after success, and be idempotent on its next audit.
- The completion floor is `test:course-onboarding`, a clean retain-only audit, `verify:course-onboarding -- --all`, focused Studio tests, and the active handoff/audit update.

## Architecture Map

- `app/studio/`: React/Vite browser shell only
- `app/server/`: local request handlers, preview serving, command execution bridge
- `app/shared/`: command contracts and other browser/server-safe shared definitions
- `scripts/`: import, analyze, refs, export, rehydrate, smoke, and task scripts
- `scripts/lib/exports/`: export target orchestration only
- `scripts/lib/intelligence/config/`: intelligence policy and feature-flag resolution
- `scripts/lib/intelligence/collect/`: always-on learning and signal collection
- `scripts/lib/intelligence/apply/`: prompt-pack influence, recommendations, and application
- `projects/incoming/`: intake drop zone for new HTML files and bundle imports
- `projects/processed/`: latest kept import snapshot per project slug
- `projects/resources/`: canonical project resource library and extracted text
- `projects/<slug>/raw/`: immutable imported baseline
- `projects/<slug>/workspace/`: editable working files
- `projects/<slug>/meta/`: manifests, prompt-pack, logs, and operational artifacts
- `projects/resources/<slug>/`: shared project resource library and extracted text
- `projects/<slug>/exports/`: generated output only
- `docs/`: architecture, governance, ops, and plans

## Allowed Zones

- `app/studio/**`
- `app/server/**`
- `scripts/**`
- `docs/**`
- `tasks/**`
- `projects/<slug>/workspace/**`
- `projects/<slug>/meta/**`
- `projects/incoming/**`, `projects/processed/**`, and `projects/resources/**` for intake and resource-pipeline work only
- repo root governance/config files

## Forbidden / Protected Zones

- `projects/<slug>/raw/**` unless the task explicitly requires raw repair or import regeneration
- `projects/<slug>/exports/**` unless the task explicitly requires generated output inspection
- `.runtime/**` unless the task explicitly targets runtime intelligence or caches
- unrelated broad file moves, renames, or formatting-only sweeps

## Domain Ownership

- Studio UI state, components, and browser behavior belong in `app/studio/`
- Local request routing, preview path validation, and command execution belong in `app/server/`
- Shared Studio/server command definitions belong in `app/shared/`
- Filesystem import/analyze/refs/export logic belongs in `scripts/lib/`
- Export target orchestration belongs in `scripts/lib/exports/`
- Intelligence collection belongs in `scripts/lib/intelligence/collect/`
- Intelligence application and prompt-pack influence belong in `scripts/lib/intelligence/apply/`
- Intelligence policy, defaults, and feature flags belong in `scripts/lib/intelligence/config/`
- Repo operating rules belong in `AGENTS.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, and `docs/ops/`

## Artifact Roles

Every project must treat artifact roles explicitly:

- `canonical editable source`: primary files for active editing
- `imported first-pass source`: external seed artifacts from first-pass generation or import
- `injected component source`: externally generated activities integrated into larger artifacts
- `runtime/generated output`: bundles and generated files derived from canonical sources
- `reference/archive only`: non-active files retained for history, extraction, or reuse

## Source-of-Truth and Regeneration Rules

- Every active artifact must declare one canonical editable entry and canonical source files.
- Runtime bundles and generated outputs are never canonical sources.
- If generated outputs are tracked, declare how to regenerate them.
- Direct bundle/runtime patching is emergency-only.
- Any emergency runtime patch must be documented in project metadata and handoff output.
- Reference-only files must be declared so they are not mistaken for active execution paths.

## Project Metadata Standard

Use `projects/<slug>/meta/project.json` as the single per-project metadata contract.

Required for migrated active work:

- `migrationState`: `legacy | migrated`
- `projectType`: `conversion | generated-course | hybrid`
- `preferredWorkflows`: array of workflow names
- `canonicalEntry`
- `canonicalSources`
- `authoringStatus`: `active | blocked | ready-for-export | reference-only | archived`
- `exportTargets` (when active)

Recommended for discipline:

- `generatedOutputs`
- `regenerateCommand`
- `injectedComponents` with status `active | reference-only | planned | archived`
- `importedFirstPassOrigin`
- `referenceOnly`
- `sourceOfTruthNotes`

## Change Budget

- Prefer focused changes with clear file ownership.
- Touch only the domains needed for the task.
- If a task expands past the planned boundary, document why in the handoff output.

## Authoring Modes

The repo supports two distinct authoring goals and they must not be blended:

- `CANVAS`: artifact-level generation, expansion, and redesign within the requested artifact boundary.
- `DEFAULT`: controlled engineering for integration, refinement, conversion improvements, and export stability.

Mode selection should match the task. Do not average the two behaviors together.

## Clarification Policy

Ask no clarification questions when all of the following are clear from the prompt or project metadata:

- mode
- workflow
- project slug
- canonical entry
- boundary
- source-of-truth constraints
- success criteria

Execute directly when those are clear.

Ask exactly one clarification question only when a missing or conflicting constraint prevents safe action.

Valid reasons to ask:
- canonical entry is unknown
- boundary is ambiguous
- source-of-truth is unclear
- the request may require editing protected zones, runtime bundles, or reference-only files
- the request mixes redesign and preservation in a conflicting way
- success criteria are missing or contradictory

When clarification is needed:
- ask exactly one highest-leverage question
- do not ask for confirmation on obvious next steps inside the approved boundary
- do not repeatedly ask for scope confirmation once the boundary is explicit
- after the answer is provided, proceed without re-asking unless the user changes scope

## Clarification Precedence

The clarification policy controls whether the agent asks a question before acting.

If the prompt contract is complete and non-conflicting, execute without asking.

Read-discipline, surgical-default, and mode-overlay rules must be interpreted inside that decision. They may narrow retrieval behavior, but they do not create extra clarification questions unless the task would cross the approved boundary or violate source-of-truth constraints.

## `CANVAS` Mode Behavior

- Optimize for coherent artifact quality, not timid micro-patches.
- Improve hierarchy, readability, interaction quality, responsiveness, and meaningful states.
- Allow section/page-level restructuring when the request is artifact-focused.
- Stay inside the requested project boundary.
- Do not broaden into unrelated repo cleanup.

## `DEFAULT` Mode Behavior

- Optimize for source-of-truth discipline, stability, and controlled scope.
- Preserve the artifact concept unless redesign is explicitly requested.
- Prefer smallest diff that fully resolves the task.
- Keep compatibility with exports, contracts, and selectors.
- Avoid broad refactor sprawl.

## No Drive-By Refactors

- No formatting sweeps.
- No renames unless the rename directly clarifies architecture in scope.
- No dependency churn unless required to preserve or unblock the requested behavior.
- No speculative cleanup outside the task boundary.

## Retrieval Defaults

0. Read `docs/ops/FAST_PATHS.md` first for common task-specific retrieval shortcuts.
1. Read `docs/ops/ACTIVE_HANDOFF.md` first for any continuation work.
2. If workflow is known, read the matching file under `docs/workflows/`.
3. Read `projects/<slug>/meta/prompt-pack.md` first when a project slug exists.
4. Then read the relevant `.runtime/pattern-bank/` matches or ledger artifacts if the task depends on prior learning.
5. Use `projects/resources/<slug>/_extracted/` only after prompt-pack and workflow context.
6. Read `ARCHITECTURE.md` and `docs/ops/HANDOFF.md` for repo-wide changes or handoff rules.

## Surgical Default Rules

- Start with the smallest file set that can answer the task.
- Prefer targeted reads, `rg`, and known entrypoints over broad repo scans.
- Expand scope only when the current context is insufficient to act safely.
- If the prompt contract and clarification policy are already satisfied, do not ask for approval just because additional targeted reads are needed inside the approved boundary.
- Ask exactly one clarification question only when broader retrieval would cross the declared boundary, risk protected-zone edits, or conflict with source-of-truth constraints.
- Do not widen scope preemptively "just in case."
- Keep follow-up reads minimal.

## Refinement Rules

- Preserve the concept unless redesign is explicitly requested.
- Fix the weakest part first instead of redesigning the entire surface.
- Keep the blast radius controlled and stay within the requested files and flows.
- Preserve stable selectors, contracts, and exported behavior when UI or automation depends on them.
- Prefer the smallest diff that fully resolves the refinement task.
- Do not turn a cleanup pass into a new visual direction.
- Do not introduce unrelated cleanup, abstraction churn, or broad repo edits.

## Subagent Mode

- If the user explicitly says this is a subagent, or says to act as a subagent, treat the task as subagent mode automatically.
- If the signal is ambiguous, ask exactly once: `Should I apply subagent rules for this task?`
- When subagent mode is active, keep the surgical-default rules on for the rest of the task unless the user changes the scope.
- Do not keep asking whether to apply subagent rules after subagent mode is confirmed.

## Intelligence Rules

- Collection and application are governed by the explicit learner mode and policy flags.
- Modes:
  - `off`: no collection, no application
  - `collect`: collection only
  - `apply`: collection + application
- Respect precedence in this order:
  1. CLI override
  2. `LEARNER_MODE` environment variable
  3. project policy file
  4. repo default policy
  5. built-in safe default (`collect`)
- Do not hard-wire intelligence influence into unrelated commands.

## Feature Flag Rules

- Put intelligence flags in `scripts/lib/intelligence/config/`.
- Default new flags to the safest behavior that preserves current workflows.
- Document every new flag in `ARCHITECTURE.md`, `CONTRIBUTING.md`, and the relevant command help text.

## Docs Update Rules

- Update `README.md` when quick start, commands, or top-level workflow changes.
- Update `ARCHITECTURE.md` when responsibilities, folder boundaries, or core data flow changes.
- Update `CONTRIBUTING.md` when completion, commit, or verification rules change.
- Update `docs/ops/` when the operating loop, handoff format, or agent workflow changes.
- Update `docs/workflows/` when workflow patterns or prompt contracts change.

## Test Update Rules

- Add or update tests when changing parsing, intelligence policy, route behavior, preview safety checks, exported artifacts, or metadata policy enforcement.
- Add a smoke-path update when changing core import/analyze/refs/export flow.
- Do not ship architecture changes without at least targeted verification for the affected boundary.

## E2E Automation Policy

Use browser automation as a regression gate for interaction-heavy work.

Run E2E before finishing a task when any of the following changed:
- shared Studio/player UI
- learner/archive mode logic
- module navigation logic
- quiz rendering, progress, or answer state
- conditional visibility/fallback panel behavior
- project e2e contract files
- shared selectors used by tests

Default commands:
- platform smoke: `npm run test:e2e:smoke`
- project contract run: `npm run test:e2e:project -- --project <slug>`

Rules:
- Do not run broad E2E for non-UI scripting work unless the task explicitly requires it.
- If UI behavior changed, update stable `data-testid` selectors as needed.
- If project behavior expectations changed, update `projects/<slug>/meta/e2e-contract.json`.
- Keep the high-confidence suite project-agnostic by defining `assertionProfiles`, `modulePassTargets`, and `visibilityChecks` in the project contract when deeper coverage is needed.
- Project-contract runs are strict: missing slug/contract, invalid schema, empty deep targets, or missing required `data-testid` hooks must fail fast.
- A task touching critical interaction flows is not complete until the required E2E command passes.

## Commit Rules

- Use `type(scope): concise action`
- Valid types include `refactor`, `feat`, `fix`, `docs`, `test`, `chore`
- Scope should reflect the owning domain, such as `studio`, `server`, `intelligence`, `ops`, or `smoke`

## Handoff Output Rules

Every task handoff must include:

1. Summary
2. Files changed
3. Verification run
4. Known risks / follow-up
5. Source-of-truth location
6. Fragile areas / what might drift
7. Next prompt assumptions
8. Exact next command
9. Exact next file to open

Use the stricter template in `docs/ops/HANDOFF.md` for ongoing session work.
Keep the single active handoff in `docs/ops/ACTIVE_HANDOFF.md` for all work and archive prior entries in `docs/ops/ARCHIVED_HANDOFFS.md`.

## Editing Rules for Project Data

- Do not manually edit `projects/<slug>/raw/**` or `projects/<slug>/exports/**` unless the task explicitly requires it.
- Keep user-authored changes in `projects/<slug>/workspace/**`.
- Treat `projects/<slug>/meta/**` as generated-plus-operational state that may be updated when workflows require it.
- Treat `projects/processed/**` as snapshot state, not an editable project workspace.
- Treat `projects/resources/**` as canonical source material, not a temporary intake queue.

## Design and Interaction Quality Rules

When creating or reshaping UI artifacts:

1. Keep information hierarchy clear before adding decorative styling.
2. Use typography, spacing, and contrast that improve readability in long educational surfaces.
3. Make interaction affordances explicit with accessible focus, hover, and active states.
4. Ensure responsive behavior on desktop and mobile from first pass.
5. Include meaningful states where they improve comprehension and flow continuity.
6. Prefer coherent production-like surfaces over placeholder scaffolds.

## Verification Floor

- Run the smallest meaningful set of checks for the touched area.
- For repo-wide architecture or governance changes, the minimum floor is:
  - `npm.cmd run typecheck`
  - `npm.cmd run build:studio`
  - targeted tests
  - smoke-path verification when pipeline behavior changed
