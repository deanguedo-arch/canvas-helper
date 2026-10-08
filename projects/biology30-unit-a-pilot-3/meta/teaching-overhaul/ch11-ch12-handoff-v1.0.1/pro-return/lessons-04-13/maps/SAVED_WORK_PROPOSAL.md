# Proposed native saved-work realization

Status: a contract for later authorized implementation, not working controls. The nineteen new response surfaces in these fragments are disabled and use data-proposed-activity/data-proposed-writing, never live data-activity/data-writing. Nothing in the preview saves, grades, creates attempts, changes required progress or opens vocabulary dialogs. No runtime code was edited.

## Actual owner read

Chapter11 owner is native/index.html, SHA-2569fcd8203b41f4220e53716e473c02a0835f356420b363ea0092e544a8e7bb210. Current native/assets/pilot3-runtime.js functions current/snapshot/complete/progress/promptText and click handlers were inspected. Unlike the Chapter17 reference, this chapter stores written work under native activity runs using data-writing, data-question and data-activity. Do not add data-note-input or a second state owner.

## Exact control and identity proposal for each new task

PRACTICE_MAP.json supplies nineteen distinct base IDs and the complete actual prompt/stimulus/hint/model/criteria/recovery feedback. For each base ID:

- Outer section.activity: data-activity=baseID, data-activity-mode=writing, no data-required-check
- Heading uses the proposed task title; directions state optional, ungraded work and explain the native run timer. Use one independent activity per task, avoiding a combined set that requires completion of unrelated tasks
- Start button data-start, output data-timer
- Native fieldset data-run-body begins disabled until Start
- One .question with data-question=baseID-question contains the complete actual stimulus/prompt, label and response control, with no answer text
- textarea id/data-writing=baseID-written, data-answer-limit=3200, six rows; aria-describedby links baseID-written-limit and baseID-written-status. Limit text must explain that writing is not automatically graded
- Save written response button data-submit-writing; p[data-writing-status] id=baseID-written-status role=status
- Hints, model answer, criteria and recovery feedback remain deliberate details/summary disclosures OUTSIDE .question, but inside the activity, so runtime promptText does not save the model answer as part of the student's prompt
- Submit and finish button data-submit-run; Redo activity button data-redo, initially hidden; p[data-run-status] role=status

Sequence: Start; examine the supplied stimulus; enter an explanation; Save written response; open an optional hint or model when wanted; compare using explicit criteria; revise and save if desired; Submit and finish when that task is complete. The model remains learner-controlled and does not claim automated evaluation. Do not add a correct-answer unlock to these writing-only activities.

## State, history and progress constraints

Reuse existing activity-run draft/submitted/history ownership and existing All My Work rendering. The actual runtime snapshots fields by data-writing, checks writing completion against saved attempts, and derives required progress from sections marked data-required-check. The new optional IDs must therefore be absent from required lists and must not replace any original item ID, catalog key or previous attempt. A writing attempt retains correct:null under the current owner; never convert its completed status into a science score.

Do not delete or rebind existing optional source sets, labeling tasks, generated instances, vocabulary Frayers or Process Collection items. The full original suffix remains exact. Native conflict handling, failure protections, namespace, restore/import, timer, print/export and SCORM behavior remain owned by current code. If realization requires any broader schema/runtime change than this existing contract, stop and propose that difference rather than silently implementing it.

## Required evidence after separate implementation approval

For EACH new task: inspect actual supplied stimulus; start; enter distinct synthetic work; save; navigate/reload; confirm draft/submitted restoration; confirm All My Work content; reveal hint/model; revise and save; submit; redo without losing prior attempt; verify output/printing and unchanged twelve-check progress. Check fresh and resumed sessions, over-limit preservation and failed-save behavior using the native test approach. Test at desktop/mobile widths and with keyboard controls. Native LMS/SCORM behavior requires its own test environment. None of these tests are passed by this static proposal.
