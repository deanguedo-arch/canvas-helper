import type {
  AssessmentExportResult,
  AssessmentLibraryItem,
  AssessmentLibrarySummary,
  AssessmentProject
} from "./assessment-types";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T | { error?: string };
  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : `Request failed (${response.status}).`;
    throw new Error(message);
  }
  return payload as T;
}

export async function fetchAssessmentSummaries() {
  const response = await fetch("/api/assessments", { method: "GET" });
  return parseJsonResponse<AssessmentLibrarySummary[]>(response);
}

export async function fetchAssessmentItem(slug: string) {
  const response = await fetch(`/api/assessments/${encodeURIComponent(slug)}`, { method: "GET" });
  return parseJsonResponse<AssessmentLibraryItem>(response);
}

export async function importAssessmentFiles(files: FileList | File[], options: { slug?: string; title?: string } = {}) {
  const formData = new FormData();
  for (const file of Array.from(files)) {
    formData.append("files", file);
  }

  if (options.slug) {
    formData.append("slug", options.slug);
  }
  if (options.title) {
    formData.append("title", options.title);
  }

  const response = await fetch("/api/assessments/import", {
    method: "POST",
    body: formData
  });
  return parseJsonResponse<AssessmentLibraryItem>(response);
}

export async function saveAssessmentProject(slug: string, project: AssessmentProject) {
  const response = await fetch(`/api/assessments/${encodeURIComponent(slug)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ project })
  });
  return parseJsonResponse<AssessmentLibraryItem>(response);
}

export async function deleteAssessmentProject(slug: string) {
  const response = await fetch(`/api/assessments/${encodeURIComponent(slug)}`, {
    method: "DELETE"
  });
  return parseJsonResponse<{ ok: boolean; slug: string }>(response);
}

export async function exportAssessmentProject(slug: string) {
  const response = await fetch(`/api/assessments/${encodeURIComponent(slug)}/export/brightspace`, {
    method: "POST"
  });
  return parseJsonResponse<AssessmentExportResult>(response);
}
