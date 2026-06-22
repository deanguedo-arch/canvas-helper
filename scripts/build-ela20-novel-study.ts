import fs from "fs/promises";
import path from "path";
import process from "process";
import JSZip from "jszip";
import * as cheerio from "cheerio";

const COURSE_TITLE = "Novel Study";
const COURSE_CODE = "ELA 20-1";
const DEFAULT_SLUG = "ela20-1-novel-study";
const ROOT = process.cwd();
const NEXT_STEP_LOGO_SOURCE_PATH = path.join(
  ROOT,
  "docs",
  "design",
  "next-step",
  "assets",
  "nxt-ce-logo-white-with-ce.png"
);

const LESSON_ORDER = [
  "20-1introtonovelstudy.html",
  "20-1characteristicsofanovel.html",
  "20-1howtoreadanovel.html",
];

const FALLBACK_TITLES: Record<string, string> = {
  "20-1introtonovelstudy.html": "Introduction to Novel Study",
  "20-1characteristicsofanovel.html": "Characteristics of a Novel",
  "20-1howtoreadanovel.html": "How to Read a Novel",
};

interface Args {
  zipPath: string;
  writingPdf?: string;
  slug: string;
}

interface Lesson {
  id: string;
  index: number;
  title: string;
  entryName: string;
  contentHtml: string;
  excerpt: string;
}

interface ResourceItem {
  title: string;
  href: string;
  type: string;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const output: Args = { zipPath: "", slug: DEFAULT_SLUG };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === "--zip" && next) {
      output.zipPath = next;
      i += 1;
    } else if (arg === "--writing-pdf" && next) {
      output.writingPdf = next;
      i += 1;
    } else if (arg === "--slug" && next) {
      output.slug = next;
      i += 1;
    }
  }
  if (!output.zipPath) {
    throw new Error("Missing --zip path");
  }
  return output;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(parseInt(code, 16)));
}

function decodeBuffer(buffer: Buffer): string {
  let text = buffer.toString("utf8");
  const nullCount = (text.match(/\u0000/g) || []).length;
  if (nullCount > Math.max(5, text.length / 20)) {
    text = buffer.toString("utf16le");
  }
  return text
    .replace(/^\uFEFF/, "")
    .replace(/\u0000/g, "")
    .replace(/\uFFFD/g, "")
    .trim();
}

function normalizeEscapedHtml(input: string): string {
  let text = input;
  for (let i = 0; i < 5; i += 1) {
    const looksEscaped = /&(?:amp;)*lt;\s*(?:!doctype|html|head|body|div|p|ul|ol|li|h1|h2|table)/i.test(text)
      || /&nbsp;|&#\d+;|&#x[0-9a-f]+;/i.test(text);
    if (!looksEscaped) break;
    const next = decodeEntities(text);
    if (next === text) break;
    text = next;
  }
  return text;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function textFromHtml(html: string): string {
  return normalizeWhitespace(cheerio.load(html).text());
}

function titleFromDocument($: cheerio.CheerioAPI, fallback: string): string {
  const candidates = [
    $("h1").first().text(),
    $("h2").first().text(),
    $("title").first().text(),
    fallback,
  ];
  for (const candidate of candidates) {
    const cleaned = normalizeWhitespace(decodeEntities(candidate || ""));
    if (cleaned && !/^course resources$/i.test(cleaned)) {
      return cleaned.replace(/^Lesson\s+\d+\s*:\s*/i, "");
    }
  }
  return fallback;
}

function resolveZipPath(entryName: string, rawSrc: string): string | null {
  const cleanSrc = rawSrc.split(/[?#]/)[0].replace(/^\.\//, "");
  if (!cleanSrc || /^(?:https?:|mailto:|data:|#)/i.test(cleanSrc)) return null;
  const base = path.posix.dirname(entryName);
  return path.posix.normalize(path.posix.join(base, cleanSrc));
}

async function copyZipAsset(zip: JSZip, entryName: string, rawSrc: string, assetsDir: string): Promise<string | null> {
  const resolved = resolveZipPath(entryName, rawSrc);
  if (!resolved) return null;
  const file = zip.file(resolved) || zip.file(resolved.replace(/^\.\//, ""));
  if (!file) return null;
  const ext = path.posix.extname(resolved) || ".bin";
  const base = path.posix.basename(resolved, ext);
  const outName = `${slugify(path.posix.dirname(resolved))}-${slugify(base)}${ext.toLowerCase()}`;
  const outPath = path.join(assetsDir, outName);
  await fs.mkdir(assetsDir, { recursive: true });
  await fs.writeFile(outPath, await file.async("nodebuffer"));
  return `assets/imported/${outName}`;
}

async function sanitizeContent(zip: JSZip, entryName: string, html: string, lessonTitle: string, assetsDir: string): Promise<string> {
  let normalized = normalizeEscapedHtml(html).replace(/^\uFEFF/, "").replace(/^\uFFFD+/, "");
  let $ = cheerio.load(normalized, { decodeEntities: false });

  const bodyText = normalizeEscapedHtml($("body").text().trim());
  if (/^[\s\uFEFF\uFFFD]*(?:<!doctype|<html|<head|<body|<div)/i.test(bodyText) && bodyText.includes("<")) {
    normalized = bodyText;
    $ = cheerio.load(normalized, { decodeEntities: false });
  }

  $("script, style, link, meta, title, head, noscript, iframe").remove();
  $(".d2l-navigation, .d2l-page-header, .navbar, .nav, .breadcrumbs, .breadcrumb, .skip-link").remove();

  const root = $("#content").first().length
    ? $("#content").first()
    : $("main").first().length
      ? $("main").first()
      : $("body").first();

  root.find("img").each((_index, element) => {
    const img = $(element);
    const src = img.attr("src") || "";
    if (!src.trim()) {
      img.remove();
    }
  });

  const imageCopies: Array<Promise<void>> = [];
  root.find("img").each((_index, element) => {
    const img = $(element);
    const src = img.attr("src") || "";
    imageCopies.push((async () => {
      const copied = await copyZipAsset(zip, entryName, src, assetsDir);
      if (copied) {
        img.attr("src", copied);
        if (!img.attr("alt")) img.attr("alt", "Novel Study source image");
        img.addClass("source-image");
      } else if (!/^(?:https?:|data:)/i.test(src)) {
        img.remove();
      }
    })());
  });
  await Promise.all(imageCopies);

  root.find("a").each((_index, element) => {
    const link = $(element);
    const href = (link.attr("href") || "").trim();
    if (!href) {
      link.replaceWith(`<span>${escapeHtml(link.text())}</span>`);
      return;
    }
    if (/^(?:https?:|mailto:|#)/i.test(href)) {
      link.attr("target", "_blank");
      link.attr("rel", "noopener");
      return;
    }
    if (/\.html?(?:$|[#?])/i.test(href)) {
      link.replaceWith(`<strong class="internal-link-text">${escapeHtml(link.text())}</strong>`);
      return;
    }
    const resolved = resolveZipPath(entryName, href);
    if (resolved) {
      const normalizedHref = resolved.replace(/^.*?Module\s+6\//i, "");
      link.attr("href", `#${slugify(normalizedHref.replace(/\.html?$/i, ""))}`);
    }
  });

  root.find("font, center").each((_index, element) => {
    const el = $(element);
    el.replaceWith(el.html() || "");
  });

  root.find("p, div, span, li, td, th, blockquote").each((_index, element) => {
    const el = $(element);
    const text = normalizeWhitespace(el.text()).replace(/\u00a9/g, "©");
    if (
      /^please continue to the next page\.?$/i.test(text) ||
      /©\s*2019\s*cbe-?learn/i.test(text) ||
      /^cbe-?learn$/i.test(text)
    ) {
      el.remove();
    }
  });

  root.find("*").each((_index, element: any) => {
    const el = $(element);
    const attrs = Object.keys(element.attribs || {});
    for (const attr of attrs) {
      if (!["href", "src", "alt", "title", "target", "rel", "class", "controls"].includes(attr)) {
        el.removeAttr(attr);
      }
    }
  });

  root.find("h1, h2").each((index, element) => {
    const heading = $(element);
    const text = normalizeWhitespace(heading.text()).replace(/^Lesson\s+\d+\s*:\s*/i, "");
    if (index < 2 && text.toLowerCase() === lessonTitle.toLowerCase()) {
      heading.remove();
    }
  });

  root.find("p, li, h1, h2, h3, h4, td, th, blockquote").each((_index, element) => {
    const el = $(element);
    const htmlValue = el.html() || "";
    el.html(htmlValue.replace(/\u00a0/g, " "));
  });

  let content = root.html() || "";
  content = normalizeEscapedHtml(content)
    .replace(/(?:<p>\s*<\/p>\s*)+/gi, "")
    .replace(/(?:<br\s*\/?>\s*){3,}/gi, "<br><br>")
    .trim();

  let cleanupPass = cheerio.load(`<div id="cleanup-root">${content}</div>`, { decodeEntities: false });
  let removed = true;
  while (removed) {
    removed = false;
    cleanupPass("#cleanup-root")
      .find("div, p, span")
      .each((_index, element) => {
        const el = cleanupPass(element);
        const hasMedia = el.find("img, video, audio, iframe, table, ul, ol").length > 0;
        const text = normalizeWhitespace(el.text());
        if (!hasMedia && !text) {
          el.remove();
          removed = true;
        }
      });
  }
  content = cleanupPass("#cleanup-root").html() || "";

  if (!content || /^\s*(?:<!doctype|<html)/i.test(textFromHtml(content))) {
    content = `<p>${escapeHtml(textFromHtml(normalized))}</p>`;
  }
  return content;
}

async function parseLesson(zip: JSZip, entryName: string, index: number, assetsDir: string): Promise<Lesson> {
  const file = zip.file(entryName);
  if (!file) throw new Error(`Missing lesson entry: ${entryName}`);
  const raw = await file.async("nodebuffer");
  const html = normalizeEscapedHtml(decodeBuffer(raw));
  const $ = cheerio.load(html, { decodeEntities: false });
  const filename = path.posix.basename(entryName);
  const fallback = FALLBACK_TITLES[filename] || `Lesson ${index}`;
  const title = titleFromDocument($, fallback);
  const contentHtml = await sanitizeContent(zip, entryName, html, title, assetsDir);
  const excerpt = textFromHtml(contentHtml).slice(0, 180);
  return {
    id: `lesson-${index}-${slugify(title)}`,
    index,
    title,
    entryName,
    contentHtml,
    excerpt,
  };
}

function lessonKicker(lesson: Lesson): string {
  return `${COURSE_CODE} | Lesson ${lesson.index}`;
}

function icon(name: string): string {
  const paths: Record<string, string> = {
    overview: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    lessons: '<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H20v17H7.5A3.5 3.5 0 0 0 4 22z"/><path d="M4 5.5A3.5 3.5 0 0 0 .5 2H-12v17H.5A3.5 3.5 0 0 1 4 22z" transform="translate(0 0)"/>',
    writing: '<path d="M4 19.5V21h1.5L17.8 8.7l-1.5-1.5L4 19.5z"/><path d="m18.6 7.9 1.5-1.5a1.3 1.3 0 0 0 0-1.8l-.7-.7a1.3 1.3 0 0 0-1.8 0l-1.5 1.5 2.5 2.5z"/><path d="M4 4h10"/><path d="M4 8h8"/>',
    resources: '<path d="M3 6h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 10h18"/>',
  };
  return `<svg class="nav-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.overview}</svg>`;
}

function navLink(href: string, label: string, iconName: string): string {
  return `<a class="course-nav-link" href="${href}">${icon(iconName)}<span class="sidebar-label">${escapeHtml(label)}</span></a>`;
}

function renderTopbar(): string {
  return `
<header class="course-topbar">
  <a class="topbar-logo-link" href="#overview" data-page-target="overview" aria-label="Next Step home">
    <img class="next-step-logo" src="assets/brand/nxt-ce-logo-white-with-ce.png" alt="Next Step Continuing Education">
  </a>
  <div class="top-progress-shell">
    <div class="top-progress-label"><span>COURSE PROGRESS</span><strong id="progress-count">0 / 3 LESSONS&nbsp;&nbsp;0%</strong></div>
    <div class="progress-track"><span id="progress-bar"></span></div>
  </div>
</header>`;
}

function renderSidebar(lessons: Lesson[]): string {
  const lessonLinks = lessons.map((lesson) => `
    <a class="sublesson-link" href="#${lesson.id}">${lesson.index}. ${escapeHtml(lesson.title)}</a>`).join("");

  return `
<aside class="course-sidebar">
  <div class="sidebar-header">
    <div>
      <h1>${escapeHtml(COURSE_TITLE)}</h1>
      <p>${escapeHtml(COURSE_CODE)}</p>
    </div>
    <button class="sidebar-toggle" type="button" aria-label="Toggle navigation"><span></span><span></span></button>
  </div>
  <nav class="sidebar-nav" aria-label="Course navigation">
    ${navLink("#overview", "Overview", "overview")}
    <button class="course-nav-link lessons-toggle" type="button" aria-expanded="true">${icon("lessons")}<span class="sidebar-label">Lessons</span><span class="chevron">⌄</span></button>
    <div class="lesson-subnav" id="lesson-subnav">${lessonLinks}</div>
    ${navLink("#writing", "Writing Studio", "writing")}
    ${navLink("#resources", "Resources", "resources")}
  </nav>
</aside>`;
}

function renderOverview(lessons: Lesson[]): string {
  return `
<section id="overview" class="course-section active">
  <div class="overview-shell">
    <p class="kicker">${escapeHtml(COURSE_CODE)} | Unit Frame</p>
    <h2>${escapeHtml(COURSE_TITLE)}</h2>
    <p class="overview-lede">In this unit, you will review how novels build meaning through character, conflict, setting, plot, point of view, theme, and language. You will use those tools to read longer fiction closely and prepare for critical and personal response writing.</p>
    <h3>I can...</h3>
    <ul class="unit-focus-list">
      <li>read a novel as a deliberately crafted text, not just a sequence of events.</li>
      <li>track how character, setting, conflict, and structure develop over time.</li>
      <li>collect evidence that supports interpretation and critical/analytical writing.</li>
    </ul>
    <div class="stat-row">
      <span><strong id="overview-complete">0/${lessons.length}</strong> lessons complete</span>
      <span>${lessons.length} source lessons</span>
      <span>Brightspace conversion</span>
    </div>
    <a class="primary-button" href="#lessons">Open Lesson Frame</a>
  </div>
</section>`;
}

function renderLessonsPage(lessons: Lesson[]): string {
  const cards = lessons.map((lesson) => `
    <a class="lesson-card" href="#${lesson.id}">
      <span>Lesson ${lesson.index}</span>
      <h3>${escapeHtml(lesson.title)}</h3>
      <p>${escapeHtml(lesson.excerpt)}...</p>
    </a>`).join("");
  return `
<section id="lessons" class="course-section">
  <div class="page-shell">
    <p class="kicker">${escapeHtml(COURSE_CODE)} | Lessons</p>
    <h2>${escapeHtml(COURSE_TITLE)} Lesson Sequence</h2>
    <section class="lesson-group-card">
      <div class="lesson-group-heading">
        <div><span>Lesson Group</span><h3>Novel Reading Foundations</h3></div>
        <button type="button" class="group-toggle" aria-label="Toggle lesson group">−</button>
      </div>
      <div class="lesson-grid">${cards}</div>
    </section>
  </div>
</section>`;
}

function renderLessonDetail(lesson: Lesson, lessons: Lesson[]): string {
  const previous = lessons[lesson.index - 2];
  const next = lessons[lesson.index];
  return `
<section id="${lesson.id}" class="course-section lesson-section" data-lesson-id="${lesson.id}">
  <article class="lesson-detail-panel">
    <p class="kicker">${escapeHtml(lessonKicker(lesson))}</p>
    <h2>${escapeHtml(lesson.title)}</h2>
    <div class="source-content">${lesson.contentHtml}</div>
    <footer class="lesson-footer">
      <div class="lesson-nav-actions">
        ${previous ? `<a class="secondary-button" href="#${previous.id}">Previous</a>` : `<a class="secondary-button" href="#lessons">Lesson Library</a>`}
        ${next ? `<a class="primary-button" href="#${next.id}">Next Lesson</a>` : `<a class="primary-button" href="#writing">Writing Studio</a>`}
      </div>
      <button class="mark-complete" type="button" data-lesson="${lesson.id}">Mark Complete</button>
    </footer>
  </article>
</section>`;
}

function renderWritingStudio(resources: ResourceItem[]): string {
  const guide = resources[0];
  return `
<section id="writing" class="course-section">
  <div class="page-shell">
    <p class="kicker">${escapeHtml(COURSE_CODE)} | Writing Studio</p>
    <h2>Critical / Analytical Writing Studio</h2>
    <p class="page-intro">Use these tools to turn novel reading into clear critical and analytical writing.</p>
    <div class="studio-grid">
      <article class="studio-card">
        <span class="studio-icon">I</span>
        <h3>Thesis Builder</h3>
        <p>Build a defensible claim by connecting a prompt, a character or conflict, an analytical action, and a universal idea.</p>
        <label>Draft thesis<textarea data-save="thesis" placeholder="In the novel, the author suggests..."></textarea></label>
      </article>
      <article class="studio-card">
        <span class="studio-icon">E</span>
        <h3>Evidence Collector</h3>
        <p>Track precise moments from the novel and explain how they support your interpretation.</p>
        <label>Evidence and meaning<textarea data-save="evidence" placeholder="Quotation or moment + what it reveals..."></textarea></label>
      </article>
      <article class="studio-card">
        <span class="studio-icon">P</span>
        <h3>Paragraph Architect</h3>
        <p>Plan a PETAL body paragraph that keeps evidence and analysis working together.</p>
        <label>Paragraph plan<textarea data-save="paragraph" placeholder="Point, evidence, technique, analysis, link..."></textarea></label>
      </article>
    </div>
    ${guide ? `<article class="resource-callout"><div><span>Writing Format Guide</span><h3>${escapeHtml(guide.title)}</h3><p>Use this guide when drafting and revising critical / analytical responses.</p></div><div class="resource-actions"><a class="primary-button" href="${guide.href}" target="_blank" rel="noopener">Open</a><a class="secondary-button" href="${guide.href}" download>Download</a></div></article>` : ""}
  </div>
</section>`;
}

function renderResources(resources: ResourceItem[]): string {
  const items = resources.length ? resources.map((item, index) => `
    <button class="resource-item ${index === 0 ? "active" : ""}" type="button" data-resource="${escapeHtml(item.href)}" data-title="${escapeHtml(item.title)}" data-type="${escapeHtml(item.type)}">
      <span>${index + 1}</span><strong>${escapeHtml(item.title)}</strong><em>${escapeHtml(item.type)}</em>
    </button>`).join("") : `<p>No additional resources were supplied for this conversion.</p>`;
  const first = resources[0];
  return `
<section id="resources" class="course-section">
  <div class="page-shell">
    <p class="kicker">${escapeHtml(COURSE_CODE)} | Resources</p>
    <h2>Resources</h2>
    <div class="library-layout">
      <aside class="resource-list"><h3>Unit Documents</h3>${items}</aside>
      <section class="resource-reader">
        <div><h3 id="resource-title">${first ? escapeHtml(first.title) : "Resources"}</h3><p id="resource-type">${first ? escapeHtml(first.type) : ""}</p></div>
        ${first ? `<iframe id="resource-frame" src="${first.href}" title="${escapeHtml(first.title)}"></iframe><div class="resource-actions"><a id="resource-open" class="primary-button" href="${first.href}" target="_blank" rel="noopener">Open</a><a id="resource-download" class="secondary-button" href="${first.href}" download>Download</a></div>` : ""}
      </section>
    </div>
  </div>
</section>`;
}

function renderCss(): string {
  return `
:root {
  --green: #155608;
  --green-2: #1e6d0d;
  --green-bright: #59a844;
  --ink: #191c1c;
  --muted: #40493b;
  --surface: #f9f9f8;
  --card: #ffffff;
  --highlight: #eaf7e6;
  --tip: #fff0cf;
  --amber: #fdbf3f;
  --line: #dde2dd;
  --sidebar-width: 282px;
  --sidebar-collapsed: 76px;
  --topbar-height: 82px;
  --radius: 16px;
  --shadow: 0 18px 48px rgba(25, 28, 28, 0.08);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--surface);
  color: var(--ink);
  font-family: Aptos, "Helvetica Neue", Helvetica, sans-serif;
  font-size: 18px;
  line-height: 1.65;
}
a { color: var(--green); text-decoration-thickness: 0.08em; text-underline-offset: 0.18em; }
a:hover { color: var(--green-2); }
img, video, iframe { max-width: 100%; }

.course-topbar {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 40;
  height: var(--topbar-height);
  display: grid;
  grid-template-columns: minmax(160px, 1fr) minmax(260px, 420px);
  align-items: center;
  gap: 24px;
  padding: 14px 32px 14px calc(var(--sidebar-width) + 32px);
  background: var(--ink);
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.topbar-logo-link { display: inline-flex; justify-self: center; align-items: center; min-width: 170px; }
.next-step-logo { width: 174px; max-height: 48px; object-fit: contain; display: block; }
.top-progress-shell { display: grid; gap: 6px; align-content: center; }
.top-progress-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.progress-track {
  height: 12px;
  overflow: hidden;
  border: 1px solid rgba(89,168,68,0.7);
  border-radius: 999px;
  background: repeating-linear-gradient(45deg, rgba(89,168,68,0.18) 0 10px, rgba(89,168,68,0.05) 10px 20px);
}
.progress-fill { height: 100%; width: 0%; background: linear-gradient(90deg, #b7efad, var(--green-bright)); border-radius: inherit; transition: width 180ms ease; }

.course-sidebar {
  position: fixed;
  z-index: 50;
  inset: var(--topbar-height) auto 0 0;
  width: var(--sidebar-width);
  overflow-y: auto;
  padding: 28px 18px;
  background: var(--ink);
  color: #fff;
  transition: width 180ms ease;
}
.sidebar-header { display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: start; margin-bottom: 28px; }
.sidebar-title { margin: 0; font-size: 30px; line-height: 1.1; letter-spacing: -0.03em; }
.sidebar-code { margin: 8px 0 0; color: rgba(255,255,255,0.76); font-weight: 700; }
.sidebar-toggle {
  width: 50px;
  height: 50px;
  border: 0;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #fff;
  background: rgba(255,255,255,0.1);
  cursor: pointer;
}
.sidebar-toggle:hover, .sidebar-toggle:focus-visible { outline: 3px solid rgba(89,168,68,0.55); outline-offset: 2px; background: rgba(255,255,255,0.16); }
.course-sidebar nav { display: grid; gap: 6px; }
.course-nav-link, .lesson-toggle {
  width: 100%;
  min-height: 52px;
  display: grid;
  grid-template-columns: 30px 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 12px 14px;
  border: 0;
  border-radius: 10px;
  color: rgba(255,255,255,0.86);
  background: transparent;
  font: inherit;
  font-weight: 800;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}
.course-nav-link:hover, .lesson-toggle:hover, .course-nav-link.active { color: #fff; background: rgba(255,255,255,0.1); }
.course-nav-link.active { box-shadow: inset 4px 0 0 var(--green-bright); }
.nav-svg { width: 26px; height: 26px; opacity: 0.96; }
.chevron { justify-self: end; transition: transform 160ms ease; }
.lesson-toggle[aria-expanded="true"] .chevron { transform: rotate(180deg); }
.lesson-subnav { display: grid; gap: 4px; margin: 4px 0 12px 44px; }
.sublesson-link {
  display: block;
  padding: 8px 10px;
  border-radius: 8px;
  color: rgba(255,255,255,0.82);
  font-size: 14px;
  line-height: 1.35;
  text-decoration: none;
}
.sublesson-link:hover, .sublesson-link.active { color: #fff; background: rgba(255,255,255,0.1); }
body.sidebar-collapsed .course-sidebar { width: var(--sidebar-collapsed); padding-inline: 10px; }
body.sidebar-collapsed .sidebar-title,
body.sidebar-collapsed .sidebar-code,
body.sidebar-collapsed .sidebar-label,
body.sidebar-collapsed .chevron,
body.sidebar-collapsed .lesson-subnav { display: none; }
body.sidebar-collapsed .sidebar-header { display: block; }
body.sidebar-collapsed .course-nav-link,
body.sidebar-collapsed .lesson-toggle { grid-template-columns: 1fr; justify-items: center; padding-inline: 10px; }
body.sidebar-collapsed .course-main { margin-left: var(--sidebar-collapsed); }
body.sidebar-collapsed .course-topbar { padding-left: calc(var(--sidebar-collapsed) + 32px); }

.course-main {
  margin-left: var(--sidebar-width);
  padding-top: var(--topbar-height);
  min-height: 100vh;
  background: #fff;
  transition: margin-left 180ms ease;
}
.course-section { display: none; padding: 72px 32px 96px; }
.course-section.active { display: block; }
.overview-shell, .page-shell, .lesson-detail-panel {
  width: min(900px, 100%);
  margin: 0 auto;
}
.overview-shell { padding: 8px 0 36px; }
.kicker {
  margin: 0 0 10px;
  color: #667064;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.02em;
}
h1, h2, h3 { color: var(--ink); line-height: 1.12; letter-spacing: -0.035em; }
h1 { font-size: clamp(42px, 6vw, 72px); margin: 0 0 24px; }
h2 { font-size: clamp(34px, 4vw, 54px); margin: 0 0 18px; }
h3 { font-size: clamp(24px, 2.5vw, 34px); margin: 34px 0 14px; }
.overview-lede, .page-intro { max-width: 760px; margin: 0 0 28px; color: var(--muted); font-size: 21px; line-height: 1.55; }
.unit-focus-list { list-style: none; margin: 14px 0 34px; padding: 0; display: grid; gap: 12px; }
.unit-focus-list li {
  padding: 16px 20px;
  border-left: 4px solid var(--green);
  background: #f5f6f4;
  color: var(--muted);
}
.stat-row { display: flex; flex-wrap: wrap; gap: 14px; margin: 30px 0; }
.stat-row span {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  padding: 10px 16px;
  border: 1px solid #bec8ba;
  border-radius: 8px;
  background: #fff;
  color: var(--muted);
}
.stat-row strong { color: var(--green); }
.primary-button, .secondary-button, .mark-complete, .resource-open {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  padding: 12px 20px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: var(--green);
  color: #fff;
  font-weight: 900;
  text-decoration: none;
  cursor: pointer;
}
.secondary-button { background: #fff; color: var(--ink); border-color: var(--line); }
.primary-button:hover, .mark-complete:hover, .resource-open:hover { background: var(--green-2); color: #fff; }
.secondary-button:hover { background: #f4f5f3; color: var(--ink); }

.lesson-group-card {
  margin: 32px 0;
  padding: 28px;
  border-radius: 18px;
  background: #fff;
  box-shadow: var(--shadow);
}
.lesson-group-heading { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 20px; }
.lesson-group-heading p { margin: 0; color: var(--green); font-size: 13px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
.lesson-group-heading h3 { margin: 2px 0 0; }
.group-toggle { border: 0; background: transparent; font-size: 28px; font-weight: 900; cursor: pointer; color: var(--ink); }
.lesson-grid { display: grid; gap: 16px; }
.lesson-card {
  display: block;
  padding: 22px 24px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fff;
  color: var(--ink);
  text-decoration: none;
  transition: transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
}
.lesson-card:hover { transform: translateY(-2px); border-color: #b7c4b4; box-shadow: 0 16px 36px rgba(25,28,28,0.08); color: var(--ink); }
.lesson-card .lesson-number { color: var(--green); font-size: 14px; font-weight: 900; }
.lesson-card h3 { margin: 6px 0 8px; font-size: 24px; }
.lesson-card p { margin: 0; color: var(--muted); }

.lesson-detail-panel {
  overflow: hidden;
  border-top: 6px solid var(--green);
  border-radius: 16px;
  background: #f4f5f3;
  box-shadow: var(--shadow);
}
.lesson-hero { padding: 52px clamp(26px, 5vw, 64px) 20px; }
.lesson-hero h1 { margin-bottom: 14px; }
.lesson-hero p { max-width: 760px; margin: 0; color: var(--muted); font-size: 21px; }
.source-content {
  padding: 22px clamp(26px, 5vw, 64px) 46px;
  font-size: 19px;
  color: #202322;
}
.source-content > *:first-child { margin-top: 0; }
.source-content h1, .source-content h2, .source-content h3 { margin-top: 34px; }
.source-content p { margin: 0 0 20px; }
.source-content ul, .source-content ol { margin: 0 0 22px 1.25em; padding-left: 1.2em; }
.source-content li { margin: 8px 0; }
.source-content blockquote,
.source-content .callout,
.source-content .reading-tip {
  margin: 24px 0;
  padding: 18px 22px;
  border-left: 4px solid var(--green);
  background: #fff;
  color: var(--muted);
}
.source-content table { width: 100%; border-collapse: collapse; margin: 24px 0; background: #fff; }
.source-content th, .source-content td { border: 1px solid var(--line); padding: 12px; vertical-align: top; }
.source-content th { color: var(--green); text-align: left; background: var(--highlight); }
.source-content img.source-image, .source-content img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 22px auto;
  border-radius: 10px;
}
.source-content a[href^="../"], .source-content a[href^="/content/"] { color: var(--green); font-weight: 800; }
.source-content pre, .source-content code { white-space: pre-wrap; word-break: break-word; }
.source-links {
  margin-top: 34px;
  padding: 24px;
  border-radius: 12px;
  background: #fff;
}
.source-links h3 { margin-top: 0; }
.source-links-list { display: flex; flex-wrap: wrap; gap: 12px 18px; }
.lesson-footer {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  padding: 24px clamp(26px, 5vw, 64px) 44px;
}
.lesson-nav-actions { display: flex; gap: 12px; flex-wrap: wrap; }

.studio-grid { display: grid; gap: 16px; }
.studio-card, .resource-callout, .resource-reader, .resource-list {
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: #fff;
}
.studio-card h3, .resource-callout h3 { margin-top: 0; }
.studio-icon { color: var(--green); font-weight: 900; }
.resource-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 18px; }
.library-layout { display: grid; grid-template-columns: minmax(250px, 0.9fr) minmax(0, 1.5fr); gap: 22px; align-items: start; }
.resource-item {
  width: 100%;
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 14px;
  align-items: center;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #fff;
  color: var(--ink);
  text-align: left;
  cursor: pointer;
}
.resource-item + .resource-item { margin-top: 10px; }
.resource-item.active { border-color: var(--green); background: var(--highlight); }
.resource-index { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 8px; background: var(--green); color: #fff; font-weight: 900; }
.reader-frame { width: 100%; min-height: 560px; border: 1px solid var(--line); border-radius: 10px; background: #fff; }
.empty-resource { padding: 24px; border: 1px dashed #b8c4b4; border-radius: 10px; color: var(--muted); }

@media (max-width: 980px) {
  :root { --sidebar-width: 240px; }
  .course-topbar { padding-left: calc(var(--sidebar-width) + 20px); grid-template-columns: 1fr; }
  .top-progress-shell { display: none; }
  .library-layout { grid-template-columns: 1fr; }
}
@media (max-width: 760px) {
  .course-topbar { position: sticky; padding: 12px 18px; height: auto; min-height: 68px; }
  .topbar-logo-link { justify-self: start; }
  .next-step-logo { width: 140px; }
  .course-sidebar {
    position: relative;
    inset: auto;
    width: 100%;
    height: auto;
    max-height: none;
    padding: 18px;
  }
  .course-sidebar nav { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sidebar-header { grid-template-columns: 1fr auto; margin-bottom: 16px; }
  .sidebar-title { font-size: 26px; }
  .lesson-subnav { grid-column: 1 / -1; margin-left: 0; }
  .course-main, body.sidebar-collapsed .course-main { margin-left: 0; padding-top: 0; }
  body.sidebar-collapsed .course-sidebar { width: 100%; }
  body.sidebar-collapsed .sidebar-title, body.sidebar-collapsed .sidebar-code, body.sidebar-collapsed .sidebar-label, body.sidebar-collapsed .chevron { display: initial; }
  body.sidebar-collapsed .lesson-subnav { display: grid; }
  body.sidebar-collapsed .course-nav-link, body.sidebar-collapsed .lesson-toggle { grid-template-columns: 30px 1fr auto; justify-items: stretch; }
  .course-section { padding: 40px 18px 72px; }
  .lesson-footer { align-items: stretch; flex-direction: column; }
}
`;
}

function renderScript(lessons: Lesson[], resources: ResourceItem[]): string {
  const lessonIds = lessons.map((lesson) => lesson.id);
  return `
<script>
(function(){
  var lessonIds = ${JSON.stringify(lessonIds)};
  function route(){
    var hash = (window.location.hash || '#overview').slice(1);
    if (!document.getElementById(hash)) hash = 'overview';
    document.querySelectorAll('.course-section').forEach(function(section){ section.classList.toggle('active', section.id === hash); });
    document.querySelectorAll('.course-nav-link[href], .sublesson-link').forEach(function(link){
      var href = (link.getAttribute('href') || '').slice(1);
      link.classList.toggle('active', href === hash);
    });
  }
  function completed(){
    try { return JSON.parse(localStorage.getItem('ela20NovelCompleted') || '[]'); } catch(e){ return []; }
  }
  function saveCompleted(items){ localStorage.setItem('ela20NovelCompleted', JSON.stringify(items)); }
  function updateProgress(){
    var done = completed().filter(function(id){ return lessonIds.indexOf(id) !== -1; });
    var pct = lessonIds.length ? Math.round((done.length / lessonIds.length) * 100) : 0;
    var count = done.length + ' / ' + lessonIds.length + ' LESSONS  ' + pct + '%';
    var progressCount = document.getElementById('progress-count');
    var progressBar = document.getElementById('progress-bar');
    var overviewComplete = document.getElementById('overview-complete');
    if (progressCount) progressCount.textContent = count;
    if (progressBar) progressBar.style.width = pct + '%';
    if (overviewComplete) overviewComplete.textContent = done.length + '/' + lessonIds.length;
    document.querySelectorAll('.mark-complete').forEach(function(button){
      var id = button.getAttribute('data-lesson');
      var isDone = done.indexOf(id) !== -1;
      button.textContent = isDone ? 'Completed' : 'Mark Complete';
      button.classList.toggle('done', isDone);
    });
  }
  window.addEventListener('hashchange', route);
  document.querySelector('.sidebar-toggle')?.addEventListener('click', function(){ document.body.classList.toggle('sidebar-collapsed'); });
  document.querySelector('.lessons-toggle')?.addEventListener('click', function(){
    var subnav = document.getElementById('lesson-subnav');
    if (!subnav) return;
    subnav.classList.toggle('closed');
    this.setAttribute('aria-expanded', String(!subnav.classList.contains('closed')));
  });
  document.querySelectorAll('.mark-complete').forEach(function(button){
    button.addEventListener('click', function(){
      var id = button.getAttribute('data-lesson');
      var items = completed();
      if (items.indexOf(id) === -1) items.push(id); else items = items.filter(function(item){ return item !== id; });
      saveCompleted(items);
      updateProgress();
    });
  });
  document.querySelectorAll('textarea[data-save]').forEach(function(area){
    var key = 'ela20NovelStudio:' + area.getAttribute('data-save');
    area.value = localStorage.getItem(key) || '';
    area.addEventListener('input', function(){ localStorage.setItem(key, area.value); });
  });
  document.querySelectorAll('.resource-item').forEach(function(item){
    item.addEventListener('click', function(){
      document.querySelectorAll('.resource-item').forEach(function(other){ other.classList.remove('active'); });
      item.classList.add('active');
      var href = item.getAttribute('data-resource') || '';
      var title = item.getAttribute('data-title') || 'Resource';
      var type = item.getAttribute('data-type') || '';
      var frame = document.getElementById('resource-frame');
      var titleEl = document.getElementById('resource-title');
      var typeEl = document.getElementById('resource-type');
      var open = document.getElementById('resource-open');
      var download = document.getElementById('resource-download');
      if (frame) frame.setAttribute('src', href);
      if (titleEl) titleEl.textContent = title;
      if (typeEl) typeEl.textContent = type;
      if (open) open.setAttribute('href', href);
      if (download) download.setAttribute('href', href);
    });
  });
  route();
  updateProgress();
})();
</script>`;
}

function renderPage(lessons: Lesson[], resources: ResourceItem[]): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(COURSE_TITLE)} | ${escapeHtml(COURSE_CODE)}</title>
  <style>${renderCss()}</style>
</head>
<body>
  ${renderTopbar()}
  ${renderSidebar(lessons)}
  <main class="course-main">
    ${renderOverview(lessons)}
    ${renderLessonsPage(lessons)}
    ${lessons.map((lesson) => renderLessonDetail(lesson, lessons)).join("\n")}
    ${renderWritingStudio(resources)}
    ${renderResources(resources)}
  </main>
  ${renderScript(lessons, resources)}
</body>
</html>`;
}

async function build(): Promise<void> {
  const args = parseArgs();
  const projectDir = path.join(ROOT, "projects", args.slug);
  const workspaceDir = path.join(projectDir, "workspace");
  const metaDir = path.join(projectDir, "meta");
  const importedAssetsDir = path.join(workspaceDir, "assets", "imported");
  const resourcesDir = path.join(workspaceDir, "assets", "resources");
  const brandDir = path.join(workspaceDir, "assets", "brand");

  await fs.mkdir(workspaceDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });
  await fs.mkdir(importedAssetsDir, { recursive: true });
  await fs.mkdir(resourcesDir, { recursive: true });
  await fs.mkdir(brandDir, { recursive: true });
  await fs.copyFile(NEXT_STEP_LOGO_SOURCE_PATH, path.join(brandDir, "nxt-ce-logo-white-with-ce.png"));

  const zip = await JSZip.loadAsync(await fs.readFile(args.zipPath));
  const entries = zip.file(/\.html?$/i).map((file) => file.name);
  const lessonEntries = LESSON_ORDER.map((name) => entries.find((entry) => entry.toLowerCase().endsWith(name))).filter(Boolean) as string[];
  if (!lessonEntries.length) {
    throw new Error("No Novel Study Module 6 lessons found in the supplied Brightspace export.");
  }

  const lessons: Lesson[] = [];
  for (let i = 0; i < lessonEntries.length; i += 1) {
    lessons.push(await parseLesson(zip, lessonEntries[i], i + 1, importedAssetsDir));
  }

  const resources: ResourceItem[] = [];
  if (args.writingPdf) {
    const target = path.join(resourcesDir, "critical-writing-format-tips.pdf");
    await fs.copyFile(args.writingPdf, target);
    resources.push({
      title: "Critical / Analytical Writing Format Tips",
      href: "assets/resources/critical-writing-format-tips.pdf",
      type: "PDF writing guide",
    });
  }

  await fs.writeFile(path.join(workspaceDir, "index.html"), renderPage(lessons, resources), "utf8");
  await fs.writeFile(path.join(metaDir, "project.json"), JSON.stringify({
    migrationState: "migrated",
    projectType: "conversion",
    preferredWorkflows: ["conversion"],
    canonicalEntry: "projects/ela20-1-novel-study/workspace/index.html",
    canonicalSources: ["scripts/build-ela20-novel-study.ts"],
    authoringStatus: "active",
    exportTargets: ["workspace", "scorm"],
    regenerateCommand: `npx tsx scripts/build-ela20-novel-study.ts --zip ${JSON.stringify(args.zipPath)}${args.writingPdf ? ` --writing-pdf ${JSON.stringify(args.writingPdf)}` : ""} --slug ${args.slug}`,
    sourceOfTruthNotes: "Workspace index.html is regenerated from the Brightspace export through scripts/build-ela20-novel-study.ts. Do not hand-edit raw export files.",
  }, null, 2), "utf8");
  await fs.writeFile(path.join(metaDir, "conversion-notes.md"), `# ${COURSE_TITLE} Conversion Notes\n\n- Source: ${args.zipPath}\n- Workflow: conversion\n- Lessons imported: ${lessons.length}\n- Shell: Next Step Brightspace/D2L conversion standard\n- Cleanup: escaped XHTML decoded, LMS scaffolding stripped, local images copied when present\n`, "utf8");

  console.log(`Built ${COURSE_TITLE} workspace with ${lessons.length} lessons at ${path.join(workspaceDir, "index.html")}`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
