# Prompt Contract

Use this structure for high-signal, surgical prompts in Canvas Helper.

## Required Fields

- `Mode`: `CANVAS` or `DEFAULT`
- `Workflow`: `conversion` | `generated-course` | `injection/integration`
- `Project`: slug
- `Canonical entry`: explicit file path
- `Boundary`: exact files/sections/components allowed
- `Source-of-truth constraints`: what can and cannot be edited
- `Success criteria`: what must work and what must remain unchanged

## Clarification Rule

If all required fields are present and non-conflicting, do not ask clarification questions. Execute.

Ask exactly one clarification question only if a required field is missing, ambiguous, or conflicts with another constraint.

This rule takes precedence over read-discipline heuristics when the task stays inside the declared boundary.

## Template

```text
Mode: <CANVAS|DEFAULT>
Workflow: <conversion|generated-course|injection/integration>
Project: <slug>
Canonical entry: <path>
Boundary: <allowed files/sections>
Source-of-truth constraints:
- Canonical sources: <paths>
- Runtime/bundle edits: <forbidden|emergency-only>
- Reference-only files: <ignore|allowed with reason>
Success criteria:
- Must work: <checks>
- Must not change: <contracts/fidelity rules>
```

## Example: Conversion

```text
Mode: DEFAULT
Workflow: conversion
Project: forensics35
Canonical entry: projects/forensics35/workspace/index.html
Boundary: module navigation shell + lesson body rendering only
Source-of-truth constraints:
- Canonical sources: workspace/index.html, workspace/main.jsx, workspace/main.js
- Runtime/bundle edits: emergency-only
- Reference-only files: ignore
Success criteria:
- Must work: lesson pages render full body content in workspace and export
- Must not change: module sequencing and assignment fidelity
```

## Example: Generated Course

```text
Mode: CANVAS
Workflow: generated-course
Project: calm-module-4
Canonical entry: projects/calm-module-4/workspace/index.html
Boundary: selected module surface and related component files only
Source-of-truth constraints:
- Canonical sources: workspace/index.html, workspace/main.jsx, workspace/styles.css
- Runtime/bundle edits: forbidden
- Reference-only files: may read, do not activate without explicit request
Success criteria:
- Must work: improved hierarchy, interaction clarity, and mobile behavior
- Must not change: unrelated modules or export wiring
```

## Example: Injection / Integration

```text
Mode: DEFAULT
Workflow: injection/integration
Project: forensics
Canonical entry: projects/forensics/workspace/assets/module8assignment.html
Boundary: module 8 assignment host surface + injected component sources only
Source-of-truth constraints:
- Canonical sources: host assignment file and declared active component sources
- Runtime/bundle edits: emergency-only
- Reference-only files: keep labeled as reference-only unless explicitly activated
Success criteria:
- Must work: injected activity renders and matches host flow
- Must not change: unrelated modules and shared navigation behavior
```
