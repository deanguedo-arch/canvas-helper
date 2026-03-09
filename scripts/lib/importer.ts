import { randomUUID } from "node:crypto";
import { copyFile, readFile, stat } from "node:fs/promises";
import path from "node:path";

import { load } from "cheerio";
import mammoth from "mammoth";

import { analyzeProject } from "./analyzer.js";
import {
  copyFileEnsuringDir,
  ensureDir,
  fileExists,
  listFilesRecursive,
  removePath,
  writeJsonFile,
  writeTextFile
} from "./fs.js";
import { refreshProjectIntelligence } from "./intelligence.js";
import { getProjectPaths } from "./paths.js";
import { extractPdfTextWithFallback } from "./pdf-text.js";
import { extractProjectReferences } from "./references.js";
import type { ImportLog, InputKind, IntelligencePolicyOverride, LearningSource, ProjectManifest } from "./types.js";

type ImportProjectOptions = {
  inputPath: string;
  slug?: string;
  force?: boolean;
  source?: LearningSource;
  policyOverride?: IntelligencePolicyOverride;
};

type AssetReference = {
  originalValue: string;
  cleanValue: string;
};

type WorkspaceBuildResult = {
  scriptFile?: string;
  styleFile?: string;
  actions: string[];
  warnings: string[];
};

type ImportSourceMode = "html-document" | "react-module";

type ResolvedImportInput = {
  bundlePath: string;
  siteFilePath?: string;
  inputKind: InputKind;
  sourceMode: ImportSourceMode;
  sourceDir: string;
  htmlSource: string;
  reactModuleSource?: string;
  preservedTextSource?: string;
  referenceFiles: string[];
  discoveryActions: string[];
  discoveryWarnings: string[];
};

const BROWSER_REACT_IMPORTS = {
  react: "https://unpkg.com/react@19.1.1?module",
  reactDomClient: "https://unpkg.com/react-dom@19.1.1/client?module",
  lucideReact: "https://unpkg.com/lucide-react@0.542.0?module"
} as const;

type ExtractedDocumentSource = {
  text: string;
  extractionAction?: string;
};

export function resolveLearningSourceOverride(value: string | undefined): LearningSource | undefined {
  if (!value) {
    return undefined;
  }

  if (value === "gemini" || value === "other") {
    return value;
  }

  throw new Error(`Invalid --source value "${value}". Expected "gemini" or "other".`);
}

export function inferLearningSourceFromInputPath(_absoluteInputPath: string): LearningSource {
  return "other";
}

function toLearningTrust(source: LearningSource) {
  return source === "gemini" ? "curated" : "auto";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function inferInputKind(filePath: string): InputKind {
  return path.extname(filePath).toLowerCase() === ".txt" ? "text-html" : "html";
}

function isSiteCandidate(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  return extension === ".html" || extension === ".txt";
}

function isDocumentBundleSource(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  return extension === ".docx" || extension === ".pdf";
}

function isBlankSource(value: string) {
  return value.trim().length === 0;
}

function looksLikeReactModuleSource(value: string) {
  const source = value.replace(/^\uFEFF/, "").trim();
  if (!source || /<!doctype html|<html[\s>]/i.test(source)) {
    return false;
  }

  return (
    /from\s+["']react["']/.test(source) &&
    /export\s+default\b/.test(source) &&
    /className=|useState\s*\(|<[A-Z][A-Za-z0-9]*/.test(source)
  );
}

function buildReactModulePreviewHtml(title: string) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script>
      // Surface runtime errors in-page so preview never fails silently.
      (function installPreviewErrorOverlay() {
        function showError(kind, value) {
          const text = value instanceof Error ? (value.stack || value.message) : String(value);
          const existing = document.getElementById("__canvas-helper-preview-error");
          if (existing) {
            existing.textContent = text;
            return;
          }

          const panel = document.createElement("pre");
          panel.id = "__canvas-helper-preview-error";
          panel.style.position = "fixed";
          panel.style.inset = "1rem";
          panel.style.zIndex = "99999";
          panel.style.overflow = "auto";
          panel.style.margin = "0";
          panel.style.padding = "1rem";
          panel.style.border = "2px solid #ef4444";
          panel.style.borderRadius = "12px";
          panel.style.background = "rgba(17, 24, 39, 0.98)";
          panel.style.color = "#fecaca";
          panel.style.font = "12px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
          panel.textContent = kind + "\\n\\n" + text;
          document.body.appendChild(panel);
        }

        window.addEventListener("error", function onError(event) {
          showError("Preview runtime error", event.error || event.message);
        });
        window.addEventListener("unhandledrejection", function onRejection(event) {
          showError("Preview promise rejection", event.reason);
        });
      })();
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script
      type="text/babel"
      data-type="module"
      data-presets="react"
      src="./main.jsx"
    ></script>
  </body>
</html>`;
}

function resolveReactModuleExportName(source: string) {
  const defaultIdentifierMatch = source.match(/export\s+default\s+([A-Za-z_$][\w$]*)\s*;?/);
  if (defaultIdentifierMatch) {
    return defaultIdentifierMatch[1];
  }

  const defaultFunctionMatch = source.match(/export\s+default\s+function\s+([A-Za-z_$][\w$]*)\s*\(/);
  if (defaultFunctionMatch) {
    return defaultFunctionMatch[1];
  }

  const appDeclarationMatch = source.match(/(?:const|function)\s+([A-Za-z_$][\w$]*)\s*=?\s*(?:\(|\(\)\s*=>)/);
  return appDeclarationMatch?.[1] ?? "App";
}

function rewriteReactModuleImportsForBrowser(source: string) {
  return source
    .replace(/from\s+["']react-dom\/client["']/g, `from "${BROWSER_REACT_IMPORTS.reactDomClient}"`)
    .replace(/from\s+["']react["']/g, `from "${BROWSER_REACT_IMPORTS.react}"`)
    .replace(/from\s+["']lucide-react["']/g, `from "${BROWSER_REACT_IMPORTS.lucideReact}"`);
}

function buildMountedReactModuleSource(source: string) {
  const trimmed = source.replace(/^\uFEFF/, "").trim();
  const rewritten = rewriteReactModuleImportsForBrowser(trimmed);

  if (/createRoot\s*\(|ReactDOM\.render\s*\(|root\.render\s*\(/.test(rewritten)) {
    return `${rewritten}\n`;
  }

  const exportName = resolveReactModuleExportName(rewritten);
  return `import __CanvasHelperReactDomClient from "${BROWSER_REACT_IMPORTS.reactDomClient}";
${rewritten}

const __canvasHelperRootElement = document.getElementById("root");
if (__canvasHelperRootElement) {
  __CanvasHelperReactDomClient.createRoot(__canvasHelperRootElement).render(<${exportName} />);
}
`;
}

async function extractDocumentBundleText(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return {
      text: result.value
    } satisfies ExtractedDocumentSource;
  }

  if (extension === ".pdf") {
    const extracted = await extractPdfTextWithFallback(filePath);
    if (extracted.issue) {
      throw new Error(extracted.issue);
    }

    return {
      text: extracted.text ?? "",
      extractionAction:
        extracted.method === "ocr"
          ? `Used OCR to recover text from "${path.basename(filePath)}" because the PDF text layer was unreadable.`
          : undefined
    } satisfies ExtractedDocumentSource;
  }

  return {
    text: ""
  } satisfies ExtractedDocumentSource;
}

function cleanDocumentBundleText(text: string) {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !/^[a-z]{80,}$/i.test(line.replace(/\s+/g, "")))
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function collectDocumentBundleAnchors(text: string) {
  const lower = text.toLowerCase();
  const headings = [
    "Oh! The Places You'll Go",
    "Attitude and Learning",
    "Life after High School",
    "SMART Goal",
    "Decision Making",
    "Transferable Skills",
    "Jobs, Occupations and Careers",
    "Job Search Tips"
  ];

  return headings.filter((heading) => lower.includes(heading.toLowerCase()));
}

function buildDocumentBundleStarterHtml(title: string, text: string, sourceFiles: string[]) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 40)
    .slice(0, 4);
  const anchors = collectDocumentBundleAnchors(text);
  const encodedTitle = JSON.stringify(title);
  const encodedParagraphs = JSON.stringify(paragraphs);
  const encodedAnchors = JSON.stringify(anchors);
  const encodedSourceFiles = JSON.stringify(sourceFiles);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
      body { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
    </style>
  </head>
  <body class="min-h-screen bg-slate-950 text-slate-50">
    <div id="root"></div>
    <script type="text/babel">
      const moduleTitle = ${encodedTitle};
      const sourceParagraphs = ${encodedParagraphs};
      const sourceAnchors = ${encodedAnchors};
      const sourceFiles = ${encodedSourceFiles};

      const App = () => (
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.3),_transparent_30rem),linear-gradient(180deg,_#0f172a_0%,_#111827_45%,_#020617_100%)] text-slate-50">
          <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
            <section className="rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.45)] backdrop-blur">
              <div className="inline-flex items-center rounded-full bg-indigo-500/20 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-indigo-100">Doc-first import scaffold</div>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl">{moduleTitle}</h1>
              <p className="mt-4 max-w-3xl text-lg font-medium leading-8 text-slate-200">
                This starter workspace was generated from workbook documents because no HTML site entrypoint existed in the incoming bundle.
              </p>
            </section>

            <section className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-7 shadow-2xl">
                <h2 className="text-2xl font-black tracking-tight text-white">Source Snapshot</h2>
                <div className="mt-5 space-y-4">
                  {sourceParagraphs.length > 0 ? sourceParagraphs.map((paragraph, index) => (
                    <p key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-medium leading-7 text-slate-200">
                      {paragraph}
                    </p>
                  )) : (
                    <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-medium leading-7 text-slate-300">
                      No clean source preview was extracted. Use the reference documents directly while building the workspace.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-7 shadow-2xl">
                  <h2 className="text-xl font-black tracking-tight text-white">Detected Topics</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {sourceAnchors.length > 0 ? sourceAnchors.map((anchor) => (
                      <span key={anchor} className="rounded-full bg-indigo-500/20 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-indigo-100">
                        {anchor}
                      </span>
                    )) : (
                      <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-200">
                        Workbook content detected
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-7 shadow-2xl">
                  <h2 className="text-xl font-black tracking-tight text-white">Imported Sources</h2>
                  <ul className="mt-4 space-y-3 text-sm font-semibold text-slate-200">
                    {sourceFiles.map((filePath) => (
                      <li key={filePath} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">{filePath}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </main>
      );

      const root = ReactDOM.createRoot(document.getElementById("root"));
      root.render(<App />);
    </script>
  </body>
</html>`;
}

function isGeneratedArtifactPath(inputDir: string, filePath: string) {
  const relativePath = path.relative(inputDir, filePath).replace(/\\/g, "/");
  const parts = relativePath.split("/");

  if (["raw", "workspace", "meta", "exports"].includes(parts[0])) {
    return true;
  }

  if (parts[0] === "references" && (parts[1] === "raw" || parts[1] === "extracted")) {
    return true;
  }

  return false;
}

function scoreSiteCandidate(inputDir: string, filePath: string) {
  const relativePath = path.relative(inputDir, filePath).replace(/\\/g, "/");
  const fileName = path.basename(filePath).toLowerCase();
  const extension = path.extname(fileName).toLowerCase();
  const depth = relativePath.split("/").length - 1;

  let score = 0;

  if (depth === 0) {
    score += 1000;
  }

  if (extension === ".html") {
    score += 150;
  }

  if (fileName === "index.html") {
    score += 220;
  }

  if (/(canvas|module|source|original|export)/.test(fileName)) {
    score += 80;
  }

  score -= depth * 25;
  score -= relativePath.length / 10;

  return score;
}

function extractHtmlFromText(text: string) {
  const doctypeIndex = text.search(/<!doctype html/i);
  if (doctypeIndex >= 0) {
    return text.slice(doctypeIndex).trim();
  }

  const htmlIndex = text.search(/<html[\s>]/i);
  if (htmlIndex >= 0) {
    const closingIndex = text.search(/<\/html>/i);
    if (closingIndex >= 0) {
      return text.slice(htmlIndex, closingIndex + "</html>".length).trim();
    }

    return text.slice(htmlIndex).trim();
  }

  throw new Error("Could not find an HTML document inside the provided text file.");
}

function isExternalReference(value: string) {
  return /^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("#");
}

function collectAssetReferences(htmlSource: string) {
  const $ = load(htmlSource.replace(/^\uFEFF/, ""));
  const references = new Map<string, AssetReference>();
  const selectors: Array<[string, string]> = [
    ["img[src]", "src"],
    ["script[src]", "src"],
    ["link[href]", "href"],
    ["source[src]", "src"],
    ["video[src]", "src"],
    ["audio[src]", "src"]
  ];

  for (const [selector, attribute] of selectors) {
    $(selector).each((_, element) => {
      const value = $(element).attr(attribute)?.trim();
      if (!value || isExternalReference(value)) {
        return;
      }

      const cleanValue = value.split("#")[0]?.split("?")[0] ?? value;
      if (!cleanValue) {
        return;
      }

      references.set(value, { originalValue: value, cleanValue });
    });
  }

  return [...references.values()];
}

function resolveReferencedAssetPaths(assetReferences: AssetReference[], sourceDir: string) {
  return new Set(
    assetReferences
      .map((reference) => reference.cleanValue.replace(/\\/g, "/"))
      .filter((relativePath) => !relativePath.startsWith("../"))
      .map((relativePath) => path.resolve(sourceDir, relativePath))
  );
}

async function copyReferencedAssets(
  sourceDir: string,
  destinationRoot: string,
  references: AssetReference[],
  warnings: string[]
) {
  for (const reference of references) {
    const normalized = reference.cleanValue.replace(/\\/g, "/");
    if (normalized.startsWith("../")) {
      warnings.push(`Skipped parent-directory asset reference "${reference.originalValue}".`);
      continue;
    }

    const sourcePath = path.resolve(sourceDir, normalized);
    if (!(await fileExists(sourcePath))) {
      warnings.push(`Referenced asset not found: ${reference.originalValue}`);
      continue;
    }

    const destinationPath = path.join(destinationRoot, normalized);
    await copyFileEnsuringDir(sourcePath, destinationPath);
  }
}

async function copyReferenceFiles(referenceFiles: string[], bundlePath: string, destinationRoot: string) {
  for (const filePath of referenceFiles) {
    const relativePath = path.relative(bundlePath, filePath);
    const destinationPath = path.join(destinationRoot, relativePath);
    await copyFileEnsuringDir(filePath, destinationPath);
  }
}

function inferScriptExtension(inlineScripts: Array<{ content: string; attributes: Record<string, string> }>) {
  if (
    inlineScripts.some((script) => script.attributes.type?.includes("babel")) ||
    inlineScripts.some(
      (script) =>
        /ReactDOM\.createRoot|root\.render\(<|return\s*\(/.test(script.content) &&
        /<[A-Z][A-Za-z0-9]*/.test(script.content)
    )
  ) {
    return ".jsx";
  }

  return ".js";
}

function serializeHtmlDocument(htmlSource: string, $: ReturnType<typeof load>) {
  const doctype = htmlSource.match(/<!doctype[^>]*>/i)?.[0] ?? "<!DOCTYPE html>";
  const serialized = $.html().replace(/^\s*<!doctype[^>]*>\s*/i, "");
  return `${doctype}\n${serialized}`;
}

async function buildWorkspaceFromHtml(
  htmlSource: string,
  workspaceDir: string,
  sourceDir: string
): Promise<WorkspaceBuildResult> {
  const sanitizedHtml = htmlSource.replace(/^\uFEFF/, "");
  const $ = load(sanitizedHtml);
  const actions: string[] = [];
  const warnings: string[] = [];

  const assetReferences = collectAssetReferences(htmlSource);
  await copyReferencedAssets(sourceDir, workspaceDir, assetReferences, warnings);

  const inlineStyles = $("style")
    .toArray()
    .map((node) => {
      const content = $(node).html() ?? "";
      const media = $(node).attr("media");
      $(node).remove();
      return media && media !== "all" ? `@media ${media} {\n${content}\n}` : content;
    })
    .filter((content) => content.trim().length > 0);

  let styleFile: string | undefined;
  if (inlineStyles.length > 0) {
    styleFile = "styles.css";
    await writeTextFile(path.join(workspaceDir, styleFile), `${inlineStyles.join("\n\n")}\n`);
    $("head").append(`\n    <link rel="stylesheet" href="./${styleFile}">\n`);
    actions.push(`Externalized ${inlineStyles.length} inline style block(s) to workspace/${styleFile}.`);
  }

  const inlineScripts = $("script:not([src])")
    .toArray()
    .map((node) => {
      const element = $(node);
      const content = element.html() ?? "";
      const attributes = Object.fromEntries(
        Object.entries(node.attribs ?? {}).map(([key, value]) => [key, value ?? ""])
      );
      element.remove();
      return { content, attributes };
    })
    .filter((script) => script.content.trim().length > 0);

  let scriptFile: string | undefined;
  if (inlineScripts.length > 0) {
    const extension = inferScriptExtension(inlineScripts);
    scriptFile = extension === ".jsx" ? "main.jsx" : "main.js";
    const mergedScript = inlineScripts
      .map((script, index) => `/* inline script ${index + 1} */\n${script.content.trim()}`)
      .join("\n\n");
    await writeTextFile(path.join(workspaceDir, scriptFile), `${mergedScript}\n`);

    const baseAttributes = { ...inlineScripts[0].attributes };
    if (extension === ".jsx" && !baseAttributes.type) {
      baseAttributes.type = "text/babel";
    }

    const attributeMarkup = Object.entries(baseAttributes)
      .filter(([name]) => name !== "src")
      .map(([name, value]) => (value ? `${name}="${value}"` : name))
      .join(" ");
    const scriptTag = attributeMarkup
      ? `<script ${attributeMarkup} src="./${scriptFile}"></script>`
      : `<script src="./${scriptFile}"></script>`;
    const body = $("body");
    if (body.length > 0) {
      body.append(`\n    ${scriptTag}\n`);
    } else {
      $.root().append(`\n    ${scriptTag}\n`);
    }

    const signatureSet = new Set(inlineScripts.map((script) => JSON.stringify(script.attributes)));
    if (signatureSet.size > 1) {
      warnings.push(
        "Merged inline scripts with different attributes into one external script. Review workspace/main for compatibility."
      );
    }

    actions.push(`Externalized ${inlineScripts.length} inline script block(s) to workspace/${scriptFile}.`);
  }

  await ensureDir(path.join(workspaceDir, "assets"));
  await ensureDir(path.join(workspaceDir, "components"));
  await ensureDir(path.join(workspaceDir, "sections"));
  await writeTextFile(path.join(workspaceDir, "index.html"), serializeHtmlDocument(sanitizedHtml, $));

  if (assetReferences.length > 0) {
    actions.push(`Copied ${assetReferences.length} local asset reference(s) into the workspace.`);
  }

  return {
    scriptFile,
    styleFile,
    actions,
    warnings
  };
}

async function buildWorkspaceFromReactModule(
  moduleSource: string,
  workspaceDir: string,
  title: string
): Promise<WorkspaceBuildResult> {
  await ensureDir(path.join(workspaceDir, "assets"));
  await ensureDir(path.join(workspaceDir, "components"));
  await ensureDir(path.join(workspaceDir, "sections"));

  await writeTextFile(path.join(workspaceDir, "index.html"), `${buildReactModulePreviewHtml(title)}\n`);
  await writeTextFile(path.join(workspaceDir, "main.jsx"), buildMountedReactModuleSource(moduleSource));

  return {
    scriptFile: "main.jsx",
    actions: [
      "Generated workspace/index.html to preview the imported React module source.",
      "Preserved the imported React module as workspace/main.jsx with a preview bootstrap."
    ],
    warnings: []
  };
}

function createImportLogMarkdown(log: ImportLog) {
  const actionLines = log.actions.length > 0 ? log.actions.map((item) => `- ${item}`).join("\n") : "- None.";
  const warningLines = log.warnings.length > 0 ? log.warnings.map((item) => `- ${item}`).join("\n") : "- None.";

  return `# Import Log

- Generated: ${log.generatedAt}
- Source: ${log.sourcePath}

## Actions
${actionLines}

## Warnings
${warningLines}
`;
}

async function resolveImportInput(absoluteInputPath: string): Promise<ResolvedImportInput> {
  const inputStats = await stat(absoluteInputPath);

  if (inputStats.isFile()) {
    const inputKind = inferInputKind(absoluteInputPath);
    if (inputKind === "html") {
      const htmlSource = await readFile(absoluteInputPath, "utf8");
      if (isBlankSource(htmlSource)) {
        throw new Error(
          `Input HTML file is empty: ${absoluteInputPath}. Re-export the project from Canvas and import the non-empty HTML/text source.`
        );
      }

      if (looksLikeReactModuleSource(htmlSource)) {
        return {
          bundlePath: path.dirname(absoluteInputPath),
          siteFilePath: absoluteInputPath,
          inputKind,
          sourceMode: "react-module",
          sourceDir: path.dirname(absoluteInputPath),
          htmlSource: buildReactModulePreviewHtml(path.basename(absoluteInputPath)),
          reactModuleSource: htmlSource,
          preservedTextSource: htmlSource,
          referenceFiles: [],
          discoveryActions: [
            "Detected a React module source file and generated a browser preview shell for it."
          ],
          discoveryWarnings: []
        };
      }

      return {
        bundlePath: path.dirname(absoluteInputPath),
        siteFilePath: absoluteInputPath,
        inputKind,
        sourceMode: "html-document",
        sourceDir: path.dirname(absoluteInputPath),
        htmlSource,
        referenceFiles: [],
        discoveryActions: [],
        discoveryWarnings: []
      };
    }

    const preservedTextSource = await readFile(absoluteInputPath, "utf8");
    return {
      bundlePath: path.dirname(absoluteInputPath),
      siteFilePath: absoluteInputPath,
      inputKind,
      sourceMode: "html-document",
      sourceDir: path.dirname(absoluteInputPath),
      htmlSource: extractHtmlFromText(preservedTextSource),
      preservedTextSource,
      referenceFiles: [],
      discoveryActions: [],
      discoveryWarnings: []
    };
  }

  if (!inputStats.isDirectory()) {
    throw new Error(`Unsupported import input: ${absoluteInputPath}`);
  }

  const bundleFiles = (await listFilesRecursive(absoluteInputPath)).filter(
    (filePath) => !isGeneratedArtifactPath(absoluteInputPath, filePath)
  );
  const siteCandidates = await Promise.all(
    bundleFiles.filter((filePath) => isSiteCandidate(filePath)).map(async (filePath) => {
      return {
        filePath,
        size: (await stat(filePath)).size
      };
    })
  );
  const nonEmptySiteCandidates = siteCandidates.filter((entry) => entry.size > 0).map((entry) => entry.filePath);
  const emptySiteCandidates = siteCandidates
    .filter((entry) => entry.size === 0)
    .map((entry) => path.relative(absoluteInputPath, entry.filePath).replace(/\\/g, "/"));

  const sortedSiteCandidates = nonEmptySiteCandidates.sort((left, right) => {
    const scoreDifference = scoreSiteCandidate(absoluteInputPath, right) - scoreSiteCandidate(absoluteInputPath, left);
    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return path.relative(absoluteInputPath, left).localeCompare(path.relative(absoluteInputPath, right));
  });

  if (sortedSiteCandidates.length === 0) {
    if (emptySiteCandidates.length > 0) {
      throw new Error(
        `No usable HTML entrypoint was found in "${absoluteInputPath}", but the following site file(s) were present and empty: ${emptySiteCandidates.join(", ")}. Re-export the project from Canvas.`
      );
    }

    const documentSources = bundleFiles
      .filter((filePath) => isDocumentBundleSource(filePath))
      .sort((left, right) => {
        const leftExtension = path.extname(left).toLowerCase();
        const rightExtension = path.extname(right).toLowerCase();
        if (leftExtension !== rightExtension) {
          return leftExtension === ".docx" ? -1 : 1;
        }

        return left.localeCompare(right);
      });

    if (documentSources.length === 0) {
      throw new Error(
        `No .html or .txt site file was found in ${absoluteInputPath}. Drop a Canvas export into the folder first.`
      );
    }

    const extractedSources = await Promise.all(
      documentSources.map(async (filePath) => {
        try {
          const extracted = await extractDocumentBundleText(filePath);
          return {
            text: cleanDocumentBundleText(extracted.text),
            extractionAction: extracted.extractionAction
          };
        } catch (error) {
          return {
            text: "",
            extractionWarning: `Could not extract readable text from "${path.basename(filePath)}": ${
              error instanceof Error ? error.message : String(error)
            }`
          };
        }
      })
    );
    const primaryText = extractedSources.find((entry) => entry.text.length > 0)?.text ?? "";
    const sourceFiles = documentSources.map((filePath) => path.relative(absoluteInputPath, filePath).replace(/\\/g, "/"));
    const starterTitle = path.basename(documentSources[0], path.extname(documentSources[0])).replace(/\s+/g, " ").trim();
    const extractionActions = extractedSources
      .flatMap((entry) => (entry.extractionAction ? [entry.extractionAction] : []))
      .filter((value, index, values) => values.indexOf(value) === index);
    const extractionWarnings = extractedSources.flatMap((entry) =>
      "extractionWarning" in entry && entry.extractionWarning ? [entry.extractionWarning] : []
    );

    return {
      bundlePath: absoluteInputPath,
      inputKind: "html",
      sourceMode: "html-document",
      sourceDir: absoluteInputPath,
      htmlSource: buildDocumentBundleStarterHtml(starterTitle, primaryText, sourceFiles),
      referenceFiles: bundleFiles,
      discoveryActions: [
        `No HTML entrypoint was found. Generated a starter workspace from ${documentSources.length} document source file(s).`,
        ...extractionActions
      ],
      discoveryWarnings: [
        ...extractionWarnings,
        "Imported a document bundle instead of a prebuilt site. Review the generated workspace and replace the starter scaffold."
      ]
    };
  }

  const siteFilePath = sortedSiteCandidates[0];
  const inputKind = inferInputKind(siteFilePath);
  const sourceDir = path.dirname(siteFilePath);
  const preservedTextSource = inputKind === "text-html" ? await readFile(siteFilePath, "utf8") : undefined;
  const directSource = inputKind === "html" ? await readFile(siteFilePath, "utf8") : undefined;
  if (inputKind === "html" && directSource && looksLikeReactModuleSource(directSource)) {
    const chosenRelativePath = path.relative(absoluteInputPath, siteFilePath).replace(/\\/g, "/");
    const discoveryWarnings =
      sortedSiteCandidates.length > 1
        ? [
            `Found ${sortedSiteCandidates.length} possible site files. Using "${chosenRelativePath}" and treating the rest as supporting material.`
          ]
        : [];

    return {
      bundlePath: absoluteInputPath,
      siteFilePath,
      inputKind,
      sourceMode: "react-module",
      sourceDir,
      htmlSource: buildReactModulePreviewHtml(path.basename(siteFilePath)),
      reactModuleSource: directSource,
      preservedTextSource: directSource,
      referenceFiles: bundleFiles.filter((filePath) => filePath !== siteFilePath),
      discoveryActions: [`Detected "${chosenRelativePath}" as a React module entrypoint inside the source folder.`],
      discoveryWarnings
    };
  }

  const htmlSource = inputKind === "html" ? directSource ?? "" : extractHtmlFromText(preservedTextSource ?? "");
  const referencedAssetPaths = resolveReferencedAssetPaths(collectAssetReferences(htmlSource), sourceDir);
  const referenceFiles = bundleFiles.filter(
    (filePath) => filePath !== siteFilePath && !referencedAssetPaths.has(path.resolve(filePath))
  );

  const chosenRelativePath = path.relative(absoluteInputPath, siteFilePath).replace(/\\/g, "/");
  const discoveryActions = [`Detected "${chosenRelativePath}" as the site entrypoint inside the source folder.`];
  const discoveryWarnings =
    siteCandidates.length > 1
      ? [
          `Found ${siteCandidates.length} possible site files. Using "${chosenRelativePath}" and treating the rest as supporting material.`
        ]
      : [];

  return {
    bundlePath: absoluteInputPath,
    siteFilePath,
    inputKind,
    sourceMode: "html-document",
    sourceDir,
    htmlSource,
    preservedTextSource,
    referenceFiles,
    discoveryActions,
    discoveryWarnings
  };
}

export async function importProject(options: ImportProjectOptions) {
  const absoluteInputPath = path.resolve(options.inputPath);
  if (!(await fileExists(absoluteInputPath))) {
    throw new Error(`Input file not found: ${absoluteInputPath}`);
  }

  const inputStats = await stat(absoluteInputPath);
  const defaultSlug = inputStats.isDirectory()
    ? slugify(path.basename(absoluteInputPath))
    : slugify(path.basename(absoluteInputPath, path.extname(absoluteInputPath)));
  const slug = options.slug ? slugify(options.slug) : defaultSlug;
  if (!slug) {
    throw new Error("Could not derive a valid project slug from the input path.");
  }

  const paths = getProjectPaths(slug);
  if (inputStats.isDirectory() && path.resolve(absoluteInputPath) === path.resolve(paths.root)) {
    throw new Error(
      `Import folder cannot be the same as the generated project folder. Put source bundles in a staging folder such as projects\\incoming\\${slug}.`
    );
  }

  if ((await fileExists(paths.root)) && !options.force) {
    throw new Error(`Project "${slug}" already exists. Re-run with --force to replace it.`);
  }

  if ((await fileExists(paths.root)) && options.force) {
    await removePath(paths.root);
  }

  const learningSource = options.source ?? inferLearningSourceFromInputPath(absoluteInputPath);
  const learningTrust = toLearningTrust(learningSource);

  await ensureDir(paths.root);
  await ensureDir(paths.rawDir);
  await ensureDir(paths.workspaceDir);
  await ensureDir(paths.resourceDir);
  await ensureDir(paths.referencesRawDir);
  await ensureDir(paths.referencesExtractedDir);
  await ensureDir(paths.metaDir);
  await ensureDir(paths.exportsDir);

  const resolvedInput = await resolveImportInput(absoluteInputPath);
  const inputKind = resolvedInput.inputKind;
  const sourceDir = resolvedInput.sourceDir;
  const actions: string[] = [];
  const warnings: string[] = [...resolvedInput.discoveryWarnings];
  actions.push(...resolvedInput.discoveryActions);

  const htmlSource = resolvedInput.htmlSource;
  if (inputKind === "html") {
    if (resolvedInput.sourceMode === "react-module") {
      if (!resolvedInput.reactModuleSource) {
        throw new Error("React module imports require the original source code.");
      }

      await writeTextFile(paths.rawEntrypoint, `${htmlSource}\n`);
      await writeTextFile(path.join(paths.rawDir, "main.jsx"), buildMountedReactModuleSource(resolvedInput.reactModuleSource));
      await writeTextFile(paths.rawSourceText, resolvedInput.reactModuleSource);
      actions.push("Generated raw/original.html as a preview shell for the imported React module source.");
      actions.push("Preserved the original React module source at raw/original-source.txt.");
      actions.push("Generated raw/main.jsx with a preview bootstrap for the imported React module.");
    } else if (resolvedInput.siteFilePath) {
      await copyFile(resolvedInput.siteFilePath, paths.rawEntrypoint);
      actions.push("Copied the source HTML into raw/original.html without modifying it.");
    } else {
      await writeTextFile(paths.rawEntrypoint, `${htmlSource}\n`);
      actions.push("Generated starter HTML from the document bundle into raw/original.html.");
    }
  } else {
    if (!resolvedInput.siteFilePath) {
      throw new Error("Text-based imports require a source file path.");
    }

    await copyFile(resolvedInput.siteFilePath, paths.rawSourceText);
    await writeTextFile(paths.rawEntrypoint, `${htmlSource}\n`);
    actions.push("Extracted an HTML document from the source text file into raw/original.html.");
    actions.push("Preserved the original text input at raw/original-source.txt.");
  }

  if (resolvedInput.sourceMode !== "react-module") {
    const assetReferences = collectAssetReferences(htmlSource);
    await copyReferencedAssets(sourceDir, paths.rawDir, assetReferences, warnings);
    if (assetReferences.length > 0) {
      actions.push(`Copied ${assetReferences.length} local asset reference(s) into the raw project copy.`);
    }
  }

  const workspaceResult =
    resolvedInput.sourceMode === "react-module"
      ? await buildWorkspaceFromReactModule(
          resolvedInput.reactModuleSource ?? "",
          paths.workspaceDir,
          path.basename(resolvedInput.siteFilePath ?? paths.root)
        )
      : await buildWorkspaceFromHtml(htmlSource, paths.workspaceDir, sourceDir);
  actions.push(...workspaceResult.actions);
  warnings.push(...workspaceResult.warnings);

  if (resolvedInput.referenceFiles.length > 0) {
    await copyReferenceFiles(resolvedInput.referenceFiles, resolvedInput.bundlePath, paths.referencesRawDir);
    actions.push(`Copied ${resolvedInput.referenceFiles.length} supporting file(s) into projects/resources/${slug}/.`);
  }

  const timestamp = new Date().toISOString();
  const manifest: ProjectManifest = {
    id: randomUUID(),
    slug,
    sourcePath: absoluteInputPath,
    inputKind,
    brightspaceTarget: "course-page",
    previewModes: ["raw", "workspace"],
    workspaceEntrypoint: paths.workspaceEntrypoint,
    rawEntrypoint: paths.rawEntrypoint,
    learningSource,
    learningTrust,
    learningUpdatedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const importLog: ImportLog = {
    generatedAt: timestamp,
    sourcePath: absoluteInputPath,
    actions,
    warnings
  };

  await writeJsonFile(paths.manifestPath, manifest);
  await analyzeProject(slug);
  if (resolvedInput.referenceFiles.length > 0) {
    await extractProjectReferences(slug);
    actions.push(`Indexed the imported supporting material into projects/resources/${slug}/_extracted/.`);
  }
  const intelligence = await refreshProjectIntelligence(slug, {
    policyOverride: options.policyOverride
  });
  actions.push(`Learned project patterns (${intelligence.learnedProfilePath}).`);
  actions.push(`Updated local pattern bank (${intelligence.libraryRecordCount} profile(s)).`);
  actions.push(`Generated prompt pack (${intelligence.promptPackPath}).`);
  await writeTextFile(paths.importLogPath, createImportLogMarkdown(importLog));

  return {
    slug,
    manifest,
    scriptFile: workspaceResult.scriptFile,
    styleFile: workspaceResult.styleFile,
    warnings
  };
}

export async function rehydrateWorkspace(slug: string, force = false, policyOverride?: IntelligencePolicyOverride) {
  const paths = getProjectPaths(slug);
  if (!(await fileExists(paths.rawEntrypoint))) {
    throw new Error(`No raw/original.html found for project "${slug}".`);
  }

  if (!force && (await fileExists(paths.workspaceEntrypoint))) {
    throw new Error(
      `Workspace already exists for "${slug}". Re-run with --force to rebuild it from raw/original.html.`
    );
  }

  if (force) {
    await removePath(paths.workspaceDir);
  }

  const rawHtml = await readFile(paths.rawEntrypoint, "utf8");
  await ensureDir(paths.workspaceDir);
  await buildWorkspaceFromHtml(rawHtml, paths.workspaceDir, paths.rawDir);
  await analyzeProject(slug);
  await refreshProjectIntelligence(slug, { policyOverride });
}
