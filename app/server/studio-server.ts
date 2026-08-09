import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

import type { Plugin, ViteDevServer } from "vite";

import { startIsolatedPreviewServer, type IsolatedPreviewServer } from "./preview-server";
import { hasTrustedStudioMutationOrigin, isUnsafeStudioRequest } from "./lib/request-security";
import { sendJson } from "./lib/response";

type RouteHandler = (url: string, request: IncomingMessage, response: ServerResponse) => Promise<boolean>;

let projectsRouteHandler: RouteHandler | null = null;
let commandsRouteHandler: RouteHandler | null = null;
let sessionLogRouteHandler: RouteHandler | null = null;
let incomingRouteHandler: RouteHandler | null = null;
let assessmentsRouteHandler: RouteHandler | null = null;
let inspectionRouteHandler: RouteHandler | null = null;
let reviewScreenshotRouteHandler: RouteHandler | null = null;
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

  if (url === "/api/inspection/screenshots") {
    const handler = await getReviewScreenshotRouteHandler(server);
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
