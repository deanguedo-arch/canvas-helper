import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test, type Locator, type Page } from "@playwright/test";

import { openProjectInStudio } from "../lib/project-open";

const PROJECT_SLUG = "biology30-unit-a-pilot";
const ALL_ROUTES = [
  "overview",
  "core-vocabulary",
  ...Array.from({ length: 17 }, (_value, index) => `lesson-${String(index + 1).padStart(2, "0")}`),
  "library",
  "video-library",
  "review-overview",
  "chapter-11-review",
  "chapter-12-review",
  "chapter-13-review",
  "review-seminar",
  "textbook-unit-review",
  "model-lab",
  "investigation-notebook",
  "practice-hub",
  "glossary-and-data",
  "sources-and-credits"
];
const REVIEW_ROUTES = ["library", "review-overview", "chapter-11-review", "chapter-12-review", "chapter-13-review", "review-seminar", "textbook-unit-review"];
const AXE_ROUTES = [...REVIEW_ROUTES, "video-library", "core-vocabulary", "investigation-notebook", "lesson-03", "lesson-04", "lesson-08", "lesson-09", "lesson-12", "lesson-15"];
const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900 },
  { id: "tablet", width: 1024, height: 768 },
  { id: "mobile", width: 390, height: 844 }
];
const REVIEW_PAGE_JUMPS = [
  { routeId: "chapter-11-review", document: "chapter-11", physical: 42, printed: 401 },
  { routeId: "chapter-12-review", document: "chapter-12", physical: 28, printed: 431 },
  { routeId: "chapter-13-review", document: "chapter-13", physical: 30, printed: 463 },
  { routeId: "textbook-unit-review", document: "chapter-13", physical: 35, printed: 468 }
];
const SOURCE_VISUALS = [
  { lessonId: "lesson-03", visualId: "neuron-anatomy-source" },
  { lessonId: "lesson-03", visualId: "neural-tissue-micrograph" },
  { lessonId: "lesson-06", visualId: "spinal-cord-cross-section-source" },
  { lessonId: "lesson-06", visualId: "brain-functional-regions" },
  { lessonId: "lesson-07", visualId: "reflex-arc-anatomy-source" },
  { lessonId: "lesson-09", visualId: "eye-anatomy-source" },
  { lessonId: "lesson-10", visualId: "ear-anatomy-source" },
  { lessonId: "lesson-12", visualId: "endocrine-capillary-network" },
  { lessonId: "lesson-13", visualId: "hypothalamus-pituitary-source" }
];
const REPLACED_FIGURES = [
  { lessonId: "lesson-03", figureSlot: "figure-neuron-anatomy", visualId: "neuron-anatomy-source" },
  { lessonId: "lesson-06", figureSlot: "figure-brain-regions", visualId: "brain-functional-regions" },
  { lessonId: "lesson-07", figureSlot: "figure-reflex-arc", visualId: "reflex-arc-anatomy-source" },
  { lessonId: "lesson-09", figureSlot: "figure-eye-anatomy", visualId: "eye-anatomy-source" },
  { lessonId: "lesson-10", figureSlot: "figure-ear-hearing-pathway", visualId: "ear-anatomy-source" },
  { lessonId: "lesson-13", figureSlot: "figure-hypothalamus-pituitary-axes", visualId: "hypothalamus-pituitary-source" }
];
const REPRESENTATIVE_FIGURES = [
  { lessonId: "lesson-04", selector: '[data-generated-visual="lesson-04-resting-membrane"]', mediaSelector: "img" },
  { lessonId: "lesson-09", selector: '[data-source-visual="eye-anatomy-source"]', mediaSelector: "img" },
  { lessonId: "lesson-15", selector: "[data-media-treatment]", mediaSelector: "svg" }
];
const FEEDBACK_FIGURE_LESSONS = ["lesson-02", "lesson-12"] as const;
const CORE_VOCABULARY_IDS = [
  "homeostasis", "regulated-variable-set-point", "control-system-roles", "negative-feedback", "scientific-explanation",
  "neuron-structure", "myelin-conduction", "resting-membrane-potential", "action-potential", "membrane-potential-phases",
  "refractory-period", "synaptic-transmission", "central-peripheral-systems", "somatic-autonomic-systems",
  "sympathetic-parasympathetic", "reflex-arc", "sensory-transduction", "sensory-receptor-classes", "sensory-adaptation",
  "vision-pathway", "hearing-equilibrium-pathway", "endocrine-signalling", "hypothalamus-pituitary-axis",
  "antagonistic-hormones", "thyroid-calcium-feedback", "blood-glucose-regulation", "water-salt-regulation", "stress-response"
] as const;
const CORE_VOCABULARY_FIXED_IDS = ["negative-feedback", "action-potential", "reflex-arc", "sensory-transduction", "endocrine-signalling", "homeostasis"] as const;
const WORD_LENS_MAPPINGS: Record<string, readonly string[]> = {
  "lesson-01": ["homeostasis", "regulated-variable-set-point", "control-system-roles"],
  "lesson-02": ["negative-feedback", "endocrine-signalling"],
  "lesson-03": ["neuron-structure", "myelin-conduction"],
  "lesson-04": ["resting-membrane-potential", "action-potential", "membrane-potential-phases"],
  "lesson-05": ["synaptic-transmission"],
  "lesson-06": ["central-peripheral-systems", "somatic-autonomic-systems", "sympathetic-parasympathetic"],
  "lesson-07": ["reflex-arc"],
  "lesson-08": ["sensory-transduction", "sensory-receptor-classes", "sensory-adaptation"],
  "lesson-09": ["sensory-transduction", "vision-pathway"],
  "lesson-10": ["sensory-transduction", "hearing-equilibrium-pathway"],
  "lesson-11": ["scientific-explanation", "sensory-adaptation"],
  "lesson-12": ["endocrine-signalling", "negative-feedback"],
  "lesson-13": ["hypothalamus-pituitary-axis", "water-salt-regulation"],
  "lesson-14": ["thyroid-calcium-feedback", "antagonistic-hormones"],
  "lesson-15": ["blood-glucose-regulation", "antagonistic-hormones"],
  "lesson-16": ["stress-response", "water-salt-regulation"],
  "lesson-17": ["homeostasis", "negative-feedback", "scientific-explanation"]
};

const integration = JSON.parse(readFileSync(path.join(process.cwd(), "projects/biology30-unit-a-pilot/meta/textbook-integration.json"), "utf8")) as {
  lessonMappings: Array<{
    lessonId: string;
    chapterId: string;
    printedPages: number[][];
    physicalPages?: number[][];
  }>;
  practiceFeedbackMappings: Array<{
    practiceId: string;
    chapterId: string;
    printedPage: number;
    physicalPage: number;
    support: "direct" | "closest";
  }>;
};

async function openCandidate(page: Page) {
  await openProjectInStudio(page, PROJECT_SLUG);
  const frame = page.getByTestId("workspace-preview-frame");
  const src = await frame.getAttribute("src");
  if (!src) throw new Error("Biology Unit A improvement pilot workspace preview has no source URL.");
  const candidateUrl = new URL(src, page.url()).href;
  await page.goto(candidateUrl, { waitUntil: "domcontentloaded" });
  await expect(page.locator("main#course-main")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  return candidateUrl;
}

async function showRoute(page: Page, routeId: string) {
  const target = page.locator(`[data-page-target="${routeId}"]`).first();
  await expect(target, `route target ${routeId}`).toHaveCount(1);
  await page.evaluate((id) => {
    const nextHash = `#${id}`;
    if (window.location.hash === nextHash) {
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } else {
      window.location.hash = nextHash;
    }
  }, routeId);
  const route = page.locator(`section#${routeId}`);
  await expect(route).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`#${routeId}$`));
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  });
  return route;
}

async function expectNoPageOverflow(page: Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
}

async function expectTextbookReaderJump(page: Page, expected: { document: string; physical: number; printed: number }) {
  const panel = page.locator(`#library [data-library-doc-panel="${expected.document}"]`);
  const frame = panel.locator("iframe[data-library-pdf-frame]");
  const heading = panel.locator("[data-library-reader-title]");
  await expect(panel).toBeVisible();
  await expect(frame).toHaveAttribute("src", new RegExp(`#page=${expected.physical}(?:&|$)`));
  await expect(frame).toHaveAttribute("data-library-current-pdf-page", String(expected.physical));
  await expect(frame).toHaveAttribute("data-library-current-print-page", String(expected.printed));
  await expect.poll(async () => Number(await frame.getAttribute("data-library-frame-revision"))).toBeGreaterThan(0);
  await expect(panel.locator("[data-library-page-status]")).toHaveText(`Open at printed p. ${expected.printed} (PDF page ${expected.physical}).`);
  await expect(panel.locator("[data-library-open-pdf]")).toHaveAttribute("href", `assets/textbook/${expected.document}.pdf`);
  await expect(panel.locator("[data-library-open-pdf]")).toHaveText("Open chapter PDF full screen");
  await expect(heading).toBeFocused();
  await expect.poll(() => heading.evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBeLessThan(180);
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBeGreaterThan(0);
}

async function openTextbookReader(page: Page, trigger: Locator, expected: { document: string; physical: number; printed: number }) {
  const currentFrame = page.locator(`#library [data-library-doc-panel="${expected.document}"] iframe[data-library-pdf-frame]`);
  const previousFrame = await currentFrame.elementHandle();
  const previousRevision = Number(await currentFrame.getAttribute("data-library-frame-revision") ?? "0");
  await trigger.click();
  await expect(page.locator("#library")).toBeVisible();
  await expect(page).toHaveURL(/#library$/);
  if (previousFrame) expect(await previousFrame.evaluate((node) => node.isConnected)).toBe(false);
  await expectTextbookReaderJump(page, expected);
  await expect.poll(async () => Number(await currentFrame.getAttribute("data-library-frame-revision"))).toBe(previousRevision + 1);
}

test("all 32 learner routes render at desktop, tablet, and mobile without horizontal overflow", async ({ page }) => {
  test.setTimeout(240_000);
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await openCandidate(page);
    await expect(page.locator(".course-page")).toHaveCount(32);
    expect(await page.locator(".course-page").evaluateAll((nodes) => nodes.map((node) => node.id))).toEqual(ALL_ROUTES);
    for (const routeId of ALL_ROUTES) {
      const route = await showRoute(page, routeId);
      await expect(route.locator("h1")).toHaveCount(1);
      await expect(route.locator("h1")).toBeVisible();
      await expectNoPageOverflow(page);
    }
  }
});

test("all 17 retrieval responses align as two clean columns and stack in reading order", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  for (let index = 1; index <= 17; index += 1) {
    const lessonId = `lesson-${String(index).padStart(2, "0")}`;
    const lesson = await showRoute(page, lessonId);
    const geometry = await lesson.locator(".bio-retrieval").evaluate((retrieval) => {
      const prompt = retrieval.children[0] as HTMLElement;
      const response = retrieval.querySelector<HTMLElement>(".bio-retrieval-response");
      const textarea = response?.querySelector<HTMLElement>("textarea");
      if (!prompt || !response || !textarea) return null;
      const promptRect = prompt.getBoundingClientRect();
      const responseRect = response.getBoundingClientRect();
      const textareaRect = textarea.getBoundingClientRect();
      return { prompt: promptRect.toJSON(), response: responseRect.toJSON(), textarea: textareaRect.toJSON() };
    });
    expect(geometry, lessonId).not.toBeNull();
    expect(Math.abs((geometry?.prompt.top ?? 0) - (geometry?.response.top ?? 0)), lessonId).toBeLessThanOrEqual(2);
    expect((geometry?.prompt.right ?? 0) + 20, lessonId).toBeLessThanOrEqual(geometry?.response.left ?? 0);
    expect(geometry?.textarea.left, lessonId).toBeGreaterThanOrEqual((geometry?.response.left ?? 0) - 1);
    expect(geometry?.textarea.right, lessonId).toBeLessThanOrEqual((geometry?.response.right ?? 0) + 1);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  for (let index = 1; index <= 17; index += 1) {
    const lessonId = `lesson-${String(index).padStart(2, "0")}`;
    const lesson = await showRoute(page, lessonId);
    const geometry = await lesson.locator(".bio-retrieval").evaluate((retrieval) => {
      const prompt = retrieval.children[0] as HTMLElement;
      const response = retrieval.querySelector<HTMLElement>(".bio-retrieval-response");
      if (!prompt || !response) return null;
      return { prompt: prompt.getBoundingClientRect().toJSON(), response: response.getBoundingClientRect().toJSON() };
    });
    expect(geometry, lessonId).not.toBeNull();
    expect(geometry?.response.top, lessonId).toBeGreaterThanOrEqual((geometry?.prompt.bottom ?? 0) - 1);
    expect(Math.abs((geometry?.response.left ?? 0) - (geometry?.prompt.left ?? 0)), lessonId).toBeLessThanOrEqual(2);
    await expectNoPageOverflow(page);
  }
});

test("every lesson opens the exact local textbook chapter and physical PDF page", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  for (const mapping of integration.lessonMappings) {
    await showRoute(page, mapping.lessonId);
    const open = page.locator(`#${mapping.lessonId} [data-textbook-doc]`).first();
    const expected = mapping.lessonId === "lesson-17"
      ? { document: "chapter-13", physical: 30, printed: 463 }
      : { document: mapping.chapterId, physical: mapping.physicalPages?.[0]?.[0], printed: mapping.printedPages[0][0] };
    await expect(open).toHaveAttribute("data-textbook-doc", expected.document);
    await expect(open).toHaveAttribute("data-textbook-pdf-page", String(expected.physical));
    await expect(open).toHaveAttribute("data-textbook-print-page", String(expected.printed));
    await openTextbookReader(page, open, expected as { document: string; physical: number; printed: number });
  }
});

test("guided and Final Practice feedback links open the exact textbook page and restore after reload", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);

  const guidedMapping = integration.practiceFeedbackMappings.find((mapping) => mapping.practiceId === "lesson-04-check-1");
  expect(guidedMapping).toEqual({
    practiceId: "lesson-04-check-1",
    chapterId: "chapter-11",
    printedPage: 376,
    physicalPage: 17,
    support: "direct"
  });
  await showRoute(page, "lesson-04");
  const guidedItem = page.locator('[data-practice-id="lesson-04-check-1"]');
  await expect(guidedItem.locator("h3")).toHaveText("1. Beginning the rising phase");
  await expect(guidedItem.locator("[data-practice-textbook-link]" )).toHaveCount(0);
  await guidedItem.locator('input[value="a"]').check();
  await guidedItem.locator("[data-check-practice]").click();
  const guidedLink = guidedItem.locator('[data-practice-textbook-link="lesson-04-check-1"]');
  await expect(guidedLink).toHaveText("Find this in the textbook: Chapter 11, p. 376");
  await openTextbookReader(page, guidedLink, { document: "chapter-11", physical: 17, printed: 376 });

  await showRoute(page, "practice-hub");
  await expect(page.locator("#practice-final-title")).toHaveText("Final Practice");
  await expect(page.locator("[data-submit-final-practice]")).toHaveText("Submit Final Practice");
  await page.setViewportSize({ width: 390, height: 844 });
  const finalItem = page.locator('[data-practice-id="final-practice-20"]');
  await expect(finalItem.locator("h3")).toHaveText("20. Apply the idea");
  await finalItem.locator('input[value="a"]').check();
  await finalItem.locator("[data-check-practice]").click();
  const finalLink = finalItem.locator('[data-practice-textbook-link="final-practice-20"]');
  await expect(finalLink).toHaveText("Closest textbook support: Chapter 11, p. 378");

  const geometry = await finalLink.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const saveExit = document.querySelector(".bio-save-exit")?.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      saveExitTop: saveExit?.top ?? document.documentElement.clientHeight,
      viewport: document.documentElement.clientWidth
    };
  });
  expect(geometry.left).toBeGreaterThanOrEqual(-1);
  expect(geometry.right).toBeLessThanOrEqual(geometry.viewport + 1);
  expect(geometry.bottom).toBeLessThanOrEqual(geometry.saveExitTop - 4);
  await expectNoPageOverflow(page);

  await page.reload({ waitUntil: "domcontentloaded" });
  await showRoute(page, "practice-hub");
  const restored = page.locator('[data-practice-id="final-practice-20"] [data-practice-textbook-link="final-practice-20"]');
  await expect(restored).toBeVisible();
  await openTextbookReader(page, restored, { document: "chapter-11", physical: 19, printed: 378 });
});

test("chapter summaries and the textbook unit review open their exact reader pages", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  for (const expected of REVIEW_PAGE_JUMPS) {
    await showRoute(page, expected.routeId);
    const open = page.locator(`#${expected.routeId} [data-textbook-doc]`).first();
    await expect(open).toHaveAttribute("data-textbook-doc", expected.document);
    await expect(open).toHaveAttribute("data-textbook-pdf-page", String(expected.physical));
    await expect(open).toHaveAttribute("data-textbook-print-page", String(expected.printed));
    await openTextbookReader(page, open, expected);
  }
});

test("Review Overview chapter links open the matching review pages in the textbook viewer", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  for (const expected of REVIEW_PAGE_JUMPS) {
    await showRoute(page, "review-overview");
    const open = page.locator(`#review-overview [data-review-reader-jump][data-textbook-doc="${expected.document}"][data-textbook-pdf-page="${expected.physical}"]`);
    await expect(open).toHaveCount(1);
    await openTextbookReader(page, open, expected);
  }
});

test("Library switching, fallbacks, keyboard control, and offline loading work", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await openCandidate(page);
  await showRoute(page, "library");
  const origin = new URL(page.url()).origin;

  const chapter12 = page.locator('[data-library-doc-target="chapter-12"]');
  await chapter12.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-library-doc-panel="chapter-12"]')).toBeVisible();
  await expect(chapter12).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-library-doc-select]')).toHaveValue("chapter-12");

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('[data-library-doc-select]')).toBeVisible();
  await page.locator('[data-library-doc-select]').selectOption("chapter-13");
  await expect(page.locator('[data-library-doc-panel="chapter-13"]')).toBeVisible();
  await expect(page.locator('[data-library-doc-target="chapter-13"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#library a[download]")).toHaveCount(3);
  await expect(page.locator("#library a[target='_blank']")).toHaveCount(3);
  await expect(page.locator("#library [data-library-open-pdf]")).toHaveCount(3);
  for (const chapter of ["chapter-11", "chapter-12", "chapter-13"]) {
    await expect(page.locator(`[data-library-doc-panel="${chapter}"] [data-library-open-pdf]`)).toHaveAttribute("href", `assets/textbook/${chapter}.pdf`);
  }

  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== origin) await route.abort();
    else await route.continue();
  });
  requests.length = 0;
  await page.reload({ waitUntil: "domcontentloaded" });
  await showRoute(page, "library");
  await page.locator('[data-library-doc-select]').selectOption("chapter-11");
  await expect(page.locator('[data-library-doc-panel="chapter-11"] iframe')).toHaveAttribute("src", /assets\/textbook\/chapter-11\.pdf/);
  const external = requests.filter((requestUrl) => {
    const url = new URL(requestUrl);
    return (url.protocol === "http:" || url.protocol === "https:") && url.origin !== origin;
  });
  expect(external).toEqual([]);
});

test("lesson and Video Library routes automatically show the exact YouTube preview without autoplay", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.route("https://www.youtube-nocookie.com/**", (route) => route.abort());
  await openCandidate(page);
  await expect(page.locator("iframe[src*='youtube-nocookie.com']")).toHaveCount(0);
  const mappings = [
    { lesson: "lesson-03", id: "A44brRGG4Ys", lessonTitle: "Connect neuron structure to information flow", libraryTitle: "Structure of a Neuron" },
    { lesson: "lesson-04", id: "oa6rvUJlg7o", lessonTitle: "See the action potential unfold", libraryTitle: "Action Potential in the Neuron" },
    { lesson: "lesson-05", id: "YcJy28Nnrb8", lessonTitle: "Follow a signal across a synapse", libraryTitle: "Synaptic Transmission" },
    { lesson: "lesson-06", id: "q8NtmDrb_qo", lessonTitle: "Tour the central nervous system", libraryTitle: "Central Nervous System" },
    { lesson: "lesson-07", id: "4WcZR_k_a0I", lessonTitle: "Trace the neurons in a reflex arc", libraryTitle: "Types of Neurons: Reflex Arcs" },
    { lesson: "lesson-09", id: "o0DYP-u1rNM", lessonTitle: "Follow light from optics to perception", libraryTitle: "Vision" },
    { lesson: "lesson-10", id: "Ie2j7GpC4JU", lessonTitle: "Connect hearing and balance", libraryTitle: "Hearing and Balance" },
    { lesson: "lesson-12", id: "eWHH9je2zG4", lessonTitle: "See the endocrine system as a signalling network", libraryTitle: "Endocrine System, Part 1" },
    { lesson: "lesson-13", id: "BYaR-JgbjCs", lessonTitle: "Separate hypothalamic and pituitary roles", libraryTitle: "The Pituitary Gland" },
    { lesson: "lesson-14", id: "cDGmsR2ZILE", lessonTitle: "Trace thyroid control and feedback", libraryTitle: "Thyroid Gland and Thyroid Problems" },
    { lesson: "lesson-15", id: "y9Bdi4dnSlg", lessonTitle: "Compare insulin and glucagon", libraryTitle: "Insulin and Glucagon" },
    { lesson: "lesson-16", id: "v-t1Z5-oPtU", lessonTitle: "Compare immediate and prolonged stress", libraryTitle: "How Stress Affects Your Body" }
  ];
  for (const mapping of mappings) {
    await showRoute(page, mapping.lesson);
    const lessonEntry = page.locator(`#${mapping.lesson} [data-video-entry="${mapping.id}"]`);
    await expect(lessonEntry.locator("iframe")).toHaveAttribute("src", `https://www.youtube-nocookie.com/embed/${mapping.id}?rel=0`);
    await expect(lessonEntry.locator("iframe")).toHaveAttribute("title", mapping.lessonTitle);
    await expect(lessonEntry.locator("iframe")).not.toHaveAttribute("src", /autoplay=1/);
    await expect(lessonEntry.locator(".bio-video-local-summary")).toBeVisible();
    const open = page.locator(`#${mapping.lesson} [data-open-video="${mapping.id}"]`);
    await expect(open).toHaveCount(1);
    await open.click();
    await expect(page.locator("#video-library")).toBeVisible();
    await expect(page.locator(`#video-library [data-video-panel="${mapping.id}"]`)).toBeVisible();
    await expect(page.locator(`#video-library [data-video-panel="${mapping.id}"] [data-video-panel-heading]`)).toHaveText(mapping.libraryTitle);
    await expect(page.locator(`#video-library [data-video-panel="${mapping.id}"] [data-video-panel-heading]`)).toBeFocused();
    const libraryFrame = page.locator(`#video-library [data-video-panel="${mapping.id}"] iframe`);
    await expect(libraryFrame).toHaveAttribute("src", `https://www.youtube-nocookie.com/embed/${mapping.id}?rel=0`);
    await expect(libraryFrame).not.toHaveAttribute("src", /autoplay=1/);
  }

  await expect(page.locator('#video-library [data-video-panel="qPix_X-9t7E"] iframe')).toHaveCount(0);
  await expect(page.locator('#video-library [data-video-panel="SCV_m91mN-Q"] iframe')).toHaveCount(0);
  await expect.poll(() => requests.filter((url) => url.startsWith("https://www.youtube-nocookie.com/")).length).toBeGreaterThan(0);
});

test("Video Library filtering and selection are keyboard-operable with local fallbacks", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("https://www.youtube-nocookie.com/**", (route) => route.abort());
  await openCandidate(page);
  await showRoute(page, "video-library");
  const chapter13 = page.locator('[data-video-topic-filter="chapter-13"]');
  await chapter13.focus();
  await page.keyboard.press("Enter");
  await expect(chapter13).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-video-playlist-group="chapter-13"]')).toBeVisible();
  await expect(page.locator('[data-video-panel="eWHH9je2zG4"]')).toBeVisible();
  await page.locator("[data-video-select]").selectOption("y9Bdi4dnSlg");
  await expect(page.locator('[data-video-panel="y9Bdi4dnSlg"] .bio-video-local-summary')).toContainText(/Not every tissue responds to insulin/i);
  const videoIds = await page.locator("[data-video-select] option").evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value));
  expect(videoIds).toHaveLength(35);
  for (const videoId of videoIds) {
    await page.locator("[data-video-select]").selectOption(videoId);
    await expect(page.locator(`[data-video-panel="${videoId}"]`)).toBeVisible();
    await expect(page.locator(`[data-video-panel="${videoId}"] .bio-video-local-summary`)).toBeVisible();
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("[data-video-topic-select]")).toBeVisible();
  await page.locator("[data-video-topic-select]").selectOption("unit-review");
  await expect(page.locator('[data-video-panel="qPix_X-9t7E"]')).toBeVisible();
  await page.locator("[data-video-select]").selectOption("SCV_m91mN-Q");
  await expect(page.locator('[data-video-panel="SCV_m91mN-Q"]')).toBeVisible();
  await expect(page.locator('[data-video-panel="SCV_m91mN-Q"] .bio-video-local-summary')).toBeVisible();
  await expectNoPageOverflow(page);
});

test("representative figures reflow cleanly and enlarged views return focus", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await openCandidate(page);
  for (const { lessonId, selector, mediaSelector } of REPRESENTATIVE_FIGURES) {
    await showRoute(page, lessonId);
    const figure = page.locator(`#${lessonId} ${selector}`).first();
    const geometry = await figure.evaluate((node, mediaSelectorValue) => {
      const rect = node.getBoundingClientRect();
      const media = node.querySelector(mediaSelectorValue)?.getBoundingClientRect();
      return { left: rect.left, right: rect.right, viewport: document.documentElement.clientWidth, mediaWidth: media?.width ?? 0 };
    }, mediaSelector);
    expect(geometry.left, lessonId).toBeGreaterThanOrEqual(-1);
    expect(geometry.right, lessonId).toBeLessThanOrEqual(geometry.viewport + 1);
    expect(geometry.mediaWidth, lessonId).toBeLessThanOrEqual(geometry.viewport + 1);
    const zoom = figure.locator("[data-open-figure-dialog]");
    await zoom.click();
    await expect(page.locator("#bio-figure-dialog")).toBeVisible();
    await expect(page.locator(`#bio-figure-dialog ${mediaSelector}`)).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(page.locator("#bio-figure-dialog")).toBeHidden();
    await expect(zoom).toBeFocused();
    await expect(figure.locator(`:scope > ${mediaSelector}`)).toHaveCount(1);
    await expectNoPageOverflow(page);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  for (const { lessonId } of REPRESENTATIVE_FIGURES) {
    await showRoute(page, lessonId);
    await expectNoPageOverflow(page);
  }
});

test("reviewed generated lesson figures load, reflow, enlarge, and retain accessible equivalents", async ({ page }) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const figures = [
    { routeId: "lesson-01", visualId: "lesson-01-integrated-control", equivalent: "Integrated nervous and endocrine control", assetToken: "lesson-01-integrated-control", width: 1586, height: 992 },
    { routeId: "lesson-02", visualId: "lesson-02-control-comparison", equivalent: "Shared logic, different delivery", assetToken: "lesson-02-control-comparison", width: 1586, height: 992 },
    { routeId: "lesson-03", visualId: "lesson-03-neuron-roles", equivalent: "Neuron roles form an information pathway", assetToken: "lesson-03-neuron-roles", width: 1586, height: 992 },
    { routeId: "lesson-03", visualId: "lesson-03-myelin-saltatory", equivalent: "Myelin changes where action potentials regenerate", assetToken: "lesson-03-myelin-saltatory", width: 1586, height: 992 },
    { routeId: "lesson-04", visualId: "lesson-04-resting-membrane", equivalent: "Static equivalent: ion conditions at rest", assetToken: "lesson-04-resting-membrane", width: 1586, height: 992 },
    { routeId: "lesson-05", visualId: "lesson-05-synaptic-transmission", equivalent: "Chemical synaptic transmission", assetToken: "lesson-05-synaptic-transmission", width: 1586, height: 992 },
    { routeId: "lesson-08", visualId: "lesson-08-sensory-receptors", equivalent: "Sensory receptor families", assetToken: "lesson-08-sensory-receptor-families", width: 1536, height: 1024 },
    { routeId: "lesson-09", visualId: "lesson-09-retina-pathway", equivalent: "Light and neural signals move in opposite directions", assetToken: "lesson-09-retina-pathway", width: 1586, height: 992 },
    { routeId: "lesson-10", visualId: "lesson-10-equilibrium", equivalent: "Vestibular evidence supports equilibrium", assetToken: "lesson-10-equilibrium", width: 1586, height: 992 },
    { routeId: "lesson-12", visualId: "lesson-12-endocrine-map", equivalent: "Principal Unit A endocrine structures", assetToken: "lesson-12-endocrine-map", width: 1586, height: 992 },
    { routeId: "lesson-16", visualId: "lesson-16-stress-response", equivalent: "Two coordinated stress-response pathways", assetToken: "lesson-16-stress-response", width: 1586, height: 992 },
    { routeId: "lesson-17", visualId: "lesson-17-integrated-regulation", equivalent: "Integrated regulation under changing conditions", assetToken: "lesson-17-integrated-regulation", width: 1586, height: 992 }
  ] as const;
  for (const viewport of [VIEWPORTS[0], VIEWPORTS[2]]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await openCandidate(page);
    for (const { routeId, visualId, equivalent, assetToken, width, height } of figures) {
      await showRoute(page, routeId);
      const figure = page.locator(`#${routeId} [data-generated-visual="${visualId}"]`);
      const image = figure.locator(":scope > img");
      await expect(figure).toBeVisible();
      await image.scrollIntoViewIfNeeded();
      await expect.poll(
        () => image.evaluate((node) => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0),
        { timeout: 10_000, message: `${viewport.id}:${visualId} should load after entering the viewport` }
      ).toBe(true);
      const imageState = await image.evaluate((node) => {
        const target = node as HTMLImageElement;
        const imageRect = target.getBoundingClientRect();
        const figureRect = target.closest("[data-generated-visual]")?.getBoundingClientRect();
        return {
          naturalWidth: target.naturalWidth,
          naturalHeight: target.naturalHeight,
          width: imageRect.width,
          withinFigure: Boolean(figureRect && imageRect.left >= figureRect.left - 1 && imageRect.right <= figureRect.right + 1)
        };
      });
      expect(imageState.naturalWidth).toBe(width);
      expect(imageState.naturalHeight).toBe(height);
      expect(imageState.width).toBeGreaterThan(250);
      expect(imageState.withinFigure, `${viewport.id}:${visualId}`).toBe(true);
      await expect(figure.locator(":scope > svg[data-replaced-by-generated-visual]")).toBeHidden();
      await expect(page.locator(`#${routeId}`)).toContainText(equivalent);

      const zoom = figure.locator("[data-open-figure-dialog]");
      await zoom.click();
      const dialog = page.locator("#bio-figure-dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog.locator(`[data-figure-dialog-body] img[src*="${assetToken}"]`)).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(zoom).toBeFocused();
      await expectNoPageOverflow(page);
    }
  }
});

test("generic negative-feedback figures keep every label clear of connectors", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const viewport of [VIEWPORTS[0], VIEWPORTS[2]]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await openCandidate(page);
    for (const lessonId of FEEDBACK_FIGURE_LESSONS) {
      await showRoute(page, lessonId);
      const figure = page.locator(`#${lessonId} [data-figure-slot="figure-generic-feedback-loop"]`);
      await figure.scrollIntoViewIfNeeded();
      const geometry = await figure.evaluate((node) => {
        const svg = node.querySelector<SVGSVGElement>("svg[data-feedback-diagram]");
        if (!svg) return null;
        const labels = Array.from(svg.querySelectorAll<SVGTextElement>("[data-feedback-label]"));
        const collisions: string[] = [];
        for (const [pathIndex, connector] of Array.from(svg.querySelectorAll<SVGPathElement>("[data-feedback-connector]")).entries()) {
          const matrix = connector.getScreenCTM();
          if (!matrix) {
            collisions.push(`connector-${pathIndex + 1}:missing-transform`);
            continue;
          }
          const length = connector.getTotalLength();
          const increment = Math.max(1, length / 600);
          for (let distance = 0; distance <= length; distance += increment) {
            const local = connector.getPointAtLength(distance);
            const point = svg.createSVGPoint();
            point.x = local.x;
            point.y = local.y;
            const screen = point.matrixTransform(matrix);
            const hit = labels.find((label) => {
              const rect = label.getBoundingClientRect();
              return screen.x >= rect.left - 1 && screen.x <= rect.right + 1 && screen.y >= rect.top - 1 && screen.y <= rect.bottom + 1;
            });
            if (hit) {
              collisions.push(`connector-${pathIndex + 1}:${hit.textContent?.trim() || "unlabelled"}`);
              break;
            }
          }
        }
        const textOutsideCards = Array.from(svg.querySelectorAll<SVGGElement>("[data-feedback-card]"))
          .flatMap((card, cardIndex) => {
            const box = card.querySelector<SVGRectElement>("rect")?.getBoundingClientRect();
            if (!box) return [`card-${cardIndex + 1}:missing-box`];
            return Array.from(card.querySelectorAll<SVGTextElement>("[data-feedback-label]"))
              .filter((label) => {
                const rect = label.getBoundingClientRect();
                return rect.left < box.left - 1 || rect.right > box.right + 1 || rect.top < box.top - 1 || rect.bottom > box.bottom + 1;
              })
              .map((label) => `card-${cardIndex + 1}:${label.textContent?.trim() || "unlabelled"}`);
          });
        const principle = svg.querySelector<SVGGElement>("[data-feedback-principle]");
        const principleBox = principle?.querySelector<SVGRectElement>("rect")?.getBoundingClientRect();
        const principleTextOutside = principleBox
          ? Array.from(principle.querySelectorAll<SVGTextElement>("[data-feedback-label]")).some((label) => {
              const rect = label.getBoundingClientRect();
              return rect.left < principleBox.left - 1 || rect.right > principleBox.right + 1 || rect.top < principleBox.top - 1 || rect.bottom > principleBox.bottom + 1;
            })
          : true;
        const figureRect = node.getBoundingClientRect();
        return {
          collisions,
          textOutsideCards,
          principleTextOutside,
          left: figureRect.left,
          right: figureRect.right,
          viewport: document.documentElement.clientWidth
        };
      });
      expect(geometry, `${lessonId} ${viewport.id}`).not.toBeNull();
      expect(geometry?.collisions, `${lessonId} ${viewport.id}`).toEqual([]);
      expect(geometry?.textOutsideCards, `${lessonId} ${viewport.id}`).toEqual([]);
      expect(geometry?.principleTextOutside, `${lessonId} ${viewport.id}`).toBe(false);
      expect(geometry?.left, `${lessonId} ${viewport.id}`).toBeGreaterThanOrEqual(-1);
      expect(geometry?.right, `${lessonId} ${viewport.id}`).toBeLessThanOrEqual((geometry?.viewport ?? 0) + 1);
      await expectNoPageOverflow(page);

      if (viewport.id === "mobile") {
        const zoom = figure.locator("[data-open-figure-dialog]");
        await zoom.click();
        await expect(page.locator("#bio-figure-dialog [data-feedback-diagram]")).toHaveCount(1);
        await page.keyboard.press("Escape");
        await expect(page.locator("#bio-figure-dialog")).toBeHidden();
        await expect(zoom).toBeFocused();
      }
    }
  }
});

test("source visuals load locally, enlarge by keyboard, and open the exact textbook page", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await openCandidate(page);

  for (const { lessonId, figureSlot, visualId } of REPLACED_FIGURES) {
    await showRoute(page, lessonId);
    await expect(page.locator(`#${lessonId} [data-figure-slot="${figureSlot}"]`)).toBeHidden();
    await expect(page.locator(`#${lessonId} [data-source-visual="${visualId}"]`)).toBeVisible();
  }

  for (const { lessonId, visualId } of SOURCE_VISUALS) {
    await showRoute(page, lessonId);
    const figure = page.locator(`#${lessonId} [data-source-visual="${visualId}"]`);
    const image = figure.locator(":scope > img");
    await figure.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const geometry = await figure.evaluate((node) => {
      const figureRect = node.getBoundingClientRect();
      const imageRect = node.querySelector(":scope > img")?.getBoundingClientRect();
      return {
        left: figureRect.left,
        right: figureRect.right,
        viewport: document.documentElement.clientWidth,
        imageWidth: imageRect?.width ?? 0
      };
    });
    expect(geometry.left, visualId).toBeGreaterThanOrEqual(-1);
    expect(geometry.right, visualId).toBeLessThanOrEqual(geometry.viewport + 1);
    expect(geometry.imageWidth, visualId).toBeLessThanOrEqual(geometry.viewport + 1);

    const zoom = figure.locator("[data-open-figure-dialog]");
    await zoom.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#bio-figure-dialog")).toBeVisible();
    await expect(page.locator("#bio-figure-dialog img")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(page.locator("#bio-figure-dialog")).toBeHidden();
    await expect(zoom).toBeFocused();
    await expect(figure.locator(":scope > img")).toHaveCount(1);
    await expectNoPageOverflow(page);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await showRoute(page, "lesson-09");
  await page.locator('[data-source-visual="eye-anatomy-source"] .bio-source-page-link').click();
  await expect(page.locator("#library")).toBeVisible();
  await expect(page).toHaveURL(/#library$/);
  await expectTextbookReaderJump(page, { document: "chapter-12", physical: 8, printed: 411 });

  await showRoute(page, "lesson-07");
  await page.locator('[data-source-visual="reflex-arc-anatomy-source"] .bio-source-page-link').click();
  await expect(page.locator("#library")).toBeVisible();
  await expectTextbookReaderJump(page, { document: "chapter-11", physical: 12, printed: 371 });
});

test("attempt, reveal, hide, reload, and seminar reasoning persist without changing completion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  await showRoute(page, "lesson-01");
  const attemptId = "biology30-unit-a-pilot:textbook:lesson-01:attempt";
  const attempt = page.locator(`[data-textbook-attempt="${attemptId}"]`);
  const answer = page.locator(`[data-textbook-answer="${attemptId}"]`);
  const lesson2Answer = page.locator('[data-textbook-answer="biology30-unit-a-pilot:textbook:lesson-02:attempt"]');
  await expect(answer).toBeHidden();
  await attempt.click();
  await expect(answer).toBeVisible();
  await expect(attempt).toHaveAttribute("aria-expanded", "true");
  await expect(lesson2Answer).toBeHidden();
  await answer.locator("[data-textbook-hide]").click();
  await expect(answer).toBeHidden();
  await expect(attempt).toHaveText("Show answers again");

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#lesson-01")).toBeVisible();
  await expect(answer).toBeHidden();
  await expect(attempt).toHaveText("Show answers again");
  await attempt.click();
  await expect(answer).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("biology30-unit-a-pilot:textbook-review:v1") || "{}").attempts)).toHaveProperty(attemptId, true);

  await showRoute(page, "review-seminar");
  const seminar = page.locator('[data-bio-response-id="biology30-unit-a-pilot:review-seminar:1:reasoning"]');
  await seminar.fill("The response opposes the original temperature disturbance and provides evidence of negative feedback.");
  await page.waitForTimeout(650);
  await page.locator('[data-textbook-attempt="biology30-unit-a-pilot:textbook:review-seminar-1:attempt"]').click();
  await expect(page.locator('[data-textbook-answer="biology30-unit-a-pilot:textbook:review-seminar-1:attempt"]')).toBeVisible();
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#review-seminar")).toBeVisible();
  await expect(seminar).toHaveValue(/opposes the original temperature disturbance/);
  await expect(page.locator('[data-textbook-answer="biology30-unit-a-pilot:textbook:review-seminar-1:attempt"]')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("biology30-unit-a-pilot:state:v1") || "{}").completions || [])).toEqual([]);
});

test("Process Collection automatically gathers saved exit slips without duplicating or owning their response state", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  await showRoute(page, "lesson-01");

  const response = "Sweating is the response, while core temperature is the regulated variable. The loop is negative feedback when heat loss reduces the original temperature rise.";
  const exit = page.locator('[data-bio-response-id="biology30-unit-a-pilot:lesson:01:exit"]');
  await exit.fill(response);
  await page.waitForTimeout(650);

  await showRoute(page, "investigation-notebook");
  await expect(page.locator("#investigation-notebook h1")).toHaveText("Process Collection");
  await expect(page.locator("[data-exit-slip-count]")).toHaveText("1 of 17 saved");
  const collected = page.locator('[data-collected-exit-slip="lesson-01"]');
  await expect(collected).toContainText("Lesson 1 · Homeostasis Under Pressure");
  await expect(collected).toContainText("Draft saved");
  await expect(collected.locator(".bio-exit-slip-entry__response")).toHaveText(response);

  await collected.locator("[data-open-exit-slip]").click();
  await expect(page.locator("#lesson-01")).toBeVisible();
  await expect(page.locator("#lesson-01 .bio-exit h2")).toBeFocused();
  await page.locator('[data-complete-bio-lesson="lesson-01"]').click();

  await showRoute(page, "investigation-notebook");
  await expect(collected).toContainText("Completed");
  await page.locator("[data-notebook-title]").fill("A separate process note");
  await page.locator("[data-notebook-body]").fill("This note is learner-created and can be removed without changing the collected exit slip.");
  await page.locator("[data-save-notebook-entry]").click();
  await page.locator("[data-remove-notebook-entry]").click();
  await expect(page.locator('[data-collected-exit-slip="lesson-01"]')).toContainText(response);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#investigation-notebook")).toBeVisible();
  await expect(page.locator('[data-collected-exit-slip="lesson-01"]')).toContainText("Completed");
  await expect(page.locator('[data-collected-exit-slip="lesson-01"] .bio-exit-slip-entry__response')).toHaveText(response);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('[data-collected-exit-slip="lesson-01"] header')).toHaveCSS("display", "block");
  await expectNoPageOverflow(page);
});

test("Core Vocabulary deep links, Frayer drafting, model comparison, and Process Collection persist without changing course progress", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);

  await showRoute(page, "lesson-04");
  await page.locator('#lesson-04 .bio-word-lens [data-open-core-vocabulary="action-potential"]').click();
  await expect(page.locator("#core-vocabulary")).toBeVisible();
  await expect(page.locator('[data-vocabulary-entry="action-potential"]')).toBeVisible();
  await expect(page.locator("#vocabulary-action-potential-title")).toBeFocused();
  await expect(page.locator("[data-progress-count]")).toHaveText("0 / 17 lesson exits");

  const search = page.locator("[data-vocabulary-search]");
  await search.fill("trans-");
  await expect(page.locator('[data-vocabulary-entry-target="sensory-transduction"]')).toBeVisible();
  await expect(page.locator('[data-vocabulary-entry-target="action-potential"]')).toBeHidden();
  await search.fill("");
  await page.locator("[data-vocabulary-filter]").selectOption("endocrine-control");
  await expect(page.locator('[data-vocabulary-entry="endocrine-signalling"]')).toBeVisible();
  await page.locator("[data-vocabulary-filter]").selectOption("all");

  await page.locator('[data-vocabulary-entry-target="sympathetic-parasympathetic"]').click();
  const choicePanel = page.locator('[data-vocabulary-entry="sympathetic-parasympathetic"]');
  await choicePanel.locator("[data-choose-vocabulary]").click();
  await expect(choicePanel.locator('[data-vocabulary-field="definition"]')).toBeEnabled();
  await expect(choicePanel.locator("[data-vocabulary-choice-status]")).toHaveText("Selected");
  await choicePanel.locator("[data-clear-vocabulary]").click();
  await expect(choicePanel.locator('[data-vocabulary-field="definition"]')).toBeDisabled();

  await page.locator('[data-vocabulary-entry-target="action-potential"]').click();
  const panel = page.locator('[data-vocabulary-entry="action-potential"]');
  const values = {
    definition: "A threshold-triggered voltage event that is regenerated along an axon.",
    characteristics: "Voltage-gated sodium and potassium channels act in sequence, followed by a refractory period.",
    example: "Sodium entry drives a rising phase after threshold in the Lesson 4 membrane model.",
    "non-example": "A subthreshold graded change that fades before triggering the complete channel sequence."
  };
  for (const [field, value] of Object.entries(values)) {
    await panel.locator(`[data-vocabulary-field="${field}"]`).fill(value);
  }
  await page.waitForTimeout(650);

  const compare = panel.locator('[data-reveal-vocabulary-model="action-potential"]');
  const collect = panel.locator('[data-collect-vocabulary="action-potential"]');
  await expect(compare).toBeEnabled();
  await expect(collect).toBeEnabled();
  await compare.click();
  await expect(panel.locator('[data-vocabulary-model="action-potential"]')).toBeVisible();
  await expect(compare).toHaveAttribute("aria-expanded", "true");

  await panel.locator('[data-vocabulary-field="definition"]').fill("");
  await expect(panel.locator('[data-vocabulary-model="action-potential"]')).toBeHidden();
  await expect(compare).toBeDisabled();
  await panel.locator('[data-vocabulary-field="definition"]').fill(values.definition);
  await page.waitForTimeout(650);
  await collect.click();
  await expect(page.locator("[data-vocabulary-progress]")).toHaveText("1 of 8 added to Process Collection");
  await expect(page.locator("[data-progress-count]")).toHaveText("0 / 17 lesson exits");

  await showRoute(page, "investigation-notebook");
  await expect(page.locator("[data-vocabulary-collection-count]")).toHaveText("1 of 8 collected");
  const collected = page.locator('[data-collected-vocabulary="action-potential"]');
  await expect(collected).toContainText(values.definition);
  await expect(collected).toContainText(values.characteristics);
  await expect(collected).toContainText("Fixed concept");
  await collected.locator("[data-open-core-vocabulary]").click();
  await expect(panel).toBeVisible();
  await expect(page.locator("#vocabulary-action-potential-title")).toBeFocused();
  await expect(panel.locator('[data-vocabulary-field="example"]')).toHaveValue(values.example);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#core-vocabulary")).toBeVisible();
  await expect(panel).toBeVisible();
  await expect(panel.locator('[data-vocabulary-field="non-example"]')).toHaveValue(values["non-example"]);
  await expect(page.locator("[data-vocabulary-progress]")).toHaveText("1 of 8 added to Process Collection");
  await panel.locator('[data-remove-vocabulary="action-potential"]').click();
  await expect(page.locator("[data-vocabulary-progress]")).toHaveText("0 of 8 added to Process Collection");
  await expect(panel.locator('[data-vocabulary-field="definition"]')).toHaveValue(values.definition);
  await expect(page.locator("[data-progress-count]")).toHaveText("0 / 17 lesson exits");
});

test("Core Vocabulary exposes all 28 families and safely enforces the two learner-choice limit", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  await showRoute(page, "core-vocabulary");

  await expect(page.locator("[data-vocabulary-entry-target]")).toHaveCount(28);
  await expect(page.locator("[data-vocabulary-entry-select] option")).toHaveCount(28);
  await expect(page.locator("[data-vocabulary-entry]")).toHaveCount(28);
  await expect(page.locator("[data-vocabulary-fixed='true']")).toHaveCount(6);
  await expect(page.locator("[data-vocabulary-choice='true']")).toHaveCount(22);

  const renderedIds = await page.locator("[data-vocabulary-entry-target]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-vocabulary-entry-target")));
  expect(renderedIds).toEqual(CORE_VOCABULARY_IDS);
  const fixedIds = await page.locator("[data-vocabulary-fixed='true']").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-vocabulary-frayer")).sort());
  expect(fixedIds).toEqual([...CORE_VOCABULARY_FIXED_IDS].sort());

  const selectEntry = async (entryId: string) => {
    await page.locator(`[data-vocabulary-entry-target="${entryId}"]`).click();
    await expect(page.locator(`[data-vocabulary-entry="${entryId}"]`)).toBeVisible();
  };
  const firstChoice = "regulated-variable-set-point";
  const secondChoice = "control-system-roles";
  const thirdChoice = "scientific-explanation";

  await selectEntry(firstChoice);
  await page.locator(`[data-choose-vocabulary="${firstChoice}"]`).click();
  await expect(page.locator(`[data-vocabulary-frayer="${firstChoice}"] textarea`).first()).toBeEnabled();

  await selectEntry(secondChoice);
  await page.locator(`[data-choose-vocabulary="${secondChoice}"]`).click();
  await expect(page.locator(`[data-vocabulary-frayer="${secondChoice}"] textarea`).first()).toBeEnabled();

  await selectEntry(thirdChoice);
  await page.locator(`[data-choose-vocabulary="${thirdChoice}"]`).click();
  await expect(page.locator(`[data-vocabulary-choice-status="${thirdChoice}"]`)).toHaveText("Two choices are already selected.");
  await expect(page.locator(`[data-vocabulary-frayer="${thirdChoice}"] textarea`).first()).toBeDisabled();

  await selectEntry(firstChoice);
  await page.locator(`[data-clear-vocabulary="${firstChoice}"]`).click();
  await expect(page.locator(`[data-vocabulary-frayer="${firstChoice}"] textarea`).first()).toBeDisabled();
  await selectEntry(thirdChoice);
  await page.locator(`[data-choose-vocabulary="${thirdChoice}"]`).click();
  await expect(page.locator(`[data-vocabulary-frayer="${thirdChoice}"] textarea`).first()).toBeEnabled();

  await selectEntry(secondChoice);
  const secondDefinition = page.locator(`[data-vocabulary-frayer="${secondChoice}"] [data-vocabulary-field="definition"]`);
  await secondDefinition.fill("A control-system role identifies what a structure does within a particular pathway.");
  await page.waitForTimeout(650);
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.locator(`[data-clear-vocabulary="${secondChoice}"]`).click();
  await expect(secondDefinition).toHaveValue(/control-system role/);
  await expect(page.locator(`[data-vocabulary-choice-status="${secondChoice}"]`)).toHaveText("Selected");
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator(`[data-clear-vocabulary="${secondChoice}"]`).click();
  await expect(secondDefinition).toHaveValue("");
  await expect(secondDefinition).toBeDisabled();
  await expect(page.locator("[data-progress-count]")).toHaveText("0 / 17 lesson exits");
});

test("every lesson Word Lens opens the exact planned Core Vocabulary concept", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);

  for (const [lessonId, entryIds] of Object.entries(WORD_LENS_MAPPINGS)) {
    await showRoute(page, lessonId);
    const links = page.locator(`#${lessonId} .bio-word-lens [data-open-core-vocabulary]`);
    await expect(links).toHaveCount(entryIds.length);
    expect(await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-open-core-vocabulary")))).toEqual(entryIds);
    for (const entryId of entryIds) {
      await showRoute(page, lessonId);
      await page.locator(`#${lessonId} .bio-word-lens [data-open-core-vocabulary="${entryId}"]`).click();
      await expect(page.locator("#core-vocabulary")).toBeVisible();
      await expect(page.locator(`[data-vocabulary-entry="${entryId}"]`)).toBeVisible();
      await expect(page.locator(`#vocabulary-${entryId}-title`)).toBeFocused();
    }
  }
});

test("Core Vocabulary reflows for mobile and accepts existing version-2 learner state", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  await page.evaluate(() => {
    localStorage.setItem("biology30-unit-a-pilot:state:v1", JSON.stringify({
      v: 2,
      t: "0",
      l: "core-vocabulary",
      r: [],
      p: [],
      i: { a: [0, "1"], b: ["regulated-meal", []], g: [] },
      a: [],
      n: [],
      c: [],
      f: null
    }));
    history.replaceState(null, "", "#core-vocabulary");
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#core-vocabulary")).toBeVisible();
  await expect(page.locator('[data-vocabulary-entry="homeostasis"]')).toBeVisible();
  await expect(page.locator("[data-vocabulary-progress]")).toHaveText("0 of 8 added to Process Collection");

  const desktopGeometry = await page.locator('[data-vocabulary-frayer="homeostasis"] .bio-frayer-grid').evaluate((grid) => {
    const fields = Array.from(grid.querySelectorAll("textarea")).map((field) => field.getBoundingClientRect().toJSON());
    return { first: fields[0], second: fields[1], third: fields[2] };
  });
  expect(desktopGeometry.second.left).toBeGreaterThan(desktopGeometry.first.right);
  expect(desktopGeometry.third.top).toBeGreaterThan(desktopGeometry.first.bottom);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".bio-vocabulary-desktop-index")).toBeHidden();
  await expect(page.locator(".bio-vocabulary-mobile-select")).toBeVisible();
  const mobileGeometry = await page.locator('[data-vocabulary-frayer="homeostasis"] .bio-frayer-grid').evaluate((grid) => {
    const fields = Array.from(grid.querySelectorAll("textarea")).map((field) => field.getBoundingClientRect().toJSON());
    return { first: fields[0], second: fields[1] };
  });
  expect(mobileGeometry.second.top).toBeGreaterThan(mobileGeometry.first.bottom);
  expect(Math.abs(mobileGeometry.second.left - mobileGeometry.first.left)).toBeLessThanOrEqual(2);
  await expectNoPageOverflow(page);
});

test("Review stays optional while Lesson 17 is keyboard-accessible under Integration and Mastery", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  const reviewToggle = page.locator('[data-nav-group-toggle="review-overview"]');
  await reviewToggle.focus();
  await page.keyboard.press("Enter");
  await expect(reviewToggle).toHaveAttribute("aria-expanded", "true");
  for (const routeId of REVIEW_ROUTES.slice(1)) {
    const link = page.locator(`#review-subnav [data-page-target="${routeId}"]`);
    await link.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(`#${routeId}`)).toBeVisible();
  }
  await expect(page.locator('#review-subnav [data-page-target="lesson-17"]')).toHaveCount(0);
  await expect(page.locator('#review-overview [data-page-target="lesson-17"]')).toHaveCount(0);
  const lessonsToggle = page.locator("[data-lessons-toggle]");
  await lessonsToggle.focus();
  await page.keyboard.press("Enter");
  await expect(lessonsToggle).toHaveAttribute("aria-expanded", "true");
  const lesson17 = page.locator('#lesson-subnav [data-page-target="lesson-17"]');
  await lesson17.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#lesson-17")).toBeVisible();
  await expect(page.locator("[data-lessons-toggle]")).toHaveAttribute("aria-expanded", "true");
  await expect(reviewToggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator('#lesson-17 [data-page-target="practice-hub"]')).toHaveCount(1);
  await expect(page.locator("[data-final-practice]")).toHaveCount(1);
});

test("Library, Video Library, review routes, and representative lessons are axe-clean", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  for (const routeId of AXE_ROUTES) {
    await showRoute(page, routeId);
    const results = await new AxeBuilder({ page })
      .include(`#${routeId}`)
      .exclude('iframe[src*="youtube-nocookie.com"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations, `axe violations on ${routeId}`).toEqual([]);
  }
});

test("review routes remain usable at 200 percent text zoom and touch controls remain practical on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  for (const routeId of REVIEW_ROUTES) {
    await showRoute(page, routeId);
    await expectNoPageOverflow(page);
    await expect(page.locator(`#${routeId} h1`)).toBeVisible();
  }

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.setViewportSize({ width: 390, height: 844 });
  await showRoute(page, "library");
  const undersized = await page.locator("#library button:visible, #library a:visible, #review-subnav a:visible").evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { text: node.textContent?.trim().slice(0, 50), width: rect.width, height: rect.height };
  }).filter((target) => target.width < 43 || target.height < 43));
  expect(undersized).toEqual([]);
  await expectNoPageOverflow(page);
});
