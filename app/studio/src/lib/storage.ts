import {
  type PreviewLayoutPreferences,
  type PreviewScrollMap,
  type ReferenceTarget,
  type StudioSelection,
  DEFAULT_LAYOUT_PREFERENCES,
  deviceModes,
  normalizeZoom
} from "./types";

const STUDIO_SELECTION_STORAGE_KEY = "canvas-helper/studio-selection";
const STUDIO_LAYOUT_STORAGE_KEY = "canvas-helper/studio-layout";
const STUDIO_REFERENCE_STORAGE_KEY = "canvas-helper/studio-reference";
const PREVIEW_SCROLL_STORAGE_KEY = "canvas-helper/preview-scroll";
const STUDIO_COMMAND_OUTPUT_VISIBLE_KEY = "canvas-helper/studio-command-output-visible";

export function loadStudioSelection(): StudioSelection {
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

export function saveStudioSelection(selectedSlug: string, previewMode: StudioSelection["previewMode"]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STUDIO_SELECTION_STORAGE_KEY,
    JSON.stringify({ selectedSlug, previewMode })
  );
}

export function loadPreviewLayoutPreferences(): PreviewLayoutPreferences {
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
        reference: deviceModes.includes(parsed.devices?.reference ?? "desktop")
          ? parsed.devices?.reference ?? DEFAULT_LAYOUT_PREFERENCES.devices.reference
          : DEFAULT_LAYOUT_PREFERENCES.devices.reference,
        workspace: deviceModes.includes(parsed.devices?.workspace ?? "desktop")
          ? parsed.devices?.workspace ?? DEFAULT_LAYOUT_PREFERENCES.devices.workspace
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

export function savePreviewLayoutPreferences(preferences: PreviewLayoutPreferences) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STUDIO_LAYOUT_STORAGE_KEY, JSON.stringify(preferences));
}

export function loadReferenceTarget(): ReferenceTarget {
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
    const root = parsed.root === "workspace" ? "workspace" : "raw";
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

export function saveReferenceTarget(target: ReferenceTarget) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STUDIO_REFERENCE_STORAGE_KEY, JSON.stringify(target));
}

export function loadCommandOutputVisible() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(STUDIO_COMMAND_OUTPUT_VISIBLE_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveCommandOutputVisible(value: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STUDIO_COMMAND_OUTPUT_VISIBLE_KEY, value ? "1" : "0");
}

export function loadPreviewScrollMap(): PreviewScrollMap {
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

export function savePreviewScrollMap(scrollMap: PreviewScrollMap) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PREVIEW_SCROLL_STORAGE_KEY, JSON.stringify(scrollMap));
}
