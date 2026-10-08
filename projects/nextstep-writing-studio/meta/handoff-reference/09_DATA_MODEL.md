# 09 — Data model, validation and module boundaries

## Machine-readable authority
`schemas/workspace.schema.json` is the complete JSON Schema 2020-12 definition for the student workspace. `persisted-workspace.schema.json` adds app/schema version and learner/deployment binding. `backup.schema.json` wraps a portable workspace or project without learner binding. Schema `$id` URLs under `nextstep.invalid` are identifiers only: resolve them from the bundled registry, **never fetch them from a network**.

All objects reject unknown properties except the **strings** holding legacy raw data. Additional properties require a deliberate new schema/migration, not a permissive setting. JSON Schema covers shape; the following semantic checks are additionally required.

## Structural model
PersistedWorkspace → format, schemaVersion=1, appVersion, binding {deploymentScope, learnerKey}, workspace.

Workspace → workspaceId, revision, headId, createdAt, updatedAt, activeProjectId, projects[], preferences, library {bookmarks[]}, activity[], imports[]. There is no student legal name, teacher account or institution-wide project index.

Project → id/title/type/track/practiceMode/status/archived; optional prompt/targetWords/dueDate; criteria[]; plan[]; sources[]; evidence[]; draft {title, doc, headId}; evidenceUses[]; revision[]; notes[]; milestones[]; legacyRaw; provenance; createdAt/updatedAt.

PlanSection → id/kind/label/prompt/value/items[]. kind text uses value and empty items; kind list uses items and normally empty value. If a legacy section contains both, preserve through explicit repair preview; new edits use one representation. Labels/prompts are copied into the project at creation so a future template update does not rewrite the student's planner.

Source → id/title/creator/url/notes. Locator is on Evidence because quotations from the same source can come from different locations. Evidence → id/type/sourceId/locator/content/analysis/tags/verifiedByLearner/createdAt/updatedAt. A verified checkbox represents only learner confirmation.

EvidenceUse → id/evidenceId/blockId/sourceContentHash/insertedAt. IDs may become null after a source/evidence/paragraph removal; drafted text remains intact.

RevisionPass → fixed pass ID, reviewedDraftHeadId, checks[], notes. Each check stores stable ID, label, state pending/reviewed/not-applicable and optional reason. Checks are copied from an authored template; future guide changes never silently rewrite a student's completed checklist.

Note → id/title/body/kind note|feedback/originLabel/dateReceived/blockId/addressed/timestamps. originLabel is manually typed; UI must still say Added by you. A note with feedback kind is not proof of teacher authorship.

Milestones → fixed IDs plan/evidence/draft/revision/ready with the same self-check state/reason vocabulary; unrelated to LMS completion_status.

## Revision identities
Workspace revision increments for every accepted semantic mutation batch. headId changes with it; use UUID-style opaque IDs, not timestamps as identity. Draft.headId changes only when that draft's content/title changes; changing a note must not falsely mark a revision pass stale. Do not persist caret, history stack, editor DOM or transient save messages in workspace data.

Local record (not in portable schema) adds binding, baseRemoteHash, status, headId and protected checkpoint raw values. Those are needed for recovery comparison but do not belong in an exported essay or cross-learner portable backup.

## Required semantic checks
- Project IDs unique in workspace. Child entity IDs unique within project across sources/evidence/plan sections/items/notes/evidenceUses/criteria/checks/document blocks (fixed pass/milestone names are excluded from this uniqueness set).
- Exactly six distinct revision pass IDs; exactly five distinct milestone IDs; all allowed values present once.
- activeProjectId either null or points to an existing project. If removed, explicit action selects another or null.
- evidence.sourceId points to a source in the same project or null; evidenceUses reference existing evidence/block IDs or null; note.blockId valid/null. No cross-project references.
- Activity projectId existing/null; removing project can prune its activity entries under the declared bounded-activity policy.
- Nonempty trimmed project title; no duplicate tags after case-folded trim; tags/fields within caps.
- draft.doc satisfies the schema and editor content grammar: list_item starts with paragraph; inline-only content in paragraph/heading; lists contain list_items; doc/blockquote contain blocks; no illegal duplicate marks; heading levels/order valid; visible code-point count ≤200,000; maximum depth 12/list depth 4.
- Timestamps parse as UTC/date-time strings; createdAt≤updatedAt where both refer to the same record. Do not use clocks to decide whose draft wins.
- NA checks/milestones have a nonblank reason; all-NA denominator is zero and displays no percentage.
- No forbidden prototype keys anywhere, including parsed legacy raw **when mapping it**. Preserve an unparseable raw string externally/legacyRaw without evaluating it.
- Canonical raw persisted size ≤1 MiB, encoded wire ≤56k for a normal save. A structurally valid larger record is not necessarily acceptable for this deployment.

## ID remapping
For duplication/import-as-new, first build a complete old→new ID map for all entities and document blocks, then clone and rewrite references. Validate after remapping before commit. Keep source text unchanged. Mark null anchors explicitly when no corresponding block exists. Do not remap fixed pass/milestone names or guide IDs.

## Module plan (recommended implementation)
`app/config` validates owner configuration and policy.
`app/model` owns schema registry, semantic validation, canonical encoding and typed reducers.
`app/persistence` contains ScormAdapter, SaveCoordinator, TabRecoveryStore, DeviceRecoveryStore, lock manager and import/export services.
`app/editor` contains the editor-schema adapter, paste normalization, evidence insertion and text/HTML/print exporters.
`app/features` contains projects, plan, evidence, revision, notes, library and settings controllers.
`app/ui` owns shell/navigation/components; views receive selectors and commands, never raw API handles.
`app/content` bundles authored guides/templates; student state stores IDs or copied template prompts, not the entire guide library.
`app/tests` separates pure contracts, browser behaviours, mock SCORM transport and live tenant receipts.

Dependency direction: views → commands/model → SaveCoordinator → storage adapters. No circular component-controlled saves. One owner edits schemas/persistence; concurrent UI agents must not independently change field names.

## Public interface expectation
ScormAdapter returns `{ok,value?,errorCode?,diagnostic?}`; callers never interpret false/empty ambiguously. SaveCoordinator exposes current save status, `notifyMutation(workspace)`, `flush(reason)`, `retry()`, `load()` and `close()`. RecoveryStore resolves only explicit binding keys. ImportService has separate `inspect(file)`, `plan(mode,selection)`, `apply(confirmedPlan)`; inspect must be side-effect-free. ExportService serializes current model; no unsaved text is read from stale DOM.

`schemas/contracts.ts` supplies representative module interfaces. The complete field contract is the JSON Schema, not handwritten partial interfaces.
