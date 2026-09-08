import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { openProjectInStudio } from "../lib/project-open";

const PROJECT_SLUG = "biology30-unit-a";
const ALL_ROUTES = [
  "overview",
  ...Array.from({ length: 17 }, (_value, index) => `lesson-${String(index + 1).padStart(2, "0")}`),
  "model-lab",
  "investigation-notebook",
  "practice-hub",
  "glossary-and-data",
  "sources-and-credits"
];
const REVIEW_ROUTES = ["overview", "lesson-04", "lesson-09", "lesson-15", "model-lab", "investigation-notebook", "practice-hub"];

async function openCandidate(page: Page) {
  await openProjectInStudio(page, PROJECT_SLUG);
  const frame = page.getByTestId("workspace-preview-frame");
  const src = await frame.getAttribute("src");
  if (!src) throw new Error("Biology Gate 2 workspace preview has no source URL.");
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
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  return route;
}

async function expectNoPageOverflow(page: Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
}

async function installScormMock(page: Page) {
  await page.addInitScript(() => {
    const prefix = "biology30-e2e-scorm:";
    const mockWindow = window as typeof window & { API_1484_11?: Record<string, (...args: string[]) => string> };
    mockWindow.API_1484_11 = {
      Initialize: () => "true",
      GetValue: (key: string) => localStorage.getItem(prefix + key) || "",
      SetValue: (key: string, value: string) => {
        localStorage.setItem(prefix + key, value);
        return "true";
      },
      Commit: () => "true",
      Terminate: () => {
        localStorage.setItem(prefix + "terminated", "true");
        return "true";
      }
    };
  });
}

async function reloadWithSeededState(page: Page, serialized: string, clearScorm = false) {
  await page.evaluate(
    (seed) => sessionStorage.setItem("biology30-e2e-next-state", JSON.stringify(seed)),
    { serialized, clearScorm }
  );
  await page.addInitScript(() => {
    const pending = sessionStorage.getItem("biology30-e2e-next-state");
    if (!pending) return;
    sessionStorage.removeItem("biology30-e2e-next-state");
    const seed = JSON.parse(pending) as { serialized: string; clearScorm: boolean };
    localStorage.setItem("biology30-unit-a:state:v1", seed.serialized);
    if (seed.clearScorm) localStorage.removeItem("biology30-e2e-scorm:cmi.suspend_data");
  });
  await page.reload({ waitUntil: "domcontentloaded" });
}

test("Gate 2 exposes exactly 23 complete learner routes", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  await expect(page.locator(".course-page")).toHaveCount(23);
  expect(await page.locator(".course-page").evaluateAll((nodes) => nodes.map((node) => node.id))).toEqual(ALL_ROUTES);
  await expect(page.locator("#lessons")).toHaveCount(0);
  for (const routeId of ALL_ROUTES) {
    const route = await showRoute(page, routeId);
    await expect(route.locator("h1")).toHaveCount(1);
  }
});

test("Gate 2 review routes are local-first and axe-clean", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await openCandidate(page);
  const origin = new URL(page.url()).origin;
  requests.length = 0;
  await page.reload({ waitUntil: "domcontentloaded" });

  for (const routeId of REVIEW_ROUTES) {
    await showRoute(page, routeId);
    const results = await new AxeBuilder({ page })
      .include(`#${routeId}`)
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations, `axe violations on ${routeId}`).toEqual([]);
  }

  const external = requests.filter((requestUrl) => {
    const url = new URL(requestUrl);
    return (url.protocol === "http:" || url.protocol === "https:") && url.origin !== origin;
  });
  expect(external).toEqual([]);

  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== origin) await route.abort();
    else await route.continue();
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await showRoute(page, "lesson-04");
  await page.locator('[data-ap-stage-button="threshold"]').click();
  await expect(page.locator("[data-ap-stage-name]")).toHaveText("Threshold");
});

test("Model Lab cards open and focus their exact model", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);

  for (const interactionId of ["interaction-action-potential-explorer", "interaction-reflex-arc-builder"]) {
    await showRoute(page, "model-lab");
    const link = page.locator(`[data-open-bio-model="${interactionId}"]`);
    const lessonId = await link.getAttribute("data-page-target");
    expect(lessonId).toBeTruthy();
    await link.click();

    const model = page.locator(`[data-bio-interaction="${interactionId}"]`);
    const heading = model.locator("h2, h3").first();
    await expect(page.locator(`#${lessonId}`)).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`#${lessonId}$`));
    await expect(heading).toBeFocused();
    await expect.poll(() => model.evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBeGreaterThanOrEqual(64);
    await expect.poll(() => model.evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBeLessThanOrEqual(120);
  }
});

test("Practice Hub lesson cards open and focus their exact guided practice", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);

  for (const lessonId of ["lesson-04", "lesson-07"]) {
    await showRoute(page, "practice-hub");
    const link = page.locator(`[data-open-bio-practice="${lessonId}"]`);
    await expect(link).toHaveAttribute("data-page-target", lessonId);
    await link.click();

    const practice = page.locator(`[data-bio-practice="${lessonId}"]`);
    const heading = practice.locator("h2, h3").first();
    await expect(page.locator(`#${lessonId}`)).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`#${lessonId}$`));
    await expect(heading).toBeFocused();
    await expect.poll(() => practice.evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBeGreaterThanOrEqual(64);
    await expect.poll(() => practice.evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBeLessThanOrEqual(120);
  }
});

test("Action-potential model, feedback, artifact, completion, and reload persistence work by keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  await showRoute(page, "lesson-04");

  const firstStage = page.locator('[data-ap-stage-button="rest"]');
  await firstStage.focus();
  for (let index = 0; index < 5; index += 1) await page.keyboard.press("ArrowRight");
  await expect(page.locator("[data-ap-stage-name]")).toHaveText("Recovery");
  await expect(page.locator("[data-ap-progress]")).toHaveText("6 of 6 stages inspected");

  const practice = page.locator('[data-practice-id="lesson-04-check-1"]');
  await practice.locator('input[value="a"]').check();
  await practice.locator("[data-check-practice]").click();
  await expect(practice.locator("[data-practice-feedback]")).toContainText("Correct reasoning");

  const artifactClaim = page.locator('[data-bio-response-id="biology30-unit-a:artifact:action-potential-evidence:claim"]');
  await artifactClaim.fill("A threshold event recruits voltage-gated sodium channels.");
  await page.locator('[data-bio-response-id="biology30-unit-a:artifact:action-potential-evidence:evidence"]').fill("The trace rises from threshold toward a positive peak and then falls below rest.");
  await page.locator('[data-bio-response-id="biology30-unit-a:artifact:action-potential-evidence:reasoning"]').fill("Sodium entry drives the rise; sodium-channel inactivation and potassium exit drive the fall.");
  await page.locator('[data-save-artifact="action-potential-evidence"]').click();
  await expect(page.locator('[data-artifact-status="action-potential-evidence"]')).toContainText("Saved draft");
  await expect(artifactClaim).toHaveValue("A threshold event recruits voltage-gated sodium channels.");

  const exit = page.locator('[data-bio-response-id="biology30-unit-a:lesson:04:exit"]');
  await exit.fill("The signal is regenerated because each local current brings the next membrane region to threshold.");
  await page.locator('[data-complete-bio-lesson="lesson-04"]').click();
  await expect(page.locator('[data-lesson-status="lesson-04"]')).toContainText("Lesson complete");

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#lesson-04")).toBeVisible();
  await expect(page.locator("[data-ap-progress]")).toHaveText("6 of 6 stages inspected");
  await expect(practice.locator('input[value="a"]')).toBeChecked();
  await expect(practice.locator("[data-practice-feedback]")).toContainText("Correct reasoning");
  await expect(exit).toHaveValue(/signal is regenerated/);
  await expect(artifactClaim).toHaveValue("A threshold event recruits voltage-gated sodium channels.");
  await expect(page.locator('[data-artifact-status="action-potential-evidence"]')).toContainText("Saved draft");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("biology30-unit-a:state:v1") || "{}").practice["lesson-04-check-1"])).toBe("a");
});

test("Blood-glucose model, evidence boundary, artifact, and reload persistence work", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  const lesson = await showRoute(page, "lesson-15");

  await lesson.locator("[data-glucose-scenario]").selectOption("reduced-response");
  await lesson.locator("[data-run-glucose-model]").click();
  await expect(lesson.locator("[data-glucose-scenario-label]")).toHaveText("Meal with reduced target response");
  await expect(lesson.locator("[data-glucose-mechanism]")).toContainText("weaker");
  await expect(lesson.locator("[data-glucose-value-row] td")).toHaveCount(5);

  const practice = lesson.locator('[data-practice-id="lesson-15-check-3"]');
  await practice.locator('input[value="b"]').check();
  await practice.locator("[data-check-practice]").click();
  await expect(practice.locator("[data-practice-feedback]")).toContainText("not diagnostic");

  await lesson.locator('[data-bio-response-id="biology30-unit-a:artifact:glucose-urinalysis:pattern"]').fill("Glucose remains elevated at two hours, with glucose and ketones in the synthetic urine sample.");
  await lesson.locator('[data-bio-response-id="biology30-unit-a:artifact:glucose-urinalysis:mechanism"]').fill("The pattern is consistent with insufficient effective insulin signalling and continued reliance on fat metabolism.");
  await lesson.locator('[data-bio-response-id="biology30-unit-a:artifact:glucose-urinalysis:limits"]').fill("The classroom data cannot diagnose a person; repeat clinical blood evidence and professional assessment would be needed.");
  await lesson.locator('[data-save-artifact="glucose-urinalysis"]').click();
  await expect(lesson.locator('[data-artifact-status="glucose-urinalysis"]')).toContainText("Saved draft");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("biology30-unit-a:state:v1") || "{}").interactions?.bloodGlucose?.current)).toBe("reduced-response");

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#lesson-15")).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("biology30-unit-a:state:v1") || "{}").interactions?.bloodGlucose?.current)).toBe("reduced-response");
  await expect(page.locator("[data-glucose-scenario]")).toHaveValue("reduced-response");
  await expect(page.locator('[data-practice-id="lesson-15-check-3"] input[value="b"]')).toBeChecked();
  await expect(page.locator('[data-artifact-status="glucose-urinalysis"]')).toContainText("Saved draft");
});

test("Reflex and audiogram models change reasoning, persist, and reset only themselves", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);

  await showRoute(page, "lesson-04");
  await page.locator('[data-ap-stage-button="threshold"]').click();
  await showRoute(page, "lesson-07");
  await page.locator('[data-generic-model-select="interaction-reflex-arc-builder"]').selectOption("brain-first");
  await page.locator('[data-run-bio-model="interaction-reflex-arc-builder"]').click();
  await expect(page.locator('[data-generic-model-evidence="interaction-reflex-arc-builder"]')).toContainText("conscious cortex");
  await expect(page.locator('[data-generic-model-explanation="interaction-reflex-arc-builder"]')).toContainText("spinal integration");
  await expect(page.locator('[data-generic-model-progress="interaction-reflex-arc-builder"]')).toHaveText("1 of 3 cases inspected");

  await showRoute(page, "lesson-10");
  await page.locator('[data-generic-model-select="interaction-audiogram-evidence-explorer"]').selectOption("diagnosis");
  await page.locator('[data-run-bio-model="interaction-audiogram-evidence-explorer"]').click();
  await expect(page.locator('[data-generic-model-explanation="interaction-audiogram-evidence-explorer"]')).toContainText("insufficient for diagnosis");

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#lesson-10")).toBeVisible();
  await expect(page.locator('[data-generic-model-select="interaction-audiogram-evidence-explorer"]')).toHaveValue("diagnosis");
  await showRoute(page, "lesson-07");
  await expect(page.locator('[data-generic-model-select="interaction-reflex-arc-builder"]')).toHaveValue("brain-first");
  await page.locator('[data-reset-bio-model="interaction-reflex-arc-builder"]').click();
  await expect(page.locator('[data-generic-model-progress="interaction-reflex-arc-builder"]')).toHaveText("0 of 3 cases inspected");

  const state = await page.evaluate(() => JSON.parse(localStorage.getItem("biology30-unit-a:state:v1") || "{}"));
  expect(state.interactions.actionPotential.current).toBe("threshold");
  expect(state.interactions.generic["interaction-reflex-arc-builder"]).toEqual({ current: "complete", seen: [] });
  expect(state.interactions.generic["interaction-audiogram-evidence-explorer"].current).toBe("diagnosis");
});

test("Investigation Notebook saves, copies, prints, removes, and does not erase lesson work", async ({ page, context }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const candidateUrl = await openCandidate(page);
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: new URL(candidateUrl).origin });
  await showRoute(page, "lesson-04");
  await page.locator('[data-bio-response-id="biology30-unit-a:lesson:04:warmup"]').fill("A saved lesson observation that must remain independent.");
  await showRoute(page, "investigation-notebook");

  await page.locator("[data-notebook-title]").fill("Threshold evidence");
  await page.locator("[data-notebook-body]").fill("The model crossed threshold before the rapid sodium-driven rising phase.");
  await page.locator("[data-save-notebook-entry]").click();
  await expect(page.locator("[data-notebook-count]")).toHaveText("1 of 10 entries");
  await expect(page.locator("[data-notebook-list]")).toContainText("Threshold evidence");

  await page.locator("[data-copy-notebook]").click();
  await expect(page.locator("[data-notebook-export-status]")).toHaveText("Copied");
  await page.evaluate(() => {
    (window as typeof window & { __biologyPrintCount?: number }).__biologyPrintCount = 0;
    window.print = () => { (window as typeof window & { __biologyPrintCount?: number }).__biologyPrintCount = 1; };
  });
  await page.locator("[data-print-notebook]").click();
  expect(await page.evaluate(() => (window as typeof window & { __biologyPrintCount?: number }).__biologyPrintCount)).toBe(1);
  await expect(page.locator(".print-job-root")).toHaveCount(1);
  await page.evaluate(() => { document.body.classList.remove("print-job-active"); document.querySelector(".print-job-root")?.remove(); });

  await page.locator("[data-remove-notebook-entry]").click();
  await expect(page.locator("[data-notebook-count]")).toHaveText("0 of 10 entries");
  await showRoute(page, "lesson-04");
  await expect(page.locator('[data-bio-response-id="biology30-unit-a:lesson:04:warmup"]')).toHaveValue(/independent/);
});

test("Final practice reports SCORM score and completes only the full required portfolio", async ({ page }) => {
  test.setTimeout(120_000);
  await installScormMock(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);

  const seeded = await page.evaluate(() => {
    const lessonIds = Array.from({ length: 17 }, (_value, index) => `lesson-${String(index + 1).padStart(2, "0")}`);
    const artifactIds = Array.from(document.querySelectorAll("[data-artifact-id]"), (node) => node.getAttribute("data-artifact-id") || "").filter(Boolean);
    const finalIds = Array.from(document.querySelectorAll("#practice-hub [data-final-practice] [data-practice-id]"), (node) => node.getAttribute("data-practice-id") || "").filter(Boolean);
    const state = {
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      location: "practice-hub",
      responses: {},
      practice: Object.fromEntries(finalIds.map((id) => [id, "a"])),
      interactions: {
        actionPotential: { current: "rest", seen: ["rest"] },
        bloodGlucose: { current: "regulated-meal", seenScenarios: [] },
        generic: {}
      },
      artifacts: Object.fromEntries(artifactIds.map((id) => [id, { savedAt: new Date().toISOString(), fieldIds: [] }])),
      notebook: [],
      completions: lessonIds,
      finalPractice: null
    };
    return { artifactCount: artifactIds.length, finalCount: finalIds.length, serialized: JSON.stringify(state) };
  });
  expect({ artifactCount: seeded.artifactCount, finalCount: seeded.finalCount }).toEqual({ artifactCount: 7, finalCount: 24 });

  await reloadWithSeededState(page, seeded.serialized, true);
  await showRoute(page, "practice-hub");
  await expect(page.locator("[data-final-practice] input[value='a']:checked")).toHaveCount(24);
  await page.locator("[data-submit-final-practice]").click();
  await expect(page.locator("[data-final-practice-status]")).toHaveText("Submitted");

  const result = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem("biology30-unit-a:state:v1") || "{}");
    return {
      completion: localStorage.getItem("biology30-e2e-scorm:cmi.completion_status"),
      success: localStorage.getItem("biology30-e2e-scorm:cmi.success_status"),
      minimum: localStorage.getItem("biology30-e2e-scorm:cmi.score.min"),
      maximum: localStorage.getItem("biology30-e2e-scorm:cmi.score.max"),
      score: localStorage.getItem("biology30-e2e-scorm:cmi.score.raw"),
      stateScore: String(state.finalPractice?.percent),
      completedLessons: state.completions?.length,
      savedArtifacts: Object.keys(state.artifacts || {}).length
    };
  });
  expect(result).toEqual({
    completion: "completed",
    success: "unknown",
    minimum: "0",
    maximum: "100",
    score: result.stateScore,
    stateScore: result.stateScore,
    completedLessons: 17,
    savedArtifacts: 7
  });

  await page.locator("[data-bio-save-exit]").click();
  await expect(page.locator("[data-bio-save-exit]")).toHaveAttribute("data-saved", "true");
  expect(await page.evaluate(() => localStorage.getItem("biology30-e2e-scorm:terminated"))).toBe("true");
});

test("State-budget overflow preserves the last valid serialized learner state", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  const seeded = await page.evaluate(() => {
    const state = {
      schemaVersion: 1,
      updatedAt: "2026-08-30T00:00:00.000Z",
      location: "lesson-01",
      responses: { "oversized-unrecognized-response": "" },
      practice: {},
      interactions: {
        actionPotential: { current: "rest", seen: ["rest"] },
        bloodGlucose: { current: "regulated-meal", seenScenarios: [] },
        generic: {}
      },
      artifacts: {},
      notebook: [],
      completions: [],
      finalPractice: null
    };
    const compact = {
      v: 2,
      t: Date.parse(state.updatedAt).toString(36),
      l: state.location,
      r: [["oversized-unrecognized-response", ""]],
      p: [],
      i: { a: [0, "1"], b: ["regulated-meal", []], g: [] },
      a: [],
      n: [],
      c: [],
      f: null
    };
    const emptyCompactLength = JSON.stringify(compact).length;
    state.responses["oversized-unrecognized-response"] = "x".repeat(47_900 - emptyCompactLength);
    compact.r[0][1] = state.responses["oversized-unrecognized-response"];
    return { serialized: JSON.stringify(state), compactLength: JSON.stringify(compact).length };
  });
  expect(seeded.compactLength).toBe(47_900);

  await reloadWithSeededState(page, seeded.serialized);
  await showRoute(page, "lesson-01");
  await page.locator('[data-bio-response-id="biology30-unit-a:lesson:01:warmup"]').fill("This new response must not overwrite the last valid state when the budget is exceeded.");
  await expect(page.locator("[data-bio-global-save]")).toContainText("Save paused");
  expect(await page.evaluate(() => localStorage.getItem("biology30-unit-a:state:v1"))).toBe(seeded.serialized);
});

test("Gate 2 reflows at tablet and mobile sizes with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1024, height: 768 });
  await openCandidate(page);
  await expect(page.locator("#topbar-menu-toggle")).toBeVisible();
  await expectNoPageOverflow(page);

  await page.setViewportSize({ width: 390, height: 844 });
  for (const routeId of REVIEW_ROUTES) {
    await showRoute(page, routeId);
    await expectNoPageOverflow(page);
  }
  const transition = await page.locator(".bio-primary-button").first().evaluate((node) => getComputedStyle(node).transitionDuration);
  expect(Math.max(...transition.split(",").map((value) => Number.parseFloat(value)))).toBeLessThanOrEqual(0.00001);
  const undersizedTouchTargets = await page.locator("button:visible, a.bio-primary-action:visible").evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { tag: node.tagName, id: node.id, classes: node.className, text: node.textContent?.trim().slice(0, 50), width: rect.width, height: rect.height };
  }).filter((_target, index) => !nodes[index].closest("[data-canvas-helper-preview-controls]"))
    .filter((target) => target.width < 43 || target.height < 43));
  expect(undersizedTouchTargets).toEqual([]);
});

test("Gate 2 remains usable at 200 percent text zoom", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  for (const routeId of REVIEW_ROUTES) {
    await showRoute(page, routeId);
    await expectNoPageOverflow(page);
    await expect(page.locator(`#${routeId} h1`)).toBeVisible();
  }
});

test("Every scientific figure is geometrically clean in its real course lane", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  const inventory = await page.locator(".bio-figure svg[data-figure-id]").evaluateAll((nodes) => nodes.map((svg) => ({
    renderedId: (svg as SVGSVGElement).dataset.figureId || "",
    routeId: svg.closest<HTMLElement>(".course-page")?.id || ""
  })));
  expect(inventory).toHaveLength(28);
  expect(new Set(inventory.map(({ renderedId }) => renderedId.replace(/^lesson-\d{2}-.+-\d+-(figure-.+)$/, "$1"))).size).toBe(27);

  const findings: Array<{ viewport: string; figure: string; detail: string }> = [];
  for (const viewport of [{ id: "desktop", width: 1440, height: 900 }, { id: "tablet", width: 1024, height: 768 }, { id: "mobile", width: 390, height: 844 }]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    let activeRoute = "";
    for (const record of inventory) {
      if (record.routeId !== activeRoute) {
        await page.evaluate((routeId) => { window.location.hash = routeId; }, record.routeId);
        await expect(page.locator(`section#${record.routeId}`)).toBeVisible();
        activeRoute = record.routeId;
      }
      const svg = page.locator(`svg[data-figure-id="${record.renderedId}"]`);
      await svg.scrollIntoViewIfNeeded();
      findings.push(...(await svg.evaluate((node, input) => {
        const results: Array<{ viewport: string; figure: string; detail: string }> = [];
        const svgRect = node.getBoundingClientRect();
        const wrapper = node.closest<HTMLElement>(".bio-figure");
        if (!wrapper) return [{ viewport: input.viewport, figure: input.figure, detail: "missing .bio-figure wrapper" }];
        const labels = Array.from(node.querySelectorAll<SVGTextElement>("text")).map((label) => ({
          text: label.textContent?.trim() || "",
          rect: label.getBoundingClientRect()
        })).filter(({ text, rect }) => text && rect.width > 0 && rect.height > 0);
        labels.forEach((left, leftIndex) => {
          if (left.rect.left < svgRect.left - 1 || left.rect.top < svgRect.top - 1 || left.rect.right > svgRect.right + 1 || left.rect.bottom > svgRect.bottom + 1) results.push({ viewport: input.viewport, figure: input.figure, detail: `out-of-bounds label: ${left.text}` });
          if (left.rect.height < 9.5) results.push({ viewport: input.viewport, figure: input.figure, detail: `undersized label: ${left.text}` });
          labels.slice(leftIndex + 1).forEach((right) => {
            const overlapX = Math.min(left.rect.right, right.rect.right) - Math.max(left.rect.left, right.rect.left);
            const overlapY = Math.min(left.rect.bottom, right.rect.bottom) - Math.max(left.rect.top, right.rect.top);
            if (overlapX > 1 && overlapY > 1) results.push({ viewport: input.viewport, figure: input.figure, detail: `overlapping labels: ${left.text} / ${right.text}` });
          });
        });
        for (const connector of node.querySelectorAll<SVGGeometryElement>("[data-qa-connector]")) {
          const matrix = connector.getScreenCTM();
          const length = connector.getTotalLength();
          if (!matrix || !Number.isFinite(length) || length <= 0) continue;
          for (const label of labels) {
            let collides = false;
            for (let distance = 0; distance <= length; distance += 3) {
              const point = connector.getPointAtLength(Math.min(distance, length)).matrixTransform(matrix);
              if (point.x > label.rect.left + 2 && point.x < label.rect.right - 2 && point.y > label.rect.top + 2 && point.y < label.rect.bottom - 2) { collides = true; break; }
            }
            if (collides) results.push({ viewport: input.viewport, figure: input.figure, detail: `connector crosses label: ${label.text}` });
          }
        }
        const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        if (overflow > 1) results.push({ viewport: input.viewport, figure: input.figure, detail: `page overflows by ${overflow}px` });
        if (input.viewport === "mobile") {
          const wrapperStyle = getComputedStyle(wrapper);
          if (wrapperStyle.overflowX !== "auto" || wrapper.scrollWidth <= wrapper.clientWidth || svgRect.width < 800) results.push({ viewport: input.viewport, figure: input.figure, detail: `invalid mobile evidence lane: ${wrapperStyle.overflowX} ${wrapper.clientWidth}/${wrapper.scrollWidth} ${svgRect.width}` });
        }
        return results;
      }, { viewport: viewport.id, figure: record.renderedId })));
    }
  }
  expect(findings).toEqual([]);
});

test("Gate 2 visual review baselines", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openCandidate(page);
  await page.addStyleTag({ content: "[data-canvas-helper-preview-controls] { display: none !important; }" });
  for (const routeId of REVIEW_ROUTES) {
    await showRoute(page, routeId);
    await expect(page).toHaveScreenshot(`biology30-gate2-${routeId}.png`, {
      animations: "disabled",
      caret: "hide",
      fullPage: false
    });
  }
});
