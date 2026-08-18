# Handoff

- Project: `repo-wide`
- Task: Make every safe Studio edit-map action usable at the selected learner item in both embedded Studio and Full Preview.
- Status: focused PR CI remediation in progress. A GitHub release-gate run found one Full Preview typing synchronization race; the narrow acknowledgment fix is locally verified and awaiting a clean exact-head release gate.

## Summary

- The existing inline-text baseline is committed at `26216b5a29a0eb1cfc288061a2d5b25bdc2dffb9` on `codex/studio-inline-text-editing-v1`, based on Direct Editing baseline `842213301920798cc1f979c34218e939d4940f61`.
- The current branch expands the in-place contract: every source-safe text label Studio maps as editable—including headings, prose, list items, quotations, captions, static buttons, links, labels, table cells, spans, emphasis, and small text—gets a caret directly at its visual location. Opening Full Preview while an embedded caret is active automatically carries that same edit to the Full Preview text; it no longer falls back to the side editor while waiting for a second click. Review & Apply remains synchronized with the same authoritative working draft.
- A caret is not the right control for nested/rich content, image replacement/alt text, or curated styles. Those mapped actions open the existing capability-specific composer beside the selected item in embedded Studio and at the selected item in Full Preview. A source-safe link begins with a visible-label caret and exposes its destination through the attached **Format & options** control. The composer and Review & Apply use the same validated preview and Save/Apply path.
- The Full Preview caret is a trusted Studio-origin host overlay above the isolated learner iframe. It is never a learner-frame `contenteditable` element.
- A startup guard prevents an early Full Preview click from reaching learner controls before the nested inspection shield has confirmed Edit mode. One exclusive visual lease prevents embedded caret, Full Preview caret, and inert child presentation from overlapping.
- Before Apply, typing, Save draft, and preview presentation remain browser-local. Apply retains the established protected write, rebuild, rendered validation, checkpoint, and Undo lifecycle.
- The Gate 0 catalog verifier exposed a narrow resolver regression for source-safe single-line labels with explicit `<br>` markup. Those elements now fall back to the existing rich-text composer instead of throwing during target resolution; a focused regression test covers the fallback.
- The first hosted PR release gate exposed a Full Preview race: a delayed bridge command could repaint a stale value over active teacher typing. The trusted host now receives the highest input revision Studio has accepted and refuses to repaint until that revision is acknowledged. This preserves the single authoritative draft without loosening the learner-DOM boundary.
- No learner course content or user-owned changes in the original checkout were touched by this linked-worktree follow-up.

## Files changed

- Full Preview bridge contract and trusted host renderer: `app/shared/preview-bridge.ts`, `app/server/preview-bridge-runtime.ts`, and `app/studio/src/hooks/usePreviewScrollSync.ts`.
- Shared visual-owner and canonical draft state: `app/studio/src/hooks/useCourseEditing.ts` and `app/studio/src/App.tsx`.
- Embedded Studio host editors: `app/studio/src/components/CourseInlineTextEditor.tsx`, `app/studio/src/components/CourseInlineTargetEditor.tsx`, and `app/studio/src/components/PreviewPane.tsx`.
- Shared teacher-facing capability composer: `app/studio/src/components/CourseEditPanel.tsx`.
- Browser proof: `e2e/specs/inspection.spec.ts`.
- Architecture and audit record: `ARCHITECTURE.md`, `docs/audits/2026-08-17-safe-inline-text-editing-v1-audit.md`, and this handoff.

## What changed

- Added a bounded, versioned `studio-set-inline-editor` bridge command and `preview-inline-editor-action` response. They carry only session/revision, opaque target identity, bounded plain text, validated geometry, and safe presentation values.
- Added `standalone-inline` to the single preview-owner state. Embedded Studio uses `parent-inline`; Full Preview uses `standalone-inline`; panel display uses the existing `child-inert`; off-page or detached work has no visual owner.
- Full Preview and embedded Studio now use a broadly compatible Studio-owned `contenteditable` text field with mandatory paste/drop/format filtering, plain-text extraction, and server normalization. This avoids browsers that visually focus `plaintext-only` but reject teacher keystrokes.
- Full Preview's selection keyboard shield now exempts only the trusted host text field. Typing, Escape, and Cmd/Ctrl+Enter reach that field; the learner iframe remains protected from all teacher keyboard events.
- Expanded the source-safe caret capability from only common block text to every supported editable text tag whose own source has no nested markup. That provides actual click-and-type behavior for safe static labels without allowing a learner DOM edit.
- Added one reusable capability composer for non-caret targets. It is positioned above the embedded iframe at the selected element, and the existing Full Preview capability panel now positions beside the selected Full Preview element. It carries rich text, link, image, alt text, title, and curated style controls without creating a second draft authority.
- Added an attached **Format & options** control to both direct-caret hosts. It preserves any unsaved text as a browser-local draft before transferring that same target to the capability composer, so a teacher can edit link destinations and formatting without leaving the selected learner item.
- Opening Full Preview from an active embedded editor keeps the durable target, waits for the standalone bridge to be ready, and transfers its caret to the corresponding text in the trusted host. Bounded retries prevent the popup's initial connection race from silently losing the edit.
- Both direct caret surfaces and Review & Apply share the same normalizer, revisions, source-drift handling, saved-draft reopen, Save, Apply, and Undo paths. Full Preview never owns a second persistent or editable copy.
- Full Preview bridge commands now include a bounded `acknowledgedInputRevision`. A duplicate or out-of-order command cannot reset the trusted host field while newer local typing remains unacknowledged.
- Screenshot and Review Set capture are blocked while an unapplied embedded or Full Preview interactive caret is visible.

## Verification run

At the committed local implementation state:

- `npm run build:studio` — passed.
- `npm run verify:typecheck-baseline` — passed: exactly the ten established diagnostics and none in changed files. Raw typecheck remains intentionally non-green with that reviewed baseline.
- `E2E_STUDIO_PORT=49391 npx playwright test -c e2e/playwright.release.config.ts --grep "inline edits stay above|opening Full Preview transfers"` — passed. It uses physical keyboard input in embedded Studio and Full Preview, exercises active-caret transfer, synchronized panel changes, Save/Apply/Undo, and proves the learner heading, source bytes, keyboard/input/paste handlers, and browser storage stay unchanged before Apply.
- `npm run test:course-editing` — passed.
- `npm run test:studio-inspection` — passed.
- `npm run test:e2e -- e2e/specs/inspection.spec.ts --grep "inline edits stay above|structured editable content"` — passed: verified direct typed caret behavior, attached link properties, and structured controls at the selected item in embedded Studio and Full Preview, with no filesystem write before Apply.
- `npm run test:e2e:smoke` — passed.
- `npm run test:e2e:project -- --project e2e-fixture` — passed.
- `npm run verify:course-editing-pilots` — passed 4/4: Direct, English factory, Social factory, and legacy snapshot each completed Apply, rebuild/materialization where applicable, learner render, reload, server restart, Undo, and byte-exact restoration.
- `npm run verify:course-onboarding -- --all` — passed 63/63 after the narrow rich-text composer fallback correction.
- `npm run test:studio-release` — passed at clean exact behavioral commit `621078dd126f8e633b11492a9be7f5eb5f468b0e`: 164 focused contracts, production build, 61 inspection E2E, platform smoke, and strict project contract. The report records `workingTreeClean: true` and `sourceChangedDuringRun: false`.
- `git diff --check` — passed.
- `node --import tsx --test scripts/tests/preview-security.test.ts` — passed after the acknowledgment change, including the bounded bridge-contract regression.
- The Full Preview typing scenario passed five consecutive Chromium repetitions after waiting beyond the normalization debounce, proving that a delayed command does not overwrite the live caret value.

## Source of truth

- Audit instructions, supported behavior, and known boundaries: `docs/audits/2026-08-17-safe-inline-text-editing-v1-audit.md` and `docs/audits/2026-08-18-studio-inline-editing-gate-0-exact-head.md`.
- Canonical inline-draft state and visual-owner lease: `app/studio/src/hooks/useCourseEditing.ts`.
- Full Preview trusted-host isolation: `app/server/preview-bridge-runtime.ts`.
- Cross-origin bridge validation: `app/shared/preview-bridge.ts` and `app/studio/src/hooks/usePreviewScrollSync.ts`.
- Existing protected filesystem authority: `app/server/lib/course-editing.ts` and `app/server/routes/course-edits.ts`.

## Fragile areas / watchouts

- Direct in-place typing is deliberately limited to source-safe plain text in the mapped HTML tags: `h1`–`h6`, `p`, `li`, `blockquote`, `figcaption`, static `button` and `a` labels, `label`, `td`, `th`, `span`, `strong`, `em`, and `small`. Nested/rich content, images, alt text, and curated styles use their attached capability composer rather than a flattening caret. A source-safe link's label gets the caret and its destination is available through **Format & options** at that link.
- Course-title outlines remain a separate **Rename course** action because the safe operation must synchronize all declared title surfaces. Runtime-owned controls, navigation behavior, simulations, quizzes, ambiguous generated content, and unsupported legacy nodes remain Annotation only.
- The Full Preview host must remain Studio-owned. Do not move the caret layer into the isolated learner iframe, relay arbitrary teacher keyboard events, or permit selectors, paths, arbitrary CSS, or JavaScript through the bridge.
- The filesystem lock is cooperative among Studio processes; non-participating Codex, Git, manual-editor, or builder writes must not overlap Apply.
- Local verification proves the bounded Studio workflow, not Brightspace/deployed-host behavior, full WCAG, delayed learner interaction, cross-browser SCORM, or the teacher rollout.

## Next prompt should assume

- Both embedded Studio and Full Preview now expose a control at the selected item for every safe mapped content action: a direct caret for source-safe labels and a contextual capability composer for structured text, links, images, and styles. Review & Apply stays synchronized with that same draft authority.
- Keep Apply as the first course-file and course-asset write. Browser-local Save remains non-mutating.
- Preserve the learner-DOM boundary. Any future control must be Studio-owned and capability-specific; do not turn runtime components into generic contenteditable targets.

## What still needs validation

- Commit and push the focused acknowledgment fix to PR #2, then wait for the exact-head release gate and editability census.
- Do not claim hosted CI until the PR-triggered exact head has completed successfully.
- Before general availability, complete the planned five-teacher/twenty-session rollout plus Brightspace/deployed-host, full-WCAG, delayed-interaction, and cross-browser SCORM acceptance.

## Known risks

- A regular editable outline now has an editing surface at that item, but it is still not write authority. The server continues to re-resolve source ownership and normalize every Save/Apply path.
- Geometry is refreshed over the private bridge while the caret is active. The source and rendered identity still control write authority; a drifted or missing target detaches rather than saving or applying.
- Raw TypeScript typecheck remains expected baseline noise and must never be described as green.

## Exact next command

`gh pr checks --watch`

## Exact next file to open

`docs/audits/2026-08-18-studio-inline-editing-gate-0-exact-head.md`

## Do not do next / warnings

- Do not touch `projects/ready-mind/workspace/index.html`, `.runtime/**`, or unrelated files in the original checkout.
- Do not claim universal element-level editability, learner-frame editing, or published/hosted evidence before the scoped commit and authorized CI evidence exist.
- Do not post or resolve GitHub review threads without explicit repository-owner authorization.
- Do not start unsaved-work recovery or structural authoring until this inline branch is independently reviewed and integrated.
