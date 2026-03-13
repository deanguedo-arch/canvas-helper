# HSS1010 Interactive Rebuild Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild HSS1010 into an interactive, lesson-first module where the study tabs teach, practice, and prepare the learner for the assignment rather than displaying page-shaped source supplements.

**Architecture:** Keep the current section-tab shell and runtime persistence, but introduce a new HSS composition layer that reorganizes source chunks into topic packets, lesson sequences, and aligned activities. Build `wellness` as the reference implementation first, then apply the same model to the remaining sections.

**Tech Stack:** TypeScript, Node.js, current conversion pipeline under `scripts/lib/conversion/`, generated HTML/CSS workspace output, current HSS runtime save/report code.

---

### Task 1: Capture the interactive HSS requirements in tests

**Files:**
- Modify: `scripts/tests/hss1010-conversion.test.ts`
- Test: `scripts/tests/hss1010-conversion.test.ts`

**Step 1: Write the failing test**

Add tests that prove the generated study side can support:
- lesson sequences inside a section
- aligned practice/activity panels after lesson content
- saved response fields in study activities
- section-specific patterns like sorters, quick checks, or reflections

Start with `wellness` only.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: FAIL because `hss1010` still renders mostly passive study blocks.

**Step 3: Write minimal implementation**

Do not implement yet; just confirm the failure target is correct.

**Step 4: Run test to verify it still fails for the intended reason**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: FAIL for missing lesson/activity structure, not syntax errors.

**Step 5: Commit**

```bash
git add scripts/tests/hss1010-conversion.test.ts
git commit -m "test(conversion): define hss1010 interactive lesson expectations"
```

### Task 2: Add an HSS outline/composition layer

**Files:**
- Create: `scripts/lib/conversion/hss1010-outline.ts`
- Create: `scripts/lib/conversion/hss1010-compose.ts`
- Modify: `scripts/lib/conversion/types.ts`
- Test: `scripts/tests/hss1010-conversion.test.ts`

**Step 1: Write the failing test**

Add tests showing that raw HSS section blocks and source chunks can be reorganized into:
- topic packets
- lesson sequences
- activity slots

Use `wellness` test data first.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: FAIL because no outline/composition modules exist yet.

**Step 3: Write minimal implementation**

Create:
- `hss1010-outline.ts` for section topic definitions
- `hss1010-compose.ts` for mapping existing source + legacy blocks into lesson sequences

Add only the minimum structure needed for `wellness`.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: PASS for the first composition behavior.

**Step 5: Commit**

```bash
git add scripts/lib/conversion/hss1010-outline.ts scripts/lib/conversion/hss1010-compose.ts scripts/lib/conversion/types.ts scripts/tests/hss1010-conversion.test.ts
git commit -m "feat(conversion): add hss1010 outline and composition layer"
```

### Task 3: Build the reusable HSS activity block system

**Files:**
- Create: `scripts/lib/conversion/hss1010-activities.ts`
- Modify: `scripts/lib/conversion/types.ts`
- Test: `scripts/tests/hss1010-conversion.test.ts`

**Step 1: Write the failing test**

Add tests that require activity definitions for:
- sorter / match
- quick-check
- reflection write-in
- scenario choice

For pass one, only `wellness` needs to instantiate them.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: FAIL because the activity model is missing.

**Step 3: Write minimal implementation**

Create `hss1010-activities.ts` and the minimum type support for HSS study activities.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/conversion/hss1010-activities.ts scripts/lib/conversion/types.ts scripts/tests/hss1010-conversion.test.ts
git commit -m "feat(conversion): add hss1010 study activity model"
```

### Task 4: Rebuild Wellness as the reference section

**Files:**
- Modify: `scripts/lib/conversion/hss1010-compose.ts`
- Modify: `scripts/lib/conversion/renderCourse.ts`
- Modify: `scripts/lib/conversion/hss1010.ts`
- Test: `scripts/tests/hss1010-conversion.test.ts`

**Step 1: Write the failing test**

Add tests that require `wellness` to render:
- a study-flow note
- at least two real lesson clusters
- at least one embedded activity panel
- at least one saveable reflection field or response input

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: FAIL because the current `wellness` output is still mostly passive blocks.

**Step 3: Write minimal implementation**

Implement only the `wellness` rebuild:
- definitions lesson
- dimensions lesson + activity
- determinants lesson + activity
- reflection or application bridge

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/conversion/hss1010-compose.ts scripts/lib/conversion/renderCourse.ts scripts/lib/conversion/hss1010.ts scripts/tests/hss1010-conversion.test.ts
git commit -m "feat(conversion): rebuild hss1010 wellness as interactive lesson section"
```

### Task 5: Add runtime support for study-side activity persistence

**Files:**
- Modify: `scripts/lib/conversion/hss1010.ts`
- Modify: `projects/hss1010/workspace/main.js` via regeneration
- Test: `scripts/tests/hss1010-conversion.test.ts`

**Step 1: Write the failing test**

Add tests that require study-side activity fields to render with stable IDs or persistence keys.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: FAIL because the runtime currently only assumes assignment-side forms.

**Step 3: Write minimal implementation**

Update the runtime generation in `hss1010.ts` so study-side activity inputs can save and reload without breaking assignment logic.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/conversion/hss1010.ts scripts/tests/hss1010-conversion.test.ts
git commit -m "feat(conversion): persist hss1010 study-side activity responses"
```

### Task 6: Rebuild Anatomy with system/function interaction

**Files:**
- Modify: `scripts/lib/conversion/hss1010-compose.ts`
- Modify: `scripts/lib/conversion/hss1010-activities.ts`
- Modify: `scripts/lib/conversion/renderCourse.ts`
- Test: `scripts/tests/hss1010-conversion.test.ts`

**Step 1: Write the failing test**

Add anatomy-specific tests for:
- system family lesson groupings
- system/function activity
- terminology or sequence practice

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Implement anatomy composition and aligned activities.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/conversion/hss1010-compose.ts scripts/lib/conversion/hss1010-activities.ts scripts/lib/conversion/renderCourse.ts scripts/tests/hss1010-conversion.test.ts
git commit -m "feat(conversion): rebuild hss1010 anatomy as interactive lesson section"
```

### Task 7: Rebuild Lifestyle around decision-making and consumer application

**Files:**
- Modify: `scripts/lib/conversion/hss1010-compose.ts`
- Modify: `scripts/lib/conversion/hss1010-activities.ts`
- Modify: `scripts/lib/conversion/renderCourse.ts`
- Test: `scripts/tests/hss1010-conversion.test.ts`

**Step 1: Write the failing test**

Add lifestyle-specific tests for:
- myth/fact or choice-analysis activities
- consumer-health practice panels
- reflection/application block

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Implement lifestyle lesson/activity sequences.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/conversion/hss1010-compose.ts scripts/lib/conversion/hss1010-activities.ts scripts/lib/conversion/renderCourse.ts scripts/tests/hss1010-conversion.test.ts
git commit -m "feat(conversion): rebuild hss1010 lifestyle as applied learning section"
```

### Task 8: Rebuild Public Health around protocol and judgment

**Files:**
- Modify: `scripts/lib/conversion/hss1010-compose.ts`
- Modify: `scripts/lib/conversion/hss1010-activities.ts`
- Modify: `scripts/lib/conversion/renderCourse.ts`
- Test: `scripts/tests/hss1010-conversion.test.ts`

**Step 1: Write the failing test**

Add public-health-specific tests for:
- role sorter
- confidentiality scenario choices
- abuse-reporting sequence or protocol activity
- terminology builder

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Implement public-health lesson/activity sequences.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/conversion/hss1010-compose.ts scripts/lib/conversion/hss1010-activities.ts scripts/lib/conversion/renderCourse.ts scripts/tests/hss1010-conversion.test.ts
git commit -m "feat(conversion): rebuild hss1010 public health as protocol-driven lesson section"
```

### Task 9: Rebuild Start as a true launch/orientation layer

**Files:**
- Modify: `scripts/lib/conversion/hss1010-compose.ts`
- Modify: `scripts/lib/conversion/renderCourse.ts`
- Test: `scripts/tests/hss1010-conversion.test.ts`

**Step 1: Write the failing test**

Add tests that require the `start` tab to:
- explain study flow
- preview what each section will do
- provide source access without dominating the experience

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

Implement the launch/orientation tab composition.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/conversion/hss1010-compose.ts scripts/lib/conversion/renderCourse.ts scripts/tests/hss1010-conversion.test.ts
git commit -m "feat(conversion): rebuild hss1010 start tab as launch layer"
```

### Task 10: Regenerate HSS1010 and verify the real output

**Files:**
- Modify: `projects/hss1010/meta/course.json`
- Modify: `projects/hss1010/meta/source-map.json`
- Modify: `projects/hss1010/meta/coverage-report.json`
- Modify: `projects/hss1010/workspace/index.html`
- Modify: `projects/hss1010/workspace/main.js`
- Modify: `projects/hss1010/workspace/data/course.json`
- Modify: `docs/ops/ACTIVE_HANDOFF.md`

**Step 1: Write the failing test**

No new unit test required. This task validates the real generated artifacts after Tasks 1-9.

**Step 2: Run generation to expose current output**

Run: `npm.cmd run convert:hss1010 -- --project hss1010`
Expected: regenerated output reflects the latest rebuild logic.

**Step 3: Write minimal implementation**

Regenerate HSS1010 and update the active handoff with the new architecture status.

**Step 4: Run verification**

Run:
- `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
- `npm.cmd run convert:hss1010 -- --project hss1010`
- `npm.cmd run typecheck`

Expected:
- all tests pass
- course regenerates successfully
- study tabs now teach, practice, and reflect within the study side
- coverage remains acceptable

**Step 5: Commit**

```bash
git add projects/hss1010/meta/course.json projects/hss1010/meta/source-map.json projects/hss1010/meta/coverage-report.json projects/hss1010/workspace/index.html projects/hss1010/workspace/main.js projects/hss1010/workspace/data/course.json docs/ops/ACTIVE_HANDOFF.md
git commit -m "feat(conversion): rebuild hss1010 as interactive course module"
```
