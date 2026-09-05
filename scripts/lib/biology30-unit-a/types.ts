import type JSZip from "jszip";

import type {
  NamedBrightspaceResource,
  ScienceComparisonContractV1,
  ScienceComparisonVariant
} from "../science-comparison.js";

export type D2lResource = {
  identifier: string;
  href: string;
  type: string;
  materialType?: string;
  resourceCode?: string;
  files: string[];
};

export type D2lItem = {
  identifier: string;
  identifierRef?: string;
  resourceCode?: string;
  resourceTypeKey?: string;
  title: string;
  descriptionHtml: string;
  visible: boolean;
  explicitlyHidden: boolean;
  parentId?: string;
  pathTitles: string[];
  resource?: D2lResource;
  children: D2lItem[];
};

export type PracticeChoice = {
  id: string;
  html: string;
};

export type PracticeQuestion = {
  id: string;
  sourceLabel?: string;
  type: "multiple-choice" | "short-answer" | "long-answer";
  promptHtml: string;
  choices: PracticeChoice[];
  correctValues: string[];
  sourceXmlPath: string;
};

export type PracticeQuiz = {
  id: string;
  title: string;
  sourceItemId: string;
  sourceResourceCode: string;
  sourceXmlPath: string;
  originalSettings: {
    attemptsAllowed?: string;
    timeLimitMinutes?: string;
    gradeItem?: string;
  };
  questions: PracticeQuestion[];
};

export type BiologySourceModel = {
  resource: NamedBrightspaceResource;
  archive: JSZip;
  manifestPath: string;
  manifestIdentifier?: string;
  manifestTitle: string;
  roots: D2lItem[];
  unitRoot: D2lItem;
  items: D2lItem[];
  quizzes: PracticeQuiz[];
  utf16HtmlPaths: string[];
  unreferencedUnitHtmlPaths: string[];
  textByArchivePath: Map<string, string>;
};

export type ContentDisposition = {
  sourceId: string;
  itemId: string;
  title: string;
  pathTitles: string[];
  visibleInSource: boolean;
  disposition:
    | "included"
    | "included-check-your-work"
    | "transformed-practice"
    | "transformed-local-replacement"
    | "excluded-hidden"
    | "excluded-assessment-material"
    | "excluded-teacher-assessment"
    | "excluded-outside-unit"
    | "excluded-duplicate"
    | "excluded-unrelated";
  reason: string;
};

export type ProvenanceRecord = {
  sectionId: string;
  sectionTitle: string;
  sourceId: string;
  sourceLabel: string;
  sourceItemIds: string[];
  sourcePaths: string[][];
  treatment: ScienceComparisonVariant["treatment"];
  use: "sequence" | "explanation" | "investigation" | "practice" | "answer" | "local-reference" | "bridge";
  rationale: string;
};

export type OutcomeMapRecord = {
  stageId: string;
  stageLabel: string;
  sourceSelections: Array<{
    sourceId: string;
    itemIds: string[];
    titles: string[];
    rationale: string;
  }>;
};

export type CopiedAssetRecord = {
  sourceId: string;
  sourceArchivePath: string;
  workspacePath: string;
  bytes: number;
  sha256: string;
  purpose: "image" | "document" | "quiz-image" | "brand" | "other";
};

export type ReplacedAssetRecord = {
  sourceId: string;
  sourceArchivePath: string;
  context: string;
  replacement: string;
};

export type ExternalLinkRecord = {
  url: string;
  sourceId: string;
  context: string;
  requiredForCompletion: false;
  fallback: string;
  checkStatus: "not-checked" | "reachable" | "redirected" | "blocked" | "unreachable" | "invalid";
  httpStatus?: number;
  checkedAt?: string;
  finalUrl?: string;
  error?: string;
};

export type AssetLinkAudit = {
  schemaVersion: 1;
  generatedAt: string;
  copiedAssets: CopiedAssetRecord[];
  replacedMissingSourceAssets: ReplacedAssetRecord[];
  neutralizedLegacyLaunchers: ReplacedAssetRecord[];
  externalLinks: ExternalLinkRecord[];
  unresolvedWorkspaceAssets: string[];
  d2lLaunchersRemaining: string[];
};

export type BiologyBuildContext = {
  repoRoot: string;
  contract: ScienceComparisonContractV1;
  variant: ScienceComparisonVariant;
  sources: Map<string, BiologySourceModel>;
  preparedNotesDeck: PreparedBiologyNotesDeck;
  stageWorkspaceDir: string;
  generatedAt: string;
  checkExternalLinks: boolean;
};

export type BiologyNotesSemanticLeafBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "numbered"; items: string[] }
  | { kind: "callout"; text: string }
  | { kind: "reference"; text: string };

export type BiologyNotesSemanticBlock =
  | BiologyNotesSemanticLeafBlock
  | {
      kind: "columns";
      columns: Array<{ blocks: BiologyNotesSemanticLeafBlock[] }>;
    };

export type BiologyNotesSemanticPage = {
  title: string;
  titleSource: "layout" | "continued" | "fallback";
  blocks: BiologyNotesSemanticBlock[];
  wordCount: number;
  sourceVisualRecommended: boolean;
};

export type PreparedBiologyNotesPage = {
  page: number;
  text: string;
  imageFilePath: string;
  imageExtension: "jpg" | "svg";
  textSource: "native" | "ocr" | "unavailable";
  semantic: BiologyNotesSemanticPage;
};

export type PreparedBiologyNotesDeck = {
  sourceId: string;
  sourceItemId: string;
  sourceItemTitle: string;
  sourceItemPathTitles: string[];
  sourceArchivePath: string;
  sourceSha256: string;
  pageCount: number;
  nativeTextPageCount: number;
  ocrTextPageCount: number;
  verifiedSemanticOverridePages: number[];
  visualMethod: "pdftoppm-jpeg" | "text-svg-fallback";
  pages: PreparedBiologyNotesPage[];
};

export type WorkspaceBiologyNotesPage = Omit<PreparedBiologyNotesPage, "imageFilePath"> & {
  imagePath: string;
};

export type NotesLessonMapping = {
  sourceId: string;
  sourceItemId: string;
  sourceItemTitle: string;
  chapter: 11 | 12 | 13;
  sourceSlideStart: number;
  sourceSlideEnd: number;
  pdfPageStart: number;
  pdfPageEnd: number;
};

export type WorkspaceBiologyNotesDeck = Omit<PreparedBiologyNotesDeck, "pages"> & {
  pdfPath: string;
  pages: WorkspaceBiologyNotesPage[];
  mappings: NotesLessonMapping[];
};

export type NotesContentReport = {
  schemaVersion: 1;
  included: boolean;
  reason: string;
  sourceId?: string;
  sourceArchivePath?: string;
  sourceSha256?: string;
  pageCount?: number;
  embeddedPageAssetCount?: number;
  mappedUniquePageCount?: number;
  semanticPageCount?: number;
  sourceSlideReferenceCount?: number;
  verifiedSemanticOverridePages?: number[];
  nativeTextPageCount?: number;
  ocrTextPageCount?: number;
  visualMethod?: PreparedBiologyNotesDeck["visualMethod"];
  renderingTreatment?: "semantic-html-with-source-slide-reference";
  mappings: NotesLessonMapping[];
};

export type BiologyVariantBuildArtifacts = {
  variant: ScienceComparisonVariant;
  html: string;
  lessonIds: string[];
  responseIds: string[];
  dispositions: ContentDisposition[];
  provenance: ProvenanceRecord[];
  outcomeMap: OutcomeMapRecord[];
  assetAudit: AssetLinkAudit;
  notesContentReport: NotesContentReport;
  sourceMap: unknown;
};
