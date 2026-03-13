import { readFile } from "node:fs/promises";

import { load } from "cheerio";

import { fileExists, writeJsonFile, writeTextFile } from "../fs.js";
import { getProjectPaths } from "../paths.js";
import { resolveProjectBenchmarkSelection } from "../benchmarks/project-selection.js";
import { buildCoverageReport } from "./auditCoverage.js";
import { buildCourseSourceMap } from "./buildSourceMap.js";
import { composeInteractiveHss1010Course } from "./hss1010-compose.js";
import type { HssCompositionBenchmark } from "./hss1010-compose.js";
import { extractHss1010Models } from "./normalizeBlocks.js";
import { loadProjectSourceSelection } from "./parseSource.js";
import { getAssessmentTotalMarks, renderAssessmentSections, renderAssessmentTabs } from "./renderAssessment.js";
import { renderStudySections, renderStudyTabs } from "./renderCourse.js";
import { runAuthoringDeviationGate } from "../intelligence/apply/deviation-gate.js";
import type { AuthoringDeviationAcceptance, AuthoringPreferencesOverride } from "../types.js";
import type {
  AssessmentModel,
  CourseBlock,
  CourseModel,
  CoverageReport,
  SourceChunk,
  SourceMapModel
} from "./types.js";

type ExtractHss1010Options = {
  projectSlug: string;
  html: string;
  sourceTitle: string;
  sourcePdfUrl: string | null;
  generatedAt?: string;
};

type BuildSourceArtifactsOptions = {
  projectSlug: string;
  course: CourseModel;
  sourceReferenceId: string | null;
  sourceChunks: SourceChunk[];
  generatedAt?: string;
};

type RenderWorkspaceShellOptions = {
  projectSlug: string;
  course: CourseModel;
  assessment: AssessmentModel;
  benchmarkComposition?: HssCompositionBenchmark | null;
  assumeInteractiveCourse?: boolean;
};

type ConvertHss1010ProjectOptions = {
  projectSlug: string;
  generatedAt?: string;
  legacyHtmlPath?: string;
  authoringAcceptance?: AuthoringDeviationAcceptance;
  repoAuthoringPreferencesPath?: string;
  projectAuthoringPreferencesPath?: string;
  benchmarkSelectionPath?: string;
  authoringCliOverride?: AuthoringPreferencesOverride;
};

type ConvertHss1010ProjectResult = {
  projectSlug: string;
  generatedAt: string;
  legacyHtmlPath: string;
  workspaceEntrypoint: string;
  workspaceRuntimePath: string;
  coursePath: string;
  assessmentPath: string;
  sourceMapPath: string;
  coveragePath: string;
};

const GENERATED_WORKSPACE_MARKER = 'name="canvas-helper-generated" content="hss1010-conversion-v1"';

const SECTION_ORDER = ["start", "wellness", "anatomy", "lifestyle", "public"] as const;
const SECTION_MARKERS: Record<(typeof SECTION_ORDER)[number], RegExp | null> = {
  start: null,
  wellness: /SECTION\s*1\b[\s\S]*HEALTH AND WELLNESS/i,
  anatomy: /SECTION\s*2\b[\s\S]*BODY WORKS/i,
  lifestyle: /SECTION\s*3\b[\s\S]*ROAD MAP TO WELLNESS/i,
  public: /SECTION\s*4\b[\s\S]*PUBLIC HEALTH/i
};

function getGeneratedAt(value?: string) {
  return value ?? new Date().toISOString();
}

function toHssCompositionBenchmark(
  resolvedBenchmark: Awaited<ReturnType<typeof resolveProjectBenchmarkSelection>>
): HssCompositionBenchmark | null {
  if (!resolvedBenchmark.selection || !resolvedBenchmark.bundle) {
    return null;
  }

  return {
    benchmarkId: resolvedBenchmark.bundle.benchmark.id,
    sourceSupportMode:
      resolvedBenchmark.selection.sourceSupportMode ?? resolvedBenchmark.bundle.benchmark.sourceSupportPolicy.mode,
    recipeIds: resolvedBenchmark.bundle.recipes.map((recipe) => recipe.id)
  };
}

function detectSourcePdfUrl(html: string) {
  const $ = load(html);
  return (
    $("#start a[href]").first().attr("href") ??
    $("#start iframe[src]").first().attr("src") ??
    $("iframe[src]").first().attr("src") ??
    null
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeMojibake(value: string) {
  return value
    .replace(/Ã¢â‚¬Â¢/g, "•")
    .replace(/â€¢/g, "•")
    .replace(/Ã¢â‚¬â€œ/g, "-")
    .replace(/â€“/g, "-")
    .replace(/Ã¢â‚¬â€�/g, "-")
    .replace(/â€”/g, "-")
    .replace(/Ã¢â‚¬Ëœ/g, "'")
    .replace(/Ã¢â‚¬â„¢/g, "'")
    .replace(/â€™/g, "'")
    .replace(/Ã¢â‚¬Å“/g, "\"")
    .replace(/â€œ/g, "\"")
    .replace(/â€/g, "\"")
    .replace(/Â·/g, "·")
    .replace(/Â/g, "");
}

function looksLikeRunningHeader(line: string) {
  const trimmed = line.trim();
  if (!trimmed) {
    return true;
  }

  return (
    /^HSS\s*1010/i.test(trimmed) ||
    /^\d+\s+Health Services Foundations/i.test(trimmed) ||
    /^Health Services Foundations\s*\|\s*HSS/i.test(trimmed)
  );
}

function isSupplementHeading(line: string) {
  return /^[A-Z0-9\s:&'"()/-]+$/.test(line) && line.length <= 90;
}

function collectSupplementGroups(contentLines: string[]) {
  const introLines: string[] = [];
  const groups: Array<{ title: string; bodyLines: string[] }> = [];
  let currentGroup: { title: string; bodyLines: string[] } | null = null;

  for (const line of contentLines) {
    if (isSupplementHeading(line)) {
      currentGroup = {
        title: line,
        bodyLines: []
      };
      groups.push(currentGroup);
      continue;
    }

    if (currentGroup) {
      currentGroup.bodyLines.push(line);
      continue;
    }

    introLines.push(line);
  }

  return { introLines, groups };
}

function buildSupplementCardGridHtml(chunk: SourceChunk, sectionId: string | undefined, contentLines: string[]) {
  const { introLines, groups } = collectSupplementGroups(contentLines);
  const usableGroups = groups.filter((group) => group.bodyLines.length > 0);
  if (usableGroups.length < 2) {
    return null;
  }

  const cardClass = sectionId === "anatomy" ? "anatomy-card" : "info-card";
  const introHtml = introLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
  const cardsHtml = usableGroups
    .map((group) => {
      const body = group.bodyLines.join(" ");
      return `<div class="${cardClass}"><h4>${escapeHtml(group.title)}</h4><p class="text-sm">${escapeHtml(body)}</p></div>`;
    })
    .join("");

  return [
    `<div class="read-block border-l-4 border-l-sky-500 bg-slate-900/40">`,
    `<p class="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3">Expanded lesson notes</p>`,
    introHtml,
    `<div class="grid md:grid-cols-2 gap-4${introHtml ? " mt-4" : ""}">${cardsHtml}</div>`,
    `</div>`
  ].join("");
}

function buildSourceSupplementHtml(chunk: SourceChunk, sectionId?: string) {
  const normalizedText = normalizeMojibake(chunk.text);
  const cleanedLines = normalizedText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !looksLikeRunningHeader(line));
  const contentLines = cleanedLines.length > 0 ? cleanedLines : [normalizedText.trim()];
  if (sectionId === "wellness" || sectionId === "anatomy") {
    const cardGridHtml = buildSupplementCardGridHtml(chunk, sectionId, contentLines);
    if (cardGridHtml) {
      return normalizeMojibake(cardGridHtml);
    }
  }

  const htmlParts: string[] = [
    `<div class="read-block border-l-4 border-l-sky-500 bg-slate-900/40">`,
    `<p class="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3">Expanded lesson notes</p>`
  ];

  let listBuffer: string[] = [];
  const flushList = () => {
    if (listBuffer.length === 0) {
      return;
    }
    htmlParts.push(`<ul class="list-disc list-inside space-y-2 text-slate-300">${listBuffer.join("")}</ul>`);
    listBuffer = [];
  };

  for (const line of contentLines) {
    const bulletMatch = line.match(/^(?:[•o]|[-*])\s*(.+)$/);
    if (bulletMatch) {
      const bulletPrefix = line.trim().charAt(0).toLowerCase();
      const isLetterOBullet = bulletPrefix === "o" && /^o\s+/.test(line.trim());
      if (bulletPrefix === "o" && !isLetterOBullet) {
        flushList();
        htmlParts.push(`<p>${escapeHtml(line)}</p>`);
        continue;
      }
      listBuffer.push(`<li>${escapeHtml(bulletMatch[1])}</li>`);
      continue;
    }

    flushList();

    if (/^[A-Z0-9\s:&'"\-–—]+$/.test(line) && line.length <= 90) {
      htmlParts.push(`<h3>${escapeHtml(line)}</h3>`);
      continue;
    }

    htmlParts.push(`<p>${escapeHtml(line)}</p>`);
  }

  flushList();
  htmlParts.push(`</div>`);
  return normalizeMojibake(htmlParts.join(""));
}

function detectSectionStartPages(sourceChunks: SourceChunk[]) {
  const markers = new Map<string, number>();

  for (const chunk of sourceChunks) {
    if (chunk.page == null) {
      continue;
    }

    for (const sectionId of SECTION_ORDER) {
      const pattern = SECTION_MARKERS[sectionId];
      if (!pattern || markers.has(sectionId)) {
        continue;
      }

      const leadingSnippet = chunk.text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !looksLikeRunningHeader(line))
        .slice(0, 6)
        .join("\n");

      if (pattern.test(leadingSnippet)) {
        markers.set(sectionId, chunk.page);
      }
    }
  }

  return markers;
}

function buildSectionPageRanges(sourceChunks: SourceChunk[]) {
  const pages = [...new Set(sourceChunks.map((chunk) => chunk.page).filter((page): page is number => page != null))].sort(
    (left, right) => left - right
  );
  if (pages.length === 0) {
    return new Map<string, number[]>();
  }

  const firstPage = pages[0];
  const lastPage = pages[pages.length - 1];
  const startPages = detectSectionStartPages(sourceChunks);
  const rangeMap = new Map<string, number[]>();

  for (let index = 0; index < SECTION_ORDER.length; index += 1) {
    const sectionId = SECTION_ORDER[index];
    const startPage = sectionId === "start" ? firstPage : startPages.get(sectionId);
    if (startPage == null) {
      continue;
    }

    let endPage = lastPage;
    for (let nextIndex = index + 1; nextIndex < SECTION_ORDER.length; nextIndex += 1) {
      const nextSectionId = SECTION_ORDER[nextIndex];
      const nextStart = startPages.get(nextSectionId);
      if (nextStart != null) {
        endPage = nextStart - 1;
        break;
      }
    }

    const rangePages = pages.filter((page) => page >= startPage && page <= endPage);
    rangeMap.set(sectionId, rangePages);
  }

  return rangeMap;
}

function constrainSourceMapToSectionRanges(sourceMap: SourceMapModel, sourceChunks: SourceChunk[]) {
  const sectionRanges = buildSectionPageRanges(sourceChunks);
  const chunkPageMap = new Map(sourceChunks.map((chunk) => [chunk.id, chunk.page]));

  return {
    ...sourceMap,
    sectionMappings: sourceMap.sectionMappings.map((mapping) => {
      const allowedPages = new Set(sectionRanges.get(mapping.sectionId) ?? []);
      if (allowedPages.size === 0) {
        return mapping;
      }

      return {
        ...mapping,
        matchedPages: mapping.matchedPages.filter((page) => allowedPages.has(page)),
        matchedChunkIds: mapping.matchedChunkIds.filter((chunkId) => {
          const page = chunkPageMap.get(chunkId);
          return page == null || allowedPages.has(page);
        })
      };
    }),
    blockMappings: sourceMap.blockMappings.map((mapping) => {
      const allowedPages = new Set(sectionRanges.get(mapping.sectionId) ?? []);
      if (allowedPages.size === 0) {
        return mapping;
      }

      return {
        ...mapping,
        mappedPages: mapping.mappedPages.filter((page) => allowedPages.has(page)),
        mappedChunkIds: mapping.mappedChunkIds.filter((chunkId) => {
          const page = chunkPageMap.get(chunkId);
          return page == null || allowedPages.has(page);
        })
      };
    })
  };
}

type EnrichCourseOptions = {
  course: CourseModel;
  sourceChunks: SourceChunk[];
  sourceTitle: string;
  baselineSourceMap: SourceMapModel;
};

export function enrichHss1010CourseWithSourceSupplements(options: EnrichCourseOptions): CourseModel {
  const sectionRanges = buildSectionPageRanges(options.sourceChunks);

  return {
    ...options.course,
    sections: options.course.sections.map((section) => {
      const baselinePages =
        options.baselineSourceMap.sectionMappings.find((mapping) => mapping.sectionId === section.id)?.matchedPages ?? [];
      const targetPages = sectionRanges.get(section.id) ?? [];
      const missingPages = targetPages.filter((page) => !baselinePages.includes(page));
      if (missingPages.length === 0) {
        return section;
      }

      const supplementalBlocks: CourseBlock[] = options.sourceChunks
        .filter((chunk) => chunk.page != null && missingPages.includes(chunk.page))
        .map((chunk) => ({
          id: `${section.id}-source-page-${chunk.page}`,
          type: "rawHtml",
          html: buildSourceSupplementHtml(chunk, section.id),
          text: normalizeMojibake(chunk.text).replace(/\s+/g, " ").trim(),
          source: {
            sourceType: "pdf",
            sourceTitle: options.sourceTitle,
            sourcePageStart: chunk.page,
            sourcePageEnd: chunk.page,
            sourceBlockId: chunk.id,
            conversionStatus: "converted",
            notes: ["source-supplement"]
          }
        }));

      return {
        ...section,
        blocks: [...section.blocks, ...supplementalBlocks]
      };
    })
  };
}

function buildGeneratedStudyStyles() {
  return [
    ".module-container {",
    "  max-width: 1100px;",
    "  margin: 0 auto 2.5rem;",
    "  padding: 2rem;",
    "  border-radius: 2rem;",
    "  background: linear-gradient(180deg, rgba(248,250,252,0.98), rgba(241,245,249,0.96));",
    "  border: 1px solid rgba(148, 163, 184, 0.32);",
    "  box-shadow: 0 18px 55px rgba(15, 23, 42, 0.18);",
    "}",
    ".hss-section-flow { color: #0f172a; }",
    ".hss-section-hero { display: flex; justify-content: space-between; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap; }",
    ".hss-kicker, .hss-mini-kicker { text-transform: uppercase; letter-spacing: 0.24em; font-weight: 800; color: #2563eb; }",
    ".hss-kicker { font-size: 0.78rem; }",
    ".hss-mini-kicker { font-size: 0.68rem; margin-bottom: 0.75rem; }",
    ".clay-card {",
    "  background: white;",
    "  border-radius: 1.75rem;",
    "  border: 2px solid #e2e8f0;",
    "  box-shadow: 0 10px 0 0 #dbe4f0, 0 24px 40px rgba(15, 23, 42, 0.08);",
    "}",
    ".lesson-shell { display: grid; gap: 1rem; }",
    ".practice-panel {",
    "  background: #f8fafc;",
    "  border: 2px solid #e2e8f0;",
    "  border-radius: 1.35rem;",
    "  padding: 1.1rem 1.15rem;",
    "}",
    ".activity-number {",
    "  width: 2.75rem;",
    "  height: 2.75rem;",
    "  border-radius: 999px;",
    "  display: inline-flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  background: linear-gradient(135deg, #2563eb, #1d4ed8);",
    "  color: white;",
    "  font-weight: 900;",
    "  box-shadow: 0 12px 22px rgba(37, 99, 235, 0.32);",
    "}",
    ".workbook-note {",
    "  max-width: 26rem;",
    "  background: #eef2ff;",
    "  border: 1px solid #c7d2fe;",
    "  border-radius: 1.35rem;",
    "  padding: 1rem 1.1rem;",
    "  color: #312e81;",
    "}",
    ".module-container .workbook-input {",
    "  width: 100%;",
    "  background: #f8fafc !important;",
    "  color: #334155 !important;",
    "  border: 2px solid #dbe4f0 !important;",
    "  border-radius: 1rem;",
    "  padding: 0.85rem 1rem;",
    "  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;",
    "}",
    ".module-container .workbook-input:focus {",
    "  outline: none;",
    "  background: white !important;",
    "  border-color: #60a5fa !important;",
    "  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.18);",
    "}",
    ".branch-row {",
    "  display: grid;",
    "  gap: 0.75rem;",
    "  background: white;",
    "  border: 1px solid #e2e8f0;",
    "  border-radius: 1.2rem;",
    "  padding: 1rem;",
    "}",
    ".study-check-button {",
    "  display: inline-flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  gap: 0.5rem;",
    "  background: #1d4ed8;",
    "  color: white;",
    "  border-radius: 999px;",
    "  padding: 0.85rem 1.25rem;",
    "  font-weight: 800;",
    "  box-shadow: 0 14px 24px rgba(29, 78, 216, 0.24);",
    "}",
    ".study-check-button:hover { background: #1e40af; }",
    ".study-check-results {",
    "  margin-top: 1rem;",
    "  padding: 0.95rem 1rem;",
    "  border-radius: 1rem;",
    "  background: #eff6ff;",
    "  border: 1px solid #bfdbfe;",
    "  color: #1e3a8a;",
    "}",
    ".source-pill {",
    "  display: inline-flex;",
    "  align-items: center;",
    "  gap: 0.5rem;",
    "  background: #dbeafe;",
    "  color: #1d4ed8;",
    "  border: 1px solid #93c5fd;",
    "  border-radius: 999px;",
    "  padding: 0.4rem 0.8rem;",
    "  font-size: 0.72rem;",
    "  font-weight: 800;",
    "  letter-spacing: 0.08em;",
    "  text-transform: uppercase;",
    "}",
    ".source-bridge-grid { display: grid; gap: 1rem; }",
    ".source-bridge-card .source-bridge-body { color: #334155; line-height: 1.75; }",
    ".teacher-checkpoint {",
    "  margin-top: 1.5rem;",
    "  background: linear-gradient(180deg, #fef3c7, #fde68a);",
    "  border: 1px solid #f59e0b;",
    "  border-radius: 1.35rem;",
    "  padding: 1.1rem 1.15rem;",
    "  box-shadow: inset 0 1px 0 rgba(255,255,255,0.45);",
    "}",
    ".checkpoint-kicker {",
    "  text-transform: uppercase;",
    "  letter-spacing: 0.22em;",
    "  font-weight: 900;",
    "  font-size: 0.72rem;",
    "  color: #92400e;",
    "}",
    ".teacher-checkpoint-note {",
    "  margin-top: 0.85rem;",
    "  color: #78350f;",
    "  font-size: 0.9rem;",
    "  line-height: 1.6;",
    "}",
    ".source-support-toggle {",
    "  display: inline-flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  gap: 0.5rem;",
    "  align-self: flex-start;",
    "  border-radius: 999px;",
    "  padding: 0.85rem 1.2rem;",
    "  border: 1px solid #bfdbfe;",
    "  background: #eff6ff;",
    "  color: #1d4ed8;",
    "  font-weight: 800;",
    "  box-shadow: 0 10px 24px rgba(59, 130, 246, 0.14);",
    "}",
    ".source-support-toggle:hover { background: #dbeafe; }",
    ".source-support-panel {",
    "  border-top: 1px solid #dbeafe;",
    "  padding-top: 1.25rem;",
    "}",
    ".module-container .info-card {",
    "  background: #eff6ff;",
    "  border: 1px solid #bfdbfe;",
    "  border-left: 4px solid #2563eb;",
    "  border-radius: 1rem;",
    "  margin-bottom: 0;",
    "  color: #1e3a8a;",
    "}",
    ".module-container .warning-card {",
    "  background: #fef2f2;",
    "  border: 1px solid #fecaca;",
    "  border-left: 4px solid #ef4444;",
    "  color: #7f1d1d;",
    "}",
    ".module-container .q-box {",
    "  background: #fff7ed;",
    "  border-left: 4px solid #f59e0b;",
    "  color: #7c2d12;",
    "}",
    ".module-container .read-block {",
    "  background: #f8fafc;",
    "  border: 1px solid #e2e8f0;",
    "  color: #334155;",
    "  margin-bottom: 0;",
    "}",
    ".module-container .read-block h3, .module-container .read-block h4, .module-container .lesson-shell h3, .module-container .lesson-shell h4 {",
    "  color: #0f172a;",
    "}",
    ".module-container .term-table th { background: #e2e8f0; color: #334155; }",
    ".module-container .term-table td { color: #334155; border-bottom-color: #cbd5e1; }",
    "@media (max-width: 900px) {",
    "  .module-container { padding: 1.25rem; border-radius: 1.5rem; }",
    "  .workbook-note { max-width: 100%; }",
    "}",
    ""
  ].join("\n");
}

function buildRuntimeScript(projectSlug: string) {
  return [
    "const SAVE_KEY = 'hss1010_full_data';",
    "const VIEW_STUDY = 'view-study';",
    "const VIEW_ASSESS = 'view-assess';",
    "let assessmentModel = null;",
    "",
    "function switchMainView(viewId) {",
    "  document.querySelectorAll('.main-view').forEach((el) => el.classList.remove('active'));",
    "  const target = document.getElementById(viewId);",
    "  if (target) target.classList.add('active');",
    "  const btnStudy = document.getElementById('btn-view-study');",
    "  const btnAssess = document.getElementById('btn-view-assess');",
    "  if (viewId === VIEW_STUDY) {",
    "    btnStudy?.classList.add('bg-blue-600', 'text-white', 'shadow-lg');",
    "    btnStudy?.classList.remove('text-slate-400');",
    "    btnAssess?.classList.remove('bg-blue-600', 'text-white', 'shadow-lg');",
    "    btnAssess?.classList.add('text-slate-400');",
    "  } else {",
    "    btnAssess?.classList.add('bg-blue-600', 'text-white', 'shadow-lg');",
    "    btnAssess?.classList.remove('text-slate-400');",
    "    btnStudy?.classList.remove('bg-blue-600', 'text-white', 'shadow-lg');",
    "    btnStudy?.classList.add('text-slate-400');",
    "  }",
    "}",
    "",
    "function switchContentTab(tabId) {",
    "  document.querySelectorAll('#view-study .section-content').forEach((el) => el.classList.remove('active'));",
    "  const target = document.getElementById(tabId);",
    "  if (target) target.classList.add('active');",
    "  document.querySelectorAll('#view-study .nav-btn').forEach((btn) => {",
    "    btn.classList.remove('bg-slate-800', 'border-slate-700', 'text-blue-400', 'shadow-sm');",
    "    btn.classList.add('text-slate-400');",
    "  });",
    "  const active = document.getElementById(`btn-study-${tabId}`);",
    "  if (active) {",
    "    active.classList.remove('text-slate-400');",
    "    active.classList.add('bg-slate-800', 'border-slate-700', 'text-blue-400', 'shadow-sm');",
    "  }",
    "  window.scrollTo(0, 0);",
    "}",
    "",
    "function switchAssessTab(tabId) {",
    "  document.querySelectorAll('.assess-tab').forEach((el) => {",
    "    el.classList.add('hidden');",
    "    el.classList.remove('active');",
    "  });",
    "  const target = document.getElementById(tabId);",
    "  if (target) {",
    "    target.classList.remove('hidden');",
    "    target.classList.add('active');",
    "  }",
    "  document.querySelectorAll('#view-assess .nav-btn').forEach((btn) => {",
    "    btn.classList.remove('active', 'bg-slate-800', 'text-blue-400', 'border-blue-500');",
    "    btn.classList.add('bg-slate-900', 'text-slate-400', 'border-slate-700');",
    "  });",
    "  const active = document.getElementById(`btn-${tabId}`);",
    "  if (active) {",
    "    active.classList.remove('bg-slate-900', 'text-slate-400', 'border-slate-700');",
    "    active.classList.add('active', 'bg-slate-800', 'text-blue-400', 'border-blue-500');",
    "  }",
    "  window.scrollTo(0, 0);",
    "}",
    "",
    "function getStudyFieldState() {",
    "  const studyFields = {};",
    "  document.querySelectorAll('[data-persist-key]').forEach((el) => {",
    "    const key = el.getAttribute('data-persist-key');",
    "    if (!key) return;",
    "    if (el instanceof HTMLInputElement) {",
    "      if (el.type === 'checkbox') {",
    "        studyFields[key] = el.checked;",
    "        return;",
    "      }",
    "      if (el.type === 'radio') {",
    "        if (el.checked) studyFields[key] = el.value;",
    "        return;",
    "      }",
    "      studyFields[key] = el.value;",
    "      return;",
    "    }",
    "    if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {",
    "      studyFields[key] = el.value;",
    "    }",
    "  });",
    "  return studyFields;",
    "}",
    "",
    "function getFormData() {",
    "  const name = document.getElementById('student-name')?.value ?? '';",
    "  const inputs = [];",
    "  document.querySelectorAll('.auto-grade, .cb-grade').forEach((el, idx) => {",
    "    if (el instanceof HTMLInputElement && el.type === 'checkbox') {",
    "      inputs.push({ type: 'checkbox', idx, val: el.checked });",
    "      return;",
    "    }",
    "    if (el instanceof HTMLSelectElement) {",
    "      inputs.push({ type: 'select', idx, val: el.value });",
    "    }",
    "  });",
    "  return { name, inputs, studyFields: getStudyFieldState() };",
    "}",
    "",
    "function saveLocal() {",
    "  localStorage.setItem(SAVE_KEY, JSON.stringify(getFormData()));",
    "  const status = document.getElementById('save-status');",
    "  if (!status) return;",
    "  status.style.opacity = '1';",
    "  setTimeout(() => { status.style.opacity = '0'; }, 800);",
    "}",
    "",
    "function downloadBackup() {",
    "  const data = JSON.stringify(getFormData());",
    "  const href = `data:text/json;charset=utf-8,${encodeURIComponent(data)}`;",
    "  const anchor = document.createElement('a');",
    "  anchor.href = href;",
    "  anchor.download = 'HSS1010_Backup.json';",
    "  anchor.click();",
    "}",
    "",
    "function loadBackupFromFile(file) {",
    "  const reader = new FileReader();",
    "  reader.onload = (event) => {",
    "    try {",
    "      const payload = JSON.parse(String(event.target?.result ?? '{}'));",
    "      hydrateFormData(payload);",
    "      saveLocal();",
    "      alert('File Loaded Successfully!');",
    "    } catch (error) {",
    "      alert('Backup file is invalid.');",
    "    }",
    "  };",
    "  reader.readAsText(file);",
    "}",
    "",
    "function hydrateStudyFields(studyFields) {",
    "  document.querySelectorAll('[data-persist-key]').forEach((el) => {",
    "    const key = el.getAttribute('data-persist-key');",
    "    if (!key || !(key in (studyFields ?? {}))) return;",
    "    const value = studyFields[key];",
    "    if (el instanceof HTMLInputElement) {",
    "      if (el.type === 'checkbox') {",
    "        el.checked = Boolean(value);",
    "        return;",
    "      }",
    "      if (el.type === 'radio') {",
    "        el.checked = String(value ?? '') === el.value;",
    "        return;",
    "      }",
    "      el.value = String(value ?? '');",
    "      return;",
    "    }",
    "    if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {",
    "      el.value = String(value ?? '');",
    "    }",
    "  });",
    "}",
    "",
    "function hydrateFormData(data) {",
    "  if (data?.name) {",
    "    const studentInput = document.getElementById('student-name');",
    "    if (studentInput instanceof HTMLInputElement) {",
    "      studentInput.value = data.name;",
    "    }",
    "  }",
    "  const elements = document.querySelectorAll('.auto-grade, .cb-grade');",
    "  for (const item of data?.inputs ?? []) {",
    "    const el = elements[item.idx];",
    "    if (!el) continue;",
    "    if (item.type === 'checkbox' && el instanceof HTMLInputElement) {",
    "      el.checked = Boolean(item.val);",
    "    }",
    "    if (item.type === 'select' && el instanceof HTMLSelectElement) {",
    "      el.value = String(item.val ?? '');",
    "    }",
    "  }",
    "  hydrateStudyFields(data?.studyFields ?? data?.studyInputs ?? {});",
    "}",
    "",
    "function calculateScores() {",
    "  const sectionTotals = {};",
    "  document.querySelectorAll('.assess-tab[id]').forEach((tab) => {",
    "    sectionTotals[tab.id] = 0;",
    "  });",
    "  document.querySelectorAll('.auto-grade').forEach((el) => {",
    "    if (!(el instanceof HTMLSelectElement)) return;",
    "    el.classList.remove('correct', 'incorrect');",
    "    const sectionId = el.closest('.assess-tab')?.id;",
    "    if (!sectionId) return;",
    "    const expected = el.dataset.correct ?? '';",
    "    const isCorrect = expected === 'any' ? el.value.length > 0 : el.value === expected;",
    "    if (isCorrect) {",
    "      sectionTotals[sectionId] = (sectionTotals[sectionId] ?? 0) + 1;",
    "      el.classList.add('correct');",
    "    } else if (el.value) {",
    "      el.classList.add('incorrect');",
    "    }",
    "  });",
    "  document.querySelectorAll('.cb-grade').forEach((el) => {",
    "    if (!(el instanceof HTMLInputElement) || el.type !== 'checkbox') return;",
    "    const sectionId = el.closest('.assess-tab')?.id;",
    "    if (!sectionId) return;",
    "    const label = el.parentElement;",
    "    if (label) label.style.color = '';",
    "    if (el.checked && el.value === 'yes') {",
    "      sectionTotals[sectionId] = (sectionTotals[sectionId] ?? 0) + 1;",
    "      if (label) label.style.color = '#10b981';",
    "    } else if (el.checked && el.value === 'no') {",
    "      if (label) label.style.color = '#ef4444';",
    "    }",
    "  });",
    "  const total = Object.values(sectionTotals).reduce((sum, value) => sum + Number(value || 0), 0);",
    "  return { sections: sectionTotals, total };",
    "}",
    "",
    "function checkSectionScore(sectionId, totalMarks) {",
    "  const scores = calculateScores();",
    "  const score = Number(scores.sections[sectionId] ?? 0);",
    "  const target = document.getElementById(`score-${sectionId}-display`);",
    "  if (!target) return;",
    "  target.textContent = `Score: ${score} / ${totalMarks}`;",
    "  target.classList.remove('hidden');",
    "}",
    "",
    "function generatePrintableReport() {",
    "  saveLocal();",
    "  const scoreState = calculateScores();",
    "  const name = document.getElementById('student-name')?.value || 'Student';",
    "  const date = new Date().toLocaleDateString();",
    "  const rows = (assessmentModel?.sections ?? []).map((section) => {",
    "    const sectionScore = Number(scoreState.sections[section.id] ?? 0);",
    "    const sectionTotal = Number(section.totalMarks ?? 0);",
    "    return `<tr><td>${section.title}</td><td>${sectionScore}</td><td>${sectionTotal}</td></tr>`;",
    "  }).join('');",
    "  const overallTotal = (assessmentModel?.sections ?? []).reduce((sum, section) => sum + Number(section.totalMarks ?? 0), 0);",
    "  const reportHtml = `",
    "    <html>",
    "      <head>",
    "        <title>HSS1010 Report</title>",
    "        <style>",
    "          body { font-family: sans-serif; padding: 40px; color: #111827; }",
    "          h1 { border-bottom: 2px solid #111827; padding-bottom: 10px; }",
    "          table { width: 100%; border-collapse: collapse; margin-top: 20px; }",
    "          th, td { padding: 12px; border-bottom: 1px solid #d1d5db; text-align: left; }",
    "          th { background: #f3f4f6; }",
    "          .total-row { font-weight: 700; background: #d1fae5; }",
    "        </style>",
    "      </head>",
    "      <body>",
    "        <h1>HSS 1010: Final Report Card</h1>",
    "        <p><strong>Student Name:</strong> ${name}</p>",
    "        <p><strong>Date:</strong> ${date}</p>",
    "        <table>",
    "          <thead><tr><th>Section</th><th>Marks Obtained</th><th>Total Possible</th></tr></thead>",
    "          <tbody>",
    "            ${rows}",
    "            <tr class='total-row'><td>FINAL SCORE</td><td>${scoreState.total}</td><td>${overallTotal}</td></tr>",
    "          </tbody>",
    "        </table>",
    "        <script>window.print();<\\/script>",
    "      </body>",
    "    </html>",
    "  `;",
    "  const win = window.open('', '_blank');",
    "  if (!win) return;",
    "  win.document.write(reportHtml);",
    "  win.document.close();",
    "}",
    "",
    "function toggleSourceSupport(panelId) {",
    "  const panel = document.querySelector(`[data-source-support-panel=\"${panelId}\"]`);",
    "  const trigger = document.querySelector(`[data-source-support-toggle=\"${panelId}\"]`);",
    "  if (!panel || !trigger) return;",
    "  const willOpen = panel.classList.contains('hidden');",
    "  panel.classList.toggle('hidden', !willOpen);",
    "  trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');",
    "  trigger.textContent = willOpen ? 'Hide source support' : 'Open source support';",
    "}",
    "",
    "function runStudyCheck(activityId) {",
    "  const container = document.querySelector(`[data-study-activity=\"${activityId}\"]`);",
    "  const result = document.querySelector(`[data-study-results=\"${activityId}\"]`);",
    "  if (!container || !result) return;",
    "  let total = 0;",
    "  let correct = 0;",
    "  let answered = 0;",
    "  container.querySelectorAll('[data-correct-value]').forEach((el) => {",
    "    const expected = String(el.getAttribute('data-correct-value') ?? '').trim();",
    "    if (!expected) return;",
    "    total += 1;",
    "    let actual = '';",
    "    if (el instanceof HTMLInputElement) {",
    "      if (el.type === 'checkbox') {",
    "        actual = el.checked ? 'true' : 'false';",
    "      } else if (el.type === 'radio') {",
    "        if (!el.checked) return;",
    "        actual = el.value;",
    "      } else {",
    "        actual = el.value;",
    "      }",
    "    } else if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {",
    "      actual = el.value;",
    "    }",
    "    if (String(actual).trim().length > 0) answered += 1;",
    "    if (String(actual).trim() === expected) correct += 1;",
    "  });",
    "  result.classList.remove('hidden');",
    "  if (total === 0) {",
    "    result.innerHTML = '<strong>No answer key was defined for this activity yet.</strong>';",
    "    return;",
    "  }",
    "  if (answered === 0) {",
    "    result.innerHTML = '<strong>Nothing checked yet.</strong> Choose an answer first, then run the check again.';",
    "    return;",
    "  }",
    "  const summary = `<strong>${correct} / ${total}</strong> correct.`;",
    "  const followUp = correct === total",
    "    ? 'You matched the lesson correctly. Move to the reflection and explain why those choices fit.'",
    "    : 'Use the lesson cards again and look for the clue words that point to the right dimension or determinant.';",
    "  result.innerHTML = `${summary} ${followUp}`;",
    "}",
    "",
    "function wireEvents() {",
    "  document.getElementById('btn-view-study')?.addEventListener('click', () => switchMainView(VIEW_STUDY));",
    "  document.getElementById('btn-view-assess')?.addEventListener('click', () => switchMainView(VIEW_ASSESS));",
    "  document.querySelectorAll('[data-study-tab]').forEach((btn) => {",
    "    btn.addEventListener('click', () => switchContentTab(btn.getAttribute('data-study-tab') || ''));",
    "  });",
    "  document.querySelectorAll('[data-assess-tab]').forEach((btn) => {",
    "    btn.addEventListener('click', () => switchAssessTab(btn.getAttribute('data-assess-tab') || ''));",
    "  });",
    "  document.querySelectorAll('.score-section-btn').forEach((btn) => {",
    "    btn.addEventListener('click', () => {",
    "      const sectionId = btn.getAttribute('data-score-section') || '';",
    "      const total = Number(btn.getAttribute('data-score-total') || '0');",
    "      checkSectionScore(sectionId, total);",
    "    });",
    "  });",
    "  document.getElementById('btn-download-backup')?.addEventListener('click', downloadBackup);",
    "  document.getElementById('btn-upload-trigger')?.addEventListener('click', () => {",
    "    const input = document.getElementById('upload');",
    "    if (input instanceof HTMLInputElement) input.click();",
    "  });",
    "  const upload = document.getElementById('upload');",
    "  if (upload instanceof HTMLInputElement) {",
    "    upload.addEventListener('change', () => {",
    "      const file = upload.files?.[0];",
    "      if (file) loadBackupFromFile(file);",
    "      upload.value = '';",
    "    });",
    "  }",
    "  document.getElementById('btn-generate-report')?.addEventListener('click', generatePrintableReport);",
    "  document.querySelectorAll('[data-study-check]').forEach((btn) => {",
    "    btn.addEventListener('click', () => runStudyCheck(btn.getAttribute('data-study-check') || ''));",
    "  });",
    "  document.querySelectorAll('[data-source-support-toggle]').forEach((btn) => {",
    "    btn.addEventListener('click', () => toggleSourceSupport(btn.getAttribute('data-source-support-toggle') || ''));",
    "  });",
    "  document.querySelectorAll('select, textarea, input[type=text], input[type=checkbox], input[type=radio]').forEach((el) => {",
    "    el.addEventListener('change', saveLocal);",
    "    el.addEventListener('input', saveLocal);",
    "  });",
    "}",
    "",
    "async function boot() {",
    "  try {",
    "    const [courseResponse, assessmentResponse] = await Promise.all([",
    "      fetch('./data/course.json'),",
    "      fetch('./data/assessment.json')",
    "    ]);",
    "    if (!courseResponse.ok || !assessmentResponse.ok) throw new Error('Failed to load course data.');",
    "    assessmentModel = await assessmentResponse.json();",
    "  } catch (error) {",
    "    console.error(error);",
    "  }",
    "  const saved = localStorage.getItem(SAVE_KEY);",
    "  if (saved) {",
    "    try { hydrateFormData(JSON.parse(saved)); } catch {}",
    "  }",
    "  wireEvents();",
    "  switchMainView(VIEW_STUDY);",
    "}",
    "",
    "window.addEventListener('load', boot);",
    "",
    `console.log('HSS1010 runtime ready for ${projectSlug}.');`,
    ""
  ].join("\n");
}

function buildWorkspaceIndexHtml(projectSlug: string, course: CourseModel, assessment: AssessmentModel) {
  const totalMarks = getAssessmentTotalMarks(assessment);
  return [
    "<!doctype html>",
    "<html lang=\"en\">",
    "<head>",
    "  <meta charset=\"UTF-8\">",
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
    "  <meta name=\"canvas-helper-generated\" content=\"hss1010-conversion-v1\">",
    `  <title>${course.title}</title>`,
    "  <script src=\"https://cdn.tailwindcss.com\"></script>",
    "  <link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800;900&family=JetBrains+Mono:wght@500;700&display=swap\" rel=\"stylesheet\">",
    "  <link rel=\"stylesheet\" href=\"./styles.css\">",
    "  <link rel=\"stylesheet\" href=\"./hss-study.css\">",
    "</head>",
    "<body class=\"min-h-screen flex flex-col custom-scroll\">",
    "  <header class=\"glass-header sticky top-0 z-50 p-4 shadow-lg\">",
    "    <div class=\"max-w-7xl mx-auto\">",
    "      <div class=\"flex flex-col md:flex-row justify-between items-center gap-4 mb-2\">",
    "        <div>",
    "          <h1 class=\"text-xl font-black italic tracking-tighter text-white uppercase\">HSS 1010 <span class=\"text-blue-500\">Foundations</span></h1>",
    "          <p class=\"text-[10px] font-mono text-slate-400 tracking-widest uppercase\">Integrated Course & Assessment</p>",
    "        </div>",
    "        <div class=\"flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-700 shadow-xl\">",
    "          <button id=\"btn-view-study\" class=\"px-6 py-2 rounded-lg text-sm font-black uppercase tracking-wide bg-blue-600 text-white shadow-lg transition-all\">",
    "            Study Material",
    "          </button>",
    "          <button id=\"btn-view-assess\" class=\"px-6 py-2 rounded-lg text-sm font-black uppercase tracking-wide text-slate-400 hover:text-white transition-all\">",
    "            Assignment",
    "          </button>",
    "        </div>",
    "        <div class=\"flex items-center gap-3\">",
    "          <button id=\"btn-download-backup\" class=\"text-[10px] font-mono uppercase bg-slate-800 text-blue-400 px-3 py-1 rounded border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors\">Save File</button>",
    "          <span class=\"text-slate-700\">|</span>",
    "          <button id=\"btn-upload-trigger\" class=\"text-[10px] font-mono uppercase bg-slate-800 text-blue-400 px-3 py-1 rounded border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors\">Load File</button>",
    "          <input type=\"file\" id=\"upload\" class=\"hidden\" accept=\"application/json\">",
    "        </div>",
    "      </div>",
    "      <p class=\"text-[10px] text-center text-emerald-500 italic opacity-0 transition-opacity duration-500\" id=\"save-status\">Progress Saved.</p>",
    "    </div>",
    "  </header>",
    "",
    "  <main class=\"flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full\">",
    "    <div id=\"view-study\" class=\"main-view active\">",
    "      <div id=\"study-tabs\" class=\"flex bg-slate-900/50 p-1 rounded-lg border border-slate-800 overflow-x-auto mb-8\">",
    renderStudyTabs(course),
    "      </div>",
    "      <div id=\"study-sections-root\">",
    renderStudySections(course),
    "      </div>",
    "    </div>",
    "",
    "    <div id=\"view-assess\" class=\"main-view\">",
    "      <div class=\"mb-6 bg-slate-900 p-4 rounded border border-slate-700 flex flex-col md:flex-row justify-between items-center\">",
    "        <div class=\"w-full md:w-1/2\">",
    "          <label class=\"text-xs text-slate-400 block mb-1\">Student Full Name (Required for Report):</label>",
    "          <input type=\"text\" id=\"student-name\" placeholder=\"Enter name here...\" class=\"bg-slate-950 border-slate-600\">",
    "        </div>",
    "        <div class=\"mt-4 md:mt-0 text-right\">",
    "          <p class=\"text-xs text-slate-400\">Total Marks</p>",
    `          <p id="total-marks" class="text-2xl font-black text-emerald-400">${totalMarks}</p>`,
    "        </div>",
    "      </div>",
    "      <div id=\"assessment-tabs\" class=\"flex flex-wrap gap-2 mb-6\">",
    renderAssessmentTabs(assessment),
    "      </div>",
    "      <div id=\"assessment-sections-root\">",
    renderAssessmentSections(assessment),
    "      </div>",
    "      <div class=\"mt-8 border-t border-slate-700 pt-6 text-center\">",
    "        <button id=\"btn-generate-report\" class=\"bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded shadow-lg text-xl w-full md:w-auto transition-all transform hover:scale-105\">",
    "          SUBMIT FINAL ASSIGNMENT & GENERATE REPORT",
    "        </button>",
    "      </div>",
    "    </div>",
    "  </main>",
    "",
    "  <script src=\"./main.js\"></script>",
    "</body>",
    "</html>",
    ""
  ].join("\n");
}

export function extractHss1010ModelsFromHtml(options: ExtractHss1010Options): {
  course: CourseModel;
  assessment: AssessmentModel;
} {
  return extractHss1010Models({
    projectSlug: options.projectSlug,
    html: options.html,
    generatedAt: getGeneratedAt(options.generatedAt),
    sourceTitle: options.sourceTitle,
    sourcePdfUrl: options.sourcePdfUrl
  });
}

export function buildHss1010SourceArtifacts(options: BuildSourceArtifactsOptions): {
  sourceMap: SourceMapModel;
  coverageReport: CoverageReport;
} {
  const generatedAt = getGeneratedAt(options.generatedAt);
  const sourceMap = buildCourseSourceMap({
    projectSlug: options.projectSlug,
    course: options.course,
    sourceReferenceId: options.sourceReferenceId,
    sourceChunks: options.sourceChunks,
    generatedAt
  });
  const constrainedSourceMap = constrainSourceMapToSectionRanges(sourceMap, options.sourceChunks);
  const coverageReport = buildCoverageReport({
    projectSlug: options.projectSlug,
    course: options.course,
    sourceChunks: options.sourceChunks,
    sourceMap: constrainedSourceMap,
    generatedAt
  });

  return { sourceMap: constrainedSourceMap, coverageReport };
}

export function renderHss1010WorkspaceShell(options: RenderWorkspaceShellOptions) {
  const interactiveCourse = options.assumeInteractiveCourse
    ? options.course
    : composeInteractiveHss1010Course(options.course, options.benchmarkComposition);
  return {
    indexHtml: buildWorkspaceIndexHtml(options.projectSlug, interactiveCourse, options.assessment),
    runtimeJs: buildRuntimeScript(options.projectSlug),
    studyCss: buildGeneratedStudyStyles()
  };
}

export async function convertHss1010Project(
  options: ConvertHss1010ProjectOptions
): Promise<ConvertHss1010ProjectResult> {
  const generatedAt = getGeneratedAt(options.generatedAt);
  const projectPaths = getProjectPaths(options.projectSlug);
  let legacyHtmlPath = options.legacyHtmlPath ?? projectPaths.workspaceEntrypoint;
  let legacyHtml = await readFile(legacyHtmlPath, "utf8");
  if (!options.legacyHtmlPath && legacyHtml.includes(GENERATED_WORKSPACE_MARKER) && (await fileExists(projectPaths.rawEntrypoint))) {
    legacyHtmlPath = projectPaths.rawEntrypoint;
    legacyHtml = await readFile(legacyHtmlPath, "utf8");
  }
  const sourceSelection = await loadProjectSourceSelection(options.projectSlug);
  const resolvedBenchmark = await resolveProjectBenchmarkSelection({ projectSlug: options.projectSlug });
  const benchmarkComposition = toHssCompositionBenchmark(resolvedBenchmark);
  const sourcePdfUrl = detectSourcePdfUrl(legacyHtml) ?? sourceSelection.sourcePdfUrl;
  const { course, assessment } = extractHss1010ModelsFromHtml({
    projectSlug: options.projectSlug,
    html: legacyHtml,
    sourceTitle: sourceSelection.sourceTitle,
    sourcePdfUrl,
    generatedAt
  });
  const baselineArtifacts = buildHss1010SourceArtifacts({
    projectSlug: options.projectSlug,
    course,
    sourceReferenceId: sourceSelection.sourceReferenceId,
    sourceChunks: sourceSelection.sourceChunks,
    generatedAt
  });
  const enrichedCourse = enrichHss1010CourseWithSourceSupplements({
    course,
    sourceChunks: sourceSelection.sourceChunks,
    sourceTitle: sourceSelection.sourceTitle,
    baselineSourceMap: baselineArtifacts.sourceMap
  });
  const interactiveCourse = composeInteractiveHss1010Course(enrichedCourse, benchmarkComposition);
  const { sourceMap, coverageReport } = buildHss1010SourceArtifacts({
    projectSlug: options.projectSlug,
    course: interactiveCourse,
    sourceReferenceId: sourceSelection.sourceReferenceId,
    sourceChunks: sourceSelection.sourceChunks,
    generatedAt
  });
  const rendered = renderHss1010WorkspaceShell({
    projectSlug: options.projectSlug,
    course: interactiveCourse,
    assessment,
    benchmarkComposition
  });

  const coursePath = `${projectPaths.metaDir}/course.json`;
  const assessmentPath = `${projectPaths.metaDir}/assessment.json`;
  const sourceMapPath = `${projectPaths.metaDir}/source-map.json`;
  const coveragePath = `${projectPaths.metaDir}/coverage-report.json`;
  const workspaceCoursePath = `${projectPaths.workspaceDir}/data/course.json`;
  const workspaceAssessmentPath = `${projectPaths.workspaceDir}/data/assessment.json`;
  const workspaceRuntimePath = `${projectPaths.workspaceDir}/main.js`;
  const workspaceStudyCssPath = `${projectPaths.workspaceDir}/hss-study.css`;

  const deviationGateResult = await runAuthoringDeviationGate({
    projectSlug: options.projectSlug,
    repoPreferencesPath: options.repoAuthoringPreferencesPath,
    projectPreferencesPath: options.projectAuthoringPreferencesPath,
    benchmarkSelectionPath: options.benchmarkSelectionPath,
    cliOverride: options.authoringCliOverride,
    acceptance: options.authoringAcceptance,
    surfaces: [
      {
        kind: "course-html",
        filePath: projectPaths.workspaceEntrypoint,
        content: rendered.indexHtml
      },
      {
        kind: "workspace-runtime",
        filePath: workspaceRuntimePath,
        content: rendered.runtimeJs
      }
    ]
  });

  if (!deviationGateResult.pass) {
    throw new Error(
      `Authoring preference deviations blocked conversion for "${options.projectSlug}". See ${deviationGateResult.reportMarkdownPath}.`
    );
  }

  await Promise.all([
    writeJsonFile(coursePath, interactiveCourse),
    writeJsonFile(assessmentPath, assessment),
    writeJsonFile(sourceMapPath, sourceMap),
    writeJsonFile(coveragePath, coverageReport),
    writeJsonFile(workspaceCoursePath, interactiveCourse),
    writeJsonFile(workspaceAssessmentPath, assessment),
    writeTextFile(projectPaths.workspaceEntrypoint, rendered.indexHtml),
    writeTextFile(workspaceRuntimePath, rendered.runtimeJs),
    writeTextFile(workspaceStudyCssPath, rendered.studyCss)
  ]);

  return {
    projectSlug: options.projectSlug,
    generatedAt,
    legacyHtmlPath,
    workspaceEntrypoint: projectPaths.workspaceEntrypoint,
    workspaceRuntimePath,
    coursePath,
    assessmentPath,
    sourceMapPath,
    coveragePath
  };
}
