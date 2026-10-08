# Biology 30 teaching standard — Chapters 11–20
Version 1.0 | Proposed authoring and acceptance standard | 2 October 2026

## Purpose
Rebuild the teaching inside the approved course design. This is not a summary, a cosmetic teacher-voice pass, an activity-count exercise, or a new interface. A student encountering a concept for the first time should be able to understand it and attempt the practice without an adult supplying the missing explanation.

The teacher feedback is the starting requirement: concept, explanatory image, worked examples, steps, useful video, and practice; understandable classroom-teacher language; manageable chunks; a clear starting point and progression. Chapters 11–15 are reportedly stronger than later chapters. That report is a hypothesis to investigate, not permission to exempt earlier chapters or claim that later chapters have already been audited.

## 1. Audience and voice
Write as an experienced Alberta high-school biology teacher speaking directly to a student. Use respectful, clear language without baby talk, artificial enthusiasm, filler, or university-lecture density. Retain the vocabulary and reasoning demanded by the verified Biology 30 outcomes.

Useful teaching moves include: "Start by looking at...", "Notice what changed...", "That matters because...", "Here is where these two processes differ...", and "Before you move on, explain why..." Use them naturally, not as a repeated script.

Introduce a new term when the student needs the idea. Explain its meaning in the lesson before expecting the student to use it. A vocabulary popup supports instruction; it does not replace instruction. Avoid opening with a pile of definitions or saying only that a process "plays a vital role."

## 2. Source authority
Separate scope, science, teaching voice, and presentation:
- Verified Alberta Biology 30 outcomes control required scope and level. Record the source and version; never invent outcome codes.
- The supplied textbook controls the course's scientific account, supported by authoritative verification when a genuine error or ambiguity needs resolution.
- Supplied teacher PowerPoints, guided notes, and daily plans guide classroom language, emphasis, sequence, and likely misconceptions. They do not justify removing required science.
- Existing assessments and keys identify expected evidence. They are not a substitute for teaching or unquestionable scientific authorities.
- The current approved course controls the delivery shell and interaction contracts. Historical Pilot 3 examples are references, not an instruction to restore an obsolete runtime.

Record source conflicts, page references, and editorial choices in developer-only documentation. Do not expose references to teacher slides, missing source files, source corrections, author instructions, or audit notes in learner-facing copy. Explain necessary content in the lesson itself. Textbook reading and video are supplementary support, not the only place where the lesson teaches an essential concept.

## 3. A chapter needs a connected path
Before drafting, define the chapter's central question, starting knowledge, destination, and why its lessons occur in their proposed order. Every lesson should contribute to that progression. A story is a connected explanation, not a fictional character or decorative anecdote.

Each lesson should establish a concrete phenomenon, question, problem, diagram, or observation. Activate only the prerequisite knowledge actually needed. End by answering the opening question and making the next lesson's question understandable. Do not begin every small paragraph with a new hook or force one scenario across unrelated material.

## 4. Teach in concept-sized chunks
A chunk has one clear instructional job. Usually use a short heading and a few short paragraphs, with the visual, example, or check adjacent to the explanation it supports. Add another chunk when the reasoning changes, not merely when a word count is reached.

Chunking means smaller steps, not less explanation. Do not impose a total-word reduction or compress later chapters to fit a response. Do not hide essential teaching in collapsed panels. Optional depth may be collapsible; necessary explanations remain in the main learning path. Do not introduce click-through or assessment gates merely to enforce the sequence.

For a substantial concept, adapt this progression:
1. Establish the question and the prerequisite idea.
2. Explain the concept and its mechanism in ordinary teacher language.
3. Show it in a purposeful board-style visual and teach the student how to read that visual.
4. Work through a complete example, explaining every meaningful step.
5. Add a contrasting or transfer example when one case would leave the principle unclear.
6. Give a guided attempt with a useful hint and a complete explained solution.
7. Give a fresh independent attempt with feedback after the attempt.
8. Return to the opening question and connect forward.

Place verified video support where it resolves a real visual or procedural difficulty. Do not add a video or a second image to every minor definition solely to fill a template. These are teaching functions, not mandatory repeated learner-facing section titles.

## 5. Explain mechanisms rather than naming parts
For a process, explain the starting conditions, relevant structures, what changes at each stage, why that change leads to the next stage, and the outcome. Distinguish sequence from causation.

For structure and function, show where a part is, what it does, how its features support that function, and how it relates to nearby structures. A labelled picture by itself is not an explanation.

For comparisons, establish common dimensions and interpret the differences. A table of labels does not finish the teaching.

For genetics, calculations, graphs, and experimental evidence, state the givens, explain symbols and axes, justify the method, work through the reasoning, check the result, and interpret its biological meaning. Include assumptions where they matter. Adapt the instructional pattern to the content; do not force every chapter into the same style of example.

## 6. The board-drawing standard for visuals
A visual must answer a specific teaching question. Prefer a small staged diagram, purposeful crop, annotated sequence, or a clearly guided reading of an existing approved image over a dense decorative infographic.

For each visual provide a developer-only specification with:
- stable asset ID or exact existing path;
- the concept it teaches and the sentence where it belongs;
- what appears first, what is added next, and where the student should look;
- exact required labels and what every arrow, colour, line, symbol, and boundary means;
- caption and accessible text description;
- scientific constraints, source support, and any locked activity letter mappings;
- status: approved existing asset, new asset needed, or existing asset needs revision.

The learner-facing explanation must explicitly use the figure: point to the relevant feature and explain what to notice and why. Never call a storyboard or image-generation prompt a completed image. Missing essential visuals block release of the affected lesson; continue other unblocked work. Do not silently publish placeholders. Reuse approved artwork unless its actual instructional purpose requires a reviewed change.

## 7. Worked examples and practice
A worked example contains the question, relevant information, a reasoned solution, an explanation of each important choice, and a conclusion linked to the concept. A scenario followed immediately by an answer is not a worked example.

Use additional examples to expose a genuine difference: changed conditions, a counterexample, an unfamiliar representation, a different mechanism, or a likely mistake. Renaming the character or changing an irrelevant number is not meaningful variation.

Guided practice should remove some scaffolding, not all of it. Independent practice should be a fresh application of what was taught, not the worked example with cosmetic edits. Use more than recognition questions when the outcome requires explanation, prediction, sequencing, interpretation, comparison, or calculation.

Every new practice item needs an answer or marking guide and explanatory feedback. Feedback should identify the reasoning, address the likely mistake, and help the student recover. For open responses, use model answers and explicit criteria; do not claim reliable automatic grading unless the existing implementation actually supports it. Avoid revealing solutions before an attempt unless the student intentionally opens a hint or solution using the established pattern.

Keep required graded checks and their saved-state semantics unchanged unless a specific assessment revision is separately approved. New formative items get distinct, namespaced IDs and must not silently alter marks, completion, gating, or tracking. Do not reuse an old ID for a materially different question.

## 8. Video and reading support
Use existing approved resources first. Verify new resources before naming them as usable. Record the precise learning purpose, placement, viewing question, and follow-up application. Supply timestamps only when verified. Distinguish "page reachable" from "video playable in the target LMS."

Essential teaching must still be present in the course if a video is blocked. When a suitable clip is unavailable, document the gap and supply a proposed teacher-recording script or storyboard in the developer handoff. Do not invent URLs or imply a recording exists.

Preserve contextual textbook links that open the embedded reader at the intended printed page. Record printed-page and PDF-page mappings separately; test the actual behaviour. Preserve in-context vocabulary links to the correct core vocabulary entry.

## 9. Preserve delivery behaviour
Preserve the approved layout, typography, navigation, sidebars, chapter-completion instructions, reader, vocabulary system, practice areas, required checks, diagrams, videos, Process Collection, notebook/response workspaces, print/export, backups, Save and Exit, SCORM save/resume, existing progress semantics, accessibility, and teacher controls where present in the current canonical build.

Verify which features actually exist; do not reintroduce a feature previously removed or add another runtime/state owner. Allow instructional reordering inside a lesson. A split, merge, route change, or assessment change needs an explicit mapping and regression plan before implementation. Preserve student work and stable answer/label mappings.

## 10. Acceptance requires evidence
For each required outcome or essential concept, map the exact place it is explained, visually supported where needed, modelled in an example, and practised or assessed at the appropriate level. Record missing support honestly. Not every minor fact needs its own diagram and exercise, but no substantive outcome may disappear into a heading, link, or optional resource.

A reviewer must read the actual lesson as a first-time learner. Fail any consequential missing causal step, untaught requirement in practice, misleading visual, unsupported scientific claim, or essential dependence on an unavailable resource. Do not pass a lesson because headings exist or a numerical rubric average is high.

Technical acceptance is separate: build/validation, links and assets, mobile and desktop rendering, keyboard use, labels and answer keys, fresh and resumed state, save/exit, print output, and the established SCORM path. State precisely what was run, what passed, what failed, and what requires Brightspace testing. An unperformed test is UNTESTED, not PASS.
