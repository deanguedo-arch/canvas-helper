import type { IncomingMessage, ServerResponse } from "node:http";

import {
  isCourseEditApplyRequest,
  isCourseEditNormalizeRequest,
  isCourseEditPreviewClearRequest,
  isCourseEditPreviewNormalizeRequest,
  isCourseEditReopenRequest,
  isCourseRenameRequest,
  type CourseEditResolveRequest
} from "../../shared/course-editing.js";
import type { InspectionResolveRequest } from "../../shared/inspection.js";
import { isPreviewInspectPayload } from "../../shared/preview-bridge.js";
import {
  applyCourseEditBatch,
  getCourseEditStatus,
  normalizeCourseEditEditorDocument,
  reopenCourseEditTarget,
  resolveCourseEditTarget,
  renameCourseForStudio,
  undoCourseEditBatch
} from "../lib/course-editing";
import { MAX_COURSE_EDIT_IMAGE_BYTES } from "../lib/course-edit-image";
import {
  clearCourseEditPreview,
  normalizeCourseEditPreview
} from "../lib/course-edit-preview";
import {
  storePendingCourseEditImage,
  type PendingCourseEditImageBinding
} from "../lib/course-edit-preview-assets";
import { readRequestJson } from "../lib/request-body";
import { sendJson } from "../lib/response";
import { isSafeProjectSlug } from "../lib/validation";

const COURSE_EDIT_RESOLVE_MAX_BYTES = 262_144;
const COURSE_EDIT_APPLY_MAX_BYTES = 4_194_304;
const COURSE_EDIT_RENAME_MAX_BYTES = 16_384;
const COURSE_EDIT_PREVIEW_MAX_BYTES = 131_072;
const COURSE_EDIT_REOPEN_MAX_BYTES = 65_536;
const COURSE_EDIT_NORMALIZE_MAX_BYTES = 65_536;

type CourseEditsRouteOptions = {
  repoRoot?: string;
};

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

async function readBoundedImage(request: IncomingMessage) {
  const declared = Number(request.headers["content-length"] ?? 0);
  if (declared > MAX_COURSE_EDIT_IMAGE_BYTES) throw new Error("Images must be 10 MB or smaller.");
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of request) {
    const buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    total += buffer.length;
    if (total > MAX_COURSE_EDIT_IMAGE_BYTES) throw new Error("Images must be 10 MB or smaller.");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

function boundedHeader(request: IncomingMessage, name: string, maximum: number) {
  const raw = request.headers[name];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string" || !value || value.length > maximum || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new Error("The temporary image preview is missing a valid edit binding.");
  }
  return value;
}

function pendingImageBindingFromHeaders(request: IncomingMessage, projectSlug: string): PendingCourseEditImageBinding {
  const htmlPath = boundedHeader(request, "x-canvas-helper-html-path", 2_048);
  if (htmlPath.startsWith("/") || htmlPath.includes("\\") || htmlPath.split("/").some((part) => !part || part === "." || part === "..")) {
    throw new Error("The temporary image preview has an invalid course page path.");
  }
  const targetId = boundedHeader(request, "x-canvas-helper-target-id", 160);
  const sourceDigest = boundedHeader(request, "x-canvas-helper-source-digest", 64);
  const targetNodeId = boundedHeader(request, "x-canvas-helper-target-node-id", 160);
  const previewSessionId = boundedHeader(request, "x-canvas-helper-preview-session-id", 96);
  const pageIdentity = boundedHeader(request, "x-canvas-helper-page-identity", 2_048);
  if (!/^[a-f0-9]{24}$/.test(targetId) || !/^[a-f0-9]{64}$/.test(sourceDigest) || !/^ch1:[a-f0-9]{24}:[1-9][0-9]*$/.test(targetNodeId) || !/^[A-Za-z0-9-]+$/.test(previewSessionId)) {
    throw new Error("The temporary image preview edit identity is invalid.");
  }
  return { projectSlug, htmlPath, targetId, sourceDigest, targetNodeId, previewSessionId, pageIdentity };
}

function decodeProjectSlug(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

async function handleCourseEditsRouteInner(
  url: string,
  request: IncomingMessage,
  response: ServerResponse,
  options: CourseEditsRouteOptions = {}
) {
  const repoRoot = options.repoRoot;
  if (url === "/api/course-edits/normalize") {
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed." });
      return true;
    }
    try {
      const body = await readRequestJson<unknown>(request, {
        maxBytes: COURSE_EDIT_NORMALIZE_MAX_BYTES,
        description: "Course edit text normalization requests"
      });
      if (!isCourseEditNormalizeRequest(body)) {
        sendJson(response, 400, { error: "Invalid bounded course text normalization request." });
        return true;
      }
      sendJson(response, 200, await normalizeCourseEditEditorDocument({
        identity: body.identity,
        document: body.document,
        repoRoot
      }));
    } catch (error) {
      sendJson(response, 422, { error: safeError(error) });
    }
    return true;
  }
  if (url === "/api/course-edits/preview/normalize" || url === "/api/course-edits/preview/clear") {
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed." });
      return true;
    }
    try {
      const body = await readRequestJson<unknown>(request, {
        maxBytes: COURSE_EDIT_PREVIEW_MAX_BYTES,
        description: "Course edit preview requests"
      });
      if (url.endsWith("/normalize")) {
        if (!isCourseEditPreviewNormalizeRequest(body)) {
          sendJson(response, 400, { error: "Invalid bounded live preview request." });
          return true;
        }
        sendJson(response, 200, await normalizeCourseEditPreview(body, repoRoot));
      } else {
        if (!isCourseEditPreviewClearRequest(body)) {
          sendJson(response, 400, { error: "Invalid bounded live preview clear request." });
          return true;
        }
        sendJson(response, 200, await clearCourseEditPreview(body));
      }
    } catch (error) {
      sendJson(response, 422, { error: safeError(error) });
    }
    return true;
  }
  if (url === "/api/course-edits/resolve") {
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed." });
      return true;
    }
    try {
      const body = await readRequestJson<unknown>(request, {
        maxBytes: COURSE_EDIT_RESOLVE_MAX_BYTES,
        description: "Course edit resolve requests"
      });
      if (!isCourseEditResolveRequest(body)) {
        sendJson(response, 400, { error: "Invalid bounded course edit request." });
        return true;
      }
      sendJson(response, 200, await resolveCourseEditTarget(body as InspectionResolveRequest, repoRoot));
    } catch (error) {
      sendJson(response, 400, { error: safeError(error) });
    }
    return true;
  }

  if (url === "/api/course-edits/reopen") {
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed." });
      return true;
    }
    try {
      const body = await readRequestJson<unknown>(request, {
        maxBytes: COURSE_EDIT_REOPEN_MAX_BYTES,
        description: "Course edit reopen requests"
      });
      if (!isCourseEditReopenRequest(body)) {
        sendJson(response, 400, { error: "Invalid bounded course edit reopen request." });
        return true;
      }
      sendJson(response, 200, await reopenCourseEditTarget(body.identity, repoRoot));
    } catch (error) {
      sendJson(response, 400, { error: safeError(error) });
    }
    return true;
  }

  const match = url.match(/^\/api\/projects\/([^/]+)\/course-edits\/(status|apply|undo|preview-assets|rename)$/);
  if (!match) return false;
  const projectSlug = decodeProjectSlug(match[1]);
  const action = match[2];
  if (!projectSlug || !isSafeProjectSlug(projectSlug)) {
    sendJson(response, 400, { error: "Invalid project slug." });
    return true;
  }

  if (action === "status") {
    if (request.method !== "GET") {
      sendJson(response, 405, { error: "Method not allowed." });
      return true;
    }
    try {
      sendJson(response, 200, await getCourseEditStatus(projectSlug, repoRoot));
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
    if (action === "preview-assets") {
      const binding = pendingImageBindingFromHeaders(request, projectSlug);
      sendJson(response, 200, await storePendingCourseEditImage({
        ...binding,
        bytes: await readBoundedImage(request)
      }));
      return true;
    }
    if (action === "undo") {
      sendJson(response, 200, await undoCourseEditBatch(projectSlug, repoRoot));
      return true;
    }
    if (action === "rename") {
      const body = await readRequestJson<unknown>(request, {
        maxBytes: COURSE_EDIT_RENAME_MAX_BYTES,
        description: "Course rename requests"
      });
      if (!isCourseRenameRequest(body) || body.projectSlug !== projectSlug) {
        sendJson(response, 400, { error: "Invalid bounded course rename request." });
        return true;
      }
      sendJson(response, 200, await renameCourseForStudio({ projectSlug, title: body.title, repoRoot }));
      return true;
    }
    const body = await readRequestJson<unknown>(request, {
      maxBytes: COURSE_EDIT_APPLY_MAX_BYTES,
      description: "Course edit apply requests"
    });
    if (!isCourseEditApplyRequest(body) || body.projectSlug !== projectSlug) {
      sendJson(response, 400, { error: "Invalid bounded course edit batch." });
      return true;
    }
    sendJson(response, 200, await applyCourseEditBatch(body, repoRoot));
  } catch (error) {
    sendJson(response, 422, { error: safeError(error) });
  }
  return true;
}

/**
 * Route modules are loaded dynamically by Studio. Keep a final boundary here
 * so a malformed path or a later async regression cannot become an unhandled
 * rejection in the server process.
 */
export async function handleCourseEditsRoute(
  url: string,
  request: IncomingMessage,
  response: ServerResponse,
  options: CourseEditsRouteOptions = {}
) {
  try {
    return await handleCourseEditsRouteInner(url, request, response, options);
  } catch (error) {
    if (!response.headersSent && !response.writableEnded) {
      sendJson(response, 400, { error: safeError(error) });
    } else if (!response.writableEnded) {
      response.end();
    }
    return true;
  }
}
