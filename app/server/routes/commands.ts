import type { IncomingMessage, ServerResponse } from "node:http";

import { readStudioProjectBundle } from "../../../scripts/lib/projects.js";

import { runStudioCommand } from "../lib/command-runner";
import { sendJson } from "../lib/response";
import { isSafeProjectSlug } from "../lib/validation";
import type { StudioCommandName } from "../lib/types";

export async function handleCommandsRoute(url: string, request: IncomingMessage, response: ServerResponse) {
  const commandMatch = url.match(/^\/api\/projects\/([^/]+)\/commands\/([^/]+)$/);
  if (!commandMatch) {
    return false;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, {
      error: "Method not allowed."
    });
    return true;
  }

  const slug = decodeURIComponent(commandMatch[1]);
  const commandName = decodeURIComponent(commandMatch[2]) as StudioCommandName;

  if (!isSafeProjectSlug(slug)) {
    sendJson(response, 400, {
      error: "Invalid project slug."
    });
    return true;
  }

  try {
    await readStudioProjectBundle(slug);
    const result = await runStudioCommand(slug, commandName);
    sendJson(response, result.ok ? 200 : 422, result);
  } catch (error) {
    sendJson(response, 400, {
      error: error instanceof Error ? error.message : "Failed to run project command."
    });
  }

  return true;
}
