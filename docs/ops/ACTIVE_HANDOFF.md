# Handoff

- Project: `repo-wide`
- Task: Recover unsaved Studio in-place text safely after reload, close, navigation, or preview loss.
- Status: ready for clean exact-head release validation on `codex/studio-unsaved-draft-recovery-v1`.

## Summary

- PR #2 safe inline editing is integrated at `50b29c04901612c9a1a127d3a0f26504884eaa5b` on `codex/studio-roadmap-phases`.
- Recovery implementation is committed at `6e64a85e12c1221496d57def066bf7ef73edceaf` as `feat(studio): recover unsaved inline drafts`.
- Unsaved in-place text now persists only as one bounded, strict, browser-local recovery record per course. It stores durable opaque identity, plain text, optional saved-draft ID, timestamps, and a drift marker—never a canonical patch, preview session, geometry, selector, filesystem path, asset, or learner state.
- On reload or close/reopen, Studio shows **Unsaved text recovered** with **Reopen recovered text**, **Copy text**, and **Discard**. It does not restore a live embedded or Full Preview caret automatically.
- Reopen calls the existing read-only durable target route, then runs normal server canonicalization. Only afterward can the text become an ordinary panel draft. If source drift is detected, the recovery remains detached and requires an explicit rebase. Missing or unsupported targets remain Copy/Discard only.
- A pending recovery blocks selecting or opening a different editable target, preventing a second edit from silently overwriting the teacher’s recovered text. Explicit Discard, Escape, and Full Preview cancel remove only the local recovery record.

## Files changed

- Browser recovery store and strict validator: `app/studio/src/lib/course-edit-storage.ts`.
- Authoritative recovery/reopen/race handling: `app/studio/src/hooks/useCourseEditing.ts`.
- Recovery panel and existing Studio wiring: `app/studio/src/components/CourseEditPanel.tsx`, `app/studio/src/components/InspectorPanel.tsx`, `app/studio/src/App.tsx`, and `app/studio/src/precision-editor.css`.
- Contract and browser proof: `scripts/tests/course-edit-storage.test.ts` and `e2e/specs/inspection.spec.ts`.
- Architecture and audit packet: `ARCHITECTURE.md` and `docs/audits/2026-08-18-studio-unsaved-inline-recovery-v1.md`.

## Verification run

- `node --import tsx --test scripts/tests/course-edit-storage.test.ts` — passed 3/3, including malformed recovery rejection.
- `npm run test:course-editing` — passed 54/54.
- `npm run test:studio-inspection` — passed 172/172.
- `npm run test:e2e -- e2e/specs/inspection.spec.ts --grep "unsaved in-place text survives reload|recovered unsaved text is discarded|external source drift detaches"` — passed 3/3. It verifies reload/reopen, source-drift storage, explicit discard, no-write-before-Apply, and no silent overwrite by a second selected target.
- `npm run build:studio` — passed; existing bundle-size advisory remains non-blocking.
- `npm run verify:typecheck-baseline` previously passed before the final recovery guard; rerun it with the release gate on the final documentation commit. Raw typecheck remains intentionally non-green with the ten established unrelated diagnostics.
- `git diff --check` — passed before documentation handoff updates; rerun before commit.

## Why this changed

Teachers can now type directly at the source-safe text they see. Without recovery, a reload or accidental close could lose unsaved thought-in-progress. The recovery path preserves that text without weakening the central safety boundary: the course remains untouched until protected Apply.

## Source of truth

- Recovery contract and audit: `docs/audits/2026-08-18-studio-unsaved-inline-recovery-v1.md`.
- Authoritative Studio controller: `app/studio/src/hooks/useCourseEditing.ts`.
- Browser-local storage boundary: `app/studio/src/lib/course-edit-storage.ts`.
- Existing protected filesystem authority: `app/server/lib/course-editing.ts` and `app/server/routes/course-edits.ts`.

## Fragile areas / watchouts

- Browser local storage can be denied or cleared. Studio must warn and retain text only for the current tab rather than claim durable recovery.
- The recovery record must remain strictly browser-local and cannot be expanded to contain raw HTML, a patch, selector, path, image bytes, or preview ownership.
- A pending recovery must always be handled before another editable target can become active; otherwise a later typed draft could overwrite it.
- Source drift must continue to preserve the original durable identity across reload so that rebase stays an explicit teacher decision.
- Full Preview must remain a trusted Studio host consumer. Never restore a learner-frame caret or relay teacher input into the course iframe.

## Next prompt should assume

- Safe text can be typed in place at every source-safe mapped label in embedded Studio and Full Preview; structured actions use their contextual composer.
- The new recovery phase is intentionally only for unsaved plain text. It does not add structural editing, automatic source rebase, cross-device synchronization, or new write authority.
- Apply remains the first course-file/course-asset write. Saved drafts and recovery remain browser-local until Apply.

## What still needs validation

- Run the clean exact-head `npm run test:studio-release` after committing the documentation changes.
- Re-run the frozen baseline verifier after the final commit.
- Push this branch and open a focused draft PR only after local release evidence is clean; do not merge it without a separate exact-head review and CI.

## Known risks

- Local tests prove the bounded Studio flow, not Brightspace/deployed-host behavior, full WCAG, delayed learner interactions, cross-browser SCORM, or the five-teacher/twenty-session rollout.
- The filesystem lock remains cooperative for Codex, Git, manual editors, and standalone builders that do not participate in Studio Apply.

## Exact next command

`npm run test:studio-release`

## Exact next file to open

`docs/audits/2026-08-18-studio-unsaved-inline-recovery-v1.md`

## Do not do next / warnings

- Do not touch `projects/ready-mind/workspace/index.html`, `.runtime/**`, or user-owned changes in the original checkout.
- Do not turn recovered text into an automatic course write, automatic caret, or automatic source rebase.
- Do not post or resolve GitHub review threads without explicit authorization.
