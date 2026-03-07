import { readFile } from "node:fs/promises";

import JSZip from "jszip";

import { createSourceDocument } from "../model.js";
import type { IngestIssue, IngestParseResult, Question } from "../schema.js";
import { createQuestion } from "../model.js";
import { extractDraftQuestionsFromPdfText, normalizePdfText, type PdfQuestionCandidate } from "../question-extraction.js";

function decodeXmlEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&#x2019;", "'")
    .replaceAll("&#x2013;", "-")
    .replaceAll("&#x2014;", "-");
}

function extractTextFromDocumentXml(documentXml: string) {
  const withLineBreaks = documentXml
    .replace(/<w:tab\/>/g, " ")
    .replace(/<w:br\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n");
  const withoutTags = withLineBreaks.replace(/<[^>]+>/g, "");
  return normalizePdfText(decodeXmlEntities(withoutTags));
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
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
      metadataTags: ["ingested", "docx"]
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
      metadataTags: ["ingested", "docx"]
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
      metadataTags: ["ingested", "docx"],
      correctAnswers: []
    });
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
    metadataTags: ["ingested", "docx"]
  });
}

export async function parseDocxToAssessment(filePath: string): Promise<IngestParseResult> {
  const sourceDocument = createSourceDocument({
    type: "docx",
    origin: filePath
  });

  const input = await readFile(filePath);
  const zip = await JSZip.loadAsync(input);
  const documentXmlFile = zip.file("word/document.xml");

  if (!documentXmlFile) {
    return {
      sourceDocument,
      extractedText: "",
      questions: [],
      confidenceScore: 0,
      issues: [
        {
          code: "missing_document_xml",
          severity: "error",
          message: "DOCX archive is missing word/document.xml.",
          sourcePage: null
        }
      ],
      candidateDiagnostics: []
    };
  }

  const documentXml = await documentXmlFile.async("text");
  const extractedText = extractTextFromDocumentXml(documentXml);
  const candidates = extractDraftQuestionsFromPdfText(extractedText);
  const questions = candidates.map((candidate) => mapCandidateToQuestion(candidate, sourceDocument.name));
  const confidenceScore = clamp(Number((Math.min(1, extractedText.length / 2400) * 0.45 + Math.min(1, questions.length / 10) * 0.55).toFixed(2)));
  const issues: IngestIssue[] =
    extractedText.length === 0
      ? [
          {
            code: "no_text_extracted",
            severity: "error" as const,
            message: "No text was extracted from the DOCX file.",
            sourcePage: null
          }
        ]
      : questions.length === 0
        ? [
            {
              code: "no_question_candidates",
              severity: "warning" as const,
              message: "Text was extracted but no question-like prompts were detected. Manual authoring is required.",
              sourcePage: null
            }
          ]
        : [];

  if (confidenceScore < 0.35) {
    issues.push({
      code: "low_confidence_extraction",
      severity: "warning",
      message: "DOCX extraction confidence is low. Review imported prompts before export.",
      sourcePage: null
    });
  }

  return {
    sourceDocument,
    extractedText,
    questions,
    confidenceScore,
    issues,
    candidateDiagnostics: []
  };
}
