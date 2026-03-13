import type { AnyNode } from "domhandler";
import type { Cheerio, CheerioAPI } from "cheerio";

import type { BlockType, CourseCard } from "./types.js";

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "your",
  "into",
  "about",
  "have",
  "will",
  "been",
  "are",
  "was",
  "were",
  "you",
  "all",
  "but",
  "can",
  "not"
]);

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function collectCueTerms(value: string, maxTerms = 10) {
  if (!value.trim()) {
    return [] as string[];
  }

  const terms = normalizeText(value)
    .split(" ")
    .filter((term) => term.length >= 4 && !STOP_WORDS.has(term));

  const unique = [...new Set(terms)];
  return unique.slice(0, maxTerms);
}

export function detectCourseBlockType($: CheerioAPI, element: Cheerio<AnyNode>): BlockType {
  const tag = element.prop("tagName")?.toLowerCase();
  if (tag === "h2" || tag === "h3" || tag === "h4" || tag === "h5") {
    return "heading";
  }

  if (tag === "p") {
    return "paragraph";
  }

  if (tag === "ul" || tag === "ol") {
    return "list";
  }

  if (tag === "table" || element.find("table").length > 0) {
    return "table";
  }

  if (element.hasClass("ref-note")) {
    return "referenceNote";
  }

  if (element.hasClass("warning-card") || element.find(".warning-card").length > 0) {
    return "warning";
  }

  if (element.find("iframe").length > 0 || element.hasClass("image-box")) {
    return "figure";
  }

  if (element.find(".info-card, .anatomy-card, .warning-card").length > 0) {
    return "cardGrid";
  }

  if (element.hasClass("q-box")) {
    return "callout";
  }

  return "rawHtml";
}

export function parseCards($: CheerioAPI, element: Cheerio<AnyNode>) {
  const cards: CourseCard[] = [];
  element.find(".info-card, .anatomy-card, .warning-card").each((index, cardNode) => {
    const card = $(cardNode);
    const title = card.find("h4, strong").first().text().trim() || `Card ${index + 1}`;
    const body = card.find("p").first().text().trim() || card.text().trim();
    let variant: CourseCard["variant"] = "generic";
    if (card.hasClass("info-card")) {
      variant = "info";
    } else if (card.hasClass("anatomy-card")) {
      variant = "anatomy";
    } else if (card.hasClass("warning-card")) {
      variant = "warning";
    }

    cards.push({
      id: `${slugify(title || `card-${index + 1}`)}-${index + 1}`,
      variant,
      title,
      body
    });
  });

  return cards;
}

export function extractElementText(element: Cheerio<AnyNode>) {
  return element.text().replace(/\s+/g, " ").trim();
}
