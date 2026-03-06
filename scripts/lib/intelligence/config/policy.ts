import { fileExists, readJsonFile } from "../../fs.js";
import { getStringFlag, type ParsedArgs } from "../../cli.js";
import { getProjectPaths, repoIntelligencePolicyPath } from "../../paths.js";
import type {
  IntelligenceMode,
  IntelligencePolicy,
  IntelligencePolicyFlags,
  IntelligencePolicyOverride
} from "../../types.js";

import { DEFAULT_INTELLIGENCE_MODE, MODE_PRESETS } from "./defaults.js";

function isIntelligenceMode(value: string | undefined): value is IntelligenceMode {
  return value === "collect-only" || value === "advisory" || value === "active";
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

function sanitizeOverride(value: unknown): IntelligencePolicyOverride {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const input = value as Record<string, unknown>;
  const mode = typeof input.mode === "string" && isIntelligenceMode(input.mode) ? input.mode : undefined;
  const override: IntelligencePolicyOverride = {};

  if (mode) {
    override.mode = mode;
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
  currentPolicy: IntelligencePolicyFlags & { mode: IntelligenceMode },
  override: IntelligencePolicyOverride
) {
  const base = override.mode ? { mode: override.mode, ...MODE_PRESETS[override.mode] } : currentPolicy;
  return {
    ...base,
    collectPatternBank: override.collectPatternBank ?? base.collectPatternBank,
    collectMemoryLedger: override.collectMemoryLedger ?? base.collectMemoryLedger,
    applyPatternBankToPromptPack: override.applyPatternBankToPromptPack ?? base.applyPatternBankToPromptPack,
    applyMemoryLedgerToPromptPack: override.applyMemoryLedgerToPromptPack ?? base.applyMemoryLedgerToPromptPack,
    applyMemoryLedgerToRecommendations:
      override.applyMemoryLedgerToRecommendations ?? base.applyMemoryLedgerToRecommendations
  };
}

export function readCliIntelligenceOverride(parsedArgs: ParsedArgs): IntelligencePolicyOverride {
  const modeFlag = getStringFlag(parsedArgs, "intelligence-mode");

  return sanitizeOverride({
    mode: isIntelligenceMode(modeFlag) ? modeFlag : undefined,
    collectPatternBank: parseBooleanFlag(parsedArgs.flags["collect-pattern-bank"]),
    collectMemoryLedger: parseBooleanFlag(parsedArgs.flags["collect-memory-ledger"]),
    applyPatternBankToPromptPack: parseBooleanFlag(parsedArgs.flags["apply-pattern-bank-to-prompt-pack"]),
    applyMemoryLedgerToPromptPack: parseBooleanFlag(parsedArgs.flags["apply-memory-ledger-to-prompt-pack"]),
    applyMemoryLedgerToRecommendations: parseBooleanFlag(parsedArgs.flags["apply-memory-ledger-to-recommendations"])
  });
}

async function readOverrideFile(filePath: string) {
  if (!(await fileExists(filePath))) {
    return {};
  }

  return sanitizeOverride(await readJsonFile(filePath));
}

export async function resolveIntelligencePolicy(
  projectSlug?: string,
  cliOverride: IntelligencePolicyOverride = {}
): Promise<IntelligencePolicy> {
  let policy = {
    mode: DEFAULT_INTELLIGENCE_MODE,
    ...MODE_PRESETS[DEFAULT_INTELLIGENCE_MODE]
  };
  let source: IntelligencePolicy["source"] = "repo-default";

  const repoOverride = await readOverrideFile(repoIntelligencePolicyPath);
  if (Object.keys(repoOverride).length > 0) {
    policy = applyOverride(policy, repoOverride);
  }

  if (projectSlug) {
    const projectOverride = await readOverrideFile(getProjectPaths(projectSlug).intelligencePolicyPath);
    if (Object.keys(projectOverride).length > 0) {
      policy = applyOverride(policy, projectOverride);
      source = "project-override";
    }
  }

  if (Object.keys(cliOverride).length > 0) {
    policy = applyOverride(policy, cliOverride);
    source = "cli-override";
  }

  return {
    ...policy,
    source
  };
}
