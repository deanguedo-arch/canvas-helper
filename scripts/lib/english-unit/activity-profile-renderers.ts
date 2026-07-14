import { safeId } from "./source.js";

export type EnglishActivityProfileKind =
  | "modern-drama"
  | "shakespeare-drama"
  | "novel-study"
  | "film-study";

export type EnglishActivityField = {
  id: string;
  label: string;
  prompt?: string;
  placeholder?: string;
  hint?: string;
  rows?: number;
  type?: "textarea" | "text" | "select" | "checkbox";
  options?: Array<string | { value: string; label: string }>;
  evidenceRole?: "source" | "concept" | "detail" | "connection" | "counterpoint";
};

export type EnglishActivityQuestion = EnglishActivityField & {
  type?: "textarea" | "text" | "select";
};

export type EnglishActivityQuestionSet = {
  id: string;
  title: string;
  subtitle?: string;
  intro?: string;
  locator?: string;
  questions: EnglishActivityQuestion[];
};

export type EnglishEssayStage = {
  id: string;
  title: string;
  focus: string;
  instruction?: string;
  modelLabel?: string;
  model?: string;
  checkpoints?: string[];
  fields: EnglishActivityField[];
};

export type EnglishCriticalEssayProfile = {
  title?: string;
  description: string;
  stages: EnglishEssayStage[];
};

export type EnglishCharacterProfile = {
  id: string;
  name: string;
  description?: string;
  fields?: EnglishActivityField[];
};

export type EnglishMaterialHook = {
  id: string;
  title: string;
  description?: string;
  href?: string;
  actionLabel?: string;
  downloadable?: boolean;
  /** Set false when the provider blocks third-party framing; the browser still exposes a truthful open action. */
  embeddable?: boolean;
  status?: "available" | "access-required" | "needs-review";
};

export type EnglishScenePassage = {
  id: string;
  speaker?: string;
  original: string;
  companion: string;
  note?: string;
};

export type EnglishShakespeareScene = {
  id: string;
  act: number;
  scene: number;
  title: string;
  summary: string;
  focus?: string;
  editorialStatus?: "reviewed" | "needs-editorial";
  sourceHref?: string;
  passages: EnglishScenePassage[];
};

export type EnglishWritingTool = {
  id: string;
  title: string;
  description: string;
  fields: EnglishActivityField[];
  evidenceMode?: "none" | "individual" | "collection";
  evidenceLabel?: string;
};

export type EnglishNovelTrack = {
  id: string;
  title: string;
  author?: string;
};

type EnglishActivityProfileBase = {
  namespace: string;
  courseCode: string;
  unitTitle: string;
  evidenceBankRoute?: string;
};

export type EnglishModernDramaProfile = EnglishActivityProfileBase & {
  kind: "modern-drama";
  playTitle: string;
  materials: EnglishMaterialHook[];
  actQuestionSets: EnglishActivityQuestionSet[];
  characters: EnglishCharacterProfile[];
  characterFields: EnglishActivityField[];
  essay: EnglishCriticalEssayProfile;
};

export type EnglishShakespeareProfile = EnglishActivityProfileBase & {
  kind: "shakespeare-drama";
  playTitle: string;
  scenes: EnglishShakespeareScene[];
  materials: EnglishMaterialHook[];
  actQuestionSets: EnglishActivityQuestionSet[];
  characters: EnglishCharacterProfile[];
  characterFields: EnglishActivityField[];
  writingTools: EnglishWritingTool[];
  essay?: EnglishCriticalEssayProfile;
};

export type EnglishNovelStudyProfile = EnglishActivityProfileBase & {
  kind: "novel-study";
  tracks: EnglishNovelTrack[];
  materials?: EnglishMaterialHook[];
  essay: EnglishCriticalEssayProfile;
  readingGuideFields: EnglishActivityField[];
  majorWorksFields: EnglishActivityField[];
  questionSets: EnglishActivityQuestionSet[];
  writingTools: EnglishWritingTool[];
};

export type EnglishFilmStudyProfile = EnglishActivityProfileBase & {
  kind: "film-study";
  filmSelection: { mode: "pending" } | { mode: "selected"; title: string };
  essay: EnglishCriticalEssayProfile;
  viewingGuideFields: EnglishActivityField[];
  questionSets: EnglishActivityQuestionSet[];
  materials?: EnglishMaterialHook[];
};

export type EnglishActivityProfile =
  | EnglishModernDramaProfile
  | EnglishShakespeareProfile
  | EnglishNovelStudyProfile
  | EnglishFilmStudyProfile;

export type EnglishRenderedActivityPage = {
  id: string;
  label: string;
  icon: string;
  html: string;
};

export type EnglishRenderedActivityProfile = {
  kind: EnglishActivityProfileKind;
  pages: EnglishRenderedActivityPage[];
  /** Approved profile links that the shared Resources surface can organize without re-reading source archives. */
  resourceLinks?: EnglishMaterialHook[];
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeRouteHref(value: string) {
  const trimmed = value.trim();
  if (/^(?:https?:\/\/|#|\.\.?\/|assets\/|resources\/)/i.test(trimmed)) return trimmed;
  return "#";
}

function stableResponseId(namespace: string, ...segments: string[]) {
  return [safeId(namespace, "english-unit"), ...segments.map((segment) => safeId(segment))].join(":");
}

function assertUniqueIds(items: Array<{ id: string }>, label: string) {
  const seen = new Set<string>();
  for (const item of items) {
    const id = safeId(item.id);
    if (seen.has(id)) throw new Error(`Duplicate ${label} id: ${item.id}`);
    seen.add(id);
  }
}

function renderOption(option: string | { value: string; label: string }) {
  const value = typeof option === "string" ? option : option.value;
  const label = typeof option === "string" ? option : option.label;
  return `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
}

function renderResponseControl(field: EnglishActivityField, responseId: string) {
  const evidenceAttribute = field.evidenceRole ? ` data-evidence-draft="${field.evidenceRole}" data-evidence-draft-label="${escapeHtml(field.label)}"` : "";
  const placeholder = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : "";
  if (field.type === "select") {
    return `<select data-response-id="${escapeHtml(responseId)}"${evidenceAttribute}>
      <option value="">Choose...</option>
      ${(field.options ?? []).map(renderOption).join("")}
    </select>`;
  }
  if (field.type === "text") {
    return `<input type="text" data-response-id="${escapeHtml(responseId)}"${evidenceAttribute}${placeholder}>`;
  }
  if (field.type === "checkbox") {
    return `<input type="checkbox" data-response-id="${escapeHtml(responseId)}"${evidenceAttribute}>`;
  }
  return `<textarea rows="${field.rows ?? 5}" data-response-id="${escapeHtml(responseId)}"${evidenceAttribute}${placeholder}></textarea>`;
}

function renderActivityField(input: {
  field: EnglishActivityField;
  responseId: string;
  number: number;
  questionStyle?: boolean;
}) {
  const { field } = input;
  const prompt = field.prompt ?? field.label;
  const checkbox = field.type === "checkbox";
  return `<div class="${input.questionStyle ? "worksheet-question" : "english-activity-field"}" data-activity-response data-evidence-question-number="${input.number}" data-evidence-question-prompt="${escapeHtml(prompt)}">
    ${input.questionStyle ? `<div class="worksheet-question-prompt"><strong>${input.number}.</strong><span>${escapeHtml(prompt)}</span></div>` : ""}
    ${field.hint ? `<div class="worksheet-hint" data-question-hint hidden><strong>Hint:</strong> ${escapeHtml(field.hint)}</div>` : ""}
    <label class="${checkbox ? "english-activity-checkbox" : "worksheet-answer-field"}">
      ${input.questionStyle ? "" : `<span>${escapeHtml(field.label)}</span>`}
      ${field.prompt && !input.questionStyle ? `<span class="english-activity-prompt">${escapeHtml(field.prompt)}</span>` : ""}
      ${renderResponseControl(field, input.responseId)}
      ${field.type !== "select" && field.type !== "checkbox" ? `<span class="worksheet-word-count" data-activity-word-count>0 words</span>` : ""}
    </label>
  </div>`;
}

function renderCollectionAttributes(input: {
  collectionId: string;
  responsePrefix: string;
  source: string;
  concept: string;
  promptLabel?: string;
  detailLabel?: string;
  savedMessage?: string;
  updatedMessage?: string;
}) {
  return `data-response-collection
    data-evidence-collection-id="${escapeHtml(input.collectionId)}"
    data-evidence-response-prefix="${escapeHtml(input.responsePrefix)}"
    data-evidence-source="${escapeHtml(input.source)}"
    data-evidence-concept="${escapeHtml(input.concept)}"
    data-evidence-activity-id="${escapeHtml(input.concept)}"
    data-evidence-activity-title="${escapeHtml(input.concept)}"
    data-evidence-work-title="${escapeHtml(input.source)}"
    data-evidence-entry-type="collection"
    data-evidence-prompt-label="${escapeHtml(input.promptLabel ?? "Activity") }"
    data-evidence-detail-label="${escapeHtml(input.detailLabel ?? "Saved responses") }"
    data-evidence-saved-message="${escapeHtml(input.savedMessage ?? "Saved to Evidence Bank") }"
    data-evidence-updated-message="${escapeHtml(input.updatedMessage ?? "Updated in Evidence Bank") }"`;
}

function renderWorksheetToolbar(input: {
  saveLabel: string;
  includeHints?: boolean;
  collectionStatus?: boolean;
}) {
  return `<div class="worksheet-toolbar">
    <div class="worksheet-save-status">${input.collectionStatus ? `<span data-response-collection-status aria-live="polite"></span>` : ""}</div>
    <div class="worksheet-toolbar-actions">
      ${input.includeHints ? `<button type="button" data-worksheet-toggle-hints aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> Show Hints</button>` : ""}
      <button type="button" data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
      <button class="evidence-bank-save-action" type="button" data-save-response-collection><span class="material-symbols-outlined" aria-hidden="true">library_add</span> ${escapeHtml(input.saveLabel)}</button>
    </div>
  </div>`;
}

function renderPageHeading(courseCode: string, context: string, title: string, description: string) {
  return `<p class="route-kicker">${escapeHtml(courseCode)} | ${escapeHtml(context)}</p>
    <h2 class="route-title">${escapeHtml(title)}</h2>
    <p class="route-description">${escapeHtml(description)}</p>`;
}

function renderPanelPicker(input: {
  namespace: string;
  group: string;
  label: string;
  items: Array<{ id: string; label: string }>;
}) {
  return `<label class="english-activity-picker">${escapeHtml(input.label)}
    <select data-response-id="${escapeHtml(stableResponseId(input.namespace, "selection", input.group))}" data-english-activity-select="${escapeHtml(input.group)}">
      ${input.items.map((item) => `<option value="${escapeHtml(safeId(item.id))}">${escapeHtml(item.label)}</option>`).join("")}
    </select>
  </label>`;
}

function renderQuestionSetPage(input: {
  id: string;
  title: string;
  context: string;
  description: string;
  courseCode: string;
  namespace: string;
  sourceLabel: string;
  sets: EnglishActivityQuestionSet[];
  saveLabel: (set: EnglishActivityQuestionSet) => string;
}) {
  assertUniqueIds(input.sets, `${input.title} question set`);
  const group = stableResponseId(input.namespace, input.id, "sets");
  return `<section id="${escapeHtml(input.id)}" class="course-page english-activity-page" hidden>
    ${renderPageHeading(input.courseCode, input.context, input.title, input.description)}
    ${renderPanelPicker({
      namespace: input.namespace,
      group,
      label: "Choose a question set",
      items: input.sets.map((set) => ({ id: set.id, label: set.title }))
    })}
    <div class="english-activity-panel-stack">
      ${input.sets.map((set, setIndex) => {
        const setId = safeId(set.id);
        const prefix = stableResponseId(input.namespace, input.id, setId);
        return `<article class="worksheet-document english-activity-worksheet question-panel" data-question-panel data-activity-progress data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(setId)}" ${setIndex === 0 ? "" : "hidden"} ${renderCollectionAttributes({
          collectionId: `${prefix}:collection`,
          responsePrefix: `${prefix}:`,
          source: `${input.sourceLabel} | ${set.title}`,
          concept: `${set.title} Question Collection`,
          promptLabel: "Question set",
          savedMessage: `${set.title} saved to Evidence Bank`,
          updatedMessage: `${set.title} updated in Evidence Bank`
        })}>
          ${renderWorksheetToolbar({ saveLabel: input.saveLabel(set), includeHints: true, collectionStatus: true })}
          <header class="worksheet-document-header">
            <p>${escapeHtml(input.courseCode)} Formative Analysis</p>
            <h3>${escapeHtml(set.title)}</h3>
            ${set.subtitle ? `<span>${escapeHtml(set.subtitle)}</span>` : ""}
            ${set.locator ? `<span>${escapeHtml(set.locator)}</span>` : ""}
            <div class="worksheet-progress">
              <div><span>Formative Progress</span><strong data-activity-progress-label>0 of ${set.questions.length} answered</strong></div>
              <div class="worksheet-progress-track"><div data-activity-progress-fill></div></div>
            </div>
          </header>
          ${set.intro ? `<p class="english-activity-intro">${escapeHtml(set.intro)}</p>` : ""}
          <div class="worksheet-questions">
            ${set.questions.map((question, index) => renderActivityField({ field: question, responseId: `${prefix}:${safeId(question.id)}`, number: index + 1, questionStyle: true })).join("")}
          </div>
        </article>`;
      }).join("")}
    </div>
  </section>`;
}

function renderCriticalEssayPage(input: {
  namespace: string;
  courseCode: string;
  context: string;
  sourceLabel: string;
  essay: EnglishCriticalEssayProfile;
  track?: EnglishNovelTrack;
}) {
  assertUniqueIds(input.essay.stages, "critical essay stage");
  const routeId = input.track ? `critical-essay-${safeId(input.track.id)}` : "critical-essay";
  const scopeId = input.track ? safeId(input.track.id) : "unit";
  const group = stableResponseId(input.namespace, routeId, "stages");
  const fullPrefix = stableResponseId(input.namespace, routeId);
  const title = input.essay.title ?? "Critical Analytical Essay";
  return `<section id="${escapeHtml(routeId)}" class="course-page english-activity-page" hidden ${renderCollectionAttributes({
    collectionId: `${fullPrefix}:full-plan`,
    responsePrefix: `${fullPrefix}:`,
    source: input.sourceLabel,
    concept: `${title} Full Plan`,
    promptLabel: "Essay plan",
    savedMessage: "Full essay plan saved to Evidence Bank",
    updatedMessage: "Full essay plan updated in Evidence Bank"
  })}>
    ${renderPageHeading(input.courseCode, input.context, title, input.essay.description)}
    ${renderPanelPicker({
      namespace: input.namespace,
      group,
      label: "Choose a writing stage",
      items: input.essay.stages.map((stage) => ({ id: stage.id, label: stage.title }))
    })}
    <div class="english-activity-panel-stack">
      ${input.essay.stages.map((stage, stageIndex) => {
        const stageId = safeId(stage.id);
        const prefix = `${fullPrefix}:${scopeId}:${stageId}`;
        return `<article class="critical-writing-panel english-activity-worksheet" data-writing-activity-panel data-activity-progress data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(stageId)}" ${stageIndex === 0 ? "" : "hidden"} ${renderCollectionAttributes({
          collectionId: `${prefix}:collection`,
          responsePrefix: `${prefix}:`,
          source: input.sourceLabel,
          concept: `${stage.title} Writing Stage`,
          promptLabel: "Writing stage",
          savedMessage: `${stage.title} saved to Evidence Bank`,
          updatedMessage: `${stage.title} updated in Evidence Bank`
        })}>
          ${renderWorksheetToolbar({ saveLabel: "Save Stage to Evidence Bank", includeHints: true, collectionStatus: true })}
          <header class="critical-writing-header">
            <h3>${escapeHtml(stage.title)}</h3>
            <p>${escapeHtml(stage.focus)}</p>
          </header>
          ${stage.checkpoints?.length ? `<section class="unit-outcomes" aria-label="Success criteria"><h4>I can...</h4><ul>${stage.checkpoints.map((checkpoint) => `<li>${escapeHtml(checkpoint)}</li>`).join("")}</ul></section>` : ""}
          ${stage.instruction ? `<section class="critical-writing-lesson"><h4>Writing move</h4><p>${escapeHtml(stage.instruction)}</p></section>` : ""}
          ${stage.model ? `<section class="critical-model-block"><strong>${escapeHtml(stage.modelLabel ?? "Model")}</strong><p>${escapeHtml(stage.model)}</p></section>` : ""}
          <div class="critical-field-grid">
            ${stage.fields.map((field, fieldIndex) => renderActivityField({ field, responseId: `${prefix}:${safeId(field.id)}`, number: fieldIndex + 1 })).join("")}
          </div>
        </article>`;
      }).join("")}
    </div>
    <div class="english-activity-final-actions">
      <button type="button" data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
      <button class="evidence-bank-save-action" type="button" data-save-response-collection><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save Full Essay Plan</button>
      <span data-response-collection-status aria-live="polite"></span>
    </div>
  </section>`;
}

function renderMaterialsPage(input: {
  id: string;
  namespace: string;
  courseCode: string;
  context: string;
  title: string;
  description: string;
  materials: EnglishMaterialHook[];
}) {
  assertUniqueIds(input.materials, "material");
  return `<section id="${escapeHtml(input.id)}" class="course-page english-activity-page" hidden data-activity-materials-hook="${escapeHtml(input.namespace)}">
    ${renderPageHeading(input.courseCode, input.context, input.title, input.description)}
    <div class="english-material-list">
      ${input.materials.length ? input.materials.map((material) => `<article class="english-material-item" data-material-id="${escapeHtml(safeId(material.id))}" data-material-status="${escapeHtml(material.status ?? "available")}">
        <div><h3>${escapeHtml(material.title)}</h3>${material.description ? `<p>${escapeHtml(material.description)}</p>` : ""}</div>
        ${material.href ? `<a href="${escapeHtml(safeRouteHref(material.href))}" target="_blank" rel="noopener noreferrer"${material.downloadable ? " download" : ""}>${escapeHtml(material.actionLabel ?? (material.downloadable ? "Open / Download" : "Open Resource"))}</a>` : `<p class="english-material-access-note">${material.status === "needs-review" ? "This resource requires editorial review before publication." : "Use the teacher-provided or school-licensed copy of this text."}</p>`}
      </article>`).join("") : `<p class="english-material-access-note">No learner-facing materials have been approved for this surface yet.</p>`}
    </div>
  </section>`;
}

function renderCharacterNotesPage(input: {
  namespace: string;
  courseCode: string;
  context: string;
  title: string;
  sourceLabel: string;
  characters: EnglishCharacterProfile[];
  sharedFields: EnglishActivityField[];
  quotationLabel: string;
}) {
  assertUniqueIds(input.characters, "character");
  const group = stableResponseId(input.namespace, "character-notes", "characters");
  return `<section id="character-notes" class="course-page english-activity-page" hidden>
    ${renderPageHeading(input.courseCode, input.context, input.title, "Build one evidence-rich dossier at a time. Each dossier autosaves and can be updated in the Evidence Bank.")}
    ${renderPanelPicker({ namespace: input.namespace, group, label: "Choose a character", items: input.characters.map((character) => ({ id: character.id, label: character.name })) })}
    <div class="english-activity-panel-stack">
      ${input.characters.map((character, characterIndex) => {
        const characterId = safeId(character.id);
        const fields = character.fields?.length ? character.fields : input.sharedFields;
        const prefix = stableResponseId(input.namespace, "character-notes", characterId);
        return `<article class="worksheet-document english-activity-worksheet" data-writing-activity-panel data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(characterId)}" ${characterIndex === 0 ? "" : "hidden"} ${renderCollectionAttributes({
          collectionId: `${prefix}:dossier`,
          responsePrefix: `${prefix}:`,
          source: input.sourceLabel,
          concept: `${character.name} Character Dossier`,
          promptLabel: "Character dossier",
          savedMessage: `${character.name} dossier saved to Evidence Bank`,
          updatedMessage: `${character.name} dossier updated in Evidence Bank`
        })}>
          ${renderWorksheetToolbar({ saveLabel: "Save Dossier to Evidence Bank", includeHints: true, collectionStatus: true })}
          <header class="worksheet-document-header"><p>${escapeHtml(input.courseCode)} Character Study</p><h3>${escapeHtml(character.name)}</h3>${character.description ? `<span>${escapeHtml(character.description)}</span>` : ""}</header>
          <div class="critical-field-grid">${fields.map((field, index) => renderActivityField({ field, responseId: `${prefix}:${safeId(field.id)}`, number: index + 1 })).join("")}</div>
          <section class="english-evidence-capture" data-evidence-notebook-panel data-evidence-contribution-id="${escapeHtml(`${prefix}:quotation`)}">
            <h4>${escapeHtml(input.quotationLabel)}</h4>
            <select class="english-activity-hidden-select" data-evidence-draft="source" aria-hidden="true" tabindex="-1"><option>${escapeHtml(`${input.sourceLabel} | ${character.name}`)}</option></select>
            <select class="english-activity-hidden-select" data-evidence-draft="concept" aria-hidden="true" tabindex="-1"><option>${escapeHtml(`${character.name} Quotation`)}</option></select>
            <label>Quotation, action, or precise moment<textarea rows="4" data-response-id="${escapeHtml(`${prefix}:quotation:detail`)}" data-evidence-draft="detail" placeholder="Record the exact evidence and its act, scene, or page location."></textarea></label>
            <label>What it reveals<textarea rows="4" data-response-id="${escapeHtml(`${prefix}:quotation:connection`)}" data-evidence-draft="connection" placeholder="Explain how this evidence develops the character, conflict, or larger idea."></textarea></label>
            <div class="english-evidence-actions"><button class="evidence-bank-save-action" type="button" data-save-evidence-note><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save Quotation to Evidence Bank</button><span data-save-status aria-live="polite">Draft saves automatically</span></div>
          </section>
        </article>`;
      }).join("")}
    </div>
  </section>`;
}

function renderEvidenceForm(input: {
  namespace: string;
  surface: string;
  sourceLabel: string;
  conceptLabel: string;
  fields: EnglishActivityField[];
  saveLabel: string;
  contributionId?: string;
}) {
  const prefix = stableResponseId(input.namespace, input.surface, input.contributionId ?? "draft");
  const hasSourceField = input.fields.some((field) => field.evidenceRole === "source");
  const hasConceptField = input.fields.some((field) => field.evidenceRole === "concept");
  return `<section class="english-evidence-capture" data-writing-activity-panel data-evidence-notebook-panel data-evidence-contribution-id="${escapeHtml(input.contributionId ?? prefix)}">
    ${hasSourceField ? "" : `<select class="english-activity-hidden-select" data-evidence-draft="source" aria-hidden="true" tabindex="-1"><option>${escapeHtml(input.sourceLabel)}</option></select>`}
    ${hasConceptField ? "" : `<select class="english-activity-hidden-select" data-evidence-draft="concept" aria-hidden="true" tabindex="-1"><option>${escapeHtml(input.conceptLabel)}</option></select>`}
    <div class="critical-field-grid">
      ${input.fields.map((field, index) => renderActivityField({ field, responseId: `${prefix}:${safeId(field.id)}`, number: index + 1 })).join("")}
    </div>
    <div class="english-evidence-actions">
      <button class="evidence-bank-save-action" type="button" data-save-evidence-note><span class="material-symbols-outlined" aria-hidden="true">library_add</span> ${escapeHtml(input.saveLabel)}</button>
      <span data-save-status aria-live="polite">Draft saves automatically</span>
    </div>
  </section>`;
}

function renderShakespeareReader(profile: EnglishShakespeareProfile) {
  assertUniqueIds(profile.scenes, "Shakespeare scene");
  const group = stableResponseId(profile.namespace, "side-by-side", "scenes");
  return `<section id="side-by-side" class="course-page english-activity-page" hidden>
    ${renderPageHeading(profile.courseCode, profile.playTitle, "Side-by-Side Reader", "Compare the public-domain original with the locally reviewed plain-language companion, then capture scene evidence.")}
    ${renderPanelPicker({ namespace: profile.namespace, group, label: "Choose a scene", items: profile.scenes.map((scene) => ({ id: scene.id, label: `Act ${scene.act}, Scene ${scene.scene} - ${scene.title}` })) })}
    <div class="english-activity-panel-stack">
      ${profile.scenes.map((scene, sceneIndex) => {
        const sceneId = safeId(scene.id);
        return `<article class="parallel-reading-panel" data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(sceneId)}" ${sceneIndex === 0 ? "" : "hidden"}>
          <header class="parallel-reading-header"><div><p>Act ${scene.act}, Scene ${scene.scene}</p><h3>${escapeHtml(scene.title)}</h3><p>${escapeHtml(scene.summary)}</p></div><span class="english-editorial-status" data-editorial-status="${escapeHtml(scene.editorialStatus ?? "needs-editorial")}">${scene.editorialStatus === "reviewed" ? "Companion reviewed" : "Companion needs editorial review"}</span></header>
          ${scene.focus ? `<section class="parallel-reading-focus"><h4>What to watch</h4><p>${escapeHtml(scene.focus)}</p></section>` : ""}
          <div class="parallel-reading-table" role="table" aria-label="Original and plain-language scene comparison">
            <div class="parallel-reading-row parallel-reading-label-row" role="row"><strong role="columnheader">Original text</strong><strong role="columnheader">Plain-language companion</strong></div>
            ${scene.passages.map((passage) => `<div class="parallel-reading-row" role="row" data-scene-passage="${escapeHtml(safeId(passage.id))}"><div role="cell">${passage.speaker ? `<strong>${escapeHtml(passage.speaker)}</strong>` : ""}<p>${escapeHtml(passage.original)}</p></div><div role="cell"><p>${escapeHtml(passage.companion)}</p>${passage.note ? `<p class="parallel-reading-note">${escapeHtml(passage.note)}</p>` : ""}</div></div>`).join("")}
          </div>
          ${scene.sourceHref ? `<p><a href="${escapeHtml(safeRouteHref(scene.sourceHref))}" target="_blank" rel="noopener noreferrer">Open the complete public-domain scene</a></p>` : ""}
          ${renderEvidenceForm({
            namespace: profile.namespace,
            surface: "side-by-side",
            sourceLabel: `${profile.playTitle} | Act ${scene.act}, Scene ${scene.scene}`,
            conceptLabel: "Close Reading Annotation",
            contributionId: stableResponseId(profile.namespace, "side-by-side", scene.id, "evidence"),
            saveLabel: "Save Scene Evidence to Evidence Bank",
            fields: [
              { id: "passage", label: "Anchor line or passage", placeholder: "Choose an anchor line above or record another precise passage.", evidenceRole: "detail" },
              { id: "interpretation", label: "Interpretation", placeholder: "Explain how Shakespeare's language, structure, or dramatic choice develops meaning.", evidenceRole: "connection" }
            ]
          })}
        </article>`;
      }).join("")}
    </div>
  </section>`;
}

function renderWritingToolsPage(input: {
  namespace: string;
  courseCode: string;
  context: string;
  title: string;
  sourceLabel: string;
  tools: EnglishWritingTool[];
}) {
  assertUniqueIds(input.tools, "writing tool");
  const group = stableResponseId(input.namespace, "writing-studio", "tools");
  return `<section id="writing-studio" class="course-page english-activity-page" hidden>
    ${renderPageHeading(input.courseCode, input.context, input.title, "Move from reading or viewing evidence to a controlled analytical response. Every field autosaves.")}
    ${renderPanelPicker({ namespace: input.namespace, group, label: "Choose a writing activity", items: input.tools.map((tool) => ({ id: tool.id, label: tool.title })) })}
    <div class="english-activity-panel-stack">
      ${input.tools.map((tool, toolIndex) => {
        const toolId = safeId(tool.id);
        const prefix = stableResponseId(input.namespace, "writing-studio", toolId);
        const collection = tool.evidenceMode === "collection";
        const wrapperAttributes = collection ? renderCollectionAttributes({
          collectionId: `${prefix}:collection`,
          responsePrefix: `${prefix}:`,
          source: input.sourceLabel,
          concept: tool.title,
          promptLabel: "Writing activity",
          savedMessage: `${tool.title} saved to Evidence Bank`,
          updatedMessage: `${tool.title} updated in Evidence Bank`
        }) : "";
        const hasEvidenceSource = tool.fields.some((field) => field.evidenceRole === "source");
        const hasEvidenceConcept = tool.fields.some((field) => field.evidenceRole === "concept");
        return `<article class="writing-activity-panel english-activity-worksheet" data-writing-activity-panel data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(toolId)}" ${toolIndex === 0 ? "" : "hidden"} ${wrapperAttributes} ${tool.evidenceMode === "individual" ? `data-evidence-notebook-panel data-evidence-contribution-id="${escapeHtml(`${prefix}:entry`)}"` : ""}>
          <header class="writing-activity-header"><h3>${escapeHtml(tool.title)}</h3><p>${escapeHtml(tool.description)}</p></header>
          ${tool.evidenceMode === "individual" ? `${hasEvidenceSource ? "" : `<select class="english-activity-hidden-select" data-evidence-draft="source" aria-hidden="true" tabindex="-1"><option>${escapeHtml(input.sourceLabel)}</option></select>`}${hasEvidenceConcept ? "" : `<select class="english-activity-hidden-select" data-evidence-draft="concept" aria-hidden="true" tabindex="-1"><option>${escapeHtml(tool.title)}</option></select>`}` : ""}
          <div class="critical-field-grid">${tool.fields.map((field, index) => renderActivityField({ field, responseId: `${prefix}:${safeId(field.id)}`, number: index + 1 })).join("")}</div>
          <div class="english-activity-final-actions">
            <button type="button" data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
            ${tool.evidenceMode === "collection" ? `<button class="evidence-bank-save-action" type="button" data-save-response-collection><span class="material-symbols-outlined" aria-hidden="true">library_add</span> ${escapeHtml(tool.evidenceLabel ?? "Save Activity to Evidence Bank")}</button><span data-response-collection-status aria-live="polite"></span>` : tool.evidenceMode === "individual" ? `<button class="evidence-bank-save-action" type="button" data-save-evidence-note><span class="material-symbols-outlined" aria-hidden="true">library_add</span> ${escapeHtml(tool.evidenceLabel ?? "Save to Evidence Bank")}</button><span data-save-status aria-live="polite">Draft saves automatically</span>` : `<span>Responses save automatically</span>`}
          </div>
        </article>`;
      }).join("")}
    </div>
  </section>`;
}

function renderShakespeareMaterialsPage(profile: EnglishShakespeareProfile) {
  assertUniqueIds(profile.materials, "Shakespeare material");
  const group = stableResponseId(profile.namespace, "materials", "documents");
  const selectedId = safeId(profile.materials[0]?.id ?? "access");
  const canEmbed = (material: EnglishMaterialHook) => Boolean(material.href && material.embeddable !== false && !/\.(?:docx?|pptx?|xlsx?)(?:[?#].*)?$/i.test(material.href));
  return `<section id="play-materials" class="course-page english-activity-page shakespeare-profile-page shakespeare-materials-page" hidden data-activity-materials-hook="${escapeHtml(profile.namespace)}">
    ${renderPageHeading(profile.courseCode, profile.playTitle, `${profile.playTitle} Materials`, "Select the original text, an act-question source, motif work, or another teacher resource and keep it open beside your course work.")}
    <select class="english-activity-hidden-select" aria-label="Selected ${escapeHtml(profile.playTitle)} material" data-response-id="${escapeHtml(stableResponseId(profile.namespace, "selection", "materials"))}" data-english-activity-select="${escapeHtml(group)}" data-shakespeare-select-input="${escapeHtml(group)}">
      ${profile.materials.map((material) => `<option value="${escapeHtml(safeId(material.id))}">${escapeHtml(material.title)}</option>`).join("")}
    </select>
    <div class="library-browser story-bank-browser shakespeare-document-browser">
      <aside class="library-list-panel">
        <h3>${escapeHtml(profile.playTitle)} Files</h3>
        <p>Select a support file or live reading source to open in the reader.</p>
        <div class="library-doc-list">
          ${profile.materials.map((material, index) => {
            const materialId = safeId(material.id);
            return `<button class="library-doc-tab${index === 0 ? " active" : ""}" type="button" data-shakespeare-panel-select="${escapeHtml(materialId)}" data-shakespeare-select-for="${escapeHtml(group)}" aria-pressed="${index === 0 ? "true" : "false"}">
              <span class="library-doc-index">${index + 1}</span>
              <span><strong>${escapeHtml(material.title)}</strong><small>${escapeHtml(material.description ?? "Teacher-selected Macbeth resource.")}</small></span>
            </button>`;
          }).join("")}
        </div>
      </aside>
      <div class="library-reader-panel">
        ${profile.materials.map((material, index) => {
          const materialId = safeId(material.id);
          const href = material.href ? safeRouteHref(material.href) : "";
          const embeddable = canEmbed(material);
          return `<section data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(materialId)}" ${index === 0 ? "" : "hidden"}>
            <div class="library-reader-header">
              <div><h3>${escapeHtml(material.title)}</h3><p>${escapeHtml(material.description ?? "Teacher-selected Macbeth resource.")}</p></div>
              ${href ? `<div class="library-actions">
                <button class="library-action-button" type="button" data-shakespeare-open-src="${escapeHtml(href)}">${escapeHtml(material.actionLabel ?? (material.downloadable ? "Open" : "Open Source"))}</button>
                ${embeddable ? `<button class="library-action-button" type="button" data-shakespeare-fullscreen-src="${escapeHtml(href)}" data-shakespeare-fullscreen-title="${escapeHtml(material.title)}">Full Screen</button>` : ""}
                ${material.downloadable ? `<button class="library-action-button" type="button" data-shakespeare-download-src="${escapeHtml(href)}">Download</button>` : ""}
              </div>` : ""}
            </div>
            ${href && embeddable ? `<iframe class="library-document-frame" src="${escapeHtml(href)}" title="${escapeHtml(material.title)}" loading="lazy"></iframe>` : href ? `<div class="library-file-fallback"><p>This file opens in its native application or a new browser tab.</p><a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">Open ${escapeHtml(material.title)}</a></div>` : `<p class="english-material-access-note">${material.status === "needs-review" ? "This resource requires editorial review before publication." : "Use the teacher-provided or school-licensed copy of this text."}</p>`}
          </section>`;
        }).join("") || `<p class="english-material-access-note">No learner-facing materials have been approved for this surface yet.</p>`}
      </div>
    </div>
    <div class="shakespeare-reader-overlay" data-shakespeare-reader-overlay hidden>
      <div class="shakespeare-reader-dialog" role="dialog" aria-modal="true" aria-labelledby="shakespeare-reader-title">
        <div class="shakespeare-reader-bar"><h3 id="shakespeare-reader-title" data-shakespeare-reader-title>${escapeHtml(profile.materials.find((material) => safeId(material.id) === selectedId)?.title ?? `${profile.playTitle} Material`)}</h3><button type="button" data-shakespeare-reader-close aria-label="Close full-screen reader"><span class="material-symbols-outlined" aria-hidden="true">close</span></button></div>
        <iframe class="shakespeare-reader-frame" data-shakespeare-reader-frame title="Full-screen ${escapeHtml(profile.playTitle)} material"></iframe>
      </div>
    </div>
  </section>`;
}

function questionScene(question: EnglishActivityQuestion) {
  const text = `${question.prompt ?? ""} ${question.label}`;
  const match = text.match(/Act\s+(\d+)\s*,?\s*Scene\s+(\d+)/i);
  return match ? { act: Number(match[1]), scene: Number(match[2]) } : null;
}

function renderShakespeareQuestionWorkbench(profile: EnglishShakespeareProfile) {
  assertUniqueIds(profile.actQuestionSets, `${profile.playTitle} act question set`);
  const actGroup = stableResponseId(profile.namespace, "act-questions", "sets");
  return `<section id="act-questions" class="course-page english-activity-page shakespeare-profile-page shakespeare-questions-page" hidden>
    ${renderPageHeading(profile.courseCode, profile.playTitle, `${profile.playTitle} Act Questions`, "Choose an act, move scene by scene, and use the teacher questions to build one saved Evidence Bank collection for the complete act.")}
    <div class="shakespeare-workbench-picker">
      <div><strong>Choose an act</strong><p>Each act opens the same scene-checkpoint routine: summarize, notice an anchor line, answer the supplied questions, and select evidence worth keeping.</p></div>
      ${renderPanelPicker({ namespace: profile.namespace, group: actGroup, label: "Act question set", items: profile.actQuestionSets.map((set) => ({ id: set.id, label: set.title })) })}
    </div>
    <div class="english-activity-panel-stack">
      ${profile.actQuestionSets.map((set, setIndex) => {
        const setId = safeId(set.id);
        const prefix = stableResponseId(profile.namespace, "act-questions", setId);
        const grouped = new Map<number, EnglishActivityQuestion[]>();
        set.questions.forEach((question) => {
          const locator = questionScene(question);
          const key = locator?.scene ?? 0;
          grouped.set(key, [...(grouped.get(key) ?? []), question]);
        });
        const scenes = [...grouped.entries()].sort(([left], [right]) => left - right);
        const actNumber = Number(set.id.match(/\d+/)?.[0] ?? questionScene(set.questions[0] ?? { id: "", label: "" })?.act ?? setIndex + 1);
        const sceneGroup = stableResponseId(profile.namespace, "act-questions", setId, "scenes");
        return `<article class="worksheet-document english-activity-worksheet shakespeare-question-workbench" data-question-panel data-activity-progress data-english-activity-panel-group="${escapeHtml(actGroup)}" data-english-activity-panel="${escapeHtml(setId)}" ${setIndex === 0 ? "" : "hidden"} ${renderCollectionAttributes({
          collectionId: `${prefix}:collection`,
          responsePrefix: `${prefix}:`,
          source: `${profile.playTitle} Act Questions | ${set.title}`,
          concept: `${set.title} Question Collection`,
          promptLabel: "Act question set",
          savedMessage: `${set.title} saved to Evidence Bank`,
          updatedMessage: `${set.title} updated in Evidence Bank`
        })}>
          ${renderWorksheetToolbar({ saveLabel: "Save Act Answers to Evidence Bank", includeHints: true, collectionStatus: true })}
          <header class="worksheet-document-header scene-checkpoint-heading"><div><p>${escapeHtml(profile.courseCode)} Critical Analysis</p><h3>${escapeHtml(`${profile.playTitle} ${set.title} Scene Checkpoints`)}</h3><span>Use precise stage action, language, and recurring imagery as you answer the supplied questions.</span></div><strong class="scene-checkpoint-count">${scenes.length} ${scenes.length === 1 ? "scene" : "scenes"}</strong></header>
          <div class="scene-checkpoint-body">
            ${scenes.length > 1 ? renderPanelPicker({ namespace: profile.namespace, group: sceneGroup, label: "Choose a scene", items: scenes.map(([scene]) => ({ id: `scene-${scene}`, label: scene ? `Act ${actNumber}, Scene ${scene}` : `${set.title} overview` })) }) : ""}
            <div class="scene-checkpoint-list">
              ${scenes.map(([sceneNumber, questions], sceneIndex) => {
                const sceneId = `scene-${sceneNumber}`;
                const scene = profile.scenes.find((candidate) => candidate.act === actNumber && candidate.scene === sceneNumber);
                const scenePrefix = `${prefix}:${sceneId}`;
                const anchor = scene?.passages[0];
                return `<section class="scene-checkpoint-card" data-english-activity-panel-group="${escapeHtml(sceneGroup)}" data-english-activity-panel="${escapeHtml(sceneId)}" ${sceneIndex === 0 ? "" : "hidden"}>
                  <div class="scene-checkpoint-title"><p>Act ${actNumber}, Scene ${sceneNumber || "Overview"}</p><h4>${escapeHtml(scene?.title ?? set.title)}</h4>${scene?.summary ? `<span>${escapeHtml(scene.summary)}</span>` : ""}</div>
                  ${renderActivityField({ field: { id: "summary", label: "Scene summary", prompt: "Summarize the scene's central action and pressure in your own words.", hint: "Name what changes by the end of the scene rather than listing every event.", rows: 4, placeholder: "What changes in this scene, and why does it matter?" }, responseId: `${scenePrefix}:summary`, number: 1, questionStyle: true })}
                  ${anchor ? `<blockquote class="scene-key-quote"><span>${escapeHtml(anchor.speaker ?? "Anchor line")}</span><p>${escapeHtml(anchor.original)}</p></blockquote>` : ""}
                  <section class="scene-supplied-questions"><h5>Teacher questions</h5><div class="shakespeare-scene-question-grid">${questions.map((question, index) => renderActivityField({ field: question, responseId: `${prefix}:${safeId(question.id)}`, number: index + 2, questionStyle: true })).join("")}</div></section>
                  <div class="scene-checkpoint-two-column">
                    ${renderActivityField({ field: { id: "mood", label: "Mood and dramatic effect", prompt: "What mood dominates this scene, and which choice creates it?", hint: "Consider diction, imagery, rhythm, entrances, exits, staging, and what the audience knows.", rows: 4, placeholder: "Name the mood and connect it to a precise dramatic choice." }, responseId: `${scenePrefix}:mood`, number: questions.length + 2, questionStyle: true })}
                    ${renderActivityField({ field: { id: "turning-point", label: "Character or theme checkpoint", prompt: "What important change in character, conflict, or theme becomes visible here?", hint: "Connect the scene to ambition, appearance and reality, fate and choice, guilt, leadership, loyalty, or violence.", rows: 4, placeholder: "Explain the scene's larger contribution to the play." }, responseId: `${scenePrefix}:turning-point`, number: questions.length + 3, questionStyle: true })}
                  </div>
                  <section class="english-evidence-capture scene-evidence-capture" data-writing-activity-panel data-evidence-notebook-panel data-evidence-contribution-id="${escapeHtml(`${scenePrefix}:evidence`)}">
                    <select class="english-activity-hidden-select" data-evidence-draft="source" aria-hidden="true" tabindex="-1"><option>${escapeHtml(`${profile.playTitle} | Act ${actNumber}, Scene ${sceneNumber}`)}</option></select>
                    <select class="english-activity-hidden-select" data-evidence-draft="concept" aria-hidden="true" tabindex="-1"><option>Scene Checkpoint</option></select>
                    <div class="scene-checkpoint-two-column">
                      ${renderActivityField({ field: { id: "evidence-detail", label: "Evidence worth keeping", prompt: "Record one exact line, stage action, or recurring image from this scene.", rows: 4, placeholder: "Include an act, scene, and line locator when available.", evidenceRole: "detail" }, responseId: `${scenePrefix}:evidence-detail`, number: questions.length + 4 })}
                      ${renderActivityField({ field: { id: "evidence-analysis", label: "Why it matters", prompt: "Explain what the evidence reveals and how it could support later writing.", rows: 4, placeholder: "Connect the evidence to character, conflict, language, or theme.", evidenceRole: "connection" }, responseId: `${scenePrefix}:evidence-analysis`, number: questions.length + 5 })}
                    </div>
                    <div class="english-evidence-actions"><button class="evidence-bank-save-action" type="button" data-save-evidence-note><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save Scene Checkpoint to Evidence Bank</button><span data-save-status aria-live="polite">Draft saves automatically</span></div>
                  </section>
                </section>`;
              }).join("")}
            </div>
          </div>
        </article>`;
      }).join("")}
    </div>
  </section>`;
}

const SHAKESPEARE_CHARACTER_ACCENTS = ["#2d5b4f", "#6a4a36", "#4e667b", "#6d5263", "#7b6a4c", "#5d526f"];

function renderDossierFieldCard(field: EnglishActivityField, responseId: string, number: number, focus = false) {
  return `<section class="${focus ? "character-dossier-focus" : "character-dossier-card"}" data-activity-response data-evidence-question-number="${number}" data-evidence-question-prompt="${escapeHtml(field.prompt ?? field.label)}">
    <label class="character-dossier-field"><span>${escapeHtml(field.label)}</span>${field.prompt ? `<small>${escapeHtml(field.prompt)}</small>` : ""}${field.hint ? `<small class="worksheet-hint" data-question-hint hidden><strong>Hint:</strong> ${escapeHtml(field.hint)}</small>` : ""}${renderResponseControl(field, responseId)}${field.type !== "select" && field.type !== "checkbox" ? `<small class="worksheet-word-count" data-activity-word-count>0 words</small>` : ""}</label>
  </section>`;
}

function renderShakespeareCharacterDossiers(profile: EnglishShakespeareProfile) {
  assertUniqueIds(profile.characters, "Shakespeare character");
  const group = stableResponseId(profile.namespace, "character-notes", "characters");
  return `<section id="character-notes" class="course-page english-activity-page shakespeare-profile-page shakespeare-character-page" hidden>
    ${renderPageHeading(profile.courseCode, profile.playTitle, `${profile.playTitle} Character Notes`, "Track first impressions, public image, tragic pressure, foil relationships, thematic function, act-by-act change, and reusable quotations.")}
    <div class="character-dossier-studio" data-shakespeare-character-studio style="--character-accent:${SHAKESPEARE_CHARACTER_ACCENTS[0]};--character-accent-rgb:45,91,79">
      <select class="english-activity-hidden-select" aria-label="Selected character dossier" data-response-id="${escapeHtml(stableResponseId(profile.namespace, "selection", "character-dossier"))}" data-english-activity-select="${escapeHtml(group)}" data-shakespeare-select-input="${escapeHtml(group)}">
        ${profile.characters.map((character) => `<option value="${escapeHtml(safeId(character.id))}">${escapeHtml(character.name)}</option>`).join("")}
      </select>
      <div class="character-dossier-shell">
        <aside class="character-dossier-nav" aria-label="Choose a character dossier">
          <div class="character-dossier-nav-copy"><h3>Character Dossiers</h3><p>Build one evidence-rich profile at a time. Working notes save automatically.</p></div>
          <div class="character-dossier-nav-list">
            ${profile.characters.map((character, index) => {
              const id = safeId(character.id);
              return `<button type="button" class="character-dossier-target${index === 0 ? " active" : ""}" data-shakespeare-panel-select="${escapeHtml(id)}" data-shakespeare-select-for="${escapeHtml(group)}" data-character-accent="${SHAKESPEARE_CHARACTER_ACCENTS[index % SHAKESPEARE_CHARACTER_ACCENTS.length]}" aria-pressed="${index === 0 ? "true" : "false"}"><div class="character-dossier-target-copy"><strong>${escapeHtml(character.name)}</strong><span data-character-progress-label="${escapeHtml(id)}">0% complete</span></div><div class="character-dossier-target-meter" aria-hidden="true"><div data-character-progress-bar="${escapeHtml(id)}"></div></div></button>`;
            }).join("")}
          </div>
          <div class="character-dossier-nav-actions"><button type="button" data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button><button type="button" class="is-secondary" data-shakespeare-character-reset>Reset active dossier</button></div>
        </aside>
        <div class="english-activity-panel-stack">
          ${profile.characters.map((character, characterIndex) => {
            const characterId = safeId(character.id);
            const fields = character.fields?.length ? character.fields : profile.characterFields;
            const prefix = stableResponseId(profile.namespace, "character-notes", characterId);
            const focusField = fields.find((field) => /thematic|critical role/i.test(`${field.id} ${field.label}`));
            const gridFields = fields.filter((field) => field !== focusField);
            return `<article class="worksheet-document english-activity-worksheet character-dossier-document" data-character-dossier-panel="${escapeHtml(characterId)}" data-writing-activity-panel data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(characterId)}" ${characterIndex === 0 ? "" : "hidden"} ${renderCollectionAttributes({ collectionId: `${prefix}:dossier`, responsePrefix: `${prefix}:`, source: `${profile.playTitle} | Character Notes`, concept: `${character.name} Character Dossier`, promptLabel: "Character dossier", savedMessage: `${character.name} dossier saved to Evidence Bank`, updatedMessage: `${character.name} dossier updated in Evidence Bank` })}>
              <header class="worksheet-document-header character-dossier-heading"><div class="character-dossier-heading-copy"><p>${escapeHtml(profile.courseCode)} Character Study</p><h3>${escapeHtml(character.name)}</h3><span>${escapeHtml(character.description ?? `Track first impressions, public image, tragic pressure, thematic function, and textual evidence for ${character.name}.`)}</span></div><div class="character-dossier-progress-badge"><strong data-character-panel-progress>0%</strong><span>complete</span></div></header>
              <div class="character-dossier-body"><div class="character-dossier-grid">${gridFields.map((field, fieldIndex) => renderDossierFieldCard(field, `${prefix}:${safeId(field.id)}`, fieldIndex + 1)).join("")}</div>${focusField ? renderDossierFieldCard(focusField, `${prefix}:${safeId(focusField.id)}`, gridFields.length + 1, true) : ""}
                <section class="character-dossier-card character-dossier-section english-evidence-capture" data-evidence-notebook-panel data-evidence-contribution-id="${escapeHtml(`${prefix}:quotation`)}"><div class="character-dossier-section-heading"><div><h4>Quotation bank</h4><p>Save one especially useful line without removing it from the working dossier.</p></div></div><select class="english-activity-hidden-select" data-evidence-draft="source" aria-hidden="true" tabindex="-1"><option>${escapeHtml(`${profile.playTitle} | ${character.name}`)}</option></select><select class="english-activity-hidden-select" data-evidence-draft="concept" aria-hidden="true" tabindex="-1"><option>${escapeHtml(`${character.name} Quotation`)}</option></select><div class="character-dossier-quote-grid"><label class="character-dossier-field"><span>Quotation and locator</span><textarea rows="4" data-response-id="${escapeHtml(`${prefix}:quotation:detail`)}" data-evidence-draft="detail" placeholder="Record the exact line and its act, scene, and line location."></textarea></label><label class="character-dossier-field"><span>Analysis and significance</span><textarea rows="4" data-response-id="${escapeHtml(`${prefix}:quotation:connection`)}" data-evidence-draft="connection" placeholder="Explain what the line reveals about motive, flaw, power, relationships, or change."></textarea></label></div><div class="english-evidence-actions"><button class="evidence-bank-save-action" type="button" data-save-evidence-note><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save Quotation to Evidence Bank</button><span data-save-status aria-live="polite">Draft saves automatically</span></div></section>
              </div>
              <div class="english-activity-final-actions"><button type="button" data-worksheet-toggle-hints aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> Show Hints</button><button class="evidence-bank-save-action" type="button" data-save-response-collection><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save Dossier to Evidence Bank</button><span data-response-collection-status aria-live="polite"></span></div>
            </article>`;
          }).join("")}
        </div>
      </div>
    </div>
  </section>`;
}

const SHAKESPEARE_LANGUAGE_PAIRS = [
  ["wherefore", "why"], ["anon", "soon"], ["hath", "has"], ["doth", "does"], ["thee", "you as the object"], ["thou", "you as the subject"],
  ["thy", "your"], ["art", "are"], ["ere", "before"], ["hence", "away or from here"], ["prithee", "please"], ["alas", "an expression of sorrow"]
] as const;

function renderShakespeareLanguageLab(namespace: string, tool: EnglishWritingTool) {
  const prefix = stableResponseId(namespace, "writing-studio", safeId(tool.id));
  const phrase = tool.fields.find((field) => field.id === "original-phrase");
  const meaning = tool.fields.find((field) => field.id === "plain-language");
  const feature = tool.fields.find((field) => field.id === "language-feature");
  return `<div class="shakespeare-language-lab" data-shakespeare-language-lab>
    <div class="shakespeare-language-toolbar"><div><span>Vocabulary Matchmaker</span><h4>Build fluency before close reading</h4><p>Select an Elizabethan word, then select its current meaning.</p></div><div class="shakespeare-fluency-score"><span>Fluency score</span><strong data-shakespeare-match-score>0 / ${SHAKESPEARE_LANGUAGE_PAIRS.length}</strong><div><span data-shakespeare-match-progress></span></div></div></div>
    <input type="hidden" data-response-id="${escapeHtml(`${prefix}:vocabulary-match-state`)}" data-shakespeare-match-state value="[]">
    <input type="hidden" data-response-id="${escapeHtml(`${prefix}:practice-score`)}" data-shakespeare-practice-score value="0 / ${SHAKESPEARE_LANGUAGE_PAIRS.length}">
    <div class="shakespeare-match-grid"><section><span class="shakespeare-match-label">Elizabethan</span>${SHAKESPEARE_LANGUAGE_PAIRS.map(([word]) => `<button type="button" data-shakespeare-match-term="${escapeHtml(word)}">${escapeHtml(word)}</button>`).join("")}</section><section><span class="shakespeare-match-label">Modern meaning</span>${[...SHAKESPEARE_LANGUAGE_PAIRS].reverse().map(([word, modern]) => `<button type="button" data-shakespeare-match-meaning="${escapeHtml(word)}">${escapeHtml(modern)}</button>`).join("")}</section></div>
    <p class="shakespeare-match-status" data-shakespeare-match-status>0 of ${SHAKESPEARE_LANGUAGE_PAIRS.length} pairs matched.</p>
    <section class="shakespeare-translation-practice"><div><h4>Translation practice</h4><p>Apply the vocabulary and relationship clues to one line from Macbeth.</p></div><div class="critical-field-grid">${phrase ? renderActivityField({ field: phrase, responseId: `${prefix}:${safeId(phrase.id)}`, number: 1 }) : ""}${meaning ? renderActivityField({ field: meaning, responseId: `${prefix}:${safeId(meaning.id)}`, number: 2 }) : ""}${feature ? renderActivityField({ field: feature, responseId: `${prefix}:${safeId(feature.id)}`, number: 3 }) : ""}</div></section>
  </div>`;
}

function renderShakespeareWritingStudio(profile: EnglishShakespeareProfile) {
  assertUniqueIds(profile.writingTools, "Shakespeare writing tool");
  const group = stableResponseId(profile.namespace, "writing-studio", "tools");
  return `<section id="writing-studio" class="course-page english-activity-page shakespeare-profile-page shakespeare-writing-page" hidden>
    ${renderPageHeading(profile.courseCode, profile.playTitle, "Shakespeare Writing Studio", "Use language practice, close reading, theme building, and structured essay plans to turn scene evidence into controlled analytical writing.")}
    <div class="shakespeare-workbench-picker"><div><strong>Choose a workbook activity</strong><p>Switch between quick language practice, close reading, evidence tracking, and longer writing plans. Every draft response stays in this unit.</p></div>${renderPanelPicker({ namespace: profile.namespace, group, label: "Writing activity", items: profile.writingTools.map((tool) => ({ id: tool.id, label: tool.title })) })}</div>
    <div class="english-activity-panel-stack shakespeare-writing-panel-stack">
      ${profile.writingTools.map((tool, toolIndex) => {
        const toolId = safeId(tool.id);
        const prefix = stableResponseId(profile.namespace, "writing-studio", toolId);
        const collection = tool.evidenceMode === "collection";
        const wrapperAttributes = collection ? renderCollectionAttributes({ collectionId: `${prefix}:collection`, responsePrefix: `${prefix}:`, source: `${profile.playTitle} | Writing Studio`, concept: tool.title, promptLabel: "Writing activity", savedMessage: `${tool.title} saved to Evidence Bank`, updatedMessage: `${tool.title} updated in Evidence Bank` }) : "";
        const hasEvidenceSource = tool.fields.some((field) => field.evidenceRole === "source");
        const hasEvidenceConcept = tool.fields.some((field) => field.evidenceRole === "concept");
        const languageLab = toolId === "language-lab";
        return `<article class="writing-activity-panel english-activity-worksheet shakespeare-assignment-panel" data-writing-activity-panel data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(toolId)}" ${toolIndex === 0 ? "" : "hidden"} ${wrapperAttributes} ${tool.evidenceMode === "individual" ? `data-evidence-notebook-panel data-evidence-contribution-id="${escapeHtml(`${prefix}:entry`)}"` : ""}>
          <header class="writing-activity-header shakespeare-assignment-header"><h3>${escapeHtml(tool.title)}</h3><p>${escapeHtml(tool.description)}</p></header>
          ${tool.evidenceMode === "individual" ? `${hasEvidenceSource ? "" : `<select class="english-activity-hidden-select" data-evidence-draft="source" aria-hidden="true" tabindex="-1"><option>${escapeHtml(`${profile.playTitle} | Writing Studio`)}</option></select>`}${hasEvidenceConcept ? "" : `<select class="english-activity-hidden-select" data-evidence-draft="concept" aria-hidden="true" tabindex="-1"><option>${escapeHtml(tool.title)}</option></select>`}` : ""}
          <div class="shakespeare-assignment-body">${languageLab ? renderShakespeareLanguageLab(profile.namespace, tool) : `<div class="critical-field-grid shakespeare-writing-grid">${tool.fields.map((field, index) => renderActivityField({ field, responseId: `${prefix}:${safeId(field.id)}`, number: index + 1 })).join("")}</div>`}</div>
          <div class="english-activity-final-actions"><button type="button" data-worksheet-toggle-hints aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> Show Hints</button><button type="button" data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>${tool.evidenceMode === "collection" ? `<button class="evidence-bank-save-action" type="button" data-save-response-collection><span class="material-symbols-outlined" aria-hidden="true">library_add</span> ${escapeHtml(tool.evidenceLabel ?? "Save Activity to Evidence Bank")}</button><span data-response-collection-status aria-live="polite"></span>` : tool.evidenceMode === "individual" ? `<button class="evidence-bank-save-action" type="button" data-save-evidence-note><span class="material-symbols-outlined" aria-hidden="true">library_add</span> ${escapeHtml(tool.evidenceLabel ?? "Save to Evidence Bank")}</button><span data-save-status aria-live="polite">Draft saves automatically</span>` : `<span>Practice scores and responses save automatically</span>`}</div>
        </article>`;
      }).join("")}
    </div>
  </section>`;
}

function renderNovelTrackSurface(input: {
  id: string;
  namespace: string;
  courseCode: string;
  title: string;
  description: string;
  tracks: EnglishNovelTrack[];
  renderTrack: (track: EnglishNovelTrack) => string;
}) {
  const group = stableResponseId(input.namespace, input.id, "tracks");
  return `<section id="${escapeHtml(input.id)}" class="course-page english-activity-page" hidden>
    ${renderPageHeading(input.courseCode, "Novel Study", input.title, input.description)}
    ${renderPanelPicker({ namespace: input.namespace, group, label: "Choose a novel", items: input.tracks.map((track) => ({ id: track.id, label: track.title })) })}
    <div class="english-activity-panel-stack">${input.tracks.map((track, index) => `<article data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(safeId(track.id))}" ${index === 0 ? "" : "hidden"}>${input.renderTrack(track)}</article>`).join("")}</div>
  </section>`;
}

function renderMajorWorksData(profile: EnglishNovelStudyProfile) {
  return renderNovelTrackSurface({
    id: "major-works-data",
    namespace: profile.namespace,
    courseCode: profile.courseCode,
    title: "Major Works Data Sheet",
    description: "Build a reusable whole-novel reference for questions and critical writing.",
    tracks: profile.tracks,
    renderTrack: (track) => {
      const prefix = stableResponseId(profile.namespace, "major-works", track.id);
      return `<section class="worksheet-document english-activity-worksheet" data-writing-activity-panel ${renderCollectionAttributes({
        collectionId: `${prefix}:collection`,
        responsePrefix: `${prefix}:`,
        source: `${track.title} | Major Works Data Sheet`,
        concept: `${track.title} Major Works Collection`,
        promptLabel: "Major Works Data Sheet",
        savedMessage: `${track.title} data sheet saved to Evidence Bank`,
        updatedMessage: `${track.title} data sheet updated in Evidence Bank`
      })}>
        ${renderWorksheetToolbar({ saveLabel: "Save Data Sheet to Evidence Bank", includeHints: true, collectionStatus: true })}
        <header class="worksheet-document-header"><p>${escapeHtml(profile.courseCode)} Novel Study</p><h3>${escapeHtml(track.title)}</h3>${track.author ? `<span>${escapeHtml(track.author)}</span>` : ""}</header>
        <div class="critical-field-grid">${profile.majorWorksFields.map((field, index) => renderActivityField({ field, responseId: `${prefix}:${safeId(field.id)}`, number: index + 1 })).join("")}</div>
      </section>`;
    }
  });
}

function renderReadingGuide(profile: EnglishNovelStudyProfile) {
  return renderNovelTrackSurface({
    id: "reading-guide",
    namespace: profile.namespace,
    courseCode: profile.courseCode,
    title: "Reading Guide",
    description: "Capture precise passages and explain how the author's choices create meaning.",
    tracks: profile.tracks,
    renderTrack: (track) => `<header class="english-activity-subheading"><h3>${escapeHtml(track.title)}</h3>${track.author ? `<p>${escapeHtml(track.author)}</p>` : ""}</header>${renderEvidenceForm({
      namespace: profile.namespace,
      surface: "reading-guide",
      sourceLabel: `${track.title} | Reading Guide`,
      conceptLabel: "Passage Evidence",
      contributionId: stableResponseId(profile.namespace, "reading-guide", track.id, "passage"),
      fields: profile.readingGuideFields,
      saveLabel: "Save Passage to Evidence Bank"
    })}<section class="english-evidence-view"><div><h3>Saved Reading Evidence</h3><p>Review reading-guide entries for this novel in the central Evidence Bank.</p></div><a href="#${escapeHtml(profile.evidenceBankRoute ?? "evidence-bank")}" data-page-target="${escapeHtml(profile.evidenceBankRoute ?? "evidence-bank")}">Open Evidence Bank</a></section>`
  });
}

function renderNovelQuestions(profile: EnglishNovelStudyProfile) {
  const sets = profile.tracks.flatMap((track) => profile.questionSets.map((set) => ({
    ...set,
    id: `${track.id}-${set.id}`,
    title: `${track.title} | ${set.title}`,
    subtitle: set.subtitle ?? track.author
  })));
  return renderQuestionSetPage({
    id: "novel-study-questions",
    title: "Novel Study Questions",
    context: "Novel Study",
    description: "Complete the appropriate reading phase, then save the active phase as one Evidence Bank collection.",
    courseCode: profile.courseCode,
    namespace: profile.namespace,
    sourceLabel: "Novel Study Questions",
    sets,
    saveLabel: () => "Save Phase Answers to Evidence Bank"
  });
}

function renderViewingGuide(profile: EnglishFilmStudyProfile) {
  const selectedTitle = profile.filmSelection.mode === "selected" ? profile.filmSelection.title : "Selected Film";
  const fields: EnglishActivityField[] = [
    {
      id: "film-title",
      label: "Film title",
      type: "text",
      placeholder: profile.filmSelection.mode === "selected" ? profile.filmSelection.title : "Name the film when it has been selected."
    },
    ...profile.viewingGuideFields
  ];
  return `<section id="viewing-guide" class="course-page english-activity-page" hidden>
    ${renderPageHeading(profile.courseCode, "Film Study", "Viewing Guide", "Capture timestamped moments, identify the director's choices, and explain their effects.")}
    ${profile.filmSelection.mode === "pending" ? `<p class="english-material-access-note">A film has not been selected yet. The guide is ready for the title chosen by the teacher.</p>` : ""}
    ${renderEvidenceForm({
      namespace: profile.namespace,
      surface: "viewing-guide",
      sourceLabel: `${selectedTitle} | Viewing Guide`,
      conceptLabel: "Viewing Moment",
      contributionId: stableResponseId(profile.namespace, "viewing-guide", "moment"),
      fields,
      saveLabel: "Save Viewing Moment to Evidence Bank"
    })}
    <section class="english-evidence-view" data-evidence-view-filter="viewing-guide">
      <div><h3>Saved Viewing Moments</h3><p>Use the central Evidence Bank to review moments saved from this guide.</p></div>
      <a href="#${escapeHtml(profile.evidenceBankRoute ?? "evidence-bank")}" data-page-target="${escapeHtml(profile.evidenceBankRoute ?? "evidence-bank")}">Open Evidence Bank</a>
    </section>
  </section>`;
}

function renderModernDrama(profile: EnglishModernDramaProfile): EnglishRenderedActivityProfile {
  const pages: EnglishRenderedActivityPage[] = [
    {
      id: "play-materials",
      label: "Play Materials",
      icon: "menu_book",
      html: renderMaterialsPage({ id: "play-materials", namespace: profile.namespace, courseCode: profile.courseCode, context: profile.playTitle, title: "Play Materials", description: "Teacher-selected readings, question sheets, and supporting resources for the play.", materials: profile.materials })
    },
    {
      id: "act-questions",
      label: "Act Questions",
      icon: "quiz",
      html: renderQuestionSetPage({ id: "act-questions", title: `${profile.playTitle} Act Questions`, context: profile.playTitle, description: "Complete one act at a time and save the active act as one Evidence Bank collection.", courseCode: profile.courseCode, namespace: profile.namespace, sourceLabel: `${profile.playTitle} Act Questions`, sets: profile.actQuestionSets, saveLabel: () => "Save Act Answers to Evidence Bank" })
    },
    {
      id: "character-notes",
      label: "Character & Conflict Notes",
      icon: "groups",
      html: renderCharacterNotesPage({ namespace: profile.namespace, courseCode: profile.courseCode, context: profile.playTitle, title: "Character and Conflict Notes", sourceLabel: `${profile.playTitle} | Character and Conflict Notes`, characters: profile.characters, sharedFields: profile.characterFields, quotationLabel: "Save a useful character or conflict moment" })
    },
    {
      id: "critical-essay",
      label: "Critical Essay",
      icon: "edit_note",
      html: renderCriticalEssayPage({ namespace: profile.namespace, courseCode: profile.courseCode, context: profile.playTitle, sourceLabel: `${profile.playTitle} | Critical Essay`, essay: profile.essay })
    }
  ];
  return { kind: profile.kind, pages };
}

function renderShakespeare(profile: EnglishShakespeareProfile): EnglishRenderedActivityProfile {
  const pages: EnglishRenderedActivityPage[] = [
    { id: "side-by-side", label: "Side-by-Side Reader", icon: "view_column", html: renderShakespeareReader(profile) },
    { id: "play-materials", label: `${profile.playTitle} Materials`, icon: "menu_book", html: renderShakespeareMaterialsPage(profile) },
    { id: "act-questions", label: `${profile.playTitle} Act Questions`, icon: "quiz", html: renderShakespeareQuestionWorkbench(profile) },
    { id: "character-notes", label: `${profile.playTitle} Character Notes`, icon: "groups", html: renderShakespeareCharacterDossiers(profile) },
    { id: "writing-studio", label: "Writing Studio", icon: "edit_note", html: renderShakespeareWritingStudio(profile) }
  ];
  if (profile.essay) pages.push({ id: "critical-essay", label: "Critical Essay", icon: "description", html: renderCriticalEssayPage({ namespace: profile.namespace, courseCode: profile.courseCode, context: profile.playTitle, sourceLabel: `${profile.playTitle} | Critical Essay`, essay: profile.essay }) });
  return { kind: profile.kind, pages, resourceLinks: profile.materials.filter((material) => Boolean(material.href)) };
}

function renderNovel(profile: EnglishNovelStudyProfile): EnglishRenderedActivityProfile {
  assertUniqueIds(profile.tracks, "novel track");
  const criticalEssayPages = profile.tracks.map((track) => ({
    id: `critical-essay-${safeId(track.id)}`,
    label: `${track.title} Critical Essay`,
    icon: "description",
    html: renderCriticalEssayPage({ namespace: profile.namespace, courseCode: profile.courseCode, context: `${track.title} | Novel Study`, sourceLabel: `${track.title} | Critical Essay`, essay: profile.essay, track })
  }));
  const pages: EnglishRenderedActivityPage[] = [
    ...criticalEssayPages,
    { id: "reading-guide", label: "Reading Guide", icon: "book_2", html: renderReadingGuide(profile) },
    { id: "major-works-data", label: "Major Works Data", icon: "inventory_2", html: renderMajorWorksData(profile) },
    { id: "novel-study-questions", label: "Novel Study Questions", icon: "quiz", html: renderNovelQuestions(profile) },
    { id: "writing-studio", label: "Writing Studio", icon: "edit_note", html: renderWritingToolsPage({ namespace: profile.namespace, courseCode: profile.courseCode, context: "Novel Study", title: "Novel Study Writing Studio", sourceLabel: "Novel Study | Writing Studio", tools: profile.writingTools }) }
  ];
  if (profile.materials?.length) pages.push({ id: "novel-materials", label: "Novel Materials", icon: "folder", html: renderMaterialsPage({ id: "novel-materials", namespace: profile.namespace, courseCode: profile.courseCode, context: "Novel Study", title: "Novel Materials", description: "Approved teacher resources and access information for the selected novels.", materials: profile.materials }) });
  return { kind: profile.kind, pages };
}

function renderFilm(profile: EnglishFilmStudyProfile): EnglishRenderedActivityProfile {
  const pages: EnglishRenderedActivityPage[] = [
    { id: "critical-essay", label: "Critical Essay", icon: "description", html: renderCriticalEssayPage({ namespace: profile.namespace, courseCode: profile.courseCode, context: "Film Study", sourceLabel: `${profile.filmSelection.mode === "selected" ? profile.filmSelection.title : "Selected Film"} | Critical Essay`, essay: profile.essay }) },
    { id: "viewing-guide", label: "Viewing Guide", icon: "visibility", html: renderViewingGuide(profile) },
    { id: "film-study-questions", label: "Film Study Questions", icon: "quiz", html: renderQuestionSetPage({ id: "film-study-questions", title: "Film Study Questions", context: "Film Study", description: "Move between technique questions and the full-film response, then save the active set as one collection.", courseCode: profile.courseCode, namespace: profile.namespace, sourceLabel: "Film Study Questions", sets: profile.questionSets, saveLabel: () => "Save Question Set to Evidence Bank" }) }
  ];
  if (profile.materials?.length) pages.push({ id: "film-materials", label: "Film Materials", icon: "folder", html: renderMaterialsPage({ id: "film-materials", namespace: profile.namespace, courseCode: profile.courseCode, context: "Film Study", title: "Film Room and Resources", description: "Verified concept videos, technique resources, and viewing materials.", materials: profile.materials }) });
  return { kind: profile.kind, pages };
}

export function renderEnglishActivityProfile(profile: EnglishActivityProfile): EnglishRenderedActivityProfile {
  if (!profile.namespace.trim()) throw new Error("English activity profile namespace is required.");
  switch (profile.kind) {
    case "modern-drama":
      return renderModernDrama(profile);
    case "shakespeare-drama":
      return renderShakespeare(profile);
    case "novel-study":
      return renderNovel(profile);
    case "film-study":
      return renderFilm(profile);
  }
}

export const englishActivityProfileInternals = {
  stableResponseId,
  renderCriticalEssayPage,
  renderQuestionSetPage
};
