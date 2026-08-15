import type { CourseEditAdapter } from "./course-editing.js";

export const COURSE_EDITABILITY_INVENTORY_SCHEMA_VERSION = 1;
export const COURSE_EDITABILITY_CANDIDATE_SCHEMA_VERSION = 1;
export const COURSE_EDITABILITY_REASON_REGISTRY_VERSION = 1;
export const COURSE_EDITABILITY_ISOLATION_PROFILE_VERSION = 1;
export const STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION = 1;
export const STUDIO_ROUTINE_CONTENT_PROFILE_ID = "studio-routine-content-v1";

export const STUDIO_ROUTINE_CONTENT_CANDIDATE_KINDS = [
  "course-name",
  "heading",
  "prose",
  "list-item",
  "link-label",
  "image",
  "caption"
] as const satisfies readonly CandidateKind[];

export const STUDIO_ROUTINE_CONTENT_CAPABILITY_KINDS = [
  "rename-synchronization",
  "link-destination",
  "image-source",
  "image-alt"
] as const satisfies readonly CourseEditCapabilityOpportunityKind[];

export type ProjectStudioEditabilityContractV1 = {
  schemaVersion: typeof STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION;
  profileId: typeof STUDIO_ROUTINE_CONTENT_PROFILE_ID;
};

export const COURSE_EDITABILITY_MAX_SURFACES_PER_PROJECT = 2_000;
export const COURSE_EDITABILITY_MAX_OCCURRENCES_PER_SURFACE = 50_000;
export const COURSE_EDITABILITY_NATIVE_DETAILS_STATE = "native-details-open";

export type LearnerSurfaceInventorySource = "manifest" | "course-outline" | "adapter";

export type LearnerSurface = {
  surfaceId: string;
  projectSlug: string;
  htmlPath: string;
  route: string;
  stateKey: string | null;
  inventorySource: LearnerSurfaceInventorySource;
};

export type LearnerSurfaceInventoryErrorCode =
  | "manifest-missing"
  | "manifest-invalid"
  | "driver-unsupported"
  | "declared-page-missing"
  | "route-declaration-missing"
  | "state-declaration-missing"
  | "factory-outline-invalid"
  | "snapshot-boundary-invalid"
  | "inventory-truncated"
  | "inventory-timeout"
  | "inventory-internal-error";

export type LearnerSurfaceInventory = {
  schemaVersion: typeof COURSE_EDITABILITY_INVENTORY_SCHEMA_VERSION;
  complete: boolean;
  surfaces: LearnerSurface[];
  errorCode: LearnerSurfaceInventoryErrorCode | null;
};

export type ProjectLearnerSurfaceDeclaration = {
  htmlPath: string;
  route: string;
  stateKey: string | null;
};

export type ProjectLearnerSurfacesV1 =
  | {
      schemaVersion: 1;
      mode: "static-pages-complete";
      pages: Array<{ htmlPath: string; route: string }>;
    }
  | {
      schemaVersion: 1;
      mode: "declared-routes-and-states";
      surfaces: ProjectLearnerSurfaceDeclaration[];
    };

export const COURSE_EDIT_CANDIDATE_KINDS = [
  "heading",
  "prose",
  "list-item",
  "link-label",
  "button-label",
  "image",
  "caption",
  "table-cell",
  "callout-title",
  "callout-body",
  "course-name"
] as const;

export type CandidateKind = (typeof COURSE_EDIT_CANDIDATE_KINDS)[number];
export type CourseEditCandidateClassification = "editable" | "annotation-only";
export type CourseEditCandidateOwnership = "source-backed" | "runtime-owned" | "unsupported-structured";

export const COURSE_EDIT_REASON_CODES = [
  "ready",
  "runtime-owned",
  "ambiguous-identity",
  "complex-structure",
  "unsupported-component",
  "not-canonical",
  "stale-source",
  "render-source-mismatch",
  "resolve-rejected",
  "uninspectable-page",
  "surface-inventory-incomplete",
  "candidate-truncated",
  "duplicate-presentation",
  "intentional-annotation-only",
  "storage-write-attempt",
  "service-worker-attempt",
  "project-repair-attempt",
  "external-network-attempt",
  "form-state-attempt",
  "surface-timeout",
  "surface-memory-limit"
] as const;

export type CourseEditReasonCode = (typeof COURSE_EDIT_REASON_CODES)[number];

export type CourseEditCandidate = {
  schemaVersion: typeof COURSE_EDITABILITY_CANDIDATE_SCHEMA_VERSION;
  candidateId: string;
  surfaceId: string;
  kind: CandidateKind;
  classification: CourseEditCandidateClassification;
  ownership: CourseEditCandidateOwnership;
  reasonCode: CourseEditReasonCode;
  sourceNodeId: string | null;
  canonicalOwnerDigest: string | null;
  renderedFingerprint: string;
  normalizedTextCodeUnits: number;
  resolveChecked: boolean;
  resolveEligible: boolean;
};

export type CourseEditRenderedExclusionCode =
  | "not-teacher-content"
  | "layout-only"
  | "studio-owned"
  | "decorative-image"
  | "empty-semantic-unit";

export type CourseEditRenderedOccurrenceDisposition =
  | { kind: "primary-candidate"; candidateId: string }
  | { kind: "duplicate-presentation"; candidateId: string }
  | { kind: "excluded"; exclusionCode: CourseEditRenderedExclusionCode }
  | { kind: "incomplete"; reasonCode: CourseEditReasonCode };

export type CourseEditRenderedOccurrence = {
  schemaVersion: typeof COURSE_EDITABILITY_CANDIDATE_SCHEMA_VERSION;
  occurrenceId: string;
  surfaceId: string;
  semanticKind: CandidateKind;
  disposition: CourseEditRenderedOccurrenceDisposition;
};

export const COURSE_EDIT_CAPABILITY_OPPORTUNITY_KINDS = [
  "rich-text",
  "link-destination",
  "image-source",
  "image-alt",
  "image-title",
  "curated-style",
  "rename-synchronization"
] as const;

export type CourseEditCapabilityOpportunityKind =
  (typeof COURSE_EDIT_CAPABILITY_OPPORTUNITY_KINDS)[number];

export type CourseEditCapabilityOpportunity = {
  schemaVersion: typeof COURSE_EDITABILITY_CANDIDATE_SCHEMA_VERSION;
  opportunityId: string;
  candidateId: string;
  kind: CourseEditCapabilityOpportunityKind;
  supported: boolean;
  reasonCode: CourseEditReasonCode;
};

export type CourseEditCoverageStatus = "complete" | "no-candidates" | "incomplete" | "error";

export type CourseEditCoverageRatio = {
  numerator: number;
  denominator: number;
};

export type CourseEditCoverageBreakdown = {
  supported: number;
  total: number;
};

export type CourseEditabilitySurfaceReport = {
  surface: LearnerSurface;
  status: CourseEditCoverageStatus;
  blockCoverage: CourseEditCoverageRatio | null;
  teacherTextCoverage: CourseEditCoverageRatio | null;
  candidatesByKind: Partial<Record<CandidateKind, CourseEditCoverageBreakdown>>;
  capabilitiesByKind: Partial<Record<CourseEditCapabilityOpportunityKind, CourseEditCoverageBreakdown>>;
  reasons: Partial<Record<CourseEditReasonCode, number>>;
  exclusions: Partial<Record<CourseEditRenderedExclusionCode, number>>;
  renderedOccurrenceCount: number;
  duplicateOccurrenceCount: number;
};

export type CourseEditabilityProjectReport = {
  projectSlug: string;
  adapter: CourseEditAdapter | null;
  inventory: LearnerSurfaceInventory;
  status: CourseEditCoverageStatus;
  blockCoverage: CourseEditCoverageRatio | null;
  teacherTextCoverage: CourseEditCoverageRatio | null;
  candidatesByKind: Partial<Record<CandidateKind, CourseEditCoverageBreakdown>>;
  capabilitiesByKind: Partial<Record<CourseEditCapabilityOpportunityKind, CourseEditCoverageBreakdown>>;
  reasons: Partial<Record<CourseEditReasonCode, number>>;
  surfaces: CourseEditabilitySurfaceReport[];
};

export type CourseEditabilityAggregate = {
  status: CourseEditCoverageStatus;
  projectCount: number;
  completeProjectCount: number;
  blockCoverage: CourseEditCoverageRatio | null;
  teacherTextCoverage: CourseEditCoverageRatio | null;
  candidatesByKind: Partial<Record<CandidateKind, CourseEditCoverageBreakdown>>;
  capabilitiesByKind: Partial<Record<CourseEditCapabilityOpportunityKind, CourseEditCoverageBreakdown>>;
  reasons: Partial<Record<CourseEditReasonCode, number>>;
};

export type CourseEditabilityResidueProof = {
  ok: boolean;
  changedPaths: string[];
  browserStorageWriteAttemptCount: number;
  browserStorageResidue: boolean;
};

export type CourseEditabilityCoverageReport = {
  schemaVersion: 1;
  exactCommit: string;
  commitTimestamp: string;
  worktreeClean: boolean;
  inventorySchemaVersion: typeof COURSE_EDITABILITY_INVENTORY_SCHEMA_VERSION;
  candidateSchemaVersion: typeof COURSE_EDITABILITY_CANDIDATE_SCHEMA_VERSION;
  reasonRegistryVersion: typeof COURSE_EDITABILITY_REASON_REGISTRY_VERSION;
  isolationProfileVersion: typeof COURSE_EDITABILITY_ISOLATION_PROFILE_VERSION;
  limits: Record<string, number>;
  projects: CourseEditabilityProjectReport[];
  aggregate: CourseEditabilityAggregate;
  residue: CourseEditabilityResidueProof;
  reportDigest: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isProjectStudioEditabilityContractV1(
  value: unknown
): value is ProjectStudioEditabilityContractV1 {
  return (
    isRecord(value) &&
    Object.keys(value).every((key) => ["schemaVersion", "profileId"].includes(key)) &&
    value.schemaVersion === STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION &&
    value.profileId === STUDIO_ROUTINE_CONTENT_PROFILE_ID
  );
}

function isSafeHtmlPath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 2_048 &&
    !value.startsWith("/") &&
    !value.includes("\\") &&
    !value.includes("\0") &&
    !value.split("/").some((part) => !part || part === "." || part === "..") &&
    /\.html?$/i.test(value)
  );
}

function isSafeSurfaceRoute(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2_048 || value.includes("\0") || value.includes("\\")) return false;
  if (!value) return true;
  if (!value.startsWith("?") && !value.startsWith("#")) return false;
  try {
    const parsed = new URL(value, "https://canvas-helper.invalid/course.html");
    return parsed.origin === "https://canvas-helper.invalid" && parsed.pathname === "/course.html";
  } catch {
    return false;
  }
}

function isSurfaceDeclaration(value: unknown): value is ProjectLearnerSurfaceDeclaration {
  return (
    isRecord(value) &&
    Object.keys(value).every((key) => ["htmlPath", "route", "stateKey"].includes(key)) &&
    isSafeHtmlPath(value.htmlPath) &&
    isSafeSurfaceRoute(value.route) &&
    (value.stateKey === null || (
      typeof value.stateKey === "string" &&
      value.stateKey.length > 0 &&
      value.stateKey.length <= 256 &&
      !/[\u0000-\u001f\u007f]/.test(value.stateKey)
    ))
  );
}

export function isProjectLearnerSurfacesV1(value: unknown): value is ProjectLearnerSurfacesV1 {
  if (!isRecord(value) || value.schemaVersion !== 1) return false;
  if (value.mode === "static-pages-complete") {
    return (
      Object.keys(value).every((key) => ["schemaVersion", "mode", "pages"].includes(key)) &&
      Array.isArray(value.pages) &&
      value.pages.length > 0 &&
      value.pages.length <= COURSE_EDITABILITY_MAX_SURFACES_PER_PROJECT &&
      value.pages.every((entry) => (
        isRecord(entry) &&
        Object.keys(entry).every((key) => ["htmlPath", "route"].includes(key)) &&
        isSafeHtmlPath(entry.htmlPath) &&
        isSafeSurfaceRoute(entry.route)
      ))
    );
  }
  if (value.mode === "declared-routes-and-states") {
    return (
      Object.keys(value).every((key) => ["schemaVersion", "mode", "surfaces"].includes(key)) &&
      Array.isArray(value.surfaces) &&
      value.surfaces.length > 0 &&
      value.surfaces.length <= COURSE_EDITABILITY_MAX_SURFACES_PER_PROJECT &&
      value.surfaces.every(isSurfaceDeclaration)
    );
  }
  return false;
}
