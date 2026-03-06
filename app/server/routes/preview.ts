import { readFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";

import { fileExists } from "../../../scripts/lib/fs.js";

import { getPreviewPath, getReferencePreviewPath } from "../lib/preview-paths";
import { resolveContentType, sendJson } from "../lib/response";

export async function handlePreviewRoutes(url: string, _request: IncomingMessage, response: ServerResponse) {
  const previewMatch = url.match(/^\/preview\/(raw|workspace)\/([^/]+)(?:\/(.*))?$/);
  const referencePreviewMatch = url.match(/^\/preview\/references\/(raw|extracted)\/([^/]+)(?:\/(.*))?$/);

  if (referencePreviewMatch) {
    try {
      const filePath = getReferencePreviewPath(
        referencePreviewMatch[1] as "raw" | "extracted",
        referencePreviewMatch[2],
        referencePreviewMatch[3]
      );

      if (!(await fileExists(filePath))) {
        sendJson(response, 404, { error: `Reference preview file not found: ${filePath}` });
        return true;
      }

      const body = await readFile(filePath);
      response.setHeader("Content-Type", resolveContentType(filePath));
      response.end(body);
    } catch (error) {
      sendJson(response, 403, {
        error: error instanceof Error ? error.message : "Invalid reference preview request."
      });
    }

    return true;
  }

  if (!previewMatch) {
    return false;
  }

  try {
    const filePath = getPreviewPath(
      previewMatch[1] as "raw" | "workspace",
      previewMatch[2],
      previewMatch[3]
    );

    if (!(await fileExists(filePath))) {
      sendJson(response, 404, { error: `Preview file not found: ${filePath}` });
      return true;
    }

    const body = await readFile(filePath);
    response.setHeader("Content-Type", resolveContentType(filePath));
    response.end(body);
  } catch (error) {
    sendJson(response, 403, {
      error: error instanceof Error ? error.message : "Invalid preview request."
    });
  }

  return true;
}
