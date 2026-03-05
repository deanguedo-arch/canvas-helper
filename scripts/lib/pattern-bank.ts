import path from "node:path";
import { readdir, readFile } from "node:fs/promises";

import { ensureDir, fileExists, readJsonFile, writeJsonFile } from "./fs.js";
import { getProjectPaths, repoRoot } from "./paths.js";
import type {
  LearningSource,
  LearningTrust,
  ProjectManifest,
  ReferenceIndex,
  SectionMap
} from "./types.js";

export type PatternBankSource = "auto" | "curated";
export type PatternConfidence = "high" | "medium" | "low";

export type PatternSignalVector = {
  headingKeywords: string[];
  styleTokens: string[];
  hexColors: string[];
  externalDependencies: string[];
};

export type PatternSignalVectors = {
  raw: PatternSignalVector;
  workspace: PatternSignalVector;
};

export type ProjectPatternRecord = {
  schemaVersion: 2;
  source: PatternBankSource;
  projectSlug: string;
  projectId?: string;
  sourcePath?: string;
  generatedAt: string;
  sectionLabels: string[];
  headingKeywords: string[];
  styleTokens: string[];
  hexColors: string[];
  externalDependencies: string[];
  referenceKinds: string[];
  referenceCount: number;
  trust: LearningTrust;
  learningSource: LearningSource;
  workspaceSignalStrength: number;
  lastApprovedAt: string;
  learningUpdatedAt: string;
  recencyWeight: number;
  workspaceApprovalActive: boolean;
  signalVectors: PatternSignalVectors;
};

export type PatternBankIndexRecord = {
  source: PatternBankSource;
  trust: LearningTrust;
  learningSource: LearningSource;
  projectSlug: string;
  generatedAt: string;
  sectionCount: number;
  styleTokenCount: number;
  referenceCount: number;
  recencyWeight: number;
  workspaceSignalStrength: number;
};

export type PatternBankIndex = {
  schemaVersion: 2;
  generatedAt: string;
  records: PatternBankIndexRecord[];
};

export type PatternScoreBreakdown = {
  sections: number;
  keywords: number;
  referenceKinds: number;
  styleTokens: number;
  hexColors: number;
  dependencies: number;
  curatedBonus: number;
  recencyBonus: number;
  workspaceApprovalBonus: number;
  total: number;
};

export type PatternMatch = {
  projectSlug: string;
  source: PatternBankSource;
  trust: LearningTrust;
  score: number;
  confidence: PatternConfidence;
  lastApprovedAt: string;
  scoreBreakdown: PatternScoreBreakdown;
  overlap: {
    sectionLabels: string[];
    styleTokens: string[];
    headingKeywords: string[];
    referenceKinds: string[];
    hexColors: string[];
    externalDependencies: string[];
  };
};

type UnnormalizedPatternRecord = Partial<ProjectPatternRecord> & {
  schemaVersion?: number;
  source?: PatternBankSource;
  projectSlug?: string;
};

const patternBankRoot = path.join(repoRoot, ".runtime", "pattern-bank");
const autoPatternRoot = path.join(patternBankRoot, "auto");
const curatedPatternRoot = path.join(patternBankRoot, "curated");
const indexPath = path.join(patternBankRoot, "index.json");

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeToken(value: string) {
  return value.trim().toLowerCase();
}

function normalizeLearningSource(value: string | undefined): LearningSource {
  return value === "gemini" ? "gemini" : "other";
}

function normalizeLearningTrust(value: string | undefined, source: PatternBankSource): LearningTrust {
  if (value === "curated" || value === "auto") {
    return value;
  }
  return source === "curated" ? "curated" : "auto";
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }
  return uniqueSorted(value.filter((entry): entry is string => typeof entry === "string"));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function createEmptySignalVector(): PatternSignalVector {
  return {
    headingKeywords: [],
    styleTokens: [],
    hexColors: [],
    externalDependencies: []
  };
}

function normalizeSignalVector(value: unknown): PatternSignalVector {
  if (!isRecord(value)) {
    return createEmptySignalVector();
  }

  return {
    headingKeywords: asStringArray(value.headingKeywords),
    styleTokens: asStringArray(value.styleTokens),
    hexColors: asStringArray(value.hexColors),
    externalDependencies: asStringArray(value.externalDependencies)
  };
}

function normalizeSignalVectors(
  value: unknown,
  fallbackWorkspaceSignals: Pick<PatternSignalVector, "headingKeywords" | "styleTokens" | "hexColors" | "externalDependencies">
): PatternSignalVectors {
  if (!isRecord(value)) {
    return {
      raw: createEmptySignalVector(),
      workspace: {
        headingKeywords: fallbackWorkspaceSignals.headingKeywords,
        styleTokens: fallbackWorkspaceSignals.styleTokens,
        hexColors: fallbackWorkspaceSignals.hexColors,
        externalDependencies: fallbackWorkspaceSignals.externalDependencies
      }
    };
  }

  const rawVector = normalizeSignalVector(value.raw);
  const workspaceVector = normalizeSignalVector(value.workspace);

  return {
    raw: rawVector,
    workspace: {
      headingKeywords: workspaceVector.headingKeywords.length
        ? workspaceVector.headingKeywords
        : fallbackWorkspaceSignals.headingKeywords,
      styleTokens: workspaceVector.styleTokens.length
        ? workspaceVector.styleTokens
        : fallbackWorkspaceSignals.styleTokens,
      hexColors: workspaceVector.hexColors.length
        ? workspaceVector.hexColors
        : fallbackWorkspaceSignals.hexColors,
      externalDependencies: workspaceVector.externalDependencies.length
        ? workspaceVector.externalDependencies
        : fallbackWorkspaceSignals.externalDependencies
    }
  };
}

function extractCsvLineValues(content: string, linePrefix: string) {
  const line = content
    .split(/\r?\n/)
    .find((entry) => entry.toLowerCase().startsWith(linePrefix.toLowerCase()));
  if (!line) {
    return [];
  }

  const separatorIndex = line.indexOf(":");
  const tail = separatorIndex >= 0 ? line.slice(separatorIndex + 1) : "";
  return uniqueSorted(
    tail
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean)
  );
}

function extractHexColors(content: string) {
  return uniqueSorted((content.match(/#[0-9a-fA-F]{3,8}/g) ?? []).map((value) => value.toLowerCase()));
}

function extractTailwindLikeTokens(content: string) {
  return uniqueSorted(content.match(/\b[a-z]+-(?:[1-9]00|50|950)\b/gi) ?? []);
}

function extractExternalDependencies(content: string) {
  const explicit = extractCsvLineValues(content, "- External dependencies preserved");
  const urls = content.match(/https?:\/\/[^\s,)]+/gi) ?? [];
  return uniqueSorted([...explicit, ...urls]);
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, " ");
}

function extractHeadingTextFromHtml(content: string) {
  const matches = [...content.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)];
  return uniqueSorted(
    matches
      .map((match) => stripTags(match[1] ?? ""))
      .map((entry) => entry.replace(/\s+/g, " ").trim())
      .filter(Boolean)
  );
}

function toKeywordList(values: string[]) {
  const keywords = values
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4);

  return uniqueSorted(keywords);
}

function intersectNormalized(left: string[], right: string[]) {
  const rightLookup = new Set(right.map((value) => normalizeToken(value)));
  return left.filter((value) => rightLookup.has(normalizeToken(value)));
}

async function readOptionalJson<T>(filePath: string) {
  if (!(await fileExists(filePath))) {
    return null;
  }

  return readJsonFile<T>(filePath);
}

async function readOptionalText(filePath: string) {
  if (!(await fileExists(filePath))) {
    return "";
  }

  return readFile(filePath, "utf8");
}

async function listPatternFiles(dirPath: string) {
  if (!(await fileExists(dirPath))) {
    return [] as string[];
  }

  const entries = await readdir(dirPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === ".json")
    .map((entry) => path.join(dirPath, entry.name))
    .sort((left, right) => left.localeCompare(right));
}

async function resolveWorkspaceScriptPath(workspaceDir: string) {
  const jsxPath = path.join(workspaceDir, "main.jsx");
  if (await fileExists(jsxPath)) {
    return jsxPath;
  }

  const jsPath = path.join(workspaceDir, "main.js");
  if (await fileExists(jsPath)) {
    return jsPath;
  }

  return undefined;
}

export function calculateRecencyWeight(lastApprovedAt: string, nowIso = new Date().toISOString()) {
  const lastTimestamp = Date.parse(lastApprovedAt);
  const nowTimestamp = Date.parse(nowIso);

  if (!Number.isFinite(lastTimestamp) || !Number.isFinite(nowTimestamp)) {
    return 0;
  }

  const days = Math.max(0, (nowTimestamp - lastTimestamp) / (1000 * 60 * 60 * 24));
  if (days <= 1) {
    return 6;
  }
  if (days <= 3) {
    return 5;
  }
  if (days <= 7) {
    return 4;
  }
  if (days <= 14) {
    return 3;
  }
  if (days <= 30) {
    return 2;
  }
  if (days <= 60) {
    return 1;
  }
  return 0;
}

function normalizePatternRecord(record: UnnormalizedPatternRecord, source: PatternBankSource): ProjectPatternRecord | null {
  if (!record.projectSlug) {
    return null;
  }

  const generatedAt = typeof record.generatedAt === "string" ? record.generatedAt : new Date().toISOString();
  const learningUpdatedAt =
    typeof record.learningUpdatedAt === "string" && record.learningUpdatedAt
      ? record.learningUpdatedAt
      : generatedAt;
  const lastApprovedAt =
    typeof record.lastApprovedAt === "string" && record.lastApprovedAt ? record.lastApprovedAt : learningUpdatedAt;

  const normalized = {
    schemaVersion: 2 as const,
    source,
    projectSlug: record.projectSlug,
    projectId: typeof record.projectId === "string" ? record.projectId : undefined,
    sourcePath: typeof record.sourcePath === "string" ? record.sourcePath : undefined,
    generatedAt,
    sectionLabels: asStringArray(record.sectionLabels),
    headingKeywords: asStringArray(record.headingKeywords),
    styleTokens: asStringArray(record.styleTokens),
    hexColors: asStringArray(record.hexColors),
    externalDependencies: asStringArray(record.externalDependencies),
    referenceKinds: asStringArray(record.referenceKinds),
    referenceCount: typeof record.referenceCount === "number" ? Math.max(0, Math.round(record.referenceCount)) : 0,
    trust: normalizeLearningTrust(record.trust, source),
    learningSource: normalizeLearningSource(record.learningSource),
    workspaceSignalStrength:
      typeof record.workspaceSignalStrength === "number" ? Math.max(0, record.workspaceSignalStrength) : 0,
    lastApprovedAt,
    learningUpdatedAt,
    recencyWeight:
      typeof record.recencyWeight === "number"
        ? clamp(Math.round(record.recencyWeight), 0, 6)
        : calculateRecencyWeight(lastApprovedAt),
    workspaceApprovalActive: Boolean(record.workspaceApprovalActive),
    signalVectors: normalizeSignalVectors(record.signalVectors, {
      headingKeywords: asStringArray(record.headingKeywords),
      styleTokens: asStringArray(record.styleTokens),
      hexColors: asStringArray(record.hexColors),
      externalDependencies: asStringArray(record.externalDependencies)
    })
  };

  return normalized;
}

async function readPatternRecords(source: PatternBankSource, dirPath: string) {
  const files = await listPatternFiles(dirPath);
  const records = await Promise.all(
    files.map(async (filePath) => {
      try {
        const record = await readJsonFile<UnnormalizedPatternRecord>(filePath);
        return normalizePatternRecord(record, source);
      } catch {
        return null;
      }
    })
  );

  return records.filter(Boolean) as ProjectPatternRecord[];
}

function scoreConfidence(score: number): PatternConfidence {
  if (score >= 40) {
    return "high";
  }
  if (score >= 24) {
    return "medium";
  }
  return "low";
}

function sortPatternMatches(left: PatternMatch, right: PatternMatch) {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  if (left.trust !== right.trust) {
    return left.trust === "curated" ? -1 : 1;
  }

  const leftTimestamp = Date.parse(left.lastApprovedAt);
  const rightTimestamp = Date.parse(right.lastApprovedAt);
  const leftEpoch = Number.isFinite(leftTimestamp) ? leftTimestamp : 0;
  const rightEpoch = Number.isFinite(rightTimestamp) ? rightTimestamp : 0;
  if (rightEpoch !== leftEpoch) {
    return rightEpoch - leftEpoch;
  }

  return left.projectSlug.localeCompare(right.projectSlug);
}

export function calculatePatternMatchForRecords(
  currentRecord: ProjectPatternRecord,
  candidateRecord: ProjectPatternRecord
): PatternMatch | null {
  const sharedSections = intersectNormalized(currentRecord.sectionLabels, candidateRecord.sectionLabels);
  const sharedKeywords = intersectNormalized(currentRecord.headingKeywords, candidateRecord.headingKeywords);
  const sharedReferenceKinds = intersectNormalized(currentRecord.referenceKinds, candidateRecord.referenceKinds);
  const sharedStyleTokens = intersectNormalized(currentRecord.styleTokens, candidateRecord.styleTokens);
  const sharedHexColors = intersectNormalized(currentRecord.hexColors, candidateRecord.hexColors);
  const sharedDependencies = intersectNormalized(
    currentRecord.externalDependencies,
    candidateRecord.externalDependencies
  );

  if (sharedSections.length === 0 && sharedReferenceKinds.length === 0) {
    return null;
  }

  const breakdown: PatternScoreBreakdown = {
    sections: sharedSections.length * 6,
    keywords: sharedKeywords.length * 2,
    referenceKinds: sharedReferenceKinds.length * 4,
    styleTokens: sharedStyleTokens.length * 3,
    hexColors: sharedHexColors.length,
    dependencies: sharedDependencies.length * 2,
    curatedBonus: candidateRecord.trust === "curated" ? 12 : 0,
    recencyBonus: clamp(Math.round(candidateRecord.recencyWeight), 0, 6),
    workspaceApprovalBonus:
      candidateRecord.workspaceApprovalActive && candidateRecord.workspaceSignalStrength > 0 ? 8 : 0,
    total: 0
  };

  breakdown.total =
    breakdown.sections +
    breakdown.keywords +
    breakdown.referenceKinds +
    breakdown.styleTokens +
    breakdown.hexColors +
    breakdown.dependencies +
    breakdown.curatedBonus +
    breakdown.recencyBonus +
    breakdown.workspaceApprovalBonus;

  if (breakdown.total < 12) {
    return null;
  }

  return {
    projectSlug: candidateRecord.projectSlug,
    source: candidateRecord.source,
    trust: candidateRecord.trust,
    score: breakdown.total,
    confidence: scoreConfidence(breakdown.total),
    lastApprovedAt: candidateRecord.lastApprovedAt,
    scoreBreakdown: breakdown,
    overlap: {
      sectionLabels: sharedSections,
      styleTokens: sharedStyleTokens,
      headingKeywords: sharedKeywords,
      referenceKinds: sharedReferenceKinds,
      hexColors: sharedHexColors,
      externalDependencies: sharedDependencies
    }
  };
}

export function rankPatternMatchesForRecord(
  currentRecord: ProjectPatternRecord,
  candidates: ProjectPatternRecord[],
  limit = 5
) {
  return candidates
    .map((candidate) => calculatePatternMatchForRecords(currentRecord, candidate))
    .filter((match): match is PatternMatch => !!match)
    .sort(sortPatternMatches)
    .slice(0, limit);
}

export async function learnProjectPatterns(projectSlug: string) {
  const paths = getProjectPaths(projectSlug);
  const workspaceScriptPath = await resolveWorkspaceScriptPath(paths.workspaceDir);

  const [manifest, sectionMap, styleGuide, referenceIndex, rawHtml, workspaceHtml, workspaceCss, workspaceScript] =
    await Promise.all([
      readOptionalJson<ProjectManifest>(paths.manifestPath),
      readOptionalJson<SectionMap>(paths.sectionMapPath),
      readOptionalText(paths.styleGuidePath),
      readOptionalJson<ReferenceIndex>(paths.referenceIndexPath),
      readOptionalText(paths.rawEntrypoint),
      readOptionalText(paths.workspaceEntrypoint),
      readOptionalText(path.join(paths.workspaceDir, "styles.css")),
      workspaceScriptPath ? readOptionalText(workspaceScriptPath) : Promise.resolve("")
    ]);

  const styleGuideText = styleGuide;
  const sectionLabels = uniqueSorted((sectionMap?.sections ?? []).map((section) => section.label));
  const sectionHeadings = uniqueSorted(
    (sectionMap?.sections ?? []).map((section) => section.headingText ?? "").filter(Boolean)
  );

  const rawHeadingKeywords = toKeywordList(extractHeadingTextFromHtml(rawHtml));
  const workspaceHeadingKeywords = toKeywordList([
    ...sectionLabels,
    ...sectionHeadings,
    ...extractHeadingTextFromHtml(workspaceHtml)
  ]);

  const rawSignals: PatternSignalVector = {
    headingKeywords: rawHeadingKeywords,
    styleTokens: extractTailwindLikeTokens(rawHtml),
    hexColors: extractHexColors(rawHtml),
    externalDependencies: extractExternalDependencies(rawHtml)
  };

  const workspaceCombinedSource = [styleGuideText, workspaceHtml, workspaceCss, workspaceScript].join("\n");
  const workspaceSignals: PatternSignalVector = {
    headingKeywords: workspaceHeadingKeywords,
    styleTokens: uniqueSorted([
      ...extractCsvLineValues(styleGuideText, "- Tailwind-style color tokens"),
      ...extractCsvLineValues(styleGuideText, "- Repeated shape tokens"),
      ...extractTailwindLikeTokens(workspaceCombinedSource)
    ]),
    hexColors: extractHexColors(workspaceCombinedSource),
    externalDependencies: extractExternalDependencies(workspaceCombinedSource)
  };

  const learningSource = normalizeLearningSource(manifest?.learningSource);
  const trust = normalizeLearningTrust(manifest?.learningTrust, "auto");
  const learningUpdatedAt = manifest?.learningUpdatedAt ?? manifest?.updatedAt ?? new Date().toISOString();
  const lastApprovedAt = manifest?.workspaceApprovedAt ?? learningUpdatedAt;
  const workspaceSignalStrength =
    workspaceSignals.headingKeywords.length +
    workspaceSignals.styleTokens.length +
    workspaceSignals.hexColors.length +
    workspaceSignals.externalDependencies.length +
    sectionLabels.length * 2;
  const workspaceApprovalActive = Boolean(
    manifest?.workspaceApprovedAt &&
      manifest.workspaceApprovedAt === learningUpdatedAt &&
      workspaceSignalStrength > 0
  );

  const record: ProjectPatternRecord = {
    schemaVersion: 2,
    source: "auto",
    projectSlug,
    projectId: manifest?.id,
    sourcePath: manifest?.sourcePath,
    generatedAt: new Date().toISOString(),
    sectionLabels,
    headingKeywords: uniqueSorted([...rawSignals.headingKeywords, ...workspaceSignals.headingKeywords]),
    styleTokens: uniqueSorted([...rawSignals.styleTokens, ...workspaceSignals.styleTokens]),
    hexColors: uniqueSorted([...rawSignals.hexColors, ...workspaceSignals.hexColors]),
    externalDependencies: uniqueSorted([
      ...rawSignals.externalDependencies,
      ...workspaceSignals.externalDependencies
    ]),
    referenceKinds: uniqueSorted((referenceIndex?.references ?? []).map((reference) => reference.kind)),
    referenceCount: referenceIndex?.references.length ?? 0,
    trust,
    learningSource,
    workspaceSignalStrength,
    lastApprovedAt,
    learningUpdatedAt,
    recencyWeight: calculateRecencyWeight(lastApprovedAt),
    workspaceApprovalActive,
    signalVectors: {
      raw: rawSignals,
      workspace: workspaceSignals
    }
  };

  await ensureDir(autoPatternRoot);
  await ensureDir(curatedPatternRoot);
  const outputPath = path.join(autoPatternRoot, `${projectSlug}.json`);
  await writeJsonFile(outputPath, record);

  return {
    outputPath,
    record
  };
}

export async function rebuildPatternBankIndex() {
  await ensureDir(autoPatternRoot);
  await ensureDir(curatedPatternRoot);

  const [autoRecords, curatedRecords] = await Promise.all([
    readPatternRecords("auto", autoPatternRoot),
    readPatternRecords("curated", curatedPatternRoot)
  ]);

  const records = [...curatedRecords, ...autoRecords].sort((left, right) => {
    const sourceOrder = left.source === right.source ? 0 : left.source === "curated" ? -1 : 1;
    if (sourceOrder !== 0) {
      return sourceOrder;
    }

    return left.projectSlug.localeCompare(right.projectSlug);
  });

  const index: PatternBankIndex = {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    records: records.map((record) => ({
      source: record.source,
      trust: record.trust,
      learningSource: record.learningSource,
      projectSlug: record.projectSlug,
      generatedAt: record.generatedAt,
      sectionCount: record.sectionLabels.length,
      styleTokenCount: record.styleTokens.length,
      referenceCount: record.referenceCount,
      recencyWeight: record.recencyWeight,
      workspaceSignalStrength: record.workspaceSignalStrength
    }))
  };

  await writeJsonFile(indexPath, index);

  return {
    indexPath,
    index
  };
}

export async function findPatternMatches(projectSlug: string, limit = 5) {
  const [autoRecords, curatedRecords] = await Promise.all([
    readPatternRecords("auto", autoPatternRoot),
    readPatternRecords("curated", curatedPatternRoot)
  ]);

  const records = [...curatedRecords, ...autoRecords];
  const currentRecord = records.find((record) => record.projectSlug === projectSlug);
  if (!currentRecord) {
    return [] as PatternMatch[];
  }

  const candidates = records.filter((record) => record.projectSlug !== projectSlug);
  return rankPatternMatchesForRecord(currentRecord, candidates, limit);
}
