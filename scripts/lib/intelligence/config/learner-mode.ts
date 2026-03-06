import { fileExists, readJsonFile } from "../../fs.js";
import { getProjectPaths, legacyRepoIntelligencePolicyPath, repoIntelligencePolicyPath } from "../../paths.js";

export type LearnerMode = "off" | "collect" | "apply";

export type LearnerModeSource = "cli" | "env" | "project" | "repo" | "default";

export type LearnerModeResolution = {
  mode: LearnerMode;
  source: LearnerModeSource;
};

const modeAliases: Record<string, LearnerMode> = {
  off: "off",
  collect: "collect",
  apply: "apply"
};

function normalizeLearnerModeValue(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  return modeAliases[value.trim().toLowerCase()];
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

export function parseLearnerMode(value: unknown, source = "learner mode") {
  const mode = normalizeLearnerModeValue(value);
  if (mode) {
    return mode;
  }

  throw new Error(`Invalid ${source}: ${JSON.stringify(value)}. Expected off, collect, or apply.`);
}

export function parseLearnerModeOptional(value: unknown) {
  return normalizeLearnerModeValue(value);
}

async function readLearnerModeFromJsonPath(jsonPath: string, source: string): Promise<LearnerMode | undefined> {
  if (!(await fileExists(jsonPath))) {
    return undefined;
  }

  const raw = asObject(await readJsonFile<unknown>(jsonPath));
  if (!raw) {
    return undefined;
  }

  const legacyMode = raw.mode;
  if (legacyMode !== undefined) {
    return parseLearnerMode(legacyMode, source);
  }

  const manifestMode = raw.learnerMode;
  if (manifestMode !== undefined) {
    return parseLearnerMode(manifestMode, source);
  }

  return undefined;
}

export async function readProjectLearnerMode(projectSlug: string): Promise<LearnerMode | undefined> {
  const paths = getProjectPaths(projectSlug);

  const manifestMode = await readLearnerModeFromJsonPath(paths.manifestPath, `project ${projectSlug} learnerMode`);
  if (manifestMode !== undefined) {
    return manifestMode;
  }

  return readLearnerModeFromJsonPath(
    paths.intelligencePolicyPath,
    `project ${projectSlug} intelligence-policy mode`
  );
}

export function resolveLearnerMode(context: {
  cliMode?: unknown;
  envMode?: string;
  projectMode?: LearnerMode;
  repoMode?: LearnerMode;
  defaultMode?: LearnerMode;
}) {
  const { cliMode, envMode, projectMode, repoMode, defaultMode = "collect" } = context;

  if (cliMode !== undefined) {
    const mode = parseLearnerMode(cliMode, "--learner-mode flag");
    return { mode, source: "cli" as const };
  }

  if (envMode !== undefined) {
    const mode = parseLearnerMode(envMode, "LEARNER_MODE environment variable");
    return { mode, source: "env" as const };
  }

  if (projectMode !== undefined) {
    return { mode: projectMode, source: "project" as const };
  }

  if (repoMode !== undefined) {
    return { mode: repoMode, source: "repo" as const };
  }

  return { mode: defaultMode, source: "default" as const };
}

export function isLearnerCollectEnabled(mode: LearnerMode) {
  return mode === "collect" || mode === "apply";
}

export function isLearnerApplyEnabled(mode: LearnerMode) {
  return mode === "apply";
}

async function readRepoLearnerModeFromPath(path: string): Promise<LearnerMode | undefined> {
  return readLearnerModeFromJsonPath(path, `repo intelligence mode (${path})`);
}

export async function readRepoLearnerMode() {
  const primaryMode = await readRepoLearnerModeFromPath(repoIntelligencePolicyPath);
  if (primaryMode) {
    return primaryMode;
  }

  return readRepoLearnerModeFromPath(legacyRepoIntelligencePolicyPath);
}
