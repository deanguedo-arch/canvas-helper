# Generation-First Benchmark System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a benchmark registry and recipe library that let Canvas Helper reuse approved project patterns intentionally during generation, then wire `hss1010` to consume the Module 2 workbook benchmark.

**Architecture:** Build a new `scripts/lib/benchmarks/` layer that sits above observational intelligence and below project generators. Registry files define approved benchmarks, recipe files define reusable generation units, project meta selects benchmarks explicitly, and converters resolve benchmark + recipe data before rendering.

**Tech Stack:** TypeScript, Node.js filesystem I/O, existing prompt-pack/intelligence pipeline, `node:test` via `tsx`, current HSS conversion pipeline.

---

### Task 1: Define benchmark types and validation rules

**Files:**
- Create: `scripts/lib/benchmarks/types.ts`
- Create: `scripts/lib/benchmarks/validate.ts`
- Create: `scripts/tests/benchmarks.test.ts`

**Step 1: Write the failing test**

Add tests that require:
- benchmark records to validate required fields
- recipe records to validate required fields
- invalid benchmark records to fail with actionable errors

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/benchmarks.test.ts`
Expected: FAIL because the benchmark modules do not exist yet.

**Step 3: Write minimal implementation**

Create `types.ts` and `validate.ts` with only the types and validators needed for the tests.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/benchmarks.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/benchmarks/types.ts scripts/lib/benchmarks/validate.ts scripts/tests/benchmarks.test.ts
git commit -m "feat(intelligence): add benchmark type validation"
```

### Task 2: Add benchmark registry and recipe loaders

**Files:**
- Create: `scripts/lib/benchmarks/load.ts`
- Create: `scripts/lib/benchmarks/registry/.gitkeep`
- Create: `scripts/lib/benchmarks/recipes/.gitkeep`
- Modify: `scripts/tests/benchmarks.test.ts`

**Step 1: Write the failing test**

Extend tests to require:
- loading a benchmark by id
- loading recipes referenced by a benchmark
- failing cleanly when a file is missing

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/benchmarks.test.ts`
Expected: FAIL because no loader exists yet.

**Step 3: Write minimal implementation**

Create `load.ts` with deterministic JSON loading and validation.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/benchmarks.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/benchmarks/load.ts scripts/lib/benchmarks/registry/.gitkeep scripts/lib/benchmarks/recipes/.gitkeep scripts/tests/benchmarks.test.ts
git commit -m "feat(intelligence): load benchmark registry and recipes"
```

### Task 3: Add project benchmark selection resolution

**Files:**
- Create: `scripts/lib/benchmarks/project-selection.ts`
- Modify: `scripts/lib/paths.ts`
- Modify: `scripts/tests/benchmarks.test.ts`

**Step 1: Write the failing test**

Add tests that require:
- loading `projects/<slug>/meta/benchmark-selection.json`
- resolving fallback behavior when the file is absent
- validating the selected benchmark id

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/benchmarks.test.ts`
Expected: FAIL because project selection is unresolved.

**Step 3: Write minimal implementation**

Create `project-selection.ts` and add any path helpers needed in `paths.ts`.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/benchmarks.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/benchmarks/project-selection.ts scripts/lib/paths.ts scripts/tests/benchmarks.test.ts
git commit -m "feat(intelligence): resolve per-project benchmark selection"
```

### Task 4: Promote Module 2 as the first approved benchmark

**Files:**
- Create: `scripts/lib/benchmarks/registry/calm-module-2-workbook.json`
- Create: `scripts/lib/benchmarks/recipes/lesson-hero.json`
- Create: `scripts/lib/benchmarks/recipes/learn-apply-reflect.json`
- Create: `scripts/lib/benchmarks/recipes/teacher-checkpoint.json`
- Create: `scripts/lib/benchmarks/recipes/source-support-drawer.json`
- Modify: `scripts/tests/benchmarks.test.ts`

**Step 1: Write the failing test**

Add tests that require:
- the Module 2 workbook benchmark to load
- required recipe references to resolve
- source support mode to default to hidden or optional

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/benchmarks.test.ts`
Expected: FAIL because the benchmark files do not exist yet.

**Step 3: Write minimal implementation**

Create the benchmark record and the recipe definitions using the approved Module 2 patterns.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/benchmarks.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/benchmarks/registry/calm-module-2-workbook.json scripts/lib/benchmarks/recipes/lesson-hero.json scripts/lib/benchmarks/recipes/learn-apply-reflect.json scripts/lib/benchmarks/recipes/teacher-checkpoint.json scripts/lib/benchmarks/recipes/source-support-drawer.json scripts/tests/benchmarks.test.ts
git commit -m "feat(intelligence): register module 2 workbook benchmark"
```

### Task 5: Surface benchmark choices in prompt-pack generation

**Files:**
- Modify: `scripts/lib/intelligence/apply/prompt-pack.ts`
- Modify: `scripts/tests/benchmarks.test.ts`

**Step 1: Write the failing test**

Add tests that require prompt-pack output to mention the selected benchmark when a project has `benchmark-selection.json`.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/benchmarks.test.ts`
Expected: FAIL because prompt-pack does not render benchmark context yet.

**Step 3: Write minimal implementation**

Update prompt-pack generation to surface benchmark selection and benchmark summary in the planning context.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/benchmarks.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/intelligence/apply/prompt-pack.ts scripts/tests/benchmarks.test.ts
git commit -m "feat(intelligence): expose benchmark context in prompt packs"
```

### Task 6: Add HSS1010 benchmark selection

**Files:**
- Create: `projects/hss1010/meta/benchmark-selection.json`
- Modify: `scripts/tests/hss1010-conversion.test.ts`

**Step 1: Write the failing test**

Add tests that require the HSS conversion path to resolve the Module 2 workbook benchmark when the selection file exists.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: FAIL because HSS does not use benchmark selection yet.

**Step 3: Write minimal implementation**

Add the benchmark selection file only after the failing test exists.

**Step 4: Run test to verify it still fails for the intended reason**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: FAIL because the converter still ignores the selection.

**Step 5: Commit**

```bash
git add projects/hss1010/meta/benchmark-selection.json scripts/tests/hss1010-conversion.test.ts
git commit -m "test(conversion): require benchmark selection in hss1010"
```

### Task 7: Wire HSS1010 conversion to the benchmark system

**Files:**
- Modify: `scripts/lib/conversion/hss1010.ts`
- Modify: `scripts/lib/conversion/hss1010-compose.ts`
- Modify: `scripts/lib/conversion/renderCourse.ts`
- Modify: `scripts/tests/hss1010-conversion.test.ts`

**Step 1: Write the failing test**

Extend HSS tests so they require:
- benchmark selection resolution
- workbook benchmark surface in the study side
- hidden-by-default source support drawer behavior

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: FAIL because HSS still hardcodes its current composition behavior.

**Step 3: Write minimal implementation**

Update HSS conversion so it resolves the selected benchmark and uses benchmark-driven composition/rendering for `wellness`.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/conversion/hss1010.ts scripts/lib/conversion/hss1010-compose.ts scripts/lib/conversion/renderCourse.ts scripts/tests/hss1010-conversion.test.ts
git commit -m "feat(conversion): drive hss1010 wellness from workbook benchmark"
```

### Task 8: Regenerate HSS1010 and verify benchmark-backed output

**Files:**
- Modify: `projects/hss1010/meta/course.json`
- Modify: `projects/hss1010/meta/source-map.json`
- Modify: `projects/hss1010/meta/coverage-report.json`
- Modify: `projects/hss1010/workspace/index.html`
- Modify: `projects/hss1010/workspace/main.js`
- Modify: `projects/hss1010/workspace/hss-study.css`
- Modify: `projects/hss1010/workspace/data/course.json`
- Modify: `docs/ops/ACTIVE_HANDOFF.md`

**Step 1: Write the failing test**

No new unit test required for this regeneration task.

**Step 2: Run generation to expose current output**

Run: `npm.cmd run convert:hss1010 -- --project hss1010`
Expected: output still reflects the pre-benchmark version.

**Step 3: Write minimal implementation**

Regenerate the project and update the active handoff after the benchmark wiring is complete.

**Step 4: Run verification**

Run:
- `npx tsx --test scripts/tests/benchmarks.test.ts`
- `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
- `npm.cmd run convert:hss1010 -- --project hss1010`
- `npm.cmd run typecheck`

Expected:
- benchmark tests pass
- HSS conversion tests pass
- generated HSS output uses the selected benchmark intentionally
- source support is no longer dominant in the visible lesson flow

**Step 5: Commit**

```bash
git add projects/hss1010/meta/course.json projects/hss1010/meta/source-map.json projects/hss1010/meta/coverage-report.json projects/hss1010/workspace/index.html projects/hss1010/workspace/main.js projects/hss1010/workspace/hss-study.css projects/hss1010/workspace/data/course.json docs/ops/ACTIVE_HANDOFF.md
git commit -m "feat(intelligence): add benchmark-driven generation for hss1010"
```
