import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

import { repoRoot } from "../lib/paths.js";

const trackerSourcePath = path.join(repoRoot, "tasks", "next-step-course-builder-lite-extension.gs");

async function readTrackerSource() {
  return readFile(trackerSourcePath, "utf8");
}

test("Next Step tracker Apps Script bundle parses and has one menu entrypoint", async () => {
  const source = await readTrackerSource();

  assert.doesNotThrow(() => new vm.Script(source));
  assert.equal(source.match(/^function onOpen\(/gm)?.length ?? 0, 1);
});

test("Next Step tracker keeps forbidden legacy and write surfaces out", async () => {
  const source = await readTrackerSource();

  assert.doesNotMatch(source, /function\s+updatePowerSchoolSync\b/);
  assert.doesNotMatch(source, /function\s+sendHybridEmails\b/);
  assert.doesNotMatch(source, /Classroom\.Courses\.(patch|delete)\b/);
  assert.doesNotMatch(source, /CalendarApp\./);
  assert.doesNotMatch(source, /UrlFetchApp\.fetch/);
  assert.equal(source.match(/Classroom\.Courses\.create\(/g)?.length ?? 0, 1);
  assert.equal(source.match(/Classroom\.Courses\.Topics\.create\(/g)?.length ?? 0, 1);
  assert.equal(source.match(/Classroom\.Courses\.CourseWork\.create\(/g)?.length ?? 0, 1);
  assert.equal(source.match(/Classroom\.Courses\.CourseWorkMaterials\.create\(/g)?.length ?? 0, 1);
  assert.equal(source.match(/Classroom\.Courses\.Announcements\.create\(/g)?.length ?? 0, 1);
  assert.doesNotMatch(source, /Classroom\.Courses\.Students\.create\(/);
  assert.doesNotMatch(source, /Classroom\.Courses\.Teachers\.create\(/);
  assert.equal(source.match(/Classroom\.Invitations\.create\(/g)?.length ?? 0, 2);
  assert.equal(source.match(/DriveApp\.createFolder\(/g)?.length ?? 0, 1);
  assert.equal(source.match(/DocumentApp\.create\(/g)?.length ?? 0, 1);
  assert.equal(source.match(/FormApp\.create\(/g)?.length ?? 0, 1);
  assert.equal(source.match(/MailApp\.sendEmail\(/g)?.length ?? 0, 1);
});

test("Sync Everything is exposed in teacher-facing controls", async () => {
  const source = await readTrackerSource();

  assert.match(source, /\.addItem\('0\. Sync Everything', 'teacherSyncEverything'\)/);
  assert.match(source, /<button class="primary" onclick="runAction\('teacherSyncEverything'\)">Sync Everything<\/button>/);
  assert.match(source, /<button class="primary" onclick="webRunAction\('teacherSyncEverythingFromWebApp'\)">Sync Everything<\/button>/);
  assert.match(source, /function teacherSyncEverythingInternal_\(\)/);
});

test("Course creation remains capped and approval gated", async () => {
  const source = await readTrackerSource();

  assert.match(source, /const COURSE_CREATE_MAX_PER_RUN = 2;/);
  assert.match(source, /\.filter\(item => item\.approveCreate === true\)/);
  assert.match(source, /\.filter\(item => normalizeText_\(item\.confirmText\) === 'create course'\)/);
  assert.match(source, /\.filter\(item => normalizeText_\(item\.createPlan\) === 'yes'\)/);
  assert.match(source, /\.filter\(item => normalizeText_\(item\.readiness\) === 'ready for review'\)/);
  assert.match(source, /\.filter\(item => !item\.existingCourseId\)/);
  assert.match(source, /\.filter\(item => !item\.createdCourseId\)/);
  assert.match(source, /const toCreate = safeRows\.slice\(0, maxRows\);/);
  assert.match(source, /alreadyCreated = approvedRows\.filter\(item => item\.existingCourseId \|\| item\.createdCourseId\)\.length/);
  assert.match(source, /No new course-create rows are ready to run/);
});

test("Course Creation Apply status refresh is read-only and archives test proof rows", async () => {
  const source = await readTrackerSource();

  assert.doesNotMatch(source, /\.addItem\('Refresh Course Creation Apply Status', 'refreshCourseCreationApplyStatus'\)/);
  assert.match(source, /function refreshCourseCreationApplyStatusInternal_\(\)/);
  assert.match(source, /Classroom\.Courses\.get\(courseId\)/);
  assert.match(source, /COURSE EXISTS/);
  assert.match(source, /COURSE NOT FOUND/);
  assert.match(source, /COURSE ARCHIVED/);
  assert.match(source, /ID BLANK/);
  assert.match(source, /TEST DELETED \/ NEEDS REVIEW/);
  assert.match(source, /Course Creation Apply Proof Archive/);
  assert.match(source, /TEST COURSE DELETED \/ PROOF ROW - DO NOT REUSE/);
  assert.match(source, /const shouldArchiveProofRow = isProofRow && \(/);
  assert.match(source, /status === 'COURSE EXISTS'/);
  assert.match(source, /status === 'COURSE ARCHIVED'/);
  assert.match(source, /status === 'COURSE NOT FOUND'/);
});

test("retired pre-web-app apply phases remain gated but hidden from teacher menus", async () => {
  const source = await readTrackerSource();

  for (const fnName of [
    "buildLiveProofChecklist",
    "buildTopicApplyReview",
    "applyApprovedTopics",
    "buildAssignmentApplyReview",
    "applyApprovedAssignments",
    "buildMaterialApplyReview",
    "applyApprovedMaterials",
    "buildAnnouncementApplyReview",
    "applyApprovedAnnouncements",
    "buildStudentInviteReview",
    "applyApprovedStudentInvites",
    "buildTeacherInviteReview",
    "applyApprovedTeacherInvites",
    "buildArtifactApplyReview",
    "applyApprovedArtifacts",
    "buildAdminReports"
  ]) {
    assert.match(source, new RegExp(`function ${fnName}\\(`));
  }

  assert.doesNotMatch(source, /createMenu\('Next Step Course Builder'\)/);
  assert.doesNotMatch(source, /\.addItem\('Apply Approved Topics', 'applyApprovedTopics'\)/);
  assert.doesNotMatch(source, /\.addItem\('Apply Approved Assignments', 'applyApprovedAssignments'\)/);
  assert.doesNotMatch(source, /\.addItem\('Apply Approved Materials', 'applyApprovedMaterials'\)/);

  assert.match(source, /const TOPIC_CREATE_MAX_PER_RUN = 5;/);
  assert.match(source, /const ASSIGNMENT_CREATE_MAX_PER_RUN = 3;/);
  assert.match(source, /const MATERIAL_CREATE_MAX_PER_RUN = 5;/);
  assert.match(source, /const ANNOUNCEMENT_CREATE_MAX_PER_RUN = 2;/);
  assert.match(source, /const STUDENT_INVITE_MAX_PER_RUN = 5;/);
  assert.match(source, /const TEACHER_INVITE_MAX_PER_RUN = 3;/);
  assert.match(source, /const ARTIFACT_CREATE_MAX_PER_RUN = 5;/);

  assert.match(source, /normalizeText_\(row\['Confirm Text'\]\) === normalizeText_\(confirmText\)/);
  assert.match(source, /normalizeText_\(row\['Readiness'\]\) === 'ready'/);
  assert.match(source, /!String\(row\[createdIdHeader\] \|\| ''\)\.trim\(\)/);
  assert.match(source, /summary\.created >= TOPIC_CREATE_MAX_PER_RUN/);
  assert.match(source, /summary\.created >= config\.max/);
  assert.match(source, /summary\.created >= STUDENT_INVITE_MAX_PER_RUN/);
  assert.match(source, /summary\.created >= TEACHER_INVITE_MAX_PER_RUN/);
  assert.match(source, /summary\.created >= ARTIFACT_CREATE_MAX_PER_RUN/);
  assert.match(source, /role: 'STUDENT'/);
  assert.match(source, /role: 'TEACHER'/);
  assert.match(source, /LIVE_PROOF_CHECKLIST_SHEET: 'Live Proof Checklist'/);
  assert.match(source, /function buildLiveProofChecklistInternal_/);
  assert.match(source, /function getLiveProofChecklistHeaders_/);
  assert.match(source, /Topic Apply/);
  assert.match(source, /Assignment Apply/);
  assert.match(source, /Web App Deployment/);
  assert.match(source, /Build Live Proof Checklist/);
  assert.match(source, /buildLiveProofChecklistFromWebApp/);
});

test("Teacher-facing workflow is tracker plus simple announcements, not course builder", async () => {
  const source = await readTrackerSource();

  assert.match(source, /createMenu\('Next Step Announcements'\)/);
  assert.match(source, /\.addItem\('Setup Announcements Tab', 'setupSimpleTeacherTabs'\)/);
  assert.match(source, /\.addItem\('Queue Simple Announcement Rows', 'queueSimpleAnnouncementRows'\)/);
  assert.match(source, /\.addItem\('Post Selected Simple Announcements', 'postSimpleAnnouncements'\)/);
  assert.match(source, /\.addItem\('Clear Selected Announcement Rows', 'clearSelectedAnnouncementRows'\)/);
  assert.match(source, /\.addItem\('Clear All Queued Announcement Rows', 'clearAllQueuedAnnouncementRows'\)/);

  assert.doesNotMatch(source, /\.addItem\('Populate Simple Shell', 'populateSimpleShell'\)/);
  assert.doesNotMatch(source, /\.addItem\('Apply Selected Simple Shell Rows', 'applySimpleShellBuilderRows'\)/);
  assert.doesNotMatch(source, /<button[^>]+populateSimpleShell/);
  assert.doesNotMatch(source, /<button[^>]+applySimpleShellBuilderRows/);
  assert.match(source, /Course Builder tabs are retired from normal use/);

  assert.match(source, /function getSimpleAnnouncementsHeaders_/);
  assert.match(source, /'Post\?', 'Course Name', 'Classroom Course ID', 'Announcement Text'/);
  assert.match(source, /function getSimpleAnnouncementTargetModes_/);
  assert.match(source, /'ONE COURSE', 'SELECTED COURSES', 'ALL CHECKED COURSES'/);
  assert.match(source, /function queueSimpleAnnouncementRows\(/);
  assert.match(source, /function queueSimpleAnnouncementRowsInternal_/);
  assert.match(source, /\.addItem\('Queue Simple Announcement Rows', 'queueSimpleAnnouncementRows'\)/);
  assert.match(source, /function clearSelectedAnnouncementRows\(/);
  assert.match(source, /function clearSelectedAnnouncementRowsInternal_/);
  assert.match(source, /function clearAllQueuedAnnouncementRows\(/);
  assert.match(source, /function clearAllQueuedAnnouncementRowsInternal_/);
  assert.match(source, /Sheet-only cleanup; no Classroom changes/);
  assert.match(source, /runAction\('clearSelectedAnnouncementRows'\)/);
  assert.match(source, /runAction\('clearAllQueuedAnnouncementRows'\)/);
  assert.match(source, /function getFirstBlankSimpleAnnouncementWriteRow_/);
  assert.match(source, /function isSimpleAnnouncementValuesBlank_/);
  assert.match(source, /function trimSimpleAnnouncementTrailingBlankRows_/);
  assert.doesNotMatch(source, /setValuesNoValidation_\(\s*sheet\.getRange\(SIMPLE_ANNOUNCEMENTS_HEADER_ROW \+ 1, 1, 1, headers\.length\), \[buildBlankSimpleAnnouncementRow_/);
  assert.match(source, /writeSimpleAnnouncementResult_/);
  assert.match(source, /SIMPLE_ANNOUNCEMENT_POST_MAX_PER_RUN = 5/);

  assert.doesNotMatch(source, /Classroom\.Courses\.[A-Za-z.]+\.delete\(/);
  assert.doesNotMatch(source, /Classroom\.Courses\.[A-Za-z.]+\.patch\(/);
  assert.doesNotMatch(source, /function\s+doDeploy\b/);
});

test("Next Step Simple Ops bridge exposes read-only spreadsheet state", async () => {
  const source = await readTrackerSource();

  assert.match(source, /if \(e && e\.parameter && e\.parameter\.nextStepBridge\)/);
  assert.match(source, /function handleNextStepSimpleOpsBridge_/);
  assert.match(source, /ContentService\.MimeType\.JAVASCRIPT/);
  assert.match(source, /Only read-only state is exposed through this bridge/);
  assert.match(source, /function getNextStepSimpleOpsBridgeState_/);
  assert.match(source, /function getNextStepSimpleOpsBridgeCourses_/);
  assert.match(source, /function getNextStepSimpleOpsBridgeStudents_/);
  assert.match(source, /function getNextStepSimpleOpsBridgeAnnouncements_/);
  assert.match(source, /function getNextStepSimpleOpsBridgeEmailPreview_/);
  assert.match(source, /source: 'apps-script'/);
  const bridgeSlice = source.slice(
    source.indexOf("function handleNextStepSimpleOpsBridge_"),
    source.indexOf("function setupCourseBuilderLite")
  );
  assert.doesNotMatch(bridgeSlice, /Classroom\.Courses\.[A-Za-z.]+\.create\(/);
  assert.doesNotMatch(bridgeSlice, /MailApp\.sendEmail\(/);
});

test("Email send path uses checked preview rows instead of direct Master blasts", async () => {
  const source = await readTrackerSource();

  assert.match(source, /function getEmailPreviewHeaders_\(\)/);
  assert.match(source, /'SEND\?'/);
  assert.match(source, /const rows = drafts\.map\(d => \[\s*false,/);
  assert.match(source, /const drafts = readSelectedEmailPreviewDrafts_\(\);/);
  assert.match(source, /if \(row\[sendCol - 1\] !== true\) return;/);
  assert.match(source, /findMasterEmailContextForPreviewDraft_/);
  assert.match(source, /courseIsCheckedForEmail_\(currentMasterContext\.course\)/);
});

test("Master roster sync archives stale rows and marks restored rows", async () => {
  const source = await readTrackerSource();

  assert.match(source, /REMOVED_MASTER_SHEET: 'Removed Students Archive'/);
  assert.match(source, /function appendRemovedStudentsArchiveRows_/);
  assert.match(source, /function markArchivedStudentsRestored_/);
  assert.match(source, /function isArrayWithValues_/);
  assert.match(source, /function mapRowArrayToObject_/);
  assert.match(source, /removedRows\.push\(row\);/);
  assert.doesNotMatch(source, /removedRows\.push\(\s*\[/);
  assert.match(source, /appendRemovedStudentsArchiveRows_\(removedRows, 'Missing from current Roster Import \/ PowerSchool feed'\);/);
  assert.match(source, /const restoredArchiveRows = markArchivedStudentsRestored_\(restoredKeys\);/);
  assert.match(source, /'IN POWERSCHOOL\?',/);
  assert.match(source, /'YES',\s*\n\s*record\.here \|\| ''/);
});

test("Classroom progress language matches email rules", async () => {
  const source = await readTrackerSource();

  assert.match(source, /'OUTSTANDING'/);
  assert.match(source, /'MISSING - PAST DUE'/);
  assert.match(source, /'TURNED IN - NEEDS MARKING'/);
  assert.match(source, /return workPastDue_\(work\) \? 'MISSING - PAST DUE' : 'OUTSTANDING';/);
  assert.match(source, /course has due dates, so only past-due outstanding work is included/);
  assert.doesNotMatch(source, /No due date listed/);
});
