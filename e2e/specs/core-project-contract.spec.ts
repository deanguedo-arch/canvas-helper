import { test, expect } from "@playwright/test";

import {
  loadProjectContractBySlug,
  type ProjectE2EContract
} from "../lib/load-project-contract";
import { assertRequiredTestIds } from "../lib/contract-preflight";
import { openProjectInStudio } from "../lib/project-open";

const ROOT_DIR = process.cwd();
const PROJECT_ENV_SLUG = process.env.E2E_PROJECT_SLUG || "";
const PROJECT_MODE = process.env.E2E_PROJECT_MODE || "";
const REQUIRE_PROJECT_SLUG = PROJECT_MODE === "project-contract";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function runContractChecks(contract: ProjectE2EContract, page: Parameters<typeof test>[0]["page"]) {
  await openProjectInStudio(page, contract.projectSlug);

  await assertRequiredTestIds(page, contract.requiredTestIds || []);

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
    if (contract.quiz.moduleTitle) {
      const quizModulePanel = workspaceFrame
        .locator(`[data-testid="module-panel"][data-module-title="${contract.quiz.moduleTitle}"]`)
        .first();
      await quizModulePanel.getByTestId("module-toggle").click();
      if (await quizModulePanel.getByTestId("module-assignments-tab").count()) {
        await quizModulePanel.getByTestId("module-assignments-tab").click();
      }
    }

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
    if (!(await lessonButton.first().isVisible())) {
      const assignmentTabs = workspaceFrame.getByTestId("module-assignments-tab");
      const tabCount = await assignmentTabs.count();
      for (let index = 0; index < tabCount; index += 1) {
        await assignmentTabs.nth(index).click();
        if (await lessonButton.first().isVisible()) {
          break;
        }
      }
    }
    if (await lessonButton.first().isVisible()) {
      await lessonButton.first().click({ timeout: 10_000 });
    }
    await expect(workspaceFrame.getByTestId("renderer-quiz")).toBeVisible();

    if (contract.quiz.answerChoiceLabel) {
      await workspaceFrame.getByRole("button", { name: contract.quiz.answerChoiceLabel }).click();
    } else {
      await workspaceFrame.getByTestId("quiz-answer-choice").first().click();
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

  if (contract.moduleAssignments?.enabled) {
    const withAssignmentsTitle = contract.moduleAssignments.moduleWithAssignments;
    const withAssignmentsPanel = workspaceFrame
      .locator(`[data-testid="module-panel"][data-module-title="${withAssignmentsTitle}"]`)
      .first();
    await withAssignmentsPanel.getByTestId("module-toggle").click();
    await expect(withAssignmentsPanel.getByTestId("module-assignments-tab")).toBeVisible();
    await withAssignmentsPanel.getByTestId("module-assignments-tab").click();

    await expect(workspaceFrame.getByTestId("module-assignments-view")).toBeVisible();
    await expect(workspaceFrame.getByTestId("module-content-view")).toHaveCount(0);
    await expect(
      workspaceFrame.locator(
        '[data-testid="chapter-lesson-card"]:not([data-lesson-type="quiz"]):not([data-lesson-type="assignment"])'
      )
    ).toHaveCount(0);

    const withoutAssignmentsTitle = contract.moduleAssignments.moduleWithoutAssignments;
    if (withoutAssignmentsTitle) {
      const withoutAssignmentsPanel = workspaceFrame
        .locator(`[data-testid="module-panel"][data-module-title="${withoutAssignmentsTitle}"]`)
        .first();
      await withoutAssignmentsPanel.getByTestId("module-toggle").click();
      await expect(withoutAssignmentsPanel.getByTestId("module-assignments-tab")).toHaveCount(0);
      await expect(workspaceFrame.getByTestId("module-content-view")).toBeVisible();
    }
  }
}

test("@smoke core project contract: e2e-fixture", async ({ page }) => {
  const contract = await loadProjectContractBySlug(ROOT_DIR, "e2e-fixture");
  await runContractChecks(contract, page);
});

test("@project core project contract: selected slug", async ({ page }) => {
  if (!PROJECT_ENV_SLUG) {
    if (REQUIRE_PROJECT_SLUG) {
      throw new Error("Missing E2E_PROJECT_SLUG for project-contract run.");
    }
    test.skip(true, "Set E2E_PROJECT_SLUG to run project contract checks.");
    return;
  }
  const contract = await loadProjectContractBySlug(ROOT_DIR, PROJECT_ENV_SLUG);
  await runContractChecks(contract, page);
});
