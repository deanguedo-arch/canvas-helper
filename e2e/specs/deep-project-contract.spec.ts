import { test, expect, type FrameLocator, type Locator, type Page } from "@playwright/test";

import { loadProjectContractBySlug, type ProjectE2EContract } from "../lib/load-project-contract";
import { assertNonEmptyCertificationTargets, assertTextChanged } from "../lib/contract-assertions";
import { assertRequiredTestIds } from "../lib/contract-preflight";
import { openProjectInStudio } from "../lib/project-open";

const ROOT_DIR = process.cwd();
const PROJECT_ENV_SLUG = process.env.E2E_PROJECT_SLUG || "";
const PROJECT_MODE = process.env.E2E_PROJECT_MODE || "";
const REQUIRE_PROJECT_SLUG = PROJECT_MODE === "project-contract";

type Mode = "learner" | "archive";

type ModuleTarget = NonNullable<ProjectE2EContract["modulePassTargets"]>[number];

type VisibilityTarget = NonNullable<ProjectE2EContract["visibilityChecks"]>[number];

function toModeLabel(value?: string | null): Mode | null {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("archive")) return "archive";
  if (normalized.includes("learner")) return "learner";
  return null;
}

async function robustClick(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  try {
    await locator.click({ force: true });
  } catch {
    await locator.evaluate((element) => {
      (element as HTMLElement).click();
    });
  }
}

async function readIndicatorText(page: Page, frame: FrameLocator): Promise<string> {
  const frameIndicator = frame.getByTestId("mode-indicator");
  if ((await frameIndicator.count()) && (await frameIndicator.first().isVisible())) {
    return (await frameIndicator.first().textContent())?.trim() || "";
  }
  const pageIndicator = page.getByTestId("mode-indicator");
  if ((await pageIndicator.count()) && (await pageIndicator.first().isVisible())) {
    return (await pageIndicator.first().textContent())?.trim() || "";
  }
  return "";
}

async function readModeFromIndicator(page: Page, frame: FrameLocator): Promise<Mode | null> {
  const text = await readIndicatorText(page, frame);
  return text ? toModeLabel(text) : null;
}

async function setMode(page: Page, frame: FrameLocator, contract: ProjectE2EContract, mode: Mode) {
  if (!contract.modes?.enabled) return;

  const beforeText = await readIndicatorText(page, frame);
  const current = toModeLabel(beforeText);
  if (current === mode) return;

  const toggleName = contract.modes.toggleRoleName || "Show archive";
  const returnName = toggleName === "Show archive" ? "Hide admin-only" : toggleName;
  const primaryName = mode === "archive" ? toggleName : returnName;
  let toggleButton = frame.getByRole("button", { name: new RegExp(primaryName, "i") });
  if (!(await toggleButton.count())) {
    toggleButton = frame.getByRole("button", { name: /archive|admin-only/i });
  }

  await expect(toggleButton.first()).toBeVisible({ timeout: 15_000 });
  await toggleButton.first().click();

  await expect(async () => {
    const afterText = await readIndicatorText(page, frame);
    const next = toModeLabel(afterText);
    if (next !== mode) {
      throw new Error(`Mode did not update to ${mode}.`);
    }
  }).toPass();

  if (mode === "archive" && contract.modes.archiveIndicator) {
    const indicator = frame.getByTestId("mode-indicator");
    const pageIndicator = page.getByTestId("mode-indicator");
    if (await indicator.count()) {
      await expect(indicator).toContainText(contract.modes.archiveIndicator);
    } else if (await pageIndicator.count()) {
      await expect(pageIndicator).toContainText(contract.modes.archiveIndicator);
    } else {
      await expect(frame.getByText(contract.modes.archiveIndicator).first()).toBeVisible();
    }
  }

  if (mode === "learner" && contract.modes.learnerIndicator) {
    const indicator = frame.getByTestId("mode-indicator");
    const pageIndicator = page.getByTestId("mode-indicator");
    if (await indicator.count()) {
      await expect(indicator).toContainText(contract.modes.learnerIndicator);
    } else if (await pageIndicator.count()) {
      await expect(pageIndicator).toContainText(contract.modes.learnerIndicator);
    } else {
      await expect(frame.getByText(contract.modes.learnerIndicator).first()).toBeVisible();
    }
  }

  const afterText = await readIndicatorText(page, frame);
  if (beforeText && afterText) {
    assertTextChanged("Mode indicator", beforeText, afterText);
  }
}

async function openLesson(frame: FrameLocator, target: ModuleTarget) {
  const lessonTitle = frame.locator('[data-testid="lesson-title"]:visible').first();
  const beforeTitle = (await lessonTitle.isVisible()) ? (await lessonTitle.textContent())?.trim() || "" : "";

  const search = frame.getByTestId("lesson-search");
  if (await search.isVisible()) {
    await search.fill("");
  }

  const moduleToggle = frame.locator(
    `[data-testid="module-toggle"][data-module-title="${target.moduleTitle}"]`
  );
  if (await moduleToggle.count()) {
    await robustClick(moduleToggle.first());
  }

  const modulePanel = frame
    .locator(`[data-testid="module-panel"][data-module-title="${target.moduleTitle}"]`)
    .first();
  const assignmentTab = modulePanel.getByTestId("module-assignments-tab");
  const contentTab = modulePanel.getByRole("button", { name: /content/i });
  const lessonItemSelector = `[data-testid="lesson-item"][data-lesson-title="${target.itemTitle}"]`;
  let lessonItem = frame.locator(lessonItemSelector);

  if (!(await lessonItem.count()) && (await assignmentTab.count())) {
    await robustClick(assignmentTab.first());
    lessonItem = frame.locator(lessonItemSelector);
  }

  if (!(await lessonItem.count()) && (await contentTab.count())) {
    await robustClick(contentTab.first());
    lessonItem = frame.locator(lessonItemSelector);
  }

  if (await lessonItem.count()) {
    await expect(lessonItem.first()).toBeVisible({ timeout: 15_000 });
    await lessonItem.first().click();
  } else {
    const lessonByText = frame.getByText(target.itemTitle, { exact: false });
    await expect(lessonByText.first()).toBeVisible({ timeout: 15_000 });
    await lessonByText.first().click();
  }

  if (await lessonTitle.isVisible()) {
    const afterTitle = (await lessonTitle.textContent())?.trim() || "";
    if (beforeTitle && afterTitle && beforeTitle !== afterTitle) {
      assertTextChanged("Lesson title", beforeTitle, afterTitle);
    }
  }

  if (await lessonItem.count()) {
    const activeAttr = await lessonItem.first().getAttribute("data-active");
    if (activeAttr !== null) {
      await expect(async () => {
        const value = await lessonItem.first().getAttribute("data-active");
        if (value !== "true") {
          throw new Error(`Lesson "${target.itemTitle}" did not become active.`);
        }
      }).toPass();
    }
  }

  if (await search.isVisible()) {
    await search.fill("");
  }
}

async function assertLessonVisibility(frame: FrameLocator, target: VisibilityTarget, shouldBeVisible: boolean) {
  const search = frame.getByTestId("lesson-search");
  if (await search.isVisible()) {
    await search.fill("");
  }

  const moduleToggle = frame.locator(
    `[data-testid="module-toggle"][data-module-title="${target.moduleTitle}"]`
  );
  if (await moduleToggle.first().isVisible()) {
    await robustClick(moduleToggle.first());
  }

  const modulePanel = frame
    .locator(`[data-testid="module-panel"][data-module-title="${target.moduleTitle}"]`)
    .first();
  const assignmentTab = modulePanel.getByTestId("module-assignments-tab");
  const contentTab = modulePanel.getByRole("button", { name: /content/i });
  const lessonItemSelector = `[data-testid="lesson-item"][data-lesson-title="${target.itemTitle}"]`;
  let lessonItem = frame.locator(lessonItemSelector);
  if (!(await lessonItem.count()) && (await assignmentTab.count())) {
    await robustClick(assignmentTab.first());
    lessonItem = frame.locator(lessonItemSelector);
  }
  if (!(await lessonItem.count()) && (await contentTab.count())) {
    await robustClick(contentTab.first());
    lessonItem = frame.locator(lessonItemSelector);
  }

  const count = await lessonItem.count();
  if (shouldBeVisible) {
    if (count === 0) {
      throw new Error(`Expected lesson "${target.itemTitle}" to be visible but it was not found.`);
    }
    await expect(lessonItem.first()).toBeVisible();
  } else {
    if (count === 0) return;
    if (await lessonItem.first().isVisible()) {
      throw new Error(`Expected lesson "${target.itemTitle}" to be hidden but it was visible.`);
    }
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
          const containers = frame.getByTestId("section-container");
          const beforeCount = await containers.count();
          const beforeVisible = beforeCount > 0 ? await containers.first().isVisible() : false;
          await toggle.click();
          const afterCount = await containers.count();
          if (afterCount === 0) {
            throw new Error("Section mode toggle did not render any section containers.");
          }
          if (beforeCount > 0 && beforeVisible) {
            await expect(async () => {
              const afterVisible = await containers.first().isVisible();
              if (afterVisible === beforeVisible) {
                throw new Error("Section mode toggle did not change section visibility.");
              }
            }).toPass();
          } else {
            await expect(containers.first()).toBeVisible();
          }
        }
        break;
      }
      case "quick-checkpoints":
        await expect(frame.getByTestId("quick-checkpoints")).toBeVisible();
        break;
      case "quiz-answer": {
        const answerChoices = frame.getByTestId("quiz-answer-choice");
        if (await answerChoices.first().isVisible()) {
          const progress = frame.getByTestId("quiz-progress");
          const before = (await progress.isVisible()) ? (await progress.textContent())?.trim() || "" : "";
          await answerChoices.first().click();
          if (await progress.isVisible()) {
            const after = (await progress.textContent())?.trim() || "";
            if (before && after) {
              assertTextChanged("Quiz progress", before, after);
            }
          }
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
          let beforeIndex: number | null = null;
          for (let i = 0; i < count; i += 1) {
            if ((await navButtons.nth(i).getAttribute("data-current")) === "true") {
              beforeIndex = i;
              break;
            }
          }
          await navButtons.nth(1).click();
          await expect(async () => {
            let afterIndex: number | null = null;
            for (let i = 0; i < count; i += 1) {
              if ((await navButtons.nth(i).getAttribute("data-current")) === "true") {
                afterIndex = i;
                break;
              }
            }
            if (afterIndex === null) {
              throw new Error("Quiz navigation did not mark a current question.");
            }
            if (beforeIndex !== null && afterIndex === beforeIndex) {
              throw new Error("Quiz navigation did not change the active question.");
            }
          }).toPass();
        }
        break;
      }
      case "quiz-next-question": {
        const next = frame.getByTestId("quiz-next-question");
        if (await next.isVisible()) {
          const navButtons = frame.getByTestId("quiz-question-button");
          const count = await navButtons.count();
          let beforeIndex: number | null = null;
          for (let i = 0; i < count; i += 1) {
            if ((await navButtons.nth(i).getAttribute("data-current")) === "true") {
              beforeIndex = i;
              break;
            }
          }
          if (beforeIndex !== null && beforeIndex >= count - 1 && count > 1) {
            await navButtons.first().click();
            beforeIndex = 0;
          }
          await next.click();
          await expect(async () => {
            let afterIndex: number | null = null;
            for (let i = 0; i < count; i += 1) {
              if ((await navButtons.nth(i).getAttribute("data-current")) === "true") {
                afterIndex = i;
                break;
              }
            }
            if (afterIndex === null) {
              throw new Error("Quiz next-question did not mark a current question.");
            }
            if (beforeIndex !== null && afterIndex === beforeIndex) {
              throw new Error("Quiz next-question did not advance the active question.");
            }
          }).toPass();
        }
        break;
      }
      case "node-nav": {
        const next = frame.getByTestId("node-nav-next");
        const prev = frame.getByTestId("node-nav-previous");
        const counter = frame.getByTestId("node-counter");
        const before = (await counter.isVisible()) ? (await counter.textContent())?.trim() || "" : "";
        if (await next.isVisible() && await next.isEnabled()) {
          await next.click();
        } else if (await prev.isVisible() && await prev.isEnabled()) {
          await prev.click();
        } else {
          throw new Error("Node navigation controls are not enabled.");
        }
        const mid = (await counter.isVisible()) ? (await counter.textContent())?.trim() || "" : "";
        if (before && mid) {
          assertTextChanged("Node counter", before, mid);
        }
        if (await prev.isVisible() && await prev.isEnabled()) {
          await prev.click();
        } else if (await next.isVisible() && await next.isEnabled()) {
          await next.click();
        }
        const after = (await counter.isVisible()) ? (await counter.textContent())?.trim() || "" : "";
        if (mid && after && mid !== after) {
          assertTextChanged("Node counter", mid, after);
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
  if (!PROJECT_ENV_SLUG) {
    if (REQUIRE_PROJECT_SLUG) {
      throw new Error("E2E_PROJECT_SLUG is required for project-contract runs.");
    }
    test.skip("Set E2E_PROJECT_SLUG to run project contract checks.");
  }
  const contract = await loadProjectContractBySlug(ROOT_DIR, PROJECT_ENV_SLUG, {
    requireDeepTargets: REQUIRE_PROJECT_SLUG,
  });

  const hasModuleTargets = contract.modulePassTargets?.length;
  const hasVisibilityChecks = contract.visibilityChecks?.length;
  if (!hasModuleTargets && !hasVisibilityChecks) {
    if (REQUIRE_PROJECT_SLUG) {
      assertNonEmptyCertificationTargets(contract);
    } else {
      test.skip("No deep contract targets configured.");
    }
  }

  await openProjectInStudio(page, contract.projectSlug);
  const frame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await assertRequiredTestIds(page, contract.requiredTestIds || []);
  await expect(frame.getByTestId("module-toggle").first()).toBeVisible({ timeout: 20_000 });
  if (contract.modes?.enabled) {
    const modeToggle = frame.getByTestId("mode-toggle");
    if (await modeToggle.count()) {
      await expect(modeToggle.first()).toBeVisible();
    } else {
      const toggleName = contract.modes.toggleRoleName || "Show archive";
      await expect(frame.getByRole("button", { name: new RegExp(toggleName, "i") })).toBeVisible();
    }
  }

  if (contract.visibilityChecks?.length) {
    await setMode(page, frame, contract, "learner");
    for (const target of contract.visibilityChecks) {
      await assertLessonVisibility(frame, target, target.learnerVisible);
    }

    await setMode(page, frame, contract, "archive");
    for (const target of contract.visibilityChecks) {
      await assertLessonVisibility(frame, target, target.archiveVisible);
    }
  }

  if (contract.modulePassTargets?.length) {
    if (contract.modes?.enabled) {
      await setMode(page, frame, contract, "learner");
    }
    for (const target of contract.modulePassTargets) {
      const mode = target.mode || contract.assertionProfiles?.[target.assertionProfile || ""]?.mode;
      if (mode) {
        await setMode(page, frame, contract, mode);
      }

      await openLesson(frame, target);

      const checks = resolveChecks(contract, target);
      if (checks.length) {
        await runChecks(frame, checks, contract);
      }
    }
  }
});
