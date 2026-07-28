import {
  renderNextStepCourseShell,
  type NextStepShellLesson,
  type NextStepShellNavGroup,
  type NextStepShellNavItem
} from "../next-step-course-shell.js";
import {
  ENGLISH_ACTIVITY_PROFILE_CSS,
  ENGLISH_ACTIVITY_PROFILE_RUNTIME
} from "./activity-profile-runtime.js";
import type { EnglishMaterialHook, EnglishRenderedActivityProfile } from "./activity-profile-renderers.js";
import { safeId } from "./source.js";
import type { EnglishBuiltLesson, EnglishUnitRecipeV2, EnglishUnitRecipeV3 } from "./types.js";
import type { EnglishPreparedResource } from "./factory-resources.js";
import { composeEnglishV3Runtime } from "./v3-runtime-sanitizer.js";

type EnglishFactoryRecipe = EnglishUnitRecipeV2 | EnglishUnitRecipeV3;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function recipeRouteEnabled(recipe: EnglishFactoryRecipe, route: string, fallback: boolean) {
  const activity = recipe.activityProfile.activities.find((candidate) => candidate.route === route);
  return activity ? activity.enabled : fallback;
}

function lessonSummary(lesson: EnglishBuiltLesson) {
  return lesson.text.length > 180 ? `${lesson.text.slice(0, 177).trim()}...` : lesson.text;
}

function cleanLessonTitle(title: string) {
  return title.replace(/^Lesson\s+\d+[:.\s-]*/i, "");
}

function lessonSourceClass(recipe: EnglishFactoryRecipe) {
  return recipe.courseCode === "ELA 10-2"
    ? "source-content source-content--ela10-2"
    : "source-content";
}

function renderSupportingResources(lesson: EnglishBuiltLesson) {
  if (!lesson.supportingResources.length) return "";
  return `<section class="lesson-source-links--ela30"><h3>Lesson resources</h3><ul>${lesson.supportingResources
    .map((resource) => `<li><a href="${escapeHtml(resource.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(resource.title)}</a></li>`)
    .join("")}</ul></section>`;
}

function renderFactoryElementsHub(
  recipe: EnglishFactoryRecipe,
  hub: EnglishBuiltLesson,
  children: EnglishBuiltLesson[]
) {
  const lessonByTitle = new Map(children.map((lesson) => [lesson.title, lesson]));
  const workbenchLessons = (recipe.fictionElementsHub?.childLessons ?? [])
    .map((title) => lessonByTitle.get(title))
    .filter((lesson): lesson is EnglishBuiltLesson => Boolean(lesson));
  if (!workbenchLessons.length) return "";

  return `<section class="elements-workbench elements-checklist" data-elements-checklist aria-labelledby="${escapeHtml(`${hub.id}-checklist-title`)}">
    <div class="elements-checklist-header">
      <h3 id="${escapeHtml(`${hub.id}-checklist-title`)}">Elements of Fiction Checklist</h3>
      <p data-elements-complete-summary>0/${workbenchLessons.length} elements complete</p>
    </div>
    <table class="elements-table">
      <thead><tr><th scope="col">Done</th><th scope="col">Element</th><th scope="col">What to review</th></tr></thead>
      <tbody>${workbenchLessons.map((lesson, index) => `<tr>
        <td><button class="element-check" type="button" data-element-complete-for="${escapeHtml(lesson.id)}" data-complete-id="${escapeHtml(lesson.id)}" data-complete-label="Mark complete" aria-label="Mark ${escapeHtml(cleanLessonTitle(lesson.title))} complete">-</button></td>
        <td><button class="element-selector${index === 0 ? " active" : ""}" type="button" aria-selected="${index === 0 ? "true" : "false"}" data-element-target="${escapeHtml(lesson.id)}">${escapeHtml(cleanLessonTitle(lesson.title))}</button></td>
        <td>${escapeHtml(lessonSummary(lesson))}</td>
      </tr>`).join("")}</tbody>
    </table>
    <div class="element-panels">
      ${workbenchLessons.map((lesson, index) => `<article class="element-panel" data-element-panel="${escapeHtml(lesson.id)}"${index === 0 ? "" : " hidden"}>
        <h3>${escapeHtml(cleanLessonTitle(lesson.title))}</h3>
        <div class="${lessonSourceClass(recipe)}">${lesson.html}</div>
        ${renderSupportingResources(lesson)}
        <div class="element-completion-bar"><button class="mark-complete lesson-complete-button--ela30" type="button" data-complete-id="${escapeHtml(lesson.id)}" data-complete-label="Mark Complete">Mark Complete</button></div>
      </article>`).join("")}
    </div>
  </section>`;
}

function buildShellLessons(recipe: EnglishFactoryRecipe, lessons: EnglishBuiltLesson[]): NextStepShellLesson[] {
  const groupByLessonId = new Map<string, string>();
  recipe.lessonGroups.forEach((group) => group.lessonIds.forEach((lessonId) => groupByLessonId.set(lessonId, group.title)));
  const lessonByTitle = new Map(lessons.map((lesson) => [lesson.title, lesson]));
  const orderedLessons = recipe.fictionElementsHub
    ? recipe.topLevelLessonOrder
        .map((title) => lessonByTitle.get(title))
        .filter((lesson): lesson is EnglishBuiltLesson => Boolean(lesson))
    : lessons;
  return orderedLessons.map((lesson) => ({
    id: lesson.id,
    title: cleanLessonTitle(lesson.title),
    pageTitle: lesson.title,
    summary: lessonSummary(lesson),
    group: groupByLessonId.get(lesson.id) ?? groupByLessonId.get(lesson.title),
    html: `<div class="${lessonSourceClass(recipe)}">${lesson.html}</div>${renderSupportingResources(lesson)}${recipe.fictionElementsHub?.hubLesson === lesson.title ? renderFactoryElementsHub(recipe, lesson, lessons) : ""}`
  }));
}

function renderEvidenceBank(
  recipe: EnglishFactoryRecipe,
  activityPages: EnglishRenderedActivityProfile["pages"],
  activityGroups: NonNullable<EnglishRenderedActivityProfile["navGroups"]> = []
) {
  const draftBase = `${safeId(recipe.projectSlug)}:evidence-bank:quick-entry`;
  const darkHeaderClass = recipe.activityProfile.kind === "novel-study"
    ? " english-dark-worksheet-header novel-dark-worksheet-header"
    : " english-dark-worksheet-header";
  const groupedChildIds = new Set(activityGroups.flatMap((group) => group.itemPageIds));
  const groupsByLandingPage = new Map(activityGroups.map((group) => [group.id, group]));
  const activityLinks = activityPages
    .filter((page) => !groupedChildIds.has(page.id))
    .slice(0, 4)
    .map((page) => {
      const group = groupsByLandingPage.get(page.id);
      const label = group?.label ?? page.label;
      const icon = group?.icon ?? page.icon;
      return `<a href="#${escapeHtml(page.id)}" data-page-target="${escapeHtml(page.id)}"><span class="material-symbols-outlined" aria-hidden="true">${escapeHtml(icon)}</span>${escapeHtml(label)}</a>`;
    })
    .join("");
  return `<section id="evidence-bank" class="course-page" hidden>
    <p class="route-kicker">${escapeHtml(recipe.courseCode)} | Evidence Bank</p>
    <h2 class="route-title">Evidence Bank</h2>
    <p class="route-description">Save only the evidence, activity collections, and writing plans you deliberately choose. Working drafts remain in their original activity.</p>
    <div class="english-evidence-bank-actions">${activityLinks}</div>
    <section class="english-evidence-bank-list" aria-labelledby="saved-evidence-title">
      <div class="english-evidence-bank-heading${darkHeaderClass}">
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
      <div class="english-evidence-capture-heading${darkHeaderClass}"><div><p>Quick entry</p><h3>Add evidence directly</h3><span>Use this only for a useful detail that is not already captured by a guided activity.</span></div><span class="material-symbols-outlined" aria-hidden="true">note_add</span></div>
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

function renderStandardResources(recipe: EnglishFactoryRecipe, resources: EnglishPreparedResource[], lessons: EnglishBuiltLesson[]) {
  const resourceCards = resources
    .filter((resource) => resource.href)
    .map((resource) => `<article class="english-factory-resource-card">
      <div><span>${escapeHtml(resource.role.replace(/-/g, " "))}</span><h3>${escapeHtml(resource.title)}</h3><p>Course material connected to this unit.</p></div>
      <div class="english-factory-resource-actions"><a href="${escapeHtml(resource.href ?? "#")}" target="_blank" rel="noopener noreferrer">Open</a><a href="${escapeHtml(resource.href ?? "#")}" download>Download</a></div>
    </article>`)
    .join("");
  const external = lessons.flatMap((lesson) => lesson.supportingResources).filter((resource) => resource.kind === "external");
  const externalCards = external.map((resource) => `<article class="english-factory-resource-card"><div><span>lesson link</span><h3>${escapeHtml(resource.title)}</h3><p>${escapeHtml(resource.lessonTitle)}</p></div><div class="english-factory-resource-actions"><a href="${escapeHtml(resource.href)}" target="_blank" rel="noopener noreferrer">Open</a></div></article>`).join("");
  return `<section id="resources" class="course-page" hidden>
    <p class="route-kicker">${escapeHtml(recipe.courseCode)} | Resources</p><h2 class="route-title">Resources</h2>
    <p class="route-description">Course materials and supporting links are organized here for easy reference.</p>
    <div class="english-factory-resource-list">${resourceCards || "<p class=\"english-material-access-note\">No additional downloadable resources are available for this unit.</p>"}${externalCards}</div>
  </section>`;
}

function renderV3Materials(recipe: EnglishUnitRecipeV3, resources: EnglishPreparedResource[]) {
  const documents = resources.filter((resource): resource is EnglishPreparedResource & { href: string } =>
    Boolean(resource.href && !/^https?:\/\//i.test(resource.href))
  );
  const cards = documents.map((resource) => `<article class="english-factory-resource-card">
    <div><span>${escapeHtml(resource.role.replace(/-/g, " "))}</span><h3>${escapeHtml(resource.title)}</h3><p>Course material connected to this unit.</p></div>
    <div class="english-factory-resource-actions"><a href="${escapeHtml(resource.href)}" target="_blank" rel="noopener noreferrer">Open</a><a href="${escapeHtml(resource.href)}" download>Download</a></div>
  </article>`).join("");
  return `<section id="materials" class="course-page english-activity-page" hidden>
    <p class="route-kicker">${escapeHtml(recipe.courseCode)} | Materials</p>
    <h2 class="route-title">Materials</h2>
    <p class="route-description">Assigned texts, question sheets, and packaged course documents are organized here.</p>
    <div class="english-factory-resource-list">${cards || '<p class="english-material-access-note">Use the assigned or school-licensed copy of the unit text while completing these activities.</p>'}</div>
  </section>`;
}

function collectExternalSupport(
  resources: EnglishPreparedResource[],
  lessons: EnglishBuiltLesson[],
  profileLinks: EnglishMaterialHook[] = []
) {
  const links = [
    ...resources.filter((resource) => resource.href && /^https?:\/\//i.test(resource.href)).map((resource) => ({ title: resource.title, href: resource.href!, description: "Verified unit support link." })),
    ...lessons.flatMap((lesson) => lesson.supportingResources).filter((resource) => resource.kind === "external").map((resource) => ({ title: resource.title, href: resource.href, description: resource.lessonTitle })),
    ...profileLinks.filter((resource): resource is EnglishMaterialHook & { href: string } => Boolean(resource.href && /^https?:\/\//i.test(resource.href) && resource.status !== "needs-review")).map((resource) => ({ title: resource.title, href: resource.href, description: resource.description ?? "Verified unit support link." }))
  ];
  return [...new Map(links.map((link) => [link.href, link])).values()];
}

function renderV3Resources(
  recipe: EnglishUnitRecipeV3,
  resources: EnglishPreparedResource[],
  lessons: EnglishBuiltLesson[],
  profileLinks: EnglishMaterialHook[] = []
) {
  if (recipe.activityProfile.kind === "short-fiction" || recipe.activityProfile.kind === "novel-study") {
    const documentCards = resources
      .filter((resource): resource is EnglishPreparedResource & { href: string } => Boolean(resource.href))
      .map((resource) => renderShakespeareResourceCard({
        title: resource.title,
        href: resource.href,
        kind: "local",
        description: resource.role === "reading" ? "Course reading." : "Course material.",
        download: true
      }))
      .join("");
    const supportGroups = lessons
      .map((lesson) => ({
        id: `resources-${safeId(lesson.id)}`,
        title: lesson.title,
        items: [...new Map(lesson.supportingResources.map((resource) => [resource.href, resource])).values()]
      }))
      .filter((group) => group.items.length > 0);
    const approvedProfileLinks = profileLinks
      .filter((resource): resource is EnglishMaterialHook & { href: string } =>
        resource.status === "available" && Boolean(resource.href)
      )
      .map((resource) => ({
        title: resource.title,
        href: resource.href,
        kind: "external" as const
      }));
    if (approvedProfileLinks.length) {
      supportGroups.push({
        id: "resources-supporting-links",
        title: "Supporting Links",
        items: approvedProfileLinks
      });
    }

    return `<section id="resources" class="course-page shakespeare-resources-page ${recipe.activityProfile.kind === "short-fiction" ? "short-fiction-resources-page" : "novel-study-resources-page"}" hidden>
      <p class="route-kicker">${escapeHtml(recipe.courseCode)} | Resources</p>
      <h2 class="route-title">Source Resources</h2>
      <div class="resource-stack">
        ${documentCards ? `<section class="resource-lesson-group">
          <div class="resource-group-heading"><h3>Course Documents</h3><p>Assigned readings and course files for this unit.</p></div>
          <div class="resource-lesson-items">${documentCards}</div>
        </section>` : ""}
        ${supportGroups.length ? `<div class="scene-overview-control">
          <label class="film-room-label" for="resource-select">Choose a lesson group</label>
          <select id="resource-select" class="film-room-select" data-resource-select>
            ${supportGroups.map((group, index) => `<option value="${escapeHtml(group.id)}"${index === 0 ? " selected" : ""}>${escapeHtml(group.title)}</option>`).join("")}
          </select>
        </div>
        ${supportGroups.map((group, index) => `<section class="resource-lesson-group" data-resource-panel="${escapeHtml(group.id)}"${index === 0 ? "" : " hidden"}>
          <div class="resource-group-heading"><h3>${escapeHtml(cleanLessonTitle(group.title))}</h3><p>Supporting material connected to this lesson.</p></div>
          <div class="resource-lesson-items">${group.items.map((resource) => renderShakespeareResourceCard({
            title: resource.title,
            href: resource.href,
            kind: resource.kind,
            description: resource.href,
            download: resource.kind === "local"
          })).join("")}</div>
        </section>`).join("")}` : ""}
      </div>
    </section>`;
  }
  const links = collectExternalSupport(resources, lessons, profileLinks);
  const localResources = [
    ...resources
      .filter((resource): resource is EnglishPreparedResource & { href: string } =>
        Boolean(resource.href && !/^https?:\/\//i.test(resource.href))
      )
      .map((resource) => ({
        title: resource.title,
        href: resource.href,
        description: resource.role === "reading" ? "Assigned course text." : "Course document."
      })),
    ...lessons
      .flatMap((lesson) => lesson.supportingResources)
      .filter((resource) => resource.kind === "local")
      .map((resource) => ({
        title: resource.title,
        href: resource.href,
        description: resource.lessonTitle
      }))
  ];
  const localCards = [...new Map(localResources.map((resource) => [resource.href, resource])).values()]
    .map((resource) => `<article class="english-factory-resource-card"><div><span>course resource</span><h3>${escapeHtml(resource.title)}</h3><p>${escapeHtml(resource.description)}</p></div><div class="english-factory-resource-actions"><a href="${escapeHtml(resource.href)}" target="_blank" rel="noopener noreferrer">Open</a><a href="${escapeHtml(resource.href)}" download>Download</a></div></article>`)
    .join("");
  const activityCards = recipe.activityProfile.kind === "modern-drama"
    ? `<article class="english-factory-resource-card"><div><span>course reader</span><h3>${escapeHtml(`${recipe.unitTitle.replace(/^Modern Play\s*-\s*/i, "")} Script Reader`)}</h3><p>Read the play one scene at a time in the accessible course reader.</p></div><div class="english-factory-resource-actions"><a href="#script-reader" data-page-target="script-reader">Open Reader</a></div></article>
      <article class="english-factory-resource-card"><div><span>course questions</span><h3>Act Questions</h3><p>Open the question sets connected to each act of the play.</p></div><div class="english-factory-resource-actions"><a href="#act-questions" data-page-target="act-questions">Open Questions</a></div></article>`
    : "";
  return `<section id="resources" class="course-page" hidden>
    <p class="route-kicker">${escapeHtml(recipe.courseCode)} | Resources</p>
    <h2 class="route-title">Source Resources</h2>
    <p class="route-description">Lesson helpers and verified supporting links for this unit are collected here.</p>
    <div class="english-factory-resource-list">${activityCards}${localCards}${links.map((link) => `<article class="english-factory-resource-card"><div><span>supporting link</span><h3>${escapeHtml(link.title)}</h3><p>${escapeHtml(link.description)}</p></div><div class="english-factory-resource-actions"><a href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">Open</a></div></article>`).join("")}</div>
  </section>`;
}

function renderNovelStudyResources(
  recipe: EnglishFactoryRecipe,
  resources: EnglishPreparedResource[],
  lessons: EnglishBuiltLesson[],
  profileLinks: EnglishMaterialHook[]
) {
  const accessItems = profileLinks.filter((resource) => resource.status === "access-required");
  const accessBlock = accessItems.length
    ? `<section class="english-novel-access-list" aria-labelledby="novel-access-title">
        <h3 id="novel-access-title">Novel access</h3>
        <p>The complete novels are not included in this unit. Use the assigned or school-licensed edition while completing the activities.</p>
        ${accessItems.map((resource) => `<article data-material-id="${escapeHtml(resource.id)}" data-material-status="access-required"><div><strong>${escapeHtml(resource.title)}</strong><p>Use the assigned or school-licensed edition.</p></div><span>Assigned or licensed edition required</span></article>`).join("")}
      </section>`
    : "";
  const standard = renderStandardResources(recipe, resources, lessons);
  return standard.replace('<div class="english-factory-resource-list">', `${accessBlock}<div class="english-factory-resource-list">`);
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
  recipe: EnglishFactoryRecipe,
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
        lessonTitle: resource.description ?? `${recipe.unitTitle} study support link.`
      }))
    }] : []),
    ...lessonGroups
  ];
  const localBlock = localResources.length
    ? `<section class="resource-lesson-group resource-lesson-group--documents">
        <div class="resource-group-heading">
          <h3>Unit Documents</h3>
          <p>Files available for this unit.</p>
        </div>
        <div class="resource-lesson-items">
          ${localResources.map((resource) => renderShakespeareResourceCard({
            title: resource.title,
            href: resource.href,
            kind: "local",
            description: "Course material.",
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
    ? `<article class="empty-route-card"><h3>No additional resources</h3><p>No additional unit documents or lesson links are available.</p></article>`
    : "";

  return `<section id="resources" class="course-page shakespeare-resources-page" hidden>
    <p class="route-kicker">${escapeHtml(recipe.courseCode)} | Resources</p>
    <h2 class="route-title">Resources</h2>
    <p class="route-description">Course materials and lesson links are organized here by topic.</p>
    <div class="resource-stack">${localBlock}${groupControl}${empty}</div>
  </section>`;
}

function renderModernDramaResources(
  recipe: EnglishFactoryRecipe,
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
          lesson.supportingResources.map((resource) => [`${resource.kind}:${resource.href}`, resource])
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
        lessonTitle: resource.description ?? "Approved modern-drama support link."
      }))
    }] : []),
    ...lessonGroups
  ];
  const localBlock = localResources.length
    ? `<section class="resource-lesson-group resource-lesson-group--documents">
        <div class="resource-group-heading">
          <h3>Unit Documents</h3>
          <p>Play, act-question, conflict, and writing files for this unit.</p>
        </div>
        <div class="resource-lesson-items">
          ${localResources.map((resource) => renderShakespeareResourceCard({
            title: resource.title,
            href: resource.href,
            kind: "local",
            description: "Course material for this unit.",
            download: true
          })).join("")}
        </div>
      </section>`
    : "";
  const groupId = "modern-drama-resource-groups";
  const groupControl = resourceGroups.length
    ? `<div class="scene-overview-control">
        <label for="modern-drama-resource-select">Choose a lesson group</label>
        <select id="modern-drama-resource-select" data-response-id="${escapeHtml(`${recipe.projectSlug}:resources:selected-group`)}" data-english-activity-select="${groupId}">
          ${resourceGroups.map((group, index) => `<option value="${escapeHtml(group.id)}"${index === 0 ? " selected" : ""}>${escapeHtml(group.title)}</option>`).join("")}
        </select>
      </div>
      ${resourceGroups.map((group, index) => `<section class="resource-lesson-group" data-english-activity-panel-group="${groupId}" data-english-activity-panel="${escapeHtml(group.id)}"${index === 0 ? "" : " hidden"}>
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
    ? `<article class="empty-route-card"><h3>No additional resources</h3><p>No additional unit documents or lesson links are available.</p></article>`
    : "";

  return `<section id="resources" class="course-page shakespeare-resources-page modern-drama-resources-page" hidden>
    <p class="route-kicker">${escapeHtml(recipe.courseCode)} | Resources</p>
    <h2 class="route-title">Resources</h2>
    <p class="route-description">Course materials and lesson links are organized here for easy reference.</p>
    <div class="resource-stack">${localBlock}${groupControl}${empty}</div>
  </section>`;
}

function renderResources(
  recipe: EnglishFactoryRecipe,
  resources: EnglishPreparedResource[],
  lessons: EnglishBuiltLesson[],
  profileKind: EnglishRenderedActivityProfile["kind"],
  profileLinks: EnglishMaterialHook[] = []
) {
  if (profileKind === "shakespeare-drama") return renderShakespeareResources(recipe, resources, lessons, profileLinks);
  if (profileKind === "modern-drama") return renderModernDramaResources(recipe, resources, lessons, profileLinks);
  if (profileKind === "novel-study") return renderNovelStudyResources(recipe, resources, lessons, profileLinks);
  return renderStandardResources(recipe, resources, lessons);
}

const SHORT_FICTION_VIDEO_TITLES: Record<string, string> = {
  "1KbDdiku75E": "Types of Characters",
  j1bfOBBl6pQ: "Irony: Three Types",
  SKi56cPUSFk: "Point of View",
  WH5jlkK4aUI: "Plot Elements",
  "30CPmgVQNks": "Setting in a Story",
  FzpJnYIQv98: "Symbols and Motifs",
  YcCrsVK5dWs: "Tone vs. Mood",
  urEh4_fTtao: "Word Choice and Diction",
  "RecVd-6g-IY": "Theme Review"
};

function renderFilmRoom(recipe: EnglishFactoryRecipe, videos: Array<{ id: string; lessonTitle: string; embedSrc: string }>) {
  if (recipe.activityProfile.kind === "short-fiction") {
    const titleFor = (video: { id: string; lessonTitle: string }) => SHORT_FICTION_VIDEO_TITLES[video.id] ?? video.lessonTitle;
    return `<section id="film-room" class="course-page" hidden>
      <p class="route-kicker">${escapeHtml(recipe.courseCode)} | Film Room</p>
      <h2 class="route-title">Media Room</h2>
      ${videos.length ? `<div class="film-room-shell">
        <div class="film-room-stage">
          ${videos.map((video, index) => `<section class="film-panel" data-film-panel="${escapeHtml(video.id)}"${index === 0 ? "" : " hidden"}>
            <div class="film-room-header"><h3>${escapeHtml(titleFor(video))}</h3></div>
            <iframe class="film-room-frame" src="${escapeHtml(video.embedSrc)}" title="${escapeHtml(titleFor(video))}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            <a class="film-source-link" href="https://www.youtube.com/watch?v=${escapeHtml(video.id)}" target="_blank" rel="noopener noreferrer">Open directly on YouTube</a>
          </section>`).join("")}
        </div>
        <aside class="film-room-sidebar">
          <div class="film-room-control-panel">
            <h3>Media Playlist</h3>
            <label class="film-room-label" for="film-select">Choose a video</label>
            <select id="film-select" class="film-room-select" data-film-select>
              ${videos.map((video, index) => `<option value="${escapeHtml(video.id)}"${index === 0 ? " selected" : ""}>${escapeHtml(titleFor(video))}</option>`).join("")}
            </select>
          </div>
        </aside>
      </div>` : `<p class="english-material-access-note">No embedded concept videos are available for this unit. Use the links in Resources where available.</p>`}
    </section>`;
  }
  const options = videos.map((video) => `<option value="${escapeHtml(video.id)}">${escapeHtml(video.lessonTitle)}</option>`).join("");
  const panels = videos.map((video, index) => `<article class="english-film-panel" data-film-panel="${escapeHtml(video.id)}" ${index ? "hidden" : ""}><h3>${escapeHtml(video.lessonTitle)}</h3><iframe src="${escapeHtml(video.embedSrc)}" title="${escapeHtml(`${video.lessonTitle} concept video`)}" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><a href="https://www.youtube.com/watch?v=${escapeHtml(video.id)}" target="_blank" rel="noopener noreferrer">Open directly on YouTube</a></article>`).join("");
  return `<section id="film-room" class="course-page" hidden><p class="route-kicker">${escapeHtml(recipe.courseCode)} | Film Room</p><h2 class="route-title">Film Room</h2><p class="route-description">Lesson videos are collected here and remain available in their related lessons.</p>${videos.length ? `<label class="english-film-picker">Choose a concept video<select data-film-select>${options}</select></label>${panels}` : `<p class="english-material-access-note">No embedded concept videos are available for this unit. Use the links in Resources where available.</p>`}</section>`;
}

const FACTORY_CSS = `
.lesson-detail-panel--ela30 { border-top: 4px solid #154212; border-radius: 8px; background: #f3f4f5; padding: 40px; }
.lesson-heading-row--ela30 { margin: 0 0 24px; }
.lesson-heading-row--ela30 h2 { margin: 0; font: 800 32px/1.2 "Hanken Grotesk", sans-serif; }
.lesson-page--ela30 .source-content { max-width: none; font-family: "Work Sans", sans-serif; font-size: 16px; line-height: 1.65; }
.lesson-page--ela30 .source-content--ela10-2,
.lesson-page--ela30 .source-content--ela10-2 p,
.lesson-page--ela30 .source-content--ela10-2 li,
.lesson-page--ela30 .source-content--ela10-2 div,
.lesson-page--ela30 .source-content--ela10-2 span { font-family: "Work Sans", sans-serif !important; font-size: 16px !important; line-height: 1.65 !important; color: #252a25 !important; }
.lesson-page--ela30 .source-content--ela10-2 p,
.lesson-page--ela30 .source-content--ela10-2 div,
.lesson-page--ela30 .source-content--ela10-2 span { background-color: transparent !important; }
.lesson-page--ela30 .source-content--ela10-2 p,
.lesson-page--ela30 .source-content--ela10-2 div { text-align: left !important; }
.lesson-page--ela30 .source-content--ela10-2 h1,
.lesson-page--ela30 .source-content--ela10-2 h2,
.lesson-page--ela30 .source-content--ela10-2 h3,
.lesson-page--ela30 .source-content--ela10-2 h4 { font-family: "Hanken Grotesk", sans-serif !important; color: #191c1d !important; text-align: left !important; }
.lesson-page--ela30 .source-content--ela10-2 > p:first-child:has(> strong:only-child) { display: none; }
.lesson-page--ela30 .source-content img { display: block; width: min(100%, 680px); max-height: 420px; height: auto; margin: 18px auto; border: 1px solid #d9dadb; border-radius: 8px; object-fit: contain; }
.lesson-page--ela30 .source-content iframe { display: block; width: min(100%, 760px); aspect-ratio: 16/9; margin: 18px auto; border: 1px solid #d9dadb; border-radius: 8px; }
.source-pdf-lesson { display: grid; gap: 16px; }
.source-pdf-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.source-pdf-actions a { display: inline-flex; align-items: center; min-height: 42px; border: 1px solid #477445; border-radius: 6px; color: #154212; font-weight: 750; padding: 8px 14px; text-decoration: none; }
.source-pdf-actions a:first-child { background: #154212; color: #fff; }
.source-pdf-frame { display: block; width: 100%; min-height: 720px; border: 1px solid #cfd6ce; border-radius: 8px; background: #fff; }
.lesson-source-links--ela30 { margin-top: 32px; border: 1px solid #d9dadb; border-radius: 8px; background: #fff; padding: 20px; }
.lesson-source-links--ela30 h3 { margin-top: 0; }
.elements-workbench { margin-top: 28px; border-top: 1px solid #d9dadb; padding-top: 24px; }
.elements-checklist-header { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 12px; }
.elements-checklist-header h3, .element-panel > h3 { margin: 0; font: 800 26px/1.2 "Hanken Grotesk", sans-serif; }
.elements-checklist-header p { margin: 0; color: #4d554a; }
.elements-table { width: 100%; border-collapse: collapse; background: #fff; }
.elements-table th, .elements-table td { border: 1px solid #d9dadb; padding: 10px 12px; text-align: left; vertical-align: top; }
.elements-table th { background: #f5f7f1; color: #154212; font-size: 13px; }
.element-check { min-width: 30px; min-height: 30px; border: 1px solid #aeb8a7; border-radius: 5px; background: #fff; color: #154212; font-weight: 800; cursor: pointer; }
.element-selector { appearance: none; border: 0; background: transparent; color: #154212; padding: 0; text-align: left; text-decoration: underline; text-underline-offset: 3px; font: inherit; font-weight: 700; cursor: pointer; }
.element-selector.active, .element-selector[aria-selected="true"] { color: #191c1d; text-decoration-thickness: 2px; }
.element-panels { margin-top: 18px; }
.element-panel { border: 1px solid #d9dadb; border-radius: 8px; background: #fff; padding: 24px; }
.element-panel[hidden] { display: none; }
.element-completion-bar { display: flex; justify-content: flex-end; margin-top: 24px; border-top: 1px solid #d9dadb; padding-top: 16px; }
.lesson-bottom-bar--ela30 { margin-top: 32px; padding-top: 20px; border-top: 1px solid #d9dadb; }
.overview-notice, .english-novel-access-list { border: 1px solid #cfd6ce; border-left: 4px solid #477445; border-radius: 6px; background: #f7f9f5; padding: 16px 18px; }
.overview-notice { margin: 20px 0; }
.overview-notice p, .english-novel-access-list > p { margin: 5px 0 0; line-height: 1.5; }
.english-novel-access-list { margin: 20px 0; }
.english-novel-access-list h3 { margin: 0; }
.english-novel-access-list article { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 14px 0; border-top: 1px solid #dce2db; }
.english-novel-access-list article:first-of-type { margin-top: 14px; }
.english-novel-access-list article p { margin: 4px 0 0; color: #596259; }
.english-novel-access-list article > span { max-width: 220px; color: #596259; font-size: .88rem; text-align: right; }
.english-evidence-bank-actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 20px 0; }
.english-evidence-bank-actions a, .english-factory-resource-actions a, .english-film-panel > a { display: inline-flex; align-items: center; gap: 7px; min-height: 40px; border: 1px solid #7d9272; border-radius: 6px; color: #24491f; padding: 8px 12px; font-weight: 700; text-decoration: none; }
.english-evidence-bank-list, .english-evidence-capture { margin-top: 20px; border: 1px solid #d9dadb; border-radius: 8px; background: #fff; padding: 22px; }
.english-evidence-bank-heading, .english-evidence-capture-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 14px; border-bottom: 1px solid #e3e6e1; }
.english-evidence-bank-heading p, .english-evidence-capture-heading p { margin: 0 0 5px; color: #154212; font: 700 12px/1.3 "IBM Plex Sans", sans-serif; text-transform: uppercase; }
.english-evidence-bank-heading h3, .english-evidence-capture-heading h3 { margin: 0; }
#evidence-bank .english-dark-worksheet-header { border-bottom: 0; background: #161a17; color: #fff; }
#evidence-bank .english-dark-worksheet-header h3 { color: #fff; }
#evidence-bank .english-dark-worksheet-header p { color: #b9c3b2; }
#evidence-bank .english-dark-worksheet-header span:not(.material-symbols-outlined) { color: #d7ddd4; }
#evidence-bank .english-evidence-bank-heading.english-dark-worksheet-header { margin: -22px -22px 18px; border-radius: 7px 7px 0 0; padding: 24px 28px; }
#evidence-bank .english-evidence-capture-heading.english-dark-worksheet-header { margin: -22px -22px 0; border-radius: 7px 7px 0 0; padding: 24px 28px; }
#evidence-bank .english-dark-worksheet-header > .material-symbols-outlined { border-radius: 6px; background: #293029; padding: 8px; color: #9fcf93; }
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
.film-room-shell { display: grid; grid-template-columns: minmax(0,1fr) 300px; gap: 24px; align-items: start; margin-top: 24px; }
.film-room-stage, .film-room-control-panel { border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; }
.film-room-stage { padding: 18px; background: #f8f9fa; }
.film-room-header { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.film-room-header h3, .film-room-control-panel h3 { margin: 0; color: #191c1d; font: 800 24px/1.2 "Hanken Grotesk",sans-serif; }
.film-room-frame { display: block; width: 100%; aspect-ratio: 16/9; min-height: 360px; border: 1px solid #191c1d; border-radius: 8px; background: #000; }
.film-room-sidebar { display: flex; flex-direction: column; gap: 16px; }
.film-room-control-panel { padding: 18px; }
.film-room-label { display: block; margin: 18px 0 8px; color: #154212; font: 600 13px/1.4 "IBM Plex Sans",sans-serif; }
.film-room-select { width: 100%; min-height: 46px; border: 1px solid #c2c9bb; border-radius: 8px; background: #fff; color: #191c1d; padding: 9px 12px; font: 15px/1.4 "Work Sans",sans-serif; }
.film-room-select:focus { border-color: #154212; outline: 2px solid rgba(21,66,18,.22); outline-offset: 2px; }
.film-source-link { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; margin-top: 14px; border: 1px solid #154212; border-radius: 8px; background: #154212; color: #fff; padding: 9px 14px; font-weight: 700; text-decoration: none; }
.film-panel[hidden], .resource-lesson-group[hidden] { display: none !important; }
.english-material-access-note { border-left: 3px solid #7d9272; background: #f5f7f1; padding: 12px 14px; }
@media(max-width:760px){.lesson-detail-panel--ela30{padding:22px}.english-evidence-filter-grid,.english-evidence-fields{grid-template-columns:1fr}.english-factory-resource-card{align-items:stretch;flex-direction:column}.english-evidence-bank-heading,.english-evidence-capture-heading{display:grid}.shakespeare-resources-page .scene-overview-control{grid-template-columns:1fr}.film-room-shell{grid-template-columns:1fr}.film-room-frame{min-height:220px}.elements-checklist-header{align-items:start;flex-direction:column}.elements-table th:nth-child(3),.elements-table td:nth-child(3){display:none}.element-panel{padding:18px}}
@media print{.english-evidence-filter-grid,.english-evidence-bank-actions,.english-evidence-actions{display:none!important}}
`;

const FACTORY_ELEMENTS_RUNTIME = `
document.addEventListener("click", function(event) {
  const target = event.target instanceof Element ? event.target.closest("[data-element-target]") : null;
  if (!target) return;
  const id = target.getAttribute("data-element-target");
  const workbench = target.closest(".elements-workbench");
  if (!id || !workbench) return;
  workbench.querySelectorAll("[data-element-panel]").forEach(function(panel) {
    panel.hidden = panel.getAttribute("data-element-panel") !== id;
  });
  workbench.querySelectorAll("[data-element-target]").forEach(function(button) {
    const active = button.getAttribute("data-element-target") === id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
});
`;

const FACTORY_LAYOUT_CSS = `
@media (min-width: 1101px) {
  .course-frame { width: 100%; }
  .course-main { padding-right: 64px; padding-bottom: 64px; padding-left: 64px; }
  .novel-profile-page { max-width: none; margin-inline: 0; }
  .english-writing-workbook-page { max-width: none; margin-inline: 0; }
  .shakespeare-writing-page .shakespeare-writing-panel-stack { max-width: none; }
}
`;

function buildActivityNavigation(activityProfile: EnglishRenderedActivityProfile) {
  const pageById = new Map<string, EnglishRenderedActivityProfile["pages"][number]>();
  activityProfile.pages.forEach((page) => {
    if (pageById.has(page.id)) throw new Error(`Activity profile contains duplicate page id ${page.id}.`);
    pageById.set(page.id, page);
  });

  const groupedPageIds = new Set<string>();
  const navGroups: NextStepShellNavGroup[] = [];
  const seenGroupIds = new Set<string>();
  for (const group of activityProfile.navGroups ?? []) {
    if (seenGroupIds.has(group.id)) throw new Error(`Activity profile contains duplicate nav group id ${group.id}.`);
    seenGroupIds.add(group.id);
    const landingPage = pageById.get(group.id);
    if (!landingPage) {
      const activeChild = group.itemPageIds.find((pageId) => pageById.has(pageId));
      if (activeChild) throw new Error(`Activity nav group ${group.id} is missing its landing page while child ${activeChild} is active.`);
      continue;
    }
    if (group.itemPageIds.includes(group.id)) {
      throw new Error(`Activity nav group ${group.id} must use landingItemLabel instead of listing its landing page as a child.`);
    }
    const childPages = group.itemPageIds.map((pageId) => {
      const page = pageById.get(pageId);
      if (!page) throw new Error(`Activity nav group ${group.id} references missing page ${pageId}.`);
      return page;
    });
    for (const pageId of [group.id, ...group.itemPageIds]) {
      if (groupedPageIds.has(pageId)) throw new Error(`Activity page ${pageId} belongs to more than one nav group.`);
      groupedPageIds.add(pageId);
    }
    navGroups.push({
      id: group.id,
      label: group.label,
      icon: group.icon,
      html: landingPage.html,
      landingItemLabel: group.landingItemLabel,
      items: childPages.map((page) => ({ id: page.id, label: page.label, icon: page.icon, html: page.html }))
    });
  }

  const navItems: NextStepShellNavItem[] = activityProfile.pages
    .filter((page) => !groupedPageIds.has(page.id))
    .map((page) => ({
      id: page.id,
      label: page.label,
      icon: page.icon,
      html: page.html,
      hiddenFromNavigation: page.navigation === "lesson-linked"
    }));
  return { navGroups, navItems };
}

export function renderEnglishFactoryUnit(input: {
  recipe: EnglishFactoryRecipe;
  lessons: EnglishBuiltLesson[];
  activityProfile: EnglishRenderedActivityProfile;
  resources: EnglishPreparedResource[];
  videos: Array<{ id: string; lessonTitle: string; embedSrc: string }>;
}) {
  const shellLessons = buildShellLessons(input.recipe, input.lessons);
  const activityNavigation = buildActivityNavigation(input.activityProfile);
  const activityRouteIds = new Set(input.activityProfile.pages.map((page) => page.id));
  const v3Recipe = input.recipe.schemaVersion === 3 ? input.recipe : undefined;
  const isV3 = Boolean(v3Recipe);
  const isWritingFoundations = input.activityProfile.kind === "writing-foundations";
  const nextRoute = input.activityProfile.kind === "writing-foundations"
    ? input.activityProfile.pages.find((page) => page.id === "final-paragraph")
    : input.activityProfile.pages[0];
  const navItems: NextStepShellNavItem[] = [
    ...activityNavigation.navItems,
    ...(recipeRouteEnabled(input.recipe, "evidence-bank", true)
      ? [{ id: "evidence-bank", label: "Evidence Bank", icon: "library_books", html: renderEvidenceBank(input.recipe, input.activityProfile.pages, input.activityProfile.navGroups) }]
      : []),
    ...(recipeRouteEnabled(input.recipe, "film-room", false) && !activityRouteIds.has("film-room")
      ? [{ id: "film-room", label: "Film Room", icon: "live_tv", html: renderFilmRoom(input.recipe, input.videos) }]
      : []),
    ...(v3Recipe && recipeRouteEnabled(v3Recipe, "materials", false) && !activityRouteIds.has("materials")
      ? [{ id: "materials", label: "Materials", icon: "folder_open", html: renderV3Materials(v3Recipe, input.resources) }]
      : []),
    ...(recipeRouteEnabled(input.recipe, "resources", !isV3) && !activityRouteIds.has("resources")
      ? [{ id: "resources", label: "Resources", icon: "link", html: v3Recipe
          ? renderV3Resources(v3Recipe, input.resources, input.lessons, input.activityProfile.resourceLinks)
          : renderResources(input.recipe, input.resources, input.lessons, input.activityProfile.kind, input.activityProfile.resourceLinks) }]
      : [])
  ];
  const html = renderNextStepCourseShell({
    slug: input.recipe.projectSlug,
    courseTitle: input.recipe.unitTitle,
    courseCode: input.recipe.courseCode,
    overviewIntro: isWritingFoundations
      ? `Build complete sentences and focused, developed paragraphs through planning, drafting, guided practice, revision, and editing.`
      : `Use the ${input.recipe.unitTitle} lessons and activities to build interpretation, evidence, and polished ${input.recipe.courseCode} responses.`,
    overviewNotice: input.activityProfile.kind === "novel-study"
      ? "The complete novels are not included in this unit. Use the assigned or school-licensed edition of your novel."
      : undefined,
    outcomes: isWritingFoundations
      ? [
          "I can recognize complete sentences and repair fragments, run-ons, and comma splices.",
          "I can write a focused topic sentence and develop it with relevant support and explanation.",
          "I can organize sentences with unity, coherence, logical order, and purposeful transitions.",
          "I can revise and edit a paragraph before saving a polished final version."
        ]
      : [
          "I can interpret how authors, playwrights, and filmmakers shape meaning.",
          "I can select precise evidence and explain its analytical value.",
          "I can develop sustained responses through the activity system for this unit.",
          "I can deliberately collect useful work in a shared unit Evidence Bank."
        ],
    lessons: shellLessons,
    completionIds: input.recipe.fictionElementsHub
      ? input.lessons.map((lesson) => lesson.id)
      : shellLessons.map((lesson) => lesson.id),
    lessonPresentation: "ela30",
    showLessonSubnavHeadings: false,
    showLessonCardSummary: true,
    lessonGroupTitle: input.recipe.unitTitle,
    lessonSequenceTitle: `${input.recipe.unitTitle} Lesson Sequence`,
    sourceLessonLabel: "course lessons",
    nextAfterLastLesson: nextRoute ? { id: nextRoute.id, label: nextRoute.label } : undefined,
    logoPath: "assets/generated/brand/nxt-ce-logo-white-with-ce.png",
    storageKeyBase: `canvas-helper:${input.recipe.projectSlug}`,
    navGroups: activityNavigation.navGroups,
    navItems,
    extraCss: `${FACTORY_CSS}\n${ENGLISH_ACTIVITY_PROFILE_CSS}\n${input.activityProfile.css ?? ""}\n${FACTORY_LAYOUT_CSS}`
  });
  const runtime = isV3
    ? composeEnglishV3Runtime([
        {
          id: `${input.recipe.projectSlug}:shared-activity-runtime`,
          kind: "activity-profile",
          source: ENGLISH_ACTIVITY_PROFILE_RUNTIME
        },
        {
          id: `${input.recipe.projectSlug}:${input.activityProfile.kind}-runtime`,
          kind: "composite",
          source: input.activityProfile.runtime ?? ""
        },
        {
          id: `${input.recipe.projectSlug}:elements-workbench-runtime`,
          kind: "composite",
          source: FACTORY_ELEMENTS_RUNTIME
        }
      ])
    : `${ENGLISH_ACTIVITY_PROFILE_RUNTIME}\n${input.activityProfile.runtime ?? ""}\n${FACTORY_ELEMENTS_RUNTIME}`;
  const withRuntime = html.replace("</body>", `<script>${runtime}</script></body>`);
  return withRuntime.replace(/[ \t]+$/gm, "");
}

export const englishFactoryRenderInternals = { buildShellLessons, buildActivityNavigation, renderEvidenceBank, renderResources, renderFilmRoom, recipeRouteEnabled };
