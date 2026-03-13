# Authoring Preference Enforcement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enforce user-approved authoring preferences across conversion/export/deploy with fail-fast deviations, explicit override controls, and preference auto-learning.

**Architecture:** Add a typed preference resolver and a reusable deviation gate, then wire that gate into conversion/export/deploy paths. Keep the gate deterministic and report-driven, with controlled override flags that can persist accepted changes back into repo/project preference files.

**Tech Stack:** TypeScript, Node.js filesystem I/O, existing CLI/parser/export/conversion pipeline, node:test via `tsx`.

---

### Task 1: Add failing tests for preference resolution precedence

**Files:**
- Modify: `scripts/tests/intelligence-policy.test.ts`
- Create: `scripts/tests/authoring-preferences.test.ts`
- Create: `config/authoring-preferences.json`

**Step 1: Write the failing test**

Add tests that require:
- repo-level preferences load when only `config/authoring-preferences.json` exists
- project-level overrides merge on top
- benchmark defaults are applied when selected and not overridden
- CLI overrides win over all other sources

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/authoring-preferences.test.ts`
Expected: FAIL because authoring preference resolver does not exist yet.

**Step 3: Write minimal implementation**

Create:
- `scripts/lib/intelligence/config/authoring-preferences.ts`

Add:
- loader for repo file, project override, benchmark defaults
- deterministic merge logic with strict precedence

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/authoring-preferences.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add config/authoring-preferences.json scripts/tests/authoring-preferences.test.ts scripts/lib/intelligence/config/authoring-preferences.ts
git commit -m "feat(intelligence): add authoring preference resolver with precedence"
```

### Task 2: Add failing tests for deviation gate and report output

**Files:**
- Create: `scripts/tests/deviation-gate.test.ts`
- Create: `scripts/lib/intelligence/apply/deviation-gate.ts`
- Modify: `scripts/lib/types.ts`

**Step 1: Write the failing test**

Add tests that require:
- gate fails on blocking rule violations
- gate returns structured deviations (`ruleId`, `location`, `why`, `evidence`)
- gate writes `deviation-report.json` and `deviation-report.md`
- pass case returns no blocking deviations

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/deviation-gate.test.ts`
Expected: FAIL because gate and types do not exist.

**Step 3: Write minimal implementation**

Add:
- authoring preference and deviation types to `scripts/lib/types.ts`
- gate and report writer in `scripts/lib/intelligence/apply/deviation-gate.ts`

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/deviation-gate.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/types.ts scripts/lib/intelligence/apply/deviation-gate.ts scripts/tests/deviation-gate.test.ts
git commit -m "feat(intelligence): add fail-fast deviation gate and report output"
```

### Task 3: Add failing tests for override + preference learning behavior

**Files:**
- Modify: `scripts/tests/deviation-gate.test.ts`
- Modify: `scripts/lib/intelligence/config/authoring-preferences.ts`
- Modify: `scripts/lib/intelligence/apply/deviation-gate.ts`

**Step 1: Write the failing test**

Add tests that require:
- `--accept-deviations` bypasses selected blocking rule IDs
- `--update-preferences` persists accepted rule changes
- default scope is `repo`, optional `project` scope updates project file
- missing `--because` with override fails

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/deviation-gate.test.ts`
Expected: FAIL for override persistence and validation rules.

**Step 3: Write minimal implementation**

Add:
- override handling helpers
- acceptance metadata persistence
- scope-aware preference update writer

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/deviation-gate.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/intelligence/config/authoring-preferences.ts scripts/lib/intelligence/apply/deviation-gate.ts scripts/tests/deviation-gate.test.ts
git commit -m "feat(intelligence): persist accepted deviations to authoring preferences"
```

### Task 4: Wire conversion path with fail-fast enforcement

**Files:**
- Modify: `scripts/tests/hss1010-conversion.test.ts`
- Modify: `scripts/convert-hss1010.ts`
- Modify: `scripts/lib/conversion/hss1010.ts`

**Step 1: Write the failing test**

Add tests that require:
- conversion fails when blocking deviations exist
- conversion can proceed with explicit accepted deviations and reason
- deviation report is produced in project meta

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: FAIL because conversion path does not invoke gate.

**Step 3: Write minimal implementation**

Add:
- CLI flags parsing in `scripts/convert-hss1010.ts`
- gate invocation in `convertHss1010Project(...)`

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/convert-hss1010.ts scripts/lib/conversion/hss1010.ts scripts/tests/hss1010-conversion.test.ts
git commit -m "feat(conversion): enforce authoring preference gate in hss1010 conversion"
```

### Task 5: Wire export paths with fail-fast enforcement

**Files:**
- Modify: `scripts/tests/google-hosted-export.test.ts`
- Modify: `scripts/lib/exports/google-hosted.ts`
- Modify: `scripts/lib/exports/brightspace.ts`
- Modify: `scripts/lib/exports/scorm-package.ts`
- Modify: `scripts/lib/exports/single-html.ts`
- Modify: `scripts/export-google-hosted.ts`
- Modify: `scripts/export-brightspace.ts`
- Modify: `scripts/export-html.ts`
- Modify: `scripts/export-scorm.ts`

**Step 1: Write the failing test**

Add tests that require:
- export command fails if deviations are blocking
- export commands honor override flags and update-preferences behavior
- existing export behavior remains unchanged when no deviations

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts`
Expected: FAIL because exporters do not run preference gate yet.

**Step 3: Write minimal implementation**

Add:
- shared export preflight helper that runs deviation gate
- CLI flag plumbing for all export command scripts

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/exports/google-hosted.ts scripts/lib/exports/brightspace.ts scripts/lib/exports/scorm-package.ts scripts/lib/exports/single-html.ts scripts/export-google-hosted.ts scripts/export-brightspace.ts scripts/export-html.ts scripts/export-scorm.ts scripts/tests/google-hosted-export.test.ts
git commit -m "feat(exports): add authoring preference preflight gate"
```

### Task 6: Wire deploy precheck and update deploy CLI

**Files:**
- Modify: `scripts/deploy-google-hosted.ts`
- Modify: `scripts/lib/google-hosted-deploy.ts` (if needed for context checks)

**Step 1: Write the failing test**

Add/extend tests requiring deploy to fail when latest report has blocking deviations for selected slug(s), unless explicit override is provided.

**Step 2: Run test to verify it fails**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts`
Expected: FAIL for deploy precheck behavior.

**Step 3: Write minimal implementation**

Add deploy precheck against deviation report(s) before running Firebase commands.

**Step 4: Run test to verify it passes**

Run: `npx tsx --test scripts/tests/google-hosted-export.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/deploy-google-hosted.ts scripts/lib/google-hosted-deploy.ts scripts/tests/google-hosted-export.test.ts
git commit -m "feat(deploy): enforce deviation precheck before firebase deploy"
```

### Task 7: Documentation and verification floor

**Files:**
- Modify: `README.md`
- Modify: `ARCHITECTURE.md`
- Modify: `CONTRIBUTING.md`
- Modify: `docs/ops/ACTIVE_HANDOFF.md`

**Step 1: Update docs**

Document:
- new preference files and precedence
- new flags (`--accept-deviations`, `--because`, `--update-preferences`, `--preference-scope`)
- fail-fast default behavior and override workflow

**Step 2: Run full verification**

Run:
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`
- `npx tsx --test scripts/tests/authoring-preferences.test.ts`
- `npx tsx --test scripts/tests/deviation-gate.test.ts`
- `npx tsx --test scripts/tests/hss1010-conversion.test.ts`
- `npx tsx --test scripts/tests/google-hosted-export.test.ts`

Expected: all pass.

**Step 3: Commit**

```bash
git add README.md ARCHITECTURE.md CONTRIBUTING.md docs/ops/ACTIVE_HANDOFF.md
git commit -m "docs(ops): document authoring preference enforcement workflow"
```
