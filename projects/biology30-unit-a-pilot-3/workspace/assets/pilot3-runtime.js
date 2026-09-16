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

  // scripts/lib/biology30-pilot3/practice-engine.ts
  var hash = (value) => {
    let h = 2166136261;
    for (const ch of value) {
      h ^= ch.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };
  var rng = (seed) => () => {
    seed |= 0;
    seed = seed + 1831565813 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  var shuffled = (items, random) => items.map((value) => ({ value, key: random() })).sort((a, b) => a.key - b.key).map((x) => x.value);
  var normalizePracticeAnswer = (value) => value.trim().toLocaleLowerCase().replace(/[.!?]+$/u, "").trim().replace(/\s+/g, " ");
  function validatePracticeBank(bank) {
    const errors = [];
    const lessonIds = new Set(bank.lessons.map((x) => x.id)), legacyRestorationLessonIds = /* @__PURE__ */ new Set(["lesson-14"]), ids = /* @__PURE__ */ new Set();
    if (bank.schemaVersion !== 1) errors.push("Unsupported bank schema.");
    for (const concept of bank.concepts) {
      if (ids.has(concept.id)) errors.push(`Duplicate concept ${concept.id}.`);
      ids.add(concept.id);
      if (!lessonIds.has(concept.lessonId) && !legacyRestorationLessonIds.has(concept.lessonId)) errors.push(`Unknown lesson ${concept.lessonId}.`);
      if (!concept.sourceRefs.length) errors.push(`Missing source for ${concept.id}.`);
      if (!concept.answers.length || !Array.isArray(concept.aliases)) errors.push(`Missing authored answers for ${concept.id}.`);
      if (!concept.cue || !concept.explanation || concept.contrast.length < 2 || !concept.relationships.length) errors.push(`Incomplete authored support for ${concept.id}.`);
      if (concept.sequence.length < 3) errors.push(`Sequence too short for ${concept.id}.`);
      if (concept.mcVariants.length < 7) errors.push(`Too few MC variants for ${concept.id}.`);
      for (const variant of concept.mcVariants) {
        const id = `${concept.id}:mc-${variant.id}`;
        if (ids.has(id)) errors.push(`Duplicate MC variant ${id}.`);
        ids.add(id);
        if (!variant.prompt || !variant.answer || ![1, 2, 3, 4].includes(variant.difficulty)) errors.push(`Malformed MC variant ${id}.`);
      }
    }
    for (const lesson of bank.lessons) if (!bank.concepts.some((x) => x.lessonId === lesson.id)) errors.push(`No concepts for ${lesson.id}.`);
    return errors;
  }
  function variants(concept, kind, peers, random) {
    const distractors = shuffled(peers.filter((x) => x.id !== concept.id && x.lessonId === concept.lessonId), random).slice(0, 3);
    const base = { conceptId: concept.id, lessonId: concept.lessonId, cue: concept.cue, explanation: `${concept.explanation} Source: ${concept.sourceRefs.join("; ")}`, sourceRefs: concept.sourceRefs };
    const authoredMc = () => concept.mcVariants.map((variant) => {
      const source = variant.optionSource === "terms" ? [concept.term, ...concept.relationships, ...peers.map((x) => x.term)] : variant.optionSource === "definitions" ? [concept.definition, concept.misconception, ...peers.flatMap((x) => [x.definition, x.misconception])] : variant.optionSource === "scenarios" ? [concept.scenario, ...peers.map((x) => x.scenario), ...concept.relationships] : [...concept.sequence, ...peers.flatMap((x) => x.sequence)];
      const options2 = shuffled([...new Set([variant.answer, ...source].filter(Boolean))].slice(0, 8), random).slice(0, 4);
      if (!options2.includes(variant.answer)) options2[options2.length - 1] = variant.answer;
      return { ...base, id: `${concept.id}:mc-${variant.id}`, family: variant.skill, interaction: "single", skill: variant.skill, difficulty: variant.difficulty, prompt: variant.prompt, answers: [variant.answer], options: shuffled([...new Set(options2)], random) };
    });
    if (kind === "flashcards") return [
      { ...base, id: `${concept.id}:card-term`, family: "recall", interaction: "flashcard", skill: "recall", prompt: concept.term, answers: [concept.definition] },
      { ...base, id: `${concept.id}:card-definition`, family: "reverse-retrieval", interaction: "flashcard", skill: "recall", prompt: concept.definition, answers: [concept.term] },
      { ...base, id: `${concept.id}:card-scenario`, family: "application", interaction: "flashcard", skill: "application", prompt: concept.scenario, answers: [`${concept.term} \u2014 ${concept.definition}`] },
      { ...base, id: `${concept.id}:card-error`, family: "error-correction", interaction: "flashcard", skill: "error-correction", prompt: `Correct this idea: ${concept.misconception}`, answers: [concept.definition] }
    ];
    if (kind === "blanks") return [
      { ...base, id: `${concept.id}:blank-definition`, family: "definition", interaction: "typed", skill: "recall", prompt: `The term for \u201C${concept.definition}\u201D is _____.`, answers: [...concept.answers, ...concept.aliases] },
      { ...base, id: `${concept.id}:blank-scenario`, family: "scenario", interaction: "typed", skill: "application", prompt: `This situation illustrates _____: ${concept.scenario}`, answers: [...concept.answers, ...concept.aliases] },
      { ...base, id: `${concept.id}:blank-sequence`, family: "pathway", interaction: "typed", skill: "sequencing", prompt: `Complete the pathway: ${concept.sequence.slice(0, -1).join(" \u2192 ")} \u2192 _____.`, answers: [concept.sequence.at(-1)] }
    ];
    if (kind === "multiple-choice") return authoredMc();
    const options = shuffled([concept.term, ...distractors.map((x) => x.term)], random);
    const sequenceOptions = shuffled(concept.sequence, random);
    return [
      { ...base, id: `${concept.id}:mixed-typed`, family: "retrieval", interaction: "typed", skill: "recall", prompt: `Name the concept: ${concept.definition}`, answers: [...concept.answers, ...concept.aliases] },
      ...authoredMc().slice(0, 2),
      { ...base, id: `${concept.id}:mixed-single`, family: "discrimination", interaction: "single", skill: "comparison", prompt: `Which concept means \u201C${concept.definition}\u201D?`, answers: [concept.term], options },
      { ...base, id: `${concept.id}:mixed-application`, family: "application", interaction: "single", skill: "application", prompt: concept.scenario, answers: [concept.term], options },
      { ...base, id: `${concept.id}:mixed-multiple`, family: "odd-one-out", interaction: "multiple", skill: "comparison", prompt: `Select both statements that belong with ${concept.term}.`, answers: [concept.definition, concept.scenario], options: shuffled([concept.definition, concept.scenario, ...distractors.slice(0, 2).map((x) => x.definition)], random) },
      { ...base, id: `${concept.id}:mixed-tf`, family: "misconception", interaction: "true-false", skill: "error-correction", prompt: concept.misconception, answers: ["false"], options: ["true", "false"] },
      { ...base, id: `${concept.id}:mixed-order`, family: "sequence", interaction: "ordering", skill: "sequencing", prompt: `Put the ${concept.term} steps in order.`, answers: concept.sequence, options: sequenceOptions },
      ...concept.id === "neuron-parts" ? [{ ...base, id: "neuron-parts:mixed-diagram", family: "diagram", interaction: "diagram", skill: "diagram-reading", prompt: "In the corrected A\u2013J neural-pathway diagram, which letter identifies the cell body?", answers: ["E"], options: ["E", "F", "G", "H"] }] : []
    ];
  }
  function generatePracticeSession(bank, kind, settings, seed, evidence = {}, avoidIds = []) {
    const errors = validatePracticeBank(bank);
    if (errors.length) throw Error(errors.join(" "));
    const random = rng(seed);
    const concepts = bank.concepts.filter((x) => settings.lessonId === "all" ? !x.lessonId.match(/lesson-1[34]/) : settings.lessonId === "foundations" ? ["lesson-01", "lesson-02", "lesson-03"].includes(x.lessonId) : x.lessonId === settings.lessonId);
    let pool = shuffled(concepts.flatMap((c) => variants(c, kind, concepts, random)), random);
    if (kind === "multiple-choice" && settings.difficulty && settings.difficulty !== "mixed") {
      const levels = settings.difficulty === "foundation" ? [1] : settings.difficulty === "developing" ? [2] : [3, 4];
      pool = pool.filter((x) => x.difficulty && levels.includes(x.difficulty));
    }
    const selected = [];
    const avoided = new Set(avoidIds), ordered = [...pool.filter((x) => !avoided.has(x.id)), ...pool.filter((x) => avoided.has(x.id))];
    let last, streak = 0;
    const add = (item, family) => {
      if (!item || selected.some((x) => x.id === item.id)) return false;
      const nextStreak = item.interaction === last ? streak + 1 : 1;
      if (kind === "mixed-practice" && nextStreak > 2) return false;
      selected.push(family ? { ...item, family } : item);
      last = item.interaction;
      streak = nextStreak;
      return true;
    };
    if (kind === "mixed-practice" && settings.count >= 10) {
      const wanted = ["retrieval", "discrimination", "application", "retrieval", "sequence", "misconception", "discrimination", "application", "diagram-pathway", "adaptive-review"];
      for (const family of wanted) {
        let candidate;
        if (family === "diagram-pathway") candidate = ordered.find((x) => x.family === "diagram") ?? ordered.find((x) => x.family === "sequence");
        else if (family === "adaptive-review") {
          const weakest = [...concepts].sort((a, b) => {
            const ea = evidence[a.id] ?? { correct: 0, attempts: 0 }, eb = evidence[b.id] ?? { correct: 0, attempts: 0 };
            return ea.correct / Math.max(1, ea.attempts) - eb.correct / Math.max(1, eb.attempts);
          })[0];
          candidate = ordered.find((x) => x.conceptId === weakest?.id);
        } else candidate = ordered.find((x) => x.family === family);
        add(candidate, family);
      }
    }
    if (kind === "multiple-choice" && settings.lessonId === "all") {
      for (const lesson of shuffled(bank.lessons.filter((x) => !x.optional), random).slice(0, settings.count)) add(ordered.find((x) => x.lessonId === lesson.id));
    }
    for (const item of ordered) {
      if (selected.length >= settings.count) break;
      add(item);
    }
    return { schemaVersion: 1, seed, bankVersion: bank.bankVersion, generatorVersion: bank.generatorVersion, kind, settings, items: selected, position: 0, attempts: [], feedback: "none", adaptations: [], startedWithEvidence: evidence };
  }
  function gradeGeneratedItem(item, answer2) {
    const actual = answer2.map(normalizePracticeAnswer), expected = item.answers.map(normalizePracticeAnswer);
    if (item.interaction === "typed") return actual.length === 1 && expected.includes(actual[0]);
    if (item.interaction === "ordering") return actual.length === expected.length && actual.every((x, i) => x === expected[i]);
    return actual.length === expected.length && expected.every((x) => actual.includes(x));
  }
  function compactResumeProjection(sessions, performance) {
    return { schemaVersion: 1, bankVersion: Object.values(sessions)[0]?.bankVersion ?? "", sessions: Object.fromEntries(Object.entries(sessions).map(([id, s]) => [id, { seed: s.seed, kind: s.kind, settings: s.settings, items: s.items.map((x) => ({ id: x.id, options: x.options })), position: s.position, attempts: s.attempts, feedback: s.feedback, adaptations: s.adaptations }])), performance };
  }
  function restoreGeneratedItem(bank, kind, id, options) {
    const conceptId = id.split(":")[0], concept = bank.concepts.find((x) => x.id === conceptId);
    if (!concept) throw Error(`Missing authored concept ${conceptId}.`);
    const item = variants(concept, kind, bank.concepts.filter((x) => x.lessonId === concept.lessonId), rng(hash(id))).find((x) => x.id === id);
    if (!item) throw Error(`Missing authored variant ${id}.`);
    return { ...item, options: options ?? item.options };
  }
  function renderGeneratedItem(item, index, total, attempts) {
    const tried = attempts.filter((x) => x.itemId === item.id), locked = item.interaction === "flashcard" && tried.length > 0 || tried.some((x) => x.correct) || tried.length >= 2;
    const choices = (item.options ?? []).map((option, i) => `<label class="practice-choice"><input data-generated-answer type="${item.interaction === "multiple" ? "checkbox" : "radio"}" name="generated-${index}" value="${escapeHtml(option)}" ${locked ? "disabled" : ""}> ${escapeHtml(option)}</label>`).join("");
    const input = item.interaction === "typed" ? `<label for="generated-answer-${index}">Your answer</label><input id="generated-answer-${index}" data-generated-answer type="text" autocomplete="off" ${locked ? "disabled" : ""}>` : item.interaction === "ordering" ? `<ol class="practice-order" data-practice-order>${(item.options ?? []).map((x, i) => `<li><label><span>${i + 1}.</span><select data-generated-answer ${locked ? "disabled" : ""}>${(item.options ?? []).map((y) => `<option value="${escapeHtml(y)}">${escapeHtml(y)}</option>`).join("")}</select></label></li>`).join("")}</ol>` : choices;
    const feedback = tried.length ? tried.at(-1).correct === null ? `Self-assessment recorded: ${tried.at(-1).answer[0] === "recalled" ? "recalled" : "study again"}. ${item.explanation}` : tried.at(-1).correct ? `Correct. ${item.explanation}` : tried.length === 1 ? `Not yet. Cue: ${item.cue}` : `Answer: ${item.answers.join(" \u2192 ")}. ${item.explanation}` : "";
    const diagram = item.interaction === "diagram" ? '<img class="practice-diagram" src="assets/source/neural-pathway-labeling-corrected.png" alt="Corrected neural pathway diagram labeled A through J.">' : "";
    return `<div class="practice-progress"><span>Question ${index + 1} of ${total}</span><progress value="${index + 1}" max="${total}"></progress></div><section class="question generated-question" data-generated-item="${escapeHtml(item.id)}"><p class="practice-kind">${escapeHtml(item.family.replaceAll("-", " "))}${item.difficulty ? ` \xB7 Level ${item.difficulty}` : ""}</p><h3>${escapeHtml(item.prompt)}</h3>${diagram}${item.interaction === "flashcard" ? `<button type="button" data-generated-reveal ${tried.length ? "hidden" : ""}>Reveal answer</button><div data-generated-reveal-panel hidden><p>${escapeHtml(item.answers.join(" \u2014 "))}</p><button type="button" data-generated-self="recalled">I recalled it</button><button type="button" data-generated-self="study-again">Study again</button></div>` : `${input}<button type="button" data-generated-check ${locked ? "disabled" : ""}>Check answer</button>`}<p data-generated-feedback role="status" aria-live="polite">${escapeHtml(feedback)}</p>${locked ? '<button type="button" data-generated-next>Next question</button>' : ""}</section>`;
  }
  var escapeHtml = (value) => value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

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
  var practiceBank = window.PILOT3_PRACTICE_BANK;
  var PROJECTION_KEY = "biology30-unit-a-pilot-3:generated-practice-resume:v1";
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
    } else {
      const portable = localStorage.getItem(PROJECTION_KEY);
      if (portable) {
        try {
          const parsed = JSON.parse(portable);
          if (parsed.schemaVersion !== 1 || !parsed.sessions || parsed.bankVersion !== practiceBank.bankVersion) throw Error();
          for (const [activity, value] of Object.entries(parsed.sessions)) {
            if (!value.items || !Array.isArray(value.attempts)) throw Error();
            const items = value.items.map((x) => restoreGeneratedItem(practiceBank, value.kind, x.id, x.options)), generatedSession = { schemaVersion: 1, bankVersion: parsed.bankVersion, generatorVersion: practiceBank.generatorVersion, feedback: "none", adaptations: [], startedWithEvidence: parsed.performance ?? {}, ...value, items };
            state.current[activity] = { id: `portable-${activity}-${generatedSession.seed}`, activity, startedAt: value.startedAt ?? Date.now(), drafts: {}, attempts: generatedSession.attempts.map((a) => {
              const item = generatedSession.items.find((i) => i.id === a.itemId);
              return { question: a.itemId, answer: a.answer.join(" \u2192 "), correct: a.correct, at: a.at, elapsedMs: 0, prompt: item?.prompt ?? a.itemId, conceptId: item?.conceptId, skill: item?.skill, generatedItemId: a.itemId, firstTry: a.firstTry };
            }), questionIds: generatedSession.items.map((x) => x.id), generatedSession };
          }
        } catch {
          throw Error("Portable practice save is malformed or uses an unavailable bank version. It has been retained for recovery and no new session was created.");
        }
      }
    }
    ready = true;
    message("Saved work opened. Local browser only; print or save completed work as a PDF before changing devices.");
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
      tx.onabort = () => reject(Error(conflict ? "Another tab changed this work. Copy your visible drafts, then reload." : "Saving failed. Your drafts remain visible; copy them before leaving."));
      tx.onerror = () => {
      };
    });
  }
  function generatedPerformance(next) {
    const result = {};
    for (const run of [...next.history, ...Object.values(next.current)]) for (const attempt of run.generatedSession?.attempts ?? []) {
      const item = run.generatedSession.items.find((x) => x.id === attempt.itemId);
      if (!item) continue;
      const row = result[item.conceptId] ??= { correct: 0, attempts: 0 };
      row.attempts++;
      if (attempt.firstTry && attempt.correct) row.correct++;
    }
    return result;
  }
  function writeResumeProjection(next) {
    const active = Object.entries(next.current).filter(([, run]) => run.generatedSession && !run.endedAt), sessions = Object.fromEntries(active.map(([id, run]) => [id, run.generatedSession]));
    if (!active.length) {
      localStorage.removeItem(PROJECTION_KEY);
      return;
    }
    const projection = compactResumeProjection(sessions, generatedPerformance(next));
    for (const [id, run] of active) projection.sessions[id].startedAt = run.startedAt;
    const raw = JSON.stringify(projection), frayerRaw = localStorage.getItem(NS + ":frayers") ?? "";
    if (raw.length + frayerRaw.length > 6e4) throw Error("Portable LMS resume exceeds the 60,000-character save budget. Local browser work remains intact.");
    localStorage.setItem(PROJECTION_KEY, raw);
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
    try {
      writeResumeProjection(next);
      failed = false;
      message("Saved in this browser. LMS resume projection updated when available.");
    } catch (e) {
      failed = true;
      message(String(e));
    }
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
      if (section.dataset.generatedPractice && (!run || run.generatedSession)) {
        renderGeneratedSection(section, run);
        continue;
      }
      $("[data-start]", section).disabled = !ready || Boolean(run);
      $("[data-run-body]", section).disabled = !run || Boolean(run.endedAt);
      const reset = section.querySelector("[data-reset-run]");
      if (reset) reset.hidden = !run || Boolean(run.endedAt);
      $("[data-submit-run]", section).disabled = !run || Boolean(run.endedAt);
      $("[data-redo]", section).hidden = !run?.endedAt;
      if (!run) {
        if (reset) {
          for (const field of all("[data-writing],input[data-answer],select[data-answer]", section)) field.value = "";
          for (const field of all("input[type=radio]", section)) field.checked = false;
          for (const feedback of all("[data-feedback]", section)) feedback.textContent = "";
          const summary = section.querySelector("[data-labeling-summary]");
          if (summary) summary.textContent = `Check one letter at a time, or check all ${all("[data-question]", section).length} together.`;
          $("[data-run-status]", section).textContent = "";
        }
        continue;
      }
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
      const output = section.querySelector("[data-timer]");
      if (!output) continue;
      const run = current(section), next = run ? duration((run.endedAt ?? Date.now()) - run.startedAt) : "Not started";
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
    $("[data-history]").innerHTML = state.history.map((r) => `<article class="history-run"><h3>${esc2(r.activity)} \xB7 ${new Date(r.startedAt).toLocaleString()}</h3><p>Elapsed ${duration(r.endedAt - r.startedAt)} \xB7 ${r.attempts.length} submitted attempts</p><details><summary>Review every submitted answer</summary>${r.attempts.map((a, i) => `<section><h4>Attempt ${i + 1}: ${esc2(a.question)}</h4><p>${esc2(a.prompt)}</p>${a.displayedOptions?.length ? `<p>Options shown: ${a.displayedOptions.map(esc2).join(" \xB7 ")}</p>` : ""}<pre>${esc2(a.answer)}</pre>${a.correctAnswer?.length ? `<p>Correct answer: ${a.correctAnswer.map(esc2).join(" \u2192 ")}</p>` : ""}<p>${a.correct === null ? "Self-report or writing; not automatically graded" : a.correct ? "Correct" : "Incorrect"} \xB7 ${duration(a.elapsedMs)} since start \xB7 ${new Date(a.at).toLocaleString()}</p></section>`).join("")}</details></article>`).join("") || "<p>No completed runs yet. In-progress work is preserved separately.</p>";
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
  function requestPracticeReset(button) {
    if (button.hasAttribute("data-reset-confirmed")) return true;
    const existing = button.parentElement?.querySelector("[data-practice-reset-confirmation]");
    if (existing) {
      existing.querySelector("button")?.focus();
      return false;
    }
    const panel = document.createElement("div");
    panel.dataset.practiceResetConfirmation = "";
    panel.setAttribute("role", "group");
    panel.setAttribute("aria-label", "Confirm practice reset");
    const action = button.hasAttribute("data-generated-reset") ? "data-generated-reset" : "data-reset-run";
    panel.innerHTML = `<p>Clear this unfinished practice and return to the start screen? Previously completed work in All My Work will be kept.</p><div class="practice-reset-actions"><button type="button" ${action} data-reset-confirmed>Reset unfinished practice</button><button type="button" data-reset-cancel>Keep working</button></div>`;
    button.after(panel);
    panel.querySelector("[data-reset-cancel]").addEventListener("click", () => {
      panel.remove();
      button.focus();
    });
    panel.querySelector("button").focus();
    return false;
  }
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button"), section = button?.closest("[data-activity]");
    if (!button || !section) return;
    if (!button.matches("[data-start],[data-redo],[data-reset-run],[data-check],[data-check-labels],[data-self],[data-submit-writing],[data-submit-run]")) return;
    if (button.hasAttribute("data-reset-run") && !requestPracticeReset(button)) return;
    if (busy) return;
    busy = true;
    button.disabled = true;
    enqueue(async () => {
      let succeeded = false;
      try {
        await change((next) => {
          const id = section.dataset.activity;
          let run = next.current[id];
          if (button.hasAttribute("data-reset-run")) {
            if (!run || run.endedAt) throw Error("There is no unfinished practice to reset.");
            delete next.current[id];
            return;
          }
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
              const original = keys.questions.find((a) => a.id === qid2) ?? catalog.questions.find((a) => a.id === qid2), drill = [...keys.blanks, ...keys.labels].find((a) => a.id === qid2) ?? [...catalog.blanks, ...catalog.labels].find((a) => a.id === qid2), inline = (item.dataset.answers ?? "").split("|").filter(Boolean), correct2 = inline.length ? inline.some((a) => normalize(a) === normalize(response2)) : original ? response2 === original.correct : Boolean(drill) && drill.answers.some((a) => normalize(a) === normalize(response2));
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
            const keys = run.keys ?? catalog, original = keys.questions.find((a) => a.id === qid) ?? catalog.questions.find((a) => a.id === qid), drill = [...keys.blanks, ...keys.labels].find((a) => a.id === qid) ?? [...catalog.blanks, ...catalog.labels].find((a) => a.id === qid), inline = (q.dataset.answers ?? "").split("|").filter(Boolean);
            correct = inline.length ? inline.some((a) => normalize(a) === normalize(response)) : original ? response === original.correct : Boolean(drill) && drill.answers.some((a) => normalize(a) === normalize(response));
            if (original) response = q.querySelector("[data-answer]:checked")?.closest("label")?.textContent?.trim() ?? response;
          }
          run.attempts.push({ question, answer: response, correct, at: Date.now(), elapsedMs: Date.now() - run.startedAt, prompt: promptText(q, button.matches("[data-submit-writing]")) });
        });
        succeeded = true;
        if (button.hasAttribute("data-reset-run")) for (const panel of all("[data-practice-reset-confirmation]", section)) panel.remove();
        render();
      } finally {
        busy = false;
        button.disabled = false;
        if (succeeded) render();
      }
    });
  });
  function practiceOptions(select, kind) {
    if (select.options.length) return;
    select.add(new Option("All Chapter 11", "all", true, true));
    if (kind === "multiple-choice") select.add(new Option("Lessons 1\u20133 foundations", "foundations"));
    for (const lesson of practiceBank.lessons) {
      if (kind === "multiple-choice" && lesson.optional) continue;
      select.add(new Option(lesson.label, lesson.id));
    }
  }
  function generatedSummary(run) {
    const session = run.generatedSession, graded = session.attempts.filter((a) => a.correct !== null), first = /* @__PURE__ */ new Map();
    for (const attempt of graded) if (!first.has(attempt.itemId)) first.set(attempt.itemId, attempt);
    const firstCorrect = [...first.values()].filter((x) => x.correct).length, eventualCorrect = new Set(graded.filter((x) => x.correct).map((x) => x.itemId)).size, self = session.attempts.filter((x) => x.correct === null), recalled = self.filter((x) => x.answer[0] === "recalled").length;
    const review = session.items.map((item) => {
      const tries = session.attempts.filter((x) => x.itemId === item.id);
      return `<article><h3>${esc2(item.prompt)}</h3><p>${esc2(item.explanation)}</p><p>${tries.length ? tries.map((x, i) => `Attempt ${i + 1}: ${esc2(x.answer.join(" \u2192 "))} \u2014 ${x.correct === null ? "self-assessment" : x.correct ? "correct" : "incorrect"}`).join("<br>") : "Not attempted"}</p></article>`;
    }).join("");
    return `<div class="practice-summary"><h2>Practice complete</h2>${graded.length ? `<p>First try: ${firstCorrect}/${first.size}. After retries: ${eventualCorrect}/${first.size} answered correctly.</p>` : ""}${self.length ? `<p>Flash-card self-assessments: ${recalled} recalled; ${self.length - recalled} marked study again.</p>` : ""}<div class="practice-summary-actions"><button type="button" data-generated-missed>Practice missed concepts</button><button type="button" data-generated-another>Start another set</button><button type="button" data-generated-review>Review my work</button></div><div class="practice-review" data-generated-review-panel hidden>${review}</div></div>`;
  }
  function renderGeneratedSection(section, run) {
    const setup = $("[data-practice-setup]", section), host = $("[data-generated-host]", section);
    for (const legacy of all("[data-legacy-practice]", section)) legacy.hidden = true;
    const lesson = $("[data-practice-lesson]", setup);
    practiceOptions(lesson, section.dataset.generatedPractice);
    if (!run) {
      setup.hidden = false;
      host.replaceChildren();
      $("[data-generated-start]", setup).disabled = !ready;
      return;
    }
    setup.hidden = true;
    const session = run.generatedSession;
    if (run.endedAt) {
      host.innerHTML = generatedSummary(run);
      return;
    }
    const item = session.items[session.position];
    if (!item) {
      host.innerHTML = "<p>This set could not be restored. Its saved record has been retained in this browser.</p>";
      return;
    }
    host.innerHTML = `<div class="practice-run-bar"><p><strong>Resume saved set:</strong> ${esc2(practiceBank.lessons.find((x) => x.id === session.settings.lessonId)?.label ?? "All Chapter 11 lessons")} \xB7 ${session.items.length} items</p><button type="button" class="practice-reset" data-generated-reset>Stop and reset</button></div>${renderGeneratedItem(item, session.position, session.items.length, session.attempts)}`;
    if (session.feedback === "answer") {
      const panel = $("[data-generated-reveal-panel]", host);
      if (panel) panel.hidden = false;
    }
  }
  function generatedAnswer(root, item) {
    const typed = root.querySelector("input[type=text][data-generated-answer]");
    if (typed) return [typed.value];
    if (item.interaction === "ordering") return all("[data-generated-answer]", root).map((x) => x.value);
    return all("[data-generated-answer]:checked", root).map((x) => x.value);
  }
  function startGenerated(section, missedOnly = false) {
    return change((next) => {
      const id = section.dataset.activity, prior = next.current[id];
      if (prior && !prior.endedAt) throw Error("Resume the unfinished set before changing setup options.");
      const kind = section.dataset.generatedPractice, lesson = $("[data-practice-lesson]", section)?.value || prior?.generatedSession?.settings.lessonId || "all", count = Number($("[data-practice-count]", section)?.value || prior?.generatedSession?.settings.count || 10), difficulty = $("[data-practice-difficulty]", section)?.value || prior?.generatedSession?.settings.difficulty || "mixed";
      const evidence = generatedPerformance(next), avoid = (prior?.generatedSession?.items ?? []).map((x) => x.id), seed = crypto.getRandomValues(new Uint32Array(1))[0];
      let session = generatePracticeSession(practiceBank, kind, { lessonId: lesson, count, difficulty }, seed, evidence, avoid);
      if (missedOnly && prior?.generatedSession) {
        const missed = new Set(prior.generatedSession.attempts.filter((x) => x.correct === false).map((x) => prior.generatedSession.items.find((i) => i.id === x.itemId)?.conceptId).filter(Boolean));
        const focused = session.items.filter((x) => missed.has(x.conceptId));
        if (focused.length) session.items = focused.slice(0, count);
      }
      next.current[id] = { id: crypto.randomUUID(), activity: id, startedAt: Date.now(), drafts: {}, attempts: [], questionIds: session.items.map((x) => x.id), generatedSession: session };
    });
  }
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-generated-start],[data-generated-reset],[data-generated-reveal],[data-generated-self],[data-generated-check],[data-generated-next],[data-generated-missed],[data-generated-another],[data-generated-review]");
    if (!button) return;
    const section = button.closest("[data-generated-practice]");
    if (!section) return;
    event.preventDefault();
    event.stopPropagation();
    if (button.hasAttribute("data-generated-review")) {
      const panel = $("[data-generated-review-panel]", section);
      panel.hidden = !panel.hidden;
      return;
    }
    if (button.hasAttribute("data-generated-reset") && !requestPracticeReset(button)) return;
    const visibleSession = current(section)?.generatedSession, visibleItem = visibleSession?.items[visibleSession.position], domInteraction = section.querySelector("[data-practice-order]") ? "ordering" : "single", submittedAnswer = button.hasAttribute("data-generated-self") ? [button.dataset.generatedSelf] : button.hasAttribute("data-generated-check") ? generatedAnswer(section, visibleItem ?? { interaction: domInteraction }) : [];
    enqueue(async () => {
      if (button.hasAttribute("data-generated-reset")) {
        await change((next) => {
          const id = section.dataset.activity, run = next.current[id];
          if (!run || run.endedAt) throw Error("There is no unfinished practice to reset.");
          delete next.current[id];
        });
        render();
        return;
      }
      if (button.hasAttribute("data-generated-start") || button.hasAttribute("data-generated-another") || button.hasAttribute("data-generated-missed")) {
        await startGenerated(section, button.hasAttribute("data-generated-missed"));
        render();
        return;
      }
      if (button.hasAttribute("data-generated-reveal")) {
        await change((next) => {
          next.current[section.dataset.activity].generatedSession.feedback = "answer";
        });
        render();
        return;
      }
      await change((next) => {
        const run = next.current[section.dataset.activity], session = run.generatedSession, item = session.items[session.position];
        if (button.hasAttribute("data-generated-next")) {
          if (session.position === session.items.length - 1) {
            run.endedAt = Date.now();
            next.history.push(structuredClone(run));
          } else {
            session.position++;
            session.feedback = "none";
          }
          return;
        }
        if (visibleItem && visibleItem.id !== item.id) throw Error("The saved item changed before this answer was recorded. Review the visible item and try again.");
        const answer2 = submittedAnswer;
        if (!answer2.length || answer2.some((x) => !x.trim())) throw Error("Complete an answer before checking.");
        const prior = session.attempts.filter((x) => x.itemId === item.id), correct = item.interaction === "flashcard" ? null : gradeGeneratedItem(item, answer2), attempt = { itemId: item.id, answer: answer2, correct, attemptNumber: prior.length + 1, at: Date.now(), firstTry: prior.length === 0 };
        session.attempts.push(attempt);
        session.feedback = correct || correct === null || prior.length >= 1 ? "answer" : "cue";
        run.attempts.push({ question: item.id, answer: answer2.join(" \u2192 "), correct, at: Date.now(), elapsedMs: Date.now() - run.startedAt, prompt: item.prompt, conceptId: item.conceptId, skill: item.skill, difficulty: item.difficulty, generatedItemId: item.id, firstTry: attempt.firstTry, displayedOptions: item.options, correctAnswer: item.answers });
        if (correct === false && prior.length === 1 && session.position + 3 < session.items.length) {
          const reserve = generatePracticeSession(practiceBank, session.kind, session.settings, session.seed + session.position + 1, session.startedWithEvidence, session.items.map((x) => x.id)).items.find((x) => x.conceptId === item.conceptId && x.family !== item.family);
          if (reserve) {
            const at = session.position + 3, old = session.items[at];
            session.items[at] = reserve;
            session.adaptations.push({ triggerItemId: item.id, replacementItemId: reserve.id, at });
            run.questionIds[at] = reserve.id;
          }
        }
      });
      render();
    });
  }, { capture: true });
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
  function mountLabelingLibrary() {
    const page = $("#labeling-practice"), select = $("[data-labeling-select]", page), cards = all("[data-labeling-card]", page);
    const show = () => {
      const chosen = cards.find((card) => card.id === select.value) ?? cards[0];
      for (const card of cards) card.hidden = card !== chosen;
      select.setAttribute("aria-controls", chosen.id);
    };
    select.addEventListener("change", show);
    show();
  }
  function showVideos(root) {
    for (const section of all("[data-video]", root)) {
      if (section.closest("[data-video-library-item]")?.hidden) continue;
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
  function mountVideoLibrary() {
    const page = $("#video-library"), select = $("[data-video-library-select]", page), items = all(":scope > .p2-topic > .content-section", page).filter((item) => item.querySelector("[data-video]"));
    const groups = /* @__PURE__ */ new Map();
    select.replaceChildren();
    items.forEach((item, index) => {
      item.dataset.videoLibraryItem = String(index);
      item.hidden = index !== 0;
      if (index === 0) item.id = "video-library-card";
      const title = item.querySelector("h3")?.textContent?.trim() ?? `Video ${index + 1}`, lesson = item.querySelector('a[href^="#lesson-"]')?.textContent?.replace(/^Return to\s+/, "").trim() ?? "Chapter 11";
      let group = groups.get(lesson);
      if (!group) {
        group = document.createElement("optgroup");
        group.label = lesson;
        groups.set(lesson, group);
        select.append(group);
      }
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = title;
      group.append(option);
    });
    select.addEventListener("change", () => {
      const chosen = items[Number(select.value)] ?? items[0];
      for (const item of items) {
        const active = item === chosen;
        item.hidden = !active;
        if (!active) item.querySelector("iframe")?.remove();
      }
      chosen.id = "video-library-card";
      for (const item of items) if (item !== chosen) item.removeAttribute("id");
      showVideos(chosen);
    });
  }
  mountLabelingLibrary();
  mountVideoLibrary();
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
    const target = event.target.closest("[data-book-page],[data-textbook-close],[data-load-video],[data-sidebar-toggle],[data-menu-button],[data-print],[data-save-exit]");
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
    if (target.hasAttribute("data-save-exit")) enqueue(async () => {
      if (failed) throw Error("Some writing has not saved. Copy your visible drafts before leaving.");
      message("Saved locally. You can now close this tab. Print or save completed work as a PDF before clearing browser data.");
      location.hash = "overview";
    });
  });
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
