import path from "node:path";

import type { Plugin, ViteDevServer } from "vite";

import { projectsRoot } from "../../scripts/lib/paths.js";

import { handleCommandsRoute } from "./routes/commands";
import { handlePreviewRoutes } from "./routes/preview";
import { handleProjectsRoute } from "./routes/projects";
import { handleSessionLogRoute } from "./routes/session-log";

async function handleRequest(server: ViteDevServer, request: import("node:http").IncomingMessage, response: import("node:http").ServerResponse, next: () => void) {
  const url = request.url ? request.url.split("?")[0] : "";

  if (await handleProjectsRoute(url, request, response)) {
    return;
  }

  if (await handleSessionLogRoute(url, request, response)) {
    return;
  }

  if (await handleCommandsRoute(url, request, response)) {
    return;
  }

  if (await handlePreviewRoutes(url, request, response)) {
    return;
  }

  next();
}

export function createStudioServerPlugin(): Plugin {
  return {
    name: "studio-server",
    configureServer(server) {
      server.watcher.add(projectsRoot);
      server.watcher.on("all", (_eventName, changedPath) => {
        if (!changedPath.includes(`${path.sep}projects${path.sep}`)) {
          return;
        }

        const relativeToProjects = path.relative(projectsRoot, changedPath);
        const [slug, kind = "meta"] = relativeToProjects.split(path.sep);
        if (!slug) {
          return;
        }

        server.ws.send({
          type: "custom",
          event: "projects:changed",
          data: {
            slug,
            kind
          }
        });
      });

      server.middlewares.use((request, response, next) => {
        void handleRequest(server, request, response, next);
      });
    }
  };
}
