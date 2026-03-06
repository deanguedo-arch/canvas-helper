import path from "node:path";
import { readFile } from "node:fs/promises";

import { fileExists, readJsonFile, writeTextFile } from "../../fs.js";
import { getProjectPaths } from "../../paths.js";
import type { IntelligencePolicy, ProjectManifest, ReferenceIndex, SectionMap } from "../../types.js";

import { getRelevantMemoryForProject } from "./memory-ledger.js";
import { findPatternMatches } from "./pattern-bank.js";

type IndexedReference = {
  id: string;
  originalPath: string;
  kind: string;
  extractionStatus: string;
  extractedTextPath?: string;
};

async function readOptionalJson<T>(filePath: string) {
  if (!(await fileExists(filePath))) {
    return null;
  }

  return readJsonFile<T>(filePath);
}

async function readOptionalText(filePath: string) {
  if (!(await fileExists(filePath))) {
    return null;
  }

  return readFile(filePath, "utf8");
}

function truncateExcerpt(value: string, maxLength: number) {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength)}...`;
}

function renderMissing(label: string) {
  return `> ${label}: missing\n`;
}

function renderMarkdownSection(title: string, body: string) {
  return [`## ${title}`, "", body.trimEnd(), ""].join("\n");
}

function topMatchReasons(match: Awaited<ReturnType<typeof findPatternMatches>>[number]) {
  const contributors: Array<{ label: string; value: number }> = [
    { label: "Section overlap", value: match.scoreBreakdown.sections },
    { label: "Reference kind overlap", value: match.scoreBreakdown.referenceKinds },
    { label: "Style token overlap", value: match.scoreBreakdown.styleTokens },
    { label: "Keyword overlap", value: match.scoreBreakdown.keywords },
    { label: "Dependency overlap", value: match.scoreBreakdown.dependencies },
    { label: "Hex color overlap", value: match.scoreBreakdown.hexColors },
    { label: "Curated trust bonus", value: match.scoreBreakdown.curatedBonus },
    { label: "Recency bonus", value: match.scoreBreakdown.recencyBonus },
    { label: "Workspace approval bonus", value: match.scoreBreakdown.workspaceApprovalBonus }
  ];

  const reasons = contributors
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value)
    .slice(0, 2)
    .map((item) => `${item.label} (+${item.value})`);

  return reasons.length ? reasons.join("; ") : "No positive match signals.";
}

export async function generatePromptPack(projectSlug: string, policy: IntelligencePolicy) {
  const paths = getProjectPaths(projectSlug);

  const [manifest, sectionMap, styleGuide, contentOutline, importLog, referenceIndex] = await Promise.all([
    readOptionalJson<ProjectManifest>(paths.manifestPath),
    readOptionalJson<SectionMap>(paths.sectionMapPath),
    readOptionalText(paths.styleGuidePath),
    readOptionalText(paths.contentOutlinePath),
    readOptionalText(paths.importLogPath),
    readOptionalJson<ReferenceIndex>(paths.referenceIndexPath)
  ]);

  const indexedReferences = (referenceIndex?.references ?? [])
    .filter((reference) => reference.extractionStatus === "indexed")
    .slice(0, 12) as IndexedReference[];

  const referenceExcerpts = await Promise.all(
    indexedReferences.map(async (reference) => {
      const extractedPath = path.join(paths.referencesExtractedDir, `${reference.id}.txt`);
      const extractedText = await readOptionalText(extractedPath);

      return {
        id: reference.id,
        kind: reference.kind,
        originalPath: reference.originalPath,
        excerpt: extractedText ? truncateExcerpt(extractedText, 1200) : null
      };
    })
  );

  const includeGlobalMemory = policy.applyMemoryLedgerToPromptPack;
  const includePatternMatches = policy.applyPatternBankToPromptPack;
  const globalMemory = includeGlobalMemory ? await getRelevantMemoryForProject(projectSlug, policy, 5) : [];
  const patternMatches = includePatternMatches ? await findPatternMatches(projectSlug, 5) : [];

  const sectionLines = sectionMap?.sections?.length
    ? sectionMap.sections.map((section) => {
        const heading = section.headingText ? ` (heading: ${section.headingText})` : "";
        return `- ${section.label}${heading} -> ${section.file}`;
      })
    : [];

  const rulesSummary = [
    "- Work in repo-approved zones (`app/studio`, `app/server`, `scripts`, `docs`, `tasks`, root config files).",
    "- Treat `projects/<slug>/raw` as immutable baseline input.",
    "- Retrieval order: prompt-pack -> local pattern bank matches -> references/extracted.",
    "- Finish only after typecheck/build and task-specific verification pass."
  ].join("\n");

  const intelligenceSummary = [
    `- Mode: ${policy.mode}`,
    `- Policy source: ${policy.source}`,
    `- Collect pattern bank: ${policy.collectPatternBank ? "on" : "off"}`,
    `- Collect memory ledger: ${policy.collectMemoryLedger ? "on" : "off"}`,
    `- Apply pattern bank to prompt pack: ${policy.applyPatternBankToPromptPack ? "on" : "off"}`,
    `- Apply memory ledger to prompt pack: ${policy.applyMemoryLedgerToPromptPack ? "on" : "off"}`,
    `- Apply memory ledger to recommendations: ${policy.applyMemoryLedgerToRecommendations ? "on" : "off"}`
  ].join("\n");

  const manifestBody = manifest
    ? ["```json", JSON.stringify(manifest, null, 2), "```"].join("\n")
    : renderMissing("project.json");

  const sectionsBody = sectionMap
    ? sectionLines.length
      ? sectionLines.join("\n")
      : "- No sections detected."
    : renderMissing("section-map.json");

  const styleGuideBody = styleGuide
    ? ["```md", styleGuide.trimEnd(), "```"].join("\n")
    : renderMissing("style-guide.md");

  const contentOutlineBody = contentOutline
    ? ["```md", contentOutline.trimEnd(), "```"].join("\n")
    : renderMissing("content-outline.md");

  const importLogBody = importLog
    ? ["```md", importLog.trimEnd(), "```"].join("\n")
    : renderMissing("import-log.md");

  const referenceBody = referenceExcerpts.length
    ? referenceExcerpts
        .map((reference) => {
          const header = `### ${reference.id} (${reference.kind})`;
          const source = `- Source: ${reference.originalPath}`;
          const excerpt = reference.excerpt
            ? ["```text", reference.excerpt, "```"].join("\n")
            : "- Extracted text missing.";
          return [header, source, "", excerpt].join("\n");
        })
        .join("\n\n")
    : "none";

  const patternBody = includePatternMatches
    ? patternMatches.length
      ? patternMatches
          .map((match) => {
            const lines = [
              `### ${match.projectSlug} (${match.source}/${match.trust}, score ${match.score})`,
              `- Confidence: ${match.confidence}`,
              `- Score breakdown: sections ${match.scoreBreakdown.sections}, keywords ${match.scoreBreakdown.keywords}, references ${match.scoreBreakdown.referenceKinds}, styles ${match.scoreBreakdown.styleTokens}, colors ${match.scoreBreakdown.hexColors}, dependencies ${match.scoreBreakdown.dependencies}, curated ${match.scoreBreakdown.curatedBonus}, recency ${match.scoreBreakdown.recencyBonus}, workspace approval ${match.scoreBreakdown.workspaceApprovalBonus}`,
              `- Top reasons: ${topMatchReasons(match)}`,
              `- Shared sections: ${match.overlap.sectionLabels.length ? match.overlap.sectionLabels.join(", ") : "none"}`,
              `- Shared style tokens: ${match.overlap.styleTokens.length ? match.overlap.styleTokens.join(", ") : "none"}`,
              `- Shared keywords: ${match.overlap.headingKeywords.length ? match.overlap.headingKeywords.join(", ") : "none"}`,
              `- Shared reference kinds: ${match.overlap.referenceKinds.length ? match.overlap.referenceKinds.join(", ") : "none"}`
            ];
            return lines.join("\n");
          })
          .join("\n\n")
      : "none"
    : `disabled by intelligence policy (${policy.mode})`;

  const globalMemoryBody = includeGlobalMemory
    ? globalMemory.length
      ? globalMemory
          .map((entry) => {
            const lines = [
              `### ${entry.summary}`,
              `- Kind: ${entry.kind}`,
              `- Confidence: ${entry.confidence}`,
              `- Reinforcement: ${entry.reinforcementCount}`,
              `- Projects: ${entry.projectSlugs.length ? entry.projectSlugs.join(", ") : "repo-wide"}`,
              `- Top reasons: ${entry.reasons.length ? entry.reasons.join("; ") : "Approved memory entry."}`,
              `- Keywords: ${entry.signals.keywords.length ? entry.signals.keywords.slice(0, 12).join(", ") : "none"}`,
              `- Style tokens: ${entry.signals.styleTokens.length ? entry.signals.styleTokens.slice(0, 12).join(", ") : "none"}`,
              `- Dependencies: ${entry.signals.externalDependencies.length ? entry.signals.externalDependencies.join(", ") : "none"}`,
              `- Reference kinds: ${entry.signals.referenceKinds.length ? entry.signals.referenceKinds.join(", ") : "none"}`
            ];
            return lines.join("\n");
          })
          .join("\n\n")
      : "none"
    : `disabled by intelligence policy (${policy.mode})`;

  const taskStubBody = [
    "```md",
    "# Task",
      "## Goal",
    "<one sentence>",
    "",
    "## Constraints",
    "- Touch only the files listed in this task.",
    "- No new deps.",
    "- No refactors.",
    "",
    "## Acceptance tests",
    "- <test 1>",
    "- <test 2>",
    "",
    "## Expected files to change",
    "- <file 1>",
    "- <file 2>",
    "",
    "## Commands",
    "- npm run typecheck",
    "- npm run build:studio",
    "```"
  ].join("\n");

  const output = [
    "# Prompt Pack",
    "",
    `- Project: ${projectSlug}`,
    `- Generated: ${new Date().toISOString()}`,
    "",
    renderMarkdownSection("Rules", rulesSummary),
    renderMarkdownSection("Intelligence Policy", intelligenceSummary),
    renderMarkdownSection("Project Manifest", manifestBody),
    renderMarkdownSection("Sections List", sectionsBody),
    renderMarkdownSection("Style Guide", styleGuideBody),
    renderMarkdownSection("Content Outline", contentOutlineBody),
    renderMarkdownSection("Import Log", importLogBody),
    renderMarkdownSection("Global Memory", globalMemoryBody),
    renderMarkdownSection("Pattern Matches", patternBody),
    renderMarkdownSection("Reference Excerpts", referenceBody),
    renderMarkdownSection("Task Stub", taskStubBody)
  ].join("\n");

  const outputPath = path.join(paths.metaDir, "prompt-pack.md");
  await writeTextFile(outputPath, `${output.trimEnd()}\n`);

  return {
    outputPath,
    indexedReferenceCount: referenceExcerpts.length,
    patternMatchCount: patternMatches.length
  };
}
