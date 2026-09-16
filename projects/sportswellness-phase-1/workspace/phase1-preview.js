(() => {
  "use strict";
  const api = window.__sportsWellnessPhase1;
  if (!api) return;
  const state = api.getState();
  const checkpointForm = document.querySelector("#phase1-checkpoint-form");
  const contentVersion = "phase1-checkpoint-2026-09-14-r1";
  let checkpointSubmitting = false;

  function save(message) {
    api.save();
    if (message) api.status(message);
  }

  function id() {
    return globalThis.crypto?.randomUUID?.() ?? `attempt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function checkpointQuestions() {
    return [...checkpointForm.querySelectorAll(".checkpoint-question")];
  }

  function renderCheckpointHistory() {
    const host = document.querySelector("#checkpoint-history");
    const attempts = state.checkpoint.attempts;
    host.innerHTML = attempts.length
      ? `<h3>Saved attempts</h3><ol class="attempt-list">${attempts.map((attempt) => `<li>${api.escape(api.niceDate(attempt.at))}: ${attempt.score}/10 (${attempt.percent}%) · ${attempt.passed ? "70% threshold met" : "keep practising"}</li>`).join("")}</ol><p>Best saved score: <strong>${state.checkpoint.bestScore}%</strong>. This is local practice, not an LMS grade.</p>`
      : "<p>No checkpoint attempt has been submitted yet.</p>";
  }

  for (const question of checkpointQuestions()) {
    const selected = state.checkpoint.selections[question.id];
    if (Number.isInteger(selected)) {
      question.querySelector(`input[value="${selected}"]`)?.setAttribute("checked", "");
    }
    question.addEventListener("change", (event) => {
      if (!(event.target instanceof HTMLInputElement)) return;
      state.checkpoint.selections[question.id] = Number(event.target.value);
      state.checkpoint.lastSubmittedFingerprint = null;
      save("Checkpoint choice saved in this browser.");
    });
  }

  checkpointForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (checkpointSubmitting) return;
    checkpointSubmitting = true;
    const fingerprint = JSON.stringify(checkpointQuestions().map((question) => state.checkpoint.selections[question.id] ?? null));
    if (state.checkpoint.lastSubmittedFingerprint === fingerprint) {
      document.querySelector("#checkpoint-result").textContent = "This exact attempt is already saved. Change a response or start a new attempt before submitting again.";
      checkpointSubmitting = false;
      return;
    }
    const answers = {};
    let score = 0;
    let unanswered = 0;
    for (const question of checkpointQuestions()) {
      const selected = state.checkpoint.selections[question.id];
      const answer = Number(question.dataset.answer);
      answers[question.id] = Number.isInteger(selected) ? selected : null;
      const correct = selected === answer;
      if (!Number.isInteger(selected)) unanswered += 1;
      if (correct) score += 1;
      question.classList.toggle("is-correct", correct);
      question.classList.toggle("is-incorrect", !correct);
      question.querySelector(".checkpoint-feedback").hidden = false;
    }
    const percent = Math.round((score / 10) * 100);
    state.checkpoint.attempts.push({ attemptId: id(), score, percent, passed: percent >= 70, answers, at: api.stamp() });
    state.checkpoint.attempts = state.checkpoint.attempts.slice(-10);
    state.checkpoint.bestScore = Math.max(state.checkpoint.bestScore ?? 0, percent);
    state.checkpoint.lastSubmittedFingerprint = fingerprint;
    save("Checkpoint attempt saved in this browser.");
    document.querySelector("#checkpoint-result").textContent = `${score} of 10 correct (${percent}%). ${percent >= 70 ? "You met the 70% practice threshold." : "Review the feedback and try again."}${unanswered ? ` ${unanswered} unanswered question${unanswered === 1 ? "" : "s"} counted in the ten-question denominator.` : ""}`;
    renderCheckpointHistory();
    checkpointSubmitting = false;
  });

  document.querySelector("#checkpoint-clear").addEventListener("click", () => {
    state.checkpoint.selections = {};
    state.checkpoint.lastSubmittedFingerprint = null;
    checkpointForm.reset();
    checkpointQuestions().forEach((question) => {
      question.classList.remove("is-correct", "is-incorrect");
      question.querySelector(".checkpoint-feedback").hidden = true;
    });
    document.querySelector("#checkpoint-result").textContent = "New attempt ready. Earlier saved attempts remain in your history.";
    save();
  });

  const gameDebrief = document.querySelector("#game-debrief");
  gameDebrief.value = state.gameDebrief;
  gameDebrief.addEventListener("input", () => { state.gameDebrief = gameDebrief.value; save(); document.querySelector("#game-debrief-save").textContent = api.storageAvailable() ? "Saved in this browser" : "Session only — export to keep a copy"; });

  const untimedStrategy = document.querySelector("#untimed-strategy");
  const untimedReflection = document.querySelector("#untimed-reflection");
  untimedStrategy.value = state.untimedPractice.strategy;
  untimedReflection.value = state.untimedPractice.reflection;
  for (const input of [untimedStrategy, untimedReflection]) input.addEventListener("input", () => { state.untimedPractice.strategy = untimedStrategy.value; state.untimedPractice.reflection = untimedReflection.value; save(); });
  document.querySelector("#untimed-check").addEventListener("click", () => {
    const feedback = document.querySelector("#untimed-feedback");
    if (!untimedStrategy.value || !untimedReflection.value.trim()) feedback.textContent = "Choose a move and explain why it fits before checking.";
    else if (untimedStrategy.value === "settle") feedback.textContent = "This move fits the stated task: settle enough to restore useful awareness, then use a broad external cue. Your explanation matters more than speed.";
    else feedback.textContent = "Reconsider the task signals. The athlete is already tense and rushed, so the first move should not add activation or ignore information.";
  });

  const videos = document.querySelector("#phase1-video-picker");
  const videoHost = document.querySelector("#phase1-video-host");
  function showVideoPlaceholder() {
    const message = document.createElement("p");
    message.className = "video-player-empty";
    message.textContent = "Choose a video, then select Play. The video will open here without leaving the lesson.";
    videoHost.replaceChildren(message);
  }
  function syncVideoLink() {
    const option = videos.selectedOptions[0];
    document.querySelector("#video-direct").href = `https://www.youtube.com/watch?v=${option.dataset.youtube}`;
  }
  videos.addEventListener("change", () => { showVideoPlaceholder(); syncVideoLink(); });
  document.querySelector("#video-play").addEventListener("click", () => {
    const option = videos.selectedOptions[0];
    const frame = document.createElement("iframe");
    frame.className = "video-frame";
    frame.title = option.textContent;
    frame.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
    frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.src = `https://www.youtube-nocookie.com/embed/${option.dataset.youtube}?rel=0&cc_load_policy=1`;
    videoHost.replaceChildren(frame);
    frame.focus();
  });

  function buildSupportResourceIndex() {
    const host = document.querySelector("#support-resource-index");
    if (!host) return;
    const groupForTopic = {
      start: "Getting started",
      "key-terms": "Stress & anxiety",
      "stress-loop": "Stress & anxiety",
      "interpreting-nerves": "Stress & anxiety",
      "stress-sources": "Stress & anxiety",
      "performance-zone": "Performance models",
      "attention-coordination": "Attention",
      "regulation-tools": "Regulation",
      "cues-goals": "Goals",
      playbook: "Goals",
      "performance-lab": "Practice & review",
      "phase-review": "Practice & review"
    };
    const groupOrder = ["Getting started", "Stress & anxiety", "Performance models", "Attention", "Regulation", "Goals", "Practice & review"];
    const resources = [...document.querySelectorAll("[data-support-resource]")];
    const safeExternalUrl = (value) => {
      try {
        const url = new URL(value);
        return ["https:", "http:"].includes(url.protocol) ? url.href : null;
      } catch (_) { return null; }
    };
    const make = (tag, className, text) => {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (text) element.textContent = text;
      return element;
    };
    host.replaceChildren();
    for (const kind of ["video", "reading"]) {
      const kindSection = make("section", "resource-index-kind");
      kindSection.append(make("h4", "", kind === "video" ? "Videos by topic" : "Readings by topic"));
      for (const groupName of groupOrder) {
        const matches = resources.filter((resource) => resource.dataset.resourceKind === kind && groupForTopic[resource.dataset.resourceTopic] === groupName);
        if (!matches.length) continue;
        const group = make("section", "resource-index-group");
        group.append(make("h5", "", groupName));
        for (const resource of matches) {
          const item = make("article", "resource-index-item");
          item.append(make("h6", "", resource.dataset.resourceTitle));
          const topicTitle = resource.closest(".chapter-section")?.querySelector("h2")?.textContent?.trim() || resource.dataset.resourceTopic;
          item.append(make("p", "resource-meta", `${resource.dataset.resourcePublisher} · ${topicTitle}`));
          const purpose = [...resource.children].find((child) => child.matches?.("p:not(.p1-publisher):not(.p1-focus):not(.p1-caution):not(.p1-after):not(.p1-unavailable)"));
          if (purpose) item.append(make("p", "", purpose.textContent.replace(/^Why this is here:\s*/i, "")));
          const actions = make("div", "resource-index-actions");
          const titleId = resource.querySelector("h4")?.id;
          if (titleId) {
            const lessonLink = make("a", "", "View lesson guidance →");
            lessonLink.href = `#${titleId}`;
            actions.append(lessonLink);
          }
          const externalUrl = safeExternalUrl(resource.dataset.resourceUrl);
          if (externalUrl) {
            const externalLink = make("a", "", `Open ${kind} ↗`);
            externalLink.href = externalUrl;
            externalLink.target = "_blank";
            externalLink.rel = "noopener noreferrer";
            actions.append(externalLink);
          }
          item.append(actions);
          group.append(item);
        }
        kindSection.append(group);
      }
      host.append(kindSection);
    }
  }

  function processCollection() {
    const host = document.querySelector("#process-summary");
    const groups = [];
    const notes = Array.isArray(state.noteEntries) ? state.noteEntries : [];
    const written = Object.entries(state.drafts).filter(([key, value]) => key !== "notebook-notes" && typeof value === "string" && value.trim());
    const describe = (key) => {
      const field = document.querySelector(`[data-draft="${CSS.escape(key)}"]`);
      const label = field?.id ? document.querySelector(`label[for="${CSS.escape(field.id)}"]`)?.textContent?.trim() : null;
      const lesson = field?.closest(".chapter-section")?.querySelector("h2")?.textContent?.trim();
      return [lesson, label || key].filter(Boolean).join(" · ");
    };
    groups.push(`<div class="process-group"><h3>My Notes</h3>${notes.length ? notes.slice().reverse().map((note) => `<div class="process-entry process-note-entry"><strong>${api.escape(api.niceDate(note.at))}</strong><br>${api.escape(note.text)}</div>`).join("") : `<p>No saved notes yet. Use the Quick Notes button whenever you want to add one.</p>`}</div>`);
    groups.push(`<div class="process-group"><h3>Written responses</h3><p>${written.length} response${written.length === 1 ? "" : "s"} saved automatically.</p>${written.map(([key, value]) => `<div class="process-entry"><strong>${api.escape(describe(key))}</strong><br>${api.escape(value)}<br><a class="process-return" href="#${api.escape(key)}">Return to response →</a></div>`).join("")}</div>`);
    groups.push(`<div class="process-group"><h3>Review and revision</h3><p>${Object.keys(state.firstChecks).length} first-answer snapshot${Object.keys(state.firstChecks).length === 1 ? "" : "s"}; ${Object.values(state.practice).reduce((total, attempts) => total + attempts.length, 0)} formative check attempt${Object.values(state.practice).reduce((total, attempts) => total + attempts.length, 0) === 1 ? "" : "s"}.</p></div>`);
    groups.push(`<div class="process-group"><h3>Checkpoint</h3><p>${state.checkpoint.attempts.length} saved attempt${state.checkpoint.attempts.length === 1 ? "" : "s"}${state.checkpoint.bestScore === null ? "." : `; best local score ${state.checkpoint.bestScore}%.`}</p><a href="#checkpoint">Return to checkpoint →</a></div>`);
    groups.push(`<div class="process-group"><h3>Performance activity</h3><p>${state.gameDebrief.trim() ? "Your game reflection is saved." : "Add a reflection after trying the original simulator."}</p><a href="#performance-game">Return to game →</a></div>`);
    host.innerHTML = groups.join("");
  }

  function handleRoute() {
    const route = decodeURIComponent(location.hash.slice(1));
    if (route !== "resources") videoHost.replaceChildren();
    else if (!videoHost.childElementCount) showVideoPlaceholder();
    if (route === "process-collection") processCollection();
  }
  addEventListener("hashchange", handleRoute);
  addEventListener("popstate", handleRoute);
  document.addEventListener("phase1-notes-updated", () => {
    if (location.hash === "#process-collection") processCollection();
  });

  renderCheckpointHistory();
  buildSupportResourceIndex();
  syncVideoLink();
  showVideoPlaceholder();
  handleRoute();
})();
