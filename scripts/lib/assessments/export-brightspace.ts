import type { AssessmentProject, BrightspaceExportResult, ExportDiagnostic, Question } from "./schema.js";
import { validateAssessmentProject } from "./validation.js";

type BrightspaceCsvRow = string[];

const QUESTION_TYPE_TO_BRIGHTSPACE_CODE: Record<Question["type"], string> = {
  written_response: "WR",
  short_answer: "SA",
  matching: "M",
  multiple_choice: "MC",
  true_false: "TF",
  multi_select: "MS",
  ordering: "O"
};

function createDiagnostic(input: {
  code: string;
  message: string;
  severity?: ExportDiagnostic["severity"];
  questionId?: string;
  path?: Array<string | number | null | undefined>;
}): ExportDiagnostic {
  return {
    code: input.code,
    message: input.message,
    severity: input.severity ?? "info",
    questionId: input.questionId,
    path: input.path?.filter((segment) => segment !== null && segment !== undefined).map(String)
  };
}

function hasContent(value: string | null | undefined) {
  return value !== null && value !== undefined && value.trim().length > 0;
}

function escapeCsvCell(value: string) {
  let next = value;
  if (next.includes("\"")) {
    next = next.replaceAll("\"", "\"\"");
  }
  if (next.includes(",") || next.includes("\n") || next.includes("\r") || next.includes("\"")) {
    return `"${next}"`;
  }
  return next;
}

function serializeRows(rows: BrightspaceCsvRow[]) {
  const content = rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(",")).join("\r\n");
  return content.length > 0 ? `${content}\r\n` : content;
}

function sortChoicesByOrder<T extends { orderIndex: number }>(choices: T[]) {
  return [...choices].sort((left, right) => left.orderIndex - right.orderIndex);
}

function questionTextRow(question: Question): BrightspaceCsvRow {
  if (hasContent(question.stemRichText)) {
    return ["QuestionText", "", question.stemRichText ?? ""];
  }

  return ["QuestionText", question.prompt];
}

function commonRows(question: Question) {
  const rows: BrightspaceCsvRow[] = [
    ["NewQuestion", QUESTION_TYPE_TO_BRIGHTSPACE_CODE[question.type]],
    ["Title", question.questionId],
    ["Points", `${question.points}`],
    questionTextRow(question)
  ];
  const diagnostics: ExportDiagnostic[] = [];

  if (question.type === "multi_select" || question.type === "matching" || question.type === "ordering") {
    rows.push(["Scoring", "All or nothing"]);
  }

  if (hasContent(question.feedbackCorrect) || hasContent(question.feedbackIncorrect) || hasContent(question.explanation)) {
    diagnostics.push(
      createDiagnostic({
        code: "brightspace_question_fields_omitted",
        severity: "warning",
        message: "Brightspace CSV export does not currently map feedback/explanation fields.",
        questionId: question.questionId,
        path: ["questions", question.questionId]
      })
    );
  }

  return { rows, diagnostics };
}

function mapMultipleChoiceLikeRows(question: Question, correctValue: "100" | "1"): BrightspaceCsvRow[] {
  const correctAnswerIds = new Set(question.correctAnswers as string[]);
  return sortChoicesByOrder(question.choices).map((choice) => ["Option", correctAnswerIds.has(choice.choiceId) ? correctValue : "0", choice.text]);
}

function mapMatchingRows(question: Extract<Question, { type: "matching" }>): BrightspaceCsvRow[] {
  const promptChoices = sortChoicesByOrder(question.choices.filter((choice) => choice.matchRole === "prompt"));
  const matchChoices = sortChoicesByOrder(question.choices.filter((choice) => choice.matchRole === "match"));
  const promptPositionById = new Map(promptChoices.map((choice, index) => [choice.choiceId, `${index + 1}`]));
  const matchAssociationById = new Map(
    question.correctAnswers.map((answer) => [answer.matchChoiceId, promptPositionById.get(answer.promptChoiceId) ?? ""])
  );

  return [
    ...promptChoices.map((choice, index) => ["Choice", `${index + 1}`, choice.text]),
    ...matchChoices.map((choice) => ["Match", matchAssociationById.get(choice.choiceId) ?? "", choice.text])
  ];
}

function mapOrderingRows(question: Extract<Question, { type: "ordering" }>): BrightspaceCsvRow[] {
  const choiceById = new Map(question.choices.map((choice) => [choice.choiceId, choice]));
  return question.correctAnswers.map((choiceId) => ["Item", choiceById.get(choiceId)?.text ?? ""]);
}

function mapQuestionToRows(question: Question) {
  const mapped = commonRows(question);

  switch (question.type) {
    case "multiple_choice":
      mapped.rows.push(...mapMultipleChoiceLikeRows(question, "100"));
      break;
    case "true_false": {
      const trueChoice = question.choices.find((choice) => choice.text.trim().toLowerCase() === "true");
      const falseChoice = question.choices.find((choice) => choice.text.trim().toLowerCase() === "false");
      const correctAnswerIds = new Set(question.correctAnswers);
      mapped.rows.push(["TRUE", correctAnswerIds.has(trueChoice?.choiceId ?? "") ? "100" : "0"]);
      mapped.rows.push(["FALSE", correctAnswerIds.has(falseChoice?.choiceId ?? "") ? "100" : "0"]);
      break;
    }
    case "multi_select":
      mapped.rows.push(...mapMultipleChoiceLikeRows(question, "1"));
      break;
    case "short_answer":
      mapped.rows.push(...question.correctAnswers.map((answer) => ["Answer", "100", answer]));
      break;
    case "written_response":
      if (question.correctAnswers.length > 0) {
        mapped.diagnostics.push(
          createDiagnostic({
            code: "brightspace_written_response_answers_omitted",
            severity: "warning",
            questionId: question.questionId,
            path: ["questions", question.questionId, "correctAnswers"],
            message: "Written response answer guidance is not represented in Brightspace CSV export."
          })
        );
      }
      break;
    case "matching":
      mapped.rows.push(...mapMatchingRows(question));
      break;
    case "ordering":
      mapped.rows.push(...mapOrderingRows(question));
      break;
    default:
      break;
  }

  return mapped;
}

function slugifyFileName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function exportAssessmentBrightspaceCsv(project: AssessmentProject): BrightspaceExportResult {
  const validation = validateAssessmentProject(project);
  const fileNameSource = project.title.trim().length > 0 ? project.title : project.projectId;
  const fileName = `${slugifyFileName(fileNameSource) || project.projectId}-brightspace.csv`;
  const diagnostics: ExportDiagnostic[] = [];

  if (!validation.canExport) {
    return {
      status: "failed",
      fileName,
      content: null,
      rows: [],
      diagnostics: validation.issues.map((issue) =>
        createDiagnostic({
          code: issue.code,
          message: issue.message,
          severity: issue.severity === "error" ? "error" : "warning",
          questionId: issue.questionId,
          path: issue.path
        })
      )
    };
  }

  const rows: BrightspaceCsvRow[] = [];
  for (const question of project.questions) {
    const mapped = mapQuestionToRows(question);
    rows.push(...mapped.rows);
    diagnostics.push(...mapped.diagnostics);
  }

  return {
    status: "success",
    fileName,
    content: serializeRows(rows),
    rows,
    diagnostics
  };
}
