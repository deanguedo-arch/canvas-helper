import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import JSZip from "jszip";
import mammoth from "mammoth";

import { extractPdfTextWithFallback, type PdfTextPage } from "../pdf-text.js";
import type { EnglishActivityQuestionSet } from "./activity-profile-renderers.js";
import { normalizeZipPath, parseNumberedQuestions, safeFileName, safeId } from "./source.js";
import type {
  EnglishBuildReportItem,
  EnglishResourceDispositionV2,
  EnglishUnitRecipeV2
} from "./types.js";

const FORBIDDEN_SOURCE_PATTERN = /(?:hard[ _-]*gate|soft[ _-]*gate|answer\s*key|answers?\s+rc|\bmath\b)/i;

export type EnglishPreparedResource = {
  id: string;
  title: string;
  role: EnglishResourceDispositionV2["role"];
  source: string;
  href?: string;
  extractionMethod?: "native" | "ocr" | "docx";
  text?: string;
  pages?: PdfTextPage[];
  reviewRequired: boolean;
};

function assertSafeWorkspaceHref(value: string) {
  const normalized = normalizeZipPath(value).replace(/^\/+/, "");
  if (!normalized || normalized.startsWith("../") || normalized.includes("/../")) {
    throw new Error(`Unsafe English resource destination: ${value}`);
  }
  return normalized;
}

function normalizeResourceTitle(disposition: EnglishResourceDispositionV2) {
  return disposition.title?.trim() || path.posix.basename(normalizeZipPath(disposition.source));
}

function findZipEntry(zip: JSZip, source: string) {
  const normalized = normalizeZipPath(source);
  const exact = zip.file(normalized) ?? zip.file(source);
  if (exact) return { entry: exact, path: normalized };
  const candidates = Object.keys(zip.files).filter((entryPath) => {
    const candidate = normalizeZipPath(entryPath);
    return candidate === normalized || candidate.endsWith(`/${normalized}`) || path.posix.basename(candidate) === path.posix.basename(normalized);
  });
  if (candidates.length !== 1) {
    throw new Error(
      candidates.length
        ? `Teacher resource is ambiguous (${source}): ${candidates.join(", ")}`
        : `Teacher resource is missing: ${source}`
    );
  }
  const entryPath = candidates[0];
  const entry = zip.file(entryPath);
  if (!entry) throw new Error(`Teacher resource is missing: ${source}`);
  return { entry, path: normalizeZipPath(entryPath) };
}

async function extractText(input: { filePath: string; buffer: Buffer; source: string }) {
  const extension = path.extname(input.source).toLowerCase();
  if (extension === ".pdf") {
    const forceOcr = /macbeth\s+act\s+questions/i.test(input.source);
    const result = await extractPdfTextWithFallback(input.filePath, { forceOcr });
    return {
      method: result.method ?? undefined,
      text: result.text ?? undefined,
      pages: result.pages,
      issue: result.issue
    };
  }
  if (extension === ".docx") {
    const result = await mammoth.extractRawText({ buffer: input.buffer });
    return { method: "docx" as const, text: result.value.replace(/\r/g, "").trim(), pages: [], issue: null };
  }
  return { method: undefined, text: undefined, pages: [], issue: null };
}

/**
 * Copies only recipe-approved teacher resources into a generated workspace area.
 * Excluded material is reported but never written to learner-facing storage.
 */
export async function prepareEnglishFactoryResources(input: {
  recipe: EnglishUnitRecipeV2;
  teacherZip: JSZip;
  workspaceDir: string;
  resourceDir: string;
  reportItems: EnglishBuildReportItem[];
}) {
  const prepared: EnglishPreparedResource[] = [];
  const destinations = new Set<string>();

  for (const disposition of input.recipe.resourceDispositions) {
    const title = normalizeResourceTitle(disposition);
    const sourceIsVirtual = disposition.source.startsWith("profile://");
    const forbidden = FORBIDDEN_SOURCE_PATTERN.test(disposition.source) || FORBIDDEN_SOURCE_PATTERN.test(title);
    if (disposition.disposition === "exclude" || forbidden) {
      input.reportItems.push({
        role: disposition.role === "excluded-assessment" ? disposition.role : "excluded-assessment",
        source: disposition.source,
        status: "excluded",
        note: forbidden
          ? "Excluded by the factory safety policy for gates, answer keys, or unrelated Math content."
          : disposition.reason
      });
      continue;
    }

    if (sourceIsVirtual) {
      prepared.push({
        id: disposition.id,
        title,
        role: disposition.role,
        source: disposition.source,
        reviewRequired: disposition.disposition === "review-required"
      });
      input.reportItems.push({
        role: disposition.role,
        source: disposition.source,
        status: "placed",
        destination: "Activity profile",
        note: disposition.reason
      });
      continue;
    }

    if (disposition.disposition === "review-required" && /^\(not supplied\)/i.test(disposition.source)) {
      prepared.push({ id: disposition.id, title, role: disposition.role, source: disposition.source, reviewRequired: true });
      input.reportItems.push({
        role: disposition.role,
        source: disposition.source,
        status: "missing",
        note: disposition.reason
      });
      continue;
    }

    let located: ReturnType<typeof findZipEntry>;
    try {
      located = findZipEntry(input.teacherZip, disposition.source);
    } catch (error) {
      input.reportItems.push({
        role: disposition.role,
        source: disposition.source,
        status: "missing",
        note: error instanceof Error ? error.message : "Teacher resource could not be located."
      });
      continue;
    }
    const buffer = await located.entry.async("nodebuffer");
    const defaultHref = `assets/generated/resources/${safeId(disposition.id)}-${safeFileName(located.path)}`;
    const configuredHref = disposition.destination && /^(?:assets|resources)\//.test(normalizeZipPath(disposition.destination))
      ? disposition.destination
      : defaultHref;
    const href = assertSafeWorkspaceHref(configuredHref);
    if (destinations.has(href)) throw new Error(`Duplicate English resource destination: ${href}`);
    destinations.add(href);

    const workspacePath = path.join(input.workspaceDir, href);
    const canonicalPath = path.join(input.resourceDir, "teacher", located.path);
    await mkdir(path.dirname(canonicalPath), { recursive: true });
    await writeFile(canonicalPath, buffer);
    if (disposition.disposition === "place") {
      await mkdir(path.dirname(workspacePath), { recursive: true });
      await writeFile(workspacePath, buffer);
    }

    const extracted = disposition.disposition === "place"
      ? await extractText({ filePath: canonicalPath, buffer, source: located.path })
      : { method: undefined, text: undefined, pages: [] as PdfTextPage[], issue: null };
    const extractedBase = path.join(input.resourceDir, "_extracted", safeId(disposition.id));
    await mkdir(path.dirname(extractedBase), { recursive: true });
    if (typeof extracted.text === "string") await writeFile(`${extractedBase}.txt`, `${extracted.text}\n`, "utf8");
    if (extracted.pages.length) await writeFile(`${extractedBase}.pages.json`, `${JSON.stringify(extracted.pages, null, 2)}\n`, "utf8");

    prepared.push({
      id: disposition.id,
      title,
      role: disposition.role,
      source: located.path,
      href: disposition.disposition === "place" ? href : undefined,
      extractionMethod: extracted.method,
      text: extracted.text,
      pages: extracted.pages,
      reviewRequired: disposition.disposition === "review-required"
    });
    input.reportItems.push({
      role: disposition.role,
      source: located.path,
      status: "placed",
      destination: disposition.disposition === "place" ? href : "Canonical resource library only",
      note: extracted.issue
        ? `${disposition.reason} The original remains available; extraction reported: ${extracted.issue}`
        : disposition.disposition === "review-required"
          ? `${disposition.reason} Retained with a review-required status.`
          : disposition.reason
    });
  }

  return prepared;
}

function cleanQuestionParagraph(value: string) {
  return value
    .replace(/^\s*\d+[.)]?\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function promptsFromPage(page: PdfTextPage) {
  const withoutHeader = page.text
    .replace(/^\s*Macbeth[^\n]*\n?/i, "")
    .replace(/^\s*William Shakespeare\s*$/gim, "")
    .replace(/^\s*\d+[.)]?\s*$/gm, "")
    .trim();
  const paragraphs = withoutHeader
    .split(/\n\s*\n+/)
    .map(cleanQuestionParagraph)
    .filter((value) => value.length > 24);
  return paragraphs.length ? paragraphs : [cleanQuestionParagraph(withoutHeader)].filter(Boolean);
}

const MACBETH_SELECTED_SCENES = [
  "1.1", "1.3", "1.4", "1.5", "1.7",
  "2.1", "2.2", "2.3", "2.4",
  "3.1", "3.4", "3.5",
  "4.1", "4.2",
  "5.1", "5.2", "5.3", "5.5", "5.6", "5.8"
] as const;

export function buildMacbethActQuestionSets(resource: EnglishPreparedResource): EnglishActivityQuestionSet[] {
  const pages = resource.pages ?? [];
  if (pages.length !== MACBETH_SELECTED_SCENES.length) {
    throw new Error(`Macbeth Act Questions must contain 20 mapped pages; found ${pages.length}.`);
  }
  const byAct = new Map<number, EnglishActivityQuestionSet>();
  pages.forEach((page, pageIndex) => {
    const locator = MACBETH_SELECTED_SCENES[pageIndex];
    const [actValue, sceneValue] = locator.split(".");
    const act = Number(actValue);
    const scene = Number(sceneValue);
    const set = byAct.get(act) ?? {
      id: `act-${act}`,
      title: `Act ${act}`,
      subtitle: "Teacher-supplied scene questions",
      locator: `Act ${act}`,
      questions: []
    };
    promptsFromPage(page).forEach((prompt, promptIndex) => {
      set.questions.push({
        id: `scene-${scene}-question-${promptIndex + 1}`,
        label: `Act ${act}, Scene ${scene} - Question ${promptIndex + 1}`,
        prompt: `Act ${act}, Scene ${scene}: ${prompt}`,
        hint: "Return to the scene and use one precise line, stage choice, or recurring image in your response.",
        rows: 6
      });
    });
    byAct.set(act, set);
  });
  return [...byAct.values()];
}

function fallbackNumberedQuestions(text: string) {
  const parsed = parseNumberedQuestions(text);
  if (parsed.length) return parsed.map((question) => question.prompt);
  return text
    .replace(/\r/g, "")
    .split(/\n\s*\n+/)
    .map(cleanQuestionParagraph)
    .filter((value) => value.length > 24 && /[?.!]$/.test(value));
}

export function buildCrucibleActQuestionSets(resources: EnglishPreparedResource[]): EnglishActivityQuestionSet[] {
  return resources
    .filter((resource) => /crucible\s+act\s+[1-4]/i.test(`${resource.title} ${resource.source}`))
    .map((resource) => {
      const match = `${resource.title} ${resource.source}`.match(/act\s+([1-4])/i);
      const act = Number(match?.[1] ?? 0);
      const prompts = fallbackNumberedQuestions(resource.text ?? "");
      if (!act || !prompts.length) throw new Error(`Could not extract Crucible Act questions from ${resource.source}.`);
      return {
        id: `act-${act}`,
        title: `Act ${act}`,
        subtitle: "Teacher-supplied act questions",
        locator: `Act ${act}`,
        questions: prompts.map((prompt, index) => ({
          id: `question-${index + 1}`,
          label: `Act ${act} Question ${index + 1}`,
          prompt,
          hint: "Use a precise event, relationship, accusation, or quotation from this act.",
          rows: 6
        }))
      } satisfies EnglishActivityQuestionSet;
    })
    .sort((left, right) => Number(left.id.replace("act-", "")) - Number(right.id.replace("act-", "")));
}

export const englishFactoryResourceInternals = {
  FORBIDDEN_SOURCE_PATTERN,
  MACBETH_SELECTED_SCENES,
  promptsFromPage
};
