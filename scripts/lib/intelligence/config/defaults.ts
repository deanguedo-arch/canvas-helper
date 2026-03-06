import type { IntelligenceMode, IntelligencePolicyFlags } from "../../types.js";

export const DEFAULT_INTELLIGENCE_MODE: IntelligenceMode = "collect";

export const MODE_PRESETS: Record<IntelligenceMode, IntelligencePolicyFlags> = {
  off: {
    collectPatternBank: false,
    collectMemoryLedger: false,
    applyPatternBankToPromptPack: false,
    applyMemoryLedgerToPromptPack: false,
    applyMemoryLedgerToRecommendations: false
  },
  collect: {
    collectPatternBank: true,
    collectMemoryLedger: true,
    applyPatternBankToPromptPack: false,
    applyMemoryLedgerToPromptPack: false,
    applyMemoryLedgerToRecommendations: false
  },
  apply: {
    collectPatternBank: true,
    collectMemoryLedger: true,
    applyPatternBankToPromptPack: true,
    applyMemoryLedgerToPromptPack: true,
    applyMemoryLedgerToRecommendations: true
  }
};
