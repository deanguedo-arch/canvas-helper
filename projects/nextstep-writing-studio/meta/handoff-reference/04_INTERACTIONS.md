# 04 — Interaction, state and error contract

## Common mutation pipeline
Every meaningful user change follows: validate proposed field/transaction → apply to an in-memory copy → increment revision and create new headId → update UI → schedule scoped local write → schedule LMS save. There is one coordinator. Individual components never call `SetValue`, `Commit` or localStorage directly. Pure selection, scrolling, filtering and opening menus do not generate workspace revisions unless a deliberate preference changes.

Disabled/blocked actions state why. Returning to a view never clears unsaved editor text. Dirty dialogs ask Discard / Keep editing, not a destructive generic OK. Escape cancels a dialog only when safe and never cancels IME composition.

## Project actions
Create: required type/title; all optional metadata may be empty. Generate fresh project and child IDs. New record uses `archived=false` and status `planning`; it contains an empty document, not a sample essay. Transition to overview only after the candidate exists in memory; save failure is visible, not a lost form.

Rename: retain ID and all child references. Trim title ends; preserve internal whitespace and Unicode. Never use a title as a storage key. Cancel is a no-op.

Duplicate: preserve content and metadata, assign new project/source/evidence/plan/note/draft-block IDs and remap references. Append “ — Copy” if needed, respecting length through a user-editable title field, not truncating silently. New audit timestamps; `ready` becomes `drafting`; revision-check states reset by default with a disclosed checkbox to keep them. Copied feedback notes retain text/provenance but their “addressed” flag defaults false. Original is unchanged. Offer backup instead if new state exceeds cloud budget.

Archive: toggle `archived`; no body deletion and no storage savings. Keep last non-archived project as Continue target. Restore unarchives. Do not set LMS completion.

Remove: use “Export and remove”. Generate a backup, ask the learner to reselect it, validate checksum and **exact current project content hash**; only then enable final removal. Editing after file verification invalidates that confirmation. Confirm project title and affected record count. This deliberate friction avoids equating a download click with a durable backup. An optional truly permanent remove exists only behind a typed title confirmation and owner-enabled `allowPermanentDelete`; default disabled. Never call a file user-reselected only by name “verified”.

## Evidence/source actions
Saving an evidence form does not insert prose. “Use in draft” previews: selected content; optional manually entered attribution; insert as quotation block or ordinary paragraph; exact insertion position. Never auto-write analysis. Student confirms once; undo removes the entire insertion. Attach a non-semantic source-use record to the inserted block ID; that link is app metadata, not a special inline node that corrupts exports.

Editing an evidence note later does not rewrite already drafted text. Show “This evidence changed after insertion” if the content hash differs. Removing evidence keeps drafted text intact and marks the use record unlinked. Removing a source with references requires reassigning it or setting referenced evidence.sourceId=null with confirmation. Deleted-source bibliographic data can be retained in evidence.note only after explicit choice; do not silently erase source text.

Tags are simple strings: normalize comparison with trim+case-fold for deduplication, preserve first chosen display spelling. Reorder plan items via Move up/down and optional drag, not drag-only.

## State changes and derived display
Word count is derived from draft content, never a stored score. Project status is student-chosen; editing a ready project changes it to drafting only after a visible “Reopen draft” action. The document remains selectable/exportable before reopening. A ready project remains unarchived unless separately archived.

Revision pass is complete only when each applicable check is marked reviewed; NA requires a brief reason and is excluded. Record `reviewedDraftHeadId`. A later draft edit does not delete checks, but labels the pass “Draft changed since this review”. Student explicitly reconfirms; do not imply validation of new text. Completion of a pass is not an assessment mark.

Milestones Plan/Evidence/Draft/Revision/Ready are self-checks. Denominator excludes NA; zero applicable displays no ring and “No milestones selected”. No artificial requirement for a quotation in every paragraph or eight pieces of evidence.

## Precise UI messages
- Restoring: “Opening your workspace…”
- Initial API missing: “Brightspace saving is unavailable. Open this tool from your course, or continue in a temporary session.” No recovered student records before identity is known.
- Queued: “Changes waiting to save.”
- Saving: “Saving…”
- Local write succeeded, remote pending: “Saved on this device; Brightspace save pending.” If only sessionStorage: “Saved in this tab; Brightspace save pending.”
- Commit acknowledged in unverified tenant/probe: “LMS player accepted save.”
- Tenant-verified normal operation: “Saved to Brightspace.” Details: “The player accepted revision N at TIME. Keep regular backups; simultaneous device editing is not supported.”
- Known network trouble, even after player true: “Device copy saved; online saving not confirmed.” A network hint never makes data disappear.
- Local storage rejected but player accepted: “LMS player accepted save; device recovery unavailable.” Verified label may use Brightspace with the same qualification.
- Neither destination accepted: “Not saved. Keep this page open and export your work.”
- Invalid import: “This backup could not be validated. Your current workspace has not been replaced.” If any LMS mutation was already attempted, replace the latter sentence with accurate pending/uncertain-state wording.
- Future schema: “This workspace was saved by a newer Studio. Export it or reopen the newer version.”
- Capacity blocked: “Your latest changes are not saved to Brightspace. Export a backup and free space to continue online saving.”
- Backup generated: “Backup file created. Check that it is stored before closing.”
- Restore selected: “Recovered copy loaded. Review it before replacing the online copy.”

## Critical failure matrix
API discovery blocked → temporary mode or retry; no cross-origin probing tricks.
Initialize false → capture error code, do not attempt learner data writes.
GetValue failure → recovery; never interpret empty return as empty data without checking error.
Wrong learner/deployment binding → stop restore; never expose content or silently rebind it.
SCORM review/browse mode → read-only document/export, no state writes.
Malformed JSON/gzip/checksum → preserve raw, recovery/export; no default-empty overwrite.
Unsupported schema version → export-only recovery, no downgrade.
Local and LMS differ → compare metadata and preview; no last-timestamp-wins merge.
Two simultaneous tabs → one editable; second read-only.
SetValue false / Commit false → retain current memory/local content and last-good raw. A failed Commit does not prove the LMS did not change; status is unconfirmed.
Write result for revision N after N+1 typed → keep N+1 dirty; never mark all changes saved.
Storage cap exceeded → skip new suspend_data SetValue; existing player state is not intentionally replaced.
File download unavailable → show copyable text/JSON view and retry; no destructive remove enabled.
User closes tab or browser crashes → lifecycle saves are best effort; no guaranteed “zero lost keystrokes”.

## Action IDs for tests
Use stable `data-testid` identifiers from `schemas/action-registry.json`, not button labels in automated tests. Student-facing wording may be localized later without breaking tests. No button is allowed to be purely decorative in production: implement it, clearly disable it with reason, or remove it.
