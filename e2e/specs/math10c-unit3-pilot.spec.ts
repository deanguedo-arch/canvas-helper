import { expect, test } from "@playwright/test";

import { openProjectInStudio, reloadWorkspacePreview } from "../lib/project-open";

const SLUG = "math10c-unit3-pilot";
const PREVIEW = '[data-testid="workspace-preview-frame"]';

test("Math 10C pilot checks and retains the reviewed factoring work", async ({ page }) => {
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

test("Math 10C pilot keeps its learner route usable at phone width", async ({ page }) => {
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
