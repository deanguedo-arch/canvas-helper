# Fast Paths

Use these retrieval shortcuts before broader discovery. The point is to keep agent work surgical.

## Export Target Work

Read first:
- `app/shared/studio-commands.ts`
- `scripts/lib/exporter.ts`
- `scripts/lib/exports/<target>.ts`
- `scripts/lib/<target-runtime>.ts` when the target injects a browser bridge such as `scorm.ts` or `google-hosted.ts`
- the matching CLI script under `scripts/export-*.ts`

Touch docs only if behavior changes:
- `README.md`
- `ARCHITECTURE.md`

Verification floor:
- targeted export test
- `npm run typecheck`

## Studio Command Wiring

Read first:
- `app/shared/studio-commands.ts`
- `app/server/lib/command-runner.ts`
- `app/studio/src/hooks/useProjectCommands.ts`
- `app/studio/src/lib/types.ts`

Do not start by searching the whole repo. The shared command contract is the source of truth.

## Intelligence Policy Work

Read first:
- `scripts/lib/intelligence/config/policy.ts`
- `scripts/lib/intelligence/config/defaults.ts`
- `config/intelligence.json`

Then only open collect/apply modules that are directly affected.

## Import / Refs Work

Read first:
- `scripts/lib/importer.ts`
- `scripts/lib/references.ts`
- `scripts/lib/paths.ts`
- relevant tests in `scripts/tests/`

## Handoff Resume

For repo-wide or multi-project work:
- open `docs/ops/ACTIVE_HANDOFF.md`

For single-project work:
- open `projects/<slug>/meta/HANDOFF.md`
