# HSS1010 Study Skeleton Restoration Design

## Goal

Restore the original HSS1010 study-tab design language and teaching flow while keeping the new source coverage and data-driven conversion pipeline.

## Problem

The current conversion preserves much more source content, but it flattens the instructional experience:

- section tabs still exist, but internal layout rhythm is too generic
- original visual skeleton pieces like `ref-note`, `info-card`, `anatomy-card`, `warning-card`, `image-box`, and structured `read-block` sequences are underused
- added source coverage appears as page-based supplement dumps instead of shaped lesson content
- some original section hero framing is duplicated or wrapped awkwardly in generic containers

That makes the course feel like a source transcript instead of a designed learning experience.

## Chosen Direction

Use the current structured pipeline, but restore the original visual skeleton and reshape the new source-backed material into the same presentation vocabulary used by the legacy HSS1010 workspace.

This is not a return to hardcoded monolith markup. The renderer stays data-driven, but it becomes section-aware and layout-aware.

## Design Principles

### 1. Preserve the original section feel

Each study tab should read like the original HSS1010 experience:

- a single strong glass section shell
- a section hero/title with breathing room
- intentional alternation between banner notes, structured read blocks, card groups, tables, and figures
- no long wall of same-looking supplement boxes

### 2. Shape content before styling it

The source-backed additions should be rendered using the most fitting instructional pattern:

- definitions and topic explanations -> `read-block`
- repeated concept groups -> `info-card` or `anatomy-card`
- caution/protocol content -> `warning-card`
- terminology and matching data -> `term-table`
- self-check or guiding prompts -> `q-box`
- missing visuals -> `image-box` placeholders

Only fall back to raw supplement markup when content cannot yet be reliably shaped.

### 3. Keep source fidelity explicit

The new shaped blocks still need source trace metadata. The goal is better teaching flow, not hiding where content came from.

Page references should become secondary metadata, not the dominant visual presentation.

## Section Strategy

### Start tab

- Preserve the strong header, PDF access, and source orientation language
- Restore the embedded visual/PDF area treatment rather than generic placeholder-only output when source visual references exist
- Keep source introduction supplements visually subordinate

### Wellness tab

- Preserve the original intro note and dimensions structure
- Continue using card grids for the dimensions
- Group added source pages into continuation study blocks under natural subheads rather than page-number dumps

### Anatomy tab

- Preserve the more structured, system-oriented instructional feel
- Use `anatomy-card` for body system summaries
- Prefer two-column or grouped read blocks for foundational concepts
- Convert terminology-heavy material into tables where possible

### Lifestyle tab

- Keep a mixed instructional rhythm using read blocks, Q/A boxes, tables, and warning examples
- Present lifestyle and consumer-health additions as usable study sections rather than literal source excerpts

### Public Health tab

- Keep protocol-heavy, responsibility-heavy content structured and scannable
- Render agency roles, reporting rules, and terminology as tables/cards/protocol blocks
- Use `warning-card` and structured callout patterns for abuse/confidentiality/safety content

## Renderer Changes

### Section-aware rendering

The renderer should stop treating every section identically. It should:

- preserve special blocks that already carry the right layout
- avoid double-wrapping rich markup in generic containers
- use section-specific shaping for supplement blocks

### Supplement shaping

The enrichment layer should stop outputting every uncovered page as the same dashed box.

Instead, it should classify supplement text into one of a few presentation forms:

- continuation prose block
- key points block
- card cluster
- term table
- prompt/checklist box
- pending figure/reference panel

### Styling preservation

The old HSS1010 styles already define the correct visual vocabulary. The renderer should target that vocabulary instead of inventing a new one.

## Verification Targets

The restoration pass is successful when:

- study tabs visually resemble the legacy HSS1010 layout rhythm
- original section skeleton pieces are again prominent in the generated output
- new source-backed content feels integrated into the lesson flow
- generic supplement dump boxes are substantially reduced
- save/load/report behavior remains unchanged
- conversion remains fully data-driven

## Out of Scope for This Pass

- full visual extraction/rebuild of every original diagram
- major assessment redesign
- framework migration
- semantic perfection for every source chunk

This pass is about restoring the designed study experience while keeping content fidelity high.
