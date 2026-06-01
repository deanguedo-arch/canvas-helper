/************************************************************
 COURSE BUILDER LITE + TEACHER CONTROL PANEL
 Safe layer: tracker + preview + explicitly approved locked-gate apply flows.

 This extension may create new Classroom shell items only from explicit
 apply sheets with approval checkboxes, confirmation text, caps per run,
 duplicate checks, created IDs written back, and Command Centre logging.
 It does not edit, delete, grade, deploy a web app, or run automatic sends.
************************************************************/

const APP = {
  DASHBOARD_SHEET: 'Teacher Dashboard',
  MASTER_SHEET: 'MASTER TRACKER NEXT STEP',
  ROSTER_IMPORT_SHEET: 'Roster Import',
  FEED_SHEET: 'Feed',
  ROSTER_SHEET: 'Roster',
  EMAIL_IMPORT_SHEET: 'Email Import',
  EMAIL_IMPORT_RESULTS_SHEET: 'Email Import Results',
  COURSE_MAP_SHEET: 'Classroom Course Map',
  SUMMARY_SHEET: 'GC Assignment Tabs Summary',
  EMAIL_SETTINGS_SHEET: 'Email List Setting',
  EMAIL_PREVIEW_SHEET: 'Email Preview',
  EMAIL_LOG_SHEET: 'Email Log',
  CONTACT_LOG_SHEET: 'Contact Log',
  REMOVED_MASTER_SHEET: 'Removed Students Archive',
  SYNC_LOG_SHEET: 'Sync Log',
  CLASSROOM_AUDIT_SHEET: 'GC PowerSchool Audit',
  COMMAND_CENTRE_LOG_SHEET: 'Command Centre Log',
  COURSE_BUILDER_SHEET: 'Course Builder',
  COURSE_SHELL_TEMPLATE_SHEET: 'Course Shell Template',
  COURSE_BUILD_PREVIEW_SHEET: 'Course Build Preview',
  COURSE_BUILD_PACKET_SHEET: 'Course Build Packet',
  COURSE_CREATION_REVIEW_SHEET: 'Course Creation Review',
  COURSE_CREATION_APPLY_SHEET: 'Course Creation Apply',
  COURSE_CREATION_APPLY_PROOF_ARCHIVE_SHEET: 'Course Creation Apply Proof Archive',
  LIVE_PROOF_CHECKLIST_SHEET: 'Live Proof Checklist',
  SIMPLE_TEMPLATE_LIBRARY_SHEET: 'Simple Shell Template Library',
  SIMPLE_SHELL_SHEET: 'Simple Shell Builder',
  SIMPLE_ANNOUNCEMENTS_SHEET: 'Simple Announcements',
  TOPIC_APPLY_REVIEW_SHEET: 'Topic Apply Review',
  ASSIGNMENT_APPLY_REVIEW_SHEET: 'Assignment Apply Review',
  MATERIAL_APPLY_REVIEW_SHEET: 'Material Apply Review',
  ANNOUNCEMENT_APPLY_REVIEW_SHEET: 'Announcement Apply Review',
  STUDENT_INVITE_REVIEW_SHEET: 'Student Invite Review',
  TEACHER_INVITE_REVIEW_SHEET: 'Teacher Invite Review',
  ARTIFACT_APPLY_REVIEW_SHEET: 'Artifact Apply Review',
  ADMIN_SUMMARY_SHEET: 'Admin Summary',
  CONTACT_NEEDED_REPORT_SHEET: 'Contact Needed Report',
  MISSING_WORK_REPORT_SHEET: 'Missing Work Report',
  NEEDS_MARKING_REPORT_SHEET: 'Needs Marking Report',
  ROSTER_MISMATCH_REPORT_SHEET: 'Roster Mismatch Report',
  COURSE_PROGRESS_SUMMARY_SHEET: 'Course Progress Summary',
  COURSE_LAUNCH_CHECKLIST_SHEET: 'Course Launch Checklist',
  GENERATED_TAB_PREFIX: 'GC - ',
  TEACHER_PANEL_TITLE: 'Next Step Teacher Control Panel',

  REMOVED_STUDENTS_ARCHIVE_HEADERS: [
    'Student Name',
    'Email',
    'M/F',
    'GD',
    'Course',
    'FIRST MEET',
    'STATUS',
    'LAST CONTACT',
    'LOG CONTACT?',
    'NOTES',
    'HERE?',
    'SEND EMAIL?',
    'EMAIL LAST SENT',
    'EMAIL RESULT',
    'Archived At',
    'Archive Reason',
    'Restored At'
  ],

  MASTER_HEADERS: [
    'Student Name',
    'Email',
    'M/F',
    'GD',
    'Course',
    'FIRST MEET',
    'STATUS',
    'LAST CONTACT',
    'LOG CONTACT?',
    'NOTES',
    'IN POWERSCHOOL?',
    'HERE?',
    'SEND EMAIL?',
    'EMAIL LAST SENT',
    'EMAIL RESULT'
  ],

  STATUS_OPTIONS: ['ON PACE', 'BEHIND', 'NO CONTACT', 'DONE'],
  COMPLETE_STATES: ['TURNED_IN', 'RETURNED'],

  CLASSROOM_PROGRESS_STATUS_SHEET: 'Classroom Progress Status',
  CLASSROOM_PROGRESS_QUEUE_PROPERTY: 'NEXT_STEP_CLASSROOM_PROGRESS_QUEUE_V1',
  CLASSROOM_PROGRESS_TRIGGER_FUNCTION: 'continueCheckedClassroomProgressUpdate',
  CLASSROOM_PROGRESS_BUDGET_MS: 240000,
  CLASSROOM_PROGRESS_RESUME_DELAY_MS: 60000,

  DEFAULT_BEHIND_SUBJECT: 'Reminder: [[COURSE]] Outstanding Work',
  DEFAULT_NO_CONTACT_SUBJECT: 'Action Required: [[COURSE]] - Please Contact Your Teacher',
  DEFAULT_BEHIND_TEMPLATE: `Hi [[FIRST_NAME]],\n\nThis is a reminder regarding your progress in [[COURSE]].\n\nAccording to my records, the following assignment(s) are currently outstanding:\n\n[[MISSING_ASSIGNMENT_LIST]]\n\nPlease let me know if you need any assistance getting caught up. If you need to book help, use this link: [[LINK]]\n\nThanks,\n[[TEACHER_NAME]]`,
  DEFAULT_NO_CONTACT_TEMPLATE: `Hi [[FIRST_NAME]],\n\nI have not been able to connect with you recently regarding your progress in [[COURSE]].\n\nPlease reply to this email or check in as soon as possible so we can make a plan and get you moving again. If you need to book help, use this link: [[LINK]]\n\nThanks,\n[[TEACHER_NAME]]`
};

const COURSE_CREATE_MAX_PER_RUN = 2;
const TOPIC_CREATE_MAX_PER_RUN = 5;
const ASSIGNMENT_CREATE_MAX_PER_RUN = 3;
const MATERIAL_CREATE_MAX_PER_RUN = 5;
const ANNOUNCEMENT_CREATE_MAX_PER_RUN = 2;
const STUDENT_INVITE_MAX_PER_RUN = 5;
const TEACHER_INVITE_MAX_PER_RUN = 3;
const ARTIFACT_CREATE_MAX_PER_RUN = 5;
const SIMPLE_SHELL_CREATE_MAX_PER_RUN = 5;
const SIMPLE_ANNOUNCEMENT_POST_MAX_PER_RUN = 5;
const SIMPLE_SHELL_HEADER_ROW = 8;
const SIMPLE_ANNOUNCEMENTS_HEADER_ROW = 9;

let EMAIL_PREVIEW_GC_CACHE_ = null;

function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu('Next Step Tracker')
    .addItem('0. Sync Everything', 'teacherSyncEverything')
    .addItem('0a. Setup Announcements Tab', 'setupSimpleTeacherTabs')
    .addItem('0b. Queue Announcement Rows', 'queueSimpleAnnouncementRows')
    .addItem('0c. Post Selected Announcements', 'postSimpleAnnouncements')
    .addItem('0d. Clear Selected Announcement Rows', 'clearSelectedAnnouncementRows')
    .addItem('0e. Clear All Queued Announcement Rows', 'clearAllQueuedAnnouncementRows')
    .addItem('0f. Open Teacher Control Panel', 'showTeacherControlPanel')
    .addSeparator()
    .addItem('1. Setup / Repair Tracker', 'teacherSetupRepair')
    .addItem('2. Refresh Student List', 'teacherRefreshStudentList')
    .addItem('Refresh Feed Status / Highlight Students Here', 'refreshFeedStatusAndHighlights')
    .addSeparator()
    .addItem('3. Setup Email Import Sheet', 'setupEmailImportSheet')
    .addItem('4. Import Email List into Master', 'importEmailListIntoMaster')
    .addSeparator()
    .addItem('5. Setup / Refresh Classroom Course Map', 'teacherSetupClassroomCourses')
    .addItem('6. Apply Course Map: Create/Delete + Load Student Lists', 'teacherApplyClassroomCourseMap')
    .addItem('7. Update Progress for Checked Courses', 'teacherUpdateCheckedClassroomCourses')
    .addSeparator()
    .addItem('8. Preview Selected Emails', 'previewSelectedStudentEmails')
    .addItem('9. Send Selected Emails', 'sendSelectedStudentEmails')
    .addSeparator()
    .addItem('Repair Master Blank Rows', 'repairMasterBlankRows')
    .addToUi();

  ui.createMenu('Next Step Announcements')
    .addItem('Setup Announcements Tab', 'setupSimpleTeacherTabs')
    .addItem('Queue Simple Announcement Rows', 'queueSimpleAnnouncementRows')
    .addItem('Post Selected Simple Announcements', 'postSimpleAnnouncements')
    .addSeparator()
    .addItem('Clear Selected Announcement Rows', 'clearSelectedAnnouncementRows')
    .addItem('Clear All Queued Announcement Rows', 'clearAllQueuedAnnouncementRows')
    .addToUi();

  ui.createMenu('Next Step Admin')
    .addItem('Show Backend Sheets', 'showBackendSheets')
    .addItem('Hide Backend Sheets - Keep GC Tabs', 'hideBackendSheets')
    .addItem('Show Retired Course Builder Sheets', 'disableSimpleTeacherMode')
    .addItem('Hide Retired Course Builder Sheets', 'enableSimpleTeacherMode')
    .addItem('Emergency: Clear Master Validations', 'emergencyClearMasterValidations')
    .addItem('DANGER: Delete Generated GC Tabs', 'cleanGeneratedGcTabs')
    .addItem('Resume Classroom Progress Queue', 'continueCheckedClassroomProgressUpdateManual')
    .addItem('Cancel Classroom Progress Queue', 'cancelClassroomProgressQueue')
    .addSeparator()
    .addItem('Classroom Write Lock Status', 'showClassroomWriteLockStatus')
    .addToUi();
}

/************************************************************
 SAFE RUNNER / LOCKS
 ************************************************************/
function withLock_(label, fn) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    SpreadsheetApp.getUi().alert('Another tracker action is already running. Wait a minute, then try again.');
    return;
  }
  try {
    return fn();
  } catch (err) {
    SpreadsheetApp.getUi().alert(`${label} failed.\n\n${err.message || err}`);
    throw err;
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

function requireClassroomService_() {
  if (typeof Classroom === 'undefined') {
    throw new Error('Google Classroom API service is not enabled. Go to Apps Script → Services + → Google Classroom API → Add, then save and run again.');
  }
}

function removeExistingFilterIfAny_(sheet) {
  try {
    const existingFilter = sheet.getFilter();
    if (existingFilter) {
      existingFilter.remove();
      SpreadsheetApp.flush();
    }
  } catch (err) {
    // Filters are convenience only. A broken/stale filter should never stop setup.
  }
}

function safeCreateFilter_(sheet, startRow, startCol, numRows, numCols) {
  if (!sheet || numRows < 1 || numCols < 1) return;

  removeExistingFilterIfAny_(sheet);

  try {
    sheet.getRange(startRow, startCol, numRows, numCols).createFilter();
    return;
  } catch (err) {
    // Sometimes Sheets still thinks a filter exists right after removal.
    // Flush, remove again, retry once, then skip the filter instead of failing setup.
    try {
      SpreadsheetApp.flush();
      removeExistingFilterIfAny_(sheet);
      sheet.getRange(startRow, startCol, numRows, numCols).createFilter();
    } catch (err2) {
      console.warn(`Skipped filter on ${sheet.getName()}: ${err2.message || err2}`);
    }
  }
}


/************************************************************
 VALIDATION / WRITE SAFETY
 ************************************************************/
function clearAllDataValidations_(sheet) {
  if (!sheet) return;
  try {
    const maxRows = Math.max(sheet.getMaxRows(), 1);
    const maxCols = Math.max(sheet.getMaxColumns(), 1);
    sheet.getRange(1, 1, maxRows, maxCols).clearDataValidations();
    SpreadsheetApp.flush();
  } catch (err) {
    console.warn(`Could not clear data validations on ${sheet.getName()}: ${err.message || err}`);
  }
}

function clearDataValidationsForRange_(range) {
  if (!range) return range;
  try {
    range.clearDataValidations();
  } catch (err) {
    console.warn(`Could not clear data validations on target range: ${err.message || err}`);
  }
  return range;
}

function setValuesNoValidation_(range, values) {
  clearDataValidationsForRange_(range);
  range.setValues(values);
}

function setValueNoValidation_(range, value) {
  clearDataValidationsForRange_(range);
  range.setValue(value);
}

/************************************************************
 TEACHER ACTIONS
 ************************************************************/

function teacherSetupRepair() {
  withLock_('Setup / Repair Tracker', () => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const master = ss.getSheetByName(APP.MASTER_SHEET) || ss.insertSheet(APP.MASTER_SHEET);

    normalizeMasterLayout_(master);
    repairMasterBlankRowsInternal_(master);
    setupMasterControlsAndView_(master);
    setupRosterImportSheet_();
    setupEmailImportSheetInternal_(false);
    setupEmailSettingsSheetInternal_(false);
    setupEmailPreviewAndLogSheets_(false);
    setupRemovedStudentsArchiveSheet_();
    setupSyncLogSheet_();
    setupDashboardSheet_();

    appendSyncLog_('SETUP / REPAIR', 'DONE', 'Tracker layout, controls, archive sheet, and dashboard were repaired.');

    SpreadsheetApp.getUi().alert('Tracker setup/repair complete.\n\nUse Sync Everything for the normal workflow, or run individual actions when you only need one part refreshed.');
  });
}



function teacherSyncEverything() {
  withLock_('Sync Everything', () => {
    const summary = teacherSyncEverythingInternal_();
    const progressStart = summary.progressStart;
    const rosterResult = summary.rosterResult;
    const masterResult = summary.masterResult;

    const remainingLine = progressStart.progress.remaining > 0
      ? `\n\nRemaining courses: ${progressStart.progress.remaining}\nThe queue has been scheduled to continue automatically. You can also use Next Step Admin → Resume Classroom Progress Queue.`
      : '\n\nAll checked course progress was updated.';

    SpreadsheetApp.getUi().alert(
      `Sync Everything started.\n\nRoster rows: ${rosterResult.rows || 0}\nActive Master rows: ${masterResult.activeRows || 0}\nRestored from archive: ${masterResult.restored || 0}\nArchived stale Master rows: ${masterResult.archived || 0}\nChecked Classroom courses: ${progressStart.checkedCourses || 0}\nGC tabs created: ${progressStart.courseMap.created || 0}\nGC tabs updated: ${progressStart.courseMap.kept || 0}\nGC tabs deleted: ${progressStart.courseMap.deleted || 0}\nClassroom student rows loaded: ${progressStart.courseMap.studentRows || 0}\nCourses updated now: ${progressStart.progress.updatedThisRun || 0}\nErrors: ${(progressStart.courseMap.errors || 0) + (progressStart.progress.errorsThisRun || 0)}${remainingLine}`
    );
  });
}

function teacherSyncEverythingInternal_() {
  requireClassroomService_();

  const rosterResult = updateRosterFromImportAndFeedInternal_(false) || { rows: 0 };
  const masterResult = syncMasterTrackerFromRosterInternal_(false) || { added: 0, updated: 0, archived: 0, activeRows: 0 };
  const progressStart = startCheckedClassroomProgressUpdateInternal_();

  setupEmailSettingsSheetInternal_(false);
  setupDashboardSheet_();

  appendSyncLog_(
    'SYNC EVERYTHING',
    progressStart.progress.remaining > 0 ? 'RUNNING' : 'DONE',
    `Roster rows: ${rosterResult.rows || 0}; active Master rows: ${masterResult.activeRows || 0}; restored from archive: ${masterResult.restored || 0}; archived stale rows: ${masterResult.archived || 0}; checked courses: ${progressStart.checkedCourses || 0}; course tabs created: ${progressStart.courseMap.created || 0}; deleted: ${progressStart.courseMap.deleted || 0}; courses updated now: ${progressStart.progress.updatedThisRun || 0}; remaining progress queue: ${progressStart.progress.remaining || 0}; errors: ${(progressStart.courseMap.errors || 0) + (progressStart.progress.errorsThisRun || 0)}.`
  );

  return { rosterResult, masterResult, progressStart };
}

function teacherRefreshStudentList() {
  withLock_('Refresh Student List', () => {
    const rosterResult = updateRosterFromImportAndFeedInternal_(false) || { rows: 0 };
    const masterResult = syncMasterTrackerFromRosterInternal_(false) || { added: 0, updated: 0, archived: 0, activeRows: 0 };
    const master = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.MASTER_SHEET);
    if (master) {
      repairMasterBlankRowsInternal_(master);
      setupMasterControlsAndView_(master);
    }
    setupDashboardSheet_();
    appendSyncLog_('REFRESH STUDENT LIST', 'DONE', `Roster rows: ${rosterResult.rows || 0}; active Master rows: ${masterResult.activeRows || 0}; added: ${masterResult.added || 0}; restored: ${masterResult.restored || 0}; updated: ${masterResult.updated || 0}; archived: ${masterResult.archived || 0}.`);
    SpreadsheetApp.getUi().alert(
      `Student list refreshed.\n\nRoster rows: ${rosterResult.rows || 0}\nActive Master rows: ${masterResult.activeRows || 0}\nAdded: ${masterResult.added || 0}\nRestored from archive: ${masterResult.restored || 0}\nUpdated: ${masterResult.updated || 0}\nArchived stale rows: ${masterResult.archived || 0}\n\nMaster Tracker now contains active PowerSchool rows only. Removed/stale students were moved to "${APP.REMOVED_MASTER_SHEET}" instead of being left in the Master.`
    );
  });
}


function refreshFeedStatusAndHighlights() {
  withLock_('Refresh Feed Status / Highlight Students Here', () => {
    const result = refreshFeedStatusAndHighlightsInternal_();
    SpreadsheetApp.getUi().alert(
      `Feed status refreshed.

Master rows checked: ${result.masterRows}
Students currently in building: ${result.hereRows}
Roster rows updated: ${result.rosterRows}

Anyone no longer present in the Feed was cleared from HERE?. Student names currently in the building are highlighted green.`
    );
  });
}

function refreshFeedStatusAndHighlightsInternal_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const feedLookup = buildFeedLookup_();
  const result = { masterRows: 0, hereRows: 0, rosterRows: 0 };

  const roster = ss.getSheetByName(APP.ROSTER_SHEET);
  if (roster && roster.getLastRow() >= 2) {
    const rosterData = roster.getDataRange().getValues();
    const headers = rosterData[0].map(h => normalizeText_(h));
    const idxName = getHeaderIndex_(headers, ['name', 'student name'], 0);
    const idxHere = getHeaderIndex_(headers, ['here?', 'here'], 6);
    const idxSignedIn = getHeaderIndex_(headers, ['signed in at'], 7);

    if (idxHere >= 0 && idxSignedIn >= 0) {
      const out = [];
      for (let i = 1; i < rosterData.length; i++) {
        const name = String(rosterData[i][idxName] || '').trim();
        const feedInfo = feedLookup[makePersonKey_(name)] || {};
        out.push([feedInfo.here || '', feedInfo.signedInAt || '']);
      }
      if (out.length) {
        setValuesNoValidation_(roster.getRange(2, idxHere + 1, out.length, 1), out.map(row => [row[0]]));
        setValuesNoValidation_(roster.getRange(2, idxSignedIn + 1, out.length, 1), out.map(row => [row[1]]));
        result.rosterRows = out.length;
      }
    }
  }

  const master = ss.getSheetByName(APP.MASTER_SHEET);
  if (master) {
    normalizeMasterLayout_(master);
    const headerMap = getHeaderMap_(master);
    const nameCol = findHeaderCol_(headerMap, ['student name', 'name', 'student']) || 1;
    const emailCol = findHeaderCol_(headerMap, ['email', 'student email']) || 2;
    const courseCol = findHeaderCol_(headerMap, ['course', 'display course', 'class']) || 5;
    const hereCol = findHeaderCol_(headerMap, ['here?', 'here', 'active in school']);
    const realLastRow = Math.max(1, getRealLastRowByColumns_(master, [nameCol, emailCol, courseCol]));

    if (hereCol && realLastRow > 1) {
      const names = master.getRange(2, nameCol, realLastRow - 1, 1).getValues();
      const hereValues = names.map(row => {
        const feedInfo = feedLookup[makePersonKey_(row[0])] || {};
        if (feedInfo.here) result.hereRows++;
        return [feedInfo.here || ''];
      });
      setValuesNoValidation_(master.getRange(2, hereCol, hereValues.length, 1), hereValues);
      result.masterRows = hereValues.length;
    }

    repairMasterBlankRowsInternal_(master);
    setupMasterControlsAndView_(master);
  }

  return result;
}

function teacherSetupClassroomCourses() {
  withLock_('Setup Classroom Courses', () => {
    requireClassroomService_();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const mapSheet = setupOrRefreshClassroomMapInternal_(false);
    setupDashboardSheet_();
    if (mapSheet) {
      mapSheet.showSheet();
      ss.setActiveSheet(mapSheet);
    }
    SpreadsheetApp.getUi().alert('Classroom Course Map refreshed.\n\nCheck Use? for every Classroom you want active. Checked courses are the source of truth for GC tabs and progress updates.');
  });
}


function teacherApplyClassroomCourseMap() {
  withLock_('Apply Course Map', () => {
    requireClassroomService_();
    const result = syncGeneratedCourseTabsFromMap_(true);
    setupDashboardSheet_();
    appendSyncLog_('APPLY COURSE MAP', result.errors ? 'DONE WITH ERRORS' : 'DONE', `Active: ${result.activeCount}; created: ${result.created}; updated: ${result.kept}; deleted: ${result.deleted}; student rows: ${result.studentRows}; audit rows: ${result.auditRows || 0}; errors: ${result.errors}.`);
    SpreadsheetApp.getUi().alert(
      `Course map applied.\n\nActive checked courses: ${result.activeCount}\nCreated GC tabs: ${result.created}\nUpdated existing GC tabs: ${result.kept}\nDeleted unchecked/stale GC tabs: ${result.deleted}\nStudent rows loaded: ${result.studentRows}\nAudit rows written: ${result.auditRows || 0}\nErrors: ${result.errors}\n\nChecked courses now create/update their GC tabs with the student roster. Unchecked or stale generated GC tabs are removed.`
    );
  });
}

function teacherUpdateSelectedClassroomCourse() {
  // Backward-compatible wrapper for older menu versions.
  teacherUpdateCheckedClassroomCourses();
}


function teacherUpdateCheckedClassroomCourses() {
  withLock_('Update Classroom Progress', () => {
    requireClassroomService_();
    const result = startCheckedClassroomProgressUpdateInternal_();
    setupEmailSettingsSheetInternal_(false);
    setupDashboardSheet_();

    if (!result.checkedCourses) {
      SpreadsheetApp.getUi().alert('No checked Classroom courses found.\n\nGo to Classroom Course Map and check Use? for every course you want updated.');
      return;
    }

    appendSyncLog_('UPDATE CLASSROOM PROGRESS', result.progress.remaining > 0 ? 'RUNNING' : 'DONE', `Checked courses: ${result.checkedCourses}; GC tabs created: ${result.courseMap.created}; deleted: ${result.courseMap.deleted}; student rows: ${result.courseMap.studentRows}; courses updated now: ${result.progress.updatedThisRun}; remaining: ${result.progress.remaining}; errors: ${(result.courseMap.errors || 0) + (result.progress.errorsThisRun || 0)}.`);

    const remainingLine = result.progress.remaining > 0
      ? `\n\nRemaining courses: ${result.progress.remaining}\nThe script scheduled itself to continue automatically. You can also use Next Step Admin → Resume Classroom Progress Queue.`
      : '\n\nAll checked courses are updated.';

    SpreadsheetApp.getUi().alert(
      `Classroom progress update started.\n\nChecked courses: ${result.checkedCourses}\nGC tabs created: ${result.courseMap.created}\nGC tabs updated: ${result.courseMap.kept}\nGC tabs deleted: ${result.courseMap.deleted}\nClassroom student rows loaded: ${result.courseMap.studentRows}\nAudit rows written: ${result.courseMap.auditRows || 0}\nCourses updated now: ${result.progress.updatedThisRun}\nErrors this run: ${(result.courseMap.errors || 0) + (result.progress.errorsThisRun || 0)}${remainingLine}`
    );
  });
}


function startCheckedClassroomProgressUpdateInternal_() {
  const maps = readEnabledCourseMaps_();

  if (!maps.length) {
    writeClassroomProgressStatus_('NO CHECKED COURSES', 0, 0, 0, 'No checked Classroom courses found.');
    return {
      checkedCourses: 0,
      courseMap: { activeCount: 0, created: 0, kept: 0, deleted: 0, studentRows: 0, auditRows: 0, errors: 0 },
      progress: { updatedThisRun: 0, errorsThisRun: 0, remaining: 0, total: 0 }
    };
  }

  // Course Map is the source of truth. Before progress is pulled, force generated tabs to match it,
  // remove unchecked/stale GC tabs, pull the current Classroom roster, and rebuild the PS/Classroom audit.
  const courseMapResult = syncGeneratedCourseTabsFromMap_(false);

  clearClassroomProgressQueue_();
  removeClassroomProgressContinuationTriggers_();
  saveClassroomProgressQueue_({
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    total: maps.length,
    completedCount: 0,
    errorCount: 0,
    queue: maps,
    errors: []
  });

  const progress = runCheckedClassroomProgressBatch_(false);

  return {
    checkedCourses: maps.length,
    courseMap: courseMapResult,
    progress
  };
}

function continueCheckedClassroomProgressUpdateManual() {
  withLock_('Resume Classroom Progress Queue', () => {
    requireClassroomService_();
    const result = runCheckedClassroomProgressBatch_(false);
    setupDashboardSheet_();
    SpreadsheetApp.getUi().alert(
      `Classroom progress queue resumed.\n\nCourses updated now: ${result.updatedThisRun}\nErrors this run: ${result.errorsThisRun}\nRemaining courses: ${result.remaining}`
    );
  });
}

function continueCheckedClassroomProgressUpdate() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    scheduleClassroomProgressContinuation_();
    return;
  }

  try {
    requireClassroomService_();
    runCheckedClassroomProgressBatch_(true);
    setupDashboardSheet_();
  } catch (err) {
    writeClassroomProgressStatus_('ERROR', 0, 0, 0, `Auto-resume failed: ${err.message || err}. Fix the issue, then use Next Step Admin → Resume Classroom Progress Queue.`);
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

function cancelClassroomProgressQueue() {
  withLock_('Cancel Classroom Progress Queue', () => {
    clearClassroomProgressQueue_();
    removeClassroomProgressContinuationTriggers_();
    writeClassroomProgressStatus_('CANCELLED', 0, 0, 0, 'Classroom progress queue cancelled by user.');
    SpreadsheetApp.getUi().alert('Classroom progress queue cancelled.');
  });
}


/************************************************************
 COMMAND-CENTRE SYNC SUPPORT
 ************************************************************/
function setupRemovedStudentsArchiveSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.REMOVED_MASTER_SHEET) || ss.insertSheet(APP.REMOVED_MASTER_SHEET);
  const headers = APP.REMOVED_STUDENTS_ARCHIVE_HEADERS;
  if (sheet.getLastRow() === 0) {
    writeSimpleTable_(sheet, headers, []);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0];
    const current = existingHeaders.map(h => normalizeText_(h)).join('|');
    const expected = headers.map(h => normalizeText_(h)).join('|');
    if (current !== expected) {
      const oldRows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues() : [];
      const oldNormalized = existingHeaders.map(h => normalizeText_(h));
      const legacyIndex = {
        removedAt: getHeaderIndex_(oldNormalized, ['removed at'], -1),
        removedReason: getHeaderIndex_(oldNormalized, ['removed reason'], -1),
        archivedAt: getHeaderIndex_(oldNormalized, ['archived at'], -1),
        archiveReason: getHeaderIndex_(oldNormalized, ['archive reason'], -1),
        restoredAt: getHeaderIndex_(oldNormalized, ['restored at'], -1)
      };
      const rebuiltRows = oldRows.map(row => headers.map(header => {
        const idx = getHeaderIndex_(oldNormalized, [normalizeText_(header)], -1);
        if (idx >= 0) return row[idx];

        if (normalizeText_(header) === 'archived at' && legacyIndex.removedAt >= 0) {
          return row[legacyIndex.removedAt];
        }
        if (normalizeText_(header) === 'archive reason' && legacyIndex.removedReason >= 0) {
          return row[legacyIndex.removedReason];
        }
        return '';
      }));
      writeSimpleTable_(sheet, headers, rebuiltRows);
    }
  }
  styleSimpleSheet_(sheet, Math.max(sheet.getLastRow(), 1), headers.length);
}

function appendRemovedStudentsArchiveRows_(rows, reason) {
  if (!rows || !rows.length) return;
  setupRemovedStudentsArchiveSheet_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.REMOVED_MASTER_SHEET);
  const masterHeaderIndexes = APP.MASTER_HEADERS.reduce((map, header, index) => {
    map[header] = index;
    return map;
  }, {});
  const archiveHeaderIndexes = APP.REMOVED_STUDENTS_ARCHIVE_HEADERS.reduce((map, header, index) => {
    map[normalizeText_(header)] = index;
    return map;
  }, {});
  const now = new Date();
  const rowTemplate = APP.REMOVED_STUDENTS_ARCHIVE_HEADERS.map(h => {
    if (normalizeText_(h) === 'archived at') return now;
    if (normalizeText_(h) === 'archive reason') return reason || 'Removed from active Master';
    return '';
  });

  const archivedRows = rows.map(row => {
    const sourceRow = isArrayWithValues_(row) ? mapRowArrayToObject_(APP.MASTER_HEADERS, row) : (row || {});
    const template = rowTemplate.slice();
    APP.REMOVED_STUDENTS_ARCHIVE_HEADERS.forEach((header, index) => {
      const normalized = normalizeText_(header);
      if (normalized === 'archived at' || normalized === 'archive reason' || normalized === 'restored at') return;

      const sourceIndex = masterHeaderIndexes[header] != null ? masterHeaderIndexes[header] : -1;
      if (sourceIndex >= 0) {
        template[index] = sourceRow[APP.MASTER_HEADERS[sourceIndex]] || '';
      }
    });

    const reasonCol = archiveHeaderIndexes['archive reason'];
    if (reasonCol >= 0) template[reasonCol] = reason || 'Removed from active Master';

    const archivedAtCol = archiveHeaderIndexes['archived at'];
    if (archivedAtCol >= 0) template[archivedAtCol] = now;

    const restoredAtCol = archiveHeaderIndexes['restored at'];
    if (restoredAtCol >= 0) template[restoredAtCol] = '';

    return template;
  });

  sheet.getRange(sheet.getLastRow() + 1, 1, archivedRows.length, APP.REMOVED_STUDENTS_ARCHIVE_HEADERS.length).setValues(archivedRows);
  const dateColumns = APP.REMOVED_STUDENTS_ARCHIVE_HEADERS.map((header, index) => {
    const normalized = normalizeText_(header);
    return normalized === 'archived at' || normalized === 'restored at';
  });
  APP.REMOVED_STUDENTS_ARCHIVE_HEADERS.forEach((header, index) => {
    const normalized = normalizeText_(header);
    if (normalized === 'archived at' || normalized === 'restored at') {
      const col = index + 1;
      sheet.getRange(2, col, sheet.getLastRow() - 1, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
    }
  });
  styleSimpleSheet_(sheet, sheet.getLastRow(), APP.REMOVED_STUDENTS_ARCHIVE_HEADERS.length);
}

function isArrayWithValues_(value) {
  return Array.isArray(value);
}

function mapRowArrayToObject_(headers, row) {
  const obj = {};
  (headers || []).forEach((header, index) => {
    obj[header] = row[index];
  });
  return obj;
}

function markArchivedStudentsRestored_(keysByStudentCourse) {
  if (!keysByStudentCourse || !Object.keys(keysByStudentCourse).length) return 0;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.REMOVED_MASTER_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return 0;

  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(h => normalizeText_(h));
  const nameIndex = getHeaderIndex_(headers, ['student name', 'name', 'student'], 0);
  const courseIndex = getHeaderIndex_(headers, ['course', 'display course', 'class'], 4);
  const restoredAtIndex = getHeaderIndex_(headers, ['restored at'], -1);
  if (restoredAtIndex < 0) return 0;

  const now = new Date();
  const restoredValues = [];
  let changed = 0;

  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    const key = makeStudentCourseKey_(row[nameIndex], row[courseIndex]);
    const alreadyRestored = !!row[restoredAtIndex];
    if (key && keysByStudentCourse[key] && !alreadyRestored) {
      row[restoredAtIndex] = now;
      changed++;
    }
    restoredValues.push([row[restoredAtIndex] || '']);
  }

  if (changed) {
    sheet.getRange(2, restoredAtIndex + 1, restoredValues.length, 1).setValues(restoredValues);
    sheet.getRange(2, restoredAtIndex + 1, restoredValues.length, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
  }

  return changed;
}

function readArchivedMasterRowsAsObjects_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.REMOVED_MASTER_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const normalized = headers.map(h => normalizeText_(h));
  const rows = [];
  const fieldMap = {
    'student name': 'Student Name',
    'email': 'Email',
    'm/f': 'M/F',
    'gd': 'GD',
    'course': 'Course',
    'first meet': 'FIRST MEET',
    'status': 'STATUS',
    'last contact': 'LAST CONTACT',
    'log contact?': 'LOG CONTACT?',
    'notes': 'NOTES',
    'here?': 'HERE?',
    'send email?': 'SEND EMAIL?',
    'email last sent': 'EMAIL LAST SENT',
    'email result': 'EMAIL RESULT',
    'archived at': 'Archived At',
    'archive reason': 'Archive Reason',
    'restored at': 'Restored At'
  };

  const normalizedToCanonical = {};
  normalized.forEach((header, index) => {
    const canonical = fieldMap[header];
    if (canonical) normalizedToCanonical[index] = canonical;
  });

  for (let r = 1; r < values.length; r++) {
    const obj = {};
    headers.forEach((_, index) => {
      const canonical = normalizedToCanonical[index] || headers[index];
      obj[canonical] = values[r][index];
    });
    if (String(obj['Student Name'] || '').trim() || String(obj['Course'] || '').trim()) rows.push(obj);
  }
  return rows;
}

function setupSyncLogSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.SYNC_LOG_SHEET) || ss.insertSheet(APP.SYNC_LOG_SHEET);
  const headers = ['Timestamp', 'Action', 'Result', 'Detail'];
  if (sheet.getLastRow() === 0) writeSimpleTable_(sheet, headers, []);
  styleSimpleSheet_(sheet, Math.max(sheet.getLastRow(), 1), headers.length);
  sheet.setColumnWidth(1, 170);
  sheet.setColumnWidth(2, 220);
  sheet.setColumnWidth(3, 160);
  sheet.setColumnWidth(4, 800);
}

function appendSyncLog_(action, result, detail) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.SYNC_LOG_SHEET) || ss.insertSheet(APP.SYNC_LOG_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Action', 'Result', 'Detail']);
  }
  sheet.appendRow([new Date(), action || '', result || '', detail || '']);
  sheet.getRange(Math.max(2, sheet.getLastRow()), 1, 1, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
}

function writePowerSchoolClassroomAudit_(classroomCourseRecords) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.CLASSROOM_AUDIT_SHEET) || ss.insertSheet(APP.CLASSROOM_AUDIT_SHEET);
  const syncedAt = new Date();
  const headers = ['Timestamp', 'Course', 'Classroom Course Name', 'Classroom Course ID', 'Student Name', 'Student Email', 'In PowerSchool?', 'In Classroom?', 'Match Type', 'Issue', 'Recommended Action'];
  const rows = [];
  const rosterRecords = readRosterRecords_();

  const recommendationByIssue = {
    'IN POWERSCHOOL NOT CLASSROOM': 'Add this student to the Classroom section or verify the course mapping.',
    'IN CLASSROOM NOT POWERSCHOOL': 'Remove this student from Classroom or confirm they should be in PowerSchool import.',
    'EMAIL MATCH': 'No action needed.',
    'NAME MATCH ONLY': 'Review name/email mapping before moving to Classroom apply actions.',
    'EMAIL MATCH CONFLICT': 'Resolve duplicate matches before running Classroom updates.',
    'CLASSROOM ERROR': 'Fix Classroom read error and rerun progress sync.'
  };

  const recordsByCourse = {};
  (classroomCourseRecords || []).forEach(record => {
    const map = record.map || {};
    const course = normalizeCourseNameFromSource_(map.displayCourseName || map.classroomCourseName || '');
    const courseKey = normalizeText_(course);
    if (!courseKey) return;

    if (!recordsByCourse[courseKey]) {
      recordsByCourse[courseKey] = {
        course,
        classroomName: map.classroomCourseName || course,
        classroomCourseId: map.classroomCourseId || '',
        students: [],
        error: record.error || ''
      };
    }

    if (record.error) {
      return;
    }

    const students = Array.isArray(record.students) ? record.students : [];
    students.forEach(student => {
      const profile = student.profile || {};
      const studentName = String((profile.name || {}).fullName || '').trim();
      const studentEmail = String(profile.emailAddress || '').trim();
      recordsByCourse[courseKey].students.push({
        keyName: normalizeName_(studentName),
        keyEmail: normalizeText_(studentEmail),
        name: studentName,
        email: studentEmail
      });
    });
  });

  const rosterByCourse = {};
  rosterRecords.forEach(record => {
    const course = normalizeCourseNameFromSource_(record.displayCourse || record.rawCourse || '');
    const courseKey = normalizeText_(course);
    if (!courseKey) return;
    if (!rosterByCourse[courseKey]) rosterByCourse[courseKey] = [];
    rosterByCourse[courseKey].push({
      name: String(record.name || '').trim(),
      email: String(record.email || '').trim(),
      nameKey: normalizeName_(record.name || ''),
      emailKey: normalizeText_(record.email || ''),
      course: record.displayCourse || record.rawCourse || course
    });
  });

  Object.keys(recordsByCourse).forEach(courseKey => {
    const auditRecord = recordsByCourse[courseKey];
    const classroomCourseName = auditRecord.classroomName || auditRecord.course;
    const classroomCourseId = auditRecord.classroomCourseId;

    if (auditRecord.error) {
      rows.push([
        syncedAt,
        auditRecord.course || classroomCourseName || courseKey,
        classroomCourseName,
        classroomCourseId,
        '',
        '',
        false,
        false,
        'CLASSROOM ERROR',
        'CLASSROOM ERROR',
        recommendationByIssue['CLASSROOM ERROR']
      ]);
      return;
    }

    const rosterStudents = rosterByCourse[courseKey] || [];
    const classroomStudents = auditRecord.students || [];

    const gcByEmail = {};
    const gcByName = {};
    classroomStudents.forEach((student, index) => {
      if (student.keyEmail) {
        if (!gcByEmail[student.keyEmail]) gcByEmail[student.keyEmail] = [];
        gcByEmail[student.keyEmail].push({ index, student });
      }
      if (student.keyName) {
        if (!gcByName[student.keyName]) gcByName[student.keyName] = [];
        gcByName[student.keyName].push({ index, student });
      }
    });

    const matchedClassroomIndexes = {};

    const markClassroomMatches = matches => {
      (matches || []).forEach(match => {
        if (match && match.index !== undefined) {
          matchedClassroomIndexes[match.index] = true;
        }
      });
    };

    const appendIssueRow = (courseName, issue, matchType, inPowerschool, inClassroom, studentName, studentEmail) => {
      rows.push([
        syncedAt,
        courseName,
        classroomCourseName,
        classroomCourseId,
        studentName || '',
        studentEmail || '',
        inPowerschool,
        inClassroom,
        matchType || issue,
        issue || matchType,
        recommendationByIssue[issue] || recommendationByIssue[matchType] || ''
      ]);
    };

    rosterStudents.forEach(student => {
      const emailMatches = student.emailKey ? (gcByEmail[student.emailKey] || []) : [];
      const nameMatches = student.nameKey ? (gcByName[student.nameKey] || []) : [];

      if (emailMatches.length > 1) {
        markClassroomMatches(emailMatches);
        appendIssueRow(auditRecord.course, 'EMAIL MATCH CONFLICT', 'EMAIL MATCH CONFLICT', true, true, student.name, student.email);
        return;
      }

      if (emailMatches.length === 1) {
        markClassroomMatches(emailMatches);
        appendIssueRow(auditRecord.course, '', 'EMAIL MATCH', true, true, student.name, student.email);
        return;
      }

      if (nameMatches.length > 1) {
        markClassroomMatches(nameMatches);
        appendIssueRow(auditRecord.course, 'EMAIL MATCH CONFLICT', 'EMAIL MATCH CONFLICT', true, true, student.name, student.email);
        return;
      }

      if (nameMatches.length === 1) {
        markClassroomMatches(nameMatches);
        appendIssueRow(auditRecord.course, '', 'NAME MATCH ONLY', true, true, student.name, student.email);
        return;
      }

      appendIssueRow(auditRecord.course, 'IN POWERSCHOOL NOT CLASSROOM', 'IN POWERSCHOOL NOT CLASSROOM', true, false, student.name, student.email);
    });

    classroomStudents.forEach((student, index) => {
      if (matchedClassroomIndexes[index]) return;
      appendIssueRow(auditRecord.course, 'IN CLASSROOM NOT POWERSCHOOL', 'IN CLASSROOM NOT POWERSCHOOL', false, true, student.name, student.email);
    });
  });

  // Courses in PowerSchool without a checked Classroom map row are intentionally not included in this report.

  rows.sort((a, b) => {
    const c = String(a[1]).localeCompare(String(b[1]));
    if (c !== 0) return c;
    const s = String(a[8] || '').localeCompare(String(b[8] || ''));
    if (s !== 0) return s;
    return String(a[4]).localeCompare(String(b[4]));
  });

  writeSimpleTable_(sheet, headers, rows);
  if (rows.length) sheet.getRange(2, 1, rows.length, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
  styleSimpleSheet_(sheet, rows.length + 1, headers.length);
  sheet.setColumnWidth(1, 170);
  sheet.setColumnWidth(2, 190);
  sheet.setColumnWidth(3, 240);
  sheet.setColumnWidth(4, 220);
  sheet.setColumnWidth(5, 240);
  sheet.setColumnWidth(6, 260);
  sheet.setColumnWidth(7, 130);
  sheet.setColumnWidth(8, 130);
  sheet.setColumnWidth(9, 150);
  sheet.setColumnWidth(10, 180);
  sheet.setColumnWidth(11, 420);
  return rows.length;
}

function showRemovedStudentsArchive() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupRemovedStudentsArchiveSheet_();
  const sheet = ss.getSheetByName(APP.REMOVED_MASTER_SHEET);
  sheet.showSheet();
  ss.setActiveSheet(sheet);
}

/************************************************************
 DASHBOARD
 ************************************************************/

function setupDashboardSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.DASHBOARD_SHEET) || ss.insertSheet(APP.DASHBOARD_SHEET, 0);

  clearAllDataValidations_(sheet);
  sheet.clear();
  sheet.clearConditionalFormatRules();
  sheet.setFrozenRows(1);

  sheet.getRange('A1:D1').merge().setValue('Next Step Teacher Dashboard')
    .setFontWeight('bold')
    .setFontSize(16)
    .setBackground('#57b983')
    .setFontColor('#000000');

  const checkedCount = readEnabledCourseMaps_().length;
  const progressState = getClassroomProgressQueue_();
  const remaining = progressState ? (progressState.queue || []).length : 0;
  const completed = progressState ? Number(progressState.completedCount || 0) : 0;
  const master = ss.getSheetByName(APP.MASTER_SHEET);
  const archive = ss.getSheetByName(APP.REMOVED_MASTER_SHEET);
  const audit = ss.getSheetByName(APP.CLASSROOM_AUDIT_SHEET);
  const activeMasterRows = master ? Math.max(0, getRealLastRowByColumns_(master, [1, 2, 5]) - 1) : 0;
  const archivedRows = archive ? Math.max(0, archive.getLastRow() - 1) : 0;
  const auditRows = audit ? Math.max(0, audit.getLastRow() - 1) : 0;

  const rows = [
    ['Daily Workflow', '', '', ''],
    ['0', 'Normal button:', 'Sync Everything', 'Refreshes PowerSchool roster, archives stale Master rows, applies Course Map, audits Classroom vs PowerSchool, and starts checked-course progress updates.'],
    ['1', 'Paste PowerSchool roster into:', APP.ROSTER_IMPORT_SHEET, 'Then run Sync Everything or Refresh Student List'],
    ['2', 'Paste class email list into:', APP.EMAIL_IMPORT_SHEET, 'Then run Import Email List into Master'],
    ['3', 'Choose active Classroom courses:', APP.COURSE_MAP_SHEET, 'Check Use? for every course you want active'],
    ['4', 'Apply Course Map:', APP.COURSE_MAP_SHEET, 'Creates/deletes GC tabs and loads current Classroom rosters'],
    ['5', 'Update Classroom progress:', 'Checked courses only', 'Runs assignment/submission updates for every checked course; auto-continues if needed'],
    ['6', 'Use Master Tracker:', APP.MASTER_SHEET, 'Set STATUS and check SEND EMAIL?'],
    ['7', 'Email workflow:', APP.EMAIL_PREVIEW_SHEET, 'Preview Selected Emails before sending'],
    ['', '', '', ''],
    ['Active Master rows', activeMasterRows, '', 'Master should contain active PowerSchool rows only'],
    ['Archived stale rows', archivedRows, '', APP.REMOVED_MASTER_SHEET],
    ['Checked Classroom courses', checkedCount, '', ''],
    ['Classroom/PowerSchool audit rows', auditRows, '', APP.CLASSROOM_AUDIT_SHEET],
    ['Progress queue remaining', remaining, '', completed ? `Completed so far: ${completed}` : '']
  ];

  sheet.getRange(3, 1, rows.length, 4).setValues(rows);
  sheet.getRange('A3:D3').setFontWeight('bold').setBackground('#d9ead3');
  sheet.getRange('A13:B17').setFontWeight('bold');
  sheet.getRange('B13:B17').setBackground('#fff2cc');

  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(2, 270);
  sheet.setColumnWidth(3, 250);
  sheet.setColumnWidth(4, 620);
  sheet.getRange('A1:D28').setWrap(true).setVerticalAlignment('middle');
}

/************************************************************
 MASTER TRACKER LAYOUT + REPAIR
 ************************************************************/
function normalizeMasterLayout_(sheet) {
  // Nuclear fix: old dropdowns/checkbox validations can end up on the wrong columns
  // after columns are hidden/moved/rebuilt. Clear validations first so setup can
  // write clean values anywhere, then reapply only the intended controls later.
  removeExistingFilterIfAny_(sheet);
  clearAllDataValidations_(sheet);

  const existingLastCol = Math.max(sheet.getLastColumn(), APP.MASTER_HEADERS.length);
  const existingHeaders = sheet.getLastRow() >= 1
    ? sheet.getRange(1, 1, 1, existingLastCol).getValues()[0]
    : [];
  const oldHeaderMap = buildHeaderMapFromArray_(existingHeaders);

  const nameCol = findHeaderCol_(oldHeaderMap, ['student name', 'name', 'student']) || 1;
  const courseCol = findHeaderCol_(oldHeaderMap, ['course', 'display course', 'class']) || 5;
  const emailCol = findHeaderCol_(oldHeaderMap, ['email', 'student email']) || 2;
  const realLastRow = Math.max(1, getRealLastRowByColumns_(sheet, [nameCol, courseCol, emailCol]));

  const oldData = realLastRow >= 1
    ? sheet.getRange(1, 1, realLastRow, existingLastCol).getValues()
    : [];

  const rows = [];
  if (oldData.length > 1) {
    const headers = oldData[0].map(h => normalizeText_(h));
    for (let r = 1; r < oldData.length; r++) {
      const oldRow = oldData[r];
      const studentName = getValueByHeaderFromNormalized_(oldRow, headers, ['student name', 'name', 'student'], '');
      const email = cleanEmailCell_(getValueByHeaderFromNormalized_(oldRow, headers, ['email', 'student email'], ''));
      const course = getValueByHeaderFromNormalized_(oldRow, headers, ['course', 'display course', 'class'], '');
      if (!String(studentName || '').trim() && !String(course || '').trim() && !String(email || '').trim()) continue;

      rows.push([
        studentName,
        email,
        getValueByHeaderFromNormalized_(oldRow, headers, ['m/f', 'gender', 'sex'], ''),
        getValueByHeaderFromNormalized_(oldRow, headers, ['gd', 'grade'], ''),
        normalizeCourseNameFromSource_(course),
        booleanOrBlank_(getValueByHeaderFromNormalized_(oldRow, headers, ['first meet'], false)),
        cleanStatus_(getValueByHeaderFromNormalized_(oldRow, headers, ['status'], '')),
        getValueByHeaderFromNormalized_(oldRow, headers, ['last contact', 'last contacted'], ''),
        false,
        getValueByHeaderFromNormalized_(oldRow, headers, ['notes', 'note'], ''),
        getValueByHeaderFromNormalized_(oldRow, headers, ['in powerschool?', 'in powerschool', 'powerschool'], ''),
        getValueByHeaderFromNormalized_(oldRow, headers, ['here?', 'here', 'active in school'], ''),
        booleanOrBlank_(getValueByHeaderFromNormalized_(oldRow, headers, ['send email?'], false)),
        getValueByHeaderFromNormalized_(oldRow, headers, ['email last sent'], ''),
        getValueByHeaderFromNormalized_(oldRow, headers, ['email result'], '')
      ]);
    }
  }

  removeExistingFilterIfAny_(sheet);
  sheet.showColumns(1, sheet.getMaxColumns());
  clearAllDataValidations_(sheet);

  const neededCols = APP.MASTER_HEADERS.length;
  const currentCols = sheet.getMaxColumns();
  if (currentCols < neededCols) {
    sheet.insertColumnsAfter(currentCols, neededCols - currentCols);
  } else if (currentCols > neededCols) {
    sheet.deleteColumns(neededCols + 1, currentCols - neededCols);
  }

  clearAllDataValidations_(sheet);
  sheet.clear();
  sheet.clearConditionalFormatRules();
  setValuesNoValidation_(sheet.getRange(1, 1, 1, neededCols), [APP.MASTER_HEADERS]);
  if (rows.length) setValuesNoValidation_(sheet.getRange(2, 1, rows.length, neededCols), rows);
}

function repairMasterBlankRows() {
  withLock_('Repair Master Blank Rows', () => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.MASTER_SHEET);
    if (!sheet) {
      SpreadsheetApp.getUi().alert(`Sheet "${APP.MASTER_SHEET}" not found.`);
      return;
    }
    normalizeMasterLayout_(sheet);
    repairMasterBlankRowsInternal_(sheet);
    setupMasterControlsAndView_(sheet);
    SpreadsheetApp.getUi().alert('Master Tracker repaired.\n\nBlank checkbox rows and old hidden-column layout were cleaned up.');
  });
}

function repairMasterBlankRowsInternal_(sheet) {
  const headerMap = getHeaderMap_(sheet);
  const nameCol = findHeaderCol_(headerMap, ['student name', 'name', 'student']) || 1;
  const emailCol = findHeaderCol_(headerMap, ['email', 'student email']) || 2;
  const courseCol = findHeaderCol_(headerMap, ['course', 'display course', 'class']) || 5;
  const realLastRow = Math.max(1, getRealLastRowByColumns_(sheet, [nameCol, emailCol, courseCol]));
  const lastCol = Math.max(sheet.getLastColumn(), APP.MASTER_HEADERS.length);

  const clearStart = realLastRow + 1;
  const clearEnd = Math.min(sheet.getMaxRows(), realLastRow + 25);
  if (clearStart <= clearEnd) {
    sheet.getRange(clearStart, 1, clearEnd - clearStart + 1, lastCol)
      .clearContent()
      .clearDataValidations()
      .clearFormat();
  }

  const keepRows = Math.max(realLastRow + 25, 100);
  if (sheet.getMaxRows() > keepRows) {
    sheet.deleteRows(keepRows + 1, sheet.getMaxRows() - keepRows);
  }
}

function setupMasterControlsAndView_(sheet) {
  removeExistingFilterIfAny_(sheet);
  clearAllDataValidations_(sheet);

  const headerMap = getHeaderMap_(sheet);
  const nameCol = findHeaderCol_(headerMap, ['student name', 'name', 'student']) || 1;
  const emailCol = findHeaderCol_(headerMap, ['email', 'student email']) || 2;
  const courseCol = findHeaderCol_(headerMap, ['course', 'display course', 'class']) || 5;
  const realLastRow = Math.max(1, getRealLastRowByColumns_(sheet, [nameCol, emailCol, courseCol]));
  const lastCol = APP.MASTER_HEADERS.length;

  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, lastCol)
    .setFontWeight('bold')
    .setBackground('#57b983')
    .setFontColor('#000000')
    .setWrap(true)
    .setVerticalAlignment('bottom');

  sheet.setRowHeight(1, 52);
  sheet.setColumnWidth(1, 210);
  sheet.setColumnWidth(2, 330);
  sheet.setColumnWidth(3, 48);
  sheet.setColumnWidth(4, 48);
  sheet.setColumnWidth(5, 120);
  sheet.setColumnWidth(6, 95);
  sheet.setColumnWidth(7, 130);
  sheet.setColumnWidth(8, 115);
  sheet.setColumnWidth(9, 105);
  sheet.setColumnWidth(10, 300);
  sheet.setColumnWidth(11, 135);
  sheet.setColumnWidth(12, 135);
  sheet.setColumnWidth(13, 110);
  sheet.setColumnWidth(14, 135);
  sheet.setColumnWidth(15, 220);

  if (realLastRow > 1) {
    const firstMeetCol = findHeaderCol_(headerMap, ['first meet']);
    const statusCol = findHeaderCol_(headerMap, ['status']);
    const lastContactCol = findHeaderCol_(headerMap, ['last contact']);
    const logContactCol = findHeaderCol_(headerMap, ['log contact?', 'log contact']);
    const sendEmailCol = findHeaderCol_(headerMap, ['send email?']);
    const emailLastSentCol = findHeaderCol_(headerMap, ['email last sent']);

    if (firstMeetCol) sheet.getRange(2, firstMeetCol, realLastRow - 1, 1).insertCheckboxes();
    if (logContactCol) sheet.getRange(2, logContactCol, realLastRow - 1, 1).insertCheckboxes();
    if (sendEmailCol) sheet.getRange(2, sendEmailCol, realLastRow - 1, 1).insertCheckboxes();

    if (statusCol) {
      cleanExistingStatuses_(sheet, statusCol, realLastRow);
      const rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(APP.STATUS_OPTIONS, true)
        .setAllowInvalid(false)
        .build();
      sheet.getRange(2, statusCol, realLastRow - 1, 1).setDataValidation(rule);
    }

    if (lastContactCol) sheet.getRange(2, lastContactCol, realLastRow - 1, 1).setNumberFormat('yyyy-mm-dd');
    if (emailLastSentCol) sheet.getRange(2, emailLastSentCol, realLastRow - 1, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');

    sheet.getRange(1, 1, realLastRow, lastCol)
      .setWrap(true)
      .setVerticalAlignment('middle')
      .setBorder(true, true, true, true, true, true);
  }

  safeCreateFilter_(sheet, 1, 1, Math.max(realLastRow, 1), lastCol);
  applyMasterStatusFormatting_(sheet, realLastRow);
}

function cleanExistingStatuses_(sheet, statusCol, realLastRow) {
  if (realLastRow < 2) return;
  const range = sheet.getRange(2, statusCol, realLastRow - 1, 1);

  // Clear old strict validation first. Otherwise Sheets can reject the cleanup
  // itself when an old dropdown does not allow blanks or legacy statuses.
  range.clearDataValidations();

  const values = range.getValues().map(row => [cleanStatusOrDefault_(row[0])]);
  range.setValues(values);
}

function applyMasterStatusFormatting_(sheet, realLastRow) {
  if (realLastRow < 2) return;
  const headerMap = getHeaderMap_(sheet);
  const statusCol = findHeaderCol_(headerMap, ['status']);
  const nameCol = findHeaderCol_(headerMap, ['student name', 'name', 'student']) || 1;
  const hereCol = findHeaderCol_(headerMap, ['here?', 'here', 'active in school']);

  const rules = [];

  if (statusCol) {
    const statusRange = sheet.getRange(2, statusCol, realLastRow - 1, 1);
    rules.push(
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('ON PACE').setBackground('#d9ead3').setFontColor('#274e13').setRanges([statusRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('BEHIND').setBackground('#fff2cc').setFontColor('#7f6000').setRanges([statusRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('NO CONTACT').setBackground('#f4cccc').setFontColor('#990000').setRanges([statusRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('DONE').setBackground('#cfe2f3').setFontColor('#073763').setRanges([statusRange]).build()
    );
  }

  // Highlight the student name when the current Feed says the student is in the building.
  // This rule is driven by the HERE? column, so when HERE? is cleared, the green highlight disappears too.
  if (hereCol) {
    const nameRange = sheet.getRange(2, nameCol, realLastRow - 1, 1);
    const hereLetter = columnToLetter_(hereCol);
    rules.push(
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=LEN($${hereLetter}2)>0`)
        .setBackground('#b7e1cd')
        .setFontColor('#0b8043')
        .setBold(true)
        .setRanges([nameRange])
        .build()
    );
  }

  sheet.setConditionalFormatRules(rules);
}

/************************************************************
 ROSTER IMPORT + MASTER SYNC
 ************************************************************/
function setupRosterImportSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.ROSTER_IMPORT_SHEET) || ss.insertSheet(APP.ROSTER_IMPORT_SHEET);
  if (sheet.getLastRow() === 0) {
    clearAllDataValidations_(sheet);
    setValuesNoValidation_(sheet.getRange(1, 1, 1, 4), [['Student Name', 'M/F', 'GD', 'Course']]);
  }
  styleSimpleSheet_(sheet, Math.max(sheet.getLastRow(), 1), Math.max(sheet.getLastColumn(), 4));
}


function updateRosterFromImportAndFeedInternal_(showAlert) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const importSheet = ss.getSheetByName(APP.ROSTER_IMPORT_SHEET);
  const rosterSheet = ss.getSheetByName(APP.ROSTER_SHEET) || ss.insertSheet(APP.ROSTER_SHEET);

  if (!importSheet) {
    if (showAlert) SpreadsheetApp.getUi().alert(`Sheet "${APP.ROSTER_IMPORT_SHEET}" not found.`);
    return { rows: 0 };
  }

  const importLastRow = getRealLastRowByColumns_(importSheet, [1, 2, 3, 4]);
  if (importLastRow < 2) {
    writeSimpleTable_(rosterSheet, ['Name', 'Gender', 'Grade', 'Course', 'Display Course', 'Key', 'HERE?', 'Signed In At'], []);
    if (showAlert) SpreadsheetApp.getUi().alert('Roster Import has no student rows.');
    return { rows: 0 };
  }

  const importData = importSheet.getRange(1, 1, importLastRow, Math.max(importSheet.getLastColumn(), 4)).getValues();
  const feedLookup = buildFeedLookup_();
  const rows = [];

  for (let i = 1; i < importData.length; i++) {
    const rawName = String(importData[i][0] || '').trim();
    const gender = importData[i][1] || '';
    const grade = importData[i][2] || '';
    const rawCourse = String(importData[i][3] || '').trim();
    if (!rawName) continue;

    const displayCourse = normalizeCourseNameFromSource_(rawCourse);
    const key = makePersonKey_(rawName);
    const feedInfo = feedLookup[key] || {};

    rows.push([
      rawName,
      gender,
      grade,
      rawCourse,
      displayCourse,
      key,
      feedInfo.here || '',
      feedInfo.signedInAt || ''
    ]);
  }

  rows.sort((a, b) => {
    const c = String(a[4]).localeCompare(String(b[4]));
    if (c !== 0) return c;
    return String(a[0]).localeCompare(String(b[0]));
  });

  writeSimpleTable_(rosterSheet, ['Name', 'Gender', 'Grade', 'Course', 'Display Course', 'Key', 'HERE?', 'Signed In At'], rows);
  styleSimpleSheet_(rosterSheet, rows.length + 1, 8);

  if (showAlert) SpreadsheetApp.getUi().alert(`Roster updated.\n\nRows: ${rows.length}`);
  return { rows: rows.length };
}


function syncMasterTrackerFromRosterInternal_(showAlert) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const master = ss.getSheetByName(APP.MASTER_SHEET) || ss.insertSheet(APP.MASTER_SHEET);
  const roster = ss.getSheetByName(APP.ROSTER_SHEET);
  if (!roster) {
    if (showAlert) SpreadsheetApp.getUi().alert(`Sheet "${APP.ROSTER_SHEET}" not found. Run Refresh Student List first.`);
    return { added: 0, updated: 0, archived: 0, activeRows: 0 };
  }

  setupRemovedStudentsArchiveSheet_();
  normalizeMasterLayout_(master);

  const activeExistingRows = readMasterRowsAsObjects_(master);
  const archivedRows = readArchivedMasterRowsAsObjects_();

  const activeByKey = {};
  activeExistingRows.forEach(row => {
    const key = makeStudentCourseKey_(row['Student Name'], row['Course']);
    if (!key) return;
    activeByKey[key] = row;
  });

  const archivedByKey = {};
  archivedRows.forEach(row => {
    const key = makeStudentCourseKey_(row['Student Name'], row['Course']);
    if (!key) return;

    const archivedAt = new Date(row['Archived At'] || row['Archived At'] === 0 ? row['Archived At'] : 0);
    if (!archivedByKey[key] || archivedAt > archivedByKey[key]._archivedAt) {
      row._archivedAt = archivedAt;
      archivedByKey[key] = row;
    }
  });

  const rosterRecords = readRosterRecords_();
  const rosterKeys = {};
  const outputRows = [];
  let added = 0;
  let updated = 0;
  let restored = 0;
  const restoredKeys = {};

  rosterRecords.forEach(record => {
    const key = makeStudentCourseKey_(record.name, record.displayCourse);
    if (!key) return;
    rosterKeys[key] = true;
    const existing = activeByKey[key] || archivedByKey[key] || {};
    const wasActive = !!activeByKey[key];
    const isArchived = !!archivedByKey[key] && !wasActive;
    if (isArchived) {
      restored++;
      restoredKeys[key] = true;
    }
    if (wasActive) updated++; else added++;

    if (isArchived) {
      existing['Restored At'] = new Date();
      const restoreReasonIndex = APP.REMOVED_STUDENTS_ARCHIVE_HEADERS.indexOf('Archive Reason');
      if (restoreReasonIndex >= 0 && existing['Archive Reason'] === '') {
        existing['Archive Reason'] = 'Returned to active roster';
      }
    }

    const row = existing || {};
    outputRows.push([
      record.name,
      cleanEmailCell_(row['Email'] || ''),
      record.gender || row['M/F'] || '',
      record.grade || row['GD'] || '',
      record.displayCourse || row['Course'] || '',
      booleanOrBlank_(row['FIRST MEET']),
      cleanStatusOrDefault_(row['STATUS'] || ''),
      row['LAST CONTACT'] || '',
      false,
      row['NOTES'] || '',
      'YES',
      record.here || '',
      booleanOrBlank_(row['SEND EMAIL?']),
      row['EMAIL LAST SENT'] || '',
      row['EMAIL RESULT'] || ''
    ]);
  });

  const removedRows = [];
  activeExistingRows.forEach(row => {
    const key = makeStudentCourseKey_(row['Student Name'], row['Course']);
    if (!key || rosterKeys[key]) return;
    removedRows.push(row);
  });

  if (removedRows.length) {
    appendRemovedStudentsArchiveRows_(removedRows, 'Missing from current Roster Import / PowerSchool feed');
  }
  const restoredArchiveRows = markArchivedStudentsRestored_(restoredKeys);

  writeSimpleTable_(master, APP.MASTER_HEADERS, outputRows);
  repairMasterBlankRowsInternal_(master);
  setupMasterControlsAndView_(master);

  const result = { added, updated, restored, restoredArchiveRows, archived: removedRows.length, activeRows: outputRows.length };

  if (showAlert) {
    SpreadsheetApp.getUi().alert(`Master Tracker synced.\n\nActive rows: ${outputRows.length}\nAdded/restored: ${added}\nUpdated: ${updated}\nRestored from archive: ${restored}\nArchived stale rows: ${removedRows.length}`);
  }
  return result;
}

function buildFeedLookup_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const feedSheet = ss.getSheetByName(APP.FEED_SHEET);
  const lookup = {};
  if (!feedSheet || feedSheet.getLastRow() < 2) return lookup;

  const data = feedSheet.getDataRange().getValues();
  const headers = data[0].map(h => normalizeText_(h));
  const idxFirst = getHeaderIndex_(headers, ['title', 'first name', 'firstname'], 0);
  const idxLast = getHeaderIndex_(headers, ['last name', 'lastname'], 1);
  const idxSignIn = getHeaderIndex_(headers, ['sign in date', 'signin date', 'signed in at'], 3);
  const idxSignOut = getHeaderIndex_(headers, ['sign out date', 'signout date', 'signed out at'], 4);
  const idxLocation = getHeaderIndex_(headers, ['physicallocation', 'physical location', 'location'], 5);

  for (let i = 1; i < data.length; i++) {
    const first = String(data[i][idxFirst] || '').trim();
    const last = String(data[i][idxLast] || '').trim();
    if (!first && !last) continue;

    const key = makePersonKey_(`${last}, ${first}`);
    const signIn = data[i][idxSignIn] || '';
    const signOut = data[i][idxSignOut] || '';
    const location = data[i][idxLocation] || '';
    const isCurrentlyIn = signIn && !signOut;

    if (isCurrentlyIn) {
      lookup[key] = {
        here: location ? `IN BUILDING - ${location}` : 'IN BUILDING',
        signedInAt: signIn
      };
    }
  }
  return lookup;
}

/************************************************************
 EMAIL IMPORT
 ************************************************************/
function setupEmailImportSheet() {
  withLock_('Setup Email Import Sheet', () => {
    setupEmailImportSheetInternal_(true);
  });
}

function setupEmailImportSheetInternal_(showAlert) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.EMAIL_IMPORT_SHEET) || ss.insertSheet(APP.EMAIL_IMPORT_SHEET);

  if (sheet.getLastRow() === 0) {
    clearAllDataValidations_(sheet);
    setValuesNoValidation_(sheet.getRange(1, 1, 1, 4), [[
      'Student Name',
      'Student School Email',
      'Parent/Guardian Emails',
      'Extra / Notes'
    ]]);
  }

  styleSimpleSheet_(sheet, Math.max(sheet.getLastRow(), 1), Math.max(sheet.getLastColumn(), 4));
  sheet.setColumnWidth(1, 240);
  sheet.setColumnWidth(2, 260);
  sheet.setColumnWidth(3, 520);
  sheet.setColumnWidth(4, 260);

  if (showAlert) {
    SpreadsheetApp.getUi().alert('Email Import sheet is ready.\n\nPaste the class email list into this tab, then run Import Email List into Master.');
  }
}

function importEmailListIntoMaster() {
  withLock_('Import Email List into Master', () => {
    const ui = SpreadsheetApp.getUi();
    const choice = ui.alert(
      'Import email list into Master?',
      'YES = replace the Master Email cell with the imported emails.\nNO = merge imported emails with existing Master emails.\nCANCEL = stop.',
      ui.ButtonSet.YES_NO_CANCEL
    );
    if (choice === ui.Button.CANCEL) return;
    const replaceMode = choice === ui.Button.YES;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const importSheet = ss.getSheetByName(APP.EMAIL_IMPORT_SHEET);
    const master = ss.getSheetByName(APP.MASTER_SHEET);
    if (!importSheet) throw new Error(`Sheet "${APP.EMAIL_IMPORT_SHEET}" not found.`);
    if (!master) throw new Error(`Sheet "${APP.MASTER_SHEET}" not found.`);

    normalizeMasterLayout_(master);
    const headerMap = getHeaderMap_(master);
    const nameCol = findHeaderCol_(headerMap, ['student name', 'name', 'student']);
    const emailCol = findHeaderCol_(headerMap, ['email', 'student email']);
    const realLastRow = getRealLastRowByColumns_(master, [nameCol, emailCol, findHeaderCol_(headerMap, ['course']) || 5]);
    if (realLastRow < 2) throw new Error('Master Tracker has no student rows. Refresh Student List first.');

    const masterNames = master.getRange(2, nameCol, realLastRow - 1, 1).getValues().map(r => r[0]);
    const masterEmails = master.getRange(2, emailCol, realLastRow - 1, 1).getValues();
    const masterLookup = {};
    masterNames.forEach((name, i) => {
      const key = makeFirstLastKey_(name);
      if (!key) return;
      if (!masterLookup[key]) masterLookup[key] = [];
      masterLookup[key].push(i);
    });

    const importLastRow = getRealLastRowByColumns_(importSheet, [1, 2, 3, 4]);
    if (importLastRow < 2) throw new Error('Email Import has no rows to import.');

    const importData = importSheet.getRange(1, 1, importLastRow, Math.max(importSheet.getLastColumn(), 4)).getValues();
    const resultRows = [];
    let updatedRows = 0;
    let matchedStudents = 0;
    let skipped = 0;

    for (let r = 1; r < importData.length; r++) {
      const row = importData[r];
      const rawName = String(row[0] || '').trim();
      if (!rawName || looksLikeHeaderRow_(rawName)) continue;

      const emails = dedupeEmails_(extractEmails_(row.join(' ')));
      const key = makeFirstLastKey_(rawName);
      const matchIndexes = masterLookup[key] || [];

      if (!key || emails.length === 0) {
        skipped++;
        resultRows.push([rawName, key, emails.join(', '), 0, '', 'SKIPPED - Missing valid name or email']);
        continue;
      }

      if (matchIndexes.length === 0) {
        skipped++;
        resultRows.push([rawName, key, emails.join(', '), 0, '', 'NO MATCH IN MASTER']);
        continue;
      }

      matchedStudents++;
      const updatedSheetRows = [];
      matchIndexes.forEach(index => {
        const current = extractEmails_(String(masterEmails[index][0] || ''));
        const finalEmails = replaceMode ? emails : dedupeEmails_(current.concat(emails));
        masterEmails[index][0] = finalEmails.join(', ');
        updatedRows++;
        updatedSheetRows.push(index + 2);
      });

      resultRows.push([rawName, key, emails.join(', '), matchIndexes.length, updatedSheetRows.join(', '), replaceMode ? 'UPDATED - REPLACED' : 'UPDATED - MERGED']);
    }

    setValuesNoValidation_(master.getRange(2, emailCol, masterEmails.length, 1), masterEmails.map(r => [cleanEmailCell_(r[0])]));
    setupMasterControlsAndView_(master);
    writeEmailImportResults_(resultRows);

    ui.alert(`Email import complete.\n\nMatched students: ${matchedStudents}\nUpdated Master rows: ${updatedRows}\nSkipped/no match: ${skipped}\n\nCheck "${APP.EMAIL_IMPORT_RESULTS_SHEET}" for details.`);
  });
}

function writeEmailImportResults_(rows) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.EMAIL_IMPORT_RESULTS_SHEET) || ss.insertSheet(APP.EMAIL_IMPORT_RESULTS_SHEET);
  writeSimpleTable_(sheet, ['Imported Name', 'Match Key', 'Emails Found', 'Master Match Count', 'Updated Master Rows', 'Result'], rows);
  styleSimpleSheet_(sheet, rows.length + 1, 6);
  sheet.setColumnWidth(1, 240);
  sheet.setColumnWidth(2, 180);
  sheet.setColumnWidth(3, 520);
  sheet.setColumnWidth(6, 220);
}

/************************************************************
 CLASSROOM COURSE MAP + ONE-COURSE UPDATE
 ************************************************************/
function setupOrRefreshClassroomMapInternal_(showAlert) {
  requireClassroomService_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.COURSE_MAP_SHEET) || ss.insertSheet(APP.COURSE_MAP_SHEET);
  const headers = ['Use?', 'Display Course Name', 'Classroom Course Name', 'Classroom Course ID', 'Notes'];

  const existing = sheet.getLastRow() > 1 ? sheet.getDataRange().getValues() : [];
  const existingByCourseId = {};
  if (existing.length > 1) {
    for (let i = 1; i < existing.length; i++) {
      const courseId = String(existing[i][3] || '').trim();
      if (!courseId) continue;
      existingByCourseId[courseId] = {
        use: isTruthy_(existing[i][0]),
        displayCourseName: String(existing[i][1] || '').trim(),
        classroomCourseName: String(existing[i][2] || '').trim(),
        notes: String(existing[i][4] || '').trim()
      };
    }
  }

  const courses = listActiveClassroomCourses_();
  const rows = courses.map(course => {
    const old = existingByCourseId[course.id] || {};
    return [
      old.use !== undefined ? old.use : false,
      old.displayCourseName || guessDisplayCourseName_(course.name),
      course.name || '',
      course.id || '',
      old.notes || ''
    ];
  });

  writeSimpleTable_(sheet, headers, rows);
  if (rows.length) sheet.getRange(2, 1, rows.length, 1).insertCheckboxes();
  styleSimpleSheet_(sheet, rows.length + 1, headers.length);
  sheet.setColumnWidth(1, 70);
  sheet.setColumnWidth(2, 180);
  sheet.setColumnWidth(3, 320);
  sheet.setColumnWidth(4, 220);
  sheet.setColumnWidth(5, 280);

  if (showAlert) SpreadsheetApp.getUi().alert('Classroom Course Map refreshed.');
  return sheet;
}


function syncGeneratedCourseTabsFromMap_(showToast) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allMaps = readAllCourseMaps_().filter(map => map.classroomCourseId);
  const activeMaps = allMaps.filter(map => map.use);
  const activeTabNames = {};
  const masterLookup = buildMasterLookup_();
  const classroomAuditRecords = [];
  let created = 0;
  let kept = 0;
  let deleted = 0;
  let studentRows = 0;
  let errors = 0;

  activeMaps.forEach(map => {
    const tabName = makeGeneratedTabName_(map, allMaps);
    activeTabNames[tabName] = true;
    let sheet = ss.getSheetByName(tabName);

    if (sheet) {
      kept++;
      try { sheet.showSheet(); } catch (err) {}
    } else {
      sheet = ss.insertSheet(tabName);
      created++;
    }

    try {
      const students = listCourseStudents_(map.classroomCourseId);
      classroomAuditRecords.push({ map, students, error: '' });
      updateMasterEmailsFromClassroomStudents_(map, students);
      writeClassroomRosterTab_(sheet, map, students, masterLookup);
      studentRows += students.length;
    } catch (err) {
      errors++;
      classroomAuditRecords.push({ map, students: [], error: String(err && err.message ? err.message : err) });
      writeClassroomRosterErrorTab_(sheet, map, err);
    }
  });

  ss.getSheets().slice().forEach(sheet => {
    const name = sheet.getName();
    if (!name.startsWith(APP.GENERATED_TAB_PREFIX)) return;
    if (activeTabNames[name]) return;
    if (ss.getSheets().length <= 1) return;
    ss.deleteSheet(sheet);
    deleted++;
  });

  const auditRows = writePowerSchoolClassroomAudit_(classroomAuditRecords);

  if (showToast) {
    try {
      ss.toast(`Active: ${activeMaps.length} | Student rows: ${studentRows} | Created: ${created} | Deleted: ${deleted}`, 'Course Map Applied', 5);
    } catch (err) {}
  }

  return { activeCount: activeMaps.length, created, kept, deleted, studentRows, auditRows, errors };
}


function applyCourseMapTabLifecycleOnly_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allMaps = readAllCourseMaps_().filter(map => map.classroomCourseId);
  const activeMaps = allMaps.filter(map => map.use);
  const activeTabNames = {};
  let created = 0;
  let kept = 0;
  let deleted = 0;

  activeMaps.forEach(map => {
    const tabName = makeGeneratedTabName_(map, allMaps);
    activeTabNames[tabName] = true;
    let sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
      created++;
      const headers = getGcPlaceholderHeaders_();
      writeAssignmentCourseTab_(sheet, headers, []);
      sheet.getRange('A2').setValue('Waiting for Classroom progress update');
      sheet.getRange('B2').setValue(map.displayCourseName || map.classroomCourseName || '');
    } else {
      kept++;
      try { sheet.showSheet(); } catch (err) {}
    }
  });

  ss.getSheets().slice().forEach(sheet => {
    const name = sheet.getName();
    if (!name.startsWith(APP.GENERATED_TAB_PREFIX)) return;
    if (activeTabNames[name]) return;
    if (ss.getSheets().length <= 1) return;
    ss.deleteSheet(sheet);
    deleted++;
  });

  return { activeCount: activeMaps.length, created, kept, deleted };
}

function getClassroomProgressQueue_() {
  const raw = PropertiesService.getScriptProperties().getProperty(APP.CLASSROOM_PROGRESS_QUEUE_PROPERTY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

function saveClassroomProgressQueue_(state) {
  PropertiesService.getScriptProperties().setProperty(
    APP.CLASSROOM_PROGRESS_QUEUE_PROPERTY,
    JSON.stringify(state || {})
  );
}

function clearClassroomProgressQueue_() {
  PropertiesService.getScriptProperties().deleteProperty(APP.CLASSROOM_PROGRESS_QUEUE_PROPERTY);
}

function runCheckedClassroomProgressBatch_(isAutoResume) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let state = getClassroomProgressQueue_();
  if (!state || !Array.isArray(state.queue)) {
    writeClassroomProgressStatus_('NO QUEUE', 0, 0, 0, 'No Classroom progress queue exists. Run Update Progress for Checked Courses.');
    return { updatedThisRun: 0, errorsThisRun: 0, remaining: 0, total: 0 };
  }

  const started = Date.now();
  const total = Number(state.total || state.queue.length || 0);
  const masterLookup = buildMasterLookup_();
  const summaryRows = [];
  const updatedNames = [];
  const errorNames = [];
  let updatedThisRun = 0;
  let errorsThisRun = 0;

  while (state.queue.length > 0) {
    const map = state.queue.shift();
    const courseName = map.displayCourseName || map.classroomCourseName || map.classroomCourseId || 'Unknown Course';

    try {
      const result = buildOneAssignmentCourseTab_(ss, map, masterLookup);
      summaryRows.push(result.summaryRow);
      updatedNames.push(courseName);
      updatedThisRun++;
      state.completedCount = Number(state.completedCount || 0) + 1;
    } catch (err) {
      errorsThisRun++;
      state.errorCount = Number(state.errorCount || 0) + 1;
      const message = String(err && err.message ? err.message : err);
      errorNames.push(`${courseName}: ${message}`);
      if (!Array.isArray(state.errors)) state.errors = [];
      state.errors.push({ course: courseName, message, at: new Date().toISOString() });
      writeAssignmentProgressErrorTab_(ss, map, err);
    }

    state.updatedAt = new Date().toISOString();
    saveClassroomProgressQueue_(state);

    if (state.queue.length > 0 && Date.now() - started > APP.CLASSROOM_PROGRESS_BUDGET_MS) {
      break;
    }
  }

  if (summaryRows.length) {
    upsertSummaryRows_(ss, summaryRows);
  }

  const remaining = state.queue.length;
  const status = remaining > 0 ? 'RUNNING' : 'DONE';
  const detailParts = [];
  if (updatedNames.length) detailParts.push(`Updated: ${updatedNames.join(', ')}`);
  if (errorNames.length) detailParts.push(`Errors: ${errorNames.join(' | ')}`);
  if (!detailParts.length) detailParts.push('No courses processed this run.');

  writeClassroomProgressStatus_(
    status,
    total,
    Number(state.completedCount || 0),
    remaining,
    detailParts.join('\n')
  );

  if (remaining > 0) {
    scheduleClassroomProgressContinuation_();
  } else {
    clearClassroomProgressQueue_();
    removeClassroomProgressContinuationTriggers_();
  }

  return { updatedThisRun, errorsThisRun, remaining, total, isAutoResume: !!isAutoResume };
}

function writeAssignmentProgressErrorTab_(ss, map, err) {
  const tabName = makeGeneratedTabName_(map);
  const sheet = ss.getSheetByName(tabName) || ss.insertSheet(tabName);
  const headers = getGcPlaceholderHeaders_();
  writeAssignmentCourseTab_(sheet, headers, []);
  sheet.getRange('A2').setValue('ERROR loading Classroom assignment progress');
  sheet.getRange('B2').setValue(map.displayCourseName || map.classroomCourseName || '');
  sheet.getRange('C2').setValue(String(err && err.message ? err.message : err));
}

function scheduleClassroomProgressContinuation_() {
  removeClassroomProgressContinuationTriggers_();
  ScriptApp.newTrigger(APP.CLASSROOM_PROGRESS_TRIGGER_FUNCTION)
    .timeBased()
    .after(APP.CLASSROOM_PROGRESS_RESUME_DELAY_MS)
    .create();
}

function removeClassroomProgressContinuationTriggers_() {
  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === APP.CLASSROOM_PROGRESS_TRIGGER_FUNCTION)
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));
}

function writeClassroomProgressStatus_(status, total, completed, remaining, detail) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.CLASSROOM_PROGRESS_STATUS_SHEET) || ss.insertSheet(APP.CLASSROOM_PROGRESS_STATUS_SHEET);
  const rows = [[
    new Date(),
    status,
    total,
    completed,
    remaining,
    detail || ''
  ]];
  writeSimpleTable_(sheet, ['Updated At', 'Status', 'Total Checked Courses', 'Completed', 'Remaining', 'Details'], rows);
  sheet.getRange(2, 1, 1, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
  styleSimpleSheet_(sheet, 2, 6);
  sheet.setColumnWidth(6, 700);
}


function getGcPlaceholderHeaders_() {
  return [
    'Student Name',
    'Email',
    'M/F',
    'Grade',
    'Course',
    'Last Contact',
    'Last Updated',
    'Outstanding Count',
    'Past Due Missing Count',
    'Needs Marking Count',
    'Complete Count',
    'Status',
    'Last Submission Update',
    'Avg Grade %'
  ];
}


function writeClassroomRosterTab_(sheet, map, students, masterLookup) {
  const syncedAt = new Date();
  const headers = getGcPlaceholderHeaders_();
  const rows = students.map(student => {
    const profile = student.profile || {};
    const nameObj = profile.name || {};
    const studentName = nameObj.fullName || '';
    const studentEmail = profile.emailAddress || '';
    const masterInfo = findMasterInfo_(masterLookup, map.displayCourseName, studentName, studentEmail);

    return [
      studentName,
      studentEmail,
      masterInfo.gender || '',
      masterInfo.grade || '',
      map.displayCourseName || map.classroomCourseName || '',
      masterInfo.lastContact || '',
      syncedAt,
      0,
      0,
      0,
      0,
      'ROSTER LOADED',
      '',
      ''
    ];
  });

  writeAssignmentCourseTab_(sheet, headers, rows);
  if (rows.length) sheet.getRange(2, 7, rows.length, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
}

function writeClassroomRosterErrorTab_(sheet, map, err) {
  const headers = getGcPlaceholderHeaders_();
  writeAssignmentCourseTab_(sheet, headers, []);
  sheet.getRange('A2').setValue('ERROR loading Classroom student roster');
  sheet.getRange('B2').setValue(map.displayCourseName || map.classroomCourseName || '');
  sheet.getRange('C2').setValue(String(err && err.message ? err.message : err));
}

function getSelectedCourseMapForTeacher_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const allMaps = readAllCourseMaps_().filter(map => map.classroomCourseId);
  const enabledMaps = allMaps.filter(map => map.use);

  if (activeSheet.getName() === APP.COURSE_MAP_SHEET && activeSheet.getActiveRange().getRow() > 1) {
    const map = readCourseMapRow_(activeSheet, activeSheet.getActiveRange().getRow());
    if (map && map.use && map.classroomCourseId) return map;
  }

  if (activeSheet.getName().startsWith(APP.GENERATED_TAB_PREFIX)) {
    const activeTabName = activeSheet.getName();
    const match = enabledMaps.find(map => makeGeneratedTabName_(map, allMaps) === activeTabName);
    if (match) return match;
  }

  const dashboard = ss.getSheetByName(APP.DASHBOARD_SHEET);
  const selectedDisplayName = dashboard ? String((dashboard.getRange('B11').getValue() || dashboard.getRange('B10').getValue()) || '').trim() : '';
  if (!selectedDisplayName) return null;

  const selectedKey = normalizeText_(selectedDisplayName);
  return enabledMaps.find(map => normalizeText_(map.displayCourseName) === selectedKey || normalizeText_(map.classroomCourseName) === selectedKey) || null;
}


function buildOneAssignmentCourseTab_(ss, map, masterLookup) {
  const syncedAt = new Date();
  const tabName = makeGeneratedTabName_(map);
  const sheet = ss.getSheetByName(tabName) || ss.insertSheet(tabName);

  const students = listCourseStudents_(map.classroomCourseId);
  const assignments = listCourseWork_(map.classroomCourseId);
  const submissions = listAllSubmissionsForCourse_(map.classroomCourseId);
  const submissionsByUser = groupSubmissionsByUserAndWork_(submissions);

  updateMasterEmailsFromClassroomStudents_(map, students);

  const baseHeaders = [
    'Student Name',
    'Email',
    'M/F',
    'Grade',
    'Course',
    'Last Contact',
    'Last Updated',
    'Outstanding Count',
    'Past Due Missing Count',
    'Needs Marking Count',
    'Complete Count',
    'Status',
    'Last Submission Update'
  ];
  const assignmentHeaders = assignments.map(work => buildAssignmentHeader_(work));
  const headers = baseHeaders.concat(assignmentHeaders).concat(['Avg Grade %']);
  const rows = [];

  let courseOutstandingTotal = 0;
  let courseMissingTotal = 0;
  let courseNeedsMarkingTotal = 0;
  let courseCompleteTotal = 0;
  let courseGradeTotal = 0;
  let courseGradeCount = 0;
  let courseLastSubmissionUpdate = '';

  students.forEach(student => {
    const profile = student.profile || {};
    const nameObj = profile.name || {};
    const studentName = nameObj.fullName || '';
    const studentEmail = profile.emailAddress || '';
    const userSubmissions = submissionsByUser[student.userId] || {};
    const masterInfo = findMasterInfo_(masterLookup, map.displayCourseName, studentName, studentEmail);

    let completedCount = 0;
    let outstandingCount = 0;
    let missingPastDueCount = 0;
    let needsMarkingCount = 0;
    let completeCount = 0;
    let earnedPoints = 0;
    let possiblePoints = 0;
    let lastSubmissionUpdate = '';

    const assignmentCells = assignments.map(work => {
      const submission = userSubmissions[work.id];
      if (submissionComplete_(submission)) completedCount++;
      if (submissionMissing_(submission) && workPastDue_(work)) missingPastDueCount++;
      if (submissionMissing_(submission) && !workPastDue_(work)) outstandingCount++;
      if (submissionComplete_(submission)) completeCount++;
      if (submissionNeedsMarking_(submission)) needsMarkingCount++;
      const submissionUpdate = getSubmissionUpdateTime_(submission);
      if (submissionUpdate) {
        if (!lastSubmissionUpdate || submissionUpdate.getTime() > lastSubmissionUpdate.getTime()) {
          lastSubmissionUpdate = submissionUpdate;
        }
      }

      const grade = getGradeNumber_(submission);
      const maxPoints = Number(work.maxPoints || 0);
      if (grade !== null && maxPoints > 0) {
        earnedPoints += grade;
        possiblePoints += maxPoints;
      }
      return formatSubmissionCell_(submission, work);
    });

    const avgGrade = possiblePoints > 0 ? earnedPoints / possiblePoints : '';
    if (typeof avgGrade === 'number') {
      courseGradeTotal += avgGrade;
      courseGradeCount++;
    }

    if (!lastSubmissionUpdate && syncedAt && syncedAt instanceof Date) {
      lastSubmissionUpdate = syncedAt;
    }

    const lastSubmissionUpdateValue = lastSubmissionUpdate || '';
    if (lastSubmissionUpdate && String(lastSubmissionUpdateValue) > courseLastSubmissionUpdate) {
      courseLastSubmissionUpdate = String(lastSubmissionUpdateValue);
    }

    courseOutstandingTotal += outstandingCount;
    courseMissingTotal += missingPastDueCount;
    courseNeedsMarkingTotal += needsMarkingCount;
    courseCompleteTotal += completeCount;

    const status = calculateAssignmentStatus_(completedCount, assignments.length, outstandingCount, missingPastDueCount, needsMarkingCount, completeCount);
    rows.push([
      studentName,
      studentEmail,
      masterInfo.gender || '',
      masterInfo.grade || '',
      map.displayCourseName || map.classroomCourseName || '',
      masterInfo.lastContact || '',
      syncedAt,
      outstandingCount,
      missingPastDueCount,
      needsMarkingCount,
      completeCount,
      status,
      lastSubmissionUpdateValue,
    ].concat(assignmentCells).concat([avgGrade]));
  });

  writeAssignmentCourseTab_(sheet, headers, rows);

  const courseAvgGrade = courseGradeCount > 0 ? courseGradeTotal / courseGradeCount : '';
  return {
    tabName,
    studentCount: students.length,
    assignmentCount: assignments.length,
    summaryRow: [
      syncedAt,
      tabName,
      map.displayCourseName || '',
      map.classroomCourseName || '',
      students.length,
      assignments.length,
      courseOutstandingTotal,
      courseMissingTotal,
      courseNeedsMarkingTotal,
      courseCompleteTotal,
      courseLastSubmissionUpdate,
      courseAvgGrade,
      map.classroomCourseId
    ]
  };
}

function writeAssignmentCourseTab_(sheet, headers, rows) {
  removeExistingFilterIfAny_(sheet);

  const neededCols = headers.length;
  const currentCols = sheet.getMaxColumns();
  if (currentCols < neededCols) sheet.insertColumnsAfter(currentCols, neededCols - currentCols);
  if (currentCols > neededCols) sheet.deleteColumns(neededCols + 1, currentCols - neededCols);

  clearAllDataValidations_(sheet);
  sheet.clear();
  sheet.clearConditionalFormatRules();
  setValuesNoValidation_(sheet.getRange(1, 1, 1, headers.length), [headers]);
  if (rows.length) setValuesNoValidation_(sheet.getRange(2, 1, rows.length, headers.length), rows);

  styleAssignmentCourseTab_(sheet, rows.length + 1, headers.length, rows.length);
}


function styleAssignmentCourseTab_(sheet, numRows, numCols, dataRowCount) {
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(5);
  sheet.getRange(1, 1, 1, numCols)
    .setFontWeight('bold')
    .setBackground('#57b983')
    .setFontColor('#000000')
    .setWrap(true)
    .setVerticalAlignment('middle');

  sheet.getRange(1, 1, Math.max(numRows, 1), numCols)
    .setWrap(true)
    .setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true);

  const headerMap = getHeaderMap_(sheet);
  const outstandingCol = findHeaderCol_(headerMap, ['outstanding count']) || 8;
  const missingCol = findHeaderCol_(headerMap, ['past due missing count']) || 9;
  const needsMarkingCol = findHeaderCol_(headerMap, ['needs marking count']) || 10;
  const completeCol = findHeaderCol_(headerMap, ['complete count']) || 11;
  const statusCol = findHeaderCol_(headerMap, ['status']) || 12;
  const lastSubmissionCol = findHeaderCol_(headerMap, ['last submission update']) || 13;
  const avgGradeCol = findHeaderCol_(headerMap, ['avg grade %', 'average grade', 'avg grade']) || numCols;
  const assignmentStartCol = lastSubmissionCol + 1;
  const assignmentCount = Math.max(0, avgGradeCol - assignmentStartCol);

  sheet.setRowHeight(1, 60);
  sheet.setColumnWidth(1, 190);
  sheet.setColumnWidth(2, 230);
  sheet.setColumnWidth(3, 60);
  sheet.setColumnWidth(4, 70);
  sheet.setColumnWidth(5, 120);
  sheet.setColumnWidth(6, 110);
  sheet.setColumnWidth(7, 140);
  sheet.setColumnWidth(outstandingCol, 120);
  sheet.setColumnWidth(missingCol, 120);
  sheet.setColumnWidth(needsMarkingCol, 115);
  sheet.setColumnWidth(completeCol, 112);
  sheet.setColumnWidth(statusCol, 120);
  sheet.setColumnWidth(lastSubmissionCol, 155);

  if (assignmentCount > 0) sheet.setColumnWidths(assignmentStartCol, assignmentCount, 180);
  sheet.setColumnWidth(avgGradeCol, 95);

  if (dataRowCount > 0) {
    sheet.getRange(2, 6, dataRowCount, 1).setNumberFormat('yyyy-mm-dd');
    sheet.getRange(2, 7, dataRowCount, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
    sheet.getRange(2, outstandingCol, dataRowCount, 1).setNumberFormat('0');
    sheet.getRange(2, missingCol, dataRowCount, 1).setNumberFormat('0');
    sheet.getRange(2, needsMarkingCol, dataRowCount, 1).setNumberFormat('0');
    sheet.getRange(2, completeCol, dataRowCount, 1).setNumberFormat('0');
    sheet.getRange(2, lastSubmissionCol, dataRowCount, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
    sheet.getRange(2, avgGradeCol, dataRowCount, 1).setNumberFormat('0%');
  }

  sheet.hideColumns(6, 2);
  safeCreateFilter_(sheet, 1, 1, Math.max(numRows, 1), numCols);
  applyGcTabConditionalFormatting_(sheet, numRows, numCols);
}


function applyGcTabConditionalFormatting_(sheet, numRows, numCols) {
  const rules = [];
  const dataRows = Math.max(numRows - 1, 1);
  const headerMap = getHeaderMap_(sheet);
  const statusCol = findHeaderCol_(headerMap, ['status']) || 12;
  const needsMarkingCol = findHeaderCol_(headerMap, ['needs marking']);
  const avgGradeCol = findHeaderCol_(headerMap, ['avg grade %', 'average grade', 'avg grade']) || numCols;
  const lastSubmissionCol = findHeaderCol_(headerMap, ['last submission update']) || 13;
  const assignmentStartCol = lastSubmissionCol + 1;
  const assignmentCount = Math.max(0, avgGradeCol - assignmentStartCol);
  const statusRange = sheet.getRange(2, statusCol, dataRows, 1);

  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('MISSING - PAST DUE').setBackground('#f4cccc').setFontColor('#990000').setRanges([statusRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('OUTSTANDING').setBackground('#fff2cc').setFontColor('#7f6000').setRanges([statusRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('TURNED IN - NEEDS MARKING').setBackground('#f4cccc').setFontColor('#7f6000').setRanges([statusRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('COMPLETE').setBackground('#d9ead3').setFontColor('#274e13').setRanges([statusRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('NO ASSIGNMENTS').setBackground('#f3f3f3').setFontColor('#666666').setRanges([statusRange]).build());

  if (needsMarkingCol) {
    const needsMarkingRange = sheet.getRange(2, needsMarkingCol, dataRows, 1);
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThan(0).setBackground('#fff2cc').setFontColor('#7f6000').setRanges([needsMarkingRange]).build());
  }

  if (assignmentCount > 0) {
    const assignmentRange = sheet.getRange(2, assignmentStartCol, dataRows, assignmentCount);
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('MISSING - PAST DUE').setBackground('#f4cccc').setFontColor('#990000').setRanges([assignmentRange]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('OUTSTANDING').setBackground('#fff2cc').setFontColor('#7f6000').setRanges([assignmentRange]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('TURNED IN - NEEDS MARKING').setBackground('#f4cccc').setFontColor('#7f6000').setRanges([assignmentRange]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('COMPLETE').setBackground('#d9ead3').setFontColor('#274e13').setRanges([assignmentRange]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextContains('LATE').setBackground('#fce5cd').setFontColor('#7f6000').setRanges([assignmentRange]).build());
  }

  sheet.setConditionalFormatRules(rules);
}

function updateMasterEmailsFromClassroomStudents_(map, students) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const master = ss.getSheetByName(APP.MASTER_SHEET);
  if (!master || master.getLastRow() < 2) return;

  const headerMap = getHeaderMap_(master);
  const nameCol = findHeaderCol_(headerMap, ['student name', 'name', 'student']);
  const emailCol = findHeaderCol_(headerMap, ['email', 'student email']);
  const courseCol = findHeaderCol_(headerMap, ['course', 'display course', 'class']);
  if (!nameCol || !emailCol || !courseCol) return;

  const realLastRow = getRealLastRowByColumns_(master, [nameCol, emailCol, courseCol]);
  if (realLastRow < 2) return;

  const values = master.getRange(2, 1, realLastRow - 1, master.getLastColumn()).getValues();
  const courseKey = normalizeText_(map.displayCourseName);
  const classroomEmailByName = {};

  students.forEach(student => {
    const profile = student.profile || {};
    const fullName = ((profile.name || {}).fullName || '').trim();
    const email = (profile.emailAddress || '').trim();
    const key = normalizeName_(fullName);
    if (key && email) classroomEmailByName[key] = email;
  });

  let changed = false;
  values.forEach(row => {
    const rowCourseKey = normalizeText_(row[courseCol - 1]);
    if (rowCourseKey !== courseKey) return;
    const nameKey = normalizeName_(row[nameCol - 1]);
    const gcEmail = classroomEmailByName[nameKey];
    if (!gcEmail) return;
    const existing = extractEmails_(String(row[emailCol - 1] || ''));
    const merged = dedupeEmails_(existing.concat([gcEmail]));
    row[emailCol - 1] = merged.join(', ');
    changed = true;
  });

  if (changed) master.getRange(2, 1, values.length, master.getLastColumn()).setValues(values);
}

/************************************************************
 EMAIL SETTINGS / PREVIEW / SEND
 ************************************************************/
function setupEmailSettingsSheetInternal_(showAlert) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.EMAIL_SETTINGS_SHEET) || ss.insertSheet(APP.EMAIL_SETTINGS_SHEET);
  const headers = ['Course', 'Booking Link', 'Teacher Name', 'Teacher Email', 'Behind Subject', 'Behind Template', 'No Contact Subject', 'No Contact Template'];
  const existing = sheet.getLastRow() > 1 ? sheet.getDataRange().getValues() : [];
  const existingByCourse = {};

  if (existing.length > 1) {
    const oldHeaders = existing[0].map(h => normalizeText_(h));
    for (let i = 1; i < existing.length; i++) {
      const course = String(getValueByHeaderFromNormalized_(existing[i], oldHeaders, ['course'], '') || '').trim();
      if (!course) continue;
      existingByCourse[normalizeText_(normalizeCourseNameFromSource_(course))] = {
        bookingLink: getValueByHeaderFromNormalized_(existing[i], oldHeaders, ['booking link', 'link', 'help link'], ''),
        teacherName: getValueByHeaderFromNormalized_(existing[i], oldHeaders, ['teacher name', 'teacher'], ''),
        teacherEmail: getValueByHeaderFromNormalized_(existing[i], oldHeaders, ['teacher email'], ''),
        behindSubject: getValueByHeaderFromNormalized_(existing[i], oldHeaders, ['behind subject'], ''),
        behindTemplate: getValueByHeaderFromNormalized_(existing[i], oldHeaders, ['behind template'], ''),
        noContactSubject: getValueByHeaderFromNormalized_(existing[i], oldHeaders, ['no contact subject'], ''),
        noContactTemplate: getValueByHeaderFromNormalized_(existing[i], oldHeaders, ['no contact template'], '')
      };
    }
  }

  const courses = collectKnownCourses_();
  const teacherEmail = getActiveTeacherEmail_();
  const teacherName = getDefaultTeacherNameFromEmail_(teacherEmail);
  const rows = [];

  courses.forEach(course => {
    const old = existingByCourse[normalizeText_(course)] || {};
    rows.push([
      course,
      old.bookingLink || '',
      old.teacherName || teacherName,
      old.teacherEmail || teacherEmail,
      old.behindSubject || APP.DEFAULT_BEHIND_SUBJECT,
      normalizeBehindTemplate_(old.behindTemplate),
      old.noContactSubject || APP.DEFAULT_NO_CONTACT_SUBJECT,
      normalizeNoContactTemplate_(old.noContactTemplate)
    ]);
  });

  if (!rows.length) {
    rows.push(['Example Course', '', teacherName, teacherEmail, APP.DEFAULT_BEHIND_SUBJECT, APP.DEFAULT_BEHIND_TEMPLATE, APP.DEFAULT_NO_CONTACT_SUBJECT, APP.DEFAULT_NO_CONTACT_TEMPLATE]);
  }

  writeSimpleTable_(sheet, headers, rows);
  styleSimpleSheet_(sheet, rows.length + 1, headers.length);
  sheet.setColumnWidth(1, 140);
  sheet.setColumnWidth(2, 260);
  sheet.setColumnWidth(3, 160);
  sheet.setColumnWidth(4, 220);
  sheet.setColumnWidth(5, 280);
  sheet.setColumnWidth(6, 520);
  sheet.setColumnWidth(7, 280);
  sheet.setColumnWidth(8, 520);

  if (showAlert) SpreadsheetApp.getUi().alert('Email settings sheet is ready.');
}

function setupEmailPreviewAndLogSheets_(showAlert) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const preview = ss.getSheetByName(APP.EMAIL_PREVIEW_SHEET) || ss.insertSheet(APP.EMAIL_PREVIEW_SHEET);
  const log = ss.getSheetByName(APP.EMAIL_LOG_SHEET) || ss.insertSheet(APP.EMAIL_LOG_SHEET);

  if (preview.getLastRow() === 0) {
    writeSimpleTable_(preview, getEmailPreviewHeaders_(), []);
    styleEmailPreviewSheet_(preview, 1, getEmailPreviewHeaders_().length);
  }

  if (log.getLastRow() === 0) {
    writeSimpleTable_(log, ['Timestamp', 'Result', 'Detail', 'Row', 'Student', 'To', 'Status', 'Course', 'Missing Assignment(s)', 'Subject'], []);
    styleSimpleSheet_(log, 1, 10);
  }

  if (showAlert) SpreadsheetApp.getUi().alert('Email Preview and Email Log sheets are ready.');
}

function previewSelectedStudentEmails() {
  withLock_('Preview Selected Emails', () => {
    setupEmailSettingsSheetInternal_(false);
    setupEmailPreviewAndLogSheets_(false);
    EMAIL_PREVIEW_GC_CACHE_ = null;
    const drafts = buildSelectedEmailDrafts_();
    writeEmailPreview_(drafts);
    appendCommandCentreLog_(
      'PREVIEW SELECTED EMAILS',
      'DONE',
      `Ready: ${drafts.filter(d => d.sendable).length}; skipped: ${drafts.filter(d => !d.sendable).length}. Teacher must check SEND? in Email Preview before any send.`
    );
    SpreadsheetApp.getUi().alert(`Email preview created.\n\nReady to send: ${drafts.filter(d => d.sendable).length}\nSkipped: ${drafts.filter(d => !d.sendable).length}\n\nReview "${APP.EMAIL_PREVIEW_SHEET}", then check SEND? only for rows you want to send.`);
  });
}

function sendSelectedStudentEmails() {
  withLock_('Send Selected Emails', () => {
    const ui = SpreadsheetApp.getUi();
    const confirmation = ui.alert(
      'Send selected emails?',
      'This sends real emails only for rows checked SEND? in Email Preview.\n\nRun Preview Selected Emails first, review the messages, then check only the preview rows you want to send.',
      ui.ButtonSet.YES_NO
    );
    if (confirmation !== ui.Button.YES) return;

    setupEmailSettingsSheetInternal_(false);
    setupEmailPreviewAndLogSheets_(false);
    const drafts = readSelectedEmailPreviewDrafts_();
    if (!drafts.length) {
      ui.alert(`No Email Preview rows are checked SEND?.\n\nRun Preview Selected Emails, review the preview, then check SEND? for the rows to send.`);
      appendCommandCentreLog_('SEND SELECTED EMAILS', 'DONE', 'No checked SEND? rows in Email Preview.');
      return;
    }

    const sendable = drafts.filter(d => d.sendable);
    const remainingQuota = MailApp.getRemainingDailyQuota();

    if (sendable.length > remainingQuota) {
      ui.alert(`Not enough email quota.\n\nSendable emails: ${sendable.length}\nRemaining daily quota: ${remainingQuota}\n\nNothing was sent.`);
      return;
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const master = ss.getSheetByName(APP.MASTER_SHEET);
    const headerMap = getHeaderMap_(master);
    const sendEmailCol = findHeaderCol_(headerMap, ['send email?']);
    const lastSentCol = findHeaderCol_(headerMap, ['email last sent']);
    const resultCol = findHeaderCol_(headerMap, ['email result']);
    const preview = ss.getSheetByName(APP.EMAIL_PREVIEW_SHEET);
    const previewHeaderMap = getHeaderMap_(preview);
    const previewSendCol = findHeaderCol_(previewHeaderMap, ['send?', 'send']);
    const previewResultCol = findHeaderCol_(previewHeaderMap, ['result']);

    let sent = 0;
    let skipped = 0;

    drafts.forEach(draft => {
      if (!draft.sendable) {
        skipped++;
        if (resultCol && draft.rowNumber > 1) master.getRange(draft.rowNumber, resultCol).setValue(draft.result);
        if (previewResultCol) preview.getRange(draft.previewRowNumber, previewResultCol).setValue(draft.result);
        appendEmailLog_(draft, 'SKIPPED', draft.result);
        return;
      }

      try {
        const currentMasterContext = findMasterEmailContextForPreviewDraft_(master, headerMap, draft);
        if (!courseIsCheckedForEmail_(currentMasterContext.course)) {
          throw new Error(`Course is not checked in ${APP.COURSE_MAP_SHEET}.`);
        }

        MailApp.sendEmail({
          to: draft.to,
          subject: draft.subject,
          body: draft.body
        });
        sent++;
        if (sendEmailCol) master.getRange(draft.rowNumber, sendEmailCol).setValue(false);
        if (lastSentCol) master.getRange(draft.rowNumber, lastSentCol).setValue(new Date());
        if (resultCol) master.getRange(draft.rowNumber, resultCol).setValue(`SENT - ${draft.statusType}`);
        if (previewSendCol) preview.getRange(draft.previewRowNumber, previewSendCol).setValue(false);
        if (previewResultCol) preview.getRange(draft.previewRowNumber, previewResultCol).setValue(`SENT - ${draft.statusType}`);
        appendEmailLog_(draft, 'SENT', '');
      } catch (err) {
        skipped++;
        const message = `ERROR - ${err.message || err}`;
        if (resultCol && draft.rowNumber > 1) master.getRange(draft.rowNumber, resultCol).setValue(message);
        if (previewResultCol) preview.getRange(draft.previewRowNumber, previewResultCol).setValue(message);
        appendEmailLog_(draft, 'ERROR', message);
      }
    });

    setupMasterControlsAndView_(master);
    appendCommandCentreLog_('SEND SELECTED EMAILS', skipped ? 'DONE WITH SKIPS' : 'DONE', `Selected preview rows: ${drafts.length}; sent: ${sent}; skipped/errors: ${skipped}.`);
    ui.alert(`Email send complete.\n\nSent: ${sent}\nSkipped/Error: ${skipped}\n\nCheck Email Preview and Email Log.`);
  });
}

function findMasterEmailContextForPreviewDraft_(master, headerMap, draft) {
  if (!master || !draft || !draft.rowNumber || draft.rowNumber <= 1 || draft.rowNumber > master.getLastRow()) {
    throw new Error('Preview row points to a Master row that no longer exists.');
  }

  const nameCol = findHeaderCol_(headerMap, ['student name', 'name', 'student']);
  const emailCol = findHeaderCol_(headerMap, ['email', 'student email']);
  const courseCol = findHeaderCol_(headerMap, ['course', 'display course', 'class']);
  const inPowerSchoolCol = findHeaderCol_(headerMap, ['in powerschool?', 'in powerschool', 'powerschool']);
  if (!nameCol || !emailCol || !courseCol) {
    throw new Error('Master Tracker is missing required headers for email send validation.');
  }

  const masterName = String(master.getRange(draft.rowNumber, nameCol).getValue() || '').trim();
  const masterEmail = String(master.getRange(draft.rowNumber, emailCol).getValue() || '').trim();
  const masterCourse = String(master.getRange(draft.rowNumber, courseCol).getValue() || '').trim();
  const inPowerSchool = inPowerSchoolCol ? String(master.getRange(draft.rowNumber, inPowerSchoolCol).getValue() || '').trim().toUpperCase() : 'YES';

  if (!masterName || !masterCourse || inPowerSchool === 'NO') {
    throw new Error('Master row is stale or no longer active.');
  }

  if (normalizeName_(masterName) !== normalizeName_(draft.studentName)) {
    throw new Error(`Preview row no longer matches the Master student at row ${draft.rowNumber}.`);
  }

  if (normalizeText_(masterCourse) !== normalizeText_(draft.course)) {
    throw new Error(`Preview row no longer matches the Master course at row ${draft.rowNumber}.`);
  }

  const currentEmails = dedupeEmails_(extractEmails_(masterEmail));
  const previewEmails = dedupeEmails_(extractEmails_(draft.to));
  const hasCurrentRecipient = previewEmails.some(email => currentEmails.indexOf(email) !== -1);
  if (!hasCurrentRecipient) {
    throw new Error(`Preview recipient list no longer matches the Master email cell at row ${draft.rowNumber}.`);
  }

  return {
    name: masterName,
    course: masterCourse,
    emails: currentEmails
  };
}

function buildSelectedEmailDrafts_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const master = ss.getSheetByName(APP.MASTER_SHEET);
  if (!master) throw new Error(`Sheet "${APP.MASTER_SHEET}" not found.`);

  const headerMap = getHeaderMap_(master);
  const nameCol = findHeaderCol_(headerMap, ['student name', 'name', 'student']);
  const emailCol = findHeaderCol_(headerMap, ['email', 'student email']);
  const courseCol = findHeaderCol_(headerMap, ['course', 'display course', 'class']);
  const statusCol = findHeaderCol_(headerMap, ['status']);
  const sendEmailCol = findHeaderCol_(headerMap, ['send email?']);

  if (!nameCol || !emailCol || !courseCol || !statusCol || !sendEmailCol) {
    throw new Error('Master Tracker is missing required headers: Student Name, Email, Course, Status, or SEND EMAIL?.');
  }

  const realLastRow = getRealLastRowByColumns_(master, [nameCol, emailCol, courseCol]);
  if (realLastRow < 2) return [];

  const values = master.getRange(2, 1, realLastRow - 1, master.getLastColumn()).getValues();
  const settings = readEmailCourseSettings_();
  const checkedCourseKeys = buildCheckedClassroomCourseKeyLookup_();
  const drafts = [];

  values.forEach((row, index) => {
    const rowNumber = index + 2;
    if (row[sendEmailCol - 1] !== true) return;

    const studentName = String(row[nameCol - 1] || '').trim();
    const rawEmail = String(row[emailCol - 1] || '').trim();
    const toEmails = dedupeEmails_(extractEmails_(rawEmail));
    const course = normalizeCourseNameFromSource_(row[courseCol - 1]);
    const statusRaw = String(row[statusCol - 1] || '').trim();
    const statusType = emailStatusType_(statusRaw);
    const firstName = firstNameFromFullName_(studentName);
    const courseSetting = settings[normalizeText_(course)] || {};
    const teacherEmail = courseSetting.teacherEmail || getActiveTeacherEmail_();
    const teacherName = courseSetting.teacherName || getDefaultTeacherNameFromEmail_(teacherEmail);
    const link = courseSetting.bookingLink || '';

    let sendable = true;
    let result = 'READY';
    let subject = '';
    let body = '';
    let assignmentList = '';
    let gcSource = '';
    let pullDetail = '';

    if (!studentName) {
      sendable = false;
      result = 'SKIPPED - Missing student name';
    } else if (toEmails.length === 0) {
      sendable = false;
      result = 'SKIPPED - No valid email address';
    } else if (statusType !== 'BEHIND' && statusType !== 'NO_CONTACT') {
      sendable = false;
      result = `SKIPPED - Status is not BEHIND or NO CONTACT: ${statusRaw}`;
    } else if (!courseIsCheckedForEmail_(course, checkedCourseKeys)) {
      sendable = false;
      result = `SKIPPED - Course is not checked in ${APP.COURSE_MAP_SHEET}: ${course}`;
    }

    if (sendable && statusType === 'BEHIND') {
      const missingInfo = getMissingAssignmentsForStudent_(studentName, toEmails, course);
      assignmentList = missingInfo.assignmentList || '';
      gcSource = missingInfo.source || '';
      pullDetail = missingInfo.detail || missingInfo.warning || '';
      if (!assignmentList) {
        sendable = false;
        result = `SKIPPED - ${missingInfo.warning || 'No outstanding assignments found'}`;
      } else {
        const modName = firstAssignmentTitleFromList_(assignmentList) || 'Outstanding Work';
        subject = fillTemplate_(courseSetting.behindSubject || APP.DEFAULT_BEHIND_SUBJECT, {
          FIRST_NAME: firstName,
          COURSE: course,
          MOD_NAME: modName,
          MISSING_ASSIGNMENT_LIST: assignmentList,
          LINK: link,
          TEACHER_NAME: teacherName,
          TEACHER_EMAIL: teacherEmail
        });
        body = fillTemplate_(courseSetting.behindTemplate || APP.DEFAULT_BEHIND_TEMPLATE, {
          FIRST_NAME: firstName,
          COURSE: course,
          MOD_NAME: modName,
          MISSING_ASSIGNMENT_LIST: assignmentList,
          LINK: link,
          TEACHER_NAME: teacherName,
          TEACHER_EMAIL: teacherEmail
        });
      }
    }

    if (sendable && statusType === 'NO_CONTACT') {
      gcSource = '';
      pullDetail = 'NO CONTACT email does not need assignment data.';
      subject = fillTemplate_(courseSetting.noContactSubject || APP.DEFAULT_NO_CONTACT_SUBJECT, {
        FIRST_NAME: firstName,
        COURSE: course,
        MISSING_ASSIGNMENT_LIST: '',
        LINK: link,
        TEACHER_NAME: teacherName,
        TEACHER_EMAIL: teacherEmail
      });
      body = fillTemplate_(courseSetting.noContactTemplate || APP.DEFAULT_NO_CONTACT_TEMPLATE, {
        FIRST_NAME: firstName,
        COURSE: course,
        MISSING_ASSIGNMENT_LIST: '',
        LINK: link,
        TEACHER_NAME: teacherName,
        TEACHER_EMAIL: teacherEmail
      });
    }

    drafts.push({
      rowNumber,
      sendable,
      result,
      studentName,
      firstName,
      to: toEmails.join(', '),
      statusRaw,
      statusType,
      course,
      assignmentList,
      gcSource,
      pullDetail,
      subject,
      body
    });
  });

  return drafts;
}

function getMissingAssignmentsForStudent_(studentName, toEmails, course) {
  const cache = getEmailPreviewGcCache_();
  const courseKey = normalizeText_(course);
  const targetEmails = dedupeEmails_(toEmails || []).map(email => String(email || '').toLowerCase().trim());
  const targetNameKey = normalizeName_(studentName);
  const targetFirstLastKey = makeFirstLastKey_(studentName);

  if (!cache.tabs.length) {
    return {
      assignmentList: '',
      warning: 'No generated GC tabs found. Run Apply Course Map and Update Progress for Checked Courses first.',
      source: '',
      detail: 'Email preview searched for GC tabs starting with "GC -" and found none.'
    };
  }

  const preferredMatches = [];
  const fallbackMatches = [];

  cache.tabs.forEach(tab => {
    const tabCourseMatches = !!tab.courseKeys[courseKey];

    tab.studentRows.forEach(studentRecord => {
      const match = scoreEmailPreviewStudentMatch_(studentRecord, targetEmails, targetNameKey, targetFirstLastKey);
      if (!match.matched) return;

      const candidate = {
        tab,
        studentRecord,
        match,
        courseMatch: tabCourseMatches,
        score: match.score + (tabCourseMatches ? 100 : 0)
      };

      if (tabCourseMatches) preferredMatches.push(candidate);
      else fallbackMatches.push(candidate);
    });
  });

  let matches = preferredMatches.length ? preferredMatches : fallbackMatches;

  if (!matches.length) {
    return {
      assignmentList: '',
      warning: `Student not found in generated GC tabs for ${course}. Make sure the course is checked, applied, and progress has been updated.`,
      source: '',
      detail: `Checked ${cache.tabs.length} generated GC tab(s). No row matched by email, exact name, or first/last name.`
    };
  }

  matches.sort((a, b) => b.score - a.score);

  // Use every course-matched row. If there is no course-matched row, use only the best fallback row.
  const chosenMatches = preferredMatches.length ? preferredMatches.sort((a, b) => b.score - a.score) : [matches[0]];

  const seenAssignmentKeys = {};
  const missingItems = [];
  const sourceNames = {};
  const detailParts = [];
  let foundAssignmentColumns = false;
  let foundStudent = false;

  chosenMatches.forEach(candidate => {
    foundStudent = true;
    sourceNames[candidate.tab.sheetName] = true;

    const result = collectOutstandingAssignmentsFromGcRow_(candidate.tab, candidate.studentRecord.row);
    if (result.hasAssignmentColumns) foundAssignmentColumns = true;

    detailParts.push(`${candidate.tab.sheetName}: ${candidate.match.reason}; ${result.detail}`);

    result.items.forEach(item => {
      const key = `${normalizeText_(item.title)}|${item.due || ''}`;
      if (seenAssignmentKeys[key]) return;
      seenAssignmentKeys[key] = true;
      missingItems.push({
        title: item.title,
        due: item.due || '',
        source: candidate.tab.sheetName
      });
    });
  });

  const source = Object.keys(sourceNames).join(', ');

  if (foundStudent && !foundAssignmentColumns) {
    return {
      assignmentList: '',
      warning: `Student found on ${source}, but assignment progress has not been loaded on that tab yet. Run Update Progress for Checked Courses.`,
      source,
      detail: detailParts.join('\n')
    };
  }

  if (!missingItems.length) {
    return {
      assignmentList: '',
      warning: `Student found on ${source}, but no emailable outstanding assignments were found. If the course has due dates, only past-due outstanding work is included.`,
      source,
      detail: detailParts.join('\n')
    };
  }

  const lines = missingItems.map(item => {
    if (item.due) return `- ${item.title} — Due ${item.due}`;
    return `- ${item.title}`;
  });

  return {
    assignmentList: lines.join('\n'),
    warning: '',
    source,
    detail: `Pulled ${missingItems.length} assignment(s) from ${source}.\n${detailParts.join('\n')}`
  };
}

function getEmailPreviewGcCache_() {
  if (EMAIL_PREVIEW_GC_CACHE_) return EMAIL_PREVIEW_GC_CACHE_;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tabs = [];

  ss.getSheets().forEach(sheet => {
    const sheetName = sheet.getName();
    if (!sheetName.startsWith(APP.GENERATED_TAB_PREFIX)) return;

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 2 || lastCol < 2) return;

    const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = data[0] || [];
    const normalizedHeaders = headers.map(h => normalizeText_(h));

    const nameIndex = getHeaderIndex_(normalizedHeaders, ['student name', 'name', 'student'], 0);
    const emailIndex = getHeaderIndex_(normalizedHeaders, ['email', 'student email'], 1);
    const courseIndex = getHeaderIndex_(normalizedHeaders, ['course', 'display course', 'class'], 4);
    const statusIndex = getHeaderIndex_(normalizedHeaders, ['status'], 10);
    const avgGradeIndex = getHeaderIndex_(normalizedHeaders, ['avg grade %', 'average grade', 'avg grade'], -1);

    const assignmentStartIndex = statusIndex >= 0 ? statusIndex + 1 : 11;
    const assignmentEndIndex = avgGradeIndex >= 0 ? avgGradeIndex - 1 : headers.length - 1;
    const assignmentHeaders = [];

    for (let c = assignmentStartIndex; c <= assignmentEndIndex; c++) {
      const header = String(headers[c] || '').trim();
      if (!header) continue;
      assignmentHeaders.push({
        header,
        title: assignmentTitleFromHeader_(header),
        due: dueDateFromAssignmentHeader_(header),
        colIndex: c
      });
    }

    const courseKeys = {};
    const tabCourseName = sheetName.replace(APP.GENERATED_TAB_PREFIX, '');
    if (tabCourseName) courseKeys[normalizeText_(tabCourseName)] = true;

    const studentRows = [];

    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      const studentName = String(row[nameIndex] || '').trim();
      const studentEmails = dedupeEmails_(extractEmails_(String(row[emailIndex] || '')));
      const rowCourse = courseIndex >= 0 ? String(row[courseIndex] || '').trim() : '';

      if (rowCourse) courseKeys[normalizeText_(rowCourse)] = true;
      if (!studentName && !studentEmails.length) continue;

      studentRows.push({
        rowNumber: r + 1,
        row,
        studentName,
        emails: studentEmails.map(email => email.toLowerCase()),
        nameKey: normalizeName_(studentName),
        firstLastKey: makeFirstLastKey_(studentName)
      });
    }

    tabs.push({
      sheetName,
      headers,
      studentRows,
      assignmentHeaders,
      hasAssignmentColumns: assignmentHeaders.length > 0,
      courseHasDueDates: assignmentHeaders.some(item => !!item.due),
      courseKeys
    });
  });

  EMAIL_PREVIEW_GC_CACHE_ = { tabs };
  return EMAIL_PREVIEW_GC_CACHE_;
}

function scoreEmailPreviewStudentMatch_(studentRecord, targetEmails, targetNameKey, targetFirstLastKey) {
  let score = 0;
  const reasons = [];

  const emailMatches = studentRecord.emails.filter(email => targetEmails.indexOf(email) !== -1);
  if (emailMatches.length) {
    score += 50;
    reasons.push('email match');
  }

  if (targetNameKey && studentRecord.nameKey && studentRecord.nameKey === targetNameKey) {
    score += 30;
    reasons.push('exact normalized name match');
  }

  if (targetFirstLastKey && studentRecord.firstLastKey && studentRecord.firstLastKey === targetFirstLastKey) {
    score += 25;
    reasons.push('first/last name match');
  }

  return {
    matched: score > 0,
    score,
    reason: reasons.join(' + ') || 'no match'
  };
}


function collectOutstandingAssignmentsFromGcRow_(tab, studentRow) {
  if (!tab.assignmentHeaders.length) {
    return {
      hasAssignmentColumns: false,
      items: [],
      detail: 'student row found, but this GC tab has no assignment columns yet'
    };
  }

  const items = [];
  let outstandingSeen = 0;
  let skippedBecauseNotPastDue = 0;
  let skippedBecauseNoDueDate = 0;

  tab.assignmentHeaders.forEach(item => {
    const value = String(studentRow[item.colIndex] || '').trim();
    if (!isOutstandingAssignmentCell_(value)) return;

    outstandingSeen++;

    if (tab.courseHasDueDates) {
      if (!item.due) {
        skippedBecauseNoDueDate++;
        return;
      }
      if (!isDatePastDue_(item.due)) {
        skippedBecauseNotPastDue++;
        return;
      }
    }

    items.push({
      title: item.title,
      due: item.due || '',
      status: value
    });
  });

  const detailPieces = [];
  detailPieces.push(`${tab.assignmentHeaders.length} assignment column(s)`);
  detailPieces.push(`${outstandingSeen} outstanding cell(s) found`);
  detailPieces.push(`${items.length} emailable assignment(s)`);
  if (tab.courseHasDueDates) detailPieces.push('course has due dates, so only past-due outstanding work is included');
  else detailPieces.push('course has no due dates, so all outstanding work is included');
  if (skippedBecauseNotPastDue) detailPieces.push(`${skippedBecauseNotPastDue} outstanding item(s) skipped because not past due`);
  if (skippedBecauseNoDueDate) detailPieces.push(`${skippedBecauseNoDueDate} outstanding item(s) skipped because no due date while other course items have due dates`);

  return {
    hasAssignmentColumns: true,
    items,
    detail: detailPieces.join('; ')
  };
}

function writeEmailPreview_(drafts) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.EMAIL_PREVIEW_SHEET) || ss.insertSheet(APP.EMAIL_PREVIEW_SHEET);
  const headers = getEmailPreviewHeaders_();
  const rows = drafts.map(d => [
    false,
    d.sendable ? 'YES' : 'NO',
    d.rowNumber,
    d.studentName,
    d.to,
    d.statusType,
    d.course,
    d.assignmentList,
    d.gcSource || '',
    d.pullDetail || '',
    d.subject,
    d.body,
    d.result
  ]);

  writeSimpleTable_(sheet, headers, rows);
  styleEmailPreviewSheet_(sheet, rows.length + 1, headers.length);
  if (rows.length) sheet.getRange(2, 1, rows.length, 1).insertCheckboxes();
}

function styleEmailPreviewSheet_(sheet, numRows, numCols) {
  styleSimpleSheet_(sheet, numRows, numCols);
  sheet.setColumnWidth(1, 75);
  sheet.setColumnWidth(2, 90);
  sheet.setColumnWidth(3, 60);
  sheet.setColumnWidth(4, 190);
  sheet.setColumnWidth(5, 320);
  sheet.setColumnWidth(6, 120);
  sheet.setColumnWidth(7, 130);
  sheet.setColumnWidth(8, 360);
  sheet.setColumnWidth(9, 220);
  sheet.setColumnWidth(10, 520);
  sheet.setColumnWidth(11, 280);
  sheet.setColumnWidth(12, 560);
  sheet.setColumnWidth(13, 300);
}

function getEmailPreviewHeaders_() {
  return [
    'SEND?',
    'Sendable?',
    'Row',
    'Student',
    'To',
    'Status',
    'Course',
    'Missing Assignment(s)',
    'GC Source Tab',
    'Pull Detail',
    'Subject',
    'Body',
    'Result'
  ];
}

function readSelectedEmailPreviewDrafts_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.EMAIL_PREVIEW_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const headerMap = getHeaderMap_(sheet);
  const sendCol = findHeaderCol_(headerMap, ['send?', 'send']);
  const sendableCol = findHeaderCol_(headerMap, ['sendable?']);
  const rowCol = findHeaderCol_(headerMap, ['row']);
  const studentCol = findHeaderCol_(headerMap, ['student', 'student name']);
  const toCol = findHeaderCol_(headerMap, ['to']);
  const statusCol = findHeaderCol_(headerMap, ['status']);
  const courseCol = findHeaderCol_(headerMap, ['course']);
  const missingCol = findHeaderCol_(headerMap, ['missing assignment(s)', 'missing assignments']);
  const sourceCol = findHeaderCol_(headerMap, ['gc source tab']);
  const pullDetailCol = findHeaderCol_(headerMap, ['pull detail']);
  const subjectCol = findHeaderCol_(headerMap, ['subject']);
  const bodyCol = findHeaderCol_(headerMap, ['body']);
  const resultCol = findHeaderCol_(headerMap, ['result']);

  if (!sendCol || !sendableCol || !rowCol || !studentCol || !toCol || !statusCol || !courseCol || !subjectCol || !bodyCol) {
    throw new Error(`Email Preview is missing required headers. Run Preview Selected Emails again.`);
  }

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  const drafts = [];
  data.forEach((row, index) => {
    if (row[sendCol - 1] !== true) return;
    const rowNumber = Number(row[rowCol - 1] || 0);
    const sendableText = String(row[sendableCol - 1] || '').trim().toUpperCase();
    const statusType = String(row[statusCol - 1] || '').trim();
    const result = String(resultCol ? row[resultCol - 1] || '' : '').trim();
    drafts.push({
      previewRowNumber: index + 2,
      rowNumber,
      sendable: sendableText === 'YES' && rowNumber > 1,
      result: sendableText === 'YES' && rowNumber > 1 ? (result || 'READY') : (result || 'SKIPPED - Preview row is not sendable'),
      studentName: String(row[studentCol - 1] || '').trim(),
      firstName: firstNameFromFullName_(row[studentCol - 1]),
      to: String(row[toCol - 1] || '').trim(),
      statusRaw: statusType,
      statusType,
      course: String(row[courseCol - 1] || '').trim(),
      assignmentList: String(missingCol ? row[missingCol - 1] || '' : '').trim(),
      gcSource: String(sourceCol ? row[sourceCol - 1] || '' : '').trim(),
      pullDetail: String(pullDetailCol ? row[pullDetailCol - 1] || '' : '').trim(),
      subject: String(row[subjectCol - 1] || '').trim(),
      body: String(row[bodyCol - 1] || '').trim()
    });
  });

  return drafts;
}

function appendEmailLog_(draft, result, detail) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.EMAIL_LOG_SHEET) || ss.insertSheet(APP.EMAIL_LOG_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 10).setValues([['Timestamp', 'Result', 'Detail', 'Row', 'Student', 'To', 'Status', 'Course', 'Missing Assignment(s)', 'Subject']]);
  }
  sheet.appendRow([
    new Date(),
    result,
    detail,
    draft.rowNumber,
    draft.studentName,
    draft.to,
    draft.statusType,
    draft.course,
    draft.assignmentList,
    draft.subject
  ]);
}

/************************************************************
ONEDIT CONTACT LOG
 ************************************************************/
function onEdit(e) {
  if (!e) return;
  const sheet = e.range && e.range.getSheet ? e.range.getSheet() : null;
  if (!sheet) return;
  const sheetName = sheet.getName();
  if (sheetName === APP.MASTER_SHEET) {
    handleMasterContactLogEdit_(e);
    return;
  }
  if (sheetName === APP.SIMPLE_SHELL_SHEET) {
    handleSimpleShellOnEdit_(e);
    return;
  }
  if (sheetName === APP.SIMPLE_ANNOUNCEMENTS_SHEET) {
    handleSimpleAnnouncementsOnEdit_(e);
  }
}

function handleMasterContactLogEdit_(e) {
  const range = e.range;
  const sheet = range.getSheet();
  if (range.getRow() <= 1) return;
  if (range.getValue() !== true) return;

  const headerMap = getHeaderMap_(sheet);
  const logContactCol = findHeaderCol_(headerMap, ['log contact?', 'log contact']);
  if (!logContactCol || range.getColumn() !== logContactCol) return;

  const lastContactCol = findHeaderCol_(headerMap, ['last contact']);
  const nameCol = findHeaderCol_(headerMap, ['student name', 'name', 'student']);
  const emailCol = findHeaderCol_(headerMap, ['email', 'student email']);
  const courseCol = findHeaderCol_(headerMap, ['course']);
  const statusCol = findHeaderCol_(headerMap, ['status']);
  const row = range.getRow();

  if (lastContactCol) sheet.getRange(row, lastContactCol).setValue(new Date()).setNumberFormat('yyyy-mm-dd');
  range.setValue(false);

  const ss = sheet.getParent();
  const logSheet = ss.getSheetByName(APP.CONTACT_LOG_SHEET) || ss.insertSheet(APP.CONTACT_LOG_SHEET);
  if (logSheet.getLastRow() === 0) {
    logSheet.appendRow(['Timestamp', 'Student Name', 'Email', 'Course', 'Status', 'Row Number']);
  }
  logSheet.appendRow([
    new Date(),
    nameCol ? sheet.getRange(row, nameCol).getValue() : '',
    emailCol ? sheet.getRange(row, emailCol).getValue() : '',
    courseCol ? sheet.getRange(row, courseCol).getValue() : '',
    statusCol ? sheet.getRange(row, statusCol).getValue() : '',
    row
  ]);
}

function handleSimpleShellOnEdit_(e) {
  const range = e.range;
  const sheet = range.getSheet();
  const row = range.getRow();
  const col = range.getColumn();
  if (row <= SIMPLE_SHELL_HEADER_ROW) {
    if (row === 3 && col === 2 && range.getValue() === true) {
      try { populateSimpleShellInternal_(); } catch (err) {
        appendCommandCentreLog_('POPULATE SIMPLE SHELL FROM CHECKBOX', 'ERROR', err && err.message ? err.message : err);
      }
    }
    applySimpleControlValidations_(sheet, true);
    return;
  }

  ensureSimpleShellBlankTailRow_(sheet);
  styleSimpleShellSheet_(sheet);
}

function handleSimpleAnnouncementsOnEdit_(e) {
  const range = e.range;
  const sheet = range.getSheet();
  const row = range.getRow();
  const col = range.getColumn();
  if (row <= SIMPLE_ANNOUNCEMENTS_HEADER_ROW) {
    if (row === 6 && col === 2 && range.getValue() === true) {
      try { queueSimpleAnnouncementRowsInternal_({}); } catch (err) {
        appendCommandCentreLog_('QUEUE SIMPLE ANNOUNCEMENTS FROM CHECKBOX', 'ERROR', err && err.message ? err.message : err);
      }
    }
    applySimpleControlValidations_(sheet, false);
    return;
  }
  if (col === 2 || col === 3) {
    syncSimpleCourseContextRow_(sheet, row, true);
  }
  ensureSimpleAnnouncementsBlankTailRow_(sheet);
  styleSimpleAnnouncementsSheet_(sheet);
}

function syncSimpleCourseContextRow_(sheet, row, forceCourseId) {
  if (!sheet || row <= SIMPLE_ANNOUNCEMENTS_HEADER_ROW) return false;
  const isShell = sheet.getName() === APP.SIMPLE_SHELL_SHEET;
  if (isShell) return false;
  const headers = isShell ? getSimpleShellHeaders_() : getSimpleAnnouncementsHeaders_();
  const values = sheet.getRange(row, 1, 1, headers.length).getValues()[0];
  const courseName = String(values[1] || '').trim();
  if (!courseName) return false;

  const lookup = getSimpleCourseMetaLookup_();
  const idLookup = buildCourseIdLookupForApply_();
  const meta = lookup[normalizeText_(courseName)] || {};
  const mappedCourseName = String(meta.courseName || courseName || '').trim();
  const resolvedCourseId = String(
    (forceCourseId ? '' : values[2]) ||
    meta.courseId ||
    resolveCourseIdForRecord_({ courseName: mappedCourseName, section: meta.section || '' }, idLookup) ||
    resolveCourseIdForRecord_({ courseName, section: meta.section || '' }, idLookup) ||
    ''
  ).trim();

  let changed = false;
  if (mappedCourseName && mappedCourseName !== courseName) {
    values[1] = mappedCourseName;
    changed = true;
  }
  if (resolvedCourseId && String(values[2] || '').trim() !== resolvedCourseId) {
    values[2] = resolvedCourseId;
    changed = true;
  }

  if (changed) {
    setValuesNoValidation_(sheet.getRange(row, 1, 1, headers.length), [values]);
  }
  return changed;
}

/************************************************************
CLASSROOM API HELPERS
 ************************************************************/
function listActiveClassroomCourses_() {
  let pageToken;
  const courses = [];
  do {
    const response = Classroom.Courses.list({
      teacherId: 'me',
      courseStates: ['ACTIVE'],
      pageSize: 100,
      pageToken: pageToken
    });
    (response.courses || []).forEach(course => courses.push(course));
    pageToken = response.nextPageToken;
  } while (pageToken);
  courses.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  return courses;
}

function listCourseStudents_(courseId) {
  let pageToken;
  const students = [];
  do {
    const response = Classroom.Courses.Students.list(courseId, {
      pageSize: 100,
      pageToken: pageToken
    });
    (response.students || []).forEach(student => students.push(student));
    pageToken = response.nextPageToken;
  } while (pageToken);

  students.sort((a, b) => {
    const aName = (((a.profile || {}).name || {}).fullName || '').toLowerCase();
    const bName = (((b.profile || {}).name || {}).fullName || '').toLowerCase();
    return aName.localeCompare(bName);
  });
  return students;
}

function listCourseWork_(courseId) {
  let pageToken;
  const assignments = [];
  do {
    const response = Classroom.Courses.CourseWork.list(courseId, {
      pageSize: 100,
      pageToken: pageToken,
      courseWorkStates: ['PUBLISHED']
    });
    (response.courseWork || []).forEach(work => assignments.push(work));
    pageToken = response.nextPageToken;
  } while (pageToken);

  assignments.sort((a, b) => {
    const aDue = dueDateToTime_(a.dueDate);
    const bDue = dueDateToTime_(b.dueDate);
    if (aDue !== bDue) return aDue - bDue;
    const aCreated = new Date(a.creationTime || 0).getTime();
    const bCreated = new Date(b.creationTime || 0).getTime();
    if (aCreated !== bCreated) return aCreated - bCreated;
    return String(a.title || '').localeCompare(String(b.title || ''));
  });
  return assignments;
}

function listAllSubmissionsForCourse_(courseId) {
  let pageToken;
  const submissions = [];
  do {
    const response = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, '-', {
      pageSize: 100,
      pageToken: pageToken
    });
    (response.studentSubmissions || []).forEach(submission => submissions.push(submission));
    pageToken = response.nextPageToken;
  } while (pageToken);
  return submissions;
}

function groupSubmissionsByUserAndWork_(submissions) {
  const grouped = {};
  submissions.forEach(submission => {
    const userId = submission.userId || '';
    const courseWorkId = submission.courseWorkId || '';
    if (!userId || !courseWorkId) return;
    if (!grouped[userId]) grouped[userId] = {};
    grouped[userId][courseWorkId] = submission;
  });
  return grouped;
}

/************************************************************
 SUBMISSION LOGIC
 ************************************************************/
function submissionComplete_(submission) {
  if (!submission) return false;
  if (APP.COMPLETE_STATES.indexOf(submission.state) !== -1) return true;
  return getGradeNumber_(submission) !== null;
}


function submissionMissing_(submission) {
  if (!submission) return true;
  const state = String(submission.state || '').toUpperCase();
  return state === 'NEW' || state === 'CREATED' || state === '' || state === 'RECLAIMED_BY_STUDENT';
}


function submissionNeedsMarking_(submission) {
  if (!submission) return false;
  const state = String(submission.state || '').toUpperCase();
  if (state !== 'TURNED_IN') return false;
  return getGradeNumber_(submission) === null;
}

function getSubmissionUpdateTime_(submission) {
  if (!submission) return null;
  const raw = submission.updateTime || submission.creationTime || '';
  if (!raw) return null;
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date;
}

function getGradeNumber_(submission) {
  if (!submission) return null;
  if (submission.assignedGrade !== undefined && submission.assignedGrade !== null && submission.assignedGrade !== '') {
    return Number(submission.assignedGrade);
  }
  if (submission.draftGrade !== undefined && submission.draftGrade !== null && submission.draftGrade !== '') {
    return Number(submission.draftGrade);
  }
  return null;
}


function formatSubmissionCell_(submission, work) {
  if (!submission) {
    return workPastDue_(work) ? 'MISSING - PAST DUE' : 'OUTSTANDING';
  }

  const grade = getGradeNumber_(submission);
  const maxPoints = Number(work.maxPoints || 0);
  const state = String(submission.state || '').toUpperCase();
  let label = '';
  if (state === 'RETURNED') label = 'COMPLETE';
  else if (state === 'TURNED_IN') label = submissionNeedsMarking_(submission) ? 'TURNED IN - NEEDS MARKING' : 'COMPLETE';
  else if (state === 'RECLAIMED_BY_STUDENT') label = workPastDue_(work) ? 'MISSING - PAST DUE' : 'OUTSTANDING';
  else if (state === 'NEW' || state === 'CREATED' || state === '') label = workPastDue_(work) ? 'MISSING - PAST DUE' : 'OUTSTANDING';
  else if (APP.COMPLETE_STATES.indexOf(state) !== -1) label = 'COMPLETE';
  else if (grade !== null) label = 'COMPLETE';
  else label = state;

  if (grade !== null && maxPoints > 0) label += ` (${grade}/${maxPoints})`;
  else if (grade !== null) label += ` (${grade})`;

  return label;
}


function calculateAssignmentStatus_(completedCount, assignmentCount, outstandingCount, missingPastDueCount, needsMarkingCount, completeCount) {
  if (assignmentCount === 0) return 'NO ASSIGNMENTS';
  if (needsMarkingCount > 0) return 'NEEDS MARKING';
  if (missingPastDueCount > 0) return 'BEHIND';
  if (completeCount >= assignmentCount) return 'DONE';
  if (completedCount >= assignmentCount) return 'DONE';
  if (outstandingCount > 0) return 'IN PROGRESS';
  if (completedCount === 0) return 'NO WORK';
  return 'IN PROGRESS';
}

function buildAssignmentHeader_(work) {
  const title = String(work.title || 'Untitled Assignment').trim();
  const due = formatDueDate_(work.dueDate);
  const points = work.maxPoints !== undefined && work.maxPoints !== null && work.maxPoints !== '' ? `${work.maxPoints} pts` : '';
  const details = [];
  if (due) details.push(`Due ${due}`);
  if (points) details.push(points);
  return details.length ? `${title}\n${details.join(' • ')}` : title;
}

/************************************************************
 RECORD READERS / LOOKUPS
 ************************************************************/
function readRosterRecords_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.ROSTER_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => normalizeText_(h));
  const idxName = getHeaderIndex_(headers, ['name', 'student name'], 0);
  const idxGender = getHeaderIndex_(headers, ['gender', 'm/f'], 1);
  const idxGrade = getHeaderIndex_(headers, ['grade', 'gd'], 2);
  const idxRawCourse = getHeaderIndex_(headers, ['course'], 3);
  const idxDisplayCourse = getHeaderIndex_(headers, ['display course'], 4);
  const idxHere = getHeaderIndex_(headers, ['here?', 'here'], 6);
  const idxSignedIn = getHeaderIndex_(headers, ['signed in at'], 7);

  const records = [];
  for (let i = 1; i < data.length; i++) {
    const name = String(data[i][idxName] || '').trim();
    if (!name) continue;
    const rawCourse = String(data[i][idxRawCourse] || '').trim();
    const displayCourse = String(data[i][idxDisplayCourse] || '').trim() || normalizeCourseNameFromSource_(rawCourse);
    records.push({
      name,
      email: '',
      gender: data[i][idxGender] || '',
      grade: data[i][idxGrade] || '',
      rawCourse,
      displayCourse,
      here: data[i][idxHere] || '',
      signedInAt: data[i][idxSignedIn] || ''
    });
  }
  return records;
}

function readMasterRowsAsObjects_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  const headerMap = getHeaderMap_(sheet);
  const nameCol = findHeaderCol_(headerMap, ['student name', 'name', 'student']) || 1;
  const emailCol = findHeaderCol_(headerMap, ['email', 'student email']) || 2;
  const courseCol = findHeaderCol_(headerMap, ['course']) || 5;
  const realLastRow = getRealLastRowByColumns_(sheet, [nameCol, emailCol, courseCol]);
  if (realLastRow < 2) return [];

  const values = sheet.getRange(1, 1, realLastRow, APP.MASTER_HEADERS.length).getValues();
  const headers = values[0];
  const records = [];
  for (let r = 1; r < values.length; r++) {
    const obj = {};
    headers.forEach((header, index) => obj[header] = values[r][index]);
    if (String(obj['Student Name'] || '').trim() || String(obj['Course'] || '').trim()) records.push(obj);
  }
  return records;
}

function buildMasterLookup_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const master = ss.getSheetByName(APP.MASTER_SHEET);
  const records = master ? readMasterRowsAsObjects_(master) : [];
  const lookup = { byCourseEmail: {}, byCourseName: {} };

  records.forEach(row => {
    const courseKey = normalizeText_(row['Course']);
    const nameKey = normalizeName_(row['Student Name']);
    const emails = extractEmails_(String(row['Email'] || '')).map(e => e.toLowerCase());
    emails.forEach(email => {
      if (courseKey && email) lookup.byCourseEmail[`${courseKey}|${email}`] = {
        name: row['Student Name'],
        email,
        gender: row['M/F'],
        grade: row['GD'],
        displayCourse: row['Course'],
        lastContact: row['LAST CONTACT']
      };
    });
    if (courseKey && nameKey) {
      lookup.byCourseName[`${courseKey}|${nameKey}`] = {
        name: row['Student Name'],
        email: row['Email'],
        gender: row['M/F'],
        grade: row['GD'],
        displayCourse: row['Course'],
        lastContact: row['LAST CONTACT']
      };
    }
  });

  return lookup;
}

function findMasterInfo_(lookup, courseName, studentName, studentEmail) {
  const courseKey = normalizeText_(courseName);
  const emailKey = String(studentEmail || '').toLowerCase().trim();
  const nameKey = normalizeName_(studentName);

  if (courseKey && emailKey && lookup.byCourseEmail[`${courseKey}|${emailKey}`]) return lookup.byCourseEmail[`${courseKey}|${emailKey}`];
  if (courseKey && nameKey && lookup.byCourseName[`${courseKey}|${nameKey}`]) return lookup.byCourseName[`${courseKey}|${nameKey}`];
  return {};
}

function readAllCourseMaps_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.COURSE_MAP_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const maps = [];
  for (let row = 2; row <= sheet.getLastRow(); row++) {
    const map = readCourseMapRow_(sheet, row);
    if (map.classroomCourseId) maps.push(map);
  }
  return maps;
}

function readEnabledCourseMaps_() {
  return readAllCourseMaps_().filter(map => map.use && map.classroomCourseId);
}

function buildCheckedClassroomCourseKeyLookup_() {
  const lookup = {};
  readEnabledCourseMaps_().forEach(map => {
    [
      map.displayCourseName,
      map.classroomCourseName
    ].forEach(name => {
      const key = normalizeText_(normalizeCourseNameFromSource_(name));
      if (key) lookup[key] = true;
    });
  });
  return lookup;
}

function courseIsCheckedForEmail_(course, checkedCourseKeys) {
  const lookup = checkedCourseKeys || buildCheckedClassroomCourseKeyLookup_();
  const key = normalizeText_(normalizeCourseNameFromSource_(course));
  return !!(key && lookup[key]);
}

function readCourseMapRow_(sheet, rowNumber) {
  const row = sheet.getRange(rowNumber, 1, 1, 5).getValues()[0];
  return {
    use: isTruthy_(row[0]),
    displayCourseName: String(row[1] || '').trim(),
    classroomCourseName: String(row[2] || '').trim(),
    classroomCourseId: String(row[3] || '').trim(),
    notes: String(row[4] || '').trim()
  };
}

function readEmailCourseSettings_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.EMAIL_SETTINGS_SHEET);
  const settings = {};
  if (!sheet || sheet.getLastRow() < 2) return settings;

  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => normalizeText_(h));
  for (let i = 1; i < data.length; i++) {
    const courseName = String(getValueByHeaderFromNormalized_(data[i], headers, ['course'], '') || '').trim();
    if (!courseName) continue;
    settings[normalizeText_(normalizeCourseNameFromSource_(courseName))] = {
      courseName: normalizeCourseNameFromSource_(courseName),
      bookingLink: String(getValueByHeaderFromNormalized_(data[i], headers, ['booking link', 'link', 'help link'], '') || '').trim(),
      teacherName: String(getValueByHeaderFromNormalized_(data[i], headers, ['teacher name', 'teacher'], '') || '').trim(),
      teacherEmail: String(getValueByHeaderFromNormalized_(data[i], headers, ['teacher email'], '') || '').trim(),
      behindSubject: String(getValueByHeaderFromNormalized_(data[i], headers, ['behind subject'], '') || '').trim(),
      behindTemplate: String(getValueByHeaderFromNormalized_(data[i], headers, ['behind template'], '') || '').trim(),
      noContactSubject: String(getValueByHeaderFromNormalized_(data[i], headers, ['no contact subject'], '') || '').trim(),
      noContactTemplate: String(getValueByHeaderFromNormalized_(data[i], headers, ['no contact template'], '') || '').trim()
    };
  }
  return settings;
}

/************************************************************
 SHEET WRITERS / ADMIN
 ************************************************************/

function writeSummarySheet_(ss, rows) {
  const sheet = ss.getSheetByName(APP.SUMMARY_SHEET) || ss.insertSheet(APP.SUMMARY_SHEET);
  const headers = ['Synced At', 'Tab', 'Display Course', 'Classroom Course', 'Students', 'Assignments', 'Outstanding Cells', 'Missing Past Due', 'Needs Marking', 'Complete Cells', 'Last Submission Update', 'Course Avg Grade %', 'Classroom Course ID'];
  writeSimpleTable_(sheet, headers, rows);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
    sheet.getRange(2, 10, rows.length, 1).setNumberFormat('0%');
  }
  styleSimpleSheet_(sheet, rows.length + 1, headers.length);
}



function upsertSummaryRows_(ss, newRows) {
  const sheet = ss.getSheetByName(APP.SUMMARY_SHEET) || ss.insertSheet(APP.SUMMARY_SHEET);
  const headers = ['Synced At', 'Tab', 'Display Course', 'Classroom Course', 'Students', 'Assignments', 'Outstanding Cells', 'Missing Past Due', 'Needs Marking', 'Complete Cells', 'Last Submission Update', 'Course Avg Grade %', 'Classroom Course ID'];
  const existingRows = sheet.getLastRow() > 1
    ? sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues()
    : [];

  const byId = {};
  existingRows.concat(newRows || []).forEach(row => {
    // Older summary rows had no Needs Marking column. Normalize before upserting.
    if (row.length === 10) row = row.slice(0, 8).concat([0], row.slice(8));
    const id = String(row[10] || '').trim();
    const key = id || String(row[1] || row[2] || '').trim();
    if (key) byId[key] = row;
  });

  const rows = Object.values(byId).sort((a, b) => String(a[2] || '').localeCompare(String(b[2] || '')));
  writeSimpleTable_(sheet, headers, rows);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
    sheet.getRange(2, 10, rows.length, 1).setNumberFormat('0%');
  }
  styleSimpleSheet_(sheet, rows.length + 1, headers.length);
}

function writeSimpleTable_(sheet, headers, rows) {
  removeExistingFilterIfAny_(sheet);
  clearAllDataValidations_(sheet);

  const neededCols = Math.max(headers.length, 1);
  const currentCols = sheet.getMaxColumns();
  if (currentCols < neededCols) sheet.insertColumnsAfter(currentCols, neededCols - currentCols);
  else if (currentCols > neededCols) sheet.deleteColumns(neededCols + 1, currentCols - neededCols);

  clearAllDataValidations_(sheet);
  sheet.clear();
  sheet.clearConditionalFormatRules();
  setValuesNoValidation_(sheet.getRange(1, 1, 1, headers.length), [headers]);
  if (rows.length) setValuesNoValidation_(sheet.getRange(2, 1, rows.length, headers.length), rows);
}

function styleSimpleSheet_(sheet, numRows, numCols) {
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, numCols)
    .setFontWeight('bold')
    .setBackground('#57b983')
    .setFontColor('#000000')
    .setWrap(true)
    .setVerticalAlignment('middle');

  sheet.getRange(1, 1, Math.max(numRows, 1), numCols)
    .setWrap(true)
    .setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true);

  try {
    sheet.autoResizeColumns(1, numCols);
  } catch (err) {
    // Auto-resize can fail on protected or very large sheets. Styling is not critical.
  }

  safeCreateFilter_(sheet, 1, 1, Math.max(numRows, 1), numCols);
}


function hideBackendSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const keepVisible = {};

  [
    APP.DASHBOARD_SHEET,
    APP.MASTER_SHEET,
    APP.ROSTER_IMPORT_SHEET,
    APP.EMAIL_IMPORT_SHEET,
    APP.COURSE_MAP_SHEET,
    APP.EMAIL_PREVIEW_SHEET,
    APP.CLASSROOM_AUDIT_SHEET,
    APP.SIMPLE_SHELL_SHEET,
    APP.SIMPLE_ANNOUNCEMENTS_SHEET
  ].forEach(name => keepVisible[name] = true);

  ss.getSheets().forEach(sheet => {
    const name = sheet.getName();
    const isGeneratedGcTab = name.startsWith(APP.GENERATED_TAB_PREFIX);
    const shouldStayVisible = keepVisible[name] || isGeneratedGcTab;

    if (shouldStayVisible) {
      try { sheet.showSheet(); } catch (err) {}
      return;
    }

    if (ss.getSheets().filter(s => !s.isSheetHidden()).length > 1) {
      try { sheet.hideSheet(); } catch (err) {}
    }
  });

  SpreadsheetApp.getUi().alert('Backend sheets hidden. Master Tracker, import sheets, Course Map, Email Preview, Classroom audit, and generated GC course tabs remain visible.');
}

function showBackendSheets() {
  SpreadsheetApp.getActiveSpreadsheet().getSheets().forEach(sheet => sheet.showSheet());
}


function emergencyClearMasterValidations() {
  withLock_('Emergency Clear Master Validations', () => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(APP.MASTER_SHEET);
    if (!sheet) {
      SpreadsheetApp.getUi().alert(`Sheet "${APP.MASTER_SHEET}" not found.`);
      return;
    }
    removeExistingFilterIfAny_(sheet);
    clearAllDataValidations_(sheet);
    SpreadsheetApp.flush();
    setupMasterControlsAndView_(sheet);
    SpreadsheetApp.getUi().alert('Master Tracker validations were cleared and rebuilt.\n\nThis removes stale dropdown rules from columns like Email, then reapplies only the intended checkboxes and STATUS dropdown.');
  });
}

function cleanGeneratedGcTabs() {
  withLock_('Clean Generated GC Tabs', () => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let deleted = 0;
    ss.getSheets().forEach(sheet => {
      if (sheet.getName().startsWith(APP.GENERATED_TAB_PREFIX) && ss.getSheets().length > 1) {
        ss.deleteSheet(sheet);
        deleted++;
      }
    });
    SpreadsheetApp.getUi().alert(`Deleted ${deleted} generated GC tab(s).`);
  });
}

/************************************************************
 GENERAL HELPERS
 ************************************************************/
function columnToLetter_(column) {
  let temp = '';
  let letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = Math.floor((column - temp - 1) / 26);
  }
  return letter;
}

function getRealLastRowByColumns_(sheet, cols) {
  const maxRows = sheet.getMaxRows();
  let last = 1;
  const uniqueCols = cols.filter((c, i, arr) => c && arr.indexOf(c) === i);

  uniqueCols.forEach(col => {
    const values = sheet.getRange(1, col, maxRows, 1).getValues();
    for (let i = values.length - 1; i >= 1; i--) {
      if (String(values[i][0] || '').trim() !== '') {
        last = Math.max(last, i + 1);
        break;
      }
    }
  });

  return last;
}

function getHeaderMap_(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol < 1) return {};
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  return buildHeaderMapFromArray_(headers);
}

function buildHeaderMapFromArray_(headers) {
  const map = {};
  headers.forEach((header, index) => {
    const clean = normalizeText_(header);
    if (clean) map[clean] = index + 1;
  });
  return map;
}

function findHeaderCol_(headerMap, possibleNames) {
  for (let i = 0; i < possibleNames.length; i++) {
    const key = normalizeText_(possibleNames[i]);
    if (headerMap[key]) return headerMap[key];
  }
  return null;
}

function getHeaderIndex_(headers, possibleNames, fallbackIndex) {
  for (let i = 0; i < headers.length; i++) {
    if (possibleNames.indexOf(headers[i]) !== -1) return i;
  }
  return fallbackIndex;
}

function getValueByHeaderFromNormalized_(row, normalizedHeaders, possibleNames, defaultValue) {
  const idx = getHeaderIndex_(normalizedHeaders, possibleNames.map(n => normalizeText_(n)), -1);
  if (idx === -1) return defaultValue;
  return row[idx] !== undefined && row[idx] !== null ? row[idx] : defaultValue;
}

function normalizeText_(value) {
  return removeDiacritics_(String(value || ''))
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\/ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function removeDiacritics_(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function tokenizeName_(name) {
  return normalizeText_(name).split(/\s+/).filter(token => token.length > 1);
}

function normalizeName_(value) {
  return tokenizeName_(value).sort().join(' ');
}

function makePersonKey_(name) {
  return normalizeName_(name);
}

function makeStudentCourseKey_(name, course) {
  const nameKey = normalizeName_(name);
  const courseKey = normalizeText_(course);
  if (!nameKey || !courseKey) return '';
  return `${courseKey}|${nameKey}`;
}

function makeFirstLastKey_(name) {
  const parsed = parseLastFirstName_(name);
  if (!parsed.last || !parsed.first) return '';
  return `${normalizeText_(parsed.last)}|${normalizeText_(parsed.first)}`;
}

function parseLastFirstName_(name) {
  const text = String(name || '').trim();
  if (!text) return { last: '', first: '' };

  if (text.indexOf(',') !== -1) {
    const parts = text.split(',');
    const last = parts[0].trim();
    const first = String(parts.slice(1).join(' ') || '').trim().split(/\s+/)[0] || '';
    return { last, first };
  }

  const pieces = text.split(/\s+/).filter(Boolean);
  if (pieces.length < 2) return { last: '', first: pieces[0] || '' };
  return { last: pieces[pieces.length - 1], first: pieces[0] };
}

function isTruthy_(value) {
  if (value === true) return true;
  const text = String(value || '').toLowerCase().trim();
  return text === 'true' || text === 'yes' || text === 'y' || text === '1';
}

function booleanOrBlank_(value) {
  return value === true;
}

function cleanStatus_(value) {
  const clean = normalizeText_(value);
  if (!clean) return '';
  if (clean === 'on pace' || clean === 'onpace' || clean === 'in progress' || clean === 'inprogress') return 'ON PACE';
  if (clean === 'behind' || clean.indexOf('behind') !== -1) return 'BEHIND';
  if (clean === 'no contact' || clean === 'nocontact' || clean === 'no work' || clean === 'nowork') return 'NO CONTACT';
  if (clean === 'done' || clean === 'complete' || clean === 'completed') return 'DONE';
  return '';
}

function cleanStatusOrDefault_(value) {
  return cleanStatus_(value) || 'ON PACE';
}

function emailStatusType_(status) {
  const clean = cleanStatus_(status);
  if (clean === 'BEHIND') return 'BEHIND';
  if (clean === 'NO CONTACT') return 'NO_CONTACT';
  return '';
}

function extractEmails_(value) {
  const text = String(value || '').toLowerCase();
  const matches = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/g);
  return matches || [];
}

function dedupeEmails_(emails) {
  const seen = {};
  const output = [];
  emails.forEach(email => {
    const clean = String(email || '').toLowerCase().trim().replace(/^[,;]+|[,;]+$/g, '');
    if (!clean || seen[clean]) return;
    seen[clean] = true;
    output.push(clean);
  });
  return output;
}

function dedupeByNormalized_(values) {
  const seen = {};
  const output = [];
  (values || []).forEach(value => {
    const text = String(value || '').trim();
    const key = normalizeText_(text);
    if (!text || !key || seen[key]) return;
    seen[key] = true;
    output.push(text);
  });
  return output;
}

function cleanEmailCell_(value) {
  return dedupeEmails_(extractEmails_(String(value || ''))).join(', ');
}

function looksLikeHeaderRow_(value) {
  const clean = normalizeText_(value);
  return clean === 'student name' || clean === 'name' || clean.indexOf('student') !== -1 && clean.indexOf('email') !== -1;
}

function firstNameFromFullName_(fullName) {
  const text = String(fullName || '').trim();
  if (!text) return '';
  if (text.indexOf(',') !== -1) {
    const afterComma = text.split(',')[1].trim();
    return afterComma.split(/\s+/)[0] || afterComma;
  }
  return text.split(/\s+/)[0];
}


function firstAssignmentTitleFromList_(assignmentList) {
  const lines = String(assignmentList || '').split('\n').map(line => line.trim()).filter(Boolean);
  if (!lines.length) return '';
  return lines[0]
    .replace(/^[-•]\s*/, '')
    .replace(/\s+—\s+Due\s+\d{4}-\d{2}-\d{2}.*$/i, '')
    .trim();
}

function fillTemplate_(template, tokens) {
  let output = String(template || '');
  Object.keys(tokens).forEach(key => {
    const pattern = new RegExp(`\\[\\[${key}\\]\\]`, 'g');
    output = output.replace(pattern, tokens[key] || '');
  });
  return output;
}

function normalizeBehindTemplate_(value) {
  const text = String(value || '').trim();
  if (!text) return APP.DEFAULT_BEHIND_TEMPLATE;
  if (text.indexOf('[[MISSING_ASSIGNMENT_LIST]]') === -1) return APP.DEFAULT_BEHIND_TEMPLATE;
  return text;
}

function normalizeNoContactTemplate_(value) {
  const text = String(value || '').trim();
  return text || APP.DEFAULT_NO_CONTACT_TEMPLATE;
}

function collectKnownCourses_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const courseSet = {};
  const add = value => {
    const course = normalizeCourseNameFromSource_(value);
    if (course && normalizeText_(course) !== 'example course') courseSet[normalizeText_(course)] = course;
  };

  readRosterRecords_().forEach(record => add(record.displayCourse));
  const master = ss.getSheetByName(APP.MASTER_SHEET);
  if (master) readMasterRowsAsObjects_(master).forEach(row => add(row['Course']));
  readEnabledCourseMaps_().forEach(map => add(map.displayCourseName));

  ss.getSheets().forEach(sheet => {
    const name = sheet.getName();
    if (name.startsWith(APP.GENERATED_TAB_PREFIX)) add(name.replace(APP.GENERATED_TAB_PREFIX, ''));
  });

  return Object.values(courseSet).sort((a, b) => String(a).localeCompare(String(b)));
}

function normalizeCourseNameFromSource_(rawCourse) {
  const text = normalizeText_(rawCourse);
  if (text.includes('aboriginal') && text.includes('30')) return 'AB 30';
  if (text.includes('aboriginal') && text.includes('20')) return 'AB 20';
  if (text.includes('aboriginal') && text.includes('10')) return 'AB 10';
  if (text.includes('ab 30')) return 'AB 30';
  if (text.includes('ab 20')) return 'AB 20';
  if (text.includes('ab 10')) return 'AB 10';
  if (text.includes('career and life management') || text.includes('calm') || text.includes('calm 10')) return 'CALM 10';
  return String(rawCourse || '').replace(/^SPO\(A\)\s*/i, '').trim();
}

function guessDisplayCourseName_(classroomCourseName) {
  return normalizeCourseNameFromSource_(classroomCourseName);
}

function makeGeneratedTabName_(map, allMaps) {
  const label = map.displayCourseName || map.classroomCourseName || map.classroomCourseId || 'Classroom Course';
  const maps = allMaps || readAllCourseMaps_();
  const labelKey = normalizeText_(label);
  const duplicateCount = maps.filter(item => {
    const itemLabel = item.displayCourseName || item.classroomCourseName || item.classroomCourseId || 'Classroom Course';
    return normalizeText_(itemLabel) === labelKey;
  }).length;

  const suffix = duplicateCount > 1 && map.classroomCourseId
    ? ` - ${String(map.classroomCourseId).slice(-5)}`
    : '';

  let name = sanitizeSheetName_(`${APP.GENERATED_TAB_PREFIX}${label}${suffix}`);
  if (name.length > 90) name = name.substring(0, 90).trim();
  return name;
}

function sanitizeSheetName_(name) {
  return String(name || 'Classroom Course').replace(/[\\\/\?\*\[\]\:]/g, '-').substring(0, 100).trim();
}

function findGcCourseSheet_(ss, course) {
  const cleanCourse = normalizeText_(course);
  const expectedName = `${APP.GENERATED_TAB_PREFIX}${course}`;
  let sheet = ss.getSheetByName(expectedName);
  if (sheet) return sheet;

  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    const name = sheets[i].getName();
    if (!name.startsWith(APP.GENERATED_TAB_PREFIX)) continue;
    const coursePart = name.replace(APP.GENERATED_TAB_PREFIX, '');
    if (normalizeText_(coursePart) === cleanCourse) return sheets[i];
  }
  return null;
}

function assignmentTitleFromHeader_(header) {
  return String(header || '').split('\n')[0].trim();
}

function dueDateFromAssignmentHeader_(header) {
  const match = String(header || '').match(/Due\s+(\d{4}-\d{2}-\d{2})/i);
  return match ? match[1] : '';
}

function isDatePastDue_(dateText) {
  if (!dateText) return false;
  const parts = String(dateText).split('-');
  if (parts.length !== 3) return false;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!year || !month || !day) return false;

  const due = new Date(year, month - 1, day);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due.getTime() < today.getTime();
}


function isOutstandingAssignmentCell_(value) {
  const clean = String(value || '').toUpperCase().trim();
  if (!clean) return false;
  if (clean.indexOf('COMPLETE') !== -1) return false;
  if (clean.indexOf('TURNED IN - NEEDS MARKING') !== -1) return false;
  if (clean.indexOf('NEEDS MARKING') !== -1) return false;
  return clean.indexOf('OUTSTANDING') !== -1
    || clean === 'MISSING - PAST DUE'
    || clean.indexOf('MISSING') !== -1 && clean.indexOf('PAST DUE') !== -1;
}

function dueDateToTime_(dueDate) {
  if (!dueDate) return 9999999999999;
  return new Date(dueDate.year, dueDate.month - 1, dueDate.day).getTime();
}

function workPastDue_(work) {
  if (!work || !work.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(work.dueDate.year, work.dueDate.month - 1, work.dueDate.day);
  due.setHours(0, 0, 0, 0);
  return today.getTime() > due.getTime();
}

function formatDueDate_(dueDate) {
  if (!dueDate) return '';
  const year = dueDate.year;
  const month = String(dueDate.month).padStart(2, '0');
  const day = String(dueDate.day).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getActiveTeacherEmail_() {
  try {
    return Session.getActiveUser().getEmail() || '';
  } catch (err) {
    return '';
  }
}

function getDefaultTeacherNameFromEmail_(email) {
  const text = String(email || '').trim();
  if (!text || text.indexOf('@') === -1) return 'Your Teacher';
  const local = text.split('@')[0].replace(/[._-]+/g, ' ').replace(/\d+/g, '').trim();
  if (!local) return 'Your Teacher';
  return local.split(/\s+/).map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
}

function showTeacherControlPanel() {
  const html = HtmlService
    .createHtmlOutput(getTeacherControlPanelHtml_())
    .setTitle(APP.TEACHER_PANEL_TITLE || 'Next Step Teacher Control Panel')
    .setWidth(420);
  SpreadsheetApp.getUi().showSidebar(html);
}

function doGet(e) {
  if (e && e.parameter && e.parameter.nextStepBridge) {
    return handleNextStepSimpleOpsBridge_(e);
  }

  return HtmlService
    .createHtmlOutput(getTeacherWebAppHtml_(e))
    .setTitle(APP.TEACHER_PANEL_TITLE || 'Next Step Teacher Control Panel')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function handleNextStepSimpleOpsBridge_(e) {
  const rawCallback = String((e && e.parameter && e.parameter.callback) || '');
  const callback = /^[A-Za-z_$][A-Za-z0-9_$]{0,80}$/.test(rawCallback) ? rawCallback : 'nextStepSimpleOpsBridge';
  const action = String((e && e.parameter && e.parameter.action) || 'state').toLowerCase();
  let payload;

  try {
    if (action !== 'state') {
      throw new Error('Only read-only state is exposed through this bridge.');
    }
    payload = getNextStepSimpleOpsBridgeState_();
  } catch (err) {
    payload = {
      ok: false,
      source: 'apps-script',
      error: String(err && err.message ? err.message : err)
    };
  }

  const json = JSON.stringify(payload).replace(/<\/script/gi, '<\\/script');
  return ContentService
    .createTextOutput(`${callback}(${json});`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function setupCourseBuilderLite() {
  withLock_('Setup Course Builder Lite', () => {
    setupCourseBuilderLiteInternal_();

    SpreadsheetApp.getUi().alert('Course Builder Lite is ready.\n\nThis includes the Course Builder, Course Shell Template, Course Build Preview, Course Build Packet, Course Creation Review, Course Creation Apply, Live Proof Checklist, and Course Launch Checklist sheets.\n\nClassroom writes are available only through separate approved apply sheets with confirmation text, caps, duplicate checks, ID writeback, and Command Centre logging.');
  });
}

function setupCourseShellTemplate() {
  withLock_('Setup Course Shell Template', () => {
    setupCourseShellTemplateInternal_();

    SpreadsheetApp.getUi().alert('Course Shell Template is ready.\n\nUse it to plan topics, assignments, materials, announcements, dates, points, links, and publish flags. It does not apply anything by itself; each write uses a separate approved apply sheet.');
  });
}

function previewCourseBuildPlan() {
  withLock_('Preview Course Build Plan', () => {
    const summary = previewCourseBuildPlanInternal_();

    SpreadsheetApp.getUi().alert(
      `Course build preview complete.\n\n` +
      `Rows checked for build: ${summary.selected}\n` +
      `Ready for review: ${summary.ready}\n` +
      `Needs review: ${summary.review}\n` +
      `Blocked: ${summary.blocked}\n` +
      `Not selected: ${summary.notSelected}\n` +
      `Preview rows written: ${summary.rows}\n\n` +
      'No Google Classroom content was created or changed.'
    );
  });
}

function generateCourseBuildPacket() {
  withLock_('Generate Course Build Packet', () => {
    const summary = generateCourseBuildPacketInternal_();

    SpreadsheetApp.getUi().alert(
      `Course build packet generated.\n\n` +
      `Packet rows: ${summary.rows}\n` +
      `Selected plan rows: ${summary.selected}\n` +
      `Ready for review: ${summary.ready}\n` +
      `Needs review: ${summary.review}\n` +
      `Blocked: ${summary.blocked}\n\n` +
      'No Google Classroom content was created or changed.'
    );
  });
}

function buildCourseCreationReview() {
  withLock_('Build Course Creation Review', () => {
    const summary = buildCourseCreationReviewInternal_();

    SpreadsheetApp.getUi().alert(
      `Course creation review built.\n\n` +
      `Courses reviewed: ${summary.rows}\n` +
      `Ready for review: ${summary.ready}\n` +
      `Needs review: ${summary.review}\n` +
      `Blocked: ${summary.blocked}\n` +
      `Create-course plans: ${summary.createPlans}\n\n` +
      'No Google Classroom content was created or changed.'
    );
  });
}

function buildCourseLaunchChecklist() {
  withLock_('Build Course Launch Checklist', () => {
    const summary = buildCourseLaunchChecklistInternal_();

    SpreadsheetApp.getUi().alert(
      `Course launch checklist built.\n\n` +
      `Checklist rows: ${summary.rows}\n` +
      `Courses included: ${summary.courses}\n` +
      `Rows ready for review: ${summary.ready}\n` +
      `Rows needing review: ${summary.review}\n` +
      `Blocked rows: ${summary.blocked}\n\n` +
      'No Google Classroom content was created or changed.'
    );
  });
}

function buildCourseCreationApply() {
  withLock_('Build Course Creation Apply', () => {
    const summary = buildCourseCreationApplyInternal_();

    SpreadsheetApp.getUi().alert(
      `Course Creation Apply sheet built.\n\n` +
      `Courses for apply: ${summary.rows}\n` +
      `Ready: ${summary.ready}\n` +
      `Review needed: ${summary.review}\n` +
      `Blocked: ${summary.blocked}\n\n` +
      'Approval-only. No Classroom courses were created yet.'
    );
  });
}

function buildLiveProofChecklist() {
  withLock_('Build Live Proof Checklist', () => {
    const summary = buildLiveProofChecklistInternal_();

    SpreadsheetApp.getUi().alert(
      `Live Proof Checklist built.\n\n` +
      `Phases tracked: ${summary.rows}\n` +
      `Rows pre-approved: ${summary.approved}\n` +
      `Rows already marked ran: ${summary.ran}\n\n` +
      'Use one disposable test course only. Approve and run one row at a time, then verify duplicate re-run behavior before moving to the next phase.'
    );
  });
}

function refreshCourseCreationApplyStatus() {
  withLock_('Refresh Course Creation Apply Status', () => {
    const summary = refreshCourseCreationApplyStatusInternal_();

    SpreadsheetApp.getUi().alert(
      `Course Creation Apply status refreshed.\n\n` +
      `Rows checked: ${summary.rows}\n` +
      `Course exists: ${summary.exists}\n` +
      `Course archived: ${summary.archived}\n` +
      `Course not found: ${summary.notFound}\n` +
      `ID blank: ${summary.idBlank}\n` +
      `Moved to proof archive: ${summary.proofArchived}\n` +
      `Errors: ${summary.errors}\n\n` +
      'Read-only Classroom check only. No Classroom content was created, changed, archived, deleted, rostered, invited, posted, published, or graded.'
    );
  });
}

function applyApprovedCourseCreates() {
  withLock_('Apply Approved Course Creates', () => {
    const preview = getApprovedCourseCreatePreview_();
    if (!preview.approved) {
      SpreadsheetApp.getUi().alert(
        'No new course-create rows are ready to run.\n\n' +
        `Approved rows on sheet: ${preview.approvedTotal || 0}\n` +
        `Already created / already linked: ${preview.alreadyCreated || 0}\n` +
        `Approved but blocked by gates: ${preview.blockedApproved || 0}\n\n` +
        'To create a new test course shell, use a row where Approve Create? is checked, Confirm Text is CREATE COURSE, Create Course Plan? is YES, Readiness is READY FOR REVIEW, and both Existing Course ID and Created Course ID are blank.'
      );
      return;
    }

    const confirmation = SpreadsheetApp.getUi().alert(
      'Create approved test Classroom course shells?',
      `Approved create rows: ${preview.approved}\n` +
      `Will create at most this run: ${Math.min(COURSE_CREATE_MAX_PER_RUN, preview.approved)}\n\n` +
      `${preview.names.join('\n')}\n\n` +
      'This will create new Classroom courses for rows where:\n' +
      '- Confirm Text is exactly CREATE COURSE\n' +
      '- Course Plan is READY\n' +
      '- Existing Course ID / Created Course ID are blank\n' +
      '- No more than 2 rows per run\n\n' +
      'It will not edit, delete, roster, invite, post, publish, or change existing Classroom content.',
      SpreadsheetApp.getUi().ButtonSet.YES_NO
    );
    if (confirmation !== SpreadsheetApp.getUi().Button.YES) return;

    const summary = applyApprovedCourseCreatesInternal_();
    SpreadsheetApp.getUi().alert(
      `Course-create apply complete.\n\n` +
      `Rows evaluated: ${summary.rows}\n` +
      `Created this run: ${summary.created}\n` +
      `Skipped existing: ${summary.skippedExisting}\n` +
      `Blocked: ${summary.blocked}\n` +
      `Not approved: ${summary.notApproved}\n` +
      `Errors: ${summary.errors}\n` +
      `Max per run: ${COURSE_CREATE_MAX_PER_RUN}\n\n` +
      `Details are written to Course Creation Apply and Command Centre Log.`
    );
  });
}

function enableSimpleTeacherMode() {
  withLock_('Enable Tracker + Announcements Mode', () => {
    setupSimpleTeacherTabsInternal_();
    hideAdvancedSheetsForSimpleMode_();
    SpreadsheetApp.getUi().alert(
      'Tracker + Announcements mode is ON.\n\n' +
      'The Course Builder is retired from the normal workflow.\n\n' +
      'Use these pieces now:\n' +
      `- ${APP.DASHBOARD_SHEET}\n` +
      `- ${APP.MASTER_SHEET}\n` +
      `- ${APP.COURSE_MAP_SHEET}\n` +
      `- ${APP.SIMPLE_ANNOUNCEMENTS_SHEET}\n\n` +
      'Run from menu:\n' +
      '- Sync Everything\n' +
      '- Queue Simple Announcement Rows\n' +
      '- Post Selected Simple Announcements\n\n' +
      'The old builder sheets are hidden, not deleted.'
    );
  });
}

function disableSimpleTeacherMode() {
  withLock_('Disable Simple Mode', () => {
    showBackendSheets();
    SpreadsheetApp.getUi().alert('Simple Mode is OFF. All tabs are visible again.');
  });
}

function setupSimpleTeacherTabs() {
  withLock_('Setup Announcements Tab', () => {
    setupSimpleTeacherTabsInternal_();
    SpreadsheetApp.getUi().alert(
      'Announcements tab is ready.\n\n' +
      `Use ${APP.SIMPLE_ANNOUNCEMENTS_SHEET} for one-course or bulk announcements.\n\n` +
      'The Course Builder tabs are no longer part of the normal workflow.'
    );
  });
}

function loadSelectedCourseIntoSimpleShell() {
  withLock_('Load Selected Course Into Simple Shell', () => {
    const summary = loadSelectedCourseIntoSimpleShellInternal_();
    SpreadsheetApp.getUi().alert(
      `Simple Shell course loaded.\n\n` +
      `Course: ${summary.courseName || '(none)'}\n` +
      `Rows loaded: ${summary.rowsLoaded}\n` +
      `From shell template: ${summary.fromTemplate ? 'YES' : 'NO'}`
    );
  });
}

function populateSimpleShell() {
  withLock_('Populate Simple Shell', () => {
    const summary = populateSimpleShellInternal_();
    SpreadsheetApp.getUi().alert(
      `Simple Shell populated.\n\n` +
      `Course: ${summary.courseName || '(none)'}\n` +
      `Template: ${summary.templateName || '(none)'}\n` +
      `Rows loaded: ${summary.rowsLoaded}\n\n` +
      `Nothing was posted to Classroom.`
    );
  });
}

function addSimpleShellRowBelow() {
  withLock_('Add Simple Shell Row', () => {
    const rowNumber = addSimpleShellRowBelowInternal_();
    SpreadsheetApp.getUi().alert(`Inserted a new Simple Shell row below row ${rowNumber - 1}.`);
  });
}

function moveSimpleShellRowUp() {
  withLock_('Move Simple Shell Row Up', () => {
    const moved = moveSimpleShellRowInternal_(-1);
    if (!moved) SpreadsheetApp.getUi().alert('Select a Simple Shell data row (row 2 or lower) to move.');
  });
}

function moveSimpleShellRowDown() {
  withLock_('Move Simple Shell Row Down', () => {
    const moved = moveSimpleShellRowInternal_(1);
    if (!moved) SpreadsheetApp.getUi().alert('Select a Simple Shell data row (row 2 or lower) to move.');
  });
}

function deleteSelectedSimpleShellRow() {
  withLock_('Delete Simple Shell Row', () => {
    const deleted = deleteSimpleShellRowInternal_();
    if (!deleted) SpreadsheetApp.getUi().alert('Select a Simple Shell data row (row 2 or lower) to delete.');
  });
}

function applySimpleShellBuilderRows() {
  withLock_('Apply Simple Shell Rows', () => {
    requireClassroomService_();
    const summary = applySimpleShellBuilderRowsInternal_();
    SpreadsheetApp.getUi().alert(
      `Simple shell apply complete.\n\n` +
      `Rows checked: ${summary.rowsChecked}\n` +
      `Rows approved: ${summary.rowsApproved}\n` +
      `Rows blocked: ${summary.rowsBlocked}\n` +
      `Topics created: ${summary.topicsCreated}\n` +
      `Topics skipped existing: ${summary.topicsSkipped}\n` +
      `Materials created: ${summary.materialsCreated}\n` +
      `Materials skipped existing: ${summary.materialsSkipped}\n` +
      `Assignments created: ${summary.assignmentsCreated}\n` +
      `Assignments skipped existing: ${summary.assignmentsSkipped}\n` +
      `Announcements created: ${summary.announcementsCreated}\n` +
      `Announcements skipped existing: ${summary.announcementsSkipped}\n` +
      `Errors: ${summary.errors}`
    );
  });
}

function postSimpleAnnouncements() {
  withLock_('Post Simple Announcements', () => {
    requireClassroomService_();
    const summary = postSimpleAnnouncementsInternal_();
    SpreadsheetApp.getUi().alert(
      `Simple announcement apply complete.\n\n` +
      `Rows checked: ${summary.rowsChecked}\n` +
      `Rows approved: ${summary.rowsApproved}\n` +
      `Rows blocked: ${summary.rowsBlocked}\n` +
      `Announcements created: ${summary.created}\n` +
      `Announcements skipped existing: ${summary.skipped}\n` +
      `Errors: ${summary.errors}`
    );
  });
}

function buildSimpleAnnouncementQueueFromCourseMap() {
  withLock_('Queue Bulk Announcement Rows From Course Map', () => {
    const summary = queueSimpleAnnouncementRowsInternal_({ forceAllChecked: true });
    SpreadsheetApp.getUi().alert(
      `Bulk announcement queue ready.\n\n` +
      `Checked courses: ${summary.checkedCourses}\n` +
      `Rows queued: ${summary.queued}\n` +
      `Rows skipped (already queued): ${summary.skipped}\n\n` +
      `Next: check Post? on the rows you want, then run Post Simple Announcements.`
    );
  });
}

function queueSimpleAnnouncementRows() {
  withLock_('Queue Simple Announcement Rows', () => {
    const summary = queueSimpleAnnouncementRowsInternal_({});
    SpreadsheetApp.getUi().alert(
      `Announcement rows queued.\n\n` +
      `Target mode: ${summary.targetMode}\n` +
      `Rows queued: ${summary.queued}\n` +
      `Rows skipped: ${summary.skipped}\n\n` +
      `Next: check Post? on the rows you want, then run Post Selected Simple Announcements.`
    );
  });
}

function clearSelectedAnnouncementRows() {
  withLock_('Clear Selected Announcement Rows', () => {
    const summary = clearSelectedAnnouncementRowsInternal_();
    SpreadsheetApp.getUi().alert(
      `Selected announcement rows cleared.\n\n` +
      `Rows cleared: ${summary.cleared}\n` +
      `Rows skipped: ${summary.skipped}\n\n` +
      `This only clears rows in ${APP.SIMPLE_ANNOUNCEMENTS_SHEET}. Nothing was deleted or changed in Google Classroom.`
    );
  });
}

function clearAllQueuedAnnouncementRows() {
  withLock_('Clear All Queued Announcement Rows', () => {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      'Clear all queued announcement rows?',
      `This clears the announcement table rows in ${APP.SIMPLE_ANNOUNCEMENTS_SHEET} only. It does not delete, archive, or change anything in Google Classroom.`,
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;

    const summary = clearAllQueuedAnnouncementRowsInternal_();
    ui.alert(
      `Announcement queue cleared.\n\n` +
      `Rows cleared: ${summary.cleared}\n\n` +
      `Nothing was deleted or changed in Google Classroom.`
    );
  });
}

function setupSimpleTeacherTabsInternal_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const announcements = ss.getSheetByName(APP.SIMPLE_ANNOUNCEMENTS_SHEET) || ss.insertSheet(APP.SIMPLE_ANNOUNCEMENTS_SHEET);
  setupSimpleAnnouncementsSheet_(announcements);
  ensureSimpleAnnouncementsBlankTailRow_(announcements);
  styleSimpleAnnouncementsSheet_(announcements);
  announcements.showSheet();
  ss.setActiveSheet(announcements);
  appendCommandCentreLog_('SETUP ANNOUNCEMENTS TAB', 'DONE', `Announcements tab ready: ${APP.SIMPLE_ANNOUNCEMENTS_SHEET}. Course Builder tabs are retired from normal use.`);
}

function hideAdvancedSheetsForSimpleMode_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const keepVisible = {};
  [
    APP.DASHBOARD_SHEET,
    APP.MASTER_SHEET,
    APP.ROSTER_IMPORT_SHEET,
    APP.COURSE_MAP_SHEET,
    APP.SIMPLE_ANNOUNCEMENTS_SHEET,
    APP.COMMAND_CENTRE_LOG_SHEET
  ].forEach(name => keepVisible[name] = true);

  ss.getSheets().forEach(sheet => {
    const name = sheet.getName();
    const isGeneratedGcTab = name.startsWith(APP.GENERATED_TAB_PREFIX);
    const shouldStayVisible = keepVisible[name] || isGeneratedGcTab;
    if (shouldStayVisible) {
      try { sheet.showSheet(); } catch (err) {}
      return;
    }
    if (ss.getSheets().filter(s => !s.isSheetHidden()).length > 1) {
      try { sheet.hideSheet(); } catch (err) {}
    }
  });
  appendCommandCentreLog_('ENABLE SIMPLE MODE', 'DONE', 'Advanced tabs hidden; simple tabs visible.');
}

function getSimpleShellHeaders_() {
  return ['Use?', 'Order', 'Type', 'Topic', 'Title', 'Description / Instructions', 'Due Date', 'Points', 'Attachment Link', 'Publish?', 'Classroom Course ID', 'Existing Item ID', 'Created Item ID', 'Result'];
}

function getSimpleAnnouncementsHeaders_() {
  return ['Post?', 'Course Name', 'Classroom Course ID', 'Announcement Text', 'Attachment Link', 'Publish?', 'Created Announcement ID', 'Posted At', 'Result'];
}

function getSimpleTemplateLibraryHeaders_() {
  return ['Template Name', 'Order', 'Type', 'Topic', 'Title', 'Description / Instructions', 'Due Date', 'Points', 'Attachment Link', 'Publish?', 'Notes'];
}

function getSimpleShellTypeOptions_() {
  return ['TOPIC', 'MATERIAL', 'ASSIGNMENT', 'ANNOUNCEMENT'];
}

function getSimpleAnnouncementTargetModes_() {
  return ['ONE COURSE', 'SELECTED COURSES', 'ALL CHECKED COURSES'];
}

function styleSimpleShellSheet_(sheet) {
  const headers = getSimpleShellHeaders_();
  const headerRow = SIMPLE_SHELL_HEADER_ROW;
  const lastRow = Math.max(sheet.getLastRow(), headerRow);
  styleSimpleControlSheet_(sheet, headerRow, headers.length);
  applySimpleShellColumnWidths_(sheet);
  if (lastRow > headerRow) {
    const dataRows = lastRow - headerRow;
    sheet.getRange(headerRow + 1, 1, dataRows, 1).insertCheckboxes();
    sheet.getRange(headerRow + 1, 10, dataRows, 1).insertCheckboxes();
    const typeRule = SpreadsheetApp.newDataValidation().requireValueInList(getSimpleShellTypeOptions_(), true).setAllowInvalid(false).build();
    sheet.getRange(headerRow + 1, 3, dataRows, 1).setDataValidation(typeRule);
  }
  applySimpleControlValidations_(sheet, true);
}

function styleSimpleAnnouncementsSheet_(sheet) {
  const headers = getSimpleAnnouncementsHeaders_();
  const headerRow = SIMPLE_ANNOUNCEMENTS_HEADER_ROW;
  const lastRow = Math.max(sheet.getLastRow(), headerRow);
  styleSimpleControlSheet_(sheet, headerRow, headers.length);
  applySimpleAnnouncementColumnWidths_(sheet);
  if (lastRow > headerRow) {
    const dataRows = lastRow - headerRow;
    sheet.getRange(headerRow + 1, 1, dataRows, 1).insertCheckboxes();
    sheet.getRange(headerRow + 1, 6, dataRows, 1).insertCheckboxes();
    if (dataRows) sheet.getRange(headerRow + 1, 8, dataRows, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
  }
  applySimpleControlValidations_(sheet, false);
}

function styleSimpleControlSheet_(sheet, headerRow, numCols) {
  removeExistingFilterIfAny_(sheet);
  sheet.setFrozenRows(headerRow);
  if (headerRow > 1 && numCols > 2) {
    const blankControlArea = sheet.getRange(1, 3, headerRow - 1, numCols - 2);
    blankControlArea.clearContent();
    blankControlArea.clearDataValidations();
    blankControlArea.clearNote();
  }
  if (headerRow > 1) {
    sheet.setRowHeights(1, headerRow - 1, 28);
  }
  sheet.setRowHeight(headerRow, 42);
  if (sheet.getLastRow() > headerRow) {
    sheet.setRowHeights(headerRow + 1, sheet.getLastRow() - headerRow, 28);
  }
  sheet.getRange(headerRow, 1, 1, numCols)
    .setFontWeight('bold')
    .setBackground('#57b983')
    .setFontColor('#000000')
    .setWrap(true)
    .setVerticalAlignment('middle');
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), headerRow), numCols)
    .setBorder(false, false, false, false, false, false);
  sheet.getRange(1, 1, Math.max(headerRow - 1, 1), numCols)
    .setWrap(false)
    .setVerticalAlignment('middle');
  sheet.getRange(1, 1, Math.max(headerRow - 1, 1), Math.min(numCols, 2))
    .setBorder(true, true, true, true, true, true);
  sheet.getRange(headerRow, 1, Math.max(sheet.getLastRow() - headerRow + 1, 1), numCols)
    .setWrap(false)
    .setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true);
  sheet.getRange(headerRow, 1, 1, numCols).setWrap(true);
  safeCreateFilter_(sheet, headerRow, 1, Math.max(sheet.getLastRow() - headerRow + 1, 1), numCols);
}

function applySimpleShellColumnWidths_(sheet) {
  const widths = [190, 150, 132, 190, 260, 380, 122, 92, 260, 92, 178, 150, 150, 420];
  widths.forEach((width, index) => sheet.setColumnWidth(index + 1, width));
}

function applySimpleAnnouncementColumnWidths_(sheet) {
  const widths = [190, 250, 178, 520, 260, 92, 178, 164, 420];
  widths.forEach((width, index) => sheet.setColumnWidth(index + 1, width));
}

function applySimpleControlValidations_(sheet, isShell) {
  if (!sheet) return;
  const courses = getSimpleCourseChoices_();
  const courseRule = courses.length ? SpreadsheetApp.newDataValidation().requireValueInList(courses, true).setAllowInvalid(true).build() : null;
  if (isShell) {
    const templates = getSimpleTemplateNames_();
    if (courseRule) sheet.getRange('B1').setDataValidation(courseRule);
    if (templates.length) {
      const templateRule = SpreadsheetApp.newDataValidation().requireValueInList(templates, true).setAllowInvalid(true).build();
      sheet.getRange('B2').setDataValidation(templateRule);
    }
    sheet.getRange('B3:B5').insertCheckboxes();
    return;
  }

  if (courseRule) {
    sheet.getRange('B5').setDataValidation(courseRule);
    if (sheet.getMaxRows() > SIMPLE_ANNOUNCEMENTS_HEADER_ROW) {
      sheet.getRange(SIMPLE_ANNOUNCEMENTS_HEADER_ROW + 1, 2, sheet.getMaxRows() - SIMPLE_ANNOUNCEMENTS_HEADER_ROW, 1).setDataValidation(courseRule);
    }
  }
  const modeRule = SpreadsheetApp.newDataValidation().requireValueInList(getSimpleAnnouncementTargetModes_(), true).setAllowInvalid(false).build();
  sheet.getRange('B4').setDataValidation(modeRule);
  sheet.getRange('B3').insertCheckboxes();
  sheet.getRange('B6:B7').insertCheckboxes();
}

function getSimpleCourseChoices_() {
  const choices = [];
  try {
    readEnabledCourseMaps_().forEach(map => {
      const name = String(map.displayCourseName || map.classroomCourseName || '').trim();
      if (name) choices.push(name);
    });
  } catch (err) {}

  return dedupeByNormalized_(choices);
}

function setupSimpleTemplateLibraryInternal_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.SIMPLE_TEMPLATE_LIBRARY_SHEET) || ss.insertSheet(APP.SIMPLE_TEMPLATE_LIBRARY_SHEET);
  const headers = getSimpleTemplateLibraryHeaders_();
  const existingHeader = sheet.getLastRow() >= 1
    ? sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0].slice(0, headers.length).join('|')
    : '';
  if (existingHeader !== headers.join('|')) {
    const rows = buildDefaultSimpleTemplateRows_();
    writeSimpleTable_(sheet, headers, rows);
  } else if (sheet.getLastRow() < 2) {
    setValuesNoValidation_(sheet.getRange(2, 1, buildDefaultSimpleTemplateRows_().length, headers.length), buildDefaultSimpleTemplateRows_());
  }
  styleSimpleSheet_(sheet, Math.max(sheet.getLastRow(), 2), headers.length);
  if (sheet.getLastRow() > 1) {
    const typeRule = SpreadsheetApp.newDataValidation().requireValueInList(getSimpleShellTypeOptions_(), true).setAllowInvalid(false).build();
    sheet.getRange(2, 3, sheet.getLastRow() - 1, 1).setDataValidation(typeRule);
    sheet.getRange(2, 10, sheet.getLastRow() - 1, 1).insertCheckboxes();
  }
  return sheet;
}

function buildDefaultSimpleTemplateRows_() {
  const templates = ['CALM 10 Default', 'AB 10 Default', 'AB 20 Default', 'AB 30 Default', 'Custom'];
  const rows = [];
  templates.forEach(template => {
    rows.push([template, 1, 'TOPIC', 'Orientation', 'Orientation', 'Course start-up and expectations.', '', '', '', false, 'Starter topic']);
    rows.push([template, 2, 'MATERIAL', 'Orientation', 'Course Outline', 'Paste course outline, links, or opening instructions here.', '', '', 'https://', false, 'Starter material']);
    rows.push([template, 3, 'ANNOUNCEMENT', 'Orientation', 'Welcome', `Welcome to ${template.replace(' Default', '')}. Please begin with the orientation materials.`, '', '', '', false, 'Starter announcement']);
    rows.push([template, 4, 'TOPIC', 'Module 1', 'Module 1', 'First module or unit.', '', '', '', false, 'Starter topic']);
    rows.push([template, 5, 'MATERIAL', 'Module 1', 'Module 1 Instructions', 'Paste module instructions or resource link here.', '', '', 'https://', false, 'Starter material']);
    rows.push([template, 6, 'ASSIGNMENT', 'Module 1', 'Module 1 Check-In', 'Paste assignment instructions here.', '', 10, '', false, 'Starter assignment']);
  });
  return rows;
}

function getSimpleTemplateNames_() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.SIMPLE_TEMPLATE_LIBRARY_SHEET);
    return dedupeByNormalized_(readSimpleTemplateLibraryRecords_(sheet).map(row => row.templateName).filter(Boolean));
  } catch (err) {
    return ['CALM 10 Default', 'AB 10 Default', 'AB 20 Default', 'AB 30 Default', 'Custom'];
  }
}

function readSimpleTemplateLibraryRecords_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  const headers = getSimpleTemplateLibraryHeaders_();
  ensureHeaderRow_(sheet, headers);
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  return values.map((row, index) => ({
    rowNumber: index + 2,
    templateName: String(row[0] || '').trim(),
    order: row[1] || '',
    type: String(row[2] || '').trim().toUpperCase(),
    topic: String(row[3] || '').trim(),
    title: String(row[4] || '').trim(),
    description: String(row[5] || '').trim(),
    dueDate: row[6] || '',
    points: row[7] || '',
    attachmentLink: String(row[8] || '').trim(),
    publish: row[9] === true,
    notes: String(row[10] || '').trim()
  })).filter(row => row.templateName && row.type);
}

function setupSimpleShellBuilderSheet_(sheet) {
  const headers = getSimpleShellHeaders_();
  const current = sheet.getRange(SIMPLE_SHELL_HEADER_ROW, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0].slice(0, headers.length).join('|');
  const firstCourse = getSimpleStarterCourseRow_();
  const firstTemplate = getSimpleTemplateNames_()[0] || 'Custom';
  if (current !== headers.join('|')) {
    sheet.clear();
    sheet.clearConditionalFormatRules();
    setValuesNoValidation_(sheet.getRange(SIMPLE_SHELL_HEADER_ROW, 1, 1, headers.length), [headers]);
    setValuesNoValidation_(sheet.getRange(SIMPLE_SHELL_HEADER_ROW + 1, 1, 1, headers.length), [buildBlankSimpleShellRow_(firstCourse.courseId)]);
  }
  setValueIfBlank_(sheet.getRange('A1'), 'Selected Classroom Course');
  setValueIfBlank_(sheet.getRange('B1'), firstCourse.courseName || '');
  setValueIfBlank_(sheet.getRange('A2'), 'Selected Shell Template');
  setValueIfBlank_(sheet.getRange('B2'), firstTemplate);
  setValueIfBlank_(sheet.getRange('A3'), 'Populate Shell?');
  setValueIfBlank_(sheet.getRange('A4'), 'Clear Existing Draft Rows?');
  setValueIfBlank_(sheet.getRange('A5'), 'Apply Selected Rows?');
}

function setupSimpleAnnouncementsSheet_(sheet) {
  const headers = getSimpleAnnouncementsHeaders_();
  const current = sheet.getRange(SIMPLE_ANNOUNCEMENTS_HEADER_ROW, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0].slice(0, headers.length).join('|');
  if (current !== headers.join('|')) {
    sheet.clear();
    sheet.clearConditionalFormatRules();
    setValuesNoValidation_(sheet.getRange(SIMPLE_ANNOUNCEMENTS_HEADER_ROW, 1, 1, headers.length), [headers]);
  }
  setValueIfBlank_(sheet.getRange('A1'), 'Announcement Text');
  setValueIfBlank_(sheet.getRange('A2'), 'Attachment Link');
  setValueIfBlank_(sheet.getRange('A3'), 'Publish?');
  setValueIfBlank_(sheet.getRange('A4'), 'Target Mode');
  setValueIfBlank_(sheet.getRange('B4'), 'ONE COURSE');
  setValueIfBlank_(sheet.getRange('A5'), 'Course');
  setValueIfBlank_(sheet.getRange('B5'), firstCourse.courseName || '');
  setValueIfBlank_(sheet.getRange('A6'), 'Queue Announcement Rows?');
  setValueIfBlank_(sheet.getRange('A7'), 'Post Selected Announcements?');
}

function setValueIfBlank_(range, value) {
  if (String(range.getValue() || '').trim() === '') setValueNoValidation_(range, value);
}

function getSimpleCourseMetaLookup_() {
  const lookup = {};
  const put = (courseName, section, courseId) => {
    const cleanCourse = String(courseName || '').trim();
    const key = normalizeText_(cleanCourse);
    if (!cleanCourse || !key) return;
    if (!lookup[key]) {
      lookup[key] = {
        courseName: cleanCourse,
        section: String(section || '').trim(),
        courseId: String(courseId || '').trim()
      };
      return;
    }
    if (!lookup[key].section && section) lookup[key].section = String(section || '').trim();
    if (!lookup[key].courseId && courseId) lookup[key].courseId = String(courseId || '').trim();
  };

  try {
    readEnabledCourseMaps_().forEach(map => {
      put(map.displayCourseName || map.classroomCourseName, '', map.classroomCourseId);
      put(map.classroomCourseName || map.displayCourseName, '', map.classroomCourseId);
    });
  } catch (err) {}

  try {
    const creationSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.COURSE_CREATION_APPLY_SHEET);
    readCourseCreationApplyRecords_(creationSheet).forEach(row => {
      put(row.courseName, row.section, row.createdCourseId || row.existingCourseId || '');
    });
  } catch (err) {}

  try {
    const shell = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.COURSE_SHELL_TEMPLATE_SHEET);
    readCourseShellTemplateRecords_(shell).forEach(record => {
      put(record.courseName, record.section, '');
    });
  } catch (err) {}

  return lookup;
}

function getSimpleStarterCourseRow_() {
  const options = getSimpleCourseChoices_();
  const lookup = getSimpleCourseMetaLookup_();
  const first = String(options[0] || '').trim();
  const meta = lookup[normalizeText_(first)] || {};
  return {
    courseName: first || '',
    section: String(meta.section || '').trim(),
    courseId: String(meta.courseId || '').trim()
  };
}

function buildBlankSimpleShellRow_(courseName, section, courseId) {
  const resolvedCourseId = arguments.length === 1 ? courseName : courseId;
  return [false, '', '', '', '', '', '', '', '', false, resolvedCourseId || '', '', '', ''];
}

function buildBlankSimpleAnnouncementRow_(courseName, section, courseId) {
  return [false, '', '', '', '', false, '', '', ''];
}

function normalizeSimpleSheetCourseContext_(sheet, isShell) {
  if (!sheet) return;
  const headers = isShell ? getSimpleShellHeaders_() : getSimpleAnnouncementsHeaders_();
  const headerRow = isShell ? SIMPLE_SHELL_HEADER_ROW : SIMPLE_ANNOUNCEMENTS_HEADER_ROW;
  if (sheet.getLastRow() <= headerRow) return;
  const colCourse = headers.indexOf('Course Name') + 1;
  const colCourseId = headers.indexOf('Classroom Course ID') + 1;
  if (!colCourseId) return;

  const values = sheet.getRange(headerRow + 1, 1, sheet.getLastRow() - headerRow, headers.length).getValues();
  const lookup = getSimpleCourseMetaLookup_();
  const idLookup = buildCourseIdLookupForApply_();
  let changed = false;

  values.forEach((row, index) => {
    const courseName = isShell ? String(sheet.getRange('B1').getValue() || '').trim() : String(row[colCourse - 1] || '').trim();
    if (!courseName && !isShell) return;
    const key = normalizeText_(courseName);
    const meta = lookup[key] || {};
    const resolvedCourseId = String(row[colCourseId - 1] || meta.courseId || resolveCourseIdForRecord_({ courseName, section: meta.section || '' }, idLookup) || '').trim();

    if (resolvedCourseId && String(row[colCourseId - 1] || '').trim() !== resolvedCourseId) {
      row[colCourseId - 1] = resolvedCourseId;
      changed = true;
    }
    if (!isShell && meta.courseName && courseName !== meta.courseName) {
      row[colCourse - 1] = meta.courseName;
      changed = true;
    }
    if (isShell && row[0] !== true && row[0] !== false && String(row[0] || '').trim() !== '') {
      row[0] = false;
      changed = true;
    }
  });

  if (changed) {
    setValuesNoValidation_(sheet.getRange(headerRow + 1, 1, values.length, headers.length), values);
  }
}

function ensureSimpleShellBlankTailRow_(sheet) {
  if (!sheet) return;
  const headers = getSimpleShellHeaders_();
  ensureSimpleBlankTailRow_(sheet, headers, SIMPLE_SHELL_HEADER_ROW, [3, 4, 5, 6], buildBlankSimpleShellRow_, 1, 10);
}

function ensureSimpleAnnouncementsBlankTailRow_(sheet) {
  if (!sheet) return;
  const headers = getSimpleAnnouncementsHeaders_();
  trimSimpleAnnouncementTrailingBlankRows_(sheet, headers);
}

function ensureSimpleBlankTailRow_(sheet, headers, headerRow, keyCols, rowBuilder, checkboxColA, checkboxColB) {
  setValuesNoValidation_(sheet.getRange(headerRow, 1, 1, headers.length), [headers]);
  const lastRow = Math.max(sheet.getLastRow(), headerRow);
  if (lastRow <= headerRow) {
    const starter = getSimpleStarterCourseRow_();
    setValuesNoValidation_(sheet.getRange(headerRow + 1, 1, 1, headers.length), [rowBuilder(starter.courseName, starter.courseId)]);
  }

  const finalRow = Math.max(sheet.getLastRow(), headerRow + 1);
  const lastValues = sheet.getRange(finalRow, 1, 1, headers.length).getValues()[0];
  const hasTailContent = keyCols.some(col => String(lastValues[col - 1] || '').trim() !== '');
  if (!hasTailContent) return;

  sheet.insertRowsAfter(finalRow, 1);
  const seedCourse = String(lastValues[1] || sheet.getRange('B1').getValue() || '').trim();
  const seedCourseId = String(lastValues[10] || lastValues[2] || '').trim();
  const newRow = rowBuilder(seedCourse, seedCourseId);
  setValuesNoValidation_(sheet.getRange(finalRow + 1, 1, 1, headers.length), [newRow]);
  if (checkboxColA) sheet.getRange(finalRow + 1, checkboxColA).insertCheckboxes();
  if (checkboxColB) sheet.getRange(finalRow + 1, checkboxColB).insertCheckboxes();
}

function loadSelectedCourseIntoSimpleShellInternal_() {
  return populateSimpleShellInternal_();
}

function populateSimpleShellInternal_() {
  setupSimpleTeacherTabsInternal_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shell = ss.getSheetByName(APP.SIMPLE_SHELL_SHEET);
  const library = ss.getSheetByName(APP.SIMPLE_TEMPLATE_LIBRARY_SHEET);
  const headers = getSimpleShellHeaders_();
  const controls = getSimpleShellControls_(shell);
  const selectedCourseName = controls.courseName;
  const selectedTemplate = controls.templateName;

  if (!selectedCourseName) throw new Error(`Pick a course from the Selected Classroom Course dropdown in ${APP.SIMPLE_SHELL_SHEET}.`);
  if (!selectedTemplate) throw new Error(`Pick a shell template from the Selected Shell Template dropdown in ${APP.SIMPLE_SHELL_SHEET}.`);

  const records = readSimpleTemplateLibraryRecords_(library)
    .filter(record => normalizeText_(record.templateName) === normalizeText_(selectedTemplate));
  records.sort((a, b) => {
    const aOrder = Number(a.order);
    const bOrder = Number(b.order);
    if (!isNaN(aOrder) && !isNaN(bOrder) && aOrder !== bOrder) return aOrder - bOrder;
    return a.rowNumber - b.rowNumber;
  });

  const lookup = buildCourseIdLookupForApply_();
  const metaLookup = getSimpleCourseMetaLookup_();
  const meta = metaLookup[normalizeText_(selectedCourseName)] || {};
  const courseId = String(meta.courseId || resolveCourseIdForRecord_({ courseName: selectedCourseName, section: meta.section || '' }, lookup) || '').trim();
  const currentRows = readSimpleTableRows_(shell, headers, SIMPLE_SHELL_HEADER_ROW);
  const preservedCreatedRows = controls.clearDraftRows
    ? currentRows.filter(row => String(row['Created Item ID'] || '').trim())
    : currentRows.filter(row => rowHasSimpleShellContent_(row));
  const newRows = records.map(record => [
    true,
    record.order || '',
    normalizeSimpleShellType_(record.type),
    record.topic || '',
    record.title || '',
    record.description || '',
    record.dueDate || '',
    record.points || '',
    record.attachmentLink || '',
    record.publish === true,
    courseId || '',
    '',
    '',
    ''
  ]);

  const rows = preservedCreatedRows.map(row => simpleShellObjectToRow_(row))
    .concat(newRows);
  if (!rows.length) {
    rows.push(buildBlankSimpleShellRow_(courseId));
  }
  rows.push(buildBlankSimpleShellRow_(courseId));

  writeSimpleTableRows_(shell, headers, SIMPLE_SHELL_HEADER_ROW, rows);
  styleSimpleShellSheet_(shell);
  normalizeSimpleSheetCourseContext_(shell, true);
  ensureSimpleShellBlankTailRow_(shell);
  setValueNoValidation_(shell.getRange('B3'), false);
  appendCommandCentreLog_('POPULATE SIMPLE SHELL', 'DONE', `Loaded ${Math.max(rows.length - 1, 0)} editable row(s) for ${selectedCourseName} using ${selectedTemplate}.`);
  ss.setActiveSheet(shell);
  ss.setActiveSelection(shell.getRange(SIMPLE_SHELL_HEADER_ROW + 1, 3));

  return {
    courseName: selectedCourseName,
    templateName: selectedTemplate,
    rowsLoaded: Math.max(rows.length - 1, 0),
    fromTemplate: records.length > 0
  };
}

function getSimpleShellControls_(sheet) {
  return {
    courseName: String(sheet.getRange('B1').getValue() || '').trim(),
    templateName: String(sheet.getRange('B2').getValue() || '').trim(),
    populateShell: sheet.getRange('B3').getValue() === true,
    clearDraftRows: sheet.getRange('B4').getValue() === true,
    applySelectedRows: sheet.getRange('B5').getValue() === true
  };
}

function getSimpleAnnouncementControls_(sheet) {
  return {
    text: String(sheet.getRange('B1').getValue() || '').trim(),
    link: String(sheet.getRange('B2').getValue() || '').trim(),
    publish: sheet.getRange('B3').getValue() === true,
    targetMode: String(sheet.getRange('B4').getValue() || 'ONE COURSE').trim().toUpperCase(),
    courseName: String(sheet.getRange('B5').getValue() || '').trim(),
    queueRows: sheet.getRange('B6').getValue() === true,
    postSelected: sheet.getRange('B7').getValue() === true
  };
}

function writeSimpleTableRows_(sheet, headers, headerRow, rows) {
  setValuesNoValidation_(sheet.getRange(headerRow, 1, 1, headers.length), [headers]);
  const currentLast = sheet.getLastRow();
  if (currentLast > headerRow) {
    sheet.getRange(headerRow + 1, 1, currentLast - headerRow, headers.length).clearContent();
  }
  if (rows.length) setValuesNoValidation_(sheet.getRange(headerRow + 1, 1, rows.length, headers.length), rows);
}

function readSimpleTableRows_(sheet, headers, headerRow) {
  if (!sheet || sheet.getLastRow() <= headerRow) return [];
  const values = sheet.getRange(headerRow + 1, 1, sheet.getLastRow() - headerRow, headers.length).getValues();
  return values.map((row, index) => {
    const obj = { __rowNumber: headerRow + index + 1 };
    headers.forEach((header, col) => obj[header] = row[col]);
    return obj;
  }).filter(row => headers.some(header => String(row[header] || '').trim() !== ''));
}

function rowHasSimpleShellContent_(row) {
  return ['Type', 'Topic', 'Title', 'Description / Instructions', 'Attachment Link', 'Created Item ID'].some(header => String(row[header] || '').trim());
}

function simpleShellObjectToRow_(row) {
  return getSimpleShellHeaders_().map(header => row[header] || '');
}

function normalizeSimpleShellType_(value) {
  const clean = normalizeText_(value).toUpperCase();
  if (clean === 'COURSEWORK') return 'ASSIGNMENT';
  if (clean === 'COURSE WORK') return 'ASSIGNMENT';
  if (getSimpleShellTypeOptions_().indexOf(clean) !== -1) return clean;
  return clean || '';
}

function addSimpleShellRowBelowInternal_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.SIMPLE_SHELL_SHEET);
  if (!sheet) throw new Error(`Sheet "${APP.SIMPLE_SHELL_SHEET}" not found.`);

  const headers = getSimpleShellHeaders_();
  const selected = sheet.getActiveRange();
  const currentRow = Math.max(selected ? selected.getRow() : SIMPLE_SHELL_HEADER_ROW + 1, SIMPLE_SHELL_HEADER_ROW + 1);
  const insertAfter = Math.min(currentRow, sheet.getMaxRows());
  sheet.insertRowsAfter(insertAfter, 1);

  const sourceRow = Math.max(insertAfter, SIMPLE_SHELL_HEADER_ROW + 1);
  const sourceValues = sheet.getRange(sourceRow, 1, 1, headers.length).getValues()[0];
  const newRow = buildBlankSimpleShellRow_(sourceValues[10]);
  setValuesNoValidation_(sheet.getRange(insertAfter + 1, 1, 1, headers.length), [newRow]);
  styleSimpleShellSheet_(sheet);
  sheet.setActiveSelection(sheet.getRange(insertAfter + 1, 3));
  appendCommandCentreLog_('ADD SIMPLE SHELL ROW', 'DONE', `Inserted row ${insertAfter + 1}.`);
  return insertAfter + 1;
}

function buildSimpleAnnouncementQueueFromCourseMapInternal_() {
  return queueSimpleAnnouncementRowsInternal_({ forceAllChecked: true });
}

function queueSimpleAnnouncementRowsInternal_(options) {
  setupSimpleTeacherTabsInternal_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.SIMPLE_ANNOUNCEMENTS_SHEET);
  const headers = getSimpleAnnouncementsHeaders_();
  const controls = getSimpleAnnouncementControls_(sheet);
  const templateText = controls.text;
  const templateLink = controls.link;
  const templatePublish = controls.publish;
  const targetMode = options && options.forceAllChecked ? 'ALL CHECKED COURSES' : (controls.targetMode || 'ONE COURSE');

  if (!templateText) throw new Error(`Write your announcement text in B1 of ${APP.SIMPLE_ANNOUNCEMENTS_SHEET}, then run this again.`);

  const allMaps = readEnabledCourseMaps_();
  if (!allMaps.length) {
    throw new Error(`No checked courses found. Check Use? rows in ${APP.COURSE_MAP_SHEET}, then run this again.`);
  }

  let maps = [];
  if (targetMode === 'ALL CHECKED COURSES') {
    maps = allMaps;
  } else if (targetMode === 'ONE COURSE') {
    maps = allMaps.filter(map => normalizeText_(map.displayCourseName || map.classroomCourseName) === normalizeText_(controls.courseName));
    if (!maps.length) throw new Error(`Pick a checked course in B5 of ${APP.SIMPLE_ANNOUNCEMENTS_SHEET}.`);
  } else {
    maps = [{ displayCourseName: '', classroomCourseName: '', classroomCourseId: '' }];
  }

  const existing = readSimpleTableRows_(sheet, headers, SIMPLE_ANNOUNCEMENTS_HEADER_ROW);
  const existingKeys = {};
  existing.forEach(row => {
    const courseName = String(row['Course Name'] || '').trim();
    const text = String(row['Announcement Text'] || '').trim();
    if (!courseName || !text) return;
    const link = String(row['Attachment Link'] || '').trim();
    existingKeys[`${normalizeText_(courseName)}|${normalizeText_(text)}|${normalizeText_(link)}`] = true;
  });

  const pendingRows = [];
  let skipped = 0;
  maps.forEach(map => {
    const courseName = String(map.displayCourseName || map.classroomCourseName || '').trim();
    const courseId = String(map.classroomCourseId || '').trim();
    const key = `${normalizeText_(courseName)}|${normalizeText_(templateText)}|${normalizeText_(templateLink)}`;
    if (courseName && existingKeys[key]) {
      skipped++;
      return;
    }
    existingKeys[key] = true;
    pendingRows.push([
      false,
      courseName,
      courseId,
      templateText,
      templateLink,
      templatePublish,
      '',
      '',
      ''
    ]);
  });

  if (pendingRows.length) {
    const startRow = getFirstBlankSimpleAnnouncementWriteRow_(sheet, headers);
    setValuesNoValidation_(sheet.getRange(startRow, 1, pendingRows.length, headers.length), pendingRows);
    sheet.getRange(startRow, 1, pendingRows.length, 1).insertCheckboxes();
    sheet.getRange(startRow, 6, pendingRows.length, 1).insertCheckboxes();
  }

  styleSimpleAnnouncementsSheet_(sheet);
  normalizeSimpleSheetCourseContext_(sheet, false);
  trimSimpleAnnouncementTrailingBlankRows_(sheet, headers);
  setValueNoValidation_(sheet.getRange('B6'), false);
  appendCommandCentreLog_(
    'QUEUE SIMPLE ANNOUNCEMENTS',
    'DONE',
    `Target mode: ${targetMode}; queued: ${pendingRows.length}; skipped: ${skipped}.`
  );
  ss.setActiveSheet(sheet);
  if (pendingRows.length) sheet.setActiveSelection(sheet.getRange(Math.max(sheet.getLastRow() - pendingRows.length, SIMPLE_ANNOUNCEMENTS_HEADER_ROW + 1), 1));

  return {
    checkedCourses: allMaps.length,
    targetMode,
    queued: pendingRows.length,
    skipped
  };
}

function getFirstBlankSimpleAnnouncementWriteRow_(sheet, headers) {
  const firstDataRow = SIMPLE_ANNOUNCEMENTS_HEADER_ROW + 1;
  const lastRow = Math.max(sheet.getLastRow(), firstDataRow);
  const values = sheet.getRange(firstDataRow, 1, lastRow - firstDataRow + 1, headers.length).getValues();
  for (let index = 0; index < values.length; index++) {
    if (isSimpleAnnouncementValuesBlank_(values[index])) return firstDataRow + index;
  }
  return lastRow + 1;
}

function clearSelectedAnnouncementRowsInternal_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.SIMPLE_ANNOUNCEMENTS_SHEET);
  if (!sheet) throw new Error(`${APP.SIMPLE_ANNOUNCEMENTS_SHEET} is missing. Run Setup Announcements Tab first.`);

  const activeRange = sheet.getActiveRange();
  if (!activeRange) return { cleared: 0, skipped: 0 };

  const headers = getSimpleAnnouncementsHeaders_();
  const firstDataRow = SIMPLE_ANNOUNCEMENTS_HEADER_ROW + 1;
  const startRow = Math.max(activeRange.getRow(), firstDataRow);
  const endRow = Math.min(activeRange.getRow() + activeRange.getNumRows() - 1, sheet.getMaxRows());
  if (endRow < firstDataRow) return { cleared: 0, skipped: activeRange.getNumRows() };

  let cleared = 0;
  let skipped = 0;
  const rowsToDelete = [];
  for (let rowNumber = startRow; rowNumber <= endRow; rowNumber++) {
    if (isSimpleAnnouncementDataRowBlank_(sheet, rowNumber, headers)) {
      skipped++;
      continue;
    }
    rowsToDelete.push(rowNumber);
    cleared++;
  }

  deleteSimpleAnnouncementDataRows_(sheet, rowsToDelete);
  finishSimpleAnnouncementRowCleanup_(sheet);
  appendCommandCentreLog_(
    'CLEAR SELECTED ANNOUNCEMENT ROWS',
    'DONE',
    `Rows cleared: ${cleared}; rows skipped: ${skipped}. Sheet-only cleanup; no Classroom changes.`
  );
  return { cleared, skipped };
}

function clearAllQueuedAnnouncementRowsInternal_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.SIMPLE_ANNOUNCEMENTS_SHEET);
  if (!sheet) throw new Error(`${APP.SIMPLE_ANNOUNCEMENTS_SHEET} is missing. Run Setup Announcements Tab first.`);

  const headers = getSimpleAnnouncementsHeaders_();
  const firstDataRow = SIMPLE_ANNOUNCEMENTS_HEADER_ROW + 1;
  const lastRow = Math.max(sheet.getLastRow(), SIMPLE_ANNOUNCEMENTS_HEADER_ROW);
  let cleared = 0;
  const rowsToDelete = [];
  for (let rowNumber = firstDataRow; rowNumber <= lastRow; rowNumber++) {
    if (isSimpleAnnouncementDataRowBlank_(sheet, rowNumber, headers)) continue;
    rowsToDelete.push(rowNumber);
    cleared++;
  }

  deleteSimpleAnnouncementDataRows_(sheet, rowsToDelete);
  finishSimpleAnnouncementRowCleanup_(sheet);
  appendCommandCentreLog_(
    'CLEAR ALL ANNOUNCEMENT ROWS',
    'DONE',
    `Rows cleared: ${cleared}. Sheet-only cleanup; no Classroom changes.`
  );
  return { cleared };
}

function deleteSimpleAnnouncementDataRows_(sheet, rowNumbers) {
  rowNumbers
    .slice()
    .sort((a, b) => b - a)
    .forEach(rowNumber => {
      if (rowNumber > SIMPLE_ANNOUNCEMENTS_HEADER_ROW && rowNumber <= sheet.getMaxRows()) {
        sheet.deleteRow(rowNumber);
      }
    });
}

function isSimpleAnnouncementDataRowBlank_(sheet, rowNumber, headers) {
  const values = sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0];
  return isSimpleAnnouncementValuesBlank_(values);
}

function isSimpleAnnouncementValuesBlank_(values) {
  return values.every(value => value === '' || value === false || value === null);
}

function finishSimpleAnnouncementRowCleanup_(sheet) {
  trimSimpleAnnouncementTrailingBlankRows_(sheet, getSimpleAnnouncementsHeaders_());
  styleSimpleAnnouncementsSheet_(sheet);
}

function trimSimpleAnnouncementTrailingBlankRows_(sheet, headers) {
  if (!sheet) return;
  const effectiveHeaders = headers || getSimpleAnnouncementsHeaders_();
  const firstDataRow = SIMPLE_ANNOUNCEMENTS_HEADER_ROW + 1;
  let lastRow = sheet.getLastRow();
  while (lastRow >= firstDataRow) {
    const values = sheet.getRange(lastRow, 1, 1, effectiveHeaders.length).getValues()[0];
    if (!isSimpleAnnouncementValuesBlank_(values)) break;
    sheet.deleteRow(lastRow);
    lastRow--;
  }
}

function moveSimpleShellRowInternal_(direction) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.SIMPLE_SHELL_SHEET);
  if (!sheet) return false;
  const selected = sheet.getActiveRange();
  if (!selected) return false;

  const headers = getSimpleShellHeaders_();
  const row = selected.getRow();
  if (row <= SIMPLE_SHELL_HEADER_ROW) return false;
  const targetRow = row + (direction > 0 ? 1 : -1);
  if (targetRow <= SIMPLE_SHELL_HEADER_ROW || targetRow > sheet.getLastRow()) return false;

  const rowValues = sheet.getRange(row, 1, 1, headers.length).getValues()[0];
  const targetValues = sheet.getRange(targetRow, 1, 1, headers.length).getValues()[0];
  setValuesNoValidation_(sheet.getRange(row, 1, 1, headers.length), [targetValues]);
  setValuesNoValidation_(sheet.getRange(targetRow, 1, 1, headers.length), [rowValues]);
  sheet.setActiveSelection(sheet.getRange(targetRow, selected.getColumn()));
  appendCommandCentreLog_(
    direction > 0 ? 'MOVE SIMPLE SHELL ROW DOWN' : 'MOVE SIMPLE SHELL ROW UP',
    'DONE',
    `Moved row ${row} to ${targetRow}.`
  );
  return true;
}

function deleteSimpleShellRowInternal_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.SIMPLE_SHELL_SHEET);
  if (!sheet) return false;
  const selected = sheet.getActiveRange();
  if (!selected) return false;
  const row = selected.getRow();
  if (row <= SIMPLE_SHELL_HEADER_ROW) return false;

  if (sheet.getLastRow() <= SIMPLE_SHELL_HEADER_ROW + 1) {
    const blank = buildBlankSimpleShellRow_('');
    setValuesNoValidation_(sheet.getRange(SIMPLE_SHELL_HEADER_ROW + 1, 1, 1, blank.length), [blank]);
  } else {
    sheet.deleteRow(row);
  }

  styleSimpleShellSheet_(sheet);
  ensureSimpleShellBlankTailRow_(sheet);
  appendCommandCentreLog_('DELETE SIMPLE SHELL ROW', 'DONE', `Deleted row ${row}.`);
  return true;
}

function applySimpleShellBuilderRowsInternal_() {
  requireClassroomService_();
  setupSimpleTeacherTabsInternal_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shell = ss.getSheetByName(APP.SIMPLE_SHELL_SHEET);
  const controls = getSimpleShellControls_(shell);
  if (controls.populateShell) populateSimpleShellInternal_();
  normalizeSimpleSheetCourseContext_(shell, true);
  ensureSimpleShellBlankTailRow_(shell);
  const headers = getSimpleShellHeaders_();
  const rows = readSimpleTableRows_(shell, headers, SIMPLE_SHELL_HEADER_ROW);
  const summary = {
    rowsChecked: rows.length,
    rowsApproved: 0,
    rowsBlocked: 0,
    topicsCreated: 0,
    topicsSkipped: 0,
    assignmentsCreated: 0,
    assignmentsSkipped: 0,
    materialsCreated: 0,
    materialsSkipped: 0,
    announcementsCreated: 0,
    announcementsSkipped: 0,
    errors: 0
  };
  const topicCache = {};
  const existingCache = {};
  const output = shell.getRange(SIMPLE_SHELL_HEADER_ROW + 1, 1, Math.max(shell.getLastRow() - SIMPLE_SHELL_HEADER_ROW, 0), headers.length).getValues();

  rows.forEach(row => {
    if (row['Use?'] !== true) return;
    summary.rowsApproved++;
    const outputIndex = row.__rowNumber - SIMPLE_SHELL_HEADER_ROW - 1;
    const type = normalizeSimpleShellType_(row['Type']);
    const courseId = String(row['Classroom Course ID'] || '').trim();
    const topicName = String(row['Topic'] || '').trim();
    const title = String(row['Title'] || '').trim();
    const description = String(row['Description / Instructions'] || '').trim();
    const existingItemId = String(row['Existing Item ID'] || '').trim();
    const createdItemId = String(row['Created Item ID'] || '').trim();
    const textKey = type === 'ANNOUNCEMENT' ? (description || title) : title;
    const blockReasons = [];

    if (createdItemId) {
      writeSimpleShellResult_(output, outputIndex, `SKIPPED - Already created (${createdItemId}).`, createdItemId);
      return;
    }
    if (existingItemId) {
      writeSimpleShellResult_(output, outputIndex, `SKIPPED - Existing item linked (${existingItemId}).`, existingItemId);
      return;
    }
    if (summary.topicsCreated + summary.assignmentsCreated + summary.materialsCreated + summary.announcementsCreated >= SIMPLE_SHELL_CREATE_MAX_PER_RUN) {
      writeSimpleShellResult_(output, outputIndex, `SKIPPED - Run cap ${SIMPLE_SHELL_CREATE_MAX_PER_RUN} reached.`, '');
      return;
    }
    if (!courseId) blockReasons.push('Classroom Course ID missing.');
    if (!type) blockReasons.push('Type missing.');
    if (type === 'TOPIC' && !(topicName || title)) blockReasons.push('Topic or Title missing.');
    if ((type === 'MATERIAL' || type === 'ASSIGNMENT') && !title) blockReasons.push('Title missing.');
    if (type === 'ANNOUNCEMENT' && !textKey) blockReasons.push('Announcement text missing.');
    if (getSimpleShellTypeOptions_().indexOf(type) === -1) blockReasons.push(`Unsupported Type: ${type}.`);
    if (blockReasons.length) {
      summary.rowsBlocked++;
      writeSimpleShellResult_(output, outputIndex, `BLOCKED - ${blockReasons.join(' ')}`, '');
      return;
    }

    try {
      if (!topicCache[courseId]) topicCache[courseId] = getClassroomTopicsByName_(courseId);
      let createdId = '';
      if (type === 'TOPIC') {
        const topicToCreate = topicName || title;
        const duplicate = topicCache[courseId][normalizeText_(topicToCreate)];
        if (duplicate && duplicate.id) {
          summary.topicsSkipped++;
          writeSimpleShellResult_(output, outputIndex, `SKIPPED - Topic already exists (${duplicate.id}).`, duplicate.id);
          return;
        }
        const created = createClassroomTopic_(courseId, topicToCreate);
        createdId = String(created && (created.topicId || created.id) || '').trim();
        topicCache[courseId][normalizeText_(topicToCreate)] = { id: createdId, status: 'EXISTS', name: topicToCreate };
        summary.topicsCreated++;
      } else {
        const topicId = topicName && topicCache[courseId][normalizeText_(topicName)]
          ? topicCache[courseId][normalizeText_(topicName)].id
          : '';
        if (topicName && !topicId) {
          summary.rowsBlocked++;
          writeSimpleShellResult_(output, outputIndex, 'BLOCKED - Topic is not in Classroom yet. Create/apply the topic row first.', '');
          return;
        }
        const kind = type === 'ASSIGNMENT' ? 'ASSIGNMENT' : type === 'MATERIAL' ? 'MATERIAL' : 'ANNOUNCEMENT';
        const config = getCourseworkApplyConfig_(kind);
        const cacheKey = `${kind}|${courseId}`;
        if (!existingCache[cacheKey]) existingCache[cacheKey] = config.existingLookup(courseId);
        const duplicateKey = normalizeText_(kind === 'ANNOUNCEMENT' ? textKey : title);
        const duplicate = existingCache[cacheKey][duplicateKey];
        if (duplicate && duplicate.id) {
          if (kind === 'ASSIGNMENT') summary.assignmentsSkipped++;
          if (kind === 'MATERIAL') summary.materialsSkipped++;
          if (kind === 'ANNOUNCEMENT') summary.announcementsSkipped++;
          writeSimpleShellResult_(output, outputIndex, `SKIPPED - ${kind} already exists (${duplicate.id}).`, duplicate.id);
          return;
        }
        const applyRow = simpleShellRowToCourseworkApplyRow_(row, topicId, kind);
        const created = config.create(courseId, applyRow);
        createdId = String(created && (created.id || created.courseWorkMaterial && created.courseWorkMaterial.id) || '').trim();
        existingCache[cacheKey][duplicateKey] = { id: createdId, status: 'EXISTS' };
        if (kind === 'ASSIGNMENT') summary.assignmentsCreated++;
        if (kind === 'MATERIAL') summary.materialsCreated++;
        if (kind === 'ANNOUNCEMENT') summary.announcementsCreated++;
      }
      writeSimpleShellResult_(output, outputIndex, `CREATED ${type} ${createdId}.`, createdId);
      appendCommandCentreLog_('APPLY SIMPLE SHELL ROW', 'CREATED', `${type} / ${title || topicName || textKey} -> ${createdId}`);
    } catch (err) {
      summary.errors++;
      writeSimpleShellResult_(output, outputIndex, `ERROR - ${err && err.message ? err.message : err}`, '');
      appendCommandCentreLog_('APPLY SIMPLE SHELL ROW', 'ERROR', `${type} / ${title || topicName}: ${err && err.message ? err.message : err}`);
    }
  });

  if (output.length) setValuesNoValidation_(shell.getRange(SIMPLE_SHELL_HEADER_ROW + 1, 1, output.length, headers.length), output);
  styleSimpleShellSheet_(shell);
  setValueNoValidation_(shell.getRange('B5'), false);
  appendCommandCentreLog_('APPLY SIMPLE SHELL ROWS', summary.errors ? 'DONE WITH ERRORS' : 'DONE', `Approved: ${summary.rowsApproved}; blocked: ${summary.rowsBlocked}; topics created: ${summary.topicsCreated}; materials created: ${summary.materialsCreated}; assignments created: ${summary.assignmentsCreated}; announcements created: ${summary.announcementsCreated}.`);
  return summary;
}

function writeSimpleShellResult_(output, index, result, createdId) {
  if (!output[index]) return;
  if (createdId) output[index][12] = createdId;
  output[index][13] = result || '';
}

function simpleShellRowToCourseworkApplyRow_(row, topicId, kind) {
  const publishState = row['Publish?'] === true ? 'PUBLISHED' : 'DRAFT';
  const common = {
    'Classroom Course ID': row['Classroom Course ID'],
    'Course Name': '',
    'Section': '',
    'Topic Name': row['Topic'],
    'Topic ID': topicId || '',
    'Description': row['Description / Instructions'],
    'Attachment Link': row['Attachment Link'],
    'Publish State': publishState
  };
  if (kind === 'ASSIGNMENT') {
    common['Assignment Title'] = row['Title'];
    common['Due Date'] = row['Due Date'];
    common['Points'] = row['Points'];
    return common;
  }
  if (kind === 'MATERIAL') {
    common['Material Title'] = row['Title'];
    return common;
  }
  common['Announcement Title / Label'] = row['Title'];
  common['Text'] = row['Description / Instructions'] || row['Title'];
  return common;
}

function postSimpleAnnouncementsInternal_() {
  requireClassroomService_();
  setupSimpleTeacherTabsInternal_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.SIMPLE_ANNOUNCEMENTS_SHEET);
  const controls = getSimpleAnnouncementControls_(sheet);
  if (controls.queueRows) queueSimpleAnnouncementRowsInternal_({});
  normalizeSimpleSheetCourseContext_(sheet, false);
  ensureSimpleAnnouncementsBlankTailRow_(sheet);
  const headers = getSimpleAnnouncementsHeaders_();
  const rows = readSimpleTableRows_(sheet, headers, SIMPLE_ANNOUNCEMENTS_HEADER_ROW);
  const summary = { rowsChecked: rows.length, rowsApproved: 0, rowsBlocked: 0, created: 0, skipped: 0, errors: 0 };
  const existingCache = {};
  const output = sheet.getRange(SIMPLE_ANNOUNCEMENTS_HEADER_ROW + 1, 1, Math.max(sheet.getLastRow() - SIMPLE_ANNOUNCEMENTS_HEADER_ROW, 0), headers.length).getValues();

  rows.forEach(row => {
    if (row['Post?'] !== true) return;
    summary.rowsApproved++;
    const courseName = String(row['Course Name'] || '').trim();
    const text = String(row['Announcement Text'] || '').trim();
    const link = String(row['Attachment Link'] || '').trim();
    const publish = row['Publish?'] === true ? 'PUBLISHED' : 'DRAFT';
    const resolvedCourseId = String(row['Classroom Course ID'] || '').trim();
    const createdId = String(row['Created Announcement ID'] || '').trim();
    const outputIndex = row.__rowNumber - SIMPLE_ANNOUNCEMENTS_HEADER_ROW - 1;
    const blockReasons = [];

    if (createdId) {
      summary.skipped++;
      writeSimpleAnnouncementResult_(output, outputIndex, createdId, '', `SKIPPED - Already posted (${createdId}).`);
      return;
    }
    if (summary.created >= SIMPLE_ANNOUNCEMENT_POST_MAX_PER_RUN) {
      writeSimpleAnnouncementResult_(output, outputIndex, '', '', `SKIPPED - Run cap ${SIMPLE_ANNOUNCEMENT_POST_MAX_PER_RUN} reached.`);
      return;
    }
    if (!resolvedCourseId) blockReasons.push('Classroom Course ID missing.');
    if (!text) blockReasons.push('Announcement text missing.');
    if (blockReasons.length) {
      summary.rowsBlocked++;
      writeSimpleAnnouncementResult_(output, outputIndex, '', '', `BLOCKED - ${blockReasons.join(' ')}`);
      return;
    }
    try {
      if (!existingCache[resolvedCourseId]) existingCache[resolvedCourseId] = getClassroomAnnouncementsByName_(resolvedCourseId);
      const duplicate = existingCache[resolvedCourseId][normalizeText_(text)];
      if (duplicate && duplicate.id) {
        summary.skipped++;
        writeSimpleAnnouncementResult_(output, outputIndex, duplicate.id, '', `SKIPPED - Announcement already exists (${duplicate.id}).`);
        return;
      }
      const created = createClassroomAnnouncement_(resolvedCourseId, {
        'Announcement Title / Label': text.length > 80 ? `${text.slice(0, 80)}...` : text,
        'Text': text,
        'Attachment Link': link,
        'Publish State': publish
      });
      const id = String(created && created.id || '').trim();
      existingCache[resolvedCourseId][normalizeText_(text)] = { id, status: 'EXISTS' };
      summary.created++;
      writeSimpleAnnouncementResult_(output, outputIndex, id, new Date(), `POSTED announcement ${id}.`);
      appendCommandCentreLog_('POST SIMPLE ANNOUNCEMENT', 'CREATED', `${courseName || resolvedCourseId} -> ${id}`);
    } catch (err) {
      summary.errors++;
      writeSimpleAnnouncementResult_(output, outputIndex, '', '', `ERROR - ${err && err.message ? err.message : err}`);
      appendCommandCentreLog_('POST SIMPLE ANNOUNCEMENT', 'ERROR', `${courseName || resolvedCourseId}: ${err && err.message ? err.message : err}`);
    }
  });

  if (output.length) setValuesNoValidation_(sheet.getRange(SIMPLE_ANNOUNCEMENTS_HEADER_ROW + 1, 1, output.length, headers.length), output);
  styleSimpleAnnouncementsSheet_(sheet);
  setValueNoValidation_(sheet.getRange('B7'), false);
  appendCommandCentreLog_('POST SIMPLE ANNOUNCEMENTS', summary.errors ? 'DONE WITH ERRORS' : 'DONE', `Approved: ${summary.rowsApproved}; blocked: ${summary.rowsBlocked}; created: ${summary.created}; skipped: ${summary.skipped}.`);
  return summary;
}

function writeSimpleAnnouncementResult_(output, index, createdId, postedAt, result) {
  if (!output[index]) return;
  if (createdId) output[index][6] = createdId;
  if (postedAt) output[index][7] = postedAt;
  output[index][8] = result || '';
}

function buildResultBySourceRow_(sheet, headers, label) {
  const rows = readApplySheetRows_(sheet, headers);
  const output = {};
  rows.forEach(row => {
    const sourceRow = Number(row['Source Row'] || 0);
    if (!sourceRow) return;
    output[sourceRow] = String(row['Apply Result'] || row[label] || '').trim();
  });
  return output;
}

function setupCourseBuilderLiteInternal_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const builder = ss.getSheetByName(APP.COURSE_BUILDER_SHEET) || ss.insertSheet(APP.COURSE_BUILDER_SHEET);
  const preview = ss.getSheetByName(APP.COURSE_BUILD_PREVIEW_SHEET) || ss.insertSheet(APP.COURSE_BUILD_PREVIEW_SHEET);
  const packet = ss.getSheetByName(APP.COURSE_BUILD_PACKET_SHEET) || ss.insertSheet(APP.COURSE_BUILD_PACKET_SHEET);
  const creationReview = ss.getSheetByName(APP.COURSE_CREATION_REVIEW_SHEET) || ss.insertSheet(APP.COURSE_CREATION_REVIEW_SHEET);
  const courseCreationApply = ss.getSheetByName(APP.COURSE_CREATION_APPLY_SHEET) || ss.insertSheet(APP.COURSE_CREATION_APPLY_SHEET);
  const courseCreationApplyProofArchive = ss.getSheetByName(APP.COURSE_CREATION_APPLY_PROOF_ARCHIVE_SHEET) || ss.insertSheet(APP.COURSE_CREATION_APPLY_PROOF_ARCHIVE_SHEET);
  const liveProofChecklist = ss.getSheetByName(APP.LIVE_PROOF_CHECKLIST_SHEET) || ss.insertSheet(APP.LIVE_PROOF_CHECKLIST_SHEET);
  const launchChecklist = ss.getSheetByName(APP.COURSE_LAUNCH_CHECKLIST_SHEET) || ss.insertSheet(APP.COURSE_LAUNCH_CHECKLIST_SHEET);

  const builderHeaders = getCourseBuilderHeaders_();
  const previewHeaders = getCourseBuildPreviewHeaders_();

  if (getRealLastRowByColumns_(builder, [1, 3, 7, 9]) < 2) {
    const starterRows = [
      [false, 'PLAN_ONLY', 'Example Course Name', 'Section 1', getActiveTeacherEmail_(), '', 'Example Topic', 'ASSIGNMENT', 'Example Assignment', 'Paste instructions here', '', '', '', false, 'Manual', '', '', ''],
      [false, 'PLAN_ONLY', 'Example Course Name', 'Section 1', getActiveTeacherEmail_(), '', 'Example Topic', 'MATERIAL', 'Example Material', 'Paste material description here', '', '', 'https://', false, 'Manual', '', '', '']
    ];
    writeSimpleTable_(builder, builderHeaders, starterRows);
  } else {
    ensureHeaderRow_(builder, builderHeaders);
  }

  writeSimpleTable_(preview, previewHeaders, []);
  writeSimpleTable_(packet, getCourseBuildPacketHeaders_(), []);
  writeSimpleTable_(creationReview, getCourseCreationReviewHeaders_(), []);
  writeSimpleTable_(courseCreationApply, getCourseCreationApplyHeaders_(), []);
  if (courseCreationApplyProofArchive.getLastRow() === 0) {
    writeSimpleTable_(courseCreationApplyProofArchive, getCourseCreationApplyProofArchiveHeaders_(), []);
  } else {
    ensureHeaderRow_(courseCreationApplyProofArchive, getCourseCreationApplyProofArchiveHeaders_());
  }
  buildLiveProofChecklistInternal_(liveProofChecklist);
  writeSimpleTable_(launchChecklist, getCourseLaunchChecklistHeaders_(), []);
  styleCourseBuilderSheet_(builder);
  setupCourseShellTemplateInternal_(true);
  styleSimpleSheet_(preview, 1, previewHeaders.length);
  styleCourseBuildPreviewSheet_(preview, 1);
  styleCourseBuildPacketSheet_(packet, 1);
  styleCourseCreationReviewSheet_(creationReview, 1);
  styleCourseCreationApplySheet_(courseCreationApply, 1);
  styleCourseCreationApplyProofArchiveSheet_(courseCreationApplyProofArchive, 1);
  styleLiveProofChecklistSheet_(liveProofChecklist, Math.max(liveProofChecklist.getLastRow(), 1));
  styleCourseLaunchChecklistSheet_(launchChecklist, 1);
  appendCommandCentreLog_('SETUP COURSE BUILDER LITE', 'DONE', 'Course Builder, Course Shell Template, Course Build Preview, Course Build Packet, Course Creation Review, Course Creation Apply, Course Creation Apply Proof Archive, Live Proof Checklist, and Course Launch Checklist sheets are ready. Existing Classroom content remains locked.');

  try {
    builder.showSheet();
    preview.showSheet();
    ss.setActiveSheet(builder);
  } catch (err) {}

  return {
    ok: true,
    message: 'Course Builder, Course Shell Template, Course Build Preview, Course Build Packet, Course Creation Review, Course Creation Apply, Course Creation Apply Proof Archive, Live Proof Checklist, and Course Launch Checklist sheets are ready. Existing Classroom content remains locked.'
  };
}

function setupCourseShellTemplateInternal_(quiet) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shell = ss.getSheetByName(APP.COURSE_SHELL_TEMPLATE_SHEET) || ss.insertSheet(APP.COURSE_SHELL_TEMPLATE_SHEET);
  const headers = getCourseShellTemplateHeaders_();

  if (getRealLastRowByColumns_(shell, [1, 2, 3, 8, 10]) < 2) {
    const teacherEmail = getActiveTeacherEmail_();
    const starterRows = [
      [false, 'Starter Shell', 'Example Course Name', 'Section 1', teacherEmail, '', 1, 'Orientation', 'TOPIC', 'Orientation', 'Introductory topic for the course shell.', '', '', '', false, 'Creates a topic in a future apply pass.', '', ''],
      [false, 'Starter Shell', 'Example Course Name', 'Section 1', teacherEmail, '', 2, 'Orientation', 'MATERIAL', 'Course Outline', 'Paste course outline or welcome instructions here.', '', '', 'https://', false, 'Adds a material post in a future apply pass.', '', ''],
      [false, 'Starter Shell', 'Example Course Name', 'Section 1', teacherEmail, '', 3, 'Unit 1', 'ASSIGNMENT', 'Unit 1 Check-In', 'Paste assignment instructions here.', '', 10, '', false, 'Adds an assignment in a future apply pass.', '', ''],
      [false, 'Starter Shell', 'Example Course Name', 'Section 1', teacherEmail, '', 4, 'Unit 1', 'ANNOUNCEMENT', 'Unit 1 Reminder', 'Paste announcement text here.', '', '', '', false, 'Adds an announcement in a future apply pass.', '', '']
    ];
    writeSimpleTable_(shell, headers, starterRows);
  } else {
    ensureHeaderRow_(shell, headers);
  }

  styleCourseShellTemplateSheet_(shell);

  if (!quiet) {
    appendCommandCentreLog_('SETUP COURSE SHELL TEMPLATE', 'DONE', 'Course Shell Template is ready. Classroom write lock remains ON.');
    try {
      shell.showSheet();
      ss.setActiveSheet(shell);
    } catch (err) {}
  }

  return {
    ok: true,
    message: 'Course Shell Template is ready. Classroom write lock remains ON.'
  };
}

function previewCourseBuildPlanInternal_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let builder = ss.getSheetByName(APP.COURSE_BUILDER_SHEET);
  if (!builder) {
    setupCourseBuilderLiteInternal_();
    builder = ss.getSheetByName(APP.COURSE_BUILDER_SHEET);
  }
  let shell = ss.getSheetByName(APP.COURSE_SHELL_TEMPLATE_SHEET);
  if (!shell) {
    setupCourseShellTemplateInternal_(true);
    shell = ss.getSheetByName(APP.COURSE_SHELL_TEMPLATE_SHEET);
  }

  const builderRecords = readCourseBuilderRecords_(builder);
  const shellRecords = readCourseShellTemplateRecords_(shell);
  const records = builderRecords.concat(shellRecords);
  const knownCourses = getCourseBuilderKnownCourses_();
  const context = buildCourseBuilderValidationContext_(records, knownCourses);
  const now = new Date();
  const rows = [];
  const statusUpdates = [];
  const summary = {
    selected: 0,
    ready: 0,
    review: 0,
    blocked: 0,
    notSelected: 0,
    rows: 0
  };

  records.forEach(record => {
    const checked = record.build === true;
    const result = validateCourseBuilderRecord_(record, context);
    if (checked) {
      summary.selected++;
      if (result.risk === 'BLOCKED') summary.blocked++;
      else if (result.risk === 'READY FOR REVIEW') summary.ready++;
      else summary.review++;
    } else {
      summary.notSelected++;
    }

    rows.push([
      now,
      record.sourceLabel || record.rowNumber,
      checked ? result.action : 'NOT SELECTED',
      record.courseName,
      record.section,
      record.topic,
      record.itemType,
      record.itemTitle,
      record.dueDate,
      record.points,
      result.errors.length,
      result.warnings.length,
      result.risk,
      result.message,
      'ON'
    ]);

    statusUpdates.push({ record, result });
  });

  summary.rows = rows.length;

  const preview = ss.getSheetByName(APP.COURSE_BUILD_PREVIEW_SHEET) || ss.insertSheet(APP.COURSE_BUILD_PREVIEW_SHEET);
  writeSimpleTable_(preview, getCourseBuildPreviewHeaders_(), rows);
  if (rows.length) preview.getRange(2, 1, rows.length, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
  styleCourseBuildPreviewSheet_(preview, rows.length + 1);
  ss.setActiveSheet(preview);

  writeCoursePlanStatusRows_(builder, statusUpdates.filter(item => item.record.sourceType === 'builder'), 17);
  writeCoursePlanStatusRows_(shell, statusUpdates.filter(item => item.record.sourceType === 'shell'), 17);
  styleCourseBuilderSheet_(builder);
  styleCourseShellTemplateSheet_(shell);

  appendCommandCentreLog_(
    'PREVIEW COURSE BUILD PLAN',
    summary.blocked ? 'REVIEW' : 'DONE',
    `Selected: ${summary.selected}; ready: ${summary.ready}; review: ${summary.review}; blocked: ${summary.blocked}; not selected: ${summary.notSelected}; builder rows: ${builderRecords.length}; shell rows: ${shellRecords.length}; preview rows: ${rows.length}; Classroom write lock remains ON.`
  );

  return summary;
}

function generateCourseBuildPacketInternal_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let builder = ss.getSheetByName(APP.COURSE_BUILDER_SHEET);
  let shell = ss.getSheetByName(APP.COURSE_SHELL_TEMPLATE_SHEET);
  if (!builder || !shell) {
    setupCourseBuilderLiteInternal_();
    builder = ss.getSheetByName(APP.COURSE_BUILDER_SHEET);
    shell = ss.getSheetByName(APP.COURSE_SHELL_TEMPLATE_SHEET);
  }

  const records = readCourseBuilderRecords_(builder).concat(readCourseShellTemplateRecords_(shell));
  const knownCourses = getCourseBuilderKnownCourses_();
  const context = buildCourseBuilderValidationContext_(records, knownCourses);
  const selectedRecords = records.filter(record => record.build === true);
  const packetRecords = selectedRecords.length ? selectedRecords : records;
  const now = new Date();
  const rows = [];
  const summary = {
    rows: 0,
    selected: selectedRecords.length,
    ready: 0,
    review: 0,
    blocked: 0
  };

  packetRecords.forEach(record => {
    const result = validateCourseBuilderRecord_(record, context);
    if (record.build === true) {
      if (result.risk === 'BLOCKED') summary.blocked++;
      else if (result.risk === 'READY FOR REVIEW') summary.ready++;
      else summary.review++;
    }

    rows.push([
      now,
      record.sourceLabel || record.rowNumber,
      record.build === true ? 'YES' : 'NO',
      buildCourseBuilderAction_(record),
      record.courseName,
      record.section,
      record.ownerEmail,
      record.coTeacherEmails,
      record.topic,
      record.itemType,
      record.itemTitle,
      record.description,
      record.dueDate,
      record.points,
      record.attachmentLink,
      record.publish === true ? 'YES' : 'NO',
      record.studentEmails || '',
      result.risk,
      result.message,
      'ON',
      getManualNextStepForRecord_(record, result)
    ]);
  });

  summary.rows = rows.length;

  const packet = ss.getSheetByName(APP.COURSE_BUILD_PACKET_SHEET) || ss.insertSheet(APP.COURSE_BUILD_PACKET_SHEET);
  writeSimpleTable_(packet, getCourseBuildPacketHeaders_(), rows);
  if (rows.length) packet.getRange(2, 1, rows.length, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
  styleCourseBuildPacketSheet_(packet, rows.length + 1);
  try {
    packet.showSheet();
    ss.setActiveSheet(packet);
  } catch (err) {}

  appendCommandCentreLog_(
    'GENERATE COURSE BUILD PACKET',
    summary.blocked ? 'REVIEW' : 'DONE',
    `Packet rows: ${summary.rows}; selected rows: ${summary.selected}; ready: ${summary.ready}; review: ${summary.review}; blocked: ${summary.blocked}; Classroom write lock remains ON.`
  );

  return summary;
}

function buildCourseCreationReviewInternal_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let builder = ss.getSheetByName(APP.COURSE_BUILDER_SHEET);
  let shell = ss.getSheetByName(APP.COURSE_SHELL_TEMPLATE_SHEET);
  if (!builder || !shell) {
    setupCourseBuilderLiteInternal_();
    builder = ss.getSheetByName(APP.COURSE_BUILDER_SHEET);
    shell = ss.getSheetByName(APP.COURSE_SHELL_TEMPLATE_SHEET);
  }

  const records = readCourseBuilderRecords_(builder).concat(readCourseShellTemplateRecords_(shell));
  const knownCourses = getCourseBuilderKnownCourses_();
  const context = buildCourseBuilderValidationContext_(records, knownCourses);
  const courseGroups = groupCourseCreationReviewRecords_(records);
  const selectedCourseKeys = {};
  records.forEach(record => {
    const selectedKey = makeCourseSectionKey_(record.courseName, record.section);
    if (record.build === true && selectedKey) selectedCourseKeys[selectedKey] = true;
  });

  const hasSelectedCourses = Object.keys(selectedCourseKeys).length > 0;
  const now = new Date();
  const rows = [];
  const summary = { rows: 0, ready: 0, review: 0, blocked: 0, createPlans: 0 };

  Object.keys(courseGroups)
    .sort((a, b) => String(courseGroups[a].courseName || '').localeCompare(String(courseGroups[b].courseName || '')))
    .forEach(courseKey => {
      if (hasSelectedCourses && !selectedCourseKeys[courseKey]) return;

      const group = courseGroups[courseKey];
      const result = evaluateCourseCreationGroup_(group, context);
      if (result.readiness === 'BLOCKED') summary.blocked++;
      else if (result.readiness === 'REVIEW') summary.review++;
      else summary.ready++;
      if (result.createPlan) summary.createPlans++;

      rows.push([
        now,
        group.courseName,
        group.section,
        result.exists ? 'YES' : 'NO',
        group.selectedRows.join(', '),
        group.builderRows.join(', '),
        group.shellRows.join(', '),
        result.createPlan ? 'YES' : 'NO',
        group.ownerEmail,
        group.coTeacherEmails,
        result.topicCount,
        result.assignmentCount,
        result.materialCount,
        result.announcementCount,
        result.studentInviteCount,
        result.readiness,
        result.detail,
        'ON',
        result.nextStep
      ]);
    });

  summary.rows = rows.length;
  const review = ss.getSheetByName(APP.COURSE_CREATION_REVIEW_SHEET) || ss.insertSheet(APP.COURSE_CREATION_REVIEW_SHEET);
  writeSimpleTable_(review, getCourseCreationReviewHeaders_(), rows);
  if (rows.length) review.getRange(2, 1, rows.length, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
  styleCourseCreationReviewSheet_(review, rows.length + 1);
  try {
    review.showSheet();
    ss.setActiveSheet(review);
  } catch (err) {}

  appendCommandCentreLog_(
    'BUILD COURSE CREATION REVIEW',
    summary.blocked ? 'REVIEW' : 'DONE',
    `Courses reviewed: ${summary.rows}; ready: ${summary.ready}; review: ${summary.review}; blocked: ${summary.blocked}; create plans: ${summary.createPlans}; Classroom write lock remains ON.`
  );

  return summary;
}

function buildCourseCreationApplyInternal_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let builder = ss.getSheetByName(APP.COURSE_BUILDER_SHEET);
  let shell = ss.getSheetByName(APP.COURSE_SHELL_TEMPLATE_SHEET);
  if (!builder || !shell) {
    setupCourseBuilderLiteInternal_();
    builder = ss.getSheetByName(APP.COURSE_BUILDER_SHEET);
    shell = ss.getSheetByName(APP.COURSE_SHELL_TEMPLATE_SHEET);
  }

  const records = readCourseBuilderRecords_(builder).concat(readCourseShellTemplateRecords_(shell));
  const knownCourses = getCourseBuilderKnownCourses_();
  const context = buildCourseBuilderValidationContext_(records, knownCourses);
  const groups = groupCourseCreationReviewRecords_(records);
  const selectedCourseKeys = {};
  records.forEach(record => {
    const key = makeCourseSectionKey_(record.courseName, record.section);
    if (record.build === true && key) selectedCourseKeys[key] = true;
  });
  const onlySelected = Object.keys(selectedCourseKeys).length > 0;
  const now = new Date();
  const rows = [];
  const summary = { rows: 0, ready: 0, review: 0, blocked: 0 };
  const existingLookup = buildCourseCreationApplyLookup_(records);

  Object.keys(groups)
    .sort((a, b) => String(groups[a].courseName || '').localeCompare(String(groups[b].courseName || '')))
    .forEach(groupKey => {
      if (onlySelected && !selectedCourseKeys[groupKey]) return;
      const group = groups[groupKey];
      const result = evaluateCourseCreationGroup_(group, context);
      if (!result.createPlan) return;

      const key = `${normalizeCoursePlanName_(group.courseName)}|${normalizeCoursePlanName_(group.section)}`;
      const existingId = existingLookup[key] || '';
      const targetReadiness = existingId ? 'BLOCKED' : result.readiness;
      const blockReason = existingId ? `Course already exists in Classroom (ID ${existingId}).` : result.detail;

      if (targetReadiness === 'BLOCKED') summary.blocked++;
      else if (targetReadiness === 'REVIEW') summary.review++;
      else summary.ready++;

      rows.push([
        false,
        '',
        group.courseName || '',
        group.section || '',
        group.ownerEmail || '',
        getFirstCourseCreateDescription_(group.records),
        '',
        'PROVISIONED',
        existingId,
        result.createPlan ? 'YES' : 'NO',
        targetReadiness,
        blockReason,
        '',
        '',
        '',
        existingId ? 'COURSE EXISTS' : 'ID BLANK',
        '',
        ''
      ]);
    });

  summary.rows = rows.length;
  const apply = ss.getSheetByName(APP.COURSE_CREATION_APPLY_SHEET) || ss.insertSheet(APP.COURSE_CREATION_APPLY_SHEET);
  writeSimpleTable_(apply, getCourseCreationApplyHeaders_(), rows);
  if (rows.length) apply.getRange(2, 1, rows.length, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
  styleCourseCreationApplySheet_(apply, rows.length + 1);
  try {
    apply.getRange(2, 1, Math.max(1, rows.length), 1).insertCheckboxes();
  } catch (err) {}
  try {
    apply.showSheet();
    ss.setActiveSheet(apply);
  } catch (err) {}

  appendCommandCentreLog_(
    'BUILD COURSE CREATION APPLY',
    summary.blocked ? 'REVIEW' : 'DONE',
    `Rows written: ${summary.rows}; ready: ${summary.ready}; review: ${summary.review}; blocked: ${summary.blocked}.`
  );

  return summary;
}

function applyApprovedCourseCreatesInternal_() {
  requireClassroomService_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const apply = ss.getSheetByName(APP.COURSE_CREATION_APPLY_SHEET) || ss.insertSheet(APP.COURSE_CREATION_APPLY_SHEET);
  const records = readCourseCreationApplyRecords_(apply);

  const summary = {
    rows: records.length,
    created: 0,
    skippedExisting: 0,
    blocked: 0,
    notApproved: 0,
    errors: 0,
    maxReached: false
  };

  if (!records.length) {
    appendCommandCentreLog_('APPLY APPROVED COURSE CREATES', 'DONE', 'No rows found. Build Course Creation Apply first.');
    return summary;
  }

  const existingLookup = buildActiveClassroomCourseByNameSectionLookup_();
  const pendingRows = records.filter(item => item.approveCreate === true);
  const safeRows = records
    .filter(item => item.approveCreate === true)
    .filter(item => normalizeText_(item.confirmText) === 'create course')
    .filter(item => normalizeText_(item.createPlan) === 'yes')
    .filter(item => normalizeText_(item.readiness) === 'ready for review')
    .filter(item => !item.existingCourseId)
    .filter(item => !item.createdCourseId);

  if (!safeRows.length) {
    appendCommandCentreLog_('APPLY APPROVED COURSE CREATES', 'DONE', 'No rows passed approval gates.');
    return Object.assign(summary, {
      notApproved: records.filter(item => item.approveCreate !== true).length,
      blocked: records.filter(item => item.approveCreate === true).length
    });
  }

  const maxRows = Math.min(COURSE_CREATE_MAX_PER_RUN, safeRows.length);
  const toCreate = safeRows.slice(0, maxRows);
  if (safeRows.length > maxRows) summary.maxReached = true;
  let processedCreateCount = 0;

  toCreate.forEach(item => {
    try {
      const normalizedName = normalizeCoursePlanName_(item.courseName);
      const key = `${normalizedName}|${normalizeCoursePlanName_(item.section)}`;
      const existingCourseId = existingLookup[key] || item.existingCourseId;

      if (existingCourseId) {
        summary.skippedExisting++;
        const reason = `SKIPPED - Existing course found (${existingCourseId}).`;
        updateCourseCreationApplyResult_(apply, item.rowNumber, { applied: false, existingCourseId, reason });
        propagateCourseCreationApplyResult_(item, existingCourseId, reason, item.applyResult);
        return;
      }

      const payload = {
        name: item.courseName || '',
        section: item.section || '',
        ownerId: item.ownerEmail || 'me',
        descriptionHeading: item.descriptionHeading || '',
        room: item.room || '',
        courseState: normalizeCourseCreateState_(item.courseState)
      };

      if (!payload.name) {
        summary.errors++;
        summary.blocked++;
        updateCourseCreationApplyResult_(apply, item.rowNumber, {
          applied: false,
          reason: 'SKIPPED - Missing course name.'
        });
        return;
      }

      const created = Classroom.Courses.create(payload);
      const createdCourseId = String(created && created.id || '').trim();
      const now = new Date();
      const createdBy = getActiveTeacherEmail_();
      if (item.rowNumber) {
        const rowValues = [
          [
            item.approveCreate,
            item.confirmText,
            item.courseName,
            item.section,
            item.ownerEmail,
            item.descriptionHeading,
            item.room,
            item.courseState,
            item.existingCourseId || '',
            item.createPlan,
            item.readiness,
            item.blockReason,
            createdCourseId,
            now,
            createdBy,
            'COURSE EXISTS',
            now,
            'CREATED'
          ]
        ];
        apply.getRange(item.rowNumber, 1, 1, getCourseCreationApplyHeaders_().length).setValues(rowValues);
      }
      processedCreateCount++;
      summary.created++;
      existingLookup[key] = createdCourseId;
      updateCourseCreationApplyResult_(apply, item.rowNumber, {
        applied: true,
        createdCourseId,
        createdBy,
        when: now,
        courseStatus: 'COURSE EXISTS',
        statusCheckedAt: now,
        reason: `CREATED course ${createdCourseId}.`
      });
      propagateCourseCreationApplyResult_(item, createdCourseId, `CREATED (${createdCourseId})`, '');
    } catch (err) {
      summary.errors++;
      const message = `ERROR - ${err && err.message ? err.message : err}`;
      const existing = item.existingCourseId ? ` existing=${item.existingCourseId}` : '';
      updateCourseCreationApplyResult_(apply, item.rowNumber, {
        applied: false,
        reason: message + existing
      });
      appendCommandCentreLog_('APPLY APPROVED COURSE CREATES', 'ERROR', `Course ${item.courseName || '[unnamed]'}: ${message}`);
      propagateCourseCreationApplyResult_(item, item.existingCourseId || '', message, '');
    }
  });

  if (summary.maxReached && processedCreateCount >= maxRows) {
    appendCommandCentreLog_(
      'APPLY APPROVED COURSE CREATES',
      'PARTIAL',
      `Created ${summary.created}. Max ${COURSE_CREATE_MAX_PER_RUN} per run enforced. Re-run to create additional approved rows.`
    );
  } else {
    appendCommandCentreLog_(
      'APPLY APPROVED COURSE CREATES',
      summary.errors ? 'DONE WITH ERRORS' : 'DONE',
      `Created ${summary.created}; skipped existing ${summary.skippedExisting}; blocked ${summary.blocked}; errors ${summary.errors}; max cap ${COURSE_CREATE_MAX_PER_RUN}.`
    );
  }

  records
    .filter(item => item.approveCreate !== true)
    .forEach(() => {
      summary.notApproved++;
    });

  return summary;
}

function refreshCourseCreationApplyStatusInternal_() {
  requireClassroomService_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const apply = ss.getSheetByName(APP.COURSE_CREATION_APPLY_SHEET) || ss.insertSheet(APP.COURSE_CREATION_APPLY_SHEET);
  const headers = getCourseCreationApplyHeaders_();
  ensureHeaderRow_(apply, headers);

  const summary = {
    rows: 0,
    exists: 0,
    archived: 0,
    notFound: 0,
    idBlank: 0,
    proofArchived: 0,
    errors: 0
  };

  const lastRow = getRealLastRowByColumns_(apply, [1, 2, 3, 9, 13, 18]);
  if (lastRow < 2) {
    appendCommandCentreLog_('REFRESH COURSE CREATION APPLY STATUS', 'DONE', 'No Course Creation Apply rows found.');
    return summary;
  }

  const now = new Date();
  const statusCache = {};
  const values = apply.getRange(2, 1, lastRow - 1, headers.length).getValues();
  const rowsToArchive = [];
  const rowsToDelete = [];

  values.forEach((row, index) => {
    const rowNumber = index + 2;
    const hasContent = row.some(value => String(value || '').trim() !== '');
    if (!hasContent) return;
    summary.rows++;

    const existingId = String(row[8] || '').trim();
    const createdId = String(row[12] || '').trim();
    const courseId = createdId || existingId;
    let status = 'ID BLANK';
    let applyResult = String(row[17] || '').trim();

    if (!courseId) {
      summary.idBlank++;
    } else {
      const cached = statusCache[courseId] || getCourseCreationApplyCourseStatus_(courseId);
      statusCache[courseId] = cached;
      status = cached.status;
      if (status === 'COURSE EXISTS') summary.exists++;
      else if (status === 'COURSE ARCHIVED') summary.archived++;
      else if (status === 'COURSE NOT FOUND') summary.notFound++;
      else if (status === 'ERROR') summary.errors++;

      const isProofRow = isCourseCreationApplyTestProofRow_(row);
      const shouldArchiveProofRow = isProofRow && (
        status === 'COURSE EXISTS' ||
        status === 'COURSE ARCHIVED' ||
        status === 'COURSE NOT FOUND'
      );

      if (shouldArchiveProofRow) {
        status = 'TEST DELETED / NEEDS REVIEW';
        applyResult = 'TEST COURSE DELETED / PROOF ROW - DO NOT REUSE';
        rowsToArchive.push(row.concat([now, 'Deleted temporary Codex test course proof row moved out of active apply sheet.']));
        rowsToDelete.push(rowNumber);
        summary.proofArchived++;
      } else if (cached.detail && status === 'ERROR') {
        applyResult = `STATUS ERROR - ${cached.detail}`;
      }
    }

    row[15] = status;
    row[16] = now;
    row[17] = applyResult;
    if (rowsToDelete.indexOf(rowNumber) === -1) {
      setValuesNoValidation_(apply.getRange(rowNumber, 1, 1, headers.length), [row]);
    }
  });

  if (rowsToArchive.length) {
    appendCourseCreationApplyProofArchiveRows_(rowsToArchive);
    rowsToDelete.sort((a, b) => b - a).forEach(rowNumber => apply.deleteRow(rowNumber));
  }

  styleCourseCreationApplySheet_(apply, Math.max(apply.getLastRow(), 1));
  appendCommandCentreLog_(
    'REFRESH COURSE CREATION APPLY STATUS',
    summary.errors ? 'DONE WITH ERRORS' : 'DONE',
    `Rows checked: ${summary.rows}; exists: ${summary.exists}; archived: ${summary.archived}; not found: ${summary.notFound}; ID blank: ${summary.idBlank}; proof archived: ${summary.proofArchived}; errors: ${summary.errors}. Read-only Classroom status check only.`
  );
  return summary;
}

function getCourseCreationApplyCourseStatus_(courseId) {
  try {
    const course = Classroom.Courses.get(courseId);
    const state = normalizeText_((course && course.courseState) || '');
    if (state === 'archived') return { status: 'COURSE ARCHIVED', detail: '' };
    return { status: 'COURSE EXISTS', detail: '' };
  } catch (err) {
    const message = String(err && err.message ? err.message : err);
    const clean = normalizeText_(message);
    if (clean.indexOf('not found') !== -1 || clean.indexOf('requested entity was not found') !== -1 || clean.indexOf('404') !== -1) {
      return { status: 'COURSE NOT FOUND', detail: message };
    }
    return { status: 'ERROR', detail: message };
  }
}

function isCourseCreationApplyTestProofRow_(row) {
  const text = row.map(value => String(value || '')).join(' ');
  const clean = normalizeText_(text);
  return clean.indexOf('codex test classroom') !== -1 || clean.indexOf('test course deleted') !== -1 || clean.indexOf('proof row') !== -1;
}

function appendCourseCreationApplyProofArchiveRows_(rows) {
  if (!rows || !rows.length) return;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(APP.COURSE_CREATION_APPLY_PROOF_ARCHIVE_SHEET) || ss.insertSheet(APP.COURSE_CREATION_APPLY_PROOF_ARCHIVE_SHEET);
  const headers = getCourseCreationApplyProofArchiveHeaders_();
  ensureHeaderRow_(sheet, headers);
  const startRow = Math.max(sheet.getLastRow() + 1, 2);
  setValuesNoValidation_(sheet.getRange(startRow, 1, rows.length, headers.length), rows);
  styleCourseCreationApplyProofArchiveSheet_(sheet, sheet.getLastRow());
}

function buildCourseLaunchChecklistInternal_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let builder = ss.getSheetByName(APP.COURSE_BUILDER_SHEET);
  let shell = ss.getSheetByName(APP.COURSE_SHELL_TEMPLATE_SHEET);
  if (!builder || !shell) {
    setupCourseBuilderLiteInternal_();
    builder = ss.getSheetByName(APP.COURSE_BUILDER_SHEET);
    shell = ss.getSheetByName(APP.COURSE_SHELL_TEMPLATE_SHEET);
  }

  const records = readCourseBuilderRecords_(builder).concat(readCourseShellTemplateRecords_(shell));
  const knownCourses = getCourseBuilderKnownCourses_();
  const context = buildCourseBuilderValidationContext_(records, knownCourses);
  const groups = groupCourseCreationReviewRecords_(records);
  const selectedKeys = {};
  records.forEach(record => {
    const key = makeCourseSectionKey_(record.courseName, record.section);
    if (record.build === true && key) selectedKeys[key] = true;
  });

  const onlySelected = Object.keys(selectedKeys).length > 0;
  const now = new Date();
  const rows = [];
  const summary = { rows: 0, courses: 0, ready: 0, review: 0, blocked: 0 };

  Object.keys(groups)
    .sort((a, b) => String(groups[a].courseName || '').localeCompare(String(groups[b].courseName || '')))
    .forEach(groupKey => {
      if (onlySelected && !selectedKeys[groupKey]) return;
      const group = groups[groupKey];
      const selectedRecords = group.records.filter(record => record.build === true);
      const scopedRecords = selectedRecords.length ? selectedRecords : group.records;
      const groupReview = evaluateCourseCreationGroup_(group, context);
      summary.courses++;

      addCourseLaunchChecklistRow_(rows, now, {
        step: rows.length + 1,
        course: group.courseName,
        section: group.section,
        source: 'Course',
        actionType: groupReview.exists ? 'Confirm course shell' : 'Create course shell',
        title: group.courseName,
        copyText: buildCourseLaunchCourseCopy_(group),
        readiness: groupReview.readiness,
        detail: groupReview.detail,
        nextStep: groupReview.nextStep
      }, summary);

      if (group.coTeacherEmails) {
        addCourseLaunchChecklistRow_(rows, now, {
          step: rows.length + 1,
          course: group.courseName,
          section: group.section,
          source: 'Course',
          actionType: 'Confirm co-teachers',
          title: 'Co-teacher access',
          copyText: group.coTeacherEmails,
          readiness: 'REVIEW',
          detail: 'Confirm each co-teacher belongs on this course before inviting.',
          nextStep: 'Manually confirm co-teacher list. Classroom write lock remains ON.'
        }, summary);
      }

      scopedRecords
        .slice()
        .sort(compareCourseBuilderRecordsForLaunch_)
        .forEach(record => {
          const validation = validateCourseBuilderRecord_(record, context);
          const launch = buildLaunchChecklistItemForRecord_(record, validation);
          addCourseLaunchChecklistRow_(rows, now, {
            step: rows.length + 1,
            course: record.courseName,
            section: record.section,
            source: record.sourceLabel || record.rowNumber,
            actionType: launch.actionType,
            title: launch.title,
            copyText: launch.copyText,
            readiness: validation.risk === 'NOT SELECTED' ? 'REVIEW' : validation.risk,
            detail: validation.message,
            nextStep: launch.nextStep
          }, summary);
        });
    });

  summary.rows = rows.length;
  const checklist = ss.getSheetByName(APP.COURSE_LAUNCH_CHECKLIST_SHEET) || ss.insertSheet(APP.COURSE_LAUNCH_CHECKLIST_SHEET);
  writeSimpleTable_(checklist, getCourseLaunchChecklistHeaders_(), rows);
  if (rows.length) {
    checklist.getRange(2, 1, rows.length, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
    checklist.getRange(2, 12, rows.length, 1).insertCheckboxes();
  }
  styleCourseLaunchChecklistSheet_(checklist, rows.length + 1);
  try {
    checklist.showSheet();
    ss.setActiveSheet(checklist);
  } catch (err) {}

  appendCommandCentreLog_(
    'BUILD COURSE LAUNCH CHECKLIST',
    summary.blocked ? 'REVIEW' : 'DONE',
    `Checklist rows: ${summary.rows}; courses: ${summary.courses}; ready: ${summary.ready}; review: ${summary.review}; blocked: ${summary.blocked}; Classroom write lock remains ON.`
  );

  return summary;
}

function applyCourseBuildPlan() {
  appendCommandCentreLog_('APPLY COURSE BUILD PLAN', 'LOCKED', 'Blocked by Classroom write lock. No Google Classroom content was created or changed.');
  SpreadsheetApp.getUi().alert(
    'Bulk Classroom build is still locked.\n\n' +
    'Use the separate apply sheets instead: Course Creation Apply, Topic Apply Review, Assignment Apply Review, Material Apply Review, Announcement Apply Review, Student Invite Review, Teacher Invite Review, and Artifact Apply Review.\n\n' +
    'Each write action still requires exact row approval and confirmation text.'
  );
}

function showClassroomWriteLockStatus() {
  SpreadsheetApp.getUi().alert(
    'Classroom content write lock: ON\n\n' +
    'Allowed in this version:\n' +
    '- Read existing Classroom course/roster/progress data when you choose existing tracker actions.\n' +
    '- Create and update spreadsheet tabs.\n' +
    '- Preview course-builder plans.\n\n' +
    '- Create up to two NEW Classroom course shells from approved Course Creation Apply rows.\n' +
    '- Create approved topics, assignments, materials, announcements, student adds, teacher adds, and artifacts only from their separate gated apply sheets.\n\n' +
    '- Refresh Course Creation Apply status using read-only course lookups.\n\n' +
    'Blocked in this version:\n' +
    '- Modify existing Classroom courses.\n' +
    '- Create grades, Calendar items, or web deployments.\n' +
    '- Create Drive/Docs/Forms artifacts outside the approved Artifact Apply Review flow.\n' +
    '- Run automatic Classroom writes or automatic email sends.\n' +
    '- Delete or archive Classroom content.'
  );
}

function showTeacherWebAppDeployHelp() {
  SpreadsheetApp.getUi().alert(
    'The in-sheet sidebar is available now from Next Step Tracker -> Open Teacher Control Panel.\n\n' +
    'To publish the same panel as a web app, use Apps Script: Deploy -> New deployment -> Web app.\n\n' +
    'Recommended first deployment settings:\n' +
    '- Execute as: Me\n' +
    '- Who has access: Only myself or your district domain\n\n' +
    'Do not use the web app as a bypass. It must expose only already-proven gated flows after deployment is separately approved.'
  );
}

function getTeacherControlPanelClientState() {
  return getTeacherControlPanelState_();
}

function getTeacherWebAppClientState() {
  return getTeacherWebAppState_();
}

function getNextStepSimpleOpsBridgeState_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const courses = getNextStepSimpleOpsBridgeCourses_();
  const students = getNextStepSimpleOpsBridgeStudents_();
  const announcements = getNextStepSimpleOpsBridgeAnnouncements_();
  const emailPreview = getNextStepSimpleOpsBridgeEmailPreview_();
  const logs = getRecentCommandCentreLogs_(10).map(log => ({
    time: log.at || '',
    action: log.action || '',
    result: log.result || '',
    safety: log.detail || ''
  }));
  const dashboard = getNextStepSimpleOpsBridgeDashboard_(courses, students, emailPreview);

  return {
    ok: true,
    source: 'apps-script',
    spreadsheetName: ss.getName(),
    generatedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd h:mm a'),
    dashboard,
    courses,
    students,
    announcements,
    emailPreview,
    logs,
    boundary: [
      'Read-only state is exposed to the displayed Canvas Helper project.',
      'Live Classroom posts and email sends remain gated inside Apps Script.',
      'No Classroom delete/edit endpoint is exposed through this bridge.'
    ]
  };
}

function getNextStepSimpleOpsBridgeCourses_() {
  const masterRows = (() => {
    const master = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.MASTER_SHEET);
    return master ? readMasterRowsAsObjects_(master) : [];
  })();
  const byCourse = {};
  masterRows.forEach(row => {
    const course = String(row['Course'] || '').trim();
    if (!course) return;
    if (!byCourse[course]) byCourse[course] = { activeStudents: 0, behind: 0, pendingEmails: 0 };
    byCourse[course].activeStudents++;
    if (normalizeText_(row['STATUS']) === 'behind') byCourse[course].behind++;
    if (isTruthy_(row['SEND EMAIL?'])) byCourse[course].pendingEmails++;
  });

  return readEnabledCourseMaps_().map(map => {
    const courseName = map.displayCourseName || map.classroomCourseName || map.classroomCourseId || '';
    const stats = byCourse[courseName] || { activeStudents: 0, behind: 0, pendingEmails: 0 };
    return {
      name: courseName,
      id: map.classroomCourseId || '',
      section: '',
      checked: true,
      activeStudents: stats.activeStudents,
      behind: stats.behind,
      pendingEmails: stats.pendingEmails,
      lastSync: ''
    };
  });
}

function getNextStepSimpleOpsBridgeStudents_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const master = ss.getSheetByName(APP.MASTER_SHEET);
  const rows = master ? readMasterRowsAsObjects_(master) : [];
  return rows.map(row => {
    const status = normalizeText_(row['STATUS']);
    let completionPercent = 50;
    if (status === 'done') completionPercent = 100;
    if (status === 'on pace') completionPercent = 75;
    if (status === 'behind') completionPercent = 25;
    if (status === 'no contact') completionPercent = 0;

    return {
      name: String(row['Student Name'] || '').trim(),
      email: String(row['Email'] || '').trim(),
      course: String(row['Course'] || '').trim(),
      total: '',
      done: '',
      outstanding: '',
      pastDue: status === 'behind' ? 1 : 0,
      needsMarking: 0,
      completionPercent,
      lastSubmission: '',
      lastContact: row['LAST CONTACT'] ? String(row['LAST CONTACT']) : '',
      risk: getNextStepSimpleOpsRiskLabel_(completionPercent, status),
      recommendedAction: getNextStepSimpleOpsRecommendedAction_(status),
      noContact: status === 'no contact'
    };
  }).filter(row => row.name || row.course);
}

function getNextStepSimpleOpsRiskLabel_(completionPercent, status) {
  if (status === 'done' || completionPercent >= 100) return 'Complete';
  if (completionPercent >= 75) return 'Almost Done';
  if (completionPercent >= 50) return 'In Progress';
  if (completionPercent >= 25) return 'Behind';
  if (completionPercent > 0) return 'Very Behind';
  return 'No Progress';
}

function getNextStepSimpleOpsRecommendedAction_(status) {
  if (status === 'done') return 'No action needed.';
  if (status === 'on pace') return 'Monitor progress.';
  if (status === 'behind') return 'Generate missing-work preview.';
  if (status === 'no contact') return 'Use no-contact workflow.';
  return 'Review tracker row.';
}

function getNextStepSimpleOpsBridgeAnnouncements_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.SIMPLE_ANNOUNCEMENTS_SHEET);
  const firstDataRow = SIMPLE_ANNOUNCEMENTS_HEADER_ROW + 1;
  if (!sheet || sheet.getLastRow() < firstDataRow) return [];
  const headers = getSimpleAnnouncementsHeaders_();
  const lastRow = Math.max(firstDataRow, sheet.getLastRow());
  const values = sheet.getRange(firstDataRow, 1, lastRow - firstDataRow + 1, headers.length).getDisplayValues();
  const rawChecks = sheet.getRange(firstDataRow, 1, values.length, 1).getValues();
  const rawPublish = sheet.getRange(firstDataRow, 6, values.length, 1).getValues();
  return values.map((row, index) => ({
    post: rawChecks[index][0] === true,
    courseName: row[1] || '',
    courseId: row[2] || '',
    text: row[3] || '',
    attachmentLink: row[4] || '',
    publish: rawPublish[index][0] === true,
    createdId: row[6] || '',
    postedAt: row[7] || '',
    result: row[8] || ''
  })).filter(row => row.courseName || row.courseId || row.text || row.createdId || row.result);
}

function getNextStepSimpleOpsBridgeEmailPreview_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.EMAIL_PREVIEW_SHEET);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getDisplayValues();
  const raw = sheet.getDataRange().getValues();
  const headers = values[0].map(header => normalizeText_(header));
  const idx = {
    send: getHeaderIndex_(headers, ['send?', 'send email?', 'send'], 0),
    student: getHeaderIndex_(headers, ['student name', 'student'], 1),
    email: getHeaderIndex_(headers, ['email', 'student email'], 2),
    course: getHeaderIndex_(headers, ['course'], 3),
    completion: getHeaderIndex_(headers, ['completion', 'completion %'], 4),
    pastDue: getHeaderIndex_(headers, ['past due', 'missing past due'], 5),
    needsMarking: getHeaderIndex_(headers, ['needs marking'], 6),
    template: getHeaderIndex_(headers, ['template', 'template key'], 7),
    subject: getHeaderIndex_(headers, ['subject'], 8),
    lastSent: getHeaderIndex_(headers, ['last sent', 'email last sent'], 9),
    result: getHeaderIndex_(headers, ['result', 'email result'], 10)
  };
  return values.slice(1).map((row, rowIndex) => ({
    send: idx.send >= 0 && raw[rowIndex + 1][idx.send] === true,
    student: idx.student >= 0 ? row[idx.student] : '',
    email: idx.email >= 0 ? row[idx.email] : '',
    course: idx.course >= 0 ? row[idx.course] : '',
    completion: idx.completion >= 0 ? row[idx.completion] : '',
    pastDue: idx.pastDue >= 0 ? row[idx.pastDue] : '',
    needsMarking: idx.needsMarking >= 0 ? row[idx.needsMarking] : '',
    template: idx.template >= 0 ? row[idx.template] : '',
    subject: idx.subject >= 0 ? row[idx.subject] : '',
    lastSent: idx.lastSent >= 0 ? row[idx.lastSent] : '',
    result: idx.result >= 0 ? row[idx.result] : ''
  })).filter(row => row.student || row.email || row.course || row.subject || row.result);
}

function getNextStepSimpleOpsBridgeDashboard_(courses, students, emailPreview) {
  return {
    activeCourses: courses.length,
    activeStudents: students.length,
    underFifty: students.filter(row => Number(row.completionPercent || 0) < 50).length,
    missingPastDue: students.reduce((sum, row) => sum + Number(row.pastDue || 0), 0),
    needsMarking: students.reduce((sum, row) => sum + Number(row.needsMarking || 0), 0),
    pendingEmails: (emailPreview || []).filter(row => row.send || row.subject).length
  };
}

function teacherSyncEverythingFromWebApp() {
  return runTeacherWebAppAction_('SYNC EVERYTHING', () => teacherSyncEverythingInternal_());
}

function enableSimpleTeacherModeFromWebApp() {
  return runTeacherWebAppAction_('ENABLE SIMPLE MODE', () => {
    setupSimpleTeacherTabsInternal_();
    hideAdvancedSheetsForSimpleMode_();
    return { message: 'Tracker + Announcements mode enabled. Use the Simple Announcements tab for daily posting.' };
  });
}

function setupSimpleTeacherTabsFromWebApp() {
  return runTeacherWebAppAction_('SETUP SIMPLE TABS', () => setupSimpleTeacherTabsInternal_());
}

function loadSelectedCourseIntoSimpleShellFromWebApp() {
  return runTeacherWebAppAction_('LOAD SIMPLE SHELL COURSE', () => loadSelectedCourseIntoSimpleShellInternal_());
}

function populateSimpleShellFromWebApp() {
  return runTeacherWebAppAction_('POPULATE SIMPLE SHELL', () => populateSimpleShellInternal_());
}

function addSimpleShellRowBelowFromWebApp() {
  return runTeacherWebAppAction_('ADD SIMPLE SHELL ROW', () => ({ row: addSimpleShellRowBelowInternal_() }));
}

function moveSimpleShellRowUpFromWebApp() {
  return runTeacherWebAppAction_('MOVE SIMPLE SHELL ROW UP', () => ({ moved: moveSimpleShellRowInternal_(-1) }));
}

function moveSimpleShellRowDownFromWebApp() {
  return runTeacherWebAppAction_('MOVE SIMPLE SHELL ROW DOWN', () => ({ moved: moveSimpleShellRowInternal_(1) }));
}

function deleteSelectedSimpleShellRowFromWebApp() {
  return runTeacherWebAppAction_('DELETE SIMPLE SHELL ROW', () => ({ deleted: deleteSimpleShellRowInternal_() }));
}

function applySimpleShellBuilderRowsFromWebApp() {
  return runTeacherWebAppAction_('APPLY SIMPLE SHELL ROWS', () => applySimpleShellBuilderRowsInternal_());
}

function postSimpleAnnouncementsFromWebApp() {
  return runTeacherWebAppAction_('POST SIMPLE ANNOUNCEMENTS', () => postSimpleAnnouncementsInternal_());
}

function clearSelectedAnnouncementRowsFromWebApp() {
  return runTeacherWebAppAction_('CLEAR SELECTED ANNOUNCEMENT ROWS', () => clearSelectedAnnouncementRowsInternal_());
}

function clearAllQueuedAnnouncementRowsFromWebApp() {
  return runTeacherWebAppAction_('CLEAR ALL ANNOUNCEMENT ROWS', () => clearAllQueuedAnnouncementRowsInternal_());
}

function buildSimpleAnnouncementQueueFromCourseMapFromWebApp() {
  return runTeacherWebAppAction_('QUEUE SIMPLE BULK ANNOUNCEMENTS', () => buildSimpleAnnouncementQueueFromCourseMapInternal_());
}

function queueSimpleAnnouncementRowsFromWebApp() {
  return runTeacherWebAppAction_('QUEUE SIMPLE ANNOUNCEMENTS', () => queueSimpleAnnouncementRowsInternal_({}));
}

function setupCourseBuilderLiteFromWebApp() {
  return runTeacherWebAppAction_('SETUP COURSE BUILDER LITE', () => setupCourseBuilderLiteInternal_());
}

function setupCourseShellTemplateFromWebApp() {
  return runTeacherWebAppAction_('SETUP COURSE SHELL TEMPLATE', () => setupCourseShellTemplateInternal_());
}

function previewCourseBuildPlanFromWebApp() {
  return runTeacherWebAppAction_('PREVIEW COURSE BUILD PLAN', () => previewCourseBuildPlanInternal_());
}

function generateCourseBuildPacketFromWebApp() {
  return runTeacherWebAppAction_('GENERATE COURSE BUILD PACKET', () => generateCourseBuildPacketInternal_());
}

function buildCourseCreationReviewFromWebApp() {
  return runTeacherWebAppAction_('BUILD COURSE CREATION REVIEW', () => buildCourseCreationReviewInternal_());
}

function buildCourseLaunchChecklistFromWebApp() {
  return runTeacherWebAppAction_('BUILD COURSE LAUNCH CHECKLIST', () => buildCourseLaunchChecklistInternal_());
}

function buildLiveProofChecklistFromWebApp() {
  return runTeacherWebAppAction_('BUILD LIVE PROOF CHECKLIST', () => buildLiveProofChecklistInternal_());
}

function refreshCourseCreationApplyStatusFromWebApp() {
  return runTeacherWebAppAction_('REFRESH COURSE CREATION APPLY STATUS', () => refreshCourseCreationApplyStatusInternal_());
}

function applyCourseBuildPlanFromWebApp() {
  return runTeacherWebAppAction_('APPLY COURSE BUILD PLAN', () => {
    appendCommandCentreLog_('APPLY COURSE BUILD PLAN', 'LOCKED', 'Blocked by Classroom write lock from web app. No Google Classroom content was created or changed.');
    return {
      ok: true,
      locked: true,
      message: 'Classroom write lock is ON. No Google Classroom content was created or changed.'
    };
  });
}

function runTeacherWebAppAction_(label, fn) {
  let lock = null;
  let locked = false;
  try {
    lock = LockService.getScriptLock();
    locked = lock.tryLock(5000);
    if (!locked) {
      throw new Error('Another tracker action is already running. Wait a minute, then try again.');
    }
  } catch (lockErr) {
    const message = String(lockErr && lockErr.message ? lockErr.message : lockErr);
    if (message.indexOf('PERMISSION_DENIED') === -1 && message.indexOf('storage') === -1) {
      throw lockErr;
    }
    // Some district Apps Script sidebars deny script-storage reads used by LockService.
    // These panel actions are preview/setup-only, so continue without the lock instead of blocking the teacher.
    lock = null;
    locked = false;
  }

  try {
    const result = fn();
    SpreadsheetApp.flush();
    return {
      ok: true,
      action: label,
      result: result || {},
      state: getTeacherWebAppState_()
    };
  } catch (err) {
    appendCommandCentreLog_(label || 'WEB APP ACTION', 'ERROR', String(err && err.message ? err.message : err));
    throw err;
  } finally {
    if (lock && locked) lock.releaseLock();
  }
}

function openCourseBuilderSheet() {
  activateSheetByName_(APP.COURSE_BUILDER_SHEET || 'Course Builder');
}

function openCourseBuildPreviewSheet() {
  activateSheetByName_(APP.COURSE_BUILD_PREVIEW_SHEET || 'Course Build Preview');
}

function openCourseBuildPacketSheet() {
  activateSheetByName_(APP.COURSE_BUILD_PACKET_SHEET || 'Course Build Packet');
}

function openCourseCreationReviewSheet() {
  activateSheetByName_(APP.COURSE_CREATION_REVIEW_SHEET || 'Course Creation Review');
}

function openCourseLaunchChecklistSheet() {
  activateSheetByName_(APP.COURSE_LAUNCH_CHECKLIST_SHEET || 'Course Launch Checklist');
}

function openLiveProofChecklistSheet() {
  activateSheetByName_(APP.LIVE_PROOF_CHECKLIST_SHEET || 'Live Proof Checklist');
}

function openCourseShellTemplateSheet() {
  activateSheetByName_(APP.COURSE_SHELL_TEMPLATE_SHEET || 'Course Shell Template');
}

function openCommandCentreLogSheet() {
  activateSheetByName_(APP.COMMAND_CENTRE_LOG_SHEET || 'Command Centre Log');
}

function openMasterTrackerSheet() {
  activateSheetByName_(APP.MASTER_SHEET || 'MASTER TRACKER NEXT STEP');
}

function openClassroomCourseMapSheet() {
  activateSheetByName_(APP.COURSE_MAP_SHEET || 'Classroom Course Map');
}

function openEmailPreviewSheet() {
  activateSheetByName_(APP.EMAIL_PREVIEW_SHEET || 'Email Preview');
}

function activateSheetByName_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) {
    SpreadsheetApp.getUi().alert(`Sheet "${name}" was not found.`);
    return;
  }
  try { sheet.showSheet(); } catch (err) {}
  ss.setActiveSheet(sheet);
}

function getTeacherControlPanelState_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const queue = typeof getClassroomProgressQueue_ === 'function' ? getClassroomProgressQueue_() : null;
  const builder = ss.getSheetByName(APP.COURSE_BUILDER_SHEET);
  const shell = ss.getSheetByName(APP.COURSE_SHELL_TEMPLATE_SHEET);
  const preview = ss.getSheetByName(APP.COURSE_BUILD_PREVIEW_SHEET);
  const packet = ss.getSheetByName(APP.COURSE_BUILD_PACKET_SHEET);
  const creationReview = ss.getSheetByName(APP.COURSE_CREATION_REVIEW_SHEET);
  const launchChecklist = ss.getSheetByName(APP.COURSE_LAUNCH_CHECKLIST_SHEET);
  const master = ss.getSheetByName(APP.MASTER_SHEET);
  const courseMaps = typeof readEnabledCourseMaps_ === 'function' ? readEnabledCourseMaps_() : [];
  const previewStats = getCourseBuildPreviewStats_(preview);
  const creationStats = getCourseCreationReviewStats_(creationReview);
  const launchStats = getCourseLaunchChecklistStats_(launchChecklist);
  const builderStats = getCourseBuilderBuildStats_(builder);
  const shellStats = getCourseShellTemplateStats_(shell);
  const lastLog = getCommandCentreLastLog_();
  return {
    spreadsheetName: ss.getName(),
    sheetLinks: getTeacherPanelSheetLinks_(),
    activeCourses: courseMaps.length,
    masterRows: master ? Math.max(0, getRealLastRowByColumns_(master, [1, 2, 5]) - 1) : 0,
    builderRows: builder ? Math.max(0, getRealLastRowByColumns_(builder, [1, 3, 7, 9]) - 1) : 0,
    builderSelected: builderStats.selected,
    shellRows: shell ? Math.max(0, getRealLastRowByColumns_(shell, [1, 2, 3, 8, 10]) - 1) : 0,
    shellSelected: shellStats.selected,
    previewRows: preview ? Math.max(0, preview.getLastRow() - 1) : 0,
    packetRows: packet ? Math.max(0, packet.getLastRow() - 1) : 0,
    creationRows: creationReview ? Math.max(0, creationReview.getLastRow() - 1) : 0,
    launchRows: launchChecklist ? Math.max(0, launchChecklist.getLastRow() - 1) : 0,
    creationReady: creationStats.ready,
    creationReview: creationStats.review,
    creationBlocked: creationStats.blocked,
    launchReady: launchStats.ready,
    launchReview: launchStats.review,
    launchBlocked: launchStats.blocked,
    previewReady: previewStats.ready,
    previewReview: previewStats.review,
    previewBlocked: previewStats.blocked,
    previewNotSelected: previewStats.notSelected,
    queueRemaining: queue && Array.isArray(queue.queue) ? queue.queue.length : 0,
    lastLog,
    webAppUrl: getSafeWebAppUrl_(),
    classroomWriteLock: 'CONTENT LOCKED'
  };
}

function getTeacherWebAppState_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const state = getTeacherControlPanelState_();
  const builder = ss.getSheetByName(APP.COURSE_BUILDER_SHEET);
  const shell = ss.getSheetByName(APP.COURSE_SHELL_TEMPLATE_SHEET);
  const preview = ss.getSheetByName(APP.COURSE_BUILD_PREVIEW_SHEET);
  const packet = ss.getSheetByName(APP.COURSE_BUILD_PACKET_SHEET);
  const creationReview = ss.getSheetByName(APP.COURSE_CREATION_REVIEW_SHEET);
  const launchChecklist = ss.getSheetByName(APP.COURSE_LAUNCH_CHECKLIST_SHEET);

  state.builderItems = getCourseBuilderPanelItems_(builder, 12);
  state.shellItems = getCourseShellPanelItems_(shell, 12);
  state.previewItems = getCourseBuildPreviewItems_(preview, 12);
  state.packetItems = getCourseBuildPacketItems_(packet, 12);
  state.creationItems = getCourseCreationReviewItems_(creationReview, 12);
  state.launchItems = getCourseLaunchChecklistItems_(launchChecklist, 12);
  state.recentLogs = getRecentCommandCentreLogs_(8);
  state.boundary = [
    'Read/sync actions are safe.',
    'Spreadsheet setup and previews are allowed.',
    'Live Proof Checklist is the required harness before scaling apply flows to real courses.',
    'Course Shell Template can plan topics, assignments, materials, announcements, due dates, points, links, and publish flags.',
    'Course creation, topic creation, coursework, materials, announcements, invites, and artifacts require separate approved apply sheets.',
    'No editing, deleting, grading, automatic sending, Calendar changes, or web deployment in this version.',
    'Existing Classroom content remains locked.',
    'Read-only Classroom progress pulls remain separate from Course Builder planning.'
  ];
  state.generatedAt = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd h:mm a');
  return state;
}

function getCourseBuilderPanelItems_(builder, limit) {
  if (!builder || builder.getLastRow() < 2) return [];
  const headers = getCourseBuilderHeaders_();
  const lastRow = getRealLastRowByColumns_(builder, [1, 3, 7, 9, 16, 17, 18]);
  if (lastRow < 2) return [];

  const values = builder.getRange(2, 1, lastRow - 1, headers.length).getDisplayValues();
  const rawBuild = builder.getRange(2, 1, lastRow - 1, 1).getValues();
  return values
    .map((row, index) => ({
      rowNumber: index + 2,
      build: rawBuild[index][0] === true,
      mode: row[1] || 'PLAN_ONLY',
      course: row[2] || '',
      section: row[3] || '',
      topic: row[6] || '',
      itemType: row[7] || '',
      itemTitle: row[8] || '',
      status: row[16] || '',
      preview: row[17] || ''
    }))
    .filter(item => item.course || item.topic || item.itemTitle || item.status)
    .slice(0, Math.max(1, limit || 12));
}

function getCourseShellPanelItems_(shell, limit) {
  if (!shell || shell.getLastRow() < 2) return [];
  const headers = getCourseShellTemplateHeaders_();
  const lastRow = getRealLastRowByColumns_(shell, [1, 2, 3, 8, 10, 17, 18]);
  if (lastRow < 2) return [];

  const values = shell.getRange(2, 1, lastRow - 1, headers.length).getDisplayValues();
  const rawUse = shell.getRange(2, 1, lastRow - 1, 1).getValues();
  return values
    .map((row, index) => ({
      rowNumber: index + 2,
      use: rawUse[index][0] === true,
      templateName: row[1] || '',
      course: row[2] || '',
      section: row[3] || '',
      order: row[6] || '',
      topic: row[7] || '',
      itemType: row[8] || '',
      itemTitle: row[9] || '',
      status: row[16] || '',
      preview: row[17] || ''
    }))
    .filter(item => item.course || item.topic || item.itemTitle || item.status)
    .slice(0, Math.max(1, limit || 12));
}

function getCourseBuildPreviewItems_(preview, limit) {
  if (!preview || preview.getLastRow() < 2) return [];
  const headers = preview.getRange(1, 1, 1, preview.getLastColumn()).getValues()[0].map(h => normalizeText_(h));
  const index = name => getHeaderIndex_(headers, [normalizeText_(name)], -1);
  const idx = {
    row: Math.max(index('Source Row'), index('Builder Row')),
    action: index('Action'),
    course: index('Course'),
    topic: index('Topic'),
    type: index('Item Type'),
    title: index('Item Title'),
    risk: index('Risk'),
    result: index('Preview Result'),
    lock: index('Write Lock')
  };

  const values = preview.getRange(2, 1, preview.getLastRow() - 1, preview.getLastColumn()).getDisplayValues();
  return values
    .map(row => ({
      rowNumber: idx.row >= 0 ? row[idx.row] : '',
      action: idx.action >= 0 ? row[idx.action] : '',
      course: idx.course >= 0 ? row[idx.course] : '',
      topic: idx.topic >= 0 ? row[idx.topic] : '',
      itemType: idx.type >= 0 ? row[idx.type] : '',
      itemTitle: idx.title >= 0 ? row[idx.title] : '',
      risk: idx.risk >= 0 ? row[idx.risk] : '',
      result: idx.result >= 0 ? row[idx.result] : '',
      lock: idx.lock >= 0 ? row[idx.lock] : ''
    }))
    .filter(item => item.course || item.itemTitle || item.risk)
    .slice(0, Math.max(1, limit || 12));
}

function getCourseBuildPacketItems_(packet, limit) {
  if (!packet || packet.getLastRow() < 2) return [];
  const headers = packet.getRange(1, 1, 1, packet.getLastColumn()).getValues()[0].map(h => normalizeText_(h));
  const index = name => getHeaderIndex_(headers, [normalizeText_(name)], -1);
  const idx = {
    row: index('Source Row'),
    selected: index('Selected?'),
    action: index('Future Action'),
    course: index('Course'),
    topic: index('Topic'),
    type: index('Item Type'),
    title: index('Item Title'),
    readiness: index('Readiness'),
    next: index('Manual Next Step')
  };

  const values = packet.getRange(2, 1, packet.getLastRow() - 1, packet.getLastColumn()).getDisplayValues();
  return values
    .map(row => ({
      sourceRow: idx.row >= 0 ? row[idx.row] : '',
      selected: idx.selected >= 0 ? row[idx.selected] : '',
      action: idx.action >= 0 ? row[idx.action] : '',
      course: idx.course >= 0 ? row[idx.course] : '',
      topic: idx.topic >= 0 ? row[idx.topic] : '',
      itemType: idx.type >= 0 ? row[idx.type] : '',
      itemTitle: idx.title >= 0 ? row[idx.title] : '',
      readiness: idx.readiness >= 0 ? row[idx.readiness] : '',
      nextStep: idx.next >= 0 ? row[idx.next] : ''
    }))
    .filter(item => item.course || item.itemTitle || item.readiness)
    .slice(0, Math.max(1, limit || 12));
}

function getCourseCreationReviewItems_(review, limit) {
  if (!review || review.getLastRow() < 2) return [];
  const headers = review.getRange(1, 1, 1, review.getLastColumn()).getValues()[0].map(h => normalizeText_(h));
  const index = name => getHeaderIndex_(headers, [normalizeText_(name)], -1);
  const idx = {
    course: index('Course'),
    section: index('Section'),
    exists: index('Course Exists?'),
    selectedRows: index('Selected Rows'),
    createPlan: index('Create Course Plan?'),
    topics: index('Planned Topics'),
    assignments: index('Planned Assignments'),
    readiness: index('Readiness'),
    detail: index('Readiness Detail'),
    next: index('Manual Next Step')
  };

  const values = review.getRange(2, 1, review.getLastRow() - 1, review.getLastColumn()).getDisplayValues();
  return values
    .map(row => ({
      course: idx.course >= 0 ? row[idx.course] : '',
      section: idx.section >= 0 ? row[idx.section] : '',
      exists: idx.exists >= 0 ? row[idx.exists] : '',
      selectedRows: idx.selectedRows >= 0 ? row[idx.selectedRows] : '',
      createPlan: idx.createPlan >= 0 ? row[idx.createPlan] : '',
      topics: idx.topics >= 0 ? row[idx.topics] : '',
      assignments: idx.assignments >= 0 ? row[idx.assignments] : '',
      readiness: idx.readiness >= 0 ? row[idx.readiness] : '',
      detail: idx.detail >= 0 ? row[idx.detail] : '',
      nextStep: idx.next >= 0 ? row[idx.next] : ''
    }))
    .filter(item => item.course || item.readiness)
    .slice(0, Math.max(1, limit || 12));
}

function getCourseLaunchChecklistItems_(checklist, limit) {
  if (!checklist || checklist.getLastRow() < 2) return [];
  const headers = checklist.getRange(1, 1, 1, checklist.getLastColumn()).getValues()[0].map(h => normalizeText_(h));
  const index = name => getHeaderIndex_(headers, [normalizeText_(name)], -1);
  const idx = {
    step: index('Step'),
    course: index('Course'),
    section: index('Section'),
    source: index('Source Row'),
    actionType: index('Manual Action'),
    title: index('Title / Target'),
    copyText: index('Copy / Paste Text'),
    readiness: index('Readiness'),
    detail: index('Readiness Detail'),
    next: index('Manual Next Step'),
    done: index('Done?')
  };

  const values = checklist.getRange(2, 1, checklist.getLastRow() - 1, checklist.getLastColumn()).getDisplayValues();
  return values
    .map(row => ({
      step: idx.step >= 0 ? row[idx.step] : '',
      course: idx.course >= 0 ? row[idx.course] : '',
      section: idx.section >= 0 ? row[idx.section] : '',
      source: idx.source >= 0 ? row[idx.source] : '',
      actionType: idx.actionType >= 0 ? row[idx.actionType] : '',
      title: idx.title >= 0 ? row[idx.title] : '',
      copyText: idx.copyText >= 0 ? row[idx.copyText] : '',
      readiness: idx.readiness >= 0 ? row[idx.readiness] : '',
      detail: idx.detail >= 0 ? row[idx.detail] : '',
      nextStep: idx.next >= 0 ? row[idx.next] : '',
      done: idx.done >= 0 ? row[idx.done] : ''
    }))
    .filter(item => item.course || item.actionType || item.readiness)
    .slice(0, Math.max(1, limit || 12));
}

function getRecentCommandCentreLogs_(limit) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(APP.COMMAND_CENTRE_LOG_SHEET || 'Command Centre Log');
    if (!sheet || sheet.getLastRow() < 2) return [];
    const count = Math.min(Math.max(1, limit || 8), sheet.getLastRow() - 1);
    const startRow = Math.max(2, sheet.getLastRow() - count + 1);
    return sheet.getRange(startRow, 1, count, 4).getDisplayValues()
      .reverse()
      .map(row => ({
        at: row[0] || '',
        action: row[1] || '',
        result: row[2] || '',
        detail: row[3] || ''
      }));
  } catch (err) {
    return [];
  }
}

function getTeacherPanelSheetLinks_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const baseUrl = String(ss.getUrl() || '').split('#')[0];
  const specs = [
    ['simpleTemplateLibrary', APP.SIMPLE_TEMPLATE_LIBRARY_SHEET || 'Simple Shell Template Library'],
    ['simpleShell', APP.SIMPLE_SHELL_SHEET || 'Simple Shell Builder'],
    ['simpleAnnouncements', APP.SIMPLE_ANNOUNCEMENTS_SHEET || 'Simple Announcements'],
    ['courseBuilder', APP.COURSE_BUILDER_SHEET || 'Course Builder'],
    ['courseShellTemplate', APP.COURSE_SHELL_TEMPLATE_SHEET || 'Course Shell Template'],
    ['courseBuildPreview', APP.COURSE_BUILD_PREVIEW_SHEET || 'Course Build Preview'],
    ['courseBuildPacket', APP.COURSE_BUILD_PACKET_SHEET || 'Course Build Packet'],
    ['courseCreationReview', APP.COURSE_CREATION_REVIEW_SHEET || 'Course Creation Review'],
    ['courseCreationApply', APP.COURSE_CREATION_APPLY_SHEET || 'Course Creation Apply'],
    ['courseCreationApplyProofArchive', APP.COURSE_CREATION_APPLY_PROOF_ARCHIVE_SHEET || 'Course Creation Apply Proof Archive'],
    ['liveProofChecklist', APP.LIVE_PROOF_CHECKLIST_SHEET || 'Live Proof Checklist'],
    ['courseLaunchChecklist', APP.COURSE_LAUNCH_CHECKLIST_SHEET || 'Course Launch Checklist'],
    ['master', APP.MASTER_SHEET || 'MASTER TRACKER NEXT STEP'],
    ['courseMap', APP.COURSE_MAP_SHEET || 'Classroom Course Map'],
    ['emailPreview', APP.EMAIL_PREVIEW_SHEET || 'Email Preview'],
    ['commandCentreLog', APP.COMMAND_CENTRE_LOG_SHEET || 'Command Centre Log']
  ];
  const links = {};

  specs.forEach(([key, sheetName]) => {
    const sheet = ss.getSheetByName(sheetName);
    links[key] = {
      name: sheetName,
      url: sheet ? `${baseUrl}#gid=${sheet.getSheetId()}` : ''
    };
  });

  return links;
}

function sheetNavButtonHtml_(links, key, label) {
  const item = (links || {})[key] || {};
  if (!item.url) {
    return `<a class="nav-button is-disabled" href="#" aria-disabled="true">${escapeHtml_(label)}</a>`;
  }
  return `<a class="nav-button" href="${escapeHtml_(item.url)}" target="_blank" rel="noopener">${escapeHtml_(label)}</a>`;
}

function getTeacherControlPanelHtml_() {
  const state = getTeacherControlPanelState_();
  const stateJson = jsonForHtml_(state);
  const sheetLinks = state.sheetLinks || {};
  return `
<!doctype html>
<html>
<head>
  <base target="_top">
  <style>
    :root {
      color-scheme: light;
      --green: #57b983;
      --green-dark: #0b8043;
      --ink: #1f2933;
      --muted: #5f6b7a;
      --line: #d7dee8;
      --soft: #f6f8fb;
      --warn: #fff7df;
      --danger-bg: #fdf1f1;
      --danger-line: #e4b2b2;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
      color: var(--ink);
      background: #fff;
    }
    .shell { padding: 14px; }
    h1 {
      margin: 0 0 4px;
      font-size: 18px;
      line-height: 1.25;
    }
    .sub {
      margin: 0 0 14px;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.45;
    }
    .lock {
      margin: 0 0 14px;
      padding: 10px 12px;
      border: 1px solid #ead28a;
      background: var(--warn);
      border-radius: 6px;
      font-size: 12px;
      line-height: 1.4;
    }
    .stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 14px;
    }
    .stat {
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 9px 10px;
      background: var(--soft);
    }
    .stat strong {
      display: block;
      font-size: 17px;
      line-height: 1;
      margin-bottom: 4px;
    }
    .stat span {
      display: block;
      color: var(--muted);
      font-size: 11px;
    }
    .summary {
      border: 1px solid var(--line);
      border-radius: 6px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    .summary-row {
      display: grid;
      grid-template-columns: 118px 1fr;
      gap: 8px;
      padding: 8px 10px;
      border-top: 1px solid var(--line);
      font-size: 12px;
      line-height: 1.35;
    }
    .summary-row:first-child { border-top: 0; }
    .summary-row span:first-child { color: var(--muted); }
    .group {
      border-top: 1px solid var(--line);
      padding-top: 12px;
      margin-top: 12px;
    }
    .group h2 {
      margin: 0 0 8px;
      font-size: 13px;
      letter-spacing: 0;
    }
    .button-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    button,
    .nav-button {
      width: 100%;
      min-height: 34px;
      margin: 0 0 8px;
      border: 1px solid #9fb4c8;
      border-radius: 6px;
      background: #fff;
      color: var(--ink);
      cursor: pointer;
      font-size: 13px;
      text-align: left;
      padding: 8px 10px;
    }
    .nav-button {
      display: flex;
      align-items: center;
      text-decoration: none;
    }
    .button-grid button,
    .button-grid .nav-button { margin: 0; }
    button.primary {
      border-color: var(--green-dark);
      background: var(--green);
      color: #000;
      font-weight: 700;
    }
    button.danger {
      border-color: var(--danger-line);
      background: var(--danger-bg);
      color: #8a1f1f;
    }
    button:disabled {
      opacity: .62;
      cursor: not-allowed;
    }
    .nav-button.is-disabled {
      opacity: .55;
      pointer-events: none;
    }
    .status {
      min-height: 18px;
      margin-top: 4px;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.4;
      white-space: pre-line;
    }
    .last-log {
      background: var(--soft);
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 9px 10px;
      font-size: 12px;
      line-height: 1.4;
      margin-top: 8px;
    }
    .help-panel {
      display: none;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: #fff;
      padding: 9px 10px;
      margin-top: 8px;
      font-size: 12px;
      line-height: 1.45;
    }
    .help-panel.is-open { display: block; }
    .help-panel ul {
      margin: 6px 0 0 18px;
      padding: 0;
    }
    a { color: var(--green-dark); }
  </style>
</head>
<body>
  <div class="shell">
    <h1>Next Step Teacher Control Panel</h1>
    <p class="sub">${escapeHtml_(state.spreadsheetName)}</p>
    <div class="lock"><strong>Classroom write lock: ${state.classroomWriteLock}</strong><br>Read/sync actions are safe. Classroom writes run only from approved apply sheets with confirmation text, caps, duplicate checks, ID writeback, and logs.</div>

    <div class="stats">
      <div class="stat"><strong>${state.activeCourses}</strong><span>checked courses</span></div>
      <div class="stat"><strong>${state.masterRows}</strong><span>master rows</span></div>
      <div class="stat"><strong>${state.builderRows}</strong><span>builder rows</span></div>
      <div class="stat"><strong>${state.shellRows}</strong><span>shell rows</span></div>
      <div class="stat"><strong>${state.previewRows}</strong><span>preview rows</span></div>
      <div class="stat"><strong>${state.packetRows}</strong><span>packet rows</span></div>
      <div class="stat"><strong>${state.creationRows}</strong><span>creation rows</span></div>
      <div class="stat"><strong>${state.launchRows}</strong><span>launch rows</span></div>
      <div class="stat"><strong>${state.previewReady}</strong><span>ready rows</span></div>
      <div class="stat"><strong>${state.previewBlocked}</strong><span>blocked rows</span></div>
    </div>

    <div class="summary" id="stateSummary"></div>

    <div class="group">
      <h2>Daily Controls</h2>
      <button class="primary" onclick="runAction('teacherSyncEverything')">Sync Everything</button>
      <button class="primary" onclick="runAction('enableSimpleTeacherMode')">Use Tracker + Announcements Mode</button>
      <button onclick="runAction('setupSimpleTeacherTabs')">Setup Announcements Tab</button>
      <button onclick="runAction('queueSimpleAnnouncementRows')">Queue Simple Announcement Rows</button>
      <button onclick="runAction('postSimpleAnnouncements')">Post Selected Simple Announcements</button>
      <button onclick="runAction('clearSelectedAnnouncementRows')">Clear Selected Announcement Rows</button>
      <button onclick="runAction('clearAllQueuedAnnouncementRows')">Clear All Queued Announcement Rows</button>
      <button class="primary" onclick="runAction('teacherRefreshStudentList')">Refresh Student List</button>
      <button onclick="runAction('refreshFeedStatusAndHighlights')">Refresh Feed Status / HERE Highlight</button>
      <button onclick="runAction('previewSelectedStudentEmails')">Preview Selected Emails</button>
    </div>

    <div class="group">
      <h2>Announcements</h2>
      <p class="sub">Write in the ${escapeHtml_(APP.SIMPLE_ANNOUNCEMENTS_SHEET)} tab, queue the target course rows, then post only checked rows.</p>
      <button onclick="runAction('setupSimpleTeacherTabs')">Open / Repair Announcements Tab</button>
      <button onclick="runAction('queueSimpleAnnouncementRows')">Queue Rows</button>
      <button class="primary" onclick="runAction('postSimpleAnnouncements')">Post Checked Rows</button>
      <button onclick="runAction('clearSelectedAnnouncementRows')">Clear Selected Rows</button>
      <button onclick="runAction('clearAllQueuedAnnouncementRows')">Clear All Rows</button>
    </div>

    <div class="group">
      <h2>Open Sheets</h2>
      <div class="button-grid">
        ${sheetNavButtonHtml_(sheetLinks, 'simpleAnnouncements', 'Simple Announcements')}
        ${sheetNavButtonHtml_(sheetLinks, 'master', 'Master')}
        ${sheetNavButtonHtml_(sheetLinks, 'courseMap', 'Course Map')}
        ${sheetNavButtonHtml_(sheetLinks, 'emailPreview', 'Email Preview')}
        ${sheetNavButtonHtml_(sheetLinks, 'commandCentreLog', 'Log')}
      </div>
    </div>

    <div class="group">
      <h2>Classroom Read-Only Pulls</h2>
      <button onclick="confirmReadOnlyProgress()">Update Progress for Checked Courses</button>
      <button onclick="runAction('showClassroomWriteLockStatus')">Show Write Lock Status</button>
    </div>

    <div class="group">
      <h2>Web App</h2>
      <button onclick="toggleDeploymentHelp()">Deployment Help</button>
      ${state.webAppUrl ? `<p class="sub"><a href="${escapeHtml_(state.webAppUrl)}" target="_blank">Open deployed web app</a></p>` : `<p class="sub">Use Deploy > New deployment > Web app when you want this outside the Sheet sidebar.</p>`}
      <div class="help-panel" id="deploymentHelp">
        Deploy from Apps Script with <strong>Deploy &gt; New deployment &gt; Web app</strong>.
        Start with restricted access, then widen only after you are happy with the panel.
        <ul>
          <li>Execute as: Me</li>
          <li>Access: Only myself or district domain</li>
          <li>Read/sync actions are safe.</li>
          <li>Approved apply sheets are the only Classroom/Drive/Form write gates.</li>
          <li>No editing, deleting, grading, automatic sending, Calendar changes, or web deployment in this version.</li>
        </ul>
      </div>
    </div>

    <div class="last-log" id="lastLog"></div>
    <div id="status" class="status"></div>
  </div>
  <script>
    var panelState = ${stateJson};

    function setStatus(text) {
      document.getElementById('status').textContent = text || '';
    }
    function html(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
    function renderState(state) {
      panelState = state || panelState || {};
      var summary = document.getElementById('stateSummary');
      var lastLog = document.getElementById('lastLog');
      var selected = Number(panelState.builderSelected || 0);
      var shellSelected = Number(panelState.shellSelected || 0);
      var ready = Number(panelState.previewReady || 0);
      var review = Number(panelState.previewReview || 0);
      var blocked = Number(panelState.previewBlocked || 0);
      var notSelected = Number(panelState.previewNotSelected || 0);
      var creationReady = Number(panelState.creationReady || 0);
      var creationReview = Number(panelState.creationReview || 0);
      var creationBlocked = Number(panelState.creationBlocked || 0);
      var launchReady = Number(panelState.launchReady || 0);
      var launchReview = Number(panelState.launchReview || 0);
      var launchBlocked = Number(panelState.launchBlocked || 0);
      summary.innerHTML =
        '<div class="summary-row"><span>Builder selected</span><strong>' + selected + '</strong></div>' +
        '<div class="summary-row"><span>Shell selected</span><strong>' + shellSelected + '</strong></div>' +
        '<div class="summary-row"><span>Preview state</span><strong>' +
          ready + ' ready, ' + review + ' review, ' + blocked + ' blocked, ' + notSelected + ' not selected</strong></div>' +
        '<div class="summary-row"><span>Creation state</span><strong>' +
          creationReady + ' ready, ' + creationReview + ' review, ' + creationBlocked + ' blocked</strong></div>' +
        '<div class="summary-row"><span>Launch checklist</span><strong>' +
          launchReady + ' ready, ' + launchReview + ' review, ' + launchBlocked + ' blocked</strong></div>' +
        '<div class="summary-row"><span>Write lock</span><strong>' + html(panelState.classroomWriteLock || 'ON') + '</strong></div>';

      if (panelState.lastLog && panelState.lastLog.action) {
        lastLog.innerHTML =
          '<strong>Last command</strong><br>' +
          html(panelState.lastLog.at || '') + ' - ' +
          html(panelState.lastLog.action || '') + ' - ' +
          html(panelState.lastLog.result || '');
      } else {
        lastLog.innerHTML = '<strong>Last command</strong><br>No command log entry yet.';
      }
    }
    function refreshState() {
      google.script.run
        .withSuccessHandler(function(state) { renderState(state); })
        .withFailureHandler(function(err) { setStatus('Refresh error: ' + (err && err.message ? err.message : err)); })
        .getTeacherControlPanelClientState();
    }
    function runAction(name) {
      setStatus('Running ' + name + '...');
      google.script.run
        .withSuccessHandler(function() {
          setStatus('Done: ' + name);
          refreshState();
        })
        .withFailureHandler(function(err) { setStatus('Error: ' + (err && err.message ? err.message : err)); })
        [name]();
    }
    function confirmReadOnlyProgress() {
      var ok = confirm('This reads Google Classroom roster/progress data and writes spreadsheet tabs. It does not create or edit Classroom content. Continue?');
      if (ok) runAction('teacherUpdateCheckedClassroomCourses');
    }
    function toggleDeploymentHelp() {
      var help = document.getElementById('deploymentHelp');
      if (help) help.classList.toggle('is-open');
      setStatus('');
    }
    renderState(panelState);
  </script>
</body>
</html>`;
}

function getTeacherWebAppHtml_() {
  const state = getTeacherWebAppState_();
  const stateJson = jsonForHtml_(state);
  const sheetLinks = state.sheetLinks || {};

  return `
<!doctype html>
<html>
<head>
  <base target="_top">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root {
      color-scheme: light;
      --green: #57b983;
      --green-dark: #0b8043;
      --ink: #1f2933;
      --muted: #667085;
      --line: #d8dee8;
      --soft: #f7f9fb;
      --warn: #fff6dc;
      --bad: #fdf1f1;
      --good: #eaf6ee;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
      color: var(--ink);
      background: #ffffff;
    }
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      min-height: 58px;
      padding: 12px 24px;
      border-bottom: 1px solid var(--line);
      background: #fff;
    }
    .title {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    h1 {
      margin: 0;
      font-size: 17px;
      line-height: 1.25;
      font-weight: 700;
    }
    .sub {
      margin: 0;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.4;
    }
    .lock {
      border: 1px solid #ead28a;
      background: var(--warn);
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 12px;
      line-height: 1.35;
      white-space: nowrap;
    }
    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 310px;
      gap: 20px;
      padding: 20px 24px 28px;
      max-width: 1280px;
      margin: 0 auto;
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 14px;
    }
    button,
    .nav-button {
      min-height: 34px;
      border: 1px solid #9fb4c8;
      border-radius: 6px;
      background: #fff;
      color: var(--ink);
      cursor: pointer;
      font-size: 13px;
      line-height: 1.25;
      padding: 8px 11px;
      text-align: left;
      text-decoration: none;
    }
    button.primary {
      border-color: var(--green-dark);
      background: var(--green);
      color: #000;
      font-weight: 700;
    }
    button.danger {
      border-color: #e4b2b2;
      background: var(--bad);
      color: #8a1f1f;
    }
    button:disabled { opacity: .62; cursor: not-allowed; }
    .nav-button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 8px;
    }
    .nav-button.is-disabled { opacity: .55; pointer-events: none; }
    .panel {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      margin-bottom: 16px;
      overflow: hidden;
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 14px;
      border-bottom: 1px solid var(--line);
      background: var(--soft);
    }
    .panel-header h2 {
      margin: 0;
      font-size: 14px;
      line-height: 1.3;
    }
    .panel-body { padding: 12px 14px; }
    .facts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
      border: 1px solid var(--line);
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .fact {
      min-height: 58px;
      padding: 10px 12px;
      border-left: 1px solid var(--line);
      background: #fff;
    }
    .fact:first-child { border-left: 0; }
    .fact strong {
      display: block;
      font-size: 18px;
      line-height: 1;
      margin-bottom: 5px;
    }
    .fact span {
      color: var(--muted);
      font-size: 12px;
      line-height: 1.25;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th, td {
      padding: 8px 9px;
      border-bottom: 1px solid var(--line);
      text-align: left;
      vertical-align: top;
    }
    th {
      color: #344054;
      background: #fff;
      font-weight: 700;
    }
    tr:last-child td { border-bottom: 0; }
    .risk {
      display: inline-block;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 2px 6px;
      background: #fff;
      font-size: 11px;
      line-height: 1.35;
      white-space: nowrap;
    }
    .risk.ready { background: var(--good); border-color: #b8ddc5; color: #235b32; }
    .risk.review { background: var(--warn); border-color: #ead28a; color: #7f6000; }
    .risk.blocked { background: var(--bad); border-color: #e4b2b2; color: #8a1f1f; }
    .muted { color: var(--muted); }
    .status {
      min-height: 18px;
      margin: 0 0 12px;
      color: var(--muted);
      font-size: 12px;
      white-space: pre-line;
    }
    .side-list {
      margin: 0;
      padding-left: 18px;
      color: #344054;
      font-size: 12px;
      line-height: 1.55;
    }
    .empty {
      color: var(--muted);
      font-size: 12px;
      padding: 10px 0;
    }
    @media (max-width: 900px) {
      .topbar { align-items: flex-start; flex-direction: column; }
      .lock { white-space: normal; }
      .layout { grid-template-columns: 1fr; padding: 16px; }
      .facts { grid-template-columns: repeat(2, minmax(120px, 1fr)); }
      .fact:nth-child(odd) { border-left: 0; }
      table { min-width: 720px; }
      .table-wrap { overflow-x: auto; }
    }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="title">
      <h1>Next Step Teacher Control Panel</h1>
      <p class="sub">${escapeHtml_(state.spreadsheetName)} · updated ${escapeHtml_(state.generatedAt || '')}</p>
    </div>
    <div class="lock"><strong>Classroom write lock: ${escapeHtml_(state.classroomWriteLock)}</strong><br>Read/sync actions are safe. Classroom writes run only from approved apply sheets with confirmation text, caps, duplicate checks, ID writeback, and logs.</div>
  </header>

  <main class="layout">
    <section>
      <div class="toolbar">
        <button class="primary" onclick="webRunAction('teacherSyncEverythingFromWebApp')">Sync Everything</button>
        <button class="primary" onclick="webRunAction('enableSimpleTeacherModeFromWebApp')">Use Tracker + Announcements Mode</button>
        <button onclick="webRunAction('setupSimpleTeacherTabsFromWebApp')">Setup Announcements Tab</button>
        <button onclick="webRunAction('queueSimpleAnnouncementRowsFromWebApp')">Queue Announcement Rows</button>
        <button onclick="webRunAction('postSimpleAnnouncementsFromWebApp')">Post Selected Announcements</button>
        <button onclick="webRunAction('clearSelectedAnnouncementRowsFromWebApp')">Clear Selected Announcement Rows</button>
        <button onclick="webRunAction('clearAllQueuedAnnouncementRowsFromWebApp')">Clear All Queued Announcement Rows</button>
        <button onclick="webRefreshState()">Refresh View</button>
      </div>
      <p class="status" id="webStatus"></p>

      <div class="facts" id="facts"></div>

      <div class="panel">
        <div class="panel-header">
          <h2>Course Build Preview</h2>
          <span class="sub" id="previewSummary"></span>
        </div>
        <div class="panel-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Row</th>
                <th>Action</th>
                <th>Course</th>
                <th>Item</th>
                <th>Risk</th>
                <th>Preview Result</th>
              </tr>
            </thead>
            <tbody id="previewRows"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h2>Course Build Packet</h2>
          <span class="sub">Teacher-facing build packet, no Classroom writes</span>
        </div>
        <div class="panel-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Row</th>
                <th>Selected?</th>
                <th>Future Action</th>
                <th>Course</th>
                <th>Item</th>
                <th>Next Step</th>
              </tr>
            </thead>
            <tbody id="packetRows"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h2>Course Creation Review</h2>
          <span class="sub">Course-create readiness, no Classroom writes</span>
        </div>
        <div class="panel-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Exists?</th>
                <th>Create Plan?</th>
                <th>Selected Rows</th>
                <th>Readiness</th>
                <th>Next Step</th>
              </tr>
            </thead>
            <tbody id="creationRows"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h2>Course Launch Checklist</h2>
          <span class="sub">Manual teacher steps, no Classroom writes</span>
        </div>
        <div class="panel-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Step</th>
                <th>Course</th>
                <th>Manual Action</th>
                <th>Copy / Paste</th>
                <th>Readiness</th>
                <th>Next Step</th>
              </tr>
            </thead>
            <tbody id="launchRows"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h2>Builder Rows</h2>
          <span class="sub">Planning sheet only</span>
        </div>
        <div class="panel-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Build?</th>
                <th>Mode</th>
                <th>Course</th>
                <th>Item</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="builderRows"></tbody>
          </table>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h2>Course Shell Template</h2>
          <span class="sub">Topics, coursework, materials, announcements</span>
        </div>
        <div class="panel-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Use?</th>
                <th>Template</th>
                <th>Course</th>
                <th>Item</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="shellRows"></tbody>
          </table>
        </div>
      </div>
    </section>

    <aside>
      <div class="panel">
        <div class="panel-header"><h2>Open Sheets</h2></div>
        <div class="panel-body">
          ${sheetNavButtonHtml_(sheetLinks, 'courseBuilder', 'Course Builder')}
          ${sheetNavButtonHtml_(sheetLinks, 'simpleTemplateLibrary', 'Template Library')}
          ${sheetNavButtonHtml_(sheetLinks, 'simpleShell', 'Simple Shell')}
          ${sheetNavButtonHtml_(sheetLinks, 'simpleAnnouncements', 'Simple Announcements')}
          ${sheetNavButtonHtml_(sheetLinks, 'courseShellTemplate', 'Shell Template')}
          ${sheetNavButtonHtml_(sheetLinks, 'courseBuildPreview', 'Preview')}
          ${sheetNavButtonHtml_(sheetLinks, 'courseBuildPacket', 'Packet')}
          ${sheetNavButtonHtml_(sheetLinks, 'courseCreationReview', 'Creation Review')}
          ${sheetNavButtonHtml_(sheetLinks, 'courseCreationApply', 'Creation Apply')}
          ${sheetNavButtonHtml_(sheetLinks, 'courseCreationApplyProofArchive', 'Proof Archive')}
          ${sheetNavButtonHtml_(sheetLinks, 'liveProofChecklist', 'Live Proof')}
          ${sheetNavButtonHtml_(sheetLinks, 'courseLaunchChecklist', 'Launch Checklist')}
          ${sheetNavButtonHtml_(sheetLinks, 'master', 'Master')}
          ${sheetNavButtonHtml_(sheetLinks, 'courseMap', 'Course Map')}
          ${sheetNavButtonHtml_(sheetLinks, 'emailPreview', 'Email Preview')}
          ${sheetNavButtonHtml_(sheetLinks, 'commandCentreLog', 'Log')}
        </div>
      </div>

      <div class="panel">
        <div class="panel-header"><h2>Boundary</h2></div>
        <div class="panel-body">
          <ul class="side-list" id="boundaryList"></ul>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header"><h2>Recent Commands</h2></div>
        <div class="panel-body" id="recentLogs"></div>
      </div>
    </aside>
  </main>

  <script>
    var webState = ${stateJson};

    function text(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function riskClass(value) {
      var clean = String(value || '').toLowerCase();
      if (clean.indexOf('ready') !== -1) return 'ready';
      if (clean.indexOf('blocked') !== -1) return 'blocked';
      if (clean.indexOf('review') !== -1) return 'review';
      return '';
    }

    function renderFacts(state) {
      var facts = [
        ['Checked courses', state.activeCourses],
        ['Master rows', state.masterRows],
        ['Builder rows', state.builderRows],
        ['Shell rows', state.shellRows],
        ['Preview rows', state.previewRows],
        ['Packet rows', state.packetRows],
        ['Creation rows', state.creationRows],
        ['Launch rows', state.launchRows],
        ['Ready', state.previewReady],
        ['Blocked', state.previewBlocked]
      ];
      document.getElementById('facts').innerHTML = facts.map(function(item) {
        return '<div class="fact"><strong>' + text(item[1]) + '</strong><span>' + text(item[0]) + '</span></div>';
      }).join('');
    }

    function renderPreview(state) {
      var rows = state.previewItems || [];
      document.getElementById('previewSummary').textContent =
        Number(state.previewReady || 0) + ' ready · ' +
        Number(state.previewReview || 0) + ' review · ' +
        Number(state.previewBlocked || 0) + ' blocked · ' +
        Number(state.previewNotSelected || 0) + ' not selected';

      document.getElementById('previewRows').innerHTML = rows.length ? rows.map(function(item) {
        var itemLabel = [item.itemType, item.itemTitle].filter(Boolean).join(' · ');
        return '<tr>' +
          '<td>' + text(item.rowNumber) + '</td>' +
          '<td>' + text(item.action) + '</td>' +
          '<td>' + text(item.course) + '</td>' +
          '<td>' + text(itemLabel || item.topic) + '</td>' +
          '<td><span class="risk ' + riskClass(item.risk) + '">' + text(item.risk) + '</span></td>' +
          '<td class="muted">' + text(item.result) + '</td>' +
        '</tr>';
      }).join('') : '<tr><td colspan="6"><div class="empty">No preview rows yet. Run Preview Build Plan.</div></td></tr>';
    }

    function renderBuilder(state) {
      var rows = state.builderItems || [];
      document.getElementById('builderRows').innerHTML = rows.length ? rows.map(function(item) {
        var itemLabel = [item.itemType, item.itemTitle].filter(Boolean).join(' · ');
        return '<tr>' +
          '<td>' + (item.build ? 'Yes' : 'No') + '</td>' +
          '<td>' + text(item.mode) + '</td>' +
          '<td>' + text(item.course) + '</td>' +
          '<td>' + text(itemLabel || item.topic) + '</td>' +
          '<td><span class="risk ' + riskClass(item.status) + '">' + text(item.status || 'Not previewed') + '</span></td>' +
        '</tr>';
      }).join('') : '<tr><td colspan="5"><div class="empty">No builder rows yet. Run Setup Builder.</div></td></tr>';
    }

    function renderPacket(state) {
      var rows = state.packetItems || [];
      document.getElementById('packetRows').innerHTML = rows.length ? rows.map(function(item) {
        var itemLabel = [item.itemType, item.itemTitle].filter(Boolean).join(' · ');
        return '<tr>' +
          '<td>' + text(item.sourceRow) + '</td>' +
          '<td>' + text(item.selected) + '</td>' +
          '<td>' + text(item.action) + '</td>' +
          '<td>' + text(item.course) + '</td>' +
          '<td>' + text(itemLabel || item.topic) + '</td>' +
          '<td class="muted">' + text(item.nextStep) + '</td>' +
        '</tr>';
      }).join('') : '<tr><td colspan="6"><div class="empty">No packet rows yet. Generate Course Build Packet.</div></td></tr>';
    }

    function renderShell(state) {
      var rows = state.shellItems || [];
      document.getElementById('shellRows').innerHTML = rows.length ? rows.map(function(item) {
        var itemLabel = [item.itemType, item.itemTitle].filter(Boolean).join(' · ');
        return '<tr>' +
          '<td>' + (item.use ? 'Yes' : 'No') + '</td>' +
          '<td>' + text(item.templateName) + '</td>' +
          '<td>' + text(item.course) + '</td>' +
          '<td>' + text((item.order ? item.order + '. ' : '') + (itemLabel || item.topic)) + '</td>' +
          '<td><span class="risk ' + riskClass(item.status) + '">' + text(item.status || 'Not previewed') + '</span></td>' +
        '</tr>';
      }).join('') : '<tr><td colspan="5"><div class="empty">No shell rows yet. Run Setup Shell Template.</div></td></tr>';
    }

    function renderCreation(state) {
      var rows = state.creationItems || [];
      document.getElementById('creationRows').innerHTML = rows.length ? rows.map(function(item) {
        return '<tr>' +
          '<td>' + text(item.course) + (item.section ? '<br><span class="muted">' + text(item.section) + '</span>' : '') + '</td>' +
          '<td>' + text(item.exists) + '</td>' +
          '<td>' + text(item.createPlan) + '</td>' +
          '<td>' + text(item.selectedRows || '-') + '</td>' +
          '<td><span class="risk ' + riskClass(item.readiness) + '">' + text(item.readiness) + '</span></td>' +
          '<td class="muted">' + text(item.nextStep || item.detail) + '</td>' +
        '</tr>';
      }).join('') : '<tr><td colspan="6"><div class="empty">No creation review yet. Build Course Creation Review.</div></td></tr>';
    }

    function renderLaunch(state) {
      var rows = state.launchItems || [];
      document.getElementById('launchRows').innerHTML = rows.length ? rows.map(function(item) {
        return '<tr>' +
          '<td>' + text(item.step) + '</td>' +
          '<td>' + text(item.course) + (item.section ? '<br><span class="muted">' + text(item.section) + '</span>' : '') + '</td>' +
          '<td>' + text(item.actionType) + '<br><span class="muted">' + text(item.source) + '</span></td>' +
          '<td class="muted">' + text(item.copyText) + '</td>' +
          '<td><span class="risk ' + riskClass(item.readiness) + '">' + text(item.readiness) + '</span></td>' +
          '<td class="muted">' + text(item.nextStep || item.detail) + '</td>' +
        '</tr>';
      }).join('') : '<tr><td colspan="6"><div class="empty">No launch checklist yet. Build Course Launch Checklist.</div></td></tr>';
    }

    function renderSide(state) {
      document.getElementById('boundaryList').innerHTML = (state.boundary || []).map(function(item) {
        return '<li>' + text(item) + '</li>';
      }).join('');

      var logs = state.recentLogs || [];
      document.getElementById('recentLogs').innerHTML = logs.length ? logs.map(function(log) {
        return '<p class="sub"><strong>' + text(log.result) + '</strong> · ' +
          text(log.action) + '<br>' + text(log.at) + '<br>' + text(log.detail) + '</p>';
      }).join('') : '<div class="empty">No command log entries yet.</div>';
    }

    function renderWebState(state) {
      webState = state || webState || {};
      renderFacts(webState);
      renderPreview(webState);
      renderBuilder(webState);
      renderPacket(webState);
      renderCreation(webState);
      renderLaunch(webState);
      renderShell(webState);
      renderSide(webState);
    }

    function setWebStatus(message) {
      document.getElementById('webStatus').textContent = message || '';
    }

    function webRefreshState() {
      setWebStatus('Refreshing...');
      google.script.run
        .withSuccessHandler(function(state) {
          renderWebState(state);
          setWebStatus('View refreshed.');
        })
        .withFailureHandler(function(err) {
          setWebStatus('Refresh error: ' + (err && err.message ? err.message : err));
        })
        .getTeacherWebAppClientState();
    }

    function webRunAction(name) {
      var lockedApply = name === 'applyCourseBuildPlanFromWebApp';
      if (lockedApply && !confirm('This action is locked. It will only log that Classroom writes are blocked. Continue?')) return;
      setWebStatus('Running...');
      google.script.run
        .withSuccessHandler(function(response) {
          renderWebState(response && response.state ? response.state : webState);
          var msg = response && response.result && response.result.message ? response.result.message : 'Done.';
          setWebStatus(msg);
        })
        .withFailureHandler(function(err) {
          setWebStatus('Action error: ' + (err && err.message ? err.message : err));
        })
        [name]();
    }

    renderWebState(webState);
  </script>
</body>
</html>`;
}

function getCourseBuilderHeaders_() {
  return [
    'Build?',
    'Mode',
    'Target Course Name',
    'Section',
    'Owner Email',
    'Co-Teacher Emails',
    'Topic',
    'Item Type',
    'Item Title',
    'Description / Instructions',
    'Due Date',
    'Points',
    'Attachment Link',
    'Publish?',
    'Roster Source',
    'Student Emails',
    'Status',
    'Preview Result'
  ];
}

function getCourseShellTemplateHeaders_() {
  return [
    'Use?',
    'Template Name',
    'Target Course Name',
    'Section',
    'Owner Email',
    'Co-Teacher Emails',
    'Order',
    'Topic',
    'Item Type',
    'Item Title',
    'Description / Instructions',
    'Due Date',
    'Points',
    'Attachment Link',
    'Publish?',
    'Notes',
    'Status',
    'Preview Result'
  ];
}

function getCourseBuildPreviewHeaders_() {
  return ['Timestamp', 'Source Row', 'Action', 'Course', 'Section', 'Topic', 'Item Type', 'Item Title', 'Due Date', 'Points', 'Errors', 'Warnings', 'Risk', 'Preview Result', 'Write Lock'];
}

function getCourseBuildPacketHeaders_() {
  return [
    'Timestamp',
    'Source Row',
    'Selected?',
    'Future Action',
    'Course',
    'Section',
    'Owner Email',
    'Co-Teacher Emails',
    'Topic',
    'Item Type',
    'Item Title',
    'Description / Instructions',
    'Due Date',
    'Points',
    'Attachment Link',
    'Publish?',
    'Student Emails',
    'Readiness',
    'Readiness Detail',
    'Write Lock',
    'Manual Next Step'
  ];
}

function getCourseCreationReviewHeaders_() {
  return [
    'Timestamp',
    'Course',
    'Section',
    'Course Exists?',
    'Selected Rows',
    'Builder Rows',
    'Shell Rows',
    'Create Course Plan?',
    'Owner Email',
    'Co-Teacher Emails',
    'Planned Topics',
    'Planned Assignments',
    'Planned Materials',
    'Planned Announcements',
    'Student Invite Rows',
    'Readiness',
    'Readiness Detail',
    'Write Lock',
    'Manual Next Step'
  ];
}

function getCourseCreationApplyHeaders_() {
  return [
    'Approve Create?',
    'Confirm Text',
    'Course Name',
    'Section',
    'Owner Email',
    'Description Heading',
    'Room',
    'Course State',
    'Existing Course ID',
    'Create Course Plan?',
    'Readiness',
    'Block Reason',
    'Created Course ID',
    'Created At',
    'Created By',
    'Course Status',
    'Status Checked At',
    'Apply Result'
  ];
}

function getCourseCreationApplyProofArchiveHeaders_() {
  return getCourseCreationApplyHeaders_().concat(['Archived At', 'Archive Reason']);
}

function getCourseLaunchChecklistHeaders_() {
  return [
    'Timestamp',
    'Step',
    'Course',
    'Section',
    'Source Row',
    'Manual Action',
    'Title / Target',
    'Copy / Paste Text',
    'Readiness',
    'Readiness Detail',
    'Manual Next Step',
    'Done?'
  ];
}

function getLiveProofChecklistHeaders_() {
  return [
    'Phase',
    'Allowed Test Target',
    'Approved?',
    'Ran?',
    'Result',
    'Created ID / URL',
    'Duplicate Re-run Verified?',
    'Live Classroom Spot Check?',
    'Blocked From Real Courses?',
    'Notes'
  ];
}

function getDefaultLiveProofChecklistRows_() {
  return [
    ['Topic Apply', 'One disposable test course only', false, false, 'NOT RUN', '', '', '', 'YES', 'Create one topic, then rerun and confirm duplicate block.'],
    ['Material Apply', 'One disposable test course only', false, false, 'NOT RUN', '', '', '', 'YES', 'Create one harmless draft material with one safe link.'],
    ['Assignment Apply', 'One disposable test course only', false, false, 'NOT RUN', '', '', '', 'YES', 'Create one draft assignment only; use no due date or safe future date.'],
    ['Announcement Apply', 'One disposable test course only', false, false, 'NOT RUN', '', '', '', 'YES', 'Create one draft-only announcement. Do not publish to students.'],
    ['Artifact Apply', 'One disposable test student row only', false, false, 'NOT RUN', '', '', '', 'YES', 'Approve one row only. Do not approve all artifact rows at once.'],
    ['Student Invite Apply', 'Dummy/test account only', false, false, 'LOCKED', '', '', '', 'YES', 'Keep locked unless you explicitly decide to test roster permissions.'],
    ['Teacher Invite Apply', 'Dummy/test account only', false, false, 'LOCKED', '', '', '', 'YES', 'Keep locked unless you explicitly decide to test teacher invite permissions.'],
    ['Email Send', 'Email Preview selected row only', false, false, 'LOCKED', '', '', '', 'YES', 'Do not run until controlled apply flows are proven.'],
    ['Web App Deployment', 'Not in this phase', false, false, 'LOCKED', '', '', '', 'YES', 'Keep locked until all apply gates are proven on disposable tests.']
  ];
}

function buildLiveProofChecklistInternal_(existingSheet) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = existingSheet || ss.getSheetByName(APP.LIVE_PROOF_CHECKLIST_SHEET) || ss.insertSheet(APP.LIVE_PROOF_CHECKLIST_SHEET);
  const headers = getLiveProofChecklistHeaders_();
  const defaults = getDefaultLiveProofChecklistRows_();

  const existingMap = {};
  const existingLastRow = sheet.getLastRow();
  if (existingLastRow >= 2) {
    const headerRow = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0].map(h => normalizeText_(h));
    const idx = {
      phase: getHeaderIndex_(headerRow, ['phase'], 0),
      target: getHeaderIndex_(headerRow, ['allowed test target'], 1),
      approved: getHeaderIndex_(headerRow, ['approved?'], 2),
      ran: getHeaderIndex_(headerRow, ['ran?'], 3),
      result: getHeaderIndex_(headerRow, ['result'], 4),
      created: getHeaderIndex_(headerRow, ['created id / url', 'created id/url'], 5),
      duplicate: getHeaderIndex_(headerRow, ['duplicate re-run verified?', 'duplicate rerun verified?'], 6),
      spotCheck: getHeaderIndex_(headerRow, ['live classroom spot check?'], 7),
      blocked: getHeaderIndex_(headerRow, ['blocked from real courses?'], 8),
      notes: getHeaderIndex_(headerRow, ['notes'], 9)
    };
    const existingRows = sheet.getRange(2, 1, existingLastRow - 1, Math.max(sheet.getLastColumn(), headers.length)).getValues();
    existingRows.forEach(row => {
      const phase = String((idx.phase >= 0 ? row[idx.phase] : '') || '').trim();
      if (!phase) return;
      existingMap[normalizeText_(phase)] = [
        phase,
        idx.target >= 0 ? row[idx.target] : '',
        idx.approved >= 0 ? row[idx.approved] === true : false,
        idx.ran >= 0 ? row[idx.ran] === true : false,
        idx.result >= 0 ? row[idx.result] : '',
        idx.created >= 0 ? row[idx.created] : '',
        idx.duplicate >= 0 ? row[idx.duplicate] : '',
        idx.spotCheck >= 0 ? row[idx.spotCheck] : '',
        idx.blocked >= 0 ? row[idx.blocked] : '',
        idx.notes >= 0 ? row[idx.notes] : ''
      ];
    });
  }

  const rows = defaults.map(defaultRow => {
    const key = normalizeText_(defaultRow[0]);
    const existing = existingMap[key];
    if (!existing) return defaultRow;
    return [
      defaultRow[0],
      existing[1] || defaultRow[1],
      existing[2] === true,
      existing[3] === true,
      existing[4] || defaultRow[4],
      existing[5] || '',
      existing[6] || '',
      existing[7] || '',
      existing[8] || defaultRow[8],
      existing[9] || defaultRow[9]
    ];
  });

  writeSimpleTable_(sheet, headers, rows);
  styleLiveProofChecklistSheet_(sheet, rows.length + 1);

  const approved = rows.filter(row => row[2] === true).length;
  const ran = rows.filter(row => row[3] === true).length;
  appendCommandCentreLog_('BUILD LIVE PROOF CHECKLIST', 'DONE', `Rows: ${rows.length}; approved: ${approved}; ran: ${ran}. Disposable test-only safety harness refreshed.`);

  return {
    rows: rows.length,
    approved,
    ran
  };
}

function styleCourseBuildPreviewSheet_(sheet, numRows) {
  const headers = getCourseBuildPreviewHeaders_();
  styleSimpleSheet_(sheet, Math.max(numRows || sheet.getLastRow(), 1), headers.length);
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 170);
  sheet.setColumnWidth(2, 90);
  sheet.setColumnWidth(3, 180);
  sheet.setColumnWidth(4, 190);
  sheet.setColumnWidth(5, 110);
  sheet.setColumnWidth(6, 170);
  sheet.setColumnWidth(7, 135);
  sheet.setColumnWidth(8, 230);
  sheet.setColumnWidth(9, 110);
  sheet.setColumnWidth(10, 80);
  sheet.setColumnWidth(11, 75);
  sheet.setColumnWidth(12, 85);
  sheet.setColumnWidth(13, 135);
  sheet.setColumnWidth(14, 520);
  sheet.setColumnWidth(15, 90);

  if (sheet.getLastRow() > 1) {
    const dataRows = sheet.getLastRow() - 1;
    const riskRange = sheet.getRange(2, 13, dataRows, 1);
    sheet.setConditionalFormatRules([
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('READY FOR REVIEW').setBackground('#d9ead3').setFontColor('#274e13').setRanges([riskRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('REVIEW').setBackground('#fff2cc').setFontColor('#7f6000').setRanges([riskRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('BLOCKED').setBackground('#f4cccc').setFontColor('#990000').setRanges([riskRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('NOT SELECTED').setBackground('#eeeeee').setFontColor('#666666').setRanges([riskRange]).build()
    ]);
  }
}

function styleCourseBuildPacketSheet_(sheet, numRows) {
  const headers = getCourseBuildPacketHeaders_();
  styleSimpleSheet_(sheet, Math.max(numRows || sheet.getLastRow(), 1), headers.length);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(5);
  sheet.setColumnWidth(1, 170);
  sheet.setColumnWidth(2, 95);
  sheet.setColumnWidth(3, 85);
  sheet.setColumnWidth(4, 180);
  sheet.setColumnWidth(5, 210);
  sheet.setColumnWidth(6, 120);
  sheet.setColumnWidth(7, 230);
  sheet.setColumnWidth(8, 260);
  sheet.setColumnWidth(9, 180);
  sheet.setColumnWidth(10, 135);
  sheet.setColumnWidth(11, 260);
  sheet.setColumnWidth(12, 440);
  sheet.setColumnWidth(13, 110);
  sheet.setColumnWidth(14, 80);
  sheet.setColumnWidth(15, 280);
  sheet.setColumnWidth(16, 80);
  sheet.setColumnWidth(17, 360);
  sheet.setColumnWidth(18, 135);
  sheet.setColumnWidth(19, 520);
  sheet.setColumnWidth(20, 90);
  sheet.setColumnWidth(21, 420);

  if (sheet.getLastRow() > 1) {
    const dataRows = sheet.getLastRow() - 1;
    const readinessRange = sheet.getRange(2, 18, dataRows, 1);
    sheet.setConditionalFormatRules([
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('READY FOR REVIEW').setBackground('#d9ead3').setFontColor('#274e13').setRanges([readinessRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('REVIEW').setBackground('#fff2cc').setFontColor('#7f6000').setRanges([readinessRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('BLOCKED').setBackground('#f4cccc').setFontColor('#990000').setRanges([readinessRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('NOT SELECTED').setBackground('#eeeeee').setFontColor('#666666').setRanges([readinessRange]).build()
    ]);
  }
}

function styleCourseCreationReviewSheet_(sheet, numRows) {
  const headers = getCourseCreationReviewHeaders_();
  styleSimpleSheet_(sheet, Math.max(numRows || sheet.getLastRow(), 1), headers.length);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(4);
  sheet.setColumnWidth(1, 170);
  sheet.setColumnWidth(2, 220);
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 110);
  sheet.setColumnWidth(5, 150);
  sheet.setColumnWidth(6, 150);
  sheet.setColumnWidth(7, 150);
  sheet.setColumnWidth(8, 135);
  sheet.setColumnWidth(9, 230);
  sheet.setColumnWidth(10, 260);
  sheet.setColumnWidth(11, 120);
  sheet.setColumnWidth(12, 135);
  sheet.setColumnWidth(13, 125);
  sheet.setColumnWidth(14, 155);
  sheet.setColumnWidth(15, 155);
  sheet.setColumnWidth(16, 135);
  sheet.setColumnWidth(17, 520);
  sheet.setColumnWidth(18, 90);
  sheet.setColumnWidth(19, 420);

  if (sheet.getLastRow() > 1) {
    const dataRows = sheet.getLastRow() - 1;
    const readinessRange = sheet.getRange(2, 16, dataRows, 1);
    sheet.setConditionalFormatRules([
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('READY FOR REVIEW').setBackground('#d9ead3').setFontColor('#274e13').setRanges([readinessRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('REVIEW').setBackground('#fff2cc').setFontColor('#7f6000').setRanges([readinessRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('BLOCKED').setBackground('#f4cccc').setFontColor('#990000').setRanges([readinessRange]).build()
    ]);
  }
}

function styleCourseCreationApplySheet_(sheet, numRows) {
  const headers = getCourseCreationApplyHeaders_();
  styleSimpleSheet_(sheet, Math.max(numRows || sheet.getLastRow(), 1), headers.length);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(3);
  sheet.setColumnWidth(1, 95);
  sheet.setColumnWidth(2, 145);
  sheet.setColumnWidth(3, 230);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 230);
  sheet.setColumnWidth(6, 280);
  sheet.setColumnWidth(7, 120);
  sheet.setColumnWidth(8, 125);
  sheet.setColumnWidth(9, 220);
  sheet.setColumnWidth(10, 135);
  sheet.setColumnWidth(11, 145);
  sheet.setColumnWidth(12, 520);
  sheet.setColumnWidth(13, 220);
  sheet.setColumnWidth(14, 170);
  sheet.setColumnWidth(15, 230);
  sheet.setColumnWidth(16, 170);
  sheet.setColumnWidth(17, 170);
  sheet.setColumnWidth(18, 360);

  if (sheet.getLastRow() > 1) {
    const dataRows = sheet.getLastRow() - 1;
    sheet.getRange(2, 1, dataRows, 1).insertCheckboxes();
    sheet.getRange(2, 14, dataRows, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
    sheet.getRange(2, 17, dataRows, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');

    const stateRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['PROVISIONED', 'ACTIVE'], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(2, 8, dataRows, 1).setDataValidation(stateRule);

    const readinessRange = sheet.getRange(2, 11, dataRows, 1);
    const courseStatusRange = sheet.getRange(2, 16, dataRows, 1);
    const resultRange = sheet.getRange(2, 18, dataRows, 1);
    sheet.setConditionalFormatRules([
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('READY FOR REVIEW').setBackground('#d9ead3').setFontColor('#274e13').setRanges([readinessRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('REVIEW').setBackground('#fff2cc').setFontColor('#7f6000').setRanges([readinessRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('BLOCKED').setBackground('#f4cccc').setFontColor('#990000').setRanges([readinessRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('COURSE EXISTS').setBackground('#d9ead3').setFontColor('#274e13').setRanges([courseStatusRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('COURSE NOT FOUND').setBackground('#f4cccc').setFontColor('#990000').setRanges([courseStatusRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextContains('TEST DELETED').setBackground('#fff2cc').setFontColor('#7f6000').setRanges([courseStatusRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextContains('CREATED').setBackground('#d9ead3').setFontColor('#274e13').setRanges([resultRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextContains('ERROR').setBackground('#f4cccc').setFontColor('#990000').setRanges([resultRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextContains('SKIPPED').setBackground('#eeeeee').setFontColor('#666666').setRanges([resultRange]).build()
    ]);
  }
}

function styleCourseCreationApplyProofArchiveSheet_(sheet, numRows) {
  const headers = getCourseCreationApplyProofArchiveHeaders_();
  styleSimpleSheet_(sheet, Math.max(numRows || sheet.getLastRow(), 1), headers.length);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(3);
  sheet.setColumnWidth(1, 95);
  sheet.setColumnWidth(3, 230);
  sheet.setColumnWidth(12, 520);
  sheet.setColumnWidth(16, 190);
  sheet.setColumnWidth(18, 360);
  sheet.setColumnWidth(19, 170);
  sheet.setColumnWidth(20, 360);
  if (sheet.getLastRow() > 1) {
    const dataRows = sheet.getLastRow() - 1;
    sheet.getRange(2, 14, dataRows, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
    sheet.getRange(2, 17, dataRows, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
    sheet.getRange(2, 19, dataRows, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
  }
}

function styleCourseLaunchChecklistSheet_(sheet, numRows) {
  const headers = getCourseLaunchChecklistHeaders_();
  styleSimpleSheet_(sheet, Math.max(numRows || sheet.getLastRow(), 1), headers.length);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(4);
  sheet.setColumnWidth(1, 170);
  sheet.setColumnWidth(2, 70);
  sheet.setColumnWidth(3, 220);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 110);
  sheet.setColumnWidth(6, 190);
  sheet.setColumnWidth(7, 260);
  sheet.setColumnWidth(8, 520);
  sheet.setColumnWidth(9, 135);
  sheet.setColumnWidth(10, 520);
  sheet.setColumnWidth(11, 430);
  sheet.setColumnWidth(12, 75);

  if (sheet.getLastRow() > 1) {
    const dataRows = sheet.getLastRow() - 1;
    const readinessRange = sheet.getRange(2, 9, dataRows, 1);
    sheet.setConditionalFormatRules([
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('READY FOR REVIEW').setBackground('#d9ead3').setFontColor('#274e13').setRanges([readinessRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('REVIEW').setBackground('#fff2cc').setFontColor('#7f6000').setRanges([readinessRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('BLOCKED').setBackground('#f4cccc').setFontColor('#990000').setRanges([readinessRange]).build()
    ]);
  }
}

function styleLiveProofChecklistSheet_(sheet, numRows) {
  const headers = getLiveProofChecklistHeaders_();
  styleSimpleSheet_(sheet, Math.max(numRows || sheet.getLastRow(), 1), headers.length);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2);
  sheet.setColumnWidth(1, 170);
  sheet.setColumnWidth(2, 260);
  sheet.setColumnWidth(3, 95);
  sheet.setColumnWidth(4, 75);
  sheet.setColumnWidth(5, 150);
  sheet.setColumnWidth(6, 260);
  sheet.setColumnWidth(7, 190);
  sheet.setColumnWidth(8, 180);
  sheet.setColumnWidth(9, 190);
  sheet.setColumnWidth(10, 520);

  if (sheet.getLastRow() > 1) {
    const dataRows = sheet.getLastRow() - 1;
    sheet.getRange(2, 3, dataRows, 1).insertCheckboxes();
    sheet.getRange(2, 4, dataRows, 1).insertCheckboxes();

    const blockedRange = sheet.getRange(2, 9, dataRows, 1);
    const resultRange = sheet.getRange(2, 5, dataRows, 1);
    const duplicateRange = sheet.getRange(2, 7, dataRows, 1);
    sheet.setConditionalFormatRules([
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('YES').setBackground('#f4cccc').setFontColor('#990000').setRanges([blockedRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextContains('PASS').setBackground('#d9ead3').setFontColor('#274e13').setRanges([resultRange, duplicateRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextContains('DONE').setBackground('#d9ead3').setFontColor('#274e13').setRanges([resultRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextContains('LOCKED').setBackground('#fff2cc').setFontColor('#7f6000').setRanges([resultRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextContains('FAIL').setBackground('#f4cccc').setFontColor('#990000').setRanges([resultRange, duplicateRange]).build()
    ]);
  }
}

function styleCourseBuilderSheet_(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), 2);
  const headers = getCourseBuilderHeaders_();
  styleSimpleSheet_(sheet, lastRow, headers.length);
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 70);
  sheet.setColumnWidth(2, 130);
  sheet.setColumnWidth(3, 220);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 220);
  sheet.setColumnWidth(6, 260);
  sheet.setColumnWidth(7, 180);
  sheet.setColumnWidth(8, 140);
  sheet.setColumnWidth(9, 260);
  sheet.setColumnWidth(10, 420);
  sheet.setColumnWidth(11, 110);
  sheet.setColumnWidth(12, 80);
  sheet.setColumnWidth(13, 280);
  sheet.setColumnWidth(14, 80);
  sheet.setColumnWidth(15, 130);
  sheet.setColumnWidth(16, 360);
  sheet.setColumnWidth(17, 130);
  sheet.setColumnWidth(18, 360);

  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 1).insertCheckboxes();
    sheet.getRange(2, 14, lastRow - 1, 1).insertCheckboxes();
    sheet.getRange(2, 11, lastRow - 1, 1).setNumberFormat('yyyy-mm-dd');

    const modeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['PLAN_ONLY', 'CREATE_COURSE', 'ADD_TOPIC', 'ADD_ASSIGNMENT', 'ADD_MATERIAL', 'ADD_ANNOUNCEMENT', 'ADD_STUDENTS'], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(2, 2, lastRow - 1, 1).setDataValidation(modeRule);

    const itemTypeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['COURSE', 'TOPIC', 'ASSIGNMENT', 'MATERIAL', 'ANNOUNCEMENT', 'STUDENT_INVITES'], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange(2, 8, lastRow - 1, 1).setDataValidation(itemTypeRule);

    const rules = sheet.getConditionalFormatRules().filter(rule => {
      const ranges = rule.getRanges ? rule.getRanges() : [];
      return !ranges.some(range => range.getColumn() === 17);
    });
    const statusRange = sheet.getRange(2, 17, lastRow - 1, 1);
    rules.push(
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('READY FOR REVIEW').setBackground('#d9ead3').setFontColor('#274e13').setRanges([statusRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('REVIEW').setBackground('#fff2cc').setFontColor('#7f6000').setRanges([statusRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('BLOCKED').setBackground('#f4cccc').setFontColor('#990000').setRanges([statusRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('NOT SELECTED').setBackground('#eeeeee').setFontColor('#666666').setRanges([statusRange]).build()
    );
    sheet.setConditionalFormatRules(rules);
  }
}

function styleCourseShellTemplateSheet_(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), 2);
  const headers = getCourseShellTemplateHeaders_();
  styleSimpleSheet_(sheet, lastRow, headers.length);
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 70);
  sheet.setColumnWidth(2, 160);
  sheet.setColumnWidth(3, 220);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 220);
  sheet.setColumnWidth(6, 260);
  sheet.setColumnWidth(7, 80);
  sheet.setColumnWidth(8, 180);
  sheet.setColumnWidth(9, 140);
  sheet.setColumnWidth(10, 260);
  sheet.setColumnWidth(11, 420);
  sheet.setColumnWidth(12, 110);
  sheet.setColumnWidth(13, 80);
  sheet.setColumnWidth(14, 280);
  sheet.setColumnWidth(15, 80);
  sheet.setColumnWidth(16, 260);
  sheet.setColumnWidth(17, 130);
  sheet.setColumnWidth(18, 360);

  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 1).insertCheckboxes();
    sheet.getRange(2, 15, lastRow - 1, 1).insertCheckboxes();
    sheet.getRange(2, 12, lastRow - 1, 1).setNumberFormat('yyyy-mm-dd');

    const itemTypeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['COURSE', 'TOPIC', 'ASSIGNMENT', 'MATERIAL', 'ANNOUNCEMENT'], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(2, 9, lastRow - 1, 1).setDataValidation(itemTypeRule);

    const rules = sheet.getConditionalFormatRules().filter(rule => {
      const ranges = rule.getRanges ? rule.getRanges() : [];
      return !ranges.some(range => range.getColumn() === 17);
    });
    const statusRange = sheet.getRange(2, 17, lastRow - 1, 1);
    rules.push(
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('READY FOR REVIEW').setBackground('#d9ead3').setFontColor('#274e13').setRanges([statusRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('REVIEW').setBackground('#fff2cc').setFontColor('#7f6000').setRanges([statusRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('BLOCKED').setBackground('#f4cccc').setFontColor('#990000').setRanges([statusRange]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('NOT SELECTED').setBackground('#eeeeee').setFontColor('#666666').setRanges([statusRange]).build()
    );
    sheet.setConditionalFormatRules(rules);
  }
}

function getApprovedCourseCreatePreview_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(APP.COURSE_CREATION_APPLY_SHEET);
    const records = readCourseCreationApplyRecords_(sheet);
    const approvedRows = records.filter(item => item.approveCreate === true);
    const alreadyCreated = approvedRows.filter(item => item.existingCourseId || item.createdCourseId).length;
    const safeRows = records
      .filter(item => item.approveCreate === true)
      .filter(item => normalizeText_(item.confirmText) === 'create course')
      .filter(item => normalizeText_(item.createPlan) === 'yes')
      .filter(item => normalizeText_(item.readiness) === 'ready for review')
      .filter(item => !item.existingCourseId)
      .filter(item => !item.createdCourseId);

    return {
      approved: safeRows.length,
      approvedTotal: approvedRows.length,
      alreadyCreated,
      blockedApproved: Math.max(0, approvedRows.length - safeRows.length - alreadyCreated),
      names: safeRows.slice(0, COURSE_CREATE_MAX_PER_RUN).map(item => `- ${item.courseName}${item.section ? ` (${item.section})` : ''}`)
    };
  } catch (err) {
    return { approved: 0, approvedTotal: 0, alreadyCreated: 0, blockedApproved: 0, names: [] };
  }
}

function readCourseCreationApplyRecords_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  const headers = getCourseCreationApplyHeaders_();
  ensureHeaderRow_(sheet, headers);
  const lastRow = getRealLastRowByColumns_(sheet, [1, 2, 3, 9, 13, 16]);
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return values
    .map((row, index) => ({
      rowNumber: index + 2,
      approveCreate: row[0] === true,
      confirmText: String(row[1] || '').trim(),
      courseName: String(row[2] || '').trim(),
      section: String(row[3] || '').trim(),
      ownerEmail: String(row[4] || '').trim(),
      descriptionHeading: String(row[5] || '').trim(),
      room: String(row[6] || '').trim(),
      courseState: String(row[7] || '').trim(),
      existingCourseId: String(row[8] || '').trim(),
      createPlan: String(row[9] || '').trim(),
      readiness: String(row[10] || '').trim(),
      blockReason: String(row[11] || '').trim(),
      createdCourseId: String(row[12] || '').trim(),
      createdAt: row[13] || '',
      createdBy: String(row[14] || '').trim(),
      courseStatus: String(row[15] || '').trim(),
      statusCheckedAt: row[16] || '',
      applyResult: String(row[17] || '').trim()
    }))
    .filter(item => item.courseName || item.existingCourseId || item.createdCourseId || item.applyResult);
}

function updateCourseCreationApplyResult_(sheet, rowNumber, result) {
  if (!sheet || !rowNumber || rowNumber < 2) return;
  const headers = getCourseCreationApplyHeaders_();
  const createdIdCol = headers.indexOf('Created Course ID') + 1;
  const createdAtCol = headers.indexOf('Created At') + 1;
  const createdByCol = headers.indexOf('Created By') + 1;
  const courseStatusCol = headers.indexOf('Course Status') + 1;
  const statusCheckedAtCol = headers.indexOf('Status Checked At') + 1;
  const applyResultCol = headers.indexOf('Apply Result') + 1;
  const existingIdCol = headers.indexOf('Existing Course ID') + 1;

  if (result.createdCourseId && createdIdCol) {
    sheet.getRange(rowNumber, createdIdCol).setValue(result.createdCourseId);
  }
  if (result.existingCourseId && existingIdCol) {
    sheet.getRange(rowNumber, existingIdCol).setValue(result.existingCourseId);
  }
  if (result.when && createdAtCol) {
    sheet.getRange(rowNumber, createdAtCol).setValue(result.when).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
  }
  if (result.createdBy && createdByCol) {
    sheet.getRange(rowNumber, createdByCol).setValue(result.createdBy);
  }
  if (result.courseStatus && courseStatusCol) {
    sheet.getRange(rowNumber, courseStatusCol).setValue(result.courseStatus);
  }
  if (result.statusCheckedAt && statusCheckedAtCol) {
    sheet.getRange(rowNumber, statusCheckedAtCol).setValue(result.statusCheckedAt).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
  }
  if (applyResultCol) {
    sheet.getRange(rowNumber, applyResultCol).setValue(result.reason || (result.applied ? 'CREATED' : 'SKIPPED'));
  }
}

function propagateCourseCreationApplyResult_(item, courseId, resultText, existingResultText) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const targets = [
    { sheet: ss.getSheetByName(APP.COURSE_BUILDER_SHEET), statusCol: 17, detailCol: 18 },
    { sheet: ss.getSheetByName(APP.COURSE_SHELL_TEMPLATE_SHEET), statusCol: 17, detailCol: 18 }
  ];
  const key = makeCourseSectionKey_(item.courseName, item.section);
  const detail = resultText || existingResultText || '';

  targets.forEach(target => {
    const sheet = target.sheet;
    if (!sheet || sheet.getLastRow() < 2 || !key) return;
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => normalizeText_(h));
    const nameIndex = getHeaderIndex_(headers, ['target course name', 'course name', 'course'], 2);
    const sectionIndex = getHeaderIndex_(headers, ['section'], 3);
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    values.forEach((row, index) => {
      const rowKey = makeCourseSectionKey_(row[nameIndex], row[sectionIndex]);
      if (rowKey !== key) return;
      const status = courseId ? 'CREATED' : 'REVIEW';
      setValuesNoValidation_(sheet.getRange(index + 2, target.statusCol, 1, 2), [[status, detail]]);
    });
  });
}

function buildCourseCreationApplyLookup_(records) {
  const lookup = buildKnownClassroomCourseLookup_();
  (records || []).forEach(record => {
    const key = makeCourseSectionKey_(record.courseName, record.section);
    if (!key) return;
    const id = record.existingCourseId || record.createdCourseId || '';
    if (id) lookup[key] = id;
  });
  return lookup;
}

function buildActiveClassroomCourseByNameSectionLookup_() {
  return buildKnownClassroomCourseLookup_();
}

function buildKnownClassroomCourseLookup_() {
  const lookup = {};
  try {
    requireClassroomService_();
    listActiveClassroomCourses_().forEach(course => {
      const key = makeCourseSectionKey_(course.name || '', course.section || '');
      if (key && course.id) lookup[key] = course.id;
    });
  } catch (err) {
    appendCommandCentreLog_('CLASSROOM COURSE LOOKUP', 'REVIEW', `Could not read active Classroom courses: ${err && err.message ? err.message : err}`);
  }
  return lookup;
}

function normalizeCourseCreateState_(value) {
  const clean = normalizeText_(value);
  if (clean === 'active') return 'ACTIVE';
  return 'PROVISIONED';
}

function appendCommandCentreLog_(action, result, detail) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = APP.COMMAND_CENTRE_LOG_SHEET || 'Command Centre Log';
    const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
    const headers = ['Timestamp', 'Action', 'Result', 'Detail'];
    if (sheet.getLastRow() === 0) {
      writeSimpleTable_(sheet, headers, []);
      styleSimpleSheet_(sheet, 1, headers.length);
      sheet.setColumnWidth(1, 170);
      sheet.setColumnWidth(2, 230);
      sheet.setColumnWidth(3, 120);
      sheet.setColumnWidth(4, 700);
    }
    sheet.appendRow([new Date(), action || '', result || '', detail || '']);
    sheet.getRange(sheet.getLastRow(), 1, 1, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
  } catch (err) {
    console.warn(`Command Centre log skipped: ${err.message || err}`);
  }
}

function ensureHeaderRow_(sheet, headers) {
  const current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0];
  const currentClean = current.slice(0, headers.length).map(value => String(value || '').trim()).join('|');
  const expectedClean = headers.join('|');
  if (currentClean !== expectedClean) {
    setValuesNoValidation_(sheet.getRange(1, 1, 1, headers.length), [headers]);
  }
}

function readCourseBuilderRecords_(sheet) {
  const headers = getCourseBuilderHeaders_();
  ensureHeaderRow_(sheet, headers);
  const lastRow = getRealLastRowByColumns_(sheet, [1, 3, 7, 9, 16]);
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  const records = [];
  values.forEach((row, index) => {
    const rowNumber = index + 2;
    const hasContent = row.some(value => String(value || '').trim() !== '');
    if (!hasContent) return;
    records.push({
      sourceType: 'builder',
      sourceLabel: `Builder row ${rowNumber}`,
      rowNumber,
      build: row[0] === true,
      mode: String(row[1] || 'PLAN_ONLY').trim() || 'PLAN_ONLY',
      courseName: String(row[2] || '').trim(),
      section: String(row[3] || '').trim(),
      ownerEmail: String(row[4] || '').trim(),
      coTeacherEmails: String(row[5] || '').trim(),
      topic: String(row[6] || '').trim(),
      itemType: String(row[7] || '').trim(),
      itemTitle: String(row[8] || '').trim(),
      description: String(row[9] || '').trim(),
      dueDate: row[10] || '',
      points: row[11] || '',
      attachmentLink: String(row[12] || '').trim(),
      publish: row[13] === true,
      rosterSource: String(row[14] || '').trim(),
      studentEmails: String(row[15] || '').trim()
    });
  });
  return records;
}

function readCourseShellTemplateRecords_(sheet) {
  if (!sheet) return [];
  const headers = getCourseShellTemplateHeaders_();
  ensureHeaderRow_(sheet, headers);
  const lastRow = getRealLastRowByColumns_(sheet, [1, 2, 3, 8, 10, 16]);
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  const records = [];
  values.forEach((row, index) => {
    const rowNumber = index + 2;
    const hasContent = row.some(value => String(value || '').trim() !== '');
    if (!hasContent) return;

    const itemType = String(row[8] || '').trim();
    const topic = String(row[7] || '').trim();
    const itemTitle = String(row[9] || '').trim();
    records.push({
      sourceType: 'shell',
      sourceLabel: `Shell row ${rowNumber}`,
      rowNumber,
      build: row[0] === true,
      templateName: String(row[1] || '').trim(),
      courseName: String(row[2] || '').trim(),
      section: String(row[3] || '').trim(),
      ownerEmail: String(row[4] || '').trim(),
      coTeacherEmails: String(row[5] || '').trim(),
      shellOrder: row[6] || '',
      topic,
      mode: shellModeFromItemType_(itemType),
      itemType,
      itemTitle: itemType.toUpperCase() === 'TOPIC' && !itemTitle ? topic : itemTitle,
      description: String(row[10] || '').trim(),
      dueDate: row[11] || '',
      points: row[12] || '',
      attachmentLink: String(row[13] || '').trim(),
      publish: row[14] === true,
      rosterSource: 'Course Shell Template',
      studentEmails: '',
      notes: String(row[15] || '').trim()
    });
  });
  return records;
}

function groupCourseCreationReviewRecords_(records) {
  const groups = {};
  (records || []).forEach(record => {
    const key = makeCourseSectionKey_(record.courseName, record.section);
    if (!key) return;
    if (!groups[key]) {
      groups[key] = {
        courseKey: key,
        knownCourseKey: normalizeText_(record.courseName),
        courseName: record.courseName,
        section: record.section || '',
        ownerEmail: record.ownerEmail || '',
        coTeacherEmails: record.coTeacherEmails || '',
        records: [],
        selectedRows: [],
        builderRows: [],
        shellRows: []
      };
    }

    const group = groups[key];
    group.records.push(record);
    if (!group.section && record.section) group.section = record.section;
    if (!group.ownerEmail && record.ownerEmail) group.ownerEmail = record.ownerEmail;
    if (!group.coTeacherEmails && record.coTeacherEmails) group.coTeacherEmails = record.coTeacherEmails;
    if (record.build === true) group.selectedRows.push(record.sourceLabel || record.rowNumber);
    if (record.sourceType === 'builder') group.builderRows.push(record.rowNumber);
    if (record.sourceType === 'shell') group.shellRows.push(record.rowNumber);
  });
  return groups;
}

function evaluateCourseCreationGroup_(group, context) {
  const records = group.records || [];
  const knownCourseKey = group.knownCourseKey || normalizeText_(group.courseName);
  const exists = !!((context.knownCourses || {})[knownCourseKey]);
  const selected = records.filter(record => record.build === true);
  const scopedRecords = selected.length ? selected : records;
  const createRecords = scopedRecords.filter(record => normalizeText_(record.mode) === 'create course' || normalizeText_(record.itemType) === 'course');
  const selectedCreateRecords = selected.filter(record => normalizeText_(record.mode) === 'create course' || normalizeText_(record.itemType) === 'course');
  const validationResults = scopedRecords.map(record => validateCourseBuilderRecord_(record, context));
  const details = [];
  const nextSteps = [];
  let readiness = 'READY FOR REVIEW';

  const countByMode = cleanMode => scopedRecords.filter(record => normalizeText_(record.mode) === cleanMode || normalizeText_(record.itemType) === cleanMode.replace('add ', '')).length;
  const topicCount = scopedRecords.filter(record => normalizeText_(record.mode) === 'add topic' || normalizeText_(record.itemType) === 'topic').length;
  const assignmentCount = countByMode('add assignment');
  const materialCount = countByMode('add material');
  const announcementCount = countByMode('add announcement');
  const studentInviteCount = scopedRecords.filter(record => normalizeText_(record.mode) === 'add students' || normalizeText_(record.itemType) === 'student invites').length;

  if (!group.courseName) {
    readiness = 'BLOCKED';
    details.push('Course name is blank.');
    nextSteps.push('Add a target course name.');
  }

  if (exists && createRecords.length) {
    readiness = 'BLOCKED';
    details.push('A create-course plan targets a course already present in Course Map or Master Tracker.');
    nextSteps.push('Remove the create-course row or change it to a shell/content planning row.');
  }

  if (!exists && !createRecords.length) {
    if (readiness !== 'BLOCKED') readiness = 'REVIEW';
    details.push('Course is not currently listed in Course Map or Master Tracker, and no create-course row is present.');
    nextSteps.push('Add or check a CREATE_COURSE row before a future course-create apply pass.');
  }

  if (!selected.length) {
    if (readiness !== 'BLOCKED') readiness = 'REVIEW';
    details.push('No rows are checked for this course; review includes all plan rows only.');
    nextSteps.push('Check Build?/Use? on the rows the teacher wants included.');
  }

  if (!group.ownerEmail) {
    if (readiness !== 'BLOCKED') readiness = 'REVIEW';
    details.push('Owner Email is blank.');
    nextSteps.push('Confirm the owner account before any future course-create pass.');
  }

  if (selectedCreateRecords.length > 1) {
    readiness = 'BLOCKED';
    details.push('More than one selected create-course row exists for this course.');
    nextSteps.push('Keep one selected create-course row.');
  }

  validationResults.forEach(result => {
    if (result.risk === 'BLOCKED') readiness = 'BLOCKED';
    else if (result.risk === 'REVIEW' && readiness !== 'BLOCKED') readiness = 'REVIEW';
  });

  const blockedMessages = validationResults
    .filter(result => result.risk === 'BLOCKED')
    .map(result => result.message)
    .filter(Boolean);
  if (blockedMessages.length) details.push(`Blocked row detail: ${blockedMessages.join(' ')}`);

  if (!details.length) {
    if (exists) {
      details.push('Course already exists; this review is for future shell/content planning only.');
      nextSteps.push('Use the packet as a teacher review surface before any separate content apply pass.');
    } else {
      details.push('Course-create structure looks ready for teacher review.');
      nextSteps.push('Confirm title, section, owner, and co-teachers before a future course-create apply pass.');
    }
  }

  return {
    exists,
    createPlan: createRecords.length > 0,
    topicCount,
    assignmentCount,
    materialCount,
    announcementCount,
    studentInviteCount,
    readiness,
    detail: details.join(' '),
    nextStep: nextSteps.length ? dedupeStrings_(nextSteps).join(' ') : 'Ready for teacher review. Classroom write lock remains ON.'
  };
}

function addCourseLaunchChecklistRow_(rows, timestamp, item, summary) {
  const readiness = item.readiness || 'REVIEW';
  if (readiness === 'BLOCKED') summary.blocked++;
  else if (readiness === 'READY FOR REVIEW') summary.ready++;
  else summary.review++;

  rows.push([
    timestamp,
    item.step || rows.length + 1,
    item.course || '',
    item.section || '',
    item.source || '',
    item.actionType || '',
    item.title || '',
    item.copyText || '',
    readiness,
    item.detail || '',
    item.nextStep || '',
    false
  ]);
}

function buildCourseLaunchCourseCopy_(group) {
  const lines = [];
  if (group.courseName) lines.push(`Course: ${group.courseName}`);
  if (group.section) lines.push(`Section: ${group.section}`);
  if (group.ownerEmail) lines.push(`Owner: ${group.ownerEmail}`);
  if (group.coTeacherEmails) lines.push(`Co-teachers: ${group.coTeacherEmails}`);
  return lines.join('\n');
}

function getFirstCourseCreateDescription_(records) {
  const match = (records || []).find(record => {
    const mode = normalizeText_(record.mode);
    const itemType = normalizeText_(record.itemType);
    return (mode === 'create course' || itemType === 'course') && record.description;
  });
  return match ? match.description : '';
}

function compareCourseBuilderRecordsForLaunch_(a, b) {
  const aOrder = a.shellOrder !== '' && !isNaN(Number(a.shellOrder)) ? Number(a.shellOrder) : 999999;
  const bOrder = b.shellOrder !== '' && !isNaN(Number(b.shellOrder)) ? Number(b.shellOrder) : 999999;
  if (aOrder !== bOrder) return aOrder - bOrder;
  const aRank = launchModeRank_(a);
  const bRank = launchModeRank_(b);
  if (aRank !== bRank) return aRank - bRank;
  return Number(a.rowNumber || 0) - Number(b.rowNumber || 0);
}

function launchModeRank_(record) {
  const mode = normalizeText_(record.mode);
  const itemType = normalizeText_(record.itemType);
  if (mode === 'create course' || itemType === 'course') return 1;
  if (mode === 'add topic' || itemType === 'topic') return 2;
  if (mode === 'add material' || itemType === 'material') return 3;
  if (mode === 'add assignment' || itemType === 'assignment') return 4;
  if (mode === 'add announcement' || itemType === 'announcement') return 5;
  if (mode === 'add students' || itemType === 'student invites') return 6;
  return 7;
}

function buildLaunchChecklistItemForRecord_(record, validation) {
  const mode = normalizeText_(record.mode);
  const itemType = normalizeText_(record.itemType);
  const title = record.itemTitle || record.topic || record.courseName || '';
  const detailParts = [];
  if (record.topic) detailParts.push(`Topic: ${record.topic}`);
  if (record.description) detailParts.push(`Instructions: ${record.description}`);
  if (record.dueDate) detailParts.push(`Due: ${formatBuilderDateForDisplay_(record.dueDate)}`);
  if (record.points !== '') detailParts.push(`Points: ${record.points}`);
  if (record.attachmentLink) detailParts.push(`Link: ${record.attachmentLink}`);
  if (record.studentEmails) detailParts.push(`Students: ${record.studentEmails}`);

  if (mode === 'create course' || itemType === 'course') {
    return {
      actionType: 'Create course shell',
      title: record.courseName,
      copyText: buildCourseLaunchCourseCopy_({
        courseName: record.courseName,
        section: record.section,
        ownerEmail: record.ownerEmail,
        coTeacherEmails: record.coTeacherEmails
      }),
      nextStep: 'Create or confirm this shell manually only if the teacher approves. Classroom write lock remains ON.'
    };
  }

  if (mode === 'add topic' || itemType === 'topic') {
    return {
      actionType: 'Create topic',
      title: record.topic || title,
      copyText: record.topic || title,
      nextStep: 'Create this topic manually after the course shell is confirmed. Classroom write lock remains ON.'
    };
  }

  if (mode === 'add assignment' || itemType === 'assignment') {
    return {
      actionType: 'Draft assignment',
      title,
      copyText: detailParts.join('\n'),
      nextStep: 'Use this as a manual drafting checklist. Classroom write lock remains ON.'
    };
  }

  if (mode === 'add material' || itemType === 'material') {
    return {
      actionType: 'Draft material',
      title,
      copyText: detailParts.join('\n'),
      nextStep: 'Use this as a manual material checklist. Classroom write lock remains ON.'
    };
  }

  if (mode === 'add announcement' || itemType === 'announcement') {
    return {
      actionType: 'Draft announcement',
      title,
      copyText: detailParts.join('\n'),
      nextStep: 'Use this as a manual announcement checklist. Classroom write lock remains ON.'
    };
  }

  if (mode === 'add students' || itemType === 'student invites') {
    return {
      actionType: 'Review student invites',
      title: 'Student invite list',
      copyText: record.studentEmails || '',
      nextStep: 'Confirm roster source before any manual invite work. Classroom write lock remains ON.'
    };
  }

  return {
    actionType: record.build ? 'Review planning row' : 'Unselected planning row',
    title,
    copyText: detailParts.join('\n'),
    nextStep: getManualNextStepForRecord_(record, validation)
  };
}

function formatBuilderDateForDisplay_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(value);
}

function shellModeFromItemType_(itemType) {
  const clean = normalizeText_(itemType);
  if (clean === 'course') return 'CREATE_COURSE';
  if (clean === 'topic') return 'ADD_TOPIC';
  if (clean === 'assignment') return 'ADD_ASSIGNMENT';
  if (clean === 'material') return 'ADD_MATERIAL';
  if (clean === 'announcement') return 'ADD_ANNOUNCEMENT';
  return 'PLAN_ONLY';
}

function writeCoursePlanStatusRows_(sheet, updates, statusCol) {
  if (!sheet || !updates || !updates.length) return;
  updates.forEach(item => {
    const record = item.record || {};
    const result = item.result || {};
    if (!record.rowNumber || record.rowNumber < 2) return;
    setValuesNoValidation_(
      sheet.getRange(record.rowNumber, statusCol, 1, 2),
      [[result.risk || '', result.message || '']]
    );
  });
}

function buildCourseBuilderValidationContext_(records, knownCourses) {
  const createCourseRowsByKey = {};
  const builtRowsByKey = {};
  const shellOrderRowsByKey = {};
  records.forEach(record => {
    const key = makeCourseSectionKey_(record.courseName, record.section);
    if (!key) return;
    if (!builtRowsByKey[key]) builtRowsByKey[key] = [];
    if (record.build === true) builtRowsByKey[key].push(record.rowNumber);

    if (record.build === true && normalizeText_(record.mode) === 'create course') {
      if (!createCourseRowsByKey[key]) createCourseRowsByKey[key] = [];
      createCourseRowsByKey[key].push(record.rowNumber);
    }

    if (record.build === true && record.sourceType === 'shell' && record.shellOrder !== '') {
      const orderKey = `${key}|${String(record.shellOrder).trim()}`;
      if (!shellOrderRowsByKey[orderKey]) shellOrderRowsByKey[orderKey] = [];
      shellOrderRowsByKey[orderKey].push(record.rowNumber);
    }
  });
  return { knownCourses, createCourseRowsByKey, builtRowsByKey, shellOrderRowsByKey };
}

function validateCourseBuilderRecord_(record, context) {
  const errors = [];
  const warnings = [];
  const mode = normalizeText_(record.mode);
  const itemType = normalizeText_(record.itemType);
  const courseKey = normalizeText_(record.courseName);
  const courseSectionKey = makeCourseSectionKey_(record.courseName, record.section);
  const knownCourses = context.knownCourses || {};
  const known = !!knownCourses[courseKey];
  const action = buildCourseBuilderAction_(record);
  const allowedModes = ['plan only', 'create course', 'add topic', 'add assignment', 'add material', 'add announcement', 'add students'];
  const allowedItemTypes = ['course', 'topic', 'assignment', 'material', 'announcement', 'student invites'];
  const duplicateCreateRows = (context.createCourseRowsByKey || {})[courseSectionKey] || [];
  const shellOrderKey = `${courseSectionKey}|${String(record.shellOrder || '').trim()}`;
  const duplicateShellOrderRows = record.shellOrder !== '' ? ((context.shellOrderRowsByKey || {})[shellOrderKey] || []) : [];

  if (!record.build) warnings.push('Row is not checked for build.');
  if (!record.courseName) errors.push('Target Course Name is required.');
  if (mode && allowedModes.indexOf(mode) === -1) errors.push(`Mode is not recognized: ${record.mode}.`);
  if (itemType && allowedItemTypes.indexOf(itemType) === -1) warnings.push(`Item Type is unusual: ${record.itemType}.`);
  if (!record.ownerEmail) warnings.push('Owner Email is blank; current script user would be assumed in a future apply pass.');
  if (record.ownerEmail && !looksLikeSingleEmail_(record.ownerEmail)) warnings.push('Owner Email should contain one valid email address.');
  if (record.coTeacherEmails && !extractEmails_(record.coTeacherEmails).length) warnings.push('Co-Teacher Emails does not contain a valid email address.');
  if (record.sourceType === 'shell') {
    if (!record.templateName) warnings.push('Template Name is blank.');
    if (!record.itemType) errors.push('Item Type is required for Course Shell Template rows.');
    if (record.shellOrder !== '' && isNaN(Number(record.shellOrder))) errors.push('Order must be blank or numeric.');
    if (duplicateShellOrderRows.length > 1) warnings.push(`Duplicate shell order for this course on rows ${duplicateShellOrderRows.join(', ')}.`);
  }

  if (mode !== 'plan only' && !record.build) warnings.push('Mode is not PLAN_ONLY, but Build? is unchecked.');
  if (mode === 'create course' && known) errors.push('CREATE_COURSE targets a course already listed in Course Map or Master Tracker.');
  if (mode === 'create course' && duplicateCreateRows.length > 1) errors.push(`Duplicate CREATE_COURSE plan for this course on rows ${duplicateCreateRows.join(', ')}.`);
  if (mode !== 'create course' && courseKey && !known) warnings.push('Target course is not currently listed in Course Map or Master Tracker.');
  if ((mode === 'add topic' || itemType === 'topic') && !record.topic) errors.push('Topic is required for ADD_TOPIC.');
  if ((mode === 'add assignment' || mode === 'add material' || mode === 'add announcement') && !record.topic) {
    warnings.push('Topic is blank; future Classroom item would land outside a topic unless one is created.');
  }
  if ((mode === 'add assignment' || mode === 'add material' || mode === 'add announcement') && !record.itemTitle) {
    errors.push('Item Title is required for coursework/material/announcement rows.');
  }
  if (mode === 'add students' && !extractEmails_(record.studentEmails).length) {
    errors.push('Student Emails must include at least one valid email for ADD_STUDENTS.');
  }
  if ((mode === 'add assignment' || itemType === 'assignment') && record.points !== '' && isNaN(Number(record.points))) {
    errors.push('Points must be blank or numeric.');
  }
  if ((mode === 'add assignment' || itemType === 'assignment') && record.dueDate && !isValidBuilderDueDate_(record.dueDate)) {
    errors.push('Due Date must be a valid date.');
  }
  if ((mode === 'add material' || mode === 'add announcement') && record.points !== '') {
    warnings.push('Points are only used for assignments.');
  }
  if (mode === 'add material' && !record.attachmentLink) {
    warnings.push('Material rows usually need an Attachment Link.');
  }
  if (record.attachmentLink && !/^https?:\/\//i.test(record.attachmentLink)) {
    warnings.push('Attachment Link should start with http:// or https://.');
  }

  const locked = mode === 'create course'
    ? 'This can only be applied later from Course Creation Apply after explicit approval and CREATE COURSE confirmation.'
    : 'Classroom content write lock is ON. This row is preview-only and will not be applied.';
  if (!record.build) {
    return {
      action,
      risk: 'NOT SELECTED',
      errors,
      warnings,
      message: warnings.concat([locked]).join(' ')
    };
  }
  if (errors.length) return { action, risk: 'BLOCKED', errors, warnings, message: errors.concat(warnings, [locked]).join(' ') };
  if (warnings.length) return { action, risk: 'REVIEW', errors, warnings, message: warnings.concat([locked]).join(' ') };
  return { action, risk: 'READY FOR REVIEW', errors, warnings, message: `Plan looks structurally ready for ${action}. ${locked}` };
}

function buildCourseBuilderAction_(record) {
  const mode = normalizeText_(record.mode);
  if (!record.build) return 'NOT SELECTED';
  if (mode === 'create course') return 'WOULD CREATE COURSE';
  if (mode === 'add topic') return 'WOULD ADD TOPIC';
  if (mode === 'add assignment') return 'WOULD ADD ASSIGNMENT';
  if (mode === 'add material') return 'WOULD ADD MATERIAL';
  if (mode === 'add announcement') return 'WOULD ADD ANNOUNCEMENT';
  if (mode === 'add students') return 'WOULD INVITE STUDENTS';
  return 'PLAN ONLY';
}

function makeCourseSectionKey_(courseName, section) {
  const courseKey = normalizeText_(courseName);
  if (!courseKey) return '';
  return `${courseKey}|${normalizeText_(section)}`;
}

function normalizeCoursePlanName_(value) {
  return normalizeText_(value);
}

function getManualNextStepForRecord_(record, result) {
  if (!record.build) return 'Check Build?/Use? when this row should be included in a future apply pass.';
  if (result && result.risk === 'BLOCKED') return 'Fix the blocked fields, then run Preview Build Plan again.';
  if (result && result.risk === 'REVIEW') return 'Review warnings before any future apply pass.';

  const mode = normalizeText_(record.mode);
  if (mode === 'create course') return 'Ready for a future course-creation apply pass after explicit approval.';
  if (mode === 'add topic') return 'Ready for a future topic apply pass after explicit approval.';
  if (mode === 'add assignment') return 'Ready for a future assignment apply pass after explicit approval.';
  if (mode === 'add material') return 'Ready for a future material apply pass after explicit approval.';
  if (mode === 'add announcement') return 'Ready for a future announcement apply pass after explicit approval.';
  if (mode === 'add students') return 'Ready for a future invite-only apply pass after explicit approval.';
  return 'Plan-only row. Use it as teacher notes or switch Mode before a future apply pass.';
}

function looksLikeSingleEmail_(value) {
  const emails = extractEmails_(String(value || ''));
  return emails.length === 1 && String(value || '').trim().toLowerCase() === emails[0];
}

function dedupeStrings_(values) {
  const seen = {};
  const output = [];
  (values || []).forEach(value => {
    const text = String(value || '').trim();
    const key = normalizeText_(text);
    if (!text || seen[key]) return;
    seen[key] = true;
    output.push(text);
  });
  return output;
}

function isValidBuilderDueDate_(value) {
  if (!value) return true;
  if (Object.prototype.toString.call(value) === '[object Date]') return !isNaN(value.getTime());
  const parsed = new Date(value);
  return !isNaN(parsed.getTime());
}

function getCourseBuildPreviewStats_(preview) {
  const stats = { ready: 0, review: 0, blocked: 0, notSelected: 0 };
  if (!preview || preview.getLastRow() < 2) return stats;
  const headers = preview.getRange(1, 1, 1, preview.getLastColumn()).getValues()[0].map(h => normalizeText_(h));
  const riskIndex = getHeaderIndex_(headers, ['risk'], -1);
  if (riskIndex < 0) return stats;

  const values = preview.getRange(2, riskIndex + 1, preview.getLastRow() - 1, 1).getValues();
  values.forEach(row => {
    const risk = normalizeText_(row[0]);
    if (risk === 'ready for review') stats.ready++;
    else if (risk === 'blocked') stats.blocked++;
    else if (risk === 'review') stats.review++;
    else if (risk === 'not selected') stats.notSelected++;
  });
  return stats;
}

function getCourseCreationReviewStats_(review) {
  const stats = { ready: 0, review: 0, blocked: 0 };
  if (!review || review.getLastRow() < 2) return stats;
  const headers = review.getRange(1, 1, 1, review.getLastColumn()).getValues()[0].map(h => normalizeText_(h));
  const readinessIndex = getHeaderIndex_(headers, ['readiness'], -1);
  if (readinessIndex < 0) return stats;

  const values = review.getRange(2, readinessIndex + 1, review.getLastRow() - 1, 1).getValues();
  values.forEach(row => {
    const readiness = normalizeText_(row[0]);
    if (readiness === 'ready for review') stats.ready++;
    else if (readiness === 'blocked') stats.blocked++;
    else if (readiness === 'review') stats.review++;
  });
  return stats;
}

function getCourseLaunchChecklistStats_(checklist) {
  const stats = { ready: 0, review: 0, blocked: 0 };
  if (!checklist || checklist.getLastRow() < 2) return stats;
  const headers = checklist.getRange(1, 1, 1, checklist.getLastColumn()).getValues()[0].map(h => normalizeText_(h));
  const readinessIndex = getHeaderIndex_(headers, ['readiness'], -1);
  if (readinessIndex < 0) return stats;

  const values = checklist.getRange(2, readinessIndex + 1, checklist.getLastRow() - 1, 1).getValues();
  values.forEach(row => {
    const readiness = normalizeText_(row[0]);
    if (readiness === 'ready for review') stats.ready++;
    else if (readiness === 'blocked') stats.blocked++;
    else if (readiness === 'review') stats.review++;
  });
  return stats;
}

function getCourseBuilderBuildStats_(builder) {
  const stats = { selected: 0 };
  if (!builder || builder.getLastRow() < 2) return stats;
  try {
    const lastRow = getRealLastRowByColumns_(builder, [1, 3, 7, 9, 16]);
    if (lastRow < 2) return stats;
    const values = builder.getRange(2, 1, lastRow - 1, 1).getValues();
    values.forEach(row => {
      if (row[0] === true) stats.selected++;
    });
  } catch (err) {}
  return stats;
}

function getCourseShellTemplateStats_(shell) {
  const stats = { selected: 0 };
  if (!shell || shell.getLastRow() < 2) return stats;
  try {
    const lastRow = getRealLastRowByColumns_(shell, [1, 2, 3, 8, 10, 16]);
    if (lastRow < 2) return stats;
    const values = shell.getRange(2, 1, lastRow - 1, 1).getValues();
    values.forEach(row => {
      if (row[0] === true) stats.selected++;
    });
  } catch (err) {}
  return stats;
}

function getCommandCentreLastLog_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(APP.COMMAND_CENTRE_LOG_SHEET || 'Command Centre Log');
    if (!sheet || sheet.getLastRow() < 2) return {};
    const row = sheet.getRange(sheet.getLastRow(), 1, 1, 4).getDisplayValues()[0];
    return {
      at: row[0] || '',
      action: row[1] || '',
      result: row[2] || '',
      detail: row[3] || ''
    };
  } catch (err) {
    return {};
  }
}

function getCourseBuilderKnownCourses_() {
  const known = {};
  const add = value => {
    const key = normalizeText_(value);
    if (key) known[key] = true;
  };

  try {
    readAllCourseMaps_().forEach(map => {
      add(map.displayCourseName);
      add(map.classroomCourseName);
    });
  } catch (err) {}

  try {
    readMasterRowsAsObjects_(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.MASTER_SHEET))
      .forEach(row => add(row['Course']));
  } catch (err) {}

  return known;
}

function getSafeWebAppUrl_() {
  try {
    return ScriptApp.getService().getUrl() || '';
  } catch (err) {
    return '';
  }
}

function escapeHtml_(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function jsonForHtml_(value) {
  return JSON.stringify(value || {})
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/************************************************************
 LOCKED-GATE APPLY FLOWS: TOPICS THROUGH PRE-WEB-APP PHASES
 ************************************************************/
function buildTopicApplyReview() {
  withLock_('Build Topic Apply Review', () => {
    const summary = buildTopicApplyReviewInternal_();
    SpreadsheetApp.getUi().alert(`Topic Apply Review built.\n\nRows: ${summary.rows}\nReady: ${summary.ready}\nReview: ${summary.review}\nBlocked: ${summary.blocked}\n\nNo topics were created yet.`);
  });
}

function applyApprovedTopics() {
  withLock_('Apply Approved Topics', () => {
    const preview = getApprovedApplyPreview_(APP.TOPIC_APPLY_REVIEW_SHEET, getTopicApplyReviewHeaders_(), {
      approvalHeader: 'Approve?',
      confirmHeader: 'Confirm Text',
      confirmText: 'CREATE TOPIC',
      readinessHeader: 'Readiness',
      createdIdHeader: 'Created Topic ID',
      existingIdHeader: 'Existing Topic ID',
      max: TOPIC_CREATE_MAX_PER_RUN,
      nameHeader: 'Topic Name'
    });
    if (!confirmApplyRows_('Create approved Classroom topics?', preview, 'topics', 'No assignments, materials, announcements, rosters, invites, grades, Drive files, Forms, or web deployments will be created.')) return;
    const summary = applyApprovedTopicsInternal_();
    SpreadsheetApp.getUi().alert(`Topic apply complete.\n\nCreated: ${summary.created}\nSkipped existing: ${summary.skippedExisting}\nBlocked: ${summary.blocked}\nNot approved: ${summary.notApproved}\nErrors: ${summary.errors}\nMax per run: ${TOPIC_CREATE_MAX_PER_RUN}`);
  });
}

function buildAssignmentApplyReview() {
  withLock_('Build Assignment Apply Review', () => {
    const summary = buildCourseworkApplyReviewInternal_('ASSIGNMENT');
    SpreadsheetApp.getUi().alert(`Assignment Apply Review built.\n\nRows: ${summary.rows}\nReady: ${summary.ready}\nReview: ${summary.review}\nBlocked: ${summary.blocked}\n\nNo assignments were created yet.`);
  });
}

function applyApprovedAssignments() {
  withLock_('Apply Approved Assignments', () => {
    const preview = getApprovedApplyPreview_(APP.ASSIGNMENT_APPLY_REVIEW_SHEET, getAssignmentApplyReviewHeaders_(), {
      approvalHeader: 'Approve?',
      confirmHeader: 'Confirm Text',
      confirmText: 'POST ASSIGNMENT',
      readinessHeader: 'Readiness',
      createdIdHeader: 'Created Assignment ID',
      existingIdHeader: 'Existing Assignment ID',
      max: ASSIGNMENT_CREATE_MAX_PER_RUN,
      nameHeader: 'Assignment Title'
    });
    if (!confirmApplyRows_('Create approved Classroom assignments?', preview, 'assignments', 'This may create student-facing coursework. No materials, announcements, rosters, invites, grades, Drive files, Forms, or web deployments will be created.')) return;
    const summary = applyApprovedAssignmentsInternal_();
    SpreadsheetApp.getUi().alert(`Assignment apply complete.\n\nCreated: ${summary.created}\nSkipped existing: ${summary.skippedExisting}\nBlocked: ${summary.blocked}\nNot approved: ${summary.notApproved}\nErrors: ${summary.errors}\nMax per run: ${ASSIGNMENT_CREATE_MAX_PER_RUN}`);
  });
}

function buildMaterialApplyReview() {
  withLock_('Build Material Apply Review', () => {
    const summary = buildCourseworkApplyReviewInternal_('MATERIAL');
    SpreadsheetApp.getUi().alert(`Material Apply Review built.\n\nRows: ${summary.rows}\nReady: ${summary.ready}\nReview: ${summary.review}\nBlocked: ${summary.blocked}\n\nNo materials were created yet.`);
  });
}

function applyApprovedMaterials() {
  withLock_('Apply Approved Materials', () => {
    const preview = getApprovedApplyPreview_(APP.MATERIAL_APPLY_REVIEW_SHEET, getMaterialApplyReviewHeaders_(), {
      approvalHeader: 'Approve?',
      confirmHeader: 'Confirm Text',
      confirmText: 'POST MATERIAL',
      readinessHeader: 'Readiness',
      createdIdHeader: 'Created Material ID',
      existingIdHeader: 'Existing Material ID',
      max: MATERIAL_CREATE_MAX_PER_RUN,
      nameHeader: 'Material Title'
    });
    if (!confirmApplyRows_('Create approved Classroom materials?', preview, 'materials', 'No assignments, announcements, rosters, invites, grades, Drive files, Forms, or web deployments will be created.')) return;
    const summary = applyApprovedMaterialsInternal_();
    SpreadsheetApp.getUi().alert(`Material apply complete.\n\nCreated: ${summary.created}\nSkipped existing: ${summary.skippedExisting}\nBlocked: ${summary.blocked}\nNot approved: ${summary.notApproved}\nErrors: ${summary.errors}\nMax per run: ${MATERIAL_CREATE_MAX_PER_RUN}`);
  });
}

function buildAnnouncementApplyReview() {
  withLock_('Build Announcement Apply Review', () => {
    const summary = buildCourseworkApplyReviewInternal_('ANNOUNCEMENT');
    SpreadsheetApp.getUi().alert(`Announcement Apply Review built.\n\nRows: ${summary.rows}\nReady: ${summary.ready}\nReview: ${summary.review}\nBlocked: ${summary.blocked}\n\nNo announcements were created yet.`);
  });
}

function applyApprovedAnnouncements() {
  withLock_('Apply Approved Announcements', () => {
    const preview = getApprovedApplyPreview_(APP.ANNOUNCEMENT_APPLY_REVIEW_SHEET, getAnnouncementApplyReviewHeaders_(), {
      approvalHeader: 'Approve?',
      confirmHeader: 'Confirm Text',
      confirmText: 'POST ANNOUNCEMENT',
      readinessHeader: 'Readiness',
      createdIdHeader: 'Created Announcement ID',
      existingIdHeader: 'Existing Announcement ID',
      max: ANNOUNCEMENT_CREATE_MAX_PER_RUN,
      nameHeader: 'Announcement Title / Label'
    });
    if (!confirmApplyRows_('Create approved Classroom announcements?', preview, 'announcements', 'Announcements can notify students. No assignments, materials, rosters, invites, grades, Drive files, Forms, or web deployments will be created.')) return;
    const summary = applyApprovedAnnouncementsInternal_();
    SpreadsheetApp.getUi().alert(`Announcement apply complete.\n\nCreated: ${summary.created}\nSkipped existing: ${summary.skippedExisting}\nBlocked: ${summary.blocked}\nNot approved: ${summary.notApproved}\nErrors: ${summary.errors}\nMax per run: ${ANNOUNCEMENT_CREATE_MAX_PER_RUN}`);
  });
}

function buildStudentInviteReview() {
  withLock_('Build Student Invite Review', () => {
    const summary = buildStudentInviteReviewInternal_();
    SpreadsheetApp.getUi().alert(`Student Invite Review built.\n\nRows: ${summary.rows}\nReady: ${summary.ready}\nReview: ${summary.review}\nBlocked: ${summary.blocked}\n\nNo students were added or invited yet.`);
  });
}

function applyApprovedStudentInvites() {
  withLock_('Apply Approved Student Invites', () => {
    const preview = getApprovedApplyPreview_(APP.STUDENT_INVITE_REVIEW_SHEET, getStudentInviteReviewHeaders_(), {
      approvalHeader: 'Approve Invite?',
      confirmHeader: 'Confirm Text',
      confirmText: 'INVITE STUDENT',
      readinessHeader: 'Readiness',
      createdIdHeader: 'Invitation ID / Result ID',
      max: STUDENT_INVITE_MAX_PER_RUN,
      nameHeader: 'Student Email'
    });
    if (!confirmApplyRows_('Apply approved student invites/adds?', preview, 'student rows', 'This changes Classroom roster membership for approved rows only. No teachers, assignments, materials, announcements, grades, Drive files, Forms, or web deployments will be changed.')) return;
    const summary = applyApprovedStudentInvitesInternal_();
    SpreadsheetApp.getUi().alert(`Student invite apply complete.\n\nAdded/invited: ${summary.created}\nSkipped existing: ${summary.skippedExisting}\nBlocked: ${summary.blocked}\nNot approved: ${summary.notApproved}\nErrors: ${summary.errors}\nMax per run: ${STUDENT_INVITE_MAX_PER_RUN}`);
  });
}

function buildTeacherInviteReview() {
  withLock_('Build Teacher Invite Review', () => {
    const summary = buildTeacherInviteReviewInternal_();
    SpreadsheetApp.getUi().alert(`Teacher Invite Review built.\n\nRows: ${summary.rows}\nReady: ${summary.ready}\nReview: ${summary.review}\nBlocked: ${summary.blocked}\n\nNo teachers were added or invited yet.`);
  });
}

function applyApprovedTeacherInvites() {
  withLock_('Apply Approved Teacher Invites', () => {
    const preview = getApprovedApplyPreview_(APP.TEACHER_INVITE_REVIEW_SHEET, getTeacherInviteReviewHeaders_(), {
      approvalHeader: 'Approve Invite?',
      confirmHeader: 'Confirm Text',
      confirmText: 'INVITE TEACHER',
      readinessHeader: 'Readiness',
      createdIdHeader: 'Invitation ID / Result ID',
      max: TEACHER_INVITE_MAX_PER_RUN,
      nameHeader: 'Teacher Email'
    });
    if (!confirmApplyRows_('Apply approved teacher invites/adds?', preview, 'teacher rows', 'This changes co-teacher access for approved rows only. No students, coursework, grades, Drive files, Forms, or web deployments will be changed.')) return;
    const summary = applyApprovedTeacherInvitesInternal_();
    SpreadsheetApp.getUi().alert(`Teacher invite apply complete.\n\nAdded/invited: ${summary.created}\nSkipped existing: ${summary.skippedExisting}\nBlocked: ${summary.blocked}\nNot approved: ${summary.notApproved}\nErrors: ${summary.errors}\nMax per run: ${TEACHER_INVITE_MAX_PER_RUN}`);
  });
}

function buildArtifactApplyReview() {
  withLock_('Build Artifact Apply Review', () => {
    const summary = buildArtifactApplyReviewInternal_();
    SpreadsheetApp.getUi().alert(`Artifact Apply Review built.\n\nRows: ${summary.rows}\nReady: ${summary.ready}\nReview: ${summary.review}\nBlocked: ${summary.blocked}\n\nNo Drive, Doc, or Form artifacts were created yet.`);
  });
}

function applyApprovedArtifacts() {
  withLock_('Apply Approved Artifacts', () => {
    const preview = getApprovedApplyPreview_(APP.ARTIFACT_APPLY_REVIEW_SHEET, getArtifactApplyReviewHeaders_(), {
      approvalHeader: 'Approve?',
      confirmHeader: 'Confirm Text',
      confirmText: 'CREATE ARTIFACT',
      readinessHeader: 'Readiness',
      createdIdHeader: 'Created Artifact URL',
      existingIdHeader: 'Existing Artifact URL',
      max: ARTIFACT_CREATE_MAX_PER_RUN,
      nameHeader: 'Artifact Type'
    });
    if (!confirmApplyRows_('Create approved Drive/Docs/Forms artifacts?', preview, 'artifact rows', 'This creates only approved artifact rows. No Classroom content, rosters, grades, emails, Calendar items, or web deployments will be changed.')) return;
    const summary = applyApprovedArtifactsInternal_();
    SpreadsheetApp.getUi().alert(`Artifact apply complete.\n\nCreated: ${summary.created}\nSkipped existing: ${summary.skippedExisting}\nBlocked: ${summary.blocked}\nNot approved: ${summary.notApproved}\nErrors: ${summary.errors}\nMax per run: ${ARTIFACT_CREATE_MAX_PER_RUN}`);
  });
}

function buildAdminReports() {
  withLock_('Build Admin Reports', () => {
    const summary = buildAdminReportsInternal_();
    SpreadsheetApp.getUi().alert(`Admin reports built.\n\nSheets updated: ${summary.sheets}\nRows written: ${summary.rows}\n\nReports are read-only. No Classroom content, roster, email, Drive, Form, Calendar, or web deployment was changed.`);
  });
}

function getTopicApplyReviewHeaders_() {
  return ['Approve?', 'Confirm Text', 'Classroom Course ID', 'Course Name', 'Section', 'Topic Name', 'Existing Topic ID', 'Existing Topic Status', 'Readiness', 'Block Reason', 'Created Topic ID', 'Created At', 'Created By', 'Apply Result', 'Source Sheet', 'Source Row'];
}

function getAssignmentApplyReviewHeaders_() {
  return ['Approve?', 'Confirm Text', 'Classroom Course ID', 'Course Name', 'Section', 'Topic Name', 'Topic ID', 'Assignment Title', 'Description', 'Due Date', 'Due Time', 'Points', 'Attachment Link', 'Publish State', 'Assignee Mode', 'Existing Assignment ID', 'Created Assignment ID', 'Created At', 'Created By', 'Apply Result', 'Source Sheet', 'Source Row', 'Readiness', 'Block Reason'];
}

function getMaterialApplyReviewHeaders_() {
  return ['Approve?', 'Confirm Text', 'Classroom Course ID', 'Course Name', 'Section', 'Topic Name', 'Topic ID', 'Material Title', 'Description', 'Attachment Link', 'Publish State', 'Existing Material ID', 'Created Material ID', 'Created At', 'Created By', 'Apply Result', 'Source Sheet', 'Source Row', 'Readiness', 'Block Reason'];
}

function getAnnouncementApplyReviewHeaders_() {
  return ['Approve?', 'Confirm Text', 'Classroom Course ID', 'Course Name', 'Section', 'Topic Name', 'Topic ID', 'Announcement Title / Label', 'Text', 'Attachment Link', 'Publish State', 'Existing Announcement ID', 'Created Announcement ID', 'Created At', 'Created By', 'Apply Result', 'Source Sheet', 'Source Row', 'Readiness', 'Block Reason'];
}

function getStudentInviteReviewHeaders_() {
  return ['Approve Invite?', 'Confirm Text', 'Classroom Course ID', 'Course Name', 'Student Name', 'Student Email', 'In PowerSchool?', 'Already In Classroom?', 'Readiness', 'Block Reason', 'Invitation ID / Result ID', 'Invited At', 'Invited By', 'Apply Result'];
}

function getTeacherInviteReviewHeaders_() {
  return ['Approve Invite?', 'Confirm Text', 'Classroom Course ID', 'Course Name', 'Teacher Email', 'Already Teacher?', 'Readiness', 'Block Reason', 'Invitation ID / Result ID', 'Invited At', 'Invited By', 'Apply Result'];
}

function getArtifactApplyReviewHeaders_() {
  return ['Approve?', 'Confirm Text', 'Artifact Type', 'Student Name', 'Student Email', 'Course', 'Template ID', 'Destination Folder ID', 'Existing Artifact URL', 'Created Artifact URL', 'Created At', 'Created By', 'Readiness', 'Block Reason', 'Apply Result'];
}

function buildTopicApplyReviewInternal_() {
  requireClassroomService_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shell = ss.getSheetByName(APP.COURSE_SHELL_TEMPLATE_SHEET) || ss.insertSheet(APP.COURSE_SHELL_TEMPLATE_SHEET);
  const records = readCourseShellTemplateRecords_(shell).filter(record => normalizeText_(record.itemType) === 'topic');
  const courseIds = buildCourseIdLookupForApply_();
  const topicCache = {};
  const rows = [];
  const summary = { rows: 0, ready: 0, review: 0, blocked: 0 };

  records.forEach(record => {
    const courseId = resolveCourseIdForRecord_(record, courseIds);
    const topicName = record.topic || record.itemTitle || '';
    let existing = { id: '', status: '' };
    let readiness = 'READY';
    const blocks = [];
    if (!record.build) {
      readiness = 'REVIEW';
      blocks.push('Use? is not checked on the source row.');
    }
    if (!courseId) {
      readiness = 'BLOCKED';
      blocks.push('Classroom Course ID is missing. Build/refresh Course Creation Apply or Course Map first.');
    }
    if (!topicName) {
      readiness = 'BLOCKED';
      blocks.push('Topic Name is missing.');
    }
    if (courseId) {
      if (!topicCache[courseId]) topicCache[courseId] = getClassroomTopicsByName_(courseId);
      existing = topicCache[courseId][normalizeText_(topicName)] || existing;
      if (existing.id) {
        readiness = 'BLOCKED';
        blocks.push('Duplicate topic already exists in Classroom.');
      }
    }
    incrementReadinessSummary_(summary, readiness);
    rows.push([false, '', courseId, record.courseName, record.section, topicName, existing.id, existing.status || (existing.id ? 'EXISTS' : ''), readiness, blocks.join(' '), '', '', '', '', record.sourceType === 'shell' ? APP.COURSE_SHELL_TEMPLATE_SHEET : APP.COURSE_BUILDER_SHEET, record.rowNumber]);
  });

  summary.rows = rows.length;
  const sheet = ss.getSheetByName(APP.TOPIC_APPLY_REVIEW_SHEET) || ss.insertSheet(APP.TOPIC_APPLY_REVIEW_SHEET);
  writeSimpleTable_(sheet, getTopicApplyReviewHeaders_(), rows);
  styleLockedApplySheet_(sheet, getTopicApplyReviewHeaders_(), { approvalCol: 1, dateCols: [12], readinessCol: 9, resultCol: 14 });
  appendCommandCentreLog_('BUILD TOPIC APPLY REVIEW', summary.blocked ? 'REVIEW' : 'DONE', `Rows: ${summary.rows}; ready: ${summary.ready}; review: ${summary.review}; blocked: ${summary.blocked}.`);
  return summary;
}

function applyApprovedTopicsInternal_() {
  requireClassroomService_();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.TOPIC_APPLY_REVIEW_SHEET);
  const rows = readApplySheetRows_(sheet, getTopicApplyReviewHeaders_());
  const summary = makeApplySummary_(rows);
  const approved = rows.filter(row => row['Approve?'] === true);
  const topicCache = {};
  approved.slice(0).forEach(row => {
    if (!isApprovedApplyRow_(row, 'CREATE TOPIC', 'Created Topic ID', 'Existing Topic ID')) {
      if (row['Approve?'] === true) summary.blocked++;
      return;
    }
    if (summary.created >= TOPIC_CREATE_MAX_PER_RUN) return;
    try {
      const courseId = String(row['Classroom Course ID'] || '').trim();
      const topicName = String(row['Topic Name'] || '').trim();
      if (!courseId || !topicName) {
        summary.blocked++;
        updateApplyRowResult_(sheet, row.__rowNumber, getTopicApplyReviewHeaders_(), { result: 'BLOCKED - Missing course ID or topic name.' });
        return;
      }
      if (!topicCache[courseId]) topicCache[courseId] = getClassroomTopicsByName_(courseId);
      const duplicate = topicCache[courseId][normalizeText_(topicName)];
      if (duplicate && duplicate.id) {
        summary.skippedExisting++;
        updateApplyRowResult_(sheet, row.__rowNumber, getTopicApplyReviewHeaders_(), { existingIdHeader: 'Existing Topic ID', existingId: duplicate.id, result: `SKIPPED - Topic already exists (${duplicate.id}).` });
        return;
      }
      const created = createClassroomTopic_(courseId, topicName);
      const id = String(created && created.topicId || created && created.id || '').trim();
      topicCache[courseId][normalizeText_(topicName)] = { id, status: 'EXISTS' };
      summary.created++;
      updateApplyRowResult_(sheet, row.__rowNumber, getTopicApplyReviewHeaders_(), { createdIdHeader: 'Created Topic ID', createdId: id, createdByHeader: 'Created By', createdAtHeader: 'Created At', result: `CREATED topic ${id}.` });
      propagateApplyResultToSource_(row, 'CREATED', `Topic created ${id}.`);
      appendCommandCentreLog_('APPLY APPROVED TOPICS', 'CREATED', `${row['Course Name']} / ${topicName} -> ${id}`);
    } catch (err) {
      summary.errors++;
      updateApplyRowResult_(sheet, row.__rowNumber, getTopicApplyReviewHeaders_(), { result: `ERROR - ${err && err.message ? err.message : err}` });
      appendCommandCentreLog_('APPLY APPROVED TOPICS', 'ERROR', `${row['Course Name']} / ${row['Topic Name']}: ${err && err.message ? err.message : err}`);
    }
  });
  summary.notApproved = rows.filter(row => row['Approve?'] !== true).length;
  styleLockedApplySheet_(sheet, getTopicApplyReviewHeaders_(), { approvalCol: 1, dateCols: [12], readinessCol: 9, resultCol: 14 });
  appendCommandCentreLog_('APPLY APPROVED TOPICS', summary.errors ? 'DONE WITH ERRORS' : 'DONE', `Created ${summary.created}; skipped existing ${summary.skippedExisting}; blocked ${summary.blocked}; not approved ${summary.notApproved}; errors ${summary.errors}; cap ${TOPIC_CREATE_MAX_PER_RUN}.`);
  return summary;
}

function buildCourseworkApplyReviewInternal_(kind) {
  requireClassroomService_();
  const normalizedKind = normalizeText_(kind).toUpperCase();
  const config = getCourseworkApplyConfig_(normalizedKind);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shell = ss.getSheetByName(APP.COURSE_SHELL_TEMPLATE_SHEET) || ss.insertSheet(APP.COURSE_SHELL_TEMPLATE_SHEET);
  const records = readCourseShellTemplateRecords_(shell).filter(record => normalizeText_(record.itemType).toUpperCase() === normalizedKind);
  const courseIds = buildCourseIdLookupForApply_();
  const topicCache = {};
  const existingCache = {};
  const rows = [];
  const summary = { rows: 0, ready: 0, review: 0, blocked: 0 };

  records.forEach(record => {
    const courseId = resolveCourseIdForRecord_(record, courseIds);
    const title = record.itemTitle || '';
    const topicName = record.topic || '';
    let readiness = 'READY';
    const blocks = [];
    let topicId = '';
    let existingId = '';
    if (!record.build) {
      readiness = 'REVIEW';
      blocks.push('Use? is not checked on the source row.');
    }
    if (!courseId) {
      readiness = 'BLOCKED';
      blocks.push('Classroom Course ID is missing.');
    }
    if (!title && normalizedKind !== 'ANNOUNCEMENT') {
      readiness = 'BLOCKED';
      blocks.push(`${config.label} title is missing.`);
    }
    if (normalizedKind === 'ANNOUNCEMENT' && !record.description && !title) {
      readiness = 'BLOCKED';
      blocks.push('Announcement text is missing.');
    }
    if (courseId && topicName) {
      if (!topicCache[courseId]) topicCache[courseId] = getClassroomTopicsByName_(courseId);
      const topic = topicCache[courseId][normalizeText_(topicName)] || {};
      topicId = topic.id || '';
      if (!topicId) {
        readiness = readiness === 'BLOCKED' ? 'BLOCKED' : 'REVIEW';
        blocks.push('Topic is not created yet; run Topic Apply or leave Topic ID blank.');
      }
    }
    if (courseId) {
      const cacheKey = `${normalizedKind}|${courseId}`;
      if (!existingCache[cacheKey]) existingCache[cacheKey] = config.existingLookup(courseId);
      const existing = existingCache[cacheKey][normalizeText_(title || record.description)];
      if (existing && existing.id) {
        readiness = 'BLOCKED';
        blocks.push(`${config.label} already exists in Classroom.`);
        existingId = existing.id;
      }
    }
    incrementReadinessSummary_(summary, readiness);
    rows.push(config.rowBuilder(record, { courseId, topicId, existingId, readiness, blockReason: blocks.join(' ') }));
  });

  summary.rows = rows.length;
  const sheet = ss.getSheetByName(config.sheetName) || ss.insertSheet(config.sheetName);
  writeSimpleTable_(sheet, config.headers, rows);
  styleLockedApplySheet_(sheet, config.headers, config.style);
  appendCommandCentreLog_(`BUILD ${normalizedKind} APPLY REVIEW`, summary.blocked ? 'REVIEW' : 'DONE', `Rows: ${summary.rows}; ready: ${summary.ready}; review: ${summary.review}; blocked: ${summary.blocked}.`);
  return summary;
}

function applyApprovedAssignmentsInternal_() {
  return applyApprovedCourseworkItems_('ASSIGNMENT');
}

function applyApprovedMaterialsInternal_() {
  return applyApprovedCourseworkItems_('MATERIAL');
}

function applyApprovedAnnouncementsInternal_() {
  return applyApprovedCourseworkItems_('ANNOUNCEMENT');
}

function applyApprovedCourseworkItems_(kind) {
  requireClassroomService_();
  const normalizedKind = normalizeText_(kind).toUpperCase();
  const config = getCourseworkApplyConfig_(normalizedKind);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(config.sheetName);
  const rows = readApplySheetRows_(sheet, config.headers);
  const summary = makeApplySummary_(rows);
  const existingCache = {};
  rows.forEach(row => {
    if (row['Approve?'] !== true) return;
    if (!isApprovedApplyRow_(row, config.confirmText, config.createdIdHeader, config.existingIdHeader)) {
      summary.blocked++;
      return;
    }
    if (summary.created >= config.max) return;
    try {
      const courseId = String(row['Classroom Course ID'] || '').trim();
      const title = String(row[config.titleHeader] || row['Announcement Title / Label'] || '').trim();
      if (!courseId || (!title && normalizedKind !== 'ANNOUNCEMENT')) {
        summary.blocked++;
        updateApplyRowResult_(sheet, row.__rowNumber, config.headers, { result: 'BLOCKED - Missing course ID or title.' });
        return;
      }
      const cacheKey = `${normalizedKind}|${courseId}`;
      if (!existingCache[cacheKey]) existingCache[cacheKey] = config.existingLookup(courseId);
      const duplicateKey = normalizeText_(title || row['Text']);
      const duplicate = existingCache[cacheKey][duplicateKey];
      if (duplicate && duplicate.id) {
        summary.skippedExisting++;
        updateApplyRowResult_(sheet, row.__rowNumber, config.headers, { existingIdHeader: config.existingIdHeader, existingId: duplicate.id, result: `SKIPPED - Already exists (${duplicate.id}).` });
        return;
      }
      const created = config.create(courseId, row);
      const id = String(created && (created.id || created.courseWorkMaterial && created.courseWorkMaterial.id) || '').trim();
      existingCache[cacheKey][duplicateKey] = { id, status: 'EXISTS' };
      summary.created++;
      updateApplyRowResult_(sheet, row.__rowNumber, config.headers, { createdIdHeader: config.createdIdHeader, createdId: id, createdByHeader: 'Created By', createdAtHeader: 'Created At', result: `CREATED ${config.label.toLowerCase()} ${id}.` });
      appendCommandCentreLog_(`APPLY APPROVED ${normalizedKind}`, 'CREATED', `${row['Course Name']} / ${title || row['Text']} -> ${id}`);
    } catch (err) {
      summary.errors++;
      updateApplyRowResult_(sheet, row.__rowNumber, config.headers, { result: `ERROR - ${err && err.message ? err.message : err}` });
      appendCommandCentreLog_(`APPLY APPROVED ${normalizedKind}`, 'ERROR', `${row['Course Name']}: ${err && err.message ? err.message : err}`);
    }
  });
  summary.notApproved = rows.filter(row => row['Approve?'] !== true).length;
  styleLockedApplySheet_(sheet, config.headers, config.style);
  appendCommandCentreLog_(`APPLY APPROVED ${normalizedKind}`, summary.errors ? 'DONE WITH ERRORS' : 'DONE', `Created ${summary.created}; skipped existing ${summary.skippedExisting}; blocked ${summary.blocked}; not approved ${summary.notApproved}; errors ${summary.errors}; cap ${config.max}.`);
  return summary;
}

function buildStudentInviteReviewInternal_() {
  requireClassroomService_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const audit = ss.getSheetByName(APP.CLASSROOM_AUDIT_SHEET);
  const rows = [];
  const summary = { rows: 0, ready: 0, review: 0, blocked: 0 };
  if (audit && audit.getLastRow() >= 2) {
    const values = audit.getDataRange().getValues();
    const headers = values[0].map(h => normalizeText_(h));
    const idx = {
      course: getHeaderIndex_(headers, ['course'], 1),
      courseId: getHeaderIndex_(headers, ['classroom course id'], 3),
      name: getHeaderIndex_(headers, ['student name'], 4),
      email: getHeaderIndex_(headers, ['student email'], 5),
      inPs: getHeaderIndex_(headers, ['in powerschool?'], 6),
      inGc: getHeaderIndex_(headers, ['in classroom?'], 7),
      issue: getHeaderIndex_(headers, ['issue'], 9)
    };
    for (let r = 1; r < values.length; r++) {
      const row = values[r];
      const issue = normalizeText_(row[idx.issue]);
      if (issue !== 'in powerschool not classroom') continue;
      const email = String(row[idx.email] || '').trim();
      let readiness = 'READY';
      const blocks = [];
      if (!email) {
        readiness = 'BLOCKED';
        blocks.push('Student email is missing.');
      }
      if (!row[idx.courseId]) {
        readiness = 'BLOCKED';
        blocks.push('Classroom Course ID is missing.');
      }
      incrementReadinessSummary_(summary, readiness);
      rows.push([false, '', row[idx.courseId] || '', row[idx.course] || '', row[idx.name] || '', email, row[idx.inPs] ? 'YES' : 'NO', 'NO', readiness, blocks.join(' '), '', '', '', '']);
    }
  }
  summary.rows = rows.length;
  const sheet = ss.getSheetByName(APP.STUDENT_INVITE_REVIEW_SHEET) || ss.insertSheet(APP.STUDENT_INVITE_REVIEW_SHEET);
  writeSimpleTable_(sheet, getStudentInviteReviewHeaders_(), rows);
  styleLockedApplySheet_(sheet, getStudentInviteReviewHeaders_(), { approvalCol: 1, dateCols: [12], readinessCol: 9, resultCol: 14 });
  appendCommandCentreLog_('BUILD STUDENT INVITE REVIEW', summary.blocked ? 'REVIEW' : 'DONE', `Rows: ${summary.rows}; ready: ${summary.ready}; review: ${summary.review}; blocked: ${summary.blocked}.`);
  return summary;
}

function applyApprovedStudentInvitesInternal_() {
  requireClassroomService_();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.STUDENT_INVITE_REVIEW_SHEET);
  const headers = getStudentInviteReviewHeaders_();
  const rows = readApplySheetRows_(sheet, headers);
  const summary = makeApplySummary_(rows);
  rows.forEach(row => {
    if (row['Approve Invite?'] !== true) return;
    if (!isApprovedInviteRow_(row, 'INVITE STUDENT', 'Invitation ID / Result ID')) {
      summary.blocked++;
      return;
    }
    if (summary.created >= STUDENT_INVITE_MAX_PER_RUN) return;
    try {
      const courseId = String(row['Classroom Course ID'] || '').trim();
      const email = String(row['Student Email'] || '').trim();
      if (!courseId || !email || normalizeText_(row['In PowerSchool?']) !== 'yes' || normalizeText_(row['Already In Classroom?']) === 'yes') {
        summary.blocked++;
        updateApplyRowResult_(sheet, row.__rowNumber, headers, { result: 'BLOCKED - Missing course/email, not in PowerSchool, or already in Classroom.' });
        return;
      }
      const created = Classroom.Invitations.create({
        courseId,
        userId: email,
        role: 'STUDENT'
      });
      const id = String(created && created.id || email).trim();
      summary.created++;
      updateApplyRowResult_(sheet, row.__rowNumber, headers, { createdIdHeader: 'Invitation ID / Result ID', createdId: id, createdByHeader: 'Invited By', createdAtHeader: 'Invited At', result: `INVITED student ${email}.` });
      appendCommandCentreLog_('APPLY APPROVED STUDENT INVITES', 'DONE', `${row['Course Name']} / ${email}`);
    } catch (err) {
      summary.errors++;
      updateApplyRowResult_(sheet, row.__rowNumber, headers, { result: `ERROR - ${err && err.message ? err.message : err}` });
      appendCommandCentreLog_('APPLY APPROVED STUDENT INVITES', 'ERROR', `${row['Course Name']} / ${row['Student Email']}: ${err && err.message ? err.message : err}`);
    }
  });
  summary.notApproved = rows.filter(row => row['Approve Invite?'] !== true).length;
  styleLockedApplySheet_(sheet, headers, { approvalCol: 1, dateCols: [12], readinessCol: 9, resultCol: 14 });
  return summary;
}

function buildTeacherInviteReviewInternal_() {
  requireClassroomService_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const records = readCourseShellTemplateRecords_(ss.getSheetByName(APP.COURSE_SHELL_TEMPLATE_SHEET) || ss.insertSheet(APP.COURSE_SHELL_TEMPLATE_SHEET));
  const courseIds = buildCourseIdLookupForApply_();
  const rows = [];
  const seen = {};
  const summary = { rows: 0, ready: 0, review: 0, blocked: 0 };
  records.forEach(record => {
    const emails = dedupeEmails_(extractEmails_(record.coTeacherEmails || ''));
    emails.forEach(email => {
      const courseId = resolveCourseIdForRecord_(record, courseIds);
      const key = `${courseId}|${email}`;
      if (seen[key]) return;
      seen[key] = true;
      let readiness = 'READY';
      const blocks = [];
      if (!courseId) {
        readiness = 'BLOCKED';
        blocks.push('Classroom Course ID is missing.');
      }
      const already = courseId && teacherAlreadyInCourse_(courseId, email);
      if (already) {
        readiness = 'BLOCKED';
        blocks.push('Teacher is already in Classroom.');
      }
      incrementReadinessSummary_(summary, readiness);
      rows.push([false, '', courseId || '', record.courseName || '', email, already ? 'YES' : 'NO', readiness, blocks.join(' '), '', '', '', '']);
    });
  });
  summary.rows = rows.length;
  const sheet = ss.getSheetByName(APP.TEACHER_INVITE_REVIEW_SHEET) || ss.insertSheet(APP.TEACHER_INVITE_REVIEW_SHEET);
  writeSimpleTable_(sheet, getTeacherInviteReviewHeaders_(), rows);
  styleLockedApplySheet_(sheet, getTeacherInviteReviewHeaders_(), { approvalCol: 1, dateCols: [10], readinessCol: 7, resultCol: 12 });
  appendCommandCentreLog_('BUILD TEACHER INVITE REVIEW', summary.blocked ? 'REVIEW' : 'DONE', `Rows: ${summary.rows}; ready: ${summary.ready}; review: ${summary.review}; blocked: ${summary.blocked}.`);
  return summary;
}

function applyApprovedTeacherInvitesInternal_() {
  requireClassroomService_();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.TEACHER_INVITE_REVIEW_SHEET);
  const headers = getTeacherInviteReviewHeaders_();
  const rows = readApplySheetRows_(sheet, headers);
  const summary = makeApplySummary_(rows);
  rows.forEach(row => {
    if (row['Approve Invite?'] !== true) return;
    if (!isApprovedInviteRow_(row, 'INVITE TEACHER', 'Invitation ID / Result ID')) {
      summary.blocked++;
      return;
    }
    if (summary.created >= TEACHER_INVITE_MAX_PER_RUN) return;
    try {
      const courseId = String(row['Classroom Course ID'] || '').trim();
      const email = String(row['Teacher Email'] || '').trim();
      if (!courseId || !email || normalizeText_(row['Already Teacher?']) === 'yes') {
        summary.blocked++;
        updateApplyRowResult_(sheet, row.__rowNumber, headers, { result: 'BLOCKED - Missing course/email or teacher already exists.' });
        return;
      }
      const created = Classroom.Invitations.create({
        courseId,
        userId: email,
        role: 'TEACHER'
      });
      const id = String(created && created.id || email).trim();
      summary.created++;
      updateApplyRowResult_(sheet, row.__rowNumber, headers, { createdIdHeader: 'Invitation ID / Result ID', createdId: id, createdByHeader: 'Invited By', createdAtHeader: 'Invited At', result: `INVITED teacher ${email}.` });
      appendCommandCentreLog_('APPLY APPROVED TEACHER INVITES', 'DONE', `${row['Course Name']} / ${email}`);
    } catch (err) {
      summary.errors++;
      updateApplyRowResult_(sheet, row.__rowNumber, headers, { result: `ERROR - ${err && err.message ? err.message : err}` });
      appendCommandCentreLog_('APPLY APPROVED TEACHER INVITES', 'ERROR', `${row['Course Name']} / ${row['Teacher Email']}: ${err && err.message ? err.message : err}`);
    }
  });
  summary.notApproved = rows.filter(row => row['Approve Invite?'] !== true).length;
  styleLockedApplySheet_(sheet, headers, { approvalCol: 1, dateCols: [10], readinessCol: 7, resultCol: 12 });
  return summary;
}

function buildArtifactApplyReviewInternal_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterRows = readMasterRowsAsObjects_(ss.getSheetByName(APP.MASTER_SHEET));
  const rows = masterRows.map(row => {
    const email = cleanEmailCell_(row['Email'] || '');
    const readiness = row['Student Name'] && row['Course'] ? 'READY' : 'BLOCKED';
    return [false, '', 'STUDENT_FOLDER', row['Student Name'] || '', email, row['Course'] || '', '', '', '', '', '', '', readiness, readiness === 'READY' ? '' : 'Student name and course are required.', ''];
  });
  const summary = { rows: rows.length, ready: rows.filter(row => row[12] === 'READY').length, review: 0, blocked: rows.filter(row => row[12] === 'BLOCKED').length };
  const sheet = ss.getSheetByName(APP.ARTIFACT_APPLY_REVIEW_SHEET) || ss.insertSheet(APP.ARTIFACT_APPLY_REVIEW_SHEET);
  writeSimpleTable_(sheet, getArtifactApplyReviewHeaders_(), rows);
  styleLockedApplySheet_(sheet, getArtifactApplyReviewHeaders_(), { approvalCol: 1, dateCols: [11], readinessCol: 13, resultCol: 15 });
  appendCommandCentreLog_('BUILD ARTIFACT APPLY REVIEW', summary.blocked ? 'REVIEW' : 'DONE', `Rows: ${summary.rows}; ready: ${summary.ready}; blocked: ${summary.blocked}.`);
  return summary;
}

function applyApprovedArtifactsInternal_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.ARTIFACT_APPLY_REVIEW_SHEET);
  const headers = getArtifactApplyReviewHeaders_();
  const rows = readApplySheetRows_(sheet, headers);
  const summary = makeApplySummary_(rows);
  rows.forEach(row => {
    if (row['Approve?'] !== true) return;
    if (!isApprovedApplyRow_(row, 'CREATE ARTIFACT', 'Created Artifact URL', 'Existing Artifact URL')) {
      summary.blocked++;
      return;
    }
    if (summary.created >= ARTIFACT_CREATE_MAX_PER_RUN) return;
    try {
      const artifactType = normalizeText_(row['Artifact Type']).toUpperCase().replace(/\s+/g, '_');
      const nameParts = [row['Course'], row['Student Name'], row['Artifact Type']].filter(Boolean);
      let url = '';
      if (artifactType === 'STUDENT_FOLDER') {
        const folder = row['Destination Folder ID']
          ? DriveApp.getFolderById(String(row['Destination Folder ID']).trim()).createFolder(nameParts.join(' - '))
          : DriveApp.createFolder(nameParts.join(' - '));
        url = folder.getUrl();
      } else if (artifactType === 'PROGRESS_DOC' || artifactType === 'PROGRESS_PDF' || artifactType === 'CERTIFICATE_DOC') {
        const doc = DocumentApp.create(nameParts.join(' - '));
        doc.getBody().appendParagraph(`Student: ${row['Student Name'] || ''}`);
        doc.getBody().appendParagraph(`Course: ${row['Course'] || ''}`);
        doc.getBody().appendParagraph(`Created: ${new Date()}`);
        doc.saveAndClose();
        url = doc.getUrl();
      } else if (artifactType === 'CHECK_IN_FORM' || artifactType === 'VERBAL_ASSESSMENT_FORM') {
        const form = FormApp.create(nameParts.join(' - '));
        form.setDescription(`Generated for ${row['Student Name'] || 'student'} in ${row['Course'] || 'course'}.`);
        form.addParagraphTextItem().setTitle('Teacher notes');
        url = form.getEditUrl();
      } else {
        summary.blocked++;
        updateApplyRowResult_(sheet, row.__rowNumber, headers, { result: `BLOCKED - Unknown artifact type ${row['Artifact Type']}.` });
        return;
      }
      summary.created++;
      updateApplyRowResult_(sheet, row.__rowNumber, headers, { createdIdHeader: 'Created Artifact URL', createdId: url, createdByHeader: 'Created By', createdAtHeader: 'Created At', result: `CREATED ${row['Artifact Type']}.` });
      appendCommandCentreLog_('APPLY APPROVED ARTIFACTS', 'CREATED', `${row['Artifact Type']} / ${row['Student Name']} / ${row['Course']}`);
    } catch (err) {
      summary.errors++;
      updateApplyRowResult_(sheet, row.__rowNumber, headers, { result: `ERROR - ${err && err.message ? err.message : err}` });
      appendCommandCentreLog_('APPLY APPROVED ARTIFACTS', 'ERROR', `${row['Artifact Type']} / ${row['Student Name']}: ${err && err.message ? err.message : err}`);
    }
  });
  summary.notApproved = rows.filter(row => row['Approve?'] !== true).length;
  styleLockedApplySheet_(sheet, headers, { approvalCol: 1, dateCols: [11], readinessCol: 13, resultCol: 15 });
  return summary;
}

function buildAdminReportsInternal_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const now = new Date();
  let totalRows = 0;
  let sheetCount = 0;
  const masterRows = readMasterRowsAsObjects_(ss.getSheetByName(APP.MASTER_SHEET));
  const auditRows = readSheetObjectsByName_(APP.CLASSROOM_AUDIT_SHEET);
  const emailRows = readSheetObjectsByName_(APP.EMAIL_LOG_SHEET);
  const contactRows = readSheetObjectsByName_(APP.CONTACT_LOG_SHEET);
  const gcSummaryRows = readSheetObjectsByName_(APP.SUMMARY_SHEET);

  const writeReport = (sheetName, headers, rows) => {
    const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
    writeSimpleTable_(sheet, headers, rows);
    if (rows.length) sheet.getRange(2, 1, rows.length, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
    styleSimpleSheet_(sheet, rows.length + 1, headers.length);
    totalRows += rows.length;
    sheetCount++;
  };

  writeReport(APP.ADMIN_SUMMARY_SHEET, ['Generated At', 'Metric', 'Value', 'Detail'], [
    [now, 'Active Master rows', masterRows.length, 'From active-only Master Tracker'],
    [now, 'Checked Classroom courses', readEnabledCourseMaps_().length, 'From Classroom Course Map'],
    [now, 'Roster mismatch rows', auditRows.filter(row => row['Issue']).length, 'From GC PowerSchool Audit'],
    [now, 'Email log rows', emailRows.length, 'From Email Log'],
    [now, 'Contact log rows', contactRows.length, 'From Contact Log'],
    [now, 'GC summary rows', gcSummaryRows.length, 'From GC Assignment Tabs Summary']
  ]);

  writeReport(APP.ROSTER_MISMATCH_REPORT_SHEET, ['Generated At', 'Course', 'Student Name', 'Student Email', 'Issue', 'Recommended Action'], auditRows
    .filter(row => row['Issue'] && normalizeText_(row['Issue']) !== 'email match')
    .map(row => [now, row['Course'] || '', row['Student Name'] || '', row['Student Email'] || '', row['Issue'] || '', row['Recommended Action'] || '']));

  writeReport(APP.CONTACT_NEEDED_REPORT_SHEET, ['Generated At', 'Student Name', 'Course', 'Status', 'Last Contact', 'Email', 'Recommended Action'], masterRows
    .filter(row => ['BEHIND', 'NO CONTACT'].indexOf(cleanStatus_(row['STATUS'])) !== -1)
    .map(row => [now, row['Student Name'] || '', row['Course'] || '', row['STATUS'] || '', row['LAST CONTACT'] || '', row['Email'] || '', 'Preview selected email or log contact.']));

  writeReport(APP.MISSING_WORK_REPORT_SHEET, ['Generated At', 'Course', 'Student Name', 'Outstanding Detail', 'Recommended Action'], collectGcTabAssignmentStatusRows_(['OUTSTANDING', 'MISSING - PAST DUE']).map(row => [now, row.course, row.student, row.detail, 'Review course tab and preview email if appropriate.']));

  writeReport(APP.NEEDS_MARKING_REPORT_SHEET, ['Generated At', 'Course', 'Student Name', 'Needs Marking Detail', 'Recommended Action'], collectGcTabAssignmentStatusRows_(['TURNED IN - NEEDS MARKING']).map(row => [now, row.course, row.student, row.detail, 'Open Classroom submission and mark/return work.']));

  writeReport(APP.COURSE_PROGRESS_SUMMARY_SHEET, ['Generated At', 'Course', 'Students', 'Assignments', 'Missing Cells', 'Late Cells', 'Course Avg Grade %', 'Classroom Course ID'], gcSummaryRows.map(row => [now, row['Display Course'] || row['Course'] || '', row['Students'] || '', row['Assignments'] || '', row['Missing Cells'] || '', row['Late Cells'] || '', row['Course Avg Grade %'] || '', row['Classroom Course ID'] || '']));

  appendCommandCentreLog_('BUILD ADMIN REPORTS', 'DONE', `Sheets updated: ${sheetCount}; rows written: ${totalRows}. Read-only reporting only.`);
  return { sheets: sheetCount, rows: totalRows };
}

function getCourseworkApplyConfig_(kind) {
  const common = {
    ASSIGNMENT: {
      sheetName: APP.ASSIGNMENT_APPLY_REVIEW_SHEET,
      headers: getAssignmentApplyReviewHeaders_(),
      label: 'Assignment',
      confirmText: 'POST ASSIGNMENT',
      createdIdHeader: 'Created Assignment ID',
      existingIdHeader: 'Existing Assignment ID',
      titleHeader: 'Assignment Title',
      max: ASSIGNMENT_CREATE_MAX_PER_RUN,
      style: { approvalCol: 1, dateCols: [18], readinessCol: 23, resultCol: 20 },
      existingLookup: getClassroomAssignmentsByName_,
      create: createClassroomAssignment_,
      rowBuilder: (record, state) => [false, '', state.courseId, record.courseName, record.section, record.topic, state.topicId, record.itemTitle, record.description, record.dueDate, '', record.points, record.attachmentLink, record.publish ? 'PUBLISHED' : 'DRAFT', 'ALL_STUDENTS', state.existingId, '', '', '', '', APP.COURSE_SHELL_TEMPLATE_SHEET, record.rowNumber, state.readiness, state.blockReason]
    },
    MATERIAL: {
      sheetName: APP.MATERIAL_APPLY_REVIEW_SHEET,
      headers: getMaterialApplyReviewHeaders_(),
      label: 'Material',
      confirmText: 'POST MATERIAL',
      createdIdHeader: 'Created Material ID',
      existingIdHeader: 'Existing Material ID',
      titleHeader: 'Material Title',
      max: MATERIAL_CREATE_MAX_PER_RUN,
      style: { approvalCol: 1, dateCols: [14], readinessCol: 19, resultCol: 16 },
      existingLookup: getClassroomMaterialsByName_,
      create: createClassroomMaterial_,
      rowBuilder: (record, state) => [false, '', state.courseId, record.courseName, record.section, record.topic, state.topicId, record.itemTitle, record.description, record.attachmentLink, record.publish ? 'PUBLISHED' : 'DRAFT', state.existingId, '', '', '', '', APP.COURSE_SHELL_TEMPLATE_SHEET, record.rowNumber, state.readiness, state.blockReason]
    },
    ANNOUNCEMENT: {
      sheetName: APP.ANNOUNCEMENT_APPLY_REVIEW_SHEET,
      headers: getAnnouncementApplyReviewHeaders_(),
      label: 'Announcement',
      confirmText: 'POST ANNOUNCEMENT',
      createdIdHeader: 'Created Announcement ID',
      existingIdHeader: 'Existing Announcement ID',
      titleHeader: 'Announcement Title / Label',
      max: ANNOUNCEMENT_CREATE_MAX_PER_RUN,
      style: { approvalCol: 1, dateCols: [14], readinessCol: 19, resultCol: 16 },
      existingLookup: getClassroomAnnouncementsByName_,
      create: createClassroomAnnouncement_,
      rowBuilder: (record, state) => [false, '', state.courseId, record.courseName, record.section, record.topic, state.topicId, record.itemTitle, record.description, record.attachmentLink, record.publish ? 'PUBLISHED' : 'DRAFT', state.existingId, '', '', '', '', APP.COURSE_SHELL_TEMPLATE_SHEET, record.rowNumber, state.readiness, state.blockReason]
    }
  };
  return common[kind];
}

function buildCourseIdLookupForApply_() {
  const lookup = {};
  const add = (course, section, id) => {
    const cleanId = String(id || '').trim();
    const key = makeCourseSectionKey_(course, section);
    if (key && cleanId) lookup[key] = cleanId;
    const courseOnly = `${normalizeText_(course)}|`;
    if (courseOnly && cleanId && !lookup[courseOnly]) lookup[courseOnly] = cleanId;
  };
  try {
    readCourseCreationApplyRecords_(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(APP.COURSE_CREATION_APPLY_SHEET)).forEach(row => {
      add(row.courseName, row.section, row.createdCourseId || row.existingCourseId);
    });
  } catch (err) {}
  try {
    readEnabledCourseMaps_().forEach(map => add(map.displayCourseName || map.classroomCourseName, '', map.classroomCourseId));
  } catch (err) {}
  return lookup;
}

function resolveCourseIdForRecord_(record, lookup) {
  const key = makeCourseSectionKey_(record.courseName, record.section);
  const courseOnly = `${normalizeText_(record.courseName)}|`;
  return (lookup || {})[key] || (lookup || {})[courseOnly] || '';
}

function getClassroomTopicsByName_(courseId) {
  const topics = {};
  let pageToken;
  do {
    const response = Classroom.Courses.Topics.list(courseId, { pageSize: 100, pageToken });
    (response.topic || []).forEach(topic => {
      topics[normalizeText_(topic.name)] = { id: topic.topicId || topic.id || '', status: 'EXISTS', name: topic.name || '' };
    });
    pageToken = response.nextPageToken;
  } while (pageToken);
  return topics;
}

function getClassroomAssignmentsByName_(courseId) {
  return getClassroomCourseWorkByNameForApply_(courseId);
}

function getClassroomCourseWorkByNameForApply_(courseId) {
  const items = {};
  let pageToken;
  do {
    const response = Classroom.Courses.CourseWork.list(courseId, { pageSize: 100, pageToken });
    (response.courseWork || []).forEach(item => {
      items[normalizeText_(item.title)] = { id: item.id || '', status: item.state || 'EXISTS' };
    });
    pageToken = response.nextPageToken;
  } while (pageToken);
  return items;
}

function getClassroomMaterialsByName_(courseId) {
  const items = {};
  let pageToken;
  do {
    const response = Classroom.Courses.CourseWorkMaterials.list(courseId, { pageSize: 100, pageToken });
    (response.courseWorkMaterial || []).forEach(item => {
      items[normalizeText_(item.title)] = { id: item.id || '', status: item.state || 'EXISTS' };
    });
    pageToken = response.nextPageToken;
  } while (pageToken);
  return items;
}

function getClassroomAnnouncementsByName_(courseId) {
  const items = {};
  let pageToken;
  do {
    const response = Classroom.Courses.Announcements.list(courseId, { pageSize: 100, pageToken });
    (response.announcements || []).forEach(item => {
      items[normalizeText_(item.text)] = { id: item.id || '', status: item.state || 'EXISTS' };
    });
    pageToken = response.nextPageToken;
  } while (pageToken);
  return items;
}

function createClassroomTopic_(courseId, topicName) {
  return Classroom.Courses.Topics.create({ name: topicName }, courseId);
}

function createClassroomAssignment_(courseId, row) {
  const due = builderDueDateToClassroomDue_(row['Due Date']);
  const payload = {
    title: String(row['Assignment Title'] || '').trim(),
    description: String(row['Description'] || '').trim(),
    workType: 'ASSIGNMENT',
    state: normalizeClassroomPublishState_(row['Publish State']),
    maxPoints: row['Points'] !== '' && !isNaN(Number(row['Points'])) ? Number(row['Points']) : undefined,
    topicId: String(row['Topic ID'] || '').trim() || undefined,
    materials: buildClassroomMaterialsFromLink_(row['Attachment Link'])
  };
  if (due) payload.dueDate = due;
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
  return Classroom.Courses.CourseWork.create(payload, courseId);
}

function createClassroomMaterial_(courseId, row) {
  const payload = {
    title: String(row['Material Title'] || '').trim(),
    description: String(row['Description'] || '').trim(),
    state: normalizeClassroomPublishState_(row['Publish State']),
    topicId: String(row['Topic ID'] || '').trim() || undefined,
    materials: buildClassroomMaterialsFromLink_(row['Attachment Link'])
  };
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
  return Classroom.Courses.CourseWorkMaterials.create(payload, courseId);
}

function createClassroomAnnouncement_(courseId, row) {
  const title = String(row['Announcement Title / Label'] || '').trim();
  const text = String(row['Text'] || '').trim() || title;
  const payload = {
    text,
    state: normalizeClassroomPublishState_(row['Publish State']),
    materials: buildClassroomMaterialsFromLink_(row['Attachment Link'])
  };
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
  return Classroom.Courses.Announcements.create(payload, courseId);
}

function normalizeClassroomPublishState_(value) {
  const clean = normalizeText_(value);
  return clean === 'published' ? 'PUBLISHED' : 'DRAFT';
}

function buildClassroomMaterialsFromLink_(value) {
  const link = String(value || '').trim();
  if (!/^https?:\/\//i.test(link)) return undefined;
  return [{ link: { url: link } }];
}

function builderDueDateToClassroomDue_(value) {
  if (!value) return null;
  const date = Object.prototype.toString.call(value) === '[object Date]' ? value : new Date(value);
  if (isNaN(date.getTime())) return null;
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

function teacherAlreadyInCourse_(courseId, email) {
  const cleanEmail = normalizeText_(email);
  if (!courseId || !cleanEmail) return false;
  let pageToken;
  do {
    const response = Classroom.Courses.Teachers.list(courseId, { pageSize: 100, pageToken });
    const found = (response.teachers || []).some(teacher => normalizeText_(((teacher.profile || {}).emailAddress) || '') === cleanEmail);
    if (found) return true;
    pageToken = response.nextPageToken;
  } while (pageToken);
  return false;
}

function readApplySheetRows_(sheet, headers) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  ensureHeaderRow_(sheet, headers);
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  return values.map((row, index) => {
    const obj = { __rowNumber: index + 2 };
    headers.forEach((header, col) => obj[header] = row[col]);
    return obj;
  }).filter(row => headers.some(header => header !== 'Approve?' && header !== 'Approve Invite?' && String(row[header] || '').trim() !== ''));
}

function isApprovedApplyRow_(row, confirmText, createdIdHeader, existingIdHeader) {
  return row
    && normalizeText_(row['Confirm Text']) === normalizeText_(confirmText)
    && normalizeText_(row['Readiness']) === 'ready'
    && !String(row[createdIdHeader] || '').trim()
    && (!existingIdHeader || !String(row[existingIdHeader] || '').trim());
}

function isApprovedInviteRow_(row, confirmText, createdIdHeader) {
  return row
    && normalizeText_(row['Confirm Text']) === normalizeText_(confirmText)
    && normalizeText_(row['Readiness']) === 'ready'
    && !String(row[createdIdHeader] || '').trim();
}

function makeApplySummary_(rows) {
  return { rows: (rows || []).length, created: 0, skippedExisting: 0, blocked: 0, notApproved: 0, errors: 0 };
}

function incrementReadinessSummary_(summary, readiness) {
  if (readiness === 'READY') summary.ready++;
  else if (readiness === 'BLOCKED') summary.blocked++;
  else summary.review++;
}

function getApprovedApplyPreview_(sheetName, headers, options) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const rows = readApplySheetRows_(sheet, headers);
  const approved = rows.filter(row => row[options.approvalHeader] === true);
  const ready = approved.filter(row => {
    return normalizeText_(row[options.confirmHeader]) === normalizeText_(options.confirmText)
      && normalizeText_(row[options.readinessHeader]) === 'ready'
      && !String(row[options.createdIdHeader] || '').trim()
      && (!options.existingIdHeader || !String(row[options.existingIdHeader] || '').trim());
  });
  return {
    approved: ready.length,
    approvedTotal: approved.length,
    alreadyCreated: approved.filter(row => String(row[options.createdIdHeader] || '').trim() || options.existingIdHeader && String(row[options.existingIdHeader] || '').trim()).length,
    blockedApproved: Math.max(0, approved.length - ready.length),
    max: options.max,
    names: ready.slice(0, options.max).map(row => `- ${row[options.nameHeader] || row['Course Name'] || row['Student Name'] || row['Teacher Email'] || 'approved row'}`)
  };
}

function confirmApplyRows_(title, preview, noun, warningText) {
  if (!preview || !preview.approved) {
    SpreadsheetApp.getUi().alert(
      `No approved ${noun} are ready to run.\n\n` +
      `Approved rows on sheet: ${preview && preview.approvedTotal || 0}\n` +
      `Already created / linked: ${preview && preview.alreadyCreated || 0}\n` +
      `Approved but blocked by gates: ${preview && preview.blockedApproved || 0}`
    );
    return false;
  }
  const confirmation = SpreadsheetApp.getUi().alert(
    title,
    `Approved rows ready: ${preview.approved}\n` +
    `Will run at most this time: ${Math.min(preview.max || preview.approved, preview.approved)}\n\n` +
    `${(preview.names || []).join('\n')}\n\n` +
    `${warningText || ''}`,
    SpreadsheetApp.getUi().ButtonSet.YES_NO
  );
  return confirmation === SpreadsheetApp.getUi().Button.YES;
}

function updateApplyRowResult_(sheet, rowNumber, headers, result) {
  if (!sheet || !rowNumber) return;
  const setByHeader = (header, value) => {
    const col = headers.indexOf(header) + 1;
    if (col > 0) sheet.getRange(rowNumber, col).setValue(value);
  };
  const now = new Date();
  if (result.existingIdHeader && result.existingId) setByHeader(result.existingIdHeader, result.existingId);
  if (result.createdIdHeader && result.createdId) setByHeader(result.createdIdHeader, result.createdId);
  if (result.createdAtHeader) {
    const col = headers.indexOf(result.createdAtHeader) + 1;
    if (col > 0) sheet.getRange(rowNumber, col).setValue(now).setNumberFormat('yyyy-mm-dd h:mm AM/PM');
  }
  if (result.createdByHeader) setByHeader(result.createdByHeader, getActiveTeacherEmail_());
  setByHeader('Apply Result', result.result || '');
}

function styleLockedApplySheet_(sheet, headers, options) {
  styleSimpleSheet_(sheet, Math.max(sheet.getLastRow(), 1), headers.length);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(Math.min(3, headers.length));
  if (sheet.getLastRow() > 1) {
    const rows = sheet.getLastRow() - 1;
    if (options.approvalCol) sheet.getRange(2, options.approvalCol, rows, 1).insertCheckboxes();
    (options.dateCols || []).forEach(col => sheet.getRange(2, col, rows, 1).setNumberFormat('yyyy-mm-dd h:mm AM/PM'));
    const rules = [];
    if (options.readinessCol) {
      const readinessRange = sheet.getRange(2, options.readinessCol, rows, 1);
      rules.push(
        SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('READY').setBackground('#d9ead3').setFontColor('#274e13').setRanges([readinessRange]).build(),
        SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('REVIEW').setBackground('#fff2cc').setFontColor('#7f6000').setRanges([readinessRange]).build(),
        SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('BLOCKED').setBackground('#f4cccc').setFontColor('#990000').setRanges([readinessRange]).build()
      );
    }
    if (options.resultCol) {
      const resultRange = sheet.getRange(2, options.resultCol, rows, 1);
      rules.push(
        SpreadsheetApp.newConditionalFormatRule().whenTextContains('CREATED').setBackground('#d9ead3').setFontColor('#274e13').setRanges([resultRange]).build(),
        SpreadsheetApp.newConditionalFormatRule().whenTextContains('ERROR').setBackground('#f4cccc').setFontColor('#990000').setRanges([resultRange]).build(),
        SpreadsheetApp.newConditionalFormatRule().whenTextContains('SKIPPED').setBackground('#eeeeee').setFontColor('#666666').setRanges([resultRange]).build()
      );
    }
    sheet.setConditionalFormatRules(rules);
  }
  try { sheet.autoResizeColumns(1, Math.min(headers.length, 10)); } catch (err) {}
}

function propagateApplyResultToSource_(row, status, detail) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = String(row['Source Sheet'] || '').trim();
  const rowNumber = Number(row['Source Row'] || 0);
  const sheet = sheetName ? ss.getSheetByName(sheetName) : null;
  if (!sheet || rowNumber < 2) return;
  setValuesNoValidation_(sheet.getRange(rowNumber, 17, 1, 2), [[status || '', detail || '']]);
}

function readSheetObjectsByName_(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => obj[header] = row[index]);
    return obj;
  }).filter(row => Object.keys(row).some(key => String(row[key] || '').trim() !== ''));
}

function collectGcTabAssignmentStatusRows_(targetLabels) {
  const targets = (targetLabels || []).map(label => normalizeText_(label));
  const rows = [];
  SpreadsheetApp.getActiveSpreadsheet().getSheets().forEach(sheet => {
    const name = sheet.getName();
    if (!name.startsWith(APP.GENERATED_TAB_PREFIX) || sheet.getLastRow() < 2 || sheet.getLastColumn() < 15) return;
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const assignmentStart = 14;
    for (let r = 1; r < values.length; r++) {
      const student = values[r][0] || values[r][1] || '';
      for (let c = assignmentStart; c < headers.length; c++) {
        const status = String(values[r][c] || '').trim();
        if (!status) continue;
        const clean = normalizeText_(status);
        if (targets.some(target => clean.indexOf(target) !== -1)) {
          rows.push({
            course: name.replace(APP.GENERATED_TAB_PREFIX, ''),
            student,
            detail: `${assignmentTitleFromHeader_(headers[c])}: ${status}`
          });
        }
      }
    }
  });
  return rows;
}
