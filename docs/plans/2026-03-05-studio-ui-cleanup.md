# Studio UI Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Simplify Studio so the app presents itself as `Studio`, removes redundant project slug branding, keeps controls open by default with optional collapse, and improves the visual hierarchy of pane controls and toolbars.

**Architecture:** Keep the existing Studio data flow and command endpoints intact. Limit the implementation to React view composition and CSS styling in the Studio app, with minimal logic additions for per-pane control collapse state. Preserve the current reference-resource rendering behavior, including inline PDF rendering and extracted-text access.

**Tech Stack:** React, TypeScript, Vite, CSS, Node test runner with `tsx`

---

### Task 1: Add a small UI state model for pane control collapse

**Files:**
- Modify: `app/studio/src/App.tsx`

**Step 1: Write the failing test**

No existing UI test harness is present for the Studio shell. Skip automated test creation for this view-state-only change and verify through the typed component state plus build checks.

**Step 2: Run test to verify it fails**

Skip. There is no existing component test setup in this repo for `App.tsx`.

**Step 3: Write minimal implementation**

- Add local React state for pane control visibility.
- Default both panes to expanded.
- Add toggle buttons for `Reference` and `Workspace`.

**Step 4: Run verification**

Run: `npm run typecheck`
Expected: PASS

**Step 5: Commit**

```bash
git add app/studio/src/App.tsx
git commit -m "feat: add studio pane control toggles"
```

### Task 2: Remove redundant project slug branding from the top bar

**Files:**
- Modify: `app/studio/src/App.tsx`

**Step 1: Write the failing test**

No UI snapshot test harness exists. Use implementation verification through manual UI inspection after build.

**Step 2: Run test to verify it fails**

Skip. No current automated UI tests cover the Studio top bar.

**Step 3: Write minimal implementation**

- Replace the large project slug heading with a stable app title such as `Local Studio`.
- Remove or reduce any helper text that repeats project identity unnecessarily.
- Keep the project slug only inside selectors.

**Step 4: Run verification**

Run: `npm run build:studio`
Expected: PASS

**Step 5: Commit**

```bash
git add app/studio/src/App.tsx
git commit -m "feat: simplify studio top bar branding"
```

### Task 3: Collapse pane headings and control labels into a quieter hierarchy

**Files:**
- Modify: `app/studio/src/App.tsx`
- Modify: `app/studio/src/styles.css`

**Step 1: Write the failing test**

No visual regression suite exists. Verification will rely on build plus manual inspection.

**Step 2: Run test to verify it fails**

Skip. No automated style assertions exist in the repo.

**Step 3: Write minimal implementation**

- Keep pane titles as `Reference` and `Workspace`.
- Reduce the prominence of kicker labels.
- Remove redundant label noise where functionality is still obvious.
- Keep `Match Workspace` / `Match Reference` as compact utility actions.

**Step 4: Run verification**

Run: `npm run typecheck`
Expected: PASS

**Step 5: Commit**

```bash
git add app/studio/src/App.tsx app/studio/src/styles.css
git commit -m "feat: simplify studio pane headings"
```

### Task 4: Restyle control rows to feel like a compact editing rail

**Files:**
- Modify: `app/studio/src/styles.css`
- Modify: `app/studio/src/App.tsx`

**Step 1: Write the failing test**

No dedicated CSS test setup exists. Use manual inspection after build.

**Step 2: Run test to verify it fails**

Skip. No automated CSS harness is available.

**Step 3: Write minimal implementation**

- Standardize selector heights and spacing.
- Reduce border contrast and padding bulk.
- Align control rows across both panes.
- Style inline actions like `Open Extracted Text` as subtle utility controls.

**Step 4: Run verification**

Run: `npm run build:studio`
Expected: PASS

**Step 5: Commit**

```bash
git add app/studio/src/App.tsx app/studio/src/styles.css
git commit -m "feat: refine studio control row styling"
```

### Task 5: Keep workspace actions compact and output hidden by default

**Files:**
- Modify: `app/studio/src/App.tsx`
- Modify: `app/studio/src/styles.css`

**Step 1: Write the failing test**

No automated test harness covers this toolbar behavior. Use manual verification.

**Step 2: Run test to verify it fails**

Skip. No Studio component tests exist.

**Step 3: Write minimal implementation**

- Keep the command toolbar below the workspace preview.
- Make the toolbar visually tighter.
- Ensure output remains collapsed by default and only expands when requested or on failure.

**Step 4: Run verification**

Run: `npm run typecheck`
Expected: PASS

**Step 5: Commit**

```bash
git add app/studio/src/App.tsx app/studio/src/styles.css
git commit -m "feat: tighten workspace tool rail"
```

### Task 6: Final verification and manual review

**Files:**
- Modify: `app/studio/src/App.tsx`
- Modify: `app/studio/src/styles.css`

**Step 1: Run focused automated checks**

Run: `npm run typecheck`
Expected: PASS

Run: `npm run build:studio`
Expected: PASS

**Step 2: Run manual Studio verification**

Run: `npm run studio -- --host 127.0.0.1 --port 5173`

Verify:
- The top bar shows Studio identity, not the project slug.
- Pane titles read `Reference` and `Workspace`.
- Controls are open by default.
- Each pane can collapse its controls.
- Project names only appear inside selectors.
- Workspace action row still works.
- Reference resource actions remain usable.

**Step 3: Commit**

```bash
git add app/studio/src/App.tsx app/studio/src/styles.css docs/plans/2026-03-05-studio-ui-cleanup-design.md docs/plans/2026-03-05-studio-ui-cleanup.md
git commit -m "docs: add studio ui cleanup design and plan"
```
