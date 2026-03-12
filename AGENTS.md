# Canvas Helper Agent Contract

## Mission

Canvas Helper is a local-first Node + browser workspace for importing Canvas course content, preserving immutable raw inputs, editing safe workspace copies, applying intelligence signals, and exporting Brightspace-ready deliverables.

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
- `projects/<slug>/meta/`: manifests, prompt-pack, logs, handoff artifacts
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

## Change Budget

- Prefer focused changes with clear file ownership.
- Touch only the domains needed for the task.
- If a task expands past the planned boundary, document why in the handoff output.

## No Drive-By Refactors

- No formatting sweeps.
- No renames unless the rename directly clarifies architecture in scope.
- No dependency churn unless required to preserve or unblock the requested behavior.
- No speculative cleanup outside the task boundary.

## Retrieval Defaults

0. Read `docs/ops/FAST_PATHS.md` first for common task-specific retrieval shortcuts.
1. For repo-wide or multi-project continuation work, read `docs/ops/ACTIVE_HANDOFF.md` first.
2. Read `projects/<slug>/meta/prompt-pack.md` first when a project slug exists.
3. Then read the relevant `.runtime/pattern-bank/` matches or ledger artifacts if the task depends on prior learning.
4. Use `projects/resources/<slug>/_extracted/` only after prompt-pack and pattern-bank context.
5. Read `ARCHITECTURE.md` and `docs/ops/HANDOFF.md` for repo-wide changes or handoff rules.

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

## Test Update Rules

- Add or update tests when changing parsing, intelligence policy, route behavior, preview safety checks, or exported artifacts.
- Add a smoke-path update when changing the core import/analyze/refs/export flow.
- Do not ship architecture changes without at least targeted verification for the affected boundary.

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
5. Exact next command
6. Exact next file to open

Use the stricter template in `docs/ops/HANDOFF.md` for ongoing session work.
For repo-wide or multi-project work, keep the active handoff in `docs/ops/ACTIVE_HANDOFF.md`.

## Editing Rules for Project Data

- Do not manually edit `projects/<slug>/raw/**` or `projects/<slug>/exports/**` unless the task explicitly requires it.
- Keep user-authored changes in `projects/<slug>/workspace/**`.
- Treat `projects/<slug>/meta/**` as generated-plus-operational state that may be updated when workflows require it.
- Treat `projects/processed/**` as snapshot state, not an editable project workspace.
- Treat `projects/resources/**` as canonical source material, not a temporary intake queue.

## Verification Floor

- Run the smallest meaningful set of checks for the touched area.
- For repo-wide architecture changes, the minimum floor is:
  - `npm.cmd run typecheck`
  - `npm.cmd run build:studio`
  - targeted tests
  - smoke-path verification
