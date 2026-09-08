import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { openProjectInStudio } from "../lib/project-open";

const UNITS = [
  { slug: "biology30-unit-b", prefix: "b", lessons: 14, practice: 86, artifacts: 8 },
  { slug: "biology30-unit-c", prefix: "c", lessons: 24, practice: 160, artifacts: 12 },
  { slug: "biology30-unit-d", prefix: "d", lessons: 11, practice: 72, artifacts: 6 }
] as const;

function routes(unit: typeof UNITS[number]) {
  return [
    "overview",
    ...Array.from({ length: unit.lessons }, (_value, index) => `${unit.prefix}-lesson-${String(index + 1).padStart(2, "0")}`),
    "model-lab",
    "investigation-notebook",
    "practice-hub",
    "glossary-and-data",
    "sources-and-credits"
  ];
}

async function openCandidate(page: Page, slug: string) {
  await openProjectInStudio(page, slug);
  const frame = page.getByTestId("workspace-preview-frame");
  const src = await frame.getAttribute("src");
  if (!src) throw new Error(`${slug} workspace preview has no source URL.`);
  const candidateUrl = new URL(src, page.url()).href;
  await page.goto(candidateUrl, { waitUntil: "domcontentloaded" });
  await expect(page.locator("main#course-main")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  return candidateUrl;
}

async function showRoute(page: Page, routeId: string) {
  const target = page.locator(`[data-page-target="${routeId}"]`).first();
  await expect(target, `route target ${routeId}`).toHaveCount(1);
  await target.evaluate((node) => (node as HTMLElement).click());
  const route = page.locator(`section#${routeId}`);
  await expect(route).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`#${routeId}$`));
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  });
  return route;
}

async function expectNoOverflow(page: Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
}

async function installScormMock(page: Page) {
  await page.addInitScript(() => {
    const prefix = "biology30-production-e2e-scorm:";
    const mockWindow = window as typeof window & { API_1484_11?: Record<string, (...args: string[]) => string> };
    mockWindow.API_1484_11 = {
      Initialize: () => "true",
      GetValue: (key: string) => localStorage.getItem(prefix + key) || "",
      SetValue: (key: string, value: string) => {
        localStorage.setItem(prefix + key, value);
        return "true";
      },
      Commit: () => "true",
      Terminate: () => "true"
    };
  });
}

test("Units B-D expose exact local-first inventories with exhaustive Chromium and representative cross-browser axe coverage", async ({ page, browserName }) => {
  test.setTimeout(600_000);
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const unit of UNITS) {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await openCandidate(page, unit.slug);
    const candidateOrigin = new URL(page.url()).origin;
    requests.length = 0;
    await page.reload({ waitUntil: "domcontentloaded" });
    const expectedRoutes = routes(unit);
    await expect(page.locator(".course-page")).toHaveCount(expectedRoutes.length);
    expect(await page.locator(".course-page").evaluateAll((nodes) => nodes.map((node) => node.id))).toEqual(expectedRoutes);
    await expect(page.locator("[data-practice-id]")).toHaveCount(unit.practice);
    await expect(page.locator("[data-artifact-id]")).toHaveCount(unit.artifacts);
    await expect(page.locator("[data-semantic-figure-id]")).toHaveCount(unit.lessons);

    for (const routeId of expectedRoutes) {
      const route = await showRoute(page, routeId);
      await expect(route.locator("h1")).toHaveCount(1);
      await expectNoOverflow(page);
    }

    const axeRoutes = browserName === "chromium"
      ? expectedRoutes
      : [
          "overview",
          `${unit.prefix}-lesson-01`,
          `${unit.prefix}-lesson-${String(Math.ceil(unit.lessons / 2)).padStart(2, "0")}`,
          `${unit.prefix}-lesson-${String(unit.lessons).padStart(2, "0")}`,
          "investigation-notebook",
          "practice-hub"
        ];
    for (const routeId of axeRoutes) {
      await showRoute(page, routeId);
      const results = await new AxeBuilder({ page })
        .include(`#${routeId}`)
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations, `${unit.slug} axe violations on ${routeId}`).toEqual([]);
    }

    const external = requests.filter((requestUrl) => {
      const parsed = new URL(requestUrl);
      return (parsed.protocol === "http:" || parsed.protocol === "https:") && parsed.origin !== candidateOrigin;
    });
    expect(external, `${unit.slug} required external requests`).toEqual([]);
    page.removeAllListeners("request");
  }
});

test("Units B-D reflow on mobile and their hub cards land on the exact activity", async ({ page }) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });

  for (const unit of UNITS) {
    await openCandidate(page, unit.slug);
    for (const routeId of ["overview", `${unit.prefix}-lesson-01`, `${unit.prefix}-lesson-${String(unit.lessons).padStart(2, "0")}`, "investigation-notebook", "practice-hub"]) {
      await showRoute(page, routeId);
      await expectNoOverflow(page);
    }

    await showRoute(page, "model-lab");
    const modelLink = page.locator("[data-open-bio-model]").first();
    const modelLesson = await modelLink.getAttribute("data-page-target");
    const interactionId = await modelLink.getAttribute("data-open-bio-model");
    expect(modelLesson).toBeTruthy();
    expect(interactionId).toBeTruthy();
    await modelLink.click();
    const model = page.locator(`[data-bio-interaction="${interactionId}"]`);
    await expect(page.locator(`#${modelLesson}`)).toBeVisible();
    await expect(model.locator("h2, h3").first()).toBeFocused();
    await expect.poll(() => model.evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBeGreaterThanOrEqual(64);
    await expect.poll(() => model.evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBeLessThanOrEqual(120);

    await showRoute(page, "practice-hub");
    const practiceLink = page.locator("[data-open-bio-practice]").first();
    const practiceLesson = await practiceLink.getAttribute("data-page-target");
    expect(practiceLesson).toBeTruthy();
    await practiceLink.click();
    const practice = page.locator(`[data-bio-practice="${practiceLesson}"]`);
    await expect(page.locator(`#${practiceLesson}`)).toBeVisible();
    await expect(practice.locator("h2, h3").first()).toBeFocused();
    await expect.poll(() => practice.evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBeGreaterThanOrEqual(64);
    await expect.poll(() => practice.evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBeLessThanOrEqual(120);

    const undersized = await page.locator("button:visible, a.bio-primary-action:visible").evaluateAll((nodes) => nodes
      .filter((node) => !node.closest("[data-canvas-helper-preview-controls]"))
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return { text: node.textContent?.trim().slice(0, 40), width: rect.width, height: rect.height };
      })
      .filter((target) => target.width < 43 || target.height < 43));
    expect(undersized, `${unit.slug} mobile touch targets`).toEqual([]);
  }
});

test("each remaining unit restores responses, practice, model, notebook, and completion from compact LMS state", async ({ page }) => {
  test.setTimeout(180_000);
  await installScormMock(page);
  await page.addInitScript(() => {
    const slug = sessionStorage.getItem("biology30-production-clear-state");
    if (!slug) return;
    sessionStorage.removeItem("biology30-production-clear-state");
    localStorage.removeItem("biology30-production-e2e-scorm:cmi.suspend_data");
    localStorage.removeItem(slug + ":state:v1");
  });
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const unit of UNITS) {
    await openCandidate(page, unit.slug);
    await page.evaluate((slug) => sessionStorage.setItem("biology30-production-clear-state", slug), unit.slug);
    await page.reload({ waitUntil: "domcontentloaded" });
    const lessonId = `${unit.prefix}-lesson-01`;
    const lesson = await showRoute(page, lessonId);
    const warmup = lesson.locator("[data-bio-response-id$=':warmup']");
    const exit = lesson.locator("[data-bio-response-id$=':exit']");
    await warmup.fill(`Saved ${unit.prefix.toUpperCase()} warm-up evidence that must restore from the compact record.`);

    const modelCases = lesson.locator("[data-bio-model-case]");
    await expect(modelCases).toHaveCount(3);
    const selectedCaseId = await modelCases.nth(1).getAttribute("data-bio-model-case-id");
    if (!selectedCaseId) throw new Error(`${unit.slug} second model case has no stable identifier.`);
    await modelCases.nth(1).focus();
    await page.keyboard.press("Enter");
    await expect(modelCases.nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(lesson.locator("[data-generic-model-progress]")).toHaveText("1 of 3 cases inspected");

    const practice = lesson.locator("[data-practice-id]").first();
    await practice.locator("input[type='radio']").first().check();
    await practice.locator("[data-check-practice]").click();
    await expect(practice.locator("[data-practice-feedback]")).toBeVisible();

    await exit.fill("This saved exit connects the observed evidence to a biological mechanism and states a meaningful limit.");
    await lesson.locator(`[data-complete-bio-lesson="${lessonId}"]`).click();
    await expect(lesson.locator(`[data-lesson-status="${lessonId}"]`)).toContainText("Lesson complete");

    await showRoute(page, "investigation-notebook");
    await page.locator("[data-notebook-title]").fill(`${unit.prefix.toUpperCase()} evidence`);
    await page.locator("[data-notebook-body]").fill("A saved observation with mechanism, uncertainty, and a next evidence step.");
    await page.locator("[data-save-notebook-entry]").click();
    await expect(page.locator("[data-notebook-count]")).toHaveText("1 of 10 entries");

    const compact = await page.evaluate(() => localStorage.getItem("biology30-production-e2e-scorm:cmi.suspend_data") || "");
    expect(compact.length).toBeGreaterThan(0);
    expect(compact.length).toBeLessThan(48_000);
    expect(JSON.parse(compact).v).toBe(2);

    await page.evaluate((slug) => sessionStorage.setItem("biology30-clear-expanded-state", slug), unit.slug);
    await page.addInitScript(() => {
      const slug = sessionStorage.getItem("biology30-clear-expanded-state");
      if (!slug) return;
      sessionStorage.removeItem("biology30-clear-expanded-state");
      localStorage.removeItem(slug + ":state:v1");
    });
    await page.reload({ waitUntil: "domcontentloaded" });

    await expect(page.locator("#investigation-notebook")).toBeVisible();
    await expect(page.locator("[data-notebook-list]")).toContainText(`${unit.prefix.toUpperCase()} evidence`);
    await showRoute(page, lessonId);
    await expect(warmup).toHaveValue(/compact record/);
    await expect(exit).toHaveValue(/biological mechanism/);
    await expect(lesson.locator(`[data-bio-model-case-id="${selectedCaseId}"]`)).toHaveAttribute("aria-pressed", "true");
    await expect(lesson.locator("[data-generic-model-progress]")).toHaveText("1 of 3 cases inspected");
    await expect(practice.locator("input[type='radio']").first()).toBeChecked();
    await expect(practice.locator("[data-practice-feedback]")).toBeVisible();
    await expect(lesson.locator(`[data-lesson-status="${lessonId}"]`)).toContainText("Lesson complete");
  }
});
