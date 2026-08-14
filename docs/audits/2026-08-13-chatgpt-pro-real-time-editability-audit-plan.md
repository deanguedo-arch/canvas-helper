# ChatGPT Pro audit plan — Studio real-time editability

- Prepared: August 13, 2026
- Audience: independent ChatGPT Pro reviewer with GitHub access; terminal access is preferred
- Repository: [`deanguedo-arch/canvas-helper`](https://github.com/deanguedo-arch/canvas-helper)
- Accepted Direct Editing baseline: `e71241433e173c7617dbf5ea5e5ddcc5bf712c11`
- Post-audit planning baseline: `392298937102be216d4d3fc24da1c322ce280a36`
- First plan-audit head: `a5645d2ef8e40487b6afa7c9d4a95fadd8dc233a`
- First plan-audit verdict: **REQUEST CHANGES**
- Current implementation status: **Phase 0.5 contract amendment prepared for independent audit; real-time preview and element-level census are not implemented**
- Product plan: [`../plans/2026-08-13-studio-real-time-editability-and-rollout.md`](../plans/2026-08-13-studio-real-time-editability-and-rollout.md)
- Phase 0.5 contract amendment: [`../plans/2026-08-14-studio-real-time-editability-phase-0-5-contracts.md`](../plans/2026-08-14-studio-real-time-editability-phase-0-5-contracts.md)

## Audit purpose

Independently determine whether Canvas Studio can make ordinary teacher-owned course content feel immediately editable without weakening the source-ownership, transaction, rebuild, learner-render, export-freshness, recovery, or Undo guarantees already accepted for Direct Editing.

This audit must answer six separate questions:

1. Does the Phase 0.5 specification define learner surfaces, candidates, scoring, read-only execution, preview authority, and reset behavior precisely enough to implement without inventing safety-critical semantics?
2. Does the coverage census measure element-level editability honestly and without changing a course?
3. Does live preview update only an inert host presentation while typing, with no filesystem, learner-DOM, or learner-state mutation?
4. Does Save draft and Apply use one server-canonical patch and retain the protected server-authorized write path?
5. Do newly created Codex courses actually meet the declared routine-content coverage target?
6. Are legacy improvements based on proven canonical ownership rather than flags, DOM tricks, or unsafe builders?

The audit is not complete if it answers only whether one edit works per course. Course-level lifecycle success and element-level coverage are different measurements.

## Truth baseline the auditor must preserve

| Statement | Current status | What would prove more |
| --- | --- | --- |
| The accepted Direct Editing safety baseline has no known release-blocking P0 from the previous audit. | Independently rated **GREEN / GO** at `e7124143`. | Re-run exact-head gates if implementation code changes the accepted boundary. |
| Fifty of 63 enabled projects completed at least one reversible learner-render edit. | Proven by catalog acceptance. | This does **not** establish a per-page or per-element percentage. |
| Twelve projects reported no routine source-owned text target and one reported no learner-stable sampled target. | Proven course-level outcomes. | The census must explain their visible candidate elements and ownership reasons page by page. |
| New Codex courses are 90–95% editable. | **Not proven.** | A fresh-course exact-head census must establish the result. The committed product target is at least 90%, not a guaranteed 95%. |
| Legacy courses are 79% editable. | **False if stated as element coverage.** | `50 / 63` is a project lifecycle ratio, not editable DOM coverage. |
| Changes appear immediately while typing. | **Not implemented at the planning baseline.** | Phase 2 code, browser tests, and direct observation must prove ephemeral preview. |
| `npm run report:course-editability -- --all` works. | **Not implemented at the planning baseline.** | Confirm the package script and backing entrypoints exist before running it. |
| The original roadmap was implementation-ready. | **Rejected by the first plan audit.** | The Phase 0.5 contract amendment must receive its own independent verdict before Phase 1 code begins. |

Any review that repeats “90–95%” or “79% editable” without new element-level evidence should return **REQUEST CHANGES** for claim accuracy even if the underlying code is safe.

## Audit timing and review units

Do not wait for the entire roadmap to land in one large diff. Audit six bounded checkpoints:

0. **Specification checkpoint:** learner-surface inventory, candidate/scoring model, read-only isolation, preview normalization, session ordering, non-mutating renderer, image lifecycle, and quantitative rollout gates.
1. **Census checkpoint:** read-only denominator, classification, report schema, and all-surface evidence.
2. **Preview checkpoint:** ephemeral preview bridge, host overlay, UI state, reset behavior, and patch parity.
3. **New-course checkpoint:** Studio-ready creation contract and measured threshold on a freshly generated course.
4. **Legacy checkpoint:** reason-ranked, source-owned migrations in small course-family batches.
5. **Teacher-rollout checkpoint:** observed usability and operational-safety evidence.

Prefer a focused PR per checkpoint. If multiple phases share one PR, the auditor must still report an independent verdict for each checkpoint and identify the exact commit range reviewed.

PR #1 is the accepted Direct Editing and onboarding baseline. It should not be described as implementing real-time preview unless later code actually adds that behavior.

## Evidence hierarchy

Use evidence in this order:

1. exact-head implementation code and manifest/source ownership;
2. focused tests that cross the real server/browser boundary;
3. deterministic reports tied to the exact commit SHA;
4. real-course public-route pilots with learner-render and exact-restoration evidence;
5. GitHub Actions logs and uploaded JSON artifacts;
6. documentation and screenshots.

Documentation, a package-script name, a green test that mocks the critical boundary, or a successful static-file write is not sufficient proof.

When terminal access is unavailable, the reviewer must say which commands were not independently run and use exact-head GitHub Actions artifacts instead. Missing execution evidence must not be silently converted into a confirmed claim.

## Verdict and severity model

Return one overall verdict and one verdict per completed checkpoint:

- **GREEN / GO:** the checkpoint meets its exit gate with no P0/P1 finding.
- **GO WITH CONDITIONS:** no corruption or authorization defect, but bounded rollout evidence remains incomplete.
- **REQUEST CHANGES:** a P1 or multiple material P2 findings make the product claim inaccurate or rollout unsafe.
- **NO-GO:** a P0 creates a credible path to corruption, unauthorized writes, silent learner divergence, or unrecoverable state.
- **NOT AUDITABLE YET:** the claimed feature is not implemented or exact-head evidence is absent.

Severity definitions:

- **P0:** silent source corruption, cross-project/path escape, unknown-byte overwrite, unsafe Undo, script/CSS injection, write authorization derived from browser DOM, or persistent learner-state mutation during preview.
- **P1:** dishonest coverage, preview/Apply semantic mismatch, stale-target retargeting, generated-output-as-source, incomplete reset, unsafe builder use, or a claimed 90% threshold without reproducible evidence.
- **P2:** teacher confusion, accessibility regression, incomplete reason labels, non-critical report instability, or an important workflow with a clear safe fallback.
- **P3:** documentation, naming, or maintainability issue that does not misstate safety or coverage.

## Required source reading order

Read these before expanding into broader repository searches:

1. [`../ops/ACTIVE_HANDOFF.md`](../ops/ACTIVE_HANDOFF.md)
2. [`../plans/2026-08-13-studio-real-time-editability-and-rollout.md`](../plans/2026-08-13-studio-real-time-editability-and-rollout.md)
3. [`../plans/2026-08-14-studio-real-time-editability-phase-0-5-contracts.md`](../plans/2026-08-14-studio-real-time-editability-phase-0-5-contracts.md)
4. [`2026-08-13-studio-direct-editing-green-go-verdict.md`](2026-08-13-studio-direct-editing-green-go-verdict.md)
5. [`2026-08-13-chatgpt-studio-course-editing-audit-brief.md`](2026-08-13-chatgpt-studio-course-editing-audit-brief.md)
6. [`../../scripts/lib/projects.ts`](../../scripts/lib/projects.ts)
7. [`../../app/shared/course-editing.ts`](../../app/shared/course-editing.ts)
8. [`../../app/server/lib/preview-inspection.ts`](../../app/server/lib/preview-inspection.ts)
9. [`../../app/shared/preview-bridge.ts`](../../app/shared/preview-bridge.ts)
10. [`../../app/server/preview-bridge-runtime.ts`](../../app/server/preview-bridge-runtime.ts)
11. [`../../app/studio/src/hooks/useCourseEditing.ts`](../../app/studio/src/hooks/useCourseEditing.ts)
12. [`../../app/studio/src/components/CourseEditPanel.tsx`](../../app/studio/src/components/CourseEditPanel.tsx)
13. [`../../app/server/lib/course-editing.ts`](../../app/server/lib/course-editing.ts)
14. [`../../app/server/lib/course-edit-image.ts`](../../app/server/lib/course-edit-image.ts)
15. [`../../app/server/routes/course-edits.ts`](../../app/server/routes/course-edits.ts)
16. [`../../app/server/lib/course-edit-transaction.ts`](../../app/server/lib/course-edit-transaction.ts)
17. [`../../app/server/lib/course-edit-render-validation.ts`](../../app/server/lib/course-edit-render-validation.ts)
18. [`../../scripts/lib/codex-course.ts`](../../scripts/lib/codex-course.ts)
19. [`../workflows/codex-studio-course.md`](../workflows/codex-studio-course.md)

For English, Social, snapshot, export, or onboarding claims, follow the owning adapter from the shared course-editing identity rather than assuming all projects use Direct workspace writes.

## Step 0 — pin the review target and establish provenance

Before evaluating a claim, record:

```bash
git rev-parse HEAD
git branch --show-current
git status --short
git merge-base HEAD origin/codex/studio-roadmap-phases
git log --oneline --decorate -20
```

Then record:

- exact head SHA;
- base SHA and diff range;
- whether the worktree is clean;
- whether Git LFS/course assets were fetched;
- PR number and draft/merge status;
- exact GitHub Actions run IDs used as evidence;
- any local-only files excluded from the review.

Audit from a disposable clean checkout when possible. The main developer worktree contains intentionally preserved untracked course resources and duplicate/conflict files that are not PR evidence.

Stop and return **NOT AUDITABLE YET** if the reviewer cannot identify the exact implementation SHA or if the supplied CI artifact belongs to a different SHA.

## Step 1 — establish the accepted safety baseline

Before attributing a regression to real-time work, verify that the implementation is based on the accepted Direct Editing boundary:

- browser messages carry opaque target identity and bounded patches, never a filesystem path or arbitrary selector;
- the edit map remains informational and cannot authorize a write;
- Direct, English, Social, and snapshot adapters retain distinct source/materialization behavior;
- Apply still performs lock, preflight, transaction, rebuild when applicable, learner-render validation, export-stale recording, and Undo checkpointing;
- Undo still refuses after any checkpointed boundary drift;
- crash recovery preserves unknown external bytes for manual recovery;
- repeated ambiguous content remains Annotation only without durable identity;
- image decode/dimension limits and request-body limits remain enforced;
- export freshness remains tied to target inputs and artifact bytes.

Run or inspect exact-head evidence for:

```bash
npm run test:course-editing
npm run test:studio-inspection
npm run verify:course-editing-pilots
npm run verify:course-onboarding -- --all
npm run test:studio-release
```

If real-time work changes none of these boundaries, regression checks are still required because bridge and UI changes can accidentally bypass them.

## Checkpoint 0.5 — measurement and preview-authority specification

### Why this checkpoint exists

The first independent plan audit returned **REQUEST CHANGES**. It found that the roadmap's principles were sound but that implementing Phase 1 or Phase 2 literally could still produce a flattering partial census or an immediate-looking preview with unsafe or divergent semantics.

The plan audit identified eight P1 design gaps:

1. no authoritative definition of every learner page, route, and required state;
2. no rendered collector for runtime-created content;
3. no non-gameable primary candidate unit;
4. an incomplete read-only execution boundary;
5. learner-node snapshot/restore that could not preserve JavaScript object identity or runtime state;
6. no canonical preview/Apply normalization path;
7. no zero-write, cross-origin image-preview architecture;
8. no preview session/revision ordering model.

It also required stable reason codes, null scores for truncation, quantitative teacher-rollout gates, and a complete Studio interaction/reset matrix.

The proposed resolution is [`../plans/2026-08-14-studio-real-time-editability-phase-0-5-contracts.md`](../plans/2026-08-14-studio-real-time-editability-phase-0-5-contracts.md). This checkpoint audits that specification only. It must not be reported as evidence that the census or preview is implemented.

### Required disposition matrix

Return an explicit disposition for every row.

| Original finding | Required contract outcome |
| --- | --- |
| Learner-page inventory | Exhaustive adapter-owned `LearnerSurfaceInventory`; physical HTML fallback scan cannot mark inventory complete; missing route/state declarations produce a null score. |
| Runtime-only content | Independent source and rendered collectors; runtime semantic units remain in the denominator; every editable candidate passes actual read-only Resolve parity. |
| Candidate gaming | Non-overlapping primary blocks; every text node has at most one owner; capability opportunities are separate; block, text-code-unit, and per-category floors all apply. |
| Read-only boundary | A mutation-prohibited project reader; no auto-import/repair/build/materialization; isolated fresh Chromium; blocked network/service workers; instrumented storage; deterministic environment; hard limits and residue proof. |
| Runtime-state safety | V1 host-owned inert overlay outside the learner document; no generic `innerHTML`, attribute, or subtree mutation; clear removes presentation rather than reconstructing learner objects. |
| Preview/Apply parity | One server canonicalizer used by Normalize Preview and Apply; server re-resolves; canonical patch and digest; raw teacher input never reaches the renderer. |
| Ephemeral images | Full decode and bounded memory-only bytes; capability URL on preview origin; session/source binding; Apply-owned transactional persistence; preview URL never becomes source. |
| Message ordering | Preview session ID, monotonic revision, project/page/source/target/digest binding, echoed ACK, permanent generation close, and defined Save/Apply/rejection states. |
| Stable explanations | Versioned machine reason codes independent of teacher-facing wording. |
| Truncation | Internal streaming/pagination; any hard-limit truncation produces `incomplete` and `percentage: null`. |
| Teacher rollout | Distinct-teacher and experience mix, task matrix, latency percentiles, completion/rejection/mismatch/confusion/handoff metrics, and P0/P1 stop conditions. |
| Studio interactions | Explicit outcomes for Focus/Split, Original/Current, viewport, zoom, Full Preview, navigation, Annotation, screenshot, Review Set, history, reload, disconnect, drift, and multi-draft Apply. |

### Specification red-team questions

The reviewer must challenge at least these cases:

- one physical `index.html` with twenty SPA/hash/state learner surfaces;
- a missing manifest declaration combined with a successful bounded HTML scan;
- runtime-created headings and cards with no injected source node ID;
- a paragraph containing one or more links, nested list items, heading links, image alt/title, table cells, and duplicated mobile/desktop presentation;
- a course with zero candidates, more than 4,000 map entries, or more candidates than the census hard ceiling;
- a missing project recoverable from `projects/processed` that would currently trigger `ensureProjectFromProcessedSnapshot` through a standard loader;
- learner code that writes localStorage, sessionStorage, IndexedDB, cookies, Cache Storage, or registers a service worker;
- a framework component whose descendant listeners and references would be destroyed by `innerHTML` replacement;
- unsafe rich text or URL input that passes structural `isCourseEditPatch` validation but is transformed by the current server `sanitizeDraft` path;
- revision 5 arriving after revision 6, a late Clear for target A after selecting target B, and a stale normalization response after source drift;
- an uploaded image selected, canceled, reselected, saved as a draft, applied after token expiry, and applied after server restart;
- an unapplied preview during screenshot capture, Review Set save/copy, Full Preview opening, browser back, or a multi-draft Apply rejection.

### Checkpoint 0.5 exit gate

Return GREEN only if:

- all original P1 findings have a concrete, non-circular contract;
- the proposed types have deterministic identity and completeness rules;
- the counting and scoring model cannot silently omit runtime content, double-count nested content, treat no candidates as 100%, or score partial/truncated evidence;
- the read-only architecture is incapable of auto-importing or repairing projects and fails visibly on browser-state mutation;
- preview cannot mutate the learner subtree by construction;
- preview and Apply share server canonicalization while Apply retains final authority;
- the image lifecycle can remain memory-only until protected Apply without saving the ephemeral URL;
- ordering, reset, capture, Review Set, and Apply states are unambiguous;
- the specification identifies exact later implementation slices and evidence gates.

Return **REQUEST CHANGES** if any P1 term still depends on an implementer inventing a safety-critical meaning. Return **NOT AUDITABLE YET** for product behavior, even when the specification itself is GREEN.

## Checkpoint 1 — element-level editability census

### Claims to audit

The census must prove all of the following against the approved Phase 0.5 schemas:

1. Every adapter-declared learner page, route, and required state receives a deterministic outcome or makes its inventory incomplete.
2. Every rendered routine teacher-content occurrence becomes a primary candidate, proven duplicate, stable exclusion, or incomplete-surface error.
3. Runtime-created content remains visible even when it has no source node ID.
4. Coverage is computed from non-overlapping block counts and teacher-text code units, not course counts or an average of page percentages.
5. Every candidate counted editable passes the actual production Resolve logic in read-only mode.
6. Running the report changes no course, project metadata, browser storage, draft, lock, checkpoint, export, or generated workspace.
7. The full report is tied to adapter, canonical owner, surface identity, source/render fingerprints, reason registry, exact commit SHA, and canonical report digest.

### Denominator audit

The planned primary-block denominator includes routine teacher-owned:

- headings;
- paragraphs and list items;
- link and content-button labels;
- images and captions;
- table headers and cells;
- card/callout titles and descriptions;
- synchronized course-name surfaces.

Link destinations, image source/alt/title, curated styles, and Rename synchronization are capability opportunities reported separately from the primary block score.

It must separately classify rather than count:

- hidden/script/style/template/metadata nodes;
- layout wrappers without their own content;
- Studio chrome;
- quizzes, simulations, media players, and behavior-rich components requiring dedicated editors;
- duplicated accessible text produced only for presentation when it proves the same canonical owner.

Runtime-created routine content is not excluded. It remains a primary candidate and is normally Annotation only until it has safe canonical ownership.

The auditor must challenge denominator gaming:

- nested elements must not double-count the same teacher-authored text;
- a paragraph that owns a nested link label must not also count that label as a second block;
- one image must not become separate block candidates for source, alt, and title;
- wrappers must not inflate candidate or editable counts;
- omitted semantic elements must appear in an unsupported/error reason rather than vanish;
- zero-candidate surfaces must not be reported as 100% editable;
- project totals must use `sum(editable) / sum(candidates)`, not the mean of page percentages;
- truncated or incomplete inspection must use a null percentage;
- runtime content must not disappear from the report merely because it lacks source ownership.

Independently sample rendered semantic elements on representative pages and reconcile them against the generated candidate list. Do not rely only on the collector testing itself.

### Required report fields

At minimum, verify:

- schema version and exact commit SHA;
- project, driver, adapter, canonical owner, learner-surface identity, route, and state key;
- inventory completeness and stable inventory error code;
- primary candidate, editable, and Annotation-only counts by candidate kind;
- teacher-text code-unit numerator and denominator;
- capability-opportunity supported/total counts for rich text, link, image source, alt, title, curated styles, and Rename synchronization;
- stable reason-code histogram for every unsupported candidate;
- live-map/source-fingerprint match counts;
- rendered semantic occurrence, proven duplicate, exclusion, and unresolved counts;
- actual Resolve attempted/eligible counts;
- ambiguous repeated-identity rejection count;
- truncated/uninspectable/incomplete/error state with null-percentage enforcement;
- course-level pilot outcome shown separately from element coverage;
- deterministic aggregate totals without embedded course content;
- browser isolation profile, resource limits, read-only residue proof, canonical serialization version, and report digest.

### Read-only adversarial proof

In a clean disposable checkout:

1. prove the census uses a mutation-prohibited reader and cannot call auto-import, repair, builder, recovery, materialization, or asset paths;
2. fingerprint tracked files plus project workspace/meta/resource/export and Studio lock/checkpoint/draft boundaries;
3. run every surface in a fresh non-persistent browser context with service workers and external network blocked, storage writes instrumented, and the deterministic Phase 0.5 environment;
4. treat any project-repair or persistent browser-storage write attempt as an incomplete surface and failing acceptance run;
5. run the coverage command and prove only the declared ignored `.runtime` report was created or changed;
6. compare tracked Git status, relevant file hashes, lock/checkpoint directories, exports, generated factory workspaces, and browser residue afterward;
7. run twice and compare canonical report bytes and digest.

The proposed command must be treated as nonexistent until both the package script and its backing entrypoints land:

```bash
npm pkg get scripts.report:course-editability
npm run report:course-editability -- --all
```

### Representative census samples

Include at least:

- one Direct multi-page course;
- one Direct SPA/hash/query course with more than one declared runtime route/state;
- one English factory course;
- one Social factory course;
- one preserved snapshot course;
- one runtime-heavy no-source-owned-target course;
- Aboriginal Studies 30 or the current no-learner-stable-target equivalent;
- one page with repeated identical cards/list items;
- one page with images, links, tables, callouts, and nested formatting;
- one bounded failure such as missing/uninspectable learner page;
- one browser storage/network/service-worker mutation attempt;

### Checkpoint 1 exit gate

Return GREEN only if:

- all adapter-declared surfaces have an outcome or the inventory is visibly incomplete and unscored;
- source and rendered classification is honest, non-overlapping, runtime-complete, and reason-complete;
- every editable candidate passes actual read-only Resolve;
- the collector is deterministic and read-only;
- truncation, mutation, unresolved occurrences, and zero candidates cannot create a positive percentage;
- exact-head all-catalog evidence is uploaded;
- no legacy percentage is claimed before the report supports it.

## Checkpoint 2 — ephemeral live preview

### Claims to audit

Live preview must prove:

1. supported changes appear in the isolated preview without writing a file;
2. preview uses a host-owned inert overlay and never mutates the original learner node or subtree;
3. preview accepts only the current server-mapped target and a server-canonical representation for approved capabilities;
4. preview and Apply call the same server canonicalizer for normalization, sanitization, URL, image, no-op, and curated-style semantics;
5. session/revision ordering rejects late, stale, duplicated, reordered, cross-target, and closed-generation messages;
6. Cancel, target switch, navigation, reload, disconnect, source drift, Studio mode/layout changes, and Apply completion remove preview correctly;
7. preview does not alter course localStorage, sessionStorage, IndexedDB, cookies, form answers, completion state, event handlers, node identity, or runtime data;
8. unsupported/runtime-owned targets cannot receive a generic preview representation;
9. Save draft persists only the canonical bounded patch and digest, and Apply remains the only repository mutation authority.

### Bridge and authorization audit

Inspect versioned message validators on both sides of the private preview bridge. Reject any design that accepts:

- filesystem paths;
- arbitrary DOM selectors or XPath supplied by the browser;
- raw JavaScript, event handlers, or unsanitized/unrestricted HTML;
- arbitrary CSS properties or values;
- wildcard origins or unscoped capabilities;
- target IDs not present in the current server-authored map;
- oversized or recursively complex messages;
- stale source/render fingerprints;
- a message without preview session ID, monotonic revision, project, page identity, map source digest, target node ID, and canonical patch digest;
- a representation not issued by the bounded server Normalize Preview route.

The bridge may display server-normalized presentation. It may not mutate learner content or grant source authority.

Verify that Normalize Preview re-resolves the current target, calls the same side-effect-free canonicalizer as Apply, removes no-ops, and returns a canonical patch plus inert render-only representation. Structural `isCourseEditPatch` validation alone is insufficient.

Verify that V1 renders outside the learner document. Any generic `innerHTML`, text, attribute, style, or subtree mutation on the original learner target is a checkpoint failure even when a later string snapshot appears to restore markup.

### Reset and state adversarial cases

Test at least:

1. type text, then Cancel;
2. edit target A, switch to target B, then return to A;
3. edit, navigate to another page, then use browser/Studio navigation back;
4. edit, reload the iframe and the Studio shell;
5. edit, disconnect/reconnect the bridge;
6. edit, then change source externally before Save or Apply;
7. edit a link and attempt to follow it while Edit mode is active;
8. preview a validated memory-only image, then cancel, reload, expire its token, restart the server, and attempt Apply;
9. send malformed, unsupported, stale, duplicated, reordered, and oversized messages;
10. deliver revision 6 before revision 5, Clear target A after target B is active, and a normalization response after its generation closed;
11. preview rich text containing script, unsafe URL, inline handlers, and unsupported tags;
12. preview styles with arbitrary property/value attempts;
13. verify pre-existing form answers, completion signals, storage, node identity, listeners, and runtime interaction state before and after preview;
14. force Apply rejection and prove the temporary preview returns to baseline rather than masquerading as applied content;
15. switch Focus/Split, Original/Current, desktop/tablet/mobile, zoom, Full Preview, project/root/page/route/state, and Annotation;
16. attempt screenshot capture and Review Set save/copy while an unapplied overlay is visible;
17. preview one selected draft in a multi-draft Apply that later rejects;
18. test keyboard-only use, focus return, reduced motion, zoom, and narrow screens.

### Patch-parity proof

For each supported capability—text, rich text, link, image/alt/title, and curated style—compare:

- server-normalized preview representation and canonical patch digest;
- saved canonical draft patch and digest;
- Apply's repeated canonicalization and preflight result;
- materialized source or factory override;
- final learner render after rebuild/reload.

For images, compare byte digest, decoded format, dimensions, final materialized path semantics, and learner natural dimensions. Do not compare the ephemeral URL literally with the final `src`.

Any material preview/Apply divergence is at least P1 because it teaches the teacher to trust a result that will not survive.

### Checkpoint 2 exit gate

Return GREEN only if:

- typing causes zero filesystem writes;
- typing causes zero learner-node, subtree, storage, form, completion, or runtime-data writes;
- every reset path removes the overlay and leaves the original learner objects intact;
- bridge authorization and message limits fail closed;
- session ordering cannot revive a closed or stale generation;
- image bytes stay bounded and memory-only until protected Apply, and token loss rejects residue-free;
- patch parity is proven across all supported capabilities and all four adapters where applicable;
- existing Apply, recovery, rendered-result, export, and Undo gates remain green.

## Checkpoint 3 — new Codex course contract

### Claims to audit

The new-course path must prove that a course created through the documented command is Studio-ready by construction rather than through hand-added flags:

```bash
npm run course:create -- --slug <unique-audit-slug> --title "Studio Audit Course" --course-code "AUDIT-001" --summary "Disposable exact-head Studio editability audit fixture"
```

Use a disposable checkout or explicitly remove the audit fixture after collecting evidence. Do not overwrite an existing project.

Verify:

- explicit supported adapter and `authoring.studioEditing.enabled` metadata;
- canonical entry and sources;
- source-owned standard blocks for headings, prose, lists, links, images/captions, cards/callouts, and tables;
- durable canonical edit keys for repeated blocks;
- runtime components consuming declared content data or remaining explicitly Annotation only;
- discovery by an already-running Studio;
- doctor, workspace verification, coverage report, preview, Save draft, Apply, reload, and Undo;
- generated project E2E contract and exact restoration.

### Threshold proof

The committed target is **at least 90% of routine teacher-content candidates** with **100% honest classification**.

The auditor must publish:

- complete adapter-owned surface inventory, including routes and required states;
- raw primary candidate and editable counts by candidate kind;
- Annotation-only counts and stable reason codes;
- raw teacher-text code-unit numerator and denominator;
- capability-opportunity supported/total counts by kind;
- exact formulas and unrounded ratios;
- surface-level and aggregate counts;
- content-block mix used by the fixture;
- exact SHA and report digest.

Do not accept a fixture containing only easy editable paragraphs. It must include the standard block types promised by the authoring contract plus at least one custom runtime region that remains Annotation only.

Do not convert the 90% target into “90–95%” unless multiple representative fresh courses independently demonstrate that range. One fixture proves the threshold contract, not a general 95% product guarantee.

### Checkpoint 3 exit gate

Return GREEN only if a fresh unmodified generated course:

- has a complete learner-surface inventory with zero unresolved/truncated occurrences;
- reaches at least 90% primary block coverage and at least 90% teacher-text code-unit coverage;
- reaches at least 80% in each present standard candidate kind promised by the generator profile;
- meets the Phase 0.5 course-name/Rename and promised capability-opportunity floors;
- classifies every remaining candidate honestly;
- appears in a running Studio;
- completes preview, Apply, reload, and Undo;
- preserves runtime-owned boundaries and source authority.

## Checkpoint 4 — targeted legacy migrations

### Claims to audit

Legacy coverage may improve only through one of these explicit paths:

1. mapping canonical HTML that already owns the content;
2. moving routine content into declared canonical data with an owning adapter;
3. adding a purpose-specific component editor;
4. retaining an intentional Annotation-only outcome.

Reject migrations that:

- enable editing by manifest flag alone;
- patch generated English/Social workspace output as source;
- run quarantined historical snapshot builders;
- use positional DOM identity for ambiguous repeated content;
- hide unsupported visible content from the denominator;
- broaden arbitrary HTML/CSS editing to improve a number;
- claim success from static source without learner-render verification.

### Required migration evidence

For every migrated course or family, require:

- before/after element counts from the same report schema;
- reason changes tied to specific ownership work;
- canonical owner and write boundary;
- doctor and metadata validation;
- public-route Apply/rebuild/reload/restart/Undo lifecycle;
- learner-render postcondition;
- byte-exact restoration;
- no unrelated project/export/raw changes;
- explicit remaining Annotation-only reasons.

Prioritize high-frequency teacher tasks and high-use courses. Do not optimize only for the easiest percentage increase.

### Checkpoint 4 exit gate

Return GREEN per batch only when every new editable target has a durable canonical owner, reversible proof, and honest rendered result. A lower honest coverage percentage is preferable to unsafe or misleading editability.

## Checkpoint 5 — controlled teacher rollout

The repository tests cannot prove that teachers understand the workflow. Audit at least twenty real teacher edit sessions across at least five teachers, including at least two teachers new to Studio and two regular users. No participant may supply more than 40% of sessions.

The cohort must cover:

- the four accepted adapter representatives;
- at least six additional high-use Direct, English, Social, and snapshot courses;
- the predetermined Phase 0.5 task matrix for text, rich text, links, images/alt, curated styles, Rename, rejected/reset edits, source drift, and Undo refusal.

Capture operational metadata without course content:

- course family and adapter;
- capability attempted;
- whether the target was clearly editable or Annotation only before clicking;
- preview latency and reset outcome;
- draft/apply outcome or explicit rejection;
- rendered-result rollback;
- source-drift/lock/Undo refusal;
- teacher confusion or handoff to Codex;
- export target and separate Brightspace acceptance status.

Report:

- median and p95 non-image preview acknowledgement latency;
- p95 validated-image preview acknowledgement latency;
- supported ordinary-task completion rate without Codex;
- false-editable and false Annotation-only rates;
- valid supported-task Apply rejection rate;
- preview/Apply mismatch count;
- confusion incidents per session;
- Codex handoff rate by task class.

### Rollout stop conditions

Stop controlled use immediately for:

- silent source corruption or unexplained file drift;
- Undo overwriting newer work;
- preview changing learner state or course files;
- a failed Apply leaving unexplained residue outside explicit manual recovery;
- preview showing a result that Apply silently materializes differently;
- cross-project/path authorization failure;
- repeated teacher confusion that can cause mistaken publication.

### Checkpoint 5 exit gate

Require:

- zero silent corruption or unexplained drift;
- zero unsafe Undo;
- every failed Apply residue-free or explicit fail-closed manual recovery;
- no P0/P1 regression;
- zero false-editable incidents and false Annotation-only below 5% on independently verified safe targets;
- at least 90% supported ordinary-task completion without Codex;
- non-image acknowledgement median at or below 200 ms and p95 at or below 750 ms, plus image p95 at or below 2.5 seconds;
- valid supported-task Apply rejection at or below 5%, zero preview/Apply mismatch, and no more than 0.25 confusion incidents per session;
- complex work still handing off cleanly, with handoff rate reported by task class.

## Cross-cutting sample matrix

| Sample | Why it is required | Minimum proof |
| --- | --- | --- |
| Direct course | Canonical workspace mutation path | Preview, Apply, render, reload, Undo, drift refusal |
| English factory | Generated workspace must remain output | Override, staged rebuild, render, exact restoration |
| Social factory | Checksum-backed factory ownership | Override, rebuild, render, exact restoration |
| Legacy snapshot | Preserved workspace and quarantined builder | Materialization without historical builder, exact restoration |
| Runtime-heavy course | Honest unsupported classification | Visible Annotation-only reasons; no generic write |
| Repeated-content page | Retargeting risk | Durable keys or safe rejection after reorder |
| Multi-page course | Page identity and aggregation | Complete physical-page inventory, surface counts, page navigation reset, no cross-page replay |
| SPA/hash/state course | One HTML file can contain many learner surfaces | Explicit complete inventory, every required state rendered, no one-page denominator collapse |
| Browser-state-writing course | Census and preview side-effect boundary | Storage/service-worker/network attempts are isolated, reported, and never silently scored |
| Image-rich page | Resource and accessibility boundary | Decode/memory/TTL limits, Apply-only persistence, temporary preview cleanup, decoded-identity and alt/title persistence |
| Course Rename | Multi-surface marked operation | Preview distinction, synchronized Apply, reload, Undo |
| Fresh Codex course | New-course product claim | Complete inventory, block/text/per-category/capability floors, and full lifecycle |

## Required verification commands

First verify that every declared script exists and has a backing entrypoint. At the planning baseline, the coverage command intentionally does not exist.

Existing baseline commands:

```bash
npm run test:course-editing
npm run test:studio-inspection
npm run test:course-onboarding
npm run test:codex-course
npm run test:authoring-context
npm run test:metadata-policy
npm run validate:manifests
npm run build:studio
npm run verify:course-editing-pilots
npm run verify:course-onboarding -- --all
npm run test:e2e:smoke
npm run test:studio-release
```

Expected Phase 1 command only after implementation:

```bash
npm pkg get scripts.report:course-editability
npm run report:course-editability -- --all
```

Expected focused tests must cover adapter inventory, route/state traversal, rendered/source reconciliation, actual Resolve parity, non-overlapping candidates, stable reason codes, null incomplete/truncated scoring, deterministic output, browser isolation, and read-only residue. The auditor should name the actual landed test files and reject documentation that references nonexistent scripts or tests.

For interaction-heavy Phase 2/3 changes, require the complete Studio inspection E2E and a strict project contract for the fresh audit course. Use the repository's actual landed command names rather than accepting invented future scripts.

Repository-wide typecheck has an established unrelated diagnostic baseline. Record the command and delta honestly; do not call it green unless it exits successfully, and do not attribute unchanged baseline diagnostics to this feature.

## Exact-head CI artifact inspection

For every release candidate:

1. confirm the push workflow SHA equals the branch head;
2. confirm the PR workflow covers GitHub's current merge context;
3. download the push-run artifact `studio-direct-editing-release-evidence`;
4. inspect `studio-release-report.json`, `course-editing-pilots.json`, and `course-onboarding-verification.json`;
5. inspect the new coverage artifact once Phase 1 lands;
6. verify `ok`, zero failures, source fingerprint stability, expected counts, exact commit, and report digests;
7. reject an artifact copied from an older green SHA.

The accepted post-audit planning baseline was independently re-run at `39229893`:

- exact-head run `31763552248`: 149 focused, 58 inspection E2E, smoke 1, project contract 1, four adapter pilots, and 63 catalog outcomes passed; source did not change during the run;
- PR-merge run `31763554764`: the same complete gate passed in GitHub's merge context.

Those runs prove the inherited baseline, not future census or live-preview behavior.

The first plan-audit head `a5645d2e` also has exact publication evidence:

- exact-head push run `31765993351` passed on retry after one course hit repeated Chromium navigation timeouts in attempt 1;
- PR-merge run `31765996040` passed on its first attempt.

Those runs prove that the inherited Direct Editing gate remained green at the uploaded first-plan head. They do not override the independent **REQUEST CHANGES** plan verdict and do not prove the Phase 0.5 response.

## External acceptance that remains separate

Do not report these as repository-proven unless separately executed:

- Brightspace upload and learner launch;
- deployed-host behavior;
- SCORM 1.2 and SCORM 2004 resume, completion, score, and cross-browser persistence;
- full WCAG conformance;
- delayed learner interactions outside the bounded local render observation window;
- arbitrary external-writer coordination outside the cooperative Studio lock.

An audit may approve local Studio rollout while still marking these as export/deployment acceptance requirements.

## Required auditor deliverable

The final ChatGPT Pro response must contain:

1. exact head, base, PR, workflow run IDs, and evidence artifacts reviewed;
2. overall verdict plus a verdict for every completed checkpoint;
3. a claim ledger labeled `confirmed`, `partially confirmed`, `not implemented`, `overstated`, or `false`;
4. P0–P3 findings with exact GitHub file/line links;
5. element-level measurements with raw block/text/capability numerators and denominators, formulas, learner-surface counts, inventory completeness, and report digest;
6. source-ownership findings by Direct, English, Social, snapshot, and runtime-only class;
7. adversarial cases actually run and their observed results;
8. commands run, exit codes, and tests skipped or unavailable;
9. local repository proof separated from Brightspace/deployment/cross-browser evidence;
10. prioritized remediation and the smallest safe next rollout step.

The auditor must not provide a generic “looks good” based on documentation alone.

## Copy-ready prompt for ChatGPT Pro

> Audit the Phase 0.5 real-time editability contract amendment in `deanguedo-arch/canvas-helper` as an independent release reviewer. Begin with `docs/audits/2026-08-13-chatgpt-pro-real-time-editability-audit-plan.md`, `docs/plans/2026-08-13-studio-real-time-editability-and-rollout.md`, `docs/plans/2026-08-14-studio-real-time-editability-phase-0-5-contracts.md`, and `docs/ops/ACTIVE_HANDOFF.md`. Pin the exact head and base before reviewing. The previous plan audit at `a5645d2e` returned REQUEST CHANGES; verify that the amendment concretely resolves every item in the Checkpoint 0.5 disposition matrix. Treat Direct Editing GREEN/GO at `e7124143` and later exact-head baseline CI as inherited safety evidence only—not proof that the element census or live preview exists. Red-team one-HTML/many-route courses, runtime-created content, nested and duplicate candidate counting, incomplete/truncated scoring, mutation-capable project loading, browser storage/network/service-worker side effects, actual Resolve parity, server preview canonicalization, session/revision ordering, non-mutating host overlay behavior, memory-only images, Apply-owned persistence, the complete Studio reset matrix, and quantitative teacher-rollout gates. Return a separate verdict for the Phase 0.5 specification and mark census/preview behavior NOT AUDITABLE YET unless implementation exists on the reviewed head. Use exact GitHub file/line links, list unresolved P0–P3 findings, and identify the smallest safe next implementation slice. Do not accept the documentation as implementation proof and do not repeat “79% editable” or “90–95%” as current product evidence.

## Maintainer handoff checklist before requesting the audit

- [ ] Use a focused implementation branch or identify the exact post-baseline commit range.
- [ ] Ensure the audit plan links to the current implementation PR.
- [ ] Record the exact head SHA and current base SHA.
- [ ] For Checkpoint 0.5, request a specification verdict against the complete disposition matrix before beginning Phase 1 code.
- [ ] Confirm the reviewer labels census, preview, fresh-course threshold, legacy migration, and teacher rollout NOT AUDITABLE YET when they remain unimplemented.
- [ ] Confirm all declared package scripts have backing entrypoints.
- [ ] Run focused tests before the expensive complete release gate.
- [ ] Generate the all-surface coverage report and record its schema/digest.
- [ ] Run the four adapter pilots and catalog verification.
- [ ] Run `npm run test:studio-release` without source changes during the run.
- [ ] Push and wait for exact-head and PR-merge workflows.
- [ ] Upload the release, pilot, catalog, and coverage evidence.
- [ ] Confirm no local-only course assets are presented as GitHub evidence.
- [ ] Update `docs/ops/ACTIVE_HANDOFF.md` with honest incomplete and external acceptance work.
- [ ] Give ChatGPT Pro the copy-ready prompt and PR link.

Until the census and preview implementation land, the correct independent verdict on those product claims is **NOT AUDITABLE YET / NOT IMPLEMENTED**, even though the inherited Direct Editing safety baseline remains GREEN.
