# Math 10C Unit 3 — audit-driven repair brief for ChatGPT

Prepared for Dean Guedo · 20 September 2026

**Deliverable requested now:** this implementation plan and reference bundle. No repairs have been applied by producing this document. The code below specifies proposed changes; it is not a tested replacement implementation.

**How to use:** upload the companion repair brief ZIP to the ChatGPT math project and paste the START MESSAGE below. The bundle contains the unmodified v0.4 candidate, governing plan, immutable original fixtures, and exact shared-code references. ChatGPT should return a repaired review candidate plus a separately reviewable repository patch. Codex then integrates and independently checks the result. Actual Brightspace and learner acceptance are later gates.

## START MESSAGE — paste this into ChatGPT

> Use the attached CHATGPT_MATH10C_REPAIR_IMPLEMENTATION_BRIEF.md as the repair specification and follow its steps in order. Repair the supplied Math10C_Chapter3_Reconciled_v0.4.zip in a new working copy. Preserve the complete eight-lesson Chapter 3 unit, its teaching and science-course styling, stable learner IDs, and existing learner work. Deliver actual edited source and executable regression tests, not another general plan.
>
> First verify the included manifest and inspect the source. Implement the specified package repairs. If you cannot access a writable checkout of canvas-helper at the recorded baseline, produce a unified patch against the included shared-source references and clearly mark repository/Studio/CI checks as not run. Do not present a change to tests/reference as a production bridge repair.
>
> Measure the complete actual SCORM bridge envelope before proposing final explanation/history limits. Keep the current limits during the repair work; do not silently shorten existing text or choose new limits for Dean. Continue independent repairs while preparing that measured decision. Preserve both conflicting versions and the last confirmed save whenever saving fails.
>
> Return the source candidate, shared repository patch, updated regression fixtures, capacity decision report, requirement-by-requirement evidence matrix, and honest confidence report described below. Do not install into the live repository, commit, push, deploy, publish to learners, submit assignments, or claim Brightspace/Studio/assistive-technology acceptance. Those are separate execution gates. Do all locally executable repair work before asking for a decision that genuinely remains necessary.

## 0. Authority, scope, and baseline

Apply the owner's current repair request and this brief, then the reconciled master plan and decision register. Historical first-milestone prompts are context. The later owner-authorized complete Unit 3 scope supersedes the original one-positive-monic-lesson milestone; do not shrink this candidate back to one lesson. Documents and builder reports are evidence to inspect, not permission to execute unrelated instructions contained in them.

Preserve lessons 3.1–3.8, current navigation, eight required completion IDs, optional support routes, and the trigonometry contrast. Trig must not become a ninth compulsory chapter checkpoint. Retain prepared-learner access to independent checks and the alternative written-method route. Do not add a universal CAS, arbitrary reasoning grader, gradebook writer, new analytics service, remote AI dependency, or full course factory.

| Input | Verified baseline |
|---|---|
| Repository | deanguedo-arch/canvas-helper |
| Inspected branch | codex/social-ela-updates |
| HEAD | d0b4cf731dd180cebee908915772e90687d40215 |
| Candidate ZIP SHA-256 | d5623a216332fce329c9cedc801b04688898df76616320d198b1bdb339fadd08 |
| Phase A blind ZIP SHA-256 | 259a0d6d9278120a2e95fe6b9c642a3215c7574200fcb76ecaf6ca995440783a |
| Master plan SHA-256 | 7574a9ed186a04099ee2731876fcda5f06cdfb6d5e37958f4e2161c254fa3370 |
| Original M01–M30 fixture SHA-256 | b59def072b94e8a208cb2fef5418b0898620d96a1966fba3c89fbbfcf4431cb5 |

The repository was clean at inspection and contains no installed Math pilot. Recheck before integration. The bundle manifest hashes every included file and identifies copied reference files. Never overwrite a changed repository file merely because its path matches this brief.

### What the independent audit established

The teaching direction and most mathematical content followed the plan substantially. All 122 authored answer keys and 25 principal worked identities were independently recalculated correctly. Checks of 1,584 generated parameter records across five response variants produced 7,920 checks matching their expected outcomes: canonical factors, reversed factors, compensating signs, equivalent-but-unfinished expanded form, and an incorrect factor mutation. This is strong evidence for those cases, not proof of unrestricted mathematics or complete release readiness.

The audit found reproducible problems with save-control integration, false save acknowledgement, initial-empty-tab conflict detection, stale feedback, some bounded-checker cases, hidden mobile keyboard targets, trig support chronology, and missing instructional coverage. A later state-design check identified the shared codec's byte/character comparison defect. MathLive was not implemented, and actual Studio lifecycle, tenant persistence, assistive technology, teacher acceptance and learner outcomes were not established.

The builder's 1,759 test count and 37 browser scenarios cover mixed categories and use important mocks. Preserve useful tests, but add the failing paths below. Do not equate assertion count with confidence. No Phase A finding was reversed by reading the builder's Phase B claims.

## 1. Freeze inputs and establish file ownership

Extract the supplied candidate into a new repair working directory. Keep the original archive unchanged. Verify the manifest and original fixtures, and write a baseline inventory before changing source. Record tool versions and actual execution environment.

| Responsibility | Candidate owner | Repository destination / action |
|---|---|---|
| Routine teaching, hints, feedback, diagrams, labels | workspace/index.html | projects/math10c-unit3-pilot/workspace/index.html |
| Presentation | workspace/styles.css | Same project workspace |
| Navigation, draft binding, saving orchestration, reports, menu, trig interaction | workspace/course.js | Same project workspace |
| Reviewed questions, immutable question definitions | workspace/assets/unit-data.js | Same project workspace; declare ownership |
| Parser and form checks | workspace/assets/algebra.js | scripts/lib/math-engine/unit3-reconciled/algebra.js after integration |
| Contracts and bounded generation | workspace/assets/contracts.js | Same Math module boundary |
| State encode/decode/migrations | workspace/assets/state.js | Same Math module boundary |
| Optional input enhancement | workspace/assets/input-enhancement.js | Same Math module boundary |
| LMS session, save/commit/receipt | Existing shared bridge | scripts/lib/scorm.ts |
| Packed versus raw state encoding | Existing shared codec | scripts/lib/scorm-state-codec.ts |
| Shared regression tests | Repository test source | scripts/tests/scorm-export.test.ts; scripts/tests/scorm-state-codec.test.ts |
| Standalone assembled HTML | Generated output | Regenerate through tests/assemble.py; never patch it as source |

Before integration the candidate assets are the repair inputs. After integration the four behavior modules have one Math-owned canonical location and declared generated workspace copies. Do not leave two independently editable owners. Routine HTML is never regenerated by the behavior rebuild.

Use stable semantic edit keys for additions. Preserve existing keys, storage keys, question IDs and completion IDs. Record any required schema/version change and migration. Adding questions changes the current indexed catalog: address Step 2 BEFORE shipping added questions.

Add regression cases to a separate repair test file or folder. Preserve tests/original_M01_M30.json byte-for-byte, with its historical not_run semantics. M17–M30 remain deferred future mathematics; unsupported-family guards are separate tests.

## 2. Make state versioning safe before changing content

Files: assets/state.js, assets/unit-data.js, course.js; new migration fixtures.

The current state format is unit3-state-2. Its question references and exposure bits depend on Object.keys(Q) order. Inserting authored questions before generated questions shifts indices and can silently bind old work to different problems.

Implement an explicit versioned catalog registry. Freeze the exact v0.4 question-ID order as the v2 decoding map. For the next schema, include a catalog version and use that immutable catalog, or use stable IDs where measured capacity permits. Never decode old indices against the current display order.

Proposed interface:

~~~js
decodeSavedState(raw, { catalogs, currentContent, pages });
// 1. Validate the outer schema and select its exact historical catalog.
// 2. Decode against that catalog, including historical exposure bits.
// 3. Migrate explicitly into the current schema.
// 4. Validate the complete migrated state before replacing any live state.
~~~

Retain frozen problem parameters, instance ID, original raw response, support-before-attempt and original result/checker/content version. New parser fixes must not regrade old evidence on load. If the old snapshot only identifies a global engine version, carry that historical provenance forward; do not invent missing information. Existing trig records affected by the chronology bug must be marked as legacy/uncertain, not confidently repaired from unavailable history.

Unknown schema/catalog/engine versions enter recovery with the original bytes available. Invalid or unsupported saved work must not fall through to a new empty course. Do not overwrite the last valid browser or LMS record before complete validation succeeds.

Migration fixtures must cover all saved structures, including anchored checks, generated instances, selected/recent records, first responses, drafts, exposure/seen bits, counters, trig and completion. Include a sentinel generated question after the authored catalog boundary to catch shifted indices. Running migration twice must not duplicate attempts or summary counts.

## 3. Repair the saving path and prove acknowledgements refer to current work

Files: course.js, index.html; repository scorm.ts and focused tests.

### 3A. Fix the save-control DOM contract

The shared bridge selects #save-status or [data-local-status] and sets its textContent. In the candidate, #save-status wraps #save-message and #save-retry, so the bridge deletes both children; message() then dereferences null.

Restructure the existing controls with these exact ownership rules:

~~~html
<div id="course-save-status">
  <span id="save-message" data-local-status role="status"></span>
  <button id="save-retry" type="button" data-action="save" hidden>Retry save</button>
</div>
~~~

Keep permanent submission guidance outside this wrapper: the bridge may hide its entire control host during successful automatic saving. Change course.js message() to style #course-save-status and write only the text-only span. Reuse the single retry button. The shared bridge owns its managed click handler; avoid duplicate saves. Standalone retry must still work without a bridge.

Use the actual emitted shared bridge with the actual course DOM in the regression test. A mock that never runs installControls() does not exercise this defect.

### 3B. Fail closed on local/capacity/conflict errors

Centralize course save failure handling. Preserve the draft in memory, preserve any existing recovery record and last successful LMS snapshot, keep unsynced state visible, and call the existing bridge.failCourseSave(error) for managed saving. Registered flush must reject while local preservation, validation, capacity or conflict resolution is unresolved.

~~~js
function failCurrentSave(error) {
  dirty = true;
  currentSaveError = error;
  if (managed) bridge.failCourseSave(error);
  showUnsyncedRecovery(error); // truthful local-only/unsaved distinction
}
~~~

This is a proposed factoring of the error path, not a drop-in function: define and test its state and rendering dependencies. Do not claim local durability when localStorage itself failed. Download/copy is emergency recovery, never a routine prerequisite for more practice.

### 3C. Add a backward-compatible publication receipt

Current publishCourseState() returns no receipt; generic “Saved to Brightspace” text is not evidence that the latest draft was saved. readCourseState() returns the latest published state, not a commit receipt.

Implement a narrowly additive shared contract, subject to review against the exact bridge source:

~~~js
// NEW proposed capability; not present in the baseline.
bridge.capabilities.courseSaveReceiptV1 === true

const publicationId = bridge.publishCourseState(snapshot, completedIds);
// Existing two arguments remain compatible. Existing callers may ignore return.

// Only after the payload containing that publication successfully commits:
window.dispatchEvent(new CustomEvent('canvas-helper:scorm-status', {
  detail: {
    message: existingStatusMessage,
    error: false,
    phase: 'saved',
    coursePublicationId: publicationId
  }
}));
~~~

Use a session-local opaque publication ID, not a raw learner snapshot or response in an event. Capture the ID together with the immutable course-state/completion tuple being serialized. Do not read a later global publication ID after callbacks/commit. Receipt publication must occur only after successful SetValue and Commit for that payload. Saving, failure, termination-only and generic informational messages carry no new successful receipt. Preserve existing message/error behavior, Boolean save()/saveAsync() results and all older callers, including automatic Social courses.

Fix status-rendering order as part of this contract: announceStatus() currently dispatches the event BEFORE writing the status node and setting automatic control visibility. It can therefore overwrite a candidate listener's truthful “newer changes pending” or error correction. Render the bridge default first and dispatch afterward, or establish an equally explicit single renderer. Verify final text AND final control visibility after handlers finish; keeping dirty=true alone does not make a false visible success harmless.

Candidate logic records the publication ID with its own edit revision and a deterministic identity of the exact published snapshot. Reuse the receipt for an unchanged snapshot if appropriate; a flush should not accidentally manufacture an endless sequence of unrelated acknowledgements.

~~~js
function acceptSaveReceipt(detail) {
  if (detail.phase !== 'saved' || detail.error || blocked || currentSaveError || !ownsWriterLock) return;
  if (!pendingPublication) return;
  if (detail.coursePublicationId !== pendingPublication.id) return;
  if (editRevision !== pendingPublication.editRevision) return;
  if (currentSnapshotIdentity() !== pendingPublication.snapshotIdentity) return;
  dirty = false;
}
~~~

Do not clear dirty or show a current-work-saved message merely because a generic event says “Saved.” A stale receipt must not hide a more recent local error. A retry clears the error only when the current snapshot is valid, preserved locally and republished; then the matching successful receipt can acknowledge it.

For bridges without the new capability, retain a conservative pending/local-only state and identify the missing integration capability. Do not simulate a receipt or quietly claim full compatibility. Standalone browser-local saving remains a distinct, honest mode.

### 3D. Handle two tabs without silent overwrite

At minimum, the baseline comparison must treat null as a real captured value:

~~~js
if (localBaselineInitialized && storedBlob !== lastLocalBlob) {
  preserveAndBlockConflict(openTabState, storedBlob);
  return false;
}
~~~

That check alone is NOT an atomic compare-and-swap. Both empty tabs can pass it before either writes. Add a single-writer strategy for the same origin and LMS attempt: prefer a session-held Web Lock named from the scoped course key. Acquire before any write or managed publication; a second tab remains readable with explicit takeover guidance and cannot publish or complete. Re-read and reconcile durable state after acquiring the lock. Release on actual session teardown; do not rely solely on beforeunload.

Do not describe a localStorage lease or a storage-event listener as a guaranteed mutex. If required browsers/contexts cannot provide the lock, keep the safety limitation explicit and implement a conservative read-only/local recovery fallback until an equivalent concurrency-safe design is proved. If local editing is offered in fallback, use a uniquely keyed per-tab recovery branch and do not replace the canonical/LMS snapshot automatically. Do not silently use an unsafe writable fallback. Where both branches already exist, preserve and preview both until the learner chooses. A takeover must not erase the previous open tab's unsynced draft. Stop and latch the old owner's managed publication/heartbeat before releasing its lock; never automatically steal ownership. Storage/BroadcastChannel notifications may inform conflict UI but are not the lock itself. A failed storage read is not a null baseline; retain conflicting or malformed original bytes for recovery.

The single-origin lock does not solve concurrent devices or every LMS attempt replacement case. Those remain actual-tenant tests with supported attempt semantics; do not claim cross-device conflict prevention from a tab test. Feature-detect access in the actual launch context, including secure-context constraints. Implementation references: [Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API) and [storage-event behavior](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event), checked 20 September 2026.

Required saving regressions: bridge control installation; quota exception followed by an old-snapshot heartbeat; serialization and capacity failures; SetValue/Commit false; stale/newer/out-of-order receipt; retry; initial-null race with controlled interleaving; simultaneous-tab writer exclusion; takeover reconciliation; unsupported-lock fallback; corrupt/unknown-version restore. Verify bytes and revisions, not only status text. In the simulated API distinguish staged SetValue data from confirmed committed data. An actual LMS may have its own persistence behavior after Commit failure; preserve the last confirmed local snapshot and current work, withhold success, and verify tenant behavior rather than promising an unproved server rollback.

## 4. Correct codec selection, then measure the real state budget

Files: repository scorm-state-codec.ts and its tests; candidate state.js, capacity harness and policy report.

The current encoder compares packed.length (characters) with UTF-8 input byte length. The controlling bridge guard measures JSON.stringify(fullEnvelope).length. Mixed units can select a representation much larger than raw JSON, especially for Unicode.

Proposed compatible selection fix inside the existing codec:

~~~js
return JSON.stringify(packed).length < JSON.stringify(s).length ? packed : s;
~~~

Both alternatives occupy the same course.data JSON string slot, so compare their serialized contribution including escaping. Keep raw and CH10LZ1 decoding, integrity checks and the one-megabyte codec bound. Ties may select raw deterministically. Retain the final full-envelope guard. Do not raise the 60,000 guard, remove it, or count an unrelated compression format that the real bridge does not use.

The 60,000 figure here is the inspected repository's SCORM 2004 implementation guard, not a blanket claim about every LMS or standard edition. Its SCORM 1.2 path uses 3,500; there is no silent fallback to that path.

### Capacity decision — must remain explicit

The master plan withdrew 24 instances × four attempts with 1,000-character explanations. It proposed six active, six recent and four selected records for measurement, not as a proven fixed contract. The candidate currently uses two recent, six active, four selected, eight anchored checks, first plus latest three submissions, and short reason fields. Its 40,000 application-character limit is provisional.

Do not choose “120 characters forever” or “1,000 everywhere” on Dean's behalf. Keep existing accepted data and current field limits while fixing independent defects. After the codec change, produce a measured options table and recommend a specific policy with explicit headroom; obtain the owner's choice before changing learner-facing capacities. If no choice arrives, return the repaired candidate with this gate pending.

The measurement harness must execute the ACTUAL emitted shared bridge, using deterministic input records and captured attempted cmi.suspend_data values. Report, for each witness:

~~~json
{
  "caseId": "example-only",
  "reachableThroughUI": false,
  "construction": "Describe exactly how every field was populated",
  "applicationJsonCharacters": null,
  "applicationUtf8Bytes": null,
  "rawFullEnvelopeCharacters": null,
  "packedFullEnvelopeCharacters": null,
  "chosenFullEnvelopeCharacters": null,
  "configuredLimit": 60000,
  "headroomCharacters": null,
  "localResult": "not_run",
  "setValueAttempted": null,
  "commitSucceeded": null,
  "lastConfirmedSnapshotPreserved": null
}
~~~

Include full tracking, learner/scope/framing fields, completion, route, counters, versions, exposure, trig, selected/active/recent records, anchored checks and every retained field. Account for aliases by deduplication. Test ASCII, high-entropy prose, CJK, combining marks, emoji, quotes, backslashes, newlines and escaping. Use both valid UI-reachable histories and adversarial decoder-admitted fixtures, labelled separately. A decoder-only witness is not proof that a learner normally reaches it.

Exercise fifth-and-later attempts, changing reasons, pin/unpin/replacement, prior long notes moving between tiers, exhausted generators, resumed snapshots and migration overhead. A tiered-length policy cannot shorten previously selected work when unpinned. Saturate bounded counters and variable metadata lengths. Record a deterministic upper-bound argument where possible; a few favorable compressible examples do not prove worst-case fit.

Candidate policies to compare: current short-note/two-recent allocation; more room for reasoning with measured recent-detail capacity; the plan's six-recent candidate. Add another option only if evidence supports it. Do not set an arbitrary confidence percentage from their measured sizes.

Protected work, active unfinished drafts, first evidence, required checkpoints and support markers must not be truncated or silently evicted. Older ordinary detail may roll into disclosed summaries. Overflow preserves the last valid LMS record and current accessible work, signals unsynced state, and offers continuation/recovery. It must not require a normal download/reset cycle to keep learning.

## 5. Bind feedback to the exact response and repair bounded math edges

### 5A. Current draft versus historical result

Files: course.js syncInputs(), submitTask(), showFeedback(), input handler and report renderers.

Reproducer: correctly submit (x+3)(x-4) for x²−x−12, edit it to (x+99)(x-4) without checking, navigate away and back. The old candidate displays “Correct in requested form” beside the unchecked wrong draft.

On every edit invalidate the current draft's displayed verdict. Retain historical attempts unchanged. On navigation/reload, show a current result only when it is bound to the identical raw response, same frozen problem and relevant result provenance. Otherwise show “Current draft has not been checked.” Display historical feedback separately with its original response. Never calculate old feedback from the current input element or silently regrade old history. Ensure assistive announcements also describe the correct response. Input/notation repair must preserve literal text and avoid a conceptual-error attempt.

### 5B. Keep equivalence and requested form separate

Files: algebra.js parts()/factorForm(), contracts.js validation and split handling.

Add a bounded presentation-normalization view for harmless numeric-zero wrappers, powers of one, groups and signs. Preserve raw input and raw AST. Remove only the explicitly supported neutral wrapper; do not run arbitrary cancellation or factor a student's binomial for them.

Required expectations for x²+7x+12:

| Input | Expected |
|---|---|
| 0+((x+3)(x+4))^1 | Correct requested factoring form |
| (x+3)(x+4)-0 | Correct requested factoring form |
| (3+x)(4+x) | Correct |
| (-x-3)(-x-4) | Correct |
| x²+7x+12 | Equivalent; unfinished factoring |
| (x+2)(x+6) | Incorrect; middle coefficient is 8, so provide a bounded sum cue |
| Unmatched parenthesis | Entry repair; retain raw text; no mathematical diagnosis |

For the explicit whole-integer-GCF task, (2x+4)(x+3) stays equivalent but incomplete. Do not normalize away the pedagogical requirement to extract 2.

In the M09 split-middle contract, preserve and consume literal x^2+3x+4x+12. Recognize x^2+0x+7x+12 as equivalent but an unhelpful split: its middle pair has sum 7 and product 0, not 12. Inspect the unsimplified term structure so the zero term is not lost. Final factoring treats expanded/split form as unfinished. Unsupported alternative steps remain ungraded and retained, with a supported final-answer route.

### 5C. Enforce the chosen profile throughout evaluation

For core-quadratic-v1, validate intermediate subtree polynomial degree, not only the fully cancelled result. Thus (x+3+x*x*x-x*x*x)(x+4) is outside the core language even though it simplifies correctly. Classify unsupported syntax separately from wrong mathematics. Do not reduce the whole unit's broader degree-six profile to degree two.

Keep raw-length, node, depth, exponent, variable and integer-magnitude bounds; never evaluate expressions as JavaScript. Add exact boundary tests and malformed inputs. Use an independent expected-value oracle for new math tests, not the same checker twice.

### 5D. Validate generator arguments and exhaustion

Validate family, seed, count and avoidance inputs. Count must be a nonnegative safe integer within the documented finite family bound; count 0 returns an empty result, negative/fractional/NaN/infinite/oversized counts reject explicitly. Keep seeded reproducibility, reviewed ranges and frozen parameters. Exhaustion produces a labelled outcome without deleting work or inventing duplicates.

## 6. Finish the instructional gaps with authored tasks

Files: canonical index.html, unit-data.js, narrowly required contracts; migration from Step 2 first.

### 6A. Add an actual faded example in lesson 3.5

Preserve the existing complete worked examples. Add a clearly staged path with optional support and a direct independent route:

1. Partially worked x²+9x+20: show the sum/product requirements and a partial factor-pair organization; ask the learner to complete the pair 4 and 5 and connect it to the middle terms. Do not print the answer in the input's placeholder/accessible name.
2. Reduced support x²+10x+21: ask for the two numbers and a factorization with less scaffolding; expected pair 3 and 7. Put extra structure behind an optional hint.
3. A genuinely fresh independent instance from the reviewed pool, excluding all mathematically exposed examples and equivalent signatures.

The values above are proposed authored content with transparent arithmetic, not a claim that these activities already exist or have been learner-tested. Independently verify wording, answers, wrong-answer cues and accessibility during implementation. Keep routine explanation/hint wording in canonical HTML. Generated questions may reference it but not overwrite teacher edits.

Mark worked, faded and revealed targets as mathematically exposed, with sticky signature-based support/exposure tracking. A new seed or a rearranged version of the same polynomial is not fresh evidence. Preserve two substantive error analyses and two explanation/transfer opportunities; do not grade free-text reasoning from correct answer slots.

### 6B. Make the later mixed check truly mixed and fresh

Build six-question sets by stratified category selection: at least one expansion, one factoring and one error-interpretation item, then three appropriately balanced reviewed items. Select from eligible unseen/unexposed mathematical signatures, without duplicates.

Ensure enough reviewed error items exist for more than the initial two error-analysis tasks. Prefer a small authored catalog with independently checked first-wrong-step explanations over an unreviewed arbitrary error generator. Declare immutable IDs/content versions and exposure signatures. If a required category is exhausted, explain that no fully fresh mixed set remains, preserve current work, and offer ordinary supported practice or teacher review. Do not silently return a factoring-only set under a mixed label.

### 6C. Elicit root estimation

Lesson 3.2 explains root estimation, but its reviewed questions chiefly use perfect roots. Add at least two explicit estimation tasks, for example integer brackets 7 < √58 < 8 and 4 < ∛100 < 5, with the corresponding perfect-square/cube reasoning visible after the attempt.

Use a named, bounded contract for structured lower/upper integer inputs; do not pretend the current algebra parser already supports arbitrary decimal estimation syntax. Store both raw fields and their result provenance, accept clear equivalent entry where specified, and keep notation errors distinct. Use stable new IDs and update the versioned catalog/migration. Do not add a compulsory ninth completion target.

### 6D. Complete the trig distinctions and support chronology

Files: course.js retainTrig()/trig handlers; contracts.js; canonical text/diagram alternatives; state schema.

Take the support snapshot BEFORE evaluating a retained submission. Store setup evidence, numeric value outcome, unit/precision/domain outcome and the support-before-attempt explicitly; only then update sticky support from feedback/reveals for the next attempt.

~~~js
const supportBefore = supportForThisInstance();
const setupResult = checkSetup(selectedRelationship);
const valueResult = checkNumericEntry(rawValue);
retainAttempt({ rawValue, selectedRelationship, setupResult,
                valueResult, supportBefore, checkerVersion });
applySupportFromFeedback(setupResult, valueResult);
~~~

Decide retention for setup-only actions explicitly: a wrong ratio plus an empty numeric field can be setup evidence, but must not become a phantom incorrect numeric submission. Input repair does not consume a mathematical attempt. Keep support tied to the appropriate frozen trig instance; explain any support shared intentionally across tasks.

Add separate learner identification of opposite, adjacent and hypotenuse under rotation. Text alternatives must provide givens/reference/right angles without revealing the identity currently being assessed. Keep setup, value, unit and precision judgments separate, including 0.464 radians versus a degrees request and impossible acute angles/negative lengths. The first wrong-length attempt must retain the pre-feedback support mask; later attempts retain the updated mask.

## 7. Repair keyboard navigation and resolve the input-enhancement obligation

Files: course.js, styles.css, input-enhancement.js; local assets only if the bounded MathLive spike is implemented.

The hidden narrow-screen sidebar is currently translated offscreen but remains in Tab order. Consolidate all menu paths into one state owner rather than patching individual clicks.

~~~js
function setMenuState(open, { returnFocus = false } = {}) {
  const mobile = mobileMedia.matches;
  const expanded = mobile && open;
  sidebar.inert = mobile && !expanded;
  main.inert = expanded;
  menuButton.setAttribute('aria-expanded', String(expanded));
  document.body.classList.toggle('nav-open', expanded);
  // Apply deliberate open/close/route/resize focus rules here.
}
~~~

Handle initial render, open, scrim, Escape, route selection and matchMedia change. Opening focuses the first meaningful item and traps focus in the visible menu; closing restores focus appropriately. On desktop release both mobile inert states. On a desktop-to-mobile change, move focus out of a sidebar that is becoming inert. Avoid aria-hiding a focused node and avoid competing focus traps with dialogs/reference panels.

Test closed-menu Tab traversal, open traversal, Shift+Tab wrap, Escape, route selection, resize, visible focus and return to the original task. Verify actual window.innerWidth/documentElement.clientWidth at the intended 320 CSS pixels. A requested viewport dimension is not proof if the browser reports another size.

Native entry must remain complete and usable. The master plan's local pinned MathLive compatibility spike is currently incomplete. Conduct a bounded spike if source/assets and licensing permit: record exact version, integrity and license, local fonts, iframe-local keyboard, draft-preserving native/enhanced switching, safe translation into the same bounded checker, no CDN/Compute Engine/remote AI requirement, and no global CSP weakening. Read actual dependency documentation before implementing unfamiliar APIs.

A failed or unavailable spike remains an explicit unmet obligation; do not silently mark it passed because native input works. A later owner-approved native-only release scope would need to be recorded. Browser automation and semantic checks do not substitute for VoiceOver/Safari, NVDA/Chrome and actual target mobile keyboard use.

## 8. Finish retention summaries, reports and honest learner labels

Files: state.js, course.js, index.html, policy metadata.

Use one policy source for field capacities, validation and displayed limits after the Step 4 decision. Meanwhile correct the misleading lesson-reason label claiming 360 where actual accepted length is 160; do not enlarge the field without storage evidence. Preserve all existing accepted text.

Implement bounded per-skill summary counts with documented support distinctions, stable skill IDs and idempotent revision-aware rollups. The current global attempts/correct/supported totals do not satisfy the per-skill proposal. Do not double-count on repeated compaction, reload or migration. Do not invent historical per-skill detail where the prior aggregate cannot reconstruct it: label legacy unknowns.

Preserve first plus latest three retained mathematical submissions and a total count; four retained rows is not a four-attempt limit. Deduplicate records referenced by active/recent/selected tiers. Never automatically replace selected evidence. Explicit selection replacement must preview the consequence and preserve protected or otherwise still-referenced work according to the chosen policy. Full selected slots must not block ordinary practice.

The learner-previewed report must distinguish original problem/givens, first response, correction, current unchecked draft, exact retained history window, original result version, support before each submission, reasoning text and review status. Report “without in-course mathematical support,” not “independently completed” as a claim about external help. Free-text reasoning remains teacher review evidence.

Copy/download/print must say “not submitted.” Never fabricate assignment/help URLs or claim a button opening a link submits work. Keep teacher route configuration separate from code and record missing route decisions. Produce actual print/PDF output and inspect core teaching plus reports for clipping, lost equations, hidden content and page breaks; window.print invocation alone is not a print-layout test.

## 9. Run focused repairs first; integrate and validate at the right gates

### Gate A — repaired source review candidate (ChatGPT)

Immediately run targeted parser, save/trust, migration and retention regression tests because these changes can misjudge mathematics or lose learner work. Inspect changed teaching and menu areas. Reassemble standalone HTML from canonical source and verify that its embedded source corresponds exactly to the edited files. Do not run broad repository/LMS suites after every content edit.

Use the supplied REPAIR_ACCEPTANCE_MATRIX.json as the minimum repair ledger. All cases begin not_run for the new candidate. Fill actual command, environment, assertion/result and evidence path; never prefill passed from this specification. Keep MATH-01–MATH-26 traceability from the governing register, including deferred and rejected scope, not just the new defects.

A source candidate can be ready for independent re-audit while repository, tenant and human gates remain unverified. If a material code repair remains incomplete, identify the failing gate and exact residual behavior. Do not call a partial source candidate complete.

### Gate B — repository integration and Studio proof (Codex, separately executed)

Before installation read the current AGENTS.md, FAST_PATHS, active handoff and owning workflow; inspect a clean/dirty status and actual HEAD. Preserve unrelated work. Use the candidate installer's read-only preflight first. Its existing --apply overlay is not a fully transactional restore mechanism, and refusing existing paths does not make all partial failures reversible. Inspect and improve/contain that integration path before use; never rerun over a partial project blindly.

Creation must use the checked-in course:create workflow. The intended slug is math10c-unit3-pilot. The candidate installer already calls that workflow and then establishes the declared Math behavior owner. Keep release/exports blocked until the relevant contracts are proved. Do not enable Studio by adding only a boolean or calling a generated boundary Direct without supported ownership.

Apply shared bridge/codec patches only to the verified canonical repository source. Update affected tests and API documentation. Do not replace the shared bridge with a course-local LMS owner or alter other courses' HTML. Preserve legacy bridge callers and opted-in automatic Social behavior.

Existing focused command, after repository integration:

~~~sh
npx tsx --test scripts/tests/scorm-state-codec.test.ts scripts/tests/scorm-export.test.ts
~~~

Add a focused emitted-bridge/browser integration test if the existing harness cannot expose real DOM destruction, receipts or concurrency. Name and record that command in the returned handoff. Do not assume FakeElement.textContent models child deletion: use a browser or faithful DOM for that assertion.

At the authorized rollout checkpoint freeze the candidate and run one planned batch, with failed/affected reruns only:

~~~sh
npm run course:doctor -- --project math10c-unit3-pilot
npm run verify -- --project math10c-unit3-pilot --mode workspace
npm run report:course-editability -- --project math10c-unit3-pilot
npm run test:new-course-readiness
npm run test:e2e:project -- --project math10c-unit3-pilot
~~~

Create a real project e2e-contract with stable targets before invoking its runner. Include the Math repair cases and critical learner flows. Existing push/PR CI remains authoritative. Use verify:new-course-readiness with the real comparison base and actual committed head when that stage is authorized; do not invent a SHA or claim exact-head evidence for later edits.

Studio proof has TWO distinct checks:

1. Supported Edit map → draft → apply → reload → Undo, with no intervening external file mutation. Verify exact restoration.
2. Apply a separate canonical hint/feedback edit → behavior-only rebuild → reload and verify the edit survives. External rebuild may invalidate Undo, so restore through a supported fresh edit/provenance workflow; do not reuse a stale Undo batch.

Also prove that withdrawing a faulty generated family preserves old work and offers a reviewed alternative without awarding completion. Confirm mathematical content/checker changes invalidate affected evidence. Keep runtime-generated practice explicitly Annotation only and routine teaching editable.

### Gate C — actual package and Brightspace (after separate packaging/tenant authorization)

Generate the SCORM 2004 artifact through the owning exporter, inspect the actual package and record its hash. Use the school tenant and legitimate student/teacher test roles. Verify launch, autosave, interruption, close/resume, device change, new attempt, attempt replacement, learner separation, save failures, actual capacity boundary and teacher-visible evidence. Check the real assignment/help handoff on target devices. A simulated API or successful ZIP build cannot pass this gate.

### Gate D — independent re-audit and controlled learner observation

Codex independently rechecks the repaired candidate against the frozen governing requirements and regression evidence, preferably inspecting the repaired artifact before relying on builder summaries. No re-audit is implied by this brief. After technical readiness, separately authorize a small controlled trial spanning prepared learners, prerequisite repair, notation difficulty, alternative methods, hint-heavy use and target accessibility needs. Teacher review and observed usability/learning outcomes remain distinct from code correctness.

## 10. Return these deliverables and a calibrated confidence report

Return one review ZIP with:

1. Repaired canonical workspace source plus regenerated standalone preview, clearly marked review-only.
2. A unified shared-repository patch against the baseline source, with base file hashes, changed tests and integration notes. If applied in an actual checkout, also provide the actual diff and head; otherwise label unapplied.
3. Executable repair regression tests, unchanged original fixtures, versioned catalog and saved-state migration fixtures, including formerly failing examples.
4. Actual capacity measurements, assumptions/headroom and recommended policy awaiting any still-required owner decision.
5. Requirement evidence matrix: requirement → source/function → executable case or manual procedure → actual result → remaining limitation. Preserve the 26 master requirements and all repair cases.
6. Build report and handoff: summary, files changed, verification run, risks/follow-up, source of truth, fragile areas, next-step assumptions, exact next action and exact next file. Include checks deferred to rollout.
7. Package manifest with SHA-256 per deliverable, dependency/version provenance and source-to-standalone correspondence. Hash assertions must be independently recomputed, not copied from this request.

In the confidence report distinguish:

| Area | What can support a strong conclusion | What must remain limited |
|---|---|---|
| Master-plan fidelity | Traceable implemented requirements and reviewed teaching | Owner/curriculum acceptance still pending where applicable |
| Mathematical correctness | Independent exact oracles and explicit bounded syntax cases | No universal symbolic-correctness claim |
| Saving and recovery | Actual emitted bridge, failure/interleaving/migration tests | Actual tenant/device/attempt semantics until tested |
| Teacher ownership | Actual Studio lifecycle and rebuild-survival proof | Source inspection alone is insufficient |
| Accessibility | Semantic/keyboard checks plus actual AT/device use | Automation alone does not prove acceptance |
| Learning effectiveness | Teacher review and controlled observations | Working code and attractive styling do not prove outcomes |

Use verified / partially verified / failed / unverified / intentionally deferred with evidence and residual risks. Avoid a fabricated “99%” or “100%” confidence score. A single unresolved lost-work, false-save, valid-answer rejection or inaccessible essential-flow defect blocks the affected release, even when many other tests pass.

Finish by naming the next gate, the exact artifact needed for it and who can execute it. Do not claim that model agreement, a large test count or this planning document completes production acceptance.

## Operator note

This bundle was assembled as a planning artifact outside canvas-helper. It did not modify the candidate, repository, online ChatGPT project, Git branch, course status or deployed content. Existing audit results above describe the previously inspected candidate; every test for a future repaired candidate must be rerun and recorded against its own hash.
