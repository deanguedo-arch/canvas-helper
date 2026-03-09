# Processed Project Recovery Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Studio automatically recover a missing or incomplete `projects/<slug>` project from `projects/processed/<slug>/source` so processed snapshots remain visible and usable.

**Architecture:** Keep `projects/<slug>` as the canonical editable project root, but teach project discovery and bundle loading to self-heal from the processed snapshot when the canonical root is missing required entry artifacts. Recovery re-imports from `projects/processed/<slug>/source`, which preserves the existing importer, analyzer, and resource pipeline instead of creating a second project contract.

**Tech Stack:** TypeScript, Node filesystem utilities, existing import pipeline, `node:test` via `tsx`

---

### Task 1: Add the failing recovery regression test

**Files:**
- Create: `scripts/tests/project-recovery.test.ts`

**Step 1: Write the failing test**

Add a test that creates `projects/processed/<slug>/source/index.html`, leaves `projects/<slug>` absent, calls Studio project discovery, and expects the slug to appear plus the canonical project manifest/workspace files to exist.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/project-recovery.test.ts`
Expected: FAIL because processed-only slugs are not currently discovered or recovered.

**Step 3: Write a second failing test**

Add a partial-project case where `projects/<slug>/meta/project.json` exists but `workspace/index.html` is missing, then call bundle loading and expect the workspace to be rebuilt from the processed snapshot.

**Step 4: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/project-recovery.test.ts`
Expected: FAIL because bundle loading does not currently repair incomplete project roots.

### Task 2: Implement processed snapshot recovery

**Files:**
- Modify: `scripts/lib/projects.ts`

**Step 1: Add recovery helper**

Implement a helper that:
- checks whether the canonical project has the required manifest/raw/workspace entry files
- checks whether `projects/processed/<slug>/source` exists
- dynamically imports `importProject`
- re-imports from the processed snapshot with `force: true`

**Step 2: Hook recovery into project discovery**

Update project slug listing to consider both canonical project roots and processed snapshot slugs, then recover missing canonical projects before filtering the final list.

**Step 3: Hook recovery into bundle loading**

Before reading a Studio project bundle, ensure the project is available and complete so direct project loads also self-heal.

**Step 4: Run tests**

Run: `npx tsx --test scripts/tests/project-recovery.test.ts`
Expected: PASS

### Task 3: Document the intake contract

**Files:**
- Modify: `ARCHITECTURE.md`

**Step 1: Update intake description**

Document that `projects/processed/<slug>/source` remains the latest kept intake snapshot and Studio/project discovery can rebuild a missing canonical project root from that snapshot.

**Step 2: Run the targeted test again**

Run: `npx tsx --test scripts/tests/project-recovery.test.ts`
Expected: PASS
