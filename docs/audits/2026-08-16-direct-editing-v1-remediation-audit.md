# Independent audit packet — Canvas Studio Direct Editing V1 remediation

- Prepared: August 16, 2026
- Repository: [`deanguedo-arch/canvas-helper`](https://github.com/deanguedo-arch/canvas-helper)
- Pull request: [PR #1](https://github.com/deanguedo-arch/canvas-helper/pull/1)
- PR branch and target: `codex/studio-direct-editing-v1` → `codex/studio-roadmap-phases`
- Required PR state during this review: **draft**
- Implementation commits to audit: [`eff00354`](https://github.com/deanguedo-arch/canvas-helper/commit/eff00354), [`fde7ab54`](https://github.com/deanguedo-arch/canvas-helper/commit/fde7ab54), and [`311d4a44`](https://github.com/deanguedo-arch/canvas-helper/commit/311d4a44)
- Local implementation evidence head: [`311d4a4426b3e685481325347fb5fb2a85097d4b`](https://github.com/deanguedo-arch/canvas-helper/commit/311d4a4426b3e685481325347fb5fb2a85097d4b)
- Requested verdict: **GO**, **GO WITH CONDITIONS**, or **REQUEST CHANGES** for PR #1 remediation only

## Audit scope and release sequence

This packet asks whether PR #1 closes the audited Direct Editing safety and integrity findings. It does **not** ask whether the future inline editor is complete.

The planned first inline release remains a separate follow-up, `codex/studio-inline-text-editing-v1`, created only from the exact integrated PR #1 commit after an independent GO. It will provide parent-owned plain-text in-place editing in embedded Studio, shared editable Review & Apply drafts, and display-only Full Preview. PR #1 must not introduce caret editing, direct learner-DOM editing, or an editing lease.

The intended write boundary is unchanged:

```text
typing / local Save draft → browser-local Studio state only
Apply → protected course-file and course-asset mutation, rebuild, render validation, checkpoint, Undo
```

## Executive truth statement

At the local evidence head, the remediation implements the three release blockers and the eleven listed follow-up findings. The focused suites, full local Studio release gate, real Direct/English/Social/snapshot pilots, all-course onboarding acceptance, frozen diagnostic gate, and isolated fresh-course lifecycle proof passed.

That is not final publication evidence. The reviewer must verify an exact-head push run and a PR merge-context run derived from the same published PR head before issuing GO. This packet deliberately does not claim that GitHub CI has already passed for commits that had not yet been published when it was written.

No learner course content was intentionally changed. The user-owned `ready-mind` workspace edit and unrelated untracked local data were preserved and excluded from staging.

## Review the three release blockers

### 1. One safe URL path across preview, saved drafts, Apply, and final learner output

Review [`scripts/lib/course-editing/html.ts`](../../scripts/lib/course-editing/html.ts), [`app/server/lib/course-editing.ts`](../../app/server/lib/course-editing.ts), and [`app/server/routes/course-edits.ts`](../../app/server/routes/course-edits.ts).

Expected properties:

- reject raw C0/DEL controls, tabs, CR/LF, internal ASCII whitespace, percent-encoded controls, malformed percent decoding, protocol-relative values, root-absolute paths, backslashes, decoded traversal, and executable schemes in any case;
- parse against a fixed HTTPS base;
- permit only safe local paths/fragments, `https:`, `mailto:`, and `tel:` for links; image sources are only safe local paths or `https:`;
- sanitize rich-text links through the same path;
- reject oversized sanitized rich text rather than truncating serialized markup;
- malformed request values return a bounded HTTP 400 and no asynchronous route failure escapes the final boundary.

Relevant tests are in [`scripts/tests/course-editing.test.ts`](../../scripts/tests/course-editing.test.ts).

### 2. English factory readiness tracks actual output dependencies

Review [`scripts/lib/english-unit/dependencies.ts`](../../scripts/lib/english-unit/dependencies.ts), [`scripts/lib/english-unit/factory-build.ts`](../../scripts/lib/english-unit/factory-build.ts), [`scripts/lib/english-unit/v3-donor-lessons.ts`](../../scripts/lib/english-unit/v3-donor-lessons.ts), and [`scripts/lib/new-course-readiness.ts`](../../scripts/lib/new-course-readiness.ts).

Expected properties:

- dependencies come from the recipe/actual factory closure, not output manifest claims;
- V3 family manifests and supplements, `derivesFromProject`, donor recipes/inputs, source resources, and shared local implementation dependencies are included;
- stored dependencies are repository-relative;
- unresolved output-affecting dependencies fail readiness rather than disappearing;
- clean-checkout Git fixtures cover family-only, donor-recipe-only, donor-input-only, and shared-builder-only changes, each selecting a governed course and preventing a zero-required pass.

### 3. Factory Rename never leaves a half-applied boundary

Review [`app/server/lib/course-editing.ts`](../../app/server/lib/course-editing.ts), [`app/server/lib/course-edit-transaction.ts`](../../app/server/lib/course-edit-transaction.ts), and [`scripts/tests/course-editing.test.ts`](../../scripts/tests/course-editing.test.ts).

Expected properties:

- a complete post-metadata intermediate fingerprint is recorded before rebuild;
- the intermediate is replaced by the final rebuilt fingerprint before validation;
- command failure, timeout, title mismatch, doctor failure, or rendered failure restores the byte-exact pre-Rename boundary and removes the transaction journal;
- manual recovery is reserved for unknown external bytes rather than ordinary known failures.

## Review the P2 remediation ledger

| Finding | Expected evidence |
| --- | --- |
| `course:create` signaling failure | [`scripts/lib/codex-course.ts`](../../scripts/lib/codex-course.ts) rolls back only a created tree whose bytes/modes still match; tests retain external changes. |
| Title synchronization | [`app/server/lib/course-editing.ts`](../../app/server/lib/course-editing.ts) updates all safe non-void `data-canvas-helper-course-title` markers, including `p`, `span`, and `h4`–`h6`. |
| Onboarding Rename permission | [`scripts/lib/course-onboarding.ts`](../../scripts/lib/course-onboarding.ts) recomputes current marker support instead of preserving stale metadata. |
| Persistent asset write before Apply | The `/course-edits/assets` route and unused write-through helper are absent; pre-Apply image bytes remain memory-only. |
| Manifestless catalog paths | Onboarding reports an explicit blocked non-package outcome without inventing a canonical authoring source. |
| Onboarding rollback | Prior bytes, modes, and existence are restored exactly, and Studio signal state is reverted. |
| Browser launch failure | [`app/server/lib/course-edit-render-validation.ts`](../../app/server/lib/course-edit-render-validation.ts) closes the isolated preview server if Chromium launch fails. |
| Durable saved-draft reopen | [`app/shared/course-editing.ts`](../../app/shared/course-editing.ts), [`app/server/routes/course-edits.ts`](../../app/server/routes/course-edits.ts), and [`app/studio/src/hooks/useCourseEditing.ts`](../../app/studio/src/hooks/useCourseEditing.ts) resolve durable identity, distinguish target change/missing/unsupported, and perform no write. |
| Fresh target normalization | [`app/studio/src/App.tsx`](../../app/studio/src/App.tsx) passes a freshly resolved target to normalization instead of delayed React selection state. |
| Runtime route boundary | [`app/server/studio-server.ts`](../../app/server/studio-server.ts) dispatches `/api/course-edits/reopen`; [`scripts/tests/studio-architecture.test.ts`](../../scripts/tests/studio-architecture.test.ts) protects the route. |
| TypeScript honesty | [`config/typecheck-baseline-v1.json`](../../config/typecheck-baseline-v1.json) and [`scripts/verify-typecheck-baseline.ts`](../../scripts/verify-typecheck-baseline.ts) verify the exact established normalized diagnostic set. |

## Saved-draft reopen contract

The read-only `POST /api/course-edits/reopen` endpoint implements the following bounded result shape:

```ts
type CourseEditReopenResult =
  | { status: "resolved"; target: CourseEditTarget }
  | { status: "target-changed"; currentTarget: CourseEditTarget }
  | { status: "missing" | "unsupported"; reason: string };
```

It must locate current authority by durable edit identity—not a historical node ID—return current source identity when resolved, distinguish unrelated page change from target change, and mutate nothing. Afterward, Studio performs the usual current rendered selection and Resolve before previewing or saving. Audit both the endpoint and the UI callback dependency/change that reaches it.

## Fresh-course non-vacuous proof

Review [`scripts/verify-fresh-course-studio-proof.ts`](../../scripts/verify-fresh-course-studio-proof.ts) and [the new-course workflow](../../.github/workflows/new-course-readiness.yml).

The proof must run production `course:create` inside an isolated temporary clean clone, record the implementation SHA, and clean up its generated project/clone. It then proves:

1. doctor and complete declared learner inventory;
2. rendered routine-content thresholds;
3. browser-local draft Save (no course write);
4. HTTP Normalize, Apply, learner reload, server restart, Undo;
5. exact source/resource restoration.

The local evidence report at `311d4a44` was `.runtime/fresh-course-studio-proof-local.json` and recorded 26/27 primary blocks plus 793/818 teacher-text code units. Treat the final exact-head push `fresh-course-studio-proof` artifact as authority. A PR-context artifact normally records GitHub's synthetic merge commit; confirm that its run metadata's `headSha` is the same reviewed branch head rather than incorrectly demanding that its internal `git rev-parse HEAD` equal the branch SHA.

## Typecheck gate, stated honestly

`npm run typecheck -- --pretty false` still exits `2` with ten established unrelated diagnostics. This PR does not claim that raw typecheck is green.

`npm run verify:typecheck-baseline` compares `{file, code, message}` exactly, excluding line/column volatility. It fails if any established diagnostic is added, removed, or changed; it also fails if a diagnostic appears in a file changed after baseline capture.

One unavoidable policy nuance should be evaluated explicitly: a pre-existing diagnostic lives in a file altered by earlier PR work before the frozen baseline was captured. Therefore the checker can honestly enforce “no new diagnostic in a file changed since baseline capture,” but cannot label that inherited diagnostic as new solely because the broader PR previously touched its file. A stricter literal whole-PR rule would need a separately accepted cleanup/baseline adjustment, which this remediation intentionally does not hide inside the safety work.

## Local evidence at `311d4a44`

| Command | Result |
| --- | --- |
| `npm run test:course-editing` | 50/50 passed |
| `npm run test:course-onboarding` | 5/5 passed |
| `npm run test:codex-course` | 5/5 passed |
| `npm run test:new-course-readiness` | 10/10 passed |
| `npm run test:course-editability` | 17/17 passed |
| `npm run test:exports` | 55/55 passed |
| `npm run build:studio` | passed |
| `npm run verify:typecheck-baseline` | passed |
| raw `npm run typecheck -- --pretty false` | expected exit `2`, exact ten established diagnostics |
| direct-edit Playwright regression | passed |
| `npm run test:studio-release` | passed: 162 focused contracts, 58/58 inspection E2E, smoke, strict project contract |
| `npm run verify:fresh-course-studio-proof -- --report .runtime/fresh-course-studio-proof-local.json` | passed |
| `npm run verify:course-editing-pilots` | passed: Direct, English, Social, snapshot; exact restoration |
| `npm run verify:course-onboarding -- --all` | 63/63 passed |

The real adapter pilots are `mental-health-wellness` (Direct), `ela20-1-short-stories-pilot` (English), `social30-1-related-issue-1-option-2` (Social), and `ela10-2-writing-foundations` (snapshot). Each exercises Apply, owning rebuild/materialization where applicable, learner rendered validation, reload, server restart, Undo, and byte-exact restoration.

## Required GitHub evidence

After the commits are published, verify both contexts derived from the final branch head:

1. An **exact-head push** run of **Studio Direct Editing release gate** — focused editing and editability tests, export contracts, full Studio release gate, four real adapter pilots, all-course onboarding lifecycle, expected raw typecheck report, frozen baseline pass, and artifacts whose recorded commit equals the branch head.
2. Its **all-catalog editability census** — complete exhaustive census evidence uploaded separately from the release gate; do not substitute a partial or local dirty-worktree result.
3. An exact-head push run of **New course Studio readiness** — fresh-course proof, frozen baseline pass, and readiness artifact whose recorded commit equals the branch head.
4. Matching **PR-context** runs for PR #1. GitHub may execute these against a synthetic merge commit; require their run metadata `headSha` to equal the reviewed branch head and confirm that the merge ref contains that head.

The reviewer should reject a green-looking outcome if a push artifact's recorded commit differs from the branch head, a PR-context run is not derived from that head, a report publishes truncated/incomplete data as a valid percentage, or one required job is missing.

## Auditor commands

Run from a clean, full-history checkout of the final published PR head:

```bash
git status --short
git rev-parse HEAD
git log --oneline --decorate -8
git diff --check origin/codex/studio-roadmap-phases...HEAD
npm ci
npx playwright install chromium
npm run test:course-editing
npm run test:course-onboarding
npm run test:codex-course
npm run test:new-course-readiness
npm run test:course-editability
npm run test:exports
npm run build:studio
npm run typecheck -- --pretty false
npm run verify:typecheck-baseline
npm run verify:fresh-course-studio-proof -- --report .runtime/fresh-course-studio-proof.json
npm run test:studio-release
npm run verify:course-editing-pilots
npm run verify:course-onboarding -- --all
gh pr view 1 --json isDraft,headRefOid,baseRefName,statusCheckRollup
```

Then download exact-head push artifacts and the corresponding PR merge-context artifacts from the required workflows above. Do not rerun external Brightspace acceptance under this PR unless it is deliberately added as its own separately scoped release gate.

## Claims intentionally not made

- This is not a claim that every visible node in every legacy course is editable. Runtime quizzes, navigation, simulations, code-controlled content, and ambiguous repeated components remain Annotation-only or need dedicated editors.
- The cooperative Studio filesystem lock does not coordinate arbitrary external writers; Codex, Git, manual editing, and standalone builders must not touch the course during Apply.
- Local rendering is not Brightspace/deployed-host acceptance, full WCAG certification, cross-browser SCORM persistence, delayed-interaction proof, or teacher-rollout evidence.
- No direct inline editing exists in PR #1. The future UX will use a Studio-owned overlay rather than mutate learner DOM, but it must be independently implemented and audited after PR #1 integration.

## Verdict rubric

Return **REQUEST CHANGES** if any sanitizer path bypasses the shared rules; a factory dependency can silently vanish; Rename leaves known partial bytes; saved draft reopen relies on its stale node ID or writes; the fresh proof is vacuous/not production-backed; raw typecheck is described as green; an exact-head push artifact is missing; or a PR-context run is not derived from that exact head.

Return **GO WITH CONDITIONS** only for explicitly external acceptance such as teacher rollout, Brightspace, deployed-host, cross-browser SCORM, delayed interactions, or full WCAG—not for an in-repository bypass.

Return **GO** only when the code, local reproduction, exact-head push artifacts, and the corresponding PR merge-context artifacts agree that PR #1 is remediation-only and safe to integrate. After that GO and integration, begin the separate inline-text editing branch from the exact integrated commit.
