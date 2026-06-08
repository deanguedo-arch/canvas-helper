import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import * as cheerio from "cheerio";
import type { AnyNode, Element } from "domhandler";
import JSZip from "jszip";

import {
  CRITICAL_RESPONSE_ACTIVITY_SOURCE,
  CRITICAL_RESPONSE_WORKSHOPS
} from "./ela-critical-response-activity.js";
import {
  THESIS_BUILDER_ACTIVITY,
  THESIS_BUILDER_ACTIVITY_SOURCE
} from "./ela-thesis-builder-activity.js";
import { ensureDir, writeJsonFile, writeTextFile } from "./fs.js";
import { getProjectPaths, projectsRoot, repoRoot } from "./paths.js";
import type { ProjectManifest, ReferenceKind, ResourceCatalogEntry } from "./types.js";

export type ModernDramaImage = {
  originalSrc: string;
  zipPath: string;
  workspaceSrc: string;
  alt: string;
};

export type ModernDramaLink = {
  text: string;
  href: string;
  kind: "external" | "local";
  workspaceHref: string;
  zipPath?: string;
};

export type ModernDramaVideo = {
  title: string;
  originalSrc: string;
  embedSrc: string;
  origin: "iframe" | "link";
};

export type ModernDramaSourceKind = "html" | "pdf" | "other";

export type ModernDramaDocument = {
  title: string;
  zipPath: string;
  workspaceHref: string;
  kind: Exclude<ModernDramaSourceKind, "html">;
};

export type ModernDramaLesson = {
  id: string;
  sequence: number;
  title: string;
  sourceKind: ModernDramaSourceKind;
  sourceHref: string;
  contentHtml: string;
  text: string;
  images: ModernDramaImage[];
  videos: ModernDramaVideo[];
  links: ModernDramaLink[];
  document?: ModernDramaDocument;
};

export type ModernDramaUnit = {
  title: string;
  lessons: ModernDramaLesson[];
  localResources: ModernDramaLink[];
};

export type BuildElaModernDramaProjectOptions = {
  zipPath: string;
  slug?: string;
  force?: boolean;
};

const DEFAULT_SLUG = "ela30-1-modern-drama";
const COURSE_TITLE = "ELA 30-1";
const NEXT_STEP_LOGO_WORKSPACE_HREF = "assets/brand/nxt-ce-logo-white-with-ce.png";
const NEXT_STEP_LOGO_SOURCE_PATH = path.join(
  repoRoot,
  "docs",
  "design",
  "next-step",
  "assets",
  "nxt-ce-logo-white-with-ce.png"
);
const SOURCE_UNIT_TARGETS = [
  {
    canonicalTitle: "A Streetcar Named Desire",
    titleAliases: ["A Streetcar Named Desire", "A Steetcar Named Desire"],
    identifier: "RES_CONTENT_3544"
  },
  {
    canonicalTitle: "Modern Drama",
    titleAliases: ["Modern Drama"],
    identifier: "RES_CONTENT_3535"
  }
];

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripBOM(value: string) {
  return value.replace(/^\uFEFF/, "");
}

export function decodeBrightspaceHtml(raw: Buffer | Uint8Array) {
  const buffer = Buffer.from(raw);
  if (buffer[0] === 0xff && buffer[1] === 0xfe) {
    return stripBOM(buffer.toString("utf16le"));
  }
  if (buffer[0] === 0xfe && buffer[1] === 0xff) {
    const swapped = Buffer.alloc(buffer.length - 2);
    for (let index = 2; index + 1 < buffer.length; index += 2) {
      swapped[index - 2] = buffer[index + 1];
      swapped[index - 1] = buffer[index];
    }
    return stripBOM(swapped.toString("utf16le"));
  }
  if (buffer.subarray(0, 200).includes(0)) {
    return stripBOM(buffer.toString("utf16le"));
  }
  return stripBOM(buffer.toString("utf8"));
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function safeDecodeUri(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeZipPath(value: string) {
  return path.posix
    .normalize(value.replace(/\\/g, "/").replace(/^\/+/, ""))
    .replace(/^\.\//, "");
}

function withoutQuery(value: string) {
  const withoutSearch = value.split("?", 1)[0] ?? value;
  return withoutSearch.replace(/#(?!\d+;|x[0-9a-f]+;).*/i, "");
}

function toSafeId(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function toSafeFileName(zipPath: string) {
  const parsed = path.posix.parse(zipPath);
  const base = parsed.name
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${base || "asset"}${parsed.ext.toLowerCase()}`;
}

function toLocalResourceFileName(zipPath: string) {
  const parsed = path.posix.parse(zipPath);
  const base = parsed.name
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80);
  return `${base || "resource"}.html`;
}

function sourceKindForPath(zipPath: string): ModernDramaSourceKind {
  const extension = path.posix.extname(zipPath).toLowerCase();
  if (extension === ".html" || extension === ".htm") {
    return "html";
  }
  if (extension === ".pdf") {
    return "pdf";
  }
  return "other";
}

function sourceRootForPath(zipPath: string) {
  return normalizeZipPath(zipPath).split("/").filter(Boolean)[0] ?? "";
}

function workspaceHrefForLocalResource(zipPath: string) {
  return sourceKindForPath(zipPath) === "html"
    ? `./resources/${toLocalResourceFileName(zipPath)}`
    : `./assets/source/${toSafeFileName(zipPath)}`;
}

function firstExistingPath(candidates: string[], zipEntries: Set<string>) {
  for (const candidate of candidates) {
    const normalized = normalizeZipPath(candidate);
    if (zipEntries.has(normalized)) {
      return normalized;
    }
  }

  const lowerEntries = new Map([...zipEntries].map((entry) => [entry.toLowerCase(), entry]));
  for (const candidate of candidates) {
    const normalized = normalizeZipPath(candidate);
    const match = lowerEntries.get(normalized.toLowerCase());
    if (match) {
      return match;
    }
  }

  return null;
}

export function resolveModernDramaAssetPath(input: {
  lessonHref: string;
  rawSrc: string;
  zipEntries: Set<string>;
}) {
  const decoded = safeDecodeUri(decodeHtmlEntities(withoutQuery(input.rawSrc))).replace(/\\/g, "/");
  if (!decoded || /^(https?:|data:|mailto:)/i.test(decoded)) {
    return null;
  }

  const lessonDir = path.posix.dirname(normalizeZipPath(input.lessonHref));
  const sourceRoot = sourceRootForPath(input.lessonHref);
  const candidates = [
    decoded,
    path.posix.join(lessonDir, decoded),
    sourceRoot && decoded.includes(`${sourceRoot}/`) ? decoded.slice(decoded.lastIndexOf(`${sourceRoot}/`)) : ""
  ].filter(Boolean);

  const directMatch = firstExistingPath(candidates, input.zipEntries);
  if (directMatch) {
    return directMatch;
  }

  const basename = path.posix.basename(decoded).toLowerCase();
  return (
    [...input.zipEntries].find((entry) => {
      return (!sourceRoot || entry.startsWith(`${sourceRoot}/`)) && path.posix.basename(entry).toLowerCase() === basename;
    }) ?? null
  );
}

function resolveLocalHtmlPath(input: {
  lessonHref: string;
  rawHref: string;
  zipEntries: Set<string>;
}) {
  const decoded = safeDecodeUri(decodeHtmlEntities(withoutQuery(input.rawHref))).replace(/\\/g, "/");
  if (!decoded || /^(https?:|data:|mailto:|#)/i.test(decoded)) {
    return null;
  }
  const lessonDir = path.posix.dirname(normalizeZipPath(input.lessonHref));
  return firstExistingPath([decoded, path.posix.join(lessonDir, decoded)], input.zipEntries);
}

function normalizeYouTubeEmbedSrc(rawUrl: string) {
  const decoded = safeDecodeUri(decodeHtmlEntities(rawUrl));
  try {
    const url = new URL(decoded);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        const id = url.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      const embedMatch = url.pathname.match(/^\/embed\/([^/?#]+)/);
      if (embedMatch?.[1]) {
        return `https://www.youtube.com/embed/${embedMatch[1]}${url.search}`;
      }
      const shortsMatch = url.pathname.match(/^\/shorts\/([^/?#]+)/);
      if (shortsMatch?.[1]) {
        return `https://www.youtube.com/embed/${shortsMatch[1]}`;
      }
    }
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

function normalizeVideoEmbedSrc(rawUrl: string) {
  return normalizeYouTubeEmbedSrc(rawUrl);
}

function extractHtmlText($: cheerio.CheerioAPI, element: cheerio.Cheerio<AnyNode>) {
  return normalizeWhitespace(element.text()).replace(/@2019 CBe-learn - Calgary Board of Education/g, "").trim();
}

function cleanSourceContentHtml(html: string, lessonHref: string, zipEntries: Set<string>) {
  const $ = cheerio.load(html);
  $("script, style, link, meta, title").remove();
  $("p").each((_, element) => {
    const paragraph = $(element);
    if (!normalizeWhitespace(paragraph.text()) && paragraph.find("img, video, audio, iframe, object, embed, source").length === 0) {
      paragraph.remove();
    }
  });

  const images: ModernDramaImage[] = [];
  $("img[src]").each((_, element) => {
    const image = $(element);
    const originalSrc = image.attr("src") ?? "";
    const resolvedPath = resolveModernDramaAssetPath({ lessonHref, rawSrc: originalSrc, zipEntries });
    if (!resolvedPath) {
      return;
    }

    const workspaceSrc = `./assets/source/${toSafeFileName(resolvedPath)}`;
    const alt = normalizeWhitespace(image.attr("alt") ?? image.attr("title") ?? path.posix.parse(resolvedPath).name);
    image.attr("src", workspaceSrc);
    image.attr("alt", alt);
    image.attr("loading", "lazy");
    image.attr("class", "source-image");
    images.push({ originalSrc, zipPath: resolvedPath, workspaceSrc, alt });
  });

  const videos: ModernDramaVideo[] = [];
  $("iframe[src]").each((_, element) => {
    const frame = $(element);
    const originalSrc = frame.attr("src") ?? "";
    const embedSrc = normalizeVideoEmbedSrc(originalSrc);
    if (!embedSrc) {
      return;
    }

    frame.attr("src", embedSrc);
    frame.attr("class", normalizeWhitespace(`${frame.attr("class") ?? ""} source-video-frame`));
    frame.attr("loading", "lazy");
    frame.attr("title", frame.attr("title") ?? "Embedded video");
    frame.attr("allow", frame.attr("allow") ?? "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
    frame.attr("allowfullscreen", "true");
    frame.removeAttr("width");
    frame.removeAttr("height");
    videos.push({ title: frame.attr("title") ?? "Embedded video", originalSrc, embedSrc, origin: "iframe" });
  });

  const links: ModernDramaLink[] = [];
  $("a[href]").each((_, element) => {
    const link = $(element);
    const href = link.attr("href") ?? "";
    const text = normalizeWhitespace(link.text()) || href;
    const embedSrc = normalizeVideoEmbedSrc(href);
    if (embedSrc) {
      link.attr("class", normalizeWhitespace(`${link.attr("class") ?? ""} source-video-link`));
      videos.push({ title: text, originalSrc: href, embedSrc, origin: "link" });
    }

    const localPath = resolveLocalHtmlPath({ lessonHref, rawHref: href, zipEntries });
    if (localPath) {
      const workspaceHref = workspaceHrefForLocalResource(localPath);
      link.attr("href", workspaceHref);
      link.attr("target", "_blank");
      link.attr("rel", "noopener noreferrer");
      links.push({ text, href, kind: "local", workspaceHref, zipPath: localPath });
      return;
    }

    if (/^https?:/i.test(href)) {
      link.attr("target", "_blank");
      link.attr("rel", "noopener noreferrer");
      links.push({ text, href, kind: "external", workspaceHref: href });
    }
  });

  const body = $("body");
  const contentRoot = body.length > 0 ? body : $.root();
  let contentHtml = body.length > 0 ? body.html() ?? "" : $.root().html() ?? "";
  contentHtml = contentHtml
    .replace(/@2019 CBe-learn - Calgary Board of Education/g, "")
    .replace(/\sclass="(?:CentreAlign|LeftAlign|RightAlign)"/g, "")
    .replace(/<p>\s*<\/p>/gi, "")
    .trim();

  return {
    contentHtml,
    text: extractHtmlText($, contentRoot),
    images,
    videos: uniqueBy(videos, (video) => video.embedSrc),
    links,
    document: undefined
  };
}

async function readZipText(zip: JSZip, zipPath: string) {
  const file = zip.file(zipPath);
  if (!file) {
    throw new Error(`Missing ZIP entry: ${zipPath}`);
  }
  return decodeBrightspaceHtml(await file.async("nodebuffer"));
}

async function readZipBuffer(zip: JSZip, zipPath: string) {
  const file = zip.file(zipPath);
  if (!file) {
    throw new Error(`Missing ZIP entry: ${zipPath}`);
  }
  return await file.async("nodebuffer");
}

function directChildText($: cheerio.CheerioAPI, element: AnyNode, childSelector: string) {
  return normalizeWhitespace($(element).children(childSelector).first().text());
}

function getResourceMap($: cheerio.CheerioAPI) {
  const resources = new Map<string, string>();
  $("resource").each((_, element) => {
    const identifier = $(element).attr("identifier");
    const href = $(element).attr("href");
    if (identifier && href) {
      resources.set(identifier, normalizeZipPath(href));
    }
  });
  return resources;
}

function findSourceUnit($: cheerio.CheerioAPI) {
  for (const target of SOURCE_UNIT_TARGETS) {
    let matchedItem: Element | null = null;
    $("item").each((_, element) => {
      const title = directChildText($, element, "title");
      const identifierRef = $(element).attr("identifierref") ?? "";
      const hasMatchingTitle = target.titleAliases.some((alias) => normalizeWhitespace(alias).toLowerCase() === title.toLowerCase());
      if (hasMatchingTitle || identifierRef === target.identifier) {
        matchedItem = element;
        return false;
      }
      return undefined;
    });

    if (matchedItem) {
      return { item: matchedItem, target };
    }
  }

  return null;
}

function sourceLessonItems($: cheerio.CheerioAPI, parentItem: Element, resources: Map<string, string>) {
  const items: Element[] = [];
  const visit = (item: Element) => {
    $(item).children("item").each((_, child) => {
      const childElement = child as Element;
      const identifier = $(childElement).attr("identifierref") ?? "";
      if (resources.has(identifier)) {
        items.push(childElement);
      }
      visit(childElement);
    });
  };
  visit(parentItem);
  return items;
}

function buildDocumentLesson(title: string, sourceHref: string, sourceKind: Exclude<ModernDramaSourceKind, "html">) {
  const workspaceHref = `./assets/source/${toSafeFileName(sourceHref)}`;
  const label = sourceKind === "pdf" ? "PDF" : "source document";
  const linkText = `Open ${title}`;
  const document: ModernDramaDocument = {
    title,
    zipPath: sourceHref,
    workspaceHref,
    kind: sourceKind
  };
  const frameMarkup =
    sourceKind === "pdf"
      ? `<iframe class="source-document-frame" src="${escapeHtml(workspaceHref)}" title="${escapeHtml(title)}"></iframe>`
      : "";

  return {
    contentHtml: `<h1>${escapeHtml(title)}</h1>
<p>This source item is provided as a local ${label} from the Brightspace export.</p>
<p><a class="source-link" href="${escapeHtml(workspaceHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(linkText)}</a></p>
${frameMarkup}`,
    text: `${title} Local ${label}: ${sourceHref}`,
    images: [] as ModernDramaImage[],
    videos: [] as ModernDramaVideo[],
    links: [
      {
        text: linkText,
        href: sourceHref,
        kind: "local" as const,
        workspaceHref,
        zipPath: sourceHref
      }
    ],
    document
  };
}

export async function extractModernDramaUnit(zipBuffer: Buffer | Uint8Array): Promise<ModernDramaUnit> {
  const zip = await JSZip.loadAsync(zipBuffer);
  const zipEntries = new Set(
    Object.keys(zip.files)
      .filter((entry) => !zip.files[entry]?.dir)
      .map(normalizeZipPath)
  );
  const manifest = await readZipText(zip, "imsmanifest.xml");
  const $ = cheerio.load(manifest, { xmlMode: true });
  const resources = getResourceMap($);

  const sourceUnit = findSourceUnit($);
  if (!sourceUnit) {
    throw new Error("Could not find Streetcar or Modern Drama item in imsmanifest.xml.");
  }

  const lessons: ModernDramaLesson[] = [];
  for (const [index, element] of sourceLessonItems($, sourceUnit.item, resources).entries()) {
    const identifier = $(element).attr("identifierref") ?? "";
    const sourceHref = resources.get(identifier);
    if (!sourceHref) {
      continue;
    }
    const title = directChildText($, element, "title") || `Lesson ${index + 1}`;
    const sourceKind = sourceKindForPath(sourceHref);
    const cleaned =
      sourceKind === "html"
        ? cleanSourceContentHtml(await readZipText(zip, sourceHref), sourceHref, zipEntries)
        : buildDocumentLesson(title, sourceHref, sourceKind);
    lessons.push({
      id: toSafeId(title),
      sequence: index + 1,
      title,
      sourceKind,
      sourceHref,
      contentHtml: cleaned.contentHtml,
      text: cleaned.text,
      images: cleaned.images,
      videos: cleaned.videos,
      links: cleaned.links,
      document: cleaned.document
    });
  }

  const localResources = lessons.flatMap((lesson) => lesson.links.filter((link) => link.kind === "local"));
  return {
    title: sourceUnit.target.canonicalTitle,
    lessons,
    localResources
  };
}

function uniqueBy<T>(items: T[], keyFor: (item: T) => string) {
  const seen = new Set<string>();
  const results: T[] = [];
  for (const item of items) {
    const key = keyFor(item);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    results.push(item);
  }
  return results;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function scriptJson(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function truncate(value: string, length: number) {
  if (value.length <= length) {
    return value;
  }
  return `${value.slice(0, length - 1).trim()}...`;
}

function lessonSummary(lesson: ModernDramaLesson) {
  return truncate(lesson.text.replace(new RegExp(`^${lesson.title}\\s*`, "i"), ""), 180);
}

type UnitDocumentItem = {
  id: string;
  title: string;
  sourceTitle: string;
  workspaceHref: string;
  zipPath: string;
  kind: Exclude<ModernDramaSourceKind, "html">;
};

type UnitVideoItem = ModernDramaVideo & {
  id: string;
  sourceTitle: string;
};

type ExternalResourceItem = ModernDramaLink & {
  sourceTitle: string;
};

function linkSourceKind(link: ModernDramaLink) {
  return sourceKindForPath(link.zipPath ?? link.workspaceHref ?? link.href);
}

function isLocalDocumentLink(link: ModernDramaLink) {
  if (link.kind !== "local") {
    return false;
  }
  return linkSourceKind(link) !== "html" || sourceKindForPath(link.workspaceHref) !== "html";
}

function unitDocuments(unit: ModernDramaUnit) {
  const documents: UnitDocumentItem[] = [];
  for (const lesson of unit.lessons) {
    if (lesson.document) {
      documents.push({
        id: `document-${toSafeId(`${lesson.id}-${lesson.document.workspaceHref}`)}`,
        title: lesson.document.title,
        sourceTitle: lesson.title,
        workspaceHref: lesson.document.workspaceHref,
        zipPath: lesson.document.zipPath,
        kind: lesson.document.kind
      });
    }

    for (const link of lesson.links.filter(isLocalDocumentLink)) {
      const kind = linkSourceKind(link);
      documents.push({
        id: `document-${toSafeId(`${lesson.id}-${link.workspaceHref}`)}`,
        title: link.text.replace(/^Open\s+/i, "") || path.posix.basename(link.workspaceHref),
        sourceTitle: lesson.title,
        workspaceHref: link.workspaceHref,
        zipPath: link.zipPath ?? link.href,
        kind: kind === "html" ? "other" : kind
      });
    }
  }
  return uniqueBy(documents, (document) => document.workspaceHref);
}

function unitVideos(unit: ModernDramaUnit) {
  const videos: UnitVideoItem[] = [];
  const seen = new Set<string>();
  for (const lesson of unit.lessons) {
    for (const video of lesson.videos) {
      if (seen.has(video.embedSrc)) {
        continue;
      }
      seen.add(video.embedSrc);
      const displayTitle = videoDisplayTitle(video, lesson.title);
      videos.push({
        ...video,
        title: displayTitle,
        id: `film-${videos.length + 1}-${toSafeId(displayTitle)}`,
        sourceTitle: lesson.title
      });
    }
  }
  return videos;
}

function videoDisplayTitle(video: ModernDramaVideo, sourceTitle: string) {
  const title = normalizeWhitespace(video.title);
  if (!title || /^embedded video$/i.test(title) || /^video$/i.test(title)) {
    return sourceTitle;
  }
  return title;
}

function unitExternalResources(unit: ModernDramaUnit) {
  const links: ExternalResourceItem[] = [];
  for (const lesson of unit.lessons) {
    for (const link of lesson.links) {
      if (link.kind !== "external" || normalizeVideoEmbedSrc(link.href) || normalizeVideoEmbedSrc(link.workspaceHref)) {
        continue;
      }
      links.push({ ...link, sourceTitle: lesson.title });
    }
  }
  return uniqueBy(links, (link) => `${link.kind}:${link.href}`);
}

function buildSourceIndexHtml(unit: ModernDramaUnit) {
  const rows = unit.lessons
    .map((lesson) => `<li><strong>${escapeHtml(lesson.title)}</strong><br><code>${escapeHtml(lesson.sourceHref)}</code></li>`)
    .join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(COURSE_TITLE)} - ${escapeHtml(unit.title)} Source Index</title>
</head>
<body>
  <h1>${escapeHtml(COURSE_TITLE)} - ${escapeHtml(unit.title)} Source Index</h1>
  <p>This raw index preserves the imported Brightspace unit structure. Edit the workspace copy, not this raw baseline.</p>
  <ol>
${rows}
  </ol>
</body>
</html>
`;
}

function buildStyleGuide() {
  return `# Style Guide

## Runtime Shape
- Single-file HTML workspace adapted from the FinLit frame.
- Tailwind CDN, Google fonts, and Material Symbols stay external for authoring speed.
- Source Brightspace HTML is cleaned and placed inside route-based lesson panels.

## Visual Signals
- Preserve the FinLit dark sidebar, fixed top bar, white content canvas, and green accent system.
- Use source imagery only where it clarifies the active unit; avoid decorative filler.
- Keep cards compact, readable, and export-safe for Brightspace integration.

## Interaction Notes
- Hash routes drive Overview, Lessons, Writing Studio, Library, Film Room, and Resources.
- Library collects local PDFs/documents, Film Room collects normalized videos, and Resources is reserved for external non-video links.
- Lesson completion uses localStorage for local preview only.
- Sidebar collapse should not change the active route.

## Editing Guidance
- Canonical editable source: workspace/index.html.
- Raw and resources folders are reference-only intake material.
- Regenerate with the command in project.json when starting a fresh frame from the same ZIP.
`;
}

function buildContentOutline(unit: ModernDramaUnit) {
  const lines = unit.lessons.map((lesson) => `- ${lesson.title}: ${lessonSummary(lesson)}`).join("\n");
  return `# Content Outline

- Project: ela30-1-modern-drama
- Course: ${COURSE_TITLE}
- Source unit: ${unit.title}

## Lessons
${lines}
`;
}

function buildImportLog(zipPath: string, unit: ModernDramaUnit) {
  return `# Import Log

- Imported from: ${zipPath}
- Source system: Brightspace / D2L export
- Active manifest unit: ${unit.title}
- Lessons imported: ${unit.lessons.length}
- Local source images copied into workspace/assets/source.
- Local source documents copied into workspace/assets/source and surfaced in the Library route.
- YouTube iframes and links normalized into lesson embeds and the Film Room route where present.
- External non-video links surfaced as resource cards in the Resources route.
- Local supplementary HTML links copied into workspace/resources.
- Source HTML encoding: UTF-16 Brightspace HTML decoded during generation.
`;
}

function buildReferenceIndex(slug: string, unit: ModernDramaUnit) {
  const references = unit.lessons.map((lesson) => ({
    id: toSafeId(lesson.title),
    originalPath: lesson.sourceHref,
    projectId: slug,
    kind: lesson.sourceKind as ReferenceKind,
    relativePath: lesson.sourceHref,
    titleGuess: lesson.title,
    extractionStatus: lesson.sourceKind === "html" ? "indexed" as const : "stored-only" as const,
    extractionMethod: lesson.sourceKind === "html" ? "native" as const : undefined,
    extractedTextPath: path.join(getProjectPaths(slug).resourceExtractedDir, `${toSafeId(lesson.title)}.txt`),
    sectionLabels: [lesson.title]
  }));

  return {
    projectId: slug,
    generatedAt: new Date().toISOString(),
    references,
    warnings: []
  };
}

function buildResourceCatalog(slug: string, unit: ModernDramaUnit): { generatedAt: string; projectId: string; resources: ResourceCatalogEntry[]; warnings: string[] } {
  const resources: ResourceCatalogEntry[] = unit.lessons.map((lesson) => ({
    id: toSafeId(lesson.title),
    projectId: slug,
    kind: lesson.sourceKind,
    relativePath: lesson.sourceHref,
    absolutePath: path.join(getProjectPaths(slug).resourceDir, ...lesson.sourceHref.split("/")),
    originalPath: lesson.sourceHref,
    titleGuess: lesson.title,
    extractionStatus: lesson.sourceKind === "html" ? "indexed" : "stored-only",
    extractionMethod: lesson.sourceKind === "html" ? "native" : undefined,
    extractedTextPath: path.join(getProjectPaths(slug).resourceExtractedDir, `${toSafeId(lesson.title)}.txt`),
    extractionIssue: undefined,
    chunkCount: 1,
    resourceCategory: lesson.title.toLowerCase().includes("response") || lesson.title.toLowerCase().includes("samples")
      ? "assessment"
      : "textbook",
    authorityRole: lesson.title.toLowerCase().includes("response") || lesson.title.toLowerCase().includes("samples")
      ? "assessment-authoritative"
      : "supporting-only",
    sectionLabels: [lesson.title],
    keywordHints: [],
    blueprintSignals: [],
    assessmentSignals: lesson.title.toLowerCase().includes("response") || lesson.title.toLowerCase().includes("samples")
      ? ["critical analytical response"]
      : [],
    supportSignals: lesson.videos.length > 0 ? ["embedded video"] : []
  }));

  return {
    generatedAt: new Date().toISOString(),
    projectId: slug,
    resources,
    warnings: []
  };
}

export function buildProjectManifest(options: {
  slug: string;
  zipPath: string;
  generatedAt: string;
}): ProjectManifest {
  const paths = getProjectPaths(options.slug);
  return {
    id: options.slug,
    slug: options.slug,
    sourcePath: options.zipPath,
    inputKind: "html",
    brightspaceTarget: "course-page",
    previewModes: ["raw", "workspace"],
    workspaceEntrypoint: paths.workspaceEntrypoint,
    rawEntrypoint: paths.rawEntrypoint,
    createdAt: options.generatedAt,
    updatedAt: options.generatedAt,
    learningSource: "other",
    learningTrust: "auto",
    learningUpdatedAt: options.generatedAt,
    migrationState: "migrated",
    projectType: "conversion",
    preferredWorkflows: ["conversion", "injection/integration"],
    canonicalEntry: paths.workspaceEntrypoint,
    canonicalSources: [paths.workspaceEntrypoint],
    generatedOutputs: [],
    regenerateCommand: `npx tsx scripts/build-ela-modern-drama.ts --zip "${options.zipPath}" --slug ${options.slug} --force`,
    injectedComponents: [
    {
      id: "critical-response-workshop",
      source: CRITICAL_RESPONSE_ACTIVITY_SOURCE,
      target: `projects/${options.slug}/workspace/index.html#writing`,
      status: "active",
      notes: "Converted from the external TSX activity into the static Writing Studio shell."
    },
    {
      id: "thesis-builder-workshop",
      source: THESIS_BUILDER_ACTIVITY_SOURCE,
      target: `projects/${options.slug}/workspace/index.html#writing`,
      status: "active",
      notes: "Converted from the external thesis builder TSX into the static Thesis Workshop panel."
    }
  ],
    importedFirstPassOrigin: {
      sourceSystem: "brightspace",
      sourcePath: options.zipPath,
      importedAt: options.generatedAt,
      notes: "D2L/Brightspace Streetcar unit extracted into a FinLit-style master lesson frame."
    },
    exportTargets: [
      {
        target: "brightspace",
        enabled: true,
        notes: "Authoring frame intended for Brightspace lesson integration."
      },
      {
        target: "html",
        enabled: true,
        notes: "Standalone HTML preview for shaping the repeatable master lesson process."
      }
    ],
    authoringStatus: "active",
    referenceOnly: [
      paths.rawEntrypoint,
      paths.resourceDir
    ],
    sourceOfTruthNotes:
      "Edit workspace/index.html as the canonical master lesson frame. Treat raw and resources as imported reference material."
  };
}

function renderLessonCards(unit: ModernDramaUnit) {
  return unit.lessons
    .map((lesson) => {
      const badge = lesson.sequence === 1 ? "Intro" : `Lesson ${lesson.sequence - 1}`;
      return `<a class="lesson-card block text-left bg-surface border border-surface-muted rounded-lg p-md transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40" href="#${lesson.id}" data-page-target="${lesson.id}">
        <span class="font-caption text-caption text-primary">${escapeHtml(badge)}</span>
        <strong class="block font-label-md text-label-md text-on-surface mt-1">${escapeHtml(lesson.title)}</strong>
        <span class="block font-caption text-caption text-on-surface-variant mt-2">${escapeHtml(lessonSummary(lesson))}</span>
      </a>`;
    })
    .join("\n");
}

function renderEmbeddedVideo(video: ModernDramaVideo) {
  return `<article class="source-video-card">
    <iframe class="source-video-frame" src="${escapeHtml(video.embedSrc)}" title="${escapeHtml(video.title)}" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    <div class="source-video-meta">
      <strong>${escapeHtml(video.title)}</strong>
      <a href="${escapeHtml(video.originalSrc)}" target="_blank" rel="noopener noreferrer">Open source video</a>
    </div>
  </article>`;
}

function renderLessonLinkedVideos(lesson: ModernDramaLesson) {
  const videos = uniqueBy(lesson.videos.filter((video) => video.origin === "link"), (video) => video.embedSrc);
  if (videos.length === 0) {
    return "";
  }
  return `<section class="embedded-video-section" aria-label="Embedded lesson videos">
    ${videos.map(renderEmbeddedVideo).join("\n")}
  </section>`;
}

function renderLibrary(unit: ModernDramaUnit) {
  const documents = unitDocuments(unit);
  if (documents.length === 0) {
    return `<article class="empty-route-card">
      <span class="material-symbols-outlined" aria-hidden="true">library_books</span>
      <h3>No PDFs loaded yet</h3>
      <p>PDFs and local source documents from the Brightspace export will appear here when this unit includes them.</p>
    </article>`;
  }

  const tabs = documents
    .map((document, index) => `<button class="library-doc-tab${index === 0 ? " active" : ""}" type="button" data-library-doc-target="${escapeHtml(document.id)}" aria-pressed="${index === 0}">
      <span class="library-doc-index">${String(index + 1).padStart(2, "0")}</span>
      <span>
        <strong>${escapeHtml(document.title)}</strong>
        <small>${escapeHtml(document.kind.toUpperCase())}</small>
      </span>
    </button>`)
    .join("\n");
  const panels = documents
    .map((document, index) => {
      const isPdf = document.kind === "pdf";
      const openLabel = isPdf ? "Open PDF" : "Open File";
      const downloadLabel = isPdf ? "Download PDF" : "Download File";
      const frame = isPdf
        ? `<iframe class="library-document-frame" src="${escapeHtml(document.workspaceHref)}" title="${escapeHtml(document.title)}"></iframe>`
        : `<div class="library-file-fallback">
            <p>This local source file is available to open in a new browser tab.</p>
            <a class="external-resource-action" href="${escapeHtml(document.workspaceHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(openLabel)}</a>
          </div>`;
      return `<article class="library-reader-panel" data-library-doc-panel="${escapeHtml(document.id)}"${index === 0 ? "" : " hidden"}>
        <div class="library-reader-header">
          <div>
            <span class="resource-kicker">${escapeHtml(document.kind.toUpperCase())} Source</span>
            <h3>${escapeHtml(document.title)}</h3>
            <p>Source lesson: ${escapeHtml(document.sourceTitle)}</p>
          </div>
          <div class="library-actions">
            <a href="${escapeHtml(document.workspaceHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(openLabel)}</a>
            <a href="${escapeHtml(document.workspaceHref)}" download>${escapeHtml(downloadLabel)}</a>
          </div>
        </div>
        ${frame}
      </article>`;
    })
    .join("\n");

  return `<div class="library-browser">
    <aside class="library-list-panel">
      <span class="resource-kicker">Library</span>
      <h3>${documents.length} local ${documents.length === 1 ? "document" : "documents"}</h3>
      <p>PDFs are collected here so Resources can stay focused on external reading links.</p>
      <div class="library-doc-list">${tabs}</div>
    </aside>
    <div class="library-reader-stack">${panels}</div>
  </div>`;
}

function renderFilmRoom(unit: ModernDramaUnit) {
  const videos = unitVideos(unit);
  if (videos.length === 0) {
    return `<article class="empty-route-card">
      <span class="material-symbols-outlined" aria-hidden="true">movie</span>
      <h3>No videos loaded yet</h3>
      <p>Embedded video links from imported lessons will appear here as a dedicated film room.</p>
    </article>`;
  }

  const panels = videos
    .map((video, index) => `<article class="film-panel" data-film-panel="${escapeHtml(video.id)}"${index === 0 ? "" : " hidden"}>
      <iframe class="film-room-frame" src="${escapeHtml(video.embedSrc)}" title="${escapeHtml(video.title)}" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </article>`)
    .join("\n");
  const playlist = videos
    .map((video, index) => `<option value="${escapeHtml(video.id)}"${index === 0 ? " selected" : ""}>${escapeHtml(video.title)}</option>`)
    .join("\n");
  const nowLoaded = videos
    .map((video, index) => `<article class="film-now-panel" data-film-now-panel="${escapeHtml(video.id)}"${index === 0 ? "" : " hidden"}>
        <span class="resource-kicker">Now loaded</span>
        <h3>${escapeHtml(video.title)}</h3>
        <p class="film-now-source">${escapeHtml(video.sourceTitle)}</p>
        <p>Media resource from ${escapeHtml(video.sourceTitle)}.</p>
        <div class="film-now-footer">
          <span class="resource-kicker">Embedded Source</span>
          <span class="film-now-count">${index + 1} / ${videos.length}</span>
        </div>
        <a class="film-source-link" href="${escapeHtml(video.originalSrc)}" target="_blank" rel="noopener noreferrer">Open Source</a>
      </article>`)
    .join("\n");

  return `<div class="film-room-shell">
    <div class="film-room-stage">
      <div class="film-room-header">
        <span class="resource-kicker">Film Room</span>
        <h3>${videos.length} embedded ${videos.length === 1 ? "video" : "videos"}</h3>
      </div>
      ${panels}
    </div>
    <aside class="film-room-sidebar">
      <article class="film-room-control-panel">
        <span class="resource-kicker">Video Catalog</span>
        <h3>Load a video</h3>
        <p>Use the playlist to switch videos without leaving the course shell.</p>
        <label class="film-room-label" for="film-room-select">Playlist</label>
        <select id="film-room-select" class="film-room-select" data-film-select>
          ${playlist}
        </select>
      </article>
      <div class="film-now-stack">${nowLoaded}</div>
    </aside>
  </div>`;
}

function renderLessonPanels(unit: ModernDramaUnit) {
  return unit.lessons
    .map((lesson, index) => {
      const label = lesson.sequence === 1 ? "Unit Introduction" : `Lesson ${lesson.sequence - 1}`;
      const prev = unit.lessons[index - 1];
      const next = unit.lessons[index + 1];
      const links = uniqueBy(lesson.links, (link) => `${link.kind}:${link.href}`);
      const resourceList = links.length
        ? `<aside class="lesson-resources bg-surface border border-surface-muted rounded-lg p-md">
            <h3 class="font-headline-md text-headline-md text-on-surface mb-sm">Source Links</h3>
            <ul class="space-y-2">${links
              .map((link) => `<li><a class="source-link" href="${escapeHtml(link.workspaceHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.text)}</a></li>`)
              .join("")}</ul>
          </aside>`
        : "";
      return `<section id="${lesson.id}" class="course-page" data-page="${lesson.id}" hidden>
        <article class="lesson-detail-panel bg-surface-container-low border border-surface-muted rounded-lg p-lg relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-primary-container"></div>
          <span class="font-label-md text-label-md text-secondary">${escapeHtml(COURSE_TITLE)} | ${escapeHtml(label)}</span>
          <div class="flex flex-wrap items-start justify-between gap-md mt-sm mb-md">
            <div>
              <h2 class="font-headline-lg text-headline-lg text-on-surface">${escapeHtml(lesson.title)}</h2>
              <p class="font-body-md text-body-md text-on-surface-variant mt-xs max-w-3xl">${escapeHtml(lessonSummary(lesson))}</p>
            </div>
            <button class="mark-complete inline-flex min-h-11 items-center rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-white hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-primary/40" type="button" data-complete-id="${lesson.id}">Mark Complete</button>
          </div>
          <div class="lesson-layout">
            <div class="source-content">${lesson.contentHtml}${renderLessonLinkedVideos(lesson)}</div>
            ${resourceList}
          </div>
          <div class="flex flex-wrap gap-sm mt-lg pt-md border-t border-surface-muted">
            ${prev ? `<a class="lesson-jump" href="#${prev.id}" data-page-target="${prev.id}">Previous</a>` : `<a class="lesson-jump" href="#lessons" data-page-target="lessons">Lesson Library</a>`}
            ${next ? `<a class="lesson-jump primary" href="#${next.id}" data-page-target="${next.id}">Next Lesson</a>` : `<a class="lesson-jump primary" href="#writing" data-page-target="writing">Open Writing Studio</a>`}
          </div>
        </article>
      </section>`;
    })
    .join("\n");
}

function renderSidebar(unit: ModernDramaUnit) {
  const lessons = unit.lessons
    .map((lesson) => {
      const label = lesson.sequence === 1 ? "Intro" : `${lesson.sequence - 1}`;
      return `<a class="sublesson-link block rounded-lg px-3 py-2 font-caption text-caption text-surface-variant hover:bg-white/5 hover:text-white" href="#${lesson.id}" data-page-target="${lesson.id}">${label}. ${escapeHtml(lesson.title.replace(/^Lesson \d+:\s*/i, ""))}</a>`;
    })
    .join("\n");
  return `<nav class="flex-1 px-sm pb-lg space-y-1">
    <a class="course-nav-link active flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#overview" data-page-target="overview"><span class="material-symbols-outlined" aria-hidden="true">dashboard</span><span class="sidebar-label">Overview</span></a>
    <div class="lessons-nav" data-lessons-nav>
      <a class="course-nav-link lessons-toggle flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#lessons" data-page-target="lessons" data-lessons-toggle aria-expanded="false" aria-controls="lesson-subnav"><span class="material-symbols-outlined" aria-hidden="true">menu_book</span><span class="sidebar-label">Lessons</span><span class="material-symbols-outlined lessons-toggle-icon ml-auto" aria-hidden="true">expand_more</span></a>
      <div id="lesson-subnav" class="lesson-subnav ml-12 mr-3 mt-1 space-y-1">${lessons}</div>
    </div>
    <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#writing" data-page-target="writing"><span class="material-symbols-outlined" aria-hidden="true">edit_note</span><span class="sidebar-label">Writing Studio</span></a>
    <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#library" data-page-target="library"><span class="material-symbols-outlined" aria-hidden="true">local_library</span><span class="sidebar-label">Library</span></a>
    <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#film-room" data-page-target="film-room"><span class="material-symbols-outlined" aria-hidden="true">live_tv</span><span class="sidebar-label">Film Room</span></a>
    <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#resources" data-page-target="resources"><span class="material-symbols-outlined" aria-hidden="true">folder_open</span><span class="sidebar-label">Resources</span></a>
  </nav>`;
}

function renderExternalResources(unit: ModernDramaUnit) {
  const links = unitExternalResources(unit);
  if (links.length === 0) {
    return `<article class="empty-route-card">
      <span class="material-symbols-outlined" aria-hidden="true">travel_explore</span>
      <h3>No external sources loaded yet</h3>
      <p>External non-video links from the imported unit will appear here as resource cards.</p>
    </article>`;
  }
  return `<div class="external-resource-grid">${links
    .map((link) => `<article class="external-resource-card">
      <span class="resource-kicker">External Source</span>
      <h3>${escapeHtml(link.text)}</h3>
      <p>Captured from ${escapeHtml(link.sourceTitle)}. Use this as a supporting source or review stop.</p>
      <a class="external-resource-action" href="${escapeHtml(link.workspaceHref)}" target="_blank" rel="noopener noreferrer">Open Resource</a>
    </article>`)
    .join("\n")}</div>`;
}

function renderWritingStudio() {
  const writingTabs = [
    {
      id: "textKnowledge",
      title: "Text Knowledge",
      icon: "menu_book",
      description: "Practice the Streetcar text, thesis-control concepts, and evidence-quality decisions in one organized question bank."
    },
    {
      id: "thesisControl",
      title: "Thesis Workshop",
      icon: "edit_note",
      description: THESIS_BUILDER_ACTIVITY.description
    }
  ];
  const firstQuestionGroup = CRITICAL_RESPONSE_WORKSHOPS[0];
  const tabs = writingTabs.map((workshop, index) => {
    const active = index === 0;
    return `<button class="critical-response-tab${active ? " active" : ""}" type="button" role="tab" aria-selected="${active ? "true" : "false"}" data-workshop-tab="${escapeHtml(workshop.id)}">
      <span class="material-symbols-outlined critical-response-tab-icon" aria-hidden="true">${escapeHtml(workshop.icon)}</span>
      <strong>${escapeHtml(workshop.title)}</strong>
      <span>${escapeHtml(workshop.description)}</span>
    </button>`;
  }).join("\n");
  const questionGroups = CRITICAL_RESPONSE_WORKSHOPS.map((group, index) => {
    const active = index === 0;
    return `<button class="critical-response-group-tab${active ? " active" : ""}" type="button" aria-pressed="${active ? "true" : "false"}" data-question-group-tab="${escapeHtml(group.id)}">
      <span class="material-symbols-outlined" aria-hidden="true">${escapeHtml(group.icon)}</span>
      <span>${escapeHtml(group.title)}</span>
      <small>${group.steps.length} questions</small>
    </button>`;
  }).join("\n");

  return `<div class="max-w-6xl">
        <p class="font-label-md text-label-md text-secondary">${COURSE_TITLE} | Writing Studio</p>
        <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs mb-md">Critical/Analytical Response Workspace</h2>
        <div class="critical-response-activity" data-critical-response-activity>
          <div class="critical-response-tabs" role="tablist" aria-label="Critical response workshop tracks">
            ${tabs}
          </div>
          <div class="critical-response-workshop-shell">
            <div class="critical-response-workshop-header">
              <div>
                <h3 data-workshop-heading>Text Knowledge Question Bank: A Streetcar Named Desire</h3>
                <p data-workshop-description>All current critical response questions are grouped here so students can stay in the text-knowledge lane before moving into thesis drafting.</p>
              </div>
              <div class="critical-response-status" aria-live="polite">
                <span data-workshop-step-count>Step 1 of ${firstQuestionGroup?.steps.length ?? 0}</span>
                <span data-workshop-score>0 correct</span>
              </div>
            </div>
            <div class="critical-response-progress-track" aria-hidden="true">
              <div class="critical-response-progress-fill" data-workshop-progress-fill></div>
            </div>
            <div class="critical-response-group-tabs" data-question-group-tabs>
              ${questionGroups}
            </div>
            <div class="critical-response-panel" data-workshop-panel></div>
          </div>
        </div>
      </div>`;
}

function firstUnitImage(unit: ModernDramaUnit) {
  return unit.lessons.flatMap((lesson) => lesson.images)[0]?.workspaceSrc ?? "";
}

export function buildWorkspaceHtml(unit: ModernDramaUnit) {
  const totalLessons = unit.lessons.length;
  const mainImage = firstUnitImage(unit);
  const imageMarkup = mainImage
    ? `<img alt="${escapeHtml(unit.title)} visual reference" class="w-full h-full object-cover" src="${mainImage}">`
    : `<div class="w-full h-full bg-primary-container"></div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>${COURSE_TITLE} - ${escapeHtml(unit.title)}</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700;800&amp;family=IBM+Plex+Sans:wght@600&amp;family=Work+Sans:wght@400;600&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<script id="tailwind-config">
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: "#154212",
        "primary-container": "#2d5a27",
        "primary-fixed": "#bcf0ae",
        "surface-muted": "#F1F3F4",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f4f5",
        "surface-container": "#edeeef",
        "surface": "#f8f9fa",
        "surface-variant": "#e1e3e4",
        "surface-dim": "#d9dadb",
        "on-surface": "#191c1d",
        "on-surface-variant": "#42493e",
        "secondary": "#5d5e61",
        "ink-dark": "#1A1C1E",
        "outline-variant": "#c2c9bb"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.5rem",
        full: "999px"
      },
      spacing: {
        xs: "8px",
        sm: "16px",
        md: "24px",
        lg: "40px",
        xl: "64px"
      },
      fontFamily: {
        "body-md": ["Work Sans"],
        "headline-lg": ["Hanken Grotesk"],
        "headline-md": ["Hanken Grotesk"],
        "display-lg": ["Hanken Grotesk"],
        "label-md": ["IBM Plex Sans"],
        caption: ["Work Sans"]
      },
      fontSize: {
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "headline-lg": ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "700" }],
        "display-lg": ["48px", { lineHeight: "1.1", fontWeight: "800" }],
        "label-md": ["14px", { lineHeight: "1.4", fontWeight: "600" }],
        caption: ["12px", { lineHeight: "1.4", fontWeight: "500" }]
      }
    }
  }
}
</script>
<style>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
.course-topbar { min-height: 72px; display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; padding: 10px 24px; position: fixed; }
.topbar-logo-link { grid-column: 2; display: inline-flex; min-height: 44px; align-items: center; justify-content: center; justify-self: center; }
.next-step-logo { display: block; width: auto; max-width: 240px; height: 44px; object-fit: contain; }
.top-progress-shell { position: absolute; right: 24px; top: 16px; width: min(320px, 30vw); display: flex; flex-direction: column; gap: 5px; color: #e1e3e4; }
.top-progress-meta { display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center; font-family: "IBM Plex Sans"; font-size: 11px; line-height: 1.4; text-transform: uppercase; }
.top-progress-meta strong { color: #bcf0ae; }
.top-progress-bar { height: 10px; border: 1px solid #2d5a27; border-radius: 8px; background: repeating-linear-gradient(45deg, rgba(188,240,174,0.12) 0 6px, rgba(188,240,174,0.04) 6px 12px), #0f1710; overflow: hidden; }
.top-progress-fill { width: 0%; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #bcf0ae, #2d5a27); transition: width 180ms ease; }
.course-main { padding-top: 72px !important; }
.course-sidebar, .course-main, .sidebar-label { transition: width 180ms ease, margin-left 180ms ease, opacity 140ms ease; }
.course-sidebar { top: 72px !important; }
.course-sidebar .sidebar-header { position: relative; padding-right: 76px; }
.sidebar-toggle-button { position: absolute; top: 16px; right: 16px; min-height: 44px; min-width: 44px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; color: #fff; }
.sidebar-toggle-button:hover, .sidebar-toggle-button:focus-visible { background: rgba(255,255,255,0.1); outline: none; }
.course-nav-link { color: #e1e3e4; }
.course-nav-link:hover, .course-nav-link.active { background: rgba(255,255,255,0.1); color: #fff; }
.lesson-subnav { display: none; }
.lessons-nav.is-open .lesson-subnav { display: block; }
.lessons-toggle-icon { font-size: 20px; transition: transform 160ms ease; }
.lessons-nav.is-open .lessons-toggle-icon { transform: rotate(180deg); }
.course-page[hidden], .lesson-detail-panel[hidden] { display: none !important; }
body.sidebar-collapsed .course-sidebar { width: 80px; }
body.sidebar-collapsed .course-main { margin-left: 80px; }
body.sidebar-collapsed .sidebar-label, body.sidebar-collapsed .sidebar-title, body.sidebar-collapsed .sidebar-course-label, body.sidebar-collapsed .lesson-subnav, body.sidebar-collapsed .lessons-toggle-icon { display: none; }
body.sidebar-collapsed .sidebar-header { display: flex; justify-content: center; padding: 16px 8px 12px; }
body.sidebar-collapsed .sidebar-toggle-button { position: static; }
body.sidebar-collapsed .course-nav-link { justify-content: center; }
.lesson-card:hover, .lesson-card:focus-visible { border-color: #2d5a27; background: #f3f7f1; }
.lesson-layout { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 24px; align-items: start; }
.source-content { color: #191c1d; font-family: "Work Sans"; font-size: 16px; line-height: 1.65; }
.source-content h1 { font-family: "Hanken Grotesk"; font-size: 28px; line-height: 1.2; font-weight: 800; margin: 0 0 16px; }
.source-content h2, .source-content h3 { font-family: "Hanken Grotesk"; font-size: 22px; line-height: 1.25; font-weight: 700; margin: 28px 0 12px; }
.source-content p { margin: 0 0 16px; max-width: 74ch; }
.source-content ul, .source-content ol { margin: 0 0 16px 22px; max-width: 74ch; }
.source-content li { margin: 8px 0; }
.source-content a, .source-link { color: #154212; text-decoration: underline; text-underline-offset: 3px; }
.source-image { display: block; width: min(100%, 680px); max-height: 360px; object-fit: cover; border-radius: 8px; border: 1px solid #e1e3e4; margin: 18px 0; }
.source-video-frame { display: block; width: min(100%, 760px); aspect-ratio: 16 / 9; min-height: 220px; height: auto; border: 1px solid #d9dadb; border-radius: 8px; background: #000; margin: 18px 0; }
.source-document-frame { display: block; width: min(100%, 760px); height: 620px; border: 1px solid #d9dadb; border-radius: 8px; background: #fff; margin: 18px 0; }
.embedded-video-section { margin-top: 24px; max-width: 760px; }
.source-video-card { border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; padding: 12px; }
.source-video-card .source-video-frame { width: 100%; margin: 0; min-height: 220px; }
.source-video-meta { display: flex; flex-direction: column; gap: 4px; padding-top: 10px; }
.source-video-meta strong { font-family: "Hanken Grotesk"; font-size: 17px; line-height: 1.3; color: #191c1d; }
.source-video-meta a { font-family: "IBM Plex Sans"; font-size: 14px; color: #154212; text-decoration: underline; text-underline-offset: 3px; }
.resource-kicker { display: block; font-family: "IBM Plex Sans"; font-size: 12px; line-height: 1.4; font-weight: 600; color: #154212; text-transform: uppercase; letter-spacing: 0; }
.external-resource-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
.external-resource-card, .empty-route-card { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; min-height: 190px; border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; padding: 18px; color: #191c1d; }
.external-resource-card h3, .empty-route-card h3 { font-family: "Hanken Grotesk"; font-size: 20px; line-height: 1.25; font-weight: 800; margin: 0; }
.external-resource-card p, .empty-route-card p { color: #42493e; font-size: 14px; line-height: 1.5; margin: 0; }
.external-resource-action, .library-actions a, .film-source-link { min-height: 42px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid #154212; border-radius: 8px; background: #154212; color: #fff; padding: 9px 14px; font-family: "IBM Plex Sans"; font-size: 14px; text-decoration: none; }
.external-resource-action:hover, .external-resource-action:focus-visible, .library-actions a:hover, .library-actions a:focus-visible, .film-source-link:hover, .film-source-link:focus-visible { background: #2d5a27; border-color: #2d5a27; color: #fff; outline: none; }
.library-browser { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 24px; align-items: start; }
.library-list-panel, .library-reader-panel, .film-room-stage, .film-room-control-panel, .film-now-panel { border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; }
.library-list-panel { padding: 18px; }
.library-list-panel h3, .library-reader-header h3, .film-room-header h3, .film-room-control-panel h3, .film-now-panel h3 { font-family: "Hanken Grotesk"; font-size: 24px; line-height: 1.2; font-weight: 800; margin: 6px 0 8px; color: #191c1d; }
.library-list-panel p, .library-reader-header p { color: #42493e; font-size: 14px; line-height: 1.5; margin: 0; }
.library-doc-list { display: flex; flex-direction: column; gap: 10px; margin-top: 18px; }
.library-doc-tab { width: 100%; min-height: 70px; display: grid; grid-template-columns: 42px minmax(0, 1fr); gap: 12px; align-items: center; border: 1px solid #e1e3e4; border-radius: 8px; background: #f8f9fa; color: #191c1d; padding: 12px; text-align: left; }
.library-doc-tab:hover, .library-doc-tab:focus-visible, .library-doc-tab.active { border-color: #2d5a27; background: #f3f7f1; outline: none; }
.library-doc-tab strong { display: block; overflow-wrap: anywhere; font-family: "Hanken Grotesk"; font-size: 16px; line-height: 1.25; }
.library-doc-tab small { display: block; color: #42493e; font-size: 12px; line-height: 1.3; margin-top: 4px; }
.library-doc-index { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; background: #154212; color: #fff; font-family: "IBM Plex Sans"; font-size: 13px; }
.library-reader-panel { padding: 18px; }
.library-reader-panel[hidden], .film-panel[hidden], .film-now-panel[hidden] { display: none !important; }
.library-reader-header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 16px; }
.library-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
.library-document-frame { display: block; width: 100%; height: min(68vh, 680px); min-height: 520px; border: 1px solid #d9dadb; border-radius: 8px; background: #fff; }
.library-file-fallback { border: 1px dashed #c2c9bb; border-radius: 8px; background: #f8f9fa; padding: 24px; }
.film-room-shell { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 24px; align-items: start; }
.film-room-stage { padding: 18px; background: #f8f9fa; }
.film-room-header { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.film-room-frame { display: block; width: 100%; aspect-ratio: 16 / 9; min-height: 360px; border: 1px solid #191c1d; border-radius: 8px; background: #000; }
.film-room-sidebar { display: flex; flex-direction: column; gap: 16px; }
.film-room-control-panel, .film-now-panel { padding: 18px; }
.film-room-control-panel p, .film-now-panel p { color: #42493e; font-size: 14px; line-height: 1.5; margin: 0 0 14px; }
.film-room-label { display: block; margin: 18px 0 8px; font-family: "IBM Plex Sans"; font-size: 13px; line-height: 1.4; font-weight: 600; color: #154212; }
.film-room-select { width: 100%; min-height: 46px; border: 1px solid #c2c9bb; border-radius: 8px; background: #fff; color: #191c1d; padding: 9px 12px; font-family: "Work Sans"; font-size: 15px; line-height: 1.4; }
.film-room-select:focus { border-color: #154212; outline: 2px solid rgba(21, 66, 18, 0.22); outline-offset: 2px; }
.film-now-stack { display: flex; flex-direction: column; gap: 16px; }
.film-now-source { font-family: "IBM Plex Sans"; font-weight: 600; color: #191c1d !important; }
.film-now-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 18px 0 12px; }
.film-now-count { font-family: "IBM Plex Sans"; font-size: 13px; color: #154212; }
.lesson-jump { min-height: 44px; display: inline-flex; align-items: center; border: 1px solid #e1e3e4; border-radius: 8px; padding: 8px 14px; font-family: "IBM Plex Sans"; font-size: 14px; color: #191c1d; background: #fff; }
.lesson-jump.primary { background: #154212; color: #fff; border-color: #154212; }
.resource-card { display: flex; flex-direction: column; gap: 6px; min-height: 120px; border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; padding: 16px; color: #191c1d; }
.resource-card strong { font-family: "Hanken Grotesk"; font-size: 18px; line-height: 1.25; }
.resource-card span:last-child { color: #42493e; font-size: 13px; line-height: 1.35; word-break: break-word; }
.completed-pill { border: 1px solid #c2c9bb; border-radius: 8px; padding: 8px 12px; background: #fff; color: #42493e; }
.completed-pill strong { color: #154212; }
.critical-response-activity { display: flex; flex-direction: column; gap: 24px; margin-top: 24px; }
.critical-response-tabs { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
.critical-response-tab { min-height: 158px; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; padding: 20px; text-align: left; color: #191c1d; }
.critical-response-tab:hover, .critical-response-tab:focus-visible, .critical-response-tab.active { border-color: #2d5a27; background: #f3f7f1; outline: none; }
.critical-response-tab-icon { color: #154212; font-size: 24px; }
.critical-response-tab strong { font-family: "Hanken Grotesk"; font-size: 22px; line-height: 1.25; color: #191c1d; }
.critical-response-tab span:last-child { color: #42493e; font-size: 14px; line-height: 1.5; }
.critical-response-workshop-shell { border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; overflow: hidden; }
.critical-response-workshop-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; padding: 24px; border-bottom: 1px solid #e1e3e4; background: #f8f9fa; }
.critical-response-workshop-header h3 { margin: 0 0 8px; font-family: "Hanken Grotesk"; font-size: 26px; line-height: 1.2; color: #191c1d; }
.critical-response-workshop-header p { margin: 0; max-width: 72ch; color: #42493e; line-height: 1.5; }
.critical-response-status { min-width: 132px; display: flex; flex-direction: column; gap: 6px; align-items: flex-end; font-family: "IBM Plex Sans"; font-size: 13px; color: #42493e; }
.critical-response-progress-track { height: 8px; background: #edf1eb; }
.critical-response-progress-fill { width: 0%; height: 100%; background: #154212; transition: width 180ms ease; }
.critical-response-group-tabs { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px; padding: 16px 24px 0; background: #fff; }
.critical-response-group-tab { display: grid; grid-template-columns: 24px minmax(0, 1fr) auto; gap: 10px; align-items: center; min-height: 52px; border: 1px solid #e1e3e4; border-radius: 8px; background: #f8f9fa; color: #191c1d; padding: 10px 12px; text-align: left; }
.critical-response-group-tab:hover, .critical-response-group-tab:focus-visible, .critical-response-group-tab.active { border-color: #2d5a27; background: #f3f7f1; outline: none; }
.critical-response-group-tab span:not(.material-symbols-outlined) { font-family: "Hanken Grotesk"; font-size: 15px; line-height: 1.2; font-weight: 800; }
.critical-response-group-tab small { color: #42493e; font-size: 12px; line-height: 1.3; }
.critical-response-panel { padding: 24px; }
.critical-response-step-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.critical-response-step-title { margin: 0; font-family: "Hanken Grotesk"; font-size: 22px; line-height: 1.25; color: #191c1d; }
.critical-response-step-index { font-family: "IBM Plex Sans"; font-size: 13px; color: #42493e; white-space: nowrap; }
.critical-response-question { margin: 0 0 20px; max-width: 78ch; font-size: 17px; line-height: 1.55; color: #191c1d; }
.critical-response-scenario { margin: 0 0 20px; border-left: 4px solid #2d5a27; border-radius: 0 8px 8px 0; background: #f3f7f1; padding: 14px 16px; color: #191c1d; font-style: italic; line-height: 1.5; }
.critical-response-options { display: grid; gap: 14px; }
.critical-response-options.two-column { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.critical-response-option { position: relative; min-height: 74px; border: 1px solid #d9dadb; border-radius: 8px; background: #fff; padding: 16px 46px 16px 16px; text-align: left; color: #191c1d; line-height: 1.45; }
.critical-response-option:hover:not(:disabled), .critical-response-option:focus-visible:not(:disabled) { border-color: #2d5a27; background: #f8fbf7; outline: none; }
.critical-response-option:disabled { cursor: default; }
.critical-response-option-label { display: block; margin-bottom: 6px; font-family: "IBM Plex Sans"; font-size: 12px; color: #154212; }
.critical-response-option-icon { position: absolute; top: 16px; right: 16px; font-size: 22px; }
.critical-response-option.is-correct { border-color: #2d5a27; background: #f3f7f1; }
.critical-response-option.is-incorrect { border-color: #b3261e; background: #fff7f6; }
.critical-response-option.is-reveal { border-color: #2d5a27; }
.critical-response-option.is-muted { color: #5d5e61; background: #f8f9fa; opacity: 0.72; }
.critical-response-feedback { display: flex; align-items: flex-start; gap: 12px; margin-top: 22px; border-radius: 8px; padding: 16px; line-height: 1.5; }
.critical-response-feedback.correct { border: 1px solid #c2c9bb; background: #f3f7f1; color: #154212; }
.critical-response-feedback.incorrect { border: 1px solid #f1b8b4; background: #fff7f6; color: #7d1b16; }
.critical-response-feedback strong { display: block; margin-bottom: 4px; font-family: "Hanken Grotesk"; font-size: 17px; color: inherit; }
.critical-response-actions { display: flex; justify-content: flex-end; margin-top: 18px; }
.critical-response-action { min-height: 44px; display: inline-flex; align-items: center; gap: 8px; border: 1px solid #154212; border-radius: 8px; background: #154212; color: #fff; padding: 9px 14px; font-family: "IBM Plex Sans"; font-size: 14px; }
.critical-response-action:hover, .critical-response-action:focus-visible { background: #2d5a27; border-color: #2d5a27; outline: none; }
.critical-response-complete { border: 1px solid #c2c9bb; border-radius: 8px; background: #f3f7f1; padding: 24px; }
.critical-response-complete h3 { margin: 0 0 8px; font-family: "Hanken Grotesk"; font-size: 24px; line-height: 1.2; color: #191c1d; }
.critical-response-complete p { margin: 0 0 18px; color: #42493e; line-height: 1.5; }
.thesis-builder { display: flex; flex-direction: column; gap: 20px; }
.thesis-stepper { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.thesis-step { display: grid; grid-template-columns: 32px minmax(0, 1fr); gap: 10px; align-items: center; border: 1px solid #e1e3e4; border-radius: 8px; background: #f8f9fa; color: #42493e; padding: 10px; }
.thesis-step.active, .thesis-step.complete { border-color: #2d5a27; background: #f3f7f1; color: #154212; }
.thesis-step-marker { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; background: #fff; border: 1px solid #d9dadb; font-family: "IBM Plex Sans"; font-size: 13px; }
.thesis-step.complete .thesis-step-marker { border-color: #2d5a27; background: #2d5a27; color: #fff; }
.thesis-step-check { display: block; width: 9px; height: 15px; border: solid currentColor; border-width: 0 3px 3px 0; transform: rotate(45deg) translate(-1px, -1px); }
.thesis-step span:last-child { font-family: "IBM Plex Sans"; font-size: 13px; line-height: 1.3; }
.thesis-feedback { display: flex; gap: 12px; align-items: flex-start; border: 1px solid #f2c7c7; border-radius: 8px; background: #fff5f5; color: #7b1b1b; padding: 14px; }
.thesis-feedback strong { display: block; margin-bottom: 4px; font-family: "Hanken Grotesk"; font-size: 16px; line-height: 1.2; }
.thesis-choice-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.thesis-choice-grid.three-column { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.thesis-choice { min-height: 86px; border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; color: #191c1d; padding: 14px; text-align: left; }
.thesis-choice:hover, .thesis-choice:focus-visible { border-color: #2d5a27; background: #f3f7f1; outline: none; }
.thesis-choice strong { display: block; margin-bottom: 6px; font-family: "Hanken Grotesk"; font-size: 17px; line-height: 1.2; }
.thesis-choice small { display: block; color: #154212; font-family: "IBM Plex Sans"; font-size: 12px; line-height: 1.3; margin-bottom: 8px; }
.thesis-preview { border: 1px solid #e1e3e4; border-radius: 8px; background: #f8f9fa; padding: 16px; color: #42493e; line-height: 1.55; }
.thesis-preview strong { color: #154212; }
.thesis-output { border: 1px solid #c2c9bb; border-radius: 8px; background: #f3f7f1; padding: 20px; }
.thesis-output h4 { margin: 0 0 10px; font-family: "Hanken Grotesk"; font-size: 22px; line-height: 1.2; color: #191c1d; }
.thesis-output textarea { width: 100%; min-height: 150px; border: 1px solid #c2c9bb; border-radius: 8px; background: #fff; color: #191c1d; padding: 14px; font-family: "Work Sans"; font-size: 16px; line-height: 1.55; resize: vertical; }
.thesis-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
.thesis-action { min-height: 42px; display: inline-flex; align-items: center; gap: 8px; border: 1px solid #154212; border-radius: 8px; background: #154212; color: #fff; padding: 9px 14px; font-family: "IBM Plex Sans"; font-size: 14px; }
.thesis-action.secondary { background: #fff; color: #154212; }
.thesis-action:hover, .thesis-action:focus-visible { background: #2d5a27; border-color: #2d5a27; color: #fff; outline: none; }
@media (max-width: 900px) {
  .course-sidebar { display: none; }
  .course-main { margin-left: 0 !important; padding-top: 124px !important; }
  .course-topbar { min-height: 124px; grid-template-columns: 1fr; grid-template-rows: auto auto; gap: 8px; padding: 10px 16px; }
  .topbar-logo-link { grid-column: 1; justify-self: center; }
  .next-step-logo { max-width: min(220px, calc(100vw - 32px)); height: 38px; }
  .top-progress-shell { position: static; grid-column: 1 / -1; width: 100%; justify-self: stretch; }
  .top-progress-meta { grid-template-columns: 1fr auto auto; }
  .lesson-layout { grid-template-columns: 1fr; }
  .source-content h1 { font-size: 24px; }
  .source-video-frame, .source-video-card .source-video-frame { min-height: 190px; }
  .library-browser, .film-room-shell { grid-template-columns: 1fr; }
  .library-reader-header { flex-direction: column; }
  .library-actions { justify-content: flex-start; }
  .library-document-frame { min-height: 420px; height: 62vh; }
  .film-room-frame { min-height: 220px; }
  .critical-response-tabs, .critical-response-options.two-column, .thesis-stepper, .thesis-choice-grid, .thesis-choice-grid.three-column { grid-template-columns: 1fr; }
  .critical-response-workshop-header, .critical-response-step-header { flex-direction: column; }
  .critical-response-status { align-items: flex-start; }
}
</style>
</head>
<body class="bg-surface-container-lowest text-on-surface font-body-md min-h-screen">
<header class="course-topbar bg-ink-dark text-white fixed top-0 w-full z-50">
  <a class="topbar-logo-link" href="#overview" data-page-target="overview" aria-label="Next Step home">
    <img class="next-step-logo" src="${NEXT_STEP_LOGO_WORKSPACE_HREF}" alt="Next Step">
  </a>
  <div class="top-progress-shell" aria-label="Course progress">
    <div class="top-progress-meta">
      <span>Course Progress</span>
      <span><strong id="top-progress-count">0</strong> / ${totalLessons} Lessons</span>
      <span id="top-progress-percent" class="top-progress-percent">0%</span>
    </div>
    <div id="top-progress-bar" class="top-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <div id="top-progress-fill" class="top-progress-fill"></div>
    </div>
  </div>
</header>
<aside class="course-sidebar fixed left-0 top-16 bottom-0 z-40 hidden md:flex flex-col bg-ink-dark text-surface-variant w-72 overflow-y-auto">
  <div class="sidebar-header p-lg pb-md">
    <button id="sidebar-toggle" class="sidebar-toggle-button hidden md:inline-flex" type="button" aria-label="Toggle sidebar">
      <span class="material-symbols-outlined" aria-hidden="true">dock_to_left</span>
    </button>
    <h1 class="sidebar-title font-headline-md text-headline-md font-bold text-white mb-1">${escapeHtml(unit.title)}</h1>
    <p class="sidebar-course-label font-caption text-caption text-surface-variant">${COURSE_TITLE}</p>
  </div>
  ${renderSidebar(unit)}
</aside>
<main class="course-main min-h-screen pt-16 md:ml-72 bg-surface-container-lowest">
  <div class="p-lg md:p-xl">
    <section id="overview" class="course-page" data-page="overview">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
        <div class="lg:col-span-7">
          <div class="mb-lg">
            <p class="font-label-md text-label-md text-secondary">${COURSE_TITLE} | Unit Frame</p>
            <h2 class="font-display-lg text-display-lg text-on-surface mt-xs mb-sm">${escapeHtml(unit.title)}</h2>
            <p class="font-body-md text-body-md text-on-surface-variant max-w-3xl">A Brightspace-ready master lesson frame for ${escapeHtml(unit.title)}. The original lesson sequence is preserved, while navigation, completion state, source links, and writing support are organized into a reusable course surface.</p>
          </div>
          <div class="flex flex-wrap gap-sm mb-lg">
            <span class="completed-pill"><strong id="complete-count">0</strong>/${totalLessons} lessons complete</span>
            <span class="completed-pill">${totalLessons} source lessons</span>
            <span class="completed-pill">Brightspace conversion</span>
          </div>
          <a class="lesson-jump primary" href="#lessons" data-page-target="lessons">Open Lesson Frame</a>
        </div>
        <div class="lg:col-span-5">
          <div class="aspect-[4/3] overflow-hidden rounded-lg border border-surface-muted bg-surface">
            ${imageMarkup}
          </div>
        </div>
      </div>
    </section>

    <section id="lessons" class="course-page" data-page="lessons" hidden>
      <div class="mb-lg">
        <p class="font-label-md text-label-md text-secondary">${COURSE_TITLE} | Lessons</p>
        <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs">${escapeHtml(unit.title)} Lesson Sequence</h2>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-md mb-lg">
        ${renderLessonCards(unit)}
      </div>
    </section>

    ${renderLessonPanels(unit)}

    <section id="writing" class="course-page" data-page="writing" hidden>
      ${renderWritingStudio()}
    </section>

    <section id="library" class="course-page" data-page="library" hidden>
      <div class="max-w-6xl">
        <p class="font-label-md text-label-md text-secondary">${COURSE_TITLE} | Library</p>
        <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs mb-md">PDF Library</h2>
        ${renderLibrary(unit)}
      </div>
    </section>

    <section id="film-room" class="course-page" data-page="film-room" hidden>
      <div class="max-w-6xl">
        <p class="font-label-md text-label-md text-secondary">${COURSE_TITLE} | Film Room</p>
        <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs mb-md">Video Room</h2>
        ${renderFilmRoom(unit)}
      </div>
    </section>

    <section id="resources" class="course-page" data-page="resources" hidden>
      <div class="max-w-6xl">
        <p class="font-label-md text-label-md text-secondary">${COURSE_TITLE} | Resources</p>
        <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs mb-md">External Source Resources</h2>
        ${renderExternalResources(unit)}
      </div>
    </section>
  </div>
</main>
<script>
const STORAGE_KEY = "canvas-helper:ela30-1-modern-drama:complete";
const pages = Array.from(document.querySelectorAll(".course-page"));
const lessonIds = ${JSON.stringify(unit.lessons.map((lesson) => lesson.id))};
const totalLessons = ${totalLessons};
const staticPages = ["overview","lessons","writing","library","film-room","resources"];
const lessonsNav = document.querySelector("[data-lessons-nav]");
const lessonsToggle = document.querySelector("[data-lessons-toggle]");
const criticalResponseQuestionGroups = ${scriptJson(CRITICAL_RESPONSE_WORKSHOPS)};
const thesisBuilderActivity = ${scriptJson(THESIS_BUILDER_ACTIVITY)};
const criticalResponseRoot = document.querySelector("[data-critical-response-activity]");
const criticalResponseState = {
  activeId: "textKnowledge",
  questionGroupId: criticalResponseQuestionGroups[0]?.id || "",
  stepIndex: 0,
  score: 0,
  selectedOptionId: null,
  thesisStep: 1,
  thesisSelections: {
    topic: null,
    character: null,
    action: null,
    consequence: null
  },
  thesisFeedback: null,
  thesisText: "",
  thesisCopied: false
};

function readComplete() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function writeComplete(values) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(values)));
}

function updateComplete() {
  const complete = readComplete();
  const progressPercent = totalLessons ? Math.round((complete.size / totalLessons) * 100) : 0;
  const completeCount = document.getElementById("complete-count");
  const topProgressCount = document.getElementById("top-progress-count");
  const topProgressPercent = document.getElementById("top-progress-percent");
  const progressBar = document.getElementById("top-progress-bar");
  const progressFill = document.getElementById("top-progress-fill");
  if (completeCount) completeCount.textContent = String(complete.size);
  if (topProgressCount) topProgressCount.textContent = String(complete.size);
  if (topProgressPercent) topProgressPercent.textContent = \`\${progressPercent}%\`;
  if (progressBar) progressBar.setAttribute("aria-valuenow", String(progressPercent));
  if (progressFill) progressFill.style.width = \`\${progressPercent}%\`;
  document.querySelectorAll("[data-complete-id]").forEach((button) => {
    const id = button.getAttribute("data-complete-id");
    button.textContent = complete.has(id) ? "Completed" : "Mark Complete";
  });
}

function showPage(pageName) {
  const activeNavTarget = lessonIds.includes(pageName) ? "lessons" : pageName;
  pages.forEach((page) => {
    page.hidden = page.getAttribute("data-page") !== pageName;
  });
  document.querySelectorAll(".course-nav-link").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("data-page-target") === activeNavTarget);
  });
  if (pageName !== "lessons" && !lessonIds.includes(pageName)) {
    setLessonsOpen(false);
  }
}

function setLessonsOpen(open) {
  lessonsNav?.classList.toggle("is-open", open);
  lessonsToggle?.setAttribute("aria-expanded", String(open));
}

function route() {
  const hash = (window.location.hash || "#overview").slice(1);
  if ([...staticPages, ...lessonIds].includes(hash)) {
    showPage(hash);
    if (hash === "lessons" || lessonIds.includes(hash)) {
      setLessonsOpen(true);
    }
    return;
  }
  showPage("overview");
}

function escapeRuntimeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function currentQuestionGroup() {
  return criticalResponseQuestionGroups.find((group) => group.id === criticalResponseState.questionGroupId) || criticalResponseQuestionGroups[0];
}

function setCriticalResponseMode(id) {
  criticalResponseState.activeId = id === "thesisControl" ? "thesisControl" : "textKnowledge";
  criticalResponseState.selectedOptionId = null;
  renderCriticalResponseActivity();
}

function resetQuestionGroup(id) {
  criticalResponseState.questionGroupId = id || criticalResponseQuestionGroups[0]?.id || "";
  criticalResponseState.stepIndex = 0;
  criticalResponseState.score = 0;
  criticalResponseState.selectedOptionId = null;
  renderCriticalResponseActivity();
}

function selectedCriticalResponseOption(step) {
  return step?.options.find((option) => option.id === criticalResponseState.selectedOptionId) || null;
}

function thesisSelectionValue(key, fallback) {
  return criticalResponseState.thesisSelections[key]?.text || criticalResponseState.thesisSelections[key]?.name || fallback;
}

function generateThesisText() {
  const selections = criticalResponseState.thesisSelections;
  if (!selections.topic || !selections.character || !selections.action || !selections.consequence) {
    return "";
  }
  return "In his play A Streetcar Named Desire, Tennessee Williams explores " + selections.topic.text + " through the character of " + selections.character.name + ". He suggests that by " + selections.action.text + ", an individual " + selections.consequence.text;
}

function resetThesisBuilder() {
  criticalResponseState.thesisStep = 1;
  criticalResponseState.thesisSelections = {
    topic: null,
    character: null,
    action: null,
    consequence: null
  };
  criticalResponseState.thesisFeedback = null;
  criticalResponseState.thesisText = "";
  criticalResponseState.thesisCopied = false;
  renderCriticalResponseActivity();
}

function renderCriticalResponseActivity() {
  if (!criticalResponseRoot) return;
  criticalResponseRoot.querySelectorAll("[data-workshop-tab]").forEach((button) => {
    const active = button.getAttribute("data-workshop-tab") === criticalResponseState.activeId;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  if (criticalResponseState.activeId === "thesisControl") {
    renderThesisBuilderActivity();
    return;
  }
  renderTextKnowledgeQuestionBank();
}

function renderTextKnowledgeQuestionBank() {
  const group = currentQuestionGroup();
  if (!group) return;
  const heading = criticalResponseRoot.querySelector("[data-workshop-heading]");
  const description = criticalResponseRoot.querySelector("[data-workshop-description]");
  const stepCount = criticalResponseRoot.querySelector("[data-workshop-step-count]");
  const score = criticalResponseRoot.querySelector("[data-workshop-score]");
  const progressFill = criticalResponseRoot.querySelector("[data-workshop-progress-fill]");
  const panel = criticalResponseRoot.querySelector("[data-workshop-panel]");
  const groupTabs = criticalResponseRoot.querySelector("[data-question-group-tabs]");
  const step = group.steps[criticalResponseState.stepIndex];
  const completed = criticalResponseState.stepIndex >= group.steps.length;
  const progressPercent = completed ? 100 : Math.round((criticalResponseState.stepIndex / group.steps.length) * 100);

  if (groupTabs) groupTabs.hidden = false;
  criticalResponseRoot.querySelectorAll("[data-question-group-tab]").forEach((button) => {
    const active = button.getAttribute("data-question-group-tab") === group.id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (heading) heading.textContent = "Text Knowledge Question Bank: A Streetcar Named Desire";
  if (description) description.textContent = "Current practice questions are organized by " + group.title + " so students can review the text before drafting.";
  if (stepCount) stepCount.textContent = completed ? group.title + " complete" : group.title + " - Step " + (criticalResponseState.stepIndex + 1) + " of " + group.steps.length;
  if (score) score.textContent = criticalResponseState.score + " / " + group.steps.length + " correct";
  if (progressFill) progressFill.style.width = progressPercent + "%";
  if (!panel) return;

  if (completed) {
    panel.innerHTML = '<div class="critical-response-complete"><h3>' + escapeRuntimeHtml(group.title) + ' Practice Complete</h3><p>You scored ' + criticalResponseState.score + ' out of ' + group.steps.length + '. Choose another question group above or retake this one.</p><button class="critical-response-action" type="button" data-workshop-restart>Retake Group</button></div>';
    return;
  }

  const selected = selectedCriticalResponseOption(step);
  const optionsClass = "critical-response-options" + (step.type === "comparison" ? " two-column" : "");
  const scenario = step.scenarioText ? '<div class="critical-response-scenario">' + escapeRuntimeHtml(step.scenarioText) + '</div>' : "";
  const options = step.options.map((option) => {
    let optionClass = "critical-response-option";
    if (selected) {
      if (option.id === selected.id) {
        optionClass += option.correct ? " is-correct" : " is-incorrect";
      } else if (option.correct) {
        optionClass += " is-reveal";
      } else {
        optionClass += " is-muted";
      }
    }
    const label = option.label ? '<span class="critical-response-option-label">' + escapeRuntimeHtml(option.label) + '</span>' : "";
    const icon = selected && (option.id === selected.id || option.correct)
      ? '<span class="material-symbols-outlined critical-response-option-icon" aria-hidden="true">' + (option.correct ? "check_circle" : "cancel") + '</span>'
      : "";
    return '<button class="' + optionClass + '" type="button" data-workshop-option="' + escapeRuntimeHtml(option.id) + '"' + (selected ? " disabled" : "") + '>' + label + '<span>' + escapeRuntimeHtml(option.text) + '</span>' + icon + '</button>';
  }).join("");
  const feedback = selected
    ? '<div class="critical-response-feedback ' + (selected.correct ? "correct" : "incorrect") + '"><span class="material-symbols-outlined" aria-hidden="true">' + (selected.correct ? "check_circle" : "error") + '</span><div><strong>' + (selected.correct ? "Correct" : "Review") + '</strong><span>' + escapeRuntimeHtml(step.explanation) + '</span></div></div><div class="critical-response-actions"><button class="critical-response-action" type="button" data-workshop-next>' + (criticalResponseState.stepIndex === group.steps.length - 1 ? "Finish Group" : "Next Question") + '<span class="material-symbols-outlined" aria-hidden="true">chevron_right</span></button></div>'
    : "";
  panel.innerHTML = '<div class="critical-response-step-header"><h4 class="critical-response-step-title">' + escapeRuntimeHtml(step.title) + '</h4><span class="critical-response-step-index">' + escapeRuntimeHtml(group.title) + ' - Step ' + (criticalResponseState.stepIndex + 1) + ' of ' + group.steps.length + '</span></div><p class="critical-response-question">' + escapeRuntimeHtml(step.question) + '</p>' + scenario + '<div class="' + optionsClass + '">' + options + '</div>' + feedback;
}

function renderThesisBuilderActivity() {
  const heading = criticalResponseRoot.querySelector("[data-workshop-heading]");
  const description = criticalResponseRoot.querySelector("[data-workshop-description]");
  const stepCount = criticalResponseRoot.querySelector("[data-workshop-step-count]");
  const score = criticalResponseRoot.querySelector("[data-workshop-score]");
  const progressFill = criticalResponseRoot.querySelector("[data-workshop-progress-fill]");
  const panel = criticalResponseRoot.querySelector("[data-workshop-panel]");
  const groupTabs = criticalResponseRoot.querySelector("[data-question-group-tabs]");
  const step = criticalResponseState.thesisStep;
  const progressPercent = step >= 5 ? 100 : Math.round(((step - 1) / 4) * 100);
  if (groupTabs) groupTabs.hidden = true;
  if (heading) heading.textContent = "Thesis Builder Workshop: A Streetcar Named Desire";
  if (description) description.textContent = thesisBuilderActivity.description;
  if (stepCount) stepCount.textContent = step >= 5 ? "Thesis generated" : "Step " + step + " of 4";
  if (score) score.textContent = "Builder";
  if (progressFill) progressFill.style.width = progressPercent + "%";
  if (!panel) return;
  panel.innerHTML = '<div class="thesis-builder" data-thesis-builder>' + renderThesisStepper() + renderThesisFeedback() + renderThesisStepContent() + renderThesisPreview() + '</div>';
}

function renderThesisStepper() {
  const labels = ["Topic", "Character", "Action", "Meaning"];
  return '<div class="thesis-stepper">' + labels.map((label, index) => {
    const number = index + 1;
    const state = criticalResponseState.thesisStep === number ? " active" : criticalResponseState.thesisStep > number ? " complete" : "";
    const marker = criticalResponseState.thesisStep > number
      ? '<span class="thesis-step-marker" aria-label="Completed"><span class="thesis-step-check" aria-hidden="true"></span></span>'
      : '<span class="thesis-step-marker">' + String(number) + '</span>';
    return '<div class="thesis-step' + state + '">' + marker + '<span>' + escapeRuntimeHtml(label) + '</span></div>';
  }).join("") + '</div>';
}

function renderThesisFeedback() {
  if (!criticalResponseState.thesisFeedback) return "";
  return '<div class="thesis-feedback"><span class="material-symbols-outlined" aria-hidden="true">warning</span><div><strong>Watch out</strong><span>' + escapeRuntimeHtml(criticalResponseState.thesisFeedback) + '</span></div></div>';
}

function renderThesisStepContent() {
  const step = criticalResponseState.thesisStep;
  if (step === 1) {
    return renderThesisChoices("Step 1: Choose a Diploma Prompt Topic", "topic", thesisBuilderActivity.topics, "three-column");
  }
  if (step === 2) {
    return renderThesisChoices("Step 2: Select a Subject", "character", thesisBuilderActivity.characters, "");
  }
  if (step === 3) {
    const characterId = criticalResponseState.thesisSelections.character?.id;
    return renderThesisChoices("Step 3: Define the Action", "action", thesisBuilderActivity.actions[characterId] || [], "");
  }
  if (step === 4) {
    const characterId = criticalResponseState.thesisSelections.character?.id;
    return renderThesisChoices("Step 4: Define the Significance", "consequence", thesisBuilderActivity.consequences[characterId] || [], "");
  }
  const thesisText = criticalResponseState.thesisText || generateThesisText();
  return '<div class="thesis-output"><h4>Generated Thesis</h4><textarea data-thesis-output>' + escapeRuntimeHtml(thesisText) + '</textarea><div class="thesis-actions"><button class="thesis-action" type="button" data-thesis-copy><span class="material-symbols-outlined" aria-hidden="true">' + (criticalResponseState.thesisCopied ? "check_circle" : "content_copy") + '</span>' + (criticalResponseState.thesisCopied ? "Copied" : "Copy Thesis") + '</button><button class="thesis-action secondary" type="button" data-thesis-restart><span class="material-symbols-outlined" aria-hidden="true">refresh</span>Build Another Thesis</button></div></div>';
}

function renderThesisChoices(title, category, items, className) {
  const choices = items.map((item) => {
    const label = item.label ? '<small>' + escapeRuntimeHtml(item.label) + '</small>' : "";
    const heading = item.name ? '<strong>' + escapeRuntimeHtml(item.name) + '</strong>' : "";
    const body = item.name ? '<span>' + escapeRuntimeHtml(item.desc || "") + '</span>' : '<span>' + escapeRuntimeHtml(item.text) + '</span>';
    return '<button class="thesis-choice" type="button" data-thesis-choice="' + escapeRuntimeHtml(category) + '" data-thesis-choice-id="' + escapeRuntimeHtml(item.id) + '">' + label + heading + body + '</button>';
  }).join("");
  return '<div><div class="critical-response-step-header"><h4 class="critical-response-step-title">' + escapeRuntimeHtml(title) + '</h4><span class="critical-response-step-index">Thesis Workshop</span></div><div class="thesis-choice-grid ' + escapeRuntimeHtml(className) + '">' + choices + '</div></div>';
}

function renderThesisPreview() {
  if (criticalResponseState.thesisStep >= 5) return "";
  return '<div class="thesis-preview">In his play A Streetcar Named Desire, Tennessee Williams explores <strong>' + escapeRuntimeHtml(thesisSelectionValue("topic", "[Topic]")) + '</strong> through the character of <strong>' + escapeRuntimeHtml(thesisSelectionValue("character", "[Character]")) + '</strong>. He suggests that by <strong>' + escapeRuntimeHtml(thesisSelectionValue("action", "[Action]")) + '</strong>, an individual <strong>' + escapeRuntimeHtml(thesisSelectionValue("consequence", "[Significance]")) + '</strong></div>';
}

function selectCriticalResponseOption(optionId) {
  const group = currentQuestionGroup();
  const step = group?.steps[criticalResponseState.stepIndex];
  if (!step || criticalResponseState.selectedOptionId) return;
  const option = step.options.find((candidate) => candidate.id === optionId);
  if (!option) return;
  criticalResponseState.selectedOptionId = option.id;
  if (option.correct) {
    criticalResponseState.score += 1;
  }
  renderCriticalResponseActivity();
}

function nextCriticalResponseStep() {
  const group = currentQuestionGroup();
  if (!group) return;
  criticalResponseState.stepIndex += 1;
  criticalResponseState.selectedOptionId = null;
  renderCriticalResponseActivity();
}

function selectThesisChoice(category, id) {
  const source = category === "topic"
    ? thesisBuilderActivity.topics
    : category === "character"
      ? thesisBuilderActivity.characters
      : category === "action"
        ? (thesisBuilderActivity.actions[criticalResponseState.thesisSelections.character?.id] || [])
        : (thesisBuilderActivity.consequences[criticalResponseState.thesisSelections.character?.id] || []);
  const item = source.find((candidate) => candidate.id === id);
  if (!item) return;
  if (item.type === "trap") {
    criticalResponseState.thesisFeedback = item.trapMsg || "Choose an analytical option before moving on.";
    renderCriticalResponseActivity();
    return;
  }
  criticalResponseState.thesisFeedback = null;
  criticalResponseState.thesisSelections[category] = item;
  if (category === "character") {
    criticalResponseState.thesisSelections.action = null;
    criticalResponseState.thesisSelections.consequence = null;
  }
  if (category === "action") {
    criticalResponseState.thesisSelections.consequence = null;
  }
  criticalResponseState.thesisStep += 1;
  if (criticalResponseState.thesisStep >= 5) {
    criticalResponseState.thesisText = generateThesisText();
  }
  renderCriticalResponseActivity();
}

criticalResponseRoot?.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-workshop-tab]");
  if (tab && criticalResponseRoot.contains(tab)) {
    setCriticalResponseMode(tab.getAttribute("data-workshop-tab"));
    return;
  }
  const groupTab = event.target.closest("[data-question-group-tab]");
  if (groupTab && criticalResponseRoot.contains(groupTab)) {
    resetQuestionGroup(groupTab.getAttribute("data-question-group-tab"));
    return;
  }
  const option = event.target.closest("[data-workshop-option]");
  if (option && criticalResponseRoot.contains(option)) {
    selectCriticalResponseOption(option.getAttribute("data-workshop-option"));
    return;
  }
  if (event.target.closest("[data-workshop-next]")) {
    nextCriticalResponseStep();
    return;
  }
  if (event.target.closest("[data-workshop-restart]")) {
    resetQuestionGroup(criticalResponseState.questionGroupId);
    return;
  }
  const thesisChoice = event.target.closest("[data-thesis-choice]");
  if (thesisChoice && criticalResponseRoot.contains(thesisChoice)) {
    selectThesisChoice(thesisChoice.getAttribute("data-thesis-choice"), thesisChoice.getAttribute("data-thesis-choice-id"));
    return;
  }
  const thesisOutput = criticalResponseRoot.querySelector("[data-thesis-output]");
  if (event.target.closest("[data-thesis-copy]")) {
    criticalResponseState.thesisText = thesisOutput?.value || criticalResponseState.thesisText;
    navigator.clipboard?.writeText(criticalResponseState.thesisText);
    criticalResponseState.thesisCopied = true;
    renderCriticalResponseActivity();
    return;
  }
  if (event.target.closest("[data-thesis-restart]")) {
    resetThesisBuilder();
  }
});

document.addEventListener("click", (event) => {
  const lessonToggle = event.target.closest("[data-lessons-toggle]");
  if (lessonToggle) {
    event.preventDefault();
    const nextOpen = !lessonsNav?.classList.contains("is-open");
    if (nextOpen) {
      history.pushState(null, "", "#lessons");
      showPage("lessons");
    }
    setLessonsOpen(nextOpen);
    return;
  }

  const target = event.target.closest("[data-page-target]");
  if (target) {
    const pageTarget = target.getAttribute("data-page-target");
    if (pageTarget) {
      showPage(pageTarget);
      if (pageTarget === "lessons" || lessonIds.includes(pageTarget)) {
        setLessonsOpen(true);
      }
    }
  }
  const libraryTarget = event.target.closest("[data-library-doc-target]");
  if (libraryTarget) {
    setActiveLibraryDocument(libraryTarget.getAttribute("data-library-doc-target"));
  }
  const completeButton = event.target.closest("[data-complete-id]");
  if (completeButton) {
    const id = completeButton.getAttribute("data-complete-id");
    const complete = readComplete();
    complete.add(id);
    writeComplete(complete);
    updateComplete();
  }
});

document.querySelector("[data-film-select]")?.addEventListener("change", (event) => {
  setActiveFilm(event.target.value);
});

function setActiveLibraryDocument(id) {
  if (!id) return;
  document.querySelectorAll("[data-library-doc-panel]").forEach((panel) => {
    panel.hidden = panel.getAttribute("data-library-doc-panel") !== id;
  });
  document.querySelectorAll("[data-library-doc-target]").forEach((button) => {
    const active = button.getAttribute("data-library-doc-target") === id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function setActiveFilm(id) {
  if (!id) return;
  const select = document.querySelector("[data-film-select]");
  if (select && select.value !== id) {
    select.value = id;
  }
  document.querySelectorAll("[data-film-panel]").forEach((panel) => {
    panel.hidden = panel.getAttribute("data-film-panel") !== id;
  });
  document.querySelectorAll("[data-film-now-panel]").forEach((panel) => {
    panel.hidden = panel.getAttribute("data-film-now-panel") !== id;
  });
}

document.getElementById("sidebar-toggle")?.addEventListener("click", () => {
  document.body.classList.toggle("sidebar-collapsed");
});

window.addEventListener("hashchange", route);
renderCriticalResponseActivity();
route();
updateComplete();
</script>
</body>
</html>
`;
}

async function copyUnitSources(zip: JSZip, unit: ModernDramaUnit, slug: string) {
  const paths = getProjectPaths(slug);
  for (const lesson of unit.lessons) {
    const sourceResourcePath = path.join(paths.resourceDir, ...lesson.sourceHref.split("/"));
    await ensureDir(path.dirname(sourceResourcePath));
    if (lesson.sourceKind === "html") {
      await writeTextFile(sourceResourcePath, await readZipText(zip, lesson.sourceHref));
    } else {
      await writeFile(sourceResourcePath, await readZipBuffer(zip, lesson.sourceHref));
    }
    await writeTextFile(path.join(paths.resourceExtractedDir, `${toSafeId(lesson.title)}.txt`), `${lesson.text}\n`);
  }

  const imagePaths = uniqueBy(unit.lessons.flatMap((lesson) => lesson.images), (image) => image.zipPath);
  for (const image of imagePaths) {
    await ensureDir(path.join(paths.workspaceAssetsDir, "source"));
    await writeFile(path.join(paths.workspaceAssetsDir, "source", toSafeFileName(image.zipPath)), await readZipBuffer(zip, image.zipPath));
  }

  const documentPaths = uniqueBy(unit.lessons.flatMap((lesson) => lesson.document ? [lesson.document] : []), (document) => document.zipPath);
  for (const document of documentPaths) {
    await ensureDir(path.join(paths.workspaceAssetsDir, "source"));
    await writeFile(path.join(paths.workspaceAssetsDir, "source", toSafeFileName(document.zipPath)), await readZipBuffer(zip, document.zipPath));
  }

  const localResourcePaths = uniqueBy(
    unit.lessons.flatMap((lesson) => lesson.links).filter((link) => link.kind === "local" && link.zipPath),
    (link) => link.zipPath ?? link.href
  );
  for (const link of localResourcePaths) {
    const zipPath = link.zipPath;
    if (!zipPath || lessonDocumentAlreadyCopied(unit, zipPath)) {
      continue;
    }
    const workspacePath = path.join(paths.workspaceDir, link.workspaceHref.replace(/^\.\//, ""));
    const resourcePath = path.join(paths.resourceDir, ...zipPath.split("/"));
    await ensureDir(path.dirname(workspacePath));
    await ensureDir(path.dirname(resourcePath));
    if (sourceKindForPath(zipPath) === "html") {
      await writeTextFile(workspacePath, await readZipText(zip, zipPath));
      await writeTextFile(resourcePath, await readZipText(zip, zipPath));
    } else {
      await writeFile(workspacePath, await readZipBuffer(zip, zipPath));
      await writeFile(resourcePath, await readZipBuffer(zip, zipPath));
    }
  }
}

async function copyBrandAssets(slug: string) {
  const paths = getProjectPaths(slug);
  const destinationPath = path.join(paths.workspaceDir, ...NEXT_STEP_LOGO_WORKSPACE_HREF.split("/"));
  await ensureDir(path.dirname(destinationPath));
  await copyFile(NEXT_STEP_LOGO_SOURCE_PATH, destinationPath);
}

function lessonDocumentAlreadyCopied(unit: ModernDramaUnit, zipPath: string) {
  return unit.lessons.some((lesson) => lesson.document?.zipPath === zipPath);
}

async function writeSectionMap(slug: string, unit: ModernDramaUnit) {
  const paths = getProjectPaths(slug);
  await writeJsonFile(paths.sectionMapPath, {
    projectId: slug,
    generatedAt: new Date().toISOString(),
    sections: [
      { id: "overview", title: "Overview", role: "landing" },
      { id: "lessons", title: "Lessons", role: "lesson-library" },
      { id: "writing", title: "Writing Studio", role: "writing-support" },
      { id: "library", title: "Library", role: "document-library" },
      { id: "film-room", title: "Film Room", role: "video-library" },
      { id: "resources", title: "Resources", role: "external-resource-library" },
      ...unit.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        role: "lesson",
        sourceHref: lesson.sourceHref
      }))
    ]
  });
}

export async function buildElaModernDramaProject(options: BuildElaModernDramaProjectOptions) {
  const slug = options.slug ?? DEFAULT_SLUG;
  const projectRoot = path.join(projectsRoot, slug);
  const paths = getProjectPaths(slug);
  const relativeRoot = path.relative(projectsRoot, projectRoot);
  if (relativeRoot.startsWith("..") || path.isAbsolute(relativeRoot)) {
    throw new Error(`Refusing to write outside projects root: ${projectRoot}`);
  }
  const resourcesRoot = path.join(repoRoot, "projects", "resources");
  const relativeResourceRoot = path.relative(resourcesRoot, paths.resourceDir);
  if (relativeResourceRoot.startsWith("..") || path.isAbsolute(relativeResourceRoot)) {
    throw new Error(`Refusing to write outside project resources root: ${paths.resourceDir}`);
  }

  if (options.force) {
    await rm(projectRoot, { recursive: true, force: true });
    await rm(paths.resourceDir, { recursive: true, force: true });
  }

  const zipBuffer = await readFile(options.zipPath);
  const zip = await JSZip.loadAsync(zipBuffer);
  const unit = await extractModernDramaUnit(zipBuffer);
  const generatedAt = new Date().toISOString();

  await mkdir(paths.rawDir, { recursive: true });
  await mkdir(paths.workspaceDir, { recursive: true });
  await mkdir(paths.metaDir, { recursive: true });
  await mkdir(paths.resourceDir, { recursive: true });
  await writeTextFile(paths.rawEntrypoint, buildSourceIndexHtml(unit));
  await writeTextFile(paths.workspaceEntrypoint, buildWorkspaceHtml(unit));
  await copyBrandAssets(slug);
  await copyUnitSources(zip, unit, slug);

  await writeJsonFile(paths.manifestPath, buildProjectManifest({ slug, zipPath: options.zipPath, generatedAt }));
  await writeTextFile(paths.styleGuidePath, buildStyleGuide());
  await writeTextFile(paths.contentOutlinePath, buildContentOutline(unit));
  await writeTextFile(paths.importLogPath, buildImportLog(options.zipPath, unit));
  await writeSectionMap(slug, unit);
  await writeJsonFile(paths.referenceIndexPath, buildReferenceIndex(slug, unit));
  await writeJsonFile(paths.resourceCatalogPath, buildResourceCatalog(slug, unit));

  return {
    slug,
    lessonCount: unit.lessons.length,
    workspaceEntrypoint: path.relative(repoRoot, paths.workspaceEntrypoint),
    manifestPath: path.relative(repoRoot, paths.manifestPath)
  };
}
