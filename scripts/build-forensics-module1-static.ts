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
  return "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <title>Forensic Studies 25 | Module 1</title>\n  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n  <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n  <link href=\"https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&family=Open+Sans:wght@400;500;600;700;800&display=swap\" rel=\"stylesheet\">\n  <link href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css\" rel=\"stylesheet\" />\n  <link rel=\"stylesheet\" href=\"./styles.css\" />\n</head>\n<body data-project-slug=\"forensics-module1\" data-shell-variant=\"option-2-static\" data-route=\"chapter-1\">\n  <div class=\"app-shell\">\n    <aside class=\"sidebar\">\n      <div class=\"sidebar-top\">\n        <div class=\"brand-lockup\">\n          <div class=\"brand-text\"><h1>Forensic Studies 25</h1></div>\n        </div>\n        <button id=\"menu-toggle\" class=\"menu-toggle\" type=\"button\" aria-expanded=\"false\" title=\"Toggle navigation\"><span></span><span></span><span></span></button>\n      </div>\n      <nav class=\"sidebar-nav\" aria-label=\"Primary navigation\">\n        <div class=\"nav-group primary-nav\"><a id=\"nav-home\" class=\"nav-item active\" data-nav=\"chapters\" href=\"#chapter-1\"><i class=\"fa-solid fa-house\"></i><span>Home</span></a></div>\n        <div class=\"nav-group home-tabs\" aria-label=\"Home sections\">\n          <a id=\"tab-chapters\" class=\"home-tab active\" data-nav=\"chapters\" href=\"#chapter-1\"><i class=\"fa-solid fa-scroll\"></i><span>Chapters</span></a>\n          <a id=\"tab-quizzes\" class=\"home-tab\" data-nav=\"quizzes\" href=\"#quiz-1\"><i class=\"fa-solid fa-circle-question\"></i><span>Quizzes</span></a>\n          <a id=\"tab-assignments\" class=\"home-tab\" data-nav=\"assignments\" href=\"#assignment-1\"><i class=\"fa-solid fa-pen\"></i><span>Assignments</span></a>\n        </div>\n      </nav>\n    </aside>\n    <main class=\"content\">\n      <div class=\"content-inner\">\n        <section class=\"content-shell\">\n          <div class=\"section-header\">\n            <h3 id=\"section-title\">Chapters</h3>\n            <p id=\"section-intro\">Open Module 1 content, launch the quiz, and review the assignment package.</p>\n          </div>\n          <div id=\"content-body\" class=\"content-body\"></div>\n        </section>\n      </div>\n    </main>\n  </div>\n  <script src=\"./module-1-data.js\"></script>\n  <script src=\"./module-1.js\"></script>\n</body>\n</html>\r\n";
}
function stylesCss() {
  return ":root{--bg:#f3f4f3;--surface:#fff;--surface-muted:#f3f4f3;--surface-soft:#f7f8f6;--text:#1a1c1a;--muted:#606762;--muted-strong:#3c3f3e;--line:#d9dad9;--line-strong:#c3c8c1;--primary:#59a844;--primary-strong:#4b8d39;--primary-deep:#12620c;--danger:#ba1a1a;--success:#3f9f2e;--radius-xl:10px;--radius-lg:10px;--radius-md:8px;--content-width:min(1420px,calc(100vw - 72px))}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;min-height:100vh;color:var(--text);font-family:\"Open Sans\",sans-serif;background:var(--bg);overflow-x:hidden}body:before{content:\"\";position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(to right,rgba(217,218,217,.42) 1px,transparent 1px),linear-gradient(to bottom,rgba(217,218,217,.32) 1px,transparent 1px);background-size:24px 24px;opacity:.34;z-index:-2}button,input,select,textarea{font:inherit}button{cursor:pointer}a{color:inherit}[hidden]{display:none!important}.app-shell{display:grid;grid-template-columns:252px minmax(0,1fr);min-height:100vh}body.sidebar-collapsed .app-shell{grid-template-columns:82px minmax(0,1fr)}.sidebar{position:sticky;top:0;min-height:100vh;background:#3c3f3e;border-right:1px solid #303332;z-index:20}.sidebar-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:28px 18px 20px;border-bottom:1px solid #4b4e4d}.brand-text h1{margin:0;color:#fff;font-family:Rubik,sans-serif;font-size:1.55rem;font-weight:800;line-height:1.08}.brand-text:after{content:\"Scholarly access\";display:block;margin-top:8px;color:#c9ceca;font-size:.69rem;font-weight:700;letter-spacing:.24em;text-transform:uppercase}.menu-toggle{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:40px;height:40px;padding:0;border:1px solid #5a5e5d;border-radius:8px;background:#4b4e4d;color:#fff;flex:0 0 auto;gap:3px}.menu-toggle span{display:block;width:18px;height:2px;background:currentColor}.sidebar-nav{display:grid;gap:24px;padding:22px 18px 28px}.nav-group{display:grid;gap:6px}.nav-item,.home-tab{display:flex;align-items:center;gap:12px;width:100%;min-height:48px;padding:0 14px 0 18px;border:1px solid transparent;border-left:3px solid transparent;border-radius:8px;background:transparent;color:#e7e7e5;text-align:left;font-family:\"Open Sans\",sans-serif;font-size:.92rem;font-weight:600;text-decoration:none;transition:background-color .16s ease,color .16s ease,border-color .16s ease}.nav-item i,.home-tab i{width:16px;text-align:center;color:currentColor}.nav-item:hover,.home-tab:hover{background:#4b4e4d;color:#fff}.nav-item.active,.home-tab.active{background:var(--primary);color:#fff;border-color:var(--primary)}body.sidebar-collapsed .brand-text,body.sidebar-collapsed .nav-item span,body.sidebar-collapsed .home-tab span{display:none}body.sidebar-collapsed .sidebar-top{justify-content:center;padding-inline:8px}body.sidebar-collapsed .brand-lockup{display:none}body.sidebar-collapsed .sidebar-nav{padding-inline:8px}body.sidebar-collapsed .nav-item,body.sidebar-collapsed .home-tab{justify-content:center;padding-inline:0}.content{min-width:0}.content-inner{width:var(--content-width);max-width:100%;margin:0 auto;padding:32px 28px 64px}.content-shell,.course-card,.detail-card,.quiz-shell,.assignment-frame-shell,.empty-state{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius-xl);box-shadow:none}.content-shell{padding:28px 30px 32px}.section-header{margin-bottom:28px;padding-bottom:18px;border-bottom:1px solid var(--line)}.section-header h3{margin:0;font-family:Rubik,sans-serif;font-size:clamp(2.2rem,3.4vw,3rem);line-height:1.08}.section-header p{margin:12px 0 0;max-width:64ch;color:var(--muted);font-size:1rem;line-height:1.65}.card-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.course-card,.detail-card,.quiz-shell,.empty-state{position:relative;overflow:hidden;display:grid;gap:16px;padding:22px;border-left:3px solid var(--accent,var(--primary))}.card-code,.detail-eyebrow,.assessment-kicker,.assignment-kicker{margin:0;color:var(--primary-strong);font-size:.7rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.card-title,.detail-title,.assessment-title{margin:0;font-family:Rubik,sans-serif;font-size:1.75rem;line-height:1.12}.detail-title,.assessment-title{font-size:clamp(2rem,3vw,2.85rem)}.card-summary,.card-meta,.detail-summary,.quiz-copy p,.assignment-copy,.empty-state{color:var(--muted);font-size:.98rem;line-height:1.72}.card-meta{display:grid;gap:8px}.card-meta strong{color:var(--text)}.card-actions,.detail-actions,.quiz-actions,.assignment-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 16px;border:1px solid var(--line-strong);border-radius:8px;background:#fff;color:var(--text);font-weight:800;text-decoration:none;letter-spacing:.02em}.btn:hover{border-color:var(--primary);color:var(--primary-strong)}.btn-primary{background:var(--primary);border-color:var(--primary);color:#fff}.btn-primary:hover{background:var(--primary-strong);color:#fff}.btn-secondary{background:#fff;color:var(--primary-strong)}.chapter-detail-surface,.assignment-detail-surface{display:grid;gap:18px}.chapter-head,.assignment-head{display:grid;gap:12px;padding:22px;border:1px solid var(--line);border-radius:var(--radius-lg);background:#fff}.module-completion-badge{display:inline-flex;width:max-content;padding:6px 9px;border:1px solid #dce6d8;border-radius:8px;color:var(--primary-strong);font-size:.76rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.chapter-content-shell{padding:18px;border:1px solid var(--line);border-radius:var(--radius-lg);background:#fff}.chapter-content-frame,.assignment-frame{display:block;width:100%;border:1px solid var(--line);border-radius:var(--radius-md);background:#fff}.chapter-content-frame{min-height:calc(100vh - 120px)}.assignment-frame{min-height:1360px}.assessment-shell{border:1px solid var(--line);border-radius:var(--radius-lg);background:#fff;overflow:hidden}.assessment-top{display:grid;gap:24px;padding:28px 28px 30px;border-bottom:1px solid var(--line);box-shadow:0 2px 8px rgba(0,0,0,.04)}.assessment-meta{display:flex;flex-wrap:wrap;gap:42px;color:var(--text)}.assessment-meta span{display:block;margin-bottom:4px;color:var(--primary-strong);font-size:.72rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.evaluation-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:center}.evaluation-copy h4{margin:0 0 10px;font-family:Rubik,sans-serif;font-size:2rem}.evaluation-copy p{max-width:38ch;margin:0;color:var(--muted);line-height:1.65}.score-display{display:flex;align-items:flex-end;gap:8px;font-family:Rubik,sans-serif}.score-display strong{color:var(--primary);font-size:4.8rem;line-height:.85}.score-display span{font-size:2.5rem;font-weight:800}.score-note{margin-top:8px;color:#b00000;font-size:.72rem;font-weight:800;letter-spacing:.18em;text-align:right;text-transform:uppercase}.assessment-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.assessment-actions .back-link{margin-left:auto;color:var(--text);font-weight:800;text-decoration:none}.section-breakdown{padding:22px 28px;border-bottom:1px solid var(--line)}.section-breakdown h4{margin:0;font-family:Rubik,sans-serif;font-size:2rem}.breakdown-row{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:#eceeed}.breakdown-row strong{font-size:1.05rem}.breakdown-row span{font-size:1.5rem}.quiz-form{display:grid;gap:10px;padding:10px 0 0}.quiz-question{display:grid;grid-template-columns:46px minmax(0,1fr);gap:14px;padding:22px;border-top:1px solid var(--line);background:#fff}.question-number{display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:10px;background:#e7f3e2;color:var(--primary-strong);font-weight:800}.question-body h4{margin:0 0 14px;font-family:\"Open Sans\",sans-serif;font-size:1rem}.quiz-options{display:grid;gap:12px}.quiz-option{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--muted-strong)}.quiz-option input{margin-top:3px}.quiz-option strong{color:var(--primary-strong);margin-right:8px}.quiz-question.is-correct{border-left:5px solid var(--success)}.quiz-question.is-incorrect{border-left:5px solid var(--danger)}.quiz-feedback{min-height:1.35em;color:var(--muted-strong);font-weight:800}.assignment-brief-card{display:grid;gap:12px;padding:22px;border:1px solid var(--line);border-radius:var(--radius-lg);background:#fff}.assignment-brief-card img{display:block;width:min(390px,100%);margin:0 auto;border-radius:8px}.assignment-frame-shell{padding:14px;background:#e8f1e3}.lesson-page{max-width:980px;margin:0 auto 24px;padding:26px;background:#fff;border:1px solid var(--line);border-left:3px solid var(--primary);border-radius:var(--radius-xl)}.lesson-page h2{margin:0 0 18px;font-family:Rubik,sans-serif;font-size:clamp(1.7rem,3vw,2.35rem);line-height:1.12}.lesson-content{color:var(--text);line-height:1.7}.lesson-content :where(img,iframe,video){max-width:100%;border-radius:8px}.lesson-content table{max-width:100%;border-collapse:collapse}.lesson-content td,.lesson-content th{border:1px solid var(--line);padding:8px}.next-steps{border-left-color:var(--primary-strong)}@media (max-width:940px){.app-shell{grid-template-columns:1fr}.sidebar{position:relative;min-height:auto}.sidebar-nav{grid-template-columns:repeat(2,minmax(0,1fr))}.home-tabs{grid-template-columns:1fr}.content-inner{width:100%;padding:18px}.card-grid{grid-template-columns:1fr}.evaluation-row{grid-template-columns:1fr}.assessment-actions .back-link{margin-left:0}.quiz-question{grid-template-columns:1fr}.score-note{text-align:left}}@media (max-width:620px){.sidebar-top{padding:18px 16px}.sidebar-nav{grid-template-columns:1fr;padding:16px}.content-shell{padding:20px}.lesson-page{padding:18px}.chapter-content-frame,.assignment-frame{min-height:760px}.assessment-top,.section-breakdown{padding:20px}.score-display strong{font-size:3.5rem}}\r\n";
}
function moduleJs() {
  return "(() => {\n  const data = window.MODULE_1_DATA;\n  const body = document.body;\n  const sectionTitle = document.getElementById(\"section-title\");\n  const sectionIntro = document.getElementById(\"section-intro\");\n  const content = document.getElementById(\"content-body\");\n  const navItems = Array.from(document.querySelectorAll(\"[data-nav]\"));\n\n  function escapeHtml(value) {\n    return String(value ?? \"\").replace(/[&<>\"']/g, (char) => ({ \"&\": \"&amp;\", \"<\": \"&lt;\", \">\": \"&gt;\", '\"': \"&quot;\", \"'\": \"&#39;\" })[char]);\n  }\n\n  function normalizeRoute() {\n    const hash = location.hash.replace(/^#/, \"\").trim();\n    if ([\"chapter-1\", \"lesson\"].includes(hash)) return \"chapter-1\";\n    if ([\"quiz-1\", \"quiz\"].includes(hash)) return \"quiz-1\";\n    if ([\"assignment-1\", \"assignment\"].includes(hash)) return \"assignment-1\";\n    if (hash === \"quizzes\") return \"quiz-1\";\n    if (hash === \"assignments\") return \"assignment-1\";\n    return \"chapter-1\";\n  }\n\n  function navGroup(route) {\n    if (route === \"quiz-1\" || route === \"quizzes\") return \"quizzes\";\n    if (route === \"assignment-1\" || route === \"assignments\") return \"assignments\";\n    return \"chapters\";\n  }\n\n  function setChrome(route, title, intro) {\n    body.dataset.route = route;\n    sectionTitle.textContent = title;\n    sectionIntro.textContent = intro;\n    const group = navGroup(route);\n    navItems.forEach((item) => item.classList.toggle(\"active\", item.dataset.nav === group));\n  }\n\n  function renderChapters() {\n    setChrome(\"chapters\", \"Chapters\", \"Open module content, launch embedded assignments, and review the source-linked quiz.\");\n    content.innerHTML = `\n      <div class=\"card-grid\">\n        <article class=\"course-card\" style=\"--accent:#8b6a24\">\n          <p class=\"card-code\">${escapeHtml(data.chapter.code)}</p>\n          <h4 class=\"card-title\">${escapeHtml(data.chapter.title)}</h4>\n          <p class=\"card-summary\">${escapeHtml(data.chapter.summary)}</p>\n          <div class=\"card-meta\">\n            <span><strong>${escapeHtml(String(data.chapter.componentCount))}</strong> lesson components retained.</span>\n            <span><strong>${escapeHtml(data.quiz.title)}</strong></span>\n            <span><strong>${escapeHtml(data.assignment.title)}</strong></span>\n          </div>\n          <div class=\"card-actions\">\n            <a class=\"btn btn-primary\" href=\"#chapter-1\"><i class=\"fa-solid fa-arrow-right\"></i> Open module</a>\n            <a class=\"btn btn-secondary\" href=\"#quiz-1\"><i class=\"fa-solid fa-circle-question\"></i> Open test</a>\n          </div>\n        </article>\n        <article class=\"course-card\" style=\"--accent:#59a844\">\n          <p class=\"card-code\">Static review</p>\n          <h4 class=\"card-title\">Module 1 package</h4>\n          <p class=\"card-summary\">This package is limited to Module 1 and keeps the Option Two view model without progress storage or locked states.</p>\n          <div class=\"card-actions\">\n            <a class=\"btn btn-secondary\" href=\"#assignment-1\"><i class=\"fa-solid fa-pen\"></i> Assignment library</a>\n          </div>\n        </article>\n      </div>`;\n  }\n\n  function renderChapterDetail() {\n    setChrome(\"chapter-1\", data.chapter.title, data.chapter.summary);\n    content.innerHTML = `\n      <div class=\"chapter-detail-surface\">\n        <article class=\"chapter-head\">\n          <p class=\"detail-eyebrow\">${escapeHtml(data.chapter.code)}</p>\n          <h4 class=\"detail-title\">${escapeHtml(data.chapter.title)}</h4>\n          <p class=\"detail-summary\">${escapeHtml(data.chapter.summary)}</p>\n          <span class=\"module-completion-badge\">0/${escapeHtml(String(data.chapter.componentCount))} components complete</span>\n          <div class=\"detail-actions\">\n            <a class=\"btn btn-primary\" href=\"#quiz-1\">Open test</a>\n            <a class=\"btn btn-secondary\" href=\"#assignment-1\">Open assignment</a>\n          </div>\n        </article>\n        <div class=\"chapter-content-shell\">\n          <iframe class=\"chapter-content-frame\" src=\"./lesson.html\" title=\"${escapeHtml(data.chapter.title)} lesson content\"></iframe>\n        </div>\n      </div>`;\n  }\n\n  function renderQuizzes() {\n    setChrome(\"quizzes\", \"Quizzes\", \"Open the Module 1 assessment view.\");\n    content.innerHTML = `\n      <article class=\"course-card\" style=\"--accent:#59a844\">\n        <p class=\"card-code\">Forensic Studies 25 Assessment</p>\n        <h4 class=\"card-title\">${escapeHtml(data.quiz.title)}</h4>\n        <p class=\"card-summary\">Five multiple-choice questions from Module 1. Results are checked locally and are not saved.</p>\n        <div class=\"card-actions\">\n          <a class=\"btn btn-primary\" href=\"#quiz-1\"><i class=\"fa-solid fa-circle-question\"></i> Open quiz</a>\n          <a class=\"btn btn-secondary\" href=\"#chapter-1\">Back to module</a>\n        </div>\n      </article>`;\n  }\n\n  function renderQuizDetail() {\n    setChrome(\"quiz-1\", \"Quizzes\", \"Answer the Module 1 quiz locally. Results are shown on screen only and are not saved.\");\n    const questions = data.quiz.multipleChoice.map((question) => {\n      const options = question.options.map((option) => `\n        <label class=\"quiz-option\">\n          <input type=\"radio\" name=\"question-${escapeHtml(question.number)}\" value=\"${escapeHtml(option.label)}\" />\n          <span><strong>${escapeHtml(option.label)}</strong>${escapeHtml(option.text)}</span>\n        </label>`).join(\"\");\n      return `\n        <section class=\"quiz-question\" data-question=\"${escapeHtml(question.number)}\">\n          <div class=\"question-number\">${escapeHtml(question.number)}</div>\n          <div class=\"question-body\">\n            <h4>${escapeHtml(question.prompt)}</h4>\n            <div class=\"quiz-options\">${options}</div>\n            <div class=\"quiz-feedback\" aria-live=\"polite\"></div>\n          </div>\n        </section>`;\n    }).join(\"\");\n\n    content.innerHTML = `\n      <article class=\"assessment-shell\">\n        <div class=\"assessment-top\">\n          <p class=\"assessment-kicker\">Forensic Studies 25 â€¢ Assessment</p>\n          <h4 class=\"assessment-title\">Quiz 1: ${escapeHtml(data.quiz.title)}</h4>\n          <div class=\"assessment-meta\">\n            <div><span>Status</span>In progress</div>\n            <div><span>Submitted</span>Not yet submitted</div>\n          </div>\n          <div class=\"evaluation-row\">\n            <div class=\"evaluation-copy\">\n              <h4>Final Evaluation</h4>\n              <p>This counter tracks completed questions only. Marks are handled separately, and written responses are reviewed manually.</p>\n            </div>\n            <div>\n              <div class=\"score-display\"><strong id=\"score-count\">0</strong><span>/5</span></div>\n              <div id=\"score-note\" class=\"score-note\">0 questions completed</div>\n            </div>\n          </div>\n          <div class=\"assessment-actions\">\n            <button id=\"generate-results\" class=\"btn btn-primary\" type=\"button\">Generate results</button>\n            <button id=\"check-answers\" class=\"btn btn-secondary\" type=\"button\">Check answers</button>\n            <button id=\"retake-quiz\" class=\"btn btn-secondary\" type=\"button\">Retake quiz</button>\n            <a class=\"back-link\" href=\"#chapter-1\">Back to module</a>\n          </div>\n        </div>\n        <div class=\"section-breakdown\"><h4>Section Breakdown</h4></div>\n        <div class=\"breakdown-row\"><strong>Multiple Choice<br><small>Questions 1-5</small></strong><span id=\"breakdown-count\">0/5</span></div>\n        <form id=\"quiz-form\" class=\"quiz-form\">${questions}</form>\n      </article>`;\n    bindQuiz();\n  }\n\n  function renderAssignments() {\n    setChrome(\"assignments\", \"Assignments\", \"Open the Module 1 assignment surface.\");\n    content.innerHTML = `\n      <article class=\"course-card\" style=\"--accent:#59a844\">\n        <p class=\"card-code\">Assignment</p>\n        <h4 class=\"card-title\">${escapeHtml(data.assignment.title)}</h4>\n        <p class=\"card-summary\">Review Locard's Exchange Principle and apply it to the introductory crime scene case.</p>\n        <div class=\"card-actions\">\n          <a class=\"btn btn-primary\" href=\"#assignment-1\"><i class=\"fa-solid fa-pen\"></i> Open assignment</a>\n          <a class=\"btn btn-secondary\" href=\"#chapter-1\">Back to module</a>\n        </div>\n      </article>`;\n  }\n\n  function renderAssignmentDetail() {\n    setChrome(\"assignment-1\", \"Assignments\", \"Complete the Module 1 assignment surface in the local static package.\");\n    content.innerHTML = `\n      <div class=\"assignment-detail-surface\">\n        <article class=\"assignment-brief-card\">\n          <p class=\"assignment-kicker\">Assignment details</p>\n          <h4 class=\"card-title\">${escapeHtml(data.assignment.title)}</h4>\n          <p class=\"assignment-copy\">Review Locard's Exchange Principle and apply it to the introductory crime scene case.</p>\n          <p class=\"assignment-copy\"><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>\n          <div class=\"assignment-actions\">\n            <a class=\"btn btn-primary\" href=\"./assignment/module1assignment.html\" target=\"_blank\" rel=\"noopener\">Open full screen</a>\n            <a class=\"btn btn-secondary\" href=\"#chapter-1\">Back to module</a>\n          </div>\n        </article>\n        <div class=\"assignment-frame-shell\">\n          <iframe class=\"assignment-frame\" src=\"./assignment/module1assignment.html\" title=\"${escapeHtml(data.assignment.title)}\"></iframe>\n        </div>\n      </div>`;\n  }\n\n  function answeredCount() {\n    return data.quiz.multipleChoice.filter((question) => document.querySelector('input[name=\"question-' + question.number + '\"]:checked')).length;\n  }\n\n  function checkAnswers() {\n    let score = 0;\n    data.quiz.multipleChoice.forEach((question) => {\n      const card = document.querySelector('[data-question=\"' + question.number + '\"]');\n      const selected = document.querySelector('input[name=\"question-' + question.number + '\"]:checked');\n      const isCorrect = Boolean(selected && selected.value === question.answer);\n      if (isCorrect) score += 1;\n      card.classList.toggle(\"is-correct\", isCorrect);\n      card.classList.toggle(\"is-incorrect\", Boolean(selected) && !isCorrect);\n      card.querySelector(\".quiz-feedback\").textContent = selected ? (isCorrect ? \"Correct\" : \"Correct answer: \" + question.answer) : \"No answer selected.\";\n    });\n    const answered = answeredCount();\n    document.getElementById(\"score-count\").textContent = String(score);\n    document.getElementById(\"score-note\").textContent = answered + \" questions completed\";\n    document.getElementById(\"breakdown-count\").textContent = answered + \"/\" + data.quiz.multipleChoice.length;\n  }\n\n  function resetQuiz() {\n    document.getElementById(\"quiz-form\").reset();\n    document.getElementById(\"score-count\").textContent = \"0\";\n    document.getElementById(\"score-note\").textContent = \"0 questions completed\";\n    document.getElementById(\"breakdown-count\").textContent = \"0/\" + data.quiz.multipleChoice.length;\n    document.querySelectorAll(\".quiz-question\").forEach((card) => {\n      card.classList.remove(\"is-correct\", \"is-incorrect\");\n      card.querySelector(\".quiz-feedback\").textContent = \"\";\n    });\n  }\n\n  function bindQuiz() {\n    document.getElementById(\"check-answers\")?.addEventListener(\"click\", checkAnswers);\n    document.getElementById(\"generate-results\")?.addEventListener(\"click\", checkAnswers);\n    document.getElementById(\"retake-quiz\")?.addEventListener(\"click\", resetQuiz);\n  }\n\n  function renderRoute() {\n    const route = normalizeRoute();\n    if (!location.hash) history.replaceState(null, \"\", \"#chapter-1\");\n    if (route === \"chapter-1\") return renderChapterDetail();\n    if (route === \"quiz-1\") return renderQuizDetail();\n    if (route === \"assignment-1\") return renderAssignmentDetail();\n    return renderChapterDetail();\n  }\n\n  document.getElementById(\"menu-toggle\")?.addEventListener(\"click\", () => document.body.classList.toggle(\"sidebar-collapsed\"));\n  window.addEventListener(\"hashchange\", renderRoute);\n  renderRoute();\n})();\r\n";
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
  html = html.replace(/<body([^>]*)>/i, (match, attrs: string) => {
    if (/class\s*=/i.test(attrs)) {
      return match.replace(
        /class=(["'])(.*?)\1/i,
        (_classMatch, quote: string, className: string) =>
          `class=${quote}${className} forensic-assignment-theme${quote}`,
      );
    }
    return `<body${attrs} class="forensic-assignment-theme">`;
  });
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








