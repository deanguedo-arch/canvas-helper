# Coverage Audit (HSS1010)

## Purpose

The conversion pipeline now writes a deterministic coverage artifact so we can see what was converted versus what still depends on source references.

## Generated Artifacts

For `hss1010`, conversion writes:

- `projects/hss1010/meta/course.json`
- `projects/hss1010/meta/assessment.json`
- `projects/hss1010/meta/source-map.json`
- `projects/hss1010/meta/coverage-report.json`
- `projects/hss1010/workspace/data/course.json`
- `projects/hss1010/workspace/data/assessment.json`

## Run Command

```bash
npm.cmd run convert:hss1010 -- --project hss1010
```

## Coverage Fields

`coverage-report.json` includes:

- `sourcePagesTotal`
- `sourcePagesCovered`
- `sourcePagesUncovered`
- `sourceBlocksTotal`
- `convertedBlocks`
- `placeholderBlocks`
- `unresolvedBlocks`
- `unresolvedChunkIds`
- `pendingFigures`
- `sections[]` per-section block and page coverage

## Interpretation

- `placeholderBlocks` and `pendingFigures` indicate source visuals/references that are represented but not fully rebuilt.
- `sourcePagesUncovered` and `unresolvedChunkIds` indicate pages/chunks that need additional block extraction or mapping improvements.
- Coverage is a QA signal, not a completion claim.

