import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { CURRENT_STUDIO_RELEASE } from "../../app/studio/src/lib/studio-release-notes";
import { createCodexStudioCourse } from "../../scripts/lib/codex-course";
import { openProjectInStudio, waitForWorkspacePreviewReady } from "../lib/project-open";
import {
  STUDIO_FIXTURES,
  STUDIO_PRIMARY_FIXTURE,
  STUDIO_SECONDARY_FIXTURE,
  switchStudioFixture
} from "../lib/studio-fixtures";

type StudioPerformanceEvent = {
  measure: "preview-ready" | "selection-feedback" | "capture-status";
  durationMs: number;
  budgetMs: number;
  withinBudget: boolean;
};

async function collectStudioPerformanceEvents(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const scope = window as typeof window & { __studioPerformanceEvents?: StudioPerformanceEvent[] };
    scope.__studioPerformanceEvents = [];
    window.addEventListener("canvas-helper:studio-performance", (event) => {
      scope.__studioPerformanceEvents?.push((event as CustomEvent<StudioPerformanceEvent>).detail);
    });
  });
}

async function studioPerformanceEvents(page: import("@playwright/test").Page) {
  return page.evaluate(() => (
    (window as typeof window & { __studioPerformanceEvents?: StudioPerformanceEvent[] }).__studioPerformanceEvents ?? []
  ));
}

async function tabToTestId(page: import("@playwright/test").Page, testId: string) {
  for (let index = 0; index < 40; index += 1) {
    const activeTestId = await page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.testid ?? "");
    if (activeTestId === testId) return;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Keyboard navigation could not reach ${testId}.`);
}

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

test("@inspection inline reference resources bypass course-page recovery without disappearing", async ({ page }) => {
  await page.route("**/api/projects", async (route) => {
    const response = await route.fetch();
    const projects = await response.json() as Array<{
      manifest: { slug: string };
      paths: { resourceDir: string };
      referenceIndex: { references: Array<Record<string, unknown>> } | null;
    }>;
    const fixture = projects.find((project) => project.manifest.slug === "e2e-fixture");
    if (fixture) {
      fixture.referenceIndex = {
        references: [{
          id: "inline-resource-test",
          originalPath: `${fixture.paths.resourceDir}/inline-resource-test.txt`,
          kind: "text",
          extractionStatus: "not-requested"
        }]
      };
    }
    await route.fulfill({ response, json: projects });
  });
  await page.route("**/*", async (route) => {
    if (new URL(route.request().url()).pathname.includes("/preview/references/raw/e2e-fixture/inline-resource-test.txt")) {
      await route.fulfill({ status: 200, contentType: "text/plain", body: "Inline reference resource remains visible." });
      return;
    }
    await route.fallback();
  });

  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("layout-split-toggle").click();
  const referencePane = page.getByTestId("reference-preview-pane");
  if (!(await page.getByTestId("reference-project-select").isVisible())) {
    await referencePane.getByRole("button", { name: "Show Controls" }).click();
  }
  await page.getByTestId("reference-project-select").selectOption("e2e-fixture");
  await page.getByTestId("reference-source-select").selectOption("resource");
  await expect(page.getByTestId("reference-preview-frame")).toBeVisible();
  await expect(page.frameLocator('[data-testid="reference-preview-frame"]').locator("body")).toContainText("Inline reference resource remains visible");
  await expect(page.getByTestId("reference-preview-recovery")).toHaveCount(0);
});

test("@inspection keyboard selection creates a handoff without activating the learner control", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("inspect-toggle").click();

  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  const learnerControl = workspaceFrame.getByRole("button", { name: "Fixture Module" });
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  await learnerControl.focus();
  await learnerControl.press("Enter");
  await expect(page.getByTestId("inspection-selection-summary")).toContainText("Fixture Module");

  await expect(page.getByTestId("inspection-panel")).toBeVisible();
  await expect(page.getByTestId("inspection-selection-summary")).toContainText("Fixture Module");
  await learnerControl.press("Escape");
  await expect(page.getByTestId("inspect-toggle")).toHaveText("Annotate");
  await expect(workspaceFrame.locator("html")).not.toHaveAttribute("data-canvas-helper-inspect-active", "true");
});

test("@inspection keyboard-only annotation can select noninteractive content and restore focus", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  await tabToTestId(page, "inspect-toggle");
  await page.keyboard.press("Enter");

  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  await expect.poll(() => workspaceFrame.locator("body").evaluate(() => (
    document.activeElement?.hasAttribute("data-canvas-helper-inspect-node") ?? false
  ))).toBe(true);
  await workspaceFrame.locator(":focus").press("Enter");
  await expect(page.getByTestId("inspection-panel")).toBeVisible();
  await expect(page.getByTestId("inspection-teacher-note")).toBeFocused();
  await page.getByTestId("inspection-teacher-note").fill("Clarify this noninteractive course content.");
  await page.getByTestId("add-to-review-set").press("Enter");
  await expect(page.getByTestId("review-set-item")).toHaveCount(1);
  await expect(page.getByTestId("review-set")).toBeFocused();
  await page.getByTestId("review-set-item").getByRole("button", { name: "Remove", exact: true }).press("Enter");
  await expect(page.getByTestId("review-set-item")).toHaveCount(0);
  await expect(page.getByTestId("review-set")).toBeFocused();
  await page.getByTestId("annotation-mode-bar").getByRole("button", { name: "Done" }).press("Enter");
  await expect(page.getByTestId("inspect-toggle")).toBeFocused();
});

test("@inspection narrow annotation mode keeps Done and Save reachable without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("inspect-toggle").click();
  const heading = page.frameLocator('[data-testid="workspace-preview-frame"]').getByRole("heading", { name: "E2E Fixture Workspace" });
  await heading.scrollIntoViewIfNeeded();
  const bounds = await heading.boundingBox();
  expect(bounds).toBeTruthy();
  await page.mouse.click((bounds?.x ?? 0) + 8, (bounds?.y ?? 0) + 8);
  await expect(page.getByTestId("inspection-teacher-note")).toBeFocused();
  await page.getByTestId("inspection-teacher-note").fill("Keep this mobile review usable.");
  await expect(page.getByTestId("add-to-review-set")).toBeInViewport();
  await expect(page.getByTestId("annotation-mode-bar").getByRole("button", { name: "Done" })).toBeInViewport();
  expect(await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth })))
    .toEqual({ width: 320, scrollWidth: 320 });
});

test("@inspection performance events expose bounded preview, selection, and capture outcomes", async ({ page }) => {
  await collectStudioPerformanceEvents(page);
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await openProjectInStudio(page, "e2e-fixture");
  await expect.poll(async () => (await studioPerformanceEvents(page)).some((event) => event.measure === "preview-ready")).toBe(true);
  await page.getByTestId("inspect-toggle").click();
  const heading = page.frameLocator('[data-testid="workspace-preview-frame"]').getByRole("heading", { name: "E2E Fixture Workspace" });
  const bounds = await heading.boundingBox();
  expect(bounds).toBeTruthy();
  await page.mouse.click((bounds?.x ?? 0) + 8, (bounds?.y ?? 0) + 8);
  await expect(page.getByTestId("inspection-panel")).toBeVisible();
  await page.getByTestId("capture-annotated-screenshot").click();
  await expect(page.getByTestId("screenshot-draft")).toHaveCount(1);
  await expect.poll(async () => {
    const measures = (await studioPerformanceEvents(page)).map((event) => event.measure);
    return ["preview-ready", "selection-feedback", "capture-status"].every((measure) => measures.includes(measure as StudioPerformanceEvent["measure"]));
  }).toBe(true);
  const latestByMeasure = new Map((await studioPerformanceEvents(page)).map((event) => [event.measure, event]));
  for (const measure of ["preview-ready", "selection-feedback", "capture-status"] as const) {
    const event = latestByMeasure.get(measure);
    expect(event, `${measure} performance event is recorded`).toBeTruthy();
    expect(event?.durationMs).toBeGreaterThanOrEqual(0);
    expect(event?.budgetMs).toBeGreaterThan(0);
    expect(event?.withinBudget, `${measure} stays inside its user-facing performance budget`).toBe(true);
  }
});

test("@inspection selection feedback timing ends only after the note is visibly focused", async ({ page }) => {
  await collectStudioPerformanceEvents(page);
  await page.route("**/api/inspection/resolve", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 650));
    await route.continue();
  });
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("inspect-toggle").click();
  const heading = page.frameLocator('[data-testid="workspace-preview-frame"]').getByRole("heading", { name: "E2E Fixture Workspace" });
  const bounds = await heading.boundingBox();
  expect(bounds).toBeTruthy();
  await page.mouse.click((bounds?.x ?? 0) + 8, (bounds?.y ?? 0) + 8);
  await expect(page.getByTestId("inspection-teacher-note")).toBeFocused();
  await expect.poll(async () => (
    (await studioPerformanceEvents(page)).filter((event) => event.measure === "selection-feedback").at(-1) ?? null
  )).not.toBeNull();
  const events = await studioPerformanceEvents(page);
  const measured = events.filter((event) => event.measure === "selection-feedback").at(-1);
  expect(measured?.durationMs).toBeGreaterThanOrEqual(600);
  expect(measured?.withinBudget).toBe(false);
});

test("@inspection a deliberate slow drag measures feedback only after selection commit", async ({ page }) => {
  await collectStudioPerformanceEvents(page);
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("inspect-toggle").click();
  const heading = page.frameLocator('[data-testid="workspace-preview-frame"]').getByRole("heading", { name: "E2E Fixture Workspace" });
  const bounds = await heading.boundingBox();
  expect(bounds).toBeTruthy();
  const startX = (bounds?.x ?? 0) + 8;
  const startY = (bounds?.y ?? 0) + 8;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.waitForTimeout(700);
  await page.mouse.move(startX + 45, startY + 18, { steps: 4 });
  await page.mouse.up();
  await expect(page.getByTestId("inspection-teacher-note")).toBeFocused();
  await expect.poll(async () => (
    (await studioPerformanceEvents(page)).filter((event) => event.measure === "selection-feedback").at(-1) ?? null
  )).not.toBeNull();
  const measured = (await studioPerformanceEvents(page)).filter((event) => event.measure === "selection-feedback").at(-1);
  expect(measured?.durationMs).toBeLessThan(500);
  expect(measured?.withinBudget).toBe(true);
});

test("@inspection keyboard entry from Original waits for Current and Escape returns focus", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("preview-reference-toggle").click();
  await expect(page.getByTestId("preview-reference-toggle")).toHaveAttribute("aria-pressed", "true");
  await tabToTestId(page, "inspect-toggle");
  await page.keyboard.press("Enter");

  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  await expect.poll(() => workspaceFrame.locator("body").evaluate(() => (
    document.activeElement?.hasAttribute("data-canvas-helper-inspect-node") ?? false
  ))).toBe(true);
  const focusedNodeId = await workspaceFrame.locator("body").evaluate(() => (
    document.activeElement?.getAttribute("data-canvas-helper-inspect-node") ?? ""
  ));
  expect(focusedNodeId).not.toBe("");
  await workspaceFrame.locator(`[data-canvas-helper-inspect-node="${focusedNodeId}"]`).press("Escape");
  await expect(page.getByTestId("inspect-toggle")).toBeFocused();
  await expect(page.getByTestId("inspect-toggle")).toHaveAttribute("aria-pressed", "false");
});

test("@inspection Full Preview keyboard annotation focuses course content and restores its Annotate control", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  const previewPagePromise = page.waitForEvent("popup");
  await page.getByTestId("open-workspace-preview-toggle").click();
  const previewPage = await previewPagePromise;
  await previewPage.waitForLoadState("domcontentloaded");
  const previewInspect = previewPage.locator('[data-canvas-helper-preview-inspect="true"]');
  const standaloneCourse = previewPage.frameLocator('[data-canvas-helper-standalone-course="true"]');
  await expect(previewInspect).toBeVisible();
  await previewInspect.focus();
  await previewInspect.press("Enter");
  await expect(standaloneCourse.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  await expect.poll(() => standaloneCourse.locator("body").evaluate(() => (
    document.activeElement?.hasAttribute("data-canvas-helper-inspect-node") ?? false
  ))).toBe(true);
  await standaloneCourse.locator(":focus").press("Escape");
  await expect(previewInspect).toBeFocused();
  await expect(previewInspect).toHaveAttribute("aria-pressed", "false");
  await previewPage.close();
});

test("@inspection Edit mode shows real editable areas and routes blocked content to Annotate", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  const runtimeControl = workspaceFrame.getByTestId("mode-toggle");
  await runtimeControl.click();
  await expect(runtimeControl).toHaveText("Hide admin-only");
  await page.getByTestId("edit-toggle").click();
  await expect(page.getByTestId("edit-mode-bar")).toBeVisible();

  const courseRoot = workspaceFrame.locator("html");
  const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
  const mapToolbar = workspaceFrame.locator('[data-canvas-helper-edit-map-toolbar="true"]');
  await expect(courseRoot).toHaveAttribute("data-canvas-helper-edit-map-active", "true");
  await expect(mapToolbar).toBeVisible();
  await expect(mapToolbar.locator('[data-canvas-helper-edit-map-count="true"]')).toContainText(/editable areas?/);
  await expect(heading).toHaveAttribute("data-canvas-helper-edit-map-state", "editable");
  await expect(heading).toHaveAttribute("data-canvas-helper-edit-map-outline", "true");

  const outlineToggle = mapToolbar.locator('[data-canvas-helper-edit-map-toggle="true"]');
  await outlineToggle.click();
  await expect(courseRoot).toHaveAttribute("data-canvas-helper-edit-map-show", "false");
  await outlineToggle.click();
  await expect(courseRoot).toHaveAttribute("data-canvas-helper-edit-map-show", "true");

  const header = workspaceFrame.locator("header");
  const headerBounds = await header.boundingBox();
  expect(headerBounds).toBeTruthy();
  await page.mouse.click((headerBounds?.x ?? 0) + 5, (headerBounds?.y ?? 0) + 24);
  await expect(page.getByTestId("course-inline-text-editor")).toBeVisible();
  await expect(page.getByTestId("course-edit-inline-composer")).toBeVisible();

  await expect(runtimeControl).toHaveAttribute("data-canvas-helper-edit-map-state", "blocked");
  const runtimeControlBounds = await runtimeControl.boundingBox();
  expect(runtimeControlBounds).toBeTruthy();
  await page.mouse.move((runtimeControlBounds?.x ?? 0) + 5, (runtimeControlBounds?.y ?? 0) + 5);
  await expect(workspaceFrame.locator('[data-canvas-helper-edit-map-tooltip="true"]')).toContainText("Course code replaces this element");
  await expect(workspaceFrame.locator('[data-canvas-helper-preview-selection-overlay="true"]')).toHaveCSS("border-style", "dashed");
  await page.mouse.click((runtimeControlBounds?.x ?? 0) + 5, (runtimeControlBounds?.y ?? 0) + 5);
  await expect(page.getByTestId("course-edit-unsupported")).toBeVisible();
  await page.getByTestId("course-edit-annotate-target").click();
  await expect(page.getByTestId("inspection-teacher-note")).toBeVisible();
  await expect(page.getByTestId("edit-mode-bar")).toHaveCount(0);
});

test("@inspection a selected edit outline follows the course while it scrolls", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  const runtimeControl = workspaceFrame.getByTestId("mode-toggle");
  await runtimeControl.click();
  await page.getByTestId("edit-toggle").click();
  await workspaceFrame.locator("body").evaluate((body) => {
    const tail = document.createElement("div");
    tail.style.height = "1440px";
    body.append(tail);
  });

  const editableHeading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
  const pointerBounds = await editableHeading.boundingBox();
  expect(pointerBounds).toBeTruthy();
  await page.mouse.click((pointerBounds?.x ?? 0) + 5, (pointerBounds?.y ?? 0) + 5);

  const overlay = workspaceFrame.locator('[data-canvas-helper-preview-selection-overlay="true"]');
  await expect(overlay).toBeVisible();
  const beforeOverlay = await overlay.boundingBox();
  expect(beforeOverlay).toBeTruthy();

  await workspaceFrame.locator("body").evaluate(() => window.scrollBy({ top: 32, behavior: "auto" }));

  await expect.poll(async () => {
    const currentOverlay = await overlay.boundingBox();
    return Boolean(currentOverlay && Math.abs(currentOverlay.y - (beforeOverlay?.y ?? 0)) > 20);
  }).toBe(true);
});

test("@inspection scroll persistence is coalesced while Edit mode stays responsive", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("edit-toggle").click();
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await workspaceFrame.locator("body").evaluate((body) => {
    const tail = document.createElement("div");
    tail.style.height = "2400px";
    body.append(tail);
  });

  await page.evaluate(() => {
    const scope = window as typeof window & {
      __previewScrollWrites?: number;
      __previewScrollSetItem?: typeof Storage.prototype.setItem;
    };
    scope.__previewScrollWrites = 0;
    scope.__previewScrollSetItem ??= Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === "canvas-helper/preview-scroll") {
        scope.__previewScrollWrites = (scope.__previewScrollWrites ?? 0) + 1;
      }
      return scope.__previewScrollSetItem?.call(this, key, value);
    };
  });

  await workspaceFrame.locator("body").evaluate(async () => {
    for (let index = 0; index < 12; index += 1) {
      window.scrollBy({ top: 48, behavior: "auto" });
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
    }
  });
  await page.waitForTimeout(600);

  const persisted = await page.evaluate(() => {
    const scope = window as typeof window & {
      __previewScrollWrites?: number;
      __previewScrollSetItem?: typeof Storage.prototype.setItem;
    };
    const writes = scope.__previewScrollWrites ?? 0;
    const raw = window.localStorage.getItem("canvas-helper/preview-scroll");
    const positions = raw ? Object.values(JSON.parse(raw) as Record<string, { windowTop?: number }>) : [];
    Storage.prototype.setItem = scope.__previewScrollSetItem ?? Storage.prototype.setItem;
    delete scope.__previewScrollSetItem;
    return {
      writes,
      restoredPosition: positions.some((position) => (position.windowTop ?? 0) > 0)
    };
  });

  expect(persisted.writes).toBeGreaterThan(0);
  expect(persisted.writes).toBeLessThanOrEqual(3);
  expect(persisted.restoredPosition).toBe(true);
});

test("@inspection inline edits stay above the learner DOM, synchronize Review & Apply, apply once, and undo safely", async ({ page }) => {
  const fixtureSource = path.resolve("projects/e2e-fixture/workspace/index.html");
  const original = await readFile(fixtureSource, "utf8");
  let applied = false;
  let fullPreview: import("@playwright/test").Page | null = null;
  try {
    await openProjectInStudio(page, "e2e-fixture");
    await expect(page.getByTestId("edit-toggle")).toBeEnabled();
    await page.getByTestId("edit-toggle").click();
    await expect(page.getByTestId("edit-mode-bar")).toBeVisible();

    const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
    const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
    await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
    const learnerStorageBefore = await workspaceFrame.locator("body").evaluate(() => {
      const scope = window as typeof window & { __inlineEditorEvents?: string[] };
      scope.__inlineEditorEvents = [];
      ["keydown", "input", "paste"].forEach((type) => window.addEventListener(type, () => scope.__inlineEditorEvents?.push(type)));
      return JSON.stringify(localStorage);
    });
    const bounds = await heading.boundingBox();
    expect(bounds).toBeTruthy();
    await page.mouse.click((bounds?.x ?? 0) + 12, (bounds?.y ?? 0) + 12);

    const inlineEditor = page.getByTestId("course-inline-text-editor");
    await expect(inlineEditor).toBeVisible();
    const inlineField = inlineEditor.getByRole("textbox", { name: "Edit course text in place" });
    await expect(inlineField).toHaveAttribute("tabindex", "0");
    await inlineField.focus();
    await page.keyboard.press("ControlOrMeta+A");
    await page.keyboard.type("E2E Fixture Workspace — draft");
    await expect(page.getByTestId("course-edit-inline-panel-text")).toHaveValue("E2E Fixture Workspace — draft");
    const liveOverlay = workspaceFrame.locator('[data-canvas-helper-edit-preview-overlay="true"]');
    await expect(liveOverlay).toHaveCount(0);
    await expect(heading).toHaveText("E2E Fixture Workspace");
    expect(await readFile(fixtureSource, "utf8")).toBe(original);
    expect(await workspaceFrame.locator("body").evaluate(() => {
      const scope = window as typeof window & { __inlineEditorEvents?: string[] };
      return { events: scope.__inlineEditorEvents ?? [], storage: JSON.stringify(localStorage) };
    })).toEqual({ events: [], storage: learnerStorageBefore });
    await expect(page.getByTestId("course-edit-inline-save")).toBeEnabled();
    await page.getByTestId("course-edit-inline-save").click();
    await expect(page.getByTestId("course-edit-draft")).toHaveCount(1);
    await page.getByTestId("course-edit-draft").getByRole("button", { name: "Edit in Review & Apply" }).click();
    const panelText = page.getByTestId("course-edit-inline-panel-text");
    await expect(panelText).toHaveValue("E2E Fixture Workspace — draft");
    await panelText.fill("E2E Fixture Workspace — applied");
    await expect(liveOverlay).toContainText("E2E Fixture Workspace — applied");
    await expect(liveOverlay).toHaveAttribute("aria-hidden", "true");
    await expect(liveOverlay).toHaveAttribute("inert", "");
    await expect(heading).toHaveText("E2E Fixture Workspace");
    expect(await readFile(fixtureSource, "utf8")).toBe(original);
    await expect(page.getByTestId("course-edit-inline-save")).toBeEnabled();
    await page.getByTestId("course-edit-inline-save").click();
    await expect(page.getByTestId("course-edit-draft")).toContainText("E2E Fixture Workspace — applied");

    const fullPreviewPromise = page.waitForEvent("popup");
    await page.getByTestId("open-workspace-preview-toggle").click();
    fullPreview = await fullPreviewPromise;
    await fullPreview.waitForLoadState("domcontentloaded");
    const standaloneCourse = fullPreview.frameLocator('[data-canvas-helper-standalone-course="true"]');
    const standaloneHeading = standaloneCourse.getByRole("heading", { name: "E2E Fixture Workspace" });
    await expect(standaloneHeading).toBeVisible();
    await expect(standaloneCourse.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
    await expect(standaloneCourse.locator("html")).toHaveAttribute("data-canvas-helper-edit-map-active", "true");
    await expect(fullPreview.locator('[data-canvas-helper-full-preview-ready-guard="true"]')).toBeHidden();
    const standaloneLearnerStorageBefore = await standaloneCourse.locator("body").evaluate(() => {
      const scope = window as typeof window & { __fullPreviewInlineEditorEvents?: string[] };
      scope.__fullPreviewInlineEditorEvents = [];
      ["keydown", "input", "paste"].forEach((type) => window.addEventListener(type, () => scope.__fullPreviewInlineEditorEvents?.push(type)));
      return JSON.stringify(localStorage);
    });
    const standaloneBounds = await standaloneHeading.boundingBox();
    expect(standaloneBounds).toBeTruthy();
    await fullPreview.mouse.click((standaloneBounds?.x ?? 0) + 12, (standaloneBounds?.y ?? 0) + 12);
    const standaloneInlineEditor = fullPreview.getByTestId("course-full-preview-inline-text-editor");
    await expect(standaloneInlineEditor).toBeVisible();
    await expect(standaloneInlineEditor).toHaveAttribute("tabindex", "0");
    await standaloneInlineEditor.focus();
    await fullPreview.keyboard.press("ControlOrMeta+A");
    await fullPreview.keyboard.type("E2E Fixture Workspace — Full Preview");
    // Full Preview must not repaint an older bridge command over live typing.
    // Waiting beyond the editor's normalization debounce makes the ordering
    // contract observable instead of relying on a timing-sensitive immediate
    // assertion.
    await fullPreview.waitForTimeout(350);
    await expect(standaloneInlineEditor).toHaveText("E2E Fixture Workspace — Full Preview");
    await expect(page.getByTestId("course-edit-inline-panel-text")).toHaveValue("E2E Fixture Workspace — Full Preview");
    await expect(standaloneCourse.getByRole("heading", { name: "E2E Fixture Workspace" })).toHaveText("E2E Fixture Workspace");
    await expect(standaloneCourse.locator('[data-canvas-helper-edit-preview-overlay="true"]')).toHaveCount(0);
    expect(await standaloneCourse.locator("body").evaluate(() => {
      const scope = window as typeof window & { __fullPreviewInlineEditorEvents?: string[] };
      return { events: scope.__fullPreviewInlineEditorEvents ?? [], storage: JSON.stringify(localStorage) };
    })).toEqual({ events: [], storage: standaloneLearnerStorageBefore });
    expect(await readFile(fixtureSource, "utf8")).toBe(original);
    const standalonePanelText = fullPreview.locator('[data-canvas-helper-preview-edit-html="true"]');
    await expect(standalonePanelText).toContainText("E2E Fixture Workspace — Full Preview");
    await standalonePanelText.fill("E2E Fixture Workspace — applied");
    await expect(standaloneInlineEditor).toHaveText("E2E Fixture Workspace — applied");
    await expect(page.getByTestId("course-edit-inline-panel-text")).toHaveValue("E2E Fixture Workspace — applied");
    await fullPreview.getByRole("button", { name: "Save text draft" }).click();
    await expect(standaloneInlineEditor).toHaveCount(0);
    await expect(page.getByTestId("course-edit-draft")).toContainText("E2E Fixture Workspace — applied");
    await fullPreview.close();
    fullPreview = null;

    await expect(liveOverlay).toHaveCount(0);
    await page.getByTestId("course-edit-apply").click();
    applied = true;
    await expect(workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace — applied" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("course-edit-draft")).toHaveCount(0);
    await expect(page.getByTestId("course-edit-undo")).toBeVisible();

    const undoResponse = page.waitForResponse((response) => (
      new URL(response.url()).pathname === "/api/projects/e2e-fixture/course-edits/undo" &&
      response.request().method() === "POST"
    ));
    await page.getByTestId("course-edit-undo").click();
    expect((await undoResponse).ok()).toBe(true);
    await expect(workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("course-edit-undo")).toHaveCount(0);
    applied = false;
  } finally {
    await fullPreview?.close().catch(() => undefined);
    if (applied) {
      await page.request.post("/api/projects/e2e-fixture/course-edits/undo").catch(() => undefined);
    }
    expect(await readFile(fixtureSource, "utf8")).toBe(original);
    await page.evaluate(() => {
      for (const key of ["canvas-helper/course-edit-drafts-v2", "canvas-helper/course-edit-drafts-v1", "canvas-helper/course-edit-inline-recovery-v1"]) {
        const stored = JSON.parse(localStorage.getItem(key) || "null");
        if (!stored?.projects) continue;
        stored.projects = stored.projects.filter((entry: { projectSlug?: string }) => entry.projectSlug !== "e2e-fixture");
        localStorage.setItem(key, JSON.stringify(stored));
      }
    }).catch(() => undefined);
  }
});

test("@inspection structured editable content opens its controls at the selected element in embedded and Full Preview", async ({ page }) => {
  const fixtureSource = path.resolve("projects/e2e-fixture/workspace/index.html");
  const original = await readFile(fixtureSource, "utf8");
  let fullPreview: import("@playwright/test").Page | null = null;
  const staticButton = '<button type="button" data-testid="inline-static-button">Static course button</button>';
  const staticLink = '<a href="https://example.test/course" data-testid="inline-static-link">Static course link</a>';
  const structuredTarget = '<p data-testid="inline-rich-target">Read <strong>this</strong> closely.</p>';
  try {
    const injectedSource = original.replace("<section class=\"renderer\" data-testid=\"quick-checkpoints\">", `${staticButton}\n      ${staticLink}\n      ${structuredTarget}\n\n      <section class=\"renderer\" data-testid=\"quick-checkpoints\">`);
    await writeFile(fixtureSource, injectedSource, "utf8");
    await openProjectInStudio(page, "e2e-fixture");
    await page.getByTestId("edit-toggle").click();

    const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
    const staticButtonTarget = workspaceFrame.getByTestId("inline-static-button");
    await staticButtonTarget.scrollIntoViewIfNeeded();
    const staticButtonBounds = await staticButtonTarget.boundingBox();
    expect(staticButtonBounds).toBeTruthy();
    await page.mouse.click((staticButtonBounds?.x ?? 0) + 8, (staticButtonBounds?.y ?? 0) + 8);
    const staticButtonEditor = page.getByTestId("course-inline-text-editor");
    await expect(staticButtonEditor).toBeVisible();
    await expect(staticButtonEditor.getByRole("textbox", { name: "Edit course text in place" })).toHaveText("Static course button");
    await staticButtonEditor.getByRole("textbox", { name: "Edit course text in place" }).press("Escape");
    await expect(staticButtonEditor).toHaveCount(0);

    const staticLinkTarget = workspaceFrame.getByTestId("inline-static-link");
    await staticLinkTarget.scrollIntoViewIfNeeded();
    const staticLinkBounds = await staticLinkTarget.boundingBox();
    expect(staticLinkBounds).toBeTruthy();
    await page.mouse.click((staticLinkBounds?.x ?? 0) + 8, (staticLinkBounds?.y ?? 0) + 8);
    await expect(staticButtonEditor).toBeVisible();
    await staticButtonEditor.getByRole("textbox", { name: "Edit course text in place" }).fill("Updated course link");
    await staticButtonEditor.getByTestId("course-inline-text-editor-options").click();
    const embeddedLinkComposer = page.getByTestId("course-inline-target-editor");
    await expect(embeddedLinkComposer).toBeVisible();
    await expect(embeddedLinkComposer.getByTestId("course-edit-html")).toContainText("Updated course link");
    await expect(embeddedLinkComposer.getByText("Link destination", { exact: true })).toBeVisible();
    await expect(page.getByTestId("course-edit-draft")).toContainText("Updated course link");
    await embeddedLinkComposer.getByRole("button", { name: "Close in-place editor" }).click();
    await expect(embeddedLinkComposer).toHaveCount(0);

    const embeddedTarget = workspaceFrame.getByTestId("inline-rich-target");
    await embeddedTarget.scrollIntoViewIfNeeded();
    const embeddedBounds = await embeddedTarget.boundingBox();
    expect(embeddedBounds).toBeTruthy();
    await page.mouse.click((embeddedBounds?.x ?? 0) + 4, (embeddedBounds?.y ?? 0) + 10);
    const embeddedComposer = page.getByTestId("course-inline-target-editor");
    await expect(embeddedComposer).toBeVisible();
    await expect(embeddedComposer.getByTestId("course-edit-html")).toContainText("Read this closely.");
    await expect(embeddedTarget).toHaveText("Read this closely.");
    expect(await readFile(fixtureSource, "utf8")).toBe(injectedSource);

    const fullPreviewPromise = page.waitForEvent("popup");
    await page.getByTestId("open-workspace-preview-toggle").click();
    fullPreview = await fullPreviewPromise;
    await fullPreview.waitForLoadState("domcontentloaded");
    const standaloneCourse = fullPreview.frameLocator('[data-canvas-helper-standalone-course="true"]');
    const standaloneLink = standaloneCourse.getByTestId("inline-static-link");
    await expect(standaloneLink).toBeVisible();
    const standaloneTarget = standaloneCourse.getByTestId("inline-rich-target");
    await expect(standaloneTarget).toBeVisible();
    await expect(standaloneCourse.locator("html")).toHaveAttribute("data-canvas-helper-edit-map-active", "true");
    await standaloneLink.scrollIntoViewIfNeeded();
    const standaloneLinkBounds = await standaloneLink.boundingBox();
    expect(standaloneLinkBounds).toBeTruthy();
    await fullPreview.mouse.click((standaloneLinkBounds?.x ?? 0) + 4, (standaloneLinkBounds?.y ?? 0) + 8);
    const standaloneInlineEditor = fullPreview.getByTestId("course-full-preview-inline-text-editor");
    await expect(standaloneInlineEditor).toBeVisible();
    await standaloneInlineEditor.fill("Full Preview course link");
    await fullPreview.getByTestId("course-full-preview-inline-options").click();
    await expect(standaloneInlineEditor).toHaveCount(0);
    const standalonePanel = fullPreview.locator('[data-canvas-helper-preview-edit-panel="true"]');
    await expect(standalonePanel).toBeVisible();
    await expect(standalonePanel).toHaveAttribute("data-canvas-helper-preview-edit-panel-placement", /selection/);
    await expect(standalonePanel.locator('[data-canvas-helper-preview-edit-html="true"]')).toContainText("Full Preview course link");
    await expect(standalonePanel.getByText("Link destination", { exact: true })).toBeVisible();

    await standaloneTarget.scrollIntoViewIfNeeded();
    const standaloneBounds = await standaloneTarget.boundingBox();
    expect(standaloneBounds).toBeTruthy();
    await fullPreview.mouse.click((standaloneBounds?.x ?? 0) + 4, (standaloneBounds?.y ?? 0) + 10);
    await expect(standalonePanel).toBeVisible();
    await expect(standalonePanel).toHaveAttribute("data-canvas-helper-preview-edit-panel-placement", /selection/);
    await expect(standalonePanel.locator('[data-canvas-helper-preview-edit-html="true"]')).toContainText("Read this closely.");
    await expect(standaloneTarget).toHaveText("Read this closely.");
    expect(await readFile(fixtureSource, "utf8")).toBe(injectedSource);
  } finally {
    await fullPreview?.close().catch(() => undefined);
    await writeFile(fixtureSource, original, "utf8");
    await page.evaluate(() => {
      for (const key of ["canvas-helper/course-edit-drafts-v2", "canvas-helper/course-edit-drafts-v1", "canvas-helper/course-edit-inline-recovery-v1"]) {
        const stored = JSON.parse(localStorage.getItem(key) || "null");
        if (!stored?.projects) continue;
        stored.projects = stored.projects.filter((entry: { projectSlug?: string }) => entry.projectSlug !== "e2e-fixture");
        localStorage.setItem(key, JSON.stringify(stored));
      }
    }).catch(() => undefined);
  }
});

test("@inspection opening Full Preview transfers an active in-place caret to the same visible text", async ({ page }) => {
  let fullPreview: import("@playwright/test").Page | null = null;
  try {
    await openProjectInStudio(page, "e2e-fixture");
    await page.getByTestId("edit-toggle").click();

    const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
    const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
    const bounds = await heading.boundingBox();
    expect(bounds).toBeTruthy();
    await page.mouse.click((bounds?.x ?? 0) + 12, (bounds?.y ?? 0) + 12);

    const embeddedInlineEditor = page.getByTestId("course-inline-text-editor");
    await expect(embeddedInlineEditor).toBeVisible();
    await embeddedInlineEditor.getByRole("textbox", { name: "Edit course text in place" }).fill("E2E Fixture Workspace — carried into Full Preview");

    const fullPreviewPromise = page.waitForEvent("popup");
    await page.getByTestId("open-workspace-preview-toggle").click();
    fullPreview = await fullPreviewPromise;
    await fullPreview.waitForLoadState("domcontentloaded");
    const standaloneCourse = fullPreview.frameLocator('[data-canvas-helper-standalone-course="true"]');
    await expect(standaloneCourse.locator("html")).toHaveAttribute("data-canvas-helper-edit-map-active", "true");
    await expect(fullPreview.locator('[data-canvas-helper-full-preview-ready-guard="true"]')).toBeHidden();

    const standaloneInlineEditor = fullPreview.getByTestId("course-full-preview-inline-text-editor");
    await expect(standaloneInlineEditor).toBeVisible();
    await expect(standaloneInlineEditor).toHaveText("E2E Fixture Workspace — carried into Full Preview");
    await expect(page.getByTestId("course-inline-text-editor")).toHaveCount(0);
    await expect(standaloneCourse.getByRole("heading", { name: "E2E Fixture Workspace" })).toHaveText("E2E Fixture Workspace");
  } finally {
    await fullPreview?.close().catch(() => undefined);
  }
});

test("@inspection external source drift detaches the in-place draft until it is explicitly rebased", async ({ page }) => {
  const fixtureSource = path.resolve("projects/e2e-fixture/workspace/index.html");
  const original = await readFile(fixtureSource, "utf8");
  const keyedOriginal = original.replace("<h1>E2E Fixture Workspace</h1>", '<h1 data-canvas-helper-edit-key="fixture-title">E2E Fixture Workspace</h1>');
  try {
    await writeFile(fixtureSource, keyedOriginal, "utf8");
    await openProjectInStudio(page, "e2e-fixture");
    await page.getByTestId("edit-toggle").click();
    const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
    const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
    const bounds = await heading.boundingBox();
    expect(bounds).toBeTruthy();
    await page.mouse.click((bounds?.x ?? 0) + 12, (bounds?.y ?? 0) + 12);
    await page.getByTestId("course-inline-text-editor").getByRole("textbox", { name: "Edit course text in place" }).fill("Teacher proposal");
    await expect(page.getByTestId("course-edit-inline-composer")).toContainText("Text is ready to save.");

    await writeFile(
      fixtureSource,
      keyedOriginal.replace("E2E Fixture Workspace</h1>", "E2E Fixture Workspace — external update</h1>"),
      "utf8"
    );

    const detached = page.getByTestId("course-edit-inline-detached");
    await expect(detached).toBeVisible({ timeout: 8_000 });
    await expect(detached).toContainText("Source changed externally");
    await expect(detached.getByLabel("Your proposed text")).toHaveValue("Teacher proposal");
    await expect(page.getByTestId("course-inline-text-editor")).toHaveCount(0);
    await expect(heading).toHaveText("E2E Fixture Workspace");
    await expect.poll(() => page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem("canvas-helper/course-edit-inline-recovery-v1") || "null");
      return stored?.projects?.some((entry: { projectSlug?: string; recovery?: { requiresRebase?: boolean; document?: { text?: string } } }) => (
        entry.projectSlug === "e2e-fixture" &&
        entry.recovery?.requiresRebase === true &&
        entry.recovery.document?.text === "Teacher proposal"
      )) ?? false;
    })).toBe(true);

    await detached.getByRole("button", { name: "Reopen against current source" }).click();
    await expect(detached.getByLabel("Current course text")).toHaveValue("E2E Fixture Workspace — external update");
    await detached.getByRole("button", { name: "Rebase proposed text" }).click();
    await expect(page.getByTestId("course-edit-inline-composer")).toContainText("Text is ready to save.");
    await expect(page.getByTestId("course-edit-inline-panel-text")).toHaveValue("Teacher proposal");
  } finally {
    await writeFile(fixtureSource, original, "utf8");
    await page.evaluate(() => {
      for (const key of ["canvas-helper/course-edit-drafts-v2", "canvas-helper/course-edit-drafts-v1", "canvas-helper/course-edit-inline-recovery-v1"]) {
        const stored = JSON.parse(localStorage.getItem(key) || "null");
        if (!stored?.projects) continue;
        stored.projects = stored.projects.filter((entry: { projectSlug?: string }) => entry.projectSlug !== "e2e-fixture");
        localStorage.setItem(key, JSON.stringify(stored));
      }
    }).catch(() => undefined);
  }
});

test("@inspection unsaved in-place text survives reload and is re-resolved before it can be saved", async ({ page }) => {
  const fixtureSource = path.resolve("projects/e2e-fixture/workspace/index.html");
  const original = await readFile(fixtureSource, "utf8");
  try {
    await openProjectInStudio(page, "e2e-fixture");
    await page.getByTestId("edit-toggle").click();
    const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
    const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
    const bounds = await heading.boundingBox();
    expect(bounds).toBeTruthy();
    await page.mouse.click((bounds?.x ?? 0) + 12, (bounds?.y ?? 0) + 12);
    await page.getByTestId("course-inline-text-editor").getByRole("textbox", { name: "Edit course text in place" }).fill("Recovered teacher proposal");
    await expect(page.getByTestId("course-edit-inline-composer")).toContainText("Text is ready to save.");
    await expect.poll(() => page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem("canvas-helper/course-edit-inline-recovery-v1") || "null");
      return stored?.projects?.some((entry: { projectSlug?: string; recovery?: { document?: { text?: string } } }) => (
        entry.projectSlug === "e2e-fixture" && entry.recovery?.document?.text === "Recovered teacher proposal"
      )) ?? false;
    })).toBe(true);
    expect(await readFile(fixtureSource, "utf8")).toBe(original);

    // A fresh Studio load restores only a browser-local recovery prompt. It
    // does not restore an authoritative caret or alter the learner source.
    await openProjectInStudio(page, "e2e-fixture");
    const recovered = page.getByTestId("course-edit-inline-recovery");
    await expect(recovered).toBeVisible();
    await expect(recovered.getByLabel("Your recovered text")).toHaveValue("Recovered teacher proposal");
    await expect(page.getByTestId("course-inline-text-editor")).toHaveCount(0);
    expect(await readFile(fixtureSource, "utf8")).toBe(original);

    // A pending recovery is one working draft. Starting another target cannot
    // silently overwrite it in browser storage.
    await page.getByTestId("edit-toggle").click();
    const reloadedFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
    const reloadedHeading = reloadedFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
    const reloadedBounds = await reloadedHeading.boundingBox();
    expect(reloadedBounds).toBeTruthy();
    await page.mouse.click((reloadedBounds?.x ?? 0) + 12, (reloadedBounds?.y ?? 0) + 12);
    await expect(recovered).toBeVisible();
    await expect(page.getByTestId("course-edit-inline-composer")).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem("canvas-helper/course-edit-inline-recovery-v1") || "null");
      return stored?.projects?.some((entry: { projectSlug?: string; recovery?: { document?: { text?: string } } }) => (
        entry.projectSlug === "e2e-fixture" && entry.recovery?.document?.text === "Recovered teacher proposal"
      )) ?? false;
    })).toBe(true);

    await recovered.getByTestId("course-edit-inline-recover").click();
    await expect(page.getByTestId("course-edit-inline-composer")).toBeVisible();
    await expect(page.getByTestId("course-edit-inline-panel-text")).toHaveValue("Recovered teacher proposal");
    await expect(page.getByTestId("course-edit-inline-composer")).toContainText("Text is ready to save.");
    await page.getByTestId("course-edit-inline-save").click();
    await expect(page.getByTestId("course-edit-draft")).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem("canvas-helper/course-edit-inline-recovery-v1") || "null");
      return !(stored?.projects?.some((entry: { projectSlug?: string }) => entry.projectSlug === "e2e-fixture"));
    })).toBe(true);
    expect(await readFile(fixtureSource, "utf8")).toBe(original);
  } finally {
    await writeFile(fixtureSource, original, "utf8");
    await page.evaluate(() => {
      for (const key of ["canvas-helper/course-edit-drafts-v2", "canvas-helper/course-edit-drafts-v1", "canvas-helper/course-edit-inline-recovery-v1"]) {
        const stored = JSON.parse(localStorage.getItem(key) || "null");
        if (!stored?.projects) continue;
        stored.projects = stored.projects.filter((entry: { projectSlug?: string }) => entry.projectSlug !== "e2e-fixture");
        localStorage.setItem(key, JSON.stringify(stored));
      }
    }).catch(() => undefined);
  }
});

test("@inspection recovered unsaved text is discarded explicitly without writing the course", async ({ page }) => {
  const fixtureSource = path.resolve("projects/e2e-fixture/workspace/index.html");
  const original = await readFile(fixtureSource, "utf8");
  try {
    await openProjectInStudio(page, "e2e-fixture");
    await page.getByTestId("edit-toggle").click();
    const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
    const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
    const bounds = await heading.boundingBox();
    expect(bounds).toBeTruthy();
    await page.mouse.click((bounds?.x ?? 0) + 12, (bounds?.y ?? 0) + 12);
    await page.getByTestId("course-inline-text-editor").getByRole("textbox", { name: "Edit course text in place" }).fill("Text that should be discarded");
    await expect.poll(() => page.evaluate(() => Boolean(localStorage.getItem("canvas-helper/course-edit-inline-recovery-v1")))).toBe(true);

    await openProjectInStudio(page, "e2e-fixture");
    const recovered = page.getByTestId("course-edit-inline-recovery");
    await expect(recovered).toBeVisible();
    await recovered.getByRole("button", { name: "Discard" }).click();
    await expect(recovered).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => {
      const stored = JSON.parse(localStorage.getItem("canvas-helper/course-edit-inline-recovery-v1") || "null");
      return !(stored?.projects?.some((entry: { projectSlug?: string }) => entry.projectSlug === "e2e-fixture"));
    })).toBe(true);
    expect(await readFile(fixtureSource, "utf8")).toBe(original);
  } finally {
    await writeFile(fixtureSource, original, "utf8");
    await page.evaluate(() => {
      for (const key of ["canvas-helper/course-edit-drafts-v2", "canvas-helper/course-edit-drafts-v1", "canvas-helper/course-edit-inline-recovery-v1"]) {
        const stored = JSON.parse(localStorage.getItem(key) || "null");
        if (!stored?.projects) continue;
        stored.projects = stored.projects.filter((entry: { projectSlug?: string }) => entry.projectSlug !== "e2e-fixture");
        localStorage.setItem(key, JSON.stringify(stored));
      }
    }).catch(() => undefined);
  }
});

test("@inspection reduced motion and high-contrast annotation copy remain explicit", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("inspect-toggle").click();
  const annotationCopy = page.getByTestId("annotation-mode-bar").locator(".annotation-mode-copy span");
  await expect(annotationCopy).toHaveCSS("color", "rgb(255, 255, 255)");
  const transitionDurationSeconds = await page.getByTestId("layout-focus-toggle").evaluate((element) => (
    getComputedStyle(element).transitionDuration.split(",").map((value) => {
      const duration = Number.parseFloat(value);
      return value.trim().endsWith("ms") ? duration / 1_000 : duration;
    })
  ));
  expect(Math.max(...transitionDurationSeconds)).toBeLessThanOrEqual(0.00001);
});

test("@inspection keyboard traversal sees mapped content added after preview readiness", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await tabToTestId(page, "inspect-toggle");
  await page.keyboard.press("Enter");
  await expect.poll(() => workspaceFrame.locator("body").evaluate(() => (
    document.activeElement?.hasAttribute("data-canvas-helper-inspect-node") ?? false
  ))).toBe(true);
  await workspaceFrame.locator("body").evaluate((body) => {
    const heading = document.createElement("h2");
    heading.setAttribute("data-canvas-helper-inspect-node", "ch1:000000000000000000000000:9999");
    heading.textContent = "Late mapped heading";
    body.appendChild(heading);
  });
  await expect(workspaceFrame.getByRole("heading", { name: "Late mapped heading" })).toBeVisible();
  let foundLateHeading = false;
  for (let index = 0; index < 80 && !foundLateHeading; index += 1) {
    foundLateHeading = await workspaceFrame.locator("body").evaluate(() => document.activeElement?.textContent === "Late mapped heading");
    if (!foundLateHeading) await workspaceFrame.locator(":focus").press("ArrowDown");
  }
  expect(foundLateHeading).toBe(true);
});

test("@inspection repeated pointer hover keeps the mapped-node index warm", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("inspect-toggle").click();
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
  const bounds = await heading.boundingBox();
  expect(bounds).toBeTruthy();
  for (let index = 0; index < 20; index += 1) {
    await page.mouse.move((bounds?.x ?? 0) + 5 + index, (bounds?.y ?? 0) + 8);
  }
  await expect.poll(() => workspaceFrame.locator("html").getAttribute("data-canvas-helper-source-index-builds")).toBe("1");
});

test("@inspection keyboard entry remains responsive with a large mapped course page", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await workspaceFrame.locator("body").evaluate((body) => {
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 2_500; index += 1) {
      const item = document.createElement("p");
      item.setAttribute("data-canvas-helper-inspect-node", `ch1:000000000000000000000000:${10_000 + index}`);
      item.textContent = `Mapped course item ${index + 1}`;
      fragment.appendChild(item);
    }
    body.appendChild(fragment);
  });
  await tabToTestId(page, "inspect-toggle");
  const startedAt = Date.now();
  await page.keyboard.press("Enter");
  await expect.poll(() => workspaceFrame.locator("body").evaluate(() => (
    document.activeElement?.hasAttribute("data-canvas-helper-inspect-node") ?? false
  )), { timeout: 2_000 }).toBe(true);
  expect(Date.now() - startedAt).toBeLessThan(2_000);
});

test("@inspection a scroll container added after readiness is included in committed evidence", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("inspect-toggle").click();
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  await workspaceFrame.locator("body").evaluate((body) => {
    const container = document.createElement("div");
    container.id = "late-scroll-container";
    container.style.cssText = "height:80px;overflow:auto;border:1px solid transparent";
    const content = document.createElement("div");
    content.style.height = "600px";
    const target = document.createElement("h2");
    target.textContent = "Late scroll selection";
    target.style.marginTop = "180px";
    target.setAttribute("data-canvas-helper-inspect-node", "ch1:000000000000000000000000:9001");
    content.appendChild(target);
    container.appendChild(content);
    body.prepend(container);
    container.scrollTop = 140;
  });
  const resolutionRequest = page.waitForRequest((request) => (
    request.url().endsWith("/api/inspection/resolve") && request.method() === "POST"
  ));
  const lateTarget = workspaceFrame.getByRole("heading", { name: "Late scroll selection" });
  const bounds = await lateTarget.boundingBox();
  expect(bounds).toBeTruthy();
  await page.mouse.click((bounds?.x ?? 0) + 8, (bounds?.y ?? 0) + 8);
  const request = await resolutionRequest;
  const payload = request.postDataJSON() as { selection: { scroll: { containers: Array<{ selector: string; top: number }> } } };
  expect(payload.selection.scroll.containers).toEqual(expect.arrayContaining([
    expect.objectContaining({ selector: "#late-scroll-container", top: 140 })
  ]));
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
  await standaloneCourse.locator("body").evaluate(() => {
    window.dispatchEvent(new ErrorEvent("error", { message: "Standalone-only test failure" }));
  });
  await page.waitForTimeout(150);
  await expect(page.getByTestId("workspace-preview-warning")).toHaveCount(0);
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
  await expect(previewReviewPanel).toBeFocused();
  await expect(page.getByTestId("review-set-item")).toHaveCount(1);
  await expect(page.getByTestId("review-set-screenshot")).toHaveCount(1);
  await expect(previewReviewPanel.locator("img")).toHaveCount(1);
  const reselectionBounds = await standaloneHeading.boundingBox();
  expect(reselectionBounds).toBeTruthy();
  await previewPage.mouse.click(
    (reselectionBounds?.x ?? 0) + (reselectionBounds?.width ?? 0) / 2,
    (reselectionBounds?.y ?? 0) + (reselectionBounds?.height ?? 0) / 2
  );
  const standaloneDraft = previewPage.locator('[data-canvas-helper-preview-review-note="true"]');
  await expect(standaloneDraft).toBeEnabled();
  await expect.poll(() => previewReviewPanel.locator("img").evaluateAll((images) => (
    images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)
  ))).toBe(true);
  let extraThumbnailRequests = 0;
  previewPage.on("request", (request) => {
    if (request.method() === "GET" && request.url().includes("/api/inspection/screenshots?")) {
      extraThumbnailRequests += 1;
    }
  });
  await previewPage.waitForTimeout(300);
  extraThumbnailRequests = 0;
  await standaloneDraft.pressSequentially("Typing must not reload saved screenshots.");
  await previewPage.waitForTimeout(200);
  expect(extraThumbnailRequests).toBe(0);
  await standaloneDraft.fill("");
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
  await standaloneDraft.focus();
  await standaloneDraft.press("Escape");
  await expect(previewInspect).toBeFocused();
  await expect(previewInspect).toHaveAttribute("aria-pressed", "false");
  await previewInspect.click();
  await expect(previewInspect).toHaveAttribute("aria-pressed", "true");
  await previewReviewPanel.getByRole("button", { name: "Add screenshot" }).click();
  await expect(previewReviewPanel.locator("img")).toHaveCount(2);
  await previewReviewPanel.getByRole("button", { name: "Remove screenshot 2" }).click();
  await expect(previewReviewPanel.locator("img")).toHaveCount(1);
  await previewReviewPanel.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(previewPage.locator('[data-canvas-helper-preview-review-item="true"]')).toHaveCount(0);
  await expect(previewReviewPanel).toBeFocused();
  const previewUndo = previewPage.locator('[data-canvas-helper-preview-review-undo="true"]');
  await expect(previewUndo).toHaveText("Undo remove");
  await previewUndo.click();
  await expect(previewPage.locator('[data-canvas-helper-preview-review-item="true"]')).toHaveCount(1);
  await previewReviewPanel.getByRole("button", { name: "Show", exact: true }).click();
  await expect(standaloneCourse.locator("html")).toHaveAttribute("data-canvas-helper-inspection-focus", "true");
  const previewCopy = previewPage.locator('[data-canvas-helper-preview-review-copy="true"]');
  await expect(previewCopy).toBeEnabled();
  await previewCopy.click();
  await expect(previewPage.locator('[data-canvas-helper-preview-review-status="true"]')).toContainText("Sent to Codex");
  const sentPreviewItem = previewPage.locator('[data-canvas-helper-preview-review-item="true"]');
  await expect(sentPreviewItem).toContainText("Sent · verify");
  await expect(sentPreviewItem.getByLabel("Change note for annotation 1")).toBeDisabled();
  await expect(sentPreviewItem.getByRole("button", { name: "Add screenshot" })).toBeDisabled();
  await expect(sentPreviewItem.getByRole("button", { name: "Remove", exact: true })).toBeDisabled();
  await expect(previewPage.locator('[data-canvas-helper-preview-review-clear="true"]')).toBeDisabled();

  await page.reload();
  await expect(page.getByTestId("studio-shell")).toBeVisible();
  await page.getByTestId("workspace-project-select").selectOption("e2e-fixture");
  await waitForWorkspacePreviewReady(page, "e2e-fixture");
  await expect(previewStatus).toContainText("Connected to Studio", { timeout: 10_000 });
  await expect(previewPage.locator('[data-canvas-helper-preview-review-item="true"]')).toHaveCount(1);
  await expect(previewCopy).toBeDisabled();
  await sentPreviewItem.getByRole("button", { name: "Accept", exact: true }).click();
  await expect(previewPage.locator('[data-canvas-helper-preview-review-status="true"]')).toBeFocused();
  await expect(sentPreviewItem).toContainText("Accepted");
  await expect(previewPage.locator('[data-canvas-helper-preview-review-status="true"]')).toContainText("Change accepted");

  const returnToStudio = previewPage.locator('[data-canvas-helper-return-to-studio="true"]');
  await expect(returnToStudio).toHaveText("Return to Studio");
  const previewClosed = previewPage.waitForEvent("close");
  await returnToStudio.click();
  await previewClosed;
  await expect(page).toHaveURL(studioUrl);
  await expect(page.getByTestId("studio-shell")).toBeVisible();
  await expect(page.getByTestId("review-set")).toBeVisible();
  await expect(page.getByTestId("review-set-item")).toHaveCount(1);
  await expect(page.getByTestId("review-set-item")).toContainText("Accepted");
  await expect(page.getByTestId("verify-next-change")).toHaveText("Verification complete");
  await expect(page.getByTestId("copy-review-set")).toHaveCount(0);
  await page.getByTestId("review-set-item").getByRole("button", { name: "Reopen", exact: true }).click();
  await expect(page.getByTestId("review-set-item")).toContainText("Ready for follow-up");
  await expect(page.getByTestId("copy-review-set")).toHaveText("Copy Follow-up for Codex");
  await expect(page.getByTestId("copy-review-set")).toBeEnabled();

  const reopenedPreviewPromise = page.waitForEvent("popup");
  await page.getByTestId("open-workspace-preview-toggle").click();
  const reopenedPreview = await reopenedPreviewPromise;
  await reopenedPreview.waitForLoadState("domcontentloaded");
  await expect(reopenedPreview.locator('[data-canvas-helper-preview-controls="true"]')).toBeVisible();
  await reopenedPreview.locator('[data-canvas-helper-preview-review-toggle="true"]').click();
  await expect(reopenedPreview.locator('[data-canvas-helper-preview-review-item="true"]')).toHaveCount(1);
  await expect(reopenedPreview.locator('[data-canvas-helper-preview-review-item="true"]')).toContainText("Follow-up");
  await expect(reopenedPreview.locator('[data-canvas-helper-preview-review-copy="true"]')).toHaveText("Copy Follow-up for Codex");
  await expect(reopenedPreview.locator('[data-canvas-helper-preview-review-copy="true"]')).toBeEnabled();
  await reopenedPreview.close();
  const standaloneScreenshotReclaimed = page.waitForResponse((response) =>
    response.url().endsWith("/api/inspection/screenshots") && response.request().method() === "DELETE"
  );
  await page.getByTestId("review-set").getByRole("button", { name: "Clear" }).click();
  expect((await standaloneScreenshotReclaimed).ok()).toBe(true);
  await expect(page.getByTestId("review-set-item")).toHaveCount(0);
});

test("@inspection Full Preview cannot expose the raw course URL through auxiliary activation", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  const fullPreview = page.getByTestId("open-workspace-preview-toggle");
  await expect(fullPreview).toBeEnabled();
  await expect(fullPreview).toHaveJSProperty("tagName", "BUTTON");
  await expect(fullPreview).not.toHaveAttribute("href", /.+/);

  const pagesBeforeAuxiliaryClick = page.context().pages().length;
  await fullPreview.click({ button: "middle" });
  await page.waitForTimeout(150);
  expect(page.context().pages()).toHaveLength(pagesBeforeAuxiliaryClick);

  const popupPromise = page.waitForEvent("popup");
  await fullPreview.click();
  const previewPage = await popupPromise;
  await expect(previewPage).toHaveURL(/\/standalone-preview\?target=/);
  await previewPage.close();
});

test("@inspection full preview exposes retry and return actions when its course frame stays empty", async ({ page }) => {
  let workspaceDocumentCount = 0;
  await openProjectInStudio(page, "e2e-fixture");
  await page.context().route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (
      route.request().resourceType() === "document" &&
      requestUrl.pathname.includes("/preview/workspace/e2e-fixture/index.html")
    ) {
      workspaceDocumentCount += 1;
      if (workspaceDocumentCount === 1) {
        const response = await route.fetch();
        await route.fulfill({
          response,
          body: '<!doctype html><html><head><meta charset="utf-8"><script src="/_canvas-helper/preview-bridge.js"></script></head><body>   </body></html>'
        });
        return;
      }
    }
    await route.continue();
  });

  await expect(page.getByTestId("open-workspace-preview-toggle")).toBeEnabled();
  const popupPromise = page.waitForEvent("popup");
  await page.getByTestId("open-workspace-preview-toggle").click();
  const previewPage = await popupPromise;
  await previewPage.waitForLoadState("domcontentloaded");

  const retry = previewPage.locator('[data-canvas-helper-preview-retry="true"]');
  await expect(retry).toBeVisible({ timeout: 15_000 });
  await expect(previewPage.locator('[data-canvas-helper-preview-inspect-status="true"]')).toContainText("did not appear");
  await expect(previewPage.locator('[data-canvas-helper-return-to-studio="true"]')).toBeVisible();

  await retry.click();
  const standaloneCourse = previewPage.frameLocator('[data-canvas-helper-standalone-course="true"]');
  await expect(standaloneCourse.getByRole("heading", { name: "E2E Fixture Workspace" })).toBeVisible({ timeout: 10_000 });
  await expect(retry).toBeHidden();
  await previewPage.close();
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
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
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
  await expect(page.getByTestId("review-handoff-detail")).toHaveValue("compact");
  await page.getByTestId("review-handoff-detail").selectOption("diagnostic");
  await expect(page.getByTestId("review-packet-size")).toContainText("Diagnostic · ready");
  await page.getByTestId("review-handoff-detail").selectOption("compact");
  await expect(page.getByTestId("review-packet-size")).toContainText("Compact · ready");
  await page.getByTestId("copy-review-set").click();
  const compactPacket = await page.evaluate(() => navigator.clipboard.readText());
  expect(compactPacket).toContain("Schema: review-set-v4");
  expect(compactPacket).toContain("Detail: compact");
  expect(compactPacket).toContain("Cycle: initial review");
  expect(compactPacket).toContain("Items: 2");
  expect(compactPacket).toContain("Screenshots: 0 local PNGs");
  expect(compactPacket).not.toContain("Inspection node:");

  const reviewItems = page.getByTestId("review-set-item");
  await expect(page.getByTestId("review-verification")).toContainText("0 accepted · 2 to check · 0 follow-up");
  await expect(reviewItems.nth(0)).toContainText("Sent");
  await expect(reviewItems.nth(1)).toContainText("Sent");
  await expect(reviewItems.nth(0).getByRole("button", { name: "Remove", exact: true })).toBeDisabled();
  await expect(page.getByTestId("review-set").getByRole("button", { name: "Clear" })).toBeDisabled();
  await expect(page.getByTestId("copy-review-set")).toHaveCount(0);

  await reviewItems.nth(0).getByRole("button", { name: "Accept change" }).dblclick();
  await expect(reviewItems.nth(0)).toContainText("Accepted");
  await expect(reviewItems.nth(0).getByRole("button", { name: "Accepted", exact: true })).toBeDisabled();
  await expect(reviewItems.nth(0)).not.toContainText("Ready for follow-up");
  await reviewItems.nth(1).getByRole("button", { name: "Reopen for follow-up" }).click();
  await expect(reviewItems.nth(1)).toContainText("Ready for follow-up");
  await expect(page.getByTestId("review-verification")).toContainText("1 accepted · 0 to check · 1 follow-up");
  await expect(page.getByTestId("copy-review-set")).toHaveText("Copy Follow-up for Codex");
  await expect(page.getByTestId("copy-review-set")).toBeEnabled();
  await page.getByTestId("copy-review-set").click();
  const followUpPacket = await page.evaluate(() => navigator.clipboard.readText());
  expect(followUpPacket).toContain("Cycle: follow-up review");
  expect(followUpPacket).toContain("Items: 1");
  expect(followUpPacket).toContain("Explain what happens when learners select this.");
  expect(followUpPacket).not.toContain("Make this opening explanation more direct.");
  await expect(reviewItems.nth(1)).toContainText("Sent");
  await expect(page.getByTestId("review-verification")).toContainText("1 accepted · 1 to check · 0 follow-up");

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
  await expect(capture).toHaveText("Cancel capture", { timeout: 500 });
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
  await previewPage.locator('[data-canvas-helper-preview-review-item="true"]').getByRole("button", { name: "Show", exact: true }).click();
  await expect(previewPage.locator('[data-canvas-helper-preview-review-status="true"]')).toContainText("Annotation shown");
  expect(previewPage.isClosed()).toBe(false);
  await previewPage.reload();
  await expect(previewPage.frameLocator('[data-canvas-helper-standalone-course="true"]').getByRole("heading", { name: "E2E Fixture Alternate Page" })).toBeVisible();
  await expect(previewPage.locator('[data-canvas-helper-preview-inspect-status="true"]')).not.toContainText("Open this preview from Studio");
  await previewPage.close();

  await htmlSelect.selectOption("index.html");
  await expect(workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" })).toBeVisible();
  const stalePreviewPromise = page.waitForEvent("popup");
  await page.getByTestId("open-workspace-preview-toggle").click();
  const stalePreview = await stalePreviewPromise;
  await expect(stalePreview.locator('[data-canvas-helper-preview-inspect-status="true"]')).not.toContainText("Open this preview from Studio");
  await page.getByTestId("review-set-item").getByRole("button", { name: "Show", exact: true }).click();
  await expect.poll(() => stalePreview.isClosed()).toBe(true);
});

test("@inspection Show restores the saved query and hash state on the same course page", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  const currentState = () => workspaceFrame.locator("html")
    .evaluate(() => `${location.search}${location.hash}`)
    .catch(() => "");
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

test("@inspection changing projects aborts a late source-resolution response", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("layout-focus-toggle").click();
  await page.getByTestId("preview-workspace-toggle").click();

  let releaseInspectionResponse: (() => void) | null = null;
  let inspectionRequestAborted = false;
  page.on("requestfailed", (request) => {
    if (new URL(request.url()).pathname === "/api/inspection/resolve" && request.method() === "POST") {
      inspectionRequestAborted = true;
    }
  });
  await page.route("**/api/inspection/resolve", async (route) => {
    await new Promise<void>((resolve) => {
      releaseInspectionResponse = resolve;
    });
    await route.continue().catch(() => {});
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
  await projectSelect.selectOption(STUDIO_SECONDARY_FIXTURE);
  await expect(projectSelect).toHaveValue(STUDIO_SECONDARY_FIXTURE);
  await expect(page.getByTestId("inspection-selection-summary")).toHaveCount(0);

  releaseInspectionResponse?.();
  await expect.poll(() => inspectionRequestAborted).toBe(true);
  await waitForWorkspacePreviewReady(page, STUDIO_SECONDARY_FIXTURE);

  await expect(page.getByTestId("inspection-selection-summary")).toHaveCount(0);
});

test("@inspection each project restores its own layout, device, zoom, and Review Set visibility", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  const htmlSelect = page.getByTestId("workspace-html-select");
  await htmlSelect.selectOption("alternate.html");
  await page.getByTestId("layout-split-toggle").click();
  await page.getByRole("combobox", { name: "Preview device" }).selectOption("mobile");
  await page.getByRole("combobox", { name: "Preview zoom" }).selectOption("75");
  await page.getByTestId("inspector-toggle").click();
  await expect(page.getByTestId("review-set")).toBeVisible();

  await switchStudioFixture(page, STUDIO_FIXTURES.secondary);
  await expect(page.getByTestId("layout-focus-toggle")).toHaveClass(/active/);
  await expect(page.getByRole("combobox", { name: "Preview device" })).toHaveValue("desktop");
  await expect(page.getByRole("combobox", { name: "Preview zoom" })).toHaveValue("100");
  await expect(page.getByTestId("review-set")).toHaveCount(0);

  await switchStudioFixture(page, STUDIO_FIXTURES.primary);
  await expect(page.getByTestId("layout-split-toggle")).toHaveClass(/active/);
  await expect(page.getByRole("combobox", { name: "Preview device" })).toHaveValue("mobile");
  await expect(page.getByRole("combobox", { name: "Preview zoom" })).toHaveValue("75");
  await expect(page.getByTestId("review-set")).toBeVisible();
  await expect(htmlSelect).toHaveValue("alternate.html");
});

test("@inspection each project keeps its own temporary Review Set", async ({ page }) => {
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
  await page.getByTestId("inspection-teacher-note").fill("Keep this note with the fixture course.");
  await page.getByTestId("add-to-review-set").click();
  await expect(page.getByTestId("review-set-item")).toHaveCount(1);

  await switchStudioFixture(page, STUDIO_FIXTURES.secondary);
  await expect(page.getByTestId("review-set-item")).toHaveCount(0);

  await switchStudioFixture(page, STUDIO_FIXTURES.primary);
  await expect(page.getByTestId("review-set-item")).toHaveCount(1);
  await expect(page.getByTestId("review-set-item").locator("textarea")).toHaveValue(
    "Keep this note with the fixture course."
  );
});

test("@inspection named review sessions organize, move, merge, export, and import bounded work", async ({ page }) => {
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
  await page.getByTestId("inspection-teacher-note").fill("Make the opening heading more direct.");
  await page.getByTestId("add-to-review-set").click();
  await expect(page.getByTestId("review-set-item")).toHaveCount(1);

  const learnerControl = workspaceFrame.getByRole("button", { name: "Fixture Module" });
  await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-inspect-active", "true");
  await learnerControl.focus();
  await learnerControl.press("Enter");
  await expect(page.getByTestId("inspection-selection-summary")).toContainText("Fixture Module");
  await page.getByTestId("inspection-teacher-note").fill("Clarify what this module control opens.");
  await page.getByTestId("add-to-review-set").click();
  await expect(page.getByTestId("review-set-item")).toHaveCount(2);

  const firstItem = page.getByTestId("review-set-item").first();
  await firstItem.getByLabel("Short label").fill("Opening heading");
  await firstItem.getByLabel("Priority").selectOption("high");
  await page.getByRole("button", { name: "Move annotation 2 up" }).click();
  await expect(page.getByTestId("review-set-item").first()).toContainText("Fixture Module");
  await page.getByText("Session tools", { exact: true }).click();
  await page.getByLabel("Review session name").fill("Homepage polish");

  await page.getByTestId("review-session-bar").getByRole("button", { name: "New", exact: true }).click();
  const reviewSessionSelect = page.getByLabel("Review session", { exact: true });
  await expect(reviewSessionSelect).toContainText("Review 2");
  await reviewSessionSelect.selectOption({ label: "Homepage polish · 2/5" });
  await expect(page.getByTestId("review-set-item")).toHaveCount(2);
  await page.getByTestId("review-set-item").first().getByLabel(/Move annotation 1 to another review/).selectOption({ label: "Review 2" });
  await expect(page.getByTestId("review-set-item")).toHaveCount(1);

  await reviewSessionSelect.selectOption({ label: "Review 2 · 1/5" });
  await expect(page.getByTestId("review-set-item")).toHaveCount(1);
  await page.getByTestId("review-set-item").getByRole("button", { name: "Duplicate", exact: true }).click();
  await expect(page.getByTestId("review-set-item")).toHaveCount(2);
  await page.getByLabel("Queued review to merge").selectOption({ label: "Homepage polish · 1 items" });
  await page.getByRole("button", { name: "Merge", exact: true }).click();
  await expect(page.getByTestId("review-set-item")).toHaveCount(3);
  await expect(reviewSessionSelect.locator("option")).toHaveCount(1);

  await expect(page.getByTestId("copy-review-set")).toBeEnabled();
  await expect(page.getByTestId("review-packet-size")).toContainText(/KB packet|B packet/);
  const markdownDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Markdown" }).click();
  expect((await markdownDownload).suggestedFilename()).toMatch(/\.md$/);

  const jsonDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Backup JSON" }).click();
  const backup = await jsonDownload;
  const backupPath = await backup.path();
  expect(backupPath).toBeTruthy();
  await page.getByTestId("review-set-import").setInputFiles(backupPath as string);
  await expect(reviewSessionSelect.locator("option")).toHaveCount(2);
  await expect(reviewSessionSelect).toContainText("Review 2 import");
});

test("@inspection course finder supports search, favorites, and recents", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("course-search-input").focus();
  await page.getByTestId("course-search-input").fill("E2E Fixture");
  await page.getByRole("button", { name: /Add E2E Fixture.*to favorites/i }).click();
  await page.keyboard.press("Escape");

  await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
  await page.getByTestId("course-search-input").fill("Studio Fixture Secondary");
  await page.getByTestId(`course-result-${STUDIO_SECONDARY_FIXTURE}`).click();
  await waitForWorkspacePreviewReady(page, STUDIO_SECONDARY_FIXTURE);
  await expect(page.getByTestId("workspace-project-select")).toHaveValue(STUDIO_SECONDARY_FIXTURE);

  await page.getByTestId("course-search-input").focus();
  await expect(page.getByTestId("course-finder").getByRole("heading", { name: "Favorites" })).toBeVisible();
  await expect(page.getByTestId("course-result-e2e-fixture")).toBeVisible();
  await expect(page.getByTestId("course-finder").getByRole("heading", { name: "Recent" })).toBeVisible();
});

test("@inspection a Codex-created course appears live with its visual Edit map ready", async ({ page }) => {
  const slug = `e2e-codex-created-${process.pid}`;
  const title = "Codex Studio Course";
  const projectRoot = path.resolve("projects", slug);
  let created = false;

  try {
    await openProjectInStudio(page, STUDIO_PRIMARY_FIXTURE);
    await createCodexStudioCourse({
      repoRoot: process.cwd(),
      slug,
      title,
      courseCode: "CSC 20",
      summary: "A course authored in Codex and opened directly in Studio."
    });
    created = true;

    const projectSelect = page.getByTestId("workspace-project-select");
    await expect(projectSelect.locator(`option[value="${slug}"]`)).toHaveCount(1, { timeout: 10_000 });
    await projectSelect.selectOption(slug);
    await expect(projectSelect).toHaveValue(slug);
    await waitForWorkspacePreviewReady(page, slug);

    await expect(page.getByTestId("edit-toggle")).toBeEnabled();
    await page.getByTestId("edit-toggle").click();
    const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
    const heading = workspaceFrame.getByRole("heading", { name: title, level: 1 });
    await expect(heading).toBeVisible();
    await expect(workspaceFrame.locator("html")).toHaveAttribute("data-canvas-helper-edit-map-active", "true");
    await expect(workspaceFrame.locator('[data-canvas-helper-edit-map-toolbar="true"]')).toBeVisible();
    await expect(heading).toHaveAttribute("data-canvas-helper-edit-map-state", "rename");
    await expect(workspaceFrame.locator('[data-canvas-helper-edit-key="course-summary"]')).toHaveAttribute(
      "data-canvas-helper-edit-map-state",
      "editable"
    );
  } finally {
    if (created) await rm(projectRoot, { recursive: true, force: true });
  }
});

test("@inspection What’s New is concise, keyboard-contained, and restores focus", async ({ page }) => {
  await openProjectInStudio(page, STUDIO_PRIMARY_FIXTURE);
  const trigger = page.getByTestId("open-whats-new");
  await trigger.focus();
  await trigger.press("Enter");

  const panel = page.getByTestId("whats-new-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: CURRENT_STUDIO_RELEASE.title })).toBeVisible();
  await expect(panel.getByRole("heading", { level: 3 })).toHaveCount(CURRENT_STUDIO_RELEASE.notes.length);
  await expect(page.getByTestId("close-whats-new")).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(panel.getByRole("button", { name: "Back to Studio" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("close-whats-new")).toBeFocused();
  await page.keyboard.press("Escape");

  await expect(panel).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("@inspection What’s New stays usable at 320px with reduced motion and isolates the course", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openProjectInStudio(page, STUDIO_PRIMARY_FIXTURE);
  await page.getByTestId("open-whats-new").click();

  const panel = page.getByTestId("whats-new-panel");
  await expect(panel).toBeVisible();
  await expect(page.getByTestId("studio-topbar")).toHaveAttribute("inert", "");
  await expect(panel.getByRole("button", { name: "Back to Studio" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const animationSeconds = await panel.evaluate((element) => {
    const duration = getComputedStyle(element).animationDuration;
    return duration.endsWith("ms") ? Number.parseFloat(duration) / 1_000 : Number.parseFloat(duration);
  });
  expect(animationSeconds).toBeLessThanOrEqual(0.000_01);

  await panel.getByRole("button", { name: "Back to Studio" }).click();
  await expect(page.getByTestId("studio-topbar")).not.toHaveAttribute("inert", "");
  await expect(page.getByTestId("open-whats-new")).toBeFocused();
});

test("@inspection New Project routes to the existing local intake scan", async ({ page }) => {
  await page.route("**/api/incoming/refresh", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        mode: "all",
        importedProjects: [],
        skippedProjects: [],
        syncedReferences: [],
        failures: [],
        archivedPaths: []
      })
    });
  });
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("topbar-new-project").click();
  await expect(page.getByTestId("new-project-panel")).toBeVisible();
  await page.getByTestId("scan-intake-button").click();
  await expect(page.getByTestId("new-project-panel").getByRole("status")).toContainText("No incoming items were ready");
});

test("@inspection intake refresh ignores an older in-flight project response", async ({ page }) => {
  let projectRequestCount = 0;
  let releaseFirstRequest = () => undefined;
  const firstRequestHeld = new Promise<void>((resolve) => { releaseFirstRequest = resolve; });
  await page.route("**/api/projects", async (route) => {
    projectRequestCount += 1;
    if (projectRequestCount === 1) await firstRequestHeld;
    await route.continue();
  });
  await page.route("**/api/incoming/refresh", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        mode: "all",
        importedProjects: [{ slug: "new-fixture" }],
        skippedProjects: [],
        syncedReferences: [],
        failures: [],
        archivedPaths: []
      })
    });
  });
  await page.goto("/?e2e=1");
  await page.getByTestId("topbar-new-project").click();
  await page.getByTestId("scan-intake-button").click();
  await expect.poll(() => projectRequestCount).toBeGreaterThanOrEqual(2);
  releaseFirstRequest();
  await expect(page.getByTestId("new-project-panel").getByRole("status")).toContainText("Imported 1 project");
});

test("@inspection preview connection failure exposes a working reconnect action", async ({ page }) => {
  let unavailable = true;
  await page.route("**/api/preview-config", async (route) => {
    if (unavailable) {
      await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Preview paused for test." }) });
      return;
    }
    await route.continue();
  });
  await page.goto("/?e2e=1");
  await expect(page.getByTestId("preview-connection")).toContainText("Reconnect preview");
  unavailable = false;
  await page.getByTestId("preview-connection").click();
  await expect(page.getByTestId("preview-connection")).toContainText("Preview ready");
});

test("@inspection a failed page preflight offers recovery, page choice, and a bounded Codex handoff", async ({ page }) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  let workspaceUnavailable = true;
  await page.route("**/api/preview/preflight", async (route) => {
    const body = route.request().postDataJSON() as { previewUrl?: string };
    if (workspaceUnavailable && body.previewUrl?.includes("/preview/workspace/e2e-fixture/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "error",
          code: "missing-local-runtime",
          message: "This page depends on a local script that is missing.",
          details: ["Missing script: main.js"],
          runtimeFamily: "local-runtime"
        })
      });
      return;
    }
    await route.continue();
  });

  await page.goto("/?e2e=1");
  await expect(page.getByTestId("studio-shell")).toBeVisible();
  const projectSelect = page.getByTestId("workspace-project-select");
  await projectSelect.selectOption("e2e-fixture");
  const recovery = page.getByTestId("workspace-preview-recovery");
  await expect(recovery).toContainText("local script that is missing");
  await expect(page.getByTestId("workspace-preview-frame")).toHaveCount(0);
  await expect(page.getByTestId("open-workspace-preview-toggle")).toBeDisabled();

  await recovery.getByRole("button", { name: "Open another page" }).click();
  await expect(page.getByTestId("workspace-html-select")).toBeFocused();

  await recovery.getByRole("button", { name: "Copy issue for Codex" }).click();
  await expect(recovery.getByRole("button", { name: "Copied for Codex" })).toBeVisible();
  const packet = await page.evaluate(() => navigator.clipboard.readText());
  expect(packet).toContain("# Canvas Studio Preview Issue handoff");
  expect(packet).toContain("Schema: preview-issue-v1");
  expect(packet).toContain("Missing script: main.js");
  expect(packet).not.toContain("/Users/");

  workspaceUnavailable = false;
  await recovery.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByTestId("workspace-preview-frame")).toBeVisible();
  await expect(page.getByTestId("workspace-preview-recovery")).toHaveCount(0);
  await expect(page.frameLocator('[data-testid="workspace-preview-frame"]').getByRole("heading", { name: "E2E Fixture Workspace" })).toBeVisible();
});

test("@inspection switching pages cannot reuse a prior page's ready state", async ({ page }) => {
  let releaseAlternatePreflight: (() => void) | null = null;
  let alternateDocumentRequests = 0;
  await openProjectInStudio(page, "e2e-fixture");
  await expect(page.frameLocator('[data-testid="workspace-preview-frame"]').getByRole("heading", { name: "E2E Fixture Workspace" })).toBeVisible();

  await page.route("**/api/preview/preflight", async (route) => {
    const body = route.request().postDataJSON() as { previewUrl?: string };
    if (body.previewUrl?.includes("/alternate.html")) {
      await new Promise<void>((resolve) => {
        releaseAlternatePreflight = resolve;
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "error",
          code: "missing-local-runtime",
          message: "This alternate page did not pass its own preview check.",
          details: ["Missing script: alternate.js"],
          runtimeFamily: "local-runtime"
        })
      });
      return;
    }
    await route.continue();
  });
  await page.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (route.request().resourceType() === "document" && requestUrl.pathname.endsWith("/alternate.html")) {
      alternateDocumentRequests += 1;
    }
    await route.fallback();
  });

  await page.getByTestId("workspace-html-select").selectOption("alternate.html");
  await expect.poll(() => Boolean(releaseAlternatePreflight)).toBe(true);
  await expect(page.getByTestId("workspace-preview-frame")).toHaveCount(0);
  await expect(page.getByTestId("inspect-toggle")).toBeDisabled();
  await expect(page.getByTestId("open-workspace-preview-toggle")).toBeDisabled();
  await page.waitForTimeout(150);
  expect(alternateDocumentRequests).toBe(0);

  releaseAlternatePreflight?.();
  const recovery = page.getByTestId("workspace-preview-recovery");
  await expect(recovery).toContainText("did not pass its own preview check");
  await expect(page.getByTestId("workspace-preview-frame")).toHaveCount(0);
  await expect(page.getByTestId("open-workspace-preview-toggle")).toBeDisabled();
});

test("@inspection a page that loads without course content becomes an explicit recovery state", async ({ page }) => {
  await page.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (
      route.request().resourceType() === "document" &&
      requestUrl.pathname.includes("/preview/workspace/e2e-fixture/index.html")
    ) {
      const response = await route.fetch();
      await route.fulfill({
        response,
        body: '<!doctype html><html><head><meta charset="utf-8"><script src="/_canvas-helper/preview-bridge.js"></script></head><body>   <div hidden>Hidden course copy</div><svg aria-hidden="true" width="32" height="32"><circle cx="16" cy="16" r="12"></circle></svg>   </body></html>'
      });
      return;
    }
    await route.continue();
  });

  await page.goto("/?e2e=1");
  await expect(page.getByTestId("studio-shell")).toBeVisible();
  await page.getByTestId("workspace-project-select").selectOption("e2e-fixture");
  const recovery = page.getByTestId("workspace-preview-recovery");
  await expect(recovery).toContainText("course content did not appear", { timeout: 10_000 });
  await recovery.locator("summary", { hasText: "Details" }).click();
  await expect(recovery).toContainText("No meaningful course text or visual content appeared");
});

test("@inspection content inside a transparent ancestor becomes an explicit recovery state", async ({ page }) => {
  await page.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (
      route.request().resourceType() === "document" &&
      requestUrl.pathname.includes("/preview/workspace/e2e-fixture/index.html")
    ) {
      const response = await route.fetch();
      await route.fulfill({
        response,
        body: '<!doctype html><html><head><meta charset="utf-8"><script src="/_canvas-helper/preview-bridge.js"></script></head><body><main style="opacity:0"><h1>Course content hidden from view</h1><button type="button">Continue</button></main></body></html>'
      });
      return;
    }
    await route.continue();
  });

  await page.goto("/?e2e=1");
  await expect(page.getByTestId("studio-shell")).toBeVisible();
  await page.getByTestId("workspace-project-select").selectOption("e2e-fixture");
  const recovery = page.getByTestId("workspace-preview-recovery");
  await expect(recovery).toContainText("course content did not appear", { timeout: 15_000 });
  await recovery.locator("summary", { hasText: "Details" }).click();
  await expect(recovery).toContainText("No meaningful course text or visual content appeared");
});

test("@inspection a course stuck on loading status becomes an explicit recovery state", async ({ page }) => {
  await page.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (
      route.request().resourceType() === "document" &&
      requestUrl.pathname.includes("/preview/workspace/e2e-fixture/index.html")
    ) {
      const response = await route.fetch();
      await route.fulfill({
        response,
        body: '<!doctype html><html><head><meta charset="utf-8"><script src="/_canvas-helper/preview-bridge.js"></script></head><body><main aria-busy="true"><div role="status">Loading content...</div><svg aria-label="Loading content" width="24" height="24"><circle cx="12" cy="12" r="10"></circle></svg></main></body></html>'
      });
      return;
    }
    await route.continue();
  });

  await page.goto("/?e2e=1");
  await expect(page.getByTestId("studio-shell")).toBeVisible();
  await page.getByTestId("workspace-project-select").selectOption("e2e-fixture");
  const recovery = page.getByTestId("workspace-preview-recovery");
  await expect(recovery).toContainText("course content did not appear", { timeout: 15_000 });
  await recovery.locator("summary", { hasText: "Details" }).click();
  await expect(recovery).toContainText("No meaningful course text or visual content appeared");
});

test("@inspection a loader-only progress bar becomes an explicit recovery state", async ({ page }) => {
  await page.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (
      route.request().resourceType() === "document" &&
      requestUrl.pathname.includes("/preview/workspace/e2e-fixture/index.html")
    ) {
      const response = await route.fetch();
      await route.fulfill({
        response,
        body: '<!doctype html><html><head><meta charset="utf-8"><script src="/_canvas-helper/preview-bridge.js"></script></head><body><div role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="40">Loading 40%</div></body></html>'
      });
      return;
    }
    await route.continue();
  });

  await page.goto("/?e2e=1");
  await expect(page.getByTestId("studio-shell")).toBeVisible();
  await page.getByTestId("workspace-project-select").selectOption("e2e-fixture");
  const recovery = page.getByTestId("workspace-preview-recovery");
  await expect(recovery).toContainText("course content did not appear", { timeout: 12_000 });
  await recovery.locator("summary", { hasText: "Details" }).click();
  await expect(recovery).toContainText("No meaningful course text or visual content appeared");
});

test("@inspection a loader-only native progress element becomes an explicit recovery state", async ({ page }) => {
  await page.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (
      route.request().resourceType() === "document" &&
      requestUrl.pathname.includes("/preview/workspace/e2e-fixture/index.html")
    ) {
      const response = await route.fetch();
      await route.fulfill({
        response,
        body: '<!doctype html><html><head><meta charset="utf-8"><script src="/_canvas-helper/preview-bridge.js"></script></head><body><progress value="40" max="100">Loading 40%</progress></body></html>'
      });
      return;
    }
    await route.continue();
  });

  await page.goto("/?e2e=1");
  await expect(page.getByTestId("studio-shell")).toBeVisible();
  await page.getByTestId("workspace-project-select").selectOption("e2e-fixture");
  const recovery = page.getByTestId("workspace-preview-recovery");
  await expect(recovery).toContainText("course content did not appear", { timeout: 12_000 });
  await recovery.locator("summary", { hasText: "Details" }).click();
  await expect(recovery).toContainText("No meaningful course text or visual content appeared");
});

test("@inspection a slow course stays mounted and recovers when meaningful content appears", async ({ page }) => {
  await page.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (
      route.request().resourceType() === "document" &&
      requestUrl.pathname.includes("/preview/workspace/e2e-fixture/index.html")
    ) {
      const response = await route.fetch();
      await route.fulfill({
        response,
        body: '<!doctype html><html><head><meta charset="utf-8"><script src="/_canvas-helper/preview-bridge.js"></script><script>setTimeout(function(){document.getElementById("root").innerHTML="<h1>Delayed course ready</h1>";}, 4500);</script></head><body><div id="root" aria-busy="true"><svg aria-hidden="true" width="24" height="24"><circle cx="12" cy="12" r="10"></circle></svg></div></body></html>'
      });
      return;
    }
    await route.continue();
  });

  await page.goto("/?e2e=1");
  await expect(page.getByTestId("studio-shell")).toBeVisible();
  await page.getByTestId("workspace-project-select").selectOption("e2e-fixture");
  const frame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  await expect(frame.getByRole("heading", { name: "Delayed course ready" })).toBeVisible({ timeout: 7_000 });
  await expect(page.getByTestId("workspace-preview-frame")).toBeVisible();
  await expect(page.getByTestId("workspace-preview-recovery")).toHaveCount(0);
});

test("@inspection a newer selection aborts the first request and remains selected", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("layout-focus-toggle").click();
  await page.getByTestId("preview-workspace-toggle").click();

  let inspectionRequestCount = 0;
  let firstInspectionRequestAborted = false;
  let releaseFirstInspectionResponse: (() => void) | null = null;
  page.on("requestfailed", (request) => {
    if (new URL(request.url()).pathname === "/api/inspection/resolve" && request.method() === "POST") {
      firstInspectionRequestAborted = true;
    }
  });
  await page.route("**/api/inspection/resolve", async (route) => {
    inspectionRequestCount += 1;
    if (inspectionRequestCount === 1) {
      await new Promise<void>((resolve) => {
        releaseFirstInspectionResponse = resolve;
      });
    }
    await route.continue().catch(() => {});
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

  releaseFirstInspectionResponse?.();
  await expect.poll(() => firstInspectionRequestAborted).toBe(true);

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
  const areaResolutionRequest = page.waitForRequest((request) =>
    request.url().endsWith("/api/inspection/resolve") && request.method() === "POST"
  );
  await page.mouse.move(dragStart.x, dragStart.y);
  await page.mouse.down();
  await page.mouse.move(dragEnd.x, dragEnd.y, { steps: 4 });
  await page.mouse.up();
  const areaRequestPayload = (await areaResolutionRequest).postDataJSON() as {
    selection: { selectionKind?: string; geometry: { width: number; height: number } };
  };
  expect(areaRequestPayload.selection.selectionKind).toBe("area");
  expect(Math.abs(areaRequestPayload.selection.geometry.width - Math.round(dragEnd.x - dragStart.x))).toBeLessThanOrEqual(2);
  expect(Math.abs(areaRequestPayload.selection.geometry.height - Math.round(dragEnd.y - dragStart.y))).toBeLessThanOrEqual(2);
  await expect(page.getByTestId("inspection-panel")).toBeVisible();
  await expect(page.getByTestId("inspection-selection-summary")).toContainText("Selected area");
  await expect(page.getByTestId("annotation-mode-bar")).toBeVisible();
  await expect(page.getByTestId("annotation-mode-bar")).toHaveCSS("background-color", "rgb(20, 115, 230)");

  for (let expectedCount = 1; expectedCount <= 3; expectedCount += 1) {
    await page.getByTestId("capture-annotated-screenshot").click();
    await expect(page.getByTestId("screenshot-draft")).toHaveCount(expectedCount);
    if (expectedCount === 1) {
      await page.getByTestId("screenshot-draft").getByRole("button", { name: "Crop to selection" }).click();
      await expect(page.getByTestId("screenshot-draft").getByRole("button", { name: "Cropped" })).toBeDisabled();
    }
  }
  await expect(page.getByTestId("capture-annotated-screenshot")).toBeDisabled();
  await page.getByTestId("inspection-teacher-note").fill("Use these screenshots to clarify this heading.");
  await page.getByTestId("add-to-review-set").click();
  await expect(page.getByTestId("screenshot-annotation")).toHaveCount(0);
  await expect(page.getByTestId("review-set-screenshot")).toHaveCount(3);
  await expect(page.getByTestId("review-set")).toContainText("3 screenshots");
  await expect(page.getByTestId("review-set-screenshot").first().getByRole("button", { name: "Cropped" })).toBeDisabled();
  const retakenImage = page.getByTestId("review-set-screenshot").nth(1).locator("img");
  const beforeRetakeSource = await retakenImage.getAttribute("src");
  let releaseReplacement = () => undefined;
  let reportReplacementStarted = () => undefined;
  const replacementHeld = new Promise<void>((resolve) => { releaseReplacement = resolve; });
  const replacementStarted = new Promise<void>((resolve) => { reportReplacementStarted = resolve; });
  await page.route("**/api/inspection/screenshots?path=*", async (route) => {
    if (route.request().method() !== "PUT") {
      await route.continue();
      return;
    }
    reportReplacementStarted();
    await replacementHeld;
    await route.continue();
  });
  const screenshotReplaced = page.waitForResponse((response) =>
    response.url().includes("/api/inspection/screenshots?path=") && response.request().method() === "PUT"
  );
  await page.getByTestId("review-set-screenshot").nth(1).getByRole("button", { name: "Retake" }).click();
  await replacementStarted;
  await expect(page.getByTestId("review-set-item").getByRole("button", { name: "Relink" })).toBeDisabled();
  await expect(page.getByTestId("review-set-item").getByRole("button", { name: "Remove", exact: true })).toBeDisabled();
  await expect(page.getByRole("combobox", { name: "Review session" })).toBeDisabled();
  await expect(page.getByTestId("copy-review-set")).toBeDisabled();
  releaseReplacement();
  expect((await screenshotReplaced).ok()).toBe(true);
  await page.unroute("**/api/inspection/screenshots?path=*");
  await expect(retakenImage).not.toHaveAttribute("src", beforeRetakeSource as string);
  const firstScreenshotSource = await page.getByTestId("review-set-screenshot").first().locator("img").getAttribute("src");
  const secondScreenshotSource = await page.getByTestId("review-set-screenshot").nth(1).locator("img").getAttribute("src");
  await page.getByRole("button", { name: "Move screenshot 2 left" }).click();
  await expect(page.getByTestId("review-set-screenshot").first().locator("img")).toHaveAttribute("src", secondScreenshotSource as string);
  await expect(page.getByTestId("review-set-screenshot").nth(1).locator("img")).toHaveAttribute("src", firstScreenshotSource as string);
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
  expect(copied).toContain("Schema: review-set-v4");
  expect(copied).toContain("Detail: compact");
  expect(copied).toContain("Cycle: initial review");
  expect(copied).toContain(" · area");
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
  await expect(page.getByTestId("review-set-item")).toContainText("Sent");
  await expect(page.getByTestId("review-verification")).toContainText("0 accepted · 1 to check · 0 follow-up");
  await expect(page.getByTestId("copy-review-set")).toHaveCount(0);
  await expect(page.getByTestId("review-set-item").locator("textarea")).toBeDisabled();
  await page.getByTestId("review-set-item").getByRole("button", { name: "Reopen for follow-up" }).click();
  await expect(page.getByTestId("review-set-item")).toContainText("Ready for follow-up");
  const screenshotsReclaimed = page.waitForResponse((response) =>
    response.url().endsWith("/api/inspection/screenshots") && response.request().method() === "DELETE"
  );
  await page.getByTestId("review-set").getByRole("button", { name: "Clear" }).click();
  expect((await screenshotsReclaimed).ok()).toBe(true);
  await expect(page.getByTestId("review-set-item")).toHaveCount(0);
});

test("@inspection relink preserves evidence while completed annotations stay out of the Codex handoff", async ({ page }) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("layout-focus-toggle").click();
  await page.getByTestId("preview-workspace-toggle").click();
  await page.getByTestId("inspect-toggle").click();

  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
  const headingBounds = await heading.boundingBox();
  expect(headingBounds).toBeTruthy();
  await page.mouse.click(
    (headingBounds?.x ?? 0) + (headingBounds?.width ?? 0) / 2,
    (headingBounds?.y ?? 0) + (headingBounds?.height ?? 0) / 2
  );
  const newAnnotation = page.getByTestId("inspection-panel");
  await newAnnotation.getByLabel("Concern").selectOption("layout");
  await page.getByTestId("inspection-teacher-note").fill("Keep this note and its evidence when the target moves.");
  await page.getByTestId("capture-annotated-screenshot").click();
  await expect(page.getByTestId("screenshot-draft")).toHaveCount(1);
  await page.getByTestId("add-to-review-set").click();

  const firstItem = page.getByTestId("review-set-item").first();
  await expect(firstItem.locator("textarea")).toHaveValue("Keep this note and its evidence when the target moves.");
  await expect(firstItem.getByLabel("Concern")).toHaveValue("layout");
  await expect(firstItem.getByTestId("review-set-screenshot")).toHaveCount(1);
  await firstItem.getByRole("button", { name: "Relink", exact: true }).click();
  await expect(page.getByTestId("review-feedback")).toContainText("Select the replacement element");

  const learnerControl = workspaceFrame.getByRole("button", { name: "Fixture Module" });
  await learnerControl.focus();
  await learnerControl.press("Enter");
  await expect(page.getByTestId("review-feedback")).toContainText("Selection relinked");
  await expect(firstItem).toContainText("Fixture Module");
  await expect(firstItem.locator("textarea")).toHaveValue("Keep this note and its evidence when the target moves.");
  await expect(firstItem.getByLabel("Concern")).toHaveValue("layout");
  await expect(firstItem.getByTestId("review-set-screenshot")).toHaveCount(1);
  await expect(firstItem.getByRole("button", { name: "Crop", exact: true })).toBeDisabled();
  await expect(firstItem.getByRole("button", { name: "Retake", exact: true })).toBeDisabled();

  const relinkedPreviewPromise = page.waitForEvent("popup");
  await page.getByTestId("open-workspace-preview-toggle").click();
  const relinkedPreview = await relinkedPreviewPromise;
  await expect(relinkedPreview.locator('[data-canvas-helper-preview-controls="true"]')).toBeVisible();
  const relinkedReviewToggle = relinkedPreview.locator('[data-canvas-helper-preview-review-toggle="true"]');
  if (await relinkedReviewToggle.getAttribute("aria-expanded") !== "true") await relinkedReviewToggle.click();
  await expect.poll(() => relinkedPreview.locator('[data-canvas-helper-preview-review-item="true"] img').evaluate((image) => (
    (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0
  ))).toBe(true);
  await relinkedPreview.close();

  const relinkedHeadingBounds = await heading.boundingBox();
  expect(relinkedHeadingBounds).toBeTruthy();
  await page.mouse.click(
    (relinkedHeadingBounds?.x ?? 0) + (relinkedHeadingBounds?.width ?? 0) / 2,
    (relinkedHeadingBounds?.y ?? 0) + (relinkedHeadingBounds?.height ?? 0) / 2
  );
  await newAnnotation.getByLabel("Concern").selectOption("content");
  await page.getByTestId("inspection-teacher-note").fill("Keep this second open annotation in the handoff.");
  await page.getByTestId("add-to-review-set").click();
  await expect(page.getByTestId("review-set-item")).toHaveCount(2);
  const secondItem = page.getByTestId("review-set-item").nth(1);

  await firstItem.getByRole("button", { name: "Mark resolved" }).click();
  await expect(firstItem).toContainText("Resolved");
  await expect(page.getByTestId("review-set")).toContainText("1 open");
  await expect(page.getByTestId("copy-review-set")).toBeEnabled();
  await page.getByTestId("copy-review-set").click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("Items: 1");
  expect(copied).toContain(" · element");
  expect(copied).toContain("Concern: content · Priority: normal");
  expect(copied).toContain("Keep this second open annotation in the handoff.");
  expect(copied).not.toContain("Keep this note and its evidence when the target moves.");

  await firstItem.getByRole("button", { name: "Reopen" }).click();
  await expect(firstItem).not.toContainText("Resolved");
  await expect(page.getByTestId("review-set")).toContainText("2 open");
  await secondItem.getByRole("button", { name: "Reopen for follow-up" }).click();
  await expect(secondItem).toContainText("Ready for follow-up");

  const screenshotReclaimed = page.waitForResponse((response) =>
    response.url().endsWith("/api/inspection/screenshots") && response.request().method() === "DELETE"
  );
  await page.getByTestId("review-set").getByRole("button", { name: "Clear" }).click();
  expect((await screenshotReclaimed).ok()).toBe(true);
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
  await page.getByTestId("confirm-manual-review-sent").click();
  await expect(page.getByTestId("review-set-item")).toContainText("Sent");
  await page.getByTestId("review-set-item").getByRole("button", { name: "Reopen for follow-up" }).click();
  await expect(page.getByTestId("copy-review-set")).toBeEnabled();

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
  await previewPage.locator('[data-canvas-helper-preview-review-confirm-sent="true"]').click();
  await expect(previewPage.locator('[data-canvas-helper-preview-review-status="true"]')).toContainText("Sent to Codex");
  await expect(previewPage.locator('[data-canvas-helper-preview-review-item="true"]')).toContainText("Sent · verify");
  await previewPage.close();
});

test("@inspection Review Set copy holds one immutable packet while the clipboard is pending", async ({ page }) => {
  await page.addInitScript(() => {
    const scope = window as typeof window & { __finishReviewCopy?: () => void };
    Object.defineProperty(Navigator.prototype, "clipboard", {
      configurable: true,
      get: () => ({
        writeText: () => new Promise<void>((resolve) => {
          scope.__finishReviewCopy = resolve;
        })
      })
    });
  });
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("inspect-toggle").click();
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
  const headingBounds = await heading.boundingBox();
  expect(headingBounds).toBeTruthy();
  await page.mouse.click(
    (headingBounds?.x ?? 0) + (headingBounds?.width ?? 0) / 2,
    (headingBounds?.y ?? 0) + (headingBounds?.height ?? 0) / 2
  );
  await page.getByTestId("inspection-teacher-note").fill("Keep this copy transaction stable.");
  await page.getByTestId("add-to-review-set").click();
  await expect(page.getByTestId("copy-review-set")).toBeEnabled();
  await page.getByTestId("copy-review-set").click();
  await expect(page.getByTestId("copy-review-set")).toHaveText("Copying Review Set…");
  await expect(page.getByTestId("review-session-bar").getByLabel("Review session")).toBeDisabled();
  await expect(page.getByTestId("review-set-item").getByRole("textbox", { name: "What should change?" })).toBeDisabled();
  await expect(page.getByTestId("review-set-item").getByRole("button", { name: "Add screenshot" })).toBeDisabled();
  await page.evaluate(() => (window as typeof window & { __finishReviewCopy?: () => void }).__finishReviewCopy?.());
  await expect(page.getByTestId("review-set-item")).toContainText("Sent");
});

test("@inspection Studio copy locks Full Preview mutations until the exact packet is sent", async ({ page }) => {
  await page.addInitScript(() => {
    const scope = window as typeof window & { __finishSharedReviewCopy?: () => void };
    Object.defineProperty(Navigator.prototype, "clipboard", {
      configurable: true,
      get: () => ({
        writeText: () => new Promise<void>((resolve) => {
          scope.__finishSharedReviewCopy = resolve;
        })
      })
    });
  });
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("inspect-toggle").click();
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
  const headingBounds = await heading.boundingBox();
  expect(headingBounds).toBeTruthy();
  await page.mouse.click(
    (headingBounds?.x ?? 0) + (headingBounds?.width ?? 0) / 2,
    (headingBounds?.y ?? 0) + (headingBounds?.height ?? 0) / 2
  );
  await page.getByTestId("inspection-teacher-note").fill("Keep both review surfaces transaction-safe.");
  await page.getByTestId("add-to-review-set").click();
  await expect(page.getByTestId("copy-review-set")).toBeEnabled();

  const previewPagePromise = page.waitForEvent("popup");
  await page.getByTestId("open-workspace-preview-toggle").click();
  const previewPage = await previewPagePromise;
  await expect(previewPage.locator('[data-canvas-helper-preview-controls="true"]')).toBeVisible();
  await previewPage.locator('[data-canvas-helper-preview-review-toggle="true"]').click();
  const previewItem = previewPage.locator('[data-canvas-helper-preview-review-item="true"]');
  const previewNote = previewItem.getByLabel("Change note for annotation 1");
  await expect(previewNote).toBeEnabled();

  await page.getByTestId("copy-review-set").click();
  await expect(page.getByTestId("copy-review-set")).toHaveText("Copying Review Set…");
  await expect(previewNote).toBeDisabled();
  await expect(previewItem.getByRole("button", { name: "Add screenshot" })).toBeDisabled();
  await page.evaluate(() => (window as typeof window & { __finishSharedReviewCopy?: () => void }).__finishSharedReviewCopy?.());
  await expect(previewItem).toContainText("Sent · verify");
  await previewPage.close();
});

test("@inspection Full Preview reserves the exact packet before clipboard access", async ({ page, context }) => {
  await context.addInitScript(() => {
    const scope = window as typeof window & { __finishPreviewReviewCopy?: () => void; __previewReviewClipboardCalls?: number };
    if (window.opener === null || window.top !== window) return;
    scope.__previewReviewClipboardCalls = 0;
    Object.defineProperty(Navigator.prototype, "clipboard", {
      configurable: true,
      get: () => ({
        writeText: () => new Promise<void>((resolve) => {
          scope.__previewReviewClipboardCalls = (scope.__previewReviewClipboardCalls ?? 0) + 1;
          scope.__finishPreviewReviewCopy = resolve;
        })
      })
    });
  });
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("inspect-toggle").click();
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
  const headingBounds = await heading.boundingBox();
  expect(headingBounds).toBeTruthy();
  await page.mouse.click(
    (headingBounds?.x ?? 0) + (headingBounds?.width ?? 0) / 2,
    (headingBounds?.y ?? 0) + (headingBounds?.height ?? 0) / 2
  );
  await page.getByTestId("inspection-teacher-note").fill("Reserve this packet before Full Preview copies it.");
  await page.getByTestId("add-to-review-set").click();
  await expect(page.getByTestId("copy-review-set")).toBeEnabled();

  const previewPagePromise = page.waitForEvent("popup");
  await page.getByTestId("open-workspace-preview-toggle").click();
  const previewPage = await previewPagePromise;
  await expect(previewPage.locator('[data-canvas-helper-preview-controls="true"]')).toBeVisible();
  const reviewToggle = previewPage.locator('[data-canvas-helper-preview-review-toggle="true"]');
  if (await reviewToggle.getAttribute("aria-expanded") !== "true") await reviewToggle.click();
  const previewCopy = previewPage.locator('[data-canvas-helper-preview-review-copy="true"]');
  const previewItem = previewPage.locator('[data-canvas-helper-preview-review-item="true"]');
  const previewStatus = previewPage.locator('[data-canvas-helper-preview-review-status="true"]');
  expect(await previewPage.evaluate(() => Boolean((window as typeof window & { __finishPreviewReviewCopy?: () => void }).__finishPreviewReviewCopy))).toBe(false);
  await expect(previewCopy).toBeEnabled();
  await previewCopy.click();
  await expect(previewStatus).not.toContainText("Reserving this Review Set…");
  await expect.poll(() => previewPage.evaluate(() => Boolean((window as typeof window & { __finishPreviewReviewCopy?: () => void }).__finishPreviewReviewCopy))).toBe(true);

  await expect(page.getByTestId("copy-review-set")).toHaveText("Copying Review Set…");
  await expect(page.getByTestId("review-session-bar").getByLabel("Review session")).toBeDisabled();
  await expect(page.getByTestId("review-set-item").getByRole("textbox", { name: "What should change?" })).toBeDisabled();
  await expect(page.getByTestId("review-set-item").getByRole("button", { name: "Add screenshot" })).toBeDisabled();
  await expect(previewItem.getByLabel("Change note for annotation 1")).toBeDisabled();

  await previewPage.evaluate(() => (window as typeof window & { __finishPreviewReviewCopy?: () => void }).__finishPreviewReviewCopy?.());
  await expect(page.getByTestId("review-set-item")).toContainText("Sent");
  await expect(previewItem).toContainText("Sent · verify");
  await previewPage.close();
});

test("@inspection Full Preview reuses the current course window and replaces it after a project switch", async ({ page }) => {
  await openProjectInStudio(page, "e2e-fixture");
  const firstPreviewPromise = page.waitForEvent("popup");
  await page.getByTestId("open-workspace-preview-toggle").click();
  const firstPreview = await firstPreviewPromise;
  await expect(firstPreview.locator('[data-canvas-helper-preview-controls="true"]')).toBeVisible();
  await expect(firstPreview.locator('[data-canvas-helper-preview-inspect-status="true"]')).toContainText("Connected to Studio");

  const pagesBeforeSecondOpen = page.context().pages().length;
  await page.getByTestId("open-workspace-preview-toggle").click();
  await page.waitForTimeout(150);

  expect(page.context().pages()).toHaveLength(pagesBeforeSecondOpen);
  expect(firstPreview.isClosed()).toBe(false);
  await expect(firstPreview.locator('[data-canvas-helper-preview-inspect-status="true"]')).toContainText("Connected to Studio");
  await firstPreview.reload();
  await expect(firstPreview.locator('[data-canvas-helper-preview-controls="true"]')).toBeVisible();
  await expect(firstPreview.locator('[data-canvas-helper-preview-inspect-status="true"]')).toContainText("Connected to Studio");

  await page.getByTestId("workspace-project-select").selectOption(STUDIO_SECONDARY_FIXTURE);
  await expect(page.getByTestId("workspace-project-select")).toHaveValue(STUDIO_SECONDARY_FIXTURE);
  await waitForWorkspacePreviewReady(page, STUDIO_SECONDARY_FIXTURE);
  await expect.poll(() => firstPreview.isClosed()).toBe(true);
  await page.reload();
  await expect(page.getByTestId("workspace-project-select")).toHaveValue(STUDIO_SECONDARY_FIXTURE);
  await waitForWorkspacePreviewReady(page, STUDIO_SECONDARY_FIXTURE);
  const secondPreviewPromise = page.waitForEvent("popup");
  await page.getByTestId("open-workspace-preview-toggle").click();
  const secondPreview = await secondPreviewPromise;

  await expect(secondPreview.locator('[data-canvas-helper-preview-inspect-status="true"]')).toContainText("Connected to Studio");
  await expect(secondPreview.frameLocator('[data-canvas-helper-standalone-course="true"]').getByRole("heading", { name: STUDIO_FIXTURES.secondary.title })).toBeVisible();
  await secondPreview.close();
});

test("@inspection a stalled Full Preview clipboard releases both review surfaces", async ({ page, context }) => {
  await context.addInitScript(() => {
    if (window.opener === null) {
      const nativeSetTimeout = window.setTimeout.bind(window);
      window.setTimeout = ((handler: TimerHandler, delay?: number, ...args: unknown[]) => (
        nativeSetTimeout(handler, delay === 30_000 ? 200 : delay, ...args)
      )) as typeof window.setTimeout;
      return;
    }
    if (window.top !== window) return;
    Object.defineProperty(Navigator.prototype, "clipboard", {
      configurable: true,
      get: () => ({ writeText: () => new Promise<void>(() => undefined) })
    });
  });
  await openProjectInStudio(page, "e2e-fixture");
  await page.getByTestId("inspect-toggle").click();
  const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
  const heading = workspaceFrame.getByRole("heading", { name: "E2E Fixture Workspace" });
  const headingBounds = await heading.boundingBox();
  expect(headingBounds).toBeTruthy();
  await page.mouse.click(
    (headingBounds?.x ?? 0) + (headingBounds?.width ?? 0) / 2,
    (headingBounds?.y ?? 0) + (headingBounds?.height ?? 0) / 2
  );
  await page.getByTestId("inspection-teacher-note").fill("Do not leave this review locked after a stalled clipboard.");
  await page.getByTestId("add-to-review-set").click();

  const previewPagePromise = page.waitForEvent("popup");
  await page.getByTestId("open-workspace-preview-toggle").click();
  const previewPage = await previewPagePromise;
  await expect(previewPage.locator('[data-canvas-helper-preview-controls="true"]')).toBeVisible();
  const reviewToggle = previewPage.locator('[data-canvas-helper-preview-review-toggle="true"]');
  if (await reviewToggle.getAttribute("aria-expanded") !== "true") await reviewToggle.click();
  const previewCopy = previewPage.locator('[data-canvas-helper-preview-review-copy="true"]');
  const previewItem = previewPage.locator('[data-canvas-helper-preview-review-item="true"]');
  await previewCopy.click();
  await expect(page.getByTestId("copy-review-set")).toHaveText("Copying Review Set…");
  await expect(previewCopy).toBeDisabled();

  await expect(previewPage.locator('[data-canvas-helper-preview-review-status="true"]')).toContainText("copy timed out");
  await expect(previewCopy).toBeEnabled();
  await expect(previewItem.getByLabel("Change note for annotation 1")).toBeEnabled();
  await expect(page.getByTestId("copy-review-set")).toBeEnabled();
  await expect(page.getByTestId("review-set-item")).not.toContainText("Sent");
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
    const key = "canvas-helper/review-workbench-v10";
    const stored = JSON.parse(localStorage.getItem(key) || "null");
    const project = stored?.projects?.["e2e-fixture"];
    const review = project?.sets?.find((candidate: { id?: string }) => candidate.id === project.activeSetId);
    if (!review?.items?.[0]?.screenshots?.[0]) throw new Error("missing stored screenshot");
    const item = review.items[0];
    const screenshot = item.screenshots[0];
    const cleanup = [{
      repoRelativePath: screenshot.filePath,
      sessionId: project.screenshotSessionId,
      projectSlug: item.request.projectSlug,
      itemId: item.id,
      ownerNodeId: item.request.selection.nodeId
    }];
    review.items[0].screenshots[0].filePath = `.runtime/studio-review-sets/${project.screenshotSessionId}/forged.png`;
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
