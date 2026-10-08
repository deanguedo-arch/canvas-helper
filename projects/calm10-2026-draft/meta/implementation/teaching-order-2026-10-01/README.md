# Teaching before case interpretation

Dean requested the CE1-04 instructional correction across the remaining lessons. The relevant gap was required prior knowledge: students were reading specific records and answering questions before the lesson explained the concepts needed to interpret them.

## Current implementation

- Canonical learner source: `workspace/index.html`; this folder is evidence and historical copy, not a regeneration owner.
- CE1-04 retains its revised concepts-first opening and method-before-records order.
- The other 39 lessons have new, always-visible foundations before the original first situation. Each explains the topic, essential distinctions, a basic procedure and a small example or contrast, then states what to look for in the case.
- Essential teaching is not hidden in Core vocabulary or a dropdown. Existing dotted-underlined vocabulary buttons support definitions in the prose; headings remain ordinary text.
- Roadmaps begin with foundations. Existing case-specific method sections are labelled “Use the method with the case”; they can use the now-introduced records without requiring unknown background.
- Approved case documents, professional media, original questions/feedback, practice and independent tasks, save keys/task versions, first-attempt history and completion controls are preserved. No new answer or required source stop was added.

## Evidence

- `sequence-audit.json`: original structural inventory; section order alone is not a pedagogical verdict.
- `implemented-foundations.json`: 39 lesson-specific concepts and links to the early question the teaching prepares.
- `before-foundations-index.html`: snapshot immediately before this 39-lesson refinement, including earlier CE1-04, vocabulary and instruction edits. Never restore it over newer canonical work.
- `foundations-copy.cjs`: historical copy specification. `apply-foundations-once.cjs`: historical integration record; do not rerun either as a course builder. The later canonical refinement moved definition buttons from headings into prose.
- `source-preservation.json`: focused current-before comparison. All original response controls, questions/feedback, models, media and signoffs are unchanged; existing edit keys retained; new anchors resolve. CE1-04 is unchanged by this propagation.
- `render-review.json`: selected desktop/phone views of CE1-01, CE1-03, CO1-01, CO2-02, FL2-03, FL3-04 and FL4-05, with working reading links and no overflow/page errors. Screenshots are temporary `/tmp/calm-foundations-<lesson>-<width>.png`; vocabulary-heading relocation was inspected separately afterwards.

This is completed Build-mode instructional work, not rollout certification. Full learner E2E, accessibility/media/captions, Studio lifecycle, doctor/workspace/readiness, SCORM/export and live Brightspace checks remain deferred to an authorized rollout.

Routing: canonical copy and integration stayed with the lead because the boundary includes uncommitted approved work and teacher-facing instructional judgment. Structural inventory, preservation comparison and render inspection used deterministic local tools. No worker, regeneration, commit, deployment or measured token savings.
