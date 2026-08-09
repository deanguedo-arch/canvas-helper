import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

import { CommandToolbar } from "./components/CommandToolbar";
import { InspectorPanel } from "./components/InspectorPanel";
import { PreviewPane } from "./components/PreviewPane";
import { ReferencePicker } from "./components/ReferencePicker";
import { AssessmentLibraryMode } from "./components/AssessmentLibraryMode";
import { Topbar } from "./components/Topbar";
import { WorkspacePicker } from "./components/WorkspacePicker";
import { useLayoutPreferences } from "./hooks/useLayoutPreferences";
import { usePreviewScrollSync } from "./hooks/usePreviewScrollSync";
import { usePreviewRuntime } from "./hooks/usePreviewRuntime";
import { revokeScreenshotAnnotation, useScreenshotAnnotation } from "./hooks/useScreenshotAnnotation";
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
  type ReviewSetItem
} from "./lib/review-set";
import type {
  InspectionResolution,
  InspectionResolveRequest,
  InspectionSelection
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
  const [inspectionPreviewUrl, setInspectionPreviewUrl] = useState("");
  const inspectionScopeVersionRef = useRef(0);
  const screenshotAnnotation = useScreenshotAnnotation();
  const [reviewSetItems, setReviewSetItems] = useState<ReviewSetItem[]>([]);
  const reviewSetItemsRef = useRef<ReviewSetItem[]>([]);
  const reviewSetVersionRef = useRef(0);
  const reviewSetPreparationAbortRef = useRef<AbortController | null>(null);
  const reviewSetItemIdRef = useRef(0);
  const [reviewSetStatus, setReviewSetStatus] = useState("");
  const [reviewSetPreparing, setReviewSetPreparing] = useState(false);
  const [preparedReviewSet, setPreparedReviewSet] = useState<PreparedReviewSetPacket | null>(null);
  const [reviewSetPacketError, setReviewSetPacketError] = useState("");
  const [reviewSetCopyStatus, setReviewSetCopyStatus] = useState("");
  const standaloneReviewActionRef = useRef<(mode: PreviewMode, action: PreviewReviewAction) => void>(() => undefined);
  const prepareReviewSetRef = useRef<() => void>(() => undefined);
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
    const createPreviewOptions = { origin: previewOrigin };
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
      createPreviewOptions
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
                createPreviewOptions
              ))
            : ""
          : withE2E(toPreviewUrl(
              resolvedReference.target.root,
              resolvedReference.target.projectSlug,
              resolvedReference.target.htmlPath,
              referenceRevision,
              createPreviewOptions
            ))
        : "";

    return { reference: referenceSrc, workspace: workspaceSrc };
  }, [previewOrigin, referenceRevision, resolvedReference, selectedProject, workspaceTarget]);

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

  const clearReviewSet = useCallback(
    (status = "") => {
      invalidateReviewSetPreparation();
      reviewSetItemsRef.current.forEach((item) => revokeScreenshotAnnotation(item.screenshot));
      replaceReviewSetItems([]);
      setReviewSetStatus(status);
    },
    [invalidateReviewSetPreparation, replaceReviewSetItems]
  );

  useEffect(
    () => () => {
      reviewSetPreparationAbortRef.current?.abort();
      reviewSetItemsRef.current.forEach((item) => revokeScreenshotAnnotation(item.screenshot));
    },
    []
  );

  useEffect(() => {
    const firstItem = reviewSetItemsRef.current[0];
    if (firstItem && firstItem.request.projectSlug !== selectedSlug) {
      clearReviewSet("Review Set cleared because the course changed.");
    }
  }, [clearReviewSet, selectedSlug]);

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
      setInspectionPreviewUrl("");
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

  const resolveInspection = async (mode: PreviewMode, selection: PreviewInspectPayload) => {
    const requestScopeVersion = inspectionScopeVersionRef.current + 1;
    inspectionScopeVersionRef.current = requestScopeVersion;
    const isCurrentRequest = () => inspectionScopeVersionRef.current === requestScopeVersion;
    const target = mode === "workspace" ? workspaceTarget : resolvedReference.target;
    const selectionPayload: InspectionSelection = selection;
    setInspectionPreviewMode(mode);
    setInspectionPreviewUrl(previewSources[mode]);
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
    getPreviewFrame,
    prepareStandalonePreview,
    requestCurrentInspectionSelection,
    setPreviewInspectMode,
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
    onInspectSelection: (mode, selection) => void resolveInspection(mode, selection),
    onInspectModeChange: (enabled) => {
      setInspectEnabled(enabled);
      if (!enabled) {
        resetInspection(true);
      }
    },
    onPreviewReviewAction: (mode, action) => standaloneReviewActionRef.current(mode, action),
    onStandaloneReturn: () => {
      setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
      window.focus();
    }
  });

  const referenceFileOptions = resolvedReference.options.html;
  const referenceResourceOptions = resolvedReference.options.resourcesActive;
  const visiblePreviewModes = layoutPreferences.compareMode ? [...previewModes] : [previewMode];

  const reviewSetAddAvailability = useMemo(() => {
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
  }, [inspectionPreviewMode, inspectionRequest, inspectionResolution, inspectionTeacherNote, previewMode, reviewSetItems, selectedSlug]);

  const addCurrentInspectionToReviewSet = () => {
    if (!reviewSetAddAvailability.canAdd || !inspectionResolution || !inspectionRequest) {
      setReviewSetStatus(reviewSetAddAvailability.reason || "Select a workspace element before saving it to the Review Set.");
      return;
    }

    try {
      const item = createReviewSetItem({
        id: `review-${Date.now()}-${++reviewSetItemIdRef.current}`,
        previewMode: inspectionPreviewMode,
        request: inspectionRequest,
        resolution: inspectionResolution,
        issueCategory: "unsure",
        teacherNote: inspectionTeacherNote,
        screenshot: screenshotAnnotation.annotation
      });
      invalidateReviewSetPreparation();
      screenshotAnnotation.consume();
      replaceReviewSetItems([...reviewSetItemsRef.current, item]);
      setInspectionTeacherNote("");
      setReviewSetStatus("Annotation saved.");
    } catch (error) {
      setReviewSetStatus(error instanceof Error ? error.message : "Could not save this inspection.");
    }
  };

  const removeReviewSetItem = (id: string) => {
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === id);
    if (!item) {
      return;
    }
    invalidateReviewSetPreparation();
    revokeScreenshotAnnotation(item.screenshot);
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

  const removeReviewSetScreenshot = (id: string) => {
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === id);
    if (!item?.screenshot) {
      return;
    }
    invalidateReviewSetPreparation();
    revokeScreenshotAnnotation(item.screenshot);
    replaceReviewSetItems(
      reviewSetItemsRef.current.map((candidate) => (candidate.id === id ? { ...candidate, screenshot: null } : candidate))
    );
    setReviewSetStatus("Screenshot removed.");
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
        const resolution = await resolveInspectionRequest(item.request, controller.signal);
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
    items: reviewSetItems.map((item) => ({
      id: item.id,
      excerpt: item.excerpt,
      teacherNote: item.teacherNote
    })),
    preparing: reviewSetPreparing,
    packetReady: reviewSetPacketReady,
    status: reviewSetStatus.slice(0, 240),
    error: reviewSetPacketError.slice(0, 240)
  }), [reviewSetItems, reviewSetPacketError, reviewSetPacketReady, reviewSetPreparing, reviewSetStatus]);

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
      .then(() => setReviewSetCopyStatus("Copied. Paste this one packet into a Codex task."))
      .catch(() => setReviewSetCopyStatus("Clipboard access was blocked. Select the packet and copy it manually."));
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

    const item = createReviewSetItem({
      id: `review-${Date.now()}-${++reviewSetItemIdRef.current}`,
      previewMode: mode,
      request,
      resolution,
      issueCategory: "unsure",
      teacherNote: note,
      screenshot: null
    });
    invalidateReviewSetPreparation();
    replaceReviewSetItems([...currentItems, item]);
    setReviewSetStatus("Annotation saved.");
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
        }));
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
    clearReviewSet("Review Set cleared.");
    sendStandaloneReviewActionResult(mode, { ok: true, message: "Review Set cleared.", clearDraft: true });
  };

  const captureInspectionScreenshot = () => {
    if (!inspectionResolution?.selection.nodeId) {
      screenshotAnnotation.reportError("Select a source-mapped preview element before capturing a screenshot.");
      return;
    }
    const captureScopeVersion = inspectionScopeVersionRef.current;
    const iframe = getPreviewFrame(inspectionPreviewMode);
    iframe?.scrollIntoView({ block: "center", inline: "center", behavior: "auto" });
    const currentSelection = requestCurrentInspectionSelection(inspectionPreviewMode, inspectionResolution.selection.nodeId);
    void currentSelection
      .then((selection) => {
        if (inspectionScopeVersionRef.current !== captureScopeVersion) {
          return;
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
      })
      .catch(() => undefined);
    void screenshotAnnotation.capture({
      iframe,
      selection: currentSelection,
      expectedPreviewUrl: inspectionPreviewUrl,
      isCurrent: () => inspectionScopeVersionRef.current === captureScopeVersion
    });
  };

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
            setPreviewInspectMode(nextEnabled);
            setInspectEnabled(nextEnabled);
            if (!nextEnabled) {
              resetInspection(true);
            }
          }}
          inspectAvailable={Boolean(previewOrigin)}
          hasWorkspacePreview={Boolean(previewSources.workspace)}
          workspacePreviewHref={previewSources.workspace}
          onOpenWorkspacePreview={handleOpenWorkspacePreview}
        />

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
                screenshotCanCapture={Boolean(inspectionResolution?.selection.nodeId)}
                screenshotStatus={screenshotAnnotation.status}
                screenshotError={screenshotAnnotation.error}
                screenshot={screenshotAnnotation.annotation}
                onInspectionTeacherNoteChange={setInspectionTeacherNote}
                onSaveCurrentInspection={addCurrentInspectionToReviewSet}
                onCaptureScreenshot={captureInspectionScreenshot}
                onScreenshotMarkerChange={screenshotAnnotation.updateMarker}
                onDownloadScreenshot={() => void screenshotAnnotation.download()}
                onDiscardScreenshot={screenshotAnnotation.clear}
                reviewSetItems={reviewSetItems}
                reviewSetCanAddCurrent={reviewSetAddAvailability.canAdd}
                reviewSetAddDisabledReason={reviewSetAddAvailability.reason}
                reviewSetStatus={reviewSetStatus}
                reviewSetPreparing={reviewSetPreparing}
                reviewSetPacketReady={reviewSetPacketReady}
                reviewSetPacketError={reviewSetPacketError}
                reviewSetCopyStatus={reviewSetCopyStatus}
                onClearReviewSet={() => clearReviewSet("Cleared saved items.")}
                onRemoveReviewSetItem={removeReviewSetItem}
                onReviewSetTeacherNoteChange={changeReviewSetTeacherNote}
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
