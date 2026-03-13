# Authoring Preference Enforcement Design

## Context

The current intelligence system collects and applies signals (`pattern-bank`, `memory-ledger`, `prompt-pack`), but it does not enforce authoring decisions as hard constraints during conversion/export/deploy flows. That causes repeated style drift and repeated rework across courses.

## Goal

Add a durable, fail-fast preference enforcement layer that:

1. Resolves global + project + benchmark + CLI preferences deterministically.
2. Validates generated/exported outputs against those preferences.
3. Stops workflows on blocking deviations with a concrete report (`what`, `where`, `why`).
4. Allows intentional overrides that can update preferences for future runs.

## Non-goals

1. Rewriting the full conversion architecture in this pass.
2. Adding heavy NLP/AI inference to validate style.
3. Blocking unrelated commands outside conversion/export/deploy.

## Architecture

### 1) Preference model and precedence

Add a typed `AuthoringPreferences` model and load from:

1. CLI overrides
2. `projects/<slug>/meta/authoring-preferences.json`
3. benchmark defaults (from selected benchmark)
4. `config/authoring-preferences.json`

Add a resolver at:

- `scripts/lib/intelligence/config/authoring-preferences.ts`

### 2) Deviation gate

Add a reusable gate at:

- `scripts/lib/intelligence/apply/deviation-gate.ts`

The gate evaluates generated/exported assets against preference rules and returns:

- pass/fail
- normalized deviations (`ruleId`, `severity`, `location`, `why`, `evidence`)

Reports written to:

- `projects/<slug>/meta/deviation-report.json`
- `projects/<slug>/meta/deviation-report.md`

### 3) Fail-fast policy + override learning

Default behavior:

- any blocking deviation fails command with non-zero exit

Override behavior:

- `--accept-deviations <ruleId|all>`
- `--because "<reason>"`
- `--update-preferences`
- `--preference-scope repo|project` (default `repo`)

If override is used with update, accepted rule deltas are persisted into preference files for future runs.

### 4) Command integration points

Integrate gate in:

- `scripts/lib/conversion/hss1010.ts`
- `scripts/lib/exports/brightspace.ts`
- `scripts/lib/exports/google-hosted.ts`
- `scripts/lib/exports/scorm-package.ts`
- `scripts/lib/exports/single-html.ts`
- `scripts/deploy-google-hosted.ts` precheck

### 5) Seed defaults

Add repo defaults at:

- `config/authoring-preferences.json`

Seed with generation-first principles:

- standalone lesson-first content
- benchmark-aligned interactive structure
- source support as optional layer, not default wall-of-text
- minimum interaction density thresholds

## Data model (initial)

`AuthoringPreferences`:

- `schemaVersion`
- `flow`: benchmark + source-support mode defaults
- `rules.require[]`: required tokens/patterns per surface
- `rules.forbid[]`: forbidden patterns (e.g., source dump blocks)
- `quality`: thresholds (e.g., max long paragraph streak)
- `learning`: persistence behavior for accepted deviations

`Deviation`:

- `ruleId`
- `severity` (`error` | `warn`)
- `surface` (`course-html` | `workspace-runtime` | `export`)
- `location` (file + section/selector if available)
- `why`
- `evidence`

## Testing strategy

Add/extend tests:

1. preference precedence resolution
2. fail-fast gate behavior
3. deviation report generation
4. override + update-preferences persistence
5. export/deploy integration behavior

## Risks and mitigations

1. Overblocking early:
- start with a focused rule set and actionable report copy.

2. False positives:
- include location + evidence snippets and allow explicit acceptance.

3. Preference file churn:
- deterministic write order and schema versioning.

## Rollout

1. Introduce types + resolver + defaults.
2. Add gate and tests.
3. Wire convert/export/deploy paths.
4. Update docs and handoff.
