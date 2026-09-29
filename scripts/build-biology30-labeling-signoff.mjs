#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceZip = process.argv[2] || "/Users/deanguedo/Downloads/Biology30_Redone_Labeling_Images_30.zip";
const outputDir = process.argv[3] || "/Users/deanguedo/Downloads/Biology30_Labeling_Replacement_Signoff_2026-09-21";

if (!fs.existsSync(sourceZip)) throw new Error(`Source archive not found: ${sourceZip}`);
if (fs.existsSync(outputDir)) throw new Error(`Output directory already exists: ${outputDir}`);

const extracted = fs.mkdtempSync(path.join(os.tmpdir(), "biology30-labeling-signoff-"));
execFileSync("unzip", ["-q", sourceZip, "-d", extracted]);

const manifest = JSON.parse(fs.readFileSync(path.join(extracted, "manifest.json"), "utf8"));
const replacementById = new Map(manifest.replacement_images.map((item) => [item.activity_id, item]));
const chapters = new Map();

for (let chapter = 14; chapter <= 20; chapter += 1) {
  const configPath = path.join(
    repoRoot,
    `projects/biology30-chapter-${chapter}/meta/external-generation/authoring/course-config.json`,
  );
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  chapters.set(chapter, config.labelDiagrams || []);
}

function parseAnswerKey(markdown) {
  const answers = {};
  for (const line of markdown.split(/\r?\n/)) {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length < 2 || !/^[A-Z]$/.test(cells[0])) continue;
    answers[cells[0]] = cells[1];
  }
  return answers;
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/[′’']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function copyAsset(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

fs.mkdirSync(path.join(outputDir, "assets", "current"), { recursive: true });
fs.mkdirSync(path.join(outputDir, "assets", "replacement"), { recursive: true });

const reviewItems = [];
for (const replacement of manifest.replacement_images) {
  const chapter = Number(replacement.activity_id.match(/^ch(\d+)-/)?.[1]);
  const diagram = chapters.get(chapter)?.find((item) => item.id === replacement.activity_id);
  if (!diagram) throw new Error(`No canonical diagram found for ${replacement.activity_id}`);

  const currentSource = path.resolve(
    repoRoot,
    `projects/biology30-chapter-${chapter}/workspace`,
    diagram.src.replace(/^\.\//, ""),
  );
  const replacementSource = path.join(extracted, "images", replacement.image_filename);
  const answerKeySource = path.join(extracted, "answer_keys", replacement.answer_key_filename);
  if (!fs.existsSync(currentSource)) throw new Error(`Current image missing: ${currentSource}`);
  if (!fs.existsSync(replacementSource)) throw new Error(`Replacement image missing: ${replacementSource}`);
  if (!fs.existsSync(answerKeySource)) throw new Error(`Answer key missing: ${answerKeySource}`);

  const currentExtension = path.extname(currentSource).toLowerCase();
  const currentFilename = `${replacement.activity_id}${currentExtension}`;
  const proposedFilename = replacement.image_filename;
  copyAsset(currentSource, path.join(outputDir, "assets", "current", currentFilename));
  copyAsset(replacementSource, path.join(outputDir, "assets", "replacement", proposedFilename));

  const suppliedAnswers = parseAnswerKey(fs.readFileSync(answerKeySource, "utf8"));
  const canonicalAnswers = diagram.answers || diagram.labels || {};
  const answerLetters = [...new Set([...Object.keys(canonicalAnswers), ...Object.keys(suppliedAnswers)])].sort();
  const answerComparison = answerLetters.map((letter) => ({
    letter,
    canonical: canonicalAnswers[letter] || "Not defined",
    supplied: suppliedAnswers[letter] || "Not listed",
    matches: normalize(canonicalAnswers[letter]) === normalize(suppliedAnswers[letter]),
  }));

  reviewItems.push({
    id: replacement.activity_id,
    chapter,
    title: diagram.title,
    status: replacement.status,
    currentImage: `assets/current/${currentFilename}`,
    replacementImage: `assets/replacement/${proposedFilename}`,
    answerComparison,
    answerMapMatches: answerComparison.every((row) => row.matches),
  });
}

reviewItems.sort((a, b) => a.chapter - b.chapter || a.title.localeCompare(b.title));

const data = {
  generatedAt: new Date().toISOString(),
  sourceArchive: path.basename(sourceZip),
  reviewItems,
  keepOriginal: manifest.keep_original.map((id) => {
    const chapter = Number(id.match(/^ch(\d+)-/)?.[1]);
    const diagram = chapters.get(chapter)?.find((item) => item.id === id);
    return { id, chapter, title: diagram?.title || id };
  }),
  missingReplacements: manifest.missing_replacements.map((id) => {
    const chapter = Number(id.match(/^ch(\d+)-/)?.[1]);
    const diagram = chapters.get(chapter)?.find((item) => item.id === id);
    return { id, chapter, title: diagram?.title || id };
  }),
};

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Biology 30 labeling replacement sign-off</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="topbar">
    <div>
      <h1>Biology 30 labeling replacement sign-off</h1>
      <p>Compare the current course diagram with the proposed replacement, then record one decision.</p>
    </div>
    <div class="topbar-actions">
      <button class="button secondary" id="print-review" type="button">Print review</button>
      <button class="button" id="export-review" type="button">Download sign-off</button>
    </div>
  </header>

  <div class="layout">
    <aside class="sidebar" aria-label="Review navigation">
      <div class="progress-block">
        <p id="review-progress">0 of 30 decided</p>
        <progress id="review-progress-bar" max="30" value="0"></progress>
        <div class="decision-counts" id="decision-counts"></div>
      </div>
      <label for="chapter-filter">Chapter</label>
      <select id="chapter-filter">
        <option value="all">All chapters</option>
        <option value="14">Chapter 14</option>
        <option value="15">Chapter 15</option>
        <option value="16">Chapter 16</option>
        <option value="17">Chapter 17</option>
        <option value="18">Chapter 18</option>
        <option value="19">Chapter 19</option>
        <option value="20">Chapter 20</option>
      </select>
      <label for="decision-filter">Decision</label>
      <select id="decision-filter">
        <option value="all">All decisions</option>
        <option value="undecided">Undecided</option>
        <option value="replacement">Use replacement</option>
        <option value="current">Keep current</option>
        <option value="changes">Needs changes</option>
      </select>
      <nav id="review-list"></nav>
      <details class="context-list">
        <summary>8 already keeping current</summary>
        <ul id="keep-original-list"></ul>
      </details>
      <details class="context-list">
        <summary>6 replacements still missing</summary>
        <ul id="missing-list"></ul>
      </details>
    </aside>

    <main id="review-main" tabindex="-1">
      <section class="instructions">
        <h2>How to review each diagram</h2>
        <ol>
          <li>Compare the current and proposed images at full size.</li>
          <li>Follow every letter to its target and compare it with the answer table.</li>
          <li>Check scientific accuracy, student readability, and whether the blank labels are unambiguous.</li>
          <li>Choose <strong>Use replacement</strong>, <strong>Keep current</strong>, or <strong>Needs changes</strong>. Add a note when a correction is needed.</li>
        </ol>
        <p>Your work saves automatically in this browser. Download the sign-off file when the review is complete.</p>
      </section>

      <section id="empty-state" class="empty-state" hidden>
        <h2>No diagrams match these filters</h2>
        <p>Change the chapter or decision filter to continue.</p>
      </section>

      <article id="review-card" class="review-card" hidden>
        <header class="review-heading">
          <div>
            <p id="item-position" class="item-position"></p>
            <h2 id="item-title"></h2>
            <p><code id="item-id"></code></p>
          </div>
          <p id="source-status" class="source-status"></p>
        </header>

        <div class="comparison">
          <figure>
            <div class="figure-heading">
              <h3>Current course diagram</h3>
              <button class="text-button" type="button" data-enlarge="current">Open full size</button>
            </div>
            <button class="image-button" type="button" data-enlarge="current" aria-label="Open current diagram full size">
              <img id="current-image" alt="">
            </button>
          </figure>
          <figure>
            <div class="figure-heading">
              <h3>Proposed replacement</h3>
              <button class="text-button" type="button" data-enlarge="replacement">Open full size</button>
            </div>
            <button class="image-button" type="button" data-enlarge="replacement" aria-label="Open proposed replacement full size">
              <img id="replacement-image" alt="">
            </button>
          </figure>
        </div>

        <section class="target-guide">
          <div class="target-guide-heading">
            <h3>Target-by-target check</h3>
            <p id="answer-map-status"></p>
          </div>
          <table>
            <thead><tr><th>Label</th><th>Course answer</th><th>Package answer</th><th>Match</th></tr></thead>
            <tbody id="answer-table"></tbody>
          </table>
        </section>

        <fieldset class="decision-panel">
          <legend>Your decision</legend>
          <div class="decision-options">
            <label><input type="radio" name="decision" value="replacement"> <span><strong>Use replacement</strong>Replace the current diagram with the proposed one.</span></label>
            <label><input type="radio" name="decision" value="current"> <span><strong>Keep current</strong>Do not replace this course diagram.</span></label>
            <label><input type="radio" name="decision" value="changes"> <span><strong>Needs changes</strong>Do not integrate until the note is resolved.</span></label>
          </div>
          <label class="notes-label" for="review-notes">Review note</label>
          <textarea id="review-notes" rows="4" placeholder="Identify the exact letter, target, wording, or visual change needed."></textarea>
          <p class="saved-note" id="saved-note" aria-live="polite">Saved in this browser.</p>
        </fieldset>

        <footer class="review-navigation">
          <button class="button secondary" id="previous-item" type="button">Previous diagram</button>
          <button class="button" id="next-item" type="button">Next diagram</button>
        </footer>
      </article>
    </main>
  </div>

  <dialog id="image-dialog">
    <div class="dialog-heading">
      <h2 id="dialog-title"></h2>
      <button class="button secondary" id="close-dialog" type="button">Close</button>
    </div>
    <img id="dialog-image" alt="">
  </dialog>

  <script src="review-data.js"></script>
  <script src="app.js"></script>
</body>
</html>`;

const css = `@font-face{font-family:"Hanken Grotesk";src:local("Hanken Grotesk");font-display:swap}
@font-face{font-family:"Work Sans";src:local("Work Sans");font-display:swap}
:root{--ink:#171b1b;--muted:#5b635d;--canvas:#f7f8f5;--surface:#fff;--green:#154212;--green-dark:#0e3510;--teal:#146c60;--border:#d9ded8;--soft:#eef3ee;--amber:#8a5600;--brick:#a43f35}
*{box-sizing:border-box}body{margin:0;background:var(--canvas);color:var(--ink);font:16px/1.55 "Work Sans",system-ui,sans-serif}button,select,textarea{font:inherit}button{cursor:pointer}.topbar{display:flex;align-items:center;justify-content:space-between;gap:24px;min-height:88px;padding:18px 28px;background:var(--ink);color:#fff}.topbar h1{margin:0;font:800 25px/1.15 "Hanken Grotesk",system-ui,sans-serif}.topbar p{margin:5px 0 0;color:#dce3da}.topbar-actions{display:flex;gap:10px}.layout{display:grid;grid-template-columns:280px minmax(0,1fr);min-height:calc(100vh - 88px)}.sidebar{padding:22px 18px;border-right:1px solid var(--border);background:#fff}.sidebar label{display:block;margin:18px 0 6px;font-weight:750}.sidebar select{width:100%;min-height:42px;padding:7px 9px;border:1px solid #aeb8af;border-radius:5px;background:#fff}.progress-block{padding-bottom:18px;border-bottom:1px solid var(--border)}.progress-block>p{margin:0 0 8px;font-weight:800}.progress-block progress{width:100%;height:12px;accent-color:var(--green)}.decision-counts{display:grid;grid-template-columns:1fr 1fr;gap:3px 10px;margin-top:9px;color:var(--muted);font-size:13px}#review-list{display:grid;gap:2px;margin:22px -8px}.review-link{width:100%;padding:9px 10px;border:0;border-left:3px solid transparent;background:transparent;text-align:left}.review-link:hover{background:var(--soft)}.review-link.active{border-left-color:var(--green);background:var(--soft);font-weight:800}.review-link span{display:block}.review-link small{color:var(--muted)}.context-list{margin-top:18px;border-top:1px solid var(--border)}.context-list summary{padding:14px 0;color:var(--green);font-weight:800;cursor:pointer}.context-list ul{margin:0;padding:0 0 0 18px;color:var(--muted);font-size:13px}.context-list li{margin-bottom:8px}main{padding:30px}.instructions,.review-card,.empty-state{width:min(1240px,100%);margin:0 auto;border:1px solid var(--border);background:#fff}.instructions{padding:22px 28px;border-left:4px solid var(--teal)}.instructions h2,.empty-state h2{margin:0 0 10px;font:800 22px/1.2 "Hanken Grotesk",system-ui,sans-serif}.instructions ol{margin:0;padding-left:22px}.instructions p{margin:12px 0 0;color:var(--muted)}.review-card{margin-top:22px}.review-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding:24px 28px;border-top:5px solid var(--green);border-bottom:1px solid var(--border)}.review-heading h2{margin:2px 0 4px;font:800 30px/1.15 "Hanken Grotesk",system-ui,sans-serif}.review-heading p{margin:0}.item-position{color:var(--teal);font-weight:800}.source-status{max-width:330px;padding:8px 10px;border-left:3px solid var(--amber);background:#fbf7ed;font-size:14px}.comparison{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);border-bottom:1px solid var(--border)}figure{margin:0;background:#fff}.figure-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;border-bottom:1px solid var(--border)}.figure-heading h3{margin:0;font-size:17px}.text-button{min-height:36px;padding:4px 0;border:0;background:transparent;color:var(--teal);font-weight:750;text-decoration:underline;text-underline-offset:3px}.image-button{display:grid;width:100%;height:520px;padding:18px;border:0;background:#f2f4f1;place-items:center}.image-button img{display:block;max-width:100%;max-height:100%;object-fit:contain}.target-guide{padding:24px 28px;border-bottom:1px solid var(--border)}.target-guide-heading{display:flex;align-items:center;justify-content:space-between;gap:18px}.target-guide h3{margin:0;font-size:20px}.target-guide-heading p{margin:0;font-weight:750}.status-match{color:var(--green)}.status-mismatch{color:var(--brick)}table{width:100%;margin-top:14px;border-collapse:collapse}th,td{padding:10px 12px;border-top:1px solid var(--border);text-align:left;vertical-align:top}th{background:#f5f7f3}.match-yes{color:var(--green);font-weight:800}.match-no{color:var(--brick);font-weight:800}.decision-panel{margin:0;padding:24px 28px;border:0;border-bottom:1px solid var(--border)}.decision-panel legend{padding:24px 0 0;font:800 20px/1.2 "Hanken Grotesk",system-ui,sans-serif}.decision-options{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.decision-options label{display:flex;gap:10px;padding:14px;border:1px solid var(--border);cursor:pointer}.decision-options label:has(input:checked){border-color:var(--teal);background:#eef7f4}.decision-options input{width:19px;height:19px;margin:2px 0 0;accent-color:var(--green)}.decision-options strong,.decision-options span{display:block}.decision-options span{color:var(--muted)}.decision-options strong{color:var(--ink)}.notes-label{display:block;margin:18px 0 6px;font-weight:800}.decision-panel textarea{display:block;width:100%;padding:11px;border:1px solid #aeb8af;border-radius:5px;resize:vertical}.decision-panel textarea:focus,.sidebar select:focus,.button:focus,.review-link:focus,.image-button:focus,.text-button:focus{outline:3px solid #f2b84b;outline-offset:2px}.saved-note{margin:7px 0 0;color:var(--muted);font-size:13px}.review-navigation{display:flex;justify-content:space-between;gap:12px;padding:20px 28px}.button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:9px 15px;border:1px solid var(--green);border-radius:6px;background:var(--green);color:#fff;font-weight:800}.button:hover{background:var(--green-dark)}.button.secondary{background:#fff;color:var(--green)}.button.secondary:hover{background:var(--soft)}.button:disabled{cursor:not-allowed;opacity:.45}.empty-state{margin-top:22px;padding:30px}.empty-state p{margin:0;color:var(--muted)}dialog{width:min(96vw,1400px);max-height:94vh;padding:0;border:1px solid var(--border);border-radius:7px;background:#fff}dialog::backdrop{background:rgba(16,20,18,.78)}.dialog-heading{position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:13px 16px;border-bottom:1px solid var(--border);background:#fff}.dialog-heading h2{margin:0;font-size:20px}dialog>img{display:block;max-width:100%;margin:0 auto;padding:18px}.decision-marker{font-weight:800}.decision-marker.replacement{color:var(--green)}.decision-marker.current{color:var(--teal)}.decision-marker.changes{color:var(--brick)}
@media(max-width:900px){.topbar{align-items:flex-start;flex-direction:column}.layout{grid-template-columns:1fr}.sidebar{position:static;border-right:0;border-bottom:1px solid var(--border)}#review-list{grid-template-columns:repeat(2,minmax(0,1fr))}.comparison,.decision-options{grid-template-columns:1fr}.image-button{height:auto;min-height:360px}main{padding:18px}.review-heading{flex-direction:column}.source-status{max-width:none}}
@media print{.topbar-actions,.sidebar,.instructions,.decision-panel,.review-navigation,.text-button{display:none!important}.layout{display:block}main{padding:0}.review-card{border:0}.image-button{height:420px}.comparison{break-inside:avoid}.target-guide{break-inside:avoid}}
`;

const app = `(() => {
  const data = window.BIO30_LABEL_REVIEW_DATA;
  const storageKey = "biology30-labeling-replacement-signoff-v1";
  const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
  const state = { decisions: stored.decisions || {}, selectedId: stored.selectedId || data.reviewItems[0]?.id, chapter: "all", decision: "all" };
  const byId = new Map(data.reviewItems.map((item) => [item.id, item]));
  const labels = { replacement: "Use replacement", current: "Keep current", changes: "Needs changes" };
  const list = document.querySelector("#review-list");
  const card = document.querySelector("#review-card");
  const empty = document.querySelector("#empty-state");

  function save() {
    localStorage.setItem(storageKey, JSON.stringify({ decisions: state.decisions, selectedId: state.selectedId }));
    document.querySelector("#saved-note").textContent = "Saved in this browser.";
  }

  function visibleItems() {
    return data.reviewItems.filter((item) => {
      const decision = state.decisions[item.id]?.decision || "undecided";
      return (state.chapter === "all" || String(item.chapter) === state.chapter) && (state.decision === "all" || decision === state.decision);
    });
  }

  function renderList() {
    const items = visibleItems();
    if (!items.some((item) => item.id === state.selectedId)) state.selectedId = items[0]?.id || null;
    list.innerHTML = items.map((item) => {
      const decision = state.decisions[item.id]?.decision || "undecided";
      return '<button class="review-link ' + (item.id === state.selectedId ? "active" : "") + '" type="button" data-id="' + item.id + '"><span>' + item.chapter + '. ' + item.title + '</span><small class="decision-marker ' + decision + '">' + (labels[decision] || "Undecided") + '</small></button>';
    }).join("");
    empty.hidden = items.length > 0;
    card.hidden = items.length === 0;
    if (items.length) renderItem();
  }

  function renderItem() {
    const item = byId.get(state.selectedId);
    if (!item) return;
    const items = visibleItems();
    const index = items.findIndex((entry) => entry.id === item.id);
    const decision = state.decisions[item.id] || {};
    document.querySelector("#item-position").textContent = "Chapter " + item.chapter + " · diagram " + (index + 1) + " of " + items.length + " in this view";
    document.querySelector("#item-title").textContent = item.title;
    document.querySelector("#item-id").textContent = item.id;
    document.querySelector("#source-status").textContent = item.status;
    const current = document.querySelector("#current-image");
    const replacement = document.querySelector("#replacement-image");
    current.src = item.currentImage;
    current.alt = "Current course diagram for " + item.title;
    replacement.src = item.replacementImage;
    replacement.alt = "Proposed replacement diagram for " + item.title;
    const mapStatus = document.querySelector("#answer-map-status");
    mapStatus.textContent = item.answerMapMatches ? "Answer wording matches the course map" : "Answer wording differs — review carefully";
    mapStatus.className = item.answerMapMatches ? "status-match" : "status-mismatch";
    document.querySelector("#answer-table").innerHTML = item.answerComparison.map((row) => '<tr><th scope="row">' + row.letter + '</th><td>' + row.canonical + '</td><td>' + row.supplied + '</td><td class="' + (row.matches ? "match-yes" : "match-no") + '">' + (row.matches ? "Matches" : "Different") + '</td></tr>').join("");
    document.querySelectorAll('input[name="decision"]').forEach((radio) => { radio.checked = radio.value === decision.decision; });
    document.querySelector("#review-notes").value = decision.notes || "";
    document.querySelector("#previous-item").disabled = index <= 0;
    document.querySelector("#next-item").disabled = index < 0 || index >= items.length - 1;
    renderProgress();
  }

  function renderProgress() {
    const counts = { replacement: 0, current: 0, changes: 0, undecided: 0 };
    data.reviewItems.forEach((item) => { counts[state.decisions[item.id]?.decision || "undecided"] += 1; });
    const decided = data.reviewItems.length - counts.undecided;
    document.querySelector("#review-progress").textContent = decided + " of " + data.reviewItems.length + " decided";
    const progress = document.querySelector("#review-progress-bar");
    progress.max = data.reviewItems.length;
    progress.value = decided;
    document.querySelector("#decision-counts").innerHTML = '<span>Replacement: ' + counts.replacement + '</span><span>Current: ' + counts.current + '</span><span>Changes: ' + counts.changes + '</span><span>Undecided: ' + counts.undecided + '</span>';
  }

  function selectRelative(offset) {
    const items = visibleItems();
    const index = items.findIndex((item) => item.id === state.selectedId);
    const target = items[index + offset];
    if (!target) return;
    state.selectedId = target.id;
    save();
    renderList();
    document.querySelector("#review-main").focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-id]");
    if (!button) return;
    state.selectedId = button.dataset.id;
    save();
    renderList();
  });
  document.querySelector("#chapter-filter").addEventListener("change", (event) => { state.chapter = event.target.value; renderList(); });
  document.querySelector("#decision-filter").addEventListener("change", (event) => { state.decision = event.target.value; renderList(); });
  document.querySelectorAll('input[name="decision"]').forEach((radio) => radio.addEventListener("change", (event) => {
    state.decisions[state.selectedId] = { ...state.decisions[state.selectedId], decision: event.target.value, updatedAt: new Date().toISOString() };
    save();
    renderList();
  }));
  document.querySelector("#review-notes").addEventListener("input", (event) => {
    state.decisions[state.selectedId] = { ...state.decisions[state.selectedId], notes: event.target.value, updatedAt: new Date().toISOString() };
    save();
  });
  document.querySelector("#previous-item").addEventListener("click", () => selectRelative(-1));
  document.querySelector("#next-item").addEventListener("click", () => selectRelative(1));
  document.querySelector("#print-review").addEventListener("click", () => window.print());
  document.querySelector("#export-review").addEventListener("click", () => {
    const rows = data.reviewItems.map((item) => ({
      activity_id: item.id,
      chapter: item.chapter,
      title: item.title,
      source_status: item.status,
      answer_map_matches: item.answerMapMatches,
      decision: state.decisions[item.id]?.decision || "undecided",
      decision_label: labels[state.decisions[item.id]?.decision] || "Undecided",
      notes: state.decisions[item.id]?.notes || "",
      updated_at: state.decisions[item.id]?.updatedAt || null,
    }));
    const payload = { schema_version: 1, exported_at: new Date().toISOString(), source_archive: data.sourceArchive, decisions: rows, keep_original: data.keepOriginal, missing_replacements: data.missingReplacements };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Biology30_Labeling_Signoff_" + new Date().toISOString().slice(0, 10) + ".json";
    link.click();
    URL.revokeObjectURL(link.href);
  });

  const dialog = document.querySelector("#image-dialog");
  document.querySelectorAll("[data-enlarge]").forEach((button) => button.addEventListener("click", () => {
    const item = byId.get(state.selectedId);
    const proposed = button.dataset.enlarge === "replacement";
    document.querySelector("#dialog-title").textContent = (proposed ? "Proposed replacement" : "Current diagram") + ": " + item.title;
    const image = document.querySelector("#dialog-image");
    image.src = proposed ? item.replacementImage : item.currentImage;
    image.alt = (proposed ? "Proposed replacement" : "Current course diagram") + " for " + item.title;
    dialog.showModal();
  }));
  document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });

  function renderContextList(selector, items) {
    document.querySelector(selector).innerHTML = items.map((item) => '<li><strong>Ch. ' + item.chapter + '</strong> · ' + item.title + '<br><code>' + item.id + '</code></li>').join("");
  }
  renderContextList("#keep-original-list", data.keepOriginal);
  renderContextList("#missing-list", data.missingReplacements);
  renderList();
})();`;

fs.writeFileSync(path.join(outputDir, "index.html"), html);
fs.writeFileSync(path.join(outputDir, "styles.css"), css);
fs.writeFileSync(path.join(outputDir, "app.js"), app);
fs.writeFileSync(path.join(outputDir, "review-data.js"), `window.BIO30_LABEL_REVIEW_DATA = ${JSON.stringify(data, null, 2)};\n`);
fs.writeFileSync(
  path.join(outputDir, "README.txt"),
  `BIOLOGY 30 LABELING REPLACEMENT SIGN-OFF\n\nOpen index.html in a browser. Decisions and notes save in that browser. Use Download sign-off to create the JSON file that will drive integration.\n\nThis review contains 30 proposed replacements, plus context lists for 8 diagrams that remain current and 6 missing replacements. No course files are changed by this tool.\n`,
);

console.log(outputDir);
