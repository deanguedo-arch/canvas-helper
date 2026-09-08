# Handoff

- Project: `biology30-unit-a-pilot`
- Task: Show the real optional-video preview automatically in lessons and the Video Library, with no custom play button and no autoplay.
- Status: Implemented and fully verified at workspace SHA-256 `d559c59ceae8817cdec066c5ed556505c4bc2d4ead8005e42013c2ab7f87ca89`. The pilot remains intentionally `blocked`, preview-only, Studio Edit disabled, and non-exportable.

## Summary

- Removed the custom video play surface completely.
- A privacy-enhanced YouTube iframe now appears automatically when its lesson companion or selected Video Library panel becomes visible.
- Videos never autoplay. Hidden Video Library panels remain unloaded, so selecting one entry does not load every video.
- The local concept summary, watch-for prompt, exact lesson link, and direct YouTube fallback remain available.
- Visual QA exposed the old `RNLceVI8jcc` nervous-system review video as unavailable. It is now excluded and replaced in learner delivery by the supplied-deck CrashCourse entry `qPix_X-9t7E`, which passed availability and English-caption checks.
- No lesson IDs, response IDs, required minutes, artifacts, practice, persistence, or completion rules changed.

## Files changed

- Canonical learner source: `projects/biology30-unit-a-pilot/workspace/index.html`.
- Media policy/evidence: `projects/biology30-unit-a-pilot/meta/media-integration.json`, `media-resource-report.json`, `improvement-ledger.json`, and `prompt-pack.md`.
- Intake, tests, and visual audit: `scripts/lib/biology30-unit-a/pilot-media.ts`, `scripts/tests/biology30-unit-a-media-pilot.test.ts`, `e2e/specs/biology30-unit-a-improvement-pilot.spec.ts`, and `scripts/audit-biology30-unit-a-improvement-pilot-visual.ts`.
- Architecture/workflow description: `ARCHITECTURE.md` and `docs/workflows/science-pilot.md`.

## Source of truth

- Direct canonical learner source: `projects/biology30-unit-a-pilot/workspace/index.html`.
- Complete source/media/video disposition: `projects/biology30-unit-a-pilot/meta/media-integration.json`.
- Generated intake evidence: `projects/biology30-unit-a-pilot/meta/media-resource-report.json`.
- Pending rules and exact visual-review record: `projects/biology30-unit-a-pilot/meta/improvement-ledger.json`.
- Immutable content-addressed decks: `projects/resources/biology30-unit-a-pilot/_sources/`.
- Protected starting snapshot: `projects/biology30-unit-a-pilot/raw/`.
- The media preparer owns only content-addressed deck copies, extracted authoring references, and media reports. It never owns or rewrites canonical learner HTML.

## Verification run

- `npm run prepare:biology30-unit-a-pilot:media -- <three content-addressed PPTX paths> --check-video-links` — passed idempotently; all hashes, inventories, candidate availability, representative captions, and generated reports reverified with no file changes.
- `npm run test:biology30-unit-a-media-pilot` — 4/4 passed.
- `npm run test:biology30-unit-a-improvement-pilot` — 7/7 passed.
- `npm run test:science-comparison` — 6/6 passed.
- `npm run audit:biology30-unit-a-improvement-pilot:visual` — passed with 93 route-viewports, 34 textbook-band checks, 34 retrieval checks, 12 media-surface checks, 10 Video Library states, and zero geometry findings.
- All 24 contact sheets from the final visual audit were opened and inspected. The working Lesson 4, Lesson 9, Lesson 15, nervous-system review, and endocrine-review previews were visible with no unresolved media defect.
- `npm run verify -- --project biology30-unit-a-pilot --mode workspace` — passed with no missing local assets, required external dependencies, embeds, or shell resources.
- `npm run test:e2e:project -- --project biology30-unit-a-pilot` — 1/1 passed.
- `npm run test:e2e:biology30-unit-a-improvement-pilot` — 13/13 passed, including automatic exact previews without autoplay, hidden-entry unloading, exact Video Library routing, blocked-network fallback, keyboard operation, persistence, axe scans, 200% zoom, and mobile overflow checks.
- `npm run validate:manifests` — passed for the full catalog.
- `npm run build:studio` — passed.
- `npm run course:doctor -- --project biology30-unit-a-pilot` — intentionally exited 1 with only `ERROR not-active`; no additional diagnostic.
- `git diff --check` on the touched media boundary — passed.

## Exact visual evidence

- Workspace SHA-256: `d559c59ceae8817cdec066c5ed556505c4bc2d4ead8005e42013c2ab7f87ca89`.
- Report: `.runtime/biology30-unit-a-improvement-pilot-visual-audit/2026-09-01T01-42-56-022Z/visual-audit.json`.
- Report SHA-256: `8bed66ad23bcab6e3e72a77db08798264d5c0253d25caf3e4475a77dd139e707`.
- Contact sheets opened: 24/24.
- Geometry findings: 0.
- User acceptance: pending.

## Known risks / follow-up

- YouTube availability, captions, and embed permissions can drift. Required learning remains complete in local HTML, but the link audit must be rerun before release or broader rollout.
- Only five representative entries are learner-facing. The remaining 30 candidates are not authorized for learner exposure until individually reviewed.
- The source decks and extracted images are authorized for private course development; unresolved third-party raster imagery remains authoring-only.
- Exact visual evidence lives in ignored `.runtime/**`; deleting it invalidates the recorded manual-review artifact.
- The repository remains broadly dirty with unrelated user-owned work. Keep future edits and any staging path-scoped.

## Fragile areas / what might drift

- Any learner HTML change changes the workspace hash and requires a fresh full audit, opening every new contact sheet, and updating the ledger's workspace/report hashes.
- The player iframe title intentionally follows the learner-facing lesson heading in lesson companions and the source title in the Video Library.
- Hidden Video Library panels must stay unloaded; do not replace the visibility-aware loader with eager creation of every iframe.
- Do not reintroduce a custom play button or `autoplay=1`.

## Next prompt assumptions

- The user should now review Lessons 4, 9, and 15 plus the Video Library and decide whether the automatic native preview treatment is accepted.
- Approval of this slice may authorize finishing the remaining reviewed Unit A media placements, but does not authorize production Unit A-D changes, Studio Edit, promotion, commit, push, SCORM export, Brightspace upload, or publication.
- No rule transfers automatically to Units B-D.

## Exact next command

`npm run studio`

## Exact next file to open

`projects/biology30-unit-a-pilot/meta/improvement-ledger.json`

## Do not do next / warnings

- Do not expose the remaining media candidates before individual factual, caption, availability, embedding, and learner-value review.
- Do not mark any ledger rule accepted without explicit user review.
- Do not edit production `biology30-unit-a`, Units B-D, `raw/**`, or source decks.
- Do not enable Studio Edit, promote, commit, push, export SCORM, upload to Brightspace, or publish without separate authorization.
- Do not stage, reset, clean, or disturb unrelated dirty-worktree paths.
