import path from "node:path";
import { readFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";

import { fileExists } from "../../../scripts/lib/fs.ts";

import { getPreviewPath, getReferencePreviewPath } from "../lib/preview-paths";
import { resolveContentType, sendJson } from "../lib/response";
import {
  decoratePreviewHtml,
  decoratePreviewHtmlBuffer,
  injectPreviewBridgeScript
} from "../lib/preview-inspection";

export type PreviewRouteOptions = {
  bridgeScriptPath?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function shouldReturnMissingReferenceHtml(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  return extension === ".html" || extension === ".htm";
}

function buildMissingReferencePreview(options: {
  slug: string;
  resourceRoot: "raw" | "extracted";
  relativePath: string;
}) {
  const { slug, resourceRoot, relativePath } = options;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Missing local course resource</title>
    <style>
      :root {
        color-scheme: light;
        font-family: "Segoe UI", Arial, sans-serif;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background: #f4efe8;
        color: #2c241f;
      }

      main {
        max-width: 52rem;
        margin: 0 auto;
        padding: 2rem 1.25rem 2.5rem;
      }

      .panel {
        background: #fffaf4;
        border: 1px solid #d8cabc;
        border-radius: 12px;
        box-shadow: 0 12px 32px rgba(54, 39, 28, 0.08);
        padding: 1.25rem;
      }

      h1 {
        margin: 0 0 0.75rem;
        font-size: 1.5rem;
        line-height: 1.2;
      }

      p {
        margin: 0 0 0.85rem;
        line-height: 1.6;
      }

      code {
        font-family: "Cascadia Code", "SFMono-Regular", Consolas, monospace;
        font-size: 0.92rem;
      }

      .callout {
        margin-top: 1rem;
        padding: 0.9rem 1rem;
        border-radius: 10px;
        background: #f7eee4;
        border: 1px solid #d8c4ad;
      }
    </style>
  </head>
  <body>
    <main>
      <div class="panel" data-preview-error="missing-reference-resource">
        <h1>Missing local course resource</h1>
        <p>
          Canvas Helper could not find the local ${escapeHtml(resourceRoot)} resource needed to preview this lesson.
          The course shell still points at the source file, but the file is missing from this workspace.
        </p>
        <p><strong>Project:</strong> <code>${escapeHtml(slug)}</code></p>
        <p><strong>Requested resource:</strong> <code>${escapeHtml(relativePath)}</code></p>
        <div class="callout">
          <p><strong>Next step</strong></p>
          <p>Restore <code>projects/resources/${escapeHtml(slug)}</code> and then run <code>npm run refs -- --project ${escapeHtml(slug)}</code>.</p>
        </div>
      </div>
    </main>
  </body>
</html>`;
}

function buildMissingWorkspacePreview(options: {
  slug: string;
  relativePath: string;
}) {
  const { slug, relativePath } = options;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Missing local workspace asset</title>
    <style>
      :root {
        color-scheme: light;
        font-family: "Segoe UI", Arial, sans-serif;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background: #f4efe8;
        color: #2c241f;
      }

      main {
        max-width: 52rem;
        margin: 0 auto;
        padding: 2rem 1.25rem 2.5rem;
      }

      .panel {
        background: #fffaf4;
        border: 1px solid #d8cabc;
        border-radius: 12px;
        box-shadow: 0 12px 32px rgba(54, 39, 28, 0.08);
        padding: 1.25rem;
      }

      h1 {
        margin: 0 0 0.75rem;
        font-size: 1.5rem;
        line-height: 1.2;
      }

      p {
        margin: 0 0 0.85rem;
        line-height: 1.6;
      }

      code {
        font-family: "Cascadia Code", "SFMono-Regular", Consolas, monospace;
        font-size: 0.92rem;
      }

      .callout {
        margin-top: 1rem;
        padding: 0.9rem 1rem;
        border-radius: 10px;
        background: #f7eee4;
        border: 1px solid #d8c4ad;
      }
    </style>
  </head>
  <body>
    <main>
      <div class="panel" data-preview-error="missing-workspace-resource">
        <h1>Missing local workspace asset</h1>
        <p>
          Canvas Helper could not find the local workspace file needed to render this assignment preview.
          The assignment delivery map still points at the asset, but the file is missing from this project workspace.
        </p>
        <p><strong>Project:</strong> <code>${escapeHtml(slug)}</code></p>
        <p><strong>Requested asset:</strong> <code>${escapeHtml(relativePath)}</code></p>
        <div class="callout">
          <p><strong>Next step</strong></p>
          <p>Restore the missing file under <code>projects/${escapeHtml(slug)}/workspace/assets</code> and then run <code>npm run verify -- --project ${escapeHtml(slug)}</code>.</p>
        </div>
      </div>
    </main>
  </body>
</html>`;
}

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

function bridgeScriptSource(options: PreviewRouteOptions) {
  return options.bridgeScriptPath ?? null;
}

function decorateHtmlResponse(
  body: string | Buffer,
  _request: IncomingMessage,
  options: PreviewRouteOptions
) {
  const scriptSource = bridgeScriptSource(options);
  if (!scriptSource) {
    return body;
  }

  const decoration = typeof body === "string" ? decoratePreviewHtml(body) : decoratePreviewHtmlBuffer(body);
  if (!decoration) {
    return body;
  }

  return Buffer.from(injectPreviewBridgeScript(decoration.html, scriptSource), "utf8");
}

export async function handlePreviewRoutes(
  url: string,
  request: IncomingMessage,
  response: ServerResponse,
  options: PreviewRouteOptions = {}
) {
  const previewMatch = url.match(/^\/preview\/(raw|workspace)\/([^/]+)(?:\/(.*))?$/);
  const referencePreviewMatch = url.match(/^\/preview\/references\/(raw|extracted)\/([^/]+)(?:\/(.*))?$/);

  if (previewMatch && !previewMatch[3] && !url.endsWith("/")) {
    const originalUrl = request.url ?? url;
    const queryIndex = originalUrl.indexOf("?");
    const querySuffix = queryIndex >= 0 ? originalUrl.slice(queryIndex) : "";
    response.statusCode = 308;
    response.setHeader("Location", `${url}/${querySuffix}`);
    response.end();
    return true;
  }

  if (referencePreviewMatch) {
    try {
      const filePath = await getReferencePreviewPath(
        referencePreviewMatch[1] as "raw" | "extracted",
        referencePreviewMatch[2],
        referencePreviewMatch[3]
      );

      if (!(await fileExists(filePath))) {
        if (shouldReturnMissingReferenceHtml(filePath)) {
          response.statusCode = 200;
          response.setHeader("Content-Type", "text/html; charset=utf-8");
          response.setHeader("X-Canvas-Helper-Preview-Error", "missing-reference-resource");
          response.end(decorateHtmlResponse(
            buildMissingReferencePreview({
              slug: referencePreviewMatch[2],
              resourceRoot: referencePreviewMatch[1] as "raw" | "extracted",
              relativePath: decodeURIComponent(referencePreviewMatch[3] || "")
            }),
            request,
            options
          ));
          return true;
        }

        sendJson(response, 404, { error: "Reference preview file not found." });
        return true;
      }

      const body = await readFile(filePath);
      const contentType = applyDetectedCharset(resolveContentType(filePath), body);
      response.setHeader("Content-Type", contentType);
      response.end(contentType.startsWith("text/html") ? decorateHtmlResponse(body, request, options) : body);
  } catch {
    sendJson(response, 403, { error: "Invalid reference preview request." });
    }

    return true;
  }

  if (!previewMatch) {
    return false;
  }

  try {
    const filePath = await getPreviewPath(
      previewMatch[1] as "raw" | "workspace",
      previewMatch[2],
      previewMatch[3]
    );

    if (!(await fileExists(filePath))) {
      if (previewMatch[1] === "workspace" && shouldReturnMissingReferenceHtml(filePath)) {
        response.statusCode = 200;
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.setHeader("X-Canvas-Helper-Preview-Error", "missing-workspace-resource");
        response.end(decorateHtmlResponse(
          buildMissingWorkspacePreview({
              slug: previewMatch[2],
              relativePath: decodeURIComponent(previewMatch[3] || "")
            }),
          request,
          options
        ));
        return true;
      }

      sendJson(response, 404, { error: "Preview file not found." });
      return true;
    }

    const body = await readFile(filePath);
    const contentType = applyDetectedCharset(resolveContentType(filePath), body);
    response.setHeader("Content-Type", contentType);
    response.end(contentType.startsWith("text/html") ? decorateHtmlResponse(body, request, options) : body);
  } catch {
    sendJson(response, 403, { error: "Invalid preview request." });
  }

  return true;
}
