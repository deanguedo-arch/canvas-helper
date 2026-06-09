import { access, copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import * as cheerio from "cheerio";
import type { AnyNode, Element } from "domhandler";
import JSZip from "jszip";

import {
  CRITICAL_RESPONSE_ACTIVITY_SOURCE,
  CRITICAL_RESPONSE_WORKSHOPS
} from "./ela-critical-response-activity.js";
import {
  EVIDENCE_COLLECTOR_ACTIVITY,
  EVIDENCE_COLLECTOR_ACTIVITY_SOURCE
} from "./ela-evidence-collector-activity.js";
import {
  PARAGRAPH_ARCHITECT_ACTIVITY,
  PARAGRAPH_ARCHITECT_ACTIVITY_SOURCE
} from "./ela-paragraph-architect-activity.js";
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
  id?: string;
  title: string;
  originalSrc: string;
  embedSrc: string;
  origin: "iframe" | "link" | "local";
  sourceTitle?: string;
  mediaType?: string;
};

export type ModernDramaSourceKind = "html" | "pdf" | "other";

export type ModernDramaDocument = {
  title: string;
  zipPath: string;
  workspaceHref: string;
  kind: Exclude<ModernDramaSourceKind, "html">;
};

export type ModernDramaLibraryDocument = ModernDramaDocument & {
  id: string;
  group: string;
  sourceLabel: "CBE" | "Next Step" | "Course Build";
  description: string;
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
  libraryDocuments?: ModernDramaLibraryDocument[];
  filmResources?: ModernDramaVideo[];
};

export type BuildElaModernDramaProjectOptions = {
  zipPath: string;
  nextStepZipPath?: string;
  moviePath?: string;
  slug?: string;
  force?: boolean;
};

const DEFAULT_SLUG = "ela30-1-modern-drama";
const COURSE_TITLE = "ELA 30-1";
const DEFAULT_NEXT_STEP_ZIP_PATH = "C:\\Users\\dean.guedo\\Downloads\\English 30-1 nextstep.zip";
const DEFAULT_STREETCAR_MOVIE_PATH = "C:\\Users\\dean.guedo\\Downloads\\Streetcar Named Desire Movie.mp4";
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

function normalizeImportedText(value: string) {
  return value
    .replace(/@2019 CBe-learn - Calgary Board of Education/g, "")
    .replace(/\bBlance\b/g, "Blanche")
    .replace(/\bCliffnotes\b/g, "CliffsNotes");
}

function removeStreetcarAccessNoticeHtml(value: string) {
  return value.replace(
    /<p[^>]*>[\s\S]*?purchase a copy of the play[\s\S]*?A Streetcar Named Desire[\s\S]*?email your instructor for assistance\.?[\s\S]*?<\/p>/gi,
    ""
  );
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
  return normalizeImportedText(normalizeWhitespace(element.text())).trim();
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
    const text = normalizeImportedText(normalizeWhitespace(link.text())) || href;
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
  contentHtml = removeStreetcarAccessNoticeHtml(contentHtml)
    .replace(/@2019 CBe-learn - Calgary Board of Education/g, "")
    .replace(/\bBlance\b/g, "Blanche")
    .replace(/\bCliffnotes\b/g, "CliffsNotes")
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
  return normalizeImportedText(normalizeWhitespace($(element).children(childSelector).first().text()));
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

function isSceneOverviewLesson(lesson: ModernDramaLesson) {
  return /^Scene\s+\d+\s+Overview$/i.test(lesson.title);
}

function buildSceneOverviewsLesson(sceneLessons: ModernDramaLesson[], sequence: number): ModernDramaLesson {
  const options = sceneLessons
    .map((lesson, index) => `<option value="${escapeHtml(lesson.id)}"${index === 0 ? " selected" : ""}>${escapeHtml(lesson.title)}</option>`)
    .join("\n");
  const panels = sceneLessons
    .map((lesson, index) => `<article class="scene-overview-panel" data-scene-overview-panel="${escapeHtml(lesson.id)}"${index === 0 ? "" : " hidden"}>
      <div class="scene-overview-panel-header">
        <span class="resource-kicker">Scene Overview</span>
        <h3>${escapeHtml(lesson.title)}</h3>
      </div>
      <div class="source-content">${lesson.contentHtml}</div>
    </article>`)
    .join("\n");

  return {
    id: "scene-overviews",
    sequence,
    title: "Scene Overviews",
    sourceKind: "html",
    sourceHref: "streetcar_named_desire/scene-overviews.html",
    contentHtml: `<div class="scene-overview-browser">
      <div class="scene-overview-control">
        <label class="film-room-label" for="scene-overview-select">Choose a scene</label>
        <select id="scene-overview-select" class="film-room-select" data-scene-overview-select>
          ${options}
        </select>
      </div>
      <div class="scene-overview-panels">${panels}</div>
    </div>`,
    text: sceneLessons.map((lesson) => lesson.text).join(" "),
    images: sceneLessons.flatMap((lesson) => lesson.images),
    videos: sceneLessons.flatMap((lesson) => lesson.videos),
    links: sceneLessons.flatMap((lesson) => lesson.links)
  };
}

function combineSceneOverviewLessons(lessons: ModernDramaLesson[]) {
  const sceneLessons = lessons.filter(isSceneOverviewLesson);
  if (sceneLessons.length < 2) {
    return lessons;
  }

  const combinedLessons: ModernDramaLesson[] = [];
  let insertedScenes = false;
  for (const lesson of lessons) {
    if (isSceneOverviewLesson(lesson)) {
      if (!insertedScenes) {
        combinedLessons.push(buildSceneOverviewsLesson(sceneLessons, combinedLessons.length + 1));
        insertedScenes = true;
      }
      continue;
    }
    combinedLessons.push({ ...lesson, sequence: combinedLessons.length + 1 });
  }
  return combinedLessons;
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

  const normalizedLessons = combineSceneOverviewLessons(lessons);
  const localResources = normalizedLessons.flatMap((lesson) => lesson.links.filter((link) => link.kind === "local"));
  return {
    title: sourceUnit.target.canonicalTitle,
    lessons: normalizedLessons,
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

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function lessonSummary(lesson: ModernDramaLesson) {
  return truncate(lesson.text.replace(new RegExp(`^${lesson.title}\\s*`, "i"), ""), 180);
}

type AuthoredLessonSpec = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  sources: string[];
  target: string;
  output: string;
  miniLesson: string[];
  studentPrompts: string[];
  evidenceTask: string;
  miniWrite: string;
  tracking?: string[];
  questions?: string[];
};

const AUTHORED_STREETCAR_LESSONS: AuthoredLessonSpec[] = [
  {
    id: "unit-launch-a-streetcar-named-desire",
    title: "Unit Launch: A Streetcar Named Desire",
    subtitle: "Set the reading, evidence, and Critical/Analytical writing path.",
    time: "35-45 minutes",
    sources: ["CBE unit introduction", "Next Step Unit 5 Streetcar booklet", "Course Build"],
    target: "Explain how this unit turns reading into evidence-based Critical/Analytical writing.",
    output: "Unit prediction response, two theme predictions, and evidence-bank setup.",
    miniLesson: [
      "This unit is built around one question: What happens when a person cannot survive reality without illusion? Students will read the play as drama, not as plot summary, and will keep returning to how Williams uses stage directions, sound, setting, light, costume, and dialogue to make meaning visible on stage.",
      "The endpoint is visible from the start. By the end of the unit, students should have at least 22-25 usable evidence-bank entries that can support a diploma-level Critical/Analytical response. The evidence bank is not extra work; it is the bridge between reading, interpretation, paragraph practice, and final essay planning."
    ],
    studentPrompts: [
      "Write a 100-150 word prediction about what the title, setting, and central question suggest about the conflict.",
      "Choose two possible themes from illusion, desire, dependence, power, survival, or social judgment. Explain why each may matter in the play."
    ],
    evidenceTask: "Create the first evidence-bank row for a title, setting, or context detail that may become useful later.",
    miniWrite: "Explain why a reader should track evidence while reading instead of waiting until the essay stage."
  },
  {
    id: "lesson-1-modern-drama-toolkit",
    title: "Modern Drama Toolkit",
    subtitle: "Learn how drama communicates without a narrator.",
    time: "40-50 minutes",
    sources: ["CBE characteristics of modern drama", "CBE literary devices", "Course Build"],
    target: "Analyze how dramatic techniques create meaning differently from narration in fiction.",
    output: "One drama-method response, one technique application, and one toolkit table row.",
    miniLesson: [
      "Drama has no narrator to explain motive or theme. Meaning has to arrive through what an audience can hear and see: stage directions, dialogue, lighting, music, props, costume, movement, entrances, exits, silence, and the arrangement of physical space.",
      "Modern drama often places ordinary people inside domestic spaces that become emotionally dangerous. In Streetcar, the apartment, street sounds, clothing, music, and repeated objects are not background decoration. They pressure characters until private conflict becomes public and visible."
    ],
    studentPrompts: [
      "How does drama communicate meaning differently from a novel?",
      "Choose one dramatic tool and explain how it can reveal character or theme before a character states anything directly."
    ],
    evidenceTask: "Start a toolkit row for one dramatic tool you expect to track in Streetcar.",
    miniWrite: "Explain why stage directions can be as important as dialogue in a modern drama."
  },
  {
    id: "lesson-2-tennessee-williams-and-context",
    title: "Tennessee Williams and Context",
    subtitle: "Use biography and context as interpretive pressure, not trivia.",
    time: "40-50 minutes",
    sources: ["Next Step Unit 5 Streetcar booklet", "CBE Tennessee Williams", "CBE Streetcar introduction"],
    target: "Connect Williams' recurring concerns to possible conflicts in the play.",
    output: "One context response and one conflict prediction.",
    miniLesson: [
      "Tennessee Williams became one of the major American dramatists of the twentieth century through plays such as The Glass Menagerie, A Streetcar Named Desire, and Cat on a Hot Tin Roof. His work often returns to fragile people, social pressure, desire, loneliness, repression, and the need for tenderness in a world that does not offer much of it.",
      "Context should not turn into a biography quiz. The useful question is how the playwright's concerns prepare us to interpret characters under pressure. When a character performs strength, hides damage, or builds a protective illusion, the play asks us to study what that protection costs."
    ],
    studentPrompts: [
      "Which pressure in Williams' context seems most likely to shape the play: repression, desire, fragility, social judgment, or loneliness?",
      "Based on this context, what kind of conflict do you expect between private need and public behavior?"
    ],
    evidenceTask: "Record one contextual idea that could later help explain Blanche, Stanley, Stella, or Mitch.",
    miniWrite: "Explain how context can guide interpretation without replacing close reading."
  },
  {
    id: "lesson-3-the-world-of-the-play",
    title: "The World of the Play",
    subtitle: "Read setting as symbolic pressure.",
    time: "40-50 minutes",
    sources: ["CBE The Streetcar", "CBE Streetcar overview", "Course Build"],
    target: "Interpret setting details as symbols that shape character conflict.",
    output: "Streetcar-route response, setting prediction, and one setting-symbol table row.",
    miniLesson: [
      "New Orleans and Elysian Fields are loud, physical, crowded, working-class, and sensual. The setting does not wait politely in the background. It pushes on Blanche as soon as she arrives and makes her old ideas of refinement feel exposed and unstable.",
      "The route names Desire, Cemeteries, and Elysian Fields create a symbolic map. Belle Reve means a beautiful dream, but that dream has been lost before the play begins. The play's geography therefore becomes a movement from desire toward loss, decay, and a false paradise that cannot protect anyone."
    ],
    studentPrompts: [
      "Explain how the streetcar route can be read as a symbolic map of Blanche's life.",
      "What kind of character would struggle most in this world? Defend your prediction."
    ],
    evidenceTask: "Add one setting detail and explain what pressure it may place on a character.",
    miniWrite: "Explain how setting can become a force in the conflict rather than a backdrop."
  },
  {
    id: "lesson-4-character-map-and-first-impressions",
    title: "Character Map and First Impressions",
    subtitle: "Build a first theory about relationships before the reading deepens.",
    time: "40-50 minutes",
    sources: ["CBE Streetcar character overview", "CBE character presentation", "Next Step Unit 5 Streetcar booklet"],
    target: "Describe early character dynamics and revise first impressions using evidence.",
    output: "Character map, first-impression response, and two prediction notes.",
    miniLesson: [
      "Character study in Streetcar depends on relationships. Blanche, Stella, Stanley, and Mitch are not isolated figures; each one is understood through the pressures they create for each other and the roles they try to occupy.",
      "First impressions matter because Williams often makes the audience revise them. A character may seem powerful, vulnerable, kind, cruel, practical, or deluded in one scene and more complicated in the next. The goal is not to label quickly but to track change."
    ],
    studentPrompts: [
      "Create a character map showing the early relationship lines among Blanche, Stella, Stanley, and Mitch.",
      "Choose one character and write a first impression that you are prepared to revise as evidence develops."
    ],
    evidenceTask: "Record one early character detail and identify whether it reveals self-image, social role, or hidden pressure.",
    miniWrite: "Explain why first impressions in drama should be treated as hypotheses."
  },
  {
    id: "lesson-5-reading-guide-and-evidence-bank-setup",
    title: "Reading Guide and Evidence Bank Setup",
    subtitle: "Prepare the reading routine that will drive the essay.",
    time: "35-45 minutes",
    sources: ["Next Step Unit 5 Streetcar booklet", "CBE Streetcar reading guide PDF", "Course Build"],
    target: "Use a repeatable reading routine to turn scene questions into essay-ready evidence.",
    output: "Evidence-bank setup, one model entry, and one reading-plan response.",
    miniLesson: [
      "Every scene lesson follows the same logic: read the assigned scene, answer focused questions, collect evidence, interpret what the evidence reveals, and write a short analytical response. This routine prevents the final essay from becoming plot summary.",
      "A strong evidence-bank entry does more than copy a detail. It identifies the technique, explains what the moment reveals, connects the moment to a theme, and records how the evidence might be used in an essay."
    ],
    studentPrompts: [
      "Set up your evidence bank with the columns Evidence, Technique, What it reveals, Theme connection, and Essay use.",
      "Write one model entry using a setting, title, or context detail from the unit launch lessons."
    ],
    evidenceTask: "Complete one model evidence-bank row and explain how it could support a paragraph.",
    miniWrite: "Explain what makes an evidence entry useful for essay writing."
  },
  {
    id: "lesson-6-scene-1-arrival-and-first-collision",
    title: "Scene 1: Arrival and First Collision",
    subtitle: "Track arrival, class tension, and the first clash of worlds.",
    time: "50-60 minutes",
    sources: ["Next Step Unit 5 Streetcar booklet", "CBE Scene 1 overview", "CBE reading guide PDF"],
    target: "Analyze how Scene 1 establishes conflict through setting, arrival, and first impressions.",
    output: "Four reading responses, two evidence-bank entries, and one mini-write.",
    miniLesson: [
      "Scene 1 introduces Blanche as a displaced figure entering a world that immediately unsettles her. The scene builds tension through the contrast between Blanche's expectations and the physical reality of Elysian Fields.",
      "Pay attention to how Williams makes class, sexuality, family history, and space visible before the central conflict fully erupts. The first scene gives you evidence for later arguments about illusion, social class, dependence, and survival."
    ],
    tracking: ["Blanche's arrival", "Elysian Fields", "Belle Reve", "Stella's response", "Stanley's first impression"],
    questions: ["What does Blanche's arrival reveal about her expectations?", "How does the setting challenge Blanche's self-image?", "What early tension appears between Blanche and Stanley?", "What does Belle Reve already suggest about loss?"],
    studentPrompts: ["Answer the four reading questions using precise scene details.", "Identify one line, stage direction, or setting detail that could matter later."],
    evidenceTask: "Add two entries: one setting detail and one character detail.",
    miniWrite: "Explain how Williams makes Blanche seem both out of place and in need of sympathy."
  },
  {
    id: "lesson-7-scene-2-territory-truth-and-possession",
    title: "Scene 2: Territory, Truth, and Possession",
    subtitle: "Study the conflict over property, truth, and control.",
    time: "50-60 minutes",
    sources: ["Next Step Unit 5 Streetcar booklet", "CBE Scene 2 overview", "CBE reading guide PDF"],
    target: "Explain how Scene 2 turns family history into a power struggle.",
    output: "Four reading responses, two evidence-bank entries, and one mini-write.",
    miniLesson: [
      "Scene 2 sharpens the first collision into a fight over territory and truth. Stanley treats Blanche's story as something to investigate, while Blanche tries to control how the past is seen and understood.",
      "The trunk, papers, and Belle Reve become more than practical details. They show how property, memory, gender, and suspicion become weapons in the apartment."
    ],
    tracking: ["Stanley's inspection", "Blanche's trunk", "Belle Reve documents", "Stella's divided loyalty", "Stanley's sense of ownership"],
    questions: ["Why does Stanley distrust Blanche's account of Belle Reve?", "How does the trunk become a dramatic object?", "What does Stanley's behavior reveal about control?", "How does Stella respond to the conflict?"],
    studentPrompts: ["Answer the reading questions with attention to objects and power.", "Choose one object and explain how it changes the tone of the scene."],
    evidenceTask: "Add two entries focused on property, truth, or control.",
    miniWrite: "Explain how Williams uses ordinary objects to reveal a fight for power."
  },
  {
    id: "lesson-8-scene-3-poker-night-and-masculine-violence",
    title: "Scene 3: Poker Night and Masculine Violence",
    subtitle: "Read the poker night as a social world under pressure.",
    time: "50-60 minutes",
    sources: ["Next Step Unit 5 Streetcar booklet", "CBE Scene 3 overview", "CBE reading guide PDF"],
    target: "Analyze how Williams stages masculine violence and social loyalty.",
    output: "Four reading responses, two evidence-bank entries, and one mini-write.",
    miniLesson: [
      "The poker night creates a concentrated version of Stanley's world: male friendship, competition, drinking, territory, and physical force. Blanche's presence disturbs that world, but Stanley's violence also exposes what Stella has chosen to live with.",
      "The scene should not be reduced to a single event. Track the mood, the music, the physical space, the men's reactions, and the way desire and violence become linked."
    ],
    tracking: ["Poker table", "Mitch and Blanche", "Stanley's anger", "Stella's return", "Music and shouting"],
    questions: ["How does the poker game define Stanley's world?", "How is Mitch separated from the other men?", "What does Stanley's violence reveal?", "How does Stella's return complicate the audience's judgment?"],
    studentPrompts: ["Answer the reading questions with at least one stage or sound detail.", "Explain how the scene changes your view of Stella or Stanley."],
    evidenceTask: "Add two entries about violence, loyalty, or social pressure.",
    miniWrite: "Explain how Scene 3 links desire, danger, and dependence."
  },
  {
    id: "lesson-9-scene-4-stellas-choice",
    title: "Scene 4: Stella's Choice",
    subtitle: "Examine denial, dependence, and the cost of staying.",
    time: "45-55 minutes",
    sources: ["Next Step Unit 5 Streetcar booklet", "CBE Scene 4 overview", "CBE reading guide PDF"],
    target: "Interpret Stella's choice as a survival strategy with a cost.",
    output: "Four reading responses, two evidence-bank entries, and one mini-write.",
    miniLesson: [
      "Scene 4 asks students to study Stella carefully. She is not simply passive, but her choices are shaped by desire, dependence, pregnancy, social reality, and the life she has built with Stanley.",
      "Blanche tries to name Stanley as dangerous, but Stella is not ready to accept Blanche's interpretation. This creates a major tension in the play: truth may be visible, but accepting it may threaten the life a character needs to keep."
    ],
    tracking: ["Blanche's warning", "Stella's explanation", "Stanley's overhearing", "Desire and dependence", "Sister conflict"],
    questions: ["How does Blanche describe Stanley?", "Why does Stella resist Blanche's judgment?", "What does Stanley overhearing change?", "How does the scene develop illusion versus reality?"],
    studentPrompts: ["Answer the reading questions with attention to Stella's reasoning.", "Identify one moment where truth is avoided or softened."],
    evidenceTask: "Add two entries about Stella, denial, or dependence.",
    miniWrite: "Explain whether Stella's choice is weakness, survival, or both."
  },
  {
    id: "lesson-10-scene-5-rumour-performance-and-panic",
    title: "Scene 5: Rumour, Performance, and Panic",
    subtitle: "Track Blanche's public performance and private fear.",
    time: "45-55 minutes",
    sources: ["Next Step Unit 5 Streetcar booklet", "CBE Scene 5 overview", "CBE reading guide PDF"],
    target: "Analyze how Blanche performs control while panic begins to surface.",
    output: "Four reading responses, two evidence-bank entries, and one mini-write.",
    miniLesson: [
      "Scene 5 shows Blanche managing appearances. She wants to control age, desire, reputation, and the story others can tell about her, but rumours and past actions begin to press into the present.",
      "The scene is useful for essay thinking because it shows illusion as both strategy and danger. Blanche's performance helps her survive socially, but it also makes truthful connection harder."
    ],
    tracking: ["Rumours", "Blanche's flirting", "Age and appearance", "Mitch as hope", "Private panic"],
    questions: ["What rumours begin to threaten Blanche?", "How does Blanche perform confidence?", "Why does Mitch matter to her plan for survival?", "What details reveal panic beneath the performance?"],
    studentPrompts: ["Answer the reading questions with attention to performance.", "Find one moment where Blanche's words and inner state seem different."],
    evidenceTask: "Add two entries about performance, reputation, or panic.",
    miniWrite: "Explain how Williams shows Blanche trying to control how others see her."
  },
  {
    id: "lesson-11-scene-6-confession-and-temporary-hope",
    title: "Scene 6: Confession and Temporary Hope",
    subtitle: "Study intimacy, confession, and fragile possibility.",
    time: "50-60 minutes",
    sources: ["Next Step Unit 5 Streetcar booklet", "CBE Scene 6 overview", "CBE reading guide PDF"],
    target: "Explain how confession creates temporary hope while revealing lasting damage.",
    output: "Four reading responses, two evidence-bank entries, and one mini-write.",
    miniLesson: [
      "Scene 6 slows the play into a more intimate conversation between Blanche and Mitch. The mood creates the possibility of tenderness, but Blanche's confession also reveals the trauma and guilt that continue to shape her.",
      "The scene matters because it complicates Blanche. She is not only deceptive; she is also wounded, lonely, and desperate for a form of protection that may not be possible."
    ],
    tracking: ["Mitch's gentleness", "Blanche's confession", "Young husband", "Varsouviana", "Temporary hope"],
    questions: ["How does Mitch differ from Stanley in this scene?", "What does Blanche reveal about her past?", "How does sound or memory shape the confession?", "Why is the hope in this scene temporary?"],
    studentPrompts: ["Answer the reading questions using one confession detail.", "Identify one detail that makes Blanche more sympathetic or more complex."],
    evidenceTask: "Add two entries about confession, trauma, or hope.",
    miniWrite: "Explain how Scene 6 changes the audience's understanding of Blanche."
  },
  {
    id: "lesson-12-midpoint-checkpoint-scenes-1-6",
    title: "Midpoint Checkpoint: Scenes 1-6",
    subtitle: "Pause, organize evidence, and test early interpretations.",
    time: "45-55 minutes",
    sources: ["Next Step Unit 5 Streetcar booklet", "CBE reading guide PDF", "Course Build"],
    target: "Synthesize early evidence into provisional claims about character and theme.",
    output: "Evidence-bank audit, one theme claim, and one analytical paragraph.",
    miniLesson: [
      "At the midpoint, students should pause before adding more plot. The first six scenes have already established the central tensions: illusion and reality, desire and dependence, class conflict, gendered power, and the difficulty of surviving truth.",
      "A checkpoint prevents shallow reading. Students should check whether their evidence bank has a range of techniques rather than only plot events, and whether each entry could actually support a paragraph."
    ],
    studentPrompts: ["Choose your five strongest evidence-bank entries so far and explain what each could prove.", "Write one provisional theme claim that is specific enough to argue."],
    evidenceTask: "Revise at least two evidence-bank entries to strengthen technique and theme connection.",
    miniWrite: "Write one analytical paragraph about Blanche, Stella, or Stanley using two pieces of evidence."
  },
  {
    id: "lesson-13-scene-7-exposure-and-dramatic-irony",
    title: "Scene 7: Exposure and Dramatic Irony",
    subtitle: "Track exposure, timing, and audience knowledge.",
    time: "50-60 minutes",
    sources: ["Next Step Unit 5 Streetcar booklet", "CBE Scene 7 overview", "CBE reading guide PDF"],
    target: "Analyze how dramatic irony increases pressure on Blanche and Stella.",
    output: "Four reading responses, two evidence-bank entries, and one mini-write.",
    miniLesson: [
      "Scene 7 turns Blanche's past into information that Stanley can use. The audience understands more than some characters do at the same moment, which creates dramatic irony and dread.",
      "Exposure in the play is not neutral truth-telling. Stanley's knowledge becomes a weapon, and Stella's willingness to hear or reject that knowledge becomes part of the conflict."
    ],
    tracking: ["Stanley's information", "Birthday preparations", "Blanche bathing", "Stella's reaction", "Dramatic irony"],
    questions: ["What information does Stanley reveal?", "How does timing make the reveal more painful?", "How does Stella respond?", "How does dramatic irony shape the audience's experience?"],
    studentPrompts: ["Answer the reading questions with focus on timing and knowledge.", "Identify one detail that makes truth feel cruel rather than liberating."],
    evidenceTask: "Add two entries about exposure, truth, or dramatic irony.",
    miniWrite: "Explain how Scene 7 turns knowledge into power."
  },
  {
    id: "lesson-14-scene-8-birthday-cruelty-and-collapse",
    title: "Scene 8: Birthday, Cruelty, and Collapse",
    subtitle: "Analyze celebration as humiliation.",
    time: "45-55 minutes",
    sources: ["Next Step Unit 5 Streetcar booklet", "CBE Scene 8 overview", "CBE reading guide PDF"],
    target: "Explain how Williams turns a birthday scene into a collapse of hope.",
    output: "Four reading responses, two evidence-bank entries, and one mini-write.",
    miniLesson: [
      "The birthday scene should feel wrong. A celebration normally signals care and belonging, but here it becomes a stage for cruelty, absence, and emotional collapse.",
      "Stanley's gift and Mitch's absence show Blanche that her hoped-for escape is failing. The scene also tests Stella's ability to protect Blanche while remaining attached to Stanley."
    ],
    tracking: ["Birthday table", "Mitch's absence", "Stanley's gift", "Stella's discomfort", "Blanche's collapse"],
    questions: ["Why does the birthday scene feel tense instead of celebratory?", "What does Mitch's absence signal?", "How does Stanley's gift function dramatically?", "What does Stella's response reveal?"],
    studentPrompts: ["Answer the reading questions with attention to irony.", "Choose one object or absence and explain its emotional effect."],
    evidenceTask: "Add two entries about cruelty, collapse, or failed rescue.",
    miniWrite: "Explain how Scene 8 makes Blanche's hope feel increasingly impossible."
  },
  {
    id: "lesson-15-scene-9-realism-vs-magic",
    title: "Scene 9: Realism vs. Magic",
    subtitle: "Study the paper lantern, exposure, and the need for illusion.",
    time: "50-60 minutes",
    sources: ["Next Step Unit 5 Streetcar booklet", "CBE Scene 9 overview", "CBE reading guide PDF"],
    target: "Analyze how light and truth expose Blanche's conflict between realism and magic.",
    output: "Four reading responses, two evidence-bank entries, and one mini-write.",
    miniLesson: [
      "Scene 9 brings Mitch and Blanche into a confrontation over truth. Mitch wants to see Blanche plainly, while Blanche insists that she has needed magic rather than realism.",
      "The paper lantern is one of the play's clearest symbols because it changes meaning across the drama. It can be decoration, protection, illusion, performance, and finally a sign of exposure."
    ],
    tracking: ["Mitch after the birthday", "Light and paper lantern", "Blanche's account of truth", "Tarantula Arms", "Flower vendor"],
    questions: ["Why does Mitch want the light?", "What does Blanche mean by magic?", "How does the paper lantern change in this scene?", "How does the flower vendor deepen the scene's meaning?"],
    studentPrompts: ["Answer the reading questions using one light or sound detail.", "Trace the paper lantern before and during this scene."],
    evidenceTask: "Add two entries about light, truth, or illusion.",
    miniWrite: "Analyze the paper lantern as a symbol before, during, and after Mitch tears it down."
  },
  {
    id: "lesson-16-scene-10-violence-and-inevitable-collision",
    title: "Scene 10: Violence and Inevitable Collision",
    subtitle: "Handle the final Blanche/Stanley collision with care and precision.",
    time: "50-60 minutes",
    sources: ["Next Step Unit 5 Streetcar booklet", "CBE Scene 10 overview", "CBE reading guide PDF"],
    target: "Analyze how dramatic technique shows Blanche losing control of reality.",
    output: "Four reading responses, two evidence-bank entries, and one mini-write.",
    miniLesson: [
      "Content note: this scene includes sexual violence. Handle the event academically and respectfully, without graphic detail and without sensationalizing it. Do not ignore what happens, but focus on how Williams stages power, fear, fantasy, and collapse.",
      "Scene 10 makes Blanche's rescue fantasies fail under Stanley's physical and psychological dominance. Costume, phone calls, sound, movement, and expressionistic effects all show the boundary between illusion and reality breaking down."
    ],
    tracking: ["Blanche's costume", "Stanley's return", "Shep fantasy", "Phone failure", "Expressionistic effects"],
    questions: ["How does Blanche's costume reveal fantasy?", "How does Stanley identify and exploit Blanche's lies?", "What does the failed phone call show?", "How do dramatic effects represent Blanche's loss of control?"],
    studentPrompts: ["Answer the reading questions with respectful academic language.", "Identify one dramatic technique that shows psychological collapse."],
    evidenceTask: "Add two entries about fantasy, violence, power, or stagecraft.",
    miniWrite: "Explain how Williams uses dramatic technique to show Blanche losing control of reality."
  },
  {
    id: "lesson-17-scene-11-denial-and-continuation",
    title: "Scene 11: Denial and Continuation",
    subtitle: "Read the ending as surface order built on denial.",
    time: "50-60 minutes",
    sources: ["CBE Scene 11 overview", "CBE reading guide PDF", "Next Step film and essay transition"],
    target: "Explain why the ending remains tragic even as social order appears restored.",
    output: "Five reading responses, three evidence-bank entries, and one final scene mini-write.",
    miniLesson: [
      "Scene 11 returns to poker, packing, and social routine. On the surface, order is restored. Underneath, that order depends on denial, institutionalization, Mitch's remorse, Stella's self-protection, and Stanley's world continuing.",
      "The ending asks students to think carefully about survival. Stella may need denial to continue living, but that does not make the ending morally clean. The final image and soundscape keep the tragedy active."
    ],
    tracking: ["Poker game returning", "Stella packing", "Eunice's advice", "Mitch's remorse", "Paper lantern", "Final line"],
    questions: ["What has changed since the earlier poker night?", "How does Stella handle Blanche's removal?", "Why does Eunice advise denial?", "What does Mitch's remorse reveal?", "Why is the ending tragic despite restored order?"],
    studentPrompts: ["Answer the reading questions with focus on ending and continuation.", "Choose the final image, final line, or sound effect and explain its impact."],
    evidenceTask: "Add three final scene entries. By the end of this lesson, aim for 22-25 usable evidence-bank entries.",
    miniWrite: "Explain why the ending is tragic even though order appears to be restored."
  },
  {
    id: "lesson-18-motifs-and-sound",
    title: "Motifs and Sound",
    subtitle: "Trace repeated sound and motif patterns across the whole play.",
    time: "45-55 minutes",
    sources: ["CBE Motifs and Symbols", "CBE Song Symbolism", "CBE film sound resource"],
    target: "Trace how repeated motifs and sounds reveal what characters cannot say directly.",
    output: "Two motif traces and one sound-focused mini-write.",
    miniLesson: [
      "Now that the play has been read, motifs should be studied as patterns rather than spoilers. The blue piano, Varsouviana polka, streetcar names, bathing, paper lantern, flowers, and poker cycle all gather meaning as they repeat.",
      "Sound is especially important because it can reveal emotional pressure without a narrator. Music, vendor cries, trains, shouting, and silence can all externalize what characters avoid saying directly."
    ],
    studentPrompts: ["Choose two motifs and trace each through at least three moments.", "Explain how the meaning of one motif changes from early to late scenes."],
    evidenceTask: "Complete motif tracking rows for two motifs using early, middle, and final appearances.",
    miniWrite: "Explain how Williams uses sound to show what characters cannot say directly."
  },
  {
    id: "lesson-19-symbols-and-stagecraft",
    title: "Symbols and Stagecraft",
    subtitle: "Move from object spotting to dramatic method.",
    time: "45-55 minutes",
    sources: ["CBE Symbols", "CBE Motifs and Symbols", "CBE modern drama toolkit"],
    target: "Analyze how symbols and stagecraft change meaning across the drama.",
    output: "Three symbol/stagecraft chart rows and one analytical paragraph.",
    miniLesson: [
      "Symbols in Streetcar are not fixed labels. Light, the paper lantern, costume, flowers, Belle Reve, bathing, music, space, the trunk, letters, radio, and ticket all shift meaning depending on context.",
      "Stagecraft matters because the audience experiences symbols through performance. A symbol may be seen, hidden, torn, heard, carried, touched, or placed in a room where another character can control it."
    ],
    studentPrompts: ["Choose three symbols or stagecraft elements and explain literal object, abstract meaning, key scene, and essay use.", "Identify how one symbol changes by the end of the play."],
    evidenceTask: "Add or revise three evidence-bank entries so each includes technique and essay use.",
    miniWrite: "Choose one symbol and explain how its meaning changes by the end of the play."
  },
  {
    id: "lesson-20-relationships-and-power",
    title: "Relationships and Power",
    subtitle: "Map how power shifts among the central relationships.",
    time: "45-55 minutes",
    sources: ["CBE Relationships rebuilt", "CBE scene overviews", "Next Step scene questions"],
    target: "Evaluate which relationship most shapes Blanche's destruction and why.",
    output: "Relationship power table and one defended relationship-map response.",
    miniLesson: [
      "The relationships page needs to be one of the strongest synthesis lessons because the play's themes live inside relationship dynamics. Blanche and Stanley, Blanche and Stella, Stella and Stanley, Blanche and Mitch, Stella and Eunice, and the poker world each show a different power arrangement.",
      "Power is not static. It shifts through information, desire, violence, dependence, social judgment, and who controls the story that others believe."
    ],
    studentPrompts: ["Complete a relationship row for beginning dynamic, turning point, ending dynamic, power shift, and evidence.", "Which relationship is most responsible for Blanche's destruction? Defend your answer with three pieces of evidence."],
    evidenceTask: "Add one evidence entry for each of three relationship dynamics.",
    miniWrite: "Explain which character adapts best to reality and what that adaptation costs."
  },
  {
    id: "lesson-21-themes-synthesis",
    title: "Themes Synthesis",
    subtitle: "Turn theme labels into essay-ready ideas.",
    time: "45-55 minutes",
    sources: ["CBE Themes", "CBE Motifs and Symbols", "Next Step formative questions"],
    target: "Build arguable thesis statements from theme patterns and evidence.",
    output: "Three possible theses and one strongest-thesis justification.",
    miniLesson: [
      "A theme is not a topic word. Illusion, desire, dependence, truth, class, gender, trauma, and judgment are only starting points. A strong theme statement explains what the play reveals about human behavior or social pressure.",
      "The best thesis options connect a theme to a character focus and to evidence that can sustain a full essay. If the thesis only retells the plot, it is not ready."
    ],
    studentPrompts: ["Build three possible thesis statements using three different themes.", "Choose the strongest thesis and explain why it can support a full essay."],
    evidenceTask: "Select at least six evidence entries that could support your strongest theme-to-thesis idea.",
    miniWrite: "Revise one weak theme statement into a stronger analytical idea."
  },
  {
    id: "lesson-22-film-adaptation-lab",
    title: "Film Adaptation Lab",
    subtitle: "Compare stage text and film choices as interpretation.",
    time: "60-75 minutes",
    sources: ["Next Step film transition", "CBE film study resources", "Course Film Room"],
    target: "Compare how stage and film techniques shape audience understanding.",
    output: "Two film comparison rows and one adaptation mini-write.",
    miniLesson: [
      "The film adaptation is not filler after the play. It is a second interpretation of the same dramatic material. Camera distance, angle, lighting, mise-en-scene, sound, performance, cuts, and set design can emphasize or soften details from the stage text.",
      "Use the Film Room to choose moments for comparison. Before viewing, choose two scenes. During viewing, track performance, lighting, sound, camera, and setting. After viewing, decide which version is more effective for character or theme."
    ],
    studentPrompts: ["Open the Film Room and choose two scenes or moments to compare.", "Complete comparison rows for stage detail, film choice, effect, and which version is more effective."],
    evidenceTask: "Add two evidence entries that compare stage direction or dramatic detail with film adaptation choice.",
    miniWrite: "How does the film adaptation change the audience's understanding of Blanche, Stanley, or Stella?"
  },
  {
    id: "lesson-23-critical-analytical-essay-bootcamp",
    title: "Critical/Analytical Essay Bootcamp",
    subtitle: "Move from evidence bank to essay plan.",
    time: "60-75 minutes",
    sources: ["Next Step Critical/Analytical Essay HOW TO", "Next Step rubric", "CBE writing a critical analytical response"],
    target: "Build an essay plan that avoids plot summary and supports a controlling idea.",
    output: "Decoded prompt, thesis, 4-6 evidence choices, outline, and one body paragraph.",
    miniLesson: [
      "No outline, no essay. If you cannot identify your thesis, topic sentences, evidence, and analysis before drafting, you are not ready to write the final Critical/Analytical response.",
      "Essay bootcamp connects prompt decoding, AGTT, character angle, thesis control, evidence selection, topic sentences, PEAL or PETAL paragraph structure, and analysis that explains significance rather than retelling events."
    ],
    studentPrompts: ["Decode one prompt by identifying key terms, task, character angle, and possible theme.", "Use the Thesis Workshop and your evidence bank to draft one full outline."],
    evidenceTask: "Choose 4-6 evidence-bank entries and mark how each will support a body paragraph.",
    miniWrite: "Write one complete body paragraph that integrates evidence and explains significance."
  },
  {
    id: "lesson-24-samples-rubric-and-final-essay",
    title: "Samples, Rubric, and Final Essay",
    subtitle: "Use samples and rubric language before final submission.",
    time: "60-75 minutes",
    sources: ["CBE CAR samples", "Next Step essay prompts", "Next Step Critical/Analytical rubric"],
    target: "Apply rubric categories to improve final essay planning and revision.",
    output: "Rubric self-assessment, prompt choice, final thesis, planning table, and final submission note.",
    miniLesson: [
      "The rubric categories are Thought and Understanding, Supporting Evidence, Form and Structure, Matters of Choice, and Matters of Correctness. In student language, ask whether ideas are insightful, evidence is precise and explained, structure is controlled, diction is purposeful, and sentence control is clean enough not to distract.",
      "Final prompt choices can focus on resilience shaped by reality, motivations that direct individual action, imagination or illusion as refuge or trap, independence and relationships, or courage and separation. Each prompt must become Streetcar-ready through a specific character angle and evidence plan."
    ],
    studentPrompts: ["Read one sample and identify thesis, topic sentences, best evidence, strongest rubric category, and one possible improvement.", "Choose your final prompt and write your final thesis."],
    evidenceTask: "Complete a final essay planning table that connects prompt, thesis, body topics, evidence, and rubric priorities.",
    miniWrite: "Write final submission instructions for yourself: what must be checked before the essay is handed in?"
  }
];

function renderSourceChips(sources: string[]) {
  return `<div class="source-chip-row">${sources
    .map((source) => `<span class="source-chip">${escapeHtml(source)}</span>`)
    .join("")}</div>`;
}

function renderPromptTextareas(lesson: AuthoredLessonSpec) {
  return lesson.studentPrompts
    .map((prompt, index) => `<label class="student-response-field">
      <span>${escapeHtml(prompt)}</span>
      <textarea data-response-id="${escapeHtml(`${lesson.id}-prompt-${index + 1}`)}" rows="4"></textarea>
      <small>Saved locally in this browser.</small>
    </label>`)
    .join("\n");
}

function renderEvidenceTable(lesson: AuthoredLessonSpec) {
  return `<div class="evidence-table-wrap">
    <table class="evidence-bank-table">
      <thead>
        <tr>
          <th>Evidence</th>
          <th>Technique</th>
          <th>What it reveals</th>
          <th>Theme connection</th>
          <th>Essay use</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><textarea data-response-id="${escapeHtml(`${lesson.id}-evidence`)}" rows="3"></textarea></td>
          <td><textarea data-response-id="${escapeHtml(`${lesson.id}-technique`)}" rows="3"></textarea></td>
          <td><textarea data-response-id="${escapeHtml(`${lesson.id}-reveals`)}" rows="3"></textarea></td>
          <td><textarea data-response-id="${escapeHtml(`${lesson.id}-theme`)}" rows="3"></textarea></td>
          <td><textarea data-response-id="${escapeHtml(`${lesson.id}-essay-use`)}" rows="3"></textarea></td>
        </tr>
      </tbody>
    </table>
    <p class="local-save-note">Saved locally in this browser.</p>
  </div>`;
}

function renderSceneWork(lesson: AuthoredLessonSpec) {
  if (!lesson.tracking || !lesson.questions) {
    return "";
  }
  return `<section class="lesson-block scene-reading-task">
    <h3>Read Instruction</h3>
    <p>Read the assigned scene in your copy of <em>A Streetcar Named Desire</em>. Do not replace the reading with a summary. Use the questions below to focus your attention while you read.</p>
    <h3>Track While Reading</h3>
    <ul>${lesson.tracking.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    <h3>Reading Questions</h3>
    ${lesson.questions
      .map((question, index) => `<label class="student-response-field">
        <span>${escapeHtml(question)}</span>
        <textarea data-response-id="${escapeHtml(`${lesson.id}-question-${index + 1}`)}" rows="4"></textarea>
        <small>Saved locally in this browser.</small>
      </label>`)
      .join("\n")}
  </section>`;
}

function renderAuthoredLessonHtml(lesson: AuthoredLessonSpec) {
  return `<div class="authored-lesson">
    ${renderSourceChips(lesson.sources)}
    <section class="lesson-block lesson-header-block">
      <h1>${escapeHtml(lesson.title)}</h1>
      <p>${escapeHtml(lesson.subtitle)}</p>
      <p class="lesson-time">Estimated time: ${escapeHtml(lesson.time)}</p>
    </section>
    <section class="lesson-block learning-target">
      <h3>Learning Target</h3>
      <p>${escapeHtml(lesson.target)}</p>
    </section>
    <section class="lesson-block required-output">
      <h3>Required Output</h3>
      <p>${escapeHtml(lesson.output)}</p>
    </section>
    <section class="lesson-block mini-lesson">
      <h3>Mini-lesson</h3>
      ${lesson.miniLesson.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n")}
    </section>
    ${renderSceneWork(lesson)}
    <section class="lesson-block student-work">
      <h3>Student Work</h3>
      ${renderPromptTextareas(lesson)}
    </section>
    <section class="lesson-block evidence-bank">
      <h3>Evidence Bank</h3>
      <p>${escapeHtml(lesson.evidenceTask)}</p>
      ${renderEvidenceTable(lesson)}
    </section>
    <section class="lesson-block mini-write">
      <h3>Mini-write / Exit Task</h3>
      <p>${escapeHtml(lesson.miniWrite)}</p>
      <label class="student-response-field">
        <span>Draft your response here.</span>
        <textarea data-response-id="${escapeHtml(`${lesson.id}-mini-write`)}" rows="5"></textarea>
        <small>Saved locally in this browser.</small>
      </label>
    </section>
  </div>`;
}

function authoredLessonToModernDramaLesson(lesson: AuthoredLessonSpec, sequence: number): ModernDramaLesson {
  const contentHtml = renderAuthoredLessonHtml(lesson);
  const text = normalizeWhitespace(
    [
      lesson.title,
      lesson.subtitle,
      lesson.target,
      lesson.output,
      ...lesson.miniLesson,
      ...lesson.studentPrompts,
      lesson.evidenceTask,
      lesson.miniWrite,
      ...(lesson.tracking ?? []),
      ...(lesson.questions ?? [])
    ].join(" ")
  );
  return {
    id: lesson.id,
    sequence,
    title: lesson.title,
    sourceKind: "html",
    sourceHref: `authored-v2/${lesson.id}.html`,
    contentHtml,
    text,
    images: [],
    videos: [],
    links: []
  };
}

function buildStreetcarLibraryDocuments(): ModernDramaLibraryDocument[] {
  return [
    {
      id: "primary-text-streetcar",
      group: "Primary Text",
      title: "A Streetcar Named Desire",
      sourceLabel: "Next Step",
      description: "Canonical student reading copy included under course-owner distribution rights.",
      workspaceHref: "./assets/source/a-streetcar-named-desire.pdf",
      zipPath: "English 30-1/ELA 30-1 Readings/A Streetcar Named Desire pdf.pdf",
      kind: "pdf"
    },
    {
      id: "cbe-streetcar-reading-guide",
      group: "Reading Guides",
      title: "CBE Streetcar Reading Guide",
      sourceLabel: "CBE",
      description: "Compact scene question bank used to support reading responses.",
      workspaceHref: "./assets/source/cbe-streetcar-reading-guide.pdf",
      zipPath: "streetcar_named_desire/assets/A Streetcar Named Desire questions.pdf",
      kind: "pdf"
    },
    {
      id: "nextstep-unit5-streetcar",
      group: "Reading Guides",
      title: "Next Step Unit 5 Streetcar Booklet",
      sourceLabel: "Next Step",
      description: "Primary formative reading question source for Scenes 1-10.",
      workspaceHref: "./assets/source/nextstep-unit5-streetcar.docx",
      zipPath: "English 30-1/ELA 30-1 Unit 5 A Streetcar Named Desire.docx",
      kind: "other"
    },
    {
      id: "critical-analytical-how-to",
      group: "Essay Supports",
      title: "Critical/Analytical Essay HOW TO",
      sourceLabel: "Next Step",
      description: "Student-facing process guide for Critical/Analytical essay planning.",
      workspaceHref: "./assets/source/critical-analytical-essay-how-to.pdf",
      zipPath: "English 30-1/LA30-1 Summative assessments/Unit 5- Modern Drama/Critical_Analytical Essay HOW TO.pdf",
      kind: "pdf"
    },
    {
      id: "critical-analytical-rubric",
      group: "Essay Supports",
      title: "Critical/Analytical Rubric",
      sourceLabel: "Next Step",
      description: "Rubric source for Thought and Understanding, Supporting Evidence, Form and Structure, Matters of Choice, and Matters of Correctness.",
      workspaceHref: "./assets/source/critical-analytical-rubric.doc",
      zipPath: "English 30-1/LA30-1 Summative assessments/Unit 5- Modern Drama/ELA 10-1 20-1 30-1 Critical-Analytical Rubric.doc",
      kind: "other"
    },
    {
      id: "modern-drama-resilience-essay",
      group: "Essay Supports",
      title: "Modern Drama Resilience Essay Prompt",
      sourceLabel: "Next Step",
      description: "Prompt bank source for resilience shaped by reality.",
      workspaceHref: "./assets/source/modern-drama-resilience-essay.docx",
      zipPath: "English 30-1/LA30-1 Summative assessments/Unit 5- Modern Drama/Units 5 DramaFilm _resilience_ Critical-Analytical Essay.docx",
      kind: "other"
    }
  ];
}

function buildAuthoredStreetcarV2Unit(baseUnit: ModernDramaUnit): ModernDramaUnit {
  const image = firstUnitImage(baseUnit);
  const lessons = AUTHORED_STREETCAR_LESSONS.map((lesson, index) => authoredLessonToModernDramaLesson(lesson, index + 1));
  if (image) {
    lessons[0] = {
      ...lessons[0],
      images: baseUnit.lessons.flatMap((lesson) => lesson.images).slice(0, 1)
    };
  }

  return {
    title: "A Streetcar Named Desire",
    lessons,
    localResources: [],
    libraryDocuments: buildStreetcarLibraryDocuments(),
    filmResources: [
      {
        id: "streetcar-full-film",
        title: "Streetcar Named Desire Movie",
        originalSrc: "./assets/media/streetcar-named-desire-movie.mp4",
        embedSrc: "./assets/media/streetcar-named-desire-movie.mp4",
        origin: "local",
        sourceTitle: "Film Adaptation Lab",
        mediaType: "video/mp4"
      }
    ]
  };
}

type UnitDocumentItem = {
  id: string;
  title: string;
  sourceTitle?: string;
  group?: string;
  sourceLabel?: string;
  description?: string;
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
  if (unit.libraryDocuments && unit.libraryDocuments.length > 0) {
    return uniqueBy(
      unit.libraryDocuments.map((document) => ({
        ...document,
        sourceTitle: document.group
      })),
      (document) => document.workspaceHref
    );
  }

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
  for (const video of unit.filmResources ?? []) {
    const key = video.embedSrc;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    videos.push({
      ...video,
      title: video.title,
      id: video.id ?? `film-${videos.length + 1}-${toSafeId(video.title)}`,
      sourceTitle: video.sourceTitle ?? "Film Room"
    });
  }
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
  nextStepZipPath?: string;
  moviePath?: string;
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
    generatedOutputs: [
      path.join(repoRoot, "projects", options.slug, "exports", "ela30-1-modern-drama-v2.zip")
    ],
    regenerateCommand: `npx tsx scripts/build-ela-modern-drama.ts --zip "${options.zipPath}" --nextstep-zip "${options.nextStepZipPath ?? DEFAULT_NEXT_STEP_ZIP_PATH}" --movie "${options.moviePath ?? DEFAULT_STREETCAR_MOVIE_PATH}" --slug ${options.slug} --force`,
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
    },
    {
      id: "evidence-collector-workshop",
      source: EVIDENCE_COLLECTOR_ACTIVITY_SOURCE,
      target: `projects/${options.slug}/workspace/index.html#writing`,
      status: "active",
      notes: "Converted from the external evidence collector TSX into the static Writing Studio shell."
    },
    {
      id: "paragraph-architect-workshop",
      source: PARAGRAPH_ARCHITECT_ACTIVITY_SOURCE,
      target: `projects/${options.slug}/workspace/index.html#writing`,
      status: "active",
      notes: "Converted from the external PETAL paragraph architect TSX into the static Writing Studio shell."
    }
  ],
    importedFirstPassOrigin: {
      sourceSystem: "brightspace",
      sourcePath: options.zipPath,
      importedAt: options.generatedAt,
      notes: `D2L/Brightspace Streetcar unit kept as the lesson source of truth. Next Step source package supplies Library documents, and the local movie path supplies the Film Room asset. Next Step source: ${options.nextStepZipPath ?? DEFAULT_NEXT_STEP_ZIP_PATH}.`
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
        <small>${escapeHtml(document.group ? `${document.group} | ${document.sourceLabel ?? document.kind.toUpperCase()}` : document.kind.toUpperCase())}</small>
      </span>
    </button>`)
    .join("\n");
  const groupSummary = uniqueBy(
    documents.map((document) => document.group).filter((group): group is string => Boolean(group)),
    (group) => group
  )
    .map((group) => `<span class="library-group-chip">${escapeHtml(group)}</span>`)
    .join("");
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
            <span class="resource-kicker">${escapeHtml(document.sourceLabel ?? document.kind.toUpperCase())} Source</span>
            <h3>${escapeHtml(document.title)}</h3>
            <p>${escapeHtml(document.description ?? `Source lesson: ${document.sourceTitle ?? "Course resource"}`)}</p>
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
      <p>PDFs and source documents are collected here so Resources can stay focused on supplemental links and workflow guidance.</p>
      ${groupSummary ? `<div class="library-group-list">${groupSummary}</div>` : ""}
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
    .map((video, index) => {
      const media = video.origin === "local"
        ? `<video class="film-room-frame" controls preload="metadata">
            <source src="${escapeHtml(video.embedSrc)}" type="${escapeHtml(video.mediaType ?? "video/mp4")}">
          </video>`
        : `<iframe class="film-room-frame" src="${escapeHtml(video.embedSrc)}" title="${escapeHtml(video.title)}" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      return `<article class="film-panel" data-film-panel="${escapeHtml(video.id)}"${index === 0 ? "" : " hidden"}>
      ${media}
    </article>`;
    })
    .join("\n");
  const playlist = videos
    .map((video, index) => `<option value="${escapeHtml(video.id)}"${index === 0 ? " selected" : ""}>${escapeHtml(video.title)}</option>`)
    .join("\n");
  const nowLoaded = videos
    .map((video, index) => `<article class="film-now-panel" data-film-now-panel="${escapeHtml(video.id)}"${index === 0 ? "" : " hidden"}>
        <span class="resource-kicker">Now loaded</span>
        <h3>${escapeHtml(video.title)}</h3>
        <p class="film-now-source">${escapeHtml(video.sourceTitle)}</p>
        <p>${video.origin === "local" ? "Local course film resource packaged with this build." : `Media resource from ${escapeHtml(video.sourceTitle)}.`}</p>
        <div class="film-now-footer">
          <span class="resource-kicker">${video.origin === "local" ? "Local Media" : "Embedded Source"}</span>
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
        <a class="film-source-link" href="#lesson-22-film-adaptation-lab" data-page-target="lesson-22-film-adaptation-lab">Back to Lesson 22</a>
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
  const externalCards = links.length === 0
    ? `<article class="empty-route-card">
        <span class="material-symbols-outlined" aria-hidden="true">travel_explore</span>
        <h3>Supplemental links only</h3>
        <p>The main unit is built from local CBE and Next Step sources. External study-guide links should only support review.</p>
      </article>`
    : links
      .map((link) => `<article class="external-resource-card">
      <span class="resource-kicker">External Source</span>
      <h3>${escapeHtml(link.text)}</h3>
      <p>Captured from ${escapeHtml(link.sourceTitle)}. Use this as a supplemental review stop, not as the main learning source.</p>
      <a class="external-resource-action" href="${escapeHtml(link.workspaceHref)}" target="_blank" rel="noopener noreferrer">Open Resource</a>
    </article>`)
      .join("\n");

  return `<div class="resource-stack">
    <section class="resource-workflow-card">
      <h3>Student Workflow</h3>
      <ol>
        <li>Read the assigned scene.</li>
        <li>Answer the core questions.</li>
        <li>Add evidence to the bank.</li>
        <li>Write the mini-response.</li>
        <li>Mark the lesson complete.</li>
        <li>Use evidence in the final essay.</li>
      </ol>
    </section>
    <section class="resource-workflow-card">
      <h3>Teacher Source Map</h3>
      <p>CBE modern drama and Streetcar files provide unit framing, scene support, motifs, symbols, themes, film terminology, and writing samples. Next Step Unit 5 provides the core Streetcar reading questions for Scenes 1-10, while CBE reading guide questions support Scene 11 and final synthesis. Next Step essay supports provide rubric language and Critical/Analytical prompt banks.</p>
    </section>
    <div class="external-resource-grid">${externalCards}</div>
  </div>`;
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
    },
    {
      id: "evidenceCollector",
      title: "Evidence Collector",
      icon: "fact_check",
      description: EVIDENCE_COLLECTOR_ACTIVITY.description
    },
    {
      id: "paragraphArchitect",
      title: "Paragraph Architect",
      icon: "architecture",
      description: PARAGRAPH_ARCHITECT_ACTIVITY.description
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
.library-group-chip { display: inline-flex; align-items: center; min-height: 28px; border: 1px solid #c2c9bb; border-radius: 8px; background: #f3f7f1; color: #154212; padding: 4px 9px; font-family: "IBM Plex Sans"; font-size: 12px; line-height: 1.3; }
.source-image { display: block; width: min(100%, 680px); max-height: 360px; object-fit: cover; border-radius: 8px; border: 1px solid #e1e3e4; margin: 18px 0; }
.source-video-frame { display: block; width: min(100%, 760px); aspect-ratio: 16 / 9; min-height: 220px; height: auto; border: 1px solid #d9dadb; border-radius: 8px; background: #000; margin: 18px 0; }
.source-document-frame { display: block; width: min(100%, 760px); height: 620px; border: 1px solid #d9dadb; border-radius: 8px; background: #fff; margin: 18px 0; }
.embedded-video-section { margin-top: 24px; max-width: 760px; }
.source-video-card { border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; padding: 12px; }
.source-video-card .source-video-frame { width: 100%; margin: 0; min-height: 220px; }
.source-video-meta { display: flex; flex-direction: column; gap: 4px; padding-top: 10px; }
.source-video-meta strong { font-family: "Hanken Grotesk"; font-size: 17px; line-height: 1.3; color: #191c1d; }
.source-video-meta a { font-family: "IBM Plex Sans"; font-size: 14px; color: #154212; text-decoration: underline; text-underline-offset: 3px; }
.scene-overview-browser { display: grid; gap: 18px; }
.scene-overview-control { display: grid; gap: 8px; max-width: 360px; border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; padding: 16px; }
.scene-overview-panel { border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; padding: 18px; }
.scene-overview-panel-header { margin-bottom: 12px; }
.scene-overview-panel-header h3 { font-family: "Hanken Grotesk"; font-size: 24px; line-height: 1.2; margin: 4px 0 0; color: #191c1d; }
.resource-kicker { display: block; font-family: "IBM Plex Sans"; font-size: 12px; line-height: 1.4; font-weight: 600; color: #154212; text-transform: uppercase; letter-spacing: 0; }
.external-resource-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
.resource-stack { display: grid; gap: 18px; }
.resource-workflow-card { border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; padding: 18px; }
.resource-workflow-card h3 { margin: 0 0 10px; font-family: "Hanken Grotesk"; font-size: 22px; line-height: 1.2; color: #191c1d; }
.resource-workflow-card p, .resource-workflow-card li { color: #42493e; line-height: 1.55; }
.resource-workflow-card ol { margin: 0 0 0 22px; }
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
.library-group-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
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
.evidence-collector { display: flex; flex-direction: column; gap: 20px; }
.evidence-category-stack { display: grid; gap: 22px; }
.evidence-category h5, .evidence-use-note h5 { margin: 0 0 10px; font-family: "IBM Plex Sans"; font-size: 13px; line-height: 1.3; color: #154212; }
.evidence-choice strong { margin-bottom: 6px; }
.evidence-output { display: grid; gap: 12px; }
.evidence-use-note { border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; padding: 14px; }
.evidence-use-note p { margin: 0; color: #42493e; line-height: 1.5; }
.paragraph-architect { display: flex; flex-direction: column; gap: 20px; }
.paragraph-mode-tabs { display: inline-flex; flex-wrap: wrap; gap: 8px; align-self: flex-start; border: 1px solid #e1e3e4; border-radius: 8px; background: #f8f9fa; padding: 6px; }
.paragraph-mode-tab { min-height: 40px; display: inline-flex; align-items: center; gap: 8px; border: 1px solid transparent; border-radius: 8px; background: transparent; color: #42493e; padding: 8px 12px; font-family: "IBM Plex Sans"; font-size: 13px; }
.paragraph-mode-tab.active, .paragraph-mode-tab:hover, .paragraph-mode-tab:focus-visible { border-color: #2d5a27; background: #fff; color: #154212; outline: none; }
.paragraph-framework-stack { display: grid; gap: 14px; }
.paragraph-framework-card { display: grid; grid-template-columns: 48px minmax(0, 1fr); gap: 14px; border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; padding: 16px; }
.paragraph-framework-card > span { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border: 1px solid #c2c9bb; border-radius: 8px; background: #f3f7f1; color: #154212; font-family: "Hanken Grotesk"; font-size: 24px; font-weight: 800; }
.paragraph-framework-card h5 { margin: 0 0 6px; font-family: "Hanken Grotesk"; font-size: 20px; line-height: 1.25; color: #191c1d; }
.paragraph-framework-card p { margin: 0 0 8px; color: #42493e; line-height: 1.5; }
.paragraph-framework-card small { display: block; color: #154212; line-height: 1.45; }
.paragraph-scenario-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
.paragraph-scenario-card { min-height: 118px; border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; color: #191c1d; padding: 16px; text-align: left; }
.paragraph-scenario-card:hover, .paragraph-scenario-card:focus-visible { border-color: #2d5a27; background: #f3f7f1; outline: none; }
.paragraph-scenario-card small { display: block; margin-bottom: 8px; font-family: "IBM Plex Sans"; font-size: 12px; line-height: 1.3; color: #154212; }
.paragraph-scenario-card strong { display: block; font-family: "Hanken Grotesk"; font-size: 19px; line-height: 1.25; }
.paragraph-choice strong { font-size: 16px; line-height: 1.45; }
.paragraph-preview { display: grid; gap: 8px; }
.paragraph-preview p { margin: 0; color: #42493e; line-height: 1.6; }
.paragraph-preview span { color: #7a8177; font-style: italic; }
.paragraph-output { display: grid; gap: 12px; }
.paragraph-checklist { border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; padding: 14px; }
.paragraph-checklist h5 { margin: 0 0 8px; font-family: "IBM Plex Sans"; font-size: 13px; color: #154212; }
.paragraph-checklist ul { margin: 0 0 0 20px; color: #42493e; line-height: 1.5; }
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
const RESPONSE_STORAGE_KEY = "canvas-helper:ela30-1-modern-drama:responses";
const pages = Array.from(document.querySelectorAll(".course-page"));
const lessonIds = ${JSON.stringify(unit.lessons.map((lesson) => lesson.id))};
const totalLessons = ${totalLessons};
const staticPages = ["overview","lessons","writing","library","film-room","resources"];
const lessonsNav = document.querySelector("[data-lessons-nav]");
const lessonsToggle = document.querySelector("[data-lessons-toggle]");
const criticalResponseQuestionGroups = ${scriptJson(CRITICAL_RESPONSE_WORKSHOPS)};
const thesisBuilderActivity = ${scriptJson(THESIS_BUILDER_ACTIVITY)};
const evidenceCollectorActivity = ${scriptJson(EVIDENCE_COLLECTOR_ACTIVITY)};
const paragraphArchitectActivity = ${scriptJson(PARAGRAPH_ARCHITECT_ACTIVITY)};
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
  thesisCopied: false,
  evidenceStep: 1,
  evidenceSelections: {
    device: null,
    evidence: null,
    verb: null,
    function: null
  },
  evidenceFeedback: null,
  evidenceText: "",
  evidenceCopied: false,
  paragraphMode: "learn",
  paragraphScenarioId: null,
  paragraphStep: 0,
  paragraphSelections: {
    p: null,
    e: null,
    t: null,
    a: null,
    l: null
  },
  paragraphFeedback: null,
  paragraphCopied: false
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

function readResponses() {
  try {
    return JSON.parse(localStorage.getItem(RESPONSE_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeResponses(values) {
  localStorage.setItem(RESPONSE_STORAGE_KEY, JSON.stringify(values));
}

function restoreResponses() {
  const responses = readResponses();
  document.querySelectorAll("textarea[data-response-id]").forEach((textarea) => {
    const id = textarea.getAttribute("data-response-id");
    if (id && Object.prototype.hasOwnProperty.call(responses, id)) {
      textarea.value = responses[id];
    }
  });
}

document.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLTextAreaElement) || !target.matches("textarea[data-response-id]")) {
    return;
  }
  const id = target.getAttribute("data-response-id");
  if (!id) {
    return;
  }
  const responses = readResponses();
  responses[id] = target.value;
  writeResponses(responses);
});

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
  criticalResponseState.activeId = id === "thesisControl" || id === "evidenceCollector" || id === "paragraphArchitect" ? id : "textKnowledge";
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
  if (criticalResponseState.activeId === "evidenceCollector") {
    renderEvidenceCollectorActivity();
    return;
  }
  if (criticalResponseState.activeId === "paragraphArchitect") {
    renderParagraphArchitectActivity();
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

function evidenceSelectionValue(key, fallback) {
  const item = criticalResponseState.evidenceSelections[key];
  return item?.text || fallback;
}

function generateEvidenceText() {
  const selections = criticalResponseState.evidenceSelections;
  if (!selections.device || !selections.evidence || !selections.verb || !selections.function) {
    return "";
  }
  return "Through his use of " + selections.device.text.toLowerCase() + ", specifically " + selections.evidence.text + ", Williams attempts " + selections.verb.text + " " + selections.function.text;
}

function resetEvidenceCollector() {
  criticalResponseState.evidenceStep = 1;
  criticalResponseState.evidenceSelections = {
    device: null,
    evidence: null,
    verb: null,
    function: null
  };
  criticalResponseState.evidenceFeedback = null;
  criticalResponseState.evidenceText = "";
  criticalResponseState.evidenceCopied = false;
  renderCriticalResponseActivity();
}

function renderEvidenceCollectorActivity() {
  const heading = criticalResponseRoot.querySelector("[data-workshop-heading]");
  const description = criticalResponseRoot.querySelector("[data-workshop-description]");
  const stepCount = criticalResponseRoot.querySelector("[data-workshop-step-count]");
  const score = criticalResponseRoot.querySelector("[data-workshop-score]");
  const progressFill = criticalResponseRoot.querySelector("[data-workshop-progress-fill]");
  const panel = criticalResponseRoot.querySelector("[data-workshop-panel]");
  const groupTabs = criticalResponseRoot.querySelector("[data-question-group-tabs]");
  const step = criticalResponseState.evidenceStep;
  const progressPercent = step >= 5 ? 100 : Math.round(((step - 1) / 4) * 100);
  if (groupTabs) groupTabs.hidden = true;
  if (heading) heading.textContent = "Evidence Collector: A Streetcar Named Desire";
  if (description) description.textContent = evidenceCollectorActivity.description;
  if (stepCount) stepCount.textContent = step >= 5 ? "Evidence sentence ready" : "Step " + step + " of 4";
  if (score) score.textContent = "Collector";
  if (progressFill) progressFill.style.width = progressPercent + "%";
  if (!panel) return;
  panel.innerHTML = '<div class="evidence-collector" data-evidence-collector>' + renderEvidenceStepper() + renderEvidenceFeedback() + renderEvidenceStepContent() + renderEvidencePreview() + '</div>';
}

function renderEvidenceStepper() {
  const labels = ["Tool", "Evidence", "Action", "Function"];
  return '<div class="thesis-stepper evidence-stepper">' + labels.map((label, index) => {
    const number = index + 1;
    const state = criticalResponseState.evidenceStep === number ? " active" : criticalResponseState.evidenceStep > number ? " complete" : "";
    const marker = criticalResponseState.evidenceStep > number
      ? '<span class="thesis-step-marker" aria-label="Completed"><span class="thesis-step-check" aria-hidden="true"></span></span>'
      : '<span class="thesis-step-marker">' + String(number) + '</span>';
    return '<div class="thesis-step' + state + '">' + marker + '<span>' + escapeRuntimeHtml(label) + '</span></div>';
  }).join("") + '</div>';
}

function renderEvidenceFeedback() {
  if (!criticalResponseState.evidenceFeedback) return "";
  return '<div class="thesis-feedback"><span class="material-symbols-outlined" aria-hidden="true">warning</span><div><strong>Watch out</strong><span>' + escapeRuntimeHtml(criticalResponseState.evidenceFeedback) + '</span></div></div>';
}

function renderEvidenceStepContent() {
  const step = criticalResponseState.evidenceStep;
  if (step === 1) {
    const sections = evidenceCollectorActivity.categories.map((category) => {
      const choices = evidenceCollectorActivity.devices
        .filter((device) => device.category === category)
        .map((device) => renderEvidenceChoice("device", device))
        .join("");
      return '<section class="evidence-category"><h5>' + escapeRuntimeHtml(category) + '</h5><div class="thesis-choice-grid three-column">' + choices + '</div></section>';
    }).join("");
    return '<div><div class="critical-response-step-header"><h4 class="critical-response-step-title">Step 1: Select a Literary Tool</h4><span class="critical-response-step-index">Evidence Collector</span></div><p class="critical-response-question">Choose the analytical lens you want to use for the evidence sentence.</p><div class="evidence-category-stack">' + sections + '</div></div>';
  }
  if (step === 2) {
    const deviceId = criticalResponseState.evidenceSelections.device?.id;
    const choices = (evidenceCollectorActivity.evidence[deviceId] || []).map((item) => renderEvidenceChoice("evidence", item)).join("");
    return '<div><div class="critical-response-step-header"><h4 class="critical-response-step-title">Step 2: Collect the Evidence</h4><span class="critical-response-step-index">' + escapeRuntimeHtml(evidenceSelectionValue("device", "Evidence")) + '</span></div><p class="critical-response-question">Select the strongest specific example for this literary tool.</p><div class="critical-response-options two-column">' + choices + '</div></div>';
  }
  if (step === 3) {
    const choices = evidenceCollectorActivity.verbs.map((verb) => renderEvidenceChoice("verb", verb)).join("");
    return '<div><div class="critical-response-step-header"><h4 class="critical-response-step-title">Step 3: Choose an Analytical Verb</h4><span class="critical-response-step-index">Evidence Collector</span></div><p class="critical-response-question">Choose the action Williams performs through this device.</p><div class="thesis-choice-grid three-column">' + choices + '</div></div>';
  }
  if (step === 4) {
    const choices = evidenceCollectorActivity.functions.map((item) => renderEvidenceChoice("function", item)).join("");
    return '<div><div class="critical-response-step-header"><h4 class="critical-response-step-title">Step 4: Define the Thematic Function</h4><span class="critical-response-step-index">Evidence Collector</span></div><p class="critical-response-question">Select the larger meaning this evidence reveals.</p><div class="critical-response-options">' + choices + '</div></div>';
  }
  const evidenceText = criticalResponseState.evidenceText || generateEvidenceText();
  return '<div class="thesis-output evidence-output"><h4>Collected Evidence Sentence</h4><textarea data-evidence-output>' + escapeRuntimeHtml(evidenceText) + '</textarea><div class="thesis-actions"><button class="thesis-action" type="button" data-evidence-copy><span class="material-symbols-outlined" aria-hidden="true">' + (criticalResponseState.evidenceCopied ? "check_circle" : "content_copy") + '</span>' + (criticalResponseState.evidenceCopied ? "Copied" : "Copy Sentence") + '</button><button class="thesis-action secondary" type="button" data-evidence-restart><span class="material-symbols-outlined" aria-hidden="true">refresh</span>Collect More Evidence</button></div><div class="evidence-use-note"><h5>Use it in the paragraph</h5><p>Introduce the scene briefly, paste the sentence, then follow it with a short direct quotation from the play.</p></div></div>';
}

function renderEvidenceChoice(category, item) {
  const heading = '<strong>' + escapeRuntimeHtml(item.text) + '</strong>';
  const body = item.desc ? '<span>' + escapeRuntimeHtml(item.desc) + '</span>' : "";
  return '<button class="thesis-choice evidence-choice" type="button" data-evidence-choice="' + escapeRuntimeHtml(category) + '" data-evidence-choice-id="' + escapeRuntimeHtml(item.id) + '">' + heading + body + '</button>';
}

function renderEvidencePreview() {
  if (criticalResponseState.evidenceStep >= 5) return "";
  return '<div class="thesis-preview evidence-preview">Through his use of <strong>' + escapeRuntimeHtml(evidenceSelectionValue("device", "[literary device]")) + '</strong>, specifically <strong>' + escapeRuntimeHtml(evidenceSelectionValue("evidence", "[textual evidence]")) + '</strong>, Williams attempts <strong>' + escapeRuntimeHtml(evidenceSelectionValue("verb", "[analytical verb]")) + '</strong> <strong>' + escapeRuntimeHtml(evidenceSelectionValue("function", "[thematic meaning]")) + '</strong></div>';
}

function selectEvidenceChoice(category, id) {
  const source = category === "device"
    ? evidenceCollectorActivity.devices
    : category === "evidence"
      ? (evidenceCollectorActivity.evidence[criticalResponseState.evidenceSelections.device?.id] || [])
      : category === "verb"
        ? evidenceCollectorActivity.verbs
        : evidenceCollectorActivity.functions;
  const item = source.find((candidate) => candidate.id === id);
  if (!item) return;
  if (item.type === "trap") {
    criticalResponseState.evidenceFeedback = item.trapMsg || "Choose the analytical option before moving on.";
    renderCriticalResponseActivity();
    return;
  }
  criticalResponseState.evidenceFeedback = null;
  criticalResponseState.evidenceSelections[category] = item;
  if (category === "device") {
    criticalResponseState.evidenceSelections.evidence = null;
    criticalResponseState.evidenceSelections.verb = null;
    criticalResponseState.evidenceSelections.function = null;
  }
  if (category === "evidence") {
    criticalResponseState.evidenceSelections.verb = null;
    criticalResponseState.evidenceSelections.function = null;
  }
  if (category === "verb") {
    criticalResponseState.evidenceSelections.function = null;
  }
  criticalResponseState.evidenceStep += 1;
  if (criticalResponseState.evidenceStep >= 5) {
    criticalResponseState.evidenceText = generateEvidenceText();
  }
  renderCriticalResponseActivity();
}

function currentParagraphScenario() {
  return paragraphArchitectActivity.scenarios.find((scenario) => scenario.id === criticalResponseState.paragraphScenarioId) || null;
}

function currentParagraphStepDefinition() {
  return paragraphArchitectActivity.steps[criticalResponseState.paragraphStep - 1] || null;
}

function paragraphSelectionText(key) {
  return criticalResponseState.paragraphSelections[key]?.text || "";
}

function generateParagraphText() {
  const pText = paragraphSelectionText("p");
  const eText = paragraphSelectionText("e");
  const tText = paragraphSelectionText("t");
  const aText = paragraphSelectionText("a");
  const lText = paragraphSelectionText("l");
  if (!pText || !eText || !tText || !aText || !lText) return "";
  return pText + " For instance, " + eText.charAt(0).toLowerCase() + eText.slice(1) + " Through the use of " + tText.toLowerCase() + ", " + aText.charAt(0).toLowerCase() + aText.slice(1) + " " + lText;
}

function resetParagraphArchitect() {
  criticalResponseState.paragraphMode = "build";
  criticalResponseState.paragraphScenarioId = null;
  criticalResponseState.paragraphStep = 0;
  criticalResponseState.paragraphSelections = {
    p: null,
    e: null,
    t: null,
    a: null,
    l: null
  };
  criticalResponseState.paragraphFeedback = null;
  criticalResponseState.paragraphCopied = false;
  renderCriticalResponseActivity();
}

function renderParagraphArchitectActivity() {
  const heading = criticalResponseRoot.querySelector("[data-workshop-heading]");
  const description = criticalResponseRoot.querySelector("[data-workshop-description]");
  const stepCount = criticalResponseRoot.querySelector("[data-workshop-step-count]");
  const score = criticalResponseRoot.querySelector("[data-workshop-score]");
  const progressFill = criticalResponseRoot.querySelector("[data-workshop-progress-fill]");
  const panel = criticalResponseRoot.querySelector("[data-workshop-panel]");
  const groupTabs = criticalResponseRoot.querySelector("[data-question-group-tabs]");
  const step = criticalResponseState.paragraphStep;
  const progressPercent = step > 5 ? 100 : Math.round((step / 5) * 100);
  if (groupTabs) groupTabs.hidden = true;
  if (heading) heading.textContent = "Paragraph Architect: PETAL Builder";
  if (description) description.textContent = paragraphArchitectActivity.description;
  if (stepCount) stepCount.textContent = step === 0 ? "Choose scenario" : step > 5 ? "Paragraph complete" : "PETAL Step " + step + " of 5";
  if (score) score.textContent = "Architect";
  if (progressFill) progressFill.style.width = progressPercent + "%";
  if (!panel) return;
  panel.innerHTML = '<div class="paragraph-architect" data-paragraph-architect>' + renderParagraphModeTabs() + renderParagraphArchitectContent() + '</div>';
}

function renderParagraphModeTabs() {
  return '<div class="paragraph-mode-tabs" role="tablist" aria-label="Paragraph Architect modes"><button class="paragraph-mode-tab' + (criticalResponseState.paragraphMode === "learn" ? " active" : "") + '" type="button" role="tab" aria-selected="' + String(criticalResponseState.paragraphMode === "learn") + '" data-paragraph-mode="learn"><span class="material-symbols-outlined" aria-hidden="true">menu_book</span>Learn the Framework</button><button class="paragraph-mode-tab' + (criticalResponseState.paragraphMode === "build" ? " active" : "") + '" type="button" role="tab" aria-selected="' + String(criticalResponseState.paragraphMode === "build") + '" data-paragraph-mode="build"><span class="material-symbols-outlined" aria-hidden="true">edit</span>Interactive Builder</button></div>';
}

function renderParagraphArchitectContent() {
  if (criticalResponseState.paragraphMode === "learn") {
    return renderParagraphLearnFramework();
  }
  if (criticalResponseState.paragraphStep === 0) {
    const cards = paragraphArchitectActivity.scenarios.map((scenario) => {
      return '<button class="paragraph-scenario-card" type="button" data-paragraph-scenario="' + escapeRuntimeHtml(scenario.id) + '"><small>' + escapeRuntimeHtml(scenario.theme) + '</small><strong>' + escapeRuntimeHtml(scenario.title) + '</strong></button>';
    }).join("");
    return '<div><div class="critical-response-step-header"><h4 class="critical-response-step-title">Select an Analytical Scenario</h4><span class="critical-response-step-index">Paragraph Architect</span></div><p class="critical-response-question">Choose the Streetcar paragraph focus you want to build.</p><div class="paragraph-scenario-grid">' + cards + '</div></div>';
  }
  if (criticalResponseState.paragraphStep > 5) {
    const paragraphText = generateParagraphText();
    return '<div class="thesis-output paragraph-output"><h4>Completed PETAL Paragraph</h4><textarea data-paragraph-output>' + escapeRuntimeHtml(paragraphText) + '</textarea><div class="thesis-actions"><button class="thesis-action" type="button" data-paragraph-copy><span class="material-symbols-outlined" aria-hidden="true">' + (criticalResponseState.paragraphCopied ? "check_circle" : "content_copy") + '</span>' + (criticalResponseState.paragraphCopied ? "Copied" : "Copy Paragraph") + '</button><button class="thesis-action secondary" type="button" data-paragraph-restart><span class="material-symbols-outlined" aria-hidden="true">refresh</span>Build Another</button></div><div class="paragraph-checklist"><h5>Rubric check</h5><ul><li>Point makes an analytical claim.</li><li>Evidence is precise rather than broad summary.</li><li>Technique and analysis explain how the playwright builds meaning.</li><li>Link returns to the universal thesis.</li></ul></div></div>';
  }

  const scenario = currentParagraphScenario();
  const stepDefinition = currentParagraphStepDefinition();
  if (!scenario || !stepDefinition) return "";
  const choices = (scenario.steps[stepDefinition.id] || []).map((choice) => {
    return '<button class="thesis-choice paragraph-choice" type="button" data-paragraph-choice="' + escapeRuntimeHtml(choice.id) + '"><strong>' + escapeRuntimeHtml(choice.text) + '</strong></button>';
  }).join("");
  return renderParagraphFeedback() + '<div><div class="critical-response-step-header"><h4 class="critical-response-step-title">Choose your ' + escapeRuntimeHtml(stepDefinition.label) + '</h4><span class="critical-response-step-index">' + escapeRuntimeHtml(scenario.title) + '</span></div><p class="critical-response-question">' + escapeRuntimeHtml(stepDefinition.description) + '</p><div class="critical-response-options">' + choices + '</div></div>' + renderParagraphPreview();
}

function renderParagraphLearnFramework() {
  const cards = paragraphArchitectActivity.steps.map((step) => {
    const extra = step.id === "p"
      ? "A strong topic sentence makes an argument about goal, conflict, realization, or result."
      : step.id === "e"
        ? "Precise evidence means a vivid moment, stage direction, or short direct quotation."
        : step.id === "t"
          ? "Naming technique moves the paragraph from talking about plot to analyzing construction."
          : step.id === "a"
            ? "Analysis explains how the evidence proves the point and why the detail matters."
            : "The link returns to the thesis and universal theme without moralizing.";
    return '<article class="paragraph-framework-card"><span>' + escapeRuntimeHtml(step.id.toUpperCase()) + '</span><div><h5>' + escapeRuntimeHtml(step.label) + '</h5><p>' + escapeRuntimeHtml(step.description) + '</p><small>' + escapeRuntimeHtml(extra) + '</small></div></article>';
  }).join("");
  return '<div class="paragraph-framework"><div class="critical-response-step-header"><h4 class="critical-response-step-title">Master the P.E.T.A.L. Framework</h4><span class="critical-response-step-index">Learn the Framework</span></div><p class="critical-response-question">Use this structure to keep body paragraphs analytical instead of drifting into plot summary.</p><div class="paragraph-framework-stack">' + cards + '</div><div class="critical-response-actions"><button class="critical-response-action" type="button" data-paragraph-mode="build"><span class="material-symbols-outlined" aria-hidden="true">edit</span>Start Building</button></div></div>';
}

function renderParagraphFeedback() {
  if (!criticalResponseState.paragraphFeedback) return "";
  return '<div class="thesis-feedback"><span class="material-symbols-outlined" aria-hidden="true">warning</span><div><strong>Review guidelines</strong><span>' + escapeRuntimeHtml(criticalResponseState.paragraphFeedback) + '</span></div></div>';
}

function renderParagraphPreview() {
  const selections = criticalResponseState.paragraphSelections;
  return '<div class="thesis-preview paragraph-preview"><strong>Live PETAL Preview</strong><p>' +
    (selections.p ? escapeRuntimeHtml(selections.p.text) + " " : '<span>[Point...] </span>') +
    (selections.e ? 'For instance, ' + escapeRuntimeHtml(selections.e.text.charAt(0).toLowerCase() + selections.e.text.slice(1)) + " " : criticalResponseState.paragraphStep > 1 ? '<span>[Evidence...] </span>' : "") +
    (selections.t && selections.a ? 'Through the use of ' + escapeRuntimeHtml(selections.t.text.toLowerCase()) + ', ' + escapeRuntimeHtml(selections.a.text.charAt(0).toLowerCase() + selections.a.text.slice(1)) + " " : criticalResponseState.paragraphStep > 3 ? '<span>[Technique and analysis...] </span>' : "") +
    (selections.l ? escapeRuntimeHtml(selections.l.text) : criticalResponseState.paragraphStep > 4 ? '<span>[Link...]</span>' : "") +
    '</p></div>';
}

function startParagraphScenario(id) {
  criticalResponseState.paragraphScenarioId = id;
  criticalResponseState.paragraphStep = 1;
  criticalResponseState.paragraphSelections = {
    p: null,
    e: null,
    t: null,
    a: null,
    l: null
  };
  criticalResponseState.paragraphFeedback = null;
  criticalResponseState.paragraphCopied = false;
  renderCriticalResponseActivity();
}

function selectParagraphChoice(id) {
  const scenario = currentParagraphScenario();
  const stepDefinition = currentParagraphStepDefinition();
  if (!scenario || !stepDefinition) return;
  const choice = (scenario.steps[stepDefinition.id] || []).find((candidate) => candidate.id === id);
  if (!choice) return;
  if (choice.type === "trap") {
    criticalResponseState.paragraphFeedback = choice.trapMsg || "Choose the analytical option before moving on.";
    renderCriticalResponseActivity();
    return;
  }
  criticalResponseState.paragraphFeedback = null;
  criticalResponseState.paragraphSelections[stepDefinition.id] = choice;
  criticalResponseState.paragraphStep += 1;
  renderCriticalResponseActivity();
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
  const evidenceChoice = event.target.closest("[data-evidence-choice]");
  if (evidenceChoice && criticalResponseRoot.contains(evidenceChoice)) {
    selectEvidenceChoice(evidenceChoice.getAttribute("data-evidence-choice"), evidenceChoice.getAttribute("data-evidence-choice-id"));
    return;
  }
  const paragraphMode = event.target.closest("[data-paragraph-mode]");
  if (paragraphMode && criticalResponseRoot.contains(paragraphMode)) {
    criticalResponseState.paragraphMode = paragraphMode.getAttribute("data-paragraph-mode") === "build" ? "build" : "learn";
    renderCriticalResponseActivity();
    return;
  }
  const paragraphScenario = event.target.closest("[data-paragraph-scenario]");
  if (paragraphScenario && criticalResponseRoot.contains(paragraphScenario)) {
    startParagraphScenario(paragraphScenario.getAttribute("data-paragraph-scenario"));
    return;
  }
  const paragraphChoice = event.target.closest("[data-paragraph-choice]");
  if (paragraphChoice && criticalResponseRoot.contains(paragraphChoice)) {
    selectParagraphChoice(paragraphChoice.getAttribute("data-paragraph-choice"));
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
    return;
  }
  const evidenceOutput = criticalResponseRoot.querySelector("[data-evidence-output]");
  if (event.target.closest("[data-evidence-copy]")) {
    criticalResponseState.evidenceText = evidenceOutput?.value || criticalResponseState.evidenceText;
    navigator.clipboard?.writeText(criticalResponseState.evidenceText);
    criticalResponseState.evidenceCopied = true;
    renderCriticalResponseActivity();
    return;
  }
  if (event.target.closest("[data-evidence-restart]")) {
    resetEvidenceCollector();
    return;
  }
  const paragraphOutput = criticalResponseRoot.querySelector("[data-paragraph-output]");
  if (event.target.closest("[data-paragraph-copy]")) {
    const text = paragraphOutput?.value || generateParagraphText();
    navigator.clipboard?.writeText(text);
    criticalResponseState.paragraphCopied = true;
    renderCriticalResponseActivity();
    return;
  }
  if (event.target.closest("[data-paragraph-restart]")) {
    resetParagraphArchitect();
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

document.addEventListener("change", (event) => {
  const select = event.target.closest("[data-scene-overview-select]");
  if (select) {
    setActiveSceneOverview(select.value);
  }
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

function setActiveSceneOverview(id) {
  if (!id) return;
  document.querySelectorAll("[data-scene-overview-panel]").forEach((panel) => {
    panel.hidden = panel.getAttribute("data-scene-overview-panel") !== id;
  });
  document.querySelectorAll("[data-scene-overview-select]").forEach((select) => {
    if (select.value !== id) {
      select.value = id;
    }
  });
}

document.getElementById("sidebar-toggle")?.addEventListener("click", () => {
  document.body.classList.toggle("sidebar-collapsed");
});

window.addEventListener("hashchange", route);
renderCriticalResponseActivity();
restoreResponses();
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
    if (!zip.file(lesson.sourceHref)) {
      await writeTextFile(sourceResourcePath, `<!doctype html><html lang="en"><body>${lesson.contentHtml}</body></html>\n`);
    } else if (lesson.sourceKind === "html") {
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

async function copyAuthoredLessonSources(unit: ModernDramaUnit, slug: string) {
  const paths = getProjectPaths(slug);
  for (const lesson of unit.lessons) {
    const sourceResourcePath = path.join(paths.resourceDir, ...lesson.sourceHref.split("/"));
    await ensureDir(path.dirname(sourceResourcePath));
    await writeTextFile(sourceResourcePath, `<!doctype html><html lang="en"><body>${lesson.contentHtml}</body></html>\n`);
    await writeTextFile(path.join(paths.resourceExtractedDir, `${toSafeId(lesson.title)}.txt`), `${lesson.text}\n`);
  }
}

async function copyZipEntryToWorkspace(input: {
  zip: JSZip;
  zipPath: string;
  workspaceRelativePath: string;
  resourceRelativePath?: string;
  slug: string;
}) {
  const paths = getProjectPaths(input.slug);
  const entry = input.zip.file(input.zipPath);
  if (!entry) {
    return false;
  }
  const buffer = await entry.async("nodebuffer");
  const workspacePath = path.join(paths.workspaceDir, ...input.workspaceRelativePath.split("/"));
  await ensureDir(path.dirname(workspacePath));
  await writeFile(workspacePath, buffer);

  if (input.resourceRelativePath) {
    const resourcePath = path.join(paths.resourceDir, ...input.resourceRelativePath.split("/"));
    await ensureDir(path.dirname(resourcePath));
    await writeFile(resourcePath, buffer);
  }
  return true;
}

async function copyStreetcarV2Sources(input: {
  cbeZip: JSZip;
  nextStepZipPath: string;
  moviePath: string;
  unit: ModernDramaUnit;
  slug: string;
}) {
  const paths = getProjectPaths(input.slug);
  await copyZipEntryToWorkspace({
    zip: input.cbeZip,
    zipPath: "streetcar_named_desire/assets/A Streetcar Named Desire questions.pdf",
    workspaceRelativePath: "assets/source/cbe-streetcar-reading-guide.pdf",
    resourceRelativePath: "streetcar_named_desire/assets/A Streetcar Named Desire questions.pdf",
    slug: input.slug
  });
  await copyZipEntryToWorkspace({
    zip: input.cbeZip,
    zipPath: "film_study/Elements of Film.html",
    workspaceRelativePath: "resources/elements-of-film.html",
    resourceRelativePath: "film_study/Elements of Film.html",
    slug: input.slug
  });

  const nextStepZip = await JSZip.loadAsync(await readFile(input.nextStepZipPath));
  for (const document of input.unit.libraryDocuments ?? []) {
    if (document.sourceLabel !== "Next Step") {
      continue;
    }
    await copyZipEntryToWorkspace({
      zip: nextStepZip,
      zipPath: document.zipPath,
      workspaceRelativePath: document.workspaceHref.replace(/^\.\//, ""),
      resourceRelativePath: document.zipPath,
      slug: input.slug
    });
  }

  if (await fileExists(input.moviePath)) {
    const movieDestination = path.join(paths.workspaceDir, "assets", "media", "streetcar-named-desire-movie.mp4");
    await ensureDir(path.dirname(movieDestination));
    await copyFile(input.moviePath, movieDestination);
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
  const importedUnit = await extractModernDramaUnit(zipBuffer);
  const generatedAt = new Date().toISOString();
  const nextStepZipPath = options.nextStepZipPath ?? DEFAULT_NEXT_STEP_ZIP_PATH;
  const moviePath = options.moviePath ?? DEFAULT_STREETCAR_MOVIE_PATH;
  const unit: ModernDramaUnit = {
    ...importedUnit,
    libraryDocuments: buildStreetcarLibraryDocuments(),
    filmResources: [
      {
        id: "streetcar-full-film",
        title: "Streetcar Named Desire Movie",
        originalSrc: "./assets/media/streetcar-named-desire-movie.mp4",
        embedSrc: "./assets/media/streetcar-named-desire-movie.mp4",
        origin: "local",
        sourceTitle: "Film Room",
        mediaType: "video/mp4"
      }
    ]
  };

  await mkdir(paths.rawDir, { recursive: true });
  await mkdir(paths.workspaceDir, { recursive: true });
  await mkdir(paths.metaDir, { recursive: true });
  await mkdir(paths.resourceDir, { recursive: true });
  await writeTextFile(paths.rawEntrypoint, buildSourceIndexHtml(importedUnit));
  await writeTextFile(paths.workspaceEntrypoint, buildWorkspaceHtml(unit));
  await copyBrandAssets(slug);
  await copyUnitSources(zip, importedUnit, slug);
  await copyStreetcarV2Sources({ cbeZip: zip, nextStepZipPath, moviePath, unit, slug });

  await writeJsonFile(paths.manifestPath, buildProjectManifest({ slug, zipPath: options.zipPath, nextStepZipPath, moviePath, generatedAt }));
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
