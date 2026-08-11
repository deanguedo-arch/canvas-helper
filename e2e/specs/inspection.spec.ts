import { readFile } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { openProjectInStudio, waitForWorkspacePreviewReady } from "../lib/project-open";

test("@inspection Studio uses an isolated preview origin and keeps annotation details simple", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");

  const previewFrame = page.getByTestId("workspace-preview-frame");
  const previewSrc = await previewFrame.getAttribute("src");
  expect(previewSrc).toBeTruthy();
  expect(new URL(previewSrc as string, page.url()).origin).not.toBe(new URL(page.url()).origin);

  await page.getByTestId("layout-split-toggle").click();
  const referenceSrc = await page.getByTestId("reference-preview-frame").getAttribute("src");
  expect(referenceSrc).toBeTruthy();
  expect(new URL(referenceSrc as string, page.url()).origin).not.toBe(new URL(page.url()).origin);

  await page.getByTestId("inspect-toggle").click();
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-bridge-ready", "true");
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  await expect(page.frameLocator('[data-testid="reference-preview-frame"]').locator("html")).not.toHaveAttribute(
    "data-canvas-helper-inspect-active",
    "true"
  );

  await heading.evaluate((element, parentOrigin) => {
    window.parent.postMessage(
      {
        protocol: "canvas-helper.preview",
        version: 1,
        type: "preview-inspect-selected",
        payload: {
          nodeId: element.getAttribute("data-canvas-helper-inspect-node"),
          visibleText: "forged selection",
          tagName: "h1",
          role: "",
          testId: "",
          geometry: { x: 0, y: 0, width: 1, height: 1 }
        }
      },
      parentOrigin
    );
    element.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: 1, clientY: 1 }));
  }, new URL(page.url()).origin);
  await expect(page.getByTestId("inspection-selection-summary")).toHaveCount(0);

  const headingBounds = await heading.boundingBox();
  expect(headingBounds).toBeTruthy();
  await page.mouse.click(
    (headingBounds?.x ?? 0) + (headingBounds?.width ?? 0) / 2,
    (headingBounds?.y ?? 0) + (headingBounds?.height ?? 0) / 2
  );

  await expect(page.getByTestId("inspection-panel")).toBeVisible();
  await expect(page.getByTestId("inspection-selection-summary")).toContainText("E2E Fixture Workspace");
  await expect(page.getByTestId("inspection-resolution")).toHaveCount(0);
  await expect(page.getByTestId("inspection-packet")).toHaveCount(0);
  await expect(page.getByTestId("add-to-review-set")).toBeDisabled();
  await page.getByTestId("inspection-teacher-note").fill("Make this heading clearer.");
  await expect(page.getByTestId("add-to-review-set")).toBeEnabled();
  await page.getByTestId("annotation-mode-bar").getByRole("button", { name: "Done" }).click();
  await expect(page.getByTestId("inspect-toggle")).toHaveText("Annotate");
  await expect(workspaceFrame.locator("html")).not.toHaveAttribute("data-canvas-helper-inspect-active", "true");
});

test("@inspection keyboard selection creates a handoff without activating the learner control", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("inspect-toggle").click();

  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  const learnerControl = workspaceFrame.getByRole("button", { name: "Fixture Module" });
  await learnerControl.focus();
  await learnerControl.press("Enter");

  await expect(page.getByTestId("inspection-panel")).toBeVisible();
  await expect(page.getByTestId("inspection-selection-summary")).toContainText("Fixture Module");
  await learnerControl.press("Escape");
  await expect(page.getByTestId("inspect-toggle")).toHaveText("Annotate");
  await expect(workspaceFrame.locator("html")).not.toHaveAttribute("data-canvas-helper-inspect-active", "true");
});

test("@inspection standalone preview can collect and copy the shared Review Set", async ({ page }) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await openProjectInStudio(page, "e2e-fixture");
  const studioUrl = page.url();
  const previewPagePromise = page.waitForEvent("popup");

  await page.getByTestId("open-workspace-preview-toggle").click();
  const previewPage = await previewPagePromise;
  await previewPage.waitForLoadState("domcontentloaded");

  await expect(page).toHaveURL(studioUrl);
  await expect(page.getByTestId("studio-shell")).toBeVisible();
  await expect(previewPage).toHaveURL(/\/standalone-preview\?target=/);
  await expect(previewPage).not.toHaveURL(/canvas-helper-inspect-session/);
  await expect(previewPage).not.toHaveURL(/canvas-helper-inspect-rejoin/);
  const standaloneCourse = previewPage.frameLocator('[data-canvas-helper-standalone-course="true"]');
  const previewTools = previewPage.locator('[data-canvas-helper-preview-controls="true"]');
  const previewInspect = previewPage.locator('[data-canvas-helper-preview-inspect="true"]');
  const previewStatus = previewPage.locator('[data-canvas-helper-preview-inspect-status="true"]');
  await expect(previewTools).toBeVisible();
  await expect(previewStatus).toContainText("Connected to Studio");
  await expect(previewInspect).toHaveAttribute("aria-pressed", "false");
  await previewInspect.click();
  await expect(previewInspect).toHaveAttribute("aria-pressed", "true");
  await expect(previewPage.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  await expect(standaloneCourse.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  await expect(page.getByTestId("inspect-toggle")).toHaveText("Annotating");

  const standaloneHeading = standaloneCourse.getByRole("heading", { name: "E2E Fixture Workspace" });
  const standaloneHeadingBounds = await standaloneHeading.boundingBox();
  expect(standaloneHeadingBounds).toBeTruthy();
  await previewPage.mouse.click(
    (standaloneHeadingBounds?.x ?? 0) + (standaloneHeadingBounds?.width ?? 0) / 2,
    (standaloneHeadingBounds?.y ?? 0) + (standaloneHeadingBounds?.height ?? 0) / 2
  );
  await expect(previewStatus).toContainText("Selection ready");
  await expect(page.getByTestId("inspection-panel")).toBeVisible();
  await expect(page.getByTestId("inspection-selection-summary")).toContainText("E2E Fixture Workspace");

  const previewReviewPanel = previewPage.locator('[data-canvas-helper-preview-review-panel="true"]');
  await expect(previewReviewPanel).toBeVisible();
  await previewPage.locator('[data-canvas-helper-preview-review-note="true"]').fill("Make this opening easier to understand.");
  const previewCapture = previewPage.locator('[data-canvas-helper-preview-review-capture="true"]');
  await previewCapture.click();
  await expect(previewCapture).toContainText("1/3");
  await previewPage.locator('[data-canvas-helper-preview-review-save="true"]').click();
  await expect(previewPage.locator('[data-canvas-helper-preview-review-item="true"]')).toHaveCount(1);
  await expect(page.getByTestId("review-set-item")).toHaveCount(1);
  await expect(page.getByTestId("review-set-screenshot")).toHaveCount(1);
  await expect(previewReviewPanel.locator("img")).toHaveCount(1);
  const standaloneScreenshotTrigger = previewReviewPanel.getByRole("button", { name: "Open screenshot 1 for annotation 1" });
  await standaloneScreenshotTrigger.click();
  await expect(previewPage.getByRole("dialog", { name: "Screenshot 1 for annotation 1" })).toBeVisible();
  await expect(previewPage.getByRole("button", { name: "Close screenshot preview" })).toBeFocused();
  await previewPage.keyboard.press("Tab");
  await expect(previewPage.getByRole("button", { name: "Close screenshot preview" })).toBeFocused();
  await previewPage.keyboard.press("Escape");
  await expect(previewPage.getByRole("dialog", { name: "Screenshot 1 for annotation 1" })).toHaveCount(0);
  await expect(standaloneScreenshotTrigger).toBeFocused();
  await expect(previewInspect).toHaveAttribute("aria-pressed", "true");
  await previewReviewPanel.getByRole("button", { name: "Add screenshot" }).click();
  await expect(previewReviewPanel.locator("img")).toHaveCount(2);
  await previewReviewPanel.getByRole("button", { name: "Remove screenshot 2" }).click();
  await expect(previewReviewPanel.locator("img")).toHaveCount(1);
  await previewReviewPanel.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(previewPage.locator('[data-canvas-helper-preview-review-item="true"]')).toHaveCount(0);
  const previewUndo = previewPage.locator('[data-canvas-helper-preview-review-undo="true"]');
  await expect(previewUndo).toHaveText("Undo remove");
  await previewUndo.click();
  await expect(previewPage.locator('[data-canvas-helper-preview-review-item="true"]')).toHaveCount(1);
  await previewReviewPanel.getByRole("button", { name: "Show", exact: true }).click();
  await expect(standaloneCourse.locator("html")).toHaveAttribute("data-canvas-helper-inspection-focus", "true");
  const previewCopy = previewPage.locator('[data-canvas-helper-preview-review-copy="true"]');
  await expect(previewCopy).toBeEnabled();
  await previewCopy.click();
  await expect(previewPage.locator('[data-canvas-helper-preview-review-status="true"]')).toContainText("Copied");

  await page.reload();
  await expect(page.getByTestId("studio-shell")).toBeVisible();
  await page.getByTestId("workspace-project-select").selectOption("e2e-fixture");
  await waitForWorkspacePreviewReady(page, "e2e-fixture");
  await expect(previewStatus).toContainText("Connected to Studio", { timeout: 10_000 });
  await expect(previewPage.locator('[data-canvas-helper-preview-review-item="true"]')).toHaveCount(1);
  await expect(previewCopy).toBeEnabled();

  const returnToStudio = previewPage.locator('[data-canvas-helper-return-to-studio="true"]');
  await expect(returnToStudio).toHaveText("Return to Studio");
  const previewClosed = previewPage.waitForEvent("close");
  await returnToStudio.click();
  await previewClosed;
  await expect(page).toHaveURL(studioUrl);
  await expect(page.getByTestId("studio-shell")).toBeVisible();
  await expect(page.getByTestId("review-set")).toBeVisible();
  await expect(page.getByTestId("review-set-item")).toHaveCount(1);
  await expect(page.getByTestId("copy-review-set")).toBeEnabled();

  const reopenedPreviewPromise = page.waitForEvent("popup");
  await page.getByTestId("open-workspace-preview-toggle").click();
  const reopenedPreview = await reopenedPreviewPromise;
  await reopenedPreview.waitForLoadState("domcontentloaded");
  await expect(reopenedPreview.locator('[data-canvas-helper-preview-controls="true"]')).toBeVisible();
  await reopenedPreview.locator('[data-canvas-helper-preview-review-toggle="true"]').click();
  await expect(reopenedPreview.locator('[data-canvas-helper-preview-review-item="true"]')).toHaveCount(1);
  await reopenedPreview.close();
  const standaloneScreenshotReclaimed = page.waitForResponse((response) =>
    response.url().endsWith("/api/inspection/screenshots") && response.request().method() === "DELETE"
  );
  await page.getByTestId("review-set").getByRole("button", { name: "Clear" }).click();
  expect((await standaloneScreenshotReclaimed).ok()).toBe(true);
  await expect(page.getByTestId("review-set-item")).toHaveCount(0);
});

test("@inspection annotation rail hides the technical dashboard panels", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  if (!(await page.getByTestId("review-set").isVisible())) {
    await page.getByTestId("inspector-toggle").click();
  }
  await expect(page.getByTestId("review-set")).toBeVisible();
  await expect(page.getByTestId("course-build-brief")).toHaveCount(0);
  await expect(page.getByTestId("preview-health")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Source Files" })).toHaveCount(0);
});

test("@inspection Assessments is a separate workspace and preserves a paused course draft", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("inspect-toggle").click();

  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  const learnerControl = workspaceFrame.getByRole("button", { name: "Fixture Module" });
  await learnerControl.focus();
  await learnerControl.press("Enter");
  await page.getByTestId("inspection-teacher-note").fill("Keep this unfinished note when I check assessments.");

  await page.getByTestId("assessment-studio-tab").click();
  await expect(page.getByRole("region", { name: "Course preview controls" })).toHaveCount(0);
  await expect(page.getByTestId("inspect-toggle")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Assessment Library", exact: true })).toBeVisible();

  await page.getByTestId("course-studio-tab").click();
  await expect(page.getByTestId("inspect-toggle")).toHaveText("Annotate");
  await expect(page.getByTestId("inspection-panel")).toContainText("Draft paused");
  await expect(page.getByTestId("inspection-teacher-note")).toHaveValue(
    "Keep this unfinished note when I check assessments."
  );
  await expect(workspaceFrame.locator("html")).not.toHaveAttribute("data-canvas-helper-inspect-active", "true");
});

test("@inspection Review Set automatically prepares multiple annotations for one copy", async ({ page }) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("layout-focus-toggle").click();
  await page.getByTestId("preview-workspace-toggle").click();
  await page.getByTestId("inspect-toggle").click();

  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
  const headingBounds = await heading.boundingBox();
  expect(headingBounds).toBeTruthy();
  await page.mouse.click(
    (headingBounds?.x ?? 0) + (headingBounds?.width ?? 0) / 2,
    (headingBounds?.y ?? 0) + (headingBounds?.height ?? 0) / 2
  );
  await page.getByTestId("inspection-teacher-note").fill("Make this opening explanation more direct.");
  await expect(page.getByTestId("add-to-review-set")).toBeEnabled();
  await page.getByTestId("add-to-review-set").click();
  await expect(page.getByTestId("review-set-item")).toHaveCount(1);

  const learnerControl = workspaceFrame.getByRole("button", { name: "Fixture Module" });
  await learnerControl.focus();
  await learnerControl.press("Enter");
  await expect(page.getByTestId("inspection-selection-summary")).toContainText("Fixture Module");
  await page.getByTestId("inspection-teacher-note").fill("Explain what happens when learners select this.");
  await page.getByTestId("add-to-review-set").click();
  await expect(page.getByTestId("review-set-item")).toHaveCount(2);
  await expect(page.getByTestId("inspection-selection-summary")).toHaveCount(0);

  await expect(page.getByTestId("copy-review-set")).toBeEnabled();
  await page.getByTestId("copy-review-set").click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("Items: 2");
  expect(copied).toContain("Screenshots: 0 local PNGs");
  await expect(page.getByTestId("review-set-packet")).toHaveCount(0);

  await page.getByTestId("preview-reference-toggle").click();
  await expect(page.getByTestId("review-set-item")).toHaveCount(2);
});

test("@inspection saved annotations can be undone, edited, removed, and restored", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("layout-focus-toggle").click();
  await page.getByTestId("preview-workspace-toggle").click();
  await page.getByTestId("inspect-toggle").click();

  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  const learnerControl = workspaceFrame.getByRole("button", { name: "Fixture Module" });
  await learnerControl.focus();
  await learnerControl.press("Enter");
  await page.getByTestId("inspection-teacher-note").fill("Clarify this button.");
  await page.getByTestId("add-to-review-set").click();
  await expect(page.getByTestId("review-set-item")).toHaveCount(1);
  await page.getByTestId("review-feedback").getByRole("button", { name: "Undo save" }).click();
  await expect(page.getByTestId("review-set-item")).toHaveCount(0);

  await learnerControl.focus();
  await learnerControl.press("Enter");
  await page.getByTestId("inspection-teacher-note").fill("Clarify this button.");
  await page.getByTestId("add-to-review-set").click();
  await expect(page.getByTestId("review-set-item")).toHaveCount(1);

  const savedNote = page.getByTestId("review-set-item").locator("textarea");
  await savedNote.fill("Use a clearer action label.");
  await expect(savedNote).toHaveValue("Use a clearer action label.");
  await page.getByTestId("review-set-item").getByRole("button", { name: "Remove", exact: true }).click();
  await expect(page.getByTestId("review-set-item")).toHaveCount(0);
  await page.getByTestId("review-feedback").getByRole("button", { name: "Undo remove" }).click();
  await expect(page.getByTestId("review-set-item")).toHaveCount(1);
  await expect(page.getByTestId("review-set-item").locator("textarea")).toHaveValue("Use a clearer action label.");
});

test("@inspection screenshot capture can be canceled and retried without losing the annotation", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("inspect-toggle").click();
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  const learnerControl = workspaceFrame.getByRole("button", { name: "Fixture Module" });
  await learnerControl.focus();
  await learnerControl.press("Enter");
  await expect(page.getByTestId("inspection-selection-summary")).toContainText("Fixture Module");

  let releaseCapture = () => undefined;
  const heldCapture = new Promise<void>((resolve) => { releaseCapture = resolve; });
  await page.route("**/api/inspection/capture", async (route) => {
    await heldCapture;
    await route.abort().catch(() => undefined);
  });
  const capture = page.getByTestId("capture-annotated-screenshot");
  await capture.evaluate((button: HTMLButtonElement) => button.click());
  await expect(capture).toHaveText("Cancel capture");
  await capture.evaluate((button: HTMLButtonElement) => button.click());
  releaseCapture();
  await expect(capture).toHaveText("Capture screenshot");
  await expect(page.getByTestId("review-feedback")).toContainText("Screenshot capture canceled");
  await expect(page.getByTestId("screenshot-draft")).toHaveCount(0);

  await page.unroute("**/api/inspection/capture");
  await capture.click();
  await expect(page.getByTestId("screenshot-draft")).toHaveCount(1);
  await expect(page.getByText("Screenshot ready to save.")).toBeVisible();
});

test("@inspection Show restores the saved workspace HTML page before focusing the annotation", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  const htmlSelect = page.getByTestId("workspace-html-select");
  await htmlSelect.selectOption("alternate.html");
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await expect(workspaceFrame.getByRole("heading", { name: "E2E Fixture Alternate Page" })).toBeVisible();

  await page.getByTestId("inspect-toggle").click();
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  const alternateHeading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Alternate Page" });
  const alternateBounds = await alternateHeading.boundingBox();
  expect(alternateBounds).toBeTruthy();
  await page.mouse.click(
    (alternateBounds?.x ?? 0) + (alternateBounds?.width ?? 0) / 2,
    (alternateBounds?.y ?? 0) + (alternateBounds?.height ?? 0) / 2
  );
  await page.getByTestId("inspection-teacher-note").fill("Clarify the alternate-page heading.");
  await page.getByTestId("add-to-review-set").click();
  await expect(page.getByTestId("review-set-item")).toHaveCount(1);

  await htmlSelect.selectOption("index.html");
  await expect(workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" })).toBeVisible();
  await page.getByTestId("review-set-item").getByRole("button", { name: "Show", exact: true }).click();
  await expect(htmlSelect).toHaveValue("alternate.html");
  await expect(workspaceFrame.getByRole("heading", { name: "E2E Fixture Alternate Page" })).toBeVisible();
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspection-focus", "true");

  await htmlSelect.selectOption("index.html");
  await expect(workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" })).toBeVisible();
  const previewPagePromise = page.waitForEvent("popup");
  await page.getByTestId("open-workspace-preview-toggle").click();
  const previewPage = await previewPagePromise;
  await expect(previewPage.locator('[data-canvas-helper-preview-controls="true"]')).toBeVisible();
  await previewPage.locator('[data-canvas-helper-preview-review-toggle="true"]').click();
  const previewItem = previewPage.locator('[data-canvas-helper-preview-review-item="true"]');
  await expect(previewItem).toHaveCount(1);
  await previewItem.getByRole("button", { name: "Show", exact: true }).click();
  const standaloneCourse = previewPage.frameLocator('[data-canvas-helper-standalone-course="true"]');
  await expect(standaloneCourse.getByRole("heading", { name: "E2E Fixture Alternate Page" })).toBeVisible();
  await expect(standaloneCourse.locator("html")).toHaveAttribute("data-canvas-helper-inspection-focus", "true");
  await expect(previewPage.locator('[data-canvas-helper-preview-review-status="true"]')).toContainText("Annotation shown");
  await previewPage.close();
});

test("@inspection Show restores the saved query and hash state on the same course page", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  const currentState = () => workspaceFrame.locator("html").evaluate(() => `${location.search}${location.hash}`);
  await workspaceFrame.locator("html").evaluate(() => history.replaceState(null, "", "?lesson=one#part-a"));
  await expect.poll(currentState).toBe("?lesson=one#part-a");
  await page.waitForTimeout(100); // Let the preview-navigation bridge settle before annotation mode starts.

  await page.getByTestId("inspect-toggle").click();
  const archiveControl = workspaceFrame.getByRole("button", { name: "Show archive" });
  await archiveControl.focus();
  await archiveControl.press("Enter");
  await page.getByTestId("inspection-teacher-note").fill("Keep this note attached to lesson one.");
  await page.getByTestId("add-to-review-set").click();
  await expect(page.getByTestId("review-set-item")).toHaveCount(1);

  const learnerControl = workspaceFrame.getByRole("button", { name: "Fixture Module" });
  await learnerControl.focus();
  await learnerControl.press("Enter");
  await expect(page.getByTestId("inspection-selection-summary")).toBeVisible();
  await workspaceFrame.locator("html").evaluate(() => history.replaceState(null, "", "?lesson=two#part-b"));
  await expect.poll(currentState).toBe("?lesson=two#part-b");
  await expect(page.getByTestId("inspection-selection-summary")).toHaveCount(0);
  await page.getByTestId("review-set-item").getByRole("button", { name: "Show", exact: true }).click();
  await expect.poll(currentState).toBe("?lesson=one#part-a");
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspection-focus", "true");

  await workspaceFrame.locator("html").evaluate(() => history.replaceState(null, "", "?lesson=two#part-b"));
  await expect.poll(currentState).toBe("?lesson=two#part-b");
  const previewPagePromise = page.waitForEvent("popup");
  await page.getByTestId("open-workspace-preview-toggle").click();
  const previewPage = await previewPagePromise;
  await expect(previewPage.locator('[data-canvas-helper-preview-controls="true"]')).toBeVisible();
  await previewPage.locator('[data-canvas-helper-preview-review-toggle="true"]').click();
  await previewPage.locator('[data-canvas-helper-preview-review-item="true"]').getByRole("button", { name: "Show", exact: true }).click();
  const standaloneCourse = previewPage.frameLocator('[data-canvas-helper-standalone-course="true"]');
  await expect.poll(async () => {
    try {
      return await standaloneCourse.locator("html").evaluate(() => `${location.search}${location.hash}`);
    } catch {
      return "";
    }
  }).toBe("?lesson=one#part-a");
  await expect(standaloneCourse.locator("html")).toHaveAttribute("data-canvas-helper-inspection-focus", "true");
  await expect(previewPage.locator('[data-canvas-helper-preview-review-status="true"]')).toContainText("Annotation shown");
  await previewPage.close();
});

test("@inspection Review Set blocks a stale source recheck instead of copying an old selection", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("layout-focus-toggle").click();
  await page.getByTestId("preview-workspace-toggle").click();
  await page.getByTestId("inspect-toggle").click();

  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
  const headingBounds = await heading.boundingBox();
  expect(headingBounds).toBeTruthy();
  await page.mouse.click(
    (headingBounds?.x ?? 0) + (headingBounds?.width ?? 0) / 2,
    (headingBounds?.y ?? 0) + (headingBounds?.height ?? 0) / 2
  );
  await page.getByTestId("inspection-teacher-note").fill("Make this heading more direct.");
  await page.getByTestId("add-to-review-set").click();

  await page.route("**/api/inspection/resolve", async (route) => {
    const response = await route.fetch();
    const payload = await response.json();
    await route.fulfill({ response, json: { ...payload, freshness: "stale" } });
  });
  await page.getByTestId("review-set-item").locator("textarea").fill("Trigger a fresh safety check.");
  await expect(page.getByText(/Annotation 1 changed/)).toBeVisible();
  await expect(page.getByTestId("review-set-packet")).toHaveCount(0);
  await expect(page.getByTestId("copy-review-set")).toBeDisabled();
});

test("@inspection changing projects clears a handoff and ignores a late source-resolution response", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("layout-focus-toggle").click();
  await page.getByTestId("preview-workspace-toggle").click();

  let releaseInspectionResponse: (() => void) | null = null;
  await page.route("**/api/inspection/resolve", async (route) => {
    await new Promise<void>((resolve) => {
      releaseInspectionResponse = resolve;
    });
    await route.continue();
  });

  await page.getByTestId("inspect-toggle").click();
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
  const headingBounds = await heading.boundingBox();
  expect(headingBounds).toBeTruthy();
  await page.mouse.click(
    (headingBounds?.x ?? 0) + (headingBounds?.width ?? 0) / 2,
    (headingBounds?.y ?? 0) + (headingBounds?.height ?? 0) / 2
  );
  await expect.poll(() => Boolean(releaseInspectionResponse)).toBe(true);

  const projectSelect = page.getByTestId("workspace-project-select");
  await projectSelect.selectOption("forensics35");
  await expect(projectSelect).toHaveValue("forensics35");
  await expect(page.getByTestId("inspection-selection-summary")).toHaveCount(0);

  const inspectionResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return url.pathname === "/api/inspection/resolve" && response.request().method() === "POST";
  });
  releaseInspectionResponse?.();
  await inspectionResponse;
  await waitForWorkspacePreviewReady(page, "forensics35");

  await expect(page.getByTestId("inspection-selection-summary")).toHaveCount(0);
});

test("@inspection each project restores its own layout, device, zoom, and Review Set visibility", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("layout-split-toggle").click();
  await page.getByRole("combobox", { name: "Preview device" }).selectOption("mobile");
  await page.getByRole("combobox", { name: "Preview zoom" }).selectOption("75");
  await page.getByTestId("inspector-toggle").click();
  await expect(page.getByTestId("review-set")).toBeVisible();

  const projectSelect = page.getByTestId("workspace-project-select");
  await projectSelect.selectOption("forensics35");
  await waitForWorkspacePreviewReady(page, "forensics35");
  await expect(page.getByTestId("layout-focus-toggle")).toHaveClass(/active/);
  await expect(page.getByRole("combobox", { name: "Preview device" })).toHaveValue("desktop");
  await expect(page.getByRole("combobox", { name: "Preview zoom" })).toHaveValue("100");
  await expect(page.getByTestId("review-set")).toHaveCount(0);

  await projectSelect.selectOption("e2e-fixture");
  await waitForWorkspacePreviewReady(page, "e2e-fixture");
  await expect(page.getByTestId("layout-split-toggle")).toHaveClass(/active/);
  await expect(page.getByRole("combobox", { name: "Preview device" })).toHaveValue("mobile");
  await expect(page.getByRole("combobox", { name: "Preview zoom" })).toHaveValue("75");
  await expect(page.getByTestId("review-set")).toBeVisible();
});

test("@inspection a late first selection cannot overwrite a newer selection in the same preview", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("layout-focus-toggle").click();
  await page.getByTestId("preview-workspace-toggle").click();

  let inspectionRequestCount = 0;
  let releaseFirstInspectionResponse: (() => void) | null = null;
  await page.route("**/api/inspection/resolve", async (route) => {
    inspectionRequestCount += 1;
    if (inspectionRequestCount === 1) {
      await new Promise<void>((resolve) => {
        releaseFirstInspectionResponse = resolve;
      });
    }
    await route.continue();
  });

  await page.getByTestId("inspect-toggle").click();
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  const firstSelection = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
  const firstBounds = await firstSelection.boundingBox();
  expect(firstBounds).toBeTruthy();
  await page.mouse.click(
    (firstBounds?.x ?? 0) + (firstBounds?.width ?? 0) / 2,
    (firstBounds?.y ?? 0) + (firstBounds?.height ?? 0) / 2
  );
  await expect.poll(() => inspectionRequestCount).toBe(1);

  const secondSelection = workspaceFrame.getByRole("button", { name: "Fixture Module" });
  const secondBounds = await secondSelection.boundingBox();
  expect(secondBounds).toBeTruthy();
  await page.mouse.click(
    (secondBounds?.x ?? 0) + (secondBounds?.width ?? 0) / 2,
    (secondBounds?.y ?? 0) + (secondBounds?.height ?? 0) / 2
  );
  await expect.poll(() => inspectionRequestCount).toBe(2);
  await expect(page.getByTestId("inspection-selection-summary")).toContainText("Fixture Module");

  const firstInspectionResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return url.pathname === "/api/inspection/resolve" && response.request().method() === "POST";
  });
  releaseFirstInspectionResponse?.();
  await firstInspectionResponse;

  await expect(page.getByTestId("inspection-selection-summary")).toContainText("Fixture Module");
});

test("@inspection course-only capture supports drag selection, three screenshots, copy, and reload persistence", async ({ page }) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("layout-focus-toggle").click();
  await page.getByTestId("preview-workspace-toggle").click();
  await page.getByTestId("inspect-toggle").click();

  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-bridge-ready", "true");
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
  const headingBounds = await heading.boundingBox();
  expect(headingBounds).toBeTruthy();
  const dragStart = {
    x: (headingBounds?.x ?? 0) + 4,
    y: (headingBounds?.y ?? 0) + 4
  };
  const dragEnd = {
    x: (headingBounds?.x ?? 0) + Math.max(12, (headingBounds?.width ?? 0) - 4),
    y: (headingBounds?.y ?? 0) + Math.max(12, (headingBounds?.height ?? 0) - 4)
  };
  await page.mouse.move(dragStart.x, dragStart.y);
  await page.mouse.down();
  await page.mouse.move(dragEnd.x, dragEnd.y, { steps: 4 });
  await page.mouse.up();
  await expect(page.getByTestId("inspection-panel")).toBeVisible();
  await expect(page.getByTestId("annotation-mode-bar")).toBeVisible();
  await expect(page.getByTestId("annotation-mode-bar")).toHaveCSS("background-color", "rgb(20, 115, 230)");

  for (let expectedCount = 1; expectedCount <= 3; expectedCount += 1) {
    await page.getByTestId("capture-annotated-screenshot").click();
    await expect(page.getByTestId("screenshot-draft")).toHaveCount(expectedCount);
  }
  await expect(page.getByTestId("capture-annotated-screenshot")).toBeDisabled();
  await page.getByTestId("inspection-teacher-note").fill("Use these screenshots to clarify this heading.");
  await page.getByTestId("add-to-review-set").click();
  await expect(page.getByTestId("screenshot-annotation")).toHaveCount(0);
  await expect(page.getByTestId("review-set-screenshot")).toHaveCount(3);
  await expect(page.getByTestId("review-set")).toContainText("3 screenshots");
  const studioScreenshotTrigger = page.getByRole("button", { name: "Open screenshot 1 for annotation 1" });
  await studioScreenshotTrigger.click();
  await expect(page.getByRole("dialog", { name: "Screenshot preview" })).toBeVisible();
  await page.keyboard.press("Tab");
  expect(await page.getByRole("dialog", { name: "Screenshot preview" }).evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Screenshot preview" })).toHaveCount(0);
  await expect(studioScreenshotTrigger).toBeFocused();
  await expect(page.getByTestId("inspect-toggle")).toHaveText("Annotating");
  await expect(page.getByTestId("copy-review-set")).toBeEnabled();
  await page.getByTestId("copy-review-set").click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("Schema: review-set-v3");
  expect(copied).toContain("Screenshots: 3 local PNGs");
  const screenshotPaths = [...copied.matchAll(/\.runtime\/studio-review-sets\/[A-Za-z0-9-]+\/[A-Za-z0-9._-]+\.png/g)]
    .map((match) => match[0]);
  expect(screenshotPaths).toHaveLength(3);
  for (const screenshotPath of screenshotPaths) {
    const png = await readFile(path.resolve(screenshotPath));
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  }
  await page.reload();
  await expect(page.getByTestId("studio-shell")).toBeVisible();
  await page.getByTestId("workspace-project-select").selectOption("e2e-fixture");
  await waitForWorkspacePreviewReady(page, "e2e-fixture");
  await expect(page.getByTestId("review-set-item")).toHaveCount(1);
  await expect(page.getByTestId("review-set-screenshot")).toHaveCount(3);
  await expect(page.getByTestId("copy-review-set")).toBeEnabled();
  const screenshotsReclaimed = page.waitForResponse((response) =>
    response.url().endsWith("/api/inspection/screenshots") && response.request().method() === "DELETE"
  );
  await page.getByTestId("review-set").getByRole("button", { name: "Clear" }).click();
  expect((await screenshotsReclaimed).ok()).toBe(true);
  await expect(page.getByTestId("review-set-item")).toHaveCount(0);
});

test("@inspection clipboard denial exposes a selectable manual Review Set packet", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "clipboard", {
      configurable: true,
      get: () => ({ writeText: () => Promise.reject(new Error("blocked for test")) })
    });
  });
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("inspect-toggle").click();
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-bridge-ready", "true");
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
  const headingBounds = await heading.boundingBox();
  expect(headingBounds).toBeTruthy();
  await page.mouse.click(
    (headingBounds?.x ?? 0) + (headingBounds?.width ?? 0) / 2,
    (headingBounds?.y ?? 0) + (headingBounds?.height ?? 0) / 2
  );
  await page.getByTestId("inspection-teacher-note").fill("Make this heading clearer.");
  await page.getByTestId("add-to-review-set").click();
  await expect(page.getByTestId("copy-review-set")).toBeEnabled();
  await page.getByTestId("copy-review-set").click();
  const fallback = page.getByTestId("review-set-manual-packet");
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveValue(/# Canvas Helper Review Set handoff/);

  const previewPagePromise = page.waitForEvent("popup");
  await page.getByTestId("open-workspace-preview-toggle").click();
  const previewPage = await previewPagePromise;
  await expect(previewPage.locator('[data-canvas-helper-preview-controls="true"]')).toBeVisible();
  await previewPage.locator('[data-canvas-helper-preview-review-toggle="true"]').click();
  const previewCopy = previewPage.locator('[data-canvas-helper-preview-review-copy="true"]');
  await expect(previewCopy).toBeEnabled();
  await previewCopy.click();
  const previewFallback = previewPage.locator('[data-canvas-helper-preview-review-packet="true"]');
  await expect(previewFallback).toBeVisible();
  await expect(previewFallback).toHaveValue(/# Canvas Helper Review Set handoff/);
  await previewPage.close();
});

test("@inspection a failed second screenshot save keeps every draft and reclaims the partial file", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("inspect-toggle").click();
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-bridge-ready", "true");
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
  const headingBounds = await heading.boundingBox();
  expect(headingBounds).toBeTruthy();
  await page.mouse.click(
    (headingBounds?.x ?? 0) + (headingBounds?.width ?? 0) / 2,
    (headingBounds?.y ?? 0) + (headingBounds?.height ?? 0) / 2
  );
  await page.getByTestId("capture-annotated-screenshot").click();
  await expect(page.getByTestId("screenshot-draft")).toHaveCount(1);
  await page.getByTestId("capture-annotated-screenshot").click();
  await expect(page.getByTestId("screenshot-draft")).toHaveCount(2);

  let uploadCount = 0;
  let partialPath = "";
  let partialOwner: Record<string, string> = {};
  await page.route("**/api/inspection/screenshots", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    uploadCount += 1;
    if (uploadCount === 1) {
      partialOwner = {
        sessionId: route.request().headers()["x-canvas-helper-review-session"] ?? "",
        projectSlug: route.request().headers()["x-canvas-helper-project"] ?? "",
        itemId: route.request().headers()["x-canvas-helper-review-item"] ?? "",
        ownerNodeId: route.request().headers()["x-canvas-helper-inspection-node"] ?? ""
      };
      const response = await route.fetch();
      const payload = await response.json() as { path?: string };
      partialPath = payload.path ?? "";
      await route.fulfill({ response });
      return;
    }
    await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "forced failure" }) });
  });

  await page.getByTestId("inspection-teacher-note").fill("Keep both screenshots if saving needs a retry.");
  await page.getByTestId("add-to-review-set").click();
  await expect(page.getByTestId("review-set-item")).toHaveCount(0);
  await expect(page.getByTestId("screenshot-draft")).toHaveCount(2);
  await expect(page.getByText(/could not keep this screenshot/i)).toBeVisible();
  expect(partialPath).toBeTruthy();
  await expect.poll(async () => {
    const screenshotUrl = new URL("/api/inspection/screenshots", page.url());
    screenshotUrl.search = new URLSearchParams({ path: partialPath, ...partialOwner }).toString();
    const response = await page.request.get(screenshotUrl.toString());
    return response.status();
  }).toBe(404);
});

test("@inspection tampered persisted screenshot metadata cannot enable Copy", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("inspect-toggle").click();
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
  const headingBounds = await heading.boundingBox();
  expect(headingBounds).toBeTruthy();
  await page.mouse.click(
    (headingBounds?.x ?? 0) + (headingBounds?.width ?? 0) / 2,
    (headingBounds?.y ?? 0) + (headingBounds?.height ?? 0) / 2
  );
  await page.getByTestId("capture-annotated-screenshot").click();
  await expect(page.getByTestId("screenshot-draft")).toHaveCount(1);
  await page.getByTestId("inspection-teacher-note").fill("Use the real screenshot only.");
  await page.getByTestId("add-to-review-set").click();
  await expect(page.getByTestId("copy-review-set")).toBeEnabled();

  const cleanupScreenshots = await page.evaluate(() => {
    const key = "canvas-helper/review-set-v6";
    const stored = JSON.parse(localStorage.getItem(key) || "null");
    if (!stored?.items?.[0]?.screenshots?.[0]) throw new Error("missing stored screenshot");
    const item = stored.items[0];
    const screenshot = item.screenshots[0];
    const cleanup = [{
      repoRelativePath: screenshot.filePath,
      sessionId: stored.sessionId,
      projectSlug: item.request.projectSlug,
      itemId: item.id,
      ownerNodeId: item.request.selection.nodeId
    }];
    stored.items[0].screenshots[0].filePath = `.runtime/studio-review-sets/${stored.sessionId}/forged.png`;
    localStorage.setItem(key, JSON.stringify(stored));
    return cleanup;
  });
  await page.reload();
  await expect(page.getByTestId("studio-shell")).toBeVisible();
  await waitForWorkspacePreviewReady(page, "e2e-fixture");
  await expect(page.getByTestId("review-set-item")).toHaveCount(1);
  await expect(page.getByText(/screenshots could not be verified/i)).toBeVisible();
  await expect(page.getByTestId("copy-review-set")).toBeDisabled();
  await page.evaluate(async (screenshots) => {
    const response = await fetch("/api/inspection/screenshots", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ screenshots })
    });
    if (!response.ok) throw new Error("could not reclaim the tamper-test screenshot");
  }, cleanupScreenshots);
});
