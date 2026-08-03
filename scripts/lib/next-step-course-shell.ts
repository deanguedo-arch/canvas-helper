import { ENGLISH_EVIDENCE_BANK_RUNTIME } from "./english-unit/evidence-bank-core.js";
import type { EnglishActivityProfileKind } from "./english-unit/types.js";

export type NextStepShellLesson = {
  id: string;
  title: string;
  pageTitle?: string;
  summary: string;
  html: string;
  unitGroup?: string;
  group?: string;
  entry?: string;
  excerpt?: string;
};

export type NextStepShellNavItem = {
  id: string;
  label: string;
  icon: string;
  html: string;
  /** Render the page and route, but omit a redundant top-level sidebar link. */
  hiddenFromNavigation?: boolean;
};

export type NextStepShellNavGroup = {
  id: string;
  label: string;
  icon: string;
  html: string;
  landingItemLabel?: string;
  items: NextStepShellNavItem[];
};

export type NextStepCourseShellOptions = {
  slug: string;
  courseTitle: string;
  courseCode: string;
  overviewIntro: string;
  overviewNotice?: string;
  outcomes: string[];
  lessons: NextStepShellLesson[];
  completionIds?: string[];
  completionLabel?: string;
  navGroups?: NextStepShellNavGroup[];
  navItems?: NextStepShellNavItem[];
  lessonGroupTitle?: string;
  lessonSequenceTitle?: string;
  sourceLessonLabel?: string;
  nextAfterLastLesson?: { id: string; label: string };
  logoPath?: string;
  storageKeyBase?: string;
  evidenceProfile?: EnglishActivityProfileKind;
  showLessonCardSummary?: boolean;
  showLessonHeaderSummary?: boolean;
  showLessonSubnavHeadings?: boolean;
  lessonPresentation?: "document" | "ela30";
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

function renderSubnav(lessons: NextStepShellLesson[], showHeadings = true) {
  const renderLink = ({ lesson, index }: { lesson: NextStepShellLesson; index: number }) =>
    `<a class="sublesson-link" href="#${escapeHtml(lesson.id)}" data-page-target="${escapeHtml(lesson.id)}">${index + 1}. ${escapeHtml(lesson.title)}</a>`;

  if (!showHeadings) {
    return lessons.map((lesson, index) => renderLink({ lesson, index })).join("\n");
  }

  if (lessons.some((lesson) => lesson.unitGroup?.trim())) {
    const units = new Map<
      string,
      {
        title: string;
        groups: Map<string, { title: string; lessons: Array<{ lesson: NextStepShellLesson; index: number }> }>;
      }
    >();

    lessons.forEach((lesson, index) => {
      const unitTitle = lesson.unitGroup?.trim() || "Lessons";
      const sectionTitle = lesson.group?.trim() || "Lessons";
      const unit = units.get(unitTitle) ?? { title: unitTitle, groups: new Map() };
      const section = unit.groups.get(sectionTitle) ?? { title: sectionTitle, lessons: [] };
      section.lessons.push({ lesson, index });
      unit.groups.set(sectionTitle, section);
      units.set(unitTitle, unit);
    });

    return Array.from(units.values())
      .map(
        (unit) => `<div class="sublesson-unit">
        <span class="sublesson-unit-heading">${escapeHtml(unit.title)}</span>
        ${Array.from(unit.groups.values())
          .map(
            (group) => `<div class="sublesson-group">
          <span class="sublesson-heading">${escapeHtml(group.title)}</span>
          ${group.lessons.map((item) => renderLink(item)).join("\n")}
        </div>`
          )
          .join("\n")}
      </div>`
      )
      .join("\n");
  }

  const groups = new Map<string, Array<{ lesson: NextStepShellLesson; index: number }>>();
  lessons.forEach((lesson, index) => {
    const title = lesson.group?.trim() || "Lessons";
    const groupLessons = groups.get(title) ?? [];
    groupLessons.push({ lesson, index });
    groups.set(title, groupLessons);
  });

  if (groups.size <= 1) {
    return lessons.map((lesson, index) => renderLink({ lesson, index })).join("\n");
  }

  return Array.from(groups.entries())
    .map(
      ([title, groupLessons]) => `<div class="sublesson-group">
        <span class="sublesson-heading">${escapeHtml(title)}</span>
        ${groupLessons.map((item) => renderLink(item)).join("\n")}
      </div>`
    )
    .join("\n");
}

function renderNavGroup(group: NextStepShellNavGroup) {
  const itemNumberOffset = group.landingItemLabel ? 2 : 1;
  return `<div class="nav-group" data-nav-group="${escapeHtml(group.id)}">
        <a class="course-nav-link nav-group-toggle" href="#${escapeHtml(group.id)}" data-page-target="${escapeHtml(group.id)}" data-nav-group-toggle="${escapeHtml(group.id)}" aria-expanded="false" aria-controls="${escapeHtml(group.id)}-subnav">
          <span class="material-symbols-outlined" aria-hidden="true">${escapeHtml(group.icon)}</span>
          <span class="sidebar-label">${escapeHtml(group.label)}</span>
          <span class="material-symbols-outlined lessons-toggle-icon nav-group-icon" aria-hidden="true">expand_more</span>
        </a>
        <div id="${escapeHtml(group.id)}-subnav" class="lesson-subnav nav-group-subnav">
          ${group.landingItemLabel
            ? `<a class="sublesson-link" href="#${escapeHtml(group.id)}" data-page-target="${escapeHtml(group.id)}">1. ${escapeHtml(group.landingItemLabel)}</a>`
            : ""}
          ${group.items
            .map(
              (item, index) =>
                `<a class="sublesson-link" href="#${escapeHtml(item.id)}" data-page-target="${escapeHtml(item.id)}">${index + itemNumberOffset}. ${escapeHtml(item.label)}</a>`
            )
            .join("\n")}
        </div>
      </div>`;
}

function renderSidebar(options: NextStepCourseShellOptions) {
  const navGroups = (options.navGroups ?? []).map((group) => renderNavGroup(group)).join("\n");
  const extraNav = (options.navItems ?? [])
    .filter((item) => !item.hiddenFromNavigation)
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
        <div id="lesson-subnav" class="lesson-subnav">${renderSubnav(options.lessons, options.showLessonSubnavHeadings)}</div>
      </div>
      ${navGroups}
      ${extraNav}
    </nav>
  </aside>`;
}

function renderTopbar(options: NextStepCourseShellOptions) {
  const logoPath = options.logoPath ?? "assets/brand/nxt-ce-logo-white-with-ce.png";
  const completionCount = options.completionIds?.length ?? options.lessons.length;
  const completionLabel = options.completionLabel ?? "lessons";
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
        <strong data-progress-count>0 / ${completionCount} ${escapeHtml(completionLabel)}</strong>
        <strong data-progress-percent>0%</strong>
      </div>
      <div class="top-progress-bar"><div class="top-progress-fill" data-progress-fill></div></div>
    </div>
  </header>`;
}

function renderOverview(options: NextStepCourseShellOptions) {
  const firstLesson = options.lessons[0];
  const sourceLessonLabel = options.sourceLessonLabel ?? "source lessons";
  const completionCount = options.completionIds?.length ?? options.lessons.length;
  const completionLabel = options.completionLabel ?? "lessons";
  return `<section id="overview" class="course-page">
    <p class="course-kicker">Course overview</p>
    <h2>${escapeHtml(options.courseTitle)}</h2>
    <p class="page-intro">${escapeHtml(options.overviewIntro)}</p>
    <section class="unit-outcomes" aria-labelledby="outcomes-title">
      <h3 id="outcomes-title" class="unit-outcomes-lead">I can...</h3>
      <ul class="unit-focus-list">
        ${options.outcomes.map((outcome) => `<li>${escapeHtml(outcome.replace(/^I can\s+/i, ""))}</li>`).join("\n")}
      </ul>
    </section>
${options.overviewNotice ? `    <aside class="overview-notice"><strong>Text access</strong><p>${escapeHtml(options.overviewNotice)}</p></aside>\n` : ""}    <div class="overview-actions" aria-label="Course status and actions">
      <span class="completed-pill"><strong data-progress-count-inline>0/${completionCount}</strong> ${escapeHtml(completionLabel)} complete</span>
      <span class="completed-pill">${completionCount} ${escapeHtml(sourceLessonLabel)}</span>
      ${firstLesson ? `<a class="external-resource-action" href="#${escapeHtml(firstLesson.id)}" data-page-target="${escapeHtml(firstLesson.id)}">Open Lesson Frame</a>` : ""}
    </div>
  </section>`;
}

function renderLessonIndexCard(lesson: NextStepShellLesson, index: number, showSummary: boolean) {
  return `<a class="lesson-card${showSummary ? "" : " lesson-card--title-only"}" href="#${escapeHtml(lesson.id)}" data-page-target="${escapeHtml(lesson.id)}">
    <span>Lesson ${index + 1}</span>
    <strong>${escapeHtml(lesson.title)}</strong>
    ${showSummary ? `<p>${escapeHtml(lesson.summary)}</p>` : ""}
  </a>`;
}

function getLessonIndexGroups(options: NextStepCourseShellOptions) {
  const fallbackTitle = options.lessonGroupTitle ?? options.courseTitle;
  const groups = new Map<string, { title: string; lessons: Array<{ lesson: NextStepShellLesson; index: number }> }>();

  options.lessons.forEach((lesson, index) => {
    const sectionTitle = lesson.group?.trim() || fallbackTitle;
    const unitTitle = lesson.unitGroup?.trim();
    const title = unitTitle ? `${unitTitle} - ${sectionTitle}` : sectionTitle;
    const existing = groups.get(title) ?? { title, lessons: [] };
    existing.lessons.push({ lesson, index });
    groups.set(title, existing);
  });

  return Array.from(groups.values());
}

function renderLessonsIndex(options: NextStepCourseShellOptions) {
  const lessonSequenceTitle = options.lessonSequenceTitle ?? "Lesson pathway";
  const lessonGroups = getLessonIndexGroups(options);
  const showLessonCardSummary = options.showLessonCardSummary ?? true;
  return `<section id="lessons" class="course-page" hidden>
    <p class="course-kicker">Lesson pathway</p>
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
            ${group.lessons.map(({ lesson, index }) => renderLessonIndexCard(lesson, index, showLessonCardSummary)).join("\n")}
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
  const showHeaderSummary = options.showLessonHeaderSummary ?? true;

  if (options.lessonPresentation === "ela30") {
    return `<section id="${escapeHtml(lesson.id)}" class="course-page lesson-page lesson-page--ela30" hidden>
    <article class="lesson-detail-panel lesson-detail-panel--ela30">
      <div class="lesson-heading-row--ela30">
        <h2>${escapeHtml(lesson.pageTitle ?? lesson.title)}</h2>
      </div>
      ${lesson.html}
      <div class="lesson-bottom-bar lesson-bottom-bar--ela30">
        ${previous ? `<a class="lesson-jump" href="#${escapeHtml(previous.id)}" data-page-target="${escapeHtml(previous.id)}">Previous</a>` : `<a class="lesson-jump" href="#lessons" data-page-target="lessons">Lesson Library</a>`}
        ${nextAction}
        <button class="lesson-jump primary mark-complete lesson-complete-button--ela30" type="button" data-complete-id="${escapeHtml(lesson.id)}" data-complete-label="Mark Complete">Mark Complete</button>
      </div>
    </article>
  </section>`;
  }

  return `<section id="${escapeHtml(lesson.id)}" class="course-page lesson-page" hidden>
    <article class="lesson-detail-panel">
      <header class="lesson-document-header">
        <p>Lesson ${index + 1}</p>
        <h2>${escapeHtml(lesson.title)}</h2>
        ${showHeaderSummary ? `<span>${escapeHtml(lesson.summary)}</span>` : ""}
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
.sublesson-unit {
  display: grid;
  gap: 5px;
  padding: 10px 0 8px;
  border-top: 1px solid #2d332f;
}
.sublesson-unit:first-child {
  border-top: 0;
  padding-top: 2px;
}
.sublesson-unit-heading {
  display: block;
  padding: 4px 0 2px;
  color: #fff;
  font-size: 13px;
  font-weight: 900;
  line-height: 1.25;
}
.sublesson-group {
  display: grid;
  gap: 4px;
  padding: 8px 0 6px;
  border-top: 1px solid #2d332f;
}
.sublesson-group:first-child {
  border-top: 0;
  padding-top: 2px;
}
.sublesson-heading {
  display: block;
  padding: 4px 0 2px;
  color: #aebaaa;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.25;
}
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
  box-sizing: border-box;
  padding: 10px 14px;
  border-left: 5px solid var(--primary);
  background: #fff;
  box-shadow: 0 6px 18px var(--surface-muted);
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
.lesson-card--title-only {
  gap: 8px;
  align-content: start;
}
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
  width: auto;
  max-width: min(100%, 760px);
  max-height: 520px;
  height: auto;
  object-fit: contain;
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
  const completionIds = options.completionIds ?? lessonIds;
  const navGroups = options.navGroups ?? [];
  const navGroupPageIds = navGroups.flatMap((group) => [group.id, ...group.items.map((item) => item.id)]);
  const navGroupIdsByPage = Object.fromEntries(
    navGroups.flatMap((group) => [group.id, ...group.items.map((item) => item.id)].map((id) => [id, group.id]))
  );
  const pageIds = ["overview", "lessons", ...lessonIds, ...navGroupPageIds, ...(options.navItems ?? []).map((item) => item.id)];
  const storageBase = options.storageKeyBase ?? `canvas-helper:${options.slug}`;
  const completionLabel = options.completionLabel ?? "lessons";
  return `<script>
const lessonIds = ${scriptJson(lessonIds)};
const completionIds = ${scriptJson(completionIds)};
const completionLabel = ${scriptJson(completionLabel)};
const pageIds = ${scriptJson(pageIds)};
const navGroupIdsByPage = ${scriptJson(navGroupIdsByPage)};
const STORAGE_KEY = "${escapeHtml(storageBase)}:complete";
const RESPONSE_STORAGE_KEY = "${escapeHtml(storageBase)}:responses";
const MANUAL_EVIDENCE_STORAGE_KEY = "${escapeHtml(storageBase)}:manual-evidence-notes";
const EVIDENCE_PROJECT_SLUG = ${scriptJson(options.slug)};
const EVIDENCE_PROFILE = ${scriptJson(options.evidenceProfile ?? "short-fiction")};
const lessonsNav = document.querySelector(".lessons-nav");
const navGroups = Array.from(document.querySelectorAll("[data-nav-group]"));
const fallbackStorage = {};
let saveTimer = null;
function readStorageValue(key, fallbackValue){
  try {
    if (window.localStorage) return window.localStorage.getItem(key) || fallbackValue;
  } catch {}
  return Object.prototype.hasOwnProperty.call(fallbackStorage, key) ? fallbackStorage[key] : fallbackValue;
}
function writeStorageValue(key, value){
  try {
    if (window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch {}
  fallbackStorage[key] = value;
}
function readComplete(){
  try { return new Set(JSON.parse(readStorageValue(STORAGE_KEY, "[]"))); } catch { return new Set(); }
}
function writeComplete(values){
  writeStorageValue(STORAGE_KEY, JSON.stringify(Array.from(values)));
}
function readResponses(){
  try { return JSON.parse(readStorageValue(RESPONSE_STORAGE_KEY, "{}")); } catch { return {}; }
}
function writeResponses(values){
  Object.keys(values).forEach((key) => {
    if (typeof values[key] === "string" && !values[key].trim()) delete values[key];
  });
  writeStorageValue(RESPONSE_STORAGE_KEY, JSON.stringify(values));
}
function readManualEvidenceNotes(){
  try {
    const notes = JSON.parse(readStorageValue(MANUAL_EVIDENCE_STORAGE_KEY, "[]"));
    return Array.isArray(notes) ? notes : [];
  } catch {
    return [];
  }
}
function writeManualEvidenceNotes(notes){
  writeStorageValue(MANUAL_EVIDENCE_STORAGE_KEY, JSON.stringify(notes));
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
  const count = completionIds.filter((id) => complete.has(id)).length;
  const percent = completionIds.length ? Math.round((count / completionIds.length) * 100) : 0;
  document.querySelectorAll("[data-progress-count]").forEach((node) => node.textContent = count + " / " + completionIds.length + " " + completionLabel);
  document.querySelectorAll("[data-progress-count-inline]").forEach((node) => node.textContent = count + "/" + completionIds.length);
  document.querySelectorAll("[data-progress-percent]").forEach((node) => node.textContent = percent + "%");
  document.querySelectorAll("[data-progress-fill]").forEach((node) => node.style.width = percent + "%");
  document.querySelectorAll("[data-complete-id]").forEach((button) => {
    const done = complete.has(button.getAttribute("data-complete-id"));
    button.textContent = done ? "Completed" : (button.getAttribute("data-complete-label") || "Complete");
  });
  document.querySelectorAll("[data-element-complete-for]").forEach((marker) => {
    const done = complete.has(marker.getAttribute("data-element-complete-for"));
    marker.textContent = done ? "✓" : "-";
    marker.classList.toggle("is-complete", done);
    marker.setAttribute("aria-label", done ? "Complete" : "Not complete");
  });
  document.querySelectorAll("[data-elements-complete-summary]").forEach((summary) => {
    const checklist = summary.closest("[data-elements-checklist]");
    const ids = Array.from(checklist?.querySelectorAll("[data-element-complete-for]") || []).map((marker) => marker.getAttribute("data-element-complete-for")).filter(Boolean);
    summary.textContent = ids.filter((id) => complete.has(id)).length + "/" + ids.length + " elements complete";
  });
}
function showPage(id){
  const fallback = pageIds.includes(id) && document.getElementById(id) ? id : "overview";
  document.querySelectorAll(".course-page").forEach((page) => page.hidden = page.id !== fallback);
  const lessonsOpen = fallback === "lessons" || lessonIds.includes(fallback);
  const navGroupId = navGroupIdsByPage[fallback] || "";
  document.querySelectorAll("[data-page-target]").forEach((link) => {
    const target = link.getAttribute("data-page-target");
    const activeGroupToggle = navGroupId && target === navGroupId && link.hasAttribute("data-nav-group-toggle");
    link.classList.toggle("active", target === fallback || (lessonsOpen && target === "lessons") || activeGroupToggle);
  });
  syncNavOpenState(navGroupId, lessonsOpen);
  if (window.matchMedia("(max-width: 1100px)").matches) setCourseMenuCollapsed(true);
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}
function route(){
  showPage((location.hash || "#overview").slice(1));
}
function setCourseMenuCollapsed(collapsed){
  document.body.classList.toggle("sidebar-collapsed", collapsed);
  const iconText = collapsed ? "dock_to_right" : "dock_to_left";
  document.querySelectorAll("#sidebar-toggle .material-symbols-outlined, #topbar-menu-toggle .material-symbols-outlined").forEach((icon) => {
    icon.textContent = iconText;
  });
}
function toggleCourseMenu(){
  setCourseMenuCollapsed(!document.body.classList.contains("sidebar-collapsed"));
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
function getLibraryDocumentScope(trigger){
  return trigger?.closest("[data-library-doc-scope], .social-library-browser") || document;
}
function setActiveLibraryDocument(id, scope){
  if (!id) return;
  const root = scope || document;
  root.querySelectorAll("[data-library-doc-panel]").forEach((panel) => {
    panel.hidden = panel.getAttribute("data-library-doc-panel") !== id;
  });
  root.querySelectorAll("[data-library-doc-target]").forEach((button) => {
    const active = button.getAttribute("data-library-doc-target") === id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  root.querySelectorAll("[data-library-doc-select]").forEach((select) => {
    if (select.value !== id) select.value = id;
  });
}
function getStudyTopicScope(trigger){
  return trigger?.closest("[data-study-topic-scope]") || document;
}
function setActiveStudyTopic(group, id, scope){
  if (!group || !id) return;
  const root = scope || document;
  root.querySelectorAll("[data-study-topic-panel='" + group + "']").forEach((panel) => {
    panel.hidden = panel.getAttribute("data-study-topic-id") !== id;
  });
}
function escapeForHtml(value){
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char] || char);
}
function getLessonEvidenceNotes(){
  const responses = readResponses();
  return Array.from(document.querySelectorAll("[data-evidence-note='lesson'][data-response-id]"))
    .map((field) => {
      const key = field.getAttribute("data-response-id");
      const storedValue = key ? responses[key] : "";
      const value = typeof storedValue === "string" ? storedValue.trim() : "";
      return {
        value,
        title: field.getAttribute("data-evidence-lesson-title") || "Lesson evidence note",
        group: field.getAttribute("data-evidence-lesson-group") || "",
        number: field.getAttribute("data-evidence-lesson-number") || ""
      };
    })
    .filter((note) => note.value);
}
function renderLessonEvidenceBank(){
  const lists = Array.from(document.querySelectorAll("[data-lesson-evidence-list]"));
  if (!lists.length) return;
  const notes = getLessonEvidenceNotes();
  lists.forEach((list) => {
    if (!notes.length) {
      list.innerHTML = '<p class="social-empty-state" data-lesson-evidence-empty>No lesson evidence notes yet. Add one from any lesson and it will appear here.</p>';
      return;
    }
    list.innerHTML = notes.map((note) => {
      const meta = [note.number ? "Lesson " + note.number : "", note.group].filter(Boolean).join(" - ");
      return '<article class="social-lesson-evidence-card">' +
        '<div class="social-lesson-evidence-meta">' + escapeForHtml(meta) + '</div>' +
        '<h4>' + escapeForHtml(note.title) + '</h4>' +
        '<p>' + escapeForHtml(note.value) + '</p>' +
      '</article>';
    }).join("");
  });
}
function getEvidenceDraftFields(key, scope){
  const root = scope || document;
  const scopedFields = Array.from(root.querySelectorAll("[data-evidence-draft='" + key + "']"));
  if (scopedFields.length) return scopedFields;
  const fallback = root.querySelector("[data-response-id$=':evidence:" + key + "']");
  return fallback ? [fallback] : [];
}
function getEvidenceFieldValue(field){
  if (field instanceof HTMLSelectElement) {
    return field.selectedOptions?.[0]?.textContent || field.value || "";
  }
  if (field instanceof HTMLInputElement && field.type === "radio") {
    if (!field.checked) return "";
    return field.getAttribute("data-practice-source-title") || field.closest("label")?.textContent?.trim() || field.value || "";
  }
  return field.value || "";
}
function getEvidenceDraft(scope){
  const getValue = (key) => {
    const fields = getEvidenceDraftFields(key, scope);
    const values = fields
      .map((field) => {
        const value = String(getEvidenceFieldValue(field)).trim();
        if (!value) return "";
        const label = field.getAttribute("data-evidence-draft-label");
        return fields.length > 1 && label ? label + ": " + value : value;
      })
      .filter(Boolean);
    return values.join("\\n\\n");
  };
  return {
    source: getValue("source"),
    concept: getValue("concept"),
    detail: getValue("detail"),
    connection: getValue("connection"),
    counterpoint: getValue("counterpoint")
  };
}
function setEvidenceNotebookStatus(message, panel){
  panel = panel || document.querySelector("[data-evidence-notebook-panel]");
  const saveStatus = panel?.querySelector("[data-save-status]");
  if (saveStatus) saveStatus.textContent = message;
}
function clearEvidenceDraft(scope){
  const responses = readResponses();
  ["source", "concept", "detail", "connection", "counterpoint"].forEach((key) => {
    getEvidenceDraftFields(key, scope).forEach((field) => {
      if (field instanceof HTMLSelectElement && field.options.length) {
        field.selectedIndex = 0;
      } else if (field instanceof HTMLInputElement && field.type === "radio") {
        field.checked = field.hasAttribute("data-practice-source-default");
      } else {
        field.value = "";
      }
      const responseId = field.getAttribute("data-response-id");
      if (responseId) delete responses[responseId];
    });
  });
  writeResponses(responses);
}
function getEvidenceBankApi(){
  const api = window.nextStepEvidenceBank;
  return api && typeof api.upsert === "function" && typeof api.remove === "function" && typeof api.list === "function"
    ? api
    : null;
}
function getEvidenceLocatorLabel(note){
  if (!note?.locator) return "";
  if (typeof note.locator === "string") return note.locator;
  if (note.locator.label) return note.locator.label;
  return [note.locator.act, note.locator.scene, note.locator.chapter, note.locator.timestamp]
    .filter(Boolean)
    .join(" | ");
}
function renderManualEvidenceBank(){
  const lists = Array.from(document.querySelectorAll("[data-manual-evidence-list]"));
  if (!lists.length) return;
  const notes = getEvidenceBankApi()?.list() || [];
  lists.forEach((list) => {
    const filterRoot = list.closest("[data-evidence-bank-filters]")?.parentElement || list.closest(".english-evidence-bank-list") || document;
    const filterFields = Array.from(filterRoot.querySelectorAll("[data-evidence-bank-filter]"));
    function facetValue(note, facet){
      if (facet === "activity") return note.activity?.title || note.activity?.id || note.activityId || note.concept || "";
      if (facet === "work") return note.work?.title || note.work?.id || note.workId || note.source?.title || (typeof note.source === "string" ? note.source : "");
      if (facet === "locator") return getEvidenceLocatorLabel(note);
      if (facet === "type") return note.evidenceType || note.entryKind || note.type || (note.responseId ? "collection" : "individual");
      return "";
    }
    filterFields.forEach((field) => {
      const facet = field.getAttribute("data-evidence-bank-filter") || "";
      const selected = field.value || "";
      const defaultLabel = field.options?.[0]?.textContent || "All";
      const values = notes.map((note) => String(facetValue(note, facet) || "").trim()).filter(Boolean).filter((value, index, all) => all.indexOf(value) === index).sort((left, right) => left.localeCompare(right));
      field.innerHTML = '<option value="">' + escapeForHtml(defaultLabel) + '</option>' + values.map((value) => '<option value="' + escapeForHtml(value) + '">' + escapeForHtml(value) + '</option>').join("");
      if (values.includes(selected)) field.value = selected;
    });
    const filteredNotes = notes.filter((note) => filterFields.every((field) => {
      if (!field.value) return true;
      const facet = field.getAttribute("data-evidence-bank-filter") || "";
      return String(facetValue(note, facet) || "") === field.value;
    }));
    if (!filteredNotes.length) {
      list.innerHTML = '<p class="social-empty-state" data-manual-evidence-empty>Use the notebook below to save reusable proof notes here.</p>';
      return;
    }
    list.innerHTML = filteredNotes.map((note) => {
      const contributionId = note.contributionId || note.responseId || note.id || "";
      const sourceTitle = note.source?.title || note.source?.id || (typeof note.source === "string" ? note.source : "");
      const workTitle = note.work?.title || "";
      const title = note.activity?.title || note.activity?.id || note.concept || sourceTitle || "Saved proof note";
      const locatorLabel = getEvidenceLocatorLabel(note);
      const metaParts = [sourceTitle, workTitle && workTitle !== sourceTitle ? workTitle : "", locatorLabel, note.updatedAt ? "Updated " + new Date(note.updatedAt).toLocaleDateString() : note.createdAt ? "Saved " + new Date(note.createdAt).toLocaleDateString() : ""].filter(Boolean);
      const promptLabel = note.metadata?.promptLabel || note.promptLabel || "Question";
      const prompt = note.prompt ? '<div class="social-evidence-card-detail"><strong>' + escapeForHtml(promptLabel) + '</strong><p>' + escapeForHtml(note.prompt) + '</p></div>' : "";
      const detailLabel = note.metadata?.detailLabel || note.detailLabel || (note.entryKind === "collection" ? "Saved responses" : "Evidence");
      const detailValue = note.entryKind === "collection" ? (note.answer || note.evidence || "") : (note.evidence || note.answer || "");
      const detail = detailValue ? '<div class="social-evidence-card-detail"><strong>' + escapeForHtml(detailLabel) + '</strong><p>' + escapeForHtml(detailValue) + '</p></div>' : "";
      const connectionValue = note.analysis || note.connection || "";
      const connection = connectionValue ? '<div class="social-evidence-card-detail"><strong>Why it matters</strong><p>' + escapeForHtml(connectionValue) + '</p></div>' : "";
      const counterpointValue = note.metadata?.counterpoint || note.counterpoint || "";
      const counterpoint = counterpointValue && !connectionValue.includes(counterpointValue) ? '<div class="social-evidence-card-detail"><strong>Counterpoint</strong><p>' + escapeForHtml(counterpointValue) + '</p></div>' : "";
      return '<article class="social-lesson-evidence-card social-manual-evidence-card" data-evidence-bank-entry="' + escapeForHtml(contributionId) + '" data-evidence-bank-entry-kind="' + escapeForHtml(note.entryKind || (note.responseId ? "collection" : "individual")) + '">' +
        '<div class="social-lesson-evidence-meta">' + escapeForHtml(metaParts.join(" - ")) + '</div>' +
        '<h4>' + escapeForHtml(title) + '</h4>' +
        prompt +
        detail +
        connection +
        counterpoint +
        '<div class="social-evidence-card-actions"><button class="external-resource-action social-secondary-action" type="button" data-remove-evidence-note="' + escapeForHtml(contributionId) + '">Remove</button></div>' +
      '</article>';
    }).join("");
  });
}
function saveEvidenceDraftToNotebook(panel){
  const draft = getEvidenceDraft(panel);
  if (!draft.detail && !draft.connection && !draft.counterpoint) {
    setEvidenceNotebookStatus("Add evidence or analysis before saving.", panel);
    return;
  }
  const api = getEvidenceBankApi();
  if (!api) {
    setEvidenceNotebookStatus("Evidence Bank is unavailable.", panel);
    return;
  }
  const configuredContributionId = panel?.getAttribute("data-evidence-contribution-id") || "";
  const contributionId = configuredContributionId || "manual:" + Date.now().toString(36) + ":" + Math.random().toString(36).slice(2, 9);
  const now = new Date().toISOString();
  const sourceTitle = draft.source || "Manual evidence";
  const activityTitle = draft.concept || "Evidence entry";
  const analysis = [draft.connection, draft.counterpoint].filter(Boolean).join("\\n\\n");
  const entry = {
    schemaVersion: 2,
    contributionId,
    projectSlug: EVIDENCE_PROJECT_SLUG,
    entryKind: "individual",
    source: { kind: "activity", id: evidenceSafeId(sourceTitle), title: sourceTitle },
    activity: { id: evidenceSafeId(activityTitle), profile: EVIDENCE_PROFILE, title: activityTitle },
    work: draft.source ? { id: evidenceSafeId(draft.source), title: draft.source, kind: EVIDENCE_PROFILE === "film-study" ? "film" : "text" } : undefined,
    evidence: draft.detail || undefined,
    analysis: analysis || undefined,
    tags: [],
    createdAt: now,
    updatedAt: now,
    ...(draft.counterpoint ? { metadata: { counterpoint: draft.counterpoint } } : {})
  };
  try {
    api.upsert(entry);
  } catch {
    setEvidenceNotebookStatus("Evidence could not be saved.", panel);
    return;
  }
  clearEvidenceDraft(panel);
  panel?.querySelectorAll("[data-practice-source-region]").forEach(initializePracticeSourceRegion);
  setEvidenceNotebookStatus("Saved to Evidence Bank", panel);
}
function setResponseCollectionStatus(button, message){
  const status = button?.closest("[data-response-collection]")?.querySelector("[data-response-collection-status]");
  if (status) status.textContent = message;
}
function saveResponseCollectionToNotebook(button){
  const collection = button?.closest("[data-response-collection]");
  if (!collection) return;
  const responses = readResponses();
  const entries = Array.from(collection.querySelectorAll("[data-evidence-question-number]")).map((question) => {
    const field = question.querySelector("[data-response-id]");
    const responseId = field?.getAttribute("data-response-id") || "";
    return {
      number: question.getAttribute("data-evidence-question-number") || "",
      prompt: question.getAttribute("data-evidence-question-prompt") || "",
      answer: String(responses[responseId] || field?.value || "").trim(),
      responseId
    };
  });
  const answered = entries.filter((entry) => entry.answer);
  if (!answered.length) {
    setResponseCollectionStatus(button, "Write at least one answer before saving.");
    return;
  }
  const api = getEvidenceBankApi();
  if (!api) {
    setResponseCollectionStatus(button, "Evidence Bank is unavailable.");
    return;
  }
  const collectionId = collection.getAttribute("data-evidence-collection-id") || "question-collection";
  const responsePrefix = collection.getAttribute("data-evidence-response-prefix") || "";
  const existing = api.list({ contributionId: collectionId })[0];
  const savedResponses = answered.map((entry) =>
    "Question " + entry.number + ": " + entry.prompt + "\\nAnswer: " + entry.answer
  ).join("\\n\\n");
  const sourceTitle = collection.getAttribute("data-evidence-source") || "Short Story Questions";
  const activityTitle = collection.getAttribute("data-evidence-activity-title") || collection.getAttribute("data-evidence-concept") || "Activity";
  const workTitle = collection.getAttribute("data-evidence-work-title") || "";
  const locatorLabel = collection.getAttribute("data-evidence-locator") || "";
  const now = new Date().toISOString();
  const nextNote = {
    schemaVersion: 2,
    contributionId: collectionId,
    projectSlug: EVIDENCE_PROJECT_SLUG,
    entryKind: "collection",
    source: { kind: "question-set", id: evidenceSafeId(sourceTitle), title: sourceTitle },
    activity: {
      id: collection.getAttribute("data-evidence-activity-id") || evidenceSafeId(activityTitle),
      profile: EVIDENCE_PROFILE,
      title: activityTitle
    },
    work: workTitle ? {
      id: collection.getAttribute("data-evidence-work-id") || evidenceSafeId(workTitle),
      title: workTitle,
      kind: EVIDENCE_PROFILE === "film-study" ? "film" : "text"
    } : undefined,
    locator: locatorLabel ? { label: locatorLabel } : undefined,
    prompt: answered.length + " of " + entries.length + " guided responses saved.",
    answer: savedResponses,
    responseIds: answered.map((entry) => entry.responseId).filter(Boolean),
    tags: (collection.getAttribute("data-evidence-tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    metadata: {
      promptLabel: collection.getAttribute("data-evidence-prompt-label") || "Question set",
      detailLabel: collection.getAttribute("data-evidence-detail-label") || "Saved responses"
    }
  };
  if (responsePrefix) {
    api.list().forEach((note) => {
      if (note.entryKind === "collection" && note.contributionId !== collectionId && String(note.contributionId || "").startsWith(responsePrefix)) {
        api.remove(note.contributionId);
      }
    });
  }
  api.upsert(nextNote);
  setResponseCollectionStatus(
    button,
    existing
      ? collection.getAttribute("data-evidence-updated-message") || "Story answers updated in Evidence Bank"
      : collection.getAttribute("data-evidence-saved-message") || "Story answers saved to Evidence Bank"
  );
}
function removeManualEvidenceNote(id){
  if (!id) return;
  if (getEvidenceBankApi()?.remove(id)) setEvidenceNotebookStatus("Removed saved note");
}
${ENGLISH_EVIDENCE_BANK_RUNTIME}
function restoreResponses(){
  const responses = readResponses();
  document.querySelectorAll("[data-response-id]").forEach((field) => {
    const key = field.getAttribute("data-response-id");
    if (!key) return;
    if (field.type === "checkbox") field.checked = Boolean(responses[key]);
    else if (field.type === "radio") field.checked = responses[key] ? field.value === responses[key] : field.hasAttribute("data-practice-source-default");
    else if (field instanceof HTMLSelectElement) {
      if (typeof responses[key] === "string" && responses[key]) field.value = responses[key];
    }
    else field.value = responses[key] || "";
  });
  renderLessonEvidenceBank();
  renderManualEvidenceBank();
}
function persistResponseField(field){
  const key = field.getAttribute("data-response-id");
  if (!key) return;
  const responses = readResponses();
  if (field.type === "checkbox") {
    responses[key] = field.checked;
  } else if (field.type === "radio") {
    if (!field.checked) return;
    responses[key] = field.value || "";
  } else {
    const value = field.value || "";
    if (value.trim()) responses[key] = value;
    else delete responses[key];
  }
  writeResponses(responses);
  renderLessonEvidenceBank();
  const saveStatus = field.closest("[data-writing-activity-panel]")?.querySelector("[data-save-status]") || document.querySelector("[data-save-status]");
  if (saveStatus) {
    saveStatus.textContent = "Saving...";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveStatus.textContent = "Saved locally", 500);
  }
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
function setActivePracticeSource(id, select){
  const root = select?.closest("[data-practice-source-region]") || document;
  const panels = Array.from(root.querySelectorAll("[data-practice-source-panel]"));
  if (!panels.length) return;
  const nextId = id || panels[0]?.getAttribute("data-practice-source-panel") || "";
  panels.forEach((panel) => {
    panel.hidden = panel.getAttribute("data-practice-source-panel") !== nextId;
  });
}
function initializePracticeSourceRegion(region){
  if (!region) return;
  const checked = region.querySelector("[data-practice-source-select]:checked");
  const control = checked || region.querySelector("[data-practice-source-select]");
  if (control) setActivePracticeSource(control.value, control);
}
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
    const collapseCurrentLanding = group?.classList.contains("is-open") && location.hash === "#" + groupId;
    if (location.hash !== "#" + groupId) {
      history.pushState(null, "", "#" + groupId);
    }
    showPage(groupId);
    if (collapseCurrentLanding) setNavGroupOpen(groupId, false);
    return;
  }
  const target = event.target.closest("[data-page-target]");
  if (target) {
    const id = target.getAttribute("data-page-target");
    if (id) showPage(id);
  }
  const libraryTarget = event.target.closest("[data-library-doc-target]");
  if (libraryTarget) {
    setActiveLibraryDocument(libraryTarget.getAttribute("data-library-doc-target"), getLibraryDocumentScope(libraryTarget));
  }
  const completeButton = event.target.closest("[data-complete-id]");
  if (completeButton) {
    const complete = readComplete();
    const id = completeButton.getAttribute("data-complete-id");
    if (id) complete.add(id);
    writeComplete(complete);
    updateComplete();
  }
  const saveEvidenceButton = event.target.closest("[data-save-evidence-note]");
  if (saveEvidenceButton) {
    event.preventDefault();
    saveEvidenceDraftToNotebook(saveEvidenceButton.closest("[data-evidence-notebook-panel]"));
    return;
  }
  const saveResponseCollectionButton = event.target.closest("[data-save-response-collection]");
  if (saveResponseCollectionButton) {
    event.preventDefault();
    saveResponseCollectionToNotebook(saveResponseCollectionButton);
    return;
  }
  const removeEvidenceButton = event.target.closest("[data-remove-evidence-note]");
  if (removeEvidenceButton) {
    event.preventDefault();
    removeManualEvidenceNote(removeEvidenceButton.getAttribute("data-remove-evidence-note"));
    return;
  }
  const printButton = event.target.closest("[data-print-writing]");
  if (printButton) {
    printCourseSection(printButton.closest("[data-writing-activity-panel]") || printButton.closest(".course-page"));
  }
});
document.addEventListener("input", (event) => {
  const field = event.target.closest("[data-response-id]");
  if (!field) return;
  persistResponseField(field);
});
document.addEventListener("change", (event) => {
  const evidenceFilter = event.target.closest("[data-evidence-bank-filter]");
  if (evidenceFilter) renderManualEvidenceBank();
  const responseField = event.target.closest("[data-response-id]");
  if (responseField) persistResponseField(responseField);
  const resourceSelect = event.target.closest("[data-resource-select]");
  if (resourceSelect) setResourcePanel(resourceSelect.value);
  const filmSelect = event.target.closest("[data-film-select]");
  if (filmSelect) setActiveFilm(filmSelect.value);
  const practiceSourceSelect = event.target.closest("[data-practice-source-select]");
  if (practiceSourceSelect && (!practiceSourceSelect.type || practiceSourceSelect.type !== "radio" || practiceSourceSelect.checked)) {
    setActivePracticeSource(practiceSourceSelect.value, practiceSourceSelect);
  }
  const libraryDocSelect = event.target.closest("[data-library-doc-select]");
  if (libraryDocSelect) setActiveLibraryDocument(libraryDocSelect.value, getLibraryDocumentScope(libraryDocSelect));
  const studyTopicSelect = event.target.closest("[data-study-topic-select]");
  if (studyTopicSelect) {
    setActiveStudyTopic(
      studyTopicSelect.getAttribute("data-study-topic-select"),
      studyTopicSelect.value,
      getStudyTopicScope(studyTopicSelect)
    );
  }
});
document.addEventListener("focusout", (event) => {
  const responseField = event.target.closest("[data-response-id]");
  if (responseField) persistResponseField(responseField);
});
document.getElementById("sidebar-toggle")?.addEventListener("click", toggleCourseMenu);
document.getElementById("topbar-menu-toggle")?.addEventListener("click", toggleCourseMenu);
window.addEventListener("hashchange", route);
window.addEventListener("afterprint", clearPrintJob);
restoreResponses();
document.querySelectorAll("[data-resource-select]").forEach((select) => setResourcePanel(select.value));
document.querySelectorAll("[data-film-select]").forEach((select) => setActiveFilm(select.value));
document.querySelectorAll("[data-practice-source-region]").forEach(initializePracticeSourceRegion);
document.querySelectorAll("[data-library-doc-select]").forEach((select) => {
  setActiveLibraryDocument(select.value, getLibraryDocumentScope(select));
});
document.querySelectorAll("[data-study-topic-select]").forEach((select) => {
  setActiveStudyTopic(select.getAttribute("data-study-topic-select"), select.value, getStudyTopicScope(select));
});
document.querySelectorAll("[data-library-doc-target].active, [data-library-doc-target][aria-pressed='true']").forEach((button) => {
  setActiveLibraryDocument(button.getAttribute("data-library-doc-target"), getLibraryDocumentScope(button));
});
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
