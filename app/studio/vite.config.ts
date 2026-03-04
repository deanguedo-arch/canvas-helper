import { readFile } from "node:fs/promises";
import type { ServerResponse } from "node:http";
import path from "node:path";

import react from "@vitejs/plugin-react";
import { lookup as lookupMimeType } from "mime-types";
import { defineConfig } from "vite";

import { fileExists } from "../../scripts/lib/fs.js";
import { getProjectPaths, projectsRoot, repoRoot } from "../../scripts/lib/paths.js";
import { listStudioProjectBundles, readStudioProjectBundle } from "../../scripts/lib/projects.js";

function resolveContentType(filePath: string) {
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

function sendJson(response: ServerResponse, statusCode: number, value: unknown) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.statusCode = statusCode;
  response.end(JSON.stringify(value, null, 2));
}

function getPreviewPath(mode: "raw" | "workspace", slug: string, relativePath?: string) {
  const paths = getProjectPaths(slug);
  const baseDir = mode === "raw" ? paths.rawDir : paths.workspaceDir;
  const defaultFile = mode === "raw" ? "original.html" : "index.html";
  const requestedPath = relativePath ? decodeURIComponent(relativePath) : defaultFile;
  const resolvedPath = path.resolve(baseDir, requestedPath);

  if (!resolvedPath.startsWith(baseDir)) {
    throw new Error("Preview request escaped the project directory.");
  }

  return resolvedPath;
}

function studioServerPlugin() {
  return {
    name: "studio-server",
    configureServer(server: import("vite").ViteDevServer) {
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

      server.middlewares.use(async (request, response, next) => {
        const url = request.url ? request.url.split("?")[0] : "";

        if (url === "/api/projects") {
          const bundles = await listStudioProjectBundles();
          sendJson(response, 200, bundles);
          return;
        }

        const projectMatch = url.match(/^\/api\/projects\/([^/]+)$/);
        if (projectMatch) {
          try {
            const bundle = await readStudioProjectBundle(projectMatch[1]);
            sendJson(response, 200, bundle);
          } catch (error) {
            sendJson(response, 404, {
              error: error instanceof Error ? error.message : "Project not found."
            });
          }
          return;
        }

        const previewMatch = url.match(/^\/preview\/(raw|workspace)\/([^/]+)(?:\/(.*))?$/);
        if (previewMatch) {
          try {
            const filePath = getPreviewPath(
              previewMatch[1] as "raw" | "workspace",
              previewMatch[2],
              previewMatch[3]
            );

            if (!(await fileExists(filePath))) {
              sendJson(response, 404, { error: `Preview file not found: ${filePath}` });
              return;
            }

            const body = await readFile(filePath);
            response.setHeader("Content-Type", resolveContentType(filePath));
            response.end(body);
          } catch (error) {
            sendJson(response, 403, {
              error: error instanceof Error ? error.message : "Invalid preview request."
            });
          }
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  root: path.join(repoRoot, "app", "studio"),
  plugins: [react(), studioServerPlugin()],
  server: {
    fs: {
      allow: [repoRoot]
    }
  },
  build: {
    outDir: path.join(repoRoot, "dist", "studio"),
    emptyOutDir: true
  }
});
