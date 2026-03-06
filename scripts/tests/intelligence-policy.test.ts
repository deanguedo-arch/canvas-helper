import assert from "node:assert/strict";
import test from "node:test";

import { parseArgs } from "../lib/cli.js";
import { MODE_PRESETS } from "../lib/intelligence/config/defaults.js";
import { readCliIntelligenceOverride, resolveIntelligencePolicy } from "../lib/intelligence/config/policy.js";
import { parseLearnerMode, resolveLearnerMode } from "../lib/intelligence/config/learner-mode.js";

test("mode presets separate collection from application", () => {
  assert.deepEqual(MODE_PRESETS.off, {
    collectPatternBank: false,
    collectMemoryLedger: false,
    applyPatternBankToPromptPack: false,
    applyMemoryLedgerToPromptPack: false,
    applyMemoryLedgerToRecommendations: false
  });

  assert.deepEqual(MODE_PRESETS.collect, {
    collectPatternBank: true,
    collectMemoryLedger: true,
    applyPatternBankToPromptPack: false,
    applyMemoryLedgerToPromptPack: false,
    applyMemoryLedgerToRecommendations: false
  });

  assert.deepEqual(MODE_PRESETS.apply, {
    collectPatternBank: true,
    collectMemoryLedger: true,
    applyPatternBankToPromptPack: true,
    applyMemoryLedgerToPromptPack: true,
    applyMemoryLedgerToRecommendations: true
  });
});

test("cli flags override intelligence policy values explicitly", () => {
  const parsedArgs = parseArgs([
    "--learner-mode",
    "apply",
    "--apply-memory-ledger-to-recommendations=false",
    "--collect-pattern-bank=false",
    "--collect-memory-ledger=true"
  ]);

  assert.deepEqual(readCliIntelligenceOverride(parsedArgs), {
    mode: "apply",
    collectPatternBank: false,
    collectMemoryLedger: true,
    applyMemoryLedgerToRecommendations: false
  });
});

test("resolveIntelligencePolicy enforces mode semantics", async () => {
  const collectPolicy = await resolveIntelligencePolicy(undefined, { mode: "collect" });
  assert.equal(collectPolicy.mode, "collect");
  assert.equal(collectPolicy.collectPatternBank, true);
  assert.equal(collectPolicy.collectMemoryLedger, true);
  assert.equal(collectPolicy.applyPatternBankToPromptPack, false);
  assert.equal(collectPolicy.applyMemoryLedgerToPromptPack, false);
  assert.equal(collectPolicy.applyMemoryLedgerToRecommendations, false);

  const applyPolicy = await resolveIntelligencePolicy(undefined, { mode: "apply" });
  assert.equal(applyPolicy.mode, "apply");
  assert.equal(applyPolicy.applyPatternBankToPromptPack, true);
  assert.equal(applyPolicy.applyMemoryLedgerToPromptPack, true);
  assert.equal(applyPolicy.applyMemoryLedgerToRecommendations, true);
});

test("learner mode precedence is CLI > env > project > repo > default", () => {
  assert.deepEqual(resolveLearnerMode({
    cliMode: "apply",
    envMode: "off",
    projectMode: "collect",
    repoMode: "off",
    defaultMode: "off"
  }), {
    mode: "apply",
    source: "cli"
  });

  assert.deepEqual(resolveLearnerMode({
    envMode: "apply",
    projectMode: "collect",
    repoMode: "off",
    defaultMode: "off"
  }), {
    mode: "apply",
    source: "env"
  });
});

test("invalid learner mode values fail loudly", () => {
  assert.throws(() => parseLearnerMode("invalid-mode"), /Expected off, collect, or apply/);
});
