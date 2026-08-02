# Session Checklist

## Before You Change Code

1. Identify the target project slug if one exists.
2. Read `docs/ops/ACTIVE_HANDOFF.md`.
3. For active migrated course work, run `npm run course:doctor -- --project <slug>`.
4. Only when an agent needs a project brief, run `npm run context:project -- --project <slug>` after the doctor passes.
5. Run Headroom only when you intentionally need prompt-pack regeneration: `npm run headroom -- --project <slug>` or, for a deliberate repo-wide refresh, `npm run headroom:all`.
   Use `npm run studio:codex:session -- --no-headroom` for the compact default session path.
6. If workflow is known, read `docs/workflows/<workflow>.md`.
7. Read `projects/<slug>/meta/prompt-pack.md` only when the task needs that additional detail.
8. Read `AGENTS.md` and `ARCHITECTURE.md` for repo-wide work.
9. Confirm the owning boundary:
   - Studio UI
   - local server
   - scripts/engine
   - intelligence collect
   - intelligence apply
   - ops/governance docs
10. If the task touches intake, confirm whether it is about:
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
2. Run `npm run validate:manifests -- --project <slug>` when project metadata/source-of-truth changed.
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
