import { writeJsonFile } from "./fs.js";
import { loadProjectManifest } from "./projects.js";
import { getProjectPaths } from "./paths.js";
import { authorityRank, compactUnique, loadAllReferenceChunks, loadResourceCatalog } from "./course-planning-support.js";
import {
  extractActionVerbs,
  extractObjectiveStatements,
  extractSectionHeadings,
  extractTopKeywords,
  extractUnitNumber,
  extractVocabularyCandidates,
  resourceSummaryKeywords,
  toStableId
} from "./curriculum-heuristics.js";
import type {
  CourseBlueprint,
  CourseBlueprintOutcome,
  CourseBlueprintUnit,
  ReferenceChunk,
  ResourceCatalog,
  ResourceCatalogEntry
} from "./types.js";

type UnitSeed = {
  id: string;
  sequence: number;
  title: string;
  unitNumber: number | null;
  scopeSourceResourceIds: string[];
  linkedAssessmentIds: string[];
  objectiveStatements: string[];
  requiredConcepts: string[];
  requiredSkills: string[];
  mandatoryVocabulary: string[];
  sectionHeadings: string[];
  supportingKnowledge: string[];
};

type AssessmentSignal = {
  id: string;
  unitNumber: number | null;
  keywords: string[];
  verbs: string[];
};

type OutlineSegment = {
  sequence: number;
  unitNumber: number | null;
  title: string;
  text: string;
};

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function getResourceText(resource: ResourceCatalogEntry, chunkMap: Map<string, ReferenceChunk[]>) {
  return (chunkMap.get(resource.id) ?? []).map((chunk) => chunk.text).join("\n\n");
}

function meaningfulHeadings(headings: string[]) {
  return headings.filter(
    (heading) =>
      !/^assignment\s*#?\d+\s+overview/i.test(heading) &&
      !/^objectives?:?$/i.test(heading) &&
      !/^overview$/i.test(heading)
  );
}

function summarizeConcepts(resource: ResourceCatalogEntry, text: string) {
  return compactUnique(
    [
      ...extractTopKeywords(text, 8),
      ...resourceSummaryKeywords(resource),
      ...meaningfulHeadings(extractSectionHeadings(text, 6))
    ].map((item) => item.replace(/\b\w/g, (char) => char.toUpperCase())),
    8
  );
}

function buildAssessmentSignals(resources: ResourceCatalogEntry[], chunkMap: Map<string, ReferenceChunk[]>) {
  return resources.map((resource) => {
    const text = getResourceText(resource, chunkMap);
    return {
      id: resource.id,
      unitNumber: extractUnitNumber(resource.relativePath, resource.titleGuess, text),
      keywords: extractTopKeywords(`${resource.titleGuess}\n${text}`, 10),
      verbs: extractActionVerbs(text, 8)
    } satisfies AssessmentSignal;
  });
}

function scoreAssessmentForUnit(unit: UnitSeed, assessment: AssessmentSignal) {
  let score = 0;
  if (unit.unitNumber !== null && assessment.unitNumber === unit.unitNumber) {
    score += 10;
  }

  const unitKeywords = uniqueSorted([
    ...extractTopKeywords(unit.title, 4),
    ...unit.requiredConcepts.map((item) => item.toLowerCase()),
    ...unit.mandatoryVocabulary.map((item) => item.toLowerCase())
  ]);
  const overlap = assessment.keywords.filter((keyword) => unitKeywords.includes(keyword)).length;
  score += overlap * 2;

  return score;
}

function buildMisconceptions(outcomeText: string, assessedSkills: string[], concepts: string[]) {
  const misconceptions = new Set<string>();
  if (/\bdifference|compare|contrast\b/i.test(outcomeText) || assessedSkills.some((skill) => skill === "compare" || skill === "contrast")) {
    misconceptions.add("Students may treat related theories or terms as interchangeable instead of naming the actual difference.");
  }

  if (assessedSkills.some((skill) => ["define", "identify"].includes(skill))) {
    misconceptions.add("Students may memorize terms without recognizing examples, counterexamples, or application contexts.");
  }

  if (assessedSkills.some((skill) => ["explain", "analyze", "interpret"].includes(skill))) {
    misconceptions.add("Students may produce chapter-note summaries instead of evidence-based explanations tied to the prompt.");
  }

  if (concepts.length > 0) {
    misconceptions.add(`Students may use ${concepts[0]} as a label without understanding how it connects to the assessed task.`);
  }

  return [...misconceptions].slice(0, 4);
}

function deriveFallbackOutcome(unit: UnitSeed, assessmentSignals: AssessmentSignal[]) {
  const verbs = compactUnique(assessmentSignals.flatMap((signal) => signal.verbs), 4);
  if (verbs.length > 0) {
    return `Use ${unit.title} concepts to ${verbs.join(", ")} course ideas in assessment-aligned responses.`;
  }

  return `Use ${unit.title} concepts accurately in assessment-linked tasks.`;
}

function findOutlineSegmentTitle(segmentText: string, fallbackTitle: string, sequence: number) {
  const sectionMatch = segmentText.match(/\bSection\s+(\d+)\s*:\s*([^\n]+)/i);
  if (sectionMatch) {
    return `Section ${sectionMatch[1]}: ${sectionMatch[2].trim()}`;
  }

  const assignmentMatch = segmentText.match(/\bAssignment\s*#?\s*(\d+)\s+Overview/i);
  if (assignmentMatch) {
    return `Assignment ${assignmentMatch[1]} Overview`;
  }

  return sequence > 0 ? `${fallbackTitle} Part ${sequence}` : fallbackTitle;
}

function extractOutlineSegments(resource: ResourceCatalogEntry, text: string) {
  const segments: OutlineSegment[] = [];
  const assignmentPattern = /Assignment\s*#?\s*(\d+)\s+Overview([\s\S]*?)(?=Assignment\s*#?\s*\d+\s+Overview|$)/gi;

  for (const match of text.matchAll(assignmentPattern)) {
    const sequence = Number(match[1]);
    const segmentText = `Assignment #${match[1]} Overview${match[2]}`;
    segments.push({
      sequence,
      unitNumber: sequence,
      title: findOutlineSegmentTitle(segmentText, resource.titleGuess, sequence),
      text: segmentText
    });
  }

  if (segments.length > 0) {
    return segments;
  }

  const unitNumber = extractUnitNumber(resource.relativePath, resource.titleGuess, text);
  const sequence = unitNumber ?? 1;
  return [
    {
      sequence,
      unitNumber,
      title: resource.titleGuess,
      text
    }
  ];
}

export function buildCourseBlueprintFromCatalog(
  projectId: string,
  catalog: ResourceCatalog,
  chunkMap: Map<string, ReferenceChunk[]>
) {
  const warnings = [...catalog.warnings];
  const outlineResources = catalog.resources
    .filter((resource) => resource.resourceCategory === "outline" && resource.extractionStatus === "indexed")
    .sort((left, right) => (extractUnitNumber(left.relativePath, left.titleGuess) ?? 999) - (extractUnitNumber(right.relativePath, right.titleGuess) ?? 999));
  const assessmentResources = catalog.resources
    .filter((resource) => resource.resourceCategory === "assessment" && resource.extractionStatus === "indexed")
    .sort((left, right) => left.titleGuess.localeCompare(right.titleGuess));
  const supportingResources = catalog.resources
    .filter((resource) => !["outline", "assessment"].includes(resource.resourceCategory) && resource.extractionStatus === "indexed")
    .sort((left, right) => authorityRank(right.authorityRole) - authorityRank(left.authorityRole));

  if (outlineResources.length === 0) {
    warnings.push("No outline resources were classified as blueprint-authoritative. Blueprint falls back to supporting resources.");
  }

  if (assessmentResources.length === 0) {
    warnings.push("No assessment resources were classified as assessment-authoritative. Assessed skills may be under-specified.");
  }

  const seedResources = outlineResources.length > 0 ? outlineResources : supportingResources;
  const unitSeeds = new Map<string, UnitSeed>();
  const assessmentSignals = buildAssessmentSignals(assessmentResources, chunkMap);

  const upsertUnitSeed = (
    unitId: string,
    sequence: number,
    unitNumber: number | null,
    unitTitle: string,
    resourceId: string,
    objectives: string[],
    concepts: string[],
    requiredSkills: string[],
    vocabulary: string[],
    sectionHeadings: string[],
    supportingKnowledge: string[]
  ) => {
    const existing = unitSeeds.get(unitId);
    if (existing) {
      existing.scopeSourceResourceIds = compactUnique([...existing.scopeSourceResourceIds, resourceId]);
      existing.objectiveStatements = compactUnique([...existing.objectiveStatements, ...objectives], 10);
      existing.requiredConcepts = compactUnique([...existing.requiredConcepts, ...concepts], 10);
      existing.requiredSkills = compactUnique([...existing.requiredSkills, ...requiredSkills], 8);
      existing.mandatoryVocabulary = compactUnique([...existing.mandatoryVocabulary, ...vocabulary], 10);
      existing.sectionHeadings = compactUnique([...existing.sectionHeadings, ...sectionHeadings], 8);
      existing.supportingKnowledge = compactUnique([...existing.supportingKnowledge, ...supportingKnowledge], 12);
      return;
    }

    unitSeeds.set(unitId, {
      id: unitId,
      sequence,
      title: unitTitle,
      unitNumber,
      scopeSourceResourceIds: [resourceId],
      linkedAssessmentIds: [],
      objectiveStatements: objectives,
      requiredConcepts: concepts,
      requiredSkills,
      mandatoryVocabulary: vocabulary,
      sectionHeadings,
      supportingKnowledge
    });
  };

  for (const [index, resource] of seedResources.entries()) {
    const text = getResourceText(resource, chunkMap);
    const segments =
      outlineResources.length > 0 && resource.resourceCategory === "outline"
        ? extractOutlineSegments(resource, text)
        : [
            {
              sequence: extractUnitNumber(resource.relativePath, resource.titleGuess, text) ?? index + 1,
              unitNumber: extractUnitNumber(resource.relativePath, resource.titleGuess, text),
              title: resource.titleGuess,
              text
            } satisfies OutlineSegment
          ];

    for (const segment of segments) {
      const unitNumber = segment.unitNumber;
      const sequence = unitNumber ?? segment.sequence ?? index + 1;
      const unitId = unitNumber ? `unit-${unitNumber}` : `unit-${sequence}`;
      const unitTitle =
        unitNumber && !new RegExp(`\\b(unit|assignment)\\s+${unitNumber}\\b`, "i").test(segment.title)
          ? `Unit ${unitNumber}: ${segment.title}`
          : segment.title;

      const objectives = extractObjectiveStatements(segment.text, 8);
      const concepts = summarizeConcepts(resource, segment.text);
      const vocabulary = compactUnique(extractVocabularyCandidates(segment.text, 10), 10);
      const requiredSkills = compactUnique(extractActionVerbs([segment.title, ...objectives].join("\n"), 6), 6);
      const sectionHeadings = compactUnique(meaningfulHeadings(extractSectionHeadings(segment.text, 8)), 8);
      const supportingKnowledge = compactUnique([...sectionHeadings, ...concepts], 10);

      upsertUnitSeed(
        unitId,
        sequence,
        unitNumber,
        unitTitle,
        resource.id,
        objectives,
        concepts,
        requiredSkills,
        vocabulary,
        sectionHeadings,
        supportingKnowledge
      );
    }
  }

  for (const resource of supportingResources) {
    const text = getResourceText(resource, chunkMap);
    const unitNumber = extractUnitNumber(resource.relativePath, resource.titleGuess, text);
    if (unitNumber === null) {
      continue;
    }

    const unitId = `unit-${unitNumber}`;
    const existing = unitSeeds.get(unitId);
    if (!existing) {
      continue;
    }

    existing.requiredConcepts = compactUnique([...existing.requiredConcepts, ...summarizeConcepts(resource, text)], 10);
    existing.mandatoryVocabulary = compactUnique(
      [...existing.mandatoryVocabulary, ...extractVocabularyCandidates(text, 10)],
      10
    );
    existing.sectionHeadings = compactUnique(
      [...existing.sectionHeadings, ...meaningfulHeadings(resource.sectionLabels ?? extractSectionHeadings(text, 8))],
      10
    );
    existing.supportingKnowledge = compactUnique(
      [
        ...existing.supportingKnowledge,
        ...summarizeConcepts(resource, text),
        ...meaningfulHeadings(resource.sectionLabels ?? [])
      ],
      12
    );
  }

  if (unitSeeds.size === 0 && assessmentResources.length > 0) {
    for (const [index, resource] of assessmentResources.entries()) {
      const unitNumber = extractUnitNumber(resource.relativePath, resource.titleGuess);
      const sequence = unitNumber ?? index + 1;
      const unitId = unitNumber ? `unit-${unitNumber}` : `unit-${sequence}`;
      unitSeeds.set(unitId, {
        id: unitId,
        sequence,
        title: unitNumber ? `Unit ${unitNumber}: ${resource.titleGuess}` : resource.titleGuess,
        unitNumber,
        scopeSourceResourceIds: [],
        linkedAssessmentIds: [resource.id],
        objectiveStatements: [],
        requiredConcepts: [],
        requiredSkills: [],
        mandatoryVocabulary: [],
        sectionHeadings: [],
        supportingKnowledge: []
      });
    }
  }

  const unitList = [...unitSeeds.values()].sort((left, right) => left.sequence - right.sequence || left.title.localeCompare(right.title));

  for (const unit of unitList) {
    const linkedAssessments = assessmentSignals
      .map((assessment) => ({
        id: assessment.id,
        score: scoreAssessmentForUnit(unit, assessment)
      }))
      .filter((assessment) => assessment.score > 0)
      .sort((left, right) => right.score - left.score)
      .map((assessment) => assessment.id);

    unit.linkedAssessmentIds = compactUnique(linkedAssessments);
  }

  const outcomes: CourseBlueprintOutcome[] = [];
  const units: CourseBlueprintUnit[] = [];

  for (const [unitIndex, unit] of unitList.entries()) {
    const unitAssessments = assessmentSignals.filter((assessment) => unit.linkedAssessmentIds.includes(assessment.id));
    const outcomeStatements = unit.objectiveStatements.length > 0
      ? unit.objectiveStatements
      : [deriveFallbackOutcome(unit, unitAssessments)];

    const outcomeIds: string[] = [];
    for (const [outcomeIndex, statement] of outcomeStatements.entries()) {
      const linkedAssessmentIds = compactUnique(
        unitAssessments
          .filter((assessment) => {
            const overlap = assessment.keywords.filter((keyword) => extractTopKeywords(statement, 8).includes(keyword)).length;
            return overlap > 0 || outcomeStatements.length === 1;
          })
          .map((assessment) => assessment.id)
      );
      const assessedSkills = compactUnique(
        linkedAssessmentIds.length > 0
          ? unitAssessments
              .filter((assessment) => linkedAssessmentIds.includes(assessment.id))
              .flatMap((assessment) => assessment.verbs)
          : unit.requiredSkills,
        8
      );
      const outcomeSkills = compactUnique([...extractActionVerbs(statement, 6), ...assessedSkills], 8);
      const outcomeConcepts = compactUnique(unit.requiredConcepts, 8);
      const supportingKnowledge = compactUnique(
        unit.supportingKnowledge.filter((item) => !outcomeConcepts.includes(item)),
        6
      );
      const outcomeTitle = statement.replace(/^to\s+/i, "").replace(/\.$/, "").trim();
      const outcomeId = `${unit.id}--${toStableId(outcomeTitle || `outcome-${outcomeIndex + 1}`)}`;
      const prerequisiteOutcomeIds =
        outcomeIndex > 0
          ? [outcomes[outcomes.length - 1]?.id].filter(Boolean) as string[]
          : unitIndex > 0
            ? [units[units.length - 1]?.outcomeIds.at(-1)].filter(Boolean) as string[]
            : [];

      outcomes.push({
        id: outcomeId,
        unitId: unit.id,
        title: outcomeTitle || `Outcome ${outcomeIndex + 1}`,
        description: statement,
        sourceResourceIds: unit.scopeSourceResourceIds,
        linkedAssessmentIds: linkedAssessmentIds.length > 0 ? linkedAssessmentIds : unit.linkedAssessmentIds,
        mustKnow: [statement.replace(/^to\s+/i, "").replace(/\.$/, "").trim()],
        niceToKnow: supportingKnowledge.slice(0, 4),
        assessedSkills,
        supportingKnowledge,
        requiredConcepts: outcomeConcepts,
        requiredSkills: outcomeSkills,
        prerequisiteOutcomeIds,
        likelyMisconceptions: buildMisconceptions(statement, assessedSkills, outcomeConcepts),
        mandatoryVocabulary: compactUnique(unit.mandatoryVocabulary, 10)
      });
      outcomeIds.push(outcomeId);
    }

    const unitAssessedSkills = compactUnique(
      outcomeIds.flatMap((outcomeId) => outcomes.find((outcome) => outcome.id === outcomeId)?.assessedSkills ?? []),
      8
    );

    units.push({
      id: unit.id,
      title: unit.title,
      sequence: unit.sequence,
      scopeSourceResourceIds: unit.scopeSourceResourceIds,
      linkedAssessmentIds: unit.linkedAssessmentIds,
      prerequisiteUnitIds: unitIndex > 0 ? [units[units.length - 1]?.id].filter(Boolean) as string[] : [],
      mustKnow: compactUnique(
        outcomeIds.flatMap((outcomeId) => outcomes.find((outcome) => outcome.id === outcomeId)?.mustKnow ?? []),
        10
      ),
      niceToKnow: compactUnique(
        outcomeIds.flatMap((outcomeId) => outcomes.find((outcome) => outcome.id === outcomeId)?.niceToKnow ?? []),
        8
      ),
      assessedSkills: unitAssessedSkills,
      supportingKnowledge: compactUnique(unit.supportingKnowledge, 10),
      requiredConcepts: compactUnique(unit.requiredConcepts, 10),
      requiredSkills: compactUnique(unit.requiredSkills, 8),
      likelyMisconceptions: compactUnique(
        outcomeIds.flatMap((outcomeId) => outcomes.find((outcome) => outcome.id === outcomeId)?.likelyMisconceptions ?? []),
        6
      ),
      mandatoryVocabulary: compactUnique(unit.mandatoryVocabulary, 10),
      outcomeIds
    });
  }

  return {
    projectId,
    generatedAt: new Date().toISOString(),
    authoritySummary: {
      outlineResourceIds: outlineResources.map((resource) => resource.id),
      assessmentResourceIds: assessmentResources.map((resource) => resource.id),
      supportingResourceIds: supportingResources.map((resource) => resource.id)
    },
    units,
    outcomes,
    warnings
  } satisfies CourseBlueprint;
}

export async function buildCourseBlueprint(projectSlug: string) {
  const manifest = await loadProjectManifest(projectSlug);
  const paths = getProjectPaths(projectSlug);
  const catalog = await loadResourceCatalog(projectSlug);
  const chunkMap = await loadAllReferenceChunks(catalog);
  const blueprint = buildCourseBlueprintFromCatalog(manifest.id, catalog, chunkMap);

  await writeJsonFile(paths.courseBlueprintPath, blueprint);
  return {
    outputPath: paths.courseBlueprintPath,
    blueprint
  };
}
