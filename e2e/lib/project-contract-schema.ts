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

export const ProjectE2EContractSchema = z
  .object({
    $schema: z.string().optional(),
    projectSlug: NonEmptyString,
    requiredTestIds: z.array(NonEmptyString).optional(),
    modes: ModesSchema.optional(),
    navigation: NavigationSchema.optional(),
    quiz: QuizSchema.optional(),
    fallbackPanel: FallbackPanelSchema.optional(),
    assertionProfiles: z.record(AssertionProfileSchema).optional(),
    modulePassTargets: z.array(ModulePassTargetSchema).optional(),
    visibilityChecks: z.array(VisibilityCheckSchema).optional()
  })
  .strict();

export type ProjectE2EContract = z.infer<typeof ProjectE2EContractSchema>;

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

  if (options.requireDeepTargets) {
    const hasTargets = Boolean(contract.modulePassTargets?.length || contract.visibilityChecks?.length);
    if (!hasTargets) {
      throw new Error(`Invalid e2e contract at ${contractPath}: deep contract has no modulePassTargets or visibilityChecks.`);
    }
  }

  return contract;
}
