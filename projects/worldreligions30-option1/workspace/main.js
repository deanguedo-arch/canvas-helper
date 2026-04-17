(function () {
  const data = window.WORLD_RELIGIONS_DATA || { course: {}, chapters: [], quizzes: [], assignments: [], library: [] };
  const PROJECT_SLUG = document.body?.dataset.projectSlug || "worldreligions30-option1";
  const STORAGE_KEY = `${PROJECT_SLUG}.progress`;
  const UI_KEY = `${PROJECT_SLUG}.ui`;
  const AUTHORING_UNLOCK_ALL = true;

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
    sectionHeader: document.querySelector(".section-header"),
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
  let assignmentToolbarCleanup = null;
  const ASSIGNMENT_OVERRIDES = {
    1: {
      title: "Religion in Popular Culture",
      summary: "Analyze one media text with religious themes, evaluate the portrayal, and assemble a final report for Chapter 1.",
      interactivePath: "./assignments/chapter1interactive.html",
      interactiveKey: "chapter1interactive"
    },
    2: {
      title: "Local Indigenous Teaching or Symbol",
      summary: "Research one Indigenous teaching, sacred symbol, or ceremonial object and assemble a respectful Chapter 2 report.",
      interactivePath: "./assignments/chapter2interactive.html",
      interactiveKey: "chapter2interactive"
    },
    3: {
      title: "Compare Two Early Religions",
      summary: "Compare any two Chapter 3 traditions, explain one similarity and one difference, and assemble a final comparative report.",
      interactivePath: "./assignments/chapter3interactive.html",
      interactiveKey: "chapter3interactive"
    },
    4: {
      title: "Hindu Deity or Symbol Study",
      summary: "Research one Hindu deity, avatar, or symbol, explain its meaning, and assemble a final Chapter 4 report.",
      interactivePath: "./assignments/chapter4interactive.html",
      interactiveKey: "chapter4interactive"
    },
    5: {
      title: "Buddhist Symbol or Artwork Study",
      summary: "Research one Buddhist symbol, artwork, monument, or meditation object and assemble a final Chapter 5 report.",
      interactivePath: "./assignments/chapter5interactive.html",
      interactiveKey: "chapter5interactive"
    },
    6: {
      title: "Jewish Holy Day or Symbol Study",
      summary: "Research one Jewish holy day, symbol, or ritual object and assemble a final Chapter 6 report.",
      interactivePath: "./assignments/chapter6interactive.html",
      interactiveKey: "chapter6interactive"
    },
    7: {
      title: "Christian Art, Music, or Symbol Study",
      summary: "Research one Christian artwork, hymn, symbol, or monument and assemble a final Chapter 7 report.",
      interactivePath: "./assignments/chapter7interactive.html",
      interactiveKey: "chapter7interactive"
    },
    8: {
      title: "Mosque, Holy Month, or Pilgrimage Study",
      summary: "Research one mosque, Ramadan practice, Eid celebration, or Hajj topic and assemble a final Chapter 8 report.",
      interactivePath: "./assignments/chapter8interactive.html",
      interactiveKey: "chapter8interactive"
    },
    9: {
      title: "Sikh Symbol or Practice Study",
      summary: "Research one Sikh symbol, article of faith, or practice and assemble a final Chapter 9 report.",
      interactivePath: "./assignments/chapter9interactive.html",
      interactiveKey: "chapter9interactive"
    },
    10: {
      title: "Canadian Interfaith Example",
      summary: "Research one Canadian interfaith or multi-faith example and assemble a final Chapter 10 report.",
      interactivePath: "./assignments/chapter10interactive.html",
      interactiveKey: "chapter10interactive"
    }
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

  function getAssignmentToolbarElements() {
    const toolbar = refs.contentBody.querySelector("[data-assignment-toolbar]");
    if (!toolbar) return null;

    return {
      toolbar,
      back: toolbar.querySelector('[data-assignment-action="back"]'),
      reset: toolbar.querySelector('[data-assignment-action="reset"]'),
      previous: toolbar.querySelector('[data-assignment-action="previous"]'),
      generate: toolbar.querySelector('[data-assignment-action="generate"]')
    };
  }

  function getActiveAssignmentFrame() {
    return refs.contentBody.querySelector("[data-assignment-frame-key]");
  }

  function getEmbeddedAssignmentControls(frame = getActiveAssignmentFrame()) {
    const doc = frame?.contentDocument;
    if (!doc) return null;

    return {
      doc,
      reset: doc.getElementById("reset-work"),
      previous: doc.getElementById("prev-step"),
      generate: doc.getElementById("generate-report")
    };
  }

  function syncAssignmentToolbar() {
    const toolbar = getAssignmentToolbarElements();
    if (!toolbar) return;

    const controls = getEmbeddedAssignmentControls();
    const ready = !!controls?.reset && !!controls?.previous && !!controls?.generate;

    if (toolbar.reset) {
      toolbar.reset.disabled = !ready;
    }

    if (toolbar.previous) {
      toolbar.previous.disabled = !ready || !!controls.previous.disabled;
    }

    if (toolbar.generate) {
      toolbar.generate.disabled = !ready || !!controls.generate.disabled;
      toolbar.generate.textContent = ready ? cleanText(controls.generate.textContent || "Proceed") : "Proceed";
      toolbar.generate.dataset.mode = ready ? (controls.generate.dataset.mode || "") : "";
      toolbar.generate.classList.toggle("is-ready", toolbar.generate.dataset.mode === "print");
    }
  }

  function queueAssignmentToolbarSync() {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        syncAssignmentToolbar();
      });
    });
  }

  function runAssignmentToolbarAction(action) {
    if (action === "back") {
      setTab("assignments");
      return;
    }

    const controls = getEmbeddedAssignmentControls();
    if (!controls) return;

    const target = action === "reset"
      ? controls.reset
      : action === "previous"
        ? controls.previous
        : action === "generate"
          ? controls.generate
          : null;

    target?.click();
    queueAssignmentToolbarSync();
  }

  function setupAssignmentToolbarBridge() {
    if (assignmentToolbarCleanup) {
      assignmentToolbarCleanup();
      assignmentToolbarCleanup = null;
    }

    const toolbar = getAssignmentToolbarElements();
    const frame = getActiveAssignmentFrame();
    if (!toolbar || !frame) return;

    let observedDoc = null;
    let observer = null;

    const syncFromFrame = () => queueAssignmentToolbarSync();

    const detach = () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }

      if (observedDoc) {
        observedDoc.removeEventListener("click", syncFromFrame, true);
        observedDoc.removeEventListener("input", syncFromFrame, true);
      }

      observedDoc = null;
    };

    const attach = () => {
      detach();

      const controls = getEmbeddedAssignmentControls(frame);
      if (!controls?.doc?.body) {
        queueAssignmentToolbarSync();
        return;
      }

      observedDoc = controls.doc;
      observedDoc.addEventListener("click", syncFromFrame, true);
      observedDoc.addEventListener("input", syncFromFrame, true);

      observer = new MutationObserver(syncFromFrame);
      observer.observe(observedDoc.body, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true
      });

      queueAssignmentToolbarSync();
    };

    const handleLoad = () => attach();

    frame.addEventListener("load", handleLoad);
    if (frame.contentDocument?.readyState === "interactive" || frame.contentDocument?.readyState === "complete") {
      attach();
    } else {
      queueAssignmentToolbarSync();
    }

    assignmentToolbarCleanup = () => {
      frame.removeEventListener("load", handleLoad);
      detach();
    };
  }

  function cleanText(value) {
    return String(value ?? "")
      .replace(/[�]/g, "-")
      .replace(/[–—]/g, "-");
  }

  function escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
    const existing = state.progress.quizWork[id] || {};
    const normalized = {
      mc: existing.mc && typeof existing.mc === "object" ? existing.mc : {},
      matching: existing.matching && typeof existing.matching === "object" ? existing.matching : {},
      tf: existing.tf && typeof existing.tf === "object" ? existing.tf : {},
      written: existing.written && typeof existing.written === "object" ? existing.written : {},
      choice: existing.choice && typeof existing.choice === "object" ? existing.choice : {}
    };
    const changed = !state.progress.quizWork[id]
      || normalized.mc !== existing.mc
      || normalized.matching !== existing.matching
      || normalized.tf !== existing.tf
      || normalized.written !== existing.written
      || normalized.choice !== existing.choice;

    if (changed) {
      state.progress.quizWork[id] = normalized;
      saveProgress();
    }

    return state.progress.quizWork[id];
  }

  function getPromptText(item) {
    return item?.prompt || item?.question || item?.text || "";
  }

  function stripPromptNumber(text, explicitNumber = "") {
    const raw = cleanText(text).trim();
    if (!raw) return "";

    if (explicitNumber !== "" && explicitNumber !== null && explicitNumber !== undefined) {
      const explicitPattern = new RegExp(`^\\s*${escapeRegExp(String(explicitNumber).trim())}[.)-]?\\s*`);
      return raw.replace(explicitPattern, "").trim();
    }

    return raw.replace(/^\s*\d+[.)-]?\s*/, "").trim();
  }

  function formatPromptLabel(item, fallbackNumber = "") {
    const prompt = getPromptText(item);
    const number = item?.number ?? fallbackNumber;
    const cleanedPrompt = stripPromptNumber(prompt, number);
    if (number === "" || number === null || number === undefined) {
      return cleanedPrompt || cleanText(prompt);
    }
    return `${number}. ${cleanedPrompt || cleanText(prompt)}`;
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
    return (data.chapters || []).map((chapter) => {
      const override = ASSIGNMENT_OVERRIDES[chapter.number] || {};
      return {
        id: `assignment-${chapter.number}`,
        chapterId: chapter.id,
        code: `Assignment ${chapter.number}`,
        number: chapter.number,
        title: override.title || chapter.title,
        accent: chapter.accent,
        summary: override.summary || "Assignment content has not been authored yet. This lane stays ready for future chapter work.",
        interactivePath: override.interactivePath || "",
        interactiveKey: override.interactiveKey || ""
      };
    });
  }

  function findAssignment(id) {
    return getAssignments().find((item) => item.id === id) || null;
  }

  function getLibraryItems() {
    if ((data.library || []).length) {
      return data.library.map((item) => ({
        ...item,
        chapterId: item.chapterId || `chapter-${item.number}`
      }));
    }

    return (data.chapters || []).map((chapter) => ({
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
    if (AUTHORING_UNLOCK_ALL) return true;
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

  function hasRecordedQuizAnswer(value) {
    return cleanText(value).trim().length > 0;
  }

  function countAnsweredQuizItems(items, getValue) {
    return (items || []).reduce((count, item, index) => (
      hasRecordedQuizAnswer(getValue(item, index)) ? count + 1 : count
    ), 0);
  }

  function computeQuizCompletionSummary(quiz) {
    const work = getQuizWork(quiz.id);
    const multipleChoice = resolveMultipleChoiceItems(quiz);
    const trueFalse = quiz.trueFalse || [];
    const matching = resolveMatchingData(quiz).items;
    const written = quiz.writtenResponse || [];

    const multipleChoiceAnswered = countAnsweredQuizItems(multipleChoice, (item) => work.mc[item.number]);
    const trueFalseAnswered = countAnsweredQuizItems(trueFalse, (item) => work.tf[item.number]);
    const matchingAnswered = countAnsweredQuizItems(matching, (item) => work.matching[item.number]);
    const writtenAnswered = countAnsweredQuizItems(written, (item, index) => work.written[item.number || index + 1]);
    const objectiveTotal = multipleChoice.length + trueFalse.length + matching.length;
    const answeredQuestions = multipleChoiceAnswered + trueFalseAnswered + matchingAnswered + writtenAnswered;
    const totalQuestions = objectiveTotal + written.length;

    return {
      multipleChoiceAnswered,
      multipleChoiceTotal: multipleChoice.length,
      trueFalseAnswered,
      trueFalseTotal: trueFalse.length,
      matchingAnswered,
      matchingTotal: matching.length,
      writtenAnswered,
      writtenTotal: written.length,
      objectiveAnswered: multipleChoiceAnswered + trueFalseAnswered + matchingAnswered,
      objectiveTotal,
      answeredQuestions,
      totalQuestions,
      remainingQuestions: Math.max(totalQuestions - answeredQuestions, 0)
    };
  }

  function formatQuestionRange(start, count) {
    if (!count) return "No questions";
    const end = start + count - 1;
    return `Questions ${start}${end > start ? `-${end}` : ""}`;
  }

  function computeQuizSectionBreakdown(quiz) {
    const completion = computeQuizCompletionSummary(quiz);
    let cursor = 1;

    const multipleChoiceSection = {
      key: "mc",
      title: "Multiple Choice",
      range: formatQuestionRange(cursor, completion.multipleChoiceTotal),
      score: `${completion.multipleChoiceAnswered}/${completion.multipleChoiceTotal}`
    };
    cursor += completion.multipleChoiceTotal;

    const trueFalseSection = {
      key: "tf",
      title: "True / False",
      range: formatQuestionRange(cursor, completion.trueFalseTotal),
      score: `${completion.trueFalseAnswered}/${completion.trueFalseTotal}`
    };
    cursor += completion.trueFalseTotal;

    const matchingSection = {
      key: "matching",
      title: "Term Matching",
      range: formatQuestionRange(cursor, completion.matchingTotal),
      score: `${completion.matchingAnswered}/${completion.matchingTotal}`
    };
    cursor += completion.matchingTotal;

    const writtenSection = {
      key: "written",
      title: "Short Answer",
      range: formatQuestionRange(cursor, completion.writtenTotal),
      score: `${completion.writtenAnswered}/${completion.writtenTotal}`
    };

    return [multipleChoiceSection, trueFalseSection, matchingSection, writtenSection];
  }

  function getQuizCompletionStatus(summary) {
    return summary.writtenTotal
      ? `${summary.answeredQuestions} questions completed · written responses reviewed manually`
      : `${summary.answeredQuestions} questions completed`;
  }

  function syncVisibleQuizCompletion(quizId) {
    if (state.section !== "home" || state.tab !== "quizzes" || state.activeId !== quizId) return;
    const quiz = findQuiz(quizId);
    if (!quiz) return;

    const summary = computeQuizCompletionSummary(quiz);
    const earnedNode = refs.contentBody.querySelector("[data-quiz-completion-earned]");
    const totalNode = refs.contentBody.querySelector("[data-quiz-completion-total]");
    const statusNode = refs.contentBody.querySelector("[data-quiz-completion-status]");

    if (earnedNode) earnedNode.textContent = String(summary.answeredQuestions);
    if (totalNode) totalNode.textContent = `/${summary.totalQuestions}`;
    if (statusNode) statusNode.textContent = getQuizCompletionStatus(summary);

    computeQuizSectionBreakdown(quiz).forEach((item) => {
      const scoreNode = refs.contentBody.querySelector(`[data-breakdown-score-for="${item.key}"]`);
      if (scoreNode) scoreNode.textContent = item.score;
    });
  }

  function normalizeMultipleChoiceOption(option, index) {
    if (typeof option === "string") {
      return {
        label: String.fromCharCode(65 + index),
        text: option
      };
    }

    return {
      label: String(option?.label || String.fromCharCode(65 + index)),
      text: option?.text || option?.value || option?.prompt || option?.answer || ""
    };
  }

  function splitInlineMultipleChoice(prompt) {
    const rawPrompt = cleanText(prompt).trim();
    const firstOptionIndex = rawPrompt.search(/A\.\s*/);
    if (firstOptionIndex < 0) {
      return { questionStem: rawPrompt, options: [] };
    }

    const questionStem = rawPrompt.slice(0, firstOptionIndex).trim();
    const optionSource = rawPrompt.slice(firstOptionIndex);
    const options = Array.from(optionSource.matchAll(/([A-D])\.\s*([\s\S]*?)(?=(?:[A-D]\.\s*)|$)/g)).map((match) => ({
      label: match[1],
      text: match[2].trim()
    }));

    return { questionStem, options };
  }

  function resolveMultipleChoiceOptions(item) {
    const explicitOptions = Array.isArray(item?.options) ? item.options.filter(Boolean).map((option, index) => normalizeMultipleChoiceOption(option, index)) : [];
    if (explicitOptions.length) return explicitOptions;
    return splitInlineMultipleChoice(item?.prompt || item?.question || item?.text || "").options;
  }

  function resolveMultipleChoiceItems(quiz) {
    return (quiz?.multipleChoice || []).map((item, index) => {
      const rawPrompt = item?.prompt || item?.question || item?.text || "";
      const inline = splitInlineMultipleChoice(rawPrompt);
      const promptSource = inline.questionStem || rawPrompt;
      const prompt = stripPromptNumber(promptSource, item?.number ?? index + 1);
      const options = resolveMultipleChoiceOptions(item);

      return {
        ...item,
        prompt,
        options
      };
    });
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
    state.progress.quizWork[id] = { mc: {}, matching: {}, tf: {}, written: {}, choice: {} };
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
    syncVisibleQuizCompletion(quizId);
  }

  function setTfAnswer(quizId, questionNumber, answer) {
    const work = getQuizWork(quizId);
    work.tf[questionNumber] = answer;
    saveProgress();
    renderContent();
  }

  function setWrittenAnswer(quizId, questionNumber, value) {
    const work = getQuizWork(quizId);
    work.written[questionNumber] = value;
    saveProgress();
    syncVisibleQuizCompletion(quizId);
  }

  function checkAnswers(id) {
    if (!state.progress.quizComplete[id]) return;
    state.checkedResults[id] = true;
    saveProgress();
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
    const hideSectionHeader = state.section === "home" && state.tab === "quizzes" && !!state.activeId;
    refs.sectionHeader?.toggleAttribute("hidden", hideSectionHeader);
    if (hideSectionHeader) return;

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
      refs.sectionIntro.textContent = "Open a chapter assignment to review the instructions, complete the interactive steps, and generate a printable final folio.";
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
            const completionSummary = computeQuizCompletionSummary(quiz);
            const nextChapter = findChapter(`chapter-${quiz.number + 1}`);
            return `
              <article class="course-card quiz-overview-card ${unlocked ? "" : "locked-card"}" style="--accent:${escapeHtml(quiz.accent || "#8b6728")}">
                <p class="card-code">${escapeHtml(quiz.code)}</p>
                <h4 class="card-title">${escapeHtml(quiz.title)}</h4>
                <p class="card-summary">Recreated chapter booklet with objective sections, written prompts, and keyed guidance.</p>
                <p class="card-meta">
                  <span><strong>${completionSummary.answeredQuestions}/${completionSummary.totalQuestions}</strong> questions completed</span>
                  <span>Written responses reviewed manually</span>
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
                  <button class="btn btn-muted" type="button" data-open-assignment="${escapeHtml(assignment.id)}" ${unlocked ? "" : "disabled"}>${assignment.interactivePath ? "Open assignment" : "Open placeholder"}</button>
                </div>
                ${!unlocked ? `<div class="status-chip locked">Locked until the previous chapter quiz is complete</div>` : assignment.interactivePath ? `<div class="status-chip">Ready</div>` : ""}
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
                <button class="btn btn-secondary" type="button" data-open-expanded-viewer="${escapeHtml(getLibraryIdForChapter(chapter.id))}" ${unlocked ? "" : "disabled"}>Open PDF</button>
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
            <button class="btn btn-primary" type="button" data-open-expanded-viewer="${escapeHtml(getLibraryIdForChapter(chapter.id))}">Open chapter PDF</button>
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

    if (assignment.interactivePath) {
      return `
        <article class="detail-card assignment-detail-card" style="--accent:${escapeHtml(assignment.accent || "#8b6728")}">
          <div class="detail-stack">
            <div>
              <p class="detail-eyebrow">${escapeHtml(assignment.code)}</p>
              <h4 class="detail-title">${escapeHtml(assignment.title)}</h4>
            </div>
            <div class="assignment-instructions-shell">
              <section class="assignment-instructions" aria-label="Assignment instructions">
                <p class="detail-eyebrow">Assignment instructions</p>
                <p class="assignment-instructions-copy">${escapeHtml(assignment.summary)}</p>
              </section>
              <div class="assignment-toolbar" data-assignment-toolbar>
                <div class="assignment-toolbar-primary">
                  <button class="btn btn-muted" type="button" data-assignment-action="back">Back to assignments</button>
                </div>
                <div class="assignment-toolbar-actions">
                  <button class="btn btn-muted" type="button" data-assignment-action="reset" disabled>Reset work</button>
                  <button class="btn btn-muted" type="button" data-assignment-action="previous" disabled>Previous</button>
                  <button class="btn btn-primary assignment-toolbar-generate" type="button" data-assignment-action="generate" disabled>Proceed</button>
                </div>
              </div>
            </div>
            <div class="assignment-runtime-shell">
              <iframe
                class="assignment-frame"
                src="${escapeHtml(assignment.interactivePath)}"
                title="${escapeHtml(assignment.title)}"
                loading="lazy"
                data-assignment-frame-key="${escapeHtml(assignment.interactiveKey || assignment.id)}"
              ></iframe>
            </div>
          </div>
        </article>
      `;
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
            <button class="btn btn-primary" type="button" data-open-expanded-viewer="${escapeHtml(getLibraryIdForChapter(assignment.chapterId))}">Open chapter PDF</button>
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
    const items = resolveMultipleChoiceItems(quiz);
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

  function renderWritten(quiz, work, showResults) {
    const items = quiz.writtenResponse || [];
    if (!items.length) return `<div class="empty-state">No written-response prompts were found for this chapter.</div>`;

    return `
      <div class="written-stack">
        ${items.map((item, index) => {
          const promptNumber = item.number || index + 1;
          const fieldId = `${quiz.id}-written-${promptNumber}`;
          const response = work.written[promptNumber] || "";

          return `
          <article class="written-card ${showResults ? "show-results" : ""}">
            <h5>${escapeHtml(formatPromptLabel(item, index + 1))}</h5>
            <label class="response-label" for="${escapeHtml(fieldId)}">Your response</label>
            <textarea class="text-input response-input" id="${escapeHtml(fieldId)}" data-written-quiz-id="${escapeHtml(quiz.id)}" data-written-question="${escapeHtml(String(promptNumber))}" placeholder="Write your response here...">${escapeHtml(response)}</textarea>
            <div class="written-key"><strong>Teacher guidance:</strong> ${escapeHtml(item.teacherKey || item.answer || "Keyed response not provided in the teacher copy.")}</div>
          </article>
        `;
        }).join("")}
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
        return "Written-response prompts stay intact. These answers are recorded for manual review even after objective answers are checked.";
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
    const completionSummary = computeQuizCompletionSummary(quiz);
    const sections = computeQuizSectionBreakdown(quiz);
    const section = ["matching", "tf", "written"].includes(state.quizSection) ? state.quizSection : "mc";
    if (state.quizSection !== section) {
      state.quizSection = section;
    }

    let sectionHtml = "";
    if (section === "matching") {
      sectionHtml = renderMatching(quiz, work, showResults);
    } else if (section === "tf") {
      sectionHtml = renderTrueFalse(quiz, work, showResults);
    } else if (section === "written") {
      sectionHtml = renderWritten(quiz, work, showResults);
    } else {
      sectionHtml = renderMultipleChoice(quiz, work, showResults);
    }

    return `
      <article class="quiz-shell quiz-detail-card quiz-detail-surface" style="--accent:${escapeHtml(quiz.accent || "#8b6728")}">
        <div class="quiz-stack quiz-detail-layout">
          <div class="quiz-header">
            <div class="quiz-copy">
              <p class="detail-eyebrow">World Religions Course · Assessment</p>
              <h4 class="quiz-page-title">${escapeHtml(`${quiz.code}: ${quiz.title}`)}</h4>
            </div>
            <div class="quiz-meta-row">
              <div class="quiz-meta-block">
                <span class="metric-label">Status</span>
                <strong>${complete ? "Quiz complete" : "In progress"}</strong>
              </div>
              <div class="quiz-meta-block">
                <span class="metric-label">Submitted</span>
                <strong>${escapeHtml(complete && completedAt ? completedAt : "Not yet submitted")}</strong>
              </div>
            </div>
          </div>

          <div class="quiz-evaluation-panel">
            <div class="quiz-evaluation-copy">
              <h5>Final Evaluation</h5>
              <p>This counter tracks completed questions only. Marks are handled separately, and written responses are reviewed manually.</p>
            </div>
            <div class="quiz-evaluation-score">
              <strong><span class="quiz-evaluation-earned" data-quiz-completion-earned>${completionSummary.answeredQuestions}</span><small data-quiz-completion-total>/${completionSummary.totalQuestions}</small></strong>
              <span class="quiz-evaluation-status" data-quiz-completion-status>${escapeHtml(getQuizCompletionStatus(completionSummary))}</span>
            </div>
          </div>

          <div class="quiz-actions quiz-actions-row">
            ${complete ? "" : `<button class="btn btn-primary" type="button" data-mark-quiz-complete="${escapeHtml(quiz.id)}">Mark complete</button>`}
            <button class="btn btn-secondary" type="button" data-check-answers="${escapeHtml(quiz.id)}" ${complete ? "" : "disabled"}>Check answers</button>
            <button class="btn btn-muted" type="button" data-generate-quiz-results="${escapeHtml(quiz.id)}" ${complete ? "" : "disabled"}>Generate Results</button>
            <button class="btn btn-muted" type="button" data-retake-quiz="${escapeHtml(quiz.id)}">Retake Quiz</button>
            <button class="btn quiz-back-link" type="button" data-back-home="quizzes">Back to quizzes <span aria-hidden="true">→</span></button>
          </div>

          <section class="quiz-breakdown-shell">
            <h5 class="quiz-breakdown-title">Section Breakdown</h5>
            <div class="quiz-section-breakdown">
              ${sections.map((item) => `
                <button class="quiz-breakdown-item ${section === item.key ? "active" : ""}" type="button" data-quiz-section="${escapeHtml(item.key)}">
                  <span class="quiz-breakdown-copy">
                    <span class="quiz-breakdown-name">${escapeHtml(item.title)}</span>
                    <span class="quiz-breakdown-range">${escapeHtml(item.range)}</span>
                  </span>
                  <span class="quiz-breakdown-score" data-breakdown-score-for="${escapeHtml(item.key)}">${escapeHtml(item.score)}</span>
                </button>
              `).join("")}
            </div>
          </section>

          <div class="quiz-section-content">
            ${sectionHtml}
          </div>
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
            <div class="guidance-label">Learner response</div>
            <div class="guidance-body">${escapeHtml(row.response || "No response captured.")}</div>
            <div class="guidance-label">Teacher guidance</div>
            <div class="guidance-body">${escapeHtml(row.guidance || "No keyed guidance provided.")}</div>
          </article>
        `).join("")
      : `<div class="report-empty">No written-response guidance was keyed for this quiz.</div>`;

    return `
      <section class="report-section">
        <div class="section-heading">
          <h2>Teacher guidance</h2>
          <p>Written-response guidance pulled from the keyed chapter booklet.</p>
        </div>
        <div class="teacher-guidance-grid">
          ${cards}
        </div>
      </section>
    `;
  }

  function buildQuizResultsHtml({ quiz, completionSummary, completedAt, generatedAt, mcRows, matchingRows, tfRows, guidanceRows }) {
    const courseTitle = data.course?.title || "World Religions 30";
    const objectiveRows = [...mcRows, ...matchingRows, ...tfRows];
    const correctCount = objectiveRows.filter((row) => row.result === "Correct").length;
    const writtenAnswered = guidanceRows.filter((row) => hasRecordedQuizAnswer(row.response)).length;

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
        <div class="summary-label">Completed questions</div>
        <div class="summary-value">${escapeHtml(`${completionSummary.answeredQuestions}/${completionSummary.totalQuestions}`)}</div>
        <div class="summary-note">This report tracks recorded answers. Written responses still require manual review.</div>
      </article>
      <article class="summary-card">
        <div class="summary-label">Objective correct</div>
        <div class="summary-value">${escapeHtml(String(correctCount))}</div>
        <div class="summary-note">Keyed correct answers across multiple choice, matching, and true / false.</div>
      </article>
      <article class="summary-card">
        <div class="summary-label">Remaining blank</div>
        <div class="summary-value">${escapeHtml(String(completionSummary.remainingQuestions))}</div>
        <div class="summary-note">Questions left unanswered when the report was generated.</div>
      </article>
      <article class="summary-card">
        <div class="summary-label">Written responses entered</div>
        <div class="summary-value">${escapeHtml(String(writtenAnswered))}</div>
        <div class="summary-note">Written prompts with a recorded response ready for teacher review.</div>
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
    const completionSummary = computeQuizCompletionSummary(quiz);
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
    const guidanceRows = (quiz.writtenResponse || []).map((item, index) => {
      const promptNumber = item.number || index + 1;
      return {
        prompt: formatPromptLabel(item, index + 1),
        response: work.written[promptNumber] || "",
        guidance: item.teacherKey || item.answer || ""
      };
    });
    const reportHtml = buildQuizResultsHtml({
      quiz,
      completionSummary,
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
    if (assignmentToolbarCleanup) {
      assignmentToolbarCleanup();
      assignmentToolbarCleanup = null;
    }

    renderSectionHeader();
    refs.contentBody.innerHTML = state.section === "library" ? renderLibrary() : renderHomeCards();
    bindContentEvents();
    setupAssignmentToolbarBridge();
  }

  function bindContentEvents() {
    refs.contentBody.onclick = (event) => {
      const assignmentActionButton = event.target.closest("[data-assignment-action]");
      if (assignmentActionButton) return void runAssignmentToolbarAction(assignmentActionButton.dataset.assignmentAction);

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

    refs.contentBody.oninput = (event) => {
      const writtenInput = event.target.closest("[data-written-question]");
      if (writtenInput) return void setWrittenAnswer(writtenInput.dataset.writtenQuizId, writtenInput.dataset.writtenQuestion, writtenInput.value);
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
  window.addEventListener("message", (event) => {
    const payload = event.data;
    if (!payload || payload.type !== "wr30-assignment-height" || typeof payload.key !== "string" || !Number.isFinite(payload.height)) return;
    const frame = Array.from(document.querySelectorAll("[data-assignment-frame-key]")).find((node) => node.dataset.assignmentFrameKey === payload.key);
    if (!frame) return;
    frame.style.height = `${Math.max(980, Math.ceil(payload.height) + 8)}px`;
  });

  refs.body.classList.toggle("sidebar-collapsed", state.sidebarCollapsed && !isMobile());
  render();
})();

