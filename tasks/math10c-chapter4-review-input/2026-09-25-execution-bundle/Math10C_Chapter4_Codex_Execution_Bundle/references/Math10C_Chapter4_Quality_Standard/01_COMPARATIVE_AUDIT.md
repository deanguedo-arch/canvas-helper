# Independent comparison: Chapter 3 versus Chapter 4

Date: 2026-09-24. Scope: the exact two canonical workspaces in the uploaded comparison archive. This is a quality comparison and corrective specification, not a production-release certification.

## 1. Verdict and confidence

**The major gap is functional and instructional parity, not missing navigation.** Chapter 4 has many of the names of Chapter 3's features, but several are smaller or materially different experiences. A short answer reminder is being treated as worked support; a fixed-bank rotation as fresh generation; a lesson-wide score increment as per-target evidence; and a class named `guided-practice` as proof that a learner actually practices a decision.

Chapter 4 is suitable for **corrective teacher/developer review**. It is **not ready for an independent student pilot or production scaling** on this evidence. A technical sandbox may still be used to investigate issues, but that is not learning or release approval.

The archive requests separate 0–100 confidence scores for parity. The following are coarse reviewer judgments of confidence that the present build meets the selected Chapter 3 standard, not measured student outcomes, probabilistic calibrations, or grades:

| Dimension | Confidence in current parity | Reason |
|---|---:|---|
| Content depth/completeness against the selected benchmark | 45/100 | All eight headings are present, but explanations and task-specific support are much thinner. Original curriculum sources are absent. |
| Pedagogical parity | 35/100 | Guided decision-making, genuine fading, useful repair, practice supply and defensible transfer evidence fall short. |
| Feature parity as functioning learner capabilities | 60/100 | Most route names and tools exist, but several do not deliver the capability their labels imply. |
| Visual/interaction parity | 75/100 | Shared layout and hierarchy are recognizable. Repeated generic input controls, terse content and recovery problems reduce functional parity. |

Confidence is high in the concrete code and interaction findings below. Confidence in actual learning, accessibility and LMS performance remains unestablished.

## 2. Inspection and test boundary

Input: `Math10C_Chapter3_vs_Chapter4_Quality_Audit_2026-09-24.zip`.
SHA-256: `d88ad3bffb9fd0f3496c7bc68766c44bff6742dcf044db9e7158a220ecbc2c2c`.
All **93** manifest-listed files matched their recorded hashes.

Inspected: both HTML lesson bodies, question/checker and practice sources, policy/evidence code, tools, prompt packs, coverage/hand-off descriptions and supplied test expectations. All eight Chapter 4 lessons were read. Selected Chapter 3 teaching and support were inspected as the benchmark, including the overlapping roots content and the detailed 3.5 sequence.

Reran unchanged with a path-layout adapter:
- `tests/math10c-unit4-checkers.test.cjs` — passed.
- `tests/math10c-unit4-practice.test.cjs` — passed.
- `tests/math10c-unit4-policy.test.cjs` — passed.

Additional checks are in `evidence/scripts/contracts_probe.cjs`, `browser_probe.py`, `additional_browser_probe.py` and their JSON results. These are independent observations, not a rerun of every supplied TypeScript browser/SCORM test.

Native browser navigation was blocked by the container. The controlled browser harness inlined original local scripts/styles and used an in-memory Web Storage replacement. Chapter 3's dynamically loaded modules were preloaded without editing them. Screenshots therefore illustrate local rendering and interaction only. No real native persistence, export packaging, live Brightspace, assistive technology, real-device keyboard or learner test was performed. Recovery/storage UI seen under the harness is not treated as a production defect.

## 3. Teaching: mostly a compressed reference lesson, not the same depth

### Q01 — Substantial reduction in authored teaching

Source locators: Chapter 3 `workspace/index.html`, `#u3-31` through `#u3-38`; Chapter 4 same file, `#u4-41` through `#u4-48` (lines 100–237).

Whitespace word counts of each static lesson article, including labels and controls but excluding runtime-generated questions:

| Lesson position | Chapter 3 | Chapter 4 |
|---|---:|---:|
| 1 | 992 | 391 |
| 2 | 1,085 | 312 |
| 3 | 895 | 295 |
| 4 | 840 | 260 |
| 5 | 1,269 | 260 |
| 6 | 949 | 293 |
| 7 | 984 | 326 |
| 8 | 1,025 | 356 |
| Total | 8,039 | 2,493 |

This is a diagnostic signal, **not a required word ratio**. The decisive evidence is what those words do. Chapter 3 roots connects prime-factor pairs/triples, principal-root notation, geometry, units, worked decisions, estimation, attempts and reasoning. Chapter 4 has relevant explanations but frequently jumps from a rule to a short symbolic sequence and then to a multi-field assessment.

Chapter 3 contains 18 statically marked worked examples; Chapter 4 contains 16. Nearly matching the example count clearly did not establish matching instructional depth.

### Q02 — Sequence assumes an as-yet untaught step

Chapter 4 `index.html:136–148`, especially line 142 (`#u4-43`). The second worked example simplifies `(18a^7b^4)/(6a^2b^6)`, obtains `b^-2`, then says to use positive exponents, producing `3a^5/b^2`. The reciprocal interpretation is formally taught in 4.5, not 4.3.

The mathematics is correct; the instructional sequencing is weak for a new learner. Either keep the initial 4.3 worked example within currently established knowledge, explicitly supply a short reciprocal bridge, or mark the extension as optional and link its support. Do not silently assume the very step the student needs taught.

### Q03 — Guided practice often displays the decision it purports to ask for

Chapter 4 `index.html:107,124,141,158,175,192,209,226`.

In 4.2, “Choose the perfect-power factor” immediately supplies `180 = 36·5`. In 4.3, “Explain the laws with expanded factors” prints the complete cancellation and result. In 4.6, “Choose the easier evaluation order” prints the chosen fifth root and final value.

These can be useful additional worked examples. They are not evidence that the learner made the named decision. All eight `guided-practice` sections contain no checked learner-input step. The dynamically generated mastery form at the end is not a substitute for carefully positioned, low-stakes guided/faded attempts.

### Q04 — Support is a reminder, not a comparable repair resource

Chapter 4 `index.html`, `#u4-support-library`; Chapter 3 `#u3-support-library`.

The static support text is 393 words in Chapter 4 versus 6,043 in Chapter 3. Chapter 3's larger library includes many question-specific hints and worked solutions; these are different amounts and types of support, not simply differently worded introductions.

Chapter 4's 4.5 support says to move powered factors across the fraction bar and preserve restrictions. It does not walk a confused student through cancellation, the numerator/denominator decisions, a likely wrong interpretation, or a repair attempt.

`chapter4-mastery.js:208–216` selects a field hint and prints it as “Focused repair.” It does not provide the complete short teaching → repair attempt → return → different demonstration sequence.

## 4. Practice and review: labels exceed the actual supply and coverage

### Q05 — “Generate a fresh set” is a fixed rotating window

Sources: `chapter4-practice-data.js:98–102`; `chapter4-practice.js:60–61`; learner claim `index.html:241–242`.

There are 64 ordinary authored questions: eight per lesson. `lessonSet` picks consecutive entries from that fixed list using a seed offset. No new coefficients or structures are generated.

Every pair of adjacent five-question lesson sets repeats **four questions**. Ten generated sets still contain only eight unique identities per lesson. Repetition itself is legitimate practice; calling it fresh varied generation is not.

The mastery bank is separately bounded: seven task variants per lesson, not an unlimited supply. It should not be described as solving the practice-depth problem.

### Q06 — Two “balanced” review sets do not cover the promised 32 targets

Sources: `chapter4-practice-data.js:101`; `index.html:264–270`.

`reviewSet(0)` covers only eight distinct target IDs across 16 questions because most selected pairs share a target. Sets 0 and 1 together cover **15/32** targets. The next pair, sets 1 and 2, covers **16/32**. Adjacent review sets repeat eight exact questions.

The learner page says “Review all 32 targets in two balanced sets.” The generator must use a target/representation coverage specification, not numeric offsets in an array. Existing tests check the length 16, not the promised target coverage.

### Q07 — Mixed practice remains cued, and recommendations are broad

`chapter4-practice.js`, `renderQuestion` prints the target and lesson beside each question, including mixed questions. Some cues also remain in the prompt itself. The page says to choose without being told the lesson.

`weakestLesson` aggregates by lesson and `renderRecommendation` links to the general support library or lesson. That can be useful navigation, but it is not a demonstrated misconception-specific repair route.

## 5. Checking and mastery: real instructional and evidence regressions

### Q08 — Correct mathematical forms are marked wrong by answer-list matching

Sources: `chapter4-checkers.js:9–21,233–249`; `chapter4-practice-data.js:102`.

Both use normalized-string membership, not the bounded semantic contracts used for Chapter 3's algebraic distinctions.

Observed examples:
- Simplify `sqrt(75)`: `5*sqrt(3)` accepted; `sqrt(3)*5` rejected.
- Simplify `(2ab^2)^3`: `8b^6a^3` rejected despite being equivalent to `8a^3b^6`.
- Simplify `(3m/4)^2`: `(9/16)*m^2` rejected; `9m^2/16` accepted.
- Evaluate `(2/3)^-3`: `3.375` rejected despite being exactly `27/8`; the task does not request a fraction-only answer.
- Input toolbar offers the Unicode minus `−`, but `normalize` does not convert it to the ASCII minus used in many answer lists.

Where a requested form matters, distinguish “equivalent but not in the requested form” from wrong mathematics. Unsupported notation needs input guidance. A new radical/exponent checker need not be a universal CAS; it needs a reviewed bounded grammar and mathematically justified acceptance contract.

### Q09 — Meaningful explanation is reduced to keyword matching

`chapter4-practice-data.js`, error item `e41`; `chapter4-practice.js`, `renderQuestion`.

For the error “sqrt(70)=35 because root means divide by 2,” the learner is asked what to do first. The response “Compare 70 with 64 and 81, which are nearby perfect squares.” is correct and well within the field limit, but was marked wrong. One of three canned strings such as `bracket` passes.

Do not replace this with an unrestricted automatic prose grader by assumption. Use a bounded reasoning task (select and compare the correct powers, identify the invalid decision, repair it), while retaining an explanation for review. Keywords and final values are not proof of explanation quality.

### Q10 — The mastery policy differs and target credit is pooled by lesson

Sources: Chapter 3 `assets/mastery-policy.js` (`STAGES=[0,25,50,75,100]`); Chapter 4 `assets/chapter4-mastery.js:181–199`; Chapter 4 `index.html` mastery-pathway table.

Chapter 4 follows 25 → 75 → 100 and omits the independent-consistency stage. No owner decision approving that pedagogical change was included in this audit archive. It may be a deliberate proposal, but it is not unchanged parity.

More importantly, successful lesson tasks upgrade all four targets in `targetMap[taskId]` together.

Controlled reproduction: complete 4.1 initial correctly, then its transfer question about bracketing the edge of a cube of volume 100 cm³, writing its cube root and unit. All four targets become 75, including **classifying rational/irrational numbers** and **ordering real numbers**, neither of which this transfer task asks the student to demonstrate. The transfer problem can provide valid evidence about root interpretation/bounds; it cannot supply the omitted constructs by association.

This is a real evidence problem, not a stylistic preference. A task-to-target tag is not sufficient; required response components and evidence stages must support each credited construct.

### Q11 — Incomplete input can wrongly mark mathematical support

`chapter4-mastery.js:161–167` unconditionally sets `help=true` when any field is blank.

Controlled reproduction: enter only the correct coefficient `3` on 4.2 and press Check. No filled mathematical response is wrong and no mathematical hint is displayed, but the attempt is marked supported. Pure missing-input handling should not silently cost independent eligibility. Conversely, an incomplete submission that actually receives mathematical diagnosis must retain that support. Test both branches.

### Q12 — Four wrong workshop checks strand the learner

Sources: `chapter4-mastery.js:170–177,229–254`.

Controlled reproduction: 4.1 initial, exact-root answer `99`, all other entries correct, check four times. State becomes `closed=true`, `nextVariant=null`. The interface says to use repair before another demonstration, but the focused-repair control is disabled and the next-task control is hidden.

The learner can still navigate to the lesson or ordinary practice, but has no demonstrated in-course way to restart that lesson's mastery sequence. Four checks may limit credit on an instance; they must not terminate learning or require a teacher/reset because a next-task branch was omitted.

### Q13 — Not all support routes share mathematical exposure

`chapter4-practice.js` maintains a separate practice record; `chapter4-mastery.js` uses lesson variant identities and support flags. There is no mathematical target fingerprint shared across authored examples, ordinary practice and mastery selection in the inspected source.

Examples overlap: `sqrt(196)` occurs in ordinary practice and the 4.1 fresh2 task; `3sqrt(5)=sqrt(45)` occurs in the 4.2 lesson and a fresh variant. This is a source-confirmed exposure risk. The audit recorded separate state after a practice exposure; it did not execute a complete end-to-end exploit for every overlap. Mark those remaining cross-route behaviours as required regressions, not independently passed.

## 6. Tools, presentation and learner-facing language

### Q14 — Domain restrictions disappear in an enabled lab case

`chapter4-tools.js`, `showLaw` adds a nonzero restriction for quotients, but not for a product or power containing original negative/zero exponents.

Using first exponent `-2`, product, and second exponent `2` displays `x^-2 · x^2 = 1` without `x != 0`. The lesson explicitly teaches preserving original restrictions. A reusable tool needs domain-aware checking over every enabled control combination.

The labs are useful candidate tools, but they mostly compute and display results. To serve the teaching goal, add predict/observe/explain tasks with connected representations—such as factor groups, a number-line bound, or boxed exponent scope—where they address an actual misconception. Do not add decoration merely to match image counts.

### Q15 — Engineering and source provenance leaks into teaching

Chapter 4 `index.html`, `#u4-overview` and `#u4-resources` (including line 303) expose CBE/NXT reconstruction, task versions and save-envelope language. Students need accurate save status and limitations, not the author's source reconciliation or packaging narrative. Move those statements into developer documentation and use self-contained learner directions.

### Q16 — Shared styling is the strongest area, not the main repair

The layout, headings, sidebar and cards clearly resemble the benchmark. A sampled 390-CSS-pixel rendering of 4.3 had no horizontal overflow. That is not real-device or full accessibility acceptance.

Every short text field receives the same 14-symbol insertion strip, even a bound or unit field. This contributes unnecessary control density. Prefer context-appropriate numerical/unit inputs and optional notation tools, while preserving keyboard accessibility and drafts. Chapter 3's assessment-before-teaching placement and long pages should not be copied simply because they exist in the benchmark.

## 7. Why the existing validation missed this

The supplied browser test checks the number of `guided-practice` and `misconception` elements and support accordions. The practice test checks eight entries per lesson, 64 total, 32 target tags and a 16-question review length. Variant checker tests submit `config.answers[0]` and check that it is accepted, plus an unrelated wrong string and blank controls.

Those are useful structural and binding tests. They do not establish that the learner makes the guided decision, the review actually measures all targets, the answer is independently mathematically correct, or equivalent student responses are accepted.

All three supplied CommonJS suites passed while the independent probes above reproduced the gaps. A green suite is only as strong as the behaviour it requires.

## 8. Root-cause inference and what is not known

The artifact is consistent with a generation process that optimized for component presence and prompt-pack claims, then validated those structures. Chapter 4's bundled instructions say to reuse Chapter 3 for presentation/evidence architecture; they do not provide the same operationalized teaching-depth standard. Chapter 3's prompt pack separately includes anti-summary generation rules.

This is an inference from the delivered files and tests. The exact original model invocation, consumed context, tool sequence and production source packet are not included. It would be unsupported to blame a particular model, token budget, deliberate shortcut or ignored instruction.

The practical remedy is to make teaching depth, semantic evidence and successful recovery part of the generator's contract and pre-delivery acceptance—not rely on another adjective such as “comprehensive.”

## 9. What differences are legitimate

Roots and powers require different representations, domains and checkers from factoring. Copying factor-pair widgets would be wrong. A later roots lesson may legitimately rely on earlier roots knowledge if that prerequisite is explicit and repair is available. Optional videos and textbooks are not a requirement to inflate parity counts. A clearer or shorter lesson can be better when it still teaches and checks the required decisions.

Preserve those topic-specific choices. Do not preserve under-explanation, hidden prerequisite jumps, wrong checker feedback, unsupported mastery claims, or exhausted/no-next routes as “intentional differences.”

## 10. Priorities

1. Correct evidence/checker/input and dead-end defects (Q08–Q13), versioning affected contracts and preserving learner work.
2. Calibrate a genuinely complete 4.3 lesson; repair the whole chapter's teaching, prerequisite bridges, guided/faded attempts and worked support (Q01–Q04).
3. Replace fixed rotations and count-only review with coverage- and exposure-aware supply; improve mixed practice and repair selection (Q05–Q07).
4. Fix tool domains and learner language; simplify irrelevant input controls (Q14–Q16).
5. Run the reusable generator gates before another chapter is called complete. Human/tenant/access/learner gates remain separate.
