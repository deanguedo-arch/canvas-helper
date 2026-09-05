import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { load as loadHtml, type CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import JSZip from "jszip";

import {
  decodeD2lText,
  normalizeArchivePath,
  type NamedBrightspaceResource,
  type ScienceComparisonContractV1
} from "../science-comparison.js";
import type {
  BiologySourceModel,
  ContentDisposition,
  D2lItem,
  D2lResource,
  PracticeQuestion,
  PracticeQuiz
} from "./types.js";

function normalizeTitle(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function isExternalHref(value: string) {
  return /^(?:https?:|mailto:|tel:|data:)/i.test(value.trim());
}

function isUtf16(bytes: Uint8Array) {
  if (bytes.length >= 2 && ((bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0xfe && bytes[1] === 0xff))) {
    return true;
  }
  const sampleLength = Math.min(bytes.length, 2048);
  let oddNulls = 0;
  let evenNulls = 0;
  for (let index = 0; index < sampleLength; index += 1) {
    if (bytes[index] !== 0) continue;
    if (index % 2 === 0) evenNulls += 1;
    else oddNulls += 1;
  }
  return oddNulls > sampleLength / 8 && oddNulls > evenNulls * 3;
}

async function sha256File(filePath: string) {
  const hash = createHash("sha256");
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolve);
  });
  return hash.digest("hex");
}

function parseResources($: CheerioAPI) {
  const resources = new Map<string, D2lResource>();
  $("resources > resource").each((_index, element) => {
    const node = $(element);
    const identifier = node.attr("identifier")?.trim();
    if (!identifier) return;
    resources.set(identifier, {
      identifier,
      href: node.attr("href")?.trim() ?? "",
      type: node.attr("type")?.trim() ?? "",
      materialType: node.attr("d2l_2p0:material_type")?.trim() || undefined,
      resourceCode: node.attr("d2l_2p0:resource_code")?.trim() || undefined,
      files: node
        .children("file")
        .map((_fileIndex, fileElement) => $(fileElement).attr("href")?.trim() ?? "")
        .get()
        .filter(Boolean)
    });
  });
  return resources;
}

function parseItem(input: {
  $: CheerioAPI;
  element: Element;
  resources: Map<string, D2lResource>;
  parentId?: string;
  parentPath: string[];
  parentVisible: boolean;
}): D2lItem {
  const node = input.$(input.element);
  const identifier = node.attr("identifier")?.trim();
  if (!identifier) throw new Error("Brightspace manifest contains an item without an identifier.");
  const title = normalizeTitle(node.children("title").first().text()) || `Untitled ${identifier}`;
  const identifierRef = node.attr("identifierref")?.trim() || undefined;
  const explicitlyHidden = /^false$/i.test(node.attr("isvisible")?.trim() ?? "");
  const visible = input.parentVisible && !explicitlyHidden;
  const item: D2lItem = {
    identifier,
    identifierRef,
    resourceCode: node.attr("d2l_2p0:resource_code")?.trim() || undefined,
    resourceTypeKey: node.attr("resource_type_key")?.trim() || undefined,
    title,
    descriptionHtml: node.attr("description") ?? "",
    visible,
    explicitlyHidden,
    parentId: input.parentId,
    pathTitles: [...input.parentPath, title],
    resource: identifierRef ? input.resources.get(identifierRef) : undefined,
    children: []
  };
  item.children = node
    .children("item")
    .toArray()
    .map((child) =>
      parseItem({
        $: input.$,
        element: child as Element,
        resources: input.resources,
        parentId: identifier,
        parentPath: item.pathTitles,
        parentVisible: visible
      })
    );
  return item;
}

export function flattenD2lItems(items: D2lItem[]) {
  const flattened: D2lItem[] = [];
  const visit = (item: D2lItem) => {
    flattened.push(item);
    item.children.forEach(visit);
  };
  items.forEach(visit);
  return flattened;
}

function findUnitRoot(roots: D2lItem[], unitTitle: string) {
  const target = normalizeTitle(unitTitle).toLowerCase();
  const exact = roots.find((item) => item.title.toLowerCase() === target);
  if (exact) return exact;
  const prefixed = roots.find((item) => item.title.toLowerCase().startsWith(target));
  if (prefixed) return prefixed;
  const all = flattenD2lItems(roots);
  const nested = all.find((item) => item.title.toLowerCase() === target || item.title.toLowerCase().startsWith(`${target} `));
  if (nested) return nested;
  throw new Error(`Could not find ${JSON.stringify(unitTitle)} in the Brightspace manifest.`);
}

function elementTextByLocalName(node: ReturnType<CheerioAPI>, localName: string) {
  return node
    .find("*")
    .filter((_index, element) => {
      const name = (element as Element).name.toLowerCase();
      return name === localName || name.endsWith(`:${localName}`);
    })
    .first()
    .text()
    .trim();
}

function questionType($: CheerioAPI, itemNode: ReturnType<CheerioAPI>) {
  let rawType = "";
  itemNode.find("qti_metadatafield").each((_index, element) => {
    const field = $(element);
    if (field.children("fieldlabel").first().text().trim() === "qmd_questiontype") {
      rawType = field.children("fieldentry").first().text().trim();
    }
  });
  if (/multiple choice/i.test(rawType)) return "multiple-choice" as const;
  if (/short answer/i.test(rawType)) return "short-answer" as const;
  return "long-answer" as const;
}

function parseQtiQuiz(xmlText: string, input: { title: string; sourceItemId: string; sourceXmlPath: string }): PracticeQuiz {
  const $ = loadHtml(xmlText, { xmlMode: true });
  const assessment = $("assessment").first();
  if (!assessment.length) throw new Error(`Quiz XML has no assessment: ${input.sourceXmlPath}`);
  const sourceResourceCode = assessment.attr("d2l_2p0:resource_code")?.trim() ?? "";
  const questions: PracticeQuestion[] = [];
  assessment.find("section item").each((_index, element) => {
    const node = $(element);
    const id = node.attr("ident")?.trim() || `question-${questions.length + 1}`;
    const type = questionType($, node);
    const presentation = node.children("presentation").first();
    const promptHtml = presentation.find("flow > material > mattext").first().text().trim();
    if (!promptHtml) return;
    const choices = presentation
      .find("response_lid response_label")
      .toArray()
      .map((choiceElement) => {
        const choice = $(choiceElement);
        return {
          id: choice.attr("ident")?.trim() || `choice-${questions.length + 1}`,
          html: choice.find("material > mattext").first().text().trim()
        };
      });
    const correctValues: string[] = [];
    node.find("resprocessing respcondition").each((_conditionIndex, conditionElement) => {
      const condition = $(conditionElement);
      const score = Number.parseFloat(condition.children("setvar").first().text().trim());
      if (!Number.isFinite(score) || score < 99.999) return;
      condition.find("varequal").each((_answerIndex, answerElement) => {
        const value = $(answerElement).text().trim();
        if (value && !correctValues.includes(value)) correctValues.push(value);
      });
    });
    let sourceLabel: string | undefined;
    node.find("qti_metadatafield").each((_metadataIndex, metadataElement) => {
      const metadata = $(metadataElement);
      if (metadata.children("fieldlabel").first().text().trim() === "qmd_displayid") {
        sourceLabel = metadata.children("fieldentry").first().text().trim() || undefined;
      }
    });
    questions.push({
      id,
      sourceLabel,
      type,
      promptHtml,
      choices,
      correctValues,
      sourceXmlPath: input.sourceXmlPath
    });
  });

  return {
    id: assessment.attr("ident")?.trim() || path.posix.basename(input.sourceXmlPath, ".xml"),
    title: normalizeTitle(assessment.attr("title")?.trim() || input.title),
    sourceItemId: input.sourceItemId,
    sourceResourceCode,
    sourceXmlPath: input.sourceXmlPath,
    originalSettings: {
      attemptsAllowed: elementTextByLocalName(assessment, "attempts_allowed") || undefined,
      timeLimitMinutes: elementTextByLocalName(assessment, "time_limit") || undefined,
      gradeItem: elementTextByLocalName(assessment, "grade_item") || undefined
    },
    questions
  };
}

function quickLinkResourceCode(href: string) {
  const match = href.match(/[?&]rcode=([^&#]+)/i);
  return match ? decodeURIComponent(match[1]) : "";
}

async function loadVisibleChapterQuizzes(archive: JSZip, items: D2lItem[], chapterNumbers: number[]) {
  if (chapterNumbers.length === 0 || chapterNumbers.some((chapter) => !Number.isInteger(chapter) || chapter < 1)) {
    throw new Error("Biology source intake requires at least one valid chapter number.");
  }
  const chapterPattern = chapterNumbers.map(String).join("|");
  const visibleChapterQuizPattern = new RegExp(`chapter\\s+(?:${chapterPattern})\\s+quiz`, "i");
  const visibleQuizItems = items.filter(
    (item) =>
      item.visible &&
      /quizzing\.quiz/i.test(item.resourceTypeKey ?? "") &&
      visibleChapterQuizPattern.test(item.title) &&
      !/unit\s+[a-d]\s+(?:test|exam)/i.test(item.title)
  );
  const qtiByResourceCode = new Map<string, { path: string; text: string }>();
  for (const entry of Object.values(archive.files)) {
    if (entry.dir || !/^quiz_d2l_\d+\.xml$/i.test(path.posix.basename(entry.name))) continue;
    const text = decodeD2lText(await entry.async("uint8array"));
    const $ = loadHtml(text, { xmlMode: true });
    const resourceCode = $("assessment").first().attr("d2l_2p0:resource_code")?.trim();
    if (resourceCode) qtiByResourceCode.set(resourceCode, { path: normalizeArchivePath(entry.name), text });
  }

  const quizzes: PracticeQuiz[] = [];
  for (const item of visibleQuizItems) {
    const resourceCode = quickLinkResourceCode(item.resource?.href ?? "") || item.resource?.resourceCode || "";
    const qti = qtiByResourceCode.get(resourceCode);
    if (!qti) throw new Error(`Visible quiz ${item.title} does not have matching QTI source for resource code ${resourceCode}.`);
    const quiz = parseQtiQuiz(qti.text, { title: item.title, sourceItemId: item.identifier, sourceXmlPath: qti.path });
    if (quiz.questions.length === 0) throw new Error(`Visible quiz ${item.title} contains no convertible questions.`);
    quizzes.push(quiz);
  }
  return quizzes;
}

async function cacheUnitHtml(archive: JSZip, items: D2lItem[]) {
  const textByArchivePath = new Map<string, string>();
  const utf16HtmlPaths: string[] = [];
  const linkedHtmlPaths = new Set<string>();
  for (const item of items) {
    const href = item.resource?.href?.trim() ?? "";
    if (!href || isExternalHref(href) || !/\.html?(?:[?#].*)?$/i.test(href)) continue;
    const archivePath = normalizeArchivePath(href.split(/[?#]/, 1)[0]);
    linkedHtmlPaths.add(archivePath);
  }
  const unitPrefix = [...linkedHtmlPaths]
    .map((archivePath) => archivePath.match(/^(.*\/u[a-d]\/)/i)?.[1] ?? "")
    .find(Boolean);
  const htmlPaths = new Set(linkedHtmlPaths);
  if (unitPrefix) {
    for (const entry of Object.values(archive.files)) {
      if (!entry.dir && entry.name.startsWith(unitPrefix) && /\.html?$/i.test(entry.name)) {
        htmlPaths.add(normalizeArchivePath(entry.name));
      }
    }
  }
  for (const archivePath of htmlPaths) {
    const entry = archive.file(archivePath);
    if (!entry) continue;
    const bytes = await entry.async("uint8array");
    if (isUtf16(bytes)) utf16HtmlPaths.push(archivePath);
    textByArchivePath.set(archivePath, decodeD2lText(bytes));
  }
  return {
    textByArchivePath,
    utf16HtmlPaths,
    unreferencedUnitHtmlPaths: [...htmlPaths].filter((archivePath) => !linkedHtmlPaths.has(archivePath)).sort()
  };
}

export async function loadBiologySourceModel(input: {
  repoRoot: string;
  resource: NamedBrightspaceResource;
  unitTitle: string;
  chapterNumbers?: number[];
}): Promise<BiologySourceModel> {
  const archivePath = path.join(input.repoRoot, input.resource.path);
  const actualHash = await sha256File(archivePath);
  if (actualHash !== input.resource.sha256) {
    throw new Error(`Source checksum drift for ${input.resource.id}: expected ${input.resource.sha256}, received ${actualHash}.`);
  }
  const archive = await JSZip.loadAsync(await readFile(archivePath), { createFolders: false });
  const manifestEntry = archive.file(input.resource.manifestPath) ?? archive.file("imsmanifest.xml");
  if (!manifestEntry) throw new Error(`Missing manifest in named source ${input.resource.id}.`);
  const manifestText = decodeD2lText(await manifestEntry.async("uint8array"));
  const $ = loadHtml(manifestText, { xmlMode: true });
  const resources = parseResources($);
  const organization = $("organizations > organization").first();
  const roots = organization
    .children("item")
    .toArray()
    .map((element) =>
      parseItem({
        $,
        element: element as Element,
        resources,
        parentPath: [],
        parentVisible: true
      })
    );
  const unitRoot = findUnitRoot(roots, input.unitTitle);
  const items = flattenD2lItems([unitRoot]);
  const quizzes = await loadVisibleChapterQuizzes(archive, items, input.chapterNumbers ?? [11, 12, 13]);
  const { textByArchivePath, utf16HtmlPaths, unreferencedUnitHtmlPaths } = await cacheUnitHtml(archive, items);
  const metadata = $("manifest").first().children("metadata").first();
  let metadataTitle = "";
  metadata.find("*").each((_index, element) => {
    if (metadataTitle) return false;
    const name = (element as Element).name.toLowerCase();
    if (name !== "title" && !name.endsWith(":title")) return;
    metadataTitle = $(element).text().replace(/\s+/g, " ").trim();
  });
  const manifestTitle = metadataTitle || organization.children("title").first().text().trim() || input.resource.manifestTitle;
  return {
    resource: input.resource,
    archive,
    manifestPath: input.resource.manifestPath,
    manifestIdentifier: $("manifest").first().attr("identifier")?.trim() || input.resource.manifestIdentifier,
    manifestTitle,
    roots,
    unitRoot,
    items,
    quizzes,
    utf16HtmlPaths,
    unreferencedUnitHtmlPaths,
    textByArchivePath
  };
}

function isHiddenInstructionalNotesReplacement(item: D2lItem, unitCode: "A" | "B" | "C" | "D") {
  return (
    item.explicitlyHidden &&
    new RegExp(`unit\\s+${unitCode}.*notes`, "i").test(item.title) &&
    /\.pdf$/i.test(item.resource?.href ?? "")
  );
}

function isTeacherAssessmentTitle(title: string, unitCode: "A" | "B" | "C" | "D") {
  return new RegExp(`unit\\s+${unitCode}\\s+(?:exam|test)|teacher[- ]only`, "i").test(title);
}

function isExcludedQuizMaterial(title: string) {
  return /quiz.*(?:printable|key)|(?:printable|key).*quiz/i.test(title);
}

function isLearnerVisibleAnswer(item: D2lItem) {
  return item.visible && /(?:textbook|review|seminar).*(?:key|answer)|(?:key|answer).*(?:textbook|review|seminar)/i.test(item.title);
}

export function classifyBiologyUnitSourceDisposition(
  source: BiologySourceModel,
  input: { unitCode: "A" | "B" | "C" | "D"; boundaryLabel?: string }
): ContentDisposition[] {
  const boundaryLabel = input.boundaryLabel ?? `Unit ${input.unitCode}`;
  const records: ContentDisposition[] = [];
  for (const archivePath of source.unreferencedUnitHtmlPaths) {
    records.push({
      sourceId: source.resource.id,
      itemId: `archive:${archivePath}`,
      title: path.posix.basename(archivePath),
      pathTitles: [archivePath],
      visibleInSource: false,
      disposition: "excluded-unrelated",
      reason: `The file is inside the ${boundaryLabel} archive folder but is not referenced by the ${boundaryLabel} manifest sequence.`
    });
  }
  for (const root of source.roots) {
    if (root.identifier === source.unitRoot.identifier) continue;
    records.push({
      sourceId: source.resource.id,
      itemId: root.identifier,
      title: root.title,
      pathTitles: root.pathTitles,
      visibleInSource: root.visible,
      disposition: "excluded-outside-unit",
      reason: `The production contract is restricted to ${boundaryLabel}; other top-level course areas remain in the preserved ZIP only.`
    });
  }
  for (const item of source.items) {
    if (isHiddenInstructionalNotesReplacement(item, input.unitCode)) {
      records.push({
        sourceId: source.resource.id,
        itemId: item.identifier,
        title: item.title,
        pathTitles: item.pathTitles,
        visibleInSource: item.visible,
        disposition: "transformed-local-replacement",
        reason:
          `The complete local ${boundaryLabel} notes verifiably replace the same visible linked instruction and are used as the required local-first source.`
      });
      continue;
    }
    if (isTeacherAssessmentTitle(item.title, input.unitCode)) {
      records.push({
        sourceId: source.resource.id,
        itemId: item.identifier,
        title: item.title,
        pathTitles: item.pathTitles,
        visibleInSource: item.visible,
        disposition: "excluded-teacher-assessment",
        reason: "Unit tests and exams are outside the learner-practice comparison boundary."
      });
      continue;
    }
    if (isExcludedQuizMaterial(item.title)) {
      records.push({
        sourceId: source.resource.id,
        itemId: item.identifier,
        title: item.title,
        pathTitles: item.pathTitles,
        visibleInSource: item.visible,
        disposition: "excluded-assessment-material",
        reason: "Printable quiz copies and quiz keys are explicitly excluded even when retained in the source archive."
      });
      continue;
    }
    if (!item.visible) {
      records.push({
        sourceId: source.resource.id,
        itemId: item.identifier,
        title: item.title,
        pathTitles: item.pathTitles,
        visibleInSource: false,
        disposition: "excluded-hidden",
        reason: "Hidden source content is excluded unless it is the verified local notes replacement."
      });
      continue;
    }
    if (/quizzing\.quiz/i.test(item.resourceTypeKey ?? "")) {
      records.push({
        sourceId: source.resource.id,
        itemId: item.identifier,
        title: item.title,
        pathTitles: item.pathTitles,
        visibleInSource: true,
        disposition: "transformed-practice",
        reason: "The visible chapter quiz is converted completely into non-graded, repeatable local practice."
      });
      continue;
    }
    if (isLearnerVisibleAnswer(item)) {
      records.push({
        sourceId: source.resource.id,
        itemId: item.identifier,
        title: item.title,
        pathTitles: item.pathTitles,
        visibleInSource: true,
        disposition: "included-check-your-work",
        reason: "The answer resource is learner-visible in the source and is retained as check-your-work support."
      });
      continue;
    }
    records.push({
      sourceId: source.resource.id,
      itemId: item.identifier,
      title: item.title,
      pathTitles: item.pathTitles,
      visibleInSource: true,
      disposition: "included",
      reason: `Learner-visible ${boundaryLabel} instruction is inside the approved production boundary.`
    });
  }
  return records;
}

export function classifyBiologySourceDisposition(source: BiologySourceModel): ContentDisposition[] {
  return classifyBiologyUnitSourceDisposition(source, {
    unitCode: "A",
    boundaryLabel: "Unit A"
  });
}

export function buildBiologySourceMap(source: BiologySourceModel, contract: ScienceComparisonContractV1) {
  const serializeItem = (item: D2lItem): unknown => ({
    identifier: item.identifier,
    title: item.title,
    visible: item.visible,
    explicitlyHidden: item.explicitlyHidden,
    descriptionPresent: Boolean(item.descriptionHtml.trim()),
    resource: item.resource
      ? {
          identifier: item.resource.identifier,
          href: item.resource.href,
          type: item.resource.type,
          materialType: item.resource.materialType,
          resourceCode: item.resource.resourceCode
        }
      : null,
    children: item.children.map(serializeItem)
  });
  return {
    schemaVersion: 1,
    source: {
      id: source.resource.id,
      label: source.resource.label,
      role: source.resource.role,
      path: source.resource.path,
      sha256: source.resource.sha256,
      originalName: source.resource.originalName,
      manifestTitle: source.manifestTitle,
      manifestIdentifier: source.manifestIdentifier,
      manifestPath: source.manifestPath
    },
    unitBoundary: contract.unitBoundary,
    unitRoot: serializeItem(source.unitRoot),
    utf16Html: {
      detected: source.utf16HtmlPaths.length > 0,
      count: source.utf16HtmlPaths.length,
      paths: source.utf16HtmlPaths,
      unreferencedUnitHtmlPaths: source.unreferencedUnitHtmlPaths
    },
    visibleChapterQuizzes: source.quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      sourceItemId: quiz.sourceItemId,
      sourceXmlPath: quiz.sourceXmlPath,
      questionCount: quiz.questions.length,
      questionTypes: quiz.questions.reduce<Record<string, number>>((counts, question) => {
        counts[question.type] = (counts[question.type] ?? 0) + 1;
        return counts;
      }, {}),
      originalSettingsDiscardedForPractice: quiz.originalSettings
    }))
  };
}
