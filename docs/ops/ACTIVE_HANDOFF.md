# Handoff

- Project: `repo-wide`
- Task: Implement the API-free Studio Inspector, secure preview boundary, concise Codex handoff, consent-based screenshot annotation, and the temporary multi-item Review Set. A real Science pilot is intentionally excluded from this delivery.
- Status: Studio phases 0–5 and Review Set V1 are complete and pushed on `codex/studio-review-set`; ChatGPT Pro independently reviewed the final branch and returned `GO`. The first real Science course remains intentionally blocked until its source archives and representative-unit decision are supplied.

## Summary

- Removed the unused API Assistant and all model-provider runtime code.
- Replaced same-origin preview access with a read-only isolated loopback preview service and private MessageChannel bridge.
- Added Inspect, validated exact/bounded/unknown source ownership, a compact Copy for Codex packet, issue focus, keyboard selection, and a local-only screenshot annotation flow.
- Direct static workspaces now include a verified current source line in a handoff; generated Social and English workspaces remain source-line-free and rebuild-owned.
- Fixed a screen-share cleanup race, now stop capture before crop/PNG work, and redact raw inspection-route errors so malformed requests cannot disclose an absolute local path.
- Live red-team checks found and fixed two later timing bugs: an old course handoff could survive a context change, and a fast earlier selection could overwrite the newest one. The current Inspector always clears old context and makes the newest selection authoritative.
- An active capture now has one owned lifetime. Changing project, preview, source, or selection stops a live stream immediately, stops a late-arriving stream on arrival, and never keeps its image or handoff.
- Kept Social and English learner artifacts untouched; generated workspaces are still never the suggested edit target.
- Added Review Set V1: save up to five source-mapped workspace selections in browser memory, keep optional annotated screenshots local and individually downloadable, revalidate every saved request before preparing one 5 KB packet, and copy only that frozen packet.
- Review Set rejects duplicate or oversized items, warns before a project/preview-mode scope clear, blocks stale or materially changed mappings, and has no persistence, history, upload, or automatic model submission.
- Social 10 remains intentionally `unknown` with its proposal-only diagnostic; this delivery does not claim an unproven builder ownership path or alter learner content.
- Updated the mobile E2E learner harness to open the isolated preview origin, preserving Social and English project verification.
- Kept the existing Science source-backed intake/decision-log process and documented the Inspector contract a future Science driver must meet.

## Files changed

- Studio and shared contracts: `app/studio/src/App.tsx`, `app/studio/src/components/`, `app/studio/src/hooks/`, `app/studio/src/lib/`, `app/shared/`.
- Preview and inspection security: `app/server/preview-server.ts`, `app/server/preview-bridge-runtime.ts`, `app/server/lib/preview-inspection.ts`, `app/server/lib/preview-paths.ts`, `app/server/routes/preview.ts`, `app/server/routes/inspection.ts`, `app/server/studio-server.ts`.
- Removed Assistant code: `app/server/routes/generate.ts`, `app/studio/src/components/GenerativePanel.tsx`, and `scripts/lib/engine/*` generation files.
- Verification: `scripts/tests/preview-*.test.ts`, `scripts/tests/codex-packet.test.ts`, `e2e/specs/inspection.spec.ts`, and `e2e/lib/learner-course-assertions.ts`.
- Review Set implementation: `app/studio/src/lib/review-set.ts`, `app/studio/src/components/ReviewSetPanel.tsx`, and the Review Set state in `app/studio/src/App.tsx`.
- Operating docs: `README.md`, `ARCHITECTURE.md`, `docs/ops/FAST_PATHS.md`, `docs/workflows/science-pilot.md`, and `docs/plans/2026-08-03-studio-inspector-handoff.md`.

## Verification run

- Passed on the final code: `npm run test:studio-inspection` (20), `npm run build:studio`, `npm run test:e2e:smoke`, and the Inspector Playwright suite (8).
- Passed for Review Set V1: `npm run test:studio-inspection` (25), `npm run build:studio`, all 10 Inspector Playwright tests, `npm run test:e2e:smoke`, and project E2E for `forensics35` and `ela20-1-modern-play-crucible`.
- Passed: `npm run course:doctor -- --project forensics35`, `npm run course:doctor -- --project ela20-1-modern-play-crucible`, and `npm run course:doctor -- --project social10-1-related-issue-1-option-2` (still proposal-only as intended).
- Passed project E2E: `forensics35`, `social30-1-related-issue-1-option-2`, and `ela20-1-modern-play-crucible`.
- Passed: `npm run course:doctor` for the direct, Social, and English proof projects; `npm run test:science-pilot`; `npm run test:metadata-policy`; and `npm run validate:manifests`.
- `npm run typecheck` has only its established unrelated ten baseline errors in legacy ELA, Forensics, Social 20, and English-builder code; no touched-file error remains.

## Source of truth

- Inspector architecture and current implementation record: `docs/plans/2026-08-03-studio-inspector-handoff.md`.
- Review Set V1 contract and adviser/implementer decision record: `docs/plans/2026-08-04-studio-review-set.md`.
- Preview security boundary: `app/server/preview-server.ts` and `app/studio/src/hooks/usePreviewScrollSync.ts`.
- Provenance resolver: `app/server/lib/preview-inspection.ts`.
- Science onboarding boundary: `docs/workflows/science-pilot.md` and `scripts/lib/science-pilot-intake.ts`.

## Known risks / follow-up

- Screenshot capture requires a real browser permission action. Automated tests intentionally do not accept a capture prompt; manually verify target-browser tab capture before relying on it in a live workflow.
- A browser cannot force the exact tab choice. Studio validates available surface metadata, crops only the visible preview region, and requires review before download, but the teacher must select the Studio tab in the picker.
- ChatGPT Pro's first exact-commit green-team pass found two genuine privacy blockers. A later live Studio red-team check and the next review found two timing gaps; both are fixed in `5f52fbbd`, `71dd11e6`, and `65282e44`. The final GitHub-backed re-review of `65282e44636f310ada1a980ebc42e00492b6c876` returned `GREEN` with no remaining must-fix items; browser-owned capture acceptance remains manual.
- A real Science pilot cannot be created until real source ZIPs are available. Do not invent a Science factory or learner workspace to bypass that gate.
- Existing full-repo typecheck noise is outside this change and should be handled as a separate maintenance task.
- Review Set remains intentionally volatile. Do not add localStorage, server storage, a history panel, screenshot packet fields, or automatic ChatGPT/Codex submission without a separate privacy review.
- Do not change Social 10 from proposal-only behavior until a separate ownership adapter passes a zero-learner-content-diff rebuild proof.

## Fragile areas / what might drift

- Preserve the separate preview origin, `frame-ancestors`, `Permissions-Policy: display-capture=()`, and private MessageChannel. Do not restore direct iframe DOM reads or wildcard window messaging.
- The Inspector resolves source ownership from driver metadata, not a visible file. Keep Social/English generated workspace output as output.
- Review Set preparation is the source-of-truth boundary for a batch: it must replay the original bounded resolver request and reject a stale or materially changed result instead of refreshing it silently.
- Preview navigation recreates the private channel; future preview changes must keep the iframe load handshake intact.

## Next prompt assumptions

- Branch: `codex/studio-review-set` at the Review Set V1 delivery commits.
- No current learner-course content was modified by this work.
- ChatGPT Pro is an adviser with repository context; Codex must verify local sources and tests before implementing advice.
- Science is outside this delivery. To start it later, the user will supply the actual Brightspace and optional teacher-resource ZIPs plus the intended course code/title.

## Exact next command

```bash
npm run studio:codex
```

## Exact next file to open

`docs/plans/2026-08-04-studio-review-set.md`
