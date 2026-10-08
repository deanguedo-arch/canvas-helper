# 07 — Portable backup, import and migration

## File formats (locked for MVP)
Full workspace: `.wstudio` → JSON envelope with `format="nextstep.writing-studio.backup"`, `kind="studio"`, `formatVersion=1`, `schemaVersion=1`, appVersion, exportedAt, payload and checksum.
Single project: `.wstudio-project` → same envelope, kind="project", payload is one complete project graph.
Legacy export: `.wstudio-legacy.json` → format="nextstep.writing-studio.legacy", formatVersion=1, raw strings for the exact two legacy storage keys plus exportedAt. Separate input shape; not silently treated as a valid current backup.

Current portable backups are **uncompressed UTF-8 JSON** for simplicity/recoverability. The compressed WS1 envelope is only the LMS wire format. No ZIP import in MVP despite the older settings picture; therefore no ZIP extraction/path-traversal ambiguity in imports. MIME is advisory. Keep the extension check helpful, but validate contents regardless of extension.

Current backup checksum is `{"algorithm":"sha256","value":"..."}` over the canonical UTF-8 JSON bytes of the **entire envelope except the checksum property**. Thus kind/schema/payload are covered. This is accidental-corruption detection, **not cryptographic proof of authorship or protection against malicious editing**. No secret signing key is placed in the app.

Exported payload excludes learnerKey, raw LMS IDs, tenant binding, device locks and local recovery caches. It includes current project text even when LMS saving is pending. Full export includes archived projects, preferences and library bookmarks. Local historical checkpoints require a separately labeled device-history export if added later; they are not silently promised by Full Studio.

## Import algorithm
1. Read only the file selected by the learner, with a 10 MiB file cap before parsing. Normal backups should be much smaller; this input cap does not expand the valid 1 MiB workspace or 56k wire cap.
2. UTF-8 decode, JSON parse rejecting duplicate object keys in the strict import parser, dangerous keys (`__proto__`, `prototype`, `constructor`) and excessive nesting. No eval/function constructors. Do not inflate ZIP/gzip files in the JSON backup route.
3. Confirm format, supported formatVersion/schemaVersion, timestamp string, checksum and valid payload schema. Run semantic checks: unique IDs, valid references, allowable document tree, project and field caps, logical dates where applicable. No mutation yet.
4. Show preview with project titles/counts/word counts, source schema, proposed mode and conflicts. Current data remains intact. Default **merge as new projects** with fresh IDs; do not replace similarly titled projects.
5. Construct candidate from a copy of current workspace. For ID reuse/dedup choices, never compare titles as identity. A repeated import can be recognized by checksum and shown as already imported; the student may still explicitly import another copy.
6. Full-workspace replacement is advanced: first create a current full backup, reselect/validate its exact hash, then confirm replacement. Preserve destination binding. Replacing a workspace does not transplant remote attempt IDs or lock/session identity. New revision/head and workspaceId policy follow below.
7. Validate candidate and measure encoded LMS envelope with **destination binding**. If over cap, do not apply to online workspace; offer selecting fewer incoming projects or export/open in an explicitly temporary recovery view. Never truncate to fit.
8. Preserve a pre-import checkpoint if permitted; otherwise require the verified external backup gate. Swap in-memory candidate atomically, queue local/SCORM writes. A transport failure leaves a recoverable pending imported candidate and prior backup. It does not prove the LMS remained unchanged after a SetValue attempt.
9. Show “Imported; online save pending” until normal save policy is met. Reselect/export the imported result and reopen in a different browser before relying on it for a live migration.

## IDs and merge rules
All generated IDs use crypto.randomUUID when available, with a cryptographically secure fallback; no Date.now-only identity. IDs in this handoff fixtures are readable synthetic IDs. Duplicate/import-as-new generates new project, source, evidence, section/item, note, feedback and all document block IDs. Remap evidence.sourceId, evidenceUses.evidenceId/blockId, feedback.blockId and activeProjectId. Undefined anchors become null with a visible unlinked note, never a guessed paragraph. Preserve actual text, source metadata and dates of original creation inside import provenance; current created/updated fields follow the import policy.

Merging projects keeps destination workspaceId; replacing full workspace creates a new workspaceId and records imported origin in `imports` receipt (checksum/source app version only, not learner binding). HeadId is new, revision=old+1; client timestamps describe the current transaction. Do not reuse incoming writer session identities.

## Application versus data versions
`appVersion` (for example 2.0.1) is not `schemaVersion` (integer 1). A CSS-only patch must not force a schema change. Codec WS1 is another independent version. `formatVersion` covers portable file shape. Keep four concepts separate.

Current supported production schema is 1. The handoff deliberately does **not** invent a future schema 2 migration. Future changes must define a pure transform, versioned fixtures, before/after preservation assertions and a forward-compatibility policy. Every migration runs on a copy, verifies output and retains source raw/backup before any write. No partially migrated state can become current. Failure returns recovery/export with original raw intact.

A schema 99 fixture represents unsupported future data. The correct response is not “reset this Studio”; it is read-only export and reopen compatible version. Rolling application code back does not make a newer data schema safe for an older app. A release that changes schema must specify a data-compatible rollback route or prohibit code-only rollback after writes.

## Legacy source adapter (schema 0 → project in schema 1)
The two exact keys are recorded in the source audit. The supplied legacy export helper only reads them, does not write/remove/iterate other keys, and does not send data anywhere. It must execute in an owner-authorized old-page context that already has access to those keys. Importing into a new origin cannot recover them automatically.

Parse raw strings separately. Malformed legacy JSON stays an exportable raw record; do not catch and replace with empty. Preview tells learner that legacy ownership was not recorded and asks them to confirm the writing is theirs. Default automatic legacy import is OFF.

Create one project titled “Imported response — review your work”, type personal-response. Map:
- personal-response:texts → an imported planning/source-selection note; map known IDs to titles only from the supplied readings, retaining the original raw string.
- personal-response:idea → plan controlling idea.
- personal-response:connection → plan personal connection.
- personal-response:evidence → one evidence record type other, with content verbatim. No invented source/locator.
- personal-response:form → plan form/purpose note.
- personal-response:draft → draft paragraph(s), preserving LF boundaries; mark provenance “Imported opening / draft field”. Also preserve raw exact original in legacyRaw.
- evidence-draft fields → a note “Unfinished evidence capture” and, when nonempty content exists, one separate draft evidence record clearly labeled not yet verified.
- Every saved notes array record → a note with original source/title, answer/detail and original contributionId/timestamp inside legacyRaw. Do not split combined evidence/commentary heuristically. A saved response-plan note may duplicate mapped plan fields; retain it as a legacy note, not silently deduplicate student writing.
- Unknown response IDs/extra note fields → retained in `legacyRaw`; show “Additional imported data” in Notes, never drop them.

The imported project contains `legacyRaw={responsesRaw,notesRaw}` so exact source text is recoverable. This can increase storage; apply ordinary full-candidate budget checks. Do not import only a partial legacy set without a preview explaining exactly what is retained externally. The source keys remain untouched after import. A checksum of the two raw strings gives a repeated-import fingerprint; exporting at a new time does not create a new identity for the same old work.

## Live version upgrade workflow
A portable import is a **deliberate migration**, not automatic continuation of the same LMS attempt. Keep the old SCORM object accessible. Export from old; reselect/validate file; launch new object; import preview; save; close; reopen on a separate browser without local copies; compare project and content hashes; only then consider retiring old access. Preserve the source backup. Student-specific verification is required; one successful teacher account does not certify every student's migration.
