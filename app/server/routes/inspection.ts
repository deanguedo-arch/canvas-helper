import type { IncomingMessage, ServerResponse } from "node:http";

import { getPreviewPath } from "../lib/preview-paths";
import { readRequestJson } from "../lib/request-body";
import { resolvePreviewInspection } from "../lib/preview-inspection";
import { sendJson } from "../lib/response";
import { isSafeProjectSlug } from "../lib/validation";
import { isPreviewInspectPayload } from "../../shared/preview-bridge.js";
import type { InspectionResolveRequest } from "../../shared/inspection.js";

function isInspectionResolveRequest(value: unknown): value is InspectionResolveRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const request = value as Record<string, unknown>;
  return (
    typeof request.projectSlug === "string" &&
    isSafeProjectSlug(request.projectSlug) &&
    (request.root === "raw" || request.root === "workspace") &&
    typeof request.htmlPath === "string" &&
    request.htmlPath.length > 0 &&
    request.htmlPath.length <= 1_024 &&
    isPreviewInspectPayload(request.selection)
  );
}

export async function handleInspectionRoute(url: string, request: IncomingMessage, response: ServerResponse) {
  if (url !== "/api/inspection/resolve") {
    return false;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return true;
  }

  try {
    const body = await readRequestJson<unknown>(request);
    if (!isInspectionResolveRequest(body)) {
      sendJson(response, 400, { error: "Invalid bounded inspection request." });
      return true;
    }

    const previewFilePath = await getPreviewPath(body.root, body.projectSlug, body.htmlPath);
    const resolution = await resolvePreviewInspection(body, previewFilePath);
    sendJson(response, 200, resolution);
  } catch (error) {
    sendJson(response, 400, {
      error: error instanceof Error ? error.message : "Inspection resolution failed."
    });
  }

  return true;
}
