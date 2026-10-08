# Chapter 13 reconciled integration checkpoint

- Project: biology30-chapter-13
- Task: integrate reviewed lessons 06–13 while reconciling late work from the stopped task.
- Status: candidate assembled and focused runtime checks passed; newer-standard reconciliation and Chapter 14/15 intake blocked by Library HTTP 403. Teacher acceptance and canonical promotion pending.

## What changed and why

The earlier claim that nothing was integrated was unsafe. The late v0.3.2 candidate already contained the ten reviewed lesson06/07 blocks, lesson05 direct/indirect hGH explanation and diagram, and mobile diagram CSS. Those changes were preserved exactly. Twenty-eight reviewed teaching/worked blocks in 08–13 were installed into a separate v0.4.0 candidate. Only the lesson11 textbook band received its approved locator repair to printed454–455; the opening link is454. No assessment wording, answer key, input, figure, runtime or saving change was introduced.

## Files changed

- `scripts/integrate-biology30-ch13-reviewed-pairs.mjs`: explicit reconciled build; stale build path refuses; creates only a new versioned candidate after hash and preservation checks.
- `scripts/freeze-biology30-ch13-v040-assets.mjs` and `ASSET_FREEZE_RECEIPT.json`: resolved nine external links per snapshot into byte-identical local assets; original links retained under reference-only metadata. No active snapshot links remain.
- This folder: `ASSEMBLY_RECEIPT.json`, `BOUNDED_DIFF.patch`, `VERIFICATION_RECEIPT.json`, native print-test PDF and `evaluation/` comparison snapshots.
- Scoped continuation notice in `docs/ops/ACTIVE_HANDOFF.md`; concurrent handoffs retained.

## Source of truth

Canonical course remains `projects/biology30-chapter-13/workspace/index.html`, unchanged SHA256 `341c2f943c4178bc2abf3d56290f0d8f2cb31e6b78b2b89b187694385ebc62e6`. Candidate is `evaluation/new/index.html`, SHA256 `6e924f678510a86295f28a3b7a8bf4380e5ee8ddb956ce4f7bff65b2c4670f54`. Frozen source intake is the sibling v0.3.0 intake; full late base is recorded in the assembly receipt. No raw, original PDF/PPTX, canonical workspace, export or production course was changed. The project stays blocked; context:project reports existing not-active lifecycle status.

## Verification run

Exact reviewed block/hash checks, protected parity, IDs and byte recovery passed. All06–13 required checks completed through native controls with synthetic writing;07 drafts/reload/resave guards passed. Guided wrong-first/correct-later history and independent-versus-helped transfer submissions survived reload and remained distinct in All My Work. All twelve lesson06–12 figures loaded in native enlargement. Bold vocabulary popup, focus return, mobile05/12 diagram fit and Chrome rendering of printed454 passed. A native two-page optional-response print PDF was saved, extracted and both pages visually inspected. Same-origin synthetic baseline completion, optional note and unfinished writing survived loading the new candidate. The late snapshot freeze audit discovered external links; all18 were materialized with unchanged content hashes, so initial independent-snapshot wording was premature and is corrected by the freeze receipt. See the receipt for exact scope and limitations; these are not teacher, mastery or LMS acceptance.

## Fragile areas / watchouts

Preserve frozen keys/IDs, first attempts, native namespaces, source ownership, label answers, figures and assessment positions. Some inline vocabulary occurrences moved within approved replacement prose; exact per-lesson button bytes/multiplicity remain. Never overwrite the candidate or reinterpret reviewed source provenance as acceptance under an unread newer standard. The old task is idle/interrupted and must not resume as a writer.

## Known risks and deferred checks

Latest production standard and queued Chapter14/15 files failed supported Library materialization twice with HTTP403; stop retries. Full-course E2E, Studio lifecycle, older canonical/SCORM saves, failure injection, complete print pagination, full keyboard/accessibility, real devices, packaging, deployment and Brightspace remain unverified/deferred. The native PDF evidence covers one optional response, not every work-record format. The course manuscripts retain package-specific source-review provenance; teacher acceptance is separate.

## Routing

Lead retained the dirty source, integration and saved-state boundary; deterministic script checks and native browser controls were used. No worker, Muse or new writer launched. Reused local source records are not provider-cache evidence; token savings unknown.

## Preview

- Comparison: http://127.0.0.1:57560/?lesson=08
- Clean review candidate: http://127.0.0.1:57561/index.html#lesson-08
- Disposable runtime QA:57562; same-origin compatibility QA:57564. Do not treat test writing as learner work.

The four-port comparison server is session70270, using the stopped task's read-only `serve-ch13-comparison.mjs` with this candidate evaluation folder and first port57560. Compatibility server54116 is disposable and may be stopped after evidence is retained. Do not rerun build-reconciled over this version; it intentionally refuses overwrite.

## Next prompt should assume

The candidate is usable and reviewed-source content is assembled, but not canonically promoted or teacher accepted. Chapter14/15 canonical hashes still match the coordination record, and no queued content was integrated. No protected assessment proposals, publication, packaging, old task restart or additional authoring writer is authorized.

## Exact next action

Review the v0.4.0 comparison and provide explicit candidate acceptance; separately resolve Library access by supplying the failed handoffs as local attachments before newer-standard reconciliation or Chapter14/15 integration.

## Exact next file to open

`projects/biology30-chapter-13/meta/teaching-overhaul/2026-10-08-teacher-led/master-integration-v0.4.0/VERIFICATION_RECEIPT.json`
