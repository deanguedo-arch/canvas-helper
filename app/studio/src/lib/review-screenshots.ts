import {
  REVIEW_SCREENSHOT_MAX_BYTES,
  REVIEW_SCREENSHOT_MAX_DIMENSION,
  REVIEW_SCREENSHOT_MAX_PIXELS
} from "../../../shared/inspection.js";
import { STUDIO_REVIEW_LIMITS } from "../../../shared/studio-quality.js";

export type PersistedReviewScreenshot = {
  path: string;
  byteLength: number;
  width: number;
  height: number;
};

export type ReviewScreenshotOwner = {
  sessionId: string;
  projectSlug: string;
  itemId: string;
  ownerNodeId: string;
};

export type OwnedReviewScreenshotPath = ReviewScreenshotOwner & {
  repoRelativePath: string;
};

const SAFE_REVIEW_SCREENSHOT_PATH = new RegExp(`^\\.runtime/studio-review-sets/[A-Za-z0-9-]{${STUDIO_REVIEW_LIMITS.sessionIdMinCodeUnits},${STUDIO_REVIEW_LIMITS.sessionIdMaxCodeUnits}}/[A-Za-z0-9._-]+\\.png$`);
const SAFE_REVIEW_SCREENSHOT_SESSION = new RegExp(`^[A-Za-z0-9-]{${STUDIO_REVIEW_LIMITS.sessionIdMinCodeUnits},${STUDIO_REVIEW_LIMITS.sessionIdMaxCodeUnits}}$`);

export function isReviewScreenshotPath(value: unknown): value is string {
  return typeof value === "string" && SAFE_REVIEW_SCREENSHOT_PATH.test(value);
}

export function isReviewScreenshotSessionId(value: unknown): value is string {
  return typeof value === "string" && SAFE_REVIEW_SCREENSHOT_SESSION.test(value);
}

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
    isReviewScreenshotPath(result.path) &&
    typeof result.byteLength === "number" &&
    Number.isInteger(result.byteLength) &&
    result.byteLength > 0 &&
    result.byteLength <= REVIEW_SCREENSHOT_MAX_BYTES &&
    typeof result.width === "number" &&
    Number.isInteger(result.width) &&
    result.width > 0 &&
    result.width <= REVIEW_SCREENSHOT_MAX_DIMENSION &&
    typeof result.height === "number" &&
    Number.isInteger(result.height) &&
    result.height > 0 &&
    result.height <= REVIEW_SCREENSHOT_MAX_DIMENSION &&
    result.width * result.height <= REVIEW_SCREENSHOT_MAX_PIXELS
  );
}

export function reviewScreenshotImageUrl(filePath: string, owner: ReviewScreenshotOwner) {
  if (
    !isReviewScreenshotPath(filePath) ||
    !isReviewScreenshotSessionId(owner.sessionId) ||
    !owner.projectSlug ||
    !owner.itemId ||
    !owner.ownerNodeId
  ) {
    throw new Error("Screenshot path is not a safe Review Set image path.");
  }
  const params = new URLSearchParams({
    path: filePath,
    sessionId: owner.sessionId,
    projectSlug: owner.projectSlug,
    itemId: owner.itemId,
    ownerNodeId: owner.ownerNodeId
  });
  return `/api/inspection/screenshots?${params.toString()}`;
}

export async function persistReviewScreenshot(input: {
  sessionId: string;
  projectSlug: string;
  itemId: string;
  screenshotId: string;
  ownerNodeId: string;
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
      "X-Canvas-Helper-Review-Item": input.itemId,
      "X-Canvas-Helper-Review-Screenshot": input.screenshotId,
      "X-Canvas-Helper-Inspection-Node": input.ownerNodeId
    },
    body: input.png
  });
  const payload = await response.json().catch(() => null) as unknown;
  if (!response.ok || !isPersistedReviewScreenshot(payload)) {
    throw new Error("Canvas Helper could not keep this screenshot with the Review Set.");
  }
  return payload;
}

export async function replaceReviewScreenshot(input: {
  sessionId: string;
  projectSlug: string;
  itemId: string;
  screenshotId: string;
  ownerNodeId: string;
  repoRelativePath: string;
  png: Blob;
  signal?: AbortSignal;
}) {
  if (
    !isReviewScreenshotPath(input.repoRelativePath) ||
    input.png.type !== "image/png" ||
    input.png.size <= 0 ||
    input.png.size > REVIEW_SCREENSHOT_MAX_BYTES
  ) {
    throw new Error("The replacement screenshot is not a valid bounded PNG.");
  }
  const response = await fetch(`/api/inspection/screenshots?path=${encodeURIComponent(input.repoRelativePath)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "image/png",
      "X-Canvas-Helper-Review-Session": input.sessionId,
      "X-Canvas-Helper-Project": input.projectSlug,
      "X-Canvas-Helper-Review-Item": input.itemId,
      "X-Canvas-Helper-Review-Screenshot": input.screenshotId,
      "X-Canvas-Helper-Inspection-Node": input.ownerNodeId
    },
    body: input.png,
    signal: input.signal
  });
  const payload = await response.json().catch(() => null) as unknown;
  if (!response.ok || !isPersistedReviewScreenshot(payload) || (payload as PersistedReviewScreenshot).path !== input.repoRelativePath) {
    throw new Error("Canvas Helper could not safely replace this screenshot.");
  }
  return payload as PersistedReviewScreenshot;
}

export async function verifyReviewScreenshots(input: {
  sessionId: string;
  projectSlug: string;
  itemId: string;
  ownerNodeId: string;
  paths: string[];
}) {
  const response = await fetch("/api/inspection/screenshots/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  const payload = await response.json().catch(() => null) as { screenshots?: unknown[]; error?: string } | null;
  if (
    !response.ok ||
    !payload ||
    !Array.isArray(payload.screenshots) ||
    payload.screenshots.length !== input.paths.length ||
    !payload.screenshots.every(isPersistedReviewScreenshot)
  ) {
    throw new Error(payload?.error || "Canvas Helper could not verify the saved screenshots.");
  }
  return payload.screenshots as PersistedReviewScreenshot[];
}

export async function deleteReviewScreenshotPaths(screenshots: OwnedReviewScreenshotPath[]) {
  if (!screenshots.length) {
    return;
  }
  const response = await fetch("/api/inspection/screenshots", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ screenshots })
  });
  if (!response.ok) {
    throw new Error("Canvas Helper could not reclaim the removed screenshots yet.");
  }
}
