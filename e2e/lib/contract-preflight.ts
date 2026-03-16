import type { FrameLocator, Page } from "@playwright/test";

type TestIdSource = Pick<Page, "getByTestId"> | Pick<FrameLocator, "getByTestId">;

export async function assertRequiredTestIds(target: TestIdSource, requiredTestIds: string[]) {
  if (!requiredTestIds.length) return;

  const missing: string[] = [];
  for (const testId of requiredTestIds) {
    const locator = target.getByTestId(testId);
    if (!(await locator.first().isVisible())) {
      missing.push(testId);
    }
  }

  if (missing.length) {
    throw new Error(`Missing required test ids: ${missing.join(", ")}`);
  }
}
