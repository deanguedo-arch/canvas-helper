import type {
  BenchmarkRecord,
  BenchmarkRecipeRef,
  BenchmarkSourceSupportMode,
  BenchmarkStatus,
  BenchmarkVisualSystem,
  RecipeRecord
} from "./types.js";

const BENCHMARK_STATUSES = new Set<BenchmarkStatus>(["approved", "draft"]);
const SOURCE_SUPPORT_MODES = new Set<BenchmarkSourceSupportMode>(["hidden-by-default", "optional", "visible"]);

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNonEmptyString(
  input: Record<string, unknown>,
  key: string,
  path: string,
  errors: string[]
) {
  const value = input[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${path} must be a non-empty string`);
    return "";
  }

  return value.trim();
}

function readStringArray(
  input: Record<string, unknown>,
  key: string,
  path: string,
  errors: string[],
  options: { minItems?: number } = {}
) {
  const value = input[key];
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || entry.trim().length === 0)) {
    errors.push(`${path} must be an array of non-empty strings`);
    return [] as string[];
  }

  const normalized = value.map((entry) => entry.trim());
  if ((options.minItems ?? 0) > normalized.length) {
    errors.push(`${path} must include at least ${options.minItems} item(s)`);
  }

  return normalized;
}

function readBenchmarkVisualSystem(
  value: unknown,
  path: string,
  errors: string[]
): BenchmarkVisualSystem {
  if (!isObjectRecord(value)) {
    errors.push(`${path} must be an object`);
    return {
      surface: "",
      palette: "",
      typography: ""
    };
  }

  return {
    surface: readNonEmptyString(value, "surface", `${path}.surface`, errors),
    palette: readNonEmptyString(value, "palette", `${path}.palette`, errors),
    typography: readNonEmptyString(value, "typography", `${path}.typography`, errors)
  };
}

function readSourceSupportPolicy(
  value: unknown,
  path: string,
  errors: string[]
): BenchmarkRecord["sourceSupportPolicy"] {
  if (!isObjectRecord(value)) {
    errors.push(`${path} must be an object`);
    return {
      mode: "hidden-by-default"
    };
  }

  const modeValue = value.mode;
  if (typeof modeValue !== "string" || !SOURCE_SUPPORT_MODES.has(modeValue as BenchmarkSourceSupportMode)) {
    errors.push(`${path}.mode must be one of: ${[...SOURCE_SUPPORT_MODES].join(", ")}`);
  }

  const labelValue = value.label;
  if (labelValue !== undefined && (typeof labelValue !== "string" || labelValue.trim().length === 0)) {
    errors.push(`${path}.label must be a non-empty string when provided`);
  }

  return {
    mode:
      typeof modeValue === "string" && SOURCE_SUPPORT_MODES.has(modeValue as BenchmarkSourceSupportMode)
        ? (modeValue as BenchmarkSourceSupportMode)
        : "hidden-by-default",
    ...(typeof labelValue === "string" && labelValue.trim().length > 0 ? { label: labelValue.trim() } : {})
  };
}

function readRecipeRefs(value: unknown, path: string, errors: string[]): BenchmarkRecipeRef[] {
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array`);
    return [];
  }

  const refs = value.map((entry, index) => {
    if (!isObjectRecord(entry)) {
      errors.push(`${path}[${index}] must be an object`);
      return {
        id: "",
        purpose: ""
      };
    }

    const id = readNonEmptyString(entry, "id", `${path}[${index}].id`, errors);
    const purpose = readNonEmptyString(entry, "purpose", `${path}[${index}].purpose`, errors);
    const requiredValue = entry.required;
    if (requiredValue !== undefined && typeof requiredValue !== "boolean") {
      errors.push(`${path}[${index}].required must be a boolean when provided`);
    }

    return {
      id,
      purpose,
      ...(typeof requiredValue === "boolean" ? { required: requiredValue } : {})
    };
  });

  if (refs.length === 0) {
    errors.push(`${path} must include at least 1 item(s)`);
  }

  return refs;
}

function buildValidationError(prefix: string, errors: string[]) {
  return new Error(`${prefix}:\n- ${errors.join("\n- ")}`);
}

export function validateBenchmarkRecord(input: unknown): BenchmarkRecord {
  if (!isObjectRecord(input)) {
    throw new Error("Benchmark record is invalid:\n- benchmark must be an object");
  }

  const errors: string[] = [];
  const id = readNonEmptyString(input, "id", "benchmark.id", errors);
  const label = readNonEmptyString(input, "label", "benchmark.label", errors);
  const sourceProjectSlug = readNonEmptyString(input, "sourceProjectSlug", "benchmark.sourceProjectSlug", errors);

  const statusValue = input.status;
  if (typeof statusValue !== "string" || !BENCHMARK_STATUSES.has(statusValue as BenchmarkStatus)) {
    errors.push(`benchmark.status must be one of: ${[...BENCHMARK_STATUSES].join(", ")}`);
  }

  const tags = readStringArray(input, "tags", "benchmark.tags", errors, { minItems: 1 });
  const intendedUse = readStringArray(input, "intendedUse", "benchmark.intendedUse", errors, { minItems: 1 });
  const visualSystem = readBenchmarkVisualSystem(input.visualSystem, "benchmark.visualSystem", errors);
  const sectionFlow = readStringArray(input, "sectionFlow", "benchmark.sectionFlow", errors, { minItems: 1 });
  const activityFamilies = readStringArray(input, "activityFamilies", "benchmark.activityFamilies", errors, {
    minItems: 1
  });
  const checkpointFamilies = readStringArray(input, "checkpointFamilies", "benchmark.checkpointFamilies", errors, {
    minItems: 1
  });
  const sourceSupportPolicy = readSourceSupportPolicy(
    input.sourceSupportPolicy,
    "benchmark.sourceSupportPolicy",
    errors
  );
  const recipeRefs = readRecipeRefs(input.recipeRefs, "benchmark.recipeRefs", errors);
  const summary =
    typeof input.summary === "string" && input.summary.trim().length > 0 ? input.summary.trim() : undefined;

  if (errors.length > 0) {
    throw buildValidationError("Benchmark record is invalid", errors);
  }

  return {
    id,
    label,
    sourceProjectSlug,
    status: statusValue as BenchmarkStatus,
    tags,
    intendedUse,
    visualSystem,
    sectionFlow,
    activityFamilies,
    checkpointFamilies,
    sourceSupportPolicy,
    recipeRefs,
    ...(summary ? { summary } : {})
  };
}

export function validateRecipeRecord(input: unknown): RecipeRecord {
  if (!isObjectRecord(input)) {
    throw new Error("Recipe record is invalid:\n- recipe must be an object");
  }

  const errors: string[] = [];
  const id = readNonEmptyString(input, "id", "recipe.id", errors);
  const family = readNonEmptyString(input, "family", "recipe.family", errors);
  const inputs = readStringArray(input, "inputs", "recipe.inputs", errors, { minItems: 1 });
  const optionalInputs = readStringArray(input, "optionalInputs", "recipe.optionalInputs", errors);
  const renderingRules = readStringArray(input, "renderingRules", "recipe.renderingRules", errors, {
    minItems: 1
  });
  const interactionRules = readStringArray(input, "interactionRules", "recipe.interactionRules", errors, {
    minItems: 1
  });
  const persistenceRules = readStringArray(input, "persistenceRules", "recipe.persistenceRules", errors, {
    minItems: 1
  });
  const constraints = readStringArray(input, "constraints", "recipe.constraints", errors, { minItems: 1 });
  const summary =
    typeof input.summary === "string" && input.summary.trim().length > 0 ? input.summary.trim() : undefined;

  if (errors.length > 0) {
    throw buildValidationError("Recipe record is invalid", errors);
  }

  return {
    id,
    family,
    inputs,
    optionalInputs,
    renderingRules,
    interactionRules,
    persistenceRules,
    constraints,
    ...(summary ? { summary } : {})
  };
}
