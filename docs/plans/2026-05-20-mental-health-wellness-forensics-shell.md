# Mental Health & Wellness Forensics Shell Plan

## Goal

Build a new content-only `mental-health-wellness` course project using the Forensics option-2 shell as the interaction and visual framework.

## Steps

1. Add a focused test for the target metadata, shell, course data, content-only exclusions, and progress bridge.
2. Add a project-local generator that parses the Brightspace manifest, selects Course Information plus Units 1-6, skips assessment/teacher material, copies source assets, and emits workspace/meta files.
3. Patch the copied Forensics shell logic for Mental Health naming, storage keys, no assignment synthesis, hidden empty assessment tabs, and content-based progress.
4. Run the generator and test.
5. Run metadata validation and the smallest practical project verification.
6. Update `docs/ops/ACTIVE_HANDOFF.md` and `.stax/codex-report.md`.

## Non-Goals

- No live deploy.
- No assignment workspace generation.
- No quiz import or keyed assessment rebuild.
- No edits to protected raw/export folders.
