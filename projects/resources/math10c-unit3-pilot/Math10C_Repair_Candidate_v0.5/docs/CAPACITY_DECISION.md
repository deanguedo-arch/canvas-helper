# Capacity decision — current limits unchanged

## Decision status

**No final explanation or history policy has been selected.** The current candidate keeps every original field ceiling and retention tier. The 40,000-character application guard and shared 60,000-character SCORM 2004 envelope guard remain. No saved text is silently shortened. `repair/CAP-04` has **failed capacity-fit acceptance**, while the oversize rejection/recovery cases pass in the controlled environment.

The prior builder's capacity confidence should not carry forward. Current measurements use the **actual emitted proposed shared bridge**, real codec and actual collected tracking/envelope fields. JSON serialization is observed just before that bridge's own guard. API SetValue staging is distinct from confirmed Commit. No synthetic `envelope={estimated…}` substitutes for collection.

## Measured witnesses

| Witness | Application JSON | Actual complete bridge envelope | Application ≤40,000 | Bridge ≤60,000 |
|---|---:|---:|---|---|
| Event-driven UI session | 19,211 | 12,475 | Yes | Yes |
| blank-current-page | 1,431 | 1,081 | Yes | Yes |
| max-adversarial-metadata | 211,276 | 215,194 | No | No |
| max-ascii | 45,344 | 48,460 | No | Yes |
| max-bmp | 44,605 | 46,243 | No | Yes |
| max-escaped | 19,139 | 5,493 | Yes | Yes |
| max-repeated | 14,121 | 4,565 | Yes | Yes |
| max-supplementary | 44,605 | 39,781 | No | Yes |

The UI witness used 194 submitted answers through source-owned control events, eight lesson-check records, six active records, four protected selections, two recent records and 36 fixed drafts. It used intentionally long fields, not a learner trial. Storage, lock and API are explicit doubles; input/click handlers and emitted bridge are real. The UI session is one reachable scripted path, **not a saturation proof for every possible accepted state**.

Adversarial witnesses fill current schema-admitted structures with varied ASCII, BMP, supplementary and escaped text. Their submitted “mathematics” is not asserted to be UI-generable. The large metadata witness gives independently varying provenance detail inside accepted bounds; it demonstrates why accepted schema data is not synonymous with saveable data. It is labelled decoder-admitted, not typical student usage.

The separate framing witness has 22 actual historical page-time entries, a 100-character scope and 188-character learner identifier: its emitted envelope is 1,804 characters. These are explicit test assumptions, not the tenant's maximum identifiers. The JSON contains raw/packed alternative full-envelope measurements and actual encoder choice for each text distribution.

## Unchanged policy

- Mathematical raw entry: 160 characters; short practice reasoning: 120.
- Each of eight lesson explanations: 160; help/error note: 240 each.
- Trig raw entries: 80; trig reasoning: 160.
- Eight required lesson-check records, one six-item active set, four protected selections, two recent ordinary detailed records.
- First submission plus latest three per retained record; further attempts remain available.
- First fixed responses, fixed drafts, support/exposure and migration provenance remain protected as specified.

Structured pairs are stored losslessly as the two raw native fields separated by `|`. Existing fields' `maxlength` values are unchanged. No original question, explanation or saved response was shortened to force a witness to pass.

## Measured alternatives — NOT applied

- `deduplicate-details`: 44,433 application / 46,063 full-envelope characters. Application fit: **no**.
- `recent-zero`: 42,328 application / 43,932 full-envelope characters. Application fit: **no**.
- `shorter-new-explanations-80`: 43,085 application / 44,725 full-envelope characters. Application fit: **no**.

The prospective-80 option is an explicitly labelled counterfactual projection used only in the measurement script. It is **not** applied to source, fixtures, saved work, labels or current acceptance. Existing long responses cannot be migrated by slicing. Reducing recent history alone or shortening explanations to 80 does not even solve the measured BMP application case, so neither is recommended as a sufficient repair.

## Recommendation for the owner/integration review

Do not approve a lower explanation limit merely to turn a size test green. Keep the current limits for local review, retain the safe rejection paths, and withhold learner release. Before production acceptance, choose and document the **portable evidence obligation**: the exact protected evidence/drafts to keep in one attempt, whether an approved separate written-work route is required, and how legacy over-budget work will be recovered. Any representation optimization must be lossless, versioned and rerun through the complete real envelope. Do not raise the application ceiling or reduce retention by assumption.

A credible next engineering proposal may encode repeatable provenance by immutable references or partition later unit delivery, but neither is claimed implemented or measured here. The single-SCO/full-history tradeoff is unresolved. The current preserved-work failure behavior is a safety repair, not proof that every allowed session will remain within one record.

## Failure and rollback limits

Source validation and the application guard stop publication before replacing canonical local data. The proposed bridge refuses an oversized emitted envelope before writing suspend_data. In the controlled API, failed SetValue/Commit does not change the confirmed server copy. The course retains its current draft, recovery branches and last **confirmed** receipt locally; it withholds a success message. Real tenant persistence after a staged write followed by failed Commit is unverified—no server rollback guarantee is made.

When storage itself fails, branch copies may exist only in memory and are labelled accordingly. Do not close the tab on an unsaved/error status. Copy/download is emergency recovery, never a normal condition for continuing practice. No current text limit or owner gate was changed while the other repairs were completed.

Evidence: `evidence/actual-bridge-capacity.json`, `ui-session-capacity.json`, `tracking-framing-stress.json`, capacity fixtures, emitted bridge sources and the full regression ledger.
