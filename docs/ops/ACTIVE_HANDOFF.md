# Handoff

- Project: `repo-wide`
- Task: Deliver a Codex-like persistent annotation workflow and an audit-ready record of Canvas Studio's evolution and next roadmap.
- Status: implementation, verification, scoped publication, and the 2026-08-11 evolution/roadmap audit brief are complete on `codex/studio-workflow-v2`; independent Terra Max red and green reviews both returned `NO MUST-FIX` on the preview-hardening tree. No learner-course artifact was changed. One test-only workspace page was added under `projects/e2e-fixture/`.

## Summary

- `docs/plans/2026-08-11-canvas-studio-evolution-and-roadmap.md` now treats Studio as the product under review. It records the interface's progression from the original reference/workspace shell through the current annotation, persistence, screenshot, and preview system; audits each teacher-facing feature and point of friction; proposes a usability-first roadmap; and includes a copy-ready ChatGPT Pro / Terra Max green-team and red-team prompt. Individual courses appear only as varied regression evidence.
- **Annotate** now opens one blue mode bar in Studio. Teachers can click an element or drag over an area, capture a screenshot, open the Review Set, or choose **Done**; `Escape` exits as well.
- The full preview uses the same blue annotation treatment in a stable Studio-origin host around an isolated course iframe. It can select, capture, save, edit, remove, copy, cross-page **Show**, return to Studio, and rejoin after Studio reload.
- Each of five annotations may contain up to three course-only screenshots. The Review Set shows thumbnails, supports a larger preview, individual removal, post-save capture, editable notes, and **Show** to return to the selected course element.
- The Review Set V3 handoff persists through a separate, strictly validated version-6 local record for seven days. It restores the saved course and exact page state, fails visibly without crashing when storage is blocked, and still asks before an intentional course switch clears the set.
- Each preview URL has a random capability bound to one exact project/root scope. A workspace capability may additionally read only the same project's `raw`/`extracted` references; raw/reference capabilities cannot enter a workspace and no capability can cross projects. The preview server denies unscoped reuse. Its live-preview CSP allows presentation-only HTTPS styles, fonts, images, media, and frames for course fidelity while blocking arbitrary external scripts, form submissions, and nonlocal browser data connections; screenshot capture keeps its separate browser-network policy.
- The shared blank/default-layout regression affecting older CALM, Forensics, and Psychology imports is corrected without opening `script-src` to the web. Studio syntax-rewrites only exact approved versioned library/path/query families, including dependencies inside inline scripts; binds declared and transitively discovered sources to the current preview capability; pins known unversioned Tailwind/Babel/Lucide/React URLs; accepts only JavaScript responses; and enforces no-credential, redirect, response-size, timeout, global cold-fetch concurrency, bounded parser, and bounded memory-cache limits. Local/reference `HEAD` exits before reads or transformation, runtime `HEAD` is cache-only, local scripts over 512 KiB remain byte-for-byte unchanged, and approved ESM modules over 2 MiB are rejected.
- Screenshot capture no longer uses `getDisplayMedia` or an operating-system picker. The server opens only the exact capability-scoped course preview, restores saved scroll, verifies the query/hash route and selected element again immediately before capture, blocks outside HTTP, WebSocket, WebRTC, service-worker, and dedicated/shared-worker traffic, adds the blue marker, and enforces a hard deadline. Guard verification skips only empty, uncommitted, and browser-generated blocked-error child frames, preventing iframe-heavy courses from stalling capture while still checking every runnable local frame.
- Live preview rendering now permits presentation-only HTTPS styles, fonts, images, media, and frames. This corrects the regression that rendered Material Symbols names as oversized text while arbitrary external scripts and nonlocal browser data connections remain blocked.
- Interaction tests reclaim their temporary screenshot files after each run, so automated checks no longer consume the teacher screenshot cache.
- **Copy Review Set for Codex** produces one revalidated packet with safe repository-relative screenshot paths. Screenshot display, verification, and deletion all require the exact session/project/item/node owner; the packet contains no pixels, base64, blob URLs, absolute paths, source snippets, or preview instructions.

## Files changed

- Shared bounds, preview capabilities, and bridge contracts: `app/shared/inspection.ts`, `app/shared/preview-path.ts`, `app/shared/preview-bridge.ts`.
- Preview/capture/screenshot server: `app/server/preview-server.ts`, `app/server/routes/preview.ts`, `app/server/lib/preview-runtime-relay.ts`, `app/server/lib/preview-capture.ts`, `app/server/routes/preview-capture.ts`, `app/server/lib/review-screenshots.ts`, `app/server/routes/review-screenshots.ts`, `app/server/studio-server.ts`.
- Full-preview annotation host/runtime: `app/server/standalone-preview-host.ts`, `app/server/preview-bridge-runtime.ts`.
- Studio workflow and capture: `app/studio/src/App.tsx`, `app/studio/src/hooks/useScreenshotAnnotation.ts`.
- Studio data, mutation guard, and persistence: `app/studio/src/lib/review-set.ts`, `app/studio/src/lib/review-set-storage.ts`, `app/studio/src/lib/review-screenshots.ts`, `app/studio/src/lib/current-preview-selection.ts`.
- Studio UI: `app/studio/src/components/AnnotationModeBar.tsx`, `app/studio/src/components/Topbar.tsx`, `app/studio/src/components/InspectorPanel.tsx`, `app/studio/src/components/InspectionPanel.tsx`, `app/studio/src/components/ReviewSetPanel.tsx`, `app/studio/src/components/ScreenshotAnnotation.tsx`, `app/studio/src/styles.css`.
- Tests: `scripts/tests/codex-packet.test.ts`, `scripts/tests/preview-inspection.test.ts`, `scripts/tests/preview-security.test.ts`, `scripts/tests/review-screenshots.test.ts`, `e2e/specs/inspection.spec.ts`.
- Test-only exact-page fixture: `projects/e2e-fixture/workspace/alternate.html`.
- Documentation: `README.md`, `ARCHITECTURE.md`, `docs/ops/FAST_PATHS.md`, `docs/plans/2026-08-04-studio-workflow-v2.md`, `docs/plans/2026-08-09-studio-annotation-workflow-v3.md`, `docs/plans/2026-08-11-canvas-studio-evolution-and-roadmap.md`, `docs/ops/ACTIVE_HANDOFF.md`, `docs/ops/ARCHIVED_HANDOFFS.md`.

## Why this changed

- The previous workflow required browser tab sharing, allowed only one screenshot per annotation, and lost Review Set metadata on reload.
- Teachers need the simplicity of Codex Browser annotation while keeping Studio's better side-by-side course view, reusable bank, and one organized handoff.
- A durable product retrospective is needed so an external adviser audits Studio's actual user journey, feature decisions, friction, accessibility, persistence, and recovery behavior instead of proposing generic features, focusing on individual courses, or reviewing an old branch state.

## Source of truth

- Teacher-facing Review Set state and orchestration: `app/studio/src/App.tsx`.
- Review Set V3 packet model: `app/studio/src/lib/review-set.ts`.
- Strict version-6 seven-day metadata persistence: `app/studio/src/lib/review-set-storage.ts`.
- Course-only screenshot capture: `app/server/lib/preview-capture.ts` and `app/server/routes/preview-capture.ts`.
- Legacy live-preview runtime compatibility: `app/server/lib/preview-runtime-relay.ts`, wired through `app/server/preview-server.ts` and `app/server/routes/preview.ts`.
- PNG cache boundary: `app/server/lib/review-screenshots.ts` and `app/server/routes/review-screenshots.ts`.
- Embedded/full-preview synchronization: `app/shared/preview-bridge.ts`, `app/studio/src/hooks/usePreviewScrollSync.ts`, and `app/server/preview-bridge-runtime.ts`.
- Course content remains owned by each project's declared canonical source or builder. No learner course changed; `projects/e2e-fixture/workspace/alternate.html` exists only to test saved-page restoration.
- Studio history, present-state evidence, roadmap, and external audit contract: `docs/plans/2026-08-11-canvas-studio-evolution-and-roadmap.md`.

## Verification run

- Passed: `npm run test:studio-inspection` (51 tests, including runtime-relay, inline-module, MIME, source-binding, and concurrency regressions).
- Passed: `npm run build:studio`.
- Passed: `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts` (15 tests).
- Passed: `npm run test:e2e:smoke` (1 test).
- Passed: `npm run test:e2e:project -- --project e2e-fixture` (1 test).
- Passed: `git diff --check`.
- Live browser check: Material Symbols render with the intended icon font in both embedded Studio and standalone preview; the Social 10 course layout is no longer mangled.
- Live browser check: a real Social 10 annotation screenshot completed successfully on the iframe-heavy course.
- Live browser matrix: all 14 affected entry shells rendered populated course interfaces: eight CALM projects, four Forensics projects, Experimental Psychology 30, and General Psychology 20.
- Active-page crawl: all 43 non-entry active HTML pages outside `references/**` opened as a visible interface or an explicit local fallback rather than a blank preview.
- Live deep-page checks: the Forensics BAC assignment, Experimental Psychology Methodology Simulator, General Psychology source-backed QTI quizzes, and nested Behaviourism/Humanism/Learning Techniques references rendered and operated. The Forensics PDF viewer rendered its expected missing-file shell when opened without a document parameter.
- Visual browser check: `calm-module`, `calm3new`, `forensics35`, and `general-psychology-20-independent-studies-202633108` restored their intended full layouts rather than blank or browser-default pages.
- Baseline only: `npm run typecheck` still reports established unrelated errors in legacy ELA, Forensics, Social 20, missing LLM dependencies, and English-builder files; no touched-file diagnostic was reported.
- Adversarial status: the first Terra Max pass exposed source-bounding, concurrency, MIME, syntax-rewrite, inline-module, `HEAD`, oversized-script, and documentation gaps. Those findings were fixed. Final red verdict: `NO MUST-FIX`. Final green verdict: `NO MUST-FIX`.

## Fragile areas / what might drift

- Keep every course request behind its exact scope-bound preview capability and restrictive CSP. Do not restore unscoped `/preview/**` access or turn capture into a general URL endpoint.
- Keep the runtime relay allowlist small and exact. A new runtime requires an explicit versioned library/path/query decision plus security and live-course regression coverage; never accept arbitrary host paths or queries, credentials, ports, unchecked redirects, non-JavaScript MIME types, or unregistered sources, and never cache capability-tokenized response bodies.
- Keep outside HTTP, WebSocket, WebRTC, service-worker, and dedicated/shared-worker traffic blocked inside capture. Verify the main document plus every runnable local, `about:`, `data:`, or `blob:` child frame; skip only empty, uncommitted, or browser-generated blocked-error frames. Remote-only images, videos, or embeds may show a safe fallback instead of a cached user-tab frame.
- Keep limits shared and enforced: five annotations, three screenshots per annotation, fifteen files per active session, 150 files and 100 MiB across the cache, 5 MiB per PNG, 8192 pixels per dimension, 32 million pixels total, and a 7.5 KB copied packet.
- Keep capture globally serialized with a hard disconnect/twenty-second deadline; recheck the exact final capability/project path, query/hash route state, and fresh selected-node geometry before every PNG. Never run a mutation after its synchronous current-selection refresh reports a different node or route.
- Keep every stored PNG bound to its session, project, exact annotation, screenshot identity, and selected-node owner. Display, copy, and deletion must remain owner-verified.
- Keep persisted metadata versioned, strictly validated, and limited to seven days. Never hydrate arbitrary local-storage fields as source authority.
- Keep screenshot paths repository-relative under `.runtime/studio-review-sets/`; never copy pixels, base64, blob URLs, or absolute paths.
- Keep generated Social and English workspace output non-canonical. An annotation does not grant permission to patch visible generated HTML.

## Next prompt should assume

- Branch: `codex/studio-workflow-v2`.
- Start Studio with `npm run studio:codex` and open `http://127.0.0.1:5173/`.
- The annotation system is universal across projects; Social 10 was only an earlier test course and no course-specific behavior was added.
- Review Set metadata and PNGs are temporary local evidence, not committed course assets.
- ChatGPT Pro should use the audit prompt in `docs/plans/2026-08-11-canvas-studio-evolution-and-roadmap.md` only after confirming the exact branch and commit it can see.

## Known risks / follow-up

- Codex must have access to this checkout to open the local screenshot paths in the copied packet.
- `24a32079` is the pre-publication baseline. A GitHub-connector audit is valid only after the auditor confirms `codex/studio-workflow-v2` at a newer commit containing this handoff and the Studio implementation; pasting the Markdown alone does not prove access to the current code.
- Teacher acceptance should confirm the bottom blue toolbar and thumbnail bank feel as direct as Codex Browser on real long-form courses and mobile preview sizes.
- A remote-only course visual can differ in the secure capture because third-party network requests are deliberately blocked.
- A cold live-preview runtime load still needs the approved public CDN to be reachable; successful responses are cached only in bounded server memory and disappear on restart.
- One first full interaction run saw the standalone Review Set status remain `Annotation shown.` after Copy; the focused rerun and the complete 15-test rerun both passed. Treat a recurrence as a message-ordering race to investigate rather than as evidence of course-rendering failure.
- The original `forensics` shell and its assignment pages now render, but its imported lesson library remains a separate pre-existing normalization problem: 172 unique mapped references were audited, none resolve at the declared direct resource path, 159 exist only inside a nested imported-export directory, and 13 are absent. Its lesson reader therefore shows an explicit **Missing local course resource** panel for those paths. Repair this through canonical resource intake/mapping, not by patching generated output.
- The verification matrix covers the 14 projects that exhibited this regression and their 43 active non-entry HTML pages. It is strong regression evidence, not a mathematical promise that every present or future interaction in every repository project can never fail.
- The embedded Studio preview, standalone full preview, and real Social 10 screenshot path were all exercised in the live localhost browser after restarting the server with the corrected capture module.

## Exact next command

`npm run studio:codex`

## Exact next file to open

`docs/plans/2026-08-11-canvas-studio-evolution-and-roadmap.md`

## Do not do next / warnings

- Do not commit `.runtime/studio-review-sets/**`.
- Do not reintroduce `getDisplayMedia`, iframe DOM reads, wildcard messaging, or preview-owned persistent storage.
- Do not loosen source resolution or hand-edit generated course workspaces for an annotation request.
