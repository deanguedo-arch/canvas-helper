import { createHash } from "node:crypto";
import path from "node:path";
import { readdir, readFile } from "node:fs/promises";

import { ensureDir, fileExists, readJsonFile, writeJsonFile } from "./fs.js";
import { calculateRecencyWeight, type ProjectPatternRecord } from "./pattern-bank.js";
import { repoRoot } from "./paths.js";
import type {
  MemoryConfidence,
  MemoryKind,
  MemoryLedger,
  MemoryLedgerEntry,
  MemoryLedgerOrigin,
  MemoryOriginCommand,
  MemoryOriginSource,
  MemorySignals
} from "./types.js";

const defaultLedgerPath = path.join(repoRoot, ".runtime", "memory-ledger.json");
const defaultDesignDocsDir = path.join(repoRoot, "docs", "plans");

export type DeriveProjectMemoryEntriesOptions = {
  command: MemoryOriginCommand;
  observedAt: string;
  approved?: boolean;
};

export type RefreshMemoryLedgerOptions = {
  ledgerPath?: string;
  designDocsDir?: string;
  patternRecord: ProjectPatternRecord;
  command: MemoryOriginCommand;
  observedAt?: string;
};

export type RankedMemoryEntry = MemoryLedgerEntry & {
  score: number;
  reasons: string[];
};

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function normalizeToken(value: string) {
  return value.trim().toLowerCase();
}

function emptySignals(): MemorySignals {
  return {
    sectionLabels: [],
    keywords: [],
    styleTokens: [],
    hexColors: [],
    externalDependencies: [],
    referenceKinds: []
  };
}

function mergeSignals(left: MemorySignals, right: MemorySignals): MemorySignals {
  return {
    sectionLabels: uniqueSorted([...left.sectionLabels, ...right.sectionLabels]),
    keywords: uniqueSorted([...left.keywords, ...right.keywords]),
    styleTokens: uniqueSorted([...left.styleTokens, ...right.styleTokens]),
    hexColors: uniqueSorted([...left.hexColors, ...right.hexColors]),
    externalDependencies: uniqueSorted([...left.externalDependencies, ...right.externalDependencies]),
    referenceKinds: uniqueSorted([...left.referenceKinds, ...right.referenceKinds])
  };
}

function keywordList(value: string) {
  return uniqueSorted(
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]+/g, " ")
      .split(/[\s-]+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 4)
  );
}

function intersectNormalized(left: string[], right: string[]) {
  const rightLookup = new Set(right.map((value) => normalizeToken(value)));
  return left.filter((value) => rightLookup.has(normalizeToken(value)));
}

function signalCount(signals: MemorySignals) {
  return (
    signals.sectionLabels.length +
    signals.keywords.length +
    signals.styleTokens.length +
    signals.hexColors.length +
    signals.externalDependencies.length +
    signals.referenceKinds.length
  );
}

function scoreConfidence(reinforcementCount: number, approved: boolean, signals: MemorySignals): MemoryConfidence {
  const totalSignals = signalCount(signals);
  if ((approved && reinforcementCount >= 3) || (approved && totalSignals >= 10)) {
    return "high";
  }
  if (approved || reinforcementCount >= 2 || totalSignals >= 5) {
    return "medium";
  }
  return "low";
}

function maxIso(left: string, right: string) {
  const leftTime = Date.parse(left);
  const rightTime = Date.parse(right);
  if (!Number.isFinite(leftTime)) {
    return right;
  }
  if (!Number.isFinite(rightTime)) {
    return left;
  }
  return rightTime > leftTime ? right : left;
}

function makeOrigin(
  kind: MemoryKind,
  projectSlug: string | undefined,
  source: MemoryOriginSource,
  command: MemoryOriginCommand,
  observedAt: string,
  fingerprint: string
): MemoryLedgerOrigin {
  return {
    id: `${kind}:${source}:${fingerprint}`,
    projectSlug,
    source,
    command,
    observedAt
  };
}

function createEntry(
  kind: MemoryKind,
  key: string,
  summary: string,
  signals: MemorySignals,
  origin: MemoryLedgerOrigin,
  approved: boolean
): MemoryLedgerEntry {
  return {
    kind,
    key,
    summary,
    signals,
    origins: [origin],
    projectSlugs: origin.projectSlug ? [origin.projectSlug] : [],
    reinforcementCount: 1,
    lastSeenAt: origin.observedAt,
    confidence: scoreConfidence(1, approved, signals),
    approved
  };
}

function normalizeLedger(ledger: Partial<MemoryLedger> | null): MemoryLedger {
  return {
    schemaVersion: 1,
    generatedAt: typeof ledger?.generatedAt === "string" ? ledger.generatedAt : new Date().toISOString(),
    entries: Array.isArray(ledger?.entries) ? (ledger.entries as MemoryLedgerEntry[]) : []
  };
}

function mergeEntry(existing: MemoryLedgerEntry | undefined, incoming: MemoryLedgerEntry): MemoryLedgerEntry {
  if (!existing) {
    return incoming;
  }

  const originsById = new Map<string, MemoryLedgerOrigin>();
  let addedOrigin = false;
  for (const origin of existing.origins) {
    originsById.set(origin.id, origin);
  }
  for (const origin of incoming.origins) {
    if (!originsById.has(origin.id)) {
      originsById.set(origin.id, origin);
      addedOrigin = true;
    }
  }

  const mergedSignals = mergeSignals(existing.signals, incoming.signals);
  const mergedApproved = existing.approved || incoming.approved;
  const mergedOrigins = [...originsById.values()].sort((left, right) => left.observedAt.localeCompare(right.observedAt));
  const reinforcementCount = mergedOrigins.length;

  return {
    ...existing,
    summary: incoming.summary || existing.summary,
    signals: mergedSignals,
    origins: mergedOrigins,
    projectSlugs: uniqueSorted([...existing.projectSlugs, ...incoming.projectSlugs]),
    reinforcementCount,
    lastSeenAt: addedOrigin ? maxIso(existing.lastSeenAt, incoming.lastSeenAt) : existing.lastSeenAt,
    approved: mergedApproved,
    confidence: scoreConfidence(reinforcementCount, mergedApproved, mergedSignals)
  };
}

function buildProjectSignals(record: ProjectPatternRecord, kind: MemoryKind): MemorySignals {
  switch (kind) {
    case "component":
      return {
        ...emptySignals(),
        sectionLabels: uniqueSorted(record.sectionLabels),
        keywords: uniqueSorted(record.headingKeywords)
      };
    case "resource":
      return {
        ...emptySignals(),
        referenceKinds: uniqueSorted(record.referenceKinds),
        keywords: uniqueSorted(record.headingKeywords)
      };
    case "style":
      return {
        ...emptySignals(),
        styleTokens: uniqueSorted(record.styleTokens),
        hexColors: uniqueSorted(record.hexColors),
        keywords: uniqueSorted(record.headingKeywords)
      };
    case "tool":
      return {
        ...emptySignals(),
        externalDependencies: uniqueSorted(record.externalDependencies),
        keywords: uniqueSorted(record.headingKeywords)
      };
    default:
      return emptySignals();
  }
}

function projectSummary(record: ProjectPatternRecord, kind: MemoryKind) {
  if (kind === "component") {
    return `Reusable sections and components from ${record.projectSlug}`;
  }
  if (kind === "resource") {
    return `Reference and resource profile from ${record.projectSlug}`;
  }
  if (kind === "style") {
    return `Approved style direction from ${record.projectSlug}`;
  }
  return `Runtime and tool choices from ${record.projectSlug}`;
}

export function deriveProjectMemoryEntries(
  record: ProjectPatternRecord,
  options: DeriveProjectMemoryEntriesOptions
): MemoryLedgerEntry[] {
  const approved = options.approved ?? true;
  const kinds: MemoryKind[] = ["component", "resource", "style", "tool"];

  return kinds
    .map((kind) => {
      const signals = buildProjectSignals(record, kind);
      if (signalCount(signals) === 0) {
        return null;
      }

      const origin = makeOrigin(
        kind,
        record.projectSlug,
        kind === "resource" ? "reference" : "pattern",
        options.command,
        options.observedAt,
        `${record.projectSlug}:${options.command}:${options.observedAt}:${kind}`
      );

      return createEntry(
        kind,
        `${kind}:${record.projectSlug}`,
        projectSummary(record, kind),
        signals,
        origin,
        approved
      );
    })
    .filter(Boolean)
    .sort((left, right) => left!.key.localeCompare(right!.key)) as MemoryLedgerEntry[];
}

export function deriveMemoryEntriesFromDesignDoc(docPath: string, content: string, observedAt: string): MemoryLedgerEntry[] {
  const basename = path.basename(docPath, path.extname(docPath));
  const headingMatch = content.match(/^#\s+(.+)$/m);
  const summary = headingMatch?.[1]?.trim() || basename.replace(/-/g, " ");
  const keywords = keywordList(content);
  const contentHash = createHash("sha1").update(content).digest("hex").slice(0, 12);
  const origin = makeOrigin("decision", undefined, "design-doc", "plan", observedAt, `${basename}:${contentHash}`);

  return [
    createEntry(
      "decision",
      `decision:${basename}`,
      summary,
      {
        ...emptySignals(),
        keywords
      },
      origin,
      true
    )
  ];
}

export async function loadMemoryLedger(ledgerPath = defaultLedgerPath) {
  if (!(await fileExists(ledgerPath))) {
    return normalizeLedger(null);
  }

  return normalizeLedger(await readJsonFile<MemoryLedger>(ledgerPath));
}

async function listDesignDocs(designDocsDir: string) {
  if (!(await fileExists(designDocsDir))) {
    return [] as string[];
  }

  const entries = await readdir(designDocsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith("-design.md"))
    .map((entry) => path.join(designDocsDir, entry.name))
    .sort((left, right) => left.localeCompare(right));
}

export async function refreshMemoryLedger(options: RefreshMemoryLedgerOptions) {
  const ledgerPath = options.ledgerPath ?? defaultLedgerPath;
  const designDocsDir = options.designDocsDir ?? defaultDesignDocsDir;
  const observedAt = options.observedAt ?? new Date().toISOString();
  const currentLedger = await loadMemoryLedger(ledgerPath);
  const mergedEntries = new Map<string, MemoryLedgerEntry>();

  for (const entry of currentLedger.entries) {
    mergedEntries.set(entry.key, entry);
  }

  const projectEntries = deriveProjectMemoryEntries(options.patternRecord, {
    command: options.command,
    observedAt,
    approved: true
  });

  for (const entry of projectEntries) {
    mergedEntries.set(entry.key, mergeEntry(mergedEntries.get(entry.key), entry));
  }

  const designDocPaths = await listDesignDocs(designDocsDir);
  for (const docPath of designDocPaths) {
    const content = await readFile(docPath, "utf8");
    for (const entry of deriveMemoryEntriesFromDesignDoc(docPath, content, observedAt)) {
      mergedEntries.set(entry.key, mergeEntry(mergedEntries.get(entry.key), entry));
    }
  }

  const ledger: MemoryLedger = {
    schemaVersion: 1,
    generatedAt: observedAt,
    entries: [...mergedEntries.values()].sort((left, right) => left.key.localeCompare(right.key))
  };

  await ensureDir(path.dirname(ledgerPath));
  await writeJsonFile(ledgerPath, ledger);
  return ledger;
}

function scoreEntryAgainstRecord(record: ProjectPatternRecord, entry: MemoryLedgerEntry) {
  const overlapSections = intersectNormalized(record.sectionLabels, entry.signals.sectionLabels);
  const overlapKeywords = intersectNormalized(record.headingKeywords, entry.signals.keywords);
  const overlapStyles = intersectNormalized(record.styleTokens, entry.signals.styleTokens);
  const overlapDependencies = intersectNormalized(record.externalDependencies, entry.signals.externalDependencies);
  const overlapReferences = intersectNormalized(record.referenceKinds, entry.signals.referenceKinds);
  const hasOverlap =
    overlapSections.length > 0 ||
    overlapKeywords.length > 0 ||
    overlapStyles.length > 0 ||
    overlapDependencies.length > 0 ||
    overlapReferences.length > 0;
  const reinforcementBonus = Math.min(6, entry.reinforcementCount);
  const approvedBonus = entry.approved ? 6 : 0;
  const recencyBonus = calculateRecencyWeight(entry.lastSeenAt);

  const contributors = [
    { label: "Section overlap", value: overlapSections.length * 6 },
    { label: "Keyword overlap", value: overlapKeywords.length * 2 },
    { label: "Style overlap", value: overlapStyles.length * 3 },
    { label: "Dependency overlap", value: overlapDependencies.length * 3 },
    { label: "Reference overlap", value: overlapReferences.length * 4 },
    { label: "Approved bonus", value: approvedBonus },
    { label: "Reinforcement bonus", value: reinforcementBonus },
    { label: "Recency bonus", value: recencyBonus }
  ];

  const score = contributors.reduce((total, item) => total + item.value, 0);
  const reasons = contributors
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value)
    .slice(0, 2)
    .map((item) => `${item.label} (+${item.value})`);

  return { score, reasons, hasOverlap };
}

export function rankRelevantMemoryEntries(record: ProjectPatternRecord, ledger: MemoryLedger, limit = 5): RankedMemoryEntry[] {
  const rankedEntries = ledger.entries
    .map((entry) => {
      const ranked = scoreEntryAgainstRecord(record, entry);
      return {
        ...entry,
        score: ranked.score,
        reasons: ranked.reasons,
        hasOverlap: ranked.hasOverlap
      };
    })
    .filter((entry) => entry.score > 0 && (entry.hasOverlap || entry.projectSlugs.includes(record.projectSlug)))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      if (right.reinforcementCount !== left.reinforcementCount) {
        return right.reinforcementCount - left.reinforcementCount;
      }
      if (right.lastSeenAt !== left.lastSeenAt) {
        return right.lastSeenAt.localeCompare(left.lastSeenAt);
      }
      return left.key.localeCompare(right.key);
    })
    .slice(0, limit);

  return rankedEntries.map(({ hasOverlap: _hasOverlap, ...entry }) => entry);
}

export async function rankRelevantMemoryForProject(projectSlug: string, limit = 5) {
  const recordPath = path.join(repoRoot, ".runtime", "pattern-bank", "auto", `${projectSlug}.json`);
  if (!(await fileExists(recordPath))) {
    return [] as RankedMemoryEntry[];
  }

  const [record, ledger] = await Promise.all([
    readJsonFile<ProjectPatternRecord>(recordPath),
    loadMemoryLedger()
  ]);

  return rankRelevantMemoryEntries(record, ledger, limit);
}
