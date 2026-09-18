(() => {
  "use strict";
  const api = window.__sportsWellnessPhase1;
  if (!api) return;
  let state = api.getState();
  const checkpointForm = document.querySelector("#phase1-checkpoint-form");
  const contentVersion = "phase1-checkpoint-2026-09-17-r2";
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
      question.querySelectorAll("input").forEach(input => { input.checked = Number(input.value) === selected; });
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
    if (checkpointQuestions().some(question => !Number.isInteger(state.checkpoint.selections[question.id]))) { document.querySelector("#checkpoint-result").textContent = "Answer all ten questions before saving an attempt."; return; }
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
    checkpointForm.querySelectorAll("input[type=radio]").forEach(input => { input.checked = false; input.defaultChecked = false; });
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

  function restoreUntimed() {
    state.untimedPractice.cases.forEach((a,i)=>{document.querySelector(`#untimed-choice-${i}`).value=a.choice;document.querySelector(`#untimed-reason-${i}`).value=a.reason;});
    document.querySelector('#untimed-transfer').value=state.untimedPractice.transfer;
  }
  for(let i=0;i<2;i++) {
    const choice=document.querySelector(`#untimed-choice-${i}`),reason=document.querySelector(`#untimed-reason-${i}`);
    for(const input of [choice,reason])input.addEventListener('input',()=>{state.untimedPractice.cases[i]={choice:choice.value,reason:reason.value};save();});
    document.querySelector(`[data-untimed-check="${i}"]`).addEventListener('click',()=>{document.querySelector(`#untimed-feedback-${i}`).textContent=!choice.value||!reason.value.trim()?'Choose and explain before checking.':choice.value===(i===0?'up':'hold')?'The selected move fits these signs. Check that your explanation connects the signs, action and next observation.':'Reconsider the signs: flatness calls for activation; readiness calls for maintaining and directing attention.';});
  }
  document.querySelector('#untimed-transfer').addEventListener('input',event=>{state.untimedPractice.transfer=event.target.value;save();});
  restoreUntimed();
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
    const assignmentFields=JSON.parse(document.querySelector('#page-meta').textContent).assignmentFields;
    const applications=['start-moment','terms-own','loop-reframe','zone-reflection','nerves-control','source-case','attention-cue','regulation-why','goal-rewrite'].filter(key=>state.drafts[key]?.trim()).length;
    const filled=assignmentFields.filter(key=>state.drafts[key]?.trim()).length;
    const labDone=[0,1,2].every(round=>state.lab.attempts.some(a=>a.round===round&&a.prediction.trim()))&&!!state.drafts['lab-transfer']?.trim();
    const untimedDone=!!state.untimedPractice.strategy&&!!state.untimedPractice.reflection.trim()&&state.untimedPractice.cases.every(a=>a.choice&&a.reason.trim())&&!!state.untimedPractice.transfer.trim();
    const reviewedAnswers=Array.from({length:10},(_,i)=>i+1).filter(n=>state.firstChecks[n]&&state.drafts[`review-${n}-revision`]?.trim()).length;
    groups.push(`<div class="process-group"><h3>Required-work checklist</h3><ul><li>Start and Learn applications: ${applications}/9 filled.</li><li>Regulation Engine: ${filled}/28 required fields filled.</li><li>Three-case practice and transfer: ${labDone||untimedDone?'recorded':'still to complete'}.</li><li>Review comparisons and revisions: ${reviewedAnswers}/10 recorded; synthesis ${state.drafts['phase-synthesis']?.trim()?'filled':'still to complete'}.</li><li>Checkpoint: ${state.checkpoint.bestScore>=70?'70% practice threshold met':'still to complete or retry'}.</li></ul><p>These checks show saved evidence, not a grade or submission. Check that your explanations fit the chosen situation. Follow your teacher’s walkthrough and Brightspace submission directions.</p></div>`);
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
    groups.push(`<div class="process-group"><h3>Formative check history</h3>${Object.entries(state.practice).map(([key,attempts])=>`<div class="process-entry"><strong>${api.escape(key)}</strong>${attempts.map(a=>`<p>${api.escape(api.niceDate(a.at))} · choice ${a.choice+1} · ${a.correct?'fits the concept':'revisit the choice'}</p>`).join('')}<a href="#${api.escape(document.querySelector(`[data-check="${CSS.escape(key)}"]`)?.id || 'key-terms')}">Return to lesson →</a></div>`).join('')}</div>`);
    groups.push(`<div class="process-group"><h3>Checkpoint</h3><p>${state.checkpoint.attempts.length} saved attempt${state.checkpoint.attempts.length === 1 ? "" : "s"}${state.checkpoint.bestScore === null ? "." : `; best local score ${state.checkpoint.bestScore}%.`}</p><a href="#checkpoint">Return to checkpoint →</a></div>`);
    groups.push(`<div class="process-group"><h3>Performance activity</h3><p>${state.gameDebrief.trim() ? "Your game reflection is saved." : "The target game is optional. Complete the guided lab or untimed practice for your decision evidence."}</p><a href="#performance-game">Return to game →</a></div>`);
    groups.push(`<div class="process-group"><h3>Guided decision practice</h3>${state.lab.attempts.map(a=>`<div class="process-entry">Case ${a.round+1}: ${api.escape(a.action)} · fictional activation ${a.before} → ${a.after}<p>${api.escape(a.prediction)}</p><a href="#regulation-lab">Return to lab →</a></div>`).join('') || '<p>No guided cases saved yet.</p>'}</div>`);
    groups.push(`<div class="process-group"><h3>First-answer snapshots</h3>${Object.entries(state.firstChecks).map(([n,a])=>`<div class="process-entry"><strong>Question ${api.escape(n)} · ${api.escape(api.niceDate(a.at))}</strong><p>${api.escape(a.text)}</p><a href="#review-${api.escape(n)}-first">Return to review →</a></div>`).join('') || '<p>No snapshots yet.</p>'}</div>`);
    groups.push(`<div class="process-group"><h3>Optional game rounds</h3>${state.game.attempts.map(a=>`<p>${api.escape(api.niceDate(a.at))} · ${api.escape(a.roundEndReason)} · ${(a.elapsedMs/1000).toFixed(1)} seconds · fictional activation ${a.arousal}, tracking ${a.trackingPercent}%</p>`).join('')}<p>${api.escape(state.gameDebrief)}</p></div>`);
    groups.push(`<div class="process-group"><h3>Untimed decision practice</h3><p>${api.escape(state.untimedPractice.strategy)}</p><p>${api.escape(state.untimedPractice.reflection)}</p>${state.untimedPractice.cases.map((a,i)=>`<p>Case ${i+2}: ${api.escape(a.choice)} · ${api.escape(a.reason)}</p>`).join('')}<p>${api.escape(state.untimedPractice.transfer)}</p><a href="#untimed-practice">Return to untimed practice →</a></div>`);
    if(state.checkpointArchive.length)groups.push(`<div class="process-group"><h3>Earlier checkpoint versions</h3><p>These historical results do not count toward the current checkpoint.</p>${state.checkpointArchive.map(a=>`<p>${api.escape(a.contentVersion)}: ${a.attempts.length} saved attempt(s).</p>`).join('')}</div>`);
    host.innerHTML = groups.join("");
  }

  let previousRoute = api.getState().topic;
  const gameFrame = document.querySelector('#phase1-game-frame') || document.querySelector('#performance-game iframe');
  const messageOrigin = location.protocol === 'file:' ? 'null' : location.origin;
  const activityId = 'phase1-performance-state-simulator-game';
  function control(action) { gameFrame?.contentWindow?.postMessage({schemaVersion:1,activityId,type:'control',action}, messageOrigin==='null'?'*':messageOrigin); }
  addEventListener('message', event => {
    const data = event.data;
    if (event.source !== gameFrame?.contentWindow || event.origin !== messageOrigin || !data || data.schemaVersion !== 1 || data.activityId !== activityId || data.type !== 'attempt') return;
    const a = data.payload;
    if (!a || Array.isArray(a) || Object.keys(a).sort().join(',') !== 'arousal,at,attemptId,elapsedMs,pace,roundEndReason,score,status,trackingPercent' || typeof a.attemptId !== 'string' || a.attemptId.length > 80 || !['completed','interrupted'].includes(a.status) || !['upper-limit','lower-limit','tracking-loss','round-ended','navigation','restart'].includes(a.roundEndReason) || !['steady','intense','lull'].includes(a.pace) || typeof a.at !== 'string' || !Number.isFinite(Date.parse(a.at))) return;
    for (const [key,max] of Object.entries({score:100000,elapsedMs:3600000,arousal:100,trackingPercent:100})) if (!Number.isInteger(a[key]) || a[key]<0 || a[key]>max) return;
    state = api.getState();
    if (state.game.attempts.some(old => old.attemptId === a.attemptId)) return;
    state.game.attempts.push({attemptId:a.attemptId,status:a.status,score:a.score,elapsedMs:a.elapsedMs,arousal:a.arousal,trackingPercent:a.trackingPercent,pace:a.pace,roundEndReason:a.roundEndReason,at:a.at});
    state.game.attempts = state.game.attempts.slice(-10); save();
    if (state.topic === 'process-collection') processCollection();
  });
  function handleRoute(event) {
    state = api.getState();
    const route = event?.detail?.route || state.topic;
    if (previousRoute === 'performance-game' && route !== previousRoute) control('stop');
    previousRoute = route;
    checkpointForm.querySelectorAll('input[type=radio]').forEach(input => {input.checked = state.checkpoint.selections[input.closest('.checkpoint-question').id] === Number(input.value);});
    gameDebrief.value = state.gameDebrief;
    untimedStrategy.value = state.untimedPractice.strategy;
    untimedReflection.value = state.untimedPractice.reflection;
    restoreUntimed();
    checkpointQuestions().forEach(question=>{question.classList.remove('is-correct','is-incorrect');question.querySelector('.checkpoint-feedback').hidden=true;});
    renderCheckpointHistory();
    if (route === 'process-collection') processCollection();
  }
  document.addEventListener('phase1-route-activated', handleRoute);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)control('pause');});
  document.addEventListener('phase1-notes-updated',()=>{state=api.getState();if(state.topic==='process-collection')processCollection();});
  renderCheckpointHistory();
  buildSupportResourceIndex();
  handleRoute();
})();
