import { fileExists, readJsonFile } from "../fs.js";
import { getProjectPaths } from "../paths.js";
import type { ProjectBenchmarkSelection } from "./types.js";
import { loadBenchmarkBundle } from "./load.js";

type ResolveProjectBenchmarkSelectionOptions = {
  projectSlug: string;
  registryDir?: string;
  recipesDir?: string;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readOptionalStringRecord(
  input: Record<string, unknown>,
  key: string,
  path: string,
  errors: string[]
) {
  const value = input[key];
  if (value === undefined) {
    return undefined;
  }

  if (!isObjectRecord(value)) {
    errors.push(`${path} must be an object when provided`);
    return undefined;
  }

  const entries = Object.entries(value);
  if (entries.some(([recordKey, recordValue]) => recordKey.trim().length === 0 || typeof recordValue !== "string")) {
    errors.push(`${path} must contain only non-empty string keys with string values`);
    return undefined;
  }

  return Object.fromEntries(entries.map(([recordKey, recordValue]) => [recordKey.trim(), String(recordValue).trim()]));
}

function validateProjectBenchmarkSelection(input: unknown): ProjectBenchmarkSelection {
  if (!isObjectRecord(input)) {
    throw new Error("Project benchmark selection is invalid:\n- selection must be an object");
  }

  const errors: string[] = [];
  const benchmarkId =
    typeof input.benchmarkId === "string" && input.benchmarkId.trim().length > 0 ? input.benchmarkId.trim() : "";
  if (!benchmarkId) {
    errors.push("selection.benchmarkId must be a non-empty string");
  }

  const sourceSupportMode =
    typeof input.sourceSupportMode === "string" && input.sourceSupportMode.trim().length > 0
      ? input.sourceSupportMode.trim()
      : undefined;
  if (
    sourceSupportMode !== undefined &&
    !["hidden-by-default", "optional", "visible"].includes(sourceSupportMode)
  ) {
    errors.push("selection.sourceSupportMode must be one of: hidden-by-default, optional, visible");
  }

  const notes =
    input.notes === undefined
      ? undefined
      : Array.isArray(input.notes) && input.notes.every((note) => typeof note === "string" && note.trim().length > 0)
        ? input.notes.map((note) => note.trim())
        : (errors.push("selection.notes must be an array of non-empty strings"), undefined);

  const sectionOverrides = readOptionalStringRecord(
    input,
    "sectionOverrides",
    "selection.sectionOverrides",
    errors
  );
  const activityOverrides = readOptionalStringRecord(
    input,
    "activityOverrides",
    "selection.activityOverrides",
    errors
  );

  if (errors.length > 0) {
    throw new Error(`Project benchmark selection is invalid:\n- ${errors.join("\n- ")}`);
  }

  return {
    benchmarkId,
    ...(sectionOverrides ? { sectionOverrides } : {}),
    ...(typeof sourceSupportMode === "string" ? { sourceSupportMode: sourceSupportMode as ProjectBenchmarkSelection["sourceSupportMode"] } : {}),
    ...(activityOverrides ? { activityOverrides } : {}),
    ...(notes ? { notes } : {})
  };
}

export async function resolveProjectBenchmarkSelection(options: ResolveProjectBenchmarkSelectionOptions) {
  const projectPaths = getProjectPaths(options.projectSlug);

  if (!(await fileExists(projectPaths.benchmarkSelectionPath))) {
    return {
      selection: null,
      bundle: null
    };
  }

  const selection = validateProjectBenchmarkSelection(await readJsonFile<unknown>(projectPaths.benchmarkSelectionPath));
  const bundle = await loadBenchmarkBundle({
    benchmarkId: selection.benchmarkId,
    registryDir: options.registryDir,
    recipesDir: options.recipesDir
  });

  return {
    selection,
    bundle
  };
}
