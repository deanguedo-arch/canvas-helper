import { fileExists, readJsonFile, writeJsonFile } from "../../fs.js";
import { loadBenchmarkBundle } from "../../benchmarks/load.js";
import { getProjectPaths, repoAuthoringPreferencesPath } from "../../paths.js";
import type {
  AuthoringAcceptedRule,
  AuthoringPreferenceRule,
  AuthoringPreferenceScope,
  AuthoringPreferences,
  AuthoringPreferencesOverride,
  ResolvedAuthoringPreferences
} from "../../types.js";

export type ResolveAuthoringPreferencesOptions = {
  projectSlug?: string;
  repoPreferencesPath?: string;
  projectPreferencesPath?: string;
  benchmarkSelectionPath?: string;
  cliOverride?: AuthoringPreferencesOverride;
};

type BenchmarkSelectionInput = {
  benchmarkId?: unknown;
  sourceSupportMode?: unknown;
};

type UpdateAuthoringPreferencesOptions = {
  projectSlug?: string;
  scope: AuthoringPreferenceScope;
  repoPreferencesPath?: string;
  projectPreferencesPath?: string;
  update: (current: AuthoringPreferences) => AuthoringPreferences;
};

const DEFAULT_AUTHORING_PREFERENCES: AuthoringPreferences = {
  schemaVersion: 1,
  flow: {
    sourceSupportMode: "hidden-by-default"
  },
  rules: {
    require: [],
    forbid: [],
    accepted: []
  },
  quality: {
    maxConsecutiveParagraphBlocks: 6
  },
  learning: {
    defaultScope: "repo"
  }
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toRuleSeverity(value: unknown): "error" | "warn" | undefined {
  if (value === "error" || value === "warn") {
    return value;
  }
  return undefined;
}

function toScope(value: unknown): AuthoringPreferenceScope | undefined {
  if (value === "repo" || value === "project") {
    return value;
  }
  return undefined;
}

function toSourceSupportMode(value: unknown): AuthoringPreferences["flow"]["sourceSupportMode"] {
  if (value === "hidden-by-default" || value === "optional" || value === "visible") {
    return value;
  }
  return undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function asPositiveInt(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }
  const rounded = Math.round(value);
  return rounded > 0 ? rounded : undefined;
}

function sanitizeRule(input: unknown): AuthoringPreferenceRule | null {
  if (!isObjectRecord(input)) {
    return null;
  }

  const id = asString(input.id);
  const description = asString(input.description);
  const pattern = asString(input.pattern);
  if (!id || !description || !pattern) {
    return null;
  }

  return {
    id,
    description,
    pattern,
    ...(toRuleSeverity(input.severity) ? { severity: toRuleSeverity(input.severity) } : {})
  };
}

function sanitizeAcceptedRule(input: unknown): AuthoringAcceptedRule | null {
  if (!isObjectRecord(input)) {
    return null;
  }

  const ruleId = asString(input.ruleId);
  const reason = asString(input.reason);
  const updatedAt = asString(input.updatedAt);
  const scope = toScope(input.scope);
  if (!ruleId || !reason || !updatedAt || !scope) {
    return null;
  }

  return {
    ruleId,
    reason,
    updatedAt,
    scope
  };
}

function uniqueById<T extends { id: string }>(values: T[]) {
  const seen = new Set<string>();
  const unique: T[] = [];
  for (const value of values) {
    if (seen.has(value.id)) {
      continue;
    }
    seen.add(value.id);
    unique.push(value);
  }
  return unique;
}

function uniqueAcceptedByRule(values: AuthoringAcceptedRule[]) {
  const latestByRule = new Map<string, AuthoringAcceptedRule>();
  for (const value of values) {
    latestByRule.set(value.ruleId, value);
  }
  return [...latestByRule.values()].sort((left, right) => left.ruleId.localeCompare(right.ruleId));
}

function sanitizeAuthoringPreferencesInput(input: unknown): AuthoringPreferencesOverride {
  if (!isObjectRecord(input)) {
    return {};
  }

  const flowInput = isObjectRecord(input.flow) ? input.flow : null;
  const rulesInput = isObjectRecord(input.rules) ? input.rules : null;
  const qualityInput = isObjectRecord(input.quality) ? input.quality : null;
  const learningInput = isObjectRecord(input.learning) ? input.learning : null;

  const requireRules = Array.isArray(rulesInput?.require)
    ? uniqueById((rulesInput?.require ?? []).map((entry) => sanitizeRule(entry)).filter(Boolean) as AuthoringPreferenceRule[])
    : undefined;
  const forbidRules = Array.isArray(rulesInput?.forbid)
    ? uniqueById((rulesInput?.forbid ?? []).map((entry) => sanitizeRule(entry)).filter(Boolean) as AuthoringPreferenceRule[])
    : undefined;
  const acceptedRules = Array.isArray(rulesInput?.accepted)
    ? uniqueAcceptedByRule(
        (rulesInput?.accepted ?? [])
          .map((entry) => sanitizeAcceptedRule(entry))
          .filter(Boolean) as AuthoringAcceptedRule[]
      )
    : undefined;

  return {
    ...(flowInput
      ? {
          flow: {
            ...(toSourceSupportMode(flowInput.sourceSupportMode)
              ? { sourceSupportMode: toSourceSupportMode(flowInput.sourceSupportMode) }
              : {}),
            ...(asString(flowInput.preferredBenchmarkId)
              ? { preferredBenchmarkId: asString(flowInput.preferredBenchmarkId) }
              : {})
          }
        }
      : {}),
    ...(rulesInput
      ? {
          rules: {
            ...(requireRules ? { require: requireRules } : {}),
            ...(forbidRules ? { forbid: forbidRules } : {}),
            ...(acceptedRules ? { accepted: acceptedRules } : {})
          }
        }
      : {}),
    ...(qualityInput
      ? {
          quality: {
            ...(asPositiveInt(qualityInput.maxConsecutiveParagraphBlocks)
              ? { maxConsecutiveParagraphBlocks: asPositiveInt(qualityInput.maxConsecutiveParagraphBlocks) }
              : {})
          }
        }
      : {}),
    ...(learningInput && toScope(learningInput.defaultScope)
      ? {
          learning: {
            defaultScope: toScope(learningInput.defaultScope)!
          }
        }
      : {})
  };
}

function mergeAuthoringPreferences(
  base: AuthoringPreferences,
  override: AuthoringPreferencesOverride | undefined
): AuthoringPreferences {
  if (!override) {
    return base;
  }

  return {
    schemaVersion: 1,
    flow: {
      ...base.flow,
      ...(override.flow ?? {})
    },
    rules: {
      require: override.rules?.require ?? base.rules?.require ?? [],
      forbid: override.rules?.forbid ?? base.rules?.forbid ?? [],
      accepted: uniqueAcceptedByRule([...(base.rules?.accepted ?? []), ...(override.rules?.accepted ?? [])])
    },
    quality: {
      ...base.quality,
      ...(override.quality ?? {})
    },
    learning: {
      ...base.learning,
      ...(override.learning ?? {})
    }
  };
}

async function readOptionalAuthoringPreferences(filePath: string): Promise<AuthoringPreferencesOverride | null> {
  if (!(await fileExists(filePath))) {
    return null;
  }

  return sanitizeAuthoringPreferencesInput(await readJsonFile<unknown>(filePath));
}

async function resolveBenchmarkDefaults(
  options: ResolveAuthoringPreferencesOptions
): Promise<AuthoringPreferencesOverride | null> {
  let benchmarkId: string | undefined;
  let sourceSupportMode: AuthoringPreferences["flow"]["sourceSupportMode"];

  if (options.benchmarkSelectionPath && (await fileExists(options.benchmarkSelectionPath))) {
    const selection = (await readJsonFile<BenchmarkSelectionInput>(options.benchmarkSelectionPath)) ?? {};
    benchmarkId = asString(selection.benchmarkId);
    sourceSupportMode = toSourceSupportMode(selection.sourceSupportMode);
  } else if (options.projectSlug) {
    const projectBenchmarkSelectionPath = getProjectPaths(options.projectSlug).benchmarkSelectionPath;
    if (await fileExists(projectBenchmarkSelectionPath)) {
      const selection = (await readJsonFile<BenchmarkSelectionInput>(projectBenchmarkSelectionPath)) ?? {};
      benchmarkId = asString(selection.benchmarkId);
      sourceSupportMode = toSourceSupportMode(selection.sourceSupportMode);
    }
  }

  if (!benchmarkId) {
    return null;
  }

  const bundle = await loadBenchmarkBundle({ benchmarkId });
  return sanitizeAuthoringPreferencesInput({
    flow: {
      preferredBenchmarkId: bundle.benchmark.id,
      sourceSupportMode: sourceSupportMode ?? bundle.benchmark.sourceSupportPolicy.mode
    }
  });
}

function normalizeOverride(input: AuthoringPreferencesOverride | undefined) {
  if (!input) {
    return undefined;
  }

  return sanitizeAuthoringPreferencesInput(input);
}

export function getDefaultAuthoringPreferences() {
  return mergeAuthoringPreferences(DEFAULT_AUTHORING_PREFERENCES, {});
}

export async function resolveAuthoringPreferences(
  options: ResolveAuthoringPreferencesOptions = {}
): Promise<ResolvedAuthoringPreferences> {
  const repoPath = options.repoPreferencesPath ?? repoAuthoringPreferencesPath;
  const projectPath = options.projectPreferencesPath ?? (options.projectSlug ? getProjectPaths(options.projectSlug).authoringPreferencesPath : undefined);
  const sourceOrder: ResolvedAuthoringPreferences["sourceOrder"] = [];

  let resolved = getDefaultAuthoringPreferences();

  const repoOverride = await readOptionalAuthoringPreferences(repoPath);
  if (repoOverride) {
    resolved = mergeAuthoringPreferences(resolved, repoOverride);
    sourceOrder.push("repo");
  }

  const benchmarkOverride = await resolveBenchmarkDefaults(options);
  if (benchmarkOverride) {
    resolved = mergeAuthoringPreferences(resolved, benchmarkOverride);
    sourceOrder.push("benchmark");
  }

  if (projectPath) {
    const projectOverride = await readOptionalAuthoringPreferences(projectPath);
    if (projectOverride) {
      resolved = mergeAuthoringPreferences(resolved, projectOverride);
      sourceOrder.push("project");
    }
  }

  const cliOverride = normalizeOverride(options.cliOverride);
  if (cliOverride) {
    resolved = mergeAuthoringPreferences(resolved, cliOverride);
    sourceOrder.push("cli");
  }

  return {
    preferences: resolved,
    sourceOrder
  };
}

function resolvePreferenceTargetPath(options: UpdateAuthoringPreferencesOptions) {
  if (options.scope === "repo") {
    return options.repoPreferencesPath ?? repoAuthoringPreferencesPath;
  }

  if (!options.projectSlug) {
    throw new Error("projectSlug is required when updating project authoring preferences.");
  }

  return options.projectPreferencesPath ?? getProjectPaths(options.projectSlug).authoringPreferencesPath;
}

export async function updateAuthoringPreferences(options: UpdateAuthoringPreferencesOptions) {
  const targetPath = resolvePreferenceTargetPath(options);
  const current = mergeAuthoringPreferences(
    getDefaultAuthoringPreferences(),
    (await readOptionalAuthoringPreferences(targetPath)) ?? undefined
  );
  const updated = options.update(current);
  await writeJsonFile(targetPath, updated);
  return {
    path: targetPath,
    preferences: updated
  };
}
