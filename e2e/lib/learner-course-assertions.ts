import { expect, type FrameLocator, type Locator, type Page } from "@playwright/test";

import {
  resolveLearnerEvidenceScenarios,
  type LearnerEvidenceScenario,
  type ProjectE2EContract
} from "./project-contract-schema";
import { reloadWorkspacePreview, waitForWorkspacePreviewReady } from "./project-open";

type EnabledLearnerCourse = Extract<
  NonNullable<ProjectE2EContract["learnerCourse"]>,
  { enabled: true }
>;

type LearnerRouteTarget = Pick<Page, "locator"> | Pick<FrameLocator, "locator">;

type EvidenceEntry = {
  contributionId?: string;
  responseId?: string;
  projectSlug?: string;
  entryKind?: string;
  detail?: string;
  evidence?: string;
  answer?: string;
  analysis?: string;
  connection?: string;
  responseIds?: string[];
  tags?: string[];
  activity?: { id?: string; title?: string };
  work?: { id?: string; title?: string; kind?: string };
  locator?: { label?: string } | string;
  metadata?: {
    category?: string;
    categoryId?: string;
    conceptId?: string;
    selectedSource?: { id?: string; kind?: string; title?: string };
  };
};

type EvidenceApi = {
  list(filters?: Record<string, unknown>): EvidenceEntry[];
  remove(contributionId: string): boolean;
};

const PRINT_HOOKS =
  "[data-worksheet-print]:visible, [data-print-questions]:visible, [data-print-writing]:visible, [data-english-writing-print]:visible";
const TAILWIND_INK_DARK_PROJECTS = new Set([
  "ela30-1-modern-drama",
  "ela30-1-shakespeare-othello",
  "ela30-1-short-stories"
]);

function learnerRouteSection(target: LearnerRouteTarget, route: string) {
  return target.locator(`section#${route}`);
}

async function showLearnerRoute(target: LearnerRouteTarget, route: string) {
  const routeTarget = target.locator(`[data-page-target="${route}"]`).first();
  await expect(routeTarget, `learner route target exists for #${route}`).toHaveCount(1);
  await routeTarget.evaluate((node) => (node as HTMLElement).click());

  const section = learnerRouteSection(target, route);
  await expect(section, `learner route section is unique for #${route}`).toHaveCount(1);
  await expect(section, `learner route is visible for #${route}`).toBeVisible();
  await expect
    .poll(() => target.locator("body").evaluate(() => window.location.hash), {
      message: `learner hash updates for #${route}`
    })
    .toBe(`#${route}`);

  return section;
}

async function assertNoBrokenRouteImages(section: Locator, route: string) {
  await expect
    .poll(
      () =>
        section.locator("img").evaluateAll((images) =>
          images
            .filter((image) => (image as HTMLImageElement).complete && !(image as HTMLImageElement).naturalWidth)
            .map((image) => (image as HTMLImageElement).currentSrc || (image as HTMLImageElement).src || "missing-src")
        ),
      { message: `no broken images on learner route #${route}` }
    )
    .toEqual([]);
}

async function assertLearnerNavigation(page: Page, workspaceFrame: FrameLocator, learnerCourse: EnabledLearnerCourse) {
  const topbar = workspaceFrame.locator(".course-topbar");
  await expect(topbar, "course topbar is visible inside the Studio preview").toBeVisible();
  await expect(topbar, "course topbar remains in the Studio viewport").toBeInViewport();
  const progress = workspaceFrame.locator(".top-progress-shell");
  await expect(progress, "course progress exists inside the Studio preview").toHaveCount(1);
  await expect(
    progress,
    "course progress retains learner-facing status text when responsive CSS hides the wide topbar meter"
  ).toContainText(/\d+\s*\/\s*\d+/u);

  for (const route of learnerCourse.routes) {
    const section = await showLearnerRoute(workspaceFrame, route);
    await assertNoBrokenRouteImages(section, route);
    await page.locator('[data-testid="workspace-preview-frame"]').scrollIntoViewIfNeeded();
    await expect(topbar, `course topbar remains visible on learner route #${route}`).toBeInViewport();
  }
}

async function assertLearnerCompletionReachesTotal(workspaceFrame: FrameLocator) {
  const completionControls = workspaceFrame.locator("[data-complete-id]");
  const completionIds = await completionControls.evaluateAll((controls) => [
    ...new Set(controls.map((control) => control.getAttribute("data-complete-id") ?? "").filter(Boolean))
  ]);
  if (completionIds.length === 0) return;

  await completionControls.evaluateAll((controls) => {
    const activated = new Set<string>();
    controls.forEach((control) => {
      const completionId = control.getAttribute("data-complete-id") ?? "";
      if (!completionId || activated.has(completionId)) return;
      activated.add(completionId);
      (control as HTMLElement).click();
    });
  });

  const progress = workspaceFrame.locator(".top-progress-shell");
  await expect
    .poll(() => progress.innerText(), {
      message: `course completion reaches ${completionIds.length} / ${completionIds.length}`
    })
    .toMatch(new RegExp(`${completionIds.length}\\s*\\/\\s*${completionIds.length}`));
}

async function assertHintRoutes(workspaceFrame: FrameLocator, learnerCourse: EnabledLearnerCourse) {
  for (const route of learnerCourse.hintRoutes) {
    const section = await showLearnerRoute(workspaceFrame, route);
    const toggle = section.locator("[data-worksheet-toggle-hints]:visible, [data-english-writing-toggle-hints]:visible").first();
    await expect(toggle, `visible Show Hints hook exists on #${route}`).toBeVisible();
    await toggle.click();
    await expect
      .poll(async () => {
        const pressed = await toggle.getAttribute("aria-pressed");
        const label = (await toggle.textContent())?.trim() ?? "";
        return pressed === "true" || /hide\s+hints/iu.test(label);
      }, { message: `Show Hints is active on #${route}` })
      .toBe(true);
    await expect(
      section.locator("[data-question-hint]:visible, [data-writing-hint]:visible, [data-english-writing-hint]:visible, .worksheet-hint:visible").first(),
      `a guided hint becomes visible on #${route}`
    ).toBeVisible();
    await toggle.click();
    await expect
      .poll(async () => {
        const pressed = await toggle.getAttribute("aria-pressed");
        const label = (await toggle.textContent())?.trim() ?? "";
        return pressed === "false" || (pressed === null && /show\s+hints/iu.test(label));
      }, { message: `Show Hints returns to its initial state on #${route}` })
      .toBe(true);
  }
}

async function installPrintProbe(workspaceFrame: FrameLocator) {
  await workspaceFrame.locator("body").evaluate(() => {
    const testWindow = window as typeof window & { __canvasHelperE2EPrintCalled?: boolean };
    testWindow.__canvasHelperE2EPrintCalled = false;
    testWindow.print = () => {
      testWindow.__canvasHelperE2EPrintCalled = true;
    };
  });
}

async function clearPrintProbe(workspaceFrame: FrameLocator) {
  await workspaceFrame.locator("body").evaluate(() => {
    document.body.classList.remove("print-job-active");
    document.querySelectorAll(".print-job-root").forEach((node) => node.remove());
  });
}

async function assertPrintRoutes(workspaceFrame: FrameLocator, learnerCourse: EnabledLearnerCourse) {
  for (const route of learnerCourse.printRoutes) {
    const section = await showLearnerRoute(workspaceFrame, route);
    const printButton = section.locator(PRINT_HOOKS).first();
    await expect(printButton, `visible scoped Print / PDF hook exists on #${route}`).toBeVisible();
    await installPrintProbe(workspaceFrame);
    await printButton.click();

    await expect
      .poll(
        () =>
          workspaceFrame.locator("body").evaluate((_, activeRoute) => {
            const testWindow = window as typeof window & { __canvasHelperE2EPrintCalled?: boolean };
            const visibleCourseRoutes = Array.from(document.querySelectorAll<HTMLElement>("main .course-page"))
              .filter((node) => !node.hidden && getComputedStyle(node).display !== "none")
              .map((node) => node.id);
            const hasScopedPrintRoot = document.body.classList.contains("print-job-active")
              && document.querySelectorAll(".print-job-root").length === 1;
            const activeRouteOnly = visibleCourseRoutes.length === 1 && visibleCourseRoutes[0] === activeRoute;
            return {
              called: Boolean(testWindow.__canvasHelperE2EPrintCalled),
              scoped: hasScopedPrintRoot || activeRouteOnly
            };
          }, route),
        { message: `Print / PDF is scoped to the active learner route #${route}` }
      )
      .toEqual({ called: true, scoped: true });

    await clearPrintProbe(workspaceFrame);
  }
}

async function assertResourceChecks(workspaceFrame: FrameLocator, learnerCourse: EnabledLearnerCourse) {
  for (const check of learnerCourse.resourceChecks) {
    const section = await showLearnerRoute(workspaceFrame, check.route);

    if (check.kind === "linked-page") {
      const link = section.locator(`a[href="${check.href}"]`).first();
      await expect(link, `linked learner page ${check.href} exists on #${check.route}`).toHaveCount(1);
      const result = await link.evaluate(async (node) => {
        const href = node.getAttribute("href") ?? "";
        const pageUrl = new URL(href, document.baseURI);
        const pageResponse = await fetch(pageUrl);
        const markup = await pageResponse.text();
        const parsed = new DOMParser().parseFromString(markup, "text/html");
        const dependencyUrls = Array.from(parsed.querySelectorAll<HTMLElement>("link[href], script[src], img[src]"))
          .map((dependency) => dependency.getAttribute("href") ?? dependency.getAttribute("src") ?? "")
          .filter(Boolean)
          .map((dependency) => new URL(dependency, pageUrl))
          .filter((dependency) => dependency.origin === pageUrl.origin);
        const dependencyStatuses = await Promise.all(dependencyUrls.map(async (dependency) => ({
          url: dependency.pathname,
          status: (await fetch(dependency)).status
        })));
        return {
          pageStatus: pageResponse.status,
          dependencyStatuses
        };
      });
      expect(result.pageStatus, `${check.href} loads in the scoped preview`).toBeLessThan(400);
      expect(
        result.dependencyStatuses.filter((dependency) => dependency.status >= 400),
        `${check.href} has no failed local page dependencies`
      ).toEqual([]);
      continue;
    }

    if (check.kind === "access-notice") {
      await expect(
        section.locator('[data-material-status="access-required"]'),
        `truthful access notices exist on #${check.route}`
      ).toHaveCount(check.minimumPrimary);
      continue;
    }

    const primarySelector =
      check.kind === "document-reader"
        ? "iframe.library-document-frame, iframe.short-fiction-reader-frame, object.source-pdf-frame"
        : 'iframe[src*="youtube-nocookie.com/embed/"], video[data-local-course-video]';
    const fallbackSelector =
      check.kind === "document-reader"
        ? "[data-reader-fullscreen], [data-shakespeare-open-src], [data-shakespeare-fullscreen-src], a[download], .library-file-fallback a"
        : 'a[href*="youtube.com/watch"], a[href$=".mp4"]';
    const primary = section.locator(primarySelector);
    const fallback = section.locator(fallbackSelector);

    await expect
      .poll(() => primary.count(), { message: `${check.kind} primary surfaces exist on #${check.route}` })
      .toBeGreaterThanOrEqual(check.minimumPrimary);
    await expect
      .poll(() => fallback.count(), { message: `${check.kind} fallback controls exist on #${check.route}` })
      .toBeGreaterThanOrEqual(check.minimumFallback);

    const untitledFrames = await primary.evaluateAll((frames) =>
      frames
        .filter((frame) => !frame.getAttribute("title")?.trim() && !frame.getAttribute("aria-label")?.trim())
        .map((frame) => frame.getAttribute("src") || frame.getAttribute("data") || "missing-src")
    );
    expect(untitledFrames, `embedded ${check.kind} surfaces have titles on #${check.route}`).toEqual([]);
  }
}

async function assertKnownMissingHooks(workspaceFrame: FrameLocator, learnerCourse: EnabledLearnerCourse) {
  for (const gap of learnerCourse.knownMissingHooks || []) {
    const section = await showLearnerRoute(workspaceFrame, gap.route);
    const selector = `[${gap.requiredHook}]`;
    await expect(
      section.locator(selector),
      `${gap.requiredHook} is still a documented gap on #${gap.route}; promote the route into active checks when added`
    ).toHaveCount(0);
  }
}

async function assertCoreVocabularySurface(workspaceFrame: FrameLocator, projectSlug: string) {
  const section = await showLearnerRoute(workspaceFrame, "core-vocabulary");
  const root = section.locator("[data-core-vocabulary]");
  await expect(root, "Core Vocabulary has one interaction root").toHaveCount(1);
  const declaredCount = Number(await root.getAttribute("data-core-vocabulary-count"));
  expect(declaredCount, "Core Vocabulary declares a positive concept count").toBeGreaterThan(0);

  const terms = root.locator("[data-core-vocabulary-term]");
  const panels = root.locator("[data-core-vocabulary-panel]");
  const mobileSelect = root.locator("[data-core-vocabulary-select]");
  await expect(terms, "declared Core Vocabulary selectors are present").toHaveCount(declaredCount);
  await expect(panels, "declared Core Vocabulary panels are present").toHaveCount(declaredCount);
  await expect(mobileSelect, "mobile concept selector is present").toHaveCount(1);
  await expect(mobileSelect.locator("option"), "mobile selector declares every concept").toHaveCount(declaredCount);

  const termRecords = await terms.evaluateAll((nodes) => nodes.map((node) => ({
    id: node.getAttribute("data-core-vocabulary-term") || "",
    categoryId: node.getAttribute("data-core-vocabulary-category-id") || "",
    title: node.textContent?.trim() || "",
    searchText: node.getAttribute("data-core-vocabulary-search-text") || ""
  })));
  expect(new Set(termRecords.map((record) => record.id)).size, "concept selector IDs are unique").toBe(declaredCount);

  const search = root.locator("[data-core-vocabulary-search]");
  const searchRecord = termRecords.find((record) => record.searchText.split(/\s+/u).some((part) => part && !record.title.toLowerCase().includes(part.toLowerCase()))) ?? termRecords.at(-1);
  const searchToken = searchRecord?.searchText.split(/\s+/u).find((part) => part && !searchRecord.title.toLowerCase().includes(part.toLowerCase())) ?? searchRecord?.title ?? "";
  await search.fill(searchToken);
  await expect(root.locator(`[data-core-vocabulary-term="${searchRecord?.id}"]`), "related-term search keeps its concept available").toBeVisible();
  await search.fill("");

  const category = root.locator("[data-core-vocabulary-category-filter]");
  await expect(category, "category selector is present").toHaveCount(1);
  const firstCategory = await category.locator("option:not([value=''])").first().getAttribute("value");
  if (firstCategory) {
    await category.selectOption(firstCategory);
    const visibleCategoryIds = await terms.evaluateAll((nodes) => nodes
      .filter((node) => !(node as HTMLElement).hidden)
      .map((node) => node.getAttribute("data-core-vocabulary-category-id")));
    expect(visibleCategoryIds.length, "category filter retains concepts").toBeGreaterThan(0);
    expect(visibleCategoryIds.every((value) => value === firstCategory), "category filter limits the visible selector set").toBe(true);
    await category.selectOption("");
  }

  for (const record of termRecords) {
    const selector = root.locator(`[data-core-vocabulary-term="${record.id}"]`);
    await selector.evaluate((node) => (node as HTMLElement).click());
    await expect(selector, `${record.title} selector becomes active`).toHaveAttribute("aria-selected", "true");
    const panel = root.locator(`[data-core-vocabulary-panel="${record.id}"]`);
    await expect(panel, `${record.title} panel is visible`).toBeVisible();
    await expect(panel, `${record.title} declares its concept title`).toHaveAttribute("data-core-vocabulary-concept-title", /\S/u);
    await expect(panel, `${record.title} declares its category`).toHaveAttribute("data-core-vocabulary-category", /\S/u);
    await expect(panel, `${record.title} keeps its selector category ID`).toHaveAttribute("data-core-vocabulary-category-id", record.categoryId);
    await expect(panel.locator("[data-core-vocabulary-source]"), `${record.title} has one source selector`).toHaveCount(1);
    await expect(panel.locator("[data-evidence-question-number] [data-response-id]"), `${record.title} has four Frayer fields`).toHaveCount(4);
    await expect(panel.locator("[data-core-vocabulary-field]"), `${record.title} exposes all four Frayer field hooks`).toHaveCount(4);
    await expect(panel.locator("[data-core-vocabulary-model]"), `${record.title} exposes its course-model hook`).toHaveCount(1);
    await expect(panel.locator("[data-core-vocabulary-save]"), `${record.title} exposes its collection hook`).toHaveCount(1);
    const responseIds = await panel.locator("[data-evidence-question-number] [data-response-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-response-id")));
    expect(responseIds, `${record.title} uses the complete Frayer response contract`).toEqual([
      `${projectSlug}:core-vocabulary:${record.id}:definition`,
      `${projectSlug}:core-vocabulary:${record.id}:characteristics`,
      `${projectSlug}:core-vocabulary:${record.id}:example`,
      `${projectSlug}:core-vocabulary:${record.id}:non-example`
    ]);
    const fieldIds = await panel.locator("[data-core-vocabulary-field]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-core-vocabulary-field")));
    expect(fieldIds, `${record.title} exposes the complete Frayer field hook contract`).toEqual([
      "definition",
      "characteristics",
      "example",
      "non-example"
    ]);
  }

  const firstRecord = termRecords[0];
  await root.locator(`[data-core-vocabulary-term="${firstRecord.id}"]`).evaluate((node) => (node as HTMLElement).click());
  const firstPanel = root.locator(`[data-core-vocabulary-panel="${firstRecord.id}"]`);
  const sourceSelect = firstPanel.locator("[data-core-vocabulary-source]");
  const sourceValues = await sourceSelect.locator("option").evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value));
  if (sourceValues.length > 1) {
    await sourceSelect.selectOption(sourceValues[1]);
    await expect(firstPanel, "source changes update Evidence Bank work metadata").toHaveAttribute("data-evidence-work-id", sourceValues[1]);
    await sourceSelect.selectOption(sourceValues[0]);
  }

  const model = firstPanel.locator("details.core-vocabulary-model");
  await expect(model, "course model reveal is present").toHaveCount(1);
  await model.locator("summary").evaluate((node) => (node as HTMLElement).click());
  await expect(model, "course model reveal opens").toHaveAttribute("open", "");

  const lastRecord = termRecords.at(-1);
  if (lastRecord) {
    await mobileSelect.evaluate((node, value) => {
      const select = node as HTMLSelectElement;
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }, lastRecord.id);
    await expect(root.locator(`[data-core-vocabulary-panel="${lastRecord.id}"]`), "mobile selector changes the active concept").toBeVisible();
  }
}

async function coreVocabularyEntry(workspaceFrame: FrameLocator, contributionId: string) {
  return workspaceFrame.locator("body").evaluate((_, identity) => {
    const api = (window as typeof window & { nextStepEvidenceBank?: EvidenceApi }).nextStepEvidenceBank;
    return api?.list({ contributionId: identity })[0] ?? api?.list().find((entry) => entry.contributionId === identity) ?? null;
  }, contributionId);
}

async function assertCoreVocabularyEntryContract(
  workspaceFrame: FrameLocator,
  projectSlug: string,
  scenario: Extract<LearnerEvidenceScenario, { kind?: "collection" }>
) {
  const conceptId = scenario.collectionId.split(":core-vocabulary:")[1]?.replace(/:collection$/u, "") ?? "";
  const entry = await coreVocabularyEntry(workspaceFrame, scenario.collectionId);
  expect(entry, "Core Vocabulary Evidence Bank entry is available through the shared API").not.toBeNull();
  expect(entry).toMatchObject({
    contributionId: scenario.collectionId,
    projectSlug,
    entryKind: "collection",
    activity: { id: "core-vocabulary", title: "Core Vocabulary" },
    metadata: { conceptId, selectedSource: { title: expect.any(String) } }
  });
  expect(entry?.responseIds, "Core Vocabulary collections retain all four Frayer response IDs").toEqual([
    `${projectSlug}:core-vocabulary:${conceptId}:definition`,
    `${projectSlug}:core-vocabulary:${conceptId}:characteristics`,
    `${projectSlug}:core-vocabulary:${conceptId}:example`,
    `${projectSlug}:core-vocabulary:${conceptId}:non-example`
  ]);
  expect(entry?.tags, "Core Vocabulary collection is tagged for filtering").toEqual(expect.arrayContaining(["core-vocabulary", conceptId]));

  const evidenceBank = await showLearnerRoute(workspaceFrame, "evidence-bank");
  const filters: Array<[string, string]> = [
    ["activity", entry?.activity?.title ?? "Core Vocabulary"],
    ["work", entry?.work?.title ?? entry?.metadata?.selectedSource?.title ?? ""],
    ["locator", typeof entry?.locator === "string" ? entry.locator : entry?.locator?.label ?? ""],
    ["type", "collection"]
  ];
  for (const [facet, value] of filters) {
    expect(value, `${facet} filter value is populated`).not.toBe("");
    const select = evidenceBank.locator(`[data-evidence-bank-filter="${facet}"]`);
    await expect(select, `${facet} Evidence Bank filter is present`).toHaveCount(1);
    await expect(select.locator(`option[value="${value}"]`), `${facet} Evidence Bank filter includes the Core Vocabulary value`).toHaveCount(1);
    await select.selectOption(value);
  }
  await expect(evidenceBank.locator(`[data-evidence-bank-entry="${scenario.collectionId}"]`), "combined Evidence Bank filters retain the Core Vocabulary collection").toBeVisible();
}

async function evidenceEntries(workspaceFrame: FrameLocator, identity: string) {
  return workspaceFrame.locator("body").evaluate((_, identity) => {
    const api = (window as typeof window & { nextStepEvidenceBank?: EvidenceApi }).nextStepEvidenceBank;
    if (!api) return null;
    // Sandboxed Studio previews can expose the Evidence Bank API in an isolated
    // evaluation world whose fallback storage is separate from the learner UI.
    // The rendered cards are the authoritative learner-facing result in that case.
    const evidenceFilter = document.querySelector<HTMLElement>("[data-evidence-bank-filter]");
    evidenceFilter?.dispatchEvent(new Event("change", { bubbles: true }));
    const renderedEntries = Array.from(document.querySelectorAll<HTMLElement>("[data-evidence-bank-entry]"))
      .filter((card) => card.getAttribute("data-evidence-bank-entry") === identity)
      .map((card) => ({
        contributionId: identity,
        responseId: identity,
        entryKind: card.getAttribute("data-evidence-bank-entry-kind") || undefined,
        evidence: card.textContent?.trim() || ""
      }));
    return renderedEntries.length ? renderedEntries : api.list({ responseId: identity });
  }, identity);
}

function evidenceSnapshot(entries: EvidenceEntry[] | null) {
  return {
    count: entries?.length ?? -1,
    contributionIds: (entries || []).map((entry) => entry.contributionId || entry.responseId || ""),
    content: (entries || [])
      .flatMap((entry) => [entry.detail, entry.evidence, entry.answer, entry.analysis, entry.connection])
      .filter((value): value is string => Boolean(value))
      .join("\n")
  };
}

type EvidenceCollectionSaveObservation = {
  entryCount: number;
  statusBefore: string | null;
  statusAfter: string | null;
};

export function shouldRetryEvidenceCollectionSave(observation: EvidenceCollectionSaveObservation) {
  return observation.entryCount === 0
    && observation.statusBefore !== null
    && observation.statusAfter === observation.statusBefore;
}

async function collectionSaveStatus(collection: Locator) {
  const status = collection.locator("[data-response-collection-status]");
  if (await status.count() !== 1) return null;
  return (await status.textContent())?.trim() ?? "";
}

async function settleEvidenceSaveControl(response: Locator, save: Locator, expectedValue: string) {
  await expect(response, "collection response retains the value prepared for Evidence Bank save").toHaveValue(
    expectedValue
  );
  await expect(save, "collection Evidence Bank save is visible").toBeVisible();
  await expect(save, "collection Evidence Bank save is enabled").toBeEnabled();
  await save.scrollIntoViewIfNeeded();
  await save.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  );
}

async function observeCollectionSaveAttempt(
  workspaceFrame: FrameLocator,
  collection: Locator,
  identity: string,
  statusBefore: string | null
) {
  const deadline = Date.now() + 2_000;
  let entryCount = -1;
  let statusAfter = await collectionSaveStatus(collection);

  do {
    entryCount = evidenceSnapshot(await evidenceEntries(workspaceFrame, identity)).count;
    statusAfter = await collectionSaveStatus(collection);
    if (entryCount > 0 || (statusBefore !== null && statusAfter !== statusBefore)) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  } while (Date.now() < deadline);

  return { entryCount, statusBefore, statusAfter } satisfies EvidenceCollectionSaveObservation;
}

async function saveCollectionWithReadinessRetry(
  workspaceFrame: FrameLocator,
  section: Locator,
  scenario: Extract<LearnerEvidenceScenario, { kind?: "collection" }>,
  response: Locator,
  save: Locator,
  expectedValue: string
) {
  const collection = section.locator(`[data-evidence-collection-id="${scenario.collectionId}"]`);
  const statusBefore = await collectionSaveStatus(collection);
  await settleEvidenceSaveControl(response, save, expectedValue);
  await save.click();

  const observation = await observeCollectionSaveAttempt(
    workspaceFrame,
    collection,
    scenario.collectionId,
    statusBefore
  );
  if (!shouldRetryEvidenceCollectionSave(observation)) return;

  // A Studio refresh can leave a locator attached before the learner runtime's
  // delegated click listener is ready. Retry only when the first click produced
  // neither an entry nor a scoped status transition, then reacquire everything.
  const retrySection = await showLearnerRoute(workspaceFrame, scenario.route);
  await activateEvidenceScenario(retrySection, scenario);
  const retryCollection = retrySection.locator(
    `[data-evidence-collection-id="${scenario.collectionId}"]`
  );
  const retryResponse = await responseWithinActivityOrRoute(
    retryCollection,
    retrySection,
    scenario.responseId
  );
  const retrySave = retryCollection.locator(
    "[data-save-response-collection], [data-save-profile-collection]"
  );
  await expect(retryCollection, `retry collection remains unique for ${scenario.collectionId}`).toHaveCount(1);
  await expect(retrySave, `retry save remains unique for ${scenario.collectionId}`).toHaveCount(1);
  await settleEvidenceSaveControl(retryResponse, retrySave, expectedValue);
  await retrySave.click();
}

async function removeEvidenceEntry(workspaceFrame: FrameLocator, identity: string) {
  await workspaceFrame.locator("body").evaluate((_, targetIdentity) => {
    (window as typeof window & { nextStepEvidenceBank?: EvidenceApi }).nextStepEvidenceBank?.remove(targetIdentity);
    Array.from(document.querySelectorAll<HTMLElement>("[data-evidence-bank-entry]"))
      .filter((card) => card.getAttribute("data-evidence-bank-entry") === targetIdentity)
      .forEach((card) => card.querySelector<HTMLElement>("[data-remove-evidence-note]")?.click());
  }, identity);
}

async function assertEvidenceApi(workspaceFrame: FrameLocator) {
  await expect
    .poll(
      () =>
        workspaceFrame.locator("body").evaluate(() => {
          const api = (window as typeof window & { nextStepEvidenceBank?: EvidenceApi }).nextStepEvidenceBank;
          return Boolean(api && typeof api.list === "function" && typeof api.remove === "function");
        }),
      { message: "shared nextStepEvidenceBank API is available" }
    )
    .toBe(true);
}

async function activateEvidenceScenario(section: Locator, scenario: LearnerEvidenceScenario) {
  if (!scenario.activateSelector) return;
  const activator = section.locator(scenario.activateSelector);
  await expect(
    activator,
    `configured Evidence Bank scenario activator exists on #${scenario.route}`
  ).toHaveCount(1);
  const tagName = await activator.evaluate((node) => node.tagName.toLowerCase());
  if (tagName === "option") {
    const optionValue = await activator.getAttribute("value");
    const select = activator.locator("xpath=parent::select");
    await expect(select, `configured Evidence Bank option belongs to one select on #${scenario.route}`).toHaveCount(1);
    await select.selectOption(optionValue ?? { label: (await activator.textContent())?.trim() ?? "" });
    return;
  }
  await activator.click();
}

async function prepareEvidenceScenario(
  section: Locator,
  scenario: LearnerEvidenceScenario,
  evidenceValue: string
) {
  if (scenario.kind !== "individual" || !scenario.setupResponses?.length) return;
  for (const setup of scenario.setupResponses) {
    const response = section.locator(`[data-response-id="${setup.responseId}"]`);
    await expect(
      response,
      `configured Evidence Bank setup response ${setup.responseId} exists on #${scenario.route}`
    ).toHaveCount(1);
    const value = setup.value.replaceAll("{{e2e-value}}", evidenceValue);
    await response.evaluate((node, nextValue) => {
      const field = node as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      field.value = nextValue;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
    }, value);
  }
}

async function responseWithinActivityOrRoute(
  activity: Locator,
  section: Locator,
  responseId: string
) {
  const selector = [
    `[data-response-id="${responseId}"]`,
    `[data-worksheet-answer="${responseId}"]`,
    `[data-novel-question-answer="${responseId}"]`,
    `[data-film-question-answer="${responseId}"]`
  ].join(", ");
  const nested = activity.locator(selector);
  if (await nested.count() === 1) return nested;
  return section.locator(selector);
}

async function assertCollectionEvidenceScenario(
  page: Page,
  workspaceFrame: FrameLocator,
  projectSlug: string,
  scenario: Extract<LearnerEvidenceScenario, { kind?: "collection" }>,
  scenarioIndex: number
) {
  const section = await showLearnerRoute(workspaceFrame, scenario.route);
  await activateEvidenceScenario(section, scenario);
  const collection = section.locator(`[data-evidence-collection-id="${scenario.collectionId}"]`);
  const response = await responseWithinActivityOrRoute(collection, section, scenario.responseId);
  const save = collection.locator("[data-save-response-collection], [data-save-profile-collection]");

  await expect(collection, `configured Evidence Bank collection exists on #${scenario.route}`).toHaveCount(1);
  await expect(response, `configured autosave response exists in ${scenario.collectionId}`).toHaveCount(1);
  await expect(save, `deliberate collection save exists in ${scenario.collectionId}`).toHaveCount(1);

  await assertEvidenceApi(workspaceFrame);
  await removeEvidenceEntry(workspaceFrame, scenario.collectionId);

  const firstValue = `E2E first collection response ${scenarioIndex + 1} for ${projectSlug}`;
  const updatedValue = `E2E updated collection response ${scenarioIndex + 1} for ${projectSlug}`;
  await response.fill(firstValue);
  expect(await evidenceEntries(workspaceFrame, scenario.collectionId), "autosave does not publish evidence").toEqual([]);

  await saveCollectionWithReadinessRetry(
    workspaceFrame,
    section,
    scenario,
    response,
    save,
    firstValue
  );
  await expect
    .poll(async () => evidenceSnapshot(await evidenceEntries(workspaceFrame, scenario.collectionId)), {
      message: `deliberate save creates one Evidence Bank collection for ${scenario.collectionId}`
    })
    .toMatchObject({ count: 1, contributionIds: [scenario.collectionId], content: expect.stringContaining(firstValue) });

  await response.fill(updatedValue);
  await saveCollectionWithReadinessRetry(
    workspaceFrame,
    section,
    scenario,
    response,
    save,
    updatedValue
  );
  await expect
    .poll(async () => evidenceSnapshot(await evidenceEntries(workspaceFrame, scenario.collectionId)), {
      message: `saving ${scenario.collectionId} again updates instead of duplicating`
    })
    .toMatchObject({ count: 1, contributionIds: [scenario.collectionId], content: expect.stringContaining(updatedValue) });

  if (scenario.route === "core-vocabulary") {
    await assertCoreVocabularyEntryContract(workspaceFrame, projectSlug, scenario);
  }

  await reloadWorkspacePreview(page, projectSlug, { requireEvidenceBank: true });
  const restoredFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  const restoredSection = await showLearnerRoute(restoredFrame, scenario.route);
  await activateEvidenceScenario(restoredSection, scenario);
  const restoredCollection = restoredSection.locator(`[data-evidence-collection-id="${scenario.collectionId}"]`);
  const restoredResponse = await responseWithinActivityOrRoute(
    restoredCollection,
    restoredSection,
    scenario.responseId
  );
  await expect(restoredResponse, `response restores after reload for ${scenario.responseId}`).toHaveValue(updatedValue);
  await expect
    .poll(async () => evidenceSnapshot(await evidenceEntries(restoredFrame, scenario.collectionId)), {
      message: `Evidence Bank collection restores after reload for ${scenario.collectionId}`
    })
    .toMatchObject({ count: 1, contributionIds: [scenario.collectionId], content: expect.stringContaining(updatedValue) });

  await removeEvidenceEntry(restoredFrame, scenario.collectionId);
  expect(await evidenceEntries(restoredFrame, scenario.collectionId), "Evidence Bank entry can be removed").toEqual([]);
  await expect(restoredResponse, "removing Evidence Bank entry does not erase the working response").toHaveValue(
    updatedValue
  );
}

async function assertIndividualEvidenceScenario(
  page: Page,
  workspaceFrame: FrameLocator,
  projectSlug: string,
  scenario: Extract<LearnerEvidenceScenario, { kind: "individual" }>,
  scenarioIndex: number
) {
  const firstValue = `E2E first individual evidence ${scenarioIndex + 1} for ${projectSlug}`;
  const updatedValue = `E2E updated individual evidence ${scenarioIndex + 1} for ${projectSlug}`;
  const setupOwnsResponse = Boolean(
    scenario.setupResponses?.some((setup) => setup.responseId === scenario.responseId)
  );
  const section = await showLearnerRoute(workspaceFrame, scenario.route);
  await prepareEvidenceScenario(section, scenario, firstValue);
  await activateEvidenceScenario(section, scenario);
  const capture = section.locator(
    `[data-evidence-capture="${scenario.captureId}"][data-evidence-contribution-id="${scenario.contributionId}"]`
  );
  const response = await responseWithinActivityOrRoute(capture, section, scenario.responseId);
  const save = capture.locator("[data-save-evidence-note]");

  await expect(capture, `configured individual Evidence Bank capture exists on #${scenario.route}`).toHaveCount(1);
  await expect(response, `configured evidence draft response exists in ${scenario.captureId}`).toHaveCount(1);
  await expect(save, `deliberate individual save exists in ${scenario.captureId}`).toHaveCount(1);
  await assertEvidenceApi(workspaceFrame);
  await removeEvidenceEntry(workspaceFrame, scenario.contributionId);

  if (!setupOwnsResponse) await response.fill(firstValue);
  expect(await evidenceEntries(workspaceFrame, scenario.contributionId), "draft autosave does not publish evidence").toEqual([]);

  await save.click();
  await expect
    .poll(async () => evidenceSnapshot(await evidenceEntries(workspaceFrame, scenario.contributionId)), {
      message: `deliberate save creates one individual Evidence Bank entry for ${scenario.contributionId}`
    })
    .toMatchObject({
      count: 1,
      contributionIds: [scenario.contributionId],
      content: expect.stringContaining(firstValue)
    });

  if (setupOwnsResponse) {
    await prepareEvidenceScenario(section, scenario, updatedValue);
    await activateEvidenceScenario(section, scenario);
  } else {
    await response.fill(updatedValue);
  }
  await save.click();
  await expect
    .poll(async () => evidenceSnapshot(await evidenceEntries(workspaceFrame, scenario.contributionId)), {
      message: `saving ${scenario.contributionId} again updates instead of duplicating`
    })
    .toMatchObject({
      count: 1,
      contributionIds: [scenario.contributionId],
      content: expect.stringContaining(updatedValue)
    });

  await reloadWorkspacePreview(page, projectSlug, { requireEvidenceBank: true });
  const restoredFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  const restoredSection = await showLearnerRoute(restoredFrame, scenario.route);
  await activateEvidenceScenario(restoredSection, scenario);
  const restoredCapture = restoredSection.locator(
    `[data-evidence-capture="${scenario.captureId}"][data-evidence-contribution-id="${scenario.contributionId}"]`
  );
  const restoredResponse = await responseWithinActivityOrRoute(
    restoredCapture,
    restoredSection,
    scenario.responseId
  );

  await expect
    .poll(async () => evidenceSnapshot(await evidenceEntries(restoredFrame, scenario.contributionId)), {
      message: `individual Evidence Bank entry restores after reload for ${scenario.contributionId}`
    })
    .toMatchObject({
      count: 1,
      contributionIds: [scenario.contributionId],
      content: expect.stringContaining(updatedValue)
    });

  await removeEvidenceEntry(restoredFrame, scenario.contributionId);
  expect(await evidenceEntries(restoredFrame, scenario.contributionId), "individual Evidence Bank entry can be removed").toEqual([]);
  if (scenario.preserveResponseOnSave) {
    if (setupOwnsResponse) {
      await expect
        .poll(() => restoredResponse.evaluate((node) => (node as HTMLInputElement | HTMLTextAreaElement).value), {
          message: "removing Evidence Bank entry does not erase the seeded source response"
        })
        .toContain(updatedValue);
    } else {
      await expect(restoredResponse, "removing Evidence Bank entry does not erase the source response").toHaveValue(
        updatedValue
      );
    }
  }
}

async function assertEvidenceScenarios(
  page: Page,
  projectSlug: string,
  learnerCourse: EnabledLearnerCourse
) {
  const scenarios = resolveLearnerEvidenceScenarios(learnerCourse);
  await waitForWorkspacePreviewReady(page, projectSlug, { requireEvidenceBank: true });
  for (const [scenarioIndex, scenario] of scenarios.entries()) {
    const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
    if (scenario.kind === "individual") {
      await assertIndividualEvidenceScenario(page, workspaceFrame, projectSlug, scenario, scenarioIndex);
    } else {
      await assertCollectionEvidenceScenario(page, workspaceFrame, projectSlug, scenario, scenarioIndex);
    }
  }
}

async function assertMobileRoutes(page: Page, projectSlug: string, learnerCourse: EnabledLearnerCourse) {
  const mobilePage = await page.context().newPage();
  const pageErrors: string[] = [];
  const localFailures: string[] = [];
  const runtimeFailures: string[] = [];
  const baseOrigin = new URL(page.url()).origin;
  await waitForWorkspacePreviewReady(page, projectSlug);
  const previewFrame = page.getByTestId("workspace-preview-frame");
  const previewSource = await previewFrame.getAttribute("src");
  if (!previewSource) {
    throw new Error(`Workspace preview did not provide a source URL for ${projectSlug}.`);
  }
  const mobilePreviewUrl = new URL(previewSource, page.url());
  mobilePreviewUrl.hash = "";
  const previewOrigin = mobilePreviewUrl.origin;

  mobilePage.on("pageerror", (error) => pageErrors.push(error.message));
  mobilePage.on("response", (response) => {
    const responseUrl = new URL(response.url());
    const proxiedSource = responseUrl.searchParams.get("source");
    const isExternalRuntimeFetch = responseUrl.pathname.endsWith("/runtime")
      && /^https?:\/\//i.test(proxiedSource ?? "");
    if (isExternalRuntimeFetch && [baseOrigin, previewOrigin].includes(responseUrl.origin) && response.status() >= 400) {
      runtimeFailures.push(`${response.status()} ${proxiedSource}`);
    } else if ([baseOrigin, previewOrigin].includes(responseUrl.origin) && response.status() >= 400) {
      localFailures.push(`${response.status()} ${response.url()}`);
    }
  });

  try {
    await mobilePage.setViewportSize({
      width: learnerCourse.mobile.width,
      height: learnerCourse.mobile.height
    });
    await mobilePage.goto(mobilePreviewUrl.toString(), {
      waitUntil: "domcontentloaded"
    });

    if (TAILWIND_INK_DARK_PROJECTS.has(projectSlug)) {
      await expect
        .poll(
          () =>
            mobilePage.locator(".bg-ink-dark").first().evaluate((node) => getComputedStyle(node).backgroundColor),
          { message: `${projectSlug} applies its relayed Tailwind shell styles` }
        )
        .toBe("rgb(26, 28, 30)");
    }

    for (const route of learnerCourse.mobile.routes) {
      const section = await showLearnerRoute(mobilePage, route);
      await assertNoBrokenRouteImages(section, route);
      const overflow = await mobilePage.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
      }));
      expect(
        overflow.scrollWidth,
        `mobile route #${route} does not create horizontal document overflow`
      ).toBeLessThanOrEqual(overflow.clientWidth + 1);
    }

    expect(pageErrors, "mobile learner preview has no uncaught page errors").toEqual([]);
    expect(localFailures, "mobile learner preview has no failed local assets").toEqual([]);
    expect(runtimeFailures, "mobile learner preview has no failed executable runtime dependencies").toEqual([]);
  } finally {
    await mobilePage.close();
  }
}

export async function assertLearnerCourseContract(
  contract: ProjectE2EContract,
  page: Page,
  workspaceFrame: FrameLocator
) {
  if (!contract.learnerCourse?.enabled) return;

  const learnerCourse = contract.learnerCourse;
  await assertLearnerNavigation(page, workspaceFrame, learnerCourse);
  await assertLearnerCompletionReachesTotal(workspaceFrame);
  if (learnerCourse.routes.includes("core-vocabulary")) {
    await assertCoreVocabularySurface(workspaceFrame, contract.projectSlug);
  }
  await assertHintRoutes(workspaceFrame, learnerCourse);
  await assertEvidenceScenarios(page, contract.projectSlug, learnerCourse);
  await assertPrintRoutes(workspaceFrame, learnerCourse);
  await assertResourceChecks(workspaceFrame, learnerCourse);
  await assertKnownMissingHooks(workspaceFrame, learnerCourse);
  await assertMobileRoutes(page, contract.projectSlug, learnerCourse);
}
