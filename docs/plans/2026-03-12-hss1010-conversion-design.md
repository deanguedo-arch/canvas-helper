# HSS1010 Conversion Architecture Design

## Goal

Replace the monolithic `projects/hss1010/workspace/index.html` with a repeatable conversion pipeline that:
- extracts instructional and assessment content into structured JSON
- renders section tabs from data
- preserves current grading/save/report behavior
- emits source mapping and coverage audit artifacts

## Context

Current implementation combines study content, assignment content, persistence, grading, and reporting inside one HTML page plus one runtime script. Study content references an embedded source PDF for visuals. This blocks reuse and makes completeness difficult to verify.

## Options Considered

### Option 1 (recommended): Data-driven tabs + conversion scripts

- Keep the current section-tab UX.
- Convert monolith into structured models:
  - `projects/hss1010/meta/course.json`
  - `projects/hss1010/meta/assessment.json`
  - `projects/hss1010/meta/source-map.json`
  - `projects/hss1010/meta/coverage-report.json`
- Generate a lightweight workspace shell that renders from `workspace/data/*.json`.
- Keep existing save/load/grading/report interactions, but run them against rendered content.

Tradeoff: First pass keeps some blocks as `rawHtml` while building reusable pipeline pieces.

### Option 2: Full manual rewrite into typed blocks only

- Rewrite all content into highly normalized blocks by hand.

Tradeoff: High effort and high drift risk for initial migration.

### Option 3: Keep monolith and add patch scripts

- Keep hardcoded HTML and patch around it.

Tradeoff: Fastest short-term, worst long-term maintainability. No real conversion pipeline.

## Selected Design

Use Option 1 with section tabs.

### Architecture

- Conversion modules under `scripts/lib/conversion/`:
  - `parseSource.ts` for source chunk loading
  - `detectStructures.ts` for block/question classification
  - `normalizeBlocks.ts` for deterministic model extraction
  - `buildSourceMap.ts` for section/block-to-source matching
  - `auditCoverage.ts` for coverage calculations
  - `renderCourse.ts` and `renderAssessment.ts` for HTML fragment rendering
  - `hss1010.ts` orchestrator for the full pipeline
- CLI entrypoint:
  - `scripts/convert-hss1010.ts`

### Data flow

1. Read legacy workspace HTML and extracted PDF chunks.
2. Extract study sections and assessment sections into structured models.
3. Build source map and coverage report from model + chunk matches.
4. Write JSON artifacts to `meta/` and runtime data to `workspace/data/`.
5. Write a data-driven `workspace/index.html` shell and `workspace/main.js` runtime.

### Rendering approach

- Keep tabs (study and assessment) and current visual style.
- Render instructional blocks and assessment questions from JSON.
- Preserve grading selectors (`.auto-grade`, `.cb-grade`) so scoring behavior remains stable.
- Preserve local save/load backup and printable report.

### Figure strategy (pass 1)

- Keep explicit figure/PDF references as structured placeholders when visuals are not rebuilt.
- Include source trace metadata and `conversionStatus` per block.

### Verification

- New targeted test suite for conversion pipeline behavior.
- Run conversion command for `hss1010`.
- Run targeted tests + `npm.cmd run typecheck`.

