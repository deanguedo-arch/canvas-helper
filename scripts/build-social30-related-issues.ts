import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createHash } from "node:crypto";

import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import JSZip from "jszip";

import { decodeBrightspaceHtml } from "./lib/ela-modern-drama.js";
import { renderNextStepCourseShell, type NextStepShellLesson, type NextStepShellNavItem } from "./lib/next-step-course-shell.js";
import { stageAndPromoteSocialBuild } from "./lib/social-build-staging.js";
import { applyStoredCourseEdits } from "./lib/course-editing/overrides.js";
import {
  resolveSocial30SourceResource,
  SOCIAL30_DEFAULT_RESOURCE_ID,
  type ResolvedSocialSourceResource
} from "./lib/social-resource-manifest.js";

const ROOT = process.cwd();
const COURSE_CODE = "Social Studies 30-1";
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
  renderMode?: "standard-shell" | "inline-d2l" | "palette-shell";
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

const OPTION_ISSUES: IssueConfig[] = [
  {
    ...ISSUES[0],
    slug: "social30-1-related-issue-1-option-2",
    title: "Related Issue 1 (Option Two)",
    shortTitle: "Social RI 1 Option Two",
    renderMode: "palette-shell"
  }
];

const ALL_ISSUES = [...ISSUES, ...OPTION_ISSUES];

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

function hasFlag(name: string) {
  return process.argv.some((argument) => argument === `--${name}` || argument.startsWith(`--${name}=`));
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
    <article class="social-document" data-writing-activity-panel data-evidence-notebook-panel data-evidence-capture="${escapeHtml(`${config.slug}:evidence-notebook`)}" data-evidence-contribution-id="${escapeHtml(`${config.slug}:evidence:notebook`)}">
      <header class="social-document-header">
        <p>Running Evidence Notebook</p>
        <h3>Save Proof As You Move</h3>
        <span>Record the lesson or source, the evidence, and the reason it matters.</span>
      </header>
      <div class="social-document-body">
        <section class="social-evidence-row">
          <label>Source or lesson<input data-response-id="${escapeHtml(`${config.slug}:evidence:source`)}" data-evidence-draft="source" placeholder="Example: Unit 3, Lesson 1 - Liberalism and Canadian Government"></label>
          <label>Concept<input data-response-id="${escapeHtml(`${config.slug}:evidence:concept`)}" data-evidence-draft="concept" placeholder="Example: individual rights, collectivism, authoritarianism"></label>
        </section>
        <label>Evidence detail<textarea data-response-id="${escapeHtml(`${config.slug}:evidence:detail`)}" data-evidence-draft="detail" placeholder="Quote, event, policy, image detail, statistic, or source observation."></textarea></label>
        <label>Why it matters<textarea data-response-id="${escapeHtml(`${config.slug}:evidence:connection`)}" data-evidence-draft="connection" placeholder="Explain how this evidence helps answer the related issue question."></textarea></label>
        <label>Possible counterpoint<textarea data-response-id="${escapeHtml(`${config.slug}:evidence:counterpoint`)}" data-evidence-draft="counterpoint" placeholder="What would someone with a different ideological perspective say?"></textarea></label>
        <div class="social-print-actions">
          <button class="external-resource-action" type="button" data-save-evidence-note>Save to Evidence Bank</button>
          <button class="external-resource-action" type="button" data-print-writing>Print / PDF</button>
          <span class="save-status" data-save-status>Saved locally</span>
        </div>
        <section class="social-evidence-bank" data-evidence-bank-filters>
          <h4>Saved Evidence</h4>
          <div class="social-evidence-bank-list" data-manual-evidence-list>
            <p class="social-empty-state" data-manual-evidence-empty>Use the notebook above to save reusable proof notes here.</p>
          </div>
        </section>
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
.social-evidence-bank {
  display: grid;
  gap: 14px;
  padding-top: 8px;
}
.social-evidence-bank h4 {
  margin: 0;
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: 23px;
}
.social-evidence-bank-list {
  display: grid;
  gap: 12px;
}
.social-lesson-evidence-card {
  padding: 16px;
  border: 1px solid var(--surface-muted);
  border-radius: 8px;
  background: #fff;
}
.social-lesson-evidence-card h4,
.social-lesson-evidence-card p {
  margin: 0;
}
.social-lesson-evidence-card h4 {
  margin-top: 5px;
}
.social-evidence-card-detail {
  margin-top: 10px;
}
.social-evidence-card-detail p {
  margin-top: 4px;
  white-space: pre-wrap;
}
.social-evidence-card-actions {
  margin-top: 12px;
}
.social-empty-state {
  margin: 0;
  color: var(--text-muted);
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

function socialPaletteShellCss() {
  return `
:root {
  --ink: #191C1C;
  --ink-dark: #155608;
  --primary: #155608;
  --primary-strong: #1E6D0D;
  --surface: #FFFFFF;
  --surface-low: #F9F9F8;
  --surface-soft: #EAF7E6;
  --surface-muted: #DDE2DD;
  --surface-variant: #DDE2DD;
  --text-muted: #40493B;
}
body {
  background: #F9F9F8;
  color: #191C1C;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
.course-topbar {
  background: #155608;
  border-bottom: 4px solid #59A844;
}
.topbar-menu-toggle,
.sidebar-toggle-button {
  background: #1E6D0D;
  color: #FFFFFF;
}
.top-progress-meta,
.top-progress-meta strong {
  color: #FFFFFF;
}
.top-progress-bar {
  border-color: #59A844;
  background: #EAF7E6;
}
.top-progress-fill {
  background: #FDBF3F;
}
.course-sidebar {
  background: #155608;
  color: #FFFFFF;
}
.sidebar-header {
  border-bottom: 1px solid #59A844;
}
.sidebar-title,
.sidebar-course-label,
.course-nav-link,
.sublesson-link {
  color: #FFFFFF;
}
.course-nav-link:hover,
.course-nav-link.active {
  background: #EAF7E6;
  color: #155608;
}
.course-nav-link:hover .material-symbols-outlined,
.course-nav-link.active .material-symbols-outlined {
  color: #155608;
}
.sublesson-link:hover,
.sublesson-link.active {
  color: #FDBF3F;
}
.course-main {
  background: #F9F9F8;
}
.course-frame {
  width: min(1200px, calc(100vw - 360px));
}
.course-page > h2,
.lesson-document-header h2,
.resource-lesson-label,
.lesson-card strong,
.source-content h1,
.source-content h2,
.source-content h3,
.social-document-header h3,
.social-document-dark h3,
.work-card h3,
.resource-card h3 {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  letter-spacing: 0;
}
.course-kicker,
.unit-outcomes-lead,
.lesson-document-header p,
.resource-lesson-kicker,
.lesson-card span,
.social-document-header p,
.social-document-dark p,
.social-resource-label,
label {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
.course-page > h2 {
  color: #191C1C;
}
.page-intro,
.lesson-document-header span,
.source-content,
.source-content p,
.lesson-card p {
  color: #40493B;
}
.unit-focus-list li {
  border-left: 5px solid #155608;
  background: #FFFFFF;
  box-shadow: 0 6px 18px #DDE2DD;
}
.completed-pill,
.resource-lesson-group,
.lesson-card,
.lesson-detail-panel,
.work-card,
.resource-panel,
.resource-card,
.social-document {
  border-color: #DDE2DD;
  background: #FFFFFF;
  box-shadow: 0 6px 18px #DDE2DD;
}
.external-resource-action,
.lesson-jump.primary {
  border-color: #155608;
  background: #155608;
  color: #FFFFFF;
}
.lesson-jump,
.completed-pill {
  border-color: #DDE2DD;
  color: #155608;
}
.resource-lesson-summary {
  border-left: 6px solid #1E6D0D;
  background: #FFFFFF;
}
.resource-lesson-group[open] .resource-lesson-summary {
  background: #EAF7E6;
}
.lesson-card:hover {
  border-color: #1E6D0D;
  background: #EAF7E6;
}
.lesson-document-header,
.social-document-header {
  border-top: 6px solid #155608;
  background: #FFFFFF;
}
.lesson-reader-panel {
  background: #F9F9F8;
}
.source-content {
  max-width: 900px;
}
.source-content a {
  color: #155608;
  font-weight: 700;
}
.source-content blockquote,
.source-content .source-note {
  background: #FFF0CF;
  border-left: 6px solid #FDBF3F;
  border-top: 0;
  border-right: 0;
  border-bottom: 0;
  color: #191C1C;
}
.source-table th,
.source-content th {
  background: #155608;
  color: #FFFFFF;
}
.source-table tr:nth-child(even),
.source-content tr:nth-child(even) {
  background: #EAF7E6;
}
textarea,
select,
input {
  border-color: #DDE2DD;
  color: #191C1C;
  background: #FFFFFF;
}
textarea:focus,
select:focus,
input:focus,
button:focus-visible,
a:focus-visible {
  outline: 3px solid #FDBF3F;
  border-color: #155608;
}
.social-document-dark {
  background: #155608;
  border-bottom: 6px solid #59A844;
}
.social-document-dark p,
.social-document-dark span,
.social-document-dark h3 {
  color: #FFFFFF;
}
@media (max-width: 1100px) {
  .course-frame {
    width: min(100%, 900px);
  }
  body:not(.sidebar-collapsed) .course-sidebar {
    background: #155608;
  }
}`;
}

function socialShellCss(config: IssueConfig) {
  return `${socialExtraCss()}\n${config.renderMode === "palette-shell" ? socialPaletteShellCss() : ""}`;
}

function inlineStyle(styles: Record<string, string | number | undefined>) {
  return Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([property, value]) => `${property}: ${value}`)
    .join("; ");
}

function normalizeInlineAltText(value: string | undefined) {
  return normalizeWhitespace(value ?? "")
    .replace(/&quot;/g, '"')
    .replace(/["'“”‘’]/g, "")
    .trim();
}

const d2l = {
  primary: "#155608",
  secondary: "#1E6D0D",
  bright: "#59A844",
  text: "#191C1C",
  muted: "#40493B",
  page: "#F9F9F8",
  card: "#FFFFFF",
  highlight: "#EAF7E6",
  tip: "#FFF0CF",
  amber: "#FDBF3F",
  border: "#DDE2DD"
};

function inlineLessonContent(html: string, lessonTitle: string) {
  const $ = cheerio.load(`<main>${html}</main>`, { xmlMode: false });
  $("script, style, link, meta").remove();

  $("h1").attr(
    "style",
    inlineStyle({
      color: d2l.primary,
      "font-size": "32px",
      "line-height": "1.2",
      margin: "26px 0 12px",
      "font-weight": "800"
    })
  );
  $("h2").attr(
    "style",
    inlineStyle({
      color: d2l.primary,
      "font-size": "26px",
      "line-height": "1.25",
      margin: "24px 0 10px",
      "font-weight": "800"
    })
  );
  $("h3, h4, h5, h6").attr(
    "style",
    inlineStyle({
      color: d2l.text,
      "font-size": "20px",
      "line-height": "1.3",
      margin: "20px 0 8px",
      "font-weight": "800"
    })
  );
  $("p").attr(
    "style",
    inlineStyle({
      color: d2l.text,
      "font-size": "16px",
      "line-height": "1.6",
      margin: "0 0 14px"
    })
  );
  $("ul, ol").attr(
    "style",
    inlineStyle({
      color: d2l.text,
      "font-size": "16px",
      "line-height": "1.6",
      margin: "10px 0 18px 28px",
      padding: "0"
    })
  );
  $("li").attr(
    "style",
    inlineStyle({
      margin: "0 0 8px",
      color: d2l.text
    })
  );
  $("blockquote").attr(
    "style",
    inlineStyle({
      margin: "18px 0",
      padding: "14px 18px",
      "border-left": `6px solid ${d2l.amber}`,
      background: d2l.tip,
      color: d2l.text
    })
  );
  $("table").each((_, table) => {
    $(table).attr(
      "style",
      inlineStyle({
        width: "100%",
        "border-collapse": "collapse",
        margin: "20px 0",
        background: d2l.card,
        color: d2l.text
      })
    );
    $(table)
      .find("tr")
      .each((rowIndex, row) => {
        $(row).attr("style", `background: ${rowIndex % 2 === 0 ? d2l.page : d2l.highlight}`);
      });
  });
  $("th").attr(
    "style",
    inlineStyle({
      padding: "12px",
      border: `1px solid ${d2l.border}`,
      background: d2l.primary,
      color: d2l.card,
      "text-align": "left",
      "vertical-align": "top"
    })
  );
  $("td").attr(
    "style",
    inlineStyle({
      padding: "12px",
      border: `1px solid ${d2l.border}`,
      color: d2l.text,
      "vertical-align": "top"
    })
  );
  $("img").each((_, image) => {
    const $image = $(image);
    if (!normalizeInlineAltText($image.attr("alt"))) {
      $image.attr("alt", `Image from ${lessonTitle}`);
    }
    $image.attr(
      "style",
      inlineStyle({
        "max-width": "100%",
        height: "auto",
        display: "block",
        margin: "16px auto",
        border: `1px solid ${d2l.border}`,
        "border-radius": "8px"
      })
    );
  });
  $("a").each((_, anchor) => {
    const $anchor = $(anchor);
    if ($anchor.attr("href")?.startsWith("#")) {
      $anchor.attr("style", `color: ${d2l.primary}; font-weight: 700`);
    } else {
      $anchor.attr("style", `color: ${d2l.primary}; font-weight: 700; text-decoration: underline`);
      if (!$anchor.attr("target")) {
        $anchor.attr("target", "_blank");
      }
      if (!$anchor.attr("rel")) {
        $anchor.attr("rel", "noreferrer");
      }
    }
  });
  $("audio, video").attr(
    "style",
    inlineStyle({
      width: "100%",
      "max-width": "920px",
      display: "block",
      margin: "16px 0"
    })
  );

  $("*").each((_, element) => {
    const $element = $(element);
    const keep = new Set(["href", "src", "alt", "title", "target", "rel", "loading", "controls", "preload", "type", "style", "id", "aria-label", "aria-labelledby"]);
    const attrs = "attribs" in element ? (element as Element).attribs : {};
    for (const attr of Object.keys(attrs ?? {})) {
      if (!keep.has(attr)) {
        $element.removeAttr(attr);
      }
    }
  });

  return $("main").html() ?? "";
}

function renderInlineTextArea(label: string, placeholder: string) {
  const id = slugify(label);
  return `<label for="${escapeHtml(id)}" style="${inlineStyle({
    display: "block",
    color: d2l.primary,
    "font-weight": "800",
    "margin-bottom": "18px"
  })}">${escapeHtml(label)}
    <textarea id="${escapeHtml(id)}" rows="5" placeholder="${escapeHtml(placeholder)}" style="${inlineStyle({
      display: "block",
      width: "100%",
      "margin-top": "8px",
      padding: "12px",
      border: `1px solid ${d2l.border}`,
      "border-radius": "8px",
      color: d2l.text,
      background: d2l.card,
      "font-family": "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      "font-size": "16px",
      "line-height": "1.6"
    })}"></textarea>
  </label>`;
}

function renderInlineResourceGroups(resources: ImportedResource[]) {
  return groupResources(resources)
    .map(
      (group, index) => `<details${index === 0 ? " open" : ""} style="${inlineStyle({
        background: d2l.card,
        border: `1px solid ${d2l.border}`,
        "border-radius": "10px",
        margin: "16px 0",
        "box-shadow": `0 6px 18px ${d2l.border}`
      })}">
        <summary style="${inlineStyle({
          cursor: "pointer",
          padding: "18px 20px",
          color: d2l.primary,
          "font-size": "20px",
          "font-weight": "800",
          "border-left": `6px solid ${d2l.secondary}`
        })}">${escapeHtml(group.label)}</summary>
        <div style="${inlineStyle({
          display: "grid",
          gap: "14px",
          padding: "0 20px 20px"
        })}">
          ${group.resources
            .map(
              (resource) => `<article style="${inlineStyle({
                padding: "18px",
                border: `1px solid ${d2l.border}`,
                "border-radius": "8px",
                background: d2l.page
              })}">
                <h3 style="${inlineStyle({
                  margin: "0 0 8px",
                  color: d2l.text,
                  "font-size": "20px",
                  "line-height": "1.3"
                })}">${escapeHtml(resource.title)}</h3>
                <p style="${inlineStyle({
                  margin: "0 0 12px",
                  color: d2l.muted,
                  "line-height": "1.6"
                })}">${escapeHtml(resource.description)}</p>
                <a href="${escapeHtml(resource.href)}" target="_blank" rel="noreferrer" style="${inlineStyle({
                  display: "inline-block",
                  padding: "10px 14px",
                  background: d2l.primary,
                  color: d2l.card,
                  "border-radius": "8px",
                  "font-weight": "800",
                  "text-decoration": "none"
                })}">Open Resource</a>
              </article>`
            )
            .join("\n")}
        </div>
      </details>`
    )
    .join("\n");
}

function renderInlineD2LCourseShell(config: IssueConfig, lessons: SanitizedLesson[], resources: ImportedResource[]) {
  const groupedLessons = getIssueLessonGroups(lessons, config.title);
  const containerStyle = inlineStyle({
    "max-width": "1200px",
    margin: "0 auto",
    background: d2l.page,
    color: d2l.text,
    "font-family": "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    "font-size": "16px",
    "line-height": "1.6",
    padding: "0 18px 48px"
  });
  const cardStyle = inlineStyle({
    background: d2l.card,
    border: `1px solid ${d2l.border}`,
    "border-radius": "10px",
    padding: "28px",
    margin: "24px 0",
    "box-shadow": `0 6px 18px ${d2l.border}`
  });
  const buttonStyle = inlineStyle({
    display: "inline-block",
    padding: "10px 14px",
    background: d2l.primary,
    color: d2l.card,
    "border-radius": "8px",
    "font-weight": "800",
    "text-decoration": "none",
    margin: "6px 8px 6px 0"
  });
  const secondaryLinkStyle = inlineStyle({
    display: "inline-block",
    padding: "9px 12px",
    border: `1px solid ${d2l.secondary}`,
    color: d2l.primary,
    background: d2l.card,
    "border-radius": "8px",
    "font-weight": "800",
    "text-decoration": "none",
    margin: "6px 8px 6px 0"
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(COURSE_CODE)} | ${escapeHtml(config.title)}</title>
</head>
<body style="${inlineStyle({
  margin: "0",
  background: d2l.page,
  color: d2l.text,
  "font-family": "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  "font-size": "16px",
  "line-height": "1.6"
})}">
  <a href="#main-content" style="${inlineStyle({
    display: "inline-block",
    margin: "12px",
    padding: "8px 12px",
    background: d2l.amber,
    color: d2l.text,
    "border-radius": "8px",
    "font-weight": "800",
    "text-decoration": "none"
  })}">Skip to content</a>
  <div style="${containerStyle}">
    <header style="${inlineStyle({
      background: d2l.primary,
      color: d2l.card,
      padding: "28px",
      "border-radius": "0 0 12px 12px",
      "border-bottom": `6px solid ${d2l.bright}`
    })}">
      <img src="assets/brand/nxt-ce-logo-white-with-ce.png" alt="Next Step Continuing Education" style="${inlineStyle({
        display: "block",
        width: "140px",
        "max-width": "100%",
        height: "auto",
        margin: "0 0 22px"
      })}">
      <p style="${inlineStyle({
        margin: "0 0 8px",
        color: d2l.card,
        "font-weight": "800"
      })}">${escapeHtml(COURSE_CODE)}</p>
      <h1 style="${inlineStyle({
        margin: "0",
        color: d2l.card,
        "font-size": "42px",
        "line-height": "1.15"
      })}">${escapeHtml(config.title)}</h1>
      <p style="${inlineStyle({
        margin: "14px 0 0",
        color: d2l.card,
        "font-size": "20px",
        "max-width": "900px"
      })}">${escapeHtml(config.issueQuestion)}</p>
    </header>

    <main id="main-content" style="${inlineStyle({ display: "block" })}">
      <section aria-labelledby="overview-title" style="${cardStyle}">
        <h2 id="overview-title" style="${inlineStyle({
          margin: "0 0 12px",
          color: d2l.primary,
          "font-size": "30px",
          "line-height": "1.25"
        })}">Overview</h2>
        <p style="${inlineStyle({
          color: d2l.text,
          margin: "0 0 18px",
          "font-size": "18px"
        })}">${escapeHtml(config.overviewIntro)}</p>
        <div style="${inlineStyle({
          background: d2l.tip,
          "border-left": `6px solid ${d2l.amber}`,
          padding: "16px 18px",
          margin: "18px 0",
          color: d2l.text
        })}">
          <strong>Key idea:</strong> Keep returning to the related issue question as you read, analyze sources, and build your position.
        </div>
        <h3 style="${inlineStyle({
          color: d2l.text,
          "font-size": "22px",
          margin: "22px 0 10px"
        })}">I can...</h3>
        <ul style="${inlineStyle({
          margin: "0 0 18px 22px",
          color: d2l.text,
          "line-height": "1.6"
        })}">
          <li>explain how ${escapeHtml(config.units.join(" and "))} connect to the related issue question: ${escapeHtml(config.issueQuestion)}</li>
          <li>analyze sources for perspective, evidence, bias, and ideological assumptions.</li>
          <li>collect evidence from lessons and resources to support a defensible position.</li>
          <li>refine my thinking into a clear Social Studies 30-1 position response.</li>
        </ul>
        <nav aria-label="Course sections">
          <a href="#lesson-sequence" style="${buttonStyle}">Lesson Sequence</a>
          <a href="#issue-inquiry" style="${secondaryLinkStyle}">Issue Inquiry</a>
          <a href="#source-analysis" style="${secondaryLinkStyle}">Source Analysis</a>
          <a href="#position-builder" style="${secondaryLinkStyle}">Position Builder</a>
          <a href="#evidence-bank" style="${secondaryLinkStyle}">Evidence Bank</a>
          <a href="#resources" style="${secondaryLinkStyle}">Resources</a>
        </nav>
      </section>

      <section id="lesson-sequence" aria-labelledby="lesson-sequence-title" style="${cardStyle}">
        <h2 id="lesson-sequence-title" style="${inlineStyle({
          margin: "0 0 16px",
          color: d2l.primary,
          "font-size": "30px",
          "line-height": "1.25"
        })}">Lesson Sequence</h2>
        ${groupedLessons
          .map(
            (group, groupIndex) => `<details${groupIndex === 0 ? " open" : ""} style="${inlineStyle({
              background: d2l.card,
              border: `1px solid ${d2l.border}`,
              "border-radius": "10px",
              margin: "16px 0"
            })}">
              <summary style="${inlineStyle({
                cursor: "pointer",
                padding: "18px 20px",
                color: d2l.primary,
                "font-size": "22px",
                "font-weight": "800",
                "border-left": `6px solid ${d2l.secondary}`
              })}">${escapeHtml(group.title)}</summary>
              <div style="${inlineStyle({
                padding: "0 20px 20px",
                display: "grid",
                gap: "10px"
              })}">
                ${group.lessons
                  .map(
                    ({ lesson, index }) => `<a href="#${escapeHtml(lesson.id)}" style="${inlineStyle({
                      display: "block",
                      padding: "14px",
                      background: d2l.page,
                      border: `1px solid ${d2l.border}`,
                      "border-radius": "8px",
                      color: d2l.text,
                      "text-decoration": "none"
                    })}"><strong style="color: ${d2l.primary}">Lesson ${index + 1}</strong><br>${escapeHtml(lesson.title)}<br><span style="color: ${d2l.muted}">${escapeHtml(lesson.summary)}</span></a>`
                  )
                  .join("\n")}
              </div>
            </details>`
          )
          .join("\n")}
      </section>

      <section id="lessons" aria-label="Lesson content">
        ${lessons
          .map(
            (lesson, index) => `<article id="${escapeHtml(lesson.id)}" aria-labelledby="${escapeHtml(lesson.id)}-title" style="${cardStyle}">
              <header style="${inlineStyle({
                background: d2l.primary,
                color: d2l.card,
                padding: "18px 20px",
                margin: "-28px -28px 24px",
                "border-radius": "10px 10px 0 0"
              })}">
                <p style="${inlineStyle({ margin: "0 0 6px", color: d2l.card, "font-weight": "800" })}">Lesson ${index + 1}</p>
                <h2 id="${escapeHtml(lesson.id)}-title" style="${inlineStyle({
                  margin: "0",
                  color: d2l.card,
                  "font-size": "30px",
                  "line-height": "1.2"
                })}">${escapeHtml(lesson.title)}</h2>
              </header>
              ${inlineLessonContent(lesson.html, lesson.title)}
              <p style="${inlineStyle({ margin: "24px 0 0" })}"><a href="#lesson-sequence" style="${secondaryLinkStyle}">Back to Lesson Sequence</a></p>
            </article>`
          )
          .join("\n")}
      </section>

      <section id="issue-inquiry" aria-labelledby="issue-inquiry-title" style="${cardStyle}">
        <h2 id="issue-inquiry-title" style="${inlineStyle({ color: d2l.primary, margin: "0 0 12px", "font-size": "30px" })}">Issue Inquiry</h2>
        <p style="${inlineStyle({ color: d2l.muted, margin: "0 0 18px" })}">Use this page to record your first thinking before you gather evidence across the unit lessons.</p>
        ${renderInlineTextArea("What do I think right now?", "Write your first position on the related issue.")}
        ${renderInlineTextArea("Terms I need to define", "List important concepts, ideologies, people, events, or vocabulary.")}
        ${renderInlineTextArea("What evidence would strengthen or challenge my view?", "Name the types of sources, examples, or perspectives you need.")}
      </section>

      <section id="source-analysis" aria-labelledby="source-analysis-title" style="${cardStyle}">
        <h2 id="source-analysis-title" style="${inlineStyle({ color: d2l.primary, margin: "0 0 12px", "font-size": "30px" })}">Source Analysis</h2>
        ${["What is the source's main message?", "Which ideological perspective or principle is most visible?", "What detail from the source supports your interpretation?", `How does this source connect to ${config.title}?`, "What limitation, bias, or context should be considered before using this source as evidence?"]
          .map((question) => renderInlineTextArea(question, "Type your analytical response here."))
          .join("\n")}
      </section>

      <section id="position-builder" aria-labelledby="position-builder-title" style="${cardStyle}">
        <h2 id="position-builder-title" style="${inlineStyle({ color: d2l.primary, margin: "0 0 12px", "font-size": "30px" })}">Position Builder</h2>
        ${renderInlineTextArea("Working position", "To what extent? Start with a clear, defensible answer.")}
        ${renderInlineTextArea("Evidence that supports the position", "Source, lesson, person, event, policy, or historical example.")}
        ${renderInlineTextArea("Possible counterpoint", "What would someone with a different ideological perspective say?")}
        ${renderInlineTextArea("Refined thesis", "Turn the position into a polished thesis statement.")}
      </section>

      <section id="evidence-bank" aria-labelledby="evidence-bank-title" style="${cardStyle}">
        <h2 id="evidence-bank-title" style="${inlineStyle({ color: d2l.primary, margin: "0 0 12px", "font-size": "30px" })}">Evidence Bank</h2>
        ${renderInlineTextArea("Source or lesson", "Example: Unit 1, Lesson 2 - Exploring Beliefs and Values.")}
        ${renderInlineTextArea("Evidence detail", "Quote, event, policy, image detail, statistic, or source observation.")}
        ${renderInlineTextArea("Why it matters", "Explain how this evidence helps answer the related issue question.")}
      </section>

      <section id="resources" aria-labelledby="resources-title" style="${cardStyle}">
        <h2 id="resources-title" style="${inlineStyle({ color: d2l.primary, margin: "0 0 12px", "font-size": "30px" })}">Resources</h2>
        <p style="${inlineStyle({ color: d2l.muted, margin: "0 0 18px" })}">Textbook chapters, recovered Brightspace files, and source links connected to ${escapeHtml(config.title)}.</p>
        ${renderInlineResourceGroups(resources)}
      </section>
    </main>
  </div>
</body>
</html>`;
}

function getIssueLessonGroups(lessons: NextStepShellLesson[], fallbackTitle: string) {
  const groups = new Map<string, { title: string; lessons: Array<{ lesson: NextStepShellLesson; index: number }> }>();
  lessons.forEach((lesson, index) => {
    const title = lesson.group?.trim() || fallbackTitle;
    const existing = groups.get(title) ?? { title, lessons: [] };
    existing.lessons.push({ lesson, index });
    groups.set(title, existing);
  });
  return Array.from(groups.values());
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

async function writeBuildMetadata(
  stageMetaDir: string,
  config: IssueConfig,
  sourceResource: ResolvedSocialSourceResource,
  lessonCount: number,
  resourceCount: number
) {
  const now = new Date().toISOString();
  const isInlineD2L = config.renderMode === "inline-d2l";
  const isPaletteShell = config.renderMode === "palette-shell";
  const renderMode = isInlineD2L
    ? "inline-d2l-next-step-palette"
    : isPaletteShell
      ? "next-step-palette-shell"
      : "standard-next-step-shell";
  const metadata = {
    schemaVersion: 1,
    projectSlug: config.slug,
    generatedAt: now,
    builder: "scripts/build-social30-related-issues.ts",
    resource: {
      id: sourceResource.id,
      path: sourceResource.path,
      sha256: sourceResource.sha256,
      availability: sourceResource.availability
    },
    units: config.units,
    lessonsRecovered: lessonCount,
    resourcesRecovered: resourceCount,
    renderMode
  };
  await fs.writeFile(path.join(stageMetaDir, "social-build.json"), `${JSON.stringify(metadata, null, 2)}\n`);
  await fs.writeFile(
    path.join(stageMetaDir, "conversion-notes.md"),
    `# ${config.title} Conversion Notes\n\n- Source resource ID: ${sourceResource.id}\n- Source ZIP: ${sourceResource.path}\n- Source availability: ${sourceResource.availability}\n- Source checksum: ${sourceResource.sha256}\n- Units included: ${config.units.join(", ")}\n- Lessons recovered: ${lessonCount}\n- Resources recovered: ${resourceCount}\n- Render mode: ${isInlineD2L ? "Inline CSS Brightspace/D2L redesign option" : isPaletteShell ? "Shared Next Step course shell with alternate palette styling" : "Shared Next Step course shell"}\n${isInlineD2L ? "" : "- Shared shell: scripts/lib/next-step-course-shell.ts\n"}- Builder: scripts/build-social30-related-issues.ts\n\nThe source ZIP is named and checksum-verified through projects/resources/social30-1-related-issues/resource-manifest.json. This build never rewrites raw source or meta/project.json.\n`
  );
}

async function buildIssue(
  zip: JSZip,
  zipIndex: Map<string, string>,
  sourceResource: ResolvedSocialSourceResource,
  config: IssueConfig
) {
  const projectDir = path.join(ROOT, "projects", config.slug);
  let summary: { slug: string; lessons: number; resources: number } | undefined;
  await stageAndPromoteSocialBuild({
    projectDir,
    async buildStage({ stageWorkspaceDir, stageMetaDir }) {
      const workspaceDir = stageWorkspaceDir;
      const resourceMap = new Map<string, ImportedResource>();
      await fs.mkdir(path.join(workspaceDir, "assets", "brand"), { recursive: true });
      await fs.copyFile(LOGO_SOURCE_PATH, path.join(workspaceDir, "assets", "brand", "nxt-ce-logo-white-with-ce.png"));

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

      const renderedHtml =
        config.renderMode === "inline-d2l"
          ? renderInlineD2LCourseShell(config, lessons, resources)
          : renderNextStepCourseShell({
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
              extraCss: socialShellCss(config)
            });

      const html = await applyStoredCourseEdits({ repoRoot: ROOT, projectSlug: config.slug, html: renderedHtml });
      await fs.writeFile(path.join(workspaceDir, "index.html"), html);
      await writeBuildMetadata(stageMetaDir, config, sourceResource, lessons.length, resources.length);
      summary = { slug: config.slug, lessons: lessons.length, resources: resources.length };
    }
  });
  if (!summary) {
    throw new Error(`Social build did not produce a summary for ${config.slug}.`);
  }
  return summary;
}

async function main() {
  if (hasFlag("zip")) {
    throw new Error("--zip is no longer supported. Use a declared --resource ID instead.");
  }
  const resourceId = getArg("resource", SOCIAL30_DEFAULT_RESOURCE_ID);
  const only = getArg("only");
  const selectedIssues = only
    ? ALL_ISSUES.filter((issue) => issue.slug === only || issue.title.toLowerCase() === only.toLowerCase())
    : ISSUES;

  if (selectedIssues.length === 0) {
    throw new Error(`No related issue matched --only ${only}`);
  }

  const sourceResource = await resolveSocial30SourceResource({ repoRoot: ROOT, resourceId });
  const zip = await JSZip.loadAsync(await fs.readFile(sourceResource.absolutePath));
  const zipIndex = buildZipPathIndex(zip);
  const results = [];
  for (const issue of selectedIssues) {
    results.push(await buildIssue(zip, zipIndex, sourceResource, issue));
  }

  for (const result of results) {
    console.log(`${result.slug}: ${result.lessons} lessons, ${result.resources} resources`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
