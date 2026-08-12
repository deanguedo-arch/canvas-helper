import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  COURSE_EDIT_MAX_DRAFTS,
  COURSE_EDIT_SCHEMA_VERSION,
  isCourseEditDraft,
  type CourseEditBatchResult,
  type CourseEditDraft,
  type CourseEditPatch,
  type CourseEditResolveRequest,
  type CourseEditStatus,
  type CourseEditTarget
} from "../../../shared/course-editing.js";
import { loadCourseEditDrafts, saveCourseEditDrafts } from "../lib/course-edit-storage";

type CourseEditFeedbackTone = "neutral" | "progress" | "success" | "warning" | "error";

const EMPTY_STATUS: CourseEditStatus = {
  projectSlug: "",
  available: false,
  unavailableReason: "Select a course to start editing.",
  canUndo: false,
  checkpointId: null,
  exportsOutOfDate: false,
  staleExportTargets: [],
  lastAppliedAt: null
};

function draftId() {
  if (typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
  return `edit-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
  const [drafts, setDrafts] = useState<CourseEditDraft[]>(() => loadCourseEditDrafts(projectSlug));
  const [status, setStatus] = useState<CourseEditStatus>({ ...EMPTY_STATUS, projectSlug });
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; tone: CourseEditFeedbackTone }>({ message: "", tone: "neutral" });
  const resolveAbortRef = useRef<AbortController | null>(null);
  const activeProjectRef = useRef(projectSlug);
  const draftsRef = useRef(drafts);
  draftsRef.current = drafts;

  const replaceDrafts = useCallback((next: CourseEditDraft[]) => {
    const bounded = next.filter(isCourseEditDraft).slice(0, COURSE_EDIT_MAX_DRAFTS);
    draftsRef.current = bounded;
    setDrafts(bounded);
    const stored = saveCourseEditDrafts(activeProjectRef.current, bounded);
    if (!stored && bounded.length) setFeedback({ message: "Drafts are available in this tab, but browser storage is unavailable.", tone: "warning" });
  }, []);

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
    activeProjectRef.current = projectSlug;
    setEnabled(false);
    setTarget(null);
    setResolving(false);
    const stored = loadCourseEditDrafts(projectSlug);
    draftsRef.current = stored;
    setDrafts(stored);
    setStatus({ ...EMPTY_STATUS, projectSlug });
    setFeedback({ message: stored.length ? `${stored.length} draft ${stored.length === 1 ? "change" : "changes"} restored for this course.` : "", tone: stored.length ? "success" : "neutral" });
    void refreshStatus(projectSlug);
  }, [projectSlug, refreshStatus]);

  useEffect(() => () => resolveAbortRef.current?.abort(), []);

  const resolveSelection = useCallback(async (request: CourseEditResolveRequest) => {
    const slug = activeProjectRef.current;
    if (!slug || request.projectSlug !== slug) return null;
    resolveAbortRef.current?.abort();
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
  }, []);

  const saveTarget = useCallback((patch: CourseEditPatch) => {
    if (busy) {
      setFeedback({ message: "Wait for the current course edit to finish.", tone: "warning" });
      return false;
    }
    const current = target;
    if (!current?.identity || current.eligibility !== "editable") return false;
    const now = Date.now();
    const existing = draftsRef.current.find((draft) => draft.identity.targetId === current.identity?.targetId);
    const next: CourseEditDraft = {
      id: existing?.id ?? draftId(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      identity: current.identity,
      beforeText: current.originalText,
      afterText: courseEditPatchText(current, patch),
      patch
    };
    const without = draftsRef.current.filter((draft) => draft.identity.targetId !== current.identity?.targetId);
    if (!existing && without.length >= COURSE_EDIT_MAX_DRAFTS) {
      setFeedback({ message: `Apply or remove a draft before adding more than ${COURSE_EDIT_MAX_DRAFTS}.`, tone: "warning" });
      return false;
    }
    replaceDrafts(existing
      ? draftsRef.current.map((draft) => draft.id === existing.id ? next : draft)
      : [...without, next]);
    setTarget(null);
    setFeedback({ message: existing ? "Draft updated." : "Draft saved. The course has not changed yet.", tone: "success" });
    return true;
  }, [busy, replaceDrafts, target]);

  const editDraft = useCallback((draft: CourseEditDraft) => {
    if (busy) return;
    const existing = draftsRef.current.find((entry) => entry.id === draft.id);
    if (!existing || draft.identity.projectSlug !== activeProjectRef.current) return;
    replaceDrafts(draftsRef.current.map((entry) => entry.id === draft.id ? { ...draft, updatedAt: Date.now() } : entry));
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
    setBusy(true);
    setFeedback({ message: "Applying, rebuilding, and checking this course…", tone: "progress" });
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(slug)}/course-edits/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemaVersion: COURSE_EDIT_SCHEMA_VERSION, projectSlug: slug, drafts: currentDrafts })
      });
      const result = await responseJson<CourseEditBatchResult>(response, "Studio could not apply these changes.");
      if (activeProjectRef.current !== slug) return false;
      const submittedIds = new Set(currentDrafts.map((draft) => draft.id));
      replaceDrafts(draftsRef.current.filter((draft) => !submittedIds.has(draft.id)));
      setTarget(null);
      setStatus(result);
      setFeedback({ message: result.message, tone: "success" });
      await onApplied();
      return true;
    } catch (error) {
      setFeedback({ message: error instanceof Error ? error.message : "Studio could not apply these changes.", tone: "error" });
      return false;
    } finally {
      setBusy(false);
    }
  }, [busy, onApplied, replaceDrafts]);

  const undo = useCallback(async () => {
    const slug = activeProjectRef.current;
    if (!slug || busy) return false;
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
      setFeedback({ message: error instanceof Error ? error.message : "Studio could not undo the last batch.", tone: "error" });
      return false;
    } finally {
      setBusy(false);
    }
  }, [busy, onApplied]);

  const clearSelection = useCallback(() => {
    resolveAbortRef.current?.abort();
    setTarget(null);
    setResolving(false);
  }, []);

  return useMemo(() => ({
    enabled,
    setEnabled,
    target,
    resolving,
    drafts,
    status,
    busy,
    feedback,
    resolveSelection,
    saveTarget,
    editDraft,
    patchDraft,
    removeDraft,
    reorderDraft,
    apply,
    undo,
    clearSelection,
    refreshStatus
  }), [apply, busy, clearSelection, drafts, editDraft, enabled, feedback, patchDraft, refreshStatus, removeDraft, reorderDraft, resolveSelection, resolving, saveTarget, status, target, undo]);
}
