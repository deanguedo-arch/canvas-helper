import assert from "node:assert/strict";
import test from "node:test";

import { parseArgs } from "../lib/cli.js";
import { MODE_PRESETS } from "../lib/intelligence/config/defaults.js";
import { readCliIntelligenceOverride } from "../lib/intelligence/config/policy.js";

test("mode presets separate collection from application", () => {
  assert.deepEqual(MODE_PRESETS["collect-only"], {
    collectPatternBank: true,
    collectMemoryLedger: true,
    applyPatternBankToPromptPack: false,
    applyMemoryLedgerToPromptPack: false,
    applyMemoryLedgerToRecommendations: false
  });

  assert.deepEqual(MODE_PRESETS.advisory, {
    collectPatternBank: true,
    collectMemoryLedger: true,
    applyPatternBankToPromptPack: false,
    applyMemoryLedgerToPromptPack: false,
    applyMemoryLedgerToRecommendations: false
  });

  assert.deepEqual(MODE_PRESETS.active, {
    collectPatternBank: true,
    collectMemoryLedger: true,
    applyPatternBankToPromptPack: true,
    applyMemoryLedgerToPromptPack: true,
    applyMemoryLedgerToRecommendations: true
  });
});

test("cli flags override intelligence policy values explicitly", () => {
  const parsedArgs = parseArgs([
    "--intelligence-mode",
    "active",
    "--apply-memory-ledger-to-recommendations=false",
    "--collect-pattern-bank=false",
    "--collect-memory-ledger=true"
  ]);

  assert.deepEqual(readCliIntelligenceOverride(parsedArgs), {
    mode: "active",
    collectPatternBank: false,
    collectMemoryLedger: true,
    applyMemoryLedgerToRecommendations: false
  });
});
