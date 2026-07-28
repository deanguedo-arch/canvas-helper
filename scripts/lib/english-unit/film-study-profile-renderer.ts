import { safeId } from "./source.js";
import type {
  EnglishActivityField,
  EnglishActivityQuestionSet,
  EnglishFilmStudyProfile,
  EnglishMaterialHook,
  EnglishRenderedActivityNavGroup,
  EnglishRenderedActivityPage
} from "./activity-profile-renderers.js";

export type FilmStudyProfileVideo = {
  id: string;
  title: string;
  lessonTitle: string;
  description?: string;
  embedUrl?: string;
  fallbackUrl: string;
  embeddable?: boolean;
  status?: "available" | "fallback-only" | "needs-review";
};

export type FilmStudyProfileResource = EnglishMaterialHook & {
  group: string;
  kind?: "video" | "link" | "document" | "concept";
};

export type FilmStudyProfileRoutes = {
  criticalEssay: string;
  personalResponse: string;
  viewingGuide: string;
  questions: string;
  filmRoom: string;
  resources: string;
};

export type FilmStudyResourcePageConfig = {
  /** Keep video sources in the Film Room only when matching a legacy donor. */
  includeVideos?: boolean;
  label?: string;
  title?: string;
  description?: string;
};

export type FilmStudyProfileRendererRecipe = {
  schemaVersion: 1;
  profile: EnglishFilmStudyProfile;
  routes?: Partial<FilmStudyProfileRoutes>;
  videos?: FilmStudyProfileVideo[];
  resources?: FilmStudyProfileResource[];
  resourcePage?: FilmStudyResourcePageConfig;
};

export type FilmStudyProfileRenderResult = {
  kind: "film-study";
  pages: EnglishRenderedActivityPage[];
  navGroups: EnglishRenderedActivityNavGroup[];
  resourceLinks: EnglishMaterialHook[];
  css: string;
  runtime: string;
  contract: {
    schemaVersion: 1;
    namespace: string;
    routes: FilmStudyProfileRoutes;
    essayStageCount: number;
    essayFieldCount: number;
    personalResponseStageCount: number;
    personalResponseFieldCount: number;
    questionSetCounts: Record<string, number>;
    viewingMomentContributionPrefix: string;
  };
};

export const DEFAULT_FILM_STUDY_ROUTES: FilmStudyProfileRoutes = Object.freeze({
  criticalEssay: "critical-essay",
  personalResponse: "personal-response",
  viewingGuide: "viewing-guide",
  questions: "film-study-questions",
  filmRoom: "film-room",
  resources: "resources"
});

const FALLBACK_CONCEPT_RESOURCES: FilmStudyProfileResource[] = [
  {
    id: "film-language-review",
    title: "Film Language Review",
    description: "Review shots, angles, composition, camera movement, editing, and transitions in the matching course lessons.",
    group: "Film Concepts",
    kind: "concept",
    href: "#lessons",
    actionLabel: "Open Lessons"
  },
  {
    id: "mise-en-scene-review",
    title: "Mise-en-scene Review",
    description: "Revisit setting, lighting, costume, performance, and composition before recording a viewing moment.",
    group: "Film Concepts",
    kind: "concept",
    href: "#lessons",
    actionLabel: "Open Lessons"
  },
  {
    id: "sound-and-meaning-review",
    title: "Sound and Meaning Review",
    description: "Review diegetic and non-diegetic sound, music, silence, and sound effects in the course lesson sequence.",
    group: "Film Concepts",
    kind: "concept",
    href: "#lessons",
    actionLabel: "Open Lessons"
  }
];

const LEGACY_FILM_VIDEO_METADATA: Record<string, { title: string; group: string }> = {
  bxar2yiycv4: { title: "Elements of Film: Visual Storytelling", group: "Elements of Film" },
  "3sr-vxvay-m": { title: "Elements of Film: Editing", group: "Elements of Film - Continued" },
  g45x6fsk1do: { title: "Elements of Film: Continuity", group: "Elements of Film - Continued" },
  sgizb8jjgf8: { title: "Elements of Film: Sound", group: "Elements of Film - Continued" }
};

function legacyVideoMetadata(id: string, fallbackTitle: string) {
  return LEGACY_FILM_VIDEO_METADATA[safeId(id)] ?? { title: fallbackTitle, group: fallbackTitle };
}

function videoSourceId(video: { id: string; embedUrl?: string; fallbackUrl?: string }) {
  const source = `${video.embedUrl ?? ""} ${video.fallbackUrl ?? ""}`;
  const match = source.match(/(?:embed\/|[?&]v=)([A-Za-z0-9_-]{6,})/);
  return match?.[1] ?? video.id;
}

const VIEWING_CARD_FIELD_DEFAULTS: Record<string, EnglishActivityField> = {
  timestamp: {
    id: "timestamp",
    label: "Scene or timestamp",
    type: "text",
    placeholder: "Example: opening scene, 24:15, final conversation"
  },
  technique: {
    id: "technique",
    label: "Technique",
    type: "select",
    options: ["Cinematography", "Editing", "Sound", "Mise-en-scene", "Camera movement", "Lighting", "Performance"]
  },
  observation: {
    id: "observation",
    label: "What happens",
    placeholder: "Describe the moment precisely without over-summarizing the plot."
  },
  "director-choice": {
    id: "director-choice",
    label: "Director's choice",
    placeholder: "Identify what the director controls in this moment."
  },
  effect: {
    id: "effect",
    label: "Effect on the viewer",
    placeholder: "Explain what the choice makes the viewer notice, feel, or believe."
  },
  theme: {
    id: "theme",
    label: "Theme or character connection",
    placeholder: "Connect the moment to a larger idea, change, or conflict."
  },
  "analytical-use": {
    id: "analytical-use",
    label: "Possible analytical use",
    placeholder: "Explain how this moment could support a film response or essay."
  }
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stableId(namespace: string, ...segments: string[]) {
  return [safeId(namespace, "english-unit"), ...segments.map((segment) => safeId(segment))].join(":");
}

function assertUniqueIds(items: Array<{ id: string }>, label: string) {
  const seen = new Set<string>();
  for (const item of items) {
    const id = safeId(item.id);
    if (!id) throw new Error(`${label} contains an empty id.`);
    if (seen.has(id)) throw new Error(`${label} contains duplicate id: ${item.id}`);
    seen.add(id);
  }
}

function safeHref(value: string, label: string) {
  const href = value.trim();
  if (/^(?:https?:\/\/|#|\.\.?\/|assets\/|resources\/)/i.test(href)) return href;
  throw new Error(`${label} contains an unsupported href: ${value}`);
}

function normalizeRoutes(routes: Partial<FilmStudyProfileRoutes> | undefined): FilmStudyProfileRoutes {
  const normalized = Object.fromEntries(
    Object.entries({ ...DEFAULT_FILM_STUDY_ROUTES, ...(routes ?? {}) }).map(([key, value]) => [key, safeId(value)])
  ) as FilmStudyProfileRoutes;
  const values = Object.values(normalized);
  if (values.some((value) => !value)) throw new Error("Film Study route ids cannot be empty.");
  if (new Set(values).size !== values.length) throw new Error("Film Study route ids must be unique.");
  return normalized;
}

function validateProfile(profile: EnglishFilmStudyProfile) {
  if (profile.kind !== "film-study") throw new Error("Film Study renderer requires a film-study profile.");
  if (!profile.namespace.trim()) throw new Error("Film Study renderer requires a stable profile namespace.");
  assertUniqueIds(profile.essay.stages, "Film essay stages");
  const essayFieldCount = profile.essay.stages.reduce((count, stage) => count + stage.fields.length, 0);
  if (profile.essay.stages.length !== 6 || essayFieldCount !== 19) {
    throw new Error(`Film Study Critical Essay requires six stages and exactly 19 fields; received ${profile.essay.stages.length} stages and ${essayFieldCount} fields.`);
  }
  for (const stage of profile.essay.stages) assertUniqueIds(stage.fields, `${stage.title} fields`);
  if (profile.personalResponse) {
    assertUniqueIds(profile.personalResponse.stages, "Film personal-response stages");
    if (profile.personalResponse.stages.length !== 6) {
      throw new Error(`Film Study Personal Response requires six stages; received ${profile.personalResponse.stages.length}.`);
    }
    for (const stage of profile.personalResponse.stages) assertUniqueIds(stage.fields, `${stage.title} fields`);
  }
  assertUniqueIds(profile.questionSets, "Film question sets");
  for (const set of profile.questionSets) {
    if (!set.questions.length) throw new Error(`${set.title} must contain at least one question.`);
    assertUniqueIds(set.questions, `${set.title} questions`);
  }
  if (!profile.viewingGuideFields.length) throw new Error("Film Study Viewing Guide requires configured fields.");
}

function normalizeVideos(videos: FilmStudyProfileVideo[]) {
  assertUniqueIds(videos, "Film Room videos");
  const seenFallbacks = new Set<string>();
  return videos.map((video) => {
    const fallbackUrl = safeHref(video.fallbackUrl, `${video.title} fallback`);
    if (seenFallbacks.has(fallbackUrl)) throw new Error(`Film Room contains a duplicate video fallback: ${fallbackUrl}`);
    seenFallbacks.add(fallbackUrl);
    const embedUrl = video.embedUrl ? safeHref(video.embedUrl, `${video.title} embed`) : undefined;
    return {
      ...video,
      id: safeId(video.id),
      fallbackUrl,
      embedUrl,
      embeddable: video.embeddable !== false && Boolean(embedUrl) && video.status !== "fallback-only" && video.status !== "needs-review"
    };
  });
}

function normalizeResources(recipe: FilmStudyProfileRendererRecipe, videos: ReturnType<typeof normalizeVideos>) {
  const profileResources: FilmStudyProfileResource[] = (recipe.profile.materials ?? []).map((material) => ({
    ...material,
    group: "Teacher Materials",
    kind: material.downloadable ? "document" : "link"
  }));
  const configured = [...profileResources, ...(recipe.resources ?? [])];
  const videoResources: FilmStudyProfileResource[] = videos.map((video) => ({
    id: `video-${video.id}`,
    title: legacyVideoMetadata(videoSourceId(video), video.title).title,
    description: `${video.lessonTitle}. Open the source directly if embedded playback is unavailable.`,
    group: legacyVideoMetadata(videoSourceId(video), video.lessonTitle).group,
    kind: "video",
    href: video.fallbackUrl,
    actionLabel: "Open Video",
    status: video.status === "needs-review" ? "needs-review" : "available"
  }));
  const resources = [
    ...configured,
    ...(recipe.resourcePage?.includeVideos === false ? [] : videoResources)
  ];
  const normalized = (resources.length ? resources : FALLBACK_CONCEPT_RESOURCES).map((resource) => ({
    ...resource,
    id: safeId(resource.id),
    group: resource.group.trim() || "Film Concepts",
    href: resource.href ? safeHref(resource.href, `${resource.title} resource`) : undefined
  }));
  assertUniqueIds(normalized, "Film Study resources");
  return normalized;
}

function selectedFilm(profile: EnglishFilmStudyProfile) {
  return profile.filmSelection.mode === "selected" ? profile.filmSelection.title : "Feature Film";
}

function renderPageHeading(profile: EnglishFilmStudyProfile, title: string, description: string) {
  return `<p class="route-kicker">${escapeHtml(profile.courseCode)} | Film Study</p>
    <h2 class="route-title">${escapeHtml(title)}</h2>
    <p class="route-description">${escapeHtml(description)}</p>`;
}

function renderCollectionAttributes(input: {
  collectionId: string;
  responsePrefix: string;
  source: string;
  concept: string;
  activityId?: string;
  activityTitle?: string;
  savedMessage: string;
  updatedMessage: string;
}) {
  return `data-response-collection
    data-evidence-collection-id="${escapeHtml(input.collectionId)}"
    data-evidence-response-prefix="${escapeHtml(input.responsePrefix)}"
    data-evidence-source="${escapeHtml(input.source)}"
    data-evidence-concept="${escapeHtml(input.concept)}"
    data-evidence-activity-id="${escapeHtml(input.activityId ?? input.concept)}"
    data-evidence-activity-title="${escapeHtml(input.activityTitle ?? input.concept)}"
    data-evidence-work-title="${escapeHtml(input.source)}"
    data-evidence-entry-type="collection"
    data-evidence-prompt-label="Activity"
    data-evidence-detail-label="Saved responses"
    data-evidence-saved-message="${escapeHtml(input.savedMessage)}"
    data-evidence-updated-message="${escapeHtml(input.updatedMessage)}"`;
}

function renderOptions(field: EnglishActivityField) {
  return (field.options ?? []).map((option) => {
    const value = typeof option === "string" ? option : option.value;
    const label = typeof option === "string" ? option : option.label;
    return `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
  }).join("");
}

function renderControl(field: EnglishActivityField, responseId: string, attributes = "") {
  const placeholder = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : "";
  if (field.type === "select") {
    return `<select data-response-id="${escapeHtml(responseId)}" ${attributes}><option value="">Choose...</option>${renderOptions(field)}</select>`;
  }
  if (field.type === "text") return `<input type="text" data-response-id="${escapeHtml(responseId)}" ${attributes}${placeholder}>`;
  if (field.type === "checkbox") return `<input type="checkbox" data-response-id="${escapeHtml(responseId)}" ${attributes}>`;
  return `<textarea rows="${field.rows ?? 5}" data-response-id="${escapeHtml(responseId)}" ${attributes}${placeholder}></textarea>`;
}

function renderField(field: EnglishActivityField, responseId: string, number: number, questionStyle = false, attributes = "") {
  const prompt = field.prompt ?? field.label;
  return `<div class="film-field${questionStyle ? " film-question worksheet-question" : ""}" data-film-field data-activity-response data-evidence-question-number="${number}" data-evidence-question-prompt="${escapeHtml(prompt)}">
    ${questionStyle ? `<div class="film-question-prompt worksheet-question-prompt"><strong>${number}.</strong><span>${escapeHtml(prompt)}</span></div>` : `<label class="film-field-label" for="${escapeHtml(safeId(responseId))}">${escapeHtml(field.label)}</label>${field.prompt ? `<p class="film-field-prompt">${escapeHtml(field.prompt)}</p>` : ""}`}
    ${field.hint ? `<div class="film-field-hint${questionStyle ? " worksheet-hint" : ""}" data-film-hint data-question-hint hidden><strong>Hint:</strong> ${escapeHtml(field.hint)}</div>` : ""}
    <div class="film-field-control${questionStyle ? " worksheet-answer-field" : ""}">${renderControl(field, responseId, `${attributes} id="${escapeHtml(safeId(responseId))}"`)}${field.type !== "select" && field.type !== "checkbox" ? `<span class="film-word-count worksheet-word-count" data-film-word-count data-activity-word-count>0 words</span>` : ""}</div>
  </div>`;
}

function renderToolbar(saveLabel: string, options: { hints?: boolean; printLabel?: string } = {}) {
  return `<div class="film-workbook-toolbar">
    <span class="film-save-status" data-response-collection-status aria-live="polite">Responses save automatically</span>
    <div class="film-toolbar-actions">
      ${options.hints === false ? "" : `<button type="button" data-film-profile-toggle-hints data-worksheet-toggle-hints aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> Show Hints</button>`}
      <button type="button" data-film-profile-print data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> ${escapeHtml(options.printLabel ?? "Print / PDF")}</button>
      <button class="evidence-bank-save-action" type="button" data-save-response-collection><span class="material-symbols-outlined" aria-hidden="true">library_add</span> ${escapeHtml(saveLabel)}</button>
    </div>
  </div>`;
}

function renderProgress(total: number) {
  return `<div class="film-progress">
    <div><span>Formative Progress</span><strong data-film-progress-label data-activity-progress-label>0 of ${total} answered</strong></div>
    <div class="film-progress-track" aria-hidden="true"><span data-film-progress-fill data-activity-progress-fill></span></div>
  </div>`;
}

const FILM_ESSAY_STAGE_GUIDANCE: Record<string, {
  checkpoints: string[];
  example: string;
  tip: string;
  steps: string[];
}> = {
  "topic-interpretation": {
    checkpoints: [
      "answer the assigned topic directly in my thesis.",
      "identify the filmmaker as the creator of the film's ideas.",
      "organize the argument around character development and change."
    ],
    example: "A working thesis can name the filmmaker's larger idea, the character or conflict that develops it, and the change the essay will trace through the beginning, middle, and end.",
    tip: "Build one defensible interpretation. Avoid turning the thesis into a plot summary or a list of techniques.",
    steps: [
      "Restate the assigned topic in your own words.",
      "Name the filmmaker, title, and character or conflict you will use.",
      "Decide what development or change will structure the body paragraphs.",
      "State what the filmmaker suggests about the topic."
    ]
  },
  introduction: {
    checkpoints: [
      "begin broadly enough to establish the human issue.",
      "identify the film, filmmaker, and central conflict clearly.",
      "place the thesis as the controlling move of the introduction."
    ],
    example: "Move from a concise observation about the human issue, to the film and its central conflict, and then to the thesis that will control the response.",
    tip: "Keep the context purposeful. Do not spend the introduction summarizing the entire film.",
    steps: [
      "Open with the larger human issue at the centre of the topic.",
      "Introduce the film, filmmaker, character focus, and relevant conflict.",
      "Connect that conflict to the assigned topic.",
      "End with the revised thesis."
    ]
  },
  "body-one": {
    checkpoints: [
      "focus on character development rather than plot summary alone.",
      "choose precise film evidence from the beginning.",
      "explain how the evidence proves the interpretation."
    ],
    example: "Use an opening scene, timestamp, line, performance detail, or film technique to establish the character's starting belief and the pressure that will develop.",
    tip: "Body paragraph one should establish the starting point and answer the topic, not simply retell the opening scenes.",
    steps: [
      "State the focused beginning claim.",
      "Record one precise opening scene or film detail.",
      "Explain the filmmaker's choice and its effect.",
      "Connect the evidence to the thesis and transition toward the middle."
    ]
  },
  "body-two": {
    checkpoints: [
      "show change or pressure in progress.",
      "use evidence from a crisis, turning point, or discovery.",
      "explain how the middle complicates the interpretation."
    ],
    example: "Choose a middle scene where the character's earlier belief stops working. Explain the pressure, the filmmaker's choices, and what begins to change.",
    tip: "The middle paragraph should analyze the hinge of the argument: what forces the character to reconsider, resist, or change.",
    steps: [
      "State the focused middle claim.",
      "Identify the crisis, turning point, or growing pressure.",
      "Use a precise scene, timestamp, or technique as evidence.",
      "Explain how the moment advances or complicates the thesis."
    ]
  },
  "body-three": {
    checkpoints: [
      "explain the character or conflict at the end of the film.",
      "connect the resolution to the beginning and middle.",
      "show how the ending completes or complicates the interpretation."
    ],
    example: "Use a final scene or image to show what has changed, what remains unresolved, and what the ending asks the viewer to understand.",
    tip: "Do more than name the resolution. Explain why the ending matters to the filmmaker's larger idea.",
    steps: [
      "State the focused ending claim.",
      "Record the strongest final scene, choice, or film detail.",
      "Compare the ending with the character's starting point.",
      "Explain how the ending proves or complicates the thesis."
    ]
  },
  "conclusion-revision": {
    checkpoints: [
      "synthesize the character's development without repeating the thesis word for word.",
      "explain the broader significance of the film's idea.",
      "revise for structure, precise language, and correctness."
    ],
    example: "Return to the final change or unresolved tension, connect it to the larger human issue, and leave the reader with the significance of the filmmaker's idea.",
    tip: "Use the conclusion to complete the interpretation. Then revise the full plan for evidence balance, transitions, sentences, and correctness.",
    steps: [
      "Synthesize the film's development and final insight.",
      "Explain the idea's broader human significance.",
      "Check paragraph order, transitions, and evidence balance.",
      "Revise diction, sentences, grammar, punctuation, and spelling."
    ]
  }
};

function renderEssayLessonNavigation(input: {
  previous?: { id: string; label: string };
  next?: { id: string; label: string };
  ariaLabel?: string;
}) {
  return `<nav class="lesson-bottom-bar film-essay-lesson-navigation" aria-label="${escapeHtml(input.ariaLabel ?? "Critical Essay lesson navigation")}">
    ${input.previous ? `<a class="lesson-jump" href="#${escapeHtml(input.previous.id)}" data-page-target="${escapeHtml(input.previous.id)}">Previous: ${escapeHtml(input.previous.label)}</a>` : `<a class="lesson-jump" href="#lessons" data-page-target="lessons">Course Lessons</a>`}
    ${input.next ? `<a class="lesson-jump primary" href="#${escapeHtml(input.next.id)}" data-page-target="${escapeHtml(input.next.id)}">Next: ${escapeHtml(input.next.label)}</a>` : `<a class="lesson-jump" href="#evidence-bank" data-page-target="evidence-bank">Open Evidence Bank</a>`}
  </nav>`;
}

function renderCriticalEssayGuide(
  profile: EnglishFilmStudyProfile,
  routeId: string,
  firstStage: { id: string; label: string }
) {
  return `<section id="${escapeHtml(routeId)}" class="course-page english-activity-page film-study-profile-page film-critical-essay-page film-critical-essay-guide" hidden data-film-study-profile="${escapeHtml(safeId(profile.namespace, "english-unit"))}">
    ${renderPageHeading(profile, "Critical Analytical Essay Guide", "Use this guide to understand the complete response, then move through each writing lesson to build the essay one section at a time.")}
    <section class="unit-outcomes film-critical-outcomes critical-course-outcomes" aria-label="Critical essay success criteria">
      <h3>I can...</h3>
      <ul class="critical-check-list"><li>I can read and respond critically to film as a literary text.</li><li>I can develop and support an interpretation with precise film evidence.</li><li>I can organize my ideas into a controlled critical/analytical essay.</li><li>I can use precise diction, controlled sentences, and a formal voice.</li><li>I can revise for correctness, clarity, and purpose.</li></ul>
    </section>
    <section class="critical-writing-panel">
      <h3>Alberta assignment focus</h3>
      <p>A critical/analytical response asks you to choose relevant evidence, develop an interpretation, and connect that interpretation to the assigned topic. Film evidence can include scenes, timestamps, dialogue, performance, cinematography, editing, sound, lighting, and mise-en-scene.</p>
      <div class="critical-category-grid">
        <article><strong>Thought and Understanding</strong><p>Quality of interpretation, insight, and connection to the assigned topic.</p></article>
        <article><strong>Supporting Evidence</strong><p>Selection and explanation of film details that prove the interpretation.</p></article>
        <article><strong>Form and Structure</strong><p>Essay organization, paragraph control, transitions, and unity.</p></article>
        <article><strong>Matters of Choice</strong><p>Diction, syntax, voice, tone, and rhetorical control.</p></article>
        <article><strong>Matters of Correctness</strong><p>Grammar, usage, punctuation, spelling, and sentence control.</p></article>
      </div>
    </section>
    <section class="critical-writing-panel critical-lesson-map" aria-labelledby="critical-essay-path-title">
      <h3 id="critical-essay-path-title">Your writing path</h3>
      <p>Complete the six lessons in order. The final Preview combines your saved writing exactly as entered so you can read, print, and save the complete plan.</p>
      <ol>${profile.essay.stages.map((stage) => `<li>${escapeHtml(stage.title)}</li>`).join("")}<li>Critical Essay Preview</li></ol>
    </section>
    ${renderEssayLessonNavigation({ next: firstStage })}
  </section>`;
}

function renderCriticalEssayStage(input: {
  profile: EnglishFilmStudyProfile;
  routeId: string;
  stage: EnglishFilmStudyProfile["essay"]["stages"][number];
  previous: { id: string; label: string };
  next: { id: string; label: string };
}) {
  const { profile, routeId, stage } = input;
  const namespace = safeId(profile.namespace, "english-unit");
  const fullPrefix = stableId(namespace, "critical-essay");
  const source = `${selectedFilm(profile)} | Critical Essay`;
  const stageId = safeId(stage.id);
  const prefix = `${fullPrefix}:unit:${stageId}`;
  const guidance = FILM_ESSAY_STAGE_GUIDANCE[stageId];
  const checkpoints = stage.checkpoints?.length ? stage.checkpoints : guidance?.checkpoints ?? [];
  return `<section id="${escapeHtml(routeId)}" class="course-page english-activity-page film-study-profile-page film-critical-essay-page film-critical-essay-stage-page" hidden data-film-study-profile="${escapeHtml(namespace)}" data-film-print-scope>
    <article class="english-activity-worksheet film-essay-stage" data-film-progress ${renderCollectionAttributes({
    collectionId: `${prefix}:collection`,
    responsePrefix: `${prefix}:`,
    source,
    concept: `${stage.title} Writing Stage`,
    savedMessage: `${stage.title} saved to Evidence Bank`,
    updatedMessage: `${stage.title} updated in Evidence Bank`
  })}>
      ${renderToolbar("Save Stage to Evidence Bank")}
      <header class="film-stage-summary english-dark-worksheet-header"><p>${escapeHtml(profile.courseCode)} | Critical Analytical Writing</p><h2>${escapeHtml(stage.title)}</h2><span>${escapeHtml(stage.focus)}</span>${renderProgress(stage.fields.length)}</header>
      ${checkpoints.length ? `<section class="unit-outcomes film-critical-outcomes" aria-label="Success criteria"><h3>I can...</h3><ul>${checkpoints.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>` : ""}
      <section class="critical-writing-panel critical-lesson-panel"><h3>Lesson</h3><p>${escapeHtml(stage.instruction ?? stage.focus)}</p><div class="critical-model-block"><strong>${escapeHtml(stage.modelLabel ?? "Model move")}</strong><p>${escapeHtml(stage.model ?? guidance?.example ?? stage.focus)}</p></div></section>
      <div class="critical-support-grid"><section class="critical-writing-panel critical-example-panel"><h3>Example</h3><p>${escapeHtml(guidance?.example ?? stage.focus)}</p></section><section class="critical-writing-panel critical-tip-panel"><h3>Writing tip</h3><p>${escapeHtml(guidance?.tip ?? "Keep each choice connected to the assigned topic and your controlling interpretation.")}</p></section></div>
      ${guidance?.steps.length ? `<section class="critical-writing-panel"><h3>How to apply it</h3><ol class="critical-step-list">${guidance.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol></section>` : ""}
      <section class="critical-writing-panel critical-planner"><h3>Build ${escapeHtml(stage.title)}</h3><p>Use these working boxes to draft the actual essay section taught above. Your work saves automatically and can be printed or deliberately added to the Evidence Bank.</p><div class="critical-field-grid">${stage.fields.map((field, index) => renderField(field, `${prefix}:${safeId(field.id)}`, index + 1)).join("")}</div></section>
    </article>
    ${renderEssayLessonNavigation({ previous: input.previous, next: input.next })}
  </section>`;
}

function renderCriticalEssayPreview(profile: EnglishFilmStudyProfile, routeId: string, previous: { id: string; label: string }) {
  const namespace = safeId(profile.namespace, "english-unit");
  return `<section id="${escapeHtml(routeId)}" class="course-page english-activity-page film-study-profile-page film-critical-essay-page film-critical-essay-preview-page" hidden data-film-study-profile="${escapeHtml(namespace)}" data-film-print-scope data-film-essay-preview data-film-essay-preview-namespace="${escapeHtml(namespace)}" data-film-title="${escapeHtml(selectedFilm(profile))}">
    ${renderPageHeading(profile, "Critical Essay Preview", "Read the complete plan built from your writing lessons. This preview combines your saved boxes exactly as written; it does not invent transitions or rewrite your ideas.")}
    <div class="film-workbook-toolbar essay-preview-toolbar">
      <span class="film-save-status" data-film-essay-preview-status aria-live="polite">Your essay preview will appear here as you complete the Critical Essay writing lessons.</span>
      <div class="film-toolbar-actions">
        <button type="button" data-film-profile-print data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
        <button class="evidence-bank-save-action" type="button" data-film-save-essay-preview><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save Full Essay Plan</button>
      </div>
    </div>
    <section class="essay-preview-foundation" aria-labelledby="essay-preview-foundation-title">
      <div><p class="film-resource-kind">Planning foundation</p><h3 id="essay-preview-foundation-title">Controlling direction</h3></div>
      <dl>
        <div><dt>Assigned topic</dt><dd data-film-essay-preview-foundation="topic">Add the assigned topic in Topic and Interpretation.</dd></div>
        <div><dt>Film and character route</dt><dd data-film-essay-preview-foundation="film-insight">Add the film and character route in Topic and Interpretation.</dd></div>
        <div><dt>Working thesis</dt><dd data-film-essay-preview-foundation="thesis">Add a working thesis in Topic and Interpretation.</dd></div>
      </dl>
    </section>
    <article class="essay-preview-document" aria-labelledby="essay-preview-document-title">
      <header class="english-dark-worksheet-header"><p>${escapeHtml(profile.courseCode)} | Critical Analytical Writing</p><h3 id="essay-preview-document-title">Essay Draft</h3><span data-film-essay-preview-word-count>0 words</span></header>
      ${[
        ["introduction", "Introduction", "Complete the Introduction lesson to build this paragraph."],
        ["body-one", "Body Paragraph 1 - Beginning", "Complete Body Paragraph 1 - Beginning to build this paragraph."],
        ["body-two", "Body Paragraph 2 - Middle", "Complete Body Paragraph 2 - Middle to build this paragraph."],
        ["body-three", "Body Paragraph 3 - End", "Complete Body Paragraph 3 - End to build this paragraph."],
        ["conclusion", "Conclusion", "Complete Conclusion and Revision to build this paragraph."]
      ].map(([id, title, empty]) => `<section class="essay-preview-section"><h4>${escapeHtml(title)}</h4><div data-film-essay-preview-section="${escapeHtml(id)}" data-film-essay-preview-empty="${escapeHtml(empty)}"><p class="essay-preview-empty">${escapeHtml(empty)}</p></div></section>`).join("")}
    </article>
    <p class="essay-preview-save-status" data-film-essay-preview-save-status aria-live="polite"></p>
    ${renderEssayLessonNavigation({ previous })}
  </section>`;
}

const PERSONAL_RESPONSE_STAGE_GUIDANCE: Record<string, { example: string; tip: string; steps: string[] }> = {
  "prompt-impression": {
    example: "A focused response begins with a genuine reaction, then asks what that reaction reveals about the prompt or a larger human experience.",
    tip: "Do not force a polished thesis too early. Start with what remains vivid, troubling, surprising, or meaningful, then sharpen it.",
    steps: ["Restate the prompt in your own words.", "Name the film moment or idea that stays with you.", "Explain your first reaction.", "Shape the reaction into one controlling idea."]
  },
  "film-evidence": {
    example: "A precise scene, line, image, performance choice, sound, or edit can support a personal response when you explain why it matters to your idea.",
    tip: "Choose evidence for its meaning, not only because it is memorable. Explain the filmmaker's choice and its effect.",
    steps: ["Locate one precise film moment.", "Describe only the detail the reader needs.", "Identify the filmmaker's deliberate choice.", "Explain how the moment develops your idea."]
  },
  "knowledge-experience": {
    example: "A personal memory, observation, or piece of learning becomes useful when it helps you reconsider the film rather than taking the response away from it.",
    tip: "The connection does not need to be dramatic. It needs to be honest, relevant, and clearly linked back to the film and prompt.",
    steps: ["Choose a relevant memory, observation, or learning.", "Describe the part that matters.", "Explain what it helped you understand.", "Connect that insight back to the film."]
  },
  "form-perspective": {
    example: "The same idea could become a critical commentary, a personal letter, a diary entry, an interior monologue, or another purposeful prose form.",
    tip: "Form is not decoration. Choose the form, audience, and voice that give your idea the strongest effect.",
    steps: ["Choose a personal, critical, creative, or blended perspective.", "Select a prose form that fits the idea.", "Identify the intended audience and purpose.", "Decide what voice and tone the form requires."]
  },
  "response-plan": {
    example: "A strong plan moves from an opening that establishes voice, through film evidence and personal connection, to an ending that leaves a clear final insight.",
    tip: "Your structure should suit the chosen form. A diary entry, speech, letter, or commentary will not all develop in the same way.",
    steps: ["Draft an opening move that establishes voice and direction.", "Place the film evidence where it will have the most impact.", "Develop the personal connection rather than dropping it in.", "Plan an ending that completes the idea."]
  },
  "draft-revise": {
    example: "The final response should sound complete in its chosen form while remaining grounded in the film, the prompt, and a defensible personal insight.",
    tip: "Revise first for meaning and development, then for form, voice, clarity, sentences, and correctness.",
    steps: ["Draft the response in the chosen prose form.", "Check that the film evidence is precise and explained.", "Check that the personal connection deepens the idea.", "Revise for voice, organization, clarity, and correctness."]
  }
};

function renderPersonalResponseGuide(
  profile: EnglishFilmStudyProfile,
  routeId: string,
  firstStage: { id: string; label: string }
) {
  const personalResponse = profile.personalResponse;
  if (!personalResponse) return "";
  return `<section id="${escapeHtml(routeId)}" class="course-page english-activity-page film-study-profile-page film-critical-essay-page film-personal-response-page film-critical-essay-guide" hidden data-film-study-profile="${escapeHtml(safeId(profile.namespace, "english-unit"))}">
    ${renderPageHeading(profile, "Personal Response to Text Guide", "Use this guide to understand the response, then move through each writing lesson to develop an idea, select support, choose a prose form, draft, and revise.")}
    <section class="unit-outcomes film-critical-outcomes critical-course-outcomes" aria-label="Personal response success criteria">
      <h3>I can...</h3>
      <ul class="critical-check-list"><li>I can explore an idea, feeling, or impression prompted by a film.</li><li>I can use precise film evidence to support a meaningful response.</li><li>I can connect the film to relevant knowledge, observation, or experience.</li><li>I can choose a prose form and perspective that suit my purpose.</li><li>I can revise for development, voice, clarity, and correctness.</li></ul>
    </section>
    <section class="critical-writing-panel">
      <h3>What makes a personal response work?</h3>
      <p>A personal response connects an assigned film and prompt to your own ideas, impressions, knowledge, or experience. It may be personal, critical, creative, or blended, but its ideas must remain logical and its support must be defensible.</p>
      <div class="critical-category-grid">
        <article><strong>Idea or Impression</strong><p>A focused response to the prompt that is worth exploring.</p></article>
        <article><strong>Film Support</strong><p>Precise scenes, dialogue, images, sounds, performance, or techniques.</p></article>
        <article><strong>Knowledge or Experience</strong><p>A relevant connection that deepens the meaning of the response.</p></article>
        <article><strong>Prose Form</strong><p>A purposeful structure such as an essay, letter, diary entry, speech, commentary, or story.</p></article>
        <article><strong>Perspective and Voice</strong><p>A personal, critical, creative, or blended approach suited to audience and purpose.</p></article>
      </div>
    </section>
    <section class="critical-writing-panel critical-lesson-map" aria-labelledby="personal-response-path-title">
      <h3 id="personal-response-path-title">Your writing path</h3>
      <p>Complete the six lessons in order. The final Preview combines your saved planning and complete draft exactly as entered so you can read, print, and deliberately save the full response plan.</p>
      <ol>${personalResponse.stages.map((stage) => `<li>${escapeHtml(stage.title)}</li>`).join("")}<li>Personal Response Preview</li></ol>
    </section>
    ${renderEssayLessonNavigation({ next: firstStage, ariaLabel: "Personal Response lesson navigation" })}
  </section>`;
}

function renderPersonalResponseStage(input: {
  profile: EnglishFilmStudyProfile;
  routeId: string;
  stage: EnglishFilmStudyProfile["essay"]["stages"][number];
  previous: { id: string; label: string };
  next: { id: string; label: string };
}) {
  const { profile, routeId, stage } = input;
  const namespace = safeId(profile.namespace, "english-unit");
  const stageId = safeId(stage.id);
  const prefix = stableId(namespace, "personal-response", "unit", stageId);
  const source = `${selectedFilm(profile)} | Personal Response`;
  const guidance = PERSONAL_RESPONSE_STAGE_GUIDANCE[stageId];
  return `<section id="${escapeHtml(routeId)}" class="course-page english-activity-page film-study-profile-page film-critical-essay-page film-personal-response-page film-critical-essay-stage-page" hidden data-film-study-profile="${escapeHtml(namespace)}" data-film-print-scope>
    <article class="english-activity-worksheet film-essay-stage" data-film-progress ${renderCollectionAttributes({
    collectionId: `${prefix}:collection`,
    responsePrefix: `${prefix}:`,
    source,
    concept: `${stage.title} Personal Response Stage`,
    activityId: "personal-response",
    activityTitle: "Personal Response",
    savedMessage: `${stage.title} saved to Evidence Bank`,
    updatedMessage: `${stage.title} updated in Evidence Bank`
  })}>
      ${renderToolbar("Save Stage to Evidence Bank")}
      <header class="film-stage-summary english-dark-worksheet-header"><p>${escapeHtml(profile.courseCode)} | Personal Response Writing</p><h2>${escapeHtml(stage.title)}</h2><span>${escapeHtml(stage.focus)}</span>${renderProgress(stage.fields.length)}</header>
      ${stage.checkpoints?.length ? `<section class="unit-outcomes film-critical-outcomes" aria-label="Success criteria"><h3>I can...</h3><ul>${stage.checkpoints.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>` : ""}
      <section class="critical-writing-panel critical-lesson-panel"><h3>Lesson</h3><p>${escapeHtml(stage.instruction ?? stage.focus)}</p><div class="critical-model-block"><strong>Model move</strong><p>${escapeHtml(guidance?.example ?? stage.focus)}</p></div></section>
      <div class="critical-support-grid"><section class="critical-writing-panel critical-example-panel"><h3>Example of the move</h3><p>${escapeHtml(guidance?.example ?? stage.focus)}</p></section><section class="critical-writing-panel critical-tip-panel"><h3>Writing tip</h3><p>${escapeHtml(guidance?.tip ?? "Keep every choice connected to the film, prompt, and purpose of the response.")}</p></section></div>
      ${guidance?.steps.length ? `<section class="critical-writing-panel"><h3>How to apply it</h3><ol class="critical-step-list">${guidance.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol></section>` : ""}
      <section class="critical-writing-panel critical-planner"><h3>Build ${escapeHtml(stage.title)}</h3><p>Use these working boxes to complete the part of the personal response taught above. Your work saves automatically and can be printed or deliberately added to the Evidence Bank.</p><div class="critical-field-grid">${stage.fields.map((field, index) => renderField(field, `${prefix}:${safeId(field.id)}`, index + 1)).join("")}</div></section>
    </article>
    ${renderEssayLessonNavigation({ previous: input.previous, next: input.next, ariaLabel: "Personal Response lesson navigation" })}
  </section>`;
}

function renderPersonalResponsePreview(profile: EnglishFilmStudyProfile, routeId: string, previous: { id: string; label: string }) {
  const namespace = safeId(profile.namespace, "english-unit");
  return `<section id="${escapeHtml(routeId)}" class="course-page english-activity-page film-study-profile-page film-critical-essay-page film-personal-response-page film-critical-essay-preview-page" hidden data-film-study-profile="${escapeHtml(namespace)}" data-film-print-scope data-film-personal-response-preview data-film-personal-response-namespace="${escapeHtml(namespace)}" data-film-title="${escapeHtml(selectedFilm(profile))}">
    ${renderPageHeading(profile, "Personal Response Preview", "Read the complete response built from your writing lessons. The preview uses your saved work exactly as entered; it does not invent ideas, transitions, or wording.")}
    <div class="film-workbook-toolbar essay-preview-toolbar">
      <span class="film-save-status" data-film-personal-response-preview-status aria-live="polite">Your preview will appear here as you complete the Personal Response writing lessons.</span>
      <div class="film-toolbar-actions">
        <button type="button" data-film-profile-print data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
        <button class="evidence-bank-save-action" type="button" data-film-save-personal-response-preview><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save Full Personal Response Plan</button>
      </div>
    </div>
    <section class="essay-preview-foundation" aria-labelledby="personal-response-foundation-title">
      <div><p class="film-resource-kind">Response foundation</p><h3 id="personal-response-foundation-title">Direction and choices</h3></div>
      <dl>
        <div><dt>Course prompt</dt><dd data-film-personal-response-foundation="prompt">Add the course prompt in Prompt and Initial Impression.</dd></div>
        <div><dt>Controlling idea</dt><dd data-film-personal-response-foundation="controlling-idea">Add a controlling idea in Prompt and Initial Impression.</dd></div>
        <div><dt>Form and perspective</dt><dd data-film-personal-response-foundation="form-perspective">Choose a prose form and perspective.</dd></div>
      </dl>
    </section>
    <article class="essay-preview-document" aria-labelledby="personal-response-document-title">
      <header class="english-dark-worksheet-header"><p>${escapeHtml(profile.courseCode)} | Personal Response Writing</p><h3 id="personal-response-document-title">Personal Response Draft</h3><span data-film-personal-response-word-count>0 words</span></header>
      <section class="essay-preview-section"><h4>Complete response</h4><div data-film-personal-response-section="draft" data-film-personal-response-empty="Complete Draft and Revise to build the full response."><p class="essay-preview-empty">Complete Draft and Revise to build the full response.</p></div></section>
      <section class="essay-preview-section"><h4>Planning notes</h4><div data-film-personal-response-section="plan" data-film-personal-response-empty="Complete the planning lessons to assemble your response notes."><p class="essay-preview-empty">Complete the planning lessons to assemble your response notes.</p></div></section>
      <section class="essay-preview-section"><h4>Revision notes</h4><div data-film-personal-response-section="revision" data-film-personal-response-empty="Add revision notes in Draft and Revise."><p class="essay-preview-empty">Add revision notes in Draft and Revise.</p></div></section>
    </article>
    <p class="essay-preview-save-status" data-film-personal-response-save-status aria-live="polite"></p>
    ${renderEssayLessonNavigation({ previous, ariaLabel: "Personal Response lesson navigation" })}
  </section>`;
}

function configuredViewingField(profile: EnglishFilmStudyProfile, id: string) {
  return profile.viewingGuideFields.find((field) => safeId(field.id) === safeId(id)) ?? VIEWING_CARD_FIELD_DEFAULTS[id];
}

function renderViewingDraftField(profile: EnglishFilmStudyProfile, namespace: string, id: string, number: number) {
  const field = configuredViewingField(profile, id);
  if (!field) throw new Error(`Film Study Viewing Guide is missing field: ${id}`);
  return renderField(field, stableId(namespace, "viewing-guide", "draft", id), number, false, `data-film-viewing-draft="${escapeHtml(id)}"`);
}

function renderViewingGuide(profile: EnglishFilmStudyProfile, routeId: string) {
  const namespace = safeId(profile.namespace, "english-unit");
  const source = `${selectedFilm(profile)} | Viewing Guide`;
  const setupFields = [
    configuredViewingField(profile, "viewing-pass"),
    configuredViewingField(profile, "technique-focus")
  ].filter((field): field is EnglishActivityField => Boolean(field));
  const initialResponse = configuredViewingField(profile, "initial-response");
  const developingTheme = configuredViewingField(profile, "developing-theme");
  const synthesisPrefix = stableId(namespace, "viewing-guide", "synthesis");
  return `<section id="${escapeHtml(routeId)}" class="course-page english-activity-page film-study-profile-page film-viewing-guide-page" hidden data-film-study-profile="${escapeHtml(namespace)}" data-film-viewing-guide data-film-project-slug="${escapeHtml(namespace)}" data-film-title="${escapeHtml(selectedFilm(profile))}">
    ${renderPageHeading(profile, "Viewing Guide", "Use this as a running evidence notebook while watching or rewatching a feature film. Save specific moments, then return to them when you need proof for questions or writing.")}
    <div class="film-viewing-notebook viewing-notebook">
      <textarea hidden data-response-id="${escapeHtml(stableId(namespace, "viewing-guide", "moments", "json"))}" data-film-viewing-store></textarea>
      <input hidden type="number" value="0" data-response-id="${escapeHtml(stableId(namespace, "viewing-guide", "moment-counter"))}" data-film-viewing-counter>
      <input hidden type="text" data-film-viewing-editing-id>
      <section class="film-viewing-setup notebook-setup" aria-label="Viewing setup">
        ${renderField({ id: "film-title", label: "Film title", type: "text", placeholder: profile.filmSelection.mode === "selected" ? profile.filmSelection.title : "Name the feature film you are studying." }, stableId(namespace, "viewing-guide", "setup", "film-title"), 1)}
        ${setupFields.map((field, index) => renderField(field, stableId(namespace, "viewing-guide", "setup", field.id), index + 2)).join("")}
      </section>
      <div class="notebook-baseline">
        ${initialResponse ? `<article><h3>First reaction</h3><p class="film-baseline-prompt">What stands out first?</p>${renderField(initialResponse, stableId(namespace, "viewing-guide", "setup", initialResponse.id), 1)}</article>` : ""}
        ${developingTheme ? `<article><h3>Working pattern</h3><p class="film-baseline-prompt">What larger idea is developing?</p>${renderField(developingTheme, stableId(namespace, "viewing-guide", "setup", developingTheme.id), 2)}</article>` : ""}
      </div>
      <section class="film-viewing-entry evidence-entry-panel film-study-workbook english-activity-worksheet" data-film-print-scope>
        <div class="film-section-heading english-dark-worksheet-header"><h3>Add a Viewing Moment</h3><p>Connect what happens to a filmmaker's choice, its effect, and a larger analytical use.</p></div>
        <div class="film-workbook-toolbar">
          <span class="film-save-status" data-film-viewing-status aria-live="polite">No viewing moments saved yet.</span>
          <div class="film-toolbar-actions"><button type="button" data-film-profile-toggle-hints data-worksheet-toggle-hints aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> Show Hints</button><button type="button" data-film-profile-print data-worksheet-print><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button></div>
        </div>
        <div class="film-workbook-body"><div class="film-field-grid film-viewing-draft-grid">
          ${["timestamp", "technique", "observation", "director-choice", "effect", "theme", "analytical-use"].map((id, index) => renderViewingDraftField(profile, namespace, id, index + 1)).join("")}
        </div>
        <div class="film-entry-actions"><button class="evidence-bank-save-action" type="button" data-film-viewing-save-draft><span class="material-symbols-outlined" aria-hidden="true">add</span> Add Viewing Moment</button><button type="button" data-film-viewing-clear-draft>Clear Draft</button></div></div>
      </section>
      <section class="film-viewing-bank evidence-bank-panel">
        <div class="film-bank-heading english-dark-worksheet-header"><div><h3>Saved Viewing Moments</h3><p>These are editable working cards. Nothing enters the central Evidence Bank until you choose a green save action.</p></div><a href="#${escapeHtml(profile.evidenceBankRoute ?? "evidence-bank")}" data-page-target="${escapeHtml(profile.evidenceBankRoute ?? "evidence-bank")}">Open Evidence Bank</a></div>
        <div class="film-bank-filters">
          <label>Filter by technique<select data-film-viewing-filter-technique><option value="">All techniques</option>${renderOptions(VIEWING_CARD_FIELD_DEFAULTS.technique)}</select></label>
          <label class="film-strongest-filter"><input type="checkbox" data-film-viewing-filter-strongest> Show strongest moment only</label>
        </div>
        <div class="film-viewing-card-list" data-film-viewing-list><p class="film-empty-state">No viewing moments saved yet.</p></div>
      </section>
      <section class="film-viewing-synthesis evidence-synthesis-panel film-study-workbook english-activity-worksheet" data-film-print-scope ${renderCollectionAttributes({
        collectionId: `${synthesisPrefix}:collection`,
        responsePrefix: `${synthesisPrefix}:`,
        source,
        concept: "Viewing Guide Synthesis",
        savedMessage: "Viewing synthesis saved to Evidence Bank",
        updatedMessage: "Viewing synthesis updated in Evidence Bank"
      })}>
        ${renderToolbar("Save Viewing Synthesis to Evidence Bank")}
        <div class="film-section-heading english-dark-worksheet-header"><h3>Turn the notebook into an interpretation</h3><p>Use the strongest saved moment to explain a pattern and prepare an analytical response.</p></div>
        <div class="film-workbook-body film-field-grid">
          ${renderField({ id: "pattern", label: "Pattern across the film", placeholder: "Name a recurring technique, conflict, character shift, or idea." }, `${synthesisPrefix}:pattern`, 1)}
          ${renderField({ id: "strongest", label: "Strongest viewing moment", placeholder: "Identify the card and explain why it is the strongest evidence." }, `${synthesisPrefix}:strongest`, 2)}
          ${renderField({ id: "interpretation", label: "Developing interpretation", placeholder: "Explain what the film suggests and how your evidence supports that idea." }, `${synthesisPrefix}:interpretation`, 3)}
        </div>
      </section>
    </div>
  </section>`;
}

function renderQuestionPanel(profile: EnglishFilmStudyProfile, set: EnglishActivityQuestionSet, index: number, group: string) {
  const namespace = safeId(profile.namespace, "english-unit");
  const setId = safeId(set.id);
  const prefix = stableId(namespace, "film-study-questions", setId);
  const source = `${selectedFilm(profile)} | ${set.title}`;
  const learnerSubtitle = (set.subtitle ?? "Film Study").replace(/\bprofile-supplied\b\s*/gi, "").trim() || "Film Study";
  const learnerIntro = set.intro?.replace(/\bprofile-supplied\b\s*/gi, "").trim();
  const sections = new Map<string, typeof set.questions>();
  for (const question of set.questions) {
    const section = question.section?.trim() || "Questions";
    sections.set(section, [...(sections.get(section) ?? []), question]);
  }
  return `<section class="film-question-workbook worksheet-panel" data-film-profile-panel-group="${escapeHtml(group)}" data-film-profile-panel="${escapeHtml(setId)}" data-film-progress data-film-print-scope ${index === 0 ? "" : "hidden"} ${renderCollectionAttributes({
    collectionId: `${prefix}:collection`,
    responsePrefix: `${prefix}:`,
    source,
    concept: `${set.title} Question Collection`,
    savedMessage: `${set.title} saved to Evidence Bank`,
    updatedMessage: `${set.title} updated in Evidence Bank`
  })}>
    ${renderToolbar("Save Selected Question Set to Evidence Bank")}
    <article class="film-study-workbook english-activity-worksheet worksheet-document">
      <header class="film-document-header worksheet-document-header film-question-header english-dark-worksheet-header"><div><p>${escapeHtml(profile.courseCode)} Critical Analysis</p><h3>${escapeHtml(set.title)}</h3><span>${escapeHtml(learnerSubtitle)}</span></div><strong class="film-prompt-count">${set.questions.length} prompts</strong>${renderProgress(set.questions.length)}</header>
      ${learnerIntro ? `<p class="film-question-intro">${escapeHtml(learnerIntro)}</p>` : ""}
      <div class="film-question-list worksheet-questions">${[...sections.entries()].map(([section, questions]) => `<section class="film-question-section worksheet-section"><h4>${escapeHtml(section)}</h4>${questions.map((question, questionIndex) => renderField(question, `${prefix}:${safeId(question.id)}`, questionIndex + 1, true)).join("")}</section>`).join("")}</div>
    </article>
  </section>`;
}

function renderFilmQuestions(profile: EnglishFilmStudyProfile, routeId: string) {
  const namespace = safeId(profile.namespace, "english-unit");
  const group = stableId(namespace, "film-study-questions", "sets");
  return `<section id="${escapeHtml(routeId)}" class="course-page english-activity-page film-study-profile-page film-questions-page" hidden data-film-study-profile="${escapeHtml(namespace)}">
    ${renderPageHeading(profile, "Film Study Questions", "Choose a question set to open grouped film-technique or full-film response questions. Answers save automatically and the complete active set can be added to the Evidence Bank as one collection.")}
    <div class="film-question-picker story-question-selector"><label>Choose a question set<select data-response-id="${escapeHtml(stableId(namespace, "selection", "film-question-set"))}" data-film-profile-select="${escapeHtml(group)}">${profile.questionSets.map((set) => `<option value="${escapeHtml(safeId(set.id))}">${escapeHtml(set.title)}</option>`).join("")}</select></label><p>Responses autosave. Hints stay optional and Print / PDF stays scoped to the active set.</p></div>
    <div class="film-question-panels">${profile.questionSets.map((set, index) => renderQuestionPanel(profile, set, index, group)).join("")}</div>
  </section>`;
}

function renderFilmRoom(profile: EnglishFilmStudyProfile, routeId: string, videos: ReturnType<typeof normalizeVideos>, resources: FilmStudyProfileResource[]) {
  const namespace = safeId(profile.namespace, "english-unit");
  const conceptItems = resources.filter((resource) => resource.kind === "concept").slice(0, 4);
  if (!videos.length) {
    return `<section id="${escapeHtml(routeId)}" class="course-page english-activity-page film-study-profile-page film-room-page" hidden data-film-study-profile="${escapeHtml(namespace)}">
      ${renderPageHeading(profile, "Film Room", "Use this concept index to revisit the film-study instruction before applying each technique to your selected film.")}
      <section class="film-concept-index" aria-labelledby="${escapeHtml(`${namespace}-film-concepts-title`)}">
        <header><p class="route-kicker">Film-study concept index</p><h3 id="${escapeHtml(`${namespace}-film-concepts-title`)}">Review the core concepts</h3><p>Use the concept cards as a roadmap, then return to the matching lesson for its full explanation and examples.</p></header>
        <div class="film-concept-index-grid">${conceptItems.map((resource, index) => `<article><span>${index + 1}</span><div><p>${escapeHtml(resource.group)}</p><h4>${escapeHtml(resource.title)}</h4><p>${escapeHtml(resource.description ?? "Review the matching film-study lesson.")}</p></div></article>`).join("")}</div>
        <a class="film-concept-index-action" href="#lessons"><span class="material-symbols-outlined" aria-hidden="true">menu_book</span> Open Film Study Lessons</a>
      </section>
    </section>`;
  }
  const items = videos.length ? videos.map((video) => {
    const metadata = legacyVideoMetadata(videoSourceId(video), video.title);
    return {
      id: video.id,
      title: metadata.title,
      lessonTitle: metadata.group,
      description: video.description ?? "Course-selected film-study concept video.",
      embedUrl: video.embedUrl,
      fallbackUrl: video.fallbackUrl,
      embeddable: video.embeddable,
      status: video.status ?? "available"
    };
  }) : [];
  return `<section id="${escapeHtml(routeId)}" class="course-page english-activity-page film-study-profile-page film-room-page" hidden data-film-study-profile="${escapeHtml(namespace)}">
    ${renderPageHeading(profile, "Film Room", "Review the film-study clips in one organized playlist. Every item also includes a direct source link when embedded playback is unavailable.")}
    <div class="film-room-shell" data-film-room>
      <div class="film-room-stage">
        ${items.map((item, index) => `<article class="film-room-panel" data-film-room-panel="${escapeHtml(item.id)}" ${index === 0 ? "" : "hidden"}>
          <header class="film-room-header"><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.lessonTitle)}</p></div></header>
          ${item.embeddable && item.embedUrl ? `<iframe class="film-room-frame" src="${escapeHtml(item.embedUrl)}" title="${escapeHtml(item.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>` : `<div class="film-room-fallback"><span class="material-symbols-outlined" aria-hidden="true">movie</span><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.status === "needs-review" ? "This embed is withheld until its source has been reviewed. Use the direct source only after approval." : item.description)}</p></div>`}
          <div class="film-room-direct"><p>${escapeHtml(item.description)}</p><a href="${escapeHtml(item.fallbackUrl)}" target="_blank" rel="noopener noreferrer">Open source directly</a></div>
        </article>`).join("")}
      </div>
      <aside class="film-room-sidebar">
        <div class="film-room-control-panel"><h3>Media Playlist</h3><p>Choose a clip from the film-study lessons.</p><label class="film-room-label" for="${escapeHtml(`${namespace}-film-room-select`)}">Choose a video</label><select id="${escapeHtml(`${namespace}-film-room-select`)}" class="film-room-select" data-film-room-select-menu>${items.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`).join("")}</select></div>
        <div class="film-now-panel"><h3>Playlist Order</h3><ol class="film-playlist-list">${items.map((item) => `<li><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.lessonTitle)}</span></li>`).join("")}</ol></div>
      </aside>
    </div>
  </section>`;
}

function groupResources(resources: FilmStudyProfileResource[]) {
  const groups = new Map<string, FilmStudyProfileResource[]>();
  for (const resource of resources) {
    const existing = groups.get(resource.group) ?? [];
    existing.push(resource);
    groups.set(resource.group, existing);
  }
  return [...groups.entries()];
}

function renderResources(
  profile: EnglishFilmStudyProfile,
  routeId: string,
  resources: FilmStudyProfileResource[],
  page: FilmStudyResourcePageConfig = {}
) {
  const namespace = safeId(profile.namespace, "english-unit");
  const groups = groupResources(resources);
  return `<section id="${escapeHtml(routeId)}" class="course-page english-activity-page film-study-profile-page film-resources-page" hidden data-film-study-profile="${escapeHtml(namespace)}">
    ${renderPageHeading(
      profile,
      page.title ?? "Resources",
      page.description ?? "Useful source links, videos, and files collected from the feature-film unit. Choose a lesson group to keep the resource list focused."
    )}
    <div class="film-resource-groups resource-browser" data-film-resources>
      <div class="resource-group-control"><label class="film-room-label" for="${escapeHtml(`${namespace}-resource-select`)}">Choose a lesson group</label><select id="${escapeHtml(`${namespace}-resource-select`)}" class="film-room-select" data-film-resource-select-menu>${groups.map(([group]) => `<option value="${escapeHtml(safeId(group))}">${escapeHtml(group)}</option>`).join("")}</select></div>
      ${groups.map(([group, items], groupIndex) => `<section class="film-resource-group resource-lesson-group" data-film-resource-panel="${escapeHtml(safeId(group))}" ${groupIndex === 0 ? "" : "hidden"}><header class="resource-group-heading"><h3>${escapeHtml(group)}</h3><p>${items.length} ${items.length === 1 ? "source" : "sources"} collected for this group.</p></header><div class="film-resource-list resource-lesson-items">${items.map((resource) => `<article class="film-resource-card external-resource-card" data-resource-kind="${escapeHtml(resource.kind ?? "link")}" data-resource-status="${escapeHtml(resource.status ?? "available")}"><div><span class="film-resource-kind resource-kicker">${escapeHtml((resource.kind ?? "resource").replace(/-/g, " "))}</span><h4>${escapeHtml(resource.title)}</h4><p>${escapeHtml(resource.description ?? "Course-selected film-study resource.")}</p></div>${resource.href ? `<a class="external-resource-action" href="${escapeHtml(resource.href)}" target="${resource.href.startsWith("#") ? "_self" : "_blank"}" rel="noopener noreferrer"${resource.downloadable ? " download" : ""}>${escapeHtml(resource.actionLabel ?? (resource.downloadable ? "Open / Download" : "Open Resource"))}</a>` : `<span class="film-resource-access-note">${resource.status === "needs-review" ? "Editorial review required before publication." : "Use the matching teacher-provided course material."}</span>`}</article>`).join("")}</div></section>`).join("")}
    </div>
  </section>`;
}

export function createFilmStudyProfileRendererRecipe(
  profile: EnglishFilmStudyProfile,
  input: Omit<FilmStudyProfileRendererRecipe, "schemaVersion" | "profile"> = {}
): FilmStudyProfileRendererRecipe {
  return { schemaVersion: 1, profile, ...input };
}

export function renderFilmStudyProfileModule(recipe: FilmStudyProfileRendererRecipe): FilmStudyProfileRenderResult {
  if (recipe.schemaVersion !== 1) throw new Error(`Unsupported Film Study renderer recipe version: ${String(recipe.schemaVersion)}`);
  validateProfile(recipe.profile);
  const routes = normalizeRoutes(recipe.routes);
  const videos = normalizeVideos(recipe.videos ?? []);
  const resources = normalizeResources(recipe, videos);
  const criticalEssayStagePages = recipe.profile.essay.stages.map((stage) => ({
    id: `${routes.criticalEssay}-${safeId(stage.id)}`,
    label: stage.title,
    icon: "edit_note",
    html: ""
  }));
  const previewPage = {
    id: `${routes.criticalEssay}-preview`,
    label: "Critical Essay Preview",
    icon: "preview",
    html: ""
  };
  const guidePage = {
    id: routes.criticalEssay,
    label: "Critical Essay",
    icon: "edit_note",
    html: renderCriticalEssayGuide(recipe.profile, routes.criticalEssay, criticalEssayStagePages[0] ?? previewPage)
  };
  const renderedStagePages = criticalEssayStagePages.map((page, index) => ({
    ...page,
    html: renderCriticalEssayStage({
      profile: recipe.profile,
      routeId: page.id,
      stage: recipe.profile.essay.stages[index]!,
      previous: index === 0 ? { id: guidePage.id, label: "Critical Analytical Essay Guide" } : criticalEssayStagePages[index - 1]!,
      next: criticalEssayStagePages[index + 1] ?? previewPage
    })
  }));
  previewPage.html = renderCriticalEssayPreview(recipe.profile, previewPage.id, renderedStagePages.at(-1) ?? guidePage);
  const personalResponseStagePages = (recipe.profile.personalResponse?.stages ?? []).map((stage) => ({
    id: `${routes.personalResponse}-${safeId(stage.id)}`,
    label: stage.title,
    icon: "edit_note",
    html: ""
  }));
  const personalResponsePreviewPage = {
    id: `${routes.personalResponse}-preview`,
    label: "Personal Response Preview",
    icon: "preview",
    html: ""
  };
  const personalResponseGuidePage = recipe.profile.personalResponse ? {
    id: routes.personalResponse,
    label: "Personal Response",
    icon: "edit_note",
    html: renderPersonalResponseGuide(recipe.profile, routes.personalResponse, personalResponseStagePages[0] ?? personalResponsePreviewPage)
  } : undefined;
  const renderedPersonalResponseStagePages = recipe.profile.personalResponse && personalResponseGuidePage
    ? personalResponseStagePages.map((page, index) => ({
      ...page,
      html: renderPersonalResponseStage({
        profile: recipe.profile,
        routeId: page.id,
        stage: recipe.profile.personalResponse!.stages[index]!,
        previous: index === 0 ? { id: personalResponseGuidePage.id, label: "Personal Response to Text Guide" } : personalResponseStagePages[index - 1]!,
        next: personalResponseStagePages[index + 1] ?? personalResponsePreviewPage
      })
    }))
    : [];
  if (recipe.profile.personalResponse && personalResponseGuidePage) {
    personalResponsePreviewPage.html = renderPersonalResponsePreview(recipe.profile, personalResponsePreviewPage.id, renderedPersonalResponseStagePages.at(-1) ?? personalResponseGuidePage);
  }
  const pages: EnglishRenderedActivityPage[] = [
    guidePage,
    ...renderedStagePages,
    previewPage,
    ...(personalResponseGuidePage ? [personalResponseGuidePage, ...renderedPersonalResponseStagePages, personalResponsePreviewPage] : []),
    { id: routes.viewingGuide, label: "Viewing Guide", icon: "visibility", html: renderViewingGuide(recipe.profile, routes.viewingGuide) },
    { id: routes.questions, label: "Film Study Questions", icon: "quiz", html: renderFilmQuestions(recipe.profile, routes.questions) },
    { id: routes.filmRoom, label: "Film Room", icon: "video_library", html: renderFilmRoom(recipe.profile, routes.filmRoom, videos, resources) },
    {
      id: routes.resources,
      label: recipe.resourcePage?.label ?? "Resources",
      icon: "folder_open",
      html: renderResources(recipe.profile, routes.resources, resources, recipe.resourcePage)
    }
  ];
  const essayFieldCount = recipe.profile.essay.stages.reduce((total, stage) => total + stage.fields.length, 0);
  return {
    kind: "film-study",
    pages,
    navGroups: [
      {
        id: routes.criticalEssay,
        label: "Critical Essay",
        icon: "edit_note",
        landingItemLabel: "Critical Analytical Essay Guide",
        itemPageIds: [...renderedStagePages.map((page) => page.id), previewPage.id]
      },
      ...(personalResponseGuidePage ? [{
        id: routes.personalResponse,
        label: "Personal Response",
        icon: "edit_note",
        landingItemLabel: "Personal Response to Text Guide",
        itemPageIds: [...renderedPersonalResponseStagePages.map((page) => page.id), personalResponsePreviewPage.id]
      }] : [])
    ],
    resourceLinks: resources.map(({ group: _group, kind: _kind, ...resource }) => resource),
    css: FILM_STUDY_PROFILE_CSS,
    runtime: FILM_STUDY_PROFILE_RUNTIME,
    contract: {
      schemaVersion: 1,
      namespace: safeId(recipe.profile.namespace, "english-unit"),
      routes,
      essayStageCount: recipe.profile.essay.stages.length,
      essayFieldCount,
      personalResponseStageCount: recipe.profile.personalResponse?.stages.length ?? 0,
      personalResponseFieldCount: recipe.profile.personalResponse?.stages.reduce((total, stage) => total + stage.fields.length, 0) ?? 0,
      questionSetCounts: Object.fromEntries(recipe.profile.questionSets.map((set) => [safeId(set.id), set.questions.length])),
      viewingMomentContributionPrefix: stableId(recipe.profile.namespace, "viewing-guide", "moment")
    }
  };
}

export const FILM_STUDY_PROFILE_CSS = String.raw`
.film-study-profile-page {
  --film-green: #154212;
  --film-green-dark: #0e310c;
  --film-ink: #191c1d;
  --film-muted: #5d655b;
  --film-line: #d8ddd4;
  --film-soft: #f4f6f1;
  --film-paper: #ffffff;
  color: var(--film-ink);
}
.film-study-profile-page .route-title {
  margin-bottom: 8px;
}
.film-profile-notice {
  margin: 18px 0 24px;
  border: 1px solid #d5dccf;
  border-left: 4px solid var(--film-green);
  border-radius: 7px;
  background: #f7f9f4;
  padding: 14px 16px;
}
.film-profile-notice strong,
.film-profile-notice p {
  display: block;
  margin: 0;
}
.film-profile-notice strong {
  color: var(--film-green-dark);
  font-size: 15px;
}
.film-profile-notice p {
  margin-top: 5px;
  color: #465044;
  line-height: 1.5;
}
.film-stage-workbench {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
  margin-top: 24px;
}
.film-stage-navigation {
  position: sticky;
  top: 18px;
  overflow: hidden;
  border: 1px solid #284b30;
  border-radius: 8px;
  background: #183322;
  color: #fff;
}
.film-stage-navigation > div,
.film-stage-navigation > label {
  display: block;
  padding: 17px;
}
.film-stage-navigation > div {
  border-bottom: 1px solid rgba(255,255,255,.14);
}
.film-stage-navigation h3,
.film-stage-navigation p {
  margin: 0;
}
.film-stage-navigation h3 {
  font-size: 20px;
}
.film-stage-navigation p {
  margin-top: 5px;
  color: #d5e0d4;
  font-size: 13px;
  line-height: 1.45;
}
.film-stage-navigation > label {
  color: #dce7dc;
  font-size: 13px;
  font-weight: 700;
}
.film-stage-navigation select {
  width: 100%;
  min-height: 42px;
  margin-top: 7px;
  border: 1px solid #879888;
  border-radius: 6px;
  background: #fff;
  padding: 8px 10px;
  color: var(--film-ink);
}
.film-stage-list {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0 0 8px;
  list-style: none;
}
.film-stage-list button {
  display: grid;
  width: 100%;
  grid-template-columns: 28px 1fr;
  gap: 9px;
  align-items: center;
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 10px 14px;
  color: #eef4ed;
  text-align: left;
  font: inherit;
  cursor: pointer;
}
.film-stage-list button:hover,
.film-stage-list button:focus-visible,
.film-stage-list button.is-active {
  background: rgba(255,255,255,.11);
}
.film-stage-list button:focus-visible {
  outline: 2px solid #b6d4af;
  outline-offset: -3px;
}
.film-stage-list button > span {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border: 1px solid rgba(255,255,255,.32);
  border-radius: 5px;
  font-size: 12px;
  font-weight: 800;
}
.film-stage-list button.is-active > span {
  border-color: #d4ead0;
  background: #d4ead0;
  color: var(--film-green-dark);
}
.film-study-workbook {
  overflow: hidden;
  border: 1px solid var(--film-line);
  border-radius: 8px;
  background: var(--film-paper);
}
.film-workbook-toolbar {
  display: flex;
  min-height: 58px;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border-bottom: 1px solid var(--film-line);
  padding: 10px 14px;
}
.film-save-status {
  color: var(--film-muted);
  font-size: 13px;
}
.film-toolbar-actions,
.film-full-plan-actions,
.film-entry-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.film-study-profile-page button,
.film-study-profile-page a {
  -webkit-tap-highlight-color: transparent;
}
.film-toolbar-actions button,
.film-full-plan-actions button,
.film-entry-actions button,
.film-bank-heading a,
.film-room-direct a,
.film-resource-card > a {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid #aab5a5;
  border-radius: 7px;
  background: #fff;
  padding: 8px 12px;
  color: var(--film-green-dark);
  font: inherit;
  font-size: 13px;
  font-weight: 750;
  line-height: 1.2;
  text-decoration: none;
  cursor: pointer;
}
.film-toolbar-actions button:hover,
.film-full-plan-actions button:hover,
.film-entry-actions button:hover,
.film-bank-heading a:hover,
.film-room-direct a:hover,
.film-resource-card > a:hover {
  border-color: var(--film-green);
  background: #f5f8f3;
}
.film-study-profile-page .evidence-bank-save-action {
  border-color: var(--film-green);
  background: var(--film-green);
  color: #fff;
}
.film-study-profile-page .evidence-bank-save-action:hover,
.film-study-profile-page .evidence-bank-save-action:focus-visible {
  border-color: var(--film-green-dark);
  background: var(--film-green-dark);
  color: #fff;
}
.film-document-header {
  display: grid;
  gap: 6px;
  background: #161a17;
  padding: 24px 28px;
  color: #fff;
}
.film-document-header p,
.film-document-header h3,
.film-document-header > span {
  margin: 0;
}
.film-document-header p {
  color: #a9c6a7;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .05em;
  text-transform: uppercase;
}
.film-document-header h3 {
  font-size: clamp(26px, 3vw, 38px);
  line-height: 1.1;
}
.film-document-header > span {
  color: #d9dfd7;
  line-height: 1.5;
}
.film-workbook-body {
  padding: 24px 28px 30px;
}
.film-writing-move,
.film-model,
.film-checkpoints {
  margin: 0 0 20px;
  border-left: 3px solid var(--film-green);
  background: var(--film-soft);
  padding: 14px 16px;
}
.film-writing-move h4,
.film-writing-move p,
.film-model p,
.film-checkpoints h4,
.film-checkpoints ul {
  margin: 0;
}
.film-writing-move p,
.film-model p,
.film-checkpoints ul {
  margin-top: 6px;
  line-height: 1.55;
}
.film-field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}
.film-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 7px;
}
.film-field:nth-child(3n),
.film-question,
.film-viewing-synthesis .film-field {
  grid-column: 1 / -1;
}
.film-field-label {
  color: #283229;
  font-size: 14px;
  font-weight: 750;
}
.film-field-prompt {
  margin: -2px 0 0;
  color: var(--film-muted);
  font-size: 13px;
  line-height: 1.45;
}
.film-field-hint {
  border: 1px solid #dedbbd;
  border-radius: 6px;
  background: #fffced;
  padding: 10px 12px;
  color: #514d33;
  font-size: 13px;
  line-height: 1.45;
}
.film-field-control {
  display: grid;
  gap: 6px;
}
.film-field input[type="text"],
.film-field input[type="number"],
.film-field select,
.film-field textarea,
.film-question-picker select,
.film-bank-filters select {
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  border: 1px solid #bfc7bb;
  border-radius: 7px;
  background: #fff;
  padding: 10px 11px;
  color: var(--film-ink);
  font: inherit;
  line-height: 1.45;
}
.film-field textarea {
  min-height: 126px;
  resize: vertical;
}
.film-field input:focus,
.film-field select:focus,
.film-field textarea:focus,
.film-question-picker select:focus,
.film-bank-filters select:focus {
  border-color: var(--film-green);
  outline: 3px solid rgba(21,66,18,.14);
}
.film-word-count {
  justify-self: end;
  color: #747b72;
  font-size: 12px;
}
.film-progress {
  display: grid;
  gap: 7px;
  margin-top: 15px;
  border-top: 1px solid rgba(255,255,255,.15);
  padding-top: 14px;
}
.film-progress > div:first-child {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  color: #d8ded6;
  font-size: 13px;
}
.film-progress-track {
  overflow: hidden;
  height: 8px;
  border-radius: 4px;
  background: #273129;
}
.film-progress-track span {
  display: block;
  width: 0;
  height: 100%;
  background: #8fc483;
  transition: width .2s ease;
}
.film-full-plan-actions {
  justify-content: flex-end;
  margin-top: 18px;
  border: 1px solid var(--film-line);
  border-radius: 8px;
  background: #fafbf8;
  padding: 14px;
}
.film-full-plan-actions > span {
  flex-basis: 100%;
  color: var(--film-muted);
  text-align: right;
  font-size: 13px;
}
.film-viewing-notebook {
  display: grid;
  gap: 22px;
  margin-top: 22px;
}
.film-viewing-setup,
.film-viewing-bank {
  border: 1px solid var(--film-line);
  border-radius: 8px;
  background: #fff;
  padding: 20px;
}
.film-section-heading h3,
.film-section-heading p,
.film-bank-heading h3,
.film-bank-heading p {
  margin: 0;
}
.film-section-heading p,
.film-bank-heading p {
  margin-top: 4px;
  color: var(--film-muted);
  line-height: 1.5;
}
.film-setup-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}
.film-setup-grid .film-field:nth-child(3n) {
  grid-column: auto;
}
.film-setup-grid .film-field:nth-last-child(-n+2) {
  grid-column: span 1;
}
.film-entry-actions {
  justify-content: flex-end;
  margin-top: 20px;
  border-top: 1px solid var(--film-line);
  padding-top: 16px;
}
.film-bank-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}
.film-bank-filters {
  display: grid;
  grid-template-columns: minmax(210px, 320px) auto;
  gap: 18px;
  align-items: end;
  margin-top: 18px;
  border-top: 1px solid var(--film-line);
  padding-top: 16px;
}
.film-bank-filters label {
  color: #374139;
  font-size: 13px;
  font-weight: 700;
}
.film-bank-filters select {
  margin-top: 6px;
}
.film-strongest-filter {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 8px;
}
.film-viewing-card-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}
.film-viewing-card {
  border: 1px solid var(--film-line);
  border-left: 4px solid #8aa486;
  border-radius: 7px;
  background: #fbfcfa;
  padding: 16px;
}
.film-viewing-card.is-strongest {
  border-left-color: var(--film-green);
  background: #f4f8f1;
}
.film-viewing-card header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.film-viewing-card h4,
.film-viewing-card header p {
  margin: 0;
}
.film-viewing-card header p {
  margin-top: 3px;
  color: var(--film-muted);
  font-size: 13px;
}
.film-viewing-card dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px 18px;
  margin: 16px 0;
}
.film-viewing-card dl > div:last-child {
  grid-column: 1 / -1;
}
.film-viewing-card dt {
  color: var(--film-green-dark);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .03em;
  text-transform: uppercase;
}
.film-viewing-card dd {
  margin: 4px 0 0;
  color: #313a32;
  line-height: 1.5;
  white-space: pre-wrap;
}
.film-card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-top: 1px solid var(--film-line);
  padding-top: 13px;
}
.film-card-actions button {
  min-height: 36px;
  border: 1px solid #aeb8aa;
  border-radius: 6px;
  background: #fff;
  padding: 7px 10px;
  color: #304230;
  font: inherit;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
}
.film-card-actions .evidence-bank-save-action {
  margin-left: auto;
}
.film-card-save-status {
  display: block;
  margin-top: 9px;
  color: var(--film-muted);
  font-size: 12px;
}
.film-empty-state {
  margin: 0;
  border: 1px dashed #bec6ba;
  border-radius: 7px;
  padding: 24px;
  color: var(--film-muted);
  text-align: center;
}
.film-question-picker {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(230px, 360px);
  gap: 20px;
  align-items: end;
  margin: 22px 0 18px;
  border: 1px solid #d5ddcf;
  border-radius: 8px;
  background: #f6f8f3;
  padding: 16px;
}
.film-question-picker strong,
.film-question-picker p {
  display: block;
  margin: 0;
}
.film-question-picker p {
  margin-top: 4px;
  color: var(--film-muted);
  line-height: 1.45;
}
.film-question-picker label {
  color: var(--film-green-dark);
  font-size: 13px;
  font-weight: 750;
}
.film-question-picker select {
  margin-top: 6px;
}
.film-question-header {
  grid-template-columns: minmax(0, 1fr) auto;
}
.film-question-header .film-progress {
  grid-column: 1 / -1;
}
.film-prompt-count {
  align-self: start;
  border: 1px solid #506054;
  border-radius: 6px;
  padding: 7px 9px;
  color: #dfe8dd;
  font-size: 12px;
}
.film-question-intro {
  margin: 0 0 20px;
  color: #465047;
  line-height: 1.55;
}
.film-question-list {
  display: grid;
  gap: 0;
}
.film-question {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  border-top: 1px solid #e3e6e0;
  padding: 20px 0;
}
.film-question:first-child {
  border-top: 0;
  padding-top: 0;
}
.film-question-prompt {
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 8px;
  align-items: start;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
}
.film-question-prompt strong {
  color: var(--film-green);
}
.film-room-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 310px;
  gap: 20px;
  align-items: start;
  margin-top: 24px;
}
.film-room-stage,
.film-room-playlist {
  border: 1px solid var(--film-line);
  border-radius: 8px;
  background: #fff;
}
.film-room-stage {
  padding: 18px;
  background: #f5f6f4;
}
.film-room-panel header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 15px;
}
.film-room-panel header p,
.film-room-panel header h3 {
  margin: 0;
}
.film-room-panel header p {
  color: var(--film-green);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.film-room-panel header h3 {
  margin-top: 4px;
  font-size: 24px;
}
.film-media-status {
  border: 1px solid #c7cec3;
  border-radius: 5px;
  background: #fff;
  padding: 6px 8px;
  color: #536051;
  font-size: 11px;
  font-weight: 700;
}
.film-room-frame {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 340px;
  border: 1px solid #101210;
  border-radius: 7px;
  background: #000;
}
.film-room-fallback {
  display: grid;
  min-height: 340px;
  place-items: center;
  align-content: center;
  gap: 8px;
  border: 1px solid #cbd1c7;
  border-radius: 7px;
  background: #e9ece7;
  padding: 28px;
  text-align: center;
}
.film-room-fallback .material-symbols-outlined {
  color: var(--film-green);
  font-size: 42px;
}
.film-room-fallback h4,
.film-room-fallback p {
  margin: 0;
}
.film-room-fallback p {
  max-width: 520px;
  color: #4e584d;
  line-height: 1.5;
}
.film-room-direct {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 13px;
}
.film-room-direct p {
  margin: 0;
  color: var(--film-muted);
  font-size: 13px;
  line-height: 1.45;
}
.film-room-playlist {
  position: sticky;
  top: 18px;
  overflow: hidden;
}
.film-room-playlist > div:first-child {
  border-bottom: 1px solid var(--film-line);
  padding: 17px;
}
.film-room-playlist h3,
.film-room-playlist p {
  margin: 0;
}
.film-room-playlist p {
  margin-top: 4px;
  color: var(--film-muted);
  font-size: 13px;
  line-height: 1.45;
}
.film-playlist-items {
  display: grid;
  padding: 8px;
}
.film-playlist-items button {
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 9px;
  align-items: start;
  border: 0;
  border-radius: 6px;
  background: transparent;
  padding: 10px;
  color: var(--film-ink);
  text-align: left;
  cursor: pointer;
}
.film-playlist-items button:hover,
.film-playlist-items button:focus-visible,
.film-playlist-items button.is-active {
  background: #eef3eb;
}
.film-playlist-items button > span:first-child {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 5px;
  background: #dce7d8;
  color: var(--film-green-dark);
  font-size: 12px;
  font-weight: 800;
}
.film-playlist-items strong,
.film-playlist-items em {
  display: block;
}
.film-playlist-items strong {
  line-height: 1.3;
}
.film-playlist-items em {
  margin-top: 3px;
  color: var(--film-muted);
  font-size: 12px;
  font-style: normal;
}
.film-resource-groups {
  display: grid;
  gap: 24px;
  margin-top: 24px;
}
.film-resource-group {
  overflow: hidden;
  border: 1px solid var(--film-line);
  border-radius: 8px;
  background: #fff;
}
.film-resource-group > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border-bottom: 1px solid var(--film-line);
  background: #f4f6f1;
  padding: 14px 16px;
}
.film-resource-group h3 {
  margin: 0;
  font-size: 19px;
}
.film-resource-group > header span {
  color: var(--film-muted);
  font-size: 12px;
}
.film-resource-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
}
.film-resource-card {
  display: flex;
  min-height: 165px;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  border-right: 1px solid var(--film-line);
  border-bottom: 1px solid var(--film-line);
  padding: 17px;
}
.film-resource-card:nth-child(2n) {
  border-right: 0;
}
.film-resource-card h4,
.film-resource-card p {
  margin: 0;
}
.film-resource-card h4 {
  margin-top: 4px;
  font-size: 17px;
}
.film-resource-card p {
  margin-top: 5px;
  color: var(--film-muted);
  line-height: 1.48;
}
.film-resource-kind {
  color: var(--film-green);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .05em;
  text-transform: uppercase;
}
.film-resource-card > a,
.film-resource-access-note {
  margin-top: auto;
}
.film-resource-access-note {
  color: #5c6359;
  font-size: 13px;
}

/* Legacy Feature Film donor alignment. The shared Evidence Bank hooks and stable
   response ids remain on the modern activity controls beneath these surfaces. */
.critical-writing-panel {
  margin: 16px 0 0;
  border: 1px solid #d6ddd3;
  border-radius: 6px;
  background: #fff;
  padding: 18px;
}
.critical-writing-panel h3,
.critical-writing-panel p {
  margin: 0;
}
.critical-writing-panel h3 {
  margin-bottom: 12px;
  color: #202520;
  font-size: 25px;
  line-height: 1.15;
}
.critical-writing-panel p {
  color: #4d554a;
  line-height: 1.6;
}
.critical-category-grid,
.critical-writing-sequence {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.critical-category-grid {
  margin-top: 15px;
}
.critical-category-grid article,
.critical-sequence-card {
  border: 1px solid #d8dfd5;
  border-radius: 5px;
  background: #f7f9f5;
  padding: 14px;
}
.critical-category-grid article:last-child {
  grid-column: 1 / -1;
}
.critical-category-grid strong,
.critical-sequence-card strong {
  display: block;
  color: var(--film-green);
  font-weight: 800;
}
.critical-category-grid p,
.critical-sequence-card p {
  margin: 8px 0 0;
  color: #4d554a;
  line-height: 1.48;
}
.critical-writing-sequence {
  margin-top: 22px;
}
.critical-sequence-card {
  color: inherit;
  text-align: left;
  font: inherit;
  cursor: pointer;
}
.critical-sequence-card:hover,
.critical-sequence-card:focus-visible,
.critical-sequence-card.is-active {
  border-color: var(--film-green);
  background: #f2f7ef;
}
.critical-sequence-card span {
  display: block;
  margin-bottom: 6px;
  color: #5d6359;
  font-size: 13px;
  font-weight: 700;
}
.critical-check-list,
.critical-step-list {
  margin: 0;
  padding-left: 22px;
  color: #3f473d;
  line-height: 1.65;
}
.critical-check-list li,
.critical-step-list li {
  margin: 7px 0;
}
.film-stage-picker {
  display: block;
  max-width: 520px;
  margin: 22px 0 0;
  border: 1px solid #d8dfd1;
  border-radius: 8px;
  background: #fff;
  padding: 16px;
  color: var(--film-green-dark);
  font-size: 13px;
  font-weight: 750;
}
.film-stage-picker select {
  width: 100%;
  min-height: 44px;
  margin-top: 7px;
  border: 1px solid #bfc7bb;
  border-radius: 7px;
  background: #fff;
  padding: 9px 11px;
  color: var(--film-ink);
  font: inherit;
}
.film-stage-panels {
  margin-top: 22px;
}
.film-essay-stage > .film-workbook-toolbar {
  margin-bottom: 18px;
  border: 1px solid var(--film-line);
  border-radius: 8px;
  background: #fff;
}
.film-stage-summary {
  border: 1px solid #161a17;
  border-radius: 8px;
  background: #161a17;
  padding: 22px;
  color: #fff;
}
.film-stage-summary p,
.film-stage-summary h2,
.film-stage-summary h3,
.film-stage-summary > span {
  margin: 0;
}
.film-stage-summary p {
  color: #b9c3b2;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .05em;
  text-transform: uppercase;
}
.film-stage-summary h2,
.film-stage-summary h3 {
  margin-top: 7px;
  color: #fff;
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.08;
}
.film-stage-summary > span {
  display: block;
  margin-top: 8px;
  color: #d7ddd4;
  line-height: 1.55;
}
.film-stage-summary .film-progress {
  border-top-color: rgba(255, 255, 255, .16);
}
.film-stage-summary .film-progress > div:first-child {
  color: #d7ddd4;
}
.film-stage-summary .film-progress-track {
  background: #293029;
}
.film-critical-outcomes {
  margin-top: 16px;
  border: 1px solid #d6ddd3;
  border-left: 4px solid #477445;
  border-radius: 6px;
  background: #f7f9f5;
  padding: 18px;
}
.film-critical-outcomes h3,
.film-critical-outcomes ul {
  margin: 0;
}
.film-critical-outcomes h3 {
  color: var(--film-green-dark);
  font-size: 20px;
}
.film-critical-outcomes ul {
  margin-top: 10px;
  padding-left: 22px;
  line-height: 1.6;
}
.critical-lesson-panel {
  border-left: 1px solid #d6ddd3;
}
.critical-model-block {
  margin-top: 14px;
  border-left: 4px solid #477445;
  background: #f2f5f0;
  padding: 13px;
}
.critical-model-block strong {
  display: block;
  margin-bottom: 6px;
  color: var(--film-green);
}
.critical-support-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 15px;
}
.critical-support-grid .critical-writing-panel {
  margin-top: 0;
}
.critical-example-panel {
  background: #f8f9f6;
}
.critical-tip-panel {
  border-color: #e4d4b1;
  border-left-width: 1px;
  background: #fffaf0;
}
.critical-tip-panel h3 {
  color: #5f4b18;
}
.critical-planner {
  border-color: #d8dfd1;
  background: #f8f9f6;
}
.critical-field-grid {
  display: grid;
  gap: 14px;
  margin-top: 16px;
}
.critical-lesson-map ol {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 24px;
  margin: 16px 0 0;
  padding-left: 24px;
  color: #3f473d;
}
.film-essay-lesson-navigation {
  max-width: none;
}
.essay-preview-toolbar {
  margin-top: 22px;
  border: 1px solid var(--film-line);
  border-radius: 8px;
  background: #fff;
}
.essay-preview-foundation {
  display: grid;
  grid-template-columns: minmax(180px, .42fr) minmax(0, 1fr);
  gap: 24px;
  margin-top: 22px;
  border: 1px solid #d8dfd1;
  border-left: 3px solid var(--film-green);
  border-radius: 8px;
  background: #f8f9f6;
  padding: 22px;
}
.essay-preview-foundation h3,
.essay-preview-foundation p,
.essay-preview-foundation dl,
.essay-preview-foundation dt,
.essay-preview-foundation dd {
  margin: 0;
}
.essay-preview-foundation h3 {
  margin-top: 5px;
  font-size: 24px;
}
.essay-preview-foundation dl {
  display: grid;
  gap: 14px;
}
.essay-preview-foundation dl > div {
  border-bottom: 1px solid #d8dfd1;
  padding-bottom: 13px;
}
.essay-preview-foundation dl > div:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}
.essay-preview-foundation dt {
  color: var(--film-green);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.essay-preview-foundation dd {
  margin-top: 5px;
  color: #30362f;
  line-height: 1.55;
  white-space: pre-wrap;
}
.essay-preview-document {
  margin-top: 22px;
  border: 1px solid #cfd6ca;
  background: #fff;
}
.essay-preview-document > header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 5px 20px;
  border-bottom: 1px solid #cfd6ca;
  background: #161a17;
  padding: 24px 28px;
  color: #fff;
}
.essay-preview-document > header p,
.essay-preview-document > header h3,
.essay-preview-document > header span {
  margin: 0;
}
.essay-preview-document > header p {
  grid-column: 1 / -1;
  color: #b9c3b2;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .05em;
  text-transform: uppercase;
}
.essay-preview-document > header h3 {
  color: #fff;
  font-size: clamp(28px, 4vw, 40px);
}
.essay-preview-document > header span {
  align-self: end;
  color: #d7ddd4;
  font-size: 13px;
}
.essay-preview-section {
  padding: 24px 28px;
}
.essay-preview-section + .essay-preview-section {
  border-top: 1px solid #e1e5de;
}
.essay-preview-section h4 {
  margin: 0 0 12px;
  color: #202520;
  font-size: 18px;
}
.essay-preview-section p {
  margin: 0;
  color: #30362f;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 17px;
  line-height: 1.75;
  white-space: pre-wrap;
}
.essay-preview-section p + p {
  margin-top: 14px;
}
.essay-preview-section .essay-preview-empty {
  color: #697066;
  font-family: inherit;
  font-size: 14px;
  font-style: italic;
}
.essay-preview-save-status {
  min-height: 22px;
  margin: 12px 0 0;
  color: var(--film-green-dark);
  font-size: 13px;
  font-weight: 700;
}

.film-viewing-notebook {
  gap: 24px;
  margin-top: 30px;
}
.notebook-setup,
.notebook-baseline article,
.evidence-entry-panel,
.evidence-bank-panel,
.evidence-synthesis-panel {
  border: 1px solid #d9dadb;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 18px 45px rgba(20, 28, 22, .04);
}
.notebook-setup {
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 16px;
  background: linear-gradient(135deg, #fbfcfa 0%, #f4f7f0 100%);
  padding: 18px;
}
.notebook-setup .film-field:first-child {
  grid-column: 1 / -1;
}
.notebook-baseline {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}
.notebook-baseline article {
  padding: 24px;
}
.notebook-baseline h3 {
  margin: 0;
  color: #191c1d;
  font-size: clamp(26px, 3vw, 34px);
  line-height: 1.05;
}
.film-baseline-prompt {
  margin: 8px 0 14px;
  color: var(--film-green);
  font-weight: 750;
}
.evidence-entry-panel > .film-section-heading,
.evidence-synthesis-panel > .film-section-heading {
  padding: 24px 28px;
}
.evidence-entry-panel > .film-section-heading h3,
.evidence-synthesis-panel > .film-section-heading h3,
.evidence-bank-panel > .film-bank-heading h3 { color: #fff; }
.evidence-entry-panel > .film-section-heading p,
.evidence-synthesis-panel > .film-section-heading p {
  max-width: 740px;
  margin-top: 8px;
  color: #b9c3b2;
  font-size: 17px;
  line-height: 1.55;
}
.evidence-entry-panel > .film-workbook-toolbar,
.evidence-synthesis-panel > .film-workbook-toolbar {
  margin: 16px 28px 0;
  border: 1px solid var(--film-line);
  border-radius: 8px;
}
.evidence-bank-panel > .film-bank-heading {
  margin: -20px -20px 0;
  border-radius: 9px 9px 0 0;
  padding: 24px 28px;
}
.evidence-bank-panel > .film-bank-heading p { color: #b9c3b2; }

.film-question-picker.story-question-selector {
  display: block;
  max-width: 560px;
  margin: 28px 0;
  border: 1px solid #d9dadb;
  border-radius: 8px;
  background: #fbfcfa;
  padding: 18px;
}
.film-question-picker.story-question-selector label {
  color: var(--film-green-dark);
  font-size: 14px;
  font-weight: 750;
}
.film-question-picker.story-question-selector p {
  margin: 10px 0 0;
}
.film-question-workbook > .film-workbook-toolbar {
  margin-bottom: 16px;
  border: 0;
  padding: 0;
}
.film-question-workbook .worksheet-document {
  overflow: hidden;
  border: 1px solid #d9dadb;
  border-radius: 10px;
  background: #fff;
}
.film-question-workbook .film-question-intro {
  margin: 0;
  padding: 22px 28px 0;
  color: #42493e;
  font-size: 17px;
}
.film-question-list.worksheet-questions {
  display: block;
  padding: 26px 28px 0;
}
.film-question-section {
  margin-bottom: 34px;
}
.film-question-section h4 {
  margin: 0 0 18px;
  border-bottom: 1px solid #e6e8e5;
  padding-bottom: 8px;
  font-size: 24px;
  font-weight: 800;
}
.film-question-workbook .film-question {
  display: grid;
  gap: 10px;
  margin-bottom: 26px;
  border: 0;
  padding: 0;
}
.film-question-workbook .worksheet-question-prompt {
  grid-template-columns: 34px minmax(0, 1fr);
  margin-bottom: 0;
  font-size: 17px;
  line-height: 1.55;
}
.film-question-workbook .worksheet-hint {
  margin: 0 0 2px 44px;
}
.film-question-workbook .worksheet-answer-field {
  display: grid;
  gap: 8px;
  margin-left: 44px;
}
.film-question-workbook .worksheet-answer-field textarea {
  min-height: 118px;
  background: #f8f9fa;
}

.film-room-shell {
  grid-template-columns: minmax(0, 1fr) 340px;
}
.film-room-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.film-room-control-panel,
.film-now-panel {
  border: 1px solid var(--film-line);
  border-radius: 8px;
  background: #fff;
  padding: 18px;
}
.film-room-header h3,
.film-room-control-panel h3,
.film-now-panel h3 {
  margin: 0 0 8px;
  color: #191c1d;
  font-size: 24px;
  line-height: 1.2;
}
.film-room-header p,
.film-room-control-panel p {
  margin: 0;
  color: #42493e;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 1.5;
  text-transform: none;
}
.film-room-label {
  display: block;
  margin: 18px 0 8px;
  color: var(--film-green);
  font-size: 13px;
  font-weight: 700;
}
.film-room-select {
  width: 100%;
  min-height: 46px;
  border: 1px solid #c2c9bb;
  border-radius: 8px;
  background: #fff;
  padding: 9px 12px;
  color: #191c1d;
  font: inherit;
}
.film-playlist-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding-left: 22px;
}
.film-playlist-list strong,
.film-playlist-list span {
  display: block;
}
.film-playlist-list span {
  margin-top: 2px;
  color: var(--film-muted);
  font-size: 12px;
}

.resource-browser {
  display: grid;
  gap: 24px;
  margin-top: 24px;
}
.resource-group-control,
.resource-browser .resource-lesson-group {
  border: 1px solid #e1e3e4;
  border-radius: 8px;
  background: #fff;
}
.resource-group-control {
  max-width: 520px;
  padding: 18px;
}
.resource-group-control .film-room-label {
  margin-top: 0;
}
.resource-browser .resource-group-heading {
  display: block;
  border: 0;
  background: #fff;
  padding: 18px 18px 0;
}
.resource-browser .resource-group-heading h3,
.resource-browser .resource-group-heading p {
  margin: 0;
}
.resource-browser .resource-group-heading h3 {
  font-size: 24px;
}
.resource-browser .resource-group-heading p {
  margin-top: 8px;
  color: #42493e;
  font-size: 14px;
}
.resource-browser .resource-lesson-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  padding: 18px;
}
.resource-browser .film-resource-card {
  min-height: 180px;
  border: 1px solid #e1e3e4;
  border-radius: 8px;
  background: #fff;
  padding: 18px;
}
.resource-browser .film-resource-card h4 {
  margin-top: 5px;
  font-size: 22px;
}
.film-concept-index {
  margin-top: 24px;
  border: 1px solid var(--film-line);
  border-radius: 8px;
  background: #fff;
  padding: 24px;
}
.film-concept-index > header {
  max-width: 760px;
}
.film-concept-index > header h3 {
  margin: 4px 0 8px;
  font-size: clamp(26px, 3vw, 36px);
  line-height: 1.12;
}
.film-concept-index > header > p:last-child {
  margin: 0;
  color: var(--film-muted);
  line-height: 1.55;
}
.film-concept-index-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 22px;
}
.film-concept-index-grid article {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 13px;
  align-items: start;
  border: 1px solid #dce1d9;
  border-radius: 7px;
  background: #f7f9f5;
  padding: 16px;
}
.film-concept-index-grid article > span {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 5px;
  background: var(--film-green);
  color: #fff;
  font-weight: 800;
}
.film-concept-index-grid article p,
.film-concept-index-grid article h4 {
  margin: 0;
}
.film-concept-index-grid article div > p:first-child {
  color: var(--film-green);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.film-concept-index-grid article h4 {
  margin-top: 4px;
  font-size: 19px;
  line-height: 1.25;
}
.film-concept-index-grid article div > p:last-child {
  margin-top: 7px;
  color: var(--film-muted);
  font-size: 14px;
  line-height: 1.48;
}
.film-concept-index-action {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  border-radius: 5px;
  background: var(--film-green);
  color: #fff;
  padding: 9px 14px;
  font-weight: 800;
  text-decoration: none;
}
.film-study-profile-page [hidden] {
  display: none !important;
}
@media (max-width: 920px) {
  .film-stage-workbench,
  .film-room-shell {
    grid-template-columns: 1fr;
  }
  .film-stage-navigation,
  .film-room-playlist,
  .film-room-sidebar {
    position: static;
  }
  .film-stage-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .film-critical-essay-page .critical-category-grid,
  .film-critical-essay-page .critical-support-grid,
  .film-critical-essay-page .critical-lesson-map ol {
    grid-template-columns: 1fr;
  }
  .film-critical-essay-page .critical-category-grid article:last-child {
    grid-column: auto;
  }
}
@media (max-width: 680px) {
  .film-concept-index-grid {
    grid-template-columns: 1fr;
  }
  .film-workbook-toolbar,
  .film-bank-heading,
  .film-room-panel header,
  .film-room-direct {
    align-items: stretch;
    flex-direction: column;
  }
  .film-toolbar-actions,
  .film-full-plan-actions,
  .film-entry-actions {
    align-items: stretch;
    flex-direction: column;
  }
  .film-toolbar-actions button,
  .film-full-plan-actions button,
  .film-entry-actions button,
  .film-room-direct a {
    width: 100%;
  }
  .film-field-grid,
  .film-setup-grid,
  .notebook-setup,
  .film-bank-filters,
  .film-question-picker,
  .film-resource-list,
  .film-viewing-card dl,
  .film-stage-list,
  .critical-category-grid,
  .critical-writing-sequence,
  .critical-support-grid,
  .essay-preview-foundation,
  .essay-preview-document > header {
    grid-template-columns: 1fr;
  }
  .essay-preview-document > header span {
    justify-self: start;
  }
  .film-field,
  .film-field:nth-child(3n),
  .film-viewing-card dl > div:last-child {
    grid-column: auto;
  }
  .film-workbook-body,
  .film-document-header {
    padding: 20px 17px;
  }
  .film-question-header {
    grid-template-columns: 1fr;
  }
  .film-prompt-count {
    justify-self: start;
  }
  .film-card-actions .evidence-bank-save-action {
    width: 100%;
    margin-left: 0;
  }
  .film-room-frame,
  .film-room-fallback {
    min-height: 220px;
  }
}
@media print {
  .film-stage-navigation,
  .film-workbook-toolbar,
  .film-full-plan-actions,
  .film-entry-actions,
  .film-bank-filters,
  .film-card-actions,
  .film-question-picker,
  .film-room-playlist {
    display: none !important;
  }
  .film-study-workbook,
  .film-viewing-card,
  .film-resource-group {
    break-inside: avoid;
    box-shadow: none;
  }
  .film-field-hint[hidden] {
    display: none !important;
  }
}
`;

export function installFilmStudyProfileRuntime(rootDocument: Document = document) {
  type Moment = {
    id: string;
    filmTitle: string;
    viewingPass: string;
    focus: string;
    timestamp: string;
    technique: string;
    observation: string;
    directorChoice: string;
    effect: string;
    theme: string;
    analyticalUse: string;
    strongest: boolean;
    createdAt: string;
    updatedAt: string;
  };
  type EvidenceEntry = {
    contributionId?: string;
    createdAt?: string;
    [key: string]: unknown;
  };
  type EvidenceApi = {
    upsert(entry: Record<string, unknown>): unknown;
    list(filters?: Record<string, unknown>): EvidenceEntry[];
  };

  const browserWindow = rootDocument.defaultView ?? window;

  function wordCount(value: unknown) {
    return String(value ?? "").trim().split(/\s+/).filter(Boolean).length;
  }

  function controlHasValue(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
    if (control instanceof browserWindow.HTMLInputElement && control.type === "checkbox") return control.checked;
    return Boolean(String(control.value ?? "").trim());
  }

  function updateField(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
    const field = control.closest<HTMLElement>("[data-film-field]");
    const counter = field?.querySelector<HTMLElement>("[data-film-word-count]");
    if (counter) counter.textContent = `${wordCount(control.value)} words`;
    const progress = control.closest<HTMLElement>("[data-film-progress]");
    if (progress) updateProgress(progress);
  }

  function updateProgress(scope: HTMLElement) {
    const fields = Array.from(scope.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[data-film-field] [data-response-id]"))
      .filter((control) => !(control instanceof browserWindow.HTMLInputElement && control.type === "hidden"));
    const answered = fields.filter(controlHasValue).length;
    const label = scope.querySelector<HTMLElement>("[data-film-progress-label]");
    const fill = scope.querySelector<HTMLElement>("[data-film-progress-fill]");
    if (label) label.textContent = `${answered} of ${fields.length} answered`;
    if (fill) fill.style.width = `${fields.length ? Math.round(answered / fields.length * 100) : 0}%`;
  }

  function setPanelGroup(page: ParentNode, group: string, value: string) {
    const panels = Array.from(page.querySelectorAll<HTMLElement>("[data-film-profile-panel-group]"))
      .filter((panel) => panel.getAttribute("data-film-profile-panel-group") === group);
    if (!panels.length) return;
    const selected = panels.some((panel) => panel.getAttribute("data-film-profile-panel") === value)
      ? value
      : panels[0].getAttribute("data-film-profile-panel") ?? "";
    for (const panel of panels) panel.hidden = panel.getAttribute("data-film-profile-panel") !== selected;
    for (const button of Array.from(page.querySelectorAll<HTMLElement>("[data-film-profile-select-button]"))) {
      if (button.getAttribute("data-film-profile-select-button") !== group) continue;
      const active = button.getAttribute("data-film-profile-select-value") === selected;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    }
  }

  function syncPanelSelect(select: HTMLSelectElement) {
    const page = select.closest(".film-study-profile-page") ?? rootDocument;
    const group = select.getAttribute("data-film-profile-select") ?? "";
    setPanelGroup(page, group, select.value);
  }

  function fieldValue(root: Element, selector: string) {
    const field = root.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(selector);
    return field ? String(field.value ?? "").trim() : "";
  }

  function setFieldValue(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
    field.value = value;
    field.dispatchEvent(new browserWindow.Event("input", { bubbles: true }));
    field.dispatchEvent(new browserWindow.Event("change", { bubbles: true }));
  }

  function sanitizeMoment(value: unknown): Moment | undefined {
    if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
    const record = value as Record<string, unknown>;
    const id = String(record.id ?? "").trim();
    if (!id) return undefined;
    return {
      id,
      filmTitle: String(record.filmTitle ?? ""),
      viewingPass: String(record.viewingPass ?? ""),
      focus: String(record.focus ?? ""),
      timestamp: String(record.timestamp ?? ""),
      technique: String(record.technique ?? ""),
      observation: String(record.observation ?? ""),
      directorChoice: String(record.directorChoice ?? ""),
      effect: String(record.effect ?? ""),
      theme: String(record.theme ?? ""),
      analyticalUse: String(record.analyticalUse ?? ""),
      strongest: Boolean(record.strongest),
      createdAt: String(record.createdAt ?? new Date().toISOString()),
      updatedAt: String(record.updatedAt ?? record.createdAt ?? new Date().toISOString())
    };
  }

  function readMoments(root: HTMLElement) {
    const store = root.querySelector<HTMLTextAreaElement>("[data-film-viewing-store]");
    if (!store?.value) return [] as Moment[];
    try {
      const parsed = JSON.parse(store.value);
      if (!Array.isArray(parsed)) return [] as Moment[];
      return parsed.map(sanitizeMoment).filter((moment): moment is Moment => Boolean(moment));
    } catch {
      return [] as Moment[];
    }
  }

  function writeMoments(root: HTMLElement, moments: Moment[]) {
    const store = root.querySelector<HTMLTextAreaElement>("[data-film-viewing-store]");
    if (!store) return;
    store.value = JSON.stringify(moments);
    store.dispatchEvent(new browserWindow.Event("input", { bubbles: true }));
    renderMoments(root);
  }

  function viewingDraftFields(root: HTMLElement) {
    return Array.from(root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[data-film-viewing-draft]"));
  }

  function clearViewingDraft(root: HTMLElement) {
    for (const field of viewingDraftFields(root)) setFieldValue(field, "");
    const editing = root.querySelector<HTMLInputElement>("[data-film-viewing-editing-id]");
    if (editing) editing.value = "";
    const button = root.querySelector<HTMLButtonElement>("[data-film-viewing-save-draft]");
    if (button) button.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">add</span> Add Viewing Moment';
  }

  function draftValue(root: HTMLElement, id: string) {
    return fieldValue(root, `[data-film-viewing-draft="${id}"]`);
  }

  function setupValue(root: HTMLElement, id: string) {
    const suffix = `:viewing-guide:setup:${id}`;
    const field = Array.from(root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[data-response-id]"))
      .find((candidate) => candidate.getAttribute("data-response-id")?.endsWith(suffix));
    return String(field?.value ?? "").trim();
  }

  function nextMomentId(root: HTMLElement, moments: Moment[]) {
    const counter = root.querySelector<HTMLInputElement>("[data-film-viewing-counter]");
    const recorded = Number.parseInt(counter?.value ?? "0", 10);
    const existingMaximum = moments.reduce((maximum, moment) => {
      const match = moment.id.match(/moment-(\d+)$/);
      return match ? Math.max(maximum, Number.parseInt(match[1], 10)) : maximum;
    }, 0);
    const next = Math.max(Number.isFinite(recorded) ? recorded : 0, existingMaximum) + 1;
    if (counter) {
      counter.value = String(next);
      counter.dispatchEvent(new browserWindow.Event("input", { bubbles: true }));
    }
    return `moment-${String(next).padStart(4, "0")}`;
  }

  function collectMoment(root: HTMLElement, moments: Moment[]): Moment | undefined {
    const editingId = root.querySelector<HTMLInputElement>("[data-film-viewing-editing-id]")?.value ?? "";
    const existing = moments.find((moment) => moment.id === editingId);
    const momentValues = {
      timestamp: draftValue(root, "timestamp"),
      technique: draftValue(root, "technique"),
      observation: draftValue(root, "observation"),
      directorChoice: draftValue(root, "director-choice"),
      effect: draftValue(root, "effect"),
      theme: draftValue(root, "theme"),
      analyticalUse: draftValue(root, "analytical-use")
    };
    if (!Object.values(momentValues).some(Boolean)) return undefined;
    const now = new Date().toISOString();
    return {
      id: existing?.id ?? nextMomentId(root, moments),
      filmTitle: setupValue(root, "film-title") || root.getAttribute("data-film-title") || "Feature Film",
      viewingPass: setupValue(root, "viewing-pass"),
      focus: setupValue(root, "technique-focus"),
      ...momentValues,
      strongest: existing?.strongest ?? false,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };
  }

  function saveViewingDraft(root: HTMLElement) {
    const moments = readMoments(root);
    const moment = collectMoment(root, moments);
    const status = root.querySelector<HTMLElement>("[data-film-viewing-status]");
    if (!moment) {
      if (status) status.textContent = "Add a timestamp, observation, or analysis before saving the working card.";
      return;
    }
    const existingIndex = moments.findIndex((candidate) => candidate.id === moment.id);
    if (existingIndex >= 0) moments[existingIndex] = moment;
    else moments.unshift(moment);
    writeMoments(root, moments);
    clearViewingDraft(root);
    if (status) status.textContent = existingIndex >= 0 ? "Viewing moment updated." : "Viewing moment added to the working notebook.";
  }

  function editMoment(root: HTMLElement, id: string) {
    const moment = readMoments(root).find((candidate) => candidate.id === id);
    if (!moment) return;
    const fieldMap: Record<string, string> = {
      timestamp: moment.timestamp,
      technique: moment.technique,
      observation: moment.observation,
      "director-choice": moment.directorChoice,
      effect: moment.effect,
      theme: moment.theme,
      "analytical-use": moment.analyticalUse
    };
    for (const field of viewingDraftFields(root)) {
      const idValue = field.getAttribute("data-film-viewing-draft") ?? "";
      setFieldValue(field, fieldMap[idValue] ?? "");
    }
    const editing = root.querySelector<HTMLInputElement>("[data-film-viewing-editing-id]");
    if (editing) editing.value = moment.id;
    const button = root.querySelector<HTMLButtonElement>("[data-film-viewing-save-draft]");
    if (button) button.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">save</span> Update Viewing Moment';
    root.querySelector<HTMLElement>(".film-viewing-entry")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }

  function deleteWorkingMoment(root: HTMLElement, id: string) {
    const moments = readMoments(root).filter((moment) => moment.id !== id);
    writeMoments(root, moments);
    const status = root.querySelector<HTMLElement>("[data-film-viewing-status]");
    if (status) status.textContent = "Working card deleted. Any deliberately saved Evidence Bank copy remains available.";
  }

  function markStrongestMoment(root: HTMLElement, id: string) {
    const moments = readMoments(root).map((moment) => ({ ...moment, strongest: moment.id === id ? !moment.strongest : false, updatedAt: moment.id === id ? new Date().toISOString() : moment.updatedAt }));
    writeMoments(root, moments);
  }

  function evidenceApi(): EvidenceApi | undefined {
    return (browserWindow as unknown as { nextStepEvidenceBank?: EvidenceApi }).nextStepEvidenceBank;
  }

  function existingEvidence(contributionId: string) {
    const api = evidenceApi();
    if (!api) return undefined;
    try {
      return api.list().find((entry) => entry.contributionId === contributionId);
    } catch {
      return undefined;
    }
  }

  type EssayPreviewPayload = {
    foundation: Record<"topic" | "film-insight" | "thesis", string>;
    sections: Record<"introduction" | "body-one" | "body-two" | "body-three" | "conclusion", string[]>;
    responseIds: string[];
    startedSections: number;
    wordCount: number;
    compiledText: string;
  };

  const essayResponseFields = {
    "topic-interpretation": ["topic", "film-insight", "thesis"],
    introduction: ["opening", "context", "thesis-revision"],
    "body-one": ["claim", "scene-evidence", "analysis"],
    "body-two": ["claim", "scene-evidence", "analysis"],
    "body-three": ["claim", "scene-evidence", "analysis"],
    "conclusion-revision": ["synthesis", "significance", "structure-check", "language-check"]
  } as const;

  function essayPreviewControls(root: HTMLElement) {
    const namespace = root.getAttribute("data-film-essay-preview-namespace") || "english-unit";
    const prefix = `${namespace}:critical-essay:unit:`;
    const controls = Array.from(rootDocument.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[data-response-id]"));
    return new Map(controls
      .map((control) => [control.getAttribute("data-response-id") ?? "", control] as const)
      .filter(([responseId]) => responseId.startsWith(prefix)));
  }

  function buildEssayPreview(root: HTMLElement): EssayPreviewPayload {
    const namespace = root.getAttribute("data-film-essay-preview-namespace") || "english-unit";
    const controls = essayPreviewControls(root);
    const responseIds: string[] = [];
    const value = (stage: keyof typeof essayResponseFields, field: string) => {
      const responseId = `${namespace}:critical-essay:unit:${stage}:${field}`;
      responseIds.push(responseId);
      return String(controls.get(responseId)?.value ?? "").trim();
    };
    const topic = value("topic-interpretation", "topic");
    const filmInsight = value("topic-interpretation", "film-insight");
    const thesis = value("topic-interpretation", "thesis");
    const introduction = [
      value("introduction", "opening"),
      value("introduction", "context") || filmInsight,
      value("introduction", "thesis-revision") || thesis
    ].filter(Boolean);
    const bodyOne = [value("body-one", "claim"), value("body-one", "scene-evidence"), value("body-one", "analysis")].filter(Boolean);
    const bodyTwo = [value("body-two", "claim"), value("body-two", "scene-evidence"), value("body-two", "analysis")].filter(Boolean);
    const bodyThree = [value("body-three", "claim"), value("body-three", "scene-evidence"), value("body-three", "analysis")].filter(Boolean);
    const synthesis = value("conclusion-revision", "synthesis");
    const significance = value("conclusion-revision", "significance");
    const structureCheck = value("conclusion-revision", "structure-check");
    const completeConclusion = value("conclusion-revision", "language-check");
    const conclusion = (completeConclusion ? [completeConclusion] : [synthesis, significance, structureCheck]).filter(Boolean);
    const sections = { introduction, "body-one": bodyOne, "body-two": bodyTwo, "body-three": bodyThree, conclusion };
    const sectionLabels: Record<keyof typeof sections, string> = {
      introduction: "Introduction",
      "body-one": "Body Paragraph 1 - Beginning",
      "body-two": "Body Paragraph 2 - Middle",
      "body-three": "Body Paragraph 3 - End",
      conclusion: "Conclusion"
    };
    const foundation = { topic, "film-insight": filmInsight, thesis };
    const foundationLines = [
      topic ? `Assigned topic: ${topic}` : "",
      filmInsight ? `Film and character route: ${filmInsight}` : "",
      thesis ? `Working thesis: ${thesis}` : ""
    ].filter(Boolean);
    const sectionBlocks = (Object.keys(sections) as Array<keyof typeof sections>)
      .filter((sectionId) => sections[sectionId].length)
      .map((sectionId) => `${sectionLabels[sectionId]}\n\n${sections[sectionId].join("\n\n")}`);
    const compiledText = [foundationLines.length ? `Planning Foundation\n\n${foundationLines.join("\n")}` : "", ...sectionBlocks].filter(Boolean).join("\n\n");
    const allEssayText = Object.values(sections).flat().join(" ");
    return {
      foundation,
      sections,
      responseIds: Array.from(new Set(responseIds)),
      startedSections: Object.values(sections).filter((parts) => parts.length).length,
      wordCount: wordCount(allEssayText),
      compiledText
    };
  }

  function replacePreviewText(target: HTMLElement | null, parts: string[]) {
    if (!target) return;
    target.replaceChildren();
    const nonEmpty = parts.filter(Boolean);
    if (!nonEmpty.length) {
      const empty = textElement("p", "essay-preview-empty", target.getAttribute("data-film-essay-preview-empty") || "Complete the matching writing lesson to build this paragraph.");
      target.append(empty);
      return;
    }
    for (const part of nonEmpty) target.append(textElement("p", "", part));
  }

  function updateEssayPreview(root: HTMLElement) {
    const payload = buildEssayPreview(root);
    const foundationEmpty: Record<keyof EssayPreviewPayload["foundation"], string> = {
      topic: "Add the assigned topic in Topic and Interpretation.",
      "film-insight": "Add the film and character route in Topic and Interpretation.",
      thesis: "Add a working thesis in Topic and Interpretation."
    };
    (Object.keys(payload.foundation) as Array<keyof EssayPreviewPayload["foundation"]>).forEach((key) => {
      const target = root.querySelector<HTMLElement>(`[data-film-essay-preview-foundation="${key}"]`);
      if (target) target.textContent = payload.foundation[key] || foundationEmpty[key];
    });
    (Object.keys(payload.sections) as Array<keyof EssayPreviewPayload["sections"]>).forEach((sectionId) => {
      replacePreviewText(root.querySelector<HTMLElement>(`[data-film-essay-preview-section="${sectionId}"]`), payload.sections[sectionId]);
    });
    const wordCountNode = root.querySelector<HTMLElement>("[data-film-essay-preview-word-count]");
    if (wordCountNode) wordCountNode.textContent = `${payload.wordCount} ${payload.wordCount === 1 ? "word" : "words"}`;
    const status = root.querySelector<HTMLElement>("[data-film-essay-preview-status]");
    if (status) {
      status.textContent = payload.startedSections
        ? `${payload.startedSections} of 5 essay sections started | ${payload.wordCount} ${payload.wordCount === 1 ? "word" : "words"}`
        : "Your essay preview will appear here as you complete the Critical Essay writing lessons.";
    }
    const saveStatus = root.querySelector<HTMLElement>("[data-film-essay-preview-save-status]");
    if (saveStatus) {
      const projectSlug = root.getAttribute("data-film-essay-preview-namespace") || "english-unit";
      const savedPlan = existingEvidence(`${projectSlug}:critical-essay:full-plan`);
      saveStatus.textContent = savedPlan ? "A saved Evidence Bank copy exists. Save again to update it." : "";
    }
    return payload;
  }

  function updateEssayPreviews(responseId?: string) {
    for (const root of Array.from(rootDocument.querySelectorAll<HTMLElement>("[data-film-essay-preview]"))) {
      const namespace = root.getAttribute("data-film-essay-preview-namespace") || "english-unit";
      if (!responseId || responseId.startsWith(`${namespace}:critical-essay:unit:`)) updateEssayPreview(root);
    }
  }

  function saveEssayPreview(root: HTMLElement) {
    const payload = updateEssayPreview(root);
    const api = evidenceApi();
    const status = root.querySelector<HTMLElement>("[data-film-essay-preview-save-status]");
    if (!payload.startedSections) {
      if (status) status.textContent = "Complete at least one essay section before saving the full plan.";
      return;
    }
    if (!api) {
      if (status) status.textContent = "The Evidence Bank is not available in this preview.";
      return;
    }
    const projectSlug = root.getAttribute("data-film-essay-preview-namespace") || "english-unit";
    const contributionId = `${projectSlug}:critical-essay:full-plan`;
    const existing = existingEvidence(contributionId);
    const filmTitle = root.getAttribute("data-film-title") || "Feature Film";
    const now = new Date().toISOString();
    try {
      api.upsert({
        schemaVersion: 2,
        contributionId,
        responseId: contributionId,
        projectSlug,
        entryKind: "collection",
        source: `${filmTitle} | Critical Essay`,
        concept: "Critical Essay Preview",
        activity: { id: "critical-essay", profile: "film-study", title: "Critical Essay" },
        work: { id: slug(filmTitle), title: filmTitle, kind: "film" },
        prompt: `${payload.startedSections} of 5 essay sections saved from the Critical Essay lesson sequence.`,
        detail: payload.compiledText,
        connection: "",
        responseIds: payload.responseIds,
        tags: ["film-study", "critical-essay", "essay-preview"],
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        metadata: {
          startedSections: payload.startedSections,
          wordCount: payload.wordCount,
          foundation: payload.foundation
        }
      });
      if (status) status.textContent = existing ? "Full essay plan updated in Evidence Bank." : "Full essay plan saved to Evidence Bank.";
    } catch (error) {
      if (status) status.textContent = error instanceof Error ? error.message : "Evidence Bank save failed.";
    }
  }

  const personalResponseFields = {
    "prompt-impression": ["prompt", "initial-impression", "controlling-idea"],
    "film-evidence": ["moment", "creator-choice", "meaning"],
    "knowledge-experience": ["connection", "significance", "link-back"],
    "form-perspective": ["prose-form", "perspective", "audience-purpose"],
    "response-plan": ["opening", "development", "ending"],
    "draft-revise": ["complete-draft", "support-check", "voice-form-check"]
  } as const;

  type PersonalResponsePreviewPayload = {
    foundation: Record<"prompt" | "controlling-idea" | "form-perspective", string>;
    sections: Record<"draft" | "plan" | "revision", string[]>;
    responseIds: string[];
    startedStages: number;
    wordCount: number;
    compiledText: string;
  };

  function personalResponseControls(root: HTMLElement) {
    const namespace = root.getAttribute("data-film-personal-response-namespace") || "english-unit";
    const prefix = `${namespace}:personal-response:unit:`;
    const controls = Array.from(rootDocument.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[data-response-id]"));
    return new Map(controls
      .map((control) => [control.getAttribute("data-response-id") ?? "", control] as const)
      .filter(([responseId]) => responseId.startsWith(prefix)));
  }

  function buildPersonalResponsePreview(root: HTMLElement): PersonalResponsePreviewPayload {
    const namespace = root.getAttribute("data-film-personal-response-namespace") || "english-unit";
    const controls = personalResponseControls(root);
    const responseIds: string[] = [];
    const value = (stage: keyof typeof personalResponseFields, field: string) => {
      const responseId = `${namespace}:personal-response:unit:${stage}:${field}`;
      responseIds.push(responseId);
      return String(controls.get(responseId)?.value ?? "").trim();
    };
    const prompt = value("prompt-impression", "prompt");
    const initialImpression = value("prompt-impression", "initial-impression");
    const controllingIdea = value("prompt-impression", "controlling-idea");
    const filmMoment = value("film-evidence", "moment");
    const creatorChoice = value("film-evidence", "creator-choice");
    const evidenceMeaning = value("film-evidence", "meaning");
    const personalConnection = value("knowledge-experience", "connection");
    const connectionSignificance = value("knowledge-experience", "significance");
    const linkBack = value("knowledge-experience", "link-back");
    const proseForm = value("form-perspective", "prose-form");
    const perspective = value("form-perspective", "perspective");
    const audiencePurpose = value("form-perspective", "audience-purpose");
    const opening = value("response-plan", "opening");
    const development = value("response-plan", "development");
    const ending = value("response-plan", "ending");
    const completeDraft = value("draft-revise", "complete-draft");
    const supportCheck = value("draft-revise", "support-check");
    const voiceFormCheck = value("draft-revise", "voice-form-check");
    const formPerspective = [proseForm, perspective].filter(Boolean).join(" | ");
    const plan = [
      initialImpression ? `Initial impression\n${initialImpression}` : "",
      filmMoment ? `Film evidence\n${filmMoment}` : "",
      creatorChoice ? `Filmmaker's choice\n${creatorChoice}` : "",
      evidenceMeaning ? `Evidence meaning\n${evidenceMeaning}` : "",
      personalConnection ? `Knowledge or experience\n${personalConnection}` : "",
      connectionSignificance ? `Connection significance\n${connectionSignificance}` : "",
      linkBack ? `Link back to the film\n${linkBack}` : "",
      audiencePurpose ? `Audience, purpose, and voice\n${audiencePurpose}` : "",
      opening ? `Opening move\n${opening}` : "",
      development ? `Development sequence\n${development}` : "",
      ending ? `Ending insight\n${ending}` : ""
    ].filter(Boolean);
    const revision = [supportCheck, voiceFormCheck].filter(Boolean);
    const draft = completeDraft ? [completeDraft] : [opening, development, ending].filter(Boolean);
    const sections = { draft, plan, revision };
    const foundation = { prompt, "controlling-idea": controllingIdea, "form-perspective": formPerspective };
    const stageValues = [
      [prompt, initialImpression, controllingIdea],
      [filmMoment, creatorChoice, evidenceMeaning],
      [personalConnection, connectionSignificance, linkBack],
      [proseForm, perspective, audiencePurpose],
      [opening, development, ending],
      [completeDraft, supportCheck, voiceFormCheck]
    ];
    const startedStages = stageValues.filter((values) => values.some(Boolean)).length;
    const compiledText = [
      prompt ? `Course Prompt\n\n${prompt}` : "",
      controllingIdea ? `Controlling Idea\n\n${controllingIdea}` : "",
      formPerspective ? `Form and Perspective\n\n${formPerspective}` : "",
      draft.length ? `Personal Response Draft\n\n${draft.join("\n\n")}` : "",
      plan.length ? `Planning Notes\n\n${plan.join("\n\n")}` : "",
      revision.length ? `Revision Notes\n\n${revision.join("\n\n")}` : ""
    ].filter(Boolean).join("\n\n");
    return {
      foundation,
      sections,
      responseIds: Array.from(new Set(responseIds)),
      startedStages,
      wordCount: wordCount(draft.join(" ")),
      compiledText
    };
  }

  function updatePersonalResponsePreview(root: HTMLElement) {
    const payload = buildPersonalResponsePreview(root);
    const foundationEmpty: Record<keyof PersonalResponsePreviewPayload["foundation"], string> = {
      prompt: "Add the course prompt in Prompt and Initial Impression.",
      "controlling-idea": "Add a controlling idea in Prompt and Initial Impression.",
      "form-perspective": "Choose a prose form and perspective."
    };
    (Object.keys(payload.foundation) as Array<keyof PersonalResponsePreviewPayload["foundation"]>).forEach((key) => {
      const target = root.querySelector<HTMLElement>(`[data-film-personal-response-foundation="${key}"]`);
      if (target) target.textContent = payload.foundation[key] || foundationEmpty[key];
    });
    (Object.keys(payload.sections) as Array<keyof PersonalResponsePreviewPayload["sections"]>).forEach((sectionId) => {
      replacePreviewText(root.querySelector<HTMLElement>(`[data-film-personal-response-section="${sectionId}"]`), payload.sections[sectionId]);
    });
    const wordCountNode = root.querySelector<HTMLElement>("[data-film-personal-response-word-count]");
    if (wordCountNode) wordCountNode.textContent = `${payload.wordCount} ${payload.wordCount === 1 ? "word" : "words"}`;
    const status = root.querySelector<HTMLElement>("[data-film-personal-response-preview-status]");
    if (status) status.textContent = payload.startedStages
      ? `${payload.startedStages} of 6 writing lessons started | ${payload.wordCount} draft ${payload.wordCount === 1 ? "word" : "words"}`
      : "Your preview will appear here as you complete the Personal Response writing lessons.";
    const saveStatus = root.querySelector<HTMLElement>("[data-film-personal-response-save-status]");
    if (saveStatus) {
      const projectSlug = root.getAttribute("data-film-personal-response-namespace") || "english-unit";
      saveStatus.textContent = existingEvidence(`${projectSlug}:personal-response:full-plan`)
        ? "A saved Evidence Bank copy exists. Save again to update it."
        : "";
    }
    return payload;
  }

  function updatePersonalResponsePreviews(responseId?: string) {
    for (const root of Array.from(rootDocument.querySelectorAll<HTMLElement>("[data-film-personal-response-preview]"))) {
      const namespace = root.getAttribute("data-film-personal-response-namespace") || "english-unit";
      if (!responseId || responseId.startsWith(`${namespace}:personal-response:unit:`)) updatePersonalResponsePreview(root);
    }
  }

  function savePersonalResponsePreview(root: HTMLElement) {
    const payload = updatePersonalResponsePreview(root);
    const api = evidenceApi();
    const status = root.querySelector<HTMLElement>("[data-film-personal-response-save-status]");
    if (!payload.startedStages) {
      if (status) status.textContent = "Complete at least one Personal Response lesson before saving the full plan.";
      return;
    }
    if (!api) {
      if (status) status.textContent = "The Evidence Bank is not available in this preview.";
      return;
    }
    const projectSlug = root.getAttribute("data-film-personal-response-namespace") || "english-unit";
    const contributionId = `${projectSlug}:personal-response:full-plan`;
    const existing = existingEvidence(contributionId);
    const filmTitle = root.getAttribute("data-film-title") || "Feature Film";
    const now = new Date().toISOString();
    try {
      api.upsert({
        schemaVersion: 2,
        contributionId,
        responseId: contributionId,
        projectSlug,
        entryKind: "collection",
        source: `${filmTitle} | Personal Response`,
        concept: "Personal Response Preview",
        activity: { id: "personal-response", profile: "film-study", title: "Personal Response" },
        work: { id: slug(filmTitle), title: filmTitle, kind: "film" },
        prompt: `${payload.startedStages} of 6 Personal Response writing lessons saved.`,
        detail: payload.compiledText,
        connection: payload.foundation["controlling-idea"],
        responseIds: payload.responseIds,
        tags: ["film-study", "personal-response", "writing-plan"],
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        metadata: { startedStages: payload.startedStages, wordCount: payload.wordCount, foundation: payload.foundation }
      });
      if (status) status.textContent = existing ? "Full Personal Response plan updated in Evidence Bank." : "Full Personal Response plan saved to Evidence Bank.";
    } catch (error) {
      if (status) status.textContent = error instanceof Error ? error.message : "Evidence Bank save failed.";
    }
  }

  function slug(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "selected-film";
  }

  function saveMomentToEvidenceBank(root: HTMLElement, id: string, statusNode?: HTMLElement) {
    const moment = readMoments(root).find((candidate) => candidate.id === id);
    const api = evidenceApi();
    if (!moment || !api) {
      if (statusNode) statusNode.textContent = "The Evidence Bank is not available in this preview.";
      return;
    }
    const projectSlug = root.getAttribute("data-film-project-slug") || "english-unit";
    const contributionId = `${projectSlug}:viewing-guide:${moment.id}`;
    const existing = existingEvidence(contributionId);
    const now = new Date().toISOString();
    const analysis = [
      moment.directorChoice ? `Director's choice: ${moment.directorChoice}` : "",
      moment.effect ? `Effect: ${moment.effect}` : "",
      moment.theme ? `Connection: ${moment.theme}` : "",
      moment.analyticalUse ? `Analytical use: ${moment.analyticalUse}` : ""
    ].filter(Boolean).join("\n\n");
    try {
      api.upsert({
        schemaVersion: 2,
        contributionId,
        projectSlug,
        entryKind: "individual",
        source: { kind: "activity", id: "viewing-guide", title: "Viewing Guide" },
        activity: { id: "viewing-guide", profile: "film-study", title: "Viewing Guide" },
        work: { id: slug(moment.filmTitle), title: moment.filmTitle || "Feature Film", kind: "film" },
        locator: moment.timestamp ? { label: moment.timestamp, timestamp: moment.timestamp } : undefined,
        prompt: moment.technique ? `Analyze the use of ${moment.technique}.` : "Analyze this viewing moment.",
        evidence: moment.observation,
        answer: moment.directorChoice,
        analysis,
        responseIds: [root.querySelector<HTMLTextAreaElement>("[data-film-viewing-store]")?.getAttribute("data-response-id") ?? ""].filter(Boolean),
        tags: ["film-study", "viewing-guide", moment.technique, moment.focus, moment.strongest ? "strongest" : ""].filter(Boolean),
        createdAt: existing?.createdAt ?? moment.createdAt ?? now,
        updatedAt: now,
        metadata: {
          viewingPass: moment.viewingPass,
          focus: moment.focus,
          strongest: moment.strongest,
          directorChoice: moment.directorChoice,
          analyticalUse: moment.analyticalUse
        }
      });
      if (statusNode) statusNode.textContent = existing ? "Evidence Bank entry updated." : "Saved to Evidence Bank.";
      renderMoments(root);
    } catch (error) {
      if (statusNode) statusNode.textContent = error instanceof Error ? error.message : "Evidence Bank save failed.";
    }
  }

  function textElement<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text: string) {
    const element = rootDocument.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
  }

  function appendDefinition(list: HTMLDListElement, term: string, detail: string) {
    if (!detail) return;
    const wrapper = rootDocument.createElement("div");
    wrapper.append(textElement("dt", "", term), textElement("dd", "", detail));
    list.append(wrapper);
  }

  function actionButton(label: string, action: string, id: string, className = "") {
    const button = rootDocument.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.setAttribute(action, id);
    return button;
  }

  function renderMoments(root: HTMLElement) {
    const list = root.querySelector<HTMLElement>("[data-film-viewing-list]");
    if (!list) return;
    const technique = root.querySelector<HTMLSelectElement>("[data-film-viewing-filter-technique]")?.value ?? "";
    const strongestOnly = root.querySelector<HTMLInputElement>("[data-film-viewing-filter-strongest]")?.checked ?? false;
    const allMoments = readMoments(root);
    const moments = allMoments.filter((moment) => (!technique || moment.technique === technique) && (!strongestOnly || moment.strongest));
    list.replaceChildren();
    if (!moments.length) {
      list.append(textElement("p", "film-empty-state", allMoments.length ? "No viewing moments match the active filters." : "No viewing moments saved yet."));
    }
    for (const moment of moments) {
      const contributionId = `${root.getAttribute("data-film-project-slug") || "english-unit"}:viewing-guide:${moment.id}`;
      const centralCopy = Boolean(existingEvidence(contributionId));
      const card = rootDocument.createElement("article");
      card.className = `film-viewing-card${moment.strongest ? " is-strongest" : ""}`;
      card.setAttribute("data-film-viewing-card", moment.id);
      const header = rootDocument.createElement("header");
      const heading = rootDocument.createElement("div");
      heading.append(textElement("h4", "", moment.timestamp || "Untimed viewing moment"), textElement("p", "", [moment.technique, moment.viewingPass].filter(Boolean).join(" | ") || "Film evidence"));
      header.append(heading, textElement("span", "film-media-status", moment.strongest ? "Strongest moment" : "Working card"));
      const definitions = rootDocument.createElement("dl");
      appendDefinition(definitions, "Observation", moment.observation);
      appendDefinition(definitions, "Director's choice", moment.directorChoice);
      appendDefinition(definitions, "Effect", moment.effect);
      appendDefinition(definitions, "Theme or character connection", moment.theme);
      appendDefinition(definitions, "Analytical use", moment.analyticalUse);
      const actions = rootDocument.createElement("div");
      actions.className = "film-card-actions";
      actions.append(
        actionButton("Edit", "data-film-viewing-edit", moment.id),
        actionButton(moment.strongest ? "Remove Strongest Mark" : "Mark as Strongest", "data-film-viewing-strongest", moment.id),
        actionButton("Delete Working Card", "data-film-viewing-delete", moment.id),
        actionButton(centralCopy ? "Update Evidence Bank" : "Save to Evidence Bank", "data-film-viewing-evidence-save", moment.id, "evidence-bank-save-action")
      );
      const saveStatus = textElement("span", "film-card-save-status", centralCopy ? "A deliberate Evidence Bank copy exists for this card." : "Not yet added to the central Evidence Bank.");
      saveStatus.setAttribute("data-film-card-save-status", moment.id);
      card.append(header, definitions, actions, saveStatus);
      list.append(card);
    }
    const status = root.querySelector<HTMLElement>("[data-film-viewing-status]");
    if (status && !status.textContent?.includes("deleted") && !status.textContent?.includes("updated") && !status.textContent?.includes("added")) {
      const strongestCount = allMoments.filter((moment) => moment.strongest).length;
      status.textContent = `${allMoments.length} viewing ${allMoments.length === 1 ? "moment" : "moments"} saved locally${strongestCount ? " | strongest moment selected" : ""}.`;
    }
  }

  function syncFilmRoom(root: HTMLElement, id: string) {
    const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-film-room-panel]"));
    const selected = panels.some((panel) => panel.getAttribute("data-film-room-panel") === id)
      ? id
      : panels[0]?.getAttribute("data-film-room-panel") ?? "";
    for (const panel of panels) panel.hidden = panel.getAttribute("data-film-room-panel") !== selected;
    for (const button of Array.from(root.querySelectorAll<HTMLButtonElement>("[data-film-room-select]"))) {
      const active = button.getAttribute("data-film-room-select") === selected;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    }
    const select = root.querySelector<HTMLSelectElement>("[data-film-room-select-menu]");
    if (select && select.value !== selected) select.value = selected;
  }

  function syncFilmResources(root: HTMLElement, id: string) {
    const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-film-resource-panel]"));
    const selected = panels.some((panel) => panel.getAttribute("data-film-resource-panel") === id)
      ? id
      : panels[0]?.getAttribute("data-film-resource-panel") ?? "";
    for (const panel of panels) panel.hidden = panel.getAttribute("data-film-resource-panel") !== selected;
    const select = root.querySelector<HTMLSelectElement>("[data-film-resource-select-menu]");
    if (select && select.value !== selected) select.value = selected;
  }

  function init() {
    for (const select of Array.from(rootDocument.querySelectorAll<HTMLSelectElement>("[data-film-profile-select]"))) syncPanelSelect(select);
    for (const control of Array.from(rootDocument.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[data-film-field] [data-response-id]"))) updateField(control);
    for (const progress of Array.from(rootDocument.querySelectorAll<HTMLElement>("[data-film-progress]"))) updateProgress(progress);
    for (const viewingGuide of Array.from(rootDocument.querySelectorAll<HTMLElement>("[data-film-viewing-guide]"))) renderMoments(viewingGuide);
    for (const filmRoom of Array.from(rootDocument.querySelectorAll<HTMLElement>("[data-film-room]"))) syncFilmRoom(filmRoom, filmRoom.querySelector<HTMLElement>("[data-film-room-panel]")?.getAttribute("data-film-room-panel") ?? "");
    for (const resources of Array.from(rootDocument.querySelectorAll<HTMLElement>("[data-film-resources]"))) syncFilmResources(resources, resources.querySelector<HTMLElement>("[data-film-resource-panel]")?.getAttribute("data-film-resource-panel") ?? "");
    updateEssayPreviews();
    updatePersonalResponsePreviews();
  }

  rootDocument.addEventListener("input", (event) => {
    const control = event.target;
    if (control instanceof browserWindow.HTMLInputElement || control instanceof browserWindow.HTMLTextAreaElement || control instanceof browserWindow.HTMLSelectElement) {
      if (control.closest("[data-film-field]")) updateField(control);
      updateEssayPreviews(control.getAttribute("data-response-id") ?? undefined);
      updatePersonalResponsePreviews(control.getAttribute("data-response-id") ?? undefined);
    }
  });

  rootDocument.addEventListener("change", (event) => {
    const target = event.target;
    if (target instanceof browserWindow.HTMLSelectElement && target.matches("[data-film-profile-select]")) syncPanelSelect(target);
    if (target instanceof browserWindow.HTMLSelectElement && target.matches("[data-film-room-select-menu]")) {
      const room = target.closest<HTMLElement>("[data-film-room]");
      if (room) syncFilmRoom(room, target.value);
    }
    if (target instanceof browserWindow.HTMLSelectElement && target.matches("[data-film-resource-select-menu]")) {
      const resources = target.closest<HTMLElement>("[data-film-resources]");
      if (resources) syncFilmResources(resources, target.value);
    }
    if (target instanceof browserWindow.HTMLInputElement || target instanceof browserWindow.HTMLTextAreaElement || target instanceof browserWindow.HTMLSelectElement) {
      updateEssayPreviews(target.getAttribute("data-response-id") ?? undefined);
      updatePersonalResponsePreviews(target.getAttribute("data-response-id") ?? undefined);
    }
    const viewingRoot = target instanceof browserWindow.Element ? target.closest<HTMLElement>("[data-film-viewing-guide]") : null;
    if (viewingRoot && target instanceof browserWindow.Element && (target.matches("[data-film-viewing-filter-technique]") || target.matches("[data-film-viewing-filter-strongest]"))) renderMoments(viewingRoot);
  });

  rootDocument.addEventListener("click", (event) => {
    const target = event.target instanceof browserWindow.Element ? event.target : null;
    if (!target) return;
    const panelButton = target.closest<HTMLElement>("[data-film-profile-select-button]");
    if (panelButton) {
      const page = panelButton.closest(".film-study-profile-page");
      const group = panelButton.getAttribute("data-film-profile-select-button") ?? "";
      const value = panelButton.getAttribute("data-film-profile-select-value") ?? "";
      const select = page ? Array.from(page.querySelectorAll<HTMLSelectElement>("[data-film-profile-select]")).find((candidate) => candidate.getAttribute("data-film-profile-select") === group) : undefined;
      if (select) {
        select.value = value;
        select.dispatchEvent(new browserWindow.Event("change", { bubbles: true }));
      } else if (page) setPanelGroup(page, group, value);
      return;
    }
    const roomButton = target.closest<HTMLElement>("[data-film-room-select]");
    if (roomButton) {
      const room = roomButton.closest<HTMLElement>("[data-film-room]");
      if (room) syncFilmRoom(room, roomButton.getAttribute("data-film-room-select") ?? "");
      return;
    }
    const essayPreviewSave = target.closest<HTMLElement>("[data-film-save-essay-preview]");
    if (essayPreviewSave) {
      const preview = essayPreviewSave.closest<HTMLElement>("[data-film-essay-preview]");
      if (preview) saveEssayPreview(preview);
      return;
    }
    const personalResponsePreviewSave = target.closest<HTMLElement>("[data-film-save-personal-response-preview]");
    if (personalResponsePreviewSave) {
      const preview = personalResponsePreviewSave.closest<HTMLElement>("[data-film-personal-response-preview]");
      if (preview) savePersonalResponsePreview(preview);
      return;
    }
    const viewingRoot = target.closest<HTMLElement>("[data-film-viewing-guide]");
    if (!viewingRoot) return;
    if (target.closest("[data-film-viewing-save-draft]")) {
      saveViewingDraft(viewingRoot);
      return;
    }
    if (target.closest("[data-film-viewing-clear-draft]")) {
      clearViewingDraft(viewingRoot);
      return;
    }
    const editButton = target.closest<HTMLElement>("[data-film-viewing-edit]");
    if (editButton) {
      editMoment(viewingRoot, editButton.getAttribute("data-film-viewing-edit") ?? "");
      return;
    }
    const strongestButton = target.closest<HTMLElement>("[data-film-viewing-strongest]");
    if (strongestButton) {
      markStrongestMoment(viewingRoot, strongestButton.getAttribute("data-film-viewing-strongest") ?? "");
      return;
    }
    const deleteButton = target.closest<HTMLElement>("[data-film-viewing-delete]");
    if (deleteButton) {
      deleteWorkingMoment(viewingRoot, deleteButton.getAttribute("data-film-viewing-delete") ?? "");
      return;
    }
    const evidenceButton = target.closest<HTMLElement>("[data-film-viewing-evidence-save]");
    if (evidenceButton) {
      const id = evidenceButton.getAttribute("data-film-viewing-evidence-save") ?? "";
      const status = evidenceButton.closest<HTMLElement>("[data-film-viewing-card]")?.querySelector<HTMLElement>("[data-film-card-save-status]");
      saveMomentToEvidenceBank(viewingRoot, id, status ?? undefined);
    }
  });

  browserWindow.addEventListener("hashchange", () => {
    updateEssayPreviews();
    updatePersonalResponsePreviews();
  });

  if (rootDocument.readyState === "loading") rootDocument.addEventListener("DOMContentLoaded", () => {
    init();
    browserWindow.setTimeout(init, 0);
  }, { once: true });
  else {
    init();
    browserWindow.setTimeout(init, 0);
  }
}

// tsx/esbuild may annotate nested functions in Function#toString output with its
// private __name helper. Keep that helper local to this fragment so generated
// learner HTML never depends on a bundler global.
export const FILM_STUDY_PROFILE_RUNTIME = `(function(){const __name=function(target){return target;};(${installFilmStudyProfileRuntime.toString()})(document);})();`;
