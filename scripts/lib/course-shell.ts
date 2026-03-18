import { compactUnique } from "./course-planning-support.js";
import type { AssessmentMap, CourseBlueprint, D2LCourseMap, D2LCourseMapNode, LessonPacketIndex } from "./types.js";

export type CourseShellActivityKind = "overview" | "lesson" | "assessment" | "reflection";
export type CourseShellResourceKind = "html" | "pdf" | "assignment" | "quiz" | "other";
export type CourseShellRenderHint = "reading" | "assessment" | "media" | "download" | "fallback";

export type CourseShellActivity = {
  id: string;
  kind: CourseShellActivityKind;
  title: string;
  description: string;
  order: number;
  linkedAssessmentIds: string[];
  linkedOutcomeIds: string[];
  status: "pending" | "complete";
  sourceHref: string;
  resourceKind: CourseShellResourceKind;
  moduleTitle: string;
  moduleSequence: number;
  moduleVisibilityLabel: string;
  contentPreview: string;
  renderHint: CourseShellRenderHint;
};

export type CourseShellModule = {
  id: string;
  title: string;
  overline: string;
  summary: string;
  sequence: number;
  lessonCount: number;
  assessmentCount: number;
  activityCount: number;
  completedCount: number;
  activities: CourseShellActivity[];
};

export type CourseShellReportSection = {
  id: string;
  title: string;
  type: "module" | "reflection";
  summary: string;
  items: string[];
};

export type CourseShellPlan = {
  projectSlug: string;
  title: string;
  subtitle: string;
  overview: string;
  storageKey: string;
  modules: CourseShellModule[];
  reflection: {
    id: "reflection";
    title: string;
    overline: string;
    description: string;
    prompts: string[];
    requiredResponses: number;
  };
  report: {
    title: string;
    intro: string;
    sections: CourseShellReportSection[];
  };
  stats: {
    moduleCount: number;
    lessonCount: number;
    assessmentCount: number;
    activityCount: number;
  };
};

export type BuildCourseShellPlanOptions = {
  projectSlug: string;
  courseTitle: string;
  courseSubtitle?: string;
  overview: string;
  courseMap?: D2LCourseMap | null;
  blueprint: CourseBlueprint;
  assessmentMap: AssessmentMap;
  lessonPacketIndex: LessonPacketIndex;
  activitySourceMetadataByHref?: Record<
    string,
    {
      contentPreview?: string;
    }
  >;
  reflectionPrompts?: string[];
  reportTitle?: string;
};

function unique(values: string[]) {
  return compactUnique(values, Number.POSITIVE_INFINITY);
}

function titleFromSequence(sequence: number, title: string) {
  const cleanedTitle = title
    .trim()
    .replace(/^(?:module\s*)?\d+\s*[:.)-]?\s*/i, "")
    .trim();
  const prefix = Number.isFinite(sequence) ? `Module ${sequence}` : "Module";
  return cleanedTitle.length > 0 ? `${prefix}: ${cleanedTitle}` : prefix;
}

function normalizeTitle(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function normalizePath(value: string) {
  return String(value || "").replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/{2,}/g, "/");
}

function extractModuleSequence(title: string, fallbackSequence: number) {
  const match = title.match(/\b(?:module|lesson)\s*(\d+)\b/i) || title.match(/^(\d+)\b/);
  return match ? Number(match[1]) : fallbackSequence;
}

function moduleVisibilityLabelFromTitle(title: string) {
  return /keep hidden|teacher resources|instructor only/i.test(title) ? "hidden" : "visible";
}

function inferResourceKind(kind: string, sourceHref: string): CourseShellResourceKind {
  const normalizedHref = normalizePath(sourceHref).toLowerCase();
  if (kind === "assignment" || normalizedHref.includes("/assignment/") || normalizedHref.endsWith(".xml")) {
    if (normalizedHref.includes("/quiz/") || normalizedHref.includes("/qti_")) {
      return "quiz";
    }
    return "assignment";
  }
  if (kind === "quiz" || normalizedHref.includes("/quiz/") || normalizedHref.includes("/qti_")) {
    return "quiz";
  }
  if (kind === "pdf" || normalizedHref.endsWith(".pdf")) {
    return "pdf";
  }
  if (kind === "html" || normalizedHref.endsWith(".html") || normalizedHref.endsWith(".htm")) {
    return "html";
  }
  return "other";
}

function inferRenderHint(resourceKind: CourseShellResourceKind, title: string): CourseShellRenderHint {
  if (resourceKind === "assignment" || resourceKind === "quiz") {
    return "assessment";
  }
  if (resourceKind === "pdf") {
    return "download";
  }
  if (resourceKind === "html") {
    if (/video|documentary|youtube|vimeo|embed/i.test(title)) {
      return "media";
    }
    return "reading";
  }
  return "fallback";
}

function resolveContentPreview(
  sourceHref: string,
  metadataByHref: BuildCourseShellPlanOptions["activitySourceMetadataByHref"]
) {
  const normalizedHref = normalizePath(sourceHref);
  if (!normalizedHref || !metadataByHref) {
    return "";
  }
  return String(metadataByHref[normalizedHref]?.contentPreview || "").trim();
}

type ActivityMetadata = {
  moduleTitle: string;
  moduleSequence: number;
  moduleVisibilityLabel: string;
  sourceHref: string;
  resourceKind: CourseShellResourceKind;
  contentPreview: string;
  renderHint: CourseShellRenderHint;
};

function buildActivityMetadata(
  options: {
    moduleTitle: string;
    moduleSequence: number;
    moduleVisibilityLabel: string;
    sourceHref: string;
    sourceKind: string;
    title: string;
    activitySourceMetadataByHref?: BuildCourseShellPlanOptions["activitySourceMetadataByHref"];
  }
): ActivityMetadata {
  const sourceHref = normalizePath(options.sourceHref);
  const resourceKind = inferResourceKind(options.sourceKind, sourceHref);
  return {
    moduleTitle: options.moduleTitle,
    moduleSequence: options.moduleSequence,
    moduleVisibilityLabel: options.moduleVisibilityLabel,
    sourceHref,
    resourceKind,
    contentPreview: resolveContentPreview(sourceHref, options.activitySourceMetadataByHref),
    renderHint: inferRenderHint(resourceKind, options.title)
  };
}

function flattenCourseNodes(nodes: D2LCourseMapNode[]) {
  const results: D2LCourseMapNode[] = [];
  for (const node of nodes) {
    if (node.resource?.hrefs?.length || node.children.length === 0) {
      results.push(node);
    } else {
      results.push(...flattenCourseNodes(node.children));
    }
  }
  return results;
}

function moduleSummaryFromBlueprint(unit: CourseBlueprint["units"][number]) {
  return unit.mustKnow[0] || unit.requiredConcepts[0] || unit.title;
}

function moduleSummaryFromCourseMap(module: D2LCourseMapNode) {
  const firstLeaf = flattenCourseNodes(module.children).find((node) => node.title.trim().length > 0);
  return firstLeaf?.title.replace(/^(?:module\s*)?\d+\s*[:.)-]?\s*/i, "").trim() || module.title;
}

function matchesUnitId(unitId: string, value: string) {
  return value === unitId;
}

function matchesOutcomeIds(unitOutcomeIds: string[], values: string[]) {
  const outcomeIdSet = new Set(unitOutcomeIds);
  return values.some((value) => outcomeIdSet.has(value));
}

function buildActivities(
  projectSlug: string,
  unit: CourseBlueprint["units"][number],
  assessmentMap: AssessmentMap,
  lessonPacketIndex: LessonPacketIndex
) {
  const lessonPackets = lessonPacketIndex.lessonPackets.filter(
    (packet) =>
      matchesUnitId(unit.id, packet.unitId) ||
      matchesOutcomeIds(unit.outcomeIds, packet.targetOutcomeIds)
  );

  const assessments = assessmentMap.assessments.filter(
    (assessment) =>
      assessment.relatedUnitIds.includes(unit.id) ||
      matchesOutcomeIds(unit.outcomeIds, assessment.relatedOutcomeIds) ||
      assessment.id === unit.linkedAssessmentIds[0]
  );

  const activities: CourseShellActivity[] = [
    {
      id: `${projectSlug}::${unit.id}::overview`,
      kind: "overview",
      title: titleFromSequence(unit.sequence, unit.title),
      description: moduleSummaryFromBlueprint(unit),
      order: 0,
      linkedAssessmentIds: unique(unit.linkedAssessmentIds),
      linkedOutcomeIds: unique(unit.outcomeIds),
      status: "pending",
      ...buildActivityMetadata({
        moduleTitle: titleFromSequence(unit.sequence, unit.title),
        moduleSequence: unit.sequence,
        moduleVisibilityLabel: moduleVisibilityLabelFromTitle(unit.title),
        sourceHref: "",
        sourceKind: "other",
        title: titleFromSequence(unit.sequence, unit.title)
      })
    }
  ];

  for (const [index, packet] of lessonPackets.entries()) {
    activities.push({
      id: `${projectSlug}::${packet.lessonId}`,
      kind: "lesson",
      title: packet.lessonTitle,
      description: packet.lessonTitle,
      order: activities.length + index,
      linkedAssessmentIds: unique(packet.linkedAssessmentIds),
      linkedOutcomeIds: unique(packet.targetOutcomeIds ?? []),
      status: "pending",
      ...buildActivityMetadata({
        moduleTitle: titleFromSequence(unit.sequence, unit.title),
        moduleSequence: unit.sequence,
        moduleVisibilityLabel: moduleVisibilityLabelFromTitle(unit.title),
        sourceHref: "",
        sourceKind: "other",
        title: packet.lessonTitle
      })
    });
  }

  for (const [index, assessment] of assessments.entries()) {
    activities.push({
      id: `${projectSlug}::${assessment.id}`,
      kind: "assessment",
      title: assessment.name,
      description: assessment.successCriteria?.[0] || assessment.deliverable,
      order: activities.length + index,
      linkedAssessmentIds: [assessment.id],
      linkedOutcomeIds: unique(assessment.relatedOutcomeIds),
      status: "pending",
      ...buildActivityMetadata({
        moduleTitle: titleFromSequence(unit.sequence, unit.title),
        moduleSequence: unit.sequence,
        moduleVisibilityLabel: moduleVisibilityLabelFromTitle(unit.title),
        sourceHref: "",
        sourceKind: "assignment",
        title: assessment.name
      })
    });
  }

  return activities;
}

function buildActivitiesFromCourseMap(
  projectSlug: string,
  module: D2LCourseMapNode,
  assessmentMap: AssessmentMap,
  lessonPacketIndex: LessonPacketIndex,
  activitySourceMetadataByHref?: BuildCourseShellPlanOptions["activitySourceMetadataByHref"]
) {
  const leaves = flattenCourseNodes(module.children);
  const sequence = extractModuleSequence(module.title, 1);
  const moduleTitle = titleFromSequence(sequence, module.title);
  const moduleVisibilityLabel = moduleVisibilityLabelFromTitle(module.title);
  const overviewActivity: CourseShellActivity = {
    id: `${projectSlug}::${module.id}::overview`,
    kind: "overview",
    title: moduleTitle,
    description: moduleSummaryFromCourseMap(module),
    order: 0,
    linkedAssessmentIds: [],
    linkedOutcomeIds: [],
    status: "pending",
    ...buildActivityMetadata({
      moduleTitle,
      moduleSequence: sequence,
      moduleVisibilityLabel,
      sourceHref: "",
      sourceKind: "other",
      title: moduleTitle,
      activitySourceMetadataByHref
    })
  };

  const activities: CourseShellActivity[] = [overviewActivity];

  for (const [index, leaf] of leaves.entries()) {
    const leafTitle = leaf.title.trim();
    const lowerTitle = leafTitle.toLowerCase();
    const isAssessment = leaf.kind === "assignment" || leaf.kind === "quiz" || /assessment|assignment|quiz/i.test(lowerTitle);
    const isLesson = !isAssessment;
    const matchingAssessment = assessmentMap.assessments.find(
      (assessment) => normalizeTitle(assessment.name) === normalizeTitle(leafTitle)
    );
    const matchingPacket = lessonPacketIndex.lessonPackets.find(
      (packet) => normalizeTitle(packet.lessonTitle) === normalizeTitle(leafTitle)
    );
    const sourceHref = normalizePath(leaf.resource?.hrefs?.[0] || "");

    activities.push({
      id: `${projectSlug}::${leaf.id}`,
      kind: isAssessment ? "assessment" : "lesson",
      title: leafTitle,
      description:
        matchingAssessment?.successCriteria?.[0] ||
        matchingPacket?.lessonTitle ||
        (isLesson ? "Course content item" : "Assessment item"),
      order: index + 1,
      linkedAssessmentIds: unique([
        ...(matchingAssessment ? [matchingAssessment.id] : []),
        ...(matchingPacket?.linkedAssessmentIds ?? [])
      ]),
      linkedOutcomeIds: unique([
        ...(matchingAssessment?.relatedOutcomeIds ?? []),
        ...(matchingPacket?.targetOutcomeIds ?? [])
      ]),
      status: "pending",
      ...buildActivityMetadata({
        moduleTitle,
        moduleSequence: sequence,
        moduleVisibilityLabel,
        sourceHref,
        sourceKind: leaf.kind,
        title: leafTitle,
        activitySourceMetadataByHref
      })
    });
  }

  return activities;
}

function buildReportSections(
  modules: CourseShellModule[],
  reflectionPrompts: string[]
): CourseShellReportSection[] {
  const sections: CourseShellReportSection[] = modules.map((module) => ({
    id: module.id,
    title: module.title,
    type: "module",
    summary: module.summary,
    items: module.activities.map((activity) => `${activity.title}: ${activity.description}`)
  }));

  sections.push({
    id: "reflection",
    title: "Reflection",
    type: "reflection",
    summary: "Three reflection responses complete the print-ready report.",
    items: reflectionPrompts
  });

  return sections;
}

export function buildCourseShellPlan(options: BuildCourseShellPlanOptions): CourseShellPlan {
  const modules = options.courseMap?.modules?.length
    ? options.courseMap.modules
        .slice()
        .filter((module) => module.title.trim().length > 0)
        .map((module, index) => {
          const sequence = extractModuleSequence(module.title, index + 1);
          const activities = buildActivitiesFromCourseMap(
            options.projectSlug,
            module,
            options.assessmentMap,
            options.lessonPacketIndex,
            options.activitySourceMetadataByHref
          );
          const lessonCount = activities.filter((activity) => activity.kind === "lesson").length;
          const assessmentCount = activities.filter((activity) => activity.kind === "assessment").length;
          const completedCount = activities.filter((activity) => activity.status === "complete").length;

          return {
            id: module.id,
            title: titleFromSequence(sequence, module.title),
            overline: module.depth === 0 ? `Module ${sequence}` : `Section ${sequence}`,
            summary: moduleSummaryFromCourseMap(module),
            sequence,
            lessonCount,
            assessmentCount,
            activityCount: activities.length,
            completedCount,
            activities
          } satisfies CourseShellModule;
        })
    : options.blueprint.units
        .slice()
        .sort((left, right) => left.sequence - right.sequence || left.title.localeCompare(right.title))
        .map((unit) => {
          const activities = buildActivities(options.projectSlug, unit, options.assessmentMap, options.lessonPacketIndex);
          const lessonCount = activities.filter((activity) => activity.kind === "lesson").length;
          const assessmentCount = activities.filter((activity) => activity.kind === "assessment").length;
          const completedCount = activities.filter((activity) => activity.status === "complete").length;

          return {
            id: unit.id,
            title: titleFromSequence(unit.sequence, unit.title),
            overline: `Module ${unit.sequence}`,
            summary: moduleSummaryFromBlueprint(unit),
            sequence: unit.sequence,
            lessonCount,
            assessmentCount,
            activityCount: activities.length,
            completedCount,
            activities
          } satisfies CourseShellModule;
        });

  const reflectionPrompts = options.reflectionPrompts ?? [
    "Which activity felt most natural and why?",
    "What surprised you while working through the course?",
    "What career or topic do you want to research next?"
  ];

  return {
    projectSlug: options.projectSlug,
    title: options.courseTitle,
    subtitle: options.courseSubtitle ?? "",
    overview: options.overview,
    storageKey: `${options.projectSlug}::workspace-state::v1`,
    modules,
    reflection: {
      id: "reflection",
      title: "Reflection",
      overline: "Final response",
      description: "Capture the thinking students will print and submit with the final report.",
      prompts: reflectionPrompts,
      requiredResponses: reflectionPrompts.length
    },
    report: {
      title: options.reportTitle ?? `${options.courseTitle} - Print Report`,
      intro: options.overview,
      sections: buildReportSections(modules, reflectionPrompts)
    },
    stats: {
      moduleCount: modules.length,
      lessonCount: modules.reduce((sum, module) => sum + module.lessonCount, 0),
      assessmentCount: modules.reduce((sum, module) => sum + module.assessmentCount, 0),
      activityCount: modules.reduce((sum, module) => sum + module.activityCount, 0) + reflectionPrompts.length
    }
  };
}
