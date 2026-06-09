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
    if (!hash || ["overview", "home"].includes(hash)) return "overview";
    if (["lesson", "chapter", "chapter-1"].includes(hash)) return "lesson";
    if (["quiz", "quiz-1"].includes(hash)) return "quiz";
    if (["assignment", "assignment-1"].includes(hash)) return "assignment";
    if (hash === "resources") return "resources";
    return "overview";
  }

  function setChrome(route, title, intro) {
    body.dataset.route = route;
    sectionTitle.textContent = title;
    sectionIntro.textContent = intro;
    navItems.forEach((item) => item.classList.toggle("active", item.dataset.nav === route));
  }

  function renderOverview() {
    setChrome("overview", "Overview", "Review the Module 1 workflow, then complete the lesson, quiz, and assignment.");
    content.innerHTML = `
      <div class="card-grid">
        <article class="course-card" style="--accent:#59a844">
          <p class="card-code">${escapeHtml(data.chapter.code)}</p>
          <h4 class="card-title">${escapeHtml(data.chapter.title)}</h4>
          <p class="card-summary">${escapeHtml(data.chapter.summary)}</p>
          <div class="card-meta">
            <span><strong>${escapeHtml(String(data.chapter.componentCount))}</strong> lesson components</span>
            <span><strong>${escapeHtml(data.quiz.title)}</strong></span>
            <span><strong>${escapeHtml(data.assignment.title)}</strong></span>
          </div>
          <div class="card-actions">
            <a class="btn btn-primary" href="#lesson"><i class="fa-solid fa-arrow-right"></i> Start lesson</a>
            <a class="btn btn-secondary" href="#quiz"><i class="fa-solid fa-circle-question"></i> Open quiz</a>
          </div>
        </article>
        <article class="course-card" style="--accent:#3c3f3e">
          <p class="card-code">Student workflow</p>
          <h4 class="card-title">Complete Module 1</h4>
          <ol class="card-summary">
            <li>Complete the lesson.</li>
            <li>Take the quiz.</li>
            <li>Complete the assignment.</li>
            <li>Submit through Google Classroom.</li>
          </ol>
          <div class="card-actions">
            <a class="btn btn-secondary" href="#assignment"><i class="fa-solid fa-pen"></i> Open assignment</a>
            <a class="btn btn-secondary" href="#resources"><i class="fa-solid fa-link"></i> View resources</a>
          </div>
        </article>
      </div>`;
  }

  function renderLesson() {
    setChrome("lesson", "Lesson", data.chapter.summary);
    content.innerHTML = `
      <div class="chapter-detail-surface">
        <article class="chapter-head">
          <p class="detail-eyebrow">${escapeHtml(data.chapter.code)}</p>
          <h4 class="detail-title">${escapeHtml(data.chapter.title)}</h4>
          <p class="detail-summary">${escapeHtml(data.chapter.summary)}</p>
          <span class="module-completion-badge">${escapeHtml(String(data.chapter.componentCount))} lesson components retained</span>
          <div class="detail-actions">
            <a class="btn btn-primary" href="#quiz">Open quiz</a>
            <a class="btn btn-secondary" href="#assignment">Open assignment</a>
          </div>
        </article>
        <div class="chapter-content-shell">
          <iframe class="chapter-content-frame" src="./lesson.html" title="${escapeHtml(data.chapter.title)} lesson content"></iframe>
        </div>
      </div>`;
  }

  function renderQuiz() {
    setChrome("quiz", "Quiz", "Answer the Module 1 quiz locally. Results are shown on screen only and are not saved.");
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
          <p class="assessment-kicker">Forensic Studies 25 - Assessment</p>
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
              <div class="score-display"><strong id="score-count">0</strong><span>/${escapeHtml(String(data.quiz.multipleChoice.length))}</span></div>
              <div id="score-note" class="score-note">0 questions completed</div>
            </div>
          </div>
          <div class="assessment-actions">
            <button id="generate-results" class="btn btn-primary" type="button">Generate results</button>
            <button id="check-answers" class="btn btn-secondary" type="button">Check answers</button>
            <button id="retake-quiz" class="btn btn-secondary" type="button">Try Again</button>
            <a class="back-link" href="#overview">Back to overview</a>
          </div>
        </div>
        <div class="section-breakdown"><h4>Section Breakdown</h4></div>
        <div class="breakdown-row"><strong>Multiple Choice<br><small>Questions 1-${escapeHtml(String(data.quiz.multipleChoice.length))}</small></strong><span id="breakdown-count">0/${escapeHtml(String(data.quiz.multipleChoice.length))}</span></div>
        <form id="quiz-form" class="quiz-form">${questions}</form>
      </article>`;
    bindQuiz();
  }

  function renderAssignment() {
    setChrome("assignment", "Assignment", "Complete the Module 1 assignment surface in the local static package.");
    content.innerHTML = `
      <div class="assignment-detail-surface">
        <article class="assignment-brief-card">
          <p class="assignment-kicker">Assignment details</p>
          <h4 class="card-title">${escapeHtml(data.assignment.title)}</h4>
          <p class="assignment-copy">Review Locard's Exchange Principle and apply it to the introductory crime scene case.</p>
          <p class="assignment-copy"><strong>When you have completed the assignment, upload your generated reports to your respective online classroom.</strong></p>
          <div class="assignment-actions">
            <a class="btn btn-primary" href="./assignment/module1assignment.html" target="_blank" rel="noopener">Open full screen</a>
            <a class="btn btn-secondary" href="#overview">Back to overview</a>
          </div>
        </article>
        <div class="assignment-frame-shell">
          <iframe class="assignment-frame" src="./assignment/module1assignment.html" title="${escapeHtml(data.assignment.title)}"></iframe>
        </div>
      </div>`;
  }

  function renderResources() {
    setChrome("resources", "Resources", "Review Module 1 links, media, and submission reminders.");
    const externalItems = data.resources.filter((resource) => /^https?:\/\//i.test(resource.href));
    const externalList = externalItems.map((resource) => `
      <li><a href="${escapeHtml(resource.href)}" target="_blank" rel="noopener">${escapeHtml(resource.title)}</a></li>`).join("") || "<li>No external resources listed.</li>";
    content.innerHTML = `
      <article class="course-card" style="--accent:#59a844">
        <p class="card-code">Module 1 resources</p>
        <h4 class="card-title">Links and next steps</h4>
        <div class="card-summary">
          <p>External links and videos found in this module:</p>
          <ul>${externalList}</ul>
          <p><a href="./assignment/module1assignment.html" target="_blank" rel="noopener">Open assignment full screen</a></p>
          <p><a href="#quiz">Open Module 1 quiz</a></p>
          <p><strong>Submit completed work through Google Classroom.</strong></p>
        </div>
      </article>`;
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
