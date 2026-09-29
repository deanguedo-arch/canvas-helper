# Chapter 4 repair closure register

Work order: `CH4-REPAIR-2026-09-24`  
Baseline commit: `02a9fadc9148bf26c0c93006560375a9c5c6b4ee`  
Canonical source: `projects/math10c-unit4-pilot/workspace/`  
Policy/state: `c4-mastery-policy-3` / `chapter4-review-state-4` / `c4-target-evidence-3`.

`PASS` below means the bounded local behaviour was implemented and exercised. It does not mean teacher approval, learner acceptance, real-device accessibility, actual delayed retention, production release, or live Brightspace certification.

## Q01-Q16

| ID | Closure | Executed evidence | Status |
|---|---|---|---|
| Q01 | All eight lessons now contain meaning, worked reasoning, guided decisions, faded work, misconception repair and a direct mastery route. | `validate:math-course-generation`; screenshots `meta/evidence/screenshots/lesson-4-*-1280.png`; independent final model review. | PASS |
| Q02 | Lesson 4.3 derives product, quotient and zero laws from repeated factors/cancellation and defers negative-exponent reciprocals to 4.5. | `index.html#u4-43`; generation gate sequence check; rendered 4.3 screenshot. | PASS |
| Q03 | Sixteen checked guided/faded tasks leave required components unanswered until the learner acts. | Browser test `guided decisions check components…`; `chapter4-learning.js`. | PASS |
| Q04 | Every lesson routes from the active checked draft's actual component results to targeted support, a checked repair, the preserved original draft, and a different fresh task. The learner may save a correction without creating a fifth check or mastery evidence. | Browser tests `first-check mastery…` and `guided decisions…fourth miss…`; `chapter4-mastery.js`; `#u4-support-library`. | PASS |
| Q05 | Deterministic reviewed families produce ten successive five-question sets with 50 mathematical fingerprints per lesson. | `math10c-unit4-practice.test.cjs`. | PASS |
| Q06 | Even/odd chapter-review partitions each cover 16 targets and their union covers all 32. | `math10c-unit4-practice.test.cjs`. | PASS |
| Q07 | Mixed/review cards hide lesson/target cues until check; recommendations use recorded target misses. | Browser practice test; `chapter4-practice.js`. | PASS |
| Q08 | Exact rational/monomial/radical semantics accept valid equivalent forms, Unicode minus and factor reordering while preserving unary-sign precedence and principal-root/domain distinctions such as `-2^2`, `(-2)^2`, `sqrt(x^2)` and `x`. Form/blank/unsupported/error/intermediate/complete states remain distinct. | `math10c-unit4-checkers.test.cjs`; `chapter4-math.js`. | PASS |
| Q09 | The √70 misconception now requires four bounded decisions: invalid operation, lower/upper powers and repaired interval. | Browser test `error detective uses bounded decisions…`; Error Detective `e41`. | PASS |
| Q10 | Per-component 0/25/50/75/100 evidence is separate from four-check practice credit. A fresh unaided verification establishes 25; two structured verification receipts across two explicit variation categories establish 50; paired transfer and reasoning evidence establishes 75; a distinct later-session retention task establishes 100. | Browser 32-target path; policy/checker tests. | PASS |
| Q11 | Blank-only checking consumes no check/help and gives no mathematical hint; a filled wrong part with blanks records support before diagnosis and cannot become fresh evidence. | Browser `first-check mastery…` partial-input assertions. | PASS |
| Q12 | A fourth miss earns zero for that instance but leaves support, checked repair and a different task available without reset. | Browser `guided decisions…fourth miss…`. | PASS |
| Q13 | Exposure is stored by mathematical fingerprint across guided work, practice, lesson examples, solutions and tools. Hidden lesson routes are not registered as exposure at startup; exposure begins when the learner is actually shown the route. √196 and 3√5=√45 force different evidence. | Browser `known cross-route mathematics…`; 32-target path; `chapter4-learning.js`; lazy workshop rendering. | PASS |
| Q14 | Exponent tool preserves restrictions from original negative/quotient expressions, including x^-2·x^2=1 with x≠0. | Browser lab/domain assertions. | PASS |
| Q15 | Learner pages omit CBE/NXT reconstruction, task-version and save-envelope commentary while retaining truthful save/help limits. | Generation gate forbidden-language scan; rendered screenshots. | PASS |
| Q16 | Equation controls appear only for expression/restriction fields; labels, keyboard controls, red field feedback and responsive 390/320 layouts remain usable. | Browser accessibility and 390/320 overflow tests; screenshots. | PASS |

## G01-G20

| ID | Result and evidence | Status |
|---|---|---|
| G01 | Current CBE/NXT source registry, production contract and lesson source pages were inspected; secure test/quiz content remains excluded and 4.8 transfer is labelled authored. Human curriculum approval remains separate. | PASS |
| G02 | 4.3 prerequisite jump removed; sequence rendered and reviewed. | PASS |
| G03 | Worked explanations justify transformations, restrictions and contrasts in all eight lessons; independent model review completed. Teacher acceptance remains blocked. | PASS |
| G04 | Guided prompts require learner decisions before feedback; revealed-answer negative fixture is rejected. | PASS |
| G05 | Guided/faded and direct mastery routes coexist; support routes to different mathematics. | PASS |
| G06 | Literal equivalent/Unicode input regressions pass through the production checker. | PASS |
| G07 | Unsimplified radical is `valid_intermediate_step`; unsupported notation and false mathematics remain separate. | PASS |
| G08 | √70 reasoning uses bounded mathematical components rather than password prose; the reusable adapter also enforces explicit `verify`, `reason` and `strategy` fields for the audited weak targets. | PASS |
| G09 | Target evidence is credited only from mapped, correct components; unrelated targets do not advance. | PASS |
| G10 | Versioned 0/25/50/75/100 policy, two-category verification consistency, paired transfer/reasoning, and 48-hour/later-session admission are tested. | PASS |
| G11 | Both partial-input branches and notation-help handling are tested. | PASS |
| G12 | Per-field result/hint state and target-specific gap signals are retained; two distinct first-check signals are required for a confirmed gap. | PASS |
| G13 | Active-error repair is derived from actual checked components, preserves first work, returns to the original draft for correction, and then offers a different independent identity. | PASS |
| G14 | Four-check continuation regression passes. | PASS |
| G15 | Cross-route fingerprints and presentation-time exposure tests pass. | PASS |
| G16 | 50 distinct mathematical fingerprints per lesson across ten sets; finite variants remain explicit. | PASS |
| G17 | Actual two-review-set union is exactly all 32 targets. | PASS |
| G18 | First/final work, component results, support, exposure and historical labels survive reversible tuple/dictionary compaction and reload without answer truncation. The real full path is 50,112/52,000 application characters and 19,676/60,000 packed SCORM characters. | PASS |
| G19 | Negative/zero exponent boundaries and responsive/input controls pass automated checks. Screen-reader, mobile keyboard and real-device acceptance are BLOCKED. | PASS |
| G20 | The exact dated review artifact passed local launch plus simulated SCORM save, close/reopen resume, completion, failed-commit preservation and full-path capacity. Teacher review, learner acceptance, actual 48-hour retention, real-device accessibility and live Brightspace remain blocked, so production release is blocked. | BLOCKED |
