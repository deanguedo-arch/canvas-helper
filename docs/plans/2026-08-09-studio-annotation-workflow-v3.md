# Studio Annotation Workflow V3

- Status: implemented and locally verified on `codex/studio-workflow-v2`.
- Scope: match the ease of Codex Browser annotation while improving continuity, organization, and screenshot handling in Canvas Helper Studio.
- Course boundary: repository-wide Studio/server/shared code only. No learner course, generated workspace, raw import, or export was changed; `projects/e2e-fixture/workspace/alternate.html` is a test-only page used to prove that **Show** restores the correct saved HTML file.

## Teacher workflow

1. Choose any course and turn on **Annotate**.
2. Click an element or drag over a visible area. The preview shows the same blue selection treatment in embedded and full-preview modes.
3. Write the requested change and optionally capture up to three course-only screenshots for that annotation.
4. Save up to five annotations in the Review Set. Notes can be edited, screenshots can be opened or removed, and **Show** restores the selected HTML file plus its query/hash state before focusing the element. Any unsaved selection is cleared when that page state changes.
5. Move between Studio and full preview, or reload Studio, without losing the active set. The saved set expires after seven days and an intentional course switch asks before clearing it.
6. Use **Copy Review Set for Codex** once. Review Set V3 contains every note, safe source/rebuild result, and local screenshot path in one bounded packet.

## Interaction decisions

- Annotation mode has one blue bar with an instruction, screenshot action, Review Set count, and **Done**. `Escape` also exits.
- Selection supports both a precise element click and a dragged rectangle. A drag is saveable only when its start and end share one unambiguous source-mapped owner; otherwise it remains visual-only and asks for a more specific element instead of borrowing a false source identity.
- The right rail contains only the current annotation and the saved bank. It does not render source files, commands, diagnostics, or implementation jargon.
- A saved annotation may contain zero to three screenshots. The Review Set shows thumbnails, a larger preview, individual removal, and capture after save.
- Full preview exposes the same actions through its top-level bridge. Its blue toolbar sits at the bottom so it does not cover the course heading or intercept normal annotation targets.

## Persistence decisions

- Studio is the only Review Set owner. Full preview uses a trusted Studio-origin host around a cross-origin course iframe, receives bounded summaries/actions over a private `MessageChannel`, and can rejoin the same Review Set after Studio reload through a bounded session-only rejoin token.
- The copied handoff remains Review Set V3. Studio's private persistence record is version 6, with strict request/resolution and full course-page-state identity checks, a 160 KB serialized cap, rejection of future or expired timestamps, safe failure when browser storage is unavailable, and a seven-day TTL.
- Screenshot object URLs are never persisted. Rehydration derives a same-origin thumbnail URL only from a validated `.runtime/studio-review-sets/<session>/<file>.png` path plus the exact session, project, annotation, and selected-node owner.
- On reload, Studio restores the Review Set's course scope before the project fallback can clear or mislabel it.
- Course switching still requires an explicit confirmation and clears the current set when accepted.

## Screenshot decisions

- Capture is course-only and does not use `getDisplayMedia`, screen recording, or an operating-system tab picker.
- Every rendered preview path carries a random capability bound server-side to one exact project/root scope. A workspace capability may also load only same-project `raw`/`extracted` references; reverse and cross-project traversal are denied, and unscoped preview paths are rejected. The isolated live-preview CSP allows presentation-only HTTPS styles, fonts, images, media, and frames for course fidelity. Approved legacy script/module dependencies are rewritten through that same capability-scoped origin with exact-host, no-credential, redirect, response-size, timeout, parser, and memory-cache bounds; known unversioned Babel, Lucide, React, and ReactDOM URLs are pinned. Local/reference `HEAD` does no file transformation or source registration, relay `HEAD` is cache-only, local scripts over 512 KiB remain untouched, and approved ESM over 2 MiB is rejected. Arbitrary external scripts, form submissions, and nonlocal browser data connections remain blocked.
- `POST /api/inspection/capture` accepts a bounded source-mapped selection. The server allows only the exact capability-scoped `127.0.0.1` workspace-preview origin and matching project path.
- A fresh headless Playwright page restores the captured viewport and scroll state, blocks non-preview HTTP requests, all WebSockets, WebRTC peer connections, service workers, and dedicated/shared workers, then verifies those guards in the main document and every runnable local, `about:`, `data:`, or `blob:` child frame. Empty, uncommitted, and browser-generated blocked-error frames are skipped so remote-iframe-heavy courses cannot stall capture. It rechecks the exact final project path, course query/hash state, and fresh selected-element geometry, draws the blue numbered marker, and returns a viewport PNG. One bounded capture may run at a time; disconnect or the hard 20-second deadline releases the slot even if underlying work ignores abort, and late browser launches are closed.
- Persisted PNG validation remains signature-, size-, dimension-, project-, session-, exact annotation-, screenshot-, and selected-node-owner bounded. Maximums are 5 MiB per PNG, 8192 pixels per dimension, 32 million pixels, three images per annotation, fifteen files per active session, 150 files and 100 MiB across the cache.
- `GET`, verify, and `DELETE` screenshot operations all require the exact session/project/item/node ownership tuple; a safe-looking path alone cannot display or delete a PNG. Copy preparation rechecks every file, while read/write cleanup enforces the seven-day retention limit.
- Copied text contains screenshot paths only. It never contains pixels, base64, blob URLs, or absolute local paths.

## Source-of-truth boundaries

- UI and state: `app/studio/src/App.tsx`, `app/studio/src/components/AnnotationModeBar.tsx`, `app/studio/src/components/InspectionPanel.tsx`, and `app/studio/src/components/ReviewSetPanel.tsx`.
- Review data and persistence: `app/studio/src/lib/review-set.ts`, `app/studio/src/lib/review-set-storage.ts`, and `app/studio/src/lib/review-screenshots.ts`.
- Capture client: `app/studio/src/hooks/useScreenshotAnnotation.ts`.
- Capture and cache server: `app/server/lib/preview-capture.ts`, `app/server/routes/preview-capture.ts`, `app/server/lib/review-screenshots.ts`, and `app/server/routes/review-screenshots.ts`.
- Capability-scoped preview: `app/shared/preview-path.ts`, `app/server/preview-server.ts`, `app/server/routes/preview.ts`, `app/server/lib/preview-runtime-relay.ts`, and `app/server/standalone-preview-host.ts`.
- Private preview bridge: `app/shared/preview-bridge.ts`, `app/studio/src/hooks/usePreviewScrollSync.ts`, and `app/server/preview-bridge-runtime.ts`.
- Course edits remain in each project's declared canonical source or owning builder. This workflow never makes generated preview HTML canonical.

## Verification gates

- `npm run test:studio-inspection`
- `npm run build:studio`
- `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts`
- `npm run test:e2e:smoke`
- `git diff --check`
- `npm run typecheck`, compared with the established unrelated repository baseline

The inspection E2E covers the isolated-origin bridge, click and keyboard selection, safe drag selection, the blue mode bar, reference-preview exclusion, full-preview thumbnail/lightbox/capture/remove/show/return parity, several annotations, three screenshots on one item, local PNG paths in Review Set V3, note editing/removal, manual clipboard fallback, partial-upload recovery, stale-route failure, project-switch and late-response safety, exact-page restoration, reload rehydration, and tampered-metadata rejection.

## Known tradeoff

The capture browser blocks third-party network requests. That protects the local screenshot route from becoming a general network browser, but a course area that depends entirely on a remote image, video, or embed may render a safe fallback instead of matching a previously cached user-tab frame. Approved runtime modules remain available through the local relay, but their first load after a server restart still requires those public CDN hosts to be reachable. The selected local course structure and blue marker remain deterministic.
