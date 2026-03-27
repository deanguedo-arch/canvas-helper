# Session Checklist

## Before You Change Code

1. Identify the target project slug if one exists.
2. Read `docs/ops/ACTIVE_HANDOFF.md`.
3. If resuming in Cursor or Codex and Headroom is installed, ask once whether to start Headroom before changing code.
4. Do not start Headroom automatically as part of handoff restore; wait for an explicit yes.
5. If workflow is known, read `docs/workflows/<workflow>.md`.
6. Read `projects/<slug>/meta/prompt-pack.md` first for project work.
7. Read `AGENTS.md` and `ARCHITECTURE.md` for repo-wide work.
8. Confirm the owning boundary:
   - Studio UI
   - local server
   - scripts/engine
   - intelligence collect
   - intelligence apply
   - ops/governance docs
9. If the task touches intake, confirm whether it is about:
   - project bundles in `projects/incoming/<folder>`
   - canonical resources in `projects/resources/<slug>/`
   - processed snapshots in `projects/processed/<slug>/source/`

## During Work

1. Keep `projects/<slug>/raw/` untouched unless the task explicitly requires raw repair.
2. Keep `projects/<slug>/exports/` treated as generated output.
3. Keep source-of-truth explicit for active migrated projects (`canonicalEntry`, `canonicalSources`, `authoringStatus`).
4. Use the current intelligence mode intentionally:
   - off
   - collect
   - apply
5. Document any boundary spill immediately.
6. Avoid drive-by refactors.
7. Do not treat `projects/processed/` as an editable source folder.

## Before You Stop

1. Run the minimum verification for the touched area.
2. Run `npm.cmd run validate:manifests -- --project <slug>` when project metadata/source-of-truth changed.
3. Update docs if commands, boundaries, or policy changed.
4. Save any session log required by the task.
5. Update `docs/ops/ACTIVE_HANDOFF.md` using `docs/ops/HANDOFF.md`.
6. Archive the previous active handoff to `docs/ops/ARCHIVED_HANDOFFS.md` if you are switching tasks or machines.
7. If intake behavior changed, verify both one-shot refresh and the long watcher path.

## Done Check

1. Behavior preserved or intentionally documented.
2. Verification completed and recorded.
3. Handoff contains exact next command and exact next file to open.
4. Risks are explicit, not implied.
