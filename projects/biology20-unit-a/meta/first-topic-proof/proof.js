(() => {
  // scripts/lib/biology30-course/v1/pilot2-graph-work.ts
  var exactKeys = (value, keys) => Object.keys(value).sort().join("|") === [...keys].sort().join("|");
  function validateGraphDraft(work, value) {
    if (!value || typeof value !== "object" || !exactKeys(value, ["v", "k", "g", "e"])) throw new Error("Unknown graph response format; preserve the original writing");
    const draft = value;
    if (draft.v !== 1 || draft.k !== work.unit || !Array.isArray(draft.g) || draft.g.length !== work.graphs.length || typeof draft.e !== "string" || draft.e.length > work.explanationLimit) throw new Error("Graph unit, inventory or explanation capacity mismatch");
    for (const [index, graph] of work.graphs.entries()) {
      const data = draft.g[index];
      if (!data || typeof data !== "object" || !exactKeys(data, ["a", "p"]) || !Array.isArray(data.a) || data.a.length !== 3 || !Array.isArray(data.p) || data.p.length !== graph.series.length) throw new Error("Graph axes or series inventory mismatch");
      const counts = [graph.xLabels.length, graph.yLabels.length, graph.maxima.length];
      if (data.a.some((choice, axis) => choice !== null && (!Number.isSafeInteger(choice) || choice < 0 || choice >= counts[axis]))) throw new Error("Unknown graph axis selection");
      for (const points of data.p) {
        if (!Array.isArray(points) || points.length !== graph.x.length) throw new Error("Graph point inventory mismatch");
        if (points.some((point) => point !== null && (typeof point !== "number" || !Number.isFinite(point) || point < 0 || point > 9999.99 || Math.abs(point * 100 - Math.round(point * 100)) > 1e-7))) throw new Error("Graph values must be finite nonnegative numbers with at most two decimal places");
      }
    }
  }
  function decodeGraphDraft(work, response) {
    try {
      const value = JSON.parse(response);
      validateGraphDraft(work, value);
      return { kind: "graph", draft: value };
    } catch {
      return { kind: "preserved-writing", original: response };
    }
  }
  function graphWorkText(work, draft) {
    validateGraphDraft(work, draft);
    return work.graphs.map((graph, index) => {
      const data = draft.g[index];
      return [
        graph.title,
        `Horizontal axis: ${data.a[0] === null ? "not selected" : graph.xLabels[data.a[0]]}`,
        `Vertical axis: ${data.a[1] === null ? "not selected" : graph.yLabels[data.a[1]]}`,
        `Vertical maximum: ${data.a[2] === null ? "not selected" : graph.maxima[data.a[2]]}`,
        ...graph.series.map((series, s) => `${series.label}: ${graph.x.map((x, i) => `${x} = ${data.p[s][i] ?? "not plotted"}`).join("; ")}`)
      ].join("\n");
    }).concat(`Explanation: ${draft.e || "not written"}`).join("\n\n");
  }

  // scripts/lib/biology30-course/v1/pilot2-controls-runtime.ts
  function mountTopicControls(root2, state, schema2, onChange, graphs = []) {
    const openTextbookGuides = /* @__PURE__ */ new Set();
    const all = (selector) => Array.from(root2.querySelectorAll(selector));
    const byValue = (attribute, value) => all(`[${attribute}]`).find((node) => node.getAttribute(attribute) === value);
    const showResponseCapacity = (field) => {
      const id = field.dataset.pilot2Response;
      if (!/^[bcd]-(?:review-seminar-|investigation-.*-final-transfer-revision-v2$)/.test(id)) return;
      const limit = schema2.responses[id].limit;
      let note = byValue("data-pilot2-response-capacity", id);
      if (!note) {
        note = root2.querySelector(`[id="${id}-capacity"]`) ?? document.createElement("p");
        note.dataset.pilot2ResponseCapacity = id;
        note.id = id + "-capacity";
        if (!note.parentElement) field.insertAdjacentElement("afterend", note);
        field.setAttribute("aria-describedby", [.../* @__PURE__ */ new Set([...(field.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean), note.id])].join(" "));
      }
      const oversized = field.value.length > limit;
      note.textContent = `${field.value.length} / ${limit} characters.` + (oversized ? ` Over the limit by ${field.value.length - limit}. This draft cannot be saved yet. Your writing remains here; shorten it or copy it before leaving.` : " Include the working and explanation requested.");
      field.setAttribute("aria-invalid", String(oversized));
    };
    const setFlag = (id, value) => {
      if (!Object.hasOwn(schema2.flags, id)) throw new Error(`Unknown control flag: ${id}`);
      state.flags = state.flags.filter((flag) => flag !== id);
      if (value) state.flags.push(id);
    };
    const responseReady = (id) => {
      if (!state.responses[id]?.trim() || state.responses[id].length > (schema2.responses[id]?.limit ?? -1)) return false;
      const graph = graphs.find((work) => work.responseId === id), panel = byValue("data-pilot2-graph-work", id);
      if (panel?.dataset.pilot2GraphInvalid === "true") return false;
      if (graph) {
        const decoded = decodeGraphDraft(graph, state.responses[id]);
        if (decoded.kind === "graph") return Boolean(decoded.draft.e.trim()) || decoded.draft.g.some((plot) => plot.a.some((axis) => axis !== null) || plot.p.some((points) => points.some((point) => point !== null)));
      }
      return true;
    };
    const collectionReady = (button) => {
      const required = (button.dataset.pilot2Requires ?? "").split(" ").filter(Boolean), flag = button.dataset.pilot2RequiredFlag;
      return required.length > 0 && required.every(responseReady) && (!flag || state.flags.includes(flag));
    };
    const practiceReady = (id) => schema2.choices[id] ? schema2.choices[id].values.includes(state.choices[id]) : responseReady(id);
    function revealPractice(id, show) {
      const panel = byValue("data-pilot2-feedback", id), button = byValue("data-pilot2-check", id);
      if (!panel || !button) return;
      panel.hidden = !show;
      button.setAttribute("aria-expanded", String(show));
      panel.querySelectorAll("[data-pilot2-option-feedback]").forEach((node) => {
        node.hidden = node.dataset.pilot2OptionFeedback !== state.choices[id];
      });
    }
    function refresh() {
      all("[data-pilot2-check]").forEach((button) => {
        const id = button.dataset.pilot2Check;
        button.disabled = !practiceReady(id);
        const attempted = practiceReady(id) && state.flags.includes(`${id}-attempted`);
        revealPractice(id, attempted);
        const status2 = byValue("data-pilot2-check-status", id);
        if (status2) status2.textContent = attempted ? "Feedback is open for this attempt." : practiceReady(id) ? "Ready to check your attempt." : "Attempt the question to open the feedback.";
      });
      all("[data-pilot2-compare]").forEach((button) => {
        button.disabled = !responseReady(button.dataset.pilot2Compare);
      });
      all("[data-pilot2-collect]").forEach((button) => {
        button.disabled = !collectionReady(button);
      });
      all("[data-pilot2-group-compare]").forEach((button) => {
        button.disabled = !collectionReady(button);
      });
      all("[data-pilot2-textbook-attempt]").forEach((button) => {
        const id = button.dataset.pilot2TextbookAttempt, panel = root2.querySelector(`#${CSS.escape(id + "-guide")}`);
        const attempted = state.flags.includes(`${id}-attempted`);
        const open = attempted && openTextbookGuides.has(id);
        if (panel) panel.hidden = !open;
        button.setAttribute("aria-expanded", String(open));
        const status2 = byValue("data-pilot2-textbook-status", id);
        if (status2 && !open) status2.textContent = attempted ? "Previous attempt recorded; open the guide when ready." : "";
      });
    }
    function save() {
      state.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      let result;
      try {
        result = onChange(state);
      } catch {
        result = { saved: false, message: "Saving failed. Your current writing remains visible; copy it before leaving." };
      }
      all("[data-pilot2-save-status]").forEach((node) => {
        node.textContent = result.message;
      });
      refresh();
      root2.dispatchEvent(new CustomEvent("pilot2-state-change", { detail: result }));
      return result;
    }
    function changedResponse(id) {
      const field = byValue("data-pilot2-response", id);
      for (const flag of (field?.dataset.pilot2Invalidates ?? "").split(" ").filter(Boolean)) setFlag(flag, false);
      all("[data-pilot2-group-compare]").filter((button) => (button.dataset.pilot2Requires ?? "").split(" ").includes(id)).forEach((button) => {
        button.setAttribute("aria-expanded", "false");
        const panel = root2.querySelector(`#${CSS.escape(button.dataset.pilot2GroupCompare + "-overall-guide")}`);
        if (panel) panel.hidden = true;
      });
      if (schema2.flags[`${id}-attempted`]) setFlag(`${id}-attempted`, false);
      const compare = byValue("data-pilot2-compare", id);
      if (compare) {
        compare.setAttribute("aria-expanded", "false");
        const guide = root2.querySelector(`#${CSS.escape(id + "-guide")}`);
        if (guide) guide.hidden = true;
      }
      all("[data-pilot2-collect]").filter((button) => (button.dataset.pilot2Requires ?? "").split(" ").includes(id)).forEach((button) => {
        if (button.hasAttribute("data-pilot2-collect-toggle")) return;
        setFlag(button.dataset.pilot2Collect, false);
        const status2 = byValue("data-pilot2-collection-status", button.dataset.pilot2Collect);
        if (status2) status2.textContent = "Edited draft; save this activity again when ready.";
      });
    }
    const onInput = (event) => {
      const field = event.target;
      if (!(field instanceof HTMLTextAreaElement) || !field.dataset.pilot2Response) return;
      const id = field.dataset.pilot2Response;
      if (!Object.hasOwn(schema2.responses, id)) throw new Error(`Unknown response control: ${id}`);
      state.responses[id] = field.value;
      showResponseCapacity(field);
      changedResponse(id);
      save();
    };
    const onChoice = (event) => {
      const field = event.target;
      if (field instanceof HTMLInputElement && field.dataset.pilot2OptionalFlag) {
        const id2 = field.dataset.pilot2OptionalFlag;
        if (!id2.endsWith("-advanced-complete")) throw new Error("Only optional Advanced markers use this control");
        setFlag(id2, field.checked);
        save();
        return;
      }
      if (!(field instanceof HTMLInputElement) || !field.dataset.pilot2Choice || !field.checked) return;
      const id = field.dataset.pilot2Choice;
      if (!schema2.choices[id]?.values.includes(field.value)) throw new Error(`Unknown choice control: ${id}`);
      state.choices[id] = field.value;
      setFlag(`${id}-attempted`, false);
      save();
    };
    const onClick = (event) => {
      const button = event.target instanceof Element ? event.target.closest("button") : null;
      if (!button || !root2.contains(button) || button.disabled) return;
      const check = button.dataset.pilot2Check, compare = button.dataset.pilot2Compare, collect = button.dataset.pilot2Collect, textbook = button.dataset.pilot2TextbookAttempt, group = button.dataset.pilot2GroupCompare;
      if (group && collectionReady(button)) {
        const panel = root2.querySelector(`#${CSS.escape(group + "-overall-guide")}`);
        if (panel) {
          panel.hidden = false;
          button.setAttribute("aria-expanded", "true");
        }
      } else if (textbook) {
        openTextbookGuides.add(textbook);
        setFlag(`${textbook}-attempted`, true);
        const result = save();
        const status2 = byValue("data-pilot2-textbook-status", textbook);
        if (status2) status2.textContent = result.saved ? "Attempt saved; comparison guide is open." : "Comparison guide is open; saving was not confirmed.";
      } else if (check && practiceReady(check)) {
        setFlag(`${check}-attempted`, true);
        const result = save();
        revealPractice(check, true);
        const status2 = byValue("data-pilot2-check-status", check);
        if (status2) {
          status2.classList.toggle("sr-only", result.saved);
          status2.textContent = result.saved ? "Attempt saved. Feedback is open." : "Feedback is open. Saving this attempt was not confirmed.";
        }
      } else if (compare && responseReady(compare)) {
        const panel = root2.querySelector(`#${CSS.escape(compare + "-guide")}`);
        if (panel) {
          panel.hidden = false;
          button.setAttribute("aria-expanded", "true");
        }
      } else if (collect && collectionReady(button)) {
        setFlag(collect, button.hasAttribute("data-pilot2-collect-toggle") ? !state.flags.includes(collect) : true);
        const result = save();
        const status2 = byValue("data-pilot2-collection-status", collect);
        if (status2) status2.textContent = result.saved ? "Saved to Process Collection." : "Your draft remains visible. Saving was not confirmed.";
      }
    };
    all("[data-pilot2-response]").forEach((field) => {
      const id = field.dataset.pilot2Response;
      if (!Object.hasOwn(schema2.responses, id)) throw new Error(`Unknown response control: ${id}`);
      field.value = state.responses[id] ?? "";
      showResponseCapacity(field);
    });
    all("[data-pilot2-choice]").forEach((field) => {
      field.checked = state.choices[field.dataset.pilot2Choice] === field.value;
    });
    all("[data-pilot2-optional-flag]").forEach((field) => {
      field.checked = state.flags.includes(field.dataset.pilot2OptionalFlag);
    });
    refresh();
    root2.addEventListener("input", onInput);
    root2.addEventListener("change", onChoice);
    root2.addEventListener("click", onClick);
    return { refresh, saveDraft: save, responseChanged(id) {
      if (!schema2.responses[id]) throw new Error("Unknown response update");
      changedResponse(id);
      return save();
    }, dispose() {
      root2.removeEventListener("input", onInput);
      root2.removeEventListener("change", onChoice);
      root2.removeEventListener("click", onClick);
    } };
  }

  // scripts/lib/biology30-course/v1/pilot2-figure-viewer.ts
  function mountTopicFigureViewer(root2) {
    const doc = root2.ownerDocument, dialog = doc.createElement("dialog");
    dialog.className = "p2-figure-dialog";
    dialog.setAttribute("aria-label", "Enlarged teaching figure");
    const title = doc.createElement("h2"), close = doc.createElement("button"), label = doc.createElement("label"), original = doc.createElement("input"), viewport = doc.createElement("div"), image = doc.createElement("img"), explanation = doc.createElement("p");
    title.textContent = "Enlarged figure";
    close.type = "button";
    close.textContent = "Close figure";
    close.dataset.testid = "pilot2-figure-close";
    original.type = "checkbox";
    label.append(original, doc.createTextNode(" Show original size"));
    viewport.className = "p2-figure-viewport";
    viewport.tabIndex = 0;
    viewport.setAttribute("role", "region");
    viewport.setAttribute("aria-label", "Enlarged figure; scroll when showing original size");
    viewport.append(image);
    dialog.append(title, close, label, viewport, explanation);
    root2.append(dialog);
    let opener = null;
    const resize = () => viewport.classList.toggle("p2-figure-original", original.checked);
    const onClose = () => {
      opener?.focus();
      opener = null;
      image.removeAttribute("src");
    };
    const closeDialog = () => dialog.close();
    const onClick = (event) => {
      const button = event.target instanceof Element ? event.target.closest("button[data-pilot2-enlarge]") : null;
      if (!button || !root2.contains(button)) return;
      const figure = button.closest("figure"), source = figure?.querySelector("img,svg");
      if (!source || !figure || dialog.open) return;
      opener = button;
      title.textContent = figure.querySelector("figcaption")?.textContent ?? "Enlarged figure";
      if (source instanceof HTMLImageElement) {
        image.src = source.src;
        image.alt = source.alt;
        image.width = source.naturalWidth || Number(source.getAttribute("width"));
        image.height = source.naturalHeight || Number(source.getAttribute("height"));
      } else {
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(source))}`;
        image.alt = source.querySelector("desc")?.textContent ?? source.querySelector("title")?.textContent ?? "Teaching graph";
        image.width = Number(source.getAttribute("width"));
        image.height = Number(source.getAttribute("height"));
      }
      explanation.textContent = figure.querySelector("p")?.textContent ?? "";
      original.checked = false;
      resize();
      dialog.showModal();
      close.focus();
    };
    root2.addEventListener("click", onClick);
    close.addEventListener("click", closeDialog);
    original.addEventListener("change", resize);
    dialog.addEventListener("close", onClose);
    return { dispose() {
      if (dialog.open) dialog.close();
      root2.removeEventListener("click", onClick);
      close.removeEventListener("click", closeDialog);
      original.removeEventListener("change", resize);
      dialog.removeEventListener("close", onClose);
      dialog.remove();
    } };
  }

  // scripts/lib/biology30-course/v1/pilot2-return-links.ts
  function mountTopicReturnLinks(root2, routes) {
    let frame = null;
    let pending = null;
    const afterRoute = () => {
      if (!pending || location.hash !== `#${pending.route}`) return;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const target = pending?.target;
        if (!target || location.hash !== `#${pending.route}`) return;
        root2.dispatchEvent(new CustomEvent("pilot2-reveal-target", { detail: target }));
        if (target instanceof HTMLDetailsElement) target.open = true;
        let parent = target.parentElement;
        while (parent && parent !== root2) {
          if (parent instanceof HTMLDetailsElement) parent.open = true;
          parent = parent.parentElement;
        }
        const visible = (node) => !node.closest("[hidden]") && node.getClientRects().length > 0;
        const field = target.matches("input,textarea,select,button,a[href]") && visible(target) ? target : [...target.querySelectorAll("textarea,input,select"), ...target.querySelectorAll("button,a[href]")].find(visible);
        const focus = field ?? target;
        if (!field && !focus.hasAttribute("tabindex")) focus.tabIndex = -1;
        focus.focus();
        focus.scrollIntoView({ block: "center" });
        frame = null;
        pending = null;
      });
    };
    const onClick = (event) => {
      const link = event.target instanceof Element ? event.target.closest("[data-pilot2-return-route]") : null;
      if (!link || !root2.contains(link)) return;
      const route = link.dataset.pilot2ReturnRoute, id = link.dataset.pilot2ReturnFocus;
      const target = root2.querySelector(`#${CSS.escape(id)}`);
      if (!routes.includes(route) || !target) throw new Error(`Missing activity return target: ${route}/${id}`);
      event.preventDefault();
      const routed = route.endsWith("-overview") ? "overview" : route;
      if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
      pending = { target, route: routed };
      if (location.hash !== `#${routed}`) location.hash = routed;
      else window.dispatchEvent(new HashChangeEvent("hashchange"));
    };
    root2.addEventListener("click", onClick);
    window.addEventListener("hashchange", afterRoute);
    return { dispose() {
      root2.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", afterRoute);
      if (frame !== null) cancelAnimationFrame(frame);
      pending = null;
    } };
  }

  // scripts/lib/biology30-course/v1/course-identity.ts
  var BIOLOGY20_MODULE_UNITS = ["A", "B", "C", "D-PART-1", "D-PART-2"];
  function validateBiologyRuntimeIdentity(identity) {
    if (identity.courseId === void 0) {
      if (!["B", "C", "D"].includes(identity.unit)) throw Error("Unsupported legacy Biology30 runtime identity");
    } else if (identity.courseId !== "biology20" || !BIOLOGY20_MODULE_UNITS.includes(identity.unit)) throw Error("Unsupported Biology course/module identity");
    return identity;
  }
  function biologyRuntimeStorageBase(identity) {
    validateBiologyRuntimeIdentity(identity);
    return `${identity.courseId ?? "biology30"}-unit-${identity.unit.toLowerCase()}`;
  }
  function biologyRuntimeStorageKey(identity) {
    const base = biologyRuntimeStorageBase(identity);
    return `${base}:${identity.courseId ? "state:v1" : "pilot2-v3"}`;
  }

  // scripts/lib/biology30-course/v1/pilot2-state.ts
  var TOPIC_STATE_GUARD = 48e3;
  function emptyTopicState(schema2) {
    validateBiologyRuntimeIdentity(schema2);
    return { version: 3, unit: schema2.unit, ...schema2.courseId ? { courseId: schema2.courseId } : {}, updatedAt: (/* @__PURE__ */ new Date(0)).toISOString(), route: schema2.routes[0], responses: {}, choices: {}, flags: [], visited: [], frayerChoices: [], legacy: [] };
  }
  function own(record2, key2) {
    return Object.prototype.hasOwnProperty.call(record2, key2) ? record2[key2] : void 0;
  }
  function uniqueStrings(values, label) {
    if (!Array.isArray(values) || values.some((v) => typeof v !== "string") || new Set(values).size !== values.length) throw new Error(`Invalid ${label}`);
  }
  function object(value, label) {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Invalid ${label}`);
  }
  function validateTopicState(state, schema2) {
    validateBiologyRuntimeIdentity(schema2);
    if (state.version !== 3 || state.unit !== schema2.unit || state.courseId !== schema2.courseId) throw new Error("State version or unit does not match this course");
    if (!schema2.routes.includes(state.route) || typeof state.updatedAt !== "string" || !Number.isFinite(Date.parse(state.updatedAt))) throw new Error("Unknown route or invalid state time");
    object(state.responses, "responses");
    object(state.choices, "choices");
    uniqueStrings(state.flags, "flags");
    uniqueStrings(state.visited, "visited routes");
    uniqueStrings(state.frayerChoices, "Frayer choices");
    if (state.flags.some((id) => !own(schema2.flags, id)) || state.visited.some((id) => !schema2.routes.includes(id))) throw new Error("Unknown state flag or visited route");
    if (state.frayerChoices.length > 2 || state.frayerChoices.some((id) => !schema2.families.selectable.includes(id) || schema2.families.fixed.includes(id))) throw new Error("Invalid optional Frayer selection");
    for (const [id, text] of Object.entries(state.responses)) {
      const field = own(schema2.responses, id);
      if (!field || typeof text !== "string" || text.length > field.limit) throw new Error(`Unknown or oversized response: ${id}; writing was not truncated`);
    }
    for (const [id, value] of Object.entries(state.choices)) {
      if (typeof value !== "string" || !own(schema2.choices, id)?.values.includes(value)) throw new Error(`Unknown choice or value: ${id}`);
    }
    if (state.vocabularyActiveId !== void 0 && !Object.hasOwn(schema2.families.responseIds, state.vocabularyActiveId)) throw new Error("Unknown active vocabulary concept");
    const activeFamilies = /* @__PURE__ */ new Set([...schema2.families.fixed, ...state.frayerChoices]);
    for (const [family, ids] of Object.entries(schema2.families.responseIds)) {
      if (!activeFamilies.has(family) && ids.some((id) => (state.responses[id] ?? "").length > 0)) throw new Error("Written Frayer belongs to an inactive choice; preserve it before replacement");
    }
    if (!Array.isArray(state.legacy) || state.legacy.some((x) => !x || typeof x.original !== "string" || typeof x.source !== "string")) throw new Error("Invalid preserved legacy payload");
    return state;
  }
  function reverseTokens(entries, token) {
    const result = /* @__PURE__ */ Object.create(null);
    for (const [id, value] of Object.entries(entries)) {
      const key2 = token(value);
      if (!key2 || Object.prototype.hasOwnProperty.call(result, key2)) throw new Error("Duplicate or empty storage token");
      result[key2] = id;
    }
    return result;
  }
  function checkFlagPacking(schema2) {
    const packing = schema2.flagPacking;
    if (!packing) return;
    if (packing.format !== "hex-v1" || !/^[a-f0-9]{64}$/.test(packing.sha256)) throw new Error("Unsupported flag packing identity");
    uniqueStrings(packing.order, "flag packing order");
    if (packing.order.length !== Object.keys(schema2.flags).length || packing.order.some((id) => !Object.hasOwn(schema2.flags, id))) throw new Error("Flag packing inventory drift");
  }
  function packFlags(flags, schema2) {
    checkFlagPacking(schema2);
    if (!schema2.flagPacking) return flags.map((id) => schema2.flags[id]);
    const { order, sha256 } = schema2.flagPacking;
    const positions = new Map(order.map((id, index) => [id, index]));
    const digits = Array(Math.ceil(order.length / 4)).fill(0);
    for (const id of flags) {
      const index = positions.get(id);
      digits[Math.floor(index / 4)] |= 1 << index % 4;
    }
    return { v: 1, m: sha256, b: digits.map((value) => value.toString(16)).join("") };
  }
  function unpackFlags(value, schema2, legacyTokens) {
    if (Array.isArray(value)) {
      uniqueStrings(value, "packed flags");
      if (value.some((token) => !own(legacyTokens, token))) throw new Error("Unknown compact flag");
      return value.map((token) => legacyTokens[token]);
    }
    checkFlagPacking(schema2);
    object(value, "packed flags");
    const packing = schema2.flagPacking;
    if (!packing || Object.keys(value).sort().join(",") !== "b,m,v" || value.v !== 1 || value.m !== packing.sha256 || typeof value.b !== "string" || value.b.length !== Math.ceil(packing.order.length / 4) || !/^[0-9a-f]*$/.test(value.b)) throw new Error("Unknown or mismatched flag map; preserve original payload");
    const digits = [...value.b].map((char) => Number.parseInt(char, 16));
    const unused = packing.order.length % 4;
    if (unused && digits.at(-1) >= 1 << unused) throw new Error("Packed flags contain unknown trailing bits");
    return packing.order.filter((_id, index) => Boolean(digits[Math.floor(index / 4)] & 1 << index % 4));
  }
  function checkResponsePacking(schema2) {
    const packing = schema2.responsePacking;
    if (!packing) return;
    if (packing.format !== "ordered-text-v1" || !/^[a-f0-9]{64}$/.test(packing.sha256)) throw new Error("Unsupported response packing identity");
    uniqueStrings(packing.order, "response packing order");
    if (packing.order.length !== Object.keys(schema2.responses).length || packing.order.some((id) => !Object.hasOwn(schema2.responses, id))) throw new Error("Response packing inventory drift");
  }
  function packResponses(responses, schema2) {
    const pairs = Object.entries(responses).map(([id, text]) => [schema2.responses[id].token, text]);
    checkResponsePacking(schema2);
    if (!schema2.responsePacking) return pairs;
    const { order, sha256 } = schema2.responsePacking;
    const digits = Array(Math.ceil(order.length / 4)).fill(0), texts = [];
    order.forEach((id, index) => {
      if (!Object.hasOwn(responses, id)) return;
      digits[Math.floor(index / 4)] |= 1 << index % 4;
      texts.push(responses[id]);
    });
    const packed = { v: 1, m: sha256, b: digits.map((value) => value.toString(16)).join(""), t: texts };
    return JSON.stringify(packed).length < JSON.stringify(pairs).length ? packed : pairs;
  }
  function unpackResponses(value, schema2) {
    checkResponsePacking(schema2);
    object(value, "packed responses");
    const packing = schema2.responsePacking;
    if (!packing || Object.keys(value).sort().join(",") !== "b,m,t,v" || value.v !== 1 || value.m !== packing.sha256 || typeof value.b !== "string" || value.b.length !== Math.ceil(packing.order.length / 4) || !/^[0-9a-f]*$/.test(value.b) || !Array.isArray(value.t) || value.t.some((text) => typeof text !== "string")) throw new Error("Unknown or mismatched response map; preserve original payload");
    const digits = [...value.b].map((char) => Number.parseInt(char, 16)), unused = packing.order.length % 4;
    if (unused && digits.at(-1) >= 1 << unused) throw new Error("Packed responses contain unknown trailing bits");
    const present = packing.order.filter((_id, index) => Boolean(digits[Math.floor(index / 4)] & 1 << index % 4));
    if (present.length !== value.t.length) throw new Error("Packed response count mismatch; preserve original payload");
    return Object.fromEntries(present.map((id, index) => [id, value.t[index]]));
  }
  function checkIndexPacking(schema2) {
    if (!schema2.indexPacking || schema2.indexPacking.format !== "choices-routes-v1" || !/^[a-f0-9]{64}$/.test(schema2.indexPacking.sha256)) throw new Error("Unsupported choice/route packing identity");
    uniqueStrings(schema2.routes, "route map");
    for (const choice of Object.values(schema2.choices)) {
      uniqueStrings(choice.values, "choice map");
      if (!choice.values.length || choice.values.length > 10) throw new Error("Choice map exceeds single-digit encoding");
    }
  }
  function encodeTopicState(state, schema2, limit = TOPIC_STATE_GUARD) {
    validateTopicState(state, schema2);
    reverseTokens(schema2.responses, (x) => x.token);
    reverseTokens(schema2.choices, (x) => x.token);
    reverseTokens(schema2.flags, (x) => x);
    if (schema2.indexPacking) checkIndexPacking(schema2);
    const packed = {
      v: 3,
      u: state.unit,
      ...schema2.courseId ? { q: schema2.courseId } : {},
      t: state.updatedAt,
      l: state.route,
      ...state.vocabularyActiveId ? { a: state.vocabularyActiveId } : {},
      r: packResponses(state.responses, schema2),
      p: schema2.indexPacking ? { v: 1, m: schema2.indexPacking.sha256, b: Object.entries(schema2.choices).map(([id, choice]) => Object.hasOwn(state.choices, id) ? String(choice.values.indexOf(state.choices[id])) : "-").join("") } : Object.entries(state.choices).map(([id, value]) => [schema2.choices[id].token, value]),
      f: packFlags(state.flags, schema2),
      h: schema2.indexPacking ? state.visited.map((id) => schema2.routes.indexOf(id)) : state.visited,
      w: state.frayerChoices,
      z: state.legacy.map((x) => [x.source, x.original])
    };
    const serialized = JSON.stringify(packed);
    if (serialized.length > limit) throw new Error(`Save needs ${serialized.length} characters; limit is ${limit}. Last valid state and current writing remain intact.`);
    return serialized;
  }
  function decodeTopicState(raw, schema2) {
    const p = JSON.parse(raw);
    object(p, "saved payload");
    validateBiologyRuntimeIdentity(schema2);
    const keys = /* @__PURE__ */ new Set(["v", "u", "t", "l", "r", "p", "f", "h", "w", "z", "a", ...schema2.courseId ? ["q"] : []]);
    if (Object.keys(p).some((k) => !keys.has(k))) throw new Error("Saved payload contains unknown data; retain original for recovery");
    if (p.v !== 3 || p.u !== schema2.unit || p.q !== schema2.courseId) throw new Error("Saved payload belongs to another profile or unit");
    const responses = reverseTokens(schema2.responses, (x) => x.token), choices = reverseTokens(schema2.choices, (x) => x.token), flags = reverseTokens(schema2.flags, (x) => x);
    function pairs(rawPairs, map) {
      if (!Array.isArray(rawPairs)) throw new Error("Invalid compact entries");
      const result = /* @__PURE__ */ Object.create(null);
      for (const pair of rawPairs) {
        if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== "string" || typeof pair[1] !== "string" || !own(map, pair[0])) throw new Error("Unknown or malformed compact entry; original retained");
        const id = map[pair[0]];
        if (Object.prototype.hasOwnProperty.call(result, id)) throw new Error("Duplicate compact response would overwrite writing");
        result[id] = pair[1];
      }
      return result;
    }
    const decodedFlags = unpackFlags(p.f, schema2, flags);
    let decodedChoices, visited;
    if (Array.isArray(p.p)) {
      decodedChoices = pairs(p.p, choices);
      visited = p.h;
    } else {
      checkIndexPacking(schema2);
      object(p.p, "indexed choices");
      const entries = Object.entries(schema2.choices);
      if (Object.keys(p.p).sort().join(",") !== "b,m,v" || p.p.v !== 1 || p.p.m !== schema2.indexPacking.sha256 || typeof p.p.b !== "string" || p.p.b.length !== entries.length || !/^[0-9-]*$/.test(p.p.b)) throw new Error("Mismatched choice/route map; preserve original payload");
      decodedChoices = /* @__PURE__ */ Object.create(null);
      entries.forEach(([id, choice], index) => {
        const code = p.p.b[index];
        if (code === "-") return;
        const value = choice.values[Number(code)];
        if (value === void 0) throw new Error("Unknown indexed choice; preserve original payload");
        decodedChoices[id] = value;
      });
      if (!Array.isArray(p.h) || p.h.some((i) => !Number.isInteger(i) || i < 0 || i >= schema2.routes.length) || new Set(p.h).size !== p.h.length) throw new Error("Invalid indexed visited routes");
      visited = p.h.map((i) => schema2.routes[i]);
    }
    if (!Array.isArray(p.z) || p.z.some((x) => !Array.isArray(x) || x.length !== 2 || x.some((v) => typeof v !== "string"))) throw new Error("Invalid legacy archive");
    return validateTopicState({ version: 3, unit: schema2.unit, ...schema2.courseId ? { courseId: schema2.courseId } : {}, updatedAt: p.t, route: p.l, ...p.a !== void 0 ? { vocabularyActiveId: p.a } : {}, responses: Array.isArray(p.r) ? pairs(p.r, responses) : unpackResponses(p.r, schema2), choices: decodedChoices, flags: decodedFlags, visited, frayerChoices: p.w, legacy: p.z.map((x) => ({ source: x[0], original: x[1] })) }, schema2);
  }
  function replaceFrayerChoice(state, schema2, oldId, nextId) {
    validateTopicState(state, schema2);
    if (!schema2.families.selectable.includes(nextId) || schema2.families.fixed.includes(nextId)) throw new Error("Choose an eligible optional family");
    if (oldId && !state.frayerChoices.includes(oldId)) throw new Error("The replaced choice is not selected");
    if (oldId && schema2.families.responseIds[oldId]?.some((id) => (state.responses[id] ?? "").length)) throw new Error("Copy and explicitly clear this written Frayer before replacement");
    const choices = state.frayerChoices.filter((id) => id !== oldId);
    if (choices.includes(nextId) || choices.length >= 2) throw new Error("Two different optional Frayer choices are allowed");
    return validateTopicState({ ...state, frayerChoices: [...choices, nextId] }, schema2);
  }
  function clearFrayer(state, schema2, familyId, confirmed) {
    if (!confirmed || !Object.prototype.hasOwnProperty.call(schema2.families.responseIds, familyId)) throw new Error("Explicit scoped Frayer clear confirmation required");
    const responses = { ...state.responses };
    for (const id of schema2.families.responseIds[familyId]) delete responses[id];
    return validateTopicState({ ...state, responses, flags: state.flags.filter((id) => id !== `${familyId}-collected`) }, schema2);
  }
  var succeeded = (value) => value === true || value === "true";
  function persistTopicState(state, schema2, local, lms) {
    let serialized;
    try {
      serialized = encodeTopicState(state, schema2);
    } catch (error) {
      return { accepted: false, local: "not-attempted", setValue: "not-attempted", commit: "not-attempted", error: String(error) };
    }
    const outcome = { accepted: true, local: local ? "pending" : "unavailable", setValue: lms ? "pending" : "unavailable", commit: lms ? "not-attempted" : "unavailable", error: "" };
    const key2 = biologyRuntimeStorageKey(schema2);
    if (local) try {
      const before = local.getItem(key2);
      if (before) {
        decodeTopicState(before, schema2);
        local.setItem(`${key2}:previous`, before);
      }
      local.setItem(key2, serialized);
      outcome.local = "saved";
    } catch (error) {
      outcome.local = "failed";
      outcome.error = String(error);
    }
    if (lms) try {
      if (succeeded(lms.setValue("cmi.suspend_data", serialized))) {
        outcome.setValue = "accepted";
        outcome.commit = succeeded(lms.commit()) ? "confirmed" : "failed";
      } else outcome.setValue = "failed";
    } catch (error) {
      if (outcome.setValue === "accepted") outcome.commit = "failed";
      else outcome.setValue = "failed";
      outcome.error = String(error);
    }
    return outcome;
  }

  // scripts/lib/biology30-course/v1/pilot2-frayer-controls.ts
  function mountTopicFrayerControls(root2, state, schema2, controls) {
    const choices = Array.from(root2.querySelectorAll("[data-pilot2-frayer-choice]")), status2 = root2.querySelector("[data-pilot2-frayer-status]");
    const writing = Array.from(root2.querySelectorAll("[data-pilot2-frayer-writing]"));
    const active = (id) => schema2.families.fixed.includes(id) || state.frayerChoices.includes(id);
    const ready = (id) => (schema2.families.responseIds[id] ?? []).length === 4 && schema2.families.responseIds[id].every((field) => Boolean(state.responses[field]?.trim()) && state.responses[field].length <= schema2.responses[field].limit);
    function refresh() {
      root2.querySelectorAll("[data-p2-choose-family]").forEach((button) => {
        const selected = active(button.dataset.p2ChooseFamily);
        button.disabled = selected;
        button.textContent = selected ? "Selected for Frayer" : "Choose this concept";
      });
      choices.forEach((choice, index) => {
        choice.value = state.frayerChoices[index] ?? "";
        choice.disabled = index === 1 && !state.frayerChoices.length;
        choice.querySelectorAll("option").forEach((option) => {
          option.disabled = Boolean(option.value && state.frayerChoices.some((id, slot) => slot !== index && id === option.value));
        });
      });
      writing.forEach((panel) => {
        const id = panel.dataset.pilot2FrayerWriting, collected = state.flags.includes(id + "-collected");
        panel.hidden = !active(id);
        const button = panel.querySelector("[data-pilot2-collect-toggle]");
        if (button) button.textContent = collected ? "Remove from Process Collection" : "Add to Process Collection";
        const status3 = panel.querySelector("[data-pilot2-collection-status]");
        if (status3) status3.textContent = ready(id) ? collected ? "Collected" : "Ready to collect" : "Complete all four fields first.";
      });
      root2.querySelectorAll("[data-pilot2-frayer-compare]").forEach((button) => {
        button.disabled = !active(button.dataset.pilot2FrayerCompare) || !ready(button.dataset.pilot2FrayerCompare);
        if (button.disabled) {
          button.setAttribute("aria-expanded", "false");
          button.textContent = "Compare with course model";
          const guide = root2.querySelector(`#${CSS.escape(button.dataset.pilot2FrayerCompare + "-guide")}`);
          if (guide) guide.hidden = true;
        }
      });
      controls.refresh();
    }
    const change = (event) => {
      const field = event.target;
      if (field instanceof HTMLSelectElement && field.dataset.pilot2FrayerChoice !== void 0) {
        const index = Number(field.dataset.pilot2FrayerChoice), old = state.frayerChoices[index] ?? null, next = field.value;
        try {
          if (!next) {
            if (old && schema2.families.responseIds[old].some((id) => state.responses[id]?.length)) throw new Error("Copy and explicitly clear this family\u2019s writing before removing it.");
            state.frayerChoices = state.frayerChoices.filter((id) => id !== old);
          } else {
            const previous = [...state.frayerChoices], replaced = replaceFrayerChoice(state, schema2, old, next);
            if (old) replaced.frayerChoices = previous.map((id) => id === old ? next : id);
            Object.assign(state, replaced);
          }
          const result = controls.saveDraft();
          if (status2) status2.textContent = result.saved ? "Family selection saved." : result.message;
        } catch (error) {
          if (status2) status2.textContent = String(error).replace(/^Error: /, "");
        }
        refresh();
      } else if (field instanceof HTMLInputElement && field.dataset.pilot2FrayerClearConfirm) {
        const id = field.dataset.pilot2FrayerClearConfirm;
        const button = Array.from(root2.querySelectorAll("[data-pilot2-frayer-clear]")).find((button2) => button2.dataset.pilot2FrayerClear === id);
        if (button) button.disabled = !field.checked;
      }
    };
    const input = (event) => {
      const field = event.target;
      if (!(field instanceof HTMLTextAreaElement) || !field.dataset.pilot2Response) return;
      const family = Object.entries(schema2.families.responseIds).find(([, ids]) => ids.includes(field.dataset.pilot2Response))?.[0];
      if (!family) return;
      const panel = root2.querySelector(`#${CSS.escape(family + "-guide")}`);
      if (panel) panel.hidden = true;
      const button = Array.from(root2.querySelectorAll("[data-pilot2-frayer-compare]")).find((button2) => button2.dataset.pilot2FrayerCompare === family);
      if (button) {
        button.setAttribute("aria-expanded", "false");
        button.textContent = "Compare with course model";
      }
      refresh();
    };
    const click = (event) => {
      const button = event.target instanceof Element ? event.target.closest("button") : null;
      if (!button || button.disabled) return;
      if (button.hasAttribute("data-pilot2-collect-toggle")) {
        refresh();
        return;
      }
      const id = button.dataset.pilot2FrayerClear, compare = button.dataset.pilot2FrayerCompare;
      if (id) {
        const confirm = Array.from(root2.querySelectorAll("[data-pilot2-frayer-clear-confirm]")).find((field) => field.dataset.pilot2FrayerClearConfirm === id);
        if (!confirm?.checked) return;
        try {
          Object.assign(state, clearFrayer(state, schema2, id, true));
        } catch {
          if (status2) status2.textContent = "Another current response cannot be saved. Keep a copy or revise it before clearing this family.";
          return;
        }
        root2.querySelectorAll("[data-pilot2-response]").forEach((field) => {
          if (schema2.families.responseIds[id].includes(field.dataset.pilot2Response)) field.value = "";
        });
        confirm.checked = false;
        button.disabled = true;
        const guide = root2.querySelector(`#${CSS.escape(id + "-guide")}`);
        if (guide) guide.hidden = true;
        const result = controls.saveDraft();
        if (status2) status2.textContent = result.saved ? "This family\u2019s writing was cleared. Other work is unchanged." : "Clear was not saved. Earlier saved writing remains available after reload.";
        refresh();
      } else if (compare && active(compare) && ready(compare)) {
        const guide = root2.querySelector(`#${CSS.escape(compare + "-guide")}`);
        if (guide) {
          guide.hidden = !guide.hidden;
          button.setAttribute("aria-expanded", String(!guide.hidden));
          button.textContent = guide.hidden ? "Compare with course model" : "Hide course model";
        }
      }
    };
    root2.addEventListener("change", change);
    root2.addEventListener("input", input);
    root2.addEventListener("click", click);
    root2.addEventListener("pilot2-state-change", refresh);
    refresh();
    return { refresh, dispose() {
      root2.removeEventListener("change", change);
      root2.removeEventListener("input", input);
      root2.removeEventListener("click", click);
      root2.removeEventListener("pilot2-state-change", refresh);
    } };
  }

  // scripts/lib/biology30-course/v1/pilot2-presentation-runtime.ts
  function mountTopicPresentation(root2, state, schema2, controls) {
    const doc = root2.ownerDocument, host = doc.defaultView, pages = [...root2.querySelectorAll(".course-page")], sidebar = root2.querySelector(".sidebar"), scrim = root2.querySelector("[data-p2-scrim]"), menu = root2.querySelector("[data-p2-menu]");
    const search = root2.querySelector("[data-p2-vocabulary-search]"), filter = root2.querySelector("[data-p2-vocabulary-filter]"), familyButtons = [...root2.querySelectorAll("[data-p2-family-target]")], familyPanels = [...root2.querySelectorAll("[data-p2-family-panel]")];
    let selectedFamily = state.vocabularyActiveId ?? "", saveTimer;
    const closeMenu = () => {
      sidebar.classList.remove("is-open");
      doc.body.classList.remove("nav-open");
      scrim.hidden = true;
      menu?.setAttribute("aria-expanded", "false");
    };
    function vocabulary() {
      const advanced = [...root2.querySelectorAll("[data-pilot2-optional-flag]")];
      advanced.forEach((n) => n.checked = state.flags.includes(n.dataset.pilot2OptionalFlag));
      const advancedIds = [...new Set(advanced.map((n) => n.dataset.pilot2OptionalFlag))];
      const advancedProgress = root2.querySelector("[data-p2-advanced-progress]");
      if (advancedProgress) advancedProgress.textContent = `${advancedIds.filter((id) => state.flags.includes(id)).length} of ${advancedIds.length}`;
      const models = [...root2.querySelectorAll("[data-pilot2-model]")];
      const modelProgress = root2.querySelector("[data-p2-model-progress]");
      if (modelProgress) modelProgress.textContent = `${models.filter((n) => state.flags.includes(n.querySelector("[data-pilot2-collect]")?.dataset.pilot2Collect ?? "")).length} of ${models.length}`;
      const query = search?.value.trim().toLowerCase() ?? "", view = filter?.value ?? "all";
      for (const button of familyButtons) {
        const learned = state.visited.includes(button.dataset.p2FamilyRoute);
        button.hidden = !(button.dataset.p2FamilySearch ?? "").includes(query) || view === "learned" && !learned || view !== "learned" && view !== "all" && button.dataset.p2FamilyChapter !== view;
        const label = button.querySelector("[data-p2-term-state]");
        if (label && learned) label.textContent = "Learned";
      }
      const visible = familyButtons.filter((b) => !b.hidden);
      if (!visible.some((b) => b.dataset.p2FamilyTarget === selectedFamily)) selectedFamily = visible[0]?.dataset.p2FamilyTarget ?? "";
      familyButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.p2FamilyTarget === selectedFamily);
        button.setAttribute("aria-pressed", String(button.dataset.p2FamilyTarget === selectedFamily));
      });
      familyPanels.forEach((panel) => {
        panel.hidden = panel.dataset.p2FamilyPanel !== selectedFamily;
        const learned = state.visited.includes(panel.dataset.p2UnlockRoute);
        panel.querySelector("[data-p2-family-locked]").hidden = learned;
        panel.querySelector("[data-p2-family-content]").hidden = !learned;
      });
      const empty = root2.querySelector("[data-p2-vocabulary-empty]");
      if (empty) empty.hidden = visible.length > 0;
      root2.querySelectorAll("[data-p2-choose-family]").forEach((b) => {
        const selected = state.frayerChoices.includes(b.dataset.p2ChooseFamily);
        b.disabled = selected;
        b.textContent = selected ? "Selected for Frayer" : "Choose this concept";
      });
      const progress = root2.querySelector("[data-p2-vocabulary-progress]");
      if (progress) progress.textContent = `${[...schema2.families.fixed, ...state.frayerChoices].filter((id) => state.flags.includes(id + "-collected")).length} of 8`;
    }
    function openPanel(id) {
      const panel = root2.querySelector(`#${CSS.escape(id)}`);
      if (!panel) return;
      const hub = panel.closest("[data-p2-hub]");
      if (!hub) return;
      hub.querySelectorAll("[data-p2-panel]").forEach((p) => p.hidden = p.id !== id);
      const select = hub.querySelector("[data-p2-library-select]");
      if (select) select.value = id;
      hub.querySelectorAll("[data-p2-panel-target]").forEach((b) => {
        b.classList.toggle("active", b.dataset.p2PanelTarget === id);
        b.setAttribute("aria-pressed", String(b.dataset.p2PanelTarget === id));
        if (b.getAttribute("role") === "tab") b.setAttribute("aria-selected", String(b.dataset.p2PanelTarget === id));
      });
    }
    function reveal(target) {
      const family = target.closest("[data-p2-family-panel]");
      if (family) {
        selectedFamily = family.id;
        state.vocabularyActiveId = selectedFamily;
        if (filter) filter.value = "all";
        if (search) search.value = "";
        vocabulary();
      }
      const panel = target.closest("[data-p2-panel]");
      if (panel) openPanel(panel.id);
    }
    function navigate() {
      let id = "";
      try {
        id = decodeURIComponent(host.location.hash.slice(1));
      } catch {
      }
      if (!pages.some((p) => p.id === id)) id = state.route.endsWith("-overview") ? "overview" : state.route;
      if (!pages.some((p) => p.id === id)) id = "overview";
      const current = pages.find((p) => p.id === id);
      pages.forEach((p) => p.hidden = !(p === current || p.contains(current) || current.contains(p) && p.hasAttribute("data-p2-embedded")));
      for (let parent = current.parentElement; parent; parent = parent.parentElement) if (parent instanceof HTMLDetailsElement) parent.open = true;
      root2.querySelectorAll(".nav-link").forEach((a) => {
        const active = a.dataset.pageTarget === id;
        a.classList.toggle("active", active);
        if (active) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
      closeMenu();
      host.scrollTo(0, 0);
      vocabulary();
    }
    function click(event) {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      const bookGroup = target.closest("[data-p2-textbook-group-attempt]");
      if (bookGroup) {
        const panel2 = bookGroup.closest(".textbook-review-support"), guide = panel2.querySelector("[data-p2-textbook-group-guide]");
        const open = guide.hidden;
        guide.hidden = !open;
        guide.open = open;
        bookGroup.setAttribute("aria-expanded", String(open));
        bookGroup.textContent = open ? "Hide answer guide" : "I attempted the textbook review";
        if (open) panel2.querySelectorAll("[data-pilot2-textbook-attempt]").forEach((button) => button.click());
        return;
      }
      const family = target.closest("[data-p2-family-target]");
      if (family) {
        selectedFamily = family.dataset.p2FamilyTarget;
        state.vocabularyActiveId = selectedFamily;
        controls.saveDraft();
        vocabulary();
        familyPanels.find((p) => p.id === selectedFamily)?.querySelector("h2")?.focus();
        return;
      }
      const panel = target.closest("[data-p2-panel-target]");
      if (panel) {
        openPanel(panel.dataset.p2PanelTarget);
        return;
      }
      const choice = target.closest("[data-p2-choose-family]");
      if (choice) {
        const slot = state.frayerChoices.length < 2 ? state.frayerChoices.length : -1, status2 = root2.querySelector("[data-pilot2-frayer-status]");
        if (slot < 0) {
          root2.querySelector(".p2-family-choices").open = true;
          if (status2) {
            status2.textContent = "Both learner choices are in use. Keep a copy and clear a chosen family before replacing it.";
            status2.scrollIntoView({ block: "center" });
          }
          return;
        }
        const select = root2.querySelector(`[data-pilot2-frayer-choice="${slot}"]`);
        select.value = choice.dataset.p2ChooseFamily;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        vocabulary();
        return;
      }
      if (target.closest("[data-p2-menu]")) {
        const open = !sidebar.classList.contains("is-open");
        sidebar.classList.toggle("is-open", open);
        doc.body.classList.toggle("nav-open", open);
        scrim.hidden = !open;
        menu.setAttribute("aria-expanded", String(open));
        return;
      }
      if (target.closest("[data-p2-scrim]")) {
        closeMenu();
        menu.focus();
        return;
      }
      const collapse = target.closest("[data-p2-collapse]");
      if (collapse) {
        const collapsed = doc.body.classList.toggle("sidebar-collapsed");
        collapse.setAttribute("aria-expanded", String(!collapsed));
        collapse.setAttribute("aria-label", collapsed ? "Expand course navigation" : "Collapse course navigation");
        return;
      }
      if (target.closest("[data-p2-save-exit]")) {
        controls.saveDraft();
        return;
      }
      const link = target.closest("[data-page-target]");
      if (link && !target.closest("[data-pilot2-return-route]")) {
        const id = link.dataset.pageTarget;
        if (!pages.some((p) => p.id === id)) return;
        event.preventDefault();
        if (host.location.hash === `#${id}`) navigate();
        else host.location.hash = id;
      }
    }
    const librarySelect = root2.querySelector("[data-p2-library-select]");
    const libraryChange = () => {
      if (librarySelect) openPanel(librarySelect.value);
    };
    librarySelect?.addEventListener("change", libraryChange);
    const revealEvent = (event) => {
      const target = event.detail;
      if (target) reveal(target);
    };
    const key2 = (event) => {
      if (event.key === "Escape" && sidebar.classList.contains("is-open")) {
        closeMenu();
        menu.focus();
      }
    };
    const stateChange = () => {
      vocabulary();
      const toast = root2.querySelector("[data-pilot2-save-status]");
      if (toast?.textContent) {
        toast.classList.add("p2-show-save");
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => toast.classList.remove("p2-show-save"), 5e3);
      }
    };
    root2.querySelectorAll("[data-p2-hub]").forEach((hub) => {
      const first = hub.querySelector("[data-p2-panel]");
      if (first) openPanel(first.id);
    });
    root2.addEventListener("click", click);
    root2.addEventListener("pilot2-reveal-target", revealEvent);
    root2.addEventListener("pilot2-state-change", stateChange);
    root2.addEventListener("pilot2-draft-change", stateChange);
    host.addEventListener("hashchange", navigate);
    doc.addEventListener("keydown", key2);
    search?.addEventListener("input", vocabulary);
    filter?.addEventListener("change", vocabulary);
    navigate();
    return { dispose() {
      librarySelect?.removeEventListener("change", libraryChange);
      clearTimeout(saveTimer);
      closeMenu();
      root2.removeEventListener("click", click);
      root2.removeEventListener("pilot2-reveal-target", revealEvent);
      root2.removeEventListener("pilot2-state-change", stateChange);
      root2.removeEventListener("pilot2-draft-change", stateChange);
      host.removeEventListener("hashchange", navigate);
      doc.removeEventListener("keydown", key2);
      search?.removeEventListener("input", vocabulary);
      filter?.removeEventListener("change", vocabulary);
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
    const { root: root2 } = adapter, doc = root2.ownerDocument, win = doc.defaultView;
    const terms = /* @__PURE__ */ new Map();
    for (const item of adapter.terms) {
      const key2 = item.term.toLocaleLowerCase(), old = terms.get(key2);
      terms.set(key2, old ? { ...old, familyIds: [.../* @__PURE__ */ new Set([...old.familyIds, ...item.familyIds])] } : item);
    }
    const style = doc.createElement("style");
    style.textContent = VOCABULARY_PANEL_CSS;
    root2.append(style);
    const dialog = doc.createElement("dialog");
    dialog.className = "bio-vocabulary";
    dialog.dataset.testid = "vocabulary-panel";
    dialog.setAttribute("aria-labelledby", "bio-vocabulary-title");
    dialog.innerHTML = '<header><h2 id="bio-vocabulary-title"></h2><button type="button" data-bio-close aria-label="Close vocabulary">Close</button></header><label data-bio-family-label>Concept family<select data-bio-family></select></label><div data-bio-meaning></div><details data-bio-frayer><summary>My Frayer</summary><p data-bio-locked></p><div data-bio-frayer-slot></div><div data-bio-choices-slot></div></details><p data-bio-save-status role="status" aria-live="polite"></p>';
    root2.append(dialog);
    const get = (selector) => dialog.querySelector(selector);
    const familySelect = get("[data-bio-family]"), meaning = get("[data-bio-meaning]"), slot = get("[data-bio-frayer-slot]");
    let trigger = null, current = null;
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
    const status2 = () => {
      get("[data-bio-save-status]").textContent = adapter.status();
    };
    function showFamily() {
      restoreLoans();
      meaning.replaceChildren();
      const family = adapter.families.find((f) => f.id === familySelect.value);
      if (!family || !current) return;
      const paragraph = (text) => {
        const p = doc.createElement("p");
        p.textContent = text;
        meaning.append(p);
      };
      const belongs = current.familyIds.includes(family.id);
      paragraph(belongs && current.definition ? current.definition : `${belongs ? "Family-level explanation" : "My chosen Frayer"} \u2014 ${family.label}: ${family.meaning}`);
      if (belongs && current.definition) paragraph(`Concept family \u2014 ${family.label}: ${family.meaning}`);
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
      status2();
    }
    const close = () => {
      if (dialog.open) dialog.close();
    };
    const onClose = () => {
      restoreLoans();
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
      if (!target || !root2.contains(target)) return;
      current = terms.get(target.dataset.bioTerm) ?? null;
      if (!current) return;
      trigger = target;
      const route = target.dataset.bioTermRoute;
      familySelect.replaceChildren();
      for (const family of adapter.families.filter((f) => current.familyIds.includes(f.id)).sort((a, b) => Number(b.routes.includes(route)) - Number(a.routes.includes(route)))) {
        const option = doc.createElement("option");
        option.value = family.id;
        option.textContent = family.label;
        familySelect.append(option);
      }
      for (const id of adapter.selectedFamilies?.() ?? []) {
        if (current.familyIds.includes(id)) continue;
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
    const afterInput = () => win.setTimeout(status2, 0);
    root2.addEventListener("click", click);
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
      root2.removeEventListener("click", click);
      win.removeEventListener("hashchange", close);
      dialog.remove();
      style.remove();
    } };
  }

  // scripts/lib/biology30-course/v1/pilot2-vocabulary-panel.ts
  function mountTopicVocabularyPanel(root2, input, state, controls) {
    const source = input.vocabulary;
    const families = source.conceptFamilies.map((f) => ({ id: f.id, label: f.label, meaning: f.meaning, wordAnalysis: [f.wordAnalysis.treatment, f.wordAnalysis.caution], routes: input.contract.topics.filter((t) => t.parts.some((p) => f.teachingPartIds.includes(p.id))).map((t) => t.id) }));
    let lastMessage = "Writing saves as you type. Each field allows 240 characters.";
    const observe = (event) => {
      const detail = event.detail;
      if (detail?.message) lastMessage = detail.message;
    };
    root2.addEventListener("pilot2-state-change", observe);
    const panel = mountVocabularyPanel({
      root: root2,
      families,
      terms: source.introducedTerms.filter((t) => source.conceptFamilies.some((f) => f.termIds.includes(t.id))).map((t) => ({ term: t.term, definition: t.definition, familyIds: source.conceptFamilies.filter((f) => f.termIds.includes(t.id)).map((f) => f.id) })),
      sections: () => Array.from(root2.querySelectorAll(".p2-part > .lesson-block,.p2-part > .worked-example,.p2-part > .p2-advanced,.p2-walkthrough-frame")),
      route: (section) => section.closest("[data-pilot2-topic]").dataset.pilot2Topic,
      unlocked: (id) => {
        const route = root2.querySelector(`[data-p2-family-panel="${CSS.escape(id)}"]`)?.dataset.p2UnlockRoute;
        return Boolean(route && state.visited.includes(route));
      },
      frayer: (id) => root2.querySelector(`[data-p2-family-panel="${CSS.escape(id)}"] .frayer`),
      choices: () => root2.querySelector(".p2-family-choices"),
      refresh: () => controls.refresh(),
      status: () => lastMessage,
      selectedFamilies: () => state.frayerChoices
    });
    const choose = (event) => {
      const button = event.target instanceof Element ? event.target.closest("dialog.bio-vocabulary [data-p2-choose-family]") : null;
      if (button && state.frayerChoices.length === 2 && !state.frayerChoices.includes(button.dataset.p2ChooseFamily)) {
        event.stopPropagation();
        const manager = root2.querySelector(".p2-family-choices");
        if (manager) manager.open = true;
        const status2 = root2.querySelector("[data-pilot2-frayer-status]");
        if (status2) status2.textContent = "Both choices are occupied. Use the concept-family selector above to open a chosen Frayer. Keep a copy and explicitly clear its writing before replacing that choice.";
      }
    };
    root2.addEventListener("click", choose, true);
    return { dispose() {
      panel.dispose();
      root2.removeEventListener("click", choose, true);
      root2.removeEventListener("pilot2-state-change", observe);
    } };
  }

  // scripts/lib/biology30-course/v1/pilot2-legacy-work.ts
  var record = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value));
  function describeLegacyWork(original, schema2) {
    let data;
    try {
      data = JSON.parse(original);
    } catch {
      return [{ label: "Unparsed earlier work", text: original }];
    }
    const entries = [];
    const text = (value) => typeof value === "string" ? value : JSON.stringify(value, null, 2);
    const reverse = (map) => Object.fromEntries(Object.entries(map).map(([id, token]) => [token, id]));
    const name = (value, map) => typeof value === "string" ? Object.hasOwn(map, value) ? map[value] : value : text(value);
    if (record(data) && data.v === 2) {
      const seen = /* @__PURE__ */ new Set();
      for (const [field, label, map] of [["r", "Earlier response", reverse(schema2.responses)], ["p", "Earlier practice choice", reverse(schema2.practice)]]) {
        if (!Array.isArray(data[field])) continue;
        seen.add(field);
        for (const pair of data[field]) {
          if (Array.isArray(pair) && pair.length === 2) entries.push({ label: `${label}: ${name(pair[0], map)}`, text: text(pair[1]) });
          else entries.push({ label: `${label}: unrecognized entry`, text: text(pair) });
        }
      }
      for (const [field, label, map] of [["c", "Earlier completion (not new completion)", reverse(schema2.lessons)], ["a", "Earlier collected artifact", reverse(schema2.artifacts)]]) {
        if (!Array.isArray(data[field])) continue;
        seen.add(field);
        for (const value of data[field]) entries.push({ label, text: name(value, map) });
      }
      if (Array.isArray(data.n)) {
        seen.add("n");
        for (const note of data.n) entries.push(Array.isArray(note) && note.length === 2 ? { label: `Earlier note: ${text(note[0])}`, text: text(note[1]) } : { label: "Earlier note: unrecognized entry", text: text(note) });
      }
      if (record(data.i) && Array.isArray(data.i.g)) {
        const interactions = new Map(Object.entries(schema2.interactions).map(([id, definition]) => [definition.token, { id, options: reverse(definition.options) }]));
        for (const row of data.i.g) {
          const definition = Array.isArray(row) && typeof row[0] === "string" ? interactions.get(row[0]) : void 0;
          entries.push({ label: `Earlier model: ${definition?.id ?? "unrecognized model"}`, text: definition && Array.isArray(row) && row.length === 3 ? `Selected: ${name(row[1], definition.options)}
Seen: ${Array.isArray(row[2]) ? row[2].map((value) => name(value, definition.options)).join(", ") : text(row[2])}` : text(row) });
        }
      }
      for (const [field, value] of Object.entries(data)) if (!seen.has(field)) entries.push({ label: `Earlier ${field}`, text: text(value) });
    } else if (record(data)) {
      for (const [field, value] of Object.entries(data)) {
        if (record(value)) for (const [id, answer] of Object.entries(value)) entries.push({ label: `Earlier ${field}: ${id}`, text: text(answer) });
        else entries.push({ label: `Earlier ${field}`, text: text(value) });
      }
    } else if (Array.isArray(data)) {
      data.forEach((value, index) => entries.push({ label: `Earlier entry ${index + 1}`, text: text(value) }));
    } else entries.push({ label: "Earlier saved value", text: text(data) });
    return entries;
  }

  // scripts/lib/biology30-course/v1/pilot2-activity-index.ts
  function validateTopicActivityIndex(entries, state) {
    const ids = /* @__PURE__ */ new Set();
    const accounted = { responses: /* @__PURE__ */ new Set(), choices: /* @__PURE__ */ new Set(), flags: /* @__PURE__ */ new Set() };
    for (const entry of entries) {
      if (!entry.id || ids.has(entry.id) || !state.routes.includes(entry.routeId) || !entry.focusId || !entry.title.trim()) throw new Error(`Invalid activity return target: ${entry.id}`);
      ids.add(entry.id);
      for (const kind of ["responses", "choices", "flags"]) for (const field of entry[kind]) {
        if (!Object.hasOwn(state[kind], field.id) || accounted[kind].has(field.id) || !field.label.trim()) throw new Error(`Unbound or duplicate collection ${kind}: ${field.id}`);
        accounted[kind].add(field.id);
      }
      for (const choice of entry.choices) {
        if (Object.keys(choice.options).sort().join("\0") !== [...state.choices[choice.id].values].sort().join("\0") || Object.values(choice.options).some((label) => !label.trim())) throw new Error(`Collection choice meaning drift: ${choice.id}`);
      }
    }
    for (const kind of ["responses", "choices", "flags"]) {
      if (accounted[kind].size !== Object.keys(state[kind]).length) throw new Error(`Collection omits registered ${kind}`);
    }
    return { entries: entries.length, responses: accounted.responses.size, choices: accounted.choices.size, flags: accounted.flags.size };
  }
  function meaningfulTopicResponse(id, value, graphs) {
    if (!value?.trim()) return false;
    const graph = graphs.find((item) => item.responseId === id);
    if (!graph) return true;
    const result = decodeGraphDraft(graph, value);
    return result.kind === "preserved-writing" || Boolean(result.draft.e.trim()) || result.draft.g.some((plot) => plot.a.some((axis) => axis !== null) || plot.p.some((points) => points.some((point) => point !== null)));
  }
  function collectTopicWork(index, state, schema2, graphs = [], legacySchema) {
    validateTopicState(state, schema2);
    const entries = [];
    for (const item of index) {
      const fields = [];
      for (const field of item.responses) {
        const text = state.responses[field.id];
        if (!meaningfulTopicResponse(field.id, text, graphs)) continue;
        const graph = graphs.find((graph2) => graph2.responseId === field.id), decoded = graph ? decodeGraphDraft(graph, text) : null;
        fields.push({ label: field.label, text: decoded?.kind === "graph" ? graphWorkText(graph, decoded.draft) : text });
      }
      for (const field of item.choices) {
        const value = state.choices[field.id];
        if (value !== void 0) fields.push({ label: field.label, text: field.options[value] });
      }
      for (const field of item.flags) if (state.flags.includes(field.id)) fields.push({ label: "Status", text: field.label });
      if (fields.length) entries.push({ id: item.id, title: item.title, category: item.category, routeId: item.routeId, focusId: item.focusId, fields });
    }
    state.legacy.forEach((legacy, index2) => entries.push({
      id: `preserved-legacy-${index2}`,
      title: `Earlier work: ${legacy.source}`,
      category: "Preserved earlier work",
      routeId: null,
      focusId: null,
      fields: legacySchema ? describeLegacyWork(legacy.original, legacySchema) : [{ label: "Original saved payload; not reassigned to new activities", text: legacy.original }],
      legacyOriginal: legacy.original
    }));
    return entries;
  }

  // scripts/lib/biology30-course/v1/pilot2-render-common.ts
  var topicHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

  // scripts/lib/biology30-course/v1/pilot2-collection-view.ts
  function currentTopicWork(index, state, schema2, graphs = [], legacySchema) {
    validateTopicActivityIndex(index, schema2);
    const displaySchema = { ...schema2, responses: Object.fromEntries(Object.entries(schema2.responses).map(([id, field]) => [id, { ...field, limit: Math.max(field.limit, typeof state.responses[id] === "string" ? state.responses[id].length : 0) }])) };
    return collectTopicWork(index, state, displaySchema, graphs, legacySchema);
  }
  function collectedWorkText(entries) {
    return entries.map((entry) => `${entry.title}
${entry.category}
${entry.fields.map((field) => `${field.label}
${field.text}`).join("\n\n")}`).join("\n\n\u2500\u2500\u2500\u2500\n\n");
  }
  function workHtml(entries, withReturn, groupFor = (e) => e.category) {
    return [...new Set(entries.map(groupFor))].map((category) => `<section class="process-work-group"><h3>${topicHtml(category)}</h3>${entries.filter((e) => groupFor(e) === category).map((entry) => `<article class="process-work-item p2-work-entry"><div><p class="process-work-context">${topicHtml(entry.category)}</p><h4>${topicHtml(entry.title)}</h4>${entry.fields.map((field) => `<section><p class="process-work-prompt">${topicHtml(field.label)}</p><p class="process-work-response p2-preserved-text">${topicHtml(field.text)}</p></section>`).join("")}</div><div class="process-work-side">${withReturn && entry.routeId && entry.focusId ? `<a href="#${topicHtml(entry.routeId)}" data-pilot2-return-route="${topicHtml(entry.routeId)}" data-pilot2-return-focus="${topicHtml(entry.focusId)}">Return to this activity</a>` : ""}</div></article>`).join("")}</section>`).join("");
  }
  function mountTopicCollection(root2, index, state, schema2, graphs = [], legacySchema, extraDrafts = () => []) {
    const search = root2.querySelector("[data-pilot2-work-search]"), category = root2.querySelector("[data-pilot2-work-category]"), list = root2.querySelector("[data-pilot2-work-list]"), status2 = root2.querySelector("[data-pilot2-work-status]"), fallback = root2.querySelector("[data-pilot2-copy-fallback]"), print = root2.querySelector("[data-pilot2-print-work]");
    if (!search || !category || !list || !status2 || !fallback || !print) throw new Error("Incomplete collection controls");
    const chapter = root2.querySelector("[data-p2-work-chapter]");
    const chapterFor = (entry) => {
      const route = entry.routeId ? root2.querySelector(`#${CSS.escape(entry.routeId)}`) : null;
      const target = entry.focusId ? root2.querySelector(`#${CSS.escape(entry.focusId)}`) : null;
      const unlock = target?.dataset.p2UnlockRoute;
      const taught = unlock ? root2.querySelector(`#${CSS.escape(unlock)}`) : null;
      const n = target?.dataset.p2Chapter ?? taught?.dataset.p2Chapter ?? route?.dataset.p2Chapter;
      return n ? `Chapter ${n}` : /seminar|final|challenge/.test(entry.routeId ?? "") ? "Unit review" : "Personal and collection work";
    };
    let current = [];
    const refresh = () => {
      try {
        current = [...currentTopicWork(index, state, schema2, graphs, legacySchema), ...extraDrafts()];
      } catch {
        status2.textContent = "Some current work cannot be interpreted. Keep the visible responses and recovery text before leaving.";
        return false;
      }
      const selected = category.value, categories = [...new Set(current.map((entry) => entry.category))].sort();
      category.replaceChildren(new Option("All types", ""), ...categories.map((value) => new Option(value, value)));
      category.value = categories.includes(selected) ? selected : "";
      if (chapter) {
        const selectedChapter = chapter.value, chapters = [...new Set(current.map(chapterFor))].sort();
        chapter.replaceChildren(new Option("All chapters", ""), ...chapters.map((value) => new Option(value, value)));
        chapter.value = chapters.includes(selectedChapter) ? selectedChapter : "";
      }
      const query = search.value.trim().toLocaleLowerCase(), filtered = current.filter((entry) => (!chapter?.value || chapterFor(entry) === chapter.value) && (!category.value || entry.category === category.value) && (!query || [entry.title, ...entry.fields.flatMap((field) => [field.label, field.text])].join(" ").toLocaleLowerCase().includes(query)));
      list.innerHTML = filtered.length ? workHtml(filtered, true, chapterFor) : "<p>No work matches this view.</p>";
      status2.textContent = `Showing ${filtered.length} of ${current.length} work entries.`;
      return true;
    };
    let printParent = null, printNext = null;
    const finishPrint = () => {
      root2.ownerDocument.body.classList.remove("p2-printing-work");
      if (printParent) {
        printParent.insertBefore(print, printNext?.parentNode === printParent ? printNext : null);
        printParent = null;
      }
    };
    window.addEventListener("afterprint", finishPrint);
    const click = async (event) => {
      const button = event.target instanceof Element ? event.target.closest("button") : null;
      if (!button || !root2.contains(button)) return;
      if (button.hasAttribute("data-pilot2-copy-all")) {
        if (!refresh()) return;
        const text = collectedWorkText(current);
        try {
          await navigator.clipboard.writeText(text);
          status2.textContent = "Whole collection copied.";
          fallback.hidden = true;
        } catch {
          fallback.value = text;
          fallback.hidden = false;
          fallback.focus();
          fallback.select();
          status2.textContent = "Automatic copying is unavailable. The whole collection is selected below for copying.";
        }
      } else if (button.hasAttribute("data-pilot2-print-all")) {
        if (!refresh()) return;
        finishPrint();
        print.innerHTML = `<h1>All My Work</h1>${workHtml(current, false, chapterFor)}`;
        printParent = print.parentNode;
        printNext = print.nextSibling;
        root2.ownerDocument.body.append(print);
        root2.ownerDocument.body.classList.add("p2-printing-work");
        try {
          window.print();
        } catch {
          finishPrint();
          status2.textContent = "Printing did not open. Copy all work to keep a readable copy.";
        }
      }
    };
    root2.addEventListener("click", click);
    root2.addEventListener("pilot2-state-change", refresh);
    root2.addEventListener("pilot2-draft-change", refresh);
    search.addEventListener("input", refresh);
    category.addEventListener("change", refresh);
    chapter?.addEventListener("change", refresh);
    refresh();
    return { refresh, dispose() {
      finishPrint();
      window.removeEventListener("afterprint", finishPrint);
      root2.removeEventListener("click", click);
      root2.removeEventListener("pilot2-state-change", refresh);
      root2.removeEventListener("pilot2-draft-change", refresh);
      search.removeEventListener("input", refresh);
      category.removeEventListener("change", refresh);
      chapter?.removeEventListener("change", refresh);
    } };
  }

  // <stdin>
  var schema = { "courseId": "biology20", "unit": "A", "routes": ["a-topic-intro-to-ecology", "a-core-vocabulary", "a-overview", "a-all-my-work", "a-advanced", "a-glossary", "a-sources-and-credits", "a-chapter-1-practice", "a-chapter-2-practice", "a-review-seminar", "a-final-practice", "a-models", "a-textbook", "a-video-library"], "responses": { "a-family-systems-definition": { "token": "v0_0", "limit": 240 }, "a-family-systems-mechanism": { "token": "v0_1", "limit": 240 }, "a-family-systems-evidence": { "token": "v0_2", "limit": 240 }, "a-family-systems-confusion": { "token": "v0_3", "limit": 240 }, "a-family-energy-definition": { "token": "v1_0", "limit": 240 }, "a-family-energy-mechanism": { "token": "v1_1", "limit": 240 }, "a-family-energy-evidence": { "token": "v1_2", "limit": 240 }, "a-family-energy-confusion": { "token": "v1_3", "limit": 240 }, "a-family-food-webs-definition": { "token": "v2_0", "limit": 240 }, "a-family-food-webs-mechanism": { "token": "v2_1", "limit": 240 }, "a-family-food-webs-evidence": { "token": "v2_2", "limit": 240 }, "a-family-food-webs-confusion": { "token": "v2_3", "limit": 240 }, "a-family-efficiency-definition": { "token": "v3_0", "limit": 240 }, "a-family-efficiency-mechanism": { "token": "v3_1", "limit": 240 }, "a-family-efficiency-evidence": { "token": "v3_2", "limit": 240 }, "a-family-efficiency-confusion": { "token": "v3_3", "limit": 240 }, "a-family-water-definition": { "token": "v4_0", "limit": 240 }, "a-family-water-mechanism": { "token": "v4_1", "limit": 240 }, "a-family-water-evidence": { "token": "v4_2", "limit": 240 }, "a-family-water-confusion": { "token": "v4_3", "limit": 240 }, "a-family-matter-cycles-definition": { "token": "v5_0", "limit": 240 }, "a-family-matter-cycles-mechanism": { "token": "v5_1", "limit": 240 }, "a-family-matter-cycles-evidence": { "token": "v5_2", "limit": 240 }, "a-family-matter-cycles-confusion": { "token": "v5_3", "limit": 240 }, "a-family-albedo-definition": { "token": "v6_0", "limit": 240 }, "a-family-albedo-mechanism": { "token": "v6_1", "limit": 240 }, "a-family-albedo-evidence": { "token": "v6_2", "limit": 240 }, "a-family-albedo-confusion": { "token": "v6_3", "limit": 240 }, "a-family-producers-definition": { "token": "v7_0", "limit": 240 }, "a-family-producers-mechanism": { "token": "v7_1", "limit": 240 }, "a-family-producers-evidence": { "token": "v7_2", "limit": 240 }, "a-family-producers-confusion": { "token": "v7_3", "limit": 240 }, "a-family-pyramids-definition": { "token": "v8_0", "limit": 240 }, "a-family-pyramids-mechanism": { "token": "v8_1", "limit": 240 }, "a-family-pyramids-evidence": { "token": "v8_2", "limit": 240 }, "a-family-pyramids-confusion": { "token": "v8_3", "limit": 240 }, "a-family-gas-balance-definition": { "token": "v9_0", "limit": 240 }, "a-family-gas-balance-mechanism": { "token": "v9_1", "limit": 240 }, "a-family-gas-balance-evidence": { "token": "v9_2", "limit": 240 }, "a-family-gas-balance-confusion": { "token": "v9_3", "limit": 240 }, "a-topic-intro-to-ecology-retrieval": { "token": "r0", "limit": 400 }, "a-topic-intro-to-ecology-media": { "token": "r1", "limit": 650 }, "a-topic-intro-to-ecology-evidence": { "token": "r2", "limit": 1e3 }, "a-topic-intro-to-ecology-guided-carbon": { "token": "p1", "limit": 750 } }, "choices": { "a-topic-intro-to-ecology-guided-albedo": { "token": "c0", "values": ["0", "1", "2", "3"] } }, "flags": { "a-family-systems-collected": "vf0", "a-family-energy-collected": "vf1", "a-family-food-webs-collected": "vf2", "a-family-efficiency-collected": "vf3", "a-family-water-collected": "vf4", "a-family-matter-cycles-collected": "vf5", "a-family-albedo-collected": "vf6", "a-family-producers-collected": "vf7", "a-family-pyramids-collected": "vf8", "a-family-gas-balance-collected": "vf9", "a-topic-intro-to-ecology-guided-albedo-attempted": "p0", "a-topic-intro-to-ecology-guided-carbon-attempted": "p1", "a-topic-intro-to-ecology-evidence-collected": "ec", "a-topic-intro-to-ecology-media-attempted": "ma", "a-topic-intro-to-ecology-system-boundaries-advanced-complete": "ad0", "a-topic-intro-to-ecology-energy-and-albedo-advanced-complete": "ad1", "a-topic-intro-to-ecology-producing-organic-matter-advanced-complete": "ad2" }, "families": { "fixed": ["a-family-systems", "a-family-energy", "a-family-food-webs", "a-family-efficiency", "a-family-water", "a-family-matter-cycles"], "selectable": ["a-family-albedo", "a-family-producers", "a-family-pyramids", "a-family-gas-balance"], "responseIds": { "a-family-systems": ["a-family-systems-definition", "a-family-systems-mechanism", "a-family-systems-evidence", "a-family-systems-confusion"], "a-family-energy": ["a-family-energy-definition", "a-family-energy-mechanism", "a-family-energy-evidence", "a-family-energy-confusion"], "a-family-food-webs": ["a-family-food-webs-definition", "a-family-food-webs-mechanism", "a-family-food-webs-evidence", "a-family-food-webs-confusion"], "a-family-efficiency": ["a-family-efficiency-definition", "a-family-efficiency-mechanism", "a-family-efficiency-evidence", "a-family-efficiency-confusion"], "a-family-water": ["a-family-water-definition", "a-family-water-mechanism", "a-family-water-evidence", "a-family-water-confusion"], "a-family-matter-cycles": ["a-family-matter-cycles-definition", "a-family-matter-cycles-mechanism", "a-family-matter-cycles-evidence", "a-family-matter-cycles-confusion"], "a-family-albedo": ["a-family-albedo-definition", "a-family-albedo-mechanism", "a-family-albedo-evidence", "a-family-albedo-confusion"], "a-family-producers": ["a-family-producers-definition", "a-family-producers-mechanism", "a-family-producers-evidence", "a-family-producers-confusion"], "a-family-pyramids": ["a-family-pyramids-definition", "a-family-pyramids-mechanism", "a-family-pyramids-evidence", "a-family-pyramids-confusion"], "a-family-gas-balance": ["a-family-gas-balance-definition", "a-family-gas-balance-mechanism", "a-family-gas-balance-evidence", "a-family-gas-balance-confusion"] } } };
  var key = "biology20-unit-a:internal-first-topic-proof:v1";
  var root = document.body;
  var status = document.querySelector("[data-pilot2-save-status]");
  status.id = "proof-status";
  mountTopicFigureViewer(root);
  mountTopicReturnLinks(root, schema.routes);
  var storage = { getItem(k) {
    return localStorage.getItem(k.replace("biology20-unit-a:state:v1", key));
  }, setItem(k, v) {
    localStorage.setItem(k.replace("biology20-unit-a:state:v1", key), v);
  } };
  try {
    const raw = storage.getItem("biology20-unit-a:state:v1"), state = raw ? decodeTopicState(raw, schema) : emptyTopicState(schema);
    if (!raw) state.route = "a-overview";
    const controls = mountTopicControls(root, state, schema, (s) => {
      const result = persistTopicState(s, schema, storage, null);
      const saved = result.accepted && result.local === "saved";
      const message = saved ? "Saved in this internal preview only." : "Draft not saved. Keep this page open and copy your writing. " + result.error;
      status.textContent = message;
      return { saved, message };
    });
    mountTopicFrayerControls(root, state, schema, controls);
    mountTopicPresentation(root, state, schema, controls);
    mountTopicVocabularyPanel(root, { "contract": { "courseId": "biology20", "unit": "A", "requiredMinutes": 0, "optionalMinutes": 18, "requiredRoutes": ["a-topic-intro-to-ecology"], "topics": [{ "id": "a-topic-intro-to-ecology", "title": "Intro to Ecology", "chapter": 1, "planRows": [{ "source": "Chapter 1 Daily Plans.docx", "row": 1, "days": "1" }], "slideNumbers": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], "sourceActivities": ["\u2022 Go through slides 1\u201317 of the Biology 20 Unit A Chapter 1 Notes\n(take notes + watch all included videos)\n\u2022 Textbook: 9\u201314 #2,5\u20137; 15 #2,4,7\n\u2022 Create Quizlet / flashcards and practice key terms"], "calendarDays": 1, "outcomeIds": [], "status": "source-mapped", "planRowId": "internal-vocabulary-routing", "parts": [{ "id": "a-topic-intro-to-ecology-system-boundaries", "title": "Choose a boundary before tracing exchanges", "outcomeIds": [], "operation": "Draft operation; official evidence binding pending", "concepts": [] }, { "id": "a-topic-intro-to-ecology-energy-and-albedo", "title": "Trace incoming energy and distinguish reflection from absorption", "outcomeIds": [], "operation": "Draft operation; official evidence binding pending", "concepts": [] }, { "id": "a-topic-intro-to-ecology-producing-organic-matter", "title": "Separate the source of energy from the source of carbon", "outcomeIds": [], "operation": "Draft operation; official evidence binding pending", "concepts": [] }] }, { "id": "a-topic-trophic-levels-and-efficiency", "title": "Trophic Levels and Efficiency", "chapter": 1, "planRows": [{ "source": "Chapter 1 Daily Plans.docx", "row": 2, "days": "2" }], "slideNumbers": [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35], "sourceActivities": ["\u2022 Go through slides 18\u201335 of the Biology 20 Unit A Chapter 1 Notes\n(take notes + watch all included videos)\n\u2022 Textbook: 9\u201314 #1,3,4,8\u201311; 15 #1,3,5,6,8\n\u2022 Optional: 16\u201318 #12\u201316; 27 #1\u20135,8\u20139 (these fit best with Day 2 but may be completed on Day 3)\n\u2022 Create Quizlet / flashcards and practice key terms"], "calendarDays": 1, "outcomeIds": [], "status": "source-mapped", "planRowId": "internal-vocabulary-routing", "parts": [{ "id": "a-topic-trophic-levels-and-efficiency-feeding-roles", "title": "Food webs and trophic roles", "outcomeIds": [], "operation": "Planned teaching destination; not authored evidence", "concepts": [] }, { "id": "a-topic-trophic-levels-and-efficiency-transfer-efficiency", "title": "Trophic transfer efficiency", "outcomeIds": [], "operation": "Planned teaching destination; not authored evidence", "concepts": [] }] }, { "id": "a-topic-ecological-pyramids", "title": "Ecological Pyramids", "chapter": 1, "planRows": [{ "source": "Chapter 1 Daily Plans.docx", "row": 3, "days": "3" }], "slideNumbers": [36, 37, 38, 39, 40, 41, 42, 43], "sourceActivities": ["\u2022 Go through slides 36\u201343 of the Biology 20 Unit A Chapter 1 Notes\n(take notes + watch all included videos)\n\u2022 Textbook: 19 #17; 24 #18; 27 #6,7\n\u2022 Create Quizlet / flashcards and practice key terms"], "calendarDays": 1, "outcomeIds": [], "status": "source-mapped", "planRowId": "internal-vocabulary-routing", "parts": [{ "id": "a-topic-ecological-pyramids-numbers-and-biomass", "title": "Ecological pyramids", "outcomeIds": [], "operation": "Planned teaching destination; not authored evidence", "concepts": [] }] }, { "id": "a-topic-water-and-the-hydrologic-cycle", "title": "Water and the Hydrologic Cycle", "chapter": 2, "planRows": [{ "source": "Chapter 2 Daily Plans.docx", "row": 1, "days": "6" }], "slideNumbers": [44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57], "sourceActivities": ["\u2022 Go through slides 44\u201357 of the Biology 20 Unit A Chapter 2 Notes\n(take notes + watch all included videos)\n\u2022 Textbook: 36\u201340 #1,2,4\u20135; 40 #1\u20137\n\u2022 Create Quizlet / flashcards and practice key terms"], "calendarDays": 1, "outcomeIds": [], "status": "source-mapped", "planRowId": "internal-vocabulary-routing", "parts": [{ "id": "a-topic-water-and-the-hydrologic-cycle-water-properties", "title": "Water properties and cycling", "outcomeIds": [], "operation": "Planned teaching destination; not authored evidence", "concepts": [] }] }, { "id": "a-topic-carbon-oxygen-and-nitrogen-cycles", "title": "Carbon, Oxygen and Nitrogen Cycles", "chapter": 2, "planRows": [{ "source": "Chapter 2 Daily Plans.docx", "row": 2, "days": "7" }], "slideNumbers": [58, 59, 60, 61, 62, 63, 64], "sourceActivities": ["\u2022 Go through slides 58\u201364 of the Biology 20 Unit A Chapter 2 Notes\n(take notes + watch all included videos)\n\u2022 Textbook: 43\u201346 #6\u201310; 49 #13,14; 52 #1\n\u2022 Create Quizlet / flashcards and practice key terms"], "calendarDays": 1, "outcomeIds": [], "status": "source-mapped", "planRowId": "internal-vocabulary-routing", "parts": [{ "id": "a-topic-carbon-oxygen-and-nitrogen-cycles-carbon-and-oxygen", "title": "Matter stores and biogeochemical cycles", "outcomeIds": [], "operation": "Planned teaching destination; not authored evidence", "concepts": [] }] }, { "id": "a-topic-sulfur-and-phosphorus-cycles", "title": "Sulfur and Phosphorus Cycles", "chapter": 2, "planRows": [{ "source": "Chapter 2 Daily Plans.docx", "row": 3, "days": "8" }], "slideNumbers": [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77], "sourceActivities": ["\u2022 Go through slides 65\u201377 of the Biology 20 Unit A Chapter 2 Notes\n(take notes + watch all included videos)\n\u2022 Textbook: 48 #11\u201312; 50 #15\u201317; 52 #3,5,7,8; 61 #7,8\n\u2022 Create Quizlet / flashcards and practice key terms"], "calendarDays": 1, "outcomeIds": [], "status": "source-mapped", "planRowId": "internal-vocabulary-routing", "parts": [{ "id": "a-topic-sulfur-and-phosphorus-cycles-atmosphere-and-life", "title": "Atmospheric gas balance", "outcomeIds": [], "operation": "Planned teaching destination; not authored evidence", "concepts": [] }] }] }, "vocabulary": { "unit": "A", "preservedGlossaryEntries": [], "introducedTerms": [{ "id": "a-term-ecology", "term": "Ecology", "definition": "The study of relationships among organisms and between organisms and their environment.", "firstTeachingTopicId": "a-topic-intro-to-ecology", "firstTeachingPartId": "a-topic-intro-to-ecology-system-boundaries", "occurrences": ["a-topic-intro-to-ecology-system-boundaries"], "wordAnalysisStatus": "not-yet-reviewed; do not generate origins" }, { "id": "a-term-system", "term": "system", "definition": "The parts selected for an investigation, separated from their surroundings by a stated boundary.", "firstTeachingTopicId": "a-topic-intro-to-ecology", "firstTeachingPartId": "a-topic-intro-to-ecology-system-boundaries", "occurrences": ["a-topic-intro-to-ecology-system-boundaries"], "wordAnalysisStatus": "not-yet-reviewed; do not generate origins" }, { "id": "a-term-open-system", "term": "open system", "definition": "A system that exchanges both matter and energy with its surroundings.", "firstTeachingTopicId": "a-topic-intro-to-ecology", "firstTeachingPartId": "a-topic-intro-to-ecology-system-boundaries", "occurrences": ["a-topic-intro-to-ecology-system-boundaries"], "wordAnalysisStatus": "not-yet-reviewed; do not generate origins" }, { "id": "a-term-closed-system", "term": "closed system", "definition": "A system that exchanges energy but approximately no matter with its surroundings over the stated interval.", "firstTeachingTopicId": "a-topic-intro-to-ecology", "firstTeachingPartId": "a-topic-intro-to-ecology-system-boundaries", "occurrences": ["a-topic-intro-to-ecology-system-boundaries"], "wordAnalysisStatus": "not-yet-reviewed; do not generate origins" }, { "id": "a-term-isolated-system", "term": "isolated system", "definition": "An ideal system that exchanges neither matter nor energy with its surroundings.", "firstTeachingTopicId": "a-topic-intro-to-ecology", "firstTeachingPartId": "a-topic-intro-to-ecology-system-boundaries", "occurrences": ["a-topic-intro-to-ecology-system-boundaries"], "wordAnalysisStatus": "not-yet-reviewed; do not generate origins" }, { "id": "a-term-biosphere", "term": "biosphere", "definition": "The regions of Earth where life occurs.", "firstTeachingTopicId": "a-topic-intro-to-ecology", "firstTeachingPartId": "a-topic-intro-to-ecology-system-boundaries", "occurrences": ["a-topic-intro-to-ecology-system-boundaries"], "wordAnalysisStatus": "not-yet-reviewed; do not generate origins" }, { "id": "a-term-albedo", "term": "albedo", "definition": "The fraction of incoming solar radiation reflected by a surface.", "firstTeachingTopicId": "a-topic-intro-to-ecology", "firstTeachingPartId": "a-topic-intro-to-ecology-energy-and-albedo", "occurrences": ["a-topic-intro-to-ecology-energy-and-albedo"], "wordAnalysisStatus": "not-yet-reviewed; do not generate origins" }, { "id": "a-term-positive-feedback", "term": "positive feedback", "definition": "A response that amplifies an initial change.", "firstTeachingTopicId": "a-topic-intro-to-ecology", "firstTeachingPartId": "a-topic-intro-to-ecology-energy-and-albedo", "occurrences": ["a-topic-intro-to-ecology-energy-and-albedo"], "wordAnalysisStatus": "not-yet-reviewed; do not generate origins" }, { "id": "a-term-autotroph", "term": "autotroph", "definition": "An organism that builds organic material using inorganic carbon, with an energy input.", "firstTeachingTopicId": "a-topic-intro-to-ecology", "firstTeachingPartId": "a-topic-intro-to-ecology-producing-organic-matter", "occurrences": ["a-topic-intro-to-ecology-producing-organic-matter"], "wordAnalysisStatus": "not-yet-reviewed; do not generate origins" }, { "id": "a-term-photosynthesis", "term": "photosynthesis", "definition": "A process that uses light energy to support the production of organic material; oxygenic photosynthesis uses carbon dioxide and water and releases oxygen.", "firstTeachingTopicId": "a-topic-intro-to-ecology", "firstTeachingPartId": "a-topic-intro-to-ecology-producing-organic-matter", "occurrences": ["a-topic-intro-to-ecology-producing-organic-matter"], "wordAnalysisStatus": "not-yet-reviewed; do not generate origins" }, { "id": "a-term-chemosynthesis", "term": "chemosynthesis", "definition": "Production of organic material using energy from chemical reactions rather than light; this lesson considers organisms fixing inorganic carbon.", "firstTeachingTopicId": "a-topic-intro-to-ecology", "firstTeachingPartId": "a-topic-intro-to-ecology-producing-organic-matter", "occurrences": ["a-topic-intro-to-ecology-producing-organic-matter"], "wordAnalysisStatus": "not-yet-reviewed; do not generate origins" }, { "id": "a-term-cellular-respiration", "term": "cellular respiration", "definition": "Cellular reactions that transfer energy available from organic molecules into usable forms, including ATP.", "firstTeachingTopicId": "a-topic-intro-to-ecology", "firstTeachingPartId": "a-topic-intro-to-ecology-producing-organic-matter", "occurrences": ["a-topic-intro-to-ecology-producing-organic-matter"], "wordAnalysisStatus": "not-yet-reviewed; do not generate origins" }, { "id": "a-term-energy", "term": "energy", "definition": "A conserved physical quantity that can be transferred and transformed; ecological accounts track its inputs, outputs and storage.", "firstTeachingTopicId": "a-topic-intro-to-ecology", "firstTeachingPartId": "a-topic-intro-to-ecology-energy-and-albedo", "occurrences": ["a-topic-intro-to-ecology-energy-and-albedo"] }, { "id": "a-term-food-web", "term": "food web", "definition": "A representation of interconnected feeding relationships in a stated ecological system.", "firstTeachingTopicId": "a-topic-trophic-levels-and-efficiency", "firstTeachingPartId": "a-topic-trophic-levels-and-efficiency-feeding-roles", "occurrences": ["a-topic-trophic-levels-and-efficiency-feeding-roles"] }, { "id": "a-term-decomposer", "term": "decomposer", "definition": "An organism that chemically breaks down organic matter, commonly releasing enzymes and absorbing products.", "firstTeachingTopicId": "a-topic-trophic-levels-and-efficiency", "firstTeachingPartId": "a-topic-trophic-levels-and-efficiency-feeding-roles", "occurrences": ["a-topic-trophic-levels-and-efficiency-feeding-roles"] }, { "id": "a-term-transfer-efficiency", "term": "transfer efficiency", "definition": "The receiving trophic level's production divided by source-level production over matching boundaries, usually expressed as a percentage.", "firstTeachingTopicId": "a-topic-trophic-levels-and-efficiency", "firstTeachingPartId": "a-topic-trophic-levels-and-efficiency-transfer-efficiency", "occurrences": ["a-topic-trophic-levels-and-efficiency-transfer-efficiency"] }, { "id": "a-term-water", "term": "water", "definition": "The substance H\u2082O; its polarity and hydrogen bonding contribute to properties important to living systems.", "firstTeachingTopicId": "a-topic-water-and-the-hydrologic-cycle", "firstTeachingPartId": "a-topic-water-and-the-hydrologic-cycle-water-properties", "occurrences": ["a-topic-water-and-the-hydrologic-cycle-water-properties"] }, { "id": "a-term-hydrologic-cycle", "term": "hydrologic cycle", "definition": "Transfers of water among stores through processes including evaporation, precipitation, infiltration and runoff.", "firstTeachingTopicId": "a-topic-water-and-the-hydrologic-cycle", "firstTeachingPartId": "a-topic-water-and-the-hydrologic-cycle-water-properties", "occurrences": ["a-topic-water-and-the-hydrologic-cycle-water-properties"] }, { "id": "a-term-carbon", "term": "carbon", "definition": "The chemical element present in carbon dioxide and in the organic compounds of living systems.", "firstTeachingTopicId": "a-topic-carbon-oxygen-and-nitrogen-cycles", "firstTeachingPartId": "a-topic-carbon-oxygen-and-nitrogen-cycles-carbon-and-oxygen", "occurrences": ["a-topic-carbon-oxygen-and-nitrogen-cycles-carbon-and-oxygen"] }, { "id": "a-term-nitrogen-cycle", "term": "nitrogen cycle", "definition": "Transfers and chemical transformations of nitrogen among organisms and nonliving stores.", "firstTeachingTopicId": "a-topic-carbon-oxygen-and-nitrogen-cycles", "firstTeachingPartId": "a-topic-carbon-oxygen-and-nitrogen-cycles-carbon-and-oxygen", "occurrences": ["a-topic-carbon-oxygen-and-nitrogen-cycles-carbon-and-oxygen"] }, { "id": "a-term-biomass", "term": "biomass", "definition": "The mass of living material within a defined system, often measured as dry mass for ecological comparisons.", "firstTeachingTopicId": "a-topic-ecological-pyramids", "firstTeachingPartId": "a-topic-ecological-pyramids-numbers-and-biomass", "occurrences": ["a-topic-ecological-pyramids-numbers-and-biomass"] }, { "id": "a-term-ecological-pyramid", "term": "ecological pyramid", "definition": "A comparison of trophic levels using numbers, biomass or energy production, with the quantity and units specified.", "firstTeachingTopicId": "a-topic-ecological-pyramids", "firstTeachingPartId": "a-topic-ecological-pyramids-numbers-and-biomass", "occurrences": ["a-topic-ecological-pyramids-numbers-and-biomass"] }, { "id": "a-term-oxygen", "term": "oxygen", "definition": "A chemical element; molecular oxygen, O\u2082, is released by oxygenic photosynthesis and used in aerobic respiration.", "firstTeachingTopicId": "a-topic-sulfur-and-phosphorus-cycles", "firstTeachingPartId": "a-topic-sulfur-and-phosphorus-cycles-atmosphere-and-life", "occurrences": ["a-topic-sulfur-and-phosphorus-cycles-atmosphere-and-life"] }], "conceptFamilies": [{ "id": "a-family-systems", "label": "Systems and boundaries", "fixedFrayer": true, "meaning": "A system is the set of parts chosen for study. Its boundary determines which transfers count as exchanges with the surroundings.", "mechanism": "Rain and runoff carry matter across it; sunlight and heat transfer energy. This is an open system.", "contrast": "Closed does not mean isolated. Water evaporating within a sealed jar has not crossed the jar boundary.", "retrievalPrompt": "Explain this concept in a new example, then identify a limitation or common confusion.", "wordAnalysis": { "treatment": "Read open, closed and isolated as modifiers of system. Here they describe matter and energy exchange, not whether a place looks enclosed.", "caution": "This is contextual word analysis, not a claim about historical word origins." }, "termIds": ["a-term-ecology", "a-term-system", "a-term-open-system", "a-term-closed-system", "a-term-isolated-system", "a-term-biosphere"], "teachingPartIds": ["a-topic-intro-to-ecology-system-boundaries"], "modelFrayer": { "contextualDefinition": "A pond system includes the water, organisms and sediments inside my chosen boundary.", "essentialMechanism": "Rain and runoff carry matter across it; sunlight and heat transfer energy. This is an open system.", "unitEvidence": "A sealed transparent jar is approximately closed to matter over a short period, but light still enters.", "nonExampleOrConfusion": "Closed does not mean isolated. Water evaporating within a sealed jar has not crossed the jar boundary." }, "auditScores": {}, "auditTotal": 0 }, { "id": "a-family-energy", "label": "Energy transfer and conservation", "fixedFrayer": true, "meaning": "Energy is transferred between systems and transformed between forms; an account must conserve energy while identifying where it goes.", "mechanism": "Reflected radiation leaves without being absorbed; absorbed energy can later leave as heat or in other transfers.", "contrast": "Energy used by organisms is not destroyed. A smaller amount available to the next trophic level does not violate conservation.", "retrievalPrompt": "Explain this concept in a new example, then identify a limitation or common confusion.", "wordAnalysis": { "treatment": "Transfer describes movement between systems; transformation describes a change of form. These are different operations in an energy account.", "caution": "This is contextual word analysis, not a claim about historical word origins." }, "termIds": ["a-term-energy", "a-term-cellular-respiration"], "teachingPartIds": ["a-topic-intro-to-ecology-energy-and-albedo"], "modelFrayer": { "contextualDefinition": "An energy account identifies inputs, outputs and changes in energy stored within a boundary.", "essentialMechanism": "Reflected radiation leaves without being absorbed; absorbed energy can later leave as heat or in other transfers.", "unitEvidence": "In an illustrative model, 1,000 J arriving with 800 J reflected leaves 200 J absorbed when transmission is zero.", "nonExampleOrConfusion": "Energy used by organisms is not destroyed. A smaller amount available to the next trophic level does not violate conservation." }, "auditScores": {}, "auditTotal": 0 }, { "id": "a-family-food-webs", "label": "Food webs and trophic roles", "fixedFrayer": true, "meaning": "A food web represents feeding links through which matter and energy move. A trophic role describes how an organism obtains food in the stated relationship.", "mechanism": "An arrow runs from a food source to the consumer that receives its matter and chemical energy.", "contrast": "An omnivore need not occupy one trophic level in every chain. A missing arrow is not evidence of a feeding relationship.", "retrievalPrompt": "Explain this concept in a new example, then identify a limitation or common confusion.", "wordAnalysis": { "treatment": "Food web is a compound expression: web emphasizes connected feeding relationships, not one unbranched chain.", "caution": "This is contextual word analysis, not a claim about historical word origins." }, "termIds": ["a-term-food-web", "a-term-autotroph", "a-term-decomposer"], "teachingPartIds": ["a-topic-trophic-levels-and-efficiency-feeding-roles"], "modelFrayer": { "contextualDefinition": "A food web links organisms through specified feeding relationships.", "essentialMechanism": "An arrow runs from a food source to the consumer that receives its matter and chemical energy.", "unitEvidence": "If an insect eats a plant and a bird eats that insect, the model includes plant \u2192 insect \u2192 bird.", "nonExampleOrConfusion": "An omnivore need not occupy one trophic level in every chain. A missing arrow is not evidence of a feeding relationship." }, "auditScores": {}, "auditTotal": 0 }, { "id": "a-family-efficiency", "label": "Trophic transfer efficiency", "fixedFrayer": true, "meaning": "Trophic transfer efficiency compares production at a receiving trophic level with production at its source level over matching area and time boundaries.", "mechanism": "Match energy units, area and time before dividing. Respiration and material not consumed limit transfer to new biomass.", "contrast": "Ten percent is a model assumption, not a universal constant. Production divided by ingestion measures a different ratio.", "retrievalPrompt": "Explain this concept in a new example, then identify a limitation or common confusion.", "wordAnalysis": { "treatment": "Efficiency names a ratio with a particular numerator and denominator. Transfer specifies which movement between levels is being measured.", "caution": "This is contextual word analysis, not a claim about historical word origins." }, "termIds": ["a-term-transfer-efficiency"], "teachingPartIds": ["a-topic-trophic-levels-and-efficiency-transfer-efficiency"], "modelFrayer": { "contextualDefinition": "Transfer efficiency is the receiving level's production divided by source-level production, expressed as a percentage.", "essentialMechanism": "Match energy units, area and time before dividing. Respiration and material not consumed limit transfer to new biomass.", "unitEvidence": "Illustratively, 80 kJ m\u207B\xB2 yr\u207B\xB9 divided by 1,000 kJ m\u207B\xB2 yr\u207B\xB9 gives 8%.", "nonExampleOrConfusion": "Ten percent is a model assumption, not a universal constant. Production divided by ingestion measures a different ratio." }, "auditScores": {}, "auditTotal": 0 }, { "id": "a-family-water", "label": "Water properties and cycling", "fixedFrayer": true, "meaning": "Water's molecular properties influence its biological roles. The hydrologic cycle tracks transfers among water stores through processes such as evaporation, precipitation and runoff.", "mechanism": "Evaporation changes liquid water to vapour; precipitation transfers atmospheric water toward Earth's surface.", "contrast": "A water store is an amount at a time; a flow is a transfer over time. Water is not a solvent for every substance.", "retrievalPrompt": "Explain this concept in a new example, then identify a limitation or common confusion.", "wordAnalysis": { "treatment": "In hydrologic cycle, cycle describes repeated transfers among stores. A cycle is not a claim that every water molecule follows the same route.", "caution": "This is contextual word analysis, not a claim about historical word origins." }, "termIds": ["a-term-water", "a-term-hydrologic-cycle"], "teachingPartIds": ["a-topic-water-and-the-hydrologic-cycle-water-properties"], "modelFrayer": { "contextualDefinition": "The hydrologic cycle traces water moving among atmospheric, surface and subsurface stores.", "essentialMechanism": "Evaporation changes liquid water to vapour; precipitation transfers atmospheric water toward Earth's surface.", "unitEvidence": "In a stated pond model, inflows of 30 m\xB3 and outflows of 35 m\xB3 reduce stored water by 5 m\xB3.", "nonExampleOrConfusion": "A water store is an amount at a time; a flow is a transfer over time. Water is not a solvent for every substance." }, "auditScores": {}, "auditTotal": 0 }, { "id": "a-family-matter-cycles", "label": "Matter stores and biogeochemical cycles", "fixedFrayer": true, "meaning": "Biogeochemical cycles trace elements among living organisms and nonliving stores. Chemical reactions change compounds without creating or destroying their atoms.", "mechanism": "Photosynthesis incorporates inorganic carbon into organic matter; respiration can return carbon as carbon dioxide.", "contrast": "Most plants do not directly use atmospheric N\u2082 as their nitrogen source. Matter cycling does not mean energy is recycled indefinitely.", "retrievalPrompt": "Explain this concept in a new example, then identify a limitation or common confusion.", "wordAnalysis": { "treatment": "Store names where matter is held; process names how it moves or changes chemical form. Keep the element name separate from the compound containing it.", "caution": "This is contextual word analysis, not a claim about historical word origins." }, "termIds": ["a-term-carbon", "a-term-nitrogen-cycle", "a-term-photosynthesis", "a-term-cellular-respiration"], "teachingPartIds": ["a-topic-carbon-oxygen-and-nitrogen-cycles-carbon-and-oxygen"], "modelFrayer": { "contextualDefinition": "A matter cycle traces atoms among organisms, air, water, soil and rock through named processes.", "essentialMechanism": "Photosynthesis incorporates inorganic carbon into organic matter; respiration can return carbon as carbon dioxide.", "unitEvidence": "A plant can obtain carbon from atmospheric CO\u2082 while obtaining mineral nitrogen from soil compounds.", "nonExampleOrConfusion": "Most plants do not directly use atmospheric N\u2082 as their nitrogen source. Matter cycling does not mean energy is recycled indefinitely." }, "auditScores": {}, "auditTotal": 0 }, { "id": "a-family-albedo", "label": "Albedo and feedback", "fixedFrayer": false, "meaning": "Albedo is the fraction of incoming radiation reflected by a surface. A positive feedback amplifies an initial change through a returning causal effect.", "mechanism": "Divide reflected by incoming energy. A higher ratio means a greater reflected fraction, not necessarily a greater total reflection.", "contrast": "An albedo of 0.80 with 200 J incoming reflects less energy than 0.30 with 1,000 J incoming. Compare denominators.", "retrievalPrompt": "Explain this concept in a new example, then identify a limitation or common confusion.", "wordAnalysis": { "treatment": "Positive modifies feedback: it means amplifying, not beneficial. Use albedo as the complete scientific term; no historical origin is asserted.", "caution": "This is contextual word analysis, not a claim about historical word origins." }, "termIds": ["a-term-albedo", "a-term-positive-feedback"], "teachingPartIds": ["a-topic-intro-to-ecology-energy-and-albedo"], "modelFrayer": { "contextualDefinition": "Albedo compares reflected radiation with incoming radiation under the stated conditions.", "essentialMechanism": "Divide reflected by incoming energy. A higher ratio means a greater reflected fraction, not necessarily a greater total reflection.", "unitEvidence": "Reflecting 240 J from an incoming 800 J gives an albedo of 0.30.", "nonExampleOrConfusion": "An albedo of 0.80 with 200 J incoming reflects less energy than 0.30 with 1,000 J incoming. Compare denominators." }, "auditScores": {}, "auditTotal": 0 }, { "id": "a-family-producers", "label": "Producer carbon and energy sources", "fixedFrayer": false, "meaning": "Autotrophs build organic matter from inorganic carbon. Photosynthetic and chemosynthetic pathways differ in their energy sources.", "mechanism": "Photosynthesis uses light energy; the chemosynthetic example uses energy released by inorganic chemical reactions.", "contrast": "Finding an organism in darkness does not establish chemosynthesis. It might consume organic matter produced elsewhere.", "retrievalPrompt": "Explain this concept in a new example, then identify a limitation or common confusion.", "wordAnalysis": { "treatment": "Compare the complete pathway terms by carbon input and energy input. Do not infer a cell's pathway from a name, location or darkness alone.", "caution": "This is contextual word analysis, not a claim about historical word origins." }, "termIds": ["a-term-autotroph", "a-term-photosynthesis", "a-term-chemosynthesis"], "teachingPartIds": ["a-topic-intro-to-ecology-producing-organic-matter"], "modelFrayer": { "contextualDefinition": "An autotroph builds organic compounds using an inorganic carbon source.", "essentialMechanism": "Photosynthesis uses light energy; the chemosynthetic example uses energy released by inorganic chemical reactions.", "unitEvidence": "In the conceptual diagram, both producers receive CO\u2082, but only the alga receives light as its energy source.", "nonExampleOrConfusion": "Finding an organism in darkness does not establish chemosynthesis. It might consume organic matter produced elsewhere." }, "auditScores": {}, "auditTotal": 0 }, { "id": "a-family-pyramids", "label": "Ecological pyramids", "fixedFrayer": false, "meaning": "Ecological pyramids compare trophic levels using a specified quantity: organism numbers, standing biomass or energy production over time.", "mechanism": "Numbers count organisms; standing biomass measures living material at a time; energy production includes a time interval.", "contrast": "An inverted standing-biomass pyramid does not show energy creation. A stock of biomass is not a rate of energy production.", "retrievalPrompt": "Explain this concept in a new example, then identify a limitation or common confusion.", "wordAnalysis": { "treatment": "Numbers, biomass and energy modify pyramid by identifying what its width represents. The geometric name does not guarantee an upright shape.", "caution": "This is contextual word analysis, not a claim about historical word origins." }, "termIds": ["a-term-biomass", "a-term-ecological-pyramid"], "teachingPartIds": ["a-topic-ecological-pyramids-numbers-and-biomass"], "modelFrayer": { "contextualDefinition": "An ecological pyramid compares a named quantity across trophic levels within a defined system.", "essentialMechanism": "Numbers count organisms; standing biomass measures living material at a time; energy production includes a time interval.", "unitEvidence": "A small standing producer biomass can support a larger consumer biomass when producer turnover is rapid.", "nonExampleOrConfusion": "An inverted standing-biomass pyramid does not show energy creation. A stock of biomass is not a rate of energy production." }, "auditScores": {}, "auditTotal": 0 }, { "id": "a-family-gas-balance", "label": "Atmospheric gas balance", "fixedFrayer": false, "meaning": "Atmospheric gas amounts reflect multiple processes adding and removing gases. A net change depends on their balance over a specified period.", "mechanism": "Oxygenic photosynthesis releases oxygen, while aerobic respiration consumes it. Other reactions also influence oxygen amounts.", "contrast": "The presence of producers alone does not guarantee constant oxygen. A small model cannot reproduce every global process.", "retrievalPrompt": "Explain this concept in a new example, then identify a limitation or common confusion.", "wordAnalysis": { "treatment": "Balance means comparing gains and losses; it does not imply that the amounts must stay constant.", "caution": "This is contextual word analysis, not a claim about historical word origins." }, "termIds": ["a-term-oxygen", "a-term-photosynthesis", "a-term-cellular-respiration"], "teachingPartIds": ["a-topic-sulfur-and-phosphorus-cycles-atmosphere-and-life"], "modelFrayer": { "contextualDefinition": "Gas balance compares processes that add and remove a gas within a stated boundary and time period.", "essentialMechanism": "Oxygenic photosynthesis releases oxygen, while aerobic respiration consumes it. Other reactions also influence oxygen amounts.", "unitEvidence": "A closed model's oxygen can decline if consumption exceeds release, even when some plants are present.", "nonExampleOrConfusion": "The presence of producers alone does not guarantee constant oxygen. A small model cannot reproduce every global process." }, "auditScores": {}, "auditTotal": 0 }], "frayerContract": { "fixedFamilyIds": ["a-family-systems", "a-family-energy", "a-family-food-webs", "a-family-efficiency", "a-family-water", "a-family-matter-cycles"], "learnerChoiceCount": 2, "requiredForCompletion": false, "requiredForScores": false } } }, state, controls);
    mountTopicCollection(root, [{ "id": "a-family-systems", "title": "Systems and boundaries", "category": "Frayer", "routeId": "a-core-vocabulary", "focusId": "a-family-systems", "responses": [{ "id": "a-family-systems-definition", "label": "Definition" }, { "id": "a-family-systems-mechanism", "label": "Mechanism" }, { "id": "a-family-systems-evidence", "label": "Evidence" }, { "id": "a-family-systems-confusion", "label": "Confusion" }], "choices": [], "flags": [{ "id": "a-family-systems-collected", "label": "Collected" }] }, { "id": "a-family-energy", "title": "Energy transfer and conservation", "category": "Frayer", "routeId": "a-core-vocabulary", "focusId": "a-family-energy", "responses": [{ "id": "a-family-energy-definition", "label": "Definition" }, { "id": "a-family-energy-mechanism", "label": "Mechanism" }, { "id": "a-family-energy-evidence", "label": "Evidence" }, { "id": "a-family-energy-confusion", "label": "Confusion" }], "choices": [], "flags": [{ "id": "a-family-energy-collected", "label": "Collected" }] }, { "id": "a-family-food-webs", "title": "Food webs and trophic roles", "category": "Frayer", "routeId": "a-core-vocabulary", "focusId": "a-family-food-webs", "responses": [{ "id": "a-family-food-webs-definition", "label": "Definition" }, { "id": "a-family-food-webs-mechanism", "label": "Mechanism" }, { "id": "a-family-food-webs-evidence", "label": "Evidence" }, { "id": "a-family-food-webs-confusion", "label": "Confusion" }], "choices": [], "flags": [{ "id": "a-family-food-webs-collected", "label": "Collected" }] }, { "id": "a-family-efficiency", "title": "Trophic transfer efficiency", "category": "Frayer", "routeId": "a-core-vocabulary", "focusId": "a-family-efficiency", "responses": [{ "id": "a-family-efficiency-definition", "label": "Definition" }, { "id": "a-family-efficiency-mechanism", "label": "Mechanism" }, { "id": "a-family-efficiency-evidence", "label": "Evidence" }, { "id": "a-family-efficiency-confusion", "label": "Confusion" }], "choices": [], "flags": [{ "id": "a-family-efficiency-collected", "label": "Collected" }] }, { "id": "a-family-water", "title": "Water properties and cycling", "category": "Frayer", "routeId": "a-core-vocabulary", "focusId": "a-family-water", "responses": [{ "id": "a-family-water-definition", "label": "Definition" }, { "id": "a-family-water-mechanism", "label": "Mechanism" }, { "id": "a-family-water-evidence", "label": "Evidence" }, { "id": "a-family-water-confusion", "label": "Confusion" }], "choices": [], "flags": [{ "id": "a-family-water-collected", "label": "Collected" }] }, { "id": "a-family-matter-cycles", "title": "Matter stores and biogeochemical cycles", "category": "Frayer", "routeId": "a-core-vocabulary", "focusId": "a-family-matter-cycles", "responses": [{ "id": "a-family-matter-cycles-definition", "label": "Definition" }, { "id": "a-family-matter-cycles-mechanism", "label": "Mechanism" }, { "id": "a-family-matter-cycles-evidence", "label": "Evidence" }, { "id": "a-family-matter-cycles-confusion", "label": "Confusion" }], "choices": [], "flags": [{ "id": "a-family-matter-cycles-collected", "label": "Collected" }] }, { "id": "a-family-albedo", "title": "Albedo and feedback", "category": "Frayer", "routeId": "a-core-vocabulary", "focusId": "a-family-albedo", "responses": [{ "id": "a-family-albedo-definition", "label": "Definition" }, { "id": "a-family-albedo-mechanism", "label": "Mechanism" }, { "id": "a-family-albedo-evidence", "label": "Evidence" }, { "id": "a-family-albedo-confusion", "label": "Confusion" }], "choices": [], "flags": [{ "id": "a-family-albedo-collected", "label": "Collected" }] }, { "id": "a-family-producers", "title": "Producer carbon and energy sources", "category": "Frayer", "routeId": "a-core-vocabulary", "focusId": "a-family-producers", "responses": [{ "id": "a-family-producers-definition", "label": "Definition" }, { "id": "a-family-producers-mechanism", "label": "Mechanism" }, { "id": "a-family-producers-evidence", "label": "Evidence" }, { "id": "a-family-producers-confusion", "label": "Confusion" }], "choices": [], "flags": [{ "id": "a-family-producers-collected", "label": "Collected" }] }, { "id": "a-family-pyramids", "title": "Ecological pyramids", "category": "Frayer", "routeId": "a-core-vocabulary", "focusId": "a-family-pyramids", "responses": [{ "id": "a-family-pyramids-definition", "label": "Definition" }, { "id": "a-family-pyramids-mechanism", "label": "Mechanism" }, { "id": "a-family-pyramids-evidence", "label": "Evidence" }, { "id": "a-family-pyramids-confusion", "label": "Confusion" }], "choices": [], "flags": [{ "id": "a-family-pyramids-collected", "label": "Collected" }] }, { "id": "a-family-gas-balance", "title": "Atmospheric gas balance", "category": "Frayer", "routeId": "a-core-vocabulary", "focusId": "a-family-gas-balance", "responses": [{ "id": "a-family-gas-balance-definition", "label": "Definition" }, { "id": "a-family-gas-balance-mechanism", "label": "Mechanism" }, { "id": "a-family-gas-balance-evidence", "label": "Evidence" }, { "id": "a-family-gas-balance-confusion", "label": "Confusion" }], "choices": [], "flags": [{ "id": "a-family-gas-balance-collected", "label": "Collected" }] }, { "id": "a-topic-intro-to-ecology-retrieval", "title": "Without looking back, explain the difference between matter entering a system and energy entering it. Give one example of each.", "category": "Lesson response", "routeId": "a-topic-intro-to-ecology", "focusId": "a-topic-intro-to-ecology-retrieval", "responses": [{ "id": "a-topic-intro-to-ecology-retrieval", "label": "Your writing" }], "choices": [], "flags": [] }, { "id": "a-topic-intro-to-ecology-media", "title": "Compare the three figures. Name one boundary-dependent classification, one albedo result, and one shared carbon source. Include a limitation of one diagram.", "category": "Lesson response", "routeId": "a-topic-intro-to-ecology", "focusId": "a-topic-intro-to-ecology-media", "responses": [{ "id": "a-topic-intro-to-ecology-media", "label": "Your writing" }], "choices": [], "flags": [] }, { "id": "a-topic-intro-to-ecology-evidence", "title": "A pond contains photosynthetic algae and exchanges water with a stream. Explain why the pond is open, distinguish the algae's carbon and energy inputs, and explain what happens to matter and energy during aerobic respiration. State one limit of the models used in this lesson.", "category": "Lesson response", "routeId": "a-topic-intro-to-ecology", "focusId": "a-topic-intro-to-ecology-evidence", "responses": [{ "id": "a-topic-intro-to-ecology-evidence", "label": "Your writing" }], "choices": [], "flags": [] }, { "id": "a-topic-intro-to-ecology-guided-carbon", "title": "A microorganism grows in darkness. A student says this proves it makes food by chemosynthesis. Evaluate the claim and name two kinds of additional evidence that would distinguish chemoautotrophy from consuming pre-existing organic food.", "category": "Lesson response", "routeId": "a-topic-intro-to-ecology", "focusId": "a-topic-intro-to-ecology-guided-carbon", "responses": [{ "id": "a-topic-intro-to-ecology-guided-carbon", "label": "Your writing" }], "choices": [], "flags": [] }, { "id": "a-topic-intro-to-ecology-guided-albedo", "title": "An equal-area surface receives 800 J and reflects 240 J during one interval. Assume no transmission. Which pair gives its albedo and absorbed energy?", "category": "Practice", "routeId": "a-topic-intro-to-ecology", "focusId": "a-topic-intro-to-ecology-guided-albedo", "responses": [], "choices": [{ "id": "a-topic-intro-to-ecology-guided-albedo", "label": "Your selection", "options": { "0": "0.30 and 560 J", "1": "0.70 and 560 J", "2": "0.30 and 240 J", "3": "3.33 and 560 J" } }], "flags": [] }, { "id": "a-topic-intro-to-ecology-guided-albedo-attempted", "title": "Lesson activity status", "category": "Activity status", "routeId": "a-topic-intro-to-ecology", "focusId": "a-topic-intro-to-ecology-guided-albedo", "responses": [], "choices": [], "flags": [{ "id": "a-topic-intro-to-ecology-guided-albedo-attempted", "label": "Marked complete or attempted" }] }, { "id": "a-topic-intro-to-ecology-guided-carbon-attempted", "title": "Lesson activity status", "category": "Activity status", "routeId": "a-topic-intro-to-ecology", "focusId": "a-topic-intro-to-ecology-guided-carbon", "responses": [], "choices": [], "flags": [{ "id": "a-topic-intro-to-ecology-guided-carbon-attempted", "label": "Marked complete or attempted" }] }, { "id": "a-topic-intro-to-ecology-evidence-collected", "title": "Lesson activity status", "category": "Activity status", "routeId": "a-topic-intro-to-ecology", "focusId": "a-topic-intro-to-ecology-evidence", "responses": [], "choices": [], "flags": [{ "id": "a-topic-intro-to-ecology-evidence-collected", "label": "Marked complete or attempted" }] }, { "id": "a-topic-intro-to-ecology-media-attempted", "title": "Lesson activity status", "category": "Activity status", "routeId": "a-topic-intro-to-ecology", "focusId": "a-topic-intro-to-ecology-media", "responses": [], "choices": [], "flags": [{ "id": "a-topic-intro-to-ecology-media-attempted", "label": "Marked complete or attempted" }] }, { "id": "a-topic-intro-to-ecology-system-boundaries-advanced-complete", "title": "One pond, two boundaries, different balances", "category": "Advanced Learning", "routeId": "a-topic-intro-to-ecology", "focusId": "a-topic-intro-to-ecology-system-boundaries-advanced", "responses": [], "choices": [], "flags": [{ "id": "a-topic-intro-to-ecology-system-boundaries-advanced-complete", "label": "Marked complete or attempted" }] }, { "id": "a-topic-intro-to-ecology-energy-and-albedo-advanced-complete", "title": "Why a darker surface does not always absorb more energy", "category": "Advanced Learning", "routeId": "a-topic-intro-to-ecology", "focusId": "a-topic-intro-to-ecology-energy-and-albedo-advanced", "responses": [], "choices": [], "flags": [{ "id": "a-topic-intro-to-ecology-energy-and-albedo-advanced-complete", "label": "Marked complete or attempted" }] }, { "id": "a-topic-intro-to-ecology-producing-organic-matter-advanced-complete", "title": "Two producer pathways, one carbon-accounting question", "category": "Advanced Learning", "routeId": "a-topic-intro-to-ecology", "focusId": "a-topic-intro-to-ecology-producing-organic-matter-advanced", "responses": [], "choices": [], "flags": [{ "id": "a-topic-intro-to-ecology-producing-organic-matter-advanced-complete", "label": "Marked complete or attempted" }] }], state, schema);
    const visit = () => {
      const route = location.hash.slice(1) || state.route;
      if (schema.routes.includes(route === "overview" ? "a-overview" : route)) state.route = route === "overview" ? "a-overview" : route;
      if (route === "a-topic-intro-to-ecology" && !state.visited.includes(route)) state.visited.push(route);
      controls.saveDraft();
    };
    window.addEventListener("hashchange", visit);
    visit();
    root.querySelector("[data-pilot2-progress-count]").textContent = "Development preview";
    root.querySelector("[data-pilot2-progress-percent]").textContent = "";
  } catch (error) {
    status.textContent = "Existing proof data could not be restored. No writes enabled: " + String(error);
    root.querySelectorAll("textarea,input,button").forEach((n) => n.disabled = true);
  }
})();
