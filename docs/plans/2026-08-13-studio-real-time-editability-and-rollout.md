# Canvas Studio real-time editability and controlled rollout plan

- Date: 2026-08-13
- Status: Phases 1–3 implemented locally; catalog state inventory is partial by design; independent implementation audit, exact-head CI, targeted legacy migrations, and teacher rollout remain
- Safety baseline: e71241433e173c7617dbf5ea5e5ddcc5bf712c11
- Independent Direct Editing decision: **GREEN / GO**
- Independent plan-audit decision: **REQUEST CHANGES** at a5645d2ef8e40487b6afa7c9d4a95fadd8dc233a
- Owning product surface: Canvas Studio Edit mode and Full Preview
- Phase 0.5 contract amendment: [`2026-08-14-studio-real-time-editability-phase-0-5-contracts.md`](2026-08-14-studio-real-time-editability-phase-0-5-contracts.md)
- Independent audit protocol: [`../audits/2026-08-13-chatgpt-pro-real-time-editability-audit-plan.md`](../audits/2026-08-13-chatgpt-pro-real-time-editability-audit-plan.md)

## Outcome

Make routine teacher-owned course content feel immediate in Studio without weakening the source, transaction, rebuild, render-validation, or Undo guarantees accepted by the independent audit.

For this plan, **real-time editing** means:

1. the teacher selects a server-mapped editable target;
2. the server re-resolves and canonicalizes the proposed patch;
3. supported changes appear in a host-owned inert overlay above the isolated preview while the teacher types or changes a control;
4. the learner DOM remains untouched and those preview changes make no filesystem write;
5. **Save draft** stores the canonical bounded course-edit patch and digest;
6. **Apply** remains the only path that writes canonical source or image assets, rebuilds when required, validates the learner render, records export staleness, and creates the Undo checkpoint.

It does not mean arbitrary contenteditable over the rendered DOM, writing files on each keystroke, multi-user collaboration, or treating runtime-owned output as source.

## Why this is the next step

The independent audit found no remaining release-blocking P0 on the reviewed head. Undo drift protection, cross-process Studio locking, crash recovery, adapter validation, repeated-element identity, decoded images, export input-graph evidence, bounded request bodies, public-route pilots, and exact-head CI are accepted.

The next unknown is product coverage, not transaction safety:

- 63 source-backed projects are explicitly enabled;
- 50 projects completed at least one reversible learner-render edit;
- 12 projects reported no routine source-owned text target;
- Aboriginal Studies 30 exposed mapped targets but no learner-stable sampled text edit;
- those course-level outcomes do not reveal what percentage of ordinary headings, paragraphs, links, images, captions, table cells, and card content is editable on each page.

The first independent review of this plan agreed with that direction but returned **REQUEST CHANGES** because “learner page,” “candidate,” “editable,” preview normalization, DOM safety, message ordering, and zero-write image preview were not defined precisely enough. The Phase 0.5 contract amendment defined those abstractions, and the current implementation now follows them. Independent review must audit the implementation rather than assuming that implementing the plan proves the result.

## Current checkpoint status

| Checkpoint | Current evidence | Status |
| --- | --- | --- |
| Accepted Direct Editing baseline | Real Direct, English, Social, and snapshot HTTP pilots; crash/lock/Undo/render gates | Implemented and locally green |
| Phase 0.5 contracts | Versioned schemas and normative safety/measurement rules | Implemented; independent implementation audit pending |
| Phase 1 census | Adapter inventory, rendered semantic collector, Resolve parity, deterministic report, residue proof | Implemented; exact-head all-catalog CI artifact pending |
| Phase 2 live preview | Server canonicalization, inert overlay, ordered bridge, saved-draft reopen, memory-only images | Implemented; local focused E2E green |
| Phase 3 new-course contract | Fresh generated course includes standard editable blocks and intentional runtime-only boundary | Implemented; threshold contract green |
| Phase 4 legacy migration | All 63 authorable courses explicitly onboarded; incomplete state inventories remain a ranked queue | Partial |
| Phase 5 teacher rollout | Quantitative protocol defined | Not started; requires real teachers |

## Non-negotiable contracts

1. **The server remains the authority.** The preview map is informational. Only the current Resolve and Apply paths can authorize a write.
2. **No learner-DOM mutation while typing.** Live preview is a host-owned inert overlay and is discarded on Cancel, target change, navigation, reload, disconnect, or stale source state.
3. **One server canonicalizer.** Normalize Preview and Apply use the same target re-resolution, sanitization, capability, URL, curated-style, and no-op logic. Apply runs it again and requires the canonical patch digest to match.
4. **Runtime ownership stays visible.** Unsupported or runtime-owned targets remain dashed Annotation-only selections with a reason.
5. **Generated output stays generated.** English and Social changes remain metadata overrides consumed by their owning factories. Snapshot courses materialize only through the snapshot adapter.
6. **External writers do not race Apply.** Codex, Git, manual editors, and standalone builders must not change the same Direct course during the final Apply boundary.
7. **A percentage never grants permission.** Coverage reporting may describe a page; it may not enable Edit mode or authorize a target.
8. **Incomplete means unscored.** Missing routes/states, truncation, unresolved rendered content, browser-state mutation, or read-only residue produces a null percentage rather than a partial green score.
9. **Apply owns image persistence.** Preview image bytes remain bounded and memory-only. An ephemeral preview URL never becomes course source.

## Baseline and measurement model

The normative definitions are in the [Phase 0.5 contract amendment](2026-08-14-studio-real-time-editability-phase-0-5-contracts.md). The implementation must preserve these measurement decisions:

- every adapter owns a versioned, exhaustive learner-surface inventory covering physical pages plus declared routes and required runtime states;
- Studio's bounded HTML discovery is diagnostic only and cannot prove inventory completeness;
- a source ownership collector and a rendered Chromium semantic collector reconcile independently;
- runtime-created routine content remains in the denominator and receives a stable Annotation-only reason when it lacks safe ownership;
- actual read-only Resolve eligibility, not a green page-map action, is required before a candidate is counted editable;
- primary non-overlapping teacher-content blocks are measured separately from field/capability opportunities;
- every rendered semantic occurrence is a primary candidate, a proven duplicate, a stable exclusion, or an incomplete-surface failure;
- incomplete inventory, truncation, unresolved occurrences, attempted project repair, browser storage writes, or repository residue makes the percentage null;
- project and catalog coverage use summed raw numerators and denominators, never an average of page percentages.

The implemented command is:

    npm run report:course-editability -- --all

It writes deterministic, content-free, exact-commit evidence to an ignored `.runtime/` JSON report with a canonical SHA-256 digest. `--inventory-only` audits adapter coverage without launching Chromium, while `--allow-incomplete` preserves honest incomplete results for CI artifacts. Concurrent builders or other repository writers invalidate the before/after residue proof and make the aggregate non-publishable.

Fresh-course acceptance requires all of the following, not one gameable ratio:

- overall primary block coverage at least 90%;
- aggregate teacher-text code-unit coverage at least 90%;
- at least 80% per promised standard candidate kind;
- required course-name/Rename synchronization at 100%;
- promised link, image-source, and image-alt opportunity coverage at least 90%;
- complete inventory and zero unknown, omitted, or truncated occurrences.

Legacy targets are set only after this census. No catalog-wide legacy percentage is invented in advance.

## Live-preview architecture

The normative protocol and reset matrix are in the [Phase 0.5 contract amendment](2026-08-14-studio-real-time-editability-phase-0-5-contracts.md). The state flow is:

    server-authored edit map
      -> teacher selects mapped target
      -> server Resolve returns current identity and capabilities
      -> teacher changes bounded controls
      -> server Normalize Preview re-resolves, sanitizes, removes no-ops, and returns a canonical patch plus inert representation
      -> host-owned overlay displays only the highest acknowledged session revision above the cross-origin iframe
      -> learner DOM and learner state remain untouched
      -> Save draft stores the canonical patch and digest
      -> Apply closes preview, re-normalizes, then performs lock, preflight, write, rebuild, render validation, refresh, and Undo checkpoint

Every preview command and acknowledgement carries a preview session ID, monotonic revision, project, page identity, map source digest, target node ID, and canonical patch digest. Late, reordered, duplicated, stale, or cross-target messages fail closed. Clear closes a generation permanently.

V1 does not use `innerHTML` or attribute mutation on the original learner node. It renders a pointer-inert, accessibility-hidden overlay outside the learner document. Screenshot capture and Review Set save/copy are disabled while that unapplied overlay is visible.

Image preview uses a validation-only service. Validated encoded bytes remain in bounded server memory and are served through a session-bound isolated-preview capability. The preview URL is never saved. Apply is the first filesystem mutation and must atomically publish the matching bytes or reject the whole batch residue-free.

| Capability | Immediate representation | Persistent authority | Notes |
| --- | --- | --- | --- |
| Text and sanitized rich text | Inert host overlay from the server-normalized representation | Canonical draft and Apply pipeline | Raw user HTML never reaches the renderer. |
| Link | Overlay displays normalized label/destination state | Shared URL canonicalizer and Apply | Preview overlay cannot navigate. |
| Image, alt, title | Memory-only validated capability URL and decoded metadata | Apply-owned asset transaction | Ephemeral URL never becomes `src`. |
| Curated visual tokens | Overlay uses approved semantic tokens | Shared canonicalizer and Apply | No arbitrary CSS. |
| Course rename | Overlay may show synchronized marked surfaces | Dedicated checkpointed Rename route | Still requires server re-resolution and canonicalization. |
| Runtime component | No generic preview | Dedicated future component editor or Annotate/Codex | Runtime state is not promoted to source. |

## New-course authoring contract

Every course created through npm run course:create should be designed for high routine-content coverage from its first commit.

Planned contract additions:

- a versioned Studio-authoring contract in project.json;
- durable canonical edit keys for repeated blocks;
- source-owned standard blocks for headings, prose, links, images, captions, cards, callouts, and tables;
- runtime interactions that consume declared content data rather than replacing source text invisibly;
- a creation-time coverage check with a 90% routine-content target;
- one generated project E2E contract proving preview, Save draft, Apply, reload, and Undo;
- a clear Annotation-only reason for custom code outside the block contract.

The target is not 100% of the DOM. It is at least 90% of ordinary teacher-authored content, with 100% honest classification.

## Legacy-course migration strategy

Do not mass-enable nodes or run quarantined builders to improve the number. Use the census to place each gap into one of four queues:

1. **Mapping gap:** canonical HTML already owns the content; add durable IDs or improve safe mapping.
2. **Data ownership gap:** runtime data owns routine content; move that content into declared canonical data and add a dedicated adapter.
3. **Component-editor gap:** the content belongs to a quiz, simulation, activity, or other structured component; build a purpose-specific property editor.
4. **Intentional Annotation-only:** editing the surface remains too risky or too rare to justify a dedicated editor.

Prioritize by teacher frequency and course importance, not by the easiest percentage gain. Start with the 12 no-source-owned-text-target projects and Aboriginal Studies 30 only after the census identifies their actual ownership pattern.

## Delivery phases

### Phase 0 — adopt the GREEN / GO decision

Deliverables:

- record the independent verdict against exact head e7124143;
- keep the accepted arbitrary-writer, bounded-render, accessibility, and Brightspace boundaries explicit;
- make PR #1 ready for merge after current-head CI remains green;
- merge only with repository-owner authorization;
- begin controlled teacher use instead of reopening hypothetical architecture blockers.

Exit gate:

- independent verdict is linked from the audit packet, release note, active handoff, and PR;
- current PR head is clean and both exact-head and PR-merge workflows pass.

### Phase 0.5 — lock measurement and preview-authority contracts — implemented

Deliverable:

- [`2026-08-14-studio-real-time-editability-phase-0-5-contracts.md`](2026-08-14-studio-real-time-editability-phase-0-5-contracts.md).

The specification defines:

- adapter-owned learner surfaces and incomplete-inventory behavior;
- rendered/source dual collection and actual Resolve parity;
- non-overlapping primary candidates and separate capability opportunities;
- stable reason codes, anti-gaming metrics, canonical report serialization, and read-only isolation;
- server preview normalization, session/revision ordering, and the preview state machine;
- an inert host overlay that never mutates the learner subtree;
- memory-only image preview and Apply-owned asset persistence;
- the complete Studio reset matrix and quantitative teacher-rollout gates.

Exit gate:

- an independent specification audit returns GREEN / GO or GO WITH CONDITIONS with no unresolved P1 measurement or preview-authority ambiguity;
- the reviewer explicitly confirms that approval is for the implementation contract, not proof that the census or preview exists.

### Phase 1 — element-level editability census — implemented

Primary files:

- shared Phase 0.5 schema modules under `app/shared/`;
- mutation-prohibited project inspection under `scripts/lib/`;
- exhaustive adapter surface inventory providers;
- scripts/lib/course-editing/editability-coverage.ts;
- scripts/report-course-editability.ts;
- app/server/lib/preview-inspection.ts;
- app/shared/course-editing.ts;
- focused tests under scripts/tests.

Exit gate:

- the planned report command covers every adapter-declared page, route, and required state or returns an incomplete inventory with no percentage;
- source and rendered collectors reconcile runtime-created content through actual read-only Resolve parity;
- generated evidence is deterministic, content-free, bounded, and read-only;
- incomplete, zero-candidate, truncated, storage-mutating, or residue-producing surfaces cannot publish a percentage;
- results distinguish course-level pilot success from element-level coverage;
- Studio can display page-level editable and Annotation-only counts without using them as authorization.

### Phase 2 — ephemeral live preview for existing safe patches — implemented

Primary files:

- one shared server canonicalizer used by Normalize Preview and Apply;
- app/shared/preview-bridge.ts;
- app/server/preview-bridge-runtime.ts;
- a bounded memory-only preview-image service;
- app/studio/src/hooks/useCourseEditing.ts;
- app/studio/src/components/CourseEditPanel.tsx;
- scripts/tests/preview-security.test.ts;
- e2e/specs/inspection.spec.ts.

Exit gate:

- supported text, link, image/accessibility, and style controls update an inert host overlay without a file or learner-DOM write;
- Cancel, navigation, reload, disconnect, source drift, layout/mode changes, and target switch close the preview generation and remove the overlay;
- stale, duplicate, reordered, malformed, and oversized messages cannot repaint a closed or newer session;
- Save draft persists the server-canonical patch and digest without a repository write;
- Apply still crosses the full lock, transaction, rebuild, rendered-result, export, and Undo boundary;
- image bytes remain memory-only until Apply and an expired pending image rejects the whole batch residue-free;
- unsupported targets cannot receive a preview patch;
- keyboard, focus, reduced-motion, and narrow-screen behavior pass E2E.

### Phase 3 — new-course Studio-ready block contract — implemented

Primary files:

- scripts/lib/codex-course.ts;
- scripts/create-codex-course.ts;
- docs/workflows/codex-studio-course.md;
- projects/e2e-fixture/meta/e2e-contract.json or a dedicated generated-course fixture;
- creation, doctor, inspection, and project E2E tests.

Exit gate:

- a fresh Codex course reaches at least 90% routine-content editability without hand-added flags;
- repeated blocks have durable identity;
- custom runtime regions are explicitly Annotation only;
- a running Studio discovers the course and completes preview, Apply, reload, and Undo.

### Phase 4 — targeted legacy ownership migrations — partial

Deliverables:

- publish the reason-ranked queue from the census;
- migrate highest-value mapping and data-ownership gaps in small course-family batches;
- add dedicated component editors only where repeated teacher demand justifies them;
- rerun doctor, page coverage, public-route lifecycle, rendered validation, and exact restoration after each migration.

Exit gate:

- each migrated target has a canonical owner and reversible proof;
- no legacy builder is unquarantined merely to improve coverage;
- remaining Annotation-only reasons are intentional and documented.

### Phase 5 — controlled teacher rollout — external acceptance pending

Pilot cohort:

- the four accepted adapter pilots;
- at least six additional courses chosen from high-use Direct, English, Social, and snapshot families;
- at least twenty real teacher edit sessions across at least five teachers;
- at least two teachers new to Studio and two regular users, with no participant supplying more than 40% of sessions;
- the predetermined task matrix from the Phase 0.5 contract covering text, rich text, links, images/alt, styles, Rename, rejection/reset, and drift-safe Undo refusal.

Capture:

- target and capability used, without course content;
- preview latency and reset success;
- draft and Apply success or explicit rejection;
- rendered-result rollback count;
- source-drift and Undo refusal events;
- teacher confusion around editable versus Annotation only;
- export target and whether separate Brightspace acceptance was completed.

Rollout exit gate:

- zero silent corruption or unexplained file drift;
- every failed Apply is residue-free or enters explicit manual recovery without overwriting unknown bytes;
- every intervening external change disables Undo;
- zero false-editable incidents and less than 5% false Annotation-only results on independently verified safe targets;
- at least 90% supported ordinary-task completion without Codex;
- non-image preview acknowledgement median at or below 200 ms and p95 at or below 750 ms; validated image preview p95 at or below 2.5 seconds;
- valid supported-task Apply rejection at or below 5%, zero preview/Apply mismatch, and no more than 0.25 confusion incidents per session;
- no P0/P1 regression across the pilot;
- common edit tasks can be completed without Codex, while complex work still hands off cleanly.

## Verification matrix

| Change | Required verification |
| --- | --- |
| Phase 0.5 specification | Independent plan audit with explicit disposition for every original P1/P2 finding |
| Coverage collector | Inventory-provider tests, rendered/source reconciliation, actual Resolve parity, browser-isolation checks, read-only residue check, deterministic all-catalog report, manifest validation |
| Preview bridge contract | Canonicalizer parity, bridge validators, session/revision ordering, security tests, malformed/stale/reordered/oversized message tests |
| Live preview UI | Studio build, focused Studio suite, full inspection E2E, keyboard/narrow-screen checks |
| Apply behavior | Existing course-editing suite, all four HTTP pilots, rendered-result validation, exact Undo |
| New-course contract | Codex-course tests, doctor, workspace verify, project E2E, coverage threshold |
| Legacy migration | Per-course doctor, coverage diff, public-route lifecycle, owning rebuild, exact restoration |
| Release candidate | npm run test:studio-release, exact-head CI, pilot report, catalog report |
| Brightspace package | Separate upload, learner launch, resume, completion/score, and cross-browser acceptance |

## Accepted boundaries from the independent audit

These remain honest operating boundaries, not blockers to the controlled rollout:

- the filesystem lock coordinates participating Studio processes, not arbitrary external writers;
- the learner-render observation window is bounded and does not prove all delayed interactions;
- edited-target accessibility heuristics are not full WCAG acceptance;
- Brightspace, deployed-host, and cross-browser SCORM behavior remain export-stage acceptance;
- an ancient pre-fix directory-format lock may require manual cleanup after an old crash.

## Next delivery slice

1. Publish the implementation commit and obtain exact-head workflow evidence, including the all-catalog report artifact.
2. Submit the implementation audit packet for an independent verdict against every Phase 0.5 P1/P2 requirement.
3. Use the report's stable incomplete/reason histogram to migrate only the highest-value undeclared route/state and durable-identity gaps.
4. Run the predetermined teacher pilot. Do not substitute maintainer demos or synthetic E2E sessions for its five-teacher/twenty-session evidence.
5. Keep Brightspace, deployed-host, cross-browser SCORM, and full-WCAG acceptance as separate release gates.
