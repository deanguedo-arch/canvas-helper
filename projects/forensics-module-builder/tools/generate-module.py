#!/usr/bin/env python3
import argparse
import json
import re
import shutil
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "workspace" / "source-package" / "workspace-source"
TEMPLATE = ROOT / "workspace" / "approved-template" / "module-1-static"
DIST = ROOT / "dist"
DATA = SOURCE / "course-data.js"
SUPPORTED = set(range(2, 9))
NO_QUIZ = "No quiz is assigned for this module. Complete the lesson and assignment, then follow your teacher's Classroom instructions."


def read(path):
    return path.read_text(encoding="utf-8", errors="replace")


def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")


def load_course_data():
    text = read(DATA)
    match = re.search(r"window\.FORENSIC_STUDIES_OPTION2_DATA\s*=\s*(\{.*\})\s*;?\s*$", text, re.S)
    if not match:
        raise RuntimeError("Could not parse source course-data.js")
    return json.loads(match.group(1))


def html_escape(value):
    return str(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def module_assignment_file(number):
    return f"module{number}assignment.html"


def index_html(number):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Forensic Studies 25 | Module {number}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&family=Open+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="./styles.css" />
</head>
<body data-project-slug="forensics-module{number}" data-shell-variant="option-2-static" data-route="overview">
  <div class="app-shell">
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="brand-lockup"><div class="brand-text"><h1>Forensic Studies 25</h1></div></div>
        <button id="menu-toggle" class="menu-toggle" type="button" aria-expanded="false" title="Toggle navigation"><span></span><span></span><span></span></button>
      </div>
      <nav class="sidebar-nav" aria-label="Primary navigation">
        <div class="nav-group primary-nav"><a id="nav-overview" class="nav-item active" data-nav="overview" href="#overview"><i class="fa-solid fa-house"></i><span>Overview</span></a></div>
        <div class="nav-group home-tabs" aria-label="Module sections">
          <a class="home-tab" data-nav="lesson" href="#lesson"><i class="fa-solid fa-scroll"></i><span>Lesson</span></a>
          <a class="home-tab" data-nav="quiz" href="#quiz"><i class="fa-solid fa-circle-question"></i><span>Quiz</span></a>
          <a class="home-tab" data-nav="assignment" href="#assignment"><i class="fa-solid fa-pen"></i><span>Assignment</span></a>
          <a class="home-tab" data-nav="resources" href="#resources"><i class="fa-solid fa-link"></i><span>Resources</span></a>
        </div>
      </nav>
    </aside>
    <main class="content"><div class="content-inner"><section class="content-shell">
      <div class="section-header"><h3 id="section-title">Overview</h3><p id="section-intro">Review the Module {number} workflow, then complete the lesson, quiz, and assignment.</p></div>
      <div id="content-body" class="content-body"></div>
    </section></div></main>
  </div>
  <script src="./module-data.js"></script>
  <script src="./module.js"></script>
</body>
</html>
"""


def module_js():
    return r'''(() => {
  const data = window.MODULE_DATA;
  const body = document.body;
  const sectionTitle = document.getElementById("section-title");
  const sectionIntro = document.getElementById("section-intro");
  const content = document.getElementById("content-body");
  const navItems = Array.from(document.querySelectorAll("[data-nav]"));

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  function routeName() {
    const hash = location.hash.replace(/^#/, "").trim();
    if (!hash || hash === "home" || hash === "overview") return "overview";
    if (hash === "lesson" || hash === data.chapter.id) return "lesson";
    if (hash === "quiz" || hash === data.quiz?.id) return "quiz";
    if (hash === "assignment" || hash === data.assignment.id) return "assignment";
    if (hash === "resources") return "resources";
    return "overview";
  }

  function chrome(route, title, intro) {
    body.dataset.route = route;
    sectionTitle.textContent = title;
    sectionIntro.textContent = intro;
    navItems.forEach((item) => item.classList.toggle("active", item.dataset.nav === route));
  }

  function renderOverview() {
    chrome("overview", "Overview", "Review this module workflow, then complete the lesson, quiz, and assignment.");
    const quizTitle = data.quiz ? data.quiz.title : "No quiz assigned";
    content.innerHTML = `
      <div class="card-grid">
        <article class="course-card" style="--accent:#59a844">
          <p class="card-code">${escapeHtml(data.chapter.code)}</p>
          <h4 class="card-title">${escapeHtml(data.chapter.title)}</h4>
          <p class="card-summary">${escapeHtml(data.chapter.summary)}</p>
          <div class="card-meta">
            <span><strong>${escapeHtml(String(data.chapter.componentCount))}</strong> lesson components</span>
            <span><strong>${escapeHtml(quizTitle)}</strong></span>
            <span><strong>${escapeHtml(data.assignment.title)}</strong></span>
          </div>
          <div class="card-actions">
            <a class="btn btn-primary" href="#lesson"><i class="fa-solid fa-arrow-right"></i> Start lesson</a>
            <a class="btn btn-secondary" href="#quiz"><i class="fa-solid fa-circle-question"></i> Open quiz</a>
          </div>
        </article>
        <article class="course-card" style="--accent:#3c3f3e">
          <p class="card-code">Student workflow</p>
          <h4 class="card-title">Complete Module ${escapeHtml(data.module.number)}</h4>
          <ol class="card-summary"><li>Complete the lesson.</li><li>Take the quiz.</li><li>Complete the assignment.</li><li>Submit through Google Classroom.</li></ol>
          <div class="card-actions">
            <a class="btn btn-secondary" href="#assignment"><i class="fa-solid fa-pen"></i> Open assignment</a>
            <a class="btn btn-secondary" href="#resources"><i class="fa-solid fa-link"></i> View resources</a>
          </div>
        </article>
      </div>`;
  }

  function renderLesson() {
    chrome("lesson", "Lesson", data.chapter.summary);
    content.innerHTML = `
      <div class="chapter-detail-surface">
        <article class="chapter-head">
          <p class="detail-eyebrow">${escapeHtml(data.chapter.code)}</p>
          <h4 class="detail-title">${escapeHtml(data.chapter.title)}</h4>
          <p class="detail-summary">${escapeHtml(data.chapter.summary)}</p>
          <span class="module-completion-badge">${escapeHtml(String(data.chapter.componentCount))} lesson components retained</span>
          <div class="detail-actions"><a class="btn btn-primary" href="#quiz">Open quiz</a><a class="btn btn-secondary" href="#assignment">Open assignment</a></div>
        </article>
        <div class="chapter-content-shell"><iframe class="chapter-content-frame" src="./lesson.html" title="${escapeHtml(data.chapter.title)} lesson content"></iframe></div>
      </div>`;
  }

  function renderQuiz() {
    chrome("quiz", "Quiz", data.quiz ? "Answer the module quiz locally. Results are shown on screen only and are not saved." : data.noQuizMessage);
    if (!data.quiz) {
      content.innerHTML = `<article class="course-card" style="--accent:#59a844"><p class="card-code">${escapeHtml(data.chapter.code)} quiz</p><h4 class="card-title">No quiz assigned</h4><p class="card-summary">${escapeHtml(data.noQuizMessage)}</p><div class="card-actions"><a class="btn btn-primary" href="#lesson">Open lesson</a><a class="btn btn-secondary" href="#assignment">Open assignment</a></div></article>`;
      return;
    }
    const questions = data.quiz.multipleChoice.map((question) => {
      const options = question.options.map((option) => `<label class="quiz-option"><input type="radio" name="question-${escapeHtml(question.number)}" value="${escapeHtml(option.label)}" /><span><strong>${escapeHtml(option.label)}</strong>${escapeHtml(option.text)}</span></label>`).join("");
      return `<section class="quiz-question" data-question="${escapeHtml(question.number)}"><div class="question-number">${escapeHtml(question.number)}</div><div class="question-body"><h4>${escapeHtml(question.prompt)}</h4><div class="quiz-options">${options}</div><div class="quiz-feedback" aria-live="polite"></div></div></section>`;
    }).join("");
    content.innerHTML = `
      <article class="assessment-shell">
        <div class="assessment-top">
          <p class="assessment-kicker">Forensic Studies 25 - Assessment</p>
          <h4 class="assessment-title">Quiz ${escapeHtml(data.module.number)}: ${escapeHtml(data.quiz.title)}</h4>
          <div class="assessment-meta"><div><span>Status</span>In progress</div><div><span>Submitted</span>Not yet submitted</div></div>
          <div class="evaluation-row"><div class="evaluation-copy"><h4>Final Evaluation</h4><p>This counter tracks completed questions only. Marks are handled separately, and written responses are reviewed manually.</p></div><div><div class="score-display"><strong id="score-count">0</strong><span>/${escapeHtml(String(data.quiz.multipleChoice.length))}</span></div><div id="score-note" class="score-note">0 questions completed</div></div></div>
          <div class="assessment-actions"><button id="generate-results" class="btn btn-primary" type="button">Generate results</button><button id="check-answers" class="btn btn-secondary" type="button">Check answers</button><button id="retake-quiz" class="btn btn-secondary" type="button">Try Again</button><a class="back-link" href="#overview">Back to overview</a></div>
        </div>
        <div class="section-breakdown"><h4>Section Breakdown</h4></div>
        <div class="breakdown-row"><strong>Multiple Choice<br><small>Questions 1-${escapeHtml(String(data.quiz.multipleChoice.length))}</small></strong><span id="breakdown-count">0/${escapeHtml(String(data.quiz.multipleChoice.length))}</span></div>
        <form id="quiz-form" class="quiz-form">${questions}</form>
      </article>`;
    bindQuiz();
  }

  function renderAssignment() {
    chrome("assignment", "Assignment", "Complete the module assignment surface in the local static package.");
    content.innerHTML = `
      <div class="assignment-detail-surface">
        <article class="assignment-brief-card">
          <p class="assignment-kicker">Assignment details</p>
          <h4 class="card-title">${escapeHtml(data.assignment.title)}</h4>
          <p class="assignment-copy">Complete this module assignment after reviewing the lesson materials.</p>
          <p class="assignment-copy"><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>
          <div class="assignment-actions"><a class="btn btn-primary" href="./assignment/${escapeHtml(data.assignment.file)}" target="_blank" rel="noopener">Open full screen</a><a class="btn btn-secondary" href="#overview">Back to overview</a></div>
        </article>
        <div class="assignment-frame-shell"><iframe class="assignment-frame" src="./assignment/${escapeHtml(data.assignment.file)}" title="${escapeHtml(data.assignment.title)}"></iframe></div>
      </div>`;
  }

  function renderResources() {
    chrome("resources", "Resources", "Review module links, media, and submission reminders.");
    const externalItems = data.resources.filter((resource) => /^https?:\/\//i.test(resource.href));
    const externalList = externalItems.map((resource) => `<li><a href="${escapeHtml(resource.href)}" target="_blank" rel="noopener">${escapeHtml(resource.title)}</a></li>`).join("") || "<li>No external resources listed.</li>";
    const quizLink = data.quiz ? `<p><a href="#quiz">Open module quiz</a></p>` : "<p>No module quiz is assigned.</p>";
    content.innerHTML = `<article class="course-card" style="--accent:#59a844"><p class="card-code">Module ${escapeHtml(data.module.number)} resources</p><h4 class="card-title">Links and next steps</h4><div class="card-summary"><p>External links and videos found in this module:</p><ul>${externalList}</ul><p><a href="./assignment/${escapeHtml(data.assignment.file)}" target="_blank" rel="noopener">Open assignment full screen</a></p>${quizLink}<p><strong>Submit completed work through Google Classroom.</strong></p></div></article>`;
  }

  function answeredCount() {
    return data.quiz.multipleChoice.filter((question) => document.querySelector('input[name="question-' + question.number + '"]:checked')).length;
  }

  function checkAnswers() {
    let score = 0;
    data.quiz.multipleChoice.forEach((question) => {
      const card = document.querySelector('[data-question="' + question.number + '"]');
      const selected = document.querySelector('input[name="question-' + question.number + '"]:checked');
      const isCorrect = Boolean(selected && selected.value === question.answer);
      if (isCorrect) score += 1;
      card.classList.toggle("is-correct", isCorrect);
      card.classList.toggle("is-incorrect", Boolean(selected) && !isCorrect);
      card.querySelector(".quiz-feedback").textContent = selected ? (isCorrect ? "Correct" : "Correct answer: " + question.answer) : "No answer selected.";
    });
    const answered = answeredCount();
    document.getElementById("score-count").textContent = String(score);
    document.getElementById("score-note").textContent = answered + " questions completed";
    document.getElementById("breakdown-count").textContent = answered + "/" + data.quiz.multipleChoice.length;
  }

  function resetQuiz() {
    document.getElementById("quiz-form").reset();
    document.getElementById("score-count").textContent = "0";
    document.getElementById("score-note").textContent = "0 questions completed";
    document.getElementById("breakdown-count").textContent = "0/" + data.quiz.multipleChoice.length;
    document.querySelectorAll(".quiz-question").forEach((card) => { card.classList.remove("is-correct", "is-incorrect"); card.querySelector(".quiz-feedback").textContent = ""; });
  }

  function bindQuiz() {
    document.getElementById("check-answers")?.addEventListener("click", checkAnswers);
    document.getElementById("generate-results")?.addEventListener("click", checkAnswers);
    document.getElementById("retake-quiz")?.addEventListener("click", resetQuiz);
  }

  function renderRoute() {
    const route = routeName();
    if (!location.hash) history.replaceState(null, "", "#overview");
    if (route === "lesson") return renderLesson();
    if (route === "quiz") return renderQuiz();
    if (route === "assignment") return renderAssignment();
    if (route === "resources") return renderResources();
    return renderOverview();
  }

  document.getElementById("menu-toggle")?.addEventListener("click", () => document.body.classList.toggle("sidebar-collapsed"));
  window.addEventListener("hashchange", renderRoute);
  renderRoute();
})();
'''


def page(title, body):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{html_escape(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&family=Open+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
{body}
</body>
</html>
"""


def is_external(value):
    return bool(re.match(r"^(?:https?:|mailto:|data:|#)", value or "", re.I))


def resolve_asset(src, chapter_file):
    clean = unquote(src.split("#", 1)[0].split("?", 1)[0]).replace("\\", "/")
    candidates = [
        (chapter_file.parent / clean).resolve(),
        (SOURCE / clean.lstrip("./")).resolve(),
        (chapter_file.parent / clean.replace("сontent", "?ontent")).resolve(),
        (SOURCE / clean.replace("сontent", "?ontent").lstrip("./")).resolve(),
    ]
    for candidate in candidates:
        if candidate.exists() and candidate.is_file():
            return candidate
    matches = list(SOURCE.rglob(Path(clean).name))
    return matches[0] if matches else None


def clean_lesson(number, chapter, quiz, out_dir):
    chapter_file = (SOURCE / chapter.get("contentPath", f"./content/chapter-{number}/index.html").replace("./", "")).resolve()
    html = read(chapter_file).replace("http://www.youtube.com", "https://www.youtube.com").replace("http://youtube.com", "https://youtube.com")
    body = re.search(r"<body[^>]*>(.*)</body>", html, re.S | re.I)
    content = body.group(1) if body else html
    content = re.sub(r"<a[^>]*id=[\"']skip-to-content[\"'][\s\S]*?</a>", "", content, flags=re.I)
    content = re.sub(r"<script[\s\S]*?</script>", "", content, flags=re.I)
    content = re.sub(r"<button[^>]*(?:data-mark-complete|data-mark-complete-next)[\s\S]*?</button>", "", content, flags=re.I)
    content = re.sub(r"<p[^>]*class=[\"'][^\"']*lesson-progress-note[^\"']*[\"'][\s\S]*?</p>", "", content, flags=re.I)
    content = re.sub(r"\sdata-(?:mark-complete-next|mark-complete|progress-footer|locked|unlock)[^=]*=([\"']).*?\1", "", content, flags=re.I)
    content = re.sub(r"\saria-disabled=([\"'])true\1", "", content, flags=re.I)
    content = re.sub(r"\sdisabled(=([\"']).*?\2)?", "", content, flags=re.I)
    content = normalize_module_self_references(content, number)
    image_dir = out_dir / "assets" / "images"
    image_dir.mkdir(parents=True, exist_ok=True)
    image_map = {}
    rewritten = []
    unresolved = []

    def img_repl(match):
        src = match.group(3)
        if is_external(src):
            return match.group(0)
        asset = resolve_asset(src, chapter_file)
        if not asset:
            unresolved.append(src)
            return match.group(0)
        if asset not in image_map:
            name = f"module-{number}-image-{len(image_map) + 1:02d}{asset.suffix.lower() or '.jpg'}"
            shutil.copy2(asset, image_dir / name)
            image_map[asset] = f"assets/images/{name}"
            rewritten.append({"source": str(asset), "output": image_map[asset]})
        return f"{match.group(1)}{match.group(2)}{image_map[asset]}{match.group(4)}"

    content = re.sub(r"(<img\b[^>]*\bsrc=)([\"'])([^\"']+)([\"'])", img_repl, content, flags=re.I)
    quiz_button = '<a class="button secondary" href="./index.html#quiz" target="_parent">Take Module Quiz</a>' if quiz else ""
    content += f"""
<section class="lesson-page next-steps"><h2>Next Steps</h2><div class="lesson-content"><p>You have completed this module lesson.</p><p><a class="button" href="./assignment/{module_assignment_file(number)}" target="_blank" rel="noopener">Open Module Assignment</a> {quiz_button}</p><p>Submit completed work through Google Classroom.</p></div></section>"""
    externals = sorted(set(re.findall(r"(?:href|src)=[\"'](https?://[^\"']+)", content, flags=re.I)))
    write(out_dir / "lesson.html", page(f"Module {number} Lesson - Forensic Studies 25", f'<main class="lesson-page" id="main-content">\n{content}\n</main>'))
    return {"source": str(chapter_file.relative_to(ROOT)), "imageCount": len(image_map), "rewrittenImages": rewritten, "unresolvedReferences": unresolved, "externalUrls": externals}


def normalize_module_self_references(text, number):
    text = re.sub(
        r"(Module&nbsp;</span><span[^>]*>)(\d+)(</span><span[^>]*>&nbsp;Overview)",
        lambda match: f"{match.group(1)}{number}{match.group(3)}",
        text,
        flags=re.I,
    )
    text = re.sub(
        r"(By the end of\s*<b[^>]*>Module\s+)(\d+)(</b>)",
        lambda match: f"{match.group(1)}{number}{match.group(3)}",
        text,
        flags=re.I,
    )
    return text


def no_storage(text):
    shim = "const __forensicsNoStorage={getItem:()=>null,setItem:()=>undefined,removeItem:()=>undefined,clear:()=>undefined};\n"
    text = text.replace("window.localStorage", "__forensicsNoStorage").replace("window.sessionStorage", "__forensicsNoStorage")
    text = re.sub(r"(?<![A-Za-z0-9_])localStorage(?![A-Za-z0-9_])", "__forensicsNoStorage", text)
    text = re.sub(r"(?<![A-Za-z0-9_])sessionStorage(?![A-Za-z0-9_])", "__forensicsNoStorage", text)
    return shim + text if "__forensicsNoStorage" in text and not text.startswith("const __forensicsNoStorage") else text


def no_storage_inline(text):
    replacement = "({getItem:()=>null,setItem:()=>undefined,removeItem:()=>undefined,clear:()=>undefined})"
    text = text.replace("window.localStorage", replacement).replace("window.sessionStorage", replacement)
    text = re.sub(r"(?<![A-Za-z0-9_])localStorage(?![A-Za-z0-9_])", replacement, text)
    text = re.sub(r"(?<![A-Za-z0-9_])sessionStorage(?![A-Za-z0-9_])", replacement, text)
    return text


def add_theme_body(attrs):
    if re.search(r"class\s*=", attrs, re.I):
        return "<body" + re.sub(r"class=([\"'])(.*?)\1", lambda m: f"class={m.group(1)}{m.group(2)} forensic-assignment-theme{m.group(1)}", attrs, count=1, flags=re.I) + ">"
    return f'<body{attrs} class="forensic-assignment-theme">'


def copy_assignments(number, out_dir):
    src_dir = SOURCE / "assignments"
    dest = out_dir / "assignment"
    dest.mkdir(parents=True, exist_ok=True)
    copied = []
    for pattern in [f"module{number}assignment*", "forensic-assignment-theme.css", "forensic-assignment-print.js"]:
        for src in sorted(src_dir.glob(pattern)):
            if not src.is_file() or src.name in copied:
                continue
            target = dest / src.name
            if src.suffix.lower() in {".html", ".js", ".jsx", ".css", ".txt"}:
                text = read(src)
                if src.suffix.lower() == ".html":
                    text = re.sub(r"module\d+assignment\.bundle\.js\?[^\"' ]*", f"module{number}assignment.bundle.js", text, flags=re.I)
                    if "forensic-assignment-theme.css" not in text:
                        text = text.replace("</head>", '  <link rel="stylesheet" href="./forensic-assignment-theme.css" />\n</head>')
                    text = re.sub(r"<body([^>]*)>", lambda m: add_theme_body(m.group(1)), text, count=1, flags=re.I)
                    text = no_storage_inline(text)
                if src.suffix.lower() == ".js":
                    text = no_storage(text)
                write(target, text)
            else:
                shutil.copy2(src, target)
            copied.append(src.name)
    if module_assignment_file(number) not in copied:
        raise RuntimeError(f"Missing {module_assignment_file(number)}")
    return sorted(copied)


def copy_assignment_assets(number, out_dir):
    src = SOURCE / "assignments" / f"module{number}"
    if not src.is_dir():
        return []
    dest = out_dir / "assignment" / src.name
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(src, dest)
    return sorted(f"{src.name}/{path.relative_to(src).as_posix()}" for path in src.rglob("*") if path.is_file())


def build_data(number, course, lesson, assignment_files, assignment_assets):
    chapter_id = f"chapter-{number}"
    chapter = next((x for x in course.get("chapters", []) if x.get("id") == chapter_id), None)
    quiz = next((x for x in course.get("quizzes", []) if x.get("id") == f"quiz-{number}" or x.get("chapterId") == chapter_id), None)
    assignment = next((x for x in course.get("assignments", []) if x.get("id") == f"assignment-{number}" or x.get("chapterId") == chapter_id), None)
    if not chapter or not assignment:
        raise RuntimeError(f"Missing source chapter or assignment for module {number}")
    resources = [{"title": url, "href": url} for url in lesson["externalUrls"]]
    resources.append({"title": assignment.get("title", f"Module {number} Assignment"), "href": f"./assignment/{module_assignment_file(number)}"})
    if quiz:
        resources.append({"title": quiz.get("title", f"Module {number} Quiz"), "href": "#quiz"})
    return {
        "course": {"title": course.get("course", {}).get("title", "Forensic Studies 25")},
        "module": {"number": number},
        "chapter": {"id": chapter_id, "title": chapter.get("title", ""), "code": chapter.get("code", f"Module {number}"), "summary": chapter.get("summary", ""), "componentCount": len(chapter.get("componentIds", []))},
        "quiz": None if not quiz else {"id": quiz.get("id"), "title": quiz.get("title", ""), "multipleChoice": quiz.get("multipleChoice", [])},
        "assignment": {"id": assignment.get("id"), "title": assignment.get("title", ""), "file": module_assignment_file(number), "files": assignment_files, "assetFiles": assignment_assets},
        "resources": resources,
        "noQuizMessage": NO_QUIZ,
    }


def write_docs(number, data, lesson):
    out = DIST / f"module-{number}-static"
    quiz_key = "No quiz" if not data["quiz"] else " ".join(q["answer"] for q in data["quiz"]["multipleChoice"])
    write(out / "README.md", f"# Forensics 25 Module {number} Static Tester\n\nRun locally with `python3 -m http.server 8080` and open `http://localhost:8080`.\n")
    write(out / "MIGRATION_REPORT.md", f"""# Migration Report

## Source files used

- `{lesson['source']}`
- `workspace/source-package/workspace-source/course-data.js`

## Module data extracted

- Course: Forensic Studies 25
- Module: Module {number}
- Title: {data['chapter']['title']}
- Quiz: {data['quiz']['id'] if data['quiz'] else 'No quiz assigned'}
- Quiz answer key: {quiz_key}
- Assignment: {data['assignment']['id']}

## Assignment files copied

{chr(10).join('- `' + item + '`' for item in data['assignment']['files'])}

## Assignment assets copied

{chr(10).join('- `' + item + '`' for item in data['assignment']['assetFiles']) or '- None'}

## Image paths rewritten

- Local images copied: {lesson['imageCount']}
{chr(10).join('- ' + item['source'] + ' -> ' + item['output'] for item in lesson['rewrittenImages']) or '- None'}

## External URLs found

{chr(10).join('- ' + item for item in lesson['externalUrls']) or '- None'}

## Unresolved references

{chr(10).join('- ' + item for item in lesson['unresolvedReferences']) or '- None'}

## Compromises

- Lesson content is normalized into a static iframe page.
- Assignment runtime is copied except JavaScript browser-storage calls are replaced with no-op storage handlers.
""")
    write(out / "ACCEPTANCE_CHECKLIST.md", """# Acceptance Checklist

[ ] Module opens locally through http://localhost:8080
[ ] Sidebar navigation works
[ ] Overview tab displays correct module only
[ ] Lesson tab displays correct module lesson content
[ ] No lesson cards are locked or blurred
[ ] No Mark Complete buttons remain
[ ] No Course progress UI remains
[ ] Local lesson images load
[ ] External videos/iframes still load
[ ] Quiz tab displays correct module quiz only, or no-quiz message for Module 8
[ ] Quiz scores correctly, if quiz exists
[ ] Quiz has Try Again, if quiz exists
[ ] Assignment tab displays correct module assignment
[ ] Assignment has full-screen open button
[ ] No Firebase references remain
[ ] No hosted-runtime-content references remain
[ ] No old D2L export paths are fetched at runtime
[ ] No wrong-module code remains
[ ] No localStorage/sessionStorage progress logic remains
[ ] No console errors during normal use
""")


def generate(number):
    if number not in SUPPORTED:
        raise SystemExit("Only modules 2-8 are supported. Final Exam is excluded.")
    course = load_course_data()
    out = DIST / f"module-{number}-static"
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    shutil.copy2(TEMPLATE / "styles.css", out / "styles.css")
    assignment_files = copy_assignments(number, out)
    assignment_assets = copy_assignment_assets(number, out)
    chapter_id = f"chapter-{number}"
    chapter = next(x for x in course["chapters"] if x["id"] == chapter_id)
    quiz = next((x for x in course.get("quizzes", []) if x.get("id") == f"quiz-{number}" or x.get("chapterId") == chapter_id), None)
    lesson = clean_lesson(number, chapter, quiz, out)
    data = build_data(number, course, lesson, assignment_files, assignment_assets)
    write(out / "index.html", index_html(number))
    write(out / "module.js", module_js())
    write(out / "module-data.js", "const MODULE_DATA = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\nwindow.MODULE_DATA = MODULE_DATA;\n")
    write_docs(number, data, lesson)
    print(json.dumps({"module": number, "output": str(out), "title": data["chapter"]["title"], "componentCount": data["chapter"]["componentCount"], "imageCount": lesson["imageCount"], "quizAnswerKey": None if not data["quiz"] else " ".join(q["answer"] for q in data["quiz"]["multipleChoice"]), "assignmentFiles": assignment_files, "assignmentAssetFiles": assignment_assets, "unresolvedReferences": lesson["unresolvedReferences"]}, indent=2))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--module", type=int, required=True)
    args = parser.parse_args()
    generate(args.module)


if __name__ == "__main__":
    main()
