# Session Checklist

## Before You Change Code

1. Identify the target project slug if one exists.
2. Read `projects/<slug>/meta/prompt-pack.md` first for project work.
3. Read `AGENTS.md` and `ARCHITECTURE.md` for repo-wide work.
4. Confirm the owning boundary:
   - Studio UI
   - local server
   - scripts/engine
   - intelligence collect
   - intelligence apply
   - ops/governance docs
5. If the task touches intake, confirm whether it is about:
   - project bundles in `projects/incoming/<folder>`
   - canonical resources in `projects/resources/<slug>/`
   - processed snapshots in `projects/processed/<slug>/source/`

## During Work

1. Keep `projects/<slug>/raw/` untouched unless the task explicitly requires raw repair.
2. Keep `projects/<slug>/exports/` treated as generated output.
3. Use the current intelligence mode intentionally:
   - off
   - collect
   - apply
4. Document any boundary spill immediately.
5. Avoid drive-by refactors.
6. Do not treat `projects/processed/` as an editable source folder.

## Before You Stop

1. Run the minimum verification for the touched area.
2. Update docs if commands, boundaries, or policy changed.
3. Save any session log required by the task.
4. Write a handoff using `docs/ops/HANDOFF.md`.
5. If intake behavior changed, verify both one-shot refresh and the long watcher path.

## Done Check

1. Behavior preserved or intentionally documented.
2. Verification completed and recorded.
3. Handoff contains exact next command and exact next file to open.
4. Risks are explicit, not implied.
