import { readFile } from "node:fs/promises";

import { fileExists, writeTextFile } from "../../../scripts/lib/fs.js";
import { getProjectPaths } from "../../../scripts/lib/paths.js";

import type { SessionLogPayload } from "./types";

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

export async function appendSessionLog(slug: string, payload: SessionLogPayload) {
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
