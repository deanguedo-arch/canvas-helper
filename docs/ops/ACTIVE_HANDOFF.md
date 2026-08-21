# Handoff

- Project: Social Studies 10-1 and 20-1 Option Two families (`social10-1-related-issue-{1,2,3,4}-option-2`, `social20-1-related-issue-{1,2,3,4}-option-2`)
- Task: Add issue-specific, textbook-grounded Core Vocabulary and origin-organized Evidence Bank testers to the eight Option Two courses.
- Status: complete on unmerged branch `codex/social10-20-option2-vocabulary-tester`; implementation `4615be9e4a5c69329bbb82316ce23ce371bdfb3e` is published.

## Summary

- Branch URL: https://github.com/deanguedo-arch/canvas-helper/tree/codex/social10-20-option2-vocabulary-tester
- Pre-edit GitHub checkpoint and rollback point: `60d0a48b1839d32e0cbfb787ae22cfe396395daf`.
- Social 10-1 and 20-1 vocabulary/evidence implementation: `4615be9e4a5c69329bbb82316ce23ce371bdfb3e`.
- The tester covers only the eight Option Two projects. No Option One project, Social 30-1 project, PR, merge, SCORM export, or Brightspace upload was changed by this implementation commit.
- Studio remains running from `/Users/deanguedo/Documents/GitHub/canvas-helper-social30-vocabulary-tester` on port `5175`, visibly focused on Social 20-1 Issue 4 Core Vocabulary and the Self-determination course model.

## Files changed

- `projects/social10-1-related-issue-{1,2,3,4}-option-2/workspace/index.html`
- `projects/social20-1-related-issue-{1,2,3,4}-option-2/workspace/index.html`
- `projects/social10-1-related-issue-{1,2,3,4}-option-2/workspace/assets/previews/**` (two corrected preview files per project)
- `projects/social20-1-related-issue-{1,2,3,4}-option-2/workspace/assets/previews/**` (four corrected preview files per project)
- `projects/social10-1-related-issue-{1,2,3,4}-option-2/meta/project.json`
- `projects/social20-1-related-issue-{1,2,3,4}-option-2/meta/project.json`
- `projects/social10-1-related-issue-{1,2,3,4}-option-2/meta/conversion-notes.md`
- `projects/social20-1-related-issue-{1,2,3,4}-option-2/meta/conversion-notes.md`
- `projects/social10-1-related-issue-{1,2,3,4}-option-2/meta/e2e-contract.json`
- `projects/social20-1-related-issue-{1,2,3,4}-option-2/meta/e2e-contract.json`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed

- Added `#core-vocabulary` after Overview and before Lessons in all eight courses, with matching sidebar and Overview links.
- Added eight issue-specific Tier 3 terms per course, concise word structure, four autosaving Frayer fields, a course-source label, a course-model reveal, and deliberate Save to Evidence Bank behavior.
- Kept response IDs stable as `<slug>:core-vocabulary:<term>:<field>` and collection IDs as `<slug>:core-vocabulary:<term>:collection`.
- Kept each existing Study Guide vocabulary exercise unchanged as later retrieval practice.
- Organized Evidence Bank entries by Core Vocabulary, lesson section, Source Analysis, Position Builder where present, direct Evidence Bank saves, and legacy fallback.
- Added a one-column mobile Frayer/model layout and corrected the late `.course-frame` override that caused narrow mobile Source Analysis overflow.
- Corrected 128 imported-asset references in 24 preserved support-preview HTML files. Every corrected target already existed in its workspace; no course asset was invented or replaced.
- Added `core-vocabulary` to learner-surface metadata and added strict project E2E contracts for all eight courses.

### Social 10-1 term sets

- Issue 1, *Exploring Globalization* Chapters 1-4: globalization, identity, cultural homogenization, hybridization, cultural revitalization, assimilation, digital divide, worldview.
- Issue 2, Chapters 5-9: historical globalization, imperialism, Eurocentrism, ethnocentrism, mercantilism, Social Darwinism, assimilation, residential schools.
- Issue 3, Chapters 10-14: sustainable prosperity, economic globalization, trade liberalization, transnational corporation, economic sovereignty, quality of life, sustainable development, interdependence.
- Issue 4, Chapters 15-19: global citizenship, human rights, quality of life, civic responsibility, civil disobedience, activism, non-governmental organization, corporate social responsibility.

### Social 20-1 term sets

- Issue 1, *Exploring Nationalism* Chapters 1-3: nation, nationalism, contending loyalties, collective identity, patriotism, civic nationalism, nation-state, non-nationalist loyalty.
- Issue 2, Chapters 4-8: national interest, ultranationalism, foreign policy, imperialism, militarism, self-determination, appeasement, genocide.
- Issue 3, Chapters 9-12: internationalism, multilateralism, sovereignty, unilateralism, bilateralism, foreign aid, supranationalism, humanitarianism.
- Issue 4, Chapters 13-16: pluralism, federalism, multiculturalism, sovereignty, bilingualism, self-determination, national unity, national identity.

## Why this changed

- The user accepted the Social 30-1 tester direction and asked to test the same pattern on the Social 10-1 and 20-1 Option Two courses, with vocabulary chosen from each issue and its textbook rather than repeating one generic term set.
- The current `legacy-snapshot-v1` workspaces are the preserved learner baselines. The older Social builders remain quarantined because their source inputs are incomplete or not portable.

## Verification run

- Textbook audit: extracted and searched the attached *Exploring Globalization* Chapters 1-19 and *Exploring Nationalism* Chapters 1-16 with the bundled PDF runtime, then cross-checked terms against the current lesson titles and Study Guide definitions.
- Static tester audit: every course has one Core Vocabulary route, eight unique term panels, 32 unique Frayer response IDs, eight collection IDs, eight course sources, and parseable inline runtime JavaScript.
- Preservation audit: all 190 existing lesson and Study Guide sections across the eight courses remain byte-for-byte identical to checkpoint `60d0a48b`.
- Preview-resource audit: all 128 corrected preview references resolve to existing local files.
- `npm run course:doctor -- --project <slug>` — passed for all eight; driver `legacy-snapshot-v1`.
- `npm run verify -- --project <slug> --mode workspace` — passed for all eight; no missing local assets, embeds, or shell resources. Only existing external-resource warnings remain.
- `npm run build:studio` — passed.
- `npm run test:e2e:project -- --project <slug>` — passed 1/1 for each of the eight courses.
- E2E covered desktop routes, 390x844 mobile routes, direct Evidence Bank save/update/reload/removal, vocabulary collection save/update/reload/removal, autosave without premature Evidence Bank publication, and mobile overflow/local-asset errors.
- Visible Studio review on port 5175: Social 10-1 Issue 2 showed eight unique terms, active navigation, Social Darwinism source/model reveal, two-column desktop and one-column mobile Frayer layouts with no overflow; Social 20-1 Issue 4 showed eight unique terms and the textbook/lesson-grounded Self-determination model in Focus mode.
- `git diff --check` and the 56-file staged-path audit — passed.
- Remote branch confirmed at implementation SHA `4615be9e4a5c69329bbb82316ce23ce371bdfb3e` before this handoff update.

## Source of truth

- Canonical learner source: `projects/social10-1-related-issue-<n>-option-2/workspace/index.html` and `projects/social20-1-related-issue-<n>-option-2/workspace/index.html`, plus their adjacent preserved workspace assets.
- Ownership and declared learner surfaces: each project's `meta/project.json`.
- Textbook/course-source record: each project's `meta/conversion-notes.md`.
- Learner interaction contract: each project's `meta/e2e-contract.json`.

## Fragile areas / watchouts

- Do not run `scripts/build-social10-related-issues.ts` or `scripts/build-social20-related-issues.ts` against these legacy snapshots. Their metadata explicitly quarantines those rebuild paths.
- Replacing `workspace/index.html` from an older package would remove the vocabulary/evidence tester; running an old builder may also replace preserved lesson content.
- The support-preview path corrections assume preview files remain one directory below `workspace/assets/previews/`. Moving those files would require recalculating their relative references.
- Learner responses remain browser-local in this tester. The final visible Studio preview contains no committed or intentionally retained QA response data.

## Next prompt should assume

- Only Social 10-1 and Social 20-1 Issues 1-4 Option Two are under review in this tester branch.
- `60d0a48b` is the rollback point if the entire 10/20 tester is rejected.
- `4615be9e` is the published feature implementation ready for teacher review.
- The Social 30-1 tester branch remains separate and unchanged.
- Studio is already running on port 5175 in Focus/Current/Desktop view with Social 20-1 Issue 4 Core Vocabulary open.

## What still needs validation

- Teacher acceptance of all eight term sets, morphology wording, model answers, and collection grouping.
- The task proves that existing 10/20 lesson and Study Guide sections were preserved, not that those legacy snapshots were newly reconciled against fresh 10/20 SCORM exports. A separate source-fidelity audit is still required if new authoritative SCORM packages are supplied.
- If accepted later: separately authorize SCORM export and cross-browser/Brightspace save-and-restore validation.

## Known risks

- Repeated foundational concepts such as assimilation, quality of life, sovereignty, and self-determination intentionally appear in more than one issue where the textbook and course apply them differently; the overall eight-term sets are issue-specific rather than globally unique.
- Existing legacy Evidence Bank entries without origin metadata remain under Other / Legacy Notes rather than being destructively migrated.
- No exported package or LMS behavior is claimed; only workspace and local learner-runtime behavior were validated.

## Exact next command

`npm run studio -- --host 127.0.0.1 --port 5175 --strictPort --clearScreen false`

## Exact next file to open

`projects/social20-1-related-issue-4-option-2/workspace/index.html`

## Do not do next / warnings

- Do not open a PR, merge, export SCORM, upload to Brightspace, or propagate to Option One without explicit acceptance.
- Do not run the old Social 10-1 or Social 20-1 builders against these preserved legacy snapshots.
- Do not reset or clean the user's original dirty checkout.
- Do not stage `node_modules`, `.runtime/**`, generated exports, test artifacts, or unrelated course changes.
