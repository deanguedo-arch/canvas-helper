import type { IncomingMessage, ServerResponse } from "node:http";

import { REVIEW_SCREENSHOT_MAX_BYTES } from "../../shared/inspection.js";
import { isPreviewInspectPayload, type PreviewInspectPayload } from "../../shared/preview-bridge.js";
import { captureMarkedPreviewPng, type PreviewCaptureInput } from "../lib/preview-capture";
import { sendJson } from "../lib/response";
import { isSafeProjectSlug } from "../lib/validation";

type PreviewCaptureRequest = {
  projectSlug: string;
  selection: PreviewInspectPayload;
  markerNumber: number;
};

type PreviewCaptureRouteOptions = {
  previewOrigin: string;
  capture?: (input: PreviewCaptureInput) => Promise<{ png: Buffer; width: number; height: number }>;
  timeoutMs?: number;
};

function isPreviewCaptureRequest(value: unknown): value is PreviewCaptureRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const request = value as Record<string, unknown>;
  return (
    typeof request.projectSlug === "string" &&
    isSafeProjectSlug(request.projectSlug) &&
    request.projectSlug.length <= 160 &&
    isPreviewInspectPayload(request.selection) &&
    typeof request.markerNumber === "number" &&
    Number.isInteger(request.markerNumber) &&
    request.markerNumber >= 1 &&
    request.markerNumber <= 5
  );
}

async function readBoundedJson(request: IncomingMessage, signal: AbortSignal) {
  const contentType = String(request.headers["content-type"] ?? "").split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") {
    throw new Error("Capture requests must use JSON.");
  }
  const declared = Number(request.headers["content-length"] ?? 0);
  if (declared > 16_384) {
    throw new Error("Capture request is too large.");
  }
  if (signal.aborted) {
    throw new Error("Capture request was cancelled.");
  }
  const readRequest = (async () => {
    const chunks: Buffer[] = [];
    let byteLength = 0;
    for await (const chunk of request) {
      if (signal.aborted) {
        throw new Error("Capture request was cancelled.");
      }
      const buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
      byteLength += buffer.length;
      if (byteLength > 16_384) {
        throw new Error("Capture request is too large.");
      }
      chunks.push(buffer);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  })();
  let rejectAbort!: (error: Error) => void;
  const aborted = new Promise<never>((_resolve, reject) => { rejectAbort = reject; });
  const onAbort = () => rejectAbort(new Error("Capture request was cancelled."));
  signal.addEventListener("abort", onAbort, { once: true });
  if (signal.aborted) onAbort();
  try {
    return await Promise.race([readRequest, aborted]);
  } finally {
    signal.removeEventListener("abort", onAbort);
  }
}

async function awaitAbortable<T>(work: Promise<T>, signal: AbortSignal) {
  let rejectAbort!: (error: Error) => void;
  const aborted = new Promise<never>((_resolve, reject) => { rejectAbort = reject; });
  const onAbort = () => rejectAbort(new Error("Capture request was cancelled."));
  signal.addEventListener("abort", onAbort, { once: true });
  if (signal.aborted) onAbort();
  try {
    return await Promise.race([work, aborted]);
  } finally {
    signal.removeEventListener("abort", onAbort);
    void work.catch(() => undefined);
  }
}

export function createPreviewCaptureRouteHandler(options: PreviewCaptureRouteOptions) {
  const capture = options.capture ?? captureMarkedPreviewPng;
  const timeoutMs = Math.max(50, Math.min(options.timeoutMs ?? 20_000, 20_000));
  let captureInFlight = false;
  return async function handlePreviewCaptureRoute(url: string, request: IncomingMessage, response: ServerResponse) {
    if (url !== "/api/inspection/capture") {
      return false;
    }
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed." });
      return true;
    }
    if (captureInFlight) {
      sendJson(response, 429, { error: "A course screenshot is already being captured." });
      return true;
    }
    captureInFlight = true;
    const controller = new AbortController();
    const cancelCapture = () => controller.abort();
    request.once("aborted", cancelCapture);
    response.once("close", cancelCapture);
    const timeout = setTimeout(cancelCapture, timeoutMs);
    try {
      const body = await readBoundedJson(request, controller.signal);
      if (!isPreviewCaptureRequest(body)) {
        sendJson(response, 400, { error: "Invalid bounded preview capture request." });
        return true;
      }
      const result = await awaitAbortable(capture({
        previewOrigin: options.previewOrigin,
        projectSlug: body.projectSlug,
        selection: body.selection,
        markerNumber: body.markerNumber,
        signal: controller.signal
      }), controller.signal);
      if (!result.png.length || result.png.length > REVIEW_SCREENSHOT_MAX_BYTES) {
        throw new Error("Captured PNG exceeds the bounded screenshot limit.");
      }
      response.statusCode = 200;
      response.setHeader("Content-Type", "image/png");
      response.setHeader("Cache-Control", "no-store");
      response.setHeader("X-Canvas-Helper-Image-Width", String(result.width));
      response.setHeader("X-Canvas-Helper-Image-Height", String(result.height));
      response.end(result.png);
    } catch {
      if (!response.destroyed && !response.writableEnded) {
        sendJson(response, controller.signal.aborted ? 408 : 400, { error: "Canvas Helper could not capture this course preview." });
      }
    } finally {
      clearTimeout(timeout);
      request.off("aborted", cancelCapture);
      response.off("close", cancelCapture);
      captureInFlight = false;
    }
    return true;
  };
}
