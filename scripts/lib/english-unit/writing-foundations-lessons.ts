import * as cheerio from "cheerio";

import type { EnglishBuiltLesson, EnglishSupportingResource } from "./types.js";
import {
  WRITING_FOUNDATIONS_LESSON_BLUEPRINTS,
  assertWritingFoundationsSourcePageIds,
  normalizeWritingFoundationsSourceHtml,
  type WritingFoundationsSourcePageId
} from "./writing-foundations-profile-renderer.js";

export type WritingFoundationsLessonSourceMap = {
  sourcePageId: WritingFoundationsSourcePageId;
  sourceHref: string;
  sourceTitle: string;
  learnerLessonId: string;
  learnerLessonTitle: string;
};

export type WritingFoundationsLessonTransformResult = {
  lessons: EnglishBuiltLesson[];
  sourceMap: WritingFoundationsLessonSourceMap[];
  css: string;
  runtime: string;
};

export type TransformWritingFoundationsLessonsInput = {
  lessons: readonly EnglishBuiltLesson[];
  sourcePageIds: readonly string[];
};

const BLOCKED_SUPPORT_PATTERN = /(?:teacherspayteachers\.com|slideshare\.net|owl\.english\.purdue\.edu\/owl\/resource\/606\/01|\.ppsx?(?:[?#]|$)|\/(?:slide|Slide)\d+\.jpe?g(?:[?#]|$))/i;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function textFromHtml(value: string) {
  const $ = cheerio.load(`<main>${value}</main>`);
  return $("main").text().replace(/\s+/g, " ").trim();
}

function approvedSupportingResources(resources: readonly EnglishSupportingResource[]) {
  const seen = new Set<string>();
  return resources.filter((resource) => {
    if (BLOCKED_SUPPORT_PATTERN.test(resource.href) || BLOCKED_SUPPORT_PATTERN.test(resource.title)) return false;
    const key = `${resource.href}\u0000${resource.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function namespaceSourceIds(html: string, namespace: string) {
  const $ = cheerio.load(`<main>${html}</main>`, null, false);
  const idMap = new Map<string, string>();

  $("main [id]").each((_index, element) => {
    const previous = $(element).attr("id")?.trim();
    if (!previous) return;
    const next = `${namespace}-${previous.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "source"}`;
    idMap.set(previous, next);
    $(element).attr("id", next);
  });

  const tokenAttributes = ["aria-controls", "aria-describedby", "aria-labelledby", "for", "headers"];
  tokenAttributes.forEach((attribute) => {
    $(`main [${attribute}]`).each((_index, element) => {
      const value = $(element).attr(attribute);
      if (!value) return;
      $(element).attr(attribute, value.split(/\s+/).map((token) => idMap.get(token) ?? token).join(" "));
    });
  });
  $("main a[href^='#']").each((_index, element) => {
    const href = $(element).attr("href");
    if (!href) return;
    const target = idMap.get(href.slice(1));
    if (target) $(element).attr("href", `#${target}`);
  });

  return $("main").html() ?? "";
}

function curatedWritingFoundationsSourceHtml(sourcePageId: WritingFoundationsSourcePageId) {
  const lessons: Record<WritingFoundationsSourcePageId, string> = {
    "3351": `<section class="wf-native-lesson">
      <p class="course-kicker">Writing Foundations</p>
      <h3>Build a paragraph one deliberate choice at a time</h3>
      <p>A clear paragraph is not produced in one pass. Writers choose a focus, plan how to develop it, draft complete sentences, and then revise so the reader can follow the idea without guessing.</p>
      <ol class="wf-process-list">
        <li><strong>Plan:</strong> identify the topic, purpose, audience, and controlling idea.</li>
        <li><strong>Draft:</strong> turn the plan into complete sentences without stopping to perfect every word.</li>
        <li><strong>Revise:</strong> improve the focus, support, explanation, order, and flow.</li>
        <li><strong>Edit:</strong> correct sentence boundaries, punctuation, capitalization, spelling, and usage.</li>
        <li><strong>Polish:</strong> read the paragraph again as a reader and prepare the final version.</li>
      </ol>
      <section class="wf-worked-example" aria-labelledby="wf-foundations-example-heading">
        <h4 id="wf-foundations-example-heading">Drafting changes the writing</h4>
        <p><strong>First thought:</strong> School clubs are good.</p>
        <p><strong>Focused idea:</strong> Joining a school club helps new students build confidence because it gives them a regular place to practise skills and meet people.</p>
        <p>The second version gives the paragraph a direction. Every supporting sentence can now be tested against that direction.</p>
      </section>
      <aside class="lesson-application"><strong>Use this unit as a reference</strong><p>Return to these lessons whenever another ELA assignment asks you to plan, draft, organize, or revise a paragraph.</p></aside>
    </section>`,
    "3352": `<section class="wf-native-lesson">
      <p class="course-kicker">Complete Sentences</p>
      <h3>Find the clauses before you fix the punctuation</h3>
      <p>A complete sentence expresses a complete thought through at least one independent clause. An independent clause contains a subject and a finite verb and can stand on its own.</p>
      <table class="wf-example-table">
        <thead><tr><th>Problem</th><th>Example</th><th>Why it fails</th><th>One repair</th></tr></thead>
        <tbody>
          <tr><th>Fragment</th><td>Because the bus was late.</td><td>The subordinating word leaves the thought unfinished.</td><td>Because the bus was late, Maya missed the opening announcement.</td></tr>
          <tr><th>Run-on</th><td>The bus arrived Maya found a seat.</td><td>Two independent clauses have no correct boundary.</td><td>The bus arrived, and Maya found a seat.</td></tr>
          <tr><th>Comma splice</th><td>The bus arrived, Maya found a seat.</td><td>A comma alone cannot join two independent clauses.</td><td>The bus arrived; Maya found a seat.</td></tr>
        </tbody>
      </table>
      <section class="wf-worked-example" aria-labelledby="wf-four-repairs-heading">
        <h4 id="wf-four-repairs-heading">Four reliable ways to repair a run-on</h4>
        <ol>
          <li>Separate the clauses with a period.</li>
          <li>Join closely related clauses with a semicolon.</li>
          <li>Use a comma plus a coordinating conjunction such as <em>and</em>, <em>but</em>, or <em>so</em>.</li>
          <li>Make one idea dependent with a subordinating word such as <em>because</em>, <em>although</em>, or <em>when</em>.</li>
        </ol>
        <p>Choose the repair that shows the relationship between the ideas; do not select punctuation at random.</p>
      </section>
      <aside class="wf-guided-practice">
        <div><h4>Guided practice</h4><p>Classify six sentence-boundary problems, repair each one, and check your decisions.</p></div>
        <a class="lesson-jump secondary" href="#sentence-lab" data-page-target="sentence-lab">Open sentence practice</a>
      </aside>
    </section>`,
    "3353": `<section class="wf-native-lesson">
      <p class="course-kicker">Topic Sentences and Paragraph Structure</p>
      <h3>Give the paragraph one clear direction</h3>
      <p>A topic names the general subject. A controlling idea narrows that subject and tells the reader what the paragraph will explain, show, or argue.</p>
      <table class="wf-example-table">
        <thead><tr><th>Version</th><th>Topic sentence</th><th>Result</th></tr></thead>
        <tbody>
          <tr><th>Too broad</th><td>Exercise is important.</td><td>The paragraph could move in many unrelated directions.</td></tr>
          <tr><th>Focused</th><td>A short walk after school can improve concentration by giving the mind a break before homework.</td><td>The subject, claim, and direction for support are clear.</td></tr>
          <tr><th>Announcement</th><td>This paragraph will be about exercise.</td><td>The sentence names a topic but does not make a meaningful point.</td></tr>
        </tbody>
      </table>
      <section class="wf-worked-example" aria-labelledby="wf-paragraph-parts-heading">
        <h4 id="wf-paragraph-parts-heading">A practical paragraph structure</h4>
        <ol>
          <li><strong>Topic sentence:</strong> state the focused main idea.</li>
          <li><strong>Support:</strong> provide a relevant fact, detail, example, observation, or quotation.</li>
          <li><strong>Explanation:</strong> show how the support develops the controlling idea.</li>
          <li><strong>Connection:</strong> use transitions and sentence order to guide the reader.</li>
          <li><strong>Concluding sentence:</strong> complete the idea without introducing a new topic.</li>
        </ol>
      </section>
      <aside class="lesson-application"><strong>Topic-sentence test</strong><p>Underline the topic and circle the controlling idea. If you cannot identify both, revise before drafting the supporting sentences.</p></aside>
      <p class="wf-reference-note">Optional reference: <a href="https://owl.purdue.edu/owl/general_writing/academic_writing/paragraphs_and_paragraphing/index.html" target="_blank" rel="noopener noreferrer">Purdue OWL: On Paragraphs</a>.</p>
    </section>`,
    "3354": `<section class="wf-native-lesson">
      <p class="course-kicker">Paragraph Planning Model</p>
      <h3>Hamburger</h3>
      <p>The hamburger model places a focused topic sentence at the top, substantial support and explanation in the middle, and a concluding sentence at the bottom.</p>
      <figure class="wf-model-diagram wf-hamburger-diagram" aria-labelledby="hamburger-source-caption">
        <div class="wf-hamburger-bun">Topic sentence</div>
        <div class="wf-hamburger-filling">Detail or evidence</div>
        <div class="wf-hamburger-filling">Explanation</div>
        <div class="wf-hamburger-bun">Concluding sentence</div>
        <figcaption id="hamburger-source-caption">The opening and conclusion hold together substantial supporting detail and explanation.</figcaption>
      </figure>
    </section>`,
    "3355": `<section class="wf-native-lesson">
      <p class="course-kicker">Paragraph Planning Model</p>
      <h3>Graphic Organizer</h3>
      <p>A graphic organizer places the main idea at the centre and makes the relationships among support, explanation, and the concluding insight visible.</p>
      <figure class="wf-model-diagram wf-graphic-diagram" aria-labelledby="graphic-source-caption">
        <div class="wf-graphic-main">Main idea</div>
        <div class="wf-graphic-support">Support 1</div>
        <div class="wf-graphic-support">Support 2</div>
        <div class="wf-graphic-support">Explanation</div>
        <div class="wf-graphic-conclusion">Concluding insight</div>
        <figcaption id="graphic-source-caption">Each supporting part connects back to one focused main idea.</figcaption>
      </figure>
    </section>`,
    "3356": `<section class="wf-native-lesson">
      <p class="course-kicker">Paragraph Planning Model</p>
      <h3>PEEL</h3>
      <p>PEEL keeps the paragraph's reasoning visible from its first claim to its final connection.</p>
      <figure class="wf-model-diagram wf-peel-diagram" aria-labelledby="peel-source-caption">
        <div><strong>P</strong><span>Point</span></div>
        <div><strong>E</strong><span>Evidence</span></div>
        <div><strong>E</strong><span>Explanation</span></div>
        <div><strong>L</strong><span>Link</span></div>
        <figcaption id="peel-source-caption">Make a point, support it with evidence, explain the connection, and link the paragraph to the larger idea.</figcaption>
      </figure>
    </section>`,
    "3357": `<section class="wf-native-lesson">
      <p class="course-kicker">Unity, Coherence, and Transitions</p>
      <h3>Make the path of the paragraph visible</h3>
      <p><strong>Unity</strong> means that every sentence develops the same controlling idea. <strong>Coherence</strong> means that the relationship among those sentences is clear to the reader.</p>
      <section class="english-writing-panel critical-writing-panel">
        <h4>Choose an organizing principle</h4>
        <ul>
          <li><strong>Chronological:</strong> arrange events or steps in time order.</li>
          <li><strong>Spatial:</strong> move through a place in a consistent direction.</li>
          <li><strong>General to specific:</strong> begin with the main idea, then add increasingly precise details.</li>
          <li><strong>Cause and effect:</strong> make the relationship between reasons and results clear.</li>
          <li><strong>Compare and contrast:</strong> group similarities and differences deliberately.</li>
        </ul>
      </section>
      <section class="wf-worked-example" aria-labelledby="wf-transition-bridges-heading">
        <h4 id="wf-transition-bridges-heading">Build bridges, not a list of transition words</h4>
        <p>Readers follow repeated key terms, clear pronoun references, parallel sentence patterns, and transitions that name a relationship.</p>
        <p><strong>Weak:</strong> The garden supports pollinators. Also, students measure plant growth.</p>
        <p><strong>Clearer:</strong> In addition to supporting pollinators, the garden gives students a place to measure how light and water affect plant growth.</p>
      </section>
      <aside class="wf-guided-practice">
        <div><h4>Guided practice</h4><p>Reorder the bee paragraph, identify its structural parts, and explain why the revised sequence is coherent.</p></div>
        <a class="lesson-jump secondary" href="#organization-lab" data-page-target="organization-lab">Open coherence practice</a>
      </aside>
      <p class="wf-reference-note">Optional reference: <a href="https://owl.purdue.edu/owl/general_writing/academic_writing/paragraphs_and_paragraphing/index.html" target="_blank" rel="noopener noreferrer">Purdue OWL: On Paragraphs</a>.</p>
    </section>`
  };
  return lessons[sourcePageId];
}

function supportingDetailsLessonHtml() {
  return `<section class="wf-native-lesson">
    <p class="course-kicker">Supporting Details and Development</p>
    <h3>Move from a point to a developed idea</h3>
    <p>A topic sentence makes a promise. The rest of the paragraph fulfils that promise with relevant support and explanation.</p>
    <section class="wf-worked-example" aria-labelledby="wf-development-example-heading">
      <h4 id="wf-development-example-heading">Support is not the same as explanation</h4>
      <p><strong>Point:</strong> A short walk after school can improve concentration before homework.</p>
      <p><strong>Support:</strong> The walk separates the school day from the next period of focused work and briefly changes the student's surroundings.</p>
      <p><strong>Explanation:</strong> That change of pace can reduce mental fatigue, making it easier to return to a demanding task with sustained attention.</p>
      <p><strong>Connection:</strong> For this reason, even a brief routine can prepare a student to work more deliberately.</p>
    </section>
    <table class="wf-example-table">
      <thead><tr><th>Development method</th><th>Useful when you need to…</th></tr></thead>
      <tbody>
        <tr><th>Example or illustration</th><td>Show what the idea looks like in a specific situation.</td></tr>
        <tr><th>Fact or detail</th><td>Give the reader precise information rather than a broad claim.</td></tr>
        <tr><th>Definition</th><td>Clarify an important or unfamiliar term.</td></tr>
        <tr><th>Comparison</th><td>Make a quality easier to understand by placing it beside another example.</td></tr>
        <tr><th>Cause and effect</th><td>Explain why something happens or what follows from it.</td></tr>
      </tbody>
    </table>
    <aside class="lesson-application"><strong>Development check</strong><p>After every example or detail, ask: “What does this show, and why does it matter to my controlling idea?”</p></aside>
  </section>`;
}

function revisionLessonHtml() {
  return `<section class="wf-native-lesson">
    <p class="course-kicker">Revise, Edit, and Polish</p>
    <h3>Improve meaning before correcting the surface</h3>
    <p>Revision and editing are different jobs. Revision changes what the paragraph communicates; editing corrects how the final version is presented.</p>
    <div class="wf-revision-columns">
      <section>
        <h4>Revise first</h4>
        <ul>
          <li>Confirm that the topic sentence states one focused controlling idea.</li>
          <li>Remove sentences that do not develop that idea.</li>
          <li>Add support where a claim is broad or unproven.</li>
          <li>Explain why each detail matters.</li>
          <li>Reorder sentences and strengthen transitions.</li>
          <li>End by completing the idea rather than adding a new point.</li>
        </ul>
      </section>
      <section>
        <h4>Edit second</h4>
        <ul>
          <li>Check every sentence for a subject, verb, and complete thought.</li>
          <li>Repair fragments, run-ons, and comma splices.</li>
          <li>Check punctuation, capitalization, spelling, and commonly confused words.</li>
          <li>Keep joined words, phrases, and clauses parallel.</li>
          <li>Read the paragraph aloud to catch missing or repeated words.</li>
        </ul>
      </section>
    </div>
    <section class="wf-worked-example" aria-labelledby="wf-revision-example-heading">
      <h4 id="wf-revision-example-heading">One useful revision routine</h4>
      <ol>
        <li>Read once for the main idea.</li>
        <li>Read again for support and explanation.</li>
        <li>Read a third time for order and transitions.</li>
        <li>Edit sentence boundaries and conventions only after the meaning is sound.</li>
      </ol>
    </section>
    <aside class="wf-guided-practice">
      <div><h4>Final application</h4><p>Draft or paste one paragraph, revise it with the checklist, and save the polished version with a short reflection.</p></div>
      <a class="lesson-jump primary" href="#final-paragraph" data-page-target="final-paragraph">Open final paragraph</a>
    </aside>
  </section>`;
}

function normalizeLesson(lesson: EnglishBuiltLesson, sourcePageId: WritingFoundationsSourcePageId): EnglishBuiltLesson {
  // The allowlisted legacy pages remain the instructional source and are
  // accounted for in the mapping report, while learner output is re-authored
  // natively so obsolete LMS directions and inaccessible image/slideshow
  // dependencies cannot leak back into a rebuild.
  const html = namespaceSourceIds(curatedWritingFoundationsSourceHtml(sourcePageId), `wf-source-${sourcePageId}`);
  return {
    ...lesson,
    html,
    text: textFromHtml(html),
    supportingResources: approvedSupportingResources(lesson.supportingResources).map((resource) => ({ ...resource }))
  };
}

function renderPlanningModelTabs(input: {
  blueprintId: string;
  sourceLessons: Array<{ sourcePageId: WritingFoundationsSourcePageId; lesson: EnglishBuiltLesson }>;
  tabLabels: string[];
}) {
  const tabs = input.sourceLessons.map(({ sourcePageId }, index) => {
    const tabId = `${input.blueprintId}-source-tab-${sourcePageId}`;
    const panelId = `${input.blueprintId}-source-panel-${sourcePageId}`;
    return `<button type="button" id="${escapeHtml(tabId)}" role="tab" aria-controls="${escapeHtml(panelId)}" aria-selected="${index === 0 ? "true" : "false"}" tabindex="${index === 0 ? "0" : "-1"}" data-wf-source-tab>${escapeHtml(input.tabLabels[index] ?? `Planning Model ${index + 1}`)}</button>`;
  }).join("");

  const panels = input.sourceLessons.map(({ sourcePageId, lesson }, index) => {
    const tabId = `${input.blueprintId}-source-tab-${sourcePageId}`;
    const panelId = `${input.blueprintId}-source-panel-${sourcePageId}`;
    return `<section id="${escapeHtml(panelId)}" class="wf-source-tab-panel" role="tabpanel" aria-labelledby="${escapeHtml(tabId)}" data-wf-source-panel${index === 0 ? "" : " hidden"}>
      ${lesson.html}
    </section>`;
  }).join("");

  return `<section class="wf-native-lesson">
    <p class="course-kicker">Paragraph Planning Models</p>
    <h3>Choose a model that makes your thinking visible</h3>
    <p>Each model organizes the same essential parts in a different way. Use the one that helps you see the relationship among your point, support, explanation, and conclusion.</p>
    <section class="wf-source-tab-workbench" data-wf-source-tabs>
    <div class="wf-source-tab-list" role="tablist" aria-label="Paragraph planning models">${tabs}</div>
    <div class="wf-source-tab-panels">${panels}</div>
    </section>
    <aside class="wf-guided-practice">
      <div><h4>Guided practice</h4><p>Try the same paragraph idea in Hamburger, Graphic Organizer, or PEEL form. Each plan saves separately.</p></div>
      <a class="lesson-jump secondary" href="#paragraph-builder" data-page-target="paragraph-builder">Open paragraph planner</a>
    </aside>
  </section>`;
}

/**
 * Converts the strict seven-page ELA 10-2 Writing Foundations intake into the
 * seven learner lessons declared by WRITING_FOUNDATIONS_LESSON_BLUEPRINTS.
 * Source pages are matched by the explicit manifest-order page-id list rather
 * than inferred from titles, so intake drift fails before learner output is
 * produced.
 */
export function transformWritingFoundationsLessons(
  input: TransformWritingFoundationsLessonsInput
): WritingFoundationsLessonTransformResult {
  assertWritingFoundationsSourcePageIds(input.sourcePageIds);
  if (input.lessons.length !== input.sourcePageIds.length) {
    throw new Error(
      `Writing Foundations received ${input.lessons.length} loaded lessons for ${input.sourcePageIds.length} allowlisted source pages.`
    );
  }

  const sourceLessons = input.sourcePageIds.map((sourcePageId, index) => ({
    sourcePageId: sourcePageId as WritingFoundationsSourcePageId,
    lesson: normalizeLesson(input.lessons[index]!, sourcePageId as WritingFoundationsSourcePageId)
  }));
  const sourceByPageId = new Map(sourceLessons.map((entry) => [entry.sourcePageId, entry.lesson]));

  const lessons = WRITING_FOUNDATIONS_LESSON_BLUEPRINTS.map((blueprint, index): EnglishBuiltLesson => {
    const selected = blueprint.sourcePageIds.map((sourcePageId) => {
      const lesson = sourceByPageId.get(sourcePageId);
      if (!lesson) throw new Error(`Writing Foundations source page ${sourcePageId} was not loaded.`);
      return { sourcePageId, lesson };
    });
    const supportingResources = approvedSupportingResources(selected.flatMap(({ lesson }) => lesson.supportingResources))
      .map((resource) => ({ ...resource, lessonTitle: blueprint.label }));
    const html = blueprint.id === "supporting-details-development"
      ? supportingDetailsLessonHtml()
      : blueprint.id === "revise-edit-polish"
        ? revisionLessonHtml()
        : blueprint.presentation === "tabs"
        ? renderPlanningModelTabs({
          blueprintId: blueprint.id,
          sourceLessons: selected,
          tabLabels: blueprint.tabLabels ?? []
        })
        : selected[0]!.lesson.html;

    return {
      id: `lesson-${index + 1}-${blueprint.id}`,
      title: blueprint.label,
      sourceHref: selected.map(({ lesson }) => lesson.sourceHref).join(" | "),
      html,
      text: textFromHtml(html),
      supportingResources
    };
  });

  const learnerBySourceId = new Map<WritingFoundationsSourcePageId, { id: string; title: string }>();
  WRITING_FOUNDATIONS_LESSON_BLUEPRINTS.forEach((blueprint, index) => {
    blueprint.sourcePageIds.forEach((sourcePageId) => {
      if (!learnerBySourceId.has(sourcePageId)) {
        learnerBySourceId.set(sourcePageId, { id: lessons[index]!.id, title: blueprint.label });
      }
    });
  });
  const sourceMap = sourceLessons.map(({ sourcePageId, lesson }) => {
    const learner = learnerBySourceId.get(sourcePageId);
    if (!learner) throw new Error(`Writing Foundations source page ${sourcePageId} has no learner lesson mapping.`);
    return {
      sourcePageId,
      sourceHref: lesson.sourceHref,
      sourceTitle: lesson.title,
      learnerLessonId: learner.id,
      learnerLessonTitle: learner.title
    };
  });

  return {
    lessons,
    sourceMap,
    css: WRITING_FOUNDATIONS_LESSON_TABS_CSS,
    runtime: WRITING_FOUNDATIONS_LESSON_TABS_RUNTIME
  };
}

export function installWritingFoundationsLessonTabs(rootDocument: Document) {
  rootDocument.querySelectorAll<HTMLElement>("[data-wf-source-tabs]").forEach((tabSet) => {
    const tabs = Array.from(tabSet.querySelectorAll<HTMLButtonElement>("[data-wf-source-tab]"));
    const panels = Array.from(tabSet.querySelectorAll<HTMLElement>("[data-wf-source-panel]"));
    if (!tabs.length || tabs.length !== panels.length) return;

    const activate = (nextIndex: number, moveFocus: boolean) => {
      const boundedIndex = (nextIndex + tabs.length) % tabs.length;
      tabs.forEach((tab, index) => {
        const active = index === boundedIndex;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[index]!.hidden = !active;
      });
      if (moveFocus) tabs[boundedIndex]!.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(index, false));
      tab.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          activate(index + 1, true);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          activate(index - 1, true);
        } else if (event.key === "Home") {
          event.preventDefault();
          activate(0, true);
        } else if (event.key === "End") {
          event.preventDefault();
          activate(tabs.length - 1, true);
        }
      });
    });

    const selectedIndex = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    activate(selectedIndex >= 0 ? selectedIndex : 0, false);
  });
}

export const WRITING_FOUNDATIONS_LESSON_TABS_RUNTIME = `(function(){const __name=function(target){return target;};(${installWritingFoundationsLessonTabs.toString()})(document);})();`;

export const WRITING_FOUNDATIONS_LESSON_TABS_CSS = `
.wf-native-lesson > :first-child { margin-top: 0; }
.wf-native-lesson > :last-child { margin-bottom: 0; }

.wf-process-list,
.wf-native-lesson ol,
.wf-native-lesson ul {
  padding-left: 24px;
}

.wf-process-list li,
.wf-native-lesson li {
  margin: 8px 0;
}

.wf-worked-example,
.wf-revision-columns > section {
  margin-top: 20px;
  border: 1px solid #d8ddd7;
  background: #f7f8f5;
  padding: 18px;
}

.wf-worked-example h4,
.wf-revision-columns h4,
.wf-guided-practice h4 {
  margin: 0 0 8px;
}

.wf-worked-example p:last-child,
.wf-guided-practice p {
  margin-bottom: 0;
}

.wf-example-table {
  display: block;
  width: 100%;
  margin: 20px 0;
  overflow-x: auto;
  border-collapse: collapse;
}

.wf-example-table th,
.wf-example-table td {
  min-width: 150px;
  border: 1px solid #d8ddd7;
  padding: 12px;
  text-align: left;
  vertical-align: top;
}

.wf-example-table thead th {
  background: #eef1ec;
  color: #252a25;
}

.wf-example-table tbody th {
  color: #154212;
}

.wf-guided-practice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 22px;
  border-top: 1px solid #c7cec5;
  border-bottom: 1px solid #c7cec5;
  padding: 16px 0;
}

.wf-guided-practice .lesson-jump {
  flex: 0 0 auto;
}

.wf-reference-note {
  margin-top: 18px;
  color: #4b554b;
  font-size: 14px;
}

.wf-reference-note a {
  color: #154212;
  font-weight: 700;
}

.wf-revision-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.wf-revision-columns > section {
  margin-top: 8px;
}

.wf-source-tab-workbench {
  margin-top: 20px;
  border: 1px solid #d8ddd7;
  background: #fff;
}

.wf-source-tab-list {
  display: flex;
  gap: 0;
  overflow-x: auto;
  border-bottom: 1px solid #c7cec5;
  background: #f7f8f5;
}

.wf-source-tab-list [role="tab"] {
  flex: 1 0 180px;
  min-height: 48px;
  padding: 12px 16px 10px;
  border: 0;
  border-right: 1px solid #d8ddd7;
  border-bottom: 3px solid transparent;
  border-radius: 0;
  background: transparent;
  color: #252a25;
  font: inherit;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.wf-source-tab-list [role="tab"]:last-child { border-right: 0; }
.wf-source-tab-list [role="tab"][aria-selected="true"] {
  border-bottom-color: #154212;
  background: #fff;
  color: #154212;
}
.wf-source-tab-list [role="tab"]:focus-visible {
  position: relative;
  z-index: 1;
  outline: 3px solid #71906e;
  outline-offset: -3px;
}

.wf-source-tab-panel { padding: 24px; }
.wf-source-tab-panel[hidden] { display: none !important; }

@media (max-width: 680px) {
  .wf-guided-practice {
    align-items: stretch;
    flex-direction: column;
  }
  .wf-guided-practice .lesson-jump { width: 100%; }
  .wf-revision-columns { grid-template-columns: 1fr; }
  .wf-source-tab-list { display: grid; grid-template-columns: 1fr; }
  .wf-source-tab-list [role="tab"] {
    min-height: 44px;
    border-right: 0;
    border-bottom: 1px solid #d8ddd7;
  }
  .wf-source-tab-list [role="tab"][aria-selected="true"] {
    border-left: 4px solid #154212;
    border-bottom-color: #d8ddd7;
  }
  .wf-source-tab-panel { padding: 18px; }
}
`;
