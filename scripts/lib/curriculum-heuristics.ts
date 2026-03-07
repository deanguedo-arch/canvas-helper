import path from "node:path";

import type {
  ReferenceChunk,
  ReferenceChunkLocator,
  ResourceAuthorityRole,
  ResourceCatalogEntry,
  ResourceCategory
} from "./types.js";

const STOP_WORDS = new Set([
  "about",
  "adlc",
  "after",
  "again",
  "also",
  "among",
  "an",
  "and",
  "are",
  "assignment",
  "assignments",
  "assessment",
  "because",
  "before",
  "between",
  "booklet",
  "both",
  "but",
  "can",
  "course",
  "does",
  "each",
  "from",
  "general",
  "have",
  "into",
  "key",
  "lesson",
  "many",
  "more",
  "must",
  "need",
  "not",
  "objective",
  "objectives",
  "overview",
  "our",
  "over",
  "page",
  "section",
  "should",
  "some",
  "student",
  "students",
  "study",
  "text",
  "term",
  "terms",
  "that",
  "their",
  "them",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "unit",
  "use",
  "what",
  "when",
  "where",
  "which",
  "with",
  "your"
]);

const ACTION_VERBS = [
  "analyze",
  "apply",
  "argue",
  "assess",
  "classify",
  "compare",
  "complete",
  "contrast",
  "create",
  "define",
  "describe",
  "design",
  "develop",
  "discuss",
  "evaluate",
  "explain",
  "identify",
  "illustrate",
  "interpret",
  "justify",
  "list",
  "outline",
  "predict",
  "pretend",
  "provide",
  "reflect",
  "respond",
  "show",
  "summarize",
  "support",
  "write"
];

const OUTLINE_PATTERNS = [
  { reason: "filename:overview", pattern: /over\s*view/i, weight: 6 },
  { reason: "filename:outline", pattern: /\boutline\b/i, weight: 6 },
  { reason: "filename:syllabus", pattern: /\bsyllabus\b/i, weight: 5 },
  { reason: "text:objectives", pattern: /\bobjectives?\b/i, weight: 5 },
  { reason: "text:table-of-contents", pattern: /\btable of contents\b/i, weight: 4 },
  { reason: "text:unit-overview", pattern: /\bunit\b.{0,20}\boverview\b/i, weight: 4 },
  { reason: "text:outcomes", pattern: /\boutcomes?\b/i, weight: 3 }
];

const ASSESSMENT_PATTERNS = [
  { reason: "filename:key", pattern: /\bkey\b/i, weight: 8 },
  { reason: "filename:assignment", pattern: /\bassignment\b/i, weight: 6 },
  { reason: "filename:quiz", pattern: /\bquiz\b/i, weight: 6 },
  { reason: "filename:test", pattern: /\btest\b/i, weight: 6 },
  { reason: "filename:exam", pattern: /\bexam\b/i, weight: 6 },
  { reason: "filename:rubric", pattern: /\brubric\b/i, weight: 6 },
  { reason: "text:possible-marks", pattern: /\bpossible marks\b/i, weight: 5 },
  { reason: "text:for-successful-completion", pattern: /\bfor successful completion\b/i, weight: 5 },
  { reason: "text:teacher-comments", pattern: /\bteacher'?s comments\b/i, weight: 3 },
  { reason: "text:assignment-booklet", pattern: /\bassignment booklet\b/i, weight: 6 },
  { reason: "text:assessment", pattern: /\bassessment\b/i, weight: 4 }
];

const TEACHER_NOTE_PATTERNS = [
  { reason: "filename:teacher", pattern: /\bteacher\b/i, weight: 8 },
  { reason: "filename:instructor", pattern: /\binstructor\b/i, weight: 7 },
  { reason: "filename:notes", pattern: /\bnotes?\b/i, weight: 5 },
  { reason: "text:teacher-notes", pattern: /\bteacher'?s notes?\b/i, weight: 6 },
  { reason: "text:facilitator", pattern: /\bfacilitator\b/i, weight: 4 },
  { reason: "text:lesson-plan", pattern: /\blesson plan\b/i, weight: 5 }
];

const TEXTBOOK_PATTERNS = [
  { reason: "filename:textbook", pattern: /\btext(book)?\b/i, weight: 6 },
  { reason: "filename:chapter", pattern: /\bchapter\b/i, weight: 6 },
  { reason: "filename:lesson", pattern: /\blesson\b/i, weight: 4 },
  { reason: "filename:unit", pattern: /\bunit\b/i, weight: 3 },
  { reason: "text:lesson-heading", pattern: /\blesson\s+\d+/i, weight: 4 },
  { reason: "text:what-is", pattern: /\bwhat is\b/i, weight: 3 },
  { reason: "text:section-heading", pattern: /\bsection\s+(one|two|three|four|five|\d+)/i, weight: 3 }
];

type ScoredCategory = {
  category: ResourceCategory;
  score: number;
  reasons: string[];
};

export type ResourceClassification = {
  resourceCategory: ResourceCategory;
  authorityRole: ResourceAuthorityRole;
  blueprintSignals: string[];
  assessmentSignals: string[];
  supportSignals: string[];
};

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

export function normalizeText(value: string) {
  return value
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function toStableId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function cleanDisplayTitle(value: string) {
  return value
    .replace(path.extname(value), "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isLikelyGarbage(line: string) {
  const compact = line.replace(/\s+/g, "");
  if (!/\s/.test(line) && compact.length > 18) {
    return true;
  }

  if (compact.length < 18) {
    return false;
  }

  return /^[a-z]+$/i.test(compact) && !/[aeiou]{2,}/i.test(compact);
}

function isHeadingLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 90) {
    return false;
  }

  if (/[.!?]$/.test(trimmed)) {
    return false;
  }

  if (/^(section|lesson|unit|chapter|assignment|overview|objectives?)\b/i.test(trimmed)) {
    return true;
  }

  const lettersOnly = trimmed.replace(/[^A-Za-z]/g, "");
  if (lettersOnly.length < 4) {
    return false;
  }

  const uppercaseRatio = trimmed.replace(/[^A-Z]/g, "").length / Math.max(1, lettersOnly.length);
  return uppercaseRatio > 0.55;
}

export function guessTitleFromText(text: string, fallbackPath: string) {
  const fallback = cleanDisplayTitle(path.basename(fallbackPath));
  const titleParts: string[] = [];

  for (const line of normalizeText(text).split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 4 || trimmed.length > 90 || isLikelyGarbage(trimmed)) {
      continue;
    }

    if (
      /^(student name|nameaddress|city\/town|possible marks|teacher'?s comments|for student use only|alberta distance learning centre)/i.test(
        trimmed
      )
    ) {
      continue;
    }

    titleParts.push(trimmed);
    if (
      titleParts.length >= 2 &&
      /\bover\s*view\b|\bkey\b|\bassignment booklet\b|\bunit\s+\d+\b/i.test(titleParts[titleParts.length - 1] ?? "")
    ) {
      break;
    }
    if (titleParts.length >= 3 || titleParts.join(" ").length > 48) {
      break;
    }
  }

  if (titleParts.length > 0) {
    return titleParts.join(" ").replace(/\s+/g, " ").trim();
  }

  return fallback;
}

function scorePatterns(source: string, patterns: Array<{ reason: string; pattern: RegExp; weight: number }>) {
  let score = 0;
  const reasons: string[] = [];

  for (const { reason, pattern, weight } of patterns) {
    if (!pattern.test(source)) {
      continue;
    }
    score += weight;
    reasons.push(reason);
  }

  return { score, reasons };
}

export function classifyResource(relativePath: string, titleGuess: string, extractedText: string | null): ResourceClassification {
  const pathTitleSource = [relativePath, titleGuess].join("\n");
  const textSource = extractedText ?? "";
  const outline = {
    score:
      scorePatterns(
        pathTitleSource,
        OUTLINE_PATTERNS.filter((pattern) => pattern.reason.startsWith("filename:"))
      ).score +
      scorePatterns(
        textSource,
        OUTLINE_PATTERNS.filter((pattern) => pattern.reason.startsWith("text:"))
      ).score,
    reasons: [
      ...scorePatterns(
        pathTitleSource,
        OUTLINE_PATTERNS.filter((pattern) => pattern.reason.startsWith("filename:"))
      ).reasons,
      ...scorePatterns(
        textSource,
        OUTLINE_PATTERNS.filter((pattern) => pattern.reason.startsWith("text:"))
      ).reasons
    ]
  };
  const assessment = {
    score:
      scorePatterns(
        pathTitleSource,
        ASSESSMENT_PATTERNS.filter((pattern) => pattern.reason.startsWith("filename:"))
      ).score +
      scorePatterns(
        textSource,
        ASSESSMENT_PATTERNS.filter((pattern) => pattern.reason.startsWith("text:"))
      ).score,
    reasons: [
      ...scorePatterns(
        pathTitleSource,
        ASSESSMENT_PATTERNS.filter((pattern) => pattern.reason.startsWith("filename:"))
      ).reasons,
      ...scorePatterns(
        textSource,
        ASSESSMENT_PATTERNS.filter((pattern) => pattern.reason.startsWith("text:"))
      ).reasons
    ]
  };
  const teacherNote = {
    score:
      scorePatterns(
        pathTitleSource,
        TEACHER_NOTE_PATTERNS.filter((pattern) => pattern.reason.startsWith("filename:"))
      ).score +
      scorePatterns(
        textSource,
        TEACHER_NOTE_PATTERNS.filter((pattern) => pattern.reason.startsWith("text:"))
      ).score,
    reasons: [
      ...scorePatterns(
        pathTitleSource,
        TEACHER_NOTE_PATTERNS.filter((pattern) => pattern.reason.startsWith("filename:"))
      ).reasons,
      ...scorePatterns(
        textSource,
        TEACHER_NOTE_PATTERNS.filter((pattern) => pattern.reason.startsWith("text:"))
      ).reasons
    ]
  };
  const textbook = {
    score:
      scorePatterns(
        pathTitleSource,
        TEXTBOOK_PATTERNS.filter((pattern) => pattern.reason.startsWith("filename:"))
      ).score +
      scorePatterns(
        textSource,
        TEXTBOOK_PATTERNS.filter((pattern) => pattern.reason.startsWith("text:"))
      ).score,
    reasons: [
      ...scorePatterns(
        pathTitleSource,
        TEXTBOOK_PATTERNS.filter((pattern) => pattern.reason.startsWith("filename:"))
      ).reasons,
      ...scorePatterns(
        textSource,
        TEXTBOOK_PATTERNS.filter((pattern) => pattern.reason.startsWith("text:"))
      ).reasons
    ]
  };

  const scored: ScoredCategory[] = [
    { category: "assessment", score: assessment.score, reasons: assessment.reasons },
    { category: "outline", score: outline.score, reasons: outline.reasons },
    { category: "teacher-note", score: teacherNote.score, reasons: teacherNote.reasons },
    { category: "textbook", score: textbook.score, reasons: textbook.reasons }
  ];

  const winner = scored.sort((left, right) => right.score - left.score || left.category.localeCompare(right.category))[0];
  const category = winner && winner.score > 0 ? winner.category : "other";
  const authorityRole: ResourceAuthorityRole =
    category === "assessment"
      ? "assessment-authoritative"
      : category === "outline"
        ? "blueprint-authoritative"
        : category === "teacher-note"
          ? "context-authoritative"
          : category === "other"
            ? "supporting-only"
            : "supporting-only";

  return {
    resourceCategory: category,
    authorityRole,
    blueprintSignals: uniqueSorted(category === "outline" ? winner.reasons : outline.reasons),
    assessmentSignals: uniqueSorted(category === "assessment" ? winner.reasons : assessment.reasons),
    supportSignals: uniqueSorted(
      category === "teacher-note" || category === "textbook" ? winner.reasons : [...teacherNote.reasons, ...textbook.reasons]
    )
  };
}

export function extractUnitNumber(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (!value) {
      continue;
    }

    const unitMatch = value.match(/\bunit\s+(\d+)\b/i);
    if (unitMatch) {
      return Number(unitMatch[1]);
    }

    const assignmentMatch = value.match(/\bassignment(?: booklet)?\s*#?\s*(\d+)\b/i);
    if (assignmentMatch) {
      return Number(assignmentMatch[1]);
    }
  }

  return null;
}

export function extractSectionHeadings(text: string, limit = 12) {
  return uniqueSorted(
    normalizeText(text)
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => isHeadingLine(line))
      .slice(0, limit)
  );
}

function createLocatorLabel(locator: ReferenceChunkLocator) {
  if (locator.kind === "page" && typeof locator.page === "number") {
    return `Page ${locator.page}`;
  }

  return locator.label;
}

function splitLargeSection(
  sectionHeading: string | undefined,
  paragraphs: string[],
  startIndex: number,
  maxLength = 1400
) {
  const chunks: Array<{ heading?: string; text: string; part: number }> = [];
  let current = "";
  let part = 1;

  for (const paragraph of paragraphs) {
    const nextValue = current ? `${current}\n\n${paragraph}` : paragraph;
    if (nextValue.length > maxLength && current) {
      chunks.push({ heading: sectionHeading, text: current, part });
      current = paragraph;
      part += 1;
      continue;
    }
    current = nextValue;
  }

  if (current) {
    chunks.push({ heading: sectionHeading, text: current, part });
  }

  if (chunks.length === 0) {
    chunks.push({ heading: sectionHeading, text: paragraphs.join("\n\n"), part: startIndex });
  }

  return chunks;
}

export function chunkTextBySections(text: string, titleGuess: string) {
  const normalized = normalizeText(text);
  if (!normalized) {
    return [] as ReferenceChunk[];
  }

  const blocks = normalized.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  const sectionGroups: Array<{ heading?: string; paragraphs: string[] }> = [];
  let currentHeading: string | undefined;
  let currentParagraphs: string[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const firstLine = lines[0] ?? "";
    if (isHeadingLine(firstLine) && lines.length <= 3) {
      if (currentParagraphs.length > 0) {
        sectionGroups.push({ heading: currentHeading, paragraphs: currentParagraphs });
        currentParagraphs = [];
      }
      currentHeading = firstLine;
      const remaining = lines.slice(1).join("\n").trim();
      if (remaining) {
        currentParagraphs.push(remaining);
      }
      continue;
    }

    currentParagraphs.push(block);
  }

  if (currentParagraphs.length > 0) {
    sectionGroups.push({ heading: currentHeading, paragraphs: currentParagraphs });
  }

  let index = 1;
  const chunks: ReferenceChunk[] = [];
  for (const group of sectionGroups) {
    const splitSections = splitLargeSection(group.heading, group.paragraphs, index);
    for (const section of splitSections) {
      const heading = section.heading ?? (index === 1 ? titleGuess : `Section ${index}`);
      const locator: ReferenceChunkLocator = {
        kind: "section",
        label: section.part > 1 ? `${heading} (Part ${section.part})` : heading,
        sectionHeading: heading
      };

      const cleaned = normalizeText(section.text);
      if (!cleaned) {
        continue;
      }

      chunks.push({
        id: `${toStableId(locator.label)}-${index}`,
        index,
        locator,
        text: cleaned,
        titleGuess: heading,
        keywordHints: extractTopKeywords(cleaned, 8)
      });
      index += 1;
    }
  }

  return chunks;
}

export function extractTopKeywords(text: string, limit = 10) {
  const counts = new Map<string, number>();
  for (const token of normalizeText(text).toLowerCase().split(/[^a-z0-9]+/g)) {
    if (token.length < 4 || STOP_WORDS.has(token) || /^\d+$/.test(token)) {
      continue;
    }
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([token]) => token);
}

export function chunkPdfPages(
  pages: Array<{ page: number; text: string }>,
  titleGuess: string
) {
  const chunks: ReferenceChunk[] = [];

  for (const page of pages) {
    const cleaned = normalizeText(page.text);
    if (!cleaned) {
      continue;
    }

    chunks.push({
      id: `${toStableId(`${titleGuess}-page-${page.page}`)}`,
      index: page.page,
      locator: {
        kind: "page",
        label: `Page ${page.page}`,
        page: page.page,
        startPage: page.page,
        endPage: page.page
      },
      text: cleaned,
      titleGuess,
      keywordHints: extractTopKeywords(cleaned, 8)
    });
  }

  return chunks;
}

export function extractObjectiveStatements(text: string, limit = 8) {
  const normalized = normalizeText(text);
  const lines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);
  const objectives: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!/^objectives?:/i.test(line)) {
      continue;
    }

    const inlineObjective = line.replace(/^objectives?:/i, "").trim();
    if (inlineObjective) {
      objectives.push(inlineObjective);
    }

    for (let offset = index + 1; offset < Math.min(lines.length, index + 10); offset += 1) {
      const candidate = lines[offset];
      if (isHeadingLine(candidate) || /^\d+\./.test(candidate)) {
        break;
      }

      const cleaned = candidate.replace(/^[*\-•]+\s*/, "").trim();
      if (/^(to\s+|understand\b|explain\b|identify\b|compare\b|analyze\b)/i.test(cleaned)) {
        objectives.push(cleaned);
      }
    }
  }

  if (objectives.length === 0) {
    for (const line of lines) {
      const cleaned = line.replace(/^[*\-•]+\s*/, "").trim();
      if (/^(to\s+|understand\b|explain\b|identify\b|compare\b|analyze\b)/i.test(cleaned)) {
        objectives.push(cleaned);
      }
      if (objectives.length >= limit) {
        break;
      }
    }
  }

  return uniqueSorted(objectives.map((item) => item.replace(/\s+/g, " ").trim())).slice(0, limit);
}

export function extractGlossaryTerms(text: string, limit = 10) {
  const lines = normalizeText(text).split("\n");
  const glossary = new Set<string>();

  for (const line of lines) {
    const match = line.match(/^([A-Za-z][A-Za-z /'-]{2,40})\s+[—-]\s+/);
    if (!match) {
      continue;
    }
    glossary.add(match[1].trim());
    if (glossary.size >= limit) {
      break;
    }
  }

  return [...glossary];
}

export function extractVocabularyCandidates(text: string, limit = 10) {
  const glossaryTerms = extractGlossaryTerms(text, limit);
  const keywords = extractTopKeywords(text, limit * 2)
    .map((keyword) => keyword.replace(/\b\w/g, (char) => char.toUpperCase()))
    .filter((keyword) => keyword.length > 3);
  return uniqueSorted([...glossaryTerms, ...keywords]).slice(0, limit);
}

export function extractActionVerbs(text: string, limit = 8) {
  const counts = new Map<string, number>();
  const lower = normalizeText(text).toLowerCase();
  for (const verb of ACTION_VERBS) {
    const match = lower.match(new RegExp(`\\b${verb}\\b`, "g"));
    if (match?.length) {
      counts.set(verb, match.length);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([verb]) => verb);
}

export function inferTaskType(title: string, text: string) {
  const source = `${title}\n${text}`.toLowerCase();
  if (/\bassignment booklet\b/.test(source)) {
    return "assignment-booklet";
  }
  if (/\bassignment\b/.test(source)) {
    return "assignment";
  }
  if (/\brubric\b/.test(source)) {
    return "rubric";
  }
  if (/\bexam\b|\bfinal\b/.test(source)) {
    return "exam";
  }
  if (/\bquiz\b/.test(source)) {
    return "quiz";
  }
  if (/\bproject\b/.test(source)) {
    return "project";
  }
  return "written-response";
}

export function inferDeliverable(taskType: string) {
  switch (taskType) {
    case "assignment-booklet":
      return "Completed assignment booklet responses";
    case "assignment":
      return "Submitted assignment responses";
    case "quiz":
      return "Completed quiz responses";
    case "exam":
      return "Assessment responses completed under exam conditions";
    case "project":
      return "Finished project or performance artifact";
    case "rubric":
      return "Work product that satisfies rubric criteria";
    default:
      return "Completed written responses";
  }
}

export function extractSuccessCriteria(text: string, limit = 8) {
  const lines = normalizeText(text).split("\n").map((line) => line.trim()).filter(Boolean);
  const criteria: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!/^(assessment|criteria|rubric|for successful completion)/i.test(line)) {
      continue;
    }

    const inline = line.replace(/^(assessment|criteria|rubric|for successful completion)\s*:?\s*/i, "").trim();
    if (inline) {
      criteria.push(inline);
    }

    for (let offset = index + 1; offset < Math.min(lines.length, index + 12); offset += 1) {
      const candidate = lines[offset].replace(/^[*\-•]+\s*/, "").trim();
      if (!candidate || isHeadingLine(candidate)) {
        break;
      }
      if (candidate.length >= 12) {
        criteria.push(candidate);
      }
    }
  }

  if (criteria.length === 0) {
    for (const sentence of splitSentences(text)) {
      if (/\bmust\b|\baccurate\b|\bcomplete\b|\bproofread\b|\brespond\b/i.test(sentence)) {
        criteria.push(sentence);
      }
      if (criteria.length >= limit) {
        break;
      }
    }
  }

  return uniqueSorted(criteria).slice(0, limit);
}

export function splitSentences(text: string) {
  return normalizeText(text)
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 20);
}

export function extractNumberedPrompts(text: string, limit = 10) {
  const prompts: string[] = [];
  for (const line of normalizeText(text).split("\n")) {
    const match = line.match(/^\s*(\d+\.|[a-z]\.)\s+(.+)/i);
    if (!match) {
      continue;
    }
    prompts.push(match[2].trim());
    if (prompts.length >= limit) {
      break;
    }
  }
  return prompts;
}

export function buildFailurePoints(skillVerbs: string[], successCriteria: string[], taskType: string) {
  const failures = new Set<string>();

  for (const verb of skillVerbs) {
    switch (verb) {
      case "compare":
      case "contrast":
        failures.add("Students may describe items separately without making the actual comparison explicit.");
        break;
      case "define":
      case "identify":
        failures.add("Students may name terms correctly but fail to connect them to examples or evidence.");
        break;
      case "explain":
      case "analyze":
      case "interpret":
        failures.add("Students may give surface summaries instead of cause-and-effect or evidence-based explanations.");
        break;
      case "write":
      case "argue":
      case "justify":
        failures.add("Students may provide unsupported opinions instead of organized, criteria-aligned responses.");
        break;
      default:
        failures.add(`Students may attempt to ${verb} without using the required vocabulary or evidence.`);
        break;
    }
  }

  if (taskType === "assignment-booklet") {
    failures.add("Students may leave multi-part prompts incomplete or skip required formatting details.");
  }

  if (successCriteria.some((criterion) => /\bproofread\b|\bgrammar\b|\bpunctuation\b/i.test(criterion))) {
    failures.add("Students may lose marks by neglecting editing, formatting, or completeness requirements.");
  }

  return [...failures].slice(0, 6);
}

export function findRepresentativeExamples(text: string, limit = 4) {
  const examples = splitSentences(text).filter((sentence) => /\bfor example\b|\bsuch as\b|\bpretend\b|\bcase\b/i.test(sentence));
  if (examples.length > 0) {
    return examples.slice(0, limit);
  }

  return splitSentences(text).slice(0, limit);
}

export function keywordOverlap(left: string[], right: string[]) {
  const rightSet = new Set(right);
  return left.filter((value) => rightSet.has(value));
}

export function summarizeLocator(locator: ReferenceChunkLocator) {
  return createLocatorLabel(locator);
}

export function resourceSummaryKeywords(resource: Pick<ResourceCatalogEntry, "titleGuess" | "blueprintSignals" | "assessmentSignals" | "supportSignals">) {
  return uniqueSorted([
    ...extractTopKeywords(resource.titleGuess, 4),
    ...resource.blueprintSignals.map((signal) => signal.split(":").pop() ?? signal),
    ...resource.assessmentSignals.map((signal) => signal.split(":").pop() ?? signal),
    ...resource.supportSignals.map((signal) => signal.split(":").pop() ?? signal)
  ])
    .filter((token) => {
      const normalized = token.toLowerCase().replace(/[^a-z0-9]+/g, "");
      return normalized.length >= 4 && !STOP_WORDS.has(normalized);
    })
    .slice(0, 10);
}
