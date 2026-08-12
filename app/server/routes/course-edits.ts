import type { IncomingMessage, ServerResponse } from "node:http";

import {
  isCourseEditApplyRequest,
  type CourseEditResolveRequest
} from "../../shared/course-editing.js";
import type { InspectionResolveRequest } from "../../shared/inspection.js";
import { isPreviewInspectPayload } from "../../shared/preview-bridge.js";
import {
  applyCourseEditBatch,
  getCourseEditStatus,
  resolveCourseEditTarget,
  undoCourseEditBatch
} from "../lib/course-editing";
import { readRequestJson } from "../lib/request-body";
import { sendJson } from "../lib/response";
import { isSafeProjectSlug } from "../lib/validation";

function isCourseEditResolveRequest(value: unknown): value is CourseEditResolveRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const request = value as Record<string, unknown>;
  return (
    Object.keys(request).every((key) => ["projectSlug", "root", "htmlPath", "selection"].includes(key)) &&
    typeof request.projectSlug === "string" &&
    isSafeProjectSlug(request.projectSlug) &&
    request.root === "workspace" &&
    typeof request.htmlPath === "string" &&
    request.htmlPath.length > 0 &&
    request.htmlPath.length <= 1_024 &&
    !request.htmlPath.startsWith("/") &&
    !request.htmlPath.includes("\\") &&
    !request.htmlPath.split("/").some((part) => !part || part === "." || part === "..") &&
    isPreviewInspectPayload(request.selection)
  );
}

function safeError(error: unknown) {
  const message = error instanceof Error ? error.message : "The course edit could not be completed.";
  return message
    .replaceAll(process.cwd(), "the repository")
    .replace(/\/(?:Users|home)\/[A-Za-z0-9._-]+\/[A-Za-z0-9_./ -]+/g, "a local course path")
    .slice(0, 1_200);
}

export async function handleCourseEditsRoute(url: string, request: IncomingMessage, response: ServerResponse) {
  if (url === "/api/course-edits/resolve") {
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed." });
      return true;
    }
    try {
      const body = await readRequestJson<unknown>(request);
      if (!isCourseEditResolveRequest(body)) {
        sendJson(response, 400, { error: "Invalid bounded course edit request." });
        return true;
      }
      sendJson(response, 200, await resolveCourseEditTarget(body as InspectionResolveRequest));
    } catch (error) {
      sendJson(response, 400, { error: safeError(error) });
    }
    return true;
  }

  const match = url.match(/^\/api\/projects\/([^/]+)\/course-edits\/(status|apply|undo)$/);
  if (!match) return false;
  const projectSlug = decodeURIComponent(match[1]);
  const action = match[2];
  if (!isSafeProjectSlug(projectSlug)) {
    sendJson(response, 400, { error: "Invalid project slug." });
    return true;
  }

  if (action === "status") {
    if (request.method !== "GET") {
      sendJson(response, 405, { error: "Method not allowed." });
      return true;
    }
    try {
      sendJson(response, 200, await getCourseEditStatus(projectSlug));
    } catch (error) {
      sendJson(response, 400, { error: safeError(error) });
    }
    return true;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return true;
  }
  try {
    if (action === "undo") {
      sendJson(response, 200, await undoCourseEditBatch(projectSlug));
      return true;
    }
    const body = await readRequestJson<unknown>(request);
    if (!isCourseEditApplyRequest(body) || body.projectSlug !== projectSlug) {
      sendJson(response, 400, { error: "Invalid bounded course edit batch." });
      return true;
    }
    sendJson(response, 200, await applyCourseEditBatch(body));
  } catch (error) {
    sendJson(response, 422, { error: safeError(error) });
  }
  return true;
}
