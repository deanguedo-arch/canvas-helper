"use strict";
(() => {
  // scripts/lib/biology30-vocabulary/word-frayer-state.ts
  function validateWordFrayers(slots, schema) {
    if (!/^[a-f0-9]{64}$/.test(schema.identity) || !Number.isInteger(schema.limit) || schema.limit < 1) throw Error("Invalid word Frayer schema");
    if (new Set(schema.wordIds).size !== schema.wordIds.length || new Set(schema.legacyIds).size !== schema.legacyIds.length) throw Error("Duplicate word Frayer identity");
    if (!Array.isArray(slots) || slots.length > 8) throw Error("Choose up to eight words");
    const seen = /* @__PURE__ */ new Set();
    for (const s of slots) {
      if (!s || !["word", "legacy"].includes(s.kind) || !(s.kind === "word" ? schema.wordIds : schema.legacyIds).includes(s.id) || seen.has(s.kind + ":" + s.id)) throw Error("Unknown or duplicate Frayer owner");
      seen.add(s.kind + ":" + s.id);
      if (!Array.isArray(s.answers) || s.answers.length !== 4 || s.answers.some((a) => typeof a !== "string" || a.length > schema.limit)) throw Error("A Frayer response is oversized or invalid; writing was not truncated");
      if (typeof s.collected !== "boolean" || s.kind === "word" && s.collected && !s.answers.every((a) => a.trim())) throw Error("Complete four fields before collecting");
    }
    return slots;
  }
  function chooseWord(slots, schema, id) {
    validateWordFrayers(slots, schema);
    if (!schema.wordIds.includes(id)) throw Error("Unknown word");
    if (slots.some((s) => s.kind === "word" && s.id === id)) return slots;
    if (slots.length >= 8) throw Error("All eight slots are occupied. Copy and remove a chosen Frayer before choosing another word.");
    return [...slots, { kind: "word", id, answers: ["", "", "", ""], collected: false }];
  }
  function removeWordFrayer(slots, schema, kind, id, confirmed) {
    validateWordFrayers(slots, schema);
    const found = slots.find((s) => s.kind === kind && s.id === id);
    if (!found) throw Error("Frayer is not selected");
    if ((found.answers.some((a) => a.length) || found.collected) && !confirmed) throw Error("Copy your writing and explicitly confirm removal first");
    return slots.filter((s) => s !== found);
  }
  function packWordFrayers(slots, schema) {
    validateWordFrayers(slots, schema);
    return { m: schema.identity, s: slots.map((s) => [s.kind === "word" ? schema.wordIds.indexOf(s.id) : -1 - schema.legacyIds.indexOf(s.id), s.collected ? 1 : 0, ...s.answers]) };
  }
  function unpackWordFrayers(raw, schema) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw Error("Invalid word Frayer payload");
    const p = raw;
    if (Object.keys(p).sort().join(",") !== "m,s" || p.m !== schema.identity || !Array.isArray(p.s)) throw Error("Word map changed; preserve the original save");
    const slots = p.s.map((row) => {
      if (!Array.isArray(row) || row.length !== 6 || !Number.isInteger(row[0]) || ![0, 1].includes(row[1]) || row.slice(2).some((a) => typeof a !== "string")) throw Error("Malformed word Frayer; preserve original save");
      const kind = row[0] < 0 ? "legacy" : "word", id = kind === "word" ? schema.wordIds[row[0]] : schema.legacyIds[-1 - row[0]];
      return { kind, id, answers: row.slice(2), collected: row[1] === 1 };
    });
    return validateWordFrayers(slots, schema);
  }

  // scripts/lib/biology30-vocabulary/word-record.ts
  var escape = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  function renderBiologyWordDetails(word2, words, categories = []) {
    const section = (title, text) => `<section><h3 class="section-label">${title}</h3><p>${escape(text)}</p></section>`;
    const labels2 = word2.categoryIds.map((id) => categories.find((c) => c.id === id)?.label).filter(Boolean).join(" \xB7 ");
    const related = word2.relatedTermIds.map((id) => {
      const related2 = words.find((w) => w.id === id);
      if (!related2) throw Error("Unknown related word " + id);
      return related2.term;
    }).join(" \xB7 ");
    const structure = word2.structure.parts?.length ? '<section><h3 class="section-label">Word structure</h3><dl class="word-parts">' + word2.structure.parts.map((p) => "<div><dt>" + escape(p.text) + "</dt><dd>" + escape(p.meaning) + "</dd></div>").join("") + "</dl>" + (word2.structure.caution ? '<p class="caution-line"><strong>Use with care:</strong> ' + escape(word2.structure.caution) + "</p>" : "") + "</section>" : section("Word structure", word2.structure.text);
    return `<div data-biology-word-details="${escape(word2.id)}">${labels2 ? `<p class="eyebrow">${escape(labels2)}</p>` : ""}<h2 tabindex="-1">${escape(word2.term)}</h2>${section("Meaning", word2.definition)}${structure}${section("What it does", word2.whatItDoes)}<section class="concept-contrast"><div><h3>Related ideas</h3><p>${escape(related)}</p></div><div><h3>Common confusion</h3><p>${escape(word2.commonConfusion)}</p></div></section><section class="retrieval-mini"><h3>Retrieve the idea</h3><p>${escape(word2.retrievalPrompt)}</p></section></div>`;
  }

  // scripts/lib/biology30-vocabulary/word-reader.ts
  function mountBiologyWordReader(root) {
    const views = [...root.querySelectorAll("[data-biology-word-view]")];
    const buttons = [...root.querySelectorAll("[data-biology-select-word]")];
    const select = (id, focus) => {
      const view = views.find((v) => v.dataset.biologyWordView === id);
      if (!view) return;
      for (const v of views) v.hidden = v !== view;
      for (const b of buttons) b.setAttribute("aria-pressed", String(b.dataset.biologySelectWord === id));
      if (focus) {
        const heading = view.querySelector("h2");
        heading?.focus({ preventScroll: true });
        heading?.scrollIntoView({ block: "start" });
      }
      root.dispatchEvent(new CustomEvent("biology-word-selected", { bubbles: true, detail: { wordId: id } }));
    };
    const click = (event) => {
      const button = event.target.closest("[data-biology-select-word]");
      if (button && root.contains(button)) select(button.dataset.biologySelectWord, true);
    };
    root.addEventListener("click", click);
    if (views[0]) select(views[0].dataset.biologyWordView, false);
    return { selectWord: (id) => select(id, true), dispose: () => root.removeEventListener("click", click) };
  }

  // scripts/lib/biology30-vocabulary/word-frayer-runtime.ts
  var esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  var labels = ["My definition in context", "Essential characteristics or mechanism", "Example or evidence", "Non-example or common confusion"];
  function mountWordFrayerControls(root, data, schema, owner) {
    const reader = root.querySelector("[data-biology-word-reader]"), controller = mountBiologyWordReader(reader);
    const authoredEmpty = new Map([...root.querySelectorAll("[data-word-frayer][data-word-empty-canonical]")].map((node) => [node.dataset.wordFrayer, node.innerHTML]));
    const legacy = root.ownerDocument.createElement("section");
    legacy.className = "collection-section";
    legacy.dataset.wordLegacy = "";
    reader.after(legacy);
    const status = (message2) => {
      root.querySelectorAll("[data-word-save-status]").forEach((n) => n.textContent = message2);
    };
    const summary = () => {
      const slots = owner.get();
      const progress2 = root.querySelector("[data-p2-vocabulary-progress]");
      if (progress2) progress2.textContent = `${slots.filter((s) => s.collected).length} of 8`;
    };
    function render2() {
      for (const word2 of data.words) {
        let node = root.querySelector(`[data-word-frayer="${CSS.escape(word2.id)}"]`);
        if (!node) {
          const view = reader.querySelector(`[data-biology-word-view="${CSS.escape(word2.id)}"]`);
          view.querySelector("[data-biology-word-frayer]")?.remove();
          node = root.ownerDocument.createElement("section");
          node.className = "frayer";
          node.dataset.wordFrayer = word2.id;
          node.id = "word-frayer-" + word2.id;
          view.append(node);
        }
        const slot = owner.get().find((s) => s.kind === "word" && s.id === word2.id);
        if (!slot && authoredEmpty.has(word2.id)) {
          if (node.querySelector("[data-word-answer]")) node.innerHTML = authoredEmpty.get(word2.id);
          continue;
        }
        node.innerHTML = `<div class="frayer-heading"><div><p class="section-label">Frayer model</p><h3>${esc(word2.term)}</h3></div></div>` + (slot ? `<div class="frayer-grid">${labels.map((label, i) => `<label>${label}<textarea rows="3" data-word-answer="${i}" aria-label="${esc(word2.term + ": " + label)}">${esc(slot.answers[i])}</textarea><small>Up to ${schema.limit} characters. Longer drafts stay visible but are not saved.</small></label>`).join("")}</div><div class="save-row"><button type="button" data-word-collect>${slot.collected ? "Remove from Process Collection" : "Add to Process Collection"}</button><button type="button" class="text-link" data-word-copy>Copy my Frayer</button></div><details><summary>Remove this word and free a slot</summary><p>This removes only this word\u2019s four answers and collection status. Copy your writing first.</p><label><input type="checkbox" data-word-remove-confirm> I want to remove this word and its writing.</label><button type="button" data-word-remove>Remove this word</button></details>` : `<p>Choose any eight words. Choosing opens an empty Frayer; it does not fill in your answers.</p><button type="button" data-word-choose>Choose this word</button>`) + `<p data-word-save-status role="status" aria-live="polite"></p>`;
        if (slot && word2.modelFrayer) {
          const button = root.ownerDocument.createElement("button");
          button.type = "button";
          button.dataset.wordCompare = "";
          button.textContent = "Compare with course model";
          button.disabled = slot.answers.some((a) => !a.trim() || a.length > schema.limit);
          const guide = root.ownerDocument.createElement("div");
          guide.className = "course-model";
          guide.dataset.wordModel = "";
          guide.hidden = true;
          guide.innerHTML = "<h4>Course model for " + esc(word2.term) + "</h4><dl>" + word2.modelFrayer.map((a, i) => "<div><dt>" + labels[i] + "</dt><dd>" + esc(a) + "</dd></div>").join("") + "</dl>";
          node.append(button, guide);
        }
      }
      const old = owner.get().filter((s) => s.kind === "legacy");
      legacy.hidden = !old.length;
      legacy.innerHTML = "<h2>Preserved earlier Frayers</h2><p>These retain their original category labels and writing. Each occupies one of the eight slots until you explicitly remove it. No writing has been assigned to a different word.</p>" + old.map((s) => `<article data-word-legacy-record="${esc(s.id)}"><h3>${esc(data.categories.find((c) => c.id === s.id)?.label ?? s.id)}</h3><dl>${s.answers.map((a, i) => `<div><dt>${labels[i]}</dt><dd>${esc(a)}</dd></div>`).join("")}</dl><button type="button" class="text-link" data-word-copy>Copy earlier Frayer</button><label><input type="checkbox" data-word-remove-confirm> I have kept a copy and want to remove this earlier Frayer.</label><button type="button" data-word-remove>Remove earlier Frayer and free a slot</button><p data-word-save-status role="status"></p></article>`).join("");
      summary();
    }
    const transact = (next) => {
      const before = owner.get();
      owner.set(next);
      const result = owner.save();
      if (!result.saved) {
        owner.set(before);
        status(result.message);
        return false;
      }
      render2();
      status(result.message);
      return true;
    };
    const input = (event) => {
      const field = event.target;
      if (!field.matches("textarea[data-word-answer]")) return;
      const id = field.closest("[data-word-frayer]").dataset.wordFrayer, slot = owner.get().find((s) => s.kind === "word" && s.id === id);
      slot.answers[Number(field.dataset.wordAnswer)] = field.value;
      slot.collected = false;
      const result = owner.save();
      status(result.message);
      summary();
      const collect = field.closest("[data-word-frayer]").querySelector("[data-word-collect]");
      collect.textContent = "Add to Process Collection";
      const compare = field.closest("[data-word-frayer]").querySelector("[data-word-compare]");
      if (compare) {
        compare.disabled = slot.answers.some((a) => !a.trim() || a.length > schema.limit);
        if (compare.disabled) field.closest("[data-word-frayer]").querySelector("[data-word-model]").hidden = true;
      }
    };
    const click = async (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const node = button.closest("[data-word-frayer],[data-word-legacy-record]");
      if (!node) return;
      const kind = node.hasAttribute("data-word-frayer") ? "word" : "legacy", id = node.dataset.wordFrayer ?? node.dataset.wordLegacyRecord;
      try {
        if (button.hasAttribute("data-word-compare")) {
          const slot2 = owner.get().find((s) => s.kind === kind && s.id === id);
          if (slot2?.answers.every((a) => a.trim() && a.length <= schema.limit)) {
            const guide = node.querySelector("[data-word-model]");
            if (guide) guide.hidden = !guide.hidden;
          }
        }
        if (button.hasAttribute("data-word-choose")) transact(chooseWord(owner.get(), schema, id));
        if (button.hasAttribute("data-word-remove")) transact(removeWordFrayer(owner.get(), schema, kind, id, Boolean(node.querySelector("[data-word-remove-confirm]")?.checked)));
        const slot = owner.get().find((s) => s.kind === kind && s.id === id);
        if (button.hasAttribute("data-word-collect") && slot) {
          const next = structuredClone(owner.get()), target = next.find((s) => s.kind === kind && s.id === id);
          if (!target.collected && target.answers.some((a) => !a.trim() || a.length > schema.limit)) throw Error("Complete all four fields within their limits before collecting.");
          target.collected = !target.collected;
          transact(next);
        }
        if (button.hasAttribute("data-word-copy") && slot) {
          const text = [node.querySelector("h3").textContent, ...slot.answers.map((a, i) => labels[i] + ": " + a)].join("\n\n");
          try {
            await navigator.clipboard.writeText(text);
            status("Frayer copied.");
          } catch {
            let copy = node.querySelector("[data-word-copy-fallback]");
            if (!copy) {
              copy = root.ownerDocument.createElement("textarea");
              copy.dataset.wordCopyFallback = "";
              copy.readOnly = true;
              copy.setAttribute("aria-label", "Copy of this Frayer");
              node.append(copy);
            }
            copy.value = text;
            copy.focus();
            copy.select();
            status("Clipboard unavailable. Copy the selected text manually before removing.");
          }
        }
      } catch (error) {
        status(String(error).replace(/^Error: /, ""));
      }
    };
    const reveal = (event) => {
      const target = event.detail;
      const id = target?.closest("[data-word-frayer]")?.dataset.wordFrayer;
      if (id) controller.selectWord(id);
    };
    root.addEventListener("input", input);
    root.addEventListener("click", click);
    root.addEventListener("pilot2-state-change", summary);
    root.addEventListener("pilot2-reveal-target", reveal);
    render2();
    return { dispose() {
      controller.dispose();
      root.removeEventListener("input", input);
      root.removeEventListener("click", click);
      root.removeEventListener("pilot2-state-change", summary);
      root.removeEventListener("pilot2-reveal-target", reveal);
      legacy.remove();
    } };
  }

  // scripts/lib/biology30-vocabulary/panel.ts
  var VOCABULARY_PANEL_CSS = `
button.bio-term{display:inline;min-height:0;padding:0;border:0;border-radius:0;background:none;color:inherit;font:inherit;text-align:inherit;text-decoration:underline dotted;text-underline-offset:.2em;cursor:pointer}
button.bio-term:hover,button.bio-term:focus-visible{text-decoration-style:solid;outline-offset:3px}
dialog.bio-vocabulary{position:fixed;inset:0 0 0 auto;margin:0;width:min(36rem,100%);height:100dvh;max-height:100dvh;max-width:100%;box-sizing:border-box;border:0;border-left:1px solid var(--border,#ccc);border-radius:0;background:var(--surface,#fff);color:var(--ink,#222);padding:1.25rem;overflow:auto;overscroll-behavior:contain}
dialog.bio-vocabulary::backdrop{background:#0005}
.bio-vocabulary header{display:flex;align-items:start;justify-content:space-between;gap:1rem}
.bio-vocabulary h2{margin:0 0 1rem}.bio-vocabulary p{line-height:1.6}
.bio-vocabulary button,.bio-vocabulary select,.bio-vocabulary summary{min-height:44px;font:inherit}
.bio-vocabulary label{display:block}.bio-vocabulary select{max-width:100%;width:100%}
.bio-vocabulary textarea{display:block;box-sizing:border-box;width:100%;font:inherit;line-height:1.5;resize:vertical;padding:.6rem}
.bio-vocabulary .frayer-grid{grid-template-columns:1fr}.bio-vocabulary .save-row{flex-wrap:wrap}
.bio-vocabulary :focus-visible{outline:3px solid currentColor;outline-offset:3px}
.bio-vocabulary [hidden]{display:none!important}
.bio-vocabulary [data-bio-save-status]{position:sticky;bottom:0;background:var(--surface,#fff);padding:.5rem 0}
@media(max-width:600px){dialog.bio-vocabulary{width:100%;border:0;padding:1rem}}
@media print{dialog.bio-vocabulary{display:none!important}button.bio-term{text-decoration:none}}
`;
  var excluded = 'a,button,nav,summary,label,input,textarea,select,[contenteditable]:not([contenteditable="false"]),script,style,dialog,.stop-check,.guided-practice,.p2-writing,.p2-practice,[data-practice-id],[data-checkpoint],.word-lens';
  var word = (value) => Boolean(value && /[\p{L}\p{N}_]/u.test(value));
  function termMatches(text, terms, seen = /* @__PURE__ */ new Set()) {
    const names = [...new Set(terms.map((t) => t.toLocaleLowerCase()))].sort((a, b) => b.length - a.length), lower = text.toLocaleLowerCase();
    const matches = [];
    for (let i = 0; i < text.length; ) {
      const name = names.find((name2) => !seen.has(name2) && lower.startsWith(name2, i) && !word(text[i - 1]) && !word(text[i + name2.length]));
      if (name) {
        matches.push({ start: i, end: i + name.length, term: name });
        seen.add(name);
        i += name.length;
      } else i++;
    }
    return matches;
  }
  function mountVocabularyPanel(adapter) {
    const { root } = adapter, doc = root.ownerDocument, win = doc.defaultView;
    const terms = /* @__PURE__ */ new Map();
    for (const item of adapter.terms) {
      const key = item.term.toLocaleLowerCase(), old = terms.get(key);
      terms.set(key, old ? { ...old, familyIds: [.../* @__PURE__ */ new Set([...old.familyIds, ...item.familyIds])] } : item);
    }
    const style = doc.createElement("style");
    style.textContent = VOCABULARY_PANEL_CSS;
    root.append(style);
    const dialog = doc.createElement("dialog");
    dialog.className = "bio-vocabulary";
    dialog.dataset.testid = "vocabulary-panel";
    dialog.setAttribute("aria-labelledby", "bio-vocabulary-title");
    dialog.innerHTML = '<header><h2 id="bio-vocabulary-title"></h2><button type="button" data-bio-close aria-label="Close vocabulary">Close</button></header><label data-bio-family-label>Concept family<select data-bio-family></select></label><div data-bio-meaning></div><details data-bio-frayer><summary>My Frayer</summary><p data-bio-locked></p><div data-bio-frayer-slot></div><div data-bio-choices-slot></div></details><p data-bio-save-status role="status" aria-live="polite"></p>';
    root.append(dialog);
    const get = (selector) => dialog.querySelector(selector);
    const familySelect = get("[data-bio-family]"), meaning = get("[data-bio-meaning]"), slot = get("[data-bio-frayer-slot]");
    let trigger = null, current2 = null;
    let loans = [], scrolls = [], windowScroll = [0, 0], oldOverflow = "";
    const restoreLoans = () => {
      for (const { node, marker } of loans) {
        marker.replaceWith(node);
      }
      loans = [];
    };
    const loan = (node, target) => {
      if (!node) return;
      const marker = doc.createComment("Frayer home");
      node.before(marker);
      loans.push({ node, marker });
      target.append(node);
    };
    const status = () => {
      get("[data-bio-save-status]").textContent = adapter.status();
    };
    function showFamily() {
      restoreLoans();
      meaning.replaceChildren();
      const family = adapter.families.find((f) => f.id === familySelect.value);
      if (!family || !current2) return;
      const paragraph = (text) => {
        const p = doc.createElement("p");
        p.textContent = text;
        meaning.append(p);
      };
      const belongs = current2.familyIds.includes(family.id);
      const wordRecord = adapter.words?.find((w) => w.term.toLocaleLowerCase() === current2.term.toLocaleLowerCase());
      if (adapter.words && !wordRecord) throw Error("Missing word-owned popup record: " + current2.term);
      if (wordRecord) {
        meaning.innerHTML = renderBiologyWordDetails(wordRecord, adapter.words, adapter.families);
        const owner = adapter.wordFrayers?.[wordRecord.id];
        const unlocked2 = Boolean(owner && adapter.unlocked(owner));
        get("[data-bio-locked]").textContent = !owner ? "This word is available for reference. It is not a separate saved Frayer target. Existing broader-concept writing remains in Core Vocabulary." : unlocked2 ? "This is the existing saved Frayer record. Review its stated scope before revising earlier writing." : "The word explanation is available now. Begin its associated lesson to unlock the saved Frayer.";
        if (unlocked2) {
          loan(adapter.frayer(owner), slot);
          loan(adapter.choices?.() ?? null, get("[data-bio-choices-slot]"));
          adapter.refresh();
        }
        status();
        return;
      }
      paragraph(belongs && current2.definition ? current2.definition : `${belongs ? "Family-level explanation" : "My chosen Frayer"} \u2014 ${family.label}: ${family.meaning}`);
      if (belongs && current2.definition) paragraph(`Concept family \u2014 ${family.label}: ${family.meaning}`);
      const heading = doc.createElement("h3");
      heading.textContent = "Word structure";
      meaning.append(heading);
      for (const note of family.wordAnalysis) paragraph(note);
      const unlocked = adapter.unlocked(family.id);
      get("[data-bio-locked]").textContent = unlocked ? "The same Frayer and saved work as Core Vocabulary. Six anchors and two learner choices." : "The meaning is available now. Begin the associated lesson to unlock this Frayer.";
      if (unlocked) {
        loan(adapter.frayer(family.id), slot);
        loan(adapter.choices?.() ?? null, get("[data-bio-choices-slot]"));
        adapter.refresh();
      }
      status();
    }
    const close = () => {
      if (dialog.open) dialog.close();
    };
    const onClose = () => {
      restoreLoans();
      root.dispatchEvent(new CustomEvent("biology-word-popup-close"));
      doc.documentElement.style.overflow = oldOverflow;
      for (const item of scrolls) {
        item.node.scrollLeft = item.x;
        item.node.scrollTop = item.y;
      }
      win.scrollTo(...windowScroll);
      trigger?.focus({ preventScroll: true });
    };
    const click = (event) => {
      const target = event.target instanceof Element ? event.target.closest("[data-bio-term]") : null;
      if (!target || !root.contains(target)) return;
      current2 = terms.get(target.dataset.bioTerm) ?? null;
      if (!current2) return;
      trigger = target;
      root.dispatchEvent(new CustomEvent("biology-word-popup-open"));
      const route2 = target.dataset.bioTermRoute;
      familySelect.replaceChildren();
      for (const family of adapter.families.filter((f) => current2.familyIds.includes(f.id)).sort((a, b) => Number(b.routes.includes(route2)) - Number(a.routes.includes(route2)))) {
        const option = doc.createElement("option");
        option.value = family.id;
        option.textContent = family.label;
        familySelect.append(option);
      }
      for (const id of adapter.words ? [] : adapter.selectedFamilies?.() ?? []) {
        if (current2.familyIds.includes(id)) continue;
        const family = adapter.families.find((f) => f.id === id);
        if (family) {
          const option = doc.createElement("option");
          option.value = id;
          option.textContent = `My chosen Frayer: ${family.label}`;
          familySelect.append(option);
        }
      }
      get("[data-bio-family-label]").hidden = familySelect.options.length < 2;
      get("#bio-vocabulary-title").textContent = target.textContent;
      get("[data-bio-frayer]").open = false;
      windowScroll = [win.scrollX, win.scrollY];
      scrolls = [];
      for (let parent = target.parentElement; parent; parent = parent.parentElement) scrolls.push({ node: parent, x: parent.scrollLeft, y: parent.scrollTop });
      oldOverflow = doc.documentElement.style.overflow;
      showFamily();
      dialog.showModal();
      doc.documentElement.style.overflow = "hidden";
      get("[data-bio-close]").focus({ preventScroll: true });
    };
    for (const section of adapter.sections()) {
      const seen = /* @__PURE__ */ new Set(), walker = doc.createTreeWalker(section, win.NodeFilter.SHOW_TEXT), nodes = [];
      while (walker.nextNode()) {
        const text = walker.currentNode;
        if (text.parentElement && !text.parentElement.closest(excluded)) nodes.push(text);
      }
      for (const node of nodes) {
        const matches = termMatches(node.data, [...terms.keys()], seen);
        if (!matches.length) continue;
        const fragment = doc.createDocumentFragment();
        let position = 0;
        for (const match of matches) {
          fragment.append(node.data.slice(position, match.start));
          const button = doc.createElement("button");
          button.type = "button";
          button.className = "bio-term";
          button.dataset.bioTerm = match.term;
          button.dataset.bioTermRoute = adapter.route(section);
          button.setAttribute("aria-haspopup", "dialog");
          button.setAttribute("aria-label", `Vocabulary: ${node.data.slice(match.start, match.end)}`);
          button.textContent = node.data.slice(match.start, match.end);
          fragment.append(button);
          position = match.end;
        }
        fragment.append(node.data.slice(position));
        node.replaceWith(fragment);
      }
    }
    const afterInput = () => win.setTimeout(status, 0);
    root.addEventListener("click", click);
    dialog.addEventListener("close", onClose);
    get("[data-bio-close]").addEventListener("click", close);
    familySelect.addEventListener("change", showFamily);
    dialog.addEventListener("input", afterInput);
    dialog.addEventListener("change", afterInput);
    dialog.addEventListener("click", afterInput);
    win.addEventListener("hashchange", close);
    return { dispose() {
      close();
      restoreLoans();
      root.removeEventListener("click", click);
      win.removeEventListener("hashchange", close);
      dialog.remove();
      style.remove();
    } };
  }

  // scripts/lib/biology30-pilot3/runtime.ts
  var NS = "biology30-unit-a-pilot-3:v1";
  var $ = (s, r = document) => r.querySelector(s);
  var all = (s, r = document) => Array.from(r.querySelectorAll(s));
  var esc2 = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  var state = { version: 1, revision: 0, current: {}, history: [] };
  var db;
  var ready = false;
  var busy = false;
  var failed = false;
  var queue = Promise.resolve();
  var pending = 0;
  var catalog = window.PILOT3_CATALOG;
  var message = (s) => {
    $("[data-local-status]").textContent = s;
  };
  var duration = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1e3));
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };
  var normalize = (s) => s.trim().toLowerCase().replace(/[.!]$/, "").replace(/\s+/g, " ");
  var storageRequest = (request) => new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  async function connect() {
    const request = indexedDB.open(NS, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("work");
    db = await storageRequest(request);
  }
  async function open() {
    const existing = typeof indexedDB.databases === "function" ? (await indexedDB.databases()).some((item) => item.name === NS) : true;
    if (existing) await connect();
    const saved = db ? await storageRequest(db.transaction("work").objectStore("work").get("state")) : null;
    if (saved) {
      if (saved.version !== 1 || !saved.current || !Array.isArray(saved.history)) throw Error("Unrecognized save. Existing record retained.");
      state = saved;
    }
    ready = true;
    message("Saved work opened. Local browser only; download a backup before changing devices.");
    render();
  }
  async function commit(next) {
    if (!db) await connect();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("work", "readwrite"), store = tx.objectStore("work"), read = store.get("state");
      let conflict = false;
      read.onsuccess = () => {
        if ((read.result?.revision ?? 0) !== state.revision) {
          conflict = true;
          tx.abort();
          return;
        }
        try {
          next.revision = state.revision + 1;
          store.put(next, "state");
        } catch {
          tx.abort();
        }
      };
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(Error(conflict ? "Another tab changed this work. Download your visible drafts, then reload." : "Saving failed. Your drafts remain visible; download them before leaving."));
      tx.onerror = () => {
      };
    });
  }
  function enqueue(action) {
    pending++;
    queue = queue.then(action).catch((e) => {
      failed = true;
      message(String(e));
    }).finally(() => {
      pending--;
    });
    return queue;
  }
  async function change(edit) {
    if (!ready) throw Error("Local saving is unavailable. Do not start until storage opens.");
    const next = structuredClone(state);
    edit(next);
    await commit(next);
    state = next;
    failed = false;
    message("Saved in this browser. Not sent to Brightspace.");
  }
  function current(section) {
    return state.current[section.dataset.activity];
  }
  function answer(q) {
    const field = $("[data-answer]:checked", q) ?? $("input[type=text][data-answer],select[data-answer]", q);
    return field?.value ?? "";
  }
  function snapshot(run, section) {
    for (const field of all("[data-writing],input[type=text][data-answer],select[data-answer]", section)) run.drafts[field.dataset.writing ?? field.id] = field.value;
    for (const field of all("input[type=radio]:checked", section)) run.drafts[field.name] = field.value;
  }
  function attempted(run, id) {
    return run.attempts.filter((a) => a.question === id);
  }
  function promptText(q, writing) {
    const copy = (writing ? q.querySelector(".paired-writing") ?? q : q).cloneNode(true);
    copy.querySelectorAll("input,select,textarea,button,label,output,[data-writing-status],[data-feedback],.muted").forEach((n) => n.remove());
    return copy.textContent?.replace(/\s+/g, " ").trim() ?? q.dataset.question;
  }
  var mode = (section) => section.dataset.activityMode ?? (section.dataset.activity === "lesson-check" ? "paired" : section.dataset.activity === "topic-review" ? "writing" : "drill");
  var limit = (field) => Number(field.dataset.answerLimit) || 900;
  function firstScore(run) {
    const ids = run.questionIds ?? [...new Set(run.attempts.filter((a) => a.correct !== null).map((a) => a.question))];
    const first = ids.map((id) => attempted(run, id)[0]).filter((a) => a && a.correct !== null);
    return { correct: first.filter((a) => a.correct).length, total: first.length };
  }
  function complete(run, section) {
    return all("[data-question]", section).every((q) => {
      const id = q.dataset.question, writing = $("[data-writing]", q);
      const written = () => writing && attempted(run, writing.dataset.writing).some((a) => a.answer === writing.value) && writing.value.trim() && writing.value.length <= limit(writing);
      if (mode(section) === "writing") return Boolean(written());
      if (mode(section) === "paired") return attempted(run, id).some((a) => a.correct) && Boolean(written());
      return attempted(run, id).length > 0;
    });
  }
  function progress() {
    const sections = all("[data-required-check]"), ids = sections.length ? sections.map((s) => s.dataset.activity) : ["lesson-check"];
    const done = ids.filter((id) => state.history.some((r) => r.activity === id)).length, percent = Math.round(done / ids.length * 100);
    $("[data-progress-count]").textContent = `${done} of ${ids.length} chapter checks`;
    $("[data-progress-fraction]").textContent = `${done} / ${ids.length}`;
    $("[data-progress-percent]").textContent = percent + "%";
    $("[data-progress-fill]").style.width = percent + "%";
  }
  function render() {
    for (const section of all("[data-activity]")) {
      const run = current(section);
      $("[data-start]", section).disabled = !ready || Boolean(run);
      $("[data-run-body]", section).disabled = !run || Boolean(run.endedAt);
      $("[data-submit-run]", section).disabled = !run || Boolean(run.endedAt);
      $("[data-redo]", section).hidden = !run?.endedAt;
      if (!run) continue;
      for (const field of all("[data-writing],input[type=text][data-answer],select[data-answer]", section)) {
        const value = run.drafts[field.dataset.writing ?? field.id] ?? "";
        if (document.activeElement !== field) field.value = value;
      }
      for (const field of all("input[type=radio]", section)) field.checked = run.drafts[field.name] === field.value;
      for (const q of all("[data-question]", section)) {
        const tries = attempted(run, q.dataset.question), last = tries.at(-1);
        const feedback = $("[data-feedback]", q);
        if (feedback) feedback.textContent = last ? `${last.correct === null ? "Self-report recorded" : last.correct ? "Correct" : "Not correct yet"}. ${tries.length} attempt(s). ${mode(section) === "paired" ? "First answer counts toward this run\u2019s mark." : ""}` : "";
        const gate = $("[data-unlock]", q);
        if (gate) gate.disabled = Boolean(run.endedAt) || !tries.some((a) => a.correct);
        const writing = $("[data-writing]", q);
        if (writing) {
          const status = $("[data-writing-status]", q);
          const recorded = attempted(run, writing.dataset.writing).at(-1);
          status.textContent = recorded?.answer === writing.value ? "Written response saved; not automatically graded." : writing.value.length > limit(writing) ? `Over ${limit(writing)} characters: draft retained, shorten before submitting.` : "";
        }
      }
      const labelingSummary = section.querySelector("[data-labeling-summary]");
      if (labelingSummary) {
        const questions = all("[data-question]", section), latest = questions.map((q) => attempted(run, q.dataset.question).at(-1)).filter(Boolean);
        const correct = latest.filter((a) => a?.correct).length, missing = questions.length - latest.length;
        labelingSummary.textContent = latest.length ? `Latest checks: ${correct} of ${latest.length} correct.${missing ? ` ${missing} label${missing === 1 ? " has" : "s have"} not been checked yet.` : " Check any label again after changing it."}` : `Check one letter at a time, or check all ${questions.length} together.`;
      }
      const score = firstScore(run);
      $("[data-run-status]", section).textContent = run.endedAt ? `Completed. ${mode(section) === "paired" ? `First-try mark: ${score.correct}/${score.total}. ` : ""}Elapsed: ${duration(run.endedAt - run.startedAt)}. Redo starts a new run and keeps this history.` : "In progress. Submit and finish stops the timer.";
    }
    progress();
    history();
    tick();
  }
  function tick() {
    for (const section of all("[data-activity]")) {
      const run = current(section), next = run ? duration((run.endedAt ?? Date.now()) - run.startedAt) : "Not started", output = $("[data-timer]", section);
      if (output.textContent !== next) output.textContent = next;
    }
  }
  function history() {
    const summaries = all("[data-activity]").filter((s) => mode(s) === "paired").flatMap((s) => {
      const runs = state.history.filter((r) => r.activity === s.dataset.activity).map(firstScore);
      if (!runs.length) return [];
      const best = runs.reduce((a, b) => b.correct / Math.max(b.total, 1) > a.correct / Math.max(a.total, 1) ? b : a);
      return [`${s.querySelector("h2")?.textContent ?? s.dataset.activity}: best ${best.correct}/${best.total}`];
    });
    $("[data-collection-status]").textContent = `${state.history.length} completed run(s). ${summaries.join(" \xB7 ")}`;
    $("[data-history]").innerHTML = state.history.map((r) => `<article class="history-run"><h3>${esc2(r.activity)} \xB7 ${new Date(r.startedAt).toLocaleString()}</h3><p>Elapsed ${duration(r.endedAt - r.startedAt)} \xB7 ${r.attempts.length} submitted attempts</p><details><summary>Review every submitted answer</summary>${r.attempts.map((a, i) => `<section><h4>Attempt ${i + 1}: ${esc2(a.question)}</h4><p>${esc2(a.prompt)}</p><pre>${esc2(a.answer)}</pre><p>${a.correct === null ? "Self-report or writing; not automatically graded" : a.correct ? "Correct" : "Incorrect"} \xB7 ${duration(a.elapsedMs)} since start \xB7 ${new Date(a.at).toLocaleString()}</p></section>`).join("")}</details></article>`).join("") || "<p>No completed runs yet. In-progress work is preserved separately.</p>";
    $("[data-frayer-history]").innerHTML = frayers.map((f) => `<article><h3>${esc2(wordData.words.find((w) => w.id === f.id)?.term)}</h3><p>${f.collected ? "Collected" : "Draft"}</p>${f.answers.map((a) => `<p>${esc2(a)}</p>`).join("")}</article>`).join("") || "<p>No words selected yet.</p>";
  }
  document.addEventListener("input", (event) => {
    const field = event.target, section = field.closest("[data-activity]");
    if (!section || !current(section) || current(section).endedAt) return;
    if (!field.matches("[data-writing],input[data-answer],select[data-answer]")) return;
    const id = section.dataset.activity, value = field.value, key = field.dataset.writing ?? (field.type === "radio" ? field.name : field.id);
    enqueue(async () => {
      await change((next) => {
        next.current[id].drafts[key] = value;
      });
      if (field.matches("[data-writing]")) {
        const max = limit(field);
        $("[data-writing-status]", field.closest(".question")).textContent = value.length > max ? `Over ${max} characters: draft saved locally, but not submitted. Shorten it to submit.` : `Draft saved locally \xB7 ${value.length}/${max} characters.`;
      }
    });
  });
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button"), section = button?.closest("[data-activity]");
    if (!button || !section) return;
    if (!button.matches("[data-start],[data-redo],[data-check],[data-check-labels],[data-self],[data-submit-writing],[data-submit-run]")) return;
    if (busy) return;
    busy = true;
    button.disabled = true;
    enqueue(async () => {
      let succeeded = false;
      try {
        await change((next) => {
          const id = section.dataset.activity;
          let run = next.current[id];
          if (button.matches("[data-start],[data-redo]")) {
            if (run && !run.endedAt) throw Error("This activity already has a running timer.");
            next.current[id] = { id: crypto.randomUUID(), activity: id, startedAt: Date.now(), drafts: {}, attempts: [], questionIds: all("[data-question]", section).map((q2) => q2.dataset.question), keys: structuredClone(catalog) };
            return;
          }
          if (!run || run.endedAt) throw Error("Start a new run first.");
          snapshot(run, section);
          if (button.matches("[data-submit-run]")) {
            if (!complete(run, section)) throw Error("Attempt every item first. For a paired check, correct each multiple-choice question and save its written response.");
            run.endedAt = Date.now();
            next.history.push(structuredClone(run));
            return;
          }
          if (button.hasAttribute("data-check-labels")) {
            const keys = run.keys ?? catalog;
            let checked = 0;
            for (const item of all("[data-question]", section)) {
              const qid2 = item.dataset.question, response2 = answer(item);
              if (!response2.trim()) continue;
              const original = keys.questions.find((a) => a.id === qid2) ?? catalog.questions.find((a) => a.id === qid2), drill = [...keys.blanks, ...keys.labels].find((a) => a.id === qid2) ?? [...catalog.blanks, ...catalog.labels].find((a) => a.id === qid2), correct2 = original ? response2 === original.correct : Boolean(drill) && drill.answers.some((a) => normalize(a) === normalize(response2));
              run.attempts.push({ question: qid2, answer: response2, correct: correct2, at: Date.now(), elapsedMs: Date.now() - run.startedAt, prompt: promptText(item, false) });
              checked++;
            }
            if (!checked) throw Error("Choose at least one label first.");
            return;
          }
          const q = button.closest("[data-question]"), qid = q.dataset.question;
          let response = "", correct = null, question = qid;
          if (button.matches("[data-submit-writing]")) {
            const field = $("[data-writing]", q);
            question = field.dataset.writing;
            response = field.value;
            if (!response.trim() || response.length > limit(field)) throw Error(`Write a response of 1\u2013${limit(field)} characters. Your draft has not been removed.`);
            if (mode(section) === "paired" && !attempted(run, qid).some((a) => a.correct)) throw Error("Answer the multiple-choice question correctly first.");
          } else if (button.hasAttribute("data-self")) response = button.dataset.self;
          else {
            response = answer(q);
            if (!response.trim()) throw Error("Choose or enter an answer first.");
            const keys = run.keys ?? catalog, original = keys.questions.find((a) => a.id === qid) ?? catalog.questions.find((a) => a.id === qid), drill = [...keys.blanks, ...keys.labels].find((a) => a.id === qid) ?? [...catalog.blanks, ...catalog.labels].find((a) => a.id === qid);
            correct = original ? response === original.correct : Boolean(drill) && drill.answers.some((a) => normalize(a) === normalize(response));
            if (original) response = q.querySelector("[data-answer]:checked")?.closest("label")?.textContent?.trim() ?? response;
          }
          run.attempts.push({ question, answer: response, correct, at: Date.now(), elapsedMs: Date.now() - run.startedAt, prompt: promptText(q, button.matches("[data-submit-writing]")) });
        });
        succeeded = true;
        render();
      } finally {
        busy = false;
        button.disabled = false;
        if (succeeded) render();
      }
    });
  });
  var wordPayload = JSON.parse($("#pilot3-words").textContent);
  var wordData = wordPayload.data;
  var wordSchema = wordPayload.schema;
  var frayers = [];
  var frayerError = false;
  var frayerMessage = "Saved in this browser.";
  var frayerBaseline = null;
  try {
    const raw = localStorage.getItem(NS + ":frayers");
    frayerBaseline = raw;
    if (raw) frayers = unpackWordFrayers(JSON.parse(raw), wordSchema);
  } catch {
    frayerError = true;
    message("Existing vocabulary save could not be read. It has not been overwritten.");
  }
  mountWordFrayerControls(document.body, wordData, wordSchema, {
    get: () => frayers,
    set: (slots) => {
      frayers = slots;
    },
    save: () => {
      try {
        if (frayerError) throw Error("Existing vocabulary data needs recovery before saving.");
        if (localStorage.getItem(NS + ":frayers") !== frayerBaseline) throw Error("Another tab changed these Frayers. Copy your drafts before reloading.");
        const payload = JSON.stringify(packWordFrayers(frayers, wordSchema));
        if (payload.length > 44e3) throw Error("Vocabulary exceeds the save budget.");
        localStorage.setItem(NS + ":frayers", payload);
        frayerBaseline = payload;
        frayerMessage = "Saved in this browser.";
        history();
        return { saved: true, message: frayerMessage };
      } catch (e) {
        frayerMessage = String(e) + " Drafts remain visible; copy before leaving.";
        failed = true;
        return { saved: false, message: frayerMessage };
      }
    }
  });
  mountVocabularyPanel({ root: document.body, families: wordData.categories.map((c) => ({ id: c.id, label: c.label, meaning: "", wordAnalysis: [], routes: ["lesson-01"] })), terms: wordData.words.map((w) => ({ term: w.term, definition: w.definition, familyIds: w.categoryIds })), words: wordData.words, wordFrayers: Object.fromEntries(wordData.words.map((w) => [w.id, w.id])), sections: () => [], route: () => "lesson-01", unlocked: () => true, frayer: (id) => $(`[data-word-frayer="${CSS.escape(id)}"]`), refresh: () => {
  }, status: () => frayerMessage });
  function syncPopup() {
    const dialog = $("dialog.bio-vocabulary");
    if (!dialog.open) return;
    const shown = $("[data-biology-word-details]", dialog);
    if (!shown) return;
    const canonical = $(`[data-biology-word-view="${CSS.escape(shown.dataset.biologyWordDetails)}"] [data-biology-word-details]`);
    if (canonical) $("[data-bio-meaning]", dialog).replaceChildren(canonical.cloneNode(true));
    $("[data-bio-locked]", dialog).textContent = "The same word-owned Frayer as Core Vocabulary. Choose up to eight words.";
  }
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-bio-term]")) syncPopup();
  });
  $("[data-bio-family]").addEventListener("change", syncPopup);
  function showVideos(root) {
    for (const section of all("[data-video]", root)) {
      const control = section.querySelector("[data-load-video]");
      if (control) control.hidden = true;
      const slot = $("[data-video-slot]", section);
      if (slot.querySelector("iframe")) continue;
      const frame = document.createElement("iframe");
      frame.src = "https://www.youtube-nocookie.com/embed/" + section.dataset.video;
      frame.title = section.querySelector("h2,h3")?.textContent?.trim() ?? "Lesson video";
      frame.allow = "encrypted-media; picture-in-picture; fullscreen";
      frame.allowFullscreen = true;
      frame.loading = "lazy";
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      slot.replaceChildren(frame);
    }
  }
  function route() {
    let id = location.hash.slice(1) || "overview";
    if (!all(".course-page").some((p) => p.id === id)) id = "overview";
    for (const page2 of all(".course-page")) page2.hidden = page2.id !== id;
    const page = $("#" + CSS.escape(id));
    if (document.readyState === "complete") showVideos(page);
    else window.addEventListener("load", () => setTimeout(() => showVideos(page), 0), { once: true });
    for (const link of all(".nav-link")) {
      const active = link.hash === "#" + id;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
    document.body.classList.remove("nav-open");
    requestAnimationFrame(() => window.scrollTo(0, 0));
    history();
  }
  window.addEventListener("hashchange", route);
  route();
  var textbookDialog = $("[data-textbook-dialog]");
  var textbookReturnFocus = null;
  for (const link of all("[data-book-page]")) link.setAttribute("aria-haspopup", "dialog");
  function openTextbookPage(link) {
    const pdfPage = Number(link.dataset.bookPage);
    if (!Number.isInteger(pdfPage) || pdfPage < 1) return;
    const printedPage = pdfPage + 359, externalSrc = "assets/textbook/chapter-11.pdf#page=" + pdfPage, readerSrc = `assets/textbook/chapter-11.pdf?readerPage=${pdfPage}#page=${pdfPage}`;
    textbookReturnFocus = link;
    $("[data-textbook-dialog-title]").textContent = "Textbook page " + printedPage;
    $("[data-textbook-dialog-meta]").textContent = `Chapter 11 \xB7 PDF page ${pdfPage} of 44`;
    $("[data-textbook-dialog-frame]").src = readerSrc;
    $("[data-textbook-dialog-external]").href = externalSrc;
    textbookDialog.showModal();
    document.documentElement.style.overflow = "hidden";
    $("[data-textbook-close]").focus({ preventScroll: true });
  }
  textbookDialog.addEventListener("close", () => {
    document.documentElement.style.overflow = "";
    textbookReturnFocus?.focus({ preventScroll: true });
    textbookReturnFocus = null;
  });
  var linkedWord = new URLSearchParams(location.search).get("word");
  if (linkedWord && wordData.words.some((w) => w.id === linkedWord)) $(`[data-biology-select-word="${CSS.escape(linkedWord)}"]`)?.click();
  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-book-page],[data-textbook-close],[data-load-video],[data-sidebar-toggle],[data-menu-button],[data-download],[data-print],[data-save-exit]");
    if (!target) return;
    if (target.hasAttribute("data-book-page")) {
      event.preventDefault();
      openTextbookPage(target);
    }
    if (target.hasAttribute("data-textbook-close")) textbookDialog.close();
    if (target.hasAttribute("data-load-video")) showVideos(target.closest("[data-video]"));
    if (target.hasAttribute("data-sidebar-toggle")) {
      document.body.classList.toggle("sidebar-collapsed");
      target.setAttribute("aria-expanded", String(!document.body.classList.contains("sidebar-collapsed")));
    }
    if (target.hasAttribute("data-menu-button")) {
      document.body.classList.toggle("nav-open");
      target.setAttribute("aria-expanded", String(document.body.classList.contains("nav-open")));
    }
    if (target.hasAttribute("data-print")) window.print();
    if (target.hasAttribute("data-download")) download();
    if (target.hasAttribute("data-save-exit")) enqueue(async () => {
      if (failed) throw Error("Some writing has not saved. Download your collection and visible drafts before leaving.");
      message("Saved locally. You can now close this tab; download a backup before clearing browser data.");
      location.hash = "overview";
    });
  });
  function download() {
    const payload = { course: NS, exportedAt: (/* @__PURE__ */ new Date()).toISOString(), state, frayers, visibleDrafts: all("[data-writing],input[type=text][data-answer],textarea[data-word-answer]").map((f) => ({ id: f.dataset.writing ?? f.id, word: f.closest("[data-word-frayer]")?.dataset.wordFrayer, field: f.dataset.wordAnswer, value: f.value })) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "biology30-pilot3-process-collection.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
  }
  window.addEventListener("beforeunload", (event) => {
    if (failed || busy || pending) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
  setInterval(tick, 1e3);
  open().catch((e) => {
    failed = true;
    message("Saving unavailable: " + e + ". Existing work was not changed.");
  });
})();
