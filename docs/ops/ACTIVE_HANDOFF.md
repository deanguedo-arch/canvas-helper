# Handoff

- Project: `repo-wide`
- Task: Extend safe Studio inline plain-text editing so it works directly over eligible text in both embedded Studio and Full Preview.
- Status: local keyboard fix ready for its exact-head release gate; publication, exact-head hosted evidence, and independent audit remain.

## Summary

- The existing inline-text baseline is committed at `26216b5a29a0eb1cfc288061a2d5b25bdc2dffb9` on `codex/studio-inline-text-editing-v1`, based on Direct Editing baseline `842213301920798cc1f979c34218e939d4940f61`.
- The current branch head adds parity: eligible text can now be edited with a caret directly at its visual location in both the embedded Studio preview and Full Preview. Opening Full Preview while an embedded caret is active automatically carries that same edit to the Full Preview text; it no longer falls back to the side editor while waiting for a second click. Review & Apply remains synchronized with the same authoritative working draft.
- The Full Preview caret is a trusted Studio-origin host overlay above the isolated learner iframe. It is never a learner-frame `contenteditable` element.
- A startup guard prevents an early Full Preview click from reaching learner controls before the nested inspection shield has confirmed Edit mode. One exclusive visual lease prevents embedded caret, Full Preview caret, and inert child presentation from overlapping.
- Before Apply, typing, Save draft, and preview presentation remain browser-local. Apply retains the established protected write, rebuild, rendered validation, checkpoint, and Undo lifecycle.
- No learner course content or user-owned changes in the original checkout were touched by this linked-worktree follow-up.

## Files changed

- Full Preview bridge contract and trusted host renderer: `app/shared/preview-bridge.ts`, `app/server/preview-bridge-runtime.ts`, and `app/studio/src/hooks/usePreviewScrollSync.ts`.
- Shared visual-owner and canonical draft state: `app/studio/src/hooks/useCourseEditing.ts` and `app/studio/src/App.tsx`.
- Embedded Studio host editor: `app/studio/src/components/CourseInlineTextEditor.tsx`.
- Teacher-facing panel copy: `app/studio/src/components/CourseEditPanel.tsx`.
- Browser proof: `e2e/specs/inspection.spec.ts`.
- Architecture and audit record: `ARCHITECTURE.md`, `docs/audits/2026-08-17-safe-inline-text-editing-v1-audit.md`, and this handoff.

## What changed

- Added a bounded, versioned `studio-set-inline-editor` bridge command and `preview-inline-editor-action` response. They carry only session/revision, opaque target identity, bounded plain text, validated geometry, and safe presentation values.
- Added `standalone-inline` to the single preview-owner state. Embedded Studio uses `parent-inline`; Full Preview uses `standalone-inline`; panel display uses the existing `child-inert`; off-page or detached work has no visual owner.
- Full Preview and embedded Studio now use a broadly compatible Studio-owned `contenteditable` text field with mandatory paste/drop/format filtering, plain-text extraction, and server normalization. This avoids browsers that visually focus `plaintext-only` but reject teacher keystrokes.
- Full Preview's selection keyboard shield now exempts only the trusted host text field. Typing, Escape, and Cmd/Ctrl+Enter reach that field; the learner iframe remains protected from all teacher keyboard events.
- Opening Full Preview from an active embedded editor keeps the durable target, waits for the standalone bridge to be ready, and transfers its caret to the corresponding text in the trusted host. Bounded retries prevent the popup's initial connection race from silently losing the edit.
- Both direct caret surfaces and Review & Apply share the same normalizer, revisions, source-drift handling, saved-draft reopen, Save, Apply, and Undo paths. Full Preview never owns a second persistent or editable copy.
- Screenshot and Review Set capture are blocked while an unapplied embedded or Full Preview interactive caret is visible.

## Verification run

At the committed local implementation state:

- `npm run build:studio` — passed.
- `npm run verify:typecheck-baseline` — passed: exactly the ten established diagnostics and none in changed files. Raw typecheck remains intentionally non-green with that reviewed baseline.
- `E2E_STUDIO_PORT=49391 npx playwright test -c e2e/playwright.release.config.ts --grep "inline edits stay above|opening Full Preview transfers"` — passed. It uses physical keyboard input in embedded Studio and Full Preview, exercises active-caret transfer, synchronized panel changes, Save/Apply/Undo, and proves the learner heading, source bytes, keyboard/input/paste handlers, and browser storage stay unchanged before Apply.
- `npm run test:course-editing` — passed.
- `npm run test:studio-inspection` — passed.
- `npm run test:studio-release` — earlier active-caret-transfer baseline passed at clean commit `c7551075386941886ad7c4dea302b3e10f388ba7`; rerun at the exact keyboard-fix commit before treating this handoff as fresh release evidence.
- `git diff --check` — passed.

## Source of truth

- Audit instructions, supported behavior, and known boundaries: `docs/audits/2026-08-17-safe-inline-text-editing-v1-audit.md`.
- Canonical inline-draft state and visual-owner lease: `app/studio/src/hooks/useCourseEditing.ts`.
- Full Preview trusted-host isolation: `app/server/preview-bridge-runtime.ts`.
- Cross-origin bridge validation: `app/shared/preview-bridge.ts` and `app/studio/src/hooks/usePreviewScrollSync.ts`.
- Existing protected filesystem authority: `app/server/lib/course-editing.ts` and `app/server/routes/course-edits.ts`.

## Fragile areas / watchouts

- Direct in-place typing is intentionally limited to source-safe text-only `h1`–`h6`, `p`, `li`, and `figcaption`. Links, images, rich/nested markup, controls, navigation, simulations, quizzes, runtime-owned content, and ambiguous generated nodes are not newly made directly editable.
- The Full Preview host must remain Studio-owned. Do not move the caret layer into the isolated learner iframe, relay arbitrary teacher keyboard events, or permit selectors, paths, arbitrary CSS, or JavaScript through the bridge.
- The filesystem lock is cooperative among Studio processes; non-participating Codex, Git, manual-editor, or builder writes must not overlap Apply.
- Local verification proves the bounded Studio workflow, not Brightspace/deployed-host behavior, full WCAG, delayed learner interaction, cross-browser SCORM, or the teacher rollout.

## Next prompt should assume

- Both embedded Studio and Full Preview now support the same safe direct plain-text caret experience, synchronized with Review & Apply.
- Keep Apply as the first course-file and course-asset write. Browser-local Save remains non-mutating.
- Preserve the narrow plain-text boundary unless a future, separately designed control safely supports rich text, links, images, styles, or runtime components.

## What still needs validation

- Publish only the scoped committed files listed above, then have an independent auditor inspect the exact resulting head using the audit packet.
- If hosted evidence is required, obtain explicit repository-owner authorization to open a pull request. Do not claim hosted CI until its exact head has completed.
- Before general availability, complete the planned five-teacher/twenty-session rollout plus Brightspace/deployed-host, full-WCAG, delayed-interaction, and cross-browser SCORM acceptance.

## Known risks

- The overlay deliberately mimics the original text but cannot make every visual/runtime surface editable. A green outline remains a selection aid, not write authority.
- Geometry is refreshed over the private bridge while the caret is active. The source and rendered identity still control write authority; a drifted or missing target detaches rather than saving or applying.
- Raw TypeScript typecheck remains expected baseline noise and must never be described as green.

## Exact next command

`npm run test:studio-release`

## Exact next file to open

`app/server/preview-bridge-runtime.ts`

## Do not do next / warnings

- Do not touch `projects/ready-mind/workspace/index.html`, `.runtime/**`, or unrelated files in the original checkout.
- Do not claim universal element-level editability, learner-frame editing, or published/hosted evidence before the scoped commit and authorized CI evidence exist.
- Do not post or resolve GitHub review threads without explicit repository-owner authorization.
