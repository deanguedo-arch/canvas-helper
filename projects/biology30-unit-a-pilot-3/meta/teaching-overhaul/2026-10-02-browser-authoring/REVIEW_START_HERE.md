# Chapter 11 teaching draft for Dean to review

The first three complete lesson drafts are ready for your review. ChatGPT authored them in your Biology 30 project with the visible Extra High setting. I read the complete source material and manuscripts, requested a focused correction pass, and re-read the complete revised files. Nothing has been put into the learner course yet.

[Open the clickable HTML review index](index.html) for readable, complete lesson previews with collapsible hints and feedback, using the existing Biology fonts and colours. This is a separate read-only manuscript preview; it does not implement the learner runtime, diagrams, vocabulary pop-ups, response controls or saving. Browser-rendered inspection was blocked by the browser's file-URL policy. Static text-fidelity, source-hash and local-link checks passed.

## Working lesson evaluation copy

Dean requested an actual working copy after the static review. [Open the running evaluation copy](http://127.0.0.1:57000/index.html#lesson-01), or open [its local index](working-copy/index.html). Only lessons 1–3 have the new manuscripts. The existing shell, fonts, diagrams, vocabulary/Frayer owners, textbook reader and real required-check controls are retained; the other course pages provide unchanged context.

This prototype has separate local saving and cannot connect to an LMS. It does not replace the canonical course or count as teacher acceptance. Complete wording and six required prompts/IDs/limits are preserved. One labelled test response was used only on a separate test-server origin; the delivered preview starts fresh. Do not clear browser storage to evaluate it.

The server is read-only, loopback-only and serves just the exact working-copy file allowlist, not the repository or the previously blocked static-review file. If it is stopped, restart from the repository with `node scripts/serve-biology30-teaching-working-copy.mjs`; keep its default port 57000 to retain the same browser save origin. `WORKING_COPY_MANIFEST.json` records source hashes, ownership and save isolation. New proposed media is not generated; teacher acceptance and full rollout/LMS checks are still pending.

## Read the lessons

Read the BEGIN LEARNER MANUSCRIPT through END LEARNER MANUSCRIPT portion in each file. The notes after that boundary are for teachers and integration, not for students.

1. [Nervous communication](responses/v2/CH11_Lesson01_Nervous_Communication_v2.md) — how detection, integration and output work; homeostasis; nervous-system organization; a worked regulation example and an interrupted-route transfer.
2. [Neurons and myelin](responses/v2/CH11_Lesson02_Neurons_Myelin_v2.md) — structure/function reasoning, deliberate diagram reading, continuous versus saltatory conduction, myelin damage and drawing instructions.
3. [Pathways and reflexes](responses/v2/CH11_Lesson03_Pathways_Reflexes_v2.md) — chosen versus spinal-reflex routes, complete worked reasoning, diagram-reading guidance and a new transfer situation.

The [complete four-file ZIP](responses/CH11_First_Batch_Authoring_Draft_v2.zip) also includes the [source, media and integration map](responses/v2/CH11_First_Batch_Source_Assets_Integration_v2.md).

## What to judge

- Could a first-time learner understand why each step happens without guessing or depending on the textbook/video?
- Does it sound like your Alberta Biology 30 teacher voice: clear, respectful and detailed enough without dropping scientific depth?
- Are the transitions, examples and diagram directions doing useful teaching rather than simply naming facts?
- Is the practice fair after the preceding explanation, and does the feedback explain the reasoning?
- Are the instructions sufficiently clear about notes, the paper drawing, saving written answers and finishing the required check?

All six original required questions and their save identities/limits are retained. The additional eight formative items are optional notes/self-check work, not new progress gates or newly autosaved fields. Core vocabulary strips and native bindings are preserved.

## What is not approved or completed

These are content manuscripts, not integrated course previews. The separate HTML review uses the existing fonts and colours; the current learner course's layout, runtime, saves, chapter progress and release status have not changed. Media briefs are separate: new diagrams are not generated; existing videos are not playback/transcript-verified; the withdrawal visual still needs independent rendered/teacher review. Complete text representations prevent missing new images from blocking the teaching.

The [independent v2 review](MANUSCRIPT_REVIEW_V2.md) records the corrections and evidence limits. Raw ChatGPT files retain their original pre-review status headers; the [session tracker](AUTHORING_SESSION.json) records the current stage. No integration, deployment, SCORM or Brightspace claim is being made.

## Your decision

Please approve this first batch's teaching approach and wording, or list the changes you want by lesson/heading. Approval here is not automatic approval of every chapter or a release. After your explicit decision, the next calibration is Chapter 19 lesson-04, Calculating expected genotype frequencies, with lessons 01–03 prerequisite context, before scaling the standard.
