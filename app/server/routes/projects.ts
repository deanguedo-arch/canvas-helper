import type { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";

import { fileExists, readJsonFile } from "../../../scripts/lib/fs.js";
import { getProjectPaths } from "../../../scripts/lib/paths.js";
import { listStudioProjectBundles, readStudioProjectBundle } from "../../../scripts/lib/projects.js";

import { sendJson } from "../lib/response";
import { isSafeProjectSlug } from "../lib/validation";

export async function handleProjectsRoute(url: string, _request: IncomingMessage, response: ServerResponse) {
  if (url === "/api/projects") {
    const bundles = await listStudioProjectBundles();
    sendJson(response, 200, bundles);
    return true;
  }

  const outlineMatch = url.match(/^\/api\/projects\/([^/]+)\/course-outline$/);
  if (outlineMatch) {
    const projectSlug = outlineMatch[1];
    if (!isSafeProjectSlug(projectSlug)) {
      sendJson(response, 400, { error: "Invalid project slug." });
      return true;
    }

    const courseOutlinePath = join(getProjectPaths(projectSlug).metaDir, "course-outline.json");
    if (!(await fileExists(courseOutlinePath))) {
      sendJson(response, 404, { error: "Course outline not found." });
      return true;
    }

    sendJson(response, 200, await readJsonFile(courseOutlinePath));
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
