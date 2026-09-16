# Biology 30 Pilot 3 generated practice

## Scope

Upgrade `flashcards` and `blanks`, add `mixed-practice`, and cover all Chapter 11 selections using a browser-only authored bank and deterministic generator. Keep `labeling`, required checks, saved IDs, the version-1 IndexedDB namespace, Pilot 2, Chapters 12–13, exports and deployment unchanged.

## Ownership

- Authored biology bank: `projects/biology30-unit-a-pilot-3/workspace/assets/pilot3-practice-bank.js`
- Pure generation, validation, grading, projection and rendering helpers: `scripts/lib/biology30-pilot3/practice-engine.ts`
- Browser orchestration and IndexedDB integration: `scripts/lib/biology30-pilot3/runtime.ts`
- Canonical headings, instructions and practice destinations: `projects/biology30-unit-a-pilot-3/workspace/index.html`
- Presentation: `projects/biology30-unit-a-pilot-3/workspace/styles.css` and synchronized `scripts/lib/biology30-pilot3/pilot3.css`

## Contract

Generated sessions are materialized before display and retain seed, versions, settings, exact items/options, attempts, position, feedback and adaptations. Generated practice is formative and must not change the ten-check progress calculation. Legacy unfinished runs keep their original snapshots. A compact localStorage projection makes active generated sessions discoverable to the SCORM exporter; detailed history remains in IndexedDB and Process Collection downloads.

## Deferred rollout work

Full-course E2E, exhaustive responsive coverage, Studio apply/reload/Undo, SCORM package creation, Brightspace test-student verification, full historical Process Collection portability and chapter-check answer transport remain rollout work.
