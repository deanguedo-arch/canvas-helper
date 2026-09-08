# Biology 30 Unit A Pilot — improvement contract

## Current B/C/D continuation

For the newly authorized B/C/D rebuild, start with the [complete execution plan](../../../docs/plans/biology30-bcd-pilot2-rebuild.md), [pinned intake manifest](./bcd-rebuild-intake-manifest.json), [checkpoint](./bcd-rebuild-handoff-checkpoint.json) and [active handoff](../../../docs/ops/ACTIVE_HANDOFF.md). Use final A provisionally; do not mark it accepted or edit A learner content. B/C/D use their owning Biology builder and the saved local checkout. The old source-missing flags predate the newly supplied decks/plans; the new manifest establishes availability, not build readiness. The plan records all latest teacher-order, full-unit delivery, image-comparison and Astra High/Standard decisions. The Pilot 1 contract below remains historical/current guidance only for actual Pilot 1 edits, not the B/C/D owner.

- Workflow: generated-course improvement pilot
- Canonical learner page: `projects/biology30-unit-a-pilot/workspace/index.html`
- Protected baseline: `projects/biology30-unit-a-pilot/raw/`
- Studio authoring driver: `direct-workspace-v1`
- Status: blocked and preview-only while improvements are evaluated
- Starting Unit A tree SHA-256: `4908245ee9e176d647e0f927e1fc3f7db99009a8b50ec7e8ec9a86708a6524f0`

## Purpose

Use this standalone copy to improve Unit A deliberately. Preserve the production Unit A and Units B-D while the pilot establishes a stronger academic, visual, interaction, practice, accessibility, and learner-experience standard.

## Source ownership

- Edit only the canonical pilot files under `projects/biology30-unit-a-pilot/workspace/**` and operational records under `projects/biology30-unit-a-pilot/meta/**`.
- Never edit `raw/**`; it is the exact starting snapshot.
- Never run `build:biology30-unit-a-v2` against this slug. The original Biology renderer owns `biology30-unit-a`, not this direct pilot.
- Never hand-edit or rebuild `biology30-unit-a`, `biology30-unit-b`, `biology30-unit-c`, or `biology30-unit-d` as part of pilot work.
- Keep learner response IDs and persistence keys under the `biology30-unit-a-pilot:` namespace.
- Keep the course preview-only. Do not enable Studio Edit, export, SCORM, upload, or publication until a separate readiness and acceptance phase.

## Textbook and review integration

- `meta/textbook-integration.json` is the exact lesson, page, question, answer-source, guided-practice feedback, Final Practice feedback, and correction contract.
- `npm run prepare:biology30-unit-a-pilot:textbook -- --project biology30-unit-a-pilot` verifies the two immutable archives and regenerates only `workspace/assets/textbook/**`, `workspace/assets/review/**`, and `meta/textbook-resource-report.json`.
- The command must never rewrite `workspace/index.html`; that page remains directly authored.
- The learner Library contains only normalized local textbook Chapters 11–13. The 35-page seminar worksheet is an optional historical copy; the 90-page key remains authoring-only.
- Textbook practice and review are recommended reinforcement. Their attempt/reveal flags never affect the 17 lesson exits, seven artifact checkpoints, required minutes, score, or completion.
- Secure chapter quizzes, quiz keys, the Unit A test, test answers, broken launchers, and teacher-only assessment material remain excluded.
- Lesson textbook links must preserve exact `data-textbook-doc`, `data-textbook-pdf-page`, and `data-textbook-print-page` mappings.
- Each of the 51 guided-practice checks and 24 Final Practice items must add its exact textbook page inside revealed feedback. Label a mapping as closest support when the local lesson corrects, qualifies, or extends what the older textbook actually says. Module checks are outside this feedback-link scope.
- Answer panels remain hidden until the learner confirms an attempt. Hiding an answer does not erase the attempt or any other learner work.
- Lesson 17 is the required capstone in the final `Integration and Mastery` subgroup under Lessons. Review contains only optional review resources. Its learner-facing assessment name is `Final Practice`; its existing 24-question scoring, persistence, and completion behavior remains unchanged.
- Learner-facing practice numbering is one-based within every list: Guided Practice 1-3, Module Checks 1-5, and Final Practice 1-24. Keep durable practice IDs, form names, persistence keys, scoring, and completion behavior unchanged.

## Visual and video integration

- `meta/media-integration.json` is the complete PowerPoint slide, embedded-media, hyperlink, rights, correction, lesson-destination, and video-disposition contract.
- `meta/source-visual-integration.json` owns the nine-image trial: exact source deck/page/media locators, checksums, crop or direct-extraction treatment, lesson destination, accessibility copy, rights status, and release blockers.
- `npm run prepare:biology30-unit-a-pilot:media -- --project biology30-unit-a-pilot --chapter-11-pptx <path> --chapter-12-pptx <path> --chapter-13-pptx <path> --check-video-links` verifies the three immutable deck hashes and regenerates only the content-addressed deck copies, extracted authoring references, and media reports.
- `npm run prepare:biology30-unit-a-pilot:visuals -- --project biology30-unit-a-pilot` verifies the canonical chapter PDFs and deck copies, then transactionally regenerates only `workspace/assets/source-visuals/**` and `meta/source-visual-resource-report.json`. It must never rewrite the canonical HTML.
- The media command must never rewrite `workspace/index.html`; learner visuals and the Video Library remain directly authored.
- Do not use full slides, slide screenshots, presentation text boxes, or unresolved third-party raster images as learner instruction. Preserve an effective course-native interaction or create a corrected semantic redraw when accuracy, rights, or accessibility are unresolved.
- The real `youtube-nocookie.com` preview loads automatically only when its lesson or selected Video Library entry becomes visible. Playback never autostarts, hidden library entries remain unloaded, and every entry retains an exact lesson connection, watch-for prompt, local concept summary, and blocked-network fallback.
- Videos never affect completion, score, required minutes, practice, artifact submission, or persistence state.
- The teacher approved the full optional-video rollout on 2026-09-02. Twelve primary videos now appear beside their exact lesson concepts in Lessons 3–7, 9–10, and 12–16; all 35 available, curriculum-relevant videos appear in the Video Library, sorted by chapter and lesson. The ten unavailable, lower-authority, self-help, study-skills, or out-of-scope links remain excluded.
- The user authorized a nine-image source-visual trial across Lessons 3, 6, 7, 9, 10, 12, and 13. Six stronger anatomy/pathway plates replace exact redundant static figures; three distinct images remain supplemental. Preserve all non-duplicated semantic figures and interactions. Every source image includes responsive enlargement, nearby text equivalence, and an exact textbook-page link where available. Do not expand beyond these nine until this exact trial is reviewed.
- The full 138-slide, 152-asset, 45-video, and three-link inventory remains authoritative. Thirty-five videos are learner-visible; ten remain explicitly excluded by the media contract.

## Core Vocabulary full-pilot contract

- `meta/core-vocabulary.json` is the authoritative 28-family selection, morphology, meaning, mechanism, confusion, lesson/outcome, textbook, practice, model, Frayer, source, rights, and persistence contract.
- Preserve the existing 109-term Glossary and Data route as the complete quick-reference inventory. Core Vocabulary is a smaller instructional layer, not a replacement glossary or a definition-matching quiz.
- The exact five-family Stage 1 slice was teacher-accepted on 2026-09-02. Preserve its workspace/report hashes in `stage1Review`; that acceptance authorized the full rollout but does not accept the complete Stage 2 build.
- The learner route now renders all 28 contract families, all six fixed Frayer milestones—Negative feedback, Action potential, Reflex arc, Sensory transduction, Endocrine signalling, and revised Homeostasis—and 22 eligible learner-choice families. Learners may select no more than two additional families.
- Every Frayer uses contextual definition, essential mechanism, Unit A evidence, and non-example/common-confusion fields with 240-character limits. The model stays hidden until all four fields contain an attempt and never overwrites learner work.
- Process Collection derives collected vocabulary entries from canonical response fields. Removing an entry clears only its collection flag; it never deletes its writing.
- Compact state version 3 must accept version-2 state, reject unknown vocabulary IDs, cap choices at two and collection at eight, store Frayer text only in `responses`, and preserve the existing last-valid-state overflow guard.
- The conservative combined envelope is 41,378 characters, leaving 6,622 characters below the 48,000-character guard. Vocabulary must remain absent from course completion and score logic.
- All 17 lessons contain their exact contracted Word Lens sequence and deep-link to the selected concept heading. Preserve every existing lesson, response, practice, artifact, minute, score, and completion identifier.
- The current exact learner build SHA-256 is `b270081c9152a83b935bc2ddcb45d9fdcfc5742f3902ae03bf3abb07b945d0ee`; workspace-tree SHA-256 is `61396aee1fec5e4c35fd408a2629ca05abda82df584a2db47e46444c37e361dc`.
- The Stage 2 report is `.runtime/biology30-unit-a-core-vocabulary-pilot-visual-audit/2026-09-03T01-08-03-419Z/visual-audit.json`, SHA-256 `6fac8fd887e27509bc4f0183ecbabaea9496396af928c11a516c439e36ed6db0`. All seven sheets were opened; 84 concept-entry viewports, 30 learner-state viewports, 51 Word Lens viewports, and two 200% zoom views produced zero geometry findings.
- Stage 2 is Codex-verified and awaits exact-build teacher review. Do not mark the rule accepted, transfer it to Units B-D, redeploy, export, promote, enable Studio Edit, commit, or push without separate authorization.

## Improvement loop

Read `meta/unit-a-to-bcd-improvement-playbook.md` before continuing pilot work. It is the canonical chronological decision journal, minute operating runbook, failure/rollback guide, and B-D transfer process. For image work, also read `meta/image-generation-prompts.md`, `meta/generated-visual-integration.json`, and `meta/visual-comparison/teacher-decisions.json`. `meta/improvement-ledger.json` remains the machine-readable evidence and review-status source.

1. Record the current learner-facing weakness and its evidence.
2. Make the smallest coherent improvement in the pilot canonical workspace.
3. Verify academic accuracy, responsive layout, keyboard use, accessibility, offline behavior, and persistence in proportion to the change.
4. Record the accepted before-and-after principle in `meta/improvement-ledger.json`.
5. Classify the rule as shared-shell, renderer, content, figure, interaction, practice, or review-process work.
6. State whether the rule applies automatically, conditionally, or not at all to Units B-D.

The pilot is not complete merely because it looks better. Its accepted rules must be specific enough to test and to translate through the separate B-D owning builder.

## Process Collection contract

- The learner-facing route name is **Process Collection**. Preserve the internal `investigation-notebook` route, `bioState.notebook`, and existing notebook persistence keys so saved work and links do not drift.
- Process Collection displays all non-empty lesson exit responses in lesson order by reading their existing `biology30-unit-a-pilot:lesson:NN:exit` response records. Never create a duplicate persisted exit-slip collection.
- Show whether each exit is a saved draft or belongs to a completed lesson, and provide a keyboard-safe deep link back to the canonical exit-slip section.
- Learner-created process notes remain a separate collection. Removing one may change only the corresponding manual-note record; it must not erase an exit response, artifact, practice result, or lesson completion.
- Include saved exits in copy/print summaries and keep empty exits out of the rendered collection.
- A future B-D implementation must be made in `scripts/lib/biology30-course/v1/` and unit production records after auditing that unit's response ownership. Do not copy the Unit A workspace implementation into generated B-D workspaces.
