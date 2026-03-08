import { readFile } from "node:fs/promises";

import pdfParse from "pdf-parse";

import { createQuestion, createSourceDocument } from "../model.js";
import type { IngestIssue, IngestParseResult, Question } from "../schema.js";
import { extractPdfTextWithFallback } from "../../pdf-text.js";
import {
  extractDraftQuestionsFromPdfText,
  hasQuestionSignals,
  normalizePdfText,
  type PdfQuestionCandidate
} from "../question-extraction.js";

const LOW_CONFIDENCE_THRESHOLD = 0.35;

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function scoreExtractionConfidence(input: {
  extractedTextLength: number;
  questionCandidateCount: number;
  pageCount: number;
}) {
  const textScore = Math.min(1, input.extractedTextLength / 3500);
  const questionScore = Math.min(1, input.questionCandidateCount / 12);
  const pageScore = Math.min(1, input.pageCount / 12);

  return clamp(Number((textScore * 0.45 + questionScore * 0.4 + pageScore * 0.15).toFixed(2)));
}

function scoreQuestionConfidence(prompt: string) {
  const lengthScore = Math.min(1, prompt.length / 120);
  const punctuationBonus = /[?]/.test(prompt) ? 0.12 : 0;
  const actionVerbBonus = /(define|explain|identify|list|describe|compare|analyze|choose|select|write)/i.test(prompt) ? 0.1 : 0;
  return clamp(Number((0.45 + lengthScore * 0.35 + punctuationBonus + actionVerbBonus).toFixed(2)));
}

function mapCandidateToQuestion(candidate: PdfQuestionCandidate, sourceReference: string): Question {
  if ((candidate.questionType === "multiple_choice" || candidate.questionType === "multi_select") && candidate.choices.length >= 2) {
    const base = createQuestion({
      type: candidate.questionType,
      prompt: candidate.prompt,
      sourceReference,
      sourcePage: candidate.sourcePage,
      originText: candidate.prompt,
      confidenceScore: scoreQuestionConfidence(candidate.prompt),
      answerStatus: "missing",
      reviewStatus: "needs_review",
      metadataTags: ["ingested", "pdf"]
    });

    if (base.type !== "multiple_choice" && base.type !== "multi_select") {
      return base;
    }

    return {
      ...base,
      choices: candidate.choices.map((choice, index) => ({
        choiceId: `${base.questionId}_choice_${index + 1}`,
        label: choice.label,
        text: choice.text,
        isCorrect: false,
        orderIndex: index,
        matchKey: null,
        fixedPosition: null,
        matchRole: null
      })),
      correctAnswers: []
    };
  }

  if (candidate.questionType === "true_false") {
    const base = createQuestion({
      type: "true_false",
      prompt: candidate.prompt,
      sourceReference,
      sourcePage: candidate.sourcePage,
      originText: candidate.prompt,
      confidenceScore: scoreQuestionConfidence(candidate.prompt),
      answerStatus: "missing",
      reviewStatus: "needs_review",
      metadataTags: ["ingested", "pdf"]
    });

    if (base.type !== "true_false") {
      return base;
    }

    return {
      ...base,
      choices: [
        {
          choiceId: `${base.questionId}_choice_true`,
          label: "T",
          text: "True",
          isCorrect: false,
          orderIndex: 0,
          matchKey: null,
          fixedPosition: null,
          matchRole: null
        },
        {
          choiceId: `${base.questionId}_choice_false`,
          label: "F",
          text: "False",
          isCorrect: false,
          orderIndex: 1,
          matchKey: null,
          fixedPosition: null,
          matchRole: null
        }
      ],
      correctAnswers: []
    };
  }

  if (candidate.questionType === "short_answer") {
    return createQuestion({
      type: "short_answer",
      prompt: candidate.prompt,
      sourceReference,
      sourcePage: candidate.sourcePage,
      originText: candidate.prompt,
      confidenceScore: scoreQuestionConfidence(candidate.prompt),
      answerStatus: "missing",
      reviewStatus: "needs_review",
      metadataTags: ["ingested", "pdf"],
      correctAnswers: []
    });
  }

  if (candidate.questionType === "matching" && candidate.matchingPairs.length >= 2) {
    const base = createQuestion({
      type: "matching",
      prompt: candidate.prompt,
      sourceReference,
      sourcePage: candidate.sourcePage,
      originText: candidate.prompt,
      confidenceScore: scoreQuestionConfidence(candidate.prompt),
      answerStatus: "inferred",
      reviewStatus: "needs_review",
      metadataTags: ["ingested", "pdf"],
      exportNotes: "Answer map inferred from source matching pairs; review before export."
    });

    if (base.type !== "matching") {
      return base;
    }

    const promptChoices = candidate.matchingPairs.map((pair, index) => ({
      choiceId: `${base.questionId}_prompt_${index + 1}`,
      label: `P${index + 1}`,
      text: pair.promptText,
      isCorrect: false,
      orderIndex: index,
      matchKey: `pair_${index + 1}`,
      fixedPosition: null,
      matchRole: "prompt" as const
    }));
    const matchChoices = candidate.matchingPairs.map((pair, index) => ({
      choiceId: `${base.questionId}_match_${index + 1}`,
      label: `M${index + 1}`,
      text: pair.matchText,
      isCorrect: false,
      orderIndex: candidate.matchingPairs.length + index,
      matchKey: `pair_${index + 1}`,
      fixedPosition: null,
      matchRole: "match" as const
    }));

    return {
      ...base,
      choices: [...promptChoices, ...matchChoices],
      correctAnswers: candidate.matchingPairs.map((_, index) => ({
        promptChoiceId: promptChoices[index].choiceId,
        matchChoiceId: matchChoices[index].choiceId
      }))
    };
  }

  if (candidate.questionType === "ordering") {
    const orderingItems =
      candidate.orderingItems.length >= 2 ? candidate.orderingItems : candidate.choices.map((choice) => choice.text).filter(Boolean);

    if (orderingItems.length >= 2) {
      const base = createQuestion({
        type: "ordering",
        prompt: candidate.prompt,
        sourceReference,
        sourcePage: candidate.sourcePage,
        originText: candidate.prompt,
        confidenceScore: scoreQuestionConfidence(candidate.prompt),
        answerStatus: "missing",
        reviewStatus: "needs_review",
        metadataTags: ["ingested", "pdf"]
      });

      if (base.type === "ordering") {
        const choices = orderingItems.map((item, index) => ({
          choiceId: `${base.questionId}_step_${index + 1}`,
          label: `${index + 1}`,
          text: item,
          isCorrect: false,
          orderIndex: index,
          matchKey: null,
          fixedPosition: true,
          matchRole: null
        }));
        return {
          ...base,
          choices,
          correctAnswers: choices.map((choice) => choice.choiceId)
        };
      }
    }
  }

  return createQuestion({
    type: "written_response",
    prompt: candidate.prompt,
    sourceReference,
    sourcePage: candidate.sourcePage,
    originText: candidate.prompt,
    confidenceScore: scoreQuestionConfidence(candidate.prompt),
    answerStatus: "missing",
    reviewStatus: "needs_review",
    metadataTags: ["ingested", "pdf"]
  });
}

function mapCandidatesToQuestions(candidates: PdfQuestionCandidate[], sourceReference: string) {
  const questions = candidates.map((candidate) => mapCandidateToQuestion(candidate, sourceReference));
  return questions;
}

function markQuestionForLowConfidence(question: Question): Question {
  if (question.metadataTags.includes("low_confidence")) {
    return question;
  }

  return {
    ...question,
    metadataTags: [...question.metadataTags, "low_confidence"],
    reviewStatus: "needs_review" as const
  };
}

function buildIssues(extractedText: string, questions: Question[], ocrApplied: boolean, ocrIssue?: string | null): IngestIssue[] {
  const issues: IngestIssue[] = [];

  if (extractedText.length === 0) {
    issues.push({
      code: "no_text_extracted",
      severity: "error",
      message: "No text was extracted from the PDF.",
      sourcePage: null
    });
  } else if (questions.length === 0) {
    issues.push({
      code: "no_question_candidates",
      severity: "warning",
      message: "Text was extracted but no question-like prompts were detected. Manual authoring is required.",
      sourcePage: null
    });
  }

  if (questions.length === 0 && !hasQuestionSignals(extractedText)) {
    issues.push({
      code: "ocr_required",
      severity: "warning",
      message: "No question signals were detected in extracted text. This PDF likely needs OCR support.",
      sourcePage: null
    });
  }

  if (questions.some((question) => question.type === "multiple_choice")) {
    issues.push({
      code: "answer_key_required_for_multiple_choice",
      severity: "warning",
      message: "Multiple-choice items were detected without answer keys. Mark correct options before export.",
      sourcePage: null
    });
  }

  if (ocrApplied) {
    issues.push({
      code: questions.length > 0 ? "ocr_applied" : "ocr_no_candidates",
      severity: questions.length > 0 ? "info" : "warning",
      message:
        questions.length > 0
          ? "OCR fallback was applied and produced draft question candidates."
          : "OCR fallback was applied but did not produce question candidates from this PDF.",
      sourcePage: null
    });
  } else if (ocrIssue) {
    issues.push({
      code: "ocr_failed",
      severity: "warning",
      message: ocrIssue,
      sourcePage: null
    });
  }

  return issues;
}

export async function parsePdfToAssessment(filePath: string): Promise<
  IngestParseResult & {
    extractionMethod?: "native" | "ocr";
    pageCount?: number;
  }
> {
  const sourceDocument = createSourceDocument({
    type: "pdf",
    origin: filePath
  });

  let extractedText = "";
  let extractionMethod: "native" | "ocr" | undefined;
  let pageCount = 0;
  let ocrApplied = false;
  let ocrIssue: string | null = null;
  let confidenceScore = 0;
  let wasLowConfidence = false;

  try {
    const result = await extractPdfTextWithFallback(filePath);
    extractedText = normalizePdfText(result.text ?? "");
    extractionMethod = result.method ?? undefined;
    pageCount = result.pageCount;
    ocrApplied = result.method === "ocr";
    if (result.issue) {
      ocrIssue = result.issue;
    }
  } catch (error) {
    ocrIssue = error instanceof Error ? error.message : String(error);
  }

  if (!extractedText) {
    const raw = await readFile(filePath);
    const parsed = await pdfParse(raw);
    extractedText = normalizePdfText(parsed.text ?? "");
    pageCount = Math.max(pageCount, parsed.numpages ?? 0);
  }

  const initialCandidates = extractDraftQuestionsFromPdfText(extractedText);
  let questions = mapCandidatesToQuestions(initialCandidates, sourceDocument.name);
  confidenceScore = scoreExtractionConfidence({
    extractedTextLength: extractedText.length,
    questionCandidateCount: questions.length,
    pageCount: Math.max(1, pageCount)
  });

  let fallbackUsed = false;
  if (confidenceScore < LOW_CONFIDENCE_THRESHOLD && extractionMethod !== "ocr") {
    fallbackUsed = true;
    const ocrResult = await extractPdfTextWithFallback(filePath, { forceOcr: true });
    if (ocrResult.text) {
      const ocrText = normalizePdfText(ocrResult.text);
      const ocrCandidates = extractDraftQuestionsFromPdfText(ocrText);
      const ocrQuestions = mapCandidatesToQuestions(ocrCandidates, sourceDocument.name);
      const ocrConfidence = scoreExtractionConfidence({
        extractedTextLength: ocrText.length,
        questionCandidateCount: ocrQuestions.length,
        pageCount: Math.max(1, ocrResult.pageCount)
      });

      if (ocrConfidence > confidenceScore) {
        extractedText = ocrText;
        questions = ocrQuestions;
        confidenceScore = ocrConfidence;
        extractionMethod = "ocr";
        ocrApplied = true;
        pageCount = Math.max(pageCount, ocrResult.pageCount);
        ocrIssue = ocrResult.issue;
      } else if (ocrResult.issue) {
        ocrIssue = ocrIssue ? `${ocrIssue}; ${ocrResult.issue}` : ocrResult.issue;
      }
    } else if (ocrResult.issue) {
      ocrIssue = ocrIssue ? `${ocrIssue}; ${ocrResult.issue}` : ocrResult.issue;
    }
  }

  if (confidenceScore < LOW_CONFIDENCE_THRESHOLD) {
    wasLowConfidence = true;
    questions = questions.map(markQuestionForLowConfidence);
  }

  const issues = buildIssues(extractedText, questions, ocrApplied, ocrIssue);

  if (fallbackUsed) {
    issues.push({
      code: "ocr_low_confidence_retry",
      severity: "info",
      message:
        questions.length > 0 && extractionMethod === "ocr"
          ? "OCR retry was run due low-confidence extraction and replaced the final parsed candidate set."
          : "OCR retry was run due low-confidence extraction but did not improve candidate quality.",
      sourcePage: null
    });

    if (!questions.length) {
      issues.push({
        code: "low_confidence_extraction",
        severity: "warning",
        message: "PDF extraction confidence is low. No reliable candidates were produced.",
        sourcePage: null
      });
    }
  }

  if (wasLowConfidence && !issues.some((issue) => issue.code === "low_confidence_extraction")) {
    issues.push({
      code: "low_confidence_extraction",
      severity: "warning",
      message: "PDF extraction confidence is low. Review imported prompts before export.",
      sourcePage: null
    });
  }

  return {
    sourceDocument,
    extractedText,
    questions,
    confidenceScore,
    issues,
    candidateDiagnostics: [],
    extractionMethod,
    pageCount
  };
}
