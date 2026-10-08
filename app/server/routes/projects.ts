import type { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";

import { fileExists, readJsonFile } from "../../../scripts/lib/fs.ts";
import { getProjectPaths } from "../../../scripts/lib/paths.ts";
import { listStudioProjectBundles, readStudioProjectBundle } from "../../../scripts/lib/projects.ts";

import { organizationForSlug, readOrganizationRegistry, setProjectArchived } from "../lib/project-organization";

import { sendJson } from "../lib/response";
import { isSafeProjectSlug } from "../lib/validation";

export async function handleProjectsRoute(url: string, request: IncomingMessage, response: ServerResponse) {
  if (url === "/api/projects") {
    const bundles = await listStudioProjectBundles();
    const registry = await readOrganizationRegistry();
    sendJson(response, 200, bundles.map((bundle) => ({ ...bundle, organization: organizationForSlug(registry, bundle.manifest.slug) })));
    return true;
  }

  const organizationMatch = url.match(/^\/api\/projects\/([^/]+)\/organization\/(restore|archive)$/);
  if (organizationMatch) {
    if (request.method !== "POST") { sendJson(response, 405, { error: "Use POST." }); return true; }
    if (!isSafeProjectSlug(organizationMatch[1])) { sendJson(response, 400, { error: "Invalid project slug." }); return true; }
    try {
      sendJson(response, 200, await setProjectArchived(organizationMatch[1], organizationMatch[2] === "archive"));
    } catch (error) {
      sendJson(response, 409, { error: error instanceof Error ? error.message : "Organization could not be saved." });
    }
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
