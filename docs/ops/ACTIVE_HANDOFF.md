# Handoff

- Project: `repo-wide`
- Task: Add a compact default Codex handoff while preserving an explicit full diagnostic packet.
- Status: complete; both handoff details are implemented and verified.

## Files changed

- `app/studio/src/App.tsx`
- `app/studio/src/components/InspectorPanel.tsx`
- `app/studio/src/components/ReviewSetPanel.tsx`
- `app/studio/src/lib/project-display.ts`
- `app/studio/src/lib/review-set.ts`
- `app/studio/src/lib/review-workbench.ts`
- `app/studio/src/precision-editor.css`
- `e2e/specs/inspection.spec.ts`
- `scripts/tests/codex-packet.test.ts`
- `scripts/tests/studio-project-continuity.test.ts`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed

- Made `review-set-v4` compact handoffs the default.
- Moved repeated edit target, source status, rebuild command, validation command, related sources, and safety notes into one shared implementation block when all changes use the same route.
- Kept each compact change focused on the teacher request, page, selected target, concern, priority, screenshots, and bounded untrusted page text.
- Added an explicit `Full diagnostics` option that preserves inspection node, selection type, resolution, freshness, artifact role, generated-output status, review status, and packet diagnostics.
- Added UI copy explaining what each handoff detail includes.
- Corrected the readable-title formatter so `e2e-fixture` remains `E2E Fixture`.
- Restored useful empty-set error/progress feedback while keeping ordinary empty-state noise hidden.

## Why this changed

- Most teacher handoffs repeated repository details for every annotation, increasing copy size and visual noise without adding implementation value.
- Codex still needs safe source ownership, rebuild, validation, screenshot, and untrusted-content boundaries, so compact mode deduplicates rather than removes them.
- Full diagnostics remains available for ambiguous source ownership or deeper debugging.

## Verification run

- Passed: `npm run test:studio-inspection` — 87/87.
- Passed: `npm run build:studio`.
- Passed targeted E2E for compact/full packet switching, capture cancellation, course finder naming, and failed screenshot rollback — 4/4.
- Broad `inspection.spec.ts` run: 47/50 initially passed; the three failures exposed the empty-feedback and `E2E Fixture` naming regressions, which were fixed and then passed in the targeted rerun.
- Passed: `git diff --check`.

## Source of truth

- Packet schemas and safety validation: `app/studio/src/lib/review-set.ts`.
- Handoff-detail UI: `app/studio/src/components/ReviewSetPanel.tsx`.
- Preparation and clipboard orchestration: `app/studio/src/App.tsx`.
- End-to-end contract: `e2e/specs/inspection.spec.ts`.

## Fragile areas / watchouts

- Compact mode must never omit safe source ownership, rebuild, validation, screenshot paths, or untrusted-content boundaries.
- The copied packet must match the selected detail; stale prepared packets are rejected.
- Full Preview receives the currently prepared packet through the bounded bridge; it does not expose the handoff-detail selector itself.
- Unrelated local intake, resource, and duplicate test-result folders remain unstaged.

## Next prompt should assume

- Visual refinement and compact/full handoff phases are complete and independently commit-ready.
- The next phase adds a persistent sent-to-Codex lifecycle with Verify Changes, Accept, Reopen, and follow-up handoffs.
- Existing manual Resolve behavior must migrate safely rather than being silently reinterpreted.

## What still needs validation

- The complete 50-test inspection suite and final `npm run test:studio-release` gate will run after Verify Changes is implemented.
- Full Preview lifecycle parity must be tested once handoff-state fields cross the preview bridge.

## Known risks

- Adding lifecycle fields requires a backward-compatible Review Set storage migration and backup parser update.
- A follow-up handoff must include reopened/new work, not already accepted items or changes still awaiting teacher verification.

## Exact next command

`sed -n '1,420p' app/studio/src/lib/review-set-storage.ts`

## Exact next file to open

`app/studio/src/lib/review-set-storage.ts`

## Do not do next / warnings

- Do not use a transient component-only flag for sent/accepted/reopened state; it must survive reload and Full Preview transitions.
- Do not mark work sent until clipboard copy succeeds.
- Do not make accepted items reappear in a follow-up handoff unless the teacher reopens them.
- Do not edit learner-course source, workspace, raw, or export files.
