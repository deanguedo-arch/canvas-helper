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
  await expect(page.getByTestId("inspection-panel")).toHaveCount(0);

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
  await expect(previewPage).toHaveURL(/\/preview\/workspace\/e2e-fixture\/index\.html/);
  await expect(previewPage).not.toHaveURL(/canvas-helper-inspect-session/);
  const previewTools = previewPage.locator('[data-canvas-helper-preview-controls="true"]');
  const previewInspect = previewPage.locator('[data-canvas-helper-preview-inspect="true"]');
  const previewStatus = previewPage.locator('[data-canvas-helper-preview-inspect-status="true"]');
  await expect(previewTools).toBeVisible();
  await expect(previewStatus).toContainText("Connected to Studio");
  await expect(previewInspect).toHaveAttribute("aria-pressed", "false");
  await previewInspect.click();
  await expect(previewInspect).toHaveAttribute("aria-pressed", "true");
  await expect(previewPage.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  await expect(page.getByTestId("inspect-toggle")).toHaveText("Inspecting");

  const standaloneHeading = previewPage.getByRole("heading", { name: "E2E Fixture Workspace" });
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
  await previewPage.locator('[data-canvas-helper-preview-review-save="true"]').click();
  await expect(previewPage.locator('[data-canvas-helper-preview-review-item="true"]')).toHaveCount(1);
  await expect(page.getByTestId("review-set-item")).toHaveCount(1);
  const previewCopy = previewPage.locator('[data-canvas-helper-preview-review-copy="true"]');
  await expect(previewCopy).toBeEnabled();
  await previewCopy.click();
  await expect(previewPage.locator('[data-canvas-helper-preview-review-status="true"]')).toContainText("Copied");

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
  await expect(page.getByTestId("add-to-review-set")).toBeDisabled();

  await expect(page.getByTestId("copy-review-set")).toBeEnabled();
  await page.getByTestId("copy-review-set").click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("Items: 2");
  expect(copied).toContain("Screenshots: excluded");
  await expect(page.getByTestId("review-set-packet")).toHaveCount(0);

  await page.getByTestId("preview-reference-toggle").click();
  await expect(page.getByTestId("review-set-item")).toHaveCount(2);
});

test("@inspection saved annotations can be edited and removed without technical controls", async ({ page }) => {
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

  const savedNote = page.getByTestId("review-set-item").locator("textarea");
  await savedNote.fill("Use a clearer action label.");
  await expect(savedNote).toHaveValue("Use a clearer action label.");
  await page.getByTestId("review-set-item").getByRole("button", { name: "Remove", exact: true }).click();
  await expect(page.getByTestId("review-set-item")).toHaveCount(0);
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

test("@inspection screenshot capture refreshes the selection and stops the local stream", async ({ page }) => {
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
  await page.mouse.click(
    (headingBounds?.x ?? 0) + (headingBounds?.width ?? 0) / 2,
    (headingBounds?.y ?? 0) + (headingBounds?.height ?? 0) / 2
  );
  await expect(page.getByTestId("inspection-panel")).toBeVisible();

  await page.evaluate(() => {
    const original = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
    Object.defineProperty(navigator.mediaDevices, "getDisplayMedia", {
      configurable: true,
      value: async () => {
        const canvas = document.createElement("canvas");
        canvas.width = window.innerWidth * 4;
        canvas.height = window.innerHeight * 4;
        const context = canvas.getContext("2d");
        context?.fillRect(0, 0, canvas.width, canvas.height);
        const stream = canvas.captureStream(30);
        const track = stream.getVideoTracks()[0];
        const stop = track.stop.bind(track);
        Object.defineProperty(track, "getSettings", {
          configurable: true,
          value: () => ({ displaySurface: "browser" })
        });
        Object.defineProperty(track, "stop", {
          configurable: true,
          value: () => {
            document.documentElement.setAttribute("data-e2e-capture-stopped", "true");
            stop();
          }
        });
        return stream;
      }
    });
    window.addEventListener("beforeunload", () => {
      Object.defineProperty(navigator.mediaDevices, "getDisplayMedia", { configurable: true, value: original });
    });
  });

  await page.getByTestId("capture-annotated-screenshot").click();
  await expect(page.getByTestId("screenshot-annotation")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-e2e-capture-stopped", "true");
  await page.getByTestId("inspection-teacher-note").fill("Use the screenshot to clarify this heading.");
  await page.getByTestId("add-to-review-set").click();
  await expect(page.getByTestId("screenshot-annotation")).toHaveCount(0);
  await expect(page.getByTestId("review-set-screenshot")).toBeVisible();
  await expect(page.getByTestId("copy-review-set")).toBeEnabled();
  await expect(page.getByTestId("review-set-packet")).toHaveCount(0);
});

test("@inspection changing projects during capture stops the stale stream without keeping an annotation", async ({ page }) => {
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
  await expect(page.getByTestId("inspection-panel")).toBeVisible();

  await page.evaluate(() => {
    const state = window as typeof window & {
      releaseDelayedCapture?: () => void;
    };
    Object.defineProperty(navigator.mediaDevices, "getDisplayMedia", {
      configurable: true,
      value: async () => {
        document.documentElement.setAttribute("data-e2e-capture-requested", "true");
        return new Promise<MediaStream>((resolve) => {
          state.releaseDelayedCapture = () => {
            const canvas = document.createElement("canvas");
            canvas.width = window.innerWidth * 4;
            canvas.height = window.innerHeight * 4;
            const stream = canvas.captureStream(30);
            const track = stream.getVideoTracks()[0];
            const stop = track.stop.bind(track);
            Object.defineProperty(track, "getSettings", {
              configurable: true,
              value: () => ({ displaySurface: "browser" })
            });
            Object.defineProperty(track, "stop", {
              configurable: true,
              value: () => {
                const count = Number(document.documentElement.getAttribute("data-e2e-capture-stop-count") || "0") + 1;
                document.documentElement.setAttribute("data-e2e-capture-stop-count", String(count));
                stop();
              }
            });
            resolve(stream);
          };
        });
      }
    });
  });

  await page.getByTestId("capture-annotated-screenshot").click();
  await expect(page.locator("html")).toHaveAttribute("data-e2e-capture-requested", "true");

  const projectSelect = page.getByTestId("workspace-project-select");
  await projectSelect.selectOption("forensics35");
  await expect(projectSelect).toHaveValue("forensics35");
  await expect(page.getByTestId("inspection-selection-summary")).toHaveCount(0);

  await page.evaluate(() => {
    const state = window as typeof window & { releaseDelayedCapture?: () => void };
    state.releaseDelayedCapture?.();
  });
  await expect(page.locator("html")).toHaveAttribute("data-e2e-capture-stop-count", "1");
  await expect(page.getByTestId("screenshot-annotation")).toHaveCount(0);
  await expect(page.getByTestId("inspection-selection-summary")).toHaveCount(0);
});

test("@inspection a project change stops an already-live capture before a held selection refresh resolves", async ({ page }) => {
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
  await expect(page.getByTestId("inspection-panel")).toBeVisible();

  await page.evaluate(() => {
    const state = window as typeof window & {
      releaseHeldSelectionRefresh?: () => void;
    };
    const originalPostMessage = MessagePort.prototype.postMessage;
    MessagePort.prototype.postMessage = function(message, transfer) {
      if (message && typeof message === "object" && "type" in message && message.type === "studio-request-inspect-current") {
        document.documentElement.setAttribute("data-e2e-selection-refresh-held", "true");
        state.releaseHeldSelectionRefresh = () => originalPostMessage.call(this, message, transfer);
        return;
      }
      return originalPostMessage.call(this, message, transfer);
    };

    Object.defineProperty(navigator.mediaDevices, "getDisplayMedia", {
      configurable: true,
      value: async () => {
        const canvas = document.createElement("canvas");
        canvas.width = window.innerWidth * 4;
        canvas.height = window.innerHeight * 4;
        const stream = canvas.captureStream(30);
        const track = stream.getVideoTracks()[0];
        const stop = track.stop.bind(track);
        Object.defineProperty(track, "getSettings", {
          configurable: true,
          value: () => ({ displaySurface: "browser" })
        });
        Object.defineProperty(track, "stop", {
          configurable: true,
          value: () => {
            const count = Number(document.documentElement.getAttribute("data-e2e-capture-stop-count") || "0") + 1;
            document.documentElement.setAttribute("data-e2e-capture-stop-count", String(count));
            stop();
          }
        });
        document.documentElement.setAttribute("data-e2e-capture-stream-live", "true");
        return stream;
      }
    });
  });

  await page.getByTestId("capture-annotated-screenshot").click();
  await expect(page.locator("html")).toHaveAttribute("data-e2e-selection-refresh-held", "true");
  await expect(page.locator("html")).toHaveAttribute("data-e2e-capture-stream-live", "true");

  const projectSelect = page.getByTestId("workspace-project-select");
  await projectSelect.selectOption("forensics35");
  await expect(projectSelect).toHaveValue("forensics35");
  await expect(page.locator("html")).toHaveAttribute("data-e2e-capture-stop-count", "1");

  await page.evaluate(() => {
    const state = window as typeof window & { releaseHeldSelectionRefresh?: () => void };
    state.releaseHeldSelectionRefresh?.();
  });
  await expect(page.getByTestId("screenshot-annotation")).toHaveCount(0);
  await expect(page.getByTestId("inspection-selection-summary")).toHaveCount(0);
});

test("@inspection screenshot capture stops an early stream when selection refresh fails", async ({ page }) => {
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
  await expect(page.getByTestId("inspection-panel")).toBeVisible();

  await page.evaluate(() => {
    Object.defineProperty(navigator.mediaDevices, "getDisplayMedia", {
      configurable: true,
      value: async () => {
        const canvas = document.createElement("canvas");
        canvas.width = window.innerWidth * 4;
        canvas.height = window.innerHeight * 4;
        const stream = canvas.captureStream(30);
        const track = stream.getVideoTracks()[0];
        const stop = track.stop.bind(track);
        Object.defineProperty(track, "getSettings", {
          configurable: true,
          value: () => ({ displaySurface: "browser" })
        });
        Object.defineProperty(track, "stop", {
          configurable: true,
          value: () => {
            const count = Number(document.documentElement.getAttribute("data-e2e-capture-stop-count") || "0") + 1;
            document.documentElement.setAttribute("data-e2e-capture-stop-count", String(count));
            stop();
          }
        });
        return stream;
      }
    });
  });
  await workspaceFrame.locator("html").evaluate(() => {
    const original = MessagePort.prototype.postMessage;
    MessagePort.prototype.postMessage = function(message, transfer) {
      if (message && typeof message === "object" && "type" in message && message.type === "preview-inspect-current") {
        return;
      }
      return original.call(this, message, transfer);
    };
  });

  await page.getByTestId("capture-annotated-screenshot").click();
  await expect(page.locator("html")).toHaveAttribute("data-e2e-capture-stop-count", "1");
  await expect(page.getByTestId("screenshot-annotation")).toHaveCount(0);
});
