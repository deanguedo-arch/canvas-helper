# Chapter 11 lessons 04–05: manuscript checkpoint v1

Status: complete draft teaching copy and inert reading fragments, not teacher-approved or integrated. Source owner SHA-256 is 9fcd8203b41f4220e53716e473c02a0835f356420b363ea0092e544a8e7bb210. The actual owner is unchanged.

## What is present
- Full learner manuscripts, native-style fragments, reading previews and section-by-section integration JSON for both lessons
- Exact original figure blocks and asset copies; all new practice has a supplied stimulus, distinct proposed ID, in-place disabled preview response, optional hint, intentional model reveal, explicit criteria and recovery feedback
- Three original lesson04 and five original lesson05 top-level teaching wrappers retained. Their opening tags contain no IDs or edit keys. Original figure blocks retain their own existing edit keys byte-for-byte. All header, video, graded and optional activity, navigation and suffix bytes are outside the proposed replacements

## Source and outcome chain
- 30–A1.1k, actual supplied Alberta Biology20–30 program printed52: membrane action potential, all-or-none and intensity. Lessons04–05 also support model/data interpretation in30–A1.3s, printed53. Reading an illustration is not certification of a physical investigation
- Lesson04 measure/gradients/maintain: textbook printed373–375/PDF14–16, Figures11.11–11.12; teacher slides22–23; current three teaching sections and Figure6. Distinguishes two-electrode voltage, concentrations, electrochemical movement, leak versus pump,3Na out/2K in and immediate versus longer-term effects. Worked−70→−60 reading; guided−65→−80; independent stopped-pump model
- Lesson05 threshold/graph/recovery/propagation/coding: textbook376–380/PDF17–21, Figures11.13–11.16; slides24–30; current Figures7–8. Current corrected science retained over historical shortcuts. Worked threshold timing, identical voltage/different phase, local myelin failure and count/time comparison. Guided refractory response; independent changed recording duration plus recruitment
- Source practice and required items retain wording/options/keys/IDs. Source overlap is deliberate review, not fresh assessment. Fresh proposed formative IDs are ch11-scout-v1-l04-guided, l04-transfer, l05-guided, l05-transfer

## Figure use and limits
- Figure6 copied pixels directly inspected: outside above, inside below; orangeNa, purpleK, negative proteins, leak arrows and3/2pump. Relative icon counts are not measured concentrations
- Figure7 copied pixels directly inspected: peak labelled about+30mV, time axis0–5ms, resting−70 and threshold−55. Its refractory prose is overbroad; the adjacent candidate explicitly separates absolute/relative and warns against treating the undershoot as the entire recovery interval. Original figure itself not edited; approval to revise that embedded wording is separately advisable
- Figure8 source SVG retained exact. Equal-time comparison is taught; the new task changes time and number of neurons rather than merely changing counts
- Existing videos remain outside replaced sections and are not newly playback-tested. Essential teaching is complete without them

## New work control proposal, binding to actual Chapter11 runtime
Each proposed formative item should become a separate OPTIONAL section.activity[data-activity="proposed-ID"][data-activity-mode="writing"], with no data-required-check. Use native data-start/timer, data-run-body, one .question[data-question="proposed-ID-question"], textarea[data-writing="proposed-ID-written"][data-answer-limit="3200"], data-submit-writing/status, data-submit-run and data-redo/run-status. Keep stimulus/question inside .question; put hint/model/criteria/feedback details outside .question but inside the activity so promptText does not add the answer to attempt records. No data-note contract is proposed: Chapter11 runtime actual snapshot/complete/submit uses data-writing.

Sequence: Start → inspect stimulus → enter response → Save written response → deliberately open hint/model when wanted → revise and save if needed → Submit and finish. Completion records only this optional activity, and adds nothing to twelve required checks. Use existing All My Work/history renderer and immutable attempts. Do not assert this behavior is implemented. No schema/runtime change, new grader or gate is proposed. Per-item entry/save/reload/history/model/redo/print and unchanged required-progress tests are pending.

## Remaining review
Independent first-time-reader/content review; precise retained vocabulary button placement; static source-copy validation; desktop/mobile/keyboard rendering; all save/restore tests; LMS testing; teacher exact-copy approval; separately authorized future integration. Header directions and protected question/key issues require separate decisions. No release pass is claimed.
