# Canvas Studio real-time editability and controlled rollout plan

- Date: 2026-08-13
- Status: approved direction; implementation not started
- Safety baseline: e71241433e173c7617dbf5ea5e5ddcc5bf712c11
- Independent decision: **GREEN / GO**
- Owning product surface: Canvas Studio Edit mode and Full Preview
- Independent audit protocol: [`../audits/2026-08-13-chatgpt-pro-real-time-editability-audit-plan.md`](../audits/2026-08-13-chatgpt-pro-real-time-editability-audit-plan.md)

## Outcome

Make routine teacher-owned course content feel immediate in Studio without weakening the source, transaction, rebuild, render-validation, or Undo guarantees accepted by the independent audit.

For this plan, **real-time editing** means:

1. the teacher selects a server-mapped editable target;
2. supported changes appear immediately in the isolated preview while the teacher types or changes a control;
3. those preview changes are temporary and make no filesystem write;
4. **Save draft** stores the existing bounded course-edit patch;
5. **Apply** remains the only path that writes canonical source, rebuilds when required, validates the learner render, records export staleness, and creates the Undo checkpoint.

It does not mean arbitrary contenteditable over the rendered DOM, writing files on each keystroke, multi-user collaboration, or treating runtime-owned output as source.

## Why this is the next step

The independent audit found no remaining release-blocking P0 on the reviewed head. Undo drift protection, cross-process Studio locking, crash recovery, adapter validation, repeated-element identity, decoded images, export input-graph evidence, bounded request bodies, public-route pilots, and exact-head CI are accepted.

The next unknown is product coverage, not transaction safety:

- 63 source-backed projects are explicitly enabled;
- 50 projects completed at least one reversible learner-render edit;
- 12 projects reported no routine source-owned text target;
- Aboriginal Studies 30 exposed mapped targets but no learner-stable sampled text edit;
- those course-level outcomes do not reveal what percentage of ordinary headings, paragraphs, links, images, captions, table cells, and card content is editable on each page.

The plan therefore measures element-level coverage before setting legacy migration targets.

## Non-negotiable contracts

1. **The server remains the authority.** The preview map is informational. Only the current Resolve and Apply paths can authorize a write.
2. **No write while typing.** Live preview is an ephemeral DOM presentation layer and is discarded on Cancel, target change, navigation, reload, disconnect, or stale source state.
3. **One patch contract.** Preview, draft persistence, preflight, Apply, rebuild replay, rendered validation, and Undo use the same sanitized CourseEditPatch capabilities.
4. **Runtime ownership stays visible.** Unsupported or runtime-owned targets remain dashed Annotation-only selections with a reason.
5. **Generated output stays generated.** English and Social changes remain metadata overrides consumed by their owning factories. Snapshot courses materialize only through the snapshot adapter.
6. **External writers do not race Apply.** Codex, Git, manual editors, and standalone builders must not change the same Direct course during the final Apply boundary.
7. **A percentage never grants permission.** Coverage reporting may describe a page; it may not enable Edit mode or authorize a target.

## Baseline and measurement model

### Denominator: routine teacher-content candidates

The census should count semantic content a teacher could reasonably expect to edit:

- headings;
- paragraphs and list items;
- links and button labels where the label is course content;
- images, alt text, captions, and titles;
- table headers and data cells;
- card titles, descriptions, and callout text;
- the synchronized course name.

It should separately classify, not inflate the denominator with:

- scripts, styles, metadata, templates, and hidden nodes;
- Studio or preview chrome;
- navigation generated entirely from runtime data;
- assessment engines, simulations, media players, and other behavior-rich components;
- duplicate layout wrappers with no teacher-owned content.

### Planned report

Add a planned command named:

    npm run report:course-editability -- --all

It does not exist yet and must not be documented as runnable until its implementation and tests land.

The command should traverse every declared learner page through the existing authoring driver and resolveCourseEditPageMap, then write ignored runtime evidence to .runtime/course-editability-coverage.json.

Per project and page, record:

- candidate count;
- editable count;
- Annotation-only count;
- live-map/source-fingerprint match count;
- capability counts for text, rich text, link, image, alt, title, and curated style keys;
- reason histogram for unsupported targets;
- repeated-identity rejection count;
- truncated or uninspectable-page status;
- adapter and canonical source owner;
- most recent reversible catalog-pilot outcome.

Repository snapshots may summarize totals under docs/audits, but the complete generated report stays ignored runtime evidence.

### Success measures

- 100% of declared learner pages receive a report outcome or a bounded explicit error.
- 100% of visible candidate targets are classified as editable or Annotation only; there is no unknown click state.
- New Codex-created courses target at least 90% editable coverage for routine teacher-content candidates.
- Legacy targets are set only after the census; no catalog-wide percentage is invented in advance.
- Coverage collection makes zero project, metadata, export, checkpoint, lock, or draft mutations.

## Live-preview architecture

The state flow is:

    server-authored edit map
      -> teacher selects mapped target
      -> server returns baseline and capabilities
      -> teacher changes bounded controls
      -> ephemeral patch updates only the isolated course DOM
      -> Cancel/navigation restores the rendered snapshot
      -> Save draft persists the bounded CourseEditPatch
      -> Apply performs lock, preflight, write, rebuild, render validation, refresh, and Undo checkpoint

### Proposed bridge additions

Add versioned, bounded messages to the existing private preview bridge:

- studio-preview-course-edit: target ID, draft ID when applicable, and validated delta patch;
- studio-clear-course-edit-preview: target/draft identity and reason;
- preview-course-edit-preview-state: success, stale target, unsupported patch, or reset confirmation.

The exact names may change during implementation, but the contract must:

- carry no filesystem path, browser-supplied selector, raw JavaScript, or arbitrary CSS;
- pass the same patch validators and message-byte limits as persisted drafts;
- apply only to the currently selected mapped node;
- snapshot original rendered text, allowed attributes, and curated presentation before the first preview;
- restore that snapshot before switching targets or applying a different draft;
- fail closed when source/render fingerprints no longer match;
- avoid changing course-owned localStorage, form answers, completion state, or event handlers.

### Preview behavior by capability

| Capability | Immediate preview | Persistent authority | Notes |
| --- | --- | --- | --- |
| Text and sanitized rich text | Replace selected content presentation | Existing draft and Apply pipeline | Never execute inserted markup or scripts. |
| Link | Update mapped destination and visible selection | Existing URL sanitizer and Apply pipeline | Preview clicks stay suppressed while Edit mode is active. |
| Image, alt, title | Preview a validated upload or approved URL and accessibility text | Existing upload/materialization and Apply pipeline | Object URLs never become source. |
| Curated visual tokens | Apply only allowed token values | Existing semantic style patch | No arbitrary CSS. |
| Course rename | Show synchronized marked surfaces temporarily | Dedicated Rename operation | Saving still uses the checkpointed multi-surface route. |
| Runtime component | No generic DOM preview | Dedicated future component editor or Annotate/Codex | Runtime state is not promoted to source. |

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

### Phase 1 — element-level editability census

Primary files:

- scripts/lib/course-editing/editability-coverage.ts;
- scripts/report-course-editability.ts;
- app/server/lib/preview-inspection.ts;
- app/shared/course-editing.ts;
- focused tests under scripts/tests.

Exit gate:

- the planned report command covers every declared page;
- generated evidence is deterministic, bounded, and read-only;
- results distinguish course-level pilot success from element-level coverage;
- Studio can display page-level editable and Annotation-only counts without using them as authorization.

### Phase 2 — ephemeral live preview for existing safe patches

Primary files:

- app/shared/preview-bridge.ts;
- app/server/preview-bridge-runtime.ts;
- app/studio/src/hooks/useCourseEditing.ts;
- app/studio/src/components/CourseEditPanel.tsx;
- scripts/tests/preview-security.test.ts;
- e2e/specs/inspection.spec.ts.

Exit gate:

- supported text, link, image/accessibility, and style controls update the selected preview without a file write;
- Cancel, navigation, reload, source drift, and target switch restore the original rendered state;
- Save draft persists the same bounded patch used today;
- Apply still crosses the full lock, transaction, rebuild, rendered-result, export, and Undo boundary;
- unsupported targets cannot receive a preview patch;
- keyboard, focus, reduced-motion, and narrow-screen behavior pass E2E.

### Phase 3 — new-course Studio-ready block contract

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

### Phase 4 — targeted legacy ownership migrations

Deliverables:

- publish the reason-ranked queue from the census;
- migrate highest-value mapping and data-ownership gaps in small course-family batches;
- add dedicated component editors only where repeated teacher demand justifies them;
- rerun doctor, page coverage, public-route lifecycle, rendered validation, and exact restoration after each migration.

Exit gate:

- each migrated target has a canonical owner and reversible proof;
- no legacy builder is unquarantined merely to improve coverage;
- remaining Annotation-only reasons are intentional and documented.

### Phase 5 — controlled teacher rollout

Pilot cohort:

- the four accepted adapter pilots;
- at least six additional courses chosen from high-use Direct, English, Social, and snapshot families;
- at least twenty real teacher edit sessions covering text, links, images/alt, styles, Rename, rejected edits, and Undo.

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
- teachers can identify editable versus Annotation-only content before clicking;
- no P0/P1 regression across the pilot;
- common edit tasks can be completed without Codex, while complex work still hands off cleanly.

## Verification matrix

| Change | Required verification |
| --- | --- |
| Coverage collector | Focused unit tests, read-only residue check, all-catalog report, manifest validation |
| Preview bridge contract | Bridge validators, security tests, malformed/oversized message tests |
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

## First implementation slice

Start with Phase 1 only. Add the read-only coverage collector, tests, and report schema. Do not add live DOM preview messages in the same change.

This gives the next implementation an exact baseline, lets the teacher-facing UI show honest page coverage, and prevents the live-preview work from being judged against a guessed percentage.
