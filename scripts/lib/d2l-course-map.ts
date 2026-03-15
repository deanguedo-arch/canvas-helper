import path from "node:path";
import { readFile } from "node:fs/promises";

import { load } from "cheerio";

import { ensureDir, fileExists, listFilesRecursive, writeJsonFile, writeTextFile } from "./fs.js";
import { getProjectPaths } from "./paths.js";
import { loadProjectManifest } from "./projects.js";
import type { D2LCourseMap, D2LCourseMapNode, D2LCourseMapResource, D2LNodeKind } from "./types.js";

type ResourceMap = Map<string, D2LCourseMapResource>;

type BuildNodeContext = {
  resources: ResourceMap;
};

function toNodeId(identifier: string | undefined, title: string, depth: number, index: number) {
  if (identifier) {
    return identifier;
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug ? `${slug}-${depth}-${index}` : `item-${depth}-${index}`;
}

function kindFromResourceHrefs(hrefs: string[]) {
  const normalized = hrefs.map((value) => value.toLowerCase());
  if (normalized.some((value) => value.includes("/assignment/") || value.includes("assignment_"))) {
    return "assignment" satisfies D2LNodeKind;
  }
  if (normalized.some((value) => value.includes("/quiz/") || value.includes("/qti_") || value.includes("qti_"))) {
    return "quiz" satisfies D2LNodeKind;
  }
  if (normalized.some((value) => value.endsWith(".pdf"))) {
    return "pdf" satisfies D2LNodeKind;
  }
  if (normalized.some((value) => value.endsWith(".html") || value.endsWith(".htm"))) {
    return "html" satisfies D2LNodeKind;
  }
  if (normalized.some((value) => value.endsWith(".xml"))) {
    return "lesson" satisfies D2LNodeKind;
  }
  return "resource" satisfies D2LNodeKind;
}

function deriveNodeKind(node: Pick<D2LCourseMapNode, "children" | "identifierRef" | "resource" | "depth">) {
  if (node.depth === 0) {
    return "module" satisfies D2LNodeKind;
  }

  if (node.children.length > 0 && !node.identifierRef) {
    return "folder" satisfies D2LNodeKind;
  }

  if (node.resource?.hrefs?.length) {
    return kindFromResourceHrefs(node.resource.hrefs);
  }

  return "lesson" satisfies D2LNodeKind;
}

function buildResourceMap($: ReturnType<typeof load>) {
  const resources = new Map<string, D2LCourseMapResource>();
  $("resources > resource").each((_index, element) => {
    const identifier = $(element).attr("identifier");
    if (!identifier) {
      return;
    }

    const hrefs = $(element)
      .find("file")
      .map((_fileIndex, fileElement) => $(fileElement).attr("href")?.trim() ?? "")
      .get()
      .filter(Boolean);

    resources.set(identifier, {
      identifierRef: identifier,
      hrefs
    });
  });
  return resources;
}

function buildNode(
  $: ReturnType<typeof load>,
  element: any,
  depth: number,
  index: number,
  context: BuildNodeContext
): D2LCourseMapNode {
  const item = $(element);
  const identifier = item.attr("identifier");
  const identifierRef = item.attr("identifierref") ?? undefined;
  const title = item.children("title").first().text().trim() || "Untitled";

  const childNodes = item
    .children("item")
    .toArray()
    .map((child, childIndex) => buildNode($, child, depth + 1, childIndex, context));

  const resource = identifierRef ? context.resources.get(identifierRef) : undefined;
  const kind = deriveNodeKind({
    children: childNodes,
    identifierRef,
    resource,
    depth
  });

  return {
    id: toNodeId(identifier, title, depth, index),
    title,
    kind,
    depth,
    identifierRef,
    resource,
    children: childNodes
  };
}

function flatten(nodes: D2LCourseMapNode[]): D2LCourseMapNode[] {
  const results: D2LCourseMapNode[] = [];
  for (const node of nodes) {
    results.push(node, ...flatten(node.children));
  }
  return results;
}

function findManifestPath(files: string[]) {
  return files.find((filePath) => path.basename(filePath).toLowerCase() === "imsmanifest.xml");
}

function renderNodeMarkdown(node: D2LCourseMapNode, depth = 0): string[] {
  const indent = "  ".repeat(depth);
  const href = node.resource?.hrefs?.[0] ? ` -> ${node.resource.hrefs[0]}` : "";
  const line = `${indent}- [${node.kind}] ${node.title}${href}`;
  const childLines = node.children.flatMap((child) => renderNodeMarkdown(child, depth + 1));
  return [line, ...childLines];
}

function renderCourseMapMarkdown(map: D2LCourseMap) {
  const lines = [
    "# D2L Course Map",
    "",
    `- Project: ${map.projectSlug}`,
    `- Generated: ${map.generatedAt}`,
    `- Manifest: ${map.manifestPath}`,
    `- Course title: ${map.courseTitle}`,
    "",
    "## Summary",
    `- Modules: ${map.summary.moduleCount}`,
    `- Items: ${map.summary.itemCount}`,
    `- Lessons: ${map.summary.lessonCount}`,
    `- Assignments: ${map.summary.assignmentCount}`,
    `- Quizzes: ${map.summary.quizCount}`,
    `- PDFs: ${map.summary.pdfCount}`,
    `- HTML pages: ${map.summary.htmlCount}`,
    "",
    "## Structure",
    ...map.modules.flatMap((node) => renderNodeMarkdown(node)),
    ""
  ];
  return `${lines.join("\n").trimEnd()}\n`;
}

function toSummary(nodes: D2LCourseMapNode[]) {
  const flattened = flatten(nodes);
  return {
    moduleCount: nodes.length,
    itemCount: flattened.length,
    lessonCount: flattened.filter((node) => node.kind === "lesson").length,
    assignmentCount: flattened.filter((node) => node.kind === "assignment").length,
    quizCount: flattened.filter((node) => node.kind === "quiz").length,
    pdfCount: flattened.filter((node) => node.kind === "pdf").length,
    htmlCount: flattened.filter((node) => node.kind === "html").length
  };
}

export async function buildD2LCourseMap(projectSlug: string) {
  const manifest = await loadProjectManifest(projectSlug);
  const paths = getProjectPaths(projectSlug);

  await ensureDir(paths.metaDir);

  const files = (await fileExists(paths.referencesRawDir)) ? await listFilesRecursive(paths.referencesRawDir) : [];
  const manifestPath = findManifestPath(files);
  if (!manifestPath) {
    throw new Error(
      `Could not find imsmanifest.xml under ${paths.referencesRawDir}. Import references first or place the D2L export in project resources.`
    );
  }

  const xml = await readFile(manifestPath, "utf8");
  const $ = load(xml, { xmlMode: true });
  const courseTitle =
    $("metadata lomm\\:title lomm\\:string").first().text().trim() ||
    $("metadata title string").first().text().trim() ||
    $("organization > title").first().text().trim() ||
    manifest.slug;

  const resources = buildResourceMap($);

  let modules = $("organizations > organization > item")
    .toArray()
    .flatMap((rootItem, rootIndex) =>
      $(rootItem)
        .children("item")
        .toArray()
        .map((moduleItem, moduleIndex) => buildNode($, moduleItem, 0, rootIndex * 1000 + moduleIndex, { resources }))
    );

  if (modules.length === 0) {
    modules = $("organizations > organization > item")
      .toArray()
      .map((moduleItem, moduleIndex) => buildNode($, moduleItem, 0, moduleIndex, { resources }));
  }

  const generatedAt = new Date().toISOString();
  const courseMap: D2LCourseMap = {
    schemaVersion: 1,
    projectId: manifest.id,
    projectSlug,
    generatedAt,
    manifestPath,
    courseTitle,
    summary: toSummary(modules),
    modules
  };

  await writeJsonFile(paths.d2lCourseMapPath, courseMap);
  await writeTextFile(paths.d2lCourseMapMarkdownPath, renderCourseMapMarkdown(courseMap));

  return {
    courseMap,
    outputPath: paths.d2lCourseMapPath,
    markdownPath: paths.d2lCourseMapMarkdownPath
  };
}
