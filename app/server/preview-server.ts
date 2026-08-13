import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { once } from "node:events";

import { buildPreviewBridgeRuntime } from "./preview-bridge-runtime";
import {
  handlePreviewRuntimeRelay,
  parsePreviewRuntimeRelayPath
} from "./lib/preview-runtime-relay";
import { handlePreviewRoutes } from "./routes/preview";
import { parsePreviewCapabilityPath } from "../shared/preview-path.js";

export type IsolatedPreviewServer = {
  origin: string;
  studioOrigin: string;
  close: () => Promise<void>;
};

export type IsolatedPreviewServerOptions = {
  studioOrigin: string;
  repoRoot?: string;
};

function sendNotFound(response: ServerResponse) {
  response.statusCode = 404;
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.end("Not found");
}

function applyPreviewSecurityHeaders(response: ServerResponse, studioOrigin: string) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self' data: blob:",
      "base-uri 'self'",
      "connect-src 'self'",
      "font-src 'self' data: https:",
      "form-action 'none'",
      `frame-ancestors 'self' ${studioOrigin}`,
      "frame-src 'self' https:",
      "img-src 'self' data: blob: https:",
      "media-src 'self' data: blob: https:",
      "object-src 'none'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
      "style-src 'self' 'unsafe-inline' https:"
    ].join("; ")
  );
  response.setHeader("Permissions-Policy", "display-capture=()");
  response.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-Content-Type-Options", "nosniff");
}

const PREVIEW_CAPABILITY_TTL_MS = 8 * 60 * 60 * 1_000;
const PREVIEW_CAPABILITY_MAX_ENTRIES = 256;
const PREVIEW_CAPABILITY_MAX_RUNTIME_SOURCES = 64;

type PreviewCapabilityEntry = {
  scope: string;
  lastUsedAt: number;
  runtimeSources: Set<string>;
};

function trustedCapabilityBootstrap(request: IncomingMessage, studioOrigin: string) {
  const referer = request.headers.referer;
  if (!referer) return false;
  try {
    if (new URL(referer).origin !== studioOrigin) return false;
  } catch {
    return false;
  }
  return request.headers["sec-fetch-site"] !== "same-origin";
}

function scopesShareProjectReferenceBoundary(existingScope: string, requestedScope: string) {
  if (existingScope === requestedScope) return true;
  const project = existingScope.match(/^project:workspace:(.+)$/);
  const reference = requestedScope.match(/^reference:(?:raw|extracted):(.+)$/);
  return Boolean(project && reference && project[1] === reference[1]);
}

function authorizePreviewCapability(
  request: IncomingMessage,
  pathname: string,
  studioOrigin: string,
  capabilities: Map<string, PreviewCapabilityEntry>
) {
  const parsed = parsePreviewCapabilityPath(pathname);
  if (!parsed) return null;
  const now = Date.now();
  for (const [token, entry] of capabilities) {
    if (entry.lastUsedAt > now || now - entry.lastUsedAt > PREVIEW_CAPABILITY_TTL_MS) {
      capabilities.delete(token);
    }
  }
  const existing = capabilities.get(parsed.token);
  if (existing) {
    if (!scopesShareProjectReferenceBoundary(existing.scope, parsed.scope)) return null;
    existing.lastUsedAt = now;
    return parsed;
  }
  if (!trustedCapabilityBootstrap(request, studioOrigin)) return null;
  if (capabilities.size >= PREVIEW_CAPABILITY_MAX_ENTRIES) {
    const oldest = [...capabilities.entries()].sort((left, right) => left[1].lastUsedAt - right[1].lastUsedAt)[0];
    if (oldest) capabilities.delete(oldest[0]);
  }
  capabilities.set(parsed.token, { scope: parsed.scope, lastUsedAt: now, runtimeSources: new Set() });
  return parsed;
}

function authorizeExistingPreviewCapability(
  token: string,
  capabilities: Map<string, PreviewCapabilityEntry>
) {
  const now = Date.now();
  for (const [candidate, entry] of capabilities) {
    if (entry.lastUsedAt > now || now - entry.lastUsedAt > PREVIEW_CAPABILITY_TTL_MS) {
      capabilities.delete(candidate);
    }
  }
  const existing = capabilities.get(token);
  if (!existing) return null;
  existing.lastUsedAt = now;
  return existing;
}

function registerPreviewRuntimeSource(entry: PreviewCapabilityEntry, source: string) {
  if (entry.runtimeSources.has(source)) return true;
  if (entry.runtimeSources.size >= PREVIEW_CAPABILITY_MAX_RUNTIME_SOURCES) return false;
  entry.runtimeSources.add(source);
  return true;
}

async function handlePreviewServerRequest(
  request: IncomingMessage,
  response: ServerResponse,
  studioOrigin: string,
  capabilities: Map<string, PreviewCapabilityEntry>,
  repoRoot?: string
) {
  applyPreviewSecurityHeaders(response, studioOrigin);
  const method = (request.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    response.statusCode = 405;
    response.setHeader("Allow", "GET, HEAD");
    response.end();
    return;
  }

  const url = request.url ?? "/";
  const pathname = new URL(url, "http://preview.local").pathname;
  if (pathname === "/_canvas-helper/preview-bridge.js") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/javascript; charset=utf-8");
    response.end(method === "HEAD" ? undefined : buildPreviewBridgeRuntime(studioOrigin));
    return;
  }

  if (pathname.startsWith("/_canvas-helper/p/")) {
    const runtimeRelay = parsePreviewRuntimeRelayPath(pathname);
    if (runtimeRelay) {
      const capability = authorizeExistingPreviewCapability(runtimeRelay.token, capabilities);
      if (!capability) {
        response.statusCode = 403;
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.end("Preview capability denied");
        return;
      }
      await handlePreviewRuntimeRelay(
        request,
        response,
        runtimeRelay.publicPrefix,
        capability.runtimeSources,
        (source) => registerPreviewRuntimeSource(capability, source)
      );
      return;
    }
    const authorized = authorizePreviewCapability(request, pathname, studioOrigin, capabilities);
    if (!authorized) {
      response.statusCode = 403;
      response.setHeader("Content-Type", "text/plain; charset=utf-8");
      response.end("Preview capability denied");
      return;
    }
    const capability = capabilities.get(authorized.token);
    if (!capability) {
      response.statusCode = 403;
      response.setHeader("Content-Type", "text/plain; charset=utf-8");
      response.end("Preview capability denied");
      return;
    }
    await handlePreviewRoutes(authorized.previewPath, request, response, {
      bridgeScriptPath: "/_canvas-helper/preview-bridge.js",
      publicPathPrefix: authorized.publicPrefix,
      registerRuntimeSource: (source) => registerPreviewRuntimeSource(capability, source),
      repoRoot
    });
    return;
  }

  if (pathname.startsWith("/preview/")) {
    response.statusCode = 403;
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.end("Preview capability required");
    return;
  }

  sendNotFound(response);
}

export async function startIsolatedPreviewServer(options: IsolatedPreviewServerOptions): Promise<IsolatedPreviewServer> {
  const studioUrl = new URL(options.studioOrigin);
  if (studioUrl.protocol !== "http:" && studioUrl.protocol !== "https:") {
    throw new Error("The isolated preview requires an HTTP(S) Studio origin.");
  }
  const studioOrigin = studioUrl.origin;
  const previewCapabilities = new Map<string, PreviewCapabilityEntry>();
  const server = createServer((request, response) => {
    void handlePreviewServerRequest(request, response, studioOrigin, previewCapabilities, options.repoRoot).catch(() => {
      if (!response.headersSent) {
        response.statusCode = 500;
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
      }
      response.end("Preview server error");
    });
  });

  server.listen({ host: "127.0.0.1", port: 0 });
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Could not determine the isolated preview server address.");
  }

  return {
    origin: `http://127.0.0.1:${address.port}`,
    studioOrigin,
    close: async () => {
      if (!server.listening) {
        return;
      }
      server.close();
      await once(server, "close");
    }
  };
}
