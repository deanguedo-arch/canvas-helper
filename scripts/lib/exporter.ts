import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { load } from "cheerio";
import { lookup as lookupMimeType } from "mime-types";

import { copyDirectory, ensureDir, fileExists, listFilesRecursive, removePath, writeTextFile } from "./fs.js";
import { refreshProjectIntelligence } from "./intelligence.js";
import { getProjectPaths } from "./paths.js";
import { loadProjectManifest } from "./projects.js";

function unique(values: string[]) {
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

async function buildSingleHtmlOutput(workspaceDir: string, entrypointPath: string) {
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

async function createZipFromDirectory(sourceDir: string, destinationZipPath: string) {
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

export async function exportProjectToBrightspace(projectSlug: string) {
  const manifest = await loadProjectManifest(projectSlug);
  const paths = getProjectPaths(projectSlug);

  if (!(await fileExists(paths.workspaceEntrypoint))) {
    throw new Error(`Workspace entrypoint not found for "${projectSlug}".`);
  }

  await removePath(paths.brightspaceExportDir);
  await ensureDir(paths.brightspaceExportDir);
  await copyDirectory(paths.workspaceDir, paths.brightspaceExportDir);

  const exportedFiles = await listFilesRecursive(paths.brightspaceExportDir);
  const htmlFiles = exportedFiles.filter((filePath) => path.extname(filePath).toLowerCase() === ".html");
  const externalDependencies: string[] = [];

  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, "utf8");
    externalDependencies.push(...[...html.matchAll(/https?:\/\/[^\s"'<>]+/g)].map((match) => match[0]));
  }

  const report = `# Brightspace Export Report

- Project: ${manifest.slug}
- Generated: ${new Date().toISOString()}
- Files exported: ${exportedFiles.length}
- Export directory: ${paths.brightspaceExportDir}

## Upload Guidance
- Upload the entire brightspace export folder contents together so relative asset paths remain intact.
- Use index.html as the course page entrypoint.

## External Dependencies
${externalDependencies.length > 0 ? unique(externalDependencies).map((dependency) => `- ${dependency}`).join("\n") : "- None detected."}

## Warnings
${externalDependencies.length > 0 ? "- This export still depends on external CDN resources. Keep internet access available or replace those dependencies before publishing offline." : "- None."}
  `;

  await writeTextFile(path.join(paths.brightspaceExportDir, "export-report.md"), report);
  await refreshProjectIntelligence(projectSlug, { markWorkspaceApproved: true, command: "export" });
  return {
    projectSlug,
    fileCount: exportedFiles.length,
    exportDir: paths.brightspaceExportDir
  };
}

export async function exportProjectToBrightspacePackage(projectSlug: string) {
  const brightspaceExport = await exportProjectToBrightspace(projectSlug);
  const paths = getProjectPaths(projectSlug);
  const zipPath = path.join(paths.exportsDir, `${projectSlug}-brightspace.zip`);

  await createZipFromDirectory(paths.brightspaceExportDir, zipPath);

  return {
    ...brightspaceExport,
    zipPath
  };
}

export async function exportProjectToSingleHtml(projectSlug: string) {
  const paths = getProjectPaths(projectSlug);

  if (!(await fileExists(paths.workspaceEntrypoint))) {
    throw new Error(`Workspace entrypoint not found for "${projectSlug}".`);
  }

  const { html, inlinedAssetCount } = await buildSingleHtmlOutput(paths.workspaceDir, paths.workspaceEntrypoint);
  const singleHtmlExportDir = path.join(paths.exportsDir, "single-html");
  const outputPath = path.join(singleHtmlExportDir, `${projectSlug}.html`);

  await ensureDir(singleHtmlExportDir);
  await writeTextFile(outputPath, html);
  await refreshProjectIntelligence(projectSlug, { markWorkspaceApproved: true, command: "export" });

  return {
    projectSlug,
    outputPath,
    inlinedAssetCount
  };
}
