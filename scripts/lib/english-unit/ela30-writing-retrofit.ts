import { createHash } from "node:crypto";
import {
  ENGLISH_WRITING_SEQUENCE_CSS,
  ENGLISH_WRITING_SEQUENCE_RUNTIME,
  renderEnglishWritingSequences,
  type EnglishWritingSequenceInput,
} from "./writing-sequence-renderer.js";
import { ENGLISH_ACTIVITY_PROFILE_CSS } from "./activity-profile-runtime.js";

export const ELA30_WRITING_RETROFIT_VERSION = "1.3.0";
export const ELA30_WRITING_PROJECT_SLUGS = [
  "ela30-1-short-stories",
  "ela30-1-shakespeare-othello",
  "ela30-1-modern-drama",
  "ela30-1-novel-study-legacy",
  "ela30-1-feature-film-legacy",
] as const;

export type Ela30WritingProjectSlug = (typeof ELA30_WRITING_PROJECT_SLUGS)[number];

type WritingProjectDefinition = EnglishWritingSequenceInput & {
  projectSlug: Ela30WritingProjectSlug;
  compactNavBreakpoint: 1024 | 1050 | 1100;
  pageListKind?: "pageIds" | "staticPages" | "othello";
};

const PROJECTS: Record<Ela30WritingProjectSlug, WritingProjectDefinition> = {
  "ela30-1-short-stories": {
    projectSlug: "ela30-1-short-stories",
    compactNavBreakpoint: 1050,
    namespace: "ela30-1-short-stories",
    courseCode: "ELA 30-1",
    unitTitle: "Short Stories",
    profileKind: "short-fiction",
    works: [
      { id: "by-the-waters-of-babylon", title: "By the Waters of Babylon", author: "Stephen Vincent Ben\u00e9t", kind: "text" },
      { id: "dulce-et-decorum-est", title: "Dulce et Decorum Est", author: "Wilfred Owen", kind: "text" },
      { id: "good-country-people", title: "Good Country People", author: "Flannery O\u2019Connor", kind: "text" },
      { id: "the-first-year-of-my-life", title: "The First Year of My Life", author: "Muriel Spark", kind: "text" },
      { id: "the-jilting-of-granny-weatherall", title: "The Jilting of Granny Weatherall", author: "Katherine Anne Porter", kind: "text" },
    ],
    visualProfile: "ela20-workbook",
    criticalEssayTrackMode: "per-work",
    personalResponseTrackMode: "unit",
    includeCriticalEssay: true,
    includePersonalResponse: true,
  },
  "ela30-1-shakespeare-othello": {
    projectSlug: "ela30-1-shakespeare-othello",
    compactNavBreakpoint: 1024,
    namespace: "ela30-1-shakespeare-othello",
    courseCode: "ELA 30-1",
    unitTitle: "Shakespearean Drama - Othello",
    profileKind: "shakespeare-drama",
    works: [{ id: "othello", title: "Othello", kind: "play" }],
    visualProfile: "ela20-workbook",
    includeCriticalEssay: true,
    includePersonalResponse: true,
    pageListKind: "othello",
  },
  "ela30-1-modern-drama": {
    projectSlug: "ela30-1-modern-drama",
    compactNavBreakpoint: 1050,
    namespace: "ela30-1-modern-drama",
    courseCode: "ELA 30-1",
    unitTitle: "A Streetcar Named Desire",
    profileKind: "modern-drama",
    works: [{ id: "a-streetcar-named-desire", title: "A Streetcar Named Desire", kind: "play" }],
    visualProfile: "ela20-workbook",
    includeCriticalEssay: true,
    includePersonalResponse: true,
    pageListKind: "staticPages",
  },
  "ela30-1-novel-study-legacy": {
    projectSlug: "ela30-1-novel-study-legacy",
    compactNavBreakpoint: 1100,
    namespace: "ela30-1-novel-study-legacy",
    courseCode: "ELA 30-1",
    unitTitle: "Novel Study",
    profileKind: "novel-study",
    works: [{ id: "selected-novel", title: "Selected Novel", kind: "novel" }],
    visualProfile: "ela20-workbook",
    includeCriticalEssay: true,
    includePersonalResponse: true,
    pageListKind: "pageIds",
  },
  "ela30-1-feature-film-legacy": {
    projectSlug: "ela30-1-feature-film-legacy",
    compactNavBreakpoint: 1100,
    namespace: "ela30-1-feature-film-legacy",
    courseCode: "ELA 30-1",
    unitTitle: "Feature Film",
    profileKind: "film-study",
    works: [{ id: "feature-film", title: "Feature Film", kind: "film" }],
    visualProfile: "ela20-workbook",
    includeCriticalEssay: true,
    includePersonalResponse: true,
    pageListKind: "pageIds",
  },
};

const MARKERS = {
  styles: ["<!-- canvas-helper:ela30-writing-retrofit:styles:start -->", "<!-- canvas-helper:ela30-writing-retrofit:styles:end -->"],
  nav: ["<!-- canvas-helper:ela30-writing-retrofit:nav:start -->", "<!-- canvas-helper:ela30-writing-retrofit:nav:end -->"],
  routes: ["<!-- canvas-helper:ela30-writing-retrofit:routes:start -->", "<!-- canvas-helper:ela30-writing-retrofit:routes:end -->"],
  runtime: ["<!-- canvas-helper:ela30-writing-retrofit:runtime:start -->", "<!-- canvas-helper:ela30-writing-retrofit:runtime:end -->"],
} as const;

function renderEla30WritingNavCss(project: WritingProjectDefinition) {
  return String.raw`
.english-writing-sequence-page { scroll-margin-top: 88px; }
.english-writing-workbook-page { max-width: none; margin-inline: 0; }
.ela30-writing-nav-group { min-width: 0; }
.ela30-writing-nav-group > .course-nav-link .sidebar-label { flex: 1 1 auto; min-width: 0; }
.ela30-writing-nav-group > .course-nav-link .nav-group-icon { flex: 0 0 auto; margin-left: auto; transition: transform 160ms ease; }
.ela30-writing-nav-group.is-open > .course-nav-link .nav-group-icon { transform: rotate(180deg); }
.ela30-writing-nav-group .nav-group-subnav {
  display: none;
  margin: 4px 8px 8px 48px;
}
.ela30-writing-nav-group.is-open .nav-group-subnav {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr);
  gap: 4px;
}
.ela30-writing-nav-group .sublesson-link {
  display: block;
  padding: 7px 0;
  color: #dbe2d8;
  text-decoration: none;
  font-size: 13px;
  line-height: 1.35;
}
.ela30-writing-nav-group .sublesson-link:hover,
.ela30-writing-nav-group .sublesson-link.active { color: #fff; }
body.sidebar-collapsed .ela30-writing-nav-group .nav-group-subnav { display: none !important; }
@media (max-width: ${project.compactNavBreakpoint}px) {
  .english-writing-sequence-page { scroll-margin-top: 136px; }
  body:not(.sidebar-collapsed) .course-sidebar .ela30-writing-nav-group { display: contents !important; }
  body:not(.sidebar-collapsed) .course-sidebar .ela30-writing-nav-group > .course-nav-link {
    width: auto !important;
    margin: 0 !important;
    padding: 8px 12px !important;
  }
  body:not(.sidebar-collapsed) .course-sidebar .ela30-writing-nav-group.is-open .nav-group-subnav {
    grid-column: 1 / -1 !important;
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 6px !important;
    margin: 0 !important;
    padding: 6px 0 0 !important;
  }
  body:not(.sidebar-collapsed) .course-sidebar .ela30-writing-nav-group .sublesson-link {
    padding: 8px 10px !important;
  }
}
`;
}

function renderEla30WritingNavRuntime(project: WritingProjectDefinition) {
  return String.raw`
(() => {
  document.addEventListener("click", (event) => {
    const routeLink = event.target instanceof Element ? event.target.closest(".ela30-writing-nav-group .sublesson-link[data-page-target]") : null;
    if (!routeLink || !window.matchMedia("(max-width: ${project.compactNavBreakpoint}px)").matches) return;
    document.body.classList.add("sidebar-collapsed");
    document.querySelectorAll("#sidebar-toggle .material-symbols-outlined, #topbar-menu-toggle .material-symbols-outlined").forEach((icon) => {
      icon.textContent = "dock_to_right";
    });
  });
  if (typeof window.setNavGroupOpen === "function") return;
  const groups = Array.from(document.querySelectorAll(".ela30-writing-nav-group[data-nav-group]"));
  if (!groups.length) return;
  const setOpen = (group, open) => {
    group.classList.toggle("is-open", open);
    group.querySelector("[data-nav-group-toggle]")?.setAttribute("aria-expanded", String(open));
  };
  const syncFromHash = () => {
    const routeId = decodeURIComponent(location.hash.replace(/^#/, ""));
    groups.forEach((group) => {
      const ownsRoute = Array.from(group.querySelectorAll("[data-page-target]"))
        .some((link) => link.getAttribute("data-page-target") === routeId);
      setOpen(group, ownsRoute);
    });
  };
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("[data-nav-group-toggle]") : null;
    const group = target?.closest(".ela30-writing-nav-group[data-nav-group]");
    if (!target || !group) return;
    const shouldOpen = !group.classList.contains("is-open");
    groups.forEach((item) => setOpen(item, item === group && shouldOpen));
  });
  window.addEventListener("hashchange", syncFromHash);
  syncFromHash();
})();
`;
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function markerBlock(markers: readonly [string, string], contents: string) {
  return `${markers[0]}\n${contents}\n${markers[1]}`;
}

function stripBlock(html: string, markers: readonly [string, string]) {
  const start = html.indexOf(markers[0]);
  const end = html.indexOf(markers[1]);
  if (start < 0 && end < 0) return html;
  if (start < 0 || end < start) throw new Error(`Incomplete ELA 30-1 writing retrofit marker block: ${markers[0]}`);
  let after = end + markers[1].length;
  if (html.slice(after, after + 2) === "\r\n") after += 2;
  else if (html[after] === "\n") after += 1;
  const whitespaceOnlyLine = html.slice(after).match(/^[ \t]+(?:\r?\n)/)?.[0];
  if (whitespaceOnlyLine) after += whitespaceOnlyLine.length;
  return `${html.slice(0, start)}${html.slice(after)}`;
}

function stripRetrofit(html: string) {
  let current = html;
  for (const markers of Object.values(MARKERS)) current = stripBlock(current, markers);
  return current;
}

function correctLegacyCourseLabel(html: string, project: WritingProjectDefinition) {
  if (project.projectSlug !== "ela30-1-novel-study-legacy" && project.projectSlug !== "ela30-1-feature-film-legacy") return html;
  return html.replaceAll("ELA 20-1", "ELA 30-1");
}

const LEGACY_CRITICAL_ROUTE_IDS = [
  "critical-writing",
  "critical-writing-topic-thesis",
  "critical-writing-introduction",
  "critical-writing-body-beginning",
  "critical-writing-body-middle",
  "critical-writing-body-end",
  "critical-writing-conclusion-revision",
] as const;

function stripLegacyCriticalNavigation(html: string, project: WritingProjectDefinition) {
  if (project.pageListKind !== "pageIds") return html;
  const pattern = /<div\b[^>]*class="[^"]*\bnav-group\b[^"]*"[^>]*data-nav-group="critical-writing"[^>]*>/i;
  const match = pattern.exec(html);
  if (match?.index == null) return html;
  const end = findContainerEnd(html, match.index);
  if (end < 0) throw new Error(`${project.projectSlug} has an incomplete legacy Critical Essay navigation group.`);
  return `${html.slice(0, match.index)}${html.slice(end)}`;
}

function redirectLegacyCriticalLinks(html: string, project: WritingProjectDefinition) {
  if (project.pageListKind !== "pageIds") return html;
  return html
    .replaceAll('href="#critical-writing" data-page-target="critical-writing"', 'href="#critical-essay" data-page-target="critical-essay"')
    .replaceAll('href="#critical-writing-topic-thesis" data-page-target="critical-writing-topic-thesis"', 'href="#critical-essay-topic-interpretation" data-page-target="critical-essay-topic-interpretation"');
}

function renderNavGroup(group: ReturnType<typeof renderEnglishWritingSequences>["navGroups"][number], pages: ReturnType<typeof renderEnglishWritingSequences>["pages"]) {
  const items = [
    ...(group.landingItemLabel ? [{ id: group.id, label: group.landingItemLabel }] : []),
    ...group.itemPageIds.map((id) => ({ id, label: pages.find((page) => page.id === id)?.label ?? id })),
  ];
  return `<div class="nav-group ela30-writing-nav-group" data-nav-group="${group.id}">
    <a class="course-nav-link nav-group-toggle flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#${group.id}" data-page-target="${group.id}" data-nav-group-toggle="${group.id}" aria-expanded="false" aria-controls="${group.id}-subnav"><span class="material-symbols-outlined" aria-hidden="true">${group.icon}</span><span class="sidebar-label">${group.label}</span><span class="material-symbols-outlined lessons-toggle-icon nav-group-icon ml-auto" aria-hidden="true">expand_more</span></a>
    <div class="lesson-subnav nav-group-subnav" id="${group.id}-subnav" data-activity-subnav="${group.id}">${items.map((item, index) => `<a class="sublesson-link" href="#${item.id}" data-page-target="${item.id}">${index + 1}. ${item.label}</a>`).join("")}</div>
  </div>`;
}

function findContainerEnd(html: string, startIndex: number) {
  const tagPattern = /<\/?div\b[^>]*>/gi;
  tagPattern.lastIndex = startIndex;
  let depth = 0;
  for (let match = tagPattern.exec(html); match; match = tagPattern.exec(html)) {
    if (match[0].startsWith("</")) depth -= 1;
    else depth += 1;
    if (depth === 0) return tagPattern.lastIndex;
  }
  return -1;
}

function insertAfterContainer(html: string, containerPattern: RegExp, block: string, label: string) {
  const match = containerPattern.exec(html);
  if (match?.index == null) throw new Error(`ELA 30-1 writing retrofit could not find ${label}.`);
  const end = findContainerEnd(html, match.index);
  if (end < 0) throw new Error(`ELA 30-1 writing retrofit could not find the end of ${label}.`);
  return `${html.slice(0, end)}\n${block}${html.slice(end)}`;
}

function injectWritingNavigation(html: string, block: string, project: WritingProjectDefinition) {
  if (project.includeCriticalEssay) {
    return insertAfterContainer(html, /<div\b[^>]*class="[^"]*\blessons-nav\b[^"]*"[^>]*>/i, block, "the Lessons navigation group");
  }
  return insertAfterContainer(html, /<div\b[^>]*class="[^"]*\bnav-group\b[^"]*"[^>]*data-nav-group="critical-writing"[^>]*>/i, block, "the existing Critical Essay navigation group");
}

function injectBeforeEvidenceOrResources(html: string, block: string, kind: "nav" | "route") {
  const evidenceMarker = kind === "nav"
    ? "<!-- canvas-helper:ela30-evidence-retrofit:nav:start -->"
    : "<!-- canvas-helper:ela30-evidence-retrofit:route:start -->";
  const evidenceMarkerIndex = html.indexOf(evidenceMarker);
  if (evidenceMarkerIndex >= 0) {
    return `${html.slice(0, evidenceMarkerIndex)}${block}\n${html.slice(evidenceMarkerIndex)}`;
  }
  const patterns = kind === "nav"
    ? [/<a\b(?=[^>]*href="#evidence-bank")(?=[^>]*data-page-target="evidence-bank")[^>]*>/, /<a\b(?=[^>]*href="#resources")(?=[^>]*data-page-target="resources")[^>]*>/]
    : [/<section\s+id="evidence-bank"(?=[\s>])/, /<section\s+id="resources"(?=[\s>])/];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.index != null) return `${html.slice(0, match.index)}${block}\n${html.slice(match.index)}`;
  }
  throw new Error(`ELA 30-1 writing retrofit could not find the ${kind} insertion point.`);
}

function injectBeforeEvidenceMarkerOrClosingTag(
  html: string,
  block: string,
  evidenceMarker: string,
  closingTag: "</head>" | "</body>",
) {
  const markerIndex = html.indexOf(evidenceMarker);
  if (markerIndex >= 0) return `${html.slice(0, markerIndex)}${block}\n${html.slice(markerIndex)}`;
  const closingIndex = html.indexOf(closingTag);
  if (closingIndex < 0 || html.indexOf(closingTag, closingIndex + closingTag.length) >= 0) {
    throw new Error(`ELA 30-1 writing retrofit expected exactly one ${closingTag} insertion point.`);
  }
  return `${html.slice(0, closingIndex)}${block}\n${html.slice(closingIndex)}`;
}

function patchQuotedRouteArray(html: string, declaration: "pageIds" | "staticPages", routeIds: string[], excludedRouteIds: readonly string[] = []) {
  const pattern = new RegExp(`const ${declaration} = \\[([^\\]]*)\\];`);
  const match = html.match(pattern);
  if (!match) throw new Error(`ELA 30-1 writing retrofit could not find ${declaration}.`);
  const excluded = new Set(excludedRouteIds);
  const existing = Array.from(match[1]!.matchAll(/"([^"]+)"/g)).map((entry) => entry[1]!).filter((id) => !excluded.has(id));
  const before = existing.indexOf("evidence-bank") >= 0 ? existing.indexOf("evidence-bank") : existing.indexOf("resources");
  const merged = [...existing];
  merged.splice(before >= 0 ? before : merged.length, 0, ...routeIds.filter((id) => !merged.includes(id)));
  return html.replace(match[0], `const ${declaration} = [${merged.map((id) => `"${id}"`).join(",")}];`);
}

function patchOthelloRoutes(html: string, routeIds: string[]) {
  const pattern = /\["overview",\s*"lessons",\s*"side-by-side",\s*"story-bank",\s*"story-questions",\s*"character-notes",\s*"writing",\s*"film-room",([\s\S]*?)"evidence-bank",\s*"resources"\]/;
  const match = html.match(pattern);
  if (!match) throw new Error("ELA 30-1 writing retrofit could not find Othello's non-lesson route list.");
  const currentWritingRoutes = Array.from((match[1] ?? "").matchAll(/"([^"]+)"/g)).map((entry) => entry[1]!);
  const beforeEvidence = [...currentWritingRoutes, ...routeIds.filter((id) => !currentWritingRoutes.includes(id))].map((id) => `"${id}"`).join(", ");
  return html.replace(match[0], `["overview", "lessons", "side-by-side", "story-bank", "story-questions", "character-notes", "writing", "film-room", ${beforeEvidence}, "evidence-bank", "resources"]`);
}

export function applyEla30WritingRetrofit(input: { projectSlug: string; html: string }) {
  const project = PROJECTS[input.projectSlug as Ela30WritingProjectSlug];
  if (!project) throw new Error(`Unsupported ELA 30-1 writing project: ${input.projectSlug}`);
  let baseHtml = correctLegacyCourseLabel(stripRetrofit(input.html), project);
  baseHtml = stripLegacyCriticalNavigation(baseHtml, project);
  baseHtml = redirectLegacyCriticalLinks(baseHtml, project);
  const rendered = renderEnglishWritingSequences(project);
  const routeIds = rendered.pages.map((page) => page.id);
  if (project.pageListKind === "pageIds") baseHtml = patchQuotedRouteArray(baseHtml, "pageIds", routeIds, LEGACY_CRITICAL_ROUTE_IDS);
  if (project.pageListKind === "staticPages") baseHtml = patchQuotedRouteArray(baseHtml, "staticPages", routeIds);
  if (project.pageListKind === "othello") baseHtml = patchOthelloRoutes(baseHtml, routeIds);
  const sourceHash = sha256(baseHtml);
  let html = baseHtml;
  const nav = markerBlock(MARKERS.nav, rendered.navGroups.map((group) => renderNavGroup(group, rendered.pages)).join("\n"));
  const routes = markerBlock(
    MARKERS.routes,
    rendered.pages
      .map((page) => page.html
        .replace(`<section id="${page.id}"`, `<section id="${page.id}" data-page="${page.id}"`)
        .replace(/[ \t]+$/gm, ""))
      .join("\n"),
  );
  html = injectWritingNavigation(html, nav, project);
  html = injectBeforeEvidenceOrResources(html, routes, "route");
  html = injectBeforeEvidenceMarkerOrClosingTag(
    html,
    markerBlock(MARKERS.styles, `<style data-ela30-writing-retrofit-styles>\n${ENGLISH_ACTIVITY_PROFILE_CSS}\n${ENGLISH_WRITING_SEQUENCE_CSS}\n${renderEla30WritingNavCss(project)}\n</style>`),
    "<!-- canvas-helper:ela30-evidence-retrofit:styles:start -->",
    "</head>",
  );
  html = injectBeforeEvidenceMarkerOrClosingTag(
    html,
    markerBlock(MARKERS.runtime, `<script>${ENGLISH_WRITING_SEQUENCE_RUNTIME}\n${renderEla30WritingNavRuntime(project)}</script>`),
    "<!-- canvas-helper:ela30-evidence-retrofit:runtime:start -->",
    "</body>",
  );
  const failures = [
    ...Object.values(MARKERS).flatMap((markers) => markers.flatMap((marker) => html.split(marker).length - 1 === 1 ? [] : [`Expected one marker: ${marker}`])),
    ...routeIds.flatMap((id) => html.includes(`id="${id}" data-page="${id}"`) && html.includes(`data-page-target="${id}"`) ? [] : [`Missing writing route or navigation target: ${id}`]),
  ];
  if (failures.length) throw new Error(`${project.projectSlug} writing retrofit is incomplete: ${failures.join("; ")}`);
  return { html, changed: html !== input.html, sourceHash, outputHash: sha256(html), project, routeIds };
}

export function getEla30WritingProjectDefinition(projectSlug: string) {
  const project = PROJECTS[projectSlug as Ela30WritingProjectSlug];
  if (!project) throw new Error(`Unsupported ELA 30-1 writing project: ${projectSlug}`);
  return project;
}
