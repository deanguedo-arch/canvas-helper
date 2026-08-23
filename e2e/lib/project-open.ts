import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

type WorkspacePreviewReadyOptions = {
  requireEvidenceBank?: boolean;
};

const WORKSPACE_PREVIEW_READY_TIMEOUT_MS = 30_000;

function urlWithoutHash(value: string) {
  const url = new URL(value);
  return `${url.origin}${url.pathname}${url.search}`;
}

export function workspacePreviewPathMatchesProject(pathname: string, slug: string) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,159}$/.test(slug)) return false;
  let decodedPathname: string;
  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    return false;
  }
  const segments = decodedPathname.split("/").filter(Boolean);
  return segments.some((segment, index) => (
    segment === "preview" &&
    segments[index + 1] === "workspace" &&
    segments[index + 2] === slug
  ));
}

async function waitForStudioRender(page: Page) {
  await page.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  );
}

export async function waitForWorkspacePreviewReady(
  page: Page,
  slug: string,
  options: WorkspacePreviewReadyOptions = {}
) {
  const frameElement = page.getByTestId("workspace-preview-frame");
  await expect(frameElement, `workspace preview frame is visible for ${slug}`).toBeVisible();
  await expect
    .poll(
      async () => {
        const src = await frameElement.getAttribute("src");
        if (!src) return false;
        return workspacePreviewPathMatchesProject(new URL(src, page.url()).pathname, slug);
      },
      {
        message: `workspace preview source targets ${slug}`,
        timeout: WORKSPACE_PREVIEW_READY_TIMEOUT_MS
      }
    )
    .toBe(true);

  await expect
    .poll(
      async () => {
        const src = await frameElement.getAttribute("src");
        if (!src) return false;
        const expectedUrl = urlWithoutHash(new URL(src, page.url()).href);
        const workspaceFrame = page.frameLocator('[data-testid="workspace-preview-frame"]');
        return workspaceFrame.locator("body").evaluate(
          (_, readiness) => {
            const evidenceApi = (
              window as typeof window & {
                nextStepEvidenceBank?: {
                  list?: unknown;
                  remove?: unknown;
                  upsert?: unknown;
                };
              }
            ).nextStepEvidenceBank;
            const activeUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;
            const evidenceReady = !readiness.requireEvidenceBank
              || Boolean(
                evidenceApi
                && typeof evidenceApi.list === "function"
                && typeof evidenceApi.remove === "function"
                && typeof evidenceApi.upsert === "function"
              );
            return document.readyState !== "loading"
              && Boolean(document.body)
              && activeUrl === readiness.expectedUrl
              && evidenceReady;
          },
          { expectedUrl, requireEvidenceBank: Boolean(options.requireEvidenceBank) }
        ).catch(() => false);
      },
      {
        message: options.requireEvidenceBank
          ? `workspace preview and Evidence Bank runtime are ready for ${slug}`
          : `workspace preview runtime is ready for ${slug}`,
        timeout: WORKSPACE_PREVIEW_READY_TIMEOUT_MS
      }
    )
    .toBe(true);

  await page
    .frameLocator('[data-testid="workspace-preview-frame"]')
    .locator("body")
    .evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    );
}

export async function reloadWorkspacePreview(
  page: Page,
  slug: string,
  options: WorkspacePreviewReadyOptions = {}
) {
  await waitForWorkspacePreviewReady(page, slug, options);
  const frameElement = page.getByTestId("workspace-preview-frame");
  const elementHandle = await frameElement.elementHandle();
  const workspaceFrame = await elementHandle?.contentFrame();
  if (!workspaceFrame) {
    throw new Error(`Workspace preview frame is unavailable for ${slug}.`);
  }

  await workspaceFrame.goto(workspaceFrame.url(), { waitUntil: "domcontentloaded" });
  await waitForWorkspacePreviewReady(page, slug, options);
}

export async function openProjectInStudio(
  page: Page,
  slug: string,
  options: WorkspacePreviewReadyOptions = {}
) {
  await page.goto("/?e2e=1");
  await expect(page.getByTestId("studio-shell")).toBeVisible();

  const courseTab = page.getByTestId("course-studio-tab");
  if (await courseTab.isVisible()) {
    await courseTab.click();
  }

  const projectSelect = page.getByTestId("workspace-project-select");
  await expect(projectSelect).toBeVisible();
  await expect
    .poll(
      () =>
        projectSelect.evaluate((select, targetSlug) =>
          Array.from((select as HTMLSelectElement).options).some((option) => option.value === targetSlug),
          slug
        ),
      { message: `workspace project option appears for ${slug}` }
    )
    .toBe(true);
  await projectSelect.selectOption(slug);
  await expect(projectSelect, `workspace project selection updates to ${slug}`).toHaveValue(slug);

  await expect(page.getByTestId("project-root")).toBeVisible();
  await waitForWorkspacePreviewReady(page, slug, options);

  const refreshButton = page.getByTestId("workspace-refresh-button");
  if (await refreshButton.isVisible()) {
    const refreshResponse = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.pathname === "/api/projects"
        && response.request().method() === "GET"
        && response.ok();
    });
    await refreshButton.click();
    await refreshResponse;
    await waitForStudioRender(page);
    await expect(projectSelect, `workspace project remains selected after refreshing ${slug}`).toHaveValue(slug);
    await waitForWorkspacePreviewReady(page, slug, options);
  }
}
