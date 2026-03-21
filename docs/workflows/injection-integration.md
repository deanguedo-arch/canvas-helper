# Workflow: Injection / Integration

Use this workflow when externally generated components (activities, games, assignment tools) are inserted into existing course surfaces.

## Default Mode

- Use `DEFAULT` for surgical integration and contract safety.
- Use `CANVAS` only if the host artifact itself must be reshaped.

## Primary Goals

- Normalize external component code.
- Insert components without breaking host artifact concept.
- Preserve provenance and traceability.
- Keep source-of-truth and reference-only boundaries explicit.

## Source-of-Truth Pattern

- Track each injected component in `project.json` under `injectedComponents`.
- Each injected component should include:
  - `id`
  - `source`
  - `target`
  - `status` (`active`, `reference-only`, `planned`, `archived`)
- Keep reference-only component variants out of active execution paths.

## Reliable Integration Patterns

- Match surrounding typography and spacing rhythm.
- Keep stable selectors and host contracts unchanged when possible.
- Add scoped wrappers instead of global style overrides.
- Validate component fit with open/closed sidebar and mobile widths when relevant.

## Common Failure Modes to Avoid

- Components that look wired but are still reference-only.
- Host artifact drift caused by broad restyling during injection.
- Missing provenance notes that make later maintenance ambiguous.
