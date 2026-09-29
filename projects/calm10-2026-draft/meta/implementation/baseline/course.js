(() => {
  "use strict";
  const storageKey = "calm10-2026-draft:learning:v3";
  const legacyStorageKeys = ["calm10-2026-draft:portfolio:v2", "calm10-2026-draft:portfolio:v1"];
  const fields = [...document.querySelectorAll("[data-save-key]")];
  const responseFields = fields.filter(field => field.matches("[data-lesson-evidence]"));
  const fieldKeys = new Set(fields.map(field => field.dataset.saveKey));
  const versionedFields = fields.filter(field => field.dataset.taskVersion);
  const status = document.getElementById("save-status");
  const maxStoredCharacters = 120000;
  const lessonCount = document.querySelectorAll("article[data-lesson-id]").length;
  const pages = [...document.querySelectorAll(".course-page")];
  const pageIds = new Set(pages.map(page => page.id));
  const menuButton = document.querySelector("[data-menu-button]");
  const menuScrim = document.querySelector("[data-menu-scrim]");
  const mobileNavigation = window.matchMedia("(max-width: 760px)");
  function updateMenuButton() {
    if (!menuButton) return;
    const open = mobileNavigation.matches
      ? document.body.classList.contains("nav-open")
      : !document.body.classList.contains("nav-collapsed");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", `${open ? "Collapse" : "Open"} course navigation`);
    menuButton.textContent = open ? (mobileNavigation.matches ? "×" : "←") : "☰";
  }
  function closeMenu() {
    document.body.classList.remove("nav-open");
    if (menuScrim) menuScrim.hidden = true;
    updateMenuButton();
  }
  function showPage() {
    const wanted = decodeURIComponent(location.hash.slice(1));
    const id = pageIds.has(wanted) ? wanted : "overview";
    pages.forEach(page => { page.hidden = page.id !== id; });
    document.querySelectorAll("[data-page-target]").forEach(link => {
      const active = link.dataset.pageTarget === id;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
      if (active) link.closest(".nav-group")?.setAttribute("open", "");
    });
    closeMenu();
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
    setTimeout(() => window.scrollTo(0, 0), 80);
  }
  menuButton?.addEventListener("click", () => {
    if (mobileNavigation.matches) {
      const open = document.body.classList.toggle("nav-open");
      if (menuScrim) menuScrim.hidden = !open;
    } else {
      document.body.classList.toggle("nav-collapsed");
    }
    updateMenuButton();
  });
  menuScrim?.addEventListener("click", closeMenu);
  window.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
  mobileNavigation.addEventListener("change", closeMenu);
  window.addEventListener("hashchange", showPage);
  showPage();
  let pendingSave = null;
  let lastSaved = "";
  let conflicted = false;
  let taskVersions = {};
  let responseHistory = {};
  let preservedResponses = {};
  function setStatus(message) { if (status) status.textContent = message; }
  function collect() { return { ...preservedResponses, ...Object.fromEntries(fields.map(field => [field.dataset.saveKey, field.value])) }; }
  function currentTaskVersions() {
    return Object.fromEntries(versionedFields.map(field => [field.dataset.saveKey, field.dataset.taskVersion]));
  }
  function addHistory(key, version, value) {
    if (!value) return;
    const entries = Array.isArray(responseHistory[key]) ? responseHistory[key] : [];
    if (!entries.some(entry => entry?.version === version && entry?.value === value)) {
      entries.push({ version, value, retainedAt: new Date().toISOString() });
    }
    responseHistory[key] = entries.slice(-5);
  }
  function renderHistory(field) {
    const key = field.dataset.saveKey;
    const entries = responseHistory[key];
    const existing = document.querySelector(`[data-task-history="${CSS.escape(key)}"]`);
    existing?.remove();
    if (!Array.isArray(entries) || !entries.length) return;
    const details = document.createElement("details");
    details.className = "task-history";
    details.dataset.taskHistory = key;
    const summary = document.createElement("summary");
    summary.textContent = `Previous response retained (${entries.length})`;
    details.append(summary);
    entries.forEach(entry => {
      const heading = document.createElement("strong");
      heading.textContent = `Earlier task version: ${entry.version || "pre-repair"}`;
      const value = document.createElement("pre");
      value.textContent = entry.value;
      details.append(heading, value);
    });
    if (field.matches("textarea")) field.before(details);
    else field.closest("fieldset")?.after(details);
  }
  function hydrate(responses, savedVersions = {}, savedHistory = {}) {
    preservedResponses = Object.fromEntries(Object.entries(responses).filter(([key, value]) => !fieldKeys.has(key) && typeof value === "string"));
    responseHistory = savedHistory && typeof savedHistory === "object" && !Array.isArray(savedHistory) ? JSON.parse(JSON.stringify(savedHistory)) : {};
    taskVersions = savedVersions && typeof savedVersions === "object" && !Array.isArray(savedVersions) ? { ...savedVersions } : {};
    fields.forEach(field => {
      const key = field.dataset.saveKey;
      const value = responses[key];
      if (typeof value !== "string") return;
      const currentVersion = field.dataset.taskVersion;
      const savedVersion = taskVersions[key];
      if (currentVersion && savedVersion !== currentVersion && value) {
        addHistory(key, savedVersion || "pre-2026-09-25-repair", value);
        field.value = "";
      } else {
        field.value = field.maxLength > 0 ? value.slice(0, field.maxLength) : value;
      }
      if (currentVersion) taskVersions[key] = currentVersion;
      renderHistory(field);
    });
  }
  function updateProgress() {
    const drafted = responseFields.filter(field => field.dataset.saveKey !== "final" && field.value.trim()).length;
    const label = document.getElementById("response-progress");
    const bar = document.getElementById("response-progress-fill");
    if (label) label.textContent = `${drafted} of ${lessonCount} drafted`;
    if (bar) bar.style.width = `${Math.round(drafted / lessonCount * 100)}%`;
  }
  function save() {
    if (pendingSave) clearTimeout(pendingSave);
    pendingSave = null;
    if (conflicted) { setStatus("Saving paused: another tab changed this draft. Download a backup before reloading."); return false; }
    taskVersions = { ...taskVersions, ...currentTaskVersions() };
    const payload = JSON.stringify({ schemaVersion: 3, responses: collect(), taskVersions, responseHistory });
    if (payload.length > maxStoredCharacters) { setStatus("Not saved: download a copy, then shorten your responses."); return false; }
    try { localStorage.setItem(storageKey, payload); lastSaved = payload; setStatus("Saved in this browser"); updateProgress(); return true; }
    catch { setStatus("Could not save here. Download a copy of your work."); return false; }
  }
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved?.schemaVersion === 3 && saved.responses && typeof saved.responses === "object") {
        hydrate(saved.responses, saved.taskVersions, saved.responseHistory);
        lastSaved = raw;
        setStatus("Restored from this browser");
      }
    }
  } catch { setStatus("Saved work could not be read. Start a new copy or ask your teacher for help."); }
  updateProgress();
  fields.forEach(field => {
    field.addEventListener("input", () => {
      setStatus("Saving…");
      updateProgress();
      if (pendingSave) clearTimeout(pendingSave);
      pendingSave = setTimeout(save, 350);
    });
    field.addEventListener("blur", save);
  });
  window.addEventListener("pagehide", () => { if (pendingSave) save(); });
  window.addEventListener("storage", event => {
    if (event.key === storageKey && event.newValue !== lastSaved) {
      conflicted = true;
      setStatus("Saving paused: another tab changed this draft. Download a backup before reloading.");
    }
  });
  function downloadFile(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  document.getElementById("download-backup")?.addEventListener("click", () => {
    taskVersions = { ...taskVersions, ...currentTaskVersions() };
    const payload = JSON.stringify({ schemaVersion: 3, course: "calm10-2026-draft", exportedAt: new Date().toISOString(), responses: collect(), taskVersions, responseHistory }, null, 2);
    downloadFile("CALM_10_Draft_Backup.json", payload, "application/json;charset=utf-8");
    setStatus("Backup downloaded. Keep it in a safe place.");
  });
  document.getElementById("restore-backup")?.addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 300000) throw new Error("large");
      const saved = JSON.parse(await file.text());
      if (saved?.schemaVersion !== 3 || saved.course !== "calm10-2026-draft" || !saved.responses || typeof saved.responses !== "object" || Array.isArray(saved.responses)) throw new Error("schema");
      const safeKey = /^[a-z0-9][a-z0-9:_-]{0,119}$/i;
      if (Object.entries(saved.responses).some(([key, value]) => !safeKey.test(key) || typeof value !== "string")) throw new Error("fields");
      const incomingVersions = saved.taskVersions && typeof saved.taskVersions === "object" && !Array.isArray(saved.taskVersions) ? saved.taskVersions : {};
      const incomingHistory = saved.responseHistory && typeof saved.responseHistory === "object" && !Array.isArray(saved.responseHistory) ? saved.responseHistory : {};
      hydrate(saved.responses, incomingVersions, incomingHistory);
      taskVersions = { ...taskVersions, ...currentTaskVersions() };
      const payload = JSON.stringify({ schemaVersion: 3, responses: collect(), taskVersions, responseHistory });
      if (payload.length > maxStoredCharacters) throw new Error("large");
      if ((conflicted || fields.some(field => field.value.trim())) && !window.confirm("Replace this browser's current CALM draft with the selected backup? Download a backup of current work first if needed.")) return;
      conflicted = false;
      localStorage.setItem(storageKey, payload);
      lastSaved = payload;
      updateProgress();
      fields.forEach(field => field.dispatchEvent(new Event("change", { bubbles: true })));
      document.dispatchEvent(new Event("calm:restore"));
      setStatus("Backup restored in this browser");
    } catch { setStatus("Backup was not restored. Use a CALM 10 draft backup from this course."); }
    finally { event.target.value = ""; }
  });
  function portfolioText() {
    const lines = ["CALM 10: Career and Life Management", "Draft PEW0770 portfolio", "", "Use this copy with your teacher's Brightspace submission instructions.", "Do not add real account numbers, SINs, passwords, or private financial records.", ""];
    responseFields.forEach(field => {
      const label = document.querySelector(`label[for="${field.id}"]`);
      const title = field.closest(".lesson")?.querySelector("h1")?.textContent || "Final integrated portfolio";
      lines.push(title, label?.textContent?.trim() || "Response", field.value.trim() || "[No response yet]", "");
      const history = responseHistory[field.dataset.saveKey];
      if (Array.isArray(history)) history.forEach(entry => lines.push(`Earlier response (${entry.version || "pre-repair"})`, entry.value, ""));
    });
    return lines.join("\n");
  }
  document.getElementById("download-work")?.addEventListener("click", () => {
    save();
    downloadFile("CALM_10_My_Work.txt", portfolioText(), "text/plain;charset=utf-8");
  });
  document.getElementById("download-legacy-work")?.addEventListener("click", () => {
    let copies;
    try { copies = legacyStorageKeys.map(key => ({ key, saved: localStorage.getItem(key) })).filter(item => item.saved); }
    catch { setStatus("Earlier work could not be read in this browser."); return; }
    if (!copies.length) { setStatus("No earlier CALM draft was found in this browser."); return; }
    downloadFile("CALM_10_Earlier_Drafts.json", JSON.stringify({ course: "calm10-2026-draft", exportedAt: new Date().toISOString(), earlierDrafts: copies }, null, 2), "application/json;charset=utf-8");
    setStatus("Earlier drafts downloaded. Keep the file in a safe place.");
  });
  document.getElementById("print-work")?.addEventListener("click", () => {
    save();
    document.getElementById("print-portfolio")?.remove();
    const printRoot = document.createElement("section");
    printRoot.id = "print-portfolio";
    printRoot.textContent = portfolioText();
    document.body.append(printRoot);
    window.print();
  });
  window.addEventListener("afterprint", () => document.getElementById("print-portfolio")?.remove());
})();
