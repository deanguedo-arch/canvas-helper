# Execute the complete Math 10C Chapter 4 quality repair

**Work order:** CH4-REPAIR-2026-09-24  
**Requested output:** edited course source, corrected generation workflow, executable regressions, and an evidence-backed local review candidate—not another plan.  
**Scope:** all eight existing Chapter 4 lessons and all 32 existing logical targets.  
**Release authority:** local implementation and local review packaging only. Production deployment, learner rollout, grade writing, and human acceptance remain unauthorized.

## 1. The outcome and the completion boundary

Repair Chapter 4 so it teaches and supports independent mathematical performance to the selected Chapter 3 benchmark. Matching section names, styling, example counts, or question-bank tags is insufficient.

A learner must be able to understand the mathematics, make meaningful working decisions, receive accurate component-specific feedback, repair a difficulty, return to preserved work, demonstrate on different mathematics without help, and revisit it later. Prepared learners need a direct demonstration route. Students may use paper for full working; selected in-course decisions and evidence must remain meaningful.

Completion is not mastery. Four-check practice credit is not independent mastery. A supported correction is useful learning, but does not become a fresh unaided first-check success. Do not grade unrestricted explanations by keywords or length.

**Finish the entire Chapter 4 repair in this execution.** Lesson 4.3 is an internal calibration milestone, not the final deliverable. Do not stop after a plan, one improved lesson, a parser, a larger bank, screenshots, or an updated prompt. Do not pause for routine approval between lessons. Complete all work that is safely supported by the available evidence, and report genuine unresolved dependencies explicitly.

This instruction does not authorize inventing source material, approving an unresolved policy change, modifying unrelated work, or claiming tests passed when they did not. An affected gate may remain blocked without stopping independent repairs.

## 2. Read the requirements and establish the actual baseline

Read the applicable repository instructions and these supplied files before editing:

- `references/Math10C_Chapter4_Quality_Standard/01_COMPARATIVE_AUDIT.md`
- `references/Math10C_Chapter4_Quality_Standard/02_CODEX_GENERATION_STANDARD.md`
- `references/Math10C_Chapter4_Quality_Standard/03_CHAPTER4_CORRECTIVE_HANDOFF.md`
- `references/Math10C_Chapter4_Quality_Standard/04_TEACHING_CALIBRATION_4_3.md`
- `references/Math10C_Chapter4_Quality_Standard/05_TARGET_CONTRACT_TEMPLATE.json`
- `references/Math10C_Chapter4_Quality_Standard/06_ACCEPTANCE_GATES.md`
- The supplied audit scripts and their limitations under that reference directory's `evidence/` folder.

The historical comparison input is included as `audit_input/Math10C_Chapter3_vs_Chapter4_Quality_Audit_2026-09-24.zip`. Its expected SHA-256 is `d88ad3bffb9fd0f3496c7bc68766c44bff6742dcf044db9e7158a220ecbc2c2c`. This is a reproduction fixture, not proof of the current checkout's contents.

The recorded canonical Chapter 4 workspace is:

`projects/math10c-unit4-pilot/workspace/`

Locate the current canonical authoring inputs, build commands, generated outputs, and actual generation entrypoint/prompt pack. Record HEAD, relevant dirty-file hashes, source paths, selected Chapter 3 benchmark revision, policy/state versions, and baseline test results. Preserve pre-existing changes. Do not reset, overwrite, stage, or commit unrelated work.

Locate the actual approved Chapter 4 source packet, including the resources referenced as `projects/resources/math10c-production/v1/source-manifest.json` and `chapter4/production-contract.json`. Resolve the latter through its actual owning resource directory; do not invent an absolute repository path. A source-map label is not the source content.

Inspect the original mathematical source text and relevant diagrams/pages where needed. Keep provenance and editorial decisions developer-only. If a source is genuinely unavailable, record the exact missing dependency, avoid claims of curriculum/source completeness, and continue supported repairs. Do not silently replace an unavailable source with generic material or reduce the intended scope to what happens to be easiest to generate.

For every audit finding, determine whether it reproduces on the current baseline. A finding already repaired requires a passing regression, not an unnecessary rewrite. Do not treat a dated archive as the current production candidate.

**Precedence:** this work order defines execution scope; the September 24 corrective handoff, generation standard, and acceptance gates define the detailed repair requirements. The audit supplies counterexamples. The actual explicitly approved mastery policy governs scoring; its shorthand below is not permission to invent policy. Older factoring-only prototype scopes, planning-only instructions, or candidate numerical storage allocations do not restrict this whole-Chapter-4 work order. Retain their applicable preservation principles, not obsolete implementation limits.

## 3. Preservation and architecture requirements

Preserve the existing eight lesson routes, 32 logical target identities, completion identities, state namespace, learner drafts, selected/protected work, and meaningful resource/help/print/navigation features. Do not shrink the chapter to get a green result. Keep optional textbook SCORM outside automated mastery. Formal grades and teacher confirmation remain separate.

Keep old task instances resolvable with their original givens and meaning. Changed mathematics, evidence contracts, or policy require explicit versions and conservative migration. Retain historical results as historical; do not clear them or reinterpret them as stronger new evidence.

Reuse existing approved navigation, input, support/exposure, evidence, state-owner, and reporting interfaces. Chapter-specific mathematical adapters need their own reviewed contracts. Do not copy factoring algorithms into radical tasks or build a weaker independent mastery engine for Chapter 4.

Do not edit Chapter 3 content, loosen its tests, or change its runtime behaviour indirectly. Do not create a second LMS saver, add runtime AI grading, add student-data services, weaken security policy, or introduce unapproved network dependencies. Any unavoidable shared-runtime change outside the authorized Chapter 4 boundary must be isolated as a proposed patch with its affected gates marked blocked; it must not be silently deployed or described as integrated.

Routine explanations, examples, hints, repair text and instructions must have a named canonical owner and remain editable through the existing supported authoring route. Editing a generated export or a test reference is not a production-source repair. Avoid duplicate wording sources that overwrite teacher edits. Preserve a supported way to withdraw faulty activities without erasing work or stranding learners; do not build a new administration platform as a substitute.

## 4. Close every audit finding with observable behaviour

Create a Q01–Q16 closure register before editing. Each row must eventually identify the source changes, regression or review evidence, and remaining limitations. The requirements below are not satisfied by the presence of a heading, DOM class, button, tag, or answer list.

### Q01–Q04: teaching, sequence, guided work, and focused support

For every essential target, map the actual source demand to teaching, worked decisions, guided/faded practice, repair, independent evidence, transfer/reasoning, and later evidence. Multiple targets can share an activity where that activity genuinely addresses them.

Explain the meaning and justification of consequential transformations. Include a useful contrast or nonexample where it changes the required decision. Explain original domain restrictions and verification when relevant. Do not enforce a word quota or copy Chapter 3's length mechanically.

Fix the 4.3 prerequisite jump. Its first required examples must not rely on the unexplained conversion of a negative exponent to a reciprocal before 4.5. Use already-taught exponent cases first, or teach an adequate explicit bridge before requiring that step.

Every lesson's guided practice must leave a pivotal decision unrevealed until the learner attempts it or deliberately requests mathematical support. For example, a prompt asking the learner to choose a perfect-square factor must not simultaneously provide `180 = 36 × 5`. Such a display is a worked example, not guided input.

Include genuinely faded work: remove some previously supplied organization or decisions. The independent route must not supply the complete method sequence in field labels and then claim the learner chose it independently. Preserve guided component checking as a separate useful route.

A focused repair must implement the entire sequence:

**observed error → defensible explanation of that decision → short relevant teaching → focused learner attempt with feedback → return to original preserved working → different independent opportunity.**

A field hint or “review this lesson” link alone does not satisfy this requirement. When an answer does not identify the cause, ask a discriminating question rather than inventing a misconception.

### Q05–Q07: real practice supply, review coverage, and uncued selection

Replace rotating eight-question windows with reviewed parameterized families where appropriate, and varied authored tasks where parameterization would weaken the reasoning. Specify mathematical domains, structures, representations and difficulty; do not just increase a question count.

**New engineering workload for this repair, not a student quota:** test ten successive five-question fresh practice sets per lesson, with fifty distinct mathematical instances per lesson before intentionally labelled repetition. Test structure/representation coverage as well as uniqueness. A variable rename, reordered display, route change, or new seed does not establish a new mathematical instance. This workload is a minimum supply stress test, not a claim of infinite variation or mastery from repetition.

After representative example/practice/support exposure, demonstrate that each target still has enough fresh qualifying work to reach the approved stages, including recovery after a revealed or unsuccessful qualifying attempt. Finite exhaustion must be honest, preserve work, and offer a reviewed alternative. It must not routinely require a teacher/reset because the bank is shallow. Do not resolve the audited shortage merely by renaming “fresh” while leaving the weak supply unchanged.

Implement the existing promise that two balanced review sets cover all 32 targets. Verify coverage from the questions and required responses actually selected, not unused tags in the bank. Review coverage does not itself award mastery. Students are not required to complete every set to establish competence.

For independently uncued mixed/review method-selection tasks, hide gratuitous lesson names, target names, and method cues until after submission. Keep mathematically necessary givens, units and clear instructions. Route recommendations from the actual target/error evidence instead of only a lowest-scoring lesson average.

### Q08: correct mathematics and requested form

Replace brittle normalized-answer-list verdicts with reviewed bounded semantic checking appropriate to the supported radical, exponent, monomial and exact-number domains. Keep separate outcomes for blank input, malformed input, unsupported notation, mathematical error, equivalent-but-not-requested form, correct intermediate work, and complete success.

Add and run these literal regression responses through the actual learner input path:

| Task | Learner response | Required result |
|---|---|---|
| Simplify `sqrt(75)` | `sqrt(3)*5` | Accept as equivalent to `5*sqrt(3)` in the requested simplified form. |
| Simplify `(2ab^2)^3` | `8b^6a^3` | Accept harmless factor reordering. |
| Simplify `(3m/4)^2` | `(9/16)*m^2` | Accept the equivalent coefficient/fraction arrangement. |
| Evaluate `(2/3)^-3`, with no fraction-only requirement | `3.375` | Accept the exact value `27/8`. A newly introduced form condition requires a versioned, visible prompt, not retroactive rejection. |
| Tasks using supported negative values/exponents | Input entered with the toolbar's Unicode minus `−` | Interpret consistently with ASCII minus where syntactically applicable. |

Also test plausible wrong answers, non-equivalent near-misses, unsimplified equivalents, denominator grouping, signs, relevant radical indices, and domain restrictions. Do not use `eval`, random numerical sampling, or canonical-answer membership as the production algebra correctness oracle. A universal CAS is not required. Unsupported notation must preserve work and offer input assistance rather than invent a mathematical error.

### Q09: meaningful reasoning rather than a password

For Error Detective's `sqrt(70)=35` claim, do not reject “Compare 70 with 64 and 81, which are nearby perfect squares.” because it lacks a canned word.

Replace unrestricted keyword grading with bounded mathematical decisions that actually demonstrate the construct—for example, identify the invalid operation, provide the relevant powers and interval, and repair the result. Retain any accompanying free explanation for teacher review unless a separately validated checking contract exists. A sentence containing “bracket” is not automatically correct reasoning; absence of that word is not wrong mathematics.

### Q10: policy parity and component-level evidence

Use the latest explicitly owner-approved Chapter 3 policy and record its exact version. The intended structure is **0/25/50/75/100**, distinguishing first independent evidence, consistency, changed-form/checked-reasoning evidence, and delayed evidence. Preserve the exact approved recent-evidence, variation, support, confirmed-gap and timing rules. This shorthand is not permission to change newer approved rules.

Correct Chapter 4's unapproved omission of the 50 stage unless an actual later owner decision authorizes it. If genuinely contradictory authority cannot be resolved from the available record, identify the exact conflict and leave the affected scoring gate unapproved while completing other work. Do not silently invent a compromise.

Only fresh, predesignated, unaided first mathematical checks can establish independent evidence. Four-check practice credit and supported correction must be stored and labelled separately. Accessibility and notation help alone are not mathematical assistance. “Independent” means without relevant in-course mathematical support, not that outside help was impossible or monitored.

Define a versioned per-task/per-component evidence contract. Credit only targets and stages the submitted components actually demonstrate. The 4.1 cube-edge task must not advance rational/irrational classification or ordering targets unless distinct required responses genuinely elicit those constructs. A tag or lesson-wide success Boolean is insufficient.

A task may legitimately support multiple targets; do not turn the fix into four compulsory worksheets. One wrong component must not become four false diagnoses. A single slip should not erase an established stage contrary to the approved confirmed-gap policy. An aggregate score must not conceal a missing essential target. Waiting for delayed evidence must not block learning.

### Q11: blank/input handling versus mathematical help

Test both branches explicitly:

1. Enter only the correct coefficient `3` on the relevant 4.2 task and leave other fields blank. A request to complete missing fields, with no substantive mathematical feedback, must not mark the attempt mathematically supported or consume a mathematical check.
2. Submit incomplete work containing an actual mathematical mistake. If the interface diagnoses or helps with that mathematics, preserve the support before the next submission; a later corrected entry cannot receive fresh unaided first-check credit.

Purely blank submissions must not reveal mathematical answers. Switching accessible input methods must not erase work or change independence. Support used later must not retroactively rewrite the conditions of an earlier completed submission.

### Q12: fourth-check recovery

Replay the 4.1 case with exact-root response `99`, other required entries correct, and four unsuccessful checks. Retain the first and final/selected working. Keep a working direct repair route and a next independent instance or reviewed alternative available.

Four checks can limit credit on one instance; they cannot end learning. Do not require state reset, export/archive chores, teacher intervention, page-reload tricks, or loss of original work to continue. Reopening the same exposed mathematics is not a new independent attempt.

### Q13: shared mathematical freshness

Use one exposure contract across authored examples, guided work, ordinary practice, tools/solutions where relevant, Error Detective, workshop, mixed practice and review. Namespace storage identities by course/lesson/task/version, and separately compare the actual mathematics and response demand.

Test the known cross-route overlaps `sqrt(196)` and `3sqrt(5) = sqrt(45)`. Exposure in one route must prevent the same demand from silently earning fresh evidence elsewhere. Renaming a variable, reseeding, or changing a task version/route alone must not wash away exposure. Conversely, the same final numerical answer does not by itself make two different tasks identical.

Allocate/consume queued items when actually presented, not merely when an unseen batch is prepared. Preserve support/exposure through reload, migration and history compaction. Register when examples or answers are genuinely presented; do not consume every hidden question just because it exists in the bank.

### Q14–Q16: domains, student-facing language, and usability

The exponent-law tool must retain original restrictions. Specifically, `x^-2 * x^2 = 1` must retain `x != 0`. Test every enabled operation/domain boundary, including relevant zero and negative exponents; simplification does not erase an original restriction.

Improve tools through a mathematical prediction/observation/explanation where it teaches the intended relationship. Relevant visual representations include bounds on a number line, factors grouped by root index, and the scope of an outside exponent. Provide equivalent accessible givens. Do not add decoration, unrelated media, or images simply to meet a count.

Remove CBE/NXT reconstruction, task-version, source-reconciliation and save-envelope engineering commentary from learner teaching. Retain truthful plain-language save, help, evidence and history limitations. Lessons must teach without requiring unavailable teacher slides or notes.

Keep the existing visual shell. Use context-appropriate inputs and optional notation controls instead of permanently repeating an algebra toolbar beneath every bound or unit field. Preserve labels, keyboard operation, feedback, focus, drafts, print access and equivalent input paths. Viewport screenshots are not real-device accessibility acceptance.

## 5. Lesson-specific teaching requirements

Apply the source-verified scope and the complete learning sequence above to every lesson:

| Lesson | Required emphasis |
|---|---|
| **4.1** | Principal-root meaning; classification versus approximation versus ordering; choosing bounds; number-line/geometry connections; relevant dimensions and units. Do not credit unasked classification or ordering from a cube-edge answer. |
| **4.2** | Why perfect-power factors can be extracted; alternative valid extraction paths; complete versus incomplete simplification; why a coefficient entering a radical is raised to its index; square-root versus cube-root contrasts. |
| **4.3** | Derive product, quotient and zero-exponent rules; distinguish coefficients from exponents; begin with single-base examples; retain original restrictions; provide a real guided decision, faded organization, specific operation-error repair and different uncued evidence. Avoid the unexplained 4.5 prerequisite. |
| **4.4** | Scope of an outside exponent through expanded products or boxed bases; coefficient/sign decisions; powers of quotients; explicit denominator grouping; contrast a power of a product with other operations. |
| **4.5** | Derive reciprocal meaning before using “move across the bar”; distinguish a negative base from a negative exponent; teach numerator/denominator decisions and preserve original restrictions; accept valid exact coefficient arrangements. |
| **4.6** | Explain denominator/index and numerator/power relationships; compare permitted evaluation orders; teach relevant real-number domains; have the learner choose and justify rather than copy a displayed conversion. |
| **4.7** | Organize multistep method choices with annotated working and valid alternatives; use an actual context and relationship when calling a task a model; preserve relevant restrictions and verification. |
| **4.8** | Uncued method selection and changed representations/contexts; meaningful application, reasonableness and communication; elicit any strategy comparison or explanation that receives credit. |

Use `04_TEACHING_CALIBRATION_4_3.md` as a depth example, not automatically approved curriculum text. Adapt it to the actual source and integrate it into the real lesson. Keep its author-only key out of independent prompts. The teacher review gate remains open even after an internal model review.

## 6. State, teacher evidence, and packaging correctness

Keep the immutable first mathematical submission, final/selected correction, original problem/givens, required working, support-before-submission, mathematical fingerprint and policy/task versions under the approved bounded retention policy.

Demonstrate that retained evidence is actually available in the learner's work view and intended teacher projection. A score or attempt count alone is not the submitted work. Distinguish saved, downloaded, submitted and teacher-confirmed states. Use real configured destinations only; unresolved destinations must stay visibly unconfigured and block learner-release claims, not unrelated local implementation.

Compaction must preserve current evidence meaning and any practice marks promised to persist. Storage operations alone must not lower a score, erase a confirmed capability, forget support/exposure, or create fresh eligibility. Migrations must keep historical claims distinguishable from new-policy evidence.

Measure the actual serialized application state and complete SCORM envelope separately, including encoding, escaping, metadata and recovery overhead. Identify current limits from the actual implementation; do not copy an old pilot's numerical budget. Exercise the modeled full path and allowed stress combinations: long/high-entropy/Unicode responses, corrections, support history, protected work, migrated records, repeated practice, conflicts and save failure.

Do not silently reduce explanation/history limits, truncate learner text, discard protected work, or simply raise configured ceilings to obtain a pass. Prefer deduplication and approved compaction. If policy changes are genuinely needed, provide the measured decision and keep the affected gate blocked.

A failed save must not claim evidence was safely recorded. Preserve the current draft, last confirmed save and conflicting versions as far as the established mechanism permits. Test native local persistence where available; mock or in-memory storage is supplementary and must be labelled as such.

## 7. Execution order and internal review

1. **Baseline and reproduction:** inspect current source, capture fixtures, build the Q01–Q16 and G01–G20 registers, and reproduce the hard defects before altering their behavioural expectations.
2. **Correctness and continuity:** close Q08–Q14's checker/evidence/input/recovery/domain defects and shared contract dependencies. Implement versioned migration and regression coverage as needed.
3. **Complete 4.3 calibration:** deliver its teaching, genuine guided/faded decisions, specific repair, preserved return, independent evidence and save/resume through the real Chapter 4 route—not a separate demo.
4. **Review then complete all remaining lessons:** review 4.3 against the rubric internally, correct actionable findings, then apply the verified approach to 4.1–4.2 and 4.4–4.8. Do not wait for Dean to repeat the request. Check dependencies across the whole sequence.
5. **Complete supply and review:** implement and test the question families, cross-route exposure, actual two-set coverage, appropriate mixed cues and later evidence paths.
6. **Run full adversarial review:** execute the tests and learner walkthroughs below, correct failures, and rerun affected and full regressions against the final candidate.
7. **Freeze and return:** create exact source/artifact hashes and the honest status report only after the final changes have been retested.

Use separate teaching and mathematics/behaviour reviewers if the environment supports them. They should inspect learner-facing source and rendered interactions before reading the builder's success summary. Keep write ownership controlled; do not let parallel agents overwrite the same state/policy files. If separate reviewers are unavailable, perform distinct review passes and describe them as self-review—not independent human review.

Allow up to **three complete internal review/correction cycles** after the initial integrated candidate. This is a work-budget choice, not permission to relax acceptance. Resolve actionable findings inside those cycles instead of handing routine debugging back to Dean. If genuine blockers remain, preserve completed work and return their precise cases, scope and next dependency. Never manufacture a pass or claim work will continue after execution ends.

## 8. Required executable and interaction verification

Rerun the applicable supplied suites, including:

- `tests/math10c-unit4-checkers.test.cjs`
- `tests/math10c-unit4-practice.test.cjs`
- `tests/math10c-unit4-policy.test.cjs`
- Applicable browser, state and SCORM suites discovered in the current checkout.

Preserve original audit fixtures. Interface/path adapters may be required; document them and keep the literal learner responses and intended mathematical distinctions. Structural expectations such as an obsolete bank count may legitimately change, but record why. Do not weaken a correctness, evidence, preservation or learner-continuation assertion to make the implementation pass. Test-reference edits alone do not establish a runtime repair.

Add executable regressions for every automatable Q/G requirement, including valid equivalent forms, near-miss wrong answers, both partial-input branches, component-specific diagnosis, fresh/support identity across routes, fourth-failure continuation, source/policy migration and compaction invariants. Validate generated mathematics against separately reasoned expectations rather than feeding the generator's preferred answer back into the same checker as the only test.

Exercise every target's independent-consistency-transfer-retention path under the approved policy; include tests that unrelated targets do not advance. Controlled clock advancement tests eligibility logic only, not actual human retention. Replay sequential chapters/lessons and existing saved histories—not only isolated clean-browser lessons.

Complete these realistic learner walkthroughs with problem, response, feedback, next action and evidence change recorded:

- Prepared learner uses a direct uncued demonstration.
- Learner makes a distinguishable conceptual error, repairs it and returns to intact work.
- Learner enters correct mathematics using a different supported notation or method.
- Learner needs only blank/input/accessibility assistance.
- Learner fails four checks and continues without reset or teacher rescue.
- Learner has already seen a solution elsewhere and needs different independent mathematics.

Render and inspect all eight lessons, their guided/repair/independent states, and representative review/work views. Perform desktop and 390/320-CSS-pixel checks for clipping, overflow, focus and readable controls. Do not claim actual mobile-keyboard, screen-reader or accessibility acceptance unless those interactions were actually exercised in the relevant environment.

A teaching review must point to actual source/rendered spans and the decisions a learner makes. Word counts, DOM element counts and button existence are warning/structure checks, not pedagogical acceptance. Do not average a serious mathematics or evidence failure away with a high visual score.

## 9. Fix the generation process, not only this chapter

Within the authorized chapter-authoring scope, update the actual reusable generation prompt/contract and validation entrypoint used to generate chapters. Locate and record their real paths. A disconnected new README does not establish that future generation consumes the requirements.

Make generation require: source/prerequisite mapping; reasoned examples and contrasts; genuine guided/faded decisions; target-specific repair; reviewed mathematical adapters; component-evidence contracts; shared policy/freshness/state rules; adequate practice and review selection; adversarial validation; and a bounded review/correction loop before delivery.

Add a focused validation fixture demonstrating that the generation gate rejects an intentionally defective output—for example, revealed guided answers, unmeasured target credit or fixed-bank rotation described as fresh. This tests the gate, not a claim that another complete chapter has been validated.

Do not hardcode eight lessons, 32 targets, or Chapter 4's topics into the universal generator. Keep those counts as current repair requirements. Future chapter structure comes from its approved outcomes and source packet. Avoid a broad repository refactor; if the true generator entrypoint cannot be accessed, supply the exact proposed integration patch and mark generator wiring unverified.

Do not generate or deploy other chapters during this task. Chapter 4's corrected workflow remains a candidate for future use until its teacher, learner and tenant gates are satisfied.

## 10. Required return and definition of done

Return the actual changed source in the writable checkout and a portable review bundle. Include:

1. `RETURN_TO_DEAN.md`: concise verdict for local correctness, teaching/source review, native local persistence, simulated SCORM, live Brightspace, teacher review, actual learner review, real-device accessibility and real delayed observation. Use explicit `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN` with evidence; distinguish automated, model-reviewed and human-reviewed results.
2. Baseline and final revisions/hashes; exact changed-file inventory; canonical/generated ownership map; build/launch/test commands and environment.
3. Q01–Q16 and G01–G20 closure matrices with concrete test names, results and source/render locators. An already-fixed finding still needs demonstrated regression evidence.
4. A per-target source → teaching → guided/faded work → repair → fresh independent → consistency → transfer/reasoning → delayed evidence matrix, referencing actual implemented task versions and required response components.
5. Versioned task/policy contracts, migration fixtures, initial/corrected-work examples, support/exposure and compaction tests, and full application/envelope capacity measurements.
6. The supplied and added executable regressions, raw result logs, representative screenshots and learner-path traces. Separate specifications from tests actually run.
7. The actual reusable generation changes and the gate's negative-fixture result, or an explicit unintegrated patch and limitation.
8. A working local HTML review bundle and, where the authorized existing build supports it, a clearly labelled **review-only** SCORM ZIP. Hash the exact final artifacts; verify integrity, manifest, asset parity, local launch and applicable mock SCORM save/reload. Missing build capability is a packaging limitation, not permission to fake an export.

Do not include unauthorized raw source assets in redistributed bundles. Do not update release approvals, deploy to Brightspace, write grades, mark teacher confirmation, or represent local tests as real learner/accessibility/tenant acceptance.

**Internal completion requires:** all eight lessons repaired, all 32 targets with defensible reachable evidence, all hard mathematical/evidence/continuation defects closed, adequate reviewed practice and actual review coverage, preserved learner work, and final tests executed against the delivered files. Source/teaching findings must be resolved or explicitly reported; unavailable human/tenant gates remain open.

If any requirement cannot be met, return the actual completed changes plus the smallest precise unresolved blocker. Do not call the chapter ready, reduce the scoring denominator, remove difficult targets, delete the failing route, or return another plan as though implementation were finished.

**Execute now. Keep progress updates brief. Complete the internal review/correction cycle before asking Dean to review the result.**
