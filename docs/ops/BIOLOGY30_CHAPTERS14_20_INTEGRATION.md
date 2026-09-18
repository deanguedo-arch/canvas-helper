# Biology 30 Chapters 14–20 local integration

- Project: biology30-chapter-14 through biology30-chapter-20
- Task: integrate the returned ChatGPT Pro chapters and finish local browser checks.
- Status: usable local previews; imported-course release and Studio readiness remain blocked.

## Review deployment — 2026-09-17

User subsequently authorized deployment. Chapters 14–20 are now available at `https://biology30pilot.web.app` in the unchanged-design course picker alongside Biology 11–13 and Chemistry. All 1,652 content files were byte-verified live; the subsequent hidden-logo-reference correction rechecked the wrapper and reused 1,651 unchanged hashes from that verification. Existing Biology and Chemistry bytes were checked before publication and preserved. The final hosted Chromium smoke passed all seven new chapters' lesson navigation, loaded Work Sans font, textbook draft reload, labeling and vocabulary routes, with eleven picker options and no page errors or missing local responses on those paths. External videos were deliberately excluded.

Deployment source: `scripts/deploy-biology30-current-review.mjs` and `projects/biology30-unit-a-pilot-2/meta/review-selector/index.html`. Final evidence: `meta/review-selector-deployment.json` in that project and per-chapter integration receipts. The UI skill preserved the existing wrapper styling; no teaching surfaces or fonts were redesigned. This is public teacher-review hosting only, not learner release, Studio promotion, SCORM packaging or Brightspace certification. The earlier local-integration scope and deferred content checks below remain applicable.

## Files changed

- Seven new `projects/biology30-chapter-N/workspace/**` and `meta/**` trees, with intact delivered assets, local PDFs, and portable HTML copies.
- `scripts/integrate-biology30-chapters14-20.mjs`: scoped external intake and ownership registration.
- `scripts/refresh-biology30-chapters14-20-portable.mjs`: invoke supplied assembly owners, not legacy Biology builders.
- `scripts/record-biology30-chapters14-20-integration.mjs`: verify current evidence and assembly/style hashes, then record local completion.
- `scripts/tests/biology30-chapters14-20-real-origin.mjs` and `biology30-chapters14-20-supplied.mjs`: local integration evidence.

## What changed and why

- Imported all seven chapters with their Start, Learn, Optional Extension, Practice & Review, Process Collection and Resources surfaces. Existing Chapters 11–13 and Chemistry were not rewritten.
- Kept the supplied frozen stylesheets and local fonts unchanged. The uncodixfy skill was used to preserve the established layout during narrowly scoped interaction repairs, not introduce a new design.
- Fixed pending textbook drafts on immediate reload/leave using the chapter's native revision-aware synchronous save owner. Explicit photo saving remains separate; pending image operations still receive a leave warning.
- Matched the runtime navigation breakpoint to the existing 760px CSS breakpoint; the sidebar is no longer inert on tablets where the mobile menu is hidden.
- Made Chapter 14's labeling wording patch idempotent so regeneration does not repeat “or signals”.
- Refreshed each portable file through its delivered assembly owner after the fixes.
- The generic importer initially merged inert JSON into executable script content. These imports use a scoped registration adapter and then install the intact delivered HTML; no shared importer or existing course was changed.

## Source of truth

- Canonical entries: `projects/biology30-chapter-N/workspace/index.html` for N=14–20, with current `main.js`, styles and assets declared in each `meta/project.json`.
- Chapter 14 lesson regeneration owner: `meta/external-generation/authoring/content.py` and `scripts/build_chapter.py`; then `patch_runtime.py` and `assemble_portable.py`.
- Chapters 15–20: editable workspace HTML, delivered authoring course-config and textbook manifest under `meta/external-generation/authoring`; supplied `scripts/build.py` refreshes embedded data and portable assembly.
- Symlinks inside `meta/external-generation` point `workspace` and `portable` at the current installed locations. The incoming staging and raw HTML are provenance, not editable execution paths.
- Portable outputs: `workspace/portable/Biology30_ChapterN.html`. Regenerate with `BIOLOGY_PYTHON=<Python with bs4/PyMuPDF/Pillow> node scripts/refresh-biology30-chapters14-20-portable.mjs` only after canonical edits.

## Verification run

- ZIP CRC, safe archive paths and frozen style hashes checked during intake. Workspace verification passed for all seven chapters: metadata, local assets, embeds and course-shell resources.
- All seven final native-origin runs passed 19 groups each: 133 groups. Tests use real localStorage and persistent Chromium profiles, including actual browser close/reopen, edited draft reload, required gates and immutable attempts, all sidebar routes, vocabulary/PDF dialogs, practice reset/cancel, every delivered labeling activity, chapter isolation, genuine two-tab conflicts, simulated quota failure preserving native bytes, offline portable saving, and All My Work/print generation.
- Delivered browser suites were rerun against installed sources and local Chromium; their individual JSON results and limitations are retained separately. They use substitute storage, so they are not claimed as native persistence evidence.
- Delivered static science checks passed for Chapters 15–20 (165 assertions). This is a source-package consistency check, not independent teacher acceptance of every scientific statement.
- Rendered representative desktop/phone previews and representative first print pages inspected; print records are readable. The PDF skill guided the render-and-inspect check. Synthetic QA records and PDFs live only in verification metadata.
- Exact final evidence and counts: each `meta/integration-receipt.json` and `meta/local-integration-verification/real-origin-results.json`.

## Fragile areas / watchouts

- Preserve chapter-specific save namespaces, revision/conflict/failure protections, stable question and option IDs, immutable attempts and required-only completion rules.
- Do not overwrite canonical HTML using an old Biology family builder or patch a portable copy as the source.
- Runtime and authoring config are separate responsibilities; regenerate embedded data/portable output after config changes.
- Do not remove the delivered question images or diagram context. The packages contain 575 textbook questions and 44 labeling diagrams across these chapters; passing route checks is not visual approval of every crop.

## Next prompt should assume

- All seven local integrations are present. Current styles/fonts are preserved; only native save-on-leave, tablet navigation and Chapter 14's repeat wording were repaired.
- Imported courses remain blocked with Studio editing/export disabled. This is not deployment, LMS certification or teacher approval.

## What still needs validation / known risks

- Independent science/Alberta curriculum and reading-level acceptance; complete visual reconciliation of all 575 crops and all supplied diagrams; external video playback/access and school filtering.
- Studio editability/readiness and reversible editing proof before activation. No proposal-only boundary was promoted by integration.
- SCORM packaging and actual Brightspace save/resume/conflict/completion evidence; verify photo portability separately. Browser-local photos are not claimed to synchronize to LMS or another device.
- Physical devices, assistive technology and full browser print-dialog testing remain separate from Chromium PDF rendering.

## Exact next action

Review the hosted chapter previews; await a scoped request for audit corrections or Brightspace/rollout preparation.

## Exact next file to open

`projects/biology30-chapter-14/workspace/index.html`

## Do not do next / warnings

- Do not redeploy, package, commit, promote authoring status, enable Studio/export, or alter Chapters 11–13/Chemistry without the next scoped request.
- Test artifacts contain synthetic work; do not treat them as student data or a learner submission.
