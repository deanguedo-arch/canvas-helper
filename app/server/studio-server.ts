import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

import type { Plugin, ViteDevServer } from "vite";

type RouteHandler = (url: string, request: IncomingMessage, response: ServerResponse) => Promise<boolean>;

let projectsRouteHandler: RouteHandler | null = null;
let commandsRouteHandler: RouteHandler | null = null;
let sessionLogRouteHandler: RouteHandler | null = null;
let incomingRouteHandler: RouteHandler | null = null;
let assessmentsRouteHandler: RouteHandler | null = null;
let previewRouteHandler: RouteHandler | null = null;
let generateRouteHandler: RouteHandler | null = null;

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

async function getPreviewRouteHandler(server: ViteDevServer) {
  if (!previewRouteHandler) {
    previewRouteHandler = await loadRouteHandler(server, "preview", "handlePreviewRoutes");
  }
  return previewRouteHandler;
}

async function getGenerateRouteHandler(server: ViteDevServer) {
  if (!generateRouteHandler) {
    generateRouteHandler = await loadRouteHandler(server, "generate", "handleGenerateRoute");
  }
  return generateRouteHandler;
}

async function handleRequest(server: ViteDevServer, request: IncomingMessage, response: ServerResponse, next: () => void) {
  const url = request.url ? request.url.split("?")[0] : "";

  if (url === "/api/generate") {
    const handler = await getGenerateRouteHandler(server);
    if (await handler(url, request, response)) {
      return;
    }
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

  if (url === "/api/incoming/refresh") {
    const handler = await getIncomingRouteHandler(server);
    if (await handler(url, request, response)) {
      return;
    }
  }

  if (url.startsWith("/preview/")) {
    const handler = await getPreviewRouteHandler(server);
    if (await handler(url, request, response)) {
      return;
    }
  }

  next();
}

export function createStudioServerPlugin(): Plugin {
  return {
    name: "studio-server",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        void handleRequest(server, request, response, next);
      });
    }
  };
}
