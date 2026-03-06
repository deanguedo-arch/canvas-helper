import type { IncomingMessage, ServerResponse } from "node:http";

import { listStudioProjectBundles, readStudioProjectBundle } from "../../../scripts/lib/projects.js";

import { sendJson } from "../lib/response";

export async function handleProjectsRoute(url: string, _request: IncomingMessage, response: ServerResponse) {
  if (url === "/api/projects") {
    const bundles = await listStudioProjectBundles();
    sendJson(response, 200, bundles);
    return true;
  }

  const projectMatch = url.match(/^\/api\/projects\/([^/]+)$/);
  if (!projectMatch) {
    return false;
  }

  try {
    const bundle = await readStudioProjectBundle(projectMatch[1]);
    sendJson(response, 200, bundle);
  } catch (error) {
    sendJson(response, 404, {
      error: error instanceof Error ? error.message : "Project not found."
    });
  }

  return true;
}
