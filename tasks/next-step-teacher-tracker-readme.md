# Next Step Teacher Tracker README

This is the plain-English guide for the Google Sheets + Apps Script tracker in `Copy of Class List Fall 2025`.

It is the control surface for:

- roster sync
- active-only Master tracking
- Classroom progress refresh
- email preview and send-selected
- course-shell review and gated course creation
- topic, assignment, material, and announcement apply flows
- student/teacher invite review
- artifact generation
- read-only admin reports

## What this system is for

Use the spreadsheet as the command centre.

The normal pattern is:

1. Paste or refresh source data in the import sheets.
2. Run a safe refresh or review action.
3. Inspect the generated review sheet.
4. Approve only the rows you want.
5. Run the matching apply action.
6. Check the log or report sheet for the result.

The script is intentionally split this way so you do not have to manage Google Classroom by hand unless you want to spot-check the result.

## New: Simple Mode v2 (teacher workflow)

If you want the easiest workflow, use Simple Mode.

1. Run `Next Step Simple -> Enable Simple Mode`.
2. Work mainly in:
   - `Simple Shell Template Library`
   - `Simple Shell Builder`
   - `Simple Announcements`
3. For a course shell:
   - choose `Selected Classroom Course`;
   - choose `Selected Shell Template`;
   - run `Next Step Simple -> Populate Simple Shell`;
   - edit rows directly;
   - check `Use?` beside rows you want to create;
   - run `Next Step Simple -> Apply Selected Simple Shell Rows`.
4. For announcements:
   - write the message once in the top area of `Simple Announcements`;
   - choose `ONE COURSE`, `SELECTED COURSES`, or `ALL CHECKED COURSES`;
   - run `Next Step Simple -> Queue Simple Announcement Rows`;
   - check `Post?` beside rows you want live;
   - run `Next Step Simple -> Post Selected Simple Announcements`.
5. If you need the advanced sheets again, run `Next Step Simple -> Show Advanced Mode`.

Simple Mode still uses the same locked safety gates behind the scenes. It just removes the tab overload.

### Simple Shell Builder

The main row types are:

- `TOPIC`
- `MATERIAL`
- `ASSIGNMENT`
- `ANNOUNCEMENT`

You can edit, add, delete, and reorder draft rows before applying. Applying selected rows creates new Classroom items only. It does not delete or edit existing Classroom content.

### Simple Announcements

`Simple Announcements` writes results in the same tab:

- `Created Announcement ID`
- `Posted At`
- `Result`

The bulk mode uses checked rows from `Classroom Course Map`.

## What each sheet is for

- `Teacher Dashboard`: quick workflow map and status
- `Roster Import`: paste the official student roster here
- `MASTER TRACKER NEXT STEP`: the main control sheet
- `Classroom Course Map`: choose which Google Classroom courses are active
- `GC - ...` tabs: one tab per active Classroom course
- `Email Import`: paste student/parent email lists here
- `Email Preview`: review email drafts before sending
- `Email Log`: sent email history
- `Contact Log`: contact history
- `Removed Students Archive`: inactive or removed students
- `Course Builder`: course planning
- `Course Shell Template`: course-shell planning rows
- `Simple Shell Template Library`: reusable simple course-shell templates
- `Simple Shell Builder`: teacher-facing shell editor
- `Simple Announcements`: teacher-facing announcement queue/post tab
- `Course Creation Review`: review course-shell rows
- `Course Creation Apply`: approved course-shell creation rows
- `Course Creation Apply Proof Archive`: moved proof/test rows
- `Live Proof Checklist`: controlled live proof harness for apply phases
- `Course Launch Checklist`: manual launch support
- `Topic Apply Review`: approved topic rows
- `Assignment Apply Review`: approved assignment rows
- `Material Apply Review`: approved material rows
- `Announcement Apply Review`: approved announcement rows
- `Student Invite Review`: approved student invite rows
- `Teacher Invite Review`: approved teacher invite rows
- `Artifact Apply Review`: approved Drive/Docs/Forms artifact rows
- `Admin Summary` and the report sheets: read-only summaries

## Before you start

- Existing Google Classroom content stays locked unless you run a specific approved apply sheet.
- Never use a broad "full update" if you only need one part refreshed.
- Always preview emails before sending.
- Never check apply rows casually. The checkbox is the permission gate.
- The confirmation text must match exactly.

## First-time setup

1. Open the spreadsheet.
2. Run `Next Step Tracker -> Setup / Repair Tracker`.
3. Paste the student roster into `Roster Import`.
4. Paste class email data into `Email Import` if you have it.
5. Open `Classroom Course Map` and check `Use?` for each active Classroom course.
6. If you are ready to use Classroom course creation, complete the course plan first and keep `Course Creation Apply` empty until you are ready to approve rows.

## Daily workflow

1. Run `Next Step Tracker -> Sync Everything` for the normal refresh loop.
2. If you only need one part refreshed, use the narrower tracker menu action instead.
3. Review `MASTER TRACKER NEXT STEP`.
4. Check `SEND EMAIL?` only for the rows you want to contact.
5. Run `Next Step Tracker -> Preview Selected Emails`.
6. Check `SEND?` only on preview rows you actually want to send.
7. Run `Next Step Tracker -> Send Selected Emails`.

## How the tracker thinks

- `Roster Import` is the enrollment truth.
- `MASTER TRACKER NEXT STEP` is the teacher control panel.
- `Classroom` is the assignment/submission truth.
- `Email Preview` is the safety step before sending.
- `Course Builder` is planning only.
- `Course Creation Apply` is the first gated write step.
- `Topic Apply Review` and the later apply sheets are the next narrow write steps.
- `Removed Students Archive` keeps inactive rows out of the active Master.

## Safe email workflow

1. Fill or refresh emails in `Email Import`.
2. Import them into the Master.
3. Set `STATUS` and `SEND EMAIL?` in `MASTER TRACKER NEXT STEP`.
4. Preview the selected emails.
5. Check `SEND?` only for the drafts you approve.
6. Send selected preview rows only.

## Course creation workflow

1. Use `Course Builder` and `Course Shell Template` to plan the shell.
2. Build or review `Course Creation Review`.
3. Use `Course Creation Apply` only for approved rows.
4. If you need to check or clean proof rows, run `Refresh Course Creation Apply Status`.
5. The proof archive keeps temporary Codex test rows out of the active apply sheet.

### Course creation rules

- `Approve Create?` must be checked.
- `Confirm Text` must exactly equal `CREATE COURSE`.
- `Readiness` must be ready.
- The row must not already have a created course ID.
- The apply run is capped.
- The result is written back to the sheet and logged.

## Topic / content workflow

After course creation is stable, the same pattern repeats for later phases:

1. Build the review sheet.
2. Approve only the exact rows you want.
3. Run the matching apply action.
4. Check the returned IDs or URLs.

The later apply sheets are:

- `Topic Apply Review`
- `Assignment Apply Review`
- `Material Apply Review`
- `Announcement Apply Review`
- `Student Invite Review`
- `Teacher Invite Review`
- `Artifact Apply Review`

## Live proof harness (recommended before scaling)

Use `Live Proof Checklist` before using apply flows on real courses.

1. Build `Live Proof Checklist` from `Next Step Course Builder`.
2. Use one disposable test course only.
3. Approve one row in one phase.
4. Run that single apply flow.
5. Verify created ID/URL writeback.
6. Re-run and confirm duplicate protection.
7. Record result before moving to the next phase.

Keep these rows locked unless you explicitly choose to test them:
- `Student Invite Apply`
- `Teacher Invite Apply`
- `Email Send`
- `Web App Deployment`

### Typical gates

- checkbox required
- exact confirmation text required
- readiness required
- duplicate prevention required
- cap per run
- log entry required

## Reports and logs

- `Command Centre Log` records what ran.
- `Email Log` records sent email.
- `Contact Log` records teacher contact.
- `GC PowerSchool Audit` shows roster mismatches and recommendations.
- The admin report sheets are read-only and safe to review any time.

## Safety rules

- Existing Google Classroom content stays locked unless a specific approved apply flow is used.
- The active course-shell creation path is capped and gated.
- Topic creation, assignment posting, material posting, announcement posting, roster invites, teacher invites, Drive, Forms, Calendar, and web deployment are only used through their own apply sheets when those phases are enabled.
- Always preview emails before sending.

## Quick start

If you want the shortest working loop, do this:

1. `Roster Import`
2. `Sync Everything`
3. `Email Import`
4. `Import Email List into Master`
5. `Classroom Course Map`
6. `Apply Course Map`
7. `Preview Selected Emails`
8. `Course Creation Review`
9. `Course Creation Apply`

If you only need one thing, use the narrowest action that solves the problem.
