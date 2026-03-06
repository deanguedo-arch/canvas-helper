import path from "node:path";

import { getProjectPaths } from "../../../scripts/lib/paths.js";

import { isPathInside } from "./validation";

export function getPreviewPath(mode: "raw" | "workspace", slug: string, relativePath?: string) {
  const paths = getProjectPaths(slug);
  const baseDir = mode === "raw" ? paths.rawDir : paths.workspaceDir;
  const defaultFile = mode === "raw" ? "original.html" : "index.html";
  const requestedPath = relativePath ? decodeURIComponent(relativePath) : defaultFile;
  const resolvedPath = path.resolve(baseDir, requestedPath);

  if (!isPathInside(baseDir, resolvedPath)) {
    throw new Error("Preview request escaped the project directory.");
  }

  return resolvedPath;
}

export function getReferencePreviewPath(mode: "raw" | "extracted", slug: string, relativePath?: string) {
  const paths = getProjectPaths(slug);
  const baseDir = mode === "raw" ? paths.referencesRawDir : paths.referencesExtractedDir;
  const requestedPath = relativePath ? decodeURIComponent(relativePath) : "";

  if (!requestedPath) {
    throw new Error("Reference resource path is required.");
  }

  const resolvedPath = path.resolve(baseDir, requestedPath);

  if (!isPathInside(baseDir, resolvedPath)) {
    throw new Error("Reference preview request escaped the project directory.");
  }

  return resolvedPath;
}
