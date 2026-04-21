# Forensic Studies Option 2 Theme Pass Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Retheme `projects/forensicstudiesoption2` so it adopts the darker forensic style guide colors, typography, buttons, and surface accents without changing the current menus, labels, navigation, or content.

**Architecture:** Keep the existing option-2 shell structure and data model intact. Apply the new visual language through CSS tokens, shared component selectors, and minimal HTML font-loading updates in the workspace shell and generated chapter-page stylesheet. Do not touch the embedded assignment runtimes in this pass.

**Tech Stack:** Static HTML, CSS, browser-side JavaScript, targeted Node `tsx` tests.

---

### Task 1: Lock the theme contract with tests

**Files:**
- Create: `scripts/tests/forensicstudiesoption2-theme.test.ts`
- Test: `projects/forensicstudiesoption2/workspace/index.html`
- Test: `projects/forensicstudiesoption2/workspace/styles.css`
- Test: `projects/forensicstudiesoption2/workspace/content/module-index.css`

**Step 1: Write the failing test**

Add a test that asserts:
- `index.html` loads `Space Grotesk`, `Inter`, and `Noto Serif`
- `styles.css` contains the new dark theme tokens and forensic accent colors
- `module-index.css` uses the same dark palette and shared typography direction

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-theme.test.ts`
Expected: FAIL because the current shell still uses the light editorial theme.

### Task 2: Retheme the workspace shell

**Files:**
- Modify: `projects/forensicstudiesoption2/workspace/index.html`
- Modify: `projects/forensicstudiesoption2/workspace/styles.css`
- Modify: `projects/forensicstudiesoption2/workspace/main.js` only if a theme hook is required

**Step 1: Update font loading**

Load the approved type families while preserving the current shell markup and menu labels.

**Step 2: Replace the shell tokens and component styling**

Retheme:
- body/background/grid treatment
- sidebar
- navigation states
- progress shell
- cards and detail surfaces
- buttons
- overlays
- status chips
- quiz and library shells

**Step 3: Keep layout and behavior stable**

Do not rename sections, move menus, or alter runtime behavior.

### Task 3: Retheme generated chapter content pages

**Files:**
- Modify: `projects/forensicstudiesoption2/workspace/content/module-index.css`

**Step 1: Apply the same palette and type system**

Update chapter landing pages so they visually belong to the rethemed shell:
- darker surfaces
- same accent hierarchy
- consistent buttons
- cleaner panel treatments

**Step 2: Keep chapter content structure unchanged**

Do not rewrite chapter copy or generated page structure in this pass.

### Task 4: Verify the pass

**Files:**
- Verify existing files only

**Step 1: Run theme test**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-theme.test.ts`
Expected: PASS

**Step 2: Run existing shell test**

Run: `npx tsx --test scripts/tests/forensicstudiesoption2-shell-behavior.test.ts`
Expected: PASS

**Step 3: Run project verify**

Run: `npm.cmd run verify -- --project forensicstudiesoption2`
Expected: PASS with only existing external font/CDN warnings
