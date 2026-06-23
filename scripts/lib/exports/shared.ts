import { spawn } from "node:child_process";
import { once } from "node:events";
import { createWriteStream, readFileSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { load } from "cheerio";
import { build as buildWithEsbuild } from "esbuild";
import { lookup as lookupMimeType } from "mime-types";

import { copyDirectory, ensureDir, listFilesRecursive, removePath } from "../fs.js";
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

function decodeResourcePath(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
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

async function isRegularFile(filePath: string) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function isWorkspaceFile(workspaceDir: string, targetPath: string) {
  return isPathInsideDirectory(workspaceDir, targetPath) && (await isRegularFile(targetPath));
}

function resolveWorkspaceResourcePath(resourceRef: string, baseDir: string, workspaceDir: string) {
  const sanitized = decodeResourcePath(stripQueryAndHash(resourceRef.trim().replace(/\\/g, "/")));
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
  referencePath?: string;
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

type LocalModuleExportInfo = {
  defaultExpression: string | null;
  namedExports: Set<string>;
};

type LocalModuleBundleState = {
  emittedModulePaths: Set<string>;
  importStack: Set<string>;
  moduleExportsByPath: Map<string, LocalModuleExportInfo>;
  nextModuleId: number;
};

type StaticImportBindings = {
  defaultBinding: string | null;
  namespaceBinding: string | null;
  namedBindings: Array<{
    imported: string;
    local: string;
  }>;
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

function htmlNeedsRelativeAssetContext(html: string) {
  return /\b(?:src|href|poster|data)=["'][^"']*(?:\.{1,2}\/|references\/)/i.test(html);
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

function isBabelScriptType(typeAttribute: string | undefined) {
  return (typeAttribute ?? "").trim().toLowerCase().includes("babel");
}

function isBabelStandaloneResource(value: string) {
  return /(?:@babel\/standalone|babel\.min\.js|babel\.standalone)/i.test(value);
}

async function findPrecompiledSiblingScript(scriptPath: string, workspaceDir: string) {
  const extension = path.extname(scriptPath).toLowerCase();
  if (extension !== ".jsx" && extension !== ".tsx") {
    return null;
  }

  const siblingScriptPath = path.join(path.dirname(scriptPath), `${path.basename(scriptPath, extension)}.js`);
  if (siblingScriptPath === scriptPath || !(await isWorkspaceFile(workspaceDir, siblingScriptPath))) {
    return null;
  }

  return siblingScriptPath;
}

function escapeForQuotedJavaScriptLiteral(value: string, quote: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(new RegExp(`\\${quote}`, "g"), `\\${quote}`);
}

function toEmbeddedAssetUrlExpression(assetId: string) {
  return `window.__CH_ASSET__(${JSON.stringify(assetId)})`;
}

function createLocalModuleBundleState(): LocalModuleBundleState {
  return {
    emittedModulePaths: new Set(),
    importStack: new Set(),
    moduleExportsByPath: new Map(),
    nextModuleId: 1
  };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseNamedImportBindings(namedClause: string) {
  const trimmedClause = namedClause.trim().replace(/^\{/, "").replace(/\}$/, "").trim();
  if (!trimmedClause) {
    return [];
  }

  return trimmedClause
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const aliasMatch = /^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/.exec(part);
      if (aliasMatch) {
        return {
          imported: aliasMatch[1],
          local: aliasMatch[2]
        };
      }

      return {
        imported: part,
        local: part
      };
    });
}

function parseStaticImportBindings(importClause: string | undefined): StaticImportBindings {
  const bindings: StaticImportBindings = {
    defaultBinding: null,
    namespaceBinding: null,
    namedBindings: []
  };
  const trimmedClause = (importClause ?? "").trim();
  if (!trimmedClause) {
    return bindings;
  }

  if (trimmedClause.startsWith("{")) {
    bindings.namedBindings = parseNamedImportBindings(trimmedClause);
    return bindings;
  }

  if (trimmedClause.startsWith("*")) {
    const namespaceMatch = /^\*\s+as\s+([A-Za-z_$][\w$]*)$/.exec(trimmedClause);
    bindings.namespaceBinding = namespaceMatch?.[1] ?? null;
    return bindings;
  }

  const commaIndex = trimmedClause.indexOf(",");
  if (commaIndex === -1) {
    bindings.defaultBinding = trimmedClause;
    return bindings;
  }

  bindings.defaultBinding = trimmedClause.slice(0, commaIndex).trim();
  const secondaryClause = trimmedClause.slice(commaIndex + 1).trim();
  if (secondaryClause.startsWith("{")) {
    bindings.namedBindings = parseNamedImportBindings(secondaryClause);
  } else if (secondaryClause.startsWith("*")) {
    const namespaceMatch = /^\*\s+as\s+([A-Za-z_$][\w$]*)$/.exec(secondaryClause);
    bindings.namespaceBinding = namespaceMatch?.[1] ?? null;
  }

  return bindings;
}

function hasTopLevelDeclaration(source: string, identifier: string) {
  const declarationPattern = new RegExp(`\\b(?:const|let|var|function|class)\\s+${escapeRegExp(identifier)}\\b`);
  return declarationPattern.test(source);
}

function transformLocalModuleExports(source: string, state: LocalModuleBundleState): {
  code: string;
  exports: LocalModuleExportInfo;
} {
  const namedExports = new Set<string>();
  let defaultExpression: string | null = null;
  let nextSource = source.replace(
    /\bexport\s+(const|let|var)\s+([A-Za-z_$][\w$]*)/g,
    (_match, declarationKind: string, exportName: string) => {
      namedExports.add(exportName);
      return `${declarationKind} ${exportName}`;
    }
  );

  nextSource = nextSource.replace(
    /\bexport\s+(async\s+function|function|class)\s+([A-Za-z_$][\w$]*)/g,
    (_match, declarationKind: string, exportName: string) => {
      namedExports.add(exportName);
      return `${declarationKind} ${exportName}`;
    }
  );

  nextSource = nextSource.replace(/\bexport\s*\{([^}]+)\}\s*;?/g, (_match, exportList: string) => {
    for (const part of String(exportList).split(",")) {
      const trimmedPart = part.trim();
      if (!trimmedPart) {
        continue;
      }

      const aliasMatch = /^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/.exec(trimmedPart);
      const localName = aliasMatch?.[1] ?? trimmedPart;
      const exportedName = aliasMatch?.[2] ?? trimmedPart;
      if (exportedName === "default") {
        defaultExpression = localName;
      } else {
        namedExports.add(localName);
      }
    }

    return "";
  });

  const defaultFunctionMatch = /\bexport\s+default\s+(async\s+function|function)\s+([A-Za-z_$][\w$]*)/.exec(nextSource);
  if (defaultFunctionMatch) {
    defaultExpression = defaultFunctionMatch[2];
    nextSource = nextSource.replace(
      /\bexport\s+default\s+(async\s+function|function)\s+([A-Za-z_$][\w$]*)/,
      `${defaultFunctionMatch[1]} ${defaultFunctionMatch[2]}`
    );
  }

  if (!defaultExpression) {
    const anonymousDefaultFunctionMatch = /\bexport\s+default\s+(async\s+function|function)\s*\(/.exec(nextSource);
    if (anonymousDefaultFunctionMatch) {
      defaultExpression = `__ch_module_default_${state.nextModuleId++}`;
      nextSource = nextSource.replace(
        /\bexport\s+default\s+(async\s+function|function)\s*\(/,
        `${anonymousDefaultFunctionMatch[1]} ${defaultExpression}(`
      );
    }
  }

  if (!defaultExpression) {
    const defaultClassMatch = /\bexport\s+default\s+class\s+([A-Za-z_$][\w$]*)/.exec(nextSource);
    if (defaultClassMatch) {
      defaultExpression = defaultClassMatch[1];
      nextSource = nextSource.replace(/\bexport\s+default\s+class\s+([A-Za-z_$][\w$]*)/, `class ${defaultClassMatch[1]}`);
    }
  }

  if (!defaultExpression) {
    const anonymousDefaultClassMatch = /\bexport\s+default\s+class\s*(?=\{|\sextends\b)/.exec(nextSource);
    if (anonymousDefaultClassMatch) {
      defaultExpression = `__ch_module_default_${state.nextModuleId++}`;
      nextSource = nextSource.replace(/\bexport\s+default\s+class\s*/, `class ${defaultExpression} `);
    }
  }

  if (!defaultExpression) {
    const defaultIdentifierMatch = /\bexport\s+default\s+([A-Za-z_$][\w$]*)\s*;?/.exec(nextSource);
    if (defaultIdentifierMatch) {
      defaultExpression = defaultIdentifierMatch[1];
      nextSource = hasTopLevelDeclaration(nextSource, defaultExpression)
        ? nextSource.replace(/\bexport\s+default\s+([A-Za-z_$][\w$]*)\s*;?/, "")
        : nextSource.replace(/\bexport\s+default\s+([A-Za-z_$][\w$]*)\s*;?/, `const ${defaultExpression} = ${defaultExpression};`);
    }
  }

  if (!defaultExpression && /\bexport\s+default\b/.test(nextSource)) {
    defaultExpression = `__ch_module_default_${state.nextModuleId++}`;
    nextSource = nextSource.replace(/\bexport\s+default\b/, `const ${defaultExpression} =`);
  }

  return {
    code: nextSource,
    exports: {
      defaultExpression,
      namedExports
    }
  };
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
  if (!resolvedPath || !(await isWorkspaceFile(workspaceDir, resolvedPath))) {
    return null;
  }

  const embeddedAsset = await buildEmbeddedAssetRecord(resolvedPath, workspaceDir, context, documentAssets);
  documentAssets.set(embeddedAsset.id, embeddedAsset);
  return toEmbeddedAssetUrlExpression(embeddedAsset.id);
}

async function bundleLocalScriptModule(
  modulePath: string,
  workspaceDir: string,
  context: SingleHtmlBuildContext,
  documentAssets: DocumentAssetCollector,
  state: LocalModuleBundleState
) {
  const normalizedModulePath = normalizePath(modulePath);
  const cachedExports = state.moduleExportsByPath.get(normalizedModulePath);
  if (cachedExports) {
    return {
      code: "",
      exports: cachedExports
    };
  }

  if (state.importStack.has(normalizedModulePath)) {
    throw new Error(`Circular local script import detected while bundling "${modulePath}".`);
  }

  state.importStack.add(normalizedModulePath);
  const moduleSource = await readFile(modulePath, "utf8");
  const processedModuleSource = await processJavaScriptSource(
    moduleSource,
    path.dirname(modulePath),
    workspaceDir,
    context,
    "asset-registry",
    documentAssets,
    state
  );
  const transformedModule = transformLocalModuleExports(processedModuleSource, state);
  state.moduleExportsByPath.set(normalizedModulePath, transformedModule.exports);
  state.emittedModulePaths.add(normalizedModulePath);
  state.importStack.delete(normalizedModulePath);

  return transformedModule;
}

function buildLocalImportBindingCode(bindings: StaticImportBindings, exportInfo: LocalModuleExportInfo) {
  const bindingLines: string[] = [];

  if (bindings.namespaceBinding) {
    const namespaceEntries = [...exportInfo.namedExports].map((name) => `${JSON.stringify(name)}:${name}`);
    if (exportInfo.defaultExpression) {
      namespaceEntries.unshift(`default:${exportInfo.defaultExpression}`);
    }
    bindingLines.push(`const ${bindings.namespaceBinding} = {${namespaceEntries.join(",")}};`);
  }

  if (bindings.defaultBinding) {
    if (!exportInfo.defaultExpression) {
      throw new Error(`Local module does not provide a default export for "${bindings.defaultBinding}".`);
    }

    if (bindings.defaultBinding !== exportInfo.defaultExpression) {
      bindingLines.push(`const ${bindings.defaultBinding} = ${exportInfo.defaultExpression};`);
    }
  }

  for (const binding of bindings.namedBindings) {
    const sourceExpression = binding.imported === "default" ? exportInfo.defaultExpression : binding.imported;
    if (!sourceExpression) {
      throw new Error(`Local module does not provide a default export for "${binding.local}".`);
    }

    if (binding.local !== sourceExpression) {
      bindingLines.push(`const ${binding.local} = ${sourceExpression};`);
    }
  }

  return bindingLines.join("\n");
}

async function inlineLocalStaticImports(
  scriptContent: string,
  scriptDir: string,
  workspaceDir: string,
  context: SingleHtmlBuildContext,
  documentAssets: DocumentAssetCollector,
  state: LocalModuleBundleState
) {
  return replaceAsync(
    scriptContent,
    /^\s*import\s+(?:(.*?)\s+from\s+)?(['"])([^'"]+)\2\s*;?/gms,
    async (match) => {
      const importClause = match[1];
      const resourceRef = match[3] ?? "";
      if (!resourceRef || isExternalResource(resourceRef)) {
        return match[0];
      }

      const resolvedPath = resolveWorkspaceResourcePath(resourceRef, scriptDir, workspaceDir);
      if (!resolvedPath || !(await isWorkspaceFile(workspaceDir, resolvedPath)) || !isScriptPath(resolvedPath)) {
        return match[0];
      }

      const bindings = parseStaticImportBindings(importClause);
      const bundledModule = await bundleLocalScriptModule(resolvedPath, workspaceDir, context, documentAssets, state);
      const bindingCode = buildLocalImportBindingCode(bindings, bundledModule.exports);
      const inlinedModuleCode =
        bundledModule.code.trim().length > 0 ? `/* inlined ${resourceRef} */\n${bundledModule.code.trim()}` : "";
      context.inlinedAssetCount += 1;

      return [inlinedModuleCode, bindingCode].filter(Boolean).join("\n");
    }
  );
}

async function processJavaScriptSource(
  scriptContent: string,
  scriptDir: string,
  workspaceDir: string,
  context: SingleHtmlBuildContext,
  scriptMode: ScriptProcessingMode = "data-uri",
  documentAssets?: DocumentAssetCollector,
  localModuleState?: LocalModuleBundleState
) {
  if (scriptMode === "asset-registry" && documentAssets) {
    const moduleState = localModuleState ?? createLocalModuleBundleState();
    let nextScript = await inlineLocalStaticImports(
      scriptContent,
      scriptDir,
      workspaceDir,
      context,
      documentAssets,
      moduleState
    );

    nextScript = await replaceAsync(
      nextScript,
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

    nextScript = await replaceAsync(nextScript, /\\(['"])((?:\.{1,2}\/|\/)[^'"\\\r\n]+?)\\\1/g, async (match) => {
      const quote = match[1] ?? '"';
      const assetExpression = await resolveEmbeddedAssetExpression(match[2] ?? "", scriptDir, workspaceDir, context, documentAssets);
      if (!assetExpression) {
        return match[0];
      }

      context.inlinedAssetCount += 1;
      return `\\${quote}${quote} + ${assetExpression} + ${quote}\\${quote}`;
    });

    nextScript = await replaceAsync(nextScript, /(?<!\\)(['"])((?:\.{1,2}\/|\/)[^'"\r\n]+?)(?<!\\)\1/g, async (match) => {
      const assetExpression = await resolveEmbeddedAssetExpression(match[2] ?? "", scriptDir, workspaceDir, context, documentAssets);
      if (!assetExpression) {
        return match[0];
      }

      context.inlinedAssetCount += 1;
      return assetExpression;
    });

    return nextScript;
  }

  return replaceAsync(scriptContent, /(?<!\\)(['"`])((?:\.{1,2}\/|\/)[^'"`\r\n]+?)(?<!\\)\1/g, async (match) => {
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
  context: SingleHtmlBuildContext,
  importStack = new Set<string>()
) {
  const cacheKey = normalizePath(stylesheetPath);
  if (context.stylesheetCache.has(cacheKey)) {
    return context.stylesheetCache.get(cacheKey) ?? "";
  }

  if (importStack.has(cacheKey)) {
    return "";
  }

  importStack.add(cacheKey);
  try {
    let stylesheet = await readFile(stylesheetPath, "utf8");
    stylesheet = await inlineCssImports(stylesheet, path.dirname(stylesheetPath), workspaceDir, context, importStack);
    stylesheet = await inlineCssAssetUrls(stylesheet, path.dirname(stylesheetPath), workspaceDir, context);
    context.stylesheetCache.set(cacheKey, stylesheet);
    return stylesheet;
  } finally {
    importStack.delete(cacheKey);
  }
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

function mapEsmShSpecifierToPackage(specifier: string) {
  if (!specifier.startsWith("https://esm.sh/")) {
    return specifier;
  }

  const parsed = new URL(specifier);
  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return specifier;
  }

  if (segments[0]?.startsWith("@")) {
    const scopedPackageName = segments[1]?.replace(/@\d.*$/, "");
    return [segments[0], scopedPackageName, ...segments.slice(2)].filter(Boolean).join("/");
  }

  const packageName = segments[0].replace(/@\d.*$/, "");
  return [packageName, ...segments.slice(1)].filter(Boolean).join("/");
}

function rewriteEsmShSpecifiersForLocalBundle(script: string) {
  return script.replace(/(["'])(https:\/\/esm\.sh\/[^"']+)\1/g, (match, quote: string, specifier: string) => {
    const mappedSpecifier = mapEsmShSpecifierToPackage(specifier);
    if (mappedSpecifier === specifier) {
      return match;
    }

    return `${quote}${mappedSpecifier}${quote}`;
  });
}

async function bundlePrecompiledScriptForAppsScript(
  scriptPath: string,
  workspaceDir: string,
  context: SingleHtmlBuildContext,
  documentAssets?: DocumentAssetCollector
) {
  const cacheKey = `${normalizePath(scriptPath)}::asset-registry-bundled`;
  if (context.scriptCache.has(cacheKey)) {
    return context.scriptCache.get(cacheKey) ?? "";
  }

  const script = rewriteEsmShSpecifiersForLocalBundle(await readFile(scriptPath, "utf8"));
  const buildResult = await buildWithEsbuild({
    stdin: {
      contents: script,
      loader: "js",
      resolveDir: path.dirname(scriptPath),
      sourcefile: path.basename(scriptPath)
    },
    bundle: true,
    define: {
      "process.env.NODE_ENV": JSON.stringify("production")
    },
    format: "iife",
    logLevel: "silent",
    minify: false,
    platform: "browser",
    target: "es2019",
    write: false
  });
  const bundledScript = buildResult.outputFiles[0]?.text ?? "";
  const processedScript = await processJavaScriptSource(
    bundledScript,
    workspaceDir,
    workspaceDir,
    context,
    "asset-registry",
    documentAssets
  );
  context.scriptCache.set(cacheKey, processedScript);
  return processedScript;
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
    if (!stylesheetPath || !(await isWorkspaceFile(workspaceDir, stylesheetPath))) {
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
    if (!scriptPath || !(await isWorkspaceFile(workspaceDir, scriptPath))) {
      continue;
    }

    const typeAttribute = $(node).attr("type");
    const precompiledScriptPath =
      htmlMode === "asset-registry" && isBabelScriptType(typeAttribute)
        ? await findPrecompiledSiblingScript(scriptPath, workspaceDir)
        : null;
    const scriptPathToInline = precompiledScriptPath ?? scriptPath;
    const script = precompiledScriptPath
      ? await bundlePrecompiledScriptForAppsScript(precompiledScriptPath, workspaceDir, context, activeDocumentAssets)
      : await readAndProcessScript(scriptPathToInline, workspaceDir, context, scriptMode, activeDocumentAssets);
    const replacementTag = $("<script></script>");

    const attributes = node.attribs ?? {};
    for (const [name, value] of Object.entries(attributes)) {
      if (name === "src") {
        continue;
      }
      if (precompiledScriptPath && (name === "type" || name === "data-type" || name === "data-presets")) {
        continue;
      }
      replacementTag.attr(name, value);
    }

    if (precompiledScriptPath) {
      replacementTag.attr("data-precompiled-source", toRelativePosixPath(workspaceDir, precompiledScriptPath));
      replacementTag.attr("data-bundled-source", "esbuild");
    }

    replacementTag.attr("data-inline-source", sourcePath);
    replacementTag.text(script);
    $(node).replaceWith(replacementTag);
    context.inlinedAssetCount += 1;
  }

  if (htmlMode === "asset-registry") {
    const remainingBabelScripts = $("script")
      .toArray()
      .some((node) => isBabelScriptType($(node).attr("type")));
    if (!remainingBabelScripts) {
      $("script[src]")
        .toArray()
        .forEach((node) => {
          const sourcePath = $(node).attr("src")?.trim() ?? "";
          if (sourcePath && isBabelStandaloneResource(sourcePath)) {
            $(node).remove();
          }
        });
    }
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
    { selector: "video[src]", attribute: "src" },
    { selector: "video[poster]", attribute: "poster" },
    { selector: "iframe[src]", attribute: "src" },
    { selector: "embed[src]", attribute: "src" },
    { selector: "object[data]", attribute: "data" },
    { selector: "a[data-inline-asset][href]", attribute: "href" },
    { selector: "link[rel='icon'][href]", attribute: "href" }
  ];

  for (const target of resourceAttributes) {
    const nodes = $(target.selector).toArray();
    for (const node of nodes) {
      const originalValue = $(node).attr(target.attribute)?.trim() ?? "";
      if (!originalValue || isExternalResource(originalValue)) {
        continue;
      }

      if (htmlMode === "asset-registry" && !injectEmbeddedAssets) {
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

    if (htmlMode === "asset-registry" && !injectEmbeddedAssets) {
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
    const standaloneHtml = await buildStandaloneHtmlDocument(
      resolvedPath,
      workspaceDir,
      context,
      documentAssets ? "asset-registry" : "data-uri",
      documentAssets,
      false
    );
    mimeType = "text/html";
    embeddedAsset = {
      id: `asset-${context.nextEmbeddedAssetId}`,
      mimeType,
      ...(documentAssets && htmlNeedsRelativeAssetContext(standaloneHtml)
        ? { referencePath: toRelativePosixPath(workspaceDir, resolvedPath) }
        : {}),
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
  if (!resolvedPath || !(await isWorkspaceFile(workspaceDir, resolvedPath))) {
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

async function inlineCssImports(
  cssContent: string,
  cssDir: string,
  workspaceDir: string,
  context: SingleHtmlBuildContext,
  importStack: Set<string>
) {
  return replaceAsync(
    cssContent,
    /@import\s+(?:url\(\s*)?(?:(['"])([^'"]+)\1|([^'")\s;]+))(?:\s*\))?\s*([^;]*);/gi,
    async (match) => {
      const importRef = match[2] ?? match[3] ?? "";
      if (!importRef || isExternalResource(importRef) || importRef.startsWith("data:")) {
        return match[0];
      }

      const resolvedPath = resolveWorkspaceResourcePath(importRef, cssDir, workspaceDir);
      if (!resolvedPath || !(await isWorkspaceFile(workspaceDir, resolvedPath)) || !isStylesheetPath(resolvedPath)) {
        return match[0];
      }

      const importedStylesheet = await readAndProcessStylesheet(resolvedPath, workspaceDir, context, importStack);
      context.inlinedAssetCount += 1;
      const mediaQuery = (match[4] ?? "").trim();
      if (!mediaQuery) {
        return `/* inlined ${importRef} */\n${importedStylesheet}`;
      }

      return `/* inlined ${importRef} */\n@media ${mediaQuery} {\n${importedStylesheet}\n}`;
    }
  );
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

export async function buildStandaloneHtmlAssetDocument(rootDir: string, entrypointPath: string): Promise<string> {
  const context = createSingleHtmlBuildContext();
  return buildStandaloneHtmlDocument(entrypointPath, rootDir, context, "data-uri");
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
    return (
      ext === ".js" ||
      ext === ".jsx" ||
      ext === ".mjs" ||
      ext === ".cjs" ||
      ext === ".ts" ||
      ext === ".tsx" ||
      ext === ".html" ||
      ext === ".htm"
    );
  });

  const scriptSources = await Promise.all(scriptFiles.map((filePath) => readFile(filePath, "utf8")));
  return findStorageKeysInScriptSources(scriptSources, fallbackKey);
}

export async function copyWorkspaceToExportDir(workspaceDir: string, exportDir: string) {
  await removePath(exportDir);
  await ensureDir(exportDir);
  await copyDirectory(workspaceDir, exportDir);
}
