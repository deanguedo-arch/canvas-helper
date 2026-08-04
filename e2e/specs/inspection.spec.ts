import { expect, test } from "@playwright/test";

import { openProjectInStudio } from "../lib/project-open";

test("@inspection Studio uses an isolated preview origin and creates a bounded local handoff", async ({ page }) => {
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
  await expect(page.getByTestId("inspection-resolution")).toHaveText("unknown");
  await expect(page.getByTestId("inspection-packet")).toContainText("Resolution: unknown");
  await expect(page.getByTestId("copy-for-codex")).toBeEnabled();
  await expect(page.getByTestId("capture-annotated-screenshot")).toBeVisible();
  await page.getByTestId("inspection-category").selectOption("accessibility");
  await expect(page.getByTestId("inspection-packet")).toContainText("Change focus: accessibility");
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
  await expect(page.getByTestId("inspection-packet")).toContainText("Untrusted visible text excerpt: Fixture Module");
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
