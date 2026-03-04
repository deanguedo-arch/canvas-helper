import { useEffect, useMemo, useRef, useState } from "react";

const previewModes = ["raw", "workspace"] as const;
const deviceModes = ["desktop", "tablet", "mobile"] as const;
type PreviewMode = (typeof previewModes)[number];
type DeviceMode = (typeof deviceModes)[number];
type StudioSelection = {
  selectedSlug: string;
  previewMode: PreviewMode;
};
type PreviewLayoutPreferences = {
  compareMode: boolean;
  sidebarOpen: boolean;
  inspectorOpen: boolean;
  devices: Record<PreviewMode, DeviceMode>;
  zooms: Record<PreviewMode, number>;
};
type PreviewScrollPosition = {
  windowTop: number;
  windowLeft: number;
  containers: Array<{
    selector: string;
    top: number;
    left: number;
  }>;
};
type PreviewScrollMap = Record<string, PreviewScrollPosition>;

const STUDIO_SELECTION_STORAGE_KEY = "canvas-helper/studio-selection";
const STUDIO_LAYOUT_STORAGE_KEY = "canvas-helper/studio-layout";
const PREVIEW_SCROLL_STORAGE_KEY = "canvas-helper/preview-scroll";
const MAX_TRACKED_SCROLL_CONTAINERS = 8;
const DEVICE_PRESETS: Record<DeviceMode, { label: string; width: string }> = {
  desktop: { label: "Desktop", width: "100%" },
  tablet: { label: "Tablet", width: "820px" },
  mobile: { label: "Mobile", width: "430px" }
};
const DEFAULT_LAYOUT_PREFERENCES: PreviewLayoutPreferences = {
  compareMode: true,
  sidebarOpen: true,
  inspectorOpen: false,
  devices: {
    raw: "tablet",
    workspace: "desktop"
  },
  zooms: {
    raw: 90,
    workspace: 100
  }
};

function normalizeZoom(zoom: number) {
  return Math.min(140, Math.max(60, Math.round(zoom / 5) * 5));
}

function loadStudioSelection(): StudioSelection {
  if (typeof window === "undefined") {
    return {
      selectedSlug: "",
      previewMode: "workspace" as PreviewMode
    };
  }

  try {
    const savedValue = window.localStorage.getItem(STUDIO_SELECTION_STORAGE_KEY);
    if (!savedValue) {
      return {
        selectedSlug: "",
        previewMode: "workspace" as PreviewMode
      };
    }

    const parsed = JSON.parse(savedValue) as Partial<StudioSelection>;

    return {
      selectedSlug: parsed.selectedSlug ?? "",
      previewMode: parsed.previewMode === "raw" ? "raw" : "workspace"
    };
  } catch {
    return {
      selectedSlug: "",
      previewMode: "workspace" as PreviewMode
    };
  }
}

function saveStudioSelection(selectedSlug: string, previewMode: PreviewMode) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STUDIO_SELECTION_STORAGE_KEY,
    JSON.stringify({
      selectedSlug,
      previewMode
    })
  );
}

function loadPreviewLayoutPreferences(): PreviewLayoutPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_LAYOUT_PREFERENCES;
  }

  try {
    const savedValue = window.localStorage.getItem(STUDIO_LAYOUT_STORAGE_KEY);
    if (!savedValue) {
      return DEFAULT_LAYOUT_PREFERENCES;
    }

    const parsed = JSON.parse(savedValue) as Partial<PreviewLayoutPreferences>;

    return {
      compareMode: typeof parsed.compareMode === "boolean" ? parsed.compareMode : DEFAULT_LAYOUT_PREFERENCES.compareMode,
      sidebarOpen:
        typeof parsed.sidebarOpen === "boolean" ? parsed.sidebarOpen : DEFAULT_LAYOUT_PREFERENCES.sidebarOpen,
      inspectorOpen:
        typeof parsed.inspectorOpen === "boolean" ? parsed.inspectorOpen : DEFAULT_LAYOUT_PREFERENCES.inspectorOpen,
      devices: {
        raw: deviceModes.includes(parsed.devices?.raw as DeviceMode)
          ? (parsed.devices?.raw as DeviceMode)
          : DEFAULT_LAYOUT_PREFERENCES.devices.raw,
        workspace: deviceModes.includes(parsed.devices?.workspace as DeviceMode)
          ? (parsed.devices?.workspace as DeviceMode)
          : DEFAULT_LAYOUT_PREFERENCES.devices.workspace
      },
      zooms: {
        raw: normalizeZoom(
          typeof parsed.zooms?.raw === "number" ? parsed.zooms.raw : DEFAULT_LAYOUT_PREFERENCES.zooms.raw
        ),
        workspace: normalizeZoom(
          typeof parsed.zooms?.workspace === "number"
            ? parsed.zooms.workspace
            : DEFAULT_LAYOUT_PREFERENCES.zooms.workspace
        )
      }
    };
  } catch {
    return DEFAULT_LAYOUT_PREFERENCES;
  }
}

function savePreviewLayoutPreferences(preferences: PreviewLayoutPreferences) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STUDIO_LAYOUT_STORAGE_KEY, JSON.stringify(preferences));
}

function loadPreviewScrollMap(): PreviewScrollMap {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const savedValue = window.localStorage.getItem(PREVIEW_SCROLL_STORAGE_KEY);
    return savedValue ? (JSON.parse(savedValue) as PreviewScrollMap) : {};
  } catch {
    return {};
  }
}

function savePreviewScrollMap(scrollMap: PreviewScrollMap) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PREVIEW_SCROLL_STORAGE_KEY, JSON.stringify(scrollMap));
}

function getPreviewScrollKey(slug: string, mode: PreviewMode) {
  return `${slug}:${mode}`;
}

function escapeSelectorToken(value: string) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  return value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function getElementSelector(element: HTMLElement) {
  if (element.id) {
    return `#${escapeSelectorToken(element.id)}`;
  }

  const parts: string[] = [];
  let current: HTMLElement | null = element;
  let depth = 0;

  while (current && depth < 8) {
    const tagName = current.tagName.toLowerCase();
    const currentTagName = current.tagName;
    let selector = tagName;

    if (current.id) {
      selector += `#${escapeSelectorToken(current.id)}`;
      parts.unshift(selector);
      break;
    }

    const parentElement: HTMLElement | null = current.parentElement;
    if (parentElement) {
      const siblings = Array.from(parentElement.children).filter(
        (child: Element) => child.tagName === currentTagName
      );
      if (siblings.length > 1) {
        selector += `:nth-of-type(${siblings.indexOf(current) + 1})`;
      }
    }

    parts.unshift(selector);
    current = parentElement;
    depth += 1;
  }

  return parts.join(" > ");
}

function isScrollableElement(element: HTMLElement) {
  const owningWindow = element.ownerDocument.defaultView;
  if (!owningWindow) {
    return false;
  }

  const style = owningWindow.getComputedStyle(element);
  const canScrollY =
    /(auto|scroll|overlay)/.test(style.overflowY) && element.scrollHeight - element.clientHeight > 24;
  const canScrollX =
    /(auto|scroll|overlay)/.test(style.overflowX) && element.scrollWidth - element.clientWidth > 24;

  return canScrollX || canScrollY;
}

function capturePreviewScrollPosition(iframe: HTMLIFrameElement) {
  const contentWindow = iframe.contentWindow;
  const contentDocument = iframe.contentDocument;
  if (!contentWindow || !contentDocument) {
    return null;
  }

  const seenSelectors = new Set<string>();
  const containers = Array.from(contentDocument.querySelectorAll<HTMLElement>("body *"))
    .filter((element) => isScrollableElement(element))
    .map((element) => ({
      element,
      selector: getElementSelector(element),
      score: Math.max(element.scrollHeight - element.clientHeight, element.scrollWidth - element.clientWidth)
    }))
    .sort((left, right) => right.score - left.score)
    .filter(({ selector }) => {
      if (!selector || seenSelectors.has(selector)) {
        return false;
      }

      seenSelectors.add(selector);
      return true;
    })
    .slice(0, MAX_TRACKED_SCROLL_CONTAINERS)
    .map(({ element, selector }) => ({
      selector,
      top: element.scrollTop,
      left: element.scrollLeft
    }));

  return {
    windowTop: contentWindow.scrollY,
    windowLeft: contentWindow.scrollX,
    containers
  } satisfies PreviewScrollPosition;
}

function clonePreviewScrollPosition(scrollPosition: PreviewScrollPosition): PreviewScrollPosition {
  return {
    windowTop: scrollPosition.windowTop,
    windowLeft: scrollPosition.windowLeft,
    containers: scrollPosition.containers.map((container) => ({
      selector: container.selector,
      top: container.top,
      left: container.left
    }))
  };
}

function restorePreviewScrollPosition(iframe: HTMLIFrameElement, scrollPosition: PreviewScrollPosition) {
  const contentWindow = iframe.contentWindow;
  const contentDocument = iframe.contentDocument;
  if (!contentWindow || !contentDocument) {
    return;
  }

  const applyScrollPosition = () => {
    contentWindow.scrollTo(scrollPosition.windowLeft, scrollPosition.windowTop);
    scrollPosition.containers.forEach((container) => {
      const element = contentDocument.querySelector<HTMLElement>(container.selector);
      if (!element) {
        return;
      }

      element.scrollTop = container.top;
      element.scrollLeft = container.left;
    });
  };

  contentWindow.requestAnimationFrame(() => {
    applyScrollPosition();
    contentWindow.setTimeout(applyScrollPosition, 80);
    contentWindow.setTimeout(applyScrollPosition, 260);
  });
}

type SectionManifest = {
  id: string;
  label: string;
  file: string;
  headingText?: string;
  sourceKind: "function" | "dom" | "heuristic";
  editable: boolean;
};

type ReferenceManifest = {
  id: string;
  originalPath: string;
  kind: string;
  extractionStatus: string;
  extractedTextPath?: string;
};

type SessionLogResponse = {
  ok?: boolean;
  path?: string;
  savedAt?: string;
  error?: string;
};

type ProjectBundle = {
  manifest: {
    id: string;
    slug: string;
    sourcePath: string;
    createdAt: string;
    updatedAt: string;
  };
  sectionMap: {
    sections: SectionManifest[];
  } | null;
  referenceIndex: {
    references: ReferenceManifest[];
  } | null;
  paths: {
    root: string;
    rawEntrypoint: string;
    workspaceEntrypoint: string;
    workspaceScript?: string;
    workspaceStyles?: string;
    metaDir: string;
    referencesDir: string;
    sessionLogPath: string;
  };
  styleGuide: string;
  importLog: string;
  revisions: {
    raw: number;
    workspace: number;
  };
};

function toCursorHref(filePath: string) {
  const normalizedPath = filePath.replace(/\\/g, "/");
  return `cursor://file/${encodeURI(normalizedPath)}`;
}

async function fetchProjects() {
  const response = await fetch("/api/projects");
  if (!response.ok) {
    throw new Error("Failed to load projects.");
  }

  return (await response.json()) as ProjectBundle[];
}

export function App() {
  const [projects, setProjects] = useState<ProjectBundle[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>(() => loadStudioSelection().selectedSlug);
  const [previewMode, setPreviewMode] = useState<PreviewMode>(() => loadStudioSelection().previewMode);
  const [layoutPreferences, setLayoutPreferences] = useState<PreviewLayoutPreferences>(() =>
    loadPreviewLayoutPreferences()
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [sessionLogMessage, setSessionLogMessage] = useState<string>("");
  const [sessionLogError, setSessionLogError] = useState<boolean>(false);
  const [isSavingSessionLog, setIsSavingSessionLog] = useState<boolean>(false);
  const previewFrameRefs = useRef<Record<PreviewMode, HTMLIFrameElement | null>>({
    raw: null,
    workspace: null
  });
  const previewShellRefs = useRef<Record<PreviewMode, HTMLDivElement | null>>({
    raw: null,
    workspace: null
  });
  const previewCleanupRefs = useRef<Record<PreviewMode, (() => void) | null>>({
    raw: null,
    workspace: null
  });
  const previewScrollMapRef = useRef<PreviewScrollMap>(loadPreviewScrollMap());

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      try {
        const bundles = await fetchProjects();
        if (cancelled) {
          return;
        }

        setProjects(bundles);
        setSelectedSlug((currentSlug) => {
          if (currentSlug && bundles.some((bundle) => bundle.manifest.slug === currentSlug)) {
            return currentSlug;
          }

          return bundles[0]?.manifest.slug ?? "";
        });
        setErrorMessage("");
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load projects.");
        }
      }
    };

    void loadProjects();

    if (import.meta.hot) {
      import.meta.hot.on("projects:changed", () => {
        void loadProjects();
      });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedProject = useMemo(
    () => projects.find((project) => project.manifest.slug === selectedSlug) ?? null,
    [projects, selectedSlug]
  );

  useEffect(() => {
    setSessionLogMessage("");
    setSessionLogError(false);
  }, [selectedSlug]);

  const previewSources = useMemo(() => {
    if (!selectedProject) {
      return {
        raw: "",
        workspace: ""
      };
    }

    return {
      raw: `/preview/raw/${selectedProject.manifest.slug}/original.html?rev=${selectedProject.revisions.raw}`,
      workspace: `/preview/workspace/${selectedProject.manifest.slug}/index.html?rev=${selectedProject.revisions.workspace}`
    };
  }, [selectedProject]);

  useEffect(() => {
    saveStudioSelection(selectedSlug, previewMode);
  }, [previewMode, selectedSlug]);

  useEffect(() => {
    savePreviewLayoutPreferences(layoutPreferences);
  }, [layoutPreferences]);

  const persistPreviewScrollPosition = (slug: string, mode: PreviewMode) => {
    const iframe = previewFrameRefs.current[mode];
    if (!iframe) {
      return;
    }

    const scrollPosition = capturePreviewScrollPosition(iframe);
    if (!scrollPosition) {
      return;
    }

    previewScrollMapRef.current[getPreviewScrollKey(slug, mode)] = scrollPosition;
    savePreviewScrollMap(previewScrollMapRef.current);
  };

  const persistSelectedProjectScrollPositions = () => {
    if (!selectedProject) {
      return;
    }

    previewModes.forEach((mode) => {
      persistPreviewScrollPosition(selectedProject.manifest.slug, mode);
    });
  };

  const syncPreviewModeScrollPosition = (sourceMode: PreviewMode, targetMode: PreviewMode) => {
    if (!selectedProject || sourceMode === targetMode) {
      return;
    }

    const sourceIframe = previewFrameRefs.current[sourceMode];
    if (!sourceIframe) {
      return;
    }

    const sourceScrollPosition = capturePreviewScrollPosition(sourceIframe);
    if (!sourceScrollPosition) {
      return;
    }

    previewScrollMapRef.current[getPreviewScrollKey(selectedProject.manifest.slug, sourceMode)] =
      clonePreviewScrollPosition(sourceScrollPosition);
    previewScrollMapRef.current[getPreviewScrollKey(selectedProject.manifest.slug, targetMode)] =
      clonePreviewScrollPosition(sourceScrollPosition);
    savePreviewScrollMap(previewScrollMapRef.current);
  };

  const copyPreviewModeScrollPosition = (sourceMode: PreviewMode, targetMode: PreviewMode) => {
    if (!selectedProject || sourceMode === targetMode) {
      return;
    }

    const sourceIframe = previewFrameRefs.current[sourceMode];
    if (!sourceIframe) {
      return;
    }

    const sourceScrollPosition = capturePreviewScrollPosition(sourceIframe);
    if (!sourceScrollPosition) {
      return;
    }

    previewScrollMapRef.current[getPreviewScrollKey(selectedProject.manifest.slug, targetMode)] =
      clonePreviewScrollPosition(sourceScrollPosition);
    savePreviewScrollMap(previewScrollMapRef.current);

    const targetIframe = previewFrameRefs.current[targetMode];
    if (targetIframe) {
      restorePreviewScrollPosition(targetIframe, sourceScrollPosition);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      persistSelectedProjectScrollPositions();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      previewModes.forEach((mode) => {
        previewCleanupRefs.current[mode]?.();
        previewCleanupRefs.current[mode] = null;
      });
    };
  }, [layoutPreferences.compareMode, selectedProject]);

  useEffect(() => {
    if (!selectedProject) {
      return;
    }

    const iframe = previewFrameRefs.current[previewMode];
    const scrollPosition = previewScrollMapRef.current[getPreviewScrollKey(selectedProject.manifest.slug, previewMode)];
    if (!iframe || !scrollPosition) {
      return;
    }

    const restoreTimer = window.setTimeout(() => {
      restorePreviewScrollPosition(iframe, scrollPosition);
    }, 0);

    return () => {
      window.clearTimeout(restoreTimer);
    };
  }, [previewMode, selectedProject]);

  const attachPreviewPersistence = (mode: PreviewMode) => {
    if (!selectedProject) {
      return;
    }

    previewCleanupRefs.current[mode]?.();
    const iframe = previewFrameRefs.current[mode];
    const contentWindow = iframe?.contentWindow;
    const contentDocument = iframe?.contentDocument;

    if (!iframe || !contentWindow || !contentDocument) {
      previewCleanupRefs.current[mode] = null;
      return;
    }

    const scrollKey = getPreviewScrollKey(selectedProject.manifest.slug, mode);
    const restoreState = previewScrollMapRef.current[scrollKey];
    if (restoreState) {
      restorePreviewScrollPosition(iframe, restoreState);
    }

    let frameHandle = 0;
    const scheduleSave = () => {
      if (frameHandle) {
        return;
      }

      frameHandle = contentWindow.requestAnimationFrame(() => {
        frameHandle = 0;
        persistPreviewScrollPosition(selectedProject.manifest.slug, mode);
      });
    };

    contentWindow.addEventListener("scroll", scheduleSave, { passive: true });
    contentWindow.addEventListener("hashchange", scheduleSave);
    contentDocument.addEventListener("scroll", scheduleSave, true);

    previewCleanupRefs.current[mode] = () => {
      if (frameHandle) {
        contentWindow.cancelAnimationFrame(frameHandle);
      }

      persistPreviewScrollPosition(selectedProject.manifest.slug, mode);
      contentWindow.removeEventListener("scroll", scheduleSave);
      contentWindow.removeEventListener("hashchange", scheduleSave);
      contentDocument.removeEventListener("scroll", scheduleSave, true);
    };
  };

  const sourceFiles = selectedProject
    ? [
        selectedProject.paths.rawEntrypoint,
        selectedProject.paths.workspaceEntrypoint,
        selectedProject.paths.workspaceScript,
        selectedProject.paths.workspaceStyles
      ].filter(Boolean) as string[]
    : [];
  const visiblePreviewModes = layoutPreferences.compareMode ? [...previewModes] : [previewMode];

  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };

  const fitPreviewToWidth = (mode: PreviewMode) => {
    const shell = previewShellRefs.current[mode];
    if (!shell) {
      return;
    }

    const availableWidth = shell.clientWidth;
    if (availableWidth <= 0) {
      return;
    }

    setLayoutPreferences((current) => {
      const activeDevice = current.devices[mode];
      const baseWidth = activeDevice === "tablet" ? 820 : activeDevice === "mobile" ? 430 : availableWidth;
      const fitZoom = normalizeZoom((availableWidth / baseWidth) * 100);

      return {
        ...current,
        zooms: {
          ...current.zooms,
          [mode]: fitZoom
        }
      };
    });
  };

  const saveSessionLog = async () => {
    if (!selectedProject) {
      return;
    }

    try {
      setIsSavingSessionLog(true);
      setSessionLogError(false);
      setSessionLogMessage("");
      persistSelectedProjectScrollPositions();

      const rawScroll = previewScrollMapRef.current[getPreviewScrollKey(selectedProject.manifest.slug, "raw")];
      const workspaceScroll =
        previewScrollMapRef.current[getPreviewScrollKey(selectedProject.manifest.slug, "workspace")];

      const response = await fetch(`/api/projects/${encodeURIComponent(selectedProject.manifest.slug)}/session-log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          savedAt: new Date().toISOString(),
          sourcePath: selectedProject.manifest.sourcePath,
          selectedMode: previewMode,
          compareMode: layoutPreferences.compareMode,
          sidebarOpen: layoutPreferences.sidebarOpen,
          inspectorOpen: layoutPreferences.inspectorOpen,
          devices: layoutPreferences.devices,
          zooms: layoutPreferences.zooms,
          scrollTop: {
            raw: rawScroll?.windowTop ?? null,
            workspace: workspaceScroll?.windowTop ?? null
          },
          sourceFiles
        })
      });

      const result = (await response.json()) as SessionLogResponse;
      if (!response.ok || !result.path) {
        throw new Error(result.error ?? "Failed to save session log.");
      }

      setSessionLogMessage(`Saved handoff log to ${result.path}`);
    } catch (error) {
      setSessionLogError(true);
      setSessionLogMessage(error instanceof Error ? error.message : "Failed to save session log.");
    } finally {
      setIsSavingSessionLog(false);
    }
  };

  const renderPreviewPane = (mode: PreviewMode) => {
    const devicePreset = DEVICE_PRESETS[layoutPreferences.devices[mode]];
    const zoomScale = layoutPreferences.zooms[mode] / 100;
    const previewCanvasStyle = {
      "--device-width": devicePreset.width,
      "--zoom-scale": String(zoomScale)
    } as React.CSSProperties;

    return (
      <article key={mode} className="preview-pane">
        <div className="preview-pane-header">
          <div className="pane-heading">
            <p className="pane-kicker">{mode === "raw" ? "Raw Baseline" : "Workspace Edit"}</p>
            <h3>{mode === "raw" ? "Raw" : "Workspace"}</h3>
          </div>

          {layoutPreferences.compareMode ? (
            <button
              type="button"
              className="ghost-button pane-match-button"
              onClick={() => copyPreviewModeScrollPosition(mode, mode === "raw" ? "workspace" : "raw")}
            >
              {mode === "raw" ? "Match Workspace" : "Match Raw"}
            </button>
          ) : null}
        </div>

        <div className="preview-pane-controls">
          <div className="segmented-control compact">
            {deviceModes.map((deviceMode) => (
              <button
                key={`${mode}:${deviceMode}`}
                type="button"
                className={
                  layoutPreferences.devices[mode] === deviceMode ? "segmented-button active" : "segmented-button"
                }
                onClick={() =>
                  setLayoutPreferences((current) => ({
                    ...current,
                    devices: {
                      ...current.devices,
                      [mode]: deviceMode
                    }
                  }))
                }
              >
                {DEVICE_PRESETS[deviceMode].label}
              </button>
            ))}
          </div>

          <div className="zoom-controls">
            <button type="button" className="ghost-button compact fit-button" onClick={() => fitPreviewToWidth(mode)}>
              Fit
            </button>
            <label className="zoom-control">
              <span>Zoom</span>
              <input
                className="zoom-slider"
                type="range"
                min="60"
                max="140"
                step="5"
                value={layoutPreferences.zooms[mode]}
                onChange={(event) =>
                  setLayoutPreferences((current) => ({
                    ...current,
                    zooms: {
                      ...current.zooms,
                      [mode]: normalizeZoom(Number(event.target.value))
                    }
                  }))
                }
              />
              <strong>{layoutPreferences.zooms[mode]}%</strong>
            </label>
          </div>
        </div>

        <div className="preview-stage">
          <div
            className="preview-canvas-shell"
            ref={(node) => {
              previewShellRefs.current[mode] = node;
            }}
          >
            <div className={`preview-canvas preview-canvas-${layoutPreferences.devices[mode]}`} style={previewCanvasStyle}>
              <iframe
                key={`${selectedProject?.manifest.slug ?? "empty"}:${mode}`}
                ref={(node) => {
                  if (!node) {
                    previewCleanupRefs.current[mode]?.();
                    previewCleanupRefs.current[mode] = null;
                  }
                  previewFrameRefs.current[mode] = node;
                }}
                className={layoutPreferences.compareMode || previewMode === mode ? "preview-frame" : "preview-frame is-hidden"}
                src={previewSources[mode]}
                title={`${selectedProject?.manifest.slug ?? "preview"} ${mode} preview`}
                sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups allow-downloads"
                aria-hidden={!layoutPreferences.compareMode && previewMode !== mode}
                onLoad={() => attachPreviewPersistence(mode)}
              />
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="shell">
      <main className="main-panel">
        <header className="topbar topbar-compact">
          <div className="project-summary">
            <p className="eyebrow">Local Studio</p>
            <div className="project-heading-row">
              <h2>{selectedProject?.manifest.slug ?? "No project selected"}</h2>
              {projects.length ? (
                <label className="project-switcher">
                  <span className="sr-only">Choose project</span>
                  <select
                    value={selectedSlug}
                    onChange={(event) => {
                      persistSelectedProjectScrollPositions();
                      setSelectedSlug(event.target.value);
                    }}
                  >
                    {projects.map((project) => (
                      <option key={project.manifest.id} value={project.manifest.slug}>
                        {project.manifest.slug}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <button className="ghost-button compact" type="button" onClick={() => void fetchProjects().then(setProjects)}>
                Refresh
              </button>
            </div>
            {selectedProject ? (
              <p className="mode-memory-note compact-note">
                Split view keeps raw/workspace synced by section, with independent device and zoom controls.
              </p>
            ) : null}
          </div>

          <div className="topbar-actions">
            <div className="segmented-control">
              <button
                type="button"
                className={layoutPreferences.compareMode ? "segmented-button" : "segmented-button active"}
                onClick={() => {
                  persistSelectedProjectScrollPositions();
                  setLayoutPreferences((current) => ({
                    ...current,
                    compareMode: false
                  }));
                }}
              >
                Focus
              </button>
              <button
                type="button"
                className={layoutPreferences.compareMode ? "segmented-button active" : "segmented-button"}
                onClick={() => {
                  persistSelectedProjectScrollPositions();
                  setLayoutPreferences((current) => ({
                    ...current,
                    compareMode: true
                  }));
                }}
              >
                Split
              </button>
            </div>

            {!layoutPreferences.compareMode ? (
              <div className="segmented-control" role="tablist" aria-label="Preview mode">
                <button
                  type="button"
                  className={previewMode === "raw" ? "segmented-button active" : "segmented-button"}
                  onClick={() => {
                    persistSelectedProjectScrollPositions();
                    syncPreviewModeScrollPosition(previewMode, "raw");
                    setPreviewMode("raw");
                  }}
                >
                  Raw
                </button>
                <button
                  type="button"
                  className={previewMode === "workspace" ? "segmented-button active" : "segmented-button"}
                  onClick={() => {
                    persistSelectedProjectScrollPositions();
                    syncPreviewModeScrollPosition(previewMode, "workspace");
                    setPreviewMode("workspace");
                  }}
                >
                  Workspace
                </button>
              </div>
            ) : null}

            <button
              type="button"
              className="ghost-button compact"
              onClick={() => void saveSessionLog()}
              disabled={!selectedProject || isSavingSessionLog}
            >
              {isSavingSessionLog ? "Saving..." : "Save Log"}
            </button>

            <button
              type="button"
              className="ghost-button compact"
              onClick={() => selectedProject && void copyToClipboard(selectedProject.paths.sessionLogPath)}
              disabled={!selectedProject}
            >
              Copy Path
            </button>

            <button
              type="button"
              className={layoutPreferences.inspectorOpen ? "ghost-button compact" : "ghost-button compact active-toggle"}
              onClick={() =>
                setLayoutPreferences((current) => ({
                  ...current,
                  inspectorOpen: !current.inspectorOpen
                }))
              }
            >
              {layoutPreferences.inspectorOpen ? "Hide Details" : "Details"}
            </button>
          </div>
        </header>

        {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}
        {sessionLogMessage ? (
          <div className={sessionLogError ? "status-banner error" : "status-banner"}>{sessionLogMessage}</div>
        ) : null}

        <div className={layoutPreferences.inspectorOpen ? "content-grid inspector-open" : "content-grid"}>
          <section className="preview-workspace">
            {selectedProject ? (
              <div className={layoutPreferences.compareMode ? "preview-deck split" : "preview-deck focus"}>
                {visiblePreviewModes.map((mode) => renderPreviewPane(mode))}
              </div>
            ) : (
              <div className="empty-preview">Import a project to start previewing it here.</div>
            )}
          </section>

          {layoutPreferences.inspectorOpen ? <section className="inspector">
            <div className="panel-card">
              <div className="section-header">
                <h3>Source Files</h3>
              </div>
              {sourceFiles.length === 0 ? <p className="empty-state">No source files available yet.</p> : null}
              {sourceFiles.map((filePath) => (
                <div key={filePath} className="file-row">
                  <code>{filePath}</code>
                  <div className="file-actions">
                    <button type="button" className="ghost-button" onClick={() => void copyToClipboard(filePath)}>
                      Copy
                    </button>
                    <a className="ghost-button linkish" href={toCursorHref(filePath)}>
                      Cursor
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="panel-card">
              <div className="section-header">
                <h3>Sections</h3>
              </div>
              {selectedProject?.sectionMap?.sections.length ? (
                <div className="token-list">
                  {selectedProject.sectionMap.sections.map((section) => (
                    <div key={section.id} className="token-card">
                      <strong>{section.label}</strong>
                      {section.headingText ? <span>{section.headingText}</span> : <span>{section.file}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No structured sections detected yet.</p>
              )}
            </div>

            <div className="panel-card">
              <div className="section-header">
                <h3>References</h3>
              </div>
              {selectedProject?.referenceIndex?.references.length ? (
                <div className="token-list">
                  {selectedProject.referenceIndex.references.map((reference) => (
                    <div key={reference.id} className="token-card">
                      <strong>{reference.kind}</strong>
                      <span>{reference.extractionStatus}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">Drop files into the project references/raw folder and run `npm run refs`.</p>
              )}
            </div>

            <div className="panel-card">
              <div className="section-header">
                <h3>Style Guide</h3>
              </div>
              <pre className="document-view">{selectedProject?.styleGuide ?? ""}</pre>
            </div>

            <div className="panel-card">
              <div className="section-header">
                <h3>Import Log</h3>
              </div>
              <pre className="document-view">{selectedProject?.importLog ?? ""}</pre>
            </div>
          </section> : null}
        </div>
      </main>
    </div>
  );
}
