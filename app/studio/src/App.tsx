import { useEffect, useMemo, useRef, useState } from "react";

import { getReferenceResourceRenderMode } from "./reference-resource-preview";

const previewModes = ["reference", "workspace"] as const;
const deviceModes = ["desktop", "tablet", "mobile"] as const;

type PreviewMode = (typeof previewModes)[number];
type DeviceMode = (typeof deviceModes)[number];
type PreviewRoot = "raw" | "workspace";

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
type ScrollSelectorCache = Record<string, string[]>;

type ReferenceTarget = {
  projectSlug: string;
  source: "html" | "resource";
  root: PreviewRoot;
  htmlPath: string;
  resourceRoot: "raw" | "extracted";
  resourcePath: string;
};

type ResolvedReference = {
  project: ProjectBundle | null;
  target: ReferenceTarget;
  options: {
    html: string[];
    resourcesRaw: string[];
    resourcesExtracted: string[];
    resourcesActive: string[];
  };
};

type StudioCommandName = "analyze" | "refs" | "verify" | "export" | "package" | "html";
type StudioCommandStatus = "idle" | "running" | "success" | "error";
type StudioCommandResult = {
  ok: boolean;
  command: StudioCommandName;
  slug: string;
  exitCode: number;
  startedAt: string;
  finishedAt: string;
  stdout: string;
  stderr: string;
};

const STUDIO_SELECTION_STORAGE_KEY = "canvas-helper/studio-selection";
const STUDIO_LAYOUT_STORAGE_KEY = "canvas-helper/studio-layout";
const STUDIO_REFERENCE_STORAGE_KEY = "canvas-helper/studio-reference";
const PREVIEW_SCROLL_STORAGE_KEY = "canvas-helper/preview-scroll";
const STUDIO_COMMAND_OUTPUT_VISIBLE_KEY = "canvas-helper/studio-command-output-visible";

const MAX_TRACKED_SCROLL_CONTAINERS = 8;
const MAX_SCAN_NODES = 12000;
const STUDIO_COMMANDS: Array<{ id: StudioCommandName; label: string }> = [
  { id: "analyze", label: "Analyze" },
  { id: "refs", label: "Refs" },
  { id: "verify", label: "Verify" },
  { id: "export", label: "Export Dir" },
  { id: "package", label: "Package" },
  { id: "html", label: "HTML" }
];

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
    reference: "tablet",
    workspace: "desktop"
  },
  zooms: {
    reference: 90,
    workspace: 100
  }
};

function normalizeZoom(zoom: number) {
  return Math.min(140, Math.max(60, Math.round(zoom / 5) * 5));
}

function loadStudioSelection(): StudioSelection {
  if (typeof window === "undefined") {
    return { selectedSlug: "", previewMode: "workspace" };
  }

  try {
    const savedValue = window.localStorage.getItem(STUDIO_SELECTION_STORAGE_KEY);
    if (!savedValue) {
      return { selectedSlug: "", previewMode: "workspace" };
    }
    const parsed = JSON.parse(savedValue) as Partial<StudioSelection>;
    return {
      selectedSlug: parsed.selectedSlug ?? "",
      previewMode: parsed.previewMode === "reference" ? "reference" : "workspace"
    };
  } catch {
    return { selectedSlug: "", previewMode: "workspace" };
  }
}

function saveStudioSelection(selectedSlug: string, previewMode: PreviewMode) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STUDIO_SELECTION_STORAGE_KEY,
    JSON.stringify({ selectedSlug, previewMode })
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
      sidebarOpen: typeof parsed.sidebarOpen === "boolean" ? parsed.sidebarOpen : DEFAULT_LAYOUT_PREFERENCES.sidebarOpen,
      inspectorOpen:
        typeof parsed.inspectorOpen === "boolean" ? parsed.inspectorOpen : DEFAULT_LAYOUT_PREFERENCES.inspectorOpen,
      devices: {
        reference: deviceModes.includes(parsed.devices?.reference as DeviceMode)
          ? (parsed.devices?.reference as DeviceMode)
          : DEFAULT_LAYOUT_PREFERENCES.devices.reference,
        workspace: deviceModes.includes(parsed.devices?.workspace as DeviceMode)
          ? (parsed.devices?.workspace as DeviceMode)
          : DEFAULT_LAYOUT_PREFERENCES.devices.workspace
      },
      zooms: {
        reference: normalizeZoom(
          typeof parsed.zooms?.reference === "number" ? parsed.zooms.reference : DEFAULT_LAYOUT_PREFERENCES.zooms.reference
        ),
        workspace: normalizeZoom(
          typeof parsed.zooms?.workspace === "number" ? parsed.zooms.workspace : DEFAULT_LAYOUT_PREFERENCES.zooms.workspace
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

function loadReferenceTarget(): ReferenceTarget {
  if (typeof window === "undefined") {
    return {
      projectSlug: "",
      source: "html",
      root: "raw",
      htmlPath: "original.html",
      resourceRoot: "raw",
      resourcePath: ""
    };
  }

  try {
    const savedValue = window.localStorage.getItem(STUDIO_REFERENCE_STORAGE_KEY);
    if (!savedValue) {
      return {
        projectSlug: "",
        source: "html",
        root: "raw",
        htmlPath: "original.html",
        resourceRoot: "raw",
        resourcePath: ""
      };
    }
    const parsed = JSON.parse(savedValue) as Partial<ReferenceTarget>;
    const root: PreviewRoot = parsed.root === "workspace" ? "workspace" : "raw";
    const source = parsed.source === "resource" ? "resource" : "html";
    const resourceRoot = parsed.resourceRoot === "extracted" ? "extracted" : "raw";
    return {
      projectSlug: parsed.projectSlug ?? "",
      source,
      root,
      htmlPath: parsed.htmlPath ?? (root === "workspace" ? "index.html" : "original.html"),
      resourceRoot,
      resourcePath: parsed.resourcePath ?? ""
    };
  } catch {
    return {
      projectSlug: "",
      source: "html",
      root: "raw",
      htmlPath: "original.html",
      resourceRoot: "raw",
      resourcePath: ""
    };
  }
}

function saveReferenceTarget(target: ReferenceTarget) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STUDIO_REFERENCE_STORAGE_KEY, JSON.stringify(target));
}

function loadCommandOutputVisible() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(STUDIO_COMMAND_OUTPUT_VISIBLE_KEY) === "1";
  } catch {
    return false;
  }
}

function saveCommandOutputVisible(value: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STUDIO_COMMAND_OUTPUT_VISIBLE_KEY, value ? "1" : "0");
}

function uniqueStrings(values: Array<string | undefined>) {
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const value of values) {
    if (!value || seen.has(value)) {
      continue;
    }

    seen.add(value);
    ordered.push(value);
  }

  return ordered;
}

function equalReferenceTargets(a: ReferenceTarget, b: ReferenceTarget) {
  return (
    a.projectSlug === b.projectSlug &&
    a.source === b.source &&
    a.root === b.root &&
    a.htmlPath === b.htmlPath &&
    a.resourceRoot === b.resourceRoot &&
    a.resourcePath === b.resourcePath
  );
}

function normalizeSlashes(value: string) {
  return value.replace(/\\/g, "/");
}

function toReferenceOptionPath(filePath: string | undefined, rootPrefix: string) {
  if (!filePath) {
    return "";
  }

  const normalizedFilePath = normalizeSlashes(filePath);
  const normalizedRoot = normalizeSlashes(rootPrefix).replace(/\/+$/, "");
  const normalizedFilePathLower = normalizedFilePath.toLowerCase();
  const normalizedRootLower = normalizedRoot.toLowerCase();

  if (normalizedFilePathLower === normalizedRootLower) {
    return "";
  }

  if (normalizedFilePathLower.startsWith(`${normalizedRootLower}/`)) {
    return normalizedFilePath.slice(normalizedRoot.length + 1);
  }

  return normalizedFilePath;
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
      const siblings = Array.from(parentElement.children).filter((child: Element) => child.tagName === currentTagName);
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
  const canScrollY = /(auto|scroll|overlay)/.test(style.overflowY) && element.scrollHeight - element.clientHeight > 24;
  const canScrollX = /(auto|scroll|overlay)/.test(style.overflowX) && element.scrollWidth - element.clientWidth > 24;

  return canScrollX || canScrollY;
}

function toPreviewUrl(root: PreviewRoot, slug: string, relativePath: string, rev: number) {
  const encodedSlug = encodeURIComponent(slug);
  const encodedPath = relativePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `/preview/${root}/${encodedSlug}/${encodedPath}?rev=${rev}`;
}

function toReferenceResourcePreviewUrl(root: "raw" | "extracted", slug: string, relativePath: string, rev: number) {
  const encodedSlug = encodeURIComponent(slug);
  const encodedPath = relativePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `/preview/references/${root}/${encodedSlug}/${encodedPath}?rev=${rev}`;
}

type CaptureResult = {
  position: PreviewScrollPosition;
  selectors: string[];
};

function capturePreviewScrollPosition(iframe: HTMLIFrameElement, cachedSelectors?: string[]): CaptureResult | null {
  const contentWindow = iframe.contentWindow;
  const contentDocument = iframe.contentDocument;
  if (!contentWindow || !contentDocument) {
    return null;
  }

  if (cachedSelectors && cachedSelectors.length) {
    const containers = cachedSelectors
      .map((selector) => {
        const element = contentDocument.querySelector<HTMLElement>(selector);
        if (!element || !isScrollableElement(element)) {
          return null;
        }
        return { selector, top: element.scrollTop, left: element.scrollLeft };
      })
      .filter(Boolean) as PreviewScrollPosition["containers"];

    if (containers.length) {
      return {
        position: {
          windowTop: contentWindow.scrollY,
          windowLeft: contentWindow.scrollX,
          containers
        },
        selectors: cachedSelectors
      };
    }
  }

  const seenSelectors = new Set<string>();
  const nodes = Array.from(contentDocument.querySelectorAll<HTMLElement>("body *")).slice(0, MAX_SCAN_NODES);

  const candidates = nodes
    .filter((element) => isScrollableElement(element))
    .map((element) => ({
      element,
      selector: getElementSelector(element),
      score: Math.max(element.scrollHeight - element.clientHeight, element.scrollWidth - element.clientWidth)
    }))
    .sort((a, b) => b.score - a.score)
    .filter(({ selector }) => {
      if (!selector || seenSelectors.has(selector)) {
        return false;
      }
      seenSelectors.add(selector);
      return true;
    })
    .slice(0, MAX_TRACKED_SCROLL_CONTAINERS);

  const selectors = candidates.map((candidate) => candidate.selector);
  const containers = candidates.map(({ element, selector }) => ({
    selector,
    top: element.scrollTop,
    left: element.scrollLeft
  }));

  return {
    position: {
      windowTop: contentWindow.scrollY,
      windowLeft: contentWindow.scrollX,
      containers
    },
    selectors
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

type ProjectBundle = {
  manifest: {
    id: string;
    slug: string;
    sourcePath: string;
    createdAt: string;
    updatedAt: string;
  };
  sectionMap: { sections: SectionManifest[] } | null;
  referenceIndex: { references: ReferenceManifest[] } | null;
  htmlFiles: { raw: string[]; workspace: string[] };
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
  revisions: { raw: number; workspace: number };
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

function getTargetKey(target: {
  projectSlug: string;
  root: PreviewRoot;
  htmlPath: string;
  source?: "html" | "resource";
  resourceRoot?: "raw" | "extracted";
  resourcePath?: string;
}) {
  const source = target.source ?? "html";
  const resourceRoot = target.resourceRoot ?? "raw";
  const resourcePath = target.resourcePath ?? "";
  return `${target.projectSlug}:${source}:${target.root}:${target.htmlPath}:${resourceRoot}:${resourcePath}`;
}

export function App() {
  const [projects, setProjects] = useState<ProjectBundle[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>(() => loadStudioSelection().selectedSlug);
  const [previewMode, setPreviewMode] = useState<PreviewMode>(() => loadStudioSelection().previewMode);
  const [layoutPreferences, setLayoutPreferences] = useState<PreviewLayoutPreferences>(() => loadPreviewLayoutPreferences());
  const [referenceTarget, setReferenceTarget] = useState<ReferenceTarget>(() => loadReferenceTarget());
  const [workspaceHtmlSelections, setWorkspaceHtmlSelections] = useState<Record<string, string>>({});
  const [paneControlsVisible, setPaneControlsVisible] = useState<Record<PreviewMode, boolean>>({
    reference: true,
    workspace: true
  });
  const [commandStatus, setCommandStatus] = useState<Record<StudioCommandName, StudioCommandStatus>>({
    analyze: "idle",
    refs: "idle",
    verify: "idle",
    export: "idle",
    package: "idle",
    html: "idle"
  });
  const [commandLog, setCommandLog] = useState<string>("");
  const [commandBanner, setCommandBanner] = useState<string>("");
  const [commandBannerIsError, setCommandBannerIsError] = useState<boolean>(false);
  const [commandOutputVisible, setCommandOutputVisible] = useState<boolean>(() => loadCommandOutputVisible());
  const [errorMessage, setErrorMessage] = useState<string>("");

  const previewFrameRefs = useRef<Record<PreviewMode, HTMLIFrameElement | null>>({
    reference: null,
    workspace: null
  });

  const previewCleanupRefs = useRef<Record<PreviewMode, (() => void) | null>>({
    reference: null,
    workspace: null
  });

  const previewScrollMapRef = useRef<PreviewScrollMap>(loadPreviewScrollMap());
  const scrollSelectorCacheRef = useRef<ScrollSelectorCache>({});

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      try {
        const bundles = await fetchProjects();
        if (cancelled) {
          return;
        }

        setProjects(bundles);

        const fallbackSlug =
          selectedSlug && bundles.some((bundle) => bundle.manifest.slug === selectedSlug)
            ? selectedSlug
            : bundles[0]?.manifest.slug ?? "";

        setSelectedSlug(fallbackSlug);

        setReferenceTarget((current) => {
          const refSlug =
            current.projectSlug && bundles.some((bundle) => bundle.manifest.slug === current.projectSlug)
              ? current.projectSlug
              : fallbackSlug;

          const root: PreviewRoot = current.root === "workspace" ? "workspace" : "raw";
          const project = bundles.find((bundle) => bundle.manifest.slug === refSlug);
          const list = project?.htmlFiles?.[root] ?? [];
          const defaultFile = root === "raw" ? "original.html" : "index.html";
          const htmlPath = list.includes(current.htmlPath)
            ? current.htmlPath
            : list.includes(defaultFile)
              ? defaultFile
              : list[0] ?? defaultFile;
          const source = current.source === "resource" ? "resource" : "html";
          const resourceRoot = current.resourceRoot === "extracted" ? "extracted" : "raw";

          return {
            projectSlug: refSlug,
            source,
            root,
            htmlPath,
            resourceRoot,
            resourcePath: current.resourcePath ?? ""
          };
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
  }, [selectedSlug]);

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

  const resolvedReference = useMemo<ResolvedReference>(() => {
    const project = projects.find((bundle) => bundle.manifest.slug === referenceTarget.projectSlug) ?? null;
    const source = referenceTarget.source === "resource" ? "resource" : "html";
    const root: PreviewRoot = referenceTarget.root === "workspace" ? "workspace" : "raw";
    const htmlOptions = project?.htmlFiles?.[root] ?? [];
    const defaultHtmlFile = root === "raw" ? "original.html" : "index.html";
    const htmlPath = htmlOptions.includes(referenceTarget.htmlPath)
      ? referenceTarget.htmlPath
      : htmlOptions.includes(defaultHtmlFile)
        ? defaultHtmlFile
        : htmlOptions[0] ?? defaultHtmlFile;

    const references = project?.referenceIndex?.references ?? [];
    const referencesRootPath = project ? normalizeSlashes(project.paths.referencesDir) : "";
    const referencesRawRoot = referencesRootPath ? `${referencesRootPath}/raw` : "";
    const referencesExtractedRoot = referencesRootPath ? `${referencesRootPath}/extracted` : "";
    const resourcesRaw = uniqueStrings(
      references.map((reference) => toReferenceOptionPath(reference.originalPath, referencesRawRoot))
    );
    const resourcesExtracted = uniqueStrings(
      references.map((reference) => toReferenceOptionPath(reference.extractedTextPath, referencesExtractedRoot))
    );
    const resourceRoot = referenceTarget.resourceRoot === "extracted" ? "extracted" : "raw";
    const resourcesActive = resourceRoot === "raw" ? resourcesRaw : resourcesExtracted;
    const resourcePath = resourcesActive.includes(referenceTarget.resourcePath)
      ? referenceTarget.resourcePath
      : resourcesActive[0] ?? "";

    return {
      project,
      target: {
        projectSlug: referenceTarget.projectSlug,
        source,
        root,
        htmlPath,
        resourceRoot,
        resourcePath
      },
      options: {
        html: htmlOptions,
        resourcesRaw,
        resourcesExtracted,
        resourcesActive
      }
    };
  }, [projects, referenceTarget]);

  useEffect(() => {
    saveStudioSelection(selectedSlug, previewMode);
  }, [previewMode, selectedSlug]);

  useEffect(() => {
    savePreviewLayoutPreferences(layoutPreferences);
  }, [layoutPreferences]);

  useEffect(() => {
    saveCommandOutputVisible(commandOutputVisible);
  }, [commandOutputVisible]);

  useEffect(() => {
    saveReferenceTarget(resolvedReference.target);
  }, [resolvedReference.target]);

  useEffect(() => {
    if (!equalReferenceTargets(resolvedReference.target, referenceTarget)) {
      setReferenceTarget(resolvedReference.target);
    }
  }, [resolvedReference.target, referenceTarget]);

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
  }, [selectedProject, workspaceTarget, resolvedReference, referenceRevision]);

  const getModeTarget = (mode: PreviewMode) => {
    if (mode === "workspace") {
      return workspaceTarget;
    }
    return resolvedReference.target.projectSlug ? resolvedReference.target : null;
  };

  const persistPreviewScrollPosition = (mode: PreviewMode) => {
    const target = getModeTarget(mode);
    const iframe = previewFrameRefs.current[mode];
    if (!iframe || !target) {
      return;
    }

    const key = getTargetKey(target);
    const cachedSelectors = scrollSelectorCacheRef.current[key];
    const captured = capturePreviewScrollPosition(iframe, cachedSelectors);
    if (!captured) {
      return;
    }

    scrollSelectorCacheRef.current[key] = captured.selectors;
    previewScrollMapRef.current[key] = captured.position;
    savePreviewScrollMap(previewScrollMapRef.current);
  };

  const persistAllVisibleScrollPositions = () => {
    previewModes.forEach((mode) => persistPreviewScrollPosition(mode));
  };

  const copyPreviewModeScrollPosition = (sourceMode: PreviewMode, targetMode: PreviewMode) => {
    const sourceTarget = getModeTarget(sourceMode);
    const targetTarget = getModeTarget(targetMode);
    if (!sourceTarget || !targetTarget) {
      return;
    }

    const sourceIframe = previewFrameRefs.current[sourceMode];
    if (!sourceIframe) {
      return;
    }

    const sourceKey = getTargetKey(sourceTarget);
    const cachedSelectors = scrollSelectorCacheRef.current[sourceKey];
    const captured = capturePreviewScrollPosition(sourceIframe, cachedSelectors);
    if (!captured) {
      return;
    }

    scrollSelectorCacheRef.current[sourceKey] = captured.selectors;
    previewScrollMapRef.current[sourceKey] = captured.position;

    const targetKey = getTargetKey(targetTarget);
    scrollSelectorCacheRef.current[targetKey] = captured.selectors;
    previewScrollMapRef.current[targetKey] = captured.position;

    savePreviewScrollMap(previewScrollMapRef.current);

    const targetIframe = previewFrameRefs.current[targetMode];
    if (targetIframe) {
      restorePreviewScrollPosition(targetIframe, captured.position);
    }
  };

  const syncFocusModeScrollPosition = (fromMode: PreviewMode, toMode: PreviewMode) => {
    if (fromMode === toMode) {
      return;
    }
    copyPreviewModeScrollPosition(fromMode, toMode);
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      persistAllVisibleScrollPositions();
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
  }, [selectedProject, resolvedReference, layoutPreferences.compareMode]);

  useEffect(() => {
    const target = getModeTarget(previewMode);
    const iframe = previewFrameRefs.current[previewMode];
    if (!target || !iframe) {
      return;
    }

    const key = getTargetKey(target);
    const stored = previewScrollMapRef.current[key];
    if (!stored) {
      return;
    }

    const timer = window.setTimeout(() => restorePreviewScrollPosition(iframe, stored), 0);
    return () => window.clearTimeout(timer);
  }, [previewMode, selectedProject, resolvedReference]);

  const attachPreviewPersistence = (mode: PreviewMode) => {
    const target = getModeTarget(mode);
    const iframe = previewFrameRefs.current[mode];
    const contentWindow = iframe?.contentWindow;
    const contentDocument = iframe?.contentDocument;
    if (!iframe || !contentWindow || !contentDocument || !target) {
      previewCleanupRefs.current[mode] = null;
      return;
    }

    const key = getTargetKey(target);
    const stored = previewScrollMapRef.current[key];
    if (stored) {
      restorePreviewScrollPosition(iframe, stored);
    }

    let frameHandle = 0;
    const scheduleSave = () => {
      if (frameHandle) {
        return;
      }
      frameHandle = contentWindow.requestAnimationFrame(() => {
        frameHandle = 0;
        persistPreviewScrollPosition(mode);
      });
    };

    contentWindow.addEventListener("scroll", scheduleSave, { passive: true });
    contentWindow.addEventListener("hashchange", scheduleSave);
    contentDocument.addEventListener("scroll", scheduleSave, true);

    previewCleanupRefs.current[mode] = () => {
      if (frameHandle) {
        contentWindow.cancelAnimationFrame(frameHandle);
      }
      persistPreviewScrollPosition(mode);
      contentWindow.removeEventListener("scroll", scheduleSave);
      contentWindow.removeEventListener("hashchange", scheduleSave);
      contentDocument.removeEventListener("scroll", scheduleSave, true);
    };
  };

  const fitPreviewToWidth = (mode: PreviewMode) => {
    const shell = document.querySelector<HTMLDivElement>(`[data-preview-shell="${mode}"]`);
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

  const referenceProjectOptions = projects.map((project) => project.manifest.slug);
  const referenceFileOptions = resolvedReference.options.html;
  const referenceResourceOptions = resolvedReference.options.resourcesActive;
  const selectedResourceReference = useMemo(() => {
    if (resolvedReference.target.source !== "resource") {
      return null;
    }

    const references = resolvedReference.project?.referenceIndex?.references ?? [];
    const referencesRootPath = resolvedReference.project ? normalizeSlashes(resolvedReference.project.paths.referencesDir) : "";
    const referencesRawRoot = referencesRootPath ? `${referencesRootPath}/raw` : "";
    const referencesExtractedRoot = referencesRootPath ? `${referencesRootPath}/extracted` : "";
    if (resolvedReference.target.resourceRoot === "raw") {
      return (
        references.find(
          (reference) =>
            toReferenceOptionPath(reference.originalPath, referencesRawRoot) === resolvedReference.target.resourcePath
        ) ?? null
      );
    }

    return (
      references.find(
        (reference) =>
          toReferenceOptionPath(reference.extractedTextPath, referencesExtractedRoot) === resolvedReference.target.resourcePath
      ) ?? null
    );
  }, [resolvedReference.project, resolvedReference.target]);

  const selectedResourceExtractedPath = useMemo(() => {
    if (!selectedResourceReference || !resolvedReference.project) {
      return "";
    }

    const referencesRootPath = normalizeSlashes(resolvedReference.project.paths.referencesDir);
    const referencesExtractedRoot = `${referencesRootPath}/extracted`;
    return toReferenceOptionPath(selectedResourceReference.extractedTextPath, referencesExtractedRoot);
  }, [selectedResourceReference, resolvedReference.project]);

  const renderPreviewPane = (mode: PreviewMode) => {
    const devicePreset = DEVICE_PRESETS[layoutPreferences.devices[mode]];
    const zoomScale = layoutPreferences.zooms[mode] / 100;
    const controlsVisible = paneControlsVisible[mode];

    const previewCanvasStyle = {
      "--device-width": devicePreset.width,
      "--zoom-scale": String(zoomScale)
    } as React.CSSProperties;

    const title = mode === "workspace" ? "Workspace" : "Reference";
    const workspaceFileOptions = selectedProject ? selectedProject.htmlFiles.workspace : [];
    const isReferenceResourceMode = mode === "reference" && resolvedReference.target.source === "resource";
    const resourcePreviewUrl =
      isReferenceResourceMode && resolvedReference.target.resourcePath
        ? toReferenceResourcePreviewUrl(
            resolvedReference.target.resourceRoot,
            resolvedReference.target.projectSlug,
            resolvedReference.target.resourcePath,
            referenceRevision
          )
        : "";
    const extractedFallbackPath = isReferenceResourceMode ? selectedResourceExtractedPath : "";
    const isViewingSelectedExtractedText =
      isReferenceResourceMode &&
      resolvedReference.target.resourceRoot === "extracted" &&
      resolvedReference.target.resourcePath === selectedResourceExtractedPath &&
      Boolean(selectedResourceExtractedPath);
    const resourceRenderMode = isReferenceResourceMode
      ? getReferenceResourceRenderMode(resolvedReference.target.resourcePath, resolvedReference.target.resourceRoot)
      : "fallback";
    const shouldUsePdfResourcePreview = isReferenceResourceMode && resourceRenderMode === "inline-pdf";
    const shouldUseResourceFallback = isReferenceResourceMode && resourceRenderMode === "fallback";
    const handleOpenExtractedText = () => {
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
    };

    return (
      <article key={mode} className="preview-pane">
        <div className="preview-pane-header">
          <h3>{title}</h3>

          <div className="pane-header-actions">
            {mode === "reference" && isReferenceResourceMode && selectedResourceExtractedPath ? (
              <button
                type="button"
                className="ghost-button compact pane-utility-button"
                disabled={isViewingSelectedExtractedText}
                onClick={handleOpenExtractedText}
              >
                {isViewingSelectedExtractedText ? "Viewing Text" : "Extracted Text"}
              </button>
            ) : null}

            {layoutPreferences.compareMode ? (
              <button
                type="button"
                className="ghost-button compact pane-match-button"
                onClick={() =>
                  copyPreviewModeScrollPosition(mode === "workspace" ? "reference" : "workspace", mode)
                }
              >
                Match
              </button>
            ) : null}

            <button
              type="button"
              className="ghost-button compact pane-toggle-button"
              onClick={() =>
                setPaneControlsVisible((current) => ({
                  ...current,
                  [mode]: !current[mode]
                }))
              }
            >
              {controlsVisible ? "Hide Controls" : "Show Controls"}
            </button>
          </div>
        </div>

        {mode === "reference" && controlsVisible ? (
          <div className="reference-picker">
            <label className="mini-field">
              <span>Project</span>
              <select
                className="mini-select"
                value={resolvedReference.target.projectSlug}
                onChange={(event) => {
                  persistAllVisibleScrollPositions();
                  setReferenceTarget((current) => ({
                    ...current,
                    projectSlug: event.target.value
                  }));
                }}
              >
                {referenceProjectOptions.map((slug) => (
                  <option key={slug} value={slug}>
                    {slug}
                  </option>
                ))}
              </select>
            </label>

            <label className="mini-field">
              <span>Source</span>
              <select
                className="mini-select"
                value={resolvedReference.target.source}
                onChange={(event) => {
                  persistAllVisibleScrollPositions();
                  const nextSource = event.target.value === "resource" ? "resource" : "html";
                  setReferenceTarget((current) => ({
                    ...current,
                    source: nextSource
                  }));
                }}
              >
                <option value="html">html</option>
                <option value="resource">resource</option>
              </select>
            </label>

            {resolvedReference.target.source === "html" ? (
              <>
                <label className="mini-field">
                  <span>Root</span>
                  <select
                    className="mini-select"
                    value={resolvedReference.target.root}
                    onChange={(event) => {
                      persistAllVisibleScrollPositions();
                      setReferenceTarget((current) => ({
                        ...current,
                        root: event.target.value === "workspace" ? "workspace" : "raw"
                      }));
                    }}
                  >
                    <option value="raw">raw</option>
                    <option value="workspace">workspace</option>
                  </select>
                </label>

                <label className="mini-field mini-field-wide">
                  <span>HTML</span>
                  <select
                    className="mini-select"
                    value={resolvedReference.target.htmlPath}
                    onChange={(event) => {
                      persistAllVisibleScrollPositions();
                      setReferenceTarget((current) => ({
                        ...current,
                        htmlPath: event.target.value
                      }));
                    }}
                  >
                    {referenceFileOptions.length ? (
                      referenceFileOptions.map((file) => (
                        <option key={file} value={file}>
                          {file}
                        </option>
                      ))
                    ) : (
                      <option value={resolvedReference.target.htmlPath}>{resolvedReference.target.htmlPath}</option>
                    )}
                  </select>
                </label>
              </>
            ) : (
              <>
                <label className="mini-field">
                  <span>Ref Root</span>
                  <select
                    className="mini-select"
                    value={resolvedReference.target.resourceRoot}
                    onChange={(event) => {
                      persistAllVisibleScrollPositions();
                      setReferenceTarget((current) => ({
                        ...current,
                        resourceRoot: event.target.value === "extracted" ? "extracted" : "raw"
                      }));
                    }}
                  >
                    <option value="raw">references/raw</option>
                    <option value="extracted">references/extracted</option>
                  </select>
                </label>

                <label className="mini-field mini-field-wide">
                  <span>Resource</span>
                  <select
                    className="mini-select"
                    value={resolvedReference.target.resourcePath}
                    onChange={(event) => {
                      persistAllVisibleScrollPositions();
                      setReferenceTarget((current) => ({
                        ...current,
                        resourcePath: event.target.value
                      }));
                    }}
                  >
                    {referenceResourceOptions.length ? (
                      referenceResourceOptions.map((filePath) => (
                        <option key={filePath} value={filePath}>
                          {filePath}
                        </option>
                      ))
                    ) : (
                      <option value="">No resources indexed</option>
                    )}
                  </select>
                </label>
              </>
            )}
          </div>
        ) : null}

        {mode === "workspace" && controlsVisible ? (
          <div className="reference-picker workspace-picker">
            <label className="mini-field">
              <span>Project</span>
              <select
                className="mini-select"
                value={selectedSlug}
                onChange={(event) => {
                  persistAllVisibleScrollPositions();
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

            <label className="mini-field">
              <span>Root</span>
              <select className="mini-select" value="workspace" disabled>
                <option value="workspace">workspace</option>
              </select>
            </label>

            <label className="mini-field mini-field-wide">
              <span>HTML</span>
              <select
                className="mini-select"
                value={resolvedWorkspaceHtmlPath}
                onChange={(event) =>
                  setWorkspaceHtmlSelections((current) => ({
                    ...current,
                    [selectedSlug]: event.target.value
                  }))
                }
              >
                {workspaceFileOptions.length ? (
                  workspaceFileOptions.map((file) => (
                    <option key={file} value={file}>
                      {file}
                    </option>
                  ))
                ) : (
                  <option value={resolvedWorkspaceHtmlPath}>{resolvedWorkspaceHtmlPath}</option>
                )}
              </select>
            </label>

            <button className="ghost-button compact picker-refresh" type="button" onClick={() => void refreshProjects()}>
              Refresh
            </button>
          </div>
        ) : null}

        {controlsVisible ? (
          <div className="preview-pane-controls">
            <div className="segmented-control compact">
              {deviceModes.map((deviceMode) => (
                <button
                  key={`${mode}:${deviceMode}`}
                  type="button"
                  className={layoutPreferences.devices[mode] === deviceMode ? "segmented-button active" : "segmented-button"}
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
        ) : null}

        <div className="preview-stage">
          {shouldUseResourceFallback ? (
            <div className="preview-canvas-shell" data-preview-shell={mode}>
              <div className={`preview-canvas preview-canvas-${layoutPreferences.devices[mode]}`} style={previewCanvasStyle}>
                <div className="resource-fallback">
                  <h4>Inline preview unavailable</h4>
                  <p>
                    {resolvedReference.target.resourcePath
                      ? `This file type does not render reliably in the embedded frame: ${resolvedReference.target.resourcePath}`
                      : "No indexed resource file is available for this selection."}
                  </p>
                  <div className="resource-fallback-actions">
                    {extractedFallbackPath ? (
                      <button
                        type="button"
                        className="ghost-button compact"
                        onClick={handleOpenExtractedText}
                      >
                        Open Extracted Text
                      </button>
                    ) : null}

                    {resourcePreviewUrl ? (
                      <a className="ghost-button compact linkish" href={resourcePreviewUrl} target="_blank" rel="noreferrer">
                        Open In New Tab
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : shouldUsePdfResourcePreview ? (
            <div className="preview-canvas-shell" data-preview-shell={mode}>
              <div className={`preview-canvas preview-canvas-${layoutPreferences.devices[mode]}`} style={previewCanvasStyle}>
                <object
                  key={`${mode}:${resourcePreviewUrl}`}
                  className="preview-frame"
                  data={resourcePreviewUrl}
                  type="application/pdf"
                  aria-label={`${resolvedReference.target.resourcePath} preview`}
                >
                  <div className="resource-fallback">
                    <h4>Inline PDF preview unavailable</h4>
                    <p>
                      {resolvedReference.target.resourcePath
                        ? `Your browser did not embed this PDF: ${resolvedReference.target.resourcePath}`
                        : "No indexed PDF file is available for this selection."}
                    </p>
                    <div className="resource-fallback-actions">
                      {extractedFallbackPath ? (
                        <button
                          type="button"
                          className="ghost-button compact"
                          onClick={handleOpenExtractedText}
                        >
                          Open Extracted Text
                        </button>
                      ) : null}

                      {resourcePreviewUrl ? (
                        <a className="ghost-button compact linkish" href={resourcePreviewUrl} target="_blank" rel="noreferrer">
                          Open In New Tab
                        </a>
                      ) : null}
                    </div>
                  </div>
                </object>
              </div>
            </div>
          ) : (
            <div className="preview-canvas-shell" data-preview-shell={mode}>
              <div className={`preview-canvas preview-canvas-${layoutPreferences.devices[mode]}`} style={previewCanvasStyle}>
                <iframe
                  key={`${mode}:${previewSources[mode]}`}
                  ref={(node) => {
                    if (!node) {
                      previewCleanupRefs.current[mode]?.();
                      previewCleanupRefs.current[mode] = null;
                    }
                    previewFrameRefs.current[mode] = node;
                  }}
                  className={layoutPreferences.compareMode || previewMode === mode ? "preview-frame" : "preview-frame is-hidden"}
                  src={previewSources[mode]}
                  title={`${mode} preview`}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-modals allow-popups allow-downloads"
                  aria-hidden={!layoutPreferences.compareMode && previewMode !== mode}
                  onLoad={() => attachPreviewPersistence(mode)}
                />
              </div>
            </div>
          )}
        </div>

        {mode === "workspace" ? (
          <div className="workspace-actions-footer">
            <div className="workspace-actions-row">
              <div className="run-controls">
                {STUDIO_COMMANDS.map((command) => {
                  const status = commandStatus[command.id];
                  const buttonClass =
                    status === "success"
                      ? "ghost-button compact run-button success"
                      : status === "error"
                        ? "ghost-button compact run-button error"
                        : status === "running"
                          ? "ghost-button compact run-button running"
                          : "ghost-button compact run-button";

                  return (
                    <button
                      key={command.id}
                      type="button"
                      className={buttonClass}
                      disabled={anyCommandRunning}
                      onClick={() => void runStudioCommand(command.id)}
                    >
                      {status === "running" ? `${command.label}...` : command.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="ghost-button compact workspace-output-toggle"
                onClick={() => setCommandOutputVisible((current) => !current)}
              >
                {commandOutputVisible ? "Hide Output" : "Show Output"}
              </button>
            </div>

            {commandOutputVisible && commandBanner ? (
              <div className={commandBannerIsError ? "status-banner error" : "status-banner"}>
                {commandBanner}
              </div>
            ) : null}

            {commandOutputVisible && commandLog ? <pre className="command-output">{commandLog}</pre> : null}
          </div>
        ) : null}
      </article>
    );
  };

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

  const refreshProjects = async () => {
    const bundles = await fetchProjects();
    setProjects(bundles);
  };

  const anyCommandRunning = useMemo(
    () => Object.values(commandStatus).some((status) => status === "running"),
    [commandStatus]
  );

  const runStudioCommand = async (command: StudioCommandName) => {
    if (!selectedSlug || anyCommandRunning) {
      return;
    }

    setCommandBanner("");
    setCommandBannerIsError(false);
    setCommandStatus((current) => ({
      ...current,
      [command]: "running"
    }));

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(selectedSlug)}/commands/${encodeURIComponent(command)}`,
        { method: "POST" }
      );
      const payload = (await response.json()) as StudioCommandResult | { error: string };
      if (!("ok" in payload)) {
        throw new Error("error" in payload ? payload.error : "Command failed.");
      }

      const logs = [payload.stdout, payload.stderr].filter(Boolean).join("\n\n").trim();
      setCommandLog(logs || "Command completed without output.");
      setCommandStatus((current) => ({
        ...current,
        [command]: payload.ok ? "success" : "error"
      }));

      if (!payload.ok) {
        setCommandBanner(`${command} failed (exit ${payload.exitCode}).`);
        setCommandBannerIsError(true);
        setCommandOutputVisible(true);
        return;
      }

      setCommandBanner(`${command} completed for ${selectedSlug}.`);
      if (command === "analyze" || command === "refs" || command === "export" || command === "package" || command === "html") {
        await refreshProjects();
      }
    } catch (error) {
      setCommandStatus((current) => ({
        ...current,
        [command]: "error"
      }));
      setCommandBanner(error instanceof Error ? error.message : "Command failed.");
      setCommandBannerIsError(true);
      setCommandOutputVisible(true);
    }
  };

  return (
    <div className="shell">
      <main className="main-panel">
        <header className="topbar topbar-compact">
          <div className="project-summary">
            <h2>Studio</h2>
          </div>

          <div className="topbar-actions">
            <div className="segmented-control">
              <button
                type="button"
                className={layoutPreferences.compareMode ? "segmented-button" : "segmented-button active"}
                onClick={() => {
                  persistAllVisibleScrollPositions();
                  setLayoutPreferences((current) => ({ ...current, compareMode: false }));
                }}
              >
                Focus
              </button>
              <button
                type="button"
                className={layoutPreferences.compareMode ? "segmented-button active" : "segmented-button"}
                onClick={() => {
                  persistAllVisibleScrollPositions();
                  setLayoutPreferences((current) => ({ ...current, compareMode: true }));
                }}
              >
                Split
              </button>
            </div>

            {!layoutPreferences.compareMode ? (
              <div className="segmented-control" role="tablist" aria-label="Preview mode">
                <button
                  type="button"
                  className={previewMode === "reference" ? "segmented-button active" : "segmented-button"}
                  onClick={() => {
                    persistAllVisibleScrollPositions();
                    syncFocusModeScrollPosition(previewMode, "reference");
                    setPreviewMode("reference");
                  }}
                >
                  Ref
                </button>
                <button
                  type="button"
                  className={previewMode === "workspace" ? "segmented-button active" : "segmented-button"}
                  onClick={() => {
                    persistAllVisibleScrollPositions();
                    syncFocusModeScrollPosition(previewMode, "workspace");
                    setPreviewMode("workspace");
                  }}
                >
                  Workspace
                </button>
              </div>
            ) : null}

            <button
              type="button"
              className={layoutPreferences.inspectorOpen ? "ghost-button compact" : "ghost-button compact active-toggle"}
              onClick={() => setLayoutPreferences((current) => ({ ...current, inspectorOpen: !current.inspectorOpen }))}
            >
              {layoutPreferences.inspectorOpen ? "Hide Details" : "Details"}
            </button>
          </div>
        </header>

        {errorMessage ? <div className="error-banner">{errorMessage}</div> : null}

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

          {layoutPreferences.inspectorOpen ? (
            <section className="inspector">
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
                  <p className="empty-state">Drop files into references/raw and run `npm run refs`.</p>
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
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
