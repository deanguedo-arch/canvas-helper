# Studio UI Cleanup Design

## Summary

Refine the Studio shell so the application reads as `Studio`, not as the currently selected project. The UI should stay open and functional by default, but visually recede behind the preview surfaces. The design goal is a minimal, calm editing environment with optional collapse for controls and output.

## Goals

- Remove redundant project identity from app-level branding.
- Keep project and file selectors visible by default because they are active tools.
- Add a collapse option for pane controls without changing the default open behavior.
- Preserve existing Studio workflows for reference selection, workspace editing, and command execution.
- Reduce debug-style visual noise in labels, borders, and spacing.

## Non-Goals

- No redesign of the import, analyze, refs, verify, or export behavior.
- No new dependencies or design-system overhaul.
- No project data model changes.
- No changes under `projects/**`.

## User Model

The user is working inside Studio. The app itself is the stable identity. Projects are temporary selections inside that app and should only surface where they are directly useful, such as dropdowns and resource pickers.

This leads to a cleaner mental model:

- App identity: `Studio`
- Pane identities: `Reference` and `Workspace`
- Current project identity: selector value only

## Layout Direction

### App Frame

- The top bar title stays `Local Studio` or `Studio`.
- Remove the large project slug heading from the top bar.
- Keep the split/focus controls and details toggle, but style them as compact utility controls.

### Pane Headers

- Left pane heading becomes `Reference`.
- Right pane heading becomes `Workspace`.
- Kicker text should be quieter and smaller, or removed if it remains visually redundant.
- The `Match Workspace` and `Match Reference` actions stay, but should read as subtle tools rather than primary buttons.

### Control Rows

- Keep both pane control rows open by default.
- Add `Hide Controls` / `Show Controls` to each pane.
- Standardize control height, spacing, and field rhythm across both panes.
- Keep project names only inside the selectors.
- Keep resource-specific utilities such as `Open Extracted Text`, but style them inline with the control row.

### Workspace Actions

- Keep the command toolbar below the workspace preview so the preview area stays aligned with the reference pane.
- Keep output hidden by default.
- Preserve the existing `Show Output` / `Hide Output` affordance.
- Tighten the button group so it reads as a compact tools rail rather than a second content block.

## Typography

- Use the existing visual language, but increase hierarchy discipline.
- App title should be the only strong global heading.
- Pane titles should be medium emphasis.
- Control labels should be smaller and lower-contrast than pane titles.
- Reduce aggressive uppercase label noise where possible.
- Remove any oversized project slug text that competes with the previews.

## Color and Surface Treatment

- Preserve the warm, soft Studio palette.
- Soften the "many outlined boxes" feel by relying more on spacing and subtle surface separation.
- Reduce border contrast on control containers.
- Keep previews visually dominant with stronger separation than the tool chrome.
- Keep success/error states readable, but avoid making toolbars feel like alert panels.

## Interaction Details

### Control Visibility

- Each pane gets a local collapse toggle for controls.
- Collapsing hides selectors and secondary tool actions for that pane only.
- The pane title and primary preview remain visible.

### Project Context

- Current project is implied by the active selector values.
- No repeated project slug in the top bar or pane heading.
- If future context is needed, it can appear as muted helper text inside the control row, not as branding.

### Reference Resource Preview

- Keep the existing behavior split:
  - Raw PDF: inline PDF preview path
  - Extracted text/resources: inline frame path
  - Unsupported binary formats: fallback card
- `Open Extracted Text` remains available whenever extracted text exists.

## Implementation Scope

Primary files expected to change:

- `app/studio/src/App.tsx`
- `app/studio/src/styles.css`

Optional supporting files only if needed:

- `app/studio/src/reference-resource-preview.ts`
- `scripts/tests/reference-resource-preview.test.ts`

## Acceptance Criteria

- The top bar no longer displays the current project slug as the main heading.
- `Reference` and `Workspace` remain the only pane titles.
- Controls stay open by default but can be collapsed per pane.
- The interface reads as a Studio app, not as a single project dashboard.
- Visual noise is reduced without removing necessary functionality.
- `npm run typecheck` and `npm run build:studio` still pass.
