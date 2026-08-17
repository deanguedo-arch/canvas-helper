import {
  COURSE_EDIT_PREVIEW_SCHEMA_VERSION,
  type CourseEditPreviewBinding,
  type CourseEditPreviewClearRequest,
  type CourseEditPreviewNormalizeRequest,
  type CourseEditPreviewNormalizeResult
} from "../../shared/course-editing.js";
import { normalizePreviewPageIdentity, parsePreviewCapabilityPath } from "../../shared/preview-path.js";
import {
  bindPendingCourseEditImage,
  clearPendingCourseEditImagesForSession,
  type PendingCourseEditImageBinding
} from "./course-edit-preview-assets";
import { normalizeCourseEditPatchForPreview } from "./course-editing";

const PREVIEW_SESSION_TTL_MS = 30 * 60 * 1_000;
const PREVIEW_SESSION_MAX_ENTRIES = 256;

type PreviewSession = CourseEditPreviewBinding & {
  lastRevision: number;
  lastUsedAt: number;
  closed: boolean;
};

const previewSessions = new Map<string, PreviewSession>();
const previewSessionQueues = new Map<string, Promise<void>>();

function retirePreviewSessions(now = Date.now()) {
  for (const [id, session] of previewSessions) {
    if (session.lastUsedAt > now || now - session.lastUsedAt > PREVIEW_SESSION_TTL_MS) {
      previewSessions.delete(id);
      clearPendingCourseEditImagesForSession(id);
    }
  }
}

function sameBinding(left: CourseEditPreviewBinding, right: CourseEditPreviewBinding) {
  return (
    left.projectSlug === right.projectSlug &&
    left.pageIdentity === right.pageIdentity &&
    left.mapSourceDigest === right.mapSourceDigest &&
    left.targetNodeId === right.targetNodeId
  );
}

function validatePageBinding(binding: CourseEditPreviewBinding, htmlPath?: string) {
  const normalized = normalizePreviewPageIdentity(binding.pageIdentity);
  if (!normalized || normalized !== binding.pageIdentity) {
    throw new Error("The live preview page identity is invalid or stale.");
  }
  const url = new URL(normalized);
  const capability = parsePreviewCapabilityPath(url.pathname);
  if (!capability || capability.scope !== `project:workspace:${binding.projectSlug}`) {
    throw new Error("The live preview does not belong to this course workspace.");
  }
  if (htmlPath !== undefined) {
    const expectedPrefix = `/preview/workspace/${encodeURIComponent(binding.projectSlug)}/`;
    if (!capability.previewPath.startsWith(expectedPrefix)) {
      throw new Error("The live preview page does not match this edit target.");
    }
    let decoded = "";
    try {
      decoded = capability.previewPath.slice(expectedPrefix.length).split("/").map(decodeURIComponent).join("/");
    } catch {
      throw new Error("The live preview page path is invalid.");
    }
    if (decoded !== htmlPath) throw new Error("The live preview page changed. Select the element again.");
  }
}

async function withPreviewSession<T>(sessionId: string, task: () => Promise<T>) {
  const previous = previewSessionQueues.get(sessionId) ?? Promise.resolve();
  let release!: () => void;
  const next = new Promise<void>((resolve) => { release = resolve; });
  const queued = previous.then(() => next);
  previewSessionQueues.set(sessionId, queued);
  await previous;
  try {
    return await task();
  } finally {
    release();
    if (previewSessionQueues.get(sessionId) === queued) previewSessionQueues.delete(sessionId);
  }
}

function requireNextRevision(binding: CourseEditPreviewBinding) {
  retirePreviewSessions();
  const existing = previewSessions.get(binding.previewSessionId);
  if (existing) {
    if (!sameBinding(existing, binding)) throw new Error("This live preview session is bound to a different course element.");
    if (existing.closed) throw new Error("This live preview session is closed. Select the element again.");
    if (binding.revision <= existing.lastRevision) throw new Error("A newer live preview revision already exists.");
    return existing;
  }
  if (previewSessions.size >= PREVIEW_SESSION_MAX_ENTRIES) {
    const oldest = [...previewSessions.entries()].sort((left, right) => left[1].lastUsedAt - right[1].lastUsedAt)[0];
    if (oldest) {
      previewSessions.delete(oldest[0]);
      clearPendingCourseEditImagesForSession(oldest[0]);
    }
  }
  return null;
}

function recordRevision(binding: CourseEditPreviewBinding, closed: boolean) {
  previewSessions.set(binding.previewSessionId, {
    ...binding,
    lastRevision: binding.revision,
    lastUsedAt: Date.now(),
    closed
  });
}

function pendingImageBinding(request: CourseEditPreviewNormalizeRequest): PendingCourseEditImageBinding {
  return {
    projectSlug: request.projectSlug,
    htmlPath: request.identity.htmlPath,
    targetId: request.identity.targetId,
    sourceDigest: request.mapSourceDigest,
    targetNodeId: request.targetNodeId,
    previewSessionId: request.previewSessionId,
    pageIdentity: request.pageIdentity
  };
}

export async function normalizeCourseEditPreview(
  request: CourseEditPreviewNormalizeRequest,
  repoRoot?: string
): Promise<CourseEditPreviewNormalizeResult> {
  return await withPreviewSession(request.previewSessionId, async () => {
    validatePageBinding(request, request.identity.htmlPath);
    requireNextRevision(request);
    const pendingAssets = request.pendingAssets ?? [];
    let representationSrc: string | undefined;
    if (pendingAssets.length) {
      const pending = bindPendingCourseEditImage(pendingAssets[0], pendingImageBinding(request));
      representationSrc = `${pending.previewOrigin}${pending.publicPrefix}/edit-images/${pending.id}`;
    }
    const normalized = await normalizeCourseEditPatchForPreview({
      identity: request.identity,
      patch: request.patch,
      pendingAssets,
      representationSrc,
      repoRoot
    });
    // A lower revision can finish after a faster higher revision only if a
    // caller bypassed the per-session queue. Recheck immediately before the
    // result becomes authoritative so the protocol still fails closed.
    requireNextRevision(request);
    recordRevision(request, false);
    return {
      schemaVersion: COURSE_EDIT_PREVIEW_SCHEMA_VERSION,
      previewSessionId: request.previewSessionId,
      revision: request.revision,
      projectSlug: request.projectSlug,
      pageIdentity: request.pageIdentity,
      mapSourceDigest: request.mapSourceDigest,
      targetNodeId: request.targetNodeId,
      canonicalPatch: normalized.canonicalPatch,
      canonicalPatchDigest: normalized.canonicalPatchDigest,
      pendingAssets,
      representation: normalized.representation,
      changed: true
    };
  });
}

export async function clearCourseEditPreview(request: CourseEditPreviewClearRequest) {
  return await withPreviewSession(request.previewSessionId, async () => {
    validatePageBinding(request);
    const existing = previewSessions.get(request.previewSessionId);
    if (existing) {
      if (!sameBinding(existing, request)) throw new Error("This live preview clear request belongs to a different course element.");
      if (request.revision <= existing.lastRevision) throw new Error("A newer live preview revision already exists.");
    }
    recordRevision(request, true);
    const removedImages = clearPendingCourseEditImagesForSession(
      request.previewSessionId,
      request.retainPendingAssetIds ?? []
    );
    return { ok: true as const, revision: request.revision, removedImages };
  });
}

export function courseEditPreviewSessionStateForTests() {
  retirePreviewSessions();
  return [...previewSessions.values()].map((session) => ({ ...session }));
}
