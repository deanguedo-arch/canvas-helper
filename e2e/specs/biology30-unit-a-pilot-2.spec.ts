import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { openProjectInStudio } from "../lib/project-open";

const PROJECT = "biology30-unit-a-pilot-2";
const STORAGE_KEY = `${PROJECT}:state:v1`;
const ROUTES = [
  "overview",
  "lesson-01",
  "lesson-02",
  "lesson-03",
  "lesson-04",
  "lesson-05",
  "chapter-11-practice",
  "lesson-06",
  "lesson-07",
  "lesson-08",
  "chapter-12-practice",
  "lesson-09",
  "lesson-10",
  "lesson-11",
  "lesson-12",
  "lesson-13",
  "chapter-13-practice",
  "review-seminar",
  "final-practice",
  "process-collection",
  "core-vocabulary",
  "advanced-learning",
  "textbook-library",
  "video-library",
  "model-lab",
  "glossary-and-data",
  "sources-and-credits"
] as const;
const ADVANCED_BY_LESSON = {
  "lesson-01": ["l01-b01", "l01-b02", "l01-b03"],
  "lesson-02": ["l02-b01", "l02-b02", "l02-b03"],
  "lesson-03": ["l03-b01", "l03-b02", "l03-b03"],
  "lesson-04": ["l04-b01", "l04-b02", "l04-b03"],
  "lesson-05": ["l05-b01", "l05-b02", "l05-b03"],
  "lesson-06": ["l06-b01", "l06-b02", "l06-b03"],
  "lesson-07": ["l07-b01", "l07-b02", "l07-b03"],
  "lesson-08": ["l08-b01", "l08-b02", "l08-b03"],
  "lesson-09": ["l09-b01", "l09-b02", "l09-b03"],
  "lesson-10": ["l10-b01", "l10-b02", "l10-b03"],
  "lesson-11": ["l11-b01", "l11-b02", "l11-b03"],
  "lesson-12": ["l12-b01", "l12-b02", "l12-b03"],
  "lesson-13": ["l13-b01", "l13-b02", "l13-b03", "l13-b04"]
} as const;
const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900 },
  { id: "tablet", width: 1024, height: 768 },
  { id: "mobile", width: 390, height: 844 }
] as const;
const TEXTBOOK_REVIEWS = [
  {
    routeId: "chapter-11-practice",
    attemptId: `${PROJECT}:textbook:chapter-11-review:attempt`,
    documentId: "chapter-11",
    printedPage: 402,
    physicalPage: 43,
    answerCount: 20,
    jumpTargetId: "chapter-11-practice-course-questions",
    jumpLabel: "Go to the 12 course questions"
  },
  {
    routeId: "chapter-12-practice",
    attemptId: `${PROJECT}:textbook:chapter-12-review:attempt`,
    documentId: "chapter-12",
    printedPage: 432,
    physicalPage: 29,
    answerCount: 30,
    jumpTargetId: "chapter-12-practice-course-questions",
    jumpLabel: "Go to the 12 course questions"
  },
  {
    routeId: "chapter-13-practice",
    attemptId: `${PROJECT}:textbook:chapter-13-review:attempt`,
    documentId: "chapter-13",
    printedPage: 464,
    physicalPage: 31,
    answerCount: 19,
    jumpTargetId: "chapter-13-practice-course-questions",
    jumpLabel: "Go to the 12 course questions"
  },
  {
    routeId: "final-practice",
    attemptId: `${PROJECT}:textbook:textbook-unit-review:attempt`,
    documentId: "chapter-13",
    printedPage: 468,
    physicalPage: 35,
    answerCount: 51,
    jumpTargetId: "final-practice-core-questions",
    jumpLabel: "Go to the 18 core questions"
  }
] as const;

async function openCandidate(page: Page) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await openProjectInStudio(page, PROJECT);
      lastError = undefined;
      break;
    } catch (error) {
      lastError = error;
      if (attempt === 0) {
        await page.goto("about:blank");
        await page.waitForTimeout(1_000);
      }
    }
  }
  if (lastError) throw lastError;
  const frame = page.getByTestId("workspace-preview-frame");
  const src = await frame.getAttribute("src");
  if (!src) throw new Error("Pilot 2 workspace preview has no source URL.");
  const candidateUrl = new URL(src, page.url()).href;
  await page.goto(candidateUrl, { waitUntil: "domcontentloaded" });
  await expect(page.locator("main#course-main")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  return candidateUrl;
}

async function readStoredState(page: Page) {
  return page.evaluate((key) => {
    const raw = JSON.parse(localStorage.getItem(key) || "{}");
    if (raw.encoding !== "hashed-v1") return raw;
    const stableToken = (id: string) => {
      let hash = 2166136261;
      for (let index = 0; index < id.length; index += 1) {
        hash ^= id.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }
      return (hash >>> 0).toString(36);
    };
    const decode = (record: Record<string, unknown>, selector: string, attribute: string, decodeValue: (value: any) => any) => {
      const ids = [...new Set(Array.from(document.querySelectorAll(selector)).map((node) => node.getAttribute(attribute)).filter(Boolean))] as string[];
      const byToken = Object.fromEntries(ids.map((id) => [stableToken(id), id]));
      return Object.fromEntries(Object.entries(record || {}).map(([token, value]) => [token.startsWith("=") ? token.slice(1) : byToken[token], decodeValue(value)]).filter(([id]) => Boolean(id)));
    };
    raw.responses = decode(raw.responses, "[data-response-id]", "data-response-id", (value) => String(value || ""));
    raw.practice = decode(raw.practice, "[data-practice-id]", "data-practice-id", (value) => typeof value === "string" && value.length >= 3
      ? { choice: value.slice(0, -2), submitted: value.slice(-2, -1) === "1", correct: value.slice(-1) === "1" }
      : value);
    const manifest = JSON.parse(document.documentElement.getAttribute("data-advanced-manifest") || "[]") as string[];
    const bitset = typeof raw.advanced?.c === "string" ? raw.advanced.c : "";
    const completedIds: string[] = [];
    if (manifest.length === 40 && /^[0-9a-f]{10}$/i.test(bitset)) {
      for (let group = 0; group < 10; group += 1) {
        const nibble = Number.parseInt(bitset[group], 16);
        for (let bit = 0; bit < 4; bit += 1) {
          if ((nibble & (1 << bit)) !== 0 && manifest[group * 4 + bit]) completedIds.push(manifest[group * 4 + bit]);
        }
      }
    }
    raw.advanced = { c: bitset, completedIds };
    return raw;
  }, STORAGE_KEY);
}

async function showRoute(page: Page, routeId: string) {
  await page.evaluate((id) => {
    const nextHash = `#${id}`;
    if (window.location.hash === nextHash) window.dispatchEvent(new HashChangeEvent("hashchange"));
    else window.location.hash = nextHash;
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

async function submitPractice(page: Page, itemSelector: string, choiceValue?: string) {
  const item = page.locator(itemSelector);
  const option = choiceValue
    ? item.locator(`input[value="${choiceValue}"]`)
    : item.locator("input").first();
  await option.check();
  await item.locator("[data-check-practice]").click();
  await expect(item.locator("[data-practice-feedback]")).toBeVisible();
  return item;
}

async function completeMediaCheckpoint(page: Page, sectionSelector: string, path: "video" | "local" = "local") {
  const section = page.locator(sectionSelector);
  const checkpointId = await section.getAttribute("data-media-checkpoint-id");
  if (!checkpointId) throw new Error(`Missing media checkpoint at ${sectionSelector}`);
  await section.locator(`[data-media-path="${checkpointId}"][value="${path}"]`).check();
  if (path === "local") await expect(section.locator("[data-local-equivalent]")).toHaveAttribute("open", "");
  const answer = await section.locator(`[data-media-check-feedback="${checkpointId}"]`).getAttribute("data-answer");
  if (!answer) throw new Error(`Missing answer for ${checkpointId}`);
  await section.locator(`[data-media-check-choice="${checkpointId}"][value="${answer}"]`).check();
  const button = section.locator(`[data-check-media="${checkpointId}"]`);
  await expect(button).toBeEnabled();
  await button.click();
  await expect(section.locator(`[data-media-check-feedback="${checkpointId}"]`)).toContainText("Correct");
  return checkpointId;
}

test("Revision Gate B preserves five navigation groups and every learner route reflows without horizontal overflow", async ({ page }) => {
  test.setTimeout(180_000);
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await openCandidate(page);
    await page.route(/youtube-nocookie\.com/, (route) => route.abort());
    await expect(page.locator(".nav-group")).toHaveCount(5);
    await expect(page.locator(".course-page")).toHaveCount(ROUTES.length);
    expect(await page.locator(".course-page").evaluateAll((nodes) => nodes.map((node) => node.id))).toEqual(ROUTES);
    for (const routeId of ROUTES) {
      const route = await showRoute(page, routeId);
      await expect(route.locator("h1")).toHaveCount(1);
      await expect(route.locator("h1")).toBeVisible();
      await expectNoPageOverflow(page);
    }
  }
});

test("desktop navigation collapses and restores while the mobile drawer remains available", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const candidateUrl = await openCandidate(page);
  const toggle = page.locator("[data-sidebar-toggle]");
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await toggle.click();
  await expect(page.locator("body")).toHaveClass(/sidebar-collapsed/);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toHaveAttribute("aria-label", "Expand course navigation");
  expect(await page.locator(".sidebar").evaluate((node) => Math.round(node.getBoundingClientRect().width))).toBe(72);

  await page.goto(`${candidateUrl}#overview`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).toHaveClass(/sidebar-collapsed/);
  await expect(page.locator("[data-sidebar-toggle]")).toHaveAttribute("aria-expanded", "false");

  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.locator("[data-menu-button]");
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(page.locator(".sidebar")).toHaveClass(/is-open/);
  await expect(page.locator(".menu-scrim")).toBeVisible();
  await expectNoPageOverflow(page);
});

test("Models and Data Lab mechanism steps stay readable as the available panel width changes", async ({ page }) => {
  await page.setViewportSize({ width: 1117, height: 902 });
  await openCandidate(page);
  await showRoute(page, "model-lab");
  await page.locator('[data-model-select="pituitary"]').click();

  const panel = page.locator('[data-model-panel="pituitary"]');
  const path = panel.locator(".model-path");
  await expect(panel).toBeVisible();
  await expect(path.locator("li")).toHaveCount(4);

  const inspectPath = () => path.evaluate((node) => {
    const cards = Array.from(node.querySelectorAll<HTMLElement>("li"));
    return {
      columns: getComputedStyle(node).gridTemplateColumns.split(/\s+/).filter(Boolean).length,
      cards: cards.map((card) => {
        const bounds = card.getBoundingClientRect();
        const copy = card.querySelector<HTMLElement>(".model-step-copy")?.getBoundingClientRect();
        return {
          top: bounds.top,
          bottom: bounds.bottom,
          left: bounds.left,
          right: bounds.right,
          width: bounds.width,
          overflowX: card.scrollWidth - card.clientWidth,
          overflowY: card.scrollHeight - card.clientHeight,
          copyRight: copy?.right ?? bounds.right,
          copyBottom: copy?.bottom ?? bounds.bottom
        };
      })
    };
  });

  const expanded = await inspectPath();
  expect(expanded.columns).toBe(1);
  expect(expanded.cards.every((card) => card.overflowX <= 1 && card.overflowY <= 1)).toBe(true);
  await panel.locator('[data-model-choice="adh-route"]').click();
  await panel.locator("[data-model-prediction]").fill("ADH should follow a neural release route from the hypothalamus through the posterior pituitary.");
  await panel.locator("[data-test-model]").click();
  await expect(panel.locator("[data-model-output] .model-result-flow")).toBeVisible();
  expect(await panel.locator("[data-model-output]").evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);

  await page.locator("[data-sidebar-toggle]").click();
  await expect(page.locator("body")).toHaveClass(/sidebar-collapsed/);

  for (const modelId of await page.locator("[data-model-select]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-model-select") || ""))) {
    await page.locator(`[data-model-select="${modelId}"]`).click();
    const currentPanel = page.locator(`[data-model-panel="${modelId}"]`);
    const currentPath = page.locator(`[data-model-panel="${modelId}"] .model-path`);
    const geometry = await currentPath.evaluate((node) => {
      const cards = Array.from(node.querySelectorAll<HTMLElement>("li"));
      return {
        columns: getComputedStyle(node).gridTemplateColumns.split(/\s+/).filter(Boolean).length,
        cards: cards.map((card) => {
          const bounds = card.getBoundingClientRect();
          const copy = card.querySelector<HTMLElement>(".model-step-copy")?.getBoundingClientRect();
          return {
            top: bounds.top,
            bottom: bounds.bottom,
            width: bounds.width,
            overflowX: card.scrollWidth - card.clientWidth,
            overflowY: card.scrollHeight - card.clientHeight,
            copyRight: copy?.right ?? bounds.right,
            cardRight: bounds.right,
            copyBottom: copy?.bottom ?? bounds.bottom
          };
        })
      };
    });
    expect(geometry.columns, `${modelId} uses a two-column reading layout`).toBe(2);
    expect(geometry.cards.every((card) => card.width >= 280), `${modelId} cards retain useful line length`).toBe(true);
    expect(geometry.cards.every((card) => card.overflowX <= 1 && card.overflowY <= 1), `${modelId} cards do not overflow`).toBe(true);
    expect(geometry.cards.every((card) => card.copyRight <= card.cardRight + 1 && card.copyBottom <= card.bottom + 1), `${modelId} copy remains inside its card`).toBe(true);
    expect(Math.abs(geometry.cards[0].top - geometry.cards[1].top)).toBeLessThanOrEqual(1);
    expect(Math.abs(geometry.cards[2].top - geometry.cards[3].top)).toBeLessThanOrEqual(1);
    expect(geometry.cards[2].top).toBeGreaterThanOrEqual(geometry.cards[0].bottom - 1);
    await currentPanel.locator("[data-model-choice]").last().click();
    await currentPanel.locator("[data-model-prediction]").fill("I predict that changing this condition will alter the highlighted mechanism step.");
    await currentPanel.locator("[data-test-model]").click();
    await expect(currentPanel.locator("[data-model-output] h3")).toBeVisible();
    expect(await currentPanel.locator("[data-model-output]").evaluate((node) => node.scrollWidth - node.clientWidth), `${modelId} result does not overflow`).toBeLessThanOrEqual(1);
  }
  await expectNoPageOverflow(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await showRoute(page, "model-lab");
  const mobileColumns = await page.locator('[data-model-panel="glucose"] .model-path').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(/\s+/).filter(Boolean).length);
  expect(mobileColumns).toBe(1);
  await page.locator('[data-model-panel="glucose"] [data-model-choice="low-insulin"]').click();
  await page.locator('[data-model-panel="glucose"] [data-model-prediction]').fill("Glucose should remain elevated when the insulin signal is low.");
  await page.locator('[data-model-panel="glucose"] [data-test-model]').click();
  await expect(page.locator('[data-model-panel="glucose"] [data-model-output] .model-graph')).toBeVisible();
  await expectNoPageOverflow(page);
});

test("illustrated walkthrough steps stack before their headings or explanations become narrow", async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1265, height: 902 });
  await openCandidate(page);
  await page.route(/youtube-nocookie\.com/, (route) => route.abort());

  const sidebarToggle = page.locator("[data-sidebar-toggle]");
  if (!(await page.locator("body").evaluate((node) => node.classList.contains("sidebar-collapsed")))) {
    await sidebarToggle.click();
  }

  const mediaEntries = [
    ["lesson-01", "A44brRGG4Ys"], ["lesson-02", "oa6rvUJlg7o"], ["lesson-03", "YcJy28Nnrb8"],
    ["lesson-04", "QY9NTVh-Awo"], ["lesson-05", "0-8PvNOdByc"], ["lesson-06", "qPix_X-9t7E"],
    ["lesson-07", "o0DYP-u1rNM"], ["lesson-08", "Ie2j7GpC4JU"], ["lesson-09", "eWHH9je2zG4"],
    ["lesson-10", "QHkGG4TimvQ"], ["lesson-11", "BYaR-JgbjCs"], ["lesson-12", "cDGmsR2ZILE"],
    ["lesson-13", "y9Bdi4dnSlg"], ["lesson-13", "v-t1Z5-oPtU"]
  ] as const;

  const inspectWalkthrough = (selector: string) => page.locator(selector).evaluate((node) => {
    const cards = Array.from(node.querySelectorAll<HTMLElement>("li"));
    return {
      columns: getComputedStyle(node).gridTemplateColumns.split(/\s+/).filter(Boolean).length,
      cards: cards.map((card) => {
        const bounds = card.getBoundingClientRect();
        const copy = card.querySelector<HTMLElement>(":scope > div")?.getBoundingClientRect();
        const heading = card.querySelector<HTMLElement>("strong")?.getBoundingClientRect();
        const explanation = card.querySelector<HTMLElement>("p")?.getBoundingClientRect();
        return {
          top: bounds.top,
          bottom: bounds.bottom,
          width: bounds.width,
          right: bounds.right,
          overflowX: card.scrollWidth - card.clientWidth,
          overflowY: card.scrollHeight - card.clientHeight,
          copyRight: copy?.right ?? bounds.right,
          copyBottom: copy?.bottom ?? bounds.bottom,
          headingRight: heading?.right ?? bounds.right,
          explanationRight: explanation?.right ?? bounds.right
        };
      })
    };
  });

  for (const [routeId, videoId] of mediaEntries) {
    await showRoute(page, routeId);
    const section = page.locator(`#${routeId} [data-video-entry="${videoId}"]`);
    const checkpointId = await section.getAttribute("data-media-checkpoint-id");
    if (!checkpointId) throw new Error(`Missing media checkpoint for ${routeId}/${videoId}.`);
    await section.locator(`[data-media-path="${checkpointId}"][value="local"]`).check();
    const geometry = await inspectWalkthrough(`#${routeId} [data-video-entry="${videoId}"] .illustrated-equivalent ol`);
    expect(geometry.columns, `${routeId}/${videoId} uses two readable columns`).toBe(2);
    expect(geometry.cards.every((card) => card.width >= 240), `${routeId}/${videoId} cards remain readable`).toBe(true);
    expect(geometry.cards.every((card) => card.overflowX <= 1 && card.overflowY <= 1), `${routeId}/${videoId} cards do not clip`).toBe(true);
    expect(geometry.cards.every((card) => card.copyRight <= card.right + 1 && card.copyBottom <= card.bottom + 1), `${routeId}/${videoId} copy remains inside each step`).toBe(true);
    expect(geometry.cards.every((card) => card.headingRight <= card.right + 1 && card.explanationRight <= card.right + 1), `${routeId}/${videoId} headings and explanations fit`).toBe(true);
    expect(Math.abs(geometry.cards[0].top - geometry.cards[1].top)).toBeLessThanOrEqual(1);
    expect(Math.abs(geometry.cards[2].top - geometry.cards[3].top)).toBeLessThanOrEqual(1);
    expect(geometry.cards[2].top).toBeGreaterThanOrEqual(geometry.cards[0].bottom - 1);
  }
  await expectNoPageOverflow(page);

  await showRoute(page, "lesson-01");
  await sidebarToggle.click();
  await expect(page.locator("body")).not.toHaveClass(/sidebar-collapsed/);
  const expandedColumns = await page.locator('#lesson-01 .illustrated-equivalent ol').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(/\s+/).filter(Boolean).length);
  expect(expandedColumns).toBe(1);
  await expectNoPageOverflow(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await showRoute(page, "lesson-01");
  const mobileColumns = await page.locator('#lesson-01 .illustrated-equivalent ol').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(/\s+/).filter(Boolean).length);
  expect(mobileColumns).toBe(1);
  await expectNoPageOverflow(page);
});

test("all thirteen lessons use four anchors, complete vocabulary, and teach before retrieval", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  await page.route(/youtube-nocookie\.com/, (route) => route.abort());

  const lesson1 = await showRoute(page, "lesson-01");
  await expect(lesson1.locator(".lesson-words dt")).toHaveText(["neuron", "dendrite and axon", "glial cell", "myelin"]);
  await expect(lesson1).toContainText("Myelin acts as electrical insulation");
  await expect(lesson1).toContainText("limits current loss");
  await expect(lesson1).toContainText("action potential is regenerated at each node");
  await expect(lesson1.locator("[data-figure-id]")).toHaveCount(4);

  const lesson3 = await showRoute(page, "lesson-03");
  const lesson3Text = await lesson3.innerText();
  expect(lesson3Text.indexOf("A neurotransmitter is a chemical messenger")).toBeGreaterThanOrEqual(0);
  expect(lesson3Text.indexOf("A neurotransmitter is a chemical messenger")).toBeLessThan(lesson3Text.indexOf("Acetylcholine is a neurotransmitter"));
  await expect(lesson3.locator(".sequence-model li")).toHaveCount(6);

  for (const lessonId of Array.from({ length: 13 }, (_value, index) => `lesson-${String(index + 1).padStart(2, "0")}`)) {
    const lesson = await showRoute(page, lessonId);
    await expect(lesson.locator(".lesson-words dt")).toHaveCount(4);
    await expect(lesson.locator("details.lesson-term-inventory")).toHaveCount(1);
    expect(await lesson.locator("details.lesson-term-inventory .lesson-term-row").count(), `${lessonId} includes its supporting terminology`).toBeGreaterThanOrEqual(4);
    expect(await lesson.locator(".learn-block").count(), `${lessonId} has at least three short Learn sections`).toBeGreaterThanOrEqual(3);
    expect(await lesson.locator("[data-figure-id]").count(), `${lessonId} has at least four purposeful visuals or data models`).toBeGreaterThanOrEqual(4);
    const order = await lesson.evaluate((node) => {
      const taught = node.querySelector(".worked-example");
      const retrieve = node.querySelector(".retrieve-block");
      if (!taught || !retrieve) return null;
      return Boolean(taught.compareDocumentPosition(retrieve) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(order, `${lessonId} retrieval follows taught content`).toBe(true);
    await expect(lesson.locator(".guided-practice [data-practice-id]")).toHaveCount(2);
    await expect(lesson.locator(".evidence-slip")).toHaveCount(1);
    const advancedIds = ADVANCED_BY_LESSON[lessonId as keyof typeof ADVANCED_BY_LESSON];
    await expect(lesson.locator("details.advanced-learning-block")).toHaveCount(advancedIds.length);
    for (const advancedId of advancedIds) {
      await expect(lesson.locator(`[data-advanced-block-id="${advancedId}"]`)).toHaveCount(1);
    }
    await expect(lesson.locator("details.advanced-learning:not(.advanced-learning-block)")).toHaveCount(0);
    await expect(lesson.locator("[data-media-checkpoint-id]")).toHaveCount(lessonId === "lesson-13" ? 2 : 1);
  }

  const lesson13 = await showRoute(page, "lesson-13");
  await expect(lesson13.locator(".learn-block")).toHaveCount(4);
  await expect(lesson13.locator(".learn-block .comparison-table")).toHaveCount(2);
  await expect(lesson13.locator('[data-figure-id="diabetes-urinalysis-evidence"]')).toBeVisible();
  await expect(lesson13.locator('[data-figure-id="adrenal-response-comparison"]')).toBeVisible();
  await expect(lesson13).toContainText("Not every tissue responds in the same way");
  await expect(lesson13).toContainText("does not identify a type of diabetes or provide a diagnosis");

  const lesson2 = await showRoute(page, "lesson-02");
  await expect(lesson2.locator('[data-figure-id="action-potential-voltage-graph"] svg')).toBeVisible();
  await expect(lesson2.locator('[data-figure-id="action-potential-voltage-graph"] table')).toBeVisible();
  await expect(lesson2.locator('[data-figure-id="action-potential-voltage-graph"]')).toContainText("Threshold");

  const lesson5 = await showRoute(page, "lesson-05");
  await expect(lesson5).toContainText("pons");
  await expect(lesson5).toContainText("medulla oblongata");
  await expect(lesson5).toContainText("Grey matter and white matter");

  const requiredDetails: Record<string, RegExp[]> = {
    "lesson-04": [/afferent/i, /efferent/i, /white matter/i, /grey matter/i],
    "lesson-06": [/sensation/i, /perception/i, /nociceptor/i, /proprioceptor/i],
    "lesson-07": [/sclera/i, /choroid/i, /fovea/i, /accommodation/i],
    "lesson-08": [/oval window/i, /organ of Corti/i, /vestibule/i, /Eustachian tube/i],
    "lesson-09": [/dynamic stability/i, /workable range/i, /receptor-bearing target cells/i],
    "lesson-10": [/anterior pituitary/i, /posterior pituitary/i, /hGH/i, /ACTH/i],
    "lesson-12": [/iodine/i, /thyroxine/i, /PTH/i, /calcitonin/i]
  };
  for (const [lessonId, patterns] of Object.entries(requiredDetails)) {
    const lesson = await showRoute(page, lessonId);
    const text = await lesson.innerText();
    for (const pattern of patterns) expect(text, `${lessonId} includes ${pattern}`).toMatch(pattern);
  }
});

test("chapter practice, Review Seminar, and Final Practice gate only their required work", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const candidateUrl = await openCandidate(page);
  await page.route(/youtube-nocookie\.com/, (route) => route.abort());

  const chapter12 = await showRoute(page, "chapter-12-practice");
  for (const item of await chapter12.locator('[data-practice-id][data-required="true"]').all()) {
    await item.locator("input").first().check();
    await item.locator("[data-check-practice]").click();
  }
  const chapterComplete = chapter12.locator('[data-complete-route="chapter-12-practice"]');
  await expect(chapterComplete).toBeEnabled();
  await chapterComplete.click();

  const seminar = await showRoute(page, "review-seminar");
  for (const sessionId of ["nervous", "sensory", "endocrine"]) {
    const responseId = `${PROJECT}:review-seminar:${sessionId}`;
    await seminar.locator(`[data-response-id="${responseId}"]`).fill(`Saved ${sessionId} mechanism explanation with evidence and one limitation.`);
    await seminar.locator(`[data-save-response="${responseId}"]`).click();
  }
  const seminarComplete = seminar.locator('[data-complete-route="review-seminar"]');
  await expect(seminarComplete).toBeEnabled();
  await seminarComplete.click();

  const finalPractice = await showRoute(page, "final-practice");
  await expect(finalPractice.locator('[data-practice-id][data-required="false"]')).toHaveCount(6);
  for (const item of await finalPractice.locator('[data-practice-id][data-required="true"]').all()) {
    await item.locator("input").first().check();
    await item.locator("[data-check-practice]").click();
  }
  const finalComplete = finalPractice.locator('[data-complete-route="final-practice"]');
  await expect(finalComplete).toBeEnabled();
  await finalComplete.click();
  await expect(page.locator("[data-progress-count]")).toHaveText("3 of 18 required routes");

  const state = await readStoredState(page);
  expect(state.completedRoutes).toEqual(["chapter-12-practice", "review-seminar", "final-practice"]);
  expect(Object.keys(state.practice).filter((id) => id.includes("final-practice-challenge"))).toHaveLength(0);

  await page.goto(`${candidateUrl}#final-practice`, { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-route-status="final-practice"]')).toHaveText("Complete");
  await expect(page.locator("[data-progress-count]")).toHaveText("3 of 18 required routes");
});

test("optional textbook reviews open exact pages, reveal only after an attempt, restore collapsed, and never complete a route", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const candidateUrl = await openCandidate(page);
  await page.route(/youtube-nocookie\.com/, (route) => route.abort());

  for (const review of TEXTBOOK_REVIEWS) {
    const route = await showRoute(page, review.routeId);
    const support = route.locator(`[data-textbook-review-route="${review.routeId}"]`);
    const control = support.locator(`[data-textbook-review-attempt="${review.attemptId}"]`);
    const guide = support.locator(`[data-textbook-review-answer="${review.attemptId}"]`);
    const complete = route.locator(`[data-complete-route="${review.routeId}"]`);

    await expect(support).toBeVisible();
    await expect(guide).toBeHidden();
    await expect(control).toHaveText("I attempted the textbook review");
    await expect(control).toHaveAttribute("aria-expanded", "false");
    await expect(complete).toBeDisabled();

    await support.locator(`[data-open-textbook="${review.documentId}"][data-printed-page="${review.printedPage}"][data-pdf-page="${review.physicalPage}"]`).click();
    await expect(page.locator("#textbook-library")).toBeVisible();
    const libraryPanel = page.locator(`[data-library-panel="${review.documentId}"]`);
    await expect(libraryPanel).toBeVisible();
    await expect(libraryPanel.locator("[data-library-location]")).toHaveText(`Open at printed p. ${review.printedPage} (PDF page ${review.physicalPage}).`);
    await expect(libraryPanel.locator("iframe")).toHaveAttribute("src", new RegExp(`${review.documentId}\\.pdf#page=${review.physicalPage}&zoom=page-width`));
    await expect(page.locator("#textbook-reader-heading")).toBeFocused();

    await showRoute(page, review.routeId);
    await support.getByRole("button", { name: review.jumpLabel }).click();
    await expect(route.locator(`#${review.jumpTargetId}`)).toBeFocused();

    await control.click();
    await expect(guide).toBeVisible();
    await expect(control).toHaveText("Hide answer guide");
    await expect(control).toHaveAttribute("aria-expanded", "true");
    await expect(guide.locator(".textbook-review-answer-list > li")).toHaveCount(review.answerCount);
    await expect(guide.getByRole("heading", { name: "Check your work" })).toBeFocused();
    await expect(complete).toBeDisabled();

    await guide.getByRole("button", { name: "Hide answer guide" }).click();
    await expect(guide).toBeHidden();
    await expect(control).toBeFocused();
    await expect(control).toHaveText("Show answer guide");

    await page.goto(`${candidateUrl}#${review.routeId}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator(`[data-textbook-review-answer="${review.attemptId}"]`)).toBeHidden();
    await expect(page.locator(`[data-textbook-review-attempt="${review.attemptId}"]`)).toHaveText("Show answer guide");
    await expect(page.locator(`[data-complete-route="${review.routeId}"]`)).toBeDisabled();
  }

  const unknownAttemptId = `${PROJECT}:textbook:unknown-review:attempt`;
  await page.evaluate(({ key, unknownId }) => {
    const raw = JSON.parse(localStorage.getItem(key) || "{}");
    raw.textbookReviewAttempts = [...(raw.textbookReviewAttempts || []), unknownId];
    localStorage.setItem(key, JSON.stringify(raw));
  }, { key: STORAGE_KEY, unknownId: unknownAttemptId });
  await page.reload({ waitUntil: "domcontentloaded" });

  const state = await readStoredState(page);
  expect(state.version).toBe(6);
  expect(state.textbookReviewAttempts).toEqual(TEXTBOOK_REVIEWS.map((review) => review.attemptId));
  expect(state.textbookReviewAttempts).not.toContain(unknownAttemptId);
  expect(state.completedRoutes).toEqual([]);
  await expect(page.locator("[data-progress-count]")).toHaveText("0 of 18 required routes");
});

test("all three investigations autosave partial work, restore, and remain non-gating", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const candidateUrl = await openCandidate(page);
  await page.route(/youtube-nocookie\.com/, (route) => route.abort());
  const collection = await showRoute(page, "process-collection");

  const investigations = [
    ["reflex-response", "pattern", "Most supplied values cluster near 20 cm."],
    ["sensory-receptors", "plan", "Change body location, measure spacing, and keep pressure steady."],
    ["endocrine-data", "analysis", "Sample A combines higher ADH with concentrated urine."],
  ] as const;
  for (const [investigation, field, value] of investigations) {
    const root = collection.locator(`[data-investigation="${investigation}"]`);
    await root.evaluate((node) => ((node as HTMLDetailsElement).open = true));
    await root.locator(`[data-response-id="${PROJECT}:investigation:${investigation}:${field}"]`).fill(value);
    await root.locator(`[data-save-investigation="${PROJECT}:investigation:${investigation}"]`).click();
    await expect(root.locator(`[data-investigation-status="${PROJECT}:investigation:${investigation}"]`)).toHaveText("Saved on this device");
  }
  await expect(page.locator("[data-progress-count]")).toHaveText("0 of 18 required routes");

  await page.goto(`${candidateUrl}#process-collection`, { waitUntil: "domcontentloaded" });
  await expect(page.locator(`[data-response-id="${PROJECT}:investigation:reflex-response:pattern"]`)).toHaveValue(investigations[0][2]);
  await expect(page.locator('[data-process-work-id="investigation-reflex-response"]')).toContainText(investigations[0][2]);
  await expect(page.locator('[data-process-work-id="investigation-sensory-receptors"]')).toContainText(investigations[1][2]);
  await expect(page.locator('[data-process-work-id="investigation-endocrine-data"]')).toContainText(investigations[2][2]);
  const state = await readStoredState(page);
  expect(state.investigations).toHaveLength(3);
  expect(state.completedRoutes).toEqual([]);
});

test("guided feedback opens the exact local textbook page and the model link opens the exact model", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  await page.route(/youtube-nocookie\.com/, (route) => route.abort());

  await showRoute(page, "lesson-01");
  const practice = await submitPractice(page, '[data-practice-id="biology30-unit-a-pilot-2:practice:lesson-01-guided-1"]', "b");
  await practice.getByRole("button", { name: "Find this idea in the textbook on p. 369" }).click();
  await expect(page.locator("#textbook-library")).toBeVisible();
  const chapter = page.locator('[data-library-panel="chapter-11"]');
  await expect(chapter).toBeVisible();
  await expect(chapter.locator("[data-library-location]")).toHaveText("Open at printed p. 369 (PDF page 10).");
  await expect(chapter.locator("iframe")).toHaveAttribute("src", /chapter-11\.pdf#page=10&zoom=page-width/);
  await expect(page.locator("#textbook-reader-heading")).toBeFocused();

  await showRoute(page, "lesson-03");
  await page.getByRole("button", { name: "Explore the synapse model", exact: true }).click();
  await expect(page.locator("#model-lab")).toBeVisible();
  const synapse = page.locator('[data-model-panel="synapse"]');
  await expect(synapse).toBeVisible();
  await expect(synapse).toBeFocused();
  await synapse.getByRole("button", { name: "Block cholinesterase" }).click();
  await expect(synapse.locator("[data-model-output]")).toContainText("No result yet");
  await synapse.locator("[data-model-prediction]").fill("Acetylcholine should remain in the cleft longer and extend the response.");
  await synapse.locator("[data-test-model]").click();
  await expect(synapse.locator("[data-model-output]")).toContainText("Acetylcholine acts for longer");
});

test("all lesson models use a clear Predict, Test, Explain, and Save cycle", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const candidateUrl = await openCandidate(page);
  await page.route(/youtube-nocookie\.com/, (route) => route.abort());
  await showRoute(page, "lesson-12");
  await page.locator('#lesson-12 .lesson-model-link [data-open-model="thyroid-calcium"]').click();

  await expect(page.locator("#model-lab [data-model-panel]")).toHaveCount(13);
  const panel = page.locator('[data-model-panel="thyroid-calcium"]');
  await expect(panel).toBeVisible();
  await expect(panel).toBeFocused();
  await expect(panel.locator(".model-path li")).toHaveCount(4);
  await expect(panel.locator("[data-model-choice]")).toHaveCount(3);
  await expect(panel.locator(".model-orientation")).toContainText("Investigation question");
  await expect(panel.locator(".model-plan")).toContainText("What you change");
  await expect(panel.locator(".model-plan")).toContainText("What stays the same");
  await expect(panel.locator(".model-plan")).toContainText("Evidence to examine");
  await panel.locator('[data-model-choice="low-calcium"]').click();
  await expect(panel.locator("[data-model-output]")).toContainText("No result yet");
  await expect(panel.locator("[data-test-model]")).toBeDisabled();
  await panel.locator("[data-model-prediction]").fill("PTH should rise and increase calcium movement into the blood.");
  await expect(panel.locator("[data-test-model]")).toBeEnabled();
  await panel.locator("[data-test-model]").click();
  await expect(panel.locator("[data-model-output]")).toContainText("PTH responds in the expected direction");
  const collect = panel.locator('[data-collect-model="thyroid-calcium"]');
  await expect(collect).toBeDisabled();
  await panel.locator("[data-model-explanation]").fill("Low blood calcium is the disturbance. Higher PTH acts on target organs in a direction that raises blood calcium.");
  await expect(collect).toBeEnabled();
  await collect.click();
  await expect(collect).toHaveText("Remove saved investigation from Process Collection");
  await expect(page.locator("[data-model-progress]")).toHaveText("1 of 13");
  await expect(page.locator("[data-progress-count]")).toHaveText("0 of 18 required routes");

  await showRoute(page, "process-collection");
  const saved = page.locator('[data-process-work-id="model-thyroid-calcium"]');
  await expect(saved).toHaveCount(1);
  await expect(saved).toContainText("Thyroid and calcium feedback");
  await expect(saved).toContainText("PTH should rise");
  await expect(saved).toContainText("Low blood calcium is the disturbance");
  await expect(saved).toContainText("PTH is high, but blood calcium remains low");
  await expect(saved.locator(".process-work-status")).toHaveText("Collected");

  await page.goto(`${candidateUrl}#process-collection`, { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-process-work-id="model-thyroid-calcium"]')).toHaveCount(1);
  await page.locator('[data-process-work-id="model-thyroid-calcium"] [data-process-return]').click();
  await expect(panel).toBeVisible();
  await expect(page.locator("#work-focus-model-thyroid-calcium")).toBeFocused();
  await expect(panel.locator('[data-model-choice="low-calcium"]')).toHaveAttribute("aria-pressed", "true");
  await expect(panel.locator("[data-model-prediction]")).toHaveValue(/PTH should rise/);
  await expect(panel.locator("[data-model-explanation]")).toHaveValue(/Low blood calcium/);
  await expect(panel.locator("[data-model-output]")).toContainText("PTH responds in the expected direction");
  await panel.locator('[data-collect-model="thyroid-calcium"]').click();
  await showRoute(page, "process-collection");
  await expect(page.locator('[data-process-work-id="model-thyroid-calcium"]')).toHaveCount(1);
  await expect(page.locator('[data-process-work-id="model-thyroid-calcium"] .process-work-status')).toHaveText("Attempted");
  const state = await readStoredState(page);
  expect(state.version).toBe(6);
  expect(state.encoding).toBe("hashed-v1");
  expect(state.models.results["thyroid-calcium"]).toBeTruthy();
  expect(state.models.predictions["thyroid-calcium"]).toContain("PTH should rise");
  expect(state.models.explanations["thyroid-calcium"]).toContain("Low blood calcium");
  expect(state.models.collectedIds).toEqual([]);
  expect(state.completedRoutes).toEqual([]);
});

test("Models and Data Lab restores graphs, pathways, authored equivalents, and scoped reset", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  await page.route(/youtube-nocookie\.com/, (route) => route.abort());
  await showRoute(page, "model-lab");

  await page.locator('[data-model-select="action-potential"]').click();
  const action = page.locator('[data-model-panel="action-potential"]');
  await expect(action.locator("[data-model-choice]")).toHaveCount(7);
  await action.locator('[data-model-choice="sodium-opens"]').click();
  await action.locator("[data-model-prediction]").fill("Voltage should rise as sodium ions enter the axon.");
  await action.locator("[data-test-model]").click();
  await expect(action.locator("[data-model-output] .model-graph svg")).toBeVisible();
  await expect(action.locator("[data-model-output] .model-data-table tbody tr")).toHaveCount(7);
  await expect(action.locator("[data-model-output]")).toContainText("The membrane depolarizes");
  await expect(action.locator("[data-model-step]").nth(1)).toHaveClass(/is-active/);
  await action.locator('[data-model-choice="potassium-stays-open"]').click();
  await action.locator("[data-model-prediction]").fill("Voltage should briefly fall below resting potential while potassium channels remain open.");
  await action.locator("[data-test-model]").click();
  await expect(action.locator("[data-model-output]")).toContainText("briefly more negative");

  const staticEquivalent = action.locator("details.model-static-equivalent");
  await staticEquivalent.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(staticEquivalent).toHaveAttribute("open", "");
  await expect(staticEquivalent.locator(".model-data-table")).toHaveCount(7);

  await page.locator('[data-model-select="glucose"]').click();
  const glucose = page.locator('[data-model-panel="glucose"]');
  await expect(glucose.locator("[data-model-choice]")).toHaveCount(6);
  await glucose.locator('[data-model-choice="low-insulin"]').click();
  await glucose.locator("[data-model-prediction]").fill("Blood glucose should remain elevated after the meal when insulin is low.");
  await glucose.locator("[data-test-model]").click();
  await expect(glucose.locator("[data-model-output] .model-graph")).toBeVisible();
  await expect(glucose.locator("[data-model-output] .model-data-table")).toContainText("12.1");
  await glucose.locator("[data-model-explanation]").fill("The curve stays high because reduced insulin signalling limits glucose uptake and storage after the meal.");
  await glucose.locator('[data-collect-model="glucose"]').click();
  await expect(page.locator("[data-model-progress]")).toHaveText("1 of 13");

  await glucose.locator('[data-reset-model="glucose"]').click();
  await expect(glucose.locator("[data-model-output]")).toContainText("No result yet");
  await expect(glucose.locator("[data-model-choice][aria-pressed=true]")).toHaveCount(0);
  await expect(glucose.locator('[data-collect-model="glucose"]')).toBeDisabled();
  await expect(glucose.locator('[data-reset-model="glucose"]')).toBeDisabled();
  await expect(page.locator("[data-model-progress]")).toHaveText("0 of 13");

  await glucose.locator('[data-model-choice="rapid-stress"]').click();
  await glucose.locator("[data-model-prediction]").fill("A rapid response should involve the adrenal medulla and epinephrine.");
  await glucose.locator("[data-test-model]").click();
  await expect(glucose.locator("[data-model-output] .model-result-flow li")).toHaveCount(4);
  await expect(glucose.locator("[data-model-output]")).toContainText("adrenal medulla");
  const state = await readStoredState(page);
  expect(state.models.results["action-potential"]).toBe("potassium-stays-open");
  expect(state.models.results.glucose).toBe("rapid-stress");
  expect(state.models.collectedIds).toEqual([]);
  expect(state.completedRoutes).toEqual([]);
});

test("lesson evidence and practice restore after reload and populate Process Collection without changing unrelated progress", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  await page.route(/youtube-nocookie\.com/, (route) => route.abort());
  await showRoute(page, "lesson-01");

  await submitPractice(page, '[data-practice-id="biology30-unit-a-pilot-2:practice:lesson-01-guided-1"]', "b");
  await submitPractice(page, '[data-practice-id="biology30-unit-a-pilot-2:practice:lesson-01-guided-2"]', "c");
  await completeMediaCheckpoint(page, "#lesson-01 [data-media-checkpoint-id]", "local");
  const evidence = page.locator('[data-response-id="biology30-unit-a-pilot-2:lesson-01:evidence-slip"]');
  await evidence.fill("Myelin limits current loss and allows the signal to be regenerated mainly at nodes, increasing speed rather than size.");
  await page.locator('[data-save-response="biology30-unit-a-pilot-2:lesson-01:evidence-slip"]').click();
  const complete = page.locator('[data-complete-route="lesson-01"]');
  await expect(complete).toBeEnabled();
  await complete.click();
  await expect(page.locator("[data-progress-count]")).toHaveText("1 of 18 required routes");

  await showRoute(page, "process-collection");
  const savedEvidence = page.locator('[data-process-work-id="evidence-lesson-01"]');
  await expect(savedEvidence).toContainText("Myelin limits current loss");
  await expect(savedEvidence.locator(".process-work-status")).toHaveText("Collected");
  await expect(page.locator('[data-process-work-id="practice-lesson-01-guided-1"]')).toHaveCount(1);
  await expect(page.locator('[data-process-work-id="practice-lesson-01-guided-2"]')).toHaveCount(1);
  await expect(page.locator('[data-process-work-id="media-a44brrgg4ys"]')).toHaveCount(1);

  await page.reload({ waitUntil: "domcontentloaded" });
  await showRoute(page, "process-collection");
  await expect(page.locator("#process-collection")).toBeVisible();
  await expect(page.locator('[data-process-work-id="evidence-lesson-01"]')).toContainText("Myelin limits current loss");
  await expect(page.locator("[data-progress-count]")).toHaveText("1 of 18 required routes");
  const state = await readStoredState(page);
  expect(state.completedRoutes).toEqual(["lesson-01"]);
  expect(state.investigations).toEqual([]);
});

test("All My Work derives every activity type, filters the view, copies the complete index, and returns to the exact task", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  const responses = {
    [`${PROJECT}:lesson-01:retrieval`]: "An axon carries the signal, while myelin reduces current loss between nodes.",
    [`${PROJECT}:lesson-01:evidence-slip`]: "Myelin changes conduction speed, not action-potential size.",
    [`${PROJECT}:core-vocabulary:reflex-arc:definition`]: "A rapid neural pathway from a receptor to an effector.",
    [`${PROJECT}:core-vocabulary:reflex-arc:characteristics`]: "It includes sensory input, central integration, and motor output.",
    [`${PROJECT}:core-vocabulary:reflex-arc:example`]: "A withdrawal response after touching a hot surface.",
    [`${PROJECT}:core-vocabulary:reflex-arc:non-example`]: "A slower hormone response through the blood.",
    [`${PROJECT}:investigation:reflex-response:pattern`]: "Most response distances cluster near 20 cm.",
    [`${PROJECT}:review-seminar:nervous`]: "The evidence points to slower conduction because myelin is disrupted.",
    [`${PROJECT}:process-collection:note`]: "Compare fast neural signals with slower hormone signals."
  };
  const fixture = {
    version: 6,
    route: "process-collection",
    responses,
    practice: {
      [`${PROJECT}:practice:final-practice-challenge-01`]: { choice: "a", submitted: true, correct: true }
    },
    completedRoutes: [],
    visitedLessons: ["lesson-01"],
    investigations: [`${PROJECT}:investigation:reflex-response`],
    evidenceIds: [`${PROJECT}:lesson-01:evidence-slip`],
    vocabulary: { activeId: "reflex-arc", choiceIds: [], collectedIds: ["reflex-arc"] },
    media: {
      paths: { [`${PROJECT}:media:A44brRGG4Ys:checkpoint`]: "local" },
      checkpoints: { [`${PROJECT}:media:A44brRGG4Ys:checkpoint`]: { choice: "b", submitted: true, correct: true } },
      needsCheckRoutes: []
    },
    models: {
      activeId: "myelin",
      results: { myelin: "myelinated" },
      predictions: { myelin: "A myelinated axon should conduct the signal faster." },
      predictionChoices: {},
      explanations: { myelin: "Current travels farther before the signal is regenerated at a node." },
      explanationChoices: {},
      collectedIds: ["myelin"]
    },
    textbookReviewAttempts: [`${PROJECT}:textbook:chapter-11-review:attempt`],
    advanced: { completedIds: [] }
  };
  await page.addInitScript(({ key, value }) => {
    const fixtureFlag = "pilot-2-process-index-all-types-fixture";
    if (sessionStorage.getItem(fixtureFlag) === "applied") return;
    localStorage.setItem(key, JSON.stringify(value));
    sessionStorage.setItem(fixtureFlag, "applied");
  }, { key: STORAGE_KEY, value: fixture });
  await page.reload({ waitUntil: "domcontentloaded" });
  await showRoute(page, "process-collection");

  const index = page.locator("[data-all-work-list]");
  await expect(index.locator("[data-process-index-item]")).toHaveCount(10);
  for (const kind of ["retrieval", "evidence-slip", "practice", "media-checkpoint", "frayer", "model", "investigation", "review-seminar", "textbook-review", "process-note"]) {
    await expect(index.locator(`[data-process-kind="${kind}"]`)).toHaveCount(1);
  }
  await expect(page.locator('[data-process-work-id="textbook-chapter-11-practice"]')).toContainText("Self-reported textbook review attempt confirmed");
  await expect(page.locator('[data-process-work-id="practice-final-practice-challenge-01"]')).toContainText("Selected answer");
  await expect(page.locator('[data-process-work-id="practice-final-practice-challenge-01"]')).toContainText("Course feedback or comparison");

  await page.locator("[data-collection-type-filter]").selectOption("practice");
  await expect(page.locator("[data-process-index-item]:visible")).toHaveCount(1);
  await expect(page.locator("[data-all-work-count]")).toHaveText("1 shown · 10 total");
  await page.locator("[data-collection-chapter-filter]").selectOption("chapter-11");
  await expect(page.locator("[data-process-index-item]:visible")).toHaveCount(0);
  await expect(page.locator("[data-filter-empty]")).toBeVisible();
  await page.locator("[data-collection-chapter-filter]").selectOption("unit-review");
  await expect(page.locator("[data-process-index-item]:visible")).toHaveCount(1);

  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: (value: string) => { (window as any).__copiedCollection = value; return Promise.resolve(); } }
    });
    (window as any).__printCalled = false;
    window.print = () => { (window as any).__printCalled = true; };
  });
  await page.locator("[data-copy-collection]").click();
  await expect.poll(() => page.evaluate(() => (window as any).__copiedCollection || "")).toContain("Compare fast neural signals with slower hormone signals");
  const copied = await page.evaluate(() => (window as any).__copiedCollection as string);
  expect(copied).toContain("Self-reported textbook review attempt confirmed");
  expect(copied).toContain("Most response distances cluster near 20 cm");
  expect(copied).toContain("Final Practice · Practice response");
  await page.locator("[data-print-collection]").click();
  await expect.poll(() => page.evaluate(() => Boolean((window as any).__printCalled))).toBe(true);

  await page.locator('[data-process-work-id="practice-final-practice-challenge-01"] [data-process-return]').click();
  await expect(page).toHaveURL(/#final-practice\/work\/practice-final-practice-challenge-01$/);
  await expect(page.locator("#final-practice")).toBeVisible();
  await expect(page.locator("details.final-challenge")).toHaveAttribute("open", "");
  await expect(page.locator("#work-focus-practice-final-practice-challenge-01")).toBeFocused();
  const state = await readStoredState(page);
  expect(state.version).toBe(6);
  expect(state.completedRoutes).toEqual([]);
  expect(state.advanced.completedIds).toEqual([]);
});

test("save reporting distinguishes course, local, degraded, and failed persistence", async ({ page, context }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const candidateUrl = await openCandidate(page);
  const scenarios = [
    { name: "course", api: "saved", localFails: false, expected: "Saved to course" },
    { name: "local", api: "unavailable", localFails: false, expected: "Saved on this device" },
    { name: "degraded", api: "failed", localFails: false, expected: "Saved on this device only" },
    { name: "failed", api: "failed", localFails: true, expected: "Not saved—copy your work before leaving" }
  ] as const;

  for (const scenario of scenarios) {
    const scenarioPage = await context.newPage();
    await scenarioPage.addInitScript(({ apiMode, shouldFailLocal }) => {
      localStorage.clear();
      sessionStorage.clear();
      if (shouldFailLocal) {
        Storage.prototype.setItem = function () { throw new Error("Simulated local storage failure"); };
      }
      if (apiMode !== "unavailable") {
        const succeeds = apiMode === "saved";
        (window as any).API_1484_11 = {
          Initialize: () => "true",
          GetValue: () => "",
          SetValue: () => succeeds ? "true" : "false",
          Commit: () => succeeds ? "true" : "false",
          Terminate: () => "true"
        };
      }
    }, { apiMode: scenario.api, shouldFailLocal: scenario.localFails });
    await scenarioPage.goto(`${candidateUrl}#process-collection`, { waitUntil: "domcontentloaded" });
    const noteId = `${PROJECT}:process-collection:note`;
    await scenarioPage.locator(`[data-response-id="${noteId}"]`).fill(`Persistence scenario: ${scenario.name}`);
    await scenarioPage.locator(`[data-save-response="${noteId}"]`).click();
    await expect(scenarioPage.locator(`[data-save-status="${noteId}"]`)).toHaveText(scenario.expected);
    await scenarioPage.close();
  }
});

test("Core Vocabulary unlocks only visited lessons and a Frayer model restores in Process Collection", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const candidateUrl = await openCandidate(page);
  await page.route(/youtube-nocookie\.com/, (route) => route.abort());
  await showRoute(page, "lesson-01");
  await showRoute(page, "lesson-13");
  await showRoute(page, "core-vocabulary");

  const neuron = page.locator('[data-vocabulary-target="neuron-structure"]');
  const reflex = page.locator('[data-vocabulary-target="reflex-arc"]');
  const action = page.locator('[data-vocabulary-target="action-potential"]');
  const glucose = page.locator('[data-vocabulary-target="blood-glucose-regulation"]');
  const regulated = page.locator('[data-vocabulary-target="regulated-variable-set-point"]');
  await expect(neuron).toBeEnabled();
  await expect(reflex).toBeEnabled();
  await expect(glucose).toBeEnabled();
  await expect(action).toBeHidden();
  await expect(regulated).toBeHidden();
  await page.locator("[data-vocabulary-filter]").selectOption("all");
  await expect(action).toBeVisible();
  await expect(action).toBeEnabled();
  await expect(action.locator("[data-term-state]")).toHaveText("Lesson 2");

  await regulated.click();
  const lockedPanel = page.locator('[data-vocabulary-entry="regulated-variable-set-point"]');
  await expect(lockedPanel).toBeVisible();
  await expect(lockedPanel.locator("[data-vocabulary-locked]")).toBeVisible();
  await expect(lockedPanel.locator("[data-vocabulary-content]")).toBeHidden();
  await expect(lockedPanel.locator("[data-vocabulary-locked]")).toContainText("You will learn this concept in Lesson 9");
  await lockedPanel.locator('[data-vocabulary-unlock-link="lesson-09"]').click();
  await expect(page.locator("#lesson-09")).toBeVisible();
  await showRoute(page, "core-vocabulary");
  await page.locator("[data-vocabulary-filter]").selectOption("all");
  await expect(lockedPanel.locator("[data-vocabulary-content]")).toBeVisible();
  await expect(lockedPanel.locator("[data-vocabulary-locked]")).toBeHidden();

  await reflex.click();
  const panel = page.locator('[data-vocabulary-entry="reflex-arc"]');
  await expect(panel).toBeVisible();
  const values = {
    definition: "A rapid response pathway through sensory input, a CNS connection, and motor output.",
    characteristics: "A receptor detects change, sensory information enters the CNS, and an effector responds.",
    example: "Touching a hot surface activates a withdrawal response before full conscious awareness.",
    "non-example": "A hormone travelling through the blood for a slower response."
  };
  for (const [field, value] of Object.entries(values)) {
    await panel.locator(`[data-frayer-field="${field}"]`).fill(value);
  }
  const collect = panel.locator('[data-collect-frayer="reflex-arc"]');
  await expect(collect).toBeEnabled();
  await collect.click();
  await expect(page.locator("[data-vocabulary-progress]")).toHaveText("1 of 8");
  await panel.locator('[data-reveal-frayer="reflex-arc"]').click();
  await expect(panel.locator('[data-course-model="reflex-arc"]')).toBeVisible();

  await showRoute(page, "process-collection");
  const savedFrayer = page.locator('[data-process-work-id="frayer-reflex-arc"]');
  await expect(savedFrayer).toContainText("Reflex arc");
  await expect(savedFrayer).toContainText(values.definition);
  await expect(savedFrayer.locator(".process-work-status")).toHaveText("Collected");
  await expect(page.locator("[data-progress-count]")).toHaveText("0 of 18 required routes");

  await page.goto(`${candidateUrl}#process-collection`, { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-process-work-id="frayer-reflex-arc"]')).toContainText("Reflex arc");
  await page.locator('[data-process-work-id="frayer-reflex-arc"] [data-process-return]').click();
  await expect(page.locator('[data-vocabulary-entry="reflex-arc"]')).toBeVisible();
  await expect(page.locator('#work-focus-frayer-reflex-arc')).toBeFocused();
  await expect(page.locator('[data-vocabulary-entry="reflex-arc"] [data-frayer-field="definition"]')).toHaveValue(values.definition);
});

test("Advanced Learning checklist deep-links, synchronizes, persists, and never changes required progress", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  await page.route(/youtube-nocookie\.com/, (route) => route.abort());

  const index = await showRoute(page, "advanced-learning");
  await expect(index.locator("[data-advanced-index-item]")).toHaveCount(40);
  await expect(index.locator("[data-advanced-index-item]:not([data-advanced-planned])")).toHaveCount(40);
  await expect(index.locator("[data-advanced-planned]")).toHaveCount(0);
  await expect(index.locator("[data-advanced-progress]")).toHaveText("0 of 40");
  await expect(page.locator("[data-progress-count]")).toHaveText("0 of 18 required routes");

  const indexItem = index.locator('[data-advanced-index-item="l04-b01"]');
  await indexItem.locator('[data-advanced-complete="l04-b01"]').check();
  await expect(index.locator("[data-advanced-progress]")).toHaveText("1 of 40");
  await expect(page.locator("[data-progress-count]")).toHaveText("0 of 18 required routes");

  await indexItem.locator('[data-advanced-link="l04-b01"]').click();
  await expect(page).toHaveURL(/#lesson-04\/advanced\/l04-b01$/);
  const block = page.locator('[data-advanced-block-id="l04-b01"]');
  await expect(page.locator("#lesson-04")).toBeVisible();
  await expect(block).toHaveAttribute("open", "");
  await expect(block.locator("h3")).toBeFocused();
  await expect(block.locator('[data-advanced-complete="l04-b01"]')).toBeChecked();

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-advanced-block-id="l04-b01"]')).toHaveAttribute("open", "");
  await expect(page.locator('[data-advanced-block-id="l04-b01"] [data-advanced-complete="l04-b01"]')).toBeChecked();
  let state = await readStoredState(page);
  expect(state.version).toBe(6);
  expect(state.advanced.completedIds).toEqual(["l04-b01"]);
  expect(state.advanced.c).toHaveLength(10);
  expect(state.completedRoutes).toEqual([]);

  await showRoute(page, "advanced-learning");
  for (const [lessonId, blockId] of [["lesson-07", "l07-b01"], ["lesson-12", "l12-b01"]] as const) {
    await page.locator(`[data-advanced-link="${blockId}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#${lessonId}/advanced/${blockId}$`));
    await expect(page.locator(`[data-advanced-block-id="${blockId}"]`)).toHaveAttribute("open", "");
    await expect(page.locator(`[data-advanced-block-id="${blockId}"] h3`)).toBeFocused();
    await showRoute(page, "advanced-learning");
  }
  await page.locator('[data-advanced-index-item="l04-b01"] [data-advanced-complete="l04-b01"]').uncheck();
  await expect(page.locator("[data-advanced-progress]")).toHaveText("0 of 40");
  await expect(page.locator('[data-advanced-block-id="l04-b01"] [data-advanced-complete="l04-b01"]')).not.toBeChecked();
  await expect(page.locator("[data-progress-count]")).toHaveText("0 of 18 required routes");

  await page.evaluate((key) => {
    const raw = JSON.parse(localStorage.getItem(key) || "{}");
    raw.version = 6;
    raw.advanced = { c: "10000000000" };
    localStorage.setItem(key, JSON.stringify(raw));
  }, STORAGE_KEY);
  await page.reload({ waitUntil: "domcontentloaded" });
  await showRoute(page, "advanced-learning");
  state = await readStoredState(page);
  expect(state.advanced.c).toBe("0000000000");
  expect(state.advanced.completedIds).toEqual([]);
  await expect(page.locator("[data-advanced-progress]")).toHaveText("0 of 40");
});

test("required media supports video and local paths, never autoplays, and records the shared checkpoint", async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  await page.route(/youtube-nocookie\.com/, (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Video fixture</title>" }));
  await showRoute(page, "lesson-11");
  const companion = page.locator("#lesson-11 .video-companion");
  await expect(companion.locator("iframe")).toHaveCount(1);
  await expect(companion.locator("iframe")).toHaveAttribute("src", /youtube-nocookie\.com\/embed\/BYaR-JgbjCs/);
  await expect(companion.locator("iframe")).not.toHaveAttribute("src", /autoplay=1/);
  await expect(companion.locator("button", { hasText: /play/i })).toHaveCount(0);
  const videoCheckpoint = await completeMediaCheckpoint(page, "#lesson-11 [data-media-checkpoint-id]", "video");

  await page.unroute(/youtube-nocookie\.com/);
  await page.route(/youtube-nocookie\.com/, (route) => route.abort());
  await showRoute(page, "lesson-13");
  const stress = page.locator('#lesson-13 [data-video-entry="v-t1Z5-oPtU"]');
  await expect(stress.locator("[data-local-equivalent]")).toHaveAttribute("open", "", { timeout: 8_000 });
  await expect(stress.locator(".concept-summary")).toBeVisible();
  const localCheckpoint = await completeMediaCheckpoint(page, '#lesson-13 [data-video-entry="v-t1Z5-oPtU"]', "local");

  const state = await readStoredState(page);
  expect(state.version).toBe(6);
  expect(state.encoding).toBe("hashed-v1");
  expect(state.media.paths[videoCheckpoint]).toBe("video");
  expect(state.media.paths[localCheckpoint]).toBe("local");
  expect(state.media.checkpoints[videoCheckpoint].submitted).toBe(true);
  expect(state.media.checkpoints[localCheckpoint].submitted).toBe(true);

  await showRoute(page, "lesson-11");
  await companion.getByRole("button", { name: "Open this video in the Video Library" }).click();
  await expect(page.locator("#video-library")).toBeVisible();
  await expect(page.locator('[data-video-panel="BYaR-JgbjCs"]')).toBeVisible();
  await expect(page.locator("[data-video-panel]:visible")).toHaveCount(1);
  await expect(page.locator('[data-video-select="BYaR-JgbjCs"]')).toHaveAttribute("aria-pressed", "true");
});

test("version-1 state migrates without deleting work and completed lessons become Needs media check", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  const evidenceId = `${PROJECT}:lesson-02:evidence-slip`;
  const oldState = {
    version: 1,
    route: "lesson-02",
    responses: { [evidenceId]: "A preserved explanation about firing frequency." },
    practice: {},
    completedRoutes: ["lesson-02"],
    visitedLessons: ["lesson-02"],
    investigations: [],
    evidenceIds: [evidenceId],
    vocabulary: { activeId: "action-potential", choiceIds: [], collectedIds: [] }
  };
  await page.addInitScript(({ key, value }) => {
    const fixtureFlag = "pilot-2-v1-migration-fixture";
    if (sessionStorage.getItem(fixtureFlag) === "applied") return;
    localStorage.setItem(key, JSON.stringify(value));
    sessionStorage.setItem(fixtureFlag, "applied");
  }, { key: STORAGE_KEY, value: oldState });
  await page.reload({ waitUntil: "domcontentloaded" });
  await showRoute(page, "lesson-02");
  await expect(page.locator(`[data-response-id="${evidenceId}"]`)).toHaveValue(oldState.responses[evidenceId]);
  await expect(page.locator('[data-route-status="lesson-02"]')).toHaveText("Needs media check");
  await expect(page.locator("[data-progress-count]")).toHaveText("0 of 18 required routes");
  const migrated = await readStoredState(page);
  expect(migrated.version).toBe(6);
  expect(migrated.encoding).toBe("hashed-v1");
  expect(migrated.responses[evidenceId]).toBe(oldState.responses[evidenceId]);
  expect(migrated.completedRoutes).not.toContain("lesson-02");
  expect(migrated.media.needsCheckRoutes).toContain("lesson-02");
  expect(migrated.models.results).toEqual({});
  expect(migrated.models.predictions).toEqual({});
  expect(migrated.models.explanations).toEqual({});
  expect(migrated.models.collectedIds).toEqual([]);
});

test("version-2 state gains empty model state without losing current learner work", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  const evidenceId = `${PROJECT}:lesson-05:evidence-slip`;
  const version2State = {
    version: 2,
    route: "lesson-05",
    responses: { [evidenceId]: "A preserved brain-evidence explanation." },
    practice: {},
    completedRoutes: [],
    visitedLessons: ["lesson-05"],
    investigations: [],
    evidenceIds: [evidenceId],
    vocabulary: { activeId: "scientific-explanation", choiceIds: [], collectedIds: [] },
    media: { paths: {}, checkpoints: {}, needsCheckRoutes: [] }
  };
  await page.addInitScript(({ key, value }) => {
    const fixtureFlag = "pilot-2-v2-model-migration-fixture";
    if (sessionStorage.getItem(fixtureFlag) === "applied") return;
    localStorage.setItem(key, JSON.stringify(value));
    sessionStorage.setItem(fixtureFlag, "applied");
  }, { key: STORAGE_KEY, value: version2State });
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator(`[data-response-id="${evidenceId}"]`)).toHaveValue(version2State.responses[evidenceId]);
  const migrated = await readStoredState(page);
  expect(migrated.version).toBe(6);
  expect(migrated.encoding).toBe("hashed-v1");
  expect(migrated.responses[evidenceId]).toBe(version2State.responses[evidenceId]);
  expect(migrated.models.activeId).toBe("myelin");
  expect(migrated.models.results).toEqual({});
  expect(migrated.models.predictions).toEqual({});
  expect(migrated.models.explanations).toEqual({});
  expect(migrated.models.collectedIds).toEqual([]);
});

test("version-3 model evidence migrates without loss and invites the new reasoning fields", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  const version3State = {
    version: 3,
    route: "model-lab",
    responses: {},
    practice: {},
    completedRoutes: [],
    visitedLessons: ["lesson-01"],
    investigations: [],
    evidenceIds: [],
    vocabulary: { activeId: "homeostasis", choiceIds: [], collectedIds: [] },
    media: { paths: {}, checkpoints: {}, needsCheckRoutes: [] },
    models: { activeId: "myelin", results: { myelin: "myelinated" }, collectedIds: ["myelin"] }
  };
  await page.addInitScript(({ key, value }) => {
    const fixtureFlag = "pilot-2-v3-model-migration-fixture";
    if (sessionStorage.getItem(fixtureFlag) === "applied") return;
    localStorage.setItem(key, JSON.stringify(value));
    sessionStorage.setItem(fixtureFlag, "applied");
  }, { key: STORAGE_KEY, value: version3State });
  await page.reload({ waitUntil: "domcontentloaded" });
  await showRoute(page, "model-lab");
  const model = page.locator('[data-model-panel="myelin"]');
  await expect(model.locator('[data-model-choice="myelinated"]')).toHaveAttribute("aria-pressed", "true");
  await expect(model.locator("[data-model-output]")).toContainText("Regeneration is concentrated at nodes");
  await expect(model.locator("[data-model-save-status]")).toContainText("Earlier result saved");
  await showRoute(page, "process-collection");
  await expect(page.locator('[data-process-work-id="model-myelin"]')).toContainText(/myelinated axon/i);
  await expect(page.locator('[data-process-work-id="model-myelin"] .process-work-status')).toHaveText("Collected");
  const migrated = await readStoredState(page);
  expect(migrated.version).toBe(6);
  expect(migrated.encoding).toBe("hashed-v1");
  expect(migrated.models.results.myelin).toBe("myelinated");
  expect(migrated.models.collectedIds).toEqual(["myelin"]);
  expect(migrated.models.predictions).toEqual({});
  expect(migrated.models.explanations).toEqual({});
});

test("version-4 state migrates to version 6 without changing existing responses or completion data", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  const evidenceId = `${PROJECT}:lesson-09:evidence-slip`;
  const version4State = {
    version: 4,
    route: "chapter-13-practice",
    responses: { [evidenceId]: "A preserved explanation of a negative-feedback pathway." },
    practice: {},
    completedRoutes: ["chapter-11-practice"],
    visitedLessons: ["lesson-09"],
    investigations: [],
    evidenceIds: [evidenceId],
    vocabulary: { activeId: "homeostasis", choiceIds: [], collectedIds: [] },
    media: { paths: {}, checkpoints: {}, needsCheckRoutes: [] },
    models: {
      activeId: "feedback",
      results: {},
      predictions: {},
      predictionChoices: {},
      explanations: {},
      explanationChoices: {},
      collectedIds: []
    }
  };
  await page.addInitScript(({ key, value }) => {
    const fixtureFlag = "pilot-2-v4-textbook-review-migration-fixture";
    if (sessionStorage.getItem(fixtureFlag) === "applied") return;
    localStorage.setItem(key, JSON.stringify(value));
    sessionStorage.setItem(fixtureFlag, "applied");
  }, { key: STORAGE_KEY, value: version4State });
  await page.reload({ waitUntil: "domcontentloaded" });
  await showRoute(page, "chapter-13-practice");

  const migrated = await readStoredState(page);
  expect(migrated.version).toBe(6);
  expect(migrated.encoding).toBe("hashed-v1");
  expect(migrated.responses[evidenceId]).toBe(version4State.responses[evidenceId]);
  expect(migrated.completedRoutes).toEqual(version4State.completedRoutes);
  expect(migrated.textbookReviewAttempts).toEqual([]);
  await expect(page.locator(`[data-textbook-review-attempt="${PROJECT}:textbook:chapter-13-review:attempt"]`)).toHaveText("I attempted the textbook review");
});

test("version-5 state migrates with existing work intact and all Advanced Learning flags unchecked", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  const evidenceId = `${PROJECT}:lesson-11:evidence-slip`;
  const attemptId = `${PROJECT}:textbook:chapter-13-review:attempt`;
  const version5State = {
    version: 5,
    route: "lesson-11",
    responses: { [evidenceId]: "A preserved explanation that separates ADH production, release, and target sites." },
    practice: {},
    completedRoutes: ["chapter-11-practice"],
    visitedLessons: ["lesson-11"],
    investigations: [],
    evidenceIds: [evidenceId],
    vocabulary: { activeId: "water-salt-regulation", choiceIds: [], collectedIds: [] },
    media: { paths: {}, checkpoints: {}, needsCheckRoutes: [] },
    models: {
      activeId: "adh",
      results: {},
      predictions: {},
      predictionChoices: {},
      explanations: {},
      explanationChoices: {},
      collectedIds: []
    },
    textbookReviewAttempts: [attemptId]
  };
  await page.addInitScript(({ key, value }) => {
    const fixtureFlag = "pilot-2-v5-advanced-migration-fixture";
    if (sessionStorage.getItem(fixtureFlag) === "applied") return;
    localStorage.setItem(key, JSON.stringify(value));
    sessionStorage.setItem(fixtureFlag, "applied");
  }, { key: STORAGE_KEY, value: version5State });
  await page.reload({ waitUntil: "domcontentloaded" });

  await expect(page.locator(`[data-response-id="${evidenceId}"]`)).toHaveValue(version5State.responses[evidenceId]);
  await showRoute(page, "advanced-learning");
  await expect(page.locator("[data-advanced-progress]")).toHaveText("0 of 40");
  const migrated = await readStoredState(page);
  expect(migrated.version).toBe(6);
  expect(migrated.responses[evidenceId]).toBe(version5State.responses[evidenceId]);
  expect(migrated.completedRoutes).toEqual(version5State.completedRoutes);
  expect(migrated.textbookReviewAttempts).toEqual([attemptId]);
  expect(migrated.advanced.c).toBe("0000000000");
  expect(migrated.advanced.completedIds).toEqual([]);
});

test("figure enlargement is keyboard-operable and returns focus", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  await page.route(/youtube-nocookie\.com/, (route) => route.abort());
  await showRoute(page, "lesson-01");
  const open = page.locator('#lesson-01 [data-figure-id="myelin-saltatory"] [data-enlarge-figure]');
  await open.focus();
  await page.keyboard.press("Enter");
  const dialog = page.locator("[data-figure-dialog]");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("img")).toHaveCount(1);
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(open).toBeFocused();
});

test("every learner route remains usable at 200 percent text size and is axe-clean", async ({ page }) => {
  test.setTimeout(300_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  await page.route(/youtube-nocookie\.com/, (route) => route.abort());
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  for (const routeId of ROUTES) {
    await showRoute(page, routeId);
    await expectNoPageOverflow(page);
  }

  await page.reload({ waitUntil: "domcontentloaded" });
  for (const routeId of ROUTES) {
    await showRoute(page, routeId);
    const results = await new AxeBuilder({ page })
      .include(`#${routeId}`)
      .exclude('iframe[src*="youtube-nocookie.com"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations, `axe violations on ${routeId}`).toEqual([]);
  }
});
