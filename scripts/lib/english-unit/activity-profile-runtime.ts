/**
 * Shared enhancement layer for pages emitted by activity-profile-renderers.ts.
 * Learner responses and Evidence Bank writes remain owned by the Next Step shell.
 */
export const ENGLISH_ACTIVITY_PROFILE_RUNTIME = `
(function(){
  function wordCount(value){
    return String(value || "").trim().split(/\\s+/).filter(Boolean).length;
  }
  function setPanelGroup(group, value){
    if(!group) return;
    document.querySelectorAll("[data-english-activity-panel-group]").forEach(function(panel){
      if(panel.getAttribute("data-english-activity-panel-group") !== group) return;
      panel.hidden = panel.getAttribute("data-english-activity-panel") !== value;
    });
  }
  function syncSelect(select){
    setPanelGroup(select.getAttribute("data-english-activity-select"), select.value);
  }
  function updateField(field){
    const response = field.closest("[data-activity-response]");
    const counter = response && response.querySelector("[data-activity-word-count]");
    if(counter) counter.textContent = wordCount(field.value) + " words";
    const progress = field.closest("[data-activity-progress]");
    if(progress) updateProgress(progress);
  }
  function updateProgress(root){
    const fields = Array.from(root.querySelectorAll("[data-activity-response] [data-response-id]"));
    const answered = fields.filter(function(field){
      if(field.type === "checkbox") return field.checked;
      return String(field.value || "").trim();
    }).length;
    const label = root.querySelector("[data-activity-progress-label]");
    const fill = root.querySelector("[data-activity-progress-fill]");
    if(label) label.textContent = answered + " of " + fields.length + " answered";
    if(fill) fill.style.width = (fields.length ? Math.round(answered / fields.length * 100) : 0) + "%";
  }
  function setHints(button){
    const scope = button.closest("[data-question-panel], [data-writing-activity-panel], .english-activity-worksheet");
    if(!scope) return;
    const show = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(show));
    button.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> ' + (show ? "Hide Hints" : "Show Hints");
    scope.querySelectorAll("[data-question-hint], [data-writing-hint]").forEach(function(hint){ hint.hidden = !show; });
  }
  function printScope(button){
    const scope = button.closest("[data-question-panel], [data-writing-activity-panel], .english-activity-worksheet, .english-activity-page");
    if(typeof window.printCourseSection === "function") window.printCourseSection(scope || document.body);
    else window.print();
  }
  function syncShakespeareSelection(select){
    const group = select && select.getAttribute("data-english-activity-select");
    if(!group) return;
    document.querySelectorAll("[data-shakespeare-select-for]").forEach(function(button){
      if(button.getAttribute("data-shakespeare-select-for") !== group) return;
      const active = button.getAttribute("data-shakespeare-panel-select") === select.value;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const studio = select.closest("[data-shakespeare-character-studio]");
    if(studio){
      const activeButton = Array.from(studio.querySelectorAll("[data-character-accent]")).find(function(button){ return button.getAttribute("data-shakespeare-panel-select") === select.value; });
      const color = activeButton && activeButton.getAttribute("data-character-accent");
      if(color && /^#[0-9a-f]{6}$/i.test(color)){
        const cleaned = color.slice(1);
        studio.style.setProperty("--character-accent", color);
        studio.style.setProperty("--character-accent-rgb", parseInt(cleaned.slice(0,2),16) + "," + parseInt(cleaned.slice(2,4),16) + "," + parseInt(cleaned.slice(4,6),16));
      }
    }
  }
  function activateShakespearePanel(button){
    const group = button.getAttribute("data-shakespeare-select-for");
    const value = button.getAttribute("data-shakespeare-panel-select");
    if(!group || !value) return;
    const select = Array.from(document.querySelectorAll("[data-shakespeare-select-input]")).find(function(candidate){ return candidate.getAttribute("data-shakespeare-select-input") === group; });
    if(!select) return;
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    syncShakespeareSelection(select);
  }
  function openShakespeareReader(button){
    const page = button.closest(".shakespeare-materials-page");
    const overlay = page && page.querySelector("[data-shakespeare-reader-overlay]");
    const frame = overlay && overlay.querySelector("[data-shakespeare-reader-frame]");
    const title = overlay && overlay.querySelector("[data-shakespeare-reader-title]");
    if(!overlay || !frame) return;
    frame.src = button.getAttribute("data-shakespeare-fullscreen-src") || "about:blank";
    if(title) title.textContent = button.getAttribute("data-shakespeare-fullscreen-title") || "Macbeth Material";
    overlay.hidden = false;
    document.documentElement.classList.add("has-shakespeare-reader-open");
  }
  function closeShakespeareReader(button){
    const overlay = button.closest("[data-shakespeare-reader-overlay]");
    const frame = overlay && overlay.querySelector("[data-shakespeare-reader-frame]");
    if(frame) frame.src = "about:blank";
    if(overlay) overlay.hidden = true;
    document.documentElement.classList.remove("has-shakespeare-reader-open");
  }
  function openSource(value){
    if(!value) return;
    const opened = window.open(value, "_blank", "noopener,noreferrer");
    if(opened) opened.opener = null;
  }
  function downloadSource(value){
    if(!value) return;
    const anchor = document.createElement("a");
    anchor.href = value;
    anchor.download = "";
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
  function updateCharacterProgress(root){
    if(!root) return;
    root.querySelectorAll("[data-character-dossier-panel]").forEach(function(panel){
      const fields = Array.from(panel.querySelectorAll("[data-response-id]")).filter(function(field){ return field.type !== "hidden"; });
      const answered = fields.filter(function(field){ return field.type === "checkbox" ? field.checked : String(field.value || "").trim(); }).length;
      const percent = fields.length ? Math.round(answered / fields.length * 100) : 0;
      const id = panel.getAttribute("data-character-dossier-panel") || "";
      root.querySelectorAll("[data-character-progress-label]").forEach(function(label){ if(label.getAttribute("data-character-progress-label") === id) label.textContent = percent + "% complete"; });
      root.querySelectorAll("[data-character-progress-bar]").forEach(function(bar){ if(bar.getAttribute("data-character-progress-bar") === id) bar.style.width = percent + "%"; });
      const badge = panel.querySelector("[data-character-panel-progress]");
      if(badge) badge.textContent = percent + "%";
    });
  }
  function resetActiveCharacter(button){
    const root = button.closest("[data-shakespeare-character-studio]");
    if(!root) return;
    const select = root.querySelector("[data-shakespeare-select-input]");
    const panel = select && Array.from(root.querySelectorAll("[data-character-dossier-panel]")).find(function(candidate){ return candidate.getAttribute("data-character-dossier-panel") === select.value; });
    if(!panel) return;
    if(!window.confirm("Clear the working notes for this character? Saved Evidence Bank entries will remain.")) return;
    panel.querySelectorAll("[data-response-id]").forEach(function(field){
      if(field.type === "hidden") return;
      if(field.type === "checkbox" || field.type === "radio") field.checked = false;
      else field.value = "";
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
    });
    updateCharacterProgress(root);
  }
  function languageMatchState(root){
    const field = root.querySelector("[data-shakespeare-match-state]");
    if(!field) return [];
    try { const parsed = JSON.parse(field.value || "[]"); return Array.isArray(parsed) ? parsed.filter(function(value){ return typeof value === "string"; }) : []; }
    catch { return []; }
  }
  function syncLanguageLab(root){
    if(!root) return;
    const matched = languageMatchState(root);
    root.querySelectorAll("[data-shakespeare-match-term], [data-shakespeare-match-meaning]").forEach(function(button){
      const key = button.getAttribute("data-shakespeare-match-term") || button.getAttribute("data-shakespeare-match-meaning") || "";
      const done = matched.includes(key);
      button.classList.toggle("is-matched", done);
      button.disabled = done;
    });
    const score = root.querySelector("[data-shakespeare-match-score]");
    const status = root.querySelector("[data-shakespeare-match-status]");
    const progress = root.querySelector("[data-shakespeare-match-progress]");
    const scoreField = root.querySelector("[data-shakespeare-practice-score]");
    const scoreText = matched.length + " / 12";
    if(score) score.textContent = scoreText;
    if(status && !root.dataset.matchMessage) status.textContent = matched.length + " of 12 pairs matched.";
    if(progress) progress.style.width = Math.round(matched.length / 12 * 100) + "%";
    if(scoreField && scoreField.value !== scoreText){ scoreField.value = scoreText; scoreField.dispatchEvent(new Event("input", { bubbles: true })); }
  }
  function chooseLanguageMatch(button){
    const root = button.closest("[data-shakespeare-language-lab]");
    if(!root || button.disabled) return;
    const kind = button.hasAttribute("data-shakespeare-match-term") ? "term" : "meaning";
    root.querySelectorAll(kind === "term" ? "[data-shakespeare-match-term]" : "[data-shakespeare-match-meaning]").forEach(function(candidate){ candidate.classList.remove("is-selected"); });
    button.classList.add("is-selected");
    root.dataset[kind] = button.getAttribute(kind === "term" ? "data-shakespeare-match-term" : "data-shakespeare-match-meaning") || "";
    if(!root.dataset.term || !root.dataset.meaning) return;
    const status = root.querySelector("[data-shakespeare-match-status]");
    if(root.dataset.term === root.dataset.meaning){
      const matched = languageMatchState(root);
      if(!matched.includes(root.dataset.term)) matched.push(root.dataset.term);
      const state = root.querySelector("[data-shakespeare-match-state]");
      if(state){ state.value = JSON.stringify(matched); state.dispatchEvent(new Event("input", { bubbles: true })); }
      if(status) status.textContent = "Correct. Choose another pair.";
    } else if(status) status.textContent = "Those do not match yet. Try another meaning.";
    root.querySelectorAll(".is-selected").forEach(function(candidate){ candidate.classList.remove("is-selected"); });
    root.dataset.term = "";
    root.dataset.meaning = "";
    syncLanguageLab(root);
  }
  function initialize(){
    document.querySelectorAll("[data-english-activity-select]").forEach(syncSelect);
    document.querySelectorAll("[data-english-activity-select]").forEach(syncShakespeareSelection);
    document.querySelectorAll("[data-activity-response] [data-response-id]").forEach(updateField);
    document.querySelectorAll("[data-activity-progress]").forEach(updateProgress);
    document.querySelectorAll("[data-shakespeare-character-studio]").forEach(updateCharacterProgress);
    document.querySelectorAll("[data-shakespeare-language-lab]").forEach(syncLanguageLab);
    window.setTimeout(function(){
      document.querySelectorAll("[data-english-activity-select]").forEach(syncSelect);
      document.querySelectorAll("[data-english-activity-select]").forEach(syncShakespeareSelection);
      document.querySelectorAll("[data-activity-response] [data-response-id]").forEach(updateField);
      document.querySelectorAll("[data-shakespeare-character-studio]").forEach(updateCharacterProgress);
      document.querySelectorAll("[data-shakespeare-language-lab]").forEach(syncLanguageLab);
    }, 0);
  }
  document.addEventListener("change", function(event){
    const select = event.target.closest("[data-english-activity-select]");
    if(select){ syncSelect(select); syncShakespeareSelection(select); }
    const field = event.target.closest("[data-activity-response] [data-response-id]");
    if(field) updateField(field);
    const character = event.target.closest("[data-shakespeare-character-studio]");
    if(character) updateCharacterProgress(character);
  });
  document.addEventListener("input", function(event){
    const field = event.target.closest("[data-activity-response] [data-response-id]");
    if(field) updateField(field);
    const character = event.target.closest("[data-shakespeare-character-studio]");
    if(character) updateCharacterProgress(character);
  });
  document.addEventListener("click", function(event){
    const panelSelect = event.target.closest("[data-shakespeare-panel-select]");
    if(panelSelect){ event.preventDefault(); activateShakespearePanel(panelSelect); return; }
    const open = event.target.closest("[data-shakespeare-open-src]");
    if(open){ event.preventDefault(); openSource(open.getAttribute("data-shakespeare-open-src")); return; }
    const fullscreen = event.target.closest("[data-shakespeare-fullscreen-src]");
    if(fullscreen){ event.preventDefault(); openShakespeareReader(fullscreen); return; }
    const close = event.target.closest("[data-shakespeare-reader-close]");
    if(close){ event.preventDefault(); closeShakespeareReader(close); return; }
    const download = event.target.closest("[data-shakespeare-download-src]");
    if(download){ event.preventDefault(); downloadSource(download.getAttribute("data-shakespeare-download-src")); return; }
    const reset = event.target.closest("[data-shakespeare-character-reset]");
    if(reset){ event.preventDefault(); resetActiveCharacter(reset); return; }
    const match = event.target.closest("[data-shakespeare-match-term], [data-shakespeare-match-meaning]");
    if(match){ event.preventDefault(); chooseLanguageMatch(match); return; }
    const hints = event.target.closest("[data-worksheet-toggle-hints]");
    if(hints && hints.closest(".english-activity-page")){ event.preventDefault(); event.stopImmediatePropagation(); setHints(hints); return; }
    const print = event.target.closest("[data-worksheet-print]");
    if(print && print.closest(".english-activity-page")){ event.preventDefault(); event.stopImmediatePropagation(); printScope(print); }
  }, true);
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();`;

export const ENGLISH_ACTIVITY_PROFILE_CSS = `
.english-activity-page { border: 1px solid var(--surface-variant, #d9dadb); border-top: 4px solid #154212; border-radius: 8px; background: #fff; padding: 28px; }
.english-activity-page label { color: var(--on-surface, #191c1d); font-weight: 700; }
.english-activity-page input[type="text"],
.english-activity-page select,
.english-activity-page textarea { width: 100%; border: 1px solid #aeb8a7; border-radius: 6px; background: #fff; color: #20241f; padding: 11px 12px; font: inherit; }
.english-activity-page textarea { resize: vertical; }
.english-activity-page input:focus,
.english-activity-page select:focus,
.english-activity-page textarea:focus { border-color: #154212; outline: 3px solid rgba(21, 66, 18, .16); }
.english-activity-picker { display: grid; gap: 8px; margin: 22px 0; }
.english-activity-panel-stack { display: grid; gap: 20px; }
.english-activity-panel-stack > [hidden] { display: none !important; }
.english-activity-worksheet { border: 1px solid #d9dadb; border-radius: 8px; background: #fff; overflow: hidden; }
.english-activity-worksheet .worksheet-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid #e1e3e4; padding: 12px 16px; }
.english-activity-worksheet .worksheet-toolbar-actions,
.english-activity-final-actions,
.english-evidence-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.english-activity-page button,
.english-activity-page a { min-height: 40px; border: 1px solid #7d9272; border-radius: 6px; background: #fff; color: #24491f; padding: 8px 12px; font: inherit; font-weight: 700; text-decoration: none; cursor: pointer; }
.english-activity-page button:hover,
.english-activity-page a:hover { border-color: #154212; }
.english-activity-page button:focus-visible,
.english-activity-page a:focus-visible { outline: 2px solid rgba(21, 66, 18, .22); outline-offset: 2px; }
.english-activity-page button.evidence-bank-save-action { border-color: #154212; background: #154212; color: #fff; }
.english-activity-page button.evidence-bank-save-action:hover,
.english-activity-page button.evidence-bank-save-action:focus-visible { border-color: #2d5a27; background: #2d5a27; color: #fff; }
.worksheet-document-header,
.critical-writing-header,
.writing-activity-header { border-bottom: 1px solid #e1e3e4; padding: 22px; }
.worksheet-document-header h3,
.critical-writing-header h3,
.writing-activity-header h3 { margin: 4px 0 8px; }
.worksheet-progress { margin-top: 18px; }
.worksheet-progress > div:first-child { display: flex; justify-content: space-between; gap: 12px; }
.worksheet-progress-track { height: 8px; margin-top: 8px; border-radius: 4px; background: #e6e8e5; overflow: hidden; }
.worksheet-progress-track > div { width: 0; height: 100%; background: #154212; }
.worksheet-questions,
.critical-field-grid { display: grid; gap: 18px; padding: 22px; }
.worksheet-question,
.english-activity-field { display: grid; gap: 9px; border-bottom: 1px solid #e6e8e5; padding-bottom: 18px; }
.worksheet-question:last-child,
.english-activity-field:last-child { border-bottom: 0; }
.worksheet-question-prompt { display: grid; grid-template-columns: 32px minmax(0, 1fr); gap: 8px; }
.worksheet-question-prompt strong { color: #154212; }
.worksheet-answer-field { display: grid; gap: 6px; }
.worksheet-word-count { justify-self: end; color: #687064; font-size: 13px; font-weight: 400; }
.worksheet-hint { border-left: 3px solid #68845e; background: #f5f7f1; padding: 10px 12px; }
.english-activity-checkbox { display: flex; align-items: flex-start; gap: 10px; }
.english-activity-checkbox input { width: auto; margin-top: 3px; }
.english-activity-prompt { color: #5d6359; font-weight: 400; }
.english-activity-final-actions { border-top: 1px solid #e1e3e4; padding: 16px 22px; }
.english-evidence-capture { display: grid; gap: 16px; margin: 22px; border: 1px solid #b8c5af; border-radius: 8px; background: #f5f7f1; padding: 20px; }
.english-evidence-actions [data-save-status],
.english-activity-final-actions [data-response-collection-status] { color: #154212; font-size: 13px; font-weight: 700; }
.english-activity-hidden-select { position: absolute !important; width: 1px !important; height: 1px; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; }
.english-material-list { display: grid; gap: 12px; margin-top: 22px; }
.english-material-item,
.english-evidence-view { display: flex; align-items: center; justify-content: space-between; gap: 18px; border: 1px solid #d9dadb; border-radius: 8px; padding: 18px; }
.english-material-item h3,
.english-material-item p,
.english-evidence-view h3,
.english-evidence-view p { margin: 0; }
.english-material-item p,
.english-evidence-view p { margin-top: 5px; color: #5d6359; }
.english-material-access-note { border-left: 3px solid #7d9272; background: #f5f7f1; padding: 12px 14px; }
.parallel-reading-header { display: flex; justify-content: space-between; gap: 20px; border-bottom: 1px solid #d9dadb; padding: 20px 0; }
.parallel-reading-table { display: grid; border: 1px solid #d9dadb; }
.parallel-reading-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.parallel-reading-row > * { border-bottom: 1px solid #d9dadb; padding: 16px; }
.parallel-reading-row > * + * { border-left: 1px solid #d9dadb; }
.parallel-reading-label-row { background: #f3f4f5; }
.parallel-reading-note { color: #5d6359; }
.parallel-reading-focus { margin: 18px 0; border-left: 3px solid #154212; padding-left: 14px; }
.english-editorial-status { align-self: start; border: 1px solid #aeb8a7; border-radius: 6px; padding: 5px 8px; color: #42493e; font-size: 13px; font-weight: 700; }
.english-editorial-status[data-editorial-status="needs-editorial"] { border-color: #9a6c23; background: #fff8e8; color: #68450e; }
.english-activity-subheading { margin-top: 18px; }

/* Shakespeare activity profile: keep the Othello workbook hierarchy without leaking it into other profiles. */
.shakespeare-profile-page { --shakespeare-ink: #161a17; --shakespeare-green: #154212; --shakespeare-soft: #f8f9f6; --shakespeare-line: #d8dfd1; }
.shakespeare-profile-page [hidden],
.shakespeare-reader-overlay[hidden] { display: none !important; }
.shakespeare-profile-page .worksheet-document-header,
.shakespeare-profile-page .writing-activity-header {
  border-bottom: 0;
  background: var(--shakespeare-ink);
  color: #fff;
  padding: 26px 28px;
}
.shakespeare-profile-page .worksheet-document-header p {
  margin: 0 0 10px;
  color: #b9c3b2;
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 13px;
  font-weight: 700;
}
.shakespeare-profile-page .worksheet-document-header h3,
.shakespeare-profile-page .writing-activity-header h3 {
  margin: 0;
  color: #fff;
  font-family: "Hanken Grotesk", sans-serif;
  font-size: clamp(28px, 3.4vw, 44px);
  line-height: 1.06;
  font-weight: 800;
}
.shakespeare-profile-page .worksheet-document-header > span,
.shakespeare-profile-page .character-dossier-heading-copy > span,
.shakespeare-profile-page .writing-activity-header p {
  display: block;
  max-width: 780px;
  margin: 9px 0 0;
  color: #d7ddd4;
  font-size: 16px;
  line-height: 1.55;
}

/* Materials / document browser */
.shakespeare-materials-page .shakespeare-document-browser {
  display: grid;
  grid-template-columns: minmax(250px, 300px) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
  margin-top: 24px;
}
.shakespeare-materials-page .library-list-panel,
.shakespeare-materials-page .library-reader-panel {
  min-width: 0;
  border: 1px solid #e1e3e4;
  border-radius: 10px;
  background: #fff;
}
.shakespeare-materials-page .library-list-panel { padding: 18px; }
.shakespeare-materials-page .library-list-panel h3,
.shakespeare-materials-page .library-reader-header h3 {
  margin: 0 0 8px;
  color: #191c1d;
  font-family: "Hanken Grotesk", sans-serif;
  font-size: 24px;
  line-height: 1.2;
  font-weight: 800;
}
.shakespeare-materials-page .library-list-panel p,
.shakespeare-materials-page .library-reader-header p {
  margin: 0;
  color: #4d554a;
  font-size: 14px;
  line-height: 1.5;
}
.shakespeare-materials-page .library-doc-list { display: grid; gap: 10px; margin-top: 18px; }
.shakespeare-materials-page .library-doc-tab {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  width: 100%;
  min-height: 74px;
  border: 1px solid #e1e3e4;
  border-radius: 8px;
  background: #f8f9fa;
  color: #191c1d;
  padding: 12px;
  text-align: left;
}
.shakespeare-materials-page .library-doc-tab:hover,
.shakespeare-materials-page .library-doc-tab:focus-visible,
.shakespeare-materials-page .library-doc-tab.active {
  border-color: #2d5a27;
  background: #f3f7f1;
  color: #191c1d;
  outline: 2px solid rgba(21, 66, 18, .16);
  outline-offset: 1px;
}
.shakespeare-materials-page .library-doc-tab strong {
  display: block;
  overflow-wrap: anywhere;
  font-family: "Hanken Grotesk", sans-serif;
  font-size: 16px;
  line-height: 1.25;
}
.shakespeare-materials-page .library-doc-tab small { display: block; margin-top: 4px; color: #4d554a; font-size: 12px; line-height: 1.35; }
.shakespeare-materials-page .library-doc-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--shakespeare-green);
  color: #fff;
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 13px;
  font-weight: 700;
}
.shakespeare-materials-page .library-reader-panel { padding: 18px; }
.shakespeare-materials-page .library-reader-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 16px;
}
.shakespeare-materials-page .library-reader-header > div:first-child { min-width: 0; }
.shakespeare-materials-page .library-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
.shakespeare-materials-page .library-action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border-color: var(--shakespeare-green);
  border-radius: 8px;
  background: var(--shakespeare-green);
  color: #fff;
  padding: 9px 14px;
  font: 700 14px/1.2 "IBM Plex Sans", sans-serif;
}
.shakespeare-materials-page .library-action-button:hover,
.shakespeare-materials-page .library-action-button:focus-visible { border-color: #2d5a27; background: #2d5a27; color: #fff; outline: none; }
.shakespeare-materials-page .library-document-frame {
  display: block;
  width: 100%;
  height: min(68vh, 680px);
  min-height: 520px;
  border: 1px solid #d9dadb;
  border-radius: 8px;
  background: #fff;
}
.shakespeare-materials-page .library-file-fallback,
.shakespeare-materials-page .english-material-access-note { margin: 0; border-radius: 8px; padding: 22px; }
.shakespeare-materials-page .library-file-fallback { display: grid; gap: 14px; border: 1px solid var(--shakespeare-line); background: var(--shakespeare-soft); }
.shakespeare-materials-page .library-file-fallback p { margin: 0; color: #4d554a; }
.shakespeare-materials-page .library-file-fallback a { width: fit-content; }
html.has-shakespeare-reader-open { overflow: hidden; }
.shakespeare-reader-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(17, 21, 18, .82);
  padding: 24px;
}
.shakespeare-reader-dialog {
  width: min(1500px, 100%);
  height: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  margin: 0 auto;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 24px 70px rgba(0, 0, 0, .35);
  overflow: hidden;
}
.shakespeare-reader-bar { display: flex; align-items: center; justify-content: space-between; gap: 20px; border-bottom: 1px solid #cbd4c5; padding: 12px 18px; }
.shakespeare-reader-bar h3 { min-width: 0; margin: 0; overflow-wrap: anywhere; font-family: "Hanken Grotesk", sans-serif; font-size: 20px; }
.shakespeare-reader-bar button { min-width: 44px; padding: 8px 10px; }
.shakespeare-reader-frame { width: 100%; height: 100%; border: 0; background: #fff; }

/* Act questions / scene checkpoint workbook */
.shakespeare-workbench-picker {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  gap: 18px;
  align-items: end;
  margin: 24px 0 18px;
  border: 1px solid var(--shakespeare-line);
  border-radius: 10px;
  background: var(--shakespeare-soft);
  padding: 18px 20px;
}
.shakespeare-workbench-picker > div:first-child { display: grid; gap: 7px; }
.shakespeare-workbench-picker > div:first-child strong { color: var(--shakespeare-green); font-family: "IBM Plex Sans", sans-serif; font-size: 13px; }
.shakespeare-workbench-picker > div:first-child p { margin: 0; color: #4d554a; line-height: 1.55; }
.shakespeare-workbench-picker .english-activity-picker { margin: 0; }
.shakespeare-questions-page .shakespeare-question-workbench { margin-top: 0; border-radius: 10px; }
.shakespeare-questions-page .worksheet-toolbar { margin: 0; padding: 12px 16px; background: #fff; }
.shakespeare-questions-page .scene-checkpoint-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 18px; }
.shakespeare-questions-page .scene-checkpoint-heading > div { min-width: 0; }
.shakespeare-questions-page .scene-checkpoint-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  border: 1px solid rgba(215, 221, 212, .24);
  border-radius: 999px;
  color: #d7ddd4;
  padding: 0 14px;
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}
.shakespeare-questions-page .scene-checkpoint-body { display: grid; gap: 20px; padding: 26px 28px 28px; background: #fff; }
.shakespeare-questions-page .scene-checkpoint-body > .english-activity-picker { max-width: 560px; margin: 0; color: var(--shakespeare-green); font-family: "IBM Plex Sans", sans-serif; font-size: 13px; }
.shakespeare-questions-page .scene-checkpoint-list,
.shakespeare-questions-page .scene-checkpoint-card { display: grid; gap: 24px; }
.shakespeare-questions-page .scene-checkpoint-title { display: grid; gap: 7px; border-bottom: 1px solid #e6e8e5; padding-bottom: 16px; }
.shakespeare-questions-page .scene-checkpoint-title p { margin: 0; color: var(--shakespeare-green); font: 700 12px/1.3 "IBM Plex Sans", sans-serif; text-transform: uppercase; letter-spacing: .03em; }
.shakespeare-questions-page .scene-checkpoint-title h4,
.shakespeare-questions-page .scene-supplied-questions h5 { margin: 0; color: #191c1d; font-family: "Hanken Grotesk", sans-serif; font-size: 26px; line-height: 1.15; font-weight: 800; }
.shakespeare-questions-page .scene-checkpoint-title span { color: #4d554a; line-height: 1.55; }
.shakespeare-questions-page .scene-key-quote {
  display: grid;
  gap: 6px;
  margin: 0 0 0 44px;
  border-left: 3px solid var(--shakespeare-green);
  border-radius: 0 10px 10px 0;
  background: #f5f7f2;
  color: #31372f;
  padding: 16px 18px;
}
.shakespeare-questions-page .scene-key-quote span { color: var(--shakespeare-green); font: 700 12px/1.3 "IBM Plex Sans", sans-serif; text-transform: uppercase; }
.shakespeare-questions-page .scene-key-quote p { margin: 0; font-family: "Hanken Grotesk", sans-serif; font-size: 22px; line-height: 1.4; font-style: italic; font-weight: 700; }
.shakespeare-questions-page .scene-supplied-questions { display: grid; gap: 18px; }
.shakespeare-questions-page .shakespeare-scene-question-grid { display: grid; gap: 22px; }
.shakespeare-questions-page .scene-checkpoint-two-column { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; align-items: start; }
.shakespeare-questions-page .scene-checkpoint-card > .worksheet-question,
.shakespeare-questions-page .shakespeare-scene-question-grid > .worksheet-question,
.shakespeare-questions-page .scene-checkpoint-two-column > .worksheet-question { margin: 0; }
.shakespeare-questions-page .worksheet-question-prompt { margin-bottom: 2px; font-size: 16px; line-height: 1.55; }
.shakespeare-questions-page .worksheet-answer-field { margin-left: 40px; }
.shakespeare-questions-page .worksheet-hint { margin-left: 40px; border-radius: 8px; }
.shakespeare-questions-page .scene-evidence-capture { margin: 0; background: #f5f7f1; }
.shakespeare-questions-page .english-activity-final-actions { background: #fff; }

/* Character dossier */
.shakespeare-character-page .character-dossier-studio {
  margin-top: 24px;
  --character-accent: #2d5b4f;
  --character-accent-rgb: 45, 91, 79;
  --character-accent-soft: rgba(var(--character-accent-rgb), .08);
  --character-accent-medium: rgba(var(--character-accent-rgb), .18);
  --character-accent-strong: rgba(var(--character-accent-rgb), .3);
  --character-accent-fade: rgba(var(--character-accent-rgb), .86);
}
.shakespeare-character-page .character-dossier-shell { display: grid; grid-template-columns: minmax(240px, 272px) minmax(0, 1fr); gap: 20px; align-items: start; }
.shakespeare-character-page .character-dossier-nav {
  display: grid;
  gap: 18px;
  border: 1px solid var(--character-accent-strong);
  border-radius: 10px;
  background: linear-gradient(155deg, var(--character-accent-fade), #161a17 84%);
  color: #f6f7f5;
  padding: 18px;
  box-shadow: 0 8px 28px rgba(var(--character-accent-rgb), .12);
}
.shakespeare-character-page .character-dossier-nav-copy { display: grid; gap: 8px; }
.shakespeare-character-page .character-dossier-nav-copy h3 { margin: 0; font-family: "Hanken Grotesk", sans-serif; font-size: 24px; line-height: 1.1; font-weight: 800; }
.shakespeare-character-page .character-dossier-nav-copy p { margin: 0; color: rgba(255, 255, 255, .82); line-height: 1.55; }
.shakespeare-character-page .character-dossier-nav-list,
.shakespeare-character-page .character-dossier-nav-actions { display: grid; gap: 10px; }
.shakespeare-character-page .character-dossier-target {
  display: grid;
  gap: 10px;
  width: 100%;
  border: 1px solid rgba(var(--character-accent-rgb), .22);
  border-radius: 10px;
  background: rgba(var(--character-accent-rgb), .12);
  color: #f6f7f5;
  padding: 14px;
  text-align: left;
}
.shakespeare-character-page .character-dossier-target:hover,
.shakespeare-character-page .character-dossier-target:focus-visible { border-color: rgba(var(--character-accent-rgb), .42); background: rgba(var(--character-accent-rgb), .2); color: #fff; outline: none; }
.shakespeare-character-page .character-dossier-target.active { border-color: var(--character-accent); background: rgba(var(--character-accent-rgb), .28); box-shadow: inset 0 0 0 1px var(--character-accent-strong); }
.shakespeare-character-page .character-dossier-target-copy { display: grid; gap: 4px; }
.shakespeare-character-page .character-dossier-target-copy strong { font: 700 14px/1.35 "IBM Plex Sans", sans-serif; }
.shakespeare-character-page .character-dossier-target-copy span { color: rgba(255, 255, 255, .78); font-size: 13px; }
.shakespeare-character-page .character-dossier-target-meter { height: 6px; border-radius: 999px; background: rgba(255, 255, 255, .14); overflow: hidden; }
.shakespeare-character-page .character-dossier-target-meter div { width: 0; height: 100%; border-radius: inherit; background: #a8d69e; transition: width 180ms ease; }
.shakespeare-character-page .character-dossier-nav-actions button { width: 100%; border-color: var(--character-accent-medium); color: var(--character-accent); }
.shakespeare-character-page .character-dossier-nav-actions button:hover,
.shakespeare-character-page .character-dossier-nav-actions button:focus-visible { border-color: var(--character-accent); background: rgba(255, 255, 255, .92); color: var(--character-accent); }
.shakespeare-character-page .character-dossier-nav-actions .is-secondary { border-color: rgba(255, 255, 255, .24); background: rgba(255, 255, 255, .06); color: #f6f7f5; }
.shakespeare-character-page .character-dossier-shell > .english-activity-panel-stack { min-width: 0; }
.shakespeare-character-page .character-dossier-document { border-color: var(--character-accent-medium); box-shadow: 0 8px 28px rgba(var(--character-accent-rgb), .08); }
.shakespeare-character-page .character-dossier-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; background: linear-gradient(135deg, var(--character-accent-fade), #161a17 82%); }
.shakespeare-character-page .character-dossier-heading-copy { min-width: 0; }
.shakespeare-character-page .character-dossier-progress-badge {
  display: inline-grid;
  justify-items: center;
  gap: 4px;
  min-width: 92px;
  border: 1px solid var(--character-accent-strong);
  border-radius: 10px;
  background: rgba(255, 255, 255, .07);
  padding: 10px 14px;
}
.shakespeare-character-page .character-dossier-progress-badge strong { color: #fff; font-family: "Hanken Grotesk", sans-serif; font-size: 24px; line-height: 1; font-weight: 800; }
.shakespeare-character-page .character-dossier-progress-badge span { color: #d7ddd4; font: 700 12px/1.2 "IBM Plex Sans", sans-serif; text-transform: uppercase; letter-spacing: .02em; }
.shakespeare-character-page .character-dossier-body { display: grid; gap: 18px; padding: 26px 28px 28px; background: #fff; }
.shakespeare-character-page .character-dossier-grid,
.shakespeare-character-page .character-dossier-quote-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; align-items: start; }
.shakespeare-character-page .character-dossier-card,
.shakespeare-character-page .character-dossier-focus {
  border: 1px solid var(--character-accent-medium);
  border-radius: 10px;
  background: linear-gradient(180deg, var(--character-accent-soft), #f8f9f6 76%);
  padding: 18px 20px;
}
.shakespeare-character-page .character-dossier-field { display: grid; gap: 8px; }
.shakespeare-character-page .character-dossier-field > span { color: var(--character-accent); font: 700 13px/1.4 "IBM Plex Sans", sans-serif; }
.shakespeare-character-page .character-dossier-field > small { margin: 0; color: #5d6359; font-size: 14px; line-height: 1.5; }
.shakespeare-character-page .character-dossier-field input,
.shakespeare-character-page .character-dossier-field select,
.shakespeare-character-page .character-dossier-field textarea { border-color: #c5c9c1; border-radius: 8px; background: #fff; }
.shakespeare-character-page .character-dossier-field textarea { min-height: 132px; background: #f8f9fa; }
.shakespeare-character-page .character-dossier-field input:focus,
.shakespeare-character-page .character-dossier-field select:focus,
.shakespeare-character-page .character-dossier-field textarea:focus { border-color: var(--character-accent); outline: 2px solid var(--character-accent-medium); background: #fff; }
.shakespeare-character-page .character-dossier-focus { background: linear-gradient(145deg, var(--character-accent-fade), #161a17 92%); color: #fff; }
.shakespeare-character-page .character-dossier-focus .character-dossier-field > span,
.shakespeare-character-page .character-dossier-focus .character-dossier-field > small { color: #d7ddd4; }
.shakespeare-character-page .character-dossier-focus textarea { border-color: rgba(255, 255, 255, .18); background: #222822; color: #fff; }
.shakespeare-character-page .character-dossier-section { display: grid; gap: 16px; margin: 0; background: linear-gradient(180deg, var(--character-accent-soft), #f8f9f6 76%); }
.shakespeare-character-page .character-dossier-section-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.shakespeare-character-page .character-dossier-section-heading h4 { margin: 0; color: var(--character-accent); font-family: "Hanken Grotesk", sans-serif; font-size: 24px; font-weight: 800; }
.shakespeare-character-page .character-dossier-section-heading p { margin: 5px 0 0; color: #5d6359; line-height: 1.5; }
.shakespeare-character-page .character-dossier-section .english-evidence-actions { margin-top: 2px; }
.shakespeare-character-page .english-activity-final-actions { background: #fff; }

/* Writing Studio and language lab */
.shakespeare-writing-page .shakespeare-writing-panel-stack { max-width: 1040px; }
.shakespeare-writing-page .shakespeare-assignment-panel { border-radius: 10px; }
.shakespeare-writing-page .shakespeare-assignment-header { padding: 24px 28px; }
.shakespeare-writing-page .shakespeare-assignment-header h3 { font-size: clamp(28px, 3vw, 40px); }
.shakespeare-writing-page .shakespeare-assignment-body { display: grid; gap: 18px; padding: 24px 28px 28px; }
.shakespeare-writing-page .shakespeare-writing-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 0; }
.shakespeare-writing-page .shakespeare-writing-grid .english-activity-field {
  min-width: 0;
  border: 1px solid var(--shakespeare-line);
  border-radius: 10px;
  background: var(--shakespeare-soft);
  padding: 18px 20px;
}
.shakespeare-writing-page .shakespeare-writing-grid .worksheet-answer-field > span:first-child { color: var(--shakespeare-green); font: 700 13px/1.4 "IBM Plex Sans", sans-serif; }
.shakespeare-writing-page .shakespeare-language-lab { display: grid; gap: 20px; }
.shakespeare-writing-page .shakespeare-language-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 260px);
  gap: 18px;
  align-items: start;
}
.shakespeare-writing-page .shakespeare-language-toolbar > div:first-child { display: grid; gap: 7px; }
.shakespeare-writing-page .shakespeare-language-toolbar > div:first-child > span,
.shakespeare-writing-page .shakespeare-match-label,
.shakespeare-writing-page .shakespeare-fluency-score > span { color: var(--shakespeare-green); font: 700 12px/1.3 "IBM Plex Sans", sans-serif; text-transform: uppercase; letter-spacing: .03em; }
.shakespeare-writing-page .shakespeare-language-toolbar h4,
.shakespeare-writing-page .shakespeare-translation-practice h4 { margin: 0; color: #191c1d; font-family: "Hanken Grotesk", sans-serif; font-size: 26px; line-height: 1.15; font-weight: 800; }
.shakespeare-writing-page .shakespeare-language-toolbar p,
.shakespeare-writing-page .shakespeare-translation-practice p { margin: 0; color: #4d554a; line-height: 1.55; }
.shakespeare-writing-page .shakespeare-fluency-score { display: grid; gap: 8px; border: 1px solid var(--shakespeare-line); border-radius: 10px; background: var(--shakespeare-soft); padding: 16px 18px; }
.shakespeare-writing-page .shakespeare-fluency-score strong { color: #191c1d; font-family: "Hanken Grotesk", sans-serif; font-size: 28px; line-height: 1; font-weight: 800; }
.shakespeare-writing-page .shakespeare-fluency-score > div { height: 8px; border-radius: 999px; background: #dde4d7; overflow: hidden; }
.shakespeare-writing-page .shakespeare-fluency-score > div > span { display: block; width: 0; height: 100%; border-radius: inherit; background: var(--shakespeare-green); transition: width 180ms ease; }
.shakespeare-writing-page .shakespeare-match-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.shakespeare-writing-page .shakespeare-match-grid > section { display: grid; gap: 10px; align-content: start; border: 1px solid var(--shakespeare-line); border-radius: 10px; background: var(--shakespeare-soft); padding: 18px 20px; }
.shakespeare-writing-page .shakespeare-match-label { display: block; margin-bottom: 2px; }
.shakespeare-writing-page .shakespeare-match-grid button { width: 100%; min-height: 46px; border-color: #d2d9cb; border-radius: 8px; background: #fff; color: #222723; padding: 11px 14px; text-align: left; transition: border-color 140ms ease, background-color 140ms ease, color 140ms ease; }
.shakespeare-writing-page .shakespeare-match-grid button:hover,
.shakespeare-writing-page .shakespeare-match-grid button:focus-visible { border-color: var(--shakespeare-green); color: var(--shakespeare-green); }
.shakespeare-writing-page .shakespeare-match-grid button.is-selected { border-color: var(--shakespeare-green); background: #eef5ea; color: var(--shakespeare-green); box-shadow: inset 0 0 0 1px var(--shakespeare-green); }
.shakespeare-writing-page .shakespeare-match-grid button.is-matched { border-color: #7eab73; background: #eaf3e4; color: #0d4f12; }
.shakespeare-writing-page .shakespeare-match-status { margin: 0; border-left: 3px solid var(--shakespeare-green); border-radius: 0 8px 8px 0; background: #f5f7f2; color: #31372f; padding: 12px 14px; }
.shakespeare-writing-page .shakespeare-translation-practice { display: grid; gap: 18px; border-top: 1px solid #e1e3e4; padding-top: 22px; }
.shakespeare-writing-page .shakespeare-translation-practice > div:first-child { display: grid; gap: 7px; }
.shakespeare-writing-page .shakespeare-translation-practice .critical-field-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 0; }
.shakespeare-writing-page .shakespeare-translation-practice .english-activity-field { border: 1px solid var(--shakespeare-line); border-radius: 10px; background: var(--shakespeare-soft); padding: 18px 20px; }
.shakespeare-writing-page .english-activity-final-actions { background: #fff; }

@media (max-width: 1100px) {
  .shakespeare-character-page .character-dossier-shell { grid-template-columns: 1fr; }
  .shakespeare-character-page .character-dossier-nav-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 900px) {
  .shakespeare-materials-page .shakespeare-document-browser,
  .shakespeare-workbench-picker { grid-template-columns: 1fr; }
  .shakespeare-materials-page .library-doc-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .shakespeare-questions-page .scene-checkpoint-heading { flex-direction: column; }
  .shakespeare-questions-page .scene-checkpoint-two-column,
  .shakespeare-writing-page .shakespeare-writing-grid,
  .shakespeare-writing-page .shakespeare-language-toolbar,
  .shakespeare-writing-page .shakespeare-match-grid,
  .shakespeare-writing-page .shakespeare-translation-practice .critical-field-grid { grid-template-columns: 1fr; }
}
@media (max-width: 760px) {
  .english-activity-page { padding: 20px; }
  .english-activity-worksheet .worksheet-toolbar,
  .parallel-reading-header,
  .english-material-item,
  .english-evidence-view { align-items: stretch; flex-direction: column; }
  .worksheet-toolbar-actions { width: 100%; }
  .worksheet-toolbar-actions button { flex: 1 1 180px; }
  .parallel-reading-row { grid-template-columns: 1fr; }
  .parallel-reading-row > * + * { border-left: 0; }
  .shakespeare-materials-page .library-doc-list,
  .shakespeare-character-page .character-dossier-nav-list,
  .shakespeare-character-page .character-dossier-grid,
  .shakespeare-character-page .character-dossier-quote-grid { grid-template-columns: 1fr; }
  .shakespeare-materials-page .library-reader-header,
  .shakespeare-character-page .character-dossier-heading,
  .shakespeare-character-page .character-dossier-section-heading { flex-direction: column; }
  .shakespeare-materials-page .library-actions { width: 100%; justify-content: flex-start; }
  .shakespeare-materials-page .library-action-button { flex: 1 1 140px; }
  .shakespeare-materials-page .library-document-frame { min-height: 390px; height: 58vh; }
  .shakespeare-reader-overlay { padding: 8px; }
  .shakespeare-reader-bar { align-items: flex-start; }
  .shakespeare-questions-page .scene-checkpoint-body,
  .shakespeare-character-page .character-dossier-body,
  .shakespeare-writing-page .shakespeare-assignment-body { padding: 22px 20px 24px; }
  .shakespeare-questions-page .scene-key-quote,
  .shakespeare-questions-page .worksheet-answer-field,
  .shakespeare-questions-page .worksheet-hint { margin-left: 0; }
}
@media print {
  .english-activity-page button,
  .english-activity-page .english-activity-picker,
  .english-activity-page .english-evidence-view { display: none !important; }
  .english-activity-page,
  .english-activity-worksheet { border: 0; padding: 0; }
  .shakespeare-reader-overlay,
  .shakespeare-materials-page .library-list-panel,
  .shakespeare-materials-page .library-actions,
  .shakespeare-profile-page .shakespeare-workbench-picker,
  .shakespeare-profile-page .worksheet-toolbar,
  .shakespeare-profile-page .english-activity-final-actions,
  .shakespeare-profile-page .scene-evidence-capture,
  .shakespeare-character-page .character-dossier-nav { display: none !important; }
  .shakespeare-materials-page .shakespeare-document-browser,
  .shakespeare-character-page .character-dossier-shell { display: block; }
  .shakespeare-profile-page .worksheet-document-header,
  .shakespeare-profile-page .writing-activity-header,
  .shakespeare-character-page .character-dossier-focus { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .shakespeare-writing-page .shakespeare-assignment-body,
  .shakespeare-character-page .character-dossier-body,
  .shakespeare-questions-page .scene-checkpoint-body { padding: 18px 0; }
}`;
