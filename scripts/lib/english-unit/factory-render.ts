import { renderNextStepCourseShell, type NextStepShellLesson, type NextStepShellNavItem } from "../next-step-course-shell.js";
import {
  ENGLISH_ACTIVITY_PROFILE_CSS,
  ENGLISH_ACTIVITY_PROFILE_RUNTIME
} from "./activity-profile-runtime.js";
import type { EnglishMaterialHook, EnglishRenderedActivityProfile } from "./activity-profile-renderers.js";
import { safeId } from "./source.js";
import type { EnglishBuiltLesson, EnglishUnitRecipeV2 } from "./types.js";
import type { EnglishPreparedResource } from "./factory-resources.js";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function lessonSummary(lesson: EnglishBuiltLesson) {
  return lesson.text.length > 180 ? `${lesson.text.slice(0, 177).trim()}...` : lesson.text;
}

function renderSupportingResources(lesson: EnglishBuiltLesson) {
  if (!lesson.supportingResources.length) return "";
  return `<section class="lesson-source-links--ela30"><h3>Lesson resources</h3><ul>${lesson.supportingResources
    .map((resource) => `<li><a href="${escapeHtml(resource.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(resource.title)}</a></li>`)
    .join("")}</ul></section>`;
}

function buildShellLessons(recipe: EnglishUnitRecipeV2, lessons: EnglishBuiltLesson[]): NextStepShellLesson[] {
  const groupByLessonId = new Map<string, string>();
  recipe.lessonGroups.forEach((group) => group.lessonIds.forEach((lessonId) => groupByLessonId.set(lessonId, group.title)));
  return lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title.replace(/^Lesson\s+\d+[:.\s-]*/i, ""),
    pageTitle: lesson.title,
    summary: lessonSummary(lesson),
    group: groupByLessonId.get(lesson.id),
    html: `<div class="source-content">${lesson.html}</div>${renderSupportingResources(lesson)}`
  }));
}

function renderEvidenceBank(recipe: EnglishUnitRecipeV2, activityPages: EnglishRenderedActivityProfile["pages"]) {
  const draftBase = `${safeId(recipe.projectSlug)}:evidence-bank:quick-entry`;
  const activityLinks = activityPages
    .slice(0, 4)
    .map((page) => `<a href="#${escapeHtml(page.id)}" data-page-target="${escapeHtml(page.id)}"><span class="material-symbols-outlined" aria-hidden="true">${escapeHtml(page.icon)}</span>${escapeHtml(page.label)}</a>`)
    .join("");
  return `<section id="evidence-bank" class="course-page" hidden>
    <p class="route-kicker">${escapeHtml(recipe.courseCode)} | Evidence Bank</p>
    <h2 class="route-title">Evidence Bank</h2>
    <p class="route-description">Save only the evidence, activity collections, and writing plans you deliberately choose. Working drafts remain in their original activity.</p>
    <div class="english-evidence-bank-actions">${activityLinks}</div>
    <section class="english-evidence-bank-list" aria-labelledby="saved-evidence-title">
      <div class="english-evidence-bank-heading">
        <div><p>Shared unit notebook</p><h3 id="saved-evidence-title">Saved evidence</h3></div>
        <button type="button" data-print-writing><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
      </div>
      <div class="english-evidence-filter-grid" data-evidence-bank-filters>
        <label>Activity<select data-evidence-bank-filter="activity"><option value="">All activities</option></select></label>
        <label>Text or film<select data-evidence-bank-filter="work"><option value="">All texts and films</option></select></label>
        <label>Act, chapter, or timestamp<select data-evidence-bank-filter="locator"><option value="">All locations</option></select></label>
        <label>Evidence type<select data-evidence-bank-filter="type"><option value="">All evidence types</option></select></label>
      </div>
      <div class="english-evidence-card-list" data-manual-evidence-list></div>
    </section>
    <section class="english-evidence-capture english-evidence-bank-capture" data-writing-activity-panel data-evidence-notebook-panel>
      <div class="english-evidence-capture-heading"><div><p>Quick entry</p><h3>Add evidence directly</h3><span>Use this only for a useful detail that is not already captured by a guided activity.</span></div><span class="material-symbols-outlined" aria-hidden="true">note_add</span></div>
      <div class="english-evidence-fields">
        <label>Source text, film, or lesson<input type="text" data-response-id="${escapeHtml(`${draftBase}:source`)}" data-evidence-draft="source" placeholder="Name the source and useful location."></label>
        <label>Literary or film concept<input type="text" data-response-id="${escapeHtml(`${draftBase}:concept`)}" data-evidence-draft="concept" placeholder="Example: conflict, motif, framing, or point of view."></label>
      </div>
      <label>Exact evidence<textarea rows="4" data-response-id="${escapeHtml(`${draftBase}:detail`)}" data-evidence-draft="detail" placeholder="Record the quotation, stage action, image, scene detail, or film moment."></textarea></label>
      <label>Analytical value<textarea rows="4" data-response-id="${escapeHtml(`${draftBase}:connection`)}" data-evidence-draft="connection" placeholder="Explain what the evidence suggests and how it could support an interpretation."></textarea></label>
      <div class="english-evidence-actions"><button class="evidence-bank-save-action" type="button" data-save-evidence-note><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save to Evidence Bank</button><span data-save-status aria-live="polite">Draft saves automatically</span></div>
    </section>
  </section>`;
}

function renderStandardResources(recipe: EnglishUnitRecipeV2, resources: EnglishPreparedResource[], lessons: EnglishBuiltLesson[]) {
  const resourceCards = resources
    .filter((resource) => resource.href)
    .map((resource) => `<article class="english-factory-resource-card">
      <div><span>${escapeHtml(resource.role.replace(/-/g, " "))}</span><h3>${escapeHtml(resource.title)}</h3><p>${escapeHtml(resource.reviewRequired ? "Available in this draft; editorial or rights review is still required." : "Teacher-selected or lesson-linked course material.")}</p></div>
      <div class="english-factory-resource-actions"><a href="${escapeHtml(resource.href ?? "#")}" target="_blank" rel="noopener noreferrer">Open</a><a href="${escapeHtml(resource.href ?? "#")}" download>Download</a></div>
    </article>`)
    .join("");
  const external = lessons.flatMap((lesson) => lesson.supportingResources).filter((resource) => resource.kind === "external");
  const externalCards = external.map((resource) => `<article class="english-factory-resource-card"><div><span>lesson link</span><h3>${escapeHtml(resource.title)}</h3><p>${escapeHtml(resource.lessonTitle)}</p></div><div class="english-factory-resource-actions"><a href="${escapeHtml(resource.href)}" target="_blank" rel="noopener noreferrer">Open</a></div></article>`).join("");
  return `<section id="resources" class="course-page" hidden>
    <p class="route-kicker">${escapeHtml(recipe.courseCode)} | Resources</p><h2 class="route-title">Resources</h2>
    <p class="route-description">Original teacher-selected materials and valid supporting links. Excluded assessment material and unrelated folders never appear here.</p>
    <div class="english-factory-resource-list">${resourceCards || "<p class=\"english-material-access-note\">No downloadable teacher resources are approved for this unit yet.</p>"}${externalCards}</div>
  </section>`;
}

function renderShakespeareResourceCard(input: {
  title: string;
  href: string;
  kind: "local" | "external";
  description: string;
  download?: boolean;
}) {
  return `<article class="external-resource-card">
    <span class="resource-kicker">${input.kind === "external" ? "External Source" : "Local Source"}</span>
    <h3>${escapeHtml(input.title)}</h3>
    <p>${escapeHtml(input.description)}</p>
    <div class="external-resource-actions">
      <a class="external-resource-action" href="${escapeHtml(input.href)}" target="_blank" rel="noopener noreferrer">Open Resource</a>
      ${input.download ? `<a class="external-resource-action external-resource-action--secondary" href="${escapeHtml(input.href)}" download>Download</a>` : ""}
    </div>
  </article>`;
}

function renderShakespeareResources(
  recipe: EnglishUnitRecipeV2,
  resources: EnglishPreparedResource[],
  lessons: EnglishBuiltLesson[],
  profileLinks: EnglishMaterialHook[]
) {
  const localResources = resources.filter((resource): resource is EnglishPreparedResource & { href: string } => Boolean(resource.href));
  const approvedProfileLinks = profileLinks.filter((resource): resource is EnglishMaterialHook & { href: string } =>
    Boolean(resource.href && /^https?:\/\//i.test(resource.href) && resource.status !== "needs-review")
  );
  const lessonGroups = lessons
    .map((lesson) => ({
      id: `resources-${safeId(lesson.id)}`,
      title: lesson.title.replace(/^Lesson\s+\d+[:.\s-]*/i, ""),
      cards: Array.from(
        new Map(
          lesson.supportingResources.map((resource) => [
            `${resource.kind}:${resource.href}`,
            resource
          ])
        ).values()
      )
    }))
    .filter((group) => group.cards.length > 0);
  const resourceGroups = [
    ...(approvedProfileLinks.length ? [{
      id: "resources-play-access",
      title: "Play Access and Study Support",
      cards: approvedProfileLinks.map((resource) => ({
        title: resource.title,
        href: resource.href,
        kind: "external" as const,
        lessonTitle: resource.description ?? "Teacher-selected Macbeth support link."
      }))
    }] : []),
    ...lessonGroups
  ];
  const localBlock = localResources.length
    ? `<section class="resource-lesson-group resource-lesson-group--documents">
        <div class="resource-group-heading">
          <h3>Recovered Unit Documents</h3>
          <p>Teacher-selected files available for this unit.</p>
        </div>
        <div class="resource-lesson-items">
          ${localResources.map((resource) => renderShakespeareResourceCard({
            title: resource.title,
            href: resource.href,
            kind: "local",
            description: resource.reviewRequired
              ? "Available in this draft; editorial or rights review is still required."
              : "Original teacher-selected unit material.",
            download: true
          })).join("")}
        </div>
      </section>`
    : "";
  const groupControl = resourceGroups.length
    ? `<div class="scene-overview-control">
        <label for="shakespeare-resource-select">Choose a lesson group</label>
        <select id="shakespeare-resource-select" data-response-id="${escapeHtml(`${recipe.projectSlug}:resources:selected-group`)}" data-english-activity-select="shakespeare-resource-groups">
          ${resourceGroups.map((group, index) => `<option value="${escapeHtml(group.id)}"${index === 0 ? " selected" : ""}>${escapeHtml(group.title)}</option>`).join("")}
        </select>
      </div>
      ${resourceGroups.map((group, index) => `<section class="resource-lesson-group" data-english-activity-panel-group="shakespeare-resource-groups" data-english-activity-panel="${escapeHtml(group.id)}"${index === 0 ? "" : " hidden"}>
        <div class="resource-lesson-items">
          ${group.cards.map((resource) => renderShakespeareResourceCard({
            title: resource.title,
            href: resource.href,
            kind: resource.kind,
            description: resource.lessonTitle,
            download: resource.kind === "local"
          })).join("")}
        </div>
      </section>`).join("")}`
    : "";
  const empty = !localBlock && !groupControl
    ? `<article class="empty-route-card"><h3>No extra source links yet</h3><p>No approved unit documents or lesson links are available in this draft.</p></article>`
    : "";

  return `<section id="resources" class="course-page shakespeare-resources-page" hidden>
    <p class="route-kicker">${escapeHtml(recipe.courseCode)} | Resources</p>
    <h2 class="route-title">Source Resources</h2>
    <p class="route-description">Teacher-selected materials and lesson links are organized here by source lesson. Excluded assessments and unrelated folders never appear.</p>
    <div class="resource-stack">${localBlock}${groupControl}${empty}</div>
  </section>`;
}

function renderResources(
  recipe: EnglishUnitRecipeV2,
  resources: EnglishPreparedResource[],
  lessons: EnglishBuiltLesson[],
  profileKind: EnglishRenderedActivityProfile["kind"],
  profileLinks: EnglishMaterialHook[] = []
) {
  return profileKind === "shakespeare-drama"
    ? renderShakespeareResources(recipe, resources, lessons, profileLinks)
    : renderStandardResources(recipe, resources, lessons);
}

function renderFilmRoom(recipe: EnglishUnitRecipeV2, videos: Array<{ id: string; lessonTitle: string; embedSrc: string }>) {
  const options = videos.map((video) => `<option value="${escapeHtml(video.id)}">${escapeHtml(video.lessonTitle)}</option>`).join("");
  const panels = videos.map((video, index) => `<article class="english-film-panel" data-film-panel="${escapeHtml(video.id)}" ${index ? "hidden" : ""}><h3>${escapeHtml(video.lessonTitle)}</h3><iframe src="${escapeHtml(video.embedSrc)}" title="${escapeHtml(`${video.lessonTitle} concept video`)}" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><a href="https://www.youtube.com/watch?v=${escapeHtml(video.id)}" target="_blank" rel="noopener noreferrer">Open directly on YouTube</a></article>`).join("");
  return `<section id="film-room" class="course-page" hidden><p class="route-kicker">${escapeHtml(recipe.courseCode)} | Film Room</p><h2 class="route-title">Film Room</h2><p class="route-description">Verified lesson videos are collected here and remain available in their source lessons.</p>${videos.length ? `<label class="english-film-picker">Choose a concept video<select data-film-select>${options}</select></label>${panels}` : `<p class="english-material-access-note">No embeddable concept videos were approved for this unit. Use the verified links in Resources where available.</p>`}</section>`;
}

const FACTORY_CSS = `
.lesson-detail-panel--ela30 { border-top: 4px solid #154212; border-radius: 8px; background: #f3f4f5; padding: 40px; }
.lesson-heading-row--ela30 { margin: 0 0 24px; }
.lesson-heading-row--ela30 h2 { margin: 0; font: 800 32px/1.2 "Hanken Grotesk", sans-serif; }
.lesson-page--ela30 .source-content { max-width: none; font-family: "Work Sans", sans-serif; font-size: 16px; line-height: 1.65; }
.lesson-page--ela30 .source-content img { display: block; width: min(100%, 680px); max-height: 420px; height: auto; margin: 18px auto; border: 1px solid #d9dadb; border-radius: 8px; object-fit: contain; }
.lesson-page--ela30 .source-content iframe { display: block; width: min(100%, 760px); aspect-ratio: 16/9; margin: 18px auto; border: 1px solid #d9dadb; border-radius: 8px; }
.lesson-source-links--ela30 { margin-top: 32px; border: 1px solid #d9dadb; border-radius: 8px; background: #fff; padding: 20px; }
.lesson-source-links--ela30 h3 { margin-top: 0; }
.lesson-bottom-bar--ela30 { margin-top: 32px; padding-top: 20px; border-top: 1px solid #d9dadb; }
.english-evidence-bank-actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 20px 0; }
.english-evidence-bank-actions a, .english-factory-resource-actions a, .english-film-panel > a { display: inline-flex; align-items: center; gap: 7px; min-height: 40px; border: 1px solid #7d9272; border-radius: 6px; color: #24491f; padding: 8px 12px; font-weight: 700; text-decoration: none; }
.english-evidence-bank-list, .english-evidence-capture { margin-top: 20px; border: 1px solid #d9dadb; border-radius: 8px; background: #fff; padding: 22px; }
.english-evidence-bank-heading, .english-evidence-capture-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 14px; border-bottom: 1px solid #e3e6e1; }
.english-evidence-bank-heading p, .english-evidence-capture-heading p { margin: 0 0 5px; color: #154212; font: 700 12px/1.3 "IBM Plex Sans", sans-serif; text-transform: uppercase; }
.english-evidence-bank-heading h3, .english-evidence-capture-heading h3 { margin: 0; }
.english-evidence-filter-grid, .english-evidence-fields { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; margin: 18px 0; }
.english-evidence-filter-grid label, .english-evidence-capture label, .english-film-picker { display: grid; gap: 6px; font-weight: 700; }
.english-evidence-filter-grid select, .english-evidence-capture input, .english-evidence-capture textarea, .english-film-picker select { width: 100%; border: 1px solid #aeb8a7; border-radius: 6px; padding: 10px 12px; font: inherit; }
.english-evidence-card-list { display: grid; grid-template-columns: repeat(auto-fit,minmax(280px,1fr)); gap: 12px; }
.english-evidence-card-list .social-lesson-evidence-card { border: 1px solid #d9dadb; border-radius: 8px; background: #fbfcfa; padding: 16px; }
.english-evidence-card-list .social-evidence-card-detail p { white-space: pre-wrap; }
.english-evidence-capture { display: grid; gap: 16px; }
.english-evidence-actions { display: flex; align-items: center; gap: 10px; }
.evidence-bank-save-action { border: 1px solid #154212 !important; border-radius: 6px; background: #154212 !important; color: #fff !important; padding: 9px 13px; font-weight: 700; }
.english-factory-resource-list { display: grid; gap: 12px; margin-top: 20px; }
.english-factory-resource-card { display: flex; align-items: center; justify-content: space-between; gap: 18px; border: 1px solid #d9dadb; border-radius: 8px; padding: 18px; }
.english-factory-resource-card span { color: #154212; font: 700 12px/1.3 "IBM Plex Sans", sans-serif; text-transform: uppercase; }
.english-factory-resource-card h3, .english-factory-resource-card p { margin: 4px 0; }
.english-factory-resource-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.shakespeare-resources-page .resource-stack { display: grid; gap: 22px; margin-top: 24px; }
.shakespeare-resources-page .resource-lesson-group { border: 1px solid #d9dadb; border-radius: 8px; background: #fff; overflow: hidden; }
.shakespeare-resources-page .resource-group-heading { border-bottom: 1px solid #d9dadb; padding: 20px 22px; }
.shakespeare-resources-page .resource-group-heading h3,
.shakespeare-resources-page .resource-group-heading p { margin: 0; }
.shakespeare-resources-page .resource-group-heading p { margin-top: 5px; color: #555d52; }
.shakespeare-resources-page .resource-lesson-items { display: grid; gap: 14px; padding: 18px; }
.shakespeare-resources-page .external-resource-card { border: 1px solid #d9dadb; border-radius: 8px; background: #fff; padding: 20px; }
.shakespeare-resources-page .external-resource-card h3 { margin: 6px 0; }
.shakespeare-resources-page .external-resource-card p { margin: 0 0 15px; overflow-wrap: anywhere; }
.shakespeare-resources-page .resource-kicker { color: #154212; font: 700 12px/1.3 "IBM Plex Sans", sans-serif; text-transform: uppercase; }
.shakespeare-resources-page .external-resource-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.shakespeare-resources-page .external-resource-action { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; width: fit-content; border: 1px solid #0d4f12; border-radius: 8px; background: #0d4f12; color: #fff; padding: 0 16px; font-weight: 800; text-decoration: none; }
.shakespeare-resources-page .external-resource-action--secondary { background: #fff; color: #0d4f12; }
.shakespeare-resources-page .external-resource-action:hover,
.shakespeare-resources-page .external-resource-action:focus-visible { border-color: #0a3e0e; background: #0a3e0e; color: #fff; outline: 3px solid rgba(13,79,18,.2); outline-offset: 2px; }
.shakespeare-resources-page .scene-overview-control { display: grid; grid-template-columns: minmax(180px, 280px) minmax(0, 1fr); align-items: center; gap: 18px; border: 1px solid #d9dadb; border-radius: 8px; background: #f5f7f1; padding: 18px; }
.shakespeare-resources-page .scene-overview-control label { color: #154212; font-weight: 800; }
.shakespeare-resources-page .scene-overview-control select { width: 100%; min-height: 46px; border: 1px solid #aeb8a7; border-radius: 6px; background: #fff; padding: 10px 12px; font: inherit; }
.english-film-picker { margin: 20px 0; }
.english-film-panel { border: 1px solid #d9dadb; border-radius: 8px; padding: 18px; }
.english-film-panel iframe { width: 100%; aspect-ratio: 16/9; border: 0; margin: 12px 0; }
.english-material-access-note { border-left: 3px solid #7d9272; background: #f5f7f1; padding: 12px 14px; }
@media(max-width:760px){.lesson-detail-panel--ela30{padding:22px}.english-evidence-filter-grid,.english-evidence-fields{grid-template-columns:1fr}.english-factory-resource-card{align-items:stretch;flex-direction:column}.english-evidence-bank-heading,.english-evidence-capture-heading{display:grid}.shakespeare-resources-page .scene-overview-control{grid-template-columns:1fr}}
@media print{.english-evidence-filter-grid,.english-evidence-bank-actions,.english-evidence-actions{display:none!important}}
`;

export function renderEnglishFactoryUnit(input: {
  recipe: EnglishUnitRecipeV2;
  lessons: EnglishBuiltLesson[];
  activityProfile: EnglishRenderedActivityProfile;
  resources: EnglishPreparedResource[];
  videos: Array<{ id: string; lessonTitle: string; embedSrc: string }>;
}) {
  const shellLessons = buildShellLessons(input.recipe, input.lessons);
  const activityNav: NextStepShellNavItem[] = input.activityProfile.pages.map((page) => ({
    id: page.id,
    label: page.label,
    icon: page.icon,
    html: page.html
  }));
  const nextRoute = activityNav[0];
  const navItems: NextStepShellNavItem[] = [
    ...activityNav,
    { id: "evidence-bank", label: "Evidence Bank", icon: "library_books", html: renderEvidenceBank(input.recipe, input.activityProfile.pages) },
    ...(input.videos.length ? [{ id: "film-room", label: "Film Room", icon: "live_tv", html: renderFilmRoom(input.recipe, input.videos) }] : []),
    { id: "resources", label: "Resources", icon: "folder_open", html: renderResources(input.recipe, input.resources, input.lessons, input.activityProfile.kind, input.activityProfile.resourceLinks) }
  ];
  const html = renderNextStepCourseShell({
    slug: input.recipe.projectSlug,
    courseTitle: input.recipe.unitTitle,
    courseCode: input.recipe.courseCode,
    overviewIntro: `Use the ${input.recipe.unitTitle} lessons and activities to build interpretation, evidence, and polished English 20-1 responses.`,
    outcomes: [
      "I can interpret how authors, playwrights, and filmmakers shape meaning.",
      "I can select precise evidence and explain its analytical value.",
      "I can develop sustained responses through the activity system for this unit.",
      "I can deliberately collect useful work in a shared unit Evidence Bank."
    ],
    lessons: shellLessons,
    completionIds: shellLessons.map((lesson) => lesson.id),
    lessonPresentation: "ela30",
    showLessonSubnavHeadings: false,
    showLessonCardSummary: true,
    lessonGroupTitle: input.recipe.unitTitle,
    lessonSequenceTitle: `${input.recipe.unitTitle} Lesson Sequence`,
    sourceLessonLabel: "selected Brightspace lessons",
    nextAfterLastLesson: nextRoute ? { id: nextRoute.id, label: nextRoute.label } : undefined,
    logoPath: "assets/generated/brand/nxt-ce-logo-white-with-ce.png",
    storageKeyBase: `canvas-helper:${input.recipe.projectSlug}`,
    navItems,
    extraCss: `${FACTORY_CSS}\n${ENGLISH_ACTIVITY_PROFILE_CSS}`
  });
  const withRuntime = html.replace("</body>", `<script>${ENGLISH_ACTIVITY_PROFILE_RUNTIME}</script></body>`);
  return withRuntime.replace(/[ \t]+$/gm, "");
}

export const englishFactoryRenderInternals = { buildShellLessons, renderEvidenceBank, renderResources, renderFilmRoom };
