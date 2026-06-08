import * as cheerio from "cheerio";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

type CourseRecord = Record<string, any>;
type CourseData = {
  course?: CourseRecord;
  chapters?: CourseRecord[];
  quizzes?: CourseRecord[];
  assignments?: CourseRecord[];
};

const projectSlug = "forensicstudiesoption2-nextstep-test";
const workspaceRoot = path.resolve("projects", projectSlug, "workspace");
const outputRoot = path.join(workspaceRoot, "module-1-static");
const chapterSourcePath = path.join(workspaceRoot, "content", "chapter-1", "index.html");
const imageOutputDir = path.join(outputRoot, "assets", "images");

function loadCourseData(source: string): CourseData {
  const context = { window: {} as { FORENSIC_STUDIES_OPTION2_DATA?: CourseData } };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context.window.FORENSIC_STUDIES_OPTION2_DATA ?? {};
}

function isLocalAsset(src: string) {
  return src && !/^(?:https?:|data:|mailto:|#)/i.test(src);
}

function assetExtension(src: string) {
  const clean = src.split(/[?#]/, 1)[0];
  const ext = path.extname(clean).toLowerCase();
  return ext && ext.length <= 6 ? ext : ".jpg";
}

function sourcePathForUrl(src: string) {
  const clean = src.split(/[?#]/, 1)[0];
  const decoded = decodeURIComponent(clean).replace(/\//g, path.sep);
  return path.resolve(path.dirname(chapterSourcePath), decoded);
}

function htmlPage(title: string, body: string, cssHref = "styles.css", scriptTags = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="stylesheet" href="${cssHref}" />
</head>
<body>
${body}
${scriptTags}
</body>
</html>
`;
}

function indexHtml() {
  return htmlPage(
    "Forensic Studies 25 - Module 1",
    `<div class="app-shell">
  <aside class="sidebar" aria-label="Module navigation">
    <div class="brand">
      <div class="brand-row">
        <strong class="brand-title">Forensic<br />Studies 25</strong>
        <button class="menu-button" type="button" aria-label="Course menu">Menu</button>
      </div>
      <span class="brand-label">Scholarly Access</span>
      <span class="brand-rule"></span>
    </div>
    <nav class="module-nav">
      <button type="button" class="nav-item is-active" data-tab="overview"><span class="nav-icon" aria-hidden="true">H</span>Overview</button>
      <button type="button" class="nav-item" data-tab="lesson"><span class="nav-icon" aria-hidden="true">L</span>Lesson</button>
      <button type="button" class="nav-item" data-tab="quiz"><span class="nav-icon" aria-hidden="true">Q</span>Quiz</button>
      <button type="button" class="nav-item" data-tab="assignment"><span class="nav-icon" aria-hidden="true">A</span>Assignment</button>
      <button type="button" class="nav-item" data-tab="resources"><span class="nav-icon" aria-hidden="true">R</span>Resources</button>
    </nav>
  </aside>
  <main class="main" id="main-content">
    <section class="panel is-active" id="overview-panel" data-panel="overview" aria-label="Overview"></section>
    <section class="panel" id="lesson-panel" data-panel="lesson" aria-label="Lesson">
      <iframe class="lesson-frame" src="./lesson.html" title="Module 1 lesson content"></iframe>
    </section>
    <section class="panel" id="quiz-panel" data-panel="quiz" aria-label="Quiz"></section>
    <section class="panel" id="assignment-panel" data-panel="assignment" aria-label="Assignment">
      <div class="assignment-actions">
        <a class="button" href="./assignment/module1assignment.html" target="_blank" rel="noopener">Open assignment full screen</a>
      </div>
      <iframe class="assignment-frame" src="./assignment/module1assignment.html" title="Crime Scene Certification Lab"></iframe>
    </section>
    <section class="panel" id="resources-panel" data-panel="resources" aria-label="Resources"></section>
  </main>
</div>`,
    "styles.css",
    `<script src="./module-1-data.js"></script>
<script src="./module-1.js"></script>`
  );
}

function stylesCss() {
  return `:root {
  --ink: #191c1c;
  --muted: #465047;
  --line: #dde2dd;
  --paper: #f9f9f8;
  --surface: #ffffff;
  --sidebar: #101710;
  --green: #155608;
  --green-2: #59a844;
  --green-soft: #eaf7e6;
  --gold: #fdbf3f;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: "Aptos", "Calibri", system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.55;
}

.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
}

.sidebar {
  background: var(--sidebar);
  color: #f4f7f3;
  border-right: 1px solid #243023;
  padding: 24px 16px;
}

.brand {
  padding: 0 8px 22px;
  border-bottom: 1px solid #2b382a;
  margin-bottom: 18px;
}

.brand strong,
.brand span {
  display: block;
}

.brand strong {
  font-size: 1.05rem;
  line-height: 1.3;
}

.brand span {
  margin-top: 4px;
  color: #bfccbd;
  font-size: 0.9rem;
}

.module-nav {
  display: grid;
  gap: 6px;
}

.nav-item {
  width: 100%;
  min-height: 42px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #e8eee7;
  cursor: pointer;
  font: inherit;
  text-align: left;
  padding: 9px 10px;
}

.nav-item:hover,
.nav-item:focus-visible {
  border-color: #41513f;
  outline: none;
}

.nav-item.is-active {
  background: var(--green);
  border-color: #236f15;
  color: #ffffff;
}

.main {
  padding: 28px;
  min-width: 0;
}

.panel {
  display: none;
  max-width: 1120px;
}

.panel.is-active {
  display: block;
}

.card,
.quiz-question,
.resource-list,
.assignment-actions {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 22px;
  margin-bottom: 18px;
}

h1, h2, h3 {
  margin: 0 0 12px;
  color: var(--green);
  line-height: 1.2;
  letter-spacing: 0;
}

h1 { font-size: 2rem; }
h2 { font-size: 1.45rem; }
h3 { font-size: 1.1rem; }

p { margin: 0 0 14px; }

.meta-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.meta-item {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 14px;
  background: #fbfcfb;
}

.meta-item span {
  display: block;
  color: var(--muted);
  font-size: 0.9rem;
}

.meta-item strong {
  display: block;
  margin-top: 4px;
}

.workflow {
  margin: 12px 0 0;
  padding-left: 22px;
}

.lesson-frame,
.assignment-frame {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #ffffff;
}

.lesson-frame { min-height: 780px; }
.assignment-frame { min-height: 820px; }

.button,
.quiz-actions button {
  appearance: none;
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  border-radius: 8px;
  border: 1px solid var(--green);
  background: var(--green);
  color: #ffffff;
  padding: 9px 13px;
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.button.secondary,
.quiz-actions button.secondary {
  background: #ffffff;
  color: var(--green);
}

.quiz-options {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.quiz-option {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px;
  background: #fbfcfb;
}

.quiz-feedback {
  margin-top: 10px;
  font-weight: 700;
}

.quiz-question.is-correct { border-left: 6px solid var(--green-2); }
.quiz-question.is-incorrect { border-left: 6px solid #b42318; }

.quiz-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.resource-list ul {
  margin: 0;
  padding-left: 22px;
}

body {
  background:
    repeating-linear-gradient(0deg, rgba(20, 30, 20, 0.035) 0, rgba(20, 30, 20, 0.035) 1px, transparent 1px, transparent 24px),
    repeating-linear-gradient(90deg, rgba(20, 30, 20, 0.035) 0, rgba(20, 30, 20, 0.035) 1px, transparent 1px, transparent 24px),
    #f5f6f2;
}

.app-shell {
  grid-template-columns: 252px minmax(0, 1fr);
}

.sidebar {
  background: #3d423f;
  color: #ffffff;
  padding: 24px 18px;
  box-shadow: 10px 0 24px rgba(0, 0, 0, 0.16);
}

.brand {
  padding: 0 0 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.11);
  margin-bottom: 24px;
}

.brand-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.brand-title {
  color: #ffffff;
  font-size: 1.62rem;
  line-height: 0.98;
  font-weight: 900;
}

.brand-label {
  display: block;
  margin-top: 13px;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.brand-rule {
  display: block;
  width: 164px;
  height: 6px;
  border-radius: 999px;
  background: #e7eae5;
  margin-top: 12px;
}

.menu-button {
  min-width: 40px;
  min-height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font: inherit;
  font-size: 0.72rem;
  cursor: pointer;
}

.module-nav {
  gap: 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  border-radius: 8px;
  color: #e7ebe5;
  font-weight: 800;
  padding: 11px 12px;
}

.nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-size: 0.72rem;
}

.nav-item.is-active {
  background: #55aa42;
  border-color: #55aa42;
  color: #ffffff;
}

.main {
  padding: 27px 30px;
}

.panel {
  max-width: 1364px;
}

.course-home-card,
.frame-card {
  background: #ffffff;
  border: 1px solid #d6dad2;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(17, 24, 18, 0.14);
}

.course-home-card {
  padding: 30px;
}

.course-home-card h1 {
  color: #15191a;
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 12px;
}

.home-copy {
  max-width: 620px;
  color: #697069;
  font-size: 1.08rem;
  margin-bottom: 24px;
}

.module-card {
  border: 1px solid #d9ddd6;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(17, 24, 18, 0.1);
  padding: 25px 24px;
}

.module-badge {
  display: block;
  color: #4d8f3f;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.module-card h2 {
  color: #15191a;
  font-size: 2.8rem;
  font-weight: 900;
  margin-bottom: 18px;
}

.module-card p {
  color: #626b63;
  font-size: 1.02rem;
  margin-bottom: 18px;
}

.module-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.workflow-card {
  margin-top: 20px;
  border-top: 1px solid #e1e4de;
  padding-top: 20px;
}

.workflow-card h2 {
  color: var(--green);
  font-size: 1.35rem;
}

.lesson-frame,
.assignment-frame {
  display: block;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(17, 24, 18, 0.12);
}

.lesson-frame {
  min-height: calc(100vh - 72px);
}

@media (max-width: 780px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    padding: 16px;
  }

  .module-nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .main {
    padding: 18px;
  }

  .meta-grid {
    grid-template-columns: 1fr;
  }
}
`;
}

function moduleJs() {
  return `const tabs = Array.from(document.querySelectorAll("[data-tab]"));
const panels = Array.from(document.querySelectorAll("[data-panel]"));
const data = window.MODULE_1_DATA;

function setTab(tabName) {
  tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.tab === tabName));
  panels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === tabName));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function calculateScore() {
  let score = 0;
  data.quiz.multipleChoice.forEach((question) => {
    const selected = document.querySelector('input[name="question-' + question.number + '"]:checked');
    if (selected && selected.value === question.answer) score += 1;
  });
  return score;
}

function renderOverview() {
  document.getElementById("overview-panel").innerHTML = '<article class="course-home-card">' +
    '<h1>Home</h1>' +
    '<p class="home-copy">Each module includes lesson pages, assignments, and quizzes from the Forensic Studies course.</p>' +
    '<div class="module-card">' +
      '<span class="module-badge">' + escapeHtml(data.chapter.code) + '</span>' +
      '<h2>' + escapeHtml(data.chapter.title) + '</h2>' +
      '<p>' + escapeHtml(data.chapter.summary) + '</p>' +
      '<div class="module-actions">' +
        '<button type="button" class="button" data-jump-tab="lesson">Open lesson</button>' +
        '<button type="button" class="button secondary" data-jump-tab="quiz">Take quiz</button>' +
      '</div>' +
      '<div class="meta-grid">' +
        '<div class="meta-item"><span>Lesson components</span><strong>' + data.chapter.componentCount + '</strong></div>' +
        '<div class="meta-item"><span>Quiz</span><strong>' + escapeHtml(data.quiz.title) + '</strong></div>' +
        '<div class="meta-item"><span>Assignment</span><strong>' + escapeHtml(data.assignment.title) + '</strong></div>' +
      '</div>' +
    '</div>' +
    '<div class="workflow-card"><h2>Suggested workflow</h2>' +
    '<ol class="workflow"><li>Complete the lesson</li><li>Take the quiz</li><li>Complete the assignment</li><li>Submit through Google Classroom</li></ol></div>' +
  '</article>';

  document.querySelectorAll("[data-jump-tab]").forEach((button) => {
    button.addEventListener("click", () => setTab(button.dataset.jumpTab));
  });
}

function renderQuiz() {
  const questions = data.quiz.multipleChoice.map((question) => {
    const options = question.options.map((option) =>
      '<label class="quiz-option"><input type="radio" name="question-' + question.number + '" value="' + escapeHtml(option.label) + '"><span><strong>' + escapeHtml(option.label) + '.</strong> ' + escapeHtml(option.text) + '</span></label>'
    ).join("");
    return '<article class="quiz-question" data-question="' + question.number + '">' +
      '<h3>Question ' + question.number + '</h3>' +
      '<p>' + escapeHtml(question.prompt) + '</p>' +
      '<div class="quiz-options">' + options + '</div>' +
      '<div class="quiz-feedback" aria-live="polite"></div>' +
    '</article>';
  }).join("");

  document.getElementById("quiz-panel").innerHTML = '<article class="card"><h1>' + escapeHtml(data.quiz.title) + '</h1><p>Select an answer for each question, then submit to see your score.</p></article>' +
    '<form id="quiz-form">' + questions +
    '<div class="quiz-actions"><button type="submit">Submit quiz</button><button type="button" class="secondary" id="try-again">Try Again</button></div>' +
    '<p id="quiz-score" class="quiz-feedback" aria-live="polite"></p></form>';

  document.getElementById("quiz-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const score = calculateScore();
    document.getElementById("quiz-score").textContent = 'Score: ' + score + ' / ' + data.quiz.multipleChoice.length;
    data.quiz.multipleChoice.forEach((question) => {
      const card = document.querySelector('[data-question="' + question.number + '"]');
      const selected = document.querySelector('input[name="question-' + question.number + '"]:checked');
      const isCorrect = Boolean(selected && selected.value === question.answer);
      card.classList.toggle("is-correct", isCorrect);
      card.classList.toggle("is-incorrect", !isCorrect);
      card.querySelector(".quiz-feedback").textContent = isCorrect ? "Correct" : "Incorrect. Correct answer: " + question.answer;
    });
  });

  document.getElementById("try-again").addEventListener("click", () => {
    document.getElementById("quiz-form").reset();
    document.getElementById("quiz-score").textContent = "";
    document.querySelectorAll(".quiz-question").forEach((card) => {
      card.classList.remove("is-correct", "is-incorrect");
      card.querySelector(".quiz-feedback").textContent = "";
    });
  });
}

function renderResources() {
  const links = data.resources.map((resource) =>
    '<li><a href="' + escapeHtml(resource.href) + '" target="_blank" rel="noopener">' + escapeHtml(resource.title) + '</a></li>'
  ).join("");
  document.getElementById("resources-panel").innerHTML = '<article class="resource-list"><h1>Resources</h1><ul>' + links + '</ul><p>Submit completed work through Google Classroom.</p></article>';
}

tabs.forEach((tab) => tab.addEventListener("click", () => setTab(tab.dataset.tab)));
renderOverview();
renderQuiz();
renderResources();
`;
}

function acceptanceChecklist() {
  return `[ ] Module opens locally through http://localhost:8080
[ ] Sidebar navigation works
[ ] Overview tab displays Module 1 only
[ ] Lesson tab displays all Module 1 lesson cards
[ ] No lesson cards are locked or blurred
[ ] No Mark Complete buttons remain
[ ] Local lesson images load
[ ] External videos/iframes still load
[ ] Quiz tab displays Module 1 quiz only
[ ] Quiz scores correctly
[ ] Quiz has Try Again
[ ] Assignment tab displays Module 1 assignment
[ ] No Firebase references remain
[ ] No hosted-runtime-content references remain
[ ] No save/progress/localStorage logic remains
[ ] No console errors during normal use
`;
}

function readme() {
  return `# Forensics 25 Module 1 Static Tester

This is a content-only proof of concept for Module 1 of Forensic Studies 25. It preserves the course style, lesson content, quiz, assignment link, and local lesson images while removing course save, progress, lock, cloud sync, and full-course navigation behavior.

## Run locally

\`\`\`bash
cd module-1-static
python3 -m http.server 8080
\`\`\`

Open:

\`\`\`text
http://localhost:8080
\`\`\`

## Extracted files

- Module 1 course metadata from \`workspace/course-data.js\`
- Lesson content from \`workspace/content/chapter-1/index.html\`
- Module 1 assignment files from \`workspace/assignments/\`
- Required local lesson images from \`workspace/references/forensics/сontent/\`

## Intentionally removed

- Google sign-in and cloud sync
- Save/resume behavior
- Completion tracking
- Locked and blurred states
- Full-course chapter, quiz, assignment, and dashboard navigation

## Later Google path

This static tester can become a Google Apps Script app by serving \`index.html\` through \`doGet()\`, splitting CSS and JavaScript into template includes, and moving images into a district-approved Google Workspace storage strategy. It can also be linked from Google Sites as separate module pages if direct app hosting is not approved.
`;
}

function migrationReport(imageCount: number, unresolvedImages: string[], resources: Array<{ title: string; href: string }>) {
  return `# Migration Report

## Source files used

- \`workspace/index.html\`
- \`workspace/styles.css\`
- \`workspace/main.js\`
- \`workspace/course-data.js\`
- \`workspace/content/chapter-1/index.html\`
- \`workspace/assignments/module1assignment.html\`
- \`workspace/assignments/module1assignment.bundle.js\`
- \`workspace/assignments/forensic-assignment-theme.css\`
- \`workspace/assignments/forensic-assignment-print.js\`
- \`workspace/references/forensics/\`

## Module 1 data extracted

- Module title: 1 Introduction to Crime Scenes
- Module code: Module 1
- Component count: 22

## Quiz data extracted

- Quiz: M1 Introduction to Crime Scenes Quiz

## Assignment files copied

- \`module1assignment.html\`
- \`module1assignment.bundle.js\`
- \`forensic-assignment-theme.css\`
- \`forensic-assignment-print.js\`

## Image paths rewritten

- Local images copied: ${imageCount}
- Unresolved local image references: ${unresolvedImages.length}
${unresolvedImages.map((item) => `- ${item}`).join("\n") || "- None"}

## Resources collected

${resources.map((resource) => `- ${resource.title}: ${resource.href}`).join("\n") || "- None"}

## Compromises made

- The lesson and assignment are displayed in iframes to keep the tester shell simple and preserve each source surface.
- External videos and links remain external.
- The assignment React bundle was copied as-is except for disabling its browser storage calls for this content-only tester.

## Audit results

- Problem found: the copied Module 1 assignment bundle retained browser storage calls from the original assignment app.
- Fix made: the generated assignment bundle now replaces storage reads with empty-state reads and storage writes with no-ops.
- Remaining risks: assignment print/export behavior still needs teacher review in the target district browser environment.
`;
}

async function buildLessonHtml() {
  const source = await readFile(chapterSourcePath, "utf8");
  const $ = cheerio.load(source);
  const imageCopies: Array<{ from: string; to: string }> = [];
  const unresolvedImages: string[] = [];

  $("#skip-to-content").remove();
  $("[data-progress-footer], .lesson-progress-footer").remove();
  $("button").filter((_, element) => /Mark Complete/i.test($(element).text())).remove();
  $("[data-progress-state]").removeAttr("data-progress-state");
  $("[data-mark-complete], [data-mark-complete-next]").removeAttr("data-mark-complete data-mark-complete-next");
  $(".locked-card").removeClass("locked-card");

  let imageIndex = 0;
  for (const element of $("img").toArray()) {
    const img = $(element);
    const src = img.attr("src") ?? "";
    if (!isLocalAsset(src)) continue;

    const sourcePath = sourcePathForUrl(src);
    imageIndex += 1;
    const destName = `module-1-image-${String(imageIndex).padStart(2, "0")}${assetExtension(src)}`;
    const destPath = path.join(imageOutputDir, destName);
    try {
      await copyFile(sourcePath, destPath);
      imageCopies.push({ from: sourcePath, to: destPath });
      img.attr("src", `assets/images/${destName}`);
    } catch {
      unresolvedImages.push(src);
      img.attr("data-unresolved-src", src);
    }
  }

  const body = $("main.module-page").length ? $("main.module-page").prop("outerHTML") ?? "" : $("body").html() ?? "";
  const lesson = htmlPage("Module 1 Lesson - Forensic Studies 25", body, "styles.css");
  return { lesson, imageCount: imageCopies.length, unresolvedImages, resources: collectResources($) };
}

function collectResources($: cheerio.CheerioAPI) {
  const resources = new Map<string, string>();
  $("iframe[src], a[href]").each((_, element) => {
    const node = $(element);
    const href = node.attr("src") ?? node.attr("href") ?? "";
    if (!/^https?:/i.test(href)) return;
    const title = node.attr("title") || node.text().trim() || href;
    resources.set(href, title);
  });
  resources.set("./assignment/module1assignment.html", "Crime Scene Certification Lab assignment");
  return Array.from(resources, ([href, title]) => ({ title, href }));
}

async function copyAssignmentFiles() {
  const assignmentSource = path.join(workspaceRoot, "assignments");
  const assignmentDest = path.join(outputRoot, "assignment");
  await mkdir(assignmentDest, { recursive: true });
  for (const fileName of ["module1assignment.html", "forensic-assignment-theme.css", "forensic-assignment-print.js"]) {
    await copyFile(path.join(assignmentSource, fileName), path.join(assignmentDest, fileName));
  }

  const bundleSource = await readFile(path.join(assignmentSource, "module1assignment.bundle.js"), "utf8");
  const storageFreeBundle = bundleSource
    .replaceAll("window.localStorage.getItem", "(() => null)")
    .replaceAll("window.localStorage.setItem", "(() => undefined)");
  await writeFile(path.join(assignmentDest, "module1assignment.bundle.js"), storageFreeBundle, "utf8");
}

async function main() {
  const courseDataSource = await readFile(path.join(workspaceRoot, "course-data.js"), "utf8");
  const courseData = loadCourseData(courseDataSource);
  const chapter = courseData.chapters?.find((item) => item.id === "chapter-1");
  const quiz = courseData.quizzes?.find((item) => item.id === "quiz-1");
  const assignment = courseData.assignments?.find((item) => item.id === "assignment-1");
  if (!chapter || !quiz || !assignment) {
    throw new Error("Missing Module 1 chapter, quiz, or assignment data.");
  }

  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(imageOutputDir, { recursive: true });

  const { lesson, imageCount, unresolvedImages, resources } = await buildLessonHtml();
  const moduleData = {
    course: { title: courseData.course?.title ?? "Forensic Studies 25" },
    chapter,
    quiz: {
      id: quiz.id,
      title: quiz.title,
      multipleChoice: quiz.multipleChoice ?? []
    },
    assignment,
    resources
  };

  await writeFile(path.join(outputRoot, "index.html"), indexHtml(), "utf8");
  await writeFile(path.join(outputRoot, "styles.css"), stylesCss(), "utf8");
  await writeFile(path.join(outputRoot, "module-1.js"), moduleJs(), "utf8");
  await writeFile(
    path.join(outputRoot, "module-1-data.js"),
    `const MODULE_1_DATA = ${JSON.stringify(moduleData, null, 2)};\nwindow.MODULE_1_DATA = MODULE_1_DATA;\n`,
    "utf8"
  );
  await writeFile(path.join(outputRoot, "lesson.html"), lesson, "utf8");
  await copyAssignmentFiles();
  await writeFile(path.join(outputRoot, "README.md"), readme(), "utf8");
  await writeFile(path.join(outputRoot, "MIGRATION_REPORT.md"), migrationReport(imageCount, unresolvedImages, resources), "utf8");
  await writeFile(path.join(outputRoot, "ACCEPTANCE_CHECKLIST.md"), acceptanceChecklist(), "utf8");

  console.log(`Built ${path.relative(process.cwd(), outputRoot)} with ${imageCount} copied images.`);
  if (unresolvedImages.length) {
    console.log(`Unresolved image references: ${unresolvedImages.length}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
