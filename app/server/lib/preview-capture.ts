import { chromium, type Page } from "@playwright/test";

import { PREVIEW_INSPECT_NODE_ATTRIBUTE } from "./preview-inspection";
import type { PreviewInspectPayload } from "../../shared/preview-bridge.js";
import {
  isCapabilityWorkspacePreviewPath,
  normalizePreviewPageIdentity
} from "../../shared/preview-path.js";

export type PreviewCaptureInput = {
  previewOrigin: string;
  projectSlug: string;
  selection: PreviewInspectPayload;
  markerNumber: number;
  signal?: AbortSignal;
};

function captureUrl(input: PreviewCaptureInput) {
  const origin = new URL(input.previewOrigin);
  const target = new URL(input.selection.pageHref);
  if (
    origin.origin !== target.origin ||
    origin.protocol !== "http:" ||
    origin.hostname !== "127.0.0.1" ||
    !isCapabilityWorkspacePreviewPath(target.pathname, input.projectSlug)
  ) {
    throw new Error("Screenshot capture is limited to the selected local workspace preview.");
  }
  target.searchParams.delete("canvas-helper-inspect-session");
  target.searchParams.set("canvas-helper-capture", "1");
  return target;
}

async function launchCaptureBrowser(signal?: AbortSignal) {
  const launch = chromium.launch({
    headless: true,
    args: ["--force-webrtc-ip-handling-policy=disable_non_proxied_udp"]
  });
  if (!signal) return launch;
  if (signal.aborted) {
    void launch.then((browser) => browser.close()).catch(() => undefined);
    throw new Error("Screenshot capture was cancelled.");
  }
  return new Promise<Awaited<typeof launch>>((resolve, reject) => {
    let settled = false;
    const onAbort = () => {
      if (settled) return;
      settled = true;
      void launch.then((browser) => browser.close()).catch(() => undefined);
      reject(new Error("Screenshot capture was cancelled."));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    void launch.then(
      (browser) => {
        if (settled) {
          void browser.close().catch(() => undefined);
          return;
        }
        settled = true;
        signal.removeEventListener("abort", onAbort);
        resolve(browser);
      },
      (error) => {
        if (settled) return;
        settled = true;
        signal.removeEventListener("abort", onAbort);
        reject(error);
      }
    );
  });
}

function isExactCapturePage(current: string | URL, target: string | URL) {
  const currentIdentity = normalizePreviewPageIdentity(current);
  const targetIdentity = normalizePreviewPageIdentity(target);
  return currentIdentity !== null && currentIdentity === targetIdentity;
}

async function captureNetworkGuardsAreActive(page: Page) {
  const mainFrame = page.mainFrame();
  let mainOrigin = "";
  try {
    mainOrigin = new URL(mainFrame.url()).origin;
  } catch {
    mainOrigin = "";
  }
  const relevantFrames = page.frames().filter((frame) => {
    if (frame === mainFrame) return true;
    const frameUrl = frame.url();
    if (!frameUrl || frameUrl.startsWith("chrome-error:")) return false;
    if (/^(?:about:|data:|blob:)/.test(frameUrl)) return true;
    try {
      return Boolean(mainOrigin) && new URL(frameUrl).origin === mainOrigin;
    } catch {
      return false;
    }
  });
  const guardedFrames = await Promise.all(relevantFrames.map((frame) => frame.evaluate(() =>
    typeof RTCPeerConnection === "undefined" &&
    typeof (globalThis as { webkitRTCPeerConnection?: unknown }).webkitRTCPeerConnection === "undefined" &&
    typeof Worker === "undefined" &&
    typeof SharedWorker === "undefined"
  ).catch(() => false)));
  return guardedFrames.length > 0 && guardedFrames.every(Boolean);
}

export async function captureMarkedPreviewPng(input: PreviewCaptureInput) {
  if (input.signal?.aborted) {
    throw new Error("Screenshot capture was cancelled.");
  }
  const selectionNodeId = input.selection.nodeId;
  if (!selectionNodeId) {
    throw new Error("A selected course element is required for screenshot capture.");
  }
  const target = captureUrl(input);
  const browser = await launchCaptureBrowser(input.signal);
  if (input.signal?.aborted) {
    await browser.close();
    throw new Error("Screenshot capture was cancelled.");
  }
  const abortCapture = () => {
    void browser.close().catch(() => undefined);
  };
  input.signal?.addEventListener("abort", abortCapture, { once: true });
  try {
    const context = await browser.newContext({
      viewport: {
        width: input.selection.viewport.width,
        height: input.selection.viewport.height
      },
      deviceScaleFactor: 1,
      serviceWorkers: "block"
    });
    await context.addInitScript(() => {
      // Playwright routing does not own WebRTC sockets. Shadow the constructors
      // in every document and child frame before course code can run; the launch
      // policy above independently prevents non-proxied ICE UDP.
      for (const name of ["RTCPeerConnection", "webkitRTCPeerConnection", "Worker", "SharedWorker"]) {
        try {
          Object.defineProperty(globalThis, name, {
            configurable: false,
            enumerable: false,
            value: undefined,
            writable: false
          });
        } catch {
          try {
            (globalThis as Record<string, unknown>)[name] = undefined;
          } catch {
            // The mandatory verification below fails the capture closed if a
            // browser cannot install this guard.
          }
        }
      }
    });
    await context.routeWebSocket(/.*/, async (webSocket) => {
      await webSocket.close({ code: 1008, reason: "Network disabled during course capture" });
    });
    await context.route("**/*", async (route) => {
      const requestUrl = route.request().url();
      let parsed: URL;
      try {
        parsed = new URL(requestUrl);
      } catch {
        await route.abort();
        return;
      }
      if (parsed.origin === target.origin || parsed.protocol === "data:" || parsed.protocol === "blob:") {
        await route.continue();
      } else {
        await route.abort();
      }
    });

    const page = await context.newPage();
    const captureNetworkGuardReady = await captureNetworkGuardsAreActive(page);
    if (!captureNetworkGuardReady) {
      throw new Error("The capture browser could not disable direct course network APIs.");
    }
    await page.goto(target.toString(), { waitUntil: "domcontentloaded", timeout: 15_000 });
    const finalUrl = new URL(page.url());
    if (!isExactCapturePage(finalUrl, target)) {
      throw new Error("The preview navigated outside the bounded local capture page.");
    }
    if (!await captureNetworkGuardsAreActive(page)) {
      throw new Error("The captured course created an unguarded browser context.");
    }

    const selectedHandle = await page.waitForFunction(
      ({ attribute, nodeId }) => {
        const runtime = /^(ch1:[a-f0-9]{24}:[1-9][0-9]*)~([0-9a-z]{1,3}(?:\.[0-9a-z]{1,3}){0,23})!([a-z][a-z0-9-]{0,15})!([a-f0-9]{8})$/.exec(nodeId);
        const sourceId = runtime?.[1] ?? nodeId;
        const owners = Array.from(document.querySelectorAll(`[${attribute}]`)).filter(
          (element) => element.getAttribute(attribute) === sourceId
        );
        if (owners.length !== 1) return false;
        if (!runtime) return owners[0];
        let selected: Element | undefined = owners[0];
        for (const step of runtime[2].split(".")) {
          selected = selected?.children[parseInt(step, 36)];
          if (!selected) return false;
        }
        if (selected.tagName.toLowerCase() !== runtime[3] || selected.hasAttribute(attribute)) return false;
        const text = String(selected.textContent || "").replace(/\s+/g, " ").trim().slice(0, 24_000);
        let hash = 2166136261;
        for (let index = 0; index < text.length; index += 1) {
          hash ^= text.charCodeAt(index);
          hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(16).padStart(8, "0") === runtime[4] ? selected : false;
      },
      { attribute: PREVIEW_INSPECT_NODE_ATTRIBUTE, nodeId: selectionNodeId },
      { timeout: 5_000 }
    );

    await page.evaluate((scroll) => {
      window.scrollTo(scroll.windowLeft, scroll.windowTop);
      scroll.containers.forEach((container) => {
        let element: Element | null = null;
        try {
          element = document.querySelector(container.selector);
        } catch {
          element = null;
        }
        if (element instanceof HTMLElement) {
          element.scrollTop = container.top;
          element.scrollLeft = container.left;
        }
      });
    }, input.selection.scroll);
    await page.waitForTimeout(120);
    const capturePageUrl = new URL(page.url());
    if (!isExactCapturePage(capturePageUrl, target)) {
      throw new Error("The preview changed pages before the bounded screenshot could be captured.");
    }

    await selectedHandle.evaluate(
      (element, { attribute, nodeId, markerNumber }) => {
        if (!(element instanceof Element) || !element.isConnected) {
          throw new Error("The selected element is no longer available in the preview.");
        }
        const runtime = /^(ch1:[a-f0-9]{24}:[1-9][0-9]*)~([0-9a-z]{1,3}(?:\.[0-9a-z]{1,3}){0,23})!([a-z][a-z0-9-]{0,15})!([a-f0-9]{8})$/.exec(nodeId);
        if (runtime) {
          const owner = element.closest(`[${attribute}]`);
          let current: Element | undefined = owner ?? undefined;
          for (const step of runtime[2].split(".")) current = current?.children[parseInt(step, 36)];
          const text = String(element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 24_000);
          let hash = 2166136261;
          for (let index = 0; index < text.length; index += 1) {
            hash ^= text.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
          }
          if (
            owner?.getAttribute(attribute) !== runtime[1] ||
            current !== element ||
            element.tagName.toLowerCase() !== runtime[3] ||
            (hash >>> 0).toString(16).padStart(8, "0") !== runtime[4]
          ) throw new Error("The rendered selection changed before capture.");
        } else if (element.getAttribute(attribute) !== nodeId) {
          throw new Error("The source selection changed before capture.");
        }
        const selectedRect = element.getBoundingClientRect();
        if (
          selectedRect.width <= 0 ||
          selectedRect.height <= 0 ||
          selectedRect.right <= 0 ||
          selectedRect.bottom <= 0 ||
          selectedRect.left >= window.innerWidth ||
          selectedRect.top >= window.innerHeight
        ) {
          throw new Error("The selected element is no longer visible in the captured preview.");
        }
        const source = {
          x: Math.round(selectedRect.x),
          y: Math.round(selectedRect.y),
          width: Math.round(selectedRect.width),
          height: Math.round(selectedRect.height)
        };
        const left = Math.max(0, Math.min(window.innerWidth - 2, source.x));
        const top = Math.max(0, Math.min(window.innerHeight - 2, source.y));
        const right = Math.max(left + 2, Math.min(window.innerWidth, source.x + source.width));
        const bottom = Math.max(top + 2, Math.min(window.innerHeight, source.y + source.height));

        const overlay = document.createElement("div");
        overlay.setAttribute("data-canvas-helper-capture-marker", "true");
        Object.assign(overlay.style, {
          position: "fixed",
          zIndex: "2147483646",
          left: `${left}px`,
          top: `${top}px`,
          width: `${right - left}px`,
          height: `${bottom - top}px`,
          boxSizing: "border-box",
          border: "3px solid #1473e6",
          background: "rgba(20, 115, 230, 0.10)",
          pointerEvents: "none"
        });

        const badge = document.createElement("span");
        badge.textContent = String(markerNumber);
        Object.assign(badge.style, {
          position: "absolute",
          left: "-3px",
          top: "-3px",
          minWidth: "24px",
          height: "24px",
          padding: "0 6px",
          display: "grid",
          placeItems: "center",
          boxSizing: "border-box",
          borderRadius: "12px",
          background: "#1473e6",
          color: "#ffffff",
          font: "700 13px/1 system-ui, sans-serif"
        });
        overlay.appendChild(badge);
        (document.body || document.documentElement).appendChild(overlay);
      },
      { attribute: PREVIEW_INSPECT_NODE_ATTRIBUTE, nodeId: selectionNodeId, markerNumber: input.markerNumber }
    );

    const finalCaptureUrl = new URL(page.url());
    if (!isExactCapturePage(finalCaptureUrl, target)) {
      throw new Error("The preview changed pages before the bounded screenshot could be captured.");
    }
    if (!await captureNetworkGuardsAreActive(page)) {
      throw new Error("The captured course created an unguarded browser context.");
    }

    const png = await page.screenshot({ type: "png", animations: "disabled", fullPage: false });
    const completedCaptureUrl = new URL(page.url());
    if (!isExactCapturePage(completedCaptureUrl, target)) {
      throw new Error("The preview changed pages during the bounded screenshot capture.");
    }
    await context.close();
    return {
      png: Buffer.from(png),
      width: input.selection.viewport.width,
      height: input.selection.viewport.height
    };
  } finally {
    input.signal?.removeEventListener("abort", abortCapture);
    await browser.close();
  }
}
