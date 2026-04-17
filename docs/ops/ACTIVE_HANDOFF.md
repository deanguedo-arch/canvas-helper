# Handoff

- Project: sportswellness
- Task: Reduce the lesson image footprint across the Sports Wellness phases without changing the lesson content structure.
- Status: in progress

## Files changed
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed
- Archived the previous `sportswellness` rename-and-phase3 parity handoff in `docs/ops/ARCHIVED_HANDOFFS.md`.
- Recorded the current investigation state for the lesson image-sizing pass.
- Preserved the exact resume question so the next session can start from the same decision point without re-discovery.

## Why this changed
- The current task shifted from phase content parity into UI refinement.
- The user explicitly asked for an active handoff that resumes at the image-sizing decision point.

## Source of truth
- Shared lesson image markup: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\main.js`
- Shared lesson image sizing rules: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\projects\sportswellness\workspace\styles.css`
- Active session handoff: `C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md`

## Fragile areas / watchouts
- `.reading-hero-figure`, `.reading-media-grid`, `.reading-figure`, and their shared `img` rules are reused across phases, so one CSS change affects all authored lesson views.
- Lesson figure markup is rendered centrally from `renderPhaseDetail()` in `main.js`, so markup changes there have a broader blast radius than a CSS-only pass.
- The goal is a sizing refinement only. Do not remove images, captions, or alter the phase content structure.

## Next prompt should assume
- `sportswellness` is the only active Sports Wellness project slug.
- No production behavior has been changed yet for this image-sizing task.
- The shared selectors already identified are:
  - `projects/sportswellness/workspace/styles.css` around `.reading-hero-figure`, `.reading-figure`, and `.reading-media-grid`
  - `projects/sportswellness/workspace/main.js` inside `renderPhaseDetail()`

## What still needs validation
- The user needs to answer whether the reduction should apply only to the large top hero image, or to both the hero image and the in-section figures/cards across all phases.
- After that decision, implement with a targeted test-first pass and run targeted verification plus `build:studio`.

## Known risks
- Overshrinking figures could hurt readability for diagrams that need detail.
- If the change is too broad, it could make the lesson rhythm feel cramped instead of just more controlled.

## Exact next command
`rg -n "reading-hero-figure|reading-media-grid|reading-figure" projects/sportswellness/workspace/styles.css projects/sportswellness/workspace/main.js`

## Exact next file to open
`C:\Users\dean.guedo\Documents\GitHub\canvas-helper\docs\ops\ACTIVE_HANDOFF.md`

## Do not do next / warnings
- Do not edit `projects/sportswellness/raw/**`.
- Do not resize individual phase images one by one unless the shared CSS path proves insufficient.
- Do not start implementation until the sizing scope question below is answered.

## Resume cue
Start from this exact prompt:

`I found the shared image styles, so this is a single sizing system rather than phase-by-phase content edits.

One question before I change it: do you want only the large top hero image reduced, or do you want both the hero image and the in-section figures/cards scaled down across all phases?`
