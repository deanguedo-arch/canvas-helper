export type ConversionStatus = "converted" | "placeholder" | "unresolved";

export type BlockType =
  | "heading"
  | "paragraph"
  | "list"
  | "table"
  | "callout"
  | "warning"
  | "referenceNote"
  | "cardGrid"
  | "figure"
  | "rawHtml";

export type SourceTrace = {
  sourceType: "pdf" | "legacy-html";
  sourceTitle: string;
  sourcePageStart: number | null;
  sourcePageEnd: number | null;
  sourceBlockId: string | null;
  conversionStatus: ConversionStatus;
  notes: string[];
};

export type CourseCard = {
  id: string;
  variant: "info" | "anatomy" | "warning" | "generic";
  title: string;
  body: string;
};

export type CourseBlock = {
  id: string;
  type: BlockType;
  title?: string;
  level?: number;
  text?: string;
  ordered?: boolean;
  items?: string[];
  headers?: string[];
  rows?: string[][];
  cards?: CourseCard[];
  html?: string;
  figureLabel?: string;
  figureDescription?: string;
  figureStatus?: "available" | "pending";
  figureSourceUrl?: string;
  source: SourceTrace;
};

export type CourseSection = {
  id: string;
  tabLabel: string;
  title: string;
  blocks: CourseBlock[];
};

export type CourseModel = {
  courseId: string;
  slug: string;
  title: string;
  generatedAt: string;
  sourceTitle: string;
  sourcePdfUrl: string | null;
  sections: CourseSection[];
};

export type AssessmentInputOption = {
  value: string;
  label: string;
};

export type AssessmentInput = {
  id: string;
  key: string;
  kind: "select" | "checkbox";
  label: string;
  options: AssessmentInputOption[];
  correctValue: string | null;
};

export type AssessmentQuestion = {
  id: string;
  title: string;
  prompt: string | null;
  html?: string;
  inputs: AssessmentInput[];
  source: SourceTrace;
};

export type AssessmentSection = {
  id: string;
  title: string;
  totalMarks: number | null;
  questions: AssessmentQuestion[];
};

export type AssessmentModel = {
  courseId: string;
  slug: string;
  title: string;
  generatedAt: string;
  sections: AssessmentSection[];
};

export type SourceChunk = {
  id: string;
  index: number;
  page: number | null;
  text: string;
};

export type SectionSourceMapping = {
  sectionId: string;
  matchedChunkIds: string[];
  matchedPages: number[];
  cueTerms: string[];
};

export type BlockSourceMapping = {
  blockId: string;
  sectionId: string;
  mappedChunkIds: string[];
  mappedPages: number[];
  conversionStatus: ConversionStatus;
};

export type SourceMapModel = {
  courseId: string;
  slug: string;
  generatedAt: string;
  sourceReferenceId: string | null;
  sourceChunkCount: number;
  sectionMappings: SectionSourceMapping[];
  blockMappings: BlockSourceMapping[];
  unresolvedChunkIds: string[];
};

export type CoverageSectionReport = {
  sectionId: string;
  title: string;
  mappedPageCount: number;
  mappedPages: number[];
  convertedBlocks: number;
  placeholderBlocks: number;
  unresolvedBlocks: number;
};

export type CoverageReport = {
  courseId: string;
  slug: string;
  generatedAt: string;
  sourcePagesTotal: number;
  sourcePagesCovered: number;
  sourcePagesUncovered: number[];
  sourceBlocksTotal: number;
  convertedBlocks: number;
  placeholderBlocks: number;
  unresolvedBlocks: number;
  unresolvedChunkIds: string[];
  pendingFigures: Array<{
    blockId: string;
    sectionId: string;
    label: string;
    description: string;
    sourcePageStart: number | null;
    sourcePageEnd: number | null;
  }>;
  sections: CoverageSectionReport[];
};
