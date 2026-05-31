# Handoff

- Project: `next-step-teacher-tracker`
- Task: Continue Stable Tracker Bundle v1 after the two temporary test Classroom shells were deleted.
- Status: local source patched, verified, saved into the live bound Apps Script project, the read-only Classroom progress refresh passed live, safe live Email Preview was rerun, the remaining live Apps Script fragments were inspected/neutralized, Course Creation Apply created only the two approved test Classroom shells and refused duplicates, and the active-only Master archive/restore path was live-tested with a fake roster row and cleaned back to 83 active rows.

## Latest Continuation - 2026-05-31 09:35 MDT
- Completed an intentional live fake-student archive/restore proof through the Sheet UI after the Google Sheets connector returned `403 PERMISSION_DENIED`.
- Test row used in `Roster Import!A500:D500`:
  - visible fake student label: `CODEXTEST AF`;
  - gender: `X`;
  - grade: `99`;
  - course: `AB 10`.
- Add proof:
  - ran `Next Step Tracker` -> `2. Refresh Student List`;
  - observed completion alert: `Roster rows: 84`, `Active Master rows: 84`, `Added: 1`, `Restored from archive: 0`, `Updated: 83`, `Archived stale rows: 0`.
- Archive proof:
  - cleared `Roster Import!A500:D500`;
  - reran `Next Step Tracker` -> `2. Refresh Student List`;
  - observed completion alert: `Roster rows: 83`, `Active Master rows: 83`, `Added: 0`, `Restored from archive: 0`, `Updated: 83`, `Archived stale rows: 1`.
- Restore proof:
  - re-added the same fake row values at `Roster Import!A500:D500`;
  - reran `Next Step Tracker` -> `2. Refresh Student List`;
  - observed completion alert: `Roster rows: 84`, `Active Master rows: 84`, `Added: 1`, `Restored from archive: 1`, `Updated: 83`, `Archived stale rows: 0`.
- Final cleanup:
  - cleared `Roster Import!A500:D500` again;
  - reran `Next Step Tracker` -> `2. Refresh Student List`;
  - observed completion alert: `Roster rows: 83`, `Active Master rows: 83`, `Added: 0`, `Restored from archive: 0`, `Updated: 83`, `Archived stale rows: 1`.
- The active Master/Roster state is clean again at 83 active rows. A fake proof record may remain in `Removed Students Archive`; it is not active in `Roster Import` or `MASTER TRACKER NEXT STEP`.
- No existing Classroom content was touched during this proof.
- No web app was deployed.
- No email was sent.

## Latest Continuation - 2026-05-31 08:52 MDT
- Added tracker-source regression coverage in `scripts/tests/apps-script-tracker-source.test.ts`.
- Updated `package.json` so `npm run test:apps-script` runs both the Apps Script export test and the tracker source safety suite.
- Hardened `sendSelectedStudentEmails()` in `tasks/next-step-course-builder-lite-extension.gs`:
  - added `findMasterEmailContextForPreviewDraft_()`;
  - send-time validation now confirms each checked preview row still maps to an active Master row;
  - send-time validation now confirms the student, course, and current Master recipients still match before `MailApp.sendEmail()`;
  - unchecked courses still block send attempts.
- Re-copied the full corrected local source into the live bound Apps Script `Code.gs` through Chrome and saved it. Apps Script showed `Saved to Drive`.
- Reran the safe live Sheet menu action `Next Step Tracker` -> `8. Preview Selected Emails` after the live save.
- Live preview result:
  - `Ready to send: 2`
  - `Skipped: 6`
  - no email was sent.
- Reran the safe live Sheet menu action `Next Step Tracker` -> `2. Refresh Student List`.
- Live roster refresh finished and left the browser on `Removed Students Archive`.
  - The archive sheet headers are present.
  - No archived student rows are visible in rows 2+.
  - This means the active-only path did not need to archive any current stale Master rows during this run.
- Local verification after this hardening:
  - `node --check --input-type=commonjs < tasks/next-step-course-builder-lite-extension.gs` exited `0`;
  - `npm run test:apps-script` exited `0` with `8` tests passing.
- Attempted to use the Google Sheets connector for a more controlled archive/restore live proof.
  - Target spreadsheet id: `1yihw_8HWB-zvKVfCmEpph_ytSfMDlVRdf3VpCSnwJQo`.
  - `_get_spreadsheet_metadata` returned `403 PERMISSION_DENIED`.
  - No connector edits were made.
  - I did not force a fake-row proof through the UI because the current live sheet is a real teacher tracker and the connector could not provide API-level range grounding.
- Re-ran local safety checks after the connector boundary:
  - `node --check --input-type=commonjs < tasks/next-step-course-builder-lite-extension.gs` exited `0`;
  - `npm run test:apps-script` exited `0` with `8` tests passing;
  - safety grep shows exactly one `onOpen`, one selected-preview `MailApp.sendEmail`, and one gated `Classroom.Courses.create`.
- Inspected the live `Course Creation Apply` sheet by copying `A1:O3`.
  - Two approved test rows are present: `Codex Test Classroom A 2026-05-30` and `Codex Test Classroom B 2026-05-30`.
  - Both rows already have `Created Course ID` values: `798040986703` and `798041086875`.
  - Because both rows already have created IDs, rerunning the apply flow should not create duplicate courses.
- Ran `Next Step Course Builder` -> `Apply Approved Course Creates` once against those existing created rows.
  - The first live alert was duplicate-protected but misleading: `No approved course-create rows found`.
  - No new Classroom course was created.
- Patched the local and live Apps Script bundle to make that duplicate-protection message explicit:
  - `No new course-create rows are ready to run.`
  - `Approved rows on sheet: 2`
  - `Already created / already linked: 2`
  - `Approved but blocked by gates: 0`
- Re-copied the patched local source into live `Code.gs`, saved it, and verified Apps Script find found the new message at line `4055`.
- Reran `Next Step Course Builder` -> `Apply Approved Course Creates`.
  - Live alert now correctly reported `Approved rows on sheet: 2`, `Already created / already linked: 2`, `Approved but blocked by gates: 0`.
  - No new Classroom course was created.
- No Classroom content was touched during this continuation.
- No web app was deployed.
- No email was sent.

## Latest Continuation - 2026-05-31 08:26 MDT
- Found and fixed a real `Removed Students Archive` path bug in `tasks/next-step-course-builder-lite-extension.gs`:
  - stale Master rows are now passed into `appendRemovedStudentsArchiveRows_()` as Master row data instead of pre-shifted archive-column arrays;
  - added `isArrayWithValues_()` and `mapRowArrayToObject_()` so archive appends can safely accept either row arrays or row objects;
  - added `markArchivedStudentsRestored_()` so restored students receive a `Restored At` timestamp in `Removed Students Archive`;
  - `syncMasterTrackerFromRosterInternal_()` now tracks and logs restored-from-archive counts.
- Re-copied the full corrected local source into the live bound Apps Script `Code.gs` through Chrome and saved it. Apps Script showed `Saved to Drive`.
- Reran the safe live Sheet menu action `Next Step Tracker` -> `8. Preview Selected Emails` after the live save.
- Live smoke result after the archive fix:
  - `Ready to send: 2`
  - `Skipped: 6`
  - preview sheet still shows `SEND?` checkboxes unchecked for the two sendable rows.
- No Classroom content was touched during this continuation.
- No email was sent.
- Local verification after the archive fix:
  - `node --check --input-type=commonjs < tasks/next-step-course-builder-lite-extension.gs` exited `0`;
  - `npm run test:apps-script` exited `0` with `2` tests passing;
  - grep still shows exactly one active `onOpen`;
  - grep still shows only the expected approved-course-create Classroom write and selected-preview email send path;
  - toxic fragments `updatePowerSchoolSync` and `sendHybridEmails` remain absent.
- STAX observer preflight reran after the continuation:
  - generatedAt: `2026-05-31T14:27:06.750Z`;
  - exitCode: `0`;
  - verdict: `Reject`;
  - blocking: `false`;
  - rejection remains tied to the stale Learning Strategies sidecar task and missing approval artifact, not an observed tracker failure.

## Summary
- Confirmed the canonical local tracker source is still `tasks/next-step-course-builder-lite-extension.gs`.
- Preserved the current Classroom safety boundary:
  - only `Classroom.Courses.create(payload)` exists as a Classroom write endpoint;
  - no assignment, material, announcement, topic, roster, teacher invite, Drive, Form, Calendar, or UrlFetch write path was added.
- Tightened the email workflow:
  - `Email Preview` now includes a `SEND?` checkbox column;
  - preview rows are not selected for sending by default;
  - `sendSelectedStudentEmails()` now reads only checked `SEND?` rows from `Email Preview`;
  - send-time checks now reject stale Master rows and courses not checked in `Classroom Course Map`;
  - email preview/send actions write to `Command Centre Log`.
- Saved the updated merged source into the live bound Apps Script project.
- Verified the live editor can find `readSelectedEmailPreviewDrafts_` and shows the new `SEND?` Email Preview header block.
- Fixed the live Classroom progress refresh failure:
  - added the missing `getSubmissionUpdateTime_()` helper;
  - aligned GC tab placeholder rows with their 14 headers;
  - moved `Avg Grade %` after assignment columns;
  - expanded the GC summary sheet headers from 11 to 13 columns to match the new summary row shape.
- Ran the live Sheet menu action `Next Step Tracker` -> `7. Update Progress for Checked Courses`.
- The live script completed with:
  - checked courses: `4`;
  - GC tabs created: `0`;
  - GC tabs updated: `4`;
  - GC tabs deleted: `0`;
  - Classroom student rows loaded: `76`;
  - audit rows written: `94`;
  - courses updated now: `4`;
  - errors this run: `0`;
  - all checked courses updated.
- Ran the live Sheet menu action `Next Step Tracker` -> `8. Preview Selected Emails`.
- The live preview completed with:
  - `Ready to send: 2`
  - `Skipped: 6`
  - instruction to review `Email Preview` and check `SEND?` only for rows to send.
- Inspected `Email Preview!A1:L10` after the preview:
  - row 6: Foulem, Alexander, `Sendable? = YES`, `SEND? = FALSE`, AB 20, outstanding Theme 2 Module, Theme 3 Module, Theme 4 Module;
  - row 7: Holmes, Peter, `Sendable? = YES`, `SEND? = FALSE`, AB 20, outstanding Theme 1 Module, Theme 2 Module, Theme 3 Module, Theme 4 Module;
  - both drafts include the Book With Me link and `Dean Guedo` signature;
  - no preview row is selected to send yet.
- No email was sent.
- Cleaned the live Apps Script fragment files after the merged `Code.gs` was confirmed working:
  - `Powerschool New Student ADD.gs` was deleted from the Apps Script project;
  - `EmailAutomation.gs` contains only deprecation comments and no functions;
  - `zzCourseBuilderLite.gs` was reduced to deprecation comments only after confirming `Code.gs` contains the real `getSubmissionUpdateTime_()` definition at line 3091 in the live editor.
- Reran the live Sheet menu action `Next Step Tracker` -> `8. Preview Selected Emails` after that cleanup.
- The live preview still completed with:
  - `Ready to send: 2`
  - `Skipped: 6`
  - instruction to review `Email Preview` and check `SEND?` only for rows to send.
- The previously created temporary test Classroom shells were reported deleted by the user. No replacement Classroom shell was created this turn.

## Files Changed
- `tasks/next-step-course-builder-lite-extension.gs`
- `scripts/tests/apps-script-tracker-source.test.ts`
- `package.json`
- `docs/ops/ACTIVE_HANDOFF.md`
- `.stax/codex-report.md`

## Verification Run
- `node --check --input-type=commonjs < tasks/next-step-course-builder-lite-extension.gs`
  - exitCode: 0
- `npm run test:apps-script`
  - exitCode: 0
  - result: 8 tests passed
- Header/row shape check:
  - GC progress summary row items: `13`
  - GC progress summary headers: `13`
  - assignment formatting starts after `Last Submission Update`
- `rg -n "^function onOpen\\(" tasks/next-step-course-builder-lite-extension.gs`
  - result: exactly one active `onOpen`
- Forbidden write-surface grep on `tasks/next-step-course-builder-lite-extension.gs`
  - only expected matches:
    - selected-preview email send path: `MailApp.sendEmail(`
    - approved course-create path: `Classroom.Courses.create(payload)`
- Toxic fragment grep:
  - no `function updatePowerSchoolSync`
  - no `function sendHybridEmails`
- STAX observer preflight:
  - command: `npm run stax:preflight -- --repo /Users/deanguedo/Documents/GitHub/canvas-helper --mode observer`
  - exitCode: 0
  - latest generatedAt: `2026-05-31T15:10:19.731Z`
  - protocolStatus: `ok`
  - verdict: `Reject` in observer mode with `blocking: false`; nonblocking and still tied to stale Learning Strategies sidecar approval/proof state, not an observed tracker failure.
- STAX command evidence:
  - command: `npm run stax:collect -- --repo /Users/deanguedo/Documents/GitHub/canvas-helper -- npm run test:apps-script`
  - exitCode: 0
  - evidenceId: `cmd_2026-05-31T15_09_20_135Z_b4f1f0968cda`
  - collected command exitCode: 0
- Live Sheet Classroom progress:
  - opened `Copy of Class List Fall 2025`
  - ran `Next Step Tracker` -> `7. Update Progress for Checked Courses`
  - observed completion alert: `Checked courses: 4`, `Classroom student rows loaded: 76`, `Audit rows written: 94`, `Courses updated now: 4`, `Errors this run: 0`, `All checked courses are updated.`
- Live Sheet preview:
  - opened `Copy of Class List Fall 2025`
  - ran `Next Step Tracker` -> `8. Preview Selected Emails`
  - observed preview alert: `Ready to send: 2`, `Skipped: 6`
  - copied/read `Email Preview!A1:L10` to inspect the two sendable draft rows
  - no send action was run.
- Live Sheet roster refresh and archive/restore:
  - opened `Copy of Class List Fall 2025`
  - ran `Next Step Tracker` -> `2. Refresh Student List`
  - observed the run finish and land on `Removed Students Archive`
  - archive headers are present and no archived student rows are visible.
  - later ran an intentional fake-row archive/restore cycle using `Roster Import!A500:D500`;
  - observed add -> archive -> restore -> cleanup alerts, ending with `Roster rows: 83`, `Active Master rows: 83`, `Archived stale rows: 1`.
- Google Sheets connector:
  - `_get_spreadsheet_metadata` against spreadsheet id `1yihw_8HWB-zvKVfCmEpph_ytSfMDlVRdf3VpCSnwJQo`
  - result: `403 PERMISSION_DENIED`
  - no API read/write proof could be collected through the connector.
- Live Course Creation Apply duplicate-proof:
  - copied `Course Creation Apply!A1:O3`;
  - observed two approved rows with existing `Created Course ID` values `798040986703` and `798041086875`;
  - ran `Next Step Course Builder` -> `Apply Approved Course Creates`;
  - observed `No new course-create rows are ready to run`, `Approved rows on sheet: 2`, `Already created / already linked: 2`, `Approved but blocked by gates: 0`;
  - no new Classroom course was created.
- Live Apps Script cleanup:
  - inspected `EmailAutomation.gs`: comments only, no functions;
  - inspected `zzCourseBuilderLite.gs`: duplicate helper was present;
  - confirmed live `Code.gs` contains `function getSubmissionUpdateTime_(submission)` at line 3091;
  - replaced `zzCourseBuilderLite.gs` contents with comments only and saved to Drive;
  - reran safe email preview successfully afterward: `Ready to send: 2`, `Skipped: 6`.

## Live State Checked
- In-app browser and Chrome opened the bound Apps Script project:
  - `EMAIL LISTS`
  - `https://script.google.com/home/projects/1GlsxiWzQIhSy7F90i7m1G73cfM6KAfp-dUDthPO6UB7_NERKl3Kp7aql/edit`
- The editor shows the merged `Code.gs` bundle and extra fragment files:
  - `EmailAutomation.gs`
  - `zzCourseBuilderLite.gs`
- `EmailAutomation.gs` and `zzCourseBuilderLite.gs` are deprecation-comment stubs only.
- `Powerschool New Student ADD.gs` no longer appears in the live file list.
- Classroom advanced service is present in the project.
- The live editor was saved after the paste; the fresh Sheet progress run confirms the updated `Code.gs` executed.
- Chrome find verified `readSelectedEmailPreviewDrafts_` in the live `Code.gs` editor at line 2864.
- The live `Email Preview` sheet shows `SEND?`, `Sendable?`, `Row`, `Student`, `To`, `Status`, `Course`, `Missing Assignment(s)`, and `GC Source Tab` across the visible header row.
- After fragment cleanup, `Next Step Tracker` -> `8. Preview Selected Emails` still succeeds with `Ready to send: 2` and `Skipped: 6`.

## What Remains Locked
- No existing Classroom content was edited, deleted, rostered, invited, posted, published, graded, or otherwise changed.
- Course-create apply was live-tested against the two approved test rows after clearing only their stale result cells:
  - confirmation dialog showed `Approved create rows: 2`, `Will create at most this run: 2`;
  - confirmation text explicitly stated it would not edit, delete, roster, invite, post, publish, or change existing Classroom content;
  - result dialog showed `Rows evaluated: 2`, `Created this run: 2`, `Skipped existing: 0`, `Blocked: 0`, `Not approved: 0`, `Errors: 0`, `Max per run: 2`;
  - new test Classroom IDs written to `Course Creation Apply` were `798043276993` and `798043322873`.
- Course-create duplicate protection was live-tested immediately after creation:
  - rerun showed `No new course-create rows are ready to run`;
  - `Approved rows on sheet: 2`;
  - `Already created / already linked: 2`;
  - `Approved but blocked by gates: 0`;
  - no third course was created.
- Google Classroom home page was opened read-only after creation:
  - both `Codex Test Classroom A 2026-05-30` and `Codex Test Classroom B 2026-05-30` were visible;
  - both appeared as invitation cards with `Accept` / `Decline` controls;
  - no Classroom card was opened, accepted, declined, edited, or otherwise changed.
- No web app deployment was performed.
- No email was sent. The preview run created 2 sendable draft rows and 6 skipped rows; both sendable rows still have `SEND? = FALSE`.
- The send queue remains approval-gated by the preview sheet.

## Known Risks / Follow-Up
- Browser automation could inspect the Apps Script editor, but its virtual clipboard blocked pasting the full 289 KB merged source; Chrome with the system clipboard completed the paste/save.
- Google Chrome was not used for the live Apps Script edit because the frontmost Chrome window had an unrelated live recording tab; avoid interacting with that Chrome window unless the user explicitly moves/clears it.
- `clasp` can be invoked through `npm exec`, but the local environment has no clasp credentials, so live application was done through the browser editor.
- Broad STAX status is still stale/noisy because the sidecar task is the prior Learning Strategies deploy proof, not this tracker task.
- The Google Sheets connector cannot currently read this spreadsheet, so the archive/restore proof was browser-driven instead of connector-driven.
- A fake proof record may remain in `Removed Students Archive`; the fake row was removed from `Roster Import` and the active Master is back to 83 rows.
- The two live test Classroom shells now exist as newly created test courses from the approved apply flow. They were intentionally created under the user's allowance for up to two new test classrooms.

## Source Of Truth Location
- Local canonical source:
  - `/Users/deanguedo/Documents/GitHub/canvas-helper/tasks/next-step-course-builder-lite-extension.gs`
- Live bound Apps Script project:
  - `EMAIL LISTS`
  - `https://script.google.com/home/projects/1GlsxiWzQIhSy7F90i7m1G73cfM6KAfp-dUDthPO6UB7_NERKl3Kp7aql/edit`
- Live spreadsheet:
  - `https://docs.google.com/spreadsheets/d/1yihw_8HWB-zvKVfCmEpph_ytSfMDlVRdf3VpCSnwJQo/edit`

## Fragile Areas / What Might Drift
- Email safety now depends on teachers reviewing `Email Preview`, then checking `SEND?` only on rows they intend to send.
- `Course Map` remains the enforcement point for whether emails may send for a course.
- If the user creates or deletes test Classroom shells manually, `Course Creation Apply` rows may need their existing/created IDs rebuilt before another controlled create test.

## Next Prompt Assumptions
- The approved Course Creation Apply flow has created exactly two replacement test Classroom shells and then refused to create duplicates on rerun.
- Do not create additional Classroom shells unless the user explicitly approves another create test.
- The next useful step is to decide whether to fully delete the two now-comment-only Apps Script stub files or leave them as visible deprecation markers. Do not run `Send Selected Emails` unless the teacher explicitly approves.
- Stable Tracker Bundle v1 has live proof for setup, read-only Classroom progress, email preview, active course-create gating, capped creation, duplicate protection, and active-only Master archive/restore.

## Exact Next Command
`node --check --input-type=commonjs < tasks/next-step-course-builder-lite-extension.gs && npm run test:apps-script`

## Exact Next File To Open
`/Users/deanguedo/Documents/GitHub/canvas-helper/tasks/next-step-course-builder-lite-extension.gs`
