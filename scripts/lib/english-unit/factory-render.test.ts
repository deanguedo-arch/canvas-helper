import assert from "node:assert/strict";
import test from "node:test";

import type { EnglishRenderedActivityProfile } from "./activity-profile-renderers.js";
import type { EnglishPreparedResource } from "./factory-resources.js";
import { englishFactoryRenderInternals, renderEnglishFactoryUnit } from "./factory-render.js";
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
  assert.match(html, /<h2 class="route-title">Resources<\/h2>/);
  assert.match(html, /Unit Documents/);
  assert.doesNotMatch(html, /Recovered Unit Documents|Teacher-selected|Excluded assessments|editorial or rights review|available in this draft/i);
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

test("modern-drama Resources use the grouped donor interaction pattern", () => {
  const modernRecipe = {
    ...recipe,
    projectSlug: "ela20-1-modern-play-crucible"
  } as EnglishUnitRecipeV2;
  const html = englishFactoryRenderInternals.renderResources(
    modernRecipe,
    [{
      ...resources[0],
      id: "crucible-act-one",
      title: "The Crucible Act 1 Questions.pdf",
      href: "assets/generated/resources/crucible-act-one.pdf"
    }],
    [{
      ...lessons[0],
      id: "lesson-1-modern-drama",
      title: "Lesson 1: Modern Drama and Conflict",
      supportingResources: [{
        id: "conflict-guide",
        title: "Conflict Guide",
        href: "https://example.org/conflict",
        kind: "external",
        lessonTitle: "Modern Drama and Conflict"
      }]
    }],
    "modern-drama",
    [{
      id: "play-support",
      title: "Play Study Support",
      description: "Approved play support.",
      href: "https://example.org/crucible-support",
      status: "available"
    }]
  );

  assert.match(html, /class="course-page shakespeare-resources-page modern-drama-resources-page"/);
  assert.match(html, /<h2 class="route-title">Resources<\/h2>/);
  assert.match(html, /Unit Documents/);
  assert.doesNotMatch(html, /Teacher-selected|Teacher-supplied|Recovered Unit Documents|Source Resources|Excluded assessments|unrelated folders/i);
  assert.match(html, /Choose a lesson group/);
  assert.match(html, /Play Access and Study Support/);
  assert.match(html, /data-response-id="ela20-1-modern-play-crucible:resources:selected-group"/);
  assert.match(html, /data-english-activity-select="modern-drama-resource-groups"/);
  assert.match(html, /data-english-activity-panel-group="modern-drama-resource-groups"/);
  assert.match(html, /data-english-activity-panel="resources-lesson-1-modern-drama"/);
  assert.match(html, /The Crucible Act 1 Questions\.pdf/);
  assert.match(html, /Conflict Guide/);
  assert.match(html, /download>Download<\/a>/);
});

test("non-drama profiles retain the standard flat Resources renderer", () => {
  const profileKind: EnglishRenderedActivityProfile["kind"] = "film-study";
  const html = englishFactoryRenderInternals.renderResources(recipe, resources, lessons, profileKind);

  assert.match(html, /class="english-factory-resource-list"/);
  assert.match(html, /<h2 class="route-title">Resources<\/h2>/);
  assert.doesNotMatch(html, /shakespeare-resources-page/);
  assert.doesNotMatch(html, /shakespeare-resource-groups/);
  assert.doesNotMatch(html, /modern-drama-resources-page/);
});

test("Novel Study moves truthful title-access notices into Resources", () => {
  const novelRecipe = {
    ...recipe,
    projectSlug: "ela20-1-novel-study-clean"
  } as EnglishUnitRecipeV2;
  const html = englishFactoryRenderInternals.renderResources(
    novelRecipe,
    resources,
    lessons,
    "novel-study",
    [
      { id: "lord-of-the-flies-access", title: "Lord of the Flies", description: "Use the assigned or school-licensed edition.", status: "access-required" },
      { id: "the-book-thief-access", title: "The Book Thief", description: "Use the assigned or school-licensed edition.", status: "access-required" }
    ]
  );

  assert.match(html, /id="novel-access-title">Novel access/);
  assert.match(html, /complete novels are not included/i);
  assert.equal((html.match(/data-material-status="access-required"/g) ?? []).length, 2);
  assert.match(html, /Lord of the Flies/);
  assert.match(html, /The Book Thief/);
  assert.match(html, /Assigned or licensed edition required/);
  assert.doesNotMatch(html, /teacher-selected|teacher-supplied|teacher-provided|Teacher or school access required/i);
});

test("factory renders grouped activity pages once and keeps Evidence Bank quick links top-level", () => {
  const groupedRecipe = {
    projectSlug: "ela20-1-feature-film",
    courseCode: "ELA 20-1",
    unitTitle: "Film Study",
    lessonGroups: [],
    activityProfile: {
      activities: [
        { route: "critical-essay", enabled: true },
        { route: "evidence-bank", enabled: true },
        { route: "film-room", enabled: false },
        { route: "resources", enabled: false }
      ]
    }
  } as unknown as EnglishUnitRecipeV2;
  const activityProfile: EnglishRenderedActivityProfile = {
    kind: "film-study",
    pages: [
      {
        id: "critical-essay",
        label: "Critical Analytical Essay Guide",
        icon: "edit_note",
        html: '<section id="critical-essay" class="course-page" hidden>Guide</section>'
      },
      {
        id: "critical-essay-topic",
        label: "Topic and Interpretation",
        icon: "edit_note",
        html: '<section id="critical-essay-topic" class="course-page" hidden>Topic lesson</section>'
      },
      {
        id: "critical-essay-preview",
        label: "Critical Essay Preview",
        icon: "preview",
        html: '<section id="critical-essay-preview" class="course-page" hidden>Preview</section>'
      },
      {
        id: "viewing-guide",
        label: "Viewing Guide",
        icon: "visibility",
        html: '<section id="viewing-guide" class="course-page" hidden>Viewing guide</section>'
      }
    ],
    navGroups: [{
      id: "critical-essay",
      label: "Critical Essay",
      icon: "edit_note",
      landingItemLabel: "Critical Analytical Essay Guide",
      itemPageIds: ["critical-essay-topic", "critical-essay-preview"]
    }]
  };

  const navigation = englishFactoryRenderInternals.buildActivityNavigation(activityProfile);
  assert.equal(navigation.navGroups.length, 1);
  assert.equal(navigation.navGroups[0]?.html, activityProfile.pages[0]?.html);
  assert.deepEqual(navigation.navGroups[0]?.items.map((item) => item.id), ["critical-essay-topic", "critical-essay-preview"]);
  assert.deepEqual(navigation.navItems.map((item) => item.id), ["viewing-guide"]);

  const html = renderEnglishFactoryUnit({
    recipe: groupedRecipe,
    lessons: [],
    activityProfile,
    resources: [],
    videos: []
  });
  assert.match(html, /data-nav-group="critical-essay"/);
  assert.match(html, />1\. Critical Analytical Essay Guide<\/a>/);
  assert.match(html, />2\. Topic and Interpretation<\/a>/);
  assert.match(html, />3\. Critical Essay Preview<\/a>/);
  assert.equal((html.match(/<section id="critical-essay" class="course-page"/g) ?? []).length, 1);
  assert.equal((html.match(/<section id="critical-essay-topic" class="course-page"/g) ?? []).length, 1);
  assert.doesNotMatch(html, /class="course-nav-link" href="#critical-essay-topic"/);
  assert.match(html, /const activeGroupToggle = navGroupId && target === navGroupId && link\.hasAttribute\("data-nav-group-toggle"\);/);
  assert.match(html, /const collapseCurrentLanding = group\?\.classList\.contains\("is-open"\) && location\.hash === "#" \+ groupId;[\s\S]*showPage\(groupId\);[\s\S]*if \(collapseCurrentLanding\) setNavGroupOpen\(groupId, false\);/);

  const evidenceBank = englishFactoryRenderInternals.renderEvidenceBank(
    groupedRecipe,
    activityProfile.pages,
    activityProfile.navGroups
  );
  assert.match(evidenceBank, />Critical Essay<\/a>/);
  assert.match(evidenceBank, />Viewing Guide<\/a>/);
  assert.doesNotMatch(evidenceBank, /Topic and Interpretation|Critical Essay Preview/);
});

test("factory keeps lesson-linked practice routes available without adding redundant sidebar destinations", () => {
  const lessonLinkedRecipe = {
    projectSlug: "ela10-2-writing-foundations",
    courseCode: "ELA 10-2",
    unitTitle: "Writing Foundations",
    lessonGroups: [],
    activityProfile: {
      activities: [
        { route: "evidence-bank", enabled: false },
        { route: "resources", enabled: false }
      ]
    }
  } as unknown as EnglishUnitRecipeV2;
  const activityProfile: EnglishRenderedActivityProfile = {
    kind: "writing-foundations",
    pages: [{
      id: "sentence-lab",
      label: "Sentence Practice",
      icon: "spellcheck",
      navigation: "lesson-linked",
      html: '<section id="sentence-lab" class="course-page" hidden>Sentence practice</section>'
    }],
    navGroups: []
  };

  const navigation = englishFactoryRenderInternals.buildActivityNavigation(activityProfile);
  assert.equal(navigation.navItems[0]?.hiddenFromNavigation, true);

  const html = renderEnglishFactoryUnit({
    recipe: lessonLinkedRecipe,
    lessons: [],
    activityProfile,
    resources: [],
    videos: []
  });
  assert.equal((html.match(/<section id="sentence-lab" class="course-page"/g) ?? []).length, 1);
  assert.match(html, /const pageIds = \["overview","lessons","sentence-lab"\]/);
  assert.doesNotMatch(html, /class="course-nav-link" href="#sentence-lab"/);
});

test("factory appends desktop full-width overrides after profile styling", () => {
  const layoutRecipe = {
    projectSlug: "ela20-1-novel-study-clean",
    courseCode: "ELA 20-1",
    unitTitle: "Novel Study",
    lessonGroups: [],
    activityProfile: {
      activities: [
        { route: "evidence-bank", enabled: false },
        { route: "film-room", enabled: false },
        { route: "resources", enabled: false }
      ]
    }
  } as unknown as EnglishUnitRecipeV2;
  const profileWidthRule = ".novel-profile-page { max-width: 1120px; margin: 0 auto; }";
  const html = renderEnglishFactoryUnit({
    recipe: layoutRecipe,
    lessons: [],
    activityProfile: {
      kind: "novel-study",
      pages: [],
      css: profileWidthRule
    },
    resources: [],
    videos: []
  });

  const profileRuleIndex = html.indexOf(profileWidthRule);
  const layoutRuleIndex = html.indexOf("@media (min-width: 1101px)");
  assert.ok(profileRuleIndex >= 0);
  assert.ok(layoutRuleIndex > profileRuleIndex, "factory layout overrides must follow profile CSS");
  assert.match(html, /\.course-frame \{ width: 100%; \}/);
  assert.match(html, /\.course-main \{ padding-right: 64px; padding-bottom: 64px; padding-left: 64px; \}/);
  assert.match(html, /\.novel-profile-page \{ max-width: none; margin-inline: 0; \}/);
  assert.match(html, /\.english-writing-workbook-page \{ max-width: none; margin-inline: 0; \}/);
  assert.match(html, /\.shakespeare-writing-page \.shakespeare-writing-panel-stack \{ max-width: none; \}/);
});

test("factory preserves the consolidated Elements of Fiction donor lesson", () => {
  const shortStoryRecipe = {
    projectSlug: "ela30-2-short-stories-visual-literacy",
    courseCode: "ELA 30-2",
    unitTitle: "Short Stories and Visual Literacy",
    topLevelLessonOrder: [
      "Lesson 1: Short Stories Introduction",
      "Lesson 2: Introduction to Elements of Fiction",
      "Lesson 4: Literary Terms"
    ],
    lessonGroups: [{
      id: "unit-lessons",
      title: "Short Stories and Visual Literacy",
      lessonIds: [
        "Lesson 1: Short Stories Introduction",
        "Lesson 2: Introduction to Elements of Fiction",
        "Lesson 4: Literary Terms"
      ]
    }],
    fictionElementsHub: {
      hubLesson: "Lesson 2: Introduction to Elements of Fiction",
      childLessons: [
        "Lesson 3: Irony",
        "Lesson 3: Point of View"
      ]
    }
  } as unknown as EnglishUnitRecipeV2;
  const shortStoryLessons: EnglishBuiltLesson[] = [
    { ...lessons[0], id: "lesson-1", title: "Lesson 1: Short Stories Introduction" },
    { ...lessons[0], id: "lesson-2", title: "Lesson 2: Introduction to Elements of Fiction" },
    { ...lessons[0], id: "lesson-3-irony", title: "Lesson 3: Irony", text: "Review verbal, situational, and dramatic irony." },
    { ...lessons[0], id: "lesson-3-point-of-view", title: "Lesson 3: Point of View", text: "Review narrative perspective and reliability." },
    { ...lessons[0], id: "lesson-4", title: "Lesson 4: Literary Terms" }
  ];

  const shellLessons = englishFactoryRenderInternals.buildShellLessons(shortStoryRecipe, shortStoryLessons);
  assert.deepEqual(shellLessons.map((lesson) => lesson.id), ["lesson-1", "lesson-2", "lesson-4"]);
  assert.match(shellLessons[1]?.html ?? "", /Elements of Fiction Checklist/);
  assert.match(shellLessons[1]?.html ?? "", /data-element-target="lesson-3-irony"/);
  assert.match(shellLessons[1]?.html ?? "", /data-element-panel="lesson-3-point-of-view"/);
  assert.match(shellLessons[1]?.html ?? "", /<span class="element-selector-action">Review<\/span>/);
  assert.match(shellLessons[1]?.html ?? "", /Review verbal, situational, and dramatic irony\./);
  assert.match(shellLessons[1]?.html ?? "", /Apply your understanding of irony/);
  assert.doesNotMatch(shellLessons[1]?.html ?? "", /class="element-completion-bar"/);
  assert.match(shellLessons[2]?.html ?? "", /Literary Terms Reference/);
  assert.match(shellLessons[2]?.html ?? "", /Purdue OWL Literary Terms/);
  assert.doesNotMatch(shellLessons[0]?.html ?? "", /Elements of Fiction Checklist/);
});

test("V3 Short Stories restores the donor Film Room and Resources without a Materials route", () => {
  const shortStoryRecipe = {
    schemaVersion: 3,
    projectSlug: "ela30-2-short-stories-visual-literacy",
    courseCode: "ELA 30-2",
    unitTitle: "Short Stories and Visual Literacy",
    lessonGroups: [],
    activityProfile: {
      kind: "short-fiction",
      activities: [
        { id: "film-room", title: "Film Room", route: "film-room", enabled: true, evidencePolicyIds: [] },
        { id: "resources", title: "Resources", route: "resources", enabled: true, evidencePolicyIds: [] }
      ]
    },
    mediaPolicy: {
      verifiedAt: "2026-07-23",
      allowedYouTubeIds: ["1KbDdiku75E"],
      blockedYouTubeIds: [],
      approvedExternalUrls: ["https://literarydevices.net/play/"],
      externalUrlRewrites: {}
    }
  } as unknown as EnglishUnitRecipeV2;
  const html = renderEnglishFactoryUnit({
    recipe: shortStoryRecipe,
    lessons: [{
      ...lessons[1],
      supportingResources: [{
        id: "irony-helper",
        title: "Check your answer",
        href: "assets/generated/lessons/rhw-irony.html",
        kind: "local",
        lessonTitle: "Irony"
      }]
    }],
    activityProfile: {
      kind: "short-fiction",
      pages: [],
      resourceLinks: [{
        id: "literary-devices-play",
        title: "Play",
        description: "Literary terms support.",
        href: "https://literarydevices.net/play/",
        status: "available"
      }]
    },
    resources: [],
    videos: [{
      id: "1KbDdiku75E",
      lessonTitle: "Types of Characters",
      embedSrc: "https://www.youtube.com/embed/1KbDdiku75E"
    }]
  });

  assert.match(html, /id="film-room"/);
  assert.match(html, /youtube\.com\/embed\/1KbDdiku75E/);
  assert.match(html, />Media Room</);
  assert.match(html, /class="film-room-shell"/);
  assert.match(html, />Media Playlist</);
  assert.match(html, />Types of Characters</);
  assert.match(html, /id="resources"/);
  assert.match(html, />Source Resources</);
  assert.match(html, /class="resource-stack"/);
  assert.match(html, /data-resource-select/);
  assert.match(html, /data-resource-panel=/);
  assert.match(html, /assets\/generated\/lessons\/rhw-irony\.html/);
  assert.match(html, /https:\/\/literarydevices\.net\/play\//);
  assert.doesNotMatch(html, /id="materials"/);
});

test("all English factory Evidence Banks use the shared dark worksheet header treatment", () => {
  const novelRecipe = {
    projectSlug: "ela20-1-novel-study-clean",
    courseCode: "ELA 20-1",
    activityProfile: { kind: "novel-study", activities: [] }
  } as unknown as EnglishUnitRecipeV2;
  const filmRecipe = {
    projectSlug: "ela20-1-feature-film",
    courseCode: "ELA 20-1",
    activityProfile: { kind: "film-study", activities: [] }
  } as unknown as EnglishUnitRecipeV2;

  const novelEvidenceBank = englishFactoryRenderInternals.renderEvidenceBank(novelRecipe, []);
  const filmEvidenceBank = englishFactoryRenderInternals.renderEvidenceBank(filmRecipe, []);

  assert.equal((novelEvidenceBank.match(/novel-dark-worksheet-header/g) ?? []).length, 2);
  assert.equal((novelEvidenceBank.match(/english-dark-worksheet-header/g) ?? []).length, 2);
  assert.match(novelEvidenceBank, /english-evidence-bank-heading english-dark-worksheet-header novel-dark-worksheet-header/);
  assert.match(novelEvidenceBank, /english-evidence-capture-heading english-dark-worksheet-header novel-dark-worksheet-header/);
  assert.equal((filmEvidenceBank.match(/english-dark-worksheet-header/g) ?? []).length, 2);
  assert.match(filmEvidenceBank, /english-evidence-bank-heading english-dark-worksheet-header/);
  assert.match(filmEvidenceBank, /english-evidence-capture-heading english-dark-worksheet-header/);
  assert.doesNotMatch(filmEvidenceBank, /novel-dark-worksheet-header/);
});
