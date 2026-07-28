import assert from "node:assert/strict";
import test from "node:test";

import { englishE2EContractInternals } from "./e2e-contract.js";

test("English learner E2E contracts are derived from rendered routes and activity hooks", () => {
  const contract = englishE2EContractInternals.learnerContractFromHtml("ela10-test", `<!doctype html><html><body>
    <section id="overview" class="course-page"></section>
    <section id="lesson-1-reading" class="course-page"><object class="source-pdf-frame" data="lesson.pdf" aria-label="Reading lesson"></object><a href="lesson.pdf" download>Download</a></section>
    <section id="questions" class="course-page">
      <div data-evidence-collection-id="ela10-test:questions:collection">
        <button data-worksheet-toggle-hints aria-pressed="false">Show Hints</button><p data-question-hint hidden>Hint</p>
        <button data-worksheet-print>Print / PDF</button>
        <textarea data-response-id="ela10-test:questions:one"></textarea>
        <button data-save-response-collection>Save</button>
      </div>
    </section>
    <section id="evidence-bank" class="course-page"></section>
  </body></html>`);

  assert.deepEqual(contract.routes, ["overview", "lesson-1-reading", "questions", "evidence-bank"]);
  assert.deepEqual(contract.hintRoutes, ["questions"]);
  assert.deepEqual(contract.printRoutes, ["questions"]);
  assert.deepEqual(contract.evidenceScenario, {
    route: "questions",
    collectionId: "ela10-test:questions:collection",
    responseId: "ela10-test:questions:one"
  });
  assert.deepEqual(contract.resourceChecks, [{ route: "lesson-1-reading", kind: "document-reader", minimumPrimary: 1, minimumFallback: 1 }]);
  assert.deepEqual(contract.mobile.routes, ["overview", "lesson-1-reading", "questions", "evidence-bank"]);
});

test("English learner E2E contracts keep one representative evidence scenario per activity source", () => {
  const contract = englishE2EContractInternals.learnerContractFromHtml("ela20-film", `<!doctype html><html><body>
    <section id="overview" class="course-page"></section>
    <section id="lesson-1-film" class="course-page"><video data-local-course-video src="film.mp4"></video><a href="film.mp4">Open film</a></section>
    <section id="critical-essay-topic" class="course-page">
      <div data-evidence-source="Film | Critical Essay" data-evidence-collection-id="ela20-film:critical-essay:topic:collection">
        <button data-worksheet-toggle-hints>Show Hints</button><p data-question-hint hidden>Hint</p>
        <button data-worksheet-print>Print</button>
        <select data-response-id="ela20-film:critical-essay:selected-work"><option>Film</option></select>
        <textarea data-response-id="ela20-film:critical-essay:topic"></textarea>
        <button data-save-response-collection>Save</button>
      </div>
    </section>
    <section id="critical-essay-introduction" class="course-page">
      <div data-evidence-source="Film | Critical Essay" data-evidence-collection-id="ela20-film:critical-essay:introduction:collection">
        <textarea data-response-id="ela20-film:critical-essay:introduction"></textarea>
        <button data-save-response-collection>Save</button>
      </div>
    </section>
    <section id="personal-response-prompt" class="course-page">
      <div data-evidence-source="Film | Personal Response" data-evidence-collection-id="ela20-film:personal-response:prompt:collection">
        <button data-worksheet-toggle-hints>Show Hints</button><p data-question-hint hidden>Hint</p>
        <button data-worksheet-print>Print</button>
        <textarea data-response-id="ela20-film:personal-response:prompt"></textarea>
        <button data-save-response-collection>Save</button>
      </div>
    </section>
    <section id="evidence-bank" class="course-page"></section>
  </body></html>`);

  assert.equal("evidenceScenario" in contract, false);
  assert.deepEqual(contract.evidenceScenarios, [
    {
      route: "critical-essay-topic",
      collectionId: "ela20-film:critical-essay:topic:collection",
      responseId: "ela20-film:critical-essay:topic"
    },
    {
      route: "personal-response-prompt",
      collectionId: "ela20-film:personal-response:prompt:collection",
      responseId: "ela20-film:personal-response:prompt"
    }
  ]);
  assert.deepEqual(contract.mobile.routes, [
    "overview",
    "lesson-1-film",
    "critical-essay-topic",
    "personal-response-prompt",
    "evidence-bank"
  ]);
});

test("English learner E2E contracts allow interaction-only units without a reader or access notice", () => {
  const contract = englishE2EContractInternals.learnerContractFromHtml("ela10-writing-foundations", `<!doctype html><html><body>
    <section id="overview" class="course-page"></section>
    <section id="lesson-1-writing-foundations" class="course-page"></section>
    <section id="sentence-lab" class="course-page">
      <div data-evidence-source="Sentence Lab" data-evidence-collection-id="ela10-writing-foundations:sentence-lab:collection">
        <button data-worksheet-toggle-hints>Show Hints</button><p data-question-hint hidden>Hint</p>
        <button data-worksheet-print>Print</button>
        <textarea data-response-id="ela10-writing-foundations:sentence-lab:repair"></textarea>
        <button data-save-response-collection>Save</button>
      </div>
    </section>
    <section id="evidence-bank" class="course-page"></section>
  </body></html>`);

  assert.deepEqual(contract.resourceChecks, []);
  assert.deepEqual(contract.mobile.routes, [
    "overview",
    "lesson-1-writing-foundations",
    "sentence-lab",
    "evidence-bank"
  ]);
});

test("English learner E2E contracts recognize the short-fiction reader and fullscreen fallback", () => {
  const contract = englishE2EContractInternals.learnerContractFromHtml("ela20-short-fiction", `<!doctype html><html><body>
    <section id="overview" class="course-page"></section>
    <section id="story-bank" class="course-page">
      <iframe class="short-fiction-reader-frame" src="story.pdf"></iframe>
      <button data-short-fiction-fullscreen-src="story.pdf">Full Screen</button>
    </section>
    <section id="story-questions" class="course-page">
      <div data-evidence-source="Story Questions" data-evidence-collection-id="ela20-short-fiction:story:collection">
        <button data-worksheet-toggle-hints>Show Hints</button><p data-question-hint hidden>Hint</p>
        <button data-worksheet-print>Print</button>
        <textarea data-response-id="ela20-short-fiction:story:answer"></textarea>
        <button data-save-response-collection>Save</button>
      </div>
    </section>
    <section id="evidence-bank" class="course-page"></section>
  </body></html>`);

  assert.deepEqual(contract.resourceChecks, [
    { route: "story-bank", kind: "document-reader", minimumPrimary: 1, minimumFallback: 1 }
  ]);
});

test("English learner E2E contracts activate a hidden workbook panel before exercising its collection", () => {
  const contract = englishE2EContractInternals.learnerContractFromHtml("ela10-shakespeare", `<!doctype html><html><body>
    <section id="overview" class="course-page"></section>
    <section id="lesson-1" class="course-page"><object class="source-pdf-frame" data="lesson.pdf"></object><a href="lesson.pdf" download>Download</a></section>
    <section id="writing-studio" class="course-page">
      <select data-english-activity-select="ela10-shakespeare:writing:tools">
        <option value="language-lab">Language Lab</option>
        <option value="critical-essay">Critical Essay Planner</option>
      </select>
      <article data-english-activity-panel-group="ela10-shakespeare:writing:tools" data-english-activity-panel="language-lab">
        <button data-worksheet-toggle-hints>Show Hints</button><p data-question-hint hidden>Hint</p>
        <button data-worksheet-print>Print</button>
      </article>
      <article hidden data-english-activity-panel-group="ela10-shakespeare:writing:tools" data-english-activity-panel="critical-essay" data-evidence-source="Writing Studio" data-evidence-collection-id="ela10-shakespeare:writing:critical-essay:collection">
        <button data-worksheet-toggle-hints>Show Hints</button><p data-question-hint hidden>Hint</p>
        <button data-worksheet-print>Print</button>
        <textarea data-response-id="ela10-shakespeare:writing:critical-essay:topic"></textarea>
        <button data-save-response-collection>Save</button>
      </article>
    </section>
    <section id="evidence-bank" class="course-page"></section>
  </body></html>`);

  assert.deepEqual(contract.evidenceScenario, {
    route: "writing-studio",
    collectionId: "ela10-shakespeare:writing:critical-essay:collection",
    responseId: "ela10-shakespeare:writing:critical-essay:topic",
    activateSelector: '[data-english-activity-select="ela10-shakespeare:writing:tools"] option[value="critical-essay"]'
  });
});

test("English learner E2E contracts activate the exact writing track before exercising its collection", () => {
  const contract = englishE2EContractInternals.learnerContractFromHtml("ela20-short-stories", `<!doctype html><html><body>
    <section id="overview" class="course-page"></section>
    <section id="lesson-1" class="course-page"><object class="source-pdf-frame" data="lesson.pdf"></object><a href="lesson.pdf" download>Download</a></section>
    <section id="critical-essay-topic" class="course-page">
      <button data-english-writing-toggle-hints>Show Hints</button><p data-english-writing-hint hidden>Hint</p>
      <button data-english-writing-print>Print</button>
      <select data-english-writing-track-select="ela20-short-stories:critical-essay">
        <option value="lamp-at-noon">The Lamp at Noon</option>
        <option value="sea-devil">The Sea Devil</option>
      </select>
      <article data-english-writing-track-panel="ela20-short-stories:critical-essay" data-english-writing-track-id="lamp-at-noon"
        data-evidence-source="The Lamp at Noon | Critical Essay"
        data-evidence-collection-id="ela20-short-stories:critical-essay:lamp-at-noon:topic:collection">
        <textarea data-response-id="ela20-short-stories:critical-essay:lamp-at-noon:topic:claim"></textarea>
        <button data-save-response-collection>Save</button>
      </article>
      <article hidden data-english-writing-track-panel="ela20-short-stories:critical-essay" data-english-writing-track-id="sea-devil"
        data-evidence-source="The Sea Devil | Critical Essay"
        data-evidence-collection-id="ela20-short-stories:critical-essay:sea-devil:topic:collection">
        <textarea data-response-id="ela20-short-stories:critical-essay:sea-devil:topic:claim"></textarea>
        <button data-save-response-collection>Save</button>
      </article>
    </section>
    <section id="critical-essay-introduction" class="course-page">
      <button data-english-writing-toggle-hints>Show Hints</button><p data-english-writing-hint hidden>Hint</p>
      <button data-english-writing-print>Print</button>
      <select data-english-writing-track-select="ela20-short-stories:critical-essay">
        <option value="lamp-at-noon">The Lamp at Noon</option>
        <option value="sea-devil">The Sea Devil</option>
      </select>
      <article data-english-writing-track-panel="ela20-short-stories:critical-essay" data-english-writing-track-id="lamp-at-noon"
        data-evidence-source="The Lamp at Noon | Critical Essay"
        data-evidence-collection-id="ela20-short-stories:critical-essay:lamp-at-noon:introduction:collection">
        <textarea data-response-id="ela20-short-stories:critical-essay:lamp-at-noon:introduction:opening"></textarea>
        <button data-save-response-collection>Save</button>
      </article>
      <article hidden data-english-writing-track-panel="ela20-short-stories:critical-essay" data-english-writing-track-id="sea-devil"
        data-evidence-source="The Sea Devil | Critical Essay"
        data-evidence-collection-id="ela20-short-stories:critical-essay:sea-devil:introduction:collection">
        <textarea data-response-id="ela20-short-stories:critical-essay:sea-devil:introduction:opening"></textarea>
        <button data-save-response-collection>Save</button>
      </article>
    </section>
    <section id="evidence-bank" class="course-page"></section>
  </body></html>`);

  assert.deepEqual(contract.evidenceScenarios, [
    {
      route: "critical-essay-topic",
      collectionId: "ela20-short-stories:critical-essay:lamp-at-noon:topic:collection",
      responseId: "ela20-short-stories:critical-essay:lamp-at-noon:topic:claim",
      activateSelector: '[data-english-writing-track-select="ela20-short-stories:critical-essay"] option[value="lamp-at-noon"]'
    },
    {
      route: "critical-essay-introduction",
      collectionId: "ela20-short-stories:critical-essay:sea-devil:introduction:collection",
      responseId: "ela20-short-stories:critical-essay:sea-devil:introduction:opening",
      activateSelector: '[data-english-writing-track-select="ela20-short-stories:critical-essay"] option[value="sea-devil"]'
    }
  ]);
});
