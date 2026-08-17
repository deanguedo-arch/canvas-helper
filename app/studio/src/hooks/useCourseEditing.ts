import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  COURSE_EDIT_MAX_DRAFTS,
  COURSE_EDIT_PREVIEW_SCHEMA_VERSION,
  COURSE_EDIT_SCHEMA_VERSION,
  isCourseEditDraft,
  type CourseEditBatchResult,
  type CourseEditDraft,
  type CourseEditEditorDocument,
  type CourseEditNormalizeResult,
  type CourseEditPendingAssetReference,
  type CourseEditPendingImage,
  type CourseEditPatch,
  type CourseEditReopenResult,
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

type PendingInlinePreviewOwner = {
  owner: "parent-inline" | "standalone-inline";
  previewSessionId: string;
  revision: number;
  targetNodeId: string;
};

export type CourseEditPreviewOwner = "parent-inline" | "standalone-inline" | "child-inert" | "none";
export type CourseEditInlineEditorStatus =
  | "clean"
  | "editing"
  | "normalizing"
  | "valid"
  | "invalid"
  | "saved"
  | "detached"
  | "applying"
  | "rejected";

export type CourseEditInlineEditorState = {
  status: CourseEditInlineEditorStatus;
  target: CourseEditTarget | null;
  rawDocument: CourseEditEditorDocument | null;
  canonicalDocument: CourseEditEditorDocument | null;
  canonicalPatch: CourseEditPatch | null;
  canonicalPatchDigest: string;
  /** Session token for the trusted Studio-owned in-place editing surface. */
  inlineSessionId: string;
  localRevision: number;
  canonicalRevision: number;
  savedDraftId: string | null;
  previewOwner: CourseEditPreviewOwner;
  previewAvailable: boolean;
  /** A detached draft can be reattached only after its durable identity is checked again. */
  canReopen?: boolean;
  /** Set only after Reopen returns a changed but still durable target. */
  canRebase?: boolean;
  message: string;
};

const EMPTY_INLINE_EDITOR: CourseEditInlineEditorState = {
  status: "clean",
  target: null,
  rawDocument: null,
  canonicalDocument: null,
  canonicalPatch: null,
  canonicalPatchDigest: "",
  inlineSessionId: "",
  localRevision: 0,
  canonicalRevision: 0,
  savedDraftId: null,
  previewOwner: "none",
  previewAvailable: false,
  canReopen: false,
  canRebase: false,
  message: ""
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

function inlineEditorDocumentForTarget(target: CourseEditTarget): CourseEditEditorDocument | null {
  if (target.eligibility !== "editable" || target.editor?.kind !== "plain-text") return null;
  return { kind: "plain-text", text: target.editor.text };
}

function plainTextDocumentFromHtml(html: string): CourseEditEditorDocument | null {
  const document = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  if ([...document.body.querySelectorAll("*")].some((element) => element.tagName !== "BR")) return null;
  for (const lineBreak of [...document.body.querySelectorAll("br")]) {
    lineBreak.replaceWith(document.createTextNode("\n"));
  }
  return { kind: "plain-text", text: document.body.textContent?.replace(/\r\n?/g, "\n") ?? "" };
}

function sourceDriftMessage(message: string) {
  return /same stable edit identity|selected (?:content|element)(?:\s+\w+){0,3}\s+(?:changed|no longer)|edit target identity|adapter changed|canonical editable source|changed after the draft|no longer (?:inspect|available|map)/i.test(message);
}

export function useCourseEditing(projectSlug: string, onApplied: () => void | Promise<void>) {
  const [enabled, setEnabled] = useState(false);
  const [target, setTarget] = useState<CourseEditTarget | null>(null);
  const [resolving, setResolving] = useState(false);
  const [drafts, setDrafts] = useState<CourseEditDraft[]>(() => loadCourseEditDraftState(projectSlug).drafts);
  const [status, setStatus] = useState<CourseEditStatus>({ ...EMPTY_STATUS, projectSlug });
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; tone: CourseEditFeedbackTone }>({ message: "", tone: "neutral" });
  const [inlineEditor, setInlineEditor] = useState<CourseEditInlineEditorState>(EMPTY_INLINE_EDITOR);
  const [previewCommand, setPreviewCommand] = useState<PreviewCourseEditCommand | null>(null);
  const [previewFeedback, setPreviewFeedback] = useState<{ message: string; tone: CourseEditFeedbackTone; latencyMs: number | null }>({
    message: "",
    tone: "neutral",
    latencyMs: null
  });
  const resolveAbortRef = useRef<AbortController | null>(null);
  const previewAbortRef = useRef<AbortController | null>(null);
  const inlineEditorAbortRef = useRef<AbortController | null>(null);
  const inlineEditorTimerRef = useRef<number | null>(null);
  const previewContextRef = useRef<LivePreviewContext | null>(null);
  const pendingInlinePreviewOwnerRef = useRef<PendingInlinePreviewOwner | null>(null);
  const resolvedPageIdentityRef = useRef("");
  const activeProjectRef = useRef(projectSlug);
  const operationRef = useRef(0);
  const draftsRef = useRef(drafts);
  const inlineEditorRef = useRef(inlineEditor);
  draftsRef.current = drafts;
  inlineEditorRef.current = inlineEditor;

  const replaceInlineEditor = useCallback((next: CourseEditInlineEditorState) => {
    inlineEditorRef.current = next;
    setInlineEditor(next);
  }, []);

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

  const clearInlineEditor = useCallback((message = "") => {
    if (inlineEditorTimerRef.current !== null) {
      window.clearTimeout(inlineEditorTimerRef.current);
      inlineEditorTimerRef.current = null;
    }
    inlineEditorAbortRef.current?.abort();
    inlineEditorAbortRef.current = null;
    pendingInlinePreviewOwnerRef.current = null;
    closeLivePreview();
    replaceInlineEditor({ ...EMPTY_INLINE_EDITOR, message });
  }, [closeLivePreview, replaceInlineEditor]);

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
    clearInlineEditor();
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
  }, [clearInlineEditor, projectSlug, refreshStatus]);

  useEffect(() => () => {
    resolveAbortRef.current?.abort();
    previewAbortRef.current?.abort();
    inlineEditorAbortRef.current?.abort();
    if (inlineEditorTimerRef.current !== null) window.clearTimeout(inlineEditorTimerRef.current);
  }, []);

  const resolveSelection = useCallback(async (request: CourseEditResolveRequest) => {
    const slug = activeProjectRef.current;
    if (!slug || request.projectSlug !== slug) return null;
    const activeInline = inlineEditorRef.current;
    if (
      activeInline.target &&
      !["clean", "saved"].includes(activeInline.status) &&
      activeInline.target.identity?.nodeId !== request.selection.nodeId
    ) {
      setFeedback({ message: "Save, discard, or finish the current in-place text edit before selecting another element.", tone: "warning" });
      return null;
    }
    resolveAbortRef.current?.abort();
    if (activeInline.target && activeInline.target.identity?.nodeId !== request.selection.nodeId) clearInlineEditor();
    else closeLivePreview();
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
  }, [clearInlineEditor, closeLivePreview]);

  const normalizeLivePreview = useCallback(async (
    current: CourseEditTarget,
    patch: CourseEditPatch,
    pendingAssets: readonly CourseEditPendingAssetReference[] = []
  ) => {
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
  }, [closeLivePreview, previewContextFor]);

  const detachInlineEditor = useCallback((message: string, currentTarget?: CourseEditTarget | null) => {
    const current = inlineEditorRef.current;
    if (!current.target || !current.rawDocument) return;
    if (inlineEditorTimerRef.current !== null) {
      window.clearTimeout(inlineEditorTimerRef.current);
      inlineEditorTimerRef.current = null;
    }
    inlineEditorAbortRef.current?.abort();
    inlineEditorAbortRef.current = null;
    closeLivePreview();
    setTarget(null);
    replaceInlineEditor({
      ...current,
      target: currentTarget ?? current.target,
      status: "detached",
      previewOwner: "none",
      previewAvailable: false,
      canReopen: true,
      canRebase: false,
      message
    });
    setFeedback({ message, tone: "warning" });
  }, [closeLivePreview, replaceInlineEditor]);

  const normalizeInlineEditor = useCallback(async (
    expectedRevision?: number,
    options: { quiet?: boolean } = {}
  ): Promise<CourseEditNormalizeResult | null> => {
    const current = inlineEditorRef.current;
    if (
      busy ||
      current.status === "detached" ||
      current.status === "applying" ||
      !current.target?.identity ||
      !current.rawDocument
    ) return null;
    const revision = expectedRevision ?? current.localRevision;
    if (revision !== current.localRevision) return null;
    inlineEditorAbortRef.current?.abort();
    const controller = new AbortController();
    inlineEditorAbortRef.current = controller;
    if (!options.quiet) {
      replaceInlineEditor({
        ...current,
        status: "normalizing",
        message: "Checking this text…"
      });
    }
    try {
      const response = await fetch("/api/course-edits/normalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
          identity: current.target.identity,
          document: current.rawDocument
        }),
        signal: controller.signal
      });
      const normalized = await responseJson<CourseEditNormalizeResult>(response, "Studio could not check this text.");
      const latest = inlineEditorRef.current;
      if (
        controller.signal.aborted ||
        latest.localRevision !== revision ||
        latest.target?.identity?.targetId !== current.target.identity.targetId
      ) return null;
      const next: CourseEditInlineEditorState = {
        ...latest,
        target: normalized.target,
        canonicalDocument: normalized.document,
        canonicalPatch: normalized.canonicalPatch,
        canonicalPatchDigest: normalized.canonicalPatchDigest,
        canonicalRevision: revision,
        status: options.quiet && latest.status === "saved"
          ? "saved"
          : normalized.changed ? "valid" : "clean",
        message: options.quiet && latest.status === "saved"
          ? latest.message
          : normalized.changed ? "Text is ready to save." : "This text matches the current course source."
      };
      replaceInlineEditor(next);
      if (!options.quiet && next.previewOwner === "child-inert") {
        if (!normalized.changed) {
          closeLivePreview();
        } else if (next.previewAvailable) {
          void normalizeLivePreview(normalized.target, normalized.canonicalPatch);
        }
      }
      return normalized;
    } catch (error) {
      if (controller.signal.aborted) return null;
      const message = error instanceof Error ? error.message : "Studio could not check this text.";
      if (sourceDriftMessage(message)) {
        detachInlineEditor(
          "Source changed externally. Your proposed text is preserved. Reopen this target against the current source before saving or applying."
        );
      } else {
        const latest = inlineEditorRef.current;
        if (latest.localRevision === revision) {
          replaceInlineEditor({ ...latest, status: "invalid", message });
          setFeedback({ message, tone: "warning" });
        }
      }
      return null;
    } finally {
      if (inlineEditorAbortRef.current === controller) inlineEditorAbortRef.current = null;
    }
  }, [busy, closeLivePreview, detachInlineEditor, normalizeLivePreview, replaceInlineEditor]);

  const revalidateInlineEditor = useCallback(() => {
    const current = inlineEditorRef.current;
    if (
      !current.target ||
      !current.rawDocument ||
      !["clean", "valid", "saved"].includes(current.status)
    ) return Promise.resolve(false);
    return normalizeInlineEditor(current.localRevision, { quiet: true }).then(Boolean);
  }, [normalizeInlineEditor]);

  const setInlineEditorText = useCallback((text: string) => {
    const current = inlineEditorRef.current;
    if (busy || !current.target || !current.rawDocument || current.status === "detached" || current.status === "applying") return false;
    if (current.rawDocument.text === text) return true;
    if (inlineEditorTimerRef.current !== null) window.clearTimeout(inlineEditorTimerRef.current);
    inlineEditorAbortRef.current?.abort();
    const revision = current.localRevision + 1;
    const next: CourseEditInlineEditorState = {
      ...current,
      rawDocument: { kind: "plain-text", text },
      localRevision: revision,
      status: "editing",
      message: ""
    };
    replaceInlineEditor(next);
    inlineEditorTimerRef.current = window.setTimeout(() => {
      inlineEditorTimerRef.current = null;
      void normalizeInlineEditor(revision);
    }, 200);
    return true;
  }, [busy, normalizeInlineEditor, replaceInlineEditor]);

  const flushInlineEditor = useCallback(async () => {
    if (inlineEditorTimerRef.current !== null) {
      window.clearTimeout(inlineEditorTimerRef.current);
      inlineEditorTimerRef.current = null;
    }
    const current = inlineEditorRef.current;
    if (!current.target || !current.rawDocument || current.status === "detached") return null;
    if (current.canonicalRevision === current.localRevision && ["clean", "valid", "saved"].includes(current.status)) {
      return current.canonicalPatch === null
        ? null
        : {
            schemaVersion: COURSE_EDIT_SCHEMA_VERSION,
            document: current.canonicalDocument ?? current.rawDocument,
            canonicalPatch: current.canonicalPatch,
            canonicalPatchDigest: current.canonicalPatchDigest,
            representation: {
              tagName: current.target.identity?.tagName ?? "p",
              html: current.canonicalPatch.html ?? current.target.originalHtml,
              attributes: current.target.attributes,
              style: current.target.currentStyle
            },
            target: current.target,
            changed: Object.keys(current.canonicalPatch).length > 0
          };
    }
    return normalizeInlineEditor(current.localRevision);
  }, [normalizeInlineEditor]);

  const clearChildPreviewBeforeInlineEditor = useCallback((
    current: CourseEditInlineEditorState,
    currentTarget: CourseEditTarget,
    owner: "parent-inline" | "standalone-inline"
  ) => {
    const context = previewContextRef.current;
    if (current.previewOwner !== "child-inert" || !context?.command || context.command.action !== "render" || !currentTarget.identity) {
      return false;
    }
    pendingInlinePreviewOwnerRef.current = {
      owner,
      previewSessionId: context.previewSessionId,
      revision: context.revision + 1,
      targetNodeId: currentTarget.identity.nodeId
    };
    replaceInlineEditor({
      ...current,
      previewOwner: "none",
      message: "Clearing the display preview before opening the in-place editor…"
    });
    closeLivePreview();
    return true;
  }, [closeLivePreview, replaceInlineEditor]);

  const beginInlineEditor = useCallback((
    current: CourseEditTarget,
    owner: "parent-inline" | "standalone-inline" = "parent-inline"
  ) => {
    if (busy) return false;
    const document = inlineEditorDocumentForTarget(current);
    if (!document || !current.identity) return false;
    if (inlineEditorTimerRef.current !== null) window.clearTimeout(inlineEditorTimerRef.current);
    inlineEditorAbortRef.current?.abort();
    const existing = inlineEditorRef.current;
    if (
      existing.target?.identity?.targetId === current.identity.targetId &&
      existing.rawDocument &&
      existing.status !== "detached"
    ) {
      setTarget(current);
      if (clearChildPreviewBeforeInlineEditor(existing, current, owner)) return true;
      replaceInlineEditor({
        ...existing,
        target: current,
        previewOwner: owner,
        previewAvailable: true,
        message: owner === "standalone-inline"
          ? "Continue editing in Full Preview."
          : "Continue editing in the course preview."
      });
      return true;
    }
    closeLivePreview();
    setTarget(current);
    replaceInlineEditor({
      status: "clean",
      target: current,
      rawDocument: document,
      canonicalDocument: document,
      canonicalPatch: {},
      canonicalPatchDigest: "",
      inlineSessionId: previewSessionId(),
      localRevision: 0,
      canonicalRevision: 0,
      savedDraftId: draftsRef.current.find((draft) => draft.identity.targetId === current.identity?.targetId)?.id ?? null,
      previewOwner: owner,
      previewAvailable: true,
      message: owner === "standalone-inline"
        ? "Type directly in Full Preview. The course files remain unchanged until Apply."
        : "Type directly in the course preview. The course files remain unchanged until Apply."
    });
    return true;
  }, [busy, clearChildPreviewBeforeInlineEditor, closeLivePreview, replaceInlineEditor]);

  const setInlinePreviewOwner = useCallback((owner: CourseEditPreviewOwner) => {
    const current = inlineEditorRef.current;
    const currentTarget = current.target;
    if (!currentTarget || !current.rawDocument || current.status === "detached") return false;
    if (current.previewOwner === owner) return true;
    if ((owner === "parent-inline" || owner === "standalone-inline") && clearChildPreviewBeforeInlineEditor(current, currentTarget, owner)) return true;
    if (owner === "parent-inline" || owner === "standalone-inline") closeLivePreview();
    const next = { ...current, previewOwner: owner };
    replaceInlineEditor(next);
    if (
      owner === "child-inert" &&
      next.previewAvailable &&
      next.canonicalPatch &&
      Object.keys(next.canonicalPatch).length
    ) {
      void normalizeLivePreview(currentTarget, next.canonicalPatch);
    }
    return true;
  }, [clearChildPreviewBeforeInlineEditor, closeLivePreview, normalizeLivePreview, replaceInlineEditor]);

  const setInlinePreviewAvailable = useCallback((available: boolean) => {
    const current = inlineEditorRef.current;
    const currentTarget = current.target;
    if (!currentTarget || !current.rawDocument || current.status === "detached") return false;
    const next = { ...current, previewAvailable: available, previewOwner: available ? current.previewOwner : "none" };
    if (!available) closeLivePreview();
    replaceInlineEditor(next);
    if (
      available &&
      next.previewOwner === "child-inert" &&
      next.canonicalPatch &&
      Object.keys(next.canonicalPatch).length
    ) {
      void normalizeLivePreview(currentTarget, next.canonicalPatch);
    }
    return true;
  }, [closeLivePreview, normalizeLivePreview, replaceInlineEditor]);

  const attachInlineEditorToPreview = useCallback((currentTarget: CourseEditTarget) => {
    const current = inlineEditorRef.current;
    if (
      !current.target?.identity ||
      !current.rawDocument ||
      current.status === "detached" ||
      current.target.identity.targetId !== currentTarget.identity?.targetId
    ) return false;
    const next: CourseEditInlineEditorState = {
      ...current,
      target: currentTarget,
      previewOwner: "child-inert",
      previewAvailable: true,
      message: "Current learner-page preview restored. Click the visible text to edit in place."
    };
    setTarget(currentTarget);
    replaceInlineEditor(next);
    if (next.canonicalPatch && Object.keys(next.canonicalPatch).length) {
      void normalizeLivePreview(currentTarget, next.canonicalPatch);
    }
    return true;
  }, [normalizeLivePreview, replaceInlineEditor]);

  const saveInlineEditor = useCallback(async () => {
    if (busy) {
      setFeedback({ message: "Wait for the current course edit to finish.", tone: "warning" });
      return false;
    }
    const normalized = await flushInlineEditor();
    const current = inlineEditorRef.current;
    if (!normalized || !current.target?.identity || !current.canonicalDocument || current.status === "detached") {
      if (current.status !== "detached") setFeedback({ message: current.message || "Studio could not save this text.", tone: "error" });
      return false;
    }
    if (!normalized.changed || !Object.keys(normalized.canonicalPatch).length) {
      setFeedback({ message: "Change the text before saving this draft.", tone: "warning" });
      return false;
    }
    const currentTarget = normalized.target;
    if (!currentTarget.identity) {
      setFeedback({ message: "This course target is no longer available. Reopen it before saving.", tone: "warning" });
      return false;
    }
    const existing = current.savedDraftId
      ? draftsRef.current.find((draft) => draft.id === current.savedDraftId)
      : draftsRef.current.find((draft) => draft.identity.targetId === currentTarget.identity?.targetId);
    const without = draftsRef.current.filter((draft) => draft.id !== existing?.id);
    if (!existing && without.length >= COURSE_EDIT_MAX_DRAFTS) {
      setFeedback({ message: `Apply or remove a draft before adding more than ${COURSE_EDIT_MAX_DRAFTS}.`, tone: "warning" });
      return false;
    }
    const now = Date.now();
    const nextDraft: CourseEditDraft = {
      id: existing?.id ?? draftId(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      identity: currentTarget.identity,
      beforeText: currentTarget.originalText,
      afterText: current.canonicalDocument.text,
      baseline: {
        originalHtml: currentTarget.originalHtml,
        attributes: currentTarget.attributes,
        currentStyle: currentTarget.currentStyle,
        capabilities: currentTarget.capabilities
      },
      patch: normalized.canonicalPatch,
      canonicalPatchDigest: normalized.canonicalPatchDigest,
      ...(existing?.pageHref ? { pageHref: existing.pageHref } : resolvedPageIdentityRef.current ? { pageHref: resolvedPageIdentityRef.current } : {})
    };
    replaceDrafts(existing
      ? draftsRef.current.map((draft) => draft.id === existing.id ? nextDraft : draft)
      : [...without, nextDraft]);
    // Saving ends the active caret session. The saved draft remains available
    // to reopen in place or as a display-only preview, but it must not keep
    // Full Preview or review evidence blocked as an interactive editor.
    const previewAvailable = inlineEditorRef.current.previewAvailable;
    closeLivePreview();
    replaceInlineEditor({
      ...inlineEditorRef.current,
      target: currentTarget,
      canonicalPatch: normalized.canonicalPatch,
      canonicalPatchDigest: normalized.canonicalPatchDigest,
      status: "saved",
      savedDraftId: nextDraft.id,
      previewOwner: "none",
      previewAvailable,
      message: "Draft saved. The course has not changed yet."
    });
    setFeedback({ message: "Draft saved. The course has not changed yet.", tone: "success" });
    return true;
  }, [busy, closeLivePreview, flushInlineEditor, replaceDrafts, replaceInlineEditor]);

  const previewTargetPatch = useCallback((
    patch: CourseEditPatch,
    pendingAsset?: CourseEditPendingAssetReference,
    freshlyResolvedTarget?: CourseEditTarget
  ) => {
    if (busy) return;
    const current = freshlyResolvedTarget ?? target;
    if (!current) return;
    if (!Object.keys(patch).length) {
      closeLivePreview();
      return;
    }
    void normalizeLivePreview(current, patch, pendingAsset ? [pendingAsset] : []);
  }, [busy, closeLivePreview, normalizeLivePreview, target]);

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
    const normalized = await normalizeLivePreview(current, patch, pendingAsset ? [pendingAsset] : []);
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

  const reopenDraft = useCallback(async (draft: CourseEditDraft): Promise<CourseEditReopenResult | null> => {
    if (busy || draft.identity.projectSlug !== activeProjectRef.current) return null;
    try {
      const response = await fetch("/api/course-edits/reopen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemaVersion: COURSE_EDIT_SCHEMA_VERSION, identity: draft.identity })
      });
      const result = await responseJson<CourseEditReopenResult>(response, "Studio could not reopen this saved draft.");
      if (result.status === "resolved") {
        setFeedback({ message: "Saved draft located. Studio is checking its current learner-page selection.", tone: "progress" });
      } else if (result.status === "target-changed") {
        setFeedback({ message: "The saved element changed in the course. Its draft was preserved, but it must be rebased onto the current content before saving or applying.", tone: "warning" });
      } else {
        setFeedback({ message: result.reason, tone: "warning" });
      }
      return result;
    } catch (error) {
      setFeedback({ message: error instanceof Error ? error.message : "Studio could not reopen this saved draft.", tone: "error" });
      return null;
    }
  }, [busy]);

  const rebindDraft = useCallback((id: string, current: CourseEditTarget) => {
    if (!current.identity || current.eligibility !== "editable") return false;
    const existing = draftsRef.current.find((draft) => draft.id === id);
    if (!existing) return false;
    const next: CourseEditDraft = {
      ...existing,
      identity: current.identity,
      beforeText: current.originalText,
      baseline: {
        originalHtml: current.originalHtml,
        attributes: current.attributes,
        currentStyle: current.currentStyle,
        capabilities: current.capabilities
      },
      canonicalPatchDigest: undefined,
      updatedAt: Date.now()
    };
    replaceDrafts(draftsRef.current.map((draft) => draft.id === id ? next : draft));
    return true;
  }, [replaceDrafts]);

  const activateInlineDraft = useCallback(async (draft: CourseEditDraft): Promise<CourseEditTarget | null> => {
    if (busy || draft.identity.projectSlug !== activeProjectRef.current) return null;
    // Do not leave a previous editor writable while this durable identity is
    // being reopened. A late reopen result must never overwrite new teacher
    // text that was entered against the previous target.
    closeLivePreview();
    replaceInlineEditor({
      ...EMPTY_INLINE_EDITOR,
      status: "normalizing",
      savedDraftId: draft.id,
      message: "Reopening this saved draft against the current course source…"
    });
    const reopened = await reopenDraft(draft);
    if (reopened?.status !== "resolved" || !reopened.target.identity) return null;
    const document = draft.patch.html === undefined
      ? inlineEditorDocumentForTarget(reopened.target)
      : plainTextDocumentFromHtml(draft.patch.html);
    if (!document || reopened.target.editor?.kind !== "plain-text") {
      setFeedback({
        message: "This saved draft uses formatting that is not available in the first in-place text editor. Reopen it on the page to use the existing formatting controls.",
        tone: "warning"
      });
      return null;
    }
    if (!reopened.target.editor.allowsLineBreaks && document.text.includes("\n")) {
      setFeedback({ message: "This saved draft contains a line break that is not safe for this one-line course element.", tone: "warning" });
      return null;
    }
    setTarget(reopened.target);
    replaceInlineEditor({
      status: "saved",
      target: reopened.target,
      rawDocument: document,
      canonicalDocument: document,
      canonicalPatch: draft.patch,
      canonicalPatchDigest: draft.canonicalPatchDigest ?? "",
      inlineSessionId: previewSessionId(),
      localRevision: 0,
      canonicalRevision: 0,
      savedDraftId: draft.id,
      previewOwner: "none",
      previewAvailable: false,
      message: "Saved draft reopened. Preview unavailable until this learner page opens."
    });
    return reopened.target;
  }, [busy, closeLivePreview, reopenDraft, replaceInlineEditor]);

  const reopenInlineEditor = useCallback(async () => {
    const current = inlineEditorRef.current;
    if (busy || current.status !== "detached" || !current.target?.identity || !current.rawDocument) return false;
    try {
      const response = await fetch("/api/course-edits/reopen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemaVersion: COURSE_EDIT_SCHEMA_VERSION, identity: current.target.identity })
      });
      const reopened = await responseJson<CourseEditReopenResult>(response, "Studio could not reopen this text target.");
      if (reopened.status === "resolved" && reopened.target.identity && reopened.target.editor?.kind === "plain-text") {
        const revision = current.localRevision + 1;
        const next: CourseEditInlineEditorState = {
          ...current,
          target: reopened.target,
          canonicalDocument: null,
          canonicalPatch: null,
          canonicalPatchDigest: "",
          localRevision: revision,
          canonicalRevision: -1,
          status: "editing",
          previewOwner: "none",
          previewAvailable: false,
          canReopen: false,
          canRebase: false,
          message: "Target reopened. Checking your preserved text against the current source…"
        };
        setTarget(reopened.target);
        replaceInlineEditor(next);
        void normalizeInlineEditor(revision);
        return true;
      }
      if (reopened.status === "target-changed" && reopened.currentTarget.editor?.kind === "plain-text") {
        replaceInlineEditor({
          ...current,
          target: reopened.currentTarget,
          previewOwner: "none",
          previewAvailable: false,
          canReopen: false,
          canRebase: true,
          message: "The source text changed. Compare the current text below, then explicitly rebase your proposed text before saving."
        });
        return false;
      }
      const message = reopened.status === "target-changed"
          ? "The saved source changed and cannot be safely rebased here."
          : "reason" in reopened ? reopened.reason : "This target is not available for in-place text editing.";
      replaceInlineEditor({
        ...current,
        canReopen: false,
        canRebase: false,
        message
      });
      setFeedback({ message, tone: "warning" });
      return false;
    } catch (error) {
      setFeedback({ message: error instanceof Error ? error.message : "Studio could not reopen this text target.", tone: "error" });
      return false;
    }
  }, [busy, normalizeInlineEditor, replaceInlineEditor]);

  const rebaseInlineEditor = useCallback(() => {
    const current = inlineEditorRef.current;
    if (busy || current.status !== "detached" || !current.canRebase || !current.target?.identity || !current.target.editor || !current.rawDocument) return false;
    const revision = current.localRevision + 1;
    const next: CourseEditInlineEditorState = {
      ...current,
      canonicalDocument: null,
      canonicalPatch: null,
      canonicalPatchDigest: "",
      localRevision: revision,
      canonicalRevision: -1,
      status: "editing",
      previewOwner: "none",
      previewAvailable: false,
      canReopen: false,
      canRebase: false,
      message: "Checking your proposed text against the current source…"
    };
    setTarget(current.target);
    replaceInlineEditor(next);
    void normalizeInlineEditor(revision);
    return true;
  }, [busy, normalizeInlineEditor, replaceInlineEditor]);

  const copyInlineEditorText = useCallback(async () => {
    const text = inlineEditorRef.current.rawDocument?.text ?? "";
    if (!text || !navigator.clipboard?.writeText) return false;
    try {
      await navigator.clipboard.writeText(text);
      setFeedback({ message: "Proposed text copied.", tone: "success" });
      return true;
    } catch {
      setFeedback({ message: "Clipboard access is unavailable. Select and copy the preserved text manually.", tone: "warning" });
      return false;
    }
  }, []);

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
    const activeInline = inlineEditorRef.current;
    if (activeInline.target && !["clean", "saved"].includes(activeInline.status)) {
      setFeedback({ message: "Save or discard the active in-place text edit before applying drafts.", tone: "warning" });
      return false;
    }
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
      clearInlineEditor();
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
  }, [busy, clearInlineEditor, closeLivePreview, onApplied, replaceDrafts]);

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
    const current = inlineEditorRef.current;
    if (current.target && current.rawDocument) {
      replaceInlineEditor({
        ...current,
        previewOwner: "none",
        previewAvailable: false,
        message: current.status === "detached"
          ? current.message
          : "Preview unavailable until this learner page opens. Your text is still available in Review & Apply."
      });
    }
  }, [closeLivePreview, replaceInlineEditor]);

  const acknowledgePreview = useCallback((ack: PreviewCourseEditAck) => {
    const pendingOwner = pendingInlinePreviewOwnerRef.current;
    if (
      pendingOwner &&
      ack.previewSessionId === pendingOwner.previewSessionId &&
      ack.revision === pendingOwner.revision &&
      ack.targetNodeId === pendingOwner.targetNodeId
    ) {
      pendingInlinePreviewOwnerRef.current = null;
      const current = inlineEditorRef.current;
      if (ack.ok && ack.action === "cleared" && current.target?.identity?.nodeId === pendingOwner.targetNodeId) {
        replaceInlineEditor({
          ...current,
          previewOwner: pendingOwner.owner,
          previewAvailable: true,
          message: "Continue editing in the course preview."
        });
        return true;
      }
      replaceInlineEditor({
        ...current,
        previewOwner: "none",
        previewAvailable: false,
        message: "Studio could not clear the display preview. Refresh this page before opening the in-place editor."
      });
      setPreviewFeedback({ message: ack.message, tone: "error", latencyMs: null });
      return false;
    }
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
  }, [closeLivePreview, replaceInlineEditor]);

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
    inlineEditor,
    hasLivePreview: previewCommand?.action === "render" || (
      ["parent-inline", "standalone-inline"].includes(inlineEditor.previewOwner) &&
      inlineEditor.status !== "detached" &&
      Boolean(inlineEditor.target)
    ),
    hasInteractiveInlinePreview: ["parent-inline", "standalone-inline"].includes(inlineEditor.previewOwner) && inlineEditor.status !== "detached" && Boolean(inlineEditor.target),
    resolveSelection,
    previewTargetPatch,
    closeLivePreview,
    acknowledgePreview,
    saveTarget,
    editDraft,
    patchDraft,
    reopenDraft,
    rebindDraft,
    removeDraft,
    reorderDraft,
    apply,
    undo,
    exportDrafts,
    importDrafts,
    uploadImage,
    renameCourse,
    beginInlineEditor,
    setInlineEditorText,
    setInlinePreviewOwner,
    setInlinePreviewAvailable,
    attachInlineEditorToPreview,
    flushInlineEditor,
    revalidateInlineEditor,
    saveInlineEditor,
    activateInlineDraft,
    reopenInlineEditor,
    rebaseInlineEditor,
    copyInlineEditorText,
    clearInlineEditor,
    clearSelection,
    refreshStatus
  }), [acknowledgePreview, activateInlineDraft, apply, attachInlineEditorToPreview, beginInlineEditor, busy, clearInlineEditor, clearSelection, closeLivePreview, copyInlineEditorText, drafts, editDraft, enabled, exportDrafts, feedback, flushInlineEditor, importDrafts, inlineEditor, patchDraft, previewCommand, previewFeedback, previewTargetPatch, rebaseInlineEditor, refreshStatus, removeDraft, renameCourse, reopenDraft, reopenInlineEditor, rebindDraft, reorderDraft, revalidateInlineEditor, resolveSelection, resolving, saveInlineEditor, saveTarget, setInlineEditorText, setInlinePreviewAvailable, setInlinePreviewOwner, status, target, undo, uploadImage]);
}
