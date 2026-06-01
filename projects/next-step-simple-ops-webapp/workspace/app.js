const STORAGE_KEY = "next-step-simple-ops::bridge-url";

const demoState = {
  ok: true,
  source: "demo",
  spreadsheetName: "Demo tracker data",
  generatedAt: "Demo",
  dashboard: {
    activeCourses: 3,
    activeStudents: 67,
    underFifty: 3,
    missingPastDue: 16,
    needsMarking: 2,
    pendingEmails: 15
  },
  courses: [
    {
      name: "AB 10",
      id: "841400778275",
      section: "Semester 1",
      checked: true,
      activeStudents: 18,
      behind: 4,
      pendingEmails: 3,
      lastSync: "2026-06-01 08:14"
    },
    {
      name: "Experimental Psychology 30",
      id: "793981877306",
      section: "Semester 2",
      checked: true,
      activeStudents: 22,
      behind: 6,
      pendingEmails: 5,
      lastSync: "2026-06-01 08:14"
    },
    {
      name: "CALM 10",
      id: "700118885444",
      section: "Flex",
      checked: true,
      activeStudents: 27,
      behind: 8,
      pendingEmails: 7,
      lastSync: "2026-06-01 08:14"
    }
  ],
  students: [
    {
      name: "Avery Thomas",
      email: "avery.thomas@example.com",
      course: "AB 10",
      total: 12,
      done: 10,
      outstanding: 2,
      pastDue: 0,
      needsMarking: 1,
      completionPercent: 83,
      lastSubmission: "2026-05-30",
      lastContact: "2026-05-24",
      risk: "Almost Done",
      recommendedAction: "Mark returned work and check in.",
      noContact: false
    },
    {
      name: "Jordan Cardinal",
      email: "jordan.cardinal@example.com",
      course: "AB 10",
      total: 12,
      done: 3,
      outstanding: 9,
      pastDue: 4,
      needsMarking: 0,
      completionPercent: 25,
      lastSubmission: "2026-05-12",
      lastContact: "2026-04-30",
      risk: "Behind",
      recommendedAction: "Generate missing-work email.",
      noContact: true
    },
    {
      name: "Samira Chen",
      email: "samira.chen@example.com",
      course: "Experimental Psychology 30",
      total: 16,
      done: 16,
      outstanding: 0,
      pastDue: 0,
      needsMarking: 0,
      completionPercent: 100,
      lastSubmission: "2026-05-29",
      lastContact: "2026-05-28",
      risk: "Complete",
      recommendedAction: "No action needed.",
      noContact: false
    },
    {
      name: "Mika Belcourt",
      email: "mika.belcourt@example.com",
      course: "Experimental Psychology 30",
      total: 16,
      done: 1,
      outstanding: 15,
      pastDue: 7,
      needsMarking: 0,
      completionPercent: 6,
      lastSubmission: "2026-04-18",
      lastContact: "2026-04-11",
      risk: "Very Behind",
      recommendedAction: "Teacher follow-up and parent contact.",
      noContact: true
    },
    {
      name: "Kiera Smith",
      email: "kiera.smith@example.com",
      course: "CALM 10",
      total: 8,
      done: 4,
      outstanding: 4,
      pastDue: 2,
      needsMarking: 1,
      completionPercent: 50,
      lastSubmission: "2026-05-27",
      lastContact: "2026-05-19",
      risk: "In Progress",
      recommendedAction: "Preview targeted encouragement email.",
      noContact: false
    },
    {
      name: "Noah Mills",
      email: "noah.mills@example.com",
      course: "CALM 10",
      total: 8,
      done: 0,
      outstanding: 8,
      pastDue: 3,
      needsMarking: 0,
      completionPercent: 0,
      lastSubmission: "No submissions",
      lastContact: "2026-04-26",
      risk: "No Progress",
      recommendedAction: "No-contact workflow and phone check.",
      noContact: true
    }
  ],
  announcements: [],
  emailPreview: [],
  logs: [
    {
      time: "2026-06-01 08:14",
      action: "Sync Everything",
      result: "Completed: 3 checked courses refreshed, 67 students reviewed.",
      safety: "Safe read/sheet operations only"
    },
    {
      time: "2026-06-01 08:10",
      action: "Email Preview",
      result: "Generated 9 preview rows from progress filters.",
      safety: "Preview only"
    },
    {
      time: "2026-05-31 15:42",
      action: "Announcement Queue",
      result: "Queued 2 rows for selected courses.",
      safety: "No Classroom post yet"
    }
  ]
};

let state = structuredClone(demoState);
let activeView = "dashboard";
let bridgeUrl = localStorage.getItem(STORAGE_KEY) || "";
let progressFilter = "All Students";
let progressCourse = "All Courses";
let emailGroup = "Missing Past Due";
let emailCourse = "All Courses";
let localAnnouncements = [];
let localEmailPreview = [];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizeRiskClass(value) {
  return String(value || "In Progress").toLowerCase().replace(/\s+/g, "-");
}

function addLocalLog(action, result, safety) {
  state.logs = [
    {
      time: new Date().toLocaleString(),
      action,
      result,
      safety
    },
    ...(state.logs || [])
  ];
}

function setMessage(message, isError = false) {
  const node = $("[data-bridge-message]");
  node.textContent = message;
  node.classList.toggle("error", isError);
}

function getCourses() {
  return state.courses || [];
}

function getStudents() {
  return state.students || [];
}

function getAnnouncements() {
  return bridgeUrl && Array.isArray(state.announcements) ? state.announcements : localAnnouncements;
}

function getEmailRows() {
  return bridgeUrl && Array.isArray(state.emailPreview) ? state.emailPreview : localEmailPreview;
}

function jsonp(url, params = {}) {
  return new Promise((resolve, reject) => {
    const callbackName = `nextStepBridge_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Bridge request timed out."));
    }, 15000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    const target = new URL(url);
    target.searchParams.set("nextStepBridge", "1");
    target.searchParams.set("action", params.action || "state");
    target.searchParams.set("callback", callbackName);
    Object.entries(params).forEach(([key, value]) => {
      if (key !== "action" && value !== undefined && value !== null) {
        target.searchParams.set(key, String(value));
      }
    });

    window[callbackName] = (payload) => {
      cleanup();
      resolve(payload);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Bridge request failed."));
    };

    script.src = target.toString();
    document.head.append(script);
  });
}

async function refreshFromBridge(showSuccess = true) {
  if (!bridgeUrl) {
    state = structuredClone(demoState);
    setMessage("Demo data is active. Add an Apps Script web app URL in Settings to pull live spreadsheet data.");
    render();
    return;
  }

  setMessage("Pulling spreadsheet state through the Apps Script bridge...");
  try {
    const payload = await jsonp(bridgeUrl, { action: "state" });
    if (!payload || payload.ok === false) {
      throw new Error(payload && payload.error ? payload.error : "Bridge returned an invalid response.");
    }

    state = {
      ...structuredClone(demoState),
      ...payload,
      courses: payload.courses || [],
      students: payload.students || [],
      announcements: payload.announcements || [],
      emailPreview: payload.emailPreview || [],
      logs: payload.logs || []
    };

    if (showSuccess) {
      setMessage(`Connected to ${state.spreadsheetName || "spreadsheet"} at ${state.generatedAt || "current time"}.`);
    }
    render();
  } catch (error) {
    state = structuredClone(demoState);
    setMessage(`Could not pull spreadsheet data: ${error.message}. Demo data is showing.`, true);
    render();
  }
}

function setView(view) {
  activeView = view;
  $$(".view").forEach((node) => node.classList.toggle("active", node.dataset.view === view));
  $$("[data-view-button]").forEach((button) => button.classList.toggle("active", button.dataset.viewButton === view));

  const titles = {
    dashboard: ["Next Step Command Centre", "Daily operations for the Next Step tracker."],
    "student-progress": ["Student Progress", "Completion, missing work, risk, and next action."],
    announcements: ["Announcements", "Write once, queue to checked courses, post selected."],
    "email-centre": ["Email Centre", "Generate previews and keep selected-send gated."],
    "course-scope": ["Course Scope", "Checked Classroom courses and progress refresh scope."],
    "reports-logs": ["Reports & Logs", "Report shortcuts and Command Centre history."],
    settings: ["Settings", "Connect this displayed project to the spreadsheet bridge."]
  };

  const [title, description] = titles[view] || titles.dashboard;
  $("[data-view-title]").textContent = title;
  $("[data-view-description]").textContent = description;
}

function renderStats(container, rows) {
  const icons = ["▣", "◎", "!", "⏱", "✎", "✉"];
  container.innerHTML = rows
    .map(
      (row, index) => `
        <article class="stat-card">
          <div class="stat-icon stat-${index + 1}">${icons[index] || "•"}</div>
          <div>
            <span>${escapeHtml(row.label)}</span>
            <strong>${escapeHtml(row.value)}</strong>
            <em>${escapeHtml(row.detail || "")}</em>
          </div>
        </article>`
    )
    .join("");
}

function renderDashboard() {
  const dashboard = state.dashboard || {};
  renderStats($("[data-dashboard-stats]"), [
    { label: "Active Courses", value: dashboard.activeCourses ?? getCourses().length, detail: "checked courses" },
    { label: "Active Students", value: dashboard.activeStudents ?? 0, detail: "active Master rows" },
    { label: "Under 50%", value: dashboard.underFifty ?? getStudents().filter((student) => student.completionPercent < 50).length, detail: "students" },
    { label: "Missing Past Due", value: dashboard.missingPastDue ?? 0, detail: "items" },
    { label: "Needs Marking", value: dashboard.needsMarking ?? 0, detail: "to mark" },
    { label: "Pending Emails", value: dashboard.pendingEmails ?? 0, detail: "drafts" }
  ]);

  const attentionRows = getStudents().filter((student) => Number(student.pastDue || 0) > 0 || student.noContact).slice(0, 10);
  $("[data-needs-attention]").innerHTML = attentionRows.length
    ? attentionRows
        .map(
          (student) => `
            <tr>
              <td>${escapeHtml(student.name)}</td>
              <td>${escapeHtml(student.course)}</td>
              <td><span class="risk-badge ${normalizeRiskClass(student.risk)}">${escapeHtml(student.risk)}</span></td>
              <td>${escapeHtml(student.recommendedAction)}</td>
            </tr>`
        )
        .join("")
    : `<tr><td colspan="4" class="empty-cell">No students need attention in this view.</td></tr>`;

  $("[data-dashboard-logs]").innerHTML = renderLogItems((state.logs || []).slice(0, 4));
}

function filteredStudents() {
  return getStudents().filter((student) => {
    if (progressCourse !== "All Courses" && student.course !== progressCourse) return false;
    if (progressFilter === "Behind") return Number(student.completionPercent || 0) < 50;
    if (progressFilter === "Missing Past Due") return Number(student.pastDue || 0) > 0;
    if (progressFilter === "Needs Marking") return Number(student.needsMarking || 0) > 0;
    if (progressFilter === "No Contact") return Boolean(student.noContact);
    return true;
  });
}

function renderStudentProgress() {
  const students = getStudents();
  const average = students.length
    ? Math.round(students.reduce((sum, student) => sum + Number(student.completionPercent || 0), 0) / students.length)
    : 0;

  renderStats($("[data-progress-stats]"), [
    { label: "Avg Completion", value: `${average}%` },
    { label: "Students Behind", value: students.filter((student) => Number(student.completionPercent || 0) < 50).length },
    { label: "Missing Past Due", value: students.reduce((sum, student) => sum + Number(student.pastDue || 0), 0) },
    { label: "Needs Marking", value: students.reduce((sum, student) => sum + Number(student.needsMarking || 0), 0) }
  ]);

  const rows = filteredStudents();
  $("[data-progress-table]").innerHTML = rows.length
    ? rows
        .map(
          (student) => `
            <tr>
              <td>${escapeHtml(student.name)}</td>
              <td>${escapeHtml(student.email)}</td>
              <td>${escapeHtml(student.course)}</td>
              <td>${escapeHtml(student.total)}</td>
              <td>${escapeHtml(student.done)}</td>
              <td>${escapeHtml(student.outstanding)}</td>
              <td>${escapeHtml(student.pastDue)}</td>
              <td>${escapeHtml(student.needsMarking)}</td>
              <td>${escapeHtml(student.completionPercent)}%</td>
              <td>${escapeHtml(student.lastSubmission)}</td>
              <td>${escapeHtml(student.lastContact)}</td>
              <td><span class="risk-badge ${normalizeRiskClass(student.risk)}">${escapeHtml(student.risk)}</span></td>
              <td>${escapeHtml(student.recommendedAction)}</td>
            </tr>`
        )
        .join("")
    : `<tr><td colspan="13" class="empty-cell">No matching students.</td></tr>`;
}

function renderAnnouncements() {
  const rows = getAnnouncements();
  const queued = rows.length;
  const ready = rows.filter((row) => row.post && !row.createdId).length;
  const posted = rows.filter((row) => row.createdId).length;

  $("[data-announcement-stats]").innerHTML = [
    ["Queued", queued],
    ["Ready", ready],
    ["Posted", posted]
  ]
    .map(([label, value]) => `<div class="mini-stat"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");

  $("[data-announcement-mode-note]").textContent = bridgeUrl
    ? "Live sheet state can be pulled. Posting still stays with the Apps Script selected-row gate."
    : "Local queue mode is active until an Apps Script bridge URL is connected.";

  $("[data-announcements-table]").innerHTML = rows.length
    ? rows
        .map(
          (row, index) => `
            <tr>
              <td><input type="checkbox" data-announcement-check="${index}" ${row.post ? "checked" : ""}></td>
              <td>${escapeHtml(row.courseName)}</td>
              <td>${escapeHtml(row.courseId)}</td>
              <td>${escapeHtml(row.text)}</td>
              <td>${escapeHtml(row.attachmentLink || "-")}</td>
              <td>${row.publish ? "Yes" : "No"}</td>
              <td>${escapeHtml(row.createdId || "-")}</td>
              <td>${escapeHtml(row.postedAt || "-")}</td>
              <td>${escapeHtml(row.result || "")}</td>
            </tr>`
        )
        .join("")
    : `<tr><td colspan="9" class="empty-cell">No queued announcements yet.</td></tr>`;
}

function renderEmailCentre() {
  const rows = getEmailRows();
  $("[data-email-table]").innerHTML = rows.length
    ? rows
        .map(
          (row, index) => `
            <tr>
              <td><input type="checkbox" data-email-check="${index}" ${row.send ? "checked" : ""}></td>
              <td>${escapeHtml(row.student)}</td>
              <td>${escapeHtml(row.email)}</td>
              <td>${escapeHtml(row.course)}</td>
              <td>${escapeHtml(row.completion)}%</td>
              <td>${escapeHtml(row.pastDue)}</td>
              <td>${escapeHtml(row.needsMarking)}</td>
              <td>${escapeHtml(row.template)}</td>
              <td>${escapeHtml(row.subject)}</td>
              <td>${escapeHtml(row.lastSent || "-")}</td>
              <td>${escapeHtml(row.result || "")}</td>
            </tr>`
        )
        .join("")
    : `<tr><td colspan="11" class="empty-cell">Generate preview rows from a risk group.</td></tr>`;

  const selected = rows.find((row) => row.send) || rows[0];
  $("[data-email-preview-box]").innerHTML = selected
    ? `
      <strong>${escapeHtml(selected.student)}</strong>
      <span>${escapeHtml(selected.email)}</span>
      <span>${escapeHtml(selected.course)}</span>
      <p>${escapeHtml(selected.subject)}</p>
      <span>Template: ${escapeHtml(selected.template)}</span>`
    : `<p class="note">No selected preview row yet.</p>`;
}

function renderCourseScope() {
  $("[data-course-table]").innerHTML = getCourses().length
    ? getCourses()
        .map(
          (course) => `
            <tr>
              <td>${escapeHtml(course.name)}</td>
              <td>${escapeHtml(course.id)}</td>
              <td>${escapeHtml(course.section || "")}</td>
              <td>${course.checked ? "Yes" : "No"}</td>
              <td>${escapeHtml(course.activeStudents ?? "")}</td>
              <td>${escapeHtml(course.behind ?? "")}</td>
              <td>${escapeHtml(course.pendingEmails ?? "")}</td>
              <td>${escapeHtml(course.lastSync || "")}</td>
            </tr>`
        )
        .join("")
    : `<tr><td colspan="8" class="empty-cell">No checked courses loaded.</td></tr>`;
}

function renderLogItems(logs) {
  return logs.length
    ? logs
        .map(
          (log) => `
            <div class="log-item">
              <strong>${escapeHtml(log.action)}</strong>
              <span>${escapeHtml(log.time)}</span>
              <p>${escapeHtml(log.result)}</p>
              <em>${escapeHtml(log.safety)}</em>
            </div>`
        )
        .join("")
    : `<p class="note">No log rows loaded.</p>`;
}

function renderReportsLogs() {
  $("[data-full-log-list]").innerHTML = renderLogItems(state.logs || []);
}

function renderSettings() {
  $("[data-bridge-url]").value = bridgeUrl;
  $("[data-bridge-status-table]").innerHTML = `
    <tr><th>Displayed as project</th><td>Yes</td></tr>
    <tr><th>Bridge URL</th><td>${bridgeUrl ? escapeHtml(bridgeUrl) : "Not set"}</td></tr>
    <tr><th>Data source</th><td>${escapeHtml(state.source || "demo")}</td></tr>
    <tr><th>Spreadsheet</th><td>${escapeHtml(state.spreadsheetName || "Not connected")}</td></tr>
    <tr><th>Generated</th><td>${escapeHtml(state.generatedAt || "Not connected")}</td></tr>
    <tr><th>Live writes</th><td>Kept in Apps Script selected-row gates</td></tr>`;
}

function renderSelects() {
  const courseOptions = [`<option>All Courses</option>`, ...getCourses().map((course) => `<option>${escapeHtml(course.name)}</option>`)].join("");
  $("[data-course-filter]").innerHTML = courseOptions;
  $("[data-email-course-filter]").innerHTML = courseOptions;

  const announcementOptions = getCourses().map((course) => `<option>${escapeHtml(course.name)}</option>`).join("");
  $("[data-announcement-course]").innerHTML = announcementOptions;

  $("[data-progress-filter]").value = progressFilter;
  $("[data-course-filter]").value = progressCourse;
  $("[data-email-group]").value = emailGroup;
  $("[data-email-course-filter]").value = emailCourse;
}

function renderConnection() {
  $("[data-connection-label]").textContent = bridgeUrl
    ? `Bridge set: ${state.spreadsheetName || "waiting for pull"}`
    : "Demo data";
}

function render() {
  renderSelects();
  renderConnection();
  renderDashboard();
  renderStudentProgress();
  renderAnnouncements();
  renderEmailCentre();
  renderCourseScope();
  renderReportsLogs();
  renderSettings();
  setView(activeView);
}

function queueAnnouncementRows() {
  const text = $("[data-announcement-text]").value.trim();
  const attachmentLink = $("[data-announcement-link]").value.trim();
  const mode = $("[data-announcement-target-mode]").value;
  const selectedCourse = $("[data-announcement-course]").value;
  const publish = $("[data-announcement-publish]").checked;

  if (!text) {
    setMessage("Announcement text is required before queueing.", true);
    return;
  }

  const targetCourses =
    mode === "ALL CHECKED COURSES" ? getCourses().filter((course) => course.checked) : getCourses().filter((course) => course.name === selectedCourse);

  const existingKeys = new Set(localAnnouncements.map((row) => `${row.courseId}::${row.text}`));
  const newRows = targetCourses
    .map((course, index) => ({
      id: `local-announcement-${Date.now()}-${index}`,
      post: false,
      courseName: course.name,
      courseId: course.id,
      text,
      attachmentLink,
      publish,
      createdId: "",
      postedAt: "",
      result: bridgeUrl ? "Queued locally. Use Sheet/App Script gate for live post." : "Queued locally."
    }))
    .filter((row) => !existingKeys.has(`${row.courseId}::${row.text}`));

  localAnnouncements = [...localAnnouncements, ...newRows];
  state.announcements = localAnnouncements;
  addLocalLog("Announcement Queue", `Queued ${newRows.length} row${newRows.length === 1 ? "" : "s"}.`, "No live Classroom post from project UI");
  setMessage("Announcement rows queued in this displayed project. Live posting remains in the Apps Script gate.");
  render();
}

function postSelectedAnnouncements() {
  let count = 0;
  localAnnouncements = getAnnouncements().map((row, index) => {
    if (!row.post || row.createdId) return row;
    count += 1;
    return {
      ...row,
      createdId: `local-created-${Date.now()}-${index}`,
      postedAt: new Date().toLocaleString(),
      result: "Marked posted locally. Use Apps Script for live Classroom post."
    };
  });
  state.announcements = localAnnouncements;
  addLocalLog("Announcement Post", count ? `Marked ${count} selected row${count === 1 ? "" : "s"}.` : "No selected rows.", "Local only");
  setMessage("Live posting is intentionally not done from this displayed project yet.");
  render();
}

function generateEmailPreview() {
  const rows = getStudents()
    .filter((student) => emailCourse === "All Courses" || student.course === emailCourse)
    .filter((student) => {
      if (emailGroup === "No Progress") return Number(student.completionPercent || 0) === 0;
      if (emailGroup === "Under 25%") return Number(student.completionPercent || 0) < 25;
      if (emailGroup === "Under 50%") return Number(student.completionPercent || 0) < 50;
      if (emailGroup === "Missing Past Due") return Number(student.pastDue || 0) > 0;
      if (emailGroup === "No Contact") return Boolean(student.noContact);
      if (emailGroup === "Almost Done") return Number(student.completionPercent || 0) >= 75 && Number(student.completionPercent || 0) < 100;
      return true;
    })
    .map((student, index) => ({
      id: `email-preview-${Date.now()}-${index}`,
      send: false,
      student: student.name,
      email: student.email,
      course: student.course,
      completion: student.completionPercent,
      pastDue: student.pastDue,
      needsMarking: student.needsMarking,
      template: Number(student.pastDue || 0) > 0 ? "MISSING_PAST_DUE" : "PROGRESS_CHECK",
      subject: Number(student.pastDue || 0) > 0 ? `Reminder: ${student.course} outstanding work` : `Quick check-in: ${student.course}`,
      lastSent: "Not sent",
      result: "Preview only"
    }));

  localEmailPreview = rows;
  state.emailPreview = rows;
  addLocalLog("Email Preview", `Generated ${rows.length} preview row${rows.length === 1 ? "" : "s"}.`, "Preview only");
  render();
}

function bindEvents() {
  $$("[data-view-button]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.viewButton)));
  $$("[data-open-view]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.openView)));
  $$("[data-refresh-state]").forEach((button) => button.addEventListener("click", () => refreshFromBridge()));
  $("[data-open-settings]").addEventListener("click", () => setView("settings"));
  $("[data-progress-filter]").addEventListener("change", (event) => {
    progressFilter = event.target.value;
    renderStudentProgress();
  });
  $("[data-course-filter]").addEventListener("change", (event) => {
    progressCourse = event.target.value;
    renderStudentProgress();
  });
  $("[data-email-group]").addEventListener("change", (event) => {
    emailGroup = event.target.value;
  });
  $("[data-email-course-filter]").addEventListener("change", (event) => {
    emailCourse = event.target.value;
  });
  $("[data-queue-announcement]").addEventListener("click", queueAnnouncementRows);
  $("[data-post-announcements]").addEventListener("click", postSelectedAnnouncements);
  $("[data-clear-selected-announcements]").addEventListener("click", () => {
    localAnnouncements = getAnnouncements().filter((row) => !row.post);
    state.announcements = localAnnouncements;
    addLocalLog("Announcement Cleanup", "Cleared selected project rows.", "Sheet rows not touched");
    render();
  });
  $("[data-clear-all-announcements]").addEventListener("click", () => {
    localAnnouncements = [];
    state.announcements = [];
    addLocalLog("Announcement Cleanup", "Cleared all project queue rows.", "Sheet rows not touched");
    render();
  });
  $("[data-generate-email-preview]").addEventListener("click", generateEmailPreview);
  $("[data-send-email-preview]").addEventListener("click", () => {
    addLocalLog("Email Send", "Blocked in displayed project. Use Apps Script selected-send gate.", "No email sent");
    setMessage("Email sending stays in the Apps Script selected-preview workflow.", true);
    render();
  });
  $("[data-save-bridge-url]").addEventListener("click", () => {
    bridgeUrl = $("[data-bridge-url]").value.trim();
    localStorage.setItem(STORAGE_KEY, bridgeUrl);
    refreshFromBridge();
  });
  $("[data-test-bridge-url]").addEventListener("click", () => {
    bridgeUrl = $("[data-bridge-url]").value.trim();
    if (bridgeUrl) localStorage.setItem(STORAGE_KEY, bridgeUrl);
    refreshFromBridge();
  });
  $("[data-clear-bridge-url]").addEventListener("click", () => {
    bridgeUrl = "";
    localStorage.removeItem(STORAGE_KEY);
    refreshFromBridge();
  });

  document.addEventListener("change", (event) => {
    const announcementIndex = event.target.dataset ? event.target.dataset.announcementCheck : undefined;
    const emailIndex = event.target.dataset ? event.target.dataset.emailCheck : undefined;
    if (announcementIndex !== undefined) {
      const rows = getAnnouncements();
      rows[Number(announcementIndex)].post = event.target.checked;
      localAnnouncements = rows;
      state.announcements = rows;
      renderAnnouncements();
    }
    if (emailIndex !== undefined) {
      const rows = getEmailRows();
      rows[Number(emailIndex)].send = event.target.checked;
      localEmailPreview = rows;
      state.emailPreview = rows;
      renderEmailCentre();
    }
  });
}

bindEvents();
refreshFromBridge(false);
