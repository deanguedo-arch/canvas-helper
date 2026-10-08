# Copy this prompt into Codex first

Work in `deanguedo-arch/canvas-helper` on a Biology 30 Chapters 11–20 teaching-content overhaul.

This request is a full instructional review and rebuild inside the approved course design, not a visual redesign, a prose-shortening pass, or an instruction to regenerate existing activities. The reported feedback is that Chapters 11–15 are stronger and teaching depth drops later. Independently inspect the evidence; do not treat that report as an established audit finding or exempt any chapter.

## Target teaching experience
Write for a student learning Alberta high-school biology for the first time. The student should feel guided by a classroom teacher: a clear starting question; concept-sized explanations; an explanatory visual used like a drawing on the board; complete worked reasoning; a contrasting example when needed; guided practice; a fresh independent attempt; explanatory feedback; and an ending that answers the starting question and leads somewhere. Use contextual video where it adds real teaching value.

A story means a coherent progression of biological questions and explanations, not decorative fiction. Chunk the reasoning without deleting it. Keep the scientific vocabulary and depth required by verified Alberta Biology 30 outcomes. Do not infantilize the student. Do not substitute pictures, bullet lists, vocabulary definitions, resource links, or questions for explanations.

Read the supplied `02_TEACHING_STANDARD.md` and preserve it as the proposed shared standard. If it is not available in this task, create a clearly marked draft standard from this prompt; do not pretend you read an attachment. Finalize the standard and one representative authored batch before scaling the rewrite.

## Division of responsibility
ChatGPT will author and revise the complete learner-facing teaching copy and sequence from the source package. Codex will discover the actual source and build structure, prepare bounded source packages, integrate approved content faithfully, and test the implementation. Do not assume you can automatically call another ChatGPT conversation. The export and return handoff must work through ordinary files.

When approved lesson manuscripts arrive later, do not summarize, paraphrase, simplify, or silently improve them during integration. Report scientific or implementation conflicts explicitly rather than silently changing the approved content or propagating a known error.

## Scope of THIS run: inventory and export only
Do not rewrite live lessons yet. Do not change runtime, styles, assessments, IDs, saved-state behaviour, or unrelated courses. You may create developer-only inventory and handoff files in a suitable isolated project documentation directory. Follow existing repository context, cap, and scope rules.

### A. Establish the actual current course
Read applicable repository guidance. Record the current branch, commit, working-tree state, and relevant local modifications. Locate the real canonical Chapters 11–20 and their authored sources, generated files, build owners, and export paths. Do not assume `main`, an old Pilot 3 build, an old chat handoff, or the newest filename is the student's current course. Historical Pilot 3 files are references only until canonicality is established.

Use repository manifests, build scripts, current project documentation, and actual file relationships as evidence. Do not invent a `biology30-chapter-N` path. When a chapter is missing or its canonical owner cannot be resolved, mark it UNKNOWN or MISSING, document the precise gap, and continue the discoverable work without editing a guessed target.

### B. Make a compact course-wide map
For each chapter 11–20, identify its actual title, canonical path, lesson IDs and titles, teaching sources, available visuals/videos, required checks, vocabulary and reader connections, and shared component owners. Distinguish a source inventory from a finished pedagogical audit. Report observed issues only with an exact lesson/file location and enough evidence to substantiate them.

Map the current feature and state contracts before suggesting structural changes: navigation/routes, activity IDs, answer keys, label mappings, vocab IDs, textbook page mapping, notebooks/Process Collection, print/export, Save and Exit, SCORM save/resume, progress and assessment semantics. Preserve approved features and intentional absences.

### C. Package Chapter 11 for authoring
Create one portable package containing a chapter-level map plus bounded lesson source bundles. Include:
- Complete current learner-facing text for every Chapter 11 lesson, with exact IDs and source locations; do not summarize it away.
- Relevant textbook, teacher notes/PowerPoint content, guided notes, daily plans, and assessment/key material, each identified by actual file and precise page/slide/section. Package only authorized materials available in the project. Resolve LFS pointers or explicitly mark missing bytes; do not mislabel a pointer as the source.
- Verified outcome references and source hierarchy. Missing curriculum evidence remains a gap; do not generate plausible outcome codes.
- Actual asset files needed to review the lessons, with paths, captions, alt text, and any locked mappings. Include evidence of quality issues rather than claiming an image has been reviewed when it has not.
- Existing questions, expected answers, explanatory feedback, resource links and verified page mappings, labelled as formative/graded and preserved/editable.
- A preservation manifest of routes, stable IDs, activity and save-state contracts, and current feature behaviour.
- A proposed conceptual progression and specific instructional gaps to investigate, clearly separated from current course text.
- Source hashes or another reproducible manifest tying the export to the inspected revision and any relevant local changes.

The package must be understandable without the author guessing file paths or reconstructing omitted teaching. Include sufficient source context, but do not dump unrelated courses or all ten chapters into one authoring prompt. Split large material into bounded files while retaining complete relevant content.

### D. Select a bounded first authoring batch
Choose the first two or three coherent Chapter 11 lessons using their real IDs. State why they are a useful calibration batch. Identify, without drafting yet, a later lesson of a different instructional type that will stress-test the standard before mass rollout: for example a process, an abstract comparison, or a quantitative/data-interpretation lesson if such lessons are actually present.

Prepare a tracker with separate states: discovered, source-ready, authored, content-reviewed, integrated, technically-tested, and teacher-accepted. Do not count an outline as authored or an old PASS report as new evidence. Record pending assets and source gaps separately.

## Delivery
Return the package's real location or download link, the identified canonical revision, the first batch's exact lesson IDs, a concise preservation summary, and any blockers. Create the actual files, not merely a proposed list of filenames. Do not commit, push, deploy, publish, or overwrite unrelated work unless separately authorized.

Finish after this inventory/export task. Do not start the ten-chapter rewrite or claim a chapter is complete because its source package exists.
