import type { AssessmentProject, AssessmentProjectInput, Question, ValidationIssue } from "./schema.js";
import { AssessmentProjectSchema } from "./schema.js";
import type { ProjectValidationResult } from "./schema.js";

function createIssue(input: {
  code: string;
  message: string;
  severity?: "error" | "warning";
  blocking?: boolean;
  path?: Array<string | number | null | undefined>;
  questionId?: string;
  suggestedFix?: string;
}): ValidationIssue {
  const severity = input.severity ?? "error";
  return {
    code: input.code,
    message: input.message,
    severity,
    blocking: input.blocking ?? severity === "error",
    path: (input.path ?? []).filter((value) => value !== null && value !== undefined).map(String),
    questionId: input.questionId,
    suggestedFix: input.suggestedFix
  };
}

function summarize(projectId: string, issues: ValidationIssue[]): ProjectValidationResult {
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  const blockingIssues = issues.filter((issue) => issue.blocking);
  return {
    projectId,
    issues,
    errors,
    warnings,
    blockingIssues,
    isValid: errors.length === 0,
    canExport: blockingIssues.length === 0
  };
}

function validateMultipleChoiceLike(question: Question, mode: "single" | "multi"): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const choices = question.choices ?? [];
  const correctCount = choices.filter((choice) => choice.isCorrect).length;

  if (choices.length < 2) {
    issues.push(
      createIssue({
        code: `${question.type}_requires_choices`,
        message: `${question.type} requires at least two choices.`,
        path: ["questions", question.questionId, "choices"],
        questionId: question.questionId
      })
    );
  }

  if (choices.some((choice) => choice.text.trim().length === 0)) {
    issues.push(
      createIssue({
        code: "question_choice_text_required",
        message: "All choices for this question type must have non-empty text.",
        path: ["questions", question.questionId, "choices"],
        questionId: question.questionId
      })
    );
  }

  if (mode === "single" && correctCount !== 1) {
    issues.push(
      createIssue({
        code: `${question.type}_requires_exactly_one_correct_answer`,
        message: `${question.type} requires exactly one correct answer.`,
        path: ["questions", question.questionId, "correctAnswers"],
        questionId: question.questionId
      })
    );
  }

  if (mode === "multi" && correctCount < 1) {
    issues.push(
      createIssue({
        code: "multi_select_requires_one_or_more_correct_answers",
        message: "multi_select requires one or more correct answers.",
        path: ["questions", question.questionId, "correctAnswers"],
        questionId: question.questionId
      })
    );
  }

  return issues;
}

function validateQuestion(question: Question, sectionIds: Set<string>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (question.prompt.trim().length === 0) {
    issues.push(
      createIssue({
        code: "question_prompt_required",
        message: "Question prompt must not be empty.",
        path: ["questions", question.questionId, "prompt"],
        questionId: question.questionId
      })
    );
  }

  if (question.sectionId !== null && !sectionIds.has(question.sectionId)) {
    issues.push(
      createIssue({
        code: "question_section_reference_invalid",
        message: `Question references missing section "${question.sectionId}".`,
        path: ["questions", question.questionId, "sectionId"],
        questionId: question.questionId
      })
    );
  }

  switch (question.type) {
    case "multiple_choice":
      issues.push(...validateMultipleChoiceLike(question, "single"));
      break;
    case "true_false": {
      const trueChoice = question.choices.find((choice) => choice.text.trim().toLowerCase() === "true");
      const falseChoice = question.choices.find((choice) => choice.text.trim().toLowerCase() === "false");
      issues.push(...validateMultipleChoiceLike(question, "single"));
      if (!trueChoice || !falseChoice || question.choices.length !== 2) {
        issues.push(
          createIssue({
            code: "true_false_requires_normalized_boolean_pair",
            message: "true_false requires exactly two choices with text True and False.",
            path: ["questions", question.questionId, "choices"],
            questionId: question.questionId
          })
        );
      }
      break;
    }
    case "multi_select":
      issues.push(...validateMultipleChoiceLike(question, "multi"));
      break;
    case "short_answer":
      if (question.correctAnswers.filter((answer) => answer.trim().length > 0).length === 0) {
        issues.push(
          createIssue({
            code: "short_answer_requires_accepted_answer",
            message: "short_answer requires at least one accepted answer.",
            path: ["questions", question.questionId, "correctAnswers"],
            questionId: question.questionId
          })
        );
      }
      break;
    case "written_response":
      if (question.choices.length > 0) {
        issues.push(
          createIssue({
            code: "written_response_should_not_define_choices",
            message: "written_response should not define choices.",
            path: ["questions", question.questionId, "choices"],
            questionId: question.questionId
          })
        );
      }
      break;
    case "matching":
      if (question.choices.filter((choice) => choice.matchRole === "prompt").length < 2) {
        issues.push(
          createIssue({
            code: "matching_requires_prompt_pairs",
            message: "matching requires at least two prompt/match pairs.",
            path: ["questions", question.questionId, "choices"],
            questionId: question.questionId
          })
        );
      }
      break;
    case "ordering":
      if (question.choices.length < 2) {
        issues.push(
          createIssue({
            code: "ordering_requires_two_or_more_items",
            message: "ordering requires at least two ordered items.",
            path: ["questions", question.questionId, "choices"],
            questionId: question.questionId
          })
        );
      }
      break;
    default:
      break;
  }

  return issues;
}

export function validateAssessmentProject(projectInput: AssessmentProjectInput | AssessmentProject): ProjectValidationResult {
  const parsed = AssessmentProjectSchema.safeParse(projectInput);
  const fallbackProjectId =
    typeof projectInput === "object" && projectInput && "projectId" in projectInput && typeof projectInput.projectId === "string"
      ? projectInput.projectId
      : "unknown_project";

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) =>
      createIssue({
        code: "project_schema_invalid",
        message: issue.message,
        path: issue.path,
        suggestedFix: "Bring the project data back into the canonical schema shape."
      })
    );
    return summarize(fallbackProjectId, issues);
  }

  const project = parsed.data;
  const issues: ValidationIssue[] = [];
  const sectionIds = new Set(project.sections.map((section) => section.sectionId));
  const seenQuestionIds = new Set<string>();

  if (project.title.trim().length === 0) {
    issues.push(
      createIssue({
        code: "project_title_required",
        message: "Project title is required for export.",
        path: ["title"]
      })
    );
  }

  for (const question of project.questions) {
    if (seenQuestionIds.has(question.questionId)) {
      issues.push(
        createIssue({
          code: "duplicate_question_id",
          message: `Question id "${question.questionId}" is duplicated.`,
          path: ["questions", question.questionId],
          questionId: question.questionId
        })
      );
    }
    seenQuestionIds.add(question.questionId);
    issues.push(...validateQuestion(question, sectionIds));
  }

  return summarize(project.projectId, issues);
}
