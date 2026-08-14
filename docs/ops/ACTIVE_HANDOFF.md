# Handoff

- Project: `repo-wide`
- Task: Implement measured real-time Studio editability, beginning with a read-only element-level coverage census and followed by ephemeral preview for already-safe patches.
- Status: not started

## Publication and review state

- Branch: `codex/studio-direct-editing-v1`
- Focused PR: `https://github.com/deanguedo-arch/canvas-helper/pull/1`
- Reviewed source head: `e71241433e173c7617dbf5ea5e5ddcc5bf712c11`
- Last exact-head planning baseline: `392298937102be216d4d3fc24da1c322ce280a36`
- Independent verdict: **GREEN / GO**
- Exact-head run `31763552248` and PR-merge run `31763554764` passed the complete release gate for `39229893`.
- PR #1 is open, clean, and ready for review. It has not been merged; merge remains a repository-owner action.
- Next-plan source: `docs/plans/2026-08-13-studio-real-time-editability-and-rollout.md`
- ChatGPT Pro audit protocol: `docs/audits/2026-08-13-chatgpt-pro-real-time-editability-audit-plan.md`
- Verdict record: `docs/audits/2026-08-13-studio-direct-editing-green-go-verdict.md`

## Files changed

- `docs/plans/2026-08-13-studio-real-time-editability-and-rollout.md`
- `docs/audits/2026-08-13-chatgpt-pro-real-time-editability-audit-plan.md`
- `docs/audits/2026-08-13-studio-direct-editing-green-go-verdict.md`
- `docs/audits/2026-08-13-chatgpt-studio-course-editing-audit-brief.md`
- `docs/audits/2026-08-12-studio-direct-editing-rollout-hardening.md`
- `docs/releases/2026-08-12-canvas-studio-direct-editing.md`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed

- The independent follow-up at exact head `e7124143` is recorded as **GREEN / GO** and supersedes the prior NO-GO.
- The accepted implementation closures are recorded separately from accepted boundaries: cooperative locking, bounded render settlement, edited-target rather than full-WCAG checks, and external Brightspace/cross-browser acceptance.
- The former safety-remediation handoff is archived.
- A phased real-time plan defines immediate unsaved preview as an ephemeral presentation layer; Apply remains the only filesystem mutation path.
- The first implementation phase is a read-only element-level census across every declared learner page.
- New Codex-created courses target at least 90% of routine teacher-authored content, with 100% honest editable-or-Annotation-only classification.
- Legacy targets receive no guessed percentage. Census reasons determine mapping, data-ownership, component-editor, or intentional Annotation-only queues.
- The controlled rollout calls for the four accepted adapters, six additional high-use courses, and at least twenty real teacher edit sessions with zero silent corruption.
- The ChatGPT Pro audit protocol separates the inherited GREEN safety baseline from five future checkpoints: census, ephemeral preview, fresh-course threshold, legacy migration, and teacher rollout.
- The protocol requires raw element numerators/denominators and explicitly rejects `50 / 63` as an element-editability percentage or `90–95%` as a current product claim.

## Why this changed

- Course-level acceptance proves that 50 of 63 enabled projects can complete a reversible edit, but it does not measure how much ordinary content is editable on each page.
- Instant visual feedback can improve teacher confidence without weakening source authority if it stays temporary until Save draft and Apply.
- The independent auditor recommended real teacher use rather than more hypothetical architecture hardening.
- The audit verdict must be reflected in the repository before the next implementation begins.
- A second independent review needs exact claim language, evidence hierarchy, adversarial cases, severity definitions, and stop conditions so a plan or green package script is not mistaken for implementation proof.

## Source of truth

- Product and delivery plan: `docs/plans/2026-08-13-studio-real-time-editability-and-rollout.md`.
- Independent checkpoint protocol and copy-ready prompt: `docs/audits/2026-08-13-chatgpt-pro-real-time-editability-audit-plan.md`.
- Independent disposition: `docs/audits/2026-08-13-studio-direct-editing-green-go-verdict.md`.
- Edit-map and candidate ownership: `app/server/lib/preview-inspection.ts` and `app/shared/course-editing.ts`.
- Private browser contract: `app/shared/preview-bridge.ts` and `app/server/preview-bridge-runtime.ts`.
- Studio edit orchestration: `app/studio/src/hooks/useCourseEditing.ts`.
- Teacher editor surface: `app/studio/src/components/CourseEditPanel.tsx`.
- Apply, rendered validation, recovery, and Undo: `app/server/lib/course-editing.ts`, `app/server/lib/course-edit-render-validation.ts`, and `app/server/lib/course-edit-transaction.ts`.
- New-course authoring contract: `scripts/lib/codex-course.ts` and `docs/workflows/codex-studio-course.md`.

## Fragile areas / watchouts

- The current CourseEditPageMap counts mapped targets, not a normalized routine-teacher-content denominator. Do not publish element percentages until the census defines and tests that denominator.
- The audit protocol is a review specification, not evidence that the census, preview bridge, or 90% fresh-course gate exists.
- The visual map remains informational. A coverage collector or ephemeral preview must never become write authorization.
- Live preview must not change course localStorage, form responses, completion state, event handlers, or runtime data.
- English and Social workspaces remain generated output. Preview and Apply patches must continue through stored overrides and the owning factory.
- Snapshot courses preserve their current workspace baseline; quarantined historical builders remain off-limits.
- The Direct lock is cooperative. Codex, Git, manual editors, and standalone builders must not race Apply.
- An ancient pre-fix directory-format lock may require explicit manual cleanup; fail closed rather than guessing.
- User-owned duplicate/conflict files, local resource archives, and factory transaction directories remain unstaged and must not be cleaned.

## Next prompt should assume

- Direct Editing safety remediation is complete and independently approved.
- PR #1 has not been merged by this planning task.
- Real-time means immediate unsaved visual preview, not per-keystroke filesystem writes.
- The first implementation is Phase 1 coverage measurement only; do not combine it with bridge/UI mutation.
- The planned command `npm run report:course-editability -- --all` does not exist yet.
- Existing catalog truth is 66 tracked project directories, 65 manifests, and 63 enabled source-backed projects.
- Existing course-level outcomes are 50 reversible passes, 12 no-source-owned-text-target, and one no-learner-stable-text-target.
- ChatGPT Pro should use `docs/audits/2026-08-13-chatgpt-pro-real-time-editability-audit-plan.md` and return `NOT AUDITABLE YET` for any future checkpoint whose code/evidence has not landed.

## What still needs validation

- The repository owner must decide when to merge PR #1.
- Phase 1 must define, test, and run the read-only all-page coverage report before any percentage is used as a target for legacy courses.
- Brightspace upload, deployed-host behavior, and cross-browser SCORM save/restore remain separate per-export acceptance.
- Controlled teacher rollout has not started.
- Any commit after the verified `39229893` baseline needs its own exact-head and PR-merge evidence; do not reuse older green run IDs as proof for a newer SHA.

## Known risks

- A raw DOM percentage can be gamed by wrappers or runtime nodes; use the routine teacher-content denominator.
- Ephemeral DOM changes can diverge from rebuilt output if preview and Apply sanitizers differ; keep one patch contract and test parity.
- Runtime-heavy legacy courses may remain Annotation only until canonical data ownership or a dedicated component editor exists.
- A teacher can confuse unsaved preview with applied source unless the UI shows clear Preview, Draft, Applying, Applied, and Rejected states.
- Documentation-only changes after `e7124143` move the PR head even though runtime code is unchanged; use current PR checks as publication evidence.
- An auditor may accidentally approve product claims from this thorough plan alone; require implementation, exact-head reports, and observed browser behavior for every checkpoint.

## Exact next command

`rg -n "CourseEditPageMap|editableCount|annotationOnlyCount|resolveCourseEditPageMap" app/shared/course-editing.ts app/server/lib/preview-inspection.ts scripts/lib scripts/tests`

## Exact next file to open

`docs/plans/2026-08-13-studio-real-time-editability-and-rollout.md`

## Do not do next / warnings

- Do not merge PR #1 without repository-owner authorization.
- Do not implement live preview before the read-only coverage denominator and report are tested.
- Do not tell ChatGPT Pro that the audit protocol itself proves real-time editing or the 90% threshold.
- Do not create editability by flag, DOM mutation, or percentage.
- Do not write course files while the teacher types.
- Do not weaken current Apply, rendered-result, accessibility, recovery, or Undo gates.
- Do not run quarantined legacy rebuild commands.
- Do not clean or broadly stage unrelated user-owned local files.
