# Handoff

- Project: `how-assessment-works`
- Task: Build and refine a student-facing Unit 0 assessment orientation as one accessible SCORM 2004 item.
- Status: ready for validation

## Summary

- Built a separate learner experience titled **How Assessment Works** while preserving the existing Firebase administration presentation unchanged.
- Kept the experience to one continuous page with no course sidebar, separate modules, staff resources, decks, streaming dependencies, or learner-facing automated-assistance content.
- Added editable Product, Process, and Defence weights. The total remains exactly 100%, Process is constrained to 0–25%, and the initial example is 50/25/25.
- Corrected the seven journey numbers so each numeral is vertically and horizontally centred.
- Corrected the learner sequence so **After you submit: Defence** follows submission of Product and Process evidence.
- Added two optional, locally packaged videos from the original presentation:
  - `inspire-the-work.mp4` beside the pillars and weight activity;
  - `the-process-check-in.mp4` beside the readiness activity.
- Excluded the original framework, oral-defence, and human-gate videos because their validation, automated-assistance, diploma, and staff-architecture framing conflicts with the learner contract.
- Exported:
  - `projects/how-assessment-works/exports/how-assessment-works-scorm-2004.zip` (41 MB);
  - `projects/how-assessment-works/exports/single-html/how-assessment-works.html` (55 MB, videos embedded).

## Files changed

- `projects/how-assessment-works/workspace/index.html`
- `projects/how-assessment-works/workspace/styles.css`
- `projects/how-assessment-works/workspace/main.js`
- `projects/how-assessment-works/workspace/assets/media/inspire-the-work.mp4`
- `projects/how-assessment-works/workspace/assets/media/the-process-check-in.mp4`
- `projects/how-assessment-works/meta/project.json`
- `projects/how-assessment-works/meta/prompt-pack.md`
- `projects/how-assessment-works/meta/e2e-contract.json`
- `projects/how-assessment-works/meta/deviation-report.json`
- `projects/how-assessment-works/meta/deviation-report.md`
- `projects/how-assessment-works/exports/**`
- `scripts/lib/scorm.ts`
- `scripts/lib/exports/scorm-package.ts`
- `scripts/lib/types.ts`
- `scripts/lib/project-manifest-policy.ts`
- `scripts/tests/scorm-export.test.ts`
- `scripts/tests/how-assessment-works.test.ts`
- `e2e/specs/how-assessment-works.spec.ts`
- `package.json`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed

- Added the seven-step learner journey: Learn, Practise, Check readiness, Create, Submit, Explain, and Revise if needed.
- Added learner-centred Product, Process, and Defence cards.
- Renamed the final learner beat to **After you submit: Defence** and made the Product/Process submission order explicit.
- Added three keyboard-accessible native weight sliders:
  - Product: 0–100%;
  - Process: 0–25%;
  - Defence: 0–100%.
- Changing one slider proportionally rebalances the other two, honours the Process cap, and keeps the total at 100%.
- Added a polite status announcement containing all three current weights and the total.
- Kept the three sample-mark controls and changed the overall calculation to use the learner-selected weights.
- Persisted weights and marks under `canvas-helper:how-assessment-works:state:v1`, with backward-compatible defaults for previously saved state.
- Added local video hydration so the same media paths work in the workspace, SCORM package, and embedded single-HTML export.
- Added a six-item evidence-classification activity, two supportive readiness scenarios, Defence format choices, and a final four-item readiness checklist.
- Completion becomes available only after the evidence activity, readiness scenario, and checklist are complete.
- Ported an enhanced SCORM bridge with idempotent `window.__canvasHelperScorm.markCompleted()`, `canvas-helper:scorm-ready`, Save and Exit, autosave, dynamic local-storage tracking, and suspend-data restoration.
- Kept SCORM reporting completion-only; the bridge never writes score or success-status fields.

## Why this changed

- Students need to explore how assessment weights affect an example while understanding that Process is limited to 25%.
- The journey-number boxes needed a cascade correction so their numerals were actually centred.
- Defence occurs after Product and Process evidence is submitted, so the former **Before you submit** heading contradicted the stated journey.
- The user asked to retain videos from the original presentation. The two selected videos are the closest match to process evidence and supportive readiness; the other three are not appropriate for this student version.
- Brightspace needs a self-contained SCORM item that restores progress without grading the orientation or controlling later content.

## Source of truth

- Canonical entry: `projects/how-assessment-works/workspace/index.html`
- Canonical editable sources:
  - `projects/how-assessment-works/workspace/index.html`
  - `projects/how-assessment-works/workspace/styles.css`
  - `projects/how-assessment-works/workspace/main.js`
- Active copied-media sources:
  - `projects/ai-course-building-resources/workspace/resources/media/inspire-the-work.mp4`
  - `projects/ai-course-building-resources/workspace/resources/media/the-process-check-in.mp4`
- Active copied-media targets:
  - `projects/how-assessment-works/workspace/assets/media/inspire-the-work.mp4`
  - `projects/how-assessment-works/workspace/assets/media/the-process-check-in.mp4`
- Project contract: `projects/how-assessment-works/meta/project.json`
- Instructional and language contract: `projects/how-assessment-works/meta/prompt-pack.md`
- Browser contract: `projects/how-assessment-works/meta/e2e-contract.json`
- SCORM, extracted SCORM, and single-HTML files under `exports/` are generated output and must not be edited directly.

## Verification run

- `node --check projects/how-assessment-works/workspace/main.js`: passed.
- `npm run test:how-assessment-works`: 4 passed.
- `npm run test:scorm`: 19 passed.
- `npm run test:metadata-policy`: 7 passed.
- `npm run verify -- --project how-assessment-works`: passed with no missing assets, external dependencies, embeds, or course-shell resources.
- `npm run validate:manifests -- --project how-assessment-works`: passed.
- `npm run test:e2e:project -- --project how-assessment-works`: 1 passed.
- `npm run test:e2e:how-assessment-works`: 3 passed, covering retry feedback, completion, reload restoration, adjustable-weight restoration, Process-slider keyboard limits, video metadata, focus behaviour, 390 px layout, and console errors.
- `npm run test:e2e:smoke`: 1 passed.
- `npm run build:studio`: passed.
- Sequence assertion: passed; the learner copy now places Defence after Product and Process submission, matching Submit → Explain in the journey.
- Browser visual QA:
  - all seven journey numerals computed as centred grid content;
  - both workspace videos reached ready state 4;
  - both exported SCORM videos reached ready state 4;
  - weight total remained 100%;
  - 391 CSS px preview had no horizontal overflow;
  - workspace and exported SCORM console error logs were empty.
- Single-HTML export: passed with four inlined assets and two embedded MP4 payloads; no relative media path remains.
- SCORM export: passed with seven files, including both local MP4s, and the declared state key.
- Exported-copy inspection: passed; both generated learner entries contain **After you submit: Defence** and neither contains the former heading.
- ZIP integrity: passed.
- `imsmanifest.xml` XML and manifest inspection: passed; both videos are declared resources in one SCORM 2004 4th Edition SCO titled **How Assessment Works**.
- `git diff --check`: passed.
- Repository-wide `npm run typecheck` still reports only pre-existing, unrelated errors in legacy ELA, Forensics, and Social builder files; no touched-file error was reported.

## Fragile areas / watchouts

- Keep the state key exactly `canvas-helper:how-assessment-works:state:v1`.
- Keep the visible sequence as Submit → Explain/Defence. The internal `before-submit` IDs remain unchanged as compatibility selectors for saved position and E2E restoration.
- Keep the three weights at an integer total of 100% and Process at or below 25%.
- Keep completion monotonic and gated only by the evidence activity, readiness scenario, and checklist; calculator and videos must remain optional.
- Keep `markCompleted()` idempotent because authored completion may happen before or after SCORM readiness.
- Keep learner-authored page copy free of automated-assistance, board, district, staff, validation, and gatekeeping terminology.
- Both approved source videos visibly retain NotebookLM branding. The process-check-in video also contains some legacy gate-model terminology. If the no-automated-assistance/no-gate-language rule is intended to include every video frame and spoken word, these two videos must be remade rather than reused.
- The optional videos add approximately 4.5 minutes. Expect about 20–25 minutes when both are watched.
- The larger 41 MB SCORM package should be checked against the target Brightspace file-size policy.
- Do not edit `projects/how-assessment-works/exports/**` directly.

## Next prompt should assume

- The standalone student artifact is locally complete and its canonical editable sources are in `projects/how-assessment-works/workspace/`.
- The current branch is `codex/how-assessment-works`.
- No Firebase files or deployment were changed.
- The user approved restoring videos; the two most student-relevant originals were selected and copied.
- Only authenticated Brightspace acceptance and user acceptance of the legacy video branding/wording remain.

## What still needs validation

- Confirm that the two selected videos are acceptable despite their retained NotebookLM branding and the process-check-in video’s legacy terminology.
- Confirm the target Brightspace course accepts the 41 MB ZIP.
- In Browser A, partially complete the orientation, change the weights, and use Save and Exit.
- In Browser B with the same learner account, confirm weights, marks, answers, checklist, theme, and last position restore.
- Finish all three completion gates and confirm Brightspace reports `completed`.
- Confirm completion does not lock or release later Brightspace content unless the course itself is configured to do so.

## Known risks

- Real Brightspace suspend-data restoration and completion reporting cannot be confirmed without the authenticated target course and a learner account.
- The original videos do not have packaged captions or transcripts. Essential information is repeated in page text and neither video gates completion, but captions should be created if the videos must satisfy a stricter media-accessibility standard.
- Repository-wide typecheck has unrelated baseline failures; use the scoped verification results above for this artifact.

## Exact next command

`npm run export:scorm -- --project how-assessment-works --version 2004`

## Exact next file to open

`projects/how-assessment-works/meta/prompt-pack.md`

## Do not do next / warnings

- Do not replace or deploy over the existing Firebase administration presentation.
- Do not add the three excluded staff-facing videos without rewriting the learner contract.
- Do not convert this project into a course factory or add a course shell.
- Do not add external fonts, icons, streaming media, scripts, or network dependencies.
- Do not report score or success status from this ungraded orientation.
