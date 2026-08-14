# Handoff

- Project: `repo-wide`
- Task: Independently audit the Phase 0.5 measurement and preview-authority contracts, then begin only the approved learner-surface inventory slice.
- Status: ready for validation

## Publication and review state

- Branch: `codex/studio-direct-editing-v1`
- Focused PR: `https://github.com/deanguedo-arch/canvas-helper/pull/1`
- Accepted inherited Direct Editing head: `e71241433e173c7617dbf5ea5e5ddcc5bf712c11`
- First real-time planning head: `a5645d2ef8e40487b6afa7c9d4a95fadd8dc233a`
- Independent Direct Editing verdict: **GREEN / GO**
- Independent plan-audit verdict at `a5645d2e`: **REQUEST CHANGES**
- First-plan exact-head run `31765993351` passed on retry after a transient Chromium navigation timeout; PR-merge run `31765996040` passed first attempt.
- Phase 0.5 response: `docs/plans/2026-08-14-studio-real-time-editability-phase-0-5-contracts.md`
- Current product status: census, ephemeral preview, fresh-course threshold, legacy migrations, and teacher rollout remain **NOT IMPLEMENTED / NOT AUDITABLE YET**.
- PR #1 remains unmerged. Merge is a repository-owner action.

## Summary

- Accepted the independent plan-audit REQUEST CHANGES without weakening the inherited Direct Editing GREEN baseline.
- Added a non-behavioural Phase 0.5 specification before any census or preview implementation.
- Defined authoritative learner surfaces, rendered/source reconciliation, non-overlapping candidates, capability opportunities, stable reason codes, null incomplete scoring, read-only isolation, and deterministic report evidence.
- Defined one server preview canonicalizer, a monotonic preview session protocol, a host-owned inert overlay, a memory-only image workflow, a complete reset matrix, and quantitative teacher-rollout gates.
- Updated the product plan and ChatGPT Pro audit protocol so the next review is a specification checkpoint, not a false claim that real-time editing is complete.
- No course content, project metadata, exports, runtime bundles, or implementation code changed.

## Files changed

- `docs/plans/2026-08-14-studio-real-time-editability-phase-0-5-contracts.md`
- `docs/plans/2026-08-13-studio-real-time-editability-and-rollout.md`
- `docs/audits/2026-08-13-chatgpt-pro-real-time-editability-audit-plan.md`
- `docs/audits/2026-08-13-chatgpt-studio-course-editing-audit-brief.md`
- `docs/ops/ACTIVE_HANDOFF.md`

## What changed

### Authoritative learner surfaces

- Added a versioned adapter-owned `LearnerSurfaceInventory` contract.
- A physical HTML scan cannot establish complete page/route/state coverage.
- Direct, English, Social, snapshot, and runtime-heavy adapters have explicit inventory ownership rules.
- Missing routes/states, truncation, or unprovable exhaustiveness produces `complete: false` and no percentage.

### Honest candidate measurement

- Required independent source ownership and rendered semantic collectors.
- Runtime-created routine content remains in the denominator.
- Any candidate counted editable must pass actual production Resolve logic in read-only mode.
- Defined one non-overlapping primary block per authored unit and separate field/capability opportunities.
- Added block, teacher-text code-unit, per-category, and capability floors for future new-course acceptance.
- Zero candidates, incomplete inventory, truncation, unresolved occurrences, browser-state writes, or repository residue cannot produce a positive percentage.

### Read-only census

- Prohibited coverage code from reaching `ensureProjectFromProcessedSnapshot` or any auto-import, repair, builder, materialization, recovery, or asset-publish path.
- Required a fresh non-persistent Chromium context per surface, blocked service workers/external network, instrumented browser storage, deterministic environment, and hard time/memory/candidate limits.
- Fixed deterministic canonical JSON and SHA-256 report-digest rules without course text or volatile host data.

### Ephemeral preview authority

- Raw teacher patches cannot go directly to the preview bridge.
- Normalize Preview must re-resolve the target and use the same side-effect-free server canonicalizer as Apply.
- Every command and ACK carries session, monotonic revision, project, page, source digest, target node, and canonical patch digest.
- Clear permanently closes a generation; late or reordered messages cannot repaint it.
- V1 uses a host-owned inert overlay outside the learner document. It does not change learner `innerHTML`, attributes, styles, event listeners, object identity, forms, storage, or runtime data.

### Images and Studio workflow

- Image preview uses fully decoded, bounded bytes held only in server memory.
- The preview URL is capability-scoped and never becomes the saved `src`.
- Apply is the first repository mutation and must materialize the matching bytes transactionally or reject residue-free.
- Added explicit reset outcomes for Focus/Split, Original/Current, viewport, zoom, Full Preview, navigation, Annotation, reload, history, disconnect, drift, and multi-draft Apply.
- Screenshot capture and Review Set save/copy are disabled while an unapplied overlay is visible.

### Rollout evidence

- Defined at least 20 sessions across at least five teachers with an experience mix and task matrix.
- Added median/p95 acknowledgement latency, completion, false-editable, false Annotation-only, rejection, preview/Apply mismatch, confusion, and Codex-handoff metrics.
- Any P0/P1 event stops rollout regardless of aggregate metrics.

## Why this changed

- The existing HTML discovery is bounded and returns filenames without a completeness result.
- The current edit map is parsed from static source before learner JavaScript and cannot enumerate runtime-created semantic content.
- The map is capped at 4,000 entries and uses human reason strings; partial map counts cannot become census evidence.
- The current map may look editable before the stricter Resolve runtime-fingerprint check rejects a target.
- `isCourseEditPatch` validates shape and bounds, while full sanitization and no-op removal happen later in server `sanitizeDraft`.
- The current image endpoint writes canonical resource and workspace files immediately.
- A DOM string snapshot cannot restore framework references, descendant listeners, MutationObserver side effects, or JavaScript object identity.
- The first plan had no session/revision protocol to prevent stale preview responses from overwriting newer input.

## Verification run

- Confirmed the audit's factual premises in:
  - `scripts/lib/projects.ts`;
  - `app/shared/course-editing.ts`;
  - `app/server/lib/preview-inspection.ts`;
  - `app/server/lib/course-editing.ts`;
  - `app/server/lib/course-edit-image.ts`;
  - `app/server/routes/course-edits.ts`;
  - `app/shared/preview-bridge.ts`;
  - `app/server/preview-bridge-runtime.ts`;
  - `app/studio/src/hooks/useCourseEditing.ts`;
  - `app/studio/src/components/CourseEditPanel.tsx`.
- `git diff --check` — passed.
- Local Markdown-link verification across all five changed documents — passed; every local target exists.
- `npm run build:studio` — passed; 85 modules built.
- `npm run validate:manifests` — passed for the full reported catalog.
- `npm run typecheck -- --pretty false` — exited 2 with the same ten established unrelated diagnostics in existing course builders/factory files; no diagnostic is in a changed documentation file.
- Exact-head and PR-merge CI for the Phase 0.5 documentation head must be recorded after push.
- No implementation tests establish census or preview behavior because that code intentionally does not exist.

## Source of truth

- Normative Phase 0.5 contracts: `docs/plans/2026-08-14-studio-real-time-editability-phase-0-5-contracts.md`.
- Parent product and delivery order: `docs/plans/2026-08-13-studio-real-time-editability-and-rollout.md`.
- Independent review procedure and copy-ready prompt: `docs/audits/2026-08-13-chatgpt-pro-real-time-editability-audit-plan.md`.
- Accepted Direct Editing evidence: `docs/audits/2026-08-13-studio-direct-editing-green-go-verdict.md`.
- Current source map and Resolve behavior: `app/server/lib/course-editing.ts` and `app/server/lib/preview-inspection.ts`.
- Current project loader with mutation-capable recovery behavior: `scripts/lib/projects.ts`.
- Current private bridge: `app/shared/preview-bridge.ts` and `app/server/preview-bridge-runtime.ts`.
- Current image persistence route: `app/server/routes/course-edits.ts` and `app/server/lib/course-editing.ts`.

## Fragile areas / what might drift

- The Phase 0.5 TypeScript snippets are normative future schemas, not current exports. Do not import nonexistent names before Phase 1A lands.
- Future manifest work must distinguish static-page completeness from explicit route/state completeness; omission cannot default to complete.
- The current `loadProjectManifest`, `listProjectSlugs`, and `readStudioProjectBundle` paths can auto-reconstruct a missing project. Coverage must use a new read-only reader.
- The current 4,000-entry page map remains an informational UI artifact. Census collection must stream or paginate independently.
- A host overlay needs geometry synchronization in both embedded Studio and Full Preview without weakening the cross-origin capability boundary.
- Memory-only image drafts become explicitly non-applicable after server/token expiry and must request re-upload; they may never fall back to a stale preview URL or partial batch.
- Extracting one canonicalizer from `sanitizeDraft` must preserve current Apply behavior and old-draft migration deliberately.
- Teacher latency floors are local Studio acceptance, not deployed-host or Brightspace evidence.
- User-owned duplicate/conflict files, resource archives, factory transaction directories, and `test-results 2/` remain unstaged and must not be cleaned.

## Next prompt should assume

- The Direct Editing baseline remains GREEN / GO.
- The first real-time plan audit returned REQUEST CHANGES at `a5645d2e`.
- The Phase 0.5 response is documentation only and needs an independent specification verdict.
- No element coverage percentage or immediate-preview claim is currently proven.
- The planned `npm run report:course-editability -- --all` command still does not exist.
- If Phase 0.5 is approved, the first implementation is Phase 1A only: shared schemas, a mutation-prohibited project reader, and exhaustive adapter inventory providers.
- Rendered collection, percentage publication, preview bridge/UI, images, new-course enforcement, legacy migrations, and teacher rollout remain later checkpoints.

## What still needs validation

- ChatGPT Pro must return a separate Checkpoint 0.5 specification verdict and explicit disposition for every original P1/P2 finding.
- The publication commit needs exact-head and PR-merge workflow evidence tied to its SHA.
- Phase 1A schema and inventory implementation does not exist.
- Brightspace upload, deployed-host behavior, full WCAG, delayed interaction, and cross-browser SCORM remain external acceptance.
- PR #1 remains unmerged pending repository-owner action.

## Known risks / follow-up

- The specification can still be rejected if an independent reviewer finds a circular definition, unimplementable invariant, or contradiction with the accepted Apply boundary.
- The deterministic browser profile and resource ceilings may expose incomplete runtime-heavy courses; that is an honest result, not permission to loosen the score.
- Memory-only pending images trade durability across restart for the invariant that Apply is the first repository write. The UI must make re-upload requirements explicit.
- The 90% fresh-course target remains unproven until a representative generated fixture passes every block, text, category, and capability floor.
- Documentation CI can prove publication integrity but cannot prove future product behavior.

## Exact next command

`git diff a5645d2ef8e40487b6afa7c9d4a95fadd8dc233a...HEAD -- docs/plans/2026-08-14-studio-real-time-editability-phase-0-5-contracts.md docs/plans/2026-08-13-studio-real-time-editability-and-rollout.md docs/audits/2026-08-13-chatgpt-pro-real-time-editability-audit-plan.md docs/ops/ACTIVE_HANDOFF.md`

## Exact next file to open

`docs/plans/2026-08-14-studio-real-time-editability-phase-0-5-contracts.md`

## Do not do next / warnings

- Do not implement `editability-coverage.ts` before the Phase 0.5 specification verdict has no unresolved P1.
- Do not treat the Phase 0.5 document, package-script name, or green documentation CI as census/preview evidence.
- Do not use bounded HTML discovery as the learner-surface inventory.
- Do not count a green map entry as editable without actual read-only Resolve parity.
- Do not mutate the learner DOM for V1 preview or attempt to restore it from an HTML snapshot.
- Do not call the current writing image-asset endpoint while typing or previewing.
- Do not merge PR #1 without repository-owner authorization.
- Do not broadly stage, delete, or clean unrelated user-owned files.
