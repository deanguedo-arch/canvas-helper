import courseShellData from "./course-shell-data.js";

const STORAGE_KEY = `${courseShellData.storageKey}::forensics-layout::v3`;
const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root for course shell.");
}

const state = loadState();
ensureSelection();
injectStyles();
render();

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      selectedModuleId: typeof parsed.selectedModuleId === "string" ? parsed.selectedModuleId : "",
      completed: parsed.completed && typeof parsed.completed === "object" ? parsed.completed : {}
    };
  } catch {
    return {
      selectedModuleId: "",
      completed: {}
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function ensureSelection() {
  const firstModule = courseShellData.modules?.[0];
  if (!state.selectedModuleId || !courseShellData.modules.some((module) => module.id === state.selectedModuleId)) {
    state.selectedModuleId = firstModule?.id ?? "";
  }
  saveState();
}

function getSelectedModule() {
  return courseShellData.modules.find((module) => module.id === state.selectedModuleId) ?? courseShellData.modules[0];
}

function setSelectedModule(moduleId) {
  state.selectedModuleId = moduleId;
  saveState();
  render();
}

function isComplete(activityId) {
  return Boolean(state.completed?.[activityId]);
}

function setActivityDone(activityId, done) {
  state.completed = {
    ...(state.completed || {}),
    [activityId]: Boolean(done)
  };
  saveState();
  render();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function clamp(value, max = 180) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) {
    return "";
  }

  if (text.length <= max) {
    return text;
  }

  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function prettyKind(kind) {
  return String(kind || "other")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function moduleProgress(module) {
  const trackable = module.activities.filter((activity) => activity.kind !== "overview");
  const done = trackable.filter((activity) => isComplete(activity.id)).length;
  return { done, total: trackable.length };
}

function overallProgress() {
  const all = courseShellData.modules.flatMap((module) => module.activities.filter((activity) => activity.kind !== "overview"));
  const done = all.filter((activity) => isComplete(activity.id)).length;
  return { done, total: all.length };
}

function isAssignment(activity) {
  const kind = String(activity?.kind || "").toLowerCase();
  const resourceKind = String(activity?.resourceKind || "").toLowerCase();
  const renderHint = String(activity?.renderHint || "").toLowerCase();

  return kind === "assessment" || resourceKind === "assignment" || resourceKind === "quiz" || renderHint === "assessment";
}

function getModuleBuckets(module) {
  const activities = module?.activities || [];
  const assignments = activities.filter((activity) => isAssignment(activity));
  const content = activities.filter((activity) => {
    if (isAssignment(activity)) {
      return false;
    }

    return String(activity?.kind || "").toLowerCase() !== "overview";
  });

  return { content, assignments };
}

function injectStyles() {
  if (document.getElementById("ep-shell-style")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "ep-shell-style";
  style.textContent = `
    :root {
      --line: rgba(255, 255, 255, 0.1);
      --line-strong: rgba(220, 38, 38, 0.45);
      --text: #f3f4f6;
      --muted: #a1a8b3;
      --accent-soft: #fecaca;
      --shadow: 0 20px 45px rgba(0, 0, 0, 0.45);
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      min-height: 100%;
      background:
        radial-gradient(circle at 10% 0%, rgba(185, 28, 28, 0.18), transparent 42%),
        linear-gradient(180deg, #0a0b0d 0%, #101216 56%, #090a0d 100%);
      color: var(--text);
      font-family: "Manrope", "Inter", "Segoe UI", sans-serif;
    }

    .app {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 340px minmax(0, 1fr);
    }

    .sidebar {
      border-right: 1px solid var(--line);
      background: linear-gradient(180deg, #12151d 0%, #10131a 100%);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      position: sticky;
      top: 0;
    }

    .brand {
      padding: 1.15rem 1rem 1rem;
      border-bottom: 1px solid var(--line);
    }

    .overline {
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 0.68rem;
      color: var(--accent-soft);
      font-weight: 800;
    }

    .brand h1 {
      margin: 0.45rem 0 0;
      font-size: 1rem;
      line-height: 1.35;
      font-weight: 700;
      font-family: "Space Grotesk", "Manrope", sans-serif;
    }

    .progress-wrap {
      margin-top: 0.9rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 0.7rem;
    }

    .progress-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.78rem;
      color: var(--muted);
      font-weight: 700;
    }

    .progress-bar {
      margin-top: 0.45rem;
      height: 8px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      overflow: hidden;
    }

    .progress-bar > span {
      display: block;
      height: 100%;
      background: linear-gradient(90deg, #7f1d1d, #dc2626);
    }

    .module-list {
      padding: 0.9rem;
      overflow: auto;
      display: grid;
      gap: 0.65rem;
    }

    .module-btn {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: #141821;
      color: var(--text);
      text-align: left;
      padding: 0.65rem;
      cursor: pointer;
      transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
      box-shadow: 0 12px 26px rgba(0, 0, 0, 0.3);
    }

    .module-btn:hover {
      border-color: rgba(255, 255, 255, 0.23);
      background: #171b24;
    }

    .module-btn.active {
      border-color: var(--line-strong);
      background: linear-gradient(180deg, rgba(185, 28, 28, 0.2), rgba(20, 24, 33, 1));
      transform: translateY(-1px);
    }

    .module-btn h3 {
      margin: 0;
      font-size: 0.86rem;
      line-height: 1.35;
      font-weight: 700;
    }

    .module-btn p {
      margin: 0.38rem 0 0;
      font-size: 0.74rem;
      line-height: 1.42;
      color: var(--muted);
    }

    .meta-row {
      margin-top: 0.45rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.28rem;
    }

    .pill {
      font-size: 0.66rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border-radius: 999px;
      border: 1px solid var(--line);
      color: var(--muted);
      padding: 0.14rem 0.4rem;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.04);
      white-space: nowrap;
    }

    .main {
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .topbar {
      position: sticky;
      top: 0;
      z-index: 8;
      border-bottom: 1px solid var(--line);
      background: rgba(16, 18, 22, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.38);
    }

    .topbar-inner {
      padding: 0.95rem 1.15rem;
      display: flex;
      justify-content: space-between;
      gap: 0.8rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .topbar h2 {
      margin: 0.14rem 0 0;
      font-size: clamp(1.1rem, 2vw, 1.4rem);
      line-height: 1.25;
      font-weight: 700;
      font-family: "Space Grotesk", "Manrope", sans-serif;
    }

    .topbar p {
      margin: 0;
      color: var(--muted);
      font-size: 0.83rem;
    }

    .stats {
      display: flex;
      gap: 0.45rem;
      flex-wrap: wrap;
    }

    .stat {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 0.34rem 0.62rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--muted);
      background: rgba(255, 255, 255, 0.03);
      white-space: nowrap;
    }

    .stat strong {
      color: var(--text);
      margin-right: 0.22rem;
    }

    .content {
      padding: 1rem 1.1rem 1.15rem;
    }

    .panel {
      border: 1px solid var(--line);
      border-radius: 16px;
      background: linear-gradient(180deg, rgba(20, 24, 33, 0.95), rgba(15, 18, 24, 0.95));
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .panel-head {
      border-bottom: 1px solid var(--line);
      padding: 0.85rem 0.9rem;
      background: rgba(0, 0, 0, 0.15);
    }

    .panel-head h3 {
      margin: 0;
      font-size: 0.82rem;
      letter-spacing: 0.13em;
      text-transform: uppercase;
      color: #fee2e2;
      font-weight: 800;
    }

    .panel-head p {
      margin: 0.34rem 0 0;
      font-size: 0.77rem;
      color: var(--muted);
      line-height: 1.45;
    }

    .stack {
      display: grid;
      gap: 0.8rem;
    }

    .list {
      padding: 0.75rem;
      display: grid;
      gap: 0.62rem;
      max-height: min(46vh, 420px);
      overflow: auto;
    }

    .activity {
      border: 1px solid var(--line);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.02);
      color: var(--text);
      padding: 0.68rem;
    }

    .activity-head {
      display: flex;
      justify-content: space-between;
      gap: 0.6rem;
      align-items: flex-start;
    }

    .activity h4 {
      margin: 0;
      font-size: 0.86rem;
      line-height: 1.38;
      font-weight: 700;
    }

    .activity p {
      margin: 0.42rem 0 0;
      color: var(--muted);
      font-size: 0.75rem;
      line-height: 1.45;
    }

    .status {
      border-radius: 999px;
      border: 1px solid var(--line);
      font-size: 0.62rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.16rem 0.42rem;
      color: var(--muted);
      font-weight: 800;
      white-space: nowrap;
    }

    .status.done {
      color: #dcfce7;
      border-color: rgba(34, 197, 94, 0.5);
      background: rgba(22, 101, 52, 0.35);
    }

    .row-actions {
      margin-top: 0.58rem;
      display: flex;
      gap: 0.42rem;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
    }

    .btn {
      border-radius: 10px;
      border: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.04);
      color: var(--text);
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.42rem 0.58rem;
      cursor: pointer;
    }

    .btn.primary {
      border-color: rgba(220, 38, 38, 0.6);
      background: linear-gradient(135deg, #7f1d1d, #dc2626);
      color: #fef2f2;
    }

    .empty {
      border: 1px dashed var(--line);
      border-radius: 12px;
      padding: 1.1rem;
      color: var(--muted);
      font-size: 0.82rem;
      text-align: center;
      background: rgba(255, 255, 255, 0.02);
    }

    @media (max-width: 860px) {
      .app {
        grid-template-columns: 1fr;
      }

      .sidebar {
        position: static;
        min-height: auto;
        border-right: 0;
        border-bottom: 1px solid var(--line);
      }

      .module-list {
        max-height: 260px;
      }

      .list {
        max-height: 420px;
      }
    }
  `;
  document.head.appendChild(style);
}

function renderModuleButton(module, active) {
  const progress = moduleProgress(module);

  return `
    <button class="module-btn ${active ? "active" : ""}" data-module="${escapeHtml(module.id)}" type="button">
      <div class="overline">${escapeHtml(module.overline || "Module")}</div>
      <h3>${escapeHtml(module.title)}</h3>
      <p>${escapeHtml(clamp(module.summary || "Imported course section.", 92))}</p>
      <div class="meta-row">
        <span class="pill">${progress.done}/${progress.total} done</span>
        <span class="pill">${module.lessonCount} lessons</span>
        <span class="pill">${module.assessmentCount} assignments</span>
      </div>
    </button>
  `;
}

function renderActivityCard(activity) {
  const done = isComplete(activity.id);

  return `
    <article class="activity">
      <div class="activity-head">
        <h4>${escapeHtml(activity.title)}</h4>
        <span class="status ${done ? "done" : ""}">${done ? "done" : "pending"}</span>
      </div>
      <p>${escapeHtml(clamp(activity.contentPreview || activity.description || "No preview available", 180))}</p>
      <div class="row-actions">
        <div class="meta-row">
          <span class="pill">${escapeHtml(prettyKind(activity.kind))}</span>
          <span class="pill">${escapeHtml(activity.resourceKind)}</span>
        </div>
        <button class="btn primary" type="button" data-toggle-complete="${escapeHtml(activity.id)}">${done ? "Mark Incomplete" : "Mark Complete"}</button>
      </div>
    </article>
  `;
}

function renderCurrentView(module) {
  const { content, assignments } = getModuleBuckets(module);

  return `
    <div class="stack">
      <section class="panel">
        <div class="panel-head">
          <h3>Module Content</h3>
          <p>${escapeHtml(module?.summary || courseShellData.overview)}</p>
        </div>
        <div class="list" data-testid="module-content-view">
          ${
            content.length
              ? content.map((item) => renderActivityCard(item)).join("")
              : `<div class="empty">No content found in this module.</div>`
          }
        </div>
      </section>
      <section class="panel" data-testid="module-assignments-tab">
        <div class="panel-head">
          <h3>Assignments</h3>
          <p>Assessment items for this module are grouped below the module content.</p>
        </div>
        <div class="list" data-testid="module-assignments-view">
          ${
            assignments.length
              ? assignments.map((item) => renderActivityCard(item)).join("")
              : `<div class="empty">No assignments found in this module.</div>`
          }
        </div>
      </section>
    </div>
  `;
}

function render() {
  const module = getSelectedModule();
  const progress = overallProgress();
  const progressPct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  root.innerHTML = `
    <div class="app">
      <aside class="sidebar">
        <div class="brand">
          <div class="overline">Case file</div>
          <h1>${escapeHtml(courseShellData.title)}</h1>
          <div class="progress-wrap">
            <div class="progress-head">
              <span>Progress</span>
              <span>${progressPct}%</span>
            </div>
            <div class="progress-bar"><span style="width:${progressPct}%"></span></div>
          </div>
        </div>

        <div class="module-list" data-testid="module-list">
          ${courseShellData.modules.map((item) => renderModuleButton(item, item.id === module?.id)).join("")}
        </div>
      </aside>

      <section class="main">
        <header class="topbar">
          <div class="topbar-inner">
            <div>
              <p>${escapeHtml(module?.overline || "Module")}</p>
              <h2>${escapeHtml(module?.title || "Course")}</h2>
            </div>
            <div class="stats">
              <span class="stat"><strong>${courseShellData.stats.moduleCount}</strong>modules</span>
              <span class="stat"><strong>${courseShellData.stats.activityCount}</strong>activities</span>
              <span class="stat"><strong>${progress.done}/${progress.total}</strong>completed</span>
            </div>
          </div>
        </header>

        <div class="content">
          ${renderCurrentView(module)}
        </div>
      </section>
    </div>
  `;

  root.querySelectorAll("[data-module]").forEach((btn) => {
    btn.addEventListener("click", () => setSelectedModule(btn.getAttribute("data-module") || ""));
  });

  root.querySelectorAll("[data-toggle-complete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const activityId = btn.getAttribute("data-toggle-complete") || "";
      setActivityDone(activityId, !isComplete(activityId));
    });
  });
}
