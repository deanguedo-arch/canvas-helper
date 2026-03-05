import path from "node:path";
import { readdir, readFile } from "node:fs/promises";

import { ensureDir, fileExists, readJsonFile, writeJsonFile } from "./fs.js";
import { getProjectPaths, repoRoot } from "./paths.js";
import type { ProjectManifest, ReferenceIndex, SectionMap } from "./types.js";

export type PatternBankSource = "auto" | "curated";

export type ProjectPatternRecord = {
  schemaVersion: 1;
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
};

export type PatternBankIndexRecord = {
  source: PatternBankSource;
  projectSlug: string;
  generatedAt: string;
  sectionCount: number;
  styleTokenCount: number;
  referenceCount: number;
};

export type PatternBankIndex = {
  schemaVersion: 1;
  generatedAt: string;
  records: PatternBankIndexRecord[];
};

export type PatternMatch = {
  projectSlug: string;
  source: PatternBankSource;
  score: number;
  overlap: {
    sectionLabels: string[];
    styleTokens: string[];
    headingKeywords: string[];
  };
};

const patternBankRoot = path.join(repoRoot, ".runtime", "pattern-bank");
const autoPatternRoot = path.join(patternBankRoot, "auto");
const curatedPatternRoot = path.join(patternBankRoot, "curated");
const indexPath = path.join(patternBankRoot, "index.json");

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function normalizeToken(value: string) {
  return value.trim().toLowerCase();
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

function extractExternalDependencies(styleGuide: string) {
  const explicit = extractCsvLineValues(styleGuide, "- External dependencies preserved");
  const urls = styleGuide.match(/https?:\/\/[^\s,)]+/gi) ?? [];
  return uniqueSorted([...explicit, ...urls]);
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

function intersectNormalized(left: string[], right: string[]) {
  const rightLookup = new Set(right.map((value) => normalizeToken(value)));
  return left.filter((value) => rightLookup.has(normalizeToken(value)));
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

async function readPatternRecords(source: PatternBankSource, dirPath: string) {
  const files = await listPatternFiles(dirPath);
  const records = await Promise.all(
    files.map(async (filePath) => {
      try {
        const record = await readJsonFile<ProjectPatternRecord>(filePath);
        return {
          ...record,
          source
        };
      } catch {
        return null;
      }
    })
  );

  return records.filter(Boolean) as ProjectPatternRecord[];
}

export async function learnProjectPatterns(projectSlug: string) {
  const paths = getProjectPaths(projectSlug);
  const [manifest, sectionMap, styleGuide, referenceIndex] = await Promise.all([
    readOptionalJson<ProjectManifest>(paths.manifestPath),
    readOptionalJson<SectionMap>(paths.sectionMapPath),
    readOptionalText(paths.styleGuidePath),
    readOptionalJson<ReferenceIndex>(paths.referenceIndexPath)
  ]);

  const sectionLabels = uniqueSorted((sectionMap?.sections ?? []).map((section) => section.label));
  const headingText = uniqueSorted(
    (sectionMap?.sections ?? []).map((section) => section.headingText ?? "").filter(Boolean)
  );
  const styleTokens = uniqueSorted([
    ...extractCsvLineValues(styleGuide, "- Tailwind-style color tokens"),
    ...extractCsvLineValues(styleGuide, "- Repeated shape tokens"),
    ...extractTailwindLikeTokens(styleGuide)
  ]);

  const record: ProjectPatternRecord = {
    schemaVersion: 1,
    source: "auto",
    projectSlug,
    projectId: manifest?.id,
    sourcePath: manifest?.sourcePath,
    generatedAt: new Date().toISOString(),
    sectionLabels,
    headingKeywords: toKeywordList([...sectionLabels, ...headingText]),
    styleTokens,
    hexColors: extractHexColors(styleGuide),
    externalDependencies: extractExternalDependencies(styleGuide),
    referenceKinds: uniqueSorted((referenceIndex?.references ?? []).map((reference) => reference.kind)),
    referenceCount: referenceIndex?.references.length ?? 0
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
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    records: records.map((record) => ({
      source: record.source,
      projectSlug: record.projectSlug,
      generatedAt: record.generatedAt,
      sectionCount: record.sectionLabels.length,
      styleTokenCount: record.styleTokens.length,
      referenceCount: record.referenceCount
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

  const matches = records
    .filter((record) => record.projectSlug !== projectSlug)
    .map((record) => {
      const sharedSections = intersectNormalized(currentRecord.sectionLabels, record.sectionLabels);
      const sharedStyleTokens = intersectNormalized(currentRecord.styleTokens, record.styleTokens);
      const sharedKeywords = intersectNormalized(currentRecord.headingKeywords, record.headingKeywords).slice(0, 8);

      const score = sharedSections.length * 5 + sharedStyleTokens.length * 3 + sharedKeywords.length;
      return {
        projectSlug: record.projectSlug,
        source: record.source,
        score,
        overlap: {
          sectionLabels: sharedSections,
          styleTokens: sharedStyleTokens,
          headingKeywords: sharedKeywords
        }
      } satisfies PatternMatch;
    })
    .filter((match) => match.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (left.source !== right.source) {
        return left.source === "curated" ? -1 : 1;
      }

      return left.projectSlug.localeCompare(right.projectSlug);
    })
    .slice(0, limit);

  return matches;
}
