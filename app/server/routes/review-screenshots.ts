import type { IncomingMessage, ServerResponse } from "node:http";

import { REVIEW_SCREENSHOT_MAX_BYTES } from "../../shared/inspection.js";
import { sendJson } from "../lib/response";
import {
  isReviewScreenshotItemId,
  isReviewScreenshotSessionId,
  saveReviewScreenshot
} from "../lib/review-screenshots";
import { isSafeProjectSlug } from "../lib/validation";

type ReviewScreenshotRouteOptions = {
  rootDir?: string;
};

function headerValue(request: IncomingMessage, name: string) {
  const value = request.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

async function readBoundedPng(request: IncomingMessage) {
  const contentType = headerValue(request, "content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "image/png") {
    throw new Error("Expected a PNG screenshot.");
  }
  const declaredLength = Number(headerValue(request, "content-length") ?? 0);
  if (declaredLength > REVIEW_SCREENSHOT_MAX_BYTES) {
    throw new Error("Screenshot exceeds the bounded Review Set limit.");
  }

  const chunks: Buffer[] = [];
  let byteLength = 0;
  for await (const chunk of request) {
    const buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    byteLength += buffer.length;
    if (byteLength > REVIEW_SCREENSHOT_MAX_BYTES) {
      throw new Error("Screenshot exceeds the bounded Review Set limit.");
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

export function createReviewScreenshotRouteHandler(options: ReviewScreenshotRouteOptions = {}) {
  return async function handleReviewScreenshotRoute(url: string, request: IncomingMessage, response: ServerResponse) {
    if (url !== "/api/inspection/screenshots") {
      return false;
    }
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed." });
      return true;
    }

    const sessionId = headerValue(request, "x-canvas-helper-review-session");
    const projectSlug = headerValue(request, "x-canvas-helper-project");
    const itemId = headerValue(request, "x-canvas-helper-review-item");
    if (
      !isReviewScreenshotSessionId(sessionId) ||
      !isSafeProjectSlug(projectSlug ?? "") ||
      (projectSlug?.length ?? 0) > 160 ||
      !isReviewScreenshotItemId(itemId)
    ) {
      sendJson(response, 400, { error: "Invalid bounded screenshot request." });
      return true;
    }

    try {
      const result = await saveReviewScreenshot({
        sessionId,
        projectSlug: projectSlug as string,
        itemId,
        png: await readBoundedPng(request)
      }, options);
      sendJson(response, 200, {
        path: result.path,
        byteLength: result.byteLength,
        width: result.width,
        height: result.height
      });
    } catch {
      sendJson(response, 400, { error: "Canvas Helper could not save this bounded screenshot." });
    }
    return true;
  };
}

export const handleReviewScreenshotRoute = createReviewScreenshotRouteHandler();
