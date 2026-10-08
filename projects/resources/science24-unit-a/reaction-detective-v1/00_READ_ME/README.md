# Science 24 Game A1 — Reaction Detective
## Complete build handoff v1.0

**Status:** Build-ready design package; not a released course component.  
**Date:** 6 October 2026  
**Game:** A1 Reaction Detective  
**Course:** Alberta Science 24 — Unit A: Applications of Matter and Chemical Change

This package is intended to be handed directly to a coding agent or developer. It contains the approved visual direction, full screen flow, authored scenario bank, answer logic, feedback rules, generated concept art, deterministic SVG icons, an accessible static prototype scaffold, QA criteria, source notes, and a copy-paste build prompt.

## Start here

Read these files in order:

1. `00_READ_ME/HANDOFF_MASTER.md`
2. `01_DESIGN/Science24_Games_Visual_Standard_v0.1.md`
3. `04_CONTENT/GAME_DESIGN_SPEC.md`
4. `04_CONTENT/SCENARIO_BANK.md`
5. `04_CONTENT/SCENARIO_BANK.json`
6. `04_CONTENT/ANSWER_AND_FEEDBACK_RULES.md`
7. `05_CODE/TECHNICAL_ARCHITECTURE.md`
8. `06_QA/QA_TEST_PLAN.md`
9. `08_PROMPTS/CODEX_BUILD_PROMPT.txt`

## Critical source-of-truth rule

The generated PNG mockups are **visual references only**. Image generators can place incorrect labels, formulas, reaction names, values, or apparatus. Do **not** transcribe scientific content from the mockups.

Production science, wording, answers and feedback come from:

- `04_CONTENT/SCENARIO_BANK.json`
- `04_CONTENT/ANSWER_AND_FEEDBACK_RULES.md`
- `04_CONTENT/CURRICULUM_ALIGNMENT.md`

Exact labels, values, equations and reasoning must be rendered as HTML/SVG/text, not baked into generated artwork.

## Implementation target

The preferred first implementation is a self-contained static web game:

- HTML5
- CSS3
- vanilla JavaScript (ES2020-compatible)
- local SVG icons
- local PNG/JPEG context art
- no framework and no runtime CDN
- no account, analytics, cloud save, student identifiers or network dependency
- state held in memory only

A runnable starter is included in `05_CODE/prototype/`.

## What “done” means for v1

A1 is complete only when a learner can move through:

**brief → worked example → supported cases → feedback/retry → independent transfer → review**

and the build passes the science, accessibility, keyboard/touch, responsive and state-reset checks in `06_QA/QA_TEST_PLAN.md`.
