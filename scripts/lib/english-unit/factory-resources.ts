import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import JSZip from "jszip";
import mammoth from "mammoth";

import { extractPdfTextWithFallback, type PdfTextPage } from "../pdf-text.js";
import type { EnglishActivityQuestionSet } from "./activity-profile-renderers.js";
import { normalizeZipPath, parseNumberedQuestions, safeFileName, safeId } from "./source.js";
import type {
  EnglishBuildReportItem,
  EnglishResourceDispositionV2,
  EnglishSourcePageRangeV1,
  EnglishUnitRecipeV2,
  EnglishUnitRecipeV3
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

async function resolveSupplementalSource(resourceDir: string, source: string) {
  const relativePath = normalizeZipPath(source.slice("supplemental://".length)).replace(/^\/+/, "");
  if (!relativePath || relativePath.startsWith("../") || relativePath.includes("/../")) {
    throw new Error(`Unsafe supplemental English resource source: ${source}`);
  }
  const supplementalRoot = path.resolve(resourceDir, "_sources", "supplemental");
  const filePath = path.resolve(supplementalRoot, relativePath);
  if (filePath !== supplementalRoot && !filePath.startsWith(`${supplementalRoot}${path.sep}`)) {
    throw new Error(`Supplemental English resource escaped its canonical source root: ${source}`);
  }
  try {
    if (!(await stat(filePath)).isFile()) throw new Error("not a file");
  } catch {
    throw new Error(`Supplemental English resource is missing: ${source}`);
  }
  return { filePath, relativePath };
}

async function resolveProjectWorkspaceSource(repoRoot: string, source: string) {
  const reference = normalizeZipPath(source.slice("project-workspace://".length)).replace(/^\/+/, "");
  const separator = reference.indexOf("/");
  const projectSlug = separator > 0 ? reference.slice(0, separator) : "";
  const relativePath = separator > 0 ? reference.slice(separator + 1) : "";
  if (!projectSlug || !relativePath || relativePath.startsWith("../") || relativePath.includes("/../")) {
    throw new Error(`Unsafe project-workspace English resource source: ${source}`);
  }
  const workspaceRoot = path.resolve(repoRoot, "projects", projectSlug, "workspace");
  const filePath = path.resolve(workspaceRoot, relativePath);
  if (!filePath.startsWith(`${workspaceRoot}${path.sep}`)) {
    throw new Error(`Project-workspace English resource escaped its canonical source root: ${source}`);
  }
  try {
    if (!(await stat(filePath)).isFile()) throw new Error("not a file");
  } catch {
    throw new Error(`Project-workspace English resource is missing: ${source}`);
  }
  return { filePath, relativePath };
}

async function extractText(input: {
  filePath: string;
  buffer: Buffer;
  source: string;
  ocrPageSegmentationMode?: number;
}) {
  const extension = path.extname(input.source).toLowerCase();
  if (extension === ".pdf") {
    const forceOcr = /macbeth\s+act\s+questions/i.test(input.source);
    const result = await extractPdfTextWithFallback(input.filePath, {
      forceOcr,
      ocrPageSegmentationMode: input.ocrPageSegmentationMode
    });
    return {
      method: result.method ?? undefined,
      text: result.text ?? undefined,
      pages: result.pages,
      pageCount: result.pageCount,
      issue: result.issue
    };
  }
  if (extension === ".docx") {
    const result = await mammoth.extractRawText({ buffer: input.buffer });
    return { method: "docx" as const, text: result.value.replace(/\r/g, "").trim(), pages: [], pageCount: 0, issue: null };
  }
  return { method: undefined, text: undefined, pages: [], pageCount: 0, issue: null };
}

function formatSourcePageRanges(ranges: readonly EnglishSourcePageRangeV1[]) {
  return ranges.map((range) => range.start === range.end ? `${range.start}` : `${range.start}-${range.end}`).join(", ");
}

function scopeExtractedPdfText(
  extracted: Awaited<ReturnType<typeof extractText>>,
  sourcePages: readonly EnglishSourcePageRangeV1[] | undefined,
  source: string
) {
  if (!sourcePages?.length) return extracted;
  if (path.extname(source).toLowerCase() !== ".pdf") {
    throw new Error(`Source page ranges require a PDF resource: ${source}`);
  }
  const requestedLastPage = Math.max(...sourcePages.map((range) => range.end));
  if (requestedLastPage > extracted.pageCount) {
    throw new Error(
      `Source page range ${formatSourcePageRanges(sourcePages)} exceeds the ${extracted.pageCount}-page PDF: ${source}`
    );
  }
  const pages = extracted.pages.filter((page) =>
    sourcePages.some((range) => page.page >= range.start && page.page <= range.end)
  );
  if (!pages.length) {
    throw new Error(`Source page range ${formatSourcePageRanges(sourcePages)} contained no extractable text: ${source}`);
  }
  return {
    ...extracted,
    text: pages.map((page) => page.text).join("\n\n").trim(),
    pages
  };
}

/**
 * Copies only recipe-approved teacher resources into a generated workspace area.
 * Excluded material is reported but never written to learner-facing storage.
 */
export async function prepareEnglishFactoryResources(input: {
  repoRoot: string;
  recipe: EnglishUnitRecipeV2 | EnglishUnitRecipeV3;
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
    const sourceIsSupplemental = disposition.source.startsWith("supplemental://");
    const sourceIsProjectWorkspace = disposition.source.startsWith("project-workspace://");
    const forbidden = FORBIDDEN_SOURCE_PATTERN.test(disposition.source) || FORBIDDEN_SOURCE_PATTERN.test(title);
    if (disposition.disposition === "exclude" || forbidden) {
      const duplicate = !forbidden && /(?:byte-identical|exact)\s+duplicate|duplicate\s+(?:copy|source|file)/i.test(disposition.reason);
      input.reportItems.push({
        role: disposition.role,
        source: disposition.source,
        status: duplicate ? "duplicate" : "excluded",
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

    let locatedPath: string;
    let canonicalPath: string;
    let buffer: Buffer | undefined;
    try {
      if (sourceIsSupplemental) {
        const supplemental = await resolveSupplementalSource(input.resourceDir, disposition.source);
        locatedPath = disposition.source;
        canonicalPath = supplemental.filePath;
        if (/\.(?:pdf|docx)$/i.test(supplemental.relativePath)) buffer = await readFile(supplemental.filePath);
      } else if (sourceIsProjectWorkspace) {
        const projectWorkspace = await resolveProjectWorkspaceSource(input.repoRoot, disposition.source);
        // Preserve the canonical donor reference in the recipe/report, but keep
        // donor course codes out of learner-facing runtime data.
        locatedPath = projectWorkspace.relativePath;
        canonicalPath = projectWorkspace.filePath;
        if (/\.(?:pdf|docx)$/i.test(projectWorkspace.relativePath)) buffer = await readFile(projectWorkspace.filePath);
      } else {
        const located = findZipEntry(input.teacherZip, disposition.source);
        locatedPath = located.path;
        canonicalPath = path.join(input.resourceDir, "teacher", located.path);
        buffer = await located.entry.async("nodebuffer");
        await mkdir(path.dirname(canonicalPath), { recursive: true });
        await writeFile(canonicalPath, buffer);
      }
    } catch (error) {
      input.reportItems.push({
        role: disposition.role,
        source: disposition.source,
        status: "missing",
        note: error instanceof Error ? error.message : "Teacher resource could not be located."
      });
      continue;
    }
    const defaultHref = `assets/generated/resources/${safeId(disposition.id)}-${safeFileName(locatedPath)}`;
    const configuredHref = disposition.destination && /^(?:assets|resources)\//.test(normalizeZipPath(disposition.destination))
      ? disposition.destination
      : defaultHref;
    const href = assertSafeWorkspaceHref(configuredHref);
    if (destinations.has(href)) throw new Error(`Duplicate English resource destination: ${href}`);
    destinations.add(href);

    const workspacePath = path.join(input.workspaceDir, href);
    if (disposition.disposition === "place") {
      await mkdir(path.dirname(workspacePath), { recursive: true });
      if (sourceIsSupplemental || sourceIsProjectWorkspace) await copyFile(canonicalPath, workspacePath);
      else await writeFile(workspacePath, buffer!);
    }

    const rawExtracted = disposition.disposition === "place" || disposition.disposition === "source-only"
      ? await extractText({
        filePath: canonicalPath,
        buffer: buffer ?? Buffer.alloc(0),
        source: locatedPath,
        ocrPageSegmentationMode:
          input.recipe.courseCode === "ELA 10-1"
          && input.recipe.activityProfile.kind === "novel-study"
          && disposition.role === "question-set"
            ? 6
            : undefined
      })
      : { method: undefined, text: undefined, pages: [] as PdfTextPage[], pageCount: 0, issue: null };
    const extracted = scopeExtractedPdfText(rawExtracted, disposition.sourcePages, locatedPath);
    const extractedBase = path.join(input.resourceDir, "_extracted", safeId(disposition.id));
    await mkdir(path.dirname(extractedBase), { recursive: true });
    if (typeof extracted.text === "string") await writeFile(`${extractedBase}.txt`, `${extracted.text}\n`, "utf8");
    if (extracted.pages.length) await writeFile(`${extractedBase}.pages.json`, `${JSON.stringify(extracted.pages, null, 2)}\n`, "utf8");

    prepared.push({
      id: disposition.id,
      title,
      role: disposition.role,
      source: locatedPath,
      href: disposition.disposition === "place" ? href : undefined,
      extractionMethod: extracted.method,
      text: extracted.text,
      pages: extracted.pages,
      reviewRequired: disposition.disposition === "review-required"
    });
    input.reportItems.push({
      role: disposition.role,
      source: locatedPath,
      status: "placed",
      destination: disposition.disposition === "place" ? href : "Canonical resource library only",
      note: extracted.issue
        ? `${disposition.reason} The original remains available; extraction reported: ${extracted.issue}`
        : disposition.disposition === "review-required"
          ? `${disposition.reason} Retained with a review-required status.`
          : disposition.disposition === "source-only"
            ? `${disposition.reason} Retained as a non-learner-facing build source.${disposition.sourcePages ? ` Extracted PDF pages: ${formatSourcePageRanges(disposition.sourcePages)}.` : ""}`
          : disposition.reason
    });
  }

  return prepared;
}

function cleanQuestionParagraph(value: string) {
  return value
    .replace(/^\s*\d+[.)]?\s*/, "")
    .replace(/^[.\-:]+\s*/, "")
    .replace(/\bifany\b/gi, "if any")
    .replace(/\s+([?.!,;:])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function splitCompoundPrompt(value: string) {
  const cleaned = cleanQuestionParagraph(value);
  const questionCount = (cleaned.match(/\?/g) ?? []).length;
  if (cleaned.length < 280 || questionCount < 3) return cleaned ? [cleaned] : [];
  const sentences = cleaned.match(/[^?!.]+[?!.]+|[^?!.]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [cleaned];
  const chunks: string[] = [];
  let current = "";
  let currentQuestions = 0;
  for (const sentence of sentences) {
    const sentenceQuestions = (sentence.match(/\?/g) ?? []).length;
    if (current && (current.length + sentence.length > 360 || currentQuestions + sentenceQuestions > 2)) {
      chunks.push(current.trim());
      current = "";
      currentQuestions = 0;
    }
    current = `${current} ${sentence}`.trim();
    currentQuestions += sentenceQuestions;
  }
  if (current) chunks.push(current);
  return chunks.filter((chunk) => chunk.length > 24);
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
    .filter((value) => value.length > 24 && /[a-z]{3}/i.test(value));
  return (paragraphs.length ? paragraphs : [cleanQuestionParagraph(withoutHeader)].filter(Boolean))
    .flatMap(splitCompoundPrompt);
}

const MACBETH_TEACHER_SCENES = [
  "1.1", "1.3", "1.4", "1.5", "1.7",
  "2.1", "2.2", "2.3", "2.4",
  "3.1", "3.4", "3.5",
  "4.1", "4.2",
  "5.1", "5.2", "5.3", "5.5", "5.6", "5.8"
] as const;

const MACBETH_PROFILE_SCENE_QUESTIONS: Record<string, string[]> = {
  "1.2": [
    "The Captain's report presents Macbeth as both heroic and exceptionally violent. How does the battle imagery establish both qualities, and how does that description prepare the audience for Macbeth's later choices?",
    "Duncan condemns the former Thane of Cawdor and rewards Macbeth with the same title. How does this decision introduce the play's concerns with loyalty, betrayal, and appearances?"
  ],
  "1.6": [
    "Duncan and Banquo describe Inverness as welcoming and peaceful. How does their language create dramatic irony, and what does the audience understand that they do not?",
    "How should Lady Macbeth perform her welcome to Duncan so that her words appear hospitable while revealing concealment to the audience? Refer to a precise word, gesture, or staging choice."
  ],
  "3.2": [
    "Compare Macbeth and Lady Macbeth's relationship in this scene with their relationship in Act 1. Who now controls the plans, and what dialogue or behaviour shows the change?",
    "Macbeth says his mind is 'full of scorpions.' What does this image reveal about the psychological cost of kingship and the actions he is preparing to take?"
  ],
  "3.3": [
    "Why is Banquo's murder shown onstage, and why is Fleance's escape important to Macbeth's attempt to control the future?",
    "How do darkness, brief dialogue, and the murderers' movements create tension and develop the play's growing moral disorder?"
  ],
  "3.6": [
    "How does Lennox use irony to criticize Macbeth without accusing him directly? Identify the details that allow the audience to understand his real meaning.",
    "What does the news about Macduff and Malcolm change about the conflict? Explain how the scene expands the struggle from Macbeth's private crimes to Scotland's future."
  ],
  "4.3": [
    "Why does Malcolm test Macduff before trusting him? What does the test suggest about responsible leadership, loyalty, and the damage Macbeth has done to Scotland?",
    "How does Macduff's response to the murder of his family complicate ideas about masculinity, grief, and revenge, especially in the instruction to 'feel it as a man'?"
  ],
  "5.4": [
    "How does Malcolm's order to cut branches from Birnam Wood work as both a military strategy and a fulfilment of prophecy? Explain how it changes the audience's understanding of the Witches' promise.",
    "How does this short scene build momentum toward the final battle and contrast Malcolm's leadership with Macbeth's increasing isolation?"
  ],
  "5.7": [
    "Macbeth defeats Young Siward even as his position collapses. What does this moment reveal about the difference between Macbeth's physical courage and his moral or political condition?",
    "How do the rapid battle encounters and Macduff's search for Macbeth prepare the dramatic resolution? What conflict must still be settled before Scotland can recover?"
  ]
};

export function buildMacbethActQuestionSets(resource: EnglishPreparedResource): EnglishActivityQuestionSet[] {
  const pages = resource.pages ?? [];
  if (pages.length !== MACBETH_TEACHER_SCENES.length) {
    throw new Error(`Macbeth Act Questions must contain 20 mapped pages; found ${pages.length}.`);
  }
  const byAct = new Map<number, EnglishActivityQuestionSet>();
  pages.forEach((page, pageIndex) => {
    const locator = MACBETH_TEACHER_SCENES[pageIndex];
    const [actValue, sceneValue] = locator.split(".");
    const act = Number(actValue);
    const scene = Number(sceneValue);
    const set = byAct.get(act) ?? {
      id: `act-${act}`,
      title: `Act ${act}`,
      subtitle: "Scene questions",
      locator: `Act ${act}`,
      questions: []
    };
    promptsFromPage(page).forEach((prompt, promptIndex) => {
      set.questions.push({
        id: `scene-${scene}-question-${promptIndex + 1}`,
        label: `Act ${act}, Scene ${scene} - Question ${promptIndex + 1}`,
        prompt: `Act ${act}, Scene ${scene}: ${prompt}`,
        hint: "Return to the scene and use one precise line, stage choice, or recurring image in your response.",
        rows: 6,
        provenance: "teacher-supplied"
      });
    });
    byAct.set(act, set);
  });

  Object.entries(MACBETH_PROFILE_SCENE_QUESTIONS).forEach(([locator, prompts]) => {
    const [actValue, sceneValue] = locator.split(".");
    const act = Number(actValue);
    const scene = Number(sceneValue);
    const set = byAct.get(act) ?? {
      id: `act-${act}`,
      title: `Act ${act}`,
      subtitle: "Scene questions and guided analysis",
      locator: `Act ${act}`,
      questions: []
    };
    set.subtitle = "Scene questions and guided analysis";
    prompts.forEach((prompt, promptIndex) => {
      set.questions.push({
        id: `scene-${scene}-profile-question-${promptIndex + 1}`,
        label: `Act ${act}, Scene ${scene} - Guided Question ${promptIndex + 1}`,
        prompt: `Act ${act}, Scene ${scene}: ${prompt}`,
        hint: "Return to the scene and support your interpretation with a precise line, stage action, image, or contrast.",
        rows: 6,
        provenance: "profile-supplied"
      });
    });
    byAct.set(act, set);
  });

  return [...byAct.values()];
}

const MERCHANT_PRIMARY_PAGE_ACTS = [1, 2, 3, 3, 4, 5] as const;

function cleanMerchantPrompt(value: string) {
  return cleanQuestionParagraph(value)
    .replace(/\bAnionio\b/g, "Antonio")
    .replace(/\bShyleck\b/g, "Shylock")
    .replace(/\bFortia\b/g, "Portia")
    .replace(/\bEfow\b/g, "How")
    .replace(/\bof-er\b/g, "offer")
    .replace(/Portia[‘']and/g, "Portia and")
    .replace(/\s+this particular item\?/i, " this particular item?")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeMerchantSceneText(value: string, act: number, scene: number) {
  let text = value
    .replace(/\r/g, "")
    .replace(/(^|\n)\s*lL\.\s*/gi, "$11. ")
    .replace(/(^|\n)\s*L\s+(?=What)/g, "$11. ")
    .replace(/(^|\n)\s*[iIlL]\s*[,.)]\s*/g, "$11. ")
    .replace(/(^|\n)\s*(\d+)\s*,\s*/g, "$1$2. ")
    .replace(/\n\s*(?:on\)|bo|ies\))\s*\n/gi, "\n");
  if (act === 2 && scene === 2) text = text.replace(/\n\s*What favor does Gratiano/i, "\n3. What favor does Gratiano");
  if (act === 3 && scene === 3) text = text.replace(/\n\s*u\s*\n\s*Why does Antonio/i, "\n2. Why does Antonio");
  if (act === 4 && scene === 1) text = text.replace(/\n\s*How does Shylock respond/i, "\n2. How does Shylock respond");
  if (act === 5 && scene === 1) text = text.replace(/\n\s*What do Portia/i, "\n3. What do Portia");
  return text;
}

function merchantSceneQuestions(value: string, act: number) {
  const sceneMatches = [...value.matchAll(/(?:^|\n)\s*SCENE\s+(\d+)\s*\n/gi)];
  if (!sceneMatches.length) throw new Error(`Merchant of Venice Act ${act} did not contain scene headings.`);
  return sceneMatches.flatMap((match, index) => {
    const scene = Number(match[1]);
    const start = (match.index ?? 0) + match[0].length;
    const end = sceneMatches[index + 1]?.index ?? value.length;
    const sceneText = normalizeMerchantSceneText(value.slice(start, end), act, scene);
    return parseNumberedQuestions(sceneText).map((question, questionIndex) => ({
      id: `scene-${scene}-question-${questionIndex + 1}`,
      label: `Act ${act}, Scene ${scene} - Question ${questionIndex + 1}`,
      prompt: `Act ${act}, Scene ${scene}: ${cleanMerchantPrompt(question.prompt)}`,
      hint: "Return to the scene and support your response with a precise line, action, contrast, or dramatic choice.",
      rows: 6,
      provenance: "teacher-supplied" as const,
      section: `Act ${act}, Scene ${scene}`
    }));
  });
}

function supplementalMerchantQuestion(input: { act: number; scene: number; id: string; prompt: string; section: string }) {
  return {
    id: input.id,
    label: `Act ${input.act}, Scene ${input.scene} - ${input.section}`,
    prompt: `Act ${input.act}, Scene ${input.scene}: ${input.prompt}`,
    hint: "Return to the scene and support your response with a precise line, action, contrast, or dramatic choice.",
    rows: 6,
    provenance: "teacher-supplied" as const,
    section: input.section
  };
}

const MERCHANT_SUPPLEMENTAL_QUESTIONS = [
  { act: 2, scene: 7, id: "scene-7-quotation-gold", section: "Act 2 Quotation Analysis", prompt: "For the quotation ‘All that glitters is not gold,’ identify the speaker, situation, and significance." },
  { act: 2, scene: 5, id: "scene-5-quotation-farewell", section: "Act 2 Quotation Analysis", prompt: "For the quotation ‘Farewell, and if my fortune not be crossed, I have a father, you a daughter, lost,’ identify the speaker, situation, and significance." },
  { act: 2, scene: 5, id: "scene-5-quotation-dream", section: "Act 2 Quotation Analysis", prompt: "For the quotation ‘I am right loath to go. There is some ill a-brewing towards my rest, for I did dream of money bags tonight,’ identify the speaker, situation, and significance." },
  { act: 2, scene: 2, id: "scene-2-quotation-famished", section: "Act 2 Quotation Analysis", prompt: "For the quotation ‘I am famished in his service; you may tell every finger I have with my ribs,’ identify the speaker, situation, and significance." },
  { act: 2, scene: 5, id: "scene-5-quotation-window", section: "Act 2 Quotation Analysis", prompt: "For the quotation ‘Mistress, look out at window, for all this; there will come a Christian by will be worth a Jewess’ eye,’ identify the speaker, situation, and significance." },
  { act: 2, scene: 6, id: "scene-6-quotation-wise", section: "Act 2 Quotation Analysis", prompt: "For the quotation ‘For she is wise, if I can judge her, and fair she is, if that mine eyes be true, and true she is, as she hath proved herself,’ identify the speaker, situation, and significance." },
  { act: 2, scene: 7, id: "scene-7-morocco-gold", section: "Act 2 Quiz", prompt: "Why does Morocco choose the gold casket? What does the message inside say?" },
  { act: 2, scene: 8, id: "scene-8-rialto-rumour", section: "Act 2 Quiz", prompt: "What is the rumour on the Rialto?" },
  { act: 2, scene: 9, id: "scene-9-arragon-silver", section: "Act 2 Quiz", prompt: "Why does Arragon choose the silver casket?" },
  { act: 3, scene: 2, id: "scene-2-inscription", section: "Act 3 Worksheet", prompt: "Why is the inscription inside the lead casket appropriate for Bassanio?" },
  { act: 3, scene: 2, id: "scene-2-antonio-letter-purpose", section: "Act 3 Worksheet", prompt: "What is Antonio trying to accomplish by writing the letter to Bassanio?" },
  { act: 3, scene: 3, id: "scene-3-dialogue-function", section: "Act 3 Worksheet", prompt: "What is the dramatic function of the dialogue between Antonio and Shylock?" },
  { act: 3, scene: 4, id: "scene-4-balthazar", section: "Act 3 Worksheet", prompt: "Why are Portia and Nerissa leaving Belmont, and what does Portia ask Balthazar to do?" },
  { act: 4, scene: 1, id: "scene-1-first-question", section: "Act 4 Trial Worksheet", prompt: "What is significant about Portia's first question in lines 172–177? How could the line express a central message of the play?" },
  { act: 4, scene: 1, id: "scene-1-mercy-speech", section: "Act 4 Trial Worksheet", prompt: "What is Portia's first judgment about the bond? In the ‘quality of mercy’ speech, why does she argue that Shylock should be merciful, and why does he reject that appeal?" },
  { act: 4, scene: 1, id: "scene-1-penalty-mercy", section: "Act 4 Trial Worksheet", prompt: "What penalty does the Duke decree, what additional ‘mercy’ does Antonio impose, and who can be considered the victor?" },
  { act: 4, scene: 2, id: "scene-2-unresolved-problems", section: "Act 4 Trial Worksheet", prompt: "What problems remain to be resolved in Act 5?" },
  { act: 5, scene: 1, id: "scene-1-tone-rings", section: "Act 5 Worksheet", prompt: "How does the tone change when Bassanio and the others arrive from Venice, and how is the ring argument finally resolved?" },
  { act: 5, scene: 1, id: "scene-1-ending-joke", section: "Act 5 Worksheet", prompt: "What is the effect of ending the play with Gratiano's sexual joke? How does that ending fit the play's social and comic conventions?" }
] as const;

export function buildMerchantActQuestionSets(resources: EnglishPreparedResource[]): EnglishActivityQuestionSet[] {
  const primary = resources.find((resource) => resource.id === "mov-act-questions");
  if (!primary?.pages || primary.pages.length !== MERCHANT_PRIMARY_PAGE_ACTS.length) {
    throw new Error(`Merchant of Venice Act Questions must contain six mapped pages; found ${primary?.pages?.length ?? 0}.`);
  }
  const pagesByAct = new Map<number, string[]>();
  primary.pages.forEach((page, index) => {
    const act = MERCHANT_PRIMARY_PAGE_ACTS[index]!;
    const pages = pagesByAct.get(act) ?? [];
    pages.push(page.text);
    pagesByAct.set(act, pages);
  });
  const expectedPrimaryCounts = new Map([[1, 18], [2, 11], [3, 20], [4, 13], [5, 5]]);
  const sets = Array.from({ length: 5 }, (_value, index) => {
    const act = index + 1;
    let actText = (pagesByAct.get(act) ?? []).join("\n");
    if (act === 3 || act === 4) actText = `SCENE 1\n${actText}`;
    const questions = merchantSceneQuestions(actText, act);
    const expected = expectedPrimaryCounts.get(act);
    if (questions.length !== expected) throw new Error(`Merchant of Venice Act ${act} primary worksheet expected ${expected} questions; parsed ${questions.length}.`);
    questions.push(...MERCHANT_SUPPLEMENTAL_QUESTIONS.filter((question) => question.act === act).map(supplementalMerchantQuestion));
    return {
      id: `act-${act}`,
      title: `Act ${act} Questions`,
      subtitle: "Scene questions",
      intro: `Complete the questions for Act ${act}. Each response saves automatically; save the complete act collection to the Evidence Bank when it is useful for later writing.`,
      locator: `Act ${act}`,
      questions
    } satisfies EnglishActivityQuestionSet;
  });
  if (sets.reduce((total, set) => total + set.questions.length, 0) !== 86) {
    throw new Error("Merchant of Venice question coverage must contain 86 unique teacher-supplied prompts.");
  }
  return sets;
}

function fallbackNumberedQuestions(text: string) {
  const parsed = parseNumberedQuestions(text);
  if (parsed.length) return parsed.flatMap((question) => splitCompoundPrompt(question.prompt));
  return text
    .replace(/\r/g, "")
    .split(/\n\s*\n+/)
    .map(cleanQuestionParagraph)
    .filter((value) => value.length > 24 && /[?.!]$/.test(value))
    .flatMap(splitCompoundPrompt);
}

const CRUCIBLE_ACT_WORDS = new Map([
  ["one", 1],
  ["two", 2],
  ["three", 3],
  ["four", 4]
]);

const CRUCIBLE_OMITTED_TEACHER_PROMPTS: Record<number, RegExp[]> = {
  2: [/^The theme of human cruelty versus righteousness is particularly important in this act\./i]
};

const CRUCIBLE_OMITTED_TEACHER_IDS = new Set([
  "2:question-8",
  "3:question-8"
]);

const CRUCIBLE_TEACHER_PROMPT_REWRITES = new Map([
  [
    "4:question-6",
    "Choose Danforth, Parris, Elizabeth Proctor, or John Proctor. Write a journal entry from that character’s perspective that explains the character’s actions and motivations in Act Four."
  ]
]);

function omitCrucibleTeacherPrompt(act: number, id: string, prompt: string) {
  return CRUCIBLE_OMITTED_TEACHER_IDS.has(`${act}:${id}`)
    || (CRUCIBLE_OMITTED_TEACHER_PROMPTS[act] ?? []).some((pattern) => pattern.test(prompt));
}

function rewriteCrucibleTeacherPrompt(act: number, id: string, prompt: string) {
  return CRUCIBLE_TEACHER_PROMPT_REWRITES.get(`${act}:${id}`) ?? prompt;
}

function extractCrucibleGuideQuestions(text: string) {
  const byAct = new Map<number, string[]>();
  const normalized = text.replace(/\r/g, "");
  const pattern = /(?:^|\n)Act\s+(One|Two|Three|Four)\s*\n([\s\S]*?)(?=\nAct\s+(?:One|Two|Three|Four)\s*\n|\n~+|\nEnd of|$)/gi;
  for (const match of normalized.matchAll(pattern)) {
    const act = CRUCIBLE_ACT_WORDS.get(match[1].toLowerCase());
    const actText = (match[2] ?? "").replace(/(^|\n)\s*\*(\d+[.)]?)/g, "$1$2");
    const prompts = fallbackNumberedQuestions(actText);
    if (act && prompts.length) byAct.set(act, prompts);
  }
  return byAct;
}

export function buildCrucibleActQuestionSets(resources: EnglishPreparedResource[]): EnglishActivityQuestionSet[] {
  const sets = resources
    .filter((resource) => /^crucible-act-[1-4]$/.test(resource.id) || /crucible\s+act\s+[1-4]/i.test(`${resource.title} ${resource.source}`))
    .map((resource) => {
      const match = `${resource.title} ${resource.source}`.match(/act\s+([1-4])/i);
      const act = Number(match?.[1] ?? 0);
      const prompts = fallbackNumberedQuestions(resource.text ?? "");
      if (!act || !prompts.length) throw new Error(`Could not extract Crucible Act questions from ${resource.source}.`);
      return {
        id: `act-${act}`,
        title: `Act ${act}`,
        subtitle: "Teacher Act Worksheet and Next Step Unit Guide questions",
        locator: `Act ${act}`,
        questions: prompts
          .map((prompt, index) => ({
            id: `question-${index + 1}`,
            label: `Act ${act} Question ${index + 1}`,
            prompt: rewriteCrucibleTeacherPrompt(act, `question-${index + 1}`, prompt),
            hint: "Use a precise event, relationship, accusation, or quotation from this act.",
            rows: 6,
            provenance: "teacher-supplied" as const,
            section: "Teacher Act Worksheet"
          }))
          .filter((question) => !omitCrucibleTeacherPrompt(act, question.id, question.prompt))
      } satisfies EnglishActivityQuestionSet;
    })
    .sort((left, right) => Number(left.id.replace("act-", "")) - Number(right.id.replace("act-", "")));

  const guide = resources.find((resource) => resource.id === "crucible-next-step-unit-guide-docx");
  if (!guide?.text) return sets;
  const guideQuestions = extractCrucibleGuideQuestions(guide.text);
  for (const set of sets) {
    const act = Number(set.id.replace("act-", ""));
    for (const [index, prompt] of (guideQuestions.get(act) ?? []).entries()) {
      set.questions.push({
        id: `next-step-unit-guide-question-${index + 1}`,
        label: `Act ${act} Unit Guide Question ${index + 1}`,
        prompt,
        hint: "Return to the act and support the response with the specific quotation requested when the question is marked with an asterisk.",
        rows: 6,
        provenance: "teacher-supplied",
        section: "Next Step Unit Guide"
      });
    }
  }
  return sets;
}

const DRACULA_ACT_QUESTION_PAGES = [
  { act: 1, page: 18, expectedQuestions: 4 },
  { act: 2, page: 19, expectedQuestions: 5 },
  { act: 3, page: 20, expectedQuestions: 3 }
] as const;

function cleanDraculaPrompt(value: string) {
  const cleaned = cleanQuestionParagraph(value)
    .replace(/\bbee nhowling\b/gi, "been howling")
    .replace(/\s*\^\s*Explain\b/g, " Explain")
    .trim();
  return /[?.!]$/.test(cleaned) ? cleaned : `${cleaned}.`;
}

/**
 * Maps the clean, unanswered act-question pages in the inventoried Dracula
 * assignment packet. Original PDF page numbers are intentional provenance;
 * answered duplicates and unit-test pages must not be substituted here.
 */
export function buildDraculaActQuestionSets(resource: EnglishPreparedResource): EnglishActivityQuestionSet[] {
  const pages = resource.pages ?? [];
  return DRACULA_ACT_QUESTION_PAGES.map(({ act, page, expectedQuestions }) => {
    const sourcePage = pages.find((candidate) => candidate.page === page);
    if (!sourcePage) throw new Error(`Dracula Act ${act} questions require source PDF page ${page}.`);
    const prompts = parseNumberedQuestions(sourcePage.text).map((question) => cleanDraculaPrompt(question.prompt));
    if (prompts.length !== expectedQuestions) {
      throw new Error(
        `Dracula Act ${act} source page ${page} expected ${expectedQuestions} questions; parsed ${prompts.length}.`
      );
    }
    return {
      id: `act-${act}`,
      title: `Act ${act} Questions`,
      subtitle: "Teacher Act Worksheet",
      intro: `Complete the ${expectedQuestions} questions for Act ${act}. Save the complete act collection to the Evidence Bank when it will support later writing.`,
      locator: `Act ${act}`,
      questions: prompts.map((prompt, index) => ({
        id: `question-${index + 1}`,
        label: `Act ${act} Question ${index + 1}`,
        prompt,
        hint: "Return to the act and support your response with a precise event, stage action, or line from the play.",
        rows: 6,
        provenance: "teacher-supplied" as const,
        section: "Teacher Act Worksheet"
      }))
    } satisfies EnglishActivityQuestionSet;
  });
}

export function buildQuestionSetsFromResources(
  resources: EnglishPreparedResource[],
  options: {
    idPrefix: string;
    titlePrefix: string;
    hint: string;
    preserveNumberedItems?: boolean;
    normalizeSharedQuotationDirections?: boolean;
  }
): EnglishActivityQuestionSet[] {
  const sources = resources.filter((resource) => resource.role === "question-set" && resource.text?.trim());
  const sets = sources.map((resource, resourceIndex) => {
    let prompts = options.preserveNumberedItems && resource.pages?.length
      ? resource.pages.flatMap((page) => {
        const withoutVocabulary = (page.text.split(/\n\s*(?:To Kill a Mockingbird\s*)?Vocabulary\b/i)[0] ?? page.text)
          .replace(/(^|\n)\s*(\d+)\s*[,)]\s*/g, "$1$2. ")
          .replace(/(^|\n)\s*(\d+)\.\s*/g, "$1$2. ");
        return parseNumberedQuestions(withoutVocabulary).map((question) => cleanQuestionParagraph(question.prompt)
          .replace(/\bisa\b/gi, "is a")
          .replace(/\bthe Cunningham are\b/gi, "the Cunninghams are")
          .replace(/\s+(?:CHAPTER|CUAPTER)\s+\d+\s*\([^)]*\)?\s*$/i, "")
          .replace(/\s+(?:[a-z]\s+)?["“]?Teaching MOCKINGBIRD(?:\s+\d+)?\s*$/i, "")
          .replace(/\s+\d+\s+SECTION\s+\d+\s*\|[\s\S]*$/i, "")
          .replace(/\s+(?:[|~]\s*|ps\s*\d+\)?\s*)Connection Questions\s*$/i, "")
          .replace(/\s+eee\s+eee\s*$/i, "")
          .replace(/\s*\*\s*We recommend that teachers[\s\S]*$/i, "")
          .replace(/\s+\d+\s*$/, "")
          .trim());
      }).filter((prompt) => Boolean(prompt) && !/^\W*Connection Questions\W*$/i.test(prompt))
      : fallbackNumberedQuestions(resource.text ?? "");
    if (options.normalizeSharedQuotationDirections) {
      const normalized: string[] = [];
      let quotationDirections = false;
      for (const prompt of prompts) {
        if (/^Quotations?\.\s*List the speaker, situation and significance\.?$/i.test(prompt)) {
          quotationDirections = true;
          continue;
        }
        if (/^Answer the following questions\.?$/i.test(prompt)) {
          quotationDirections = false;
          continue;
        }
        normalized.push(quotationDirections
          ? `For the quotation \u201c${prompt.replace(/[.\s]+$/, "")}\u201d, identify the speaker, situation, and significance.`
          : prompt);
      }
      prompts = normalized;
    }
    if (/TKAMB-Chapter Questions/i.test(resource.title) && prompts[0]?.length > 700) {
      prompts[0] = `${prompts[0].split("?")[0]!.trim()}?`;
    }
    if (!prompts.length) throw new Error(`Could not extract learner questions from ${resource.source}.`);
    const sourceTitle = resource.title.replace(/\.(?:pdf|docx?)$/i, "").trim();
    return {
      id: `${safeId(options.idPrefix)}-${resourceIndex + 1}`,
      title: sourceTitle || `${options.titlePrefix} ${resourceIndex + 1}`,
      subtitle: "Assigned reading questions",
      locator: sourceTitle || `${options.titlePrefix} ${resourceIndex + 1}`,
      questions: prompts.map((prompt, promptIndex) => ({
        id: `question-${promptIndex + 1}`,
        label: `${sourceTitle || options.titlePrefix} Question ${promptIndex + 1}`,
        prompt,
        hint: options.hint,
        rows: 6,
        provenance: "teacher-supplied" as const
      }))
    } satisfies EnglishActivityQuestionSet;
  });
  return sets;
}

export const englishFactoryResourceInternals = {
  FORBIDDEN_SOURCE_PATTERN,
  MACBETH_TEACHER_SCENES,
  MACBETH_PROFILE_SCENE_QUESTIONS,
  DRACULA_ACT_QUESTION_PAGES,
  CRUCIBLE_OMITTED_TEACHER_PROMPTS,
  CRUCIBLE_TEACHER_PROMPT_REWRITES,
  extractCrucibleGuideQuestions,
  formatSourcePageRanges,
  resolveProjectWorkspaceSource,
  resolveSupplementalSource,
  scopeExtractedPdfText,
  promptsFromPage,
  splitCompoundPrompt
};
