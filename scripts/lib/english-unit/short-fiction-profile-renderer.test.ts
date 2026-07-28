import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";

import * as cheerio from "cheerio";

import {
  DEFAULT_SHORT_FICTION_ANALYSIS_TERMS,
  SHORT_FICTION_PROFILE_CSS,
  SHORT_FICTION_PROFILE_RUNTIME,
  renderShortFictionProfile,
  type RenderShortFictionProfileInput
} from "./short-fiction-profile-renderer.js";

function fixture(overrides: Partial<RenderShortFictionProfileInput> = {}) {
  return renderShortFictionProfile({
    namespace: "ela20-2-short-stories",
    courseCode: "ELA 20-2",
    unitTitle: "Short Stories",
    works: [
      {
        id: "lamp-at-noon",
        title: "The Lamp at Noon",
        author: "Sinclair Ross",
        group: "Short Fiction",
        readingHref: "resources/lamp-at-noon.pdf",
        downloadHref: "resources/lamp-at-noon.pdf",
        questionSourceHref: "resources/lamp-at-noon-questions.pdf",
        questions: [
          { id: "setting-pressure", prompt: "How does the setting place pressure on Paul and Ellen?", hint: "Use one precise setting detail." },
          { id: "irony", prompt: "What irony develops through their argument?" }
        ],
        analysisExamples: {
          irony: [{ evidence: "The lamp remains lit at noon.", analysis: "The unnecessary light sharpens the contrast between hope and the surrounding darkness.", locator: "opening scene" }]
        }
      },
      {
        id: "do-not-fall",
        title: "Do Not Fall in New York City",
        group: "Visual Narrative",
        kind: "visual-narrative",
        questions: [
          { id: "panel-choice", prompt: "How does one panel or visual choice develop the central idea?" }
        ],
        analysisExamples: {
          symbolism: [{ evidence: "A repeated falling image", analysis: "The repeated image turns physical danger into a pattern of emotional risk." }]
        }
      }
    ],
    resources: [
      {
        id: "reading-strategies",
        title: "Reading Strategies",
        kind: "document",
        description: "Teacher-selected support.",
        href: "resources/reading-strategies.pdf",
        downloadable: true
      },
      {
        id: "internal-note",
        title: "Internal Mapping Note",
        kind: "document",
        href: "resources/internal-note.pdf",
        learnerFacing: false
      }
    ],
    ...overrides
  });
}

function allPages(output = fixture()) {
  return cheerio.load(output.pages.map((page) => page.html).join("\n"));
}

function page(output: ReturnType<typeof fixture>, id: string) {
  const found = output.pages.find((candidate) => candidate.id === id);
  assert.ok(found, `Expected page ${id}`);
  return cheerio.load(found.html);
}

test("short-fiction profile renders donor-compatible pages without writing-form routes", () => {
  const output = fixture();
  assert.equal(output.kind, "short-fiction");
  assert.deepEqual(output.pages.map((candidate) => candidate.id), ["story-bank", "story-questions", "writing-studio"]);
  assert.deepEqual(output.navGroups, []);
  assert.deepEqual(output.contract, {
    schemaVersion: 1,
    namespace: "ela20-2-short-stories",
    materialsRoute: "story-bank",
    workIds: ["lamp-at-noon", "do-not-fall"],
    questionCounts: { "lamp-at-noon": 2, "do-not-fall": 1 },
    responseIdPrefixes: {
      "lamp-at-noon": "ela20-2-short-stories:short-fiction:story-questions:lamp-at-noon",
      "do-not-fall": "ela20-2-short-stories:short-fiction:story-questions:do-not-fall"
    },
    visualLiteracy: false
  });

  const $ = allPages(output);
  assert.equal($("section.course-page").length, 3);
  assert.equal($("section.course-page.english-activity-page").length, 3, "shared hint and scoped-print runtime can discover each page");
  assert.equal($("#story-bank").length, 1);
  assert.equal($("#story-questions").length, 1);
  assert.equal($("#writing-studio").length, 1);
  assert.equal($("#critical-essay, #personal-response, #visual-response").length, 0);
  assert.doesNotMatch($.html(), /data-(?:critical-essay|personal-response|visual-response)/);
});

test("Text Bank exposes per-work readers, truthful access fallback, and expected document actions", () => {
  const output = fixture();
  const $ = page(output, "story-bank");
  assert.equal($("[data-english-activity-select]").length, 1);
  assert.equal($("[data-short-fiction-work-button]").length, 2);
  assert.equal($("[data-english-activity-panel-group]").length, 2);
  assert.equal($("iframe.short-fiction-reader-frame").length, 1);
  assert.equal($("[data-short-fiction-fullscreen-src]").length, 1);
  assert.equal($("a[download]").length, 1);
  assert.equal($("a[href='resources/lamp-at-noon-questions.pdf']").length, 1);
  assert.match($.text(), /Use the assigned copy of Do Not Fall in New York City/);
  assert.match($.text(), /teacher-provided or school-licensed copy/);
  assert.equal($("[data-short-fiction-reader-overlay]").length, 1);
});

test("Story Questions keep one stable autosaved response collection per work", () => {
  const output = fixture();
  const $ = page(output, "story-questions");
  assert.equal($("[data-english-activity-select]").length, 1);
  assert.equal($("[data-question-panel]").length, 2);
  assert.equal($("[data-activity-response]").length, 3);
  assert.equal($("textarea[data-response-id]").length, 3);
  assert.equal($("[data-question-hint]").length, 3);
  assert.equal($("[data-worksheet-toggle-hints]").length, 2);
  assert.equal($("[data-worksheet-print]").length, 2);
  assert.equal($("[data-save-response-collection]").length, 2);
  assert.deepEqual(
    $("[data-evidence-collection-id]").map((_index, element) => $(element).attr("data-evidence-collection-id")).get(),
    [
      "ela20-2-short-stories:short-fiction:story-questions:lamp-at-noon:collection",
      "ela20-2-short-stories:short-fiction:story-questions:do-not-fall:collection"
    ]
  );
  const responseIds = $("textarea[data-response-id]").map((_index, element) => $(element).attr("data-response-id")).get();
  assert.equal(new Set(responseIds).size, responseIds.length);
  assert.deepEqual(responseIds, [
    "ela20-2-short-stories:short-fiction:story-questions:lamp-at-noon:setting-pressure",
    "ela20-2-short-stories:short-fiction:story-questions:lamp-at-noon:irony",
    "ela20-2-short-stories:short-fiction:story-questions:do-not-fall:panel-choice"
  ]);
  assert.match($.text(), /Save Story Answers to Evidence Bank/);
  assert.match($.text(), /Open original question sheet/);
});

test("works without mapped questions remain truthful and cannot publish an empty collection", () => {
  const output = fixture({
    works: [{ id: "unmapped", title: "Assigned Story", questions: [] }],
    resources: []
  });
  const $ = page(output, "story-questions");
  assert.match($.text(), /No mapped question set yet/);
  assert.equal($("[data-save-response-collection]").length, 0);
  assert.equal($("[data-worksheet-toggle-hints]").length, 1);
  assert.equal($("[data-worksheet-print]").length, 1);
});

test("Writing Studio combines analysis examples, truthful frameworks, individual evidence, and per-work paragraph collections", () => {
  const output = fixture();
  const $ = page(output, "writing-studio");
  assert.equal($("[data-short-fiction-analysis-term] option").length, DEFAULT_SHORT_FICTION_ANALYSIS_TERMS.length);
  assert.equal($("[data-short-fiction-analysis-work] option").length, 2);
  assert.equal($("[data-short-fiction-analysis-panel]").length, DEFAULT_SHORT_FICTION_ANALYSIS_TERMS.length * 2);
  assert.match($.text(), /The lamp remains lit at noon/);
  assert.match($.text(), /No model quotation has been invented for this work/);
  assert.equal($("[data-evidence-notebook-panel]").length, 1);
  assert.equal($("[data-save-evidence-note]").length, 1);
  assert.equal($("[data-evidence-draft='source']").length, 1);
  assert.equal($("[data-evidence-draft='concept']").length, 1);
  assert.equal($("[data-evidence-draft='detail']").length, 1);
  assert.equal($("[data-evidence-draft='connection']").length, 1);
  assert.equal($(".short-fiction-paragraph-panel").length, 2);
  assert.equal($(".short-fiction-paragraph-panel [data-activity-response]").length, 10);
  assert.equal($(".short-fiction-paragraph-panel [data-save-response-collection]").length, 2);
  assert.deepEqual(
    $(".short-fiction-paragraph-panel[data-evidence-collection-id]").map((_index, element) => $(element).attr("data-evidence-collection-id")).get(),
    [
      "ela20-2-short-stories:short-fiction:writing-studio:lamp-at-noon:paragraph:collection",
      "ela20-2-short-stories:short-fiction:writing-studio:do-not-fall:paragraph:collection"
    ]
  );
});

test("materials mode changes the canonical route without changing the activity contract", () => {
  const output = fixture({ materialsMode: "materials" });
  assert.equal(output.pages[0]?.id, "materials");
  assert.equal(output.pages[0]?.label, "Materials");
  assert.equal(output.contract.materialsRoute, "materials");
  const $ = page(output, "materials");
  assert.match($.text(), /Open assigned texts and teacher-selected documents/);
  assert.equal($('[data-short-fiction-reader-overlay-frame]').attr('src'), undefined);
  assert.doesNotMatch(output.runtime, /about:blank/);
});

test("ELA 30-2 may add a Visual Literacy lab but never a Visual Response writing form", () => {
  const output = fixture({
    namespace: "ela30-2-short-stories-visual-literacy",
    courseCode: "ELA 30-2",
    visualLiteracy: {
      enabled: true,
      tracks: [
        { id: "warren-pryor-visual", title: "Warren Pryor Visual", creator: "Course artist", imageHref: "assets/custom/warren-pryor.jpg", alt: "A student stands between family expectations and a distant road." },
        { id: "current-visual", title: "Current Visual" }
      ],
      questions: [{ id: "alternative-reading", prompt: "What alternative interpretation could a viewer develop?" }],
      resources: [{ id: "visual-guide", title: "Visual Literacy Guide", kind: "document", href: "resources/visual-guide.pdf" }]
    }
  });
  assert.deepEqual(output.pages.map((candidate) => candidate.id), ["story-bank", "story-questions", "writing-studio", "visual-literacy"]);
  assert.equal(output.contract.visualLiteracy, true);
  assert.equal(output.pages.some((candidate) => candidate.id === "visual-response"), false);
  const $ = page(output, "visual-literacy");
  assert.equal($("[data-english-activity-panel-group]").length, 2);
  assert.equal($("img[alt='A student stands between family expectations and a distant road.']").length, 1);
  assert.match($.text(), /Use the assigned visual/);
  assert.equal($("[data-activity-response]").length, 8, "three core plus one configured question per visual");
  assert.equal($("[data-save-response-collection]").length, 2);
  assert.deepEqual(
    $("[data-evidence-collection-id]").map((_index, element) => $(element).attr("data-evidence-collection-id")).get(),
    [
      "ela30-2-short-stories-visual-literacy:short-fiction:visual-literacy:warren-pryor-visual:collection",
      "ela30-2-short-stories-visual-literacy:short-fiction:visual-literacy:current-visual:collection"
    ]
  );
  assert.equal(output.resourceLinks.some((link) => link.id === "visual-guide"), true);

  assert.throws(
    () => fixture({ visualLiteracy: { enabled: true } }),
    /available only for ELA 30-2/
  );
});

test("learner resource links are deduplicated and internal resources are excluded", () => {
  const output = fixture();
  assert.deepEqual(output.resourceLinks.map((link) => link.id), ["text-lamp-at-noon", "reading-strategies"]);
  assert.equal(output.resourceLinks.some((link) => link.id === "internal-note"), false);
  assert.equal(output.resourceLinks[0]?.downloadable, true);
});

test("renderer rejects unstable configuration before rendering learner output", () => {
  assert.throws(() => fixture({ namespace: "unsafe namespace" }), /unsupported characters/);
  assert.throws(() => fixture({ works: [] }), /at least one configured work/);
  assert.throws(
    () => fixture({ works: [{ id: "same", title: "One", questions: [] }, { id: "same", title: "Two", questions: [] }] }),
    /duplicate id/
  );
  assert.throws(
    () => fixture({ works: [{ id: "story", title: "Story", readingHref: "javascript:alert(1)", questions: [] }] }),
    /unsupported href/
  );
});

test("all response IDs are unique and profile CSS/runtime remain standalone integration fragments", () => {
  const output = fixture();
  const $ = allPages(output);
  const responseIds = $("[data-response-id]").map((_index, element) => $(element).attr("data-response-id")).get();
  assert.equal(new Set(responseIds).size, responseIds.length);
  assert.ok(responseIds.every((id) => id?.startsWith("ela20-2-short-stories:short-fiction:")));
  assert.match(SHORT_FICTION_PROFILE_CSS, /#161a17/);
  assert.match(SHORT_FICTION_PROFILE_CSS, /#154212/);
  assert.match(SHORT_FICTION_PROFILE_CSS, /@media \(max-width: 840px\)/);
  assert.match(SHORT_FICTION_PROFILE_CSS, /@media print/);
  assert.doesNotMatch(SHORT_FICTION_PROFILE_CSS, /gradient\(/i);
  assert.match(SHORT_FICTION_PROFILE_RUNTIME, /data-short-fiction-fullscreen-src/);
  assert.match(SHORT_FICTION_PROFILE_RUNTIME, /data-short-fiction-analysis-panel/);
  assert.doesNotThrow(() => new vm.Script(SHORT_FICTION_PROFILE_RUNTIME, { filename: "short-fiction-profile-runtime.js" }));
});
