import assert from "node:assert/strict";
import test from "node:test";

import { buildAssessmentMapFromCatalog } from "../lib/assessment-map.js";
import { buildCourseBlueprintFromCatalog } from "../lib/course-blueprint.js";
import { classifyResource, extractUnitNumber, toStableId } from "../lib/curriculum-heuristics.js";
import { buildLessonPacketsFromArtifacts } from "../lib/lesson-packets.js";
import type { ReferenceChunk, ResourceCatalog, ResourceCatalogEntry } from "../lib/types.js";

function createResource(overrides: Partial<ResourceCatalogEntry>): ResourceCatalogEntry {
  return {
    id: "resource",
    originalPath: `/tmp/${overrides.id ?? "resource"}.pdf`,
    relativePath: `${overrides.id ?? "resource"}.pdf`,
    kind: "pdf",
    extractionStatus: "indexed",
    extractionMethod: "native",
    extractedTextPath: `/tmp/${overrides.id ?? "resource"}.txt`,
    chunkManifestPath: `/tmp/${overrides.id ?? "resource"}.chunks.json`,
    chunkCount: 1,
    pageCount: 1,
    sectionLabels: [],
    titleGuess: "Resource",
    resourceCategory: "other",
    authorityRole: "supporting-only",
    blueprintSignals: [],
    assessmentSignals: [],
    supportSignals: [],
    ...overrides
  };
}

function createChunk(resourceId: string, text: string, label: string, page?: number): ReferenceChunk {
  return {
    id: `${resourceId}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    index: page ?? 1,
    locator: page
      ? {
          kind: "page",
          label,
          page,
          startPage: page,
          endPage: page
        }
      : {
          kind: "section",
          label,
          sectionHeading: label
        },
    text,
    titleGuess: label,
    keywordHints: ["psychology", "behaviourism", "humanism", "compare"]
  };
}

test("classifyResource distinguishes outline and assessment authority", () => {
  const outline = classifyResource(
    "GenPsychOverview.pdf",
    "General Psychology 20 Overview",
    "Table of Contents\nObjectives:\n- To compare behaviourism and humanism."
  );
  const assessment = classifyResource(
    "PerPsy20AB01Key.pdf",
    "Assignment Booklet 1 Key",
    "Assignment Booklet 1\nAssessment\nFor successful completion students must complete all questions."
  );

  assert.equal(outline.resourceCategory, "outline");
  assert.equal(outline.authorityRole, "blueprint-authoritative");
  assert.equal(assessment.resourceCategory, "assessment");
  assert.equal(assessment.authorityRole, "assessment-authoritative");
});

test("extractUnitNumber detects unit and module numbering patterns", () => {
  assert.equal(extractUnitNumber("Unit 2: Research Design"), 2);
  assert.equal(extractUnitNumber("Module 4 Conducting Research Assessment"), 4);
  assert.equal(extractUnitNumber("M3 assessment"), 3);
  assert.equal(extractUnitNumber("Assignment Booklet 5 Key"), 5);
});

test("planning artifacts prioritize outline scope and assessment demand", () => {
  const outline = createResource({
    id: "unit-1-overview",
    titleGuess: "Unit 1 Overview",
    resourceCategory: "outline",
    authorityRole: "blueprint-authoritative",
    blueprintSignals: ["text:objectives"]
  });
  const assessment = createResource({
    id: "unit-1-assignment-key",
    titleGuess: "Assignment Booklet 1 Key",
    resourceCategory: "assessment",
    authorityRole: "assessment-authoritative",
    assessmentSignals: ["filename:key", "text:assignment-booklet"]
  });
  const textbook = createResource({
    id: "unit-1-textbook",
    titleGuess: "Unit 1 Textbook",
    resourceCategory: "textbook",
    authorityRole: "supporting-only",
    supportSignals: ["filename:unit"]
  });

  const catalog: ResourceCatalog = {
    projectId: "project-1",
    generatedAt: new Date().toISOString(),
    resources: [outline, assessment, textbook],
    warnings: []
  };

  const chunkMap = new Map<string, ReferenceChunk[]>([
    [
      outline.id,
      [
        createChunk(
          outline.id,
          "Unit 1 Overview\nObjectives:\n- To explain the origins of psychology.\n- To compare behaviourism and humanism.\nOverview topics include Wundt, Freud, behaviourism, and humanism.",
          "Unit 1 Overview"
        )
      ]
    ],
    [
      assessment.id,
      [
        createChunk(
          assessment.id,
          "Assignment Booklet 1\nAssessment\nFor successful completion students must complete all questions.\n1. Compare behaviourism and humanism using evidence.\n2. Define psychology and explain how Wundt gained recognition.",
          "Page 1",
          1
        )
      ]
    ],
    [
      textbook.id,
      [
        createChunk(
          textbook.id,
          "Section One\nWhat is Psychology?\nPsychology became the science of human behaviour. Wundt established the first psychological laboratory. For example, students can compare behaviourism and humanism by naming their assumptions.",
          "Page 5",
          5
        )
      ]
    ]
  ]);

  const blueprint = buildCourseBlueprintFromCatalog("project-1", catalog, chunkMap);
  assert.equal(blueprint.units.length, 1);
  assert.equal(blueprint.units[0]?.title, "Unit 1: Overview");
  assert.equal(blueprint.outcomes.length >= 2, true);
  assert.equal(blueprint.outcomes.some((outcome) => outcome.assessedSkills.includes("compare")), true);
  assert.equal(blueprint.outcomes.some((outcome) => outcome.linkedAssessmentIds.includes(assessment.id)), true);

  const assessmentMap = buildAssessmentMapFromCatalog("project-1", catalog, blueprint, chunkMap);
  assert.equal(assessmentMap.assessments.length, 1);
  assert.equal(assessmentMap.assessments[0]?.taskType, "assignment-booklet");
  assert.equal(assessmentMap.assessments[0]?.skillVerbs.includes("compare"), true);
  assert.equal((assessmentMap.assessments[0]?.commonFailurePoints.length ?? 0) > 0, true);

  const lessonPackets = buildLessonPacketsFromArtifacts(
    "project-1",
    catalog,
    blueprint,
    assessmentMap,
    chunkMap,
    "/tmp/lesson-packets"
  );
  assert.equal(lessonPackets.packets.length, blueprint.outcomes.length);
  assert.equal(
    lessonPackets.packets.every((packet) => packet.linkedAssessmentIds.length > 0),
    true
  );
  assert.equal(
    lessonPackets.packets.every((packet) => packet.sourceReferences.length > 0),
    true
  );
  assert.equal(
    lessonPackets.packets.some((packet) =>
      packet.sourceReferences.some((reference) => reference.resourceCategory === "textbook")
    ),
    true
  );
  assert.equal(
    lessonPackets.packets.every((packet) => packet.guidedPracticeIdeas.length > 0 && packet.evidenceOfReadinessForAssessment.length > 0),
    true
  );
});

test("planning artifacts split unit headings and keep explicit assessment-to-unit links deterministic", () => {
  const outline = createResource({
    id: "ep-outline",
    titleGuess: "Experimental Psychology Outline",
    resourceCategory: "outline",
    authorityRole: "blueprint-authoritative",
    blueprintSignals: ["text:objectives"]
  });
  const assessmentOne = createResource({
    id: "module-1-assessment",
    titleGuess: "Module 1 Assessment",
    resourceCategory: "assessment",
    authorityRole: "assessment-authoritative",
    assessmentSignals: ["text:assessment"]
  });
  const assessmentTwo = createResource({
    id: "module-2-assessment",
    titleGuess: "Module 2 Assessment",
    resourceCategory: "assessment",
    authorityRole: "assessment-authoritative",
    assessmentSignals: ["text:assessment"]
  });

  const catalog: ResourceCatalog = {
    projectId: "project-ep",
    generatedAt: new Date().toISOString(),
    resources: [outline, assessmentOne, assessmentTwo],
    warnings: []
  };

  const chunkMap = new Map<string, ReferenceChunk[]>([
    [
      outline.id,
      [
        createChunk(
          outline.id,
          [
            "Unit 1: Experimental Psychology Overview",
            "Objectives:",
            "- Explain what experimental psychology is.",
            "- Define independent and dependent variables.",
            "",
            "Unit 2: Statistics and Research Design",
            "Objectives:",
            "- Compare descriptive and inferential statistics.",
            "- Analyze validity and reliability."
          ].join("\n"),
          "Outline"
        )
      ]
    ],
    [
      assessmentOne.id,
      [
        createChunk(
          assessmentOne.id,
          "Module 1 Assessment\nComplete all questions and explain each response with evidence.",
          "Page 1",
          1
        )
      ]
    ],
    [
      assessmentTwo.id,
      [
        createChunk(
          assessmentTwo.id,
          "Module 2 Assessment\nCompare and analyze the study design choices shown in each scenario.",
          "Page 1",
          1
        )
      ]
    ]
  ]);

  const blueprint = buildCourseBlueprintFromCatalog("project-ep", catalog, chunkMap);
  assert.equal(blueprint.units.length, 2);
  assert.equal(blueprint.units[0]?.id, "unit-1");
  assert.equal(blueprint.units[1]?.id, "unit-2");
  assert.deepEqual(blueprint.units[0]?.linkedAssessmentIds, [assessmentOne.id]);
  assert.deepEqual(blueprint.units[1]?.linkedAssessmentIds, [assessmentTwo.id]);

  const assessmentMap = buildAssessmentMapFromCatalog("project-ep", catalog, blueprint, chunkMap);
  const mappedOne = assessmentMap.assessments.find((assessment) => assessment.id === assessmentOne.id);
  const mappedTwo = assessmentMap.assessments.find((assessment) => assessment.id === assessmentTwo.id);
  assert.deepEqual(mappedOne?.relatedUnitIds, ["unit-1"]);
  assert.deepEqual(mappedTwo?.relatedUnitIds, ["unit-2"]);
});

test("toStableId stays filesystem-safe for very long extracted statements", () => {
  const longValue =
    "Some scientists, the most problematic statistical illusion relates to observational studies in which correlation is often confused with causation. " +
    "For example, you may have heard the statement that people who consume a moderate amount of alcohol have less heart disease than people who consume either no alcohol or too much alcohol. " +
    "People who report the news might inadvertently present this information in such a way that the public is led to believe that alcohol prevents heart disease. " +
    "In fact, this claim cannot be made. Correlation is not causation.";

  const stableId = toStableId(longValue);

  assert.equal(stableId.length <= 80, true);
  assert.match(stableId, /^[a-z0-9-]+$/);
  assert.equal(stableId, toStableId(longValue));
});
