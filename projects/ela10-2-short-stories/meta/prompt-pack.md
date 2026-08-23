<!-- canvas-helper:legacy-snapshot-source-boundary -->
> Source-of-truth safeguard: this project is a preserved `legacy-snapshot-v1` course. Edit `workspace/index.html` directly. Historical English factory or rebuild commands below are reference-only and must not be run against this workspace.

# ELA 10-2 Short Stories Prompt Pack

- Mode: DEFAULT
- Workflow: conversion
- Activity profile: short-fiction (next-step-english-v3-ela10-2)
- Exact included Brightspace IDs: donor:ela10-1-short-stories
- Exact excluded Brightspace IDs: none
- Canonical recipe: projects/ela10-2-short-stories/meta/english-unit.json
- Canonical learner source: projects/ela10-2-short-stories/workspace/index.html
- Preserved custom source: projects/ela10-2-short-stories/workspace/components and workspace/assets/custom
- Rebuild command: npm run build:english-unit -- --project ela10-2-short-stories

## Authoring boundary

Edit the recipe for source, placement, profile, or wording decisions. Put bespoke activity code or data under the preserved custom paths. The factory owns index.html and assets/generated; do not patch exports.

## Review blockers

- Review the Cask vocabulary quiz before enabling it as formative practice.
- Confirm every supplied question set is extracted without prefilled learner answers.

Final SCORM packaging remains blocked until the recipe is ready-for-export and project E2E passes.
