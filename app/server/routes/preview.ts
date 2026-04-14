import { readFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";

import { fileExists } from "../../../scripts/lib/fs.ts";

import { getPreviewPath, getReferencePreviewPath } from "../lib/preview-paths";
import { resolveContentType, sendJson } from "../lib/response";

function detectBomCharset(body: Buffer) {
  if (body.length >= 2) {
    const b0 = body[0];
    const b1 = body[1];
    if (b0 === 0xff && b1 === 0xfe) {
      return "utf-16le";
    }
    if (b0 === 0xfe && b1 === 0xff) {
      return "utf-16be";
    }
  }

  if (body.length >= 3 && body[0] === 0xef && body[1] === 0xbb && body[2] === 0xbf) {
    return "utf-8";
  }

  return "";
}

function applyDetectedCharset(contentType: string, body: Buffer) {
  const detected = detectBomCharset(body);
  if (!detected || detected === "utf-8") {
    return contentType;
  }

  if (/charset=/i.test(contentType)) {
    return contentType.replace(/charset=[^;]+/i, `charset=${detected}`);
  }

  if (/^(text\/|application\/(?:javascript|json|xml))/i.test(contentType)) {
    return `${contentType}; charset=${detected}`;
  }

  return contentType;
}

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
      const contentType = applyDetectedCharset(resolveContentType(filePath), body);
      response.setHeader("Content-Type", contentType);
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
    const contentType = applyDetectedCharset(resolveContentType(filePath), body);
    response.setHeader("Content-Type", contentType);
    response.end(body);
  } catch (error) {
    sendJson(response, 403, {
      error: error instanceof Error ? error.message : "Invalid preview request."
    });
  }

  return true;
}
