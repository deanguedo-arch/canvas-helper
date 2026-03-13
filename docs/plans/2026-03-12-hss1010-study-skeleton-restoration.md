# HSS1010 Study Skeleton Restoration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore the original HSS1010 study-tab visual skeleton and flow while keeping the generated course data-driven and source-complete.

**Architecture:** Keep the existing conversion pipeline, but improve block shaping and rendering so each section uses the original HSS1010 presentation vocabulary. Preserve assessment/runtime behavior while making study content feel intentionally designed instead of appended as generic source dumps.

**Tech Stack:** TypeScript, Node.js, Cheerio, existing conversion pipeline under `scripts/lib/conversion/`, generated HTML/CSS workspace output.

---

### Task 1: Lock the restored study-shell expectations in tests

**Files:**
- Modify: `scripts/tests/hss1010-conversion.test.ts`
- Test: `scripts/tests/hss1010-conversion.test.ts`

**Step 1: Write the failing test**

Add assertions that the generated HSS1010 workspace:
- preserves the glass section shell
- keeps original section hero styling
- avoids wrapping the start hero row inside a generic `read-block`
- renders shaped study components like `info-card`, `anatomy-card`, `warning-card`, `term-table`, or `q-box` in study sections
- reduces raw page-supplement labeling dominance

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: FAIL because the current renderer still over-wraps content and outputs generic supplement blocks.

**Step 3: Write minimal implementation**

Update renderer assertions only after the failure is confirmed.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: PASS for the new renderer-shell expectations.

**Step 5: Commit**

```bash
git add scripts/tests/hss1010-conversion.test.ts
git commit -m "test(conversion): lock hss1010 study shell expectations"
```

### Task 2: Restore section-aware rendering and stop generic double-wrapping

**Files:**
- Modify: `scripts/lib/conversion/renderCourse.ts`
- Test: `scripts/tests/hss1010-conversion.test.ts`

**Step 1: Write the failing test**

Use the test from Task 1 to verify that:
- hero rows and rich markup blocks are preserved directly
- section wrappers stay glass-based and high-level only
- only plain text/list/table blocks receive generic wrapping

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: FAIL because `renderCourse.ts` still wraps rich blocks too broadly.

**Step 3: Write minimal implementation**

Adjust `renderCourse.ts` so it:
- detects already-structured blocks and preserves them
- renders richer block groupings with more faithful spacing/layout
- avoids wrapping hero/banner/image-rich HTML in generic `read-block`

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/conversion/renderCourse.ts scripts/tests/hss1010-conversion.test.ts
git commit -m "fix(conversion): restore section-aware hss1010 study rendering"
```

### Task 3: Shape supplements into better instructional patterns

**Files:**
- Modify: `scripts/lib/conversion/hss1010.ts`
- Modify: `scripts/lib/conversion/types.ts`
- Test: `scripts/tests/hss1010-conversion.test.ts`

**Step 1: Write the failing test**

Add tests proving that supplement blocks can render as richer instructional structures instead of only page-dump boxes, for example:
- grouped continuation blocks
- term table style blocks where content is glossary-like
- card-style blocks for short concept clusters
- prompt boxes for question-heavy source material

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: FAIL because supplements currently default to one visual pattern.

**Step 3: Write minimal implementation**

Add light supplement shaping heuristics in `hss1010.ts` using the existing type system where possible, extending `types.ts` only if necessary.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/conversion/hss1010.ts scripts/lib/conversion/types.ts scripts/tests/hss1010-conversion.test.ts
git commit -m "feat(conversion): shape hss1010 source supplements into lesson blocks"
```

### Task 4: Regenerate HSS1010 and verify the restored learning flow

**Files:**
- Modify: `projects/hss1010/meta/course.json`
- Modify: `projects/hss1010/meta/source-map.json`
- Modify: `projects/hss1010/meta/coverage-report.json`
- Modify: `projects/hss1010/workspace/index.html`
- Modify: `projects/hss1010/workspace/data/course.json`
- Modify: `docs/ops/ACTIVE_HANDOFF.md`

**Step 1: Write the failing test**

No new unit test required here; this task verifies the generated output after Tasks 1-3.

**Step 2: Run generation to reveal current behavior**

Run: `npm.cmd run convert:hss1010 -- --project hss1010`
Expected: regenerated output still reflects pre-fix renderer if Tasks 1-3 are not complete.

**Step 3: Write minimal implementation**

Regenerate artifacts after renderer and shaping changes, then update the active handoff with the new status.

**Step 4: Run verification**

Run:
- `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
- `npm.cmd run convert:hss1010 -- --project hss1010`
- `npm.cmd run typecheck`

Expected:
- tests pass
- course regenerates successfully
- study shell looks closer to the original HSS1010 rhythm
- source coverage remains intact

**Step 5: Commit**

```bash
git add projects/hss1010/meta/course.json projects/hss1010/meta/source-map.json projects/hss1010/meta/coverage-report.json projects/hss1010/workspace/index.html projects/hss1010/workspace/data/course.json docs/ops/ACTIVE_HANDOFF.md
git commit -m "feat(conversion): restore hss1010 study skeleton in generated output"
```
