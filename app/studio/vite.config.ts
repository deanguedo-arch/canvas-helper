import { readFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";

import react from "@vitejs/plugin-react";
import { lookup as lookupMimeType } from "mime-types";
import { defineConfig } from "vite";

import { fileExists, writeTextFile } from "../../scripts/lib/fs.js";
import { getProjectPaths, projectsRoot, repoRoot } from "../../scripts/lib/paths.js";
import { listStudioProjectBundles, readStudioProjectBundle } from "../../scripts/lib/projects.js";

type StudioCommandName = "analyze" | "refs" | "verify" | "export";

function resolveStudioCommandArgs(slug: string, commandName: string) {
  switch (commandName) {
    case "analyze":
      return ["run", "analyze", "--", "--project", slug];
    case "refs":
      return ["run", "refs", "--", "--project", slug];
    case "verify":
      return ["run", "verify", "--", "--project", slug, "--mode", "workspace"];
    case "export":
      return ["run", "export:brightspace", "--", "--project", slug];
    default:
      return null;
  }
}

function trimCommandOutput(value: string, maxChars = 12000) {
  if (value.length <= maxChars) {
    return value;
  }

  return `...<truncated>\n${value.slice(value.length - maxChars)}`;
}

async function runStudioCommand(slug: string, commandName: StudioCommandName) {
  const commandArgs = resolveStudioCommandArgs(slug, commandName);
  if (!commandArgs) {
    throw new Error(`Unsupported command: ${commandName}`);
  }

  const isWindows = process.platform === "win32";
  const npmCommand = isWindows ? "npm.cmd" : "npm";
  const spawnCommand = isWindows ? [npmCommand, ...commandArgs].join(" ") : npmCommand;
  const spawnArgs = isWindows ? [] : commandArgs;
  const startedAt = new Date().toISOString();

  return new Promise<{
    ok: boolean;
    command: StudioCommandName;
    slug: string;
    exitCode: number;
    startedAt: string;
    finishedAt: string;
    stdout: string;
    stderr: string;
  }>((resolve) => {
    const child = spawn(spawnCommand, spawnArgs, {
      cwd: repoRoot,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
      shell: isWindows
    });

    let stdout = "";
    let stderr = "";
    let done = false;

    const finish = (exitCode: number, extraError?: string) => {
      if (done) {
        return;
      }
      done = true;
      const combinedStderr = extraError ? `${stderr}\n${extraError}`.trim() : stderr.trim();
      resolve({
        ok: exitCode === 0,
        command: commandName,
        slug,
        exitCode,
        startedAt,
        finishedAt: new Date().toISOString(),
        stdout: trimCommandOutput(stdout.trim()),
        stderr: trimCommandOutput(combinedStderr)
      });
    };

    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", (error) => {
      finish(1, error instanceof Error ? error.message : String(error));
    });

    child.on("close", (code) => {
      finish(code ?? 1);
    });
  });
}

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

function isSafeProjectSlug(slug: string) {
  return /^[a-z0-9][a-z0-9._-]*$/i.test(slug);
}

async function readRequestBody(request: IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    if (typeof chunk === "string") {
      chunks.push(Buffer.from(chunk));
      continue;
    }

    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

async function readRequestJson<T>(request: IncomingMessage): Promise<T> {
  const body = await readRequestBody(request);
  if (!body.trim()) {
    return {} as T;
  }

  return JSON.parse(body) as T;
}

type SessionLogPayload = {
  savedAt?: string;
  sourcePath?: string;
  selectedMode?: "raw" | "workspace";
  compareMode?: boolean;
  sidebarOpen?: boolean;
  inspectorOpen?: boolean;
  devices?: {
    raw?: string;
    workspace?: string;
  };
  zooms?: {
    raw?: number;
    workspace?: number;
  };
  scrollTop?: {
    raw?: number | null;
    workspace?: number | null;
  };
  sourceFiles?: string[];
};

function formatSessionLogEntry(slug: string, payload: SessionLogPayload) {
  const savedAt = payload.savedAt && !Number.isNaN(Date.parse(payload.savedAt)) ? payload.savedAt : new Date().toISOString();
  const selectedMode = payload.selectedMode === "raw" ? "raw" : "workspace";
  const rawDevice = payload.devices?.raw ?? "unknown";
  const workspaceDevice = payload.devices?.workspace ?? "unknown";
  const rawZoom = typeof payload.zooms?.raw === "number" ? `${payload.zooms.raw}%` : "unknown";
  const workspaceZoom = typeof payload.zooms?.workspace === "number" ? `${payload.zooms.workspace}%` : "unknown";
  const rawScrollTop = typeof payload.scrollTop?.raw === "number" ? `${Math.round(payload.scrollTop.raw)}px` : "unknown";
  const workspaceScrollTop =
    typeof payload.scrollTop?.workspace === "number" ? `${Math.round(payload.scrollTop.workspace)}px` : "unknown";
  const sourceFiles = Array.isArray(payload.sourceFiles) ? payload.sourceFiles : [];
  const layoutLabel = payload.compareMode ? "split" : "focus";
  const sidebarLabel = payload.sidebarOpen ? "shown" : "hidden";
  const inspectorLabel = payload.inspectorOpen ? "shown" : "hidden";
  const sourcePath = payload.sourcePath ?? "unknown";

  const lines = [
    `## ${savedAt}`,
    `- Project: \`${slug}\``,
    `- Source Path: \`${sourcePath}\``,
    `- Active Mode: \`${selectedMode}\``,
    `- Layout: \`${layoutLabel}\``,
    `- Projects Rail: \`${sidebarLabel}\``,
    `- Details Rail: \`${inspectorLabel}\``,
    "",
    "### Pane Settings",
    `- Raw: device \`${rawDevice}\`, zoom \`${rawZoom}\`, scrollTop \`${rawScrollTop}\``,
    `- Workspace: device \`${workspaceDevice}\`, zoom \`${workspaceZoom}\`, scrollTop \`${workspaceScrollTop}\``,
    "",
    "### Source Files",
    ...(sourceFiles.length ? sourceFiles.map((filePath) => `- \`${filePath}\``) : ["- _No source files captured._"]),
    "",
    "### Resume",
    "- Start studio with `npm.cmd run studio -- --host 127.0.0.1 --port 5173`.",
    `- Open project \`${slug}\` and re-apply saved layout.`,
    "- Compare using Split view and Match buttons."
  ];

  return lines.join("\n");
}

async function appendSessionLog(slug: string, payload: SessionLogPayload) {
  const projectPaths = getProjectPaths(slug);
  const entry = formatSessionLogEntry(slug, payload);
  const existing = (await fileExists(projectPaths.sessionLogPath)) ? await readFile(projectPaths.sessionLogPath, "utf8") : "";
  const header = "# Studio Session Log\n\nSaved studio checkpoints for station handoff.\n";
  const nextContent = existing
    ? `${existing.trimEnd()}\n\n${entry}\n`
    : `${header}\n${entry}\n`;

  await writeTextFile(projectPaths.sessionLogPath, nextContent);

  return {
    path: projectPaths.sessionLogPath,
    savedAt: payload.savedAt && !Number.isNaN(Date.parse(payload.savedAt)) ? payload.savedAt : new Date().toISOString()
  };
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

        const sessionLogMatch = url.match(/^\/api\/projects\/([^/]+)\/session-log$/);
        if (sessionLogMatch) {
          if (request.method !== "POST") {
            sendJson(response, 405, {
              error: "Method not allowed."
            });
            return;
          }

          const slug = decodeURIComponent(sessionLogMatch[1]);
          if (!isSafeProjectSlug(slug)) {
            sendJson(response, 400, {
              error: "Invalid project slug."
            });
            return;
          }

          try {
            await readStudioProjectBundle(slug);
            const payload = await readRequestJson<SessionLogPayload>(request);
            const result = await appendSessionLog(slug, payload);
            sendJson(response, 200, {
              ok: true,
              path: result.path,
              savedAt: result.savedAt
            });
          } catch (error) {
            sendJson(response, 400, {
              error: error instanceof Error ? error.message : "Failed to save session log."
            });
          }
          return;
        }

        const commandMatch = url.match(/^\/api\/projects\/([^/]+)\/commands\/([^/]+)$/);
        if (commandMatch) {
          if (request.method !== "POST") {
            sendJson(response, 405, {
              error: "Method not allowed."
            });
            return;
          }

          const slug = decodeURIComponent(commandMatch[1]);
          const commandName = decodeURIComponent(commandMatch[2]) as StudioCommandName;

          if (!isSafeProjectSlug(slug)) {
            sendJson(response, 400, {
              error: "Invalid project slug."
            });
            return;
          }

          const commandArgs = resolveStudioCommandArgs(slug, commandName);
          if (!commandArgs) {
            sendJson(response, 400, {
              error: `Unsupported command: ${commandName}`
            });
            return;
          }

          try {
            await readStudioProjectBundle(slug);
            const result = await runStudioCommand(slug, commandName);
            const statusCode = result.ok ? 200 : 422;
            sendJson(response, statusCode, result);
          } catch (error) {
            sendJson(response, 400, {
              error: error instanceof Error ? error.message : "Failed to run project command."
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
