import { spawn } from "node:child_process";
import { once } from "node:events";
import { createWriteStream, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { load } from "cheerio";
import { lookup as lookupMimeType } from "mime-types";

import { copyDirectory, ensureDir, fileExists, listFilesRecursive, removePath } from "../fs.js";
import { runAuthoringDeviationGate } from "../intelligence/apply/deviation-gate.js";
import { findStorageKeysInScriptSources } from "../scorm.js";
import type {
  AuthoringDeviationAcceptance,
  AuthoringPreferencesOverride,
  AuthoringSurfaceKind
} from "../types.js";

export type ExportAuthoringGateOptions = {
  authoringAcceptance?: AuthoringDeviationAcceptance;
  repoAuthoringPreferencesPath?: string;
  projectAuthoringPreferencesPath?: string;
  benchmarkSelectionPath?: string;
  authoringCliOverride?: AuthoringPreferencesOverride;
};

export async function runExportAuthoringPreflight(
  projectSlug: string,
  workspaceEntrypoint: string,
  options: ExportAuthoringGateOptions = {},
  surfaceKind: AuthoringSurfaceKind = "course-html"
) {
  const gateResult = await runAuthoringDeviationGate({
    projectSlug,
    repoPreferencesPath: options.repoAuthoringPreferencesPath,
    projectPreferencesPath: options.projectAuthoringPreferencesPath,
    benchmarkSelectionPath: options.benchmarkSelectionPath,
    cliOverride: options.authoringCliOverride,
    acceptance: options.authoringAcceptance,
    surfaces: [
      {
        kind: surfaceKind,
        filePath: workspaceEntrypoint
      }
    ]
  });

  if (!gateResult.pass) {
    throw new Error(
      `Authoring preference deviations blocked export for "${projectSlug}". See ${gateResult.reportMarkdownPath}.`
    );
  }

  return gateResult;
}

export function unique(values: string[]) {
  return [...new Set(values)];
}

function isExternalResource(value: string) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|mailto:|tel:)/i.test(value);
}

function stripQueryAndHash(value: string) {
  return value.split(/[?#]/, 1)[0];
}

function normalizePath(value: string) {
  return path.resolve(value).toLowerCase();
}

function isPathInsideDirectory(rootDir: string, targetPath: string) {
  const normalizedRoot = normalizePath(rootDir);
  const normalizedTarget = normalizePath(targetPath);
  const rootWithSeparator = normalizedRoot.endsWith(path.sep) ? normalizedRoot : `${normalizedRoot}${path.sep}`;
  return normalizedTarget === normalizedRoot || normalizedTarget.startsWith(rootWithSeparator);
}

function resolveWorkspaceResourcePath(resourceRef: string, baseDir: string, workspaceDir: string) {
  const sanitized = stripQueryAndHash(resourceRef.trim().replace(/\\/g, "/"));
  if (!sanitized) {
    return null;
  }

  if (sanitized.startsWith("/")) {
    return path.resolve(workspaceDir, `.${sanitized}`);
  }

  return path.resolve(baseDir, sanitized);
}

type ScriptProcessingMode = "data-uri" | "asset-registry";
type HtmlProcessingMode = "data-uri" | "asset-registry";

export type EmbeddedAssetRecord = {
  id: string;
  mimeType: string;
} & (
  | {
      contentKind: "text";
      textContent: string;
    }
  | {
      contentKind: "file";
      sourcePath: string;
    }
);

type DocumentAssetCollector = Map<string, EmbeddedAssetRecord>;

type SingleHtmlBuildContext = {
  inlinedAssetCount: number;
  htmlCache: Map<string, string>;
  stylesheetCache: Map<string, string>;
  scriptCache: Map<string, string>;
  dataUriCache: Map<string, string>;
  embeddedAssetCache: Map<string, EmbeddedAssetRecord>;
  nextEmbeddedAssetId: number;
};

function createSingleHtmlBuildContext(): SingleHtmlBuildContext {
  return {
    inlinedAssetCount: 0,
    htmlCache: new Map(),
    stylesheetCache: new Map(),
    scriptCache: new Map(),
    dataUriCache: new Map(),
    embeddedAssetCache: new Map(),
    nextEmbeddedAssetId: 1
  };
}

function buildModeCacheKey(filePath: string, mode: ScriptProcessingMode | HtmlProcessingMode) {
  return `${normalizePath(filePath)}::${mode}`;
}

function isHtmlPath(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  return extension === ".html" || extension === ".htm";
}

function isScriptPath(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  return extension === ".js" || extension === ".mjs" || extension === ".cjs" || extension === ".jsx" || extension === ".ts" || extension === ".tsx";
}

function isStylesheetPath(filePath: string) {
  return path.extname(filePath).toLowerCase() === ".css";
}

function shouldProcessInlineScript(typeAttribute: string | undefined) {
  const normalizedType = (typeAttribute ?? "").trim().toLowerCase();
  return (
    !normalizedType ||
    normalizedType === "module" ||
    normalizedType.includes("javascript") ||
    normalizedType.includes("ecmascript") ||
    normalizedType.includes("babel")
  );
}

function escapeForQuotedJavaScriptLiteral(value: string, quote: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(new RegExp(`\\${quote}`, "g"), `\\${quote}`);
}

function toEmbeddedAssetUrlExpression(assetId: string) {
  return `window.__CH_ASSET__(${JSON.stringify(assetId)})`;
}

async function resolveEmbeddedAssetExpression(
  resourceRef: string,
  baseDir: string,
  workspaceDir: string,
  context: SingleHtmlBuildContext,
  documentAssets: DocumentAssetCollector
) {
  if (!resourceRef || isExternalResource(resourceRef)) {
    return null;
  }

  const resolvedPath = resolveWorkspaceResourcePath(resourceRef, baseDir, workspaceDir);
  if (!resolvedPath || !isPathInsideDirectory(workspaceDir, resolvedPath) || !(await fileExists(resolvedPath))) {
    return null;
  }

  const embeddedAsset = await buildEmbeddedAssetRecord(resolvedPath, workspaceDir, context, documentAssets);
  documentAssets.set(embeddedAsset.id, embeddedAsset);
  return toEmbeddedAssetUrlExpression(embeddedAsset.id);
}

async function processJavaScriptSource(
  scriptContent: string,
  scriptDir: string,
  workspaceDir: string,
  context: SingleHtmlBuildContext,
  scriptMode: ScriptProcessingMode = "data-uri",
  documentAssets?: DocumentAssetCollector
) {
  if (scriptMode === "asset-registry" && documentAssets) {
    let nextScript = await replaceAsync(
      scriptContent,
      /`((?:\.{1,2}\/|\/)[^`?#\r\n]+)((?:[?#][^`]*)?)`/g,
      async (match) => {
        const rawPath = match[1] ?? "";
        const trailingText = match[2] ?? "";
        const assetExpression = await resolveEmbeddedAssetExpression(rawPath, scriptDir, workspaceDir, context, documentAssets);
        if (!assetExpression) {
          return match[0];
        }

        context.inlinedAssetCount += 1;
        if (!trailingText) {
          return assetExpression;
        }

        return `\`\${${assetExpression}}${trailingText}\``;
      }
    );

    nextScript = await replaceAsync(nextScript, /(['"])((?:\.{1,2}\/|\/)[^'"\r\n]+?)\1/g, async (match) => {
      const assetExpression = await resolveEmbeddedAssetExpression(match[2] ?? "", scriptDir, workspaceDir, context, documentAssets);
      if (!assetExpression) {
        return match[0];
      }

      context.inlinedAssetCount += 1;
      return assetExpression;
    });

    return nextScript;
  }

  return replaceAsync(scriptContent, /(['"`])((?:\.{1,2}\/|\/)[^'"`\r\n]+?)\1/g, async (match) => {
    const quote = match[1] ?? "'";
    const rawValue = match[2] ?? "";
    const inlinedValue = await inlineLocalResource(rawValue, scriptDir, workspaceDir, context);
    if (inlinedValue === rawValue) {
      return match[0];
    }

    context.inlinedAssetCount += 1;
    return `${quote}${escapeForQuotedJavaScriptLiteral(inlinedValue, quote)}${quote}`;
  });
}

async function readAndProcessStylesheet(
  stylesheetPath: string,
  workspaceDir: string,
  context: SingleHtmlBuildContext
) {
  const cacheKey = normalizePath(stylesheetPath);
  if (context.stylesheetCache.has(cacheKey)) {
    return context.stylesheetCache.get(cacheKey) ?? "";
  }

  let stylesheet = await readFile(stylesheetPath, "utf8");
  stylesheet = await inlineCssAssetUrls(stylesheet, path.dirname(stylesheetPath), workspaceDir, context);
  context.stylesheetCache.set(cacheKey, stylesheet);
  return stylesheet;
}

async function readAndProcessScript(
  scriptPath: string,
  workspaceDir: string,
  context: SingleHtmlBuildContext,
  scriptMode: ScriptProcessingMode = "data-uri",
  documentAssets?: DocumentAssetCollector
) {
  const cacheKey = buildModeCacheKey(scriptPath, scriptMode);
  if (context.scriptCache.has(cacheKey)) {
    return context.scriptCache.get(cacheKey) ?? "";
  }

  let script = await readFile(scriptPath, "utf8");
  script = await processJavaScriptSource(script, path.dirname(scriptPath), workspaceDir, context, scriptMode, documentAssets);
  context.scriptCache.set(cacheKey, script);
  return script;
}

function buildEmbeddedAssetBootstrap(documentAssets: DocumentAssetCollector) {
  if (documentAssets.size === 0) {
    return "";
  }

  return `(() => {
  if (typeof window.__CH_ASSET__ === "function") {
    return;
  }

  const payloadNode = document.getElementById("__ch-embedded-asset-payload");
  const assetUrlCache = new Map();
  const assetDefinitions = new Map();

  if (payloadNode?.textContent) {
    const payloadLines = payloadNode.textContent.split("\\n");
    for (const payloadLine of payloadLines) {
      if (!payloadLine) {
        continue;
      }

      const firstTabIndex = payloadLine.indexOf("\\t");
      const secondTabIndex = payloadLine.indexOf("\\t", firstTabIndex + 1);
      if (firstTabIndex <= 0 || secondTabIndex <= firstTabIndex) {
        continue;
      }

      const assetId = payloadLine.slice(0, firstTabIndex);
      const mimeType = payloadLine.slice(firstTabIndex + 1, secondTabIndex);
      const payloadBase64 = payloadLine.slice(secondTabIndex + 1);
      assetDefinitions.set(assetId, [mimeType, payloadBase64]);
    }
  }

  function decodeBase64(payloadBase64) {
    const decoded = atob(payloadBase64);
    const bytes = new Uint8Array(decoded.length);
    for (let index = 0; index < decoded.length; index += 1) {
      bytes[index] = decoded.charCodeAt(index);
    }
    return bytes;
  }

  window.__CH_ASSET__ = (assetId) => {
    if (assetUrlCache.has(assetId)) {
      return assetUrlCache.get(assetId);
    }

    const entry = assetDefinitions.get(assetId);
    if (!entry) {
      return assetId;
    }

    const [mimeType, payloadBase64] = entry;
    const assetUrl = URL.createObjectURL(new Blob([decodeBase64(payloadBase64)], { type: mimeType }));
    assetUrlCache.set(assetId, assetUrl);
    return assetUrl;
  };
})();`;
}

function getEmbeddedAssetPayloadBase64(record: EmbeddedAssetRecord) {
  if (record.contentKind === "text") {
    return Buffer.from(record.textContent, "utf8").toString("base64");
  }

  return readFileSync(record.sourcePath).toString("base64");
}

function buildEmbeddedAssetManifest(documentAssets: DocumentAssetCollector) {
  if (documentAssets.size === 0) {
    return "";
  }

  return [...documentAssets.values()]
    .map((record) => `${record.id}\t${record.mimeType}\t${getEmbeddedAssetPayloadBase64(record)}`)
    .join("\n");
}

function injectInlineTagIntoHtmlDocument(html: string, tagMarkup: string) {
  if (!tagMarkup) {
    return html;
  }

  if (/<head\b[^>]*>/i.test(html)) {
    return html.replace(/<head\b[^>]*>/i, (match) => `${match}${tagMarkup}`);
  }

  if (/<body\b[^>]*>/i.test(html)) {
    return html.replace(/<body\b[^>]*>/i, (match) => `${match}${tagMarkup}`);
  }

  return `${tagMarkup}${html}`;
}

async function buildStandaloneHtmlDocument(
  entrypointPath: string,
  workspaceDir: string,
  context: SingleHtmlBuildContext,
  htmlMode: HtmlProcessingMode = "data-uri",
  documentAssets?: DocumentAssetCollector,
  injectEmbeddedAssets = true
): Promise<string> {
  const cacheKey = buildModeCacheKey(entrypointPath, htmlMode);
  if (context.htmlCache.has(cacheKey)) {
    return context.htmlCache.get(cacheKey) ?? "";
  }

  const html = await readFile(entrypointPath, "utf8");
  const $ = load(html);
  const htmlDir = path.dirname(entrypointPath);
  const activeDocumentAssets = documentAssets ?? (htmlMode === "asset-registry" ? new Map<string, EmbeddedAssetRecord>() : undefined);
  const scriptMode: ScriptProcessingMode = htmlMode === "asset-registry" ? "asset-registry" : "data-uri";

  const stylesheetNodes = $("link[rel='stylesheet'][href]").toArray();
  for (const node of stylesheetNodes) {
    const href = $(node).attr("href")?.trim() ?? "";
    if (!href || isExternalResource(href)) {
      continue;
    }

    const stylesheetPath = resolveWorkspaceResourcePath(href, htmlDir, workspaceDir);
    if (!stylesheetPath || !isPathInsideDirectory(workspaceDir, stylesheetPath) || !(await fileExists(stylesheetPath))) {
      continue;
    }

    const stylesheet = await readAndProcessStylesheet(stylesheetPath, workspaceDir, context);
    const styleTag = $("<style></style>");
    styleTag.attr("data-inline-source", href);
    styleTag.text(stylesheet);
    $(node).replaceWith(styleTag);
    context.inlinedAssetCount += 1;
  }

  const scriptNodes = $("script[src]").toArray();
  for (const node of scriptNodes) {
    const sourcePath = $(node).attr("src")?.trim() ?? "";
    if (!sourcePath || isExternalResource(sourcePath)) {
      continue;
    }

    const scriptPath = resolveWorkspaceResourcePath(sourcePath, htmlDir, workspaceDir);
    if (!scriptPath || !isPathInsideDirectory(workspaceDir, scriptPath) || !(await fileExists(scriptPath))) {
      continue;
    }

    const script = await readAndProcessScript(scriptPath, workspaceDir, context, scriptMode, activeDocumentAssets);
    const replacementTag = $("<script></script>");

    const attributes = node.attribs ?? {};
    for (const [name, value] of Object.entries(attributes)) {
      if (name === "src") {
        continue;
      }
      replacementTag.attr(name, value);
    }

    replacementTag.attr("data-inline-source", sourcePath);
    replacementTag.text(script);
    $(node).replaceWith(replacementTag);
    context.inlinedAssetCount += 1;
  }

  const inlineScriptNodes = $("script").toArray().filter((node) => !("src" in (node.attribs ?? {})));
  for (const node of inlineScriptNodes) {
    const typeAttribute = $(node).attr("type");
    if (!shouldProcessInlineScript(typeAttribute)) {
      continue;
    }

    const originalScript = $(node).html() ?? "";
    const nextScript = await processJavaScriptSource(
      originalScript,
      htmlDir,
      workspaceDir,
      context,
      scriptMode,
      activeDocumentAssets
    );
    if (nextScript === originalScript) {
      continue;
    }

    $(node).text(nextScript);
  }

  const resourceAttributes: Array<{ selector: string; attribute: string }> = [
    { selector: "img[src]", attribute: "src" },
    { selector: "source[src]", attribute: "src" },
    { selector: "audio[src]", attribute: "src" },
    { selector: "video[poster]", attribute: "poster" },
    { selector: "iframe[src]", attribute: "src" },
    { selector: "embed[src]", attribute: "src" },
    { selector: "object[data]", attribute: "data" },
    { selector: "link[rel='icon'][href]", attribute: "href" }
  ];

  for (const target of resourceAttributes) {
    const nodes = $(target.selector).toArray();
    for (const node of nodes) {
      const originalValue = $(node).attr(target.attribute)?.trim() ?? "";
      if (!originalValue || isExternalResource(originalValue)) {
        continue;
      }

      const inlinedValue = await inlineLocalResource(originalValue, htmlDir, workspaceDir, context);
      if (inlinedValue === originalValue) {
        continue;
      }

      $(node).attr(target.attribute, inlinedValue);
      context.inlinedAssetCount += 1;
    }
  }

  const srcsetNodes = $("[srcset]").toArray();
  for (const node of srcsetNodes) {
    const srcsetValue = $(node).attr("srcset")?.trim() ?? "";
    if (!srcsetValue) {
      continue;
    }

    const inlinedSrcset = await inlineSrcset(srcsetValue, htmlDir, workspaceDir, context);
    if (inlinedSrcset === srcsetValue) {
      continue;
    }

    $(node).attr("srcset", inlinedSrcset);
    context.inlinedAssetCount += 1;
  }

  let nextHtml = $.html();
  if (injectEmbeddedAssets && activeDocumentAssets && activeDocumentAssets.size > 0) {
    nextHtml = injectInlineTagIntoHtmlDocument(
      nextHtml,
      `<script type="application/json" id="__ch-embedded-asset-payload">${buildEmbeddedAssetManifest(activeDocumentAssets)}</script>`
    );
    nextHtml = injectInlineTagIntoHtmlDocument(
      nextHtml,
      `<script data-inline-source="canvas-helper-embedded-assets">${buildEmbeddedAssetBootstrap(activeDocumentAssets)}</script>`
    );
  }

  context.htmlCache.set(cacheKey, nextHtml);
  return nextHtml;
}

async function buildEmbeddedAssetRecord(
  resolvedPath: string,
  workspaceDir: string,
  context: SingleHtmlBuildContext,
  documentAssets?: DocumentAssetCollector
) {
  const assetMode: ScriptProcessingMode | HtmlProcessingMode = documentAssets ? "asset-registry" : "data-uri";
  const cacheKey = `embedded::${buildModeCacheKey(resolvedPath, assetMode)}`;
  if (context.embeddedAssetCache.has(cacheKey)) {
    return context.embeddedAssetCache.get(cacheKey) as EmbeddedAssetRecord;
  }

  let mimeType = (lookupMimeType(resolvedPath) || "application/octet-stream").toString();
  let embeddedAsset: EmbeddedAssetRecord;

  if (isHtmlPath(resolvedPath)) {
    const standaloneHtml = await buildStandaloneHtmlDocument(resolvedPath, workspaceDir, context, "data-uri");
    mimeType = "text/html";
    embeddedAsset = {
      id: `asset-${context.nextEmbeddedAssetId}`,
      mimeType,
      contentKind: "text",
      textContent: standaloneHtml
    };
  } else if (isScriptPath(resolvedPath)) {
    const scriptMode: ScriptProcessingMode = documentAssets ? "asset-registry" : "data-uri";
    const script = await readAndProcessScript(resolvedPath, workspaceDir, context, scriptMode, documentAssets);
    mimeType = "text/javascript";
    embeddedAsset = {
      id: `asset-${context.nextEmbeddedAssetId}`,
      mimeType,
      contentKind: "text",
      textContent: script
    };
  } else if (isStylesheetPath(resolvedPath)) {
    const stylesheet = await readAndProcessStylesheet(resolvedPath, workspaceDir, context);
    mimeType = "text/css";
    embeddedAsset = {
      id: `asset-${context.nextEmbeddedAssetId}`,
      mimeType,
      contentKind: "text",
      textContent: stylesheet
    };
  } else {
    embeddedAsset = {
      id: `asset-${context.nextEmbeddedAssetId}`,
      mimeType,
      contentKind: "file",
      sourcePath: resolvedPath
    };
  }

  context.nextEmbeddedAssetId += 1;
  context.embeddedAssetCache.set(cacheKey, embeddedAsset);
  return embeddedAsset;
}

async function buildLocalResourceDataUri(
  resolvedPath: string,
  workspaceDir: string,
  context: SingleHtmlBuildContext
) {
  const cacheKey = buildModeCacheKey(resolvedPath, "data-uri");
  if (context.dataUriCache.has(cacheKey)) {
    return context.dataUriCache.get(cacheKey) ?? "";
  }

  const embeddedAsset = await buildEmbeddedAssetRecord(resolvedPath, workspaceDir, context);
  const dataUri = `data:${embeddedAsset.mimeType};base64,${getEmbeddedAssetPayloadBase64(embeddedAsset)}`;

  context.dataUriCache.set(cacheKey, dataUri);
  return dataUri;
}

async function inlineLocalResource(
  resourceRef: string,
  baseDir: string,
  workspaceDir: string,
  context: SingleHtmlBuildContext
) {
  if (!resourceRef || isExternalResource(resourceRef)) {
    return resourceRef;
  }

  const resolvedPath = resolveWorkspaceResourcePath(resourceRef, baseDir, workspaceDir);
  if (!resolvedPath || !isPathInsideDirectory(workspaceDir, resolvedPath) || !(await fileExists(resolvedPath))) {
    return resourceRef;
  }

  return buildLocalResourceDataUri(resolvedPath, workspaceDir, context);
}

async function replaceAsync(
  value: string,
  pattern: RegExp,
  replacer: (match: RegExpMatchArray) => Promise<string>
) {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  const matches = [...value.matchAll(globalPattern)];
  if (matches.length === 0) {
    return value;
  }

  let cursor = 0;
  const parts: string[] = [];

  for (const match of matches) {
    const index = match.index ?? 0;
    parts.push(value.slice(cursor, index));
    parts.push(await replacer(match));
    cursor = index + match[0].length;
  }

  parts.push(value.slice(cursor));
  return parts.join("");
}

async function inlineCssAssetUrls(
  cssContent: string,
  cssDir: string,
  workspaceDir: string,
  context: SingleHtmlBuildContext
) {
  return replaceAsync(cssContent, /url\(([^)]+)\)/gi, async (match) => {
    const rawValue = match[1]?.trim() ?? "";
    if (!rawValue) {
      return match[0];
    }

    const unquotedValue = rawValue.replace(/^['"]|['"]$/g, "");
    if (!unquotedValue || unquotedValue.startsWith("data:")) {
      return match[0];
    }

    const inlinedValue = await inlineLocalResource(unquotedValue, cssDir, workspaceDir, context);
    if (inlinedValue === unquotedValue) {
      return match[0];
    }

    context.inlinedAssetCount += 1;
    return `url("${inlinedValue}")`;
  });
}

async function inlineSrcset(
  srcsetValue: string,
  baseDir: string,
  workspaceDir: string,
  context: SingleHtmlBuildContext
) {
  const entries = srcsetValue
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (entries.length === 0) {
    return srcsetValue;
  }

  const nextEntries = await Promise.all(
    entries.map(async (entry) => {
      const firstWhitespaceIndex = entry.search(/\s/);
      const rawUrl = firstWhitespaceIndex === -1 ? entry : entry.slice(0, firstWhitespaceIndex);
      const descriptor = firstWhitespaceIndex === -1 ? "" : entry.slice(firstWhitespaceIndex).trim();
      const inlinedUrl = await inlineLocalResource(rawUrl, baseDir, workspaceDir, context);
      if (inlinedUrl !== rawUrl) {
        context.inlinedAssetCount += 1;
      }
      return descriptor ? `${inlinedUrl} ${descriptor}` : inlinedUrl;
    })
  );

  return nextEntries.join(", ");
}

export type SingleHtmlOutputBundle = {
  htmlShell: string;
  documentAssets: Array<EmbeddedAssetRecord>;
  inlinedAssetCount: number;
};

function findHtmlInjectionOffset(html: string) {
  const headMatch = /<head\b[^>]*>/i.exec(html);
  if (headMatch && typeof headMatch.index === "number") {
    return headMatch.index + headMatch[0].length;
  }

  const bodyMatch = /<body\b[^>]*>/i.exec(html);
  if (bodyMatch && typeof bodyMatch.index === "number") {
    return bodyMatch.index + bodyMatch[0].length;
  }

  return 0;
}

async function writeChunk(stream: ReturnType<typeof createWriteStream>, chunk: string) {
  if (!chunk) {
    return;
  }

  if (!stream.write(chunk)) {
    await once(stream, "drain");
  }
}

function buildDocumentAssetCollector(documentAssets: Array<EmbeddedAssetRecord>) {
  return new Map(documentAssets.map((record) => [record.id, record]));
}

export async function buildSingleHtmlOutputBundle(workspaceDir: string, entrypointPath: string): Promise<SingleHtmlOutputBundle> {
  const context = createSingleHtmlBuildContext();
  const documentAssets = new Map<string, EmbeddedAssetRecord>();
  const htmlShell = await buildStandaloneHtmlDocument(
    entrypointPath,
    workspaceDir,
    context,
    "asset-registry",
    documentAssets,
    false
  );

  return {
    htmlShell,
    documentAssets: [...documentAssets.values()],
    inlinedAssetCount: context.inlinedAssetCount
  };
}

export function composeSingleHtmlDocument(bundle: SingleHtmlOutputBundle) {
  let html = bundle.htmlShell;
  if (bundle.documentAssets.length > 0) {
    const collector = buildDocumentAssetCollector(bundle.documentAssets);
    html = injectInlineTagIntoHtmlDocument(
      html,
      `<script type="application/json" id="__ch-embedded-asset-payload">${buildEmbeddedAssetManifest(collector)}</script>`
    );
    html = injectInlineTagIntoHtmlDocument(
      html,
      `<script data-inline-source="canvas-helper-embedded-assets">${buildEmbeddedAssetBootstrap(collector)}</script>`
    );
  }

  return html;
}

export async function writeSingleHtmlOutputBundle(outputPath: string, bundle: SingleHtmlOutputBundle) {
  await ensureDir(path.dirname(outputPath));

  const outputStream = createWriteStream(outputPath, { encoding: "utf8" });
  const finishPromise = once(outputStream, "finish");
  const collector = buildDocumentAssetCollector(bundle.documentAssets);
  const injectionOffset = findHtmlInjectionOffset(bundle.htmlShell);

  try {
    await writeChunk(outputStream, bundle.htmlShell.slice(0, injectionOffset));

    if (bundle.documentAssets.length > 0) {
      await writeChunk(outputStream, `<script type="application/json" id="__ch-embedded-asset-payload">`);
      for (let index = 0; index < bundle.documentAssets.length; index += 1) {
        const record = bundle.documentAssets[index];
        const line = `${record.id}\t${record.mimeType}\t${getEmbeddedAssetPayloadBase64(record)}`;
        await writeChunk(outputStream, index === 0 ? line : `\n${line}`);
      }
      await writeChunk(outputStream, `</script>`);
      await writeChunk(
        outputStream,
        `<script data-inline-source="canvas-helper-embedded-assets">${buildEmbeddedAssetBootstrap(collector)}</script>`
      );
    }

    await writeChunk(outputStream, bundle.htmlShell.slice(injectionOffset));
    outputStream.end();
    await finishPromise;
  } catch (error) {
    outputStream.destroy();
    throw error;
  }
}

export async function buildSingleHtmlOutput(workspaceDir: string, entrypointPath: string) {
  const bundle = await buildSingleHtmlOutputBundle(workspaceDir, entrypointPath);
  const html = composeSingleHtmlDocument(bundle);

  return {
    html,
    inlinedAssetCount: bundle.inlinedAssetCount
  };
}

async function runCommand(command: string, args: string[], cwd: string) {
  return new Promise<{ exitCode: number; stdout: string; stderr: string }>((resolve) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", (error) => {
      const message = error instanceof Error ? error.message : String(error);
      resolve({
        exitCode: 1,
        stdout,
        stderr: `${stderr}\n${message}`.trim()
      });
    });

    child.on("close", (code) => {
      resolve({
        exitCode: code ?? 1,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      });
    });
  });
}

export async function createZipFromDirectory(sourceDir: string, destinationZipPath: string) {
  await removePath(destinationZipPath);
  await ensureDir(path.dirname(destinationZipPath));

  if (process.platform === "win32") {
    const sourceGlob = path.join(sourceDir, "*").replace(/\\/g, "/").replace(/'/g, "''");
    const destinationPath = destinationZipPath.replace(/\\/g, "/").replace(/'/g, "''");
    const command = `Compress-Archive -Path '${sourceGlob}' -DestinationPath '${destinationPath}' -Force`;
    const result = await runCommand("powershell.exe", ["-NoLogo", "-NoProfile", "-Command", command], sourceDir);

    if (result.exitCode !== 0) {
      throw new Error(result.stderr || "Failed to create Brightspace package zip.");
    }
    return;
  }

  const result = await runCommand("zip", ["-rq", destinationZipPath, "."], sourceDir);
  if (result.exitCode !== 0) {
    throw new Error(result.stderr || "Failed to create Brightspace package zip.");
  }
}

export function toRelativePosixPath(baseDir: string, absolutePath: string) {
  return path.relative(baseDir, absolutePath).split(path.sep).join("/");
}

export async function detectStorageKeysFromWorkspace(workspaceDir: string, fallbackKey: string) {
  const workspaceFiles = await listFilesRecursive(workspaceDir);
  const scriptFiles = workspaceFiles.filter((filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    return ext === ".js" || ext === ".jsx" || ext === ".mjs" || ext === ".cjs" || ext === ".ts" || ext === ".tsx";
  });

  const scriptSources = await Promise.all(scriptFiles.map((filePath) => readFile(filePath, "utf8")));
  return findStorageKeysInScriptSources(scriptSources, fallbackKey);
}

export async function copyWorkspaceToExportDir(workspaceDir: string, exportDir: string) {
  await removePath(exportDir);
  await ensureDir(exportDir);
  await copyDirectory(workspaceDir, exportDir);
}
