import type { IntelligencePolicy } from "../../types.js";

import { rankRelevantMemoryForProject } from "../../memory-ledger.js";

export async function getRelevantMemoryForProject(projectSlug: string, policy: IntelligencePolicy, limit = 5) {
  if (!policy.applyMemoryLedgerToPromptPack && !policy.applyMemoryLedgerToRecommendations) {
    return [];
  }

  return rankRelevantMemoryForProject(projectSlug, limit);
}
