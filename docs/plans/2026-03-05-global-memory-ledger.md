# Global Memory Ledger Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a global runtime memory ledger that automatically learns from accepted project outcomes and feeds relevant prior decisions back into prompt-pack generation.

**Architecture:** Add a new `.runtime/memory-ledger.json` artifact plus a `scripts/lib/memory-ledger.ts` module. Refresh the ledger from existing intelligence and export flows, then surface ranked global memory entries in `prompt-pack.md` without replacing the current pattern-bank system.

**Tech Stack:** TypeScript, Node.js file I/O, existing runtime/prompt-pack pipeline, node:test via `tsx`

---

### Task 1: Add failing memory-ledger tests

**Files:**
- Create: `scripts/tests/memory-ledger.test.ts`

**Step 1: Write the failing test**
- Cover ledger entry extraction from a pattern record.
- Cover deduped reinforcement when the same memory key is observed twice.
- Cover ranking of relevant memory entries for a current project context.
- Cover design-doc extraction producing approved decision entries.

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test scripts/tests/memory-ledger.test.ts`
Expected: FAIL because `scripts/lib/memory-ledger.ts` does not exist yet.

**Step 3: Write minimal implementation**
- Add the smallest possible `memory-ledger.ts` types and functions required by the tests.

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test scripts/tests/memory-ledger.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add scripts/tests/memory-ledger.test.ts scripts/lib/memory-ledger.ts
git commit -m "feat: add global memory ledger core"
```

### Task 2: Wire ledger persistence into runtime intelligence

**Files:**
- Modify: `scripts/lib/types.ts`
- Modify: `scripts/lib/intelligence.ts`
- Modify: `scripts/lib/exporter.ts`
- Modify: `scripts/lib/memory-ledger.ts`

**Step 1: Write the failing test**
- Extend `scripts/tests/memory-ledger.test.ts` to verify intelligence/export refresh paths update reinforcement metadata and approval state correctly.

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test scripts/tests/memory-ledger.test.ts`
Expected: FAIL because intelligence/export flows do not update the ledger yet.

**Step 3: Write minimal implementation**
- Add ledger entry types to `types.ts`.
- Update `refreshProjectIntelligence()` to call ledger refresh using the learned pattern record.
- Update export functions to reinforce approved outcomes.

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test scripts/tests/memory-ledger.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add scripts/lib/types.ts scripts/lib/intelligence.ts scripts/lib/exporter.ts scripts/lib/memory-ledger.ts scripts/tests/memory-ledger.test.ts
git commit -m "feat: refresh global memory ledger from intelligence pipeline"
```

### Task 3: Surface global memory in prompt-pack

**Files:**
- Modify: `scripts/lib/prompt-pack.ts`
- Modify: `scripts/lib/memory-ledger.ts`
- Test: `scripts/tests/memory-ledger.test.ts`

**Step 1: Write the failing test**
- Add coverage for selecting the top relevant memory entries for a project context and formatting them for prompt-pack consumption.

**Step 2: Run test to verify it fails**

Run: `node --import tsx --test scripts/tests/memory-ledger.test.ts`
Expected: FAIL because prompt-pack relevance helpers are missing.

**Step 3: Write minimal implementation**
- Add project-context ranking helpers in `memory-ledger.ts`.
- Render a `Global Memory` section in `prompt-pack.ts` ahead of local pattern matches.

**Step 4: Run test to verify it passes**

Run: `node --import tsx --test scripts/tests/memory-ledger.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add scripts/lib/prompt-pack.ts scripts/lib/memory-ledger.ts scripts/tests/memory-ledger.test.ts
git commit -m "feat: surface global memory in prompt packs"
```

### Task 4: Run full verification

**Files:**
- Modify: none unless fixes are required

**Step 1: Run targeted tests**

Run: `node --import tsx --test scripts/tests/memory-ledger.test.ts`
Expected: PASS.

**Step 2: Run existing regression checks**

Run: `node --import tsx scripts/tests/learning-pipeline-check.ts`
Expected: `learning-pipeline-check: ok`

**Step 3: Run repo verification**

Run: `npm run typecheck`
Expected: PASS.

Run: `npm run build:studio`
Expected: PASS.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add global memory ledger retrieval"
```
