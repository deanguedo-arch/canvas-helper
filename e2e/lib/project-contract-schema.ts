import { z } from "zod";

export const KNOWN_DEEP_CHECKS = [
  "renderer-html",
  "renderer-assignment",
  "renderer-quiz",
  "renderer-pdf",
  "renderer-fallback",
  "renderer-video",
  "renderer-slide",
  "section-mode",
  "quick-checkpoints",
  "quiz-answer",
  "quiz-progress",
  "quiz-nav",
  "quiz-next-question",
  "node-nav",
  "node-counter"
] as const;

const NonEmptyString = z.string().min(1, "Expected a non-empty string.");
const LearnerRouteId = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Expected a stable learner route id.");
const LearnerStorageId = z
  .string()
  .regex(/^[A-Za-z0-9][A-Za-z0-9:._-]*$/, "Expected a stable learner storage id.");
const DeepCheckEnum = z.enum(KNOWN_DEEP_CHECKS);
const ModeEnum = z.enum(["learner", "archive"]);

const ModesSchema = z
  .object({
    enabled: z.boolean(),
    toggleRoleName: z.string().optional(),
    learnerIndicator: z.string().optional(),
    archiveIndicator: z.string().optional()
  })
  .strict();

const NavigationSchema = z
  .object({
    enabled: z.boolean(),
    nextRoleName: z.string().optional(),
    previousRoleName: z.string().optional(),
    nodeCounterPattern: z.string().optional()
  })
  .strict();

const QuizSchema = z
  .object({
    enabled: z.boolean(),
    lessonTitle: NonEmptyString,
    moduleTitle: z.string().optional(),
    answerChoiceLabel: z.string().optional(),
    progressPattern: z.string().optional(),
    checkAnswerRoleName: z.string().optional()
  })
  .strict();

const FallbackPanelSchema = z
  .object({
    enabled: z.boolean()
  })
  .strict();

const ModuleAssignmentsSchema = z
  .object({
    enabled: z.boolean(),
    moduleWithAssignments: NonEmptyString,
    moduleWithoutAssignments: NonEmptyString.optional()
  })
  .strict();

const AssertionProfileSchema = z
  .object({
    checks: z.array(DeepCheckEnum).min(1, "Expected at least one check."),
    mode: ModeEnum.optional()
  })
  .strict();

const ModulePassTargetSchema = z
  .object({
    moduleTitle: NonEmptyString,
    itemTitle: NonEmptyString,
    assertionProfile: NonEmptyString.optional(),
    checks: z.array(DeepCheckEnum).min(1, "Expected at least one check.").optional(),
    mode: ModeEnum.optional()
  })
  .strict();

const VisibilityCheckSchema = z
  .object({
    moduleTitle: NonEmptyString,
    itemTitle: NonEmptyString,
    learnerVisible: z.boolean(),
    archiveVisible: z.boolean()
  })
  .strict();

const LearnerCollectionEvidenceScenarioSchema = z
  .object({
    kind: z.literal("collection").optional(),
    route: LearnerRouteId,
    collectionId: LearnerStorageId,
    responseId: LearnerStorageId,
    activateSelector: NonEmptyString.optional()
  })
  .strict();

const LearnerEvidenceSetupResponseSchema = z
  .object({
    responseId: LearnerStorageId,
    value: NonEmptyString
  })
  .strict();

const LearnerIndividualEvidenceScenarioSchema = z
  .object({
    kind: z.literal("individual"),
    route: LearnerRouteId,
    captureId: LearnerStorageId,
    contributionId: LearnerStorageId,
    responseId: LearnerStorageId,
    preserveResponseOnSave: z.boolean().optional(),
    activateSelector: NonEmptyString.optional(),
    setupResponses: z.array(LearnerEvidenceSetupResponseSchema).min(1, "Expected at least one setup response.").optional()
  })
  .strict();

const LearnerEvidenceScenarioSchema = z.union([
  LearnerCollectionEvidenceScenarioSchema,
  LearnerIndividualEvidenceScenarioSchema
]);

const LearnerDocumentReaderCheckSchema = z
  .object({
    route: LearnerRouteId,
    kind: z.literal("document-reader"),
    minimumPrimary: z.number().int().min(1),
    minimumFallback: z.number().int().min(1)
  })
  .strict();

const LearnerMediaCheckSchema = z
  .object({
    route: LearnerRouteId,
    kind: z.literal("media"),
    minimumPrimary: z.number().int().min(1),
    minimumFallback: z.number().int().min(1)
  })
  .strict();

const LearnerAccessNoticeCheckSchema = z
  .object({
    route: LearnerRouteId,
    kind: z.literal("access-notice"),
    minimumPrimary: z.number().int().min(1)
  })
  .strict();

const LearnerLinkedPageCheckSchema = z
  .object({
    route: LearnerRouteId,
    kind: z.literal("linked-page"),
    href: NonEmptyString
  })
  .strict();

const LearnerResourceCheckSchema = z.discriminatedUnion("kind", [
  LearnerDocumentReaderCheckSchema,
  LearnerMediaCheckSchema,
  LearnerAccessNoticeCheckSchema,
  LearnerLinkedPageCheckSchema
]);

const LearnerMobileSchema = z
  .object({
    width: z.number().int().min(320).max(600),
    height: z.number().int().min(568).max(1200),
    routes: z.array(LearnerRouteId).min(1, "Expected at least one mobile learner route.")
  })
  .strict();

const LearnerMissingHookSchema = z
  .object({
    route: LearnerRouteId,
    requiredHook: z.enum(["data-worksheet-toggle-hints", "data-worksheet-print"]),
    reason: NonEmptyString
  })
  .strict();

const LearnerCourseEnabledSchema = z
  .object({
    enabled: z.literal(true),
    routes: z.array(LearnerRouteId).min(1, "Expected at least one learner route."),
    hintRoutes: z.array(LearnerRouteId),
    printRoutes: z.array(LearnerRouteId),
    evidenceScenario: LearnerEvidenceScenarioSchema.optional(),
    evidenceScenarios: z.array(LearnerEvidenceScenarioSchema).min(1, "Expected at least one evidence scenario.").optional(),
    resourceChecks: z.array(LearnerResourceCheckSchema),
    mobile: LearnerMobileSchema,
    knownMissingHooks: z.array(LearnerMissingHookSchema).optional()
  })
  .strict();

const LearnerCourseDisabledSchema = z
  .object({
    enabled: z.literal(false)
  })
  .strict();

const LearnerCourseSchema = z.discriminatedUnion("enabled", [
  LearnerCourseEnabledSchema,
  LearnerCourseDisabledSchema
]);

export const ProjectE2EContractSchema = z
  .object({
    $schema: z.string().optional(),
    projectSlug: NonEmptyString,
    requiredTestIds: z.array(NonEmptyString).optional(),
    modes: ModesSchema.optional(),
    navigation: NavigationSchema.optional(),
    quiz: QuizSchema.optional(),
    fallbackPanel: FallbackPanelSchema.optional(),
    moduleAssignments: ModuleAssignmentsSchema.optional(),
    assertionProfiles: z.record(AssertionProfileSchema).optional(),
    modulePassTargets: z.array(ModulePassTargetSchema).optional(),
    visibilityChecks: z.array(VisibilityCheckSchema).optional(),
    learnerCourse: LearnerCourseSchema.optional()
  })
  .strict();

export type ProjectE2EContract = z.infer<typeof ProjectE2EContractSchema>;
export type LearnerEvidenceScenario = z.infer<typeof LearnerEvidenceScenarioSchema>;

export function resolveLearnerEvidenceScenarios(
  learnerCourse: Extract<NonNullable<ProjectE2EContract["learnerCourse"]>, { enabled: true }>
): LearnerEvidenceScenario[] {
  return learnerCourse.evidenceScenarios ?? (learnerCourse.evidenceScenario ? [learnerCourse.evidenceScenario] : []);
}

type ValidationOptions = {
  requireDeepTargets?: boolean;
};

function formatPath(path: (string | number)[]) {
  if (!path.length) return "root";
  return path.map((segment) => (typeof segment === "number" ? `[${segment}]` : segment)).join(".");
}

function formatIssues(issues: z.ZodIssue[], contractPath: string) {
  return issues
    .map((issue) => {
      const pathLabel = formatPath(issue.path);
      return `- ${issue.message} (at ${pathLabel})`;
    })
    .join("\n");
}

export function validateProjectContract(
  raw: unknown,
  contractPath: string,
  options: ValidationOptions = {}
): ProjectE2EContract {
  const parsed = ProjectE2EContractSchema.safeParse(raw);
  if (!parsed.success) {
    const details = formatIssues(parsed.error.issues, contractPath);
    throw new Error(`Invalid e2e contract at ${contractPath}:\n${details}`);
  }

  const contract = parsed.data;
  const profiles = contract.assertionProfiles || {};

  if (contract.modulePassTargets?.length) {
    for (const [index, target] of contract.modulePassTargets.entries()) {
      if (target.assertionProfile && !profiles[target.assertionProfile]) {
        throw new Error(
          `Invalid e2e contract at ${contractPath}: modulePassTargets[${index}].assertionProfile "${target.assertionProfile}" does not exist.`
        );
      }
    }
  }

  if (contract.learnerCourse?.enabled) {
    const learnerCourse = contract.learnerCourse;
    const hasSingularScenario = Boolean(learnerCourse.evidenceScenario);
    const hasPluralScenarios = Boolean(learnerCourse.evidenceScenarios?.length);
    if (hasSingularScenario === hasPluralScenarios) {
      throw new Error(
        `Invalid e2e contract at ${contractPath}: learnerCourse must define exactly one of evidenceScenario or evidenceScenarios.`
      );
    }
    const evidenceScenarios = resolveLearnerEvidenceScenarios(learnerCourse);
    const routeSet = new Set(learnerCourse.routes);
    const referencedRoutes = [
      ...learnerCourse.hintRoutes,
      ...learnerCourse.printRoutes,
      ...evidenceScenarios.map((scenario) => scenario.route),
      ...learnerCourse.resourceChecks.map((check) => check.route),
      ...learnerCourse.mobile.routes,
      ...(learnerCourse.knownMissingHooks || []).map((gap) => gap.route)
    ];
    const missingRoutes = [...new Set(referencedRoutes.filter((route) => !routeSet.has(route)))];
    if (missingRoutes.length) {
      throw new Error(
        `Invalid e2e contract at ${contractPath}: learnerCourse references routes missing from learnerCourse.routes: ${missingRoutes.join(", ")}.`
      );
    }
    if (routeSet.size !== learnerCourse.routes.length) {
      throw new Error(`Invalid e2e contract at ${contractPath}: learnerCourse.routes contains duplicate route ids.`);
    }
    const evidenceIdentities = evidenceScenarios.map((scenario) =>
      scenario.kind === "individual" ? scenario.contributionId : scenario.collectionId
    );
    if (new Set(evidenceIdentities).size !== evidenceIdentities.length) {
      throw new Error(`Invalid e2e contract at ${contractPath}: learnerCourse evidence scenarios contain duplicate identities.`);
    }
  }

  if (options.requireDeepTargets) {
    const hasTargets = Boolean(
      contract.modulePassTargets?.length ||
        contract.visibilityChecks?.length ||
        (contract.learnerCourse?.enabled && contract.learnerCourse.routes.length)
    );
    if (!hasTargets) {
      throw new Error(
        `Invalid e2e contract at ${contractPath}: deep contract has no modulePassTargets, visibilityChecks, or enabled learnerCourse routes.`
      );
    }
  }

  return contract;
}
