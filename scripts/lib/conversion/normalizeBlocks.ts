import { load, type Cheerio, type CheerioAPI } from "cheerio";
import type { AnyNode } from "domhandler";

import { collectCueTerms, detectCourseBlockType, extractElementText, parseCards, slugify } from "./detectStructures.js";
import type {
  AssessmentInput,
  AssessmentModel,
  AssessmentQuestion,
  AssessmentSection,
  CourseBlock,
  CourseModel,
  CourseSection,
  SourceTrace
} from "./types.js";

type ExtractModelsOptions = {
  projectSlug: string;
  html: string;
  generatedAt: string;
  sourceTitle: string;
  sourcePdfUrl: string | null;
};

function toSourceTrace(sourceTitle: string): SourceTrace {
  return {
    sourceType: "legacy-html",
    sourceTitle,
    sourcePageStart: null,
    sourcePageEnd: null,
    sourceBlockId: null,
    conversionStatus: "converted",
    notes: []
  };
}

function parseTable($: CheerioAPI, element: Cheerio<AnyNode>) {
  const table = element.is("table") ? element : element.find("table").first();
  const headers = table
    .find("th")
    .toArray()
    .map((node) => $(node).text().replace(/\s+/g, " ").trim())
    .filter((text) => text.length > 0);
  const rows = table
    .find("tbody tr")
    .toArray()
    .map((rowNode) =>
      $(rowNode)
        .find("td")
        .toArray()
        .map((cellNode) => $(cellNode).text().replace(/\s+/g, " ").trim())
    )
    .filter((row) => row.length > 0);

  return { headers, rows };
}

function shouldPreserveLegacyHtml($: CheerioAPI, element: Cheerio<AnyNode>) {
  const tag = element.prop("tagName")?.toLowerCase();

  if (tag === "h2" || tag === "h3" || tag === "h4" || tag === "h5" || tag === "p" || tag === "ul" || tag === "ol") {
    return false;
  }

  if (
    element.hasClass("read-block") ||
    element.hasClass("ref-note") ||
    element.hasClass("image-box") ||
    element.hasClass("q-box") ||
    element.hasClass("warning-card") ||
    element.hasClass("question-box") ||
    element.hasClass("term-table")
  ) {
    return true;
  }

  return (
    element.find(".info-card, .anatomy-card, .warning-card, .term-table, .q-box, iframe, img").length > 0 ||
    element.find(".image-box, .read-block").length > 0
  );
}

function normalizeCourseBlocks(
  html: string,
  sectionId: string,
  sourceTitle: string,
  sourcePdfUrl: string | null
) {
  const $ = load(html);
  const section = $(".section-content").first().length > 0 ? $(".section-content").first() : $.root().children().first();
  const sectionRoot = section.children(".glass").first().length > 0 ? section.children(".glass").first() : section;
  const elements = sectionRoot.children().toArray().map((node) => $(node));
  const blocks: CourseBlock[] = [];

  for (let index = 0; index < elements.length; index += 1) {
    const element = elements[index];
    if (shouldPreserveLegacyHtml($, element)) {
      const rawHtml = $.html(element);
      const rawText = extractElementText(element);
      const hasEmbeddedMedia = /<(?:iframe|img)\b/i.test(rawHtml);
      if (!rawHtml.trim() || (!rawText && !hasEmbeddedMedia)) {
        continue;
      }
      blocks.push({
        id: `${sectionId}-block-${index + 1}`,
        type: "rawHtml",
        html: rawHtml,
        text: rawText || undefined,
        source: toSourceTrace(sourceTitle)
      });
      continue;
    }

    const blockType = detectCourseBlockType($, element);
    const baseId = `${sectionId}-block-${index + 1}`;
    const source = toSourceTrace(sourceTitle);

    if (blockType === "heading") {
      const tag = element.prop("tagName")?.toLowerCase();
      const level = tag ? Number.parseInt(tag.replace("h", ""), 10) || 3 : 3;
      const headingText = extractElementText(element);
      if (!headingText) {
        continue;
      }
      blocks.push({
        id: baseId,
        type: "heading",
        title: headingText,
        level,
        source
      });
      continue;
    }

    if (blockType === "paragraph") {
      const paragraphText = extractElementText(element);
      if (!paragraphText) {
        continue;
      }
      blocks.push({
        id: baseId,
        type: "paragraph",
        text: paragraphText,
        source
      });
      continue;
    }

    if (blockType === "list") {
      const ordered = element.prop("tagName")?.toLowerCase() === "ol";
      const items = element
        .find("li")
        .toArray()
        .map((itemNode) => $(itemNode).text().replace(/\s+/g, " ").trim())
        .filter((item) => item.length > 0);
      if (items.length === 0) {
        continue;
      }
      blocks.push({
        id: baseId,
        type: "list",
        ordered,
        items,
        source
      });
      continue;
    }

    if (blockType === "table") {
      const { headers, rows } = parseTable($, element);
      blocks.push({
        id: baseId,
        type: "table",
        headers,
        rows,
        source
      });
      continue;
    }

    if (blockType === "referenceNote") {
      const referenceText = extractElementText(element);
      if (!referenceText) {
        continue;
      }
      blocks.push({
        id: baseId,
        type: "referenceNote",
        text: referenceText,
        source
      });
      continue;
    }

    if (blockType === "warning") {
      blocks.push({
        id: baseId,
        type: "warning",
        title: element.find("h3, h4, strong").first().text().trim() || "Warning",
        text: extractElementText(element),
        source
      });
      continue;
    }

    if (blockType === "cardGrid") {
      const cards = parseCards($, element);
      if (cards.length === 0) {
        continue;
      }
      blocks.push({
        id: baseId,
        type: "cardGrid",
        cards,
        source
      });
      continue;
    }

    if (blockType === "figure") {
      const heading = element.find("h3, h4, strong").first().text().trim() || "Figure reference";
      const paragraphDescription = element.find("p").first().text().replace(/\s+/g, " ").trim();
      const fallbackDescription = extractElementText(element);
      const description = paragraphDescription || fallbackDescription;
      const compactDescription = description.length > 280 ? `${description.slice(0, 277)}...` : description;
      const iframeSourceUrl = element.find("iframe").first().attr("src") ?? null;
      const hasImageAsset = element.find("img").length > 0;
      const isPending = !hasImageAsset && (iframeSourceUrl != null || sourcePdfUrl != null);
      blocks.push({
        id: baseId,
        type: "figure",
        figureLabel: heading,
        figureDescription: compactDescription || "Pending visual conversion",
        figureStatus: isPending ? "pending" : "available",
        figureSourceUrl: iframeSourceUrl ?? (!hasImageAsset ? sourcePdfUrl ?? undefined : undefined),
        source: {
          ...source,
          conversionStatus: isPending ? "placeholder" : "converted"
        }
      });
      continue;
    }

    const rawHtml = $.html(element);
    const rawText = extractElementText(element);
    if (!rawHtml.trim() || !rawText) {
      continue;
    }

    blocks.push({
      id: baseId,
      type: "rawHtml",
      html: rawHtml,
      text: rawText,
      source
    });
  }

  if (blocks.length === 0) {
    blocks.push({
      id: `${sectionId}-block-1`,
      type: "rawHtml",
      html: sectionRoot.html() ?? "",
      source: toSourceTrace(sourceTitle)
    });
  }

  return blocks;
}

function normalizeQuestionInputs(questionId: string, questionHtml: string): AssessmentInput[] {
  const $ = load(questionHtml);
  const inputs: AssessmentInput[] = [];

  $("select").each((selectIndex, selectNode) => {
    const select = $(selectNode);
    const optionItems = select
      .find("option")
      .toArray()
      .map((optionNode) => {
        const option = $(optionNode);
        return {
          value: option.attr("value") ?? "",
          label: option.text().trim()
        };
      });
    const labelText =
      select.prev("label, span, p").first().text().trim() ||
      select.closest("div").find("label, span").first().text().trim() ||
      `Select ${selectIndex + 1}`;
    inputs.push({
      id: `${questionId}-select-${selectIndex + 1}`,
      key: slugify(labelText) || `select-${selectIndex + 1}`,
      kind: "select",
      label: labelText,
      options: optionItems,
      correctValue: select.attr("data-correct") ?? null
    });
  });

  $("input[type='checkbox']").each((checkboxIndex, checkboxNode) => {
    const checkbox = $(checkboxNode);
    const labelText =
      checkbox.parent("label").text().replace(/\s+/g, " ").trim() ||
      checkbox.closest("label").text().replace(/\s+/g, " ").trim() ||
      `Checkbox ${checkboxIndex + 1}`;
    const value = checkbox.attr("value") ?? "on";
    inputs.push({
      id: `${questionId}-checkbox-${checkboxIndex + 1}`,
      key: slugify(labelText) || `checkbox-${checkboxIndex + 1}`,
      kind: "checkbox",
      label: labelText,
      options: [
        {
          value,
          label: labelText
        }
      ],
      correctValue: value
    });
  });

  return inputs;
}

function parseSectionMarks(heading: string) {
  const match = heading.match(/\((\d+)\s*marks?\)/i);
  if (!match) {
    return null;
  }

  return Number.parseInt(match[1] ?? "", 10) || null;
}

function normalizeAssessmentQuestions(
  sectionId: string,
  sectionHtml: string,
  sourceTitle: string
): AssessmentQuestion[] {
  const $ = load(sectionHtml);
  const questions: AssessmentQuestion[] = [];

  $(".question-box").each((index, questionNode) => {
    const question = $(questionNode);
    const questionId = `${sectionId}-question-${index + 1}`;
    const title = question.find(".question-title").first().text().replace(/\s+/g, " ").trim() || `Question ${index + 1}`;
    const prompt = question.find("p").first().text().replace(/\s+/g, " ").trim() || null;
    const html = $.html(question);
    const inputs = normalizeQuestionInputs(questionId, html);

    questions.push({
      id: questionId,
      title,
      prompt,
      html,
      inputs,
      source: toSourceTrace(sourceTitle)
    });
  });

  return questions;
}

export function extractHss1010Models(options: ExtractModelsOptions): {
  course: CourseModel;
  assessment: AssessmentModel;
} {
  const $ = load(options.html);
  const sourceTraceTitle = options.sourceTitle || "Legacy HSS1010 Workspace";

  const sections: CourseSection[] = [];
  $("#view-study [id^='btn-study-']").each((buttonIndex, buttonNode) => {
    const button = $(buttonNode);
    const sectionId = button.attr("id")?.replace(/^btn-study-/, "").trim();
    if (!sectionId) {
      return;
    }

    const section = $(`#${sectionId}.section-content`).first();
    if (!section.length) {
      return;
    }

    const tabLabel = button.text().replace(/\s+/g, " ").trim() || `${buttonIndex + 1}`;
    const title = section.find("h2").first().text().replace(/\s+/g, " ").trim() || tabLabel;
    sections.push({
      id: sectionId,
      tabLabel,
      title,
      blocks: normalizeCourseBlocks($.html(section), sectionId, sourceTraceTitle, options.sourcePdfUrl)
    });
  });

  const assessmentSections: AssessmentSection[] = [];
  $("#view-assess .assess-tab[id]").each((index, sectionNode) => {
    const section = $(sectionNode);
    const sectionId = section.attr("id")?.trim();
    if (!sectionId) {
      return;
    }

    const heading = section.find("h2").first().text().replace(/\s+/g, " ").trim() || `Section ${index + 1}`;
    assessmentSections.push({
      id: sectionId,
      title: heading.replace(/\(\d+\s*marks?\)/i, "").trim(),
      totalMarks: parseSectionMarks(heading),
      questions: normalizeAssessmentQuestions(sectionId, $.html(section), sourceTraceTitle)
    });
  });

  const course: CourseModel = {
    courseId: options.projectSlug,
    slug: options.projectSlug,
    title: $("title").first().text().trim() || "HSS 1010",
    generatedAt: options.generatedAt,
    sourceTitle: sourceTraceTitle,
    sourcePdfUrl: options.sourcePdfUrl,
    sections
  };

  const assessment: AssessmentModel = {
    courseId: options.projectSlug,
    slug: options.projectSlug,
    title: `${course.title} Assessment`,
    generatedAt: options.generatedAt,
    sections: assessmentSections
  };

  return { course, assessment };
}

export function buildSectionCueTerms(course: CourseModel) {
  return course.sections.map((section) => ({
    sectionId: section.id,
    cueTerms: collectCueTerms(`${section.tabLabel} ${section.title}`)
  }));
}
