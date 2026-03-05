import { refreshMemoryLedger } from "./memory-ledger.js";
import { rebuildPatternBankIndex, learnProjectPatterns } from "./pattern-bank.js";
import { generatePromptPack } from "./prompt-pack.js";
import { updateProjectManifest } from "./projects.js";
import type { MemoryOriginCommand } from "./types.js";

export type RefreshProjectIntelligenceOptions = {
  markWorkspaceApproved?: boolean;
  command?: MemoryOriginCommand;
};

export async function refreshProjectIntelligence(
  projectSlug: string,
  options: RefreshProjectIntelligenceOptions = {}
) {
  const updatedAt = new Date().toISOString();
  await updateProjectManifest(projectSlug, (manifest) => ({
    ...manifest,
    learningSource: manifest.learningSource === "gemini" ? "gemini" : "other",
    learningTrust: manifest.learningTrust === "curated" ? "curated" : "auto",
    learningUpdatedAt: updatedAt,
    workspaceApprovedAt: options.markWorkspaceApproved ? updatedAt : manifest.workspaceApprovedAt,
    updatedAt: updatedAt
  }));

  const learned = await learnProjectPatterns(projectSlug);
  await refreshMemoryLedger({
    patternRecord: learned.record,
    command: options.command ?? (options.markWorkspaceApproved ? "analyze" : "import"),
    observedAt: updatedAt
  });
  const library = await rebuildPatternBankIndex();
  const promptPack = await generatePromptPack(projectSlug);

  return {
    learnedProfilePath: learned.outputPath,
    promptPackPath: promptPack.outputPath,
    indexedReferences: promptPack.indexedReferenceCount,
    patternMatches: promptPack.patternMatchCount,
    libraryRecordCount: library.index.records.length
  };
}
