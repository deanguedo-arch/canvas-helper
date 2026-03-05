export type InputKind = "html" | "text-html";
export type PreviewMode = "raw" | "workspace";
export type BrightspaceTarget = "course-page";
export type SourceKind = "function" | "dom" | "heuristic";
export type ReferenceKind =
  | "txt"
  | "md"
  | "html"
  | "pdf"
  | "docx"
  | "image"
  | "other";
export type ReferenceExtractionStatus = "indexed" | "stored-only" | "failed";

export type ProjectManifest = {
  id: string;
  slug: string;
  sourcePath: string;
  inputKind: InputKind;
  brightspaceTarget: BrightspaceTarget;
  previewModes: Array<PreviewMode>;
  workspaceEntrypoint: string;
  rawEntrypoint: string;
  createdAt: string;
  updatedAt: string;
};

export type SectionManifest = {
  id: string;
  label: string;
  file: string;
  selector?: string;
  headingText?: string;
  sourceKind: SourceKind;
  editable: boolean;
};

export type ReferenceManifest = {
  id: string;
  originalPath: string;
  kind: ReferenceKind;
  extractionStatus: ReferenceExtractionStatus;
  extractedTextPath?: string;
};

export type SectionMap = {
  projectId: string;
  generatedAt: string;
  sections: SectionManifest[];
};

export type ReferenceIndex = {
  projectId: string;
  generatedAt: string;
  references: ReferenceManifest[];
};

export type ImportLog = {
  generatedAt: string;
  sourcePath: string;
  actions: string[];
  warnings: string[];
};

export type ProjectPaths = {
  root: string;
  rawDir: string;
  rawEntrypoint: string;
  rawSourceText: string;
  rawAssetsDir: string;
  workspaceDir: string;
  workspaceEntrypoint: string;
  workspaceAssetsDir: string;
  workspaceComponentsDir: string;
  workspaceSectionsDir: string;
  referencesDir: string;
  referencesRawDir: string;
  referencesExtractedDir: string;
  metaDir: string;
  manifestPath: string;
  sectionMapPath: string;
  styleGuidePath: string;
  contentOutlinePath: string;
  referenceIndexPath: string;
  importLogPath: string;
  sessionLogPath: string;
  exportsDir: string;
  brightspaceExportDir: string;
};

export type StudioProjectBundle = {
  manifest: ProjectManifest;
  sectionMap: SectionMap | null;
  referenceIndex: ReferenceIndex | null;
  htmlFiles: {
    raw: string[];
    workspace: string[];
  };
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
