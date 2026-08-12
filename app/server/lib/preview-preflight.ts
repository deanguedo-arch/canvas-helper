import path from "node:path";
import { open, stat } from "node:fs/promises";

import { load } from "cheerio";

import type {
  PreviewPreflightCode,
  PreviewPreflightResponse,
  PreviewRuntimeFamily
} from "../../shared/preview-health.js";
import { parsePreviewCapabilityPath } from "../../shared/preview-path.js";
import { fileExists } from "../../../scripts/lib/fs.ts";
import { getPreviewPath, getReferencePreviewPath } from "./preview-paths";
import { normalizePreviewRuntimeSource } from "./preview-runtime-relay";

const PREVIEW_PREFLIGHT_SAMPLE_BYTES = 768 * 1024;
const REMOTE_MODULE_SOURCE = /(?:\bfrom\s*|\bimport\s*\()\s*["'](https:\/\/[^"']+)["']/gi;

type PreviewPreflightTarget = {
  filePath: string;
  projectSlug: string;
  relativePath: string;
  resolveRelatedPath: (relativePath: string) => Promise<string>;
};

type RuntimeInventory = {
  approvedRemote: string[];
  local: string[];
  missingLocal: string[];
  unsupportedRemote: string[];
};

function response(
  status: PreviewPreflightResponse["status"],
  code: PreviewPreflightCode,
  message: string,
  details: string[],
  runtimeFamily: PreviewRuntimeFamily
): PreviewPreflightResponse {
  return {
    status,
    code,
    message,
    details: details.slice(0, 8).map((detail) => detail.slice(0, 240)),
    runtimeFamily
  };
}

function decodePath(value: string, fallback: string) {
  const candidate = value || fallback;
  try {
    return decodeURIComponent(candidate);
  } catch {
    throw new Error("Preview path is not valid URL encoding.");
  }
}

export async function resolvePreviewPreflightTarget(previewUrl: string, previewOrigin: string): Promise<PreviewPreflightTarget> {
  if (!previewUrl || previewUrl.length > 4_096) {
    throw new Error("Preview URL is missing or too long.");
  }
  const targetUrl = new URL(previewUrl);
  const expectedOrigin = new URL(previewOrigin);
  if (
    targetUrl.origin !== expectedOrigin.origin ||
    targetUrl.protocol !== "http:" ||
    targetUrl.hostname !== "127.0.0.1" ||
    targetUrl.username ||
    targetUrl.password
  ) {
    throw new Error("Preview URL is outside the isolated local preview.");
  }
  const capability = parsePreviewCapabilityPath(targetUrl.pathname);
  if (!capability) {
    throw new Error("Preview URL is not capability scoped.");
  }

  const projectMatch = capability.previewPath.match(/^\/preview\/(raw|workspace)\/([^/]+)(?:\/(.*))?$/);
  if (projectMatch) {
    const root = projectMatch[1] as "raw" | "workspace";
    const projectSlug = decodePath(projectMatch[2], "");
    const relativePath = decodePath(projectMatch[3] ?? "", root === "raw" ? "original.html" : "index.html");
    return {
      filePath: await getPreviewPath(root, projectSlug, projectMatch[3]),
      projectSlug,
      relativePath,
      resolveRelatedPath: (relatedPath) => getPreviewPath(root, projectSlug, relatedPath)
    };
  }

  const referenceMatch = capability.previewPath.match(/^\/preview\/references\/(raw|extracted)\/([^/]+)(?:\/(.*))?$/);
  if (!referenceMatch) {
    throw new Error("Preview URL does not identify a supported local page.");
  }
  const root = referenceMatch[1] as "raw" | "extracted";
  const projectSlug = decodePath(referenceMatch[2], "");
  const relativePath = decodePath(referenceMatch[3] ?? "", "");
  return {
    filePath: await getReferencePreviewPath(root, projectSlug, referenceMatch[3]),
    projectSlug,
    relativePath,
    resolveRelatedPath: (relatedPath) => getReferencePreviewPath(root, projectSlug, relatedPath)
  };
}

async function readSourceSample(filePath: string, byteLength: number) {
  const handle = await open(filePath, "r");
  try {
    const sampleLength = Math.min(byteLength, PREVIEW_PREFLIGHT_SAMPLE_BYTES);
    const sample = Buffer.alloc(sampleLength);
    const { bytesRead } = await handle.read(sample, 0, sampleLength, 0);
    return {
      source: sample.subarray(0, bytesRead).toString("utf8"),
      truncated: byteLength > bytesRead
    };
  } finally {
    await handle.close();
  }
}

function localAssetPath(source: string, pagePath: string) {
  const clean = source.split("#", 1)[0]?.split("?", 1)[0]?.trim() ?? "";
  if (!clean || clean.startsWith("data:") || clean.startsWith("blob:")) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(clean) || clean.startsWith("//") || clean.startsWith("/")) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(clean);
  } catch {
    return null;
  }
  const normalized = path.posix.normalize(path.posix.join(path.posix.dirname(pagePath), decoded));
  if (!normalized || normalized === "." || normalized === ".." || normalized.startsWith("../") || path.posix.isAbsolute(normalized)) {
    return null;
  }
  return normalized;
}

function remoteRuntimeSources(source: string) {
  const sources: string[] = [];
  for (const match of source.matchAll(REMOTE_MODULE_SOURCE)) {
    if (match[1]) sources.push(match[1]);
  }
  return sources;
}

function runtimeFamily(inventory: RuntimeInventory) {
  const hasLocal = inventory.local.length > 0 || inventory.missingLocal.length > 0;
  const hasApprovedRemote = inventory.approvedRemote.length > 0;
  const hasRemote = hasApprovedRemote || inventory.unsupportedRemote.length > 0;
  if (hasLocal && hasRemote) return "mixed-runtime" as const;
  if (hasLocal) return "local-runtime" as const;
  if (hasApprovedRemote) return "approved-runtime" as const;
  if (hasRemote) return "unknown" as const;
  return "static-html" as const;
}

function unsupportedRuntimeDetail(source: string) {
  try {
    const url = new URL(source.startsWith("//") ? `https:${source}` : source);
    if (url.hostname) return `Unsupported script host: ${url.hostname}`;
  } catch {
    // Root-relative course paths are reported without their query or fragment.
  }
  const localPath = source.split("#", 1)[0]?.split("?", 1)[0] ?? "unknown";
  return `Unsupported script path: ${localPath.slice(0, 180)}`;
}

async function inventoryRuntime(
  html: string,
  target: PreviewPreflightTarget
): Promise<{ runtime: RuntimeInventory; missingStyles: string[]; hasScripts: boolean; hasStaticContent: boolean }> {
  const $ = load(html);
  const runtime: RuntimeInventory = {
    approvedRemote: [],
    local: [],
    missingLocal: [],
    unsupportedRemote: []
  };
  const missingStyles: string[] = [];
  const scripts = $("script").toArray();
  const remoteSources = [
    ...scripts.map((element) => $(element).attr("src") ?? "").filter(Boolean),
    ...scripts.flatMap((element) => remoteRuntimeSources($(element).html() ?? ""))
  ];

  for (const source of remoteSources) {
    if (/^https:\/\//i.test(source)) {
      const approved = normalizePreviewRuntimeSource(source);
      if (approved) runtime.approvedRemote.push(approved);
      else runtime.unsupportedRemote.push(source);
      continue;
    }
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/)/i.test(source)) {
      if (!source.startsWith("data:") && !source.startsWith("blob:")) runtime.unsupportedRemote.push(source);
      continue;
    }
    const relative = localAssetPath(source, target.relativePath);
    if (!relative) continue;
    const localPath = await target.resolveRelatedPath(relative);
    if (await fileExists(localPath)) runtime.local.push(relative);
    else runtime.missingLocal.push(relative);
  }

  for (const element of $("link[rel~='stylesheet']").toArray()) {
    const href = $(element).attr("href") ?? "";
    const relative = localAssetPath(href, target.relativePath);
    if (!relative) continue;
    const localPath = await target.resolveRelatedPath(relative);
    if (!(await fileExists(localPath))) missingStyles.push(relative);
  }

  $("head, script, style, noscript, template").remove();
  const textLength = $("body").text().replace(/\s+/g, " ").trim().length;
  const visualCount = $("body").find("img, video, audio, canvas, svg, iframe, object, embed, table, input, textarea, select, button").length;
  return {
    runtime,
    missingStyles,
    hasScripts: scripts.length > 0,
    hasStaticContent: textLength > 0 || visualCount > 0
  };
}

export async function inspectPreviewPreflightTarget(target: PreviewPreflightTarget): Promise<PreviewPreflightResponse> {
  if (!/\.html?$/i.test(target.relativePath)) {
    return response(
      "error",
      "unsupported-page",
      "This selection is not an HTML course page Studio can preview here.",
      [`Selected page: ${target.relativePath}`],
      "unknown"
    );
  }
  if (!(await fileExists(target.filePath))) {
    return response(
      "error",
      "missing-page",
      "This page is no longer available in the selected course.",
      [`Missing page: ${target.relativePath}`],
      "unknown"
    );
  }

  try {
    const metadata = await stat(target.filePath);
    if (!metadata.isFile() || metadata.size === 0) {
      return response(
        "error",
        "empty-page",
        "This page has no course content to display.",
        [`Empty page: ${target.relativePath}`],
        "static-html"
      );
    }
    const sample = await readSourceSample(target.filePath, metadata.size);
    const inventory = await inventoryRuntime(sample.source, target);
    const family = runtimeFamily(inventory.runtime);

    if (inventory.runtime.missingLocal.length) {
      return response(
        inventory.hasStaticContent ? "warning" : "error",
        "missing-local-runtime",
        "This page depends on a local script that is missing.",
        inventory.runtime.missingLocal.map((asset) => `Missing script: ${asset}`),
        family
      );
    }
    if (inventory.runtime.unsupportedRemote.length) {
      return response(
        inventory.hasStaticContent ? "warning" : "error",
        "unsupported-runtime",
        "This page uses a script Studio does not support yet.",
        inventory.runtime.unsupportedRemote.map(unsupportedRuntimeDetail),
        family
      );
    }
    if (inventory.missingStyles.length) {
      return response(
        "warning",
        "missing-local-style",
        "This page is missing a style file and may not look right.",
        inventory.missingStyles.map((asset) => `Missing style: ${asset}`),
        family
      );
    }
    if (!sample.truncated && !inventory.hasStaticContent && !inventory.hasScripts) {
      return response(
        "error",
        "empty-page",
        "This page has no course content to display.",
        [`No visible content or runtime was found in ${target.relativePath}.`],
        family
      );
    }

    return response("ready", "ready", "", [], family);
  } catch {
    return response(
      "error",
      "unreadable-page",
      "Studio could not safely check this page before opening it.",
      [`Unreadable page: ${target.relativePath}`],
      "unknown"
    );
  }
}
