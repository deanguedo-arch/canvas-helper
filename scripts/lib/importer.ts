import { randomUUID } from "node:crypto";
import { copyFile, readFile, stat } from "node:fs/promises";
import path from "node:path";

import { load } from "cheerio";

import { analyzeProject } from "./analyzer.js";
import {
  copyFileEnsuringDir,
  ensureDir,
  fileExists,
  listFilesRecursive,
  removePath,
  writeJsonFile,
  writeTextFile
} from "./fs.js";
import { refreshProjectIntelligence } from "./intelligence.js";
import { getProjectPaths, projectsRoot } from "./paths.js";
import { extractProjectReferences } from "./references.js";
import type { ImportLog, InputKind, LearningSource, ProjectManifest } from "./types.js";

type ImportProjectOptions = {
  inputPath: string;
  slug?: string;
  force?: boolean;
  source?: LearningSource;
};

type AssetReference = {
  originalValue: string;
  cleanValue: string;
};

type WorkspaceBuildResult = {
  scriptFile?: string;
  styleFile?: string;
  actions: string[];
  warnings: string[];
};

type ResolvedImportInput = {
  bundlePath: string;
  siteFilePath: string;
  inputKind: InputKind;
  sourceDir: string;
  htmlSource: string;
  preservedTextSource?: string;
  referenceFiles: string[];
  discoveryActions: string[];
  discoveryWarnings: string[];
};

function normalizePathForCompare(value: string) {
  return path.resolve(value).replace(/[\\/]+/g, path.sep).toLowerCase();
}

function isPathInsideRoot(targetPath: string, rootPath: string) {
  const normalizedTarget = normalizePathForCompare(targetPath);
  const normalizedRoot = normalizePathForCompare(rootPath);
  return normalizedTarget === normalizedRoot || normalizedTarget.startsWith(`${normalizedRoot}${path.sep}`);
}

export function resolveLearningSourceOverride(value: string | undefined): LearningSource | undefined {
  if (!value) {
    return undefined;
  }

  if (value === "gemini" || value === "other") {
    return value;
  }

  throw new Error(`Invalid --source value "${value}". Expected "gemini" or "other".`);
}

export function inferLearningSourceFromInputPath(absoluteInputPath: string): LearningSource {
  const geminiIncomingRoot = path.join(projectsRoot, "_incoming", "gemini");
  return isPathInsideRoot(absoluteInputPath, geminiIncomingRoot) ? "gemini" : "other";
}

function toLearningTrust(source: LearningSource) {
  return source === "gemini" ? "curated" : "auto";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function inferInputKind(filePath: string): InputKind {
  return path.extname(filePath).toLowerCase() === ".txt" ? "text-html" : "html";
}

function isSiteCandidate(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  return extension === ".html" || extension === ".txt";
}

function isGeneratedArtifactPath(inputDir: string, filePath: string) {
  const relativePath = path.relative(inputDir, filePath).replace(/\\/g, "/");
  const parts = relativePath.split("/");

  if (["raw", "workspace", "meta", "exports"].includes(parts[0])) {
    return true;
  }

  if (parts[0] === "references" && (parts[1] === "raw" || parts[1] === "extracted")) {
    return true;
  }

  return false;
}

function scoreSiteCandidate(inputDir: string, filePath: string) {
  const relativePath = path.relative(inputDir, filePath).replace(/\\/g, "/");
  const fileName = path.basename(filePath).toLowerCase();
  const extension = path.extname(fileName).toLowerCase();
  const depth = relativePath.split("/").length - 1;

  let score = 0;

  if (depth === 0) {
    score += 1000;
  }

  if (extension === ".html") {
    score += 150;
  }

  if (fileName === "index.html") {
    score += 220;
  }

  if (/(canvas|module|source|original|export)/.test(fileName)) {
    score += 80;
  }

  score -= depth * 25;
  score -= relativePath.length / 10;

  return score;
}

function extractHtmlFromText(text: string) {
  const doctypeIndex = text.search(/<!doctype html/i);
  if (doctypeIndex >= 0) {
    return text.slice(doctypeIndex).trim();
  }

  const htmlIndex = text.search(/<html[\s>]/i);
  if (htmlIndex >= 0) {
    const closingIndex = text.search(/<\/html>/i);
    if (closingIndex >= 0) {
      return text.slice(htmlIndex, closingIndex + "</html>".length).trim();
    }

    return text.slice(htmlIndex).trim();
  }

  throw new Error("Could not find an HTML document inside the provided text file.");
}

function isExternalReference(value: string) {
  return /^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("#");
}

function collectAssetReferences(htmlSource: string) {
  const $ = load(htmlSource.replace(/^\uFEFF/, ""));
  const references = new Map<string, AssetReference>();
  const selectors: Array<[string, string]> = [
    ["img[src]", "src"],
    ["script[src]", "src"],
    ["link[href]", "href"],
    ["source[src]", "src"],
    ["video[src]", "src"],
    ["audio[src]", "src"]
  ];

  for (const [selector, attribute] of selectors) {
    $(selector).each((_, element) => {
      const value = $(element).attr(attribute)?.trim();
      if (!value || isExternalReference(value)) {
        return;
      }

      const cleanValue = value.split("#")[0]?.split("?")[0] ?? value;
      if (!cleanValue) {
        return;
      }

      references.set(value, { originalValue: value, cleanValue });
    });
  }

  return [...references.values()];
}

function resolveReferencedAssetPaths(assetReferences: AssetReference[], sourceDir: string) {
  return new Set(
    assetReferences
      .map((reference) => reference.cleanValue.replace(/\\/g, "/"))
      .filter((relativePath) => !relativePath.startsWith("../"))
      .map((relativePath) => path.resolve(sourceDir, relativePath))
  );
}

async function copyReferencedAssets(
  sourceDir: string,
  destinationRoot: string,
  references: AssetReference[],
  warnings: string[]
) {
  for (const reference of references) {
    const normalized = reference.cleanValue.replace(/\\/g, "/");
    if (normalized.startsWith("../")) {
      warnings.push(`Skipped parent-directory asset reference "${reference.originalValue}".`);
      continue;
    }

    const sourcePath = path.resolve(sourceDir, normalized);
    if (!(await fileExists(sourcePath))) {
      warnings.push(`Referenced asset not found: ${reference.originalValue}`);
      continue;
    }

    const destinationPath = path.join(destinationRoot, normalized);
    await copyFileEnsuringDir(sourcePath, destinationPath);
  }
}

async function copyReferenceFiles(referenceFiles: string[], bundlePath: string, destinationRoot: string) {
  for (const filePath of referenceFiles) {
    const relativePath = path.relative(bundlePath, filePath);
    const destinationPath = path.join(destinationRoot, relativePath);
    await copyFileEnsuringDir(filePath, destinationPath);
  }
}

function inferScriptExtension(inlineScripts: Array<{ content: string; attributes: Record<string, string> }>) {
  if (
    inlineScripts.some((script) => script.attributes.type?.includes("babel")) ||
    inlineScripts.some(
      (script) =>
        /ReactDOM\.createRoot|root\.render\(<|return\s*\(/.test(script.content) &&
        /<[A-Z][A-Za-z0-9]*/.test(script.content)
    )
  ) {
    return ".jsx";
  }

  return ".js";
}

function serializeHtmlDocument(htmlSource: string, $: ReturnType<typeof load>) {
  const doctype = htmlSource.match(/<!doctype[^>]*>/i)?.[0] ?? "<!DOCTYPE html>";
  const serialized = $.html().replace(/^\s*<!doctype[^>]*>\s*/i, "");
  return `${doctype}\n${serialized}`;
}

async function buildWorkspaceFromHtml(
  htmlSource: string,
  workspaceDir: string,
  sourceDir: string
): Promise<WorkspaceBuildResult> {
  const sanitizedHtml = htmlSource.replace(/^\uFEFF/, "");
  const $ = load(sanitizedHtml);
  const actions: string[] = [];
  const warnings: string[] = [];

  const assetReferences = collectAssetReferences(htmlSource);
  await copyReferencedAssets(sourceDir, workspaceDir, assetReferences, warnings);

  const inlineStyles = $("style")
    .toArray()
    .map((node) => {
      const content = $(node).html() ?? "";
      const media = $(node).attr("media");
      $(node).remove();
      return media && media !== "all" ? `@media ${media} {\n${content}\n}` : content;
    })
    .filter((content) => content.trim().length > 0);

  let styleFile: string | undefined;
  if (inlineStyles.length > 0) {
    styleFile = "styles.css";
    await writeTextFile(path.join(workspaceDir, styleFile), `${inlineStyles.join("\n\n")}\n`);
    $("head").append(`\n    <link rel="stylesheet" href="./${styleFile}">\n`);
    actions.push(`Externalized ${inlineStyles.length} inline style block(s) to workspace/${styleFile}.`);
  }

  const inlineScripts = $("script:not([src])")
    .toArray()
    .map((node) => {
      const element = $(node);
      const content = element.html() ?? "";
      const attributes = Object.fromEntries(
        Object.entries(node.attribs ?? {}).map(([key, value]) => [key, value ?? ""])
      );
      element.remove();
      return { content, attributes };
    })
    .filter((script) => script.content.trim().length > 0);

  let scriptFile: string | undefined;
  if (inlineScripts.length > 0) {
    const extension = inferScriptExtension(inlineScripts);
    scriptFile = extension === ".jsx" ? "main.jsx" : "main.js";
    const mergedScript = inlineScripts
      .map((script, index) => `/* inline script ${index + 1} */\n${script.content.trim()}`)
      .join("\n\n");
    await writeTextFile(path.join(workspaceDir, scriptFile), `${mergedScript}\n`);

    const baseAttributes = { ...inlineScripts[0].attributes };
    if (extension === ".jsx" && !baseAttributes.type) {
      baseAttributes.type = "text/babel";
    }

    const attributeMarkup = Object.entries(baseAttributes)
      .filter(([name]) => name !== "src")
      .map(([name, value]) => (value ? `${name}="${value}"` : name))
      .join(" ");
    const scriptTag = attributeMarkup
      ? `<script ${attributeMarkup} src="./${scriptFile}"></script>`
      : `<script src="./${scriptFile}"></script>`;
    const body = $("body");
    if (body.length > 0) {
      body.append(`\n    ${scriptTag}\n`);
    } else {
      $.root().append(`\n    ${scriptTag}\n`);
    }

    const signatureSet = new Set(inlineScripts.map((script) => JSON.stringify(script.attributes)));
    if (signatureSet.size > 1) {
      warnings.push(
        "Merged inline scripts with different attributes into one external script. Review workspace/main for compatibility."
      );
    }

    actions.push(`Externalized ${inlineScripts.length} inline script block(s) to workspace/${scriptFile}.`);
  }

  await ensureDir(path.join(workspaceDir, "assets"));
  await ensureDir(path.join(workspaceDir, "components"));
  await ensureDir(path.join(workspaceDir, "sections"));
  await writeTextFile(path.join(workspaceDir, "index.html"), serializeHtmlDocument(sanitizedHtml, $));

  if (assetReferences.length > 0) {
    actions.push(`Copied ${assetReferences.length} local asset reference(s) into the workspace.`);
  }

  return {
    scriptFile,
    styleFile,
    actions,
    warnings
  };
}

function createImportLogMarkdown(log: ImportLog) {
  const actionLines = log.actions.length > 0 ? log.actions.map((item) => `- ${item}`).join("\n") : "- None.";
  const warningLines = log.warnings.length > 0 ? log.warnings.map((item) => `- ${item}`).join("\n") : "- None.";

  return `# Import Log

- Generated: ${log.generatedAt}
- Source: ${log.sourcePath}

## Actions
${actionLines}

## Warnings
${warningLines}
`;
}

async function resolveImportInput(absoluteInputPath: string): Promise<ResolvedImportInput> {
  const inputStats = await stat(absoluteInputPath);

  if (inputStats.isFile()) {
    const inputKind = inferInputKind(absoluteInputPath);
    if (inputKind === "html") {
      return {
        bundlePath: path.dirname(absoluteInputPath),
        siteFilePath: absoluteInputPath,
        inputKind,
        sourceDir: path.dirname(absoluteInputPath),
        htmlSource: await readFile(absoluteInputPath, "utf8"),
        referenceFiles: [],
        discoveryActions: [],
        discoveryWarnings: []
      };
    }

    const preservedTextSource = await readFile(absoluteInputPath, "utf8");
    return {
      bundlePath: path.dirname(absoluteInputPath),
      siteFilePath: absoluteInputPath,
      inputKind,
      sourceDir: path.dirname(absoluteInputPath),
      htmlSource: extractHtmlFromText(preservedTextSource),
      preservedTextSource,
      referenceFiles: [],
      discoveryActions: [],
      discoveryWarnings: []
    };
  }

  if (!inputStats.isDirectory()) {
    throw new Error(`Unsupported import input: ${absoluteInputPath}`);
  }

  const bundleFiles = (await listFilesRecursive(absoluteInputPath)).filter(
    (filePath) => !isGeneratedArtifactPath(absoluteInputPath, filePath)
  );
  const siteCandidates = bundleFiles
    .filter((filePath) => isSiteCandidate(filePath))
    .sort((left, right) => {
      const scoreDifference = scoreSiteCandidate(absoluteInputPath, right) - scoreSiteCandidate(absoluteInputPath, left);
      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return path.relative(absoluteInputPath, left).localeCompare(path.relative(absoluteInputPath, right));
    });

  if (siteCandidates.length === 0) {
    throw new Error(
      `No .html or .txt site file was found in ${absoluteInputPath}. Drop a Canvas export into the folder first.`
    );
  }

  const siteFilePath = siteCandidates[0];
  const inputKind = inferInputKind(siteFilePath);
  const sourceDir = path.dirname(siteFilePath);
  const preservedTextSource = inputKind === "text-html" ? await readFile(siteFilePath, "utf8") : undefined;
  const htmlSource =
    inputKind === "html" ? await readFile(siteFilePath, "utf8") : extractHtmlFromText(preservedTextSource ?? "");
  const referencedAssetPaths = resolveReferencedAssetPaths(collectAssetReferences(htmlSource), sourceDir);
  const referenceFiles = bundleFiles.filter(
    (filePath) => filePath !== siteFilePath && !referencedAssetPaths.has(path.resolve(filePath))
  );

  const chosenRelativePath = path.relative(absoluteInputPath, siteFilePath).replace(/\\/g, "/");
  const discoveryActions = [`Detected "${chosenRelativePath}" as the site entrypoint inside the source folder.`];
  const discoveryWarnings =
    siteCandidates.length > 1
      ? [
          `Found ${siteCandidates.length} possible site files. Using "${chosenRelativePath}" and treating the rest as supporting material.`
        ]
      : [];

  return {
    bundlePath: absoluteInputPath,
    siteFilePath,
    inputKind,
    sourceDir,
    htmlSource,
    preservedTextSource,
    referenceFiles,
    discoveryActions,
    discoveryWarnings
  };
}

export async function importProject(options: ImportProjectOptions) {
  const absoluteInputPath = path.resolve(options.inputPath);
  if (!(await fileExists(absoluteInputPath))) {
    throw new Error(`Input file not found: ${absoluteInputPath}`);
  }

  const inputStats = await stat(absoluteInputPath);
  const defaultSlug = inputStats.isDirectory()
    ? slugify(path.basename(absoluteInputPath))
    : slugify(path.basename(absoluteInputPath, path.extname(absoluteInputPath)));
  const slug = options.slug ? slugify(options.slug) : defaultSlug;
  if (!slug) {
    throw new Error("Could not derive a valid project slug from the input path.");
  }

  const paths = getProjectPaths(slug);
  if (inputStats.isDirectory() && path.resolve(absoluteInputPath) === path.resolve(paths.root)) {
    throw new Error(
      `Import folder cannot be the same as the generated project folder. Put source bundles in a staging folder such as projects\\_incoming\\${slug}.`
    );
  }

  if ((await fileExists(paths.root)) && !options.force) {
    throw new Error(`Project "${slug}" already exists. Re-run with --force to replace it.`);
  }

  if ((await fileExists(paths.root)) && options.force) {
    await removePath(paths.root);
  }

  const learningSource = options.source ?? inferLearningSourceFromInputPath(absoluteInputPath);
  const learningTrust = toLearningTrust(learningSource);

  await ensureDir(paths.root);
  await ensureDir(paths.rawDir);
  await ensureDir(paths.workspaceDir);
  await ensureDir(paths.referencesRawDir);
  await ensureDir(paths.referencesExtractedDir);
  await ensureDir(paths.metaDir);
  await ensureDir(paths.exportsDir);

  const resolvedInput = await resolveImportInput(absoluteInputPath);
  const inputKind = resolvedInput.inputKind;
  const sourceDir = resolvedInput.sourceDir;
  const actions: string[] = [];
  const warnings: string[] = [...resolvedInput.discoveryWarnings];
  actions.push(...resolvedInput.discoveryActions);

  const htmlSource = resolvedInput.htmlSource;
  if (inputKind === "html") {
    await copyFile(resolvedInput.siteFilePath, paths.rawEntrypoint);
    actions.push("Copied the source HTML into raw/original.html without modifying it.");
  } else {
    await copyFile(resolvedInput.siteFilePath, paths.rawSourceText);
    await writeTextFile(paths.rawEntrypoint, `${htmlSource}\n`);
    actions.push("Extracted an HTML document from the source text file into raw/original.html.");
    actions.push("Preserved the original text input at raw/original-source.txt.");
  }

  const assetReferences = collectAssetReferences(htmlSource);
  await copyReferencedAssets(sourceDir, paths.rawDir, assetReferences, warnings);
  if (assetReferences.length > 0) {
    actions.push(`Copied ${assetReferences.length} local asset reference(s) into the raw project copy.`);
  }

  const workspaceResult = await buildWorkspaceFromHtml(htmlSource, paths.workspaceDir, sourceDir);
  actions.push(...workspaceResult.actions);
  warnings.push(...workspaceResult.warnings);

  if (resolvedInput.referenceFiles.length > 0) {
    await copyReferenceFiles(resolvedInput.referenceFiles, resolvedInput.bundlePath, paths.referencesRawDir);
    actions.push(`Copied ${resolvedInput.referenceFiles.length} supporting file(s) into references/raw.`);
  }

  const timestamp = new Date().toISOString();
  const manifest: ProjectManifest = {
    id: randomUUID(),
    slug,
    sourcePath: absoluteInputPath,
    inputKind,
    brightspaceTarget: "course-page",
    previewModes: ["raw", "workspace"],
    workspaceEntrypoint: paths.workspaceEntrypoint,
    rawEntrypoint: paths.rawEntrypoint,
    learningSource,
    learningTrust,
    learningUpdatedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const importLog: ImportLog = {
    generatedAt: timestamp,
    sourcePath: absoluteInputPath,
    actions,
    warnings
  };

  await writeJsonFile(paths.manifestPath, manifest);
  await analyzeProject(slug);
  if (resolvedInput.referenceFiles.length > 0) {
    await extractProjectReferences(slug);
    actions.push("Indexed the imported supporting material into references/extracted.");
  }
  const intelligence = await refreshProjectIntelligence(slug);
  actions.push(`Learned project patterns (${intelligence.learnedProfilePath}).`);
  actions.push(`Updated local pattern bank (${intelligence.libraryRecordCount} profile(s)).`);
  actions.push(`Generated prompt pack (${intelligence.promptPackPath}).`);
  await writeTextFile(paths.importLogPath, createImportLogMarkdown(importLog));

  return {
    slug,
    manifest,
    scriptFile: workspaceResult.scriptFile,
    styleFile: workspaceResult.styleFile,
    warnings
  };
}

export async function rehydrateWorkspace(slug: string, force = false) {
  const paths = getProjectPaths(slug);
  if (!(await fileExists(paths.rawEntrypoint))) {
    throw new Error(`No raw/original.html found for project "${slug}".`);
  }

  if (!force && (await fileExists(paths.workspaceEntrypoint))) {
    throw new Error(
      `Workspace already exists for "${slug}". Re-run with --force to rebuild it from raw/original.html.`
    );
  }

  if (force) {
    await removePath(paths.workspaceDir);
  }

  const rawHtml = await readFile(paths.rawEntrypoint, "utf8");
  await ensureDir(paths.workspaceDir);
  await buildWorkspaceFromHtml(rawHtml, paths.workspaceDir, paths.rawDir);
  await analyzeProject(slug);
  await refreshProjectIntelligence(slug);
}
