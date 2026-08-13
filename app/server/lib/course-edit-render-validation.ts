import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";
import { load } from "cheerio";

import type { CourseEditPatch, CourseEditStylePatch } from "../../shared/course-editing.js";
import {
  collectEditableHtmlElements,
  STUDIO_EDIT_ID_ATTRIBUTE,
  type EditableHtmlElement
} from "../../../scripts/lib/course-editing/html.js";
import { startIsolatedPreviewServer } from "../preview-server";
import { loadPreviewInspectionDocument } from "./preview-inspection";

const RENDER_TIMEOUT_MS = 30_000;

const STYLE_ATTRIBUTES: Record<keyof CourseEditStylePatch, string> = {
  textStyle: "data-canvas-helper-text-style",
  fontFamily: "data-canvas-helper-font",
  fontSize: "data-canvas-helper-font-size",
  textTone: "data-canvas-helper-text-tone",
  alignment: "data-canvas-helper-align",
  spacing: "data-canvas-helper-spacing"
};

export type CourseEditRenderCheck = {
  htmlPath: string;
  tagName: string;
  pathKey: string;
  editId: string | null;
  expected: {
    html?: string;
    href?: string;
    src?: string;
    alt?: string;
    title?: string;
    style?: Partial<Record<keyof CourseEditStylePatch, string>>;
  };
};

export function renderCheckForPatch(input: {
  htmlPath: string;
  element: EditableHtmlElement;
  patch: CourseEditPatch;
  before: {
    html: string;
    attributes: { href: string; src: string; alt: string; title: string };
    style: Required<CourseEditStylePatch>;
  };
  phase: "before" | "after";
}): CourseEditRenderCheck {
  const after = input.phase === "after";
  const expected: CourseEditRenderCheck["expected"] = {};
  if (input.patch.html !== undefined) expected.html = after ? input.patch.html : input.before.html;
  for (const key of ["href", "src", "alt", "title"] as const) {
    if (input.patch[key] !== undefined) {
      const value = after ? input.patch[key] : input.before.attributes[key];
      expected[key] = value ?? "";
    }
  }
  if (input.patch.style) {
    expected.style = {};
    for (const key of Object.keys(input.patch.style) as Array<keyof CourseEditStylePatch>) {
      const value = after ? input.patch.style[key] : input.before.style[key];
      expected.style[key] = value === "default" ? "" : String(value ?? "");
    }
  }
  return {
    htmlPath: input.htmlPath,
    tagName: input.element.tagName,
    pathKey: input.element.pathKey,
    editId: input.element.editId || null,
    expected
  };
}

function encodedPath(value: string) {
  return value.split("/").map(encodeURIComponent).join("/");
}

function canonicalHtml(value: string) {
  const document = load(`<body>${value}</body>`);
  document("[data-canvas-helper-inspect-node]").removeAttr("data-canvas-helper-inspect-node");
  return (document("body").html() ?? "").replace(/\s+/g, " ").replace(/> </g, "><").trim();
}

function rgb(value: string) {
  const match = value.match(/rgba?\((\d+(?:\.\d+)?)[, ]+(\d+(?:\.\d+)?)[, ]+(\d+(?:\.\d+)?)(?:[, /]+(\d*(?:\.\d+)?))?\)/);
  return match
    ? [Number(match[1]), Number(match[2]), Number(match[3]), match[4] === undefined || match[4] === "" ? 1 : Number(match[4])]
    : null;
}

function luminance(value: number[]) {
  const channels = value.slice(0, 3).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function findCurrentElement(
  elements: EditableHtmlElement[],
  check: CourseEditRenderCheck
) {
  const byId = check.editId
    ? elements.find((element) => element.editId === check.editId && element.tagName === check.tagName)
    : null;
  return byId ?? elements.find((element) => element.pathKey === check.pathKey && element.tagName === check.tagName) ?? null;
}

async function resolvedBrowserChecks(input: {
  repoRoot: string;
  projectSlug: string;
  checks: CourseEditRenderCheck[];
}) {
  const output: Array<CourseEditRenderCheck & { nodeId: string }> = [];
  for (const check of input.checks) {
    const sourcePath = path.join(input.repoRoot, "projects", input.projectSlug, "workspace", ...check.htmlPath.split("/"));
    const source = await readFile(sourcePath, "utf8");
    const elements = collectEditableHtmlElements(source, input.projectSlug, check.htmlPath);
    const element = elements ? findCurrentElement(elements, check) : null;
    if (!element) throw new Error("Rendered-result validation could not find the edited element after the course changed.");
    const document = await loadPreviewInspectionDocument(sourcePath);
    const node = document
      ? [...document.nodeLocations.entries()].find(([, location]) => (
          location.sourceStart === element.sourceStart && location.tagName === element.tagName
        ))
      : null;
    if (!node) throw new Error("Rendered-result validation could not map the edited element into the learner preview.");
    output.push({ ...check, nodeId: node[0] });
  }
  return output;
}

export async function validateRenderedCourseEdits(input: {
  repoRoot: string;
  projectSlug: string;
  checks: CourseEditRenderCheck[];
}) {
  if (!input.checks.length) return;
  const checks = await resolvedBrowserChecks(input);
  const studioOrigin = "http://127.0.0.1:9";
  const preview = await startIsolatedPreviewServer({ studioOrigin, repoRoot: input.repoRoot });
  const browser = await chromium.launch({
    headless: true,
    args: ["--force-webrtc-ip-handling-policy=disable_non_proxied_udp"]
  });
  try {
    const context = await browser.newContext({ serviceWorkers: "block" });
    await context.addInitScript(() => {
      for (const name of ["RTCPeerConnection", "webkitRTCPeerConnection", "Worker", "SharedWorker"]) {
        try {
          Object.defineProperty(globalThis, name, { configurable: false, value: undefined, writable: false });
        } catch {
          // The isolated origin and request routing remain the outer boundary.
        }
      }
    });
    await context.routeWebSocket(/.*/, async (socket) => {
      await socket.close({ code: 1008, reason: "Network disabled during rendered edit validation" });
    });
    await context.route("**/*", async (route) => {
      let url: URL;
      try {
        url = new URL(route.request().url());
      } catch {
        await route.abort();
        return;
      }
      if (url.origin === preview.origin || url.protocol === "data:" || url.protocol === "blob:") {
        await route.continue();
      } else {
        await route.abort();
      }
    });

    const checksByPage = new Map<string, typeof checks>();
    for (const check of checks) {
      const pageChecks = checksByPage.get(check.htmlPath) ?? [];
      pageChecks.push(check);
      checksByPage.set(check.htmlPath, pageChecks);
    }
    for (const [htmlPath, pageChecks] of checksByPage) {
      const token = randomUUID();
      const page = await context.newPage();
      const target = `${preview.origin}/_canvas-helper/p/${token}/preview/workspace/${encodeURIComponent(input.projectSlug)}/${encodedPath(htmlPath)}`;
      await page.goto(target, { waitUntil: "domcontentloaded", timeout: RENDER_TIMEOUT_MS, referer: studioOrigin });
      await page.waitForLoadState("networkidle", { timeout: 4_000 }).catch(() => undefined);
      await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          let settleTimer = window.setTimeout(resolve, 350);
          const deadline = window.setTimeout(() => {
            observer.disconnect();
            resolve();
          }, 2_500);
          const observer = new MutationObserver(() => {
            window.clearTimeout(settleTimer);
            settleTimer = window.setTimeout(() => {
              window.clearTimeout(deadline);
              observer.disconnect();
              resolve();
            }, 350);
          });
          observer.observe(document.documentElement, { attributes: true, childList: true, characterData: true, subtree: true });
        });
      });

      for (const check of pageChecks) {
        const locator = page.locator(`[data-canvas-helper-inspect-node="${check.nodeId}"]`);
        if (await locator.count() !== 1) {
          throw new Error(`Rendered-result validation failed for ${check.tagName.toUpperCase()}: course JavaScript removed or duplicated the edited element. Studio restored the batch.`);
        }
        const result = await locator.evaluate((selected, { styleAttributes, editIdAttribute }) => {
          const element = selected as HTMLElement;
          const rect = element.getBoundingClientRect();
          const computed = getComputedStyle(element);
          const style: Record<string, string> = {};
          for (const key in styleAttributes) {
            style[key] = element.getAttribute(styleAttributes[key as keyof typeof styleAttributes]) ?? "";
          }
          const backgrounds: string[] = [];
          let cursor: Element | null = element;
          while (cursor) {
            backgrounds.push(getComputedStyle(cursor).backgroundColor);
            cursor = cursor.parentElement;
          }
          return {
            html: element.innerHTML,
            attributes: {
              href: element.getAttribute("href") ?? "",
              src: element.getAttribute("src") ?? "",
              alt: element.getAttribute("alt") ?? "",
              title: element.getAttribute("title") ?? ""
            },
            style,
            tagName: element.tagName,
            text: (element.getAttribute("aria-label") || element.textContent || "").trim(),
            hasAlt: element.hasAttribute("alt"),
            role: element.getAttribute("role") ?? "",
            editId: element.getAttribute(editIdAttribute) ?? "",
            visible: rect.width > 0 && rect.height > 0 && computed.display !== "none" && computed.visibility !== "hidden" && Number(computed.opacity) !== 0,
            color: computed.color,
            backgrounds,
            fontSize: Number.parseFloat(computed.fontSize),
            fontWeight: Number.parseInt(computed.fontWeight, 10),
            imageComplete: element instanceof HTMLImageElement ? element.complete : true,
            naturalWidth: element instanceof HTMLImageElement ? element.naturalWidth : 0,
            naturalHeight: element instanceof HTMLImageElement ? element.naturalHeight : 0
          };
        }, {
          styleAttributes: STYLE_ATTRIBUTES,
          editIdAttribute: STUDIO_EDIT_ID_ATTRIBUTE
        });
        let reason = "";
        if (!result.visible) reason = "the edited element is not visible to learners";
        else if (check.expected.html !== undefined && canonicalHtml(result.html) !== canonicalHtml(check.expected.html)) {
          reason = "course JavaScript changed the requested text or formatting";
        }
        for (const name of ["href", "src", "alt", "title"] as const) {
          if (!reason && check.expected[name] !== undefined && result.attributes[name] !== check.expected[name]) {
            reason = `the rendered ${name} does not match the requested value`;
          }
        }
        for (const [key, value] of Object.entries(check.expected.style ?? {})) {
          if (!reason && result.style[key] !== value) reason = `the rendered ${key} control did not survive the course runtime`;
        }
        if (!reason && result.tagName === "IMG" && !result.hasAlt && result.role !== "presentation") reason = "the edited image has no alt attribute";
        if (
          !reason &&
          result.tagName === "IMG" &&
          check.expected.src !== undefined &&
          (!result.imageComplete || result.naturalWidth <= 0 || result.naturalHeight <= 0)
        ) reason = "the requested image did not decode in the learner page";
        if (!reason && ["A", "BUTTON"].includes(result.tagName) && !result.text) reason = "the edited control has no accessible name";
        if (!reason && /^H[1-6]$/.test(result.tagName) && !result.text) reason = "the edited heading is empty";
        if (!reason && result.editId && !/^che[12]:[a-f0-9]{24}$/.test(result.editId)) reason = "the rendered edit identity is invalid";
        const foreground = rgb(result.color);
        const background = result.backgrounds.map(rgb).find((value) => value && value[3] > 0) ?? [255, 255, 255, 1];
        if (!reason && foreground && background) {
          const high = Math.max(luminance(foreground), luminance(background));
          const low = Math.min(luminance(foreground), luminance(background));
          const ratio = (high + 0.05) / (low + 0.05);
          const largeText = result.fontSize >= 24 || (result.fontSize >= 18.66 && result.fontWeight >= 700);
          if (ratio < (largeText ? 3 : 4.5)) reason = `the edited text contrast is only ${ratio.toFixed(2)}:1`;
        }
        if (reason) throw new Error(`Rendered-result validation failed for ${check.tagName.toUpperCase()}: ${reason}. Studio restored the batch.`);
      }
      await page.close();
    }
  } finally {
    await browser.close().catch(() => undefined);
    await preview.close().catch(() => undefined);
  }
}
