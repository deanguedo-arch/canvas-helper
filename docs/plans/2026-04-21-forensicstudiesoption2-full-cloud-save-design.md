# Forensic Studies Option 2 Full Cloud Save Design

## Goal

Make `projects/forensicstudiesoption2` behave like the repo's Google-hosted courses while extending save coverage so every learner-facing work surface persists incremental state locally and can therefore autosave and restore through Firebase Auth + Firestore.

## Current State

- The repo already has a Google-hosted export/deploy contract with:
  - Google sign-in
  - Firestore save at `projects/{slug}/users/{uid}`
  - autosave on tracked `localStorage` changes
  - restore on later launch for the same Google user
- `forensicstudiesoption2` already persists shell progress in `workspace/main.js`.
- Assignments 1, 7, and 8 already persist to their own `localStorage` keys.
- Assignments 2, 3, 4, 5, and 6 do not currently persist learner work incrementally.
- The current Google-hosted export path mostly relies on source detection for storage keys, which is incomplete for this project because:
  - some keys are dynamic
  - some assignments only exist as bundles or inline HTML behavior

## Desired Behavior

- The course still opens without sign-in.
- Google sign-in is only required for cloud sync.
- Every meaningful learner state is saved locally as work happens.
- Google-hosted export tracks the full set of project storage keys explicitly.
- When the learner signs in on another browser or computer with the same Google account, all tracked work restores.

## Explicit Save Scope

Tracked state should include:

- shell progress and quiz work
- assignment 1
- assignment 2
- assignment 3
- assignment 4
- assignment 5
- assignment 6
- assignment 7
- assignment 8

Tracked state should exclude:

- purely cosmetic animation timers
- transient hover states
- non-meaningful visual toggles that do not represent learner work

## Architecture

### 1. Project-level tracked storage contract

Add an explicit list of Google-hosted tracked storage keys to `projects/forensicstudiesoption2/meta/project.json`.

This becomes the source of truth for export instead of trying to infer all save keys from source scans.

### 2. Assignment-local incremental persistence

Each assignment surface must write learner work to a stable `localStorage` key:

- React assignments use a load-on-init and save-on-change pattern.
- Inline HTML assignments use a small persistence helper that watches input changes and restores values on load.

### 3. Export honors explicit storage keys first

Update the Google-hosted export pipeline so it:

- reads explicit project metadata storage keys when present
- falls back to current source detection only when metadata does not declare them

This keeps existing projects working while making `forensicstudiesoption2` reliable.

## File-Level Design

### Project metadata

- `projects/forensicstudiesoption2/meta/project.json`
  - add explicit tracked storage keys for Google-hosted export

### Assignment persistence

- `projects/forensicstudiesoption2/workspace/assignments/module2assignment-app.jsx`
  - persist training, theory, case study, AFIS, tagging, and report state
- `projects/forensicstudiesoption2/workspace/assignments/module3assignment-app.jsx`
  - persist answers, active tab, selected suspect, and relevant session state
- `projects/forensicstudiesoption2/workspace/assignments/module4assignment.html`
  - add inline restore/save helper for all learner input fields and active module panel
- `projects/forensicstudiesoption2/workspace/assignments/module5assignment.jsx`
  - persist calculator inputs, active tab, and assignment responses
- `projects/forensicstudiesoption2/workspace/assignments/module6assignment-app.jsx`
  - persist answers, active tab, comparison state, and meaningful polygraph progress
- audit and keep existing persistence in:
  - `module1assignment-app.jsx`
  - `module7assignment-app.jsx`
  - `module8assignment-app.jsx`

### Export support

- `scripts/lib/exports/google-hosted.ts`
  - read explicit metadata storage keys when present
- `scripts/lib/projects.ts` or existing manifest-loading path only if needed for metadata typing

### Tests

- add failing tests first for:
  - full explicit tracked key list in project metadata/export output
  - assignment source persistence coverage
  - Google-hosted bridge output containing the full key set for this project

## Verification Strategy

Minimum:

- targeted source-based tests for assignment persistence coverage
- targeted export test for explicit storage keys
- `npm.cmd run verify -- --project forensicstudiesoption2`
- `npm.cmd run test:e2e:project -- --project forensicstudiesoption2`

If project E2E is blocked by missing contract, add the missing contract in scope so the save-state behavior can be regression-gated.

## Risks

- Assignment 4 is plain HTML with inline behavior, so persistence must be added without breaking print/report generation.
- Assignment 6 includes simulated session state; only learner-meaningful state should persist.
- Existing export detector should not be broken for other projects while adding metadata-first behavior.

## Success Criteria

- Every learner-work surface in `forensicstudiesoption2` persists incremental local state.
- Google-hosted export includes the full tracked storage key list.
- The project is export-ready for Google-hosted Firebase autosave and cross-device restore.
