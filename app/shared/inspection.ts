import type { PreviewGeometry } from "./preview-bridge.js";

export const INSPECTION_PACKET_MAX_BYTES = 5_120;
export const INSPECTION_ISSUE_CATEGORIES = ["content", "layout", "interaction", "accessibility", "unsure"] as const;

export type InspectionIssueCategory = (typeof INSPECTION_ISSUE_CATEGORIES)[number];

export type InspectionResolutionState = "exact" | "bounded" | "unknown";
export type InspectionFreshness = "current" | "unverified" | "stale" | "unsupported";
export type InspectionArtifactRole = "canonical-editable-source" | "generated-workspace-output" | "reference-only" | "unknown";

export type InspectionSelection = {
  nodeId: string | null;
  visibleText: string;
  tagName: string;
  role: string;
  testId: string;
  geometry: PreviewGeometry;
};

export type InspectionResolveRequest = {
  projectSlug: string;
  root: "raw" | "workspace";
  htmlPath: string;
  selection: InspectionSelection;
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
  contributors: string[];
  rebuildCommand: string | null;
  validationCommand: string | null;
  warnings: string[];
};
