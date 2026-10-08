# CALM course visual review — revision 3

This directory began as the five-example pilot. Revision 3 expands the same isolated review to all 38 new lesson visuals in the supplied Style C collection. The existing library floor plan and safety sequence remain in the other two lessons, and the approved career-planning image remains alongside CE1-05. This is derived review content, not a canonical course release.

## Review

[Browse all 38 visuals](http://127.0.0.1:4196/visual-index.html) or [open the course](http://127.0.0.1:4196/?revision=3-all-visuals#ce1-01).

The index links each image to its exact teaching section. Existing course navigation also works. Figures use supplied mobile companions where available, larger-image links, captions, alt text and expandable text equivalents. Other teaching remains native HTML. No independent answers were moved into earlier tasks.

## What changed

- The five accepted pilot explanations and Alex’s proportioned payment bar remain.
- Added the remaining 33 images with individually authored reading guidance and checked placement.
- Reconciled repetitive setup prose in worked cases while retaining completed models, supporting tables, task facts and professional media. Source-reading figures stay beside the documents/method they explain rather than being inserted into every opening.
- Added editable visual relationships where the supplied art was primarily a list: phone bill against the monthly limit; loaner/saving/course/repayment periods; remaining payment margins; mortgage term inside amortization; and Maya’s selected weekly blocks.
- The phone graph starts at zero; repayment-margin tracks show the **remaining allowance**, not truncated payment bars. Mortgage geometry represents time, not principal repaid. Loaner labels state that it covers course start through deposit 4. These additions use only published worked-case values.
- Supplied raster artwork is unchanged. Serif image typography remains the reviewed illustration style; the course shell retains its own fonts.

## Owners and rebuilding

`build.mjs` reads canonical workspace and the safely extracted supplied bundle. `refinements.mjs` owns the five pilot refinements. `remaining-visuals.mjs` owns the remaining reading directions, placement and prose reconciliation. `relationships.mjs` owns precise native supplementary diagrams. `site/visual-review.css` is review-only presentation. `site/index.html`, `site/visual-index.html`, copied runtime/styles and `BUILD.json` are derived. `before-refinement/` preserves the first five-example preview and its builder/style files.

Rebuild from repository root:

```sh
node projects/calm10-2026-draft/meta/visual-learning-audit-2026-10-05/five-lesson-preview/build.mjs /path/to/CALM_Style_C_ALL_IN_ONE
```

The default extracted source path is `/tmp/calm-style-c-audit/CALM_Style_C_ALL_IN_ONE`. Preserve the supplied ZIP if that temporary extraction disappears. Restart the local review server if necessary:

```sh
node projects/calm10-2026-draft/meta/visual-learning-audit-2026-10-05/five-lesson-preview/serve.mjs
```

The server uses port 4196 with no-cache responses and reads canonical assets for fonts and professional media. It is not a standalone package.

## Saving and canonical preservation

Namespace remains `calm10-style-c-five-review-2026-10-06`, including `:learning:v3`. No task, response key, task version or runtime storage contract changed. Preview answers are not imported into canonical work. Do not copy isolated review runtimes into canonical workspace.

Canonical SHA256 remains `7c16a7b2ba8325d502edf7e15afa6565f72f92e44df30814329c8e5488e7d2c2`. Canonical owner remains `projects/calm10-2026-draft/workspace/index.html`, and current course remains port 4195. Earlier Before snapshots and source artwork are preserved.

## Focused evidence and limits

Static checks compare all learner-control attributes, task versions, native instructions, fieldsets, example-step components, blockquotes and media nodes with canonical source. Every supplied image matches its original bytes and every figure has the intended anchor and text equivalent. Browser evidence checks the 38 placements at desktop/mobile widths, including image loading, overflow and page errors; supplementary diagrams have screenshots. These checks concern this changed preview.

The original asset audit is in `../STYLE-C-AUDIT-2026-10-06.md`. Overview inspection and source matching do not certify every raster label, current law or schedule. Dated Canadian/Alberta source claims were retained, not refreshed. Full accessibility, all-lesson interaction regression, Studio lifecycle, source/media review, SCORM/export and release gates remain deferred until authorized rollout. Human acceptance of the expanded review remains separate from local checks.

## Routing

Lead retained instructional judgment and dirty review integration; deterministic builder handled assembly. No delegated edit slice: prose reconciliation and context-dependent placement depend on the existing uncommitted preview. No worker calls; usage savings unknown. `context:project` reported its existing context-cap error (14,836 bytes versus 5,000); project contract and standards were read directly, without altering that unrelated limit.
