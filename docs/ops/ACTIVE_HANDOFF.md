# Handoff

- Project: `repo-wide`
- Task: Include several marked screenshots in one Studio Review Set handoff for Codex.
- Status: complete on `codex/studio-workflow-v2`; no learner-course artifact was changed.

## Summary

- A Review Set can hold up to five annotations and one optional marked screenshot per annotation.
- Saving an annotation renders its marker into a real PNG and stores that PNG in the ignored local `.runtime/studio-review-sets/` cache.
- **Copy Review Set for Codex** now creates a `review-set-v2` text packet containing each screenshot's safe repository-relative path. Codex can open every listed image while applying the annotations.
- The text packet never embeds base64, blob URLs, absolute paths, or image pixels, which keeps the handoff compact and avoids leaking local filesystem details.
- The same Review Set, screenshot-presence state, and copied packet remain available when moving between Studio and a connected full-screen preview.

## Files changed

- Screenshot storage and route: `app/server/lib/review-screenshots.ts`, `app/server/routes/review-screenshots.ts`, `app/server/studio-server.ts`.
- Shared bounds and preview summaries: `app/shared/inspection.ts`, `app/shared/preview-bridge.ts`, `app/server/preview-bridge-runtime.ts`.
- Studio capture, persistence, packet, and UI: `app/studio/src/App.tsx`, `app/studio/src/hooks/useScreenshotAnnotation.ts`, `app/studio/src/lib/review-screenshots.ts`, `app/studio/src/lib/review-set.ts`, `app/studio/src/components/InspectionPanel.tsx`, `app/studio/src/components/ReviewSetPanel.tsx`, `app/studio/src/components/ScreenshotAnnotation.tsx`, `app/studio/src/styles.css`.
- Tests: `scripts/tests/review-screenshots.test.ts`, `scripts/tests/codex-packet.test.ts`, `scripts/tests/preview-security.test.ts`, `e2e/specs/inspection.spec.ts`, `package.json`.
- Documentation and cache boundary: `.gitignore`, `README.md`, `ARCHITECTURE.md`, `docs/ops/FAST_PATHS.md`, `docs/plans/2026-08-04-studio-review-set.md`, `docs/plans/2026-08-04-studio-workflow-v2.md`, `docs/ops/ACTIVE_HANDOFF.md`, `docs/ops/ARCHIVED_HANDOFFS.md`.

## Why this changed

- The previous copied handoff explicitly excluded screenshot pixels, so a teacher's visual evidence did not reach Codex.
- Native multi-item image clipboards are inconsistent across operating systems. Local PNG paths provide one reliable, bounded packet that can describe several annotations without inflating the text context.

## Source of truth

- Review Set state and packet preparation: `app/studio/src/App.tsx` and `app/studio/src/lib/review-set.ts`.
- Marked screenshot rendering and persistence client: `app/studio/src/hooks/useScreenshotAnnotation.ts` and `app/studio/src/lib/review-screenshots.ts`.
- Local screenshot validation and storage: `app/server/lib/review-screenshots.ts` and `app/server/routes/review-screenshots.ts`.
- Preview synchronization: `app/shared/preview-bridge.ts` and `app/server/preview-bridge-runtime.ts`.
- Course content remains owned by each project's declared canonical sources and build driver. No file under `projects/**` changed.

## Fragile areas / what might drift

- Keep the screenshot route exact-same-origin, PNG-only, and bounded. Current limits are five files per Review Set session, 5 MiB per PNG, 8192 pixels per dimension, and 32 million pixels total.
- Keep screenshot paths repository-relative and restricted to `.runtime/studio-review-sets/`; do not put absolute paths, data URLs, or blob URLs in copied packets.
- Screenshot files are temporary local evidence. Sessions older than seven days are removed when a later screenshot capture runs cleanup.
- Discarding a persisted screenshot rotates the active capture session, so a removed item never leaves the current Review Set stuck at its old five-file capacity.
- Full-screen preview does not receive display-capture authority. Screenshot capture starts in Studio, while preview can display screenshot-presence state and copy the synchronized handoff.
- Keep one screenshot attached to one saved annotation so the marker, note, selected element, and image cannot become ambiguous.

## Next prompt should assume

- Branch: `codex/studio-workflow-v2`.
- Studio runs at `http://127.0.0.1:5173/` through `npm run studio:codex`.
- A teacher can inspect an element, capture and mark the Studio tab, save the annotation, repeat up to five times, and copy one compact packet containing all screenshot paths.
- Review Set metadata remains session-temporary; marked PNG files are local cache artifacts rather than course sources or committed assets.

## Verification run

- Passed: `npm run test:studio-inspection` (35 tests).
- Passed: `npm run build:studio`.
- Passed: `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts` (13 tests), including two marked screenshots saved to one Review Set, copied into one packet, and reopened from both local paths as valid PNGs.
- Passed: `npm run test:e2e:smoke` (1 test).
- Passed: `git diff --check`.
- Baseline only: `npm run typecheck` reports established unrelated errors in legacy ELA, Forensics, Social 20, missing LLM dependency, and English-builder files; no touched-file diagnostic was reported.

## Known risks / follow-up

- Copying the Review Set places text and screenshot paths on the clipboard, not several native binary image attachments. Codex must have access to this checkout to open those local paths.
- A Studio reload or browser restart clears in-memory Review Set metadata, even though a recent temporary PNG may remain until cache cleanup. This intentionally avoids permanent review history.
- Teacher acceptance should confirm that collecting several annotations and pasting one packet into Codex feels as direct as the in-app Browser workflow.

## Exact next command

`npm run studio:codex`

## Exact next file to open

`app/studio/src/App.tsx`

## Do not do next / warnings

- Do not commit `.runtime/studio-review-sets/**`; it contains temporary local review evidence.
- Do not loosen screenshot route validation or expose it on the separate preview origin.
- Do not hand-edit generated course workspaces as part of this Studio feature.
