import { safeId } from "./source.js";
import type { EnglishActivityProfileV1 } from "./types.js";
import { renderNovelStudyProfile } from "./novel-study-profile-renderer.js";
import {
  createFilmStudyProfileRendererRecipe,
  renderFilmStudyProfileModule,
  type FilmStudyProfileRendererRecipe
} from "./film-study-profile-renderer.js";
import {
  renderShakespeareReaderPage,
  SHAKESPEARE_READER_RUNTIME,
  SHAKESPEARE_READER_STYLES
} from "./shakespeare-reader-renderer.js";
import { renderEnglishWritingSequences, type EnglishWritingWork } from "./writing-sequence-renderer.js";

export type EnglishActivityProfileKind =
  | "short-fiction"
  | "writing-foundations"
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
  provenance?: "teacher-supplied" | "profile-supplied";
  section?: string;
};

export type EnglishActivityQuestionSet = {
  id: string;
  title: string;
  subtitle?: string;
  intro?: string;
  locator?: string;
  trackIds?: string[];
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
  kind?: "document" | "video" | "image" | "link" | "concept";
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

export type EnglishModernDramaScene = {
  id: string;
  act: number;
  scene: number;
  title: string;
  text: string;
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
  /** The accepted recipe decisions that constrain generated activities and evidence behavior. */
  recipeProfile?: EnglishActivityProfileV1;
};

export type EnglishModernDramaProfile = EnglishActivityProfileBase & {
  kind: "modern-drama";
  playTitle: string;
  scriptScenes?: EnglishModernDramaScene[];
  scriptSpeakers?: string[];
  questionNavigation?: "act" | "scene";
  materials: EnglishMaterialHook[];
  actQuestionSets: EnglishActivityQuestionSet[];
  characters: EnglishCharacterProfile[];
  characterFields: EnglishActivityField[];
  writingTools?: EnglishWritingTool[];
  essay?: EnglishCriticalEssayProfile;
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
  personalResponse?: EnglishCriticalEssayProfile;
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
  /** Keep the route available to lesson links without adding a separate sidebar destination. */
  navigation?: "visible" | "lesson-linked";
};

export type EnglishRenderedActivityNavGroup = {
  /** The existing page that acts as the group landing route. */
  id: string;
  label: string;
  icon: string;
  /** Optional numbered label for the landing route inside the expanded group. */
  landingItemLabel?: string;
  /** Existing rendered page IDs shown after the landing route. */
  itemPageIds: string[];
};

export type EnglishRenderedActivityProfile = {
  kind: EnglishActivityProfileKind;
  pages: EnglishRenderedActivityPage[];
  /** Optional grouped navigation assembled from existing rendered pages. */
  navGroups?: EnglishRenderedActivityNavGroup[];
  /** Approved profile links that the shared Resources surface can organize without re-reading source archives. */
  resourceLinks?: EnglishMaterialHook[];
  /** Donor-specific fragments injected by the shared factory shell. */
  css?: string;
  runtime?: string;
};

export type EnglishActivityRenderContext = {
  videos?: Array<{ id: string; lessonTitle: string; embedSrc: string }>;
  filmStudy?: Pick<FilmStudyProfileRendererRecipe, "routes" | "resources" | "resourcePage">;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function learnerFacingActivityCopy(value: string | undefined, fallback: string) {
  return (value ?? fallback)
    .replace(/^Teacher-supplied and profile-supplied scene questions$/i, "Scene questions and guided analysis")
    .replace(/^Teacher-supplied and guided scene questions$/i, "Scene questions and guided analysis")
    .replace(/^Teacher-supplied scene questions$/i, "Scene questions")
    .replace(/^Teacher-supplied questions$/i, "Assigned questions")
    .replace(/^Profile-supplied enrichment\s*\|?\s*/i, "")
    .trim() || fallback;
}

function learnerFacingMaterialDescription(value: string | undefined, fallback = "Course material for this unit.") {
  const cleaned = (value ?? fallback)
    .replace(/^Teacher-(?:selected|supplied)\s+/i, "")
    .replace(/^Original teacher-(?:selected|supplied)\s+/i, "")
    .trim();
  return cleaned ? `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}` : fallback;
}

function learnerPassageNote(value: string | undefined) {
  const note = value?.trim() ?? "";
  if (!note) return "";
  return /(?:machine-normalized|editorial draft|editorial review|final packaging|review before publication)/i.test(note)
    ? ""
    : note;
}

function safeRouteHref(value: string) {
  const trimmed = value.trim();
  if (/^(?:https?:\/\/|#|\.\.?\/|assets\/|resources\/)/i.test(trimmed)) return trimmed;
  return "#";
}

function stableResponseId(namespace: string, ...segments: string[]) {
  return [safeId(namespace, "english-unit"), ...segments.map((segment) => safeId(segment))].join(":");
}

function configuredPages<T extends EnglishActivityProfile>(profile: T, pages: EnglishRenderedActivityPage[]) {
  const configuration = profile.recipeProfile;
  if (!configuration) return pages;
  if (configuration.kind !== profile.kind) {
    throw new Error(`Recipe activity profile kind ${configuration.kind} does not match rendered ${profile.kind} profile.`);
  }
  const enabledRoutes = new Set(configuration.activities.filter((activity) => activity.enabled).map((activity) => activity.route));
  return pages.filter((page) =>
    enabledRoutes.has(page.id)
    || (page.id.startsWith("critical-essay-") && enabledRoutes.has("critical-essay"))
    || (page.id.startsWith("personal-response-") && enabledRoutes.has("personal-response"))
  );
}

function repeatableEvidencePrefix(profile: EnglishActivityProfile, activityId: string, fallback: string) {
  const configuration = profile.recipeProfile;
  if (!configuration) return fallback;
  const activity = configuration.activities.find((candidate) => candidate.id === activityId);
  if (!activity?.enabled) return undefined;
  const policy = configuration.evidencePolicies.find((candidate) =>
    activity.evidencePolicyIds.includes(candidate.id)
      && candidate.activityId === activity.id
      && candidate.saveMode === "individual"
      && candidate.contributionIdTemplate?.includes("{entryId}")
  );
  if (!policy?.contributionIdTemplate) return undefined;
  return policy.contributionIdTemplate
    .replaceAll("{projectSlug}", safeId(profile.namespace, "english-unit"))
    .replaceAll("{entryId}", "")
    .replace(/:+$/, "");
}

function renderRepeatableEvidenceAttributes(input: {
  contributionPrefix: string | undefined;
  activityId: string;
  activityTitle: string;
  workId?: string;
  workTitle?: string;
  itemLabel: string;
}) {
  if (!input.contributionPrefix) return "";
  return `data-repeatable-evidence-panel
    data-repeatable-evidence-prefix="${escapeHtml(input.contributionPrefix)}"
    data-repeatable-evidence-activity-id="${escapeHtml(input.activityId)}"
    data-repeatable-evidence-activity-title="${escapeHtml(input.activityTitle)}"
    data-repeatable-evidence-work-id="${escapeHtml(input.workId ?? "")}"
    data-repeatable-evidence-work-title="${escapeHtml(input.workTitle ?? "")}"
    data-repeatable-evidence-item-label="${escapeHtml(input.itemLabel)}"`;
}

function renderRepeatableEvidenceControls(input: {
  responsePrefix: string;
  contributionPrefix: string | undefined;
  itemLabel: string;
}) {
  if (!input.contributionPrefix) return "";
  return `<input type="hidden" data-response-id="${escapeHtml(`${input.responsePrefix}:active-entry-id`)}" data-repeatable-evidence-active-id>
    <input type="hidden" data-response-id="${escapeHtml(`${input.responsePrefix}:entry-snapshots`)}" data-repeatable-evidence-snapshots value="{}">
    <div class="repeatable-evidence-toolbar">
      <button type="button" data-repeatable-evidence-new><span class="material-symbols-outlined" aria-hidden="true">add</span> New ${escapeHtml(input.itemLabel)}</button>
      <span data-repeatable-evidence-active-status aria-live="polite">Ready to save a new ${escapeHtml(input.itemLabel.toLowerCase())}.</span>
    </div>
    <section class="repeatable-evidence-saved" aria-label="Saved ${escapeHtml(input.itemLabel)} entries">
      <div><h4>Saved ${escapeHtml(input.itemLabel)} entries</h4><p>Edit or remove an Evidence Bank copy without deleting the working response.</p></div>
      <div data-repeatable-evidence-list><p>No saved entries from this activity yet.</p></div>
    </section>`;
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
  linkedButtons?: boolean;
}) {
  return `<label class="english-activity-picker">${escapeHtml(input.label)}
    <select data-response-id="${escapeHtml(stableResponseId(input.namespace, "selection", input.group))}" data-english-activity-select="${escapeHtml(input.group)}"${input.linkedButtons ? ` data-shakespeare-select-input="${escapeHtml(input.group)}"` : ""}>
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
          <header class="worksheet-document-header english-dark-worksheet-header">
            <p>${escapeHtml(input.courseCode)} Formative Analysis</p>
            <h3>${escapeHtml(set.title)}</h3>
            ${set.subtitle ? `<span>${escapeHtml(learnerFacingActivityCopy(set.subtitle, "Guided questions"))}</span>` : ""}
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
          <header class="critical-writing-header english-dark-worksheet-header">
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
        ${material.href ? `<a href="${escapeHtml(safeRouteHref(material.href))}" target="_blank" rel="noopener noreferrer"${material.downloadable ? " download" : ""}>${escapeHtml(material.actionLabel ?? (material.downloadable ? "Open / Download" : "Open Resource"))}</a>` : `<p class="english-material-access-note">${material.status === "needs-review" ? "This material is not currently available." : "Use the assigned or school-licensed copy of this text."}</p>`}
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
          <header class="worksheet-document-header english-dark-worksheet-header"><p>${escapeHtml(input.courseCode)} Character Study</p><h3>${escapeHtml(character.name)}</h3>${character.description ? `<span>${escapeHtml(character.description)}</span>` : ""}</header>
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
  repeatable?: {
    contributionPrefix: string | undefined;
    activityId: string;
    activityTitle: string;
    workId?: string;
    workTitle?: string;
    itemLabel: string;
  };
}) {
  const prefix = stableResponseId(input.namespace, input.surface, input.contributionId ?? "draft");
  const hasSourceField = input.fields.some((field) => field.evidenceRole === "source");
  const hasConceptField = input.fields.some((field) => field.evidenceRole === "concept");
  const repeatableAttributes = input.repeatable ? renderRepeatableEvidenceAttributes(input.repeatable) : "";
  return `<section class="english-evidence-capture" data-writing-activity-panel data-evidence-notebook-panel data-evidence-contribution-id="${escapeHtml(input.contributionId ?? prefix)}" ${repeatableAttributes}>
    ${hasSourceField ? "" : `<select class="english-activity-hidden-select" data-evidence-draft="source" aria-hidden="true" tabindex="-1"><option>${escapeHtml(input.sourceLabel)}</option></select>`}
    ${hasConceptField ? "" : `<select class="english-activity-hidden-select" data-evidence-draft="concept" aria-hidden="true" tabindex="-1"><option>${escapeHtml(input.conceptLabel)}</option></select>`}
    <div class="critical-field-grid">
      ${input.fields.map((field, index) => renderActivityField({ field, responseId: `${prefix}:${safeId(field.id)}`, number: index + 1 })).join("")}
    </div>
    <div class="english-evidence-actions">
      <button class="evidence-bank-save-action" type="button" data-save-evidence-note><span class="material-symbols-outlined" aria-hidden="true">library_add</span> ${escapeHtml(input.saveLabel)}</button>
      <span data-save-status aria-live="polite">Draft saves automatically</span>
    </div>
    ${input.repeatable ? renderRepeatableEvidenceControls({ responsePrefix: prefix, contributionPrefix: input.repeatable.contributionPrefix, itemLabel: input.repeatable.itemLabel }) : ""}
  </section>`;
}

function renderShakespeareReader(profile: EnglishShakespeareProfile) {
  assertUniqueIds(profile.scenes, "Shakespeare scene");
  const group = stableResponseId(profile.namespace, "side-by-side", "scenes");
  return `<section id="side-by-side" class="course-page english-activity-page" hidden>
    ${renderPageHeading(profile.courseCode, profile.playTitle, "Side-by-Side Reader", "Compare the public-domain original with the plain-language companion, then capture scene evidence.")}
    ${renderPanelPicker({ namespace: profile.namespace, group, label: "Choose a scene", items: profile.scenes.map((scene) => ({ id: scene.id, label: `Act ${scene.act}, Scene ${scene.scene} - ${scene.title}` })) })}
    <div class="english-activity-panel-stack">
      ${profile.scenes.map((scene, sceneIndex) => {
        const sceneId = safeId(scene.id);
        return `<article class="parallel-reading-panel" data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(sceneId)}" ${sceneIndex === 0 ? "" : "hidden"}>
          <header class="parallel-reading-header"><div><p>Act ${scene.act}, Scene ${scene.scene}</p><h3>${escapeHtml(scene.title)}</h3><p>${escapeHtml(scene.summary)}</p></div></header>
          ${scene.focus ? `<section class="parallel-reading-focus"><h4>What to watch</h4><p>${escapeHtml(scene.focus)}</p></section>` : ""}
          <div class="parallel-reading-table" role="table" aria-label="Original and plain-language scene comparison">
            <div class="parallel-reading-row parallel-reading-label-row" role="row"><strong role="columnheader">Original text</strong><strong role="columnheader">Plain-language companion</strong></div>
            ${scene.passages.map((passage) => {
              const note = learnerPassageNote(passage.note);
              return `<div class="parallel-reading-row" role="row" data-scene-passage="${escapeHtml(safeId(passage.id))}"><div role="cell">${passage.speaker ? `<strong>${escapeHtml(passage.speaker)}</strong>` : ""}<p>${escapeHtml(passage.original)}</p></div><div role="cell"><p>${escapeHtml(passage.companion)}</p>${note ? `<p class="parallel-reading-note">${escapeHtml(note)}</p>` : ""}</div></div>`;
            }).join("")}
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
  repeatableIndividual?: {
    contributionPrefix: string | undefined;
    activityId: string;
    activityTitle: string;
  };
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
        const repeatable = tool.evidenceMode === "individual" && input.repeatableIndividual
          ? { ...input.repeatableIndividual, itemLabel: tool.title }
          : undefined;
        return `<article class="writing-activity-panel english-activity-worksheet" data-writing-activity-panel data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(toolId)}" ${toolIndex === 0 ? "" : "hidden"} ${wrapperAttributes} ${tool.evidenceMode === "individual" ? `data-evidence-notebook-panel data-evidence-contribution-id="${escapeHtml(`${prefix}:entry`)}"` : ""} ${repeatable ? renderRepeatableEvidenceAttributes(repeatable) : ""}>
          <header class="writing-activity-header english-dark-worksheet-header"><h3>${escapeHtml(tool.title)}</h3><p>${escapeHtml(tool.description)}</p></header>
          ${tool.evidenceMode === "individual" ? `${hasEvidenceSource ? "" : `<select class="english-activity-hidden-select" data-evidence-draft="source" aria-hidden="true" tabindex="-1"><option>${escapeHtml(input.sourceLabel)}</option></select>`}${hasEvidenceConcept ? "" : `<select class="english-activity-hidden-select" data-evidence-draft="concept" aria-hidden="true" tabindex="-1"><option>${escapeHtml(tool.title)}</option></select>`}` : ""}
          <div class="critical-field-grid">${tool.fields.map((field, index) => renderActivityField({ field, responseId: `${prefix}:${safeId(field.id)}`, number: index + 1 })).join("")}</div>
          <div class="english-activity-final-actions">
            <button type="button" data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
            ${tool.evidenceMode === "collection" ? `<button class="evidence-bank-save-action" type="button" data-save-response-collection><span class="material-symbols-outlined" aria-hidden="true">library_add</span> ${escapeHtml(tool.evidenceLabel ?? "Save Activity to Evidence Bank")}</button><span data-response-collection-status aria-live="polite"></span>` : tool.evidenceMode === "individual" ? `<button class="evidence-bank-save-action" type="button" data-save-evidence-note><span class="material-symbols-outlined" aria-hidden="true">library_add</span> ${escapeHtml(tool.evidenceLabel ?? "Save to Evidence Bank")}</button><span data-save-status aria-live="polite">Draft saves automatically</span>` : `<span>Responses save automatically</span>`}
          </div>
          ${repeatable ? renderRepeatableEvidenceControls({ responsePrefix: prefix, contributionPrefix: repeatable.contributionPrefix, itemLabel: repeatable.itemLabel }) : ""}
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
    ${renderPageHeading(profile.courseCode, profile.playTitle, `${profile.playTitle} Materials`, "Select the original text, act questions, motif work, or another study resource and keep it open beside your course work.")}
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
              <span><strong>${escapeHtml(material.title)}</strong><small>${escapeHtml(material.description ?? `${profile.playTitle} study resource.`)}</small></span>
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
              <div><h3>${escapeHtml(material.title)}</h3><p>${escapeHtml(material.description ?? `${profile.playTitle} study resource.`)}</p></div>
              ${href ? `<div class="library-actions">
                <button class="library-action-button" type="button" data-shakespeare-open-src="${escapeHtml(href)}">${escapeHtml(material.actionLabel ?? (material.downloadable ? "Open" : "Open Source"))}</button>
                ${embeddable ? `<button class="library-action-button" type="button" data-shakespeare-fullscreen-src="${escapeHtml(href)}" data-shakespeare-fullscreen-title="${escapeHtml(material.title)}">Full Screen</button>` : ""}
                ${material.downloadable ? `<button class="library-action-button" type="button" data-shakespeare-download-src="${escapeHtml(href)}">Download</button>` : ""}
              </div>` : ""}
            </div>
            ${href && embeddable ? `<iframe class="library-document-frame" src="${escapeHtml(href)}" title="${escapeHtml(material.title)}" loading="lazy"></iframe>` : href ? `<div class="library-file-fallback"><p>This file opens in its native application or a new browser tab.</p><a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">Open ${escapeHtml(material.title)}</a></div>` : `<p class="english-material-access-note">Ask your teacher how to access this resource.</p>`}
          </section>`;
        }).join("") || `<p class="english-material-access-note">No additional materials are available for this unit.</p>`}
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

function renderShakespeareQuestionCollections(profile: EnglishShakespeareProfile) {
  const group = stableResponseId(profile.namespace, "act-questions", "sets");
  return `<section id="act-questions" class="course-page english-activity-page shakespeare-profile-page shakespeare-questions-page" hidden>
    ${renderPageHeading(profile.courseCode, profile.playTitle, `${profile.playTitle} Act Questions`, "Choose a question set, complete every response, and deliberately save the active set as one Evidence Bank collection.")}
    <div class="shakespeare-workbench-picker"><div><strong>Choose a question set</strong><p>Responses autosave, hints remain optional, and Print / PDF stays scoped to the active question set.</p></div>${renderPanelPicker({ namespace: profile.namespace, group, label: "Question set", items: profile.actQuestionSets.map((set) => ({ id: set.id, label: set.title })) })}</div>
    <div class="english-activity-panel-stack">
      ${profile.actQuestionSets.map((set, setIndex) => {
        const setId = safeId(set.id);
        const prefix = stableResponseId(profile.namespace, "act-questions", setId);
        return `<article class="worksheet-document english-activity-worksheet shakespeare-question-workbench" data-question-panel data-activity-progress data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(setId)}" ${setIndex === 0 ? "" : "hidden"} ${renderCollectionAttributes({
          collectionId: `${prefix}:collection`,
          responsePrefix: `${prefix}:`,
          source: `${profile.playTitle} Act Questions | ${set.title}`,
          concept: `${set.title} Question Collection`,
          promptLabel: "Question set",
          savedMessage: `${set.title} saved to Evidence Bank`,
          updatedMessage: `${set.title} updated in Evidence Bank`
        })}>
          ${renderWorksheetToolbar({ saveLabel: "Save Question Set to Evidence Bank", includeHints: true, collectionStatus: true })}
          <header class="worksheet-document-header scene-checkpoint-heading english-dark-worksheet-header"><div><p>${escapeHtml(profile.courseCode)} Critical Analysis</p><h3>${escapeHtml(`${profile.playTitle}: ${set.title}`)}</h3><span>${escapeHtml(learnerFacingActivityCopy(set.subtitle, "Use precise dialogue, stage action, language, and character choices in every response."))}</span></div><strong class="scene-checkpoint-count">${set.questions.length} ${set.questions.length === 1 ? "prompt" : "prompts"}</strong></header>
          <div class="scene-checkpoint-body"><div class="shakespeare-scene-question-grid">${set.questions.map((question, index) => renderActivityField({ field: question, responseId: `${prefix}:${safeId(question.id)}`, number: index + 1, questionStyle: true })).join("")}</div><div class="worksheet-progress modern-drama-act-progress"><div><span>Formative Progress</span><strong data-activity-progress-label>0 of ${set.questions.length} answered</strong></div><div class="worksheet-progress-track"><div data-activity-progress-fill></div></div></div></div>
        </article>`;
      }).join("")}
    </div>
  </section>`;
}

function renderShakespeareQuestionWorkbench(profile: EnglishShakespeareProfile) {
  assertUniqueIds(profile.actQuestionSets, `${profile.playTitle} act question set`);
  if (!profile.scenes.length) return renderShakespeareQuestionCollections(profile);
  const actGroup = stableResponseId(profile.namespace, "act-questions", "sets");
  return `<section id="act-questions" class="course-page english-activity-page shakespeare-profile-page shakespeare-questions-page" hidden>
    ${renderPageHeading(profile.courseCode, profile.playTitle, `${profile.playTitle} Act Questions`, "Choose an act, move through every scene, and build one saved Evidence Bank collection for the complete act.")}
    <div class="shakespeare-workbench-picker">
      <div><strong>Choose an act</strong><p>Every scene includes the same checkpoint routine. Answer the questions and support each response with precise evidence.</p></div>
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
          <header class="worksheet-document-header scene-checkpoint-heading english-dark-worksheet-header"><div><p>${escapeHtml(profile.courseCode)} Critical Analysis</p><h3>${escapeHtml(`${profile.playTitle} ${set.title} Scene Checkpoints`)}</h3><span>Use precise stage action, language, and recurring imagery as you answer the scene questions.</span></div><strong class="scene-checkpoint-count">${scenes.length} ${scenes.length === 1 ? "scene" : "scenes"}</strong></header>
          <div class="scene-checkpoint-body">
            ${scenes.length > 1 ? renderPanelPicker({ namespace: profile.namespace, group: sceneGroup, label: "Choose a scene", items: scenes.map(([scene]) => ({ id: `scene-${scene}`, label: scene ? `Act ${actNumber}, Scene ${scene}` : `${set.title} overview` })) }) : ""}
            <div class="scene-checkpoint-list">
              ${scenes.map(([sceneNumber, questions], sceneIndex) => {
                const sceneId = `scene-${sceneNumber}`;
                const scene = profile.scenes.find((candidate) => candidate.act === actNumber && candidate.scene === sceneNumber);
                const scenePrefix = `${prefix}:${sceneId}`;
                const anchor = scene?.passages[0];
                const questionOrigin = questions.every((question) => question.provenance === "profile-supplied")
                  ? "profile-supplied"
                  : "teacher-supplied";
                return `<section class="scene-checkpoint-card" data-english-activity-panel-group="${escapeHtml(sceneGroup)}" data-english-activity-panel="${escapeHtml(sceneId)}" ${sceneIndex === 0 ? "" : "hidden"}>
                  <div class="scene-checkpoint-title"><p>Act ${actNumber}, Scene ${sceneNumber || "Overview"}</p><h4>${escapeHtml(scene?.title ?? set.title)}</h4>${scene?.summary ? `<span>${escapeHtml(scene.summary)}</span>` : ""}</div>
                  ${renderActivityField({ field: { id: "summary", label: "Scene summary", prompt: "Summarize the scene's central action and pressure in your own words.", hint: "Name what changes by the end of the scene rather than listing every event.", rows: 4, placeholder: "What changes in this scene, and why does it matter?" }, responseId: `${scenePrefix}:summary`, number: 1, questionStyle: true })}
                  ${anchor ? `<blockquote class="scene-key-quote"><span>${escapeHtml(anchor.speaker ?? "Anchor line")}</span><p>${escapeHtml(anchor.original)}</p></blockquote>` : ""}
                  <section class="scene-supplied-questions" data-question-origin="${questionOrigin}"><h5>Scene questions</h5><div class="shakespeare-scene-question-grid">${questions.map((question, index) => renderActivityField({ field: question, responseId: `${prefix}:${safeId(question.id)}`, number: index + 2, questionStyle: true })).join("")}</div></section>
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
    ${renderPageHeading(profile.courseCode, profile.playTitle, `${profile.playTitle} Character Notes`, "Track first impressions, public image, tragic pressure, foil relationships, thematic function, act-by-act change, and supporting evidence.")}
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
              <header class="worksheet-document-header character-dossier-heading english-dark-worksheet-header"><div class="character-dossier-heading-copy"><p>${escapeHtml(profile.courseCode)} Character Study</p><h3>${escapeHtml(character.name)}</h3><span>${escapeHtml(character.description ?? `Track first impressions, public image, tragic pressure, thematic function, and textual evidence for ${character.name}.`)}</span></div><div class="character-dossier-progress-badge"><strong data-character-panel-progress>0%</strong><span>complete</span></div></header>
              <div class="character-dossier-body"><div class="character-dossier-grid">${gridFields.map((field, fieldIndex) => renderDossierFieldCard(field, `${prefix}:${safeId(field.id)}`, fieldIndex + 1)).join("")}</div>${focusField ? renderDossierFieldCard(focusField, `${prefix}:${safeId(focusField.id)}`, gridFields.length + 1, true) : ""}</div>
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

function renderShakespeareLanguageLab(namespace: string, playTitle: string, tool: EnglishWritingTool) {
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
    <section class="shakespeare-translation-practice"><div><h4>Translation practice</h4><p>Apply the vocabulary and relationship clues to one line from ${escapeHtml(playTitle)}.</p></div><div class="critical-field-grid">${phrase ? renderActivityField({ field: phrase, responseId: `${prefix}:${safeId(phrase.id)}`, number: 1 }) : ""}${meaning ? renderActivityField({ field: meaning, responseId: `${prefix}:${safeId(meaning.id)}`, number: 2 }) : ""}${feature ? renderActivityField({ field: feature, responseId: `${prefix}:${safeId(feature.id)}`, number: 3 }) : ""}</div></section>
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
          <header class="writing-activity-header shakespeare-assignment-header english-dark-worksheet-header"><h3>${escapeHtml(tool.title)}</h3><p>${escapeHtml(tool.description)}</p></header>
          ${tool.evidenceMode === "individual" ? `${hasEvidenceSource ? "" : `<select class="english-activity-hidden-select" data-evidence-draft="source" aria-hidden="true" tabindex="-1"><option>${escapeHtml(`${profile.playTitle} | Writing Studio`)}</option></select>`}${hasEvidenceConcept ? "" : `<select class="english-activity-hidden-select" data-evidence-draft="concept" aria-hidden="true" tabindex="-1"><option>${escapeHtml(tool.title)}</option></select>`}` : ""}
          <div class="shakespeare-assignment-body">${languageLab ? renderShakespeareLanguageLab(profile.namespace, profile.playTitle, tool) : `<div class="critical-field-grid shakespeare-writing-grid">${tool.fields.map((field, index) => renderActivityField({ field, responseId: `${prefix}:${safeId(field.id)}`, number: index + 1 })).join("")}</div>`}</div>
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
        <header class="worksheet-document-header english-dark-worksheet-header"><p>${escapeHtml(profile.courseCode)} Novel Study</p><h3>${escapeHtml(track.title)}</h3>${track.author ? `<span>${escapeHtml(track.author)}</span>` : ""}</header>
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
    renderTrack: (track) => {
      const contributionId = stableResponseId(profile.namespace, "reading-guide", track.id, "passage");
      const contributionPrefix = repeatableEvidencePrefix(profile, "reading-guide", `${contributionId}:entry`);
      return `<header class="english-activity-subheading"><h3>${escapeHtml(track.title)}</h3>${track.author ? `<p>${escapeHtml(track.author)}</p>` : ""}</header>${renderEvidenceForm({
        namespace: profile.namespace,
        surface: "reading-guide",
        sourceLabel: `${track.title} | Reading Guide`,
        conceptLabel: "Passage Evidence",
        contributionId,
        fields: profile.readingGuideFields,
        saveLabel: "Save Passage to Evidence Bank",
        repeatable: {
          contributionPrefix,
          activityId: "reading-guide",
          activityTitle: "Reading Guide",
          workId: track.id,
          workTitle: track.title,
          itemLabel: "Passage"
        }
      })}<section class="english-evidence-view"><div><h3>Saved Reading Evidence</h3><p>Review reading-guide entries for this novel in the central Evidence Bank.</p></div><a href="#${escapeHtml(profile.evidenceBankRoute ?? "evidence-bank")}" data-page-target="${escapeHtml(profile.evidenceBankRoute ?? "evidence-bank")}">Open Evidence Bank</a></section>`;
    }
  });
}

function renderNovelQuestions(profile: EnglishNovelStudyProfile) {
  const sets = profile.tracks.flatMap((track) => profile.questionSets.filter((set) => !set.trackIds?.length || set.trackIds.includes(track.id)).map((set) => ({
    ...set,
    id: `${track.id}-${set.id}`,
    title: `${track.title} | ${set.title}`,
    subtitle: set.subtitle ?? track.author
  })));
  return renderQuestionSetPage({
    id: "novel-study-questions",
    title: "Novel Study Questions",
    context: "Novel Study",
    description: "Complete the appropriate teacher question set or enrichment phase, then save the active set as one Evidence Bank collection.",
    courseCode: profile.courseCode,
    namespace: profile.namespace,
    sourceLabel: "Novel Study Questions",
    sets,
    saveLabel: () => "Save Question Set to Evidence Bank"
  });
}

function renderViewingGuide(profile: EnglishFilmStudyProfile) {
  const selectedTitle = profile.filmSelection.mode === "selected" ? profile.filmSelection.title : "Selected Film";
  const contributionId = stableResponseId(profile.namespace, "viewing-guide", "moment");
  const contributionPrefix = repeatableEvidencePrefix(profile, "viewing-guide", `${contributionId}:entry`);
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
      contributionId,
      fields,
      saveLabel: "Save Viewing Moment to Evidence Bank",
      repeatable: {
        contributionPrefix,
        activityId: "viewing-guide",
        activityTitle: "Viewing Guide",
        workId: profile.filmSelection.mode === "selected" ? safeId(profile.filmSelection.title) : "selected-film",
        workTitle: selectedTitle,
        itemLabel: "Viewing Moment"
      }
    })}
    <section class="english-evidence-view" data-evidence-view-filter="viewing-guide">
      <div><h3>Saved Viewing Moments</h3><p>Use the central Evidence Bank to review moments saved from this guide.</p></div>
      <a href="#${escapeHtml(profile.evidenceBankRoute ?? "evidence-bank")}" data-page-target="${escapeHtml(profile.evidenceBankRoute ?? "evidence-bank")}">Open Evidence Bank</a>
    </section>
  </section>`;
}

function modernMaterialCanEmbed(material: EnglishMaterialHook) {
  return Boolean(
    material.href
      && material.embeddable !== false
      && !/\.(?:docx?|pptx?|xlsx?)(?:[?#].*)?$/i.test(material.href)
  );
}

function normalizeModernDramaScriptProse(value: string) {
  return value
    .replace(/\s+-\s*\n/g, " ")
    .replace(/-\n(?=\S)/g, "-")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function renderModernDramaScriptParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map(normalizeModernDramaScriptProse)
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function renderModernDramaScriptSpeech(value: string) {
  return escapeHtml(normalizeModernDramaScriptProse(value))
    .replace(/\(([^()]{1,180})\)/g, '<em class="modern-drama-script-cue">($1)</em>');
}

function renderModernDramaScriptText(value: string, speakerNames?: string[]) {
  const speakerCue = /^([a-z][a-z .'-]{0,36})(?:\s+\(([^)]+)\))?:\s*/gim;
  const allowedSpeakers = speakerNames?.length
    ? new Set(speakerNames.map((name) => name.trim().toLowerCase()))
    : undefined;
  const cues = Array.from(value.matchAll(speakerCue)).filter((cue) => (
    !allowedSpeakers || allowedSpeakers.has((cue[1] ?? "").trim().toLowerCase())
  ));
  if (!cues.length) {
    return `<div class="modern-drama-script-stage-direction">${renderModernDramaScriptParagraphs(value)}</div>`;
  }

  const opening = value.slice(0, cues[0]?.index ?? 0).trim();
  const dialogue = cues.map((cue, index) => {
    const start = (cue.index ?? 0) + cue[0].length;
    const end = cues[index + 1]?.index ?? value.length;
    const body = renderModernDramaScriptSpeech(value.slice(start, end));
    return `<div class="modern-drama-script-dialogue-turn" role="listitem">
      <p class="modern-drama-script-speech"><strong class="modern-drama-script-speaker">${escapeHtml(cue[1] ?? "Speaker")}:</strong>${cue[2] ? ` <em class="modern-drama-script-cue">(${escapeHtml(cue[2])})</em>` : ""} ${body}</p>
    </div>`;
  }).join("");

  return `${opening ? `<aside class="modern-drama-script-stage-direction" aria-label="Opening stage direction">${renderModernDramaScriptParagraphs(opening)}</aside>` : ""}
    <div class="modern-drama-script-dialogue" role="list" aria-label="Scene dialogue">${dialogue}</div>`;
}

function renderModernDramaScriptReader(profile: EnglishModernDramaProfile) {
  const scenes = profile.scriptScenes ?? [];
  assertUniqueIds(scenes, `${profile.playTitle} script scene`);
  const group = stableResponseId(profile.namespace, "script-reader", "scenes");
  const scriptHref = profile.materials.find((material) => material.id === "fences-script" || /script/i.test(material.title))?.href;
  return `<section id="script-reader" class="course-page english-activity-page modern-drama-profile-page modern-drama-script-reader-page" hidden data-modern-drama-donor-parity="script-reader">
    ${renderPageHeading(profile.courseCode, profile.playTitle, `${profile.playTitle} Script Reader`, "Read the complete play one scene at a time in a focused single-column reader. Choose a scene below to continue.")}
    <div class="modern-drama-script-controls">
      <label class="english-activity-picker">Choose a scene
        <select data-response-id="${escapeHtml(stableResponseId(profile.namespace, "selection", "script-scene"))}" data-english-activity-select="${escapeHtml(group)}">
          ${scenes.map((scene) => `<option value="${escapeHtml(safeId(scene.id))}">Act ${scene.act}, Scene ${scene.scene} — ${escapeHtml(scene.title)}</option>`).join("")}
        </select>
      </label>
      ${scriptHref ? `<a class="library-action-button" href="${escapeHtml(safeRouteHref(scriptHref))}" target="_blank" rel="noopener noreferrer">Open Original PDF</a>` : ""}
    </div>
    <div class="english-activity-panel-stack modern-drama-script-scene-stack">
      ${scenes.map((scene, index) => `<article class="modern-drama-script-scene" data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(safeId(scene.id))}" ${index === 0 ? "" : "hidden"}>
        <header class="english-dark-worksheet-header"><p>${escapeHtml(profile.playTitle)} | Act ${scene.act}, Scene ${scene.scene}</p><h3>${escapeHtml(scene.title)}</h3><span>Play script</span></header>
        <div class="modern-drama-script-text">${renderModernDramaScriptText(scene.text, profile.scriptSpeakers)}</div>
      </article>`).join("")}
    </div>
  </section>`;
}

function renderModernDramaMaterials(profile: EnglishModernDramaProfile) {
  const materials = profile.materials.filter((material) => material.kind !== "video");
  assertUniqueIds(materials, `${profile.playTitle} material`);
  const group = stableResponseId(profile.namespace, "materials", "documents");
  const selectedId = safeId(materials[0]?.id ?? "access");
  return `<section id="play-materials" class="course-page english-activity-page shakespeare-profile-page shakespeare-materials-page modern-drama-profile-page modern-drama-materials-page" hidden data-activity-materials-hook="${escapeHtml(profile.namespace)}" data-modern-drama-donor-parity="materials">
    ${renderPageHeading(profile.courseCode, profile.playTitle, `${profile.playTitle} Materials`, "Select a play document, act-question set, conflict activity, or course resource and keep it open beside your course work.")}
    <select class="english-activity-hidden-select" aria-label="Selected ${escapeHtml(profile.playTitle)} material" data-response-id="${escapeHtml(stableResponseId(profile.namespace, "selection", "materials"))}" data-english-activity-select="${escapeHtml(group)}" data-shakespeare-select-input="${escapeHtml(group)}">
      ${materials.map((material) => `<option value="${escapeHtml(safeId(material.id))}">${escapeHtml(material.title)}</option>`).join("")}
    </select>
    <div class="library-browser story-bank-browser shakespeare-document-browser modern-drama-document-browser">
      <aside class="library-list-panel">
        <h3>${escapeHtml(profile.playTitle)} Files</h3>
        <p>Select a course document to open it in the reader.</p>
        <div class="library-doc-list">
          ${materials.map((material, index) => {
            const materialId = safeId(material.id);
            return `<button class="library-doc-tab${index === 0 ? " active" : ""}" type="button" data-shakespeare-panel-select="${escapeHtml(materialId)}" data-shakespeare-select-for="${escapeHtml(group)}" aria-pressed="${index === 0 ? "true" : "false"}">
              <span class="library-doc-index">${index + 1}</span>
              <span><strong>${escapeHtml(material.title)}</strong><small>${escapeHtml(learnerFacingMaterialDescription(material.description))}</small></span>
            </button>`;
          }).join("")}
        </div>
      </aside>
      <div class="library-reader-panel">
        ${materials.map((material, index) => {
          const materialId = safeId(material.id);
          const href = material.href ? safeRouteHref(material.href) : "";
          const embeddable = modernMaterialCanEmbed(material);
          return `<section data-material-id="${escapeHtml(materialId)}" data-material-status="${escapeHtml(material.status ?? "available")}" data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(materialId)}" ${index === 0 ? "" : "hidden"}>
            <div class="library-reader-header">
              <div><h3>${escapeHtml(material.title)}</h3><p>${escapeHtml(learnerFacingMaterialDescription(material.description))}</p></div>
              ${href ? `<div class="library-actions">
                <button class="library-action-button" type="button" data-shakespeare-open-src="${escapeHtml(href)}">${escapeHtml(material.actionLabel ?? "Open")}</button>
                ${embeddable ? `<button class="library-action-button" type="button" data-shakespeare-fullscreen-src="${escapeHtml(href)}" data-shakespeare-fullscreen-title="${escapeHtml(material.title)}">Full Screen</button>` : ""}
                ${material.downloadable ? `<button class="library-action-button" type="button" data-shakespeare-download-src="${escapeHtml(href)}">Download</button>` : ""}
              </div>` : ""}
            </div>
            ${href && embeddable ? `<iframe class="library-document-frame" src="${escapeHtml(href)}" title="${escapeHtml(material.title)}" loading="lazy"></iframe>` : href ? `<div class="library-file-fallback"><p>This file opens in its native application or a new browser tab.</p><a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">Open ${escapeHtml(material.title)}</a></div>` : `<p class="english-material-access-note">${material.status === "needs-review" ? "This material is not currently available." : "Use the assigned or school-licensed copy of this play."}</p>`}
          </section>`;
        }).join("") || `<p class="english-material-access-note">No learner-facing materials have been approved for this surface yet.</p>`}
      </div>
    </div>
    <div class="shakespeare-reader-overlay" data-shakespeare-reader-overlay hidden>
      <div class="shakespeare-reader-dialog" role="dialog" aria-modal="true" aria-labelledby="modern-drama-reader-title">
        <div class="shakespeare-reader-bar"><h3 id="modern-drama-reader-title" data-shakespeare-reader-title>${escapeHtml(materials.find((material) => safeId(material.id) === selectedId)?.title ?? `${profile.playTitle} Material`)}</h3><button type="button" data-shakespeare-reader-close aria-label="Close full-screen reader"><span class="material-symbols-outlined" aria-hidden="true">close</span></button></div>
        <iframe class="shakespeare-reader-frame" data-shakespeare-reader-frame title="Full-screen ${escapeHtml(profile.playTitle)} material"></iframe>
      </div>
    </div>
  </section>`;
}

function renderModernDramaFilmRoom(profile: EnglishModernDramaProfile) {
  const films = profile.materials.filter((material) => material.kind === "video" && material.href);
  assertUniqueIds(films, `${profile.playTitle} film-room media`);
  const group = stableResponseId(profile.namespace, "film-room", "playlist");
  const renderPlayer = (film: EnglishMaterialHook) => {
    const href = safeRouteHref(film.href ?? "");
    const isAudio = /\.(?:m4a|mp3|wav|ogg)(?:[?#].*)?$/i.test(href);
    return isAudio
      ? `<div class="modern-drama-film-audio-shell"><span class="material-symbols-outlined" aria-hidden="true">headphones</span><audio controls preload="metadata" src="${escapeHtml(href)}" title="${escapeHtml(film.title)}">Your browser cannot play this audio. Use the open action below.</audio></div>`
      : `<div class="modern-drama-film-video-shell"><video controls playsinline preload="metadata" title="${escapeHtml(film.title)}" aria-label="${escapeHtml(film.title)}" data-local-course-video><source src="${escapeHtml(href)}" type="video/mp4">Your browser cannot play this video. Use the open action below.</video></div>`;
  };
  return `<section id="film-room" class="course-page english-activity-page modern-drama-profile-page modern-drama-film-room-page" hidden>
    ${renderPageHeading(profile.courseCode, profile.playTitle, "Film Room", "Review the film and lesson media in one organized playlist. Use the related lessons to connect each clip to the play.")}
    ${films.length ? `<div class="modern-drama-film-room-shell">
      <div class="modern-drama-film-room-stage">
        ${films.map((film, index) => {
          const id = safeId(film.id);
          const href = safeRouteHref(film.href ?? "");
          return `<article class="modern-drama-film-player" data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(id)}" ${index === 0 ? "" : "hidden"}>
            <header class="english-dark-worksheet-header"><p>${escapeHtml(profile.courseCode)} | Film Room</p><h3>${escapeHtml(film.title)}</h3><span>${escapeHtml(film.description ?? `Media connected to ${profile.playTitle}.`)}</span></header>
            ${renderPlayer(film)}
            <div class="modern-drama-film-actions"><a class="library-action-button" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">Open Source</a>${film.downloadable ? `<a class="library-action-button" href="${escapeHtml(href)}" download>Download</a>` : ""}</div>
          </article>`;
        }).join("")}
      </div>
      <aside class="modern-drama-film-room-sidebar">
        <article class="modern-drama-film-room-control">
          <p class="english-activity-kicker">Media playlist</p>
          <h3>Choose a film or lesson clip</h3>
          <p>Move between the full film, audio context, motifs, symbols, and themes.</p>
          <label class="english-activity-picker" for="${escapeHtml(group)}-select">Playlist
            <select id="${escapeHtml(group)}-select" data-response-id="${escapeHtml(stableResponseId(profile.namespace, "selection", "film-room"))}" data-english-activity-select="${escapeHtml(group)}">
              ${films.map((film) => `<option value="${escapeHtml(safeId(film.id))}">${escapeHtml(film.title)}</option>`).join("")}
            </select>
          </label>
        </article>
        <ol class="modern-drama-film-playlist">
          ${films.map((film, index) => `<li><button type="button" data-shakespeare-panel-select="${escapeHtml(safeId(film.id))}" data-shakespeare-select-for="${escapeHtml(group)}" aria-pressed="${index === 0 ? "true" : "false"}"><span>${index + 1}</span>${escapeHtml(film.title)}</button></li>`).join("")}
        </ol>
      </aside>
    </div>` : `<p class="english-material-access-note">No learner-facing film has been approved for this unit yet.</p>`}
  </section>`;
}

function modernDramaSceneTitle(section: string) {
  return section.replace(/\s+[—-]\s+Teacher Questions$/i, "").trim();
}

function renderModernDramaSceneQuestionWorkbench(profile: EnglishModernDramaProfile) {
  const group = stableResponseId(profile.namespace, "act-questions", "scenes");
  const scenes = profile.actQuestionSets.flatMap((set) => {
    const grouped = new Map<string, EnglishActivityQuestion[]>();
    set.questions.forEach((question) => {
      const section = question.section?.trim() || set.title;
      grouped.set(section, [...(grouped.get(section) ?? []), question]);
    });
    const setId = safeId(set.id);
    const prefix = stableResponseId(profile.namespace, "act-questions", setId);
    return [...grouped.entries()].map(([section, questions]) => {
      const title = modernDramaSceneTitle(section);
      const sceneId = `${setId}-${safeId(title)}`;
      return { set, setId, prefix, title, sceneId, questions };
    });
  });
  assertUniqueIds(scenes.map((scene) => ({ id: scene.sceneId })), `${profile.playTitle} scene question set`);

  return `<section id="act-questions" class="course-page english-activity-page shakespeare-profile-page shakespeare-questions-page modern-drama-profile-page modern-drama-questions-page" hidden data-modern-drama-donor-parity="act-questions" data-modern-drama-question-navigation="scene">
    ${renderPageHeading(profile.courseCode, profile.playTitle, `${profile.playTitle} Act and Scene Questions`, "Choose an act and scene, answer its questions, and deliberately save that scene as one Evidence Bank collection.")}
    <div class="shakespeare-workbench-picker modern-drama-workbench-picker">
      <div><strong>Active scene collection</strong><p>Responses autosave, hints remain optional, and Print / PDF stays scoped to the selected scene.</p></div>
      ${renderPanelPicker({ namespace: profile.namespace, group, label: "Choose an act and scene", items: scenes.map((scene) => ({ id: scene.sceneId, label: `${scene.title} — ${scene.questions.length} ${scene.questions.length === 1 ? "question" : "questions"}` })) })}
    </div>
    <div class="english-activity-panel-stack">
      ${scenes.map((scene, sceneIndex) => {
        const collectionPrefix = `${scene.prefix}:scene-collection:${safeId(scene.title)}`;
        const provenance = scene.questions.every((question) => question.provenance === "teacher-supplied")
          ? "Scene questions"
          : scene.questions.every((question) => question.provenance === "profile-supplied")
            ? "Guided scene questions"
            : "Scene questions and guided analysis";
        return `<article class="worksheet-document english-activity-worksheet shakespeare-question-workbench modern-drama-question-workbench" data-question-panel data-activity-progress data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(scene.sceneId)}" ${sceneIndex === 0 ? "" : "hidden"} ${renderCollectionAttributes({
          collectionId: `${collectionPrefix}:collection`,
          responsePrefix: `${collectionPrefix}:entry:`,
          source: `${profile.playTitle} Scene Questions | ${scene.title}`,
          concept: `${scene.title} Question Collection`,
          promptLabel: "Scene question set",
          savedMessage: `${scene.title} saved to Evidence Bank`,
          updatedMessage: `${scene.title} updated in Evidence Bank`
        })}>
          ${renderWorksheetToolbar({ saveLabel: "Save Scene Answers to Evidence Bank", includeHints: true, collectionStatus: true })}
          <header class="worksheet-document-header scene-checkpoint-heading english-dark-worksheet-header"><div><p>${escapeHtml(profile.courseCode)} Critical Analysis</p><h3>${escapeHtml(`${profile.playTitle} ${scene.title} Questions`)}</h3><span>${escapeHtml(provenance)}</span></div><strong class="scene-checkpoint-count">${scene.questions.length} ${scene.questions.length === 1 ? "prompt" : "prompts"}</strong></header>
          <div class="scene-checkpoint-body modern-drama-question-body">
            <div class="shakespeare-scene-question-grid">
              ${scene.questions.map((question, index) => renderActivityField({ field: question, responseId: `${scene.prefix}:${safeId(question.id)}`, number: index + 1, questionStyle: true })).join("")}
            </div>
            <div class="worksheet-progress modern-drama-act-progress">
              <div><span>Formative Progress</span><strong data-activity-progress-label>0 of ${scene.questions.length} answered</strong></div>
              <div class="worksheet-progress-track"><div data-activity-progress-fill></div></div>
            </div>
          </div>
        </article>`;
      }).join("")}
    </div>
  </section>`;
}

function renderModernDramaQuestionWorkbench(profile: EnglishModernDramaProfile) {
  assertUniqueIds(profile.actQuestionSets, `${profile.playTitle} act question set`);
  if (profile.questionNavigation === "scene") return renderModernDramaSceneQuestionWorkbench(profile);
  const group = stableResponseId(profile.namespace, "act-questions", "sets");
  return `<section id="act-questions" class="course-page english-activity-page shakespeare-profile-page shakespeare-questions-page modern-drama-profile-page modern-drama-questions-page" hidden data-modern-drama-donor-parity="act-questions">
    ${renderPageHeading(profile.courseCode, profile.playTitle, `${profile.playTitle} Act Questions`, "Choose an act, answer its scene questions, and deliberately save the complete active act as one Evidence Bank collection.")}
    <div class="shakespeare-workbench-picker modern-drama-workbench-picker">
      <div><strong>Active act collection</strong><p>Responses autosave, hints remain optional, and Print / PDF stays scoped to the active act.</p></div>
      ${renderPanelPicker({ namespace: profile.namespace, group, label: "Choose an act", items: profile.actQuestionSets.map((set) => ({ id: set.id, label: `${set.title} — ${new Set(set.questions.map((question) => question.section?.trim() || set.title)).size} scenes, ${set.questions.length} questions` })) })}
    </div>
    <div class="english-activity-panel-stack">
      ${profile.actQuestionSets.map((set, setIndex) => {
        const setId = safeId(set.id);
        const prefix = stableResponseId(profile.namespace, "act-questions", setId);
        const setHeading = set.title.toLowerCase().startsWith(profile.playTitle.toLowerCase())
          ? set.title
          : `${profile.playTitle} ${set.title}`;
        return `<article class="worksheet-document english-activity-worksheet shakespeare-question-workbench modern-drama-question-workbench" data-question-panel data-activity-progress data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(setId)}" ${setIndex === 0 ? "" : "hidden"} ${renderCollectionAttributes({
          collectionId: `${prefix}:collection`,
          responsePrefix: `${prefix}:`,
          source: `${profile.playTitle} Act Questions | ${set.title}`,
          concept: `${set.title} Question Collection`,
          promptLabel: "Act question set",
          savedMessage: `${set.title} saved to Evidence Bank`,
          updatedMessage: `${set.title} updated in Evidence Bank`
        })}>
          ${renderWorksheetToolbar({ saveLabel: "Save Act Answers to Evidence Bank", includeHints: true, collectionStatus: true })}
          <header class="worksheet-document-header scene-checkpoint-heading english-dark-worksheet-header"><div><p>${escapeHtml(profile.courseCode)} Critical Analysis</p><h3>${escapeHtml(setHeading)}</h3><span>${escapeHtml(learnerFacingActivityCopy(set.subtitle, set.locator ?? "Use precise dialogue, stage action, character choices, and conflict development in every response."))}</span></div><strong class="scene-checkpoint-count">${set.questions.length} ${set.questions.length === 1 ? "prompt" : "prompts"}</strong></header>
          <div class="scene-checkpoint-body modern-drama-question-body">
            ${set.intro ? `<p class="english-activity-intro">${escapeHtml(set.intro)}</p>` : ""}
            <div class="shakespeare-scene-question-grid">
              ${set.questions.map((question, index) => {
                const section = question.section?.trim() || set.title;
                const previousSection = set.questions[index - 1]?.section?.trim() || set.title;
                const startsSection = index === 0 || section !== previousSection;
                const sectionId = `modern-drama-question-${safeId(set.id)}-${safeId(section)}`;
                return `${startsSection ? `<header id="${escapeHtml(sectionId)}" class="modern-drama-question-source-heading" data-modern-drama-question-section><span>Scene questions</span><h4>${escapeHtml(section)}</h4></header>` : ""}${renderActivityField({ field: question, responseId: `${prefix}:${safeId(question.id)}`, number: index + 1, questionStyle: true })}`;
              }).join("")}
            </div>
            <div class="worksheet-progress modern-drama-act-progress">
              <div><span>Formative Progress</span><strong data-activity-progress-label>0 of ${set.questions.length} answered</strong></div>
              <div class="worksheet-progress-track"><div data-activity-progress-fill></div></div>
            </div>
          </div>
        </article>`;
      }).join("")}
    </div>
  </section>`;
}

function renderModernDramaCharacterDossiers(profile: EnglishModernDramaProfile) {
  assertUniqueIds(profile.characters, `${profile.playTitle} character`);
  const group = stableResponseId(profile.namespace, "character-notes", "characters");
  return `<section id="character-notes" class="course-page english-activity-page shakespeare-profile-page shakespeare-character-page modern-drama-profile-page modern-drama-character-page" hidden data-modern-drama-donor-parity="character-conflict-dossiers">
    ${renderPageHeading(profile.courseCode, profile.playTitle, "Character and Conflict Notes", "Track goals, pressures, relationships, accusations, choices, changes, quotations, and the development of conflict in one evidence-rich dossier at a time.")}
    <div class="character-dossier-studio" data-shakespeare-character-studio style="--character-accent:${SHAKESPEARE_CHARACTER_ACCENTS[0]};--character-accent-rgb:45,91,79">
      <select class="english-activity-hidden-select" aria-label="Selected character and conflict dossier" data-response-id="${escapeHtml(stableResponseId(profile.namespace, "selection", "character-dossier"))}" data-english-activity-select="${escapeHtml(group)}" data-shakespeare-select-input="${escapeHtml(group)}">
        ${profile.characters.map((character) => `<option value="${escapeHtml(safeId(character.id))}">${escapeHtml(character.name)}</option>`).join("")}
      </select>
      <div class="character-dossier-shell">
        <aside class="character-dossier-nav" aria-label="Choose a character and conflict dossier">
          <div class="character-dossier-nav-copy"><h3>Character &amp; Conflict Dossiers</h3><p>Build one evidence-rich profile at a time. Working notes save automatically.</p></div>
          <div class="character-dossier-nav-list">
            ${profile.characters.map((character, index) => {
              const characterId = safeId(character.id);
              return `<button type="button" class="character-dossier-target${index === 0 ? " active" : ""}" data-shakespeare-panel-select="${escapeHtml(characterId)}" data-shakespeare-select-for="${escapeHtml(group)}" data-character-accent="${SHAKESPEARE_CHARACTER_ACCENTS[index % SHAKESPEARE_CHARACTER_ACCENTS.length]}" aria-pressed="${index === 0 ? "true" : "false"}"><div class="character-dossier-target-copy"><strong>${escapeHtml(character.name)}</strong><span data-character-progress-label="${escapeHtml(characterId)}">0% complete</span></div><div class="character-dossier-target-meter" aria-hidden="true"><div data-character-progress-bar="${escapeHtml(characterId)}"></div></div></button>`;
            }).join("")}
          </div>
          <div class="character-dossier-nav-actions"><button type="button" data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button><button type="button" class="is-secondary" data-shakespeare-character-reset>Reset active dossier</button></div>
        </aside>
        <div class="english-activity-panel-stack">
          ${profile.characters.map((character, characterIndex) => {
            const characterId = safeId(character.id);
            const fields = character.fields?.length ? character.fields : profile.characterFields;
            const prefix = stableResponseId(profile.namespace, "character-notes", characterId);
            const focusField = fields.find((field) => /conflict|change|accusation|pressure/i.test(`${field.id} ${field.label}`));
            const gridFields = fields.filter((field) => field !== focusField);
            return `<article class="worksheet-document english-activity-worksheet character-dossier-document" data-character-dossier-panel="${escapeHtml(characterId)}" data-writing-activity-panel data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(characterId)}" ${characterIndex === 0 ? "" : "hidden"} ${renderCollectionAttributes({ collectionId: `${prefix}:dossier`, responsePrefix: `${prefix}:`, source: `${profile.playTitle} | Character and Conflict Notes`, concept: `${character.name} Character and Conflict Dossier`, promptLabel: "Character and conflict dossier", savedMessage: `${character.name} dossier saved to Evidence Bank`, updatedMessage: `${character.name} dossier updated in Evidence Bank` })}>
              <header class="worksheet-document-header character-dossier-heading english-dark-worksheet-header"><div class="character-dossier-heading-copy"><p>${escapeHtml(profile.courseCode)} Character &amp; Conflict Study</p><h3>${escapeHtml(character.name)}</h3><span>${escapeHtml(character.description ?? `Track goals, pressures, relationships, choices, changes, and textual evidence for ${character.name}.`)}</span></div><div class="character-dossier-progress-badge"><strong data-character-panel-progress>0%</strong><span>complete</span></div></header>
              <div class="character-dossier-body"><div class="character-dossier-grid">${gridFields.map((field, fieldIndex) => renderDossierFieldCard(field, `${prefix}:${safeId(field.id)}`, fieldIndex + 1)).join("")}</div>${focusField ? renderDossierFieldCard(focusField, `${prefix}:${safeId(focusField.id)}`, gridFields.length + 1, true) : ""}</div>
              <div class="english-activity-final-actions"><button type="button" data-worksheet-toggle-hints aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> Show Hints</button><button type="button" data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button><button class="evidence-bank-save-action" type="button" data-save-response-collection><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save Dossier to Evidence Bank</button><span data-response-collection-status aria-live="polite"></span></div>
            </article>`;
          }).join("")}
        </div>
      </div>
    </div>
  </section>`;
}

function renderModernDramaWritingStudio(profile: EnglishModernDramaProfile) {
  const tools = profile.writingTools ?? [];
  assertUniqueIds(tools, `${profile.playTitle} writing tool`);
  const group = stableResponseId(profile.namespace, "writing-studio", "tools");
  return `<section id="writing-studio" class="course-page english-activity-page modern-drama-profile-page modern-drama-writing-page" hidden data-modern-drama-donor-parity="critical-response-workspace">
    ${renderPageHeading(profile.courseCode, profile.playTitle, "Critical/Analytical Response Workspace", "Move from close knowledge of the play to a controlled thesis, precise evidence, and a complete analytical paragraph. Every field autosaves.")}
    <div class="critical-category-grid modern-drama-writing-overview" aria-label="Writing Studio activities">
      ${tools.map((tool, index) => `<button type="button" class="critical-writing-panel modern-drama-writing-overview-card${index === 0 ? " active" : ""}" data-shakespeare-panel-select="${escapeHtml(safeId(tool.id))}" data-shakespeare-select-for="${escapeHtml(group)}" aria-pressed="${index === 0 ? "true" : "false"}"><span class="material-symbols-outlined" aria-hidden="true">${escapeHtml(["menu_book", "edit_note", "fact_check", "architecture"][index] ?? "edit_note")}</span><strong>${escapeHtml(tool.title)}</strong><span>${escapeHtml(tool.description)}</span></button>`).join("")}
    </div>
    ${renderPanelPicker({ namespace: profile.namespace, group, label: "Choose a workshop activity", items: tools.map((tool) => ({ id: tool.id, label: tool.title })), linkedButtons: true })}
    <div class="english-activity-panel-stack">
      ${tools.map((tool, toolIndex) => {
        const toolId = safeId(tool.id);
        const prefix = stableResponseId(profile.namespace, "writing-studio", toolId);
        const collection = tool.evidenceMode === "collection";
        const collectionAttributes = collection ? renderCollectionAttributes({
          collectionId: `${prefix}:collection`,
          responsePrefix: `${prefix}:`,
          source: `${profile.playTitle} | Writing Studio`,
          concept: tool.title,
          promptLabel: "Writing Studio activity",
          savedMessage: `${tool.title} saved to Evidence Bank`,
          updatedMessage: `${tool.title} updated in Evidence Bank`
        }) : "";
        const hasEvidenceSource = tool.fields.some((field) => field.evidenceRole === "source");
        const hasEvidenceConcept = tool.fields.some((field) => field.evidenceRole === "concept");
        const hiddenEvidenceFields = tool.evidenceMode === "individual"
          ? `${hasEvidenceSource ? "" : `<select class="english-activity-hidden-select" data-evidence-draft="source" aria-hidden="true" tabindex="-1"><option>${escapeHtml(`${profile.playTitle} | Writing Studio`)}</option></select>`}${hasEvidenceConcept ? "" : `<select class="english-activity-hidden-select" data-evidence-draft="concept" aria-hidden="true" tabindex="-1"><option>${escapeHtml(tool.title)}</option></select>`}`
          : "";
        return `<article class="writing-activity-panel english-activity-worksheet modern-drama-writing-workshop" data-writing-activity-panel data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(toolId)}" ${toolIndex === 0 ? "" : "hidden"} ${collectionAttributes} ${tool.evidenceMode === "individual" ? `data-evidence-notebook-panel data-evidence-contribution-id="${escapeHtml(`${prefix}:entry`)}"` : ""}>
          <header class="writing-activity-header english-dark-worksheet-header"><p>${escapeHtml(profile.courseCode)} | ${escapeHtml(profile.playTitle)}</p><h3>${escapeHtml(tool.title)}</h3><span>${escapeHtml(tool.description)}</span></header>
          ${hiddenEvidenceFields}
          <div class="critical-field-grid modern-drama-writing-grid">${tool.fields.map((field, index) => renderActivityField({ field, responseId: `${prefix}:${safeId(field.id)}`, number: index + 1 })).join("")}</div>
          <div class="english-activity-final-actions"><button type="button" data-worksheet-toggle-hints aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> Show Hints</button><button type="button" data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>${collection ? `<button class="evidence-bank-save-action" type="button" data-save-response-collection><span class="material-symbols-outlined" aria-hidden="true">library_add</span> ${escapeHtml(tool.evidenceLabel ?? "Save Activity to Evidence Bank")}</button><span data-response-collection-status aria-live="polite"></span>` : `<button class="evidence-bank-save-action" type="button" data-save-evidence-note><span class="material-symbols-outlined" aria-hidden="true">library_add</span> ${escapeHtml(tool.evidenceLabel ?? "Save to Evidence Bank")}</button><span data-save-status aria-live="polite">Draft saves automatically</span>`}</div>
        </article>`;
      }).join("")}
    </div>
  </section>`;
}

function renderModernDramaEssayNavigation(input: {
  previous?: { id: string; label: string };
  next?: { id: string; label: string };
}) {
  return `<nav class="lesson-bottom-bar modern-drama-essay-lesson-navigation" aria-label="Critical Essay lesson navigation">
    ${input.previous ? `<a class="lesson-jump" href="#${escapeHtml(input.previous.id)}" data-page-target="${escapeHtml(input.previous.id)}">Previous: ${escapeHtml(input.previous.label)}</a>` : `<a class="lesson-jump" href="#lessons" data-page-target="lessons">Course Lessons</a>`}
    ${input.next ? `<a class="lesson-jump primary" href="#${escapeHtml(input.next.id)}" data-page-target="${escapeHtml(input.next.id)}">Next: ${escapeHtml(input.next.label)}</a>` : `<a class="lesson-jump" href="#evidence-bank" data-page-target="evidence-bank">Open Evidence Bank</a>`}
  </nav>`;
}

type ModernDramaEssayStageGuidance = {
  example: string;
  tip: string;
  steps: string[];
};

const CRUCIBLE_ESSAY_STAGE_GUIDANCE: Record<string, ModernDramaEssayStageGuidance> = {
  "topic-thesis": {
    example: "A controlling thesis names Arthur Miller and The Crucible, identifies the character or conflict that develops the idea, and states what the play suggests about the assigned topic.",
    tip: "Build one arguable interpretation. Avoid turning the thesis into plot summary or a list of dramatic techniques.",
    steps: [
      "Restate the assigned topic in your own words.",
      "Name The Crucible, Arthur Miller, and the character or conflict you will use.",
      "Decide what development will structure the beginning, middle, and end body paragraphs.",
      "State what Miller suggests about the assigned topic."
    ]
  },
  introduction: {
    example: "Move from a concise observation about the larger human issue, to Salem and the play's central conflict, and then to the thesis that will control the response.",
    tip: "Keep the context purposeful. Introduce only the details a reader needs before the thesis rather than summarizing the whole play.",
    steps: [
      "Open with the larger human issue at the centre of the topic.",
      "Introduce The Crucible, Arthur Miller, the character focus, and the relevant conflict.",
      "Connect that conflict to the assigned topic.",
      "End with the revised thesis."
    ]
  },
  "body-one": {
    example: "Use a precise Act One line, stage direction, accusation, or character choice to establish the starting belief and pressure that the essay will trace.",
    tip: "Establish the argument's starting point and answer the topic; do not simply retell the opening act.",
    steps: [
      "State the focused beginning claim.",
      "Record one precise Act One quotation, action, or dramatic choice.",
      "Explain Miller's choice and its effect.",
      "Connect the evidence to the thesis and transition toward the middle."
    ]
  },
  "body-two": {
    example: "Choose an Act Two or Act Three moment when private conflict becomes public pressure. Explain the character's response, Miller's dramatic construction, and what begins to change.",
    tip: "Analyze the hinge of the argument: what forces the character to reconsider, resist, confess, accuse, or change.",
    steps: [
      "State the focused middle claim.",
      "Identify the crisis, turning point, or growing pressure.",
      "Use a precise act, scene, quotation, action, or dramatic choice as evidence.",
      "Explain how the moment advances or complicates the thesis."
    ]
  },
  "body-three": {
    example: "Use an Act Four line, refusal, confession, or final choice to show what has changed, what remains unresolved, and what the ending asks the audience to understand.",
    tip: "Do more than name the resolution. Explain why the final choice matters to Miller's larger idea.",
    steps: [
      "State the focused ending claim.",
      "Record the strongest final quotation, action, or dramatic choice.",
      "Compare the ending with the character's starting point.",
      "Explain how the ending proves or complicates the thesis."
    ]
  },
  "conclusion-revision": {
    example: "Return to the final choice or unresolved tension, connect it to the larger human issue, and leave the reader with the significance of Miller's idea.",
    tip: "Complete the interpretation instead of repeating the thesis. Keep revision notes separate from the conclusion itself.",
    steps: [
      "Synthesize the play's development and final insight.",
      "Explain the idea's broader human significance.",
      "Check paragraph order, transitions, and evidence balance.",
      "Revise diction, sentences, grammar, punctuation, and spelling."
    ]
  }
};

function crucibleEssayStageGuidance(profile: EnglishModernDramaProfile | EnglishShakespeareProfile, stage: EnglishEssayStage) {
  if (profile.kind !== "modern-drama" || profile.courseCode !== "ELA 20-1" || profile.playTitle !== "The Crucible") return undefined;
  const stageId = safeId(stage.id);
  return CRUCIBLE_ESSAY_STAGE_GUIDANCE[stageId === "thesis" ? "topic-thesis" : stageId];
}

function renderModernDramaCriticalEssayGuide(
  profile: EnglishModernDramaProfile | EnglishShakespeareProfile,
  essay: EnglishCriticalEssayProfile,
  firstStage: { id: string; label: string }
) {
  const title = essay.title ?? "Critical Analytical Essay";
  return `<section id="critical-essay" class="course-page english-activity-page modern-drama-profile-page modern-drama-essay-page modern-drama-essay-guide" hidden data-modern-drama-donor-parity="critical-essay-guide">
    ${renderPageHeading(profile.courseCode, profile.playTitle, `${title} Guide`, "Use this guide to understand the complete response, then move through each writing lesson to build the essay one section at a time.")}
    <section class="unit-outcomes modern-drama-critical-outcomes" aria-label="Critical essay success criteria"><h3>I can...</h3><ul><li>I can answer an assigned topic with a defensible interpretation of the play.</li><li>I can select precise act, scene, dialogue, and dramatic evidence.</li><li>I can explain how character, conflict, and dramatic choices develop meaning.</li><li>I can organize my ideas into a controlled critical analytical essay.</li><li>I can revise for clarity, precise language, and correctness.</li></ul></section>
    <section class="critical-writing-panel modern-drama-assignment-focus"><h3>Alberta assignment focus</h3><p>A critical analytical response asks you to choose relevant evidence, develop an interpretation, and connect that interpretation to the assigned topic. Evidence from a play can include dialogue, stage directions, character choices, conflict, structure, contrast, and recurring ideas.</p><div class="critical-category-grid"><article><strong>Thought and Understanding</strong><p>Quality of interpretation, insight, and connection to the assigned topic.</p></article><article><strong>Supporting Evidence</strong><p>Selection and explanation of dramatic details that prove the interpretation.</p></article><article><strong>Form and Structure</strong><p>Essay organization, paragraph control, transitions, and unity.</p></article><article><strong>Matters of Choice</strong><p>Diction, syntax, voice, tone, and rhetorical control.</p></article><article><strong>Matters of Correctness</strong><p>Grammar, usage, punctuation, spelling, and sentence control.</p></article></div></section>
    <section class="critical-writing-panel modern-drama-critical-lesson-map"><h3>Your writing path</h3><p>Complete the six lessons in order. The final Preview combines your saved writing exactly as entered so you can read, print, and save the complete plan.</p><ol>${essay.stages.map((stage) => `<li>${escapeHtml(stage.title)}</li>`).join("")}<li>Critical Essay Preview</li></ol></section>
    ${renderModernDramaEssayNavigation({ next: firstStage })}
  </section>`;
}

function renderModernDramaCriticalEssayStage(input: {
  profile: EnglishModernDramaProfile | EnglishShakespeareProfile;
  essay: EnglishCriticalEssayProfile;
  stage: EnglishCriticalEssayProfile["stages"][number];
  routeId: string;
  previous: { id: string; label: string };
  next: { id: string; label: string };
}) {
  const { profile, essay, stage, routeId } = input;
  const stageId = safeId(stage.id);
  const prefix = `${stableResponseId(profile.namespace, "critical-essay")}:unit:${stageId}`;
  const guidance = crucibleEssayStageGuidance(profile, stage);
  return `<section id="${escapeHtml(routeId)}" class="course-page english-activity-page modern-drama-profile-page modern-drama-essay-page modern-drama-essay-stage-page" hidden data-modern-drama-donor-parity="critical-essay-stage" data-modern-drama-print-scope>
    <article class="english-activity-worksheet modern-drama-essay-stage" data-writing-activity-panel data-activity-progress ${renderCollectionAttributes({ collectionId: `${prefix}:collection`, responsePrefix: `${prefix}:`, source: `${profile.playTitle} | Critical Essay`, concept: `${stage.title} Writing Stage`, promptLabel: "Writing stage", savedMessage: `${stage.title} saved to Evidence Bank`, updatedMessage: `${stage.title} updated in Evidence Bank` })}>
      ${renderWorksheetToolbar({ saveLabel: "Save Stage to Evidence Bank", includeHints: true, collectionStatus: true })}
      <header class="modern-drama-stage-summary english-dark-worksheet-header"><p>${escapeHtml(profile.courseCode)} | Critical Analytical Writing</p><h2>${escapeHtml(stage.title)}</h2><span>${escapeHtml(stage.focus)}</span><div class="worksheet-progress"><div><span>Stage Progress</span><strong data-activity-progress-label>0 of ${stage.fields.length} answered</strong></div><div class="worksheet-progress-track"><div data-activity-progress-fill></div></div></div></header>
      ${stage.checkpoints?.length ? `<section class="unit-outcomes modern-drama-critical-outcomes" aria-label="Success criteria"><h3>I can...</h3><ul>${stage.checkpoints.map((checkpoint) => `<li>${escapeHtml(checkpoint)}</li>`).join("")}</ul></section>` : ""}
      <section class="critical-writing-panel modern-drama-critical-lesson"><h3>Lesson</h3><p>${escapeHtml(stage.instruction ?? stage.focus)}</p>${stage.model ? `<div class="critical-model-block"><strong>${escapeHtml(stage.modelLabel ?? "Model move")}</strong><p>${escapeHtml(stage.model)}</p></div>` : ""}</section>
      ${guidance ? `<div class="modern-drama-critical-support-grid"><section class="critical-writing-panel modern-drama-critical-panel modern-drama-critical-example"><h3>Example</h3><p>${escapeHtml(guidance.example)}</p></section><section class="critical-writing-panel modern-drama-critical-panel modern-drama-critical-tip"><h3>Writing tip</h3><p>${escapeHtml(guidance.tip)}</p></section></div><section class="critical-writing-panel modern-drama-critical-panel modern-drama-critical-how-to"><h3>How to apply it</h3><ol class="modern-drama-critical-step-list">${guidance.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol></section>` : ""}
      <section class="critical-writing-panel modern-drama-critical-planner"><h3>Build ${escapeHtml(stage.title)}</h3><p>Draft the actual essay section taught above. Your work saves automatically and remains available in the final Critical Essay Preview.</p><div class="critical-field-grid modern-drama-essay-field-grid">${stage.fields.map((field, fieldIndex) => renderActivityField({ field, responseId: `${prefix}:${safeId(field.id)}`, number: fieldIndex + 1 })).join("")}</div></section>
    </article>
    ${renderModernDramaEssayNavigation({ previous: input.previous, next: input.next })}
  </section>`;
}

function renderModernDramaCriticalEssayPreview(
  profile: EnglishModernDramaProfile | EnglishShakespeareProfile,
  essay: EnglishCriticalEssayProfile,
  previous: { id: string; label: string }
) {
  const namespace = safeId(profile.namespace, "english-unit");
  const foundationStage = essay.stages[0];
  const foundationId = foundationStage ? safeId(foundationStage.id) : "topic-thesis";
  return `<section id="critical-essay-preview" class="course-page english-activity-page modern-drama-profile-page modern-drama-essay-page modern-drama-essay-preview-page" hidden data-modern-drama-donor-parity="critical-essay-preview" data-modern-essay-preview data-modern-essay-preview-namespace="${escapeHtml(namespace)}" data-modern-essay-play-title="${escapeHtml(profile.playTitle)}" data-modern-essay-foundation-stage="${escapeHtml(foundationId)}" data-modern-drama-print-scope>
    ${renderPageHeading(profile.courseCode, profile.playTitle, "Critical Essay Preview", "Read the complete plan built from your writing lessons. This preview combines your saved boxes exactly as written; it does not invent transitions or rewrite your ideas.")}
    <div class="worksheet-toolbar modern-drama-preview-toolbar"><span data-modern-essay-preview-status aria-live="polite">Your essay preview will appear here as you complete the writing lessons.</span><div class="worksheet-toolbar-actions"><button type="button" data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button><button class="evidence-bank-save-action" type="button" data-save-modern-essay-preview><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save Full Essay Plan</button></div></div>
    <section class="modern-drama-preview-foundation"><div><h3>Controlling direction</h3><p>These planning choices guide every paragraph in the response.</p></div><dl>${(foundationStage?.fields ?? []).map((field) => `<div><dt>${escapeHtml(field.label)}</dt><dd data-modern-essay-preview-foundation="${escapeHtml(safeId(field.id))}">Complete ${escapeHtml(foundationStage?.title ?? "Topic and Thesis")} to add this planning choice.</dd></div>`).join("")}</dl></section>
    <article class="modern-drama-preview-document"><header class="english-dark-worksheet-header"><p>${escapeHtml(profile.courseCode)} | Critical Analytical Writing</p><h3>Essay Draft</h3><span data-modern-essay-preview-word-count>0 words</span></header>${essay.stages.slice(1).map((stage) => `<section><h4>${escapeHtml(stage.title.replace(/ and Revision$/i, ""))}</h4><div data-modern-essay-preview-stage="${escapeHtml(safeId(stage.id))}" data-modern-essay-preview-empty="Complete ${escapeHtml(stage.title)} to build this section."><p class="modern-drama-preview-empty">Complete ${escapeHtml(stage.title)} to build this section.</p></div></section>`).join("")}</article>
    <p class="modern-drama-preview-save-status" data-modern-essay-preview-save-status aria-live="polite"></p>
    ${renderModernDramaEssayNavigation({ previous })}
  </section>`;
}

function renderModernDrama(profile: EnglishModernDramaProfile): EnglishRenderedActivityProfile {
  const pages: EnglishRenderedActivityPage[] = [
    ...(profile.scriptScenes?.length ? [{
      id: "script-reader",
      label: `${profile.playTitle} Script Reader`,
      icon: "menu_book",
      html: renderModernDramaScriptReader(profile)
    }] : []),
    {
      id: "play-materials",
      label: `${profile.playTitle} Materials`,
      icon: "menu_book",
      html: renderModernDramaMaterials(profile)
    },
    {
      id: "act-questions",
      label: "Act Questions",
      icon: "quiz",
      html: renderModernDramaQuestionWorkbench(profile)
    },
    {
      id: "character-notes",
      label: "Character & Conflict Notes",
      icon: "groups",
      html: renderModernDramaCharacterDossiers(profile)
    },
    ...(profile.writingTools?.length ? [{
      id: "writing-studio",
      label: "Writing Studio",
      icon: "edit_note",
      html: renderModernDramaWritingStudio(profile)
    }] : [])
  ];
  if (profile.materials.some((material) => material.kind === "video" && material.href)) {
    pages.splice(1, 0, { id: "film-room", label: "Film Room", icon: "smart_display", html: renderModernDramaFilmRoom(profile) });
  }
  const navGroups: EnglishRenderedActivityNavGroup[] = [];
  if (profile.essay) {
    assertUniqueIds(profile.essay.stages, `${profile.playTitle} critical essay stage`);
    const stagePages = profile.essay.stages.map((stage) => ({ id: `critical-essay-${safeId(stage.id)}`, label: stage.title, icon: "edit_note", html: "" }));
    const previewPage = { id: "critical-essay-preview", label: "Critical Essay Preview", icon: "preview", html: "" };
    const guidePage = { id: "critical-essay", label: "Critical Essay", icon: "edit_note", html: renderModernDramaCriticalEssayGuide(profile, profile.essay, stagePages[0] ?? previewPage) };
    const renderedStages = stagePages.map((page, index) => ({ ...page, html: renderModernDramaCriticalEssayStage({ profile, essay: profile.essay!, stage: profile.essay!.stages[index]!, routeId: page.id, previous: index === 0 ? { id: guidePage.id, label: "Critical Analytical Essay Guide" } : stagePages[index - 1]!, next: stagePages[index + 1] ?? previewPage }) }));
    previewPage.html = renderModernDramaCriticalEssayPreview(profile, profile.essay, renderedStages.at(-1) ?? guidePage);
    pages.push(guidePage, ...renderedStages, previewPage);
    navGroups.push({ id: guidePage.id, label: "Critical Essay", icon: "edit_note", landingItemLabel: "Critical Analytical Essay Guide", itemPageIds: [...renderedStages.map((page) => page.id), previewPage.id] });
  }
  return { kind: profile.kind, pages: configuredPages(profile, pages), navGroups, resourceLinks: profile.materials.filter((material) => Boolean(material.href)) };
}

function renderShakespeare(profile: EnglishShakespeareProfile): EnglishRenderedActivityProfile {
  const sideBySideEnabled = !profile.recipeProfile || profile.recipeProfile.activities.some((activity) => activity.enabled && activity.route === "side-by-side");
  const pages: EnglishRenderedActivityPage[] = [
    ...(sideBySideEnabled ? [{ id: "side-by-side", label: "Side-by-Side Reader", icon: "view_column", html: renderShakespeareReaderPage(profile) }] : []),
    { id: "play-materials", label: `${profile.playTitle} Materials`, icon: "menu_book", html: renderShakespeareMaterialsPage(profile) },
    { id: "act-questions", label: `${profile.playTitle} Act Questions`, icon: "quiz", html: renderShakespeareQuestionWorkbench(profile) },
    { id: "character-notes", label: `${profile.playTitle} Character Notes`, icon: "groups", html: renderShakespeareCharacterDossiers(profile) },
    { id: "writing-studio", label: "Writing Studio", icon: "edit_note", html: renderShakespeareWritingStudio(profile) }
  ];
  const navGroups: EnglishRenderedActivityNavGroup[] = [];
  if (profile.essay) {
    assertUniqueIds(profile.essay.stages, `${profile.playTitle} critical essay stage`);
    const stagePages = profile.essay.stages.map((stage) => ({ id: `critical-essay-${safeId(stage.id)}`, label: stage.title, icon: "edit_note", html: "" }));
    const previewPage = { id: "critical-essay-preview", label: "Critical Essay Preview", icon: "preview", html: "" };
    const guidePage = { id: "critical-essay", label: "Critical Essay", icon: "edit_note", html: renderModernDramaCriticalEssayGuide(profile, profile.essay, stagePages[0] ?? previewPage) };
    const renderedStages = stagePages.map((page, index) => ({
      ...page,
      html: renderModernDramaCriticalEssayStage({
        profile,
        essay: profile.essay!,
        stage: profile.essay!.stages[index]!,
        routeId: page.id,
        previous: index === 0 ? { id: guidePage.id, label: "Critical Analytical Essay Guide" } : stagePages[index - 1]!,
        next: stagePages[index + 1] ?? previewPage
      })
    }));
    previewPage.html = renderModernDramaCriticalEssayPreview(profile, profile.essay, renderedStages.at(-1) ?? guidePage);
    pages.push(guidePage, ...renderedStages, previewPage);
    navGroups.push({ id: guidePage.id, label: "Critical Essay", icon: "edit_note", landingItemLabel: "Critical Analytical Essay Guide", itemPageIds: [...renderedStages.map((page) => page.id), previewPage.id] });
  }
  return {
    kind: profile.kind,
    pages: configuredPages(profile, pages),
    navGroups,
    resourceLinks: profile.materials.filter((material) => Boolean(material.href)),
    css: SHAKESPEARE_READER_STYLES,
    runtime: SHAKESPEARE_READER_RUNTIME
  };
}

function renderNovel(profile: EnglishNovelStudyProfile): EnglishRenderedActivityProfile {
  return renderNovelStudyProfile({
    ...profile,
    recipeProfile: profile.recipeProfile?.kind === "novel-study" ? profile.recipeProfile : undefined
  });
}

function renderFilm(profile: EnglishFilmStudyProfile, context: EnglishActivityRenderContext = {}): EnglishRenderedActivityProfile {
  const rendered = renderFilmStudyProfileModule(createFilmStudyProfileRendererRecipe(profile, {
    ...context.filmStudy,
    videos: (context.videos ?? []).map((video) => ({
      id: video.id,
      title: video.lessonTitle,
      lessonTitle: video.lessonTitle,
      description: `Verified concept video from ${video.lessonTitle}.`,
      embedUrl: video.embedSrc,
      fallbackUrl: `https://www.youtube.com/watch?v=${video.id}`,
      embeddable: true,
      status: "available"
    })),
    resources: [
      ...(context.filmStudy?.resources ?? []),
      ...(profile.materials ?? []).map((material) => ({
        ...material,
        group: material.downloadable ? "Teacher Materials" : "Film Concepts",
        kind: material.downloadable ? "document" as const : "link" as const
      }))
    ]
  }));
  const pages = configuredPages(profile, rendered.pages);
  const enabledPageIds = new Set(pages.map((page) => page.id));
  const navGroups = rendered.navGroups
    .filter((group) => enabledPageIds.has(group.id))
    .map((group) => ({ ...group, itemPageIds: group.itemPageIds.filter((pageId) => enabledPageIds.has(pageId)) }));
  return { ...rendered, pages, navGroups };
}

function profileWritingWorks(profile: EnglishActivityProfile): EnglishWritingWork[] {
  switch (profile.kind) {
    case "modern-drama":
    case "shakespeare-drama":
      return [{ id: safeId(profile.playTitle), title: profile.playTitle, kind: "play" }];
    case "novel-study":
      return profile.tracks.map((track) => ({ id: safeId(track.id), title: track.title, author: track.author, kind: "novel" }));
    case "film-study": {
      const title = profile.filmSelection.mode === "selected" ? profile.filmSelection.title : "Feature Film";
      return [{ id: safeId(title), title, kind: "film" }];
    }
  }
}

function recipeWritingRouteEnabled(profile: EnglishActivityProfile, route: "critical-essay" | "personal-response") {
  return profile.recipeProfile?.activities.some((activity) => activity.enabled && activity.route === route) ?? false;
}

function appendMissingWritingSequences(profile: EnglishActivityProfile, rendered: EnglishRenderedActivityProfile): EnglishRenderedActivityProfile {
  const existing = new Set(rendered.pages.map((page) => page.id));
  const includeCriticalEssay = recipeWritingRouteEnabled(profile, "critical-essay") && !existing.has("critical-essay");
  const includePersonalResponse = recipeWritingRouteEnabled(profile, "personal-response") && !existing.has("personal-response");
  if (!includeCriticalEssay && !includePersonalResponse) return rendered;
  const writing = renderEnglishWritingSequences({
    namespace: profile.namespace,
    courseCode: profile.courseCode,
    unitTitle: profile.unitTitle,
    profileKind: profile.kind,
    works: profileWritingWorks(profile),
    visualProfile: "ela20-workbook",
    includeCriticalEssay,
    includePersonalResponse,
  });
  return {
    ...rendered,
    pages: [...rendered.pages, ...writing.pages],
    navGroups: [...(rendered.navGroups ?? []), ...writing.navGroups],
    css: [rendered.css, writing.css].filter(Boolean).join("\n"),
    runtime: [rendered.runtime, writing.runtime].filter(Boolean).join("\n"),
  };
}

export function renderEnglishActivityProfile(profile: EnglishActivityProfile, context: EnglishActivityRenderContext = {}): EnglishRenderedActivityProfile {
  if (!profile.namespace.trim()) throw new Error("English activity profile namespace is required.");
  switch (profile.kind) {
    case "modern-drama":
      return appendMissingWritingSequences(profile, renderModernDrama(profile));
    case "shakespeare-drama":
      return appendMissingWritingSequences(profile, renderShakespeare(profile));
    case "novel-study":
      return appendMissingWritingSequences(profile, renderNovel(profile));
    case "film-study":
      return appendMissingWritingSequences(profile, renderFilm(profile, context));
  }
}

export const englishActivityProfileInternals = {
  stableResponseId,
  renderCriticalEssayPage,
  renderQuestionSetPage
};
