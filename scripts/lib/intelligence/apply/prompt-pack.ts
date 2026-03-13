import path from "node:path";
import { readFile } from "node:fs/promises";

import { fileExists, readJsonFile, writeTextFile } from "../../fs.js";
import { authorityRank, readOptionalJson } from "../../course-planning-support.js";
import { getProjectPaths } from "../../paths.js";
import type {
  AssessmentMap,
  CourseBlueprint,
  IntelligencePolicy,
  LessonPacket,
  LessonPacketIndex,
  ProjectManifest,
  ReferenceChunkManifest,
  ReferenceIndex,
  ResourceCatalog,
  SectionMap
} from "../../types.js";

import { getRelevantMemoryForProject } from "./memory-ledger.js";
import { findPatternMatches } from "./pattern-bank.js";
import { resolveProjectBenchmarkSelection } from "../../benchmarks/project-selection.js";

type IndexedReference = {
  id: string;
  originalPath: string;
  kind: string;
  extractionStatus: string;
  extractedTextPath?: string;
};

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

function renderMissing(label: string, nextCommand?: string) {
  if (!nextCommand) {
    return `> ${label}: missing\n`;
  }

  return `> ${label}: missing\n> Next: \`${nextCommand}\`\n`;
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

function categorySummary(resourceCatalog: ResourceCatalog | null) {
  if (!resourceCatalog) {
    return "none";
  }

  const counts = new Map<string, number>();
  for (const resource of resourceCatalog.resources) {
    counts.set(resource.resourceCategory, (counts.get(resource.resourceCategory) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([category, count]) => `${category}: ${count}`)
    .join("; ");
}

function renderResourceAuthorityRules(resourceCatalog: ResourceCatalog | null) {
  const resourceCounts = categorySummary(resourceCatalog);
  return [
    "- Assessments are the highest authority for performance expectations and success criteria.",
    "- Outlines are the highest authority for unit naming, scope, and outcome framing.",
    "- Teacher notes are contextual authority only.",
    "- Textbook and reference resources are supporting evidence, not lesson generators.",
    "- Imported Canvas workspace content is fallback context only when outline or assessment evidence is missing.",
    `- Current classified resource mix: ${resourceCounts}.`
  ].join("\n");
}

function renderBlueprintSummary(blueprint: CourseBlueprint | null, projectSlug: string) {
  if (!blueprint) {
    return renderMissing("course-blueprint.json", `npm run blueprint -- --project ${projectSlug}`);
  }

  if (blueprint.units.length === 0) {
    return "No blueprint units were generated.";
  }

  return blueprint.units
    .slice(0, 6)
    .map((unit) => {
      const linkedOutcomes = blueprint.outcomes.filter((outcome) => outcome.unitId === unit.id).slice(0, 3);
      const lines = [
        `### ${unit.title}`,
        `- Outcomes: ${linkedOutcomes.length ? linkedOutcomes.map((outcome) => outcome.title).join("; ") : "none"}`,
        `- Linked assessments: ${unit.linkedAssessmentIds.length ? unit.linkedAssessmentIds.join(", ") : "none"}`,
        `- Must know: ${unit.mustKnow.length ? unit.mustKnow.slice(0, 4).join("; ") : "none"}`,
        `- Assessed skills: ${unit.assessedSkills.length ? unit.assessedSkills.join(", ") : "none"}`,
        `- Mandatory vocabulary: ${unit.mandatoryVocabulary.length ? unit.mandatoryVocabulary.slice(0, 8).join(", ") : "none"}`
      ];
      return lines.join("\n");
    })
    .join("\n\n");
}

function renderAssessmentMapSummary(assessmentMap: AssessmentMap | null, projectSlug: string) {
  if (!assessmentMap) {
    return renderMissing("assessment-map.json", `npm run assessment-map -- --project ${projectSlug}`);
  }

  if (assessmentMap.assessments.length === 0) {
    return "No assessment entries were generated.";
  }

  return assessmentMap.assessments
    .slice(0, 6)
    .map((assessment) => {
      const lines = [
        `### ${assessment.name} (${assessment.taskType})`,
        `- Deliverable: ${assessment.deliverable}`,
        `- Skill verbs: ${assessment.skillVerbs.length ? assessment.skillVerbs.join(", ") : "none"}`,
        `- Related units: ${assessment.relatedUnitIds.length ? assessment.relatedUnitIds.join(", ") : "none"}`,
        `- Related outcomes: ${assessment.relatedOutcomeIds.length ? assessment.relatedOutcomeIds.join(", ") : "none"}`,
        `- Failure points: ${assessment.commonFailurePoints.length ? assessment.commonFailurePoints.join("; ") : "none"}`
      ];
      return lines.join("\n");
    })
    .join("\n\n");
}

function renderLessonPacketSummary(
  lessonPacketIndex: LessonPacketIndex | null,
  lessonPackets: LessonPacket[],
  projectSlug: string
) {
  if (!lessonPacketIndex) {
    return renderMissing("lesson-packets/index.json", `npm run lesson-packets -- --project ${projectSlug}`);
  }

  if (lessonPackets.length === 0) {
    return "No lesson packet files were available to summarize.";
  }

  return lessonPackets
    .slice(0, 6)
    .map((packet) => {
      const lines = [
        `### ${packet.lessonTitle}`,
        `- Outcomes: ${packet.targetOutcomes.map((outcome) => outcome.title).join("; ")}`,
        `- Linked assessments: ${packet.linkedAssessmentIds.length ? packet.linkedAssessmentIds.join(", ") : "none"}`,
        `- Core concepts: ${packet.coreConcepts.length ? packet.coreConcepts.join(", ") : "none"}`,
        `- Guided practice: ${packet.guidedPracticeIdeas.length ? packet.guidedPracticeIdeas.slice(0, 2).join("; ") : "none"}`,
        `- Readiness evidence: ${packet.evidenceOfReadinessForAssessment.length ? packet.evidenceOfReadinessForAssessment.slice(0, 2).join("; ") : "none"}`
      ];
      return lines.join("\n");
    })
    .join("\n\n");
}

function renderAntiSummaryRules() {
  return [
    "- Build from outline authority plus assessment demand, not from whole-book excerpts.",
    "- Never generate a lesson that lacks outcomes, linked assessments, misconceptions, guided practice, independent practice, and readiness evidence.",
    "- A lesson is a failure if it reads like chapter notes, only defines terms, or cites broad source blobs instead of targeted lesson evidence.",
    "- Prefer lesson-packet-scoped references and page/section locators over raw document dumps.",
    "- Use textbook or reference sources only to support a specific outcome and assessment demand."
  ].join("\n");
}

function renderSelectedBenchmarkBody(
  resolvedBenchmark: Awaited<ReturnType<typeof resolveProjectBenchmarkSelection>>
) {
  if (!resolvedBenchmark.selection || !resolvedBenchmark.bundle) {
    return "none";
  }

  const { selection, bundle } = resolvedBenchmark;
  const benchmark = bundle.benchmark;
  const lines = [
    `- Benchmark: ${benchmark.id} (${benchmark.label})`,
    `- Source project: ${benchmark.sourceProjectSlug}`,
    `- Summary: ${benchmark.summary ?? "none"}`,
    `- Source support mode: ${selection.sourceSupportMode ?? benchmark.sourceSupportPolicy.mode}`,
    `- Section flow: ${benchmark.sectionFlow.join(" -> ")}`,
    `- Recipes: ${bundle.recipes.map((recipe) => recipe.id).join(", ")}`
  ];

  if (selection.notes?.length) {
    lines.push(`- Project notes: ${selection.notes.join("; ")}`);
  }

  return lines.join("\n");
}

async function readLessonPackets(index: LessonPacketIndex | null) {
  if (!index) {
    return [] as LessonPacket[];
  }

  const packets = await Promise.all(
    index.lessonPackets.slice(0, 6).map(async (entry) => {
      if (!(await fileExists(entry.packetPath))) {
        return null;
      }

      return readJsonFile<LessonPacket>(entry.packetPath);
    })
  );

  return packets.filter((packet): packet is LessonPacket => Boolean(packet));
}

async function buildReferenceExcerpts(
  resourceCatalog: ResourceCatalog | null,
  lessonPackets: LessonPacket[]
) {
  if (!resourceCatalog) {
    return [] as Array<{ id: string; kind: string; originalPath: string; excerpt: string | null }>;
  }

  const prioritizedResourceIds = new Set(
    lessonPackets.flatMap((packet) => packet.sourceReferences.map((reference) => reference.resourceId))
  );

  const excerptResources = resourceCatalog.resources
    .filter((resource) => resource.extractionStatus === "indexed")
    .sort((left, right) => {
      const rightPriority = prioritizedResourceIds.has(right.id) ? 100 : 0;
      const leftPriority = prioritizedResourceIds.has(left.id) ? 100 : 0;
      return (
        rightPriority - leftPriority ||
        authorityRank(right.authorityRole) - authorityRank(left.authorityRole) ||
        left.titleGuess.localeCompare(right.titleGuess)
      );
    })
    .slice(0, 8);

  return Promise.all(
    excerptResources.map(async (resource) => {
      let excerpt: string | null = null;

      if (resource.chunkManifestPath && (await fileExists(resource.chunkManifestPath))) {
        const chunkManifest = await readJsonFile<ReferenceChunkManifest>(resource.chunkManifestPath);
        excerpt = chunkManifest.chunks[0]?.text ? truncateExcerpt(chunkManifest.chunks[0].text, 700) : null;
      }

      if (!excerpt && resource.extractedTextPath) {
        const extractedText = await readOptionalText(resource.extractedTextPath);
        excerpt = extractedText ? truncateExcerpt(extractedText, 700) : null;
      }

      return {
        id: resource.id,
        kind: `${resource.kind}/${resource.resourceCategory}`,
        originalPath: resource.originalPath,
        excerpt
      };
    })
  );
}

export async function generatePromptPack(projectSlug: string, policy: IntelligencePolicy) {
  const paths = getProjectPaths(projectSlug);

  const [
    manifest,
    sectionMap,
    styleGuide,
    contentOutline,
    importLog,
    referenceIndex,
    resourceCatalog,
    courseBlueprint,
    assessmentMap,
    lessonPacketIndex
  ] = await Promise.all([
    readOptionalJson<ProjectManifest>(paths.manifestPath),
    readOptionalJson<SectionMap>(paths.sectionMapPath),
    readOptionalText(paths.styleGuidePath),
    readOptionalText(paths.contentOutlinePath),
    readOptionalText(paths.importLogPath),
    readOptionalJson<ReferenceIndex>(paths.referenceIndexPath),
    readOptionalJson<ResourceCatalog>(paths.resourceCatalogPath),
    readOptionalJson<CourseBlueprint>(paths.courseBlueprintPath),
    readOptionalJson<AssessmentMap>(paths.assessmentMapPath),
    readOptionalJson<LessonPacketIndex>(paths.lessonPacketsIndexPath)
  ]);
  const resolvedBenchmark = await resolveProjectBenchmarkSelection({ projectSlug });

  const lessonPackets = await readLessonPackets(lessonPacketIndex);
  const referenceExcerpts = await buildReferenceExcerpts(resourceCatalog, lessonPackets);

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
    "- Retrieval order: prompt-pack -> course blueprint -> assessment map -> lesson packets -> targeted resource chunks -> pattern matches if enabled.",
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

  const resourceCatalogBody = resourceCatalog
    ? resourceCatalog.resources
        .slice(0, 8)
        .map((resource) => {
          const lines = [
            `### ${resource.titleGuess} (${resource.resourceCategory})`,
            `- Authority: ${resource.authorityRole}`,
            `- Source: ${resource.originalPath}`,
            `- Extraction: ${resource.extractionStatus}${resource.extractionMethod ? ` via ${resource.extractionMethod}` : ""}`,
            `- Chunks: ${resource.chunkCount}`,
            `- Signals: ${compactSignals([...resource.blueprintSignals, ...resource.assessmentSignals, ...resource.supportSignals])}`
          ];
          return lines.join("\n");
        })
        .join("\n\n")
    : renderMissing("resource-catalog.json", `npm run refs -- --project ${projectSlug}`);

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

  const referenceBody = referenceExcerpts.length
    ? referenceExcerpts
        .map((reference) => {
          const header = `### ${reference.id} (${reference.kind})`;
          const source = `- Source: ${reference.originalPath}`;
          const excerpt = reference.excerpt
            ? ["```text", reference.excerpt, "```"].join("\n")
            : "- Extracted chunk text missing.";
          return [header, source, "", excerpt].join("\n");
        })
        .join("\n\n")
    : "none";

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
    renderMarkdownSection("Selected Benchmark", renderSelectedBenchmarkBody(resolvedBenchmark)),
    renderMarkdownSection("Project Manifest", manifestBody),
    renderMarkdownSection("Resource Authority Rules", renderResourceAuthorityRules(resourceCatalog)),
    renderMarkdownSection("Resource Catalog Summary", resourceCatalogBody),
    renderMarkdownSection("Course Blueprint Summary", renderBlueprintSummary(courseBlueprint, projectSlug)),
    renderMarkdownSection("Assessment Map Summary", renderAssessmentMapSummary(assessmentMap, projectSlug)),
    renderMarkdownSection("Lesson Packet Summary", renderLessonPacketSummary(lessonPacketIndex, lessonPackets, projectSlug)),
    renderMarkdownSection("Anti-Summary Generation Rules", renderAntiSummaryRules()),
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
    indexedReferenceCount: referenceExcerpts.length || (referenceIndex?.references ?? []).filter((reference) => reference.extractionStatus === "indexed").length,
    patternMatchCount: patternMatches.length
  };
}

function compactSignals(values: string[]) {
  const unique = [...new Set(values.filter(Boolean))];
  return unique.length ? unique.slice(0, 5).join(", ") : "none";
}
