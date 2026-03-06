import { updateProjectManifest } from "./projects.js";
import { resolveIntelligencePolicy } from "./intelligence/config/policy.js";
import { refreshMemoryLedger } from "./intelligence/collect/memory-ledger.js";
import { learnProjectPatterns, rebuildPatternBankIndex } from "./intelligence/collect/pattern-bank.js";
import { generatePromptPack } from "./intelligence/apply/prompt-pack.js";
import type { IntelligencePolicyOverride, MemoryOriginCommand } from "./types.js";

export type RefreshProjectIntelligenceOptions = {
  markWorkspaceApproved?: boolean;
  command?: MemoryOriginCommand;
  policyOverride?: IntelligencePolicyOverride;
};

export async function refreshProjectIntelligence(
  projectSlug: string,
  options: RefreshProjectIntelligenceOptions = {}
) {
  const policy = await resolveIntelligencePolicy(projectSlug, options.policyOverride);
  const updatedAt = new Date().toISOString();

  await updateProjectManifest(projectSlug, (manifest) => ({
    ...manifest,
    learningSource: manifest.learningSource === "gemini" ? "gemini" : "other",
    learningTrust: manifest.learningTrust === "curated" ? "curated" : "auto",
    learningUpdatedAt: updatedAt,
    workspaceApprovedAt: options.markWorkspaceApproved ? updatedAt : manifest.workspaceApprovedAt,
    updatedAt
  }));

  const learned = policy.collectPatternBank ? await learnProjectPatterns(projectSlug) : null;

  if (policy.collectMemoryLedger && learned) {
    await refreshMemoryLedger({
      patternRecord: learned.record,
      command: options.command ?? (options.markWorkspaceApproved ? "analyze" : "import"),
      observedAt: updatedAt
    });
  }

  const library = policy.collectPatternBank ? await rebuildPatternBankIndex() : { index: { records: [] as unknown[] } };
  const promptPack = await generatePromptPack(projectSlug, policy);

  return {
    learnedProfilePath: learned?.outputPath ?? null,
    promptPackPath: promptPack.outputPath,
    indexedReferences: promptPack.indexedReferenceCount,
    patternMatches: promptPack.patternMatchCount,
    libraryRecordCount: library.index.records.length,
    policy
  };
}

export { readCliIntelligenceOverride } from "./intelligence/config/policy.js";
