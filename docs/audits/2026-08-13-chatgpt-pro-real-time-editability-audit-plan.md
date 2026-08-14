# ChatGPT Pro audit plan — Studio real-time editability

- Prepared: August 13, 2026
- Audience: independent ChatGPT Pro reviewer with GitHub access; terminal access is preferred
- Repository: [`deanguedo-arch/canvas-helper`](https://github.com/deanguedo-arch/canvas-helper)
- Accepted Direct Editing baseline: `e71241433e173c7617dbf5ea5e5ddcc5bf712c11`
- Post-audit planning baseline: `392298937102be216d4d3fc24da1c322ce280a36`
- Current implementation status: **planned; real-time preview and element-level census are not implemented**
- Product plan: [`../plans/2026-08-13-studio-real-time-editability-and-rollout.md`](../plans/2026-08-13-studio-real-time-editability-and-rollout.md)

## Audit purpose

Independently determine whether Canvas Studio can make ordinary teacher-owned course content feel immediately editable without weakening the source-ownership, transaction, rebuild, learner-render, export-freshness, recovery, or Undo guarantees already accepted for Direct Editing.

This audit must answer five separate questions:

1. Does the coverage census measure element-level editability honestly and without changing a course?
2. Does live preview update only the isolated presentation while typing, with no filesystem or learner-state mutation?
3. Does Save draft and Apply continue to use the existing bounded patch and protected server-authorized write path?
4. Do newly created Codex courses actually meet the declared routine-content coverage target?
5. Are legacy improvements based on proven canonical ownership rather than flags, DOM tricks, or unsafe builders?

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

Any review that repeats “90–95%” or “79% editable” without new element-level evidence should return **REQUEST CHANGES** for claim accuracy even if the underlying code is safe.

## Audit timing and review units

Do not wait for the entire roadmap to land in one large diff. Audit five bounded checkpoints:

1. **Census checkpoint:** read-only denominator, classification, report schema, and all-page evidence.
2. **Preview checkpoint:** ephemeral preview bridge, UI state, reset behavior, and patch parity.
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
3. [`2026-08-13-studio-direct-editing-green-go-verdict.md`](2026-08-13-studio-direct-editing-green-go-verdict.md)
4. [`2026-08-13-chatgpt-studio-course-editing-audit-brief.md`](2026-08-13-chatgpt-studio-course-editing-audit-brief.md)
5. [`../../app/shared/course-editing.ts`](../../app/shared/course-editing.ts)
6. [`../../app/server/lib/preview-inspection.ts`](../../app/server/lib/preview-inspection.ts)
7. [`../../app/shared/preview-bridge.ts`](../../app/shared/preview-bridge.ts)
8. [`../../app/server/preview-bridge-runtime.ts`](../../app/server/preview-bridge-runtime.ts)
9. [`../../app/studio/src/hooks/useCourseEditing.ts`](../../app/studio/src/hooks/useCourseEditing.ts)
10. [`../../app/studio/src/components/CourseEditPanel.tsx`](../../app/studio/src/components/CourseEditPanel.tsx)
11. [`../../app/server/lib/course-editing.ts`](../../app/server/lib/course-editing.ts)
12. [`../../app/server/lib/course-edit-transaction.ts`](../../app/server/lib/course-edit-transaction.ts)
13. [`../../app/server/lib/course-edit-render-validation.ts`](../../app/server/lib/course-edit-render-validation.ts)
14. [`../../scripts/lib/codex-course.ts`](../../scripts/lib/codex-course.ts)
15. [`../workflows/codex-studio-course.md`](../workflows/codex-studio-course.md)

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

## Checkpoint 1 — element-level editability census

### Claims to audit

The census must prove all of the following:

1. Every declared learner page receives a deterministic outcome or bounded explicit error.
2. Every routine teacher-content candidate is classified as editable or Annotation only.
3. Coverage is computed from element counts, not course counts and not an average of page percentages.
4. The report uses the same server-authored ownership map used by Studio but does not become write authorization.
5. Running the report changes no course, project metadata, draft, lock, checkpoint, export, or generated workspace.
6. The full report is tied to adapter, canonical owner, page, source fingerprint, and exact commit SHA.

### Denominator audit

The planned denominator includes routine teacher-owned:

- headings;
- paragraphs and list items;
- link and content-button labels;
- images, alt text, captions, and titles;
- table headers and cells;
- card/callout titles and descriptions;
- synchronized course-name surfaces.

It must separately classify rather than count:

- hidden/script/style/template/metadata nodes;
- layout wrappers without their own content;
- Studio chrome;
- runtime-only navigation;
- quizzes, simulations, media players, and behavior-rich components requiring dedicated editors;
- duplicated accessible text produced only for presentation.

The auditor must challenge denominator gaming:

- nested elements must not double-count the same teacher-authored text;
- wrappers must not inflate candidate or editable counts;
- omitted semantic elements must appear in an unsupported/error reason rather than vanish;
- zero-candidate pages must not be reported as 100% editable;
- project totals must use `sum(editable) / sum(candidates)`, not the mean of page percentages;
- truncated inspection must remain visible and must not improve the score;
- runtime content must not disappear from the report merely because it lacks source ownership.

Independently sample rendered semantic elements on representative pages and reconcile them against the generated candidate list. Do not rely only on the collector testing itself.

### Required report fields

At minimum, verify:

- schema version and exact commit SHA;
- project, driver, adapter, canonical owner, and page identity;
- candidate, editable, and Annotation-only counts;
- capability counts for text, rich text, link, image, alt, title, and curated styles;
- reason histogram for every unsupported candidate;
- live-map/source-fingerprint match counts;
- ambiguous repeated-identity rejection count;
- truncated/uninspectable/error state;
- course-level pilot outcome shown separately from element coverage;
- deterministic aggregate totals without embedded course content.

### Read-only adversarial proof

In a clean disposable checkout:

1. fingerprint tracked files plus project workspace/meta/resource files before the run;
2. run the coverage command;
3. prove only the declared ignored `.runtime` report was created or changed;
4. compare tracked Git status, relevant file hashes, lock/checkpoint directories, exports, and Studio draft storage afterward;
5. run twice and compare normalized report bytes.

The proposed command must be treated as nonexistent until both the package script and its backing entrypoints land:

```bash
npm pkg get scripts.report:course-editability
npm run report:course-editability -- --all
```

### Representative census samples

Include at least:

- one Direct multi-page course;
- one English factory course;
- one Social factory course;
- one preserved snapshot course;
- one runtime-heavy no-source-owned-target course;
- Aboriginal Studies 30 or the current no-learner-stable-target equivalent;
- one page with repeated identical cards/list items;
- one page with images, links, tables, callouts, and nested formatting;
- one bounded failure such as missing/uninspectable learner page.

### Checkpoint 1 exit gate

Return GREEN only if:

- all declared pages have an outcome;
- classification is honest and reason-complete;
- the collector is deterministic and read-only;
- exact-head all-catalog evidence is uploaded;
- no legacy percentage is claimed before the report supports it.

## Checkpoint 2 — ephemeral live preview

### Claims to audit

Live preview must prove:

1. supported changes appear in the isolated preview without writing a file;
2. preview accepts only the current server-mapped target and approved patch capabilities;
3. preview and Apply use the same normalization, sanitization, URL, image, and curated-style semantics;
4. Cancel, target switch, navigation, reload, disconnect, source drift, and Apply completion clear or restore preview correctly;
5. preview does not alter course localStorage, sessionStorage, form answers, completion state, event handlers, or runtime data;
6. unsupported/runtime-owned targets cannot receive a generic preview mutation;
7. Save draft persists only the existing bounded patch, and Apply remains the only filesystem mutation authority.

### Bridge and authorization audit

Inspect versioned message validators on both sides of the private preview bridge. Reject any design that accepts:

- filesystem paths;
- arbitrary DOM selectors or XPath supplied by the browser;
- raw JavaScript, event handlers, or unrestricted HTML;
- arbitrary CSS properties or values;
- wildcard origins or unscoped capabilities;
- target IDs not present in the current server-authored map;
- oversized or recursively complex messages;
- stale source/render fingerprints.

The bridge may change presentation. It may not grant source authority.

### Reset and state adversarial cases

Test at least:

1. type text, then Cancel;
2. edit target A, switch to target B, then return to A;
3. edit, navigate to another page, then use browser/Studio navigation back;
4. edit, reload the iframe and the Studio shell;
5. edit, disconnect/reconnect the bridge;
6. edit, then change source externally before Save or Apply;
7. edit a link and attempt to follow it while Edit mode is active;
8. preview a validated image upload/object URL, then cancel and reload;
9. send malformed, unsupported, stale, duplicated, reordered, and oversized messages;
10. preview rich text containing script, unsafe URL, inline handlers, and unsupported tags;
11. preview styles with arbitrary property/value attempts;
12. verify pre-existing form answers, completion signals, localStorage, and runtime interaction state before and after preview;
13. force Apply rejection and prove the temporary preview does not masquerade as applied content;
14. test keyboard-only use, focus return, reduced motion, zoom, and narrow screens.

### Patch-parity proof

For each supported capability—text, rich text, link, image/alt/title, and curated style—compare:

- previewed representation;
- saved draft patch;
- server preflight result;
- materialized source or factory override;
- final learner render after rebuild/reload.

Any material preview/Apply divergence is at least P1 because it teaches the teacher to trust a result that will not survive.

### Checkpoint 2 exit gate

Return GREEN only if:

- typing causes zero filesystem writes;
- every reset path restores the correct rendered baseline;
- bridge authorization and message limits fail closed;
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

- raw candidate count;
- raw editable count;
- Annotation-only count and reasons;
- exact formula and unrounded percentage;
- page-level counts;
- aggregate counts;
- content-block mix used by the fixture;
- exact SHA and report digest.

Do not accept a fixture containing only easy editable paragraphs. It must include the standard block types promised by the authoring contract plus at least one custom runtime region that remains Annotation only.

Do not convert the 90% target into “90–95%” unless multiple representative fresh courses independently demonstrate that range. One fixture proves the threshold contract, not a general 95% product guarantee.

### Checkpoint 3 exit gate

Return GREEN only if a fresh unmodified generated course:

- reaches at least 90% by the audited denominator;
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

The repository tests cannot prove that teachers understand the workflow. Audit at least twenty real teacher edit sessions across:

- the four accepted adapter representatives;
- at least six additional high-use Direct, English, Social, and snapshot courses;
- text, rich text, links, images/alt, curated styles, Rename, rejected edits, source drift, and Undo refusal.

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
- teachers correctly identifying editable versus Annotation-only content;
- ordinary edits completed without Codex while complex work still hands off cleanly.

## Cross-cutting sample matrix

| Sample | Why it is required | Minimum proof |
| --- | --- | --- |
| Direct course | Canonical workspace mutation path | Preview, Apply, render, reload, Undo, drift refusal |
| English factory | Generated workspace must remain output | Override, staged rebuild, render, exact restoration |
| Social factory | Checksum-backed factory ownership | Override, rebuild, render, exact restoration |
| Legacy snapshot | Preserved workspace and quarantined builder | Materialization without historical builder, exact restoration |
| Runtime-heavy course | Honest unsupported classification | Visible Annotation-only reasons; no generic write |
| Repeated-content page | Retargeting risk | Durable keys or safe rejection after reorder |
| Multi-page course | Page identity and aggregation | All-page counts, page navigation reset, no cross-page replay |
| Image-rich page | Resource and accessibility boundary | Decode limits, temporary preview cleanup, alt/title persistence |
| Course Rename | Multi-surface marked operation | Preview distinction, synchronized Apply, reload, Undo |
| Fresh Codex course | New-course product claim | ≥90% audited routine-content coverage and full lifecycle |

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

Expected focused tests must cover the report schema, denominator, deterministic output, all-page traversal, bounded errors, and read-only residue. The auditor should name the actual landed test files and reject documentation that references nonexistent scripts or tests.

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
5. element-level measurements with raw numerators, denominators, formulas, page counts, and report digest;
6. source-ownership findings by Direct, English, Social, snapshot, and runtime-only class;
7. adversarial cases actually run and their observed results;
8. commands run, exit codes, and tests skipped or unavailable;
9. local repository proof separated from Brightspace/deployment/cross-browser evidence;
10. prioritized remediation and the smallest safe next rollout step.

The auditor must not provide a generic “looks good” based on documentation alone.

## Copy-ready prompt for ChatGPT Pro

> Audit the real-time editability work in `deanguedo-arch/canvas-helper` as an independent release reviewer. Begin with `docs/audits/2026-08-13-chatgpt-pro-real-time-editability-audit-plan.md`, `docs/plans/2026-08-13-studio-real-time-editability-and-rollout.md`, and `docs/ops/ACTIVE_HANDOFF.md`. Pin the exact head and base before reviewing. Treat the accepted Direct Editing GREEN/GO at `e7124143` and the clean post-audit planning baseline at `39229893` as inherited safety evidence only—not proof that the element census or live preview exists. Verify every material claim against implementation code, manifest/source ownership, real server/browser boundaries, exact-head tests, and uploaded CI artifacts. Do not accept package-script names or documentation as proof. Explicitly reject “79% of legacy content is editable”: 50/63 is only a course-level reversible-lifecycle ratio. Treat ≥90% as a target for freshly created Codex courses and require raw element counts, the audited denominator, formula, page breakdown, exact SHA, and report digest before confirming it; do not repeat 90–95% without representative evidence. Audit checkpoints separately: (1) read-only deterministic element census, (2) ephemeral preview with zero file/learner-state writes and complete reset behavior, (3) fresh Codex-course ≥90% contract, (4) source-owned legacy migrations, and (5) controlled teacher rollout. Red-team browser-message authorization, stale identity, preview/Apply parity, sanitization, reset paths, localStorage/form/completion side effects, all four adapters, learner-render persistence, crash recovery, export freshness, and drift-safe Undo. Return the required auditor deliverable from the plan, including exact GitHub file/line links, commands and exit codes, P0–P3 findings, confirmed versus overstated claims, and an overall GO / GO WITH CONDITIONS / REQUEST CHANGES / NO-GO / NOT AUDITABLE YET verdict. Clearly separate repository evidence from Brightspace, deployed-host, full-WCAG, and cross-browser SCORM acceptance.

## Maintainer handoff checklist before requesting the audit

- [ ] Use a focused implementation branch or identify the exact post-baseline commit range.
- [ ] Ensure the audit plan links to the current implementation PR.
- [ ] Record the exact head SHA and current base SHA.
- [ ] Confirm all declared package scripts have backing entrypoints.
- [ ] Run focused tests before the expensive complete release gate.
- [ ] Generate the all-page coverage report and record its schema/digest.
- [ ] Run the four adapter pilots and catalog verification.
- [ ] Run `npm run test:studio-release` without source changes during the run.
- [ ] Push and wait for exact-head and PR-merge workflows.
- [ ] Upload the release, pilot, catalog, and coverage evidence.
- [ ] Confirm no local-only course assets are presented as GitHub evidence.
- [ ] Update `docs/ops/ACTIVE_HANDOFF.md` with honest incomplete and external acceptance work.
- [ ] Give ChatGPT Pro the copy-ready prompt and PR link.

Until the census and preview implementation land, the correct independent verdict on those product claims is **NOT AUDITABLE YET / NOT IMPLEMENTED**, even though the inherited Direct Editing safety baseline remains GREEN.
