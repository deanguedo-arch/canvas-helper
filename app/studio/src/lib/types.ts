export const previewModes = ["reference", "workspace"] as const;
export const deviceModes = ["desktop", "tablet", "mobile"] as const;

export type PreviewMode = (typeof previewModes)[number];
export type DeviceMode = (typeof deviceModes)[number];
export type PreviewRoot = "raw" | "workspace";

export type StudioSelection = {
  selectedSlug: string;
  previewMode: PreviewMode;
};

export type PreviewLayoutPreferences = {
  compareMode: boolean;
  sidebarOpen: boolean;
  inspectorOpen: boolean;
  devices: Record<PreviewMode, DeviceMode>;
  zooms: Record<PreviewMode, number>;
};

export type PreviewScrollPosition = {
  windowTop: number;
  windowLeft: number;
  containers: Array<{
    selector: string;
    top: number;
    left: number;
  }>;
};

export type PreviewScrollMap = Record<string, PreviewScrollPosition>;
export type ScrollSelectorCache = Record<string, string[]>;

export type ReferenceTarget = {
  projectSlug: string;
  source: "html" | "resource";
  root: PreviewRoot;
  htmlPath: string;
  resourceRoot: "raw" | "extracted";
  resourcePath: string;
};

export type StudioCommandName = "analyze" | "refs" | "verify" | "export" | "package" | "html";
export type StudioCommandStatus = "idle" | "running" | "success" | "error";

export type StudioCommandResult = {
  ok: boolean;
  command: StudioCommandName;
  slug: string;
  exitCode: number;
  startedAt: string;
  finishedAt: string;
  stdout: string;
  stderr: string;
};

export type IncomingRefreshSummary = {
  startedAt: string;
  finishedAt: string;
  mode: "all" | "projects" | "references";
  importedProjects: Array<{
    sourceKey: string;
    requestedSlug: string;
    slug: string;
    archivedTo: string;
    warnings: string[];
  }>;
  skippedProjects: Array<{
    sourceKey: string;
    requestedSlug: string;
    reason: string;
  }>;
  syncedReferences: Array<{
    sourcePath: string;
    slug: string;
    targetPath: string;
    archivedTo?: string;
  }>;
  failures: Array<{
    kind: "project" | "reference";
    inputPath: string;
    message: string;
    archivedTo?: string;
  }>;
  archivedPaths: string[];
};

export type SectionManifest = {
  id: string;
  label: string;
  file: string;
  headingText?: string;
  sourceKind: "function" | "dom" | "heuristic";
  editable: boolean;
};

export type ReferenceManifest = {
  id: string;
  originalPath: string;
  kind: string;
  extractionStatus: string;
  extractedTextPath?: string;
};

export type LearnerMode = "off" | "collect" | "apply";
export type LearnerModeSource = "repo-default" | "project-override" | "env-override" | "cli-override" | "default";

export type ProjectBundle = {
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
    resourceDir: string;
    resourceExtractedDir: string;
    referencesDir: string;
    sessionLogPath: string;
  };
  styleGuide: string;
  importLog: string;
  effectiveLearnerMode: LearnerMode;
  effectiveLearnerModeSource: LearnerModeSource;
  revisions: { raw: number; workspace: number };
};

export type ResolvedReference = {
  project: ProjectBundle | null;
  target: ReferenceTarget;
  options: {
    html: string[];
    resourcesRaw: string[];
    resourcesExtracted: string[];
    resourcesActive: string[];
  };
};

export type CaptureResult = {
  position: PreviewScrollPosition;
  selectors: string[];
};

export const STUDIO_COMMANDS: Array<{ id: StudioCommandName; label: string }> = [
  { id: "analyze", label: "Analyze" },
  { id: "refs", label: "Refs" },
  { id: "verify", label: "Verify" },
  { id: "export", label: "Export Dir" },
  { id: "package", label: "Package" },
  { id: "html", label: "HTML" }
];

export const DEVICE_PRESETS: Record<DeviceMode, { label: string; width: string }> = {
  desktop: { label: "Desktop", width: "100%" },
  tablet: { label: "Tablet", width: "820px" },
  mobile: { label: "Mobile", width: "430px" }
};

export const DEFAULT_LAYOUT_PREFERENCES: PreviewLayoutPreferences = {
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

export function normalizeZoom(zoom: number) {
  return Math.min(140, Math.max(60, Math.round(zoom / 5) * 5));
}
