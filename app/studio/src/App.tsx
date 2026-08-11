import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

import { CommandToolbar } from "./components/CommandToolbar";
import { AnnotationModeBar } from "./components/AnnotationModeBar";
import { InspectorPanel } from "./components/InspectorPanel";
import { PreviewPane } from "./components/PreviewPane";
import { ReferencePicker } from "./components/ReferencePicker";
import { AssessmentLibraryMode } from "./components/AssessmentLibraryMode";
import { Topbar } from "./components/Topbar";
import { WorkspacePicker } from "./components/WorkspacePicker";
import { useLayoutPreferences } from "./hooks/useLayoutPreferences";
import { usePreviewScrollSync } from "./hooks/usePreviewScrollSync";
import { usePreviewRuntime } from "./hooks/usePreviewRuntime";
import {
  capturePreviewScreenshot,
  releaseScreenshotDraft,
  type ScreenshotDraft,
  useScreenshotAnnotation
} from "./hooks/useScreenshotAnnotation";
import { useProjectCommands } from "./hooks/useProjectCommands";
import { useProjects } from "./hooks/useProjects";
import { useReferenceTarget } from "./hooks/useReferenceTarget";
import { useStudioSelection } from "./hooks/useStudioSelection";
import {
  normalizeZoom,
  previewModes,
  type PreviewMode
} from "./lib/types";
import { toPreviewUrl, toReferenceResourcePreviewUrl } from "./lib/preview-urls";
import {
  buildReviewSetPacket,
  createReviewSetItem,
  hasSameMaterialResolution,
  REVIEW_SET_MAX_ITEMS,
  REVIEW_SET_NOTE_MAX_BYTES,
  reviewSetItemIdentity,
  utf8ByteLength,
  type PreparedReviewSetPacket,
  type ReviewSetItem,
  type ReviewSetScreenshot
} from "./lib/review-set";
import {
  createReviewScreenshotSessionId,
  deleteReviewScreenshotPaths,
  persistReviewScreenshot,
  reviewScreenshotImageUrl,
  verifyReviewScreenshots,
  type OwnedReviewScreenshotPath,
  type ReviewScreenshotOwner
} from "./lib/review-screenshots";
import { clearStoredReviewSet, loadStoredReviewSet, saveStoredReviewSet } from "./lib/review-set-storage";
import { hasSamePreviewPageRoute, runWithCurrentPreviewSelection } from "./lib/current-preview-selection";
import {
  REVIEW_SCREENSHOT_MAX_PER_ITEM,
  type InspectionResolution,
  type InspectionResolveRequest,
  type InspectionSelection
} from "../../shared/inspection.js";
import type {
  PreviewInspectPayload,
  PreviewReviewAction,
  PreviewReviewState
} from "../../shared/preview-bridge.js";

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
        height: persisted.height
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
    ownerNodeId
  }));
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
  const { layoutPreferences, setLayoutPreferences, paneControlsVisible, setPaneControlsVisible } =
    useLayoutPreferences();
  const { previewOrigin, previewError } = usePreviewRuntime();
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

  const [workspaceHtmlSelections, setWorkspaceHtmlSelections] = useState<Record<string, string>>({});
  const [studioMode, setStudioMode] = useState<"course" | "assessment">("course");
  const [inspectEnabled, setInspectEnabled] = useState(false);
  const [inspectionResolution, setInspectionResolution] = useState<InspectionResolution | null>(null);
  const [inspectionRequest, setInspectionRequest] = useState<InspectionResolveRequest | null>(null);
  const [inspectionResolving, setInspectionResolving] = useState(false);
  const [inspectionTeacherNote, setInspectionTeacherNote] = useState("");
  const [inspectionPreviewMode, setInspectionPreviewMode] = useState<PreviewMode>("workspace");
  const inspectionSourceRef = useRef<"embedded" | "standalone">("embedded");
  const inspectionScopeVersionRef = useRef(0);
  const screenshotAnnotation = useScreenshotAnnotation();
  const [initialReviewSet] = useState(loadStoredReviewSet);
  const restoredReviewScopePendingRef = useRef(Boolean(initialReviewSet?.items.length));
  const [reviewSetItems, setReviewSetItems] = useState<ReviewSetItem[]>(() => initialReviewSet?.items ?? []);
  const reviewSetItemsRef = useRef<ReviewSetItem[]>(initialReviewSet?.items ?? []);
  const reviewSetVersionRef = useRef(0);
  const reviewSetPreparationAbortRef = useRef<AbortController | null>(null);
  const reviewSetItemIdRef = useRef(0);
  const reviewScreenshotSessionIdRef = useRef(initialReviewSet?.sessionId ?? "");
  if (!reviewScreenshotSessionIdRef.current) {
    reviewScreenshotSessionIdRef.current = createReviewScreenshotSessionId();
  }
  const [reviewSetStatus, setReviewSetStatus] = useState(initialReviewSet?.items.length ? "Review Set restored." : "");
  const [reviewSetSaving, setReviewSetSaving] = useState(false);
  const reviewSetSavingRef = useRef(false);
  const [reviewSetPreparing, setReviewSetPreparing] = useState(false);
  const [preparedReviewSet, setPreparedReviewSet] = useState<PreparedReviewSetPacket | null>(null);
  const [reviewSetPacketError, setReviewSetPacketError] = useState("");
  const [reviewSetCopyStatus, setReviewSetCopyStatus] = useState("");
  const [reviewSetCaptureItemId, setReviewSetCaptureItemId] = useState("");
  const [reviewSetPersistenceError, setReviewSetPersistenceError] = useState(initialReviewSet?.persistenceError ?? "");
  const reviewCaptureBusyRef = useRef(false);
  const standaloneReviewActionRef = useRef<(mode: PreviewMode, action: PreviewReviewAction) => void>(() => undefined);
  const prepareReviewSetRef = useRef<() => void>(() => undefined);
  const focusReviewSetItemRef = useRef<(itemId: string, source?: "embedded" | "standalone") => Promise<boolean>>(async () => false);
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

  const replaceReviewSetItems = useCallback((nextItems: ReviewSetItem[]) => {
    reviewSetItemsRef.current = nextItems;
    setReviewSetItems(nextItems);
    if (nextItems.length) {
      const persisted = saveStoredReviewSet(reviewScreenshotSessionIdRef.current, nextItems);
      setReviewSetPersistenceError(persisted ? "" : "This Review Set is still open, but Canvas Helper could not keep it across a reload.");
    } else {
      const cleared = clearStoredReviewSet();
      setReviewSetPersistenceError(cleared ? "" : "Canvas Helper could not access browser storage. This Review Set will stay open only until this tab closes.");
    }
  }, []);

  const invalidateReviewSetPreparation = useCallback(() => {
    reviewSetVersionRef.current += 1;
    reviewSetPreparationAbortRef.current?.abort();
    reviewSetPreparationAbortRef.current = null;
    setReviewSetPreparing(false);
    setPreparedReviewSet(null);
    setReviewSetPacketError("");
    setReviewSetCopyStatus("");
  }, []);

  const reclaimReviewScreenshotPaths = useCallback((screenshots: OwnedReviewScreenshotPath[]) => {
    if (!screenshots.length) return;
    void deleteReviewScreenshotPaths(screenshots).catch(() => {
      setReviewSetPersistenceError("Removed screenshots are hidden now and will be reclaimed by the local seven-day cleanup.");
    });
  }, []);

  const clearReviewSet = useCallback(
    (status = "") => {
      invalidateReviewSetPreparation();
      reclaimReviewScreenshotPaths(
        reviewSetItemsRef.current.flatMap((item) => ownedScreenshotPaths(reviewScreenshotSessionIdRef.current, item))
      );
      reviewScreenshotSessionIdRef.current = createReviewScreenshotSessionId();
      replaceReviewSetItems([]);
      setReviewSetCaptureItemId("");
      setReviewSetStatus(status);
    },
    [invalidateReviewSetPreparation, reclaimReviewScreenshotPaths, replaceReviewSetItems]
  );

  useEffect(() => () => reviewSetPreparationAbortRef.current?.abort(), []);

  useEffect(() => {
    if (!restoredReviewScopePendingRef.current || !projects.length) {
      return;
    }
    restoredReviewScopePendingRef.current = false;
    const restoredSlug = reviewSetItemsRef.current[0]?.request.projectSlug;
    if (restoredSlug && projects.some((project) => project.manifest.slug === restoredSlug) && selectedSlug !== restoredSlug) {
      setSelectedSlug(restoredSlug);
    }
  }, [projects, selectedSlug, setSelectedSlug]);

  const confirmReviewSetScopeChange = useCallback(
    (nextProjectSlug: string, _nextPreviewMode: PreviewMode) => {
      const firstItem = reviewSetItemsRef.current[0];
      if (!firstItem || firstItem.request.projectSlug === nextProjectSlug) {
        return true;
      }
      if (typeof window !== "undefined" && !window.confirm("Switching courses clears the current Review Set. Continue?")) {
        return false;
      }
      clearReviewSet("Review Set cleared because the course changed.");
      return true;
    },
    [clearReviewSet]
  );

  const resetInspection = useCallback(
    (resetTeacherInput = false) => {
      inspectionScopeVersionRef.current += 1;
      setInspectionResolution(null);
      setInspectionRequest(null);
      setInspectionResolving(false);
      setInspectionPreviewMode(previewMode);
      inspectionSourceRef.current = "embedded";
      if (resetTeacherInput) {
        setInspectionTeacherNote("");
      }
      screenshotClearRef.current();
    },
    [previewMode]
  );

  useEffect(() => {
    resetInspection(true);
  }, [inspectionContextKey, resetInspection]);

  const resolveInspection = async (
    mode: PreviewMode,
    selection: PreviewInspectPayload,
    source: "embedded" | "standalone"
  ) => {
    const requestScopeVersion = inspectionScopeVersionRef.current + 1;
    inspectionScopeVersionRef.current = requestScopeVersion;
    const isCurrentRequest = () => inspectionScopeVersionRef.current === requestScopeVersion;
    const target = mode === "workspace" ? workspaceTarget : resolvedReference.target;
    const selectionPayload: InspectionSelection = selection;
    setInspectionPreviewMode(mode);
    inspectionSourceRef.current = source;
    screenshotAnnotation.clear();
    setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
    setInspectionResolution(null);
    setInspectionRequest(null);
    setInspectionResolving(true);

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
      setInspectionResolution(unsupportedResolution);
      setInspectionResolving(false);
      return;
    }

    try {
      const request: InspectionResolveRequest = {
        projectSlug: target.projectSlug,
        root: target.root,
        htmlPath: target.htmlPath,
        selection: selectionPayload
      };
      const payload = await resolveInspectionRequest(request);
      if (!isCurrentRequest()) {
        return;
      }
      setInspectionResolution(payload);
      setInspectionRequest(request);
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
      setInspectionResolution(unresolvedResolution);
      const request: InspectionResolveRequest = {
        projectSlug: target.projectSlug,
        root: target.root,
        htmlPath: target.htmlPath,
        selection: selectionPayload
      };
      setInspectionRequest(request);
    } finally {
      if (isCurrentRequest()) {
        setInspectionResolving(false);
      }
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
    focusPreviewInspectionSelection,
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
    onInspectModeChange: (enabled) => {
      setInspectEnabled(enabled);
      if (!enabled) {
        resetInspection(true);
      }
    },
    onPreviewNavigation: (mode) => {
      if (mode === "workspace") {
        resetInspection(true);
      }
    },
    onPreviewReviewAction: (mode, action) => standaloneReviewActionRef.current(mode, action),
    onStandaloneReturn: () => {
      setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
      window.focus();
    }
  });

  const stopAnnotationMode = useCallback(() => {
    setPreviewInspectMode(false);
    setInspectEnabled(false);
    resetInspection(true);
  }, [resetInspection, setPreviewInspectMode]);

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

    const inspectionVersion = inspectionScopeVersionRef.current;
    const reviewVersion = reviewSetVersionRef.current;
    const itemId = `review-${Date.now()}-${++reviewSetItemIdRef.current}`;
    const capturedDrafts = [...screenshotAnnotation.drafts];
    let savedScreenshots: ReviewSetScreenshot[] = [];
    if (reviewSetSavingRef.current) return;
    reviewSetSavingRef.current = true;
    setReviewSetSaving(true);
    try {
      const currentSelection = await requestCurrentInspectionSelection(
        inspectionPreviewMode,
        inspectionRequest.selection.nodeId as string,
        inspectionSourceRef.current
      );
      if (
        currentSelection.nodeId !== inspectionRequest.selection.nodeId ||
        !hasSamePreviewPageRoute(currentSelection.pageHref, inspectionRequest.selection.pageHref)
      ) {
        throw new Error("The course page changed. Select the element again before saving.");
      }
      if (capturedDrafts.length) {
        setReviewSetStatus(`Saving ${capturedDrafts.length} screenshot${capturedDrafts.length === 1 ? "" : "s"}…`);
        savedScreenshots = await persistScreenshotDrafts({
          sessionId: reviewScreenshotSessionIdRef.current,
          projectSlug: inspectionRequest.projectSlug,
          itemId,
          ownerNodeId: inspectionRequest.selection.nodeId as string,
          drafts: capturedDrafts
        });
      }

      if (inspectionScopeVersionRef.current !== inspectionVersion || reviewSetVersionRef.current !== reviewVersion) {
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
        issueCategory: "unsure",
        teacherNote: inspectionTeacherNote,
        screenshots: savedScreenshots
      });
      invalidateReviewSetPreparation();
      replaceReviewSetItems([...currentItems, item]);
      resetInspection(true);
      setReviewSetStatus(savedScreenshots.length
        ? `Annotation and ${savedScreenshots.length} screenshot${savedScreenshots.length === 1 ? "" : "s"} saved.`
        : "Annotation saved.");
    } catch (error) {
      await deleteReviewScreenshotPaths(ownedScreenshotPaths(
        reviewScreenshotSessionIdRef.current,
        { id: itemId, request: inspectionRequest, screenshots: savedScreenshots }
      )).catch(() => undefined);
      setReviewSetStatus(error instanceof Error ? error.message : "Could not save this inspection.");
    } finally {
      reviewSetSavingRef.current = false;
      setReviewSetSaving(false);
    }
  };

  const removeReviewSetItem = (id: string) => {
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === id);
    if (!item) {
      return;
    }
    invalidateReviewSetPreparation();
    reclaimReviewScreenshotPaths(ownedScreenshotPaths(reviewScreenshotSessionIdRef.current, item));
    replaceReviewSetItems(reviewSetItemsRef.current.filter((candidate) => candidate.id !== id));
    setReviewSetStatus("Annotation removed.");
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

  const removeReviewSetScreenshot = (itemId: string, screenshotId: string) => {
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
    reviewCaptureBusyRef.current = true;
    setReviewSetCaptureItemId(itemId);
    setReviewSetStatus("Capturing the course preview…");
    let savedScreenshots: ReviewSetScreenshot[] = [];
    let capturedDraft: ScreenshotDraft | null = null;
    try {
      const focused = await focusReviewSetItemRef.current(itemId, source);
      if (!focused) {
        throw new Error("The saved course page could not be restored. Try Show again before capturing.");
      }
      const selection = await requestCurrentInspectionSelection("workspace", item.request.selection.nodeId, source);
      if (!hasSamePreviewPageRoute(selection.pageHref, item.request.selection.pageHref)) {
        throw new Error("The course page changed. Show this annotation again before capturing.");
      }
      capturedDraft = await capturePreviewScreenshot({
        projectSlug: item.request.projectSlug,
        selection,
        markerNumber: itemIndex + 1
      });
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
      setReviewSetStatus("Screenshot added.");
      return true;
    } catch (error) {
      await deleteReviewScreenshotPaths(ownedScreenshotPaths(
        reviewScreenshotSessionIdRef.current,
        { id: item.id, request: item.request, screenshots: savedScreenshots }
      )).catch(() => undefined);
      setReviewSetStatus(error instanceof Error ? error.message : "Could not capture this screenshot.");
      return false;
    } finally {
      releaseScreenshotDraft(capturedDraft);
      setReviewSetCaptureItemId("");
      reviewCaptureBusyRef.current = false;
    }
  };

  const prepareReviewSet = () => {
    const savedItems = [...reviewSetItemsRef.current];
    if (!savedItems.length) {
      setReviewSetPacketError("");
      return;
    }
    if (savedItems.some((item) => !item.teacherNote.trim())) {
      setPreparedReviewSet(null);
      setReviewSetPacketError("Add a note to every annotation before copying.");
      setReviewSetStatus("");
      return;
    }

    reviewSetPreparationAbortRef.current?.abort();
    const controller = new AbortController();
    reviewSetPreparationAbortRef.current = controller;
    const preparationVersion = reviewSetVersionRef.current;
    setReviewSetPreparing(true);
    setPreparedReviewSet(null);
    setReviewSetPacketError("");
    setReviewSetCopyStatus("");
    setReviewSetStatus("Getting your Review Set ready…");

    void Promise.all(
      savedItems.map(async (item, index) => {
        const [resolution, verifiedScreenshots] = await Promise.all([
          resolveInspectionRequest(item.request, controller.signal),
          item.screenshots.length && item.request.selection.nodeId
            ? verifyReviewScreenshots({
                sessionId: reviewScreenshotSessionIdRef.current,
                projectSlug: item.request.projectSlug,
                itemId: item.id,
                ownerNodeId: item.request.selection.nodeId,
                paths: item.screenshots.map((screenshot) => screenshot.filePath)
              })
            : Promise.resolve([])
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
        if (resolution.freshness === "stale") {
          throw new Error(`Annotation ${index + 1} changed. Remove it and select it again.`);
        }
        if (!hasSameMaterialResolution(item.resolution, resolution)) {
          throw new Error(`Annotation ${index + 1} changed. Remove it and select it again.`);
        }
        return { item, resolution };
      })
    )
      .then((items) => {
        if (controller.signal.aborted || reviewSetVersionRef.current !== preparationVersion) {
          return;
        }
        const packet = buildReviewSetPacket({
          projectSlug: savedItems[0].request.projectSlug,
          previewMode: savedItems[0].previewMode,
          items
        });
        setPreparedReviewSet(packet);
        setReviewSetStatus("Review Set ready.");
      })
      .catch((error) => {
        if (controller.signal.aborted || reviewSetVersionRef.current !== preparationVersion) {
          return;
        }
        setReviewSetPacketError(error instanceof Error ? error.message : "Could not get the Review Set ready.");
        setReviewSetStatus("");
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
    return preparedReviewSet.itemIds.join("\u001f") === reviewSetItems.map((item) => item.id).join("\u001f");
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
    status: reviewSetStatus.slice(0, 240),
    error: (reviewSetPacketError || reviewSetPersistenceError).slice(0, 240)
  }), [reviewSetCaptureItemId, reviewSetItems, reviewSetPacketError, reviewSetPacketReady, reviewSetPersistenceError, reviewSetPreparing, reviewSetSaving, reviewSetStatus, screenshotAnnotation.drafts.length]);

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
    const currentIds = reviewSetItemsRef.current.map((item) => item.id);
    if (preparedReviewSet.itemIds.join("\u001f") !== currentIds.join("\u001f")) {
      setReviewSetCopyStatus("This Review Set changed. Prepare it again before copying.");
      return;
    }
    void navigator.clipboard
      .writeText(preparedReviewSet.packet)
      .then(() => setReviewSetCopyStatus(
        preparedReviewSet.screenshotCount
          ? `Copied with ${preparedReviewSet.screenshotCount} screenshot path${preparedReviewSet.screenshotCount === 1 ? "" : "s"}. Paste this into a Codex task.`
          : "Copied. Paste this one packet into a Codex task."
      ))
      .catch(() => setReviewSetCopyStatus("Clipboard access was blocked. Copy the packet shown below."));
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
      screenshotAnnotation.clear();
      setReviewSetStatus("Annotation saved.");
    } catch (error) {
      await deleteReviewScreenshotPaths(ownedScreenshotPaths(
        reviewScreenshotSessionIdRef.current,
        { id: itemId, request, screenshots }
      )).catch(() => undefined);
      throw error;
    }
  };

  standaloneReviewActionRef.current = (mode, action) => {
    if (action.action === "request-state") {
      syncStandaloneReviewSet(
        mode,
        previewReviewState,
        reviewSetPacketReady ? preparedReviewSet?.packet ?? "" : ""
      );
      return;
    }
    if (mode !== "workspace") {
      sendStandaloneReviewActionResult(mode, {
        ok: false,
        message: "Annotations can be saved from the Workspace preview.",
        clearDraft: false
      });
      return;
    }
    if (action.action === "add") {
      if (reviewSetSavingRef.current) {
        sendStandaloneReviewActionResult(mode, { ok: false, message: "This annotation is already saving.", clearDraft: false });
        return;
      }
      reviewSetSavingRef.current = true;
      setReviewSetSaving(true);
      void addStandaloneReviewItem(mode, action.selection, action.teacherNote)
        .then(() => sendStandaloneReviewActionResult(mode, {
          ok: true,
          message: "Annotation saved.",
          clearDraft: true
        }))
        .catch((error) => sendStandaloneReviewActionResult(mode, {
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
        sendStandaloneReviewActionResult(mode, { ok: false, message: "A screenshot is already being captured.", clearDraft: false });
        return;
      }
      if (!action.selection.nodeId) {
        sendStandaloneReviewActionResult(mode, { ok: false, message: "Select a course element before capturing a screenshot.", clearDraft: false });
        return;
      }
      const scopeVersion = inspectionScopeVersionRef.current;
      reviewCaptureBusyRef.current = true;
      void runWithCurrentPreviewSelection({
        expected: action.selection,
        requestCurrent: () => requestCurrentInspectionSelection(mode, action.selection.nodeId as string, "standalone"),
        run: (selection) => screenshotAnnotation.capture({
            projectSlug: selectedSlug,
            selection,
            markerNumber: reviewSetItemsRef.current.length + 1,
            isCurrent: () => inspectionScopeVersionRef.current === scopeVersion
        }),
        changedMessage: "The course page changed. Select the element again before capturing a screenshot."
      })
        .then((result) => sendStandaloneReviewActionResult(mode, {
          ok: Boolean(result),
          message: result ? "Screenshot captured." : screenshotAnnotation.error || "Could not capture the screenshot.",
          clearDraft: false
        }))
        .catch((error) => sendStandaloneReviewActionResult(mode, {
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
        .then((ok) => sendStandaloneReviewActionResult(mode, {
          ok,
          message: ok ? "Screenshot added." : "Could not capture the screenshot.",
          clearDraft: false
        }));
      return;
    }
    if (action.action === "focus-item") {
      void focusReviewSetItemRef.current(action.itemId, "standalone").then((focused) =>
        sendStandaloneReviewActionResult(mode, {
          ok: focused,
          message: focused ? "Annotation shown." : "The saved course page could not be shown. Try again.",
          clearDraft: false
        })
      );
      return;
    }
    if (action.action === "remove") {
      if (!reviewSetItemsRef.current.some((item) => item.id === action.itemId)) {
        sendStandaloneReviewActionResult(mode, { ok: false, message: "That annotation is no longer saved.", clearDraft: false });
        return;
      }
      removeReviewSetItem(action.itemId);
      sendStandaloneReviewActionResult(mode, { ok: true, message: "Annotation removed.", clearDraft: false });
      return;
    }
    if (action.action === "remove-screenshot") {
      const item = reviewSetItemsRef.current.find((candidate) => candidate.id === action.itemId);
      if (!item?.screenshots.some((screenshot) => screenshot.id === action.screenshotId)) {
        sendStandaloneReviewActionResult(mode, { ok: false, message: "That screenshot is no longer saved.", clearDraft: false });
        return;
      }
      removeReviewSetScreenshot(action.itemId, action.screenshotId);
      sendStandaloneReviewActionResult(mode, { ok: true, message: "Screenshot removed.", clearDraft: false });
      return;
    }
    if (action.action === "update-note") {
      if (!reviewSetItemsRef.current.some((item) => item.id === action.itemId)) {
        sendStandaloneReviewActionResult(mode, { ok: false, message: "That annotation is no longer saved.", clearDraft: false });
        return;
      }
      if (utf8ByteLength(action.teacherNote) > REVIEW_SET_NOTE_MAX_BYTES) {
        sendStandaloneReviewActionResult(mode, { ok: false, message: "That note is too long.", clearDraft: false });
        return;
      }
      changeReviewSetTeacherNote(action.itemId, action.teacherNote);
      sendStandaloneReviewActionResult(mode, { ok: true, message: "Note updated.", clearDraft: false });
      return;
    }
    if (action.action === "clear") {
      clearReviewSet("Review Set cleared.");
      sendStandaloneReviewActionResult(mode, { ok: true, message: "Review Set cleared.", clearDraft: true });
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
    const captureScopeVersion = inspectionScopeVersionRef.current;
    reviewCaptureBusyRef.current = true;
    void requestCurrentInspectionSelection(
      inspectionPreviewMode,
      inspectionResolution.selection.nodeId,
      inspectionSourceRef.current
    )
      .then(async (selection) => {
        if (inspectionScopeVersionRef.current !== captureScopeVersion) {
          return;
        }
        if (!hasSamePreviewPageRoute(selection.pageHref, inspectionRequest.selection.pageHref)) {
          throw new Error("The course page changed. Select the element again before capturing a screenshot.");
        }
        setInspectionResolution((current) =>
          current && current.selection.nodeId === selection.nodeId
            ? { ...current, selection }
            : current
        );
        setInspectionRequest((current) =>
          current && current.selection.nodeId === selection.nodeId
            ? { ...current, selection }
            : current
        );
        await screenshotAnnotation.capture({
          projectSlug: inspectionRequest.projectSlug,
          selection,
          markerNumber: reviewSetItemsRef.current.length + 1,
          isCurrent: () => inspectionScopeVersionRef.current === captureScopeVersion
        });
      })
      .catch((error) => screenshotAnnotation.reportError(
        error instanceof Error ? error.message : "Could not capture the course preview."
      ))
      .finally(() => {
        reviewCaptureBusyRef.current = false;
      });
  };

  const focusReviewSetItem = async (
    itemId: string,
    source: "embedded" | "standalone" = "embedded"
  ) => {
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === itemId);
    if (!item?.request.selection.nodeId) {
      return false;
    }
    setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
    setWorkspaceHtmlSelections((current) => ({
      ...current,
      [item.request.projectSlug]: item.request.htmlPath
    }));
    if (previewMode !== "workspace") {
      setPreviewMode("workspace");
    }
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve())));
    const focused = await focusPreviewInspectionSelection("workspace", item.request.selection.nodeId, {
      source,
      pageHref: item.request.selection.pageHref
    });
    setReviewSetStatus(
      focused
        ? source === "standalone" ? "Annotation shown in the full preview." : "Annotation shown in the course."
        : "The saved course page did not become ready. Try Show again."
    );
    return focused;
  };
  focusReviewSetItemRef.current = focusReviewSetItem;

  const setCompareMode = (compareMode: boolean) => {
    persistAllVisibleScrollPositions();
    setLayoutPreferences((current) => ({ ...current, compareMode }));
  };

  const handlePreviewModeChange = (nextMode: PreviewMode) => {
    if (nextMode !== previewMode && !confirmReviewSetScopeChange(selectedSlug, nextMode)) {
      return;
    }
    persistAllVisibleScrollPositions();
    syncFocusModeScrollPosition(previewMode, nextMode);
    if (nextMode !== previewMode) {
      resetInspection(true);
    }
    setPreviewMode(nextMode);
  };

  const handleOpenWorkspacePreview = (event: MouseEvent<HTMLAnchorElement>) => {
    persistAllVisibleScrollPositions();
    event.currentTarget.rel = "noopener noreferrer";
    const connectedHref = prepareStandalonePreview("workspace", previewSources.workspace);
    if (connectedHref) {
      event.currentTarget.href = connectedHref;
      event.currentTarget.rel = "opener";
      event.currentTarget.referrerPolicy = "no-referrer";
    } else {
      event.preventDefault();
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

  return (
    <div className="shell" data-testid="studio-shell">
      <main className="main-panel">
        <Topbar
          layoutPreferences={layoutPreferences}
          previewMode={previewMode}
          learnerMode={learnerModeDisplay}
          onSetCompareMode={setCompareMode}
          onSetPreviewMode={handlePreviewModeChange}
          onToggleInspector={() =>
            setLayoutPreferences((current) => ({ ...current, inspectorOpen: !current.inspectorOpen }))
          }
          inspectEnabled={inspectEnabled}
          onToggleInspect={() => {
            const nextEnabled = !inspectEnabled;
            if (!nextEnabled) {
              stopAnnotationMode();
              return;
            }
            if (previewMode !== "workspace") {
              handlePreviewModeChange("workspace");
            }
            setPreviewInspectMode(true);
            setInspectEnabled(true);
            setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
          }}
          inspectAvailable={Boolean(previewOrigin)}
          hasWorkspacePreview={Boolean(previewSources.workspace)}
          workspacePreviewHref={previewSources.workspace}
          onOpenWorkspacePreview={handleOpenWorkspacePreview}
        />

        {inspectEnabled && studioMode === "course" ? (
          <AnnotationModeBar
            savedCount={reviewSetItems.length}
            selectionReady={Boolean(inspectionResolution?.selection.nodeId)}
            draftScreenshotCount={screenshotAnnotation.drafts.length}
            capturing={screenshotAnnotation.status === "capturing"}
            onCapture={captureInspectionScreenshot}
            onOpenReviewSet={() => setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }))}
            onDone={stopAnnotationMode}
          />
        ) : null}

        {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}
        {previewError ? <div className="error-banner">{previewError}</div> : null}

        <div className="studio-mode-switch" role="tablist" aria-label="Studio mode" data-testid="studio-mode-switch">
          <button
            type="button"
            className={studioMode === "course" ? "active" : ""}
            onClick={() => setStudioMode("course")}
            data-testid="course-studio-tab"
          >
            Course Studio
          </button>
          <button
            type="button"
            className={studioMode === "assessment" ? "active" : ""}
            onClick={() => setStudioMode("assessment")}
            data-testid="assessment-studio-tab"
          >
            Assessment Library
          </button>
        </div>

        {studioMode === "assessment" ? (
          <AssessmentLibraryMode />
        ) : (
          <div className={layoutPreferences.inspectorOpen ? "workspace-grid inspector-open" : "workspace-grid"}>
            <section className="preview-workspace" data-testid="preview-workspace">
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
                        previewSrc={previewSources[mode]}
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
                          ) : (
                            <WorkspacePicker
                              selectedSlug={selectedSlug}
                              projects={projects}
                              resolvedWorkspaceHtmlPath={resolvedWorkspaceHtmlPath}
                              workspaceFileOptions={selectedProject.htmlFiles.workspace}
                              onProjectChange={(slug) => {
                                if (!confirmReviewSetScopeChange(slug, "workspace")) {
                                  return;
                                }
                                persistAllVisibleScrollPositions();
                                resetInspection(true);
                                setSelectedSlug(slug);
                              }}
                              onHtmlChange={(htmlPath) => {
                                resetInspection(true);
                                setWorkspaceHtmlSelections((current) => ({
                                  ...current,
                                  [selectedSlug]: htmlPath
                                }));
                              }}
                              onRefresh={() => void refreshProjects()}
                            />
                          )
                        }
                        toolbar={
                          mode === "workspace" ? (
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
                          ) : undefined
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
                screenshotSupported={screenshotAnnotation.isSupported}
                screenshotCanCapture={Boolean(inspectionResolution?.selection.nodeId) && screenshotAnnotation.drafts.length < REVIEW_SCREENSHOT_MAX_PER_ITEM}
                screenshotStatus={screenshotAnnotation.status}
                screenshotError={screenshotAnnotation.error}
                screenshots={screenshotAnnotation.drafts}
                onInspectionTeacherNoteChange={setInspectionTeacherNote}
                onSaveCurrentInspection={addCurrentInspectionToReviewSet}
                onCaptureScreenshot={captureInspectionScreenshot}
                onDownloadScreenshot={screenshotAnnotation.download}
                onDiscardScreenshot={screenshotAnnotation.remove}
                reviewSetItems={reviewSetItems}
                reviewSetCanAddCurrent={reviewSetAddAvailability.canAdd}
                reviewSetAddDisabledReason={reviewSetAddAvailability.reason}
                reviewSetStatus={reviewSetStatus}
                reviewSetPreparing={reviewSetPreparing}
                reviewSetPacketReady={reviewSetPacketReady}
                reviewSetPacketError={reviewSetPacketError}
                reviewSetCopyStatus={reviewSetCopyStatus}
                reviewSetManualPacket={reviewSetPacketReady ? preparedReviewSet?.packet ?? "" : ""}
                reviewSetPersistenceError={reviewSetPersistenceError}
                reviewSetCaptureItemId={reviewSetCaptureItemId}
                onClearReviewSet={() => clearReviewSet("Cleared saved items.")}
                onRemoveReviewSetItem={removeReviewSetItem}
                onFocusReviewSetItem={focusReviewSetItem}
                onReviewSetTeacherNoteChange={changeReviewSetTeacherNote}
                onAddReviewSetScreenshot={(id) => void addScreenshotToReviewSetItem(id)}
                onRemoveReviewSetScreenshot={removeReviewSetScreenshot}
                onCopyReviewSet={copyReviewSet}
              />
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
