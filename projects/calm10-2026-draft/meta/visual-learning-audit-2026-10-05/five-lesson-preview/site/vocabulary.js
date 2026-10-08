(() => {
  "use strict";

  const storageKey = "calm10-style-c-five-review-2026-10-06:vocabulary:v1";
  const views = [...document.querySelectorAll("[data-word-view]")];
  const indexButtons = [...document.querySelectorAll("[data-select-word]")];
  const fieldNames = ["explanation", "features", "example", "nonexample"];
  const fields = Object.fromEntries(fieldNames.map(name => [name, document.querySelector(`[data-vocab-field="${name}"]`)]));
  const status = document.getElementById("vocab-status");
  const dialog = document.querySelector(".vocab-dialog");
  const wordIds = new Set(views.map(view => view.dataset.wordView));
  let selected = views[0]?.dataset.wordView || "";
  let drafts = {};
  let pendingSave = null;
  let conflict = false;
  let lastSaved = "";
  let previousFocus = null;
  let builderLoan = null;
  let pageScroll = [0, 0];
  let oldOverflow = "";

  function setStatus(message) { if (status) status.textContent = message; }
  function currentValues() {
    return Object.fromEntries(fieldNames.map(name => [name, fields[name]?.value || ""]));
  }
  function capture() {
    if (selected) {
      const values = currentValues();
      if (Object.values(values).some(value => value.trim())) drafts[selected] = values;
      else delete drafts[selected];
    }
  }
  function save() {
    if (pendingSave) clearTimeout(pendingSave);
    pendingSave = null;
    capture();
    if (conflict) { setStatus("Saving paused: vocabulary changed in another tab. Download a copy before reloading."); return; }
    const payload = JSON.stringify({ schemaVersion: 1, course: "calm10-style-c-five-review-2026-10-06", drafts });
    if (payload.length > 300000) { setStatus("Too much vocabulary work to save. Download a copy and shorten some entries."); return; }
    try { localStorage.setItem(storageKey, payload); lastSaved = payload; setStatus("Vocabulary saved in this browser"); }
    catch { setStatus("Vocabulary could not be saved here. Download a copy."); }
  }
  function scheduleSave() {
    setStatus("Saving vocabulary…");
    if (pendingSave) clearTimeout(pendingSave);
    pendingSave = setTimeout(save, 350);
  }
  function selectWord(id, focus) {
    if (!wordIds.has(id)) return;
    if (selected && selected !== id && (pendingSave || Object.values(currentValues()).some(value => value.trim()))) save();
    selected = id;
    const view = views.find(item => item.dataset.wordView === id);
    views.forEach(item => { item.hidden = item !== view; });
    indexButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.selectWord === id)));
    document.querySelector("[data-current-word]").textContent = view.querySelector("h2").textContent;
    fieldNames.forEach(name => { fields[name].value = typeof drafts[id]?.[name] === "string" ? drafts[id][name] : ""; });
    if (focus) {
      const heading = view.querySelector("h2");
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: "start" });
    }
  }
  function loanBuilder() {
    const builder = document.querySelector("#core-vocabulary .vocab-builder");
    const slot = dialog?.querySelector("[data-vocab-builder-slot]");
    if (!builder || !slot || builderLoan) return;
    const marker = document.createComment("Vocabulary builder home");
    builder.before(marker);
    slot.append(builder);
    builderLoan = { builder, marker };
  }
  function restoreBuilder() {
    if (!builderLoan) return;
    builderLoan.marker.replaceWith(builderLoan.builder);
    builderLoan = null;
  }
  function openDialog(id, source) {
    const view = views.find(item => item.dataset.wordView === id);
    if (!view || !dialog) return;
    selectWord(id, false);
    previousFocus = source;
    dialog.dataset.wordId = id;
    dialog.querySelector("#vocab-dialog-title").textContent = view.querySelector("h2").textContent;
    dialog.querySelector(".vocab-dialog-category").textContent = view.querySelector(":scope > .section-label")?.textContent || "";
    const paragraphs = view.querySelectorAll(":scope > section > p");
    dialog.querySelector(".vocab-dialog-meaning").textContent = paragraphs[0]?.textContent || "";
    dialog.querySelector(".vocab-dialog-example").textContent = paragraphs[1]?.textContent || "";
    dialog.querySelector(".vocab-dialog-confusion").textContent = paragraphs[2]?.textContent || "";
    dialog.querySelector(".vocab-dialog-builder").open = false;
    pageScroll = [window.scrollX, window.scrollY];
    oldOverflow = document.documentElement.style.overflow;
    loanBuilder();
    dialog.showModal();
    document.documentElement.style.overflow = "hidden";
    dialog.querySelector("[data-close-vocab]").focus();
  }
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.schemaVersion === 1 && parsed.course === "calm10-style-c-five-review-2026-10-06" && parsed.drafts && typeof parsed.drafts === "object") {
        drafts = parsed.drafts;
        lastSaved = raw;
        setStatus("Vocabulary restored from this browser");
      }
    }
  } catch { setStatus("Vocabulary could not be restored. Download a copy of any new work."); }
  indexButtons.forEach(button => button.addEventListener("click", () => selectWord(button.dataset.selectWord, true)));
  fieldNames.forEach(name => fields[name]?.addEventListener("input", scheduleSave));
  document.getElementById("save-vocab-practice")?.addEventListener("click", save);
  document.getElementById("download-vocab-practice")?.addEventListener("click", () => {
    capture();
    const payload = JSON.stringify({ schemaVersion: 1, course: "calm10-style-c-five-review-2026-10-06", exportedAt: new Date().toISOString(), drafts }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "CALM_10_Vocabulary_Work.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    setStatus("Vocabulary copy downloaded");
  });
  document.getElementById("restore-vocab-practice")?.addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 350000) throw new Error("size");
      const parsed = JSON.parse(await file.text());
      if (parsed.schemaVersion !== 1 || parsed.course !== "calm10-style-c-five-review-2026-10-06" || !parsed.drafts || typeof parsed.drafts !== "object" || Array.isArray(parsed.drafts)) throw new Error("format");
      for (const [id, record] of Object.entries(parsed.drafts)) {
        if (!wordIds.has(id) || !record || typeof record !== "object" || Array.isArray(record)) throw new Error("word");
        if (Object.entries(record).some(([name, value]) => !fieldNames.includes(name) || typeof value !== "string" || value.length > 1000)) throw new Error("field");
      }
      if (Object.keys(drafts).length && !window.confirm("Replace the vocabulary work in this browser with the selected copy? Download the current work first if needed.")) return;
      drafts = parsed.drafts;
      conflict = false;
      selected = "";
      selectWord(views[0].dataset.wordView, false);
      save();
      setStatus("Vocabulary copy restored in this browser");
    } catch { setStatus("That file is not a valid CALM vocabulary copy."); }
    finally { event.target.value = ""; }
  });
  document.addEventListener("click", event => {
    const term = event.target.closest(".vocab-term");
    if (term) { openDialog(term.dataset.vocabTerm, term); return; }
    const caseLink = event.target.closest('a[href$="-case-file"]');
    if (caseLink) {
      const target = document.getElementById(caseLink.getAttribute("href").slice(1));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    }
  });
  dialog?.querySelector("[data-close-vocab]")?.addEventListener("click", () => dialog.close());
  dialog?.addEventListener("close", () => {
    restoreBuilder();
    document.documentElement.style.overflow = oldOverflow;
    window.scrollTo(...pageScroll);
    previousFocus?.focus({ preventScroll: true });
  });
  dialog?.querySelector("[data-open-vocab-reader]")?.addEventListener("click", () => {
    const id = dialog.dataset.wordId;
    previousFocus = null;
    dialog.close();
    location.hash = "core-vocabulary";
    requestAnimationFrame(() => selectWord(id, true));
  });
  window.addEventListener("hashchange", () => { if (dialog?.open) dialog.close(); });
  window.addEventListener("storage", event => {
    if (event.key === storageKey && event.newValue !== lastSaved) {
      conflict = true;
      setStatus("Saving paused: vocabulary changed in another tab. Download a copy before reloading.");
    }
  });
  window.addEventListener("pagehide", () => { if (pendingSave) save(); });
  selectWord(selected, false);
})();
