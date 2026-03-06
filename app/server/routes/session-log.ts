import type { IncomingMessage, ServerResponse } from "node:http";

import { readStudioProjectBundle } from "../../../scripts/lib/projects.js";

import { readRequestJson } from "../lib/request-body";
import { sendJson } from "../lib/response";
import { appendSessionLog } from "../lib/session-log";
import { isSafeProjectSlug } from "../lib/validation";
import type { SessionLogPayload } from "../lib/types";

export async function handleSessionLogRoute(url: string, request: IncomingMessage, response: ServerResponse) {
  const sessionLogMatch = url.match(/^\/api\/projects\/([^/]+)\/session-log$/);
  if (!sessionLogMatch) {
    return false;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, {
      error: "Method not allowed."
    });
    return true;
  }

  const slug = decodeURIComponent(sessionLogMatch[1]);
  if (!isSafeProjectSlug(slug)) {
    sendJson(response, 400, {
      error: "Invalid project slug."
    });
    return true;
  }

  try {
    await readStudioProjectBundle(slug);
    const payload = await readRequestJson<SessionLogPayload>(request);
    const result = await appendSessionLog(slug, payload);
    sendJson(response, 200, {
      ok: true,
      path: result.path,
      savedAt: result.savedAt
    });
  } catch (error) {
    sendJson(response, 400, {
      error: error instanceof Error ? error.message : "Failed to save session log."
    });
  }

  return true;
}
