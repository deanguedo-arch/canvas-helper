# Forensicstudiesoption2 Module Progression Design

## Goal

Change `forensicstudiesoption2` from chapter-order quiz gating to module-component progression:

- every module page still renders all lesson cards at once
- only the first unfinished card is active
- later cards are visibly blurred and unavailable until prior cards are completed
- each card ends with `Mark Complete` and `Mark Complete + Next`
- the module quiz and assignment unlock only after all lesson cards in that module are marked complete

## Scope

In scope:

- `projects/forensicstudiesoption2/workspace/main.js`
- `projects/forensicstudiesoption2/workspace/styles.css`
- `projects/forensicstudiesoption2/workspace/content/module-index.css`
- `scripts/build-forensicstudiesoption2-content.ts`
- focused tests in `scripts/tests/forensicstudiesoption2-*.test.ts`

Out of scope:

- changing original `projects/forensics/**`
- rebuilding assignment runtimes
- introducing broad course-wide hard locks beyond module component progression
- adding project E2E in this pass

## Source Of Truth

The shell runtime remains the source of truth for persisted learner progress.

- parent shell storage stays in `projects/forensicstudiesoption2/workspace/main.js`
- generated chapter pages are interaction surfaces only
- generated chapter pages report completion events up to the shell
- shell determines whether the module quiz and assignment are unlocked

## Desired Behavior

### Module pages

- all lesson cards remain visible on the chapter page
- completed cards show a completed state
- the first unfinished card is active
- every later card is blurred and blocked until reached
- each active/completed card footer includes:
  - `Mark Complete`
  - `Mark Complete + Next`

### Completion actions

- `Mark Complete`
  - marks the current card complete
  - unlocks the next card
  - keeps the current viewport position

- `Mark Complete + Next`
  - marks the current card complete
  - unlocks the next card
  - scrolls and focuses the next card

### Quiz and assignment unlocks

- quizzes no longer unlock because the previous quiz was completed
- assignments no longer unlock because the previous quiz was completed
- each quiz and assignment unlocks only when its own module lesson cards are all complete

### Chapter access

- do not broadly lock all chapters during this pass
- chapter content remains directly openable
- progression is enforced inside the module page and on that module’s quiz/assignment

## Data Model

Extend chapter data with generated component metadata:

- `componentIds`
- `componentCount`

Extend saved progress with module component completion:

- `moduleComponents[chapterId][componentId] = true`

This allows the shell to compute module completion without opening the iframe first.

## Runtime Architecture

### Parent shell

The shell will:

- load and persist module component progress in local storage
- compute `isModuleComplete(chapterId)`
- unlock a quiz or assignment when its chapter is module-complete
- listen for iframe `postMessage` events from chapter pages
- send current completion state back into the iframe after it loads or after progress changes

### Generated chapter pages

Each generated chapter page will:

- render lesson cards with stable component ids
- apply locked, active, and complete visual states
- expose completion buttons in each card footer
- keep later cards blurred until prior cards are complete
- post progress updates to the parent shell
- consume sync messages from the parent shell and redraw card states

## Message Contract

Use a narrow, project-specific message contract:

- child -> parent: module progress ready
- child -> parent: lesson marked complete
- parent -> child: synced completion state for chapter

This keeps progress logic centralized while the iframe remains a thin interaction layer.

## Testing Strategy

### Shell behavior tests

Add focused checks that:

- quiz unlocks no longer depend on previous quiz completion
- assignment unlocks no longer depend on previous quiz completion
- shell source contains module-completion helpers and message handling hooks

### Generated content tests

Add focused checks that:

- chapter data includes component ids/count
- generated chapter pages include completion footer buttons
- generated chapter pages include locked-state hooks
- generated chapter pages include the module progress messaging script

## Risks

- the chapter pages are generated outputs, so the generator must remain the only edit point
- iframe and shell state can drift if message names or payload shapes change casually
- cached chapter pages can preserve old behavior if the builder serves stale assets, so keep the existing cache-bust approach in place

## Acceptance Criteria

- lesson cards show `Mark Complete` and `Mark Complete + Next`
- only the current reachable lesson card is active
- later lesson cards are blurred until prior completion
- completing all lesson cards unlocks that module’s quiz and assignment
- original `projects/forensics` remains untouched
- focused tests and project verify pass
