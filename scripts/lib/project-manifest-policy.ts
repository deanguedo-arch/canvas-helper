import type {
  InjectedComponentStatus,
  ManifestMigrationState,
  ProjectAuthoringStatus,
  ProjectManifest,
  ProjectType,
  WorkflowType
} from "./types.js";

const PROJECT_TYPES = new Set<ProjectType>(["conversion", "generated-course", "hybrid"]);
const WORKFLOW_TYPES = new Set<WorkflowType>(["conversion", "generated-course", "injection/integration"]);
const MIGRATION_STATES = new Set<ManifestMigrationState>(["legacy", "migrated"]);
const AUTHORING_STATUSES = new Set<ProjectAuthoringStatus>([
  "active",
  "blocked",
  "ready-for-export",
  "reference-only",
  "archived"
]);
const INJECTED_COMPONENT_STATUSES = new Set<InjectedComponentStatus>([
  "active",
  "reference-only",
  "planned",
  "archived"
]);
const EXPORT_TARGETS = new Set(["brightspace", "scorm", "google-hosted", "apps-script", "html", "docx"]);
const IMPORT_SOURCE_SYSTEMS = new Set(["gemini-canvas", "d2l", "brightspace", "manual", "other"]);
const AUTHORING_DRIVER_IDS = new Set([
  "direct-workspace-v1",
  "english-factory-v1",
  "social-related-issues-v1",
  "legacy-snapshot-v1",
  "proposal-only-v1"
]);

function toTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return [...new Set(value.map((item) => toTrimmedString(item)).filter(Boolean))];
}

function normalizePreferredWorkflows(value: unknown) {
  return normalizeStringList(value).filter((workflow): workflow is WorkflowType => WORKFLOW_TYPES.has(workflow as WorkflowType));
}

function normalizeProjectType(value: unknown) {
  const trimmed = toTrimmedString(value);
  if (!PROJECT_TYPES.has(trimmed as ProjectType)) {
    return undefined;
  }

  return trimmed as ProjectType;
}

function normalizeMigrationState(value: unknown) {
  const trimmed = toTrimmedString(value);
  if (!MIGRATION_STATES.has(trimmed as ManifestMigrationState)) {
    return "legacy" as const;
  }

  return trimmed as ManifestMigrationState;
}

function normalizeAuthoringStatus(value: unknown) {
  const trimmed = toTrimmedString(value);
  if (!AUTHORING_STATUSES.has(trimmed as ProjectAuthoringStatus)) {
    return "active" as const;
  }

  return trimmed as ProjectAuthoringStatus;
}

function normalizeInjectedComponentStatus(value: unknown): InjectedComponentStatus {
  const trimmed = toTrimmedString(value);
  if (!INJECTED_COMPONENT_STATUSES.has(trimmed as InjectedComponentStatus)) {
    return "planned";
  }

  return trimmed as InjectedComponentStatus;
}

function normalizeExportTargets(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as NonNullable<ProjectManifest["exportTargets"]>;
  }

  const normalized: NonNullable<ProjectManifest["exportTargets"]> = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const target = toTrimmedString((entry as Record<string, unknown>).target);
    if (!EXPORT_TARGETS.has(target)) {
      continue;
    }

    const notes = toTrimmedString((entry as Record<string, unknown>).notes);
    const enabledRaw = (entry as Record<string, unknown>).enabled;
    const enabled = typeof enabledRaw === "boolean" ? enabledRaw : undefined;

    normalized.push({
      target: target as "brightspace" | "scorm" | "google-hosted" | "apps-script" | "html" | "docx",
      enabled,
      notes: notes || undefined
    });
  }

  return normalized;
}

function normalizeInjectedComponents(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as NonNullable<ProjectManifest["injectedComponents"]>;
  }

  const normalized: NonNullable<ProjectManifest["injectedComponents"]> = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const source = toTrimmedString((entry as Record<string, unknown>).source);
    const target = toTrimmedString((entry as Record<string, unknown>).target);
    const id = toTrimmedString((entry as Record<string, unknown>).id);
    if (!id || !source || !target) {
      continue;
    }

    const notes = toTrimmedString((entry as Record<string, unknown>).notes);
    normalized.push({
      id,
      source,
      target,
      status: normalizeInjectedComponentStatus((entry as Record<string, unknown>).status),
      notes: notes || undefined
    });
  }

  return normalized;
}

function normalizeImportedFirstPassOrigin(value: unknown) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const sourceSystem = toTrimmedString((value as Record<string, unknown>).sourceSystem);
  if (!IMPORT_SOURCE_SYSTEMS.has(sourceSystem)) {
    return undefined;
  }

  const sourcePath = toTrimmedString((value as Record<string, unknown>).sourcePath);
  const importedAt = toTrimmedString((value as Record<string, unknown>).importedAt);
  const notes = toTrimmedString((value as Record<string, unknown>).notes);

  return {
    sourceSystem: sourceSystem as "gemini-canvas" | "d2l" | "brightspace" | "manual" | "other",
    sourcePath: sourcePath || undefined,
    importedAt: importedAt || undefined,
    notes: notes || undefined
  } satisfies NonNullable<ProjectManifest["importedFirstPassOrigin"]>;
}

function normalizeAuthoringContract(value: unknown): ProjectManifest["authoring"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const driverId = toTrimmedString(record.driverId);
  if (!AUTHORING_DRIVER_IDS.has(driverId)) {
    return undefined;
  }

  const familyId = toTrimmedString(record.familyId);
  const qualityProfile = toTrimmedString(record.qualityProfile);
  const sourceResourceIds = normalizeStringList(record.sourceResourceIds);
  const studioEditingRecord = record.studioEditing && typeof record.studioEditing === "object" && !Array.isArray(record.studioEditing)
    ? record.studioEditing as Record<string, unknown>
    : null;
  const studioEditing = studioEditingRecord && typeof studioEditingRecord.enabled === "boolean"
    ? {
        enabled: studioEditingRecord.enabled,
        ...(typeof studioEditingRecord.renameCourse === "boolean" ? { renameCourse: studioEditingRecord.renameCourse } : {}),
        ...(typeof studioEditingRecord.imageAssets === "boolean" ? { imageAssets: studioEditingRecord.imageAssets } : {})
      }
    : undefined;
  return {
    driverId: driverId as NonNullable<ProjectManifest["authoring"]>["driverId"],
    ...(familyId ? { familyId } : {}),
    ...(sourceResourceIds.length > 0 ? { sourceResourceIds } : {}),
    ...(qualityProfile ? { qualityProfile } : {}),
    ...(studioEditing ? { studioEditing } : {})
  };
}

export function normalizeProjectManifestPolicy(manifest: ProjectManifest): ProjectManifest {
  const migrationState = normalizeMigrationState(manifest.migrationState);
  return {
    ...manifest,
    title: toTrimmedString(manifest.title) || undefined,
    migrationState,
    projectType: normalizeProjectType(manifest.projectType),
    preferredWorkflows: normalizePreferredWorkflows(manifest.preferredWorkflows),
    canonicalEntry: toTrimmedString(manifest.canonicalEntry) || undefined,
    canonicalSources: normalizeStringList(manifest.canonicalSources),
    generatedOutputs: normalizeStringList(manifest.generatedOutputs),
    regenerateCommand: toTrimmedString(manifest.regenerateCommand) || undefined,
    authoring: normalizeAuthoringContract(manifest.authoring),
    injectedComponents: normalizeInjectedComponents(manifest.injectedComponents),
    importedFirstPassOrigin: normalizeImportedFirstPassOrigin(manifest.importedFirstPassOrigin),
    exportTargets: normalizeExportTargets(manifest.exportTargets),
    authoringStatus: normalizeAuthoringStatus(manifest.authoringStatus),
    referenceOnly: normalizeStringList(manifest.referenceOnly),
    sourceOfTruthNotes: toTrimmedString(manifest.sourceOfTruthNotes) || undefined
  };
}

type ValidationStatus = "valid" | "invalid" | "skipped-legacy";

export type ProjectManifestValidationResult = {
  slug: string;
  status: ValidationStatus;
  errors: string[];
  warnings: string[];
};

function requiresSourceOfTruth(authoringStatus: ProjectAuthoringStatus | undefined) {
  return authoringStatus === "active" || authoringStatus === "blocked" || authoringStatus === "ready-for-export";
}

export function validateProjectManifestPolicy(manifest: ProjectManifest): ProjectManifestValidationResult {
  const normalized = normalizeProjectManifestPolicy(manifest);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (normalized.migrationState !== "migrated") {
    return {
      slug: normalized.slug,
      status: "skipped-legacy",
      errors,
      warnings
    };
  }

  if (!normalized.projectType) {
    errors.push("Missing `projectType` for migrated project.");
  }

  if (!normalized.authoringStatus) {
    errors.push("Missing `authoringStatus` for migrated project.");
  }

  if (manifest.authoring !== undefined && !normalized.authoring) {
    errors.push("`authoring` is present but does not declare a supported `driverId`.");
  }

  if (requiresSourceOfTruth(normalized.authoringStatus)) {
    if (!normalized.canonicalEntry) {
      errors.push("Missing `canonicalEntry` for an active migrated project.");
    }

    if (!normalized.canonicalSources || normalized.canonicalSources.length === 0) {
      errors.push("Missing `canonicalSources` for an active migrated project.");
    }

    if (!normalized.exportTargets || normalized.exportTargets.length === 0) {
      errors.push("Missing `exportTargets` for an active migrated project.");
    }
  }

  if (normalized.canonicalEntry && normalized.canonicalSources && !normalized.canonicalSources.includes(normalized.canonicalEntry)) {
    warnings.push("`canonicalEntry` is not listed in `canonicalSources`.");
  }

  if (normalized.generatedOutputs && normalized.generatedOutputs.length > 0 && !normalized.regenerateCommand) {
    errors.push("`generatedOutputs` are declared but `regenerateCommand` is missing.");
  }

  const canonicalSet = new Set(normalized.canonicalSources ?? []);
  for (const referenceOnlyPath of normalized.referenceOnly ?? []) {
    if (canonicalSet.has(referenceOnlyPath)) {
      errors.push(`Reference-only path is also canonical: ${referenceOnlyPath}`);
    }
  }

  if (normalized.canonicalEntry && (normalized.referenceOnly ?? []).includes(normalized.canonicalEntry)) {
    errors.push("`canonicalEntry` cannot also appear in `referenceOnly`.");
  }

  if (normalized.projectType === "conversion" && !(normalized.preferredWorkflows ?? []).includes("conversion")) {
    warnings.push("`projectType` is conversion but `preferredWorkflows` does not include conversion.");
  }

  if (normalized.projectType === "generated-course" && !(normalized.preferredWorkflows ?? []).includes("generated-course")) {
    warnings.push("`projectType` is generated-course but `preferredWorkflows` does not include generated-course.");
  }

  if (normalized.projectType === "hybrid" && (normalized.preferredWorkflows ?? []).length < 2) {
    warnings.push("`projectType` is hybrid but fewer than two preferred workflows are declared.");
  }

  for (const component of normalized.injectedComponents ?? []) {
    if (component.status === "active" && (normalized.referenceOnly ?? []).includes(component.source)) {
      errors.push(`Injected component source cannot be active and reference-only: ${component.source}`);
    }
  }

  return {
    slug: normalized.slug,
    status: errors.length > 0 ? "invalid" : "valid",
    errors,
    warnings
  };
}
