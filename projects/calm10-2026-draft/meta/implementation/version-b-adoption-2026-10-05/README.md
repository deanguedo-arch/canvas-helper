# Approved Version B adoption — October 5, 2026

Dean requested that Version B become the only active CALM version. All 40 revision-4 lessons are now in `projects/calm10-2026-draft/workspace/index.html`. The workspace is the direct editable source; approved stage-heading and shell styles are declared canonical. The review banner and chooser have been removed.

Open http://127.0.0.1:4195/ . `meta/teaching-overhaul/calm-standard-v1/preview.mjs` serves canonical workspace directly. Old A/B and older root comparison URLs redirect to the active course; the lesson fragment is preserved. Restart only if needed with `node projects/calm10-2026-draft/meta/teaching-overhaul/calm-standard-v1/preview.mjs`.

## Preservation and evidence

- `before/` preserves all 32 preceding root files, project metadata and the former preview server. Older A/Before snapshots remain unchanged. `approved-b.html` freezes the exact accepted candidate.
- `ADOPTION.json` records approved/canonical hashes, authorization and the 27 changed CE1-05 field versions. `adopt-once.cjs` is a historical operation; it refuses a second adoption. Future edits belong in canonical HTML/CSS.
- Runtime and canonical `calm10-2026-draft:learning:v3` namespace remain unchanged. CE1-05 earlier answers retain exact canonical instructions in Earlier Work; other task versions stay the same. Reviewer answers remain separate. Browser storage is origin-specific; work on other localhost ports is not merged automatically.
- `check-adoption.cjs` and `checks.json` record focused synthetic save/history/completion compatibility, source/control/media preservation, preview byte equality and retired-route redirects. The check uses an isolated browser context and does not edit user data.
- Native CE1-05 opening inspected: no Version B comparison banner; approved shell, vocabulary disclosure and larger stage heading present. Screenshot: `canonical-opening.png`. No learner fields edited.

## Boundaries and next action

Build integration only. Whole-course E2E, broad accessibility/responsive/source/media review, Studio lifecycle, export/SCORM/Brightspace and release proof remain deferred to separately requested rollout. `context:project` encountered the existing 14,708-byte CALM context against its 5,000-byte cap; this unrelated issue was not changed.

Routing: lead retained dirty source integration and saved-state decisions; deterministic adoption and focused checks. No workers; measured savings unknown. Next action: open the single active course and make any requested changes directly in `workspace/index.html`.
