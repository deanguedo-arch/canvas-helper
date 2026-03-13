# HSS1010 Conversion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert HSS1010 from a monolithic HTML page into a section-tab, data-driven course and assessment flow with source mapping and coverage audit outputs.

**Architecture:** Add conversion modules in `scripts/lib/conversion/` that extract structured models from legacy HTML and source chunks, render tab content from JSON, and emit audit artifacts to project metadata. Keep UI behavior stable while removing hardcoded study/assessment content from `workspace/index.html`.

**Tech Stack:** TypeScript, Node.js, Cheerio, existing script/file helpers, browser runtime JS

---

### Task 1: Add failing tests for extraction and rendering contract

**Files:**
- Create: `scripts/tests/hss1010-conversion.test.ts`
- Test: `scripts/tests/hss1010-conversion.test.ts`

**Step 1: Write the failing test**

Add tests that expect:
- extraction returns section-tab course data and assessment section data from fixture HTML
- source map and coverage report are produced with deterministic keys
- renderer outputs include expected tab ids and question selectors

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: FAIL because conversion helpers do not exist yet.

**Step 3: Write minimal implementation**

Implement conversion modules and orchestrator with just enough logic to satisfy the tests.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add scripts/tests/hss1010-conversion.test.ts scripts/lib/conversion/*
git commit -m "feat(conversion): add hss1010 extraction and render pipeline"
```

### Task 2: Add conversion CLI and script wiring

**Files:**
- Create: `scripts/convert-hss1010.ts`
- Modify: `package.json`

**Step 1: Write the failing test**

Use existing conversion tests to assert orchestrator is callable and writes artifacts.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: FAIL if CLI integration path is missing.

**Step 3: Write minimal implementation**

Add CLI with `--project <slug>` (default `hss1010`) and optional legacy source path override.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add scripts/convert-hss1010.ts package.json
git commit -m "feat(conversion): add hss1010 conversion command"
```

### Task 3: Generate HSS1010 artifacts and runtime shell

**Files:**
- Modify: `projects/hss1010/workspace/index.html`
- Modify: `projects/hss1010/workspace/main.js`
- Create: `projects/hss1010/workspace/data/course.json`
- Create: `projects/hss1010/workspace/data/assessment.json`
- Create: `projects/hss1010/meta/course.json`
- Create: `projects/hss1010/meta/assessment.json`
- Create: `projects/hss1010/meta/source-map.json`
- Create: `projects/hss1010/meta/coverage-report.json`

**Step 1: Run conversion command**

Run: `npm.cmd run convert:hss1010 -- --project hss1010`
Expected: JSON artifacts + data-driven workspace files are generated.

**Step 2: Verify output files**

Confirm files exist and include generated timestamps, section ids, and block traces.

**Step 3: Run targeted tests**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: PASS.

**Step 4: Commit**

```bash
git add projects/hss1010/workspace projects/hss1010/meta
git commit -m "refactor(hss1010): render section tabs from structured course and assessment models"
```

### Task 4: Add coverage docs and validate

**Files:**
- Create: `docs/coverage-audit.md`
- Create: `docs/conversion-plan.md`

**Step 1: Document audit outputs**

Document where the coverage report is generated and how unresolved blocks/figures are tracked.

**Step 2: Run verification floor for touched area**

Run:
- `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
- `npm.cmd run typecheck`

Expected: PASS.

**Step 3: Commit**

```bash
git add docs/coverage-audit.md docs/conversion-plan.md
git commit -m "docs(ops): add hss1010 conversion and coverage audit guidance"
```

