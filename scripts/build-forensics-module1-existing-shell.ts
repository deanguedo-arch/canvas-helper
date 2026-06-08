import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceWorkspace = path.join(repoRoot, "projects", "forensics", "workspace");
const sourceHostedExport = path.join(repoRoot, "projects", "forensics", "exports", "google-hosted");
const outputWorkspace = path.join(repoRoot, "projects", "forensics-module1", "workspace");

type D2LModuleNode = {
  title?: string;
  resource?: {
    hrefs?: string[];
  };
  children?: D2LModuleNode[];
};

type D2LMap = {
  exportRoot?: string;
  summary?: Record<string, unknown>;
  modules: D2LModuleNode[];
};

function moduleHasTitle(moduleNode: D2LModuleNode) {
  return (moduleNode.title || "").trim().toLowerCase() === "1 introduction to crime scenes";
}

function asDataModule(data: unknown) {
  return `const d2lCourseMapData = ${JSON.stringify(data, null, 2)};\n\nexport default d2lCourseMapData;\n`;
}

function withoutPersistence(source: string) {
  const start = source.indexOf("function readForensicsWorkspaceState()");
  const end = source.indexOf("function buildPersistFieldKey", start);
  if (start === -1 || end === -1) {
    throw new Error("Could not find Forensics workspace persistence functions");
  }

  return `${source.slice(0, start)}function readForensicsWorkspaceState() {
  return null;
}

function writeForensicsWorkspaceState(_state) {
  return;
}

${source.slice(end)}`;
}

function withLocalReferenceUrls(source: string) {
  return source.replace(
    /function buildReferenceUrl\(relativePath\) \{\s*return `\/preview\/references\/raw\/forensics\/\$\{encodePath\(relativePath\)\}`;\s*\}/,
    `function buildReferenceUrl(relativePath) {\n  return encodePath(relativePath);\n}`
  );
}

function withoutFallbackModules(source: string) {
  const start = source.indexOf("const courseSeed = {");
  const end = source.indexOf("function slugify", start);
  if (start === -1 || end === -1) {
    throw new Error("Could not find Forensics workspace fallback course seed");
  }

  return `${source.slice(0, start)}const courseSeed = {
  title: "Forensic Studies 25",
  subtitle: "Module 1-only copy of the existing course shell",
  stats: { topLevelSections: 1, totalNodes: 25 },
  modules: []
};

${source.slice(end)}`;
}

function withoutAssignmentPersistence(source: string) {
  return source
    .replace(/window\.localStorage\.getItem\("forensics::module1assignment::v1"\)/g, "null")
    .replace(/window\.localStorage\.setItem\("forensics::module1assignment::v1", JSON\.stringify\(state\)\)/g, "undefined");
}

async function readD2LMap() {
  const source = await readFile(path.join(sourceWorkspace, "d2l-map-data.js"), "utf8");
  const match = source.match(/const d2lCourseMapData = ([\s\S]*?);\s*export default d2lCourseMapData;/);
  if (!match) {
    throw new Error("Could not parse projects/forensics/workspace/d2l-map-data.js");
  }
  return JSON.parse(match[1]) as D2LMap;
}

function collectResourceHrefs(node: D2LModuleNode, hrefs: string[] = []) {
  for (const href of node.resource?.hrefs || []) {
    hrefs.push(href);
  }
  for (const child of node.children || []) {
    collectResourceHrefs(child, hrefs);
  }
  return hrefs;
}

function normalizeSourceExportPath(href: string) {
  const normalized = href.replace(/\\/g, "/").replace(/^\/+/, "");
  const parts = normalized.split("/");
  if (parts[0] === "content" || parts[0] === "Ñontent" || parts[0] === "Ñ\u0081ontent" || parts[0] === "сontent") {
    parts[0] = "сontent";
  }
  return parts;
}

async function copyModuleOneSources(moduleOne: D2LModuleNode, exportRoot: string) {
  const hrefs = collectResourceHrefs(moduleOne);
  const copied = new Set<string>();
  for (const href of hrefs) {
    const sourceParts = normalizeSourceExportPath(href);
    const contentIndex = sourceParts.indexOf("Content");
    const copyParts = contentIndex === -1 ? sourceParts.slice(0, -1) : sourceParts.slice(0, contentIndex + 1);
    const parentSource = path.join(sourceHostedExport, exportRoot, ...copyParts);
    const parentRelative = path.join(...copyParts);
    const parentDestination = path.join(outputWorkspace, exportRoot, parentRelative);
    if (copied.has(parentDestination)) {
      continue;
    }
    copied.add(parentDestination);
    await mkdir(path.dirname(parentDestination), { recursive: true });
    await cp(parentSource, parentDestination, { recursive: true });

    const rootLevelDestination = path.join(outputWorkspace, parentRelative);
    if (!copied.has(rootLevelDestination)) {
      copied.add(rootLevelDestination);
      await mkdir(path.dirname(rootLevelDestination), { recursive: true });
      await cp(parentSource, rootLevelDestination, { recursive: true });
    }
  }
}

async function main() {
  const d2lCourseMapData = await readD2LMap();
  const moduleOne = d2lCourseMapData.modules.find(moduleHasTitle);
  if (!moduleOne) {
    throw new Error("Could not find Module 1 in projects/forensics/workspace/d2l-map-data.js");
  }

  await rm(outputWorkspace, { recursive: true, force: true });
  await mkdir(path.join(outputWorkspace, "assets"), { recursive: true });

  await cp(path.join(sourceWorkspace, "index.html"), path.join(outputWorkspace, "index.html"));
  await cp(path.join(sourceWorkspace, "assets", "module1assignment.html"), path.join(outputWorkspace, "assets", "module1assignment.html"));
  const assignmentBundle = await readFile(path.join(sourceWorkspace, "assets", "module1assignment.bundle.js"), "utf8");
  await writeFile(
    path.join(outputWorkspace, "assets", "module1assignment.bundle.js"),
    withoutAssignmentPersistence(assignmentBundle),
    "utf8"
  );

  const mainJsx = await readFile(path.join(sourceWorkspace, "main.jsx"), "utf8");
  await writeFile(
    path.join(outputWorkspace, "main.jsx"),
    withLocalReferenceUrls(withoutFallbackModules(withoutPersistence(mainJsx))),
    "utf8"
  );

  const moduleOneMap = {
    ...d2lCourseMapData,
    summary: {
      ...d2lCourseMapData.summary,
      moduleCount: 1,
      itemCount: 25
    },
    modules: [moduleOne]
  };
  await writeFile(path.join(outputWorkspace, "d2l-map-data.js"), asDataModule(moduleOneMap), "utf8");
  await copyModuleOneSources(moduleOne, String(d2lCourseMapData.exportRoot || ""));

  console.log(`Built ${path.relative(repoRoot, outputWorkspace)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
