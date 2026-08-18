import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

import { CommandToolbar } from "./components/CommandToolbar";
import { AnnotationModeBar } from "./components/AnnotationModeBar";
import { EditModeBar } from "./components/EditModeBar";
import { CourseToolbar } from "./components/CourseToolbar";
import { InspectorPanel } from "./components/InspectorPanel";
import { NewProjectPanel } from "./components/NewProjectPanel";
import { PreviewPane } from "./components/PreviewPane";
import { ReferencePicker } from "./components/ReferencePicker";
import { AssessmentLibraryMode } from "./components/AssessmentLibraryMode";
import { Topbar } from "./components/Topbar";
import { WhatsNewPanel } from "./components/WhatsNewPanel";
import { WorkspacePicker } from "./components/WorkspacePicker";
import { useLayoutPreferences } from "./hooks/useLayoutPreferences";
import { useInspectionDraft } from "./hooks/useInspectionDraft";
import { useCourseEditing } from "./hooks/useCourseEditing";
import { usePreviewScrollSync } from "./hooks/usePreviewScrollSync";
import { usePreviewRuntime } from "./hooks/usePreviewRuntime";
import { usePreviewRecovery } from "./hooks/usePreviewRecovery";
import { useProjectCommands } from "./hooks/useProjectCommands";
import { useProjectLibrary } from "./hooks/useProjectLibrary";
import { useProjects } from "./hooks/useProjects";
import { useReferenceTarget } from "./hooks/useReferenceTarget";
import { useStudioSelection } from "./hooks/useStudioSelection";
import {
  normalizeZoom,
  previewModes,
  type PreviewMode
} from "./lib/types";
import { getTargetKey, toPreviewUrl, toReferenceResourcePreviewUrl } from "./lib/preview-urls";
import { buildPreviewIssuePacket } from "./lib/preview-recovery";
import {
  reviewWorkbench,
  REVIEW_SET_LABEL_MAX_BYTES,
  REVIEW_SET_MAX_ITEMS,
  REVIEW_SET_MAX_SESSIONS,
  REVIEW_SET_NOTE_MAX_BYTES,
  type ReviewSetPriority,
  type HydratedReviewSet,
  type OwnedReviewScreenshotPath,
  type PreparedReviewSetPacket,
  type ReviewSetHandoffDetail,
  type ReviewSetItem,
  type ReviewScreenshotOwner,
  type ReviewSetScreenshot,
  type ReviewSetSessionSummary,
  type ScreenshotDraft,
  useScreenshotAnnotation
} from "./lib/review-workbench";
import { loadWorkspacePageSelections, saveWorkspacePageSelection } from "./lib/storage";
import { hasSamePreviewPageRoute, preserveVisualSelection } from "./lib/current-preview-selection";
import {
  INSPECTION_ISSUE_CATEGORIES,
  REVIEW_SCREENSHOT_MAX_PER_ITEM,
  type InspectionIssueCategory,
  type InspectionResolution,
  type InspectionResolveRequest,
  type InspectionSelection
} from "../../shared/inspection.js";
import { PREVIEW_BRIDGE_VERSION } from "../../shared/preview-bridge.js";
import type {
  PreviewInspectPayload,
  PreviewCourseEditAction,
  PreviewCourseEditActionResult,
  PreviewCourseEditState,
  PreviewInlineEditorAction,
  PreviewInlineEditorCommand,
  PreviewReviewAction,
  PreviewReviewActionResult,
  PreviewReviewState
} from "../../shared/preview-bridge.js";
import { STUDIO_BRIDGE_LIMITS, STUDIO_REVIEW_LIMITS } from "../../shared/studio-quality.js";
import type { CourseEditDraft } from "../../shared/course-editing.js";

const {
  items: {
    create: createReviewSetItem,
    identity: reviewSetItemIdentity,
    hasSameMaterialResolution
  },
  packet: {
    build: buildReviewSetPacket,
    cycle: reviewSetHandoffCycle,
    items: reviewSetHandoffItems
  },
  storage: {
    createBackup: createReviewSetBackup,
    createSessionId: createReviewSetSessionId,
    delete: deleteStoredReviewSet,
    list: listStoredReviewSets,
    load: loadStoredReviewSet,
    parseBackup: parseReviewSetBackup,
    save: saveStoredReviewSet
  },
  screenshots: {
    createSessionId: createReviewScreenshotSessionId,
    deletePaths: deleteReviewScreenshotPaths,
    imageUrl: reviewScreenshotImageUrl,
    persist: persistReviewScreenshot,
    replace: replaceReviewScreenshot,
    verify: verifyReviewScreenshots
  },
  capture: {
    capture: capturePreviewScreenshot,
    crop: cropScreenshotPng,
    releaseDraft: releaseScreenshotDraft
  },
  text: { byteLength: utf8ByteLength }
} = reviewWorkbench;

function reviewSetItemEditLocked(item: ReviewSetItem | undefined) {
  return item?.handoffState === "sent" || item?.handoffState === "accepted";
}

async function resolveInspectionRequest(request: InspectionResolveRequest, signal?: AbortSignal) {
  const response = await fetch("/api/inspection/resolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal
  });
  const payload = (await response.json().catch(() => ({}))) as InspectionResolution & { error?: string };
  if (!response.ok || !payload.resolution) {
    throw new Error(payload.error || "Canvas Helper could not resolve the selected element.");
  }
  return payload;
}

function createPreviewCapabilityToken() {
  if (typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return Array.from(window.crypto.getRandomValues(new Uint32Array(4)), (value) => value.toString(16).padStart(8, "0")).join("");
}

async function persistScreenshotDrafts(input: {
  sessionId: string;
  projectSlug: string;
  itemId: string;
  ownerNodeId: string;
  drafts: ScreenshotDraft[];
}) {
  const screenshots: ReviewSetScreenshot[] = [];
  const owner: ReviewScreenshotOwner = {
    sessionId: input.sessionId,
    projectSlug: input.projectSlug,
    itemId: input.itemId,
    ownerNodeId: input.ownerNodeId
  };
  try {
    for (const draft of input.drafts) {
      const persisted = await persistReviewScreenshot({
        ...owner,
        screenshotId: draft.id,
        png: draft.png
      });
      screenshots.push({
        id: draft.id,
        imageUrl: reviewScreenshotImageUrl(persisted.path, owner),
        filePath: persisted.path,
        byteLength: persisted.byteLength,
        width: persisted.width,
        height: persisted.height,
        ownerNodeId: input.ownerNodeId,
        cropped: draft.cropped
      });
    }
    return screenshots;
  } catch (error) {
    await deleteReviewScreenshotPaths(screenshots.map((screenshot) => ({
      ...owner,
      repoRelativePath: screenshot.filePath
    }))).catch(() => undefined);
    throw error;
  }
}

function ownedScreenshotPaths(
  sessionId: string,
  item: Pick<ReviewSetItem, "id" | "request" | "screenshots">,
  screenshots = item.screenshots
): OwnedReviewScreenshotPath[] {
  const ownerNodeId = item.request.selection.nodeId;
  if (!ownerNodeId) return [];
  return screenshots.map((screenshot) => ({
    repoRelativePath: screenshot.filePath,
    sessionId,
    projectSlug: item.request.projectSlug,
    itemId: item.id,
    ownerNodeId: screenshot.ownerNodeId || ownerNodeId
  }));
}

async function verifyOwnedReviewScreenshots(sessionId: string, item: ReviewSetItem) {
  if (!item.screenshots.length) return [];
  const verified = await Promise.all(item.screenshots.map(async (screenshot) => {
    const [result] = await verifyReviewScreenshots({
      sessionId,
      projectSlug: item.request.projectSlug,
      itemId: item.id,
      ownerNodeId: screenshot.ownerNodeId,
      paths: [screenshot.filePath]
    });
    return result;
  }));
  return verified;
}

function downloadTextFile(fileName: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

type ReviewFeedbackTone = "neutral" | "progress" | "success" | "warning" | "error";

type ReviewFeedback = {
  sequence: number;
  message: string;
  tone: ReviewFeedbackTone;
};

type ReviewUndo = {
  kind: "save" | "remove";
  item: ReviewSetItem;
  index: number;
  label: string;
};

type ReviewHandoffSnapshot = {
  copyId: string;
  packet: string;
  packetId: string;
  itemIds: string[];
  screenshotCount: number;
  reviewSessionId: string;
  projectSlug: string;
  version: number;
};

const REVIEW_UNDO_WINDOW_MS = 10_000;
const REVIEW_COPY_RESERVATION_TIMEOUT_MS = 30_000;

function defaultFeedbackTone(message: string): ReviewFeedbackTone {
  if (!message) return "neutral";
  if (/could not|failed|blocked|unavailable|no longer|too long/i.test(message)) return "error";
  if (/changed|try again|select .* again|missing/i.test(message)) return "warning";
  if (/captur|saving|getting|preparing|copying|showing/i.test(message)) return "progress";
  if (/saved|ready|added|copied|restored|undone|shown|cleared/i.test(message)) return "success";
  return "neutral";
}

export function App() {
  const {
    projects,
    errorMessage,
    refreshProjects,
    refreshIncoming,
    incomingRefreshRunning,
    incomingRefreshMessage,
    incomingRefreshIsError
  } = useProjects();
  const { selectedSlug, setSelectedSlug, previewMode, setPreviewMode } = useStudioSelection(projects);
  const { favoriteSlugs, recentSlugs, toggleFavorite } = useProjectLibrary(selectedSlug);
  const { layoutPreferences, setLayoutPreferences, paneControlsVisible, setPaneControlsVisible } =
    useLayoutPreferences(selectedSlug);
  const { previewOrigin, previewError, previewStatus, retryPreview } = usePreviewRuntime();
  const previewCapabilityTokensRef = useRef(new Map<string, string>());
  const previewCapabilityFor = useCallback((scope: string) => {
    const key = `${previewOrigin}:${scope}`;
    const existing = previewCapabilityTokensRef.current.get(key);
    if (existing) return existing;
    const created = createPreviewCapabilityToken();
    previewCapabilityTokensRef.current.set(key, created);
    return created;
  }, [previewOrigin]);
  const { referenceTarget, setReferenceTarget, resolvedReference, selectedResourceExtractedPath } =
    useReferenceTarget(projects, selectedSlug);
  const {
    commandStatus,
    commandLog,
    commandBanner,
    commandBannerIsError,
    commandOutputVisible,
    setCommandOutputVisible,
    anyCommandRunning,
    runProjectCommand
  } = useProjectCommands({
    selectedSlug,
    refreshProjects
  });

  const [workspaceHtmlSelections, setWorkspaceHtmlSelections] = useState<Record<string, string>>(loadWorkspacePageSelections);
  const [studioMode, setStudioMode] = useState<"course" | "assessment">("course");
  const [toolsOpen, setToolsOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  const whatsNewTriggerRef = useRef<HTMLElement | null>(null);
  const [inspectEnabled, setInspectEnabled] = useState(false);
  const [selectionMode, setSelectionMode] = useState<"off" | "annotate" | "edit">("off");
  const [standaloneSelectedEditDraftId, setStandaloneSelectedEditDraftId] = useState("");
  const inspectionDraft = useInspectionDraft(previewMode);
  const {
    resolution: inspectionResolution,
    request: inspectionRequest,
    resolving: inspectionResolving,
    teacherNote: inspectionTeacherNote,
    issueCategory: inspectionIssueCategory,
    previewMode: inspectionPreviewMode,
    setTeacherNote: setInspectionTeacherNote,
    setIssueCategory: setInspectionIssueCategory
  } = inspectionDraft;
  const screenshotAnnotation = useScreenshotAnnotation();
  const [initialReviewSet] = useState(() => selectedSlug ? loadStoredReviewSet(selectedSlug) : null);
  const [reviewSetItems, setReviewSetItems] = useState<ReviewSetItem[]>(() => initialReviewSet?.items ?? []);
  const reviewSetItemsRef = useRef<ReviewSetItem[]>(initialReviewSet?.items ?? []);
  const activeReviewProjectSlugRef = useRef(selectedSlug);
  const reviewSessionIdRef = useRef(initialReviewSet?.reviewSessionId || createReviewSetSessionId());
  const reviewSessionNameRef = useRef(initialReviewSet?.name || "Review 1");
  const [reviewSessionName, setReviewSessionName] = useState(reviewSessionNameRef.current);
  const [reviewSessions, setReviewSessions] = useState<ReviewSetSessionSummary[]>(() => initialReviewSet?.sessions ?? [{
    id: reviewSessionIdRef.current,
    name: reviewSessionNameRef.current,
    updatedAt: Date.now(),
    itemCount: initialReviewSet?.items.length ?? 0,
    screenshotCount: initialReviewSet?.items.reduce((count, item) => count + item.screenshots.length, 0) ?? 0,
    active: true
  }]);
  const reviewSetVersionRef = useRef(0);
  const reviewSetPreparationAbortRef = useRef<AbortController | null>(null);
  const reviewSetPreparingRef = useRef(false);
  const reviewSetItemIdRef = useRef(0);
  const reviewScreenshotSessionIdRef = useRef(initialReviewSet?.sessionId ?? "");
  if (!reviewScreenshotSessionIdRef.current) {
    reviewScreenshotSessionIdRef.current = createReviewScreenshotSessionId();
  }
  const reviewFeedbackSequenceRef = useRef(0);
  const [reviewFeedback, setReviewFeedback] = useState<ReviewFeedback>(() => ({
    sequence: 0,
    message: initialReviewSet?.items.length ? "Review Set restored." : "",
    tone: initialReviewSet?.items.length ? "success" : "neutral"
  }));
  const [reviewSetSaving, setReviewSetSaving] = useState(false);
  const reviewSetSavingRef = useRef(false);
  const [reviewSetPreparing, setReviewSetPreparing] = useState(false);
  const [preparedReviewSet, setPreparedReviewSet] = useState<PreparedReviewSetPacket | null>(null);
  const preparedReviewSetRef = useRef<PreparedReviewSetPacket | null>(null);
  const reviewSetPacketReadyRef = useRef(false);
  const [reviewSetHandoffDetail, setReviewSetHandoffDetail] = useState<ReviewSetHandoffDetail>("compact");
  const [reviewSetPacketError, setReviewSetPacketError] = useState("");
  const [manualCopySnapshot, setManualCopySnapshot] = useState<ReviewHandoffSnapshot | null>(null);
  const [reviewSetCopying, setReviewSetCopying] = useState(false);
  const reviewSetCopyingRef = useRef(false);
  const reviewCopyReservationRef = useRef<ReviewHandoffSnapshot | null>(null);
  const reviewCopyReservationTimerRef = useRef<number | null>(null);
  const cancelStandaloneReviewCopyRef = useRef<(mode: PreviewMode, copyId: string, message: string) => void>(() => undefined);
  const [reviewSetCaptureItemId, setReviewSetCaptureItemId] = useState("");
  const [reviewSetRelinkItemId, setReviewSetRelinkItemId] = useState("");
  const reviewSetRelinkItemIdRef = useRef("");
  const reviewSetRelinkReadyRef = useRef(false);
  const [reviewSetPersistenceError, setReviewSetPersistenceError] = useState(initialReviewSet?.persistenceError ?? "");
  const reviewCaptureBusyRef = useRef(false);
  const reviewItemCaptureAbortRef = useRef<AbortController | null>(null);
  const [reviewUndo, setReviewUndo] = useState<ReviewUndo | null>(null);
  const reviewUndoRef = useRef<ReviewUndo | null>(null);
  const reviewUndoTimerRef = useRef<number | null>(null);
  const standaloneReviewActionRef = useRef<(mode: PreviewMode, action: PreviewReviewAction) => void>(() => undefined);
  const standaloneCourseEditActionRef = useRef<(mode: PreviewMode, action: PreviewCourseEditAction) => void>(() => undefined);
  const prepareReviewSetRef = useRef<() => void>(() => undefined);
  const focusReviewSetItemRef = useRef<(
    itemId: string,
    source?: "embedded" | "standalone",
    announce?: boolean
  ) => Promise<boolean>>(async () => false);
  const selectedProject = useMemo(
    () => projects.find((project) => project.manifest.slug === selectedSlug) ?? null,
    [projects, selectedSlug]
  );
  const resolvedWorkspaceHtmlPath = useMemo(() => {
    if (!selectedProject) {
      return "index.html";
    }

    const htmlOptions = selectedProject.htmlFiles.workspace;
    const savedSelection = workspaceHtmlSelections[selectedProject.manifest.slug];
    if (savedSelection && htmlOptions.includes(savedSelection)) {
      return savedSelection;
    }

    if (htmlOptions.includes("index.html")) {
      return "index.html";
    }

    return htmlOptions[0] ?? "index.html";
  }, [selectedProject, workspaceHtmlSelections]);

  const workspaceTarget = useMemo(() => {
    if (!selectedProject) {
      return null;
    }

    return {
      projectSlug: selectedProject.manifest.slug,
      root: "workspace" as const,
      htmlPath: resolvedWorkspaceHtmlPath
    };
  }, [resolvedWorkspaceHtmlPath, selectedProject]);
  const courseEditing = useCourseEditing(selectedSlug, async () => {
    resetInspection(true);
    setStandaloneSelectedEditDraftId("");
    await refreshProjects(true);
  });
  const lastEditSelectionRef = useRef<PreviewInspectPayload | null>(null);
  const [inlineEditorSelection, setInlineEditorSelection] = useState<PreviewInspectPayload | null>(null);
  const [inlineTargetEditorSelection, setInlineTargetEditorSelection] = useState<PreviewInspectPayload | null>(null);
  const [standaloneInlineEditorSelection, setStandaloneInlineEditorSelection] = useState<PreviewInspectPayload | null>(null);
  const standaloneInlineCommandStateRef = useRef({ signature: "", revision: 0 });
  const [standaloneInlineCommandRevision, setStandaloneInlineCommandRevision] = useState(0);
  const standaloneInlineInputRevisionsRef = useRef(new Map<string, number>());
  const inlineEditorStateRef = useRef(courseEditing.inlineEditor);
  inlineEditorStateRef.current = courseEditing.inlineEditor;
  const pendingStandaloneInlineTransferRef = useRef<{
    nodeId: string;
    targetId: string;
    attempts: number;
  } | null>(null);
  const standaloneInlineTransferPendingRef = useRef(false);
  const transferInlineEditorToStandaloneRef = useRef<() => void>(() => undefined);
  const reviewScopeRef = useRef({ selectedSlug, workspaceTarget });
  reviewScopeRef.current = { selectedSlug, workspaceTarget };

  const referenceRevision = resolvedReference.project
    ? resolvedReference.target.source === "html"
      ? resolvedReference.target.root === "raw"
        ? resolvedReference.project.revisions.raw
        : resolvedReference.project.revisions.workspace
      : resolvedReference.project.revisions.raw
    : 0;

  const previewSources = useMemo(() => {
    if (!selectedProject || !workspaceTarget || !previewOrigin || typeof window === "undefined") {
      return { reference: "", workspace: "" };
    }
    const isE2E = typeof window !== "undefined" && window.location.search.includes("e2e=1");
    const withE2E = (value: string) => {
      if (!isE2E || !value) return value;
      if (value.includes("e2e=1")) return value;
      const joiner = value.includes("?") ? "&" : "?";
      return `${value}${joiner}e2e=1`;
    };

    const workspaceSrc = withE2E(toPreviewUrl(
      "workspace",
      selectedProject.manifest.slug,
      workspaceTarget.htmlPath,
      selectedProject.revisions.workspace,
      {
        origin: previewOrigin,
        capabilityToken: previewCapabilityFor(`workspace:${selectedProject.manifest.slug}`)
      }
    ));

    const referenceSrc =
      resolvedReference.project && resolvedReference.target.projectSlug
        ? resolvedReference.target.source === "resource"
          ? resolvedReference.target.resourcePath
            ? withE2E(toReferenceResourcePreviewUrl(
                resolvedReference.target.resourceRoot,
                resolvedReference.target.projectSlug,
                resolvedReference.target.resourcePath,
                referenceRevision,
                {
                  origin: previewOrigin,
                  capabilityToken: previewCapabilityFor(
                    `references:${resolvedReference.target.resourceRoot}:${resolvedReference.target.projectSlug}`
                  )
                }
              ))
            : ""
          : withE2E(toPreviewUrl(
              resolvedReference.target.root,
              resolvedReference.target.projectSlug,
              resolvedReference.target.htmlPath,
              referenceRevision,
              {
                origin: previewOrigin,
                capabilityToken: previewCapabilityFor(
                  `${resolvedReference.target.root}:${resolvedReference.target.projectSlug}`
                )
              }
            ))
        : "";

    return { reference: referenceSrc, workspace: workspaceSrc };
  }, [previewCapabilityFor, previewOrigin, referenceRevision, resolvedReference, selectedProject, workspaceTarget]);

  const previewRecovery = usePreviewRecovery({
    previewSources,
    enabled: {
      reference: resolvedReference.target.source === "html",
      workspace: true
    }
  });

  const inspectionContextKey = useMemo(
    () =>
      JSON.stringify({
        selectedSlug,
        previewMode,
        workspaceTarget,
        referenceTarget: resolvedReference.target,
        workspacePreview: previewSources.workspace,
        referencePreview: previewSources.reference
      }),
    [previewMode, previewSources.reference, previewSources.workspace, resolvedReference.target, selectedSlug, workspaceTarget]
  );
  const screenshotClearRef = useRef(screenshotAnnotation.clear);
  screenshotClearRef.current = screenshotAnnotation.clear;

  const setReviewSetStatus = useCallback((message: string, tone = defaultFeedbackTone(message)) => {
    const sequence = ++reviewFeedbackSequenceRef.current;
    setReviewFeedback({ sequence, message, tone });
    return sequence;
  }, []);

  const completeReviewSetStatus = useCallback((sequence: number, message: string, tone = defaultFeedbackTone(message)) => {
    if (reviewFeedbackSequenceRef.current !== sequence) return false;
    setReviewFeedback({ sequence, message, tone });
    return true;
  }, []);

  const releaseReviewCopyReservation = useCallback((copyId?: string) => {
    const reservation = reviewCopyReservationRef.current;
    if (copyId && reservation?.copyId !== copyId) return false;
    if (reviewCopyReservationTimerRef.current !== null) {
      window.clearTimeout(reviewCopyReservationTimerRef.current);
      reviewCopyReservationTimerRef.current = null;
    }
    reviewCopyReservationRef.current = null;
    reviewSetCopyingRef.current = false;
    setReviewSetCopying(false);
    return Boolean(reservation);
  }, []);

  const reserveReviewCopy = useCallback((snapshot: ReviewHandoffSnapshot) => {
    if (reviewSetSavingRef.current || reviewSetPreparingRef.current || reviewSetCopyingRef.current || reviewCopyReservationRef.current) return false;
    const currentPacket = preparedReviewSetRef.current;
    const currentIds = reviewSetHandoffItems(reviewSetItemsRef.current).map((item) => item.id);
    if (
      !currentPacket ||
      !reviewSetPacketReadyRef.current ||
      snapshot.reviewSessionId !== reviewSessionIdRef.current ||
      snapshot.projectSlug !== activeReviewProjectSlugRef.current ||
      snapshot.version !== reviewSetVersionRef.current ||
      currentPacket.itemIds.join("\u001f") !== currentIds.join("\u001f") ||
      currentPacket.itemIds.join("\u001f") !== snapshot.itemIds.join("\u001f") ||
      currentPacket.packetId !== snapshot.packetId
    ) return false;
    reviewCopyReservationRef.current = snapshot;
    reviewSetCopyingRef.current = true;
    setReviewSetCopying(true);
    reviewCopyReservationTimerRef.current = window.setTimeout(() => {
      if (reviewCopyReservationRef.current?.copyId !== snapshot.copyId) return;
      releaseReviewCopyReservation(snapshot.copyId);
      const message = "The Review Set copy timed out. Nothing was marked sent; try copying again.";
      cancelStandaloneReviewCopyRef.current("workspace", snapshot.copyId, message);
      setReviewSetStatus(message, "warning");
    }, REVIEW_COPY_RESERVATION_TIMEOUT_MS);
    return true;
  }, [releaseReviewCopyReservation, setReviewSetStatus]);

  const blockReviewMutationDuringCapture = useCallback(() => {
    if (reviewSetCopyingRef.current) {
      setReviewSetStatus("Wait for the Review Set copy to finish before changing this review.", "warning");
      return true;
    }
    if (reviewSetSavingRef.current) {
      setReviewSetStatus("Wait for the annotation to finish saving before changing this review.", "warning");
      return true;
    }
    if (!reviewCaptureBusyRef.current) return false;
    setReviewSetStatus("Finish or cancel the screenshot before changing this review.", "warning");
    return true;
  }, [setReviewSetStatus]);

  const replaceReviewSetItems = useCallback((nextItems: ReviewSetItem[]) => {
    reviewSetItemsRef.current = nextItems;
    setReviewSetItems(nextItems);
    const activeProjectSlug = activeReviewProjectSlugRef.current;
    if (!activeProjectSlug) return;
    const persisted = saveStoredReviewSet(
      activeProjectSlug,
      reviewSessionIdRef.current,
      reviewSessionNameRef.current,
      reviewScreenshotSessionIdRef.current,
      nextItems
    );
    setReviewSetPersistenceError(persisted ? "" : "This Review Set is still open, but Canvas Helper could not keep it across a reload.");
    if (persisted) setReviewSessions(listStoredReviewSets(activeProjectSlug));
  }, []);

  const invalidateReviewSetPreparation = useCallback(() => {
    reviewSetVersionRef.current += 1;
    reviewSetPreparationAbortRef.current?.abort();
    reviewSetPreparationAbortRef.current = null;
    setReviewSetPreparing(false);
    reviewSetPreparingRef.current = false;
    setPreparedReviewSet(null);
    preparedReviewSetRef.current = null;
    reviewSetPacketReadyRef.current = false;
    setReviewSetPacketError("");
    setManualCopySnapshot(null);
  }, []);

  const reclaimReviewScreenshotPaths = useCallback((screenshots: OwnedReviewScreenshotPath[]) => {
    if (!screenshots.length) return;
    void deleteReviewScreenshotPaths(screenshots).catch(() => {
      setReviewSetPersistenceError("Removed screenshots are hidden now and will be reclaimed by the local seven-day cleanup.");
    });
  }, []);

  const disposeReviewUndo = useCallback((reclaimRemoved = true) => {
    if (reviewUndoTimerRef.current !== null) {
      window.clearTimeout(reviewUndoTimerRef.current);
      reviewUndoTimerRef.current = null;
    }
    const current = reviewUndoRef.current;
    if (reclaimRemoved && current?.kind === "remove") {
      reclaimReviewScreenshotPaths(ownedScreenshotPaths(reviewScreenshotSessionIdRef.current, current.item));
    }
    reviewUndoRef.current = null;
    setReviewUndo(null);
  }, [reclaimReviewScreenshotPaths]);

  const armReviewUndo = useCallback((undo: ReviewUndo) => {
    disposeReviewUndo(true);
    reviewUndoRef.current = undo;
    setReviewUndo(undo);
    reviewUndoTimerRef.current = window.setTimeout(() => {
      if (reviewUndoRef.current !== undo) return;
      if (undo.kind === "remove") {
        reclaimReviewScreenshotPaths(ownedScreenshotPaths(reviewScreenshotSessionIdRef.current, undo.item));
      }
      reviewUndoRef.current = null;
      reviewUndoTimerRef.current = null;
      setReviewUndo(null);
    }, REVIEW_UNDO_WINDOW_MS);
  }, [disposeReviewUndo, reclaimReviewScreenshotPaths]);

  const clearReviewSet = useCallback(
    (status = "") => {
      if (blockReviewMutationDuringCapture()) return;
      if (reviewSetItemsRef.current.some((item) => reviewSetItemEditLocked(item))) {
        setReviewSetStatus("Accept or reopen every sent change before clearing this review.", "warning");
        return;
      }
      disposeReviewUndo(true);
      invalidateReviewSetPreparation();
      reclaimReviewScreenshotPaths(
        reviewSetItemsRef.current.flatMap((item) => ownedScreenshotPaths(reviewScreenshotSessionIdRef.current, item))
      );
      replaceReviewSetItems([]);
      setReviewSetCaptureItemId("");
      reviewSetRelinkItemIdRef.current = "";
      setReviewSetRelinkItemId("");
      setReviewSetStatus(status);
    },
    [blockReviewMutationDuringCapture, disposeReviewUndo, invalidateReviewSetPreparation, reclaimReviewScreenshotPaths, replaceReviewSetItems, setReviewSetStatus]
  );

  useEffect(() => () => {
    reviewSetPreparationAbortRef.current?.abort();
    reviewItemCaptureAbortRef.current?.abort();
    if (reviewUndoTimerRef.current !== null) window.clearTimeout(reviewUndoTimerRef.current);
    const pendingUndo = reviewUndoRef.current;
    if (pendingUndo?.kind === "remove") {
      reclaimReviewScreenshotPaths(ownedScreenshotPaths(reviewScreenshotSessionIdRef.current, pendingUndo.item));
    }
  }, [reclaimReviewScreenshotPaths]);

  const resetInspection = useCallback(
    (resetTeacherInput = false) => {
      inspectionDraft.reset(previewMode, resetTeacherInput);
      screenshotClearRef.current();
    },
    [inspectionDraft.reset, previewMode]
  );

  useEffect(() => {
    if (activeReviewProjectSlugRef.current === selectedSlug) return;
    disposeReviewUndo(true);
    reviewSetPreparationAbortRef.current?.abort();
    reviewSetPreparationAbortRef.current = null;
    reviewItemCaptureAbortRef.current?.abort();
    reviewItemCaptureAbortRef.current = null;
    reviewCaptureBusyRef.current = false;
    reviewSetSavingRef.current = false;
    releaseReviewCopyReservation();
    setReviewSetSaving(false);
    reviewSetPreparingRef.current = false;
    setReviewSetPreparing(false);
    setPreparedReviewSet(null);
    preparedReviewSetRef.current = null;
    reviewSetPacketReadyRef.current = false;
    setReviewSetPacketError("");
    setManualCopySnapshot(null);
    setReviewSetCaptureItemId("");
    reviewSetRelinkItemIdRef.current = "";
    setReviewSetRelinkItemId("");
    screenshotClearRef.current();

    activeReviewProjectSlugRef.current = selectedSlug;
    const stored = selectedSlug ? loadStoredReviewSet(selectedSlug) : null;
    reviewSessionIdRef.current = stored?.reviewSessionId || createReviewSetSessionId();
    reviewSessionNameRef.current = stored?.name || "Review 1";
    reviewScreenshotSessionIdRef.current = stored?.sessionId || createReviewScreenshotSessionId();
    reviewSetItemsRef.current = stored?.items ?? [];
    setReviewSetItems(stored?.items ?? []);
    setReviewSessionName(reviewSessionNameRef.current);
    setReviewSessions(stored?.sessions ?? [{
      id: reviewSessionIdRef.current,
      name: reviewSessionNameRef.current,
      updatedAt: Date.now(),
      itemCount: 0,
      screenshotCount: 0,
      active: true
    }]);
    setReviewSetPersistenceError(stored?.persistenceError ?? "");
    setReviewSetStatus(stored?.items.length ? "Review Set restored for this course." : "");
  }, [disposeReviewUndo, releaseReviewCopyReservation, selectedSlug, setReviewSetStatus]);

  useEffect(() => {
    lastEditSelectionRef.current = null;
    setInlineEditorSelection(null);
    setInlineTargetEditorSelection(null);
    setStandaloneInlineEditorSelection(null);
    resetInspection(true);
  }, [inspectionContextKey, resetInspection]);

  useEffect(() => () => {
    if (reviewCopyReservationTimerRef.current !== null) {
      window.clearTimeout(reviewCopyReservationTimerRef.current);
    }
  }, []);

  const resolveInspection = async (
    mode: PreviewMode,
    selection: PreviewInspectPayload,
    source: "embedded" | "standalone",
    requestedMode: "off" | "annotate" | "edit" = selectionMode
  ) => {
    if (requestedMode === "edit") {
      if (mode !== "workspace" || !workspaceTarget?.projectSlug || !selection.nodeId) {
        courseEditing.clearSelection();
        setInlineEditorSelection(null);
        setInlineTargetEditorSelection(null);
        return;
      }
      lastEditSelectionRef.current = selection;
      setStandaloneSelectedEditDraftId("");
      setInlineTargetEditorSelection(null);
      setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
      const resolved = await courseEditing.resolveSelection({
        projectSlug: workspaceTarget.projectSlug,
        root: "workspace",
        htmlPath: workspaceTarget.htmlPath,
        selection
      });
      const beganInlineEditor = Boolean(
        resolved?.eligibility === "editable" &&
        courseEditing.beginInlineEditor(resolved, source === "standalone" ? "standalone-inline" : "parent-inline")
      );
      if (beganInlineEditor) {
        if (source === "standalone") {
          setInlineEditorSelection(null);
          setInlineTargetEditorSelection(null);
          setStandaloneInlineEditorSelection(selection);
        } else {
          setStandaloneInlineEditorSelection(null);
          setInlineEditorSelection(selection);
        }
      } else if (resolved?.eligibility === "editable" && source === "embedded") {
        // A caret is only appropriate for source-safe plain text. For every
        // other editable capability, anchor the shared Studio composer to the
        // element itself instead of leaving a green outline panel-only.
        setInlineEditorSelection(null);
        setStandaloneInlineEditorSelection(null);
        setInlineTargetEditorSelection(selection);
      } else {
        setInlineEditorSelection(null);
        setInlineTargetEditorSelection(null);
      }
      return resolved;
    }
    if (requestedMode !== "annotate") return;
    const inspectionRun = inspectionDraft.begin(mode, source, selection);
    const requestScopeVersion = inspectionRun.scopeVersion;
    const isCurrentRequest = inspectionRun.isCurrent;
    const target = mode === "workspace" ? workspaceTarget : resolvedReference.target;
    const selectionPayload: InspectionSelection = selection;
    screenshotAnnotation.clear();
    setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));

    if (!target?.projectSlug || (mode === "reference" && resolvedReference.target.source !== "html")) {
      if (!isCurrentRequest()) {
        return;
      }
      const unsupportedResolution: InspectionResolution = {
        projectSlug: target?.projectSlug || selectedSlug,
        previewPath: "reference resource",
        selection: selectionPayload,
        resolution: "unknown",
        freshness: "unsupported",
        artifactRole: "reference-only",
        generated: false,
        primaryEditTarget: null,
        primaryEditLine: null,
        sourceExcerpt: null,
        contributors: [],
        rebuildCommand: null,
        validationCommand: null,
        warnings: ["This reference resource can be inspected visually, but it is not a course source edit target."]
      };
      inspectionDraft.commit(requestScopeVersion, null, unsupportedResolution);
      return;
    }

    try {
      const request: InspectionResolveRequest = {
        projectSlug: target.projectSlug,
        root: target.root,
        htmlPath: target.htmlPath,
        selection: selectionPayload
      };
      const payload = await resolveInspectionRequest(request, inspectionRun.signal);
      if (!isCurrentRequest()) {
        return;
      }
      const relinkItemId = reviewSetRelinkReadyRef.current ? reviewSetRelinkItemIdRef.current : "";
      if (relinkItemId) {
        const original = reviewSetItemsRef.current.find((item) => item.id === relinkItemId);
        const identity = reviewSetItemIdentity(request, mode);
        if (
          original &&
          mode === "workspace" &&
          request.root === "workspace" &&
          request.projectSlug === original.request.projectSlug &&
          request.selection.nodeId &&
          identity &&
          identity !== original.identity &&
          payload.freshness !== "stale" &&
          payload.freshness !== "unsupported" &&
          !reviewSetItemsRef.current.some((item) => item.id !== relinkItemId && item.identity === identity)
        ) {
          const relinked = createReviewSetItem({
            id: original.id,
            previewMode: "workspace",
            request,
            resolution: payload,
            issueCategory: original.issueCategory,
            shortLabel: original.shortLabel,
            priority: original.priority,
            anchorState: "ready",
            resolved: false,
            handoffState: original.handoffState === "sent" || original.handoffState === "accepted" ? "reopened" : original.handoffState,
            sentAt: original.sentAt,
            teacherNote: original.teacherNote,
            screenshots: original.screenshots
          });
          invalidateReviewSetPreparation();
          replaceReviewSetItems(reviewSetItemsRef.current.map((item) => item.id === relinkItemId ? relinked : item));
          reviewSetRelinkItemIdRef.current = "";
          reviewSetRelinkReadyRef.current = false;
          setReviewSetRelinkItemId("");
          inspectionDraft.clearResult(requestScopeVersion);
          setReviewSetStatus("Selection relinked. The original note and screenshots were preserved.", "success");
          inspectionRun.performance.cancel();
          return;
        }
        setReviewSetStatus(
          identity && original
            ? "Choose a different current workspace element for this annotation."
            : "Choose a source-mapped workspace element to relink this annotation.",
          "warning"
        );
      }
      inspectionDraft.commit(requestScopeVersion, request, payload);
    } catch (error) {
      if (!isCurrentRequest()) {
        return;
      }
      const unresolvedResolution: InspectionResolution = {
        projectSlug: target.projectSlug,
        previewPath: "unresolved preview",
        selection: selectionPayload,
        resolution: "unknown",
        freshness: "unsupported",
        artifactRole: "unknown",
        generated: false,
        primaryEditTarget: null,
        primaryEditLine: null,
        sourceExcerpt: null,
        contributors: [],
        rebuildCommand: null,
        validationCommand: null,
        warnings: [error instanceof Error ? error.message : "Canvas Helper could not resolve the selected element."]
      };
      const request: InspectionResolveRequest = {
        projectSlug: target.projectSlug,
        root: target.root,
        htmlPath: target.htmlPath,
        selection: selectionPayload
      };
      inspectionDraft.commit(requestScopeVersion, request, unresolvedResolution);
    } finally {
      inspectionDraft.finish(requestScopeVersion);
    }
  };

  const standaloneInlineEditorSignature = useMemo(() => {
    const inline = courseEditing.inlineEditor;
    const identity = inline.target?.identity;
    const selection = standaloneInlineEditorSelection;
    return [
      inline.previewOwner,
      inline.status,
      inline.inlineSessionId,
      identity?.targetId ?? "",
      identity?.nodeId ?? "",
      inline.rawDocument?.text ?? "",
      inline.target?.editor?.allowsLineBreaks ? "1" : "0",
      selection?.nodeId ?? "",
      selection?.geometry.x ?? "",
      selection?.geometry.y ?? "",
      selection?.geometry.width ?? "",
      selection?.geometry.height ?? "",
      selection?.viewport.width ?? "",
      selection?.viewport.height ?? "",
      selection?.presentation?.fontFamily ?? "",
      selection?.presentation?.fontSize ?? "",
      selection?.presentation?.fontWeight ?? "",
      selection?.presentation?.fontStyle ?? "",
      selection?.presentation?.lineHeight ?? "",
      selection?.presentation?.letterSpacing ?? "",
      selection?.presentation?.textAlign ?? "",
      selection?.presentation?.color ?? "",
      selection?.presentation?.whiteSpace ?? ""
    ].join("\u001f");
  }, [courseEditing.inlineEditor, standaloneInlineEditorSelection]);

  useEffect(() => {
    if (standaloneInlineCommandStateRef.current.signature === standaloneInlineEditorSignature) return;
    standaloneInlineCommandStateRef.current = {
      signature: standaloneInlineEditorSignature,
      revision: standaloneInlineCommandStateRef.current.revision + 1
    };
    setStandaloneInlineCommandRevision(standaloneInlineCommandStateRef.current.revision);
  }, [standaloneInlineEditorSignature]);

  const standaloneInlineEditorCommand = useMemo<PreviewInlineEditorCommand>(() => {
    const inline = courseEditing.inlineEditor;
    const identity = inline.target?.identity;
    const selection = standaloneInlineEditorSelection;
    const supportedStatus = ["clean", "editing", "normalizing", "valid", "invalid", "saved"] as const;
    const active = (
      inline.previewOwner === "standalone-inline" &&
      Boolean(identity) &&
      Boolean(inline.inlineSessionId) &&
      Boolean(inline.rawDocument) &&
      Boolean(selection?.presentation) &&
      selection?.nodeId === identity?.nodeId &&
      supportedStatus.includes(inline.status as typeof supportedStatus[number]) &&
      standaloneInlineCommandRevision > 0
    );
    if (!active || !identity || !selection?.presentation || !inline.rawDocument) {
      return {
        schemaVersion: PREVIEW_BRIDGE_VERSION,
        active: false,
        sessionId: "",
        revision: standaloneInlineCommandRevision,
        targetId: "",
        target: null,
        text: "",
        allowsLineBreaks: false,
        status: "clean"
      };
    }
    return {
      schemaVersion: PREVIEW_BRIDGE_VERSION,
      active: true,
      sessionId: inline.inlineSessionId,
      revision: standaloneInlineCommandRevision,
      targetId: identity.targetId,
      target: {
        schemaVersion: PREVIEW_BRIDGE_VERSION,
        targetNodeId: identity.nodeId,
        geometry: selection.geometry,
        viewport: selection.viewport,
        visible: selection.geometry.width > 0 && selection.geometry.height > 0,
        presentation: selection.presentation
      },
      text: inline.rawDocument.text,
      allowsLineBreaks: inline.target?.editor?.allowsLineBreaks ?? false,
      status: inline.status as "clean" | "editing" | "normalizing" | "valid" | "invalid" | "saved"
    };
  }, [courseEditing.inlineEditor, standaloneInlineCommandRevision, standaloneInlineEditorSelection]);

  const {
    registerPreviewFrame,
    attachPreviewPersistence,
    persistAllVisibleScrollPositions,
    copyPreviewModeScrollPosition,
    syncFocusModeScrollPosition,
    fitPreviewToWidth,
    prepareStandalonePreview,
    focusStandalonePreview,
    revokeStandalonePreview,
    retargetStandalonePreview,
    standalonePreviewMatchesTarget,
    requestCurrentInspectionSelection,
    setPreviewInspectMode,
    beginKeyboardPreviewInspection,
    focusPreviewInspectionSelection,
    restorePreviewLocation,
    syncStandaloneReviewSet,
    sendStandaloneReviewActionResult,
    syncStandaloneCourseEditing,
    sendStandaloneCourseEditActionResult,
    refreshStandalonePreview,
    cancelStandaloneReviewCopy
  } = usePreviewScrollSync({
    previewMode,
    layoutPreferences,
    setLayoutPreferences,
    selectedProject,
    workspaceTarget,
    referenceTarget: resolvedReference.target,
    previewOrigin,
    inspectEnabled,
    editEnabled: selectionMode === "edit",
    courseEditPreview: courseEditing.previewCommand,
    standaloneInlineEditor: standaloneInlineEditorCommand,
    onInspectSelection: (mode, selection, source) => void resolveInspection(mode, selection, source),
    onInspectModeChange: (enabled, source) => {
      setInspectEnabled(enabled);
      if (!enabled) {
        setSelectionMode("off");
        courseEditing.setEnabled(false);
      } else if (source === "standalone" && selectionMode !== "edit") {
        setSelectionMode("annotate");
        courseEditing.setEnabled(false);
        courseEditing.clearSelection();
      }
      if (!enabled && source === "embedded") {
        window.requestAnimationFrame(() => {
          document.querySelector<HTMLElement>('[data-testid="inspect-toggle"]')?.focus();
        });
      }
    },
    onPreviewNavigation: (mode, href, source) => {
      if (source === "embedded") previewRecovery.markNavigation(mode, href);
      // Standalone Full Preview has its own navigation lifecycle. Do not let
      // its ready/navigation signal clear an embedded Studio draft.
      if (mode === "workspace" && source === "embedded") {
        courseEditing.clearSelection();
        setInlineEditorSelection(null);
        setInlineTargetEditorSelection(null);
        resetInspection(true);
      }
      if (mode === "workspace" && source === "standalone" && courseEditing.inlineEditor.previewOwner === "standalone-inline") {
        courseEditing.clearSelection();
        setStandaloneInlineEditorSelection(null);
      }
    },
    onPreviewReady: (mode, href, source) => {
      if (source === "embedded") previewRecovery.markBridgeReady(mode, href);
      if (mode === "workspace" && source === "standalone") {
        transferInlineEditorToStandaloneRef.current();
      }
    },
    onPreviewHealth: (mode, health, source) => {
      if (source === "embedded") previewRecovery.markContentHealth(mode, health);
    },
    onPreviewDiagnostic: (mode, diagnostic, source) => {
      if (source === "embedded") previewRecovery.addDiagnostic(mode, diagnostic);
    },
    onPreviewReviewAction: (mode, action) => standaloneReviewActionRef.current(mode, action),
    onPreviewEditAction: (mode, action) => standaloneCourseEditActionRef.current(mode, action),
    onPreviewInlineEditorAction: (mode, action) => {
      if (mode !== "workspace") return;
      const inline = courseEditing.inlineEditor;
      if (
        inline.previewOwner !== "standalone-inline" ||
        inline.status === "detached" ||
        !inline.target?.identity ||
        action.sessionId !== inline.inlineSessionId ||
        action.targetId !== inline.target.identity.targetId
      ) return;
      const lastRevision = standaloneInlineInputRevisionsRef.current.get(action.sessionId) ?? 0;
      if (action.revision <= lastRevision) return;
      standaloneInlineInputRevisionsRef.current.set(action.sessionId, action.revision);
      if (action.action === "input") {
        courseEditing.setInlineEditorText(action.text);
        return;
      }
      if (action.action === "save") {
        void courseEditing.saveInlineEditor();
        return;
      }
      courseEditing.clearInlineEditor();
      setStandaloneInlineEditorSelection(null);
    },
    onCourseEditPreviewAck: (mode, ack, source) => {
      if (mode === "workspace") courseEditing.acknowledgePreview(ack);
    },
    onStandaloneReturn: () => {
      setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
      window.focus();
    }
  });
  cancelStandaloneReviewCopyRef.current = cancelStandaloneReviewCopy;
  const requestCurrentInspectionSelectionRef = useRef(requestCurrentInspectionSelection);
  requestCurrentInspectionSelectionRef.current = requestCurrentInspectionSelection;

  const transferInlineEditorToStandalone = useCallback(() => {
    const pending = pendingStandaloneInlineTransferRef.current;
    const inline = inlineEditorStateRef.current;
    if (
      !pending ||
      standaloneInlineTransferPendingRef.current ||
      inline.status === "detached" ||
      !inline.target?.identity ||
      inline.target.identity.nodeId !== pending.nodeId ||
      inline.target.identity.targetId !== pending.targetId
    ) {
      if (
        pending &&
        (!inline.target?.identity ||
          inline.target.identity.nodeId !== pending.nodeId ||
          inline.target.identity.targetId !== pending.targetId ||
          inline.status === "detached")
      ) {
        pendingStandaloneInlineTransferRef.current = null;
      }
      return;
    }
    if (pending.attempts >= 3) {
      pendingStandaloneInlineTransferRef.current = null;
      return;
    }
    pending.attempts += 1;
    standaloneInlineTransferPendingRef.current = true;
    void requestCurrentInspectionSelectionRef.current("workspace", pending.nodeId, "standalone")
      .then((selection) => {
        const current = inlineEditorStateRef.current;
        if (
          !current.target?.identity ||
          current.status === "detached" ||
          current.target.identity.nodeId !== pending.nodeId ||
          current.target.identity.targetId !== pending.targetId ||
          selection.nodeId !== pending.nodeId
        ) {
          pendingStandaloneInlineTransferRef.current = null;
          return;
        }
        setStandaloneInlineEditorSelection(selection);
        setInlineEditorSelection(null);
        courseEditing.setInlinePreviewOwner("standalone-inline");
        pendingStandaloneInlineTransferRef.current = null;
      })
      .catch(() => {
        // The Full Preview may still be reconnecting. Retrying remains bound
        // to this durable identity and stops after a few bounded attempts.
        window.setTimeout(() => transferInlineEditorToStandaloneRef.current(), 150);
      })
      .finally(() => {
        standaloneInlineTransferPendingRef.current = false;
      });
  }, [courseEditing.setInlinePreviewOwner]);
  transferInlineEditorToStandaloneRef.current = transferInlineEditorToStandalone;

  useEffect(() => {
    const inline = courseEditing.inlineEditor;
    const nodeId = inline.target?.identity?.nodeId ?? "";
    const source = inline.previewOwner === "parent-inline"
      ? "embedded"
      : inline.previewOwner === "standalone-inline"
        ? "standalone"
        : null;
    if (
      !source ||
      inline.status === "detached" ||
      !nodeId
    ) return;
    let disposed = false;
    let requestPending = false;
    const refreshGeometry = () => {
      if (disposed || requestPending) return;
      requestPending = true;
      void requestCurrentInspectionSelectionRef.current("workspace", nodeId, source)
        .then((selection) => {
          if (disposed) return;
          if (selection.nodeId !== nodeId) {
            courseEditing.setInlinePreviewAvailable(false);
            if (source === "standalone") setStandaloneInlineEditorSelection(null);
            else setInlineEditorSelection(null);
            return;
          }
          if (source === "standalone") setStandaloneInlineEditorSelection(selection);
          else setInlineEditorSelection(selection);
        })
        .catch(() => {
          if (!disposed) {
            courseEditing.setInlinePreviewAvailable(false);
            if (source === "standalone") setStandaloneInlineEditorSelection(null);
            else setInlineEditorSelection(null);
          }
        })
        .finally(() => { requestPending = false; });
    };
    refreshGeometry();
    const timer = window.setInterval(refreshGeometry, 160);
    window.addEventListener("resize", refreshGeometry);
    return () => {
      disposed = true;
      window.clearInterval(timer);
      window.removeEventListener("resize", refreshGeometry);
    };
  }, [
    courseEditing.inlineEditor.previewOwner,
    courseEditing.inlineEditor.status,
    courseEditing.inlineEditor.target?.identity?.nodeId,
    courseEditing.setInlinePreviewAvailable
  ]);

  useEffect(() => {
    const inline = courseEditing.inlineEditor;
    if (!inline.target || !["clean", "valid", "saved"].includes(inline.status)) return;
    const timer = window.setInterval(() => { void courseEditing.revalidateInlineEditor(); }, 1_000);
    return () => window.clearInterval(timer);
  }, [
    courseEditing.inlineEditor.status,
    courseEditing.inlineEditor.target?.identity?.targetId,
    courseEditing.revalidateInlineEditor
  ]);

  const annotateLastEditSelection = () => {
    const selection = lastEditSelectionRef.current;
    if (!selection || !workspaceTarget) return;
    setSelectionMode("annotate");
    courseEditing.setEnabled(false);
    courseEditing.clearSelection();
    setStandaloneSelectedEditDraftId("");
    setPreviewInspectMode(true);
    setInspectEnabled(true);
    setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
    void resolveInspection("workspace", selection, "embedded", "annotate");
  };

  const previousWorkspacePreviewSourceRef = useRef(previewSources.workspace);
  useEffect(() => {
    const previous = previousWorkspacePreviewSourceRef.current;
    previousWorkspacePreviewSourceRef.current = previewSources.workspace;
    if (
      !previous ||
      !previewSources.workspace ||
      previous === previewSources.workspace ||
      !workspaceTarget ||
      !standalonePreviewMatchesTarget("workspace", getTargetKey(workspaceTarget))
    ) return;
    refreshStandalonePreview("workspace", previewSources.workspace);
  }, [previewSources.workspace, refreshStandalonePreview, standalonePreviewMatchesTarget, workspaceTarget]);

  const stopAnnotationMode = useCallback(() => {
    if (reviewSetRelinkItemIdRef.current) {
      reviewSetRelinkItemIdRef.current = "";
      setReviewSetRelinkItemId("");
      setReviewSetStatus("Relink canceled.", "neutral");
    }
    setPreviewInspectMode(false);
    setInspectEnabled(false);
    setSelectionMode("off");
    courseEditing.setEnabled(false);
    courseEditing.clearSelection();
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[data-testid="inspect-toggle"]')?.focus();
    });
  }, [courseEditing, setPreviewInspectMode, setReviewSetStatus]);

  useEffect(() => {
    if (!inspectEnabled) {
      return;
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !event.defaultPrevented &&
        !document.querySelector('[role="dialog"][aria-modal="true"]')
      ) {
        stopAnnotationMode();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [inspectEnabled, stopAnnotationMode]);

  const referenceFileOptions = resolvedReference.options.html;
  const referenceResourceOptions = resolvedReference.options.resourcesActive;
  const visiblePreviewModes = layoutPreferences.compareMode ? [...previewModes] : [previewMode];

  const openAnotherPreviewPage = (mode: PreviewMode) => {
    setPaneControlsVisible((current) => ({ ...current, [mode]: true }));
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-testid="${mode}-html-select"]`)?.focus();
    });
  };

  const copyPreviewIssue = async (mode: PreviewMode) => {
    const projectSlug = mode === "workspace"
      ? selectedProject?.manifest.slug ?? selectedSlug
      : resolvedReference.target.projectSlug;
    const pagePath = mode === "workspace"
      ? workspaceTarget?.htmlPath ?? ""
      : resolvedReference.target.source === "html"
        ? resolvedReference.target.htmlPath
        : resolvedReference.target.resourcePath;
    const packet = buildPreviewIssuePacket({
      mode,
      projectSlug,
      pagePath,
      state: previewRecovery.states[mode]
    });
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      throw new Error("Clipboard access is unavailable.");
    }
    await navigator.clipboard.writeText(packet);
  };

  const reviewSetAddAvailability = useMemo(() => {
    if (courseEditing.hasLivePreview) {
      return { canAdd: false, reason: "Reset or save the unapplied live preview before adding review evidence." };
    }
    if (reviewSetCopying) {
      return { canAdd: false, reason: "Copying this Review Set…" };
    }
    if (reviewSetSaving) {
      return { canAdd: false, reason: "Saving this annotation…" };
    }
    if (!inspectionResolution || !inspectionRequest) {
      return { canAdd: false, reason: "Select something in the preview first." };
    }
    if (
      inspectionPreviewMode !== "workspace" ||
      inspectionPreviewMode !== previewMode ||
      inspectionRequest.root !== "workspace" ||
      inspectionRequest.projectSlug !== selectedSlug ||
      inspectionRequest.projectSlug !== inspectionResolution.projectSlug ||
      !inspectionRequest.selection.nodeId ||
      inspectionRequest.selection.nodeId !== inspectionResolution.selection.nodeId
    ) {
      return { canAdd: false, reason: "Only current source-mapped workspace selections can be saved." };
    }
    if (reviewSetItems.length >= REVIEW_SET_MAX_ITEMS) {
      return { canAdd: false, reason: "This Review Set already has its five saved items." };
    }
    const identity = reviewSetItemIdentity(inspectionRequest, inspectionPreviewMode);
    if (!identity || reviewSetItems.some((item) => item.identity === identity)) {
      return { canAdd: false, reason: "This selection is already saved." };
    }
    if (!inspectionTeacherNote.trim()) {
      return { canAdd: false, reason: "Add a note before saving." };
    }
    if (utf8ByteLength(inspectionTeacherNote) > REVIEW_SET_NOTE_MAX_BYTES) {
      return { canAdd: false, reason: `Keep the teacher note to ${REVIEW_SET_NOTE_MAX_BYTES} bytes or fewer.` };
    }
    return { canAdd: true, reason: "" };
  }, [courseEditing.hasLivePreview, inspectionPreviewMode, inspectionRequest, inspectionResolution, inspectionTeacherNote, previewMode, reviewSetCopying, reviewSetItems, reviewSetSaving, selectedSlug]);

  const addCurrentInspectionToReviewSet = async () => {
    if (!reviewSetAddAvailability.canAdd || !inspectionResolution || !inspectionRequest) {
      setReviewSetStatus(reviewSetAddAvailability.reason || "Select a workspace element before saving it to the Review Set.");
      return;
    }

    const inspectionVersion = inspectionDraft.currentScopeVersion();
    const reviewVersion = reviewSetVersionRef.current;
    const itemId = `review-${Date.now()}-${++reviewSetItemIdRef.current}`;
    const capturedDrafts = [...screenshotAnnotation.drafts];
    let savedScreenshots: ReviewSetScreenshot[] = [];
    if (reviewSetSavingRef.current) return;
    reviewSetSavingRef.current = true;
    setReviewSetSaving(true);
    const feedbackSequence = setReviewSetStatus("Saving annotation…", "progress");
    try {
      const currentSelection = await requestCurrentInspectionSelection(
        inspectionPreviewMode,
        inspectionRequest.selection.nodeId as string,
        inspectionDraft.currentSource()
      );
      if (
        currentSelection.nodeId !== inspectionRequest.selection.nodeId ||
        !hasSamePreviewPageRoute(currentSelection.pageHref, inspectionRequest.selection.pageHref)
      ) {
        throw new Error("The course page changed. Select the element again before saving.");
      }
      if (capturedDrafts.length) {
        completeReviewSetStatus(
          feedbackSequence,
          `Saving ${capturedDrafts.length} screenshot${capturedDrafts.length === 1 ? "" : "s"}…`,
          "progress"
        );
        savedScreenshots = await persistScreenshotDrafts({
          sessionId: reviewScreenshotSessionIdRef.current,
          projectSlug: inspectionRequest.projectSlug,
          itemId,
          ownerNodeId: inspectionRequest.selection.nodeId as string,
          drafts: capturedDrafts
        });
      }

      if (!inspectionDraft.isCurrentScope(inspectionVersion) || reviewSetVersionRef.current !== reviewVersion) {
        throw new Error("The selection or Review Set changed while the screenshot was saving. Select it again.");
      }
      const currentItems = reviewSetItemsRef.current;
      const identity = reviewSetItemIdentity(inspectionRequest, inspectionPreviewMode);
      if (!identity || currentItems.some((item) => item.identity === identity) || currentItems.length >= REVIEW_SET_MAX_ITEMS) {
        throw new Error("This selection can no longer be added to the current Review Set.");
      }
      const item = createReviewSetItem({
        id: itemId,
        previewMode: inspectionPreviewMode,
        request: inspectionRequest,
        resolution: inspectionResolution,
        issueCategory: inspectionIssueCategory,
        teacherNote: inspectionTeacherNote,
        screenshots: savedScreenshots
      });
      invalidateReviewSetPreparation();
      replaceReviewSetItems([...currentItems, item]);
      armReviewUndo({ kind: "save", item, index: currentItems.length, label: "Undo save" });
      resetInspection(true);
      completeReviewSetStatus(
        feedbackSequence,
        savedScreenshots.length
          ? `Annotation and ${savedScreenshots.length} screenshot${savedScreenshots.length === 1 ? "" : "s"} saved.`
          : "Annotation saved.",
        "success"
      );
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('[data-testid="review-set"]')?.focus();
      });
    } catch (error) {
      await deleteReviewScreenshotPaths(ownedScreenshotPaths(
        reviewScreenshotSessionIdRef.current,
        { id: itemId, request: inspectionRequest, screenshots: savedScreenshots }
      )).catch(() => undefined);
      completeReviewSetStatus(
        feedbackSequence,
        error instanceof Error ? error.message : "Could not save this inspection.",
        "error"
      );
    } finally {
      reviewSetSavingRef.current = false;
      setReviewSetSaving(false);
    }
  };

  const removeReviewSetItem = (id: string) => {
    if (blockReviewMutationDuringCapture()) return;
    const index = reviewSetItemsRef.current.findIndex((candidate) => candidate.id === id);
    const item = reviewSetItemsRef.current[index];
    if (!item) {
      return;
    }
    if (reviewSetItemEditLocked(item)) {
      setReviewSetStatus("Accept or reopen this sent change before removing it.", "warning");
      return;
    }
    if (reviewSetRelinkItemIdRef.current === id) {
      reviewSetRelinkItemIdRef.current = "";
      setReviewSetRelinkItemId("");
    }
    invalidateReviewSetPreparation();
    replaceReviewSetItems(reviewSetItemsRef.current.filter((candidate) => candidate.id !== id));
    armReviewUndo({ kind: "remove", item, index, label: "Undo remove" });
    setReviewSetStatus("Annotation removed. You can undo this for a few seconds.", "success");
  };

  const undoLastReviewChange = () => {
    if (blockReviewMutationDuringCapture()) return false;
    const undo = reviewUndoRef.current;
    if (!undo) return false;
    disposeReviewUndo(false);
    invalidateReviewSetPreparation();
    if (undo.kind === "save") {
      const saved = reviewSetItemsRef.current.find((item) => item.id === undo.item.id);
      if (!saved) {
        setReviewSetStatus("That saved annotation has already changed and cannot be undone.", "warning");
        return false;
      }
      replaceReviewSetItems(reviewSetItemsRef.current.filter((item) => item.id !== undo.item.id));
      reclaimReviewScreenshotPaths(ownedScreenshotPaths(reviewScreenshotSessionIdRef.current, saved));
      setReviewSetStatus("Saved annotation undone.", "success");
      return true;
    }
    if (
      reviewSetItemsRef.current.length >= REVIEW_SET_MAX_ITEMS ||
      reviewSetItemsRef.current.some((item) => item.id === undo.item.id || item.identity === undo.item.identity)
    ) {
      reclaimReviewScreenshotPaths(ownedScreenshotPaths(reviewScreenshotSessionIdRef.current, undo.item));
      setReviewSetStatus("That annotation can no longer be restored.", "warning");
      return false;
    }
    const nextItems = [...reviewSetItemsRef.current];
    nextItems.splice(Math.min(undo.index, nextItems.length), 0, undo.item);
    replaceReviewSetItems(nextItems);
    setReviewSetStatus("Annotation restored.", "success");
    return true;
  };

  const changeReviewSetTeacherNote = (id: string, teacherNote: string) => {
    if (utf8ByteLength(teacherNote) > REVIEW_SET_NOTE_MAX_BYTES) {
      setReviewSetStatus(`Each saved teacher note must be ${REVIEW_SET_NOTE_MAX_BYTES} bytes or fewer.`);
      return;
    }
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === id);
    if (!item) {
      return;
    }
    if (reviewSetItemEditLocked(item)) {
      setReviewSetStatus("Reopen this change before editing its note.", "warning");
      return;
    }
    invalidateReviewSetPreparation();
    replaceReviewSetItems(
      reviewSetItemsRef.current.map((item) => (item.id === id ? { ...item, teacherNote } : item))
    );
    setReviewSetStatus("");
  };

  const activateReviewSession = (stored: HydratedReviewSet, status: string) => {
    disposeReviewUndo(true);
    invalidateReviewSetPreparation();
    reviewItemCaptureAbortRef.current?.abort();
    reviewItemCaptureAbortRef.current = null;
    reviewCaptureBusyRef.current = false;
    setReviewSetCaptureItemId("");
    reviewSetRelinkItemIdRef.current = "";
    setReviewSetRelinkItemId("");
    reviewSessionIdRef.current = stored.reviewSessionId;
    reviewSessionNameRef.current = stored.name;
    reviewScreenshotSessionIdRef.current = stored.sessionId || reviewScreenshotSessionIdRef.current;
    reviewSetItemsRef.current = stored.items;
    setReviewSetItems(stored.items);
    setReviewSessionName(stored.name);
    setReviewSessions(stored.sessions);
    setReviewSetPersistenceError(stored.persistenceError ?? "");
    setReviewSetStatus(status, "success");
  };

  const switchReviewSession = (reviewSessionId: string) => {
    if (blockReviewMutationDuringCapture()) return;
    if (!selectedSlug || reviewSessionId === reviewSessionIdRef.current) return;
    const stored = loadStoredReviewSet(selectedSlug, reviewSessionId);
    if (!stored) {
      setReviewSetStatus("That review session is no longer available.", "warning");
      setReviewSessions(listStoredReviewSets(selectedSlug));
      return;
    }
    activateReviewSession(stored, `${stored.name} opened.`);
  };

  const createReviewSession = () => {
    if (blockReviewMutationDuringCapture()) return;
    if (!selectedSlug) return;
    const persistedCurrent = saveStoredReviewSet(
      selectedSlug,
      reviewSessionIdRef.current,
      reviewSessionNameRef.current,
      reviewScreenshotSessionIdRef.current,
      reviewSetItemsRef.current
    );
    const currentSessions = persistedCurrent ? listStoredReviewSets(selectedSlug) : reviewSessions;
    if (currentSessions.length >= REVIEW_SET_MAX_SESSIONS) {
      setReviewSetStatus(`Keep at most ${REVIEW_SET_MAX_SESSIONS} local review sessions for one course.`, "warning");
      return;
    }
    const reviewSessionId = createReviewSetSessionId();
    const name = `Review ${currentSessions.length + 1}`;
    const saved = saveStoredReviewSet(
      selectedSlug,
      reviewSessionId,
      name,
      reviewScreenshotSessionIdRef.current,
      []
    );
    if (!saved) {
      setReviewSetStatus("Canvas Helper could not create another local review session.", "error");
      return;
    }
    const stored = loadStoredReviewSet(selectedSlug, reviewSessionId);
    if (stored) activateReviewSession(stored, `${name} created.`);
  };

  const renameReviewSession = (name: string) => {
    if (blockReviewMutationDuringCapture()) return;
    const normalized = name.replace(/\s+/g, " ").trim();
    if (!normalized || utf8ByteLength(normalized) > 80) {
      setReviewSetStatus("Use a review name between 1 and 80 bytes.", "warning");
      setReviewSessionName(reviewSessionNameRef.current);
      return;
    }
    reviewSessionNameRef.current = normalized;
    setReviewSessionName(normalized);
    const saved = saveStoredReviewSet(
      selectedSlug,
      reviewSessionIdRef.current,
      normalized,
      reviewScreenshotSessionIdRef.current,
      reviewSetItemsRef.current
    );
    setReviewSessions(saved ? listStoredReviewSets(selectedSlug) : reviewSessions);
    setReviewSetStatus(saved ? "Review session renamed." : "The review name could not be saved.", saved ? "success" : "error");
  };

  const deleteReviewSession = () => {
    if (blockReviewMutationDuringCapture()) return;
    if (!selectedSlug) return;
    if (reviewSetItemsRef.current.some((item) => reviewSetItemEditLocked(item))) {
      setReviewSetStatus("Accept or reopen every sent change before clearing this review.", "warning");
      return;
    }
    if (reviewSessions.length <= 1) {
      clearReviewSet("Cleared the current review session.");
      return;
    }
    const deletedName = reviewSessionNameRef.current;
    if (!deleteStoredReviewSet(selectedSlug, reviewSessionIdRef.current)) {
      setReviewSetStatus("Canvas Helper could not remove this local review session.", "error");
      return;
    }
    const next = loadStoredReviewSet(selectedSlug);
    if (next) activateReviewSession(next, `${deletedName} removed. Screenshots will expire from local storage.`);
  };

  const reorderReviewSetItem = (id: string, direction: -1 | 1) => {
    const current = [...reviewSetItemsRef.current];
    const index = current.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= current.length) return;
    [current[index], current[target]] = [current[target], current[index]];
    invalidateReviewSetPreparation();
    replaceReviewSetItems(current);
    setReviewSetStatus("Annotation order updated.", "success");
  };

  const reorderReviewSetScreenshot = (itemId: string, screenshotId: string, direction: -1 | 1) => {
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === itemId);
    if (!item || reviewSetItemEditLocked(item)) return;
    const screenshots = [...item.screenshots];
    const index = screenshots.findIndex((screenshot) => screenshot.id === screenshotId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= screenshots.length) return;
    [screenshots[index], screenshots[target]] = [screenshots[target], screenshots[index]];
    invalidateReviewSetPreparation();
    replaceReviewSetItems(reviewSetItemsRef.current.map((candidate) => candidate.id === itemId ? { ...candidate, screenshots } : candidate));
    setReviewSetStatus("Screenshot order updated.", "success");
  };

  const changeReviewSetMetadata = (id: string, input: {
    shortLabel?: string;
    priority?: ReviewSetPriority;
    issueCategory?: InspectionIssueCategory;
  }) => {
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === id);
    if (!item) return;
    if (reviewSetItemEditLocked(item)) {
      setReviewSetStatus("Reopen this change before editing its details.", "warning");
      return;
    }
    const shortLabel = input.shortLabel === undefined ? item.shortLabel : input.shortLabel.replace(/\s+/g, " ");
    if (utf8ByteLength(shortLabel.trim()) > REVIEW_SET_LABEL_MAX_BYTES) {
      setReviewSetStatus(`Keep the short label to ${REVIEW_SET_LABEL_MAX_BYTES} bytes or fewer.`, "warning");
      return;
    }
    invalidateReviewSetPreparation();
    replaceReviewSetItems(reviewSetItemsRef.current.map((candidate) => candidate.id === id ? {
      ...candidate,
      shortLabel,
      priority: input.priority ?? candidate.priority,
      issueCategory: input.issueCategory && INSPECTION_ISSUE_CATEGORIES.includes(input.issueCategory)
        ? input.issueCategory
        : candidate.issueCategory
    } : candidate));
    setReviewSetStatus("");
  };

  const toggleReviewSetResolved = (id: string) => {
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === id);
    if (!item || item.handoffState !== "draft") return;
    invalidateReviewSetPreparation();
    replaceReviewSetItems(reviewSetItemsRef.current.map((candidate) => candidate.id === id ? {
      ...candidate,
      resolved: !item.resolved
    } : candidate));
    setReviewSetStatus(item.resolved ? "Annotation reopened." : "Annotation marked resolved.", "success");
  };

  const acceptReviewSetItem = (id: string) => {
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === id);
    if (!item || item.handoffState !== "sent") return false;
    invalidateReviewSetPreparation();
    replaceReviewSetItems(reviewSetItemsRef.current.map((candidate) => candidate.id === id ? {
      ...candidate,
      resolved: true,
      handoffState: "accepted"
    } : candidate));
    setReviewSetStatus("Change accepted.", "success");
    return true;
  };

  const reopenReviewSetItem = (id: string) => {
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === id);
    if (!item || (item.handoffState !== "sent" && item.handoffState !== "accepted")) return;
    invalidateReviewSetPreparation();
    replaceReviewSetItems(reviewSetItemsRef.current.map((candidate) => candidate.id === id ? {
      ...candidate,
      resolved: false,
      handoffState: "reopened"
    } : candidate));
    setReviewSetStatus("Change reopened for a follow-up handoff.", "success");
  };

  const retryReviewSetAnchor = (id: string) => {
    if (!reviewSetItemsRef.current.some((item) => item.id === id)) return;
    invalidateReviewSetPreparation();
    replaceReviewSetItems(reviewSetItemsRef.current.map((item) => item.id === id ? { ...item, anchorState: "ready" } : item));
    setReviewSetStatus("Checking the saved selection again…", "progress");
  };

  const reviewItemsFitPacket = (items: ReviewSetItem[]) => {
    const openItems = reviewSetHandoffItems(items);
    if (!openItems.length) return true;
    try {
      buildReviewSetPacket({
        projectSlug: openItems[0].request.projectSlug,
        previewMode: openItems[0].previewMode,
        items: openItems.map((item) => ({ item, resolution: item.resolution }))
      });
      return true;
    } catch {
      return false;
    }
  };

  const duplicateReviewSetItem = (id: string) => {
    if (blockReviewMutationDuringCapture()) return;
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === id);
    if (!item || reviewSetItemEditLocked(item) || reviewSetItemsRef.current.length >= REVIEW_SET_MAX_ITEMS) {
      setReviewSetStatus("This review session does not have room for a duplicate.", "warning");
      return;
    }
    const duplicate = createReviewSetItem({
      id: `review-${Date.now()}-${++reviewSetItemIdRef.current}`,
      previewMode: item.previewMode,
      request: item.request,
      resolution: item.resolution,
      issueCategory: item.issueCategory,
      shortLabel: "Copy",
      priority: item.priority,
      anchorState: item.anchorState,
      resolved: false,
      handoffState: "draft",
      sentAt: null,
      teacherNote: item.teacherNote,
      screenshots: []
    });
    if (!reviewItemsFitPacket([...reviewSetItemsRef.current, duplicate])) {
      setReviewSetStatus("That duplicate would exceed the bounded Codex packet.", "warning");
      return;
    }
    invalidateReviewSetPreparation();
    replaceReviewSetItems([...reviewSetItemsRef.current, duplicate]);
    setReviewSetStatus("Annotation duplicated without sharing its screenshots.", "success");
  };

  const moveReviewSetItem = (id: string, targetReviewSessionId: string) => {
    if (blockReviewMutationDuringCapture()) return;
    if (!selectedSlug || targetReviewSessionId === reviewSessionIdRef.current) return;
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === id);
    const target = loadStoredReviewSet(selectedSlug, targetReviewSessionId, false);
    if (!item || !target) {
      setReviewSetStatus("The destination review session is no longer available.", "warning");
      return;
    }
    if (reviewSetItemEditLocked(item)) {
      setReviewSetStatus("Accept or reopen this sent change before moving it.", "warning");
      return;
    }
    if (
      target.items.length >= REVIEW_SET_MAX_ITEMS ||
      target.items.some((candidate) => candidate.id === item.id) ||
      !reviewItemsFitPacket([...target.items, item])
    ) {
      setReviewSetStatus(`${target.name} does not have room for this annotation.`, "warning");
      return;
    }
    if (!saveStoredReviewSet(selectedSlug, target.reviewSessionId, target.name, target.sessionId, [...target.items, item], false)) {
      setReviewSetStatus("Canvas Helper could not move this annotation.", "error");
      return;
    }
    invalidateReviewSetPreparation();
    replaceReviewSetItems(reviewSetItemsRef.current.filter((candidate) => candidate.id !== id));
    setReviewSetStatus(`Annotation moved to ${target.name}.`, "success");
  };

  const mergeReviewSession = (sourceReviewSessionId: string) => {
    if (blockReviewMutationDuringCapture()) return;
    if (!selectedSlug || sourceReviewSessionId === reviewSessionIdRef.current) return;
    const source = loadStoredReviewSet(selectedSlug, sourceReviewSessionId, false);
    if (!source) {
      setReviewSetStatus("That queued review session is no longer available.", "warning");
      return;
    }
    const current = reviewSetItemsRef.current;
    if (
      current.length + source.items.length > REVIEW_SET_MAX_ITEMS ||
      source.items.some((item) => current.some((candidate) => candidate.id === item.id || candidate.identity === item.identity)) ||
      !reviewItemsFitPacket([...current, ...source.items])
    ) {
      setReviewSetStatus("These sessions cannot merge within the five-item packet limit without duplicates.", "warning");
      return;
    }
    invalidateReviewSetPreparation();
    replaceReviewSetItems([...current, ...source.items]);
    deleteStoredReviewSet(selectedSlug, sourceReviewSessionId);
    setReviewSessions(listStoredReviewSets(selectedSlug));
    setReviewSetStatus(`${source.name} merged into ${reviewSessionNameRef.current}.`, "success");
  };

  const exportReviewSetMarkdown = () => {
    if (reviewSetCopyingRef.current || reviewSetSavingRef.current) return;
    if (!preparedReviewSet || !reviewSetPacketReady) {
      setReviewSetStatus("Wait until this Review Set is ready before exporting it.", "warning");
      return;
    }
    downloadTextFile(`${selectedSlug}-${reviewSessionNameRef.current.replace(/[^A-Za-z0-9_-]+/g, "-")}.md`, preparedReviewSet.packet, "text/markdown;charset=utf-8");
    setReviewSetStatus("Markdown handoff exported.", "success");
  };

  const exportReviewSetJson = () => {
    if (reviewSetCopyingRef.current || reviewSetSavingRef.current) return;
    try {
      const backup = createReviewSetBackup({
        projectSlug: selectedSlug,
        reviewSessionId: reviewSessionIdRef.current,
        name: reviewSessionNameRef.current,
        screenshotSessionId: reviewScreenshotSessionIdRef.current,
        items: reviewSetItemsRef.current
      });
      downloadTextFile(`${selectedSlug}-${reviewSessionNameRef.current.replace(/[^A-Za-z0-9_-]+/g, "-")}.review.json`, backup, "application/json;charset=utf-8");
      setReviewSetStatus("Validated local backup exported.", "success");
    } catch (error) {
      setReviewSetStatus(error instanceof Error ? error.message : "Could not export this Review Set backup.", "error");
    }
  };

  const importReviewSetJson = async (file: File) => {
    if (blockReviewMutationDuringCapture()) return;
    try {
      if (reviewSessions.length >= REVIEW_SET_MAX_SESSIONS) throw new Error(`Remove a queued review before importing another one.`);
      const parsed = parseReviewSetBackup(await file.text(), selectedSlug, reviewScreenshotSessionIdRef.current);
      const reviewSessionId = createReviewSetSessionId();
      const name = `${parsed.name} import`.slice(0, STUDIO_REVIEW_LIMITS.sessionNameCodeUnits);
      if (!saveStoredReviewSet(selectedSlug, reviewSessionId, name, reviewScreenshotSessionIdRef.current, parsed.items)) {
        throw new Error("Canvas Helper could not save this imported review.");
      }
      const stored = loadStoredReviewSet(selectedSlug, reviewSessionId);
      if (!stored) throw new Error("The imported review could not be reopened safely.");
      activateReviewSession(stored, `${name} imported.`);
    } catch (error) {
      setReviewSetStatus(error instanceof Error ? error.message : "This Review Set backup could not be imported.", "error");
    }
  };

  const removeReviewSetScreenshot = (itemId: string, screenshotId: string) => {
    if (blockReviewMutationDuringCapture()) return;
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === itemId);
    if (!item?.screenshots.some((screenshot) => screenshot.id === screenshotId)) {
      return;
    }
    if (reviewSetItemEditLocked(item)) {
      setReviewSetStatus("Reopen this change before editing its screenshots.", "warning");
      return;
    }
    invalidateReviewSetPreparation();
    reclaimReviewScreenshotPaths(
      ownedScreenshotPaths(
        reviewScreenshotSessionIdRef.current,
        item,
        item.screenshots.filter((screenshot) => screenshot.id === screenshotId)
      )
    );
    replaceReviewSetItems(
      reviewSetItemsRef.current.map((candidate) =>
        candidate.id === itemId
          ? { ...candidate, screenshots: candidate.screenshots.filter((screenshot) => screenshot.id !== screenshotId) }
          : candidate
      )
    );
    setReviewSetStatus("Screenshot removed.");
  };

  const commitScreenshotReplacement = async (
    item: ReviewSetItem,
    screenshot: ReviewSetScreenshot,
    png: Blob,
    cropped: boolean,
    signal: AbortSignal
  ) => {
    const persisted = await replaceReviewScreenshot({
      sessionId: reviewScreenshotSessionIdRef.current,
      projectSlug: item.request.projectSlug,
      itemId: item.id,
      screenshotId: screenshot.id,
      ownerNodeId: screenshot.ownerNodeId,
      repoRelativePath: screenshot.filePath,
      png,
      signal
    });
    const imageUrl = reviewScreenshotImageUrl(persisted.path, {
      sessionId: reviewScreenshotSessionIdRef.current,
      projectSlug: item.request.projectSlug,
      itemId: item.id,
      ownerNodeId: screenshot.ownerNodeId
    });
    return {
      ...screenshot,
      imageUrl: `${imageUrl}&revision=${Date.now()}`,
      byteLength: persisted.byteLength,
      width: persisted.width,
      height: persisted.height,
      cropped
    } satisfies ReviewSetScreenshot;
  };

  const retakeReviewSetScreenshot = async (itemId: string, screenshotId: string) => {
    const itemIndex = reviewSetItemsRef.current.findIndex((candidate) => candidate.id === itemId);
    const item = reviewSetItemsRef.current[itemIndex];
    const screenshot = item?.screenshots.find((candidate) => candidate.id === screenshotId);
    if (
      reviewCaptureBusyRef.current || !item || reviewSetItemEditLocked(item) || !screenshot || !item.request.selection.nodeId ||
      screenshot.ownerNodeId !== item.request.selection.nodeId
    ) return false;
    const expectedVersion = reviewSetVersionRef.current;
    const controller = new AbortController();
    reviewItemCaptureAbortRef.current = controller;
    reviewCaptureBusyRef.current = true;
    setReviewSetCaptureItemId(itemId);
    const feedbackSequence = setReviewSetStatus("Restoring the saved course location…", "progress");
    let capturedDraft: ScreenshotDraft | null = null;
    try {
      const focused = await focusReviewSetItemRef.current(itemId, "embedded", false);
      if (controller.signal.aborted) throw new DOMException("Capture canceled", "AbortError");
      if (!focused) throw new Error("The saved element moved. Relink it before retaking the screenshot.");
      const selection = await requestCurrentInspectionSelection("workspace", item.request.selection.nodeId, "embedded");
      if (!hasSamePreviewPageRoute(selection.pageHref, item.request.selection.pageHref)) {
        throw new Error("The course page changed. Relink this annotation before retaking the screenshot.");
      }
      const captureSelection = preserveVisualSelection(item.request.selection, selection);
      completeReviewSetStatus(feedbackSequence, "Retaking the course screenshot…", "progress");
      capturedDraft = await capturePreviewScreenshot({
        projectSlug: item.request.projectSlug,
        selection: captureSelection,
        markerNumber: itemIndex + 1,
        signal: controller.signal
      });
      const current = reviewSetItemsRef.current.find((candidate) => candidate.id === itemId);
      if (controller.signal.aborted || reviewSetVersionRef.current !== expectedVersion || !current) {
        throw new Error("That annotation changed while the screenshot was being retaken.");
      }
      const replacement = await commitScreenshotReplacement(item, screenshot, capturedDraft.png, false, controller.signal);
      const latest = reviewSetItemsRef.current.find((candidate) => candidate.id === itemId);
      const latestScreenshot = latest?.screenshots.find((candidate) => candidate.id === screenshotId);
      if (
        controller.signal.aborted ||
        !latest ||
        !latestScreenshot ||
        latestScreenshot.filePath !== screenshot.filePath ||
        latestScreenshot.ownerNodeId !== screenshot.ownerNodeId
      ) {
        throw new Error("That annotation changed while the replacement screenshot was being saved.");
      }
      invalidateReviewSetPreparation();
      replaceReviewSetItems(reviewSetItemsRef.current.map((candidate) => candidate.id === itemId ? {
        ...candidate,
        screenshots: candidate.screenshots.map((saved) => saved.id === screenshotId ? replacement : saved)
      } : candidate));
      completeReviewSetStatus(feedbackSequence, "Screenshot replaced.", "success");
      return true;
    } catch (error) {
      completeReviewSetStatus(
        feedbackSequence,
        error instanceof DOMException && error.name === "AbortError"
          ? "Screenshot capture canceled."
          : error instanceof Error ? error.message : "Could not retake this screenshot.",
        error instanceof DOMException && error.name === "AbortError" ? "neutral" : "error"
      );
      return false;
    } finally {
      releaseScreenshotDraft(capturedDraft);
      if (reviewItemCaptureAbortRef.current === controller) reviewItemCaptureAbortRef.current = null;
      setReviewSetCaptureItemId("");
      reviewCaptureBusyRef.current = false;
    }
  };

  const cropReviewSetScreenshot = async (itemId: string, screenshotId: string) => {
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === itemId);
    const screenshot = item?.screenshots.find((candidate) => candidate.id === screenshotId);
    if (
      reviewCaptureBusyRef.current || !item || reviewSetItemEditLocked(item) || !screenshot || screenshot.cropped ||
      screenshot.ownerNodeId !== item.request.selection.nodeId
    ) return false;
    const expectedVersion = reviewSetVersionRef.current;
    const controller = new AbortController();
    reviewItemCaptureAbortRef.current = controller;
    reviewCaptureBusyRef.current = true;
    setReviewSetCaptureItemId(itemId);
    const feedbackSequence = setReviewSetStatus("Cropping the saved screenshot…", "progress");
    try {
      const response = await fetch(screenshot.imageUrl, { signal: controller.signal });
      const sourcePng = response.ok ? await response.blob() : null;
      if (!sourcePng) throw new Error("The saved screenshot could not be opened for cropping.");
      const cropped = await cropScreenshotPng(sourcePng, item.request.selection);
      if (controller.signal.aborted || reviewSetVersionRef.current !== expectedVersion) {
        throw new DOMException("Crop canceled", "AbortError");
      }
      const replacement = await commitScreenshotReplacement(item, screenshot, cropped.png, true, controller.signal);
      const latest = reviewSetItemsRef.current.find((candidate) => candidate.id === itemId);
      const latestScreenshot = latest?.screenshots.find((candidate) => candidate.id === screenshotId);
      if (
        controller.signal.aborted ||
        !latest ||
        !latestScreenshot ||
        latestScreenshot.filePath !== screenshot.filePath ||
        latestScreenshot.ownerNodeId !== screenshot.ownerNodeId
      ) {
        throw new Error("That annotation changed while the cropped screenshot was being saved.");
      }
      invalidateReviewSetPreparation();
      replaceReviewSetItems(reviewSetItemsRef.current.map((candidate) => candidate.id === itemId ? {
        ...candidate,
        screenshots: candidate.screenshots.map((saved) => saved.id === screenshotId ? replacement : saved)
      } : candidate));
      completeReviewSetStatus(feedbackSequence, "Screenshot cropped to the selected element.", "success");
      return true;
    } catch (error) {
      completeReviewSetStatus(
        feedbackSequence,
        error instanceof DOMException && error.name === "AbortError"
          ? "Screenshot crop canceled."
          : error instanceof Error ? error.message : "Could not crop this screenshot.",
        error instanceof DOMException && error.name === "AbortError" ? "neutral" : "error"
      );
      return false;
    } finally {
      if (reviewItemCaptureAbortRef.current === controller) reviewItemCaptureAbortRef.current = null;
      setReviewSetCaptureItemId("");
      reviewCaptureBusyRef.current = false;
    }
  };

  const addScreenshotToReviewSetItem = async (
    itemId: string,
    source: "embedded" | "standalone" = "embedded"
  ) => {
    const itemIndex = reviewSetItemsRef.current.findIndex((candidate) => candidate.id === itemId);
    const item = reviewSetItemsRef.current[itemIndex];
    if (
      reviewSetCopyingRef.current ||
      reviewSetSavingRef.current ||
      reviewCaptureBusyRef.current ||
      !item ||
      reviewSetItemEditLocked(item) ||
      item.screenshots.length >= REVIEW_SCREENSHOT_MAX_PER_ITEM ||
      !item.request.selection.nodeId
    ) {
      return false;
    }
    const expectedVersion = reviewSetVersionRef.current;
    const controller = new AbortController();
    reviewItemCaptureAbortRef.current = controller;
    reviewCaptureBusyRef.current = true;
    setReviewSetCaptureItemId(itemId);
    const feedbackSequence = setReviewSetStatus("Restoring the saved course location…", "progress");
    let savedScreenshots: ReviewSetScreenshot[] = [];
    let capturedDraft: ScreenshotDraft | null = null;
    try {
      const focused = await focusReviewSetItemRef.current(itemId, source, false);
      if (controller.signal.aborted) throw new DOMException("Capture canceled", "AbortError");
      if (!focused) {
        throw new Error("The saved course page could not be restored. Try Show again before capturing.");
      }
      completeReviewSetStatus(feedbackSequence, "Capturing the course preview…", "progress");
      const selection = await requestCurrentInspectionSelection("workspace", item.request.selection.nodeId, source);
      if (controller.signal.aborted) throw new DOMException("Capture canceled", "AbortError");
      if (!hasSamePreviewPageRoute(selection.pageHref, item.request.selection.pageHref)) {
        throw new Error("The course page changed. Show this annotation again before capturing.");
      }
      const captureSelection = preserveVisualSelection(item.request.selection, selection);
      capturedDraft = await capturePreviewScreenshot({
        projectSlug: item.request.projectSlug,
        selection: captureSelection,
        markerNumber: itemIndex + 1,
        signal: controller.signal
      });
      if (controller.signal.aborted) throw new DOMException("Capture canceled", "AbortError");
      savedScreenshots = await persistScreenshotDrafts({
        sessionId: reviewScreenshotSessionIdRef.current,
        projectSlug: item.request.projectSlug,
        itemId: item.id,
        ownerNodeId: item.request.selection.nodeId,
        drafts: [capturedDraft]
      });
      const current = reviewSetItemsRef.current.find((candidate) => candidate.id === itemId);
      if (reviewSetVersionRef.current !== expectedVersion || !current || current.screenshots.length >= REVIEW_SCREENSHOT_MAX_PER_ITEM) {
        throw new Error("That annotation changed while the screenshot was being captured. Try again.");
      }
      invalidateReviewSetPreparation();
      replaceReviewSetItems(
        reviewSetItemsRef.current.map((candidate) =>
          candidate.id === itemId ? { ...candidate, screenshots: [...candidate.screenshots, ...savedScreenshots] } : candidate
        )
      );
      completeReviewSetStatus(feedbackSequence, "Screenshot added.", "success");
      return true;
    } catch (error) {
      await deleteReviewScreenshotPaths(ownedScreenshotPaths(
        reviewScreenshotSessionIdRef.current,
        { id: item.id, request: item.request, screenshots: savedScreenshots }
      )).catch(() => undefined);
      completeReviewSetStatus(
        feedbackSequence,
        error instanceof DOMException && error.name === "AbortError"
          ? "Screenshot capture canceled."
          : error instanceof Error ? error.message : "Could not capture this screenshot.",
        error instanceof DOMException && error.name === "AbortError" ? "neutral" : "error"
      );
      return false;
    } finally {
      releaseScreenshotDraft(capturedDraft);
      if (reviewItemCaptureAbortRef.current === controller) reviewItemCaptureAbortRef.current = null;
      setReviewSetCaptureItemId("");
      reviewCaptureBusyRef.current = false;
    }
  };

  const cancelReviewCapture = () => {
    const canceledDraft = screenshotAnnotation.cancel();
    const activeItemCapture = reviewItemCaptureAbortRef.current;
    if (activeItemCapture) activeItemCapture.abort();
    if (canceledDraft || activeItemCapture) {
      setReviewSetStatus("Screenshot capture canceled.", "neutral");
      return true;
    }
    return false;
  };

  const prepareReviewSet = () => {
    const allItems = [...reviewSetItemsRef.current];
    const savedItems = reviewSetHandoffItems(allItems);
    if (!savedItems.length) {
      setPreparedReviewSet(null);
      preparedReviewSetRef.current = null;
      reviewSetPacketReadyRef.current = false;
      setReviewSetPacketError("");
      if (allItems.length && allItems.every((item) => item.handoffState === "accepted")) {
        setReviewSetStatus("All sent changes are accepted.", "success");
      }
      return;
    }
    const blockedAnchorIndex = savedItems.findIndex((item) => item.anchorState !== "ready");
    if (blockedAnchorIndex >= 0) {
      const blockedItem = savedItems[blockedAnchorIndex];
      const message = blockedItem.anchorState === "changed"
        ? `Annotation ${blockedAnchorIndex + 1} changed after the page was rebuilt. Check it or relink the selection.`
        : `Annotation ${blockedAnchorIndex + 1} needs relinking or another anchor check before copying.`;
      setPreparedReviewSet(null);
      preparedReviewSetRef.current = null;
      reviewSetPacketReadyRef.current = false;
      setReviewSetPacketError(message);
      setReviewSetStatus(message, "warning");
      return;
    }
    if (savedItems.some((item) => !item.teacherNote.trim())) {
      setPreparedReviewSet(null);
      preparedReviewSetRef.current = null;
      reviewSetPacketReadyRef.current = false;
      setReviewSetPacketError("Add a note to every annotation before copying.");
      setReviewSetStatus("Add a note to every annotation before copying.", "warning");
      return;
    }

    reviewSetPreparationAbortRef.current?.abort();
    const controller = new AbortController();
    reviewSetPreparationAbortRef.current = controller;
    const preparationVersion = reviewSetVersionRef.current;
    setReviewSetPreparing(true);
    reviewSetPreparingRef.current = true;
    setPreparedReviewSet(null);
    preparedReviewSetRef.current = null;
    reviewSetPacketReadyRef.current = false;
    setReviewSetPacketError("");
    setManualCopySnapshot(null);
    const feedbackSequence = setReviewSetStatus("Getting your Review Set ready…", "progress");

    void Promise.all(
      savedItems.map(async (item, index) => {
        const [resolution, verifiedScreenshots] = await Promise.all([
          resolveInspectionRequest(item.request, controller.signal),
          verifyOwnedReviewScreenshots(reviewScreenshotSessionIdRef.current, item)
        ]);
        if (
          verifiedScreenshots.length !== item.screenshots.length ||
          verifiedScreenshots.some((verified, screenshotIndex) => {
            const saved = item.screenshots[screenshotIndex];
            return (
              !saved ||
              verified.path !== saved.filePath ||
              verified.byteLength !== saved.byteLength ||
              verified.width !== saved.width ||
              verified.height !== saved.height
            );
          })
        ) {
          throw new Error(`Annotation ${index + 1} has a screenshot that could not be verified. Remove it and capture it again.`);
        }
        const anchorState = resolution.freshness === "unsupported"
          ? "missing" as const
          : resolution.freshness === "stale" || !hasSameMaterialResolution(item.resolution, resolution)
            ? "changed" as const
            : "ready" as const;
        return { item, resolution, anchorState };
      })
    )
      .then((items) => {
        if (controller.signal.aborted || reviewSetVersionRef.current !== preparationVersion) {
          return;
        }
        const anchorIssue = items.find((entry) => entry.anchorState !== "ready");
        if (anchorIssue) {
          replaceReviewSetItems(reviewSetItemsRef.current.map((item) => {
            const checked = items.find((entry) => entry.item.id === item.id);
            return checked && checked.anchorState !== item.anchorState
              ? { ...item, anchorState: checked.anchorState }
              : item;
          }));
          const position = items.indexOf(anchorIssue) + 1;
          const message = anchorIssue.anchorState === "missing"
            ? `Annotation ${position} could not find its saved element. Use Relink selection.`
            : `Annotation ${position} changed after the page was rebuilt. Check it or relink the selection.`;
          setReviewSetPacketError(message);
          completeReviewSetStatus(feedbackSequence, message, "warning");
          return;
        }
        const packet = buildReviewSetPacket({
          projectSlug: savedItems[0].request.projectSlug,
          previewMode: savedItems[0].previewMode,
          items: items.map(({ item, resolution }) => ({ item, resolution })),
          detail: reviewSetHandoffDetail,
          cycle: reviewSetHandoffCycle(allItems)
        });
        preparedReviewSetRef.current = packet;
        setPreparedReviewSet(packet);
        completeReviewSetStatus(feedbackSequence, "Review Set ready.", "success");
      })
      .catch((error) => {
        if (controller.signal.aborted || reviewSetVersionRef.current !== preparationVersion) {
          return;
        }
        setReviewSetPacketError(error instanceof Error ? error.message : "Could not get the Review Set ready.");
        completeReviewSetStatus(
          feedbackSequence,
          error instanceof Error ? error.message : "Could not get the Review Set ready.",
          "error"
        );
      })
      .finally(() => {
        if (reviewSetPreparationAbortRef.current === controller) {
          reviewSetPreparationAbortRef.current = null;
          reviewSetPreparingRef.current = false;
          setReviewSetPreparing(false);
        }
      });
  };

  prepareReviewSetRef.current = prepareReviewSet;
  useEffect(() => {
    if (!reviewSetItems.length) {
      return;
    }
    const timer = window.setTimeout(() => prepareReviewSetRef.current(), 350);
    return () => window.clearTimeout(timer);
  }, [reviewSetHandoffDetail, reviewSetItems]);

  const reviewSetPacketReady = useMemo(() => {
    if (!preparedReviewSet || reviewSetPreparing || reviewSetPacketError) {
      return false;
    }
    return preparedReviewSet.detail === reviewSetHandoffDetail
      && preparedReviewSet.cycle === reviewSetHandoffCycle(reviewSetItems)
      && preparedReviewSet.itemIds.join("\u001f") === reviewSetHandoffItems(reviewSetItems).map((item) => item.id).join("\u001f");
  }, [preparedReviewSet, reviewSetHandoffDetail, reviewSetItems, reviewSetPacketError, reviewSetPreparing]);
  if (preparedReviewSetRef.current !== preparedReviewSet) {
    preparedReviewSetRef.current = preparedReviewSet;
  }
  reviewSetPacketReadyRef.current = reviewSetPacketReady || (
    Boolean(preparedReviewSetRef.current) &&
    !reviewSetPreparing &&
    !reviewSetPacketError &&
    preparedReviewSetRef.current?.detail === reviewSetHandoffDetail &&
    preparedReviewSetRef.current?.cycle === reviewSetHandoffCycle(reviewSetItemsRef.current) &&
    preparedReviewSetRef.current?.itemIds.join("\u001f") === reviewSetHandoffItems(reviewSetItemsRef.current).map((item) => item.id).join("\u001f")
  );

  const previewReviewState = useMemo<PreviewReviewState>(() => ({
    sessionId: reviewScreenshotSessionIdRef.current,
    items: reviewSetItems.map((item) => ({
      id: item.id,
      projectSlug: item.request.projectSlug,
      nodeId: item.request.selection.nodeId ?? "",
      excerpt: item.excerpt,
      teacherNote: item.teacherNote,
      handoffState: item.handoffState,
      screenshots: item.screenshots.map((screenshot) => ({
        id: screenshot.id,
        filePath: screenshot.filePath,
        ownerNodeId: screenshot.ownerNodeId
      }))
    })),
    draftScreenshotCount: screenshotAnnotation.drafts.length,
    captureItemId: reviewSetCaptureItemId,
    saving: reviewSetSaving,
    copying: reviewSetCopying,
    preparing: reviewSetPreparing,
    packetReady: reviewSetPacketReady,
    status: (reviewFeedback.tone === "error" ? "" : reviewFeedback.message).slice(0, STUDIO_BRIDGE_LIMITS.reviewStatusCodeUnits),
    error: (reviewSetPacketError || reviewSetPersistenceError || (reviewFeedback.tone === "error" ? reviewFeedback.message : "")).slice(0, STUDIO_BRIDGE_LIMITS.reviewStatusCodeUnits),
    undoLabel: reviewUndo?.label ?? ""
  }), [reviewFeedback, reviewSetCaptureItemId, reviewSetCopying, reviewSetItems, reviewSetPacketError, reviewSetPacketReady, reviewSetPersistenceError, reviewSetPreparing, reviewSetSaving, reviewUndo, screenshotAnnotation.drafts.length]);

  useEffect(() => {
    syncStandaloneReviewSet(
      "workspace",
      previewReviewState,
      reviewSetPacketReady && preparedReviewSet
        ? { packet: preparedReviewSet.packet, packetId: preparedReviewSet.packetId, itemIds: preparedReviewSet.itemIds, reviewSessionId: reviewSessionIdRef.current }
        : { packet: "", packetId: "", itemIds: [], reviewSessionId: reviewSessionIdRef.current }
    );
  }, [preparedReviewSet, previewReviewState, reviewSetPacketReady, syncStandaloneReviewSet]);

  const previewCourseEditState = useMemo<PreviewCourseEditState>(() => {
    const target = courseEditing.target;
    const selectedDraft = courseEditing.drafts.find((draft) => draft.id === standaloneSelectedEditDraftId) ?? null;
    return {
      projectSlug: selectedSlug,
      enabled: selectionMode === "edit",
      available: courseEditing.status.available,
      unavailableReason: courseEditing.status.unavailableReason.slice(0, 240),
      target: target ? {
        eligibility: target.eligibility,
        reason: target.reason.slice(0, 240),
        targetId: target.identity?.targetId ?? "",
        tagName: target.identity?.tagName ?? "",
        originalHtml: target.originalHtml,
        originalText: target.originalText,
        capabilities: target.capabilities,
        attributes: target.attributes,
        currentStyle: target.currentStyle
      } : null,
      drafts: courseEditing.drafts.map((draft) => ({
        id: draft.id,
        targetId: draft.identity.targetId,
        tagName: draft.identity.tagName,
        beforeText: draft.beforeText.slice(0, STUDIO_BRIDGE_LIMITS.visibleTextCodeUnits),
        afterText: draft.afterText.slice(0, STUDIO_BRIDGE_LIMITS.visibleTextCodeUnits)
      })),
      selectedDraft: selectedDraft ? {
        id: selectedDraft.id,
        targetId: selectedDraft.identity.targetId,
        tagName: selectedDraft.identity.tagName,
        beforeText: selectedDraft.beforeText.slice(0, STUDIO_BRIDGE_LIMITS.visibleTextCodeUnits),
        afterText: selectedDraft.afterText.slice(0, STUDIO_BRIDGE_LIMITS.visibleTextCodeUnits),
        baseline: selectedDraft.baseline,
        patch: selectedDraft.patch
      } : null,
      busy: courseEditing.busy,
      canUndo: courseEditing.status.canUndo,
      exportsOutOfDate: courseEditing.status.exportsOutOfDate,
      staleExportTargets: courseEditing.status.staleExportTargets.slice(0, 12),
      status: (courseEditing.feedback.tone === "error" ? "" : courseEditing.feedback.message).slice(0, 240),
      error: (courseEditing.feedback.tone === "error" ? courseEditing.feedback.message : "").slice(0, 240)
    };
  }, [courseEditing.busy, courseEditing.drafts, courseEditing.feedback, courseEditing.status, courseEditing.target, selectedSlug, selectionMode, standaloneSelectedEditDraftId]);

  useEffect(() => {
    syncStandaloneCourseEditing("workspace", previewCourseEditState);
  }, [previewCourseEditState, syncStandaloneCourseEditing]);

  const copyReviewSet = () => {
    if (!preparedReviewSet || !reviewSetPacketReady || reviewSetSavingRef.current || reviewSetCopyingRef.current) {
      return;
    }
    const currentIds = reviewSetHandoffItems(reviewSetItemsRef.current).map((item) => item.id);
    if (preparedReviewSet.itemIds.join("\u001f") !== currentIds.join("\u001f")) {
      setReviewSetStatus("This Review Set changed. Prepare it again before copying.", "warning");
      return;
    }
    const snapshot: ReviewHandoffSnapshot = {
      copyId: typeof window.crypto.randomUUID === "function" ? window.crypto.randomUUID() : `copy-${Date.now()}`,
      packet: preparedReviewSet.packet,
      packetId: preparedReviewSet.packetId,
      itemIds: [...preparedReviewSet.itemIds],
      screenshotCount: preparedReviewSet.screenshotCount,
      reviewSessionId: reviewSessionIdRef.current,
      projectSlug: activeReviewProjectSlugRef.current,
      version: reviewSetVersionRef.current
    };
    const feedbackSequence = setReviewSetStatus("Copying Review Set…", "progress");
    setManualCopySnapshot(null);
    if (!reserveReviewCopy(snapshot)) {
      completeReviewSetStatus(feedbackSequence, "This Review Set changed before copying could start. Prepare it again.", "warning");
      return;
    }
    const clipboardWrite = navigator.clipboard && typeof navigator.clipboard.writeText === "function"
      ? navigator.clipboard.writeText(snapshot.packet)
      : Promise.reject(new Error("Clipboard access is unavailable."));
    void clipboardWrite
      .then(() => {
        if (!markPreparedReviewSetSent(snapshot, false)) {
          completeReviewSetStatus(feedbackSequence, "The packet was copied, but this review changed before it could be marked sent.", "warning");
          return;
        }
        completeReviewSetStatus(
          feedbackSequence,
          snapshot.screenshotCount
            ? `Sent to Codex with ${snapshot.screenshotCount} screenshot path${snapshot.screenshotCount === 1 ? "" : "s"}. Verify the changes after Codex rebuilds.`
            : "Sent to Codex. Verify the changes after Codex rebuilds.",
          "success"
        );
      })
      .catch(() => {
        releaseReviewCopyReservation(snapshot.copyId);
        if (completeReviewSetStatus(
          feedbackSequence,
          "Clipboard access was blocked. Copy the packet shown below.",
          "error"
        )) {
          setManualCopySnapshot(snapshot);
        }
      });
  };

  const markPreparedReviewSetSent = (
    snapshot: ReviewHandoffSnapshot,
    announce = true
  ) => {
    const reservation = reviewCopyReservationRef.current;
    const currentPacket = preparedReviewSetRef.current;
    if (!reservation || reservation.copyId !== snapshot.copyId || !currentPacket || !reviewSetPacketReadyRef.current) {
      releaseReviewCopyReservation(snapshot.copyId);
      return false;
    }
    const currentIds = reviewSetHandoffItems(reviewSetItemsRef.current).map((item) => item.id);
    if (
      snapshot.reviewSessionId !== reviewSessionIdRef.current ||
      snapshot.projectSlug !== activeReviewProjectSlugRef.current ||
      snapshot.version !== reviewSetVersionRef.current ||
      currentPacket.itemIds.join("\u001f") !== currentIds.join("\u001f") ||
      currentPacket.itemIds.join("\u001f") !== snapshot.itemIds.join("\u001f") ||
      currentPacket.packetId !== snapshot.packetId
    ) {
      releaseReviewCopyReservation(snapshot.copyId);
      return false;
    }
    const sentIds = new Set(currentPacket.itemIds);
    const sentAt = Date.now();
    invalidateReviewSetPreparation();
    replaceReviewSetItems(reviewSetItemsRef.current.map((item) => sentIds.has(item.id) ? {
      ...item,
      handoffState: "sent",
      sentAt,
      resolved: false
    } : item));
    releaseReviewCopyReservation(snapshot.copyId);
    setManualCopySnapshot(null);
    if (announce) setReviewSetStatus("Sent to Codex. Verify the changes after Codex rebuilds.", "success");
    return true;
  };

  const confirmManualReviewSetSent = () => {
    if (!manualCopySnapshot) return;
    if (!reserveReviewCopy(manualCopySnapshot)) {
      setReviewSetStatus("This review changed after the fallback packet was shown. Copy the newly prepared packet instead.", "warning");
      return;
    }
    const marked = markPreparedReviewSetSent(manualCopySnapshot);
    if (!marked) {
      setReviewSetStatus("This review changed after the fallback packet was shown. Copy the newly prepared packet instead.", "warning");
    }
  };

  const addStandaloneReviewItem = async (
    mode: PreviewMode,
    selection: PreviewInspectPayload,
    teacherNote: string
  ) => {
    const note = teacherNote.trim();
    const scope = reviewScopeRef.current;
    const target = scope.workspaceTarget;
    const expectedVersion = reviewSetVersionRef.current;
    if (mode !== "workspace" || !target || target.projectSlug !== scope.selectedSlug) {
      throw new Error("Open a Workspace preview from Studio before saving annotations.");
    }
    if (!selection.nodeId) {
      throw new Error("Select a course element before saving.");
    }
    if (!note) {
      throw new Error("Add a note before saving.");
    }
    if (!standalonePreviewMatchesTarget(mode, getTargetKey(target))) {
      throw new Error("This full preview belongs to a different course page. Open Full Preview again before saving.");
    }
    if (utf8ByteLength(note) > REVIEW_SET_NOTE_MAX_BYTES) {
      throw new Error(`Keep the note to ${REVIEW_SET_NOTE_MAX_BYTES} bytes or fewer.`);
    }

    const request: InspectionResolveRequest = {
      projectSlug: target.projectSlug,
      root: "workspace",
      htmlPath: target.htmlPath,
      selection: {
        ...selection,
        geometry: { ...selection.geometry }
      }
    };
    const currentSelection = await requestCurrentInspectionSelection(mode, selection.nodeId, "standalone");
    if (
      currentSelection.nodeId !== selection.nodeId ||
      !hasSamePreviewPageRoute(currentSelection.pageHref, selection.pageHref)
    ) {
      throw new Error("The course page changed. Select the element again before saving.");
    }
    const resolution = await resolveInspectionRequest(request);
    const currentScope = reviewScopeRef.current;
    if (
      reviewSetVersionRef.current !== expectedVersion ||
      currentScope.selectedSlug !== request.projectSlug ||
      currentScope.workspaceTarget?.htmlPath !== request.htmlPath
    ) {
      throw new Error("The Review Set changed while this was saving. Select it again.");
    }
    const currentItems = reviewSetItemsRef.current;
    if (currentItems.length >= REVIEW_SET_MAX_ITEMS) {
      throw new Error("The Review Set already has five annotations.");
    }
    const identity = reviewSetItemIdentity(request, mode);
    if (!identity || currentItems.some((item) => item.identity === identity)) {
      throw new Error("This selection is already saved.");
    }

    const itemId = `review-${Date.now()}-${++reviewSetItemIdRef.current}`;
    const capturedDrafts = [...screenshotAnnotation.drafts];
    let screenshots: ReviewSetScreenshot[] = [];
    try {
      if (capturedDrafts.length) {
        screenshots = await persistScreenshotDrafts({
          sessionId: reviewScreenshotSessionIdRef.current,
          projectSlug: request.projectSlug,
          itemId,
          ownerNodeId: request.selection.nodeId as string,
          drafts: capturedDrafts
        });
      }
      if (reviewSetVersionRef.current !== expectedVersion) {
        throw new Error("The Review Set changed while this was saving. Select it again.");
      }
      const item = createReviewSetItem({
        id: itemId,
        previewMode: mode,
        request,
        resolution,
        issueCategory: "unsure",
        teacherNote: note,
        screenshots
      });
      invalidateReviewSetPreparation();
      replaceReviewSetItems([...currentItems, item]);
      armReviewUndo({ kind: "save", item, index: currentItems.length, label: "Undo save" });
      screenshotAnnotation.clear();
      setReviewSetStatus("Annotation saved.", "success");
    } catch (error) {
      await deleteReviewScreenshotPaths(ownedScreenshotPaths(
        reviewScreenshotSessionIdRef.current,
        { id: itemId, request, screenshots }
      )).catch(() => undefined);
      throw error;
    }
  };

  standaloneReviewActionRef.current = (mode, action) => {
    const respond = (result: Omit<PreviewReviewActionResult, "requestId">) => {
      sendStandaloneReviewActionResult(mode, {
        ...result,
        ...(action.requestId ? { requestId: action.requestId } : {})
      });
    };
    const standaloneTarget = reviewScopeRef.current.workspaceTarget;
    if (action.action === "request-state") {
      if (
        mode === "workspace" &&
        standaloneTarget &&
        standalonePreviewMatchesTarget(mode, getTargetKey(standaloneTarget))
      ) {
        syncStandaloneReviewSet(
          mode,
          previewReviewState,
          reviewSetPacketReady && preparedReviewSet
            ? { packet: preparedReviewSet.packet, packetId: preparedReviewSet.packetId, itemIds: preparedReviewSet.itemIds, reviewSessionId: reviewSessionIdRef.current }
            : { packet: "", packetId: "", itemIds: [], reviewSessionId: reviewSessionIdRef.current }
        );
      }
      return;
    }
    if (
      mode !== "workspace" ||
      !standaloneTarget ||
      !standalonePreviewMatchesTarget(mode, getTargetKey(standaloneTarget))
    ) {
      respond({
        ok: false,
        message: "This full preview belongs to a different course page. Open Full Preview again.",
        clearDraft: false
      });
      revokeStandalonePreview(mode);
      return;
    }
    if (action.action === "begin-copy") {
      if (mode !== "workspace") {
        respond({ ok: false, message: "Only the Workspace preview can copy a Review Set.", clearDraft: false });
        return;
      }
      const currentPacket = preparedReviewSetRef.current;
      const packetReadyNow = Boolean(
        currentPacket &&
        !reviewSetPreparingRef.current &&
        reviewSetPacketReadyRef.current &&
        currentPacket.detail === reviewSetHandoffDetail &&
        currentPacket.cycle === reviewSetHandoffCycle(reviewSetItemsRef.current) &&
        currentPacket.itemIds.join("\u001f") === reviewSetHandoffItems(reviewSetItemsRef.current).map((item) => item.id).join("\u001f")
      );
      if (!currentPacket || !packetReadyNow) {
        respond({ ok: false, message: "This Review Set is not ready to copy yet.", clearDraft: false });
        return;
      }
      reviewSetPacketReadyRef.current = true;
      const snapshot: ReviewHandoffSnapshot = {
        copyId: action.copyId,
        packet: currentPacket.packet,
        packetId: action.packetId,
        itemIds: [...action.itemIds],
        screenshotCount: currentPacket.screenshotCount,
        reviewSessionId: action.reviewSessionId,
        projectSlug: activeReviewProjectSlugRef.current,
        version: reviewSetVersionRef.current
      };
      const reserved = reserveReviewCopy(snapshot);
      respond({
        ok: reserved,
        message: reserved ? "Review Set reserved for copying." : "This Review Set changed or another copy is already in progress.",
        clearDraft: false
      });
      return;
    }
    if (action.action === "cancel-copy") {
      if (mode !== "workspace") {
        respond({ ok: false, message: "Only the Workspace preview can cancel a Review Set copy.", clearDraft: false });
        return;
      }
      const reservation = reviewCopyReservationRef.current;
      const matches = Boolean(
        reservation &&
        reservation.copyId === action.copyId &&
        reservation.packetId === action.packetId &&
        reservation.reviewSessionId === action.reviewSessionId &&
        reservation.itemIds.join("\u001f") === action.itemIds.join("\u001f")
      );
      if (matches) releaseReviewCopyReservation(action.copyId);
      respond({
        ok: matches,
        message: matches ? "Review Set copy canceled. Nothing was marked sent." : "That Review Set copy is no longer active.",
        clearDraft: false
      });
      return;
    }
    if (action.action === "mark-sent") {
      if (mode !== "workspace") {
        respond({ ok: false, message: "Only the Workspace preview can mark a Review Set as sent.", clearDraft: false });
        return;
      }
      if (!action.copyId) {
        respond({ ok: false, message: "Reserve the Review Set before marking it sent.", clearDraft: false });
        return;
      }
      if (reviewSetSavingRef.current) {
        respond({ ok: false, message: "Another Review Set transaction is still in progress.", clearDraft: false });
        return;
      }
      const reservation = reviewCopyReservationRef.current;
      const matches = Boolean(
        reservation &&
        reservation.copyId === action.copyId &&
        reservation.packetId === action.packetId &&
        reservation.reviewSessionId === action.reviewSessionId &&
        reservation.itemIds.join("\u001f") === action.itemIds.join("\u001f")
      );
      const marked = matches && reservation ? markPreparedReviewSetSent(reservation, false) : false;
      respond({
        ok: marked,
        message: marked ? "Sent to Codex. Verify the changes after Codex rebuilds." : "This Review Set changed before it could be marked sent.",
        clearDraft: false
      });
      return;
    }
    if (reviewSetCopyingRef.current || reviewSetSavingRef.current) {
      respond({
        ok: false,
        message: reviewSetCopyingRef.current
          ? "Wait for the Review Set copy to finish before changing this review."
          : "Wait for the annotation to finish saving before changing this review.",
        clearDraft: false
      });
      return;
    }
    if (action.action === "undo") {
      const undone = undoLastReviewChange();
      respond({
        ok: undone,
        message: undone ? "Last Review Set change undone." : "There is no Review Set change to undo.",
        clearDraft: false
      });
      return;
    }
    if (action.action === "cancel-capture") {
      const canceled = cancelReviewCapture();
      respond({
        ok: canceled,
        message: canceled ? "Screenshot capture canceled." : "There is no screenshot capture to cancel.",
        clearDraft: false
      });
      return;
    }
    if (reviewCaptureBusyRef.current) {
      respond({
        ok: false,
        message: "Finish or cancel the screenshot before changing this review.",
        clearDraft: false
      });
      return;
    }
    if (action.action === "add") {
      if (reviewSetSavingRef.current) {
        respond({ ok: false, message: "This annotation is already saving.", clearDraft: false });
        return;
      }
      reviewSetSavingRef.current = true;
      setReviewSetSaving(true);
      void addStandaloneReviewItem(mode, action.selection, action.teacherNote)
        .then(() => respond({
          ok: true,
          message: "Annotation saved.",
          clearDraft: true
        }))
        .catch((error) => respond({
          ok: false,
          message: error instanceof Error ? error.message : "Could not save the annotation.",
          clearDraft: false
        }))
        .finally(() => {
          reviewSetSavingRef.current = false;
          setReviewSetSaving(false);
        });
      return;
    }
    if (action.action === "capture-draft") {
      if (reviewCaptureBusyRef.current) {
        respond({ ok: false, message: "A screenshot is already being captured.", clearDraft: false });
        return;
      }
      if (!action.selection.nodeId) {
        respond({ ok: false, message: "Select a course element before capturing a screenshot.", clearDraft: false });
        return;
      }
      const scopeVersion = inspectionDraft.currentScopeVersion();
      reviewCaptureBusyRef.current = true;
      void screenshotAnnotation.capture({
        projectSlug: selectedSlug,
        selection: action.selection,
        markerNumber: reviewSetItemsRef.current.length + 1,
        isCurrent: () => inspectionDraft.isCurrentScope(scopeVersion),
        prepareSelection: async (signal) => {
          const current = await requestCurrentInspectionSelection(mode, action.selection.nodeId as string, "standalone", signal);
          if (signal.aborted) throw new DOMException("Capture canceled", "AbortError");
          if (!hasSamePreviewPageRoute(current.pageHref, action.selection.pageHref)) {
            throw new Error("The course page changed. Select the element again before capturing a screenshot.");
          }
          return preserveVisualSelection(action.selection, current);
        }
      })
        .then((result) => respond({
          ok: Boolean(result),
          message: result ? "Screenshot captured." : screenshotAnnotation.error || "Could not capture the screenshot.",
          clearDraft: false
        }))
        .catch((error) => respond({
          ok: false,
          message: error instanceof Error ? error.message : "Could not refresh the selected element.",
          clearDraft: false
        }))
        .finally(() => {
          reviewCaptureBusyRef.current = false;
        });
      return;
    }
    if (action.action === "capture-item") {
      const item = reviewSetItemsRef.current.find((candidate) => candidate.id === action.itemId);
      if (reviewSetItemEditLocked(item)) {
        respond({ ok: false, message: "Reopen this change before adding screenshots.", clearDraft: false });
        return;
      }
      void addScreenshotToReviewSetItem(action.itemId, "standalone")
        .then((ok) => respond({
          ok,
          message: ok ? "Screenshot added." : "Could not capture the screenshot.",
          clearDraft: false
        }));
      return;
    }
    if (action.action === "focus-item") {
      const item = reviewSetItemsRef.current.find((candidate) => candidate.id === action.itemId);
      void focusReviewSetItemRef.current(action.itemId, "standalone").then((focused) => {
        if (focused && item) {
          retargetStandalonePreview(mode, getTargetKey({
            projectSlug: item.request.projectSlug,
            root: item.request.root,
            htmlPath: item.request.htmlPath
          }));
        }
        respond({
          ok: focused,
          message: focused ? "Annotation shown." : "The saved course page could not be shown. Try again.",
          clearDraft: false
        });
      });
      return;
    }
    if (action.action === "accept-item") {
      const item = reviewSetItemsRef.current.find((candidate) => candidate.id === action.itemId);
      if (!item || item.handoffState !== "sent") {
        respond({ ok: false, message: "That change is not waiting for verification.", clearDraft: false });
        return;
      }
      const accepted = acceptReviewSetItem(action.itemId);
      respond({ ok: accepted, message: accepted ? "Change accepted." : "That change is not waiting for verification.", clearDraft: false });
      return;
    }
    if (action.action === "reopen-item") {
      const item = reviewSetItemsRef.current.find((candidate) => candidate.id === action.itemId);
      if (!item || (item.handoffState !== "sent" && item.handoffState !== "accepted")) {
        respond({ ok: false, message: "That change cannot be reopened.", clearDraft: false });
        return;
      }
      reopenReviewSetItem(action.itemId);
      respond({ ok: true, message: "Change reopened for follow-up.", clearDraft: false });
      return;
    }
    if (action.action === "remove") {
      const item = reviewSetItemsRef.current.find((candidate) => candidate.id === action.itemId);
      if (!item) {
        respond({ ok: false, message: "That annotation is no longer saved.", clearDraft: false });
        return;
      }
      if (reviewSetItemEditLocked(item)) {
        respond({ ok: false, message: "Accept or reopen this sent change before removing it.", clearDraft: false });
        return;
      }
      removeReviewSetItem(action.itemId);
      respond({ ok: true, message: "Annotation removed.", clearDraft: false });
      return;
    }
    if (action.action === "remove-screenshot") {
      const item = reviewSetItemsRef.current.find((candidate) => candidate.id === action.itemId);
      if (!item?.screenshots.some((screenshot) => screenshot.id === action.screenshotId)) {
        respond({ ok: false, message: "That screenshot is no longer saved.", clearDraft: false });
        return;
      }
      if (reviewSetItemEditLocked(item)) {
        respond({ ok: false, message: "Reopen this change before editing its screenshots.", clearDraft: false });
        return;
      }
      removeReviewSetScreenshot(action.itemId, action.screenshotId);
      respond({ ok: true, message: "Screenshot removed.", clearDraft: false });
      return;
    }
    if (action.action === "update-note") {
      const item = reviewSetItemsRef.current.find((candidate) => candidate.id === action.itemId);
      if (!item) {
        respond({ ok: false, message: "That annotation is no longer saved.", clearDraft: false });
        return;
      }
      if (reviewSetItemEditLocked(item)) {
        respond({ ok: false, message: "Reopen this change before editing its note.", clearDraft: false });
        return;
      }
      if (utf8ByteLength(action.teacherNote) > REVIEW_SET_NOTE_MAX_BYTES) {
        respond({ ok: false, message: "That note is too long.", clearDraft: false });
        return;
      }
      changeReviewSetTeacherNote(action.itemId, action.teacherNote);
      respond({ ok: true, message: "Note updated.", clearDraft: false });
      return;
    }
    if (action.action === "clear") {
      if (reviewSetItemsRef.current.some((item) => reviewSetItemEditLocked(item))) {
        respond({ ok: false, message: "Accept or reopen every sent change before clearing this review.", clearDraft: false });
        return;
      }
      clearReviewSet("Review Set cleared.");
      respond({ ok: true, message: "Review Set cleared.", clearDraft: true });
    }
  };

  standaloneCourseEditActionRef.current = (mode, action) => {
    const respond = (result: Omit<PreviewCourseEditActionResult, "requestId">) => {
      sendStandaloneCourseEditActionResult(mode, {
        ...result,
        ...(action.requestId ? { requestId: action.requestId } : {})
      });
    };
    const standaloneTarget = reviewScopeRef.current.workspaceTarget;
    if (action.action === "request-state") {
      if (
        mode === "workspace" &&
        standaloneTarget &&
        standalonePreviewMatchesTarget(mode, getTargetKey(standaloneTarget))
      ) {
        syncStandaloneCourseEditing(mode, previewCourseEditState);
      }
      return;
    }
    if (
      mode !== "workspace" ||
      !standaloneTarget ||
      !standalonePreviewMatchesTarget(mode, getTargetKey(standaloneTarget))
    ) {
      respond({ ok: false, message: "This full preview belongs to a different course page. Open Full Preview again." });
      revokeStandalonePreview(mode);
      return;
    }
    if (action.action === "set-mode") {
      if (action.enabled && (!courseEditing.status.available || courseEditing.busy)) {
        respond({ ok: false, message: courseEditing.status.unavailableReason || "This course is annotation-only." });
        return;
      }
      const nextMode = action.enabled ? "edit" : action.nextMode === "annotate" ? "annotate" : "off";
      setSelectionMode(nextMode);
      courseEditing.setEnabled(action.enabled);
      if (!action.enabled) courseEditing.clearSelection();
      setPreviewInspectMode(nextMode !== "off");
      setInspectEnabled(nextMode !== "off");
      if (nextMode !== "off") setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
      respond({
        ok: true,
        message: nextMode === "edit" ? "Edit mode is on." : nextMode === "annotate" ? "Annotate mode is on." : "Edit mode is off. Drafts are still saved."
      });
      return;
    }
    if (action.action === "annotate-selection") {
      setSelectionMode("annotate");
      courseEditing.setEnabled(false);
      courseEditing.clearSelection();
      setStandaloneSelectedEditDraftId("");
      setPreviewInspectMode(true);
      setInspectEnabled(true);
      setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
      void resolveInspection(mode, action.selection, "standalone", "annotate").then(() => {
        respond({ ok: true, message: "Annotation ready. Add a note for Codex." });
      }).catch(() => {
        respond({ ok: false, message: "Studio could not reopen that selection for annotation." });
      });
      return;
    }
    if (courseEditing.busy) {
      respond({ ok: false, message: "Wait for the current course edit to finish." });
      return;
    }
    if (action.action === "preview-target") {
      if (courseEditing.target?.identity?.targetId === action.targetId) {
        courseEditing.previewTargetPatch(action.patch);
      }
      return;
    }
    if (action.action === "clear-preview") {
      if (courseEditing.target?.identity?.targetId === action.targetId) courseEditing.closeLivePreview();
      return;
    }
    if (action.action === "open-target-options") {
      const inline = inlineEditorStateRef.current;
      if (
        inline.previewOwner !== "standalone-inline" ||
        inline.status === "detached" ||
        inline.target?.identity?.targetId !== action.targetId
      ) {
        respond({ ok: false, message: "That text selection changed. Click it again before opening its options." });
        return;
      }
      void (async () => {
        // Switching from the caret to the capability composer must preserve
        // current typing. Save is draft-only, so this remains non-mutating.
        if (!["clean", "saved"].includes(inlineEditorStateRef.current.status)) {
          const saved = await courseEditing.saveInlineEditor();
          if (!saved) {
            respond({ ok: false, message: "Studio could not save the current text before opening its options." });
            return;
          }
        }
        const latest = inlineEditorStateRef.current;
        if (
          latest.status === "detached" ||
          latest.target?.identity?.targetId !== action.targetId
        ) {
          respond({ ok: false, message: "That text selection is no longer current." });
          return;
        }
        courseEditing.clearInlineEditor();
        setStandaloneInlineEditorSelection(null);
        respond({ ok: true, message: "Formatting and properties are ready at this course item." });
      })();
      return;
    }
    if (action.action === "save-target") {
      if (courseEditing.target?.identity?.targetId !== action.targetId) {
        respond({ ok: false, message: "That selection changed. Click the course element again." });
        return;
      }
      void courseEditing.saveTarget(action.patch).then((saved) => {
        respond({ ok: saved, message: saved ? "Draft saved." : "Studio could not save this draft." });
      });
      return;
    }
    if (action.action === "reopen-draft") {
      const draft = courseEditing.drafts.find((entry) => entry.id === action.draftId);
      if (!draft) {
        respond({ ok: false, message: "That draft is no longer saved." });
        return;
      }
      void reopenCourseEditDraft(draft, "standalone").then((reopened) => {
        respond({
          ok: reopened,
          message: reopened
            ? "Draft reopened on the learner page."
            : "The saved learner element moved. Select it again before editing."
        });
      }).catch(() => {
        respond({ ok: false, message: "Studio could not reopen that draft on the learner page." });
      });
      return;
    }
    if (action.action === "select-draft") {
      const exists = courseEditing.drafts.some((draft) => draft.id === action.draftId);
      if (exists) courseEditing.clearSelection();
      setStandaloneSelectedEditDraftId(exists ? action.draftId : "");
      respond({ ok: exists, message: exists ? "Draft opened." : "That draft is no longer saved." });
      return;
    }
    if (action.action === "update-draft") {
      const updated = courseEditing.patchDraft(action.draftId, action.patch);
      respond({ ok: updated, message: updated ? "Draft updated." : "That draft is no longer saved." });
      return;
    }
    if (action.action === "remove-draft") {
      const exists = courseEditing.drafts.some((draft) => draft.id === action.draftId);
      if (exists) courseEditing.removeDraft(action.draftId);
      if (standaloneSelectedEditDraftId === action.draftId) setStandaloneSelectedEditDraftId("");
      respond({ ok: exists, message: exists ? "Draft removed." : "That draft is no longer saved." });
      return;
    }
    if (action.action === "reorder-draft") {
      const exists = courseEditing.drafts.some((draft) => draft.id === action.draftId);
      if (exists) courseEditing.reorderDraft(action.draftId, action.direction);
      respond({ ok: exists, message: exists ? "Draft moved." : "That draft is no longer saved." });
      return;
    }
    if (action.action === "apply") {
      void courseEditing.apply().then((ok) => {
        if (ok) setStandaloneSelectedEditDraftId("");
        respond({ ok, message: ok ? "Changes applied and checked." : "Studio could not apply these changes." });
      });
      return;
    }
    if (action.action === "undo") {
      void courseEditing.undo().then((ok) => {
        if (ok) setStandaloneSelectedEditDraftId("");
        respond({ ok, message: ok ? "Last edit batch undone." : "Studio could not undo the last batch." });
      });
    }
  };

  const captureInspectionScreenshot = () => {
    if (courseEditing.hasLivePreview) {
      screenshotAnnotation.reportError("Reset or save the unapplied live preview before capturing review evidence.");
      return;
    }
    if (!inspectionResolution?.selection.nodeId || !inspectionRequest) {
      screenshotAnnotation.reportError("Select a source-mapped preview element before capturing a screenshot.");
      return;
    }
    if (reviewCaptureBusyRef.current) {
      screenshotAnnotation.reportError("A screenshot is already being captured.");
      return;
    }
    const captureScopeVersion = inspectionDraft.currentScopeVersion();
    const captureRequest = inspectionRequest;
    reviewCaptureBusyRef.current = true;
    void screenshotAnnotation.capture({
      projectSlug: captureRequest.projectSlug,
      selection: captureRequest.selection,
      markerNumber: reviewSetItemsRef.current.length + 1,
      isCurrent: () => inspectionDraft.isCurrentScope(captureScopeVersion),
      prepareSelection: async (signal) => {
        const selection = await requestCurrentInspectionSelection(
          inspectionPreviewMode,
          captureRequest.selection.nodeId as string,
          inspectionDraft.currentSource(),
          signal
        );
        if (signal.aborted) throw new DOMException("Capture canceled", "AbortError");
        if (!inspectionDraft.isCurrentScope(captureScopeVersion)) {
          throw new DOMException("Capture canceled", "AbortError");
        }
        if (!hasSamePreviewPageRoute(selection.pageHref, captureRequest.selection.pageHref)) {
          throw new Error("The course page changed. Select the element again before capturing a screenshot.");
        }
        const captureSelection = preserveVisualSelection(captureRequest.selection, selection);
        inspectionDraft.replaceSelection(captureSelection);
        return captureSelection;
      }
    })
      .finally(() => {
        reviewCaptureBusyRef.current = false;
      });
  };

  const cropInspectionScreenshot = (id: string) => {
    if (!inspectionRequest) {
      screenshotAnnotation.reportError("Select the course element again before cropping this screenshot.");
      return;
    }
    void screenshotAnnotation.crop(id, inspectionRequest.selection);
  };

  const focusReviewSetItem = async (
    itemId: string,
    source: "embedded" | "standalone" = "embedded",
    announce = true
  ) => {
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === itemId);
    if (!item?.request.selection.nodeId || item.request.projectSlug !== selectedSlug) {
      return false;
    }
    if (source === "embedded" && resolvedWorkspaceHtmlPath !== item.request.htmlPath) {
      revokeStandalonePreview("workspace");
    }
    const feedbackSequence = announce ? setReviewSetStatus("Showing the saved annotation…", "progress") : 0;
    setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
    setWorkspaceHtmlSelections((current) => ({
      ...current,
      [item.request.projectSlug]: item.request.htmlPath
    }));
    saveWorkspacePageSelection(item.request.projectSlug, item.request.htmlPath);
    if (previewMode !== "workspace") {
      setPreviewMode("workspace");
    }
    try {
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve())));
      const focused = await focusPreviewInspectionSelection("workspace", item.request.selection.nodeId, {
        source,
        pageHref: item.request.selection.pageHref
      });
      if (!focused) {
        restorePreviewLocation("workspace", item.request.selection.scroll);
        if (item.anchorState !== "missing") {
          invalidateReviewSetPreparation();
          replaceReviewSetItems(reviewSetItemsRef.current.map((candidate) => candidate.id === itemId
            ? { ...candidate, anchorState: "missing" }
            : candidate));
        }
      }
      if (announce) {
        completeReviewSetStatus(
          feedbackSequence,
          focused
            ? source === "standalone" ? "Annotation shown in the full preview." : "Annotation shown in the course."
            : "The element moved. Studio returned to its nearest saved page location; use Relink selection.",
          focused ? "success" : "warning"
        );
      }
      return focused;
    } catch (error) {
      if (announce) {
        completeReviewSetStatus(
          feedbackSequence,
          error instanceof Error ? error.message : "The saved course page could not be shown. Try again.",
          "error"
        );
      }
      return false;
    }
  };
  focusReviewSetItemRef.current = focusReviewSetItem;

  const reopenCourseEditDraft = async (
    draft: CourseEditDraft,
    source: "embedded" | "standalone" = "embedded"
  ) => {
    if (
      courseEditing.busy ||
      draft.identity.projectSlug !== selectedSlug
    ) return false;
    const reopened = await courseEditing.reopenDraft(draft);
    if (reopened?.status !== "resolved" || !reopened.target.identity) return false;
    const currentIdentity = reopened.target.identity;
    courseEditing.closeLivePreview();
    setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
    setWorkspaceHtmlSelections((current) => ({
      ...current,
      [currentIdentity.projectSlug]: currentIdentity.htmlPath
    }));
    saveWorkspacePageSelection(currentIdentity.projectSlug, currentIdentity.htmlPath);
    setPreviewMode("workspace");
    setSelectionMode("edit");
    courseEditing.setEnabled(true);
    setPreviewInspectMode(true);
    setInspectEnabled(true);
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve())));
    const focused = await focusPreviewInspectionSelection("workspace", currentIdentity.nodeId, {
      source,
      ...(draft.pageHref ? { pageHref: draft.pageHref } : {})
    });
    if (!focused) return false;
    const selection = await requestCurrentInspectionSelection("workspace", currentIdentity.nodeId, source);
    const target = await resolveInspection("workspace", selection, source, "edit");
    const freshIdentity = target?.identity;
    if (
      !target ||
      target.eligibility !== "editable" ||
      !freshIdentity ||
      freshIdentity.targetId !== currentIdentity.targetId ||
      freshIdentity.sourceDigest !== currentIdentity.sourceDigest
    ) return false;
    if (!courseEditing.rebindDraft(draft.id, target)) return false;
    setStandaloneSelectedEditDraftId(source === "standalone" ? draft.id : "");
    courseEditing.previewTargetPatch(draft.patch, draft.pendingAssets?.[0], target);
    return true;
  };

  const jumpToInlineEditor = async () => {
    const inline = courseEditing.inlineEditor;
    const identity = inline.target?.identity;
    if (courseEditing.busy || !identity || inline.status === "detached") return false;
    setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
    setWorkspaceHtmlSelections((current) => ({ ...current, [identity.projectSlug]: identity.htmlPath }));
    saveWorkspacePageSelection(identity.projectSlug, identity.htmlPath);
    setPreviewMode("workspace");
    setSelectionMode("edit");
    courseEditing.setEnabled(true);
    setPreviewInspectMode(true);
    setInspectEnabled(true);
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve())));
    const focused = await focusPreviewInspectionSelection("workspace", identity.nodeId, { source: "embedded" });
    if (!focused) return false;
    const selection = await requestCurrentInspectionSelection("workspace", identity.nodeId, "embedded");
    const current = await courseEditing.resolveSelection({
      projectSlug: identity.projectSlug,
      root: "workspace",
      htmlPath: identity.htmlPath,
      selection
    });
    if (!current || current.eligibility !== "editable") return false;
    setInlineEditorSelection(selection);
    return courseEditing.attachInlineEditorToPreview(current);
  };

  const openInlineEditorProperties = async () => {
    const selection = inlineEditorSelection;
    const current = inlineEditorStateRef.current;
    const identity = current.target?.identity;
    if (
      !selection ||
      !identity ||
      selection.nodeId !== identity.nodeId ||
      current.previewOwner !== "parent-inline" ||
      current.status === "detached"
    ) return;

    // Do not throw away a teacher's unsaved caret text just to expose the
    // link, image, formatting, or title controls. Saving a draft remains
    // browser-local; only Apply writes a course file.
    if (!["clean", "saved"].includes(current.status)) {
      const saved = await courseEditing.saveInlineEditor();
      if (!saved) return;
    }

    const latest = inlineEditorStateRef.current;
    if (
      !latest.target?.identity ||
      latest.target.identity.targetId !== identity.targetId ||
      latest.status === "detached"
    ) return;
    courseEditing.clearInlineEditor();
    setInlineEditorSelection(null);
    setInlineTargetEditorSelection(selection);
  };

  const activateInlineDraftInReview = async (draft: CourseEditDraft) => {
    const reopened = await courseEditing.activateInlineDraft(draft);
    const identity = reopened?.identity;
    if (!identity) return false;
    if (
      previewMode !== "workspace" ||
      workspaceTarget?.projectSlug !== identity.projectSlug ||
      workspaceTarget.htmlPath !== identity.htmlPath
    ) return true;

    const focused = await focusPreviewInspectionSelection("workspace", identity.nodeId, { source: "embedded" });
    if (!focused) return true;
    const selection = await requestCurrentInspectionSelection("workspace", identity.nodeId, "embedded");
    const current = await courseEditing.resolveSelection({
      projectSlug: identity.projectSlug,
      root: "workspace",
      htmlPath: identity.htmlPath,
      selection
    });
    if (!current || current.eligibility !== "editable" || current.identity?.targetId !== identity.targetId) return true;
    setInlineEditorSelection(selection);
    return courseEditing.attachInlineEditorToPreview(current);
  };

  const relinkReviewSetItem = (itemId: string) => {
    if (blockReviewMutationDuringCapture()) return;
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === itemId);
    if (!item) return;
    if (reviewSetItemEditLocked(item)) {
      setReviewSetStatus("Reopen this change before relinking its selection.", "warning");
      return;
    }
    if (reviewSetRelinkItemIdRef.current === itemId) {
      reviewSetRelinkItemIdRef.current = "";
      reviewSetRelinkReadyRef.current = false;
      setReviewSetRelinkItemId("");
      setPreviewInspectMode(false);
      setInspectEnabled(false);
      setReviewSetStatus("Relink canceled.", "neutral");
      return;
    }
    if (resolvedWorkspaceHtmlPath !== item.request.htmlPath) {
      revokeStandalonePreview("workspace");
    }
    reviewSetRelinkItemIdRef.current = itemId;
    reviewSetRelinkReadyRef.current = false;
    setReviewSetRelinkItemId(itemId);
    setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
    setWorkspaceHtmlSelections((current) => ({ ...current, [item.request.projectSlug]: item.request.htmlPath }));
    saveWorkspacePageSelection(item.request.projectSlug, item.request.htmlPath);
    setPreviewMode("workspace");
    setPreviewInspectMode(false);
    setInspectEnabled(false);
    setReviewSetStatus("Opening the saved course location…", "progress");
    void focusReviewSetItem(itemId, "embedded", false).then(() => {
      if (reviewSetRelinkItemIdRef.current !== itemId) return;
      reviewSetRelinkReadyRef.current = true;
      setPreviewInspectMode(true);
      setInspectEnabled(true);
      setReviewSetStatus("Select the replacement element in the course. The note and screenshots will stay attached.", "progress");
    });
  };

  const setCompareMode = (compareMode: boolean) => {
    courseEditing.closeLivePreview();
    persistAllVisibleScrollPositions();
    setLayoutPreferences((current) => ({ ...current, compareMode }));
  };

  const handlePreviewModeChange = (nextMode: PreviewMode) => {
    if (blockReviewMutationDuringCapture()) return;
    persistAllVisibleScrollPositions();
    syncFocusModeScrollPosition(previewMode, nextMode);
    if (nextMode !== previewMode) {
      courseEditing.closeLivePreview();
      resetInspection(true);
    }
    setPreviewMode(nextMode);
  };

  const handleOpenWorkspacePreview = () => {
    const activeInline = inlineEditorStateRef.current;
    if (
      activeInline.previewOwner === "parent-inline" &&
      activeInline.status !== "detached" &&
      activeInline.target?.identity
    ) {
      pendingStandaloneInlineTransferRef.current = {
        nodeId: activeInline.target.identity.nodeId,
        targetId: activeInline.target.identity.targetId,
        attempts: 0
      };
    }
    if (courseEditing.hasInteractiveInlinePreview) {
      // Full Preview receives the same canonical draft, but it must acquire
      // the editing lease. This releases the embedded caret first so two
      // Studio-owned editors can never cover the same learner element; once
      // Full Preview is ready, the durable target below transfers its caret.
      courseEditing.setInlinePreviewOwner("child-inert");
      setInlineEditorSelection(null);
      setStandaloneInlineEditorSelection(null);
    }
    courseEditing.closeLivePreview();
    const showSavedInlineDraft = () => {
      const inline = courseEditing.inlineEditor;
      if (
        inline.status === "saved" &&
        inline.previewAvailable &&
        inline.canonicalPatch &&
        Object.keys(inline.canonicalPatch).length
      ) {
        courseEditing.setInlinePreviewOwner("child-inert");
      }
    };
    persistAllVisibleScrollPositions();
    if (!previewSources.workspace || !["ready", "warning"].includes(previewRecovery.states.workspace.phase)) {
      setReviewSetStatus("The full preview will be available after this page passes its preview check.", "warning");
      return;
    }
    if (focusStandalonePreview("workspace", workspaceTarget ? getTargetKey(workspaceTarget) : "")) {
      showSavedInlineDraft();
      transferInlineEditorToStandaloneRef.current();
      setReviewSetStatus("Returned to the open full preview.", "success");
      return;
    }
    const connectedHref = prepareStandalonePreview(
      "workspace",
      previewSources.workspace,
      workspaceTarget ? getTargetKey(workspaceTarget) : ""
    );
    if (connectedHref) {
      const previewWindow = window.open(connectedHref, "_blank");
      if (!previewWindow) {
        setReviewSetStatus("The browser blocked the full preview. Allow pop-ups for Studio and try again.", "warning");
      } else {
        showSavedInlineDraft();
      }
    } else {
      setReviewSetStatus("The full preview could not open yet. Try again once the preview finishes loading.");
    }
  };

  const handleDeviceChange = (mode: PreviewMode, device: "desktop" | "tablet" | "mobile") => {
    courseEditing.closeLivePreview();
    setLayoutPreferences((current) => ({
      ...current,
      devices: {
        ...current.devices,
        [mode]: device
      }
    }));
  };

  const handleZoomChange = (mode: PreviewMode, zoom: number) => {
    courseEditing.closeLivePreview();
    setLayoutPreferences((current) => ({
      ...current,
      zooms: {
        ...current.zooms,
        [mode]: normalizeZoom(zoom)
      }
    }));
  };

  const handleWorkspaceProjectChange = (slug: string) => {
    if (blockReviewMutationDuringCapture()) return;
    if (slug === selectedSlug) return;
    persistAllVisibleScrollPositions();
    revokeStandalonePreview("workspace");
    resetInspection(true);
    if (inspectEnabled) stopAnnotationMode();
    setSelectedSlug(slug);
  };

  const handleWorkspaceHtmlChange = (htmlPath: string) => {
    if (blockReviewMutationDuringCapture()) return;
    revokeStandalonePreview("workspace");
    resetInspection(true);
    if (inspectEnabled) stopAnnotationMode();
    setWorkspaceHtmlSelections((current) => ({
      ...current,
      [selectedSlug]: htmlPath
    }));
    saveWorkspacePageSelection(selectedSlug, htmlPath);
  };

  const handleStudioModeChange = (nextMode: "course" | "assessment") => {
    if (nextMode === studioMode) return;
    if (blockReviewMutationDuringCapture()) return;
    if (nextMode === "assessment" && inspectEnabled) {
      stopAnnotationMode();
    }
    setStudioMode(nextMode);
  };

  const openWhatsNew = () => {
    whatsNewTriggerRef.current = document.activeElement as HTMLElement | null;
    setWhatsNewOpen(true);
  };

  const closeWhatsNew = () => {
    setWhatsNewOpen(false);
    window.requestAnimationFrame(() => whatsNewTriggerRef.current?.focus());
  };

  const toggleAnnotationMode = (keyboardEntry = false) => {
    if (selectionMode === "annotate") {
      stopAnnotationMode();
      return;
    }
    courseEditing.setEnabled(false);
    courseEditing.clearSelection();
    setSelectionMode("annotate");
    if (previewMode !== "workspace") {
      handlePreviewModeChange("workspace");
    }
    setPreviewInspectMode(true);
    setInspectEnabled(true);
    setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
    if (keyboardEntry) {
      beginKeyboardPreviewInspection();
    }
  };

  const toggleCourseEditMode = (keyboardEntry = false) => {
    if (selectionMode === "edit") {
      stopAnnotationMode();
      return;
    }
    if (!courseEditing.status.available || courseEditing.busy) return;
    if (previewMode !== "workspace") handlePreviewModeChange("workspace");
    resetInspection(true);
    setSelectionMode("edit");
    courseEditing.setEnabled(true);
    setPreviewInspectMode(true);
    setInspectEnabled(true);
    setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
    if (keyboardEntry) beginKeyboardPreviewInspection();
  };

  useEffect(() => {
    if (selectionMode !== "annotate" || inspectionResolving || !inspectionResolution) return;
    window.requestAnimationFrame(() => {
      const note = document.querySelector<HTMLTextAreaElement>('[data-testid="inspection-teacher-note"]');
      note?.focus();
      if (note) inspectionDraft.finishVisibleFeedback();
    });
  }, [inspectionDraft.finishVisibleFeedback, inspectionResolution, inspectionResolving, selectionMode]);

  const openReviewSet = () => {
    setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[data-testid="review-set"]')?.focus();
    });
  };

  const workspacePicker = selectedProject ? (
    <WorkspacePicker
      selectedSlug={selectedSlug}
      projects={projects}
      resolvedWorkspaceHtmlPath={resolvedWorkspaceHtmlPath}
      workspaceFileOptions={selectedProject.htmlFiles.workspace}
      onProjectChange={handleWorkspaceProjectChange}
      onHtmlChange={handleWorkspaceHtmlChange}
      onRefresh={() => void refreshProjects(true)}
    />
  ) : null;

  return (
    <div className="shell" data-testid="studio-shell">
      <main className="main-panel">
        <Topbar
          studioMode={studioMode}
          projects={projects}
          selectedSlug={selectedSlug}
          favoriteSlugs={favoriteSlugs}
          recentSlugs={recentSlugs}
          previewStatus={previewStatus}
          previewMessage={previewError}
          onStudioModeChange={handleStudioModeChange}
          onProjectChange={handleWorkspaceProjectChange}
          onToggleFavorite={toggleFavorite}
          onNewProject={() => setNewProjectOpen(true)}
          onOpenWhatsNew={openWhatsNew}
          onRetryPreview={retryPreview}
        />

        <WhatsNewPanel open={whatsNewOpen} onClose={closeWhatsNew} />

        <NewProjectPanel
          open={newProjectOpen}
          running={incomingRefreshRunning}
          message={incomingRefreshMessage}
          isError={incomingRefreshIsError}
          onClose={() => setNewProjectOpen(false)}
          onScan={() => void refreshIncoming()}
        />

        {studioMode === "course" ? (
          <CourseToolbar
            picker={workspacePicker}
            layoutPreferences={layoutPreferences}
            previewMode={previewMode}
            inspectEnabled={selectionMode === "annotate"}
            editEnabled={selectionMode === "edit"}
            editAvailable={courseEditing.status.available && !courseEditing.busy}
            editUnavailableReason={courseEditing.status.unavailableReason}
            editDraftCount={courseEditing.drafts.length}
            inspectAvailable={Boolean(previewOrigin) && ["ready", "warning"].includes(previewRecovery.states.workspace.phase)}
            hasWorkspacePreview={Boolean(previewSources.workspace) && ["ready", "warning"].includes(previewRecovery.states.workspace.phase)}
            reviewSetCount={reviewSetItems.length}
            toolsOpen={toolsOpen}
            onSetCompareMode={setCompareMode}
            onSetPreviewMode={handlePreviewModeChange}
            onDeviceChange={handleDeviceChange}
            onZoomChange={handleZoomChange}
            onToggleInspect={toggleAnnotationMode}
            onToggleEdit={toggleCourseEditMode}
            onToggleInspector={() => {
              const opening = !layoutPreferences.inspectorOpen;
              setLayoutPreferences((current) => ({ ...current, inspectorOpen: !current.inspectorOpen }));
              if (opening) window.requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-testid="review-set"]')?.focus());
            }}
            onToggleTools={() => setToolsOpen((current) => !current)}
            onOpenWorkspacePreview={handleOpenWorkspacePreview}
          />
        ) : null}

        {selectionMode === "annotate" && studioMode === "course" ? (
          <AnnotationModeBar
            savedCount={reviewSetItems.length}
            selectionReady={Boolean(inspectionResolution?.selection.nodeId)}
            draftScreenshotCount={screenshotAnnotation.drafts.length}
            capturing={screenshotAnnotation.status === "capturing"}
            onCapture={captureInspectionScreenshot}
            onCancelCapture={cancelReviewCapture}
            onOpenReviewSet={openReviewSet}
            onDone={stopAnnotationMode}
          />
        ) : null}

        {selectionMode === "edit" && studioMode === "course" ? (
          <EditModeBar
            draftCount={courseEditing.drafts.length}
            selectionReady={courseEditing.target?.eligibility === "editable"}
            busy={courseEditing.busy}
            onOpenDrafts={() => setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }))}
            onDone={stopAnnotationMode}
          />
        ) : null}

        {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}
        {previewError ? (
          <div className="error-banner connection-error" role="alert">
            <span>{previewError}</span>
            <button type="button" onClick={retryPreview}>Reconnect preview</button>
          </div>
        ) : null}

        {studioMode === "assessment" ? (
          <AssessmentLibraryMode />
        ) : (
          <div className={layoutPreferences.inspectorOpen ? "workspace-grid inspector-open" : "workspace-grid"}>
            <section className="preview-workspace" data-testid="preview-workspace">
              {toolsOpen && selectedProject ? (
                <section className="course-tools-panel" id="course-tools-panel" aria-label="Course tools">
                  <div className="course-tools-heading">
                    <div>
                      <strong>Course tools</strong>
                      <span>Run project checks and exports when you need them.</span>
                    </div>
                    <button type="button" className="ghost-button compact" onClick={() => setToolsOpen(false)}>Close</button>
                  </div>
                  <CommandToolbar
                    commandStatus={commandStatus}
                    commandOutputVisible={commandOutputVisible}
                    commandBanner={commandBanner}
                    commandBannerIsError={commandBannerIsError}
                    commandLog={commandLog}
                    anyCommandRunning={anyCommandRunning}
                    onRunCommand={(command) => void runProjectCommand(command)}
                    onToggleOutput={() => setCommandOutputVisible((current) => !current)}
                  />
                </section>
              ) : null}
              {selectedProject ? (
                <div
                  className={layoutPreferences.compareMode ? "preview-deck split" : "preview-deck focus"}
                  data-testid="project-root"
                >
                  {visiblePreviewModes.map((mode) => {
                    const controlsVisible = paneControlsVisible[mode];
                    const resourcePreview =
                      mode === "reference" && resolvedReference.target.source === "resource"
                        ? {
                            resourcePath: resolvedReference.target.resourcePath,
                            resourceRoot: resolvedReference.target.resourceRoot,
                            previewUrl: previewSources.reference,
                            extractedFallbackPath: selectedResourceExtractedPath,
                            onOpenExtractedText: () => {
                              if (!selectedResourceExtractedPath) {
                                return;
                              }

                              persistAllVisibleScrollPositions();
                              resetInspection(true);
                              setReferenceTarget((current) => ({
                                ...current,
                                source: "resource",
                                resourceRoot: "extracted",
                                resourcePath: selectedResourceExtractedPath
                              }));
                            },
                            isViewingSelectedExtractedText:
                              resolvedReference.target.resourceRoot === "extracted" &&
                              resolvedReference.target.resourcePath === selectedResourceExtractedPath &&
                              Boolean(selectedResourceExtractedPath)
                          }
                        : undefined;

                    return (
                      <PreviewPane
                        key={mode}
                        mode={mode}
                        previewMode={previewMode}
                        layoutPreferences={layoutPreferences}
                        controlsVisible={controlsVisible}
                        onToggleControls={(nextMode) =>
                          setPaneControlsVisible((current) => ({
                            ...current,
                            [nextMode]: !current[nextMode]
                          }))
                        }
                        onMatch={(nextMode) =>
                          copyPreviewModeScrollPosition(nextMode === "workspace" ? "reference" : "workspace", nextMode)
                        }
                        onFit={fitPreviewToWidth}
                        onDeviceChange={handleDeviceChange}
                        onZoomChange={handleZoomChange}
                        registerPreviewFrame={registerPreviewFrame}
                        onPreviewLoad={attachPreviewPersistence}
                        onPreviewFrameLoad={previewRecovery.markFrameLoaded}
                        previewSrc={previewSources[mode]}
                        recoveryState={previewRecovery.states[mode]}
                        onRetryPreview={previewRecovery.retry}
                        onOpenAnotherPage={openAnotherPreviewPage}
                        onCopyPreviewIssue={copyPreviewIssue}
                        picker={
                          mode === "reference" ? (
                            <ReferencePicker
                              target={resolvedReference.target}
                              projects={projects}
                              htmlOptions={referenceFileOptions}
                              resourceOptions={referenceResourceOptions}
                              incomingRefreshRunning={incomingRefreshRunning}
                              incomingRefreshMessage={incomingRefreshMessage}
                              incomingRefreshIsError={incomingRefreshIsError}
                              onProjectChange={(slug) => {
                                persistAllVisibleScrollPositions();
                                resetInspection(true);
                                setReferenceTarget((current) => ({ ...current, projectSlug: slug }));
                              }}
                              onSourceChange={(source) => {
                                persistAllVisibleScrollPositions();
                                resetInspection(true);
                                setReferenceTarget((current) => ({ ...current, source }));
                              }}
                              onRootChange={(root) => {
                                persistAllVisibleScrollPositions();
                                resetInspection(true);
                                setReferenceTarget((current) => ({ ...current, root }));
                              }}
                              onHtmlChange={(htmlPath) => {
                                persistAllVisibleScrollPositions();
                                resetInspection(true);
                                setReferenceTarget((current) => ({ ...current, htmlPath }));
                              }}
                              onResourceRootChange={(resourceRoot) => {
                                persistAllVisibleScrollPositions();
                                resetInspection(true);
                                setReferenceTarget((current) => ({ ...current, resourceRoot }));
                              }}
                              onResourcePathChange={(resourcePath) => {
                                persistAllVisibleScrollPositions();
                                resetInspection(true);
                                setReferenceTarget((current) => ({ ...current, resourcePath }));
                              }}
                              onRefreshIntake={() => void refreshIncoming()}
                            />
                          ) : null
                        }
                        resourcePreview={resourcePreview}
                        inlineTextEditor={mode === "workspace" ? {
                          editor: courseEditing.inlineEditor,
                          selection: inlineEditorSelection,
                          onChange: courseEditing.setInlineEditorText,
                          onSave: courseEditing.saveInlineEditor,
                          onCancel: () => {
                            courseEditing.clearInlineEditor();
                            setInlineEditorSelection(null);
                            setInlineTargetEditorSelection(null);
                          },
                          onActivate: () => { courseEditing.setInlinePreviewOwner("parent-inline"); },
                          onOpenProperties: openInlineEditorProperties
                        } : undefined}
                        inlineTargetEditor={mode === "workspace" ? {
                          target: courseEditing.target,
                          drafts: courseEditing.drafts,
                          selection: inlineTargetEditorSelection,
                          busy: courseEditing.busy,
                          onSave: courseEditing.saveTarget,
                          onUploadImage: courseEditing.uploadImage,
                          onPreview: courseEditing.previewTargetPatch,
                          onClose: () => {
                            courseEditing.closeLivePreview();
                            setInlineTargetEditorSelection(null);
                          }
                        } : undefined}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="empty-preview" data-testid="empty-preview">
                  Import a project to start previewing it here.
                </div>
              )}
            </section>

            {layoutPreferences.inspectorOpen ? (
              <InspectorPanel
                editEnabled={selectionMode === "edit"}
                editTarget={courseEditing.target}
                editResolving={courseEditing.resolving}
                editDrafts={courseEditing.drafts}
                editBusy={courseEditing.busy}
                editFeedback={courseEditing.feedback}
                editCanUndo={courseEditing.status.canUndo}
                editUndoUnavailableReason={courseEditing.status.undoUnavailableReason}
                editCanRenameCourse={courseEditing.status.canRenameCourse}
                editCourseTitle={courseEditing.status.courseTitle}
                editExportsOutOfDate={courseEditing.status.exportsOutOfDate}
                editStaleExportTargets={courseEditing.status.staleExportTargets}
                editPreviewFeedback={courseEditing.previewFeedback}
                editHasLivePreview={courseEditing.hasLivePreview}
                editInlineEditor={courseEditing.inlineEditor}
                onPreviewEditTarget={courseEditing.previewTargetPatch}
                onClearEditPreview={courseEditing.closeLivePreview}
                onSaveEditTarget={courseEditing.saveTarget}
                onUpdateEditDraft={courseEditing.editDraft}
                onReopenEditDraft={(draft) => { void reopenCourseEditDraft(draft); }}
                onRemoveEditDraft={courseEditing.removeDraft}
                onReorderEditDraft={courseEditing.reorderDraft}
                onApplyEditDrafts={() => void courseEditing.apply()}
                onUndoEditBatch={() => void courseEditing.undo()}
                onExportEditDrafts={courseEditing.exportDrafts}
                onImportEditDrafts={courseEditing.importDrafts}
                onUploadEditImage={courseEditing.uploadImage}
                onRenameCourse={courseEditing.renameCourse}
                onInlineEditorTextChange={courseEditing.setInlineEditorText}
                onSaveInlineEditor={courseEditing.saveInlineEditor}
                onActivateInlineDraft={activateInlineDraftInReview}
                onSetInlinePreviewOwner={courseEditing.setInlinePreviewOwner}
                onReopenInlineEditor={courseEditing.reopenInlineEditor}
                onRebaseInlineEditor={courseEditing.rebaseInlineEditor}
                onCopyInlineEditorText={courseEditing.copyInlineEditorText}
                onDiscardInlineEditor={() => {
                  courseEditing.clearInlineEditor();
                  setInlineEditorSelection(null);
                }}
                onJumpToInlineEditor={jumpToInlineEditor}
                onAnnotateEditTarget={annotateLastEditSelection}
                inspectEnabled={selectionMode === "annotate"}
                inspectionResolution={inspectionResolution}
                inspectionResolving={inspectionResolving}
                inspectionTeacherNote={inspectionTeacherNote}
                inspectionIssueCategory={inspectionIssueCategory}
                screenshotSupported={screenshotAnnotation.isSupported}
                screenshotCanCapture={!courseEditing.hasLivePreview && Boolean(inspectionResolution?.selection.nodeId) && screenshotAnnotation.drafts.length < REVIEW_SCREENSHOT_MAX_PER_ITEM}
                screenshotStatus={screenshotAnnotation.status}
                screenshotError={screenshotAnnotation.error}
                screenshots={screenshotAnnotation.drafts}
                onInspectionTeacherNoteChange={setInspectionTeacherNote}
                onInspectionIssueCategoryChange={setInspectionIssueCategory}
                onSaveCurrentInspection={addCurrentInspectionToReviewSet}
                onCaptureScreenshot={captureInspectionScreenshot}
                onCancelScreenshot={cancelReviewCapture}
                onCropScreenshot={cropInspectionScreenshot}
                onDownloadScreenshot={screenshotAnnotation.download}
                onDiscardScreenshot={screenshotAnnotation.remove}
                reviewSetItems={reviewSetItems}
                reviewSessionName={reviewSessionName}
                activeReviewSessionId={reviewSessionIdRef.current}
                reviewSessions={reviewSessions}
                reviewSetPacketByteLength={reviewSetPacketReady ? preparedReviewSet?.byteLength ?? 0 : 0}
                reviewSetHandoffDetail={reviewSetHandoffDetail}
                reviewSetCanAddCurrent={reviewSetAddAvailability.canAdd}
                reviewSetAddDisabledReason={reviewSetAddAvailability.reason}
                reviewSetStatus={reviewFeedback.message}
                reviewSetStatusTone={reviewFeedback.tone}
                reviewSetPreparing={reviewSetPreparing}
                reviewSetSaving={reviewSetSaving}
                reviewSetPacketReady={reviewSetPacketReady}
                reviewSetPacketError={reviewSetPacketError}
                reviewSetManualPacket={manualCopySnapshot?.packet ?? ""}
                reviewSetManualCopyVisible={Boolean(manualCopySnapshot)}
                reviewSetCopying={reviewSetCopying}
                reviewSetPersistenceError={reviewSetPersistenceError}
                reviewSetCaptureItemId={reviewSetCaptureItemId}
                reviewSetRelinkItemId={reviewSetRelinkItemId}
                reviewSetUndoLabel={reviewUndo?.label ?? ""}
                onClearReviewSet={() => clearReviewSet("Cleared saved items.")}
                onRemoveReviewSetItem={removeReviewSetItem}
                onFocusReviewSetItem={focusReviewSetItem}
                onReviewSetTeacherNoteChange={changeReviewSetTeacherNote}
                onReviewSetMetadataChange={changeReviewSetMetadata}
                onReorderReviewSetItem={reorderReviewSetItem}
                onDuplicateReviewSetItem={duplicateReviewSetItem}
                onMoveReviewSetItem={moveReviewSetItem}
                onAddReviewSetScreenshot={(id) => void addScreenshotToReviewSetItem(id)}
                onRetakeReviewSetScreenshot={(itemId, screenshotId) => void retakeReviewSetScreenshot(itemId, screenshotId)}
                onCropReviewSetScreenshot={(itemId, screenshotId) => void cropReviewSetScreenshot(itemId, screenshotId)}
                onCancelReviewSetScreenshotCapture={cancelReviewCapture}
                onRemoveReviewSetScreenshot={removeReviewSetScreenshot}
                onReorderReviewSetScreenshot={reorderReviewSetScreenshot}
                onRelinkReviewSetItem={relinkReviewSetItem}
                onRetryReviewSetAnchor={retryReviewSetAnchor}
                onToggleReviewSetResolved={toggleReviewSetResolved}
                onAcceptReviewSetItem={acceptReviewSetItem}
                onReopenReviewSetItem={reopenReviewSetItem}
                onReviewSetHandoffDetailChange={(detail) => {
                  invalidateReviewSetPreparation();
                  setReviewSetHandoffDetail(detail);
                  setReviewSetStatus(detail === "compact" ? "Compact Codex handoff selected." : "Full diagnostic handoff selected.", "neutral");
                }}
                onCopyReviewSet={copyReviewSet}
                onConfirmManualReviewSetSent={confirmManualReviewSetSent}
                onUndoReviewSet={undoLastReviewChange}
                onReviewSessionChange={switchReviewSession}
                onNewReviewSession={createReviewSession}
                onRenameReviewSession={renameReviewSession}
                onDeleteReviewSession={deleteReviewSession}
                onMergeReviewSession={mergeReviewSession}
                onExportReviewSetMarkdown={exportReviewSetMarkdown}
                onExportReviewSetJson={exportReviewSetJson}
                onImportReviewSetJson={(file) => void importReviewSetJson(file)}
              />
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
