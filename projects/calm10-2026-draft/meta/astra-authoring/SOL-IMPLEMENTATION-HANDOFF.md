# Sol implementation handoff

Authoring candidate: 2026-09-28.astra.1. Start at README.md, then AUTHORING-CONTRACT.md. This package contains full text and interaction specifications for 39 lessons, plus orientation and portfolio copy. CO1-01 uses the approved review revision. This pass did not edit learner HTML, CSS or JavaScript.

## Implementation boundary and first action

Implement the approved CO1-01 review into the canonical lesson and establish the common saving/completion behavior, then implement the module batches below. Work in the existing project. The workspace is already dirty; inspect its status and current hashes before editing. Do not overwrite intervening work using the baseline.

Canonical learner owner: projects/calm10-2026-draft/workspace/index.html and its declared scripts/styles/assets in meta/project.json. Authoring Markdown is reference specification, never a second runtime renderer. Keep ordinary text, fields, images and links in editable HTML with stable edit keys. Behavior may attach listeners but must not replace the text after load.

Preserve the Biology-style shell, sidebar, sidebar toggle, existing typography, restrained colours, vocabulary tools and document reader. Use approved CO1-01 B for hierarchy and instructional depth. All 40 lesson routes and existing main evidence keys survive. No redesign of unrelated courses, shared Studio or generic framework is needed.

The authoring pass does not authorize export, deployment, commits or learner release. Keep project status blocked until its separate release gates are satisfied.

## First batch: integrate CO1-01 B and the common controls

Read workspace/co1-01-review.html, co1-01-review.css and co1-01-review.js. The approved revision explains a posting and experience record, introduces Rowan before questions, shows a context–action–result example, supports a second match and sentence, and ends with the distinct festival/fundraiser task. Preserve the four signoffs and Complete/Reopen interaction.

Use canonical route co1-01 and its main final key co1-01. Archive the existing canonical prompt/response under its old version. Import the B wording and final duty field into the current task; do not automatically copy review-page answers. Review storage calm10-2026-draft:review:co1-01:v1 belongs to the review artifact. The copy with its own final controls becomes the lesson, not an iframe or second independent course shell.

Skills for Success stays optional and collapsed. Remove the early required-source block and required source checkbox in this lesson. Its link points to the official skill descriptions; if the page is unavailable, the lesson remains complete.

For implementation, assign new canonical CO1-01 task version 2026-09-28.astra.1; preserve the review version 2026-09-28.3 only as review provenance. Do not overwrite an old answer's task version in place.

## Shared learner interactions: exact decisions

- One expandable **How to complete this lesson**, one **Core vocabulary**, one optional named reference. Keep reference advice separate from actual tasks. Do not prepend a generic source stop.
- Use vocabulary-copy.json for the four core terms and definitions in each of the 40 lessons. Keep further definitions in the teaching paragraphs. Map current vocabulary IDs before editing; preserve vocabulary:v1 and previous attempts. Render the new glossary as canonical editable HTML rather than loading this authoring JSON in the learner runtime.
- Place case documents before any dependent question. A record is a document with purpose, author/fiction label, date where meaningful, labelled fields and readable hierarchy. See VISUAL-AND-DOCUMENT-MANIFEST.md.
- Document check and six MC questions accept one selected option each. Immediate or explicit Check feedback must identify that option and explain its reasoning. Keyboard operation and change-answer revision work.
- Guided construction uses the packet's labelled fields, numeric checks and model. Every Check button validates blanks before numeric conversion. It never marks prose “correct” from keywords.
- Models remain available without correctness locks. Show the learner's text beside the annotated model only when useful; do not present the model as their saved response.
- Four signoffs use real checkboxes with labels, visible keyboard focus and an explicit bottom **Complete lesson** button. The packet supplies the exact criteria.
- Required final fields must be nonblank, with valid finite numeric values where the control requires a number; select placeholders do not count. Do not use an unstated word-count or MC-score threshold.
- Completion requires the current final fields and all four signoffs. It means reviewed work, not passing a test or mastering writing.
- **Reopen lesson** keeps responses, clears four signoffs and completion, and restores editable review. Editing any independent field also invalidates completion/signoffs. Editing only practice preserves final completion. Changing task version invalidates current completion but retains history.
- Completed sidebar link has a visible check to the left, course-green treatment with adequate contrast and accessible “Complete” text. Do not rely on green alone. Each lesson counts once out of 40.
- Sidebar state, draft count and completion count update immediately after a successful state transition. On save failure retain the in-memory draft, make the persistence failure visible and keep download available; do not display an unqualified Saved claim.

## Saving and migration

Current owner course.js uses namespace calm10-2026-draft:learning:v3 and payload schemaVersion 3 with responses, taskVersions and responseHistory. Older portfolio v2/v1 stores remain readable. Vocabulary v1 is separate; historical source-checkpoints:v1 stays separate. Preserve those namespaces and all unknown/removed keys during migration.

Add a backward-compatible, explicitly versioned extension for lesson completion and typed checkbox values; either maintain schemaVersion 3 with a documented optional extension or migrate transactionally to a new schema that still reads every old shape. Choose one implementation and test it before batch copying. Do not merely rename the namespace and start empty.

Required completion record per lesson: taskVersion, completedAt and the final response revision/hash at completion. Signoff keys: completion:<id>:criterion1 through criterion4, booleans. One completion record per lesson. Extra final keys evidence:<id>:<part> belong to the same lesson group. Intro keys check:<id>:document, guided:<id>:partN/match and practice:<id>:q1..q6 do not inflate final progress.

The existing source snapshot pre-rebuild-lesson-snapshot.json preserves the old 40 lesson fragments, prompts and save keys. Build a static versioned task registry from it and the new packet labels. A history entry must resolve to its earlier prompt/version, response, and timestamp if known. Do not label old answers with new instructions. Keep both a full static old task description and the specific field label so historical work is interpretable.

Current history truncation keeps only five entries; remove silent loss. Capacity must be managed visibly with backup/export and honest errors, not invisible pruning. Any schema migration must stage, validate and serialize successfully before replacing persisted data. Store a recoverable pre-migration backup when feasible. If capacity prevents safe migration, retain the original bytes and explain that a backup is needed.

Current restore code hydrates before confirmation. Replace with: parse into staging → validate schema/keys/types/size → show summary/conflicts → confirm → snapshot current state → apply once → save. Cancel or invalid input must leave storage, fields, completion and UI unchanged. Do not execute imported HTML or insert responses using innerHTML.

Cross-tab handling must preserve pending work. If a newer copy is found, pause automatic writes and offer the exact two copies for selection or download. Do not let a stale tab silently replace a completed lesson.

Existing size limits include 120,000-character local payload and 300,000-character import. Measure expanded realistic work plus histories; update limits/SCORM strategy deliberately at rollout. No claim of LMS persistence until tested. Browser saving and SCORM suspend/resume have distinct evidence.

## Reuse existing activities safely

Keep a single instance of each activity. Course tools link to that instance; do not duplicate IDs/fields or auto-load example values over saved experiments. A **Load this example/practice** button previews replacement when populated; cancel preserves work. Display units, input bounds, method, timing and rounding with output. Packets supply the exact case assumptions.

Preserve old activity keys:
- career-compare: aCost, aMonths, bCost, bMonths, priority.
- program-plan: pathway, course, requirement, support.
- interview: answer, improvement.
- workplace: action, followup.
- paystub: gross, net.
- budget: income, essentials, flexible, saving, surprise.
- loan: kind, principal, rate, months, fees.
- debt: aBalance, aRate, bBalance, bRate, monthly; add explicit minimum inputs for the new model.
- saving: start, monthly, years, return, fee, inflation.
- plan-challenge: income, essentials, flexible, debt, saving, shock, change.
- scam: kind, verify.
- contract: promo, regular, aSetup, bMonthly, bSetup.

Each is prefixed activity:. The new savings formula is a task-version change: annual effective return converted to monthly, fee deducted monthly, deposits at month-end, full precision until display. The old (return − fee)/1200 approximation must remain labelled in old histories. Move the budget shock activity into FL3-06 as specified without discarding its old FL3-05 responses.

## Calculation specification

Read numeric-fixtures.json and savings-fixtures.json, not just model text. Loan interest rounds half-up to cents at each monthly posting; payments round to cents, final payment clears the residual. Re-amortize the remaining balance at a supplied rate-reset date. For nominal monthly loans use annualPercent / 1200. For the fictional semiannual-compounded mortgage use (1 + annualPercent/200)^(1/6) − 1. Mortgage term outputs stop after 60 payments; a full-amortization schedule assumes an unchanged rate and must be labelled hypothetical.

Debt comparisons pay both contractual minima first, then allocate the remaining budget by selected policy, capping at amount owed and moving any unused payment to the other balance in that same month. Reject a monthly budget below the due minima with a clear deficit explanation. No infinite loop for non-amortizing inputs.

Savings model: monthly factor = (1 + annualReturn/100)^(1/12) × (1 − annualFee/1200). Apply to the balance, then add the monthly deposit. Real purchasing power = final nominal / (1 + inflation/100)^years. No guaranteed-return language. Packet comparison uses zero monthly deposits where only growth is being isolated. Reject invalid factor/period and nonfinite inputs; no blank-as-zero coercion. Support the authored FL3-04 bounds: start/monthly 0–100000; whole years 1–50; annual return −50% to 50%; annual fee 0–10%; inflation −10% to 20%. Explain invalid inputs rather than clamping them.

For cent-rounded financial answer fields use the packet's half-cent (±$0.005) tolerance; whole periods and selected options match exactly. Calculations validate the numeric response only. A correct amount does not complete a missing explanation.

## Module execution order

| Batch | Scope | Specific integration concern |
|---|---|---|
| 0 | CO1-01 B, common typed saving/completion, orientation styles | Prompt-history migration and review isolation. |
| 1 | CE1-01…07 | Dated ALIS records, course-chain dates, authentic documents, fictional vs real requirements. |
| 2 | CO2-01…04 | Current Alberta source records and jurisdiction; separate legal duty from supplied workplace procedure. |
| 3 | CO1-02…05 | Approved floor plan, permissions, timed changes, truthful experience. |
| 4 | FL1-01…06 | Pay periods, cash-flow dates, changed-plan acceptance, total contract/purchase costs. |
| 5 | FL2-01…07 | Amortization, debt minimums, rate resets, mortgage conventions and fees. |
| 6 | FL3-01…06 | Shared money across goals, account vs asset, fee/inflation formula, changed-plan states. |
| 7 | FL4-01…05 | Safe inert fictional messages, specific verified routes, exposure vs misuse, no recovery guarantee. |
| 8 | Orientation, My Work, portfolio, metadata alignment | One 40-lesson progress model; historic assessments kept separate. |

Before each batch check the intended write paths for other edits. Use existing deterministic operations where safe. Keep instructional decisions/math/state review with the lead; delegate only mechanical clean slices under repo rules. If a packet conflicts with the current code, preserve the learner-data contract and record the smallest necessary implementation choice; do not silently invent new instruction.

## Build verification and deferred rollout

For each batch inspect the changed desktop and phone areas. Do not regenerate all screenshots or run every course suite after each edit. Immediate focused checks are justified for changed saving, calculations, completion, restore/import and boundaries; explain the reason before running. Record exact results and outstanding issues.

Focused risks: old-response migration; typed checkboxes; reload; Reopen; final edit invalidation; practice edits preserving completion; two-tab conflict; quota failure; cancelled restore; corrupt restore; duplicate progress; each calculation fixture; preserved canonical routes; keyboard/focus on changed controls.

At the separately authorized rollout checkpoint run the accumulated accessibility, Studio/editability, course-readiness, learner E2E, media/captions, resource and SCORM/package checks in one planned batch. Use existing project commands after confirming their contracts. Do not run a quarantined legacy builder over direct HTML. Real Brightspace validation is outside this authoring task; no local result substitutes for it.

The instructional verifier must be updated to test the new teaching/control sequence and optional external references. Old universal “required source stop” counts are intentionally obsolete. Retain questions, field metadata, group/route uniqueness and source-date checks that remain meaningful.

## Definition of implemented

The learner can start with no prior case knowledge, identify the document, understand the method, attempt and revise supported work, finish the new case, sign off, complete, reload and find the completion check. All facts used in the model were visible before its question. Every calculator explains its assumptions. Source links are named and optional where the dated record provides the lesson. Old responses retain their old task context. This definition is inspected; markup counts alone cannot prove it.
