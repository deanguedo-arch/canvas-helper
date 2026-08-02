# Handoff

- Project: `repo-wide`
- Task: Replace automatic Studio context stacking with bounded, source-aware generation and a fail-closed write gate.
- Status: complete

## Summary

- Replaced the Generative Panel's default whole-blueprint and whole-resource-catalog injection with an empty-by-default typed evidence field.
- The server now accepts at most eight exact `unit:`, `outcome:`, `resource:`, or `lesson:` IDs and rejects automatic context above 16,000 UTF-8 bytes.
- Added an independent doctor-backed write gate before model work and again before filesystem writes. Only a passing `direct-workspace-v1` project may write, and only to exact declared canonical workspace files.
- English factory and proposal-only projects are intentionally blocked from automatic writes so their owning recipe/rebuild flow remains authoritative.
- Across three real direct projects, default context fell from 86,530 to 1,422 bytes, 461,499 to 1,676 bytes, and 320,241 to 2,896 bytes. The median reduction is 99.1%.

## Files changed

- `app/studio/src/components/GenerativePanel.tsx`
- `app/server/routes/generate.ts`
- `scripts/lib/engine/context-builder.ts`
- `scripts/lib/engine/apply-generation.ts`
- `scripts/lib/course-authoring/context.ts`
- `scripts/tests/generation-context-builder.test.ts`
- `scripts/tests/apply-generation.test.ts`
- `package.json`
- `README.md`
- `ARCHITECTURE.md`
- `docs/ops/FAST_PATHS.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed

- The Studio panel now sends a compact source contract by default. Operators may add only typed, stable evidence IDs; no full catalog, blueprint, or lesson-packet directory is automatically stacked.
- Selected evidence is projected to safe, useful fields; host-machine `originalPath` and lesson `packetPath` values are never sent.
- A hard cap rejects, rather than truncates, a multibyte context over 16,000 UTF-8 bytes.
- Generated markdown blocks are parsed and fully validated before any write. Traversal, raw, exports, non-workspace, unknown, duplicated, and symlink-escaping targets are rejected.
- Legacy absolute manifest paths remain normalized in memory only. No manifest rewrite occurs.
- The server checks write eligibility before calling a model, preventing wasted model tokens for English factory and proposal-only work.

## Why this changed

- Default catalog stacking was sending up to hundreds of kilobytes of unnecessary context and made ordinary course work expensive and unfocused.
- Generated output needed to respect the same canonical-source and protected-zone rules as a human editor.
- Recipe-driven English units must continue through their existing factory rebuild boundary rather than patching generated workspace output.

## Source of truth

- Project ownership and canonical target policy: `projects/<slug>/meta/project.json`, inspected by `scripts/lib/course-authoring/context.ts`.
- Compact generation context: `scripts/lib/engine/context-builder.ts`.
- Automatic write policy: `scripts/lib/engine/apply-generation.ts`.
- Studio request surface: `app/studio/src/components/GenerativePanel.tsx` and `app/server/routes/generate.ts`.
- Course workspace files remain canonical only when their project manifest declares them. Do not edit `projects/<slug>/raw/**` or `projects/<slug>/exports/**`.

## Verification run

- `npm run test:metadata-policy`: 29 passed, including context IDs, byte cap, traversal, raw/exports, symlink, legacy-path, and factory/proposal-only write-gate cases.
- `npm run build:studio`: passed.
- `npm run test:e2e:smoke`: 1 passed.
- `npm run test:e2e:project -- --project forensics35`: 1 passed.
- `npm run test:exports`: passed: SCORM 19/19, Google-hosted 16/16, Apps Script 20/20.
- `npm run typecheck`: still reports only the known unrelated legacy ELA, Forensics, Social, and English-builder baseline errors; no touched-file error was reported.
- `git diff --check`: passed.

## Fragile areas / watchouts

- A direct project must have a passing doctor result and exact canonical file entries before the automatic writer can run.
- The automatic writer deliberately cannot create a new workspace file; declare a canonical source first or use the owning project workflow.
- English-factory and proposal-only projects are blocked by design. Do not bypass this by adding their generated `workspace/index.html` to an allowlist.
- Optional evidence IDs must be exact and typed. Unknown IDs, duplicates, or more than eight are rejected.
- The 16,000-byte cap is a hard failure to avoid silent loss of selected evidence.

## Next prompt should assume

- Branch: `codex/context-safety-core`.
- The source-contract foundation and bounded-context/write-gate follow-up are committed on this branch; inspect `git status --short --branch` before beginning a follow-up.
- Ordinary course generation should begin with no optional evidence IDs, then add only the specific unit, outcome, resource, or lesson ID needed.
- The active source of truth is manifest-driven workspace editing; raw and exports remain protected.

## What still needs validation

- Perform one authenticated Studio generation against a real direct project after choosing an actual provider/API key, then inspect the returned changed-file list before accepting the content.
- Decide whether a future read-only ID picker is worthwhile; the current first pass intentionally keeps selection manual and surgical.

## Known risks

- Repository-wide `npm run typecheck` remains blocked by pre-existing unrelated errors outside this change.
- Existing Studio provider names/models were intentionally not changed; this task changes context and write safety, not provider selection.
- A malformed model response with no canonical file block now fails rather than pretending to apply a no-op.

## Exact next command

`npm run studio:codex:session -- --no-headroom`

## Exact next file to open

`scripts/lib/engine/context-builder.ts`

## Do not do next / warnings

- Do not restore automatic whole-blueprint or whole-resource-catalog context injection.
- Do not weaken the byte cap by silently truncating selected evidence.
- Do not allow direct writes to raw, exports, undeclared workspace paths, factory output, or recipe projects without an explicit owner-aware driver.
