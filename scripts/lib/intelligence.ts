import { rebuildPatternBankIndex, learnProjectPatterns } from "./pattern-bank.js";
import { generatePromptPack } from "./prompt-pack.js";

export async function refreshProjectIntelligence(projectSlug: string) {
  const learned = await learnProjectPatterns(projectSlug);
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
