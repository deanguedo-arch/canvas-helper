# Handoff

- Project: `repo-wide`
- Task: Implement the API-free Studio Inspector, secure preview boundary, concise Codex handoff, consent-based screenshot annotation, and reusable Science-pilot operating path.
- Status: implementation complete and locally verified; the final independent re-review must inspect the pushed latest commit. The first real Science course remains intentionally blocked until its source archives and representative-unit decision are supplied.

## Summary

- Removed the unused API Assistant and all model-provider runtime code.
- Replaced same-origin preview access with a read-only isolated loopback preview service and private MessageChannel bridge.
- Added Inspect, validated exact/bounded/unknown source ownership, a compact Copy for Codex packet, issue focus, keyboard selection, and a local-only screenshot annotation flow.
- Direct static workspaces now include a verified current source line in a handoff; generated Social and English workspaces remain source-line-free and rebuild-owned.
- Fixed a screen-share cleanup race and redacted raw inspection-route errors so malformed requests cannot disclose an absolute local path.
- Kept Social and English learner artifacts untouched; generated workspaces are still never the suggested edit target.
- Updated the mobile E2E learner harness to open the isolated preview origin, preserving Social and English project verification.
- Kept the existing Science source-backed intake/decision-log process and documented the Inspector contract a future Science driver must meet.

## Files changed

- Studio and shared contracts: `app/studio/src/App.tsx`, `app/studio/src/components/`, `app/studio/src/hooks/`, `app/studio/src/lib/`, `app/shared/`.
- Preview and inspection security: `app/server/preview-server.ts`, `app/server/preview-bridge-runtime.ts`, `app/server/lib/preview-inspection.ts`, `app/server/lib/preview-paths.ts`, `app/server/routes/preview.ts`, `app/server/routes/inspection.ts`, `app/server/studio-server.ts`.
- Removed Assistant code: `app/server/routes/generate.ts`, `app/studio/src/components/GenerativePanel.tsx`, and `scripts/lib/engine/*` generation files.
- Verification: `scripts/tests/preview-*.test.ts`, `scripts/tests/codex-packet.test.ts`, `e2e/specs/inspection.spec.ts`, and `e2e/lib/learner-course-assertions.ts`.
- Operating docs: `README.md`, `ARCHITECTURE.md`, `docs/ops/FAST_PATHS.md`, `docs/workflows/science-pilot.md`, and `docs/plans/2026-08-03-studio-inspector-handoff.md`.

## Verification run

- Passed: `npm run test:studio-inspection` (20), `npm run build:studio`, `npm run test:e2e:smoke`, and the Inspector Playwright suite (4).
- Passed project E2E: `forensics35`, `social30-1-related-issue-1-option-2`, and `ela20-1-modern-play-crucible`.
- Passed: `npm run course:doctor` for the direct, Social, and English proof projects; `npm run test:science-pilot`; `npm run test:metadata-policy`; and `npm run validate:manifests`.
- `npm run typecheck` has only its established unrelated ten baseline errors in legacy ELA, Forensics, Social 20, and English-builder code; no touched-file error remains.

## Source of truth

- Inspector architecture and current implementation record: `docs/plans/2026-08-03-studio-inspector-handoff.md`.
- Preview security boundary: `app/server/preview-server.ts` and `app/studio/src/hooks/usePreviewScrollSync.ts`.
- Provenance resolver: `app/server/lib/preview-inspection.ts`.
- Science onboarding boundary: `docs/workflows/science-pilot.md` and `scripts/lib/science-pilot-intake.ts`.

## Known risks / follow-up

- Screenshot capture requires a real browser permission action. Automated tests intentionally do not accept a capture prompt; manually verify target-browser tab capture before relying on it in a live workflow.
- A browser cannot force the exact tab choice. Studio validates available surface metadata, crops only the visible preview region, and requires review before download, but the teacher must select the Studio tab in the picker.
- ChatGPT Pro's first exact-commit green-team pass found two genuine privacy blockers; the local fixes have targeted regression coverage, but its final verdict must be refreshed from the pushed fix commit.
- A real Science pilot cannot be created until real source ZIPs are available. Do not invent a Science factory or learner workspace to bypass that gate.
- Existing full-repo typecheck noise is outside this change and should be handled as a separate maintenance task.

## Fragile areas / what might drift

- Preserve the separate preview origin, `frame-ancestors`, `Permissions-Policy: display-capture=()`, and private MessageChannel. Do not restore direct iframe DOM reads or wildcard window messaging.
- The Inspector resolves source ownership from driver metadata, not a visible file. Keep Social/English generated workspace output as output.
- Preview navigation recreates the private channel; future preview changes must keep the iframe load handshake intact.

## Next prompt assumptions

- Branch: `codex/course-readiness-science-pilot`.
- No current learner-course content was modified by this work.
- ChatGPT Pro is an adviser with repository context; Codex must verify local sources and tests before implementing advice.
- To start Science, the user will supply the actual Brightspace and optional teacher-resource ZIPs plus the intended course code/title.

## Exact next command

```bash
npm run intake:science-pilot -- --project <science-slug> --course-code "SCI 20" --title "Science 20" --mode conversion --brightspace-zip "<absolute-path-to-brightspace.zip>"
```

## Exact next file to open

`docs/workflows/science-pilot.md`
