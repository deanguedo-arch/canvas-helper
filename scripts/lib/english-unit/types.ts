export type EnglishResourceRole =
  | "lesson"
  | "reading"
  | "question-set"
  | "supporting-resource"
  | "media"
  | "excluded-assessment";

export type EnglishReadingKind = "short-fiction" | "visual-narrative" | "paired-perspective";

export type EnglishQuestionPrompt = {
  id: string;
  prompt: string;
  sourcePage?: number;
};

export type EnglishReadingRecipe = {
  id: string;
  title: string;
  author: string;
  kind: EnglishReadingKind;
  group: string;
  readingFile: string;
  questionFile: string;
  questionPages?: number[];
  questionPrompts?: EnglishQuestionPrompt[];
};

export type EnglishPlacement = {
  targetLesson: string;
  readingIds: string[];
  questionRefs: string[];
  purpose: string;
};

export type EnglishAnalysisExample = {
  readingId: string;
  termId?: string;
  term: string;
  evidenceMoment: string;
  analysis: string;
};

export type EnglishAnalysisTerm = {
  id: string;
  category: string;
  label: string;
  definition: string;
};

export type EnglishMediaPolicy = {
  verifiedAt: string;
  allowedYouTubeIds: string[];
  blockedYouTubeIds: string[];
  approvedExternalUrls: string[];
  externalUrlRewrites: Record<string, string>;
};

export type EnglishUnitRecipeV1 = {
  schemaVersion: 1;
  projectSlug: string;
  courseCode: string;
  courseTitle: string;
  unitTitle: string;
  source: {
    brightspaceZip: string;
    teacherResourcesZip: string;
    brightspaceUnitId: string;
    teacherFolder: string;
  };
  lessonOrder: string[];
  topLevelLessonOrder: string[];
  fictionElementsHub: {
    hubLesson: string;
    contextLesson?: string;
    childLessons: string[];
  };
  readings: EnglishReadingRecipe[];
  placements: EnglishPlacement[];
  analysisTerms: EnglishAnalysisTerm[];
  analysisExamples: EnglishAnalysisExample[];
  excludedFiles: Array<{ file: string; reason: string }>;
  wordingCorrections: Array<{ find: string; replace: string; reason: string }>;
  mediaPolicy: EnglishMediaPolicy;
};

export type EnglishBuildReportItem = {
  role: EnglishResourceRole;
  source: string;
  status: "placed" | "excluded" | "missing" | "duplicate" | "corrected" | "failed";
  destination?: string;
  note: string;
};

export type EnglishBuildReport = {
  schemaVersion: 1;
  projectSlug: string;
  generatedAt: string;
  selectedUnit: {
    identifier: string;
    title: string;
    lessonCount: number;
  };
  summary: Record<EnglishBuildReportItem["status"], number>;
  items: EnglishBuildReportItem[];
};

export type EnglishBuiltLesson = {
  id: string;
  title: string;
  sourceHref: string;
  html: string;
  text: string;
  supportingResources: EnglishSupportingResource[];
};

export type EnglishSupportingResource = {
  id: string;
  title: string;
  href: string;
  kind: "local" | "external";
  lessonTitle: string;
};

export type EnglishBuiltReading = EnglishReadingRecipe & {
  readingHref: string;
  questionHref: string;
  questions: EnglishQuestionPrompt[];
  extractionMethod: "native" | "ocr" | "recipe";
};

export type EnglishActivityProfileKind =
  | "short-fiction"
  | "writing-foundations"
  | "modern-drama"
  | "shakespeare-drama"
  | "novel-study"
  | "film-study";

export type EnglishReviewStatus = "draft" | "needs-review" | "ready-for-export" | "blocked";

export type EnglishActivityEvidencePolicy = {
  id: string;
  activityId: string;
  saveMode: "individual" | "collection" | "disabled";
  requiresExplicitSave: true;
  contributionIdTemplate?: string;
  collectionScope?: "activity" | "work" | "locator";
  responseIds?: string[];
  tags?: string[];
};

export type EnglishActivityDefinition = {
  id: string;
  title: string;
  route: string;
  enabled: boolean;
  evidencePolicyIds: string[];
  componentSlot?: EnglishComponentSlot;
};

type EnglishActivityProfileBase = {
  schemaVersion: 1;
  activities: EnglishActivityDefinition[];
  evidencePolicies: EnglishActivityEvidencePolicy[];
};

export type EnglishShortFictionActivityProfile = EnglishActivityProfileBase & {
  kind: "short-fiction";
  readerMode: "text-bank";
  questionCollectionScope: "story";
  analysisExplorer: boolean;
};

export type EnglishWritingFoundationsActivityProfile = EnglishActivityProfileBase & {
  kind: "writing-foundations";
};

export type EnglishModernDramaActivityProfile = EnglishActivityProfileBase & {
  kind: "modern-drama";
  actIds: string[];
  characterIds: string[];
  criticalEssay: boolean;
};

export type EnglishShakespeareDramaActivityProfile = EnglishActivityProfileBase & {
  kind: "shakespeare-drama";
  actIds: string[];
  sceneCount: number;
  sideBySideReader: true;
  characterIds: string[];
  writingTools: Array<
    "language-lab"
    | "close-reading"
    | "theme-builder"
    | "character-change-paragraph"
    | "critical-essay"
    | "graphic-essay"
  >;
  editorialStatus: "needs-editorial" | "reviewed";
};

export type EnglishNovelTrack = {
  id: string;
  title: string;
  author?: string;
};

export type EnglishNovelStudyActivityProfile = EnglishActivityProfileBase & {
  kind: "novel-study";
  novels: EnglishNovelTrack[];
  questionPhases: Array<"opening" | "middle" | "final">;
  genericQuestionCount: number;
  writingTools: Array<"analytical-paragraph" | "motif-string" | "authors-intent" | "critical-essay">;
};

export type EnglishFilmSelection =
  | { mode: "pending" }
  | { mode: "selected"; title: string; year?: number };

export type EnglishFilmStudyActivityProfile = EnglishActivityProfileBase & {
  kind: "film-study";
  filmSelection: EnglishFilmSelection;
  techniqueQuestionCount: number;
  fullResponseQuestionCount: number;
  criticalEssayFieldCount: number;
  viewingGuide: boolean;
};

export type EnglishActivityProfileV1 =
  | EnglishShortFictionActivityProfile
  | EnglishWritingFoundationsActivityProfile
  | EnglishModernDramaActivityProfile
  | EnglishShakespeareDramaActivityProfile
  | EnglishNovelStudyActivityProfile
  | EnglishFilmStudyActivityProfile;

export type EnglishLessonSelectorV2 = {
  itemId: string;
  disposition: "include" | "exclude";
  title?: string;
  includeChildren?: boolean;
  reason?: string;
};

export type EnglishSourcePageRangeV1 = {
  start: number;
  end: number;
};

export type EnglishUnitSourceV2 = EnglishUnitRecipeV1["source"] & {
  archiveRefs?: {
    brightspace: string;
    teacherResources: string;
  };
  lessonSelectors: EnglishLessonSelectorV2[];
};

export type EnglishResourceDispositionV2 = {
  id: string;
  source: string;
  title?: string;
  role: EnglishResourceRole;
  disposition: "place" | "exclude" | "review-required" | "source-only";
  /**
   * One-based inclusive PDF page ranges used for text extraction. Page-scoped
   * resources remain source-only so an untrimmed source PDF cannot become a
   * learner-facing download by mistake.
   */
  sourcePages?: EnglishSourcePageRangeV1[];
  destination?: string;
  targetLessonIds?: string[];
  reason: string;
};

export type EnglishBuiltInComponentSlot =
  | "lesson-after-content"
  | "writing-studio"
  | "analysis-explorer"
  | "reading-notebook"
  | "act-tracker"
  | "film-scene-log"
  | "custom-page";

export type EnglishComponentSlot = EnglishBuiltInComponentSlot | `custom:${string}`;

export type EnglishComponentOverride = {
  id: string;
  slot: EnglishComponentSlot;
  mode: "extend" | "replace";
  source: string;
  assetRoot?: string;
  enabled: boolean;
  order?: number;
};

export type EnglishLessonGroupV2 = {
  id: string;
  title: string;
  lessonIds: string[];
};

export type EnglishUnitAcceptanceV2 = {
  requiredRoutes: string[];
  requiredActivityIds: string[];
  reviewItems: string[];
};

export type EnglishUnitRecipeV2 = {
  schemaVersion: 2;
  projectSlug: string;
  courseCode: string;
  courseTitle: string;
  unitTitle: string;
  profileVersion: string;
  status: EnglishReviewStatus;
  source: EnglishUnitSourceV2;
  activityProfile: EnglishActivityProfileV1;
  lessonOrder: string[];
  topLevelLessonOrder: string[];
  lessonGroups: EnglishLessonGroupV2[];
  fictionElementsHub?: EnglishUnitRecipeV1["fictionElementsHub"];
  readings: EnglishReadingRecipe[];
  placements: EnglishPlacement[];
  analysisTerms: EnglishAnalysisTerm[];
  analysisExamples: EnglishAnalysisExample[];
  resourceDispositions: EnglishResourceDispositionV2[];
  excludedFiles: Array<{ file: string; reason: string }>;
  wordingCorrections: Array<{ find: string; replace: string; reason: string }>;
  mediaPolicy: EnglishMediaPolicy;
  customComponents: EnglishComponentOverride[];
  acceptance: EnglishUnitAcceptanceV2;
};

export type EnglishWritingFormKind =
  | "critical-essay"
  | "literary-exploration"
  | "personal-response"
  | "visual-response";

export type EnglishWritingFormConfigV1 = {
  kind: EnglishWritingFormKind;
  trackMode: "unit" | "per-work";
  profile?: string;
};

/**
 * Recipe V3 keeps the complete V2 unit contract and makes the writing system
 * explicit. The array order is learner-facing navigation order.
 */
export type EnglishUnitRecipeV3 = Omit<EnglishUnitRecipeV2, "schemaVersion"> & {
  schemaVersion: 3;
  derivesFromProject: string;
  writingForms: EnglishWritingFormConfigV1[];
};

export type EnglishUnitRecipe = EnglishUnitRecipeV1 | EnglishUnitRecipeV2 | EnglishUnitRecipeV3;

export type EnglishCourseArchiveV1 = {
  id: string;
  kind: "brightspace" | "teacher-resources" | "audit-reference" | "supplement";
  path: string;
  sha256: string;
  inventoryPath?: string;
  importedAt?: string;
};

export type EnglishCourseUnitV1 = {
  projectSlug: string;
  unitTitle: string;
  recipePath: string;
  profileVersion: string;
  activityProfile: EnglishActivityProfileKind;
  brightspaceUnitIds: string[];
  reviewStatus: EnglishReviewStatus;
};

export type EnglishCourseManifestV1 = {
  schemaVersion: 1;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  profileId: string;
  profileVersion: string;
  archives: EnglishCourseArchiveV1[];
  units: EnglishCourseUnitV1[];
  generatedAt?: string;
};

export type EnglishEvidenceSourceV2 = {
  kind: "lesson" | "reading" | "question-set" | "writing-studio" | "activity" | "media";
  id: string;
  title?: string;
};

export type EnglishEvidenceActivityV2 = {
  id: string;
  profile: EnglishActivityProfileKind;
  title?: string;
};

export type EnglishEvidenceWorkV2 = {
  id: string;
  title: string;
  kind: "text" | "film" | "visual" | "paired-text";
};

export type EnglishEvidenceLocatorV2 = {
  label?: string;
  act?: string;
  scene?: string;
  chapter?: string;
  timestamp?: string;
};

export type EnglishEvidenceEntryV2 = {
  schemaVersion: 2;
  contributionId: string;
  projectSlug: string;
  entryKind: "individual" | "collection";
  source: EnglishEvidenceSourceV2;
  activity: EnglishEvidenceActivityV2;
  work?: EnglishEvidenceWorkV2;
  locator?: EnglishEvidenceLocatorV2;
  prompt?: string;
  answer?: string;
  evidence?: string;
  analysis?: string;
  responseIds?: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
};

export type EnglishEvidenceFilterV2 = {
  contributionId?: string | string[];
  responseId?: string | string[];
  activityId?: string;
  activity?: string;
  profile?: EnglishActivityProfileKind;
  workId?: string;
  text?: string;
  locator?: string;
  tags?: string[];
};

export type EnglishEvidenceBankApiV1 = {
  upsert(entry: EnglishEvidenceEntryV2): EnglishEvidenceEntryV2;
  remove(contributionId: string): boolean;
  list(filters?: EnglishEvidenceFilterV2): EnglishEvidenceEntryV2[];
};

export type EnglishEvidenceBankRouteLinkV1 = {
  id: string;
  label: string;
  icon: string;
};

export type EnglishEvidenceBankRetrofitEvidencePolicyV1 = {
  defaultKind: "individual" | "collection";
  individualActiveValues?: string[];
  disabledActiveValues?: string[];
};

export type EnglishEvidenceBankRetrofitAdapterV1 = {
  id: string;
  kind: "individual" | "collection";
  route: string;
  rootSelector: string;
  saveSelector: string;
  contributionId: string;
  source: EnglishEvidenceSourceV2;
  activity: EnglishEvidenceActivityV2;
  work?: EnglishEvidenceWorkV2;
  locator?: EnglishEvidenceLocatorV2;
  fieldSelectors?: Partial<
    Record<"source" | "concept" | "prompt" | "answer" | "evidence" | "analysis" | "counterpoint", string>
  >;
  questionSelector?: string;
  responseSelector?: string;
  evidencePolicy?: EnglishEvidenceBankRetrofitEvidencePolicyV1;
  tags?: string[];
  saveLabel?: string;
  savedMessage?: string;
  updatedMessage?: string;
};

export type EnglishEvidenceBankSelectorCheckV1 = {
  selector: string;
  adapterId?: string;
  count: number;
  status: "placed" | "failed";
  message?: string;
};

/**
 * Durable manifest and application report for adding the shared Evidence Bank
 * to a completed English workspace without rebuilding its course-specific UI.
 */
export type EnglishEvidenceBankRetrofitV1 = {
  schemaVersion: 1;
  retrofitVersion: string;
  projectSlug: string;
  courseCode: string;
  courseTitle: string;
  profile: EnglishActivityProfileKind;
  storageKey: string;
  route: {
    id: "evidence-bank";
    label: string;
    icon: string;
    links?: EnglishEvidenceBankRouteLinkV1[];
  };
  selectorsRequired: string[];
  adapters: EnglishEvidenceBankRetrofitAdapterV1[];
  sourceSha256: string;
  outputSha256: string;
  appliedAt: string;
  selectorChecks: EnglishEvidenceBankSelectorCheckV1[];
};

export type EnglishUnitBuildSourceV1 = {
  id: string;
  path: string;
  sha256: string;
};

export type EnglishUnitBuildComponentV1 = {
  id: string;
  source: string;
  sha256: string;
};

export type EnglishUnitBuildManifestV1 = {
  schemaVersion: 1;
  projectSlug: string;
  generatedAt: string;
  status: "success" | "needs-review" | "failed";
  profile: {
    id: string;
    version: string;
    sha256: string;
  };
  recipe: {
    path: string;
    sha256: string;
  };
  sources: EnglishUnitBuildSourceV1[];
  components: EnglishUnitBuildComponentV1[];
  ownedFiles: string[];
  reviewItems: string[];
};

export type EnglishContractValidationIssue = {
  code: string;
  path: Array<string | number>;
  message: string;
};
