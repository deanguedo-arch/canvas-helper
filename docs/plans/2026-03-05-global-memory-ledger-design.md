# Global Memory Ledger Design

**Date:** 2026-03-05

## Goal
Build a global, automatic memory layer that learns from accepted project outcomes across imports, workspace analysis, references, exports, and approved design/code artifacts so future prompt packs bias toward what the user actually keeps.

## Problem
The current system learns project-local structure through manifests, pattern-bank profiles, and prompt-pack generation. That is useful, but it does not accumulate durable global knowledge about:
- recurring style directions the user keeps approving
- tools and preview/export behaviors that survive into the repo
- reusable patterns that show up in accepted workspace code
- decisions captured in approved design docs that came from chat
- successful outcomes reinforced by export cycles

As a result, future work still depends too much on short-term conversation context.

## Constraints
- No changes in `projects/**`.
- Keep Studio as the shell; learning belongs in the scripts/runtime pipeline.
- No new dependencies.
- First version should be automatic and low-friction.
- Chat learning must be inferred from approved outcomes, not raw transcript storage.

## Architecture
Add a new global runtime artifact: `.runtime/memory-ledger.json`.

The ledger is separate from per-project manifests and local pattern-bank records. It aggregates reusable memory across all projects and approved docs. Existing project intelligence stays in place:
- project manifest remains the per-project source of truth
- pattern bank remains the main structural/style similarity system
- prompt-pack remains the primary retrieval bundle

The ledger augments this by storing compact, reinforced memory entries and feeding the most relevant ones back into prompt-pack generation.

## Memory Model
Each ledger entry is a small structured record:
- `kind`: `style | component | tool | resource | decision`
- `key`: stable normalized identifier
- `summary`: short readable rule or capability summary
- `signals`: extracted tokens used for retrieval
- `origins`: where and how the entry was reinforced
- `projectSlugs`: projects associated with the entry
- `reinforcementCount`: how often it has been re-observed in accepted outcomes
- `lastSeenAt`: latest reinforcement timestamp
- `confidence`: `low | medium | high`
- `approved`: whether the entry came from accepted repo artifacts or approved docs

The first version learns from these evidence sources:
- project manifest metadata
- pattern-bank records produced by `learnProjectPatterns()`
- exports that indicate a surviving workspace outcome
- approved design docs in `docs/plans/*-design.md`

It does not attempt to persist raw chat transcript text.

## Learning Flow
The ledger is updated automatically during existing workflows:
- `import`: seeds source/tool/resource memory from the imported project and resulting pattern record
- `analyze`: reinforces structure/style/component memory from workspace-derived signals
- `refs`: reinforces resource memory from reference kinds and extracted artifacts
- `export`: reinforces approval memory from outcomes that were good enough to package/export

Approved chat decisions become learnable when they survive as one of:
- approved design docs in `docs/plans`
- accepted code in allowed zones
- repeated analyze/export cycles that keep the same direction alive

## Retrieval And Ranking
Prompt-pack generation should continue to output project-local manifest, sections, style guide, import log, pattern matches, and references.

Add a new `Global Memory` section ahead of local pattern matches. It surfaces the top relevant ledger entries for the current project by comparing:
- section labels and heading keywords
- style tokens and color usage
- external dependencies
- reference kinds
- project learning source/trust
- reinforcement count, recency, and approval state

Ranking should favor:
- reinforced entries across multiple accepted runs
- entries associated with `workspace` and `export`
- recent entries
- approved design-doc entries
- entries seen across multiple projects

## Scope For First Implementation
Included:
- global ledger schema and persistence
- automatic refresh during intelligence cycles
- export reinforcement
- prompt-pack `Global Memory` rendering
- tests for extraction, dedupe, and ranking

Excluded:
- raw transcript parsing
- Studio UI for inspecting the ledger
- new databases or dependencies
- replacing existing pattern-bank scoring

## Expected Outcome
After this change, repeated accepted work should become durable global guidance. Future prompt-pack generation will surface relevant prior decisions, tools, and style directions automatically, improving consistency and reducing re-discovery across sessions and imports.
