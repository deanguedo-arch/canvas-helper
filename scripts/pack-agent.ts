import path from "node:path";
import { readFile } from "node:fs/promises";

import { getStringFlag, parseArgs } from "./lib/cli.js";
import { fileExists, readJsonFile, writeTextFile } from "./lib/fs.js";
import { getProjectPaths } from "./lib/paths.js";
import type { ProjectManifest, ReferenceIndex, SectionMap } from "./lib/types.js";

type IndexedReference = {
  id: string;
  originalPath: string;
  kind: string;
  extractionStatus: string;
  extractedTextPath?: string;
};

async function readOptionalJson<T>(filePath: string) {
  if (!(await fileExists(filePath))) {
    return null;
  }

  return readJsonFile<T>(filePath);
}

async function readOptionalText(filePath: string) {
  if (!(await fileExists(filePath))) {
    return null;
  }

  return readFile(filePath, "utf8");
}

function truncateExcerpt(value: string, maxLength: number) {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength)}...`;
}

function renderMissing(label: string) {
  return `> ${label}: missing\n`;
}

function renderMarkdownSection(title: string, body: string) {
  return [`## ${title}`, "", body.trimEnd(), ""].join("\n");
}

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const projectSlug = getStringFlag(parsedArgs, "project") ?? parsedArgs.positionals[0];

  if (!projectSlug) {
    throw new Error("Usage: npm run pack -- --project <slug>");
  }

  const paths = getProjectPaths(projectSlug);

  const [
    manifest,
    sectionMap,
    styleGuide,
    contentOutline,
    importLog,
    referenceIndex
  ] = await Promise.all([
    readOptionalJson<ProjectManifest>(paths.manifestPath),
    readOptionalJson<SectionMap>(paths.sectionMapPath),
    readOptionalText(paths.styleGuidePath),
    readOptionalText(paths.contentOutlinePath),
    readOptionalText(paths.importLogPath),
    readOptionalJson<ReferenceIndex>(paths.referenceIndexPath)
  ]);

  const indexedReferences = (referenceIndex?.references ?? [])
    .filter((reference) => reference.extractionStatus === "indexed")
    .slice(0, 12) as IndexedReference[];

  const referenceExcerpts = await Promise.all(
    indexedReferences.map(async (reference) => {
      const extractedPath = path.join(paths.referencesExtractedDir, `${reference.id}.txt`);
      const extractedText = await readOptionalText(extractedPath);

      return {
        id: reference.id,
        kind: reference.kind,
        originalPath: reference.originalPath,
        excerpt: extractedText ? truncateExcerpt(extractedText, 1200) : null
      };
    })
  );

  const sectionLines = sectionMap?.sections?.length
    ? sectionMap.sections.map((section) => {
        const heading = section.headingText ? ` (heading: ${section.headingText})` : "";
        return `- ${section.label}${heading} -> ${section.file}`;
      })
    : [];

  const rulesSummary = [
    "- Work in repo-approved zones (`app/studio`, `scripts`, `docs`, `tasks`, root config files).",
    "- Treat `projects/<slug>/raw` as immutable baseline input.",
    "- Avoid dependency changes unless explicitly required.",
    "- Finish only after typecheck/build and task-specific verification pass."
  ].join("\n");

  const manifestBody = manifest
    ? ["```json", JSON.stringify(manifest, null, 2), "```"].join("\n")
    : renderMissing("project.json");

  const sectionsBody = sectionMap
    ? (sectionLines.length ? sectionLines.join("\n") : "- No sections detected.")
    : renderMissing("section-map.json");

  const styleGuideBody = styleGuide
    ? ["```md", styleGuide.trimEnd(), "```"].join("\n")
    : renderMissing("style-guide.md");

  const contentOutlineBody = contentOutline
    ? ["```md", contentOutline.trimEnd(), "```"].join("\n")
    : renderMissing("content-outline.md");

  const importLogBody = importLog
    ? ["```md", importLog.trimEnd(), "```"].join("\n")
    : renderMissing("import-log.md");

  const referenceBody = referenceExcerpts.length
    ? referenceExcerpts
        .map((reference) => {
          const header = `### ${reference.id} (${reference.kind})`;
          const source = `- Source: ${reference.originalPath}`;
          const excerpt = reference.excerpt
            ? ["```text", reference.excerpt, "```"].join("\n")
            : "- Extracted text missing.";
          return [header, source, "", excerpt].join("\n");
        })
        .join("\n\n")
    : "none";

  const taskStubBody = [
    "```md",
    "# Task",
    "## Goal",
    "<one sentence>",
    "",
    "## Constraints",
    "- Touch only the files listed in this task.",
    "- No new deps.",
    "- No refactors.",
    "",
    "## Acceptance tests",
    "- <test 1>",
    "- <test 2>",
    "",
    "## Expected files to change",
    "- <file 1>",
    "- <file 2>",
    "",
    "## Commands",
    "- npm run typecheck",
    "- npm run build:studio",
    "```"
  ].join("\n");

  const output = [
    "# Prompt Pack",
    "",
    `- Project: ${projectSlug}`,
    `- Generated: ${new Date().toISOString()}`,
    "",
    renderMarkdownSection("Rules", rulesSummary),
    renderMarkdownSection("Project Manifest", manifestBody),
    renderMarkdownSection("Sections List", sectionsBody),
    renderMarkdownSection("Style Guide", styleGuideBody),
    renderMarkdownSection("Content Outline", contentOutlineBody),
    renderMarkdownSection("Import Log", importLogBody),
    renderMarkdownSection("Reference Excerpts", referenceBody),
    renderMarkdownSection("Task Stub", taskStubBody)
  ].join("\n");

  const outputPath = path.join(paths.metaDir, "prompt-pack.md");
  await writeTextFile(outputPath, `${output.trimEnd()}\n`);

  console.log(`Wrote prompt pack: ${outputPath}`);
  console.log(`Indexed references included: ${referenceExcerpts.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
