# Exemplar transfer workflow — implementation handoff

Status: workflow implemented and focused checks passing; regular ChatGPT Pro v0.1.0 two-lesson return verified, independently reviewed, registered and running in an isolated native preview at http://127.0.0.1:57180/. No accepted sample, teaching certification, canonical integration, bulk course regeneration, deployment or reusable promotion.

## What now runs

- `scripts/lib/exemplar-transfer.ts` validates deliberately adopted `projects/<slug>/meta/exemplar-transfer.json`. Unadopted projects return **unassessed**, without metadata/status changes.
- `scripts/lib/course-authoring/context.ts` and `scripts/lib/intelligence/apply/prompt-pack.ts` invoke the gate. Default intent is **continue**. Missing/stale evidence or pending sample acceptance rejects authoring context/prompt production. Explicit **sample** intent returns the recorded sample routes and stop instruction.
- `scripts/exemplar-transfer.ts` provides a read-only preparation route for blocked/proposal-only projects. It does not enable Studio, change lifecycle or run a builder.
- `scripts/lib/course-standards.ts` uses the existing queue lock, revision guard, pending decisions, scoped immutable releases and inheritance. Proposed reusable corrections pair generation and review instruction files under one correction identity. The queue stores identity/hashes, not private teacher notes. Explicit promotion uses `transferSignature`; no such decision has been made in this task. A lesson-specific correction stays local and creates no reusable proposal. Promoted pairs are read by standards context and fail when their bytes change.

The gate applies to these authoring/prompt entry points, not arbitrary external chats or every legacy course builder. It cannot prevent an author from manually bypassing the workflow outside Canvas Helper. Existing preview serving, edit ownership, normal standards inspection and export checkpoint code were not changed to require sample acceptance. `refreshProjectIntelligence` calls prompt-pack generation from import/refs/analysis/planning with a defer-only option. When the gate stops, ordinary collection continues, `promptPackStatus` is blocked and `promptPackPath` is null; no new authoring prompt is written. Direct authoring generation still throws. The existing prompt file is untouched and does not establish authorized continuation. Actual Chapter17 checks proved both modes and unchanged prior prompt bytes.

## Evidence contract

The record binds exact native/source files, stable strategy, versioned exemplar files, passage locators and extracted teaching decisions. Plans separate purpose, preceding prerequisites, progression, subject requirements, unique activity inference and deferred later homes. Ten Chapter11 decisions have been extracted from actual01/02/06 fragments for Chapter17; no word/example-count rule was introduced.

The sample binding includes its version, exact files, native/source identities, strategy/exemplar/decisions and sample lesson plans. Instructional and technical review files are independently hashed and must identify that binding. Instructional review has findings for all seven drift checks and no unresolved blockers. The teacher decision file must carry Dean, accepted, binding, exact wording and provenance. The implementation does not fabricate that record. Tests use clearly synthetic acceptance fixtures only.

Continuation also binds actual previous-batch files and requires their instructional review against `SHA256(JSON.stringify({acceptedBinding: sampleBinding, files: previousBatchFiles}))`. Changing the sample/reference/source requires renewed review and acceptance; changing a batch invalidates its review.

These are automated evidence-presence/integrity checks. They cannot judge whether a passage is pedagogically necessary, whether cited feedback is truthful or whether a reviewer supplied good judgment. Reading actual passages and instructional review supply that judgment; Dean supplies acceptance. Passing a gate is not teaching-quality certification.

## Chapter17 source/sample readiness

`projects/biology30-chapter-17/meta/exemplar-transfer.json` is the active operational contract. Its companion folder is `meta/teaching-overhaul/2026-10-04-exemplar-transfer/`.

Lesson02 is justified because it tests sufficient prerequisites and deliberate deferral while explaining allele segregation/fertilisation. Native required work demands expected-versus-exact counts, so that minimal distinction cannot simply be deferred. Lesson05 tests justified quantitative reasoning: gametes, chromosome orientation, independence assumptions, genotype/phenotype mapping, probability checks and expected counts. Protected RrTt/rrTt and AaBb tasks must not become new solved examples.

Purpose/activity plans now record actual Pro sample decisions and unique inference demands; they are not accepted copy or prescribed example counts. The original provisional plans and Pro pre-prose/rationale records remain available. Source/native02/05 and all their protected questions were read. Local source hashes are bound. Full complete standards/process and exact Chapter11 selected fragments were read. Original01/03/04 full native routes have now been read from the bound native index. Native03 teaches specified independent multiplication/expected counts but not conditional probability; a selected-sample task would need explicit prerequisite teaching rather than falsely claiming03 supplied it. Native04’s mixed B_/bb versus aa notation and native01’s optional map task before linkage teaching are preserved source issues. The revised provisional plans record these findings.

Existing conversation: https://chatgpt.com/c/6ac1643b-8050-83e8-bcc3-97086bdd58bb . Fresh dedicated Chrome242003925 visibly verified actual Pro5of5. Pro source gate matched3original ZIP CRC/SHA,235manifest entries and17additional members. Complete lesson02/05 manuscripts/fragments/source-practice-feedback/integration/exemplar maps returned as v0.1.0. Archive940b902ea76d7ea068fe21cf3ba856cced571a89f012c3f9e97a89725956f068 verified locally;205checksums and96native ranges recomputed. Exact returned206files plus separate Codex reports are registered under companion sample-return-v0.1.0. Teacher decision absent; bindingd03a337d107cb6950a68dcb72b3bd8ca9b38b878677c23139d78e35d748239e0.

Independent complete learner reading found connected02 chromosome/parentage reasoning, a justified05 genotype-versus-phenotype calculation and fresh joint-model independence transfer. Conditional selection is deferred for a real native03 prerequisite gap. Essential protected concept overlap is disclosed rather than claiming blind assessment. Preview uses exact native shell, two teaching interval edits and no header/style/runtime/key/question changes. Browser checks and limitations are in CODEX_TECHNICAL_REVIEW.md; Dean's teaching acceptance is pending. Other routes remain unassessed.

### Precise entry-point coverage

- `project-context.ts` → `buildProjectAuthoringContext`: default continuation refused; explicit bounded sample mode supported. Existing lifecycle/doctor restrictions remain.
- `pack-agent.ts` and `headroom.ts` → `generatePromptPack`: direct gate before writes. Background `refreshProjectIntelligence` callers (import/intake, refs/analysis, blueprint, assessment-map, lesson-packets) withhold only the prompt and report blocked.
- `agent-delegation/context.ts` → `prepareContext`: adopted **build** packets check continuation directly before generic context fallback/cache/packet writes. Read/review modes retain existing behavior; this guard does not authorize running subagents here.
- `codex-course.ts` / course:create: creates actual learner starter copy plus inherited standard/metadata, but refuses any existing project before staging. It cannot rebuild an adopted existing project. Fresh courses have no deliberate adoption and remain unassessed; no exemplar-quality claim.
- Substantive English unit/factory rebuilds, Social issue generation and course-shell generation now directly check adopted continuation before writes; English whole-course uses the guarded unit path. No builders were run against existing courses.
- Fixed-target historical Biology Unit A pilot/Gate1/Gate2/Pilot2 and B/C/D production generators write learner copy. They have their own exact-build/source gates, reject Chapter17 as a target, and do not yet invoke exemplar acceptance. These projects remain unassessed by this workflow. Recommended next decision: deliberately adopt/test exemplar contracts at those exact generator pipelines if new teaching regeneration is commissioned. Do not infer sample acceptance from their existing technical/build gates.
- `run-studio-release.ts` is release/check orchestration with a nonblocking standards notice, not a new lesson author; no exemplar gate was added to ordinary export/release behavior.
- `buildLessonPackets`, `buildCourseBlueprint`, `buildAssessmentMap` write planning artifacts before background refresh; **not gated as learner prose authorship**. Historical subject builder scripts and direct workspace writes remain outside this gate.
- Manual regular ChatGPT chats cannot be technically blocked by repository code. This task uses the bound prompt and source check explicitly; existing prompt files are retained, not evidence of permission to continue.
- Ordinary doctor, preview, edits and exports remain ungated. No universal automatic adoption/status change is claimed.

## Commands

Read-only sample preparation:

```
node --import tsx scripts/exemplar-transfer.ts --project biology30-chapter-17 --intent sample
```

Continuation uses the same command without `--intent sample`, and is currently expected to stop. Ordinary active course context supports `npm run context:project -- --project <slug> --intent sample`; Chapter17’s blocked lifecycle intentionally still prevents that ordinary active-authoring route.

Focused verification:

```
node --import tsx --test scripts/tests/exemplar-transfer.test.ts scripts/tests/exemplar-correction.test.ts scripts/tests/course-standards.test.ts
```

## Remaining work / decision

The complete sample now exists at http://127.0.0.1:57180/ (original57181/sample57182, synthetic QA57183). Two native teaching interval replacements only; canonical147workspace files still exact. Desktop/responsive native tables, figure/vocabulary/reader/labeling and synthetic native writing/save/progress reload/All My Work checks passed; teacher origin remains0/15. Existing57170/57171/57172 comparison remains intact. No full print/video/LMS/runtime certification.

Dean accepts or requests passage-specific repairs on the exact v0.1.0/binding. That decision establishes the demonstrated reference, not authorization for full Chapter17, universal promotion or deployment. TeacherDecision and continuation remain absent, so actual continuation entry points still stop.

Files modified were narrow additions to existing entry points; unrelated changes in context/prompt-pack were retained. Existing course-standards.ts was already untracked before this task; the task extends its existing content. No commits/pushes/cleanup. Native index, CSS, runtime and project status remain unchanged.

Substantive builder guards establish an adopted acceptance stop before writes; they do not themselves inspect lesson pedagogy or certify all content emitted by a legacy renderer. These whole-course renderers do not yet validate their emitted route set against continuation lesson scope. Do not treat them as bounded batch authorship or run them for this calibration. Manual direct workspace mutations also remain outside software enforcement.


Activity completion correction (4 October 2026): the initial v0.1.0 sample had text-only optional tasks and is superseded for interaction readiness. v0.1.1 completes four native optional response activities, independently tested through save/reload/collection/hint/model/feedback with unchanged required progress. Every response activity now requires its own interaction evidence at continuation. See docs/ops/EXEMPLAR_ACTIVITY_REPAIR_HANDOFF.md. Dean acceptance remains pending; no reusable standard promotion or scaling.
