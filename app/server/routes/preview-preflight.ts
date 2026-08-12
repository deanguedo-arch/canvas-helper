import type { IncomingMessage, ServerResponse } from "node:http";

import { inspectPreviewPreflightTarget, resolvePreviewPreflightTarget } from "../lib/preview-preflight";
import { sendJson } from "../lib/response";

type PreviewPreflightRequest = {
  previewUrl: string;
};

export type PreviewPreflightRouteOptions = {
  previewOrigin: string;
};

async function readBoundedRequest(request: IncomingMessage) {
  const contentType = String(request.headers["content-type"] ?? "").split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") throw new Error("Preview checks must use JSON.");
  const declared = Number(request.headers["content-length"] ?? 0);
  if (declared > 8_192) throw new Error("Preview check is too large.");
  const chunks: Buffer[] = [];
  let byteLength = 0;
  for await (const chunk of request) {
    const buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    byteLength += buffer.length;
    if (byteLength > 8_192) throw new Error("Preview check is too large.");
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

function isPreviewPreflightRequest(value: unknown): value is PreviewPreflightRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.previewUrl === "string" && candidate.previewUrl.length > 0 && candidate.previewUrl.length <= 4_096;
}

export function createPreviewPreflightRouteHandler(options: PreviewPreflightRouteOptions) {
  return async function handlePreviewPreflightRoute(url: string, request: IncomingMessage, response: ServerResponse) {
    if (url !== "/api/preview/preflight") return false;
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed." });
      return true;
    }
    try {
      const body = await readBoundedRequest(request);
      if (!isPreviewPreflightRequest(body)) {
        sendJson(response, 400, { error: "Invalid bounded preview check." });
        return true;
      }
      const target = await resolvePreviewPreflightTarget(body.previewUrl, options.previewOrigin);
      const result = await inspectPreviewPreflightTarget(target);
      response.setHeader("Cache-Control", "no-store");
      sendJson(response, 200, result);
    } catch {
      sendJson(response, 400, { error: "Canvas Helper could not safely check this local preview." });
    }
    return true;
  };
}
