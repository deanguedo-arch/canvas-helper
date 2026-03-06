import { fileExists, readJsonFile } from "../../fs.js";
import { getProjectPaths, legacyRepoIntelligencePolicyPath, repoIntelligencePolicyPath } from "../../paths.js";

import {
  DEFAULT_INTELLIGENCE_MODE,
  MODE_PRESETS
} from "./defaults.js";
import {
  parseLearnerMode,
  readProjectLearnerMode,
  readRepoLearnerMode,
  resolveLearnerMode,
  type LearnerMode,
  type LearnerModeSource
} from "./learner-mode.js";
import { getStringFlag, type ParsedArgs } from "../../cli.js";
import type {
  IntelligencePolicy,
  IntelligencePolicyFlags,
  IntelligencePolicyOverride
} from "../../types.js";

function normalizeObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function parseBooleanFlag(value: string | boolean | undefined) {
  if (value === true) {
    return true;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "off"].includes(normalized)) {
    return false;
  }

  return undefined;
}

function normalizePolicySource(source: LearnerModeSource): IntelligencePolicy["source"] {
  if (source === "cli") {
    return "cli-override";
  }

  if (source === "env") {
    return "env-override";
  }

  if (source === "project") {
    return "project-override";
  }

  if (source === "repo") {
    return "repo-default";
  }

  return "default";
}

function withoutMode<T extends IntelligencePolicyOverride>(override: T): Omit<T, "mode"> {
  const { mode: _mode, ...rest } = override;
  return rest as Omit<T, "mode">;
}

function sanitizeOverride(value: unknown): IntelligencePolicyOverride {
  const input = normalizeObject(value);
  if (!input) {
    return {};
  }

  const override: IntelligencePolicyOverride = {};

  if (input.mode !== undefined) {
    override.mode = parseLearnerMode(input.mode, "intelligence policy mode");
  }

  if (typeof input.collectPatternBank === "boolean") {
    override.collectPatternBank = input.collectPatternBank;
  }

  if (typeof input.collectMemoryLedger === "boolean") {
    override.collectMemoryLedger = input.collectMemoryLedger;
  }

  if (typeof input.applyPatternBankToPromptPack === "boolean") {
    override.applyPatternBankToPromptPack = input.applyPatternBankToPromptPack;
  }

  if (typeof input.applyMemoryLedgerToPromptPack === "boolean") {
    override.applyMemoryLedgerToPromptPack = input.applyMemoryLedgerToPromptPack;
  }

  if (typeof input.applyMemoryLedgerToRecommendations === "boolean") {
    override.applyMemoryLedgerToRecommendations = input.applyMemoryLedgerToRecommendations;
  }

  return override;
}

function applyOverride(
  currentPolicy: IntelligencePolicyFlags & { mode: LearnerMode },
  override: IntelligencePolicyOverride
): IntelligencePolicyFlags & { mode: LearnerMode } {
  const nextPolicy = override.mode
    ? { mode: override.mode, ...MODE_PRESETS[override.mode] }
    : currentPolicy;

  return {
    ...nextPolicy,
    collectPatternBank: override.collectPatternBank ?? nextPolicy.collectPatternBank,
    collectMemoryLedger: override.collectMemoryLedger ?? nextPolicy.collectMemoryLedger,
    applyPatternBankToPromptPack: override.applyPatternBankToPromptPack ?? nextPolicy.applyPatternBankToPromptPack,
    applyMemoryLedgerToPromptPack: override.applyMemoryLedgerToPromptPack ?? nextPolicy.applyMemoryLedgerToPromptPack,
    applyMemoryLedgerToRecommendations:
      override.applyMemoryLedgerToRecommendations ?? nextPolicy.applyMemoryLedgerToRecommendations
  };
}

function enforceModeSemantics(policy: IntelligencePolicyFlags & { mode: LearnerMode }) {
  const collectEnabled = policy.mode === "collect" || policy.mode === "apply";
  const applyEnabled = policy.mode === "apply";

  return {
    ...policy,
    collectPatternBank: collectEnabled,
    collectMemoryLedger: collectEnabled,
    applyPatternBankToPromptPack: applyEnabled,
    applyMemoryLedgerToPromptPack: applyEnabled,
    applyMemoryLedgerToRecommendations: applyEnabled
  };
}

function hasKeys(value: IntelligencePolicyOverride) {
  return Object.keys(value).length > 0;
}

async function readOptionalJson<T>(filePath: string) {
  if (!(await fileExists(filePath))) {
    return null;
  }

  return readJsonFile<T>(filePath);
}

async function readPolicyOverride(filePath: string): Promise<IntelligencePolicyOverride> {
  const data = await readOptionalJson<unknown>(filePath);
  if (!data) {
    return {};
  }

  return sanitizeOverride(data);
}

async function readRepoPolicyOverride(): Promise<IntelligencePolicyOverride> {
  const primary = await readPolicyOverride(repoIntelligencePolicyPath);
  if (hasKeys(primary)) {
    return primary;
  }

  return readPolicyOverride(legacyRepoIntelligencePolicyPath);
}

async function readProjectPolicyOverride(projectSlug: string): Promise<IntelligencePolicyOverride> {
  const projectPolicyPath = getProjectPaths(projectSlug).intelligencePolicyPath;
  return readPolicyOverride(projectPolicyPath);
}

export function readCliIntelligenceOverride(parsedArgs: ParsedArgs): IntelligencePolicyOverride {
  const learnerModeFlag = getStringFlag(parsedArgs, "learner-mode");
  const legacyModeFlag = getStringFlag(parsedArgs, "intelligence-mode");
  const mode = learnerModeFlag
    ? parseLearnerMode(learnerModeFlag, "--learner-mode flag")
    : legacyModeFlag
      ? parseLearnerMode(legacyModeFlag, "--intelligence-mode flag")
      : undefined;

  return sanitizeOverride({
    mode,
    collectPatternBank: parseBooleanFlag(parsedArgs.flags["collect-pattern-bank"]),
    collectMemoryLedger: parseBooleanFlag(parsedArgs.flags["collect-memory-ledger"]),
    applyPatternBankToPromptPack: parseBooleanFlag(parsedArgs.flags["apply-pattern-bank-to-prompt-pack"]),
    applyMemoryLedgerToPromptPack: parseBooleanFlag(parsedArgs.flags["apply-memory-ledger-to-prompt-pack"]),
    applyMemoryLedgerToRecommendations: parseBooleanFlag(parsedArgs.flags["apply-memory-ledger-to-recommendations"])
  });
}

export async function resolveIntelligencePolicy(
  projectSlug?: string,
  cliOverride: IntelligencePolicyOverride = {}
): Promise<IntelligencePolicy> {
  const projectMode = projectSlug ? await readProjectLearnerMode(projectSlug) : undefined;
  const repoMode = await readRepoLearnerMode();
  const resolved = resolveLearnerMode({
    cliMode: cliOverride.mode,
    envMode: process.env.LEARNER_MODE,
    projectMode,
    repoMode,
    defaultMode: DEFAULT_INTELLIGENCE_MODE
  });

  let policy: IntelligencePolicyFlags & { mode: LearnerMode; source: IntelligencePolicy["source"] } = {
    mode: resolved.mode,
    ...MODE_PRESETS[resolved.mode],
    source: normalizePolicySource(resolved.source)
  };

  const repoOverride = await readRepoPolicyOverride();
  if (hasKeys(repoOverride)) {
    policy = {
      ...(policy as IntelligencePolicy),
      ...applyOverride(policy, withoutMode(repoOverride)),
      source: policy.source
    };
  }

  if (projectSlug) {
    const projectOverride = await readProjectPolicyOverride(projectSlug);
    if (hasKeys(projectOverride)) {
      policy = {
        ...(policy as IntelligencePolicy),
        ...applyOverride(policy, withoutMode(projectOverride)),
        source: policy.source
      };
    }
  }

  if (hasKeys(cliOverride)) {
    policy = {
      ...(policy as IntelligencePolicy),
      ...applyOverride(policy, withoutMode(cliOverride)),
      source: normalizePolicySource(resolved.source)
    };
  }

  const enforced = enforceModeSemantics(policy);
  return {
    ...enforced,
    source: policy.source
  };
}
