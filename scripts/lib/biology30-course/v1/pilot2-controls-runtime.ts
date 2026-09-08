import type { TopicState, TopicStateSchema } from "./pilot2-state.js";
import { decodeGraphDraft, type GraphWork } from "./pilot2-graph-work.js";

export type TopicControlSave = { saved: boolean; message: string };
/** The caller owns restoration, recovery and local/LMS save-channel reporting. */
export function mountTopicControls(root: HTMLElement, state: TopicState, schema: TopicStateSchema, onChange: (state: TopicState) => TopicControlSave, graphs: GraphWork[] = []) {
  // An attempt persists, but opening its textbook guide is session-only.
  const openTextbookGuides = new Set<string>();
  const all = <T extends Element>(selector: string) => Array.from(root.querySelectorAll<T>(selector));
  const byValue = <T extends HTMLElement>(attribute: string, value: string) => all<T>(`[${attribute}]`).find(node => node.getAttribute(attribute) === value);
  // Show the bounded capacity beside the reviewed substantial writing tasks.
  // Do not impose maxlength: an oversized pasted draft must remain recoverable.
  const showResponseCapacity = (field: HTMLTextAreaElement) => {
    const id = field.dataset.pilot2Response!;
    if (!/^[bcd]-(?:review-seminar-|investigation-.*-final-transfer-revision-v2$)/.test(id)) return;
    const limit = schema.responses[id].limit;
    let note = byValue<HTMLElement>('data-pilot2-response-capacity', id);
    if (!note) {
      note = root.querySelector<HTMLElement>(`[id="${id}-capacity"]`) ?? document.createElement('p');
      note.dataset.pilot2ResponseCapacity = id;
      note.id = id + '-capacity';
      if (!note.parentElement) field.insertAdjacentElement('afterend', note);
      field.setAttribute('aria-describedby', [...new Set([...(field.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean), note.id])].join(' '));
    }
    const oversized = field.value.length > limit;
    note.textContent = `${field.value.length} / ${limit} characters.` + (oversized ? ` Over the limit by ${field.value.length - limit}. This draft cannot be saved yet. Your writing remains here; shorten it or copy it before leaving.` : ' Include the working and explanation requested.');
    field.setAttribute('aria-invalid', String(oversized));
  };
  const setFlag = (id: string, value: boolean) => {
    if (!Object.hasOwn(schema.flags, id)) throw new Error(`Unknown control flag: ${id}`);
    state.flags = state.flags.filter(flag => flag !== id);
    if (value) state.flags.push(id);
  };
  const responseReady = (id: string) => {
    if (!state.responses[id]?.trim() || state.responses[id].length > (schema.responses[id]?.limit ?? -1)) return false;
    const graph = graphs.find(work => work.responseId === id), panel = byValue<HTMLElement>("data-pilot2-graph-work", id);
    if (panel?.dataset.pilot2GraphInvalid === "true") return false;
    if (graph) { const decoded = decodeGraphDraft(graph, state.responses[id]);
      if (decoded.kind === "graph") return Boolean(decoded.draft.e.trim()) || decoded.draft.g.some(plot => plot.a.some(axis => axis !== null) || plot.p.some(points => points.some(point => point !== null)));
    }
    return true;
  };
  const collectionReady = (button: HTMLButtonElement) => {
    const required = (button.dataset.pilot2Requires ?? "").split(" ").filter(Boolean), flag = button.dataset.pilot2RequiredFlag;
    return required.length > 0 && required.every(responseReady) && (!flag || state.flags.includes(flag));
  };
  const practiceReady = (id: string) => schema.choices[id] ? schema.choices[id].values.includes(state.choices[id]) : responseReady(id);
  function revealPractice(id: string, show: boolean) {
    const panel = byValue<HTMLElement>("data-pilot2-feedback", id), button = byValue<HTMLButtonElement>("data-pilot2-check", id);
    if (!panel || !button) return;
    panel.hidden = !show; button.setAttribute("aria-expanded", String(show));
    panel.querySelectorAll<HTMLElement>("[data-pilot2-option-feedback]").forEach(node => { node.hidden = node.dataset.pilot2OptionFeedback !== state.choices[id]; });
  }
  function refresh() {
    all<HTMLButtonElement>("[data-pilot2-check]").forEach(button => {
      const id = button.dataset.pilot2Check!; button.disabled = !practiceReady(id);
      const attempted = practiceReady(id) && state.flags.includes(`${id}-attempted`);
      revealPractice(id, attempted);
      const status = byValue<HTMLElement>("data-pilot2-check-status", id);
      if (status) status.textContent = attempted ? "Feedback is open for this attempt." : practiceReady(id) ? "Ready to check your attempt." : "Attempt the question to open the feedback.";
    });
    all<HTMLButtonElement>("[data-pilot2-compare]").forEach(button => { button.disabled = !responseReady(button.dataset.pilot2Compare!); });
    all<HTMLButtonElement>("[data-pilot2-collect]").forEach(button => { button.disabled = !collectionReady(button); });
    all<HTMLButtonElement>("[data-pilot2-group-compare]").forEach(button => { button.disabled = !collectionReady(button); });
    all<HTMLButtonElement>("[data-pilot2-textbook-attempt]").forEach(button => {
      const id = button.dataset.pilot2TextbookAttempt!, panel = root.querySelector<HTMLElement>(`#${CSS.escape(id + "-guide")}`);
      const attempted = state.flags.includes(`${id}-attempted`);
      const open = attempted && openTextbookGuides.has(id);
      if (panel) panel.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      const status = byValue<HTMLElement>("data-pilot2-textbook-status", id);
      if (status && !open) status.textContent = attempted ? "Previous attempt recorded; open the guide when ready." : "";
    });
  }
  function save() {
    state.updatedAt = new Date().toISOString();
    let result: TopicControlSave;
    try { result = onChange(state); } catch { result = { saved: false, message: "Saving failed. Your current writing remains visible; copy it before leaving." }; }
    all<HTMLElement>("[data-pilot2-save-status]").forEach(node => { node.textContent = result.message; });
    refresh(); root.dispatchEvent(new CustomEvent("pilot2-state-change", { detail: result })); return result;
  }
  function changedResponse(id: string) {
    const field = byValue<HTMLTextAreaElement>("data-pilot2-response", id);
    for (const flag of (field?.dataset.pilot2Invalidates ?? "").split(" ").filter(Boolean)) setFlag(flag, false);
    all<HTMLButtonElement>("[data-pilot2-group-compare]").filter(button => (button.dataset.pilot2Requires ?? "").split(" ").includes(id)).forEach(button => {
      button.setAttribute("aria-expanded", "false");
      const panel = root.querySelector<HTMLElement>(`#${CSS.escape(button.dataset.pilot2GroupCompare! + "-overall-guide")}`); if (panel) panel.hidden = true;
    });
    if (schema.flags[`${id}-attempted`]) setFlag(`${id}-attempted`, false);
    const compare = byValue<HTMLButtonElement>("data-pilot2-compare", id);
    if (compare) { compare.setAttribute("aria-expanded", "false"); const guide = root.querySelector<HTMLElement>(`#${CSS.escape(id + "-guide")}`); if (guide) guide.hidden = true; }
    all<HTMLButtonElement>("[data-pilot2-collect]").filter(button => (button.dataset.pilot2Requires ?? "").split(" ").includes(id)).forEach(button => {
      if(button.hasAttribute("data-pilot2-collect-toggle"))return;
      setFlag(button.dataset.pilot2Collect!, false);
      const status = byValue<HTMLElement>("data-pilot2-collection-status", button.dataset.pilot2Collect!); if (status) status.textContent = "Edited draft; save this activity again when ready.";
    });
  }
  const onInput = (event: Event) => {
    const field = event.target;
    if (!(field instanceof HTMLTextAreaElement) || !field.dataset.pilot2Response) return;
    const id = field.dataset.pilot2Response;
    if (!Object.hasOwn(schema.responses, id)) throw new Error(`Unknown response control: ${id}`);
    state.responses[id] = field.value; showResponseCapacity(field); changedResponse(id); save();
  };
  const onChoice = (event: Event) => {
    const field = event.target;
    if (field instanceof HTMLInputElement && field.dataset.pilot2OptionalFlag) {
      const id = field.dataset.pilot2OptionalFlag;
      if (!id.endsWith("-advanced-complete")) throw new Error("Only optional Advanced markers use this control");
      setFlag(id, field.checked); save(); return;
    }
    if (!(field instanceof HTMLInputElement) || !field.dataset.pilot2Choice || !field.checked) return;
    const id = field.dataset.pilot2Choice;
    if (!schema.choices[id]?.values.includes(field.value)) throw new Error(`Unknown choice control: ${id}`);
    state.choices[id] = field.value; setFlag(`${id}-attempted`, false); save();
  };
  const onClick = (event: Event) => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("button") : null;
    if (!button || !root.contains(button) || button.disabled) return;
    const check = button.dataset.pilot2Check, compare = button.dataset.pilot2Compare, collect = button.dataset.pilot2Collect, textbook = button.dataset.pilot2TextbookAttempt, group = button.dataset.pilot2GroupCompare;
    if (group && collectionReady(button)) {
      const panel = root.querySelector<HTMLElement>(`#${CSS.escape(group + "-overall-guide")}`); if (panel) { panel.hidden = false; button.setAttribute("aria-expanded", "true"); }
    } else if (textbook) {
      openTextbookGuides.add(textbook);
      setFlag(`${textbook}-attempted`, true); const result = save();
      const status = byValue<HTMLElement>("data-pilot2-textbook-status", textbook);
      if (status) status.textContent = result.saved ? "Attempt saved; comparison guide is open." : "Comparison guide is open; saving was not confirmed.";
    } else if (check && practiceReady(check)) {
      setFlag(`${check}-attempted`, true); const result = save(); revealPractice(check, true);
      const status = byValue<HTMLElement>("data-pilot2-check-status", check);
      if (status) { status.classList.toggle("sr-only", result.saved); status.textContent = result.saved ? "Attempt saved. Feedback is open." : "Feedback is open. Saving this attempt was not confirmed."; }
    } else if (compare && responseReady(compare)) {
      const panel = root.querySelector<HTMLElement>(`#${CSS.escape(compare + "-guide")}`); if (panel) { panel.hidden = false; button.setAttribute("aria-expanded", "true"); }
    } else if (collect && collectionReady(button)) {
      setFlag(collect, button.hasAttribute("data-pilot2-collect-toggle")?!state.flags.includes(collect):true); const result = save();
      const status = byValue<HTMLElement>("data-pilot2-collection-status", collect);
      if (status) status.textContent = result.saved ? "Saved to Process Collection." : "Your draft remains visible. Saving was not confirmed.";
    }
  };
  all<HTMLTextAreaElement>("[data-pilot2-response]").forEach(field => {
    const id = field.dataset.pilot2Response!;
    if (!Object.hasOwn(schema.responses, id)) throw new Error(`Unknown response control: ${id}`);
    field.value = state.responses[id] ?? "";
    showResponseCapacity(field);
  });
  all<HTMLInputElement>("[data-pilot2-choice]").forEach(field => { field.checked = state.choices[field.dataset.pilot2Choice!] === field.value; });
  all<HTMLInputElement>("[data-pilot2-optional-flag]").forEach(field => { field.checked = state.flags.includes(field.dataset.pilot2OptionalFlag!); });
  refresh();
  root.addEventListener("input", onInput); root.addEventListener("change", onChoice); root.addEventListener("click", onClick);
  return { refresh, saveDraft: save, responseChanged(id: string) { if (!schema.responses[id]) throw new Error("Unknown response update"); changedResponse(id); return save(); }, dispose() { root.removeEventListener("input", onInput); root.removeEventListener("change", onChoice); root.removeEventListener("click", onClick); } };
}
