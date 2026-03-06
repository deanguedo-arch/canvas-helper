import assert from "node:assert/strict";
import path from "node:path";

import {
  inferLearningSourceFromInputPath,
  resolveLearningSourceOverride
} from "../lib/importer.js";
import {
  calculatePatternMatchForRecords,
  rankPatternMatchesForRecord,
  type ProjectPatternRecord
} from "../lib/pattern-bank.js";
import { projectsRoot } from "../lib/paths.js";

function makeRecord(
  projectSlug: string,
  overrides: Partial<ProjectPatternRecord> = {}
): ProjectPatternRecord {
  return {
    schemaVersion: 2,
    source: "auto",
    projectSlug,
    generatedAt: "2026-03-05T00:00:00.000Z",
    sectionLabels: [],
    headingKeywords: [],
    styleTokens: [],
    hexColors: [],
    externalDependencies: [],
    referenceKinds: [],
    referenceCount: 0,
    trust: "auto",
    learningSource: "other",
    workspaceSignalStrength: 0,
    lastApprovedAt: "2026-03-05T00:00:00.000Z",
    learningUpdatedAt: "2026-03-05T00:00:00.000Z",
    recencyWeight: 0,
    workspaceApprovalActive: false,
    signalVectors: {
      raw: {
        headingKeywords: [],
        styleTokens: [],
        hexColors: [],
        externalDependencies: []
      },
      workspace: {
        headingKeywords: [],
        styleTokens: [],
        hexColors: [],
        externalDependencies: []
      }
    },
    ...overrides
  };
}

function run() {
  const geminiPath = path.join(projectsRoot, "incoming", "gemini", "biology-module");
  const otherPath = path.join(projectsRoot, "incoming", "biology-module");

  assert.equal(inferLearningSourceFromInputPath(geminiPath), "other");
  assert.equal(inferLearningSourceFromInputPath(otherPath), "other");
  assert.equal(resolveLearningSourceOverride("gemini"), "gemini");
  assert.equal(resolveLearningSourceOverride("other"), "other");
  assert.equal(resolveLearningSourceOverride(undefined), undefined);
  assert.throws(() => resolveLearningSourceOverride("invalid"), /Invalid --source/);

  const current = makeRecord("current", {
    sectionLabels: ["Intro"],
    headingKeywords: ["budget", "planning", "goals"],
    styleTokens: ["bg-slate-100", "rounded-xl"],
    hexColors: ["#ffffff"],
    externalDependencies: ["https://cdn.example.com/runtime.js"],
    referenceKinds: ["pdf"]
  });

  const styleOnly = makeRecord("style-only", {
    styleTokens: ["bg-slate-100", "rounded-xl"]
  });
  assert.equal(calculatePatternMatchForRecords(current, styleOnly), null);

  const autoBalanced = makeRecord("auto-balanced", {
    sectionLabels: ["Intro"],
    headingKeywords: ["budget", "planning"],
    styleTokens: ["bg-slate-100"],
    hexColors: ["#ffffff"],
    externalDependencies: ["https://cdn.example.com/runtime.js"],
    referenceKinds: ["pdf"],
    recencyWeight: 3,
    workspaceSignalStrength: 12,
    workspaceApprovalActive: true
  });

  const curatedBalanced = makeRecord("curated-balanced", {
    source: "curated",
    trust: "curated",
    sectionLabels: ["Intro"],
    headingKeywords: ["budget", "planning"],
    styleTokens: ["bg-slate-100"],
    hexColors: ["#ffffff"],
    externalDependencies: ["https://cdn.example.com/runtime.js"],
    referenceKinds: ["pdf"],
    recencyWeight: 3,
    workspaceSignalStrength: 12,
    workspaceApprovalActive: true
  });

  const autoMatch = calculatePatternMatchForRecords(current, autoBalanced);
  assert.ok(autoMatch);
  assert.equal(autoMatch.scoreBreakdown.total, 31);

  const matches = rankPatternMatchesForRecord(current, [styleOnly, autoBalanced, curatedBalanced], 5);
  assert.equal(matches.length, 2);
  assert.equal(matches[0]?.projectSlug, "curated-balanced");
  assert.equal(matches[1]?.projectSlug, "auto-balanced");

  const olderAuto = makeRecord("auto-older", {
    sectionLabels: ["Intro"],
    headingKeywords: ["budget", "planning"],
    styleTokens: ["bg-slate-100"],
    hexColors: ["#ffffff"],
    externalDependencies: ["https://cdn.example.com/runtime.js"],
    referenceKinds: ["pdf"],
    recencyWeight: 3,
    workspaceSignalStrength: 12,
    workspaceApprovalActive: true,
    lastApprovedAt: "2026-03-01T00:00:00.000Z"
  });

  const newerAuto = makeRecord("auto-newer", {
    sectionLabels: ["Intro"],
    headingKeywords: ["budget", "planning"],
    styleTokens: ["bg-slate-100"],
    hexColors: ["#ffffff"],
    externalDependencies: ["https://cdn.example.com/runtime.js"],
    referenceKinds: ["pdf"],
    recencyWeight: 3,
    workspaceSignalStrength: 12,
    workspaceApprovalActive: true,
    lastApprovedAt: "2026-03-04T00:00:00.000Z"
  });

  const dateTieBreak = rankPatternMatchesForRecord(current, [olderAuto, newerAuto], 5);
  assert.equal(dateTieBreak[0]?.projectSlug, "auto-newer");
  assert.equal(dateTieBreak[1]?.projectSlug, "auto-older");
}

run();
console.log("learning-pipeline-check: ok");
