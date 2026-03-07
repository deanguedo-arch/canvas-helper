import assert from "node:assert/strict";
import test from "node:test";

import { buildAssessmentMapFromCatalog } from "../lib/assessment-map.js";
import { buildCourseBlueprintFromCatalog } from "../lib/course-blueprint.js";
import { classifyResource } from "../lib/curriculum-heuristics.js";
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
  assert.equal(blueprint.units[0]?.title, "Unit 1 Overview");
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
