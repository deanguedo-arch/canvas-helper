import { expect, test, type Page } from "@playwright/test";

import { openProjectInStudio } from "../lib/project-open";

const PROJECT_SLUG = "pe10-online-pilot";
const STORAGE_KEY = "canvas-helper:pe10-online-pilot:state:v1";
const ROUTES = [
  "overview",
  "how-it-works",
  "safety-planning",
  "activity-log",
  "checkpoints",
  "assignments",
  "portfolio",
  "resources"
] as const;

type PilotWindow = Window & typeof globalThis & {
  PE10Pilot?: {
    storageKey: string;
    serialize(): string;
  };
  __pe10PrintCount?: number;
  __pe10CopiedText?: string;
};

async function openDirectLearner(page: Page, options: { clearState?: boolean } = {}) {
  await openProjectInStudio(page, PROJECT_SLUG);
  const frameSrc = await page.getByTestId("workspace-preview-frame").getAttribute("src");
  if (!frameSrc) throw new Error("PE10 workspace preview is missing a source URL.");
  const learnerUrl = new URL(frameSrc, page.url()).toString();
  await page.goto(learnerUrl, { waitUntil: "domcontentloaded" });
  if (options.clearState !== false) {
    await page.evaluate((key) => window.localStorage.removeItem(key), STORAGE_KEY);
    await page.reload({ waitUntil: "domcontentloaded" });
  }
  await expect(page.locator("body[data-project-slug='pe10-online-pilot']")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean((window as PilotWindow).PE10Pilot))).toBe(true);
}

function observeRuntimeFailures(page: Page) {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400 && new URL(response.url()).origin === new URL(page.url()).origin) {
      failures.push(`${response.status()} ${response.url()}`);
    }
  });
  return failures;
}

async function goToRoute(page: Page, route: typeof ROUTES[number]) {
  await page.locator(`[data-page-target="${route}"]`).click();
  await expect(page.locator(`#${route}`)).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`#${route}$`));
  await expect(page.locator("[data-route-panel]:visible")).toHaveCount(1);
}

async function fillActivityEntry(page: Page, durationMinutes = "300") {
  await page.locator('input[name="date"]').fill("2026-09-01");
  await page.locator('input[name="activity"]').fill("Trail walking");
  await page.locator('input[name="durationMinutes"]').fill(durationMinutes);
  await page.locator('select[name="dimension"]').selectOption("alternative-environments");
  await page.locator('select[name="intensity"]').selectOption("moderate");
  await page.locator('input[name="learningFocus"]').fill("Steady pacing and trail awareness");
  await page.locator('textarea[name="progression"]').fill("Added a gradual hill while keeping a controlled pace");
  await page.locator('textarea[name="reflection"]').fill("My pacing stayed consistent and I recovered comfortably afterward.");
  await page.locator('input[name="safetyConfirmed"]').check();
}

test("@pe10-online-pilot renders every route, supports keyboard tabs, and stays usable at 390 by 844", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await openDirectLearner(page);
  const failures = observeRuntimeFailures(page);

  await expect(page.locator(".course-topbar")).toBeVisible();
  await expect(page.locator(".course-sidebar")).toBeVisible();
  await expect(page).toHaveTitle("Physical Education 10 — Online");
  await expect(page.locator(".sidebar-course-label")).toHaveText("Self-paced · 50-hour pathway");
  await expect(page.locator("[data-hours-summary]")).toHaveText("0.0 / 50 hours");

  for (const route of ROUTES) {
    await goToRoute(page, route);
    await expect(page.locator(`#${route} h1`)).toBeVisible();
    const brokenImages = await page.locator(`#${route} img`).evaluateAll((images) => images
      .filter((image) => (image as HTMLImageElement).complete && !(image as HTMLImageElement).naturalWidth)
      .map((image) => (image as HTMLImageElement).src));
    expect(brokenImages, `no broken learner images on #${route}`).toEqual([]);
  }

  await goToRoute(page, "portfolio");
  await expect(page.locator("[data-portfolio-assignments-empty]")).toBeVisible();
  await expect(page.locator("[data-portfolio-saved-assignments]")).toContainText("No assignments have been saved to the Portfolio yet.");

  await goToRoute(page, "assignments");
  const saveButtons = page.locator("[data-save-to-portfolio]");
  await expect(saveButtons).toHaveCount(5);
  await expect(saveButtons).toHaveText(Array(5).fill("Save to Portfolio"));
  for (let index = 0; index < 5; index += 1) await expect(saveButtons.nth(index)).toBeDisabled();
  await expect(page.locator("[data-brightspace-submit]")).toHaveCount(0);
  await expect(page.getByText("Brightspace link not configured", { exact: true })).toHaveCount(0);
  const firstTab = page.locator('[data-assignment-tab="assignment-1"]');
  await firstTab.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-assignment-tab="assignment-2"]')).toBeFocused();
  await expect(page.locator('[data-assignment-panel="assignment-2"]')).toBeVisible();
  await page.keyboard.press("End");
  await expect(page.locator('[data-assignment-tab="assignment-5"]')).toBeFocused();
  await page.keyboard.press("Home");
  await expect(firstTab).toBeFocused();
  await expect(page.locator('[data-assignment-panel="assignment-1"]')).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ROUTES) {
    await page.locator("[data-mobile-menu]").click();
    await expect(page.locator(".course-sidebar")).toBeVisible();
    await page.locator(`[data-page-target="${route}"]`).click();
    await expect(page.locator(`#${route}`)).toBeVisible();
    const overflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)
    }));
    expect(overflow.scrollWidth, `#${route} has no mobile horizontal overflow`).toBeLessThanOrEqual(overflow.clientWidth + 1);
  }
  await expect(page.locator("[data-mobile-menu]")).toBeVisible();
  expect(failures).toEqual([]);
});

test("@pe10-online-pilot log, checkpoints, assignments, exports, restore, edit, and delete persist safely", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await openDirectLearner(page);
  const failures = observeRuntimeFailures(page);

  await goToRoute(page, "safety-planning");
  await page.locator("[data-safety-planning-complete]").check();
  await goToRoute(page, "activity-log");
  await fillActivityEntry(page);
  await page.locator("[data-save-entry]").click();
  await expect(page.locator("[data-log-hours]")).toHaveText("5.0");
  await expect(page.locator("[data-log-table-body] tr")).toHaveCount(1);
  await expect(page.locator("[data-log-table-body]")).toContainText("Trail walking");

  await goToRoute(page, "checkpoints");
  const firstCheckpoint = page.locator('[data-checkpoint="5"]');
  await expect(firstCheckpoint.locator("textarea").first()).toBeEnabled();
  await firstCheckpoint.locator('[data-checkpoint-field="reflection"]').fill("My pacing evidence shows that I can sustain a steady effort.");
  await firstCheckpoint.locator('[data-checkpoint-field="nextStep"]').fill("I will add one short incline and keep the same controlled pacing.");
  await expect(page.locator("[data-checkpoint-summary]")).toHaveText("1 of 10 complete");

  await goToRoute(page, "assignments");
  const assignmentDraft = "Trail evidence shows a realistic starting point and a safe, measurable next step.";
  const saveAssignment = page.locator('[data-save-to-portfolio="assignment-1"]');
  await expect(saveAssignment).toBeDisabled();
  await page.locator('[data-assignment-panel="assignment-1"] [data-assignment-field="startingPoint"]').fill(assignmentDraft);
  await page.locator('[data-assignment-panel="assignment-1"] [data-assignment-field="goals"]').fill("I will complete three planned sessions each week and use my log to monitor consistency.");
  await page.locator('[data-assignment-panel="assignment-1"] [data-assignment-field="weeklyPlan"]').fill("My week combines walking, strength, dance, rest, and one flexible make-up session.");
  await page.locator('[data-assignment-panel="assignment-1"] [data-assignment-field="safetyPlan"]').fill("I will check the setting and equipment, progress gradually, and ask my teacher when unsure.");
  await expect(saveAssignment).toBeEnabled();
  await saveAssignment.click();
  await expect(page.locator("[data-toast]")).toContainText("saved to Portfolio");
  await expect(saveAssignment).toHaveText("Saved to Portfolio");
  await expect(saveAssignment).toHaveAttribute("aria-pressed", "true");
  await expect(saveAssignment).toBeDisabled();
  await expect.poll(() => page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      answer: parsed.assignmentDrafts?.["assignment-1"]?.startingPoint,
      savedIds: parsed.completion?.portfolioAssignmentIds
    };
  }, STORAGE_KEY)).toEqual({ answer: assignmentDraft, savedIds: ["assignment-1"] });

  await page.evaluate(() => {
    const pilotWindow = window as PilotWindow;
    pilotWindow.__pe10PrintCount = 0;
    window.print = () => { pilotWindow.__pe10PrintCount = (pilotWindow.__pe10PrintCount || 0) + 1; };
  });
  await page.locator('[data-print-assignment="assignment-1"]').click();
  const assignmentPrint = await page.evaluate(() => ({
    calls: (window as PilotWindow).__pe10PrintCount,
    title: document.querySelector("#print-root h1")?.textContent || "",
    content: document.querySelector("#print-root")?.textContent || ""
  }));
  expect(assignmentPrint.calls).toBe(1);
  expect(assignmentPrint.title).toContain("Assignment 1");
  expect(assignmentPrint.content).toContain(assignmentDraft);
  expect(assignmentPrint.content).not.toContain("Movement Skill and Cooperation Observation");

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-assignment-field="startingPoint"]')).toHaveValue(assignmentDraft);
  await expect(page.locator('[data-save-to-portfolio="assignment-1"]')).toHaveText("Saved to Portfolio");
  await page.locator('[data-assignment-field="startingPoint"]').fill("Needs more detail");
  await expect(page.locator('[data-assignment-readiness="assignment-1"]')).toHaveText("Draft");
  await expect(page.locator('[data-save-to-portfolio="assignment-1"]')).toHaveText("Saved to Portfolio");
  await goToRoute(page, "checkpoints");
  await expect(firstCheckpoint.locator('[data-checkpoint-field="reflection"]')).toHaveValue(/pacing evidence/);
  await expect(page.locator("[data-checkpoint-summary]")).toHaveText("1 of 10 complete");

  await goToRoute(page, "portfolio");
  await expect(page.locator("[data-portfolio-preview]")).toContainText("Trail walking");
  await expect(page.locator('[data-portfolio-assignment="assignment-1"]')).toContainText("Needs more detail");
  await expect(page.locator('[data-portfolio-assignment="assignment-2"]')).toHaveCount(0);
  await expect(page.locator("[data-portfolio-assignments-empty]")).toHaveCount(0);

  await page.evaluate(() => {
    const pilotWindow = window as PilotWindow;
    pilotWindow.__pe10CopiedText = "";
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (value: string) => { pilotWindow.__pe10CopiedText = value; } }
    });
  });
  await page.locator("[data-copy-summary]").click();
  await expect.poll(() => page.evaluate(() => (window as PilotWindow).__pe10CopiedText || "")).toContain("Activity: 5.0 of 50 hours");
  await expect.poll(() => page.evaluate(() => (window as PilotWindow).__pe10CopiedText || "")).toContain("Assignments saved to Portfolio: 1 of 5");

  const [csvDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("[data-download-portfolio-csv]").click()
  ]);
  expect(csvDownload.suggestedFilename()).toMatch(/^pe10-activity-log-\d{4}-\d{2}-\d{2}\.csv$/);

  const validBackup = await page.evaluate(() => (window as PilotWindow).PE10Pilot?.serialize() || "");
  expect(validBackup.length).toBeGreaterThan(500);
  expect(JSON.parse(validBackup).completion.portfolioAssignmentIds).toEqual(["assignment-1"]);
  const beforeInvalidRestore = await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY);
  const wrongProject = JSON.parse(validBackup);
  wrongProject.projectSlug = "wrong-course";
  await page.locator("[data-restore-backup]").setInputFiles({
    name: "wrong-course.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(wrongProject))
  });
  await expect(page.locator("[data-backup-message]")).toContainText("Backup was not restored");
  await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).toBe(beforeInvalidRestore);

  await page.evaluate((key) => window.localStorage.removeItem(key), STORAGE_KEY);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-overview-hours]")).toHaveText("0.0 of 50");
  await goToRoute(page, "portfolio");
  await expect(page.locator("[data-portfolio-assignments-empty]")).toBeVisible();
  await page.locator("[data-restore-backup]").setInputFiles({
    name: "pe10-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(validBackup)
  });
  await expect(page.locator("[data-backup-message]")).toContainText("Backup restored");
  await expect(page.locator("[data-portfolio-preview]")).toContainText("Trail walking");
  await expect(page.locator('[data-portfolio-assignment="assignment-1"]')).toContainText("Needs more detail");

  await page.evaluate(() => {
    const pilotWindow = window as PilotWindow;
    pilotWindow.__pe10PrintCount = 0;
    window.print = () => { pilotWindow.__pe10PrintCount = (pilotWindow.__pe10PrintCount || 0) + 1; };
  });
  await page.locator("[data-print-portfolio]").click();
  const portfolioPrint = await page.evaluate(() => ({
    calls: (window as PilotWindow).__pe10PrintCount,
    title: document.querySelector("#print-root h1")?.textContent || "",
    content: document.querySelector("#print-root")?.textContent || ""
  }));
  expect(portfolioPrint.calls).toBe(1);
  expect(portfolioPrint.title).toContain("Portfolio");
  expect(portfolioPrint.content).toContain("Trail walking");
  expect(portfolioPrint.content).toContain("Personal Activity and Safety Plan");
  expect(portfolioPrint.content).toContain("Needs more detail");
  expect(portfolioPrint.content).not.toContain("Movement Skill and Cooperation Observation");
  expect(portfolioPrint.content).not.toContain("Save and move your work");

  await goToRoute(page, "activity-log");
  await page.locator("[data-edit-entry]").click();
  await page.locator('input[name="durationMinutes"]').fill("305");
  await page.locator("[data-save-entry]").click();
  await expect(page.locator("[data-log-hours]")).toHaveText("5.1");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-log-hours]")).toHaveText("5.1");

  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("[data-delete-entry]").click();
  await expect(page.locator("[data-log-table-body] tr")).toHaveCount(0);
  await expect(page.locator("[data-log-hours]")).toHaveText("0.0");
  expect(failures).toEqual([]);
});

test("@pe10-online-pilot corrupt saved state opens safely without silently replacing the source text", async ({ page }) => {
  test.setTimeout(120_000);
  await openDirectLearner(page);
  const corrupt = "{this is not valid JSON";
  await page.evaluate(({ key, value }) => window.localStorage.setItem(key, value), { key: STORAGE_KEY, value: corrupt });
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-storage-status]")).toBeVisible();
  await expect(page.locator("[data-storage-status]")).toContainText("could not be read");
  await expect(page.locator("[data-overview-hours]")).toHaveText("0.0 of 50");
  await page.waitForTimeout(350);
  expect(await page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY)).toBe(corrupt);
});
