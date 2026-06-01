# Google Classroom / Next Step Tracker Review Packet

This packet is for reviewing the Google Sheets + Apps Script tracker work, especially the Google Classroom integration boundary.

## What to review

- `tasks/next-step-course-builder-lite-extension.gs`
  - Main Apps Script bundle.
  - Contains the tracker menu, roster sync, read-only Classroom progress, GC PowerSchool audit, safe email preview/send-selected workflow, Course Builder Lite, and the gated Course Creation Apply workflow.
- `scripts/tests/apps-script-tracker-source.test.ts`
  - Source-level regression tests for the Apps Script bundle.
- `package.json`
  - Shows the `test:apps-script` command.
- `docs/ops/ACTIVE_HANDOFF.md`
  - Current operational handoff and live verification notes.
- `.stax/codex-report.md`
  - Verification report and safety evidence.

## Safety boundary

- Existing Google Classroom content must not be edited, deleted, rostered, invited, posted, published, graded, or otherwise changed.
- The only Classroom write endpoint intentionally present is the gated test-course creation path:
  - `Classroom.Courses.create(payload)`
- The only Classroom read used by the Course Creation Apply status refresh is:
  - `Classroom.Courses.get(courseId)`
- The only email-send path intentionally present is the selected-preview workflow:
  - `MailApp.sendEmail(...)`
- Sync Everything is exposed in the menu/sidebar/web-app source as a read/sync workflow.
- Topic creation, assignment posting, material posting, announcement posting, roster invites, teacher invites, Drive, Forms, Calendar, and web deployment remain locked out.
- No web app deployment is included.
- No private live roster spreadsheet export is included in this packet.

## Live proof summary

- Stable Tracker Bundle v1 was saved into the live bound Apps Script project.
- Stable Tracker Bundle v1.1 was patched locally to expose Sync Everything and add read-only Course Creation Apply status refresh/proof archiving.
- Read-only Classroom progress update completed for checked courses.
- Email preview generated drafts but no emails were sent.
- Two approved test Classroom shells were created, then duplicate protection was verified.
- The temporary test Classroom shells were later deleted; v1.1 status refresh is designed to move deleted proof rows to `Course Creation Apply Proof Archive`.
- Active-only Master behavior was live-tested with a fake roster row:
  - fake row added;
  - fake row archived after removal;
  - same fake row restored from archive;
  - fake row cleaned back out of active roster.
- Final active Master/Roster count was back to 83 rows.
- The v1.1 source was re-pasted into the live Apps Script editor and saved, but the live status-refresh migration itself was not rerun from the Sheet UI in this packet.

## Suggested review focus

1. Confirm there are no unintended Classroom write endpoints.
2. Confirm Course Creation Apply is safely gated and capped.
3. Confirm Course Creation Apply status refresh is read-only and does not trust stale/deleted test course IDs.
4. Confirm email send requires checked preview rows and active Master matching.
5. Confirm active-only Master/archive behavior is structurally sound.
6. Confirm Classroom progress labels match the intended rules:
   - no due date + not submitted = `OUTSTANDING`;
   - future due + not submitted = `OUTSTANDING`;
   - past due + not submitted = `MISSING - PAST DUE`;
   - turned in without grade = `TURNED IN - NEEDS MARKING`;
   - returned/graded = `COMPLETE`.
