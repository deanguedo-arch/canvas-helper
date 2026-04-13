import assert from "node:assert/strict";
import test from "node:test";

import { buildCourseShellPlan } from "../lib/course-shell.js";
import type { AssessmentMap, CourseBlueprint, D2LCourseMap, LessonPacketIndex } from "../lib/types.js";

test("buildCourseShellPlan turns planning artifacts into a reusable course shell", () => {
  const blueprint: CourseBlueprint = {
    projectId: "forensics35",
    generatedAt: "2026-03-18T00:00:00.000Z",
    authoritySummary: {
      outlineResourceIds: ["outline-1"],
      assessmentResourceIds: ["assessment-1"],
      supportingResourceIds: ["support-1"]
    },
    units: [
      {
        id: "unit-1",
        title: "Module 1: Forensic Toxicology",
        sequence: 1,
        scopeSourceResourceIds: ["outline-1"],
        linkedAssessmentIds: ["assessment-1"],
        prerequisiteUnitIds: [],
        mustKnow: ["Toxicology focuses on drugs, poisons, and toxins."],
        niceToKnow: ["Case studies anchor the module in real investigations."],
        assessedSkills: ["explain", "identify"],
        supportingKnowledge: ["drugs", "poisons"],
        requiredConcepts: ["forensic toxicology"],
        requiredSkills: ["explain", "identify"],
        likelyMisconceptions: ["Students may treat all poisons as drugs."],
        mandatoryVocabulary: ["toxicology"],
        outcomeIds: ["outcome-1"]
      }
    ],
    outcomes: [
      {
        id: "outcome-1",
        unitId: "unit-1",
        title: "Explain forensic toxicology",
        description: "Students explain the role of forensic toxicology.",
        sourceResourceIds: ["outline-1"],
        linkedAssessmentIds: ["assessment-1"],
        mustKnow: ["Explain forensic toxicology."],
        niceToKnow: ["Know how case studies fit the unit."],
        assessedSkills: ["explain", "identify"],
        supportingKnowledge: ["drugs", "poisons"],
        requiredConcepts: ["forensic toxicology"],
        requiredSkills: ["explain", "identify"],
        prerequisiteOutcomeIds: [],
        likelyMisconceptions: ["Students may confuse toxicology with pathology."],
        mandatoryVocabulary: ["toxicology"]
      }
    ],
    warnings: []
  };

  const assessmentMap: AssessmentMap = {
    projectId: "forensics35",
    generatedAt: "2026-03-18T00:00:00.000Z",
    assessments: [
      {
        id: "assessment-1",
        resourceId: "assessment-1",
        name: "Module 1 Assessment",
        taskType: "assignment-booklet",
        deliverable: "printable assignment",
        rubricLanguage: ["identify", "explain"],
        successCriteria: ["Use the target vocabulary accurately."],
        skillVerbs: ["explain", "identify"],
        commonFailurePoints: ["Summarizing instead of answering the prompt."],
        prerequisiteConcepts: ["forensic toxicology"],
        prerequisiteVocabulary: ["toxicology"],
        relatedUnitIds: ["unit-1"],
        relatedOutcomeIds: ["outcome-1"],
        sourceLocators: []
      }
    ],
    warnings: []
  };

  const lessonPacketIndex: LessonPacketIndex = {
    projectId: "forensics35",
    generatedAt: "2026-03-18T00:00:00.000Z",
    lessonPackets: [
      {
        lessonId: "outcome-1",
        lessonTitle: "Module 1: Forensic Toxicology: Explain forensic toxicology",
        unitId: "unit-1",
        targetOutcomeIds: ["outcome-1"],
        linkedAssessmentIds: ["assessment-1"],
        packetPath: "projects/forensics35/meta/lesson-packets/outcome-1.json"
      }
    ],
    warnings: []
  };

  const plan = buildCourseShellPlan({
    projectSlug: "forensics35",
    courseTitle: "Forensic Science 35",
    courseSubtitle: "Brightspace course shell",
    overview: "Keep the original course flow but expose it through one reusable shell.",
    blueprint,
    assessmentMap,
    lessonPacketIndex
  });

  assert.equal(plan.storageKey, "forensics35::workspace-state::v1");
  assert.equal(plan.modules.length, 1);
  assert.equal(plan.modules[0]?.activities.some((activity) => activity.kind === "lesson"), true);
  assert.equal(plan.modules[0]?.activities.some((activity) => activity.kind === "assessment"), true);
  assert.equal(plan.reflection.prompts.length, 3);
  assert.equal(plan.report.sections.some((section) => section.id === "reflection"), true);
  assert.equal(plan.modules[0]?.activities[0]?.sourceHref, "");
  assert.equal(plan.modules[0]?.activities[0]?.resourceKind, "other");
  assert.equal(plan.modules[0]?.activities[0]?.renderHint, "fallback");
  assert.equal(plan.modules[0]?.activities[0]?.moduleTitle, "Module 1: Forensic Toxicology");
  assert.equal(plan.modules[0]?.activities[0]?.moduleSequence, 1);
  assert.equal(plan.modules[0]?.activities[0]?.moduleVisibilityLabel, "visible");
});

test("buildCourseShellPlan hydrates source metadata and preview fields from course map entries", () => {
  const blueprint: CourseBlueprint = {
    projectId: "forensics35",
    generatedAt: "2026-03-18T00:00:00.000Z",
    authoritySummary: {
      outlineResourceIds: [],
      assessmentResourceIds: [],
      supportingResourceIds: []
    },
    units: [],
    outcomes: [],
    warnings: []
  };

  const assessmentMap: AssessmentMap = {
    projectId: "forensics35",
    generatedAt: "2026-03-18T00:00:00.000Z",
    assessments: [],
    warnings: []
  };

  const lessonPacketIndex: LessonPacketIndex = {
    projectId: "forensics35",
    generatedAt: "2026-03-18T00:00:00.000Z",
    lessonPackets: [],
    warnings: []
  };

  const courseMap: D2LCourseMap = {
    schemaVersion: 1,
    projectId: "forensics35",
    projectSlug: "forensics35",
    generatedAt: "2026-03-18T00:00:00.000Z",
    manifestPath: "imsmanifest.xml",
    courseTitle: "Forensic Science 35",
    summary: {
      moduleCount: 1,
      itemCount: 3,
      lessonCount: 1,
      assignmentCount: 1,
      quizCount: 1,
      pdfCount: 0,
      htmlCount: 1
    },
    modules: [
      {
        id: "module-hidden",
        title: "Module 1: Research Methods",
        kind: "module",
        depth: 0,
        children: [
          {
            id: "node-html",
            title: "Course Reading",
            kind: "html",
            depth: 1,
            identifierRef: "resource-html",
            resource: {
              identifierRef: "resource-html",
              hrefs: ["сontent/i123/content.html"]
            },
            children: []
          },
          {
            id: "node-quiz",
            title: "Module Quiz",
            kind: "quiz",
            depth: 1,
            identifierRef: "resource-quiz",
            resource: {
              identifierRef: "resource-quiz",
              hrefs: ["quiz/iq123/qti_item.xml"]
            },
            children: []
          }
        ]
      }
    ]
  };

  const plan = buildCourseShellPlan({
    projectSlug: "forensics35",
    courseTitle: "Forensic Science 35",
    courseSubtitle: "Brightspace course shell",
    overview: "Overview",
    blueprint,
    assessmentMap,
    lessonPacketIndex,
    courseMap,
    activitySourceMetadataByHref: {
      "сontent/i123/content.html": {
        contentPreview: "This is a extracted preview snippet."
      }
    }
  });

  const readingActivity = plan.modules[0]?.activities.find((activity) => activity.title === "Course Reading");
  const quizActivity = plan.modules[0]?.activities.find((activity) => activity.title === "Module Quiz");

  assert.ok(readingActivity);
  assert.equal(readingActivity?.sourceHref, "сontent/i123/content.html");
  assert.equal(readingActivity?.resourceKind, "html");
  assert.equal(readingActivity?.renderHint, "reading");
  assert.equal(readingActivity?.contentPreview, "This is a extracted preview snippet.");

  assert.ok(quizActivity);
  assert.equal(quizActivity?.resourceKind, "quiz");
  assert.equal(quizActivity?.renderHint, "assessment");
  assert.equal(readingActivity?.moduleVisibilityLabel, "visible");
});

test("buildCourseShellPlan omits course information, student resources, extra credits, and hidden teacher modules", () => {
  const blueprint: CourseBlueprint = {
    projectId: "experimental-psych",
    generatedAt: "2026-03-18T00:00:00.000Z",
    authoritySummary: {
      outlineResourceIds: [],
      assessmentResourceIds: [],
      supportingResourceIds: []
    },
    units: [],
    outcomes: [],
    warnings: []
  };

  const assessmentMap: AssessmentMap = {
    projectId: "experimental-psych",
    generatedAt: "2026-03-18T00:00:00.000Z",
    assessments: [],
    warnings: []
  };

  const lessonPacketIndex: LessonPacketIndex = {
    projectId: "experimental-psych",
    generatedAt: "2026-03-18T00:00:00.000Z",
    lessonPackets: [],
    warnings: []
  };

  const courseMap: D2LCourseMap = {
    schemaVersion: 1,
    projectId: "experimental-psych",
    projectSlug: "experimental-psych",
    generatedAt: "2026-03-18T00:00:00.000Z",
    manifestPath: "imsmanifest.xml",
    courseTitle: "Experimental Psychology 30",
    summary: {
      moduleCount: 5,
      itemCount: 4,
      lessonCount: 4,
      assignmentCount: 0,
      quizCount: 0,
      pdfCount: 0,
      htmlCount: 4
    },
    modules: [
      {
        id: "course-info",
        title: "Course Information",
        kind: "module",
        depth: 0,
        children: [
          {
            id: "intro-item",
            title: "Welcome",
            kind: "html",
            depth: 1,
            children: []
          }
        ]
      },
      {
        id: "module-1",
        title: "Module 1: Experimental Psychology Overview",
        kind: "module",
        depth: 0,
        children: [
          {
            id: "module-1-item",
            title: "What is Experimental Psychology?",
            kind: "html",
            depth: 1,
            children: []
          }
        ]
      },
      {
        id: "student-resources",
        title: "Student Resource Materials",
        kind: "module",
        depth: 0,
        children: []
      },
      {
        id: "extra-credits",
        title: "Extra Credits",
        kind: "module",
        depth: 0,
        children: [
          {
            id: "extra-item",
            title: "Student Centred Learning Self Reflection",
            kind: "html",
            depth: 1,
            children: []
          }
        ]
      },
      {
        id: "teacher-resources",
        title: "Teacher Resources (Keep Hidden)",
        kind: "module",
        depth: 0,
        children: [
          {
            id: "teacher-item",
            title: "Rubric",
            kind: "html",
            depth: 1,
            children: []
          }
        ]
      }
    ]
  };

  const plan = buildCourseShellPlan({
    projectSlug: "experimental-psych",
    courseTitle: "Experimental Psychology 30",
    overview: "Overview",
    blueprint,
    assessmentMap,
    lessonPacketIndex,
    courseMap
  });

  assert.equal(plan.modules.length, 1);
  assert.equal(plan.modules[0]?.title, "Module 1: Experimental Psychology Overview");
  assert.equal(plan.modules[0]?.activities.some((activity) => activity.title === "What is Experimental Psychology?"), true);
});

test("buildCourseShellPlan preserves section titles from nested course-map folders", () => {
  const blueprint: CourseBlueprint = {
    projectId: "experimental-psych",
    generatedAt: "2026-03-18T00:00:00.000Z",
    authoritySummary: {
      outlineResourceIds: [],
      assessmentResourceIds: [],
      supportingResourceIds: []
    },
    units: [],
    outcomes: [],
    warnings: []
  };

  const assessmentMap: AssessmentMap = {
    projectId: "experimental-psych",
    generatedAt: "2026-03-18T00:00:00.000Z",
    assessments: [],
    warnings: []
  };

  const lessonPacketIndex: LessonPacketIndex = {
    projectId: "experimental-psych",
    generatedAt: "2026-03-18T00:00:00.000Z",
    lessonPackets: [],
    warnings: []
  };

  const courseMap: D2LCourseMap = {
    schemaVersion: 1,
    projectId: "experimental-psych",
    projectSlug: "experimental-psych",
    generatedAt: "2026-03-18T00:00:00.000Z",
    manifestPath: "imsmanifest.xml",
    courseTitle: "Experimental Psychology 30",
    summary: {
      moduleCount: 1,
      itemCount: 3,
      lessonCount: 3,
      assignmentCount: 0,
      quizCount: 0,
      pdfCount: 0,
      htmlCount: 3
    },
    modules: [
      {
        id: "module-1",
        title: "Module 1: Experimental Psychology Overview",
        kind: "module",
        depth: 0,
        children: [
          {
            id: "section-1",
            title: "Section 1: Experimental Psychology Defined",
            kind: "folder",
            depth: 1,
            children: [
              {
                id: "node-1",
                title: "What is Experimental Psychology?",
                kind: "html",
                depth: 2,
                children: []
              }
            ]
          },
          {
            id: "node-2",
            title: "Section 1 Conclusion",
            kind: "html",
            depth: 1,
            children: []
          },
          {
            id: "section-2",
            title: "Section 2: Research Methodologies",
            kind: "folder",
            depth: 1,
            children: [
              {
                id: "node-3",
                title: "Research Methodology",
                kind: "html",
                depth: 2,
                children: []
              }
            ]
          }
        ]
      }
    ]
  };

  const plan = buildCourseShellPlan({
    projectSlug: "experimental-psych",
    courseTitle: "Experimental Psychology 30",
    overview: "Overview",
    blueprint,
    assessmentMap,
    lessonPacketIndex,
    courseMap
  });

  const sectionOneLesson = plan.modules[0]?.activities.find((activity) => activity.title === "What is Experimental Psychology?");
  const sectionOneConclusion = plan.modules[0]?.activities.find((activity) => activity.title === "Section 1 Conclusion");
  const sectionTwoLesson = plan.modules[0]?.activities.find((activity) => activity.title === "Research Methodology");

  assert.equal(sectionOneLesson?.sectionTitle, "Section 1: Experimental Psychology Defined");
  assert.equal(sectionOneConclusion?.sectionTitle, "");
  assert.equal(sectionTwoLesson?.sectionTitle, "Section 2: Research Methodologies");
});
