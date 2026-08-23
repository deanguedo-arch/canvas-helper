<!-- canvas-helper:legacy-snapshot-source-boundary -->
> Source-of-truth safeguard: this project is a preserved `legacy-snapshot-v1` course. Edit `workspace/index.html` directly. Historical English factory or rebuild commands below are reference-only and must not be run against this workspace.

# ELA 20-1 Film Study Prompt Pack

- Mode: DEFAULT
- Workflow: conversion
- Activity profile: film-study (next-step-english-v1)
- Exact included Brightspace IDs: 53128, 53129, 53130, 53131, 53132, 53133, 53134, 53135, 53136
- Exact excluded Brightspace IDs: none
- Canonical recipe: projects/ela20-1-feature-film/meta/english-unit.json
- Canonical learner source: projects/ela20-1-feature-film/workspace/index.html
- Preserved custom source: projects/ela20-1-feature-film/workspace/components and workspace/assets/custom
- Rebuild command: npm run build:english-unit -- --project ela20-1-feature-film

## Authoring boundary

Edit the recipe for source, placement, profile, or wording decisions. Put bespoke activity code or data under the preserved custom paths. The factory owns index.html and assets/generated; do not patch exports.

## Review blockers

- Select and approve the film before final export.
- Validate every inherited lesson video and fallback link.

Final SCORM packaging remains blocked until the recipe is ready-for-export and project E2E passes.
