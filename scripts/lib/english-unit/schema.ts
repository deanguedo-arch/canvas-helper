import { z } from "zod";

import type {
  EnglishActivityProfileV1,
  EnglishContractValidationIssue,
  EnglishCourseManifestV1,
  EnglishEvidenceEntryV2,
  EnglishReviewStatus,
  EnglishUnitRecipeV1,
  EnglishUnitRecipeV2
} from "./types.js";

const nonEmptyString = z.string().trim().min(1);
const sha256 = z.string().regex(/^[a-f\d]{64}$/i, "Expected a SHA-256 hex digest.");
const isoDateTime = z.string().datetime({ offset: true });

export const EnglishResourceRoleSchema = z.enum([
  "lesson",
  "reading",
  "question-set",
  "supporting-resource",
  "media",
  "excluded-assessment"
]);

export const EnglishActivityProfileKindSchema = z.enum([
  "short-fiction",
  "modern-drama",
  "shakespeare-drama",
  "novel-study",
  "film-study"
]);

export const EnglishReviewStatusSchema = z.enum(["draft", "needs-review", "ready-for-export", "blocked"]);

export const EnglishActivityEvidencePolicySchema = z
  .object({
    id: nonEmptyString,
    activityId: nonEmptyString,
    saveMode: z.enum(["individual", "collection", "disabled"]),
    requiresExplicitSave: z.literal(true),
    contributionIdTemplate: nonEmptyString.optional(),
    collectionScope: z.enum(["activity", "work", "locator"]).optional(),
    responseIds: z.array(nonEmptyString).optional(),
    tags: z.array(nonEmptyString).optional()
  })
  .strict()
  .superRefine((policy, context) => {
    if (policy.saveMode !== "disabled" && !policy.contributionIdTemplate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contributionIdTemplate"],
        message: "Enabled evidence policies require a stable contribution id template."
      });
    }
    if (policy.saveMode === "collection" && !policy.collectionScope) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["collectionScope"],
        message: "Collection evidence policies require a collection scope."
      });
    }
  });

const builtInComponentSlots = new Set([
  "lesson-after-content",
  "writing-studio",
  "analysis-explorer",
  "reading-notebook",
  "act-tracker",
  "film-scene-log",
  "custom-page"
]);

export const EnglishComponentSlotSchema = nonEmptyString.refine(
  (slot) => builtInComponentSlots.has(slot) || /^custom:[a-z0-9][a-z0-9-]*$/.test(slot),
  "Expected a built-in component slot or a custom:<slug> slot."
);

export const EnglishActivityDefinitionSchema = z
  .object({
    id: nonEmptyString,
    title: nonEmptyString,
    route: nonEmptyString,
    enabled: z.boolean(),
    evidencePolicyIds: z.array(nonEmptyString),
    componentSlot: EnglishComponentSlotSchema.optional()
  })
  .strict();

const activityProfileBase = z.object({
  schemaVersion: z.literal(1),
  activities: z.array(EnglishActivityDefinitionSchema),
  evidencePolicies: z.array(EnglishActivityEvidencePolicySchema)
});

export const EnglishShortFictionActivityProfileSchema = activityProfileBase
  .extend({
    kind: z.literal("short-fiction"),
    readerMode: z.literal("text-bank"),
    questionCollectionScope: z.literal("story"),
    analysisExplorer: z.boolean()
  })
  .strict();

export const EnglishModernDramaActivityProfileSchema = activityProfileBase
  .extend({
    kind: z.literal("modern-drama"),
    actIds: z.array(nonEmptyString).min(1),
    characterIds: z.array(nonEmptyString),
    criticalEssay: z.boolean()
  })
  .strict();

export const EnglishShakespeareDramaActivityProfileSchema = activityProfileBase
  .extend({
    kind: z.literal("shakespeare-drama"),
    actIds: z.array(nonEmptyString).min(1),
    sceneCount: z.number().int().positive(),
    sideBySideReader: z.literal(true),
    characterIds: z.array(nonEmptyString).min(1),
    writingTools: z.array(
      z.enum([
        "language-lab",
        "close-reading",
        "theme-builder",
        "character-change-paragraph",
        "critical-essay",
        "graphic-essay"
      ])
    ),
    editorialStatus: z.enum(["needs-editorial", "reviewed"])
  })
  .strict();

export const EnglishNovelStudyActivityProfileSchema = activityProfileBase
  .extend({
    kind: z.literal("novel-study"),
    novels: z
      .array(
        z
          .object({
            id: nonEmptyString,
            title: nonEmptyString,
            author: nonEmptyString.optional()
          })
          .strict()
      )
      .min(1),
    questionPhases: z.array(z.enum(["opening", "middle", "final"])).min(1),
    genericQuestionCount: z.number().int().nonnegative(),
    writingTools: z.array(z.enum(["analytical-paragraph", "motif-string", "authors-intent", "critical-essay"]))
  })
  .strict();

const filmSelectionSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("pending") }).strict(),
  z.object({ mode: z.literal("selected"), title: nonEmptyString, year: z.number().int().positive().optional() }).strict()
]);

export const EnglishFilmStudyActivityProfileSchema = activityProfileBase
  .extend({
    kind: z.literal("film-study"),
    filmSelection: filmSelectionSchema,
    techniqueQuestionCount: z.number().int().nonnegative(),
    fullResponseQuestionCount: z.number().int().nonnegative(),
    criticalEssayFieldCount: z.number().int().nonnegative(),
    viewingGuide: z.boolean()
  })
  .strict();

export const EnglishActivityProfileV1Schema = z.discriminatedUnion("kind", [
  EnglishShortFictionActivityProfileSchema,
  EnglishModernDramaActivityProfileSchema,
  EnglishShakespeareDramaActivityProfileSchema,
  EnglishNovelStudyActivityProfileSchema,
  EnglishFilmStudyActivityProfileSchema
]);

const questionPromptSchema = z
  .object({
    id: nonEmptyString,
    prompt: nonEmptyString,
    sourcePage: z.number().int().positive().optional()
  })
  .strict();

const readingSchema = z
  .object({
    id: nonEmptyString,
    title: nonEmptyString,
    author: z.string(),
    kind: z.enum(["short-fiction", "visual-narrative", "paired-perspective"]),
    group: nonEmptyString,
    readingFile: nonEmptyString,
    questionFile: nonEmptyString,
    questionPages: z.array(z.number().int().positive()).optional(),
    questionPrompts: z.array(questionPromptSchema).optional()
  })
  .strict();

const placementSchema = z
  .object({
    targetLesson: nonEmptyString,
    readingIds: z.array(nonEmptyString),
    questionRefs: z.array(nonEmptyString),
    purpose: nonEmptyString
  })
  .strict();

const analysisTermSchema = z
  .object({
    id: nonEmptyString,
    category: nonEmptyString,
    label: nonEmptyString,
    definition: nonEmptyString
  })
  .strict();

const analysisExampleSchema = z
  .object({
    readingId: nonEmptyString,
    termId: nonEmptyString.optional(),
    term: nonEmptyString,
    evidenceMoment: nonEmptyString,
    analysis: nonEmptyString
  })
  .strict();

const mediaPolicySchema = z
  .object({
    verifiedAt: nonEmptyString,
    allowedYouTubeIds: z.array(nonEmptyString),
    blockedYouTubeIds: z.array(nonEmptyString),
    approvedExternalUrls: z.array(nonEmptyString),
    externalUrlRewrites: z.record(z.string())
  })
  .strict();

const excludedFileSchema = z.object({ file: nonEmptyString, reason: nonEmptyString }).strict();
const wordingCorrectionSchema = z
  .object({ find: nonEmptyString, replace: z.string(), reason: nonEmptyString })
  .strict();

const v1SourceSchema = z
  .object({
    brightspaceZip: nonEmptyString,
    teacherResourcesZip: nonEmptyString,
    brightspaceUnitId: nonEmptyString,
    teacherFolder: nonEmptyString
  })
  .strict();

export const EnglishUnitRecipeV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    projectSlug: nonEmptyString,
    courseCode: nonEmptyString,
    courseTitle: nonEmptyString,
    unitTitle: nonEmptyString,
    source: v1SourceSchema,
    lessonOrder: z.array(nonEmptyString),
    topLevelLessonOrder: z.array(nonEmptyString),
    fictionElementsHub: z
      .object({
        hubLesson: nonEmptyString,
        contextLesson: nonEmptyString.optional(),
        childLessons: z.array(nonEmptyString)
      })
      .strict(),
    readings: z.array(readingSchema),
    placements: z.array(placementSchema),
    analysisTerms: z.array(analysisTermSchema),
    analysisExamples: z.array(analysisExampleSchema),
    excludedFiles: z.array(excludedFileSchema),
    wordingCorrections: z.array(wordingCorrectionSchema),
    mediaPolicy: mediaPolicySchema
  })
  .strict();

export const EnglishLessonSelectorV2Schema = z
  .object({
    itemId: nonEmptyString,
    disposition: z.enum(["include", "exclude"]),
    title: nonEmptyString.optional(),
    includeChildren: z.boolean().optional(),
    reason: nonEmptyString.optional()
  })
  .strict();

const v2SourceSchema = v1SourceSchema
  .extend({
    archiveRefs: z
      .object({
        brightspace: nonEmptyString,
        teacherResources: nonEmptyString
      })
      .strict()
      .optional(),
    lessonSelectors: z.array(EnglishLessonSelectorV2Schema).min(1)
  })
  .strict();

export const EnglishResourceDispositionV2Schema = z
  .object({
    id: nonEmptyString,
    source: nonEmptyString,
    title: nonEmptyString.optional(),
    role: EnglishResourceRoleSchema,
    disposition: z.enum(["place", "exclude", "review-required"]),
    destination: nonEmptyString.optional(),
    targetLessonIds: z.array(nonEmptyString).optional(),
    reason: nonEmptyString
  })
  .strict();

export const EnglishComponentOverrideSchema = z
  .object({
    id: nonEmptyString,
    slot: EnglishComponentSlotSchema,
    mode: z.enum(["extend", "replace"]),
    source: nonEmptyString,
    assetRoot: nonEmptyString.optional(),
    enabled: z.boolean(),
    order: z.number().int().optional()
  })
  .strict();

const lessonGroupSchema = z
  .object({ id: nonEmptyString, title: nonEmptyString, lessonIds: z.array(nonEmptyString) })
  .strict();

const acceptanceSchema = z
  .object({
    requiredRoutes: z.array(nonEmptyString),
    requiredActivityIds: z.array(nonEmptyString),
    reviewItems: z.array(nonEmptyString)
  })
  .strict();

export const EnglishUnitRecipeV2Schema = z
  .object({
    schemaVersion: z.literal(2),
    projectSlug: nonEmptyString,
    courseCode: nonEmptyString,
    courseTitle: nonEmptyString,
    unitTitle: nonEmptyString,
    profileVersion: nonEmptyString,
    status: EnglishReviewStatusSchema,
    source: v2SourceSchema,
    activityProfile: EnglishActivityProfileV1Schema,
    lessonOrder: z.array(nonEmptyString).min(1),
    topLevelLessonOrder: z.array(nonEmptyString).min(1),
    lessonGroups: z.array(lessonGroupSchema),
    fictionElementsHub: z
      .object({
        hubLesson: nonEmptyString,
        contextLesson: nonEmptyString.optional(),
        childLessons: z.array(nonEmptyString)
      })
      .strict()
      .optional(),
    readings: z.array(readingSchema),
    placements: z.array(placementSchema),
    analysisTerms: z.array(analysisTermSchema),
    analysisExamples: z.array(analysisExampleSchema),
    resourceDispositions: z.array(EnglishResourceDispositionV2Schema),
    excludedFiles: z.array(excludedFileSchema),
    wordingCorrections: z.array(wordingCorrectionSchema),
    mediaPolicy: mediaPolicySchema,
    customComponents: z.array(EnglishComponentOverrideSchema),
    acceptance: acceptanceSchema
  })
  .strict();

export const EnglishUnitRecipeSchema = z.discriminatedUnion("schemaVersion", [
  EnglishUnitRecipeV1Schema,
  EnglishUnitRecipeV2Schema
]);

export const EnglishCourseManifestV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    courseId: nonEmptyString,
    courseCode: nonEmptyString,
    courseTitle: nonEmptyString,
    profileId: nonEmptyString,
    profileVersion: nonEmptyString,
    archives: z.array(
      z
        .object({
          id: nonEmptyString,
          kind: z.enum(["brightspace", "teacher-resources"]),
          path: nonEmptyString,
          sha256,
          importedAt: isoDateTime.optional()
        })
        .strict()
    ),
    units: z.array(
      z
        .object({
          projectSlug: nonEmptyString,
          unitTitle: nonEmptyString,
          recipePath: nonEmptyString,
          profileVersion: nonEmptyString,
          activityProfile: EnglishActivityProfileKindSchema,
          brightspaceUnitIds: z.array(nonEmptyString).min(1),
          reviewStatus: EnglishReviewStatusSchema
        })
        .strict()
    ),
    generatedAt: isoDateTime.optional()
  })
  .strict();

export const EnglishEvidenceEntryV2Schema = z
  .object({
    schemaVersion: z.literal(2),
    contributionId: nonEmptyString,
    projectSlug: nonEmptyString,
    entryKind: z.enum(["individual", "collection"]),
    source: z
      .object({
        kind: z.enum(["lesson", "reading", "question-set", "writing-studio", "activity", "media"]),
        id: nonEmptyString,
        title: nonEmptyString.optional()
      })
      .strict(),
    activity: z
      .object({
        id: nonEmptyString,
        profile: EnglishActivityProfileKindSchema,
        title: nonEmptyString.optional()
      })
      .strict(),
    work: z
      .object({
        id: nonEmptyString,
        title: nonEmptyString,
        kind: z.enum(["text", "film", "visual", "paired-text"])
      })
      .strict()
      .optional(),
    locator: z
      .object({
        label: nonEmptyString.optional(),
        act: nonEmptyString.optional(),
        scene: nonEmptyString.optional(),
        chapter: nonEmptyString.optional(),
        timestamp: nonEmptyString.optional()
      })
      .strict()
      .optional(),
    prompt: nonEmptyString.optional(),
    answer: z.string().optional(),
    evidence: z.string().optional(),
    analysis: z.string().optional(),
    responseIds: z.array(nonEmptyString).optional(),
    tags: z.array(nonEmptyString),
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
    metadata: z.record(z.unknown()).optional()
  })
  .strict()
  .superRefine((entry, context) => {
    const hasContent = [entry.answer, entry.evidence, entry.analysis].some((value) => value && value.trim().length > 0);
    if (!hasContent && (!entry.responseIds || entry.responseIds.length === 0)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["evidence"],
        message: "Evidence entries require saved content or at least one response id."
      });
    }
  });

export const EnglishEvidenceFilterV2Schema = z
  .object({
    activityId: nonEmptyString.optional(),
    profile: EnglishActivityProfileKindSchema.optional(),
    workId: nonEmptyString.optional(),
    locator: nonEmptyString.optional(),
    tags: z.array(nonEmptyString).optional()
  })
  .strict();

export const EnglishUnitBuildManifestV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    projectSlug: nonEmptyString,
    generatedAt: isoDateTime,
    status: z.enum(["success", "needs-review", "failed"]),
    profile: z.object({ id: nonEmptyString, version: nonEmptyString, sha256 }).strict(),
    recipe: z.object({ path: nonEmptyString, sha256 }).strict(),
    sources: z.array(z.object({ id: nonEmptyString, path: nonEmptyString, sha256 }).strict()),
    components: z.array(z.object({ id: nonEmptyString, source: nonEmptyString, sha256 }).strict()),
    ownedFiles: z.array(nonEmptyString),
    reviewItems: z.array(nonEmptyString)
  })
  .strict();

function duplicateIssues(values: string[], path: Array<string | number>, code: string): EnglishContractValidationIssue[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates].map((value) => ({
    code,
    path,
    message: `Duplicate id "${value}".`
  }));
}

function referenceIssue(code: string, path: Array<string | number>, value: string, kind: string): EnglishContractValidationIssue {
  return { code, path, message: `Unknown ${kind} reference "${value}".` };
}

export function validateEnglishActivityProfileCrossReferences(
  profile: EnglishActivityProfileV1
): EnglishContractValidationIssue[] {
  const issues: EnglishContractValidationIssue[] = [];
  const activityIds = profile.activities.map((activity) => activity.id);
  const policyIds = profile.evidencePolicies.map((policy) => policy.id);
  const activityIdSet = new Set(activityIds);
  const policyById = new Map(profile.evidencePolicies.map((policy) => [policy.id, policy]));

  issues.push(...duplicateIssues(activityIds, ["activityProfile", "activities"], "duplicate_activity_id"));
  issues.push(...duplicateIssues(policyIds, ["activityProfile", "evidencePolicies"], "duplicate_evidence_policy_id"));

  profile.evidencePolicies.forEach((policy, index) => {
    if (!activityIdSet.has(policy.activityId)) {
      issues.push(
        referenceIssue(
          "unknown_policy_activity",
          ["activityProfile", "evidencePolicies", index, "activityId"],
          policy.activityId,
          "activity"
        )
      );
    }
  });

  profile.activities.forEach((activity, activityIndex) => {
    activity.evidencePolicyIds.forEach((policyId, policyIndex) => {
      const policy = policyById.get(policyId);
      if (!policy) {
        issues.push(
          referenceIssue(
            "unknown_activity_evidence_policy",
            ["activityProfile", "activities", activityIndex, "evidencePolicyIds", policyIndex],
            policyId,
            "evidence policy"
          )
        );
      } else if (policy.activityId !== activity.id) {
        issues.push({
          code: "evidence_policy_activity_mismatch",
          path: ["activityProfile", "activities", activityIndex, "evidencePolicyIds", policyIndex],
          message: `Evidence policy "${policyId}" belongs to activity "${policy.activityId}", not "${activity.id}".`
        });
      }
    });
  });

  return issues;
}

export function validateEnglishUnitRecipeCrossReferences(recipe: EnglishUnitRecipeV2): EnglishContractValidationIssue[] {
  const issues = validateEnglishActivityProfileCrossReferences(recipe.activityProfile);
  const lessonIds = new Set(recipe.lessonOrder);
  const readingIds = new Set(recipe.readings.map((reading) => reading.id));
  const termIds = new Set(recipe.analysisTerms.map((term) => term.id));
  const activityIds = new Set(recipe.activityProfile.activities.map((activity) => activity.id));

  issues.push(...duplicateIssues(recipe.lessonOrder, ["lessonOrder"], "duplicate_lesson_id"));
  issues.push(...duplicateIssues(recipe.readings.map((reading) => reading.id), ["readings"], "duplicate_reading_id"));
  issues.push(...duplicateIssues(recipe.analysisTerms.map((term) => term.id), ["analysisTerms"], "duplicate_analysis_term_id"));
  issues.push(
    ...duplicateIssues(
      recipe.resourceDispositions.map((resource) => resource.id),
      ["resourceDispositions"],
      "duplicate_resource_disposition_id"
    )
  );
  issues.push(...duplicateIssues(recipe.customComponents.map((component) => component.id), ["customComponents"], "duplicate_component_id"));
  issues.push(
    ...duplicateIssues(
      recipe.source.lessonSelectors.map((selector) => selector.itemId),
      ["source", "lessonSelectors"],
      "duplicate_lesson_selector"
    )
  );

  recipe.topLevelLessonOrder.forEach((lessonId, index) => {
    if (!lessonIds.has(lessonId)) {
      issues.push(referenceIssue("unknown_top_level_lesson", ["topLevelLessonOrder", index], lessonId, "lesson"));
    }
  });

  recipe.lessonGroups.forEach((group, groupIndex) => {
    group.lessonIds.forEach((lessonId, lessonIndex) => {
      if (!lessonIds.has(lessonId)) {
        issues.push(referenceIssue("unknown_lesson_group_lesson", ["lessonGroups", groupIndex, "lessonIds", lessonIndex], lessonId, "lesson"));
      }
    });
  });

  recipe.placements.forEach((placement, placementIndex) => {
    if (!lessonIds.has(placement.targetLesson)) {
      issues.push(referenceIssue("unknown_placement_lesson", ["placements", placementIndex, "targetLesson"], placement.targetLesson, "lesson"));
    }
    placement.readingIds.forEach((readingId, readingIndex) => {
      if (!readingIds.has(readingId)) {
        issues.push(referenceIssue("unknown_placement_reading", ["placements", placementIndex, "readingIds", readingIndex], readingId, "reading"));
      }
    });
    placement.questionRefs.forEach((questionRef, questionIndex) => {
      const readingId = questionRef.split(":", 1)[0];
      if (!readingIds.has(readingId)) {
        issues.push(
          referenceIssue(
            "unknown_question_ref_reading",
            ["placements", placementIndex, "questionRefs", questionIndex],
            readingId,
            "reading"
          )
        );
      }
    });
  });

  recipe.analysisExamples.forEach((example, index) => {
    if (!readingIds.has(example.readingId)) {
      issues.push(referenceIssue("unknown_analysis_reading", ["analysisExamples", index, "readingId"], example.readingId, "reading"));
    }
    if (example.termId && !termIds.has(example.termId)) {
      issues.push(referenceIssue("unknown_analysis_term", ["analysisExamples", index, "termId"], example.termId, "analysis term"));
    }
  });

  recipe.resourceDispositions.forEach((resource, resourceIndex) => {
    resource.targetLessonIds?.forEach((lessonId, lessonIndex) => {
      if (!lessonIds.has(lessonId)) {
        issues.push(
          referenceIssue(
            "unknown_resource_lesson",
            ["resourceDispositions", resourceIndex, "targetLessonIds", lessonIndex],
            lessonId,
            "lesson"
          )
        );
      }
    });
  });

  recipe.customComponents.forEach((component, index) => {
    if (!/^workspace\/components\//.test(component.source)) {
      issues.push({
        code: "component_source_outside_preserved_root",
        path: ["customComponents", index, "source"],
        message: "Custom component sources must be stored under workspace/components/."
      });
    }
    if (component.assetRoot && !/^workspace\/assets\/custom(?:\/|$)/.test(component.assetRoot)) {
      issues.push({
        code: "component_assets_outside_preserved_root",
        path: ["customComponents", index, "assetRoot"],
        message: "Custom component assets must be stored under workspace/assets/custom/."
      });
    }
  });

  recipe.acceptance.requiredActivityIds.forEach((activityId, index) => {
    if (!activityIds.has(activityId)) {
      issues.push(referenceIssue("unknown_required_activity", ["acceptance", "requiredActivityIds", index], activityId, "activity"));
    }
  });

  if (recipe.fictionElementsHub) {
    const references = [
      recipe.fictionElementsHub.hubLesson,
      ...(recipe.fictionElementsHub.contextLesson ? [recipe.fictionElementsHub.contextLesson] : []),
      ...recipe.fictionElementsHub.childLessons
    ];
    references.forEach((lessonId, index) => {
      if (!lessonIds.has(lessonId)) {
        issues.push(referenceIssue("unknown_fiction_hub_lesson", ["fictionElementsHub", index], lessonId, "lesson"));
      }
    });
  }

  return issues;
}

export function validateEnglishCourseManifestCrossReferences(
  manifest: EnglishCourseManifestV1
): EnglishContractValidationIssue[] {
  const issues: EnglishContractValidationIssue[] = [];
  issues.push(...duplicateIssues(manifest.archives.map((archive) => archive.id), ["archives"], "duplicate_archive_id"));
  issues.push(...duplicateIssues(manifest.units.map((unit) => unit.projectSlug), ["units"], "duplicate_project_slug"));
  issues.push(...duplicateIssues(manifest.units.map((unit) => unit.recipePath), ["units"], "duplicate_recipe_path"));

  for (const kind of ["brightspace", "teacher-resources"] as const) {
    if (!manifest.archives.some((archive) => archive.kind === kind)) {
      issues.push({
        code: "missing_course_archive",
        path: ["archives"],
        message: `Course manifest requires a ${kind} archive.`
      });
    }
  }

  manifest.units.forEach((unit, index) => {
    if (unit.profileVersion !== manifest.profileVersion) {
      issues.push({
        code: "unit_profile_version_mismatch",
        path: ["units", index, "profileVersion"],
        message: `Unit profile version "${unit.profileVersion}" does not match course profile version "${manifest.profileVersion}".`
      });
    }
  });

  return issues;
}

export class EnglishContractValidationError extends Error {
  readonly issues: EnglishContractValidationIssue[];

  constructor(message: string, issues: EnglishContractValidationIssue[]) {
    super(message);
    this.name = "EnglishContractValidationError";
    this.issues = issues;
  }
}

function defaultShortFictionProfile(): EnglishActivityProfileV1 {
  return {
    schemaVersion: 1,
    kind: "short-fiction",
    readerMode: "text-bank",
    questionCollectionScope: "story",
    analysisExplorer: true,
    activities: [
      {
        id: "story-bank",
        title: "Short Story Bank",
        route: "story-bank",
        enabled: true,
        evidencePolicyIds: []
      },
      {
        id: "story-questions",
        title: "Short Story Questions",
        route: "story-questions",
        enabled: true,
        evidencePolicyIds: ["story-question-collection"]
      },
      {
        id: "writing-studio",
        title: "Writing Studio",
        route: "writing-studio",
        enabled: true,
        evidencePolicyIds: ["writing-response-collection"]
      },
      {
        id: "evidence-bank",
        title: "Evidence Bank",
        route: "evidence-bank",
        enabled: true,
        evidencePolicyIds: []
      }
    ],
    evidencePolicies: [
      {
        id: "story-question-collection",
        activityId: "story-questions",
        saveMode: "collection",
        requiresExplicitSave: true,
        collectionScope: "work",
        contributionIdTemplate: "{projectSlug}:story-questions:{workId}"
      },
      {
        id: "writing-response-collection",
        activityId: "writing-studio",
        saveMode: "collection",
        requiresExplicitSave: true,
        collectionScope: "activity",
        contributionIdTemplate: "{projectSlug}:writing-studio"
      }
    ]
  };
}

export function adaptEnglishUnitRecipeV1(
  recipe: EnglishUnitRecipeV1,
  options: {
    profileVersion?: string;
    status?: EnglishReviewStatus;
    activityProfile?: EnglishActivityProfileV1;
  } = {}
): EnglishUnitRecipeV2 {
  const resourceDispositions: EnglishUnitRecipeV2["resourceDispositions"] = [
    ...recipe.readings.flatMap((reading) => [
      {
        id: `${reading.id}-reading`,
        source: reading.readingFile,
        title: reading.title,
        role: "reading" as const,
        disposition: "place" as const,
        reason: "Migrated from the V1 reading recipe."
      },
      {
        id: `${reading.id}-questions`,
        source: reading.questionFile,
        title: `${reading.title} Questions`,
        role: "question-set" as const,
        disposition: "place" as const,
        reason: "Migrated from the V1 question recipe."
      }
    ]),
    ...recipe.excludedFiles.map((excluded, index) => ({
      id: `v1-excluded-${index + 1}`,
      source: excluded.file,
      role: "excluded-assessment" as const,
      disposition: "exclude" as const,
      reason: excluded.reason
    }))
  ];

  const activityProfile = options.activityProfile ?? defaultShortFictionProfile();
  return {
    schemaVersion: 2,
    projectSlug: recipe.projectSlug,
    courseCode: recipe.courseCode,
    courseTitle: recipe.courseTitle,
    unitTitle: recipe.unitTitle,
    profileVersion: options.profileVersion ?? "next-step-english-v1",
    status: options.status ?? "needs-review",
    source: {
      ...recipe.source,
      lessonSelectors: [
        {
          itemId: recipe.source.brightspaceUnitId,
          disposition: "include",
          includeChildren: true,
          reason: "Migrated from the V1 Brightspace unit selector."
        }
      ]
    },
    activityProfile,
    lessonOrder: [...recipe.lessonOrder],
    topLevelLessonOrder: [...recipe.topLevelLessonOrder],
    lessonGroups: [],
    fictionElementsHub: { ...recipe.fictionElementsHub, childLessons: [...recipe.fictionElementsHub.childLessons] },
    readings: recipe.readings.map((reading) => ({
      ...reading,
      questionPages: reading.questionPages ? [...reading.questionPages] : undefined,
      questionPrompts: reading.questionPrompts?.map((prompt) => ({ ...prompt }))
    })),
    placements: recipe.placements.map((placement) => ({
      ...placement,
      readingIds: [...placement.readingIds],
      questionRefs: [...placement.questionRefs]
    })),
    analysisTerms: recipe.analysisTerms.map((term) => ({ ...term })),
    analysisExamples: recipe.analysisExamples.map((example) => ({ ...example })),
    resourceDispositions,
    excludedFiles: recipe.excludedFiles.map((excluded) => ({ ...excluded })),
    wordingCorrections: recipe.wordingCorrections.map((correction) => ({ ...correction })),
    mediaPolicy: {
      ...recipe.mediaPolicy,
      allowedYouTubeIds: [...recipe.mediaPolicy.allowedYouTubeIds],
      blockedYouTubeIds: [...recipe.mediaPolicy.blockedYouTubeIds],
      approvedExternalUrls: [...recipe.mediaPolicy.approvedExternalUrls],
      externalUrlRewrites: { ...recipe.mediaPolicy.externalUrlRewrites }
    },
    customComponents: [],
    acceptance: {
      requiredRoutes: activityProfile.activities.filter((activity) => activity.enabled).map((activity) => activity.route),
      requiredActivityIds: activityProfile.activities.filter((activity) => activity.enabled).map((activity) => activity.id),
      reviewItems: ["Confirm the migrated V1 recipe before marking it ready for export."]
    }
  };
}

export function parseEnglishUnitRecipe(input: unknown): EnglishUnitRecipeV2 {
  const parsed = EnglishUnitRecipeSchema.parse(input);
  const recipe = parsed.schemaVersion === 1 ? adaptEnglishUnitRecipeV1(parsed as EnglishUnitRecipeV1) : (parsed as EnglishUnitRecipeV2);
  const issues = validateEnglishUnitRecipeCrossReferences(recipe);
  if (issues.length > 0) {
    throw new EnglishContractValidationError("English unit recipe cross-reference validation failed.", issues);
  }
  return recipe;
}

export function parseEnglishCourseManifest(input: unknown): EnglishCourseManifestV1 {
  const manifest = EnglishCourseManifestV1Schema.parse(input) as EnglishCourseManifestV1;
  const issues = validateEnglishCourseManifestCrossReferences(manifest);
  if (issues.length > 0) {
    throw new EnglishContractValidationError("English course manifest cross-reference validation failed.", issues);
  }
  return manifest;
}

export function parseEnglishEvidenceEntry(input: unknown): EnglishEvidenceEntryV2 {
  return EnglishEvidenceEntryV2Schema.parse(input) as EnglishEvidenceEntryV2;
}
