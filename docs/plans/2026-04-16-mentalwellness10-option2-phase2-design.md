# Mental Wellness Option 2 Phase 2 Design

**Project:** `mentalwellness10-option2`

**Scope:** Rebuild the `phase-2` lesson and linked quiz only. Leave `a2a` and `a2b` assignment runtime surfaces unchanged for a later pass.

## Goal

Use `Mastering_the_Arena_Textbook_Chapter_Fixed_Figures.docx` as the new canonical Phase 2 source and rebuild the lesson/quiz experience so it matches the existing Phase 1 chapter pattern in structure, tone, and interaction quality.

## Approved approach

1. Keep the current shell, navigation, renderers, and progression logic.
2. Replace the placeholder `phase-2` lesson content in `workspace/main.js` with a DOCX-derived chapter built in the same format as the Phase 1 rebuild.
3. Add one new Phase 2 quiz to `QUIZZES`, linked to `phase-2`, using the chapter review questions as the source backbone.
4. Reuse the existing lesson rendering system:
   - hero block
   - key ideas
   - section cards
   - comparison tables
   - glossary cards
   - linked quiz button
5. Keep CSS changes minimal and only add styles if the existing Phase 1 lesson system cannot render a new Phase 2 figure/table shape cleanly.

## Content structure to build

- Front matter:
  - `Mastering the Arena`
  - `The Psychology of Integrated Discipline`
  - thesis, learning objectives, and chapter lens
- Core sections:
  - Rethinking Discipline
  - Self-Determination Theory and the Motivation Continuum
  - Values, Vulnerability, and Behavioral Direction
  - Growth Mindset, Accountability, Guilt vs Shame
  - Authentic Pride vs Hubristic Pride
  - Goal Setting
  - Recovery / Overreaching / Overtraining
  - The Growth Equation
  - Social Context and the Myth of Universal Grit
  - Tactical Drills for Integrated Discipline
  - Common Misunderstandings
  - End-of-Chapter Summary
  - Glossary
- Figures:
  - integrated discipline system
  - motivation continuum
  - need satisfaction
  - recovery / breakdown
  - stress plus rest growth cycle
  - person-by-situation effect

## Implementation notes

- The new Phase 2 reading PDF should live at `workspace/assets/readings/phase2-drive-content.pdf`.
- Phase 2 figures should live under `workspace/assets/readings/phase2-figures/`.
- The quiz detail screen currently hardcodes `Back to phase 1`; this must become dynamic so the new Phase 2 quiz routes back to the correct phase.

## Out of scope

- Rewriting `Assignment 02A` or `Assignment 02B`
- Broad shell restyling
- New dependencies
