import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

import type { Plugin, ViteDevServer } from "vite";

import {
  PREVIEW_STANDALONE_REJOIN_PARAM,
  PREVIEW_STANDALONE_SESSION_PARAM
} from "../shared/preview-bridge.js";
import { isCapabilityWorkspacePreviewPath } from "../shared/preview-path.js";
import { buildPreviewBridgeRuntime } from "./preview-bridge-runtime";
import { startIsolatedPreviewServer, type IsolatedPreviewServer } from "./preview-server";
import { hasTrustedStudioMutationOrigin, isUnsafeStudioRequest } from "./lib/request-security";
import { sendJson } from "./lib/response";
import { buildStandalonePreviewHost } from "./standalone-preview-host";

type RouteHandler = (url: string, request: IncomingMessage, response: ServerResponse) => Promise<boolean>;

export function hasTrustedStandalonePreviewNavigation(request: IncomingMessage, studioOrigin: string) {
  if (
    request.headers["sec-fetch-site"] === "same-origin" &&
    request.headers["sec-fetch-mode"] === "navigate" &&
    request.headers["sec-fetch-dest"] === "document"
  ) {
    return true;
  }
  const referer = request.headers.referer;
  if (!referer) return false;
  try {
    return new URL(referer).origin === studioOrigin;
  } catch {
    return false;
  }
}

let projectsRouteHandler: RouteHandler | null = null;
let commandsRouteHandler: RouteHandler | null = null;
let sessionLogRouteHandler: RouteHandler | null = null;
let incomingRouteHandler: RouteHandler | null = null;
let assessmentsRouteHandler: RouteHandler | null = null;
let inspectionRouteHandler: RouteHandler | null = null;
let reviewScreenshotRouteHandler: RouteHandler | null = null;
let previewCaptureRouteHandler: RouteHandler | null = null;
let previewPreflightRouteHandler: RouteHandler | null = null;
let courseBuildBriefRouteHandler: RouteHandler | null = null;

async function loadRouteHandler(server: ViteDevServer, moduleName: string, exportName: string) {
  const routeModulePath = path.join(process.cwd(), "app", "server", "routes", `${moduleName}.ts`);
  const module = await server.ssrLoadModule(routeModulePath);
  const handler = module[exportName];
  if (typeof handler !== "function") {
    throw new Error(`Route export "${exportName}" was not found in ${moduleName}.`);
  }
  return handler as RouteHandler;
}

async function getProjectsRouteHandler(server: ViteDevServer) {
  if (!projectsRouteHandler) {
    projectsRouteHandler = await loadRouteHandler(server, "projects", "handleProjectsRoute");
  }
  return projectsRouteHandler;
}

async function getCommandsRouteHandler(server: ViteDevServer) {
  if (!commandsRouteHandler) {
    commandsRouteHandler = await loadRouteHandler(server, "commands", "handleCommandsRoute");
  }
  return commandsRouteHandler;
}

async function getSessionLogRouteHandler(server: ViteDevServer) {
  if (!sessionLogRouteHandler) {
    sessionLogRouteHandler = await loadRouteHandler(server, "session-log", "handleSessionLogRoute");
  }
  return sessionLogRouteHandler;
}

async function getIncomingRouteHandler(server: ViteDevServer) {
  if (!incomingRouteHandler) {
    incomingRouteHandler = await loadRouteHandler(server, "incoming", "handleIncomingRoute");
  }
  return incomingRouteHandler;
}

async function getAssessmentsRouteHandler(server: ViteDevServer) {
  if (!assessmentsRouteHandler) {
    assessmentsRouteHandler = await loadRouteHandler(server, "assessments", "handleAssessmentsRoute");
  }
  return assessmentsRouteHandler;
}

async function getInspectionRouteHandler(server: ViteDevServer) {
  if (!inspectionRouteHandler) {
    inspectionRouteHandler = await loadRouteHandler(server, "inspection", "handleInspectionRoute");
  }
  return inspectionRouteHandler;
}

async function getReviewScreenshotRouteHandler(server: ViteDevServer) {
  if (!reviewScreenshotRouteHandler) {
    reviewScreenshotRouteHandler = await loadRouteHandler(server, "review-screenshots", "handleReviewScreenshotRoute");
  }
  return reviewScreenshotRouteHandler;
}

async function getPreviewCaptureRouteHandler(server: ViteDevServer, previewOrigin: string) {
  if (!previewCaptureRouteHandler) {
    const routeModulePath = path.join(process.cwd(), "app", "server", "routes", "preview-capture.ts");
    const module = await server.ssrLoadModule(routeModulePath);
    if (typeof module.createPreviewCaptureRouteHandler !== "function") {
      throw new Error("Preview capture route factory was not found.");
    }
    previewCaptureRouteHandler = module.createPreviewCaptureRouteHandler({ previewOrigin }) as RouteHandler;
  }
  return previewCaptureRouteHandler;
}

async function getPreviewPreflightRouteHandler(server: ViteDevServer, previewOrigin: string) {
  if (!previewPreflightRouteHandler) {
    const routeModulePath = path.join(process.cwd(), "app", "server", "routes", "preview-preflight.ts");
    const module = await server.ssrLoadModule(routeModulePath);
    if (typeof module.createPreviewPreflightRouteHandler !== "function") {
      throw new Error("Preview preflight route factory was not found.");
    }
    previewPreflightRouteHandler = module.createPreviewPreflightRouteHandler({ previewOrigin }) as RouteHandler;
  }
  return previewPreflightRouteHandler;
}

async function getCourseBuildBriefRouteHandler(server: ViteDevServer) {
  if (!courseBuildBriefRouteHandler) {
    courseBuildBriefRouteHandler = await loadRouteHandler(server, "course-build-brief", "handleCourseBuildBriefRoute");
  }
  return courseBuildBriefRouteHandler;
}

async function handleRequest(
  server: ViteDevServer,
  request: IncomingMessage,
  response: ServerResponse,
  next: () => void,
  previewServer: IsolatedPreviewServer | null
) {
  const url = request.url ? request.url.split("?")[0] : "";
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Content-Security-Policy", "frame-ancestors 'none'");

  if (url === "/standalone-preview" || url === "/standalone-preview-bridge.js") {
    if (!previewServer) {
      sendJson(response, 503, { error: "Isolated preview server is starting." });
      return;
    }
    const method = (request.method || "GET").toUpperCase();
    if (method !== "GET" && method !== "HEAD") {
      response.statusCode = 405;
      response.setHeader("Allow", "GET, HEAD");
      response.end();
      return;
    }
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Permissions-Policy", "display-capture=()");
    response.setHeader("Referrer-Policy", url === "/standalone-preview" ? "origin" : "no-referrer");
    response.setHeader("X-Content-Type-Options", "nosniff");
    if (url === "/standalone-preview-bridge.js") {
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/javascript; charset=utf-8");
      response.end(method === "HEAD" ? undefined : buildPreviewBridgeRuntime(previewServer.studioOrigin, {
        hostPreviewOrigin: previewServer.origin
      }));
      return;
    }
    try {
      if (!hasTrustedStandalonePreviewNavigation(request, previewServer.studioOrigin)) {
        throw new Error("Standalone preview navigation did not originate from Studio.");
      }
      const hostUrl = new URL(request.url ?? url, previewServer.studioOrigin);
      const target = new URL(hostUrl.searchParams.get("target") ?? "");
      if (target.origin !== previewServer.origin || !isCapabilityWorkspacePreviewPath(target.pathname)) {
        throw new Error("Invalid standalone course preview target.");
      }
      target.searchParams.delete(PREVIEW_STANDALONE_SESSION_PARAM);
      target.searchParams.delete(PREVIEW_STANDALONE_REJOIN_PARAM);
      target.searchParams.delete("canvas-helper-capture");
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/html; charset=utf-8");
      response.setHeader(
        "Content-Security-Policy",
        `default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; frame-src ${previewServer.origin}; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'`
      );
      response.end(method === "HEAD" ? undefined : buildStandalonePreviewHost(target.toString()));
    } catch {
      sendJson(response, 400, { error: "Invalid standalone course preview target." });
    }
    return;
  }

  if (url === "/api/preview-config") {
    if (!previewServer) {
      sendJson(response, 503, { error: "Isolated preview server is starting." });
      return;
    }
    sendJson(response, 200, { origin: previewServer.origin, studioOrigin: previewServer.studioOrigin });
    return;
  }

  if (url.startsWith("/api/") && isUnsafeStudioRequest(request) && !hasTrustedStudioMutationOrigin(request)) {
    sendJson(response, 403, { error: "Studio mutations require an exact same-origin request." });
    return;
  }

  if (url.startsWith("/api/projects/")) {
    const commandsHandler = await getCommandsRouteHandler(server);
    if (await commandsHandler(url, request, response)) {
      return;
    }

    const sessionHandler = await getSessionLogRouteHandler(server);
    if (await sessionHandler(url, request, response)) {
      return;
    }

    const courseBuildBriefHandler = await getCourseBuildBriefRouteHandler(server);
    if (await courseBuildBriefHandler(url, request, response)) {
      return;
    }
  }

  if (url === "/api/projects" || /^\/api\/projects\/[^/]+(?:\/course-outline)?$/.test(url)) {
    const projectsHandler = await getProjectsRouteHandler(server);
    if (await projectsHandler(url, request, response)) {
      return;
    }
  }

  if (url.startsWith("/api/assessments")) {
    const handler = await getAssessmentsRouteHandler(server);
    if (await handler(url, request, response)) {
      return;
    }
  }

  if (url === "/api/inspection/resolve") {
    const handler = await getInspectionRouteHandler(server);
    if (await handler(url, request, response)) {
      return;
    }
  }

  if (url === "/api/inspection/screenshots" || url === "/api/inspection/screenshots/verify") {
    const handler = await getReviewScreenshotRouteHandler(server);
    if (await handler(url, request, response)) {
      return;
    }
  }

  if (url === "/api/inspection/capture") {
    if (!previewServer) {
      sendJson(response, 503, { error: "Isolated preview server is starting." });
      return;
    }
    const handler = await getPreviewCaptureRouteHandler(server, previewServer.origin);
    if (await handler(url, request, response)) {
      return;
    }
  }

  if (url === "/api/preview/preflight") {
    if (!previewServer) {
      sendJson(response, 503, { error: "Isolated preview server is starting." });
      return;
    }
    const handler = await getPreviewPreflightRouteHandler(server, previewServer.origin);
    if (await handler(url, request, response)) {
      return;
    }
  }

  if (url === "/api/incoming/refresh") {
    const handler = await getIncomingRouteHandler(server);
    if (await handler(url, request, response)) {
      return;
    }
  }

  next();
}

export function createStudioServerPlugin(): Plugin {
  let isolatedPreviewServer: IsolatedPreviewServer | null = null;
  let previewStartup: Promise<IsolatedPreviewServer> | null = null;

  function getPinnedStudioOrigin(server: ViteDevServer) {
    const address = server.httpServer?.address();
    if (!address || typeof address === "string") {
      return null;
    }
    return `http://127.0.0.1:${address.port}`;
  }

  function ensurePreviewServer(server: ViteDevServer) {
    if (!previewStartup) {
      const studioOrigin = getPinnedStudioOrigin(server);
      if (!studioOrigin) {
        return null;
      }
      previewStartup = startIsolatedPreviewServer({ studioOrigin }).then((previewServer) => {
        isolatedPreviewServer = previewServer;
        return previewServer;
      });
    }
    return previewStartup;
  }

  return {
    name: "studio-server",
    configureServer(server) {
      const startPreviewServer = () => {
        const startup = ensurePreviewServer(server);
        if (startup) {
          void startup.catch(() => undefined);
        }
      };
      if (server.httpServer?.listening) {
        startPreviewServer();
      } else {
        server.httpServer?.once("listening", startPreviewServer);
      }
      server.httpServer?.once("close", () => {
        if (isolatedPreviewServer) {
          void isolatedPreviewServer.close().catch(() => undefined);
        }
      });
      server.middlewares.use((request, response, next) => {
        startPreviewServer();
        void handleRequest(server, request, response, next, isolatedPreviewServer);
      });
    }
  };
}
