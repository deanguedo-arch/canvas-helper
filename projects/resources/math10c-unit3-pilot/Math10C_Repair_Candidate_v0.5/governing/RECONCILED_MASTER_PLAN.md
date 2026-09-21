# Math Learning Engine — reconciled master plan

Prepared for Dean Guedo · 19 September 2026 · Planning candidate v0.3

**Astra counter-review and ChatGPT Pro reconciliation are complete.** This is a plan for a bounded pilot, not an implemented course or permission to deploy. The underlying vision remains a source-grounded Math 10C → 20-1 → 30-1 learning system.

## What we are making

Build an asynchronous learning experience in which a student can understand a representation, follow an explanation, attempt meaningful mathematics, get specific feedback, repair their work, and demonstrate the idea with less help. Preserve written reasoning and self-correction. The engine supports teaching and practice; teachers retain responsibility for assessment and grades.

The supplied CBE/NXT exports already contain useful area models, annotated examples, partial scaffolds, error analysis and written-evidence instructions. Use those as instructional evidence. The first build is a newly authored pilot with selected, documented adaptations. It is not a wholesale conversion of the six courses, and it does not imply coverage of the -2 pathways or Math 31.

## The first build and the complete pilot

**Recommended first implementation milestone:** one complete positive-monic factoring lesson from teaching through response, feedback, repair, selected reasoning and resume. It includes useful native entry, a bounded MathLive compatibility spike, printable teaching, an alternative-method route and a previewed evidence/help report. It targets M01–M05, M09–M10 and M14–M16. The ready implementation request is in `NEXT_IMPLEMENTATION_REQUEST.md`; it is unexecuted.

The full pilot described below follows that milestone. Signed/common-factor questions and trigonometry are not part of the first build. M06–M08 and M11–M13 remain full-pilot obligations. This makes the first build a usable learning slice while retaining the larger plan.

Proposed project: `math10c-factoring-pilot`. One coherent factoring lesson plus a smaller right-triangle trigonometry contrast. A prepared learner can go directly to an independent check; a learner who needs help can take targeted repair and return. Help and notation difficulties do not trap the student in a remedial sequence.

The factoring lesson includes three short readiness probes (integer sums/products, distribution, like terms), an authored positive-area representation, a worked example, a meaningful intermediate checkpoint, a faded example, controlled practice, error analysis, fresh independent evidence and selected written work. Signed examples must explain algebraic signs without pretending physical lengths are negative.

The full pilot supports these families:

| Family | Scope | Why it is included |
|---|---|---|
| Positive monic | `(x+p)(x+q)`, positive integer p and q | Connect area, expansion, sum/product and factoring |
| Signed monic | Nonzero integer p,q from -9 to 9; mixed signs, repeated factors, difference of squares | Distinguish sign reasoning from memorising one positive pattern |
| Common integer factor | `g(x+p)(x+q)`, integer g from 2 to 9 | Preserve original M06/M07: extracting a common factor can be correct but incomplete |

Begin implementation with the monic cases; that milestone alone is not the full pilot. General non-monic quadratics, variable common factors, equation solving and unrestricted symbolic steps are later contracts.

Author twelve deliberately selected factoring exemplars/boundary cases, two error analyses and two transfer/explanation prompts. These are an authoring budget, not a requirement that every student answer all of them. The default generated run has six problems. Provide another run, a return to explanation, and a fresh independent check without compulsory replay of the whole lesson. Add a short later mixed check combining expansion, factoring and error interpretation, reachable on a subsequent visit without a timer or scheduling engine. Provide printable core explanation, worked examples and selected tasks, as well as printable reports.

The trigonometry contrast includes a marked reference angle, opposite/adjacent/hypotenuse identification under rotation, ratio selection, one unknown-angle and one unknown-side example, numerical entry, units and rounding. Obtain a learner-selected ratio/relation before revealing the worked setup; retain setup evidence separately from the final number. It shares navigation, saving and feedback infrastructure with factoring. It demonstrates that the design can support diagrams and numerical reasoning, not only algebraic strings.

## Mathematical feedback and evidence

Keep these judgments separate: can the response be read; is it in the supported language; is the mathematics equivalent/correct; is it in the requested form; are units/precision appropriate; what reasoning and support are actually evidenced.

Use an exact bounded polynomial checker for the initial algebra. Keep original input and an unsimplified syntax tree. Expand supported syntax to integer coefficients for mathematical comparison; inspect the original tree separately for factored form. Accept reordered factors, supported multiplication notation, repeated linear factors and harmless sign/unit arrangements. Do not use string matching, random substitution or a generic CAS truthy result as algebraic proof.

For `x²+7x+12`, `(x+2)(x+6)` has the right constant product but gives middle coefficient 8. A sum cue is justified; a diagnosis of the student's hidden misconception is not. The original expanded polynomial is equivalent but unfinished factoring. Unmatched parentheses receive entry repair, with the original response preserved and no conceptual-error claim.

Form checks use only bounded presentation normalization: unwrap harmless parentheses/powers of one, flatten products, collect explicit scalars and signs, and recognize repeated linear factors. Accept `(3+x)(4+x)` and `(-x-3)(-x-4)`. Do not silently factor an entered binomial on the student's behalf. For the explicitly stated whole-integer-GCF task, `(2x+4)(x+3)` is equivalent but incomplete, not false mathematics. The precise proposed form contract and new, unrun derived cases are in `working/CHECKER_CONTRACT_ADVISORY.md`.

M09 has its own intermediate-task contract. The executable binding must consume and preserve the literal original response `x^2+3x+4x+12`, document its relation to coefficient fields, and be tested separately; preloading the expected fields is not an exercise of that original response path. A split-middle-term checkpoint checks sum b and product c and recognises `x²+3x+4x+12` as a valid intermediate, not a final factorization. A split using 2 and 5 preserves the middle coefficient but does not make grouping useful; acknowledge equivalence and ask for a pair whose product is 12. Do not call this algebraically wrong. Apply the sum/product rule only to the monic quadratic, including the inner polynomial after a GCF is extracted. A final-answer field judges the original M09 response as equivalent but incomplete. Plausible alternative methods outside the supported step grammar remain ungraded and retained through a written-work route; they can still use a supported final-answer check and need not repeat the preferred method. Require two reasoning opportunities in the complete pilot: explain a coefficient relationship through expansion, and identify/explain/repair the first non-equivalent step. Correct slots or final answers do not establish sound free-text reasoning.

Initial syntax limits are integers, x, unary signs, addition/subtraction, multiplication, parentheses and powers 1 or 2; 160 input characters, 64 nodes, depth 8, degree at most 2 and intermediate integer magnitude at most 1,000,000. These are proposed engineering bounds, to be proved with boundary cases during implementation. Use a whitelist parser, never expression evaluation as code.

For trigonometry, use complete text givens and nondegenerate reviewed triangles. Keep side/ratio knowledge separate from value, unit and precision. Use unrounded givens, explicit degree/radian conversion and the requested rounding contract; avoid rounding ties initially. M12's `0.464 radians` corresponds to the expected angle rounded to a tenth of a degree, but requires degree conversion/resubmission because the prompt requests degrees. Do not label it automatically as a mathematical misconception. A parseable negative length or 120-degree answer to an acute-angle task is a mathematical/domain inconsistency; distinguish it from empty, malformed or nonfinite entry.

Persist support before each retained submission. Revealing a solution makes that instance supported; entering the revealed answer cannot erase that history. Notation assistance is distinct from mathematical help. A genuinely different mathematical instance permits new independent evidence; a new seed alone does not. Use a bounded reviewed check pool or exposure-aware selection, preserving reveal markers after detailed history rolls over. If all available checks were exposed, say so and offer practice or teacher review. Later reveals must not rewrite support recorded before an earlier submission. Report “without in-course mathematical support”; external help is not monitored. Keep the evidence level separate from an opaque mastery score.

## Teacher ownership and technical structure

Use the checked-in `course:create` workflow for this independently authored pilot. A later request to migrate an existing module must use the conversion workflow instead.

| Boundary | Chosen owner |
|---|---|
| Routine teaching, examples, hint text, links and diagrams | Canonical pilot HTML/assets with durable Studio edit keys |
| Reviewed formative families and answer contracts | Declared pilot content source; generated exercise display explicitly Annotation only |
| Parser, exact checker and bounded generators | Small Math-owned module under `scripts/lib/math-engine/` |
| Navigation and exercise behavior | Pilot runtime; enrich retained HTML rather than replace teacher text |
| LMS connection, commit, termination and state envelope | Existing shared SCORM bridge; one owner |
| Formal assessment and grades | Approved Brightspace/school workflow |

Declare generated behavior bundles and their narrow rebuild command. Do not regenerate ordinary lesson HTML. Defer a full Math course factory, lesson renderer and Studio adapter until repeated authoring demonstrates their need. A teacher's editing boundary must be clear, and routine content cannot silently become runtime-owned. Hint and feedback wording must have one canonical owner, referenced by generated activities. Mathematical edits to coefficients/checking rules invalidate the affected content/checker evidence. Demonstrate a supported way to withdraw a faulty family while preserving learner work and offering a reviewed static or teacher-directed alternative; withdrawal does not award completion. Prefer existing availability mechanisms and record a specific release-blocking gap if they cannot do this. No new administration dashboard is required.

Treat a pinned local MathLive release as a candidate input enhancement, paired with a native keyboard route that reaches the same checker without requiring LaTeX. Local fonts, iframe-local keyboard, disabled optional remote/Compute Engine behavior and no CDN or live AI dependency are the initial integration requirements. Do not weaken global CSP to accommodate the editor. Provide notation examples, grouping/exponent assistance, announced errors and draft-preserving mode changes. Verify actual mobile use with the on-screen keyboard open, focus, zoom, 320-CSS-pixel reflow and assistive-technology use; a library feature list is not accessibility acceptance. Start with VoiceOver/Safari and NVDA/Chrome, then confirm school targets. Diagram alternatives identify vertices, reference/right angles and givens without giving away a side-identification answer. The complete help/report/submission route needs the same access checks.

## Saving without storage chores

Reuse committed `course-state-v1` through the existing bridge. Store a stable instance ID, seed plus frozen parameters, family/generator/checker/content versions, raw retained responses and sticky support history. Reopen the same problem; never silently regenerate it or regrade old evidence after a version change. Unsupported migration needs a recovery path.

The original Pass 2 proposal of 24 instances × four attempts plus 1,000-character explanations is withdrawn: it can exceed its stated 40,000-character budget before metadata. Unlimited verbatim history cannot fit a fixed-size SCORM record. A download/reset chore is not an acceptable normal learning step.

Adopt Pro's protected/active/recent-history design as a candidate allocation for measurement:

| State tier | Initial proposed bound | Protection |
|---|---|---|
| Active work | One run of up to six frozen instances, current drafts/checkpoints/support | Never rotate away unfinished work |
| Recent practice | Six most recent completed, unpinned instance records | Older ordinary detail rolls into disclosed summaries |
| Selected evidence | Up to four protected instance records, including required evidence | Never evict automatically; preview an explicit replacement; full slots do not block practice |
| Summaries/exposure | Fixed per-skill counts, support distinctions, completion/version data, bounded exposure markers | No complete-transcript or mastery claim |

Deduplicate records referenced by more than one tier. Retain the first mathematical submission and the latest three per retained instance, plus total submission count and at most one bounded short-reasoning field per instance. Four is a history bound, not an attempt limit; a fifth attempt remains available. Preserve the problem/givens or a guaranteed immutable rendering version. The selected initial response and correction must remain intelligible after later updates.

Explain the limited-history policy before practice and make its detail inspectable. Older ordinary practice can roll into summaries without a modal, download or reset. Keep protected work and support/exposure metadata out of that eviction window. Do not silently shorten entries, label summaries as verbatim archives, or present the package as an unlimited digital notebook.

Measure the actual capacity during the implementation's state-design check; these slots are not a proven fit. Check worst-case serialized application state and the complete encoded bridge envelope, including high-entropy text, Unicode/escaping, counters, tracking, framing and simultaneous records. The inspected 60,000-character SCORM 2004 envelope is controlling; 40,000 application characters remains a separate provisional ceiling. If needed, reduce redundant data or unprotected recent capacity before release; never silently change protected evidence or truncate text at runtime. Target SCORM 2004, subject to tenant proof; do not silently fall back to a smaller state budget.
Summary rollups must be idempotent and revision-aware. An unexpected capacity/commit failure preserves current work and the last valid LMS record, shows truthful unsynced/local-only status, and offers recovery. Never silently drop drafts, first-attempt evidence, checkpoint work or support labels. If new durable instances cannot safely be created, keep current work accessible and provide a paper/teacher continuation route; do not claim cross-device saving.

Default to the committed managed-state capability and its published hooks. Quiet automatic-mode controls and optional action reporting seen in dirty Social work are candidates, not mandatory pilot dependencies. Adopting them requires a separately approved, reproducible predecessor integration. Re-read and record the relevant baseline before building; do not silently copy, reset or commit unrelated work. Preserve one saver and truthful save/recovery behavior.

## Teacher evidence and delivery

A learner-previewed process report contains selected problem/response evidence, support used, self-correction and demonstrated/uncertain outcomes. It is a snapshot of retained evidence, with its detail window identified. Export never unlocks practice. At a meaningful teacher-selected milestone, selected written work is submitted through the actual approved Brightspace assignment; a local download or opening an assignment link is not a submission. Use accepted copy/print/download formats and avoid duplicate transcription of paper work. Submission must work on the target device.

Native SCORM completion/time/interaction reporting is a separate capability to demonstrate in the actual tenant. Package suspend data and neutral action counters are not automatically a teacher-readable reasoning dashboard. Native reasoning reports are optional and do not block release when the approved alternative evidence handoff is demonstrated. Do not add a gradebook writer or cross-course student-data service for this pilot.

Plan one small pilot SCO with the factoring and trig slices, selected local assets and no formal exam banks or full textbooks. Source archives range up to hundreds of megabytes, but those sizes do not forecast a selected pilot package. Measure the real package and load behavior before choosing later unit boundaries.

## Construction and acceptance

After a separate bounded implementation request, work in this order:

1. Freeze the exact repository/dependency baseline; scaffold the new Direct pilot; declare canonical/generated ownership and keep SCORM release disabled.
2. Prove supported polynomial parsing/form checks, input compatibility, constructive bounded generation and state capacity/recovery with focused tests.
3. Finish and report the positive-monic milestone first. On a subsequent scope decision, complete signed/common-factor families, the trig contrast, later mixed check and full evidence/report route.
4. Inspect changed learner areas during Build mode; run immediate narrow checks for parser/trust and saved-state risks. Accumulate broader checks for the requested rollout checkpoint.
5. At rollout, validate content/diagrams and all original M01–M16 obligations, project interaction E2E, course/workspace doctor, new-course readiness and real Studio apply/reload/Undo. Exact-head evidence must include the actual shared dependencies.
6. Only after authorized packaging, inspect the artifact and prove launch/resume/interruption/new-attempt/replacement and actual teacher evidence in Brightspace. Separately authorize a small controlled learner observation after technical readiness; use it to inform broader release. Do not create a circular requirement for observed effectiveness before any controlled observation is allowed.

M01–M30 remain the original immutable proposed fixture file: implemented=false, passed=null, not_run. Put future executable bindings and results in separate files rather than editing that historical source corpus. M17–M30 are deferred later-family expectations. Separately named unsupported-family guards can pass while the future mathematical tests remain unimplemented; they are never substitutes for those tests. Scenario fixtures must be bound to executable inputs during implementation rather than counted as passing prose.

Stop rollout for rejected valid mathematics, lost work, false save claims, overwritten teacher edits, inaccessible essential notation or a help route the learner cannot leave. Repair and rerun affected checks; do not restart every broad suite after each ordinary content edit.

## What remains to be decided or proved

- Teacher confirmation of the current 10C outcome mapping and intended progression; the old program URL now relocates to LearnAlberta. No current full curriculum sign-off was obtained in this review.
- Permission to redistribute any selected source assets. Prefer newly authored examples/diagrams when source copying is unresolved; retain private provenance.
- Actual assignment/help routes and learning-tool policy. Learning support is distinct from formal assessment conditions. Current calculator guidance is labelled 2026–27; the linked 30-1 bulletin remains 2025–26.
- Actual device/assistive-technology targets and observed usability, plus real tenant/student/teacher persistence/report evidence.
- Dean's bounded implementation request. Model agreement completes planning, not these external gates or course implementation.

Future expansion follows evidence: complete and observe the 10C pilot; add explicit 20-1 graph/vertex/range contracts; add 30-1 logarithmic/domain contracts with original-domain checks; then choose coherent unit production and a supported authoring adapter if repetition warrants one. Defer universal CAS/tutoring, handwriting recognition, automatic arbitrary reasoning grades, secure formative-exam claims and cross-course mastery analytics.

## Evidence and record

This master plan and the final decision register govern over conflicting historical working-note proposals. Variable GCF and power-0 support from the input notes remain deferred; parseable impossible trig values are mathematical errors. Local state/checker advisories are proposals subordinate to the final contract.

Read `CHATGPT_PRO_RECONCILIATION.md` for Pro's actual response, `DECISION_LOG.md` for amendments/dissent, and `REQUIREMENT_DISPOSITION.json` for all 26 requirement decisions. `CODEX_COUNTER_REVIEW.md` records the engineering findings; the original sent Pass 2 ZIP is preserved unchanged. Supporting notes distinguish inspected code/source pages, primary documentation, supplied claims and proposed behavior.

The review checked current source, all six archive inventories/BOM counts, two instructional HTML lessons and four rendered instructional PDF pages. Original fixture/README transfer hashes match Pro's reported package manifest. The complete original bundle was not independently downloaded and hashed by Codex. No Math code, course tests, package, deployment, accessibility acceptance or live LMS result was produced.

Planning completion does not resolve U01–U06. All technical acceptance remains unrun; the completed work is the source-grounded plan, critique, reconciliation and reviewable implementation request.
