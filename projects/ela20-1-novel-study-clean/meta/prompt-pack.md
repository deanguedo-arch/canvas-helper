<!-- canvas-helper:legacy-snapshot-source-boundary -->
> Source-of-truth safeguard: this project is a preserved `legacy-snapshot-v1` course. Edit `workspace/index.html` directly. Historical English factory or rebuild commands below are reference-only and must not be run against this workspace.

# ELA 20-1 Novel Study Prompt Pack

- Mode: DEFAULT
- Workflow: conversion
- Activity profile: novel-study (next-step-english-v1)
- Exact included Brightspace IDs: 53127, 3467, 3468
- Exact excluded Brightspace IDs: none
- Canonical recipe: projects/ela20-1-novel-study-clean/meta/english-unit.json
- Canonical learner source: projects/ela20-1-novel-study-clean/workspace/index.html
- Preserved custom source: projects/ela20-1-novel-study-clean/workspace/components and workspace/assets/custom
- Rebuild command: npm run build:english-unit -- --project ela20-1-novel-study-clean

## Authoring boundary

Edit the recipe for source, placement, profile, or wording decisions. Put bespoke activity code or data under the preserved custom paths. The factory owns index.html and assets/generated; do not patch exports.

## Review blockers

- Confirm learner access to Lord of the Flies and The Book Thief; primary texts are not supplied.
- Review the 24 profile-supplied generic questions before final export.

Final SCORM packaging remains blocked until the recipe is ready-for-export and project E2E passes.
