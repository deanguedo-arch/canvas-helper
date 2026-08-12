import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { Parser } from "htmlparser2";

import { STUDIO_EDIT_ID_ATTRIBUTE } from "../../../scripts/lib/course-editing/html.js";

import {
  inspectCourseAuthoringProject,
  type CourseAuthoringPath,
  type ResolvedCourseAuthoringProject
} from "../../../scripts/lib/course-authoring/context.js";
import { repoRoot } from "../../../scripts/lib/paths.js";
import {
  type InspectionResolveRequest,
  type InspectionResolution,
  type InspectionResolutionState
} from "../../shared/inspection.js";
import { STUDIO_REVIEW_LIMITS } from "../../shared/studio-quality.js";

export const PREVIEW_INSPECT_NODE_ATTRIBUTE = "data-canvas-helper-inspect-node";

const MAX_INSPECTABLE_HTML_BYTES = 8 * 1024 * 1024;
const PREVIEW_NODE_ID_PREFIX = "ch1";
const EXCLUDED_TAGS = new Set(["base", "head", "link", "meta", "script", "style", "template", "title"]);
const INSPECTION_DOCUMENT_CACHE_MAX_ENTRIES = STUDIO_REVIEW_LIMITS.inspectionSourceCacheEntries;

type CachedInspectionDocument = {
  mtimeMs: number;
  size: number;
  document: PreviewInspectionDocument | null;
};

const inspectionDocumentCache = new Map<string, CachedInspectionDocument>();
let inspectionDocumentCacheHits = 0;
let inspectionDocumentCacheMisses = 0;

type OpeningTag = {
  start: number;
  end: number;
  tagName: string;
  editId: string | null;
};

export type PreviewInspectionDocument = {
  source: string;
  html: string;
  sourceDigest: string;
  nodeIds: Set<string>;
  nodeLocations: Map<string, { lineStart: number; lineEnd: number; sourceStart: number; sourceEnd: number; ordinal: number; tagName: string; editId: string | null }>;
};

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function isUtf16Body(body: Buffer) {
  return body.length >= 2 && ((body[0] === 0xff && body[1] === 0xfe) || (body[0] === 0xfe && body[1] === 0xff));
}

function collectOpeningTags(html: string) {
  const tags: OpeningTag[] = [];
  let templateDepth = 0;
  let unsafeReservedAttribute = false;
  let parseFailed = false;
  let parser: Parser;
  parser = new Parser(
    {
      onopentag(tagName, attributes) {
        const normalizedTagName = tagName.toLowerCase();
        if (normalizedTagName === "template") {
          templateDepth += 1;
          return;
        }

        if (templateDepth > 0 || EXCLUDED_TAGS.has(normalizedTagName)) {
          return;
        }

        const start = parser.startIndex;
        const end = parser.endIndex;
        if (start < 0 || end < start || html[end] !== ">") {
          return;
        }

        const openingTag = html.slice(start, end + 1);
        if (new RegExp(`\\b${PREVIEW_INSPECT_NODE_ATTRIBUTE}\\s*=`, "i").test(openingTag)) {
          unsafeReservedAttribute = true;
          return;
        }

        const editId = typeof attributes[STUDIO_EDIT_ID_ATTRIBUTE] === "string" && /^che1:[a-f0-9]{24}$/.test(attributes[STUDIO_EDIT_ID_ATTRIBUTE])
          ? attributes[STUDIO_EDIT_ID_ATTRIBUTE]
          : null;
        tags.push({ start, end, tagName: normalizedTagName, editId });
      },
      onclosetag(tagName) {
        if (tagName.toLowerCase() === "template" && templateDepth > 0) {
          templateDepth -= 1;
        }
      },
      onerror() {
        parseFailed = true;
      }
    },
    {
      decodeEntities: false,
      recognizeSelfClosing: true
    }
  );
  parser.write(html);
  parser.end();
  return parseFailed || unsafeReservedAttribute || templateDepth !== 0 ? null : tags;
}

function createNodeId(sourceDigest: string, ordinal: number) {
  return `${PREVIEW_NODE_ID_PREFIX}:${sourceDigest.slice(0, 24)}:${ordinal}`;
}

function collectLineStarts(html: string) {
  const starts = [0];
  for (let index = 0; index < html.length; index += 1) {
    if (html[index] === "\n") {
      starts.push(index + 1);
    }
  }
  return starts;
}

function lineForOffset(lineStarts: number[], offset: number) {
  let low = 0;
  let high = lineStarts.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (lineStarts[middle] <= offset) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return high + 1;
}

export function isPreviewInspectionNodeId(value: string | null | undefined) {
  return typeof value === "string" && new RegExp(`^${PREVIEW_NODE_ID_PREFIX}:[a-f0-9]{24}:[1-9][0-9]*$`).test(value);
}

function injectNodeAttribute(html: string, tag: OpeningTag, nodeId: string) {
  const insertionIndex = html[tag.end - 1] === "/" ? tag.end - 1 : tag.end;
  return `${html.slice(0, insertionIndex)} ${PREVIEW_INSPECT_NODE_ATTRIBUTE}="${nodeId}"${html.slice(insertionIndex)}`;
}

export function decoratePreviewHtml(html: string): PreviewInspectionDocument | null {
  if (Buffer.byteLength(html, "utf8") > MAX_INSPECTABLE_HTML_BYTES) {
    return null;
  }

  const sourceDigest = sha256(html);
  const tags = collectOpeningTags(html);
  if (!tags) {
    return null;
  }
  const nodeIds = new Set<string>();
  const nodeLocations = new Map<string, { lineStart: number; lineEnd: number; sourceStart: number; sourceEnd: number; ordinal: number; tagName: string; editId: string | null }>();
  const lineStarts = collectLineStarts(html);
  let decorated = html;

  for (let index = tags.length - 1; index >= 0; index -= 1) {
    const nodeId = createNodeId(sourceDigest, index + 1);
    decorated = injectNodeAttribute(decorated, tags[index], nodeId);
    nodeIds.add(nodeId);
    nodeLocations.set(nodeId, {
      lineStart: lineForOffset(lineStarts, tags[index].start),
      lineEnd: lineForOffset(lineStarts, tags[index].end),
      sourceStart: tags[index].start,
      sourceEnd: tags[index].end,
      ordinal: index + 1,
      tagName: tags[index].tagName,
      editId: tags[index].editId
    });
  }

  return { source: html, html: decorated, sourceDigest, nodeIds, nodeLocations };
}

export function decoratePreviewHtmlBuffer(body: Buffer) {
  if (isUtf16Body(body)) {
    return null;
  }

  return decoratePreviewHtml(body.toString("utf8"));
}

export function injectPreviewBridgeScript(html: string, scriptSource: string) {
  const scriptTag = `<script src="${scriptSource}" data-canvas-helper-preview-bridge="v1"></script>`;
  const openingHead = /<head\b[^>]*>/i.exec(html);
  const firstScript = html.search(/<script\b/i);
  if (openingHead && (firstScript < 0 || openingHead.index < firstScript)) {
    const insertionIndex = openingHead.index + openingHead[0].length;
    return `${html.slice(0, insertionIndex)}${scriptTag}${html.slice(insertionIndex)}`;
  }

  if (firstScript >= 0) {
    return `${html.slice(0, firstScript)}${scriptTag}${html.slice(firstScript)}`;
  }

  const openingBody = /<body\b[^>]*>/i.exec(html);
  if (openingBody) {
    const insertionIndex = openingBody.index + openingBody[0].length;
    return `${html.slice(0, insertionIndex)}${scriptTag}${html.slice(insertionIndex)}`;
  }

  const openingHtml = /<html\b[^>]*>/i.exec(html);
  if (openingHtml) {
    const insertionIndex = openingHtml.index + openingHtml[0].length;
    return `${html.slice(0, insertionIndex)}${scriptTag}${html.slice(insertionIndex)}`;
  }

  return `${scriptTag}${html}`;
}

function toRepoRelative(filePath: string) {
  const relative = path.relative(repoRoot, filePath).split(path.sep).join("/");
  return relative && !relative.startsWith("../") && relative !== ".." && !path.isAbsolute(relative) ? relative : null;
}

export async function loadPreviewInspectionDocument(filePath: string) {
  const metadata = await stat(filePath);
  const cached = inspectionDocumentCache.get(filePath);
  if (cached && cached.mtimeMs === metadata.mtimeMs && cached.size === metadata.size) {
    inspectionDocumentCacheHits += 1;
    inspectionDocumentCache.delete(filePath);
    inspectionDocumentCache.set(filePath, cached);
    return cached.document;
  }
  inspectionDocumentCacheMisses += 1;
  const body = await readFile(filePath);
  const document = decoratePreviewHtmlBuffer(body);
  inspectionDocumentCache.set(filePath, { mtimeMs: metadata.mtimeMs, size: metadata.size, document });
  while (inspectionDocumentCache.size > INSPECTION_DOCUMENT_CACHE_MAX_ENTRIES) {
    const oldest = inspectionDocumentCache.keys().next().value;
    if (typeof oldest !== "string") break;
    inspectionDocumentCache.delete(oldest);
  }
  return document;
}

export function previewInspectionDocumentCacheStats() {
  return {
    entries: inspectionDocumentCache.size,
    hits: inspectionDocumentCacheHits,
    misses: inspectionDocumentCacheMisses
  };
}

export function clearPreviewInspectionDocumentCache() {
  inspectionDocumentCache.clear();
  inspectionDocumentCacheHits = 0;
  inspectionDocumentCacheMisses = 0;
}

function uniquePaths(paths: CourseAuthoringPath[], maximum = 3) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const entry of paths) {
    if (!entry.exists || entry.kind !== "file" || seen.has(entry.repoRelative)) {
      continue;
    }
    seen.add(entry.repoRelative);
    result.push(entry.repoRelative);
    if (result.length >= maximum) {
      break;
    }
  }
  return result;
}

function firstFile(paths: CourseAuthoringPath[]) {
  return uniquePaths(paths, 1)[0] ?? null;
}

function buildUnknownResolution(
  request: InspectionResolveRequest,
  previewPath: string,
  warning: string,
  options: { freshness?: InspectionResolution["freshness"]; artifactRole?: InspectionResolution["artifactRole"] } = {}
): InspectionResolution {
  return {
    projectSlug: request.projectSlug,
    previewPath,
    selection: request.selection,
    resolution: "unknown",
    freshness: options.freshness ?? "unsupported",
    artifactRole: options.artifactRole ?? (request.root === "raw" ? "reference-only" : "unknown"),
    generated: false,
    primaryEditTarget: null,
    primaryEditLine: null,
    sourceExcerpt: null,
    contributors: [],
    rebuildCommand: null,
    validationCommand: `npm run course:doctor -- --project ${request.projectSlug}`,
    warnings: [warning]
  };
}

function resolveGeneratedTarget(project: ResolvedCourseAuthoringProject) {
  if (project.driverId === "english-factory-v1") {
    return firstFile(project.editableSources) ?? firstFile(project.canonicalSources);
  }

  return firstFile(project.canonicalSources) ?? firstFile(project.sharedSources);
}

function resolveContributors(project: ResolvedCourseAuthoringProject, primaryEditTarget: string | null) {
  const contributors = uniquePaths([...project.editableSources, ...project.sharedSources, ...project.canonicalSources], 4);
  return contributors.filter((entry) => entry !== primaryEditTarget).slice(0, 3);
}

function generatedResolution(
  request: InspectionResolveRequest,
  previewPath: string,
  project: ResolvedCourseAuthoringProject
): InspectionResolution {
  const primaryEditTarget = resolveGeneratedTarget(project);
  return {
    projectSlug: request.projectSlug,
    previewPath,
    selection: request.selection,
    resolution: "bounded",
    freshness: "unverified",
    artifactRole: "generated-workspace-output",
    generated: true,
    primaryEditTarget,
    primaryEditLine: null,
    sourceExcerpt: null,
    contributors: resolveContributors(project, primaryEditTarget),
    rebuildCommand: project.regenerateCommand ?? null,
    validationCommand: `npm run course:doctor -- --project ${request.projectSlug}`,
    warnings: [
      "The selected workspace is generated output. Do not hand-edit the displayed HTML; use the declared source and rebuild flow."
    ]
  };
}

function utf8Slice(value: string, maximumBytes: number) {
  let output = "";
  for (const character of value) {
    if (Buffer.byteLength(output + character, "utf8") > maximumBytes) {
      break;
    }
    output += character;
  }
  return output;
}

function buildSourceExcerpt(
  source: string,
  location: { lineStart: number; lineEnd: number; sourceStart: number; sourceEnd: number } | undefined
) {
  if (!location) {
    return null;
  }

  const sourceLines = source.split(/\r?\n/);
  const startLine = Math.max(1, location.lineStart - 1);
  const endLine = Math.min(sourceLines.length, location.lineEnd + 1);
  const selectedLine = sourceLines[location.lineStart - 1] ?? "";
  const context = sourceLines.slice(startLine - 1, endLine);
  const normalExcerpt = context.map((line, index) => `${startLine + index} | ${line}`).join("\n");

  if (Buffer.byteLength(normalExcerpt, "utf8") <= 1_600) {
    return { startLine, endLine, text: normalExcerpt, truncated: false };
  }

  const lineStartOffset = source.lastIndexOf("\n", location.sourceStart - 1) + 1;
  const selectedColumn = Math.max(0, location.sourceStart - lineStartOffset);
  const excerptStart = Math.max(0, selectedColumn - 480);
  const excerptEnd = Math.min(selectedLine.length, selectedColumn + 760);
  const prefix = excerptStart > 0 ? "…" : "";
  const suffix = excerptEnd < selectedLine.length ? "…" : "";
  const clipped = `${prefix}${selectedLine.slice(excerptStart, excerptEnd)}${suffix}`;
  return {
    startLine: location.lineStart,
    endLine: location.lineEnd,
    text: `${location.lineStart} | ${utf8Slice(clipped, 1_400)}`,
    truncated: true
  };
}

function directResolution(
  request: InspectionResolveRequest,
  previewPath: string,
  project: ResolvedCourseAuthoringProject,
  document: PreviewInspectionDocument
): InspectionResolution {
  const location = document.nodeLocations.get(request.selection.nodeId ?? "");
  const selectedLine = location?.lineStart ?? null;
  const primaryEditTarget = project.editableSources.find((entry) => entry.kind === "file" && entry.repoRelative === previewPath)?.repoRelative ?? null;
  const resolution: InspectionResolutionState = primaryEditTarget && selectedLine ? "exact" : "unknown";
  return {
    projectSlug: request.projectSlug,
    previewPath,
    selection: request.selection,
    resolution,
    freshness: resolution === "exact" ? "current" : "unsupported",
    artifactRole: resolution === "exact" ? "canonical-editable-source" : "unknown",
    generated: false,
    primaryEditTarget: resolution === "exact" ? primaryEditTarget : null,
    primaryEditLine: resolution === "exact" ? selectedLine : null,
    sourceExcerpt: resolution === "exact" ? buildSourceExcerpt(document.source, location) : null,
    contributors: resolution === "exact" && primaryEditTarget ? resolveContributors(project, primaryEditTarget) : [],
    rebuildCommand: project.regenerateCommand ?? null,
    validationCommand: `npm run course:doctor -- --project ${request.projectSlug}`,
    warnings: resolution === "exact"
      ? []
      : ["This static preview element could not be mapped to a current canonical source line." ]
  };
}

export async function resolvePreviewInspection(request: InspectionResolveRequest, previewFilePath: string): Promise<InspectionResolution> {
  const previewPath = toRepoRelative(previewFilePath);
  if (!previewPath) {
    throw new Error("Preview path is outside this checkout.");
  }

  if (request.root !== "workspace") {
    return buildUnknownResolution(request, previewPath, "Reference and raw previews are inspectable, but are never edit targets.", {
      freshness: "unsupported",
      artifactRole: "reference-only"
    });
  }

  const document = await loadPreviewInspectionDocument(previewFilePath);
  if (!document) {
    return buildUnknownResolution(
      request,
      previewPath,
      "This preview format cannot be source-decorated safely, so Canvas Helper will not claim an exact source target."
    );
  }

  const requestedNode = request.selection.nodeId;
  if (!requestedNode || !isPreviewInspectionNodeId(requestedNode)) {
    return buildUnknownResolution(
      request,
      previewPath,
      "The selected element was created at runtime or has no stable source node ID; no source target was inferred.",
      { freshness: "unsupported" }
    );
  }

  if (!document.nodeIds.has(requestedNode)) {
    const freshness = requestedNode.includes(document.sourceDigest.slice(0, 24)) ? "unsupported" : "stale";
    return buildUnknownResolution(
      request,
      previewPath,
      "The preview node does not match the current local HTML. Reload the preview before making an edit decision.",
      { freshness }
    );
  }

  const report = await inspectCourseAuthoringProject(request.projectSlug);
  if (report.status !== "pass" || !report.project) {
    return buildUnknownResolution(
      request,
      previewPath,
      "Course source ownership is not currently valid, so Canvas Helper will not recommend a write target.",
      { freshness: "current" }
    );
  }

  const project = report.project;
  if (project.driverId === "direct-workspace-v1" && project.authoringMode === "direct") {
    return directResolution(request, previewPath, project, document);
  }

  if (project.driverId === "english-factory-v1" || project.driverId === "social-related-issues-v1") {
    return generatedResolution(request, previewPath, project);
  }

  return buildUnknownResolution(
    request,
    previewPath,
    "This project is proposal-only; an inspect selection cannot safely identify a primary write target.",
    { freshness: "current" }
  );
}
