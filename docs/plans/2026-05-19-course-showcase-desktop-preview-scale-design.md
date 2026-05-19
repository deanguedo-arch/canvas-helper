# Course Showcase Desktop Preview Scale Design

## Goal
Make Course Showcase desktop mode render course sites at a real desktop viewport while fitting inside the smaller showcase laptop frame.

## Approach
Desktop mode will give its iframe a fixed 1440 by 900 render surface and scale that surface to the laptop frame width. This keeps each embedded course in its desktop breakpoint instead of letting the iframe inherit the smaller showcase frame width, while avoiding the overly tiny result that comes from fitting the full desktop height.

Tablet and mobile preview modes stay unchanged because their purpose is to show responsive layouts.

## Verification
- Add a source regression in `projects/course-showcase/meta/showcase-ui.test.mjs`.
- Verify the workspace page computes a desktop iframe width of 1440px, a scale below 1, and a rendered frame width that fills the showcase shell.
- Run the course showcase manifest validator.
