import { expect, test } from "@playwright/test";
import type { FrameLocator, Page } from "@playwright/test";

import { openProjectInStudio, reloadWorkspacePreview } from "../lib/project-open.js";

const PROJECT_SLUG = "how-assessment-works";
const STORAGE_KEY = "canvas-helper:how-assessment-works:state:v1";

const evidenceAnswers = {
  "final-response": "product",
  "planning-notes": "process",
  "revision-note": "process",
  "choice-explanation": "defence",
  "finished-presentation": "product",
  "new-application": "defence"
} as const;

const readinessAnswers = {
  "practice-gap": "targeted-practice",
  "teacher-checkin": "explain-choice"
} as const;

function collectBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function clearLearnerState(page: Page) {
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await workspaceFrame.locator("body").evaluate((_, key) => {
    window.localStorage.removeItem(String(key));
    delete (window as typeof window & { __canvasHelperScorm?: unknown }).__canvasHelperScorm;
  }, STORAGE_KEY);
  await reloadWorkspacePreview(page, PROJECT_SLUG);
  return page.frameLocator('[data-testid="workspace-preview-frame"]');
}

async function chooseAnswers(
  workspaceFrame: FrameLocator,
  answers: Record<string, string>
) {
  for (const [name, value] of Object.entries(answers)) {
    await workspaceFrame
      .locator(`input[type="radio"][name="${name}"][value="${value}"]`)
      .check();
  }
}

test("@how-assessment-works retries incorrect work and reconciles delayed SCORM completion", async ({
  page
}) => {
  await openProjectInStudio(page, PROJECT_SLUG);
  const workspaceFrame = await clearLearnerState(page);
  const browserErrors = collectBrowserErrors(page);

  const finishButton = workspaceFrame.getByRole("button", { name: "Finish unit" });
  await expect(finishButton).toBeDisabled();
  await expect(workspaceFrame.getByTestId("assessment-progress")).toContainText(
    "0 of 3 activities complete"
  );

  await workspaceFrame
    .locator('input[name="final-response"][value="process"]')
    .check();
  await workspaceFrame.getByRole("button", { name: "Check my classifications" }).click();
  await expect(workspaceFrame.locator("#evidence-status")).toContainText(
    "You answered 1 of 6 examples"
  );
  await expect(workspaceFrame.locator("#feedback-final-response")).toContainText(
    "finished response is the Product"
  );
  await expect(finishButton).toBeDisabled();

  await chooseAnswers(workspaceFrame, evidenceAnswers);
  await workspaceFrame.getByRole("button", { name: "Check my classifications" }).click();
  await expect(workspaceFrame.locator("#evidence-status")).toContainText(
    "Evidence activity complete"
  );

  await workspaceFrame
    .locator('input[name="practice-gap"][value="submit-now"]')
    .check();
  await workspaceFrame
    .locator('input[name="teacher-checkin"][value="repeat-product"]')
    .check();
  await workspaceFrame.getByRole("button", { name: "Check my decisions" }).click();
  await expect(workspaceFrame.locator("#readiness-status")).toContainText(
    "0 of 2 decisions is ready"
  );
  await expect(workspaceFrame.locator("#feedback-practice-gap")).toContainText(
    "Not ready yet"
  );
  await expect(finishButton).toBeDisabled();

  await chooseAnswers(workspaceFrame, readinessAnswers);
  await workspaceFrame.getByRole("button", { name: "Check my decisions" }).click();
  await expect(workspaceFrame.locator("#readiness-status")).toContainText(
    "Readiness scenarios complete"
  );
  await expect(workspaceFrame.getByTestId("assessment-progress")).toContainText(
    "2 of 3 activities complete"
  );

  for (const name of ["criteria", "process", "defence"]) {
    await workspaceFrame.locator(`input[type="checkbox"][name="${name}"]`).check();
  }
  await expect(finishButton).toBeDisabled();
  await workspaceFrame.locator('input[type="checkbox"][name="support"]').check();
  await expect(finishButton).toBeEnabled();
  await expect(workspaceFrame.getByTestId("assessment-progress")).toContainText(
    "3 of 3 activities complete"
  );

  await finishButton.click();
  await expect(workspaceFrame.getByTestId("completion-status")).toContainText(
    "Complete. Your progress is saved"
  );
  const completedState = await workspaceFrame.locator("body").evaluate((_, key) => {
    return JSON.parse(window.localStorage.getItem(String(key)) || "{}") as {
      completedAt?: string;
    };
  }, STORAGE_KEY);
  expect(completedState.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

  await workspaceFrame.locator("body").evaluate(() => {
    const testWindow = window as typeof window & {
      __assessmentCompletionCalls?: number;
      __canvasHelperScorm?: {
        markCompleted: () => boolean;
        saveAndExit: () => boolean;
      };
    };
    testWindow.__assessmentCompletionCalls = 0;
    testWindow.__canvasHelperScorm = {
      markCompleted: () => {
        testWindow.__assessmentCompletionCalls =
          (testWindow.__assessmentCompletionCalls ?? 0) + 1;
        return true;
      },
      saveAndExit: () => true
    };
    window.dispatchEvent(new CustomEvent("canvas-helper:scorm-ready"));
  });

  await expect
    .poll(() =>
      workspaceFrame.locator("body").evaluate(
        () =>
          (window as typeof window & { __assessmentCompletionCalls?: number })
            .__assessmentCompletionCalls
      )
    )
    .toBe(1);
  await expect(workspaceFrame.locator("body")).toHaveClass(/scorm-ready/);
  await expect(workspaceFrame.locator("#save-exit")).toHaveText("Save and Exit");
  expect(browserErrors).toEqual([]);
});

test("@how-assessment-works restores theme, calculator, answers, checklist, and last step", async ({
  page
}) => {
  await openProjectInStudio(page, PROJECT_SLUG);
  let workspaceFrame = await clearLearnerState(page);
  const browserErrors = collectBrowserErrors(page);

  await workspaceFrame.locator("#theme-toggle").click();
  await workspaceFrame.locator("#product-weight").fill("60");
  await workspaceFrame.locator("#product-mark").fill("92");
  await workspaceFrame.locator("#process-mark").fill("76");
  await workspaceFrame.locator("#defence-mark").fill("68");
  await workspaceFrame
    .locator('input[name="planning-notes"][value="process"]')
    .check();
  await workspaceFrame
    .locator('input[name="practice-gap"][value="targeted-practice"]')
    .check();
  await workspaceFrame.locator('input[type="checkbox"][name="criteria"]').check();
  await expect(workspaceFrame.locator("#overall-mark")).toHaveText("84%");

  await reloadWorkspacePreview(page, PROJECT_SLUG);
  workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');

  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(workspaceFrame.locator("#product-weight")).toHaveValue("60");
  await expect(workspaceFrame.locator("#process-weight")).toHaveValue("20");
  await expect(workspaceFrame.locator("#defence-weight")).toHaveValue("20");
  await expect(workspaceFrame.locator("#product-mark")).toHaveValue("92");
  await expect(workspaceFrame.locator("#process-mark")).toHaveValue("76");
  await expect(workspaceFrame.locator("#defence-mark")).toHaveValue("68");
  await expect(workspaceFrame.locator("#overall-mark")).toHaveText("84%");
  await expect(
    workspaceFrame.locator('input[name="planning-notes"][value="process"]')
  ).toBeChecked();
  await expect(
    workspaceFrame.locator('input[name="practice-gap"][value="targeted-practice"]')
  ).toBeChecked();
  await expect(
    workspaceFrame.locator('input[type="checkbox"][name="criteria"]')
  ).toBeChecked();
  await expect(workspaceFrame.locator("#resume-panel")).toBeVisible();

  const restoredState = await workspaceFrame.locator("body").evaluate((_, key) => {
    return JSON.parse(window.localStorage.getItem(String(key)) || "{}") as {
      theme?: string;
      lastStep?: string;
      marks?: Record<string, number>;
      weights?: Record<string, number>;
      checklist?: Record<string, boolean>;
    };
  }, STORAGE_KEY);
  expect(restoredState).toMatchObject({
    theme: "dark",
    lastStep: "before-submit",
    marks: { product: 92, process: 76, defence: 68 },
    weights: { product: 60, process: 20, defence: 20 },
    checklist: { criteria: true, process: false, defence: false, support: false }
  });

  await workspaceFrame.getByRole("button", { name: "Continue where I left off" }).click();
  await expect(workspaceFrame.locator("#before-submit-title")).toBeFocused();
  await expect(workspaceFrame.getByTestId("completion-status")).toContainText(
    "Complete the evidence activity, readiness scenarios, readiness checklist"
  );
  expect(browserErrors).toEqual([]);
});

test("@how-assessment-works direct learner view fits 390px and manages keyboard focus", async ({
  page
}) => {
  const browserErrors = collectBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/preview/workspace/${PROJECT_SLUG}/index.html`);
  await expect(page.getByTestId("assessment-root")).toBeVisible();
  await expect(page.locator("video")).toHaveCount(2);
  await expect(page.getByTestId("inspire-video")).toHaveAttribute(
    "src",
    "./assets/media/inspire-the-work.mp4"
  );
  await expect(page.getByTestId("process-checkin-video")).toHaveAttribute(
    "src",
    "./assets/media/the-process-check-in.mp4"
  );
  for (const video of [
    page.getByTestId("inspire-video"),
    page.getByTestId("process-checkin-video")
  ]) {
    await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.readyState)).toBeGreaterThan(0);
  }

  for (const sectionId of ["journey", "pillars", "evidence", "readiness", "before-submit"]) {
    await page.locator(`#${sectionId}`).scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page.evaluate(() => ({
          viewport: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth
        }))
      )
      .toEqual({ viewport: 390, scrollWidth: 390 });
  }

  await page.locator("#theme-toggle").focus();
  await expect(page.locator("#theme-toggle")).toBeFocused();
  await expect(page.locator("#theme-toggle")).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.locator("#focus-toggle").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("body")).toHaveClass(/focus-mode/);
  await expect(page.locator("#focus-exit")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("body")).not.toHaveClass(/focus-mode/);
  await expect(page.locator("#focus-toggle")).toBeFocused();

  const processWeight = page.locator("#process-weight");
  await processWeight.focus();
  await page.keyboard.press("Home");
  await expect(processWeight).toHaveValue("0");
  await expect(processWeight).toHaveAttribute("aria-valuetext", "0 percent");
  let weightTotal = await page
    .locator("#mark-form")
    .evaluate(() =>
      ["product", "process", "defence"].reduce(
        (total, key) =>
          total + Number((document.getElementById(`${key}-weight`) as HTMLInputElement).value),
        0
      )
    );
  expect(weightTotal).toBe(100);
  await page.keyboard.press("End");
  await expect(processWeight).toHaveValue("25");
  await expect(processWeight).toHaveAttribute("aria-valuetext", "25 percent");
  weightTotal = await page
    .locator("#mark-form")
    .evaluate(() =>
      ["product", "process", "defence"].reduce(
        (total, key) =>
          total + Number((document.getElementById(`${key}-weight`) as HTMLInputElement).value),
        0
      )
    );
  expect(weightTotal).toBe(100);

  const comparison = page.locator(".answer-comparison");
  const summary = comparison.locator("summary");
  await summary.focus();
  await expect(summary).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(comparison).toHaveAttribute("open", "");
  expect(browserErrors).toEqual([]);
});
