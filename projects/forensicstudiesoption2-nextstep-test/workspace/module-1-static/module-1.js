const tabs = Array.from(document.querySelectorAll("[data-tab]"));
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
