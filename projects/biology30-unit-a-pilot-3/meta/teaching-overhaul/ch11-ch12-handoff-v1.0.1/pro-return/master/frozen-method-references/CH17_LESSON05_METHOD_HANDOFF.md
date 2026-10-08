# Handoff

- Project: biology30-chapter-17
- Task: Transfer the accepted lesson2 teaching approach to a complete, isolated lesson5 trial before broader chapter authoring.
- Status: complete working comparison available; teacher review and separate Scout manuscript review pending.

## Files changed

- `scripts/prepare-biology30-ch17-transfer-trial.mjs`
- This trial's `source-handoff/**` and `Biology30_CH17_Lesson05_Teacher_Transfer_v0.1.0_Source.zip`
- `LEAD_SOURCE_REVIEW.json`, `AUTHORING_STATUS.json`, and this handoff
- `PRO_SUBMISSION_PROMPT.txt` and three browser evidence screenshots
- New `scripts/build-biology30-ch17-l05-comparison.mjs` and `scripts/serve-biology30-ch17-l05-comparison.mjs`.
- Immutable `pro-return/**`, `LEAD_MANUSCRIPT_REVIEW.md`, and derived `evaluation/**`.
- No canonical learner files, previous trials or runtime owners changed.

## What changed

- Recorded scoped permission to use lesson2 v0.4.0-r1 as the authoring reference, not a universal adoption or release.
- Exported the full current owner, lesson5 native boundaries, complete optional-note sections, source deck, textbook, exact slide assets and proposed 15-lesson progression.
- Sent the verified bounded task to existing Scout. Scout verified receipt, but its worker lost browser-control tools. Scout acknowledged root taking browser upload/submission ownership without a duplicate task.
- Pro completed the full lesson5 return. Root downloaded and safely extracted the ZIP, verified its829592bytes/SHA256, CRC,50manifest payloads and51checksum entries; read all447manuscript lines and built the isolated comparison without changing the returned copy.
- Comparison: http://127.0.0.1:57220/?lesson=05 . Full-width new lesson: http://127.0.0.1:57222/index.html#lesson-05 . Baseline uses57221; QA uses57223, separate from teacher saves and old57210/57200comparisons.
- Scout acknowledged the exact returned-file path and is reviewing the complete manuscript. Its report has not returned yet.
- Scout completed its bounded source/sequence review at `/Users/deanguedo/Documents/Codex/2026-10-04/task-3/l05-preparation/SOURCE_SEQUENCE_HANDOFF.md`. Lead read the entire report; findings align with the proposed progression and source cautions. This is not returned-manuscript review.
- The two unchanged native note IDs are `ch17-kinch-v020-l05-change-response` and `ch17-kinch-v020-l05-evidence-response`.

## Why this changed

Dean asked to carry the teacher-led method through the lessons and approved proceeding. Lesson5 tests transfer to two-locus calculation and inference without copying lesson2's headings or reducing explanation.

## Source of truth

- Canonical learner owner remains `projects/biology30-chapter-17/workspace/index.html`, untouched and proposal-only/blocked.
- Trial baseline is the full owner under `teacher-led-trial-v0.4.0/evaluation/new/index.html`, SHA256 `71518705941a86809c7f28593664763e59c7867511e3ae699ec1007bfe109bad`.
- Frozen handoff and exact replacement interval are in `source-handoff/contracts/REPLACEMENT_BOUNDARY.json`.
- Authored proposal: `pro-return/Biology30_CH17_Lesson05_Teacher_Transfer_v0.1.0/lesson-05.teaching-fragment.html` and `manuscripts/lesson-05.md`. Reproducible comparison derivative is `evaluation/new/index.html`; it is not canonical.

## Verification run

- New exporter syntax check passed.
- All 76 manifest payload hashes/sizes verified; all 77 ZIP members match local bytes; CRC passed.
- All 563 frozen canonical/reference file hashes remain unchanged.
- Builder/server syntax passed. Exact teaching prefix/suffix, whole optional sections, branch figure, old edit keys and vocabulary connections preserved;151native asset/runtime/style files unchanged. Report: `evaluation/preservation-report.json`.
- Focused browser save exception: both optional notes saved/reloaded into AllMyWork on57223; required progress0/15. Vocabulary dialog opens/closes; bold term font800. All seven lesson images serve exact bytes, with opening illustrations visually inspected. Teacher57222origin has no synthetic answers.
- Read native contract, relevant teacher slide text and ten actual source images; visually inspected textbook printed593/596/597. Findings and proposed sequence are in `LEAD_SOURCE_REVIEW.json`.
- `context:project` refused the existing blocked project as expected; this does not authorize changing its status.
- Repository-wide `git diff --check` encountered unrelated existing CALM/Science whitespace. Those files were not changed or repaired here. Do not describe that broad check as passing.

## Fragile areas / watchouts

- Do not integrate against an older index or stale Pro return. Accepted lesson2 r1 is already in the current baseline and must remain exact.
- Complete optional-task sections are immutable, not merely their response IDs. All required questions, feedback and native data remain outside the rewrite boundary.
- Read actual PPT relationships/pixels; original Quick Look associations were unreliable. Slide37 repeats identical gametes; slide41 has metaphase wording and crossover qualifications; slide47 has a fruit/flower typo.
- Static source images show all content at once. Teaching guidance must not promise scripted reveals.

## Next prompt should assume

- Authoring is owned by the existing Scout/Pro workflow, not a new duplicate task.
- Codex owns independent receipt/review and isolated comparison assembly.
- Source handoff SHA256: `5b272d90413e283ec31b3f5f119c10d6ad3538033823eae817192e1ef6a7d352`; size15,469,952bytes.
- The user authorized progress; do not ask for another generic permission to author the bounded trial.

## What still needs validation

Scout's separate complete-manuscript report and Dean's exact-copy decision remain pending. Lead full reading, receipt, isolated assembly and focused preview checks are complete. Broader E2E, exhaustive responsive/accessibility/media, Studio, packaging, deployment and Brightspace testing remain deferred. Do not relabel the observed Pro5of5 setting as a visible ExtraHigh control.

## Known risks

Root's app thread tools cannot currently reach durable Scout; ordinary signed-in IAB recovered coordination. Pro's self-review is not teacher acceptance. Current global active handoff belongs to concurrent CALM work; preserve it instead of overwriting another chat's handoff. Retained source-slide text/layout is static QuickLook with original picture relationships restored; animations/fonts can differ from PowerPoint.

## Exact next action

Dean reviews http://127.0.0.1:57220/?lesson=05 and records changes or acceptance. Read Scout's report when returned. If server stops, run `node scripts/serve-biology30-ch17-l05-comparison.mjs` from repository root. Do not duplicate authorship or alter the immutable return.

## Exact next file to open

`projects/biology30-chapter-17/meta/teaching-overhaul/2026-10-04-exemplar-transfer/teacher-led-transfer-l05-v0.1.0/AUTHORING_STATUS.json`

## Do not do next / warnings

Do not overwrite v0.3.0 or lesson2 v0.4.0-r1, edit canonical course HTML, substitute local AI writing for requested Pro authorship, change saved-state or assessment contracts, activate the project, deploy, package SCORM, or claim the remaining chapter batches are already authored.

## Routing

Lead retained integration, pedagogy and saved-state review because current proposal owners/contracts are uncommitted. Existing deterministic extraction/assembler/server handles mechanical work; existing authorized Scout reviewer owns a separate read-only manuscript pass. No new subagent/Muse run. Local source reuse is not provider-cache telemetry; usage savings unknown.
