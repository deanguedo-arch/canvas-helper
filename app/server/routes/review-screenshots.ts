import type { IncomingMessage, ServerResponse } from "node:http";

import { REVIEW_SCREENSHOT_MAX_BYTES } from "../../shared/inspection.js";
import { sendJson } from "../lib/response";
import {
  isReviewScreenshotItemId,
  isReviewScreenshotPath,
  isReviewScreenshotSessionId,
  deleteReviewScreenshots,
  readReviewScreenshot,
  saveReviewScreenshot,
  verifyReviewScreenshot
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

async function readBoundedJson(request: IncomingMessage, maximumBytes = 16_384) {
  const declaredLength = Number(headerValue(request, "content-length") ?? 0);
  if (declaredLength > maximumBytes) {
    throw new Error("Request exceeds its bounded limit.");
  }
  const chunks: Buffer[] = [];
  let byteLength = 0;
  for await (const chunk of request) {
    const buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    byteLength += buffer.length;
    if (byteLength > maximumBytes) {
      throw new Error("Request exceeds its bounded limit.");
    }
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

function isBoundedNodeId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 160 && !/[\u0000-\u001f]/.test(value);
}

export function createReviewScreenshotRouteHandler(options: ReviewScreenshotRouteOptions = {}) {
  return async function handleReviewScreenshotRoute(url: string, request: IncomingMessage, response: ServerResponse) {
    const requestUrl = new URL(request.url ?? url, "http://studio.local");
    if (requestUrl.pathname === "/api/inspection/screenshots/verify") {
      if (request.method !== "POST") {
        sendJson(response, 405, { error: "Method not allowed." });
        return true;
      }
      try {
        const body = await readBoundedJson(request) as Record<string, unknown>;
        if (
          !body ||
          typeof body !== "object" ||
          Array.isArray(body) ||
          typeof body.projectSlug !== "string" ||
          !isSafeProjectSlug(body.projectSlug) ||
          body.projectSlug.length > 160 ||
          !isReviewScreenshotSessionId(body.sessionId) ||
          !isReviewScreenshotItemId(body.itemId) ||
          !isBoundedNodeId(body.ownerNodeId) ||
          !Array.isArray(body.paths) ||
          body.paths.length > 3 ||
          !body.paths.every(isReviewScreenshotPath)
        ) {
          throw new Error("Invalid screenshot verification request.");
        }
        const screenshots = await Promise.all(body.paths.map((repoRelativePath) => verifyReviewScreenshot({
          repoRelativePath,
          sessionId: body.sessionId as string,
          projectSlug: body.projectSlug as string,
          itemId: body.itemId as string,
          ownerNodeId: body.ownerNodeId as string
        }, options)));
        sendJson(response, 200, { screenshots });
      } catch {
        sendJson(response, 400, { error: "One or more Review Set screenshots could not be verified." });
      }
      return true;
    }
    if (requestUrl.pathname !== "/api/inspection/screenshots") {
      return false;
    }
    if (request.method === "GET") {
      try {
        const screenshotPath = requestUrl.searchParams.get("path");
        const sessionId = requestUrl.searchParams.get("sessionId");
        const projectSlug = requestUrl.searchParams.get("projectSlug");
        const itemId = requestUrl.searchParams.get("itemId");
        const ownerNodeId = requestUrl.searchParams.get("ownerNodeId");
        if (
          !isReviewScreenshotPath(screenshotPath) ||
          !isReviewScreenshotSessionId(sessionId) ||
          !projectSlug ||
          !isSafeProjectSlug(projectSlug) ||
          !isReviewScreenshotItemId(itemId) ||
          !isBoundedNodeId(ownerNodeId)
        ) {
          sendJson(response, 400, { error: "Invalid bounded screenshot path." });
          return true;
        }
        await verifyReviewScreenshot({
          repoRelativePath: screenshotPath,
          sessionId,
          projectSlug,
          itemId,
          ownerNodeId
        }, options);
        const result = await readReviewScreenshot(screenshotPath, options);
        response.statusCode = 200;
        response.setHeader("Content-Type", "image/png");
        response.setHeader("Cache-Control", "private, no-store");
        response.end(result.png);
      } catch {
        sendJson(response, 404, { error: "Review Set screenshot not found." });
      }
      return true;
    }
    if (request.method === "DELETE") {
      try {
        const body = await readBoundedJson(request, 8_192) as Record<string, unknown>;
        if (
          !body ||
          typeof body !== "object" ||
          Array.isArray(body) ||
          !Array.isArray(body.screenshots) ||
          body.screenshots.length > 15 ||
          !body.screenshots.every((entry) => {
            if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
            const screenshot = entry as Record<string, unknown>;
            return (
              isReviewScreenshotPath(screenshot.repoRelativePath) &&
              isReviewScreenshotSessionId(screenshot.sessionId) &&
              typeof screenshot.projectSlug === "string" &&
              isSafeProjectSlug(screenshot.projectSlug) &&
              isReviewScreenshotItemId(screenshot.itemId) &&
              isBoundedNodeId(screenshot.ownerNodeId)
            );
          })
        ) {
          throw new Error("Invalid bounded screenshot deletion.");
        }
        await deleteReviewScreenshots(body.screenshots as Array<{
          repoRelativePath: string;
          sessionId: string;
          projectSlug: string;
          itemId: string;
          ownerNodeId: string;
        }>, options);
        response.statusCode = 204;
        response.end();
      } catch {
        sendJson(response, 400, { error: "Canvas Helper could not remove these screenshots." });
      }
      return true;
    }
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed." });
      return true;
    }

    const sessionId = headerValue(request, "x-canvas-helper-review-session");
    const projectSlug = headerValue(request, "x-canvas-helper-project");
    const itemId = headerValue(request, "x-canvas-helper-review-item");
    const screenshotId = headerValue(request, "x-canvas-helper-review-screenshot");
    const ownerNodeId = headerValue(request, "x-canvas-helper-inspection-node");
    if (
      !isReviewScreenshotSessionId(sessionId) ||
      !isSafeProjectSlug(projectSlug ?? "") ||
      (projectSlug?.length ?? 0) > 160 ||
      !isReviewScreenshotItemId(itemId) ||
      !isReviewScreenshotItemId(screenshotId) ||
      !isBoundedNodeId(ownerNodeId)
    ) {
      sendJson(response, 400, { error: "Invalid bounded screenshot request." });
      return true;
    }

    try {
      const result = await saveReviewScreenshot({
        sessionId,
        projectSlug: projectSlug as string,
        itemId,
        screenshotId,
        ownerNodeId,
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
