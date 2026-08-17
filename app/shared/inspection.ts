import type { PreviewGeometry, PreviewInspectPayload, PreviewScrollState, PreviewViewport } from "./preview-bridge.js";
import { STUDIO_PACKET_LIMITS, STUDIO_REVIEW_LIMITS, STUDIO_SCREENSHOT_LIMITS } from "./studio-quality.js";

export const INSPECTION_PACKET_MAX_BYTES = STUDIO_PACKET_LIMITS.inspectionUtf8Bytes;
export const REVIEW_SCREENSHOT_MAX_BYTES = STUDIO_SCREENSHOT_LIMITS.bytes;
export const REVIEW_SCREENSHOT_MAX_DIMENSION = STUDIO_SCREENSHOT_LIMITS.dimension;
export const REVIEW_SCREENSHOT_MAX_PIXELS = STUDIO_SCREENSHOT_LIMITS.pixels;
export const REVIEW_SCREENSHOT_MAX_PER_ITEM = STUDIO_REVIEW_LIMITS.screenshotsPerItem;
export const REVIEW_SCREENSHOT_MAX_FILES_PER_SESSION = STUDIO_REVIEW_LIMITS.screenshotsPerSession;
export const INSPECTION_ISSUE_CATEGORIES = ["content", "layout", "interaction", "accessibility", "unsure"] as const;

export type InspectionIssueCategory = (typeof INSPECTION_ISSUE_CATEGORIES)[number];

export type InspectionResolutionState = "exact" | "bounded" | "unknown";
export type InspectionFreshness = "current" | "unverified" | "stale" | "unsupported";
export type InspectionArtifactRole = "canonical-editable-source" | "generated-workspace-output" | "reference-only" | "unknown";

export type InspectionSelection = {
  nodeId: string | null;
  selectionKind?: "element" | "area";
  visibleText: string;
  tagName: string;
  role: string;
  testId: string;
  geometry: PreviewGeometry;
  viewport: PreviewViewport;
  scroll: PreviewScrollState;
  pageHref: string;
  rendered?: PreviewInspectPayload["rendered"];
};

export type InspectionResolveRequest = {
  projectSlug: string;
  root: "raw" | "workspace";
  htmlPath: string;
  selection: InspectionSelection;
};

/**
 * A deliberately small, server-derived view of the exact source line that
 * created a selected direct-workspace element. It is never supplied by the
 * preview and is intentionally absent for generated or proposal-only work.
 */
export type InspectionSourceExcerpt = {
  startLine: number;
  endLine: number;
  text: string;
  truncated: boolean;
};

export type InspectionResolution = {
  projectSlug: string;
  previewPath: string;
  selection: InspectionSelection;
  resolution: InspectionResolutionState;
  freshness: InspectionFreshness;
  artifactRole: InspectionArtifactRole;
  generated: boolean;
  primaryEditTarget: string | null;
  primaryEditLine: number | null;
  sourceExcerpt?: InspectionSourceExcerpt | null;
  contributors: string[];
  rebuildCommand: string | null;
  validationCommand: string | null;
  warnings: string[];
};
