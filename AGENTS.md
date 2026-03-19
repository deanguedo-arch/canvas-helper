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

## Authoring Modes

The repo supports two distinct authoring goals and they must not be blended:

- `CANVAS`: first-pass artifact generation inside the requested boundary. Use this when the task is to create or reshape a surface so the output feels complete, coherent, and polished on the first pass.
- `DEFAULT`: balanced engineering mode for cleanup, integration, stabilization, and iterative fixes. Use this when the task is primarily about correctness, compatibility, or controlled refinement.

Mode selection should match the task. Do not average the two behaviors together. When the task is a first-pass generation request, optimize for artifact quality and completeness. When the task is a refinement request, optimize for small blast radius and stability.

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

## Surgical Default Rules

- Start with the smallest file set that can answer the task.
- Prefer targeted reads, `rg`, and known entrypoints over broad repo scans.
- Expand scope only when the current context is insufficient to act safely.
- If broader retrieval or different behavior is needed, stop and ask for approval before continuing.
- When asking, state the reason, the extra scope requested, and the expected cost in time or tokens.
- Do not widen scope preemptively "just in case."
- Keep follow-up reads minimal even after approval.

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

## Test Update Rules

- Add or update tests when changing parsing, intelligence policy, route behavior, preview safety checks, or exported artifacts.
- Add a smoke-path update when changing the core import/analyze/refs/export flow.
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

## First-Pass Generation Rules

- Build the requested artifact as a coherent surface, not a loose set of patches.
- Prefer complete layout hierarchy, clear visual grouping, and meaningful states over timid partial edits when the task is first-pass generation.
- Use richer interaction patterns when they improve comprehension, engagement, or task flow.
- Avoid generic educational templates, overused collapse or accordion patterns, and placeholder chrome when the requested artifact needs a stronger surface.
- Make the output responsive from the start, including mobile spacing, touch targets, and reflow behavior.
- Keep the work inside the requested project boundary and the files needed to support the artifact.
- Do not widen into unrelated repo cleanup just because the generation task is open-ended.

## Generative & Aesthetic Design Rules

When generating new components, editing HTML, or writing CSS within this project, follow these standards:

1. **Typography**: Use a premium web font stack when you are creating a new UI surface. Prefer `Inter`, `Outfit`, or `Plus Jakarta Sans` over default browser fonts. Establish a readable scale with strong contrast and comfortable line height.
2. **Color System**: Define cohesive CSS variables and build the palette from them. Prefer accessible HSL or RGB values with clear semantic roles instead of flat named colors.
3. **Hierarchy and Structure**: Compose the page with clear sections, labels, and spacing rhythms. The first read should be obvious without decorative clutter.
4. **Depth and Surfaces**: Use depth deliberately. Glassmorphism, shadows, borders, and translucency are useful when they clarify layers and interaction, not as decoration for its own sake.
5. **Interaction Quality**: Interactive elements should have intentional hover, focus, and active states. Transitions should support clarity and responsiveness, not distract.
6. **Responsive Behavior**: Design for mobile and desktop together. Preserve hierarchy and usability when the viewport shrinks.
7. **Meaningful States**: Include loading, empty, error, and fallback states when they improve the experience. Do not leave complex surfaces unfinished.
8. **Polish Standard**: Prefer a coherent, production-like first draft over a minimal scaffold when the task is generation.

## Verification Floor

- Run the smallest meaningful set of checks for the touched area.
- For repo-wide architecture changes, the minimum floor is:
  - `npm.cmd run typecheck`
  - `npm.cmd run build:studio`
  - targeted tests
  - smoke-path verification
