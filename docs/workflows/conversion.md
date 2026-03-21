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
- Improve visual hierarchy with stronger section structure and spacing.
- Normalize path handling and resource lookup defensively when imports vary.
- Keep export-safe file references and avoid coupling to local-only assumptions.

## Responsive and Interaction Defaults

- Use clear spacing rhythm and touch-safe controls.
- Preserve keyboard focus states for interactive controls.
- Avoid adding heavy interaction wrappers when static content already communicates well.

## Common Failure Modes to Avoid

- Rewriting course concept when task asked for cleanup.
- Patching generated bundles without recording regeneration strategy.
- Mixing reference-only files into active execution paths.
