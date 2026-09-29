# Science 24 Unit A review candidate

- Project: `science24-unit-a`
- Workflow: conversion with an imported generated first pass
- Reference course: Biology 30 Unit A Pilot 3, for learner presentation and interaction patterns
- Status: blocked, local review preview; Studio Edit, export and deployment disabled
- Canonical learner source: `workspace/index.html`, `workspace/styles.css`, `workspace/unit-a.css`, `workspace/course-data.js`, `workspace/main.js`, `workspace/state-store.js`, `workspace/asset-loader.js`, and `workspace/assets/**`
- Source evidence: the checksummed Brightspace export and generated v5 ZIP in `projects/resources/science24-unit-a/_sources/`; `meta/imported-authoring/**` is draft provenance, not a rebuild input
- Supplemental source: the CBE System Science 24 (Winter 2020) ZIP is registered in the resource manifest and screened in `meta/cbe-source-pass.md`. It cannot override the class Brightspace source or 2023 workbook.

## Editing rules

Edit the canonical workspace files. The original archives and `raw/**` remain unchanged. HTML carries routine text and Studio edit keys; JavaScript creates practice, textbook, vocabulary, video and saved-work views. Those runtime containers are marked Annotation only. Preserve the existing `s24-a-*` activity, question and vocabulary IDs, the textbook printed-to-physical page map, and the browser save namespace. Treat new check/practice questions as authored formative material. They do not replace the Brightspace Unit A Quiz, hidden Test, or Defence Evidence Dropbox.

## Review focus

Inspect Textbook Practice, Core Vocabulary and all eight optional video surfaces against Pilot 3 at desktop and phone widths. Verify learner writing after reload in a real browser. Read `source-review.json` for source mapping and the restored learner-visible workbook self-check key. Review the CBE-informed Lesson 13 scrubber pathway and the exclusions in `cbe-source-pass.md`. Teacher review of the exact candidate is required before activation, export or B–D adaptation.

The cross-unit [visual teaching and placement plan](../../../docs/ops/science24-visual-pedagogy-plan-2026-09-25.md) now records a figure-by-figure A–C scan. Resolve its A priorities before claiming the lesson images are pedagogically or responsively accepted; a loaded image and a passing overflow check are insufficient.
