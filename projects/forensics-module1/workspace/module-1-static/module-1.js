(() => {
  const data = window.MODULE_1_DATA;
  const body = document.body;
  const sectionTitle = document.getElementById("section-title");
  const sectionIntro = document.getElementById("section-intro");
  const content = document.getElementById("content-body");
  const navItems = Array.from(document.querySelectorAll("[data-nav]"));

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  function normalizeRoute() {
    const hash = location.hash.replace(/^#/, "").trim();
    if (["chapter-1", "lesson"].includes(hash)) return "chapter-1";
    if (["quiz-1", "quiz"].includes(hash)) return "quiz-1";
    if (["assignment-1", "assignment"].includes(hash)) return "assignment-1";
    if (hash === "quizzes") return "quiz-1";
    if (hash === "assignments") return "assignment-1";
    return "chapter-1";
  }

  function navGroup(route) {
    if (route === "quiz-1" || route === "quizzes") return "quizzes";
    if (route === "assignment-1" || route === "assignments") return "assignments";
    return "chapters";
  }

  function setChrome(route, title, intro) {
    body.dataset.route = route;
    sectionTitle.textContent = title;
    sectionIntro.textContent = intro;
    const group = navGroup(route);
    navItems.forEach((item) => item.classList.toggle("active", item.dataset.nav === group));
  }

  function renderChapters() {
    setChrome("chapters", "Chapters", "Open module content, launch embedded assignments, and review the source-linked quiz.");
    content.innerHTML = `
      <div class="card-grid">
        <article class="course-card" style="--accent:#8b6a24">
          <p class="card-code">${escapeHtml(data.chapter.code)}</p>
          <h4 class="card-title">${escapeHtml(data.chapter.title)}</h4>
          <p class="card-summary">${escapeHtml(data.chapter.summary)}</p>
          <div class="card-meta">
            <span><strong>${escapeHtml(String(data.chapter.componentCount))}</strong> lesson components retained.</span>
            <span><strong>${escapeHtml(data.quiz.title)}</strong></span>
            <span><strong>${escapeHtml(data.assignment.title)}</strong></span>
          </div>
          <div class="card-actions">
            <a class="btn btn-primary" href="#chapter-1"><i class="fa-solid fa-arrow-right"></i> Open module</a>
            <a class="btn btn-secondary" href="#quiz-1"><i class="fa-solid fa-circle-question"></i> Open test</a>
          </div>
        </article>
        <article class="course-card" style="--accent:#59a844">
          <p class="card-code">Static review</p>
          <h4 class="card-title">Module 1 package</h4>
          <p class="card-summary">This package is limited to Module 1 and keeps the Option Two view model without progress storage or locked states.</p>
          <div class="card-actions">
            <a class="btn btn-secondary" href="#assignment-1"><i class="fa-solid fa-pen"></i> Assignment library</a>
          </div>
        </article>
      </div>`;
  }

  function renderChapterDetail() {
    setChrome("chapter-1", data.chapter.title, data.chapter.summary);
    content.innerHTML = `
      <div class="chapter-detail-surface">
        <article class="chapter-head">
          <p class="detail-eyebrow">${escapeHtml(data.chapter.code)}</p>
          <h4 class="detail-title">${escapeHtml(data.chapter.title)}</h4>
          <p class="detail-summary">${escapeHtml(data.chapter.summary)}</p>
          <span class="module-completion-badge">0/${escapeHtml(String(data.chapter.componentCount))} components complete</span>
          <div class="detail-actions">
            <a class="btn btn-primary" href="#quiz-1">Open test</a>
            <a class="btn btn-secondary" href="#assignment-1">Open assignment</a>
          </div>
        </article>
        <div class="chapter-content-shell">
          <iframe class="chapter-content-frame" src="./lesson.html" title="${escapeHtml(data.chapter.title)} lesson content"></iframe>
        </div>
      </div>`;
  }

  function renderQuizzes() {
    setChrome("quizzes", "Quizzes", "Open the Module 1 assessment view.");
    content.innerHTML = `
      <article class="course-card" style="--accent:#59a844">
        <p class="card-code">Forensic Studies 25 Assessment</p>
        <h4 class="card-title">${escapeHtml(data.quiz.title)}</h4>
        <p class="card-summary">Five multiple-choice questions from Module 1. Results are checked locally and are not saved.</p>
        <div class="card-actions">
          <a class="btn btn-primary" href="#quiz-1"><i class="fa-solid fa-circle-question"></i> Open quiz</a>
          <a class="btn btn-secondary" href="#chapter-1">Back to module</a>
        </div>
      </article>`;
  }

  function renderQuizDetail() {
    setChrome("quiz-1", "Quizzes", "Answer the Module 1 quiz locally. Results are shown on screen only and are not saved.");
    const questions = data.quiz.multipleChoice.map((question) => {
      const options = question.options.map((option) => `
        <label class="quiz-option">
          <input type="radio" name="question-${escapeHtml(question.number)}" value="${escapeHtml(option.label)}" />
          <span><strong>${escapeHtml(option.label)}</strong>${escapeHtml(option.text)}</span>
        </label>`).join("");
      return `
        <section class="quiz-question" data-question="${escapeHtml(question.number)}">
          <div class="question-number">${escapeHtml(question.number)}</div>
          <div class="question-body">
            <h4>${escapeHtml(question.prompt)}</h4>
            <div class="quiz-options">${options}</div>
            <div class="quiz-feedback" aria-live="polite"></div>
          </div>
        </section>`;
    }).join("");

    content.innerHTML = `
      <article class="assessment-shell">
        <div class="assessment-top">
          <p class="assessment-kicker">Forensic Studies 25 â€¢ Assessment</p>
          <h4 class="assessment-title">Quiz 1: ${escapeHtml(data.quiz.title)}</h4>
          <div class="assessment-meta">
            <div><span>Status</span>In progress</div>
            <div><span>Submitted</span>Not yet submitted</div>
          </div>
          <div class="evaluation-row">
            <div class="evaluation-copy">
              <h4>Final Evaluation</h4>
              <p>This counter tracks completed questions only. Marks are handled separately, and written responses are reviewed manually.</p>
            </div>
            <div>
              <div class="score-display"><strong id="score-count">0</strong><span>/5</span></div>
              <div id="score-note" class="score-note">0 questions completed</div>
            </div>
          </div>
          <div class="assessment-actions">
            <button id="generate-results" class="btn btn-primary" type="button">Generate results</button>
            <button id="check-answers" class="btn btn-secondary" type="button">Check answers</button>
            <button id="retake-quiz" class="btn btn-secondary" type="button">Retake quiz</button>
            <a class="back-link" href="#chapter-1">Back to module</a>
          </div>
        </div>
        <div class="section-breakdown"><h4>Section Breakdown</h4></div>
        <div class="breakdown-row"><strong>Multiple Choice<br><small>Questions 1-5</small></strong><span id="breakdown-count">0/5</span></div>
        <form id="quiz-form" class="quiz-form">${questions}</form>
      </article>`;
    bindQuiz();
  }

  function renderAssignments() {
    setChrome("assignments", "Assignments", "Open the Module 1 assignment surface.");
    content.innerHTML = `
      <article class="course-card" style="--accent:#59a844">
        <p class="card-code">Assignment</p>
        <h4 class="card-title">${escapeHtml(data.assignment.title)}</h4>
        <p class="card-summary">Review Locard's Exchange Principle and apply it to the introductory crime scene case.</p>
        <div class="card-actions">
          <a class="btn btn-primary" href="#assignment-1"><i class="fa-solid fa-pen"></i> Open assignment</a>
          <a class="btn btn-secondary" href="#chapter-1">Back to module</a>
        </div>
      </article>`;
  }

  function renderAssignmentDetail() {
    setChrome("assignment-1", "Assignments", "Complete the Module 1 assignment surface in the local static package.");
    content.innerHTML = `
      <div class="assignment-detail-surface">
        <article class="assignment-brief-card">
          <p class="assignment-kicker">Assignment details</p>
          <h4 class="card-title">${escapeHtml(data.assignment.title)}</h4>
          <p class="assignment-copy">Review Locard's Exchange Principle and apply it to the introductory crime scene case.</p>
          <p class="assignment-copy"><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>
          <div class="assignment-actions">
            <a class="btn btn-primary" href="./assignment/module1assignment.html" target="_blank" rel="noopener">Open full screen</a>
            <a class="btn btn-secondary" href="#chapter-1">Back to module</a>
          </div>
        </article>
        <div class="assignment-frame-shell">
          <iframe class="assignment-frame" src="./assignment/module1assignment.html" title="${escapeHtml(data.assignment.title)}"></iframe>
        </div>
      </div>`;
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
    document.querySelectorAll(".quiz-question").forEach((card) => {
      card.classList.remove("is-correct", "is-incorrect");
      card.querySelector(".quiz-feedback").textContent = "";
    });
  }

  function bindQuiz() {
    document.getElementById("check-answers")?.addEventListener("click", checkAnswers);
    document.getElementById("generate-results")?.addEventListener("click", checkAnswers);
    document.getElementById("retake-quiz")?.addEventListener("click", resetQuiz);
  }

  function renderRoute() {
    const route = normalizeRoute();
    if (!location.hash) history.replaceState(null, "", "#chapter-1");
    if (route === "chapter-1") return renderChapterDetail();
    if (route === "quiz-1") return renderQuizDetail();
    if (route === "assignment-1") return renderAssignmentDetail();
    return renderChapterDetail();
  }

  document.getElementById("menu-toggle")?.addEventListener("click", () => document.body.classList.toggle("sidebar-collapsed"));
  window.addEventListener("hashchange", renderRoute);
  renderRoute();
})();
