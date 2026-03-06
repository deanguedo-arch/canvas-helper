import { useMemo, useState } from "react";

import { CommandToolbar } from "./components/CommandToolbar";
import { InspectorPanel } from "./components/InspectorPanel";
import { PreviewPane } from "./components/PreviewPane";
import { ReferencePicker } from "./components/ReferencePicker";
import { Topbar } from "./components/Topbar";
import { WorkspacePicker } from "./components/WorkspacePicker";
import { useLayoutPreferences } from "./hooks/useLayoutPreferences";
import { usePreviewScrollSync } from "./hooks/usePreviewScrollSync";
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

export function App() {
  const { projects, errorMessage, refreshProjects } = useProjects();
  const { selectedSlug, setSelectedSlug, previewMode, setPreviewMode } = useStudioSelection(projects);
  const { layoutPreferences, setLayoutPreferences, paneControlsVisible, setPaneControlsVisible } =
    useLayoutPreferences();
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
    if (!selectedProject || !workspaceTarget) {
      return { reference: "", workspace: "" };
    }

    const workspaceSrc = toPreviewUrl(
      "workspace",
      selectedProject.manifest.slug,
      workspaceTarget.htmlPath,
      selectedProject.revisions.workspace
    );

    const referenceSrc =
      resolvedReference.project && resolvedReference.target.projectSlug
        ? resolvedReference.target.source === "resource"
          ? resolvedReference.target.resourcePath
            ? toReferenceResourcePreviewUrl(
                resolvedReference.target.resourceRoot,
                resolvedReference.target.projectSlug,
                resolvedReference.target.resourcePath,
                referenceRevision
              )
            : ""
          : toPreviewUrl(
              resolvedReference.target.root,
              resolvedReference.target.projectSlug,
              resolvedReference.target.htmlPath,
              referenceRevision
            )
        : "";

    return { reference: referenceSrc, workspace: workspaceSrc };
  }, [referenceRevision, resolvedReference, selectedProject, workspaceTarget]);

  const {
    registerPreviewFrame,
    attachPreviewPersistence,
    persistAllVisibleScrollPositions,
    copyPreviewModeScrollPosition,
    syncFocusModeScrollPosition,
    fitPreviewToWidth
  } = usePreviewScrollSync({
    previewMode,
    layoutPreferences,
    setLayoutPreferences,
    selectedProject,
    workspaceTarget,
    referenceTarget: resolvedReference.target
  });

  const referenceProjectOptions = projects.map((project) => project.manifest.slug);
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

  const setCompareMode = (compareMode: boolean) => {
    persistAllVisibleScrollPositions();
    setLayoutPreferences((current) => ({ ...current, compareMode }));
  };

  const handlePreviewModeChange = (nextMode: PreviewMode) => {
    persistAllVisibleScrollPositions();
    syncFocusModeScrollPosition(previewMode, nextMode);
    setPreviewMode(nextMode);
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
    <div className="shell">
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
        />

        {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

        <div className={layoutPreferences.inspectorOpen ? "content-grid inspector-open" : "content-grid"}>
          <section className="preview-workspace">
            {selectedProject ? (
              <div className={layoutPreferences.compareMode ? "preview-deck split" : "preview-deck focus"}>
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
                            projectOptions={referenceProjectOptions}
                            htmlOptions={referenceFileOptions}
                            resourceOptions={referenceResourceOptions}
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
              <div className="empty-preview">Import a project to start previewing it here.</div>
            )}
          </section>

          {layoutPreferences.inspectorOpen ? (
            <InspectorPanel
              selectedProject={selectedProject}
              sourceFiles={sourceFiles}
              onCopyToClipboard={copyToClipboard}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}
