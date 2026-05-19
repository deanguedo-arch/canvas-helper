# Active Handoff

## Summary
Updated Course Showcase selector buttons to be pure premium animated 3D glass orbs with no course artwork/images inside them. The prior child `<img>` icon wiring was removed from the selected course button and the rail course buttons.

## Files changed
- `projects/course-showcase/workspace/index.html`
- `projects/course-showcase/workspace/main.js`
- `projects/course-showcase/workspace/styles.css`
- `docs/ops/ACTIVE_HANDOFF.md`
- `.stax/task.md`
- `.stax/codex-report.md`

## Verification run
- STAX observer preflight: `npm.cmd run stax:preflight -- --repo C:\Users\dean.guedo\Documents\GitHub\canvas-helper --mode observer`; exit 0, observer recorded Reject because visual/test proof is incomplete.
- Not run: browser visual review.
- Not run: automated tests. The user requested targeted UI/source cleanup and did not ask for tests.

## Known risks / follow-up
- The `courses` data may still contain image paths for other uses, but selector buttons no longer render those images.
- Visual proof is still needed before accepting final appearance under STAX.

## Source-of-truth location
`projects/course-showcase/workspace/`

## Fragile areas / what might drift
- `renderRail()` markup in `projects/course-showcase/workspace/main.js`
- Selected course button markup in `projects/course-showcase/workspace/index.html`
- Orb styling blocks in `projects/course-showcase/workspace/styles.css`

## Next prompt assumptions
The desired selector standard is: empty green glass orbs only, no SVG/course artwork inside the selector circles.

## Exact next command
`node --test projects/course-showcase/meta/showcase-ui.test.mjs`

## Exact next file to open
`projects/course-showcase/workspace/main.js`
