# Sports Wellness Performance Games Shared Palette Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the four Sports Wellness `Performance` games share the course palette while preserving gameplay readability and existing mechanics.

**Architecture:** Add one shared theme stylesheet under `workspace/performance/` and load it from each standalone game wrapper. Use that stylesheet to remap the common Tailwind chrome to the Sports Wellness palette, then patch only the hardcoded game-surface colors in the four `*.app.js` files where CSS utility overrides are not enough.

**Tech Stack:** Static HTML wrappers, React via browser UMD + Babel, Tailwind CDN utility classes, Node test runner via `tsx --test`

---

### Task 1: Lock the shared palette contract with a failing test

**Files:**
- Modify: `scripts/tests/sportswellness-performance-menu.test.ts`
- Create: `projects/sportswellness/workspace/performance/performance-game-theme.css`

**Step 1: Write the failing test**

- Assert that all four game HTML wrappers load `performance-game-theme.css`.
- Assert that all four wrappers apply a shared theme class on the page body.
- Assert that `performance-game-theme.css` contains the Sports Wellness palette tokens:
  - `--performance-game-bg: #0b111a`
  - `--performance-game-panel: #151b25`
  - `--performance-game-primary: #00ffca`
  - `--performance-game-line: #2a3748`
- Assert that the Phase 3 app no longer contains the old bright court hex colors.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`

Expected: FAIL because the shared theme file and wrapper links do not exist yet, and the old Phase 3 colors are still present.

**Step 3: Write minimal implementation**

- Add the shared theme stylesheet.
- Link it from the four game wrappers.
- Patch the old hardcoded colors that violate the approved palette.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`

Expected: PASS

### Task 2: Add the shared performance-game theme source of truth

**Files:**
- Create: `projects/sportswellness/workspace/performance/performance-game-theme.css`

**Step 1: Define the palette tokens**

- Add CSS custom properties for the shared Sports Wellness palette.
- Set the body/root background, text, panel, line, and primary-action tokens.

**Step 2: Add the utility remapping layer**

- Override the common `zinc`, `lime`, and `cyan` utility classes used by the imported games so their chrome inherits the course palette.
- Preserve semantic red and amber behavior for damage and warning states.

**Step 3: Keep the overrides surgical**

- Scope the overrides under the shared body class so they only affect the performance game pages.
- Avoid touching the parent course shell styles.

### Task 3: Wire the four wrappers to the shared theme

**Files:**
- Modify: `projects/sportswellness/workspace/performance/phase1-performance-state-simulator-game.html`
- Modify: `projects/sportswellness/workspace/performance/phase2-discipline-game.html`
- Modify: `projects/sportswellness/workspace/performance/phase3-focus-game.html`
- Modify: `projects/sportswellness/workspace/performance/phase4-mental-filter-simulator-game.html`

**Step 1: Load the shared stylesheet**

- Add `<link rel="stylesheet" href="./performance-game-theme.css" />` to each page.

**Step 2: Mark the themed root**

- Add the shared body class so the wrapper-level palette overrides apply consistently.

**Step 3: Keep the wrappers simple**

- Retain the existing font and script loading stack.
- Remove only duplicated wrapper colors that are now covered by the shared stylesheet.

### Task 4: Patch per-game hardcoded surface colors

**Files:**
- Modify: `projects/sportswellness/workspace/performance/phase1-performance-state-simulator-game.app.js`
- Modify: `projects/sportswellness/workspace/performance/phase2-discipline-game.app.js`
- Modify: `projects/sportswellness/workspace/performance/phase3-focus-game.app.js`
- Modify: `projects/sportswellness/workspace/performance/phase4-mental-filter-simulator-game.app.js`

**Step 1: Phase 1**

- Replace the hardcoded arena and chart colors with the shared slate/mint palette.

**Step 2: Phase 2**

- Replace the gold/yellow outcome-zone chrome with the shared primary palette while keeping danger states red.

**Step 3: Phase 3**

- Replace the green/orange court colors with Sports Wellness slates and mint hit-zone emphasis.
- Keep the gameplay contrast readable.

**Step 4: Phase 4**

- Replace any remaining hardcoded off-palette background/core colors with the shared slate palette.

### Task 5: Run focused verification and refresh the handoff

**Files:**
- Modify: `docs/ops/ACTIVE_HANDOFF.md`
- Verify: `scripts/tests/sportswellness-performance-menu.test.ts`
- Verify: `projects/sportswellness/workspace/performance/*.html`
- Verify: `projects/sportswellness/workspace/performance/*.app.js`

**Step 1: Run targeted checks**

Run:
- `npx tsx --test scripts/tests/sportswellness-performance-menu.test.ts`
- `npm run test:e2e:project -- --project sportswellness`

Expected: PASS

**Step 2: Record known unrelated failure**

Run: `npx tsx --test scripts/tests/sportswellness-phase3-content.test.ts`

Expected: still FAIL on the pre-existing `Multiple-choice review` expectation in `projects/sportswellness/workspace/main.js`

**Step 3: Update the handoff**

- Replace the active handoff content so the next operator knows the performance games now share the course palette and where the shared theme source lives.

**Step 4: Commit**

```bash
git add docs/plans/2026-04-21-sportswellness-performance-games-shared-palette-design.md docs/plans/2026-04-21-sportswellness-performance-games-shared-palette-implementation.md scripts/tests/sportswellness-performance-menu.test.ts projects/sportswellness/workspace/performance docs/ops/ACTIVE_HANDOFF.md
git commit -m "feat(workspace): unify sportswellness performance game palette"
```
