# Studio Glass Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply an Apple-like glass visual system across the Studio shell while preserving readability and the recently simplified minimal layout.

**Architecture:** Keep the current Studio structure intact and concentrate the visual pass in CSS with only minimal React changes if a small wrapper or class hook is needed. Treat the shell as layered glass: atmospheric page background, frosted outer panels, lighter inner control rails, and neutral preview interiors.

**Tech Stack:** React, TypeScript, CSS, Vite

---

### Task 1: Create the glass surface token system

**Files:**
- Modify: `app/studio/src/styles.css`

**Step 1: Write the failing test**

No CSS test harness exists. Verification will rely on build and manual visual inspection.

**Step 2: Run test to verify it fails**

Skip. No automated style tests exist for the Studio shell.

**Step 3: Write minimal implementation**

- Add glass-oriented surface variables for fills, borders, and shadow depths.
- Add soft atmospheric background treatment for the body shell.
- Preserve the current warm palette.

**Step 4: Run verification**

Run: `npm run build:studio`
Expected: PASS

**Step 5: Commit**

```bash
git add app/studio/src/styles.css
git commit -m "feat: add studio glass surface tokens"
```

### Task 2: Convert the top bar and pane shells to glass panels

**Files:**
- Modify: `app/studio/src/styles.css`

**Step 1: Write the failing test**

No visual regression harness exists. Use build plus manual review.

**Step 2: Run test to verify it fails**

Skip. No automated Studio style tests exist.

**Step 3: Write minimal implementation**

- Restyle `.topbar`, `.preview-workspace`, `.preview-pane`, and `.panel-card`.
- Add blur, soft highlight borders, and layered shadows.
- Keep the title and controls readable.

**Step 4: Run verification**

Run: `npm run build:studio`
Expected: PASS

**Step 5: Commit**

```bash
git add app/studio/src/styles.css
git commit -m "feat: convert studio shell to glass panels"
```

### Task 3: Refine control rails and utility chips

**Files:**
- Modify: `app/studio/src/styles.css`
- Modify: `app/studio/src/App.tsx`

**Step 1: Write the failing test**

No UI harness exists for control styling. Use manual verification.

**Step 2: Run test to verify it fails**

Skip. No automated tests cover Studio control presentation.

**Step 3: Write minimal implementation**

- Restyle control rows as lighter inner glass rails.
- Tune dropdown, button, and segmented control appearance to feel integrated with the glass system.
- Add or adjust class hooks in React only if the CSS needs more control.

**Step 4: Run verification**

Run: `npm run typecheck`
Expected: PASS

**Step 5: Commit**

```bash
git add app/studio/src/App.tsx app/studio/src/styles.css
git commit -m "feat: refine studio glass control rails"
```

### Task 4: Differentiate preview interior from chrome

**Files:**
- Modify: `app/studio/src/styles.css`

**Step 1: Write the failing test**

No visual regression harness exists. Use manual review after build.

**Step 2: Run test to verify it fails**

Skip. No automated preview style tests exist.

**Step 3: Write minimal implementation**

- Keep outer preview framing glass-like.
- Keep embedded preview surfaces and fallback content more neutral and readable.
- Ensure the actual module content still stands out from the Studio chrome.

**Step 4: Run verification**

Run: `npm run build:studio`
Expected: PASS

**Step 5: Commit**

```bash
git add app/studio/src/styles.css
git commit -m "feat: balance studio glass chrome with neutral previews"
```

### Task 5: Final verification

**Files:**
- Modify: `app/studio/src/styles.css`
- Modify: `app/studio/src/App.tsx`

**Step 1: Run automated checks**

Run: `npm run typecheck`
Expected: PASS

Run: `npm run build:studio`
Expected: PASS

**Step 2: Run manual Studio verification**

Run: `npm run studio -- --host 127.0.0.1 --port 5173`

Verify:
- Top bar, pane shells, control rails, and inspector read as one glass system.
- Controls remain readable and usable.
- Preview content remains visually stronger than Studio chrome.
- The UI still feels minimal rather than ornamental.

**Step 3: Commit**

```bash
git add app/studio/src/App.tsx app/studio/src/styles.css docs/plans/2026-03-05-studio-glass-design.md docs/plans/2026-03-05-studio-glass-plan.md
git commit -m "docs: add studio glass design and plan"
```
