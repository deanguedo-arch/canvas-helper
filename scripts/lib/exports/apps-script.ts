import { readFile } from "node:fs/promises";
import path from "node:path";

import { lookup as lookupMimeType } from "mime-types";

import {
  APPS_SCRIPT_ASSET_MANIFEST_PATH,
  APPS_SCRIPT_DRIVE_ASSET_DIR,
  type AppsScriptDriveAssetManifest,
  buildAppsScriptAssetManifest,
  buildAppsScriptClaspIgnore,
  buildAppsScriptCode,
  buildAppsScriptDeployReadme,
  buildAppsScriptManifest
} from "../apps-script.js";
import {
  copyFileEnsuringDir,
  ensureDir,
  fileExists,
  listFilesRecursive,
  removePath,
  writeJsonFile,
  writeTextFile
} from "../fs.js";
import { getProjectPaths, repoRoot } from "../paths.js";
import { recordCourseExportEvidence } from "../course-editing/export-freshness.js";
import { loadProjectManifest, markProjectWorkspaceApproved } from "../projects.js";

import {
  buildSingleHtmlOutputBundle,
  detectStorageKeysFromWorkspace,
  runExportAuthoringPreflight,
  type EmbeddedAssetRecord,
  type ExportAuthoringGateOptions
} from "./shared.js";

type PreservedAppsScriptConfig = {
  claspJson: string | null;
};

async function preserveAppsScriptConfig(exportDir: string): Promise<PreservedAppsScriptConfig> {
  const claspJsonPath = path.join(exportDir, ".clasp.json");
  return {
    claspJson: (await fileExists(claspJsonPath)) ? await readFile(claspJsonPath, "utf8") : null
  };
}

async function restoreAppsScriptConfig(exportDir: string, preservedConfig: PreservedAppsScriptConfig) {
  if (preservedConfig.claspJson) {
    await writeTextFile(path.join(exportDir, ".clasp.json"), preservedConfig.claspJson);
  }
}

async function writeDriveAssetFile(
  driveAssetsDir: string,
  manifestEntry: ReturnType<typeof buildAppsScriptAssetManifest>["assets"][number],
  record: EmbeddedAssetRecord
) {
  const destinationPath = path.join(driveAssetsDir, manifestEntry.relativePath);
  if (record.contentKind === "text") {
    await writeTextFile(destinationPath, record.textContent);
    return;
  }

  await copyFileEnsuringDir(record.sourcePath, destinationPath);
}

const CYRILLIC_CONTENT_ROOT_NAME = "\u0441ontent";
const MOJIBAKE_CONTENT_ROOT_NAME = "\u00D1\u0081ontent";
const APPS_SCRIPT_REFERENCE_ROOTS = new Set([
  "assignment",
  "quiz",
  "content",
  "references",
  CYRILLIC_CONTENT_ROOT_NAME,
  MOJIBAKE_CONTENT_ROOT_NAME
]);
const APPS_SCRIPT_REFERENCE_TEXT_EXTENSIONS = new Set([
  ".css",
  ".htm",
  ".html",
  ".js",
  ".json",
  ".mjs",
  ".svg",
  ".txt",
  ".xml"
]);

function normalizeReferenceAssetPath(value: string) {
  return value.replace(/\\/g, "/").replace(/^\.\/+/, "").replace(/^\/+/, "");
}

function shouldIncludeReferenceAsset(relativePath: string) {
  const normalizedPath = normalizeReferenceAssetPath(relativePath);
  if (!normalizedPath || normalizedPath.startsWith("_extracted/")) {
    return false;
  }

  if (normalizedPath === "imsmanifest.xml") {
    return true;
  }

  const [firstSegment] = normalizedPath.split("/");
  return APPS_SCRIPT_REFERENCE_ROOTS.has(firstSegment ?? "");
}

function isTextReferenceAsset(filePath: string, mimeType: string) {
  const normalizedMimeType = mimeType.toLowerCase();
  return (
    normalizedMimeType.startsWith("text/") ||
    normalizedMimeType === "application/javascript" ||
    normalizedMimeType === "application/json" ||
    normalizedMimeType === "application/xml" ||
    normalizedMimeType === "image/svg+xml" ||
    APPS_SCRIPT_REFERENCE_TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase())
  );
}

function cleanupDecodedReferenceText(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .replace(/\u0000/g, "")
    .replace(/\u0019/g, "'")
    .replace(/\uFFFD+/g, "");
}

async function readReferenceTextAsset(filePath: string) {
  const buffer = await readFile(filePath);
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return cleanupDecodedReferenceText(buffer.subarray(2).toString("utf16le"));
  }

  if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    const swapped = Buffer.alloc(buffer.length - 2);
    for (let index = 2; index + 1 < buffer.length; index += 2) {
      swapped[index - 2] = buffer[index + 1];
      swapped[index - 1] = buffer[index];
    }
    return cleanupDecodedReferenceText(swapped.toString("utf16le"));
  }

  const sampleLength = Math.min(buffer.length, 2048);
  let oddNullCount = 0;
  let evenNullCount = 0;
  for (let index = 0; index < sampleLength; index += 1) {
    if (buffer[index] !== 0) {
      continue;
    }
    if (index % 2 === 0) {
      evenNullCount += 1;
    } else {
      oddNullCount += 1;
    }
  }

  if (sampleLength > 16 && oddNullCount > sampleLength / 4 && evenNullCount < sampleLength / 20) {
    return cleanupDecodedReferenceText(buffer.toString("utf16le"));
  }

  return cleanupDecodedReferenceText(buffer.toString("utf8"));
}

function getNextAssetNumber(documentAssets: EmbeddedAssetRecord[]) {
  let maxAssetNumber = 0;
  for (const asset of documentAssets) {
    const match = asset.id.match(/^asset-(\d+)$/);
    if (match) {
      maxAssetNumber = Math.max(maxAssetNumber, Number(match[1]));
    }
  }

  return maxAssetNumber + 1;
}

async function collectReferenceAssets(
  referencesDir: string,
  documentAssets: EmbeddedAssetRecord[],
  referencePathPrefix = ""
) {
  if (!(await fileExists(referencesDir))) {
    return [];
  }

  const files = (await listFilesRecursive(referencesDir)).sort();
  let nextAssetNumber = getNextAssetNumber(documentAssets);
  const referenceAssets: EmbeddedAssetRecord[] = [];

  for (const filePath of files) {
    const localReferencePath = path.relative(referencesDir, filePath).split(path.sep).join("/");
    const referencePath = normalizeReferenceAssetPath(
      referencePathPrefix ? `${referencePathPrefix}/${localReferencePath}` : localReferencePath
    );
    if (!shouldIncludeReferenceAsset(referencePath)) {
      continue;
    }

    const mimeType = String(lookupMimeType(filePath) || "application/octet-stream");
    const id = `asset-${nextAssetNumber}`;
    nextAssetNumber += 1;

    if (isTextReferenceAsset(filePath, mimeType)) {
      referenceAssets.push({
        id,
        mimeType,
        referencePath,
        contentKind: "text",
        textContent: await readReferenceTextAsset(filePath)
      });
      continue;
    }

    referenceAssets.push({
      id,
      mimeType,
      referencePath,
      contentKind: "file",
      sourcePath: filePath
    });
  }

  return referenceAssets;
}

function toScriptSafeJson(value: unknown) {
  return JSON.stringify(value).replace(/<\//g, "<\\/");
}

function isExternalOrSpecialUrl(value: string) {
  return (
    /^[a-z][a-z0-9+.-]*:/i.test(value) ||
    value.startsWith("//") ||
    value.startsWith("#") ||
    value.startsWith("{{")
  );
}

function resolveReferenceRelativeUrl(referencePath: string, value: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue || isExternalOrSpecialUrl(trimmedValue)) {
    return value;
  }

  const [pathAndQuery, hash = ""] = trimmedValue.split("#", 2);
  const [pathname, query = ""] = pathAndQuery.split("?", 2);
  if (!pathname || pathname.startsWith("/")) {
    return value;
  }

  const baseDirectory = path.posix.dirname(referencePath);
  const resolvedPath = path.posix.normalize(path.posix.join(baseDirectory, pathname)).replace(/^\/+/, "");
  return `${resolvedPath}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

function rewritePreloadedReferenceHtml(textContent: string, referencePath: string) {
  if (!/\.(?:html?|xml|svg)$/i.test(referencePath)) {
    return textContent;
  }

  return textContent.replace(
    /\b(src|href|poster|data)=("([^"]*)"|'([^']*)')/gi,
    (match, attrName: string, quotedValue: string, doubleQuotedValue?: string, singleQuotedValue?: string) => {
      const rawValue = doubleQuotedValue ?? singleQuotedValue ?? "";
      const resolvedValue = resolveReferenceRelativeUrl(referencePath, rawValue);
      if (resolvedValue === rawValue) {
        return match;
      }
      const quote = quotedValue.startsWith("'") ? "'" : '"';
      return `${attrName}=${quote}${resolvedValue}${quote}`;
    }
  );
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

function buildReferenceAssetBootstrap(
  projectSlug: string,
  driveAssetManifest: AppsScriptDriveAssetManifest,
  documentAssets: EmbeddedAssetRecord[]
) {
  const referenceAssetMap: Record<string, string> = {};
  const referenceMimeMap: Record<string, string> = {};
  const preloadedTextAssetMap: Record<string, string> = {};
  const documentAssetById = new Map(documentAssets.map((asset) => [asset.id, asset]));

  for (const asset of driveAssetManifest.assets) {
    if (!asset.referencePath) {
      continue;
    }
    referenceAssetMap[asset.referencePath] = asset.id;
    referenceMimeMap[asset.id] = asset.mimeType;
    const documentAsset = documentAssetById.get(asset.id);
    if (documentAsset?.contentKind === "text") {
      preloadedTextAssetMap[asset.id] = rewritePreloadedReferenceHtml(documentAsset.textContent, asset.referencePath);
    }
  }

  if (Object.keys(referenceAssetMap).length === 0) {
    return "";
  }

  return [
    '<script data-inline-source="canvas-helper-apps-script-reference-assets">(function(){',
    '"use strict";',
    `const projectSlug_=${toScriptSafeJson(projectSlug)};`,
    `const referenceAssetMap_=${toScriptSafeJson(referenceAssetMap)};`,
    `const referenceMimeMap_=${toScriptSafeJson(referenceMimeMap)};`,
    `const preloadedTextAssetMap_=${toScriptSafeJson(preloadedTextAssetMap)};`,
    'if(window.__CH_TEXT_ASSET_MAP__){Object.assign(window.__CH_TEXT_ASSET_MAP__,preloadedTextAssetMap_);}',
    'function safeDecodePath_(value){try{return decodeURIComponent(value);}catch(error){return value;}}',
    'function normalizeReferencePath_(value){if(typeof value!=="string"){return "";}return value.split("#",1)[0].split("?",1)[0].replace(/\\\\/g,"/").replace(/^\\/+/, "").split("/").filter(Boolean).map(safeDecodePath_).join("/");}',
    'function extractReferencePath_(rawUrl){if(typeof rawUrl!=="string"||!rawUrl){return "";}try{const parsed=new URL(rawUrl,window.location.href);const pathname=parsed.pathname||"";const encodedPrefix="/preview/references/raw/"+encodeURIComponent(projectSlug_)+"/";const plainPrefix="/preview/references/raw/"+projectSlug_+"/";if(pathname.indexOf(encodedPrefix)===0){return normalizeReferencePath_(pathname.slice(encodedPrefix.length));}if(pathname.indexOf(plainPrefix)===0){return normalizeReferencePath_(pathname.slice(plainPrefix.length));}}catch(error){}return normalizeReferencePath_(rawUrl);}',
    'function lookupReferenceAssetIdByPath_(referencePath){return referenceAssetMap_[referencePath]||referenceAssetMap_[referencePath.replace(/^content\\//,"\\u0441ontent/")]||referenceAssetMap_[referencePath.replace(/^\\u00D1\\u0081ontent\\//,"\\u0441ontent/")]||referenceAssetMap_[referencePath.replace(/^\\u0441ontent\\//,"content/")]||"";}',
    'function lookupReferenceAssetId_(rawUrl){const referencePath=extractReferencePath_(rawUrl);if(!referencePath){return "";}const exactAssetId=lookupReferenceAssetIdByPath_(referencePath);if(exactAssetId){return exactAssetId;}const markers=["/content/","/\\u0441ontent/","/\\u00D1\\u0081ontent/"];for(let index=0;index<markers.length;index+=1){const marker=markers[index];const markerIndex=referencePath.lastIndexOf(marker);if(markerIndex>0){const candidate=referencePath.slice(markerIndex+1);const candidateAssetId=lookupReferenceAssetIdByPath_(candidate);if(candidateAssetId){return candidateAssetId;}}}return "";}',
    'const referencePathByAssetId_={};Object.keys(referenceAssetMap_).forEach(function(referencePath){referencePathByAssetId_[referenceAssetMap_[referencePath]]=referencePath;});',
    'function getUrlString_(input){if(typeof input==="string"){return input;}if(input&&typeof input.href==="string"){return input.href;}if(input&&typeof input.url==="string"){return input.url;}return "";}',
    'function isPdfAsset_(assetId){return String(referenceMimeMap_[assetId]||"").toLowerCase()==="application/pdf";}',
    'function isImageAsset_(assetId){return String(referenceMimeMap_[assetId]||"").toLowerCase().indexOf("image/")===0;}',
    'function buildPreloadedTextResponse_(rawUrl){const assetId=lookupReferenceAssetId_(rawUrl);if(!assetId||!Object.prototype.hasOwnProperty.call(preloadedTextAssetMap_,assetId)||typeof Response!=="function"){return null;}const mimeType=referenceMimeMap_[assetId]||"text/plain";return new Response(preloadedTextAssetMap_[assetId],{status:200,headers:{"Content-Type":mimeType.indexOf("charset=")>=0?mimeType:mimeType+"; charset=utf-8"}});}',
    'function toPdfPreviewUrl_(assetUrl){try{const parsed=new URL(assetUrl,window.location.href);const id=parsed.searchParams.get("id");if(id){return "https://drive.google.com/file/d/"+encodeURIComponent(id)+"/preview";}const marker="/file/d/";const markerIndex=parsed.pathname.indexOf(marker);if(markerIndex>=0){const fileId=parsed.pathname.slice(markerIndex+marker.length).split("/")[0];if(fileId){return "https://drive.google.com/file/d/"+encodeURIComponent(decodeURIComponent(fileId))+"/preview";}}}catch(error){}return "";}',
    'function buildReferenceAssetUrl_(rawUrl,options){const assetId=lookupReferenceAssetId_(rawUrl);if(!assetId||typeof window.__CH_ASSET__!=="function"){return rawUrl;}const mode=options&&options.mode?options.mode:(options&&options.rawMode?"raw":"asset");const assetUrl=window.__CH_ASSET__(assetId);if(mode==="preview"){return isPdfAsset_(assetId)?toPdfPreviewUrl_(assetUrl)||assetUrl:assetUrl;}if(mode==="raw"&&!isPdfAsset_(assetId)&&!isImageAsset_(assetId)&&typeof window.__CH_ASSET_RAW__==="function"){return window.__CH_ASSET_RAW__(assetId);}return assetUrl;}',
    'window.__CH_REFERENCE_ASSET__=function(rawUrl,options){return buildReferenceAssetUrl_(rawUrl,options||{});};',
    'window.__CH_REFERENCE_ASSET_ID__=function(rawUrl){return lookupReferenceAssetId_(rawUrl);};',
    'window.__CH_REFERENCE_PATH_FOR_ASSET__=function(assetId){return referencePathByAssetId_[assetId]||"";};',
    'window.__CH_REFERENCE_ASSET_MIME__=function(assetId){return referenceMimeMap_[assetId]||"";};',
    'if(typeof window.fetch==="function"){const nativeFetch_=window.fetch.bind(window);window.fetch=function(input,init){const rawUrl=getUrlString_(input);const preloadedResponse=buildPreloadedTextResponse_(rawUrl);if(preloadedResponse){return Promise.resolve(preloadedResponse);}const mappedUrl=buildReferenceAssetUrl_(rawUrl,{mode:"raw"});if(mappedUrl&&mappedUrl!==rawUrl){if(typeof input==="string"||input&&typeof input.href==="string"){return nativeFetch_(mappedUrl,init);}if(typeof Request==="function"&&input instanceof Request){return nativeFetch_(new Request(mappedUrl,input),init);}}return nativeFetch_(input,init);};}',
    'const imageDataUrlCache_={};',
    'const imageDataUrlPending_={};',
    'function hasGoogleRunner_(){return !!(window.google&&window.google.script&&window.google.script.run);}',
    'function requestImageDataUrl_(assetId){if(imageDataUrlCache_[assetId]){return Promise.resolve(imageDataUrlCache_[assetId]);}if(imageDataUrlPending_[assetId]){return imageDataUrlPending_[assetId];}if(!hasGoogleRunner_()){return Promise.reject(new Error("Apps Script reference image bridge unavailable"));}imageDataUrlPending_[assetId]=new Promise(function(resolve,reject){window.google.script.run.withSuccessHandler(function(result){try{const base64=result&&result.base64?String(result.base64):"";if(!base64){throw new Error("Empty image payload for "+assetId);}const mimeType=result&&result.mimeType?String(result.mimeType):referenceMimeMap_[assetId]||"image/png";const dataUrl="data:"+mimeType+";base64,"+base64;imageDataUrlCache_[assetId]=dataUrl;resolve(dataUrl);}catch(error){reject(error);}}).withFailureHandler(function(error){reject(error);}).getCanvasHelperAssetBase64(assetId);});return imageDataUrlPending_[assetId].then(function(dataUrl){delete imageDataUrlPending_[assetId];return dataUrl;},function(error){delete imageDataUrlPending_[assetId];throw error;});}',
    'function hydrateImageAsset_(element,rawUrl,nativeSetAttribute){const assetId=lookupReferenceAssetId_(rawUrl);if(!assetId||!isImageAsset_(assetId)){return false;}if(imageDataUrlCache_[assetId]){nativeSetAttribute.call(element,"src",imageDataUrlCache_[assetId]);return true;}requestImageDataUrl_(assetId).then(function(dataUrl){if(element&&element.isConnected!==false){nativeSetAttribute.call(element,"src",dataUrl);}}).catch(function(error){const fallbackUrl=typeof window.__CH_ASSET__==="function"?window.__CH_ASSET__(assetId):"";if(fallbackUrl&&fallbackUrl!==rawUrl){nativeSetAttribute.call(element,"src",fallbackUrl);}if(window.console&&console.warn){console.warn("[apps-script-reference-image-hydrator]",error);}});return true;}',
    'function scanImageAssets_(root,nativeSetAttribute){const scope=root&&root.querySelectorAll?root:document;const images=[];if(scope.matches&&scope.matches("img[src]")){images.push(scope);}scope.querySelectorAll&&scope.querySelectorAll("img[src]").forEach(function(image){images.push(image);});images.forEach(function(image){const src=image.getAttribute("src")||"";hydrateImageAsset_(image,src,nativeSetAttribute);});}',
    'if(typeof Element!=="undefined"&&Element.prototype&&Element.prototype.setAttribute){const nativeSetAttribute_=Element.prototype.setAttribute;Element.prototype.setAttribute=function(name,value){const attr=String(name||"").toLowerCase();if(typeof value==="string"&&attr==="src"&&this&&String(this.tagName||"").toLowerCase()==="img"&&hydrateImageAsset_(this,value,nativeSetAttribute_)){return;}if(typeof value==="string"&&(attr==="src"||attr==="href"||attr==="poster"||attr==="data")){const mappedUrl=buildReferenceAssetUrl_(value,{mode:attr==="href"||attr==="data"?"preview":"asset"});return nativeSetAttribute_.call(this,name,mappedUrl);}return nativeSetAttribute_.call(this,name,value);};if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",function(){scanImageAssets_(document,nativeSetAttribute_);},{once:true});}else{scanImageAssets_(document,nativeSetAttribute_);}if(window.MutationObserver){const observer=new MutationObserver(function(records){records.forEach(function(record){if(record.type==="attributes"&&record.target&&record.target.matches&&record.target.matches("img[src]")){scanImageAssets_(record.target,nativeSetAttribute_);return;}record.addedNodes&&record.addedNodes.forEach(function(node){if(node&&node.nodeType===1){scanImageAssets_(node,nativeSetAttribute_);}});});});observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["src"]});}}',
    "})();</script>"
  ].join("");
}

function countExportFiles(files: string[], driveAssetsDir: string) {
  const normalizedDriveAssetsDir = path.resolve(driveAssetsDir);
  let driveAssetFileCount = 0;
  let shellFileCount = 0;

  for (const filePath of files) {
    if (path.resolve(filePath).startsWith(`${normalizedDriveAssetsDir}${path.sep}`)) {
      driveAssetFileCount += 1;
      continue;
    }

    shellFileCount += 1;
  }

  return {
    driveAssetFileCount,
    shellFileCount
  };
}

export async function exportProjectToAppsScript(
  projectSlug: string,
  gateOptions: ExportAuthoringGateOptions = {}
) {
  const manifest = await loadProjectManifest(projectSlug);
  const paths = getProjectPaths(projectSlug);

  if (!(await fileExists(paths.workspaceEntrypoint))) {
    throw new Error(`Workspace entrypoint not found for "${projectSlug}".`);
  }

  await runExportAuthoringPreflight(projectSlug, paths.workspaceEntrypoint, gateOptions, "export");

  const bundle = await buildSingleHtmlOutputBundle(paths.workspaceDir, paths.workspaceEntrypoint);
  const referenceAssets = await collectReferenceAssets(paths.referencesDir, bundle.documentAssets);
  const workspaceReferenceAssets = await collectReferenceAssets(
    path.join(paths.workspaceDir, "references"),
    [...bundle.documentAssets, ...referenceAssets],
    "references"
  );
  const documentAssets = [...bundle.documentAssets, ...referenceAssets, ...workspaceReferenceAssets];
  const driveAssetManifest = buildAppsScriptAssetManifest(documentAssets);
  const htmlShell = injectInlineTagIntoHtmlDocument(
    bundle.htmlShell,
    buildReferenceAssetBootstrap(projectSlug, driveAssetManifest, documentAssets)
  );
  const exportDir = path.join(paths.exportsDir, "apps-script");
  const driveAssetsDir = path.join(exportDir, APPS_SCRIPT_DRIVE_ASSET_DIR);
  const projectTitle = manifest.slug;
  const explicitStorageKeys = Array.isArray(manifest.googleHosted?.trackedStorageKeys)
    ? manifest.googleHosted.trackedStorageKeys.map((value) => String(value || "").trim()).filter(Boolean)
    : [];
  const driveRootFolderId =
    typeof manifest.appsScript?.driveRootFolderId === "string" ? manifest.appsScript.driveRootFolderId.trim() : "";
  const disableAutosave = manifest.appsScript?.disableAutosave === true;
  const fallbackStorageKey = `${projectSlug}::workspace-state::v1`;
  const detectedStorageKeys =
    explicitStorageKeys.length > 0 || disableAutosave
      ? []
      : await detectStorageKeysFromWorkspace(paths.workspaceDir, fallbackStorageKey);
  const storageKeys =
    disableAutosave
      ? []
      : explicitStorageKeys.length > 0
        ? [...new Set(explicitStorageKeys)]
        : [...new Set([fallbackStorageKey, ...detectedStorageKeys])];
  const preservedConfig = await preserveAppsScriptConfig(exportDir);

  await removePath(exportDir);
  await ensureDir(driveAssetsDir);

  await Promise.all([
    writeTextFile(path.join(exportDir, "appsscript.json"), buildAppsScriptManifest()),
    writeTextFile(path.join(exportDir, ".claspignore"), buildAppsScriptClaspIgnore()),
    writeTextFile(
      path.join(exportDir, "Code.gs"),
      buildAppsScriptCode({
        assetManifestPath: APPS_SCRIPT_ASSET_MANIFEST_PATH,
        driveRootFolderId,
        projectSlug,
        projectTitle,
        shellAssetPath: driveAssetManifest.shellAssetPath,
        storageKeys
      })
    ),
    writeTextFile(path.join(driveAssetsDir, driveAssetManifest.shellAssetPath), htmlShell),
    writeJsonFile(path.join(driveAssetsDir, APPS_SCRIPT_ASSET_MANIFEST_PATH), driveAssetManifest)
  ]);

  await Promise.all(
    documentAssets.map(async (record) => {
      const manifestEntry = driveAssetManifest.assets.find((asset) => asset.id === record.id);
      if (!manifestEntry) {
        throw new Error(`Missing Apps Script asset manifest entry for "${record.id}".`);
      }

      await writeDriveAssetFile(driveAssetsDir, manifestEntry, record);
    })
  );

  const exportFiles = await listFilesRecursive(exportDir);
  const fileCounts = countExportFiles(exportFiles, driveAssetsDir);

  await writeTextFile(
    path.join(exportDir, "README-deploy.md"),
    buildAppsScriptDeployReadme({
      driveRootFolderId,
      driveAssetFileCount: fileCounts.driveAssetFileCount,
      projectSlug,
      projectTitle,
      shellFileCount: fileCounts.shellFileCount + 1 + (preservedConfig.claspJson ? 1 : 0),
      storageKeys
    })
  );

  await restoreAppsScriptConfig(exportDir, preservedConfig);
  await markProjectWorkspaceApproved(projectSlug);
  await recordCourseExportEvidence({ repoRoot, projectSlug, target: "apps-script", artifactPath: exportDir });

  const finalExportFiles = await listFilesRecursive(exportDir);
  const finalFileCounts = countExportFiles(finalExportFiles, driveAssetsDir);

  return {
    projectSlug,
    exportDir,
    shellFileCount: finalFileCounts.shellFileCount,
    driveAssetFileCount: finalFileCounts.driveAssetFileCount,
    storageKeys
  };
}
