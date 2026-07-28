import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";

import * as cheerio from "cheerio";

import type { EnglishBuiltLesson } from "./types.js";
import { WRITING_FOUNDATIONS_SOURCE_PAGE_IDS } from "./writing-foundations-profile-renderer.js";
import {
  WRITING_FOUNDATIONS_LESSON_TABS_CSS,
  WRITING_FOUNDATIONS_LESSON_TABS_RUNTIME,
  transformWritingFoundationsLessons
} from "./writing-foundations-lessons.js";

function sourceLessons(): EnglishBuiltLesson[] {
  return WRITING_FOUNDATIONS_SOURCE_PAGE_IDS.map((sourcePageId, index) => ({
    id: `loaded-${sourcePageId}`,
    title: `Source ${sourcePageId}`,
    sourceHref: `content/${sourcePageId}.html`,
    html: `<div id="content"><label for="answer">Practice</label><textarea id="answer" aria-describedby="help"></textarea><p id="help">Use the lesson examples as you revise.</p><p>CBe-learn - Calgary Board of Education</p><p>${index === 0 ? "A sentence contains a complete idea, a verb and a noun." : `Approved content ${sourcePageId}.`}</p></div>${sourcePageId === "3354" ? '<iframe src="https://slideshare.net/old"></iframe>' : ""}`,
    text: `Unnormalized source ${sourcePageId}`,
    supportingResources: [
      {
        id: `approved-${sourcePageId}`,
        title: `Approved ${sourcePageId}`,
        href: `assets/approved-${sourcePageId}.pdf`,
        kind: "local",
        lessonTitle: `Source ${sourcePageId}`
      },
      ...(sourcePageId === "3355" ? [{
        id: "blocked-slides",
        title: "Run-On Sentences.ppsx",
        href: "assets/Run-On Sentences.ppsx",
        kind: "local" as const,
        lessonTitle: `Source ${sourcePageId}`
      }] : [])
    ]
  }));
}

test("strictly transforms source pages 3351-3357 into the required seven learner lessons", () => {
  const output = transformWritingFoundationsLessons({
    lessons: sourceLessons(),
    sourcePageIds: WRITING_FOUNDATIONS_SOURCE_PAGE_IDS
  });

  assert.deepEqual(output.lessons.map((lesson) => lesson.id), [
    "lesson-1-writing-foundations",
    "lesson-2-complete-sentences",
    "lesson-3-topic-sentences-paragraph-structure",
    "lesson-4-supporting-details-development",
    "lesson-5-paragraph-planning-models",
    "lesson-6-unity-coherence-transitions",
    "lesson-7-revise-edit-polish"
  ]);
  assert.deepEqual(output.lessons.map((lesson) => lesson.title), [
    "Writing Foundations",
    "Complete Sentences",
    "Topic Sentences and Paragraph Structure",
    "Supporting Details and Development",
    "Paragraph Planning Models",
    "Unity, Coherence, and Transitions",
    "Revise, Edit, and Polish"
  ]);
  assert.equal(output.sourceMap.length, 7);
  assert.deepEqual(output.sourceMap.map((entry) => entry.sourcePageId), [...WRITING_FOUNDATIONS_SOURCE_PAGE_IDS]);
  assert.deepEqual(output.sourceMap.slice(3, 6).map((entry) => entry.learnerLessonId), [
    "lesson-5-paragraph-planning-models",
    "lesson-5-paragraph-planning-models",
    "lesson-5-paragraph-planning-models"
  ]);
  assert.match(output.lessons[1]!.html, /A complete sentence expresses a complete thought/);
  assert.doesNotMatch(output.lessons.map((lesson) => lesson.html).join("\n"), /CBE|slideshare|teacherspayteachers|assignment is due|teacher feedback|<iframe/i);
  assert.doesNotMatch(output.lessons.map((lesson) => lesson.text).join("\n"), /Unnormalized source/);
  const ids = output.lessons.flatMap((lesson) => [...lesson.html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  assert.equal(new Set(ids).size, ids.length, "legacy source ids are namespaced per allowlisted page");
  assert.match(output.lessons[4]!.html, /id="wf-source-3354-hamburger-source-caption"/);
  assert.match(output.lessons[4]!.html, /aria-labelledby="wf-source-3354-hamburger-source-caption"/);
  assert.match(output.lessons[1]!.html, /data-page-target="sentence-lab"/);
  assert.match(output.lessons[4]!.html, /data-page-target="paragraph-builder"/);
  assert.match(output.lessons[5]!.html, /data-page-target="organization-lab"/);
  assert.match(output.lessons[6]!.html, /data-page-target="final-paragraph"/);
});

test("paragraph planning pages become one accessible keyboard tab set", () => {
  const output = transformWritingFoundationsLessons({
    lessons: sourceLessons(),
    sourcePageIds: WRITING_FOUNDATIONS_SOURCE_PAGE_IDS
  });
  const planning = output.lessons[4]!;
  const $ = cheerio.load(planning.html);

  assert.equal($("[data-wf-source-tabs]").length, 1);
  assert.equal($("[role='tablist'][aria-label='Paragraph planning models']").length, 1);
  assert.equal($("[role='tab']").length, 3);
  assert.deepEqual($("[role='tab']").map((_index, element) => $(element).text()).get(), ["Hamburger", "Graphic Organizer", "PEEL"]);
  assert.equal($("[role='tabpanel']").length, 3);
  assert.equal($("[role='tabpanel'][hidden]").length, 2);
  assert.equal($("[role='tab'][aria-selected='true'][tabindex='0']").length, 1);
  $("[role='tab']").each((_index, element) => {
    const panelId = $(element).attr("aria-controls");
    assert.ok(panelId);
    assert.equal($(`#${panelId}`).attr("aria-labelledby"), $(element).attr("id"));
  });
  assert.match(WRITING_FOUNDATIONS_LESSON_TABS_RUNTIME, /ArrowRight/);
  assert.match(WRITING_FOUNDATIONS_LESSON_TABS_RUNTIME, /ArrowLeft/);
  assert.match(WRITING_FOUNDATIONS_LESSON_TABS_RUNTIME, /Home/);
  assert.match(WRITING_FOUNDATIONS_LESSON_TABS_RUNTIME, /End/);
  assert.match(WRITING_FOUNDATIONS_LESSON_TABS_RUNTIME, /const __name=function/);
  assert.doesNotThrow(() => new vm.Script(WRITING_FOUNDATIONS_LESSON_TABS_RUNTIME));
  assert.match(WRITING_FOUNDATIONS_LESSON_TABS_CSS, /focus-visible/);
  assert.match(WRITING_FOUNDATIONS_LESSON_TABS_CSS, /max-width: 680px/);
});

test("merge preserves approved resources, removes blocked legacy support, and does not mutate loaded lessons", () => {
  const inputLessons = sourceLessons();
  const original = structuredClone(inputLessons);
  const output = transformWritingFoundationsLessons({
    lessons: inputLessons,
    sourcePageIds: WRITING_FOUNDATIONS_SOURCE_PAGE_IDS
  });

  const planningResources = output.lessons[4]!.supportingResources;
  assert.equal(planningResources.length, 3);
  assert.deepEqual(planningResources.map((resource) => resource.id), ["approved-3354", "approved-3355", "approved-3356"]);
  assert.ok(planningResources.every((resource) => resource.lessonTitle === "Paragraph Planning Models"));
  assert.doesNotMatch(JSON.stringify(output), /Run-On Sentences\.ppsx|teacherspayteachers|slideshare/i);
  assert.deepEqual(inputLessons, original);
});

test("refuses incomplete, reordered, or mismatched source input", () => {
  const lessons = sourceLessons();
  assert.throws(() => transformWritingFoundationsLessons({
    lessons: lessons.slice(0, 6),
    sourcePageIds: WRITING_FOUNDATIONS_SOURCE_PAGE_IDS
  }), /received 6 loaded lessons/);
  assert.throws(() => transformWritingFoundationsLessons({
    lessons,
    sourcePageIds: ["3351", "3353", "3352", "3354", "3355", "3356", "3357"]
  }), /manifest order/);
  assert.throws(() => transformWritingFoundationsLessons({
    lessons,
    sourcePageIds: ["3351", "3352"]
  }), /requires source pages 3351, 3352, 3353, 3354, 3355, 3356, 3357/);
});
