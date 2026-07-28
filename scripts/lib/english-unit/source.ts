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

function decodeLocalAssetPath(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function humanizeAssetName(value: string) {
  return path.posix.basename(value, path.posix.extname(value))
    .replace(/[-_]+/g, " ")
    .replace(/\b(?:img|image|images|download|pastedimage)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function usefulImageAlt(value: string | undefined) {
  const normalized = String(value ?? "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (/^(?:image|image result|general|et|photo|picture|graphic|untitled)$/i.test(normalized)) return "";
  return normalized;
}

function removeMissingImageContainer($: cheerio.CheerioAPI, image: cheerio.Cheerio<Element>) {
  const figure = image.closest("figure");
  if (figure.length) {
    figure.remove();
    return;
  }
  const parent = image.parent();
  const meaningfulText = parent.text().replace(/\s+/g, " ").trim();
  if (parent.is("p") && parent.children("img").length === 1 && !meaningfulText) parent.remove();
  else image.remove();
}

async function readLessonImageWithFallback(zip: JSZip, sourceAsset: string) {
  try {
    return { buffer: await readZipBuffer(zip, sourceAsset), resolvedSource: sourceAsset };
  } catch {
    const basename = path.posix.basename(sourceAsset).toLowerCase();
    const matches = Object.keys(zip.files).filter((entry) => {
      const candidate = zip.files[entry];
      return !candidate?.dir && path.posix.basename(normalizeZipPath(entry)).toLowerCase() === basename;
    });
    if (matches.length !== 1) throw new Error(`Unable to resolve lesson image ${sourceAsset}.`);
    return { buffer: await readZipBuffer(zip, matches[0]), resolvedSource: normalizeZipPath(matches[0]) };
  }
}

function normalizeKnownLessonContent(input: {
  $: cheerio.CheerioAPI;
  body: cheerio.Cheerio<Element>;
  title: string;
  recipe: EnglishUnitRecipe;
}) {
  const { $, body, title, recipe } = input;

  if (recipe.schemaVersion === 2 && recipe.projectSlug === "ela10-1-shakespeare-merchant-of-venice") {
    body.find("h1, h2, h3, h4").filter((_, element) => /Romeo\s+and\s+Juliet/i.test($(element).text())).each((_, element) => {
      const heading = $(element);
      const level = Number(element.tagName.slice(1));
      let sibling = heading.next();
      while (sibling.length) {
        const tagName = sibling.get(0)?.tagName?.toLowerCase() ?? "";
        const siblingLevel = /^h[1-4]$/.test(tagName) ? Number(tagName.slice(1)) : Number.POSITIVE_INFINITY;
        if (siblingLevel <= level) break;
        const next = sibling.next();
        sibling.remove();
        sibling = next;
      }
      heading.remove();
    });
    body.find("p").filter((_, element) => /majority of Romeo\s+and\s+Juliet/i.test($(element).text())).each((_, element) => {
      $(element).text("Shakespeare frequently wrote dramatic scenes in blank verse, while prose and rhymed verse serve other purposes.");
    });
  }

  if (/Student Samples/i.test(title) && recipe.schemaVersion === 2) {
    body.html(`<h2>Using Response Models</h2>
      <p>Use the response model to study how an effective critical response is built.</p>
      <p>Identify the response's controlling idea, strongest evidence, analytical explanation, organization, and next revision move.</p>
      <ul>
        <li>Underline the controlling idea.</li>
        <li>Mark where evidence is introduced and explained.</li>
        <li>Notice how each paragraph advances the interpretation.</li>
        <li>Record one craft move you can apply in your own response.</li>
      </ul>`);
    return;
  }

  if (/Macbeth Online/i.test(title) && recipe.schemaVersion === 2) {
    body.find("h2, p, li").each((_, element) => {
      const text = $(element).text().replace(/\s+/g, " ").trim();
      if (/links above|peruse the sites|through this site/i.test(text)) $(element).remove();
    });
    body.prepend(`<section class="source-access-note">
      <h2>Reading Macbeth Online</h2>
      <p>Use <strong>Macbeth Materials</strong> for the MIT Shakespeare original text and the myShakespeare multimedia companion. The side-by-side reader remains available inside this unit.</p>
    </section>`);
  }

  if (/Film Study (?:Lesson 1|Overview)/i.test(title) && recipe.schemaVersion === 2) {
    body.find("p").each((_, element) => {
      const text = $(element).text().replace(/\s+/g, " ").trim();
      if (/expected to rent\s+ONE\s+of two films|skip ahead to the Film Study Project page/i.test(text)) $(element).remove();
    });
    body.prepend(`<section class="source-access-note">
      <h2>Film Access</h2>
      <p>Use the feature film assigned for this course and its approved access method. Until a title is confirmed, use these lessons to learn techniques that apply to any film.</p>
    </section>`);
  }

  if (recipe.schemaVersion === 1 && /Theme/i.test(title)) {
    body.find("p, li").each((_, element) => {
      const text = $(element).text().replace(/\s+/g, " ").trim();
      if (/^Enlightened\s+and\s+Empty Your Cup$/i.test(text)) $(element).remove();
    });
  }

  body.find("p").each((_, element) => {
    const node = $(element);
    const text = node.text().replace(/\s+/g, " ").trim();
    if (/Cabinet of Dr\.? Caligari/i.test(text) && !node.find("img").length) node.remove();
  });
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

export function scrubEnglishLmsDeliveryScaffolding(input: {
  html: string;
  title: string;
  courseCode?: string;
}) {
  if (input.courseCode !== "ELA 10-1" && input.courseCode !== "ELA 10-2") {
    return { html: input.html, changes: [] as string[] };
  }
  const $ = cheerio.load(`<body>${input.html}</body>`);
  const body = $("body");
  const changes = new Set<string>();
  const isDashTwo = input.courseCode === "ELA 10-2";

  body.find("[data-d2l-editor-default-img-style]").each((_, element) => {
    $(element).removeAttr("data-d2l-editor-default-img-style");
    changes.add("Removed an inherited D2L editor-only image attribute.");
  });

  body.find(".sr-only").each((_, element) => {
    const text = $(element).text().replace(/\s+/g, " ").trim();
    if (/this link opens in a new (?:window|tab)(?:\/tab)?\)?/i.test(text)) {
      $(element).remove();
      changes.add("Removed inherited new-window accessibility boilerplate that no longer described a learner link.");
    }
  });

  body.find("p, li, h1, h2, h3, h4, h5").each((_, element) => {
    const node = $(element);
    const text = node.text().replace(/\s+/g, " ").trim();
    if (!text) return;
    if (/^(?:click|open)\s+(?:on\s+)?(?:the\s+)?(?:following\s+)?(?:google doc|link)\b/i.test(text)
      && !node.find("a[href], button, iframe, object, video").length) {
      node.remove();
      changes.add("Removed an orphaned click/open direction whose Brightspace destination was not part of the course.");
      return;
    }
    if (/^https?:\/\/\S+$/i.test(text)) {
      node.remove();
      changes.add("Removed a raw legacy URL that was not an approved learner resource.");
      return;
    }
    if (/Click the link to watch the video showing/i.test(text)) {
      node.text(text.replace(/Click the link to watch the video showing.*$/i, "").trim());
      changes.add("Removed an embedded video-link direction while preserving the instructional definition before it.");
    }
  });

  if (/Synopsis and What to Consider Before Reading/i.test(input.title)) {
    body.find("p").filter((_, element) => /access the assignment prior to starting to read your novel/i.test($(element).text())).each((_, element) => {
      $(element).text(isDashTwo
        ? "Review the Literary Exploration, Reading Guide, and Novel Study Questions before you begin so you know what ideas and evidence to collect while reading."
        : "Review the Critical Essay, Reading Guide, and Novel Study Questions before you begin so you know what ideas and evidence to collect while reading.");
      changes.add("Replaced the direction to access a separate pre-reading assignment with the actual course tools learners can use here.");
    });
  }

  if (/How to Respond to Literature/i.test(input.title)) {
    body.find("p").filter((_, element) => /re-submit your work in the proper format/i.test($(element).text())).each((_, element) => {
      $(element).html("<strong>Use this response structure when a prompt asks you to interpret what you have read or observed.</strong> Integrate the question into a clear statement, support it with precise evidence, explain the evidence, and add a meaningful connection or conclusion.");
      changes.add("Replaced the Brightspace resubmission warning with direct response-writing guidance.");
    });
  }

  if (/Writing a Short Story Analysis/i.test(input.title)) {
    body.find("p").filter((_, element) => /make a copy of this template by clicking/i.test($(element).text())).remove();
    body.find(".card").filter((_, element) => /^Short Story Analysis Template$/i.test($(element).text().replace(/\s+/g, " ").trim())).remove();
    body.find("p").filter((_, element) => /Read The Visitor \(provided on the next page\)/i.test($(element).text())).each((_, element) => {
      $(element).text("Use the Short Story Bank to read the assigned text. Then use Short Story Questions and the Writing Studio to develop your analysis.");
    });
    changes.add("Replaced the missing template, next-page, and Unit 2 assignment directions with the Short Story Bank, Questions, and Writing Studio workflow.");
  }

  if (/Annotating Readings/i.test(input.title)) {
    body.find("p").filter((_, element) => /demonstrate active reading by some short stories/i.test($(element).text())).each((_, element) => {
      $(element).text("Annotate important passages as you read. Record questions, patterns, unfamiliar words, and details that may become useful evidence.");
      changes.add("Reworded the incomplete Brightspace annotation requirement as a usable reading strategy.");
    });
  }

  if (/Literary Terms Review/i.test(input.title)) {
    body.find("p").filter((_, element) => /For a printable version, you can make a copy by clicking the following link:\s*ELA 10-2/i.test($(element).text())).each((_, element) => {
      $(element).text("Use this glossary as a course reference while reading and writing. Return to the relevant term whenever you need to identify or explain a literary choice.");
      changes.add("Removed the ELA 10-2 printable-copy direction and kept the local literary-terms glossary as the learner reference.");
    });
  }

  if (/^Lion$/i.test(input.title) || /^Pay It Forward$/i.test(input.title)) {
    const filmTitle = /^Lion$/i.test(input.title) ? "Lion" : "Pay It Forward";
    const writingTool = isDashTwo ? "Literary Exploration" : "Critical Essay";
    body.html(`<h3>Using ${filmTitle}</h3><p>If your class is studying <em>${filmTitle}</em>, record important scenes in the Viewing Guide and complete the selected Film Study Questions. Use the ${writingTool} lessons when you are ready to develop a sustained interpretation.</p>`);
    changes.add(`Replaced the missing Google Doc and assignment directions for ${filmTitle} with the course's Viewing Guide, Film Study Questions, and Critical Essay workflow.`);
  }

  body.find("p, h1, h2, h3, h4, h5, li").each((_, element) => {
    const node = $(element);
    if (!node.text().replace(/\s+/g, " ").trim() && !node.find("img, video, audio, iframe, object, a[href], button").length) node.remove();
  });
  return { html: body.html() ?? "", changes: [...changes] };
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
    if (!src || /^data:/i.test(src)) continue;
    if (/^https?:/i.test(src)) {
      removeMissingImageContainer($, image);
      input.reportItems.push({
        role: "supporting-resource",
        source: src,
        status: "corrected",
        note: `Removed a remotely hosted lesson image from ${input.title}; only package-local images are retained so the SCORM course cannot develop a broken external image.`
      });
      continue;
    }
    const sourceAsset = normalizeZipPath(path.posix.join(
      path.posix.dirname(input.sourceHref),
      decodeLocalAssetPath(src)
    ));
    let sourceBuffer: Buffer;
    let resolvedSource = sourceAsset;
    try {
      const resolved = await readLessonImageWithFallback(input.zip, sourceAsset);
      sourceBuffer = resolved.buffer;
      resolvedSource = resolved.resolvedSource;
    } catch {
      removeMissingImageContainer($, image);
      input.reportItems.push({
        role: "supporting-resource",
        source: sourceAsset,
        status: "corrected",
        note: `The Brightspace ZIP did not contain this referenced image. Its dependent empty image container or caption was removed from ${input.title}, so no broken learner asset remains.`
      });
      continue;
    }
    try {
      const { converted, workspaceHref } = await writeBrowserSafeLessonImage({
        buffer: sourceBuffer,
        sourceAsset: resolvedSource,
        title: input.title,
        workspaceDir: input.workspaceDir,
        workspaceAssetRoot: input.recipe.schemaVersion === 1 ? "assets/lessons" : "assets/generated/lessons"
      });
      image.attr("src", workspaceHref);
      image.removeAttr("width").removeAttr("height");
      const existingAlt = usefulImageAlt(image.attr("alt")) || usefulImageAlt(image.attr("title"));
      const assetLabel = humanizeAssetName(resolvedSource);
      image.attr("alt", existingAlt || `${input.title}${assetLabel ? ` - ${assetLabel}` : " instructional visual"}`);
      input.reportItems.push({
        role: "supporting-resource",
        source: resolvedSource,
        status: "placed",
        destination: workspaceHref,
        note: resolvedSource !== sourceAsset
          ? `Recovered a misaddressed image by its unique filename and copied it for ${input.title}.`
          : converted
            ? `Converted JPEG 2000 image referenced by ${input.title} to browser-safe PNG.`
            : `Copied image referenced by ${input.title}.`
      });
    } catch {
      removeMissingImageContainer($, image);
      input.reportItems.push({
        role: "supporting-resource",
        source: resolvedSource,
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
          destination: `workspace/${workspaceHref}`,
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
      const parent = anchor.parent();
      const parentText = parent.text().replace(/\s+/g, " ").trim();
      const resourceOnly = parent.is("p, li") && parentText.length < 180 && (
        parent.children("a").length === parent.children().length
        || /^(?:read|watch|visit|open|view|use|try|explore)\b/i.test(parentText)
        || /^(?:Enlightened|Empty Your Cup)(?:\s+and\s+(?:Enlightened|Empty Your Cup))?$/i.test(parentText)
      );
      if (resourceOnly) parent.remove();
      else anchor.replaceWith(anchor.contents());
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

  normalizeKnownLessonContent({ $, body, title: input.title, recipe: input.recipe });

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
  const lmsCleanup = scrubEnglishLmsDeliveryScaffolding({
    html: contentHtml,
    title: input.title,
    courseCode: input.recipe.courseCode
  });
  contentHtml = lmsCleanup.html;
  if (lmsCleanup.changes.length) {
    input.reportItems.push({
      role: "lesson",
      source: input.sourceHref,
      status: "corrected",
      destination: input.title,
      note: lmsCleanup.changes.join(" ")
    });
  }
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
  const courseLevel = input.recipe.courseCode?.match(/\d{2}[\u2010-\u2015-]1/)?.[0]?.replace(/[\u2010-\u2015]/g, "-") ?? "20-1";
  contentHtml = contentHtml
    .replace(/English Language Arts\s*(?:10|20|30)[\u2010-\u2015-]1/gi, `English Language Arts ${courseLevel}`)
    .replace(/\b(?:ELA|English)\s*(?:10|20|30)[\u2010-\u2015-]1\b/gi, (value) => value.toLowerCase().startsWith("ela") ? `ELA ${courseLevel}` : `English ${courseLevel}`)
    .replace(/\bin the exam booklet\b/gi, "in your planning notes")
    .replace(/\bpreparation for and writing of the examination\b/gi, "planning and drafting")
    .replace(/\bwriting of the examination\b/gi, "writing process")
    .replace(/\bfor the examination\b/gi, "for the response")
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

  const resources = resourceMap($);
  const sourceByTitle = new Map<string, string>();
  unit.children("item").each((_, element) => {
    const lessonTitle = directTitle($, element);
    const identifierRef = $(element).attr("identifierref") ?? "";
    const href = resources.get(identifierRef);
    if (lessonTitle && href) sourceByTitle.set(lessonTitle, href);
  });

  const unexpected = [...sourceByTitle.entries()].filter(([lessonTitle]) => !input.recipe.lessonOrder.includes(lessonTitle));
  for (const [lessonTitle, sourceHref] of unexpected) {
    input.reportItems.push({
      role: "lesson",
      source: sourceHref,
      status: "excluded",
      destination: lessonTitle,
      note: "Brightspace item is outside the recipe lesson allowlist."
    });
  }

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
    if (/\.pdf(?:[?#].*)?$/i.test(sourceHref)) {
      const fileName = `${safeId(title)}-${safeFileName(sourceHref)}`;
      const localHref = `assets/generated/lessons/${fileName}`;
      await mkdir(path.join(input.workspaceDir, "assets", "generated", "lessons"), { recursive: true });
      await writeFile(path.join(input.workspaceDir, localHref), await readZipBuffer(input.zip, sourceHref));
      const safeTitle = escapeHtml(title);
      const safeHref = escapeHtml(localHref);
      lessons.push({
        id: `lesson-${index + 1}-${safeId(title)}`,
        title,
        sourceHref,
        html: `<section class="source-pdf-lesson"><p>This lesson is provided as a PDF. Read it in the embedded viewer, open it full screen, or download a copy.</p><div class="source-pdf-actions"><a href="${safeHref}" target="_blank" rel="noopener noreferrer">Open full screen</a><a href="${safeHref}" download>Download</a></div><object class="source-pdf-frame" data="${safeHref}" type="application/pdf" aria-label="${safeTitle}"><p>Your browser cannot display this PDF here. <a href="${safeHref}" target="_blank" rel="noopener noreferrer">Open the ${safeTitle} lesson</a>.</p></object></section>`,
        text: `${title}. Instructional lesson provided as a PDF.`,
        supportingResources: [{ id: `${safeId(title)}-pdf`, title, href: localHref, kind: "local", lessonTitle: title }]
      });
      input.reportItems.push({
        role: "lesson",
        source: `${selector.itemId}:${sourceHref}`,
        status: "placed",
        destination: title,
        note: `Imported the Brightspace PDF lesson from the explicit item allowlist (${selector.itemId}).`
      });
      continue;
    }
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
  const labelCounts = new Map<string, number>();
  for (const lesson of lessons) {
    const $ = cheerio.load(lesson.html);
    $("iframe[src]").each((_, element) => {
      const src = $(element).attr("src") ?? "";
      const id = youtubeId(src);
      if (id && recipe.mediaPolicy.allowedYouTubeIds.includes(id) && !videos.some((video) => video.id === id)) {
        const lessonLabel = lesson.title.replace(/^Lesson\s+\d+[:.\s-]*/i, "");
        const container = $(element).closest("p, div, section");
        const nearbyHeading = container.prevAll("h2, h3, h4").first().text().replace(/\s+/g, " ").trim()
          || $(element).prevAll("h2, h3, h4").first().text().replace(/\s+/g, " ").trim();
        const baseLabel = nearbyHeading && nearbyHeading.toLowerCase() !== lessonLabel.toLowerCase()
          ? `${lessonLabel} - ${nearbyHeading}`
          : lessonLabel;
        const count = (labelCounts.get(baseLabel) ?? 0) + 1;
        labelCounts.set(baseLabel, count);
        videos.push({ id, lessonTitle: count > 1 ? `${baseLabel} (${count})` : baseLabel, embedSrc: src });
      }
    });
  }
  return videos;
}
