import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { load } from "cheerio";
import { lookup as lookupMimeType } from "mime-types";

import { copyDirectory, ensureDir, fileExists, listFilesRecursive, removePath } from "../fs.js";
import { findStorageKeysInScriptSources } from "../scorm.js";

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

function toDataUri(filePath: string, value: Buffer) {
  const mimeType = lookupMimeType(filePath) || "application/octet-stream";
  return `data:${mimeType};base64,${value.toString("base64")}`;
}

async function inlineLocalResource(resourceRef: string, baseDir: string, workspaceDir: string) {
  if (!resourceRef || isExternalResource(resourceRef)) {
    return resourceRef;
  }

  const resolvedPath = resolveWorkspaceResourcePath(resourceRef, baseDir, workspaceDir);
  if (!resolvedPath || !isPathInsideDirectory(workspaceDir, resolvedPath) || !(await fileExists(resolvedPath))) {
    return resourceRef;
  }

  const fileContent = await readFile(resolvedPath);
  return toDataUri(resolvedPath, fileContent);
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

async function inlineCssAssetUrls(cssContent: string, cssDir: string, workspaceDir: string) {
  return replaceAsync(cssContent, /url\(([^)]+)\)/gi, async (match) => {
    const rawValue = match[1]?.trim() ?? "";
    if (!rawValue) {
      return match[0];
    }

    const unquotedValue = rawValue.replace(/^['"]|['"]$/g, "");
    if (!unquotedValue || unquotedValue.startsWith("data:")) {
      return match[0];
    }

    const inlinedValue = await inlineLocalResource(unquotedValue, cssDir, workspaceDir);
    if (inlinedValue === unquotedValue) {
      return match[0];
    }

    return `url("${inlinedValue}")`;
  });
}

async function inlineSrcset(srcsetValue: string, baseDir: string, workspaceDir: string) {
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
      const inlinedUrl = await inlineLocalResource(rawUrl, baseDir, workspaceDir);
      return descriptor ? `${inlinedUrl} ${descriptor}` : inlinedUrl;
    })
  );

  return nextEntries.join(", ");
}

export async function buildSingleHtmlOutput(workspaceDir: string, entrypointPath: string) {
  const html = await readFile(entrypointPath, "utf8");
  const $ = load(html);
  const htmlDir = path.dirname(entrypointPath);
  let inlinedAssetCount = 0;

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

    let stylesheet = await readFile(stylesheetPath, "utf8");
    stylesheet = await inlineCssAssetUrls(stylesheet, path.dirname(stylesheetPath), workspaceDir);

    const styleTag = $("<style></style>");
    styleTag.attr("data-inline-source", href);
    styleTag.text(stylesheet);
    $(node).replaceWith(styleTag);
    inlinedAssetCount += 1;
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

    const script = await readFile(scriptPath, "utf8");
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
    inlinedAssetCount += 1;
  }

  const resourceAttributes: Array<{ selector: string; attribute: string }> = [
    { selector: "img[src]", attribute: "src" },
    { selector: "source[src]", attribute: "src" },
    { selector: "video[poster]", attribute: "poster" },
    { selector: "link[rel='icon'][href]", attribute: "href" }
  ];

  for (const target of resourceAttributes) {
    const nodes = $(target.selector).toArray();
    for (const node of nodes) {
      const originalValue = $(node).attr(target.attribute)?.trim() ?? "";
      if (!originalValue || isExternalResource(originalValue)) {
        continue;
      }

      const inlinedValue = await inlineLocalResource(originalValue, htmlDir, workspaceDir);
      if (inlinedValue === originalValue) {
        continue;
      }

      $(node).attr(target.attribute, inlinedValue);
      inlinedAssetCount += 1;
    }
  }

  const srcsetNodes = $("[srcset]").toArray();
  for (const node of srcsetNodes) {
    const srcsetValue = $(node).attr("srcset")?.trim() ?? "";
    if (!srcsetValue) {
      continue;
    }

    const inlinedSrcset = await inlineSrcset(srcsetValue, htmlDir, workspaceDir);
    if (inlinedSrcset === srcsetValue) {
      continue;
    }

    $(node).attr("srcset", inlinedSrcset);
    inlinedAssetCount += 1;
  }

  return {
    html: $.html(),
    inlinedAssetCount
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
