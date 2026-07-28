import { safeId } from "./source.js";
import type {
  EnglishMaterialHook,
  EnglishRenderedActivityNavGroup,
  EnglishRenderedActivityPage,
  EnglishRenderedActivityProfile
} from "./activity-profile-renderers.js";

export type ShortFictionQuestion = {
  id: string;
  prompt: string;
  hint?: string;
  sourceLabel?: string;
};

export type ShortFictionAnalysisExample = {
  evidence: string;
  analysis: string;
  locator?: string;
};

export type ShortFictionWork = {
  id: string;
  title: string;
  author?: string;
  group?: string;
  kind?: "short-fiction" | "visual-narrative" | "paired-perspective" | "poetry";
  readingHref?: string;
  downloadHref?: string;
  questionSourceHref?: string;
  questions: ShortFictionQuestion[];
  analysisExamples?: Record<string, ShortFictionAnalysisExample[]>;
};

export type ShortFictionResource = EnglishMaterialHook & {
  group?: string;
  learnerFacing?: boolean;
};

export type ShortFictionAnalysisTerm = {
  id: string;
  label: string;
  category?: string;
  definition: string;
  writingMove?: string;
};

export type ShortFictionVisualTrack = {
  id: string;
  title: string;
  creator?: string;
  source?: string;
  imageHref?: string;
  alt?: string;
};

export type ShortFictionVisualLiteracyConfig = {
  enabled: boolean;
  title?: string;
  description?: string;
  tracks?: ShortFictionVisualTrack[];
  questions?: ShortFictionQuestion[];
  resources?: ShortFictionResource[];
};

export type RenderShortFictionProfileInput = {
  namespace: string;
  courseCode: string;
  unitTitle: string;
  works: ShortFictionWork[];
  resources?: ShortFictionResource[];
  materialsMode?: "text-bank" | "materials";
  evidenceBankRoute?: string;
  analysisTerms?: ShortFictionAnalysisTerm[];
  visualLiteracy?: ShortFictionVisualLiteracyConfig;
};

export type ShortFictionProfileRenderResult = Omit<EnglishRenderedActivityProfile, "kind"> & {
  kind: "short-fiction";
  pages: EnglishRenderedActivityPage[];
  navGroups: EnglishRenderedActivityNavGroup[];
  resourceLinks: EnglishMaterialHook[];
  css: string;
  runtime: string;
  contract: {
    schemaVersion: 1;
    namespace: string;
    materialsRoute: "story-bank" | "materials";
    workIds: string[];
    questionCounts: Record<string, number>;
    responseIdPrefixes: Record<string, string>;
    visualLiteracy: boolean;
  };
};

export const DEFAULT_SHORT_FICTION_ANALYSIS_TERMS: ShortFictionAnalysisTerm[] = [
  {
    id: "characterization",
    label: "Characterization",
    category: "Character",
    definition: "The methods a writer uses to reveal a character's traits, motives, relationships, and changes.",
    writingMove: "Name the precise action, dialogue, contrast, or description and explain what it reveals under pressure."
  },
  {
    id: "conflict",
    label: "Conflict",
    category: "Plot",
    definition: "A struggle between opposing needs, values, people, forces, or parts of a character's identity.",
    writingMove: "Explain what each side of the struggle wants and how the pressure changes the character or direction of the text."
  },
  {
    id: "setting",
    label: "Setting",
    category: "Story World",
    definition: "The time, place, social conditions, and atmosphere in which a text unfolds.",
    writingMove: "Connect a concrete setting detail to the choices available to the characters or to the text's mood and meaning."
  },
  {
    id: "point-of-view",
    label: "Point of View",
    category: "Narration",
    definition: "The perspective through which information is selected, limited, and presented to the reader.",
    writingMove: "Identify what the reader can and cannot know, then explain how that limitation shapes trust, sympathy, or interpretation."
  },
  {
    id: "irony",
    label: "Irony",
    category: "Layers of Meaning",
    definition: "A meaningful contrast between what is said, expected, intended, or understood and what is actually true or occurs.",
    writingMove: "State the expectation and the reality before explaining why the contrast matters."
  },
  {
    id: "symbolism",
    label: "Symbolism",
    category: "Layers of Meaning",
    definition: "The use of a concrete object, image, place, or action to suggest meaning beyond its literal role.",
    writingMove: "Establish the detail's literal role, trace its pattern, and connect that pattern to a larger idea."
  },
  {
    id: "tone-and-diction",
    label: "Tone and Diction",
    category: "Language",
    definition: "Tone is the attitude created by a text; diction is the writer's deliberate choice of words that helps create it.",
    writingMove: "Quote exact words, describe their connotations, and explain the attitude or emotional pressure they create."
  },
  {
    id: "theme",
    label: "Theme",
    category: "Central Ideas",
    definition: "A developed insight about people, choices, relationships, society, or experience that emerges across a text.",
    writingMove: "Express the insight as a complete, arguable statement and show how more than one moment develops it."
  }
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeNamespace(value: string) {
  const namespace = value.trim();
  if (!namespace) throw new Error("Short Fiction renderer requires a non-empty namespace.");
  if (!/^[a-z0-9][a-z0-9:_-]*$/i.test(namespace)) {
    throw new Error(`Short Fiction namespace contains unsupported characters: ${value}`);
  }
  return namespace;
}

function stableSegment(value: string, label: string) {
  const id = safeId(value, "");
  if (!id) throw new Error(`${label} requires a stable id.`);
  return id;
}

function responseId(namespace: string, ...parts: string[]) {
  return [namespace, "short-fiction", ...parts.map((part) => safeId(part))].join(":");
}

function safeHref(value: string | undefined, label: string) {
  if (!value) return undefined;
  const href = value.trim();
  if (/^(?:https?:\/\/|#|\.\.?\/|assets\/|resources\/)/i.test(href)) return href;
  throw new Error(`${label} contains an unsupported href: ${value}`);
}

function assertUniqueIds(items: Array<{ id: string }>, label: string) {
  const seen = new Set<string>();
  for (const item of items) {
    const id = stableSegment(item.id, label);
    if (seen.has(id)) throw new Error(`${label} contains duplicate id: ${item.id}`);
    seen.add(id);
  }
}

function normalizeInput(input: RenderShortFictionProfileInput) {
  const namespace = safeNamespace(input.namespace);
  const courseCode = input.courseCode.trim();
  const unitTitle = input.unitTitle.trim();
  if (!courseCode) throw new Error("Short Fiction renderer requires a course code.");
  if (!unitTitle) throw new Error("Short Fiction renderer requires a unit title.");
  if (!input.works.length) throw new Error("Short Fiction renderer requires at least one configured work.");
  assertUniqueIds(input.works, "Short Fiction works");
  assertUniqueIds(input.resources ?? [], "Short Fiction resources");
  assertUniqueIds(input.analysisTerms ?? DEFAULT_SHORT_FICTION_ANALYSIS_TERMS, "Short Fiction analysis terms");
  input.works.forEach((work) => {
    assertUniqueIds(work.questions, `${work.title} questions`);
    safeHref(work.readingHref, `${work.title} reading`);
    safeHref(work.downloadHref, `${work.title} download`);
    safeHref(work.questionSourceHref, `${work.title} question source`);
  });
  (input.resources ?? []).forEach((resource) => safeHref(resource.href, `${resource.title} resource`));
  const visual = input.visualLiteracy;
  if (visual?.enabled) {
    if (!/^ELA\s*30-2$/i.test(courseCode)) {
      throw new Error("The optional Visual Literacy activity is available only for ELA 30-2.");
    }
    assertUniqueIds(visual.tracks ?? [], "Visual Literacy tracks");
    assertUniqueIds(visual.questions ?? [], "Visual Literacy questions");
    assertUniqueIds(visual.resources ?? [], "Visual Literacy resources");
    (visual.tracks ?? []).forEach((track) => safeHref(track.imageHref, `${track.title} visual`));
    (visual.resources ?? []).forEach((resource) => safeHref(resource.href, `${resource.title} visual resource`));
  }
  return {
    ...input,
    namespace,
    courseCode,
    unitTitle,
    materialsMode: input.materialsMode ?? "text-bank" as const,
    evidenceBankRoute: stableSegment(input.evidenceBankRoute ?? "evidence-bank", "Evidence Bank route"),
    analysisTerms: input.analysisTerms?.length ? input.analysisTerms : DEFAULT_SHORT_FICTION_ANALYSIS_TERMS
  };
}

function pageHeading(courseCode: string, unitTitle: string, title: string, description: string) {
  return `<p class="route-kicker">${escapeHtml(courseCode)} | ${escapeHtml(unitTitle)}</p>
    <h2 class="route-title">${escapeHtml(title)}</h2>
    <p class="route-description">${escapeHtml(description)}</p>`;
}

function collectionAttributes(input: {
  id: string;
  prefix: string;
  source: string;
  activityId: string;
  activityTitle: string;
  workId: string;
  workTitle: string;
  promptLabel: string;
  savedMessage: string;
  updatedMessage: string;
  tags?: string[];
}) {
  return `data-response-collection
    data-evidence-collection-id="${escapeHtml(input.id)}"
    data-evidence-response-prefix="${escapeHtml(input.prefix)}"
    data-evidence-source="${escapeHtml(input.source)}"
    data-evidence-concept="${escapeHtml(input.activityTitle)}"
    data-evidence-activity-id="${escapeHtml(input.activityId)}"
    data-evidence-activity-title="${escapeHtml(input.activityTitle)}"
    data-evidence-work-id="${escapeHtml(input.workId)}"
    data-evidence-work-title="${escapeHtml(input.workTitle)}"
    data-evidence-entry-type="collection"
    data-evidence-tags="${escapeHtml((input.tags ?? ["short-fiction"]).join(","))}"
    data-evidence-prompt-label="${escapeHtml(input.promptLabel)}"
    data-evidence-detail-label="Saved responses"
    data-evidence-saved-message="${escapeHtml(input.savedMessage)}"
    data-evidence-updated-message="${escapeHtml(input.updatedMessage)}"`;
}

function toolbar(saveLabel: string, evidenceBankRoute: string, includeSave = true) {
  return `<div class="worksheet-toolbar">
    <span class="worksheet-save-status"><span>Responses save automatically</span><span data-response-collection-status aria-live="polite"></span></span>
    <div class="worksheet-toolbar-actions">
      <button type="button" data-worksheet-toggle-hints aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> Show Hints</button>
      <button type="button" data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
      ${includeSave ? `<button class="evidence-bank-save-action" type="button" data-save-response-collection><span class="material-symbols-outlined" aria-hidden="true">library_add</span> ${escapeHtml(saveLabel)}</button>` : ""}
      <a class="short-fiction-secondary-action" href="#${escapeHtml(evidenceBankRoute)}" data-page-target="${escapeHtml(evidenceBankRoute)}">Open Evidence Bank</a>
    </div>
  </div>`;
}

function buildQuestionHint(prompt: string) {
  const normalized = prompt.toLowerCase();
  if (/visual|image|panel|frame|colour|color|light|shadow|composition/.test(normalized)) {
    return "Identify one precise visual detail first, then explain how the creator's choice shapes the viewer's understanding.";
  }
  if (/compare|contrast|both|perspective|article/.test(normalized)) {
    return "Use one precise detail from each text, establish a clear basis for comparison, and explain why the relationship matters.";
  }
  if (/character|motivation|trait|change|relationship/.test(normalized)) {
    return "Trace what the character says, does, avoids, or chooses under pressure, then explain what that pattern reveals.";
  }
  if (/setting|tone|mood|diction|symbol|theme|irony|device/.test(normalized)) {
    return "Select exact language or a precise story moment, explain its immediate effect, and connect it to a larger idea in the text.";
  }
  return "Answer the question directly, use one precise detail from the text, and explain how that evidence supports your interpretation.";
}

function renderEmptyReader(work: ShortFictionWork) {
  return `<div class="short-fiction-access-notice">
    <span class="material-symbols-outlined" aria-hidden="true">menu_book</span>
    <div><strong>Use the assigned copy of ${escapeHtml(work.title)}</strong><p>The complete text is not packaged in this unit. Keep your teacher-provided or school-licensed copy open while you work.</p></div>
  </div>`;
}

function renderWorkActions(work: ShortFictionWork) {
  const readingHref = safeHref(work.readingHref, `${work.title} reading`);
  const downloadHref = safeHref(work.downloadHref, `${work.title} download`) ?? readingHref;
  const questionHref = safeHref(work.questionSourceHref, `${work.title} question source`);
  if (!readingHref && !questionHref) return "";
  return `<div class="short-fiction-reader-actions">
    ${readingHref ? `<a href="${escapeHtml(readingHref)}" target="_blank" rel="noopener noreferrer">Open</a><button type="button" data-short-fiction-fullscreen-src="${escapeHtml(readingHref)}" data-short-fiction-fullscreen-title="${escapeHtml(work.title)}">Full Screen</button>` : ""}
    ${downloadHref ? `<a href="${escapeHtml(downloadHref)}" download>Download</a>` : ""}
    ${questionHref ? `<a class="short-fiction-secondary-action" href="${escapeHtml(questionHref)}" target="_blank" rel="noopener noreferrer">Question Sheet</a>` : ""}
  </div>`;
}

function renderMaterialsPage(input: ReturnType<typeof normalizeInput>) {
  const route = input.materialsMode === "materials" ? "materials" : "story-bank";
  const title = input.materialsMode === "materials" ? "Materials" : "Text Bank";
  const description = input.materialsMode === "materials"
    ? "Open assigned texts and teacher-selected documents beside the unit activities."
    : "Choose an assigned text to read, open full screen, or download where a packaged copy is available.";
  const firstWork = stableSegment(input.works[0].id, "Short Fiction work");
  const group = responseId(input.namespace, "materials", "work");
  return {
    id: route,
    label: title,
    icon: "menu_book",
    html: `<section id="${route}" class="course-page english-activity-page short-fiction-page short-fiction-materials-page" hidden>
      ${pageHeading(input.courseCode, input.unitTitle, title, description)}
      <div class="short-fiction-library-browser">
        <aside class="short-fiction-library-list" aria-label="Assigned texts">
          <h3>${escapeHtml(input.unitTitle)} texts</h3>
          <p>Choose a text to keep it open beside your course work.</p>
          <label class="short-fiction-mobile-picker">Choose a text
            <select data-english-activity-select="${escapeHtml(group)}" data-response-id="${escapeHtml(responseId(input.namespace, "materials", "selected-work"))}">
              ${input.works.map((work, index) => `<option value="${escapeHtml(stableSegment(work.id, "Short Fiction work"))}"${index === 0 ? " selected" : ""}>${escapeHtml(work.title)}</option>`).join("")}
            </select>
          </label>
          <div class="short-fiction-work-list">
            ${input.works.map((work, index) => `<button type="button" class="short-fiction-work-tab${index === 0 ? " active" : ""}" data-short-fiction-work-button="${escapeHtml(stableSegment(work.id, "Short Fiction work"))}" data-short-fiction-select-for="${escapeHtml(group)}" aria-pressed="${index === 0 ? "true" : "false"}">
              <span>${index + 1}</span><span><strong>${escapeHtml(work.title)}</strong><small>${escapeHtml(work.author || work.group || "Assigned text")}</small></span>
            </button>`).join("")}
          </div>
        </aside>
        <div class="short-fiction-library-reader">
          ${input.works.map((work) => {
            const workId = stableSegment(work.id, "Short Fiction work");
            const readingHref = safeHref(work.readingHref, `${work.title} reading`);
            return `<article data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(workId)}"${workId === firstWork ? "" : " hidden"}>
              <header class="short-fiction-reader-header">
                <div><p>${escapeHtml(work.group || (work.kind === "visual-narrative" ? "Visual Narrative" : "Assigned Text"))}</p><h3>${escapeHtml(work.title)}</h3>${work.author ? `<span>${escapeHtml(work.author)}</span>` : ""}</div>
                ${renderWorkActions(work)}
              </header>
              ${readingHref ? `<iframe class="short-fiction-reader-frame" src="${escapeHtml(readingHref)}" title="${escapeHtml(work.title)}"></iframe>` : renderEmptyReader(work)}
            </article>`;
          }).join("")}
        </div>
      </div>
      <div class="short-fiction-reader-overlay" data-short-fiction-reader-overlay hidden>
        <div role="dialog" aria-modal="true" aria-labelledby="short-fiction-reader-overlay-title">
          <header><h3 id="short-fiction-reader-overlay-title" data-short-fiction-reader-overlay-title>Course text</h3><button type="button" data-short-fiction-reader-close><span class="material-symbols-outlined" aria-hidden="true">close</span> Close</button></header>
          <iframe title="Full-screen course text" data-short-fiction-reader-overlay-frame></iframe>
        </div>
      </div>
    </section>`
  } satisfies EnglishRenderedActivityPage;
}

function renderQuestionField(input: {
  namespace: string;
  workId: string;
  question: ShortFictionQuestion;
  index: number;
}) {
  const questionId = stableSegment(input.question.id, "Short Fiction question");
  const id = responseId(input.namespace, "story-questions", input.workId, questionId);
  return `<div class="worksheet-question" data-activity-response data-evidence-question-number="${input.index + 1}" data-evidence-question-prompt="${escapeHtml(input.question.prompt)}">
    <div class="worksheet-question-prompt"><strong>${input.index + 1}.</strong><span>${escapeHtml(input.question.prompt)}</span></div>
    <div class="worksheet-hint" data-question-hint hidden><strong>Hint:</strong> ${escapeHtml(input.question.hint?.trim() || buildQuestionHint(input.question.prompt))}</div>
    <label class="worksheet-answer-field"><span class="sr-only">Answer question ${input.index + 1}</span><textarea rows="5" data-response-id="${escapeHtml(id)}" placeholder="Type your analytical response here..."></textarea><span class="worksheet-word-count" data-activity-word-count>0 words</span></label>
  </div>`;
}

function renderQuestionPage(input: ReturnType<typeof normalizeInput>) {
  const group = responseId(input.namespace, "story-questions", "work");
  const firstWork = stableSegment(input.works[0].id, "Short Fiction work");
  return {
    id: "story-questions",
    label: "Story Questions",
    icon: "quiz",
    html: `<section id="story-questions" class="course-page english-activity-page short-fiction-page short-fiction-question-page" hidden>
      ${pageHeading(input.courseCode, input.unitTitle, "Story Questions", "Choose a text, answer its complete question set, and deliberately save that story's responses as one Evidence Bank collection.")}
      <label class="short-fiction-work-picker">Choose a text
        <select data-english-activity-select="${escapeHtml(group)}" data-response-id="${escapeHtml(responseId(input.namespace, "story-questions", "selected-work"))}">
          ${input.works.map((work, index) => `<option value="${escapeHtml(stableSegment(work.id, "Short Fiction work"))}"${index === 0 ? " selected" : ""}>${escapeHtml(work.title)} — ${work.questions.length} ${work.questions.length === 1 ? "question" : "questions"}</option>`).join("")}
        </select>
      </label>
      <div class="short-fiction-question-stack">
        ${input.works.map((work) => {
          const workId = stableSegment(work.id, "Short Fiction work");
          const prefix = responseId(input.namespace, "story-questions", workId);
          const sourceHref = safeHref(work.questionSourceHref, `${work.title} question source`);
          const collection = collectionAttributes({
            id: `${prefix}:collection`,
            prefix: `${prefix}:`,
            source: `${work.title} | Story Questions`,
            activityId: "story-questions",
            activityTitle: "Story Questions",
            workId,
            workTitle: work.title,
            promptLabel: `${work.title} question set`,
            savedMessage: `${work.title} answers saved to Evidence Bank`,
            updatedMessage: `${work.title} answers updated in Evidence Bank`,
            tags: ["short-fiction", "story-questions", workId]
          });
          return `<article class="english-activity-worksheet short-fiction-question-panel" data-english-activity-panel-group="${escapeHtml(group)}" data-english-activity-panel="${escapeHtml(workId)}" data-question-panel data-activity-progress ${collection}${workId === firstWork ? "" : " hidden"}>
            ${toolbar("Save Story Answers to Evidence Bank", input.evidenceBankRoute, work.questions.length > 0)}
            <header class="worksheet-document-header english-dark-worksheet-header short-fiction-dark-header">
              <p>${escapeHtml(input.courseCode)} | Guided Analysis</p><h3>${escapeHtml(work.title)}</h3>${work.author ? `<span>${escapeHtml(work.author)}</span>` : ""}
              <div class="worksheet-progress"><div><span>Formative Progress</span><strong data-activity-progress-label>0 of ${work.questions.length} answered</strong></div><div class="worksheet-progress-track"><div data-activity-progress-fill></div></div></div>
            </header>
            <div class="short-fiction-question-body">
              ${sourceHref ? `<a class="short-fiction-source-link" href="${escapeHtml(sourceHref)}" target="_blank" rel="noopener noreferrer">Open original question sheet</a>` : ""}
              ${work.questions.length ? work.questions.map((question, index) => renderQuestionField({ namespace: input.namespace, workId, question, index })).join("") : `<div class="short-fiction-empty-state"><strong>No mapped question set yet</strong><p>This text remains available for reading, but no teacher-selected questions have been placed in this review build.</p></div>`}
            </div>
          </article>`;
        }).join("")}
      </div>
    </section>`
  } satisfies EnglishRenderedActivityPage;
}

function renderAnalysisExample(example: ShortFictionAnalysisExample, index: number) {
  return `<article class="short-fiction-analysis-example"><h4>Example ${index + 1}${example.locator ? ` — ${escapeHtml(example.locator)}` : ""}</h4><div><section><strong>Textual or visual evidence</strong><p>${escapeHtml(example.evidence)}</p></section><section><strong>Analytical breakdown</strong><p>${escapeHtml(example.analysis)}</p></section></div></article>`;
}

function renderWritingStudio(input: ReturnType<typeof normalizeInput>) {
  const firstWorkId = stableSegment(input.works[0].id, "Short Fiction work");
  const firstTermId = stableSegment(input.analysisTerms[0].id, "Short Fiction analysis term");
  const analysisPrefix = responseId(input.namespace, "writing-studio", "analysis");
  const paragraphGroup = responseId(input.namespace, "writing-studio", "paragraph-work");
  return {
    id: "writing-studio",
    label: "Writing Studio",
    icon: "edit_note",
    html: `<section id="writing-studio" class="course-page english-activity-page short-fiction-page short-fiction-writing-page" hidden>
      ${pageHeading(input.courseCode, input.unitTitle, "Writing Studio", "Study literary terms in the assigned texts, keep useful evidence, and build a focused analytical paragraph.")}
      <section class="short-fiction-analysis-explorer" data-short-fiction-analysis-explorer>
        <header class="short-fiction-section-header short-fiction-dark-header"><p>Model bank</p><h3>Analysis Explorer</h3><span>Choose a literary term and a text. Supplied examples are clearly separated from your own analysis.</span></header>
        <div class="short-fiction-analysis-controls">
          <label>Literary term<select data-short-fiction-analysis-term data-response-id="${escapeHtml(responseId(input.namespace, "writing-studio", "selected-term"))}">${input.analysisTerms.map((term, index) => `<option value="${escapeHtml(stableSegment(term.id, "Short Fiction analysis term"))}"${index === 0 ? " selected" : ""}>${escapeHtml(term.label)}</option>`).join("")}</select></label>
          <label>Text<select data-short-fiction-analysis-work data-response-id="${escapeHtml(responseId(input.namespace, "writing-studio", "selected-analysis-work"))}">${input.works.map((work, index) => `<option value="${escapeHtml(stableSegment(work.id, "Short Fiction work"))}"${index === 0 ? " selected" : ""}>${escapeHtml(work.title)}</option>`).join("")}</select></label>
        </div>
        <div class="short-fiction-analysis-results">
          ${input.works.flatMap((work) => input.analysisTerms.map((term) => {
            const workId = stableSegment(work.id, "Short Fiction work");
            const termId = stableSegment(term.id, "Short Fiction analysis term");
            const examples = work.analysisExamples?.[term.id] ?? work.analysisExamples?.[termId] ?? [];
            const active = workId === firstWorkId && termId === firstTermId;
            return `<section data-short-fiction-analysis-panel data-short-fiction-analysis-work-id="${escapeHtml(workId)}" data-short-fiction-analysis-term-id="${escapeHtml(termId)}"${active ? "" : " hidden"}>
              <div class="short-fiction-term-definition"><p>${escapeHtml(term.category || "Literary analysis")}</p><h3>${escapeHtml(term.label)}</h3><span>${escapeHtml(term.definition)}</span></div>
              <div class="short-fiction-term-work"><strong>${escapeHtml(work.title)}</strong>${work.author ? `<span>${escapeHtml(work.author)}</span>` : ""}</div>
              ${examples.length ? `<div class="short-fiction-analysis-example-list">${examples.map(renderAnalysisExample).join("")}</div>` : `<div class="short-fiction-analysis-framework"><strong>Build the example from the text</strong><p>No model quotation has been invented for this work. Locate a precise moment, name the choice, and use this writing move:</p><p>${escapeHtml(term.writingMove || "Explain what the choice reveals and why it matters to the text as a whole.")}</p></div>`}
            </section>`;
          })).join("")}
        </div>
      </section>
      <section class="short-fiction-evidence-capture" data-writing-activity-panel data-evidence-notebook-panel>
        <header class="short-fiction-section-header short-fiction-dark-header"><p>Evidence Bank</p><h3>Keep an analysis example</h3><span>Save a precise story moment and your explanation as an individual Evidence Bank entry.</span></header>
        <div class="short-fiction-two-column-fields">
          <label>Source text<select data-response-id="${escapeHtml(`${analysisPrefix}:source`)}" data-evidence-draft="source">${input.works.map((work) => `<option value="${escapeHtml(work.title)}">${escapeHtml(work.title)} | Writing Studio</option>`).join("")}</select></label>
          <label>Literary concept<select data-response-id="${escapeHtml(`${analysisPrefix}:concept`)}" data-evidence-draft="concept">${input.analysisTerms.map((term) => `<option value="${escapeHtml(term.label)}">${escapeHtml(term.label)}</option>`).join("")}</select></label>
        </div>
        <label>Exact textual or visual evidence<textarea rows="4" data-response-id="${escapeHtml(`${analysisPrefix}:detail`)}" data-evidence-draft="detail" placeholder="Record the quotation, action, description, panel, or image detail."></textarea></label>
        <label>Analytical breakdown<textarea rows="4" data-response-id="${escapeHtml(`${analysisPrefix}:connection`)}" data-evidence-draft="connection" placeholder="Explain how the author's or creator's choice develops meaning."></textarea></label>
        <div class="english-evidence-actions"><button class="evidence-bank-save-action" type="button" data-save-evidence-note><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save Analysis to Evidence Bank</button><a class="short-fiction-secondary-action" href="#${escapeHtml(input.evidenceBankRoute)}" data-page-target="${escapeHtml(input.evidenceBankRoute)}">Open Evidence Bank</a><span data-save-status aria-live="polite">Draft saves automatically</span></div>
      </section>
      <section class="short-fiction-paragraph-builder">
        <header class="short-fiction-section-header short-fiction-dark-header"><p>Analytical writing</p><h3>Build an Analytical Paragraph</h3><span>Complete one focused paragraph for the selected text. Each text keeps separate autosaved work.</span></header>
        <label class="short-fiction-work-picker">Choose a text<select data-english-activity-select="${escapeHtml(paragraphGroup)}" data-response-id="${escapeHtml(responseId(input.namespace, "writing-studio", "selected-paragraph-work"))}">${input.works.map((work, index) => `<option value="${escapeHtml(stableSegment(work.id, "Short Fiction work"))}"${index === 0 ? " selected" : ""}>${escapeHtml(work.title)}</option>`).join("")}</select></label>
        ${input.works.map((work) => {
          const workId = stableSegment(work.id, "Short Fiction work");
          const prefix = responseId(input.namespace, "writing-studio", workId, "paragraph");
          const collection = collectionAttributes({
            id: `${prefix}:collection`, prefix: `${prefix}:`, source: `${work.title} | Writing Studio`, activityId: "analytical-paragraph",
            activityTitle: "Analytical Paragraph", workId, workTitle: work.title, promptLabel: "Analytical paragraph plan",
            savedMessage: `${work.title} paragraph saved to Evidence Bank`, updatedMessage: `${work.title} paragraph updated in Evidence Bank`,
            tags: ["short-fiction", "writing-studio", "analytical-paragraph", workId]
          });
          const fields = [
            ["claim", "Focused claim", "State what the text suggests about a character, conflict, or larger idea.", "Make the claim arguable and specific enough to prove."],
            ["evidence", "Precise evidence", "Record the quotation, action, description, or visual detail.", "Include enough context for a reader to understand the evidence."],
            ["choice", "Author's or creator's choice", "Name the literary or visual choice you will analyze.", "Choose the term that most precisely describes how the evidence works."],
            ["analysis", "Analysis", "Explain what the evidence reveals and how the choice creates that meaning.", "Move beyond restating the evidence; explain the relationship between detail and idea."],
            ["link", "Connection to the larger idea", "Connect the paragraph back to the controlling idea or theme.", "Finish by showing why this paragraph matters to the text as a whole."]
          ] as const;
          return `<article class="english-activity-worksheet short-fiction-paragraph-panel" data-english-activity-panel-group="${escapeHtml(paragraphGroup)}" data-english-activity-panel="${escapeHtml(workId)}" data-writing-activity-panel data-activity-progress ${collection}${workId === firstWorkId ? "" : " hidden"}>
            ${toolbar("Save Paragraph to Evidence Bank", input.evidenceBankRoute)}
            <header class="worksheet-document-header english-dark-worksheet-header short-fiction-dark-header"><p>${escapeHtml(input.courseCode)} | Analytical Writing</p><h3>${escapeHtml(work.title)}</h3><span>Focused analytical paragraph</span><div class="worksheet-progress"><div><span>Draft Progress</span><strong data-activity-progress-label>0 of ${fields.length} answered</strong></div><div class="worksheet-progress-track"><div data-activity-progress-fill></div></div></div></header>
            <div class="short-fiction-paragraph-fields">${fields.map(([id, label, placeholder, hint], index) => `<div class="english-activity-field" data-activity-response data-evidence-question-number="${index + 1}" data-evidence-question-prompt="${escapeHtml(label)}"><label>${escapeHtml(label)}<textarea rows="4" data-response-id="${escapeHtml(`${prefix}:${id}`)}" placeholder="${escapeHtml(placeholder)}"></textarea><span data-activity-word-count>0 words</span></label><div class="worksheet-hint" data-question-hint hidden><strong>Hint:</strong> ${escapeHtml(hint)}</div></div>`).join("")}</div>
          </article>`;
        }).join("")}
      </section>
    </section>`
  } satisfies EnglishRenderedActivityPage;
}

function renderVisualLiteracyPage(input: ReturnType<typeof normalizeInput>) {
  const config = input.visualLiteracy;
  if (!config?.enabled) return undefined;
  const tracks = config.tracks?.length ? config.tracks : [{ id: "current-visual", title: "Current Visual" }];
  const questions = config.questions ?? [];
  const trackGroup = responseId(input.namespace, "visual-literacy", "track");
  const firstTrackId = stableSegment(tracks[0].id, "Visual Literacy track");
  return {
    id: "visual-literacy",
    label: "Visual Literacy",
    icon: "image_search",
    html: `<section id="visual-literacy" class="course-page english-activity-page short-fiction-page short-fiction-visual-literacy-page" hidden>
      ${pageHeading(input.courseCode, input.unitTitle, config.title ?? "Visual Literacy Lab", config.description ?? "Observe precisely, analyze visual choices, and connect those choices to a developed interpretation.")}
      <label class="short-fiction-work-picker">Choose a visual<select data-english-activity-select="${escapeHtml(trackGroup)}" data-response-id="${escapeHtml(responseId(input.namespace, "visual-literacy", "selected-track"))}">${tracks.map((track, index) => `<option value="${escapeHtml(stableSegment(track.id, "Visual Literacy track"))}"${index === 0 ? " selected" : ""}>${escapeHtml(track.title)}</option>`).join("")}</select></label>
      ${tracks.map((track) => {
        const trackId = stableSegment(track.id, "Visual Literacy track");
        const prefix = responseId(input.namespace, "visual-literacy", trackId);
        const collection = collectionAttributes({ id: `${prefix}:collection`, prefix: `${prefix}:`, source: `${track.title} | Visual Literacy`, activityId: "visual-literacy", activityTitle: "Visual Literacy Notes", workId: trackId, workTitle: track.title, promptLabel: "Visual-literacy analysis", savedMessage: `${track.title} notes saved to Evidence Bank`, updatedMessage: `${track.title} notes updated in Evidence Bank`, tags: ["visual-literacy", trackId] });
        const imageHref = safeHref(track.imageHref, `${track.title} visual`);
        const coreQuestions: ShortFictionQuestion[] = [
          { id: "literal-observation", prompt: "What can you observe literally before interpreting the visual?", hint: "List visible people, objects, setting details, text, colour, light, and composition without guessing at meaning yet." },
          { id: "visual-choice", prompt: "Which visual choice most strongly directs attention, and how does it work?", hint: "Name the specific compositional, colour, lighting, angle, symbol, or contrast choice." },
          { id: "interpretation", prompt: "What central idea or unifying effect develops through these details?", hint: "State an arguable idea and connect at least two observed details to it." }
        ];
        const activeQuestions = [...coreQuestions, ...questions];
        return `<article class="english-activity-worksheet short-fiction-visual-panel" data-english-activity-panel-group="${escapeHtml(trackGroup)}" data-english-activity-panel="${escapeHtml(trackId)}" data-writing-activity-panel data-activity-progress ${collection}${trackId === firstTrackId ? "" : " hidden"}>
          ${toolbar("Save Visual-Literacy Notes", input.evidenceBankRoute)}
          <header class="worksheet-document-header english-dark-worksheet-header short-fiction-dark-header"><p>${escapeHtml(input.courseCode)} | Visual Literacy</p><h3>${escapeHtml(track.title)}</h3>${track.creator || track.source ? `<span>${escapeHtml([track.creator, track.source].filter(Boolean).join(" | "))}</span>` : ""}<div class="worksheet-progress"><div><span>Analysis Progress</span><strong data-activity-progress-label>0 of ${activeQuestions.length} answered</strong></div><div class="worksheet-progress-track"><div data-activity-progress-fill></div></div></div></header>
          <div class="short-fiction-visual-body">${imageHref ? `<figure><img src="${escapeHtml(imageHref)}" alt="${escapeHtml(track.alt || `Teacher-authorized visual: ${track.title}`)}"><figcaption>${escapeHtml(track.title)}</figcaption></figure>` : `<div class="short-fiction-access-notice"><span class="material-symbols-outlined" aria-hidden="true">image</span><div><strong>Use the assigned visual</strong><p>Enter observations from the teacher-authorized visual supplied for this activity.</p></div></div>`}${activeQuestions.map((question, index) => renderQuestionField({ namespace: input.namespace, workId: `visual-literacy:${trackId}`, question, index })).join("")}</div>
        </article>`;
      }).join("")}
    </section>`
  } satisfies EnglishRenderedActivityPage;
}

function buildResourceLinks(input: ReturnType<typeof normalizeInput>) {
  const links: EnglishMaterialHook[] = [];
  input.works.forEach((work) => {
    const href = safeHref(work.readingHref, `${work.title} reading`);
    if (!href) return;
    links.push({ id: `text-${stableSegment(work.id, "Short Fiction work")}`, title: work.title, kind: work.kind === "visual-narrative" ? "image" : "document", description: work.author ? `Assigned text by ${work.author}.` : "Assigned unit text.", href, downloadable: Boolean(work.downloadHref || !/^https?:\/\//i.test(href)), status: "available" });
  });
  links.push(...(input.resources ?? []).filter((resource) => resource.learnerFacing !== false));
  links.push(...(input.visualLiteracy?.resources ?? []).filter((resource) => resource.learnerFacing !== false));
  const seen = new Set<string>();
  return links.filter((link) => {
    const id = stableSegment(link.id, "Short Fiction resource");
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export const SHORT_FICTION_PROFILE_CSS = `
.short-fiction-page { --short-fiction-green: #154212; --short-fiction-green-hover: #2d5a27; --short-fiction-ink: #161a17; --short-fiction-soft: #f3f6f1; }
.short-fiction-page .short-fiction-dark-header { background: #161a17; color: #fff; }
.short-fiction-page .short-fiction-dark-header p { color: #b9c3b2; }
.short-fiction-page .short-fiction-dark-header h3 { color: #fff; }
.short-fiction-page .short-fiction-dark-header span { color: #d7ddd4; }
.short-fiction-library-browser { display: grid; grid-template-columns: minmax(240px, 300px) minmax(0, 1fr); gap: 24px; align-items: start; margin-top: 24px; }
.short-fiction-library-list, .short-fiction-library-reader, .short-fiction-analysis-explorer, .short-fiction-evidence-capture, .short-fiction-paragraph-builder { border: 1px solid #d9dadb; border-radius: 8px; background: #fff; }
.short-fiction-library-list { padding: 18px; }
.short-fiction-library-list h3 { margin: 0 0 6px; font-family: "Hanken Grotesk", sans-serif; font-size: 24px; }
.short-fiction-library-list > p { margin: 0; color: #5d6359; line-height: 1.5; }
.short-fiction-mobile-picker, .short-fiction-work-picker { display: grid; gap: 8px; margin: 20px 0; color: #154212; font-weight: 800; }
.short-fiction-mobile-picker select, .short-fiction-work-picker select, .short-fiction-analysis-controls select { width: 100%; min-height: 46px; border: 1px solid #b9c5b1; border-radius: 6px; background: #fff; color: #191c1d; padding: 9px 11px; font: inherit; }
.short-fiction-work-list { display: grid; gap: 9px; margin-top: 16px; }
.short-fiction-work-tab { display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 10px; align-items: center; width: 100%; border: 1px solid #d9dadb; border-radius: 6px; background: #f8f9f7; color: #191c1d; padding: 10px; text-align: left; cursor: pointer; }
.short-fiction-work-tab > span:first-child { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 6px; background: #154212; color: #fff; font-weight: 800; }
.short-fiction-work-tab strong, .short-fiction-work-tab small { display: block; overflow-wrap: anywhere; }
.short-fiction-work-tab small { margin-top: 3px; color: #626860; }
.short-fiction-work-tab:hover, .short-fiction-work-tab:focus-visible, .short-fiction-work-tab.active { border-color: #154212; background: #f1f5ef; outline: 2px solid rgba(21,66,18,.14); outline-offset: 1px; }
.short-fiction-library-reader { min-width: 0; padding: 18px; }
.short-fiction-library-reader > [hidden], .short-fiction-question-stack > [hidden], .short-fiction-paragraph-builder > [hidden], .short-fiction-visual-literacy-page > [hidden], [data-short-fiction-analysis-panel][hidden] { display: none !important; }
.short-fiction-reader-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; margin-bottom: 16px; }
.short-fiction-reader-header p { margin: 0 0 4px; color: #154212; font-size: 12px; font-weight: 800; text-transform: uppercase; }
.short-fiction-reader-header h3 { margin: 0; font-family: "Hanken Grotesk", sans-serif; font-size: 26px; line-height: 1.15; }
.short-fiction-reader-header span { display: block; margin-top: 5px; color: #5d6359; }
.short-fiction-reader-actions, .worksheet-toolbar-actions, .english-evidence-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.short-fiction-reader-actions a, .short-fiction-reader-actions button, .short-fiction-secondary-action { min-height: 40px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid #154212; border-radius: 6px; background: #154212; color: #fff; padding: 8px 12px; font: 700 13px/1.2 "IBM Plex Sans", sans-serif; text-decoration: none; cursor: pointer; }
.short-fiction-reader-actions .short-fiction-secondary-action, .short-fiction-secondary-action { background: #fff; color: #154212; }
.short-fiction-reader-actions a:hover, .short-fiction-reader-actions button:hover, .short-fiction-reader-actions a:focus-visible, .short-fiction-reader-actions button:focus-visible, .short-fiction-secondary-action:hover, .short-fiction-secondary-action:focus-visible { border-color: #2d5a27; outline: 2px solid rgba(21,66,18,.16); outline-offset: 1px; }
.short-fiction-reader-frame { display: block; width: 100%; min-height: 560px; height: min(70vh, 720px); border: 1px solid #d9dadb; border-radius: 6px; background: #fff; }
.short-fiction-access-notice, .short-fiction-empty-state { display: flex; gap: 14px; align-items: flex-start; border: 1px solid #d6ddd2; border-left: 4px solid #154212; border-radius: 6px; background: #f5f7f3; padding: 18px; }
.short-fiction-access-notice strong, .short-fiction-empty-state strong { display: block; color: #191c1d; }
.short-fiction-access-notice p, .short-fiction-empty-state p { margin: 5px 0 0; color: #555d52; line-height: 1.55; }
.short-fiction-reader-overlay { position: fixed; inset: 0; z-index: 1200; background: rgba(15,20,16,.82); padding: 22px; }
.short-fiction-reader-overlay[hidden] { display: none; }
.short-fiction-reader-overlay > div { height: 100%; display: grid; grid-template-rows: auto 1fr; overflow: hidden; border-radius: 8px; background: #fff; }
.short-fiction-reader-overlay header { display: flex; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 1px solid #d9dadb; padding: 12px 16px; }
.short-fiction-reader-overlay h3 { margin: 0; font-size: 20px; }
.short-fiction-reader-overlay button { display: inline-flex; align-items: center; gap: 6px; border: 1px solid #154212; border-radius: 6px; background: #fff; color: #154212; padding: 8px 11px; font-weight: 800; cursor: pointer; }
.short-fiction-reader-overlay iframe { width: 100%; height: 100%; border: 0; }
.short-fiction-work-picker { max-width: 580px; }
.short-fiction-question-stack { display: grid; gap: 20px; }
.short-fiction-question-panel, .short-fiction-paragraph-panel, .short-fiction-visual-panel { overflow: hidden; border: 1px solid #d9dadb; border-radius: 8px; background: #fff; }
.short-fiction-page .worksheet-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0; border-bottom: 1px solid #e1e3e4; padding: 12px 16px; }
.short-fiction-page .worksheet-save-status { min-width: 180px; display: grid; gap: 3px; color: #5d6359; font-size: 13px; }
.short-fiction-page .worksheet-toolbar button, .short-fiction-page .worksheet-toolbar .short-fiction-secondary-action { min-height: 40px; display: inline-flex; align-items: center; gap: 6px; border: 1px solid #b9c5b1; border-radius: 6px; background: #fff; color: #154212; padding: 8px 11px; font: 700 13px/1.2 "IBM Plex Sans", sans-serif; text-decoration: none; cursor: pointer; }
.short-fiction-page .worksheet-toolbar button.evidence-bank-save-action, .short-fiction-page button.evidence-bank-save-action { border-color: #154212; background: #154212; color: #fff; }
.short-fiction-page .worksheet-document-header { padding: 26px 28px; }
.short-fiction-page .worksheet-document-header p { margin: 0 0 8px; font-size: 12px; font-weight: 800; }
.short-fiction-page .worksheet-document-header h3 { margin: 0; font-family: "Hanken Grotesk", sans-serif; font-size: clamp(30px, 4vw, 44px); line-height: 1.05; }
.short-fiction-page .worksheet-document-header > span { display: block; margin-top: 8px; }
.short-fiction-page .worksheet-progress { margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,.16); }
.short-fiction-page .worksheet-progress > div:first-child { display: flex; justify-content: space-between; gap: 12px; }
.short-fiction-page .worksheet-progress-track { height: 8px; margin-top: 8px; overflow: hidden; border-radius: 999px; background: #293029; }
.short-fiction-page .worksheet-progress-track > div { width: 0; height: 100%; background: #9fcf93; }
.short-fiction-question-body, .short-fiction-paragraph-fields, .short-fiction-visual-body { padding: 26px 28px; }
.short-fiction-source-link { display: inline-flex; margin-bottom: 20px; color: #154212; font-weight: 800; }
.short-fiction-page .worksheet-question { margin-bottom: 28px; }
.short-fiction-page .worksheet-question-prompt { display: grid; grid-template-columns: 34px minmax(0,1fr); gap: 10px; margin-bottom: 10px; color: #191c1d; font-size: 17px; line-height: 1.5; }
.short-fiction-page .worksheet-question-prompt strong { color: #154212; }
.short-fiction-page .worksheet-answer-field { display: grid; gap: 7px; margin-left: 44px; }
.short-fiction-page textarea, .short-fiction-page input, .short-fiction-page select { box-sizing: border-box; }
.short-fiction-page textarea { width: 100%; border: 1px solid #c5c9c1; border-radius: 6px; background: #f8f9fa; padding: 11px 12px; color: #191c1d; font: 15px/1.55 "Work Sans", sans-serif; resize: vertical; }
.short-fiction-page textarea:focus, .short-fiction-page select:focus, .short-fiction-page input:focus { border-color: #154212; background: #fff; outline: 3px solid rgba(21,66,18,.15); }
.short-fiction-page .worksheet-word-count, .short-fiction-page [data-activity-word-count] { justify-self: end; color: #747a70; font-size: 12px; }
.short-fiction-page .worksheet-hint { margin: 0 0 12px 44px; border: 1px solid #d5d8cc; border-radius: 6px; background: #fbfaf0; color: #514d33; padding: 11px 12px; font-size: 14px; line-height: 1.5; }
.short-fiction-page .worksheet-hint[hidden] { display: none; }
.short-fiction-analysis-explorer, .short-fiction-evidence-capture, .short-fiction-paragraph-builder { margin-top: 22px; overflow: hidden; }
.short-fiction-section-header { padding: 22px 24px; }
.short-fiction-section-header p { margin: 0 0 5px; font-size: 12px; font-weight: 800; text-transform: uppercase; }
.short-fiction-section-header h3 { margin: 0; font: 800 28px/1.15 "Hanken Grotesk", sans-serif; }
.short-fiction-section-header span { display: block; margin-top: 7px; line-height: 1.5; }
.short-fiction-analysis-controls, .short-fiction-two-column-fields { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; padding: 20px 24px; }
.short-fiction-analysis-controls label, .short-fiction-two-column-fields label, .short-fiction-evidence-capture > label, .short-fiction-paragraph-fields label { display: grid; gap: 7px; color: #191c1d; font-weight: 800; }
.short-fiction-analysis-results { padding: 0 24px 24px; }
.short-fiction-term-definition { border-left: 4px solid #154212; background: #f3f6f1; padding: 17px 18px; }
.short-fiction-term-definition p { margin: 0 0 4px; color: #154212; font-size: 12px; font-weight: 800; text-transform: uppercase; }
.short-fiction-term-definition h3 { margin: 0; font: 800 24px/1.2 "Hanken Grotesk", sans-serif; }
.short-fiction-term-definition span { display: block; margin-top: 7px; line-height: 1.55; }
.short-fiction-term-work { display: flex; align-items: baseline; gap: 8px; margin: 18px 0 12px; }
.short-fiction-term-work span { color: #626860; }
.short-fiction-analysis-example-list { display: grid; gap: 12px; }
.short-fiction-analysis-example { border: 1px solid #d9dadb; border-radius: 6px; padding: 16px; }
.short-fiction-analysis-example h4 { margin: 0 0 12px; font-size: 18px; }
.short-fiction-analysis-example > div { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 16px; }
.short-fiction-analysis-example section strong { color: #154212; font-size: 13px; }
.short-fiction-analysis-example section p { margin: 6px 0 0; line-height: 1.55; white-space: pre-wrap; }
.short-fiction-analysis-framework { border: 1px solid #d9dadb; border-left: 4px solid #154212; border-radius: 6px; padding: 16px; }
.short-fiction-analysis-framework p { margin: 6px 0 0; line-height: 1.55; }
.short-fiction-evidence-capture { display: grid; gap: 16px; padding-bottom: 22px; }
.short-fiction-evidence-capture > label, .short-fiction-evidence-capture > .english-evidence-actions { margin-inline: 24px; }
.short-fiction-evidence-capture select { width: 100%; min-height: 44px; border: 1px solid #b9c5b1; border-radius: 6px; background: #fff; padding: 9px 11px; font: inherit; }
.short-fiction-paragraph-builder > .short-fiction-work-picker { margin-inline: 24px; }
.short-fiction-paragraph-builder > article { margin: 0 24px 24px; }
.short-fiction-paragraph-fields { display: grid; gap: 20px; }
.short-fiction-paragraph-fields .english-activity-field { display: grid; gap: 8px; }
.short-fiction-paragraph-fields .worksheet-hint { margin-left: 0; }
.short-fiction-visual-body figure { margin: 0 0 24px; }
.short-fiction-visual-body img { display: block; max-width: 100%; height: auto; max-height: 680px; margin-inline: auto; border: 1px solid #d9dadb; border-radius: 6px; }
.short-fiction-visual-body figcaption { margin-top: 8px; color: #626860; text-align: center; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }
html.has-short-fiction-reader-open { overflow: hidden; }
@media (max-width: 840px) {
  .short-fiction-library-browser { grid-template-columns: 1fr; }
  .short-fiction-work-list { display: none; }
  .short-fiction-reader-header, .short-fiction-page .worksheet-toolbar { align-items: stretch; flex-direction: column; }
  .short-fiction-reader-actions, .worksheet-toolbar-actions { justify-content: flex-start; }
  .short-fiction-analysis-controls, .short-fiction-two-column-fields, .short-fiction-analysis-example > div { grid-template-columns: 1fr; }
  .short-fiction-page .worksheet-answer-field, .short-fiction-page .worksheet-hint { margin-left: 0; }
  .short-fiction-question-body, .short-fiction-paragraph-fields, .short-fiction-visual-body { padding: 20px; }
  .short-fiction-reader-overlay { padding: 8px; }
}
@media print {
  .short-fiction-page .worksheet-toolbar, .short-fiction-work-picker, .short-fiction-analysis-controls, .short-fiction-reader-actions, .short-fiction-secondary-action { display: none !important; }
  .short-fiction-page [hidden] { display: none !important; }
  .short-fiction-question-panel, .short-fiction-paragraph-panel, .short-fiction-visual-panel { border: 0; }
}
`;

export const SHORT_FICTION_PROFILE_RUNTIME = `
(function(){
  function syncWorkButtons(select){
    var group = select && select.getAttribute("data-english-activity-select");
    if(!group) return;
    document.querySelectorAll("[data-short-fiction-select-for]").forEach(function(button){
      if(button.getAttribute("data-short-fiction-select-for") !== group) return;
      var active = button.getAttribute("data-short-fiction-work-button") === select.value;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }
  function syncAnalysis(){
    document.querySelectorAll("[data-short-fiction-analysis-explorer]").forEach(function(root){
      var term = root.querySelector("[data-short-fiction-analysis-term]");
      var work = root.querySelector("[data-short-fiction-analysis-work]");
      if(!term || !work) return;
      root.querySelectorAll("[data-short-fiction-analysis-panel]").forEach(function(panel){
        panel.hidden = panel.getAttribute("data-short-fiction-analysis-term-id") !== term.value || panel.getAttribute("data-short-fiction-analysis-work-id") !== work.value;
      });
    });
  }
  function openReader(button){
    var page = button.closest(".short-fiction-materials-page");
    var overlay = page && page.querySelector("[data-short-fiction-reader-overlay]");
    var frame = overlay && overlay.querySelector("[data-short-fiction-reader-overlay-frame]");
    var title = overlay && overlay.querySelector("[data-short-fiction-reader-overlay-title]");
    if(!overlay || !frame) return;
    var source = button.getAttribute("data-short-fiction-fullscreen-src");
    if(!source) return;
    frame.src = source;
    if(title) title.textContent = button.getAttribute("data-short-fiction-fullscreen-title") || "Course text";
    overlay.hidden = false;
    document.documentElement.classList.add("has-short-fiction-reader-open");
  }
  function closeReader(button){
    var overlay = button.closest("[data-short-fiction-reader-overlay]");
    var frame = overlay && overlay.querySelector("[data-short-fiction-reader-overlay-frame]");
    if(frame) frame.removeAttribute("src");
    if(overlay) overlay.hidden = true;
    document.documentElement.classList.remove("has-short-fiction-reader-open");
  }
  function initialize(){
    document.querySelectorAll(".short-fiction-page [data-english-activity-select]").forEach(syncWorkButtons);
    syncAnalysis();
  }
  document.addEventListener("change", function(event){
    var select = event.target.closest(".short-fiction-page [data-english-activity-select]");
    if(select) syncWorkButtons(select);
    if(event.target.closest("[data-short-fiction-analysis-term], [data-short-fiction-analysis-work]")) syncAnalysis();
  });
  document.addEventListener("click", function(event){
    var workButton = event.target.closest("[data-short-fiction-work-button]");
    if(workButton){
      event.preventDefault();
      var group = workButton.getAttribute("data-short-fiction-select-for");
      var select = Array.from(document.querySelectorAll(".short-fiction-page [data-english-activity-select]")).find(function(candidate){ return candidate.getAttribute("data-english-activity-select") === group; });
      if(select){ select.value = workButton.getAttribute("data-short-fiction-work-button") || ""; select.dispatchEvent(new Event("change", { bubbles: true })); }
      return;
    }
    var open = event.target.closest("[data-short-fiction-fullscreen-src]");
    if(open){ event.preventDefault(); openReader(open); return; }
    var close = event.target.closest("[data-short-fiction-reader-close]");
    if(close){ event.preventDefault(); closeReader(close); }
  });
  document.addEventListener("keydown", function(event){
    if(event.key !== "Escape") return;
    var overlay = document.querySelector("[data-short-fiction-reader-overlay]:not([hidden])");
    var close = overlay && overlay.querySelector("[data-short-fiction-reader-close]");
    if(close) closeReader(close);
  });
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();`;

export function renderShortFictionProfile(input: RenderShortFictionProfileInput): ShortFictionProfileRenderResult {
  const normalized = normalizeInput(input);
  const pages: EnglishRenderedActivityPage[] = [
    renderMaterialsPage(normalized),
    renderQuestionPage(normalized),
    renderWritingStudio(normalized)
  ];
  const visualLiteracyPage = renderVisualLiteracyPage(normalized);
  if (visualLiteracyPage) pages.push(visualLiteracyPage);
  const materialsRoute = normalized.materialsMode === "materials" ? "materials" : "story-bank";
  const questionCounts = Object.fromEntries(normalized.works.map((work) => [stableSegment(work.id, "Short Fiction work"), work.questions.length]));
  const responseIdPrefixes = Object.fromEntries(normalized.works.map((work) => {
    const workId = stableSegment(work.id, "Short Fiction work");
    return [workId, responseId(normalized.namespace, "story-questions", workId)];
  }));
  return {
    kind: "short-fiction",
    pages,
    navGroups: [],
    resourceLinks: buildResourceLinks(normalized),
    css: SHORT_FICTION_PROFILE_CSS,
    runtime: SHORT_FICTION_PROFILE_RUNTIME,
    contract: {
      schemaVersion: 1,
      namespace: normalized.namespace,
      materialsRoute,
      workIds: normalized.works.map((work) => stableSegment(work.id, "Short Fiction work")),
      questionCounts,
      responseIdPrefixes,
      visualLiteracy: Boolean(normalized.visualLiteracy?.enabled)
    }
  };
}
