import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

import { CommandToolbar } from "./components/CommandToolbar";
import { AnnotationModeBar } from "./components/AnnotationModeBar";
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
import { toPreviewUrl, toReferenceResourcePreviewUrl } from "./lib/preview-urls";
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
import type {
  PreviewInspectPayload,
  PreviewReviewAction,
  PreviewReviewActionResult,
  PreviewReviewState
} from "../../shared/preview-bridge.js";
import { STUDIO_BRIDGE_LIMITS, STUDIO_REVIEW_LIMITS } from "../../shared/studio-quality.js";

const {
  items: {
    create: createReviewSetItem,
    identity: reviewSetItemIdentity,
    hasSameMaterialResolution
  },
  packet: { build: buildReviewSetPacket },
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

const REVIEW_UNDO_WINDOW_MS = 10_000;

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
  const [reviewSetPacketError, setReviewSetPacketError] = useState("");
  const [manualCopyVisible, setManualCopyVisible] = useState(false);
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
  const learnerModeLabel = selectedProject ? selectedProject.effectiveLearnerMode : "off";
  const learnerModeDisplay = learnerModeLabel[0].toUpperCase() + learnerModeLabel.slice(1);

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

  const blockReviewMutationDuringCapture = useCallback(() => {
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
    setPreparedReviewSet(null);
    setReviewSetPacketError("");
    setManualCopyVisible(false);
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
    setReviewSetSaving(false);
    setReviewSetPreparing(false);
    setPreparedReviewSet(null);
    setReviewSetPacketError("");
    setManualCopyVisible(false);
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
  }, [disposeReviewUndo, selectedSlug, setReviewSetStatus]);

  useEffect(() => {
    resetInspection(true);
  }, [inspectionContextKey, resetInspection]);

  const resolveInspection = async (
    mode: PreviewMode,
    selection: PreviewInspectPayload,
    source: "embedded" | "standalone"
  ) => {
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

  const {
    registerPreviewFrame,
    attachPreviewPersistence,
    persistAllVisibleScrollPositions,
    copyPreviewModeScrollPosition,
    syncFocusModeScrollPosition,
    fitPreviewToWidth,
    prepareStandalonePreview,
    requestCurrentInspectionSelection,
    setPreviewInspectMode,
    beginKeyboardPreviewInspection,
    focusPreviewInspectionSelection,
    restorePreviewLocation,
    syncStandaloneReviewSet,
    sendStandaloneReviewActionResult
  } = usePreviewScrollSync({
    previewMode,
    layoutPreferences,
    setLayoutPreferences,
    selectedProject,
    workspaceTarget,
    referenceTarget: resolvedReference.target,
    previewOrigin,
    inspectEnabled,
    onInspectSelection: (mode, selection, source) => void resolveInspection(mode, selection, source),
    onInspectModeChange: (enabled, source) => {
      setInspectEnabled(enabled);
      if (!enabled && source === "embedded") {
        window.requestAnimationFrame(() => {
          document.querySelector<HTMLElement>('[data-testid="inspect-toggle"]')?.focus();
        });
      }
    },
    onPreviewNavigation: (mode, href, source) => {
      if (source === "embedded") previewRecovery.markNavigation(mode, href);
      if (mode === "workspace") {
        resetInspection(true);
      }
    },
    onPreviewReady: (mode, href, source) => {
      if (source === "embedded") previewRecovery.markBridgeReady(mode, href);
    },
    onPreviewHealth: (mode, health, source) => {
      if (source === "embedded") previewRecovery.markContentHealth(mode, health);
    },
    onPreviewDiagnostic: (mode, diagnostic, source) => {
      if (source === "embedded") previewRecovery.addDiagnostic(mode, diagnostic);
    },
    onPreviewReviewAction: (mode, action) => standaloneReviewActionRef.current(mode, action),
    onStandaloneReturn: () => {
      setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
      window.focus();
    }
  });

  const stopAnnotationMode = useCallback(() => {
    if (reviewSetRelinkItemIdRef.current) {
      reviewSetRelinkItemIdRef.current = "";
      setReviewSetRelinkItemId("");
      setReviewSetStatus("Relink canceled.", "neutral");
    }
    setPreviewInspectMode(false);
    setInspectEnabled(false);
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[data-testid="inspect-toggle"]')?.focus();
    });
  }, [setPreviewInspectMode, setReviewSetStatus]);

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
  }, [inspectionPreviewMode, inspectionRequest, inspectionResolution, inspectionTeacherNote, previewMode, reviewSetItems, reviewSetSaving, selectedSlug]);

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
    if (!reviewSetItemsRef.current.some((item) => item.id === id)) {
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
    if (!item) return;
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
    if (!item) return;
    invalidateReviewSetPreparation();
    replaceReviewSetItems(reviewSetItemsRef.current.map((candidate) => candidate.id === id ? {
      ...candidate,
      resolved: !candidate.resolved
    } : candidate));
    setReviewSetStatus(item.resolved ? "Annotation reopened." : "Annotation marked resolved.", "success");
  };

  const retryReviewSetAnchor = (id: string) => {
    if (!reviewSetItemsRef.current.some((item) => item.id === id)) return;
    invalidateReviewSetPreparation();
    replaceReviewSetItems(reviewSetItemsRef.current.map((item) => item.id === id ? { ...item, anchorState: "ready" } : item));
    setReviewSetStatus("Checking the saved selection again…", "progress");
  };

  const reviewItemsFitPacket = (items: ReviewSetItem[]) => {
    const openItems = items.filter((item) => !item.resolved);
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
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === id);
    if (!item || reviewSetItemsRef.current.length >= REVIEW_SET_MAX_ITEMS) {
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
    if (!preparedReviewSet || !reviewSetPacketReady) {
      setReviewSetStatus("Wait until this Review Set is ready before exporting it.", "warning");
      return;
    }
    downloadTextFile(`${selectedSlug}-${reviewSessionNameRef.current.replace(/[^A-Za-z0-9_-]+/g, "-")}.md`, preparedReviewSet.packet, "text/markdown;charset=utf-8");
    setReviewSetStatus("Markdown handoff exported.", "success");
  };

  const exportReviewSetJson = () => {
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
      reviewCaptureBusyRef.current || !item || !screenshot || !item.request.selection.nodeId ||
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
      reviewCaptureBusyRef.current || !item || !screenshot || screenshot.cropped ||
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
      reviewCaptureBusyRef.current ||
      !item ||
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
    const savedItems = allItems.filter((item) => !item.resolved);
    if (!savedItems.length) {
      setPreparedReviewSet(null);
      setReviewSetPacketError("");
      if (allItems.length) setReviewSetStatus("All annotations in this review are resolved.", "success");
      return;
    }
    const blockedAnchorIndex = savedItems.findIndex((item) => item.anchorState !== "ready");
    if (blockedAnchorIndex >= 0) {
      const blockedItem = savedItems[blockedAnchorIndex];
      const message = blockedItem.anchorState === "changed"
        ? `Annotation ${blockedAnchorIndex + 1} changed after the page was rebuilt. Check it or relink the selection.`
        : `Annotation ${blockedAnchorIndex + 1} needs relinking or another anchor check before copying.`;
      setPreparedReviewSet(null);
      setReviewSetPacketError(message);
      setReviewSetStatus(message, "warning");
      return;
    }
    if (savedItems.some((item) => !item.teacherNote.trim())) {
      setPreparedReviewSet(null);
      setReviewSetPacketError("Add a note to every annotation before copying.");
      setReviewSetStatus("Add a note to every annotation before copying.", "warning");
      return;
    }

    reviewSetPreparationAbortRef.current?.abort();
    const controller = new AbortController();
    reviewSetPreparationAbortRef.current = controller;
    const preparationVersion = reviewSetVersionRef.current;
    setReviewSetPreparing(true);
    setPreparedReviewSet(null);
    setReviewSetPacketError("");
    setManualCopyVisible(false);
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
          items: items.map(({ item, resolution }) => ({ item, resolution }))
        });
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
  }, [reviewSetItems]);

  const reviewSetPacketReady = useMemo(() => {
    if (!preparedReviewSet || reviewSetPreparing || reviewSetPacketError) {
      return false;
    }
    return preparedReviewSet.itemIds.join("\u001f") === reviewSetItems.filter((item) => !item.resolved).map((item) => item.id).join("\u001f");
  }, [preparedReviewSet, reviewSetItems, reviewSetPacketError, reviewSetPreparing]);

  const previewReviewState = useMemo<PreviewReviewState>(() => ({
    sessionId: reviewScreenshotSessionIdRef.current,
    items: reviewSetItems.map((item) => ({
      id: item.id,
      projectSlug: item.request.projectSlug,
      nodeId: item.request.selection.nodeId ?? "",
      excerpt: item.excerpt,
      teacherNote: item.teacherNote,
      screenshots: item.screenshots.map((screenshot) => ({
        id: screenshot.id,
        filePath: screenshot.filePath
      }))
    })),
    draftScreenshotCount: screenshotAnnotation.drafts.length,
    captureItemId: reviewSetCaptureItemId,
    saving: reviewSetSaving,
    preparing: reviewSetPreparing,
    packetReady: reviewSetPacketReady,
    status: (reviewFeedback.tone === "error" ? "" : reviewFeedback.message).slice(0, STUDIO_BRIDGE_LIMITS.reviewStatusCodeUnits),
    error: (reviewSetPacketError || reviewSetPersistenceError || (reviewFeedback.tone === "error" ? reviewFeedback.message : "")).slice(0, STUDIO_BRIDGE_LIMITS.reviewStatusCodeUnits),
    undoLabel: reviewUndo?.label ?? ""
  }), [reviewFeedback, reviewSetCaptureItemId, reviewSetItems, reviewSetPacketError, reviewSetPacketReady, reviewSetPersistenceError, reviewSetPreparing, reviewSetSaving, reviewUndo, screenshotAnnotation.drafts.length]);

  useEffect(() => {
    syncStandaloneReviewSet(
      "workspace",
      previewReviewState,
      reviewSetPacketReady ? preparedReviewSet?.packet ?? "" : ""
    );
  }, [preparedReviewSet, previewReviewState, reviewSetPacketReady, syncStandaloneReviewSet]);

  const copyReviewSet = () => {
    if (!preparedReviewSet || !reviewSetPacketReady) {
      return;
    }
    const currentIds = reviewSetItemsRef.current.filter((item) => !item.resolved).map((item) => item.id);
    if (preparedReviewSet.itemIds.join("\u001f") !== currentIds.join("\u001f")) {
      setReviewSetStatus("This Review Set changed. Prepare it again before copying.", "warning");
      return;
    }
    const feedbackSequence = setReviewSetStatus("Copying Review Set…", "progress");
    setManualCopyVisible(false);
    const clipboardWrite = navigator.clipboard && typeof navigator.clipboard.writeText === "function"
      ? navigator.clipboard.writeText(preparedReviewSet.packet)
      : Promise.reject(new Error("Clipboard access is unavailable."));
    void clipboardWrite
      .then(() => completeReviewSetStatus(
        feedbackSequence,
        preparedReviewSet.screenshotCount
          ? `Copied with ${preparedReviewSet.screenshotCount} screenshot path${preparedReviewSet.screenshotCount === 1 ? "" : "s"}. Paste this into a Codex task.`
          : "Copied. Paste this one packet into a Codex task.",
        "success"
      ))
      .catch(() => {
        if (completeReviewSetStatus(
          feedbackSequence,
          "Clipboard access was blocked. Copy the packet shown below.",
          "error"
        )) {
          setManualCopyVisible(true);
        }
      });
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
    if (action.action === "request-state") {
      syncStandaloneReviewSet(
        mode,
        previewReviewState,
        reviewSetPacketReady ? preparedReviewSet?.packet ?? "" : ""
      );
      return;
    }
    if (mode !== "workspace") {
      respond({
        ok: false,
        message: "Annotations can be saved from the Workspace preview.",
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
      void addScreenshotToReviewSetItem(action.itemId, "standalone")
        .then((ok) => respond({
          ok,
          message: ok ? "Screenshot added." : "Could not capture the screenshot.",
          clearDraft: false
        }));
      return;
    }
    if (action.action === "focus-item") {
      void focusReviewSetItemRef.current(action.itemId, "standalone").then((focused) =>
        respond({
          ok: focused,
          message: focused ? "Annotation shown." : "The saved course page could not be shown. Try again.",
          clearDraft: false
        })
      );
      return;
    }
    if (action.action === "remove") {
      if (!reviewSetItemsRef.current.some((item) => item.id === action.itemId)) {
        respond({ ok: false, message: "That annotation is no longer saved.", clearDraft: false });
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
      removeReviewSetScreenshot(action.itemId, action.screenshotId);
      respond({ ok: true, message: "Screenshot removed.", clearDraft: false });
      return;
    }
    if (action.action === "update-note") {
      if (!reviewSetItemsRef.current.some((item) => item.id === action.itemId)) {
        respond({ ok: false, message: "That annotation is no longer saved.", clearDraft: false });
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
      clearReviewSet("Review Set cleared.");
      respond({ ok: true, message: "Review Set cleared.", clearDraft: true });
    }
  };

  const captureInspectionScreenshot = () => {
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

  const relinkReviewSetItem = (itemId: string) => {
    if (blockReviewMutationDuringCapture()) return;
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === itemId);
    if (!item) return;
    if (reviewSetRelinkItemIdRef.current === itemId) {
      reviewSetRelinkItemIdRef.current = "";
      reviewSetRelinkReadyRef.current = false;
      setReviewSetRelinkItemId("");
      setPreviewInspectMode(false);
      setInspectEnabled(false);
      setReviewSetStatus("Relink canceled.", "neutral");
      return;
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
    persistAllVisibleScrollPositions();
    setLayoutPreferences((current) => ({ ...current, compareMode }));
  };

  const handlePreviewModeChange = (nextMode: PreviewMode) => {
    if (blockReviewMutationDuringCapture()) return;
    persistAllVisibleScrollPositions();
    syncFocusModeScrollPosition(previewMode, nextMode);
    if (nextMode !== previewMode) {
      resetInspection(true);
    }
    setPreviewMode(nextMode);
  };

  const handleOpenWorkspacePreview = () => {
    persistAllVisibleScrollPositions();
    if (!previewSources.workspace || !["ready", "warning"].includes(previewRecovery.states.workspace.phase)) {
      setReviewSetStatus("The full preview will be available after this page passes its preview check.", "warning");
      return;
    }
    const connectedHref = prepareStandalonePreview("workspace", previewSources.workspace);
    if (connectedHref) {
      const previewWindow = window.open(connectedHref, "_blank");
      if (!previewWindow) {
        setReviewSetStatus("The browser blocked the full preview. Allow pop-ups for Studio and try again.", "warning");
      }
    } else {
      setReviewSetStatus("The full preview could not open yet. Try again once the preview finishes loading.");
    }
  };

  const handleDeviceChange = (mode: PreviewMode, device: "desktop" | "tablet" | "mobile") => {
    setLayoutPreferences((current) => ({
      ...current,
      devices: {
        ...current.devices,
        [mode]: device
      }
    }));
  };

  const handleZoomChange = (mode: PreviewMode, zoom: number) => {
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
    persistAllVisibleScrollPositions();
    resetInspection(true);
    setSelectedSlug(slug);
  };

  const handleWorkspaceHtmlChange = (htmlPath: string) => {
    if (blockReviewMutationDuringCapture()) return;
    resetInspection(true);
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
    if (inspectEnabled) {
      stopAnnotationMode();
      return;
    }
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

  useEffect(() => {
    if (!inspectEnabled || inspectionResolving || !inspectionResolution) return;
    window.requestAnimationFrame(() => {
      const note = document.querySelector<HTMLTextAreaElement>('[data-testid="inspection-teacher-note"]');
      note?.focus();
      if (note) inspectionDraft.finishVisibleFeedback();
    });
  }, [inspectEnabled, inspectionDraft.finishVisibleFeedback, inspectionResolution, inspectionResolving]);

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
            learnerMode={learnerModeDisplay}
            inspectEnabled={inspectEnabled}
            inspectAvailable={Boolean(previewOrigin) && ["ready", "warning"].includes(previewRecovery.states.workspace.phase)}
            hasWorkspacePreview={Boolean(previewSources.workspace) && ["ready", "warning"].includes(previewRecovery.states.workspace.phase)}
            reviewSetCount={reviewSetItems.length}
            toolsOpen={toolsOpen}
            onSetCompareMode={setCompareMode}
            onSetPreviewMode={handlePreviewModeChange}
            onDeviceChange={handleDeviceChange}
            onZoomChange={handleZoomChange}
            onToggleInspect={toggleAnnotationMode}
            onToggleInspector={() => {
              const opening = !layoutPreferences.inspectorOpen;
              setLayoutPreferences((current) => ({ ...current, inspectorOpen: !current.inspectorOpen }));
              if (opening) window.requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-testid="review-set"]')?.focus());
            }}
            onToggleTools={() => setToolsOpen((current) => !current)}
            onOpenWorkspacePreview={handleOpenWorkspacePreview}
          />
        ) : null}

        {inspectEnabled && studioMode === "course" ? (
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
                inspectEnabled={inspectEnabled}
                inspectionResolution={inspectionResolution}
                inspectionResolving={inspectionResolving}
                inspectionTeacherNote={inspectionTeacherNote}
                inspectionIssueCategory={inspectionIssueCategory}
                screenshotSupported={screenshotAnnotation.isSupported}
                screenshotCanCapture={Boolean(inspectionResolution?.selection.nodeId) && screenshotAnnotation.drafts.length < REVIEW_SCREENSHOT_MAX_PER_ITEM}
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
                reviewSetCanAddCurrent={reviewSetAddAvailability.canAdd}
                reviewSetAddDisabledReason={reviewSetAddAvailability.reason}
                reviewSetStatus={reviewFeedback.message}
                reviewSetStatusTone={reviewFeedback.tone}
                reviewSetPreparing={reviewSetPreparing}
                reviewSetPacketReady={reviewSetPacketReady}
                reviewSetPacketError={reviewSetPacketError}
                reviewSetManualPacket={reviewSetPacketReady ? preparedReviewSet?.packet ?? "" : ""}
                reviewSetManualCopyVisible={manualCopyVisible}
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
                onCopyReviewSet={copyReviewSet}
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
