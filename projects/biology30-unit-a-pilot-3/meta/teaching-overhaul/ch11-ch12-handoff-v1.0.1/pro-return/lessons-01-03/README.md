# Chapter 11 lessons 1–3: complete teaching checkpoint

Version 1.0.0, 6 October 2026. Full source-grounded teaching manuscripts, inert native-style teaching fragments, actual unchanged source figures, six optional formative proposals, complete source/placement/control maps and frozen original routes are included. No current course owner was edited.

Open `reading-preview.html` for complete readable teaching and unchanged original check prompts. The separate Library HTML embeds all images for a self-contained reading copy. Response, vocabulary and video controls are inactive; this is not a working course or an accepted native integration.

## What the batch changes

- Lesson 1 now traces a complete regulatory example, separates detection/integration/output, and provides a minimal nervous-system organization preview before the existing systems-table question
- Lesson 2 explains the action potential sufficiently at first use, explicitly reads the continuous axon and myelin figures, and distinguishes receiving, conducting and transmitting failures
- Lesson 3 works a brain-mediated response and a spinal withdrawal circuit, compares their processing, and uses supplied hypothetical branch interruptions for a genuinely different inference
- Every new task supplies its stimulus, question, hint, complete model, criteria and explanatory correction. Questions remain optional and ungraded, with distinct proposed IDs

## Preservation and boundaries

`maps/INTEGRATION_MAP.json` binds individual original teaching sections to the exact owner and before/after hashes. It does not authorize a broad route overwrite. Original route snapshots and every nonteaching chunk are retained separately. Original figure blocks and nested video sections are retained exactly in the teaching fragments. Source asset bytes remain unchanged.

Existing header directions, reader links, original required checks, optional source activities and native runtime are outside the proposed teaching replacement. The writing-only direction correction is provided separately in `maps/INSTRUCTION_CORRECTIONS.md`. Original questions and keys are unchanged. Teacher-key contradictions are decisions in `maps/ASSESSMENT_DECISIONS.md`.

Replaced prose editor keys and vocabulary bindings are inventoried for exact native realization. This handoff does not claim that all new prose has active vocabulary/editor bindings. The implementer must retain the listed identities on semantically corresponding nodes, add distinct new keys as needed, and stop rather than drop a binding or silently reuse it for another activity.

## New response-control proposal

Chapter 11's current runtime uses optional writing activities, not Chapter 17's note fields. Each proposed task should use its own `section.activity[data-activity][data-activity-mode="writing"]`, with no `data-required-check`. Required selectors are `data-start`, `data-timer`, `data-run-status`, `data-run-body`, one `.question[data-question]`, textarea `data-writing` and `data-answer-limit="3200"`, `data-submit-writing`, `data-writing-status`, `data-submit-run`, and `data-redo`.

Place the stimulus and question inside the question owner. Keep hints/models/criteria outside that question owner so prompt snapshots do not include the answer. Use distinct proposed IDs from PRACTICE_MAP, with `-written` for the response. The intended flow is Start, attempt, Save written response, deliberate comparison, revision/resave if wanted, Submit and finish. No automatic accuracy grade, new required progress, replacement namespace or save schema is proposed.

That flow is specified, not implemented. Future authorized integration must verify entry, save, draft changes, reload/navigation, All My Work, redo/history, model access and unchanged 12-check progress on a synthetic origin. No learner state is read, copied or migrated by this package.

## Continuity and review

Read `CONTINUITY_LEDGER.md`, `reviews/INDEPENDENT_REVIEW.md`, and `reviews/RESPONSE_TO_REVIEW.md`. The independent manuscript read found no consequential source/prerequisite defect, with minor clarity and link corrections incorporated. This does not establish Dean's exact-copy acceptance or runtime/LMS readiness. Further chapters continue under the same source-led process rather than waiting for a new generic method approval.

The current stopping boundary is manuscript preparation. Any Codex work requires Dean's separate approval of the exact scope, model and reasoning settings before it starts.
