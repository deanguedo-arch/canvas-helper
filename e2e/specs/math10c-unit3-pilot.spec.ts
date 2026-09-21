import { expect, test } from "@playwright/test";

import { openProjectInStudio, reloadWorkspacePreview } from "../lib/project-open";

const SLUG = "math10c-unit3-pilot";
const PREVIEW = '[data-testid="workspace-preview-frame"]';

const LESSON_ROUTES = ["u3-31", "u3-32", "u3-33", "u3-34", "u3-35", "u3-36", "u3-37", "u3-38"];
const SUPPORT_ROUTES = [
  "u3-practice",
  "u3-mixed",
  "u3-errors",
  "u3-review",
  "u3-reference",
  "u3-number-lab",
  "u3-expansion-lab",
  "u3-vocab",
  "u3-work",
  "u3-resources",
  "u3-support-library",
  "u3-transfer",
];

test("Math 10C review candidate reaches all eight lesson routes and supporting pages", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);

  await expect(frame.locator("#progress-count")).toContainText("of 8 lesson checkpoints");

  for (const route of [...LESSON_ROUTES, ...SUPPORT_ROUTES]) {
    await frame.locator(`.course-nav a[href="#${route}"]`).first().evaluate((link: HTMLAnchorElement) => link.click());
    await expect(frame.locator(`#${route}`)).toBeVisible();
  }

  await frame.locator('.course-nav a[href="#u3-overview"]').first().evaluate((link: HTMLAnchorElement) => link.click());
  await expect(frame.locator("#u3-overview")).toBeVisible();
  await expect(frame.locator("#u3-overview")).toContainText("Your route through Chapter 3");
});

test("Math 10C review candidate records lesson checks toward eight checkpoints", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);

  await frame.locator('.course-nav a[href="#u3-31"]').first().click();
  await expect(frame.locator("#u3-31")).toBeVisible();

  const answer = frame.locator("#answer-c31-p1");
  await answer.fill("72");
  await frame.locator('[data-check="c31"]').click();
  await expect(frame.locator('[data-feedback="c31"]')).toContainText("Correct");

  await frame.locator('[data-reason="3.1"]').fill("The lights repeat together, so this needs the least common multiple.");
  await frame.locator('[data-record="3.1"]').click();
  await expect(frame.locator('[data-check-status="3.1"]')).toContainText("Lesson check recorded");
  await expect(frame.locator("#progress-count")).toContainText("1 of 8 lesson checkpoints");

  const counts = await frame.locator("body").evaluate(() => {
    const pilot = (window as typeof window & { MathPilotSlice?: any }).MathPilotSlice;
    const completeTrig = {
      side: "BC",
      adjacent: "AB",
      hypotenuse: "AC",
      ratio: "tan",
      angle: "correct",
      angleRaw: "26.6 degrees",
      aa: [[1, "26.6 degrees", "correct", 0, {}]],
      length: "sin",
      lengthStatus: "correct",
      lengthRaw: "5 m",
      la: [[1, "5 m", "correct", 0, {}]],
      reason: "Sine uses opposite over hypotenuse.",
    };
    return {
      triangleAlone: pilot.pilotProgress([], completeTrig).count,
      lessonPlusTriangle: pilot.pilotProgress(["3.1"], completeTrig).count,
      triangleGate: pilot.isTriangleComplete(completeTrig),
      requiredIds: pilot.REQUIRED_IDS,
      total: pilot.TOTAL_CHECKPOINTS,
    };
  });
  expect(counts.triangleGate).toBe(true);
  expect(counts.triangleAlone).toBe(0);
  expect(counts.lessonPlusTriangle).toBe(1);
  expect(counts.requiredIds).toEqual([
    "u3-check-31",
    "u3-check-32",
    "u3-check-33",
    "u3-check-34",
    "u3-check-35",
    "u3-check-36",
    "u3-check-37",
    "u3-check-38",
  ]);
  expect(counts.total).toBe(8);

  await frame.locator('.course-nav a[href="#u3-transfer"]').first().evaluate((link: HTMLAnchorElement) => link.click());
  await expect(frame.locator("#u3-transfer")).toBeVisible();
  await expect(frame.locator("#u3-transfer")).toContainText("Optional lab");
  await expect(frame.locator("#progress-count")).toContainText("1 of 8 lesson checkpoints");
});

test("Math 10C review candidate checks and retains the reviewed factoring work", async ({ page }) => {
  await openProjectInStudio(page, SLUG);
  let frame = page.frameLocator(PREVIEW);

  await frame.locator('a[href="#u3-35"]').first().click();
  await expect(frame.locator("#u3-35")).toBeVisible();

  const task = frame.locator('[data-question="g35"]').first();
  const answer = task.locator('[data-answer="g35"]');
  await answer.fill("x^2 + 3x + 4x + 12");
  await task.locator('[data-check="g35"]').click();

  await expect(task.locator('[data-feedback="g35"]')).toContainText("Correct for this step");
  await expect(task.locator('[data-feedback="g35"]')).toContainText("middle-term split is correct");
  await expect(task.locator("[data-history-status]")).toContainText("x^2 + 3x + 4x + 12");
  await expect(frame.locator("#save-message")).toContainText(/Saved|saved/u);

  await reloadWorkspacePreview(page, SLUG);
  frame = page.frameLocator(PREVIEW);
  await expect(frame.locator('#u3-35 [data-question="g35"] [data-answer="g35"]')).toHaveValue(
    "x^2 + 3x + 4x + 12"
  );

  const restoredTask = frame.locator('#u3-35 [data-question="g35"]').first();
  await restoredTask.locator('[data-answer="g35"]').fill("x(x + 3) + 4(x + 3) = (x + 3)(x + 4)");
  await restoredTask.locator('[data-check="g35"]').click();
  await expect(restoredTask.locator('[data-feedback="g35"]')).toContainText("Correct for this step");
  await expect(restoredTask.locator('[data-feedback="g35"]')).toContainText("Both sides match the target polynomial");
  await expect(restoredTask.locator("[data-history-status]")).toContainText("x(x + 3) + 4(x + 3)");

  await frame.locator("#reference-open").click();
  await expect(frame.locator("#reference-panel")).toBeVisible();
  await frame.locator("#reference-close").click();
  await expect(frame.locator("#reference-panel")).toBeHidden();
});

test("Math 10C review candidate keeps its learner route usable at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);

  await expect(frame.locator("#menu-open")).toBeVisible();
  await frame.locator("#menu-open").click();
  await expect(frame.locator("body")).toHaveClass(/nav-open/u);
  await frame.locator('a[href="#u3-35"]').first().click();
  await expect(frame.locator("#u3-35")).toBeVisible();
  await expect(frame.locator('#u3-35 [data-question="g35"] [data-answer="g35"]')).toBeVisible();
});

test("Math 10C recovery stays readable beside the navigation", async ({ page }) => {
  await page.addInitScript(() => {
    (window as typeof window & { __canvasHelperScorm?: unknown }).__canvasHelperScorm = {
      connectionState: () => "connected",
      scopeKey: (key: string) => `${key}:e2e`,
      learner: () => "recovery-layout-test",
      readCourseState: () => null,
      registerCourse: () => undefined,
      failCourseSave: () => undefined,
    };
  });
  await openProjectInStudio(page, SLUG);
  const frame = page.frameLocator(PREVIEW);

  await frame.locator('a[href="#u3-35"]').first().click();
  await frame.locator('#u3-35 [data-question="g35"] [data-answer="g35"]').fill("x^2 + 3x + 4x + 12");

  const recovery = frame.locator("#recovery-panel");
  await expect(recovery).toBeVisible();
  await expect(recovery).toContainText("This appears only when saving is interrupted");
  await expect(recovery.locator("textarea").first()).toBeHidden();

  const sidebarBox = await frame.locator("#unit-sidebar").boundingBox();
  const recoveryBox = await recovery.boundingBox();
  expect(sidebarBox).not.toBeNull();
  expect(recoveryBox).not.toBeNull();
  expect(recoveryBox!.x).toBeGreaterThanOrEqual(sidebarBox!.x + sidebarBox!.width);

  await recovery.locator("details").first().locator("summary").click();
  await expect(recovery.locator("textarea").first()).toBeVisible();
});
