# Native optional-response interaction specification — trial v0.2.0

This is a source-derived interaction proposal for the new lesson02/05 trial. The native source, runtime, styles, prior returns and calibration analysis remain unchanged. Source/static inspection is complete; save/reload/All My Work, keyboard, print and failure-path UI tests are **not run and remain pending actual integration**. Teacher acceptance is pending.

The complete pasted user plan was read. Its letter-only tomato proposal is superseded by the latest user correction. This document authors no learner biology explanation.

## Exact interface to use

Use a fresh `ch17-kinch-v020-…` response ID for each materially new task. Keep its visible stimulus and author-supplied task instruction before the response box. Native markup is:

```html
<div class="optional-writing">
  <label for="NOTE_ID">AUTHOR_SUPPLIED_RESPONSE_INSTRUCTION</label>
  <textarea aria-describedby="NOTE_ID-status" data-note-input="NOTE_ID" id="NOTE_ID" rows="5"></textarea>
  <p class="writing-status" data-note-status="NOTE_ID" id="NOTE_ID-status">Optional response. Select Save response to collect it. Maximum 5000 characters.</p>
  <button data-save-note="NOTE_ID" type="button">Save response</button>
</div>
```

The original native note textarea has **no `maxlength` attribute** and starts empty. Its status paragraph has **no `aria-live` attribute**; the existing global native status supplies status/alert announcements. Preserve the exact ID, `for`, `aria-describedby`, input, status and save relationships. Do not attach required-check, guided-selection or whole-set transfer hooks to these notes. Native optional wrappers/classes may surround the complete task, but no new CSS or runtime is proposed.

Root's current response-ID candidates are:

- `ch17-kinch-v020-l02-arrow-response`
- `ch17-kinch-v020-l02-cross-response`
- `ch17-kinch-v020-l05-change-response`
- `ch17-kinch-v020-l05-evidence-response`

These IDs do not exist in the current native source. Exact titles await root's final task wording; an ID name does not establish that a candidate activity passed assessment-overlap review.

## Actual native persistence semantics

| Action | Source-derived behavior |
|---|---|
| Type in the note | The generic input listener calls native `change`/`save`, setting `S.notes[ID].draft`. It reports that the draft is saved locally and asks the learner to select Save response to collect it. |
| Save response | Requires a nonempty trimmed draft and raw `draft.length <= 5000`. It writes `submitted = draft.trim()` and `at = Date.now()`, then updates All My Work. It does not grade the response. |
| Oversized draft | The input listener still saves the draft. Explicit collection rejects more than5000 raw characters through the existing global status. Do not silently truncate the response. |
| Reload | `restoreNotes()` restores each matching textarea's draft. The per-note status sentence is not reconstructed into a saved-state label on reload; it starts with the generic native sentence until interaction. |
| All My Work | A note appears only after explicit collection. It shows the last submitted response. If the current trimmed draft differs, a notice says a newer draft exists. |
| Edit after collection | The last submitted response remains intact while the newer draft changes. A later explicit collection replaces that note's last submitted response. |
| History | Notes retain current draft, last submitted text and timestamp. They do **not** append an attempt series to `S.history`. Do not promise first-attempt scores or revision-history records. |
| Required progress | The native required-progress function counts completed `kind:'check'` history records. Optional notes do not add required progress. |
| Conflict/failure | All mutation uses the native clone/revision/storage safeguards. Another-tab detection or storage failure blocks further writes and issues native warnings. No direct storage writer or new namespace is allowed. |
| Printing | Existing All My Work rendering/print flow includes collected notes. This is source evidence, not a claim that printing was tested. |

The native key remains `biology30-chapter-17:html:v1`, optionally scoped through its existing LMS adapter. Nothing is automatically sent to a teacher by the local optional note UI.

## Hint and comparison controls

Use ordinary native `<details><summary>…</summary>…</details>` for an optional hint, and a separate disclosure for the complete model, criteria and explanatory feedback. These give the learner an intentional opening action. Author instructions may ask the learner to write and save before comparison.

**Do not claim technical save-gating for these new models.** There is no generic `S.notes` model-unlock binding in the source. `data-locked="true"` invokes a global prevention handler; for a new note it would remain locked. `data-extension-model` is queried once and hardcoded to the original `ch17-optional-extension` submitted response. Reusing that hook would connect the new task to the wrong note.

Plain disclosures therefore remain learner-controlled and can be opened before saving. They do not record hint use, first-attempt status or automated feedback judgment. If enforced save-before-model gating becomes a requirement, that is a separate runtime change for later integration and testing, not an existing capability to claim here.

## Friendly titles in All My Work

The generic save/reload/collection handlers accept a new namespaced ID without pre-registration. All My Work resolves a friendly heading using `C.notes.find(v => v.id === id)?.title || id`. Without a matching registry entry, it displays the raw ID.

Propose one `{ "id": "…", "title": "…" }` entry for each finalized task in `course-data.notes`. This is a **separate configuration proposal**, not a teaching or header edit. Metadata remains unchanged/proposal-only until actual integration.

Current original array:

- UTF-8 bytes `[3239743,3240263)` in native `index.html`.
- SHA256 `88d093c985c3a370d5011f0acbf56ce39576c3645fa28bf59fcf614a12bd9402`.
- Six original entries; preserve each unchanged.
- Exact append insertion point: **3240262**, immediately before the original closing `]`.
- Append comma plus the finalized new records; do not reserialize the native page or full configuration.

The machine-readable companion retains the complete original array, all six exact source note controls, exact runtime snippets and UTF-8 ranges, stylesheet source evidence, pending-test cases and record schema.

## Verification boundary

Current native index remains SHA256 `9ea0e4532845625e7a2421b6e885fea2781ad3c1229b8499dc7c8bb967289868`.

Required next-stage verification concerns the actual integrated candidate: input persistence, reload, explicit collection, friendly title, saved-versus-draft distinction, invalid-length rejection, existing conflict/failure behavior, progress invariance, keyboard access and print. The present inert teacher copy should visibly retain the textarea and Save response interface with disabled controls and an administrative notice explaining that it is a review representation. No source script is transplanted into that copy.
