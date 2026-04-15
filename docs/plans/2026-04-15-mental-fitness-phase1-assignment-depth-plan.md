# Mental Fitness Phase 1 Assignment Depth Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deepen `Assignment 01: The Engine` so it covers the missing Phase 1 concepts without changing the overall shell structure.

**Architecture:** Keep the current five-station assignment flow and enrich each station with missing concept scaffolding and prompts drawn from the fuller Phase 1 reading. Update the runtime export so the added thinking work appears in the generated report.

**Tech Stack:** Static assignment markup in `workspace/assignment-runtime.html`, client-side runtime state/export logic in `workspace/assignment-runtime-main.js`, existing shared styles in `workspace/styles.css` only if spacing support is needed.

---

### Task 1: Expand the Phase 1 assignment briefing and stations

**Files:**
- Modify: `projects/mentalwellness10-option2/workspace/assignment-runtime.html`

**Steps**

1. Keep the current six-step Phase 1 structure.
2. Add compact concept scaffolding to the briefing.
3. Add missing prompts for stress appraisal, stress sources, IZOF/personal zone, attention faults, and facilitative/debilitative anxiety.
4. Keep the current visual direction and interaction pattern.

### Task 2: Persist the new Phase 1 fields and improve report output

**Files:**
- Modify: `projects/mentalwellness10-option2/workspace/assignment-runtime-main.js`

**Steps**

1. Extend Phase 1 data collection/population for the new fields.
2. Keep save/load behavior working with the expanded schema.
3. Update the generated report to include the new mastery details.

### Task 3: Keep the shell stable

**Files:**
- Optional modify: `projects/mentalwellness10-option2/workspace/styles.css`

**Steps**

1. Only add styles if the new cards/fields need spacing support.
2. Do not redesign the runtime.

### Task 4: Manual preview handoff

**Files:**
- No additional code files

**Steps**

1. Hand off with checks for:
   - `Assignment 01` step flow
   - backup/load still usable
   - generated report reflects the new inputs
2. No automated validation unless explicitly requested.
