import type { ServerResponse } from "node:http";
import path from "node:path";

import { lookup as lookupMimeType } from "mime-types";

export function resolveContentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".jsx" || extension === ".js" || extension === ".mjs" || extension === ".cjs") {
    return "text/javascript; charset=utf-8";
  }

  if (extension === ".json") {
    return "application/json; charset=utf-8";
  }

  if (extension === ".css") {
    return "text/css; charset=utf-8";
  }

  if (extension === ".html" || extension === ".htm") {
    return "text/html; charset=utf-8";
  }

  return lookupMimeType(filePath) || "application/octet-stream";
}

export function sendJson(response: ServerResponse, statusCode: number, value: unknown) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.statusCode = statusCode;
  response.end(JSON.stringify(value, null, 2));
}
