import { renderNextStepCourseShell, type NextStepShellLesson } from "../next-step-course-shell.js";
import { ENGLISH_ACTIVITY_PROFILE_CSS, ENGLISH_ACTIVITY_PROFILE_RUNTIME } from "./activity-profile-runtime.js";
import { renderEnglishWritingSequences } from "./writing-sequence-renderer.js";
import { ENGLISH_LITERARY_TERMS_SECTIONS, renderEnglishLiteraryTermsReference } from "./literary-terms.js";
import { safeId } from "./source.js";
import type {
  EnglishBuiltLesson,
  EnglishBuiltReading,
  EnglishPlacement,
  EnglishQuestionPrompt,
  EnglishUnitRecipeV1
} from "./types.js";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function scriptJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function truncate(value: string, length = 170) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length <= length ? clean : `${clean.slice(0, length - 1).trim()}...`;
}

function elementReviewSummary(lesson: EnglishBuiltLesson) {
  const clean = lesson.text.replace(/\s+/g, " ").trim();
  const completeSentence = clean.match(/^.{20,320}?[.!?](?=\s|$)/)?.[0];
  return completeSentence ?? `Review the definitions, examples, and practice for ${cleanLessonTitle(lesson.title)}.`;
}

function cleanLessonTitle(title: string) {
  return title.replace(/^Lesson\s+\d+:\s*/i, "");
}

function responseId(readingId: string, questionId: string) {
  return `english-question:${readingId}:${questionId}`;
}

function findQuestion(readings: EnglishBuiltReading[], reference: string) {
  const separator = reference.lastIndexOf(":");
  const readingId = reference.slice(0, separator);
  const questionId = reference.slice(separator + 1);
  const reading = readings.find((candidate) => candidate.id === readingId);
  const question = reading?.questions.find((candidate) => candidate.id === questionId);
  return reading && question ? { reading, question } : null;
}

function renderReadingLinks(readingIds: string[], readings: EnglishBuiltReading[]) {
  const items = readingIds
    .map((readingId) => readings.find((reading) => reading.id === readingId))
    .filter((reading): reading is EnglishBuiltReading => Boolean(reading));
  if (!items.length) return "";
  return `<div class="lesson-reading-links">
    <strong>Use these unit texts</strong>
    <div>${items
      .map(
        (reading) =>
          `<a href="#story-bank" data-page-target="story-bank" data-open-reading="${escapeHtml(reading.id)}">${escapeHtml(reading.title)}</a>`
      )
      .join("")}</div>
  </div>`;
}

function renderQuestionFields(references: string[], readings: EnglishBuiltReading[]) {
  const questions = references.map((reference) => findQuestion(readings, reference)).filter((value): value is NonNullable<typeof value> => Boolean(value));
  if (!questions.length) return "";
  return `<div class="lesson-question-set">
    <h3>Apply the lesson</h3>
    ${questions
      .map(
        ({ reading, question }) => `<label class="question-field">
          <span><strong>${escapeHtml(reading.title)}</strong> - ${escapeHtml(question.prompt)}</span>
          <textarea rows="5" data-response-id="${escapeHtml(responseId(reading.id, question.id))}" placeholder="Use specific evidence from the text."></textarea>
        </label>`
      )
      .join("")}
  </div>`;
}

function renderPlacement(placement: EnglishPlacement | undefined, readings: EnglishBuiltReading[]) {
  if (!placement) return "";
  return `<aside class="lesson-application" aria-label="Unit-text application">
    <h3>Connect this lesson to the unit</h3>
    <p>${escapeHtml(placement.purpose)}</p>
    ${renderReadingLinks(placement.readingIds, readings)}
    ${renderQuestionFields(placement.questionRefs, readings)}
  </aside>`;
}

function renderLiteraryTermsEvidenceCapture(readings: EnglishBuiltReading[]) {
  const responseBase = "evidence-draft:literary-terms";
  return `<section class="english-evidence-capture literary-terms-evidence-capture" data-writing-activity-panel data-evidence-notebook-panel data-evidence-capture="literary-terms" aria-labelledby="literary-terms-evidence-title">
    <div class="english-evidence-capture-heading">
      <div>
        <p>Literary Terms Evidence Builder</p>
        <h3 id="literary-terms-evidence-title">Connect a literary term to a unit text</h3>
        <span>Choose a text and term, capture a precise example, and explain how the writer's choice develops meaning.</span>
      </div>
      <span class="material-symbols-outlined" aria-hidden="true">library_add</span>
    </div>
    <div class="english-evidence-fields">
      <label>Source text
        <select data-response-id="${responseBase}:source" data-evidence-draft="source">
          ${readings.map((reading) => `<option value="${escapeHtml(reading.id)}">${escapeHtml(reading.title)} | Literary Terms</option>`).join("")}
        </select>
      </label>
      <label>Literary term
        <select data-response-id="${responseBase}:concept" data-evidence-draft="concept">
          ${ENGLISH_LITERARY_TERMS_SECTIONS.map(
            (section) => `<optgroup label="${escapeHtml(section.title)}">${section.terms
              .map((term) => `<option value="${escapeHtml(safeId(term.term))}" data-literary-term-option>${escapeHtml(term.term)}</option>`)
              .join("")}</optgroup>`
          ).join("")}
        </select>
      </label>
    </div>
    <label>Exact quotation or textual detail
      <textarea rows="4" data-response-id="${responseBase}:detail" data-evidence-draft="detail" placeholder="Record the exact words, action, image, or structural choice that demonstrates the term."></textarea>
    </label>
    <label>How the literary term develops meaning
      <textarea rows="4" data-response-id="${responseBase}:connection" data-evidence-draft="connection" placeholder="Explain how the example works and what it reveals about character, conflict, mood, perspective, or theme."></textarea>
    </label>
    <div class="english-evidence-actions">
      <button class="external-resource-action evidence-bank-save-action" type="button" data-save-evidence-note><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save to Evidence Bank</button>
      <a class="english-evidence-link" href="#story-bank" data-page-target="story-bank">Open Short Story Bank</a>
      <a class="english-evidence-link" href="#evidence-bank" data-page-target="evidence-bank">Open Evidence Bank</a>
      <span class="english-evidence-save-status" data-save-status>Draft saves automatically</span>
    </div>
  </section>`;
}

function renderLessonSourceLinks(lesson: EnglishBuiltLesson) {
  if (!lesson.supportingResources.length) return "";
  return `<section class="lesson-source-links--ela30">
    <h3>Source Links</h3>
    <ul>${lesson.supportingResources
      .map(
        (resource) =>
          `<li><a class="source-link" href="${escapeHtml(resource.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(resource.title)}</a></li>`
      )
      .join("")}</ul>
  </section>`;
}

function renderReadingRoadmap(readings: EnglishBuiltReading[]) {
  const groups = new Map<string, EnglishBuiltReading[]>();
  for (const reading of readings) groups.set(reading.group, [...(groups.get(reading.group) ?? []), reading]);
  return `<section class="reading-roadmap">
    <h2>Unit reading roadmap</h2>
    <p>These lessons teach the concepts. The assigned texts are where you will apply them.</p>
    <div class="roadmap-groups">${[...groups.entries()]
      .map(
        ([group, items]) => `<section>
          <h3>${escapeHtml(group)}</h3>
          <ul>${items.map((reading) => `<li><strong>${escapeHtml(reading.title)}</strong><span>${escapeHtml(reading.author)}</span></li>`).join("")}</ul>
        </section>`
      )
      .join("")}</div>
  </section>`;
}

function renderElementsHub(input: {
  hub: EnglishBuiltLesson;
  children: EnglishBuiltLesson[];
  recipe: EnglishUnitRecipeV1;
  readings: EnglishBuiltReading[];
}) {
  const workbenchLessons = input.recipe.fictionElementsHub.childLessons
    .map((title) => input.children.find((lesson) => lesson.title === title))
    .filter((lesson): lesson is EnglishBuiltLesson => Boolean(lesson));
  return `<section class="elements-workbench elements-checklist" data-elements-checklist aria-labelledby="elements-checklist-title">
      <div class="elements-checklist-header">
        <h3 id="elements-checklist-title">Elements of Fiction Checklist</h3>
        <p data-elements-complete-summary>0/${workbenchLessons.length} elements complete</p>
      </div>
      <table class="elements-table">
        <thead><tr><th scope="col">Done</th><th scope="col">Element</th><th scope="col">What to review</th></tr></thead>
        <tbody>${workbenchLessons
          .map(
            (lesson, index) => `<tr>
              <td><button class="element-check" type="button" data-element-complete-for="${escapeHtml(lesson.id)}" data-complete-id="${escapeHtml(lesson.id)}" data-complete-label="Mark complete" aria-label="Mark ${escapeHtml(cleanLessonTitle(lesson.title))} complete">-</button></td>
              <td><button class="element-selector" type="button" aria-selected="${index === 0 ? "true" : "false"}" data-element-target="${escapeHtml(lesson.id)}"><span>${escapeHtml(cleanLessonTitle(lesson.title))}</span><span class="element-selector-action">Review</span></button></td>
              <td>${escapeHtml(elementReviewSummary(lesson))}</td>
            </tr>`
          )
          .join("")}</tbody>
      </table>
      <div class="element-panels">
        ${workbenchLessons
          .map((lesson, index) => {
            const placement = input.recipe.placements.find((candidate) => candidate.targetLesson === lesson.title);
            return `<article class="element-panel" tabindex="-1" data-element-panel="${escapeHtml(lesson.id)}"${index === 0 ? "" : " hidden"}>
              <h3>${escapeHtml(cleanLessonTitle(lesson.title))}</h3>
              <div class="source-content">${lesson.html}</div>
              ${renderPlacement(placement, input.readings)}
            </article>`;
          })
          .join("")}
      </div>
    </section>`;
}

function buildShellLessons(input: {
  recipe: EnglishUnitRecipeV1;
  lessons: EnglishBuiltLesson[];
  readings: EnglishBuiltReading[];
}) {
  const lessonByTitle = new Map(input.lessons.map((lesson) => [lesson.title, lesson]));
  const childLessons = input.recipe.fictionElementsHub.childLessons
    .map((title) => lessonByTitle.get(title))
    .filter((lesson): lesson is EnglishBuiltLesson => Boolean(lesson));
  return input.recipe.topLevelLessonOrder
    .map((title) => lessonByTitle.get(title))
    .filter((lesson): lesson is EnglishBuiltLesson => Boolean(lesson))
    .map((lesson, index) => {
      const placement = input.recipe.placements.find((candidate) => candidate.targetLesson === lesson.title);
      const isHub = lesson.title === input.recipe.fictionElementsHub.hubLesson;
      const isIntroduction = lesson.title === input.recipe.lessonOrder[0];
      const isLiteraryTerms = /Literary Terms/i.test(lesson.title);
      const sourceTitle = isIntroduction
        ? "Short Stories Introduction"
        : isHub
          ? "Elements of Fiction"
          : cleanLessonTitle(lesson.title);
      const sourceExtension = isHub
        ? renderElementsHub({ hub: lesson, children: childLessons, recipe: input.recipe, readings: input.readings })
        : "";
      const lessonContent = isLiteraryTerms
        ? `${lesson.html}${renderEnglishLiteraryTermsReference()}`
        : lesson.html;
      const body = `<div class="source-content"><div class="source-lesson-header"><h1>${escapeHtml(sourceTitle)}</h1></div>${lessonContent}${sourceExtension}</div>
        ${renderLessonSourceLinks(lesson)}
        ${isIntroduction ? renderReadingRoadmap(input.readings) : ""}
        ${isHub ? "" : isLiteraryTerms ? renderLiteraryTermsEvidenceCapture(input.readings) : renderPlacement(placement, input.readings)}`;
      return {
        id: lesson.id,
        title: cleanLessonTitle(lesson.title),
        pageTitle: isIntroduction ? lesson.title : `Lesson ${index + 1}: ${cleanLessonTitle(lesson.title)}`,
        summary: truncate(lesson.text),
        html: body,
        unitGroup: "Unit 1: Short Stories",
        group: index <= 2 ? "Start Here" : "Reading and Writing"
      } satisfies NextStepShellLesson;
    });
}

function renderTextBank(courseCode: string, readings: EnglishBuiltReading[]) {
  return `<section id="story-bank" class="course-page" hidden>
    <p class="route-kicker">${escapeHtml(courseCode)} | Short Story Bank</p>
    <h2 class="route-title">Short Story Bank</h2>
    <div class="library-browser story-bank-browser" data-library-doc-scope>
      <aside class="library-list-panel">
        <h3>Stories</h3>
        <p>Select a text to read, download, or open in a full browser view.</p>
        <div class="library-doc-list">
          ${readings
            .map(
              (reading, index) => `<button class="library-doc-tab${index === 0 ? " active" : ""}" type="button" data-library-doc-target="${escapeHtml(reading.id)}" aria-pressed="${index === 0 ? "true" : "false"}">
                <span class="library-doc-index">${index + 1}</span>
                <span><strong>${escapeHtml(reading.title)}</strong><small>${escapeHtml(reading.group)}</small></span>
              </button>`
            )
            .join("")}
        </div>
      </aside>
      <div class="library-reader-panel">
        ${readings
          .map(
            (reading, index) => `<section data-library-doc-panel="${escapeHtml(reading.id)}"${index === 0 ? "" : " hidden"}>
              <div class="library-reader-header">
                <div><h3>${escapeHtml(reading.title)}</h3><p>${escapeHtml(reading.author)} | ${escapeHtml(reading.group)}</p></div>
                <div class="library-actions">
                  <a href="${escapeHtml(reading.readingHref)}" target="_blank" rel="noopener noreferrer">Open</a>
                  <button type="button" data-reader-fullscreen="${escapeHtml(reading.readingHref)}" data-reader-title="${escapeHtml(reading.title)}">Full Screen</button>
                  <a href="${escapeHtml(reading.readingHref)}" download>Download</a>
                </div>
              </div>
              <iframe class="library-document-frame" src="${escapeHtml(reading.readingHref)}" title="${escapeHtml(reading.title)}"></iframe>
            </section>`
          )
          .join("")}
      </div>
    </div>
  </section>`;
}

function buildQuestionHint(prompt: string) {
  const normalized = prompt.toLowerCase();
  if (/foreshadow|personif|metaphor|imagery|symbol|simile|irony|literary device/.test(normalized)) {
    return "Locate one exact word, image, or moment first. Name the device, explain what it means in context, and then connect its effect to character, conflict, mood, or theme.";
  }
  if (/page|panel|frame|gutter|shot|visual|image|colour|color|light|shadow/.test(normalized)) {
    return "Use precise visual evidence: identify the panel, framing, expression, object, light, shadow, or layout choice, then explain how it shapes the reader's interpretation.";
  }
  if (/compare|contrast|similar|difference|both texts|articles/.test(normalized)) {
    return "Establish a clear basis for comparison. Use one specific piece of evidence from each perspective, then explain why the similarity or difference matters.";
  }
  if (/argue|claim|position|correct|agree|disagree|perspective|opinion|responsible|what do you think|who do you think/.test(normalized)) {
    return "State each position fairly before judging it. Identify the strongest evidence or reasoning on both sides, then defend your conclusion with a clear because statement.";
  }
  if (/character|motivation|trait|quality|change|relationship|protagonist|antagonist/.test(normalized)) {
    return "Trace what the character says, does, avoids, or chooses under pressure. Name the quality or motivation those details reveal and explain its effect on the story.";
  }
  if (/setting|tone|mood|diction|theme|central idea/.test(normalized)) {
    return "Choose two precise details from the text. Explain the effect of each detail, then connect the pattern to the larger idea the text develops.";
  }
  return "Return to the exact part of the text named in the question. Make a direct claim, support it with a specific detail, and explain how that evidence proves your point.";
}

function renderQuestion(reading: EnglishBuiltReading, question: EnglishQuestionPrompt) {
  const id = responseId(reading.id, question.id);
  return `<div class="worksheet-question" data-evidence-question-number="${escapeHtml(question.id)}" data-evidence-question-prompt="${escapeHtml(question.prompt)}">
    <div class="worksheet-question-prompt"><strong>${escapeHtml(question.id)}.</strong><span>${escapeHtml(question.prompt)}</span></div>
    <div class="worksheet-hint" data-question-hint hidden><strong>Hint:</strong> ${escapeHtml(buildQuestionHint(question.prompt))}</div>
    <label class="worksheet-answer-field">
      <textarea rows="5" data-response-id="${escapeHtml(id)}" placeholder="Type your analytical response here..."></textarea>
      <span class="worksheet-word-count">0 words</span>
    </label>
  </div>`;
}

function renderQuestionBank(courseCode: string, readings: EnglishBuiltReading[]) {
  return `<section id="story-questions" class="course-page" hidden data-study-topic-scope>
    <p class="route-kicker">${escapeHtml(courseCode)} | Short Story Questions</p>
    <h2 class="route-title">Short Story Questions</h2>
    <p class="route-description">Choose a text to open its guided response questions and evidence prompts. Answers save automatically and remain shared with lesson activities.</p>
    <section class="story-question-selector">
      <label for="question-bank-select">Choose a text
        <select id="question-bank-select" data-study-topic-select="question-bank">
          ${readings.map((reading, index) => `<option value="${escapeHtml(reading.id)}"${index === 0 ? " selected" : ""}>${escapeHtml(reading.title)}</option>`).join("")}
        </select>
      </label>
    </section>
    ${readings
      .map(
        (reading, index) => `<section class="question-panel" data-question-panel data-response-collection data-evidence-collection-id="english-question-collection:${escapeHtml(reading.id)}" data-evidence-response-prefix="english-question:${escapeHtml(reading.id)}:" data-evidence-source="${escapeHtml(reading.title)} | Short Story Questions" data-evidence-concept="${escapeHtml(reading.title)} Question Collection" data-study-topic-panel="question-bank" data-study-topic-id="${escapeHtml(reading.id)}"${index === 0 ? "" : " hidden"}>
          <div class="worksheet-toolbar">
            <span class="worksheet-save-status">
              <span data-question-save-status>Answers save automatically</span>
              <span data-response-collection-status aria-live="polite"></span>
            </span>
            <div class="worksheet-toolbar-actions">
              <button type="button" data-worksheet-toggle-hints aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> Show Hints</button>
              <button class="evidence-bank-save-action" type="button" data-save-response-collection><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save Story Answers to Evidence Bank</button>
              <button type="button" data-print-questions><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
            </div>
          </div>
          <article class="worksheet-document">
            <header class="worksheet-document-header short-story-dark-header">
              <p>${escapeHtml(courseCode)} Guided Analysis</p>
              <h3>&quot;${escapeHtml(reading.title)}&quot;</h3>
              <span>by ${escapeHtml(reading.author)}</span>
              <div class="worksheet-progress">
                <div><span>Formative Progress</span><strong data-question-progress-label>0 of ${reading.questions.length} answered</strong></div>
                <div class="worksheet-progress-track"><div data-question-progress-fill></div></div>
              </div>
            </header>
            <div class="worksheet-questions">
              <section class="worksheet-section">
                <h4>Responding to the Text</h4>
                ${reading.questions.map((question) => renderQuestion(reading, question)).join("")}
              </section>
            </div>
          </article>
        </section>`
      )
      .join("")}
  </section>`;
}

function renderAnalysisTermButtons(recipe: EnglishUnitRecipeV1) {
  const groups = new Map<string, EnglishUnitRecipeV1["analysisTerms"]>();
  for (const term of recipe.analysisTerms) groups.set(term.category, [...(groups.get(term.category) ?? []), term]);
  const firstTerm = recipe.analysisTerms[0]?.id;
  return [...groups.entries()]
    .map(
      ([category, terms]) => `<section class="analysis-category">
        <h4>${escapeHtml(category)}</h4>
        ${terms
          .map(
            (term) => `<button type="button" class="analysis-term-button${term.id === firstTerm ? " active" : ""}" data-analysis-term-id="${escapeHtml(term.id)}">${escapeHtml(term.label)}</button>`
          )
          .join("")}
      </section>`
    )
    .join("");
}

function renderWritingEvidenceCapture(recipe: EnglishUnitRecipeV1, readings: EnglishBuiltReading[]) {
  const responseBase = "evidence-draft:writing-studio";
  const evidenceLabel = readings.some((reading) => reading.kind === "visual-narrative") ? "textual or visual evidence" : "textual evidence";
  return `<section class="english-evidence-capture english-writing-evidence-capture" data-writing-activity-panel data-evidence-notebook-panel data-evidence-capture="writing-studio">
    <div class="english-evidence-capture-heading short-story-dark-header">
      <div>
        <p>Evidence Bank</p>
        <h3>Keep an analysis example</h3>
        <span>Move a useful moment from the Analysis Explorer or your own close reading into the shared Evidence Bank.</span>
      </div>
      <span class="material-symbols-outlined" aria-hidden="true">library_add</span>
    </div>
    <div class="english-evidence-fields">
      <label>Source text
        <select data-response-id="${responseBase}:source" data-evidence-draft="source">
          ${readings.map((reading) => `<option value="${escapeHtml(reading.id)}">${escapeHtml(reading.title)} | Writing Studio</option>`).join("")}
        </select>
      </label>
      <label>Literary concept
        <select data-response-id="${responseBase}:concept" data-evidence-draft="concept">
          ${recipe.analysisTerms.map((term) => `<option value="${escapeHtml(term.id)}">${escapeHtml(term.label)}</option>`).join("")}
        </select>
      </label>
    </div>
    <label>Exact ${evidenceLabel}
      <textarea rows="4" data-response-id="${responseBase}:detail" data-evidence-draft="detail" placeholder="Record or paste the evidence moment you want to keep."></textarea>
    </label>
    <label>Analytical breakdown
      <textarea rows="4" data-response-id="${responseBase}:connection" data-evidence-draft="connection" placeholder="Explain how the author or creator's choice develops meaning."></textarea>
    </label>
    <div class="english-evidence-actions">
      <button class="external-resource-action evidence-bank-save-action" type="button" data-save-evidence-note><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save to Evidence Bank</button>
      <a class="english-evidence-link" href="#evidence-bank" data-page-target="evidence-bank">Open Evidence Bank</a>
      <span class="english-evidence-save-status" data-save-status>Draft saves automatically</span>
    </div>
  </section>`;
}

const VIDEO_TITLES: Record<string, string> = {
  "1KbDdiku75E": "Types of Characters",
  j1bfOBBl6pQ: "Irony: Three Types",
  SKi56cPUSFk: "Point of View",
  WH5jlkK4aUI: "Plot Elements",
  "30CPmgVQNks": "The Importance of Setting",
  FzpJnYIQv98: "Themes, Symbols, and Motifs",
  YcCrsVK5dWs: "Tone versus Mood",
  urEh4_fTtao: "Word Choice"
};

function renderFilmRoom(courseCode: string, videos: Array<{ id: string; lessonTitle: string; embedSrc: string }>, verifiedAt: string) {
  return `<section id="film-room" class="course-page" hidden>
    <p class="route-kicker">${escapeHtml(courseCode)} | Film Room</p>
    <h2 class="route-title">Media Room</h2>
    <div class="film-room-shell">
      <div class="film-room-stage">
        ${videos
          .map(
            (video, index) => `<section class="film-panel" data-film-panel="${escapeHtml(video.id)}"${index === 0 ? "" : " hidden"}>
              <div class="film-room-header"><h3>${escapeHtml(VIDEO_TITLES[video.id] ?? video.lessonTitle)}</h3></div>
              <iframe class="film-room-frame" src="${escapeHtml(video.embedSrc)}" title="${escapeHtml(VIDEO_TITLES[video.id] ?? video.lessonTitle)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
              <a class="film-source-link" href="https://www.youtube.com/watch?v=${escapeHtml(video.id)}" target="_blank" rel="noopener noreferrer">Open directly on YouTube</a>
            </section>`
          )
          .join("")}
      </div>
      <aside class="film-room-sidebar">
        <div class="film-room-control-panel">
          <h3>Media Playlist</h3>
          <label class="film-room-label" for="film-select">Choose a video</label>
          <select id="film-select" class="film-room-select" data-film-select>
            ${videos.map((video, index) => `<option value="${escapeHtml(video.id)}"${index === 0 ? " selected" : ""}>${escapeHtml(VIDEO_TITLES[video.id] ?? video.lessonTitle)}</option>`).join("")}
          </select>
          <p class="film-room-note">Availability verified ${escapeHtml(verifiedAt)}. Each video is also available in its related lesson.</p>
        </div>
      </aside>
    </div>
  </section>`;
}

function renderWritingStudio(recipe: EnglishUnitRecipeV1, readings: EnglishBuiltReading[]) {
  const analysisReadings = readings.map((reading) => ({ id: reading.id, title: reading.title, author: reading.author }));
  const firstTerm = recipe.analysisTerms[0]?.id ?? "";
  const hasVisualNarrative = readings.some((reading) => reading.kind === "visual-narrative");
  const evidencePrompt = `What specific textual${hasVisualNarrative ? " or visual" : ""} evidence will you use?`;
  return `<section id="writing-studio" class="course-page" data-writing-studio hidden>
    <p class="route-kicker">${escapeHtml(recipe.courseCode)} | Writing Studio</p>
    <h2 class="route-title">Personal Response Workspace</h2>
    <p class="route-description">Use these tools to turn short-story reading into clear personal and analytical writing.</p>
    <section class="analysis-explorer" data-analysis-explorer>
      <div class="analysis-explorer-header short-story-dark-header">
        <div>
          <h3>Analysis Explorer</h3>
          <p>Choose a term and a text, then study evidence moments and analytical breakdowns before building your own response.</p>
        </div>
      </div>
      <div class="analysis-shell">
        <aside class="analysis-term-panel">
          <label class="analysis-search-label" for="analysis-term-search">Search terms
            <input id="analysis-term-search" type="search" placeholder="Search literary terms..." data-analysis-search>
          </label>
          <select class="analysis-mobile-term-select" data-analysis-term-select aria-label="Choose literary term">
            ${recipe.analysisTerms.map((term, index) => `<option value="${escapeHtml(term.id)}"${index === 0 ? " selected" : ""}>${escapeHtml(term.label)}</option>`).join("")}
          </select>
          <div class="analysis-term-list" data-analysis-term-list>${renderAnalysisTermButtons(recipe)}</div>
        </aside>
        <div class="analysis-detail-panel">
          <div class="analysis-term-definition" data-analysis-definition></div>
          <div class="analysis-controls">
            <label for="analysis-story-select">Text
              <select id="analysis-story-select" data-analysis-story-select>
                ${readings.map((reading, index) => `<option value="${escapeHtml(reading.id)}"${index === 0 ? " selected" : ""}>${escapeHtml(reading.title)}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="analysis-results" data-analysis-results></div>
          <div class="analysis-writing-move" data-analysis-writing-move></div>
        </div>
      </div>
    </section>
    ${renderWritingEvidenceCapture(recipe, readings)}
    <section id="personal-response-planner" class="analysis-response-planner writing-studio" data-writing-activity-panel data-response-collection data-evidence-collection-id="english-writing-studio:build-response" data-evidence-source="Writing Studio | Build Your Response" data-evidence-concept="Personal Response Plan" data-evidence-prompt-label="Response plan" data-evidence-detail-label="Saved response" data-evidence-saved-message="Response saved to Evidence Bank" data-evidence-updated-message="Response updated in Evidence Bank">
      <div class="worksheet-toolbar writing-studio-toolbar">
        <div class="worksheet-toolbar-actions">
          <button type="button" data-worksheet-toggle-hints aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> Show Hints</button>
          <button type="button" data-worksheet-print data-print-writing><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
        </div>
      </div>
      <div class="writing-studio-section-heading short-story-dark-header">
        <h3>Build Your Response</h3>
        <p>Move from the models above to your own interpretation, evidence, and writing choices.</p>
      </div>
      <label data-evidence-question-number="1" data-evidence-question-prompt="Text or text combination">Text or text combination
        <p class="writing-studio-hint" data-writing-hint hidden>Choose one text for a focused response, or select the comparison option only when a shared idea connects the texts clearly.</p>
        <select data-response-id="personal-response:texts">
          <option value="">Choose a starting point</option>
          ${readings.map((reading) => `<option value="${escapeHtml(reading.id)}">${escapeHtml(reading.title)}</option>`).join("")}
          <option value="comparison">Compare two or more texts</option>
        </select>
      </label>
      <label data-evidence-question-number="2" data-evidence-question-prompt="What idea, feeling, or impression does the text create for you?">What idea, feeling, or impression does the text create for you?
        <p class="writing-studio-hint" data-writing-hint hidden>State an insight you can develop, not a plot summary. Name what the text suggests about people, choices, relationships, or experience.</p>
        <textarea rows="6" data-response-id="personal-response:idea"></textarea>
      </label>
      <label data-evidence-question-number="3" data-evidence-question-prompt="What personal knowledge or experience connects meaningfully to that idea?">What personal knowledge or experience connects meaningfully to that idea?
        <p class="writing-studio-hint" data-writing-hint hidden>Choose a connection that helps explain your interpretation. Make clear why the experience matters instead of only describing what happened.</p>
        <textarea rows="6" data-response-id="personal-response:connection"></textarea>
      </label>
      <label data-evidence-question-number="4" data-evidence-question-prompt="${escapeHtml(evidencePrompt)}">${escapeHtml(evidencePrompt)}
        <p class="writing-studio-hint" data-writing-hint hidden>Record two precise moments, quotations, or actions${hasVisualNarrative ? ", or visual details" : ""}. Explain how each one supports the idea you identified.</p>
        <textarea rows="6" data-response-id="personal-response:evidence"></textarea>
      </label>
      <label data-evidence-question-number="5" data-evidence-question-prompt="Which prose form best suits what you want to communicate, and why?">Which prose form best suits what you want to communicate, and why?
        <p class="writing-studio-hint" data-writing-hint hidden>Consider a personal reflection, narrative, letter, monologue, or analytical paragraph. Choose the form that best supports your purpose and voice.</p>
        <textarea rows="5" data-response-id="personal-response:form"></textarea>
      </label>
      <label data-evidence-question-number="6" data-evidence-question-prompt="Draft your controlling idea or opening move">Draft your controlling idea or opening move
        <p class="writing-studio-hint" data-writing-hint hidden>Begin with a focused image, moment, statement, or reflection that leads naturally into your controlling idea.</p>
        <textarea rows="7" data-response-id="personal-response:draft"></textarea>
      </label>
      <div class="english-evidence-actions writing-studio-evidence-actions">
        <button class="external-resource-action evidence-bank-save-action" type="button" data-save-response-collection><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save Response to Evidence Bank</button>
        <a class="english-evidence-link" href="#evidence-bank" data-page-target="evidence-bank">Open Evidence Bank</a>
        <span class="english-evidence-save-status" data-response-collection-status aria-live="polite">Your response saves automatically</span>
      </div>
    </section>
    <script>
      (function(){
        const root = document.querySelector('[data-analysis-explorer]');
        if(!root) return;
        const analysisTerms = ${scriptJson(recipe.analysisTerms)};
        const analysisReadings = ${scriptJson(analysisReadings)};
        const analysisExamples = ${scriptJson(recipe.analysisExamples.filter((example) => example.termId))};
        let activeTermId = ${scriptJson(firstTerm)};
        function escapeAnalysisHtml(value){ return String(value == null ? '' : value).replace(/[&<>"']/g, function(char){ return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char] || char; }); }
        function renderTermList(){
          const list = root.querySelector('[data-analysis-term-list]');
          const search = String(root.querySelector('[data-analysis-search]')?.value || '').trim().toLowerCase();
          if(!list) return;
          const filtered = analysisTerms.filter(function(term){ return !search || term.label.toLowerCase().includes(search) || term.category.toLowerCase().includes(search) || term.definition.toLowerCase().includes(search); });
          const grouped = filtered.reduce(function(groups, term){ (groups[term.category] = groups[term.category] || []).push(term); return groups; }, {});
          list.innerHTML = Object.keys(grouped).map(function(category){ return '<section class="analysis-category"><h4>' + escapeAnalysisHtml(category) + '</h4>' + grouped[category].map(function(term){ return '<button type="button" class="analysis-term-button' + (term.id === activeTermId ? ' active' : '') + '" data-analysis-term-id="' + escapeAnalysisHtml(term.id) + '">' + escapeAnalysisHtml(term.label) + '</button>'; }).join('') + '</section>'; }).join('') || '<p class="analysis-empty">No matching terms.</p>';
        }
        function renderExplorer(){
          const term = analysisTerms.find(function(item){ return item.id === activeTermId; }) || analysisTerms[0];
          const storySelect = root.querySelector('[data-analysis-story-select]');
          const definition = root.querySelector('[data-analysis-definition]');
          const results = root.querySelector('[data-analysis-results]');
          const writingMove = root.querySelector('[data-analysis-writing-move]');
          if(!term || !storySelect || !definition || !results || !writingMove) return;
          activeTermId = term.id;
          const mobileSelect = root.querySelector('[data-analysis-term-select]');
          if(mobileSelect) mobileSelect.value = term.id;
          const reading = analysisReadings.find(function(item){ return item.id === storySelect.value; }) || analysisReadings[0];
          const examples = analysisExamples.filter(function(example){ return reading && example.readingId === reading.id && example.termId === term.id; });
          definition.innerHTML = '<p class="analysis-category-label">' + escapeAnalysisHtml(term.category) + '</p><h4>' + escapeAnalysisHtml(term.label) + '</h4><p>' + escapeAnalysisHtml(term.definition) + '</p>';
          results.innerHTML = examples.length ? examples.map(function(example, index){ return '<article class="analysis-example-card"><h4>Example ' + (index + 1) + '</h4><div class="analysis-example-grid"><div class="analysis-quote"><strong>Textual evidence</strong><blockquote>' + escapeAnalysisHtml(example.evidenceMoment) + '</blockquote></div><div class="analysis-example-row"><strong>Analytical breakdown</strong>' + escapeAnalysisHtml(example.analysis) + '</div></div></article>'; }).join('') : '<article class="analysis-empty">No example is available for this term and text yet.</article>';
          writingMove.innerHTML = reading ? '<strong>Writing move</strong><p>Use the ' + escapeAnalysisHtml(term.label.toLowerCase()) + ' evidence from <em>' + escapeAnalysisHtml(reading.title) + '</em> to explain how a specific choice develops a larger idea.</p>' : '';
          renderTermList();
        }
        document.addEventListener('click', function(event){ const button = event.target.closest('[data-analysis-term-id]'); if(!button || !root.contains(button)) return; activeTermId = button.getAttribute('data-analysis-term-id') || activeTermId; renderExplorer(); });
        document.addEventListener('input', function(event){ if(event.target.closest('[data-analysis-search]') && root.contains(event.target)) renderTermList(); });
        document.addEventListener('change', function(event){
          const termSelect = event.target.closest('[data-analysis-term-select]');
          if(termSelect && root.contains(termSelect)){ activeTermId = termSelect.value; renderExplorer(); return; }
          if(event.target.closest('[data-analysis-story-select]') && root.contains(event.target)) renderExplorer();
        });
        renderExplorer();
      })();
    </script>
    <script>
      (function(){
        const studio = document.querySelector('[data-writing-studio]');
        const button = studio?.querySelector('[data-worksheet-toggle-hints]');
        if(!studio || !button) return;
        button.addEventListener('click', function(){
          const show = button.getAttribute('aria-pressed') !== 'true';
          button.setAttribute('aria-pressed', String(show));
          button.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> ' + (show ? 'Hide Hints' : 'Show Hints');
          studio.querySelectorAll('[data-writing-hint]').forEach(function(hint){ hint.hidden = !show; });
        });
      })();
    </script>
  </section>`;
}

function renderEvidenceBank(recipe: EnglishUnitRecipeV1) {
  const responseBase = "evidence-draft:evidence-bank";
  const hasVisualNarrative = recipe.readings.some((reading) => reading.kind === "visual-narrative");
  const exampleSource = recipe.readings[0]?.title ?? "Assigned text";
  return `<section id="evidence-bank" class="course-page" hidden>
    <p class="route-kicker">${escapeHtml(recipe.courseCode)} | Evidence Bank</p>
    <h2 class="route-title">Evidence Bank</h2>
    <p class="route-description">Keep strong quotations${hasVisualNarrative ? ", visual details," : ""} and analytical observations in one place so you can reuse them in lesson responses and writing.</p>
    <div class="english-evidence-bank-actions">
      <a href="#story-questions" data-page-target="story-questions"><span class="material-symbols-outlined" aria-hidden="true">quiz</span> Find evidence in Short Story Questions</a>
      <a href="#writing-studio" data-page-target="writing-studio"><span class="material-symbols-outlined" aria-hidden="true">edit_note</span> Build evidence in Writing Studio</a>
    </div>
    <section class="english-evidence-bank-list" aria-labelledby="saved-evidence-title">
      <div class="english-evidence-bank-heading short-story-dark-header">
        <div>
          <p>Running notebook</p>
          <h3 id="saved-evidence-title">Saved evidence</h3>
        </div>
        <button type="button" data-print-writing><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
      </div>
      <div class="english-evidence-card-list" data-manual-evidence-list></div>
    </section>
    <section class="english-evidence-capture english-evidence-bank-capture" data-writing-activity-panel data-evidence-notebook-panel data-evidence-capture="evidence-bank">
      <div class="english-evidence-capture-heading short-story-dark-header">
        <div>
          <p>Quick entry</p>
          <h3>Add evidence directly</h3>
          <span>Use this form for evidence you find outside the guided question and Writing Studio activities.</span>
        </div>
        <span class="material-symbols-outlined" aria-hidden="true">note_add</span>
      </div>
      <div class="english-evidence-fields">
        <label>Source text or lesson
          <input type="text" data-response-id="${responseBase}:source" data-evidence-draft="source" placeholder="Example: ${escapeHtml(exampleSource)} - lesson or reading location">
        </label>
        <label>Literary concept
          <input type="text" data-response-id="${responseBase}:concept" data-evidence-draft="concept" placeholder="Example: setting, symbolism, point of view">
        </label>
      </div>
      <label>Exact textual${hasVisualNarrative ? " or visual" : ""} evidence
        <textarea rows="4" data-response-id="${responseBase}:detail" data-evidence-draft="detail" placeholder="Record a quotation, action${hasVisualNarrative ? ", image, or panel" : ""}, or other precise detail."></textarea>
      </label>
      <label>Why this evidence matters
        <textarea rows="4" data-response-id="${responseBase}:connection" data-evidence-draft="connection" placeholder="Explain how this evidence supports an interpretation."></textarea>
      </label>
      <div class="english-evidence-actions">
        <button class="external-resource-action evidence-bank-save-action" type="button" data-save-evidence-note><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save to Evidence Bank</button>
        <span class="english-evidence-save-status" data-save-status>Draft saves automatically</span>
      </div>
    </section>
  </section>`;
}

function renderResourceCard(input: { kicker: string; title: string; detail: string; href: string; downloadable?: boolean }) {
  return `<article class="external-resource-card">
    <span class="resource-kicker">${escapeHtml(input.kicker)}</span>
    <h3>${escapeHtml(input.title)}</h3>
    <p>${escapeHtml(input.detail)}</p>
    <div class="resource-card-actions">
      <a class="external-resource-action" href="${escapeHtml(input.href)}" target="_blank" rel="noopener noreferrer">Open Resource</a>
      ${input.downloadable ? `<a class="external-resource-action secondary" href="${escapeHtml(input.href)}" download>Download</a>` : ""}
    </div>
  </article>`;
}

function renderResources(courseCode: string, readings: EnglishBuiltReading[], lessons: EnglishBuiltLesson[]) {
  const documentCards = readings
    .flatMap((reading) => {
      const questionIsReading = reading.questionHref === reading.readingHref;
      return [
        renderResourceCard({ kicker: "Reading", title: reading.title, detail: reading.group, href: reading.readingHref, downloadable: true }),
        ...(questionIsReading
          ? []
          : [renderResourceCard({ kicker: "Question Sheet", title: `${reading.title} Questions`, detail: reading.group, href: reading.questionHref, downloadable: true })])
      ];
    })
    .join("");
  const supportGroups = lessons
    .map((lesson) => ({
      id: `resources-${lesson.id}`,
      title: lesson.title,
      items: lesson.supportingResources.filter(
        (resource, index, items) => items.findIndex((candidate) => candidate.href === resource.href) === index
      )
    }))
    .filter((group) => group.items.length > 0);
  return `<section id="resources" class="course-page" hidden>
    <p class="route-kicker">${escapeHtml(courseCode)} | Resources</p>
    <h2 class="route-title">Resources</h2>
    <div class="resource-stack">
      <section class="resource-lesson-group">
        <div class="resource-group-heading">
          <h3>Course Documents</h3>
          <p>Readings and question sheets for this unit.</p>
        </div>
        <div class="resource-lesson-items">${documentCards}</div>
      </section>
      ${supportGroups.length
        ? `<div class="scene-overview-control">
            <label class="film-room-label" for="resource-select">Choose a lesson group</label>
            <select id="resource-select" class="film-room-select" data-resource-select>
              ${supportGroups.map((group, index) => `<option value="${escapeHtml(group.id)}"${index === 0 ? " selected" : ""}>${escapeHtml(group.title)}</option>`).join("")}
            </select>
          </div>
          ${supportGroups
            .map(
              (group, index) => `<section class="resource-lesson-group" data-resource-panel="${escapeHtml(group.id)}"${index === 0 ? "" : " hidden"}>
                <div class="resource-group-heading"><h3>${escapeHtml(cleanLessonTitle(group.title))}</h3><p>Supporting material connected to this lesson.</p></div>
                <div class="resource-lesson-items">${group.items
                  .map((item) => renderResourceCard({ kicker: item.kind === "local" ? "Local Source" : "External Source", title: item.title, detail: item.href, href: item.href }))
                  .join("")}</div>
              </section>`
            )
            .join("")}`
        : ""}
    </div>
  </section>
    <div class="reader-overlay" data-reader-overlay hidden role="dialog" aria-modal="true" aria-labelledby="reader-overlay-title">
      <div class="reader-overlay-panel">
        <div><h2 id="reader-overlay-title" data-reader-overlay-title>Full-screen reader</h2><button type="button" data-reader-close aria-label="Close full-screen reader">Close</button></div>
        <iframe data-reader-overlay-frame title="Full-screen reader"></iframe>
      </div>
    </div>
    <script>
      (function(){
        const overlay = document.querySelector('[data-reader-overlay]');
        const frame = document.querySelector('[data-reader-overlay-frame]');
        const title = document.querySelector('[data-reader-overlay-title]');
        function setActiveReading(id){
          if(!id) return;
          const scope = document.querySelector('.story-bank-browser');
          scope?.querySelectorAll('[data-library-doc-panel]').forEach(function(panel){ panel.hidden = panel.getAttribute('data-library-doc-panel') !== id; });
          scope?.querySelectorAll('[data-library-doc-target]').forEach(function(button){ const active = button.getAttribute('data-library-doc-target') === id; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
        }
        function updateQuestionPanel(panel){
          const fields = Array.from(panel.querySelectorAll('.worksheet-question [data-response-id]'));
          const answered = fields.filter(function(field){ return String(field.value || '').trim(); }).length;
          const label = panel.querySelector('[data-question-progress-label]');
          const fill = panel.querySelector('[data-question-progress-fill]');
          if(label) label.textContent = answered + ' of ' + fields.length + ' answered';
          if(fill) fill.style.width = fields.length ? Math.round((answered / fields.length) * 100) + '%' : '0%';
          fields.forEach(function(field){ const count = String(field.value || '').trim().split(/\\s+/).filter(Boolean).length; const node = field.closest('.worksheet-answer-field')?.querySelector('.worksheet-word-count'); if(node) node.textContent = count + ' words'; });
        }
        function closeReader(){ if(!overlay) return; overlay.hidden = true; if(frame) frame.removeAttribute('src'); document.body.style.overflow = ''; }
        document.addEventListener('click', function(event){
          const readingLink = event.target.closest('[data-open-reading]');
          if(readingLink) setActiveReading(readingLink.getAttribute('data-open-reading'));
          const open = event.target.closest('[data-reader-fullscreen]');
          if(open && overlay && frame){ frame.src = open.getAttribute('data-reader-fullscreen'); title.textContent = open.getAttribute('data-reader-title') || 'Full-screen reader'; overlay.hidden = false; document.body.style.overflow = 'hidden'; overlay.querySelector('[data-reader-close]')?.focus(); }
          if(event.target.closest('[data-reader-close]')) closeReader();
          const printQuestions = event.target.closest('[data-print-questions]');
          if(printQuestions){ const panel = printQuestions.closest('[data-question-panel]'); if(window.printCourseSection) window.printCourseSection(panel); else window.print(); }
          const questionHints = event.target.closest('[data-worksheet-toggle-hints]');
          const questionPanel = questionHints?.closest('[data-question-panel]');
          if(questionHints && questionPanel){
            const show = questionHints.getAttribute('aria-pressed') !== 'true';
            questionHints.setAttribute('aria-pressed', String(show));
            questionHints.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">lightbulb</span> ' + (show ? 'Hide Hints' : 'Show Hints');
            questionPanel.querySelectorAll('[data-question-hint]').forEach(function(hint){ hint.hidden = !show; });
          }
          const elementTarget = event.target.closest('[data-element-target]');
          if(elementTarget){ const id = elementTarget.getAttribute('data-element-target'); const workbench = elementTarget.closest('.elements-workbench'); let activePanel = null; workbench?.querySelectorAll('[data-element-panel]').forEach(function(panel){ const active = panel.getAttribute('data-element-panel') === id; panel.hidden = !active; if(active) activePanel = panel; }); workbench?.querySelectorAll('[data-element-target]').forEach(function(button){ const active = button.getAttribute('data-element-target') === id; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); }); if(activePanel){ activePanel.scrollIntoView({ behavior: 'smooth', block: 'start' }); activePanel.focus({ preventScroll: true }); } }
        });
        document.addEventListener('keydown', function(event){ if(event.key === 'Escape') closeReader(); });
        window.addEventListener('hashchange', function(){ window.scrollTo({ top: 0, behavior: 'auto' }); });
        window.addEventListener('DOMContentLoaded', function(){ window.scrollTo({ top: 0, behavior: 'auto' }); });
        document.addEventListener('input', function(event){
          const field = event.target.closest('[data-response-id]');
          if(!field) return;
          const id = field.getAttribute('data-response-id');
          document.querySelectorAll('[data-response-id]').forEach(function(peer){ if(peer !== field && peer.getAttribute('data-response-id') === id) peer.value = field.value; });
          document.querySelectorAll('[data-question-panel]').forEach(updateQuestionPanel);
          const status = field.closest('[data-question-panel]')?.querySelector('[data-question-save-status]');
          if(status) status.textContent = 'Saved locally';
        });
        window.addEventListener('DOMContentLoaded', function(){ document.querySelectorAll('[data-question-panel]').forEach(updateQuestionPanel); });
      })();
    </script>`;
}

const EXTRA_CSS = `
.course-frame { width: 100%; }
.course-main { padding-right: 64px; padding-bottom: 64px; padding-left: 64px; }
.route-panel { border: 1px solid var(--surface-variant); border-top: 4px solid var(--primary); background: #fff; border-radius: 8px; padding: 28px; }
.route-panel > h2 { margin-top: 0; }
.route-panel label, .question-field, .analysis-example label, .writing-studio label { display: grid; gap: 8px; font-weight: 700; color: var(--on-surface); }
.route-panel select, .route-panel textarea { width: 100%; border: 1px solid #aeb8a7; border-radius: 6px; background: #fff; color: #20241f; font: inherit; padding: 11px 12px; }
.route-panel textarea:focus, .route-panel select:focus { outline: 3px solid rgba(70, 105, 55, .2); border-color: var(--primary); }
.lesson-page--ela30 .lesson-detail-panel--ela30 {
  overflow: visible;
  border: 0;
  border-top: 4px solid #154212;
  border-radius: 8px;
  background: #f3f4f5;
  padding: 40px;
}
.lesson-heading-row--ela30 { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 24px; margin: 16px 0 24px; }
.lesson-heading-row--ela30 h2 { margin: 0; color: #191c1d; font-family: "Hanken Grotesk", "Aptos Display", sans-serif; font-size: 32px; font-weight: 700; line-height: 1.2; letter-spacing: 0; }
.lesson-page--ela30 .source-content { max-width: none; margin: 0; color: #191c1d; font-family: "Work Sans", "Aptos", sans-serif; font-size: 16px; line-height: 1.65; }
.lesson-page--ela30 .source-content h1 { margin: 0 0 16px; font-family: "Hanken Grotesk", "Aptos Display", sans-serif; font-size: 28px; font-weight: 800; line-height: 1.2; }
.lesson-page--ela30 .source-content h2,
.lesson-page--ela30 .source-content h3 { margin: 28px 0 12px; font-family: "Hanken Grotesk", "Aptos Display", sans-serif; font-size: 22px; font-weight: 700; line-height: 1.25; }
.lesson-page--ela30 .source-content p { max-width: 74ch; margin: 0 0 16px; }
.lesson-page--ela30 .source-content .source-intro-callout {
  max-width: 74ch;
  margin: 0 0 24px;
  padding: 20px 22px;
  border: 1px solid #d8ddd4;
  border-left: 4px solid #154212;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(20, 32, 18, .06);
}
.lesson-page--ela30 .source-content .source-intro-callout > span { font-size: 17px !important; line-height: 1.65; }
.lesson-page--ela30 .source-content ul,
.lesson-page--ela30 .source-content ol { max-width: 74ch; margin: 0 0 16px 22px; padding: 0; }
.lesson-page--ela30 .source-content li { margin: 8px 0; }
.lesson-page--ela30 .source-content a,
.lesson-page--ela30 .source-link { color: #154212; text-decoration: underline; text-underline-offset: 3px; }
.lesson-page--ela30 .source-content img { display: block; width: min(100%, 680px); max-width: 100%; max-height: 360px; height: auto; margin: 18px 0; border: 1px solid #e1e3e4; border-radius: 8px; object-fit: contain; }
.lesson-page--ela30 .source-content iframe { display: block; width: min(100%, 760px); min-height: 220px; height: auto; aspect-ratio: 16 / 9; margin: 18px 0; border: 1px solid #d9dadb; border-radius: 8px; background: #000; }
.lesson-source-links--ela30 { margin-top: 40px; padding: 24px; border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; }
.lesson-source-links--ela30 h3 { margin: 0 0 16px; color: #191c1d; font-family: "Hanken Grotesk", "Aptos Display", sans-serif; font-size: 24px; font-weight: 700; line-height: 1.3; }
.lesson-source-links--ela30 ul { margin: 0; padding-left: 22px; }
.lesson-source-links--ela30 li { margin: 8px 0; }
.lesson-page--ela30 .lesson-bottom-bar--ela30 { max-width: none; margin: 40px 0 0; padding: 24px 0 0; border-top: 1px solid #f1f3f4; align-items: center; flex-direction: row; justify-content: space-between; }
.lesson-page--ela30 .lesson-jump { min-height: 44px; padding: 8px 14px; border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; color: #191c1d; font-family: "IBM Plex Sans", "Aptos", sans-serif; font-size: 14px; font-weight: 500; line-height: 1.5; }
.lesson-page--ela30 .lesson-jump.primary { border-color: #154212; background: #154212; color: #fff; }
.lesson-complete-button--ela30 { min-height: 44px; margin-left: auto; order: 3; padding: 12px 16px; border: 0; border-radius: 8px; background: #154212; color: #fff; font-family: "IBM Plex Sans", "Aptos", sans-serif; font-size: 14px; font-weight: 700; line-height: 1.4; cursor: pointer; }
.lesson-page--ela30 .lesson-bottom-bar--ela30 .lesson-complete-button--ela30 { margin-left: auto; }
.lesson-complete-button--ela30:hover, .lesson-complete-button--ela30:focus-visible { background: #2d5a27; outline: 2px solid rgba(21, 66, 18, .2); outline-offset: 2px; }
.reading-roadmap { margin: 0 0 24px; padding: 22px; border: 1px solid #cbd4c5; background: #f7f8f4; border-radius: 8px; }
.lesson-page--ela30 .reading-roadmap { margin: 40px 0 0; }
.roadmap-groups { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.roadmap-groups section { border-left: 3px solid var(--primary); padding-left: 14px; }
.roadmap-groups h3 { margin: 0 0 10px; }
.roadmap-groups ul { margin: 0; padding-left: 18px; }
.roadmap-groups li { margin-bottom: 10px; }
.roadmap-groups span { display: block; color: var(--on-surface-variant); font-size: .9rem; }
.source-content img { display: block; max-width: min(100%, 680px); height: auto; margin: 18px auto; }
.source-content iframe, .film-panel iframe { width: 100%; min-height: 420px; border: 1px solid #cbd4c5; border-radius: 6px; }
.source-content table { display: block; max-width: 100%; overflow-x: auto; }
.source-content table[style*="border: none"] { display: table; width: 100%; table-layout: fixed; border-collapse: collapse; }
.source-content table[style*="border: none"] td { width: auto !important; }
#lesson-14-literary-terms-review .source-content div[style*="padding-left:"] { padding-left: 0 !important; }
.lesson-application { margin-top: 26px; padding: 20px; border: 1px solid #b8c5af; background: #f5f7f1; border-radius: 8px; }
.lesson-application > h3 { margin-top: 0; }
.lesson-reading-links { margin: 18px 0; }
.lesson-reading-links > div { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.lesson-reading-links a, .reader-actions a, .reader-actions button, .writing-studio button { display: inline-flex; align-items: center; min-height: 40px; border: 1px solid #7d9272; border-radius: 6px; background: #fff; color: #24491f; padding: 8px 12px; font-weight: 700; text-decoration: none; cursor: pointer; }
.lesson-question-set { display: grid; gap: 18px; margin-top: 20px; }
.question-field { gap: 8px; }
.question-field textarea { min-height: 132px; resize: vertical; }
.elements-workbench { margin-top: 28px; padding-top: 22px; border-top: 1px solid #d9dadb; }
.elements-checklist-header { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 12px; }
.elements-checklist-header h3 { margin: 0; font-family: "Hanken Grotesk", sans-serif; font-size: 26px; line-height: 1.2; font-weight: 800; }
.elements-checklist-header p { margin: 0; color: #4d554a; font-size: 16px; }
.elements-table { display: table !important; width: 100%; border: 1px solid #d9dadb; border-collapse: collapse; background: #fff; }
.elements-table th, .elements-table td { border-bottom: 1px solid #e6e8e5; padding: 12px 14px; text-align: left; vertical-align: top; }
.elements-table th { color: #154212; font-family: "IBM Plex Sans", sans-serif; font-size: 13px; font-weight: 700; }
.elements-table th:first-child, .elements-table td:first-child { width: 64px; text-align: center; }
.elements-table tbody tr:last-child td { border-bottom: 0; }
.element-check { display: inline-grid; place-items: center; width: 30px; min-height: 30px; border: 1px solid #b7c4b2; border-radius: 6px; background: #fff; color: #6b7167; padding: 0; font: inherit; font-weight: 800; line-height: 1; cursor: pointer; }
.element-check:hover, .element-check:focus-visible { border-color: #154212; color: #154212; outline: 2px solid rgba(21, 66, 18, .18); outline-offset: 2px; }
.element-check.is-complete { border-color: #154212; background: #154212; color: #fff; }
.element-selector { display: grid; gap: 4px; appearance: none; border: 0; background: transparent; color: #154212; padding: 0; text-align: left; text-decoration: underline; text-underline-offset: 3px; font: inherit; font-weight: 700; cursor: pointer; }
.element-selector-action { color: #596259; font-size: 12px; font-weight: 700; text-decoration: none; }
.element-selector.active, .element-selector[aria-selected="true"] { color: #191c1d; text-decoration-thickness: 2px; }
.element-panels { margin-top: 24px; }
.element-panel { padding-top: 24px; border-top: 1px solid #d9dadb; }
.element-panel > h3 { margin: 0 0 16px; font-family: "Hanken Grotesk", sans-serif; font-size: 30px; line-height: 1.2; font-weight: 800; }
.element-completion-bar { display: flex; justify-content: flex-end; margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f3f4; }
.terms-reference { margin-top: 32px; padding-top: 24px; border-top: 1px solid #d9dadb; }
.terms-reference h2 { margin: 0 0 12px; font-family: "Hanken Grotesk", sans-serif; font-size: 26px; line-height: 1.2; font-weight: 800; }
.terms-reference h3 { margin-top: 24px; }
.terms-list { display: grid; gap: 10px; margin: 14px 0 24px !important; max-width: none !important; }
.term-row { display: grid; grid-template-columns: minmax(140px, 220px) minmax(0, 1fr); gap: 16px; padding: 10px 0; border-bottom: 1px solid #e1e3e4; }
.term-row dt { color: #154212; font-family: "IBM Plex Sans", sans-serif; font-weight: 700; }
.term-row dd { margin: 0; color: #42493e; }
.element-panel[hidden], .question-panel[hidden], .analysis-panel[hidden], .film-panel[hidden], .text-reader[hidden] { display: none !important; }
.text-bank-browser > label, .route-panel > label[for] { margin: 20px 0 8px; }
.text-reader { margin-top: 20px; border-top: 1px solid #cbd4c5; padding-top: 20px; }
.reader-heading, .question-panel-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; margin-bottom: 16px; }
.reader-heading h3, .reader-heading p, .question-panel-heading h3 { margin-top: 0; }
.reader-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.text-reader > iframe { width: 100%; min-height: 680px; border: 1px solid #aeb8a7; }
.question-panel, .analysis-panel, .film-panel { margin-top: 24px; }
.question-panel { display: grid; gap: 20px; }
.film-panel iframe { margin: 12px 0; aspect-ratio: 16 / 9; min-height: 0; }
.analysis-explorer { margin: 26px 0; padding: 18px; background: #fff; border: 1px solid #d9dadb; border-radius: 10px; }
.analysis-explorer-header { display: flex; justify-content: space-between; align-items: start; gap: 16px; margin-bottom: 16px; }
.analysis-explorer-header h3 { margin: 0; font-family: "Hanken Grotesk", sans-serif; font-size: 28px; line-height: 1.15; font-weight: 800; }
.analysis-explorer-header p { max-width: 780px; margin: 6px 0 0; color: #5d6359; }
.analysis-shell { display: grid; grid-template-columns: minmax(210px, 260px) minmax(0, 1fr); gap: 18px; }
.analysis-term-panel { align-self: start; border: 1px solid #e1e3e4; border-radius: 10px; background: #f8f9fa; padding: 12px; }
.analysis-search-label { display: grid; gap: 6px; color: #154212; font-family: "IBM Plex Sans", sans-serif; font-size: 13px; font-weight: 700; }
.analysis-search-label input { width: 100%; border: 1px solid #c5c9c1; border-radius: 8px; background: #fff; padding: 10px 12px; color: #191c1d; font: 15px/1.4 "Work Sans", sans-serif; }
.analysis-search-label input:focus { border-color: #154212; outline: 2px solid rgba(21, 66, 18, .18); }
.analysis-mobile-term-select { display: none; width: 100%; margin-top: 10px; border: 1px solid #c5c9c1; border-radius: 8px; background: #fff; padding: 10px 12px; font: 15px/1.4 "Work Sans", sans-serif; }
.analysis-term-list { display: grid; gap: 14px; max-height: 540px; margin-top: 14px; overflow: auto; padding-right: 4px; }
.analysis-category h4 { margin: 0 0 7px; color: #66705f; font-family: "IBM Plex Sans", sans-serif; font-size: 12px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
.analysis-term-button { display: block; width: 100%; border: 0; border-radius: 8px; background: transparent; color: #31372f; padding: 8px 10px; text-align: left; font: 800 16px/1.25 "Hanken Grotesk", sans-serif; cursor: pointer; }
.analysis-term-button:hover, .analysis-term-button:focus-visible { background: #eef2ea; outline: 2px solid rgba(21, 66, 18, .14); }
.analysis-term-button.active { background: #154212; color: #fff; }
.analysis-detail-panel { min-width: 0; }
.analysis-term-definition { margin-bottom: 12px; border: 1px solid #e1e3e4; border-radius: 10px; background: #fff; padding: 16px; }
.analysis-term-definition h4 { margin: 0 0 8px; font: 800 26px/1.15 "Hanken Grotesk", sans-serif; }
.analysis-term-definition p { margin: 0; color: #42493e; line-height: 1.55; }
.analysis-category-label { margin: 0 0 6px !important; color: #154212 !important; font-family: "IBM Plex Sans", sans-serif; font-size: 13px; font-weight: 700; }
.analysis-controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 16px; }
.analysis-controls label { display: grid; gap: 6px; color: #154212; font-family: "IBM Plex Sans", sans-serif; font-size: 13px; font-weight: 700; }
.analysis-controls select { width: 100%; border: 1px solid #c5c9c1; border-radius: 8px; background: #fff; padding: 10px 12px; color: #191c1d; font: 15px/1.4 "Work Sans", sans-serif; }
.analysis-controls select:focus { border-color: #154212; outline: 2px solid rgba(21, 66, 18, .18); }
.analysis-results { display: grid; gap: 12px; }
.analysis-example-card { border: 1px solid #e1e3e4; border-radius: 10px; background: #fdfdfb; padding: 16px; }
.analysis-example-card h4 { margin: 0 0 12px; font: 800 20px/1.2 "Hanken Grotesk", sans-serif; }
.analysis-example-grid { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 16px; }
.analysis-quote strong, .analysis-example-row strong { display: block; margin-bottom: 6px; color: #154212; font-family: "IBM Plex Sans", sans-serif; font-size: 13px; }
.analysis-quote blockquote { margin: 0; border-left: 3px solid #c5c9c1; padding-left: 12px; color: #31372f; font-style: italic; line-height: 1.55; }
.analysis-example-row { color: #42493e; line-height: 1.55; }
.analysis-writing-move { margin-top: 14px; border-left: 3px solid #154212; background: #f5f7f2; padding: 12px 14px; }
.analysis-writing-move strong { display: block; color: #154212; font-family: "IBM Plex Sans", sans-serif; font-size: 13px; }
.analysis-writing-move p { margin: 5px 0 0; color: #42493e; line-height: 1.5; }
.analysis-empty { border: 1px solid #e1e3e4; border-radius: 10px; background: #f8f9fa; padding: 16px; color: #5d6359; }
.analysis-response-planner { display: grid; gap: 20px; margin-top: 26px; border: 1px solid #d9dadb; border-radius: 10px; background: #fff; padding: 22px; }
.analysis-response-planner h3 { margin: 0; font: 800 28px/1.15 "Hanken Grotesk", sans-serif; }
.analysis-response-planner > .writing-studio-section-heading p { max-width: 780px; margin: 6px 0 0; color: #5d6359; }
.analysis-response-planner label { display: grid; gap: 8px; color: #191c1d; font-family: "IBM Plex Sans", sans-serif; font-size: 14px; font-weight: 700; }
.analysis-response-planner select, .analysis-response-planner textarea { width: 100%; border: 1px solid #c5c9c1; border-radius: 8px; background: #fff; padding: 11px 12px; color: #191c1d; font: 15px/1.55 "Work Sans", sans-serif; }
.analysis-response-planner textarea { resize: vertical; }
.analysis-response-planner select:focus, .analysis-response-planner textarea:focus { border-color: #154212; outline: 2px solid rgba(21, 66, 18, .18); }
.writing-studio-toolbar { margin: 0; }
.writing-studio-toolbar .worksheet-toolbar-actions { margin-left: auto; }
.writing-studio-hint { margin: 0; border: 1px solid #d5d8cc; border-radius: 8px; background: #fbfaf0; color: #514d33; padding: 11px 12px; font: 400 14px/1.5 "Work Sans", sans-serif; }
.writing-studio-hint[hidden] { display: none; }
.english-evidence-capture { display: grid; gap: 18px; margin-top: 24px; border: 1px solid #d9dadb; border-radius: 10px; background: #fff; padding: 22px; }
.english-evidence-capture-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding-bottom: 16px; border-bottom: 1px solid #e3e6e1; }
.english-evidence-capture-heading p, .english-evidence-bank-heading p { margin: 0 0 5px; color: #154212; font-family: "IBM Plex Sans", sans-serif; font-size: 12px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
.english-evidence-capture-heading h3, .english-evidence-capture-heading h4, .english-evidence-bank-heading h3 { margin: 0; color: #191c1d; font-family: "Hanken Grotesk", sans-serif; font-size: 24px; line-height: 1.2; font-weight: 800; }
.english-evidence-capture-heading span:not(.material-symbols-outlined) { display: block; max-width: 760px; margin-top: 6px; color: #5d6359; font-size: 14px; line-height: 1.5; }
.english-evidence-capture-heading > .material-symbols-outlined { display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; flex: 0 0 auto; border-radius: 8px; background: #eef4eb; color: #154212; }
.english-evidence-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.english-evidence-capture label { display: grid; gap: 7px; color: #191c1d; font-family: "IBM Plex Sans", sans-serif; font-size: 14px; font-weight: 700; }
.english-evidence-capture input, .english-evidence-capture select, .english-evidence-capture textarea { width: 100%; border: 1px solid #c5c9c1; border-radius: 8px; background: #fff; padding: 11px 12px; color: #191c1d; font: 15px/1.5 "Work Sans", sans-serif; }
.english-evidence-capture textarea { resize: vertical; }
.english-evidence-capture input:focus, .english-evidence-capture select:focus, .english-evidence-capture textarea:focus { border-color: #154212; outline: 2px solid rgba(21, 66, 18, .18); outline-offset: 1px; }
.english-evidence-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding-top: 2px; }
.english-evidence-actions .external-resource-action { gap: 7px; cursor: pointer; }
.english-evidence-actions .material-symbols-outlined { font-size: 18px; }
.english-evidence-link { min-height: 42px; display: inline-flex; align-items: center; border: 1px solid #c5c9c1; border-radius: 8px; background: #fff; color: #154212; padding: 9px 14px; font-family: "IBM Plex Sans", sans-serif; font-size: 14px; font-weight: 700; text-decoration: none; }
.english-evidence-link:hover, .english-evidence-link:focus-visible { border-color: #154212; outline: 2px solid rgba(21, 66, 18, .16); outline-offset: 1px; }
.english-evidence-save-status { color: #5d6359; font-size: 13px; }
.english-writing-evidence-capture { margin-top: 20px; }
.english-evidence-bank-actions { display: flex; flex-wrap: wrap; gap: 10px; margin: 22px 0; }
.english-evidence-bank-actions a { display: inline-flex; align-items: center; gap: 7px; min-height: 42px; border: 1px solid #c5c9c1; border-radius: 8px; background: #fff; color: #154212; padding: 9px 13px; font-family: "IBM Plex Sans", sans-serif; font-size: 14px; font-weight: 700; text-decoration: none; }
.english-evidence-bank-actions a:hover, .english-evidence-bank-actions a:focus-visible { border-color: #154212; background: #f3f7f1; outline: 2px solid rgba(21, 66, 18, .14); }
.english-evidence-bank-actions .material-symbols-outlined { font-size: 18px; }
.english-evidence-bank-list { margin-top: 20px; border: 1px solid #d9dadb; border-radius: 10px; background: #fff; padding: 22px; }
.english-evidence-bank-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #e3e6e1; }
.english-evidence-bank-heading button { display: inline-flex; align-items: center; gap: 7px; min-height: 42px; border: 1px solid #c5c9c1; border-radius: 8px; background: #fff; color: #154212; padding: 9px 13px; font-family: "IBM Plex Sans", sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; }
.english-evidence-bank-heading button:hover, .english-evidence-bank-heading button:focus-visible { border-color: #154212; outline: 2px solid rgba(21, 66, 18, .16); }
.english-evidence-card-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 14px; }
.social-empty-state { grid-column: 1 / -1; margin: 0; border: 1px dashed #bfc7ba; border-radius: 8px; background: #f8f9f7; color: #5d6359; padding: 18px; line-height: 1.55; }
.social-lesson-evidence-card { min-width: 0; border: 1px solid #dde2dd; border-left: 4px solid #154212; border-radius: 8px; background: #fff; padding: 17px; }
.social-lesson-evidence-card h4 { margin: 4px 0 14px; color: #191c1d; font-family: "Hanken Grotesk", sans-serif; font-size: 20px; line-height: 1.25; font-weight: 800; }
.social-lesson-evidence-meta { color: #66705f; font-family: "IBM Plex Sans", sans-serif; font-size: 12px; font-weight: 700; }
.social-evidence-card-detail { margin-top: 12px; }
.social-evidence-card-detail strong { display: block; margin-bottom: 4px; color: #154212; font-family: "IBM Plex Sans", sans-serif; font-size: 12px; }
.social-evidence-card-detail p { margin: 0; color: #42493e; line-height: 1.55; overflow-wrap: anywhere; white-space: pre-wrap; }
.social-evidence-card-actions { margin-top: 16px; padding-top: 12px; border-top: 1px solid #e3e6e1; }
.social-secondary-action { min-height: 36px; background: #fff; color: #154212; padding: 7px 11px; cursor: pointer; }
.english-evidence-bank-capture { margin-top: 18px; }
.short-story-dark-header { border-bottom: 0; background: #161a17; color: #fff; }
.short-story-dark-header h3, .short-story-dark-header h4 { color: #fff; }
.short-story-dark-header p { color: #b9c3b2; }
.short-story-dark-header span:not(.material-symbols-outlined) { color: #d7ddd4; }
.short-story-dark-header > .material-symbols-outlined { background: #293029; color: #9fcf93; }
#writing-studio .analysis-explorer > .short-story-dark-header { margin: -18px -18px 18px; border-radius: 9px 9px 0 0; padding: 24px 28px; }
#writing-studio .english-evidence-capture > .short-story-dark-header { margin: -22px -22px 0; border-radius: 9px 9px 0 0; padding: 24px 28px; }
#writing-studio .analysis-response-planner > .short-story-dark-header { margin: 0 -22px; padding: 24px 28px; }
#writing-studio .analysis-response-planner > .short-story-dark-header p { color: #b9c3b2; }
#evidence-bank .english-evidence-bank-list > .short-story-dark-header { margin: -22px -22px 18px; border-radius: 9px 9px 0 0; padding: 24px 28px; }
#evidence-bank .english-evidence-capture > .short-story-dark-header { margin: -22px -22px 0; border-radius: 9px 9px 0 0; padding: 24px 28px; }
.library-table-wrap { overflow-x: auto; }
.library-table { width: 100%; border-collapse: collapse; }
.library-table th, .library-table td { border-bottom: 1px solid #d5dbd0; padding: 12px; text-align: left; vertical-align: top; }
.library-table th { background: #f3f5f0; }
.library-table a { margin-right: 10px; color: var(--primary); font-weight: 700; }
.reader-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(20, 25, 18, .72); padding: 24px; }
.reader-overlay[hidden] { display: none; }
.reader-overlay-panel { height: 100%; display: grid; grid-template-rows: auto 1fr; background: #fff; border-radius: 8px; overflow: hidden; }
.reader-overlay-panel > div { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 12px 18px; border-bottom: 1px solid #cbd4c5; }
.reader-overlay-panel h2 { margin: 0; font-size: 1.1rem; }
.reader-overlay-panel button { border: 1px solid #66725f; border-radius: 6px; background: #fff; padding: 8px 12px; cursor: pointer; }
.reader-overlay-panel iframe { width: 100%; height: 100%; border: 0; }
.route-kicker { margin: 0 0 6px; color: var(--primary); font-family: "IBM Plex Sans", sans-serif; font-size: 13px; font-weight: 700; }
.route-title { margin: 0; color: var(--on-surface); font-family: "Hanken Grotesk", sans-serif; font-size: clamp(30px, 4vw, 40px); line-height: 1.15; font-weight: 800; }
.route-description { max-width: 780px; margin: 10px 0 0; color: var(--on-surface-variant); line-height: 1.6; }
.library-browser { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 24px; align-items: start; margin-top: 24px; }
.library-list-panel, .library-reader-panel, .film-room-stage, .film-room-control-panel { border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; }
.library-list-panel { padding: 18px; }
.library-list-panel h3, .library-reader-header h3, .film-room-header h3, .film-room-control-panel h3 { margin: 6px 0 8px; color: #191c1d; font-family: "Hanken Grotesk", sans-serif; font-size: 24px; line-height: 1.2; font-weight: 800; }
.library-list-panel p, .library-reader-header p { margin: 0; color: #42493e; font-size: 14px; line-height: 1.5; }
.library-doc-list { display: flex; flex-direction: column; gap: 10px; margin-top: 18px; }
.library-doc-tab { width: 100%; min-height: 70px; display: grid; grid-template-columns: 42px minmax(0, 1fr); gap: 12px; align-items: center; border: 1px solid #e1e3e4; border-radius: 8px; background: #f8f9fa; color: #191c1d; padding: 12px; text-align: left; cursor: pointer; }
.library-doc-tab:hover, .library-doc-tab:focus-visible, .library-doc-tab.active { border-color: #2d5a27; background: #f3f7f1; outline: 2px solid rgba(21, 66, 18, .16); outline-offset: 1px; }
.library-doc-tab strong { display: block; overflow-wrap: anywhere; font-family: "Hanken Grotesk", sans-serif; font-size: 16px; line-height: 1.25; }
.library-doc-tab small { display: block; margin-top: 4px; color: #42493e; font-size: 12px; line-height: 1.3; }
.library-doc-index { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; background: #154212; color: #fff; font-family: "IBM Plex Sans", sans-serif; font-size: 13px; font-weight: 700; }
.library-reader-panel { padding: 18px; }
.library-reader-panel [hidden], .film-panel[hidden], .question-panel[hidden], .resource-lesson-group[hidden] { display: none !important; }
.library-reader-header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 16px; }
.library-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
.library-actions a, .library-actions button { min-height: 42px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid #154212; border-radius: 8px; background: #154212; color: #fff; padding: 9px 14px; font: 700 14px/1.2 "IBM Plex Sans", sans-serif; text-decoration: none; cursor: pointer; }
.library-actions a:hover, .library-actions a:focus-visible, .library-actions button:hover, .library-actions button:focus-visible { background: #2d5a27; border-color: #2d5a27; outline: none; }
.library-document-frame { display: block; width: 100%; height: min(68vh, 680px); min-height: 520px; border: 1px solid #d9dadb; border-radius: 8px; background: #fff; }
.story-question-selector { max-width: 520px; margin: 22px 0 18px; }
.story-question-selector label { display: grid; gap: 8px; color: #154212; font-weight: 800; }
.story-question-selector select { min-height: 48px; border: 1px solid #b9c5b1; border-radius: 8px; background: #fff; color: #171b17; font: inherit; font-weight: 700; padding: 10px 12px; }
.story-question-selector select:focus { border-color: #154212; outline: 2px solid rgba(21, 66, 18, .18); outline-offset: 2px; }
.question-panel { display: block; margin-top: 0; }
.worksheet-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
.worksheet-toolbar-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.worksheet-save-status { min-width: 190px; display: grid; gap: 3px; color: #5d6359; font-size: 14px; }
.worksheet-save-status [data-response-collection-status]:empty { display: none; }
.worksheet-save-status [data-response-collection-status] { color: #154212; font-size: 13px; font-weight: 700; }
.worksheet-toolbar button, .worksheet-toolbar-link { display: inline-flex; align-items: center; gap: 6px; border: 1px solid #c5c9c1; border-radius: 8px; background: #fff; color: #154212; padding: 9px 12px; font: 700 14px/1.2 "IBM Plex Sans", sans-serif; text-decoration: none; cursor: pointer; }
.worksheet-toolbar button:hover, .worksheet-toolbar button:focus-visible, .worksheet-toolbar-link:hover, .worksheet-toolbar-link:focus-visible { border-color: #154212; outline: 2px solid rgba(21, 66, 18, .16); outline-offset: 1px; }
.worksheet-toolbar .material-symbols-outlined { font-size: 18px; }
.worksheet-document { overflow: hidden; border: 1px solid #d9dadb; border-radius: 10px; background: #fff; }
.worksheet-document-header { padding: 28px; background: #161a17; color: #fff; }
.worksheet-document-header p { margin: 0 0 10px; color: #b9c3b2; font-family: "IBM Plex Sans", sans-serif; font-size: 13px; font-weight: 700; }
.worksheet-document-header h3 { margin: 0; color: #fff; font-family: "Hanken Grotesk", sans-serif; font-size: clamp(30px, 4vw, 48px); line-height: 1.05; font-weight: 800; }
.worksheet-document-header > span { display: block; margin-top: 8px; color: #d7ddd4; font-size: 18px; }
.worksheet-progress { margin-top: 22px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,.16); }
.worksheet-progress > div:first-child { display: flex; justify-content: space-between; gap: 12px; color: #d7ddd4; font-size: 14px; }
.worksheet-progress-track { height: 8px; margin-top: 8px; overflow: hidden; border-radius: 999px; background: #293029; }
.worksheet-progress-track div { width: 0; height: 100%; background: #9fcf93; transition: width 160ms ease; }
.worksheet-questions { padding: 26px 28px 0; }
.worksheet-section { margin-bottom: 34px; }
.worksheet-section h4 { margin: 0 0 18px; padding-bottom: 8px; border-bottom: 1px solid #e6e8e5; font-family: "Hanken Grotesk", sans-serif; font-size: 24px; font-weight: 800; }
.worksheet-question { margin-bottom: 26px; }
.worksheet-question-prompt { display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 10px; margin-bottom: 10px; font-size: 17px; line-height: 1.55; }
.worksheet-question-prompt strong { color: #154212; }
.worksheet-hint { margin: 0 0 12px 44px; border: 1px solid #d5d8cc; border-radius: 8px; background: #fbfaf0; color: #514d33; padding: 12px; font-size: 14px; line-height: 1.5; }
.worksheet-hint[hidden] { display: none; }
.worksheet-answer-field { display: grid; gap: 8px; margin-left: 44px; }
.worksheet-answer-field textarea { width: 100%; min-height: 118px; border: 1px solid #c5c9c1; border-radius: 8px; background: #f8f9fa; padding: 12px; color: #191c1d; font: 15px/1.55 "Work Sans", sans-serif; resize: vertical; }
.worksheet-answer-field textarea:focus { border-color: #154212; background: #fff; outline: 2px solid rgba(21, 66, 18, .18); }
.worksheet-word-count { justify-self: end; color: #747a70; font-size: 12px; font-weight: 400; }
.film-room-shell { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 24px; align-items: start; margin-top: 24px; }
.film-room-stage { padding: 18px; background: #f8f9fa; }
.film-room-header { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.film-room-frame { display: block; width: 100%; min-height: 360px; aspect-ratio: 16 / 9; border: 1px solid #191c1d; border-radius: 8px; background: #000; }
.film-room-sidebar { display: flex; flex-direction: column; gap: 16px; }
.film-room-control-panel { padding: 18px; }
.film-room-label { display: block; margin: 18px 0 8px; color: #154212; font-family: "IBM Plex Sans", sans-serif; font-size: 13px; font-weight: 700; }
.film-room-select { width: 100%; min-height: 46px; border: 1px solid #c2c9bb; border-radius: 8px; background: #fff; color: #191c1d; padding: 9px 12px; font: 15px/1.4 "Work Sans", sans-serif; }
.film-room-select:focus { border-color: #154212; outline: 2px solid rgba(21, 66, 18, .22); outline-offset: 2px; }
.film-room-note { margin: 14px 0 0; color: #42493e; font-size: 13px; line-height: 1.5; }
.film-source-link { display: inline-flex; align-items: center; min-height: 42px; margin-top: 12px; border: 1px solid #154212; border-radius: 8px; background: #154212; color: #fff; padding: 9px 14px; font: 700 14px/1.2 "IBM Plex Sans", sans-serif; text-decoration: none; }
.resource-stack { display: grid; gap: 18px; margin-top: 24px; }
.resource-lesson-group { overflow: hidden; border: 1px solid #d9dadb; border-radius: 8px; background: #fff; }
.resource-group-heading { padding: 20px 24px 0; }
.resource-group-heading h3 { margin: 0 0 6px; color: #191c1d; font-family: "Hanken Grotesk", sans-serif; font-size: 24px; line-height: 1.2; font-weight: 800; }
.resource-group-heading p { margin: 0; color: #42493e; line-height: 1.5; }
.resource-lesson-items { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; padding: 20px 24px 24px; }
.external-resource-card { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; min-height: 190px; border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; padding: 18px; color: #191c1d; }
.external-resource-card h3 { margin: 0; font-family: "Hanken Grotesk", sans-serif; font-size: 20px; line-height: 1.25; font-weight: 800; }
.external-resource-card p { margin: 0; color: #42493e; font-size: 14px; line-height: 1.5; overflow-wrap: anywhere; }
.resource-kicker { display: block; color: #154212; font-family: "IBM Plex Sans", sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; }
.resource-card-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; }
.external-resource-action { min-height: 42px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid #154212; border-radius: 8px; background: #154212; color: #fff; padding: 9px 14px; font: 700 14px/1.2 "IBM Plex Sans", sans-serif; text-decoration: none; }
.external-resource-action.secondary { background: #fff; color: #154212; }
.external-resource-action:hover, .external-resource-action:focus-visible { background: #2d5a27; border-color: #2d5a27; color: #fff; outline: none; }
button.evidence-bank-save-action { border-color: #154212; background: #154212; color: #fff; }
button.evidence-bank-save-action:hover, button.evidence-bank-save-action:focus-visible { border-color: #2d5a27; background: #2d5a27; color: #fff; outline: 2px solid rgba(21, 66, 18, .18); outline-offset: 2px; }
.scene-overview-control { display: grid; gap: 8px; max-width: 420px; border: 1px solid #e1e3e4; border-radius: 8px; background: #fff; padding: 16px; }
.scene-overview-control .film-room-label { margin-top: 0; }
@media (max-width: 820px) {
  .roadmap-groups { grid-template-columns: 1fr; }
  .route-panel { padding: 20px; }
  .reader-heading, .question-panel-heading { display: grid; }
  .text-reader > iframe { min-height: 520px; }
  .source-content iframe { min-height: 280px; }
  .library-browser, .film-room-shell { grid-template-columns: 1fr; }
  .library-document-frame { min-height: 480px; }
  .analysis-shell { grid-template-columns: 1fr; }
  .analysis-term-list { display: none; }
  .analysis-mobile-term-select { display: block; }
  .analysis-example-grid { grid-template-columns: 1fr; }
  .english-evidence-fields { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .course-main { padding-right: 24px; padding-left: 24px; }
  .term-row { grid-template-columns: 1fr; gap: 4px; }
  .elements-checklist-header { align-items: start; flex-direction: column; }
  .elements-table th:nth-child(3), .elements-table td:nth-child(3) { display: none; }
}
@media (max-width: 560px) {
  .library-reader-header, .worksheet-toolbar { display: grid; }
  .library-actions { justify-content: flex-start; }
  .worksheet-document-header, .worksheet-questions { padding: 20px; }
  .worksheet-question-prompt { grid-template-columns: 28px minmax(0, 1fr); }
  .worksheet-answer-field { margin-left: 38px; }
  .worksheet-progress > div:first-child { display: grid; }
  .resource-group-heading { padding: 18px 18px 0; }
  .resource-lesson-items { grid-template-columns: 1fr; padding: 18px; }
  .film-room-frame { min-height: 220px; }
  .analysis-explorer, .analysis-response-planner { padding: 16px; }
  .english-evidence-capture, .english-evidence-bank-list { padding: 16px; }
  #writing-studio .analysis-explorer > .short-story-dark-header { margin: -16px -16px 16px; padding: 20px; }
  #writing-studio .english-evidence-capture > .short-story-dark-header, #evidence-bank .english-evidence-capture > .short-story-dark-header { margin: -16px -16px 0; padding: 20px; }
  #writing-studio .analysis-response-planner > .short-story-dark-header { margin: 0 -16px; padding: 20px; }
  #evidence-bank .english-evidence-bank-list > .short-story-dark-header { margin: -16px -16px 18px; padding: 20px; }
  .english-evidence-capture-heading, .english-evidence-bank-heading { align-items: flex-start; }
  .english-evidence-bank-heading { display: grid; }
  .english-evidence-card-list { grid-template-columns: 1fr; }
  .elements-checklist-header { align-items: start; flex-direction: column; }
  .elements-table th:nth-child(3), .elements-table td:nth-child(3) { display: none; }
}
@media print {
  .reader-overlay { display: none !important; }
  .writing-studio button { display: none; }
  .worksheet-toolbar { display: none !important; }
}
`;

export function renderEnglishUnit(input: {
  recipe: EnglishUnitRecipeV1;
  lessons: EnglishBuiltLesson[];
  readings: EnglishBuiltReading[];
  videos: Array<{ id: string; lessonTitle: string; embedSrc: string }>;
}) {
  const shellLessons = buildShellLessons(input);
  const readingGroups = [...new Set(input.readings.map((reading) => reading.group))];
  const readingList = readingGroups.length > 1
    ? `${readingGroups.slice(0, -1).join(", ")} and ${readingGroups.at(-1)}`
    : readingGroups[0] ?? "the assigned texts";
  const hasVisualNarrative = input.readings.some((reading) => reading.kind === "visual-narrative");
  const writingSequences = renderEnglishWritingSequences({
    namespace: input.recipe.projectSlug,
    courseCode: input.recipe.courseCode,
    unitTitle: input.recipe.unitTitle,
    profileKind: "short-fiction",
    works: input.readings.map((reading) => ({ id: reading.id, title: reading.title, author: reading.author, kind: "text" as const })),
    visualProfile: "ela20-workbook",
    criticalEssayTrackMode: "per-work",
    personalResponseTrackMode: "unit",
    includeCriticalEssay: true,
    includePersonalResponse: true,
  });
  const groupedWritingPageIds = new Set(writingSequences.navGroups.flatMap((group) => [group.id, ...group.itemPageIds]));
  const navItems = [
    { id: "story-bank", label: "Short Story Bank", icon: "auto_stories", html: renderTextBank(input.recipe.courseCode, input.readings) },
    { id: "story-questions", label: "Short Story Questions", icon: "quiz", html: renderQuestionBank(input.recipe.courseCode, input.readings) },
    { id: "writing-studio", label: "Writing Studio", icon: "edit_note", html: renderWritingStudio(input.recipe, input.readings) },
    { id: "evidence-bank", label: "Evidence Bank", icon: "library_books", html: renderEvidenceBank(input.recipe) },
    ...(input.videos.length
      ? [{ id: "film-room", label: "Film Room", icon: "live_tv", html: renderFilmRoom(input.recipe.courseCode, input.videos, input.recipe.mediaPolicy.verifiedAt) }]
      : []),
    { id: "resources", label: "Resources", icon: "folder_open", html: renderResources(input.recipe.courseCode, input.readings, input.lessons) }
  ];
  const html = renderNextStepCourseShell({
    slug: input.recipe.projectSlug,
    courseTitle: input.recipe.courseTitle,
    courseCode: input.recipe.courseCode,
    overviewIntro:
      `Read across ${readingList}. Use the course lessons to build a shared language for evidence, interpretation, and response.`,
    outcomes: [
      `I can explain how literary${hasVisualNarrative ? " and visual" : ""} choices shape meaning.`,
      `I can support an interpretation with precise textual${hasVisualNarrative ? " or visual" : ""} evidence.`,
      "I can compare how different texts develop perspective, conflict, and theme.",
      "I can plan a clear personal, critical, or creative response."
    ],
    lessons: shellLessons,
    lessonPresentation: "ela30",
    showLessonSubnavHeadings: false,
    completionIds: input.lessons.map((lesson) => lesson.id),
    lessonGroupTitle: "Short Stories",
    lessonSequenceTitle: "Short Stories Lesson Sequence",
    sourceLessonLabel: "course lessons",
    nextAfterLastLesson: { id: "story-bank", label: "Short Story Bank" },
    logoPath: "assets/brand/nxt-ce-logo-white-with-ce.png",
    storageKeyBase: `canvas-helper:${input.recipe.projectSlug}`,
    navGroups: writingSequences.navGroups.map((group) => {
      const landing = writingSequences.pages.find((page) => page.id === group.id);
      if (!landing) throw new Error(`Writing sequence ${group.id} is missing its landing page.`);
      return {
        id: group.id,
        label: group.label,
        icon: group.icon,
        html: landing.html,
        landingItemLabel: group.landingItemLabel,
        items: group.itemPageIds.map((pageId) => {
          const page = writingSequences.pages.find((candidate) => candidate.id === pageId);
          if (!page) throw new Error(`Writing sequence ${group.id} references missing page ${pageId}.`);
          return { id: page.id, label: page.label, icon: page.icon, html: page.html };
        }),
      };
    }),
    navItems,
    extraCss: `${EXTRA_CSS}\n${ENGLISH_ACTIVITY_PROFILE_CSS}\n${writingSequences.css}`
  });
  if (writingSequences.pages.some((page) => !groupedWritingPageIds.has(page.id))) {
    throw new Error("Short-fiction writing sequence contains an ungrouped route.");
  }
  return html.replace("</body>", `<script>${ENGLISH_ACTIVITY_PROFILE_RUNTIME}\n${writingSequences.runtime}</script></body>`);
}
