import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { parse } from "@babel/parser";
import traverseImport, { type NodePath } from "@babel/traverse";
import type { File, FunctionDeclaration, Node, Program, Statement, VariableDeclaration, VariableDeclarator } from "@babel/types";
import { load } from "cheerio";

import { ensureDir, fileExists, writeJsonFile, writeTextFile } from "./fs.js";
import { getProjectPaths } from "./paths.js";
import { loadProjectManifest, updateProjectManifest } from "./projects.js";
import type { ProjectManifest, ReferenceIndex, SectionMap, SectionManifest } from "./types.js";

const traverse =
  ((traverseImport as unknown as { default?: typeof traverseImport }).default ?? traverseImport) as typeof traverseImport;

type CandidateDeclaration = {
  name: string;
  start: number;
  end: number;
  kind: "component" | "section";
  source: string;
};

type AstSection = {
  id: string;
  label: string;
  headingText?: string;
  file: string;
  sourceKind: "function" | "heuristic";
  editable: boolean;
  order: number;
};

function createAst(code: string) {
  return parse(code, {
    sourceType: "script",
    plugins: ["jsx", "typescript"]
  });
}

function toLabel(name: string) {
  return name
    .replace(/^render/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim();
}

function toId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isFunctionLikeVariableDeclaration(statement: Statement): statement is VariableDeclaration {
  if (statement.type !== "VariableDeclaration" || statement.declarations.length !== 1) {
    return false;
  }

  const declaration = statement.declarations[0];
  return (
    declaration.id.type === "Identifier" &&
    !!declaration.init &&
    (declaration.init.type === "ArrowFunctionExpression" || declaration.init.type === "FunctionExpression")
  );
}

function getDeclarationName(statement: Statement) {
  if (statement.type === "FunctionDeclaration") {
    return statement.id?.name;
  }

  if (isFunctionLikeVariableDeclaration(statement)) {
    const declaration = statement.declarations[0];
    return declaration.id.type === "Identifier" ? declaration.id.name : undefined;
  }

  return undefined;
}

function findAppStart(program: Program) {
  let appStart = Number.POSITIVE_INFINITY;

  for (const statement of program.body) {
    if (statement.type === "FunctionDeclaration" && statement.id?.name === "App" && typeof statement.start === "number") {
      appStart = Math.min(appStart, statement.start);
      continue;
    }

    const name = getDeclarationName(statement);
    if (name === "App" && typeof statement.start === "number") {
      appStart = Math.min(appStart, statement.start);
    }
  }

  return appStart;
}

function declarationKind(name: string) {
  if (/^render[A-Z]/.test(name)) {
    return "section";
  }

  if (/^[A-Z]/.test(name)) {
    return "component";
  }

  return undefined;
}

function getStatementSource(code: string, statement: Statement) {
  if (typeof statement.start !== "number" || typeof statement.end !== "number") {
    return "";
  }

  return code.slice(statement.start, statement.end).trim();
}

function findFirstHeading(node: Node | null | undefined): string | undefined {
  if (!node || typeof node !== "object") {
    return undefined;
  }

  if (node.type === "JSXElement" && node.openingElement.name.type === "JSXIdentifier") {
    const tagName = node.openingElement.name.name;
    if (/^h[1-6]$/i.test(tagName)) {
      const text = node.children
        .map((child) => {
          if (child.type === "JSXText") {
            return child.value;
          }

          if (child.type === "JSXExpressionContainer" && child.expression.type === "StringLiteral") {
            return child.expression.value;
          }

          return "";
        })
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (text) {
        return text;
      }
    }
  }

  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        const heading = findFirstHeading(item as Node);
        if (heading) {
          return heading;
        }
      }
      continue;
    }

    if (value && typeof value === "object" && "type" in value) {
      const heading = findFirstHeading(value as Node);
      if (heading) {
        return heading;
      }
    }
  }

  return undefined;
}

function extractTopLevelCandidates(code: string, ast: File) {
  const appStart = findAppStart(ast.program);
  const candidates: CandidateDeclaration[] = [];

  for (const statement of ast.program.body) {
    if (typeof statement.start !== "number" || typeof statement.end !== "number" || statement.start >= appStart) {
      continue;
    }

    const name = getDeclarationName(statement);
    if (!name || name === "App") {
      continue;
    }

    const kind = declarationKind(name);
    if (!kind) {
      continue;
    }

    const source = getStatementSource(code, statement);
    if (!source) {
      continue;
    }

    candidates.push({
      name,
      start: statement.start,
      end: statement.end,
      kind,
      source
    });
  }

  return candidates;
}

function injectSplitScriptTags(indexHtml: string, mainScriptName: string, candidates: CandidateDeclaration[]) {
  const $ = load(indexHtml);
  const mainScript = $(`script[src="./${mainScriptName}"]`).first();
  if (mainScript.length === 0) {
    return indexHtml;
  }

  for (const candidate of candidates) {
    const subdir = candidate.kind === "component" ? "components" : "sections";
    const srcValue = `./${subdir}/${candidate.name}.jsx`;
    if ($(`script[src="${srcValue}"]`).length > 0) {
      continue;
    }

    const attrs = Object.entries(mainScript[0].attribs ?? {})
      .filter(([name]) => name !== "src")
      .map(([name, value]) => (value ? `${name}="${value}"` : name))
      .join(" ");
    const markup = attrs ? `<script ${attrs} src="${srcValue}"></script>` : `<script src="${srcValue}"></script>`;
    mainScript.before(`    ${markup}\n`);
  }

  const doctype = indexHtml.match(/<!doctype[^>]*>/i)?.[0] ?? "<!DOCTYPE html>";
  const serialized = $.html().replace(/^\s*<!doctype[^>]*>\s*/i, "");
  return `${doctype}\n${serialized}`;
}

async function maybeSplitWorkspaceDeclarations(projectSlug: string, manifest: ProjectManifest) {
  const paths = getProjectPaths(projectSlug);
  const workspaceScriptPath =
    (await fileExists(path.join(paths.workspaceDir, "main.jsx")))
      ? path.join(paths.workspaceDir, "main.jsx")
      : path.join(paths.workspaceDir, "main.js");

  if (!(await fileExists(workspaceScriptPath))) {
    return [];
  }

  const scriptFileName = path.basename(workspaceScriptPath);
  const code = await readFile(workspaceScriptPath, "utf8");
  const ast = createAst(code);
  const candidates = extractTopLevelCandidates(code, ast);

  if (candidates.length === 0) {
    return [];
  }

  await ensureDir(paths.workspaceComponentsDir);
  await ensureDir(paths.workspaceSectionsDir);

  for (const candidate of candidates) {
    const targetDir = candidate.kind === "component" ? paths.workspaceComponentsDir : paths.workspaceSectionsDir;
    const destinationPath = path.join(targetDir, `${candidate.name}.jsx`);
    if (!(await fileExists(destinationPath))) {
      await writeTextFile(destinationPath, `${candidate.source}\n`);
    }
  }

  let trimmedCode = code;
  for (const candidate of [...candidates].sort((left, right) => right.start - left.start)) {
    trimmedCode = `${trimmedCode.slice(0, candidate.start)}${trimmedCode.slice(candidate.end)}`.trimEnd();
  }
  await writeTextFile(workspaceScriptPath, `${trimmedCode}\n`);

  const indexHtml = await readFile(paths.workspaceEntrypoint, "utf8");
  await writeTextFile(paths.workspaceEntrypoint, injectSplitScriptTags(indexHtml, scriptFileName, candidates));

  return candidates;
}

function collectAstSections(code: string, filePath: string) {
  const ast = createAst(code);
  const sections: AstSection[] = [];
  let order = 1000;

  traverse(ast, {
    FunctionDeclaration(functionPath: NodePath<FunctionDeclaration>) {
      const name = functionPath.node.id?.name;
      if (!name || !/^render[A-Z]/.test(name)) {
        return;
      }

      sections.push({
        id: toId(name),
        label: toLabel(name) || name,
        headingText: findFirstHeading(functionPath.node),
        file: filePath,
        sourceKind: "function",
        editable: true,
        order
      });
      order += 1;
    },
    VariableDeclarator(variablePath: NodePath<VariableDeclarator>) {
      if (variablePath.node.id.type !== "Identifier") {
        return;
      }

      const name = variablePath.node.id.name;
      if (!/^render[A-Z]/.test(name)) {
        return;
      }

      const initNode = variablePath.node.init;
      if (!initNode || (initNode.type !== "ArrowFunctionExpression" && initNode.type !== "FunctionExpression")) {
        return;
      }

      sections.push({
        id: toId(name),
        label: toLabel(name) || name,
        headingText: findFirstHeading(initNode),
        file: filePath,
        sourceKind: "function",
        editable: true,
        order
      });
      order += 1;
    }
  });

  return sections;
}

async function collectSplitFileSections(workspaceDir: string, subdir: "components" | "sections") {
  const targetDir = path.join(workspaceDir, subdir);
  if (!(await fileExists(targetDir))) {
    return [] as AstSection[];
  }

  const entries = await readdir(targetDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry, index) => {
      const name = path.basename(entry.name, path.extname(entry.name));
      return {
        id: toId(name),
        label: toLabel(name) || name,
        file: path.join(targetDir, entry.name),
        sourceKind: subdir === "sections" ? "function" : "heuristic",
        editable: true,
        order: index
      } satisfies AstSection;
    });
}

function uniqueSections(sections: AstSection[]): SectionManifest[] {
  const seen = new Set<string>();

  return sections
    .sort((left, right) => left.order - right.order)
    .filter((section) => {
      if (seen.has(section.id)) {
        return false;
      }

      seen.add(section.id);
      return true;
    })
    .map((section) => ({
      id: section.id,
      label: section.label,
      file: section.file,
      headingText: section.headingText,
      sourceKind: section.sourceKind,
      editable: section.editable
    }));
}

function extractStyleGuide(htmlSource: string, scriptSource: string, cssSource: string) {
  const combinedSource = `${htmlSource}\n${cssSource}\n${scriptSource}`;
  const dependencies = [...combinedSource.matchAll(/https?:\/\/[^\s"'<>]+/g)].map((match) => match[0]);
  const tailwindTokens = [...combinedSource.matchAll(/\b(?:bg|text|border|ring|shadow|from|to|via)-([a-z]+-\d{2,3})\b/g)].map(
    (match) => match[1]
  );
  const hexColors = [...combinedSource.matchAll(/#(?:[0-9a-fA-F]{3,8})\b/g)].map((match) => match[0]);
  const radiusTokens = [...combinedSource.matchAll(/\brounded(?:-[\w[\]/.]+)?\b/g)].map((match) => match[0]);
  const motionTokens = [...combinedSource.matchAll(/\b(?:transition(?:-[\w[\]/.]+)?|hover:[\w[\]/.:-]+|active:[\w[\]/.:-]+)\b/g)].map(
    (match) => match[0]
  );
  const features = [
    combinedSource.includes("localStorage") ? "Uses localStorage for persistence." : "",
    combinedSource.includes("iframe") ? "Embeds iframe-based media or content." : "",
    combinedSource.includes("FileReader") ? "Reads local uploads with FileReader." : "",
    combinedSource.includes("canvas-confetti") ? "Uses canvas-confetti for celebratory interactions." : "",
    combinedSource.includes("window.confirm") ? "Uses confirm dialogs for destructive actions." : "",
    combinedSource.includes("print:") ? "Includes print-specific Tailwind utility styling." : ""
  ].filter(Boolean);

  const unique = (values: string[]) => [...new Set(values)];

  return `# Style Guide

## Runtime Shape
- Imported workspace stays close to the original HTML runtime rather than forcing an immediate framework rewrite.
${dependencies.length > 0 ? `- External dependencies preserved: ${unique(dependencies).slice(0, 8).join(", ")}` : "- No external runtime dependencies detected in the generated workspace."}

## Visual Signals
${tailwindTokens.length > 0 ? `- Tailwind-style color tokens: ${unique(tailwindTokens).slice(0, 10).join(", ")}` : "- No Tailwind color tokens detected."}
${hexColors.length > 0 ? `- Hex colors: ${unique(hexColors).slice(0, 10).join(", ")}` : "- No inline hex colors detected."}
${radiusTokens.length > 0 ? `- Repeated shape tokens: ${unique(radiusTokens).slice(0, 10).join(", ")}` : "- No repeated rounded-corner tokens detected."}
${motionTokens.length > 0 ? `- Motion and interaction tokens: ${unique(motionTokens).slice(0, 10).join(", ")}` : "- No significant motion tokens detected."}

## Interaction Notes
${features.length > 0 ? features.map((feature) => `- ${feature}`).join("\n") : "- No notable interaction heuristics detected."}

## Editing Guidance
- Prefer edits in workspace/ files only; raw/ is the preserved baseline.
- Preserve existing dependency URLs unless you intentionally replace the runtime.
- When rewriting content, keep heading hierarchy and repeated utility-class patterns consistent with the original style.
`;
}

function buildContentOutline(manifest: ProjectManifest, sections: SectionManifest[]) {
  const lines = [
    "# Content Outline",
    "",
    `- Project: ${manifest.slug}`,
    `- Source: ${manifest.sourcePath}`,
    "",
    "## Sections"
  ];

  if (sections.length === 0) {
    lines.push("- No structured sections were detected. Edit workspace/main directly.");
  } else {
    for (const section of sections) {
      const headingPart = section.headingText ? ` - heading: ${section.headingText}` : "";
      lines.push(`- ${section.label}${headingPart} (${section.file})`);
    }
  }

  return `${lines.join("\n")}\n`;
}

export async function analyzeProject(projectSlug: string) {
  const manifest = await loadProjectManifest(projectSlug);
  const paths = getProjectPaths(projectSlug);
  const splitCandidates = await maybeSplitWorkspaceDeclarations(projectSlug, manifest);

  const workspaceScriptPath =
    (await fileExists(path.join(paths.workspaceDir, "main.jsx")))
      ? path.join(paths.workspaceDir, "main.jsx")
      : path.join(paths.workspaceDir, "main.js");
  const workspaceScriptSource = (await fileExists(workspaceScriptPath))
    ? await readFile(workspaceScriptPath, "utf8")
    : "";
  const workspaceHtmlSource = await readFile(paths.workspaceEntrypoint, "utf8");
  const workspaceCssPath = path.join(paths.workspaceDir, "styles.css");
  const workspaceCssSource = (await fileExists(workspaceCssPath)) ? await readFile(workspaceCssPath, "utf8") : "";

  const astSections = workspaceScriptSource ? collectAstSections(workspaceScriptSource, workspaceScriptPath) : [];
  const splitSections = [
    ...(await collectSplitFileSections(paths.workspaceDir, "components")),
    ...(await collectSplitFileSections(paths.workspaceDir, "sections"))
  ];
  const sectionMap: SectionMap = {
    projectId: manifest.id,
    generatedAt: new Date().toISOString(),
    sections: uniqueSections([...splitSections, ...astSections])
  };

  const styleGuide = extractStyleGuide(workspaceHtmlSource, workspaceScriptSource, workspaceCssSource);
  const contentOutline = buildContentOutline(manifest, sectionMap.sections);

  await writeJsonFile(paths.sectionMapPath, sectionMap);
  await writeTextFile(paths.styleGuidePath, styleGuide);
  await writeTextFile(paths.contentOutlinePath, contentOutline);

  if (!(await fileExists(paths.referenceIndexPath))) {
    const emptyReferenceIndex: ReferenceIndex = {
      projectId: manifest.id,
      generatedAt: new Date().toISOString(),
      references: []
    };
    await writeJsonFile(paths.referenceIndexPath, emptyReferenceIndex);
  }

  await updateProjectManifest(projectSlug, (currentManifest) => ({
    ...currentManifest,
    updatedAt: new Date().toISOString()
  }));

  return {
    projectSlug,
    splitCount: splitCandidates.length,
    sectionCount: sectionMap.sections.length
  };
}
