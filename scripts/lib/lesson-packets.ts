import path from "node:path";

import { ensureDir, removePath, writeJsonFile } from "./fs.js";
import { getProjectPaths } from "./paths.js";
import { loadProjectManifest } from "./projects.js";
import {
  authorityRank,
  compactUnique,
  loadAllReferenceChunks,
  loadAssessmentMap,
  loadCourseBlueprint,
  loadResourceCatalog
} from "./course-planning-support.js";
import {
  extractActionVerbs,
  extractTopKeywords,
  extractUnitNumber,
  findRepresentativeExamples
} from "./curriculum-heuristics.js";
import type {
  AssessmentMap,
  CourseBlueprint,
  LessonPacket,
  LessonPacketIndex,
  LessonPacketReference,
  ReferenceChunk,
  ResourceCatalog,
  ResourceCatalogEntry
} from "./types.js";

function unitNumberFromResource(resource: ResourceCatalogEntry, text: string) {
  return extractUnitNumber(resource.relativePath, resource.titleGuess, text);
}

function getResourceText(resource: ResourceCatalogEntry, chunkMap: Map<string, ReferenceChunk[]>) {
  return (chunkMap.get(resource.id) ?? []).map((chunk) => chunk.text).join("\n\n");
}

function keywordListForOutcome(
  outcome: CourseBlueprint["outcomes"][number],
  linkedAssessments: AssessmentMap["assessments"]
) {
  return compactUnique(
    [
      ...extractTopKeywords(outcome.title, 5),
      ...outcome.requiredConcepts.map((concept) => concept.toLowerCase()),
      ...outcome.mandatoryVocabulary.map((term) => term.toLowerCase()),
      ...outcome.assessedSkills.map((skill) => skill.toLowerCase()),
      ...linkedAssessments.flatMap((assessment) => assessment.skillVerbs.map((verb) => verb.toLowerCase()))
    ],
    18
  );
}

function scoreChunk(chunk: ReferenceChunk, targetKeywords: string[]) {
  const chunkKeywords = compactUnique([...chunk.keywordHints, ...extractTopKeywords(chunk.text, 8)], 12);
  return targetKeywords.filter((keyword) => chunkKeywords.includes(keyword)).length;
}

function scoreResource(
  resource: ResourceCatalogEntry,
  outcome: CourseBlueprint["outcomes"][number],
  unit: CourseBlueprint["units"][number],
  targetKeywords: string[],
  chunkMap: Map<string, ReferenceChunk[]>
) {
  const text = getResourceText(resource, chunkMap);
  let score = authorityRank(resource.authorityRole) * 3;
  const resourceUnitNumber = unitNumberFromResource(resource, text);
  if (resourceUnitNumber !== null && resource.id !== "" && unit.id === `unit-${resourceUnitNumber}`) {
    score += 8;
  }
  if (unit.scopeSourceResourceIds.includes(resource.id)) {
    score += 5;
  }
  if (outcome.linkedAssessmentIds.includes(resource.id)) {
    score += 6;
  }
  const resourceKeywords = compactUnique(
    [
      ...extractTopKeywords(`${resource.titleGuess}\n${text}`, 10),
      ...(resource.sectionLabels ?? []).map((label) => label.toLowerCase())
    ],
    16
  );
  score += targetKeywords.filter((keyword) => resourceKeywords.includes(keyword)).length * 2;
  return score;
}

function selectSourceReferences(
  resources: ResourceCatalog["resources"],
  outcome: CourseBlueprint["outcomes"][number],
  unit: CourseBlueprint["units"][number],
  linkedAssessments: AssessmentMap["assessments"],
  chunkMap: Map<string, ReferenceChunk[]>
) {
  const targetKeywords = keywordListForOutcome(outcome, linkedAssessments);
  const ranked = resources
    .filter((resource) => resource.extractionStatus === "indexed")
    .map((resource) => ({
      resource,
      score: scoreResource(resource, outcome, unit, targetKeywords, chunkMap)
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  const categoryCaps: Record<string, number> = {
    outline: 1,
    assessment: 1,
    textbook: 3,
    "teacher-note": 1,
    other: 1
  };
  const categoryCounts = new Map<string, number>();
  const selected: LessonPacketReference[] = [];

  for (const entry of ranked) {
    const category = entry.resource.resourceCategory;
    const currentCount = categoryCounts.get(category) ?? 0;
    const categoryCap = categoryCaps[category] ?? 1;
    if (currentCount >= categoryCap) {
      continue;
    }

    const resourceChunks = chunkMap.get(entry.resource.id) ?? [];
    const selectedChunks = resourceChunks
      .map((chunk) => ({
        chunk,
        score: scoreChunk(chunk, targetKeywords)
      }))
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 3)
      .map((item) => item.chunk);

    if (selectedChunks.length === 0) {
      continue;
    }

    const pageRanges = selectedChunks
      .filter((chunk) => typeof chunk.locator.startPage === "number" && typeof chunk.locator.endPage === "number")
      .map((chunk) => ({
        startPage: chunk.locator.startPage as number,
        endPage: chunk.locator.endPage as number
      }));

    selected.push({
      resourceId: entry.resource.id,
      resourceTitle: entry.resource.titleGuess,
      resourceCategory: entry.resource.resourceCategory,
      authorityRole: entry.resource.authorityRole,
      locators: selectedChunks.map((chunk) => chunk.locator),
      pageRanges,
      whySelected:
        entry.resource.resourceCategory === "assessment"
          ? "Defines the exact performance demand students must meet."
          : entry.resource.resourceCategory === "outline"
            ? "Defines unit scope, outcome language, or required concepts."
            : "Provides targeted supporting evidence for the lesson packet.",
      exampleSnippet: findRepresentativeExamples(selectedChunks.map((chunk) => chunk.text).join("\n\n"), 1)[0]
    });
    categoryCounts.set(category, currentCount + 1);
  }

  return selected.slice(0, 6);
}

function buildReadinessGoals(
  outcome: CourseBlueprint["outcomes"][number],
  linkedAssessments: AssessmentMap["assessments"]
) {
  const verbs = compactUnique(
    [
      ...outcome.assessedSkills,
      ...linkedAssessments.flatMap((assessment) => assessment.skillVerbs)
    ],
    6
  );

  if (linkedAssessments.length === 0) {
    return compactUnique(
      [`Use ${outcome.requiredConcepts[0] ?? outcome.title} accurately in a short task aligned to the unit outcome.`],
      3
    );
  }

  return compactUnique(
    linkedAssessments.map((assessment) => {
      const verbsText = verbs.length > 0 ? verbs.join(", ") : "respond";
      return `${verbsText.charAt(0).toUpperCase()}${verbsText.slice(1)} in ${assessment.deliverable.toLowerCase()} format for ${assessment.name}.`;
    }),
    4
  );
}

function buildChecks(outcome: CourseBlueprint["outcomes"][number]) {
  const concept = outcome.requiredConcepts[0] ?? outcome.title;
  const vocab = outcome.mandatoryVocabulary.slice(0, 3).join(", ");
  return compactUnique(
    [
      `Quick retrieval: define and use ${vocab || concept} in one accurate sentence.`,
      `Mini-explanation: explain ${concept} without reading notes.`,
      `Error check: identify a common misconception about ${concept} and correct it.`
    ],
    4
  );
}

function buildGuidedPractice(
  outcome: CourseBlueprint["outcomes"][number],
  linkedAssessments: AssessmentMap["assessments"]
) {
  const firstAssessment = linkedAssessments[0];
  const leadVerb = outcome.assessedSkills[0] ?? "explain";
  return compactUnique(
    [
      `Model how to ${leadVerb} using the lesson vocabulary and one cited source example.`,
      firstAssessment
        ? `Walk through one ${firstAssessment.taskType} prompt from ${firstAssessment.name} and annotate what a successful response has to include.`
        : `Work through a teacher-led prompt that mirrors the outcome language for ${outcome.title}.`,
      `Have students rehearse a response frame before they write independently.`
    ],
    4
  );
}

function buildIndependentPractice(
  outcome: CourseBlueprint["outcomes"][number],
  linkedAssessments: AssessmentMap["assessments"]
) {
  const assessment = linkedAssessments[0];
  return compactUnique(
    [
      assessment
        ? `Complete a short practice task in the same ${assessment.taskType} style used by ${assessment.name}.`
        : `Complete an independent response that applies ${outcome.title} to a new scenario.`,
      `Use the required vocabulary list without copying a textbook paragraph.`,
      `Revise the response using the lesson's misconception and readiness checks.`
    ],
    4
  );
}

function buildReadinessEvidence(
  outcome: CourseBlueprint["outcomes"][number],
  linkedAssessments: AssessmentMap["assessments"]
) {
  return compactUnique(
    [
      `Student can ${outcome.assessedSkills[0] ?? "explain"} ${outcome.requiredConcepts[0] ?? outcome.title} accurately without reverting to chapter-note summary.`,
      `Student uses ${outcome.mandatoryVocabulary.slice(0, 3).join(", ") || "required vocabulary"} in context.`,
      linkedAssessments[0]
        ? `Student completes a practice response that matches the success criteria language from ${linkedAssessments[0].name}.`
        : `Student completes a practice response aligned to the outcome wording and receives feedback on misconceptions.`
    ],
    4
  );
}

export function buildLessonPacketsFromArtifacts(
  projectId: string,
  catalog: ResourceCatalog,
  blueprint: CourseBlueprint,
  assessmentMap: AssessmentMap,
  chunkMap: Map<string, ReferenceChunk[]>,
  lessonPacketsDir: string
) {
  const warnings = [...catalog.warnings, ...assessmentMap.warnings, ...blueprint.warnings];
  const packets: LessonPacket[] = blueprint.outcomes.map((outcome) => {
    const unit = blueprint.units.find((candidate) => candidate.id === outcome.unitId);
    if (!unit) {
      throw new Error(`Missing unit ${outcome.unitId} for outcome ${outcome.id}.`);
    }

    const linkedAssessments = assessmentMap.assessments.filter(
      (assessment) =>
        outcome.linkedAssessmentIds.includes(assessment.id) ||
        assessment.relatedOutcomeIds.includes(outcome.id) ||
        assessment.relatedUnitIds.includes(unit.id)
    );
    const sourceReferences = selectSourceReferences(catalog.resources, outcome, unit, linkedAssessments, chunkMap);
    const lessonId = outcome.id;
    const lessonTitle = `${unit.title}: ${outcome.title}`;

    return {
      lessonId,
      lessonTitle,
      unitId: unit.id,
      targetOutcomes: [
        {
          id: outcome.id,
          title: outcome.title
        }
      ],
      linkedAssessmentIds: compactUnique(linkedAssessments.map((assessment) => assessment.id), 6),
      prerequisiteKnowledge: compactUnique(
        [
          ...outcome.prerequisiteOutcomeIds
            .map((outcomeId) => blueprint.outcomes.find((candidate) => candidate.id === outcomeId)?.title ?? "")
            .filter(Boolean),
          ...outcome.supportingKnowledge
        ],
        8
      ),
      requiredVocabulary: compactUnique(outcome.mandatoryVocabulary, 10),
      coreConcepts: compactUnique(outcome.requiredConcepts, 8),
      misconceptions: compactUnique(outcome.likelyMisconceptions, 6),
      sourceReferences,
      whatThisLessonMustPrepareStudentsToDo: buildReadinessGoals(outcome, linkedAssessments),
      checksForUnderstanding: buildChecks(outcome),
      guidedPracticeIdeas: buildGuidedPractice(outcome, linkedAssessments),
      independentPracticeIdeas: buildIndependentPractice(outcome, linkedAssessments),
      evidenceOfReadinessForAssessment: buildReadinessEvidence(outcome, linkedAssessments),
      examplesOrCases: compactUnique(
        sourceReferences.map((reference) => reference.exampleSnippet).filter(Boolean),
        5
      ),
      warnings: sourceReferences.length === 0 ? ["No targeted source references were selected for this lesson packet."] : []
    } satisfies LessonPacket;
  });

  const index: LessonPacketIndex = {
    projectId,
    generatedAt: new Date().toISOString(),
    lessonPackets: packets.map((packet) => ({
      lessonId: packet.lessonId,
      lessonTitle: packet.lessonTitle,
      unitId: packet.unitId,
      targetOutcomeIds: packet.targetOutcomes.map((outcome) => outcome.id),
      linkedAssessmentIds: packet.linkedAssessmentIds,
      packetPath: path.join(lessonPacketsDir, `${packet.lessonId}.json`)
    })),
    warnings: compactUnique(warnings)
  };

  return {
    packets,
    index
  };
}

export async function buildLessonPackets(projectSlug: string) {
  const manifest = await loadProjectManifest(projectSlug);
  const paths = getProjectPaths(projectSlug);
  const catalog = await loadResourceCatalog(projectSlug);
  const blueprint = await loadCourseBlueprint(projectSlug);
  const assessmentMap = await loadAssessmentMap(projectSlug);
  const chunkMap = await loadAllReferenceChunks(catalog);

  await removePath(paths.lessonPacketsDir);
  await ensureDir(paths.lessonPacketsDir);

  const { packets, index } = buildLessonPacketsFromArtifacts(
    manifest.id,
    catalog,
    blueprint,
    assessmentMap,
    chunkMap,
    paths.lessonPacketsDir
  );

  for (const packet of packets) {
    await writeJsonFile(path.join(paths.lessonPacketsDir, `${packet.lessonId}.json`), packet);
  }
  await writeJsonFile(paths.lessonPacketsIndexPath, index);

  return {
    outputDir: paths.lessonPacketsDir,
    lessonPacketCount: packets.length,
    index
  };
}
