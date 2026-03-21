# Workflow: Generated Course

Use this workflow for projects where first-pass artifacts are generated externally (for example Gemini Canvas) and then expanded in Canvas Helper.

## Default Mode

- Use `CANVAS` when artifact quality/structure is the focus.
- Use `DEFAULT` when integrating, stabilizing, or preparing export.

## Primary Goals

- Normalize first-pass artifacts into clean workspace structure.
- Expand section completeness and instructional clarity.
- Improve hierarchy, navigation, and interaction quality.
- Keep project export-safe while increasing depth.

## Source-of-Truth Pattern

- Declare canonical entry and canonical sources in `project.json`.
- Keep imported first-pass origin documented in metadata (`importedFirstPassOrigin`).
- Keep derived outputs and regeneration command documented when applicable.

## Reliable Upgrade Patterns

- Start with section hierarchy before visual polish.
- Use consistent labels, headings, and progression cues.
- Add meaningful states (loading, empty, fallback) for richer surfaces.
- Strengthen mobile behavior while preserving desktop coherence.

## Responsive and Interaction Defaults

- Build desktop and mobile together.
- Keep transitions purposeful and lightweight.
- Use clear active/focus/hover states on controls.

## Common Failure Modes to Avoid

- Leaving first-pass fragments partially integrated.
- Letting runtime bundle edits become silent source-of-truth.
- Applying broad repo cleanup during artifact generation work.
