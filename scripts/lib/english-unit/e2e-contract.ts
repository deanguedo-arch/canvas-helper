import { readFile, writeFile } from "node:fs/promises";

import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

type EnglishE2EContractInput = {
  projectSlug: string;
  html: string;
  contractPath: string;
  quizTitle: string;
};

function unique(values: Array<string | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function selectorAttributeValue(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function collectionActivationSelector(
  $: cheerio.CheerioAPI,
  section: AnyNode,
  collection: AnyNode
) {
  const collectionElement = $(collection);
  const writingTrackPanel = collectionElement.is("[data-english-writing-track-panel]")
    ? collectionElement
    : collectionElement.closest("[data-english-writing-track-panel]");
  if (writingTrackPanel.length) {
    const group = writingTrackPanel.attr("data-english-writing-track-panel");
    const value = writingTrackPanel.attr("data-english-writing-track-id");
    if (group && value) {
      const selector = `[data-english-writing-track-select="${selectorAttributeValue(group)}"] option[value="${selectorAttributeValue(value)}"]`;
      const matchingSelects = $(section).find("[data-english-writing-track-select]").filter((_, select) => (
        $(select).attr("data-english-writing-track-select") === group
      ));
      const matchingOptions = matchingSelects.find("option").filter((_, option) => $(option).attr("value") === value);
      if (matchingOptions.length === 1) return selector;
    }
  }
  const panel = collectionElement.is("[data-english-activity-panel][hidden]")
    ? collectionElement
    : collectionElement.closest("[data-english-activity-panel][hidden]");
  if (!panel.length) return undefined;
  const group = panel.attr("data-english-activity-panel-group");
  const value = panel.attr("data-english-activity-panel");
  if (!group || !value) return undefined;
  const selector = `[data-english-activity-select="${selectorAttributeValue(group)}"] option[value="${selectorAttributeValue(value)}"]`;
  const matchingSelects = $(section).find("[data-english-activity-select]").filter((_, select) => (
    $(select).attr("data-english-activity-select") === group
  ));
  const matchingOptions = matchingSelects.find("option").filter((_, option) => $(option).attr("value") === value);
  return matchingOptions.length === 1 ? selector : undefined;
}

function hasInitiallyUsableHint($: cheerio.CheerioAPI, section: AnyNode) {
  return $(section).find("[data-worksheet-toggle-hints], [data-english-writing-toggle-hints]").toArray().some((toggle) => {
    let parent = $(toggle).parent();
    while (parent.length && parent.get(0) !== section) {
      if (parent.is("[hidden]")) return false;
      parent = parent.parent();
    }
    const activity = $(toggle).closest("article, [data-worksheet], .worksheet-document");
    const scope = activity.length ? activity : $(section);
    return scope.find("[data-question-hint], [data-writing-hint], [data-english-writing-hint]").length > 0;
  });
}

function learnerContractFromHtml(projectSlug: string, html: string) {
  const $ = cheerio.load(html);
  const routeSections = $(".course-page[id]").toArray();
  const routes = unique(routeSections.map((section) => $(section).attr("id")));
  if (!routes.length) throw new Error(`Cannot build learner E2E contract for ${projectSlug}: no course routes were rendered.`);

  const hintRoutes = unique(routeSections
    .filter((section) => hasInitiallyUsableHint($, section))
    .map((section) => $(section).attr("id")));
  const printRoutes = unique(routeSections
    .filter((section) => $(section).find("[data-worksheet-print], [data-print-writing], [data-english-writing-print]").length > 0)
    .map((section) => $(section).attr("id")));
  if (!hintRoutes.length || !printRoutes.length) {
    throw new Error(`Cannot build learner E2E contract for ${projectSlug}: learner hint or print routes are missing.`);
  }

  const evidenceScenarios: Array<{ route: string; collectionId: string; responseId: string; activateSelector?: string }> = [];
  const evidenceSources = new Set<string>();
  for (const section of routeSections) {
    const route = $(section).attr("id");
    if (!route) continue;
    for (const collection of $(section).find("[data-evidence-collection-id]").toArray()) {
      const collectionId = $(collection).attr("data-evidence-collection-id");
      const textResponse = $(collection)
        .find("textarea[data-response-id], input[data-response-id]:not([type=hidden]), [contenteditable][data-response-id]")
        .first();
      const responseId = (textResponse.length ? textResponse : $(collection).find("[data-response-id]").first())
        .attr("data-response-id");
      const hasSave = $(collection).find("[data-save-response-collection], [data-save-profile-collection]").length > 0;
      const source = $(collection).attr("data-evidence-source") || collectionId;
      if (collectionId && responseId && hasSave && source && !evidenceSources.has(source)) {
        evidenceSources.add(source);
        const activateSelector = collectionActivationSelector($, section, collection);
        evidenceScenarios.push({ route, collectionId, responseId, ...(activateSelector ? { activateSelector } : {}) });
        break;
      }
    }
  }
  if (!evidenceScenarios.length) throw new Error(`Cannot build learner E2E contract for ${projectSlug}: no deliberate Evidence Bank collection was rendered.`);

  let resourceCheck:
    | { route: string; kind: "access-notice"; minimumPrimary: number }
    | { route: string; kind: "document-reader"; minimumPrimary: number; minimumFallback: number }
    | { route: string; kind: "media"; minimumPrimary: number; minimumFallback: number }
    | undefined;
  for (const section of routeSections) {
    const route = $(section).attr("id");
    if (!route) continue;
    const accessCount = $(section).find('[data-material-status="access-required"]').length;
    if (accessCount) {
      resourceCheck = { route, kind: "access-notice", minimumPrimary: accessCount };
      break;
    }
    const documentPrimary = $(section).find("iframe.library-document-frame, iframe.short-fiction-reader-frame, object.source-pdf-frame").length;
    const documentFallback = $(section).find("[data-reader-fullscreen], [data-shakespeare-open-src], [data-shakespeare-fullscreen-src], [data-short-fiction-fullscreen-src], a[download], .library-file-fallback a").length;
    if (documentPrimary && documentFallback) {
      resourceCheck = { route, kind: "document-reader", minimumPrimary: 1, minimumFallback: 1 };
      break;
    }
    const mediaPrimary = $(section).find('iframe[src*="youtube-nocookie.com/embed/"], video[data-local-course-video]').length;
    const mediaFallback = $(section).find('a[href*="youtube.com/watch"], a[href$=".mp4"]').length;
    if (mediaPrimary && mediaFallback) {
      resourceCheck = { route, kind: "media", minimumPrimary: 1, minimumFallback: 1 };
      break;
    }
  }
  const firstLesson = routes.find((route) => route.startsWith("lesson-"));
  const mobileRoutes = unique([
    "overview",
    firstLesson,
    routes.includes("side-by-side") ? "side-by-side" : undefined,
    routes.includes("act-questions") ? "act-questions" : undefined,
    ...evidenceScenarios.map((scenario) => scenario.route),
    resourceCheck?.route,
    "evidence-bank"
  ])
    .filter((route) => routes.includes(route));
  const evidenceContract = evidenceScenarios.length === 1
    ? { evidenceScenario: evidenceScenarios[0] }
    : { evidenceScenarios };
  return {
    enabled: true as const,
    routes,
    hintRoutes,
    printRoutes,
    ...evidenceContract,
    resourceChecks: resourceCheck ? [resourceCheck] : [],
    mobile: { width: 390, height: 844, routes: mobileRoutes }
  };
}

export async function writeEnglishLearnerE2EContract(input: EnglishE2EContractInput) {
  let existing: Record<string, unknown> = {};
  try {
    existing = JSON.parse(await readFile(input.contractPath, "utf8")) as Record<string, unknown>;
  } catch {
    existing = {};
  }
  const contract = {
    ...existing,
    $schema: "../../../e2e/project-e2e-contract.schema.json",
    projectSlug: input.projectSlug,
    requiredTestIds: ["studio-shell", "course-studio-tab", "workspace-project-select", "project-root", "workspace-preview-frame"],
    modes: { enabled: false },
    navigation: { enabled: false },
    quiz: { enabled: false, lessonTitle: input.quizTitle },
    fallbackPanel: { enabled: false },
    learnerCourse: learnerContractFromHtml(input.projectSlug, input.html)
  };
  await writeFile(input.contractPath, `${JSON.stringify(contract, null, 2)}\n`, "utf8");
  return contract;
}

export const englishE2EContractInternals = { learnerContractFromHtml };
