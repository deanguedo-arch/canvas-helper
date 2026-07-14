import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import JSZip from "jszip";

import { decodeBrightspaceHtml } from "../ela-modern-drama.js";
import type {
  EnglishBuildReportItem,
  EnglishBuiltLesson,
  EnglishQuestionPrompt,
  EnglishSupportingResource,
  EnglishUnitRecipe,
  EnglishUnitRecipeV1
} from "./types.js";

const execFileAsync = promisify(execFile);
const JPEG_2000_SIGNATURE = Buffer.from([0x00, 0x00, 0x00, 0x0c, 0x6a, 0x50, 0x20, 0x20, 0x0d, 0x0a, 0x87, 0x0a]);

export function isJpeg2000Buffer(buffer: Buffer) {
  return buffer.length >= JPEG_2000_SIGNATURE.length && buffer.subarray(0, JPEG_2000_SIGNATURE.length).equals(JPEG_2000_SIGNATURE);
}

async function convertJpeg2000ToPng(buffer: Buffer, targetPath: string) {
  const tempDir = await mkdtemp(path.join(tmpdir(), "canvas-helper-english-jp2-"));
  const tempSource = path.join(tempDir, "source.jp2");
  try {
    await writeFile(tempSource, buffer);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await execFileAsync("sips", ["-s", "format", "png", tempSource, "--out", targetPath]);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function writeBrowserSafeLessonImage(input: {
  buffer: Buffer;
  sourceAsset: string;
  title: string;
  workspaceDir: string;
  workspaceAssetRoot?: string;
}) {
  const originalName = `${safeId(input.title)}-${safeFileName(input.sourceAsset)}`;
  const converted = isJpeg2000Buffer(input.buffer);
  const targetName = converted
    ? `${path.posix.basename(originalName, path.posix.extname(originalName))}.png`
    : originalName;
  const workspaceHref = `${input.workspaceAssetRoot ?? "assets/lessons"}/${targetName}`;
  const targetPath = path.join(input.workspaceDir, workspaceHref);
  if (converted) {
    await convertJpeg2000ToPng(input.buffer, targetPath);
  } else {
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, input.buffer);
  }
  return { converted, workspaceHref };
}

export function normalizeZipPath(value: string) {
  return value.replace(/\\/g, "/").replace(/^\.\//, "");
}

export function safeId(value: string, fallback = "item") {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || fallback;
}

export function safeFileName(value: string) {
  const extension = path.posix.extname(normalizeZipPath(value)).toLowerCase();
  const stem = path.posix.basename(normalizeZipPath(value), extension);
  return `${safeId(stem, "resource")}${extension || ".bin"}`;
}

async function readZipText(zip: JSZip, entryPath: string) {
  const normalized = normalizeZipPath(entryPath);
  const entry = zip.file(normalized) ?? zip.file(entryPath) ?? Object.values(zip.files).find(
    (candidate) => !candidate.dir && normalizeZipPath(candidate.name).toLowerCase() === normalized.toLowerCase()
  );
  if (!entry) throw new Error(`Missing ZIP entry: ${normalized}`);
  return decodeBrightspaceHtml(await entry.async("nodebuffer"));
}

async function readZipBuffer(zip: JSZip, entryPath: string) {
  const normalized = normalizeZipPath(entryPath);
  const entry = zip.file(normalized) ?? zip.file(entryPath) ?? Object.values(zip.files).find(
    (candidate) => !candidate.dir && normalizeZipPath(candidate.name).toLowerCase() === normalized.toLowerCase()
  );
  if (!entry) throw new Error(`Missing ZIP entry: ${normalized}`);
  return entry.async("nodebuffer");
}

function directTitle($: cheerio.CheerioAPI, element: Element) {
  return $(element).children("title").first().text().replace(/\s+/g, " ").trim();
}

function resourceMap($: cheerio.CheerioAPI) {
  const map = new Map<string, string>();
  $("resource").each((_, element) => {
    const identifier = $(element).attr("identifier");
    const href = $(element).attr("href");
    if (identifier && href) map.set(identifier, normalizeZipPath(href));
  });
  return map;
}

function youtubeId(value: string) {
  const match = value.match(/(?:youtube(?:-nocookie)?\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
  return match?.[1] ?? "";
}

function replaceLiteral(value: string, find: string, replacement: string) {
  return value.split(find).join(replacement);
}

function stripDiplomaFraming($: cheerio.CheerioAPI, body: cheerio.Cheerio<Element>) {
  body.find("h2, p, li").each((_, element) => {
    const node = $(element);
    const text = node.text().replace(/\s+/g, " ").trim();
    if (/Part A \(Written\)|diploma exam|diploma exam mark|20% of your|30% of your/i.test(text)) {
      node.remove();
    }
  });
  body.find("ol, ul").each((_, element) => {
    const node = $(element);
    if (node.children().length === 0) node.remove();
  });
}

async function cleanSupportingHtml(zip: JSZip, sourceHref: string, workspaceDir: string) {
  const html = await readZipText(zip, sourceHref);
  const $ = cheerio.load(html);
  $("script, style, link, #header, #footer").remove();
  const body = $("body");
  const output = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Supporting reading</title><style>body{max-width:760px;margin:40px auto;padding:0 24px;font:16px/1.65 Georgia,serif;color:#20241f}h1,h2,h3{font-family:Arial,sans-serif;line-height:1.2}p{margin:0 0 1em}</style></head><body>${body.html() ?? ""}</body></html>`;
  const target = path.join(workspaceDir, "resources", "generated", "rhw-irony.html");
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, output, "utf8");
  return "resources/generated/rhw-irony.html";
}

export async function cleanEnglishLesson(input: {
  zip: JSZip;
  sourceHref: string;
  title: string;
  workspaceDir: string;
  recipe: EnglishUnitRecipe;
  reportItems: EnglishBuildReportItem[];
}) {
  const sourceHtml = await readZipText(input.zip, input.sourceHref);
  const $ = cheerio.load(sourceHtml);
  $("script, style, link, #header, #footer").remove();
  const body = $("body");
  const supportingResources: EnglishSupportingResource[] = [];
  body.find("h1").first().remove();

  if (input.recipe.schemaVersion === 2 || /Writing a (?:Personal|Critical)|Critical and Analytical Response/i.test(input.title)) {
    stripDiplomaFraming($, body);
  }

  body.find("iframe").each((_, element) => {
    const frame = $(element);
    const src = frame.attr("src") ?? "";
    const id = youtubeId(src);
    if (!id || input.recipe.mediaPolicy.blockedYouTubeIds.includes(id)) {
      frame.remove();
      input.reportItems.push({
        role: "media",
        source: src || `${input.sourceHref}#iframe`,
        status: "failed",
        note: id ? "Removed because the video failed the live availability check." : "Removed unsupported iframe."
      });
      return;
    }
    if (!input.recipe.mediaPolicy.allowedYouTubeIds.includes(id)) {
      frame.remove();
      input.reportItems.push({
        role: "media",
        source: src,
        status: "failed",
        note: "Removed because the video was not present in the verified media allowlist."
      });
      return;
    }
    frame.attr("src", `https://www.youtube-nocookie.com/embed/${id}?rel=0`);
    frame.attr("title", `${input.title} video`);
    frame.attr("loading", "lazy");
    frame.attr("referrerpolicy", "strict-origin-when-cross-origin");
    frame.attr("allowfullscreen", "");
    input.reportItems.push({
      role: "media",
      source: src,
      status: "placed",
      destination: `Film Room and ${input.title}`,
      note: "Live YouTube oEmbed check passed; converted to a privacy-enhanced HTTPS embed."
    });
  });

  for (const element of body.find("img").toArray()) {
    const image = $(element);
    const src = image.attr("src") ?? "";
    if (!src || /^https?:|^data:/i.test(src)) continue;
    const sourceAsset = normalizeZipPath(path.posix.join(path.posix.dirname(input.sourceHref), src));
    let sourceBuffer: Buffer;
    try {
      sourceBuffer = await readZipBuffer(input.zip, sourceAsset);
    } catch {
      image.remove();
      input.reportItems.push({
        role: "supporting-resource",
        source: sourceAsset,
        status: "missing",
        note: `Referenced image was missing from the Brightspace ZIP and was removed from ${input.title}.`
      });
      continue;
    }
    try {
      const { converted, workspaceHref } = await writeBrowserSafeLessonImage({
        buffer: sourceBuffer,
        sourceAsset,
        title: input.title,
        workspaceDir: input.workspaceDir,
        workspaceAssetRoot: input.recipe.schemaVersion === 2 ? "assets/generated/lessons" : "assets/lessons"
      });
      image.attr("src", workspaceHref);
      image.removeAttr("width").removeAttr("height");
      input.reportItems.push({
        role: "supporting-resource",
        source: sourceAsset,
        status: "placed",
        destination: workspaceHref,
        note: converted
          ? `Converted JPEG 2000 image referenced by ${input.title} to browser-safe PNG.`
          : `Copied image referenced by ${input.title}.`
      });
    } catch {
      image.remove();
      input.reportItems.push({
        role: "supporting-resource",
        source: sourceAsset,
        status: "failed",
        note: `Referenced image could not be converted to a browser-safe format and was removed from ${input.title}.`
      });
    }
  }

  for (const element of body.find("a[href]").toArray()) {
    const anchor = $(element);
    const originalHref = anchor.attr("href") ?? "";
    if (!originalHref) continue;
    if (!/^https?:/i.test(originalHref)) {
      const withoutQuery = originalHref.split("?")[0] ?? originalHref;
      const sourceAsset = normalizeZipPath(path.posix.join(path.posix.dirname(input.sourceHref), withoutQuery));
      if (/rhw_irony\.html$/i.test(sourceAsset)) {
        const workspaceHref = await cleanSupportingHtml(input.zip, sourceAsset, input.workspaceDir);
        anchor.attr("href", workspaceHref);
        anchor.attr("target", "_blank").attr("rel", "noopener noreferrer");
        supportingResources.push({
          id: safeId(`${input.title}-${sourceAsset}`),
          title: anchor.text().replace(/\s+/g, " ").trim() || "Irony reading helper",
          href: workspaceHref,
          kind: "local",
          lessonTitle: input.title
        });
        input.reportItems.push({
          role: "supporting-resource",
          source: sourceAsset,
          status: "placed",
          destination: "workspace/resources/rhw-irony.html",
          note: "Retained as a supporting reading rather than a separate lesson."
        });
      } else if (/^#/.test(originalHref)) {
        continue;
      } else {
        anchor.replaceWith(anchor.contents());
      }
      continue;
    }

    const rewritten = input.recipe.mediaPolicy.externalUrlRewrites[originalHref] ?? originalHref;
    if (!input.recipe.mediaPolicy.approvedExternalUrls.includes(rewritten)) {
      anchor.replaceWith(anchor.contents());
      input.reportItems.push({
        role: "supporting-resource",
        source: originalHref,
        status: "failed",
        note: `Removed from ${input.title} because the live link check failed or the destination was not suitable for secure Brightspace use.`
      });
      continue;
    }
    anchor.attr("href", rewritten).attr("target", "_blank").attr("rel", "noopener noreferrer");
    supportingResources.push({
      id: safeId(`${input.title}-${rewritten}`),
      title: anchor.text().replace(/\s+/g, " ").trim() || rewritten,
      href: rewritten,
      kind: "external",
      lessonTitle: input.title
    });
    input.reportItems.push({
      role: "supporting-resource",
      source: originalHref,
      status: rewritten === originalHref ? "placed" : "corrected",
      destination: rewritten,
      note: rewritten === originalHref ? "Live link check passed." : "Live link check passed after upgrading the source URL."
    });
  }

  if (input.recipe.schemaVersion === 2) {
    const lessonPrefix = safeId(input.title, "lesson");
    const idMap = new Map<string, string>();
    body.find("[id]").each((_, element) => {
      const node = $(element);
      const originalId = node.attr("id")?.trim();
      if (!originalId) return;
      const nextId = `${lessonPrefix}-${safeId(originalId)}`;
      idMap.set(originalId, nextId);
      node.attr("id", nextId);
    });
    body.find("a[href^='#']").each((_, element) => {
      const anchor = $(element);
      const originalTarget = (anchor.attr("href") ?? "").slice(1);
      if (idMap.has(originalTarget)) anchor.attr("href", `#${idMap.get(originalTarget)}`);
    });
  }

  let contentHtml = body.html() ?? "";
  for (const correction of input.recipe.wordingCorrections) {
    if (contentHtml.includes(correction.find)) {
      contentHtml = replaceLiteral(contentHtml, correction.find, correction.replace);
      input.reportItems.push({
        role: "lesson",
        source: input.sourceHref,
        status: "corrected",
        destination: input.title,
        note: correction.reason
      });
    }
  }
  contentHtml = contentHtml
    .replace(/Personal Response to Texts Assignment/gi, "personal response")
    .replace(/Critical\/Analytical Response to Literary Texts Assignment/gi, "analytical response")
    .replace(/\s+style="[^"]*width:\s*\d+px;?[^"]*"/gi, "");

  const text = cheerio.load(`<body>${contentHtml}</body>`)("body").text().replace(/\s+/g, " ").trim();
  return { html: contentHtml, text, supportingResources };
}

export async function loadBrightspaceUnit(input: {
  zip: JSZip;
  workspaceDir: string;
  recipe: EnglishUnitRecipe;
  reportItems: EnglishBuildReportItem[];
}) {
  const manifest = await readZipText(input.zip, "imsmanifest.xml");
  const $ = cheerio.load(manifest, { xmlMode: true });
  const unit = $(`item[identifier="${input.recipe.source.brightspaceUnitId}"]`).first();
  const unitElement = unit.get(0);
  if (!unitElement) throw new Error(`Brightspace unit ${input.recipe.source.brightspaceUnitId} was not found.`);
  const title = directTitle($, unitElement);
  if (title !== "Short Stories") {
    throw new Error(`Brightspace unit ${input.recipe.source.brightspaceUnitId} is "${title}", not "Short Stories".`);
  }

  const resources = resourceMap($);
  const sourceByTitle = new Map<string, string>();
  unit.children("item").each((_, element) => {
    const lessonTitle = directTitle($, element);
    const identifierRef = $(element).attr("identifierref") ?? "";
    const href = resources.get(identifierRef);
    if (lessonTitle && href) sourceByTitle.set(lessonTitle, href);
  });

  const unexpected = [...sourceByTitle.keys()].filter((lessonTitle) => !input.recipe.lessonOrder.includes(lessonTitle));
  if (unexpected.length) throw new Error(`Selected Short Stories unit has unexpected lessons: ${unexpected.join(", ")}`);

  const lessons: EnglishBuiltLesson[] = [];
  for (const [index, lessonTitle] of input.recipe.lessonOrder.entries()) {
    const sourceHref = sourceByTitle.get(lessonTitle);
    if (!sourceHref) throw new Error(`Selected Short Stories unit is missing lesson: ${lessonTitle}`);
    const cleaned = await cleanEnglishLesson({
      zip: input.zip,
      sourceHref,
      title: lessonTitle,
      workspaceDir: input.workspaceDir,
      recipe: input.recipe,
      reportItems: input.reportItems
    });
    lessons.push({
      id: `lesson-${index + 1}-${safeId(lessonTitle)}`,
      title: lessonTitle,
      sourceHref,
      html: cleaned.html,
      text: cleaned.text,
      supportingResources: cleaned.supportingResources
    });
    input.reportItems.push({
      role: "lesson",
      source: sourceHref,
      status: "placed",
      destination: lessonTitle,
      note: `Imported from Brightspace unit ${input.recipe.source.brightspaceUnitId}.`
    });
  }

  return { title, lessons };
}

export type EnglishBrightspaceLessonSelector = {
  itemId: string;
  title?: string;
};

/**
 * Loads an explicit allowlist of Brightspace lesson items. Unlike the original
 * Short Stories loader, this does not infer a unit from its title and therefore
 * cannot drift into legacy duplicate units or unrelated organizations.
 */
export async function loadBrightspaceLessonsByIds(input: {
  zip: JSZip;
  workspaceDir: string;
  recipe: EnglishUnitRecipe;
  selectors: EnglishBrightspaceLessonSelector[];
  reportItems: EnglishBuildReportItem[];
}) {
  const manifest = await readZipText(input.zip, "imsmanifest.xml");
  const $ = cheerio.load(manifest, { xmlMode: true });
  const resources = resourceMap($);
  const lessons: EnglishBuiltLesson[] = [];

  for (const [index, selector] of input.selectors.entries()) {
    const item = $(`item[identifier="${selector.itemId}"]`).first();
    const itemElement = item.get(0);
    if (!itemElement) {
      throw new Error(`Brightspace lesson item ${selector.itemId} was not found.`);
    }
    const sourceTitle = directTitle($, itemElement);
    const identifierRef = item.attr("identifierref") ?? "";
    const sourceHref = resources.get(identifierRef);
    if (!sourceHref) {
      throw new Error(`Brightspace lesson item ${selector.itemId} (${sourceTitle}) has no resource href.`);
    }
    const title = selector.title?.trim() || sourceTitle;
    const cleaned = await cleanEnglishLesson({
      zip: input.zip,
      sourceHref,
      title,
      workspaceDir: input.workspaceDir,
      recipe: input.recipe,
      reportItems: input.reportItems
    });
    lessons.push({
      id: `lesson-${index + 1}-${safeId(title)}`,
      title,
      sourceHref,
      html: cleaned.html,
      text: cleaned.text,
      supportingResources: cleaned.supportingResources
    });
    input.reportItems.push({
      role: "lesson",
      source: `${selector.itemId}:${sourceHref}`,
      status: "placed",
      destination: title,
      note: `Imported from the explicit Brightspace item allowlist (${selector.itemId}).`
    });
  }

  return { title: input.recipe.courseTitle, lessons };
}

export function parseNumberedQuestions(text: string): EnglishQuestionPrompt[] {
  const normalized = text.replace(/\r/g, "").replace(/[ \t]+/g, " ");
  const matches = [...normalized.matchAll(/(?:^|\n)\s*(\d+)\.\s+([\s\S]*?)(?=(?:\n\s*\d+\.\s+)|$)/g)];
  return matches.map((match) => ({
    id: match[1],
    prompt: match[2]
      .replace(/\n(?=[a-z])/g, " ")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }));
}

export function collectVerifiedVideos(lessons: EnglishBuiltLesson[], recipe: EnglishUnitRecipe) {
  const videos: Array<{ id: string; lessonTitle: string; embedSrc: string }> = [];
  for (const lesson of lessons) {
    const $ = cheerio.load(lesson.html);
    $("iframe[src]").each((_, element) => {
      const src = $(element).attr("src") ?? "";
      const id = youtubeId(src);
      if (id && recipe.mediaPolicy.allowedYouTubeIds.includes(id) && !videos.some((video) => video.id === id)) {
        videos.push({ id, lessonTitle: lesson.title.replace(/^Lesson\s+\d+:\s*/i, ""), embedSrc: src });
      }
    });
  }
  return videos;
}
