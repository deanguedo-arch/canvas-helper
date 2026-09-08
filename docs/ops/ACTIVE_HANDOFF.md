# Handoff — GitHub consolidation

- Project: repository-wide preservation checkpoint
- Task: Commit and push accumulated work at the user's explicit request.
- Status: prepared for commit/push; remote result is recorded in the task response.

## What changed / files changed
Consolidated all non-ignored project/source/reference work; added exact Git LFS rules for 127 large paths and ignore rules for local runtime/test/temp caches. Added `docs/ops/github-consolidation-2026-09-08.md`. Fixed two type annotations in `scripts/tests/biology30-inline-vocabulary-acceptance.test.ts`; rerun passed. No cleanup, rebuild, deployment, export, or release flag changes.

## Verification run
Studio build and smoke passed. Biology final verification passed. Repository-wide typecheck and two existing provenance expectations fail; see the consolidation record. Large staged assets were verified as LFS pointers. Prior Biology validation handoff is archived.

## Source of truth
Project manifests, canonical owning scripts and resource records remain authoritative. Publication record: `docs/ops/github-consolidation-2026-09-08.md`.

## What still needs validation / known risks
Verify the pushed remote branch matches local HEAD after upload. This is a consolidation checkpoint with recorded test failures, not a release. Teacher acceptance and LMS certification remain outstanding; review ZIPs remain stale. Local caches remain on disk and ignored.

## Fragile areas / watchouts
Do not patch generated Biology workspace HTML or rewrite remote history. Large assets rely on Git LFS. Source changes invalidate prior exact-hash evidence.

## Next prompt should assume
The user authorized this commit and push to the existing branch. Do not merge into main or deploy without a new request. Check remote state before retrying any interrupted upload.

## Exact next command
`git status -sb`

## Exact next file to open
`docs/ops/github-consolidation-2026-09-08.md`
