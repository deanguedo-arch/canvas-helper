import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createHash } from "node:crypto";

import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import JSZip from "jszip";

import { decodeBrightspaceHtml } from "./lib/ela-modern-drama.js";
import { renderNextStepCourseShell, type NextStepShellLesson, type NextStepShellNavItem } from "./lib/next-step-course-shell.js";

const ROOT = process.cwd();
const COURSE_CODE = "Social Studies 30-1";
const DEFAULT_ZIP_PATH =
  "/Users/deanguedo/Downloads/D2LExport_6712_CBE System Social Studies 30-1 (Winter 2020)_202662203.zip";
const LOGO_SOURCE_PATH = path.join(
  ROOT,
  "docs",
  "design",
  "next-step",
  "assets",
  "nxt-ce-logo-white-with-ce.png"
);

type IssueConfig = {
  slug: string;
  title: string;
  shortTitle: string;
  issueQuestion: string;
  overviewIntro: string;
  units: string[];
  unitPrefixes: string[];
  textbookFiles: string[];
};

type LessonSource = {
  entry: string;
  title: string;
  group: string;
  unitPrefix: string;
};

type ImportedResource = {
  category: "textbook" | "unit" | "student" | "external";
  title: string;
  href: string;
  sourcePath: string;
  description: string;
};

type SanitizedLesson = NextStepShellLesson & {
  resources: ImportedResource[];
  externalLinks: ImportedResource[];
};

const UNIT_TITLES: Record<string, string> = {
  U1Identity: "Unit 1: Ideology and Identity",
  U2foundations: "Unit 2: Foundations of Liberalism",
  U3: "Unit 3: The Evolution of Modern Liberalism",
  U4Rejecting: "Unit 4: Rejecting Liberalism",
  U5Resolve: "Unit 5: Resolving Ideological Conflict",
  U6Practice: "Unit 6: Liberal Theories in Practice",
  U7Citizen: "Unit 7: Citizenship and Ideology"
};

const ISSUES: IssueConfig[] = [
  {
    slug: "social30-1-related-issue-1",
    title: "Related Issue 1",
    shortTitle: "Social RI 1",
    issueQuestion: "To what extent should ideology be the foundation of identity?",
    overviewIntro:
      "Explore how identity, beliefs, values, and the foundations of liberalism shape the way people understand themselves and society.",
    units: ["U1", "U2"],
    unitPrefixes: ["U1Identity", "U2foundations"],
    textbookFiles: ["Intro.pdf", "TableContents.pdf", "Part1.pdf", "Ch01.pdf", "Ch02.pdf", "Ch03.pdf", "Ch04.pdf"]
  },
  {
    slug: "social30-1-related-issue-2",
    title: "Related Issue 2",
    shortTitle: "Social RI 2",
    issueQuestion: "To what extent is resistance to liberalism justified?",
    overviewIntro:
      "Track how modern liberalism changed over time and why some individuals, groups, and governments challenged or rejected liberal principles.",
    units: ["U3", "U4"],
    unitPrefixes: ["U3", "U4Rejecting"],
    textbookFiles: ["Part2chpt3.pdf", "Ch05.pdf", "Ch06.pdf", "Ch07.pdf", "Ch08.pdf"]
  },
  {
    slug: "social30-1-related-issue-3",
    title: "Related Issue 3",
    shortTitle: "Social RI 3",
    issueQuestion: "To what extent are the principles of liberalism viable?",
    overviewIntro:
      "Examine how liberal principles are tested by conflict, security, democracy, rights, economics, and environmental pressures.",
    units: ["U5", "U6"],
    unitPrefixes: ["U5Resolve", "U6Practice"],
    textbookFiles: ["Part3.pdf", "Ch09.pdf", "Ch10.pdf", "Ch11.pdf", "Ch12.pdf"]
  },
  {
    slug: "social30-1-related-issue-4",
    title: "Related Issue 4",
    shortTitle: "Social RI 4",
    issueQuestion: "To what extent should my actions as a citizen be shaped by an ideology?",
    overviewIntro:
      "Consider how ideology influences citizenship, political action, personal responsibility, and responses to contemporary issues.",
    units: ["U7"],
    unitPrefixes: ["U7Citizen"],
    textbookFiles: ["Part4.pdf", "Ch13.pdf", "Ch14.pdf", "Closer.pdf", "Glossary.pdf"]
  }
];

const COMMON_STUDENT_RESOURCE_PREFIXES = ["Student Resources/"];
const UNIT_RESOURCE_EXTENSIONS = new Set([
  ".doc",
  ".docx",
  ".pdf",
  ".ppt",
  ".pptx",
  ".pps",
  ".ppsx",
  ".rtf",
  ".xls",
  ".xlsx"
]);
const SUPPLEMENTAL_HTML_EXTENSIONS = new Set([".htm", ".html"]);

function getArg(name: string, fallback = "") {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) {
    return fallback;
  }
  return process.argv[index + 1] ?? fallback;
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripBOM(value: string) {
  return value.replace(/^\uFEFF/, "");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function safeDecodeUri(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeZipPath(value: string) {
  return path.posix
    .normalize(stripBOM(value).replace(/\\/g, "/").replace(/^\/+/, ""))
    .replace(/^\.\//, "");
}

function withoutQuery(value: string) {
  return value.split("?", 1)[0]?.split("#", 1)[0] ?? value;
}

function slugify(value: string) {
  return normalizeWhitespace(decodeEntities(value))
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function shortHash(value: string) {
  return createHash("sha1").update(value).digest("hex").slice(0, 8);
}

function safeFileName(zipPath: string) {
  const parsed = path.posix.parse(zipPath);
  const base =
    parsed.name
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "resource";
  return `${base}-${shortHash(zipPath)}${parsed.ext.toLowerCase()}`;
}

function getUnitPrefix(entry: string, prefixes: string[]) {
  return prefixes.find((prefix) => entry === prefix || entry.startsWith(`${prefix}/`)) ?? prefixes[0];
}

function buildZipPathIndex(zip: JSZip) {
  const index = new Map<string, string>();
  for (const name of Object.keys(zip.files)) {
    index.set(normalizeZipPath(name).toLowerCase(), name);
  }
  return index;
}

function findZipPath(zipIndex: Map<string, string>, candidate: string) {
  const normalized = normalizeZipPath(candidate);
  return zipIndex.get(normalized.toLowerCase());
}

function resolveZipPath(zipIndex: Map<string, string>, currentEntry: string, href: string) {
  const cleanHref = safeDecodeUri(withoutQuery(href)).trim();
  if (!cleanHref || /^(https?:|mailto:|tel:|javascript:|data:)/i.test(cleanHref)) {
    return undefined;
  }

  const direct = normalizeZipPath(cleanHref.replace(/^file:\/\//i, ""));
  const directMatch = findZipPath(zipIndex, direct);
  if (directMatch) {
    return directMatch;
  }

  const relative = normalizeZipPath(path.posix.join(path.posix.dirname(currentEntry), cleanHref));
  const relativeMatch = findZipPath(zipIndex, relative);
  if (relativeMatch) {
    return relativeMatch;
  }

  const parts = direct.split("/");
  for (let index = 1; index < parts.length; index += 1) {
    const suffix = parts.slice(index).join("/");
    const suffixMatch = findZipPath(zipIndex, suffix);
    if (suffixMatch) {
      return suffixMatch;
    }
  }

  return undefined;
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

function fileExtension(zipPath: string) {
  return path.posix.extname(withoutQuery(zipPath)).toLowerCase();
}

function cleanTitle(value: string, fallback: string) {
  const cleaned = normalizeWhitespace(decodeEntities(value))
    .replace(/^Lesson\s+\d+\s*:\s*/i, "Lesson ")
    .replace(/\s+\|\s+.*$/, "")
    .replace(/\s+/g, " ");
  return cleaned || fallback;
}

function summarize(text: string, fallback: string) {
  const cleaned = normalizeWhitespace(decodeEntities(text))
    .replace(/Social Studies 30-1/gi, "")
    .replace(/CBe-learn Calgary Board of Education/gi, "")
    .replace(/Lesson\s+\d+\s*:\s*/gi, "")
    .trim();
  if (!cleaned) {
    return fallback;
  }
  const firstSentence = cleaned.match(/^(.{80,220}?[.!?])\s/)?.[1] ?? cleaned.slice(0, 180);
  return normalizeWhitespace(firstSentence).replace(/\s+$/, "") + (firstSentence.length < cleaned.length && !/[.!?]$/.test(firstSentence) ? "..." : "");
}

function parseManifestLessons(zip: JSZip, config: IssueConfig) {
  const manifestFile = zip.file("imsmanifest.xml");
  if (!manifestFile) {
    throw new Error("Missing imsmanifest.xml");
  }

  return manifestFile.async("string").then((manifest) => {
    const $ = cheerio.load(manifest, { xmlMode: true });
    const resourceHrefById = new Map<string, string>();
    $("resource").each((_, resource) => {
      const id = $(resource).attr("identifier") ?? "";
      const href = $(resource).attr("href") ?? "";
      if (id && href) {
        resourceHrefById.set(id, normalizeZipPath(href));
      }
    });

    const lessons: LessonSource[] = [];
    const visit = (item: Element) => {
      const $item = $(item);
      const idRef = $item.attr("identifierref") ?? "";
      const href = resourceHrefById.get(idRef);
      if (href && config.unitPrefixes.some((prefix) => href.startsWith(`${prefix}/`))) {
        const unitPrefix = getUnitPrefix(href, config.unitPrefixes);
        const title = cleanTitle($item.children("title").first().text(), path.posix.basename(href, fileExtension(href)));
        lessons.push({
          entry: href,
          title,
          group: UNIT_TITLES[unitPrefix] ?? unitPrefix,
          unitPrefix
        });
      }
      $item.children("item").each((_, child) => visit(child));
    };

    $("organization").first().children("item").each((_, item) => visit(item));
    return lessons;
  });
}

async function copyZipFile(zip: JSZip, zipPath: string, workspaceDir: string, workspaceSubdir: string) {
  const file = zip.file(zipPath);
  if (!file) {
    return undefined;
  }
  const fileName = safeFileName(zipPath);
  const targetDir = path.join(workspaceDir, workspaceSubdir);
  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(path.join(targetDir, fileName), await file.async("nodebuffer"));
  return `${workspaceSubdir}/${fileName}`;
}

function renderCleanFallback(html: string) {
  return html
    .replace(/\s+align="[^"]*"/gi, "")
    .replace(/\s+width="[^"]*"/gi, "")
    .replace(/\s+height="[^"]*"/gi, "");
}

async function sanitizeLesson(
  zip: JSZip,
  zipIndex: Map<string, string>,
  workspaceDir: string,
  source: LessonSource,
  lessonIdByEntry: Map<string, string>,
  registerResource: (resource: ImportedResource) => void
): Promise<SanitizedLesson> {
  const file = zip.file(source.entry);
  if (!file) {
    throw new Error(`Missing lesson file ${source.entry}`);
  }
  const raw = await file.async("nodebuffer");
  const decoded = decodeBrightspaceHtml(raw);
  const $ = cheerio.load(decoded);

  $("script, style, link, meta, title, noscript").remove();
  $("#header, #footer").remove();
  $("font, center").each((_, element) => {
    $(element).replaceWith($(element).contents());
  });

  const $root = $("#content").length > 0 ? $("#content").first() : $("body").first();

  for (const image of $root.find("img").toArray()) {
    const $image = $(image);
    const rawSrc = $image.attr("src") ?? "";
    const resolved = resolveZipPath(zipIndex, source.entry, rawSrc);
    if (!resolved) {
      $image.replaceWith(`<p class="source-note">Image unavailable from source package.</p>`);
      continue;
    }
    const copied = await copyZipFile(zip, resolved, workspaceDir, "assets/imported");
    if (!copied) {
      $image.replaceWith(`<p class="source-note">Image unavailable from source package.</p>`);
      continue;
    }
    $image.attr("src", copied);
    $image.attr("loading", "lazy");
    $image.addClass("source-image");
    if (!$image.attr("alt")) {
      $image.attr("alt", "");
    }
  }

  for (const media of $root.find("audio, video, source, embed").toArray()) {
    const $media = $(media);
    const rawSrc = $media.attr("src") ?? "";
    if (!rawSrc || isExternalHref(rawSrc)) {
      continue;
    }
    const resolved = resolveZipPath(zipIndex, source.entry, rawSrc);
    if (!resolved) {
      $media.remove();
      continue;
    }
    const copied = await copyZipFile(zip, resolved, workspaceDir, "assets/media");
    if (!copied) {
      $media.remove();
      continue;
    }
    $media.attr("src", copied);
    if ($media.is("audio, video")) {
      $media.attr("controls", "controls");
      $media.attr("preload", "metadata");
    }
  }

  const lessonResources: ImportedResource[] = [];
  const externalLinks: ImportedResource[] = [];

  for (const anchor of $root.find("a").toArray()) {
    const $anchor = $(anchor);
    const href = $anchor.attr("href") ?? "";
    const text = normalizeWhitespace($anchor.text()) || "Open source";

    if (!href || href.startsWith("#")) {
      $anchor.replaceWith($anchor.contents());
      continue;
    }

    if (isExternalHref(href)) {
      const resource: ImportedResource = {
        category: "external",
        title: text,
        href,
        sourcePath: href,
        description: `Referenced in ${source.title}.`
      };
      externalLinks.push(resource);
      registerResource(resource);
      $anchor.attr("target", "_blank").attr("rel", "noreferrer");
      continue;
    }

    if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) {
      $anchor.replaceWith($anchor.contents());
      continue;
    }

    const resolved = resolveZipPath(zipIndex, source.entry, href);
    if (!resolved) {
      $anchor.replaceWith($anchor.contents());
      continue;
    }

    const resolvedLessonId = lessonIdByEntry.get(normalizeZipPath(resolved));
    if (resolvedLessonId) {
      $anchor.attr("href", `#${resolvedLessonId}`);
      $anchor.attr("data-page-target", resolvedLessonId);
      continue;
    }

    const copied = await copyZipFile(zip, resolved, workspaceDir, "assets/resources/unit");
    if (!copied) {
      $anchor.replaceWith($anchor.contents());
      continue;
    }

    const resource: ImportedResource = {
      category: "unit",
      title: text,
      href: copied,
      sourcePath: resolved,
      description: `Recovered from ${source.title}.`
    };
    lessonResources.push(resource);
    registerResource(resource);
    $anchor.attr("href", copied).attr("target", "_blank").attr("rel", "noreferrer");
  }

  $root.find("table").addClass("source-table");
  $root.find("*").each((_, element) => {
    const $element = $(element);
    const keep = new Set([
      "href",
      "src",
      "alt",
      "title",
      "target",
      "rel",
      "class",
      "loading",
      "data-page-target",
      "controls",
      "preload",
      "type"
    ]);
    for (const attr of Object.keys(element.attribs ?? {})) {
      if (!keep.has(attr)) {
        $element.removeAttr(attr);
      }
    }
  });

  $root.find("p, div, span").each((_, element) => {
    const text = normalizeWhitespace($(element).text());
    if (/^©?\s*20\d{2}\s+CBe-learn/i.test(text) || /^@20\d{2}\s+CBe-learn/i.test(text)) {
      $(element).remove();
    }
  });

  $root.find("p, div").each((_, element) => {
    const $element = $(element);
    if (normalizeWhitespace($element.text()) === "" && $element.find("img, table, iframe, video, audio").length === 0) {
      $element.remove();
    }
  });

  const text = normalizeWhitespace($root.text());
  const html = renderCleanFallback($root.html() ?? "");
  return {
    id: lessonIdByEntry.get(source.entry) ?? slugify(source.title),
    title: source.title,
    summary: summarize(text, `${source.title} from ${source.group}.`),
    group: source.group,
    entry: source.entry,
    excerpt: text.slice(0, 260),
    html,
    resources: lessonResources,
    externalLinks
  };
}

function renderField(id: string, label: string, placeholder: string, type: "textarea" | "input" = "textarea") {
  if (type === "input") {
    return `<label>${escapeHtml(label)}<input data-response-id="${escapeHtml(id)}" placeholder="${escapeHtml(placeholder)}"></label>`;
  }
  return `<label>${escapeHtml(label)}<textarea data-response-id="${escapeHtml(id)}" placeholder="${escapeHtml(placeholder)}"></textarea></label>`;
}

function renderIssueInquiry(config: IssueConfig) {
  return `<section id="issue-inquiry" class="course-page social-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | ${escapeHtml(config.title)}</p>
    <h2>Issue Inquiry</h2>
    <p class="page-intro">${escapeHtml(config.issueQuestion)}</p>
    <article class="social-document" data-writing-activity-panel>
      <header class="social-document-header">
        <p>${escapeHtml(config.units.join(" + "))}</p>
        <h3>Start With A Position</h3>
        <span>Use this page to record your first thinking before you gather evidence across the unit lessons.</span>
      </header>
      <div class="social-document-body">
        <section class="social-question-grid">
          ${renderField(`${config.slug}:inquiry:initial-position`, "What do I think right now?", "Write your first position on the related issue.")}
          ${renderField(`${config.slug}:inquiry:key-terms`, "Terms I need to define", "List important concepts, ideologies, people, events, or vocabulary.")}
          ${renderField(`${config.slug}:inquiry:evidence-needed`, "What evidence would strengthen or challenge my view?", "Name the types of sources, examples, or perspectives you need.")}
          ${renderField(`${config.slug}:inquiry:course-question`, "How this connects to the course issue", "Connect this related issue to the question of whether we should embrace an ideology.")}
        </section>
        <div class="social-print-actions">
          <button class="external-resource-action" type="button" data-print-writing>Print / PDF</button>
          <span class="save-status" data-save-status>Saved locally</span>
        </div>
      </div>
    </article>
  </section>`;
}

function renderSourceAnalysis(config: IssueConfig) {
  const questions = [
    "What is the source's main message?",
    "Which ideological perspective or principle is most visible?",
    "What detail from the source supports your interpretation?",
    `How does this source connect to ${config.title}?`,
    "What limitation, bias, or context should be considered before using this source as evidence?"
  ];
  return `<section id="source-analysis" class="course-page social-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | Source Work</p>
    <h2>Source Analysis</h2>
    <p class="page-intro">Use this routine for political cartoons, textbook excerpts, charts, images, quotations, and case studies from the lessons.</p>
    <article class="social-document" data-writing-activity-panel>
      <header class="social-document-dark">
        <p>${escapeHtml(config.title)} Critical Analysis</p>
        <h3>Source Response Routine</h3>
        <span>${escapeHtml(config.issueQuestion)}</span>
      </header>
      <div class="social-document-body">
        ${questions
          .map(
            (question, index) => `<div class="worksheet-question">
              <div class="worksheet-question-prompt"><span>${index + 1}.</span><p>${escapeHtml(question)}</p></div>
              <label class="worksheet-answer-field">
                <textarea data-response-id="${escapeHtml(`${config.slug}:source:${index + 1}`)}" placeholder="Type your analytical response here..."></textarea>
              </label>
            </div>`
          )
          .join("\n")}
        <div class="social-print-actions">
          <button class="external-resource-action" type="button" data-print-writing>Print / PDF</button>
          <span class="save-status" data-save-status>Saved locally</span>
        </div>
      </div>
    </article>
  </section>`;
}

function renderPositionBuilder(config: IssueConfig) {
  return `<section id="position-builder" class="course-page social-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | Writing Prep</p>
    <h2>Position Builder</h2>
    <p class="page-intro">Move from evidence to a defensible position. Keep the claim specific, arguable, and connected to the related issue.</p>
    <article class="social-document" data-writing-activity-panel>
      <header class="social-document-header">
        <p>${escapeHtml(config.title)}</p>
        <h3>Build A Position Paper Path</h3>
        <span>${escapeHtml(config.issueQuestion)}</span>
      </header>
      <div class="social-document-body social-sequence">
        ${renderField(`${config.slug}:position:claim`, "Working position", "To what extent? Start with a clear, defensible answer.")}
        ${renderField(`${config.slug}:position:why`, "Why this position is defensible", "Explain the reasoning behind the position before adding examples.")}
        <section class="social-three-column">
          ${renderField(`${config.slug}:position:evidence-1`, "Evidence 1", "Source, lesson, person, event, policy, or historical example.")}
          ${renderField(`${config.slug}:position:evidence-2`, "Evidence 2", "A second piece of evidence that supports or complicates the position.")}
          ${renderField(`${config.slug}:position:evidence-3`, "Evidence 3", "A final example or counterpoint to address.")}
        </section>
        ${renderField(`${config.slug}:position:thesis`, "Refined thesis", "Turn the position into a polished thesis statement.")}
        <div class="social-print-actions">
          <button class="external-resource-action" type="button" data-print-writing>Print / PDF</button>
          <span class="save-status" data-save-status>Saved locally</span>
        </div>
      </div>
    </article>
  </section>`;
}

function renderEvidenceBank(config: IssueConfig) {
  return `<section id="evidence-bank" class="course-page social-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | Evidence</p>
    <h2>Evidence Bank</h2>
    <p class="page-intro">Collect moments you may reuse in source responses, position papers, discussions, and exam-style writing.</p>
    <article class="social-document" data-writing-activity-panel>
      <header class="social-document-header">
        <p>Running Evidence Notebook</p>
        <h3>Save Proof As You Move</h3>
        <span>Record the lesson or source, the evidence, and the reason it matters.</span>
      </header>
      <div class="social-document-body">
        <section class="social-evidence-row">
          ${renderField(`${config.slug}:evidence:source`, "Source or lesson", "Example: Unit 3, Lesson 1 - Liberalism and Canadian Government", "input")}
          ${renderField(`${config.slug}:evidence:concept`, "Concept", "Example: individual rights, collectivism, authoritarianism", "input")}
        </section>
        ${renderField(`${config.slug}:evidence:detail`, "Evidence detail", "Quote, event, policy, image detail, statistic, or source observation.")}
        ${renderField(`${config.slug}:evidence:connection`, "Why it matters", "Explain how this evidence helps answer the related issue question.")}
        ${renderField(`${config.slug}:evidence:counterpoint`, "Possible counterpoint", "What would someone with a different ideological perspective say?")}
        <div class="social-print-actions">
          <button class="external-resource-action" type="button" data-print-writing>Print / PDF</button>
          <span class="save-status" data-save-status>Saved locally</span>
        </div>
      </div>
    </article>
  </section>`;
}

function groupResources(resources: ImportedResource[]) {
  const categories: Array<{ id: ImportedResource["category"]; label: string }> = [
    { id: "textbook", label: "Perspectives Textbook" },
    { id: "unit", label: "Recovered Unit Resources" },
    { id: "student", label: "Student Support Resources" },
    { id: "external", label: "External Lesson Links" }
  ];
  return categories
    .map((category) => ({
      ...category,
      resources: resources.filter((resource) => resource.category === category.id)
    }))
    .filter((category) => category.resources.length > 0);
}

function renderResourcesPage(config: IssueConfig, resources: ImportedResource[]) {
  const grouped = groupResources(resources);
  const firstGroup = grouped[0]?.id ?? "textbook";
  return `<section id="resources" class="course-page social-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | Resources</p>
    <h2>Resources</h2>
    <p class="page-intro">Textbook chapters, recovered Brightspace files, and source links connected to ${escapeHtml(config.title)}.</p>
    <section class="resource-panel">
      <label>Choose a resource group
        <select data-resource-select>
          ${grouped
            .map((group) => `<option value="${escapeHtml(group.id)}"${group.id === firstGroup ? " selected" : ""}>${escapeHtml(group.label)}</option>`)
            .join("\n")}
        </select>
      </label>
    </section>
    ${grouped
      .map(
        (group) => `<section class="social-resource-panel" data-resource-panel="${escapeHtml(group.id)}"${group.id === firstGroup ? "" : " hidden"}>
          <h3>${escapeHtml(group.label)}</h3>
          <div class="social-resource-grid">
            ${group.resources
              .map(
                (resource) => `<article class="resource-card">
                  <p class="social-resource-label">${escapeHtml(resource.category === "external" ? "External Source" : "Recovered Source")}</p>
                  <h3>${escapeHtml(resource.title)}</h3>
                  <p>${escapeHtml(resource.description)}</p>
                  <p class="source-path">${escapeHtml(resource.sourcePath)}</p>
                  <a class="external-resource-action" href="${escapeHtml(resource.href)}" target="_blank" rel="noreferrer">Open Resource</a>
                </article>`
              )
              .join("\n")}
          </div>
        </section>`
      )
      .join("\n")}
  </section>`;
}

function socialExtraCss() {
  return `
.source-content blockquote {
  margin: 22px 0;
  padding: 14px 18px;
  border-left: 3px solid var(--primary);
  background: #fbfcfa;
}
.source-content .source-note {
  margin: 14px 0;
  padding: 12px 14px;
  border: 1px solid var(--surface-muted);
  border-radius: 8px;
  background: #fff;
  color: #4c574b;
}
.social-page .page-intro {
  max-width: 860px;
}
.social-document {
  overflow: hidden;
  margin-top: 28px;
  border: 1px solid var(--surface-muted);
  border-radius: 10px;
  background: #fff;
}
.social-document-header,
.social-document-dark {
  padding: 28px 32px;
}
.social-document-header {
  border-top: 4px solid var(--primary);
  background: #fff;
}
.social-document-dark {
  background: var(--ink-dark);
  color: #fff;
}
.social-document-header p,
.social-document-dark p,
.social-resource-label {
  margin: 0 0 8px;
  color: var(--primary);
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}
.social-document-dark p {
  color: #cce8c7;
}
.social-document-header h3,
.social-document-dark h3 {
  margin: 0;
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: clamp(32px, 4vw, 48px);
  line-height: 1.02;
  letter-spacing: -.035em;
}
.social-document-header span,
.social-document-dark span {
  display: block;
  max-width: 820px;
  margin-top: 10px;
  color: #445044;
  font-size: 18px;
}
.social-document-dark span {
  color: #dce8d8;
}
.social-document-body {
  display: grid;
  gap: 22px;
  padding: 30px 32px 34px;
}
.social-question-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}
.social-sequence {
  gap: 18px;
}
.social-three-column,
.social-evidence-row {
  display: grid;
  gap: 18px;
}
.social-three-column {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.social-evidence-row {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.worksheet-question {
  display: grid;
  gap: 10px;
  padding: 18px 0;
  border-bottom: 1px solid var(--surface-muted);
}
.worksheet-question:last-of-type {
  border-bottom: 0;
}
.worksheet-question-prompt {
  display: grid;
  grid-template-columns: 38px 1fr;
  gap: 10px;
  align-items: start;
}
.worksheet-question-prompt span {
  color: var(--primary);
  font-weight: 800;
}
.worksheet-question-prompt p {
  margin: 0;
}
.worksheet-answer-field {
  margin-left: 48px;
}
.social-print-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  padding-top: 6px;
}
.social-resource-panel {
  margin-top: 18px;
}
.social-resource-panel > h3 {
  margin: 0 0 12px;
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: 28px;
}
.social-resource-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.social-resource-label {
  color: var(--primary);
  letter-spacing: .04em;
}
@media (max-width: 900px) {
  .social-question-grid,
  .social-three-column,
  .social-evidence-row,
  .social-resource-grid {
    grid-template-columns: 1fr;
  }
  .worksheet-answer-field {
    margin-left: 0;
  }
}
@media print {
  body.print-job-active .print-job-root .social-print-actions,
  body.print-job-active .print-job-root .resource-panel {
    display: none !important;
  }
}`;
}

async function addResourceFromZip(
  zip: JSZip,
  workspaceDir: string,
  resourceMap: Map<string, ImportedResource>,
  category: ImportedResource["category"],
  zipPath: string,
  title: string,
  description: string,
  subdir: string
) {
  const normalized = normalizeZipPath(zipPath);
  const key = `${category}:${normalized}`;
  const existing = resourceMap.get(key);
  if (existing) {
    return existing;
  }
  const copied = await copyZipFile(zip, normalized, workspaceDir, subdir);
  if (!copied) {
    return undefined;
  }
  const resource: ImportedResource = {
    category,
    title: cleanTitle(title, path.posix.basename(normalized)),
    href: copied,
    sourcePath: normalized,
    description
  };
  resourceMap.set(key, resource);
  return resource;
}

async function collectResources(zip: JSZip, workspaceDir: string, config: IssueConfig, resourceMap: Map<string, ImportedResource>) {
  for (const textbookFile of config.textbookFiles) {
    const zipPath = normalizeZipPath(`PerspectivesTextbook/${textbookFile}`);
    await addResourceFromZip(
      zip,
      workspaceDir,
      resourceMap,
      "textbook",
      zipPath,
      path.posix.basename(textbookFile, path.posix.extname(textbookFile)),
      "Perspectives on Ideology textbook file.",
      "assets/resources/textbook"
    );
  }

  for (const name of Object.keys(zip.files)) {
    if (zip.files[name].dir) {
      continue;
    }
    const normalized = normalizeZipPath(name);
    const extension = fileExtension(normalized);
    const inSelectedUnit = config.unitPrefixes.some((prefix) => normalized.startsWith(`${prefix}/`));
    const inStudentResources = COMMON_STUDENT_RESOURCE_PREFIXES.some((prefix) => normalized.startsWith(prefix));

    if (inSelectedUnit && UNIT_RESOURCE_EXTENSIONS.has(extension)) {
      await addResourceFromZip(
        zip,
        workspaceDir,
        resourceMap,
        "unit",
        normalized,
        path.posix.basename(normalized, extension),
        "Recovered from the Brightspace unit package.",
        "assets/resources/unit"
      );
    }

    if (inSelectedUnit && SUPPLEMENTAL_HTML_EXTENSIONS.has(extension) && !normalized.match(/\/U\d+(Intro|S\d|S\dL|Summary|summ|intro|chall|challenge)/)) {
      await addResourceFromZip(
        zip,
        workspaceDir,
        resourceMap,
        "unit",
        normalized,
        path.posix.basename(normalized, extension),
        "Supplemental source page recovered from the unit package.",
        "assets/resources/unit"
      );
    }

    if (inStudentResources && UNIT_RESOURCE_EXTENSIONS.has(extension)) {
      await addResourceFromZip(
        zip,
        workspaceDir,
        resourceMap,
        "student",
        normalized,
        path.posix.basename(normalized, extension),
        "Student support resource recovered from the Brightspace export.",
        "assets/resources/student"
      );
    }
  }
}

function uniqueResources(resources: ImportedResource[]) {
  const seen = new Set<string>();
  return resources.filter((resource) => {
    const key = `${resource.category}:${resource.href}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function renderNavItems(config: IssueConfig, resources: ImportedResource[]): NextStepShellNavItem[] {
  return [
    {
      id: "issue-inquiry",
      label: "Issue Inquiry",
      icon: "explore",
      html: renderIssueInquiry(config)
    },
    {
      id: "source-analysis",
      label: "Source Analysis",
      icon: "fact_check",
      html: renderSourceAnalysis(config)
    },
    {
      id: "position-builder",
      label: "Position Builder",
      icon: "edit_note",
      html: renderPositionBuilder(config)
    },
    {
      id: "evidence-bank",
      label: "Evidence Bank",
      icon: "library_books",
      html: renderEvidenceBank(config)
    },
    {
      id: "resources",
      label: "Resources",
      icon: "folder",
      html: renderResourcesPage(config, resources)
    }
  ];
}

async function writeProjectMetadata(slug: string, config: IssueConfig, zipPath: string, lessonCount: number) {
  const projectDir = path.join(ROOT, "projects", slug);
  const now = new Date().toISOString();
  const metadata = {
    id: slug,
    slug,
    sourcePath: zipPath,
    inputKind: "brightspace-zip",
    brightspaceTarget: "scorm",
    previewModes: ["workspace"],
    workspaceEntrypoint: path.join(projectDir, "workspace", "index.html"),
    rawEntrypoint: path.join(projectDir, "raw", "README.md"),
    createdAt: now,
    updatedAt: now,
    migrationState: "migrated",
    projectType: "conversion",
    preferredWorkflows: ["conversion"],
    canonicalEntry: path.join(projectDir, "workspace", "index.html"),
    canonicalSources: [
      path.join(projectDir, "workspace", "index.html"),
      path.join(ROOT, "scripts", "build-social30-related-issues.ts"),
      path.join(ROOT, "scripts", "lib", "next-step-course-shell.ts")
    ],
    generatedOutputs: [],
    regenerateCommand: `npx tsx scripts/build-social30-related-issues.ts --zip "${zipPath}" --only ${slug}`,
    importedFirstPassOrigin: {
      sourceSystem: "brightspace",
      sourcePath: zipPath,
      importedAt: now,
      notes: `${config.title} clean shell generated from Social Studies 30-1 Brightspace units ${config.units.join(" + ")}.`
    },
    exportTargets: [
      {
        target: "scorm",
        enabled: true,
        notes: "SCORM 2004 package for Brightspace upload."
      },
      {
        target: "html",
        enabled: true,
        notes: "Standalone workspace preview."
      }
    ],
    authoringStatus: "active",
    referenceOnly: [zipPath, path.join(projectDir, "raw", "README.md")],
    sourceOfTruthNotes:
      "The shared Brightspace ZIP is not duplicated per issue. Regenerate this workspace through scripts/build-social30-related-issues.ts and the shared Next Step shell.",
    conversionSummary: {
      relatedIssue: config.title,
      issueQuestion: config.issueQuestion,
      units: config.units,
      lessonsRecovered: lessonCount
    }
  };
  await fs.mkdir(path.join(projectDir, "meta"), { recursive: true });
  await fs.writeFile(path.join(projectDir, "meta", "project.json"), `${JSON.stringify(metadata, null, 2)}\n`);
  await fs.writeFile(
    path.join(projectDir, "meta", "conversion-notes.md"),
    `# ${config.title} Conversion Notes\n\n- Source ZIP: ${zipPath}\n- Units included: ${config.units.join(", ")}\n- Lessons recovered: ${lessonCount}\n- Shared shell: scripts/lib/next-step-course-shell.ts\n- Builder: scripts/build-social30-related-issues.ts\n\nThe raw ZIP is referenced rather than duplicated to avoid four large copies of the same Brightspace export.\n`
  );
}

async function buildIssue(zip: JSZip, zipIndex: Map<string, string>, zipPath: string, config: IssueConfig) {
  const projectDir = path.join(ROOT, "projects", config.slug);
  const workspaceDir = path.join(projectDir, "workspace");
  const rawDir = path.join(projectDir, "raw");
  const resourceMap = new Map<string, ImportedResource>();

  await fs.rm(workspaceDir, { recursive: true, force: true });
  await fs.mkdir(path.join(workspaceDir, "assets", "brand"), { recursive: true });
  await fs.mkdir(rawDir, { recursive: true });
  await fs.copyFile(LOGO_SOURCE_PATH, path.join(workspaceDir, "assets", "brand", "nxt-ce-logo-white-with-ce.png"));
  await fs.writeFile(
    path.join(rawDir, "README.md"),
    `# Raw Source\n\nThis project references the shared Brightspace ZIP instead of duplicating it:\n\n${zipPath}\n`
  );

  const lessonSources = await parseManifestLessons(zip, config);
  const lessonIdByEntry = new Map<string, string>();
  lessonSources.forEach((lesson, index) => {
    const unitToken = lesson.unitPrefix.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    lessonIdByEntry.set(normalizeZipPath(lesson.entry), `lesson-${index + 1}-${unitToken}-${slugify(lesson.title)}`);
  });

  const lessons: SanitizedLesson[] = [];
  const registerResource = (resource: ImportedResource) => {
    resourceMap.set(`${resource.category}:${resource.href}`, resource);
  };

  for (const lessonSource of lessonSources) {
    const lesson = await sanitizeLesson(zip, zipIndex, workspaceDir, lessonSource, lessonIdByEntry, registerResource);
    lessons.push(lesson);
  }

  await collectResources(zip, workspaceDir, config, resourceMap);
  const resources = uniqueResources([...resourceMap.values()]).sort((a, b) => {
    const categoryOrder = ["textbook", "unit", "student", "external"];
    return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category) || a.title.localeCompare(b.title);
  });

  const html = renderNextStepCourseShell({
    slug: config.slug,
    courseTitle: `Social Studies 30-1: ${config.title}`,
    courseCode: COURSE_CODE,
    overviewIntro: config.overviewIntro,
    outcomes: [
      `I can explain how ${config.units.join(" and ")} connect to ${config.issueQuestion}`,
      "I can analyze sources for perspective, evidence, bias, and ideological assumptions.",
      "I can collect evidence from lessons and resources to support a defensible position.",
      "I can refine my thinking into a clear Social Studies 30-1 position response."
    ],
    lessons,
    navItems: renderNavItems(config, resources),
    lessonGroupTitle: config.title,
    lessonSequenceTitle: `${config.title} Lesson Sequence`,
    sourceLessonLabel: "imported lessons",
    nextAfterLastLesson: { id: "issue-inquiry", label: "Issue Inquiry" },
    storageKeyBase: `canvas-helper:${config.slug}`,
    extraCss: socialExtraCss()
  });

  await fs.writeFile(path.join(workspaceDir, "index.html"), html);
  await writeProjectMetadata(config.slug, config, zipPath, lessons.length);
  return { slug: config.slug, lessons: lessons.length, resources: resources.length };
}

async function main() {
  const zipPath = getArg("zip", DEFAULT_ZIP_PATH);
  const only = getArg("only");
  const selectedIssues = only ? ISSUES.filter((issue) => issue.slug === only || issue.title.toLowerCase() === only.toLowerCase()) : ISSUES;

  if (selectedIssues.length === 0) {
    throw new Error(`No related issue matched --only ${only}`);
  }

  const zip = await JSZip.loadAsync(await fs.readFile(zipPath));
  const zipIndex = buildZipPathIndex(zip);
  const results = [];
  for (const issue of selectedIssues) {
    results.push(await buildIssue(zip, zipIndex, zipPath, issue));
  }

  for (const result of results) {
    console.log(`${result.slug}: ${result.lessons} lessons, ${result.resources} resources`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
