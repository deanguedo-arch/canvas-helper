# Reusable Math 10C generation standard

## Job and outcome

Build an independently usable mathematics lesson sequence, not a summary with the same menu as Chapter 3. Students must be able to understand a method, attempt meaningful work, diagnose a specific difficulty, practise the missing decision, return to their working, demonstrate independently on new mathematics, and revisit it later. A teacher should receive useful exceptions and selected work rather than become the missing explanation layer.

This is a proposed generation contract. It does not declare Chapter 3 production-accepted, authorize deployment, approve a mastery-policy change, or require every future chapter to have eight lessons and 32 targets. Preserve Chapter 4's existing eight lessons and 32 target identities during its repair; derive future structures from approved outcomes and sources.

## A. Freeze three inputs, not just a screenshot

Before writing, record:

1. **Benchmark snapshot:** exact Chapter 3 source revision or archive/manifest, the selected good teaching examples and interaction contracts, and known limitations that must not be copied.
2. **Shared behavioural contract:** mastery policy/version, practice-credit policy, support/exposure rules, evidence/storage ownership, accessibility/input distinctions and teacher handoff. Do not regenerate a simpler interpretation per chapter.
3. **Chapter-specific teaching packet:** source-authorized outcomes, lesson sequencing, exact concept/example/page locators, prerequisites, misconceptions, representations, task demand, excluded assessments and unresolved source gaps.

The Chapter 4 metadata points to `projects/resources/math10c-production/v1/source-manifest.json` and `chapter4/production-contract.json`. Locate the actual authorized files and sources in the checkout; do not pretend a source-map label is the content itself. Their raw contents were not available in this audit ZIP. No generic replacement should silently stand in for an unavailable source. Keep source provenance developer-only. Learner pages must contain the teaching they need, without unavailable slides or author commentary.

## B. Separate reusable software from new mathematics

Reuse or extract the selected candidate's proven interfaces for navigation, answer entry, support classification, evidence receipt handling, save ownership, report projection and policy versioning. Keep extraction bounded and regression-tested; do not redesign the whole repository as a prerequisite.

Implement new mathematical families as adapters with their own explicit grammars, domains, acceptable forms, reasoning components and error distinctions. Do not copy factoring algorithms into radicals. Do not replace a semantic checking contract with a short literal answer list because it is faster to generate.

Changing pedagogy or evidence is not a styling choice. The benchmark currently has 0/25/50/75/100 stages; Chapter 4 has 0/25/75/100. Resolve that difference explicitly with the owner. Until decided, report it as a policy deviation. Never relabel old learner evidence as meeting a stronger new policy.

## C. Author each lesson as a sequence of learner decisions

For each essential target, identify:
- What the student must notice or choose before calculation.
- Why the method works and where it does not apply.
- The important intermediate work and how to check it.
- Likely, distinguishable wrong decisions.
- The support that repairs each decision.
- The evidence needed for independent, transfer/reasoning and later performance.

Use the following teaching sequence flexibly. Do not make every learner complete every stage.

**Orientation:** a specific goal, prerequisite link, concrete success criteria and a direct route for a prepared learner. Show how to use the lesson without talking about internal task versions or state budgets.

**Meaning before procedure:** connect the symbols to a model, expanded factors, a familiar numerical example or another representation that explains the relationship. A formula table by itself is reference material, not sufficient first instruction.

**Fully worked example:** every nontrivial transformation includes the action, resulting mathematics, reason and check where needed. Do not compress the step a novice is likely to find difficult. Some steps can be grouped once their component decisions have been taught.

**Decision contrast:** change a sign, index, operation, representation or context that changes what the student must do. Explain why. Another example differing only in its coefficients does not satisfy this requirement by itself.

**Guided attempt:** leave a real decision for the student. Collect a bounded intermediate response before revealing it. A block that prints the chosen factor and final answer is another worked example, regardless of its CSS class.

**Faded attempt:** remove previously supplied prompts. Ask the learner to organize more of the method. A second fully prompted form is not automatically less-supported practice.

**Independent attempt:** present new mathematics under the declared support conditions and retain pivotal working. Do not award independence merely because the final answer is correct.

**Misconception and repair:** identify a defensible error signal, teach that missing decision, provide a small repair attempt, preserve the original draft, and supply a different later independent task. When the response does not distinguish the misconception, ask a discriminating question rather than confidently inventing a diagnosis.

**Changed-form/reasoning task:** require a genuinely changed demand—method choice, representation, nonexample, justification, error repair or application—not only different numbers or a new introductory noun. Check only the constructs actually elicited. Unrestricted prose can be retained for human review; keywords and length are not a reasoning grade.

**Later revisit:** use a genuinely fresh task when the approved delay/session condition is satisfied. Waiting must not block continuing the course. Do not equate simulated elapsed time with observed learner retention.

Use word counts and example counts only as warning indicators. The obligation is to teach the mathematical decisions, not reach a word quota. A targeted lesson may be shorter than Chapter 3; a new complex method may need more than two examples. Record justified deviations instead of mechanically filling template boxes.

## D. Question families and practice supply

Create a coverage matrix by skill, mathematical structure, representation, sign/domain boundary, difficulty and evidence role. Distinguish skill tags from evidence elicited by actual fields.

Use validated parameterized families where the mathematics permits. Use a sufficiently varied reviewed authored bank where parameterization would weaken a reasoning task. Specify the supported range and verify the produced mathematics independently of its own answer string.

Freshness must be based on the mathematical demand and instance, not an array index, seed, lesson position or new label. Protect independent items from prior exposure in examples, practice, solutions, support and other routes. Record only the exposure that actually occurred; an unseen queued problem should not be consumed.

An ordinary repeat can remain available for learning. Label it honestly. Do not claim unlimited or fresh generation for a rotating fixed list. When genuinely new evidence is unavailable, show a reviewed alternative/support route without erasing work or inventing credit. Stress the planned learner path before release rather than letting the bank run out after routine practice.

For mixed/review sets, generate against a declared target-and-demand plan. If the interface promises all targets across two sets, test the union of **demonstrated** targets across those sets. Counting 16 questions is not that test. Remove unnecessary method/lesson cues in independent mixed selection tasks; reveal them after submission when useful for feedback.

Practice repetition may be substantial, but it is not a completion quota. A competent learner can demonstrate readiness; a struggling learner can continue without becoming a storage administrator.

## E. Answer, work and evidence contracts

A task contract must state the givens, requested form, accepted bounded input grammar, domain/units/precision, valid alternative forms, relevant intermediate components, diagnostic distinctions, support classification and target/stage mapping.

A correct answer is not wrong mathematics merely because it uses a different harmless factor order, fraction placement or exact terminating decimal. Where form matters, return “equivalent, change the requested form.” Where the grammar cannot interpret a valid-looking entry, offer input help and preserved working; do not claim a definite mathematical misconception.

Use separate outcomes for blank/malformed/unsupported input, mathematical error, equivalent-but-not-requested form, correct intermediate work and complete success. A purely blank submission does not reveal mathematics. A partially filled submission that receives substantive mathematical feedback does count as supported. Accessibility and notation help alone must not change independence.

For every credited target, retain a task version/fingerprint and the actual submitted components that support the claim. Do not advance all four targets because a lesson-level Boolean is true. Final-answer correctness is not evidence for an unasked classification, comparison or explanation.

Keep immutable first submission, final/selected correction, original givens, support-before-submission and relevant exposure/provenance within the bounded policy. Retain protected evidence and drafts through permitted compaction/migration. Practice-credit limits must not become limits on learning attempts. Four failures must lead to a usable repair/retry route, not disabled help plus a missing next button.

Optional textbook work remains outside automated mastery. Preserve the distinction between saved work, submission, a formal grade, and authenticated teacher confirmation. No new automatic grade writer is authorized by this standard.

## F. Tool and presentation parity

Preserve the selected course shell and navigation consistency. Reuse the visual syntax of clear example steps, explanation, feedback and next actions. Do not copy unrelated defects or insist on identical page length.

Add a visual or tool only when it teaches a particular relationship: root bounds on a number line, factors grouped by index, scope of an outside exponent, domain consequences of a negative exponent, or dimensions/units. It must have equivalent accessible givens and make the same mathematical decision possible without a purely visual operation.

Tools must respect every enabled input domain, not only a demonstration default. A product with original negative exponents must not lose its nonzero restriction simply because the resulting exponent is zero.

Use context-appropriate inputs. Numeric bounds and units do not require a full algebra symbol panel permanently repeated underneath every field. Preserve keyboard access, accessible labels, feedback, focus and drafts across notation alternatives.

Routine instructional prose and hints must have a named canonical owner. Teacher correction and withdrawal of a faulty family require an approved route and a fallback that does not erase learner work. No separate admin platform is required merely to meet this obligation.

## G. Run an authoring pipeline, not one large unchecked chapter dump

1. **Source and demand mapping:** produce the lesson/skill packets and named gaps before generation. This is a source-verification stage, not a new general plan to deliver instead of source.
2. **One calibration lesson:** complete 4.3 for the present repair, including teaching, practice, one misconception repair, uncued evidence and return/resume. Use the sample teaching file for depth, not as an unverified source or a hard word target.
3. **Independent rubric review:** inspect learner-facing work before the builder's success summary. Identify missing decisions, answer leakage, incorrect feedback and unsupported evidence. Require source-linked findings, not an ungrounded score or praise.
4. **Automatic correction loop:** fix actionable failures and rerun targeted tests before returning the draft to Dean. Set a bounded internal iteration budget; when it is exhausted, report the remaining precise blocker rather than lowering the standard or hiding it.
5. **Remaining lessons in bounded batches:** use the calibrated components and per-lesson source packets. Run semantic coverage and prerequisite checks across lesson boundaries, not just isolated fresh-browser tests.
6. **Chapter adversarial pass:** replay prior audit counterexamples, valid alternative methods, repair/exhaustion and mixed/retention paths. Inspect representative rendered pages at desktop and mobile sizes.
7. **Artifact freeze and human/tenant gates:** identify exact source/ZIP hashes, policy versions and evidence. Keep reported, locally executed, independently reviewed and real-world accepted claims separate.

The goal is to move most routine revisions into the generation workflow before the user reviews the chapter. It is not a promise that an AI-generated course needs no mathematical, teacher, learner or accessibility review.

## H. Definition of done and required return

A feature is not done because its heading, button or JSON key exists. For each claim, provide the demonstrated learner action, expected feedback, next state and recorded evidence.

Return:
- Actual edited canonical source and exact changed-file inventory.
- Source/outcome → teaching → guided/faded practice → repair → fresh demonstration → reasoning/transfer → retention matrix.
- Versioned mathematical and target-evidence contracts with reviewed examples and counterexamples.
- Executed tests and meaningful failure fixtures, not only the generator's own answer strings.
- Rendered evidence and at least competent, struggling, notation-error, valid-alternative and retry-exhaustion walkthroughs.
- Current state/complete-envelope measurements and migration/protected-work results if those mechanisms changed.
- Concise exceptions: unsupported source gaps, unresolved policy decisions and human/tenant checks not run.

Do not edit tests to legitimize a weaker learning claim. Do not silently alter identities, clear learner state, cap explanations differently, award new mastery from completion, or mark human/LMS acceptance fields complete. Do not make a broad repository refactor a substitute for the current Chapter 4 corrections.
