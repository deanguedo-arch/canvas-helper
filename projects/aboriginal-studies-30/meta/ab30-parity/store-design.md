# AB30 Store + Migration Design (T04 proposal — needs lead approval before T05)

Status: PROPOSED. No production activation. Pure reference implementation +
fixture tests live in `scripts/tests/aboriginal-studies-30-state.test.ts`
(functions prefixed `store`); T05 adopts them into the runtime adapter only
after this design is approved.

## 1. Host ownership map (verified in repo code this ticket)

| Host | Save owner | Mechanism | Capacity | Conflict handling |
|---|---|---|---|---|
| Standalone browser / Studio preview / Brightspace static export | `main.js` direct `localStorage` (3 keys) | `saveJson` per key; no host | ~5 MB localStorage | none (last `setItem` wins per key) |
| SCORM 2004 / 1.2 (`scorm-bridge.js`, legacy mode — AB30 has no `scorm-tracking.json`) | bridge collects exact tracked keys → `cmi.suspend_data` | `{version:1, projectSlug, savedAt, values, tracking}`; restore overwrites local keys wholesale; invalid snapshot blocks restore (protective) | 60,000 chars (2004) / 3,500 (1.2); over-budget save is SKIPPED with an explicit error — never truncated | none (cross-tab storage events only schedule a save flush; last writer wins) |
| Google-hosted (`google-hosted-bridge.js`; DISABLED for AB30 — no Firebase site) | bridge mirrors exact tracked keys ↔ Firestore user doc | whole-value overwrite both directions; `set .. {merge:true}` at doc level only | 1 MB/doc Firestore | none (last writer wins) |

Consequences (non-negotiable for the design):

1. Keep the exact 3 key names. Every host tracks names, not patterns; a 4th
   key silently drops out of SCORM/Firestore sync. Any new namespace needs a
   manifest + re-export decision — not taken here.
2. The migration marker lives INSIDE a tracked value. A marker in an untracked
   key would not survive an LMS restore and migration would re-run forever.
3. The whole learner state must fit 60,000 serialized chars for SCORM 2004
   (values + wrapper + tracking). SCORM 1.2 (3,500) cannot carry this course —
   recorded as unsupported for save/restore, not silently lossy.
4. Over-budget, corrupt, and conflict states must surface explicit recovery
   (export/backup path), never truncation or silent overwrite. The SCORM
   bridge already refuses to truncate; the course side must match that honesty.

## 2. Envelope (inside existing values; names unchanged)

`activityResponses` value becomes one of:

- legacy flat map `{ [key]: string }` (schema-less; current production), or
- v1 envelope:
  ```json
  {
    "schema": "ab30-store-v1",
    "revision": 7,
    "records": { "<recordId>": {
      "id": "<recordId>", "kind": "booklet-field|assignment|vocabulary|legacy-raw",
      "draft": "<exact learner text>", "revision": 3,
      "contentVersion": "t1-booklet-2021-10|<assignment>-v1|legacy-unknown",
      "origins": [{"key": "<legacy key>", "value": "<exact text>"}],
      "updatedAt": "<iso>" | null
    } },
    "conflicts": [{"id": "conf:<stable-hash>", "recordId": "<recordId>",
      "candidates": [{"origin": "<legacy key>", "value": "<exact text>"}],
      "status": "unresolved|resolved", "resolution": null | {
        "choice": "keep-first|keep-second|merged", "mergedText": "<exact text>",
        "resolvedAt": "<iso>", "predecessors": ["<origin>", "<origin>"]}}],
    "attempts": [{"id": "att:<stable-id>", "taskId": "<recordId>",
      "contentVersion": "<version>", "response": "<snapshot, immutable>",
      "optionOrder": ["<choiceId>", "..."], "selectedOptions": ["<choiceId>"],
      "role": "first|revision", "revisionOf": null | "<attemptId>",
      "conditions": {"intended": "guided|independent|review", "helpDeclared": "<text>"},
      "modelExposure": [], "submittedAt": "<iso>" | null, "reviewState": "submitted|in-progress|reset"}],
    "legacy": {"raw": {"<unknownKey>": "<exact value>"}},
    "migration": {"from": "flat-v0", "at": "<iso>" | null, "complete": false}
  }
  ```

Record-id scheme: booklet fields keep their full legacy key as the record id
(1:1, zero remap); logical assignment groups use `assignment:<id>` with all
legacy origins preserved; frayer/vocabulary keep `frayer::<term>::<index>`;
anything unrecognized goes to `legacy.raw` byte-exact.

`progress` value → `{schema, revision, selfReport: {completedUnits: [],
completedAssignments: []}, teacherCheckpoints: []}` — legacy flags preserved
as self-report, never mastery. `ui` value → `{schema, revision, ui: {...},
resume: {lessonId, at}}`.

`updatedAt`/`submittedAt` are `null` whenever the time was not actually
observed. The design never invents timestamps (STATE04).

## 3. Pure API (reference-implemented + tested in T04; wired in T05)

`storeMigrateFlatToV1(flat, aliases, promptVersions)` → `{envelope, report}`:
pure; never mutates input; identical strings dedupe (origins kept); differing
nonempty strings → conflict (no newest-guess, `timeUnknown`); unknown keys →
`legacy.raw`; whitespace-significant (F06 distinct strings stay distinct —
comparison display may be whitespace-insensitive, records never are).

`storeReadDraft(envelope, recordId)` → `{text, revision, contentVersion,
hasConflict}`. All views read through this; DOM ids stay view-scoped.

`storeWriteDraft(envelope, recordId, text, expectedRevision)` →
`{envelope, result}` where result is `{ok, revision}` or
`{ok:false, code:"stale-revision", current}` — the caller preserves the
rejected text as a conflict candidate, never drops it (STATE10 pure half).

`storeResolveConflict(envelope, conflictId, choice)` → new revision;
predecessors preserved inside the resolution record (STATE03).

`storeSubmitAttempt` (with `role: first|revision` + `revisionOf`): append-only
snapshots; draft edits never mutate attempts; option order + versions pinned
(STATE08).
`storeBeginRun` opens an `in-progress` run; `storeResetRun` flips one
unfinished run to `reset` and clears only its draft — submissions, other
records, and vocabulary are untouched, and submitted attempts refuse reset
(STATE09).

`storeExportSet` → versioned JSON download; `storeImportSet` validates the
full envelope shape (`storeValidateEnvelopeShape`: schema, revision,
per-record id/draft/origins, array-typed conflicts/attempts) then merges
with a pre-import backup; malformed import leaves current untouched
(STATE11).

`storeMeasurePayload(activityEnv, progressEnv, uiEnv)` → bytes/chars plus a
SCORM-2004 wrapper model (`values` envelope + ~1.5 KB tracking headroom);
over budget → `{fits:false}` and the caller must surface export/backup,
never truncate or evict (STATE15).

`storeDeriveSaveStatus(outcome)` → `Unsaved changes | Saving… | Saved in
this browser | Save failed — keep this page open and export your work`
(LMS wording reserved for confirmed host receipts; STATE14 pure half).

`storeCommitWithChecks(storage, key, envelope, measure)` → commits only when
serialization + measurement + write + read-back all succeed; the
`migration.complete` marker is set exclusively on this path (STATE13).

## 4. Migration algorithm ( Bydesign; T05 executes after approval)

1. Read the 3 raw key strings; capture parse failures as recovery records
   (never coerce to `{}`).
2. Byte-preserving backup first (export download where available; in-memory
   + retained legacy keys otherwise).
3. Pure `storeMigrateFlatToV1` over the flat map.
4. Measure the complete candidate (STATE15 model); over budget → stop with
   explicit status, keep legacy state live.
5. Commit each key with read-back verification; set `migration.complete`
   only after all three verify. Any failure → retain last confirmed state +
   unsaved candidate; legacy keys untouched.
6. Keep legacy raw inputs through the rollback window (same values; the
   envelope carries `legacy.raw` for unknowns).
7. Rerun-safe: envelopes with `schema=ab30-store-v1` migrate to themselves
   (no duplicate conflicts/attempts — stable ids); legacy reruns reproduce
   identical envelopes (STATE01).

## 5. Concurrency (no lock exists — design for it)

localStorage offers no cross-tab lock and neither bridge merges. Rule: every
commit carries `expectedRevision`; on mismatch the tab keeps its text, marks
the record conflicted, and requires reconciliation — it never overwrites the
newer revision and never silently reloads the editor (STATE10). Remote LMS
restores that replace local values wholesale are detected by revision jump
and surfaced the same way. True two-tab contention proof needs a browser
(T23); the pure interleaving tests in T04 prove the no-silent-clobber logic.

## 6. Novel/version isolation (STATE12)

Legacy 4-3 work keeps `contentVersion: legacy-inconvenient-indian` on
`assignment:4-3-personal-response`. The Halfbreed candidate is a SEPARATE
record (`assignment:4-3-personal-response:halfbreed-v1`) that nothing reads
or writes until teacher activation. Copy-forward is an explicit learner
action producing a new draft with provenance, never an automatic relabel.

## 7. Capacity outlook (MEASURED — lead decision required)

Budgets: SCORM 2004 60,000 chars; localStorage ~5 MB; Firestore 1 MB/doc.
T04 STATE15 measurements (wrapper model + 1,500 tracking headroom):

| Payload | Total chars | SCORM 2004 |
|---|---|---|
| Empty envelope | ~2,500 | fits |
| Typical-complete, CURRENT flat format (102×150ch + 8×1200ch essays) | 31,159 | fits |
| Typical-complete, v1 ENVELOPE (same learner text) | 81,245 | **OVER (1.35×)** |
| Heavy (102×800ch + 8×5000ch + conflict + attempt) | 275,981 | **OVER (4.6×)** |

The envelope costs ~2.6× the flat size at typical load, dominated by
`origins` duplication (each record re-stores its text for rollback
fidelity) plus per-record metadata. Integrity up, headroom down: the
migration turns a fitting payload into an overflowing one.

Required lead decisions before T05 (pick at least one; combinations allowed):

(a) Accept the explicit over-budget UX + export/backup path as the NORMAL
    finishing path (bridge already refuses to truncate; course must provide
    the export in T05/T20). Honest but poor for finishing learners.
(b) Post-stability origin pruning: once the lead declares migration stable,
    drop `origins` (payload roughly halves; typical then fits, heavy still
    overflows). Needs an explicit state-version bump + recorded reason.
(c) Bridge/protocol change (delta sync, per-key sync, managed-state adapter).
    Repo-level work, outside AB30 ticket scope — needs a separate decision.
(d) Teacher retention policy (what may be archived/exported vs kept live).

What is NOT on the table: silent truncation, history eviction, smaller
text caps to fit the budget, or calling local-only work an LMS save.
SCORM 1.2 save/restore for this course is declared unsupported (3,500 chars
cannot carry it; the bridge reports this honestly already).

## 8. Rollback

Until the lead declares the migration stable: legacy flat values remain
reconstructible from every envelope (`origins` + `legacy.raw`); T05 keeps a
one-command restore (`storeFlattenForRollback`) that rewrites origins and
unknowns verbatim plus post-migration draft edits to their primary legacy
key. Rollback explicitly drops v1-only metadata (attempts, conflict
resolutions) and reports exactly what was dropped — rollback is a lead
decision with a recorded reason, never a silent downgrade.

## 9. What this design does NOT decide (lead/teacher gates)

- Production activation of any of this (T05 needs THIS approval first).
- Any new storage key or namespace (rejected by default; §1.1).
- Retention/capacity policy if heavy use exceeds 60K (teacher/lead).
- Novel activation, assessment modes/weights, outcomes mapping (teacher).
- Studio annotation-identity mechanics for live status regions (lead + T05
  implementation proof; the existing `data-save-state` attribute mechanism
  must be preserved and tested, not worked around).
