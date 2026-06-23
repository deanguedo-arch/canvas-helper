export type NextStepShellLesson = {
  id: string;
  title: string;
  summary: string;
  html: string;
  group?: string;
  entry?: string;
  excerpt?: string;
};

export type NextStepShellNavItem = {
  id: string;
  label: string;
  icon: string;
  html: string;
};

export type NextStepShellNavGroup = {
  id: string;
  label: string;
  icon: string;
  html: string;
  items: NextStepShellNavItem[];
};

export type NextStepCourseShellOptions = {
  slug: string;
  courseTitle: string;
  courseCode: string;
  overviewIntro: string;
  outcomes: string[];
  lessons: NextStepShellLesson[];
  navGroups?: NextStepShellNavGroup[];
  navItems?: NextStepShellNavItem[];
  lessonGroupTitle?: string;
  lessonSequenceTitle?: string;
  sourceLessonLabel?: string;
  nextAfterLastLesson?: { id: string; label: string };
  logoPath?: string;
  storageKeyBase?: string;
  extraHeadHtml?: string;
  extraCss?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function scriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function renderSubnav(lessons: NextStepShellLesson[]) {
  return lessons
    .map(
      (lesson, index) =>
        `<a class="sublesson-link" href="#${escapeHtml(lesson.id)}" data-page-target="${escapeHtml(lesson.id)}">${index + 1}. ${escapeHtml(lesson.title)}</a>`
    )
    .join("\n");
}

function renderNavGroup(group: NextStepShellNavGroup) {
  return `<div class="nav-group" data-nav-group="${escapeHtml(group.id)}">
        <a class="course-nav-link nav-group-toggle" href="#${escapeHtml(group.id)}" data-page-target="${escapeHtml(group.id)}" data-nav-group-toggle="${escapeHtml(group.id)}" aria-expanded="false" aria-controls="${escapeHtml(group.id)}-subnav">
          <span class="material-symbols-outlined" aria-hidden="true">${escapeHtml(group.icon)}</span>
          <span class="sidebar-label">${escapeHtml(group.label)}</span>
          <span class="material-symbols-outlined lessons-toggle-icon nav-group-icon" aria-hidden="true">expand_more</span>
        </a>
        <div id="${escapeHtml(group.id)}-subnav" class="lesson-subnav nav-group-subnav">
          ${group.items
            .map(
              (item, index) =>
                `<a class="sublesson-link" href="#${escapeHtml(item.id)}" data-page-target="${escapeHtml(item.id)}">${index + 1}. ${escapeHtml(item.label)}</a>`
            )
            .join("\n")}
        </div>
      </div>`;
}

function renderSidebar(options: NextStepCourseShellOptions) {
  const navGroups = (options.navGroups ?? []).map((group) => renderNavGroup(group)).join("\n");
  const extraNav = (options.navItems ?? [])
    .map(
      (item) => `<a class="course-nav-link" href="#${escapeHtml(item.id)}" data-page-target="${escapeHtml(item.id)}">
        <span class="material-symbols-outlined" aria-hidden="true">${escapeHtml(item.icon)}</span>
        <span class="sidebar-label">${escapeHtml(item.label)}</span>
      </a>`
    )
    .join("\n");

  return `<aside class="course-sidebar" aria-label="Course sidebar">
    <div class="sidebar-header">
      <button id="sidebar-toggle" class="sidebar-toggle-button" type="button" aria-label="Toggle sidebar">
        <span class="material-symbols-outlined" aria-hidden="true">dock_to_left</span>
      </button>
      <h1 class="sidebar-title">${escapeHtml(options.courseTitle)}</h1>
      <p class="sidebar-course-label">${escapeHtml(options.courseCode)}</p>
    </div>
    <nav class="course-nav" aria-label="Course navigation">
      <a class="course-nav-link active" href="#overview" data-page-target="overview">
        <span class="material-symbols-outlined" aria-hidden="true">dashboard</span>
        <span class="sidebar-label">Overview</span>
      </a>
      <div class="lessons-nav">
        <a class="course-nav-link lessons-toggle" href="#lessons" data-page-target="lessons" data-lessons-toggle aria-expanded="false" aria-controls="lesson-subnav">
          <span class="material-symbols-outlined" aria-hidden="true">menu_book</span>
          <span class="sidebar-label">Lessons</span>
          <span class="material-symbols-outlined lessons-toggle-icon" aria-hidden="true">expand_more</span>
        </a>
        <div id="lesson-subnav" class="lesson-subnav">${renderSubnav(options.lessons)}</div>
      </div>
      ${navGroups}
      ${extraNav}
    </nav>
  </aside>`;
}

function renderTopbar(options: NextStepCourseShellOptions) {
  const logoPath = options.logoPath ?? "assets/brand/nxt-ce-logo-white-with-ce.png";
  return `<header class="course-topbar">
    <button id="topbar-menu-toggle" class="topbar-menu-toggle" type="button" aria-label="Toggle menu">
      <span class="material-symbols-outlined" aria-hidden="true">dock_to_left</span>
    </button>
    <a class="topbar-logo-link" href="#overview" data-page-target="overview" aria-label="Next Step home">
      <img class="next-step-logo" src="${escapeHtml(logoPath)}" alt="Next Step Continuing Education">
    </a>
    <div class="top-progress-shell" aria-label="Course progress">
      <div class="top-progress-meta">
        <span>Course Progress</span>
        <strong data-progress-count>0 / ${options.lessons.length} lessons</strong>
        <strong data-progress-percent>0%</strong>
      </div>
      <div class="top-progress-bar"><div class="top-progress-fill" data-progress-fill></div></div>
    </div>
  </header>`;
}

function renderOverview(options: NextStepCourseShellOptions) {
  const firstLesson = options.lessons[0];
  const sourceLessonLabel = options.sourceLessonLabel ?? "source lessons";
  return `<section id="overview" class="course-page">
    <p class="course-kicker">${escapeHtml(options.courseCode)} | Unit Frame</p>
    <h2>${escapeHtml(options.courseTitle)}</h2>
    <p class="page-intro">${escapeHtml(options.overviewIntro)}</p>
    <section class="unit-outcomes" aria-labelledby="outcomes-title">
      <h3 id="outcomes-title" class="unit-outcomes-lead">I can...</h3>
      <ul class="unit-focus-list">
        ${options.outcomes.map((outcome) => `<li>${escapeHtml(outcome.replace(/^I can\s+/i, ""))}</li>`).join("\n")}
      </ul>
    </section>
    <div class="overview-actions" aria-label="Course status and actions">
      <span class="completed-pill"><strong data-progress-count-inline>0/${options.lessons.length}</strong> lessons complete</span>
      <span class="completed-pill">${options.lessons.length} ${escapeHtml(sourceLessonLabel)}</span>
      ${firstLesson ? `<a class="external-resource-action" href="#${escapeHtml(firstLesson.id)}" data-page-target="${escapeHtml(firstLesson.id)}">Open Lesson Frame</a>` : ""}
    </div>
  </section>`;
}

function renderLessonIndexCard(lesson: NextStepShellLesson, index: number) {
  return `<a class="lesson-card" href="#${escapeHtml(lesson.id)}" data-page-target="${escapeHtml(lesson.id)}">
    <span>Lesson ${index + 1}</span>
    <strong>${escapeHtml(lesson.title)}</strong>
    <p>${escapeHtml(lesson.summary)}</p>
  </a>`;
}

function getLessonIndexGroups(options: NextStepCourseShellOptions) {
  const fallbackTitle = options.lessonGroupTitle ?? options.courseTitle;
  const groups = new Map<string, { title: string; lessons: Array<{ lesson: NextStepShellLesson; index: number }> }>();

  options.lessons.forEach((lesson, index) => {
    const title = lesson.group?.trim() || fallbackTitle;
    const existing = groups.get(title) ?? { title, lessons: [] };
    existing.lessons.push({ lesson, index });
    groups.set(title, existing);
  });

  return Array.from(groups.values());
}

function renderLessonsIndex(options: NextStepCourseShellOptions) {
  const lessonSequenceTitle = options.lessonSequenceTitle ?? `${options.courseTitle} Lesson Sequence`;
  const lessonGroups = getLessonIndexGroups(options);
  return `<section id="lessons" class="course-page" hidden>
    <p class="course-kicker">${escapeHtml(options.courseCode)} | Lessons</p>
    <h2>${escapeHtml(lessonSequenceTitle)}</h2>
    <div class="resource-stack">
      ${lessonGroups
        .map(
          (group, groupIndex) => `<details class="resource-lesson-group"${groupIndex === 0 ? " open" : ""}>
          <summary class="resource-lesson-summary">
            <span class="resource-lesson-label">
              <span class="resource-lesson-kicker">Lesson Group</span>
              ${escapeHtml(group.title)}
            </span>
            <span class="resource-lesson-icon" aria-hidden="true">+</span>
          </summary>
          <div class="resource-lesson-items">
            ${group.lessons.map(({ lesson, index }) => renderLessonIndexCard(lesson, index)).join("\n")}
          </div>
        </details>`
        )
        .join("\n")}
    </div>
  </section>`;
}

function renderLessonPanel(
  lesson: NextStepShellLesson,
  lessons: NextStepShellLesson[],
  index: number,
  options: NextStepCourseShellOptions
) {
  const previous = lessons[index - 1];
  const next = lessons[index + 1];
  const finalNext = options.nextAfterLastLesson;
  const nextAction = next
    ? `<a class="lesson-jump primary" href="#${escapeHtml(next.id)}" data-page-target="${escapeHtml(next.id)}">Next Lesson</a>`
    : finalNext
      ? `<a class="lesson-jump primary" href="#${escapeHtml(finalNext.id)}" data-page-target="${escapeHtml(finalNext.id)}">${escapeHtml(finalNext.label)}</a>`
      : "";

  return `<section id="${escapeHtml(lesson.id)}" class="course-page lesson-page" hidden>
    <article class="lesson-detail-panel">
      <header class="lesson-document-header">
        <p>Lesson ${index + 1}</p>
        <h2>${escapeHtml(lesson.title)}</h2>
        <span>${escapeHtml(lesson.summary)}</span>
      </header>
      <div class="lesson-reader-panel">
        <div class="source-content">${lesson.html}</div>
        <div class="lesson-bottom-bar">
          ${previous ? `<a class="lesson-jump" href="#${escapeHtml(previous.id)}" data-page-target="${escapeHtml(previous.id)}">Previous</a>` : `<a class="lesson-jump" href="#lessons" data-page-target="lessons">Lesson Library</a>`}
          ${nextAction}
          <button class="lesson-jump primary mark-complete" type="button" data-complete-id="${escapeHtml(lesson.id)}">Complete</button>
        </div>
      </div>
    </article>
  </section>`;
}

function renderShellCss(extraCss = "") {
  return `<style>
:root {
  --ink: #191c1d;
  --ink-dark: #171b1b;
  --primary: #154212;
  --primary-strong: #0e3510;
  --surface: #ffffff;
  --surface-low: #f8f9fa;
  --surface-soft: #f4f6f0;
  --surface-muted: #d9dadb;
  --surface-variant: #c5c9c1;
  --text-muted: #444d42;
  --topbar-height: 64px;
  --sidebar-width: 18rem;
  --sidebar-rail: 76px;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  color: var(--ink);
  background: #fff;
  font-family: "Work Sans", "Aptos", "Helvetica Neue", sans-serif;
  font-size: 16px;
  line-height: 1.55;
}
a { color: inherit; }
button, input, select, textarea { font: inherit; }
.material-symbols-outlined { font-size: 24px; line-height: 1; }
.course-topbar {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 50;
  height: var(--topbar-height);
  background: var(--ink-dark);
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,.12);
}
.topbar-logo-link {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
}
.next-step-logo { display: block; width: 112px; height: auto; }
.topbar-menu-toggle {
  display: none;
  position: absolute;
  left: 14px;
  top: 10px;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 8px;
  background: #2b302f;
  color: #fff;
  cursor: pointer;
}
.top-progress-shell {
  position: absolute;
  right: 24px;
  top: 13px;
  width: min(360px, 34vw);
}
.top-progress-meta {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  align-items: center;
  margin-bottom: 5px;
  color: #fff;
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}
.top-progress-meta strong { color: #c8f5bc; }
.top-progress-bar {
  height: 9px;
  border: 1px solid #355d33;
  border-radius: 999px;
  background: #233123;
  overflow: hidden;
}
.top-progress-fill { width: 0; height: 100%; background: #7dbc72; transition: width .18s ease; }
.course-sidebar {
  position: fixed;
  z-index: 40;
  top: var(--topbar-height);
  bottom: 0;
  left: 0;
  width: var(--sidebar-width);
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--ink-dark);
  color: #eef3eb;
}
.sidebar-header {
  position: relative;
  padding: 22px 20px 18px;
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.sidebar-title {
  margin: 0;
  max-width: 190px;
  color: #fff;
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: 28px;
  line-height: 1.05;
  font-weight: 800;
}
.sidebar-course-label { margin: 6px 0 0; color: #cfd6cd; font-size: 13px; font-weight: 700; }
.sidebar-toggle-button {
  position: absolute;
  right: 14px;
  top: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 8px;
  background: #2b302f;
  color: #fff;
  cursor: pointer;
}
.course-nav { display: flex; flex-direction: column; gap: 6px; padding: 12px; }
.course-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 10px 12px;
  border-radius: 8px;
  color: #eef3eb;
  text-decoration: none;
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 15px;
  font-weight: 700;
}
.course-nav-link:hover,
.course-nav-link.active { background: #303432; color: #fff; }
.lessons-toggle-icon { margin-left: auto; transition: transform .16s ease; }
.lessons-nav.is-open .lessons-toggle-icon,
.nav-group.is-open .nav-group-icon { transform: rotate(180deg); }
.lesson-subnav {
  display: none;
  margin: 4px 8px 8px 48px;
}
.lessons-nav.is-open .lesson-subnav,
.nav-group.is-open .lesson-subnav { display: grid; gap: 4px; }
.sublesson-link {
  display: block;
  padding: 7px 0;
  color: #dbe2d8;
  text-decoration: none;
  font-size: 13px;
  line-height: 1.35;
}
.sublesson-link:hover,
.sublesson-link.active { color: #fff; }
.course-main {
  min-height: 100vh;
  margin-left: var(--sidebar-width);
  padding: 96px 28px 76px;
}
.course-frame {
  width: min(1120px, calc(100vw - 360px));
  margin: 0 auto;
}
.course-page > h2 {
  margin: 0;
  color: var(--ink);
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: clamp(40px, 5vw, 58px);
  line-height: 1;
  font-weight: 800;
  letter-spacing: -.04em;
}
.course-kicker {
  margin: 0 0 8px;
  color: #596157;
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 14px;
  font-weight: 700;
}
.page-intro {
  max-width: 800px;
  margin: 14px 0 0;
  color: #3f473f;
  font-size: 19px;
}
.unit-outcomes { margin-top: 28px; max-width: 800px; }
.unit-outcomes-lead {
  margin: 0 0 12px;
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: 25px;
  line-height: 1.2;
}
.unit-focus-list {
  display: grid;
  gap: 9px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.unit-focus-list li {
  padding: 10px 14px;
  border-left: 3px solid var(--primary);
  background: var(--surface-low);
}
.overview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  margin-top: 44px;
}
.completed-pill {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 14px;
  border: 1px solid var(--surface-muted);
  border-radius: 8px;
  background: #fff;
  color: #334033;
}
.completed-pill strong { color: var(--primary); margin-right: 4px; }
.external-resource-action,
.lesson-jump {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 10px 16px;
  border: 1px solid #b7c4b2;
  border-radius: 8px;
  background: #fff;
  color: var(--primary);
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}
.external-resource-action,
.lesson-jump.primary {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
}
.resource-stack { display: grid; gap: 16px; margin-top: 28px; }
.resource-lesson-group {
  overflow: hidden;
  border: 1px solid var(--surface-muted);
  border-radius: 10px;
  background: #fff;
}
.resource-lesson-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 20px 24px;
  cursor: pointer;
  list-style: none;
  border-left: 3px solid var(--primary);
}
.resource-lesson-summary::-webkit-details-marker { display: none; }
.resource-lesson-label { font-family: "Hanken Grotesk", "Aptos Display", sans-serif; font-size: 22px; font-weight: 800; }
.resource-lesson-kicker {
  display: block;
  margin-bottom: 3px;
  color: #596157;
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 12px;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.resource-lesson-icon { font-size: 30px; font-weight: 800; line-height: 1; }
.resource-lesson-group[open] .resource-lesson-icon { transform: rotate(45deg); }
.resource-lesson-items { display: grid; gap: 12px; padding: 0 24px 24px; }
.lesson-card {
  display: grid;
  gap: 6px;
  padding: 18px;
  border: 1px solid var(--surface-muted);
  border-radius: 8px;
  background: #fff;
  color: inherit;
  text-decoration: none;
}
.lesson-card:hover { border-color: #9eb09a; background: #fbfcfa; }
.lesson-card span { color: var(--primary); font-family: "IBM Plex Sans", "Aptos", sans-serif; font-size: 14px; font-weight: 700; }
.lesson-card strong { font-family: "Hanken Grotesk", "Aptos Display", sans-serif; font-size: 21px; line-height: 1.18; }
.lesson-card p { margin: 0; color: #556052; }
.lesson-detail-panel {
  overflow: hidden;
  border: 1px solid var(--surface-muted);
  border-radius: 10px;
  background: #fff;
}
.lesson-document-header {
  padding: 34px 38px;
  border-top: 4px solid var(--primary);
  background: #fff;
}
.lesson-document-header p {
  margin: 0 0 8px;
  color: var(--primary);
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-weight: 700;
}
.lesson-document-header h2 {
  margin: 0;
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: clamp(34px, 4.2vw, 48px);
  line-height: 1.02;
  letter-spacing: -.035em;
}
.lesson-document-header span {
  display: block;
  max-width: 760px;
  margin-top: 12px;
  color: #445044;
  font-size: 18px;
}
.lesson-reader-panel {
  padding: 42px 52px 36px;
  background: #f1f2ef;
}
.source-content {
  max-width: 820px;
  margin: 0 auto;
  color: #202520;
}
.source-content h1,
.source-content h2,
.source-content h3 {
  margin: 1.35em 0 .45em;
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  line-height: 1.15;
}
.source-content h1 { font-size: 34px; }
.source-content h2 { font-size: 29px; }
.source-content h3 { font-size: 24px; }
.source-content p { margin: 0 0 1em; }
.source-content ul,
.source-content ol { margin: .75em 0 1em 1.35em; padding: 0; }
.source-content img,
.source-image {
  max-width: 100%;
  height: auto;
  border: 1px solid var(--surface-muted);
  border-radius: 8px;
}
.source-table {
  width: 100%;
  margin: 18px 0;
  border-collapse: collapse;
  background: #fff;
}
.source-table th,
.source-table td {
  padding: 10px 12px;
  border: 1px solid var(--surface-muted);
  text-align: left;
  vertical-align: top;
}
.source-note,
.source-path { color: #596157; }
.lesson-bottom-bar {
  max-width: 820px;
  margin: 34px auto 0;
  padding-top: 18px;
  border-top: 1px solid var(--surface-muted);
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.lesson-bottom-bar .mark-complete { margin-left: auto; }
.guide-grid,
.studio-layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 28px;
}
.work-card,
.resource-panel,
.resource-card {
  padding: 22px;
  border: 1px solid var(--surface-muted);
  border-radius: 10px;
  background: #fbfbf8;
}
.work-card h3,
.resource-card h3 {
  margin: 0 0 10px;
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: 25px;
  line-height: 1.15;
}
.work-card p,
.resource-card p { color: #465046; }
label { display: grid; gap: 8px; color: var(--primary); font-family: "IBM Plex Sans", "Aptos", sans-serif; font-weight: 700; }
textarea,
select,
input {
  width: 100%;
  border: 1px solid #b9c5b1;
  border-radius: 8px;
  background: #fff;
  color: var(--ink);
  padding: 12px 14px;
}
textarea { min-height: 118px; resize: vertical; }
textarea:focus,
select:focus,
input:focus,
button:focus-visible,
a:focus-visible {
  outline: 3px solid rgba(21,66,18,.2);
  outline-offset: 2px;
  border-color: var(--primary);
}
.save-status { color: #596157; font-size: 14px; }
.resource-panel { max-width: 520px; margin: 24px 0 16px; }
.resource-card { margin-top: 12px; }
body.sidebar-collapsed .course-sidebar { width: var(--sidebar-rail); }
body.sidebar-collapsed .course-main { margin-left: var(--sidebar-rail); }
body.sidebar-collapsed .sidebar-title,
body.sidebar-collapsed .sidebar-course-label,
body.sidebar-collapsed .sidebar-label,
body.sidebar-collapsed .lesson-subnav,
body.sidebar-collapsed .lessons-toggle-icon { display: none !important; }
body.sidebar-collapsed .lessons-nav.is-open .lesson-subnav,
body.sidebar-collapsed .nav-group.is-open .lesson-subnav { display: none !important; }
body.sidebar-collapsed .sidebar-header { padding: 12px 8px; display: flex; justify-content: center; }
body.sidebar-collapsed .sidebar-toggle-button { position: static; }
body.sidebar-collapsed .course-nav { padding: 8px; }
body.sidebar-collapsed .course-nav-link {
  width: 52px;
  min-height: 52px;
  margin: 0 auto;
  padding: 0;
  justify-content: center;
  gap: 0;
}
@media (max-width: 1100px) {
  .topbar-menu-toggle { display: inline-flex; align-items: center; justify-content: center; }
  .top-progress-shell { right: 14px; width: min(280px, 42vw); }
  body.sidebar-collapsed .course-sidebar,
  .course-sidebar { display: none; }
  body:not(.sidebar-collapsed) .course-sidebar {
    display: block;
    right: 0;
    width: 100%;
    bottom: auto;
    max-height: 230px;
    border-bottom: 1px solid rgba(255,255,255,.12);
  }
  body:not(.sidebar-collapsed) .sidebar-header { display: none; }
  body:not(.sidebar-collapsed) .course-nav {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    padding: 10px 12px;
  }
  body:not(.sidebar-collapsed) .lessons-nav,
  body:not(.sidebar-collapsed) .nav-group { display: contents; }
  body:not(.sidebar-collapsed) .lesson-subnav { display: none; }
  body:not(.sidebar-collapsed) .lessons-nav.is-open .lesson-subnav,
  body:not(.sidebar-collapsed) .nav-group.is-open .lesson-subnav {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    margin: 0;
    padding: 6px 0 0;
  }
  .course-main,
  body.sidebar-collapsed .course-main {
    margin-left: 0;
    padding: 96px 18px 56px;
  }
  body:not(.sidebar-collapsed) .course-main { padding-top: 300px; }
  .course-frame { width: min(100%, 900px); }
  .guide-grid,
  .studio-layout { grid-template-columns: 1fr; }
  .lesson-reader-panel { padding: 28px 22px 30px; }
  .lesson-document-header { padding: 28px 24px; }
}
@media (max-width: 680px) {
  .next-step-logo { width: 96px; }
  .top-progress-shell { width: 170px; }
  .top-progress-meta { grid-template-columns: 1fr; gap: 0; font-size: 10px; }
  body:not(.sidebar-collapsed) .course-nav { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  body:not(.sidebar-collapsed) .course-main { padding-top: 330px; }
  .course-page > h2 { font-size: 40px; }
  .overview-actions,
  .lesson-bottom-bar { align-items: stretch; flex-direction: column; }
  .lesson-bottom-bar .mark-complete { margin-left: 0; }
}
@media print {
  .course-topbar,
  .course-sidebar,
  .lesson-bottom-bar,
  .overview-actions,
  .resource-panel,
  .external-resource-action { display: none !important; }
  .course-main { margin: 0; padding: 0; }
  .course-frame { width: auto; }
  body { font-size: 12pt; }
  .print-job-root { display: none; }
  body.print-job-active .course-main { display: none !important; }
  body.print-job-active .print-job-root {
    display: block !important;
    margin: 0;
    padding: 0;
  }
  body.print-job-active .print-job-root button,
  body.print-job-active .print-job-root .lesson-bottom-bar,
  body.print-job-active .print-job-root .novel-question-toolbar,
  body.print-job-active .print-job-root .writing-activity-picker,
  body.print-job-active .print-job-root .paragraph-bottom-actions,
  body.print-job-active .print-job-root .motif-bottom-actions,
  body.print-job-active .print-job-root .author-intent-bottom-actions,
  body.print-job-active .print-job-root .evidence-card-actions {
    display: none !important;
  }
}
${extraCss}
</style>`;
}

function renderShellScript(options: NextStepCourseShellOptions) {
  const lessonIds = options.lessons.map((lesson) => lesson.id);
  const navGroups = options.navGroups ?? [];
  const navGroupPageIds = navGroups.flatMap((group) => [group.id, ...group.items.map((item) => item.id)]);
  const navGroupIdsByPage = Object.fromEntries(
    navGroups.flatMap((group) => [group.id, ...group.items.map((item) => item.id)].map((id) => [id, group.id]))
  );
  const pageIds = ["overview", "lessons", ...lessonIds, ...navGroupPageIds, ...(options.navItems ?? []).map((item) => item.id)];
  const storageBase = options.storageKeyBase ?? `canvas-helper:${options.slug}`;
  return `<script>
const lessonIds = ${scriptJson(lessonIds)};
const pageIds = ${scriptJson(pageIds)};
const navGroupIdsByPage = ${scriptJson(navGroupIdsByPage)};
const STORAGE_KEY = "${escapeHtml(storageBase)}:complete";
const RESPONSE_STORAGE_KEY = "${escapeHtml(storageBase)}:responses";
const lessonsNav = document.querySelector(".lessons-nav");
const navGroups = Array.from(document.querySelectorAll("[data-nav-group]"));
let saveTimer = null;
function readComplete(){
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); } catch { return new Set(); }
}
function writeComplete(values){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(values)));
}
function readResponses(){
  try { return JSON.parse(localStorage.getItem(RESPONSE_STORAGE_KEY) || "{}"); } catch { return {}; }
}
function writeResponses(values){
  localStorage.setItem(RESPONSE_STORAGE_KEY, JSON.stringify(values));
}
function setLessonsOpen(open){
  lessonsNav?.classList.toggle("is-open", open);
  document.querySelector("[data-lessons-toggle]")?.setAttribute("aria-expanded", String(open));
}
function getNavGroup(groupId){
  return navGroups.find((group) => group.getAttribute("data-nav-group") === groupId);
}
function setNavGroupOpen(groupId, open){
  const group = getNavGroup(groupId);
  if (!group) return;
  group.classList.toggle("is-open", open);
  group.querySelector("[data-nav-group-toggle]")?.setAttribute("aria-expanded", String(open));
}
function syncNavOpenState(activeGroupId, lessonsOpen){
  setLessonsOpen(Boolean(lessonsOpen));
  navGroups.forEach((group) => {
    const groupId = group.getAttribute("data-nav-group");
    if (groupId) setNavGroupOpen(groupId, groupId === activeGroupId);
  });
}
function updateComplete(){
  const complete = readComplete();
  const count = lessonIds.filter((id) => complete.has(id)).length;
  const percent = lessonIds.length ? Math.round((count / lessonIds.length) * 100) : 0;
  document.querySelectorAll("[data-progress-count]").forEach((node) => node.textContent = count + " / " + lessonIds.length + " lessons");
  document.querySelectorAll("[data-progress-count-inline]").forEach((node) => node.textContent = count + "/" + lessonIds.length);
  document.querySelectorAll("[data-progress-percent]").forEach((node) => node.textContent = percent + "%");
  document.querySelectorAll("[data-progress-fill]").forEach((node) => node.style.width = percent + "%");
  document.querySelectorAll("[data-complete-id]").forEach((button) => {
    const done = complete.has(button.getAttribute("data-complete-id"));
    button.textContent = done ? "Completed" : "Complete";
  });
}
function showPage(id){
  const fallback = pageIds.includes(id) && document.getElementById(id) ? id : "overview";
  document.querySelectorAll(".course-page").forEach((page) => page.hidden = page.id !== fallback);
  const lessonsOpen = fallback === "lessons" || lessonIds.includes(fallback);
  const navGroupId = navGroupIdsByPage[fallback] || "";
  document.querySelectorAll("[data-page-target]").forEach((link) => {
    const target = link.getAttribute("data-page-target");
    link.classList.toggle("active", target === fallback || (lessonsOpen && target === "lessons") || (navGroupId && target === navGroupId));
  });
  syncNavOpenState(navGroupId, lessonsOpen);
}
function route(){
  showPage((location.hash || "#overview").slice(1));
}
function toggleCourseMenu(){
  document.body.classList.toggle("sidebar-collapsed");
  const iconText = document.body.classList.contains("sidebar-collapsed") ? "dock_to_right" : "dock_to_left";
  document.querySelectorAll("#sidebar-toggle .material-symbols-outlined, #topbar-menu-toggle .material-symbols-outlined").forEach((icon) => {
    icon.textContent = iconText;
  });
}
function setResourcePanel(id){
  document.querySelectorAll("[data-resource-panel]").forEach((panel) => {
    panel.hidden = panel.getAttribute("data-resource-panel") !== id;
  });
}
function setActiveFilm(id){
  if (!id) return;
  document.querySelectorAll("[data-film-panel]").forEach((panel) => {
    panel.hidden = panel.getAttribute("data-film-panel") !== id;
  });
}
function restoreResponses(){
  const responses = readResponses();
  document.querySelectorAll("[data-response-id]").forEach((field) => {
    const key = field.getAttribute("data-response-id");
    if (!key) return;
    if (field.type === "checkbox") field.checked = Boolean(responses[key]);
    else field.value = responses[key] || "";
  });
}
function clearPrintJob(){
  document.body.classList.remove("print-job-active");
  document.querySelectorAll(".print-job-root").forEach((node) => node.remove());
}
function syncPrintFormValues(source, clone){
  const sourceFields = source.querySelectorAll("textarea, input, select");
  const cloneFields = clone.querySelectorAll("textarea, input, select");
  cloneFields.forEach((field, index) => {
    const sourceField = sourceFields[index];
    if (!sourceField) return;
    if (field instanceof HTMLTextAreaElement && sourceField instanceof HTMLTextAreaElement) {
      field.value = sourceField.value;
      field.textContent = sourceField.value;
    } else if (field instanceof HTMLInputElement && sourceField instanceof HTMLInputElement) {
      if (field.type === "checkbox" || field.type === "radio") field.checked = sourceField.checked;
      else field.value = sourceField.value;
    } else if (field instanceof HTMLSelectElement && sourceField instanceof HTMLSelectElement) {
      field.value = sourceField.value;
      Array.from(field.options).forEach((option) => {
        option.selected = option.value === sourceField.value;
      });
    }
  });
}
function printCourseSection(source){
  if (!source) {
    window.print();
    return;
  }
  clearPrintJob();
  const printRoot = document.createElement("div");
  printRoot.className = "print-job-root";
  const clone = source.cloneNode(true);
  syncPrintFormValues(source, clone);
  clone.querySelectorAll("script").forEach((node) => node.remove());
  printRoot.append(clone);
  document.body.append(printRoot);
  document.body.classList.add("print-job-active");
  window.setTimeout(() => window.print(), 0);
}
window.printCourseSection = printCourseSection;
document.addEventListener("click", (event) => {
  const lessonToggle = event.target.closest("[data-lessons-toggle]");
  if (lessonToggle) {
    event.preventDefault();
    const open = !lessonsNav?.classList.contains("is-open");
    if (open) {
      history.pushState(null, "", "#lessons");
      showPage("lessons");
    }
    setLessonsOpen(open);
    return;
  }
  const navGroupToggle = event.target.closest("[data-nav-group-toggle]");
  if (navGroupToggle) {
    event.preventDefault();
    const groupId = navGroupToggle.getAttribute("data-nav-group-toggle");
    if (!groupId) return;
    const group = getNavGroup(groupId);
    const open = !group?.classList.contains("is-open");
    if (open) {
      history.pushState(null, "", "#" + groupId);
      showPage(groupId);
    }
    setNavGroupOpen(groupId, open);
    return;
  }
  const target = event.target.closest("[data-page-target]");
  if (target) {
    const id = target.getAttribute("data-page-target");
    if (id) showPage(id);
  }
  const completeButton = event.target.closest("[data-complete-id]");
  if (completeButton) {
    const complete = readComplete();
    const id = completeButton.getAttribute("data-complete-id");
    if (id) complete.add(id);
    writeComplete(complete);
    updateComplete();
  }
  const printButton = event.target.closest("[data-print-writing]");
  if (printButton) {
    printCourseSection(printButton.closest("[data-writing-activity-panel]") || printButton.closest(".course-page"));
  }
});
document.addEventListener("input", (event) => {
  const field = event.target.closest("[data-response-id]");
  if (!field) return;
  const key = field.getAttribute("data-response-id");
  if (!key) return;
  const responses = readResponses();
  responses[key] = field.type === "checkbox" ? field.checked : field.value;
  writeResponses(responses);
  const saveStatus = document.querySelector("[data-save-status]");
  if (saveStatus) {
    saveStatus.textContent = "Saving...";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveStatus.textContent = "Saved locally", 500);
  }
});
document.addEventListener("change", (event) => {
  const resourceSelect = event.target.closest("[data-resource-select]");
  if (resourceSelect) setResourcePanel(resourceSelect.value);
  const filmSelect = event.target.closest("[data-film-select]");
  if (filmSelect) setActiveFilm(filmSelect.value);
});
document.getElementById("sidebar-toggle")?.addEventListener("click", toggleCourseMenu);
document.getElementById("topbar-menu-toggle")?.addEventListener("click", toggleCourseMenu);
window.addEventListener("hashchange", route);
window.addEventListener("afterprint", clearPrintJob);
restoreResponses();
document.querySelectorAll("[data-resource-select]").forEach((select) => setResourcePanel(select.value));
document.querySelectorAll("[data-film-select]").forEach((select) => setActiveFilm(select.value));
route();
updateComplete();
</script>`;
}

export function renderNextStepCourseShell(options: NextStepCourseShellOptions): string {
  const navGroupSections = (options.navGroups ?? [])
    .flatMap((group) => [group.html, ...group.items.map((item) => item.html)])
    .join("\n");
  const navSections = (options.navItems ?? []).map((item) => item.html).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(options.courseCode)} | ${escapeHtml(options.courseTitle)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;700;800&family=IBM+Plex+Sans:wght@500;700&family=Work+Sans:wght@400;500;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
  ${options.extraHeadHtml ?? ""}
  ${renderShellCss(options.extraCss)}
</head>
<body>
${renderTopbar(options)}
${renderSidebar(options)}
<main class="course-main">
  <div class="course-frame">
    ${renderOverview(options)}
    ${renderLessonsIndex(options)}
    ${options.lessons.map((lesson, index) => renderLessonPanel(lesson, options.lessons, index, options)).join("\n")}
    ${navGroupSections}
    ${navSections}
  </div>
</main>
${renderShellScript(options)}
</body>
</html>`;
}
