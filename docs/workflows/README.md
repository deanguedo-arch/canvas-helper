# Workflow Library

These docs are the stable, repo-native pattern memory for Canvas Helper workflows.

Use them after reading `docs/ops/ACTIVE_HANDOFF.md` and before broad repo discovery when the workflow is known.

## Available Workflow Guides

- `conversion.md`
- `brightspace-shell-template.md`
- `english-30-1-brightspace-unit-replication.md`
- `english-course-factory.md`
- `generated-course.md`
- `injection-integration.md`
- `prompt-contract.md`
- `social-related-issues.md`
- `science-pilot.md`

## High-Use Entry

If the task is D2L/Brightspace migration, start with `conversion.md` and follow its ordered playbook/checklist end-to-end before ad-hoc fixes.

If the task is a new clean local course from a Brightspace ZIP, use `brightspace-shell-template.md` for the reusable Next Step shell pattern before creating a one-off workspace shell.

If the task is another English 30-1 unit shell, read `english-30-1-brightspace-unit-replication.md` immediately after `conversion.md`. That guide carries the current Streetcar, Short Stories, and Othello lessons around Film Room media conversion, text/question banks, Writing Studio activity placement, and SCORM autosave readiness.

If one Brightspace English course must become several profile-specific units, read `english-course-factory.md`. It is the source of truth for archive intake, safe bulk rebuilds, activity profiles, Evidence Bank persistence, review gates, and individual SCORM packaging.

If a Social Studies 30-1 related issue must be rebuilt from its shared Brightspace export, read `social-related-issues.md`. It is the source of truth for named source resources, checksum verification, and transactional workspace promotion.

If a new Science course needs to begin without prematurely copying an English or Social pattern, read `science-pilot.md`. It is the source of truth for real-source intake, one-unit pilot planning, and evidence-based red-team / green-team review.

## Purpose

This folder is for durable operational patterns, not runtime intelligence artifacts.

- Runtime and local learning still live in `.runtime/` and project prompt packs.
- These workflow docs capture repeatable, high-signal defaults for day-to-day prompting and implementation discipline.
