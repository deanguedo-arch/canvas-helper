export type BiologyOutcomeCategoryV2 = "knowledge" | "sts" | "skills";

export type BiologyOutcomeRecordV2 = {
  id: string;
  officialText: string;
  category: BiologyOutcomeCategoryV2;
  authorityUrl: string;
  teachRoutes: string[];
  practiceRoutes: string[];
  evidenceRoutes: string[];
};

export type BiologySourceUsageV2 = "paraphrase" | "adaptation" | "original-redraw" | "data";

export type BiologySourceRefV2 = {
  id: string;
  sourceId: string;
  itemId?: string;
  sourcePath?: string;
  pdfPages?: number[];
  url?: string;
  role: "core" | "cross-check" | "data" | "optional-enrichment";
  rightsStatus: string;
  usage: BiologySourceUsageV2;
};

export type BiologyLessonRecordV2 = {
  id: string;
  moduleId: string;
  order: number;
  title: string;
  inquiry: string;
  requiredMinutes: number;
  optionalMinutes: number;
  outcomeIds: string[];
  prerequisiteLessonIds: string[];
  sourceRefIds: string[];
  sections: string[];
  figureIds: string[];
  interactionIds: string[];
  practiceIds: string[];
  artifactIds: string[];
  glossaryTerms: string[];
};

export type BiologyInteractionV2 = {
  id: string;
  kind: string;
  lessonId: string;
  responseIds: string[];
  completionRule: string;
  fallbackType: "static-model" | "supplied-data" | "printable";
  datasetId?: string;
};

export type BiologyArtifactV2 = {
  id: string;
  title: string;
  lessonIds: string[];
  outcomeIds: string[];
  fields: Array<{ id: string; label: string; maxLength: number }>;
  rubricId: string;
  printEnabled: true;
  exportSummaryEnabled: true;
};

export type BiologyPracticeItemV2 = {
  id: string;
  outcomeIds: string[];
  cognitiveLevel: "remember-understand" | "apply" | "higher-mental-activity";
  sourceRefIds: string[];
  prompt: string;
  answerKey: unknown;
  rationale: string;
  targetedFeedback: Record<string, string>;
};

export type BiologyProductionSourceV2 = {
  id: string;
  label: string;
  kind: "brightspace-export" | "source-pdf" | "official-curriculum" | "authoritative-supplement";
  role: "primary" | "reference" | "authority" | "supplement";
  path?: string;
  url?: string;
  sha256?: string;
  originalName?: string;
  retrievedAt?: string;
  origins?: Array<{
    kind: "shared-archive-entry" | "supplied-download";
    locator: string;
    sha256: string;
  }>;
  rightsStatus: string;
  allowedUse: string;
};

export type BiologyProductionContractV1 = {
  schemaVersion: 1;
  profileId: "biology30-unit-a-production-v1";
  family: "biology30-unit-a-pilot";
  project: {
    slug: "biology30-unit-a";
    title: "Biology 30 — Unit A: Nervous and Endocrine Systems";
    courseCode: "BIO 30";
    version: "production-candidate-v2";
  };
  status: {
    authoringStatus: "blocked";
    driverId: "proposal-only-v1";
    reviewGate: "gate-0-awaiting-approval";
    studioEditingEnabled: false;
    exportEnabled: false;
  };
  curriculum: {
    unitTitle: "Unit A: Nervous and Endocrine Systems";
    unitCourseTimePercent: 25;
    diplomaEmphasisPercent: { minimum: 20; maximum: 25 };
    programOfStudiesUrl: string;
    performanceStandardsUrl: string;
    currentBiologyBulletinUrl: string;
    currentBiologyBulletinSchoolYear: "2025-26";
    diplomaGeneralBulletinUrl: string;
    diplomaGeneralBulletinSchoolYear: "2026-27";
    biologyBulletin2026_27Found: false;
    refreshRequiredBeforeGate1: true;
  };
  delivery: {
    mode: "independent-first-asynchronous";
    requiredMinutes: 1505;
    optionalMinutes: 295;
    requiredInternet: false;
    requiredTeacherPresence: false;
    requiredPeerAvailability: false;
  };
  assessment: {
    boundary: "formative-practice-and-submission-ready-artifacts";
    secureSummativeLocation: "brightspace";
    minimumPracticeItems: 100;
    artifactCount: 7;
  };
  visualProfile: {
    id: "next-step-scientific-editorial-v1";
    remoteAssetsAllowedForCompletion: false;
    sourceSlidesAllowedAsLessons: false;
  };
  learnerRoutes: string[];
  sources: BiologyProductionSourceV2[];
  sourceRefs: BiologySourceRefV2[];
  outcomes: BiologyOutcomeRecordV2[];
  lessons: BiologyLessonRecordV2[];
  artifacts: BiologyArtifactV2[];
  interactions: BiologyInteractionV2[];
  practiceBlueprint: {
    lessonChecks: 51;
    moduleChecks: 25;
    finalPractice: 24;
    total: 100;
    cognitiveDistribution: {
      rememberUnderstandPercent: { minimum: 25; maximum: 35 };
      applyPercent: { minimum: 45; maximum: 55 };
      higherMentalActivityPercent: { minimum: 15; maximum: 25 };
    };
  };
  reviewGates: Array<{
    id: string;
    label: string;
    requiresHumanApproval: boolean;
    status: "ready" | "pending" | "blocked";
  }>;
  promotionPolicy: {
    automaticPromotion: false;
    minimumScore: 95;
    minimumCategoryPercent: 80;
    freezeComparisonPilotsOnPromotion: true;
    comparisonPilotsBecome: "reference-only";
    winnerDriver: "direct-workspace-v1";
    exportFormat: "scorm-2004";
  };
  generatedAt: string;
};

export type BiologySourceCatalogItemV1 = {
  sourceId: string;
  itemId: string;
  parentId?: string;
  title: string;
  pathTitles: string[];
  visible: boolean;
  explicitlyHidden: boolean;
  descriptionPresent: boolean;
  resource?: {
    identifier: string;
    href: string;
    type: string;
    materialType?: string;
    resourceCode?: string;
  };
  disposition: string;
  dispositionReason: string;
};

export type BiologySourceCatalogV1 = {
  schemaVersion: 1;
  family: "biology30-unit-a-pilot";
  generatedAt: string;
  sources: Array<{
    id: string;
    label: string;
    role: string;
    path: string;
    sha256: string;
    originalName: string;
    manifestIdentifier?: string;
    manifestTitle: string;
    unitRootId: string;
    unitRootTitle: string;
    itemCount: number;
    visibleQuizCount: number;
    visibleQuizQuestionCount: number;
    utf16HtmlCount: number;
  }>;
  items: BiologySourceCatalogItemV1[];
  visibleQuizzes: Array<{
    sourceId: string;
    id: string;
    title: string;
    sourceItemId: string;
    sourceXmlPath: string;
    questionCount: number;
  }>;
  contentDispositions: Array<{
    sourceId: string;
    itemId: string;
    title: string;
    pathTitles: string[];
    visibleInSource: boolean;
    disposition: string;
    reason: string;
  }>;
};

export type BiologyPdfPageDispositionV1 = {
  page: number;
  status: "used" | "corrected" | "excluded-redundant" | "reference-only";
  lessonIds: string[];
  reason: string;
};

export type BiologyCorrectionRecordV1 = {
  id: string;
  sourcePages: number[];
  severity: "blocker" | "major" | "editorial";
  sourceProblem: string;
  requiredTreatment: string;
  verification: string;
};

export type BiologyPilotTreeHashV1 = {
  slug: string;
  sha256: string;
  fileCount: number;
  byteCount: number;
};

export type BiologyGate0ReviewV1 = {
  schemaVersion: 1;
  gateId: "gate-0";
  projectSlug: "biology30-unit-a";
  contractSha256: string;
  status: "awaiting-user" | "approved";
  decision: null | {
    approved: true;
    approvedAt: string;
    approvedBy: "user";
    approvedContractSha256: string;
    authorization: "gate-1-only";
  };
  generatedAt: string;
  approvalRequirements: string[];
};
