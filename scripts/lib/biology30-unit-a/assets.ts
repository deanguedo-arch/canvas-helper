import { createHash } from "node:crypto";
import { copyFile, lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { load as loadHtml } from "cheerio";

import { normalizeArchivePath } from "../science-comparison.js";
import type {
  AssetLinkAudit,
  BiologySourceModel,
  CopiedAssetRecord,
  ExternalLinkRecord,
  ReplacedAssetRecord
} from "./types.js";

type AssetPurpose = CopiedAssetRecord["purpose"];
type ExternalHealth = Pick<
  ExternalLinkRecord,
  "checkStatus" | "httpStatus" | "checkedAt" | "finalUrl" | "error"
>;

const EXTERNAL_HEALTH_CACHE = new Map<string, ExternalHealth>();

function sha256Bytes(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

function isExternal(value: string) {
  return /^(?:https?:|mailto:|tel:|data:)/i.test(value.trim());
}

async function pathExists(targetPath: string) {
  try {
    await lstat(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

function stripQueryAndHash(value: string) {
  return value.split(/[?#]/, 1)[0];
}

function safeDecodeUriPath(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function resolveArchiveReference(baseArchivePath: string, href: string) {
  const raw = safeDecodeUriPath(stripQueryAndHash(href.trim())).replace(/\\/g, "/");
  if (!raw) throw new Error(`Cannot resolve an empty archive reference from ${baseArchivePath}.`);
  if (raw.startsWith("/")) return normalizeArchivePath(raw.slice(1));
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(baseArchivePath), raw));
  return normalizeArchivePath(resolved);
}

function inferredPurpose(archivePath: string): AssetPurpose {
  if (/\.(?:png|jpe?g|gif|svg|webp)$/i.test(archivePath)) return "image";
  if (/\.(?:pdf|docx?|xlsx?|pptx?|txt)$/i.test(archivePath)) return "document";
  return "other";
}

export class BiologyWorkspaceAssets {
  readonly copiedAssets: CopiedAssetRecord[] = [];
  readonly replacedMissingSourceAssets: ReplacedAssetRecord[] = [];
  readonly neutralizedLegacyLaunchers: ReplacedAssetRecord[] = [];
  readonly externalLinks: ExternalLinkRecord[] = [];

  private readonly copiedByKey = new Map<string, string>();
  private readonly externalByKey = new Map<string, ExternalLinkRecord>();

  constructor(
    private readonly repoRoot: string,
    private readonly workspaceDir: string,
    private readonly sources: Map<string, BiologySourceModel>
  ) {}

  async copyBrand() {
    const sourcePath = path.join(this.repoRoot, "docs", "design", "next-step", "assets", "nxt-ce-logo-white-with-ce.png");
    const workspacePath = "assets/brand/nxt-ce-logo-white-with-ce.png";
    const destinationPath = path.join(this.workspaceDir, workspacePath);
    await mkdir(path.dirname(destinationPath), { recursive: true });
    await copyFile(sourcePath, destinationPath);
    const bytes = await readFile(destinationPath);
    this.copiedAssets.push({
      sourceId: "canvas-helper",
      sourceArchivePath: "docs/design/next-step/assets/nxt-ce-logo-white-with-ce.png",
      workspacePath,
      bytes: bytes.byteLength,
      sha256: sha256Bytes(bytes),
      purpose: "brand"
    });
    return workspacePath;
  }

  async copyArchiveAsset(input: {
    sourceId: string;
    archivePath: string;
    purpose?: AssetPurpose;
    outputName?: string;
    context: string;
  }): Promise<string | null> {
    const source = this.sources.get(input.sourceId);
    if (!source) throw new Error(`Unknown Biology source ID: ${input.sourceId}`);
    const archivePath = normalizeArchivePath(input.archivePath);
    const key = `${input.sourceId}:${archivePath}:${input.outputName ?? ""}`;
    const existing = this.copiedByKey.get(key);
    if (existing) return existing;
    const entry = source.archive.file(archivePath);
    if (!entry) {
      this.replacedMissingSourceAssets.push({
        sourceId: input.sourceId,
        sourceArchivePath: archivePath,
        context: input.context,
        replacement: "Rendered a labelled source-asset fallback; no unresolved learner URL was emitted."
      });
      return null;
    }
    const outputArchivePath = input.outputName
      ? path.posix.join(path.posix.dirname(archivePath), input.outputName)
      : archivePath;
    const workspacePath = path.posix.join("assets", "source", input.sourceId, outputArchivePath);
    const destinationPath = path.join(this.workspaceDir, ...workspacePath.split("/"));
    const bytes = await entry.async("uint8array");
    await mkdir(path.dirname(destinationPath), { recursive: true });
    await writeFile(destinationPath, bytes);
    this.copiedAssets.push({
      sourceId: input.sourceId,
      sourceArchivePath: archivePath,
      workspacePath,
      bytes: bytes.byteLength,
      sha256: sha256Bytes(bytes),
      purpose: input.purpose ?? inferredPurpose(archivePath)
    });
    this.copiedByKey.set(key, workspacePath);
    return workspacePath;
  }

  async copyDerivedAsset(input: {
    sourceId: string;
    sourceArchivePath: string;
    sourceFilePath: string;
    workspacePath: string;
    purpose: AssetPurpose;
  }) {
    if (!this.sources.has(input.sourceId)) throw new Error(`Unknown Biology source ID: ${input.sourceId}`);
    const workspacePath = normalizeArchivePath(input.workspacePath.replace(/\\/g, "/"));
    const expectedPrefix = `assets/source/${input.sourceId}/`;
    if (!workspacePath.startsWith(expectedPrefix)) {
      throw new Error(`Derived Biology asset must stay under ${expectedPrefix}: ${workspacePath}`);
    }
    const key = `derived:${input.sourceId}:${input.sourceArchivePath}:${workspacePath}`;
    const existing = this.copiedByKey.get(key);
    if (existing) return existing;
    const destinationPath = path.join(this.workspaceDir, ...workspacePath.split("/"));
    await mkdir(path.dirname(destinationPath), { recursive: true });
    await copyFile(input.sourceFilePath, destinationPath);
    const bytes = await readFile(destinationPath);
    this.copiedAssets.push({
      sourceId: input.sourceId,
      sourceArchivePath: input.sourceArchivePath,
      workspacePath,
      bytes: bytes.byteLength,
      sha256: sha256Bytes(bytes),
      purpose: input.purpose
    });
    this.copiedByKey.set(key, workspacePath);
    return workspacePath;
  }

  addExternalLink(input: { sourceId: string; url: string; context: string }) {
    let checkStatus: ExternalLinkRecord["checkStatus"] = "not-checked";
    try {
      const parsed = new URL(input.url);
      if (!/^https?:$/.test(parsed.protocol)) checkStatus = "invalid";
    } catch {
      checkStatus = "invalid";
    }
    const key = `${input.sourceId}:${input.url}:${input.context}`;
    const existing = this.externalByKey.get(key);
    if (existing) return existing;
    const record: ExternalLinkRecord = {
      url: input.url,
      sourceId: input.sourceId,
      context: input.context,
      requiredForCompletion: false,
      fallback: "The local lesson text and assets remain available when this optional source reference cannot be opened.",
      checkStatus
    };
    this.externalByKey.set(key, record);
    this.externalLinks.push(record);
    return record;
  }

  addNeutralizedLauncher(input: { sourceId: string; sourceArchivePath: string; context: string; replacement: string }) {
    this.neutralizedLegacyLaunchers.push({ ...input });
  }

  async checkExternalLinkHealth() {
    const recordsByUrl = new Map<string, ExternalLinkRecord[]>();
    for (const record of this.externalLinks) {
      if (record.checkStatus === "invalid") continue;
      const records = recordsByUrl.get(record.url) ?? [];
      records.push(record);
      recordsByUrl.set(record.url, records);
    }
    const uniqueUrls = [...recordsByUrl.keys()];
    const checkOne = async (url: string) => {
      const records = recordsByUrl.get(url) ?? [];
      const cached = EXTERNAL_HEALTH_CACHE.get(url);
      if (cached) {
        for (const record of records) Object.assign(record, cached);
        return;
      }
      const checkedAt = new Date().toISOString();
      try {
        const parsed = new URL(url);
        if (!/^https?:$/.test(parsed.protocol) || ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)) {
          const health = { checkStatus: "invalid" as const, checkedAt };
          EXTERNAL_HEALTH_CACHE.set(url, health);
          for (const record of records) Object.assign(record, health);
          return;
        }
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5_000);
        let response: Response;
        try {
          response = await fetch(url, {
            method: "HEAD",
            redirect: "follow",
            signal: controller.signal,
            headers: { "user-agent": "CanvasHelper-LocalLinkAudit/1.0" }
          });
          if ([400, 403, 405].includes(response.status)) {
            response = await fetch(url, {
              method: "GET",
              redirect: "follow",
              signal: controller.signal,
              headers: { Range: "bytes=0-0", "user-agent": "CanvasHelper-LocalLinkAudit/1.0" }
            });
          }
        } finally {
          clearTimeout(timer);
        }
        const status: ExternalLinkRecord["checkStatus"] = response.ok
          ? response.url !== url
            ? "redirected"
            : "reachable"
          : response.status === 401 || response.status === 403 || response.status === 429
            ? "blocked"
            : "unreachable";
        const health = {
          checkStatus: status,
          httpStatus: response.status,
          checkedAt,
          finalUrl: response.url || undefined
        };
        EXTERNAL_HEALTH_CACHE.set(url, health);
        for (const record of records) Object.assign(record, health);
      } catch (error) {
        const health = {
          checkStatus: "unreachable" as const,
          checkedAt,
          error: error instanceof Error ? error.message : String(error)
        };
        EXTERNAL_HEALTH_CACHE.set(url, health);
        for (const record of records) Object.assign(record, health);
      }
    };

    for (let index = 0; index < uniqueUrls.length; index += 6) {
      await Promise.all(uniqueUrls.slice(index, index + 6).map(checkOne));
    }
  }

  async finalizeAudit(html: string, generatedAt: string): Promise<AssetLinkAudit> {
    const $ = loadHtml(html);
    const unresolvedWorkspaceAssets = new Set<string>();
    const candidateReferences = new Set<string>();
    $("[src], [href], [data]").each((_index, element) => {
      for (const attribute of ["src", "href", "data"]) {
        const value = $(element).attr(attribute)?.trim();
        if (!value || value.startsWith("#") || isExternal(value) || /^javascript:/i.test(value)) continue;
        candidateReferences.add(value);
      }
    });
    for (const reference of candidateReferences) {
      const relative = safeDecodeUriPath(stripQueryAndHash(reference));
      if (!relative || relative.startsWith("/")) {
        unresolvedWorkspaceAssets.add(reference);
        continue;
      }
      const absolute = path.resolve(this.workspaceDir, relative);
      const relativeFromWorkspace = path.relative(this.workspaceDir, absolute);
      if (relativeFromWorkspace.startsWith("..") || path.isAbsolute(relativeFromWorkspace)) {
        unresolvedWorkspaceAssets.add(reference);
        continue;
      }
      if (!(await pathExists(absolute))) unresolvedWorkspaceAssets.add(reference);
    }
    const d2lLaunchersRemaining = [...new Set(html.match(/(?:\/d2l\/|quickLink\.d2l)[^\s"'<]*/gi) ?? [])];
    return {
      schemaVersion: 1,
      generatedAt,
      copiedAssets: [...this.copiedAssets].sort((left, right) => left.workspacePath.localeCompare(right.workspacePath)),
      replacedMissingSourceAssets: [...this.replacedMissingSourceAssets],
      neutralizedLegacyLaunchers: [...this.neutralizedLegacyLaunchers],
      externalLinks: [...this.externalLinks].sort((left, right) => left.url.localeCompare(right.url)),
      unresolvedWorkspaceAssets: [...unresolvedWorkspaceAssets].sort(),
      d2lLaunchersRemaining
    };
  }
}
