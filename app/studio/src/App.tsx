import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

import { CommandToolbar } from "./components/CommandToolbar";
import { InspectorPanel } from "./components/InspectorPanel";
import { PreviewPane } from "./components/PreviewPane";
import { ReferencePicker } from "./components/ReferencePicker";
import { AssessmentLibraryMode } from "./components/AssessmentLibraryMode";
import { Topbar } from "./components/Topbar";
import { WorkspacePicker } from "./components/WorkspacePicker";
import type { PreviewHealthEntry } from "./components/PreviewHealthPanel";
import { useCourseBuildBrief } from "./hooks/useCourseBuildBrief";
import { useLayoutPreferences } from "./hooks/useLayoutPreferences";
import { usePreviewScrollSync } from "./hooks/usePreviewScrollSync";
import { usePreviewRuntime } from "./hooks/usePreviewRuntime";
import {
  downloadScreenshotAnnotation,
  revokeScreenshotAnnotation,
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
import { buildCodexPacket } from "./lib/codex-packet";
import {
  buildReviewSetPacket,
  createReviewSetItem,
  hasSameSafeReviewRoute,
  hasSameMaterialResolution,
  REVIEW_SET_MAX_ITEMS,
  REVIEW_SET_NOTE_MAX_BYTES,
  reviewSetItemIdentity,
  utf8ByteLength,
  type PreparedReviewSetPacket,
  type ReviewSetRecheck,
  type ReviewSetItem
} from "./lib/review-set";
import type {
  InspectionIssueCategory,
  InspectionResolution,
  InspectionResolveRequest,
  InspectionSelection
} from "../../shared/inspection.js";
import type { PreviewDiagnostic, PreviewInspectPayload } from "../../shared/preview-bridge.js";

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
  const { brief: courseBuildBrief, loading: courseBuildBriefLoading, error: courseBuildBriefError } = useCourseBuildBrief(selectedSlug);
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
  const [inspectionIssueCategory, setInspectionIssueCategory] = useState<InspectionIssueCategory>("unsure");
  const [inspectionCopyStatus, setInspectionCopyStatus] = useState("");
  const [inspectionPreviewMode, setInspectionPreviewMode] = useState<PreviewMode>("workspace");
  const [inspectionPreviewUrl, setInspectionPreviewUrl] = useState("");
  const [courseBuildBriefCopyStatus, setCourseBuildBriefCopyStatus] = useState("");
  const [previewHealthEntries, setPreviewHealthEntries] = useState<PreviewHealthEntry[]>([]);
  const previewHealthIdRef = useRef(0);
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
  const [reviewSetRecheck, setReviewSetRecheck] = useState<ReviewSetRecheck | null>(null);
  const reviewSetRecheckRef = useRef<ReviewSetRecheck | null>(null);
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

  const setReviewSetRecheckState = useCallback((next: ReviewSetRecheck | null) => {
    reviewSetRecheckRef.current = next;
    setReviewSetRecheck(next);
  }, []);

  const recordPreviewDiagnostic = useCallback((mode: PreviewMode, diagnostic: PreviewDiagnostic) => {
    const message = diagnostic.message.trim();
    if (!message) {
      return;
    }
    setPreviewHealthEntries((current) => {
      if (current.some((entry) => entry.mode === mode && entry.kind === diagnostic.kind && entry.message === message)) {
        return current;
      }
      const nextEntry: PreviewHealthEntry = {
        id: `preview-health-${++previewHealthIdRef.current}`,
        mode,
        kind: diagnostic.kind,
        message
      };
      return [...current, nextEntry].slice(-6);
    });
  }, []);

  const completeReviewSetRecheck = useCallback((
    mode: PreviewMode,
    request: InspectionResolveRequest,
    resolution: InspectionResolution
  ) => {
    const active = reviewSetRecheckRef.current;
    if (active?.status !== "selecting" || mode !== "workspace" || request.root !== "workspace") {
      return;
    }
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === active.itemId);
    if (!item || item.request.projectSlug !== request.projectSlug) {
      return;
    }

    if (hasSameSafeReviewRoute(item.resolution, resolution)) {
      setReviewSetRecheckState({
        itemId: item.id,
        status: "route-confirmed",
        message: "This selected surface still uses the same safe source/rebuild route. Run Workspace Verify, then inspect the learner result before calling it fixed."
      });
      return;
    }

    setReviewSetRecheckState({
      itemId: item.id,
      status: "route-changed",
      message: resolution.primaryEditTarget
        ? "This selection now follows a different source/rebuild route. Review it before editing; Studio has not called the change fixed."
        : "Studio could not confirm a safe editable route for this selection. It has not called the change fixed."
    });
  }, [setReviewSetRecheckState]);

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
      setReviewSetRecheckState(null);
      reviewSetItemsRef.current.forEach((item) => revokeScreenshotAnnotation(item.screenshot));
      replaceReviewSetItems([]);
      setReviewSetStatus(status);
    },
    [invalidateReviewSetPreparation, replaceReviewSetItems, setReviewSetRecheckState]
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
    if (firstItem && (firstItem.request.projectSlug !== selectedSlug || firstItem.previewMode !== previewMode)) {
      clearReviewSet("Review Set cleared because the course or preview mode changed.");
    }
  }, [clearReviewSet, previewMode, selectedSlug]);

  const confirmReviewSetScopeChange = useCallback(
    (nextProjectSlug: string, nextPreviewMode: PreviewMode) => {
      const firstItem = reviewSetItemsRef.current[0];
      if (!firstItem || (firstItem.request.projectSlug === nextProjectSlug && firstItem.previewMode === nextPreviewMode)) {
        return true;
      }
      if (typeof window !== "undefined" && !window.confirm("Switching course or preview mode clears the current Review Set. Continue?")) {
        return false;
      }
      clearReviewSet("Review Set cleared because the course or preview mode changed.");
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
      setInspectionCopyStatus("");
      setInspectionPreviewMode(previewMode);
      setInspectionPreviewUrl("");
      if (resetTeacherInput) {
        setInspectionTeacherNote("");
        setInspectionIssueCategory("unsure");
      }
      screenshotClearRef.current();
    },
    [previewMode]
  );

  useEffect(() => {
    resetInspection(true);
  }, [inspectionContextKey, resetInspection]);

  useEffect(() => {
    setPreviewHealthEntries([]);
    setCourseBuildBriefCopyStatus("");
    setReviewSetRecheckState(null);
  }, [previewSources.reference, previewSources.workspace, selectedSlug, setReviewSetRecheckState]);

  const inspectionPacketState = useMemo(() => {
    if (!inspectionResolution) {
      return { packet: "", error: "" };
    }
    try {
      return {
        packet: buildCodexPacket({
          resolution: inspectionResolution,
          teacherNote: inspectionTeacherNote,
          teacherCategory: inspectionIssueCategory,
          previewMode: inspectionPreviewMode
        }),
        error: ""
      };
    } catch (error) {
      return {
        packet: "",
        error: error instanceof Error ? error.message : "Could not build the Codex handoff packet."
      };
    }
  }, [inspectionIssueCategory, inspectionResolution, inspectionTeacherNote]);

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
    setInspectionCopyStatus("");

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
      completeReviewSetRecheck(mode, request, payload);
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
      completeReviewSetRecheck(mode, request, unresolvedResolution);
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
    focusPreviewInspectionSelection
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
      } else {
        setInspectionCopyStatus("");
      }
    },
    onPreviewDiagnostic: recordPreviewDiagnostic
  });

  const referenceFileOptions = resolvedReference.options.html;
  const referenceResourceOptions = resolvedReference.options.resourcesActive;
  const visiblePreviewModes = layoutPreferences.compareMode ? [...previewModes] : [previewMode];
  const sourceFiles = selectedProject
    ? [
        selectedProject.paths.rawEntrypoint,
        selectedProject.paths.workspaceEntrypoint,
        selectedProject.paths.workspaceScript,
        selectedProject.paths.workspaceStyles
      ].filter((filePath): filePath is string => Boolean(filePath))
    : [];

  const reviewSetAddAvailability = useMemo(() => {
    if (reviewSetPreparing) {
      return { canAdd: false, reason: "Wait for the current batch check to finish." };
    }
    if (!inspectionResolution || !inspectionRequest) {
      return { canAdd: false, reason: "Select a workspace element first." };
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
      return { canAdd: false, reason: "This exact selection is already saved." };
    }
    if (utf8ByteLength(inspectionTeacherNote) > REVIEW_SET_NOTE_MAX_BYTES) {
      return { canAdd: false, reason: `Keep the teacher note to ${REVIEW_SET_NOTE_MAX_BYTES} bytes or fewer.` };
    }
    return { canAdd: true, reason: "" };
  }, [inspectionPreviewMode, inspectionRequest, inspectionResolution, inspectionTeacherNote, previewMode, reviewSetItems, reviewSetPreparing, selectedSlug]);

  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };

  const copyInspectionPacket = () => {
    if (!inspectionPacketState.packet) {
      return;
    }
    void navigator.clipboard
      .writeText(inspectionPacketState.packet)
      .then(() => setInspectionCopyStatus("Copied. Paste this into a Codex task."))
      .catch(() => setInspectionCopyStatus("Clipboard access was blocked. Select the packet and copy it manually."));
  };

  const copyCourseBuildBrief = (packet: string) => {
    void navigator.clipboard
      .writeText(packet)
      .then(() => setCourseBuildBriefCopyStatus("Copied. Paste this at the start of a Codex task."))
      .catch(() => setCourseBuildBriefCopyStatus("Clipboard access was blocked. Select the brief and copy it manually."));
  };

  const copyInspectionTarget = () => {
    if (!inspectionResolution?.primaryEditTarget) {
      return;
    }
    const target = `${inspectionResolution.primaryEditTarget}${inspectionResolution.primaryEditLine ? `:${inspectionResolution.primaryEditLine}` : ""}`;
    void navigator.clipboard
      .writeText(target)
      .then(() => setInspectionCopyStatus("Copied the verified edit target."))
      .catch(() => setInspectionCopyStatus("Clipboard access was blocked. Copy the target manually."));
  };

  const showInspectionInPreview = () => {
    const nodeId = inspectionResolution?.selection.nodeId;
    if (!nodeId) {
      return;
    }
    getPreviewFrame(inspectionPreviewMode)?.scrollIntoView({ block: "center", inline: "center", behavior: "auto" });
    const focused = focusPreviewInspectionSelection(inspectionPreviewMode, nodeId);
    setInspectionCopyStatus(
      focused
        ? "Highlighted the selected element in the preview."
        : "The preview is still loading. Try Show in preview again once it is ready."
    );
  };

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
        issueCategory: inspectionIssueCategory,
        teacherNote: inspectionTeacherNote,
        screenshot: screenshotAnnotation.annotation
      });
      invalidateReviewSetPreparation();
      screenshotAnnotation.consume();
      replaceReviewSetItems([...reviewSetItemsRef.current, item]);
      setInspectionTeacherNote("");
      setInspectionIssueCategory("unsure");
      setReviewSetStatus(`Saved item ${reviewSetItemsRef.current.length}.`);
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
    if (reviewSetRecheckRef.current?.itemId === id) {
      setReviewSetRecheckState(null);
    }
    revokeScreenshotAnnotation(item.screenshot);
    replaceReviewSetItems(reviewSetItemsRef.current.filter((candidate) => candidate.id !== id));
    setReviewSetStatus("Removed saved item.");
  };

  const moveReviewSetItem = (id: string, direction: "up" | "down") => {
    const currentItems = reviewSetItemsRef.current;
    const currentIndex = currentItems.findIndex((item) => item.id === id);
    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= currentItems.length) {
      return;
    }
    const nextItems = [...currentItems];
    [nextItems[currentIndex], nextItems[nextIndex]] = [nextItems[nextIndex], nextItems[currentIndex]];
    invalidateReviewSetPreparation();
    replaceReviewSetItems(nextItems);
    setReviewSetStatus("Reordered saved items.");
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

  const downloadReviewSetScreenshot = (id: string) => {
    const screenshot = reviewSetItemsRef.current.find((item) => item.id === id)?.screenshot;
    if (!screenshot) {
      return;
    }
    void downloadScreenshotAnnotation(screenshot).catch((error) => {
      setReviewSetStatus(error instanceof Error ? error.message : "The saved annotation could not be downloaded.");
    });
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
    setReviewSetStatus("Removed saved annotation.");
  };

  const focusReviewSetItem = (id: string) => {
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === id);
    const nodeId = item?.request.selection.nodeId;
    if (!item || !nodeId) {
      setReviewSetStatus("This saved selection no longer has a preview node. Inspect it again before continuing.");
      return;
    }
    getPreviewFrame(item.previewMode)?.scrollIntoView({ block: "center", inline: "center", behavior: "auto" });
    const focused = focusPreviewInspectionSelection(item.previewMode, nodeId);
    setReviewSetStatus(
      focused
        ? "Highlighted the saved selection in the preview."
        : "The workspace preview is still loading. Try Show in preview again once it is ready."
    );
  };

  const startReviewSetRecheck = (id: string) => {
    if (reviewSetPreparing || anyCommandRunning) {
      return;
    }
    const item = reviewSetItemsRef.current.find((candidate) => candidate.id === id);
    const nodeId = item?.request.selection.nodeId;
    if (!item || !nodeId) {
      setReviewSetStatus("This saved selection no longer has a preview node. Inspect it again before continuing.");
      return;
    }

    const selecting: ReviewSetRecheck = {
      itemId: item.id,
      status: "selecting",
      message: "Select the revised element in the Workspace preview. Studio will re-check the source route, not declare the learner fix complete."
    };
    setReviewSetRecheckState(selecting);
    setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
    setPreviewInspectMode(true);
    setInspectEnabled(true);
    getPreviewFrame(item.previewMode)?.scrollIntoView({ block: "center", inline: "center", behavior: "auto" });
    if (!focusPreviewInspectionSelection(item.previewMode, nodeId)) {
      setReviewSetRecheckState({
        ...selecting,
        message: "The workspace preview is still loading. Once it is ready, select the revised element to re-check its route."
      });
    }
  };

  const runReviewSetVerification = (id: string) => {
    const active = reviewSetRecheckRef.current;
    if (!active || active.itemId !== id || active.status !== "route-confirmed" || anyCommandRunning) {
      return;
    }
    setReviewSetRecheckState({
      ...active,
      status: "verifying",
      message: "Running Workspace Verify…"
    });
    void runProjectCommand("verify").then((passed) => {
      const current = reviewSetRecheckRef.current;
      if (!current || current.itemId !== id || current.status !== "verifying") {
        return;
      }
      setReviewSetRecheckState({
        ...current,
        status: passed ? "verification-passed" : "verification-failed",
        message: passed
          ? "Workspace verification passed. Inspect the learner experience before calling this change complete."
          : "Workspace verification failed. Review the command output and the learner preview before continuing."
      });
    });
  };

  const prepareReviewSet = () => {
    const savedItems = [...reviewSetItemsRef.current];
    if (!savedItems.length) {
      setReviewSetPacketError("Add at least one item before preparing a Review Set handoff.");
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
    setReviewSetStatus("Revalidating saved source mappings…");

    void Promise.all(
      savedItems.map(async (item, index) => {
        const resolution = await resolveInspectionRequest(item.request, controller.signal);
        if (resolution.freshness === "stale") {
          throw new Error(`Item ${index + 1} is stale. Remove it, select it again, and save a new item.`);
        }
        if (!hasSameMaterialResolution(item.resolution, resolution)) {
          throw new Error(`Item ${index + 1} changed source ownership. Remove it, inspect it again, and save a new item.`);
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
        setReviewSetStatus(`Prepared ${items.length} saved item${items.length === 1 ? "" : "s"}.`);
      })
      .catch((error) => {
        if (controller.signal.aborted || reviewSetVersionRef.current !== preparationVersion) {
          return;
        }
        setReviewSetPacketError(error instanceof Error ? error.message : "Could not prepare the Review Set handoff.");
        setReviewSetStatus("");
      })
      .finally(() => {
        if (reviewSetPreparationAbortRef.current === controller) {
          reviewSetPreparationAbortRef.current = null;
          setReviewSetPreparing(false);
        }
      });
  };

  const copyReviewSet = () => {
    if (!preparedReviewSet || reviewSetPreparing) {
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
      setInspectionCopyStatus("The full preview could not open because its isolated preview address is unavailable.");
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
            } else {
              setInspectionCopyStatus("");
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
                selectedProject={selectedProject}
                sourceFiles={sourceFiles}
                onCopyToClipboard={copyToClipboard}
                courseBuildBrief={courseBuildBrief}
                courseBuildBriefLoading={courseBuildBriefLoading}
                courseBuildBriefError={courseBuildBriefError}
                courseBuildBriefCopyStatus={courseBuildBriefCopyStatus}
                onCopyCourseBuildBrief={copyCourseBuildBrief}
                previewHealthEntries={previewHealthEntries}
                onClearPreviewHealth={() => setPreviewHealthEntries([])}
                inspectEnabled={inspectEnabled}
                inspectionResolution={inspectionResolution}
                inspectionResolving={inspectionResolving}
                inspectionTeacherNote={inspectionTeacherNote}
                inspectionIssueCategory={inspectionIssueCategory}
                inspectionPacket={inspectionPacketState.packet}
                inspectionPacketError={inspectionPacketState.error}
                inspectionCopyStatus={inspectionCopyStatus}
                screenshotSupported={screenshotAnnotation.isSupported}
                screenshotCanCapture={Boolean(inspectionResolution?.selection.nodeId)}
                screenshotStatus={screenshotAnnotation.status}
                screenshotError={screenshotAnnotation.error}
                screenshot={screenshotAnnotation.annotation}
                onInspectionTeacherNoteChange={setInspectionTeacherNote}
                onInspectionIssueCategoryChange={setInspectionIssueCategory}
                onCopyInspectionPacket={copyInspectionPacket}
                onCopyInspectionTarget={copyInspectionTarget}
                onShowInspectionInPreview={showInspectionInPreview}
                onCaptureScreenshot={captureInspectionScreenshot}
                onScreenshotMarkerChange={screenshotAnnotation.updateMarker}
                onDownloadScreenshot={() => void screenshotAnnotation.download()}
                onDiscardScreenshot={screenshotAnnotation.clear}
                reviewSetItems={reviewSetItems}
                reviewSetCanAddCurrent={reviewSetAddAvailability.canAdd}
                reviewSetAddDisabledReason={reviewSetAddAvailability.reason}
                reviewSetStatus={reviewSetStatus}
                reviewSetPreparing={reviewSetPreparing}
                reviewSetPacket={preparedReviewSet?.packet ?? ""}
                reviewSetPacketError={reviewSetPacketError}
                reviewSetCopyStatus={reviewSetCopyStatus}
                reviewSetRecheck={reviewSetRecheck}
                anyCommandRunning={anyCommandRunning}
                onAddCurrentInspectionToReviewSet={addCurrentInspectionToReviewSet}
                onClearReviewSet={() => clearReviewSet("Cleared saved items.")}
                onRemoveReviewSetItem={removeReviewSetItem}
                onMoveReviewSetItem={moveReviewSetItem}
                onReviewSetTeacherNoteChange={changeReviewSetTeacherNote}
                onDownloadReviewSetScreenshot={downloadReviewSetScreenshot}
                onRemoveReviewSetScreenshot={removeReviewSetScreenshot}
                onFocusReviewSetItem={focusReviewSetItem}
                onStartReviewSetRecheck={startReviewSetRecheck}
                onRunReviewSetVerification={runReviewSetVerification}
                onPrepareReviewSet={prepareReviewSet}
                onCopyReviewSet={copyReviewSet}
              />
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
