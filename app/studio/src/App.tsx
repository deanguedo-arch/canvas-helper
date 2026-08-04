import { useMemo, useState } from "react";

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
import { useScreenshotAnnotation } from "./hooks/useScreenshotAnnotation";
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
import type { InspectionIssueCategory, InspectionResolution, InspectionSelection } from "../../shared/inspection.js";
import type { PreviewInspectPayload } from "../../shared/preview-bridge.js";

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
  const [inspectionResolving, setInspectionResolving] = useState(false);
  const [inspectionTeacherNote, setInspectionTeacherNote] = useState("");
  const [inspectionIssueCategory, setInspectionIssueCategory] = useState<InspectionIssueCategory>("unsure");
  const [inspectionCopyStatus, setInspectionCopyStatus] = useState("");
  const [inspectionPreviewMode, setInspectionPreviewMode] = useState<PreviewMode>("workspace");
  const [inspectionPreviewUrl, setInspectionPreviewUrl] = useState("");
  const screenshotAnnotation = useScreenshotAnnotation();
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

  const inspectionPacketState = useMemo(() => {
    if (!inspectionResolution) {
      return { packet: "", error: "" };
    }
    try {
      return {
        packet: buildCodexPacket({
          resolution: inspectionResolution,
          teacherNote: inspectionTeacherNote,
          teacherCategory: inspectionIssueCategory
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
    const target = mode === "workspace" ? workspaceTarget : resolvedReference.target;
    const selectionPayload: InspectionSelection = selection;
    setInspectionPreviewMode(mode);
    setInspectionPreviewUrl(previewSources[mode]);
    screenshotAnnotation.clear();
    setLayoutPreferences((current) => ({ ...current, inspectorOpen: true }));
    setInspectionResolving(true);
    setInspectionCopyStatus("");

    if (!target?.projectSlug || (mode === "reference" && resolvedReference.target.source !== "html")) {
      setInspectionResolution({
        projectSlug: target?.projectSlug || selectedSlug,
        previewPath: "reference resource",
        selection: selectionPayload,
        resolution: "unknown",
        freshness: "unsupported",
        artifactRole: "reference-only",
        generated: false,
        primaryEditTarget: null,
        contributors: [],
        rebuildCommand: null,
        validationCommand: null,
        warnings: ["This reference resource can be inspected visually, but it is not a course source edit target."]
      });
      setInspectionResolving(false);
      return;
    }

    try {
      const response = await fetch("/api/inspection/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectSlug: target.projectSlug,
          root: target.root,
          htmlPath: target.htmlPath,
          selection: selectionPayload
        })
      });
      const payload = (await response.json().catch(() => ({}))) as InspectionResolution & { error?: string };
      if (!response.ok || !payload.resolution) {
        throw new Error(payload.error || "Canvas Helper could not resolve the selected element.");
      }
      setInspectionResolution(payload);
    } catch (error) {
      setInspectionResolution({
        projectSlug: target.projectSlug,
        previewPath: "unresolved preview",
        selection: selectionPayload,
        resolution: "unknown",
        freshness: "unsupported",
        artifactRole: "unknown",
        generated: false,
        primaryEditTarget: null,
        contributors: [],
        rebuildCommand: null,
        validationCommand: null,
        warnings: [error instanceof Error ? error.message : "Canvas Helper could not resolve the selected element."]
      });
    } finally {
      setInspectionResolving(false);
    }
  };

  const {
    registerPreviewFrame,
    attachPreviewPersistence,
    persistAllVisibleScrollPositions,
    copyPreviewModeScrollPosition,
    syncFocusModeScrollPosition,
    fitPreviewToWidth,
    getPreviewFrame
  } = usePreviewScrollSync({
    previewMode,
    layoutPreferences,
    setLayoutPreferences,
    selectedProject,
    workspaceTarget,
    referenceTarget: resolvedReference.target,
    previewOrigin,
    inspectEnabled,
    onInspectSelection: (mode, selection) => void resolveInspection(mode, selection)
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

  const captureInspectionScreenshot = () => {
    if (!inspectionResolution) {
      return;
    }
    void screenshotAnnotation.capture({
      iframe: getPreviewFrame(inspectionPreviewMode),
      geometry: inspectionResolution.selection.geometry,
      expectedPreviewUrl: inspectionPreviewUrl
    });
  };

  const setCompareMode = (compareMode: boolean) => {
    persistAllVisibleScrollPositions();
    setLayoutPreferences((current) => ({ ...current, compareMode }));
  };

  const handlePreviewModeChange = (nextMode: PreviewMode) => {
    persistAllVisibleScrollPositions();
    syncFocusModeScrollPosition(previewMode, nextMode);
    setPreviewMode(nextMode);
  };

  const handleOpenWorkspacePreview = () => {
    if (!previewSources.workspace || typeof window === "undefined") {
      return;
    }

    persistAllVisibleScrollPositions();
    window.location.assign(previewSources.workspace);
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
            setInspectEnabled((current) => !current);
            setInspectionCopyStatus("");
          }}
          inspectAvailable={Boolean(previewOrigin)}
          hasWorkspacePreview={Boolean(previewSources.workspace)}
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
                                setReferenceTarget((current) => ({ ...current, projectSlug: slug }));
                              }}
                              onSourceChange={(source) => {
                                persistAllVisibleScrollPositions();
                                setReferenceTarget((current) => ({ ...current, source }));
                              }}
                              onRootChange={(root) => {
                                persistAllVisibleScrollPositions();
                                setReferenceTarget((current) => ({ ...current, root }));
                              }}
                              onHtmlChange={(htmlPath) => {
                                persistAllVisibleScrollPositions();
                                setReferenceTarget((current) => ({ ...current, htmlPath }));
                              }}
                              onResourceRootChange={(resourceRoot) => {
                                persistAllVisibleScrollPositions();
                                setReferenceTarget((current) => ({ ...current, resourceRoot }));
                              }}
                              onResourcePathChange={(resourcePath) => {
                                persistAllVisibleScrollPositions();
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
                                persistAllVisibleScrollPositions();
                                setSelectedSlug(slug);
                              }}
                              onHtmlChange={(htmlPath) =>
                                setWorkspaceHtmlSelections((current) => ({
                                  ...current,
                                  [selectedSlug]: htmlPath
                                }))
                              }
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
                inspectEnabled={inspectEnabled}
                inspectionResolution={inspectionResolution}
                inspectionResolving={inspectionResolving}
                inspectionTeacherNote={inspectionTeacherNote}
                inspectionIssueCategory={inspectionIssueCategory}
                inspectionPacket={inspectionPacketState.packet}
                inspectionPacketError={inspectionPacketState.error}
                inspectionCopyStatus={inspectionCopyStatus}
                screenshotSupported={screenshotAnnotation.isSupported}
                screenshotStatus={screenshotAnnotation.status}
                screenshotError={screenshotAnnotation.error}
                screenshot={screenshotAnnotation.annotation}
                onInspectionTeacherNoteChange={setInspectionTeacherNote}
                onInspectionIssueCategoryChange={setInspectionIssueCategory}
                onCopyInspectionPacket={copyInspectionPacket}
                onCaptureScreenshot={captureInspectionScreenshot}
                onScreenshotMarkerChange={screenshotAnnotation.updateMarker}
                onDownloadScreenshot={() => void screenshotAnnotation.download()}
                onDiscardScreenshot={screenshotAnnotation.clear}
              />
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
