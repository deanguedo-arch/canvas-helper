# Phase 1 Workflow Ops Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a non-breaking, one-click operating workflow for Canvas Helper with a Windows launcher, preview/handoff notes, and AI prompting standards.

**Architecture:** Keep existing project layout unchanged and add a thin operational layer at repo root and `docs/`. Use a menu-driven `.bat` launcher for local Windows execution, and document a strict daily loop for import, preview, save-log handoff, and export. Provide prompt templates and runbook conventions so the agent behaves consistently across sessions.

**Tech Stack:** Windows batch scripts, npm scripts, Vite studio server, Markdown docs.

---

### Task 1: Plan Skeleton and Folder Baseline

**Files:**
- Create: `docs/plans/2026-03-04-phase-1-workflow-ops.md`
- Create: `docs/ops/README.md`
- Create: `docs/ops/agent-prompt-templates.md`
- Create: `docs/ops/session-checklist.md`

**Step 1: Write the failing test**

Manual expectation test:
- `docs/ops/` does not exist and no operational runbook is present.

**Step 2: Run test to verify it fails**

Run:
```powershell
Get-ChildItem docs\ops
```
Expected:
- Path missing or empty before docs are added.

**Step 3: Write minimal implementation**

- Add runbook docs with:
  - quick-start sequence
  - project handoff checklist
  - prompt templates for common edit intents

**Step 4: Run test to verify it passes**

Run:
```powershell
Get-ChildItem docs\ops
```
Expected:
- `README.md`, `session-checklist.md`, `agent-prompt-templates.md` exist.

**Step 5: Commit**

```bash
git add docs/plans/2026-03-04-phase-1-workflow-ops.md docs/ops/*.md
git commit -m "docs: add phase 1 ops plan and runbook"
```

### Task 2: One-Click Windows Launcher

**Files:**
- Create: `launch-canvas-helper.bat`

**Step 1: Write the failing test**

Manual expectation test:
- No one-click launcher exists at repo root.

**Step 2: Run test to verify it fails**

Run:
```powershell
Test-Path launch-canvas-helper.bat
```
Expected:
- `False` before file creation.

**Step 3: Write minimal implementation**

- Build a menu-driven batch launcher with options:
  - Studio only
  - Import + Analyze + Refs + Studio
  - Export Brightspace
  - Exit
- Always open browser to `http://127.0.0.1:5173`.

**Step 4: Run test to verify it passes**

Run:
```powershell
Test-Path launch-canvas-helper.bat
```
Expected:
- `True`.

Run:
```powershell
Get-Content launch-canvas-helper.bat
```
Expected:
- Contains menu labels and `start "" "http://127.0.0.1:5173"`.

**Step 5: Commit**

```bash
git add launch-canvas-helper.bat
git commit -m "chore: add one-click studio launcher"
```

### Task 3: Preview Note and Handoff Standard

**Files:**
- Create: `docs/ops/preview-note-template.md`
- Modify: `README.md`

**Step 1: Write the failing test**

Manual expectation test:
- No standard preview note template is available.

**Step 2: Run test to verify it fails**

Run:
```powershell
Test-Path docs\ops\preview-note-template.md
```
Expected:
- `False` before file creation.

**Step 3: Write minimal implementation**

- Add a concise preview-note template focused on:
  - selected project slug
  - what changed
  - what to validate in split view
  - next session resume bullets
- Add README section linking launcher + ops docs.

**Step 4: Run test to verify it passes**

Run:
```powershell
Test-Path docs\ops\preview-note-template.md
```
Expected:
- `True`.

Run:
```powershell
rg -n "launcher|ops|preview note|session log" README.md docs/ops
```
Expected:
- Matches showing links and usage details.

**Step 5: Commit**

```bash
git add README.md docs/ops/preview-note-template.md
git commit -m "docs: add preview note template and quick links"
```

### Task 4: Verification Sweep

**Files:**
- Validate only

**Step 1: Write the failing test**

Manual expectation test:
- Tooling may fail if dependencies are not installed.

**Step 2: Run test to verify it fails**

Run:
```powershell
npm.cmd run typecheck
```
Expected:
- Fails if local deps are missing; capture and document this.

**Step 3: Write minimal implementation**

- If missing dependencies, run:
```powershell
npm.cmd install
```
- Re-run typecheck and confirm it passes.

**Step 4: Run test to verify it passes**

Run:
```powershell
npm.cmd run typecheck
```
Expected:
- TypeScript check completes successfully.

**Step 5: Commit**

```bash
git add package-lock.json
git commit -m "chore: install deps for local typecheck"
```

