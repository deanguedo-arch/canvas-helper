(function () {
  const data = window.MENTAL_HEALTH_WELLNESS_DATA || { course: {}, chapters: [], quizzes: [], assignments: [], library: [] };
  const PROJECT_SLUG = document.body?.dataset.projectSlug || "mental-health-wellness";
  const STORAGE_KEY = "mental-health-wellness.progress";
  const UI_KEY = "mental-health-wellness.ui";
  const COMPACT_NAV_QUERY = "(max-width: 1023px)";

  const refs = {
    body: document.body,
    menuToggle: document.getElementById("menu-toggle"),
    navHome: document.getElementById("nav-home"),
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
    sectionHeader: document.querySelector(".section-header"),
    sectionTitle: document.getElementById("section-title"),
    sectionIntro: document.getElementById("section-intro"),
    contentBody: document.getElementById("content-body")
  };

  const state = {
    section: "home",
    tab: "chapters",
    activeId: null,
    mobileNavOpen: false,
    sidebarCollapsed: loadUiState().sidebarCollapsed,
    progress: loadProgress()
  };
  let chapterProgressCleanup = null;

  function loadProgress() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        quizComplete: parsed.quizComplete || {},
        moduleComponents: parsed.moduleComponents || {},
        assignmentComplete: parsed.assignmentComplete || {}
      };
    } catch (_error) {
      return { quizComplete: {}, moduleComponents: {}, assignmentComplete: {} };
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
    if (typeof window.matchMedia === "function") {
      return window.matchMedia(COMPACT_NAV_QUERY).matches;
    }
    return window.innerWidth <= 1023;
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
    return String(value ?? "").replace(/[\uFFFD]/g, "-").replace(/[–—]/g, "-");
  }

  function escapeHtml(value) {
    return cleanText(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function findChapter(id) {
    return (data.chapters || []).find((item) => item.id === id) || null;
  }

  function hasQuizzes() {
    return (data.quizzes || []).length > 0;
  }

  function hasAssignments() {
    return (data.assignments || []).length > 0;
  }

  function getAssignments() {
    return data.assignments || [];
  }

  function getVisibleChapters() {
    return data.chapters || [];
  }

  function getChapterComponentIds(chapterId) {
    const chapter = findChapter(chapterId);
    return Array.isArray(chapter?.componentIds) ? chapter.componentIds.filter(Boolean) : [];
  }

  function getChapterComponentState(chapterId) {
    const existing = state.progress.moduleComponents?.[chapterId];
    if (existing && typeof existing === "object") {
      return existing;
    }
    state.progress.moduleComponents[chapterId] = {};
    saveProgress();
    return state.progress.moduleComponents[chapterId];
  }

  function getCompletedComponentCount(chapterId) {
    const componentIds = getChapterComponentIds(chapterId);
    const completion = getChapterComponentState(chapterId);
    return componentIds.filter((componentId) => !!completion[componentId]).length;
  }

  function getNextIncompleteComponentId(chapterId) {
    return getChapterComponentIds(chapterId).find((componentId) => !getChapterComponentState(chapterId)[componentId]) || "";
  }

  function setModuleComponentComplete(chapterId, componentId, complete = true) {
    if (!chapterId || !componentId) return;
    const completion = getChapterComponentState(chapterId);
    completion[componentId] = !!complete;
    saveProgress();
  }

  function isChapterUnlocked() {
    return true;
  }

  function getCompletedQuizCount() {
    return Object.values(state.progress.quizComplete).filter(Boolean).length;
  }

  function getCompletedContentCount() {
    return getVisibleChapters().reduce((sum, chapter) => sum + getCompletedComponentCount(chapter.id), 0);
  }

  function getTotalContentCount() {
    return getVisibleChapters().reduce((sum, chapter) => {
      if (Array.isArray(chapter.componentIds)) return sum + chapter.componentIds.length;
      return sum + (chapter.contentPath ? 1 : 0);
    }, 0);
  }

  function getProgressSummary() {
    const totalQuizzes = (data.quizzes || []).length;
    const totalChapters = getVisibleChapters().length;
    const totalAssignments = getAssignments().length;
    const totalContent = getTotalContentCount();
    const completedContent = getCompletedContentCount();
    const completedQuizzes = getCompletedQuizCount();
    const contentPercent = totalContent ? Math.round((completedContent / totalContent) * 100) : 0;
    return {
      totalQuizzes,
      totalChapters,
      totalAssignments,
      totalContent,
      completedContent,
      completedQuizzes,
      unlockedChapters: totalChapters,
      percent: totalQuizzes ? Math.round((completedQuizzes / totalQuizzes) * 100) : contentPercent
    };
  }

  function syncChapterProgressFrame(chapterId, focusComponentId = "") {
    const frame = refs.contentBody.querySelector(".chapter-content-frame");
    if (!frame || frame.dataset.chapterId !== chapterId || !frame.contentWindow) return;
    frame.contentWindow.postMessage({
      type: "mental-health-wellness-module-progress-sync",
      chapterId,
      completion: getChapterComponentState(chapterId),
      focusComponentId
    }, "*");
  }

  function setupChapterProgressBridge() {
    if (chapterProgressCleanup) {
      chapterProgressCleanup();
      chapterProgressCleanup = null;
    }
    const frame = refs.contentBody.querySelector(".chapter-content-frame");
    if (!frame) return;
    const chapterId = frame.dataset.chapterId || "";
    const handleLoad = () => syncChapterProgressFrame(chapterId);
    frame.addEventListener("load", handleLoad);
    if (frame.contentDocument?.readyState === "interactive" || frame.contentDocument?.readyState === "complete") {
      syncChapterProgressFrame(chapterId);
    }
    chapterProgressCleanup = () => frame.removeEventListener("load", handleLoad);
  }

  function renderNav() {
    if (state.tab === "quizzes" && !hasQuizzes()) state.tab = "chapters";
    if (state.tab === "assignments" && !hasAssignments()) state.tab = "chapters";
    refs.body.classList.toggle("sidebar-collapsed", state.sidebarCollapsed && !isMobile());
    refs.body.dataset.section = state.section;
    refs.body.dataset.tab = state.tab;
    refs.body.dataset.view = state.activeId ? "detail" : "overview";
    const hasActiveHomeTab = state.section === "home" && ["chapters", "quizzes", "assignments"].includes(state.tab);
    refs.navHome?.classList.toggle("active", state.section === "home" && !hasActiveHomeTab);
    refs.tabChapters?.classList.toggle("active", state.tab === "chapters");
    if (refs.tabQuizzes) refs.tabQuizzes.hidden = !hasQuizzes();
    if (refs.tabAssignments) refs.tabAssignments.hidden = !hasAssignments();
    refs.tabQuizzes?.classList.toggle("active", state.tab === "quizzes");
    refs.tabAssignments?.classList.toggle("active", state.tab === "assignments");
  }

  function renderProgress() {
    const summary = getProgressSummary();
    refs.courseTitle.textContent = data.course?.title || "Course Shell";
    refs.courseSubtitle.textContent = data.course?.subtitle || "Complete each unit in order and track your progress.";
    refs.sidebarProgressTrack?.setAttribute("aria-valuenow", String(summary.percent));
    if (refs.sidebarProgressFill) refs.sidebarProgressFill.style.width = `${summary.percent}%`;
    refs.progressPercent.textContent = `${summary.percent}%`;
    refs.progressTrack?.setAttribute("aria-valuenow", String(summary.percent));
    if (refs.progressFill) refs.progressFill.style.width = `${summary.percent}%`;
    refs.chapterProgress.textContent = `${summary.unlockedChapters}/${summary.totalChapters}`;
    refs.quizProgress.textContent = `${summary.completedContent}/${summary.totalContent}`;
  }

  function setSection(section) {
    state.section = section;
    if (section === "home") state.tab = "chapters";
    state.activeId = null;
    closeMobileNav();
    render();
  }

  function setTab(tab) {
    if (tab === "quizzes" && !hasQuizzes()) tab = "chapters";
    if (tab === "assignments" && !hasAssignments()) tab = "chapters";
    state.section = "home";
    state.tab = tab;
    state.activeId = null;
    closeMobileNav();
    render();
  }

  function openChapter(id) {
    const chapter = findChapter(id);
    if (!chapter || !isChapterUnlocked(chapter)) return;
    state.section = "home";
    state.tab = "chapters";
    state.activeId = id;
    closeMobileNav();
    render();
  }

  function renderSectionHeader() {
    refs.sectionHeader.hidden = false;
    refs.sectionTitle.textContent = state.activeId ? "Chapter Content" : "Chapters";
    refs.sectionIntro.textContent = state.activeId
      ? "Complete lesson cards in sequence. Your progress is saved in this shell."
      : "Open each Mental Health & Wellness unit and complete the lesson cards in order.";
  }

  function renderHomeCards() {
    if (state.tab === "chapters" && state.activeId) return renderChapterDetail(findChapter(state.activeId));
    return `
      <div class="card-grid">
        ${getVisibleChapters().map((chapter) => {
          const componentCount = Array.isArray(chapter.componentIds) ? chapter.componentIds.length : 0;
          const completedCount = getCompletedComponentCount(chapter.id);
          return `
            <article class="course-card chapter-card editorial-overview-card" style="--accent:${escapeHtml(chapter.accent || "#2f8f6b")}">
              <p class="card-code">${escapeHtml(chapter.code)}</p>
              <h4 class="card-title">${escapeHtml(chapter.title)}</h4>
              <p class="card-summary">${escapeHtml(chapter.summary)}</p>
              <div class="card-actions">
                <button class="btn btn-primary" type="button" data-open-chapter="${escapeHtml(chapter.id)}">Open content</button>
              </div>
              <div class="status-chip">${escapeHtml(`${completedCount}/${componentCount} components complete`)}</div>
            </article>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderChapterDetail(chapter) {
    if (!chapter) {
      return `<div class="empty-state">This chapter could not be loaded.</div>`;
    }
    const componentCount = Array.isArray(chapter.componentIds) ? chapter.componentIds.length : 0;
    const completedCount = getCompletedComponentCount(chapter.id);
    return `
      <article class="detail-card chapter-detail-card chapter-detail-surface" style="--accent:${escapeHtml(chapter.accent || "#2f8f6b")}">
        <div class="detail-stack chapter-detail-layout">
          <div>
            <p class="detail-eyebrow">${escapeHtml(chapter.code)}</p>
            <h4 class="detail-title">${escapeHtml(chapter.title)}</h4>
            <p class="detail-summary">${escapeHtml(chapter.summary)}</p>
            ${componentCount ? `<div class="status-chip">${escapeHtml(`${completedCount}/${componentCount} components complete`)}</div>` : ""}
          </div>
          <div class="detail-actions">
            <button class="btn btn-muted" type="button" data-back-home="chapters">Back to chapters</button>
          </div>
          <div class="chapter-content-shell">
            <iframe
              class="chapter-content-frame"
              src="${escapeHtml(chapter.contentPath)}"
              title="${escapeHtml(`${chapter.code} content`)}"
              loading="lazy"
              data-chapter-id="${escapeHtml(chapter.id)}"
            ></iframe>
          </div>
        </div>
      </article>
    `;
  }

  function renderContent() {
    if (chapterProgressCleanup) {
      chapterProgressCleanup();
      chapterProgressCleanup = null;
    }
    renderSectionHeader();
    refs.contentBody.innerHTML = renderHomeCards();
    bindContentEvents();
    setupChapterProgressBridge();
  }

  function bindContentEvents() {
    refs.contentBody.onclick = (event) => {
      const chapterButton = event.target.closest("[data-open-chapter]");
      if (chapterButton) return void openChapter(chapterButton.dataset.openChapter);
      const backButton = event.target.closest("[data-back-home]");
      if (backButton) return void setTab(backButton.dataset.backHome);
    };
  }

  function render() {
    renderNav();
    renderProgress();
    renderContent();
  }

  refs.menuToggle?.addEventListener("click", toggleNavMode);
  refs.navHome?.addEventListener("click", () => setSection("home"));
  refs.tabChapters?.addEventListener("click", () => setTab("chapters"));
  refs.tabQuizzes?.addEventListener("click", () => setTab("quizzes"));
  refs.tabAssignments?.addEventListener("click", () => setTab("assignments"));

  window.addEventListener("resize", () => {
    setMobileNav(false);
    renderNav();
  });

  window.addEventListener("message", (event) => {
    const payload = event.data;
    if (!payload || typeof payload !== "object") return;
    if (payload.type === "mental-health-wellness-module-progress-ready" && typeof payload.chapterId === "string") {
      syncChapterProgressFrame(payload.chapterId);
      return;
    }
    if (
      payload.type === "mental-health-wellness-module-progress-update"
      && typeof payload.chapterId === "string"
      && typeof payload.componentId === "string"
    ) {
      setModuleComponentComplete(payload.chapterId, payload.componentId, payload.complete !== false);
      syncChapterProgressFrame(payload.chapterId, payload.focusNext ? getNextIncompleteComponentId(payload.chapterId) : "");
      renderNav();
      renderProgress();
      if (state.activeId === payload.chapterId) renderSectionHeader();
    }
  });

  refs.body.classList.toggle("sidebar-collapsed", state.sidebarCollapsed && !isMobile());
  render();
})();