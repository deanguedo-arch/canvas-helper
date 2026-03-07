import { createWriteStream } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import os from "node:os";
import path from "node:path";
import { once } from "node:events";

import Busboy from "busboy";

import { readRequestJson } from "../lib/request-body";
import { sendJson } from "../lib/response";
import { isSafeProjectSlug } from "../lib/validation";
import {
  deleteAssessmentLibraryItem,
  exportAssessmentLibraryItemBrightspace,
  importAssessmentSources,
  listAssessmentLibrarySummaries,
  readAssessmentLibraryItem,
  saveAssessmentLibraryProject
} from "../../../scripts/lib/assessments/index.js";
import type { AssessmentProjectInput } from "../../../scripts/lib/assessments/index.js";

type UploadedFile = {
  fileName: string;
  tempPath: string;
};

async function parseMultipartUpload(request: IncomingMessage) {
  const contentType = request.headers["content-type"] ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    throw new Error("Expected multipart/form-data upload.");
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-assessment-upload-"));
  const fields = new Map<string, string>();
  const uploadedFiles: UploadedFile[] = [];
  const writes: Array<Promise<void>> = [];
  const busboy = Busboy({ headers: request.headers });

  busboy.on("field", (name, value) => {
    fields.set(name, value);
  });

  busboy.on("file", (_name, stream, info) => {
    const safeFileName = path.basename(info.filename || `upload-${Date.now().toString(36)}`);
    const tempPath = path.join(tempDir, `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}-${safeFileName}`);
    const writer = createWriteStream(tempPath);

    uploadedFiles.push({
      fileName: safeFileName,
      tempPath
    });

    writes.push(
      new Promise<void>((resolve, reject) => {
        writer.on("finish", () => resolve());
        writer.on("error", (error) => reject(error));
        stream.on("error", (error) => reject(error));
      })
    );

    stream.pipe(writer);
  });

  request.pipe(busboy);
  await once(busboy, "close");
  await Promise.all(writes);

  return {
    tempDir,
    fields,
    uploadedFiles
  };
}

export async function handleAssessmentsRoute(url: string, request: IncomingMessage, response: ServerResponse) {
  if (url === "/api/assessments") {
    if (request.method !== "GET") {
      sendJson(response, 405, { error: "Method not allowed." });
      return true;
    }

    try {
      const summaries = await listAssessmentLibrarySummaries();
      sendJson(response, 200, summaries);
    } catch (error) {
      sendJson(response, 500, {
        error: error instanceof Error ? error.message : "Failed to list assessments."
      });
    }
    return true;
  }

  if (url === "/api/assessments/import") {
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed." });
      return true;
    }

    let upload: Awaited<ReturnType<typeof parseMultipartUpload>> | null = null;
    try {
      upload = await parseMultipartUpload(request);
      if (upload.uploadedFiles.length === 0) {
        sendJson(response, 400, { error: "No files were uploaded." });
        return true;
      }

      const requestedSlug = upload.fields.get("slug")?.trim();
      const title = upload.fields.get("title")?.trim();
      if (requestedSlug && !isSafeProjectSlug(requestedSlug)) {
        sendJson(response, 400, { error: "Invalid assessment slug." });
        return true;
      }

      const item = await importAssessmentSources({
        inputPaths: upload.uploadedFiles.map((file) => file.tempPath),
        sourceFileNames: upload.uploadedFiles.map((file) => file.fileName),
        slug: requestedSlug || undefined,
        title: title || undefined
      });
      sendJson(response, 200, item);
    } catch (error) {
      sendJson(response, 400, {
        error: error instanceof Error ? error.message : "Failed to import assessment."
      });
    } finally {
      if (upload) {
        await rm(upload.tempDir, { recursive: true, force: true });
      }
    }

    return true;
  }

  const exportMatch = url.match(/^\/api\/assessments\/([^/]+)\/export\/brightspace$/);
  if (exportMatch) {
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed." });
      return true;
    }
    const slug = decodeURIComponent(exportMatch[1]);
    if (!isSafeProjectSlug(slug)) {
      sendJson(response, 400, { error: "Invalid assessment slug." });
      return true;
    }

    try {
      const result = await exportAssessmentLibraryItemBrightspace(slug);
      sendJson(response, result.status === "success" ? 200 : 422, result);
    } catch (error) {
      sendJson(response, 404, {
        error: error instanceof Error ? error.message : "Failed to export assessment."
      });
    }
    return true;
  }

  const slugMatch = url.match(/^\/api\/assessments\/([^/]+)$/);
  if (!slugMatch) {
    return false;
  }

  const slug = decodeURIComponent(slugMatch[1]);
  if (!isSafeProjectSlug(slug)) {
    sendJson(response, 400, { error: "Invalid assessment slug." });
    return true;
  }

  try {
    if (request.method === "GET") {
      sendJson(response, 200, await readAssessmentLibraryItem(slug));
      return true;
    }

    if (request.method === "PUT") {
      const body = await readRequestJson<{ project?: AssessmentProjectInput }>(request);
      if (!body.project) {
        sendJson(response, 400, { error: "Missing project payload." });
        return true;
      }

      sendJson(response, 200, await saveAssessmentLibraryProject(slug, body.project));
      return true;
    }

    if (request.method === "DELETE") {
      await deleteAssessmentLibraryItem(slug);
      sendJson(response, 200, { ok: true, slug });
      return true;
    }

    sendJson(response, 405, { error: "Method not allowed." });
    return true;
  } catch (error) {
    sendJson(response, 404, {
      error: error instanceof Error ? error.message : "Assessment route failed."
    });
    return true;
  }
}
