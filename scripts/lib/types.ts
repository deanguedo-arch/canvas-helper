export type InputKind = "html" | "text-html";
export type PreviewMode = "raw" | "workspace";
export type BrightspaceTarget = "course-page";
export type SourceKind = "function" | "dom" | "heuristic";
export type LearningSource = "gemini" | "other";
export type LearningTrust = "curated" | "auto";
export type MemoryKind = "style" | "component" | "tool" | "resource" | "decision";
export type MemoryConfidence = "low" | "medium" | "high";
export type LearnerMode = "off" | "collect" | "apply";
export type LearnerModeSource = "repo-default" | "project-override" | "env-override" | "cli-override" | "default";
export type AuthoringPreferenceScope = "repo" | "project";
export type AuthoringSourceSupportMode = "hidden-by-default" | "optional" | "visible";
export type AuthoringRuleSeverity = "error" | "warn";
export type MemoryOriginCommand = "import" | "analyze" | "refs" | "export" | "plan";
export type MemoryOriginSource = "pattern" | "workspace" | "reference" | "design-doc" | "export";
export type IntelligenceMode = LearnerMode;
export type ReferenceKind =
  | "txt"
  | "md"
  | "html"
  | "pdf"
  | "docx"
  | "image"
  | "other";
export type ReferenceExtractionStatus = "indexed" | "stored-only" | "failed";
export type ReferenceExtractionMethod = "native" | "ocr";
export type ResourceCategory = "outline" | "assessment" | "textbook" | "teacher-note" | "other";
export type ResourceAuthorityRole =
  | "assessment-authoritative"
  | "blueprint-authoritative"
  | "context-authoritative"
  | "supporting-only"
  | "fallback-only";
export type ReferenceLocatorKind = "page" | "section";

export type ReferenceChunkLocator = {
  kind: ReferenceLocatorKind;
  label: string;
  page?: number;
  startPage?: number;
  endPage?: number;
  sectionHeading?: string;
};

export type ReferenceChunk = {
  id: string;
  index: number;
  locator: ReferenceChunkLocator;
  text: string;
  titleGuess?: string;
  keywordHints: string[];
};

export type ReferenceChunkManifest = {
  projectId: string;
  referenceId: string;
  generatedAt: string;
  chunks: ReferenceChunk[];
};

export type ProjectManifest = {
  id: string;
  slug: string;
  sourcePath: string;
  inputKind: InputKind;
  brightspaceTarget: BrightspaceTarget;
  previewModes: Array<PreviewMode>;
  workspaceEntrypoint: string;
  rawEntrypoint: string;
  learningSource: LearningSource;
  learningTrust: LearningTrust;
  learningUpdatedAt: string;
  learnerMode?: LearnerMode;
  workspaceApprovedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type IntelligencePolicyFlags = {
  collectPatternBank: boolean;
  collectMemoryLedger: boolean;
  applyPatternBankToPromptPack: boolean;
  applyMemoryLedgerToPromptPack: boolean;
  applyMemoryLedgerToRecommendations: boolean;
};

export type IntelligencePolicy = IntelligencePolicyFlags & {
  mode: IntelligenceMode;
  source: LearnerModeSource;
};

export type IntelligencePolicyOverride = Partial<IntelligencePolicyFlags> & {
  mode?: IntelligenceMode;
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
  relativePath?: string;
  kind: ReferenceKind;
  extractionStatus: ReferenceExtractionStatus;
  extractionMethod?: ReferenceExtractionMethod;
  extractedTextPath?: string;
  extractionIssue?: string;
  chunkManifestPath?: string;
  chunkCount?: number;
  pageCount?: number;
  sectionLabels?: string[];
  titleGuess?: string;
  resourceCategory?: ResourceCategory;
  authorityRole?: ResourceAuthorityRole;
  blueprintSignals?: string[];
  assessmentSignals?: string[];
  supportSignals?: string[];
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

export type ResourceCatalogEntry = ReferenceManifest & {
  relativePath: string;
  resourceCategory: ResourceCategory;
  authorityRole: ResourceAuthorityRole;
  titleGuess: string;
  chunkCount: number;
  blueprintSignals: string[];
  assessmentSignals: string[];
  supportSignals: string[];
};

export type ResourceCatalog = {
  projectId: string;
  generatedAt: string;
  resources: ResourceCatalogEntry[];
  warnings: string[];
};

export type CourseBlueprintOutcome = {
  id: string;
  unitId: string;
  title: string;
  description: string;
  sourceResourceIds: string[];
  linkedAssessmentIds: string[];
  mustKnow: string[];
  niceToKnow: string[];
  assessedSkills: string[];
  supportingKnowledge: string[];
  requiredConcepts: string[];
  requiredSkills: string[];
  prerequisiteOutcomeIds: string[];
  likelyMisconceptions: string[];
  mandatoryVocabulary: string[];
};

export type CourseBlueprintUnit = {
  id: string;
  title: string;
  sequence: number;
  scopeSourceResourceIds: string[];
  linkedAssessmentIds: string[];
  prerequisiteUnitIds: string[];
  mustKnow: string[];
  niceToKnow: string[];
  assessedSkills: string[];
  supportingKnowledge: string[];
  requiredConcepts: string[];
  requiredSkills: string[];
  likelyMisconceptions: string[];
  mandatoryVocabulary: string[];
  outcomeIds: string[];
};

export type CourseBlueprint = {
  projectId: string;
  generatedAt: string;
  authoritySummary: {
    outlineResourceIds: string[];
    assessmentResourceIds: string[];
    supportingResourceIds: string[];
  };
  units: CourseBlueprintUnit[];
  outcomes: CourseBlueprintOutcome[];
  warnings: string[];
};

export type AssessmentMapEntry = {
  id: string;
  resourceId: string;
  name: string;
  taskType: string;
  deliverable: string;
  rubricLanguage: string[];
  successCriteria: string[];
  skillVerbs: string[];
  commonFailurePoints: string[];
  prerequisiteConcepts: string[];
  prerequisiteVocabulary: string[];
  relatedUnitIds: string[];
  relatedOutcomeIds: string[];
  sourceLocators: ReferenceChunkLocator[];
};

export type AssessmentMap = {
  projectId: string;
  generatedAt: string;
  assessments: AssessmentMapEntry[];
  warnings: string[];
};

export type LessonPacketReference = {
  resourceId: string;
  resourceTitle: string;
  resourceCategory: ResourceCategory;
  authorityRole: ResourceAuthorityRole;
  locators: ReferenceChunkLocator[];
  pageRanges: Array<{
    startPage: number;
    endPage: number;
  }>;
  whySelected: string;
  exampleSnippet?: string;
};

export type LessonPacket = {
  lessonId: string;
  lessonTitle: string;
  unitId: string;
  targetOutcomes: Array<{
    id: string;
    title: string;
  }>;
  linkedAssessmentIds: string[];
  prerequisiteKnowledge: string[];
  requiredVocabulary: string[];
  coreConcepts: string[];
  misconceptions: string[];
  sourceReferences: LessonPacketReference[];
  whatThisLessonMustPrepareStudentsToDo: string[];
  checksForUnderstanding: string[];
  guidedPracticeIdeas: string[];
  independentPracticeIdeas: string[];
  evidenceOfReadinessForAssessment: string[];
  examplesOrCases: string[];
  warnings: string[];
};

export type LessonPacketIndexEntry = {
  lessonId: string;
  lessonTitle: string;
  unitId: string;
  targetOutcomeIds: string[];
  linkedAssessmentIds: string[];
  packetPath: string;
};

export type LessonPacketIndex = {
  projectId: string;
  generatedAt: string;
  lessonPackets: LessonPacketIndexEntry[];
  warnings: string[];
};

export type ImportLog = {
  generatedAt: string;
  sourcePath: string;
  actions: string[];
  warnings: string[];
};

export type MemorySignals = {
  sectionLabels: string[];
  keywords: string[];
  styleTokens: string[];
  hexColors: string[];
  externalDependencies: string[];
  referenceKinds: string[];
};

export type MemoryLedgerOrigin = {
  id: string;
  projectSlug?: string;
  source: MemoryOriginSource;
  command: MemoryOriginCommand;
  observedAt: string;
};

export type MemoryLedgerEntry = {
  kind: MemoryKind;
  key: string;
  summary: string;
  signals: MemorySignals;
  origins: MemoryLedgerOrigin[];
  projectSlugs: string[];
  reinforcementCount: number;
  lastSeenAt: string;
  confidence: MemoryConfidence;
  approved: boolean;
};

export type MemoryLedger = {
  schemaVersion: 1;
  generatedAt: string;
  entries: MemoryLedgerEntry[];
};

export type AuthoringPreferenceRule = {
  id: string;
  description: string;
  pattern: string;
  severity?: AuthoringRuleSeverity;
};

export type AuthoringAcceptedRule = {
  ruleId: string;
  reason: string;
  updatedAt: string;
  scope: AuthoringPreferenceScope;
};

export type AuthoringPreferences = {
  schemaVersion: 1;
  flow: {
    sourceSupportMode?: AuthoringSourceSupportMode;
    preferredBenchmarkId?: string;
  };
  rules?: {
    require?: AuthoringPreferenceRule[];
    forbid?: AuthoringPreferenceRule[];
    accepted?: AuthoringAcceptedRule[];
  };
  quality: {
    maxConsecutiveParagraphBlocks?: number;
  };
  learning: {
    defaultScope: AuthoringPreferenceScope;
  };
};

export type AuthoringPreferencesOverride = Partial<{
  flow: Partial<AuthoringPreferences["flow"]>;
  rules: Partial<AuthoringPreferences["rules"]>;
  quality: Partial<NonNullable<AuthoringPreferences["quality"]>>;
  learning: Partial<AuthoringPreferences["learning"]>;
}>;

export type AuthoringPreferenceSource = "repo" | "benchmark" | "project" | "cli";

export type ResolvedAuthoringPreferences = {
  preferences: AuthoringPreferences;
  sourceOrder: AuthoringPreferenceSource[];
};

export type AuthoringSurfaceKind = "course-html" | "workspace-runtime" | "export";

export type AuthoringSurfaceInput = {
  kind: AuthoringSurfaceKind;
  filePath: string;
  content?: string;
};

export type AuthoringDeviation = {
  ruleId: string;
  severity: AuthoringRuleSeverity;
  surface: AuthoringSurfaceKind;
  location: string;
  why: string;
  evidence: string;
};

export type AuthoringDeviationAcceptance = {
  acceptDeviations: string[] | "all";
  because?: string;
  updatePreferences?: boolean;
  preferenceScope?: AuthoringPreferenceScope;
};

export type AuthoringDeviationReport = {
  schemaVersion: 1;
  projectSlug: string;
  generatedAt: string;
  pass: boolean;
  deviations: AuthoringDeviation[];
  acceptedDeviations: AuthoringDeviation[];
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
  resourceDir: string;
  resourceExtractedDir: string;
  referencesDir: string;
  referencesRawDir: string;
  referencesExtractedDir: string;
  metaDir: string;
  manifestPath: string;
  sectionMapPath: string;
  styleGuidePath: string;
  contentOutlinePath: string;
  referenceIndexPath: string;
  resourceCatalogPath: string;
  courseBlueprintPath: string;
  assessmentMapPath: string;
  lessonPacketsDir: string;
  lessonPacketsIndexPath: string;
  benchmarkSelectionPath: string;
  importLogPath: string;
  sessionLogPath: string;
  intelligencePolicyPath: string;
  authoringPreferencesPath: string;
  deviationReportJsonPath: string;
  deviationReportMarkdownPath: string;
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
    resourceDir: string;
    resourceExtractedDir: string;
    referencesDir: string;
    sessionLogPath: string;
  };
  styleGuide: string;
  importLog: string;
  effectiveLearnerMode: LearnerMode;
  effectiveLearnerModeSource: LearnerModeSource;
  revisions: {
    raw: number;
    workspace: number;
  };
};
