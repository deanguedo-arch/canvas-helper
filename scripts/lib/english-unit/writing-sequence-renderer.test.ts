import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

import {
  ELA30_WRITING_PROJECT_SLUGS,
  applyEla30WritingRetrofit,
  type Ela30WritingProjectSlug,
} from "./ela30-writing-retrofit.js";
import { applyEnglishEvidenceRetrofitToHtml } from "./ela30-evidence-retrofit.js";
import {
  EnglishActivityProfileV1Schema,
  EnglishUnitRecipeV3Schema,
  parseEnglishUnitRecipe,
} from "./schema.js";
import {
  ENGLISH_WRITING_SEQUENCE_RUNTIME,
  ensureStandardEnglishWritingProfile,
  renderEnglishWritingSequences,
} from "./writing-sequence-renderer.js";
import type { EnglishActivityProfileV1 } from "./types.js";
import { updateEla30E2EContract } from "../../retrofit-english-writing.js";

function sourceFor(slug: Ela30WritingProjectSlug) {
  return readFile(path.resolve("projects", slug, "workspace", "index.html"), "utf8");
}

test("standard writing renderer creates guide, six lessons, and preview for both writing forms", () => {
  const rendered = renderEnglishWritingSequences({
    namespace: "ela20-1-writing-test",
    courseCode: "ELA 20-1",
    unitTitle: "Writing Test",
    profileKind: "short-fiction",
    works: [
      { id: "story-one", title: "Story One", kind: "text" },
      { id: "story-two", title: "Story Two", kind: "text" },
    ],
    includeCriticalEssay: true,
    includePersonalResponse: true,
  });

  assert.equal(rendered.pages.length, 16);
  assert.deepEqual(rendered.navGroups.map((group) => group.id), ["critical-essay", "personal-response"]);
  assert.equal(new Set(rendered.pages.map((page) => page.id)).size, 16);
  assert.match(rendered.pages.find((page) => page.id === "critical-essay-topic-interpretation")?.html ?? "", /Build Topic and Interpretation/);
  assert.match(rendered.pages.find((page) => page.id === "personal-response-knowledge-experience")?.html ?? "", /Knowledge and Experience/);
  assert.match(rendered.pages.find((page) => page.id === "personal-response-preview")?.html ?? "", /Save Full Personal Response Plan/);
  assert.match(rendered.pages.find((page) => page.id === "critical-essay")?.html ?? "", /class="route-kicker course-kicker">ELA 20-1 \| Critical Analytical Writing/);
  assert.match(rendered.pages.find((page) => page.id === "critical-essay")?.html ?? "", /Alberta 20-1 assignment focus/);
  assert.match(rendered.pages.find((page) => page.id === "personal-response")?.html ?? "", /class="route-kicker course-kicker">ELA 20-1 \| Personal Response Writing/);
  assert.match(rendered.css, /\.english-writing-guide > \.route-title,[\s\S]*font-size:\s*clamp\(42px, 4\.6vw, 58px\);/);
  assert.match(rendered.css, /\.english-writing-guide\s*\{[\s\S]*border:\s*0 !important;[\s\S]*padding:\s*0 !important;/);
  assert.match(rendered.pages.map((page) => page.html).join("\n"), /ela20-1-writing-test:personal-response:unit:knowledge-experience:connection/);
  assert.match(ENGLISH_WRITING_SEQUENCE_RUNTIME, /answer\s*:\s*payload\.compiledText/);
  assert.match(ENGLISH_WRITING_SEQUENCE_RUNTIME, /answer\s*:\s*completed\.map/);
  assert.doesNotMatch(ENGLISH_WRITING_SEQUENCE_RUNTIME, /detail\s*:\s*(payload\.compiledText|completed\.map)/);
  assert.doesNotThrow(() => new vm.Script(ENGLISH_WRITING_SEQUENCE_RUNTIME, { filename: "english-writing-sequence-runtime.js" }));
});

test("ELA 20-1 workbook profile isolates Critical Essay drafts by text while retaining unit-scoped Personal Response", () => {
  const rendered = renderEnglishWritingSequences({
    namespace: "ela20-1-short-stories-test",
    courseCode: "ELA 20-1",
    unitTitle: "Short Stories",
    profileKind: "short-fiction",
    works: [
      { id: "lamp-at-noon", title: "The Lamp at Noon", author: "Sinclair Ross", kind: "text" },
      { id: "sea-devil", title: "The Sea Devil", author: "Arthur Gordon", kind: "text" },
    ],
    visualProfile: "ela20-workbook",
    criticalEssayTrackMode: "per-work",
    personalResponseTrackMode: "unit",
    includeCriticalEssay: true,
    includePersonalResponse: true,
  });

  const guide = rendered.pages.find((page) => page.id === "critical-essay")?.html ?? "";
  const criticalStage = rendered.pages.find((page) => page.id === "critical-essay-topic-interpretation")?.html ?? "";
  const criticalPreview = rendered.pages.find((page) => page.id === "critical-essay-preview")?.html ?? "";
  const personalStage = rendered.pages.find((page) => page.id === "personal-response-prompt-impression")?.html ?? "";

  assert.match(guide, /data-english-writing-track-select="ela20-1-short-stories-test:critical-essay"/);
  assert.match(guide, /The Lamp at Noon — Sinclair Ross/);
  assert.match(guide, /The Sea Devil — Arthur Gordon/);
  assert.match(criticalStage, /ela20-1-short-stories-test:critical-essay:lamp-at-noon:topic-interpretation:assigned-topic/);
  assert.match(criticalStage, /ela20-1-short-stories-test:critical-essay:sea-devil:topic-interpretation:assigned-topic/);
  assert.match(criticalStage, /data-evidence-collection-id="ela20-1-short-stories-test:critical-essay:lamp-at-noon:topic-interpretation:collection"/);
  assert.match(criticalPreview, /data-english-writing-work-id="lamp-at-noon"/);
  assert.match(criticalPreview, /data-english-writing-work-id="sea-devil"/);
  assert.match(personalStage, /ela20-1-short-stories-test:personal-response:unit:prompt-impression:prompt/);
  assert.doesNotMatch(personalStage, /personal-response:lamp-at-noon:/);
  assert.match(rendered.css, /\.english-writing-workbook-stage > \.english-writing-stage-header[\s\S]*background: #161a17;/);
  assert.match(rendered.css, /\.english-writing-support-grid > \.english-writing-tip[\s\S]*background: #fffaf0;/);
  assert.match(rendered.css, /\.english-writing-workbook-page \{[\s\S]*max-width: 1120px;[\s\S]*padding: 34px;/);
  assert.match(rendered.css, /\.english-writing-workbook-page \{[\s\S]*font-family: "Work Sans", "Aptos", "Helvetica Neue", sans-serif;/);
  assert.match(rendered.css, /\.english-writing-workbook-page \.english-writing-page-header > \.route-title \{[\s\S]*font-size: 2rem;[\s\S]*line-height: 1\.15;/);
  assert.match(rendered.css, /\.english-writing-workbook-page \.english-writing-track-picker \{[\s\S]*max-width: 560px;[\s\S]*margin: 20px 0;[\s\S]*border: 0;/);
  assert.match(rendered.css, /\.english-writing-workbook-stage > \.english-writing-stage-header \{[\s\S]*display: flex;[\s\S]*align-items: flex-start;[\s\S]*justify-content: space-between;[\s\S]*padding: 22px;/);
  assert.match(rendered.css, /\.english-writing-workbook-stage \.english-writing-progress \{[\s\S]*min-width: 260px;/);
  assert.match(rendered.css, /\.english-writing-workbook-page \.english-writing-field textarea \{[\s\S]*min-height: 112px;[\s\S]*padding: 11px;/);
  assert.match(ENGLISH_WRITING_SEQUENCE_RUNTIME, /data-english-writing-track-panel/);
  assert.match(ENGLISH_WRITING_SEQUENCE_RUNTIME, /const prefix=`\$\{namespace\}:\$\{kind\}:\$\{workId\}:`/);
});

test("ELA 20-1 writing copy uses medium-specific selectors, articles, and creator language", () => {
  const stories = renderEnglishWritingSequences({
    namespace: "ela20-1-story-copy",
    courseCode: "ELA 20-1",
    unitTitle: "Short Stories",
    profileKind: "short-fiction",
    works: [
      { id: "lamp", title: "The Lamp at Noon", kind: "text" },
      { id: "sea-devil", title: "The Sea Devil", kind: "text" },
    ],
    visualProfile: "ela20-workbook",
    includePersonalResponse: true,
  });
  const storyOpening = stories.pages.find((page) => page.id === "personal-response-prompt-impression")?.html ?? "";
  assert.match(storyOpening, />Short story<\/label>/);
  assert.match(storyOpening, /Choose the short story that will anchor this response\./);
  assert.doesNotMatch(storyOpening, /Choose the text, play, novel, or film/);

  const play = renderEnglishWritingSequences({
    namespace: "ela20-1-play-copy",
    courseCode: "ELA 20-1",
    unitTitle: "Macbeth",
    profileKind: "shakespeare-drama",
    works: [{ id: "macbeth", title: "Macbeth", kind: "play" }],
    visualProfile: "ela20-workbook",
    includePersonalResponse: true,
  });
  const playEvidence = play.pages.find((page) => page.id === "personal-response-text-evidence")?.html ?? "";
  assert.match(playEvidence, /Use an act, scene, line, stage direction, action, or dramatic choice as meaningful support\./);
  assert.match(playEvidence, /playwright&#39;s choice/);
  assert.doesNotMatch(playEvidence, /Use a act/);
  assert.doesNotMatch(playEvidence, /creator&#39;s choice/);

  const novels = renderEnglishWritingSequences({
    namespace: "ela20-1-novel-copy",
    courseCode: "ELA 20-1",
    unitTitle: "Novel Study",
    profileKind: "novel-study",
    works: [
      { id: "flies", title: "Lord of the Flies", kind: "novel" },
      { id: "book-thief", title: "The Book Thief", kind: "novel" },
    ],
    visualProfile: "ela20-workbook",
    includePersonalResponse: true,
  });
  const novelOpening = novels.pages.find((page) => page.id === "personal-response-prompt-impression")?.html ?? "";
  const novelEvidence = novels.pages.find((page) => page.id === "personal-response-text-evidence")?.html ?? "";
  assert.match(novelOpening, />Novel<\/label>/);
  assert.match(novelOpening, /Choose the novel that will anchor this response\./);
  assert.match(novelEvidence, /author&#39;s choice/);
  assert.doesNotMatch(novelEvidence, /creator&#39;s choice/);
});

test("Recipe V3 writing forms render exactly in configured order without legacy Critical Essay output", () => {
  const rendered = renderEnglishWritingSequences({
    namespace: "ela20-2-short-stories",
    courseCode: "ELA 20-2",
    unitTitle: "Short Stories",
    profileKind: "short-fiction",
    works: [
      { id: "lamp-at-noon", title: "The Lamp at Noon", author: "Sinclair Ross", kind: "text" },
      { id: "sea-devil", title: "The Sea Devil", author: "Arthur Gordon", kind: "text" },
    ],
    visualProfile: "ela20-workbook",
    includeCriticalEssay: true,
    writingForms: [
      { kind: "literary-exploration", trackMode: "per-work" },
      { kind: "personal-response", trackMode: "per-work" },
    ],
  });

  assert.deepEqual(rendered.navGroups.map((group) => group.id), ["literary-exploration", "personal-response"]);
  assert.equal(rendered.pages.length, 16);
  assert.equal(rendered.pages.some((page) => page.id.startsWith("critical-essay")), false);
  assert.equal(rendered.pages.some((page) => page.id.startsWith("visual-response")), false);
  assert.doesNotMatch(rendered.runtime, /visual-response|critical-essay/);
  assert.ok(rendered.pages.some((page) => page.id === "literary-exploration-body-assigned-text"));
  assert.ok(rendered.pages.some((page) => page.id === "personal-response-text-evidence"));
  const literaryStage = rendered.pages.find((page) => page.id === "literary-exploration-prompt-controlling-idea")?.html ?? "";
  assert.match(literaryStage, /data-english-writing-track-panel="ela20-2-short-stories:literary-exploration"/);
  assert.match(literaryStage, /ela20-2-short-stories:literary-exploration:lamp-at-noon:prompt-controlling-idea:assigned-prompt/);
  assert.match(literaryStage, /ela20-2-short-stories:literary-exploration:sea-devil:prompt-controlling-idea:assigned-prompt/);
});

test("ELA 30-2 Visual Response renders PACES, isolated prose branches, and Diploma guidance", () => {
  const rendered = renderEnglishWritingSequences({
    namespace: "ela30-2-short-stories-visual-literacy",
    courseCode: "ELA 30-2",
    unitTitle: "Short Stories and Visual Literacy",
    profileKind: "short-fiction",
    works: [
      { id: "current-visual", title: "Current visual", kind: "visual" },
    ],
    visualProfile: "ela20-workbook",
    writingForms: [
      { kind: "literary-exploration", trackMode: "unit" },
      { kind: "personal-response", trackMode: "unit" },
      { kind: "visual-response", trackMode: "per-work" },
    ],
  });

  assert.deepEqual(rendered.navGroups.map((group) => group.id), [
    "literary-exploration",
    "personal-response",
    "visual-response",
  ]);
  assert.equal(rendered.pages.length, 24);
  assert.ok(rendered.pages.some((page) => page.id === "visual-response-paces"));
  assert.ok(rendered.pages.some((page) => page.id === "visual-response-prose-form"));
  const guide = rendered.pages.find((page) => page.id === "visual-response")?.html ?? "";
  const paces = rendered.pages.find((page) => page.id === "visual-response-paces")?.html ?? "";
  const plan = rendered.pages.find((page) => page.id === "visual-response-prose-form")?.html ?? "";
  assert.match(guide, /Diploma connection/);
  assert.match(guide, /300–700 words/);
  assert.match(guide, /10%/);
  assert.match(plan, /visual-response:current-visual:prose-form:critical-plan/);
  assert.match(plan, /visual-response:current-visual:prose-form:creative-plan/);
  assert.match(plan, /visual-response:current-visual:prose-form:personal-plan/);
  assert.match(plan, /Creative additions must be presented as invention/);
  assert.match(paces, /data-repeatable-evidence-panel/);
  assert.match(paces, /data-repeatable-evidence-prefix="ela30-2-short-stories-visual-literacy:visual-response:current-visual:paces-evidence"/);
  assert.match(paces, /Save PACES Evidence to Evidence Bank/);
  assert.match(paces, /data-evidence-draft="detail"/);
  assert.match(paces, /data-repeatable-evidence-new/);
  assert.doesNotMatch(rendered.pages.find((page) => page.id === "personal-response-text-evidence")?.html ?? "", /data-repeatable-evidence-prefix=.*paces-evidence/);
});

test("Recipe V3 enforces -2 writing form membership and order", async () => {
  const base = JSON.parse(await readFile(path.resolve("projects/ela20-1-modern-play-crucible/meta/english-unit.json"), "utf8")) as Record<string, unknown>;
  const valid20 = {
    ...base,
    schemaVersion: 3,
    projectSlug: "ela20-2-modern-play-crucible",
    courseCode: "ELA 20-2",
    courseTitle: "English Language Arts 20-2",
    derivesFromProject: "ela20-1-modern-play-crucible",
    writingForms: [
      { kind: "literary-exploration", trackMode: "unit" },
      { kind: "personal-response", trackMode: "unit" },
    ],
  };
  assert.equal(EnglishUnitRecipeV3Schema.safeParse(valid20).success, true);
  assert.equal(EnglishUnitRecipeV3Schema.safeParse({
    ...valid20,
    writingForms: [],
  }).success, false, "non-foundation ELA -2 units still require their writing forms");
  const parsed20 = parseEnglishUnitRecipe(valid20);
  assert.equal(parsed20.schemaVersion, 3);
  assert.deepEqual("writingForms" in parsed20 ? parsed20.writingForms.map((form) => form.kind) : [], [
    "literary-exploration",
    "personal-response",
  ]);
  assert.equal(EnglishUnitRecipeV3Schema.safeParse({
    ...valid20,
    writingForms: [
      { kind: "literary-exploration", trackMode: "unit" },
      { kind: "literary-exploration", trackMode: "unit" },
    ],
  }).success, false);
  assert.equal(EnglishUnitRecipeV3Schema.safeParse({
    ...valid20,
    writingForms: [
      { kind: "critical-essay", trackMode: "unit" },
      { kind: "personal-response", trackMode: "unit" },
    ],
  }).success, false);
  assert.equal(EnglishUnitRecipeV3Schema.safeParse({
    ...valid20,
    writingForms: [
      { kind: "personal-response", trackMode: "unit" },
      { kind: "literary-exploration", trackMode: "unit" },
    ],
  }).success, false);
  assert.equal(EnglishUnitRecipeV3Schema.safeParse({
    ...valid20,
    writingForms: [
      { kind: "literary-exploration", trackMode: "unit" },
      { kind: "personal-response", trackMode: "unit" },
      { kind: "visual-response", trackMode: "unit" },
    ],
  }).success, false);
  assert.equal(EnglishUnitRecipeV3Schema.safeParse({
    ...valid20,
    projectSlug: "ela30-2-modern-drama-streetcar",
    courseCode: "ELA 30-2",
    courseTitle: "English Language Arts 30-2",
    writingForms: [
      { kind: "literary-exploration", trackMode: "unit" },
      { kind: "personal-response", trackMode: "unit" },
      { kind: "visual-response", trackMode: "unit" },
    ],
  }).success, true);

  const writingFoundations = JSON.parse(await readFile(
    path.resolve("projects/ela10-2-writing-foundations/meta/english-unit.json"),
    "utf8"
  )) as Record<string, unknown>;
  assert.equal(EnglishUnitRecipeV3Schema.safeParse(writingFoundations).success, true);
  assert.deepEqual(
    "writingForms" in writingFoundations ? writingFoundations.writingForms : undefined,
    []
  );
});

test("writing-foundations activity profiles use the shared activity and evidence contracts", () => {
  const profile = {
    schemaVersion: 1,
    kind: "writing-foundations",
    activities: [
      {
        id: "sentence-lab",
        title: "Sentence Lab",
        route: "sentence-lab",
        enabled: true,
        evidencePolicyIds: ["corrected-sentence-set"],
      },
    ],
    evidencePolicies: [
      {
        id: "corrected-sentence-set",
        activityId: "sentence-lab",
        saveMode: "collection",
        requiresExplicitSave: true,
        contributionIdTemplate: "{project}:sentence-lab:corrected-sentence-set",
        collectionScope: "activity",
      },
    ],
  };
  assert.equal(EnglishActivityProfileV1Schema.safeParse(profile).success, true);
});

test("writing profile normalization is immutable and idempotent", () => {
  const source: EnglishActivityProfileV1 = {
    schemaVersion: 1,
    kind: "modern-drama",
    actIds: ["act-one"],
    characterIds: ["protagonist"],
    criticalEssay: true,
    activities: [],
    evidencePolicies: [],
  };
  const first = ensureStandardEnglishWritingProfile(source);
  const second = ensureStandardEnglishWritingProfile(first);
  assert.deepEqual(second, first);
  assert.deepEqual(source.activities, []);
  assert.deepEqual(first.activities.map((activity) => activity.route), ["critical-essay", "personal-response"]);
  assert.ok(first.evidencePolicies.every((policy) => policy.requiresExplicitSave));
});

test("ELA 30-1 additive writing retrofit is idempotent and injects only missing sequences", async () => {
  for (const projectSlug of ELA30_WRITING_PROJECT_SLUGS) {
    const first = applyEla30WritingRetrofit({ projectSlug, html: await sourceFor(projectSlug) });
    const second = applyEla30WritingRetrofit({ projectSlug, html: first.html });
    assert.equal(second.html, first.html, `${projectSlug} writing retrofit drifted`);
    assert.equal(second.outputHash, first.outputHash, `${projectSlug} output hash drifted`);
    assert.match(first.html, /id="personal-response"/);
    assert.match(first.html, /id="personal-response-preview"/);
    assert.match(first.html, /<style data-ela30-writing-retrofit-styles>[\s\S]*\.english-activity-page\s*\{[\s\S]*<\/style>/);
    assert.match(first.html, /\.english-writing-sequence-page\s*\{\s*scroll-margin-top:\s*88px;/);
    const writingStyle = first.html.match(/<style data-ela30-writing-retrofit-styles>([\s\S]*?)<\/style>/)?.[1] ?? "";
    assert.match(writingStyle, /\.ela30-writing-nav-group\.is-open \.nav-group-subnav\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\);/);
    assert.match(writingStyle, /\.ela30-writing-nav-group \.nav-group-subnav\s*\{[\s\S]*margin:\s*4px 8px 8px 48px;/);
    assert.match(writingStyle, /\.ela30-writing-nav-group \.sublesson-link\s*\{[\s\S]*padding:\s*7px 0;[\s\S]*font-size:\s*13px;/);
    assert.match(writingStyle, /\.english-writing-workbook-page\s*\{[\s\S]*max-width:\s*none;[\s\S]*margin-inline:\s*0;/);
    const expectedBreakpoint = projectSlug === "ela30-1-shakespeare-othello"
      ? 1024
      : projectSlug === "ela30-1-short-stories" || projectSlug === "ela30-1-modern-drama"
        ? 1050
        : 1100;
    assert.match(writingStyle, new RegExp(`@media \\(max-width: ${expectedBreakpoint}px\\) \\{\\s*\\.english-writing-sequence-page`));
    assert.match(first.html, new RegExp(`window\\.matchMedia\\(\"\\(max-width: ${expectedBreakpoint}px\\)\"\\)`));
    if (expectedBreakpoint !== 1100) {
      assert.doesNotMatch(writingStyle, /@media \(max-width: 1100px\) \{\s*\.english-writing-sequence-page/, `${projectSlug} should use its own shell breakpoint instead of 1100px`);
    }
    assert.match(first.html, /\.ela30-writing-nav-group \.sublesson-link\[data-page-target\]/);
    assert.match(first.html, /document\.body\.classList\.add\("sidebar-collapsed"\)/);
    assert.doesNotMatch(first.html.slice(first.html.indexOf("<body")), /\.english-activity-page\s*\{/);
    assert.match(first.html, /class="nav-group ela30-writing-nav-group"/);
    assert.match(first.html, /class="course-nav-link nav-group-toggle flex items-center gap-sm font-label-md text-label-md rounded-lg mx-2 px-4 py-3 transition-colors"/);
    assert.match(first.html, /<span class="sidebar-label">Personal Response<\/span>/);
    assert.doesNotMatch(first.html, /class="lesson-subnav nav-group-subnav"[^>]*\shidden/);
    first.routeIds.forEach((routeId) => {
      assert.match(first.html, new RegExp(`id="${routeId}" data-page="${routeId}"`), `${projectSlug} should expose ${routeId} to legacy data-page routers`);
    });
    const lessonsIndex = first.html.indexOf('class="lessons-nav');
    const retrofitNavIndex = first.html.indexOf("<!-- canvas-helper:ela30-writing-retrofit:nav:start -->");
    const personalResponseIndex = first.html.indexOf('<span class="sidebar-label">Personal Response</span>', retrofitNavIndex);
    assert.ok(lessonsIndex >= 0 && retrofitNavIndex > lessonsIndex, `${projectSlug} writing navigation should follow Lessons`);
    assert.ok(personalResponseIndex > retrofitNavIndex, `${projectSlug} should show Personal Response in the writing navigation block`);
    if (projectSlug.endsWith("novel-study-legacy") || projectSlug.endsWith("feature-film-legacy")) {
      assert.match(first.html, /<p class="sidebar-course-label">ELA 30-1<\/p>/);
      assert.doesNotMatch(first.html, /<p class="sidebar-course-label">ELA 20-1<\/p>/);
    }
    assert.equal(first.routeIds.length, 16, `${projectSlug} should expose both standard writing sequences`);
    assert.match(first.html, /id="critical-essay-preview"/);
    const criticalEssayIndex = first.html.indexOf('<span class="sidebar-label">Critical Essay</span>', retrofitNavIndex);
    assert.ok(criticalEssayIndex > retrofitNavIndex && criticalEssayIndex < personalResponseIndex, `${projectSlug} should order Critical Essay before Personal Response`);
    if (projectSlug === "ela30-1-short-stories") {
      assert.match(first.html, /data-english-writing-track-select="ela30-1-short-stories:critical-essay"/);
      assert.match(first.html, /By the Waters of Babylon \u2014 Stephen Vincent Ben\u00e9t/);
      assert.match(first.html, /The Jilting of Granny Weatherall \u2014 Katherine Anne Porter/);
      assert.match(first.html, /ela30-1-short-stories:critical-essay:by-the-waters-of-babylon:topic-interpretation:assigned-topic/);
      assert.doesNotMatch(first.html, /ela30-1-short-stories:critical-essay:unit:topic-interpretation:assigned-topic/);
    }
  }
});

test("ELA 30-1 writing and Evidence Bank retrofits compose in either order", async () => {
  for (const projectSlug of ELA30_WRITING_PROJECT_SLUGS) {
    const source = await sourceFor(projectSlug);
    const writingThenEvidence = applyEnglishEvidenceRetrofitToHtml({
      projectSlug,
      html: applyEla30WritingRetrofit({ projectSlug, html: source }).html,
    }).html;
    const evidenceThenWriting = applyEla30WritingRetrofit({
      projectSlug,
      html: applyEnglishEvidenceRetrofitToHtml({ projectSlug, html: source }).html,
    }).html;
    assert.equal(evidenceThenWriting, writingThenEvidence, `${projectSlug} enhancer order changed the output`);
    assert.equal(
      applyEla30WritingRetrofit({ projectSlug, html: writingThenEvidence }).html,
      writingThenEvidence,
      `${projectSlug} writing enhancer drifted after Evidence Bank injection`,
    );
    assert.equal(
      applyEnglishEvidenceRetrofitToHtml({ projectSlug, html: writingThenEvidence }).html,
      writingThenEvidence,
      `${projectSlug} Evidence Bank enhancer drifted after writing injection`,
    );
  }
});

test("ELA 30-1 builder-backed projects chain Evidence Bank and writing enhancers", async () => {
  const [stories, othello, streetcar] = await Promise.all([
    readFile(path.resolve("scripts/build-ela-short-stories.ts"), "utf8"),
    readFile(path.resolve("scripts/build-ela-shakespeare-othello.ts"), "utf8"),
    readFile(path.resolve("scripts/lib/ela-modern-drama.ts"), "utf8"),
  ]);
  for (const source of [stories, othello, streetcar]) {
    assert.match(source, /applyEnglishEvidenceRetrofitToHtml/);
    assert.match(source, /applyEla30WritingRetrofit/);
  }
});

test("ELA 30-1 contract updater retains existing scenarios and adds writing coverage", () => {
  const updated = updateEla30E2EContract({
    projectSlug: "ela30-1-short-stories",
    learnerCourse: {
      enabled: true,
      routes: ["overview", "evidence-bank"],
      hintRoutes: [],
      printRoutes: [],
      evidenceScenario: { route: "questions", collectionId: "existing", responseId: "answer" },
      resourceChecks: [],
      mobile: { width: 390, height: 844, routes: ["overview"] },
    },
  }, "ela30-1-short-stories", [
    "critical-essay",
    "critical-essay-topic-interpretation",
    "critical-essay-preview",
    "personal-response",
    "personal-response-prompt-impression",
    "personal-response-preview",
  ]);
  const learner = updated.learnerCourse as Record<string, unknown>;
  assert.equal("evidenceScenario" in learner, false);
  assert.equal((learner.evidenceScenarios as unknown[]).length, 3);
  assert.ok((learner.evidenceScenarios as Array<Record<string, unknown>>).some((scenario) =>
    scenario.collectionId === "ela30-1-short-stories:critical-essay:by-the-waters-of-babylon:topic-interpretation:collection"));
  assert.ok((learner.routes as string[]).includes("personal-response-preview"));
  assert.ok((learner.hintRoutes as string[]).includes("critical-essay-topic-interpretation"));
  assert.ok((learner.printRoutes as string[]).includes("personal-response-preview"));
});
