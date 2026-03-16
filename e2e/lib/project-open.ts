import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function openProjectInStudio(page: Page, slug: string) {
  await page.goto("/?e2e=1");
  await expect(page.getByTestId("studio-shell")).toBeVisible();

  const courseTab = page.getByTestId("course-studio-tab");
  if (await courseTab.isVisible()) {
    await courseTab.click();
  }

  const projectSelect = page.getByTestId("workspace-project-select");
  await expect(projectSelect).toBeVisible();
  await projectSelect.selectOption(slug);

  await expect(page.getByTestId("project-root")).toBeVisible();
  await expect(page.getByTestId("workspace-preview-frame")).toBeVisible();

  const refreshButton = page.getByTestId("workspace-refresh-button");
  if (await refreshButton.isVisible()) {
    await refreshButton.click();
  }
}
