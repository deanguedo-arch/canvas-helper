import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { once } from "node:events";

import { buildPreviewBridgeRuntime } from "./preview-bridge-runtime";
import { handlePreviewRoutes } from "./routes/preview";

export type IsolatedPreviewServer = {
  origin: string;
  studioOrigin: string;
  close: () => Promise<void>;
};

export type IsolatedPreviewServerOptions = {
  studioOrigin: string;
};

function sendNotFound(response: ServerResponse) {
  response.statusCode = 404;
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.end("Not found");
}

function applyPreviewSecurityHeaders(response: ServerResponse, studioOrigin: string) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Security-Policy", `frame-ancestors ${studioOrigin}`);
  response.setHeader("Permissions-Policy", "display-capture=()");
  response.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-Content-Type-Options", "nosniff");
}

async function handlePreviewServerRequest(request: IncomingMessage, response: ServerResponse, studioOrigin: string) {
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

  if (pathname.startsWith("/preview/")) {
    await handlePreviewRoutes(pathname, request, response, {
      bridgeScriptPath: "/_canvas-helper/preview-bridge.js"
    });
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
  const server = createServer((request, response) => {
    void handlePreviewServerRequest(request, response, studioOrigin).catch(() => {
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
