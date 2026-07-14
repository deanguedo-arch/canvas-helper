import assert from "node:assert/strict";
import test from "node:test";

import type { EnglishRenderedActivityProfile } from "./activity-profile-renderers.js";
import type { EnglishPreparedResource } from "./factory-resources.js";
import { englishFactoryRenderInternals } from "./factory-render.js";
import type { EnglishBuiltLesson, EnglishUnitRecipeV2 } from "./types.js";

const recipe = {
  projectSlug: "ela20-1-shakespeare-macbeth",
  courseCode: "ELA 20-1"
} as EnglishUnitRecipeV2;

const resources: EnglishPreparedResource[] = [
  {
    id: "macbeth-recurring-images",
    title: "MACBETH Recurring Images.pdf",
    role: "supporting-resource",
    source: "MACBETH Recurring Images.pdf",
    href: "assets/generated/resources/macbeth-recurring-images.pdf",
    reviewRequired: false
  }
];

const lessons: EnglishBuiltLesson[] = [
  {
    id: "lesson-1-shakespeares-world",
    title: "Lesson 1: Shakespeare's World",
    sourceHref: "content/lesson-1.html",
    html: "<p>Lesson content.</p>",
    text: "Lesson content.",
    supportingResources: [
      {
        id: "shakespeare-life-times",
        title: "Shakespeare's Life and Times",
        href: "https://example.org/shakespeare",
        kind: "external",
        lessonTitle: "Shakespeare's World"
      }
    ]
  },
  {
    id: "lesson-2-macbeth-context",
    title: "Lesson 2: Macbeth Context",
    sourceHref: "content/lesson-2.html",
    html: "<p>Lesson content.</p>",
    text: "Lesson content.",
    supportingResources: [
      {
        id: "macbeth-context-notes",
        title: "Macbeth Context Notes",
        href: "assets/generated/lessons/macbeth-context.html",
        kind: "local",
        lessonTitle: "Macbeth Context"
      }
    ]
  }
];

test("Shakespeare Resources use the grouped Othello interaction pattern", () => {
  const html = englishFactoryRenderInternals.renderResources(
    recipe,
    resources,
    lessons,
    "shakespeare-drama",
    [{
      id: "macbeth-original-text",
      title: "Macbeth Original Text",
      description: "Complete public-domain text.",
      href: "https://shakespeare.mit.edu/macbeth/index.html",
      status: "available"
    }]
  );

  assert.match(html, /class="course-page shakespeare-resources-page"/);
  assert.match(html, /<h2 class="route-title">Source Resources<\/h2>/);
  assert.match(html, /Recovered Unit Documents/);
  assert.match(html, /Choose a lesson group/);
  assert.match(html, /Play Access and Study Support/);
  assert.match(html, /Macbeth Original Text/);
  assert.match(html, /data-response-id="ela20-1-shakespeare-macbeth:resources:selected-group"/);
  assert.match(html, /data-english-activity-select="shakespeare-resource-groups"/);
  assert.match(html, /data-english-activity-panel-group="shakespeare-resource-groups"/);
  assert.match(html, /data-english-activity-panel="resources-lesson-1-shakespeares-world"/);
  assert.match(html, /MACBETH Recurring Images\.pdf/);
  assert.match(html, /Shakespeare&#39;s Life and Times/);
  assert.match(html, /External Source/);
  assert.match(html, /Local Source/);
  assert.match(html, /download>Download<\/a>/);
});

test("non-Shakespeare profiles retain the standard flat Resources renderer", () => {
  const profileKind: EnglishRenderedActivityProfile["kind"] = "film-study";
  const html = englishFactoryRenderInternals.renderResources(recipe, resources, lessons, profileKind);

  assert.match(html, /class="english-factory-resource-list"/);
  assert.match(html, /<h2 class="route-title">Resources<\/h2>/);
  assert.doesNotMatch(html, /shakespeare-resources-page/);
  assert.doesNotMatch(html, /shakespeare-resource-groups/);
});
