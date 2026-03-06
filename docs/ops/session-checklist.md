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

## During Work

1. Keep `projects/<slug>/raw/` untouched unless the task explicitly requires raw repair.
2. Keep `projects/<slug>/exports/` treated as generated output.
3. Use the current intelligence mode intentionally:
   - collect-only
   - advisory
   - active
4. Document any boundary spill immediately.
5. Avoid drive-by refactors.

## Before You Stop

1. Run the minimum verification for the touched area.
2. Update docs if commands, boundaries, or policy changed.
3. Save any session log required by the task.
4. Write a handoff using `docs/ops/HANDOFF.md`.

## Done Check

1. Behavior preserved or intentionally documented.
2. Verification completed and recorded.
3. Handoff contains exact next command and exact next file to open.
4. Risks are explicit, not implied.
