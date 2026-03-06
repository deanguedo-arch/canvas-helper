import type { IncomingRefreshSummary, ProjectBundle } from "./types";

export async function fetchProjects() {
  const response = await fetch("/api/projects", {
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error("Failed to load projects.");
  }

  return (await response.json()) as ProjectBundle[];
}

export async function refreshIncomingIntake() {
  const response = await fetch("/api/incoming/refresh", {
    method: "POST"
  });
  const payload = (await response.json()) as IncomingRefreshSummary | { error: string };

  if (!response.ok) {
    throw new Error("error" in payload ? payload.error : "Failed to refresh incoming intake.");
  }

  return payload as IncomingRefreshSummary;
}

export function toCursorHref(filePath: string) {
  const normalizedPath = filePath.replace(/\\/g, "/");
  return `cursor://file/${encodeURI(normalizedPath)}`;
}
