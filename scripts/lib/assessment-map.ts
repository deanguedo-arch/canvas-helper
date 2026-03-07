import { writeJsonFile } from "./fs.js";
import { getProjectPaths } from "./paths.js";
import { loadProjectManifest } from "./projects.js";
import {
  compactUnique,
  loadAllReferenceChunks,
  loadCourseBlueprint,
  loadResourceCatalog
} from "./course-planning-support.js";
import {
  buildFailurePoints,
  extractActionVerbs,
  extractSuccessCriteria,
  extractTopKeywords,
  extractUnitNumber,
  inferDeliverable,
  inferTaskType
} from "./curriculum-heuristics.js";
import type {
  AssessmentMap,
  AssessmentMapEntry,
  CourseBlueprint,
  ReferenceChunk,
  ResourceCatalog,
  ResourceCatalogEntry
} from "./types.js";

function getResourceText(resource: ResourceCatalogEntry, chunkMap: Map<string, ReferenceChunk[]>) {
  return (chunkMap.get(resource.id) ?? []).map((chunk) => chunk.text).join("\n\n");
}

function relatedUnitIds(resource: ResourceCatalogEntry, text: string, blueprint: CourseBlueprint) {
  const unitNumber = extractUnitNumber(resource.relativePath, resource.titleGuess, text);
  const keywords = extractTopKeywords(`${resource.titleGuess}\n${text}`, 10);

  const scored = blueprint.units.map((unit) => {
    let score = 0;
    if (unitNumber !== null && unit.id === `unit-${unitNumber}`) {
      score += 10;
    }

    const unitKeywords = compactUnique(
      [
        ...extractTopKeywords(unit.title, 6),
        ...unit.requiredConcepts.map((concept) => concept.toLowerCase()),
        ...unit.mandatoryVocabulary.map((term) => term.toLowerCase())
      ],
      12
    );
    score += keywords.filter((keyword) => unitKeywords.includes(keyword)).length * 2;
    return { id: unit.id, score };
  });

  const matches = scored
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((match) => match.id);

  if (matches.length > 0) {
    return compactUnique(matches, 3);
  }

  return blueprint.units.length > 0 ? [blueprint.units[0].id] : [];
}

function relatedOutcomeIds(unitIds: string[], resource: ResourceCatalogEntry, text: string, blueprint: CourseBlueprint) {
  const keywords = extractTopKeywords(`${resource.titleGuess}\n${text}`, 10);
  const outcomes = blueprint.outcomes
    .filter((outcome) => unitIds.includes(outcome.unitId))
    .map((outcome) => {
      const outcomeKeywords = compactUnique(
        [
          ...extractTopKeywords(outcome.title, 6),
          ...outcome.requiredConcepts.map((concept) => concept.toLowerCase()),
          ...outcome.mandatoryVocabulary.map((term) => term.toLowerCase())
        ],
        12
      );
      const score = keywords.filter((keyword) => outcomeKeywords.includes(keyword)).length;
      return { id: outcome.id, score };
    })
    .sort((left, right) => right.score - left.score);

  const positiveMatches = outcomes.filter((outcome) => outcome.score > 0).map((outcome) => outcome.id);
  if (positiveMatches.length > 0) {
    return compactUnique(positiveMatches, 4);
  }

  return compactUnique(
    blueprint.outcomes.filter((outcome) => unitIds.includes(outcome.unitId)).map((outcome) => outcome.id),
    4
  );
}

export function buildAssessmentMapFromCatalog(
  projectId: string,
  catalog: ResourceCatalog,
  blueprint: CourseBlueprint,
  chunkMap: Map<string, ReferenceChunk[]>
) {
  const assessmentResources = catalog.resources.filter(
    (resource) => resource.resourceCategory === "assessment" && resource.extractionStatus === "indexed"
  );
  const warnings = [...catalog.warnings];
  if (assessmentResources.length === 0) {
    warnings.push("No assessment resources were available to build an assessment map.");
  }

  const assessments: AssessmentMapEntry[] = assessmentResources.map((resource) => {
    const chunks = chunkMap.get(resource.id) ?? [];
    const text = getResourceText(resource, chunkMap);
    const unitIds = relatedUnitIds(resource, text, blueprint);
    const outcomeIds = relatedOutcomeIds(unitIds, resource, text, blueprint);
    const alignedOutcomes = blueprint.outcomes.filter((outcome) => outcomeIds.includes(outcome.id));
    const successCriteria = extractSuccessCriteria(text, 8);
    const taskType = inferTaskType(resource.titleGuess, text);
    const skillVerbs = compactUnique(
      [
        ...extractActionVerbs(text, 8),
        ...alignedOutcomes.flatMap((outcome) => outcome.assessedSkills)
      ],
      8
    );
    const prerequisiteConcepts = compactUnique(
      alignedOutcomes.flatMap((outcome) => outcome.requiredConcepts),
      8
    );
    const prerequisiteVocabulary = compactUnique(
      alignedOutcomes.flatMap((outcome) => outcome.mandatoryVocabulary),
      10
    );

    return {
      id: resource.id,
      resourceId: resource.id,
      name: resource.titleGuess,
      taskType,
      deliverable: inferDeliverable(taskType),
      rubricLanguage: successCriteria.slice(0, 5),
      successCriteria,
      skillVerbs,
      commonFailurePoints: buildFailurePoints(skillVerbs, successCriteria, taskType),
      prerequisiteConcepts,
      prerequisiteVocabulary,
      relatedUnitIds: unitIds,
      relatedOutcomeIds: outcomeIds,
      sourceLocators: chunks.slice(0, 5).map((chunk) => chunk.locator)
    } satisfies AssessmentMapEntry;
  });

  return {
    projectId,
    generatedAt: new Date().toISOString(),
    assessments,
    warnings
  } satisfies AssessmentMap;
}

export async function buildAssessmentMap(projectSlug: string) {
  const manifest = await loadProjectManifest(projectSlug);
  const paths = getProjectPaths(projectSlug);
  const catalog = await loadResourceCatalog(projectSlug);
  const blueprint = await loadCourseBlueprint(projectSlug);
  const chunkMap = await loadAllReferenceChunks(catalog);
  const assessmentMap = buildAssessmentMapFromCatalog(manifest.id, catalog, blueprint, chunkMap);

  await writeJsonFile(paths.assessmentMapPath, assessmentMap);
  return {
    outputPath: paths.assessmentMapPath,
    assessmentMap
  };
}
