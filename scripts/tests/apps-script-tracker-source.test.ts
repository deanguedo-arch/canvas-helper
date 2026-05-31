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
  assert.doesNotMatch(source, /Classroom\.Courses\.Students\.create\b/);
  assert.doesNotMatch(source, /Classroom\.Courses\.Teachers\.create\b/);
  assert.doesNotMatch(source, /Classroom\.Courses\.CourseWork\.create\b/);
  assert.doesNotMatch(source, /Classroom\.Courses\.Announcements\.create\b/);
  assert.doesNotMatch(source, /Classroom\.Courses\.CourseWorkMaterials\.create\b/);
  assert.doesNotMatch(source, /DriveApp\.create/);
  assert.doesNotMatch(source, /FormApp\./);
  assert.doesNotMatch(source, /CalendarApp\./);
  assert.doesNotMatch(source, /UrlFetchApp\.fetch/);
  assert.equal(source.match(/Classroom\.Courses\.create\(/g)?.length ?? 0, 1);
  assert.equal(source.match(/MailApp\.sendEmail\(/g)?.length ?? 0, 1);
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
