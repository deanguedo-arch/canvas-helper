import assert from "node:assert/strict";
import test from "node:test";

import { renderNextStepCourseShell } from "../lib/next-step-course-shell.js";

function renderBiologyShell() {
  return renderNextStepCourseShell({
    slug: "biology30-unit-a",
    courseTitle: "Biology 30 — Unit A: Nervous and Endocrine Systems",
    courseCode: "BIO 30",
    overviewIntro: "",
    overviewHtml: '<h1>Biology 30 — Unit A</h1><p>Overview body.</p>',
    outcomes: [],
    lessons: [
      {
        id: "lesson-04",
        sequenceNumber: 4,
        title: "Action Potentials",
        summary: "Ions become information.",
        html: '<h1>Action Potentials</h1><p>Authored body.</p>'
      },
      {
        id: "lesson-15",
        sequenceNumber: 15,
        title: "Blood Glucose",
        summary: "Feedback and evidence.",
        html: '<h1>Blood Glucose</h1><p>Authored body.</p>'
      }
    ],
    navItems: [
      {
        id: "model-lab",
        label: "Model Lab",
        icon: "science",
        html: '<section id="model-lab" class="course-page" hidden><h1>Model Lab</h1></section>'
      }
    ],
    lessonPresentation: "authored",
    chromeAssets: "self-contained",
    showLessonsIndex: false,
    showLessonCompletionButton: false,
    extraBodyHtml: '<script data-biology-runtime></script>'
  });
}

test("authored self-contained shell emits semantic bodies and no remote chrome dependencies", () => {
  const html = renderBiologyShell();
  assert.match(html, /class="course-page course-page--authored"><h1>Biology 30/);
  assert.match(html, /class="authored-lesson">\s*<h1>Action Potentials/);
  assert.match(html, />4\. Action Potentials</);
  assert.match(html, />15\. Blood Glucose</);
  assert.match(html, /class="shell-icon/);
  assert.match(html, /data-biology-runtime/);
  assert.doesNotMatch(html, /fonts\.googleapis\.com|fonts\.gstatic\.com|Material\+Symbols/);
  assert.doesNotMatch(html, /data-complete-id="lesson-04"/);
  assert.doesNotMatch(html, /<h1 class="sidebar-title"/);
  assert.match(html, /if \(open\) navigateToPage\(showLessonsIndex \? "lessons" : \(lessonIds\[0\] \|\| "overview"\)\)/);
  assert.doesNotMatch(html, /id="lessons" class="course-page/);
});

test("remote document shell keeps its existing default asset behavior", () => {
  const html = renderNextStepCourseShell({
    slug: "existing-course",
    courseTitle: "Existing Course",
    courseCode: "EX 1",
    overviewIntro: "Existing overview.",
    outcomes: ["I can test compatibility."],
    lessons: [{ id: "lesson-1", title: "Lesson", summary: "Summary", html: "<p>Body</p>" }]
  });
  assert.match(html, /fonts\.googleapis\.com/);
  assert.match(html, /material-symbols-outlined/);
  assert.match(html, /<h1 class="sidebar-title"/);
  assert.match(html, /data-complete-id="lesson-1"/);
});
