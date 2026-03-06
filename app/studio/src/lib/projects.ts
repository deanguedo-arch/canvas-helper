import type { ProjectBundle } from "./types";

export async function fetchProjects() {
  const response = await fetch("/api/projects");
  if (!response.ok) {
    throw new Error("Failed to load projects.");
  }

  return (await response.json()) as ProjectBundle[];
}

export function toCursorHref(filePath: string) {
  const normalizedPath = filePath.replace(/\\/g, "/");
  return `cursor://file/${encodeURI(normalizedPath)}`;
}
