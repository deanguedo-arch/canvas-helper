# Generation-First Benchmark System Design

## Goal

Turn Canvas Helper's current memory-oriented learning system into a generation-first benchmark system that can reuse approved project patterns intentionally, not just discover them heuristically.

## Problem

The repo already stores useful intelligence:

- prompt packs
- pattern-bank profiles
- memory-ledger entries
- approved example projects

That is enough for human-guided reuse, but it is not enough for deterministic generation. The current system remembers that projects like `calm-module-2-activites-reference` are strong examples, but it does not expose a repo-owned benchmark model that converters or generators can directly consume.

The missing layer is an authoritative reuse system that answers:

- which benchmark should this project inherit from?
- what lesson flow does that benchmark use?
- what activity patterns belong to it?
- how should source support appear?
- what rendering primitives are allowed?

## Outcome

The target state is:

- the repo can register approved benchmark projects explicitly
- each benchmark exposes visual rules, lesson flow rules, and reusable recipes
- projects can select a benchmark intentionally
- generators can consume benchmark assets directly
- prompt packs and intelligence can recommend benchmarks, but generation follows the benchmark registry as the authority

## Recommended Architecture

### 1. Benchmark Registry

Benchmarks are approved project patterns, not raw examples.

Proposed location:

- `scripts/lib/benchmarks/registry/`

Each benchmark record should define:

- `id`
- `label`
- `sourceProjectSlug`
- `status`
- `tags`
- `intendedUse`
- `visualSystem`
- `sectionFlow`
- `activityFamilies`
- `checkpointFamilies`
- `sourceSupportPolicy`
- `recipeRefs`

Example benchmark ids:

- `calm-module-2-workbook`
- `genpsy-lesson-sequence`

### 2. Recipe Library

Recipes are reusable generation units.

Proposed location:

- `scripts/lib/benchmarks/recipes/`

Recipes should represent patterns such as:

- lesson hero
- learn/apply/reflect section shell
- teacher checkpoint
- scenario branch
- sort-and-check
- comparison grid
- source support drawer

Each recipe should define:

- `id`
- `family`
- `inputs`
- `optionalInputs`
- `renderingRules`
- `interactionRules`
- `persistenceRules`
- `constraints`

### 3. Project Benchmark Selection

Projects should explicitly select a benchmark when needed.

Proposed location:

- `projects/<slug>/meta/benchmark-selection.json`

Example fields:

- `benchmarkId`
- `sectionOverrides`
- `sourceSupportMode`
- `activityOverrides`
- `notes`

This selection becomes the project-level hook that generators and converters resolve before building the workspace output.

## Integration With Existing Learning System

The benchmark system should layer on top of current intelligence instead of replacing it.

### Existing layers stay in place

- `pattern-bank`
- `memory-ledger`
- `prompt-pack`
- `resource-catalog`
- `lesson-packets`

### New rule of authority

- `pattern-bank` and `memory-ledger` remain observational
- `benchmark registry` becomes authoritative for generation behavior

This means:

- the repo can still discover strong examples automatically
- but once a benchmark is promoted, generators should use the benchmark definition directly instead of guessing from pattern-bank signals

## HSS1010 As First Consumer

`hss1010` is the immediate proving ground for this system.

The intended future selection is:

- benchmark: `calm-module-2-workbook`
- source support: hidden by default
- section flow: learn -> apply -> reflect -> optional deepen

For HSS, this means:

- the study side adopts the Module 2 workbook surface
- lesson shells are generated from benchmark recipes
- source support is available on demand, not always visible
- section composition stays content-driven, but rendering becomes benchmark-driven

## First Benchmark To Promote

The first benchmark should be the Module 2 workbook system.

Source references:

- `projects/calm-module-2-activites-reference/workspace/index.html`
- `projects/calm-module-2-activites-reference/workspace/main.jsx`
- `.runtime/pattern-bank/auto/calm-module-2-activites-reference.json`
- `.runtime/pattern-bank/auto/calmmodule2.json`

Why this benchmark first:

- strong workbook surface
- strong learn/apply rhythm
- strong reflection/checkpoint language
- strong input and activity patterns
- already validated by the user as the preferred direction

## Rollout Strategy

### Phase 1

Add benchmark infrastructure without changing generation behavior yet.

Deliverables:

- benchmark types
- registry loader
- recipe definitions
- benchmark selection schema
- tests for validation and resolution

### Phase 2

Promote Module 2 as the first benchmark.

Deliverables:

- `calm-module-2-workbook` benchmark file
- workbook recipe family definitions
- benchmark-backed prompt-pack references or recommendations

### Phase 3

Wire `hss1010` to consume the benchmark.

Deliverables:

- benchmark resolution in HSS conversion path
- `wellness` moved to benchmark-driven workbook surface
- source support hidden by default

### Phase 4

Expand benchmark consumption to other generators and subject areas.

## Verification

The minimum verification bar should be:

- benchmark files validate structurally
- project benchmark selection resolves deterministically
- generators can resolve recipes from the selected benchmark
- benchmark-free projects still work unchanged
- `hss1010` visibly adopts the Module 2 workbook system when configured

## Non-Goals

This first pass should not try to:

- build a full no-code template engine
- replace prompt packs
- replace lesson packets
- auto-promote every good project into a benchmark
- solve every subject family's generation model at once

## Recommendation

Build a benchmark registry plus recipe library as the new authoritative generation layer, promote Module 2 as the first approved benchmark, and use `hss1010` as the first consumer. This gives Canvas Helper a real learning system: one that not only remembers good work, but can generate with it on purpose.
