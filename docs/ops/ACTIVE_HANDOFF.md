# Handoff

- Project: `repo-wide`
- Task: Deliver the separate safe inline plain-text editing follow-up for Canvas Studio.
- Status: ready for independent audit and exact-head CI after publication.

## Summary

- The implementation is committed at `26216b5a29a0eb1cfc288061a2d5b25bdc2dffb9` on `codex/studio-inline-text-editing-v1`, based on the integrated Direct Editing baseline `842213301920798cc1f979c34218e939d4940f61`.
- Embedded Studio now offers a Studio-owned in-place caret for source-safe plain-text headings, paragraphs, list items, and captions. It never makes the learner element editable or changes course files before Apply.
- Review & Apply and the parent in-place editor share one canonical working-draft controller. Saved drafts reopen through durable identity and can be edited off-page with an explicit preview-unavailable state.
- Full Preview is deliberately display-only: it may show the normalized inert overlay, but it offers no caret or mutation controls.
- The complete local Studio release gate passed. Raw TypeScript typecheck remains honestly red only for the established ten unrelated diagnostics; the frozen baseline verifier passed.

## Files changed

- Browser/server editing contracts and canonical normalization: `app/shared/course-editing.ts`, `app/server/lib/course-editing.ts`, `app/server/routes/course-edits.ts`, `app/server/studio-server.ts`, and `scripts/lib/course-editing/html.ts`.
- Safe bridge and standalone handoff: `app/shared/preview-bridge.ts`, `app/server/preview-bridge-runtime.ts`, and `app/studio/src/hooks/usePreviewScrollSync.ts`.
- Studio interaction: `app/studio/src/hooks/useCourseEditing.ts`, `app/studio/src/App.tsx`, `app/studio/src/components/CourseInlineTextEditor.tsx`, `app/studio/src/components/CourseEditPanel.tsx`, `app/studio/src/components/InspectorPanel.tsx`, `app/studio/src/components/PreviewPane.tsx`, and `app/studio/src/precision-editor.css`.
- Regression evidence: `e2e/specs/inspection.spec.ts`, `scripts/tests/course-editing.test.ts`, and `scripts/tests/studio-architecture.test.ts`.
- Audit and operational record: `docs/audits/2026-08-17-safe-inline-text-editing-v1-audit.md`, `ARCHITECTURE.md`, and this handoff.

## What changed

- Added bounded `POST /api/course-edits/normalize`, which re-resolves durable target identity and returns canonical plain text, patch, digest, representation, and current target without a filesystem write.
- Added a single shared controller with 200 ms revision-safe normalization, Save/Cmd-Ctrl-Enter flush, shared saved/unsaved draft editing, periodic source revalidation, and detached/reopen/rebase recovery after source drift.
- Added a parent-owned `plaintext-only` in-place editor. Paste becomes text; paragraph line breaks normalize to `<br>`; headings, list items, and captions stay single-line.
- Added one visual-owner contract: active caret is parent-owned, panel/saved/full-preview presentation is child-inert, and off-page/detached work has no visual owner.
- Fixed Full Preview state handoff so a newly ready standalone surface receives the canonical display command without replaying the same revision into an already-rendered embedded surface. The standalone child handshake is bounded and retried safely through the initial iframe race.
- Full Preview editing is explicitly blocked while retaining normalized display-only preview.

## Why this changed

- Teachers asked to edit text visually where it appears while still being able to revise the same change in Review & Apply.
- A trusted Studio overlay preserves learner DOM identity, listeners, forms, completion state, and browser storage until the existing protected Apply lifecycle.
- Durable server normalization, source drift recovery, and one display owner prevent optimistic UI from becoming a false edit or overwriting newer course work.

## Source of truth

- Audit instructions, claims, commands, and remaining limits: `docs/audits/2026-08-17-safe-inline-text-editing-v1-audit.md`.
- Canonical inline-draft state: `app/studio/src/hooks/useCourseEditing.ts`.
- Server authority: `app/server/lib/course-editing.ts` and `app/server/routes/course-edits.ts`.
- Learner isolation and display bridge: `app/studio/src/components/CourseInlineTextEditor.tsx`, `app/server/preview-bridge-runtime.ts`, and `app/studio/src/hooks/usePreviewScrollSync.ts`.

## Fragile areas / watchouts

- The initial inline surface is intentionally limited to text-only `h1`–`h6`, `p`, `li`, and `figcaption`; it is not evidence that every legacy element is directly editable.
- Full Preview has no caret by design. A future exclusive editing-lease change is required before direct Full Preview typing can be considered.
- The filesystem lock coordinates Studio processes, not arbitrary Codex, Git, manual-editor, or standalone-builder writers. Those writers must not run during Apply.
- Local gates prove the bounded local workflow, not Brightspace/deployed-host behavior, full WCAG, delayed learner interactions, cross-browser SCORM, or the teacher rollout.

## Next prompt should assume

- The branch is ready for an independent code audit after the commits are published; use the audit packet rather than claiming general availability.
- Preserve the plain-text-only boundary and do not broaden to rich text, links, images, styles, or Full Preview caret editing in this follow-up without a separate design and audit.
- Keep Apply as the first course-file and course-asset mutation. Browser-local Save is not permission to write a project.

## What still needs validation

- Push this exact branch, then inspect the exact-head CI evidence for the final published SHA.
- Obtain an independent audit verdict using `docs/audits/2026-08-17-safe-inline-text-editing-v1-audit.md`.
- Before general availability, run the planned five-teacher/twenty-session rollout and separate Brightspace/deployed-host/cross-browser SCORM acceptance.

## Known risks

- The safe user experience is strong for ordinary plain text, but it does not make runtime-owned content, generated ambiguous siblings, navigation, simulations, quizzes, or arbitrary styled markup editable.
- A failed raw typecheck should remain reported as expected baseline noise, never as green. The verifier is the passing gate for no new diagnostics.

## Exact next command

`gh run list --branch codex/studio-inline-text-editing-v1 --limit 10`

## Exact next file to open

`docs/audits/2026-08-17-safe-inline-text-editing-v1-audit.md`

## Do not do next / warnings

- Do not edit `projects/ready-mind/workspace/index.html` or any unrelated user-owned file in the original checkout; this follow-up was isolated in a linked worktree.
- Do not call raw typecheck green, make a universal-editability claim, or describe Full Preview as caret-editable.
- Do not post or resolve GitHub review threads without explicit repository-owner authorization.
