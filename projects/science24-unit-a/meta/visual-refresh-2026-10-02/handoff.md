# Handoff

- Project: Science 24 Units A–D
- Task: Implement the approved visual refresh as one complete local comparison candidate.
- Status: validated — scoped scientific, preservation and Chromium review complete; teacher acceptance pending. All four projects remain blocked and previewable.

## Files changed

- projects/science24-unit-{a,b,c,d}/workspace/index.html, canonical figure catalogues, assets/visual-refresh.css and assets/visual-refresh/**.
- A canonical catalogue: workspace/course-data.js. B–D canonical catalogues: workspace/course-data.json; derived course-data.js regenerated through the existing compiler.
- projects/science24-unit-{a,b,c,d}/meta/project.json and meta/visual-refresh-2026-10-02/**.
- projects/resources/science24-visual-refresh/** retains the supplied package and original ZIP by SHA256.
- scripts/science24-visual-refresh.cjs, scripts/refine-science24-visual-placement.cjs, scripts/lib/science24-visual-refresh-diagrams.cjs, scripts/check-science24-visual-refresh.cjs, scripts/review-science24-visual-refresh.cjs and scripts/package-science24-visual-review.cjs.
- Local delivery: /Users/deanguedo/Downloads/Science24_ABCD_Visual_Review_2026-10-02/index.html and adjacent ZIP.
- Previous Biology Chapter 11 source handoff preserved in full in ARCHIVED_HANDOFFS.md before switching the active handoff.

## What changed

- Reconciled all 63 lesson dispositions; refreshed exactly 45. Added 29 visual placements: 19 precise native SVGs, five supplied generated illustrations, one credited photograph, two imagegen corrections and two textbook crops. Added four distinct B14 panel crops.
- Moved exactly 20 optional video placements into explanations; retained the other 16. Existing players, viewing focus and written alternatives retained. Corrected full-width video layouts and preserved figure/explanation pairs.
- Added proportional figures, native narrow-layout explanations, support wrapping only above 920px content width, and sticky references only for B03/C10/D08 on wide layouts.
- C18 memory grouped with adaptive immunity; D01 forward travel made unambiguous. B14 has one desktop overview/text guide and four focused phone views; D05 retains its single graph comparison.
- Source mappings, original/derived asset hashes, credits, generation prompts, scientific decisions and dispositions recorded per unit. Original ZIP and assets preserved.
- Comparison index includes complete before/candidate courses, 225 changed-area screenshots, 20 contact sheets, searchable 63-row matrix, source records, hashes and teacher checklist.

## Why this changed

- Dean approved this exact A–D refresh plan and requested one complete local review candidate before any publication.

## Source of truth

- Existing projects/science24-unit-{a,b,c,d}/workspace/** are canonical teaching and presentation. Routine teacher copy, figures and links remain in HTML with durable edit keys.
- Figure catalogues are A course-data.js and B–D course-data.json. Preserve the existing B–D compiler path.
- Integration/refinement scripts are historical one-time records, not routine rebuild owners. Do not rerun them over subsequent teacher edits.
- Complete family review and exact candidate tree hashes: projects/science24-unit-a/meta/visual-refresh-2026-10-02/family-review-delivery.json; per-unit candidate-hashes.json and lesson-matrix.json.

## Verification run

- Scoped preservation checker passed: original assessment data, IDs, edit keys, video hooks, response controls, namespaces, state/runtime files and original assets preserved. Independently recomputed new arithmetic.
- Four npm run verify -- --project science24-unit-<unit> --mode workspace runs passed. Four course:doctor runs refused not-active because authoringStatus remains blocked; no doctor pass claimed.
- Real Chromium: all 63 lesson routes at 1440px, 820px and 390px plus actual 200% browser zoom; 252 route/layout checks, 30 enlargement/keyboard/focus checks, 36 media controls and four isolated synthetic baseline-to-candidate save/reload/completed-check carryover checks passed.
- All 670 local dependency HTTP responses match exact current candidate bytes; packaged candidate copies match canonical workspaces. No real learner browser storage accessed.
- Lead inspected changed-lesson contact sheets at all four settings and selected full-size captures/source images. Screenshot-only defects corrected: zoom clip coordinates scaled to actual tab zoom, lazy images decoded before measuring, fixed shell chrome hidden only during capture.
- Comparison index filters/counts/search and 416 local links passed; mobile sign-off line wraps. Final ZIP CRC/payload hashes and size recorded in package-receipt.json.

## Routing

- Inventories, catalog compilation, hash comparison, rendering and delivery: deterministic local commands. Scientific decisions, diagrams, placement, compatibility and final acceptance: lead. Two illustration corrections: built-in imagegen.
- agents:plan refused automatic Muse with muse_billing_unverified; file-tools write boundary also not verified. Luna was unconfigured with native permissions unverified. No worker spawned.
- Local context cache miss; provider-cache telemetry unavailable; usage savings unmeasured.

## Fragile areas / watchouts

- Preserve stable assessment identities/keys/options, saved history, namespaces and required-progress denominator. Additions to figure catalogues must not replace assessment content.
- Keep videos outside prose/reference wrapping; do not split an existing figure from its guide by inserting a video.
- Supporting grids require at least 920px content width; only B03/C10/D08 sticky; narrow layouts stack. Full image enlargement remains available.
- The review copy is derived; continue edits in canonical workspaces. The source package proposals/guardrails and old PASS claims are evidence, not workflow authority.

## Next prompt should assume

- The approved scoped refresh is implemented locally. Teacher sign-off is pending; supplied/generated originals retained. All projects remain blocked.
- Current candidate bound to branch codex/math-engine-preflight and HEAD ecc1b806630cb33b9942e64eb676a1f8568c007e plus recorded working-file hashes; unrelated dirty work preserved.
- Local comparison served at http://127.0.0.1:4826/index.html. Delivery folder and ZIP also available without Studio.

## What still needs validation

- Teacher instructional/visual sign-off and publisher video playback/captions online. Player-control checks stubbed publisher frames and do not certify external availability.
- Studio editability/activation, SCORM export, Brightspace certification, Firebase publication and broader accessibility certification remain separate checkpoints; none asserted passed.

## Known risks

- Local HTTP server is a running process and may stop between sessions; use the included README to serve the delivery folder again.
- Original reading pages retain their source scans/legacy content; this task refreshed specific visuals and placement without rewriting every original resource.

## Exact next action

Review the local comparison index and record any requested lesson revisions or scoped teacher approval. Publication requires a later explicit instruction.

## Exact next file to open

/Users/deanguedo/Downloads/Science24_ABCD_Visual_Review_2026-10-02/index.html

## Do not do next / warnings

- Do not activate Studio, export SCORM, certify Brightspace, deploy Firebase, change authoring status, rerun historical integration builders or promote a universal course standard without the corresponding later authorization.
