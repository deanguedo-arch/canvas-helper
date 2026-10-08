# Reusable Codex integration prompt

Implement only the exact chapter and lesson IDs marked APPROVED FOR INTEGRATION in the attached Biology 30 batch manifest. Read `02_TEACHING_STANDARD.md`, the approved manuscripts, integration map, source manifest, asset statuses, preservation contracts, and applicable repository guidance.

## Preflight
Confirm the real target files and compare the current source with the handoff's pinned revision and relevant local-file hashes. Report drift and reconcile only safe nonconflicting changes. Do not overwrite unrelated modifications, edit a historical copy by assumption, or write generated output while ignoring its authored owner. If the attached batch has not actually been approved, do not treat it as approved.

## Integration contract
Implement the supplied learner-facing copy and sequence faithfully in the existing approved shell. Do not paraphrase, summarize, compress, change examples or answers, remove explanatory steps, or substitute your own teaching. Make only necessary markup/accessibility integration changes that preserve meaning. Report a substantive scientific or implementation conflict with a proposed correction rather than silently changing the manuscript or implementing a known error.

Preserve layout and styling, navigation, vocabulary/popups, textbook viewer and printed-to-PDF-page mapping, existing visuals and locked label mappings, required checks and answer keys, practice behaviour, Process Collection/notebook fields, print/export, backup, Save and Exit, SCORM save/resume, progress semantics, and teacher controls where present. Respect features intentionally absent from the current version. Do not add a parallel renderer, state owner, new completion gate, or grading system.

New formative questions use unique namespaced IDs and established interaction patterns. They must not overwrite old responses or silently change grades/completion. Retain existing question IDs and semantics; route splits/merges or a materially changed question need an explicitly approved mapping and state strategy. Make genuinely shared changes at the shared owner, with regression checks on all affected chapters.

Place media at the prescribed teaching moment with its caption, alt text, learner-facing explanation, and resource prompts. Never treat a storyboard as a delivered image. Do not publish missing-asset placeholders or claim a proposed recording exists. Keep affected lessons blocked from release while completing unaffected approved work.

## Verify the actual build
Compare rendered learner-facing content with the approved manuscript, checking for omitted blocks, changed wording, missing worked steps, mismatched feedback, and reordered concepts. Source text checks alone are insufficient when rendering can omit content.

Run existing project validation/build/export tests and relevant browser checks. Verify a fresh session and representative saved-state fixtures, answer/label mappings, required checks, notebook/Process Collection responses, save/exit and resume, reader links/page targets, vocabulary targets, media/assets, keyboard operation, desktop and approximately 390-pixel mobile layouts, and print output. Use the established SCORM testing path. Separate local emulation from actual Brightspace testing; unperformed tests remain UNTESTED. Do not erase stored work to make a test pass.

## Return
Provide the changed-file list, implementation diff summary, actual build/package outputs, representative rendered evidence, commands/tests run and results, preservation checks, unresolved issues, and any tests requiring the LMS. Keep authoring approval, integration completion, technical acceptance, and teacher acceptance separate in the tracker.

Do not proceed into the next batch, redesign the shell, commit/push/deploy, or declare all Chapters 11–20 complete unless separately authorized. Stop at this batch boundary with an accurate report.
