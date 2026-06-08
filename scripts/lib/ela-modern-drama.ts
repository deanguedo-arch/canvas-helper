import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import * as cheerio from "cheerio";
import type { AnyNode, Element } from "domhandler";
import JSZip from "jszip";

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
};

export type ModernDramaVideo = {
  title: string;
  originalSrc: string;
  embedSrc: string;
  origin: "iframe" | "link";
};

export type ModernDramaLesson = {
  id: string;
  sequence: number;
  title: string;
  sourceHref: string;
  contentHtml: string;
  text: string;
  images: ModernDramaImage[];
  videos: ModernDramaVideo[];
  links: ModernDramaLink[];
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
const SOURCE_UNIT_TITLE = "Modern Drama";
const ACTIVE_UNIT_IDENTIFIER = "RES_CONTENT_3535";

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
  const candidates = [
    decoded,
    path.posix.join(lessonDir, decoded),
    decoded.includes("modern_drama/") ? decoded.slice(decoded.lastIndexOf("modern_drama/")) : ""
  ].filter(Boolean);

  const directMatch = firstExistingPath(candidates, input.zipEntries);
  if (directMatch) {
    return directMatch;
  }

  const basename = path.posix.basename(decoded).toLowerCase();
  return (
    [...input.zipEntries].find((entry) => {
      return entry.startsWith("modern_drama/") && path.posix.basename(entry).toLowerCase() === basename;
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
      const workspaceHref = `./resources/${toLocalResourceFileName(localPath)}`;
      link.attr("href", workspaceHref);
      link.attr("target", "_blank");
      link.attr("rel", "noopener noreferrer");
      links.push({ text, href, kind: "local", workspaceHref });
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
    links
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

  let modernDramaItem: Element | null = null;
  $("item").each((_, element) => {
    const title = directChildText($, element, "title");
    if (title === SOURCE_UNIT_TITLE || $(element).attr("identifierref") === ACTIVE_UNIT_IDENTIFIER) {
      modernDramaItem = element;
      return false;
    }
    return undefined;
  });

  if (!modernDramaItem) {
    throw new Error("Could not find Modern Drama item in imsmanifest.xml.");
  }

  const lessons: ModernDramaLesson[] = [];
  for (const [index, element] of $(modernDramaItem).children("item").toArray().entries()) {
    const identifier = $(element).attr("identifierref") ?? "";
    const sourceHref = resources.get(identifier);
    if (!sourceHref) {
      continue;
    }
    const sourceHtml = await readZipText(zip, sourceHref);
    const title = directChildText($, element, "title") || `Lesson ${index + 1}`;
    const cleaned = cleanSourceContentHtml(sourceHtml, sourceHref, zipEntries);
    lessons.push({
      id: toSafeId(title),
      sequence: index + 1,
      title,
      sourceHref,
      contentHtml: cleaned.contentHtml,
      text: cleaned.text,
      images: cleaned.images,
      videos: cleaned.videos,
      links: cleaned.links
    });
  }

  const localResources = lessons.flatMap((lesson) => lesson.links.filter((link) => link.kind === "local"));
  return {
    title: directChildText($, modernDramaItem, "title") || SOURCE_UNIT_TITLE,
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

function truncate(value: string, length: number) {
  if (value.length <= length) {
    return value;
  }
  return `${value.slice(0, length - 1).trim()}...`;
}

function lessonSummary(lesson: ModernDramaLesson) {
  return truncate(lesson.text.replace(new RegExp(`^${lesson.title}\\s*`, "i"), ""), 180);
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
- Use drama imagery only where it clarifies the unit; avoid decorative filler.
- Keep cards compact, readable, and export-safe for Brightspace integration.

## Interaction Notes
- Hash routes drive Overview, Lessons, Writing Studio, Readings, and Resources.
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
- YouTube iframes and links normalized into embedded video surfaces where present.
- Local supplementary HTML links copied into workspace/resources.
- Source HTML encoding: UTF-16 Brightspace HTML decoded during generation.
`;
}

function buildReferenceIndex(slug: string, unit: ModernDramaUnit) {
  const references = unit.lessons.map((lesson) => ({
    id: toSafeId(lesson.title),
    originalPath: lesson.sourceHref,
    projectId: slug,
    kind: "html" as ReferenceKind,
    relativePath: lesson.sourceHref,
    titleGuess: lesson.title,
    extractionStatus: "indexed" as const,
    extractionMethod: "native" as const,
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
    kind: "html",
    relativePath: lesson.sourceHref,
    absolutePath: path.join(getProjectPaths(slug).resourceDir, ...lesson.sourceHref.split("/")),
    originalPath: lesson.sourceHref,
    titleGuess: lesson.title,
    extractionStatus: "indexed",
    extractionMethod: "native",
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

function buildProjectManifest(options: {
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
    preferredWorkflows: ["conversion"],
    canonicalEntry: paths.workspaceEntrypoint,
    canonicalSources: [paths.workspaceEntrypoint],
    generatedOutputs: [],
    regenerateCommand: `npx tsx scripts/build-ela-modern-drama.ts --zip "${options.zipPath}" --slug ${options.slug} --force`,
    injectedComponents: [],
    importedFirstPassOrigin: {
      sourceSystem: "brightspace",
      sourcePath: options.zipPath,
      importedAt: options.generatedAt,
      notes: "D2L/Brightspace Modern Drama unit extracted into a FinLit-style master lesson frame."
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

function renderVideoResources(unit: ModernDramaUnit) {
  const videos = uniqueBy(unit.lessons.flatMap((lesson) => lesson.videos), (video) => video.embedSrc);
  if (videos.length === 0) {
    return "";
  }
  return `<section class="mb-lg">
    <h3 class="font-headline-md text-headline-md text-on-surface mb-md">Embedded Videos</h3>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-md">
      ${videos.map(renderEmbeddedVideo).join("\n")}
    </div>
  </section>`;
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
    <div class="lessons-nav">
      <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#lessons" data-page-target="lessons"><span class="material-symbols-outlined" aria-hidden="true">menu_book</span><span class="sidebar-label">Lessons</span></a>
      <div class="lesson-subnav ml-12 mr-3 mt-1 space-y-1">${lessons}</div>
    </div>
    <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#writing" data-page-target="writing"><span class="material-symbols-outlined" aria-hidden="true">edit_note</span><span class="sidebar-label">Writing Studio</span></a>
    <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#readings" data-page-target="readings"><span class="material-symbols-outlined" aria-hidden="true">library_books</span><span class="sidebar-label">Readings</span></a>
    <a class="course-nav-link flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors" href="#resources" data-page-target="resources"><span class="material-symbols-outlined" aria-hidden="true">folder_open</span><span class="sidebar-label">Resources</span></a>
  </nav>`;
}

function renderExternalResources(unit: ModernDramaUnit) {
  const links = uniqueBy(
    unit.lessons.flatMap((lesson) => lesson.links).filter((link) => !normalizeVideoEmbedSrc(link.href)),
    (link) => `${link.kind}:${link.href}`
  );
  if (links.length === 0) {
    return `<p class="font-body-md text-body-md text-on-surface-variant">No external links were detected in this unit.</p>`;
  }
  return `<div class="grid grid-cols-1 md:grid-cols-2 gap-md">${links
    .map((link) => `<a class="resource-card" href="${escapeHtml(link.workspaceHref)}" target="_blank" rel="noopener noreferrer">
      <span class="font-caption text-caption text-primary">${link.kind === "local" ? "Local Source" : "External Source"}</span>
      <strong>${escapeHtml(link.text)}</strong>
      <span>${escapeHtml(truncate(link.href, 120))}</span>
    </a>`)
    .join("\n")}</div>`;
}

function firstUnitImage(unit: ModernDramaUnit) {
  return unit.lessons.flatMap((lesson) => lesson.images)[0]?.workspaceSrc ?? "";
}

export function buildWorkspaceHtml(unit: ModernDramaUnit) {
  const totalLessons = unit.lessons.length;
  const mainImage = firstUnitImage(unit);
  const imageMarkup = mainImage
    ? `<img alt="Modern drama visual reference" class="w-full h-full object-cover" src="${mainImage}">`
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
.course-sidebar, .course-main, .sidebar-label { transition: width 180ms ease, margin-left 180ms ease, opacity 140ms ease; }
.course-nav-link { color: #e1e3e4; }
.course-nav-link:hover, .course-nav-link.active { background: rgba(255,255,255,0.1); color: #fff; }
.course-page[hidden], .lesson-detail-panel[hidden] { display: none !important; }
body.sidebar-collapsed .course-sidebar { width: 80px; }
body.sidebar-collapsed .course-main { margin-left: 80px; }
body.sidebar-collapsed .sidebar-label, body.sidebar-collapsed .sidebar-title, body.sidebar-collapsed .lesson-subnav { display: none; }
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
.embedded-video-section { margin-top: 24px; max-width: 760px; }
.source-video-card { border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; padding: 12px; }
.source-video-card .source-video-frame { width: 100%; margin: 0; min-height: 220px; }
.source-video-meta { display: flex; flex-direction: column; gap: 4px; padding-top: 10px; }
.source-video-meta strong { font-family: "Hanken Grotesk"; font-size: 17px; line-height: 1.3; color: #191c1d; }
.source-video-meta a { font-family: "IBM Plex Sans"; font-size: 14px; color: #154212; text-decoration: underline; text-underline-offset: 3px; }
.lesson-jump { min-height: 44px; display: inline-flex; align-items: center; border: 1px solid #e1e3e4; border-radius: 8px; padding: 8px 14px; font-family: "IBM Plex Sans"; font-size: 14px; color: #191c1d; background: #fff; }
.lesson-jump.primary { background: #154212; color: #fff; border-color: #154212; }
.resource-card { display: flex; flex-direction: column; gap: 6px; min-height: 120px; border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; padding: 16px; color: #191c1d; }
.resource-card strong { font-family: "Hanken Grotesk"; font-size: 18px; line-height: 1.25; }
.resource-card span:last-child { color: #42493e; font-size: 13px; line-height: 1.35; word-break: break-word; }
.completed-pill { border: 1px solid #c2c9bb; border-radius: 8px; padding: 8px 12px; background: #fff; color: #42493e; }
.completed-pill strong { color: #154212; }
@media (max-width: 900px) {
  .course-sidebar { display: none; }
  .course-main { margin-left: 0 !important; }
  .lesson-layout { grid-template-columns: 1fr; }
  .source-content h1 { font-size: 24px; }
  .source-video-frame, .source-video-card .source-video-frame { min-height: 190px; }
}
</style>
</head>
<body class="bg-surface-container-lowest text-on-surface font-body-md min-h-screen">
<header class="h-16 bg-ink-dark text-white flex items-center justify-center fixed top-0 w-full z-50">
  <div class="absolute left-6 flex items-center gap-3">
    <span class="material-symbols-outlined" aria-hidden="true">theater_comedy</span>
    <span class="font-label-md text-label-md">${COURSE_TITLE}</span>
  </div>
  <strong class="font-headline-md text-headline-md">${escapeHtml(unit.title)}</strong>
  <button id="sidebar-toggle" class="absolute right-4 hidden md:inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40" type="button" aria-label="Toggle sidebar">
    <span class="material-symbols-outlined" aria-hidden="true">dock_to_left</span>
  </button>
</header>
<aside class="course-sidebar fixed left-0 top-16 bottom-0 z-40 hidden md:flex flex-col bg-ink-dark text-surface-variant w-72 overflow-y-auto">
  <div class="p-lg pb-md">
    <h1 class="sidebar-title font-headline-md text-headline-md font-bold text-white mb-1">${escapeHtml(unit.title)}</h1>
    <p class="font-caption text-caption text-surface-variant">${COURSE_TITLE}</p>
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
            <p class="font-body-md text-body-md text-on-surface-variant max-w-3xl">A Brightspace-ready master lesson frame for the Modern Drama unit. The original lesson sequence is preserved, while navigation, completion state, source links, and writing support are organized into a reusable course surface.</p>
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
        <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs">Modern Drama Lesson Sequence</h2>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-md mb-lg">
        ${renderLessonCards(unit)}
      </div>
    </section>

    ${renderLessonPanels(unit)}

    <section id="writing" class="course-page" data-page="writing" hidden>
      <div class="max-w-5xl">
        <p class="font-label-md text-label-md text-secondary">${COURSE_TITLE} | Writing Studio</p>
        <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs mb-md">Critical/Analytical Response Workspace</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
          <article class="bg-white border border-surface-muted rounded-lg p-md">
            <h3 class="font-headline-md text-headline-md text-on-surface mb-sm">Text Knowledge</h3>
            <p class="text-on-surface-variant">Choose one studied play and collect evidence tied to conflict, character, theme, and dramatic technique.</p>
          </article>
          <article class="bg-white border border-surface-muted rounded-lg p-md">
            <h3 class="font-headline-md text-headline-md text-on-surface mb-sm">Thesis Control</h3>
            <p class="text-on-surface-variant">State how the playwright develops the topic, then keep each body paragraph anchored to that interpretation.</p>
          </article>
          <article class="bg-white border border-surface-muted rounded-lg p-md">
            <h3 class="font-headline-md text-headline-md text-on-surface mb-sm">Evidence Quality</h3>
            <p class="text-on-surface-variant">Use precise moments from the drama rather than broad plot summary. Explain how each detail proves the claim.</p>
          </article>
        </div>
      </div>
    </section>

    <section id="readings" class="course-page" data-page="readings" hidden>
      <div class="max-w-5xl">
        <p class="font-label-md text-label-md text-secondary">${COURSE_TITLE} | Readings</p>
        <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs mb-md">Core Text Path</h2>
        <div class="bg-white border border-surface-muted rounded-lg p-lg source-content">
          <p>The unit points learners toward three drama study paths: <strong>A Streetcar Named Desire</strong>, <strong>Death of a Salesman</strong>, and <strong>A Doll's House</strong>. Keep the required text access policy local to your Brightspace course, then use this frame to hold the reading launch notes, author research prompts, and writing supports.</p>
          <p>The source links captured from the D2L export are listed in Resources.</p>
        </div>
      </div>
    </section>

    <section id="resources" class="course-page" data-page="resources" hidden>
      <div class="max-w-6xl">
        <p class="font-label-md text-label-md text-secondary">${COURSE_TITLE} | Resources</p>
        <h2 class="font-headline-lg text-headline-lg text-on-surface mt-xs mb-md">Source Resources</h2>
        ${renderVideoResources(unit)}
        ${renderExternalResources(unit)}
      </div>
    </section>
  </div>
</main>
<script>
const STORAGE_KEY = "canvas-helper:ela30-1-modern-drama:complete";
const pages = Array.from(document.querySelectorAll(".course-page"));
const lessonIds = ${JSON.stringify(unit.lessons.map((lesson) => lesson.id))};
const staticPages = ["overview", "lessons", "writing", "readings", "resources"];

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
  document.getElementById("complete-count").textContent = String(complete.size);
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
}

function route() {
  const hash = (window.location.hash || "#overview").slice(1);
  if ([...staticPages, ...lessonIds].includes(hash)) {
    showPage(hash);
    return;
  }
  showPage("overview");
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-page-target]");
  if (target) {
    const pageTarget = target.getAttribute("data-page-target");
    if (pageTarget) {
      showPage(pageTarget);
    }
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

document.getElementById("sidebar-toggle")?.addEventListener("click", () => {
  document.body.classList.toggle("sidebar-collapsed");
});

window.addEventListener("hashchange", route);
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
    await writeTextFile(
      path.join(paths.resourceDir, ...lesson.sourceHref.split("/")),
      await readZipText(zip, lesson.sourceHref)
    );
    await writeTextFile(path.join(paths.resourceExtractedDir, `${toSafeId(lesson.title)}.txt`), `${lesson.text}\n`);
  }

  const imagePaths = uniqueBy(unit.lessons.flatMap((lesson) => lesson.images), (image) => image.zipPath);
  for (const image of imagePaths) {
    await ensureDir(path.join(paths.workspaceAssetsDir, "source"));
    await writeFile(path.join(paths.workspaceAssetsDir, "source", toSafeFileName(image.zipPath)), await readZipBuffer(zip, image.zipPath));
  }

  const localResourcePaths = uniqueBy(
    unit.lessons.flatMap((lesson) => lesson.links).filter((link) => link.kind === "local"),
    (link) => link.href
  );
  for (const link of localResourcePaths) {
    const href = link.href.split(/[?#]/, 1)[0] ?? link.href;
    const resolved = normalizeZipPath(path.posix.join("modern_drama", href));
    const zipPath = zip.file(resolved) ? resolved : normalizeZipPath(path.posix.join("modern_drama", path.posix.basename(href)));
    await writeTextFile(path.join(paths.workspaceDir, link.workspaceHref.replace(/^\.\//, "")), await readZipText(zip, zipPath));
    await writeTextFile(path.join(paths.resourceDir, zipPath), await readZipText(zip, zipPath));
  }
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
      { id: "readings", title: "Readings", role: "reading-support" },
      { id: "resources", title: "Resources", role: "resource-library" },
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
  const relativeRoot = path.relative(projectsRoot, projectRoot);
  if (relativeRoot.startsWith("..") || path.isAbsolute(relativeRoot)) {
    throw new Error(`Refusing to write outside projects root: ${projectRoot}`);
  }

  if (options.force) {
    await rm(projectRoot, { recursive: true, force: true });
  }

  const paths = getProjectPaths(slug);
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
