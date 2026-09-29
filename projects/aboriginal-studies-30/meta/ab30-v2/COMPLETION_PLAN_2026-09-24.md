# Aboriginal Studies 30 — completion and quality plan

Status: implementation underway; all 50 lesson records now use v2 blocks and the bank has 300 objective/100 written items. Full editorial, curriculum, Studio, export and host acceptance remain pending. See `LEAD_CHECKPOINT_2026-09-24.md` for current evidence.
Owner: Dean Guedo. Candidate: the current local Aboriginal Studies 30 workspace.
Planning snapshot: 2026-09-24, branch `codex/math-engine-preflight`, HEAD `02a9fadc`, with existing uncommitted course work.

## Outcome and authority

Deliver a complete, coherent course that an independent senior-high student can learn from: Biology-quality presentation, clear teaching, meaningful source analysis, useful feedback, connected assigned work, and dependable saving. Success requires examining the actual learner experience as well as the source code.

Dean's directions and the latest local work govern. Use the supplied v2 package as a requirements/reference source; its baseline code must not replace the newer workspace. The pasted ChatGPT delivery description supplies quality goals, not proof of implementation or acceptance. Keep the existing Next Step identity, 50 lesson IDs and display order, formal assignment identities, marking policy, saved responses, and source provenance.

## Verified starting point

| Area | Current evidence | Required completion |
|---|---|---|
| Lessons | 50 routes; 45 records use `ab30-v2` content versions | All 50 meet the teaching standard and have an evidence-backed editorial review |
| Practice bank | 270 multiple-choice records and 90 written records | At least 300 distinct reviewed objective variants and 100 written variants, six plus two per lesson |
| Presentation | Local Work Sans/Hanken Grotesk assets and revised navigation exist | Actual font loading, component comparison, mobile and keyboard acceptance |
| Saved work | Store migration and first-submission/revision features implemented; lead review blank | Lead acceptance and production-browser failure/recovery proof |
| Pilot | R09 records unit/static evidence and browser checks marked NOT_RUN | Re-run original G1–G3 requirements through the learner UI |
| Delivery | Generic exporter resolves detected and manifest-declared storage keys | Trace the actual AB30 export and measure save/restore; do not accept an old claim that no bridge exists without tracing this path |

The R09 record says the acceptance specification was unavailable. The supplied ZIP contains `09_ACCEPTANCE_AND_PROOF.md`; reconcile the record with that complete specification before accepting the pilot. Existing completion records are implementation evidence, not final acceptance.

## Ordered implementation

### 1. Reconcile the candidate and accept the shared foundations

- Record current source hashes, dirty/untracked/binary files and any active worker. Preserve the current candidate and compare any later edits before integration.
- Reuse R00–R32 records, the acceptance matrix and original lesson identities. Create one remaining-work ledger with PASS, FAIL, NOT_RUN or BLOCKED supported by evidence; distinguish stale test assertions from product defects.
- Lead-review R02–R04: one durable writer, legacy/v1/v2 migration, unknown fields and conflicting values, activity-first recovery, draft handling, exposure provenance, first submissions, revisions, import/export and cross-tab behavior.
- Exercise Lesson 7 through visible controls under HTTP: read sources, choose wrong/correct supported answers, type slowly, save the entire first response, open criteria, save a revision, navigate away, reload and return. Include a mid-practice navigation/reload and denied-storage case.
- Confirm that save failures retain work and do not unlock submission-dependent controls. First submissions remain immutable and distinct from drafts and revisions.
- Restore the original G1–G3 acceptance criteria. Repair shared failures, then record lead acceptance and refresh the shared pattern evidence before further propagation.

Acceptance: no loss or mislabelling of work in these flows; genuine browser evidence for the shared pattern; unresolved host behavior explicitly separated from local behavior.

### 2. Complete and refine all 50 lessons

Finish the five remaining Theme 4 lessons in their existing display order:

1. `t4-l02-colonial-wounds` — Colonial Wounds: Ainu, Australia, and the Stolen Generations.
2. `t4-l06-resources-conflict` — What the World Wants from Indigenous Land.
3. `t4-l03-land-resources-un` — The UN: Pressure, Not Law.
4. `t4-l07-education-odds` — Education Changes the Odds.
5. `t4-l04-youth-future-response` — Carrying It Forward: Youth, Review, and Your Response.

Use the existing workcards and R27/R28 dependencies, matching stable IDs rather than assuming an ID suffix is the display number. Finish source preparation in parallel only where it is independent of shared runtime defects.

Review every previously revised lesson as well. Keep successful teaching and rewrite actual gaps, repetition or unexplained terminology. Every lesson must provide:

- A clear learning goal, useful prior-knowledge prompt and essential question.
- Headed explanations that teach the concept to a first-time learner, connect evidence to meaning, and address a likely misunderstanding.
- A complete worked example: source/question, relevant detail, reasoning, completed response and appropriate limitation.
- Supported practice with a real attempt and feedback, followed by a different independent application.
- Readings, key terms and assigned work linked at the point where they help. Avoid forcing all topics into identical paragraph counts or adding extra compulsory writing.
- Plain Canadian English and appropriate historical context. Distinguish specific Nations, First Nations, Métis and Inuit; verify speaker/narrator attribution; remove internal editorial language and unsupported present-day claims.

Use a map, timeline, comparison, image or source excerpt when it improves understanding. Explain what the student should notice. Use permitted, traceable materials; record why no additional visual is needed where prose/source analysis is sufficient.

Acceptance: one completed review record per stable lesson ID, quoting the actual teaching and identifying source locators, worked reasoning, feedback, independent task and remaining limitations. Component presence and word counts alone do not pass a lesson.

### 3. Reconcile the actual assigned work and curriculum

- Compare the expected 281 source-item homes and 167 numbered booklet questions with the official PDFs. Visually inspect charts and multipart tasks; provide one canonical response record with links from related lessons.
- Verify Theme 3 discrimination/reserve-life charts and all 14 Reel Injun prompts, Theme 4's 12 two-column comparisons, Rabbit-Proof Fence work, and the memoir's six definitions plus Introduction and Chapters 1–24 work.
- Keep the versioned Halfbreed profile for new candidate work while preserving legacy Inconvenient Indian prompts, drafts and submissions under their original identity. Preserve the existing rubric and exclusions from weighted work.
- Treat theme assignment wrappers as collection/submission views, not additional essays. Make required versus optional work explicit.
- Verify media routes and the exact source edition/page mapping. Record and hold only affected tasks where required media access or source permission cannot be established.
- Obtain and identify the official Alberta program of studies, then map outcomes to lesson teaching and learner evidence. Booklet coverage alone is not a curriculum-alignment claim.

Acceptance: no missing or duplicated required task, no silent grading-policy change, usable source links, and explicit source/outcome coverage evidence.

### 4. Finish practice and make saved work understandable

- Add the remaining 30 objective and 10 written variants, then review the entire bank for accuracy, distinct applications, plausible distractors and explanatory feedback. Reworded duplicates do not satisfy the target.
- Provide six reviewed objective variants per lesson: two concept distinctions, two source/evidence distinctions and two applications/comparisons/sequences. Provide two different written variants with criteria, without automatic essay scoring.
- Populate only supported modes: flash cards, blanks, multiple choice, matching/timelines, source practice and mixed practice. Verify mixed practice actually samples the available supported modes; hide any unavailable mode.
- Use the existing finite, deterministic bank and five-item default sessions. Persist item/version identities, option order, position, drafts, attempts and exposure. Mark exhausted pools as review practice.
- Make All My Work show theme → lesson/assignment → task, latest draft, first submission, revisions, source/version and support history. Preserve those distinctions in print and export/import.
- Keep assigned-work completion, practice participation and actual teacher review distinct. Optional practice adds no formal marks or new compulsory denominator.

Acceptance: the full 300/100 reviewed bank meets per-lesson distribution; every visible mode works; first and revised work survive navigation, reload and export/import without losing provenance.

### 5. Finish the Biology presentation and navigation

- Use the existing locked Biology donor and local font assets. Compare equivalent components and same-text fixtures; do not invent a new visual identity or judge parity from colour alone.
- Enforce the supplied hierarchy: title and essential question; learning goal/prior knowledge; collapsed lesson guide; reading band and vocabulary; teaching; worked example; supported task; independent application; assigned work; previous/next navigation.
- Validate the specified body/heading metrics, approximately 760px narrative measure, source attribution, response controls and spacing. Remove conflicting rules only in the affected AB30 boundary.
- Keep the course overview, theme/lesson navigation, My work and Resources grouping. Use one sidebar scroll area, wrapped titles, one current-page marker and a visible active lesson. Preserve the newer R06 removal of the former 360px nested lesson scroll box.
- Verify open teaching navigation, deep links, Back/Forward, refresh, library/PDF page links, vocabulary, films and practice. Existing administrative flags must not strand a learner outside assigned work.
- Confirm mobile header geometry, drawer focus, Escape/scrim, route selection, dialog focus return, visible keyboard focus and usable tables. Reconcile explicit labels with the actual destination, including learner-facing Practice & Review rather than an empty quiz promise.

Acceptance: all 50 openings rendered on desktop/mobile; representative long sources, charts and response flows inspected at narrow width; no overlap, hidden active route or ordinary-prose overflow.

### 6. Validate and deliver the candidate

Freeze the agreed candidate, then run one ordered acceptance batch. During preceding Build work, run only affected checks needed for saved-state safety, broken previews or shared-framework changes; do not repeat full suites after every prose edit.

1. Static/focused checks: syntax, doctor, metadata/canonical-source coverage, asset references, unique IDs, original task homes, practice distributions and relevant existing unit tests. Repair stale test contracts transparently; never weaken a valid failing assertion to pass the candidate.
2. Browser acceptance through real clicks/typing: routing, source controls, supported/independent flow, revision, practice resume, work export/import, print, storage denial/quota, cross-tab conflicts and recovery. Use synthetic data only.
3. Visual/accessibility acceptance: 1440×1000, 1024×768, 768×1024, 390×844 and 320×740; all 50 openings at desktop/mobile, complex activities at 320px; keyboard, 200% text resize and actual browser zoom/reflow. Review images and computed font/layout metrics together.
4. Studio acceptance: render the actual workspace, navigate to a later lesson, select runtime content, save an annotation and capture/reopen its screenshot; verify supported editing boundaries accurately rather than changing capability flags.
5. Export acceptance: use the existing review-only SCORM export path, inspect the actual ZIP assets/manifest and resolve the three existing storage keys through its bridge. Measure serialized/encoded size for realistic whole-course responses, history and reload. Test commit failure and resume through the exported artifact.
6. Report real Brightspace launch/save/close/reopen separately. An unavailable real host yields a local candidate with host verification pending. If measured capacity cannot hold the course, retain all work, block host readiness and present the measured architecture decision; do not truncate responses, invent new learner limits or silently add a backend.

Deliver the complete candidate, a fresh clearly named audit ZIP, a concise review route, screenshots, exact source/export hashes and one honest acceptance ledger. Packaging and live LMS/deployment actions occur only when the user requests the corresponding checkpoint. No previous approval timestamp approves changed candidate bytes.

## Ownership and compatibility

Canonical entry: `projects/aboriginal-studies-30/workspace/index.html`; retain declared workspace ownership and include all actual runtime owners in metadata. The legacy-snapshot driver remains truthful. Source-content changes belong in workspace; evidence and this plan belong in `meta/ab30-v2`; baseline and imported material remain references.

Lead owns persistence, migrations, assessment policy, source-of-truth decisions, integration and final acceptance. Bounded source inventory can use Luna; clean isolated content/test slices can use Muse only after the current admission and overlap checks pass. The current shared course paths are dirty, so a detached HEAD must not be treated as the current candidate. No runtime API, storage-key rename or new backend is assumed; internal changes must preserve route, field, option and submitted-record identities.

Planning route used: lead source inspection plus deterministic inventory. The requested Luna route was refused because the generated worker packet exceeded the 8,000-byte limit, even after narrowing context; no worker was launched. No local context-cache hit or provider-cache saving was measured. Future delegation requires a compliant admitted packet, not bypassing that limit.

## Planning handoff

- Summary: a completion and quality plan grounded in the current 45/50 lesson implementation and the supplied requirements.
- Files changed: this plan only; no learner course edits, builds or test runs during planning.
- Verification performed: read current source and records; evaluated authored data in an isolated Node context to count lessons and bank types; inspected supplied ZIP specifications and generic SCORM key resolution.
- Risks/follow-up: pending lead acceptance; unrun browser evidence; unknown actual host capacity; five older lesson records; source/permission/outcome review still requires evidence.
- Fragile areas: active parallel work, saved state and content versions, legacy memoir records, display order versus ID suffix, stale shared-pattern hashes and stale archives.
- Next prompt assumptions: use the current local candidate and this plan; scope is preparation of the complete revised course, with release claims tied to actual proof. Do not restart from ZIP baseline or assume prior worker checks are lead acceptance.
- Exact next action: refresh current worker/source status and perform Phase 1 reconciliation and lead review before continuing the five remaining lessons.
- Exact next file to open: `projects/aboriginal-studies-30/meta/ab30-v2/R02-LEAD-HANDOFF.md`.
