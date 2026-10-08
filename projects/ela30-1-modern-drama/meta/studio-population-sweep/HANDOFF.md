# ELA Studio population sweep handoff

- Project: all 28 ELA catalog courses; three repaired ELA 30-1 legacy snapshots.
- Task: Restore course population/layout in Studio and inspect the remaining ELA previews.
- Status: validated for Studio entry loading; full course rollout validation deferred.
- Repository at start: `codex/math-engine-preflight`, `ecc1b806630cb33b9942e64eb676a1f8568c007e`. Dirty checkout preserved; no commit, packaging or deployment.

## Files changed
- `scripts/repair-ela-snapshot-styles.mjs`: bounded, repeatable local CSS regeneration; rejects factory ownership and concurrent source/metadata drift.
- `scripts/audit-ela-studio-population.ts`: all ELA entries, authoring doctor, direct local resource references, remote scripts and inline JS syntax audit.
- `scripts/tests/ela-snapshot-styles.test.mjs`: complete learner-body preservation and theme/ownership checks.
- For `ela30-1-modern-drama`, `ela30-1-shakespeare-othello`, `ela30-1-short-stories`: `workspace/index.html`, `workspace/assets/studio-local-theme/theme.json`, `workspace/assets/studio-local-theme/utilities.css`, `meta/project.json`, and `meta/studio-population-sweep/` reports/backups.
- Exact Git LFS source archives restored under `projects/resources/ela10-1/_sources/`; original Git hashes retained.
- This handoff, active handoff and archived prior handoff.

## What changed
- Replaced the remote Tailwind runtime in three snapshots with local CSS compiled by pinned `tailwindcss@3.4.17`. The original theme is canonical JSON. The entire HTML from `<body` onward is byte-identical to the original, preserving content, selectors, state namespaces and completion/runtime code.
- Restored two LFS archives (317316924 and 9952418 bytes), fixing four ELA 10-1 authoring doctor failures. SHA-256 equals each original LFS object ID. No network fetch was required.
- Declared local CSS output and its narrow regeneration command; old English builders remain quarantined.

## Why this changed
- Studio isolated-preview CSP blocks remote scripts. Live Streetcar initially reported `tailwind is not defined`, with the sidebar in static flow. Local compiled CSS restores fixed layout without weakening CSP.

## Verification run
- `node --import tsx scripts/audit-ela-studio-population.ts`: 28 courses, zero static/doctor failures.
- `node --test scripts/tests/ela-snapshot-styles.test.mjs`: 4 passed.
- Live Studio course selector sweep: all 28 workspace entries render nonempty main content and fixed sidebars; no visibly broken overview images and no console errors captured during that sweep.
- Read-only lesson navigation/content: Streetcar Motifs (3074 characters), Othello Life/Times/Themes (2796), Short Stories Literary Terms (13602); no errors captured.
- Local proof: `catalog-audit.json`, `live-preview-audit.json`, `lesson-smoke.json`, `before.jpg`, `after.jpg` in this folder. The iframe interaction API could read previews but failed clicking nested controls; lesson smoke checks used the exact observed full-preview URLs instead.

## Source of truth
- Each existing `meta/project.json` declares ownership. 21 courses remain `legacy-snapshot-v1`; seven ELA 10 courses use the English factory.
- The three snapshots are canonical `projects/<slug>/workspace/index.html`; `theme.json` owns the compiled utility CSS theme. Their new regenerateCommand compiles styles only, never replaces the snapshot from the old factory.

## Fragile areas / watchouts
- Canonical snapshots reflect their preserved baseline. This pass repaired loading, not historical layout/content reconciliation or a redesign into newer family navigation.
- Google styles/fonts remain remote; no remote runtime scripts remain in audited ELA entries.
- Three snapshots have duplicate `header`/`footer` IDs in template material. Warning retained; no blind ID rewrite.
- Static asset checks cover directly declared HTML references, not every dynamically selected resource, nested PDF page or media playback.
- Do not confuse `workspace/index 2.html` or old exports with the canonical entry. Mixed metadata entry-path conventions are resolved correctly by the audit.

## Next prompt should assume
- Studio at `http://127.0.0.1:5174/` was responsive and the three courses now load CSS locally. The existing port 5173 process was unresponsive during this sweep; it was left untouched.
- All 28 pass authoring doctor, but that does not certify every editable node or full Studio draft/Undo behavior.

## What still needs validation
- Full lesson/activity/reader inventory, save/reload/resume, Studio reversible edits, responsive/device coverage and export/SCORM/Brightspace validation at an explicitly requested rollout checkpoint.

## Known risks
- No learner answers or completion controls were exercised. Loading evidence is not LMS acceptance.
- The repository contains extensive unrelated dirty work; do not revert, stage broadly, or rerun quarantined builders.

## Routing used
- Sol lead: source ownership, dirty metadata integration, snapshot repair and independent acceptance. Deterministic CLI: CSS compilation, catalog doctor/static audit and LFS restoration.
- `agents:plan` reconnaissance admission failed with `spawnSync git ENOBUFS` on the large dirty overlay; the Luna scout role file was absent. No worker was launched. No Muse result was applied.
- Existing source/reference reuse is separate from provider cache telemetry. Usage savings are unknown and were not measured.

## Exact next action
Await the next requested change.

## Exact next file to open
`projects/ela30-1-modern-drama/meta/studio-population-sweep/HANDOFF.md`

## Do not do next / warnings
- Do not rebuild the 21 legacy snapshots with the old English factory, weaken preview CSP, repackage old exports, or treat this loading sweep as full course/LMS certification.
