# Practice Engine Roadmap Design

**Date:** 2026-03-14
**Status:** Back Burner
**Owner:** deanguedo + agent

## Goal
Evolve Canvas Helper from an observational pattern-retrieval system into a governed best-practice engine that can distinguish reusable quality from repeated noise.

## Current Reality
Today the intelligence layer is strong at deterministic retrieval:
- project signal extraction (`learnProjectPatterns`)
- local library/index refresh (`rebuildPatternBankIndex`)
- overlap-based match retrieval (`findPatternMatches`)
- automatic refresh on `import`, `analyze`, and `refs`

This is useful and reliable, but mostly descriptive. It primarily learns resemblance, not quality.

## Target State
The system should support two separate lanes:

1. Observational lane
- captures what was seen in projects
- keeps deterministic extraction/indexing
- remains non-authoritative

2. Best-practice lane
- stores promoted patterns with rationale and evidence
- tracks whether reused guidance produced good outcomes
- becomes the authoritative recommendation layer

## Success Criteria
A pattern is considered a best practice only when:
- it is promoted from observed -> approved with explicit rationale
- it has usage outcomes attached (accepted, light edit, heavy edit, rejected)
- ranking favors proven outcomes, not raw frequency
- prompt-pack and generation can distinguish approved guidance from raw similarity matches

## Proposed Data Model

### 1) Observed Patterns (existing lane, formalized)
Store raw extracted signals and provenance.

Suggested fields:
- `id`
- `projectSlug`
- `source` (`import|analyze|refs|manual`)
- `signals` (sections, heading keywords, style tokens, colors, dependencies, reference kinds)
- `capturedAt`
- `extractorVersion`
- `trust` (`auto|curated`)

### 2) Approved Practices (new authoritative lane)
Store human-approved reusable guidance.

Suggested fields:
- `id`
- `title`
- `intent`
- `scope` (`layout|interaction|source-support|tone|assessment|other`)
- `ruleType` (`require|prefer|avoid`)
- `rationale`
- `evidenceRefs` (pattern IDs, file refs, prior projects)
- `owner`
- `status` (`active|deprecated|experimental`)
- `createdAt`
- `updatedAt`
- `version`

### 3) Promotion Log
Audit trail for observed -> approved lifecycle.

Suggested fields:
- `id`
- `observedPatternIds[]`
- `approvedPracticeId`
- `action` (`promote|revise|deprecate|rollback`)
- `reason`
- `actor`
- `timestamp`

### 4) Usage Outcomes
Outcome telemetry for practice usefulness.

Suggested fields:
- `id`
- `projectSlug`
- `approvedPracticeIds[]`
- `surface` (`workspace|conversion|export`)
- `outcome` (`accepted|light_edit|heavy_edit|rejected`)
- `notes`
- `recordedAt`

## Ranking Direction (v2)
Move from overlap-only scoring to blended scoring:
- relevance score: current overlap/similarity
- quality score: usage outcome weighting
- governance score: approval state + recency + owner trust
- confidence score: evidence breadth (single project vs cross-project)

Final rank = weighted blend of the above. Keep deterministic calculation.

## Pipeline Changes

### Collection
Keep automatic refresh on `import`, `analyze`, `refs`, but version extractor output and validate schema consistency.

### Application
Prompt packs should render sections in this order:
1. Approved Practices (authoritative)
2. Relevant Observed Matches (supporting context)
3. Raw References (fallback only)

### Feedback
Add lightweight post-use logging hook when patterns/practices are applied.

## Implementation Phases

### Phase 1: Vocabulary + Schema Split
- Separate observed vs approved storage contracts
- Add promotion log and usage outcome schemas
- Keep current behavior unchanged

### Phase 2: Governance Workflow
- Add promote/revise/deprecate CLI ops
- Require rationale + evidence on promotion
- Block “best-practice” labeling unless approved

### Phase 3: Outcome-Aware Ranking
- Add usage outcome writer
- Blend ranking with outcome signals
- Expose confidence in prompt-pack output

### Phase 4: Extraction Hardening
- Reduce dependence on style-guide markdown prefixes
- parse from project/workspace artifacts when possible
- add extractor consistency tests

## Verification Plan
Minimum checks when implementation starts:
- targeted intelligence tests for schema and lifecycle
- regression tests for import/analyze/refs auto-refresh
- prompt-pack tests verifying approved-first ordering
- `npm.cmd run typecheck`
- `npm.cmd run build:studio`

## Risks
- silent degradation if extractor formats drift
- low-signal early outcome data can bias ranking
- overfitting to a narrow set of projects if promotion is too permissive

## Guardrails
- do not remove current observational pipeline while introducing governance
- keep lane separation explicit in naming and docs
- do not call something “best practice” unless promoted

## Back Burner Resume Checklist
When resuming this roadmap:
1. Review this file and `scripts/lib/intelligence/**` current contracts.
2. Decide storage artifact locations for `approved-practices` and `usage-outcomes`.
3. Implement Phase 1 only, with tests, before any ranking changes.
4. Update `README.md` and `ARCHITECTURE.md` language from “learning best practices” to “observed patterns + approved practices”.

## First Re-entry Command
`rg -n "learnProjectPatterns|findPatternMatches|refreshProjectIntelligence|prompt-pack" scripts/lib`

## First Re-entry File
`scripts/lib/intelligence.ts`
