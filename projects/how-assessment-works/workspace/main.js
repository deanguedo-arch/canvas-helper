(function () {
  "use strict";

  const STORAGE_KEY = "canvas-helper:how-assessment-works:state:v1";
  const SCHEMA_VERSION = 1;
  const CHOICES = new Set(["product", "process", "defence"]);
  const STEP_IDS = new Set(["journey", "pillars", "evidence", "readiness", "before-submit"]);
  const CHECKLIST_KEYS = ["criteria", "process", "defence", "support"];
  const WEIGHT_KEYS = ["product", "process", "defence"];
  const WEIGHT_LIMITS = {
    product: 100,
    process: 25,
    defence: 100
  };
  const DEFAULT_WEIGHTS = {
    product: 50,
    process: 25,
    defence: 25
  };
  const VIDEO_SOURCES = {
    inspire: "./assets/media/inspire-the-work.mp4",
    checkin: "./assets/media/the-process-check-in.mp4"
  };

  const PILLAR_CONTENT = {
    product: {
      title: "Product",
      description:
        "Your final response, performance, project, exam, or other result demonstrates the learning outcome.",
      examples: [
        "Final written response or exam",
        "Presentation, demonstration, or performance",
        "Completed project or solution"
      ]
    },
    process: {
      title: "Process",
      description:
        "Your planning, decisions, practice, feedback, and revisions show how the finished work developed.",
      examples: [
        "Notes, plans, and outlines",
        "Drafts, practice attempts, and version history",
        "Feedback and a record of the changes you made"
      ]
    },
    defence: {
      title: "Defence",
      description:
        "You explain important choices, demonstrate understanding, and apply the learning without relying only on the finished product.",
      examples: [
        "A short conversation with your teacher",
        "A written or recorded explanation",
        "A new example, question, or skill check"
      ]
    }
  };

  const EVIDENCE_KEY = {
    "final-response": "product",
    "planning-notes": "process",
    "revision-note": "process",
    "choice-explanation": "defence",
    "finished-presentation": "product",
    "new-application": "defence"
  };

  const EVIDENCE_GUIDANCE = {
    "final-response": "The finished response is the Product.",
    "planning-notes": "Planning notes show the Process used to develop the work.",
    "revision-note": "A revision note shows how feedback shaped the Process.",
    "choice-explanation": "Explaining a choice is part of Defence.",
    "finished-presentation": "The completed presentation is the Product.",
    "new-application": "Applying learning in a new situation is part of Defence."
  };

  const READINESS_KEY = {
    "practice-gap": "targeted-practice",
    "teacher-checkin": "explain-choice"
  };
  const READINESS_CHOICES = new Set([
    "submit-now",
    "targeted-practice",
    "skip-evidence",
    "repeat-product",
    "explain-choice",
    "decline-checkin"
  ]);

  const READINESS_GUIDANCE = {
    "practice-gap":
      "Not ready yet means address the specific gap, get support, and check again before the major task.",
    "teacher-checkin":
      "A strong Defence connects the finished work to your decisions, evidence, and understanding."
  };

  function createDefaultState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      theme: "light",
      lastStep: "journey",
      selectedPillar: "product",
      marks: {
        product: 80,
        process: 80,
        defence: 80
      },
      weights: { ...DEFAULT_WEIGHTS },
      evidenceAnswers: {},
      evidenceCompleted: false,
      readinessAnswers: {},
      readinessCompleted: false,
      checklist: {
        criteria: false,
        process: false,
        defence: false,
        support: false
      },
      completedAt: null
    };
  }

  function clampMark(value, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return fallback;
    }
    return Math.min(100, Math.max(0, Math.round(number)));
  }

  function clampWeight(value, key, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return fallback;
    }
    return Math.min(WEIGHT_LIMITS[key], Math.max(0, Math.round(number)));
  }

  function distributeWeightPair(firstKey, secondKey, remaining, previousWeights) {
    const firstPrevious = Math.max(0, Number(previousWeights[firstKey]) || 0);
    const secondPrevious = Math.max(0, Number(previousWeights[secondKey]) || 0);
    const previousTotal = firstPrevious + secondPrevious;
    let first =
      previousTotal > 0
        ? Math.round((remaining * firstPrevious) / previousTotal)
        : Math.floor(remaining / 2);
    let second = remaining - first;

    if (first > WEIGHT_LIMITS[firstKey]) {
      first = WEIGHT_LIMITS[firstKey];
      second = remaining - first;
    }
    if (second > WEIGHT_LIMITS[secondKey]) {
      second = WEIGHT_LIMITS[secondKey];
      first = remaining - second;
    }

    return {
      [firstKey]: first,
      [secondKey]: second
    };
  }

  function rebalanceWeights(activeKey, requestedValue, previousWeights) {
    if (!WEIGHT_KEYS.includes(activeKey)) {
      return { ...DEFAULT_WEIGHTS };
    }
    const activeWeight = clampWeight(
      requestedValue,
      activeKey,
      previousWeights[activeKey] ?? DEFAULT_WEIGHTS[activeKey]
    );
    const otherKeys = WEIGHT_KEYS.filter((key) => key !== activeKey);
    return {
      ...distributeWeightPair(
        otherKeys[0],
        otherKeys[1],
        100 - activeWeight,
        previousWeights
      ),
      [activeKey]: activeWeight
    };
  }

  function normalizeWeights(value) {
    const requested = {
      product: clampWeight(value?.product, "product", DEFAULT_WEIGHTS.product),
      process: clampWeight(value?.process, "process", DEFAULT_WEIGHTS.process),
      defence: clampWeight(value?.defence, "defence", DEFAULT_WEIGHTS.defence)
    };
    return {
      ...distributeWeightPair(
        "product",
        "defence",
        100 - requested.process,
        requested
      ),
      process: requested.process
    };
  }

  function normalizeAnswers(value, allowedKeys, allowedValues) {
    const answers = {};
    if (!value || typeof value !== "object") {
      return answers;
    }

    for (const key of allowedKeys) {
      const answer = value[key];
      if (typeof answer === "string" && allowedValues.has(answer)) {
        answers[key] = answer;
      }
    }
    return answers;
  }

  function normalizeState(value) {
    const state = createDefaultState();
    if (!value || typeof value !== "object") {
      return state;
    }
    const storedCompletedAt =
      typeof value.completedAt === "string" && value.completedAt ? value.completedAt : null;

    state.theme = value.theme === "dark" ? "dark" : "light";
    state.lastStep = STEP_IDS.has(value.lastStep) ? value.lastStep : state.lastStep;
    state.selectedPillar = Object.hasOwn(PILLAR_CONTENT, value.selectedPillar)
      ? value.selectedPillar
      : state.selectedPillar;
    state.marks = {
      product: clampMark(value.marks?.product, state.marks.product),
      process: clampMark(value.marks?.process, state.marks.process),
      defence: clampMark(value.marks?.defence, state.marks.defence)
    };
    state.weights = normalizeWeights(value.weights);
    state.evidenceAnswers = normalizeAnswers(
      value.evidenceAnswers,
      Object.keys(EVIDENCE_KEY),
      CHOICES
    );
    state.evidenceCompleted =
      Boolean(storedCompletedAt) ||
      (value.evidenceCompleted === true &&
        Object.entries(EVIDENCE_KEY).every(
          ([key, answer]) => state.evidenceAnswers[key] === answer
        ));
    state.readinessAnswers = normalizeAnswers(
      value.readinessAnswers,
      Object.keys(READINESS_KEY),
      READINESS_CHOICES
    );
    state.readinessCompleted =
      Boolean(storedCompletedAt) ||
      (value.readinessCompleted === true &&
        Object.entries(READINESS_KEY).every(
          ([key, answer]) => state.readinessAnswers[key] === answer
        ));

    for (const key of CHECKLIST_KEYS) {
      state.checklist[key] = Boolean(storedCompletedAt) || value.checklist?.[key] === true;
    }

    state.completedAt = storedCompletedAt;
    return state;
  }

  function loadState() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? normalizeState(JSON.parse(stored)) : createDefaultState();
    } catch (_error) {
      return createDefaultState();
    }
  }

  let state = loadState();

  function hydrateLocalVideos() {
    document.querySelectorAll("[data-video-source]").forEach((video) => {
      const source = VIDEO_SOURCES[video.dataset.videoSource];
      if (video instanceof HTMLVideoElement && source) {
        video.src = source;
      }
    });
  }

  const elements = {
    html: document.documentElement,
    body: document.body,
    progress: document.getElementById("unit-progress"),
    progressLabel: document.getElementById("progress-label"),
    themeToggle: document.getElementById("theme-toggle"),
    focusToggle: document.getElementById("focus-toggle"),
    focusExit: document.getElementById("focus-exit"),
    saveExit: document.getElementById("save-exit"),
    saveStatus: document.getElementById("save-status"),
    resumePanel: document.getElementById("resume-panel"),
    resumeButton: document.getElementById("resume-button"),
    pillarDetailTitle: document.getElementById("pillar-detail-title"),
    pillarDetailDescription: document.getElementById("pillar-detail-description"),
    pillarDetailExamples: document.getElementById("pillar-detail-examples"),
    markForm: document.getElementById("mark-form"),
    productMark: document.getElementById("product-mark"),
    processMark: document.getElementById("process-mark"),
    defenceMark: document.getElementById("defence-mark"),
    productWeight: document.getElementById("product-weight"),
    processWeight: document.getElementById("process-weight"),
    defenceWeight: document.getElementById("defence-weight"),
    productWeightValue: document.getElementById("product-weight-value"),
    processWeightValue: document.getElementById("process-weight-value"),
    defenceWeightValue: document.getElementById("defence-weight-value"),
    weightStatus: document.getElementById("weight-status"),
    resetMarks: document.getElementById("reset-marks"),
    overallMark: document.getElementById("overall-mark"),
    scoreBar: document.getElementById("score-bar"),
    productContribution: document.getElementById("product-contribution"),
    processContribution: document.getElementById("process-contribution"),
    defenceContribution: document.getElementById("defence-contribution"),
    productPoints: document.getElementById("product-points"),
    processPoints: document.getElementById("process-points"),
    defencePoints: document.getElementById("defence-points"),
    evidenceForm: document.getElementById("evidence-activity"),
    evidenceStatus: document.getElementById("evidence-status"),
    readinessForm: document.getElementById("readiness-scenario"),
    readinessStatus: document.getElementById("readiness-status"),
    completionForm: document.getElementById("completion-checklist"),
    finishUnit: document.getElementById("finish-unit"),
    completionStatus: document.getElementById("completion-status")
  };

  function persistState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_error) {
      elements.completionStatus.textContent =
        "This browser could not save progress. Keep this page open and tell your teacher.";
      elements.completionStatus.classList.add("needs-retry");
    }
  }

  function setLastStep(step) {
    if (!STEP_IDS.has(step) || state.lastStep === step) {
      return;
    }
    state.lastStep = step;
    persistState();
  }

  function checklistIsComplete() {
    return CHECKLIST_KEYS.every((key) => state.checklist[key]);
  }

  function completionGatesAreComplete() {
    return state.evidenceCompleted && state.readinessCompleted && checklistIsComplete();
  }

  function completedGateCount() {
    return (
      Number(state.evidenceCompleted) +
      Number(state.readinessCompleted) +
      Number(checklistIsComplete())
    );
  }

  function updateProgress() {
    const count = completedGateCount();
    elements.progress.value = count;
    elements.progress.textContent = `${count} of 3`;
    elements.progressLabel.textContent = `${count} of 3 ${
      count === 1 ? "activity" : "activities"
    } complete`;
  }

  function updateResumePanel() {
    const shouldShow = !state.completedAt && state.lastStep !== "journey";
    elements.resumePanel.hidden = !shouldShow;
  }

  function applyTheme() {
    const isDark = state.theme === "dark";
    elements.html.dataset.theme = state.theme;
    elements.themeToggle.setAttribute("aria-pressed", String(isDark));
    elements.themeToggle.textContent = isDark ? "Light theme" : "Dark theme";
  }

  function toggleTheme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    setLastStep(state.lastStep);
    applyTheme();
    persistState();
  }

  function setFocusMode(enabled) {
    elements.body.classList.toggle("focus-mode", enabled);
    elements.focusToggle.setAttribute("aria-pressed", String(enabled));
    elements.focusToggle.textContent = enabled ? "Exit focus" : "Focus mode";
    if (!enabled) {
      elements.focusToggle.focus();
    } else {
      elements.focusExit.focus();
    }
  }

  function renderPillar() {
    const content = PILLAR_CONTENT[state.selectedPillar];
    document.querySelectorAll("[data-pillar]").forEach((button) => {
      const selected = button.dataset.pillar === state.selectedPillar;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    elements.pillarDetailTitle.textContent = content.title;
    elements.pillarDetailDescription.textContent = content.description;
    elements.pillarDetailExamples.replaceChildren(
      ...content.examples.map((example) => {
        const item = document.createElement("li");
        item.textContent = example;
        return item;
      })
    );
  }

  function selectPillar(pillar) {
    if (!Object.hasOwn(PILLAR_CONTENT, pillar)) {
      return;
    }
    state.selectedPillar = pillar;
    state.lastStep = "pillars";
    renderPillar();
    persistState();
  }

  function formatPoints(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  function renderCalculator() {
    elements.productMark.value = String(state.marks.product);
    elements.processMark.value = String(state.marks.process);
    elements.defenceMark.value = String(state.marks.defence);

    for (const key of WEIGHT_KEYS) {
      const input = elements[`${key}Weight`];
      const output = elements[`${key}WeightValue`];
      const value = state.weights[key];
      input.value = String(value);
      input.setAttribute("aria-valuetext", `${value} percent`);
      output.value = `${value}%`;
      output.textContent = `${value}%`;
    }
    elements.weightStatus.textContent =
      `Product ${state.weights.product}%, Process ${state.weights.process}%, ` +
      `Defence ${state.weights.defence}%. Total: 100%.`;

    const points = {
      product: (state.marks.product * state.weights.product) / 100,
      process: (state.marks.process * state.weights.process) / 100,
      defence: (state.marks.defence * state.weights.defence) / 100
    };
    const overall = points.product + points.process + points.defence;
    const overallLabel = formatPoints(overall);

    elements.overallMark.value = `${overallLabel}%`;
    elements.overallMark.textContent = `${overallLabel}%`;
    elements.productContribution.style.flexBasis = `${points.product}%`;
    elements.processContribution.style.flexBasis = `${points.process}%`;
    elements.defenceContribution.style.flexBasis = `${points.defence}%`;
    elements.productPoints.textContent = `${formatPoints(points.product)} points`;
    elements.processPoints.textContent = `${formatPoints(points.process)} points`;
    elements.defencePoints.textContent = `${formatPoints(points.defence)} points`;
    elements.scoreBar.setAttribute(
      "aria-label",
      `Example overall mark is ${overallLabel} percent. Product contributes ${formatPoints(
        points.product
      )} points, Process contributes ${formatPoints(
        points.process
      )} points, and Defence contributes ${formatPoints(points.defence)} points.`
    );
  }

  function updateMark(key, value) {
    state.marks[key] = clampMark(value, state.marks[key]);
    state.lastStep = "pillars";
    renderCalculator();
    persistState();
  }

  function updateWeight(key, value) {
    state.weights = rebalanceWeights(key, value, state.weights);
    state.lastStep = "pillars";
    renderCalculator();
    persistState();
  }

  function restoreRadioAnswers(form, answers) {
    for (const [name, value] of Object.entries(answers)) {
      const input = form.querySelector(
        `input[type="radio"][name="${CSS.escape(name)}"][value="${CSS.escape(value)}"]`
      );
      if (input) {
        input.checked = true;
      }
    }
  }

  function setFeedback(feedbackId, message, className) {
    const node = document.getElementById(feedbackId);
    node.textContent = message;
    node.classList.remove("is-correct", "needs-retry");
    if (className) {
      node.classList.add(className);
    }
  }

  function renderEvidenceStatus() {
    if (state.evidenceCompleted) {
      elements.evidenceStatus.textContent =
        "Evidence activity complete. You can still review or change your answers.";
      elements.evidenceStatus.className = "activity-status is-correct";
    } else {
      elements.evidenceStatus.textContent =
        "Answer all six examples, then check your classifications.";
      elements.evidenceStatus.className = "activity-status";
    }
  }

  function checkEvidence(event) {
    event.preventDefault();
    let correctCount = 0;
    let answeredCount = 0;

    for (const [key, answer] of Object.entries(EVIDENCE_KEY)) {
      const selected = state.evidenceAnswers[key];
      if (selected) {
        answeredCount += 1;
      }
      if (selected === answer) {
        correctCount += 1;
        setFeedback(`feedback-${key}`, "Correct.", "is-correct");
      } else if (!selected) {
        setFeedback(`feedback-${key}`, "Choose one of the three pillars.", "needs-retry");
      } else {
        setFeedback(`feedback-${key}`, EVIDENCE_GUIDANCE[key], "needs-retry");
      }
    }

    state.evidenceCompleted =
      Boolean(state.completedAt) || correctCount === Object.keys(EVIDENCE_KEY).length;
    state.lastStep = "evidence";
    persistState();
    renderEvidenceStatus();
    updateCompletionControls();

    if (!state.evidenceCompleted) {
      elements.evidenceStatus.textContent =
        answeredCount < Object.keys(EVIDENCE_KEY).length
          ? `You answered ${answeredCount} of 6 examples. Complete the remaining examples and try again.`
          : `${correctCount} of 6 are correct. Use the guidance, then try again.`;
      elements.evidenceStatus.className = "activity-status needs-retry";
      const firstRetry = elements.evidenceForm.querySelector(".item-feedback.needs-retry");
      firstRetry?.closest("fieldset")?.querySelector("input")?.focus();
    }
  }

  function renderReadinessStatus() {
    if (state.readinessCompleted) {
      elements.readinessStatus.textContent =
        "Readiness scenarios complete. You can still review your decisions.";
      elements.readinessStatus.className = "activity-status is-correct";
    } else {
      elements.readinessStatus.textContent = "Choose a response for both situations.";
      elements.readinessStatus.className = "activity-status";
    }
  }

  function checkReadiness(event) {
    event.preventDefault();
    let correctCount = 0;
    let answeredCount = 0;

    for (const [key, answer] of Object.entries(READINESS_KEY)) {
      const selected = state.readinessAnswers[key];
      if (selected) {
        answeredCount += 1;
      }
      if (selected === answer) {
        correctCount += 1;
        setFeedback(`feedback-${key}`, "Good decision.", "is-correct");
      } else if (!selected) {
        setFeedback(`feedback-${key}`, "Choose a response before checking.", "needs-retry");
      } else {
        setFeedback(`feedback-${key}`, READINESS_GUIDANCE[key], "needs-retry");
      }
    }

    state.readinessCompleted =
      Boolean(state.completedAt) || correctCount === Object.keys(READINESS_KEY).length;
    state.lastStep = "readiness";
    persistState();
    renderReadinessStatus();
    updateCompletionControls();

    if (!state.readinessCompleted) {
      elements.readinessStatus.textContent =
        answeredCount < Object.keys(READINESS_KEY).length
          ? "Answer both situations, then check your decisions again."
          : `${correctCount} of 2 decisions is ready. Use the guidance, then try again.`;
      elements.readinessStatus.className = "activity-status needs-retry";
      const firstRetry = elements.readinessForm.querySelector(".item-feedback.needs-retry");
      firstRetry?.closest("fieldset")?.querySelector("input")?.focus();
    }
  }

  function restoreChecklist() {
    for (const key of CHECKLIST_KEYS) {
      const input = elements.completionForm.elements.namedItem(key);
      if (input instanceof HTMLInputElement) {
        input.checked = state.checklist[key];
      }
    }
  }

  function describeMissingCompletionWork() {
    const missing = [];
    if (!state.evidenceCompleted) {
      missing.push("evidence activity");
    }
    if (!state.readinessCompleted) {
      missing.push("readiness scenarios");
    }
    if (!checklistIsComplete()) {
      missing.push("readiness checklist");
    }

    if (missing.length === 0) {
      return "Everything is ready. Select Finish unit to record completion.";
    }
    return `Complete the ${missing.join(", ")} before finishing.`;
  }

  function updateCompletionControls() {
    updateProgress();
    const gatesComplete = completionGatesAreComplete();
    elements.finishUnit.disabled = !gatesComplete || Boolean(state.completedAt);

    if (state.completedAt) {
      elements.finishUnit.textContent = "Unit complete";
      elements.completionStatus.textContent =
        "Complete. Your progress is saved, and you may review any part of this guide.";
      elements.completionStatus.className = "completion-status is-complete";
    } else {
      elements.finishUnit.textContent = "Finish unit";
      elements.completionStatus.textContent = describeMissingCompletionWork();
      elements.completionStatus.className = gatesComplete
        ? "completion-status is-correct"
        : "completion-status";
    }
    updateResumePanel();
  }

  function getScormBridge() {
    const bridge = window.__canvasHelperScorm;
    return bridge && typeof bridge === "object" ? bridge : null;
  }

  function announceScormReady() {
    const bridge = getScormBridge();
    if (!bridge) {
      return false;
    }
    elements.body.classList.add("scorm-ready");
    elements.saveExit.textContent = "Save and Exit";
    elements.saveExit.title = "Save progress and end this Brightspace attempt";
    return true;
  }

  function reportCompletion() {
    const bridge = getScormBridge();
    if (!bridge || typeof bridge.markCompleted !== "function") {
      return false;
    }

    const recorded = bridge.markCompleted();
    if (!recorded) {
      elements.completionStatus.textContent =
        "The unit is complete in this browser, but Brightspace could not record it yet. Keep this page open and try Save and Exit again.";
      elements.completionStatus.className = "completion-status needs-retry";
    }
    return recorded;
  }

  function finishUnit(event) {
    event.preventDefault();
    if (!completionGatesAreComplete()) {
      updateCompletionControls();
      const targetId = !state.evidenceCompleted
        ? "evidence"
        : !state.readinessCompleted
          ? "readiness"
          : "before-submit";
      document.getElementById(targetId)?.scrollIntoView({ block: "start" });
      return;
    }

    if (!state.completedAt) {
      state.completedAt = new Date().toISOString();
      state.lastStep = "before-submit";
      persistState();
    }
    updateCompletionControls();
    reportCompletion();
  }

  function saveAndExit() {
    persistState();
    const bridge = getScormBridge();
    if (bridge && typeof bridge.saveAndExit === "function") {
      const saved = bridge.saveAndExit();
      elements.saveStatus.textContent = saved
        ? "Progress saved. Close this tab or window to return to Brightspace."
        : "Brightspace could not save progress. Keep this page open and try again.";
      if (saved) {
        elements.saveExit.textContent = "Saved";
        elements.saveExit.disabled = true;
      }
      return;
    }
    elements.saveStatus.textContent = "Progress saved in this browser.";
    elements.saveExit.textContent = "Saved";
    window.setTimeout(() => {
      elements.saveExit.textContent = "Save progress";
    }, 1500);
  }

  function bindEvents() {
    elements.themeToggle.addEventListener("click", toggleTheme);
    elements.focusToggle.addEventListener("click", () => {
      setFocusMode(!elements.body.classList.contains("focus-mode"));
    });
    elements.focusExit.addEventListener("click", () => setFocusMode(false));
    elements.saveExit.addEventListener("click", saveAndExit);
    elements.resumeButton.addEventListener("click", () => {
      const target = document.getElementById(state.lastStep);
      elements.resumePanel.hidden = true;
      target?.scrollIntoView({ block: "start" });
      target?.querySelector("h2")?.setAttribute("tabindex", "-1");
      target?.querySelector("h2")?.focus({ preventScroll: true });
    });

    document.querySelectorAll("[data-pillar]").forEach((button) => {
      button.addEventListener("click", () => selectPillar(button.dataset.pillar));
    });

    for (const key of ["product", "process", "defence"]) {
      const markInput = elements[`${key}Mark`];
      const weightInput = elements[`${key}Weight`];
      markInput.addEventListener("input", () => updateMark(key, markInput.value));
      markInput.addEventListener("change", () => updateMark(key, markInput.value));
      weightInput.addEventListener("input", () => updateWeight(key, weightInput.value));
      weightInput.addEventListener("change", () => updateWeight(key, weightInput.value));
    }
    elements.resetMarks.addEventListener("click", () => {
      state.marks = { product: 80, process: 80, defence: 80 };
      state.weights = { ...DEFAULT_WEIGHTS };
      state.lastStep = "pillars";
      renderCalculator();
      persistState();
    });

    elements.evidenceForm.addEventListener("change", (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.type !== "radio") {
        return;
      }
      state.evidenceAnswers[input.name] = input.value;
      state.evidenceCompleted = state.completedAt ? true : false;
      state.lastStep = "evidence";
      setFeedback(`feedback-${input.name}`, "", "");
      persistState();
      renderEvidenceStatus();
      updateCompletionControls();
    });
    elements.evidenceForm.addEventListener("submit", checkEvidence);

    elements.readinessForm.addEventListener("change", (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.type !== "radio") {
        return;
      }
      state.readinessAnswers[input.name] = input.value;
      state.readinessCompleted = state.completedAt ? true : false;
      state.lastStep = "readiness";
      setFeedback(`feedback-${input.name}`, "", "");
      persistState();
      renderReadinessStatus();
      updateCompletionControls();
    });
    elements.readinessForm.addEventListener("submit", checkReadiness);

    elements.completionForm.addEventListener("change", (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.type !== "checkbox") {
        return;
      }
      state.checklist[input.name] = state.completedAt ? true : input.checked;
      input.checked = state.checklist[input.name];
      state.lastStep = "before-submit";
      persistState();
      updateCompletionControls();
    });
    elements.completionForm.addEventListener("submit", finishUnit);

    window.addEventListener("canvas-helper:scorm-ready", () => {
      announceScormReady();
      if (state.completedAt) {
        reportCompletion();
      }
    });
  }

  function renderRestoredFeedback() {
    if (state.evidenceCompleted) {
      for (const key of Object.keys(EVIDENCE_KEY)) {
        setFeedback(`feedback-${key}`, "Correct.", "is-correct");
      }
    }
    if (state.readinessCompleted) {
      for (const key of Object.keys(READINESS_KEY)) {
        setFeedback(`feedback-${key}`, "Good decision.", "is-correct");
      }
    }
  }

  function boot() {
    hydrateLocalVideos();
    applyTheme();
    renderPillar();
    renderCalculator();
    restoreRadioAnswers(elements.evidenceForm, state.evidenceAnswers);
    restoreRadioAnswers(elements.readinessForm, state.readinessAnswers);
    restoreChecklist();
    renderRestoredFeedback();
    renderEvidenceStatus();
    renderReadinessStatus();
    updateCompletionControls();
    bindEvents();

    if (announceScormReady() && state.completedAt) {
      reportCompletion();
    }
  }

  boot();
})();
