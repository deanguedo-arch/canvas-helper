import { test, expect } from "@playwright/test";

import {
  loadProjectContractBySlug,
  type ProjectE2EContract
} from "../lib/load-project-contract";
import { openProjectInStudio } from "../lib/project-open";

const ROOT_DIR = process.cwd();
const PROJECT_ENV_SLUG = process.env.E2E_PROJECT_SLUG || "";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function runContractChecks(contract: ProjectE2EContract, page: Parameters<typeof test>[0]["page"]) {
  await openProjectInStudio(page, contract.projectSlug);

  for (const testId of contract.requiredTestIds || []) {
    await expect(page.getByTestId(testId)).toBeVisible();
  }

  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');

  if (contract.modes?.enabled) {
    const toggleName = contract.modes.toggleRoleName || "Show archive";
    await workspaceFrame.getByRole("button", { name: toggleName }).click();

    if (contract.modes.archiveIndicator) {
      await expect(workspaceFrame.getByText(contract.modes.archiveIndicator).first()).toBeVisible();
    }

    const returnName = toggleName === "Show archive" ? "Hide admin-only" : toggleName;
    await workspaceFrame.getByRole("button", { name: returnName }).click();

    if (contract.modes.learnerIndicator) {
      await expect(workspaceFrame.getByText(contract.modes.learnerIndicator).first()).toBeVisible();
    }
  }

  if (contract.navigation?.enabled) {
    const nextName = contract.navigation.nextRoleName || "Next";
    const prevName = contract.navigation.previousRoleName || "Previous";

    await workspaceFrame.getByRole("button", { name: nextName }).click();
    await expect(workspaceFrame.getByRole("button", { name: prevName })).toBeEnabled();

    await workspaceFrame.getByRole("button", { name: prevName }).click();

    if (contract.navigation.nodeCounterPattern) {
      await expect(workspaceFrame.getByText(new RegExp(contract.navigation.nodeCounterPattern))).toBeVisible();
    }
  }

  if (contract.quiz?.enabled) {
    const lessonButton = workspaceFrame.getByRole("button", {
      name: new RegExp(escapeRegExp(contract.quiz.lessonTitle), "i")
    });
    if (!(await lessonButton.first().isVisible())) {
      const lessonSearch = workspaceFrame.getByPlaceholder("Search real lesson titles");
      if (await lessonSearch.isVisible()) {
        await lessonSearch.fill(contract.quiz.lessonTitle);
      }

      const moduleButtons = workspaceFrame.locator("button").filter({ hasText: /items in export/i });
      const moduleCount = await moduleButtons.count();
      for (let index = 0; index < moduleCount; index += 1) {
        await moduleButtons.nth(index).click();
      }
    }
    await lessonButton.first().click({ timeout: 10_000 });
    await expect(workspaceFrame.getByText("Assessment preview")).toBeVisible();

    if (contract.quiz.answerChoiceLabel) {
      await workspaceFrame.getByRole("button", { name: contract.quiz.answerChoiceLabel }).click();
    } else {
      await workspaceFrame.locator("div.mt-5.space-y-3 button").first().click();
    }

    const progressPattern = contract.quiz.progressPattern || "answered";
    await expect(workspaceFrame.getByText(new RegExp(progressPattern))).toBeVisible();

    const checkAnswerName = contract.quiz.checkAnswerRoleName || "Check answer";
    if (await workspaceFrame.getByRole("button", { name: checkAnswerName }).isVisible()) {
      await workspaceFrame.getByRole("button", { name: checkAnswerName }).click();
    }
  }

  if (contract.fallbackPanel?.enabled) {
    await expect(page.getByTestId("fallback-panel").first()).toBeVisible();
  }
}

test("@smoke core project contract: e2e-fixture", async ({ page }) => {
  const contract = await loadProjectContractBySlug(ROOT_DIR, "e2e-fixture");
  await runContractChecks(contract, page);
});

test("@project core project contract: selected slug", async ({ page }) => {
  test.skip(!PROJECT_ENV_SLUG, "Set E2E_PROJECT_SLUG to run project contract checks.");
  const contract = await loadProjectContractBySlug(ROOT_DIR, PROJECT_ENV_SLUG);
  await runContractChecks(contract, page);
});
