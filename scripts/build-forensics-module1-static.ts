import {
  access,
  copyFile,
  mkdir,
  readFile,
  rm,
  readdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as cheerio from "cheerio";
type D2LMapItem = {
  id: string;
  title: string;
  kind: string;
  depth?: number;
  resource?: { identifierRef?: string; hrefs?: string[] };
  children?: D2LMapItem[];
};
type D2LCourseMapData = {
  exportRoot?: string;
  courseTitle?: string;
  modules?: D2LMapItem[];
};
type QuizQuestion = {
  number: number;
  prompt: string;
  options: Array<{ label: string; text: string }>;
  answer: string;
};
type Module1StaticData = {
  course: { title: string };
  chapter: {
    id: string;
    title: string;
    code: string;
    summary: string;
    componentCount: number;
  };
  quiz: { id: string; title: string; multipleChoice: QuizQuestion[] };
  assignment: { id: string; title: string };
  resources: Array<{ title: string; href: string }>;
};
type GeneratedCourseData = {
  chapters?: Array<Module1StaticData["chapter"] & { contentPath?: string }>;
  quizzes?: Array<Module1StaticData["quiz"] & { chapterId?: string }>;
  assignments?: Array<Module1StaticData["assignment"] & { chapterId?: string }>;
};
const projectSlug = "forensics-module1";
const workspaceRoot = path.resolve("projects", projectSlug, "workspace");
const outputRoot = path.join(workspaceRoot, "module-1-static");
const imageOutputDir = path.join(outputRoot, "assets", "images");
const mapDataPath = path.join(workspaceRoot, "d2l-map-data.js");
const authoritativeCourseDataPath = path.resolve(
  "projects",
  "forensicstudiesoption2",
  "workspace",
  "course-data.js",
);
const assignmentSourceRoot = path.join(workspaceRoot, "assets");
const assignmentThemeCssCandidates = [
  path.resolve(
    "projects",
    "forensicstudiesoption2-nextstep-test",
    "workspace",
    "assignments",
    "forensic-assignment-theme.css",
  ),
  path.resolve(
    "projects",
    "forensicstudiesoption2",
    "workspace",
    "assignments",
    "forensic-assignment-theme.css",
  ),
];
const assignmentPrintJsCandidates = [
  path.resolve(
    "projects",
    "forensicstudiesoption2-nextstep-test",
    "workspace",
    "assignments",
    "forensic-assignment-print.js",
  ),
  path.resolve(
    "projects",
    "forensicstudiesoption2",
    "workspace",
    "assignments",
    "forensic-assignment-print.js",
  ),
];
function htmlPage(
  title: string,
  body: string,
  cssHref = "styles.css",
  scriptTags = "",
) {
  return `<!DOCTYPE html><html lang="en"><head>  <meta charset="UTF-8" />  <meta name="viewport" content="width=device-width, initial-scale=1.0" />  <title>${title}</title>  <link rel="stylesheet" href="${cssHref}" /></head><body>${body}${scriptTags}</body></html>`;
}
function indexHtml() {
  return htmlPage(
    "Forensic Studies 25 - Module 1",
    `<div class="app-shell">  <aside class="sidebar" aria-label="Module navigation">    <div class="brand">      <div class="brand-row">        <strong class="brand-title">Forensic<br />Studies 25</strong>        <button class="menu-button" type="button" aria-label="Course menu">Menu</button>      </div>      <span class="brand-label">Scholarly Access</span>      <span class="brand-rule"></span>    </div>    <nav class="module-nav">      <button type="button" class="nav-item is-active" data-tab="overview"><span class="nav-icon" aria-hidden="true">H</span>Overview</button>      <button type="button" class="nav-item" data-tab="lesson"><span class="nav-icon" aria-hidden="true">L</span>Lesson</button>      <button type="button" class="nav-item" data-tab="quiz"><span class="nav-icon" aria-hidden="true">Q</span>Quiz</button>      <button type="button" class="nav-item" data-tab="assignment"><span class="nav-icon" aria-hidden="true">A</span>Assignment</button>      <button type="button" class="nav-item" data-tab="resources"><span class="nav-icon" aria-hidden="true">R</span>Resources</button>    </nav>  </aside>  <main class="main" id="main-content">    <section class="panel is-active" id="overview-panel" data-panel="overview" aria-label="Overview"></section>    <section class="panel" id="lesson-panel" data-panel="lesson" aria-label="Lesson">      <iframe class="lesson-frame" src="./lesson.html" title="Module 1 lesson content"></iframe>    </section>    <section class="panel" id="quiz-panel" data-panel="quiz" aria-label="Quiz"></section>    <section class="panel" id="assignment-panel" data-panel="assignment" aria-label="Assignment">      <div class="assignment-actions">        <a class="button" href="./assignment/module1assignment.html" target="_blank" rel="noopener">Open assignment full screen</a>      </div>      <iframe class="assignment-frame" src="./assignment/module1assignment.html" title="Crime Scene Certification Lab"></iframe>    </section>    <section class="panel" id="resources-panel" data-panel="resources" aria-label="Resources"></section>  </main></div>`,
    "styles.css",
    `<script src="./module-1-data.js"></script><script src="./module-1.js"></script>`,
  );
}
function stylesCss() {
  return `:root {  --ink: #191c1c;  --muted: #465047;  --line: #dde2dd;  --paper: #f9f9f8;  --surface: #ffffff;  --sidebar: #101710;  --green: #155608;  --green-2: #59a844;  --green-soft: #eaf7e6;  --gold: #fdbf3f;}* { box-sizing: border-box; }body {  margin: 0;  background: var(--paper);  color: var(--ink);  font-family: "Aptos", "Calibri", system-ui, sans-serif;  font-size: 16px;  line-height: 1.55;}.app-shell {  min-height: 100vh;  display: grid;  grid-template-columns: 250px minmax(0, 1fr);}.sidebar {  background: var(--sidebar);  color: #f4f7f3;  border-right: 1px solid #243023;  padding: 24px 16px;}.brand {  padding: 0 8px 22px;  border-bottom: 1px solid #2b382a;  margin-bottom: 18px;}.brand strong,.brand span {  display: block;}.brand strong {  font-size: 1.05rem;  line-height: 1.3;}.brand span {  margin-top: 4px;  color: #bfccbd;  font-size: 0.9rem;}.module-nav {  display: grid;  gap: 6px;}.nav-item {  width: 100%;  min-height: 42px;  border: 1px solid transparent;  border-radius: 8px;  background: transparent;  color: #e8eee7;  cursor: pointer;  font: inherit;  text-align: left;  padding: 9px 10px;}.nav-item:hover,.nav-item:focus-visible {  border-color: #41513f;  outline: none;}.nav-item.is-active {  background: var(--green);  border-color: #236f15;  color: #ffffff;}.main {  padding: 28px;  min-width: 0;}.panel {  display: none;  max-width: 1120px;}.panel.is-active {  display: block;}.card,.quiz-question,.resource-list,.assignment-actions {  background: var(--surface);  border: 1px solid var(--line);  border-radius: 8px;  padding: 22px;  margin-bottom: 18px;}h1, h2, h3 {  margin: 0 0 12px;  color: var(--green);  line-height: 1.2;  letter-spacing: 0;}h1 { font-size: 2rem; }h2 { font-size: 1.45rem; }h3 { font-size: 1.1rem; }p { margin: 0 0 14px; }.meta-grid {  display: grid;  grid-template-columns: repeat(3, minmax(0, 1fr));  gap: 12px;  margin-top: 18px;}.meta-item {  border: 1px solid var(--line);  border-radius: 8px;  padding: 14px;  background: #fbfcfb;}.meta-item span {  display: block;  color: var(--muted);  font-size: 0.9rem;}.meta-item strong {  display: block;  margin-top: 4px;}.workflow {  margin: 12px 0 0;  padding-left: 22px;}.lesson-frame,.assignment-frame {  width: 100%;  border: 1px solid var(--line);  border-radius: 8px;  background: #ffffff;}.lesson-frame { min-height: 780px; }.assignment-frame { min-height: 820px; }.button,.quiz-actions button {  appearance: none;  min-height: 42px;  display: inline-flex;  align-items: center;  border-radius: 8px;  border: 1px solid var(--green);  background: var(--green);  color: #ffffff;  padding: 9px 13px;  font: inherit;  font-weight: 700;  text-decoration: none;  cursor: pointer;}.button.secondary,.quiz-actions button.secondary {  background: #ffffff;  color: var(--green);}.quiz-options {  display: grid;  gap: 8px;  margin-top: 12px;}.quiz-option {  display: flex;  gap: 10px;  align-items: flex-start;  border: 1px solid var(--line);  border-radius: 8px;  padding: 10px;  background: #fbfcfb;}.quiz-feedback {  margin-top: 10px;  font-weight: 700;}.quiz-question.is-correct { border-left: 6px solid var(--green-2); }.quiz-question.is-incorrect { border-left: 6px solid #b42318; }.quiz-actions {  display: flex;  gap: 10px;  flex-wrap: wrap;}.resource-list ul {  margin: 0;  padding-left: 22px;}body {  background:    repeating-linear-gradient(0deg, rgba(20, 30, 20, 0.035) 0, rgba(20, 30, 20, 0.035) 1px, transparent 1px, transparent 24px),    repeating-linear-gradient(90deg, rgba(20, 30, 20, 0.035) 0, rgba(20, 30, 20, 0.035) 1px, transparent 1px, transparent 24px),    #f5f6f2;}.app-shell {  grid-template-columns: 252px minmax(0, 1fr);}.sidebar {  background: #3d423f;  color: #ffffff;  padding: 24px 18px;  box-shadow: 10px 0 24px rgba(0, 0, 0, 0.16);}.brand {  padding: 0 0 22px;  border-bottom: 1px solid rgba(255, 255, 255, 0.11);  margin-bottom: 24px;}.brand-row {  display: flex;  align-items: flex-start;  justify-content: space-between;  gap: 14px;}.brand-title {  color: #ffffff;  font-size: 1.62rem;  line-height: 0.98;  font-weight: 900;}.brand-label {  display: block;  margin-top: 13px;  color: #ffffff;  font-size: 0.72rem;  font-weight: 800;  letter-spacing: 0.2em;  text-transform: uppercase;}.brand-rule {  display: block;  width: 164px;  height: 6px;  border-radius: 999px;  background: #e7eae5;  margin-top: 12px;}.menu-button {  min-width: 40px;  min-height: 40px;  border: 1px solid rgba(255, 255, 255, 0.16);  border-radius: 8px;  background: rgba(255, 255, 255, 0.08);  color: #ffffff;  font: inherit;  font-size: 0.72rem;  cursor: pointer;}.module-nav {  gap: 12px;}.nav-item {  display: flex;  align-items: center;  gap: 12px;  min-height: 48px;  border-radius: 8px;  color: #e7ebe5;  font-weight: 800;  padding: 11px 12px;}.nav-icon {  display: inline-flex;  align-items: center;  justify-content: center;  width: 22px;  height: 22px;  border-radius: 6px;  background: rgba(255, 255, 255, 0.12);  color: #ffffff;  font-size: 0.72rem;}.nav-item.is-active {  background: #55aa42;  border-color: #55aa42;  color: #ffffff;}.main {  padding: 27px 30px;}.panel {  max-width: 1364px;}.course-home-card,.frame-card {  background: #ffffff;  border: 1px solid #d6dad2;  border-radius: 8px;  box-shadow: 0 8px 24px rgba(17, 24, 18, 0.14);}.course-home-card {  padding: 30px;}.course-home-card h1 {  color: #15191a;  font-size: 3rem;  font-weight: 900;  margin-bottom: 12px;}.home-copy {  max-width: 620px;  color: #697069;  font-size: 1.08rem;  margin-bottom: 24px;}.module-card {  border: 1px solid #d9ddd6;  border-radius: 8px;  background: #ffffff;  box-shadow: 0 8px 24px rgba(17, 24, 18, 0.1);  padding: 25px 24px;}.module-badge {  display: block;  color: #4d8f3f;  font-size: 0.72rem;  font-weight: 900;  letter-spacing: 0.22em;  text-transform: uppercase;  margin-bottom: 6px;}.module-card h2 {  color: #15191a;  font-size: 2.8rem;  font-weight: 900;  margin-bottom: 18px;}.module-card p {  color: #626b63;  font-size: 1.02rem;  margin-bottom: 18px;}.module-actions {  display: flex;  gap: 12px;  flex-wrap: wrap;  margin-bottom: 10px;}.workflow-card {  margin-top: 20px;  border-top: 1px solid #e1e4de;  padding-top: 20px;}.workflow-card h2 {  color: var(--green);  font-size: 1.35rem;}.lesson-frame,.assignment-frame {  display: block;  background: #ffffff;  box-shadow: 0 8px 24px rgba(17, 24, 18, 0.12);}.lesson-frame {  min-height: calc(100vh - 72px);}@media (max-width: 780px) {  .app-shell {    grid-template-columns: 1fr;  }  .sidebar {    position: static;    padding: 16px;  }  .module-nav {    grid-template-columns: repeat(2, minmax(0, 1fr));  }  .main {    padding: 18px;  }  .meta-grid {    grid-template-columns: 1fr;  }}`;
}
function moduleJs() {
  return `const tabs = Array.from(document.querySelectorAll("[data-tab]"));const panels = Array.from(document.querySelectorAll("[data-panel]"));const data = window.MODULE_1_DATA;function setTab(tabName) {  tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.tab === tabName));  panels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === tabName));  if (tabName && location.hash.slice(1) !== tabName) history.replaceState(null, "", "#" + tabName);}function escapeHtml(value) {  return String(value ?? "").replace(/[&<>"']/g, (char) => ({    "&": "&amp;",    "<": "&lt;",    ">": "&gt;",    '"': "&quot;",    "'": "&#39;"  })[char]);}function calculateScore() {  let score = 0;  data.quiz.multipleChoice.forEach((question) => {    const selected = document.querySelector('input[name="question-' + question.number + '"]:checked');    if (selected && selected.value === question.answer) score += 1;  });  return score;}function renderOverview() {  document.getElementById("overview-panel").innerHTML = '<article class="course-home-card">' +    '<h1>Home</h1>' +    '<p class="home-copy">Each module includes lesson pages, assignments, and quizzes from Forensic Studies 25.</p>' +    '<div class="module-card">' +      '<span class="module-badge">' + escapeHtml(data.chapter.code) + '</span>' +      '<h2>' + escapeHtml(data.chapter.title) + '</h2>' +      '<p>' + escapeHtml(data.chapter.summary) + '</p>' +      '<div class="module-actions">' +        '<button type="button" class="button" data-jump-tab="lesson">Open lesson</button>' +        '<button type="button" class="button secondary" data-jump-tab="quiz">Take quiz</button>' +      '</div>' +      '<div class="meta-grid">' +        '<div class="meta-item"><span>Lesson components</span><strong>' + data.chapter.componentCount + '</strong></div>' +        '<div class="meta-item"><span>Quiz</span><strong>' + escapeHtml(data.quiz.title) + '</strong></div>' +        '<div class="meta-item"><span>Assignment</span><strong>' + escapeHtml(data.assignment.title) + '</strong></div>' +      '</div>' +    '</div>' +    '<div class="workflow-card"><h2>Suggested workflow</h2>' +    '<ol class="workflow"><li>Complete the lesson</li><li>Take the quiz</li><li>Complete the assignment</li><li>Submit through Google Classroom</li></ol></div>' +  '</article>';  document.querySelectorAll("[data-jump-tab]").forEach((button) => {    button.addEventListener("click", () => setTab(button.dataset.jumpTab));  });}function renderQuiz() {  const questions = data.quiz.multipleChoice.map((question) => {    const options = question.options.map((option) =>      '<label class="quiz-option"><input type="radio" name="question-' + question.number + '" value="' + escapeHtml(option.label) + '"><span><strong>' + escapeHtml(option.label) + '.</strong> ' + escapeHtml(option.text) + '</span></label>'    ).join("");    return '<article class="quiz-question" data-question="' + question.number + '">' +      '<h3>Question ' + question.number + '</h3>' +      '<p>' + escapeHtml(question.prompt) + '</p>' +      '<div class="quiz-options">' + options + '</div>' +      '<div class="quiz-feedback" aria-live="polite"></div>' +    '</article>';  }).join("");  document.getElementById("quiz-panel").innerHTML = '<article class="card"><h1>' + escapeHtml(data.quiz.title) + '</h1><p>Select an answer for each question, then submit to see your score.</p></article>' +    '<form id="quiz-form">' + questions +    '<div class="quiz-actions"><button type="submit">Submit quiz</button><button type="button" class="secondary" id="try-again">Try Again</button></div>' +    '<p id="quiz-score" class="quiz-feedback" aria-live="polite"></p></form>';  document.getElementById("quiz-form").addEventListener("submit", (event) => {    event.preventDefault();    const score = calculateScore();    document.getElementById("quiz-score").textContent = 'Score: ' + score + ' / ' + data.quiz.multipleChoice.length;    data.quiz.multipleChoice.forEach((question) => {      const card = document.querySelector('[data-question="' + question.number + '"]');      const selected = document.querySelector('input[name="question-' + question.number + '"]:checked');      const isCorrect = Boolean(selected && selected.value === question.answer);      card.classList.toggle("is-correct", isCorrect);      card.classList.toggle("is-incorrect", !isCorrect);      card.querySelector(".quiz-feedback").textContent = isCorrect ? "Correct" : "Incorrect. Correct answer: " + question.answer;    });  });  document.getElementById("try-again").addEventListener("click", () => {    document.getElementById("quiz-form").reset();    document.getElementById("quiz-score").textContent = "";    document.querySelectorAll(".quiz-question").forEach((card) => {      card.classList.remove("is-correct", "is-incorrect");      card.querySelector(".quiz-feedback").textContent = "";    });  });}function renderResources() {  const links = data.resources.map((resource) =>    '<li><a href="' + escapeHtml(resource.href) + '" target="_blank" rel="noopener">' + escapeHtml(resource.title) + '</a></li>'  ).join("");  document.getElementById("resources-panel").innerHTML = '<article class="resource-list"><h1>Resources</h1><ul>' + links + '</ul><p>Submit completed work through Google Classroom.</p></article>';}tabs.forEach((tab) => tab.addEventListener("click", () => setTab(tab.dataset.tab)));renderOverview();renderQuiz();renderResources();const initialTab = location.hash.slice(1);if (tabs.some((tab) => tab.dataset.tab === initialTab)) setTab(initialTab);`;
}
function acceptanceChecklist() {
  return `# Acceptance Checklist

[ ] Module opens locally through http://localhost:8080
[ ] Sidebar navigation works
[ ] Overview tab displays Module 1 only
[ ] Lesson tab displays all Module 1 lesson cards/content
[ ] No lesson cards are locked or blurred
[ ] No Mark Complete buttons remain
[ ] No Course progress UI remains
[ ] No locked/unlocked assessment messaging remains
[ ] Local lesson images load
[ ] External videos/iframes still load
[ ] Quiz tab displays Module 1 quiz only
[ ] Quiz scores correctly
[ ] Quiz has Try Again
[ ] Assignment tab displays Module 1 assignment
[ ] Assignment has full-screen open button
[ ] No Firebase references remain
[ ] No hosted-runtime-content references remain
[ ] No old D2L export paths are fetched at runtime
[ ] No Module 2-8 code remains
[ ] No localStorage/sessionStorage progress logic remains
[ ] No console errors during normal use
`;
}
function readme() {
  return `# Forensics 25 Module 1 Static Tester

This is a content-only static package for Module 1 of Forensic Studies 25.
It includes the extracted module shell, lesson pages, quiz, assignment embed,
and local resources needed for review and export-ready testing.

## Run locally

\`\`\`bash
cd module-1-static
python3 -m http.server 8080
\`\`\`

Open:

\`\`\`text
http://localhost:8080
\`\`\`

## Files included

- \`index.html\` and \`module-1.js\` shell
- \`lesson.html\` built from Module 1 source lesson pages only
- \`module-1-data.js\` extracted module, quiz, assignment, and resource metadata
- \`assignment/\` with the Module 1 assignment surface and support files
- \`assets/images/\` with copied Module 1 lesson images

## Removed

- Course progress and locking UI
- Mark Complete controls
- Firebase/cloud-save references
- Module 2-8 app code
- Runtime D2L fetch paths

## Later export options

This static package can be converted to Google Apps Script or Google Sites by
moving the same file set into the target host and preserving the relative links.
`;
}
function migrationReport(
  imageCount: number,
  unresolvedImages: string[],
  resources: Array<{ title: string; href: string }>,
  copiedTheme: string[],
) {
  return `# Migration Report

## Source files used

- \`projects/forensics-module1/workspace/d2l-map-data.js\`
- \`projects/forensics-module1/workspace/D2LCCExport_*/?ontent/.../*.html\`
- \`projects/forensicstudiesoption2/workspace/course-data.js\`
- \`projects/forensics-module1/workspace/assets/module1assignment.html\`
- \`projects/forensics-module1/workspace/assets/module1assignment.bundle.js\`

## Module 1 data extracted

- Course: Forensic Studies 25
- Module: Module 1
- Quiz: M1 Introduction to Crime Scenes Quiz
- Assignment: Crime Scene Certification Lab

## Image paths rewritten

- Local images copied: ${imageCount}
- Unresolved local image references: ${unresolvedImages.length}
${unresolvedImages.map((item) => `- ${item}`).join("\n") || "- None"}

## Resources collected

${resources.map((resource) => `- ${resource.title}: ${resource.href}`).join("\n") || "- None"}

## Assignment runtime support files

${copiedTheme.map((file) => `- ${file}`).join("\n") || "- None"}

## Compromises made

- Lesson pages are embedded in a shared shell for quick Module 1 review.
- The old Unit Assessments page was replaced with local Module 1 next steps.
- Storage calls in the copied assignment bundle were replaced with no-op handlers.
`;
}
function isLocalAsset(src: string) {
  return src && !/^(?:https?:|data:|mailto:|#)/i.test(src);
}
function assetExtension(src: string) {
  const clean = src.split(/[?#]/, 1)[0];
  const ext = path.extname(clean).toLowerCase();
  return ext && ext.length <= 6 ? ext : ".jpg";
}
function decodeHtml(text: string) {
  return text
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&nbsp;", " ")
    .trim();
}
function stripHtml(raw: string) {
  return decodeHtml(raw)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
function escapeHtml(input: string) {
  return String(input ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}
function cleanPathValue(rawHref: string) {
  return rawHref.split(/[?#]/, 1)[0].replace(/\\/g, "/").trim();
}
function decodeSafe(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
function latin1ToUtf8(value: string) {
  try {
    return Buffer.from(value, "latin1").toString("utf8");
  } catch {
    return value;
  }
}
function contentFolderVariants(value: string) {
  const clean = cleanPathValue(value);
  const slashIndex = clean.indexOf("/");
  if (slashIndex < 0) return [];
  const folder = clean.slice(0, slashIndex);
  const rest = clean.slice(slashIndex + 1);
  if (!/ontent$/i.test(folder)) return [];
  return [`?ontent/${rest}`, `\u0441ontent/${rest}`, `content/${rest}`];
}
async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
function collectModule1Nodes(
  module: D2LMapItem | undefined,
  collector: D2LMapItem[] = [],
) {
  if (!module) return collector;
  if (module.kind === "html") {
    collector.push(module);
    return collector;
  }
  for (const child of module.children ?? []) {
    collectModule1Nodes(child, collector);
  }
  return collector;
}
async function findFileByName(
  root: string,
  fileName: string,
): Promise<string | undefined> {
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const candidate = path.join(root, entry.name);
    if (entry.isDirectory()) {
      const found = await findFileByName(candidate, fileName);
      if (found) return found;
      continue;
    }
    if (entry.isFile() && entry.name === fileName) return candidate;
  }
  return undefined;
}
function resolveSourceFile(
  exportRoot: string,
  rawHref: string,
  sourceFilePath?: string,
) {
  const clean = cleanPathValue(rawHref);
  const decoded = decodeSafe(clean);
  const latin1 = latin1ToUtf8(clean);
  const latin1Decoded = latin1ToUtf8(decoded);
  const variants = Array.from(
    new Set(
      [
        clean,
        decoded,
        latin1,
        latin1Decoded,
        ...contentFolderVariants(clean),
        ...contentFolderVariants(decoded),
        ...contentFolderVariants(latin1),
        ...contentFolderVariants(latin1Decoded),
      ].filter(Boolean),
    ),
  );
  const sourceRoot = sourceFilePath ? path.dirname(sourceFilePath) : "";
  return {
    async direct() {
      for (const variant of variants) {
        const parts = variant
          .split("/")
          .map((part) => part.trim())
          .filter(Boolean);
        if (!parts.length) continue;
        const candidate = path.resolve(exportRoot, ...parts);
        if (await exists(candidate)) return candidate;
        if (sourceRoot) {
          const sourceRelative = path.resolve(sourceRoot, ...parts);
          if (await exists(sourceRelative)) return sourceRelative;
        }
      }
      const byName = await findFileByName(exportRoot, path.basename(clean));
      if (byName) return byName;
      throw new Error(`Could not resolve source path for ${rawHref}`);
    },
    clean,
  };
}
function sanitizeQuickLinkText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}
function resourceLabelFromHref(href: string) {
  const trimmed = href.trim();
  if (!trimmed) return "";
  if (/^(?:https?:)?\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const host = parsed.hostname.replace(/^www\./, "");
      const segments = parsed.pathname.split("/").filter(Boolean);
      const tail = segments.pop();
      return tail ? `${host} / ${decodeURIComponent(tail)}` : host;
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}
async function loadMapData(): Promise<D2LCourseMapData> {
  const mapUrl = pathToFileURL(mapDataPath).href;
  const mapModule = await import(mapUrl);
  return (mapModule.default ?? {}) as D2LCourseMapData;
}
async function loadAuthoritativeCourseData(): Promise<GeneratedCourseData> {
  const source = await readFile(authoritativeCourseDataPath, "utf8");
  const marker = "window.FORENSIC_STUDIES_OPTION2_DATA";
  const markerIndex = source.indexOf(marker);
  const start = source.indexOf("{", markerIndex);
  const end = source.lastIndexOf("};");
  if (markerIndex < 0 || start < 0 || end < start) {
    throw new Error("Could not parse authoritative Forensics course-data.js.");
  }
  return JSON.parse(source.slice(start, end + 1)) as GeneratedCourseData;
}
async function resolveExportRoot(mapData: D2LCourseMapData) {
  const configured = mapData.exportRoot?.trim();
  if (configured) {
    const configuredPath = path.join(workspaceRoot, configured);
    if (await exists(configuredPath)) return configuredPath;
  }
  const roots = await readdir(workspaceRoot, { withFileTypes: true });
  for (const entry of roots) {
    if (entry.isDirectory() && /^D2LCCExport/i.test(entry.name)) {
      return path.join(workspaceRoot, entry.name);
    }
  }
  throw new Error("Could not locate D2L export root in workspace.");
}
async function buildLessonHtml(exportRoot: string, lessonNodes: D2LMapItem[]) {
  const imageCopies: Array<{ from: string; to: string }> = [];
  const unresolvedImages: string[] = [];
  const resources = new Map<string, string>();
  const sections: string[] = [];
  let imageIndex = 0;
  for (const [index, node] of lessonNodes.entries()) {
    const href = node.resource?.hrefs?.[0];
    if (!href) {
      continue;
    }
    const { direct: resolveLessonSource, clean } = resolveSourceFile(
      exportRoot,
      href,
    );
    const sourcePath = await resolveLessonSource();
    const source = await readFile(sourcePath, "utf8");
    const $ = cheerio.load(source, { xmlMode: true });
    $("[data-progress-footer], .lesson-progress-footer").remove();
    $("button")
      .filter((_, element) => /Mark Complete/i.test($(element).text()))
      .remove();
    $("[data-progress-state]").removeAttr("data-progress-state");
    for (const element of $("img").toArray()) {
      const img = $(element);
      const src = img.attr("src") ?? "";
      if (!isLocalAsset(src)) continue;
      const variant = resolveSourceFile(exportRoot, src, sourcePath);
      const sourceImagePath = await variant.direct().catch(() => null);
      if (!sourceImagePath) {
        unresolvedImages.push(`${clean} -> ${src}`);
        continue;
      }
      imageIndex += 1;
      const destName = `module-1-image-${String(imageIndex).padStart(2, "0")}${assetExtension(src)}`;
      const destPath = path.join(imageOutputDir, destName);
      try {
        await copyFile(sourceImagePath, destPath);
        imageCopies.push({ from: sourceImagePath, to: destPath });
        img.attr("src", `assets/images/${destName}`);
      } catch {
        unresolvedImages.push(src);
      }
    }
    $("a[href]").each((_, element) => {
      const link = $(element);
      const hrefValue = link.attr("href") ?? "";
      const linkText = sanitizeQuickLinkText(link.text());
      const fallbackTitle = resourceLabelFromHref(hrefValue);
      const title = linkText || fallbackTitle || "Resource";
      if (/\/d2l\/common\/dialogs\/quickLink/i.test(hrefValue)) {
        if (/assignment/i.test(title.toLowerCase())) {
          resources.set(
            "./assignment/module1assignment.html",
            "Introduction to Crime Scenes Assignment",
          );
        } else if (/quiz/i.test(title.toLowerCase())) {
          resources.set("#quiz", "M1 Introduction to Crime Scenes Quiz");
        } else {
          resources.set(title, title);
        }
        link.replaceWith(`<span>${title}</span>`);
        return;
      }
      if (/^https?:\/\//i.test(hrefValue)) {
        const normalizedHref = hrefValue.replace(
          /^http:\/\/www\.youtube\.com\//i,
          "https://www.youtube.com/",
        );
        resources.set(normalizedHref, title.replace(/^http:\/\//i, "https://"));
        link.attr("href", normalizedHref);
        return;
      }
      link.attr("target", "_blank");
      if (!isLocalAsset(hrefValue)) {
        resources.set(hrefValue, title);
      }
    });
    $("iframe[src]").each((_, element) => {
      const frame = $(element);
      const frameSrc = frame.attr("src") ?? "";
      if (/\bd2l\b/i.test(frameSrc)) {
        frame.remove();
        return;
      }
      if (/^https?:\/\//i.test(frameSrc)) {
        const normalizedFrameSrc = frameSrc.replace(
          /^http:\/\/www\.youtube\.com\//i,
          "https://www.youtube.com/",
        );
        frame.attr("src", normalizedFrameSrc);
        const title = sanitizeQuickLinkText(frame.attr("title") || frameSrc);
        resources.set(
          normalizedFrameSrc,
          title.replace(/^http:\/\//i, "https://"),
        );
      }
    });
    let pageBody = $("body").length ? ($("body").html() ?? "") : $.html();
    pageBody = pageBody
      .replace(/<head[\s\S]*?<\/head>/gi, "")
      .replace(/<\/?(?:html|body)[^>]*>/gi, "")
      .replace(/<iframe([^>]*)\/>/gi, "<iframe$1></iframe>")
      .replace(/<a([^>]*)\/>/gi, "<a$1></a>")
      .replace(/<p([^>]*)\/>/gi, "<p$1></p>")
      .replace(
        /\/d2l\/common\/dialogs\/quickLink\/quickLink\.d2l\?[^<\s"]+/gi,
        "",
      )
      .replace(/continue to Module 2[^<]*/gi, "")
      .replace(/http:\/\/www\.youtube\.com\//gi, "https://www.youtube.com/");
    const heading = sanitizeQuickLinkText(node.title || `Lesson ${index + 1}`);
    sections.push(
      `<section class="lesson-page"><h2>${escapeHtml(heading)}</h2><div class="lesson-content">${pageBody}</div></section>`,
    );
  }
  sections.push(
    `<section class="lesson-page next-steps"><h2>Next Steps</h2><div class="lesson-content"><p>You have completed the Module 1 lesson.</p><p><a class="button" href="./assignment/module1assignment.html" target="_blank" rel="noopener">Open Module 1 Assignment</a> <a class="button secondary" href="./index.html#quiz" target="_parent">Take Module 1 Quiz</a></p><p>Submit completed work through Google Classroom.</p></div></section>`,
  );
  const lessonHtml = sections.join("\n");
  return {
    lesson: htmlPage(
      "Module 1 Lesson - Forensic Studies 25",
      lessonHtml,
      "styles.css",
    ),
    imageCount: imageCopies.length,
    unresolvedImages,
    resources: Array.from(resources, ([href, title]) => ({ title, href })),
  };
}
async function parseQuizXml(xmlSourcePath: string, fallbackTitle: string) {
  const source = await readFile(xmlSourcePath, "utf8");
  const $ = cheerio.load(source, { xmlMode: true });
  const title =
    $("assessment").attr("title")?.trim() || fallbackTitle || "Module 1 Quiz";
  const multipleChoice: QuizQuestion[] = [];
  $("item").each((index, element) => {
    const item = $(element);
    const promptRaw = item
      .find("presentation > material > mattext")
      .first()
      .text();
    const prompt = stripHtml(promptRaw);
    const options: Array<{ id: string; label: string; text: string }> = [];
    item
      .find("presentation response_lid render_choice response_label")
      .each((optionIndex, optionElement) => {
        const optionNode = $(optionElement);
        const id = optionNode.attr("ident") ?? "";
        const label = String.fromCharCode(65 + optionIndex);
        const rawText = optionNode.find("mattext").first().text();
        options.push({ id, label, text: stripHtml(rawText) });
      });
    let answerId = "";
    item.find("resprocessing respcondition").each((_, conditionElement) => {
      const condition = $(conditionElement);
      const id = condition.find("varequal").first().text().trim();
      if (!id) return;
      const setsScore = /SCORE/.test(
        condition.find("setvar").first().text() || "",
      );
      if (!answerId && setsScore) answerId = id;
    });
    if (!answerId) {
      answerId = item
        .find("resprocessing respcondition varequal")
        .first()
        .text()
        .trim();
    }
    const correct = options.find((option) => option.id === answerId);
    multipleChoice.push({
      number: index + 1,
      prompt,
      options: options.map((option) => ({
        label: option.label,
        text: option.text,
      })),
      answer: correct?.label ?? "A",
    });
  });
  return { title, multipleChoice };
}
async function firstAccessible(fileCandidates: string[]) {
  for (const candidate of fileCandidates) {
    if (await exists(candidate)) return candidate;
  }
  return "";
}
async function copyAssignmentFiles() {
  const assignmentOutput = path.join(outputRoot, "assignment");
  await mkdir(assignmentOutput, { recursive: true });
  const htmlSource = path.join(assignmentSourceRoot, "module1assignment.html");
  const bundleSource = path.join(
    assignmentSourceRoot,
    "module1assignment.bundle.js",
  );
  if (!(await exists(htmlSource)) || !(await exists(bundleSource))) {
    throw new Error("Assignment source files missing in workspace assets.");
  }
  let html = await readFile(htmlSource, "utf8");
  html = html.replace(
    /module1assignment\.bundle\.js\?[^"' ]*/gi,
    "module1assignment.bundle.js",
  );
  if (!/forensic-assignment-theme\.css/i.test(html)) {
    html = html.replace(
      "</head>",
      '  <link rel="stylesheet" href="./forensic-assignment-theme.css" />\n</head>',
    );
  }
  await writeFile(
    path.join(assignmentOutput, "module1assignment.html"),
    html,
    "utf8",
  );
  const bundle = await readFile(bundleSource, "utf8");
  const storageFreeBundle = bundle
    .replaceAll("window.localStorage.getItem", "(() => null)")
    .replaceAll("window.localStorage.setItem", "(() => undefined)")
    .replaceAll("window.localStorage.removeItem", "(() => undefined)")
    .replaceAll("window.localStorage.clear", "(() => undefined)")
    .replaceAll("window.sessionStorage.getItem", "(() => null)")
    .replaceAll("window.sessionStorage.setItem", "(() => undefined)")
    .replaceAll("window.sessionStorage.removeItem", "(() => undefined)")
    .replaceAll("window.sessionStorage.clear", "(() => undefined)");
  await writeFile(
    path.join(assignmentOutput, "module1assignment.bundle.js"),
    storageFreeBundle,
    "utf8",
  );
  const themeSource = await firstAccessible(assignmentThemeCssCandidates);
  const printSource = await firstAccessible(assignmentPrintJsCandidates);
  const copiedTheme: string[] = [];
  if (themeSource) {
    await copyFile(
      themeSource,
      path.join(assignmentOutput, "forensic-assignment-theme.css"),
    );
    copiedTheme.push(themeSource);
  }
  if (printSource) {
    await copyFile(
      printSource,
      path.join(assignmentOutput, "forensic-assignment-print.js"),
    );
    copiedTheme.push(printSource);
  }
  return copiedTheme;
}
async function buildForensicsModule1() {
  const courseMap = await loadMapData();
  const authoritativeData = await loadAuthoritativeCourseData();
  const authoritativeChapter =
    authoritativeData.chapters?.find((chapter) => chapter.id === "chapter-1") ??
    null;
  const authoritativeQuiz =
    authoritativeData.quizzes?.find((quiz) => quiz.id === "quiz-1") ?? null;
  const authoritativeAssignment =
    authoritativeData.assignments?.find(
      (assignment) => assignment.id === "assignment-1",
    ) ?? null;
  if (!authoritativeChapter || !authoritativeQuiz || !authoritativeAssignment) {
    throw new Error("Authoritative Module 1 data is incomplete.");
  }
  const moduleDataRoot = courseMap.modules?.[0] ?? null;
  if (!moduleDataRoot) {
    throw new Error("No module entry found in d2l map data.");
  }
  const moduleFolder =
    moduleDataRoot.children?.find((child) => child.kind === "folder") ?? null;
  const lessonNodes = collectModule1Nodes(moduleFolder).filter(
    (node) => !/unit assessments/i.test(node.title),
  );
  if (!lessonNodes.length) {
    throw new Error("No Module 1 lesson pages were discovered.");
  }
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
  await mkdir(imageOutputDir, { recursive: true });
  const exportRoot = await resolveExportRoot(courseMap);
  const lessonAssets = await buildLessonHtml(exportRoot, lessonNodes);
  const quizParsed = {
    title: authoritativeQuiz.title,
    multipleChoice: authoritativeQuiz.multipleChoice,
  };
  const copiedTheme = await copyAssignmentFiles();
  const resources = new Map<string, string>(
    lessonAssets.resources.map((resource) => [resource.href, resource.title]),
  );
  resources.set(
    "./assignment/module1assignment.html",
    authoritativeAssignment.title,
  );
  if (!resources.has("#quiz")) {
    resources.set("#quiz", quizParsed.title);
  }
  const data = {
    course: { title: "Forensic Studies 25" },
    chapter: {
      id: authoritativeChapter.id,
      title: authoritativeChapter.title,
      code: authoritativeChapter.code,
      summary: authoritativeChapter.summary,
      componentCount: authoritativeChapter.componentCount,
    },
    quiz: {
      id: authoritativeQuiz.id,
      title: quizParsed.title,
      multipleChoice: quizParsed.multipleChoice,
    },
    assignment: {
      id: authoritativeAssignment.id,
      title: authoritativeAssignment.title,
    },
    resources: Array.from(resources, ([href, title]) => ({ title, href })),
  } satisfies Module1StaticData;
  await writeFile(path.join(outputRoot, "index.html"), indexHtml(), "utf8");
  await writeFile(path.join(outputRoot, "styles.css"), stylesCss(), "utf8");
  await writeFile(path.join(outputRoot, "module-1.js"), moduleJs(), "utf8");
  await writeFile(
    path.join(outputRoot, "module-1-data.js"),
    `const MODULE_1_DATA = ${JSON.stringify(data, null, 2)};\nwindow.MODULE_1_DATA = MODULE_1_DATA;\n`,
    "utf8",
  );
  await writeFile(
    path.join(outputRoot, "lesson.html"),
    lessonAssets.lesson,
    "utf8",
  );
  await writeFile(path.join(outputRoot, "README.md"), readme(), "utf8");
  await writeFile(
    path.join(outputRoot, "MIGRATION_REPORT.md"),
    migrationReport(
      lessonAssets.imageCount,
      lessonAssets.unresolvedImages,
      lessonAssets.resources,
      copiedTheme,
    ),
    "utf8",
  );
  await writeFile(
    path.join(outputRoot, "ACCEPTANCE_CHECKLIST.md"),
    acceptanceChecklist(),
    "utf8",
  );
}
buildForensicsModule1()
  .then(() => {
    console.log(`Built ${path.relative(process.cwd(), outputRoot)}.`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
