import { REVIEW_SCREENSHOT_MAX_BYTES } from "../../../shared/inspection.js";

export type PersistedReviewScreenshot = {
  path: string;
  byteLength: number;
  width: number;
  height: number;
};

export function createReviewScreenshotSessionId() {
  if (typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return Array.from(window.crypto.getRandomValues(new Uint32Array(4)), (value) => value.toString(16).padStart(8, "0")).join("");
}

function isPersistedReviewScreenshot(value: unknown): value is PersistedReviewScreenshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const result = value as Record<string, unknown>;
  return (
    typeof result.path === "string" &&
    /^\.runtime\/studio-review-sets\/[A-Za-z0-9-]{16,80}\/[A-Za-z0-9._-]+\.png$/.test(result.path) &&
    typeof result.byteLength === "number" &&
    Number.isInteger(result.byteLength) &&
    result.byteLength > 0 &&
    result.byteLength <= REVIEW_SCREENSHOT_MAX_BYTES &&
    typeof result.width === "number" &&
    Number.isInteger(result.width) &&
    result.width > 0 &&
    typeof result.height === "number" &&
    Number.isInteger(result.height) &&
    result.height > 0
  );
}

export async function persistReviewScreenshot(input: {
  sessionId: string;
  projectSlug: string;
  itemId: string;
  png: Blob;
}) {
  if (input.png.type !== "image/png" || input.png.size <= 0 || input.png.size > REVIEW_SCREENSHOT_MAX_BYTES) {
    throw new Error("The marked screenshot is too large to include in this Review Set.");
  }
  const response = await fetch("/api/inspection/screenshots", {
    method: "POST",
    headers: {
      "Content-Type": "image/png",
      "X-Canvas-Helper-Review-Session": input.sessionId,
      "X-Canvas-Helper-Project": input.projectSlug,
      "X-Canvas-Helper-Review-Item": input.itemId
    },
    body: input.png
  });
  const payload = await response.json().catch(() => null) as unknown;
  if (!response.ok || !isPersistedReviewScreenshot(payload)) {
    throw new Error("Canvas Helper could not keep this screenshot with the Review Set.");
  }
  return payload;
}
