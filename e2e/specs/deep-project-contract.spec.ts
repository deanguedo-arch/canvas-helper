import { test, expect, type FrameLocator } from "@playwright/test";

import { loadProjectContractBySlug, type ProjectE2EContract } from "../lib/load-project-contract";
import { openProjectInStudio } from "../lib/project-open";

const ROOT_DIR = process.cwd();
const PROJECT_ENV_SLUG = process.env.E2E_PROJECT_SLUG || "";

type Mode = "learner" | "archive";

type ModuleTarget = NonNullable<ProjectE2EContract["modulePassTargets"]>[number];

type VisibilityTarget = NonNullable<ProjectE2EContract["visibilityChecks"]>[number];

function toModeLabel(value?: string | null): Mode | null {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("archive")) return "archive";
  if (normalized.includes("learner")) return "learner";
  return null;
}

async function readModeFromIndicator(frame: FrameLocator): Promise<Mode | null> {
  const indicator = frame.getByTestId("mode-indicator");
  if (await indicator.isVisible()) {
    const text = await indicator.textContent();
    return toModeLabel(text);
  }
  return null;
}

async function setMode(frame: FrameLocator, contract: ProjectE2EContract, mode: Mode) {
  const toggle = frame.getByTestId("mode-toggle");
  if (await toggle.isVisible()) {
    const current = await readModeFromIndicator(frame);
    if (current && current !== mode) {
      await toggle.click();
      await expect(async () => {
        const next = await readModeFromIndicator(frame);
        if (next !== mode) {
          throw new Error(`Mode did not update to ${mode}.`);
        }
      }).toPass();
    }
    return;
  }

  if (!contract.modes?.enabled) return;

  const toggleName = contract.modes.toggleRoleName || "Show archive";
  if (mode === "archive") {
    await frame.getByRole("button", { name: toggleName }).click();
    if (contract.modes.archiveIndicator) {
      await expect(frame.getByText(contract.modes.archiveIndicator).first()).toBeVisible();
    }
  } else {
    const returnName = toggleName === "Show archive" ? "Hide admin-only" : toggleName;
    await frame.getByRole("button", { name: returnName }).click();
    if (contract.modes.learnerIndicator) {
      await expect(frame.getByText(contract.modes.learnerIndicator).first()).toBeVisible();
    }
  }
}

async function openLesson(frame: FrameLocator, target: ModuleTarget) {
  const search = frame.getByTestId("lesson-search");
  if (await search.isVisible()) {
    await search.fill(target.itemTitle);
  }

  const moduleToggle = frame.locator(
    `[data-testid="module-toggle"][data-module-title="${target.moduleTitle}"]`
  );
  if (await moduleToggle.first().isVisible()) {
    await moduleToggle.first().click();
  }

  const lessonItem = frame.locator(
    `[data-testid="lesson-item"][data-lesson-title="${target.itemTitle}"]`
  );
  await expect(lessonItem.first()).toBeVisible();
  await lessonItem.first().click();

  const lessonTitle = frame.getByTestId("lesson-title");
  if (await lessonTitle.isVisible()) {
    await expect(lessonTitle).toContainText(target.itemTitle);
  }
}

async function assertLessonVisibility(frame: FrameLocator, target: VisibilityTarget, shouldBeVisible: boolean) {
  const search = frame.getByTestId("lesson-search");
  if (await search.isVisible()) {
    await search.fill(target.itemTitle);
  }

  const moduleToggle = frame.locator(
    `[data-testid="module-toggle"][data-module-title="${target.moduleTitle}"]`
  );
  if (await moduleToggle.first().isVisible()) {
    await moduleToggle.first().click();
  }

  const lessonItem = frame.locator(
    `[data-testid="lesson-item"][data-lesson-title="${target.itemTitle}"]`
  );
  if (shouldBeVisible) {
    await expect(lessonItem.first()).toBeVisible();
  } else {
    const count = await lessonItem.count();
    if (count === 0) return;
    await expect(lessonItem.first()).toBeHidden();
  }
}

function resolveChecks(contract: ProjectE2EContract, target: ModuleTarget): string[] {
  const checks = new Set<string>();
  if (target.assertionProfile && contract.assertionProfiles?.[target.assertionProfile]) {
    for (const check of contract.assertionProfiles[target.assertionProfile].checks || []) {
      checks.add(check);
    }
  }
  for (const check of target.checks || []) {
    checks.add(check);
  }
  return Array.from(checks);
}

async function runChecks(frame: FrameLocator, checks: string[], contract: ProjectE2EContract) {
  for (const check of checks) {
    switch (check) {
      case "renderer-html":
        await expect(frame.getByTestId("renderer-html")).toBeVisible();
        break;
      case "renderer-assignment":
        await expect(frame.getByTestId("renderer-assignment")).toBeVisible();
        break;
      case "renderer-quiz":
        await expect(frame.getByTestId("renderer-quiz")).toBeVisible();
        break;
      case "renderer-pdf":
        await expect(frame.getByTestId("renderer-pdf")).toBeVisible();
        break;
      case "renderer-fallback":
        await expect(frame.getByTestId("renderer-fallback")).toBeVisible();
        break;
      case "renderer-video":
        await expect(frame.getByTestId("renderer-video")).toBeVisible();
        break;
      case "renderer-slide":
        await expect(frame.getByTestId("renderer-slide")).toBeVisible();
        break;
      case "section-mode": {
        const toggle = frame.getByTestId("section-mode-toggle");
        if (await toggle.isVisible()) {
          await toggle.click();
          await expect(frame.getByTestId("section-container").first()).toBeVisible();
        }
        break;
      }
      case "quick-checkpoints":
        await expect(frame.getByTestId("quick-checkpoints")).toBeVisible();
        break;
      case "quiz-answer": {
        const answerChoices = frame.getByTestId("quiz-answer-choice");
        if (await answerChoices.first().isVisible()) {
          await answerChoices.first().click();
        }
        break;
      }
      case "quiz-progress": {
        const progress = frame.getByTestId("quiz-progress");
        await expect(progress).toBeVisible();
        const pattern = contract.quiz?.progressPattern;
        if (pattern) {
          await expect(progress).toContainText(new RegExp(pattern));
        }
        break;
      }
      case "quiz-nav": {
        const navButtons = frame.getByTestId("quiz-question-button");
        const count = await navButtons.count();
        if (count > 1) {
          await navButtons.nth(1).click();
        }
        break;
      }
      case "quiz-next-question": {
        const next = frame.getByTestId("quiz-next-question");
        if (await next.isVisible()) {
          await next.click();
        }
        break;
      }
      case "node-nav": {
        const next = frame.getByTestId("node-nav-next");
        const prev = frame.getByTestId("node-nav-previous");
        if (await next.isVisible()) {
          await next.click();
        }
        if (await prev.isVisible()) {
          await prev.click();
        }
        break;
      }
      case "node-counter": {
        const counter = frame.getByTestId("node-counter");
        await expect(counter).toBeVisible();
        if (contract.navigation?.nodeCounterPattern) {
          await expect(counter).toContainText(new RegExp(contract.navigation.nodeCounterPattern));
        }
        break;
      }
      default:
        throw new Error(`Unknown e2e check: ${check}`);
    }
  }
}

test("@project deep project contract: selected slug", async ({ page }) => {
  test.setTimeout(120_000);
  test.skip(!PROJECT_ENV_SLUG, "Set E2E_PROJECT_SLUG to run project contract checks.");
  const contract = await loadProjectContractBySlug(ROOT_DIR, PROJECT_ENV_SLUG);

  const hasModuleTargets = contract.modulePassTargets?.length;
  const hasVisibilityChecks = contract.visibilityChecks?.length;
  test.skip(!hasModuleTargets && !hasVisibilityChecks, "No deep contract targets configured.");

  await openProjectInStudio(page, contract.projectSlug);
  const frame = page.frameLocator('[data-testid="workspace-preview-frame"]');

  if (contract.visibilityChecks?.length) {
    await setMode(frame, contract, "learner");
    for (const target of contract.visibilityChecks) {
      await assertLessonVisibility(frame, target, target.learnerVisible);
    }

    await setMode(frame, contract, "archive");
    for (const target of contract.visibilityChecks) {
      await assertLessonVisibility(frame, target, target.archiveVisible);
    }
  }

  if (contract.modulePassTargets?.length) {
    for (const target of contract.modulePassTargets) {
      const mode = target.mode || contract.assertionProfiles?.[target.assertionProfile || ""]?.mode;
      if (mode) {
        await setMode(frame, contract, mode);
      }

      await openLesson(frame, target);

      const checks = resolveChecks(contract, target);
      if (checks.length) {
        await runChecks(frame, checks, contract);
      }
    }
  }
});
