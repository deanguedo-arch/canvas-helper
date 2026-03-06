import type { IntelligenceMode, IntelligencePolicyFlags } from "../../types.js";

export const DEFAULT_INTELLIGENCE_MODE: IntelligenceMode = "active";

export const MODE_PRESETS: Record<IntelligenceMode, IntelligencePolicyFlags> = {
  "collect-only": {
    collectPatternBank: true,
    collectMemoryLedger: true,
    applyPatternBankToPromptPack: false,
    applyMemoryLedgerToPromptPack: false,
    applyMemoryLedgerToRecommendations: false
  },
  advisory: {
    collectPatternBank: true,
    collectMemoryLedger: true,
    applyPatternBankToPromptPack: false,
    applyMemoryLedgerToPromptPack: false,
    applyMemoryLedgerToRecommendations: false
  },
  active: {
    collectPatternBank: true,
    collectMemoryLedger: true,
    applyPatternBankToPromptPack: true,
    applyMemoryLedgerToPromptPack: true,
    applyMemoryLedgerToRecommendations: true
  }
};
