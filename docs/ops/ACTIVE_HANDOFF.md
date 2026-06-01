# Handoff

- Project: `next-step-teacher-tracker`
- Task: Build all locked-gate Classroom tracker phases up to, but not including, web app deployment.
- Status: local source includes the pre-web-app locked-gate apply flows and local syntax/source tests pass. The Google authorization flow was completed in Chrome and a safe live build/review action ran from the Sheet, but the newest live save is still not independently re-verified. No existing Classroom was deleted, no email was sent, and no student was added to Classroom.

## Latest Continuation - 2026-06-01 09:52 MDT
- Implemented a simplified teacher editing pass for the two-tab workflow in source file `tasks/next-step-course-builder-lite-extension.gs`:
  - Added explicit Simple Shell editor controls in menus: load selected course, add row below, move row up/down, delete selected row.
  - Added automatic blank-tail row behavior and on-edit context sync so teachers can keep typing without manual copy/paste row management.
  - Ensured Course Name dropdowns for both `Simple Shell Builder` and `Simple Announcements` are sourced from checked Course Map entries (plus template fallbacks), with course ID/context auto-fill.
  - Added `Queue Bulk Announcement Rows From Course Map` (menu + panel + web source wrapper) so one typed announcement can fan out into one queued row per checked course.
- Verified locally:
  - `node --check --input-type=commonjs < tasks/next-step-course-builder-lite-extension.gs` exited `0`.
  - `npm run test:apps-script` exited `0` with `11/11` passing tests.
- No live Classroom content apply was run in this continuation.
- No existing Classroom was deleted.
- No student was added to Classroom.
- No email was sent.
- No web app was deployed.

## Latest Continuation - 2026-06-01 10:18 MDT
- Refactored Simple Mode toward the requested teacher-facing workflow:
  - Added `Simple Shell Template Library` with reusable template rows for `TOPIC`, `MATERIAL`, `ASSIGNMENT`, and `ANNOUNCEMENT`.
  - Added a dedicated `Next Step Simple` menu with the small daily action set:
    - Enable Simple Mode
    - Setup Simple Tabs
    - Populate Simple Shell
    - Apply Selected Simple Shell Rows
    - Queue Simple Announcement Rows
    - Post Selected Simple Announcements
    - Show Advanced Mode
  - Refactored `Simple Shell Builder` into a course editor with top controls and full row types:
    - selected checked Classroom course
    - selected shell template
    - populate/clear/apply controls
    - row table with `Use?`, `Order`, `Type`, `Topic`, `Title`, `Description / Instructions`, `Due Date`, `Points`, `Attachment Link`, `Publish?`, `Classroom Course ID`, IDs, and same-row result.
  - Simple Shell apply now handles all four row types directly from the simple tab and writes results back to the same tab.
  - Refactored `Simple Announcements` with top controls for message, link, publish state, target mode, and course selector.
  - Simple Announcements can queue `ONE COURSE`, `SELECTED COURSES`, or `ALL CHECKED COURSES` from Course Map, then post checked rows and write IDs/results in the same tab.
- Preserved safety boundaries:
  - no live Classroom delete/edit of existing content;
  - no roster/student/teacher invite behavior added;
  - no email send changes;
  - no web app deployment.
- Updated source tests with explicit Simple Mode v2 regression coverage.
- Verification:
  - `node --check --input-type=commonjs < tasks/next-step-course-builder-lite-extension.gs` exited `0`.
  - `npm run test:apps-script` exited `0` with `12/12` passing tests.

## Latest Continuation - 2026-05-31 23:55 MDT
- Expanded `tasks/next-step-teacher-tracker-readme.md` into a fuller plain-English operating guide that covers:
  - the safe tracker workflow;
  - the new review/apply phases;
  - the locked-gate safety rules;
  - the report/log sheets;
  - a more explicit quick-start path.
- Linked the tracker guide and review-packet guide from `tasks/README.md` so the docs entrypoint is easier to find.
- Ran a quick sanity pass after the docs edit:
  - `npm run test:apps-script` exited `0` with `11` passing tests;
  - `git diff --check` exited `0`.
- The desktop browser session is currently at the macOS lock screen, so live Chrome work will need the machine unlocked again before I can continue with the Sheet or Apps Script editor.
- No email was sent.
- No existing Classroom was deleted.
- No student was added to Classroom.
- No web app was deployed.

## Latest Continuation - 2026-06-01 00:57 MDT
- Ran the STAX-approved cleanup proof pass through the STAX tooling repo, not this repo checkout:
  - command evidence: `cmd_2026-06-01T05_57_28_593Z_b4f1f0968cda`
  - command: `npm run test:apps-script`
  - exitCode: `0`
- Updated `.stax/codex-report.md` so the current STAX acknowledgement and fresh command evidence are recorded together.
- The browser/session situation is unchanged:
  - Chrome is still at the macOS lock screen until the machine is unlocked;
  - live Sheet or Apps Script work cannot continue from the locked desktop state.
- No email was sent.
- No existing Classroom was deleted.
- No student was added to Classroom.
- No web app was deployed.

## Latest Continuation - 2026-06-01 06:03 MDT
- Completed a fresh STAX command-evidence cleanup pass for the current turn contract:
  - command evidence: `cmd_2026-06-01T12_03_12_498Z_b4f1f0968cda`
  - command: `npm run test:apps-script`
  - repo: `/Users/deanguedo/Documents/GitHub/canvas-helper`
  - commit: `d5301c771e8adfcdc8f7e1f6fd5148b7630d4328`
  - exitCode: `0`
- Evidence was collected from the STAX tooling repo command:
  - `npm run stax:collect -- --repo /Users/deanguedo/Documents/GitHub/canvas-helper -- npm run test:apps-script`
- No new tracker source changes were made in this cleanup pass.
- No email was sent.
- No existing Classroom was deleted.
- No student was added to Classroom.
- No web app was deployed.
- Built a fresh ChatGPT review packet zip and verified integrity:
  - zip: `/Users/deanguedo/Downloads/canvas-helper-google-classroom-review-packet-2026-06-01-0604.zip`
  - SHA-256: `9a48ab8d9286dea6345af6d76c015bb767f8a39d742e8e6b8d1f5c3fc932f187`
  - `unzip -t` reported no errors.

## Latest Continuation - 2026-06-01 06:23 MDT
- Implemented a new controlled safety harness sheet in source:
  - `Live Proof Checklist` (`APP.LIVE_PROOF_CHECKLIST_SHEET`)
  - menu action: `Next Step Course Builder -> Build Live Proof Checklist`
  - web/sidebar action: `buildLiveProofChecklistFromWebApp`
  - sheet-nav links wired in both control panel surfaces.
- `setupCourseBuilderLiteInternal_()` now creates/refreshes the Live Proof Checklist and includes it in setup messaging/log text.
- Added default proof phases:
  - Topic Apply
  - Material Apply
  - Assignment Apply
  - Announcement Apply
  - Artifact Apply
  - Student Invite Apply
  - Teacher Invite Apply
  - Email Send
  - Web App Deployment
- Added checklist columns:
  - `Phase`
  - `Allowed Test Target`
  - `Approved?`
  - `Ran?`
  - `Result`
  - `Created ID / URL`
  - `Duplicate Re-run Verified?`
  - `Live Classroom Spot Check?`
  - `Blocked From Real Courses?`
  - `Notes`
- Added read/write-safe merge behavior:
  - rebuild preserves existing per-phase progress values by `Phase` key instead of wiping proof history.
- Added checklist styling:
  - checkboxes for `Approved?` and `Ran?`
  - conditional emphasis for locked/pass/fail status fields.
- Updated docs/tests:
  - `tasks/next-step-teacher-tracker-readme.md` includes a new “Live proof harness” section.
  - `tasks/README.md` now recommends running the proof harness before scaling apply flows.
  - `scripts/tests/apps-script-tracker-source.test.ts` now asserts checklist constant/menu/function/web exposure.
- Verification:
  - `node --check --input-type=commonjs < tasks/next-step-course-builder-lite-extension.gs` exitCode `0`
  - `npm run test:apps-script` exitCode `0` (`11/11` passing)
  - STAX command evidence:
    - test evidence: `cmd_2026-06-01T12_22_34_322Z_b4f1f0968cda`
    - source-diff evidence: `cmd_2026-06-01T12_23_02_989Z_16ca52ef39d2`
  - STAX observer preflight rerun:
    - generatedAt: `2026-06-01T12:22:44.989Z`
    - exitCode: `0`
    - verdict: `Reject`
    - blocking: `false`
    - reason remains unrelated legacy sidecar task / missing approval artifact.
- No existing Classroom was deleted.
- No student was added to Classroom.
- No email was sent.
- No web app was deployed.

## Latest Continuation - 2026-05-31 pre-web-app local build and live-save attempt
- Implemented the pre-web-app locked-gate phases in `tasks/next-step-course-builder-lite-extension.gs`.
- Added new sheets/constants and menu entries for:
  - `Topic Apply Review` / `Apply Approved Topics`;
  - `Assignment Apply Review` / `Apply Approved Assignments`;
  - `Material Apply Review` / `Apply Approved Materials`;
  - `Announcement Apply Review` / `Apply Approved Announcements`;
  - `Student Invite Review` / `Apply Approved Student Invites`;
  - `Teacher Invite Review` / `Apply Approved Teacher Invites`;
  - `Artifact Apply Review` / `Apply Approved Artifacts`;
  - read-only admin report generation.
- Added one narrow write path per phase, each behind approval, exact confirmation text, readiness, duplicate prevention, cap per run, result ID/URL writeback, and `Command Centre Log` entries:
  - `Classroom.Courses.Topics.create`;
  - `Classroom.Courses.CourseWork.create`;
  - `Classroom.Courses.CourseWorkMaterials.create`;
  - `Classroom.Courses.Announcements.create`;
  - `Classroom.Invitations.create` for student and teacher invite rows;
  - `DriveApp.createFolder`, `DocumentApp.create`, and `FormApp.create` only through `Artifact Apply Review`.
- Student/teacher invite flows intentionally use `Classroom.Invitations.create` rather than direct `Classroom.Courses.Students.create` or `Classroom.Courses.Teachers.create`, so the source does not silently add kids or teachers to existing Classrooms.
- Added read-only reports:
  - `Admin Summary`;
  - `Contact Needed Report`;
  - `Missing Work Report`;
  - `Needs Marking Report`;
  - `Roster Mismatch Report`;
  - `Course Progress Summary`.
- Updated the regression suite in `scripts/tests/apps-script-tracker-source.test.ts` so the new allowed pre-web-app write endpoints are counted exactly and the legacy/broad forbidden surfaces remain absent.
- Verification run:
  - `node --check --input-type=commonjs < tasks/next-step-course-builder-lite-extension.gs` exited `0`;
  - `npm run test:apps-script` exited `0` with `11` passing tests;
  - safety grep shows one `onOpen`, no `updatePowerSchoolSync`, no `sendHybridEmails`, one selected-preview `MailApp.sendEmail`, no direct `Classroom.Courses.Students.create` / `Classroom.Courses.Teachers.create`, and only the intended gated Classroom/Drive/Docs/Forms write endpoints.
- Live Apps Script attempt:
  - copied the corrected local bundle to the clipboard and pasted it into the live bound Apps Script editor;
  - clicked save, but the editor stayed on `Saving project...` after repeated checks;
  - reloaded the Apps Script tab, after which the tab showed a blank editor page and did not provide a reliable saved-state signal;
  - opened the Apps Script URL fresh again in the same Chrome tab, but it still rendered blank;
  - switched back to the Google Sheet and confirmed the sheet itself is still intact and saved to Drive.
- No live apply action was run in this continuation.
- No existing Classroom was deleted.
- No student was added to Classroom.
- No email was sent.
- No web app was deployed.
- Remaining local-to-live step:
  - get the Apps Script editor loading normally again, paste/save `tasks/next-step-course-builder-lite-extension.gs`, and confirm the new `Next Step Course Builder` menu entries appear after sheet reload;
  - run safe build/review menu actions only, not apply actions, unless the teacher explicitly approves exact rows.

## Latest Continuation - 2026-05-31 13:13 MDT
- Added a user-facing tracker README at `tasks/next-step-teacher-tracker-readme.md` and linked it from `tasks/README.md`.
- Patched Stable Tracker Bundle v1.1 locally before moving to Topic Apply.
- Added `Next Step Tracker` -> `0. Sync Everything` and exposed Sync Everything as the primary Teacher Control Panel/sidebar action.
- Exposed Sync Everything in the web-app HTML source as `teacherSyncEverythingFromWebApp`, but did not deploy the web app.
- Added locked-boundary wording to the dashboard/sidebar/web-app text:
  - read/sync actions are safe;
  - existing Classroom content remains locked;
  - only approved new course-shell creation is enabled through `Course Creation Apply`;
  - no topics, assignments, materials, announcements, rosters, invites, grades, Drive, Forms, Calendar, or web deployment in this version.
- Added `Course Creation Apply Proof Archive` and `Refresh Course Creation Apply Status`.
  - Status refresh is read-only and uses `Classroom.Courses.get(courseId)` only.
  - It can mark `COURSE EXISTS`, `COURSE NOT FOUND`, `COURSE ARCHIVED`, `ID BLANK`, or `TEST DELETED / NEEDS REVIEW`.
  - Deleted Codex test/proof rows are moved out of active `Course Creation Apply` into `Course Creation Apply Proof Archive` with `TEST COURSE DELETED / PROOF ROW - DO NOT REUSE`.
- Updated regression tests to cover:
  - exactly one `onOpen`;
  - Sync Everything menu/sidebar/web source exposure;
  - toxic legacy functions absent;
  - no topic/coursework/announcement/material/student/teacher write calls;
  - one selected-preview `MailApp.sendEmail`;
  - one gated `Classroom.Courses.create`;
  - read-only Course Creation Apply status refresh/proof archive behavior.
- Verification run:
  - `node --check --input-type=commonjs < tasks/next-step-course-builder-lite-extension.gs` exited `0`;
  - `npm run test:apps-script` exited `0` with `10` passing tests;
  - requested greps confirm one `onOpen`, Sync Everything exposed, no `updatePowerSchoolSync`, no `sendHybridEmails`, and only the existing selected email send plus gated course-create write.
- STAX command evidence collected after this source diff:
  - `npm run stax:collect -- --repo /Users/deanguedo/Documents/GitHub/canvas-helper -- npm run test:apps-script`;
  - evidenceId: `cmd_2026-05-31T19_13_37_795Z_b4f1f0968cda`;
  - collected command exitCode: `0`.
- STAX observer preflight reran after docs/report updates:
  - generatedAt: `2026-05-31T19:15:43.980Z`;
  - exitCode: `0`;
  - verdict: `Reject`;
  - blocking: `false`;
  - approval artifact missing, so this remains a nonblocking observer result rather than a tracker-specific runtime failure.
- Created a current review packet for ChatGPT:
  - saved under `/Users/deanguedo/Downloads/`;
  - `unzip -t` reported no errors;
  - the final user-facing response records the exact zip path and SHA-256.
- Local source was re-pasted into the live Apps Script editor and saved after accidentally typing into the editor during an earlier run attempt.
  - The clean local bundle was pasted again and saved.
- Re-ran `Next Step Course Builder` -> `Refresh Course Creation Apply Status` live from the Sheet UI after the re-paste.
  - The dialog reported `Rows checked: 2`, `Course exists: 1`, `Course archived: 1`, `Course not found: 0`, `ID blank: 0`, `Moved to proof archive: 2`, `Errors: 0`.
  - The active `Course Creation Apply` tab is now blank.
  - `Course Creation Apply Proof Archive` contains the two temporary Codex proof rows.
- No email was sent.
- No web app was deployed.
- No new Classroom write capability was added.

## Latest Continuation - 2026-05-31 22:03 MDT
- Authorized the updated Apps Script project in Chrome after the consent prompt was blocking progress.
- Completed the consent screen and returned to the live spreadsheet.
- Ran a safe live build/review action from the Sheet UI:
  - `Next Step Course Builder` -> `Build Topic Apply Review`
  - result: `Rows: 1`, `Ready: 0`, `Review: 0`, `Blocked: 1`
  - no topics were created
- Confirmed the live sheet returned to the `Topic Apply Review` tab after authorization.
- No apply/send action was run.
- No existing Classroom was deleted.
- No student was added to Classroom.
- No email was sent.
- No web app was deployed.

## Latest Continuation - 2026-05-31 23:11 MDT
- Confirmed the live spreadsheet still shows the custom `Next Step Tracker` and `Next Step Course Builder` menus in the sheet chrome.
- Recovered the Apps Script editor from an accidental typed-in probe and removed the stray `javascript:document.title='JSOK'` line before saving again.
- Re-ran the local safety gates after that cleanup:
  - `node --check --input-type=commonjs < tasks/next-step-course-builder-lite-extension.gs` exited `0`;
  - `npm run test:apps-script` exited `0` with `11` passing tests.
- Source grep still shows the intended locked-gate shape:
  - exactly one `onOpen`;
  - one gated `Classroom.Courses.Topics.create`;
  - one gated `Classroom.Courses.CourseWork.create`;
  - one gated `Classroom.Courses.CourseWorkMaterials.create`;
  - one gated `Classroom.Courses.Announcements.create`;
  - two gated `Classroom.Invitations.create` calls;
  - one gated `DriveApp.createFolder`;
  - one gated `DocumentApp.create`;
  - one gated `FormApp.create`;
  - no `updatePowerSchoolSync`;
  - no `sendHybridEmails`.
- Google Drive connector metadata check is still blocked by an expired token, so live spreadsheet inspection must continue through Chrome UI for now.
- No apply/send action was run.
- No existing Classroom was deleted.
- No student was added to Classroom.
- No email was sent.
- No web app was deployed.

## Latest Continuation - 2026-05-31 23:21 MDT
- Focused the live Chrome session on the bound spreadsheet and Apps Script editor:
  - sheet title: `Copy of Class List Fall 2025 - Google Sheets`;
  - editor title: `EMAIL LISTS - Project Editor - Apps Script`.
- Confirmed the live spreadsheet currently shows the `Topic Apply Review` tab with the locked-gate review sheet visible.
- Built a fresh review packet zip for ChatGPT review and verified it:
  - `/Users/deanguedo/Downloads/canvas-helper-google-classroom-review-packet-2026-05-31.zip`
  - SHA-256: `7d429f0d32fe519ad50c930f453e87bef4f695ab07268aa0460c83826e9d0308`
  - `unzip -t` reported no errors.
- Packet contents include the current tracker source, tracker source tests, the active handoff, the Codex report, the package manifest, and the two packet README files.
- No email was sent.
- No existing Classroom was deleted.
- No student was added to Classroom.
- No web app was deployed.

## Latest Continuation - 2026-05-31 23:41 MDT
- Refreshed the current STAX acknowledgment in `.stax/codex-report.md` to match the live turn contract:
  - `STAX_ACK turn_2026-06-01T05-41-14-967Z_a573 349b813d 36653170`
- Collected fresh command evidence through STAX for `npm run test:apps-script`:
  - evidenceId: `cmd_2026-06-01T05_41_12_012Z_b4f1f0968cda`
  - exitCode: `0`
- Registered fresh visual proof through STAX:
  - proofId: `visual_2026-06-01T05_40_52_415Z_17aebca4f504`
  - proof path: `.stax/visual-proofs/visual_2026-06-01T05_40_52_415Z_17aebca4f504.png`
- Reconfirmed the live Google Drive connector is still token-expired for the spreadsheet, so live read/write must continue through Chrome UI for now.
- No email was sent.
- No existing Classroom was deleted.
- No student was added to Classroom.
- No web app was deployed.

## Latest Continuation - 2026-05-31 11:36 MDT
- Rechecked the live proof cleanup state before closing the loop:
  - Google Sheets clipboard from `Roster Import!A500:D500` came back blank after the final clear, which matches the fake proof row having been removed.
  - Classroom home no longer shows the temporary Codex test shell; the live course card list now contains only the real classes.
  - The existing archive proof row is still allowed to remain in `Removed Students Archive` as evidence unless the user asks for that to be removed too.
- Re-ran the local tracker safety gates:
  - `node --check --input-type=commonjs < tasks/next-step-course-builder-lite-extension.gs` exited `0`;
  - `npm run test:apps-script` exited `0` with `8` passing tests;
  - safety grep still shows exactly one `onOpen`, one selected-preview `MailApp.sendEmail`, and one gated `Classroom.Courses.create`.
- Re-ran STAX observer preflight for the current worktree:
  - generatedAt: `2026-05-31T17:36:58.689Z`;
  - exitCode: `0`;
  - verdict: `Reject`;
  - blocking: `false`;
  - approval artifact missing, so the reject remains nonblocking and unrelated to the tracker cleanup proof.
- No email was sent.
- No web app was deployed.
- No live Classroom content was mutated during this continuation.

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

## Latest Live Browser Pass - 2026-06-01
- `Next Step Tracker -> 0. Sync Everything` completed successfully in the live spreadsheet:
  - Roster rows: `83`
  - Active Master rows: `83`
  - Restored from archive: `0`
  - Archived stale Master rows: `0`
  - Checked Classroom courses: `4`
  - GC tabs created: `0`
  - GC tabs updated: `4`
  - GC tabs deleted: `0`
  - Classroom student rows loaded: `76`
  - Errors: `0`
- Safe pre-web-app builder/report actions completed live:
  - `Build Assignment Apply Review` -> `Rows: 1`, `Ready: 0`, `Review: 0`, `Blocked: 1`
  - `Build Material Apply Review` -> `Rows: 1`, `Ready: 0`, `Review: 0`, `Blocked: 1`
  - `Build Announcement Apply Review` -> `Rows: 1`, `Ready: 0`, `Review: 0`, `Blocked: 1`
  - `Build Student Invite Review` -> `Rows: 18`, `Ready: 0`, `Review: 0`, `Blocked: 18`
  - `Build Teacher Invite Review` -> `Rows: 0`, `Ready: 0`, `Review: 0`, `Blocked: 0`
  - `Build Artifact Apply Review` -> `Rows: 83`, `Ready: 83`, `Review: 0`, `Blocked: 0`
  - `Build Admin Reports` -> `Sheets updated: 6`, `Rows written: 265`
- The visible dialogs explicitly stated the work was read/review-only in this phase and that no topics, assignments, materials, announcements, students, teachers, Drive, Docs, Forms, Calendar, email, or web deployment actions were changed live.

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

---

## Latest Continuation - Simple Mode Layer (2026-06-01)

### Summary
- Added a simplified teacher workflow on top of the existing locked-gate system.
- New target UX: two primary tabs for daily use:
  - `Simple Shell Builder` (topics + assignments)
  - `Simple Announcements` (single/bulk classroom announcements)
- Advanced apply/review tabs remain available, but can be hidden with one action.

### Files Changed
- `/Users/deanguedo/Documents/GitHub/canvas-helper/tasks/next-step-course-builder-lite-extension.gs`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/tasks/next-step-teacher-tracker-readme.md`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/.stax/codex-report.md`

### Verification Run
- `node --check --input-type=commonjs < tasks/next-step-course-builder-lite-extension.gs` -> exit `0`
- `npm run test:apps-script` -> exit `0` (`11/11` pass)
- Endpoint grep confirms no new write endpoint types were introduced.

### What Is Now Implemented
- Menu actions:
  - `Enable Simple Mode (2 Tabs)`
  - `Setup/Refresh Simple Tabs`
  - `Apply Simple Shell Rows (Topics + Assignments)`
  - `Post Simple Announcements`
  - `Disable Simple Mode (Show All Tabs)`
- Sidebar/web-app source includes the same simple actions.
- Simple actions reuse existing gated apply internals (no duplicate endpoint sprawl).

### Known Risks / Follow-Up
- This continuation is source/test verified; live sheet run-through of the new simple actions still needs one teacher test cycle.
- Duplicate protection and readiness remain enforced through existing apply engines.

### Source Of Truth
- `/Users/deanguedo/Documents/GitHub/canvas-helper/tasks/next-step-course-builder-lite-extension.gs`

### Fragile Areas / Drift
- Course ID resolution in simple tabs depends on either explicit `Classroom Course ID` or existing Course Map/Course Creation Apply mappings.

### Next Prompt Assumptions
- User wants to stay in Simple Mode and run only the two simple tabs for normal work.

### Exact Next Command
- `npm run test:apps-script`

### Exact Next File To Open
- `/Users/deanguedo/Documents/GitHub/canvas-helper/tasks/next-step-course-builder-lite-extension.gs`

---

## Latest Continuation - Simple Mode Formatting Fix (2026-06-01)

### Summary
- Fixed the simple-tab layout issue where labels such as `Selected Classroom Course` wrapped vertically and blank control cells had heavy borders across the page.
- The fix is formatting-only: sane widths, compact row heights, borders limited to the actual controls/table, and cleanup of stale checkboxes/dropdowns from the blank top-control area.
- The live Sheet was updated through the bound Apps Script editor, then `Next Step Simple -> Setup Simple Tabs` was run from the spreadsheet.
- Live visual check: `Simple Shell Builder` and `Simple Announcements` now show normal horizontal controls and compact tables instead of vertical wrapped controls.

### Files Changed
- `/Users/deanguedo/Documents/GitHub/canvas-helper/tasks/next-step-course-builder-lite-extension.gs`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/.stax/codex-report.md`

### Verification Run
- `node --check --input-type=commonjs < tasks/next-step-course-builder-lite-extension.gs` -> exit `0`
- `npm run test:apps-script` -> exit `0` (`12/12` pass)
- Forbidden endpoint grep found no Classroom delete/patch, no direct student/teacher create, no old toxic functions, no UrlFetch, and no Calendar usage.

### Known Risks / Follow-Up
- The live Apps Script editor was updated via browser paste/save.
- If an old browser view still shows the broken layout, refresh the Sheet and run `Next Step Simple -> Setup Simple Tabs` once more. The script now restyles both simple tabs directly.

### Source Of Truth
- `/Users/deanguedo/Documents/GitHub/canvas-helper/tasks/next-step-course-builder-lite-extension.gs`

### Fragile Areas / Drift
- Existing user-adjusted column widths on the simple tabs will be overwritten by setup/style refresh, which is intentional for this layout repair.

### Next Prompt Assumptions
- User wants Simple Mode to remain the daily workflow.
- Do not add more features until the teacher-facing layout is visibly usable.

### Exact Next Command
- `npm run test:apps-script`

### Exact Next File To Open
- `/Users/deanguedo/Documents/GitHub/canvas-helper/tasks/next-step-course-builder-lite-extension.gs`

---

## Latest Continuation - Retire Course Builder From Teacher Flow (2026-06-01)

### Summary
- Pivoted the teacher-facing workflow away from Course Builder because it was more complicated than using Google Classroom directly.
- Kept the tracker, Classroom progress pull, email preview/send-selected flow, Course Map, and `Simple Announcements`.
- Removed the `Next Step Course Builder` menu from `onOpen()`.
- Replaced the old `Next Step Simple` menu with `Next Step Announcements`.
- Removed Simple Shell / course-builder actions from the teacher-facing sidebar and web-app source controls.
- Changed `Setup Announcements Tab` so it creates/repairs only `Simple Announcements`; it no longer creates or foregrounds `Simple Shell Builder` or `Simple Shell Template Library`.
- Changed the hide/show flow so retired builder sheets are hidden from the normal workflow, not deleted.
- Saved the simplified script into the live bound Apps Script project.
- Reloaded the live Sheet and confirmed the visible menus are now `Next Step Tracker`, `Next Step Announcements`, and `Next Step Admin`; `Next Step Course Builder` is no longer visible.
- Ran `Hide Retired Course Builder Sheets` live; the visible tab bar now keeps `Simple Announcements`, tracker sheets, Course Map, GC tabs, and logs while hiding the retired builder tabs.

### Files Changed
- `/Users/deanguedo/Documents/GitHub/canvas-helper/tasks/next-step-course-builder-lite-extension.gs`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/scripts/tests/apps-script-tracker-source.test.ts`
- `/Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md`

### Verification Run
- `node --check --input-type=commonjs < tasks/next-step-course-builder-lite-extension.gs` -> exit `0`
- `npm run test:apps-script` -> exit `0` (`12/12` pass)
- Safety grep for `Next Step Course Builder`, `Populate Simple Shell`, `Apply Selected Simple Shell Rows`, and matching panel buttons returned no teacher-facing matches.

### Known Risks / Follow-Up
- Advanced builder functions still exist in source as dormant internal code; they are hidden from teacher menus instead of being deleted, which keeps this change safe for the working tracker.
- Existing builder tabs are hidden, not deleted. They can be shown from Admin only if needed for troubleshooting.

### Source Of Truth
- `/Users/deanguedo/Documents/GitHub/canvas-helper/tasks/next-step-course-builder-lite-extension.gs`

### Fragile Areas / Drift
- `Simple Announcements` still depends on checked courses in `Classroom Course Map`.
- Posting announcements still creates real Classroom announcements for checked rows, so it remains an intentional selected action.

### Next Prompt Assumptions
- The teacher-facing product is now a tracker plus announcement helper, not a course shell builder.
- Do not revive the course builder unless the user explicitly asks.

### Exact Next Command
- `npm run test:apps-script`

### Exact Next File To Open
- `/Users/deanguedo/Documents/GitHub/canvas-helper/tasks/next-step-course-builder-lite-extension.gs`
