import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  COURSE_EDIT_MAX_DRAFTS,
  COURSE_EDIT_PREVIEW_SCHEMA_VERSION,
  COURSE_EDIT_SCHEMA_VERSION,
  isCourseEditDraft,
  type CourseEditBatchResult,
  type CourseEditDraft,
  type CourseEditPendingAssetReference,
  type CourseEditPendingImage,
  type CourseEditPatch,
  type CourseEditPreviewNormalizeRequest,
  type CourseEditPreviewNormalizeResult,
  type CourseEditResolveRequest,
  type CourseEditStatus,
  type CourseEditTarget
} from "../../../shared/course-editing.js";
import type { PreviewCourseEditAck, PreviewCourseEditCommand } from "../../../shared/preview-bridge.js";
import { normalizePreviewPageIdentity } from "../../../shared/preview-path.js";
import {
  exportCourseEditDrafts,
  importCourseEditDrafts,
  loadCourseEditDraftState,
  loadCourseEditDrafts,
  saveCourseEditDrafts
} from "../lib/course-edit-storage";

type CourseEditFeedbackTone = "neutral" | "progress" | "success" | "warning" | "error";

type LivePreviewContext = {
  previewSessionId: string;
  revision: number;
  identity: NonNullable<CourseEditTarget["identity"]>;
  pageIdentity: string;
  command: PreviewCourseEditCommand | null;
  lastNormalized: CourseEditPreviewNormalizeResult | null;
  requestedAt: number;
};

const EMPTY_STATUS: CourseEditStatus = {
  projectSlug: "",
  available: false,
  unavailableReason: "Select a course to start editing.",
  courseTitle: "",
  canRenameCourse: false,
  canUploadImages: false,
  canUndo: false,
  undoUnavailableReason: "There is no applied Studio edit batch to undo.",
  checkpointId: null,
  exportsOutOfDate: false,
  staleExportTargets: [],
  lastAppliedAt: null
};

function draftId() {
  if (typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
  return `edit-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function previewSessionId() {
  if (typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
  return Array.from(window.crypto.getRandomValues(new Uint32Array(4)), (value) => value.toString(16).padStart(8, "0")).join("");
}

async function responseJson<T>(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || fallback);
  return payload;
}

export function courseEditPatchText(target: CourseEditTarget, patch: CourseEditPatch) {
  if (patch.html !== undefined) {
    const document = new DOMParser().parseFromString(`<body>${patch.html}</body>`, "text/html");
    return document.body.textContent?.replace(/\s+/g, " ").trim() ?? "";
  }
  if (target.capabilities.image) return patch.alt ?? target.attributes.alt ?? "Image";
  if (target.capabilities.link && patch.href !== undefined) return patch.href || target.originalText;
  return target.originalText;
}

export function useCourseEditing(projectSlug: string, onApplied: () => void | Promise<void>) {
  const [enabled, setEnabled] = useState(false);
  const [target, setTarget] = useState<CourseEditTarget | null>(null);
  const [resolving, setResolving] = useState(false);
  const [drafts, setDrafts] = useState<CourseEditDraft[]>(() => loadCourseEditDraftState(projectSlug).drafts);
  const [status, setStatus] = useState<CourseEditStatus>({ ...EMPTY_STATUS, projectSlug });
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; tone: CourseEditFeedbackTone }>({ message: "", tone: "neutral" });
  const [previewCommand, setPreviewCommand] = useState<PreviewCourseEditCommand | null>(null);
  const [previewFeedback, setPreviewFeedback] = useState<{ message: string; tone: CourseEditFeedbackTone; latencyMs: number | null }>({
    message: "",
    tone: "neutral",
    latencyMs: null
  });
  const resolveAbortRef = useRef<AbortController | null>(null);
  const previewAbortRef = useRef<AbortController | null>(null);
  const previewContextRef = useRef<LivePreviewContext | null>(null);
  const resolvedPageIdentityRef = useRef("");
  const activeProjectRef = useRef(projectSlug);
  const operationRef = useRef(0);
  const draftsRef = useRef(drafts);
  draftsRef.current = drafts;

  const replaceDrafts = useCallback((next: CourseEditDraft[]) => {
    const bounded = next.filter(isCourseEditDraft).slice(0, COURSE_EDIT_MAX_DRAFTS);
    draftsRef.current = bounded;
    setDrafts(bounded);
    const stored = saveCourseEditDrafts(activeProjectRef.current, bounded);
    if (!stored && bounded.length) setFeedback({ message: "Drafts are available in this tab, but browser storage is unavailable.", tone: "warning" });
  }, []);

  const closeLivePreview = useCallback((
    message = "",
    retainPendingAssets: readonly CourseEditPendingAssetReference[] = []
  ) => {
    previewAbortRef.current?.abort();
    previewAbortRef.current = null;
    const context = previewContextRef.current;
    previewContextRef.current = null;
    if (!context) {
      setPreviewCommand(null);
      if (message) setPreviewFeedback({ message, tone: "neutral", latencyMs: null });
      return;
    }
    const revision = context.revision + 1;
    const digest = context.command?.canonicalPatchDigest ?? context.lastNormalized?.canonicalPatchDigest;
    if (digest) {
      const command: PreviewCourseEditCommand = {
        action: "clear",
        previewSessionId: context.previewSessionId,
        revision,
        projectSlug: context.identity.projectSlug,
        pageIdentity: context.pageIdentity,
        mapSourceDigest: context.identity.sourceDigest,
        targetNodeId: context.identity.nodeId,
        canonicalPatchDigest: digest,
        representation: null
      };
      setPreviewCommand(command);
      void fetch("/api/course-edits/preview/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemaVersion: COURSE_EDIT_PREVIEW_SCHEMA_VERSION,
          previewSessionId: command.previewSessionId,
          revision: command.revision,
          projectSlug: command.projectSlug,
          pageIdentity: command.pageIdentity,
          mapSourceDigest: command.mapSourceDigest,
          targetNodeId: command.targetNodeId,
          ...(retainPendingAssets.length
            ? { retainPendingAssetIds: retainPendingAssets.map((entry) => entry.id) }
            : {})
        })
      }).catch(() => undefined);
    } else {
      setPreviewCommand(null);
    }
    setPreviewFeedback({ message, tone: "neutral", latencyMs: null });
  }, []);

  const previewContextFor = useCallback((current: CourseEditTarget) => {
    if (!current.identity || current.eligibility !== "editable") return null;
    const pageIdentity = resolvedPageIdentityRef.current;
    if (!pageIdentity) return null;
    const existing = previewContextRef.current;
    if (
      existing &&
      existing.identity.targetId === current.identity.targetId &&
      existing.pageIdentity === pageIdentity
    ) return existing;
    if (existing) closeLivePreview();
    const created: LivePreviewContext = {
      previewSessionId: previewSessionId(),
      revision: 0,
      identity: current.identity,
      pageIdentity,
      command: null,
      lastNormalized: null,
      requestedAt: 0
    };
    previewContextRef.current = created;
    return created;
  }, [closeLivePreview]);

  const refreshStatus = useCallback(async (slug = activeProjectRef.current) => {
    if (!slug) {
      setStatus({ ...EMPTY_STATUS, projectSlug: "" });
      return;
    }
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(slug)}/course-edits/status`);
      const payload = await responseJson<CourseEditStatus>(response, "Studio could not load edit status.");
      if (activeProjectRef.current === slug) setStatus(payload);
    } catch (error) {
      if (activeProjectRef.current === slug) {
        setFeedback({ message: error instanceof Error ? error.message : "Studio could not load edit status.", tone: "warning" });
      }
    }
  }, []);

  useEffect(() => {
    resolveAbortRef.current?.abort();
    closeLivePreview();
    resolvedPageIdentityRef.current = "";
    activeProjectRef.current = projectSlug;
    operationRef.current += 1;
    setEnabled(false);
    setTarget(null);
    setResolving(false);
    setBusy(false);
    const loaded = loadCourseEditDraftState(projectSlug);
    const stored = loaded.drafts;
    draftsRef.current = stored;
    setDrafts(stored);
    setStatus({ ...EMPTY_STATUS, projectSlug });
    const restored = stored.length ? `${stored.length} draft ${stored.length === 1 ? "change" : "changes"} restored for this course.` : "";
    setFeedback({
      message: loaded.warnings[0] ?? restored,
      tone: loaded.warnings.length ? "warning" : stored.length ? "success" : "neutral"
    });
    void refreshStatus(projectSlug);
  }, [closeLivePreview, projectSlug, refreshStatus]);

  useEffect(() => () => {
    resolveAbortRef.current?.abort();
    previewAbortRef.current?.abort();
  }, []);

  const resolveSelection = useCallback(async (request: CourseEditResolveRequest) => {
    const slug = activeProjectRef.current;
    if (!slug || request.projectSlug !== slug) return null;
    resolveAbortRef.current?.abort();
    closeLivePreview();
    resolvedPageIdentityRef.current = normalizePreviewPageIdentity(request.selection.pageHref) ?? "";
    const controller = new AbortController();
    resolveAbortRef.current = controller;
    setResolving(true);
    setTarget(null);
    setFeedback({ message: "Checking this course element…", tone: "progress" });
    try {
      const response = await fetch("/api/course-edits/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: controller.signal
      });
      const payload = await responseJson<CourseEditTarget>(response, "Studio could not check this course element.");
      if (controller.signal.aborted || activeProjectRef.current !== slug) return null;
      setTarget(payload);
      setFeedback({ message: payload.reason, tone: payload.eligibility === "editable" ? "success" : "warning" });
      return payload;
    } catch (error) {
      if (controller.signal.aborted) return null;
      setFeedback({ message: error instanceof Error ? error.message : "Studio could not check this course element.", tone: "error" });
      return null;
    } finally {
      if (resolveAbortRef.current === controller) {
        resolveAbortRef.current = null;
        setResolving(false);
      }
    }
  }, [closeLivePreview]);

  const normalizeLivePreview = useCallback(async (
    patch: CourseEditPatch,
    pendingAssets: readonly CourseEditPendingAssetReference[] = []
  ) => {
    const current = target;
    if (!current?.identity || current.eligibility !== "editable") return null;
    const context = previewContextFor(current);
    if (!context) {
      setPreviewFeedback({ message: "The learner preview changed. Select this element again.", tone: "warning", latencyMs: null });
      return null;
    }
    previewAbortRef.current?.abort();
    const controller = new AbortController();
    previewAbortRef.current = controller;
    const revision = context.revision + 1;
    context.revision = revision;
    context.requestedAt = Date.now();
    const request: CourseEditPreviewNormalizeRequest = {
      schemaVersion: COURSE_EDIT_PREVIEW_SCHEMA_VERSION,
      previewSessionId: context.previewSessionId,
      revision,
      projectSlug: context.identity.projectSlug,
      pageIdentity: context.pageIdentity,
      mapSourceDigest: context.identity.sourceDigest,
      targetNodeId: context.identity.nodeId,
      identity: context.identity,
      patch,
      ...(pendingAssets.length ? { pendingAssets: [...pendingAssets] } : {})
    };
    setPreviewFeedback({ message: "Checking the live learner preview…", tone: "progress", latencyMs: null });
    try {
      const response = await fetch("/api/course-edits/preview/normalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: controller.signal
      });
      const normalized = await responseJson<CourseEditPreviewNormalizeResult>(response, "Studio could not normalize this live preview.");
      if (
        controller.signal.aborted ||
        previewContextRef.current !== context ||
        context.revision !== revision
      ) return null;
      context.lastNormalized = normalized;
      const command: PreviewCourseEditCommand = {
        action: "render",
        previewSessionId: normalized.previewSessionId,
        revision: normalized.revision,
        projectSlug: normalized.projectSlug,
        pageIdentity: normalized.pageIdentity,
        mapSourceDigest: normalized.mapSourceDigest,
        targetNodeId: normalized.targetNodeId,
        canonicalPatchDigest: normalized.canonicalPatchDigest,
        representation: normalized.representation
      };
      context.command = command;
      setPreviewCommand(command);
      setPreviewFeedback({ message: "Updating the learner-page preview…", tone: "progress", latencyMs: null });
      return normalized;
    } catch (error) {
      if (controller.signal.aborted) return null;
      if (previewContextRef.current === context && context.revision === revision) {
        const message = error instanceof Error ? error.message : "Studio could not normalize this live preview.";
        closeLivePreview(message);
        setPreviewFeedback({ message, tone: "error", latencyMs: null });
      }
      return null;
    } finally {
      if (previewAbortRef.current === controller) previewAbortRef.current = null;
    }
  }, [closeLivePreview, previewContextFor, target]);

  const previewTargetPatch = useCallback((patch: CourseEditPatch, pendingAsset?: CourseEditPendingAssetReference) => {
    if (busy) return;
    if (!Object.keys(patch).length) {
      closeLivePreview();
      return;
    }
    void normalizeLivePreview(patch, pendingAsset ? [pendingAsset] : []);
  }, [busy, closeLivePreview, normalizeLivePreview]);

  const saveTarget = useCallback(async (patch: CourseEditPatch, pendingAsset?: CourseEditPendingAssetReference) => {
    if (busy) {
      setFeedback({ message: "Wait for the current course edit to finish.", tone: "warning" });
      return false;
    }
    const current = target;
    if (!current?.identity || current.eligibility !== "editable") return false;
    if (!Object.keys(patch).length) {
      setFeedback({ message: "Change at least one field before saving this draft.", tone: "warning" });
      return false;
    }
    const existing = draftsRef.current.find((draft) => draft.identity.targetId === current.identity?.targetId);
    const without = draftsRef.current.filter((draft) => draft.identity.targetId !== current.identity?.targetId);
    if (!existing && without.length >= COURSE_EDIT_MAX_DRAFTS) {
      setFeedback({ message: `Apply or remove a draft before adding more than ${COURSE_EDIT_MAX_DRAFTS}.`, tone: "warning" });
      return false;
    }
    setBusy(true);
    const normalized = await normalizeLivePreview(patch, pendingAsset ? [pendingAsset] : []);
    if (!normalized) {
      setBusy(false);
      setFeedback({ message: "Studio could not save this draft because its learner preview was not valid.", tone: "error" });
      return false;
    }
    const now = Date.now();
    const next: CourseEditDraft = {
      id: existing?.id ?? draftId(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      identity: current.identity,
      beforeText: current.originalText,
      afterText: courseEditPatchText(current, normalized.canonicalPatch),
      baseline: {
        originalHtml: current.originalHtml,
        attributes: current.attributes,
        currentStyle: current.currentStyle,
        capabilities: current.capabilities
      },
      patch: normalized.canonicalPatch,
      canonicalPatchDigest: normalized.canonicalPatchDigest,
      pageHref: normalized.pageIdentity,
      ...(normalized.pendingAssets.length ? { pendingAssets: normalized.pendingAssets } : {})
    };
    replaceDrafts(existing
      ? draftsRef.current.map((draft) => draft.id === existing.id ? next : draft)
      : [...without, next]);
    setTarget(null);
    closeLivePreview("", normalized.pendingAssets);
    setBusy(false);
    setFeedback({ message: existing ? "Draft updated." : "Draft saved. The course has not changed yet.", tone: "success" });
    return true;
  }, [busy, closeLivePreview, normalizeLivePreview, replaceDrafts, target]);

  const editDraft = useCallback((draft: CourseEditDraft) => {
    if (busy) return;
    const existing = draftsRef.current.find((entry) => entry.id === draft.id);
    if (!existing || draft.identity.projectSlug !== activeProjectRef.current) return;
    const pendingAssets = draft.pendingAssets?.filter((entry) => draft.patch.src === entry.finalSrc) ?? [];
    replaceDrafts(draftsRef.current.map((entry) => entry.id === draft.id ? {
      ...draft,
      canonicalPatchDigest: undefined,
      ...(pendingAssets.length ? { pendingAssets } : { pendingAssets: undefined }),
      updatedAt: Date.now()
    } : entry));
    setFeedback({ message: "Draft updated.", tone: "success" });
  }, [busy, replaceDrafts]);

  const patchDraft = useCallback((id: string, patch: CourseEditPatch) => {
    if (busy) return false;
    const draft = draftsRef.current.find((entry) => entry.id === id);
    if (!draft) return false;
    const afterText = patch.html !== undefined
      ? new DOMParser().parseFromString(`<body>${patch.html}</body>`, "text/html").body.textContent?.replace(/\s+/g, " ").trim() ?? ""
      : patch.alt ?? patch.href ?? draft.afterText;
    editDraft({ ...draft, patch, afterText, updatedAt: Date.now() });
    return true;
  }, [busy, editDraft]);

  const removeDraft = useCallback((id: string) => {
    if (busy) return;
    replaceDrafts(draftsRef.current.filter((draft) => draft.id !== id));
    setFeedback({ message: "Draft removed.", tone: "success" });
  }, [busy, replaceDrafts]);

  const reorderDraft = useCallback((id: string, direction: -1 | 1) => {
    if (busy) return;
    const index = draftsRef.current.findIndex((draft) => draft.id === id);
    const destination = index + direction;
    if (index < 0 || destination < 0 || destination >= draftsRef.current.length) return;
    const next = [...draftsRef.current];
    const [item] = next.splice(index, 1);
    next.splice(destination, 0, item);
    replaceDrafts(next);
  }, [busy, replaceDrafts]);

  const apply = useCallback(async () => {
    const slug = activeProjectRef.current;
    const currentDrafts = draftsRef.current;
    if (!slug || !currentDrafts.length || busy) return false;
    closeLivePreview();
    const operation = ++operationRef.current;
    const submittedIds = new Set(currentDrafts.map((draft) => draft.id));
    setBusy(true);
    setFeedback({ message: "Applying, rebuilding, and checking this course…", tone: "progress" });
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(slug)}/course-edits/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemaVersion: COURSE_EDIT_SCHEMA_VERSION, projectSlug: slug, drafts: currentDrafts })
      });
      const result = await responseJson<CourseEditBatchResult>(response, "Studio could not apply these changes.");
      const remainingForSubmittedProject = loadCourseEditDrafts(slug).filter((draft) => !submittedIds.has(draft.id));
      saveCourseEditDrafts(slug, remainingForSubmittedProject);
      if (activeProjectRef.current !== slug || operationRef.current !== operation) return true;
      replaceDrafts(draftsRef.current.filter((draft) => !submittedIds.has(draft.id)));
      setTarget(null);
      setStatus(result);
      setFeedback({ message: result.message, tone: "success" });
      await onApplied();
      return true;
    } catch (error) {
      if (activeProjectRef.current === slug && operationRef.current === operation) {
        setFeedback({ message: error instanceof Error ? error.message : "Studio could not apply these changes.", tone: "error" });
      }
      return false;
    } finally {
      if (activeProjectRef.current === slug && operationRef.current === operation) setBusy(false);
    }
  }, [busy, closeLivePreview, onApplied, replaceDrafts]);

  const undo = useCallback(async () => {
    const slug = activeProjectRef.current;
    if (!slug || busy) return false;
    closeLivePreview();
    const operation = ++operationRef.current;
    setBusy(true);
    setFeedback({ message: "Undoing the last applied batch and checking the course…", tone: "progress" });
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(slug)}/course-edits/undo`, { method: "POST" });
      const result = await responseJson<CourseEditBatchResult>(response, "Studio could not undo the last batch.");
      if (activeProjectRef.current !== slug) return false;
      setTarget(null);
      setStatus(result);
      setFeedback({ message: result.message, tone: "success" });
      await onApplied();
      return true;
    } catch (error) {
      if (activeProjectRef.current === slug && operationRef.current === operation) {
        setFeedback({ message: error instanceof Error ? error.message : "Studio could not undo the last batch.", tone: "error" });
      }
      return false;
    } finally {
      if (activeProjectRef.current === slug && operationRef.current === operation) setBusy(false);
    }
  }, [busy, closeLivePreview, onApplied]);

  const clearSelection = useCallback(() => {
    resolveAbortRef.current?.abort();
    closeLivePreview();
    setTarget(null);
    setResolving(false);
  }, [closeLivePreview]);

  const acknowledgePreview = useCallback((ack: PreviewCourseEditAck) => {
    const context = previewContextRef.current;
    const command = context?.command;
    if (
      !context ||
      !command ||
      ack.previewSessionId !== command.previewSessionId ||
      ack.revision !== command.revision ||
      ack.canonicalPatchDigest !== command.canonicalPatchDigest ||
      ack.targetNodeId !== command.targetNodeId
    ) return false;
    const latencyMs = Math.max(0, Date.now() - context.requestedAt);
    setPreviewFeedback({
      message: ack.message,
      tone: ack.ok && ack.action === "rendered" ? "success" : ack.ok ? "neutral" : "error",
      latencyMs
    });
    if (!ack.ok) closeLivePreview(ack.message);
    return ack.ok;
  }, [closeLivePreview]);

  const exportDrafts = useCallback(() => exportCourseEditDrafts(activeProjectRef.current), []);

  const importDrafts = useCallback((source: string) => {
    const slug = activeProjectRef.current;
    const result = importCourseEditDrafts(slug, source);
    if (result.ok) {
      draftsRef.current = result.drafts;
      setDrafts(result.drafts);
      setFeedback({ message: `${result.drafts.length} draft ${result.drafts.length === 1 ? "change" : "changes"} imported.`, tone: "success" });
    } else {
      setFeedback({ message: result.warnings[0] ?? "Studio could not import this draft backup.", tone: "error" });
    }
    return result.ok;
  }, []);

  const uploadImage = useCallback(async (file: File, htmlPath: string): Promise<CourseEditPendingImage | null> => {
    const slug = activeProjectRef.current;
    const current = target;
    if (!slug || busy || !current?.identity || current.eligibility !== "editable" || !current.capabilities.image || file.size > 10 * 1024 * 1024) {
      setFeedback({ message: file.size > 10 * 1024 * 1024 ? "Images must be 10 MB or smaller." : "Wait for the current course operation to finish.", tone: "warning" });
      return null;
    }
    const context = previewContextFor(current);
    if (!context || current.identity.htmlPath !== htmlPath) {
      setPreviewFeedback({ message: "Select this image again before uploading a replacement.", tone: "warning", latencyMs: null });
      return null;
    }
    setPreviewFeedback({ message: "Decoding this image for a temporary preview…", tone: "progress", latencyMs: null });
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(slug)}/course-edits/preview-assets`, {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
          "X-Canvas-Helper-Html-Path": htmlPath,
          "X-Canvas-Helper-Target-Id": context.identity.targetId,
          "X-Canvas-Helper-Source-Digest": context.identity.sourceDigest,
          "X-Canvas-Helper-Target-Node-Id": context.identity.nodeId,
          "X-Canvas-Helper-Preview-Session-Id": context.previewSessionId,
          "X-Canvas-Helper-Page-Identity": context.pageIdentity
        },
        body: file
      });
      const result = await responseJson<CourseEditPendingImage>(response, "Studio could not prepare this image preview.");
      if (activeProjectRef.current !== slug || previewContextRef.current !== context) return null;
      setPreviewFeedback({ message: `Image decoded for preview (${result.width} × ${result.height}). Nothing has been written yet.`, tone: "success", latencyMs: null });
      return result;
    } catch (error) {
      if (activeProjectRef.current === slug && previewContextRef.current === context) setPreviewFeedback({
        message: error instanceof Error ? error.message : "Studio could not prepare this image preview.",
        tone: "error",
        latencyMs: null
      });
      return null;
    }
  }, [busy, previewContextFor, target]);

  const renameCourse = useCallback(async (title: string) => {
    const slug = activeProjectRef.current;
    const normalized = title.replace(/\s+/g, " ").trim();
    if (!slug || busy || !normalized || normalized.length > 160) {
      setFeedback({ message: "Enter a course title between 1 and 160 characters.", tone: "warning" });
      return false;
    }
    closeLivePreview();
    const operation = ++operationRef.current;
    setBusy(true);
    setFeedback({ message: "Renaming every course title location and checking the learner page…", tone: "progress" });
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(slug)}/course-edits/rename`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemaVersion: COURSE_EDIT_SCHEMA_VERSION, projectSlug: slug, title: normalized })
      });
      const result = await responseJson<CourseEditBatchResult>(response, "Studio could not rename this course.");
      if (activeProjectRef.current !== slug || operationRef.current !== operation) return true;
      setTarget(null);
      setStatus(result);
      setFeedback({ message: result.message, tone: "success" });
      await onApplied();
      return true;
    } catch (error) {
      if (activeProjectRef.current === slug && operationRef.current === operation) {
        setFeedback({ message: error instanceof Error ? error.message : "Studio could not rename this course.", tone: "error" });
      }
      return false;
    } finally {
      if (activeProjectRef.current === slug && operationRef.current === operation) setBusy(false);
    }
  }, [busy, closeLivePreview, onApplied]);

  return useMemo(() => ({
    enabled,
    setEnabled,
    target,
    resolving,
    drafts,
    status,
    busy,
    feedback,
    previewCommand,
    previewFeedback,
    hasLivePreview: previewCommand?.action === "render",
    resolveSelection,
    previewTargetPatch,
    closeLivePreview,
    acknowledgePreview,
    saveTarget,
    editDraft,
    patchDraft,
    removeDraft,
    reorderDraft,
    apply,
    undo,
    exportDrafts,
    importDrafts,
    uploadImage,
    renameCourse,
    clearSelection,
    refreshStatus
  }), [acknowledgePreview, apply, busy, clearSelection, closeLivePreview, drafts, editDraft, enabled, exportDrafts, feedback, importDrafts, patchDraft, previewCommand, previewFeedback, previewTargetPatch, refreshStatus, removeDraft, renameCourse, reorderDraft, resolveSelection, resolving, saveTarget, status, target, undo, uploadImage]);
}
