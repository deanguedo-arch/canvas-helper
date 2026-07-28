import type {
  EnglishMaterialHook,
  EnglishRenderedActivityNavGroup,
  EnglishRenderedActivityPage
} from "./activity-profile-renderers.js";

export const WRITING_FOUNDATIONS_SOURCE_PAGE_IDS = [
  "3351",
  "3352",
  "3353",
  "3354",
  "3355",
  "3356",
  "3357"
] as const;

export type WritingFoundationsSourcePageId = typeof WRITING_FOUNDATIONS_SOURCE_PAGE_IDS[number];

export type WritingFoundationsSourcePage = {
  id: WritingFoundationsSourcePageId;
  title: string;
  href: string;
  learnerLessonId: string;
};

export type WritingFoundationsLessonBlueprint = {
  id: string;
  label: string;
  sourcePageIds: WritingFoundationsSourcePageId[];
  presentation: "lesson" | "tabs";
  tabLabels?: string[];
};

export const WRITING_FOUNDATIONS_SOURCE_CONTRACT = {
  moduleId: "3349",
  unitId: "3350",
  pages: [
    {
      id: "3351",
      title: "Foundations of Writing Introduction",
      href: "foundations_of_writing/foundations_of_writing_intro.htm",
      learnerLessonId: "writing-foundations"
    },
    {
      id: "3352",
      title: "Sentence Structure",
      href: "foundations_of_writing/test.html",
      learnerLessonId: "complete-sentences"
    },
    {
      id: "3353",
      title: "Paragraph Structure and Rough Drafts",
      href: "foundations_of_writing/paragraph_structure.htm",
      learnerLessonId: "paragraph-structure-drafting"
    },
    {
      id: "3354",
      title: "Paragraph Template #1",
      href: "M1 Paragraph/Paragraph Template #1.html",
      learnerLessonId: "paragraph-planning-models"
    },
    {
      id: "3355",
      title: "Paragraph Template #2",
      href: "M1 Paragraph/Paragraph Template #2.html",
      learnerLessonId: "paragraph-planning-models"
    },
    {
      id: "3356",
      title: "Paragraph Template #3",
      href: "M1 Paragraph/maburger test.html",
      learnerLessonId: "paragraph-planning-models"
    },
    {
      id: "3357",
      title: "Organizing a Paragraph",
      href: "foundations_of_writing/organizing_a_paragraph.htm",
      learnerLessonId: "organizing-coherence"
    }
  ] satisfies WritingFoundationsSourcePage[],
  excludedAssets: [
    {
      pattern: "foundations_of_writing/ParagraphStructure_images/Slide*.jpg",
      reason: "Teachers Pay Teachers image rights are not established; the diagrams are rebuilt natively."
    },
    {
      pattern: "**/Run-On Sentences.ppsx",
      reason: "The inaccessible slide show is replaced by native complete-sentence instruction and practice."
    }
  ],
  blockedLinks: [
    "teacherspayteachers.com",
    "slideshare.net",
    "owl.english.purdue.edu/owl/resource/606/01"
  ]
} as const;

export const WRITING_FOUNDATIONS_LESSON_BLUEPRINTS: WritingFoundationsLessonBlueprint[] = [
  {
    id: "writing-foundations",
    label: "Writing Foundations",
    sourcePageIds: ["3351"],
    presentation: "lesson"
  },
  {
    id: "complete-sentences",
    label: "Complete Sentences",
    sourcePageIds: ["3352"],
    presentation: "lesson"
  },
  {
    id: "topic-sentences-paragraph-structure",
    label: "Topic Sentences and Paragraph Structure",
    sourcePageIds: ["3353"],
    presentation: "lesson"
  },
  {
    id: "supporting-details-development",
    label: "Supporting Details and Development",
    sourcePageIds: ["3353"],
    presentation: "lesson"
  },
  {
    id: "paragraph-planning-models",
    label: "Paragraph Planning Models",
    sourcePageIds: ["3354", "3355", "3356"],
    presentation: "tabs",
    tabLabels: ["Hamburger", "Graphic Organizer", "PEEL"]
  },
  {
    id: "unity-coherence-transitions",
    label: "Unity, Coherence, and Transitions",
    sourcePageIds: ["3357"],
    presentation: "lesson"
  },
  {
    id: "revise-edit-polish",
    label: "Revise, Edit, and Polish",
    sourcePageIds: ["3353", "3357"],
    presentation: "lesson"
  }
];

export const WRITING_FOUNDATIONS_RESOURCE_LINKS: EnglishMaterialHook[] = [
  {
    id: "purdue-paragraphs-paragraphing",
    title: "Purdue OWL: Paragraphs and Paragraphing",
    kind: "link",
    description: "Current guidance for developing focused, coherent paragraphs.",
    href: "https://owl.purdue.edu/owl/general_writing/academic_writing/paragraphs_and_paragraphing/index.html",
    actionLabel: "Open Resource",
    downloadable: false,
    embeddable: false,
    status: "available"
  }
];

export type WritingFoundationsProfileRendererInput = {
  namespace: string;
  courseCode?: string;
  unitTitle?: string;
  evidenceBankRoute?: string;
};

export type WritingFoundationsRenderedProfile = {
  kind: "writing-foundations";
  pages: EnglishRenderedActivityPage[];
  navGroups: EnglishRenderedActivityNavGroup[];
  css: string;
  runtime: string;
  sourceContract: typeof WRITING_FOUNDATIONS_SOURCE_CONTRACT;
  lessonBlueprints: WritingFoundationsLessonBlueprint[];
  resourceLinks: EnglishMaterialHook[];
};

type SentencePractice = {
  id: string;
  sentence: string;
  correctType: "fragment" | "run-on" | "comma-splice";
  hint: string;
};

type ParagraphModel = {
  id: "hamburger" | "graphic" | "peel";
  label: string;
  description: string;
  fields: Array<{ id: string; label: string; prompt: string; hint: string }>;
};

const SENTENCE_PRACTICE: SentencePractice[] = [
  {
    id: "speaker-doubts",
    sentence: "Because the speaker still doubts the story.",
    correctType: "fragment",
    hint: "The opening subordinating word leaves the thought unfinished. Add an independent clause."
  },
  {
    id: "road-flooded",
    sentence: "The rain stopped the road remained flooded.",
    correctType: "run-on",
    hint: "Two independent clauses need a period, semicolon, or comma with a coordinating conjunction."
  },
  {
    id: "mara-revised",
    sentence: "Mara revised the paragraph, she clarified the final sentence.",
    correctType: "comma-splice",
    hint: "A comma alone cannot join these two complete clauses."
  },
  {
    id: "clear-transition",
    sentence: "A clear transition between the two examples.",
    correctType: "fragment",
    hint: "This word group names something, but it does not yet make a complete statement."
  },
  {
    id: "specific-evidence",
    sentence: "The evidence is specific it still needs analysis.",
    correctType: "run-on",
    hint: "Decide how the two complete ideas relate, then choose punctuation that shows that relationship."
  },
  {
    id: "details-out-of-order",
    sentence: "The paragraph has a topic sentence, its details are out of order.",
    correctType: "comma-splice",
    hint: "Both sides of the comma can stand alone as sentences."
  }
];

const PARAGRAPH_MODELS: ParagraphModel[] = [
  {
    id: "hamburger",
    label: "Hamburger",
    description: "Build a paragraph from a focused topic sentence, substantial supporting details, and a purposeful conclusion.",
    fields: [
      { id: "topic-sentence", label: "Top bun — topic sentence", prompt: "State the paragraph's focused main idea.", hint: "Make one clear claim that the whole paragraph can support." },
      { id: "detail-one", label: "Filling — detail or evidence 1", prompt: "Add the first specific support.", hint: "Use a fact, example, quotation, or precise observation." },
      { id: "detail-two", label: "Filling — detail or evidence 2", prompt: "Add another piece of support.", hint: "Choose evidence that develops the same main idea without repeating the first detail." },
      { id: "detail-three", label: "Filling — explanation", prompt: "Explain how the details support the topic sentence.", hint: "Name the connection instead of assuming the reader will see it." },
      { id: "conclusion", label: "Bottom bun — concluding sentence", prompt: "Close the paragraph by reinforcing its main idea.", hint: "Synthesize the paragraph; do not copy the topic sentence word for word." }
    ]
  },
  {
    id: "graphic",
    label: "Graphic Organizer",
    description: "See the paragraph as a central idea connected to evidence, explanation, and a concluding insight.",
    fields: [
      { id: "main-idea", label: "Main idea", prompt: "Write the idea that belongs at the centre of the paragraph.", hint: "Keep the idea narrow enough for one paragraph." },
      { id: "support-one", label: "Support 1", prompt: "Record one relevant detail or example.", hint: "Specific support is stronger than a general statement." },
      { id: "support-two", label: "Support 2", prompt: "Record a second relevant detail or example.", hint: "Choose support that adds something new." },
      { id: "connection", label: "Connecting explanation", prompt: "Explain how the supporting details develop the main idea.", hint: "Use a precise because, therefore, or this suggests connection." },
      { id: "conclusion", label: "Concluding insight", prompt: "State what the evidence helps the reader understand.", hint: "End with the significance of the paragraph's idea." }
    ]
  },
  {
    id: "peel",
    label: "PEEL",
    description: "Plan a paragraph through Point, Evidence, Explanation, and Link.",
    fields: [
      { id: "point", label: "Point", prompt: "Make one clear and supportable point.", hint: "The point should directly answer the task or advance the controlling idea." },
      { id: "evidence", label: "Evidence", prompt: "Record specific evidence or an example.", hint: "Include enough context for the evidence to make sense." },
      { id: "explanation", label: "Explanation", prompt: "Explain how and why the evidence supports the point.", hint: "Analyze the evidence rather than repeating it." },
      { id: "link", label: "Link", prompt: "Connect the explanation back to the paragraph's point or larger idea.", hint: "Show the reader why this paragraph matters." }
    ]
  }
];

const BEE_SENTENCES = [
  {
    id: "distance-detail",
    text: "In fact, the slower the dance, the farther the bees have to go to find flowers."
  },
  {
    id: "round-dance",
    text: "If the leader does a simple round dance, the other bees know the flowers are near the hive."
  },
  {
    id: "conclusion",
    text: "Bees communicate a lot to each other just through moving in certain ways."
  },
  {
    id: "direction-detail",
    text: "Bees can even indicate the direction of the nectar by beginning their waggle dances in certain ways."
  },
  {
    id: "waggle-dance",
    text: "If a bee does the waggle dance, the other bees know the nectar is not near the hive."
  },
  {
    id: "topic",
    text: "Bees tell other bees where to find flowers full of nectar by doing certain dances."
  }
] as const;

const CORRECT_BEE_ORDER = [
  "topic",
  "round-dance",
  "waggle-dance",
  "direction-detail",
  "distance-detail",
  "conclusion"
] as const;

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
  if (!namespace) throw new Error("Writing Foundations renderer requires a non-empty namespace.");
  if (!/^[a-z0-9][a-z0-9:_-]*$/i.test(namespace)) {
    throw new Error(`Writing Foundations namespace contains unsupported characters: ${value}`);
  }
  return namespace;
}

function responseId(namespace: string, ...parts: string[]) {
  return [namespace, "writing-foundations", ...parts].join(":");
}

function collectionAttributes(input: {
  id: string;
  prefix: string;
  source: string;
  activityId: string;
  activityTitle: string;
  workTitle: string;
  promptLabel: string;
  savedMessage: string;
  updatedMessage: string;
}) {
  return `data-response-collection
    data-evidence-collection-id="${escapeHtml(input.id)}"
    data-evidence-response-prefix="${escapeHtml(input.prefix)}"
    data-evidence-source="${escapeHtml(input.source)}"
    data-evidence-concept="${escapeHtml(input.activityTitle)}"
    data-evidence-activity-id="${escapeHtml(input.activityId)}"
    data-evidence-activity-title="${escapeHtml(input.activityTitle)}"
    data-evidence-work-title="${escapeHtml(input.workTitle)}"
    data-evidence-entry-type="collection"
    data-evidence-prompt-label="${escapeHtml(input.promptLabel)}"
    data-evidence-detail-label="Saved responses"
    data-evidence-saved-message="${escapeHtml(input.savedMessage)}"
    data-evidence-updated-message="${escapeHtml(input.updatedMessage)}"`;
}

function pageHeading(courseCode: string, unitTitle: string, title: string, description: string) {
  return `<p class="route-kicker">${escapeHtml(courseCode)} | ${escapeHtml(unitTitle)}</p>
    <h2 class="route-title">${escapeHtml(title)}</h2>
    <p class="route-description">${escapeHtml(description)}</p>`;
}

function toolbar(saveLabel: string) {
  return `<div class="worksheet-toolbar">
    <span data-response-collection-status aria-live="polite">Responses save automatically</span>
    <div class="worksheet-toolbar-actions">
      <button type="button" data-worksheet-toggle-hints aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> Show Hints</button>
      <button type="button" data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
      <button class="evidence-bank-save-action" type="button" data-save-response-collection><span class="material-symbols-outlined" aria-hidden="true">library_add</span> ${escapeHtml(saveLabel)}</button>
    </div>
  </div>`;
}

function progressHeader(courseCode: string, kicker: string, title: string, description: string, fieldCount: number) {
  return `<header class="worksheet-document-header english-dark-worksheet-header">
    <p>${escapeHtml(courseCode)} | ${escapeHtml(kicker)}</p>
    <h3>${escapeHtml(title)}</h3>
    <span>${escapeHtml(description)}</span>
    <div class="worksheet-progress">
      <div><span>Formative Progress</span><strong data-activity-progress-label>0 of ${fieldCount} answered</strong></div>
      <div class="worksheet-progress-track"><div data-activity-progress-fill></div></div>
    </div>
  </header>`;
}

function fieldMarkup(input: {
  number: string;
  prompt: string;
  label: string;
  responseId: string;
  placeholder: string;
  hint: string;
  rows?: number;
  control?: "textarea" | "select";
  options?: Array<{ value: string; label: string }>;
  extraControlAttributes?: string;
}) {
  const control = input.control === "select"
    ? `<select data-response-id="${escapeHtml(input.responseId)}" ${input.extraControlAttributes ?? ""}>
        <option value="">Choose...</option>
        ${(input.options ?? []).map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join("")}
      </select>`
    : `<textarea rows="${input.rows ?? 4}" data-response-id="${escapeHtml(input.responseId)}" placeholder="${escapeHtml(input.placeholder)}" ${input.extraControlAttributes ?? ""}></textarea>
      <span class="worksheet-word-count" data-activity-word-count>0 words</span>`;
  return `<div class="english-activity-field" data-activity-response data-evidence-question-number="${escapeHtml(input.number)}" data-evidence-question-prompt="${escapeHtml(input.prompt)}">
    <label class="worksheet-answer-field"><span>${escapeHtml(input.label)}</span>${control}</label>
    <div class="worksheet-hint" data-question-hint hidden><strong>Hint:</strong> ${escapeHtml(input.hint)}</div>
  </div>`;
}

function renderSentenceLab(input: Required<Pick<WritingFoundationsProfileRendererInput, "namespace" | "courseCode" | "unitTitle" | "evidenceBankRoute">>) {
  const prefix = responseId(input.namespace, "sentence-lab");
  const fields = SENTENCE_PRACTICE.map((item, index) => `<section class="wf-sentence-practice" data-wf-sentence-practice>
    <div class="wf-sentence-number" aria-hidden="true">${index + 1}</div>
    <div class="wf-sentence-work">
      <p class="wf-sentence-original"><strong>Sentence:</strong> ${escapeHtml(item.sentence)}</p>
      <div class="wf-sentence-field-grid">
        ${fieldMarkup({
          number: `${index + 1}a`,
          prompt: `Classify this sentence: ${item.sentence}`,
          label: "Identify the sentence problem",
          responseId: `${prefix}:${item.id}:classification`,
          placeholder: "",
          hint: item.hint,
          control: "select",
          options: [
            { value: "fragment", label: "Sentence fragment" },
            { value: "run-on", label: "Run-on sentence" },
            { value: "comma-splice", label: "Comma splice" }
          ],
          extraControlAttributes: `data-wf-sentence-classification data-correct-type="${item.correctType}"`
        })}
        ${fieldMarkup({
          number: `${index + 1}b`,
          prompt: `Repair this sentence: ${item.sentence}`,
          label: "Write a complete, correctly joined sentence",
          responseId: `${prefix}:${item.id}:repair`,
          placeholder: "Rewrite the sentence so the relationship between its ideas is clear.",
          hint: item.hint,
          rows: 3
        })}
      </div>
      <p class="wf-check-feedback" data-wf-sentence-feedback aria-live="polite"></p>
    </div>
  </section>`).join("");

  return `<section id="sentence-lab" class="course-page english-activity-page writing-foundations-page" hidden data-writing-foundations-page>
    ${pageHeading(input.courseCode, input.unitTitle, "Sentence Practice", "Identify and repair fragments, run-ons, and comma splices. Your classifications and revisions save automatically.")}
    <section class="wf-concept-strip" aria-labelledby="wf-sentence-rules-heading">
      <div><h3 id="wf-sentence-rules-heading">A complete sentence</h3><p>Expresses a complete thought through at least one independent clause with a subject and a finite verb.</p></div>
      <div><strong>Fragment</strong><p>An incomplete word group that cannot stand as an independent clause.</p></div>
      <div><strong>Run-on</strong><p>Independent clauses joined without correct punctuation or a conjunction.</p></div>
      <div><strong>Comma splice</strong><p>Independent clauses joined only with a comma.</p></div>
    </section>
    <article class="worksheet-document english-activity-worksheet wf-worksheet" data-activity-progress ${collectionAttributes({
      id: `${prefix}:collection`,
      prefix: `${prefix}:`,
      source: "Writing Foundations | Sentence Practice",
      activityId: "sentence-lab",
      activityTitle: "Corrected Sentence Set",
      workTitle: "Writing Foundations",
      promptLabel: "Sentence practice",
      savedMessage: "Corrected sentence set saved to Evidence Bank",
      updatedMessage: "Corrected sentence set updated in Evidence Bank"
    })}>
      ${toolbar("Save Corrected Sentence Set")}
      ${progressHeader(input.courseCode, "Sentence Practice", "Classify, repair, explain", "Work through each sentence, then check your classifications when you are ready.", SENTENCE_PRACTICE.length * 2)}
      <div class="wf-sentence-list">${fields}</div>
      <div class="english-activity-final-actions">
        <button type="button" data-wf-check-sentences><span class="material-symbols-outlined" aria-hidden="true">fact_check</span> Check Classifications</button>
        <span data-wf-sentence-check-status aria-live="polite"></span>
      </div>
    </article>
    <aside class="english-evidence-capture wf-evidence-capture" data-evidence-notebook-panel>
      <div><p class="route-kicker">Keep one strong example</p><h3>Sentence Evidence</h3><p>Select a sentence you repaired, record the improved version, and explain why the revision works. Saving creates one individual Evidence Bank entry.</p></div>
      <div class="wf-evidence-field-grid">
        <label>Original sentence
          <select data-response-id="${prefix}:evidence:source" data-evidence-draft="source">
            <option value="">Choose a sentence...</option>
            ${SENTENCE_PRACTICE.map((item) => `<option value="${escapeHtml(item.sentence)}">${escapeHtml(item.sentence)}</option>`).join("")}
          </select>
        </label>
        <label>Corrected sentence
          <textarea rows="3" data-response-id="${prefix}:evidence:detail" data-evidence-draft="detail" placeholder="Record the corrected sentence exactly."></textarea>
        </label>
        <label>Why the repair works
          <textarea rows="3" data-response-id="${prefix}:evidence:connection" data-evidence-draft="connection" placeholder="Explain the grammar choice you made."></textarea>
        </label>
      </div>
      <div class="english-evidence-actions"><button class="evidence-bank-save-action" type="button" data-save-evidence-note><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save Example to Evidence Bank</button><a href="#${escapeHtml(input.evidenceBankRoute)}" data-page-target="${escapeHtml(input.evidenceBankRoute)}">Open Evidence Bank</a><span data-save-status aria-live="polite">Draft saves automatically</span></div>
    </aside>
  </section>`;
}

function renderModelDiagram(model: ParagraphModel) {
  if (model.id === "hamburger") {
    return `<figure class="wf-model-diagram wf-hamburger-diagram" aria-labelledby="wf-hamburger-caption">
      <div class="wf-hamburger-bun">Topic sentence</div>
      <div class="wf-hamburger-filling">Detail or evidence</div>
      <div class="wf-hamburger-filling">Explanation</div>
      <div class="wf-hamburger-bun">Concluding sentence</div>
      <figcaption id="wf-hamburger-caption">The opening and conclusion hold together substantial supporting detail and explanation.</figcaption>
    </figure>`;
  }
  if (model.id === "graphic") {
    return `<figure class="wf-model-diagram wf-graphic-diagram" aria-labelledby="wf-graphic-caption">
      <div class="wf-graphic-main">Main idea</div>
      <div class="wf-graphic-support"><span>Support 1</span><span>Support 2</span><span>Explanation</span></div>
      <div class="wf-graphic-conclusion">Concluding insight</div>
      <figcaption id="wf-graphic-caption">Each supporting detail connects to the same main idea and leads to a concluding insight.</figcaption>
    </figure>`;
  }
  return `<figure class="wf-model-diagram wf-peel-diagram" aria-labelledby="wf-peel-caption">
    <ol><li><strong>P</strong><span>Point</span></li><li><strong>E</strong><span>Evidence</span></li><li><strong>E</strong><span>Explanation</span></li><li><strong>L</strong><span>Link</span></li></ol>
    <figcaption id="wf-peel-caption">PEEL keeps the paragraph's point, proof, analysis, and larger connection visible.</figcaption>
  </figure>`;
}

function renderParagraphBuilder(input: Required<Pick<WritingFoundationsProfileRendererInput, "namespace" | "courseCode" | "unitTitle">>) {
  const prefix = responseId(input.namespace, "paragraph-builder");
  const tabs = PARAGRAPH_MODELS.map((model, index) => `<button type="button" id="wf-model-tab-${model.id}" role="tab" aria-selected="${index === 0 ? "true" : "false"}" aria-controls="wf-model-panel-${model.id}" tabindex="${index === 0 ? "0" : "-1"}" data-wf-model-tab="${model.id}">${escapeHtml(model.label)}</button>`).join("");
  const panels = PARAGRAPH_MODELS.map((model, modelIndex) => {
    const modelPrefix = `${prefix}:${model.id}`;
    const fields = model.fields.map((field, fieldIndex) => fieldMarkup({
      number: String(fieldIndex + 1),
      prompt: field.label,
      label: field.label,
      responseId: `${modelPrefix}:${field.id}`,
      placeholder: field.prompt,
      hint: field.hint,
      rows: 4,
      extraControlAttributes: `data-wf-model-field="${field.id}"`
    })).join("");
    return `<article id="wf-model-panel-${model.id}" class="worksheet-document english-activity-worksheet wf-worksheet wf-model-panel" role="tabpanel" aria-labelledby="wf-model-tab-${model.id}" data-wf-model-panel="${model.id}" data-activity-progress ${modelIndex === 0 ? "" : "hidden"} ${collectionAttributes({
      id: `${modelPrefix}:collection`,
      prefix: `${modelPrefix}:`,
      source: `Writing Foundations | ${model.label} Paragraph Plan`,
      activityId: "paragraph-builder",
      activityTitle: `${model.label} Paragraph Plan`,
      workTitle: "Writing Foundations",
      promptLabel: "Planning model",
      savedMessage: `${model.label} plan saved to Evidence Bank`,
      updatedMessage: `${model.label} plan updated in Evidence Bank`
    })}>
      ${toolbar(`Save ${model.label} Plan`)}
      ${progressHeader(input.courseCode, "Paragraph Planning", model.label, model.description, model.fields.length)}
      <div class="wf-model-layout">
        ${renderModelDiagram(model)}
        <div class="critical-field-grid wf-model-fields">${fields}</div>
      </div>
      <section class="wf-draft-preview" aria-live="polite">
        <p class="route-kicker">Draft preview</p>
        <h4>Your paragraph plan</h4>
        <div data-wf-model-preview="${model.id}"><p class="wf-preview-empty">Complete the planner to assemble a readable draft preview here.</p></div>
      </section>
    </article>`;
  }).join("");
  return `<section id="paragraph-builder" class="course-page english-activity-page writing-foundations-page" hidden data-writing-foundations-page data-wf-paragraph-builder>
    ${pageHeading(input.courseCode, input.unitTitle, "Paragraph Planning Practice", "Choose the planning model that best fits your thinking. Each model keeps separate saved work and assembles a live draft preview.")}
    <input type="hidden" data-response-id="${prefix}:selected-model" data-wf-selected-model value="hamburger">
    <div class="wf-model-tabs" role="tablist" aria-label="Paragraph planning models">${tabs}</div>
    <div class="english-activity-panel-stack">${panels}</div>
  </section>`;
}

function roleSelect(input: { number: string; prompt: string; label: string; responseId: string; hint: string }) {
  return fieldMarkup({
    ...input,
    placeholder: "",
    control: "select",
    options: BEE_SENTENCES.map((sentence, index) => ({ value: sentence.id, label: `Sentence ${index + 1}: ${sentence.text}` }))
  });
}

function renderOrganizationLab(input: Required<Pick<WritingFoundationsProfileRendererInput, "namespace" | "courseCode" | "unitTitle">>) {
  const prefix = responseId(input.namespace, "organization-lab");
  const orderItems = BEE_SENTENCES.map((sentence, index) => `<li data-wf-order-item data-wf-sentence-id="${sentence.id}" data-wf-sentence-text="${escapeHtml(sentence.text)}">
    <span class="wf-order-number" data-wf-order-number>${index + 1}</span>
    <p>${escapeHtml(sentence.text)}</p>
    <div class="wf-order-actions">
      <button type="button" data-wf-move="up" aria-label="Move sentence ${index + 1} up"><span class="material-symbols-outlined" aria-hidden="true">arrow_upward</span><span class="wf-button-label">Move up</span></button>
      <button type="button" data-wf-move="down" aria-label="Move sentence ${index + 1} down"><span class="material-symbols-outlined" aria-hidden="true">arrow_downward</span><span class="wf-button-label">Move down</span></button>
    </div>
  </li>`).join("");
  return `<section id="organization-lab" class="course-page english-activity-page writing-foundations-page" hidden data-writing-foundations-page>
    ${pageHeading(input.courseCode, input.unitTitle, "Coherence Practice", "Reorder the bee paragraph, identify its structural parts, and explain how the sequence improves coherence.")}
    <article class="worksheet-document english-activity-worksheet wf-worksheet" data-wf-organization-lab data-wf-correct-order="${CORRECT_BEE_ORDER.join(",")}" data-activity-progress ${collectionAttributes({
      id: `${prefix}:collection`,
      prefix: `${prefix}:`,
      source: "Writing Foundations | Coherence Practice",
      activityId: "organization-lab",
      activityTitle: "Organized Paragraph and Explanation",
      workTitle: "Bee Dance Paragraph",
      promptLabel: "Paragraph organization",
      savedMessage: "Organized paragraph saved to Evidence Bank",
      updatedMessage: "Organized paragraph updated in Evidence Bank"
    })}>
      ${toolbar("Save Organized Paragraph")}
      ${progressHeader(input.courseCode, "Paragraph Coherence", "Arrange, identify, explain", "Use the move controls to create a logical sequence. Then identify how each part helps the paragraph cohere.", 5)}
      <div class="wf-organization-layout">
        <section class="wf-order-workspace" aria-labelledby="wf-bee-order-heading">
          <div><h4 id="wf-bee-order-heading">Reorder the sentences</h4><p>Move one sentence at a time. The controls are keyboard accessible and your arrangement saves after the first move.</p></div>
          <input type="hidden" data-response-id="${prefix}:order" data-wf-order-state value="">
          <ol class="wf-order-list" data-wf-order-list>${orderItems}</ol>
          <div class="wf-order-check"><button type="button" data-wf-check-order><span class="material-symbols-outlined" aria-hidden="true">fact_check</span> Check the Sequence</button><span data-wf-order-status aria-live="polite"></span></div>
        </section>
        <section class="wf-organized-preview" aria-labelledby="wf-organized-preview-heading">
          <h4 id="wf-organized-preview-heading">Current paragraph</h4>
          <p data-wf-organized-preview>${BEE_SENTENCES.map((sentence) => escapeHtml(sentence.text)).join(" ")}</p>
          <div hidden data-activity-response data-evidence-question-number="1" data-evidence-question-prompt="Organized paragraph">
            <input type="hidden" data-response-id="${prefix}:organized-paragraph" data-wf-organized-response value="">
          </div>
        </section>
      </div>
      <div class="critical-field-grid wf-organization-fields">
        ${roleSelect({ number: "2", prompt: "Identify the topic sentence.", label: "Topic sentence", responseId: `${prefix}:topic-sentence`, hint: "Look for the sentence broad enough to introduce every detail that follows." })}
        ${fieldMarkup({ number: "3", prompt: "Identify and explain the supporting details or evidence.", label: "Details or evidence", responseId: `${prefix}:details-evidence`, placeholder: "Name the sentences that develop the main idea and explain what each adds.", hint: "The round dance, waggle dance, direction, and distance sentences each add a different detail.", rows: 4 })}
        ${fieldMarkup({ number: "4", prompt: "Identify words or structures that connect ideas.", label: "Transitions and connections", responseId: `${prefix}:transitions`, placeholder: "Record transition words, repeated terms, or sentence patterns that help the ideas flow.", hint: "Notice conditional openings such as ‘If’ and the transition ‘In fact.’", rows: 4 })}
        ${roleSelect({ number: "5", prompt: "Identify the concluding sentence.", label: "Concluding sentence", responseId: `${prefix}:concluding-sentence`, hint: "Look for the sentence that restates the larger idea without adding another new dance detail." })}
        ${fieldMarkup({ number: "6", prompt: "Explain how the new order improves coherence.", label: "Why this order works", responseId: `${prefix}:explanation`, placeholder: "Explain how the topic sentence, details, transitions, and conclusion work together.", hint: "Describe the path from main idea to examples to final synthesis.", rows: 5 })}
      </div>
    </article>
  </section>`;
}

function revisionCheckbox(input: {
  number: string;
  responseId: string;
  label: string;
}) {
  return `<label class="wf-final-check" data-activity-response data-evidence-question-number="${escapeHtml(input.number)}" data-evidence-question-prompt="${escapeHtml(input.label)}">
    <input type="checkbox" value="Complete" data-response-id="${escapeHtml(input.responseId)}">
    <span>${escapeHtml(input.label)}</span>
  </label>`;
}

function renderFinalParagraph(input: Required<Pick<WritingFoundationsProfileRendererInput, "namespace" | "courseCode" | "unitTitle">>) {
  const prefix = responseId(input.namespace, "final-paragraph");
  const checks = [
    "The topic sentence states one focused controlling idea.",
    "Every sentence develops the same idea.",
    "Details or examples are specific and relevant.",
    "Explanation shows why the support matters.",
    "The sentence order and transitions guide the reader.",
    "The conclusion completes the idea without adding a new topic.",
    "Fragments, run-ons, comma splices, punctuation, and spelling have been checked."
  ];
  return `<section id="final-paragraph" class="course-page english-activity-page writing-foundations-page" hidden data-writing-foundations-page>
    ${pageHeading(input.courseCode, input.unitTitle, "Final Paragraph", "Draft or paste one paragraph, revise it deliberately, and save the polished version with a short reflection.")}
    <article class="worksheet-document english-activity-worksheet wf-worksheet" data-activity-progress ${collectionAttributes({
      id: `${prefix}:collection`,
      prefix: `${prefix}:`,
      source: "Writing Foundations | Final Paragraph",
      activityId: "final-paragraph",
      activityTitle: "Polished Paragraph",
      workTitle: "Writing Foundations",
      promptLabel: "Final paragraph application",
      savedMessage: "Final paragraph saved to Evidence Bank",
      updatedMessage: "Final paragraph updated in Evidence Bank"
    })}>
      ${toolbar("Save Final Paragraph")}
      ${progressHeader(input.courseCode, "Final Application", "Draft, revise, reflect", "Use the checklist as a revision tool. Check an item only after you have reread the paragraph for that purpose.", checks.length + 3)}
      <div class="wf-final-paragraph-fields">
        ${fieldMarkup({
          number: "1",
          prompt: "State the topic, purpose, and controlling idea for this paragraph.",
          label: "Planning note",
          responseId: `${prefix}:planning-note`,
          placeholder: "What will the paragraph explain, show, or argue?",
          hint: "Name the topic and the specific direction the paragraph will take.",
          rows: 3
        })}
        ${fieldMarkup({
          number: "2",
          prompt: "Write the polished paragraph.",
          label: "Polished paragraph",
          responseId: `${prefix}:polished-paragraph`,
          placeholder: "Write or paste your complete paragraph here.",
          hint: "Include a focused topic sentence, developed support and explanation, clear connections, and a conclusion.",
          rows: 10
        })}
      </div>
      <fieldset class="wf-final-checklist">
        <legend>Revision and editing checklist</legend>
        ${checks.map((label, index) => revisionCheckbox({
          number: `${index + 3}`,
          responseId: `${prefix}:check-${index + 1}`,
          label
        })).join("")}
      </fieldset>
      <div class="wf-final-reflection">
        ${fieldMarkup({
          number: String(checks.length + 3),
          prompt: "Explain one meaningful change you made while revising.",
          label: "Revision reflection",
          responseId: `${prefix}:revision-reflection`,
          placeholder: "Identify the change and explain how it improved the paragraph for the reader.",
          hint: "Describe a change to focus, support, explanation, order, transitions, or sentence correctness.",
          rows: 4
        })}
      </div>
    </article>
  </section>`;
}

export function assertWritingFoundationsSourcePageIds(pageIds: readonly string[]) {
  const expected = WRITING_FOUNDATIONS_SOURCE_PAGE_IDS;
  if (pageIds.length !== expected.length || expected.some((id, index) => pageIds[index] !== id)) {
    throw new Error(`Writing Foundations requires source pages ${expected.join(", ")} in manifest order; received ${pageIds.join(", ") || "none"}.`);
  }
}

export function decodeWritingFoundationsSource(input: Uint8Array) {
  const utf16Le = input.length > 1 && input[0] === 0xff && input[1] === 0xfe;
  return new TextDecoder(utf16Le ? "utf-16le" : "utf-8").decode(input).replace(/^\uFEFF/, "");
}

function textFromHtmlFragment(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
}

export function normalizeWritingFoundationsSourceHtml(value: string) {
  let output = value.replace(/^\uFEFF/, "");
  output = output
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<(?:iframe|object|embed)\b[^>]*>[\s\S]*?<\/(?:iframe|object|embed)>/gi, "")
    .replace(/<(?:iframe|object|embed)\b[^>]*\/?\s*>/gi, "")
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/<a\b[^>]*href=["'][^"']*(?:teacherspayteachers\.com|slideshare\.net|owl\.english\.purdue\.edu\/owl\/resource\/606\/01|\.ppsx?)[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, "");

  const blockedParagraphs = [
    /demo of lesson template/i,
    /please continue to the next page/i,
    /cbe[- ]?learn|calgary board of education/i,
    /submit your rough draft|assignment is due|teacher will not have time/i,
    /video and slide shows below|please watch the video|run-on sentences powerpoint/i,
    /teachers pay teachers|teacherspayteachers/i,
    /^sources?:/i,
    /this link opens in a new window\/tab/i
  ];
  output = output.replace(/<p\b[^>]*>[\s\S]*?<\/p>/gi, (paragraph) => {
    const text = textFromHtmlFragment(paragraph);
    return blockedParagraphs.some((pattern) => pattern.test(text)) ? "" : paragraph;
  });

  output = output
    .replace(/Demo of Lesson Template/gi, "")
    .replace(/(?:CBe[- ]?learn\s*[-–]?\s*)?Calgary Board of Education/gi, "")
    .replace(/&copy;?\s*20\d{2}\s*CBe[- ]?learn/gi, "")
    .replace(/A sentence contains a complete idea, a verb and a noun\.?/gi, "A complete sentence expresses a complete thought and includes at least one independent clause with a subject and a finite verb.")
    .replace(/run-on sentences\s*-\s*they contain too many ideas!?/gi, "run-on sentences — independent clauses joined without correct punctuation or a conjunction")
    .replace(/sentence fragments\s*-\s*they are missing information/gi, "sentence fragments — incomplete word groups that cannot stand as independent clauses")
    .replace(/comma splices\s*-\s*too many commas in a sentence/gi, "comma splices — independent clauses joined only with a comma")
    .replace(/Each written assignment in the course MUST include a rough draft or outline\.?/gi, "Strong writing usually begins with planning, an outline, or a rough draft.")
    .replace(/These ['‘]wing it['’] writings,? ARE your rough draft!?/gi, "A first attempt is still a draft. Revising it helps make the intended meaning clear.")
    .replace(/Three different paragraph templates will be discussed over the next few pages\.?/gi, "Three paragraph-planning models are available in this unit.")
    .replace(/Please continue to the next page\.?/gi, "")
    .replace(/<p\b[^>]*>\s*<\/p>/gi, "")
    .trim();
  return output;
}

export function renderWritingFoundationsProfile(input: WritingFoundationsProfileRendererInput): WritingFoundationsRenderedProfile {
  const namespace = safeNamespace(input.namespace);
  const courseCode = input.courseCode?.trim() || "ELA 10-2";
  const unitTitle = input.unitTitle?.trim() || "Writing Foundations";
  const evidenceBankRoute = safeNamespace(input.evidenceBankRoute?.replace(/^#/, "") || "evidence-bank");
  const required = { namespace, courseCode, unitTitle, evidenceBankRoute };
  return {
    kind: "writing-foundations",
    pages: [
      { id: "sentence-lab", label: "Sentence Practice", icon: "spellcheck", html: renderSentenceLab(required), navigation: "lesson-linked" },
      { id: "paragraph-builder", label: "Paragraph Planning Practice", icon: "account_tree", html: renderParagraphBuilder(required), navigation: "lesson-linked" },
      { id: "organization-lab", label: "Coherence Practice", icon: "reorder", html: renderOrganizationLab(required), navigation: "lesson-linked" },
      { id: "final-paragraph", label: "Final Paragraph", icon: "edit_note", html: renderFinalParagraph(required), navigation: "lesson-linked" }
    ],
    navGroups: [{
      id: "sentence-lab",
      label: "Writing Activities",
      icon: "edit_square",
      landingItemLabel: "Sentence Practice",
      itemPageIds: ["paragraph-builder", "organization-lab", "final-paragraph"]
    }],
    css: WRITING_FOUNDATIONS_PROFILE_CSS,
    runtime: WRITING_FOUNDATIONS_PROFILE_RUNTIME,
    sourceContract: WRITING_FOUNDATIONS_SOURCE_CONTRACT,
    resourceLinks: WRITING_FOUNDATIONS_RESOURCE_LINKS.map((resource) => ({ ...resource })),
    lessonBlueprints: WRITING_FOUNDATIONS_LESSON_BLUEPRINTS.map((lesson) => lesson.tabLabels
      ? { ...lesson, sourcePageIds: [...lesson.sourcePageIds], tabLabels: [...lesson.tabLabels] }
      : { ...lesson, sourcePageIds: [...lesson.sourcePageIds] })
  };
}

export function installWritingFoundationsProfileRuntime(rootDocument: Document) {
  const browserWindow = rootDocument.defaultView ?? window;

  function valueOf(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null) {
    return field?.value?.trim() ?? "";
  }

  function setModel(builder: HTMLElement, modelId: string, persist: boolean) {
    const selected = builder.querySelector<HTMLInputElement>("[data-wf-selected-model]");
    const available = Array.from(builder.querySelectorAll<HTMLElement>("[data-wf-model-tab]")).map((tab) => tab.getAttribute("data-wf-model-tab") || "");
    const next = available.includes(modelId) ? modelId : available[0] || "hamburger";
    builder.querySelectorAll<HTMLElement>("[data-wf-model-tab]").forEach((tab) => {
      const active = tab.getAttribute("data-wf-model-tab") === next;
      tab.setAttribute("aria-selected", String(active));
      tab.setAttribute("tabindex", active ? "0" : "-1");
    });
    builder.querySelectorAll<HTMLElement>("[data-wf-model-panel]").forEach((panel) => {
      panel.hidden = panel.getAttribute("data-wf-model-panel") !== next;
    });
    if (selected && selected.value !== next) {
      selected.value = next;
      if (persist) selected.dispatchEvent(new browserWindow.Event("input", { bubbles: true }));
    }
  }

  function updateModelPreview(panel: HTMLElement) {
    const preview = panel.querySelector<HTMLElement>("[data-wf-model-preview]");
    if (!preview) return;
    const values = Array.from(panel.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[data-wf-model-field]"))
      .map((field) => valueOf(field))
      .filter(Boolean);
    preview.replaceChildren();
    if (!values.length) {
      const empty = rootDocument.createElement("p");
      empty.className = "wf-preview-empty";
      empty.textContent = "Complete the planner to assemble a readable draft preview here.";
      preview.appendChild(empty);
      return;
    }
    const paragraph = rootDocument.createElement("p");
    paragraph.textContent = values.join(" ");
    preview.appendChild(paragraph);
  }

  function initializeModels() {
    rootDocument.querySelectorAll<HTMLElement>("[data-wf-paragraph-builder]").forEach((builder) => {
      const selected = builder.querySelector<HTMLInputElement>("[data-wf-selected-model]");
      setModel(builder, selected?.value || "hamburger", false);
      builder.querySelectorAll<HTMLElement>("[data-wf-model-panel]").forEach(updateModelPreview);
    });
  }

  function organizationItems(root: HTMLElement) {
    return Array.from(root.querySelectorAll<HTMLElement>("[data-wf-order-item]"));
  }

  function updateOrganization(root: HTMLElement, persist: boolean) {
    const items = organizationItems(root);
    const ids = items.map((item) => item.getAttribute("data-wf-sentence-id") || "");
    const paragraph = items.map((item) => item.getAttribute("data-wf-sentence-text") || "").join(" ");
    items.forEach((item, index) => {
      const number = item.querySelector<HTMLElement>("[data-wf-order-number]");
      if (number) number.textContent = String(index + 1);
      item.querySelectorAll<HTMLButtonElement>("[data-wf-move]").forEach((button) => {
        const direction = button.getAttribute("data-wf-move");
        button.disabled = direction === "up" ? index === 0 : index === items.length - 1;
        button.setAttribute("aria-label", `Move sentence ${index + 1} ${direction}`);
      });
    });
    const visiblePreview = root.querySelector<HTMLElement>("[data-wf-organized-preview]");
    if (visiblePreview) visiblePreview.textContent = paragraph;
    if (!persist) return;
    const order = root.querySelector<HTMLInputElement>("[data-wf-order-state]");
    const response = root.querySelector<HTMLTextAreaElement>("[data-wf-organized-response]");
    if (order) {
      order.value = JSON.stringify(ids);
      order.dispatchEvent(new browserWindow.Event("input", { bubbles: true }));
    }
    if (response) {
      response.value = paragraph;
      response.dispatchEvent(new browserWindow.Event("input", { bubbles: true }));
    }
  }

  function restoreOrganization(root: HTMLElement) {
    const order = root.querySelector<HTMLInputElement>("[data-wf-order-state]");
    const list = root.querySelector<HTMLElement>("[data-wf-order-list]");
    if (order?.value && list) {
      try {
        const ids = JSON.parse(order.value);
        if (Array.isArray(ids)) {
          const items = new Map(organizationItems(root).map((item) => [item.getAttribute("data-wf-sentence-id"), item]));
          ids.forEach((id) => {
            const item = typeof id === "string" ? items.get(id) : undefined;
            if (item) list.appendChild(item);
          });
        }
      } catch {
        // Keep the source order when saved state is malformed.
      }
    }
    updateOrganization(root, false);
  }

  function moveSentence(button: HTMLButtonElement) {
    const root = button.closest<HTMLElement>("[data-wf-organization-lab]");
    const item = button.closest<HTMLElement>("[data-wf-order-item]");
    if (!root || !item) return;
    if (button.getAttribute("data-wf-move") === "up") {
      const previous = item.previousElementSibling;
      if (previous) previous.before(item);
    } else {
      const next = item.nextElementSibling;
      if (next) next.after(item);
    }
    updateOrganization(root, true);
    button.focus();
  }

  function checkOrder(root: HTMLElement) {
    const expected = (root.getAttribute("data-wf-correct-order") || "").split(",").filter(Boolean);
    const current = organizationItems(root).map((item) => item.getAttribute("data-wf-sentence-id") || "");
    const correct = expected.length === current.length && expected.every((id, index) => current[index] === id);
    const status = root.querySelector<HTMLElement>("[data-wf-order-status]");
    if (status) status.textContent = correct
      ? "The paragraph now moves clearly from its main idea through details to a conclusion."
      : "Keep revising. Begin with the broad main idea, group the dance details logically, and finish with the larger conclusion.";
  }

  function checkSentences(button: HTMLElement) {
    const page = button.closest<HTMLElement>("#sentence-lab");
    if (!page) return;
    const classifications = Array.from(page.querySelectorAll<HTMLSelectElement>("[data-wf-sentence-classification]"));
    let answered = 0;
    let correct = 0;
    classifications.forEach((field) => {
      const practice = field.closest<HTMLElement>("[data-wf-sentence-practice]");
      const feedback = practice?.querySelector<HTMLElement>("[data-wf-sentence-feedback]");
      if (!field.value) {
        if (feedback) feedback.textContent = "Choose a classification before checking this sentence.";
        return;
      }
      answered += 1;
      const matches = field.value === field.getAttribute("data-correct-type");
      if (matches) correct += 1;
      if (feedback) feedback.textContent = matches ? "Classification correct. Now confirm that your repair is a complete sentence." : "Recheck whether the original contains zero, one, or two independent clauses and how those clauses are joined.";
    });
    const status = page.querySelector<HTMLElement>("[data-wf-sentence-check-status]");
    if (status) status.textContent = answered ? `${correct} of ${answered} completed classifications are correct.` : "Classify at least one sentence before checking.";
  }

  function initialize() {
    initializeModels();
    rootDocument.querySelectorAll<HTMLElement>("[data-wf-organization-lab]").forEach(restoreOrganization);
  }

  rootDocument.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof browserWindow.HTMLInputElement || target instanceof browserWindow.HTMLTextAreaElement || target instanceof browserWindow.HTMLSelectElement)) return;
    const panel = target.closest<HTMLElement>("[data-wf-model-panel]");
    if (panel) updateModelPreview(panel);
  });

  rootDocument.addEventListener("click", (event) => {
    const target = event.target instanceof browserWindow.Element ? event.target : null;
    if (!target) return;
    const tab = target.closest<HTMLElement>("[data-wf-model-tab]");
    if (tab) {
      event.preventDefault();
      const builder = tab.closest<HTMLElement>("[data-wf-paragraph-builder]");
      if (builder) setModel(builder, tab.getAttribute("data-wf-model-tab") || "hamburger", true);
      return;
    }
    const move = target.closest<HTMLButtonElement>("[data-wf-move]");
    if (move) {
      event.preventDefault();
      moveSentence(move);
      return;
    }
    const checkOrderButton = target.closest<HTMLElement>("[data-wf-check-order]");
    if (checkOrderButton) {
      event.preventDefault();
      const root = checkOrderButton.closest<HTMLElement>("[data-wf-organization-lab]");
      if (root) checkOrder(root);
      return;
    }
    const checkSentenceButton = target.closest<HTMLElement>("[data-wf-check-sentences]");
    if (checkSentenceButton) {
      event.preventDefault();
      checkSentences(checkSentenceButton);
    }
  });

  browserWindow.addEventListener("hashchange", initialize);
  if (rootDocument.readyState === "loading") rootDocument.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
  browserWindow.setTimeout(initialize, 0);
}

export const WRITING_FOUNDATIONS_PROFILE_RUNTIME = `(function(){const __name=function(target){return target;};(${installWritingFoundationsProfileRuntime.toString()})(document);})();`;

export const WRITING_FOUNDATIONS_PROFILE_CSS = `
.writing-foundations-page { width: 100%; max-width: none; }
.writing-foundations-page .route-description { max-width: 78ch; }
.writing-foundations-page .english-dark-worksheet-header { background: #161a17; color: #fff; }
.writing-foundations-page .english-dark-worksheet-header > p,
.writing-foundations-page .english-dark-worksheet-header > span { color: #b9c3b2; }
.wf-concept-strip { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 24px 0; }
.wf-concept-strip > div { border: 1px solid #d9dadb; border-left: 3px solid #154212; background: #f7f8f5; padding: 16px; }
.wf-concept-strip > div:first-child { grid-column: 1 / -1; background: #fff; }
.wf-concept-strip h3,
.wf-concept-strip p,
.wf-concept-strip strong { margin: 0; }
.wf-concept-strip p { margin-top: 6px; color: #50584e; }
.wf-sentence-list { display: grid; }
.wf-sentence-practice { display: grid; grid-template-columns: 38px minmax(0, 1fr); gap: 12px; border-bottom: 1px solid #e1e3e4; padding: 22px; }
.wf-sentence-practice:last-child { border-bottom: 0; }
.wf-sentence-number { display: grid; place-items: center; width: 32px; height: 32px; border: 1px solid #608258; color: #154212; font-weight: 800; }
.wf-sentence-work { min-width: 0; }
.wf-sentence-original { margin: 0 0 16px; font-size: 17px; }
.wf-sentence-field-grid { display: grid; grid-template-columns: minmax(190px, .7fr) minmax(0, 1.3fr); align-items: start; gap: 16px; }
.wf-sentence-field-grid .english-activity-field { border: 0; padding: 0; }
.wf-sentence-field-grid .worksheet-answer-field { align-content: start; }
.wf-check-feedback { min-height: 20px; margin: 10px 0 0; color: #31582b; font-weight: 700; }
.wf-evidence-capture { margin: 24px 0 0; }
.wf-evidence-capture h3,
.wf-evidence-capture p { margin: 0; }
.wf-evidence-capture h3 { margin: 3px 0 6px; }
.wf-evidence-field-grid { display: grid; grid-template-columns: minmax(190px, .7fr) repeat(2, minmax(0, 1fr)); align-items: start; gap: 14px; }
.wf-evidence-field-grid label { display: grid; align-content: start; gap: 7px; }
.wf-model-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin: 22px 0 16px; border-bottom: 1px solid #d9dadb; padding-bottom: 10px; }
.wf-model-tabs [role="tab"][aria-selected="true"] { border-color: #154212; background: #154212; color: #fff; }
.wf-model-layout { display: grid; grid-template-columns: minmax(220px, .7fr) minmax(0, 1.3fr); align-items: start; }
.wf-model-diagram { position: sticky; top: 18px; display: grid; min-width: 0; gap: 8px; margin: 22px; border: 1px solid #cfd6cc; background: #f7f8f5; padding: 18px; }
.wf-model-diagram figcaption { margin-top: 8px; color: #596157; font-size: 13px; }
.wf-hamburger-bun,
.wf-hamburger-filling,
.wf-graphic-main,
.wf-graphic-support span,
.wf-graphic-conclusion { min-width: 0; overflow-wrap: anywhere; border: 1px solid #68845e; background: #fff; padding: 11px; text-align: center; font-weight: 750; line-height: 1.3; }
.wf-hamburger-bun:first-child { border-radius: 22px 22px 5px 5px; }
.wf-hamburger-bun:nth-last-child(2) { border-radius: 5px 5px 22px 22px; }
.wf-hamburger-filling { border-left-width: 4px; text-align: center; }
.wf-graphic-support { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.wf-graphic-support span:last-child { grid-column: 1 / -1; }
.wf-graphic-main,
.wf-graphic-conclusion { border-left-width: 4px; }
.wf-peel-diagram ol { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
.wf-peel-diagram li { display: grid; grid-template-columns: 38px minmax(0, 1fr); align-items: center; border: 1px solid #cfd6cc; background: #fff; }
.wf-peel-diagram li strong { display: grid; place-items: center; align-self: stretch; background: #154212; color: #fff; font-size: 18px; }
.wf-peel-diagram li span { padding: 10px 12px; font-weight: 750; }
.wf-model-fields { border-left: 1px solid #e1e3e4; }
.wf-draft-preview { margin: 0 22px 22px; border: 1px solid #cfd6cc; border-left: 4px solid #154212; background: #f7f8f5; padding: 18px; }
.wf-draft-preview h4,
.wf-draft-preview p { margin: 0; }
.wf-draft-preview h4 { margin: 3px 0 10px; }
.wf-draft-preview [data-wf-model-preview] p { max-width: 78ch; line-height: 1.7; white-space: pre-wrap; }
.wf-preview-empty { color: #687064; font-style: italic; }
.wf-organization-layout { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(250px, .8fr); gap: 18px; padding: 22px; }
.wf-order-workspace,
.wf-organized-preview { min-width: 0; border: 1px solid #d9dadb; background: #f7f8f5; padding: 18px; }
.wf-order-workspace h4,
.wf-order-workspace p,
.wf-organized-preview h4,
.wf-organized-preview p { margin: 0; }
.wf-order-workspace > div:first-child p { margin-top: 5px; color: #596157; }
.wf-order-list { display: grid; gap: 8px; margin: 16px 0; padding: 0; list-style: none; }
.wf-order-list li { display: grid; grid-template-columns: 34px minmax(0, 1fr) auto; align-items: center; gap: 10px; border: 1px solid #cfd6cc; background: #fff; padding: 10px; }
.wf-order-list li p { line-height: 1.45; }
.wf-order-number { display: grid; place-items: center; width: 30px; height: 30px; background: #154212; color: #fff; font-weight: 800; }
.wf-order-actions { display: flex; gap: 5px; }
.wf-order-actions button { display: inline-flex; align-items: center; gap: 5px; min-height: 34px; padding: 5px 8px; }
.wf-order-actions button:disabled { cursor: not-allowed; opacity: .45; }
.wf-order-check { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.wf-order-check span { color: #31582b; font-weight: 700; }
.wf-organized-preview { border-left: 4px solid #154212; background: #fff; }
.wf-organized-preview p { margin-top: 12px; line-height: 1.75; }
.wf-organization-fields { border-top: 1px solid #e1e3e4; }
.wf-final-paragraph-fields,
.wf-final-reflection { padding: 22px; }
.wf-final-paragraph-fields .english-activity-field,
.wf-final-reflection .english-activity-field { border: 0; padding: 0; }
.wf-final-paragraph-fields .english-activity-field + .english-activity-field { margin-top: 20px; }
.wf-final-checklist {
  display: grid;
  gap: 0;
  margin: 0 22px;
  border: 1px solid #cfd6cc;
  padding: 0;
}
.wf-final-checklist legend {
  margin-left: 12px;
  padding: 0 8px;
  color: #252a25;
  font-weight: 800;
}
.wf-final-check {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  align-items: start;
  gap: 10px;
  border-bottom: 1px solid #e1e3e4;
  padding: 12px 16px;
  cursor: pointer;
}
.wf-final-check:last-child { border-bottom: 0; }
.wf-final-check input { width: 18px; height: 18px; margin: 2px 0 0; accent-color: #154212; }
@media (max-width: 1100px) {
  .wf-model-layout { grid-template-columns: 1fr; }
  .wf-model-diagram { position: static; margin: 18px; }
  .wf-model-fields { border-top: 1px solid #e1e3e4; border-left: 0; }
}
@media (max-width: 840px) {
  .wf-concept-strip,
  .wf-sentence-field-grid,
  .wf-evidence-field-grid,
  .wf-organization-layout { grid-template-columns: 1fr; }
}
@media (max-width: 560px) {
  .wf-sentence-practice { grid-template-columns: 1fr; padding: 16px; }
  .wf-order-list li { grid-template-columns: 30px minmax(0, 1fr); }
  .wf-order-actions { grid-column: 1 / -1; }
  .wf-button-label { position: static; width: auto; height: auto; overflow: visible; clip: auto; }
  .wf-graphic-support { grid-template-columns: 1fr; }
}
@media print {
  .wf-model-tabs,
  .wf-order-actions,
  .wf-order-check,
  .writing-foundations-page .worksheet-toolbar { display: none !important; }
  .wf-model-panel[hidden] { display: block !important; break-before: page; }
  .wf-model-diagram { position: static; }
}
`;
