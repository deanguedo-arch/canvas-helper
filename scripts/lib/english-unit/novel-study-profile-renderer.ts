import { safeId } from "./source.js";
import type {
  EnglishActivityField,
  EnglishActivityQuestionSet,
  EnglishCriticalEssayProfile,
  EnglishMaterialHook,
  EnglishNovelTrack,
  EnglishRenderedActivityNavGroup,
  EnglishWritingTool
} from "./activity-profile-renderers.js";
import type { EnglishNovelStudyActivityProfile } from "./types.js";

/**
 * Structural input used by the donor-parity Novel Study renderer. It deliberately
 * matches EnglishNovelStudyProfile without importing the shared renderer at
 * runtime, so the factory can adopt this module without creating a module cycle.
 */
export type EnglishNovelStudyRendererProfile = {
  kind: "novel-study";
  namespace: string;
  courseCode: string;
  unitTitle: string;
  evidenceBankRoute?: string;
  recipeProfile?: EnglishNovelStudyActivityProfile;
  tracks: EnglishNovelTrack[];
  materials?: EnglishMaterialHook[];
  essay: EnglishCriticalEssayProfile;
  readingGuideFields: EnglishActivityField[];
  majorWorksFields: EnglishActivityField[];
  questionSets: EnglishActivityQuestionSet[];
  writingTools: EnglishWritingTool[];
};

export type EnglishNovelStudyRenderedPage = {
  id: string;
  label: string;
  icon: string;
  html: string;
};

export type EnglishNovelStudyRenderedModule = {
  kind: "novel-study";
  pages: EnglishNovelStudyRenderedPage[];
  navGroups: EnglishRenderedActivityNavGroup[];
  resourceLinks: EnglishMaterialHook[];
  css: string;
  runtime: string;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function responseId(profile: EnglishNovelStudyRendererProfile, ...parts: string[]) {
  return [safeId(profile.namespace), ...parts.map((part) => safeId(part))].join(":");
}

function optionValue(option: string | { value: string; label: string }) {
  return typeof option === "string" ? option : option.value;
}

function optionLabel(option: string | { value: string; label: string }) {
  return typeof option === "string" ? option : option.label;
}

function renderField(input: {
  field: EnglishActivityField;
  id: string;
  draftKey?: string;
  className?: string;
}) {
  const { field } = input;
  const controlId = `novel-${safeId(input.id)}`;
  const placeholder = escapeHtml(field.placeholder ?? field.prompt ?? "Develop your response with precise textual evidence.");
  const draftAttribute = input.draftKey ? ` data-repeatable-draft="${escapeHtml(input.draftKey)}"` : "";
  const common = `id="${controlId}" data-response-id="${escapeHtml(input.id)}" data-novel-field="${escapeHtml(field.id)}"${draftAttribute}${field.evidenceRole ? ` data-evidence-role="${escapeHtml(field.evidenceRole)}"` : ""}`;
  let control = "";
  if (field.type === "select") {
    control = `<select ${common}>
      <option value="">Choose...</option>
      ${(field.options ?? []).map((option) => `<option value="${escapeHtml(optionValue(option))}">${escapeHtml(optionLabel(option))}</option>`).join("")}
    </select>`;
  } else if (field.type === "checkbox") {
    control = `<input ${common} type="checkbox">`;
  } else if (field.type === "text") {
    control = `<input ${common} type="text" placeholder="${placeholder}">`;
  } else {
    control = `<textarea ${common} rows="${field.rows ?? 5}" placeholder="${placeholder}"></textarea>`;
  }
  const hint = field.hint
    ? `<p class="novel-field-hint" data-novel-hint data-writing-hint hidden><strong>Hint:</strong> ${escapeHtml(field.hint)}</p>`
    : "";
  return `<label class="novel-field ${escapeHtml(input.className ?? "")}" for="${controlId}">
    <span>${escapeHtml(field.label)}</span>
    ${field.prompt ? `<small>${escapeHtml(field.prompt)}</small>` : ""}
    ${control}
    ${field.type === "textarea" || !field.type ? `<span class="novel-word-count" data-word-count-for="${controlId}">0 words</span>` : ""}
    ${hint}
  </label>`;
}

function renderTrackSelector(profile: EnglishNovelStudyRendererProfile, pageId: string) {
  return `<label class="novel-track-control">
    <span>Choose a novel track</span>
    <select data-novel-track-select data-response-id="${escapeHtml(responseId(profile, "selection", pageId, "track"))}">
      ${profile.tracks.map((track) => `<option value="${escapeHtml(safeId(track.id))}">${escapeHtml(track.title)}${track.author ? ` - ${escapeHtml(track.author)}` : ""}</option>`).join("")}
    </select>
  </label>`;
}

function renderToolbar(options: { saveLabel?: string; saveAttributes?: string; evidenceRoute?: string }) {
  return `<div class="novel-toolbar">
    <button type="button" class="novel-button" data-novel-toggle-hints data-worksheet-toggle-hints aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> Show Hints</button>
    <button type="button" class="novel-button" data-novel-print data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
    ${options.saveLabel ? `<button type="button" class="novel-button novel-button--primary evidence-bank-save-action" ${options.saveAttributes ?? ""}>${escapeHtml(options.saveLabel)}</button>` : ""}
    ${options.evidenceRoute ? `<a class="novel-button novel-button--quiet" href="#${escapeHtml(options.evidenceRoute)}">Open Evidence Bank</a>` : ""}
    <span class="novel-save-status" data-novel-save-status aria-live="polite"></span>
  </div>`;
}

function renderProgress(label: string) {
  return `<div class="novel-progress" data-novel-progress>
    <div><span>${escapeHtml(label)}</span><strong data-novel-progress-label>0 of 0 complete</strong></div>
    <div class="novel-progress-track"><span data-novel-progress-fill></span></div>
  </div>`;
}

const NOVEL_ESSAY_STAGE_GUIDANCE: Record<string, { example: string; tip: string; steps: string[] }> = {
  "topic-thesis": {
    example: "A controlling thesis names the text and creator, identifies the character or conflict that develops the idea, and states what the novel suggests about the assigned topic.",
    tip: "Build one arguable interpretation. Avoid turning the thesis into plot summary or a list of literary devices.",
    steps: [
      "Restate the assigned topic in your own words.",
      "Name the novel, author, and character or conflict you will use.",
      "Decide what development will structure the beginning, middle, and end body paragraphs.",
      "State what the author suggests about the topic."
    ]
  },
  introduction: {
    example: "Move from a concise observation about the larger human issue, to the novel and its central conflict, and then to the thesis that will control the response.",
    tip: "Keep the context purposeful. Introduce only the details the reader needs before the thesis.",
    steps: [
      "Open with the larger human issue at the centre of the topic.",
      "Introduce the novel, author, character focus, and relevant conflict.",
      "Connect that conflict to the assigned topic.",
      "End with the revised thesis."
    ]
  },
  "body-one": {
    example: "Use a precise opening chapter, quotation, action, or narrative choice to establish the character's starting belief and the pressure that will develop.",
    tip: "Establish the starting point and answer the topic; do not simply retell the opening chapters.",
    steps: [
      "State the focused beginning claim.",
      "Record one precise opening passage or moment.",
      "Explain the author's choice and its effect.",
      "Connect the evidence to the thesis and transition toward the middle."
    ]
  },
  "body-two": {
    example: "Choose a middle passage where an earlier belief stops working. Explain the pressure, the author's construction, and what begins to change.",
    tip: "Analyze the hinge of the argument: what forces the character to reconsider, resist, or change.",
    steps: [
      "State the focused middle claim.",
      "Identify the crisis, turning point, or growing pressure.",
      "Use a precise chapter, page, quotation, or narrative choice as evidence.",
      "Explain how the moment advances or complicates the thesis."
    ]
  },
  "body-three": {
    example: "Use a final passage, action, image, or narrative choice to show what has changed, what remains unresolved, and what the ending asks the reader to understand.",
    tip: "Do more than name the resolution. Explain why the ending matters to the author's larger idea.",
    steps: [
      "State the focused ending claim.",
      "Record the strongest final passage or moment.",
      "Compare the ending with the character's starting point.",
      "Explain how the ending proves or complicates the thesis."
    ]
  },
  "conclusion-revision": {
    example: "Return to the final change or unresolved tension, connect it to the larger human issue, and leave the reader with the significance of the author's idea.",
    tip: "Complete the interpretation instead of repeating the thesis. Keep revision notes separate from the conclusion itself.",
    steps: [
      "Synthesize the novel's development and final insight.",
      "Explain the idea's broader human significance.",
      "Check paragraph order, transitions, and evidence balance.",
      "Record the revisions still needed for clarity and correctness."
    ]
  }
};

function renderEssayLessonNavigation(input: {
  previous?: { id: string; label: string };
  next?: { id: string; label: string };
  evidenceRoute?: string;
}) {
  const evidenceRoute = input.evidenceRoute ?? "evidence-bank";
  return `<nav class="lesson-bottom-bar novel-essay-lesson-navigation" aria-label="Critical Essay lesson navigation">
    ${input.previous ? `<a class="lesson-jump" href="#${escapeHtml(input.previous.id)}" data-page-target="${escapeHtml(input.previous.id)}">Previous: ${escapeHtml(input.previous.label)}</a>` : `<a class="lesson-jump" href="#lessons" data-page-target="lessons">Course Lessons</a>`}
    ${input.next ? `<a class="lesson-jump primary" href="#${escapeHtml(input.next.id)}" data-page-target="${escapeHtml(input.next.id)}">Next: ${escapeHtml(input.next.label)}</a>` : `<a class="lesson-jump" href="#${escapeHtml(evidenceRoute)}" data-page-target="${escapeHtml(evidenceRoute)}">Open Evidence Bank</a>`}
  </nav>`;
}

function renderCriticalEssayGuide(
  profile: EnglishNovelStudyRendererProfile,
  routeId: string,
  firstStage: { id: string; label: string }
) {
  return `<section id="${escapeHtml(routeId)}" class="course-page english-activity-page novel-profile-page novel-critical-essay-page novel-critical-essay-guide" hidden data-novel-module="critical-essay-guide">
    <header class="novel-page-header">
      <p>${escapeHtml(profile.courseCode)} | Critical Analytical Writing</p>
      <h2>Critical Analytical Essay Guide</h2>
      <p>Use this guide to understand the complete response, then move through each writing lesson to build a separate essay for the novel assigned in this course.</p>
    </header>
    ${renderTrackSelector(profile, "critical-essay-guide")}
    <div hidden aria-hidden="true">${profile.tracks.map((track) => `<input type="hidden" data-response-id="${escapeHtml(responseId(profile, "critical-essay", safeId(track.id), "selected-stage"))}">`).join("")}</div>
    <section class="unit-outcomes novel-critical-outcomes" aria-label="Critical essay success criteria">
      <h3>I can...</h3>
      <ul><li>I can read and respond critically to a novel as a literary text.</li><li>I can develop and support an interpretation with precise textual evidence.</li><li>I can organize my ideas into a controlled critical analytical essay.</li><li>I can use precise diction, controlled sentences, and a formal voice.</li><li>I can revise for correctness, clarity, and purpose.</li></ul>
    </section>
    <section class="novel-critical-panel">
      <h3>Alberta assignment focus</h3>
      <p>A critical analytical response asks you to choose relevant evidence, develop an interpretation, and connect that interpretation to the assigned topic. Novel evidence can include chapter and page references, quotations, character actions, narrative perspective, symbols, structure, and recurring images.</p>
      <div class="novel-critical-category-grid">
        <article><strong>Thought and Understanding</strong><p>Quality of interpretation, insight, and connection to the assigned topic.</p></article>
        <article><strong>Supporting Evidence</strong><p>Selection and explanation of textual details that prove the interpretation.</p></article>
        <article><strong>Form and Structure</strong><p>Essay organization, paragraph control, transitions, and unity.</p></article>
        <article><strong>Matters of Choice</strong><p>Diction, syntax, voice, tone, and rhetorical control.</p></article>
        <article><strong>Matters of Correctness</strong><p>Grammar, usage, punctuation, spelling, and sentence control.</p></article>
      </div>
    </section>
    ${profile.tracks.map((track, index) => `<section class="novel-selected-track-context" data-novel-track-panel="${escapeHtml(safeId(track.id))}" data-novel-work-title="${escapeHtml(track.title)}" ${index ? "hidden" : ""}><h3>${escapeHtml(track.title)}</h3><p>${track.author ? `by ${escapeHtml(track.author)}. ` : ""}All writing lessons and the Preview remain isolated to this novel track.</p></section>`).join("")}
    <section class="novel-critical-panel novel-critical-lesson-map" aria-labelledby="novel-critical-path-title">
      <h3 id="novel-critical-path-title">Your writing path</h3>
      <p>Complete the six lessons in order. The final Preview combines the selected novel's saved writing exactly as entered so you can read, print, and deliberately save the complete plan.</p>
      <ol>${profile.essay.stages.map((stage) => `<li>${escapeHtml(stage.title)}</li>`).join("")}<li>Critical Essay Preview</li></ol>
    </section>
    ${renderEssayLessonNavigation({ next: firstStage, evidenceRoute: profile.evidenceBankRoute })}
  </section>`;
}

function renderCriticalEssayStage(input: {
  profile: EnglishNovelStudyRendererProfile;
  routeId: string;
  stage: EnglishNovelStudyRendererProfile["essay"]["stages"][number];
  previous: { id: string; label: string };
  next: { id: string; label: string };
}) {
  const { profile, routeId, stage } = input;
  const stageId = safeId(stage.id);
  const guidance = NOVEL_ESSAY_STAGE_GUIDANCE[stageId];
  return `<section id="${escapeHtml(routeId)}" class="course-page english-activity-page novel-profile-page novel-critical-essay-page novel-critical-essay-stage-page" hidden data-novel-module="critical-essay-stage">
    <header class="novel-page-header"><p>${escapeHtml(profile.courseCode)} | Critical Analytical Writing</p><h2>${escapeHtml(stage.title)}</h2><p>${escapeHtml(stage.focus)}</p></header>
    ${renderTrackSelector(profile, routeId)}
    ${profile.tracks.map((track, trackIndex) => {
      const trackId = safeId(track.id);
      const prefix = responseId(profile, "critical-essay", trackId, stageId);
      return `<article class="novel-document novel-essay-stage" data-novel-critical-essay-stage data-novel-track-panel="${escapeHtml(trackId)}" data-novel-essay-track="${escapeHtml(trackId)}" data-novel-work-title="${escapeHtml(track.title)}" data-novel-print-scope data-collection-scope data-evidence-type="critical-essay-stage" data-evidence-title="${escapeHtml(`${track.title} - ${stage.title}`)}" data-evidence-collection-id="${escapeHtml(`${prefix}:collection`)}" ${trackIndex ? "hidden" : ""}>
        ${renderToolbar({ saveLabel: "Save Stage to Evidence Bank", saveAttributes: "data-save-profile-collection", evidenceRoute: profile.evidenceBankRoute })}
        <header class="novel-document-header novel-activity-summary novel-stage-summary novel-dark-worksheet-header"><div><p>${escapeHtml(profile.courseCode)} | Critical Analytical Writing</p><h3>${escapeHtml(track.title)}</h3><span>${track.author ? `${escapeHtml(track.author)} | ` : ""}${escapeHtml(stage.title)}</span></div>${renderProgress("Stage progress")}</header>
        ${(stage.checkpoints ?? []).length ? `<section class="unit-outcomes novel-critical-outcomes" aria-label="Success criteria"><h3>I can...</h3><ul>${(stage.checkpoints ?? []).map((checkpoint) => `<li>${escapeHtml(checkpoint)}</li>`).join("")}</ul></section>` : ""}
        <section class="novel-critical-panel novel-critical-lesson-panel"><h3>Lesson</h3><p>${escapeHtml(stage.instruction ?? stage.focus)}</p><div class="novel-critical-model"><strong>${escapeHtml(stage.modelLabel ?? "Model move")}</strong><p>${escapeHtml(stage.model ?? guidance?.example ?? stage.focus)}</p></div></section>
        <div class="novel-critical-support-grid"><section class="novel-critical-panel"><h3>Example</h3><p>${escapeHtml(guidance?.example ?? stage.focus)}</p></section><section class="novel-critical-panel novel-critical-tip"><h3>Writing tip</h3><p>${escapeHtml(guidance?.tip ?? "Keep every choice connected to the assigned topic and your controlling interpretation.")}</p></section></div>
        ${guidance?.steps.length ? `<section class="novel-critical-panel"><h3>How to apply it</h3><ol class="novel-critical-step-list">${guidance.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol></section>` : ""}
        <section class="novel-critical-panel novel-critical-planner"><h3>Build ${escapeHtml(stage.title)}</h3><p>Draft the actual essay section taught above. Your work saves automatically and stays separate for ${escapeHtml(track.title)}.</p><div class="novel-field-grid">${stage.fields.map((field) => renderField({ field, id: `${prefix}:${safeId(field.id)}` })).join("")}</div></section>
      </article>`;
    }).join("")}
    ${renderEssayLessonNavigation({ previous: input.previous, next: input.next, evidenceRoute: profile.evidenceBankRoute })}
  </section>`;
}

function renderCriticalEssayPreview(
  profile: EnglishNovelStudyRendererProfile,
  routeId: string,
  previous: { id: string; label: string }
) {
  return `<section id="${escapeHtml(routeId)}" class="course-page english-activity-page novel-profile-page novel-critical-essay-page novel-critical-essay-preview-page" hidden data-novel-module="critical-essay-preview" data-novel-essay-preview>
    <header class="novel-page-header"><p>${escapeHtml(profile.courseCode)} | Critical Analytical Writing</p><h2>Critical Essay Preview</h2><p>Read the complete plan built from the selected novel's writing lessons. This Preview combines saved boxes exactly as written; it does not invent transitions or rewrite learner ideas.</p></header>
    ${renderTrackSelector(profile, routeId)}
    ${profile.tracks.map((track, trackIndex) => {
      const trackId = safeId(track.id);
      const collectionId = responseId(profile, "critical-essay", trackId, "full-plan");
      const foundationId = `novel-preview-foundation-${trackId}`;
      const documentId = `novel-preview-document-${trackId}`;
      return `<article class="novel-document novel-essay-preview" data-novel-track-panel="${escapeHtml(trackId)}" data-novel-essay-preview-panel data-novel-essay-preview-track="${escapeHtml(trackId)}" data-novel-work-title="${escapeHtml(track.title)}" data-novel-work-author="${escapeHtml(track.author ?? "")}" data-novel-print-scope data-evidence-collection-id="${escapeHtml(collectionId)}" ${trackIndex ? "hidden" : ""}>
        <div class="novel-toolbar novel-essay-preview-toolbar"><span class="novel-save-status" data-novel-essay-preview-status aria-live="polite">Your essay preview will appear here as you complete the Critical Essay writing lessons.</span><div class="novel-preview-actions"><button type="button" class="novel-button" data-novel-print data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button><button type="button" class="novel-button novel-button--primary evidence-bank-save-action" data-novel-save-essay-preview><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save Full Essay Plan</button></div></div>
        <section class="novel-essay-preview-foundation" aria-labelledby="${escapeHtml(foundationId)}"><div><p class="novel-eyebrow">Planning foundation</p><h3 id="${escapeHtml(foundationId)}">${escapeHtml(track.title)}</h3>${track.author ? `<p>by ${escapeHtml(track.author)}</p>` : ""}</div><dl><div><dt>Assigned topic</dt><dd data-novel-essay-preview-foundation="topic">Add the assigned topic in Topic and Thesis.</dd></div><div><dt>Interpretation</dt><dd data-novel-essay-preview-foundation="interpretation">Add the novel's central interpretation in Topic and Thesis.</dd></div><div><dt>Working thesis</dt><dd data-novel-essay-preview-foundation="thesis">Add a working thesis in Topic and Thesis.</dd></div></dl></section>
        <article class="novel-essay-preview-document" aria-labelledby="${escapeHtml(documentId)}"><header><p>${escapeHtml(profile.courseCode)} | Critical Analytical Writing</p><h3 id="${escapeHtml(documentId)}">Essay Draft</h3><span data-novel-essay-preview-word-count>0 words</span></header>${[
          ["introduction", "Introduction", "Complete the Introduction lesson to build this paragraph."],
          ["body-one", "Body Paragraph 1 - Beginning", "Complete Body Paragraph 1 - Beginning to build this paragraph."],
          ["body-two", "Body Paragraph 2 - Middle", "Complete Body Paragraph 2 - Middle to build this paragraph."],
          ["body-three", "Body Paragraph 3 - End", "Complete Body Paragraph 3 - End to build this paragraph."],
          ["conclusion", "Conclusion", "Complete Conclusion and Revision to build this paragraph."]
        ].map(([id, title, empty]) => `<section><h4>${escapeHtml(title)}</h4><div data-novel-essay-preview-section="${escapeHtml(id)}" data-novel-essay-preview-empty="${escapeHtml(empty)}"><p class="novel-essay-preview-empty">${escapeHtml(empty)}</p></div></section>`).join("")}</article>
        <section class="novel-critical-panel novel-essay-revision-notes"><h3>Revision Notes</h3><p data-novel-essay-preview-revision>Complete the Revision plan field in Conclusion and Revision to record the changes still needed.</p></section>
        <p class="novel-essay-preview-save-status" data-novel-essay-preview-save-status aria-live="polite"></p>
      </article>`;
    }).join("")}
    ${renderEssayLessonNavigation({ previous, evidenceRoute: profile.evidenceBankRoute })}
  </section>`;
}

function readingFilterOptions(profile: EnglishNovelStudyRendererProfile) {
  const evidenceType = profile.readingGuideFields.find((field) => /evidence.?type|type/i.test(field.id));
  return (evidenceType?.options ?? []).map((option) => `<option value="${escapeHtml(optionValue(option))}">${escapeHtml(optionLabel(option))}</option>`).join("");
}

function renderReadingGuide(profile: EnglishNovelStudyRendererProfile) {
  return `<section id="reading-guide" class="course-page english-activity-page novel-profile-page" hidden data-novel-module="reading-guide">
    <header class="novel-page-header">
      <p>${escapeHtml(profile.courseCode)} | Reading Guide</p>
      <h2>Novel Reading Guide</h2>
      <p>Capture multiple passages, revise your notes, and select the strongest evidence before drafting.</p>
    </header>
    ${renderTrackSelector(profile, "reading-guide")}
    ${profile.tracks.map((track) => {
      const trackId = safeId(track.id);
      const storeId = responseId(profile, "reading-guide", trackId, "passage-cards");
      return `<article class="novel-notebook" data-novel-track-panel="${escapeHtml(trackId)}" data-novel-work-title="${escapeHtml(track.title)}" data-repeatable-root="reading-passage" data-repeatable-title="${escapeHtml(`${track.title} Reading Passage`)}" data-repeatable-contribution-prefix="${escapeHtml(responseId(profile, "reading-guide", trackId, "passage"))}">
        <textarea hidden data-repeatable-store data-response-id="${escapeHtml(storeId)}"></textarea>
        <header class="novel-document-header novel-activity-summary novel-dark-worksheet-header"><div><p>Running evidence notebook</p><h3>${escapeHtml(track.title)} Reading Guide</h3></div><strong data-repeatable-count>0 passages</strong></header>
        <section class="novel-entry-editor" data-repeatable-editor>
          <div class="novel-section-heading"><div><p>Passage card</p><h4>Add or edit reading evidence</h4></div><button class="novel-button novel-button--quiet" type="button" data-repeatable-clear>Clear draft</button></div>
          <div class="novel-field-grid">${profile.readingGuideFields.map((field) => renderField({ field, id: responseId(profile, "reading-guide", trackId, "draft", field.id), draftKey: field.id })).join("")}</div>
          <div class="novel-inline-actions"><button class="novel-button novel-button--primary" type="button" data-repeatable-save>Save Passage Card</button><span data-repeatable-status aria-live="polite"></span></div>
        </section>
        <section class="novel-saved-section">
          <div class="novel-section-heading"><div><p>Passage bank</p><h4>Saved passage cards</h4></div><label><span>Filter</span><select data-repeatable-filter><option value="">All evidence</option>${readingFilterOptions(profile)}</select></label></div>
          <div class="novel-card-list" data-repeatable-list></div>
          <p class="novel-empty-state" data-repeatable-empty>No passage cards saved yet.</p>
        </section>
        <section class="novel-synthesis" data-collection-scope data-evidence-type="reading-guide-synthesis" data-evidence-title="${escapeHtml(`${track.title} Reading Guide Synthesis`)}" data-evidence-collection-id="${escapeHtml(responseId(profile, "reading-guide", trackId, "synthesis"))}">
          <div class="novel-section-heading"><div><p>Synthesis</p><h4>Turn the passage bank into an interpretation</h4></div><span data-strongest-summary>No strongest passage selected.</span></div>
          <div class="novel-field-grid">
            ${renderField({ field: { id: "pattern", label: "Emerging pattern", hint: "Connect at least two saved passages before naming the pattern." }, id: responseId(profile, "reading-guide", trackId, "synthesis", "pattern") })}
            ${renderField({ field: { id: "strongest", label: "Why is the selected passage strongest?", hint: "Explain its specificity, relevance, and analytical potential." }, id: responseId(profile, "reading-guide", trackId, "synthesis", "strongest") })}
            ${renderField({ field: { id: "possible-use", label: "Possible analytical use", hint: "State the claim or question this evidence could help answer." }, id: responseId(profile, "reading-guide", trackId, "synthesis", "possible-use"), className: "novel-field--wide" })}
          </div>
          ${renderToolbar({ saveLabel: "Save Reading Synthesis to Evidence Bank", saveAttributes: "data-save-profile-collection", evidenceRoute: profile.evidenceBankRoute })}
        </section>
      </article>`;
    }).join("")}
  </section>`;
}

function renderMajorWorks(profile: EnglishNovelStudyRendererProfile) {
  return `<section id="major-works-data" class="course-page english-activity-page novel-profile-page" hidden data-novel-module="major-works">
    <header class="novel-page-header"><p>${escapeHtml(profile.courseCode)} | Major Works Data Sheet</p><h2>Major Works Data Sheet</h2><p>Build one durable reference sheet for the selected novel. Saving again updates the same Evidence Bank collection.</p></header>
    ${renderTrackSelector(profile, "major-works")}
    ${profile.tracks.map((track) => {
      const trackId = safeId(track.id);
      return `<article class="novel-document" data-novel-track-panel="${escapeHtml(trackId)}" data-novel-work-title="${escapeHtml(track.title)}" data-collection-scope data-evidence-type="major-works-data" data-evidence-title="${escapeHtml(`${track.title} Major Works Data Sheet`)}" data-evidence-collection-id="${escapeHtml(responseId(profile, "major-works", trackId, "collection"))}">
        <header class="novel-document-header novel-activity-summary novel-dark-worksheet-header"><div><p>Novel reference</p><h3>${escapeHtml(track.title)}</h3>${track.author ? `<span>${escapeHtml(track.author)}</span>` : ""}</div>${renderProgress("Data sheet progress")}</header>
        <div class="novel-field-grid novel-major-works-fields">${profile.majorWorksFields.map((field) => renderField({ field, id: responseId(profile, "major-works", trackId, field.id), className: /plot|quotation|character|theme|symbol/i.test(field.id) ? "novel-field--wide" : "" })).join("")}</div>
        ${renderToolbar({ saveLabel: "Save Major Works Data Sheet to Evidence Bank", saveAttributes: "data-save-profile-collection", evidenceRoute: profile.evidenceBankRoute })}
      </article>`;
    }).join("")}
  </section>`;
}

function learnerQuestionCopy(value: string | undefined, fallback: string) {
  const cleaned = (value ?? fallback)
    .replace(/^Profile-supplied enrichment\s*\|?\s*/i, "")
    .replace(/^These prompts are profile-supplied enrichment\.\s*/i, "")
    .replace(/^Teacher-supplied questions\s*\|?\s*/i, "Assigned reading questions")
    .trim();
  return cleaned || fallback;
}

function renderQuestionSet(profile: EnglishNovelStudyRendererProfile, track: EnglishNovelTrack, set: EnglishActivityQuestionSet, index: number) {
  const trackId = safeId(track.id);
  const setId = safeId(set.id);
  return `<section class="novel-question-phase" data-novel-phase-panel="${escapeHtml(setId)}" ${index ? "hidden" : ""} data-collection-scope data-evidence-type="novel-question-collection" data-evidence-title="${escapeHtml(`${track.title} - ${set.title}`)}" data-evidence-collection-id="${escapeHtml(responseId(profile, "novel-questions", trackId, setId, "collection"))}">
    <header class="novel-document-header novel-activity-summary novel-dark-worksheet-header"><div><p>${escapeHtml(learnerQuestionCopy(set.subtitle, "Guided reading phase"))}</p><h4>${escapeHtml(set.title)}</h4>${set.intro ? `<span>${escapeHtml(learnerQuestionCopy(set.intro, "Use precise evidence from your assigned novel."))}</span>` : ""}</div>${renderProgress("Question progress")}</header>
    <div class="novel-question-list">${set.questions.map((question, questionIndex) => `<article class="novel-question">
      <div class="novel-question-number">${questionIndex + 1}</div>
      <div><p>${escapeHtml(question.label)}</p>${question.hint ? `<aside data-novel-hint data-question-hint hidden><strong>Hint:</strong> ${escapeHtml(question.hint)}</aside>` : ""}${renderField({ field: { ...question, label: "Your response", placeholder: question.placeholder ?? "Develop your response with specific evidence." }, id: responseId(profile, "novel-questions", trackId, setId, question.id) })}</div>
    </article>`).join("")}</div>
    ${renderToolbar({ saveLabel: "Save Phase Answers to Evidence Bank", saveAttributes: "data-save-profile-collection", evidenceRoute: profile.evidenceBankRoute })}
  </section>`;
}

function renderNovelQuestions(profile: EnglishNovelStudyRendererProfile) {
  return `<section id="novel-study-questions" class="course-page english-activity-page novel-profile-page" hidden data-novel-module="novel-questions">
    <header class="novel-page-header"><p>${escapeHtml(profile.courseCode)} | Novel Study Questions</p><h2>Novel Study Questions</h2><p>Complete the configured opening, middle, and final phases. Each phase saves as one deliberate Evidence Bank collection.</p></header>
    ${renderTrackSelector(profile, "novel-questions")}
    ${profile.tracks.map((track) => {
      const trackId = safeId(track.id);
      const trackQuestionSets = profile.questionSets.filter((set) => !set.trackIds?.length || set.trackIds.includes(track.id));
      return `<article class="novel-document" data-novel-track-panel="${escapeHtml(trackId)}" data-novel-work-title="${escapeHtml(track.title)}">
        <div class="novel-stage-control"><label><span>Choose a reading phase</span><select data-novel-phase-select data-response-id="${escapeHtml(responseId(profile, "novel-questions", trackId, "selected-phase"))}">${trackQuestionSets.map((set) => `<option value="${escapeHtml(safeId(set.id))}">${escapeHtml(set.title)}</option>`).join("")}</select></label><span>Choose the phase that matches your current reading.</span></div>
        ${trackQuestionSets.map((set, index) => renderQuestionSet(profile, track, set, index)).join("")}
      </article>`;
    }).join("")}
  </section>`;
}

function repeatableKind(tool: EnglishWritingTool) {
  const id = safeId(tool.id);
  if (id.includes("motif")) return "motif";
  if (id.includes("author") && id.includes("intent")) return "author-intent";
  if (id.includes("paragraph")) return "paragraph";
  return "writing-entry";
}

function renderWritingTool(profile: EnglishNovelStudyRendererProfile, track: EnglishNovelTrack, tool: EnglishWritingTool, index: number) {
  const trackId = safeId(track.id);
  const toolId = safeId(tool.id);
  const kind = repeatableKind(tool);
  const entryLabel = kind === "motif" ? "Motif Card" : kind === "author-intent" ? "Author-Intent Analysis" : kind === "paragraph" ? "Paragraph Draft" : "Writing Entry";
  const motifGuide = kind === "motif"
    ? `<aside class="novel-concept-guide"><h5>What is a motif?</h5><p>A motif is a detail that appears more than once and helps develop a larger idea. It may be an object, image, phrase, colour, place, or repeated situation.</p><ol><li>Notice a detail that repeats.</li><li>Record where it appears and what is happening each time.</li><li>Compare the moments: what changes, and what stays the same?</li><li>Explain the larger idea the pattern helps the reader understand.</li></ol><p><strong>Motif is not the same as theme:</strong> the motif is the repeated pattern; the theme is the idea that the pattern helps reveal.</p></aside>`
    : "";
  return `<section class="novel-writing-tool" data-novel-tool-panel="${escapeHtml(toolId)}" ${index ? "hidden" : ""} data-repeatable-root="${escapeHtml(kind)}" data-repeatable-title="${escapeHtml(`${track.title} ${entryLabel}`)}" data-repeatable-contribution-prefix="${escapeHtml(responseId(profile, "writing-studio", trackId, toolId, "entry"))}">
    <textarea hidden data-repeatable-store data-response-id="${escapeHtml(responseId(profile, "writing-studio", trackId, toolId, "archive"))}"></textarea>
    <header class="novel-document-header novel-activity-summary novel-dark-worksheet-header"><div><p>${escapeHtml(entryLabel)}</p><h4>${escapeHtml(tool.title)}</h4><span>${escapeHtml(tool.description)}</span></div><strong data-repeatable-count>0 saved</strong></header>
    <section class="novel-entry-editor" data-repeatable-editor>
      ${motifGuide}
      <div class="novel-field-grid">${tool.fields.map((field) => renderField({ field, id: responseId(profile, "writing-studio", trackId, toolId, "draft", field.id), draftKey: field.id, className: /paragraph|meaning|intent|connection|pattern/i.test(field.id) ? "novel-field--wide" : "" })).join("")}</div>
      <div class="novel-inline-actions"><button type="button" class="novel-button novel-button--primary" data-repeatable-save>Save ${escapeHtml(entryLabel)} to ${kind === "paragraph" ? "Paragraph Bank" : kind === "motif" ? "Motif Board" : kind === "author-intent" ? "Author-Intent Archive" : "Archive"}</button><button type="button" class="novel-button novel-button--quiet" data-repeatable-clear>Clear draft</button><span data-repeatable-status aria-live="polite"></span></div>
    </section>
    <section class="novel-saved-section">
      <div class="novel-section-heading"><div><p>Saved work</p><h4>${kind === "paragraph" ? "Paragraph Bank" : kind === "motif" ? "Multi-card Motif Board" : kind === "author-intent" ? "Author-Intent Archive" : "Writing Archive"}</h4></div>${kind === "motif" ? `<label><span>Filter by motif</span><select data-repeatable-filter><option value="">All motifs</option></select></label>` : ""}</div>
      <div class="novel-card-list" data-repeatable-list></div><p class="novel-empty-state" data-repeatable-empty>No saved entries yet.</p>
    </section>
    ${renderToolbar({ evidenceRoute: profile.evidenceBankRoute })}
  </section>`;
}

function renderWritingStudio(profile: EnglishNovelStudyRendererProfile) {
  return `<section id="writing-studio" class="course-page english-activity-page novel-profile-page" hidden data-novel-module="writing-studio">
    <header class="novel-page-header"><p>${escapeHtml(profile.courseCode)} | Writing Studio</p><h2>Novel Study Writing Studio</h2><p>Build and retain multiple drafts. Nothing enters the Evidence Bank until you choose the green save action on a saved card.</p></header>
    ${renderTrackSelector(profile, "writing-studio")}
    ${profile.tracks.map((track) => {
      const trackId = safeId(track.id);
      return `<article class="novel-document" data-novel-track-panel="${escapeHtml(trackId)}" data-novel-work-title="${escapeHtml(track.title)}">
        <div class="novel-stage-control"><label><span>Choose a writing tool</span><select data-novel-tool-select data-response-id="${escapeHtml(responseId(profile, "writing-studio", trackId, "selected-tool"))}">${profile.writingTools.map((tool) => `<option value="${escapeHtml(safeId(tool.id))}">${escapeHtml(tool.title)}</option>`).join("")}</select></label><span>Choose the tool that supports your current work.</span></div>
        ${profile.writingTools.map((tool, index) => renderWritingTool(profile, track, tool, index)).join("")}
      </article>`;
    }).join("")}
  </section>`;
}

function assertProfile(profile: EnglishNovelStudyRendererProfile) {
  if (profile.kind !== "novel-study") throw new Error("Novel Study renderer requires kind=novel-study.");
  if (!profile.namespace.trim()) throw new Error("Novel Study renderer requires a namespace.");
  if (!profile.tracks.length) throw new Error("Novel Study renderer requires at least one configured track.");
  if (!profile.essay.stages.length) throw new Error("Novel Study renderer requires configured critical-essay stages.");
  const checkUnique = (values: Array<string | undefined>, label: string) => {
    if (values.some((value) => !value?.trim())) {
      throw new Error(`Novel Study ${label} requires a stable id for every item.`);
    }
    const normalized = values.map((value) => safeId(value!));
    const duplicate = normalized.find((value, index) => normalized.indexOf(value) !== index);
    if (duplicate) throw new Error(`Novel Study ${label} contains duplicate stable id: ${duplicate}.`);
  };
  checkUnique(profile.tracks.map((track) => track.id), "tracks");
  checkUnique(profile.essay.stages.map((stage) => stage.id), "essay stages");
  checkUnique(profile.questionSets.map((set) => set.id), "question phases");
  checkUnique(profile.writingTools.map((tool) => tool.id), "writing tools");
}

export function renderNovelStudyProfile(profile: EnglishNovelStudyRendererProfile): EnglishNovelStudyRenderedModule {
  assertProfile(profile);
  const criticalEssayStagePages: EnglishNovelStudyRenderedPage[] = profile.essay.stages.map((stage) => ({
    id: `critical-essay-${safeId(stage.id)}`,
    label: stage.title,
    icon: "edit_note",
    html: ""
  }));
  const previewPage: EnglishNovelStudyRenderedPage = {
    id: "critical-essay-preview",
    label: "Critical Essay Preview",
    icon: "preview",
    html: ""
  };
  const guidePage: EnglishNovelStudyRenderedPage = {
    id: "critical-essay",
    label: "Critical Essay",
    icon: "edit_note",
    html: renderCriticalEssayGuide(profile, "critical-essay", criticalEssayStagePages[0] ?? previewPage)
  };
  const renderedStagePages = criticalEssayStagePages.map((page, index) => ({
    ...page,
    html: renderCriticalEssayStage({
      profile,
      routeId: page.id,
      stage: profile.essay.stages[index]!,
      previous: index === 0
        ? { id: guidePage.id, label: "Critical Analytical Essay Guide" }
        : criticalEssayStagePages[index - 1]!,
      next: criticalEssayStagePages[index + 1] ?? previewPage
    })
  }));
  previewPage.html = renderCriticalEssayPreview(profile, previewPage.id, renderedStagePages.at(-1) ?? guidePage);
  const candidatePages: EnglishNovelStudyRenderedPage[] = [
    guidePage,
    ...renderedStagePages,
    previewPage,
    { id: "reading-guide", label: "Reading Guide", icon: "menu_book", html: renderReadingGuide(profile) },
    { id: "major-works-data", label: "Major Works Data Sheet", icon: "dataset", html: renderMajorWorks(profile) },
    { id: "novel-study-questions", label: "Novel Study Questions", icon: "quiz", html: renderNovelQuestions(profile) },
    { id: "writing-studio", label: "Writing Studio", icon: "edit", html: renderWritingStudio(profile) }
  ];
  const configuredActivities = profile.recipeProfile?.activities ?? [];
  const enabledRoutes = new Set(configuredActivities.filter((activity) => activity.enabled).map((activity) => activity.route));
  const criticalEssayEnabled = !configuredActivities.length || enabledRoutes.has("critical-essay");
  const pages = configuredActivities.length
    ? candidatePages.filter((page) => enabledRoutes.has(page.id) || (criticalEssayEnabled && page.id.startsWith("critical-essay-")))
    : candidatePages;
  return {
    kind: "novel-study",
    pages,
    navGroups: criticalEssayEnabled ? [{
      id: guidePage.id,
      label: "Critical Essay",
      icon: "edit_note",
      landingItemLabel: "Critical Analytical Essay Guide",
      itemPageIds: [...renderedStagePages.map((page) => page.id), previewPage.id]
    }] : [],
    resourceLinks: profile.materials ?? [],
    css: NOVEL_STUDY_PROFILE_CSS,
    runtime: NOVEL_STUDY_PROFILE_RUNTIME
  };
}

export const NOVEL_STUDY_PROFILE_CSS = `
.novel-profile-page{max-width:1120px;margin:0 auto;padding:34px;color:#202420}.novel-page-header{border-top:4px solid #175314;padding:20px 0 12px}.novel-page-header>p:first-child,.novel-eyebrow,.novel-section-heading p,.novel-document-header p{margin:0 0 6px;color:#3f6a3d;font-size:.76rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase}.novel-page-header h2{margin:0 0 8px;font-size:2rem;line-height:1.15}.novel-page-header>p:last-child{max-width:760px;margin:0;color:#555f56;line-height:1.55}.novel-track-control,.novel-stage-control label,.novel-section-heading label{display:grid;gap:6px;font-weight:750}.novel-track-control{max-width:560px;margin:20px 0}.novel-track-control select,.novel-stage-control select,.novel-section-heading select,.novel-field input,.novel-field select,.novel-field textarea{width:100%;box-sizing:border-box;border:1px solid #aeb9ad;border-radius:5px;background:#fff;color:#202420;font:inherit}.novel-track-control select,.novel-stage-control select,.novel-section-heading select,.novel-field input,.novel-field select{min-height:42px;padding:9px 11px}.novel-field textarea{min-height:112px;padding:11px;resize:vertical;line-height:1.5}.novel-document,.novel-notebook{border:1px solid #cfd6ce;border-radius:6px;background:#fff;margin-top:18px;overflow:hidden}.novel-document-header{display:flex;align-items:flex-start;justify-content:space-between;gap:22px;padding:20px;background:#151a16;color:#fff}.novel-document-header h3,.novel-document-header h4{margin:0 0 5px;font-size:1.45rem}.novel-document-header span{color:#d4ddd3;line-height:1.45}.novel-document-header .novel-progress{min-width:260px}.novel-stage-control,.novel-section-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;padding:16px 20px;border-bottom:1px solid #dce2db;background:#f5f7f4}.novel-stage-control label{min-width:min(430px,100%)}.novel-stage-control>span{color:#667066;font-size:.9rem}.novel-stage-panel,.novel-question-phase,.novel-writing-tool{padding:22px}.novel-stage-heading{display:flex;align-items:center;gap:13px}.novel-stage-heading>span{display:grid;width:34px;height:34px;place-items:center;border-radius:50%;background:#175314;color:#fff;font-weight:800}.novel-stage-heading p,.novel-stage-heading h4{margin:0}.novel-stage-heading p{color:#637063;font-size:.88rem}.novel-stage-heading h4{font-size:1.25rem}.novel-stage-instruction{max-width:780px;line-height:1.55}.novel-checkpoints,.novel-model{margin:14px 0;padding:14px;border-left:4px solid #62835f;background:#f2f5f0}.novel-checkpoints ul{margin:8px 0 0;padding-left:20px}.novel-concept-guide{margin:0 0 18px;border-left:4px solid #477445;background:#f2f5f0;padding:16px 18px;color:#263026}.novel-concept-guide h5{margin:0 0 7px;font-size:1.05rem}.novel-concept-guide p{margin:7px 0;line-height:1.55}.novel-concept-guide ol{margin:10px 0;padding-left:22px}.novel-concept-guide li{margin:5px 0;line-height:1.45}.novel-field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:18px}.novel-field{display:grid;align-content:start;gap:6px;font-weight:750}.novel-field small{color:#646d64;font-weight:500;line-height:1.4}.novel-field--wide{grid-column:1/-1}.novel-word-count{justify-self:end;color:#707970;font-size:.78rem;font-weight:600}.novel-field-hint{margin:0;padding:9px 11px;border-left:3px solid #61835f;background:#f2f5f0;color:#3e493e;font-size:.86rem;font-weight:500;line-height:1.4}.novel-toolbar,.novel-inline-actions{display:flex;align-items:center;justify-content:flex-end;gap:9px;flex-wrap:wrap}.novel-toolbar{padding:16px 20px;border-top:1px solid #dce2db}.novel-inline-actions{margin-top:16px}.novel-button{display:inline-flex;min-height:38px;align-items:center;justify-content:center;gap:7px;box-sizing:border-box;border:1px solid #7f967d;border-radius:5px;background:#fff;color:#174b15;padding:8px 13px;font:inherit;font-weight:800;text-decoration:none;cursor:pointer}.novel-button:hover{background:#f1f5ef}.novel-button:focus-visible{outline:3px solid #8db789;outline-offset:2px}.novel-button--primary,.evidence-bank-save-action{border-color:#175314;background:#175314;color:#fff}.novel-button--primary:hover,.evidence-bank-save-action:hover{background:#0f3d0d}.novel-button--quiet{border-color:#c2cbc1;color:#425042}.novel-save-status,[data-repeatable-status]{min-width:105px;color:#576257;font-size:.82rem}.novel-progress>div:first-child{display:flex;justify-content:space-between;gap:16px;font-size:.8rem}.novel-progress-track{height:7px;margin-top:7px;border-radius:4px;background:#314233;overflow:hidden}.novel-progress-track span{display:block;width:0;height:100%;background:#9bc596}.novel-entry-editor,.novel-saved-section,.novel-synthesis{padding:20px;border-top:1px solid #dce2db}.novel-section-heading{margin:-20px -20px 18px}.novel-section-heading h4,.novel-section-heading p{margin:0}.novel-section-heading label{min-width:210px}.novel-card-list{display:grid;gap:12px}.novel-saved-card{border:1px solid #cfd7ce;border-left:4px solid #477445;border-radius:5px;padding:15px;background:#fff}.novel-saved-card.is-strongest{border-left-color:#d19a2b;background:#fffdf6}.novel-saved-card header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.novel-saved-card h5{margin:0 0 5px;font-size:1rem}.novel-saved-card p{margin:7px 0;white-space:pre-wrap;line-height:1.48}.novel-card-meta{color:#657065;font-size:.82rem}.novel-card-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.novel-card-actions .novel-button{min-height:34px;padding:6px 10px;font-size:.82rem}.novel-empty-state{margin:0;padding:18px;border:1px dashed #aeb9ad;color:#616b61;text-align:center}.novel-question-list{display:grid;gap:0}.novel-question{display:grid;grid-template-columns:40px 1fr;gap:12px;padding:18px 0;border-bottom:1px solid #e0e5df}.novel-question-number{display:grid;width:30px;height:30px;place-items:center;border-radius:50%;background:#175314;color:#fff;font-weight:800}.novel-question p{margin:4px 0 12px;font-weight:750;line-height:1.45}.novel-question aside{padding:11px;border-left:3px solid #61835f;background:#f2f5f0}.novel-writing-tool>.novel-document-header{margin:-22px -22px 0}.novel-writing-tool>.novel-toolbar{margin:0 -22px -22px}.novel-writing-tool>.novel-saved-section{margin:0 -22px}.novel-writing-tool>.novel-entry-editor{margin:0 -22px}.novel-writing-tool{border-top:1px solid #dce2db}.novel-synthesis{background:#fbfcfa}@media(max-width:760px){.novel-profile-page{padding:20px 14px}.novel-page-header h2{font-size:1.65rem}.novel-field-grid{grid-template-columns:1fr}.novel-field--wide{grid-column:auto}.novel-document-header,.novel-stage-control,.novel-section-heading{align-items:stretch;flex-direction:column}.novel-document-header .novel-progress{min-width:0;width:100%}.novel-toolbar,.novel-inline-actions{justify-content:stretch}.novel-button{flex:1}.novel-question{grid-template-columns:32px 1fr}}
@media print{.novel-track-control,.novel-stage-control,.novel-toolbar,.novel-inline-actions,.novel-section-heading label,.novel-card-actions{display:none!important}.novel-profile-page{max-width:none;padding:0}.novel-document,.novel-notebook{border:0}.novel-stage-panel[hidden],.novel-question-phase[hidden],.novel-writing-tool[hidden],.novel-track-card[hidden],.novel-document[hidden],.novel-notebook[hidden]{display:none!important}}
.novel-critical-outcomes,.novel-critical-panel,.novel-selected-track-context{margin-top:16px;border:1px solid #d6ddd3;border-radius:6px;background:#fff;padding:18px}.novel-critical-outcomes{border-left:4px solid #477445;background:#f7f9f5}.novel-critical-outcomes h3,.novel-critical-panel h3,.novel-selected-track-context h3{margin:0 0 8px}.novel-critical-outcomes ul,.novel-critical-step-list{margin:0;padding-left:20px}.novel-critical-outcomes li,.novel-critical-step-list li{margin:5px 0;line-height:1.48}.novel-critical-category-grid,.novel-critical-support-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:15px}.novel-critical-category-grid article{border:1px solid #d8dfd5;border-radius:5px;background:#f7f9f5;padding:14px}.novel-critical-category-grid article:last-child{grid-column:1/-1}.novel-critical-category-grid p,.novel-critical-panel p,.novel-selected-track-context p{margin:5px 0 0;line-height:1.5}.novel-selected-track-context{border-left:4px solid #175314}.novel-critical-lesson-map ol{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 24px;padding-left:24px}.novel-critical-support-grid>.novel-critical-panel{margin-top:0}.novel-critical-tip{background:#fffaf0;border-color:#e4d4b1}.novel-critical-model{margin-top:14px;border-left:4px solid #477445;background:#f2f5f0;padding:13px}.novel-critical-model p{margin:5px 0 0}.novel-critical-planner{border-color:#d8dfd1;background:#f8f9f6}.novel-critical-planner>.novel-field-grid{grid-template-columns:1fr}.novel-essay-stage{overflow:visible;border:0;border-radius:0;background:transparent}.novel-essay-stage>.novel-toolbar{margin-bottom:18px;border:1px solid #d8dfd1;border-radius:6px;background:#fff}.novel-stage-summary{border:1px solid #d8dfd1;border-left:3px solid #175314;border-radius:6px;background:#fff;color:#202420;padding:22px}.novel-stage-summary h3{margin:7px 0 0;font-size:clamp(28px,4vw,42px);line-height:1.08}.novel-stage-summary span{display:block;margin-top:8px;color:#4d554a}.novel-stage-summary .novel-progress>div:first-child{color:#4d554a}.novel-stage-summary .novel-progress-track{background:#e6ebe2}.novel-essay-stage .novel-field-grid{padding-bottom:2px}.novel-essay-lesson-navigation{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:22px}.novel-essay-lesson-navigation .lesson-jump{display:inline-flex;min-height:40px;align-items:center;border:1px solid #9eac9c;border-radius:5px;color:#174b15;padding:8px 13px;font-weight:800;text-decoration:none}.novel-essay-lesson-navigation .lesson-jump.primary{border-color:#175314;background:#175314;color:#fff}.novel-essay-preview-toolbar{justify-content:space-between;border-top:0;border-bottom:1px solid #dce2db}.novel-preview-actions{display:flex;gap:9px;flex-wrap:wrap}.novel-essay-preview-foundation{display:grid;grid-template-columns:minmax(190px,.7fr) minmax(0,1.8fr);gap:22px;padding:22px;background:#f4f7f2}.novel-essay-preview-foundation h3{margin:0}.novel-essay-preview-foundation>div>p:last-child{margin:5px 0}.novel-essay-preview-foundation dl{display:grid;gap:10px;margin:0}.novel-essay-preview-foundation dl>div{border-left:3px solid #477445;background:#fff;padding:10px 12px}.novel-essay-preview-foundation dt{color:#426540;font-size:.78rem;font-weight:800;text-transform:uppercase}.novel-essay-preview-foundation dd{margin:5px 0 0;white-space:pre-wrap;line-height:1.5}.novel-essay-preview-document{margin:22px;border:1px solid #d6ddd3;background:#fff}.novel-essay-preview-document>header{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;padding:18px 20px;border-bottom:1px solid #d6ddd3}.novel-essay-preview-document>header p,.novel-essay-preview-document>header h3{margin:0}.novel-essay-preview-document>header p{color:#3f6a3d;font-size:.76rem;font-weight:800;text-transform:uppercase}.novel-essay-preview-document>section{padding:18px 20px;border-top:1px solid #e0e5df}.novel-essay-preview-document>section:first-of-type{border-top:0}.novel-essay-preview-document h4{margin:0 0 9px}.novel-essay-preview-document [data-novel-essay-preview-section]{display:grid;gap:10px}.novel-essay-preview-document [data-novel-essay-preview-section] p{margin:0;white-space:pre-wrap;line-height:1.62}.novel-essay-preview-empty{color:#687168;font-style:italic}.novel-essay-revision-notes{margin:0 22px 22px;background:#fffaf0;border-color:#e4d4b1}.novel-essay-revision-notes p{white-space:pre-wrap}.novel-essay-preview-save-status{margin:0 22px 22px;color:#576257;font-size:.88rem}.novel-essay-preview-save-status:empty{display:none}
@media(max-width:760px){.novel-field-grid,.novel-critical-category-grid,.novel-critical-support-grid,.novel-critical-lesson-map ol,.novel-essay-preview-foundation{grid-template-columns:1fr}.novel-critical-category-grid article:last-child{grid-column:auto}.novel-essay-preview-document>header{align-items:stretch;flex-direction:column}.novel-preview-actions{justify-content:stretch}.novel-essay-lesson-navigation{align-items:stretch;flex-direction:column}.novel-essay-lesson-navigation .lesson-jump{justify-content:center}.novel-essay-preview-document,.novel-essay-revision-notes{margin-left:12px;margin-right:12px}}
.novel-document-header.novel-activity-summary{border-left:3px solid #175314;border-bottom:1px solid #d8dfd1;background:#fff;color:#202420}.novel-activity-summary:not(.novel-stage-summary) h3,.novel-activity-summary:not(.novel-stage-summary) h4{margin:6px 0 0;font-size:clamp(1.55rem,3vw,2.15rem);line-height:1.12}.novel-activity-summary span,.novel-activity-summary>strong,.novel-activity-summary .novel-progress>div:first-child{color:#4d554a}.novel-activity-summary>strong{font-size:.9rem;line-height:1.4}.novel-activity-summary .novel-progress{width:min(320px,100%)}.novel-activity-summary .novel-progress-track{background:#e6ebe2}.novel-question-phase>.novel-activity-summary{margin:-22px -22px 0}.novel-major-works-fields{margin-top:0;padding:22px}.novel-question-number{display:block;width:auto;height:auto;padding-top:3px;border-radius:0;background:transparent;color:#175314;line-height:1.45}.novel-material-list article:first-of-type{border-top:0}
.novel-document-header.novel-activity-summary.novel-dark-worksheet-header,#evidence-bank .novel-dark-worksheet-header{border-left:0;border-bottom:0;background:#161a17;color:#fff}.novel-dark-worksheet-header h3,.novel-dark-worksheet-header h4{color:#fff}.novel-dark-worksheet-header p{color:#b9c3b2}.novel-dark-worksheet-header span:not(.material-symbols-outlined),.novel-dark-worksheet-header>strong,.novel-dark-worksheet-header .novel-progress>div:first-child{color:#d7ddd4}.novel-dark-worksheet-header .novel-progress-track{background:#293029}.novel-dark-worksheet-header .novel-progress-track span{background:#9fcf93}#evidence-bank .english-evidence-bank-heading.novel-dark-worksheet-header{margin:-22px -22px 18px;border-radius:7px 7px 0 0;padding:24px 28px}#evidence-bank .english-evidence-capture-heading.novel-dark-worksheet-header{margin:-22px -22px 0;border-radius:7px 7px 0 0;padding:24px 28px}#evidence-bank .novel-dark-worksheet-header>.material-symbols-outlined{background:#293029;color:#9fcf93}
@media(max-width:760px){.novel-activity-summary .novel-progress{width:100%;min-width:0}.novel-major-works-fields{padding:18px}.novel-activity-summary>strong{white-space:normal}}
@media print{.novel-essay-lesson-navigation{display:none!important}[data-novel-track-panel][hidden]{display:none!important}}
`;

export const NOVEL_STUDY_PROFILE_RUNTIME = String.raw`
(() => {
  const rootSelector = ".novel-profile-page";
  const text = (value) => String(value == null ? "" : value);
  const words = (value) => text(value).trim().split(/\s+/).filter(Boolean).length;
  const parseStore = (field) => {
    try {
      const value = JSON.parse(field && field.value ? field.value : "{}");
      if (Array.isArray(value)) return { items: value, strongestId: "" };
      return { items: Array.isArray(value.items) ? value.items : [], strongestId: text(value.strongestId) };
    } catch (_error) {
      return { items: [], strongestId: "" };
    }
  };
  const announce = (scope, message) => {
    const target = scope && scope.querySelector("[data-novel-save-status], [data-repeatable-status]");
    if (target) target.textContent = message;
  };
  const dispatchInput = (field) => {
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const writeStore = (root, state) => {
    const field = root.querySelector("[data-repeatable-store]");
    if (!field) return;
    field.value = JSON.stringify(state);
    dispatchInput(field);
  };
  const nextEntryId = (items) => {
    const used = new Set(items.map((item) => text(item.id)));
    let index = items.length + 1;
    while (used.has("entry-" + String(index).padStart(3, "0"))) index += 1;
    return "entry-" + String(index).padStart(3, "0");
  };
  const collectFields = (scope) => {
    const values = {};
    scope.querySelectorAll("[data-response-id]").forEach((field) => {
      if (field.hasAttribute("data-repeatable-store")) return;
      const id = field.getAttribute("data-response-id");
      if (!id) return;
      values[id] = field.type === "checkbox" ? Boolean(field.checked) : text(field.value);
    });
    return values;
  };
  const evidenceContext = (scope, activityId, activityTitle) => {
    const track = scope.closest("[data-novel-track-panel]");
    const trackId = (track && track.getAttribute("data-novel-track-panel")) || "novel";
    const trackTitle = (track && track.getAttribute("data-novel-work-title")) || trackId;
    const module = scope.closest("[data-novel-module]");
    const projectSlug = (scope.getAttribute("data-evidence-collection-id") || scope.getAttribute("data-repeatable-contribution-prefix") || "novel-study").split(":")[0];
    return {
      projectSlug,
      source: {
        kind: activityId === "novel-question-collection" ? "question-set" : activityId === "reading-passage" ? "reading" : activityId.indexOf("writing") >= 0 || ["paragraph", "motif", "author-intent"].includes(activityId) ? "writing-studio" : "activity",
        id: (module && module.getAttribute("data-novel-module")) || activityId,
        title: activityTitle
      },
      activity: { id: activityId, profile: "novel-study", title: activityTitle },
      work: { id: trackId, title: trackTitle, kind: "text" }
    };
  };
  const evidenceUpsert = async (entry, scope) => {
    const api = window.nextStepEvidenceBank;
    if (!api || typeof api.upsert !== "function") {
      announce(scope, "Evidence Bank is not available in this preview.");
      return;
    }
    try {
      await api.upsert(entry);
      announce(scope, "Saved to Evidence Bank");
    } catch (_error) {
      announce(scope, "Could not save to Evidence Bank");
    }
  };
  const evidenceApi = () => {
    const api = window.nextStepEvidenceBank;
    return api && typeof api.upsert === "function" && typeof api.list === "function" ? api : undefined;
  };
  const existingEvidence = (contributionId) => {
    const api = evidenceApi();
    if (!api) return undefined;
    try {
      return api.list().find((entry) => entry.contributionId === contributionId);
    } catch (_error) {
      return undefined;
    }
  };
  const setTrack = (trackId, persist) => {
    document.querySelectorAll("[data-novel-track-select]").forEach((select) => {
      if (![...select.options].some((option) => option.value === trackId)) return;
      const changed = select.value !== trackId;
      select.value = trackId;
      if (persist && changed) select.dispatchEvent(new Event("input", { bubbles: true }));
    });
    document.querySelectorAll("[data-novel-track-panel]").forEach((panel) => {
      panel.hidden = panel.getAttribute("data-novel-track-panel") !== trackId;
    });
    document.querySelectorAll("[data-collection-scope]").forEach(updateProgress);
    updateEssayPreviews();
  };
  const showSelected = (select, panelAttribute) => {
    const scope = select.closest("[data-novel-track-panel]") || select.closest(rootSelector);
    if (!scope) return;
    scope.querySelectorAll("[" + panelAttribute + "]").forEach((panel) => {
      panel.hidden = panel.getAttribute(panelAttribute) !== select.value;
      if (!panel.hidden && panel.hasAttribute("data-collection-scope")) updateProgress(panel);
    });
  };
  const updateWordCount = (field) => {
    const id = field.id;
    if (!id) return;
    const label = field.closest(".novel-field");
    const counter = label && label.querySelector('[data-word-count-for="' + CSS.escape(id) + '"]');
    if (counter) counter.textContent = words(field.value) + " words";
  };
  const updateProgress = (scope) => {
    const progress = scope.querySelector(":scope > .novel-document-header [data-novel-progress], :scope > [data-novel-progress]");
    if (!progress) return;
    const includeHiddenStages = scope.hasAttribute("data-progress-all");
    const fields = [...scope.querySelectorAll("[data-response-id]")].filter((field) => {
      if (field.hasAttribute("data-repeatable-store")) return false;
      if (includeHiddenStages) return true;
      return field.closest("[data-novel-track-panel][hidden], [data-novel-stage-panel][hidden], [data-novel-phase-panel][hidden], [data-novel-tool-panel][hidden]") == null;
    });
    const complete = fields.filter((field) => field.type === "checkbox" ? field.checked : text(field.value).trim()).length;
    const label = progress.querySelector("[data-novel-progress-label]");
    const fill = progress.querySelector("[data-novel-progress-fill]");
    if (label) label.textContent = complete + " of " + fields.length + " complete";
    if (fill) fill.style.width = fields.length ? Math.round(complete / fields.length * 100) + "%" : "0%";
  };
  const draftValues = (root) => {
    const values = {};
    root.querySelectorAll("[data-repeatable-draft]").forEach((field) => {
      values[field.getAttribute("data-repeatable-draft")] = field.type === "checkbox" ? Boolean(field.checked) : text(field.value).trim();
    });
    return values;
  };
  const clearDraft = (root) => {
    root.querySelectorAll("[data-repeatable-draft]").forEach((field) => {
      if (field.type === "checkbox") field.checked = false;
      else field.value = "";
      field.removeAttribute("data-editing-entry");
      dispatchInput(field);
      updateWordCount(field);
    });
    root.removeAttribute("data-editing-id");
    const button = root.querySelector("[data-repeatable-save]");
    if (button) button.textContent = button.textContent.replace(/^Update /, "Save ");
  };
  const itemSummary = (item) => {
    const pairs = Object.entries(item.values || {}).filter((pair) => text(pair[1]).trim());
    const preferred = pairs.find((pair) => /passage|paragraph|quote|motif|intent|claim|choice/i.test(pair[0])) || pairs[0];
    return preferred ? text(preferred[1]) : "Saved entry";
  };
  const evidenceEntryForItem = (root, item) => {
    const kind = root.getAttribute("data-repeatable-root") || "writing-entry";
    const title = root.getAttribute("data-repeatable-title") || "Novel Study Entry";
    const context = evidenceContext(root, kind, title);
    const locator = item.values.locator || item.values.location || item.values.chapter || "";
    const evidence = item.values.passage || item.values.paragraph || item.values.moments || item.values.choice || itemSummary(item);
    const analysis = item.values.analysis || item.values.effect || item.values.meaning || item.values.intent || item.values.connection || "";
    const now = new Date().toISOString();
    return {
      schemaVersion: 2,
      contributionId: root.getAttribute("data-repeatable-contribution-prefix") + ":" + item.id,
      projectSlug: context.projectSlug,
      entryKind: "individual",
      source: context.source,
      activity: context.activity,
      work: context.work,
      locator: locator ? { label: text(locator) } : undefined,
      prompt: title,
      answer: itemSummary(item),
      evidence: text(evidence),
      analysis: text(analysis),
      responseIds: [...root.querySelectorAll("[data-repeatable-draft][data-response-id]")].map((field) => field.getAttribute("data-response-id")).filter(Boolean),
      tags: [kind, text(item.values.motif || item.values["evidence-type"] || "novel-study")],
      createdAt: item.createdAt || now,
      updatedAt: now,
      metadata: { values: item.values },
      concept: title,
      detail: text(evidence),
      connection: text(analysis)
    };
  };
  const renderRepeatable = (root) => {
    const store = root.querySelector("[data-repeatable-store]");
    if (!store) return;
    const state = parseStore(store);
    const filter = root.querySelector("[data-repeatable-filter]");
    const filterValue = filter ? text(filter.value) : "";
    if (filter && root.getAttribute("data-repeatable-root") === "motif") {
      const motifs = [...new Set(state.items.map((item) => text(item.values && item.values.motif)).filter(Boolean))];
      const current = filter.value;
      filter.innerHTML = '<option value="">All motifs</option>' + motifs.map((motif) => '<option value="' + motif.replace(/&/g, "&amp;").replace(/"/g, "&quot;") + '">' + motif.replace(/&/g, "&amp;").replace(/</g, "&lt;") + '</option>').join("");
      filter.value = motifs.includes(current) ? current : "";
    }
    const currentFilter = filter ? text(filter.value) : filterValue;
    const items = state.items.filter((item) => {
      if (!currentFilter) return true;
      return Object.values(item.values || {}).some((value) => text(value) === currentFilter);
    });
    const list = root.querySelector("[data-repeatable-list]");
    const empty = root.querySelector("[data-repeatable-empty]");
    const count = root.querySelector("[data-repeatable-count]");
    if (count) count.textContent = state.items.length + (state.items.length === 1 ? " saved" : " saved");
    if (empty) empty.hidden = items.length > 0;
    if (list) {
      list.innerHTML = items.map((item) => {
        const strongest = state.strongestId === item.id;
        const pairs = Object.entries(item.values || {}).filter((pair) => text(pair[1]).trim());
        return '<article class="novel-saved-card' + (strongest ? " is-strongest" : "") + '" data-repeatable-entry="' + item.id + '">' +
          '<header><div><h5>' + (strongest ? "Strongest evidence" : root.getAttribute("data-repeatable-title")) + '</h5><span class="novel-card-meta">' + text(item.updatedAt || item.createdAt || "Saved") + '</span></div></header>' +
          pairs.map((pair) => '<p><strong>' + pair[0].replace(/-/g, " ") + ':</strong> ' + text(pair[1]).replace(/&/g, "&amp;").replace(/</g, "&lt;") + '</p>').join("") +
          '<div class="novel-card-actions"><button type="button" class="novel-button" data-repeatable-edit="' + item.id + '">Edit</button><button type="button" class="novel-button novel-button--quiet" data-repeatable-delete="' + item.id + '">Delete</button>' +
          (root.getAttribute("data-repeatable-root") === "reading-passage" ? '<button type="button" class="novel-button" data-repeatable-strongest="' + item.id + '">' + (strongest ? "Strongest selected" : "Mark strongest") + '</button>' : "") +
          '<button type="button" class="novel-button novel-button--primary evidence-bank-save-action" data-repeatable-evidence="' + item.id + '">Save to Evidence Bank</button></div></article>';
      }).join("");
    }
    const summary = root.querySelector("[data-strongest-summary]");
    if (summary) {
      const strongest = state.items.find((item) => item.id === state.strongestId);
      summary.textContent = strongest ? "Strongest: " + itemSummary(strongest).slice(0, 90) : "No strongest passage selected.";
    }
  };
  const saveRepeatable = (root) => {
    const store = root.querySelector("[data-repeatable-store]");
    if (!store) return;
    const state = parseStore(store);
    const values = draftValues(root);
    if (!Object.values(values).some((value) => text(value).trim())) {
      announce(root, "Add content before saving.");
      return;
    }
    const editingId = root.getAttribute("data-editing-id");
    const now = new Date().toISOString();
    if (editingId) {
      const item = state.items.find((candidate) => candidate.id === editingId);
      if (item) {
        item.values = values;
        item.updatedAt = now;
      }
    } else {
      state.items.push({ id: nextEntryId(state.items), values, createdAt: now, updatedAt: now });
    }
    writeStore(root, state);
    clearDraft(root);
    renderRepeatable(root);
    announce(root, editingId ? "Entry updated." : "Entry saved locally.");
  };
  const editRepeatable = (root, id) => {
    const store = root.querySelector("[data-repeatable-store]");
    const item = store && parseStore(store).items.find((candidate) => candidate.id === id);
    if (!item) return;
    root.setAttribute("data-editing-id", id);
    root.querySelectorAll("[data-repeatable-draft]").forEach((field) => {
      const key = field.getAttribute("data-repeatable-draft");
      const value = item.values && item.values[key];
      if (field.type === "checkbox") field.checked = Boolean(value);
      else field.value = text(value);
      dispatchInput(field);
      updateWordCount(field);
    });
    const button = root.querySelector("[data-repeatable-save]");
    if (button && !/^Update /.test(button.textContent)) button.textContent = button.textContent.replace(/^Save /, "Update ");
    root.querySelector("[data-repeatable-editor]")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const deleteRepeatable = (root, id) => {
    const store = root.querySelector("[data-repeatable-store]");
    if (!store) return;
    const state = parseStore(store);
    state.items = state.items.filter((item) => item.id !== id);
    if (state.strongestId === id) state.strongestId = "";
    writeStore(root, state);
    renderRepeatable(root);
    announce(root, "Entry removed from this activity.");
  };
  const markStrongest = (root, id) => {
    const store = root.querySelector("[data-repeatable-store]");
    if (!store) return;
    const state = parseStore(store);
    state.strongestId = id;
    writeStore(root, state);
    renderRepeatable(root);
  };
  const essayFieldMap = {
    "topic-thesis": ["topic", "interpretation", "thesis"],
    introduction: ["opening", "text-bridge", "thesis-revision"],
    "body-one": ["beginning-state", "beginning-evidence", "beginning-analysis"],
    "body-two": ["middle-state", "middle-evidence", "middle-analysis"],
    "body-three": ["end-state", "end-evidence", "end-analysis"],
    "conclusion-revision": ["final-insight", "human-connection", "revision-plan"]
  };
  const previewField = (responseId) => document.querySelector('[data-response-id="' + CSS.escape(responseId) + '"]');
  const buildEssayPreview = (panel) => {
    const trackId = panel.getAttribute("data-novel-essay-preview-track") || "novel";
    const contributionId = panel.getAttribute("data-evidence-collection-id") || "novel-study:critical-essay:" + trackId + ":full-plan";
    const projectSlug = contributionId.split(":critical-essay:")[0] || "novel-study";
    const prefix = projectSlug + ":critical-essay:" + trackId + ":";
    const responseIds = [];
    const value = (stageId, fieldId) => {
      const responseId = prefix + stageId + ":" + fieldId;
      responseIds.push(responseId);
      return text(previewField(responseId)?.value).trim();
    };
    const topic = value("topic-thesis", "topic");
    const interpretation = value("topic-thesis", "interpretation");
    const thesis = value("topic-thesis", "thesis");
    const introduction = [
      value("introduction", "opening"),
      value("introduction", "text-bridge"),
      value("introduction", "thesis-revision") || thesis
    ].filter(Boolean);
    const bodyOne = [value("body-one", "beginning-state"), value("body-one", "beginning-evidence"), value("body-one", "beginning-analysis")].filter(Boolean);
    const bodyTwo = [value("body-two", "middle-state"), value("body-two", "middle-evidence"), value("body-two", "middle-analysis")].filter(Boolean);
    const bodyThree = [value("body-three", "end-state"), value("body-three", "end-evidence"), value("body-three", "end-analysis")].filter(Boolean);
    const conclusion = [value("conclusion-revision", "final-insight"), value("conclusion-revision", "human-connection")].filter(Boolean);
    const revisionPlan = value("conclusion-revision", "revision-plan");
    const sections = { introduction, "body-one": bodyOne, "body-two": bodyTwo, "body-three": bodyThree, conclusion };
    const labels = { introduction: "Introduction", "body-one": "Body Paragraph 1 - Beginning", "body-two": "Body Paragraph 2 - Middle", "body-three": "Body Paragraph 3 - End", conclusion: "Conclusion" };
    const foundationLines = [topic ? "Assigned topic: " + topic : "", interpretation ? "Interpretation: " + interpretation : "", thesis ? "Working thesis: " + thesis : ""].filter(Boolean);
    const sectionBlocks = Object.keys(sections).filter((sectionId) => sections[sectionId].length).map((sectionId) => labels[sectionId] + "\n\n" + sections[sectionId].join("\n\n"));
    const compiledText = [foundationLines.length ? "Planning Foundation\n\n" + foundationLines.join("\n") : "", ...sectionBlocks, revisionPlan ? "Revision Notes\n\n" + revisionPlan : ""].filter(Boolean).join("\n\n");
    const essayText = Object.values(sections).flat().join(" ");
    return {
      contributionId,
      projectSlug,
      trackId,
      foundation: { topic, interpretation, thesis },
      sections,
      revisionPlan,
      responseIds: Array.from(new Set(responseIds)),
      startedSections: Object.values(sections).filter((parts) => parts.length).length,
      wordCount: words(essayText),
      compiledText
    };
  };
  const replacePreviewText = (target, parts) => {
    if (!target) return;
    target.replaceChildren();
    const completeParts = parts.filter(Boolean);
    if (!completeParts.length) {
      const empty = document.createElement("p");
      empty.className = "novel-essay-preview-empty";
      empty.textContent = target.getAttribute("data-novel-essay-preview-empty") || "Complete the matching writing lesson to build this paragraph.";
      target.append(empty);
      return;
    }
    completeParts.forEach((part) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = part;
      target.append(paragraph);
    });
  };
  const updateEssayPreview = (panel) => {
    const payload = buildEssayPreview(panel);
    const foundationEmpty = {
      topic: "Add the assigned topic in Topic and Thesis.",
      interpretation: "Add the novel's central interpretation in Topic and Thesis.",
      thesis: "Add a working thesis in Topic and Thesis."
    };
    Object.keys(payload.foundation).forEach((key) => {
      const target = panel.querySelector('[data-novel-essay-preview-foundation="' + key + '"]');
      if (target) target.textContent = payload.foundation[key] || foundationEmpty[key];
    });
    Object.keys(payload.sections).forEach((sectionId) => {
      replacePreviewText(panel.querySelector('[data-novel-essay-preview-section="' + sectionId + '"]'), payload.sections[sectionId]);
    });
    const revision = panel.querySelector("[data-novel-essay-preview-revision]");
    if (revision) revision.textContent = payload.revisionPlan || "Complete the Revision plan field in Conclusion and Revision to record the changes still needed.";
    const wordCount = panel.querySelector("[data-novel-essay-preview-word-count]");
    if (wordCount) wordCount.textContent = payload.wordCount + (payload.wordCount === 1 ? " word" : " words");
    const status = panel.querySelector("[data-novel-essay-preview-status]");
    if (status) status.textContent = payload.startedSections
      ? payload.startedSections + " of 5 essay sections started | " + payload.wordCount + (payload.wordCount === 1 ? " word" : " words")
      : "Your essay preview will appear here as you complete the Critical Essay writing lessons.";
    const saveStatus = panel.querySelector("[data-novel-essay-preview-save-status]");
    if (saveStatus) saveStatus.textContent = existingEvidence(payload.contributionId) ? "A saved Evidence Bank copy exists. Save again to update it." : "";
    return payload;
  };
  const updateEssayPreviews = (responseId) => {
    if (responseId && responseId.indexOf(":critical-essay:") === -1) return;
    document.querySelectorAll("[data-novel-essay-preview-panel]").forEach(updateEssayPreview);
  };
  const saveEssayPreview = async (button) => {
    const panel = button.closest("[data-novel-essay-preview-panel]");
    if (!panel) return;
    const payload = updateEssayPreview(panel);
    const status = panel.querySelector("[data-novel-essay-preview-save-status]");
    if (!payload.startedSections) {
      if (status) status.textContent = "Complete at least one essay section before saving the full plan.";
      return;
    }
    const api = evidenceApi();
    if (!api) {
      if (status) status.textContent = "The Evidence Bank is not available in this preview.";
      return;
    }
    const existing = existingEvidence(payload.contributionId);
    const title = panel.getAttribute("data-novel-work-title") || payload.trackId;
    const author = panel.getAttribute("data-novel-work-author") || "";
    const now = new Date().toISOString();
    try {
      await api.upsert({
        schemaVersion: 2,
        contributionId: payload.contributionId,
        responseId: payload.contributionId,
        projectSlug: payload.projectSlug,
        entryKind: "collection",
        source: { kind: "writing-studio", id: "critical-essay-preview", title: title + " | Critical Essay" },
        activity: { id: "critical-essay", profile: "novel-study", title: "Critical Essay" },
        work: { id: payload.trackId, title, kind: "text" },
        prompt: payload.startedSections + " of 5 essay sections saved from the Critical Essay lesson sequence.",
        answer: payload.compiledText,
        detail: payload.compiledText,
        connection: "",
        responseIds: payload.responseIds,
        tags: ["novel-study", "critical-essay", "essay-preview"],
        createdAt: existing?.createdAt || now,
        updatedAt: now,
        metadata: { author, startedSections: payload.startedSections, wordCount: payload.wordCount, foundation: payload.foundation, revisionPlan: payload.revisionPlan },
        concept: "Critical Essay Preview"
      });
      if (status) status.textContent = existing ? "Full essay plan updated in Evidence Bank." : "Full essay plan saved to Evidence Bank.";
    } catch (_error) {
      if (status) status.textContent = "Evidence Bank save failed.";
    }
  };
  const saveCollection = (button) => {
    const scope = button.closest("[data-collection-scope]");
    if (!scope) return;
    const contributionId = scope.getAttribute("data-evidence-collection-id");
    const activityId = scope.getAttribute("data-evidence-type") || "novel-study-collection";
    const title = scope.getAttribute("data-evidence-title") || "Novel Study Collection";
    const context = evidenceContext(scope, activityId, title);
    const values = collectFields(scope);
    const now = new Date().toISOString();
    const existing = existingEvidence(contributionId);
    evidenceUpsert({
      schemaVersion: 2,
      contributionId,
      responseId: contributionId,
      projectSlug: context.projectSlug,
      entryKind: "collection",
      source: context.source,
      activity: context.activity,
      work: context.work,
      prompt: title,
      answer: JSON.stringify(values),
      responseIds: Object.keys(values),
      tags: [activityId, "novel-study"],
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      metadata: { values },
      concept: title,
      detail: JSON.stringify(values)
    }, scope);
  };
  const printScope = (button) => {
    const module = button.closest(rootSelector);
    if (!module) return;
    const active = button.closest("[data-novel-print-scope]") || button.closest("[data-collection-scope]") || module.querySelector("[data-novel-track-panel]:not([hidden])") || module;
    document.body.classList.remove("print-job-active");
    document.querySelectorAll(".print-job-root").forEach((node) => node.remove());
    const printRoot = document.createElement("div");
    printRoot.className = "print-job-root";
    const clone = active.cloneNode(true);
    const sourceFields = active.querySelectorAll("textarea, input, select");
    clone.querySelectorAll("textarea, input, select").forEach((field, index) => {
      const sourceField = sourceFields[index];
      if (!sourceField) return;
      if (field instanceof HTMLTextAreaElement && sourceField instanceof HTMLTextAreaElement) {
        field.value = sourceField.value;
        field.textContent = sourceField.value;
      } else if (field instanceof HTMLInputElement && sourceField instanceof HTMLInputElement) {
        if (field.type === "checkbox" || field.type === "radio") field.checked = sourceField.checked;
        else field.value = sourceField.value;
      } else if (field instanceof HTMLSelectElement && sourceField instanceof HTMLSelectElement) {
        field.value = sourceField.value;
        Array.from(field.options).forEach((option) => { option.selected = option.value === sourceField.value; });
      }
    });
    clone.querySelectorAll("script").forEach((node) => node.remove());
    printRoot.append(clone);
    document.body.append(printRoot);
    document.body.classList.add("print-job-active");
    const clearPrintJob = () => {
      document.body.classList.remove("print-job-active");
      printRoot.remove();
    };
    window.addEventListener("afterprint", clearPrintJob, { once: true });
    window.print();
    window.setTimeout(clearPrintJob, 1000);
  };
  const init = () => {
    const routeId = window.location.hash.replace(/^#/, "");
    const route = routeId ? document.getElementById(routeId) : document.querySelector(".course-page:not([hidden])");
    const firstTrack = route?.querySelector("[data-novel-track-select]") || document.querySelector("[data-novel-track-select]");
    if (firstTrack) setTrack(firstTrack.value || firstTrack.options[0]?.value || "", false);
    document.querySelectorAll("[data-novel-stage-select]").forEach((select) => showSelected(select, "data-novel-stage-panel"));
    document.querySelectorAll("[data-novel-phase-select]").forEach((select) => showSelected(select, "data-novel-phase-panel"));
    document.querySelectorAll("[data-novel-tool-select]").forEach((select) => showSelected(select, "data-novel-tool-panel"));
    document.querySelectorAll("[data-repeatable-root]").forEach(renderRepeatable);
    document.querySelectorAll("textarea[data-response-id]").forEach(updateWordCount);
    document.querySelectorAll("[data-collection-scope]").forEach(updateProgress);
    updateEssayPreviews();
  };
  document.addEventListener("change", (event) => {
    const track = event.target.closest && event.target.closest("[data-novel-track-select]");
    if (track) setTrack(track.value, true);
    const stage = event.target.closest && event.target.closest("[data-novel-stage-select]");
    if (stage) showSelected(stage, "data-novel-stage-panel");
    const phase = event.target.closest && event.target.closest("[data-novel-phase-select]");
    if (phase) showSelected(phase, "data-novel-phase-panel");
    const tool = event.target.closest && event.target.closest("[data-novel-tool-select]");
    if (tool) showSelected(tool, "data-novel-tool-panel");
    const filter = event.target.closest && event.target.closest("[data-repeatable-filter]");
    if (filter) renderRepeatable(filter.closest("[data-repeatable-root]"));
  });
  document.addEventListener("input", (event) => {
    const field = event.target;
    if (field.matches && field.matches("textarea[data-response-id]")) updateWordCount(field);
    const scope = field.closest && field.closest("[data-collection-scope]");
    if (scope) updateProgress(scope);
    const repeatable = field.closest && field.closest("[data-repeatable-root]");
    if (repeatable && field.hasAttribute && field.hasAttribute("data-repeatable-store")) renderRepeatable(repeatable);
    if (field.getAttribute) updateEssayPreviews(field.getAttribute("data-response-id"));
  });
  document.addEventListener("click", (event) => {
    const button = event.target.closest && event.target.closest("button");
    if (!button) return;
    if (button.hasAttribute("data-novel-toggle-hints")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const module = button.closest(rootSelector);
      const show = button.getAttribute("aria-pressed") !== "true";
      button.setAttribute("aria-pressed", String(show));
      button.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> ' + (show ? "Hide Hints" : "Show Hints");
      module?.querySelectorAll("[data-novel-hint]").forEach((hint) => { hint.hidden = !show; });
      return;
    }
    if (button.hasAttribute("data-novel-print")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      printScope(button);
      return;
    }
    if (button.hasAttribute("data-novel-save-essay-preview")) saveEssayPreview(button);
    if (button.hasAttribute("data-save-profile-collection")) saveCollection(button);
    const repeatable = button.closest("[data-repeatable-root]");
    if (!repeatable) return;
    if (button.hasAttribute("data-repeatable-save")) saveRepeatable(repeatable);
    if (button.hasAttribute("data-repeatable-clear")) clearDraft(repeatable);
    if (button.hasAttribute("data-repeatable-edit")) editRepeatable(repeatable, button.getAttribute("data-repeatable-edit"));
    if (button.hasAttribute("data-repeatable-delete")) deleteRepeatable(repeatable, button.getAttribute("data-repeatable-delete"));
    if (button.hasAttribute("data-repeatable-strongest")) markStrongest(repeatable, button.getAttribute("data-repeatable-strongest"));
    if (button.hasAttribute("data-repeatable-evidence")) {
      const store = repeatable.querySelector("[data-repeatable-store]");
      const item = store && parseStore(store).items.find((candidate) => candidate.id === button.getAttribute("data-repeatable-evidence"));
      if (item) evidenceUpsert(evidenceEntryForItem(repeatable, item), repeatable);
    }
  });
  window.addEventListener("hashchange", () => window.setTimeout(() => {
    const routeId = window.location.hash.replace(/^#/, "");
    const routeTrack = routeId && document.getElementById(routeId)?.querySelector("[data-novel-track-select]");
    if (routeTrack) setTrack(routeTrack.value || routeTrack.options[0]?.value || "", false);
    document.querySelectorAll("[data-collection-scope]").forEach(updateProgress);
    updateEssayPreviews();
  }, 0));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
  window.setTimeout(init, 60);
})();
`;
