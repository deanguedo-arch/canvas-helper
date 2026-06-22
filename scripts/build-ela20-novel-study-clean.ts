import fs from "fs/promises";
import path from "path";
import process from "process";
import JSZip from "jszip";
import * as cheerio from "cheerio";
import { renderNextStepCourseShell } from "./lib/next-step-course-shell.js";

const ROOT = process.cwd();
const DEFAULT_SLUG = "ela20-1-novel-study-clean";
const COURSE_TITLE = "Novel Study";
const COURSE_CODE = "ELA 20-1";
const SOURCE_ZIP =
  "/Users/deanguedo/Downloads/D2LExport_6668_CBE System ELA 20-1 (Winter 2020)_202661808 (1).zip";
const NEXT_STEP_LOGO_SOURCE_PATH = path.join(
  ROOT,
  "docs",
  "design",
  "next-step",
  "assets",
  "nxt-ce-logo-white-with-ce.png"
);

const LESSON_SOURCES = [
  {
    id: "lesson-1-novel-unit-introduction",
    entry: "novel_study/novel_unit_introduction.html",
    title: "Novel Unit Introduction",
    summary: "Set the purpose for the unit and prepare to track how a novel builds meaning over time.",
  },
  {
    id: "lesson-3-characteristics-of-a-novel",
    entry: "Module 6/20-1characteristicsofanovel.html",
    title: "Characteristics of a Novel",
    summary: "Review the major features of novels: plot, character, point of view, setting, conflict, and theme.",
  },
  {
    id: "lesson-4-how-to-read-a-novel",
    entry: "Module 6/20-1howtoreadanovel.html",
    title: "How to Read a Novel",
    summary: "Use active reading routines to notice patterns, questions, character change, and important passages.",
  },
];

const NOVEL_QUESTION_SECTIONS = [
  {
    id: "section-1",
    title: "Section 1 Questions",
    subtitle: "Answer after reading the first third of your novel.",
    questions: [
      {
        id: "begin",
        text: "How does the novel begin?",
        hint: "Describe the opening situation, mood, setting, and any first conflict or question the author creates.",
      },
      {
        id: "major-characters",
        text: "Who are the major characters and what are their relationships to each other?",
        hint: "Name the central characters and explain how they are connected, not just who they are.",
      },
      {
        id: "initial-conflict",
        text: "What is the initial conflict?",
        hint: "Look for the problem, pressure, or tension that starts moving the story forward.",
      },
      {
        id: "suspense",
        text: "What method does the author use to create suspense?",
        hint: "Consider unanswered questions, danger, pacing, foreshadowing, withheld information, or unstable relationships.",
      },
      {
        id: "point-of-view",
        text: "What is the point of view? Who is telling the story?",
        hint: "Identify the narrator and explain how that perspective shapes what the reader knows or feels.",
      },
      {
        id: "minor-characters",
        text: "What minor characters are introduced in the novel?",
        hint: "Include characters who may not lead the plot but still affect conflict, setting, or the protagonist.",
      },
      {
        id: "like-dislike",
        text: "Are there any characters you particularly like or dislike? Explain.",
        hint: "Support your reaction with a specific action, decision, line of dialogue, or relationship.",
      },
      {
        id: "developing-themes",
        text: "What themes do you see being developed?",
        hint: "Move beyond one-word topics. Explain what the novel may be suggesting about people, choices, or society.",
      },
      {
        id: "prediction",
        text: "Make a prediction as to what you believe will happen in the next section of the book.",
        hint: "Base the prediction on evidence from conflict, character goals, or foreshadowing.",
      },
    ],
  },
  {
    id: "section-2",
    title: "Section 2 Questions",
    subtitle: "Answer after reading the middle third of your novel.",
    questions: [
      {
        id: "conflict-change",
        text: "Has the conflict changed? Explain.",
        hint: "Describe whether the original conflict has intensified, shifted, or revealed a deeper problem.",
      },
      {
        id: "shared-problem",
        text: "Are all the characters facing the same problem?",
        hint: "Compare at least two characters and explain how their pressures are similar or different.",
      },
      {
        id: "protagonist-decision",
        text: "Discuss one important decision the protagonist has made.",
        hint: "Name the decision, explain the motivation, and describe the consequence or likely consequence.",
      },
      {
        id: "author-style",
        text: "Discuss the author's style: foreshadowing, flashbacks, changing point of view, and other choices.",
        hint: "Choose one or two techniques and explain their effect on the reader.",
      },
      {
        id: "continuing-suspense",
        text: "Discuss how the author is continuing to create suspense.",
        hint: "Look for complications, uncertainty, secrets, delayed answers, or rising stakes.",
      },
      {
        id: "surprise",
        text: "Has anything happened to surprise you? Explain.",
        hint: "Describe the moment and explain why it challenged your expectations.",
      },
      {
        id: "character-development",
        text: "How is the author developing the characters? Is it by telling us about them, by telling us what others say about them, or by telling us what the characters say about themselves?",
        hint: "Use one character as an example and connect the technique to what you learn about that character.",
      },
      {
        id: "prediction-accuracy",
        text: "How accurate have your predictions been so far?",
        hint: "Compare your earlier prediction to what actually happened and explain what you learned about the author's direction.",
      },
      {
        id: "final-prediction",
        text: "Make a final prediction for the end of the book.",
        hint: "Use current conflict, character choices, and repeated patterns to make a defensible prediction.",
      },
    ],
  },
  {
    id: "section-3",
    title: "Section 3 Questions",
    subtitle: "Answer after finishing your novel.",
    questions: [
      {
        id: "setting-influence",
        text: "What overall influence did the setting have on the events of the novel and the characters?",
        hint: "Explain how time, place, social conditions, or atmosphere shaped choices and conflict.",
      },
      {
        id: "dynamic-static",
        text: "Were the characters dynamic or static? Explain.",
        hint: "Identify who changed or stayed the same and support your answer with specific evidence.",
      },
      {
        id: "elapsed-time",
        text: "Approximately how much time elapses in the book?",
        hint: "Estimate the story's timeline and mention any jumps, flashbacks, or compressed time.",
      },
      {
        id: "important-theme",
        text: "What themes were developed? Which one do you feel was the most important one?",
        hint: "Choose the strongest theme and explain how the novel develops it from beginning to end.",
      },
      {
        id: "takeaway",
        text: "What will you take away from your reading of the book?",
        hint: "Connect your takeaway to a character, conflict, theme, or repeated idea from the novel.",
      },
      {
        id: "criticism-recommendation",
        text: "Make a criticism or recommendation for the novel.",
        hint: "Evaluate the novel thoughtfully by naming a strength, limitation, audience, or reason for your recommendation.",
      },
    ],
  },
];

type Args = {
  zipPath: string;
  slug: string;
};

type Lesson = {
  id: string;
  entry: string;
  title: string;
  summary: string;
  html: string;
  excerpt: string;
};

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const parsed: Args = { zipPath: SOURCE_ZIP, slug: DEFAULT_SLUG };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === "--zip" && next) {
      parsed.zipPath = next;
      i += 1;
    } else if (arg === "--slug" && next) {
      parsed.slug = next;
      i += 1;
    }
  }
  return parsed;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function scriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
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

function normalizeWhitespace(value: string): string {
  return decodeEntities(value).replace(/\s+/g, " ").trim();
}

function isSourceNoise(value: string): boolean {
  return (
    /^please continue to the next page/i.test(value) ||
    /^click next/i.test(value) ||
    /^content$/i.test(value) ||
    /^course resources$/i.test(value) ||
    /^@?\s*(?:©|&copy;)?\s*2019\s+CBe-learn(?:\s*-\s*Calgary Board of Education)?\.?$/i.test(value) ||
    /^@?\s*2019\s+CBe-learn(?:\s*-\s*Calgary Board of Education)?\.?$/i.test(value)
  );
}

function decodeBuffer(buffer: Buffer): string {
  let text = buffer.toString("utf8");
  const nullCount = (text.match(/\u0000/g) || []).length;
  if (nullCount > Math.max(5, text.length / 20)) text = buffer.toString("utf16le");
  return text.replace(/^\uFEFF/, "").replace(/\u0000/g, "").replace(/\uFFFD/g, "");
}

function resolveZipPath(entryName: string, rawSrc: string): string | null {
  const cleanSrc = rawSrc.split(/[?#]/)[0].replace(/^\.\//, "");
  if (!cleanSrc || /^(?:https?:|mailto:|data:|#)/i.test(cleanSrc)) return null;
  return path.posix.normalize(path.posix.join(path.posix.dirname(entryName), cleanSrc));
}

async function copyZipAsset(zip: JSZip, entryName: string, rawSrc: string, assetsDir: string): Promise<string | null> {
  const resolved = resolveZipPath(entryName, rawSrc);
  if (!resolved) return null;
  const file = zip.file(resolved) || zip.file(resolved.replace(/^\.\//, ""));
  if (!file) return null;
  const ext = path.posix.extname(resolved) || ".bin";
  const base = path.posix.basename(resolved, ext);
  const outName = `${slugify(path.posix.dirname(resolved))}-${slugify(base)}${ext.toLowerCase()}`;
  await fs.mkdir(assetsDir, { recursive: true });
  await fs.writeFile(path.join(assetsDir, outName), await file.async("nodebuffer"));
  return `assets/imported/${outName}`;
}

async function sanitizeContent(zip: JSZip, entryName: string, html: string, lessonTitle: string, assetsDir: string): Promise<string> {
  const $ = cheerio.load(html);
  $("script, style, link, meta, title, head, noscript").remove();
  $(".d2l-navigation, .d2l-page-header, .navbar, .nav, .breadcrumbs, .breadcrumb, .skip-link").remove();

  const root = $("#content").first().length ? $("#content").first() : $("body").first();
  const copyJobs: Array<Promise<void>> = [];
  root.find("img").each((_index, element) => {
    const img = $(element);
    const src = img.attr("src") || "";
    copyJobs.push(
      (async () => {
        const copied = await copyZipAsset(zip, entryName, src, assetsDir);
        if (copied) {
          img.attr("src", copied);
          img.attr("alt", img.attr("alt") || "Novel study image");
          img.addClass("source-image");
        } else if (!/^(?:https?:|data:)/i.test(src)) {
          img.remove();
        }
      })()
    );
  });
  await Promise.all(copyJobs);

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
      link.replaceWith(`<strong class="source-note">${escapeHtml(link.text())}</strong>`);
      return;
    }
  });

  root.find("font, center").each((_index, element) => {
    const el = $(element);
    el.replaceWith(el.html() || "");
  });

  root.find("blockquote").each((_index, element) => {
    const quote = $(element);
    quote.replaceWith(`<div class="source-callout">${quote.html() || ""}</div>`);
  });

  root.find("*").each((_index, element: any) => {
    const el = $(element);
    for (const attr of Object.keys(element.attribs || {})) {
      if (!["href", "src", "alt", "title", "target", "rel", "class"].includes(attr)) el.removeAttr(attr);
    }
  });

  root.find("h1, h2").each((index, element) => {
    const heading = $(element);
    const text = normalizeWhitespace(heading.text());
    if (index < 2 && text.toLowerCase() === lessonTitle.toLowerCase()) heading.remove();
  });

  root.find("p, div, span, li, td, th").each((_index, element) => {
    const el = $(element);
    const text = normalizeWhitespace(el.text());
    if (isSourceNoise(text)) el.remove();
  });

  root.find("p, div, span").each((_index, element) => {
    const el = $(element);
    if (normalizeWhitespace(el.text()) === "" && el.find("img, iframe, video, audio, table").length === 0) el.remove();
  });

  root.find("ul > ul, ol > ol").each((_index, element) => {
    const nested = $(element);
    nested.parent().append(nested.children());
    nested.remove();
  });

  root.find("table").each((_index, element) => {
    const table = $(element);
    table.addClass("source-table");
  });

  return root.html()?.trim() || `<p>${escapeHtml(normalizeWhitespace($.text()))}</p>`;
}

async function loadLessons(zip: JSZip, assetsDir: string): Promise<Lesson[]> {
  const lessons: Lesson[] = [];
  for (const source of LESSON_SOURCES) {
    const file = zip.file(source.entry);
    if (!file) throw new Error(`Missing Novel Study source file: ${source.entry}`);
    const raw = decodeBuffer(await file.async("nodebuffer"));
    const sanitized = await sanitizeContent(zip, source.entry, raw, source.title, assetsDir);
    const excerpt = normalizeWhitespace(cheerio.load(sanitized).text()).slice(0, 170);
    lessons.push({
      id: source.id,
      entry: source.entry,
      title: source.title,
      summary: source.summary,
      html: sanitized,
      excerpt,
    });
  }
  return lessons;
}

function renderTopbar(lessonCount = LESSON_SOURCES.length) {
  return `<header class="topbar">
    <button id="topbar-menu-toggle" class="icon-button mobile-only" type="button" aria-label="Toggle sidebar"><span class="material-symbols-rounded">dock_to_left</span></button>
    <img class="topbar-logo" src="assets/brand/nxt-ce-logo-white-with-ce.png" alt="Next Step Continuing Education">
    <div class="progress-widget" aria-label="Course progress">
      <span>Course progress</span>
      <strong><span data-progress-count-inline>0/${lessonCount}</span> lessons</strong>
      <div class="progress-track"><div data-progress-fill></div></div>
    </div>
  </header>`;
}

function renderSidebar(lessons: Lesson[]) {
  return `<aside class="course-sidebar">
    <div class="sidebar-header">
      <h1>Novel Study</h1>
      <p>${COURSE_CODE}</p>
      <button id="sidebar-toggle" class="icon-button" type="button" aria-label="Toggle sidebar"><span class="material-symbols-rounded">dock_to_left</span></button>
    </div>
    <nav aria-label="Course navigation">
      <a class="course-nav-link" href="#overview" data-page-target="overview"><span class="material-symbols-rounded">dashboard</span><span class="sidebar-label">Overview</span></a>
      <div class="lessons-nav">
        <a class="course-nav-link lessons-toggle" href="#lessons" data-page-target="lessons" data-lessons-toggle aria-expanded="false" aria-controls="lesson-subnav"><span class="material-symbols-rounded">menu_book</span><span class="sidebar-label">Lessons</span><span class="material-symbols-rounded lessons-toggle-icon">expand_more</span></a>
        <div id="lesson-subnav" class="lesson-subnav">
          ${lessons
            .map(
              (lesson, index) =>
                `<a href="#${lesson.id}" data-page-target="${lesson.id}"><span>${index + 1}.</span> ${escapeHtml(lesson.title)}</a>`
            )
            .join("")}
        </div>
      </div>
      <a class="course-nav-link" href="#reading-guide" data-page-target="reading-guide"><span class="material-symbols-rounded">auto_stories</span><span class="sidebar-label">Reading Guide</span></a>
      <a class="course-nav-link" href="#writing" data-page-target="writing"><span class="material-symbols-rounded">edit_note</span><span class="sidebar-label">Writing Studio</span></a>
      <a class="course-nav-link" href="#resources" data-page-target="resources"><span class="material-symbols-rounded">folder_open</span><span class="sidebar-label">Resources</span></a>
    </nav>
  </aside>`;
}

function renderOverview(lessons: Lesson[]) {
  return `<section id="overview" class="course-page">
    <p class="course-kicker">${COURSE_CODE} | Novel Study</p>
    <h2>Novel Study</h2>
    <p class="page-intro">Build a practical reading routine for a full-length novel: track characters, follow conflict, collect evidence, and prepare for analytical writing.</p>
    <div class="outcomes-block">
      <h3>I can...</h3>
      <div class="outcome-stack">
        <p>I can read a novel with purpose and track meaning as it develops.</p>
        <p>I can explain how character, conflict, setting, and symbols work as patterns.</p>
        <p>I can use notes and quotations from a novel to support stronger written responses.</p>
      </div>
    </div>
    <div class="overview-actions" aria-label="Novel Study progress and actions">
      <span class="completed-pill"><strong data-progress-count>0 / ${lessons.length}</strong> lessons complete</span>
      <span class="completed-pill">${lessons.length} source lessons</span>
      <a class="button primary" href="#${lessons[0]?.id}" data-page-target="${lessons[0]?.id}">Open Lesson Frame</a>
    </div>
  </section>`;
}

function renderLessonsIndex(lessons: Lesson[]) {
  return `<section id="lessons" class="course-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | Lessons</p>
    <h2>Novel Study Lesson Sequence</h2>
    <div class="resource-stack">
      <details class="resource-lesson-group" open>
        <summary class="resource-lesson-summary">
          <span>
            <span class="resource-lesson-kicker">Lesson Group</span>
            <strong>Novel Study</strong>
          </span>
          <span class="resource-lesson-icon" aria-hidden="true">+</span>
        </summary>
        <div class="lesson-index">
          ${lessons
            .map(
              (lesson, index) => `<a class="lesson-card" href="#${lesson.id}" data-page-target="${lesson.id}">
                <span>Lesson ${index + 1}</span>
                <strong>${escapeHtml(lesson.title)}</strong>
                <p>${escapeHtml(lesson.summary)}</p>
                <em>Open lesson</em>
              </a>`
            )
            .join("")}
        </div>
      </details>
    </div>
  </section>`;
}

function renderLesson(lesson: Lesson, lessons: Lesson[], index: number) {
  const next = lessons[index + 1];
  return `<section id="${lesson.id}" class="course-page lesson-shell" hidden>
    <article class="lesson-document">
      <header class="lesson-header">
        <div>
          <p class="course-kicker">Lesson ${index + 1}</p>
          <h2>${escapeHtml(lesson.title)}</h2>
          <p>${escapeHtml(lesson.summary)}</p>
        </div>
      </header>
      <div class="lesson-reader-panel">
        <div class="lesson-body">${lesson.html}</div>
        <footer class="lesson-actions">
          <a class="button" href="#lessons" data-page-target="lessons">Lesson Library</a>
          ${next ? `<a class="button primary" href="#${next.id}" data-page-target="${next.id}">Next Lesson</a>` : `<a class="button primary" href="#reading-guide" data-page-target="reading-guide">Reading Guide</a>`}
          <button class="button primary mark-complete complete-action" type="button" data-complete-id="${lesson.id}">Complete</button>
        </footer>
      </div>
    </article>
  </section>`;
}

function renderReadingGuide() {
  return `<section id="reading-guide" class="course-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | Reading Guide</p>
    <h2>Novel Reading Guide</h2>
    <p class="page-intro">Use this guide while reading your selected novel. Track the moments that keep returning, then turn those notes into evidence for analytical writing.</p>
    <div class="guide-grid">
      ${[
        [
          "Reading plan",
          "Set a pace and decide what to watch for before you read.",
          "reading-plan",
          "Novel title, reading schedule, and first questions...",
        ],
        [
          "Character map",
          "Track who changes, who resists change, and who creates pressure.",
          "character-map",
          "Character names, goals, relationships, and page evidence...",
        ],
        [
          "Conflict tracker",
          "Follow the problem that keeps returning and how it becomes more complicated.",
          "conflict-tracker",
          "Conflict, turning points, consequences, and page numbers...",
        ],
        [
          "Passage log",
          "Collect quotations or moments that feel important enough to return to.",
          "passage-log",
          "Quotation or moment, page number, context, and why it matters...",
        ],
        [
          "Theme builder",
          "Move from repeated patterns toward a defensible theme statement.",
          "theme-builder",
          "Pattern noticed, insight about people or choices, possible theme...",
        ],
      ]
        .map(
          ([title, prompt, id, placeholder]) => `<article class="work-card">
            <h3>${title}</h3>
            <p>${prompt}</p>
            <label>Reading notes<textarea rows="7" data-response-id="${id}" placeholder="${placeholder}"></textarea></label>
          </article>`
        )
        .join("")}
    </div>
  </section>`;
}

function renderNovelStudyQuestions(slug = DEFAULT_SLUG) {
  const defaultSection = NOVEL_QUESTION_SECTIONS[0];
  const sectionOptions = NOVEL_QUESTION_SECTIONS.map(
    (section) => `<option value="${escapeHtml(section.id)}">${escapeHtml(section.title)}</option>`
  ).join("");
  const questionPanels = NOVEL_QUESTION_SECTIONS.map(
    (section, sectionIndex) => `<article class="novel-question-panel" data-novel-question-panel="${escapeHtml(section.id)}" data-panel-title="${escapeHtml(section.title)}" data-panel-subtitle="${escapeHtml(section.subtitle)}" ${sectionIndex === 0 ? "" : "hidden"}>
      <header class="novel-question-document-header">
        <p>ELA 20-1 Formative Reading</p>
        <h3 data-novel-question-title>${escapeHtml(section.title)}</h3>
        <span data-novel-question-subtitle>${escapeHtml(section.subtitle)}</span>
        <div class="novel-question-progress">
          <div><span>Formative Progress</span><strong data-novel-question-progress-label>0 of ${section.questions.length} answered</strong></div>
          <div class="novel-question-progress-track"><div data-novel-question-progress-fill></div></div>
        </div>
      </header>
      <div class="novel-question-list">
        ${section.questions
          .map(
            (question, questionIndex) => `<div class="novel-question-item">
              <div class="novel-question-prompt">
                <strong>${questionIndex + 1}.</strong>
                <span>${escapeHtml(question.text)}</span>
              </div>
              <div class="novel-question-hint" data-novel-question-hint hidden><strong>Teacher Hint:</strong> ${escapeHtml(question.hint)}</div>
              <label class="novel-answer-field">
                <textarea rows="5" data-novel-question-answer="${escapeHtml(`${section.id}-${question.id}`)}" placeholder="Type your analytical response here..."></textarea>
                <span class="novel-word-count">0 words</span>
              </label>
            </div>`
          )
          .join("")}
      </div>
    </article>`
  ).join("");

  return `<section id="novel-study-questions" class="course-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | Novel Study Questions</p>
    <h2>Novel Study Questions</h2>
    <p class="page-intro">Complete these formative questions after each third of your selected novel. Use specific evidence from the text whenever possible.</p>
    <div class="novel-question-studio" data-novel-question-studio>
      <div class="novel-question-controls">
        <label for="novel-question-section-select">Choose a section</label>
        <select id="novel-question-section-select" data-novel-question-section-select>
          ${sectionOptions}
        </select>
      </div>
      <div class="novel-question-toolbar">
        <span class="novel-question-save-status" data-novel-question-save-status></span>
        <button type="button" data-novel-question-toggle-hints><span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> Show Hints</button>
        <button type="button" data-novel-question-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
      </div>
      <div class="novel-question-document">
        ${questionPanels}
        <section class="novel-question-synthesis">
          <h3>Critical Analytical Essay Prep</h3>
          <p>After finishing the novel, use your section answers to prepare for the critical analytical essay.</p>
          <label class="novel-answer-field">
            <span>Working thesis</span>
            <textarea rows="5" data-novel-question-answer="essay-working-thesis" placeholder="Draft a thesis about the novel's most important idea..."></textarea>
            <span class="novel-word-count">0 words</span>
          </label>
          <label class="novel-answer-field">
            <span>Evidence plan</span>
            <textarea rows="6" data-novel-question-answer="essay-evidence-plan" placeholder="List 2-3 moments, quotations, or character choices you could use as evidence..."></textarea>
            <span class="novel-word-count">0 words</span>
          </label>
        </section>
      </div>
    </div>
    <script>
(() => {
  const root = document.querySelector("[data-novel-question-studio]");
  if (!root) return;
  const storageKey = "canvas-helper:${escapeHtml(slug)}:responses";
  const select = root.querySelector("[data-novel-question-section-select]");
  const saveStatus = root.querySelector("[data-novel-question-save-status]");
  let hintsVisible = false;
  let saveTimer = null;
  function readResponses(){
    try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { return {}; }
  }
  function writeResponses(values){
    localStorage.setItem(storageKey, JSON.stringify(values));
  }
  function wordCount(value){
    return String(value || "").trim().split(/\\s+/).filter(Boolean).length;
  }
  function updateFieldCount(field){
    const countNode = field.closest(".novel-answer-field")?.querySelector(".novel-word-count");
    if (countNode) countNode.textContent = wordCount(field.value) + " words";
  }
  function activePanel(){
    return root.querySelector('[data-novel-question-panel]:not([hidden])');
  }
  function updateProgress(){
    const panel = activePanel();
    if (!panel) return;
    const fields = Array.from(panel.querySelectorAll("[data-novel-question-answer]"));
    const answered = fields.filter((field) => String(field.value || "").trim()).length;
    const total = fields.length;
    const label = panel.querySelector("[data-novel-question-progress-label]");
    const fill = panel.querySelector("[data-novel-question-progress-fill]");
    if (label) label.textContent = answered + " of " + total + " answered";
    if (fill) fill.style.width = total ? Math.round((answered / total) * 100) + "%" : "0%";
  }
  function restoreResponses(){
    const responses = readResponses();
    root.querySelectorAll("[data-novel-question-answer]").forEach((field) => {
      const key = field.getAttribute("data-novel-question-answer");
      field.value = key ? responses[key] || "" : "";
      updateFieldCount(field);
    });
    updateProgress();
  }
  function setSection(sectionId){
    root.querySelectorAll("[data-novel-question-panel]").forEach((panel) => {
      panel.hidden = panel.getAttribute("data-novel-question-panel") !== sectionId;
    });
    root.querySelectorAll("[data-novel-question-hint]").forEach((hint) => {
      hint.hidden = !hintsVisible;
    });
    updateProgress();
  }
  select?.addEventListener("change", () => setSection(select.value));
  root.addEventListener("click", (event) => {
    const hintsButton = event.target.closest("[data-novel-question-toggle-hints]");
    if (hintsButton) {
      hintsVisible = !hintsVisible;
      hintsButton.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> ' + (hintsVisible ? "Hide Hints" : "Show Hints");
      root.querySelectorAll("[data-novel-question-hint]").forEach((hint) => { hint.hidden = !hintsVisible; });
    }
    if (event.target.closest("[data-novel-question-print]")) window.print();
  });
  root.addEventListener("input", (event) => {
    const field = event.target.closest("[data-novel-question-answer]");
    if (!field) return;
    const key = field.getAttribute("data-novel-question-answer");
    if (!key) return;
    const responses = readResponses();
    responses[key] = field.value;
    writeResponses(responses);
    updateFieldCount(field);
    updateProgress();
    if (saveStatus) {
      saveStatus.textContent = "Saving...";
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => { saveStatus.textContent = "Saved locally"; }, 700);
    }
  });
  if (select) select.value = "${escapeHtml(defaultSection.id)}";
  restoreResponses();
  setSection(select?.value || "${escapeHtml(defaultSection.id)}");
})();
    </script>
  </section>`;
}

function renderWritingStudio() {
  return `<section id="writing" class="course-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | Writing Studio</p>
    <h2>Novel Study Writing Studio</h2>
    <p class="page-intro">Turn reading notes into a clear analytical response. Build from claim to evidence to explanation, then check the paragraph for precision.</p>
    <div class="studio-layout">
      <article class="work-card">
        <h3>Controlling idea</h3>
        <p>Make a claim that can be argued, not just observed.</p>
        <label>What does the novel suggest about people, choices, conflict, or change?<textarea rows="5" data-response-id="controlling-idea" placeholder="Draft one arguable idea in a complete sentence..."></textarea></label>
      </article>
      <article class="work-card">
        <h3>Evidence bank</h3>
        <label>Quotation or moment 1<textarea rows="4" data-response-id="evidence-one" placeholder="Add quotation or moment, page number, speaker, and context..."></textarea></label>
        <label>Quotation or moment 2<textarea rows="4" data-response-id="evidence-two" placeholder="Add a second piece of evidence that develops or complicates the idea..."></textarea></label>
        <label>Why these details fit together<textarea rows="4" data-response-id="evidence-connection" placeholder="Explain the pattern these two details create..."></textarea></label>
      </article>
      <article class="work-card">
        <h3>Paragraph builder</h3>
        <label>Analytical paragraph<textarea rows="10" data-response-id="paragraph-builder" placeholder="Write a full paragraph: claim, evidence, explanation, second evidence, deeper explanation, concluding insight..."></textarea></label>
      </article>
      <article class="work-card">
        <h3>Revision check</h3>
        <label class="check-row"><input type="checkbox" data-response-id="revision-claim"> My claim is arguable and specific.</label>
        <label class="check-row"><input type="checkbox" data-response-id="revision-evidence"> My evidence includes page references or clear context.</label>
        <label class="check-row"><input type="checkbox" data-response-id="revision-analysis"> My explanation says how the evidence proves the claim.</label>
        <label class="check-row"><input type="checkbox" data-response-id="revision-polish"> I checked sentence clarity and formal tone.</label>
      </article>
      <article class="work-card">
        <h3>Print / PDF</h3>
        <p>Open a clean print view of your saved notes and draft.</p>
        <button class="button primary" type="button" data-print-writing>Print / PDF</button>
        <p class="save-status" data-save-status>Saved locally</p>
      </article>
    </div>
  </section>`;
}

function renderResources(lessons: Lesson[]) {
  return `<section id="resources" class="course-page" hidden>
    <p class="course-kicker">${COURSE_CODE} | Resources</p>
    <h2>Course Resources</h2>
    <p class="page-intro">Jump back to the imported lesson frames and source references without losing your reading or writing notes.</p>
    <div class="resource-panel">
      <label for="resource-select">Choose a source lesson</label>
      <select id="resource-select" data-resource-select>
        ${lessons.map((lesson) => `<option value="${lesson.id}">${escapeHtml(lesson.title)}</option>`).join("")}
      </select>
    </div>
    ${lessons
      .map(
        (lesson, index) => `<article class="resource-card" data-resource-panel="${lesson.id}" ${index === 0 ? "" : "hidden"}>
          <h3>${escapeHtml(lesson.title)}</h3>
          <p>${escapeHtml(lesson.summary)}</p>
          <p class="source-path">Imported from ${escapeHtml(lesson.entry)}</p>
          <a class="button" href="#${lesson.id}" data-page-target="${lesson.id}">Open lesson</a>
        </article>`
      )
      .join("")}
  </section>`;
}

function buildHtml(lessons: Lesson[], slug = DEFAULT_SLUG) {
  return renderNextStepCourseShell({
    slug,
    courseTitle: COURSE_TITLE,
    courseCode: COURSE_CODE,
    overviewIntro:
      "Build a practical reading routine for a full-length novel: track characters, follow conflict, collect evidence, and prepare for analytical writing.",
    outcomes: [
      "I can read a novel with purpose and track meaning as it develops.",
      "I can explain how character, conflict, setting, and symbols work as patterns.",
      "I can use notes and quotations from a novel to support stronger written responses.",
    ],
    lessons,
    lessonGroupTitle: "Novel Study",
    lessonSequenceTitle: "Novel Study Lesson Sequence",
    sourceLessonLabel: "source lessons",
    nextAfterLastLesson: { id: "reading-guide", label: "Reading Guide" },
    navItems: [
      { id: "reading-guide", label: "Reading Guide", icon: "auto_stories", html: renderReadingGuide() },
      {
        id: "novel-study-questions",
        label: "Novel Study Questions",
        icon: "quiz",
        html: renderNovelStudyQuestions(slug),
      },
      { id: "writing", label: "Writing Studio", icon: "edit_note", html: renderWritingStudio() },
      { id: "resources", label: "Resources", icon: "folder_open", html: renderResources(lessons) },
    ],
    extraCss: `
.source-callout {
  margin: 0 0 1.25rem;
  padding: 18px 20px;
  border-left: 3px solid var(--primary);
  background: #fff;
}
.source-callout > :first-child { margin-top: 0; }
.source-callout > :last-child { margin-bottom: 0; }
.source-content .CentreAlign { text-align: center; }
.source-content .Rounded { border-radius: 8px; }
.check-row {
  display: flex;
  grid-template-columns: none;
  gap: 10px;
  align-items: flex-start;
  margin: 10px 0;
  color: #202520;
  font-family: "Work Sans", "Aptos", sans-serif;
  font-weight: 500;
}
.check-row input {
  width: 18px;
  height: 18px;
  margin-top: 3px;
  accent-color: var(--primary);
}
.novel-question-studio { margin-top: 28px; }
.novel-question-controls {
  display: grid;
  gap: 8px;
  max-width: 520px;
}
.novel-question-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin: 16px 0 12px;
}
.novel-question-toolbar button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #c5c9c1;
  border-radius: 8px;
  background: #fff;
  color: var(--primary);
  padding: 9px 12px;
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-weight: 700;
  cursor: pointer;
}
.novel-question-save-status {
  min-width: 92px;
  color: #5d6359;
  font-size: 14px;
}
.novel-question-document {
  overflow: hidden;
  border: 1px solid var(--surface-muted);
  border-radius: 10px;
  background: #fff;
}
.novel-question-document-header {
  padding: 28px;
  background: #161a17;
  color: #fff;
}
.novel-question-document-header p {
  margin: 0 0 10px;
  color: #b9c3b2;
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 13px;
  font-weight: 700;
}
.novel-question-document-header h3 {
  margin: 0;
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: clamp(30px, 4vw, 48px);
  line-height: 1.05;
  font-weight: 800;
}
.novel-question-document-header > span {
  display: block;
  margin-top: 8px;
  color: #d7ddd4;
  font-size: 18px;
}
.novel-question-progress {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid rgba(255,255,255,.16);
}
.novel-question-progress > div:first-child {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #d7ddd4;
  font-size: 14px;
}
.novel-question-progress-track {
  height: 8px;
  margin-top: 8px;
  border-radius: 999px;
  background: #293029;
  overflow: hidden;
}
.novel-question-progress-track div {
  width: 0;
  height: 100%;
  background: #9fcf93;
}
.novel-question-list { padding: 26px 28px 0; }
.novel-question-item { margin-bottom: 26px; }
.novel-question-prompt {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
  margin-bottom: 10px;
  font-size: 17px;
  line-height: 1.55;
}
.novel-question-prompt strong { color: var(--primary); }
.novel-question-hint {
  margin: 0 0 12px 44px;
  padding: 12px;
  border: 1px solid #d5d8cc;
  border-radius: 8px;
  background: #fbfaf0;
  color: #514d33;
  font-size: 14px;
}
.novel-answer-field {
  display: grid;
  gap: 8px;
  margin-left: 44px;
}
.novel-answer-field span {
  color: var(--primary);
  font-family: "IBM Plex Sans", "Aptos", sans-serif;
  font-size: 14px;
  font-weight: 700;
}
.novel-answer-field textarea {
  width: 100%;
  min-height: 118px;
  border: 1px solid #c5c9c1;
  border-radius: 8px;
  background: #f8f9fa;
  padding: 12px;
  font-family: "Work Sans", "Aptos", sans-serif;
  font-size: 15px;
  line-height: 1.55;
  resize: vertical;
}
.novel-answer-field textarea:focus {
  outline: 2px solid rgba(21,66,18,.18);
  border-color: var(--primary);
  background: #fff;
}
.novel-word-count {
  justify-self: end;
  color: #747a70;
  font-size: 12px;
}
.novel-question-synthesis {
  margin: 28px;
  padding: 24px;
  border-radius: 10px;
  background: #161a17;
  color: #fff;
}
.novel-question-synthesis h3 {
  margin: 0 0 8px;
  font-family: "Hanken Grotesk", "Aptos Display", sans-serif;
  font-size: 26px;
  font-weight: 800;
}
.novel-question-synthesis p { color: #d7ddd4; }
.novel-question-synthesis .novel-answer-field {
  margin-left: 0;
  margin-top: 18px;
}
.novel-question-synthesis .novel-answer-field span { color: #cfe8c7; }
.novel-question-synthesis textarea {
  border-color: #3b4639;
  background: #222822;
  color: #fff;
}
@media (max-width: 680px) {
  .novel-question-toolbar { justify-content: flex-start; }
  .novel-question-list { padding: 22px 18px 0; }
  .novel-question-prompt { grid-template-columns: 28px minmax(0, 1fr); }
  .novel-answer-field,
  .novel-question-hint { margin-left: 38px; }
  .novel-question-synthesis { margin: 18px; }
}
`,
  });
}

function buildLegacyHtml(lessons: Lesson[]) {
  const lessonIds = lessons.map((lesson) => lesson.id);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${COURSE_CODE} | ${COURSE_TITLE}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded" rel="stylesheet">
  <style>
    :root { --ink:#171b17; --muted:#4f5a4f; --green:#154f1c; --green-2:#0f3d17; --line:#d7dfd1; --paper:#fbfbf7; --soft:#f4f6f0; --sidebar:#171b1b; --sidebar-soft:#2e3332; --white:#fff; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--white); font-family: "Atkinson Hyperlegible", ui-sans-serif, sans-serif; font-size: 17px; line-height: 1.55; }
    a { color: inherit; }
    .topbar { position: fixed; inset: 0 0 auto 0; z-index: 50; height: 72px; display: flex; align-items: center; justify-content: center; padding: 10px 24px; background: #171b1b; color: white; border-bottom: 1px solid rgba(255,255,255,.12); }
    .topbar-logo { position: absolute; left: 50%; transform: translateX(-50%); height: 43px; }
    .progress-widget { position: absolute; right: 24px; width: min(320px, 34vw); font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: .02em; }
    .progress-widget strong { display: block; text-align: right; color: #c8f5bc; }
    .progress-track { height: 9px; background: #223022; border: 1px solid #375a37; border-radius: 999px; overflow: hidden; }
    .progress-track div { width: 0; height: 100%; background: #75b86e; transition: width .15s ease; }
    .progress-track.large { height: 12px; margin: 12px 0 18px; }
    .course-sidebar { position: fixed; z-index: 40; top: 72px; bottom: 0; left: 0; width: 288px; overflow-y: auto; overflow-x: hidden; background: var(--sidebar); color: #f5f7f1; border-right: 1px solid rgba(0,0,0,.2); }
    .sidebar-header { position: relative; padding: 26px 22px 18px; border-bottom: 1px solid rgba(255,255,255,.08); }
    .sidebar-header h1 { margin: 0; font-size: 28px; line-height: 1.1; }
    .sidebar-header p { margin: 6px 0 0; color: #d5dbd2; }
    .icon-button { border: 0; border-radius: 8px; min-width: 42px; min-height: 42px; display: inline-grid; place-items: center; background: var(--sidebar-soft); color: white; cursor: pointer; }
    .sidebar-header .icon-button { position: absolute; right: 16px; top: 16px; }
    .mobile-only { display: none; }
    nav { display: grid; gap: 6px; padding: 14px 12px 28px; }
    .course-nav-link { display: flex; align-items: center; gap: 12px; min-height: 48px; padding: 10px 12px; border-radius: 8px; color: #f5f7f1; text-decoration: none; font-weight: 700; }
    .course-nav-link:hover, .course-nav-link.active { background: #303432; }
    .lessons-toggle-icon { margin-left: auto; }
    .lesson-subnav { display: none; padding: 8px 8px 8px 48px; }
    .lessons-nav.is-open .lesson-subnav { display: grid; gap: 6px; }
    .lesson-subnav a { display: block; color: #eef3eb; text-decoration: none; font-size: 14px; padding: 8px 0; }
    body.sidebar-collapsed .course-sidebar { width: 80px; }
    body.sidebar-collapsed .sidebar-label, body.sidebar-collapsed .sidebar-header h1, body.sidebar-collapsed .sidebar-header p, body.sidebar-collapsed .lesson-subnav, body.sidebar-collapsed .lessons-toggle-icon { display: none; }
    body.sidebar-collapsed .lessons-nav.is-open .lesson-subnav { display: none !important; }
    body.sidebar-collapsed .sidebar-header { padding: 14px; }
    body.sidebar-collapsed .sidebar-header .icon-button { position: static; }
    body.sidebar-collapsed .course-main { margin-left: 80px; }
    .course-main { margin: 72px 0 0 288px; min-height: calc(100vh - 72px); }
    .course-frame { width: min(1120px, calc(100vw - 360px)); margin: 0 auto; padding: 44px 28px 72px; }
    .course-page > h2, .lesson-header h2 { margin: 0; font-size: clamp(36px, 5vw, 54px); line-height: 1.03; letter-spacing: -.035em; }
    .course-kicker { margin: 0 0 8px; color: var(--muted); font-weight: 700; }
    .page-intro, .lesson-header p { max-width: 760px; margin: 12px 0 0; font-size: 21px; color: #3f473f; }
    .guide-grid, .studio-layout { display: grid; gap: 18px; margin-top: 28px; }
    .guide-grid, .studio-layout { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    article, .resource-panel, .work-card, .lesson-card, .resource-card, .resource-lesson-group { border: 1px solid var(--line); border-radius: 10px; background: var(--paper); }
    .work-card, .resource-card { padding: 22px; }
    .outcomes-block { margin-top: 28px; max-width: 760px; }
    .outcome-stack { display: grid; gap: 8px; margin-top: 16px; }
    .outcome-stack p { margin: 0; padding: 12px 16px; background: #f3f4f2; border-left: 3px solid var(--green); }
    .overview-actions { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; margin-top: 44px; }
    .completed-pill { display: inline-flex; align-items: center; min-height: 40px; padding: 8px 16px; border: 1px solid var(--line); border-radius: 8px; background: white; color: #344034; }
    .completed-pill strong { color: var(--green-2); }
    .completed-pill strong:not(:last-child) { margin-right: 4px; }
    h3 { margin: 0 0 10px; font-size: 25px; line-height: 1.15; }
    .clean-list { padding-left: 22px; margin: 10px 0 0; }
    .button { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 10px 16px; border: 1px solid #b8c5b3; border-radius: 8px; background: white; color: var(--green-2); font-weight: 700; text-decoration: none; cursor: pointer; }
    .button.primary { background: var(--green); border-color: var(--green); color: white; }
    .resource-stack { display: grid; gap: 16px; margin-top: 28px; }
    .resource-lesson-group { overflow: hidden; }
    .resource-lesson-summary { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 20px 24px; cursor: pointer; list-style: none; border-left: 3px solid var(--green); }
    .resource-lesson-summary::-webkit-details-marker { display: none; }
    .resource-lesson-summary strong { display: block; font-size: 21px; line-height: 1.2; }
    .resource-lesson-kicker { display: block; color: var(--muted); font-size: 13px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
    .resource-lesson-icon { color: var(--ink); font-size: 28px; font-weight: 800; line-height: 1; }
    .resource-lesson-group[open] .resource-lesson-icon { transform: rotate(45deg); }
    .lesson-index { display: grid; gap: 12px; padding: 0 24px 24px; }
    .lesson-card { display: grid; gap: 6px; padding: 18px; text-decoration: none; }
    .lesson-card span { color: var(--green); font-weight: 700; }
    .lesson-card strong { font-size: 21px; }
    .lesson-card p { margin: 0; color: var(--muted); }
    .lesson-card em { color: var(--green-2); font-style: normal; font-weight: 800; }
    .lesson-document { overflow: hidden; background: white; }
    .lesson-header { padding: 34px; background: white; border-top: 4px solid var(--green); }
    .lesson-reader-panel { background: #f1f2ef; padding: 44px 48px 36px; }
    .lesson-body { max-width: 820px; margin: 0 auto; }
    .lesson-body h1, .lesson-body h2, .lesson-body h3 { margin-top: 1.1em; }
    .lesson-body p { margin: 0 0 1em; }
    .lesson-body .source-image { max-width: 100%; height: auto; border-radius: 8px; border: 1px solid var(--line); }
    .source-table { width: 100%; border-collapse: collapse; margin: 18px 0; }
    .source-table td, .source-table th { border: 1px solid var(--line); padding: 10px; vertical-align: top; }
    .source-note, .source-path { color: var(--muted); }
    .lesson-actions { max-width: 820px; margin: 34px auto 0; display: grid; grid-template-columns: auto auto 1fr auto; gap: 12px; align-items: center; }
    .lesson-actions .complete-action { grid-column: 4; }
    label { display: grid; gap: 8px; color: var(--green-2); font-weight: 700; }
    textarea, select { width: 100%; border: 1px solid #b9c5b1; border-radius: 8px; background: white; color: var(--ink); font: inherit; padding: 12px 14px; }
    textarea:focus, select:focus, button:focus-visible, a:focus-visible { outline: 3px solid rgba(21,79,28,.22); outline-offset: 2px; }
    .work-card p { margin-top: 0; color: #465046; }
    .save-status { color: var(--muted); font-size: 14px; }
    .resource-panel { padding: 18px; margin: 24px 0 16px; max-width: 520px; }
    .resource-card { margin-top: 12px; }
    @media (max-width: 920px) {
      .topbar { justify-content: center; }
      #topbar-menu-toggle { position: absolute; left: 16px; }
      .mobile-only { display: inline-grid; }
      .progress-widget { width: 220px; }
      body.sidebar-collapsed .course-sidebar, .course-sidebar { display: none; }
      body:not(.sidebar-collapsed) .course-sidebar { display: block; width: 100%; top: 72px; bottom: auto; max-height: 58vh; }
      .course-main, body.sidebar-collapsed .course-main { margin-left: 0; }
      .course-frame { width: min(100%, 860px); padding: 34px 18px 56px; }
      .guide-grid, .studio-layout { grid-template-columns: 1fr; }
      .lesson-header { display: grid; padding: 26px; }
      .lesson-reader-panel { padding: 26px 22px 30px; }
      .lesson-actions { grid-template-columns: 1fr; }
      .lesson-actions .complete-action { grid-column: auto; }
    }
    @media print {
      .topbar, .course-sidebar, .lesson-actions, .button { display: none !important; }
      .course-main { margin: 0; }
      .course-frame { width: auto; padding: 0; }
      .course-page[hidden] { display: block !important; page-break-before: always; }
      body { font-size: 12pt; }
    }
  </style>
</head>
<body>
${renderTopbar()}
${renderSidebar(lessons)}
<main class="course-main">
  <div class="course-frame">
    ${renderOverview(lessons)}
    ${renderLessonsIndex(lessons)}
    ${lessons.map((lesson, index) => renderLesson(lesson, lessons, index)).join("")}
    ${renderReadingGuide()}
    ${renderWritingStudio()}
    ${renderResources(lessons)}
  </div>
</main>
<script>
const lessonIds = ${scriptJson(lessonIds)};
const STORAGE_KEY = "canvas-helper:ela20-1-novel-study-clean:complete";
const RESPONSE_STORAGE_KEY = "canvas-helper:ela20-1-novel-study-clean:responses";
const lessonsNav = document.querySelector(".lessons-nav");
let saveTimer = null;
function readComplete(){ try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); } catch { return new Set(); } }
function writeComplete(values){ localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(values))); }
function readResponses(){ try { return JSON.parse(localStorage.getItem(RESPONSE_STORAGE_KEY) || "{}"); } catch { return {}; } }
function writeResponses(values){ localStorage.setItem(RESPONSE_STORAGE_KEY, JSON.stringify(values)); }
function setLessonsOpen(open){ lessonsNav?.classList.toggle("is-open", open); document.querySelector("[data-lessons-toggle]")?.setAttribute("aria-expanded", String(open)); }
function updateComplete(){
  const complete = readComplete();
  const count = lessonIds.filter((id) => complete.has(id)).length;
  const percent = lessonIds.length ? Math.round((count / lessonIds.length) * 100) : 0;
  document.querySelectorAll("[data-progress-count]").forEach((node) => node.textContent = count + " / " + lessonIds.length);
  document.querySelectorAll("[data-progress-count-inline]").forEach((node) => node.textContent = count + "/" + lessonIds.length);
  document.querySelectorAll("[data-progress-fill]").forEach((node) => node.style.width = percent + "%");
  document.querySelectorAll("[data-complete-id]").forEach((button) => {
    const done = complete.has(button.getAttribute("data-complete-id"));
    button.textContent = done ? "Completed" : "Complete";
  });
}
function showPage(id){
  const fallback = document.getElementById(id) ? id : "overview";
  document.querySelectorAll(".course-page").forEach((page) => page.hidden = page.id !== fallback);
  document.querySelectorAll("[data-page-target]").forEach((link) => {
    const target = link.getAttribute("data-page-target");
    link.classList.toggle("active", target === fallback || (lessonIds.includes(fallback) && target === "lessons"));
  });
}
function route(){
  const id = (location.hash || "#overview").slice(1);
  showPage(id);
  if (id === "lessons" || lessonIds.includes(id)) setLessonsOpen(true);
}
function toggleCourseMenu(){
  document.body.classList.toggle("sidebar-collapsed");
  document.querySelectorAll("#sidebar-toggle .material-symbols-rounded, #topbar-menu-toggle .material-symbols-rounded").forEach((icon) => {
    icon.textContent = document.body.classList.contains("sidebar-collapsed") ? "dock_to_right" : "dock_to_left";
  });
}
function setResourcePanel(id){
  document.querySelectorAll("[data-resource-panel]").forEach((panel) => panel.hidden = panel.getAttribute("data-resource-panel") !== id);
}
function restoreResponses(){
  const responses = readResponses();
  document.querySelectorAll("[data-response-id]").forEach((field) => {
    field.value = responses[field.getAttribute("data-response-id")] || "";
  });
}
document.addEventListener("click", (event) => {
  const lessonToggle = event.target.closest("[data-lessons-toggle]");
  if (lessonToggle) {
    event.preventDefault();
    const open = !lessonsNav?.classList.contains("is-open");
    if (open) { history.pushState(null, "", "#lessons"); showPage("lessons"); }
    setLessonsOpen(open);
    return;
  }
  const target = event.target.closest("[data-page-target]");
  if (target) {
    const id = target.getAttribute("data-page-target");
    if (id) showPage(id);
  }
  const completeButton = event.target.closest("[data-complete-id]");
  if (completeButton) {
    const complete = readComplete();
    complete.add(completeButton.getAttribute("data-complete-id"));
    writeComplete(complete);
    updateComplete();
  }
  if (event.target.closest("[data-print-writing]")) window.print();
});
document.addEventListener("input", (event) => {
  const field = event.target.closest("[data-response-id]");
  if (!field) return;
  const responses = readResponses();
  responses[field.getAttribute("data-response-id")] = field.value;
  writeResponses(responses);
  const saveStatus = document.querySelector("[data-save-status]");
  if (saveStatus) {
    saveStatus.textContent = "Saving...";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveStatus.textContent = "Saved locally", 500);
  }
});
document.addEventListener("change", (event) => {
  const resourceSelect = event.target.closest("[data-resource-select]");
  if (resourceSelect) setResourcePanel(resourceSelect.value);
});
document.getElementById("sidebar-toggle")?.addEventListener("click", toggleCourseMenu);
document.getElementById("topbar-menu-toggle")?.addEventListener("click", toggleCourseMenu);
window.addEventListener("hashchange", route);
restoreResponses();
document.querySelectorAll("[data-resource-select]").forEach((select) => setResourcePanel(select.value));
route();
updateComplete();
</script>
</body>
</html>`;
}

async function buildNovelStudyProject(options: Args) {
  const zipBuffer = await fs.readFile(options.zipPath);
  const zip = await JSZip.loadAsync(zipBuffer);
  const projectDir = path.join(ROOT, "projects", options.slug);
  const workspaceDir = path.join(projectDir, "workspace");
  const metaDir = path.join(projectDir, "meta");
  const projectJsonPath = path.join(metaDir, "project.json");
  const rawDir = path.join(projectDir, "raw");
  const assetsDir = path.join(workspaceDir, "assets", "imported");
  const brandDir = path.join(workspaceDir, "assets", "brand");
  let existingProjectJson: Record<string, any> | null = null;

  try {
    existingProjectJson = JSON.parse(await fs.readFile(projectJsonPath, "utf8"));
  } catch {
    existingProjectJson = null;
  }

  await fs.rm(projectDir, { recursive: true, force: true });
  await fs.mkdir(assetsDir, { recursive: true });
  await fs.mkdir(brandDir, { recursive: true });
  await fs.mkdir(metaDir, { recursive: true });
  await fs.mkdir(rawDir, { recursive: true });
  await fs.copyFile(options.zipPath, path.join(rawDir, path.basename(options.zipPath)));
  await fs.copyFile(NEXT_STEP_LOGO_SOURCE_PATH, path.join(brandDir, "nxt-ce-logo-white-with-ce.png"));

  const lessons = await loadLessons(zip, assetsDir);
  await fs.writeFile(path.join(workspaceDir, "index.html"), buildHtml(lessons, options.slug), "utf8");

  const now = new Date().toISOString();
  const projectJson = {
    id: options.slug,
    slug: options.slug,
    sourcePath: options.zipPath,
    inputKind: "brightspace-zip",
    brightspaceTarget: "scorm",
    previewModes: ["workspace"],
    workspaceEntrypoint: path.join(workspaceDir, "index.html"),
    rawEntrypoint: path.join(rawDir, path.basename(options.zipPath)),
    createdAt: existingProjectJson?.createdAt ?? now,
    updatedAt: now,
    migrationState: "migrated",
    projectType: "conversion",
    preferredWorkflows: ["conversion"],
    canonicalEntry: path.join(workspaceDir, "index.html"),
    canonicalSources: [
      path.join(workspaceDir, "index.html"),
      path.join(ROOT, "scripts", "build-ela20-novel-study-clean.ts"),
      path.join(ROOT, "scripts", "lib", "next-step-course-shell.ts"),
    ],
    generatedOutputs: [],
    regenerateCommand: `npx tsx scripts/build-ela20-novel-study-clean.ts --zip "${options.zipPath}" --slug ${options.slug}`,
    importedFirstPassOrigin: {
      sourceSystem: "brightspace",
      sourcePath: options.zipPath,
      importedAt: existingProjectJson?.importedFirstPassOrigin?.importedAt ?? now,
      notes: "Novel Study-only clean build from the supplied ELA 20-1 Brightspace export.",
    },
    exportTargets: [
      { target: "scorm", enabled: true, notes: "SCORM 2004 package for Brightspace upload." },
      { target: "html", enabled: true, notes: "Standalone workspace preview." },
    ],
    authoringStatus: "active",
    referenceOnly: [path.join(rawDir, path.basename(options.zipPath))],
    sourceOfTruthNotes:
      "This project is intentionally separate from the older ela20-1-novel-study project. Regenerate from scripts/build-ela20-novel-study-clean.ts; shared shell behavior lives in scripts/lib/next-step-course-shell.ts.",
  };
  await fs.writeFile(projectJsonPath, `${JSON.stringify(projectJson, null, 2)}\n`, "utf8");
  await fs.writeFile(
    path.join(metaDir, "conversion-notes.md"),
    `# ELA 20-1 Novel Study Clean Build\n\n- Source ZIP: ${options.zipPath}\n- Active source files: ${LESSON_SOURCES.map((source) => source.entry).join(", ")}\n- Lessons imported: ${lessons.length}\n- Canonical source: projects/${options.slug}/workspace/index.html\n- Shared shell renderer: scripts/lib/next-step-course-shell.ts\n- Storage keys tracked by SCORM export: \`canvas-helper:${options.slug}:complete\`, \`canvas-helper:${options.slug}:responses\`\n\nThis is a Novel Study-only clean build from the uploaded Brightspace export. It does not reuse the older \`ela20-1-novel-study\` project.\n`,
    "utf8"
  );

  return {
    slug: options.slug,
    lessonCount: lessons.length,
    workspaceEntrypoint: path.join(workspaceDir, "index.html"),
  };
}

async function main() {
  const result = await buildNovelStudyProject(parseArgs());
  console.log(`Built ${result.slug}`);
  console.log(`Lessons: ${result.lessonCount}`);
  console.log(`Workspace: ${result.workspaceEntrypoint}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
