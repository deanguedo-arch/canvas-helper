import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import type { ProjectPatternRecord } from "../lib/pattern-bank.js";
import {
  deriveMemoryEntriesFromDesignDoc,
  deriveProjectMemoryEntries,
  rankRelevantMemoryEntries,
  refreshMemoryLedger
} from "../lib/memory-ledger.js";

function makeRecord(
  projectSlug: string,
  overrides: Partial<ProjectPatternRecord> = {}
): ProjectPatternRecord {
  return {
    schemaVersion: 2,
    source: "auto",
    projectSlug,
    generatedAt: "2026-03-05T00:00:00.000Z",
    sectionLabels: ["Knowledge Drop", "Hint Toggle"],
    headingKeywords: ["calm", "module", "reflection", "budgeting"],
    styleTokens: ["violet-700", "rounded-3xl", "slate-50"],
    hexColors: ["#8b5cf6", "#f8fafc"],
    externalDependencies: ["https://cdn.tailwindcss.com"],
    referenceKinds: ["pdf"],
    referenceCount: 1,
    trust: "curated",
    learningSource: "gemini",
    workspaceSignalStrength: 12,
    lastApprovedAt: "2026-03-05T00:00:00.000Z",
    learningUpdatedAt: "2026-03-05T00:00:00.000Z",
    recencyWeight: 6,
    workspaceApprovalActive: true,
    signalVectors: {
      raw: {
        headingKeywords: ["calm", "module"],
        styleTokens: ["violet-700"],
        hexColors: ["#8b5cf6"],
        externalDependencies: ["https://cdn.tailwindcss.com"]
      },
      workspace: {
        headingKeywords: ["reflection", "budgeting"],
        styleTokens: ["rounded-3xl", "slate-50"],
        hexColors: ["#f8fafc"],
        externalDependencies: ["https://cdn.tailwindcss.com"]
      }
    },
    ...overrides
  };
}

test("deriveProjectMemoryEntries creates durable style/tool/component/resource memory", () => {
  const entries = deriveProjectMemoryEntries(makeRecord("calmmodule2"), {
    command: "analyze",
    observedAt: "2026-03-05T12:00:00.000Z",
    approved: true
  });

  assert.equal(entries.length, 4);
  assert.deepEqual(
    entries.map((entry) => entry.key),
    [
      "component:calmmodule2",
      "resource:calmmodule2",
      "style:calmmodule2",
      "tool:calmmodule2"
    ]
  );
  assert.equal(entries[0]?.approved, true);
  assert.ok(entries[0]?.signals.sectionLabels.includes("Knowledge Drop"));
  assert.ok(entries[2]?.signals.styleTokens.includes("violet-700"));
  assert.ok(entries[3]?.signals.externalDependencies.includes("https://cdn.tailwindcss.com"));
});

test("deriveMemoryEntriesFromDesignDoc produces approved decision memory", () => {
  const entries = deriveMemoryEntriesFromDesignDoc(
    path.join("docs", "plans", "2026-03-05-studio-glass-design.md"),
    `# Studio Glass Design\n\n- Apple-like glass shell\n- Minimal chrome\n- Inline PDF preview\n`,
    "2026-03-05T12:30:00.000Z"
  );

  assert.equal(entries.length, 1);
  assert.equal(entries[0]?.kind, "decision");
  assert.equal(entries[0]?.approved, true);
  assert.equal(entries[0]?.key, "decision:2026-03-05-studio-glass-design");
  assert.ok(entries[0]?.signals.keywords.includes("glass"));
  assert.ok(entries[0]?.signals.keywords.includes("minimal"));
});

test("refreshMemoryLedger reinforces repeated observations and ranks relevant entries", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "memory-ledger-"));
  const ledgerPath = path.join(tempDir, "memory-ledger.json");
  const designDocsDir = path.join(tempDir, "plans");

  try {
    const currentRecord = makeRecord("calmmodule2");
    const unrelatedRecord = makeRecord("biologymodule", {
      sectionLabels: ["Lab Notes"],
      headingKeywords: ["biology", "enzyme", "cellular"],
      styleTokens: ["emerald-600"],
      externalDependencies: ["https://cdn.example.com/chart.js"],
      referenceKinds: ["docx"]
    });

    await refreshMemoryLedger({
      ledgerPath,
      designDocsDir,
      patternRecord: currentRecord,
      command: "analyze",
      observedAt: "2026-03-05T12:00:00.000Z"
    });

    await refreshMemoryLedger({
      ledgerPath,
      designDocsDir,
      patternRecord: currentRecord,
      command: "export",
      observedAt: "2026-03-05T13:00:00.000Z"
    });

    const unrelatedLedger = await refreshMemoryLedger({
      ledgerPath,
      designDocsDir,
      patternRecord: unrelatedRecord,
      command: "analyze",
      observedAt: "2026-03-05T14:00:00.000Z"
    });

    const styleEntry = unrelatedLedger.entries.find((entry) => entry.key === "style:calmmodule2");
    assert.ok(styleEntry);
    assert.equal(styleEntry.reinforcementCount, 2);
    assert.deepEqual(
      styleEntry.origins.map((origin) => origin.command),
      ["analyze", "export"]
    );

    const ranked = rankRelevantMemoryEntries(currentRecord, unrelatedLedger, 3);
    assert.equal(ranked.length, 3);
    assert.equal(ranked[0]?.key, "component:calmmodule2");
    assert.notEqual(ranked[0]?.projectSlugs[0], "biologymodule");

    const saved = JSON.parse(await readFile(ledgerPath, "utf8"));
    assert.equal(saved.schemaVersion, 1);
    assert.ok(saved.entries.length >= 8);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
