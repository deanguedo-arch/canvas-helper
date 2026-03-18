import { load } from "cheerio";

export type ParsedQuizQuestion = {
  id: string;
  question: string;
  choices: string[];
  answerIndex: number;
};

function sanitizeText(value: string) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function decodeHtmlText(value: string) {
  const $ = load(`<div>${value || ""}</div>`);
  return sanitizeText($.text());
}

function normalizePath(value: string) {
  return String(value || "").replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/{2,}/g, "/");
}

function dirname(pathValue: string) {
  const normalized = normalizePath(pathValue);
  const splitIndex = normalized.lastIndexOf("/");
  return splitIndex >= 0 ? normalized.slice(0, splitIndex) : "";
}

function joinPath(left: string, right: string) {
  if (!left) {
    return normalizePath(right);
  }
  if (!right) {
    return normalizePath(left);
  }
  return normalizePath(`${left.replace(/\/+$/, "")}/${right.replace(/^\/+/, "")}`);
}

export function resolveRelativePath(baseFile: string, value: string) {
  const candidate = String(value || "").trim();
  if (!candidate) {
    return "";
  }
  if (/^(https?:|data:|mailto:|tel:|#)/i.test(candidate)) {
    return candidate;
  }

  const baseDir = dirname(baseFile);
  const joined = joinPath(baseDir, candidate);
  const parts: string[] = [];
  for (const part of joined.split("/")) {
    if (!part || part === ".") {
      continue;
    }
    if (part === "..") {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.join("/");
}

export function parseAssignmentXmlSummary(xmlSource: string) {
  const $ = load(xmlSource, { xmlMode: true });
  const candidates = [
    $("instructor_text").first().text(),
    $("text").first().text(),
    $("description").first().text(),
    $("mattext").first().text(),
    $("body").first().text()
  ];

  const firstNonEmpty = candidates.map((value) => decodeHtmlText(value)).find((value) => value.length > 0) || "";
  const trimmed = firstNonEmpty.length > 700 ? `${firstNonEmpty.slice(0, 699).trimEnd()}…` : firstNonEmpty;

  return {
    summary: trimmed
  };
}

function parseQti1Questions($: ReturnType<typeof load>) {
  const questions: ParsedQuizQuestion[] = [];

  $("item").each((_itemIndex, itemNode) => {
    const item = $(itemNode);
    const id = sanitizeText(item.attr("ident") || `item-${questions.length + 1}`);
    const question = sanitizeText(
      item.find("presentation material mattext").first().text() ||
        item.find("itemmetadata mattext").first().text()
    );
    const choices = item
      .find("response_lid render_choice response_label")
      .toArray()
      .map((choiceNode) => sanitizeText(item.find(choiceNode).text()))
      .filter((value) => value.length > 0);
    const answerIdent = sanitizeText(item.find("resprocessing varequal").first().text());
    const answerIndex = item
      .find("response_lid render_choice response_label")
      .toArray()
      .findIndex((choiceNode) => sanitizeText(item.find(choiceNode).attr("ident") || "") === answerIdent);

    if (question.length > 0 && choices.length > 0) {
      questions.push({
        id,
        question,
        choices,
        answerIndex: answerIndex >= 0 ? answerIndex : 0
      });
    }
  });

  return questions;
}

function parseQti2Questions($: ReturnType<typeof load>) {
  const questions: ParsedQuizQuestion[] = [];

  $("assessmentItem, item").each((_itemIndex, itemNode) => {
    const item = $(itemNode);
    const id = sanitizeText(item.attr("identifier") || item.attr("ident") || `item-${questions.length + 1}`);
    const prompt =
      sanitizeText(item.find("prompt").first().text()) ||
      sanitizeText(item.find("itemBody p").first().text()) ||
      sanitizeText(item.find("material mattext").first().text());
    const choices = item
      .find("simpleChoice, response_label")
      .toArray()
      .map((choiceNode) => sanitizeText(item.find(choiceNode).text()))
      .filter((value) => value.length > 0);
    const answerIdent = sanitizeText(
      item.find("correctResponse value, resprocessing varequal").first().text()
    );
    const answerIndex = item
      .find("simpleChoice, response_label")
      .toArray()
      .findIndex((choiceNode) => {
        const choice = item.find(choiceNode);
        return sanitizeText(choice.attr("identifier") || choice.attr("ident") || "") === answerIdent;
      });

    if (prompt.length > 0 && choices.length > 0) {
      questions.push({
        id,
        question: prompt,
        choices,
        answerIndex: answerIndex >= 0 ? answerIndex : 0
      });
    }
  });

  return questions;
}

export function parseQuizXmlQuestions(xmlSource: string) {
  const $ = load(xmlSource, { xmlMode: true });
  const qti2 = parseQti2Questions($);
  if (qti2.length > 0) {
    return qti2;
  }
  return parseQti1Questions($);
}

export function parseEmbeddedMediaFromHtml(htmlSource: string, sourcePath: string) {
  const $ = load(htmlSource);
  const iframeSrc = String($("iframe[src]").first().attr("src") || "").trim();
  const videoSourceSrc = String($("video source[src]").first().attr("src") || "").trim();
  const videoSrc = String($("video[src]").first().attr("src") || "").trim();
  const embedUrl = iframeSrc || videoSourceSrc || videoSrc;
  if (!embedUrl) {
    return null;
  }

  return {
    embedUrl: resolveRelativePath(sourcePath, embedUrl)
  };
}
