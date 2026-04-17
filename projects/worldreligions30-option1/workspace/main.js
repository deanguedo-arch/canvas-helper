(function () {
  const data = window.WORLD_RELIGIONS_DATA || { course: {}, chapters: [], quizzes: [], assignments: [], library: [] };
  const PROJECT_SLUG = document.body?.dataset.projectSlug || "worldreligions30-option1";
  const STORAGE_KEY = `${PROJECT_SLUG}.progress`;
  const UI_KEY = `${PROJECT_SLUG}.ui`;

  const refs = {
    body: document.body,
    menuToggle: document.getElementById("menu-toggle"),
    navHome: document.getElementById("nav-home"),
    navLibrary: document.getElementById("nav-library"),
    tabChapters: document.getElementById("tab-chapters"),
    tabQuizzes: document.getElementById("tab-quizzes"),
    tabAssignments: document.getElementById("tab-assignments"),
    courseTitle: document.getElementById("course-title"),
    courseSubtitle: document.getElementById("course-subtitle"),
    sidebarProgressTrack: document.getElementById("sidebar-progress-track"),
    sidebarProgressFill: document.getElementById("sidebar-progress-fill"),
    progressPercent: document.getElementById("progress-percent"),
    progressTrack: document.getElementById("progress-track"),
    progressFill: document.getElementById("progress-fill"),
    chapterProgress: document.getElementById("chapter-progress"),
    quizProgress: document.getElementById("quiz-progress"),
    sectionTitle: document.getElementById("section-title"),
    sectionIntro: document.getElementById("section-intro"),
    contentBody: document.getElementById("content-body"),
    viewerOverlay: document.getElementById("viewer-overlay"),
    overlayCode: document.getElementById("overlay-code"),
    overlayTitle: document.getElementById("overlay-title"),
    overlayDownload: document.getElementById("overlay-download"),
    overlayFrame: document.getElementById("overlay-frame"),
    overlayClose: document.getElementById("overlay-close")
  };

  const state = {
    section: "home",
    tab: "chapters",
    activeId: null,
    activeLibraryId: null,
    mobileNavOpen: false,
    sidebarCollapsed: loadUiState().sidebarCollapsed,
    quizSection: "mc",
    checkedResults: {},
    progress: loadProgress()
  };

  function loadProgress() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        quizComplete: parsed.quizComplete || {},
        quizCompletedAt: parsed.quizCompletedAt || {},
        quizWork: parsed.quizWork || {}
      };
    } catch (_error) {
      return {
        quizComplete: {},
        quizCompletedAt: {},
        quizWork: {}
      };
    }
  }

  function saveProgress() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
  }

  function loadUiState() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(UI_KEY) || "{}");
      return { sidebarCollapsed: !!parsed.sidebarCollapsed };
    } catch (_error) {
      return { sidebarCollapsed: false };
    }
  }

  function saveUiState() {
    window.localStorage.setItem(UI_KEY, JSON.stringify({ sidebarCollapsed: state.sidebarCollapsed }));
  }

  function isMobile() {
    return window.innerWidth <= 900;
  }

  function setMobileNav(open) {
    state.mobileNavOpen = open;
    refs.body.classList.toggle("mobile-nav-open", open);
    refs.menuToggle?.setAttribute("aria-expanded", String(open));
  }

  function setSidebarCollapsed(collapsed) {
    state.sidebarCollapsed = collapsed;
    refs.body.classList.toggle("sidebar-collapsed", collapsed);
    saveUiState();
  }

  function toggleNavMode() {
    if (isMobile()) {
      setMobileNav(!state.mobileNavOpen);
      return;
    }
    setSidebarCollapsed(!state.sidebarCollapsed);
  }

  function closeMobileNav() {
    if (isMobile()) {
      setMobileNav(false);
    }
  }

  function cleanText(value) {
    return String(value ?? "")
      .replace(/[�]/g, "-")
      .replace(/[–—]/g, "-");
  }

  function escapeHtml(value) {
    return cleanText(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
  }

  function getQuizWork(id) {
    if (!state.progress.quizWork[id]) {
      state.progress.quizWork[id] = { mc: {}, matching: {}, tf: {} };
      saveProgress();
    }
    return state.progress.quizWork[id];
  }

  function findChapter(id) {
    return (data.chapters || []).find((item) => item.id === id) || null;
  }

  function findQuiz(id) {
    return (data.quizzes || []).find((item) => item.id === id) || null;
  }

  function findQuizByChapter(chapterId) {
    return (data.quizzes || []).find((item) => item.chapterId === chapterId) || null;
  }

  function getAssignments() {
    return (data.chapters || []).map((chapter) => ({
      id: `assignment-${chapter.number}`,
      chapterId: chapter.id,
      code: `Assignment ${chapter.number}`,
      number: chapter.number,
      title: chapter.title,
      accent: chapter.accent,
      summary: "Assignment content has not been authored yet. This lane stays ready for future chapter work."
    }));
  }

  function findAssignment(id) {
    return getAssignments().find((item) => item.id === id) || null;
  }

  function getLibraryItems() {
    return (data.library || []).length
      ? data.library
      : (data.chapters || []).map((chapter) => ({
          id: `library-${chapter.number}`,
          chapterId: chapter.id,
          code: chapter.code,
          title: chapter.title,
          accent: chapter.accent,
          file: `./assets/library/Chapter ${chapter.number}.pdf`,
          summary: `Local chapter PDF for ${chapter.title}.`
        }));
  }

  function findLibrary(id) {
    return getLibraryItems().find((item) => item.id === id) || null;
  }

  function getLibraryIdForChapter(chapterId) {
    return getLibraryItems().find((item) => item.chapterId === chapterId)?.id || "";
  }

  function getQuizIdForChapter(chapterId) {
    return findQuizByChapter(chapterId)?.id || "";
  }

  function getChapterNumberFromId(chapterId) {
    return findChapter(chapterId)?.number || 0;
  }

  function isChapterUnlocked(number) {
    if (number <= 1) return true;
    return !!state.progress.quizComplete[`quiz-${number - 1}`];
  }

  function isQuizUnlocked(quiz) {
    return !!quiz && isChapterUnlocked(quiz.number);
  }

  function isAssignmentUnlocked(assignment) {
    return !!assignment && isChapterUnlocked(assignment.number);
  }

  function isLibraryItemUnlocked(item) {
    return !!item && isChapterUnlocked(getChapterNumberFromId(item.chapterId));
  }

  function getUnlockedChapterCount() {
    return (data.chapters || []).filter((chapter) => isChapterUnlocked(chapter.number)).length;
  }

  function getCompletedQuizCount() {
    return Object.values(state.progress.quizComplete).filter(Boolean).length;
  }

  function getProgressSummary() {
    const totalQuizzes = (data.quizzes || []).length;
    const totalChapters = (data.chapters || []).length;
    const completedQuizzes = getCompletedQuizCount();
    return {
      totalQuizzes,
      totalChapters,
      unlockedChapters: getUnlockedChapterCount(),
      completedQuizzes,
      percent: totalQuizzes ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0
    };
  }

  function resolveMatchingData(quiz) {
    const matching = quiz.matching || {};
    const rawTerms = Array.isArray(matching.terms) ? matching.terms : Array.isArray(matching.options) ? matching.options : [];
    const terms = rawTerms.map((term, index) => {
      if (typeof term === "string") {
        return { key: String(index + 1), value: term, label: `${index + 1}. ${term}` };
      }
      const baseValue = term.value || term.term || term.text || term.answer || term.label || `Term ${index + 1}`;
      const key = String(term.label || index + 1);
      return { key, value: baseValue, label: `${key}. ${baseValue}` };
    });

    const rawItems = Array.isArray(matching.items) ? matching.items : Array.isArray(matching.questions) ? matching.questions : [];
    const items = rawItems.map((item, index) => ({
      number: item.number || index + 1,
      prompt: item.prompt || item.text || item.statement || item.question || "",
      correct: resolveMatchingAnswer(item.answer ?? item.correct ?? item.match ?? "", terms)
    }));

    return { terms, items };
  }

  function resolveMatchingAnswer(value, options) {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    const asNumber = Number(raw);
    if (!Number.isNaN(asNumber) && options[asNumber - 1]) return options[asNumber - 1].value;
    const byKey = options.find((option) => normalizeText(option.key) === normalizeText(raw));
    if (byKey) return byKey.value;
    const byLabel = options.find((option) => normalizeText(option.label) === normalizeText(raw));
    if (byLabel) return byLabel.value;
    const byValue = options.find((option) => normalizeText(option.value) === normalizeText(raw));
    if (byValue) return byValue.value;
    return raw;
  }

  function computeObjectiveScore(quiz) {
    const work = getQuizWork(quiz.id);
    let total = 0;
    let correct = 0;

    (quiz.multipleChoice || []).forEach((item) => {
      total += 1;
      if (normalizeText(work.mc[item.number]) === normalizeText(item.answer)) correct += 1;
    });

    resolveMatchingData(quiz).items.forEach((item) => {
      total += 1;
      if (normalizeText(work.matching[item.number]) === normalizeText(item.correct)) correct += 1;
    });

    (quiz.trueFalse || []).forEach((item) => {
      total += 1;
      if (normalizeText(work.tf[item.number]) === normalizeText(item.answer)) correct += 1;
    });

    return { correct, total };
  }
  function renderNav() {
    refs.body.classList.toggle("sidebar-collapsed", state.sidebarCollapsed && !isMobile());
    refs.body.dataset.section = state.section;
    refs.body.dataset.tab = state.tab;
    refs.body.dataset.view = state.activeId ? "detail" : "overview";
    refs.navHome?.classList.toggle("active", state.section === "home");
    refs.navLibrary?.classList.toggle("active", state.section === "library");
    refs.tabChapters?.classList.toggle("active", state.tab === "chapters");
    refs.tabQuizzes?.classList.toggle("active", state.tab === "quizzes");
    refs.tabAssignments?.classList.toggle("active", state.tab === "assignments");
  }

  function renderProgress() {
    const summary = getProgressSummary();
    refs.courseTitle.textContent = data.course?.title || "World Religions 30";
    refs.courseSubtitle.textContent = data.course?.subtitle || "A comparative course shell for chapter study, quiz review, and local library reading.";
    refs.sidebarProgressTrack?.setAttribute("aria-valuenow", String(summary.percent));
    if (refs.sidebarProgressFill) {
      refs.sidebarProgressFill.style.width = `${summary.percent}%`;
    }
    refs.progressPercent.textContent = `${summary.percent}%`;
    refs.progressTrack?.setAttribute("aria-valuenow", String(summary.percent));
    if (refs.progressFill) {
      refs.progressFill.style.width = `${summary.percent}%`;
    }
    refs.chapterProgress.textContent = `${summary.unlockedChapters}/${summary.totalChapters}`;
    refs.quizProgress.textContent = `${summary.completedQuizzes}/${summary.totalQuizzes}`;
  }

  function setSection(section) {
    state.section = section;
    if (section === "home") {
      state.tab = "chapters";
    }
    state.activeId = null;
    closeMobileNav();
    render();
  }

  function setTab(tab) {
    state.section = "home";
    state.tab = tab;
    state.activeId = null;
    closeMobileNav();
    render();
  }

  function openChapter(id) {
    const chapter = findChapter(id);
    if (!chapter || !isChapterUnlocked(chapter.number)) return;
    state.section = "home";
    state.tab = "chapters";
    state.activeId = id;
    closeMobileNav();
    render();
  }

  function openQuiz(id) {
    const quiz = findQuiz(id);
    if (!quiz || !isQuizUnlocked(quiz)) return;
    state.section = "home";
    state.tab = "quizzes";
    state.activeId = id;
    state.quizSection = "mc";
    closeMobileNav();
    render();
  }

  function openAssignment(id) {
    const assignment = findAssignment(id);
    if (!assignment || !isAssignmentUnlocked(assignment)) return;
    state.section = "home";
    state.tab = "assignments";
    state.activeId = id;
    closeMobileNav();
    render();
  }

  function openLibrary(id) {
    const item = findLibrary(id);
    if (!item || !isLibraryItemUnlocked(item)) return;
    state.section = "library";
    state.activeLibraryId = id;
    closeMobileNav();
    render();
  }

  function markQuizComplete(id) {
    state.progress.quizComplete[id] = true;
    if (!state.progress.quizCompletedAt[id]) {
      state.progress.quizCompletedAt[id] = new Date().toISOString();
    }
    saveProgress();
    render();
  }

  function retakeQuiz(id) {
    state.progress.quizWork[id] = { mc: {}, matching: {}, tf: {} };
    state.checkedResults[id] = false;
    saveProgress();
    renderContent();
  }

  function setMcAnswer(quizId, questionNumber, answer) {
    const work = getQuizWork(quizId);
    work.mc[questionNumber] = answer;
    saveProgress();
    renderContent();
  }

  function setMatchingAnswer(quizId, questionNumber, answer) {
    const work = getQuizWork(quizId);
    work.matching[questionNumber] = answer;
    saveProgress();
  }

  function setTfAnswer(quizId, questionNumber, answer) {
    const work = getQuizWork(quizId);
    work.tf[questionNumber] = answer;
    saveProgress();
    renderContent();
  }

  function checkAnswers(id) {
    if (!state.progress.quizComplete[id]) return;
    state.checkedResults[id] = true;
    renderContent();
  }

  function buildViewerSrc(item) {
    return `./pdf-viewer.html?file=${encodeURIComponent(item.file || item.path || "")}&title=${encodeURIComponent(item.title || item.code || "Chapter PDF")}`;
  }

  function openExpandedViewer(item) {
    if (!item) return;
    refs.overlayCode.textContent = item.code || "";
    refs.overlayTitle.textContent = item.title || "Chapter PDF";
    refs.overlayDownload.href = item.file || item.path || "#";
    refs.overlayFrame.src = buildViewerSrc(item);
    refs.viewerOverlay.hidden = false;
  }

  function closeExpandedViewer() {
    refs.viewerOverlay.hidden = true;
    refs.overlayFrame.src = "about:blank";
  }

  function getLibraryActiveItem() {
    const unlocked = getLibraryItems().filter((item) => isLibraryItemUnlocked(item));
    if (!unlocked.length) return null;
    return findLibrary(state.activeLibraryId) && isLibraryItemUnlocked(findLibrary(state.activeLibraryId))
      ? findLibrary(state.activeLibraryId)
      : unlocked[0];
  }

  function renderSectionHeader() {
    if (state.section === "library") {
      refs.sectionTitle.textContent = "Library";
      refs.sectionIntro.textContent = "Use the chapter selector to open a local PDF, expand it to a full-page viewer, or jump straight into the connected quiz.";
      return;
    }

    if (state.tab === "quizzes") {
      refs.sectionTitle.textContent = "Quizzes";
      refs.sectionIntro.textContent = "Each quiz can be completed, checked, and exported. Completing a quiz unlocks the next chapter and its materials.";
      return;
    }

    if (state.tab === "assignments") {
      refs.sectionTitle.textContent = "Assignments";
      refs.sectionIntro.textContent = "Assignments are placeholders for now. The lane stays ready for future authored work.";
      return;
    }

    refs.sectionTitle.textContent = "Home";
    refs.sectionIntro.textContent = "Chapter shells stay empty for now. They unlock one by one as the chapter quizzes are completed.";
  }

  function renderHomeCards() {
    if (state.tab === "chapters" && state.activeId) return renderChapterDetail(findChapter(state.activeId));
    if (state.tab === "quizzes" && state.activeId) return renderQuizDetail(findQuiz(state.activeId));
    if (state.tab === "assignments" && state.activeId) return renderAssignmentDetail(findAssignment(state.activeId));

    if (state.tab === "quizzes") {
      return `
        <div class="card-grid">
          ${(data.quizzes || []).map((quiz) => {
            const unlocked = isQuizUnlocked(quiz);
            const complete = !!state.progress.quizComplete[quiz.id];
            const score = computeObjectiveScore(quiz);
            const nextChapter = findChapter(`chapter-${quiz.number + 1}`);
            return `
              <article class="course-card quiz-overview-card ${unlocked ? "" : "locked-card"}" style="--accent:${escapeHtml(quiz.accent || "#8b6728")}">
                <p class="card-code">${escapeHtml(quiz.code)}</p>
                <h4 class="card-title">${escapeHtml(quiz.title)}</h4>
                <p class="card-summary">Recreated chapter booklet with objective sections, written prompts, and keyed guidance.</p>
                <p class="card-meta">
                  <span><strong>${score.correct}/${score.total || quiz.objectiveTotal || 0}</strong> objective score</span>
                  <span>${complete ? "Completed" : unlocked ? "Ready" : `Locked until Chapter ${quiz.number - 1} quiz is complete`}</span>
                </p>
                <div class="card-actions">
                  <button class="btn btn-primary" type="button" data-open-quiz="${escapeHtml(quiz.id)}" ${unlocked ? "" : "disabled"}>Open quiz</button>
                </div>
                ${nextChapter && complete ? `<div class="status-chip">${escapeHtml(nextChapter.title)} unlocked</div>` : complete ? `<div class="status-chip">Quiz complete</div>` : !unlocked ? `<div class="status-chip locked">Locked</div>` : ""}
              </article>
            `;
          }).join("")}
        </div>
      `;
    }

    if (state.tab === "assignments") {
      return `
        <div class="card-grid">
          ${getAssignments().map((assignment) => {
            const unlocked = isAssignmentUnlocked(assignment);
            return `
              <article class="placeholder-card assignment-overview-card ${unlocked ? "" : "locked-card"}" style="--accent:${escapeHtml(assignment.accent || "#8b6728")}">
                <p class="card-code">${escapeHtml(assignment.code)}</p>
                <h4 class="card-title">${escapeHtml(assignment.title)}</h4>
                <p class="card-summary">${escapeHtml(assignment.summary)}</p>
                <div class="card-actions">
                  <button class="btn btn-muted" type="button" data-open-assignment="${escapeHtml(assignment.id)}" ${unlocked ? "" : "disabled"}>Open placeholder</button>
                </div>
                ${unlocked ? "" : `<div class="status-chip locked">Locked until the previous chapter quiz is complete</div>`}
              </article>
            `;
          }).join("")}
        </div>
      `;
    }

    return `
      <div class="card-grid">
        ${(data.chapters || []).map((chapter) => {
          const unlocked = isChapterUnlocked(chapter.number);
          return `
            <article class="course-card chapter-card ${unlocked ? "" : "locked-card"}" style="--accent:${escapeHtml(chapter.accent || "#8b6728")}">
              <p class="card-code">${escapeHtml(chapter.code)}</p>
              <h4 class="card-title">${escapeHtml(chapter.title)}</h4>
              <p class="card-summary">${escapeHtml(chapter.summary)}</p>
              <div class="card-actions">
                <button class="btn btn-primary" type="button" data-open-chapter="${escapeHtml(chapter.id)}" ${unlocked ? "" : "disabled"}>Open chapter shell</button>
                <button class="btn btn-secondary" type="button" data-open-library="${escapeHtml(getLibraryIdForChapter(chapter.id))}" ${unlocked ? "" : "disabled"}>Open PDF</button>
                <button class="btn btn-muted" type="button" data-open-quiz="${escapeHtml(getQuizIdForChapter(chapter.id))}" ${unlocked ? "" : "disabled"}>Open quiz</button>
              </div>
              ${unlocked ? `<div class="status-chip">Ready</div>` : `<div class="status-chip locked">Locked until Chapter ${chapter.number - 1} quiz is complete</div>`}
            </article>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderChapterDetail(chapter) {
    if (!chapter || !isChapterUnlocked(chapter.number)) {
      return `<div class="empty-state">This chapter is still locked.</div>`;
    }

    return `
      <article class="detail-card chapter-detail-card" style="--accent:${escapeHtml(chapter.accent || "#8b6728")}">
        <div class="detail-stack">
          <div>
            <p class="detail-eyebrow">${escapeHtml(chapter.code)}</p>
            <h4 class="detail-title">${escapeHtml(chapter.title)}</h4>
            <p class="detail-summary">${escapeHtml(chapter.summary)}</p>
          </div>
          <div class="lock-copy">This chapter lane is intentionally blank right now. Use the chapter PDF and recreated quiz until the full lesson content is added.</div>
          <div class="detail-actions">
            <button class="btn btn-primary" type="button" data-open-library="${escapeHtml(getLibraryIdForChapter(chapter.id))}">Open chapter PDF</button>
            <button class="btn btn-secondary" type="button" data-open-quiz="${escapeHtml(getQuizIdForChapter(chapter.id))}">Open quiz</button>
            <button class="btn btn-muted" type="button" data-back-home="chapters">Back to chapters</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderAssignmentDetail(assignment) {
    if (!assignment || !isAssignmentUnlocked(assignment)) {
      return `<div class="empty-state">This assignment lane is still locked.</div>`;
    }

    return `
      <article class="detail-card assignment-detail-card" style="--accent:${escapeHtml(assignment.accent || "#8b6728")}">
        <div class="detail-stack">
          <div>
            <p class="detail-eyebrow">${escapeHtml(assignment.code)}</p>
            <h4 class="detail-title">${escapeHtml(assignment.title)}</h4>
            <p class="detail-summary">${escapeHtml(assignment.summary)}</p>
          </div>
          <div class="lock-copy">This area stays open for future authored assignments. Nothing has been loaded into it yet.</div>
          <div class="detail-actions">
            <button class="btn btn-primary" type="button" data-open-library="${escapeHtml(getLibraryIdForChapter(assignment.chapterId))}">Open chapter PDF</button>
            <button class="btn btn-secondary" type="button" data-open-quiz="${escapeHtml(getQuizIdForChapter(assignment.chapterId))}">Open quiz</button>
            <button class="btn btn-muted" type="button" data-back-home="assignments">Back to assignments</button>
          </div>
        </div>
      </article>
    `;
  }
  function renderLibrary() {
    const items = getLibraryItems();
    const active = getLibraryActiveItem();
    if (!active) {
      return `<div class="empty-state">No unlocked chapter PDFs are available yet.</div>`;
    }

    state.activeLibraryId = active.id;
    const chapter = findChapter(active.chapterId);
    const quiz = findQuizByChapter(active.chapterId);

    return `
      <div class="library-shell">
        <article class="library-select-shell library-select-card" style="--accent:${escapeHtml(active.accent || "#8b6728")}">
          <div class="viewer-toolbar">
            <div class="viewer-select-group">
              <label class="field-label" for="library-select">Choose chapter PDF</label>
              <div class="select-wrap">
                <select id="library-select" class="select-field" data-library-select>
                  ${items.map((item) => {
                    const unlocked = isLibraryItemUnlocked(item);
                    return `<option value="${escapeHtml(item.id)}" ${item.id === active.id ? "selected" : ""} ${unlocked ? "" : "disabled"}>${escapeHtml(item.code)} - ${escapeHtml(item.title)}${unlocked ? "" : " (locked)"}</option>`;
                  }).join("")}
                </select>
              </div>
            </div>
            <div class="viewer-actions">
              <a class="btn btn-primary" href="${escapeHtml(active.file || active.path || "#")}" download>Download PDF</a>
              <button class="btn btn-secondary" type="button" data-open-expanded-viewer="${escapeHtml(active.id)}">Expand viewer</button>
              ${chapter ? `<button class="btn btn-muted" type="button" data-open-chapter="${escapeHtml(chapter.id)}">Open chapter shell</button>` : ""}
              ${quiz ? `<button class="btn btn-muted" type="button" data-open-quiz="${escapeHtml(quiz.id)}">Open quiz</button>` : ""}
            </div>
          </div>
          <p class="viewer-copy">${escapeHtml(active.summary || "Local chapter PDF.")}</p>
        </article>

        <article class="viewer-shell library-viewer-card" style="--accent:${escapeHtml(active.accent || "#8b6728")}">
          <p class="detail-eyebrow">${escapeHtml(active.code || "")}</p>
          <h4 class="detail-title">${escapeHtml(active.title)}</h4>
          <p class="detail-summary">Read the chapter directly in the shell, or expand the viewer if you want a full-page reading surface.</p>
          <div class="viewer-frame">
            <iframe title="${escapeHtml(active.title)}" src="${escapeHtml(buildViewerSrc(active))}"></iframe>
          </div>
        </article>
      </div>
    `;
  }

  function renderMultipleChoice(quiz, work, showResults) {
    const items = quiz.multipleChoice || [];
    if (!items.length) return `<div class="empty-state">No multiple-choice items were found for this chapter.</div>`;

    return `
      <div class="objective-stack">
        ${items.map((item) => `
          <article class="objective-card ${showResults ? "show-results" : ""}">
            <div class="objective-head">
              <div class="objective-number">${escapeHtml(item.number)}</div>
              <div>
                <h5>${escapeHtml(item.prompt)}</h5>
                ${item.context ? `<p>${escapeHtml(item.context)}</p>` : ""}
              </div>
            </div>
            <div class="answer-grid">
              ${(item.options || []).map((option) => {
                const selected = normalizeText(work.mc[item.number]) === normalizeText(option.label);
                const correct = normalizeText(item.answer) === normalizeText(option.label);
                const stateClass = showResults ? (correct ? "correct" : selected ? "incorrect" : "") : selected ? "selected" : "";
                return `
                  <button class="answer-option ${stateClass}" type="button" data-mc-answer="${escapeHtml(quiz.id)}" data-question="${escapeHtml(item.number)}" data-value="${escapeHtml(option.label)}">
                    <span><strong>${escapeHtml(option.label)}</strong>${escapeHtml(option.text)}</span>
                  </button>
                `;
              }).join("")}
            </div>
            <div class="answer-key"><strong>Correct answer:</strong> ${escapeHtml(item.answer)}</div>
          </article>
        `).join("")}
      </div>
    `;
  }

  function renderMatching(quiz, work, showResults) {
    const matching = resolveMatchingData(quiz);
    if (!matching.items.length) return `<div class="empty-state">No matching set was found for this chapter.</div>`;

    return `
      <div class="objective-stack">
        ${matching.items.map((item) => {
          const selected = work.matching[item.number] || "";
          const isCorrect = normalizeText(selected) === normalizeText(item.correct);
          return `
            <article class="objective-card ${showResults ? "show-results" : ""}">
              <div class="objective-head">
                <div class="objective-number">${escapeHtml(item.number)}</div>
                <div><h5>${escapeHtml(item.prompt)}</h5></div>
              </div>
              <div class="matching-row">
                <div class="section-copy">Match this item to the correct term from the chapter term bank.</div>
                <select class="matching-select" data-matching-question="${escapeHtml(item.number)}" data-quiz-id="${escapeHtml(quiz.id)}">
                  <option value="">Choose a term</option>
                  ${matching.terms.map((term) => `<option value="${escapeHtml(term.value)}" ${normalizeText(selected) === normalizeText(term.value) ? "selected" : ""}>${escapeHtml(term.label)}</option>`).join("")}
                </select>
              </div>
              <div class="answer-key"><strong>Correct answer:</strong> ${escapeHtml(item.correct)}${showResults && selected ? ` — ${isCorrect ? "Correct" : "Does not match your selected answer."}` : ""}</div>
            </article>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderTrueFalse(quiz, work, showResults) {
    const items = quiz.trueFalse || [];
    if (!items.length) return `<div class="empty-state">No true / false items were found for this chapter.</div>`;

    return `
      <div class="objective-stack">
        ${items.map((item) => `
          <article class="objective-card ${showResults ? "show-results" : ""}">
            <div class="objective-head">
              <div class="objective-number">${escapeHtml(item.number)}</div>
              <div><h5>${escapeHtml(item.prompt || item.statement || item.text || "")}</h5></div>
            </div>
            <div class="answer-grid">
              ${["T", "F"].map((choice) => {
                const selected = normalizeText(work.tf[item.number]) === normalizeText(choice);
                const correct = normalizeText(item.answer) === normalizeText(choice);
                const stateClass = showResults ? (correct ? "correct" : selected ? "incorrect" : "") : selected ? "selected" : "";
                return `
                  <button class="answer-option ${stateClass}" type="button" data-tf-answer="${escapeHtml(quiz.id)}" data-question="${escapeHtml(item.number)}" data-value="${escapeHtml(choice)}">
                    <span><strong>${escapeHtml(choice)}</strong>${choice === "T" ? "True" : "False"}</span>
                  </button>
                `;
              }).join("")}
            </div>
            <div class="answer-key"><strong>Correct answer:</strong> ${normalizeText(item.answer) === "t" ? "True" : normalizeText(item.answer) === "f" ? "False" : escapeHtml(item.answer)}</div>
          </article>
        `).join("")}
      </div>
    `;
  }

  function renderWritten(quiz, showResults) {
    const items = quiz.writtenResponse || [];
    if (!items.length) return `<div class="empty-state">No written-response prompts were found for this chapter.</div>`;

    return `
      <div class="written-stack">
        ${items.map((item) => `
          <article class="written-card ${showResults ? "show-results" : ""}">
            <h5>${escapeHtml(item.number ? `${item.number}. ` : "")}${escapeHtml(item.prompt || item.question || item.text || "")}</h5>
            <div class="written-key"><strong>Teacher guidance:</strong> ${escapeHtml(item.teacherKey || item.answer || "Keyed response not provided in the teacher copy.")}</div>
          </article>
        `).join("")}
      </div>
    `;
  }

  function getStudentChoiceOptions(quiz) {
    const raw = quiz?.studentChoice;
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.options)) return raw.options;
    if (raw && Array.isArray(raw.items)) return raw.items;
    return [];
  }

  function getStudentChoiceIntro(quiz) {
    const raw = quiz?.studentChoice;
    if (raw && Array.isArray(raw.intro)) return raw.intro;
    if (raw && raw.intro) return [raw.intro];
    return [];
  }

  function renderStudentChoice(quiz, showResults) {
    const intro = getStudentChoiceIntro(quiz);
    const items = getStudentChoiceOptions(quiz);
    if (!items.length) return `<div class="empty-state">No student-choice section was found for this chapter.</div>`;

    return `
      <div class="option-stack">
        ${intro.length ? `
          <article class="option-card">
            <h5>Student-choice path</h5>
            ${intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
          </article>
        ` : ""}
        ${items.map((item, index) => `
          <article class="option-card ${showResults ? "show-results" : ""}">
            <h5>${escapeHtml(item.label ? `Option ${item.label}` : `Option ${index + 1}`)}${item.title ? ` - ${escapeHtml(item.title)}` : ""}</h5>
            ${Array.isArray(item.prompts) && item.prompts.length ? `
              <ol>
                ${item.prompts.map((prompt) => `<li>${escapeHtml(prompt.prompt || prompt.text || prompt.question || "")}</li>`).join("")}
              </ol>
            ` : `<p>${escapeHtml(item.prompt || item.text || "Student-choice response path from the chapter booklet.")}</p>`}
            <div class="student-note"><strong>Teacher note:</strong> ${escapeHtml(item.teacherNote || "No keyed teacher note was found for this option.")}</div>
          </article>
        `).join("")}
      </div>
    `;
  }
  function getQuizSectionIntro(section, complete) {
    if (!complete) {
      return "Complete the quiz first. Once marked complete, you can check answers and generate results.";
    }

    switch (section) {
      case "matching":
        return "Match chapter terms, people, or concepts to the correct descriptions from the original booklet.";
      case "tf":
        return "Compare each statement to the keyed true / false answers from the teacher booklet.";
      case "written":
        return "Written-response prompts stay intact. Teacher guidance appears once answers are checked.";
      case "choice":
        return "Student-choice options stay intact. Teacher notes appear once answers are checked.";
      default:
        return "Objective sections stay interactive. Check answers after completion to compare your work against the keyed version.";
    }
  }

  function renderQuizDetail(quiz) {
    if (!quiz || !isQuizUnlocked(quiz)) {
      return `<div class="empty-state">This quiz is still locked.</div>`;
    }

    const work = getQuizWork(quiz.id);
    const complete = !!state.progress.quizComplete[quiz.id];
    const completedAt = formatDate(state.progress.quizCompletedAt[quiz.id]);
    const showResults = !!state.checkedResults[quiz.id] && complete;
    const score = computeObjectiveScore(quiz);
    const section = state.quizSection;

    let sectionHtml = "";
    if (section === "matching") {
      sectionHtml = renderMatching(quiz, work, showResults);
    } else if (section === "tf") {
      sectionHtml = renderTrueFalse(quiz, work, showResults);
    } else if (section === "written") {
      sectionHtml = renderWritten(quiz, showResults);
    } else if (section === "choice") {
      sectionHtml = renderStudentChoice(quiz, showResults);
    } else {
      sectionHtml = renderMultipleChoice(quiz, work, showResults);
    }

    return `
      <article class="quiz-shell quiz-detail-card" style="--accent:${escapeHtml(quiz.accent || "#8b6728")}">
        <div class="quiz-stack">
          <div class="quiz-topbar">
            <div class="quiz-copy">
              <p class="detail-eyebrow">${escapeHtml(quiz.code)}</p>
              <h4>${escapeHtml(quiz.title)}</h4>
              <p>${complete ? "This quiz is complete. You can still retake it, re-check answers, and regenerate the results PDF." : "Finish your attempt, then mark the quiz complete to unlock the next chapter."}</p>
            </div>
              <div class="quiz-actions">
                <button class="btn btn-primary" type="button" data-mark-quiz-complete="${escapeHtml(quiz.id)}" ${complete ? "disabled" : ""}>${complete ? "Completed" : "Mark complete"}</button>
                <button class="btn btn-secondary" type="button" data-check-answers="${escapeHtml(quiz.id)}" ${complete ? "" : "disabled"}>Check answers</button>
                <button class="btn btn-muted" type="button" data-generate-quiz-results="${escapeHtml(quiz.id)}" ${complete ? "" : "disabled"}>Generate Results</button>
                <button class="btn btn-muted" type="button" data-retake-quiz="${escapeHtml(quiz.id)}">Retake Quiz</button>
                <button class="btn btn-muted" type="button" data-back-home="quizzes">Back to quizzes</button>
              </div>
            </div>

          <div class="quiz-summary">
            <div class="quiz-summary-card">
              <span class="metric-label">Objective score</span>
              <strong>${score.correct}/${score.total || quiz.objectiveTotal || 0}</strong>
            </div>
            <div class="quiz-summary-card results-copy">
              <span class="metric-label">Status</span>
              <strong style="font-size:1rem; color: var(--text); margin-top: 10px;">${complete ? "Quiz complete" : "In progress"}</strong>
              <p style="margin:8px 0 0;">${complete && completedAt ? `Completed on ${escapeHtml(completedAt)}.` : `The next chapter unlocks when this quiz is marked complete.`}</p>
            </div>
          </div>

          <div class="quiz-pill-row">
            <button class="quiz-pill ${section === "mc" ? "active" : ""}" type="button" data-quiz-section="mc">Multiple choice</button>
            <button class="quiz-pill ${section === "matching" ? "active" : ""}" type="button" data-quiz-section="matching">Matching</button>
            <button class="quiz-pill ${section === "tf" ? "active" : ""}" type="button" data-quiz-section="tf">True / false</button>
            <button class="quiz-pill ${section === "written" ? "active" : ""}" type="button" data-quiz-section="written">Written response</button>
            <button class="quiz-pill ${section === "choice" ? "active" : ""}" type="button" data-quiz-section="choice">Student choice</button>
          </div>

          <div class="section-copy">${escapeHtml(getQuizSectionIntro(section, complete))}</div>
          ${sectionHtml}
        </div>
      </article>
    `;
  }

  function getResultLabel(selected, correct) {
    if (!normalizeText(selected)) return "No answer";
    return normalizeText(selected) === normalizeText(correct) ? "Correct" : "Incorrect";
  }

  function getResultTone(result) {
    const normalized = normalizeText(result);
    if (normalized === "correct") return "is-correct";
    if (normalized === "incorrect") return "is-incorrect";
    return "is-empty";
  }

  function renderResultsCell(row, column) {
    const value = cleanText(row[column.key] || "").trim();
    if (column.key === "result") {
      return `
        <td class="results-cell results-cell-result">
          <span class="result-badge ${getResultTone(value)}">${escapeHtml(value || "No answer")}</span>
        </td>
      `;
    }
    if (!value) {
      return `<td class="results-cell"><span class="results-empty">No answer recorded</span></td>`;
    }
    return `<td class="results-cell">${escapeHtml(value)}</td>`;
  }

  function renderResultsTable(rows, columns) {
    if (!rows.length) {
      return `<div class="report-empty">No keyed items were provided for this section.</div>`;
    }
    return `
      <div class="results-table-wrap">
        <table class="results-table">
          <thead>
            <tr>
              ${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                ${columns.map((column) => renderResultsCell(row, column)).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderResultsSection(title, copy, rows, columns) {
    return `
      <section class="report-section">
        <div class="section-heading">
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(copy)}</p>
        </div>
        ${renderResultsTable(rows, columns)}
      </section>
    `;
  }

  function renderTeacherGuidance(rows) {
    const cards = rows.length
      ? rows.map((row) => `
          <article class="guidance-card">
            <div class="guidance-label">Prompt</div>
            <div class="guidance-prompt">${escapeHtml(row.prompt || "Untitled prompt")}</div>
            <div class="guidance-label">Teacher guidance</div>
            <div class="guidance-body">${escapeHtml(row.guidance || "No keyed guidance provided.")}</div>
          </article>
        `).join("")
      : `<div class="report-empty">No written-response or student-choice guidance was keyed for this quiz.</div>`;

    return `
      <section class="report-section">
        <div class="section-heading">
          <h2>Teacher guidance</h2>
          <p>Written-response and student-choice guidance pulled from the keyed chapter booklet.</p>
        </div>
        <div class="teacher-guidance-grid">
          ${cards}
        </div>
      </section>
    `;
  }

  function buildQuizResultsHtml({ quiz, score, completedAt, generatedAt, mcRows, matchingRows, tfRows, guidanceRows }) {
    const courseTitle = data.course?.title || "World Religions 30";
    const objectiveRows = [...mcRows, ...matchingRows, ...tfRows];
    const correctCount = objectiveRows.filter((row) => row.result === "Correct").length;
    const incorrectCount = objectiveRows.filter((row) => row.result === "Incorrect").length;
    const unansweredCount = objectiveRows.filter((row) => row.result === "No answer").length;

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(quiz.title)} Results</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  @page { size: letter portrait; margin: 0.55in; }
  body {
    margin: 0;
    color: #241f17;
    background: #efe8dc;
    font-family: Aptos, Calibri, sans-serif;
    line-height: 1.45;
  }
  .results-sheet {
    max-width: 960px;
    margin: 0 auto;
    background: #ffffff;
    padding: 32px 36px 40px;
    box-shadow: 0 8px 18px rgba(51, 39, 20, 0.08);
  }
  .report-header {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    align-items: flex-start;
    border-bottom: 2px solid #cdbda1;
    padding-bottom: 18px;
  }
  .report-course {
    font-size: 14px;
    font-weight: 600;
    color: #6d5731;
  }
  .report-code {
    margin-top: 6px;
    font-size: 13px;
    color: #5c5347;
  }
  h1, h2 {
    margin: 0;
    font-weight: 700;
    color: #241f17;
  }
  h1 {
    margin-top: 8px;
    font-size: 30px;
    line-height: 1.12;
  }
  h2 {
    font-size: 18px;
  }
  .report-subtitle {
    margin: 12px 0 0;
    max-width: 62ch;
    color: #5e5446;
    font-size: 14px;
  }
  .report-meta {
    min-width: 250px;
    border: 1px solid #d8ccb7;
    padding: 14px 16px;
  }
  .meta-row + .meta-row {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #e7dece;
  }
  .meta-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #6f6659;
  }
  .meta-value {
    margin-top: 3px;
    font-size: 14px;
    color: #241f17;
  }
  .summary-strip {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
  }
  .summary-card {
    border: 1px solid #d8ccb7;
    padding: 14px 15px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .summary-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #6f6659;
  }
  .summary-value {
    margin-top: 8px;
    font-size: 28px;
    line-height: 1;
    font-weight: 700;
    color: #241f17;
  }
  .summary-note {
    margin-top: 8px;
    font-size: 12px;
    color: #5f5649;
  }
  .report-section {
    margin-top: 26px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .section-heading {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: flex-end;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e1d6c3;
  }
  .section-heading p {
    margin: 0;
    max-width: 58ch;
    color: #5f5649;
    font-size: 13px;
  }
  .results-table-wrap {
    border: 1px solid #ddd1be;
  }
  .results-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  thead { display: table-header-group; }
  tfoot { display: table-footer-group; }
  tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  th {
    padding: 10px 11px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #4d4336;
    background: #f4eee2;
    border-bottom: 1px solid #c7b495;
  }
  .results-cell {
    padding: 9px 11px;
    vertical-align: top;
    border-bottom: 1px solid #e8decf;
  }
  tbody tr:nth-child(even) .results-cell {
    background: #fbf8f2;
  }
  .results-cell-result {
    width: 132px;
  }
  .result-badge {
    display: inline-block;
    min-width: 96px;
    padding: 4px 8px;
    border: 1px solid #cbbca3;
    border-radius: 6px;
    text-align: center;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }
  .result-badge.is-correct {
    color: #284c21;
    background: #edf4e7;
    border-color: #aac19a;
  }
  .result-badge.is-incorrect {
    color: #8a3a2a;
    background: #fff0ea;
    border-color: #d8a391;
  }
  .result-badge.is-empty {
    color: #685d4e;
    background: #f5f1ea;
    border-color: #cabda8;
  }
  .results-empty {
    color: #857a6b;
    font-style: italic;
  }
  .teacher-guidance-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .guidance-card {
    border: 1px solid #ddd1be;
    padding: 14px 15px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .guidance-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #6f6659;
  }
  .guidance-prompt {
    margin-top: 4px;
    font-size: 14px;
    font-weight: 700;
    color: #241f17;
  }
  .guidance-body {
    margin-top: 8px;
    font-size: 13px;
    color: #3d352b;
    white-space: pre-wrap;
  }
  .report-empty {
    border: 1px solid #ddd1be;
    padding: 14px 15px;
    color: #695f51;
    background: #faf7f1;
  }
  @media print {
    body {
      background: #ffffff;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .results-sheet {
      max-width: none;
      margin: 0;
      padding: 0;
      box-shadow: none;
    }
    .summary-strip {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 820px) {
    .results-sheet {
      padding: 24px;
    }
    .report-header,
    .section-heading {
      flex-direction: column;
      align-items: flex-start;
    }
    .report-meta {
      width: 100%;
      min-width: 0;
    }
    .summary-strip,
    .teacher-guidance-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
</head>
<body>
  <main class="results-sheet">
    <header class="report-header">
      <div>
        <div class="report-course">${escapeHtml(courseTitle)}</div>
        <div class="report-code">${escapeHtml(quiz.code || "Quiz results")}</div>
        <h1>${escapeHtml(quiz.title)}</h1>
        <p class="report-subtitle">A print-ready summary of learner selections, keyed answers, and teacher guidance for this chapter quiz.</p>
      </div>
      <aside class="report-meta">
        <div class="meta-row">
          <span class="meta-label">Completed</span>
          <div class="meta-value">${escapeHtml(completedAt)}</div>
        </div>
        <div class="meta-row">
          <span class="meta-label">Generated</span>
          <div class="meta-value">${escapeHtml(generatedAt)}</div>
        </div>
        <div class="meta-row">
          <span class="meta-label">Status</span>
          <div class="meta-value">Quiz complete</div>
        </div>
      </aside>
    </header>

    <section class="summary-strip">
      <article class="summary-card">
        <div class="summary-label">Objective score</div>
        <div class="summary-value">${escapeHtml(`${score.correct}/${score.total || quiz.objectiveTotal || 0}`)}</div>
        <div class="summary-note">${escapeHtml(`${score.total || quiz.objectiveTotal || 0} objective items keyed in the booklet.`)}</div>
      </article>
      <article class="summary-card">
        <div class="summary-label">Correct</div>
        <div class="summary-value">${escapeHtml(String(correctCount))}</div>
        <div class="summary-note">Items answered correctly across multiple choice, matching, and true / false.</div>
      </article>
      <article class="summary-card">
        <div class="summary-label">Incorrect</div>
        <div class="summary-value">${escapeHtml(String(incorrectCount))}</div>
        <div class="summary-note">Items with a recorded answer that did not match the key.</div>
      </article>
      <article class="summary-card">
        <div class="summary-label">No answer</div>
        <div class="summary-value">${escapeHtml(String(unansweredCount))}</div>
        <div class="summary-note">Items left blank when the report was generated.</div>
      </article>
    </section>

    ${renderResultsSection(
      "Multiple choice",
      "Learner selections compared against the keyed chapter answer for each multiple-choice item.",
      mcRows,
      [
        { key: "question", label: "Question" },
        { key: "selected", label: "Selected" },
        { key: "correct", label: "Correct" },
        { key: "result", label: "Result" }
      ]
    )}

    ${renderResultsSection(
      "Matching",
      "Each matched term is listed with the learner selection and the keyed chapter match.",
      matchingRows,
      [
        { key: "question", label: "Item" },
        { key: "selected", label: "Selected" },
        { key: "correct", label: "Correct" },
        { key: "result", label: "Result" }
      ]
    )}

    ${renderResultsSection(
      "True / false",
      "True / false answers are recorded exactly as selected at the time of report generation.",
      tfRows,
      [
        { key: "question", label: "Question" },
        { key: "selected", label: "Selected" },
        { key: "correct", label: "Correct" },
        { key: "result", label: "Result" }
      ]
    )}

    ${renderTeacherGuidance(guidanceRows)}
  </main>
</body>
</html>`;
  }

  function generateQuizResults(quiz) {
    if (!quiz || !state.progress.quizComplete[quiz.id]) return;

    const work = getQuizWork(quiz.id);
    const score = computeObjectiveScore(quiz);
    const matching = resolveMatchingData(quiz);
    const mcRows = (quiz.multipleChoice || []).map((item) => ({
      question: String(item.number),
      selected: work.mc[item.number] || "",
      correct: item.answer || "",
      result: getResultLabel(work.mc[item.number], item.answer)
    }));
    const matchingRows = matching.items.map((item) => ({
      question: String(item.number),
      selected: work.matching[item.number] || "",
      correct: item.correct || "",
      result: getResultLabel(work.matching[item.number], item.correct)
    }));
    const tfRows = (quiz.trueFalse || []).map((item) => ({
      question: String(item.number),
      selected: work.tf[item.number] || "",
      correct: normalizeText(item.answer) === "t" ? "True" : normalizeText(item.answer) === "f" ? "False" : item.answer || "",
      result: getResultLabel(work.tf[item.number], item.answer)
    }));
    const guidanceRows = [...(quiz.writtenResponse || []).map((item) => ({
      prompt: item.prompt || item.question || item.text || "",
      guidance: item.teacherKey || item.answer || ""
    })), ...getStudentChoiceOptions(quiz).map((item, index) => ({
      prompt: item.label ? `Option ${item.label}: ${item.title || item.prompt || item.text || ""}` : item.title || item.prompt || item.text || `Option ${index + 1}`,
      guidance: item.teacherNote || ""
    }))];
    const reportHtml = buildQuizResultsHtml({
      quiz,
      score,
      completedAt: formatDate(state.progress.quizCompletedAt[quiz.id]) || new Date().toLocaleString(),
      generatedAt: new Date().toLocaleString(),
      mcRows,
      matchingRows,
      tfRows,
      guidanceRows
    });

    const popup = window.open("", "_blank", "width=1100,height=840");
    if (!popup) {
      return;
    }

    popup.document.open();
    popup.document.write(reportHtml);
    popup.document.close();
    popup.focus();
    setTimeout(() => {
      try {
        popup.print();
      } catch (_error) {
        // Ignore print failures in preview environments.
      }
    }, 350);
  }
  function renderContent() {
    renderSectionHeader();
    refs.contentBody.innerHTML = state.section === "library" ? renderLibrary() : renderHomeCards();
    bindContentEvents();
  }

  function bindContentEvents() {
    refs.contentBody.onclick = (event) => {
      const chapterButton = event.target.closest("[data-open-chapter]");
      if (chapterButton) return void openChapter(chapterButton.dataset.openChapter);

      const quizButton = event.target.closest("[data-open-quiz]");
      if (quizButton) return void openQuiz(quizButton.dataset.openQuiz);

      const assignmentButton = event.target.closest("[data-open-assignment]");
      if (assignmentButton) return void openAssignment(assignmentButton.dataset.openAssignment);

      const libraryButton = event.target.closest("[data-open-library]");
      if (libraryButton) return void openLibrary(libraryButton.dataset.openLibrary);

      const expandedViewerButton = event.target.closest("[data-open-expanded-viewer]");
      if (expandedViewerButton) return void openExpandedViewer(findLibrary(expandedViewerButton.dataset.openExpandedViewer));

      const backButton = event.target.closest("[data-back-home]");
      if (backButton) return void setTab(backButton.dataset.backHome);

      const markCompleteButton = event.target.closest("[data-mark-quiz-complete]");
      if (markCompleteButton) return void markQuizComplete(markCompleteButton.dataset.markQuizComplete);

      const checkAnswersButton = event.target.closest("[data-check-answers]");
      if (checkAnswersButton) return void checkAnswers(checkAnswersButton.dataset.checkAnswers);

      const generateButton = event.target.closest("[data-generate-quiz-results]");
      if (generateButton) return void generateQuizResults(findQuiz(generateButton.dataset.generateQuizResults));

      const retakeButton = event.target.closest("[data-retake-quiz]");
      if (retakeButton) return void retakeQuiz(retakeButton.dataset.retakeQuiz);

      const quizSectionButton = event.target.closest("[data-quiz-section]");
      if (quizSectionButton) {
        state.quizSection = quizSectionButton.dataset.quizSection;
        return void renderContent();
      }

      const mcButton = event.target.closest("[data-mc-answer]");
      if (mcButton) return void setMcAnswer(mcButton.dataset.mcAnswer, mcButton.dataset.question, mcButton.dataset.value);

      const tfButton = event.target.closest("[data-tf-answer]");
      if (tfButton) return void setTfAnswer(tfButton.dataset.tfAnswer, tfButton.dataset.question, tfButton.dataset.value);
    };

    refs.contentBody.onchange = (event) => {
      const librarySelect = event.target.closest("[data-library-select]");
      if (librarySelect) return void openLibrary(librarySelect.value);

      const matchingSelect = event.target.closest("[data-matching-question]");
      if (matchingSelect) return void setMatchingAnswer(matchingSelect.dataset.quizId, matchingSelect.dataset.matchingQuestion, matchingSelect.value);
    };
  }

  function render() {
    renderNav();
    renderProgress();
    renderContent();
  }

  refs.menuToggle?.addEventListener("click", toggleNavMode);
  refs.navHome?.addEventListener("click", () => setSection("home"));
  refs.navLibrary?.addEventListener("click", () => setSection("library"));
  refs.tabChapters?.addEventListener("click", () => setTab("chapters"));
  refs.tabQuizzes?.addEventListener("click", () => setTab("quizzes"));
  refs.tabAssignments?.addEventListener("click", () => setTab("assignments"));
  refs.overlayClose?.addEventListener("click", closeExpandedViewer);
  refs.viewerOverlay?.addEventListener("click", (event) => {
    if (event.target === refs.viewerOverlay) closeExpandedViewer();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !refs.viewerOverlay.hidden) closeExpandedViewer();
  });

  window.addEventListener("resize", () => {
    setMobileNav(false);
    renderNav();
  });

  refs.body.classList.toggle("sidebar-collapsed", state.sidebarCollapsed && !isMobile());
  render();
})();

