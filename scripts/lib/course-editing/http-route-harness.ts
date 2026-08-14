import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { once } from "node:events";

import type {
  CourseEditApplyRequest,
  CourseEditBatchResult,
  CourseEditPatch,
  CourseEditPreviewNormalizeResult,
  CourseEditResolveRequest,
  CourseEditStatus,
  CourseEditTarget,
  CourseEditTargetIdentity
} from "../../../app/shared/course-editing.js";
import { COURSE_EDIT_PREVIEW_SCHEMA_VERSION } from "../../../app/shared/course-editing.js";
import { handleCourseEditsRoute } from "../../../app/server/routes/course-edits.js";

async function responseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  let value: unknown;
  try {
    value = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Course edit HTTP route returned non-JSON status ${response.status}: ${text.slice(0, 400)}`);
  }
  if (!response.ok) {
    const message = value && typeof value === "object" && "error" in value ? String(value.error) : `HTTP ${response.status}`;
    throw new Error(message);
  }
  return value as T;
}

export async function startCourseEditHttpRouteHarness(repoRoot: string) {
  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
    void handleCourseEditsRoute(pathname, request, response, { repoRoot }).then((handled) => {
      if (!handled && !response.writableEnded) {
        response.statusCode = 404;
        response.end(JSON.stringify({ error: "Not found." }));
      }
    }).catch((error) => {
      response.statusCode = 500;
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
    });
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Course edit HTTP harness did not bind a loopback port.");
  const origin = `http://127.0.0.1:${address.port}`;
  let closePromise: Promise<void> | null = null;

  const post = async <T>(pathname: string, body?: unknown) => responseJson<T>(await fetch(`${origin}${pathname}`, {
    method: "POST",
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body)
  }));
  const get = async <T>(pathname: string) => responseJson<T>(await fetch(`${origin}${pathname}`));

  return {
    origin,
    resolve(request: CourseEditResolveRequest) {
      return post<CourseEditTarget>("/api/course-edits/resolve", request);
    },
    normalize(identity: CourseEditTargetIdentity, patch: CourseEditPatch) {
      const previewSessionId = randomUUID();
      const encodedPath = identity.htmlPath.split("/").map(encodeURIComponent).join("/");
      return post<CourseEditPreviewNormalizeResult>("/api/course-edits/preview/normalize", {
        schemaVersion: COURSE_EDIT_PREVIEW_SCHEMA_VERSION,
        previewSessionId,
        revision: 1,
        projectSlug: identity.projectSlug,
        pageIdentity: `http://127.0.0.1:5173/_canvas-helper/p/${previewSessionId}/preview/workspace/${encodeURIComponent(identity.projectSlug)}/${encodedPath}`,
        mapSourceDigest: identity.sourceDigest,
        targetNodeId: identity.nodeId,
        identity,
        patch
      });
    },
    status(projectSlug: string) {
      return get<CourseEditStatus>(`/api/projects/${encodeURIComponent(projectSlug)}/course-edits/status`);
    },
    apply(request: CourseEditApplyRequest) {
      return post<CourseEditBatchResult>(
        `/api/projects/${encodeURIComponent(request.projectSlug)}/course-edits/apply`,
        request
      );
    },
    undo(projectSlug: string) {
      return post<CourseEditBatchResult>(`/api/projects/${encodeURIComponent(projectSlug)}/course-edits/undo`);
    },
    async close() {
      closePromise ??= new Promise<void>((resolve, reject) => {
        if (!server.listening) {
          resolve();
          return;
        }
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      await closePromise;
    }
  };
}

export type CourseEditHttpRouteHarness = Awaited<ReturnType<typeof startCourseEditHttpRouteHarness>>;
