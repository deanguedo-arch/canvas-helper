import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import JSZip from "jszip";

import {
  EnglishDonorLessonResolutionError,
  englishV3DonorLessonInternals,
  hydrateEnglishV3DonorData,
  inspectEnglishV3DonorLessonPlans,
  normalizeEnglishV3ResolvedLessons,
  resolveEnglishV3DonorLessons
} from "./v3-donor-lessons.js";
import type { EnglishBuildReportItem, EnglishUnitRecipeV1, EnglishUnitRecipeV2, EnglishUnitRecipeV3 } from "./types.js";

const emptyMediaPolicy = {
  verifiedAt: "2026-07-22",
  allowedYouTubeIds: [] as string[],
  blockedYouTubeIds: [] as string[],
  approvedExternalUrls: [] as string[],
  externalUrlRewrites: {} as Record<string, string>
};

function v2Recipe(projectSlug: string, brightspaceZip: string, itemId = "lesson-v2"): EnglishUnitRecipeV2 {
  return {
    schemaVersion: 2,
    projectSlug,
    courseCode: "ELA 20-1",
    courseTitle: "Donor Course",
    unitTitle: "Donor Unit",
    profileVersion: "test-v1",
    status: "draft",
    source: {
      brightspaceZip,
      teacherResourcesZip: "teacher.zip",
      brightspaceUnitId: "unit-v2",
      teacherFolder: "Donor Unit",
      lessonSelectors: [{ itemId, disposition: "include", title: "Configured Donor Lesson" }]
    },
    activityProfile: { schemaVersion: 1, kind: "writing-foundations", activities: [], evidencePolicies: [] },
    lessonOrder: ["Configured Donor Lesson"],
    topLevelLessonOrder: ["Configured Donor Lesson"],
    lessonGroups: [],
    readings: [],
    placements: [],
    analysisTerms: [],
    analysisExamples: [],
    resourceDispositions: [],
    excludedFiles: [],
    wordingCorrections: [{ find: "Donor wording", replace: "Reviewed wording", reason: "Preserve donor decisions." }],
    mediaPolicy: { ...emptyMediaPolicy },
    customComponents: [],
    acceptance: { requiredRoutes: [], requiredActivityIds: [], reviewItems: [] }
  };
}

function v1Recipe(projectSlug: string, brightspaceZip: string): EnglishUnitRecipeV1 {
  return {
    schemaVersion: 1,
    projectSlug,
    courseCode: "ELA 10-1",
    courseTitle: "Legacy Donor Course",
    unitTitle: "Legacy Donor Unit",
    source: {
      brightspaceZip,
      teacherResourcesZip: "teacher.zip",
      brightspaceUnitId: "unit-v1",
      teacherFolder: "Legacy Unit"
    },
    lessonOrder: ["Legacy Donor Lesson"],
    topLevelLessonOrder: ["Legacy Donor Lesson"],
    fictionElementsHub: { hubLesson: "Legacy Donor Lesson", childLessons: [] },
    readings: [],
    placements: [],
    analysisTerms: [],
    analysisExamples: [],
    excludedFiles: [],
    wordingCorrections: [{ find: "Legacy wording", replace: "Reviewed legacy wording", reason: "Preserve V1 decisions." }],
    mediaPolicy: { ...emptyMediaPolicy }
  };
}

function v3Target(projectSlug: string, donorSlugs: string[], courseCode = "ELA 20-2"): EnglishUnitRecipeV3 {
  const base = v2Recipe(projectSlug, "unused-target.zip", "unused-target");
  return {
    ...base,
    schemaVersion: 3,
    projectSlug,
    courseCode,
    courseTitle: `${courseCode} Test Course`,
    derivesFromProject: donorSlugs[0] ?? "missing-donor",
    writingForms: [
      { kind: "literary-exploration", trackMode: "unit" },
      { kind: "personal-response", trackMode: "unit" }
    ],
    source: {
      ...base.source,
      lessonSelectors: donorSlugs.map((slug) => ({
        itemId: `donor:${slug}`,
        disposition: "include" as const,
        title: `Lessons from ${slug}`
      }))
    },
    wordingCorrections: []
  };
}

async function fixtureZip() {
  const zip = new JSZip();
  zip.file("imsmanifest.xml", `<?xml version="1.0" encoding="UTF-8"?>
    <manifest>
      <organizations><organization identifier="org">
        <item identifier="unit-v1"><title>Legacy Unit</title>
          <item identifier="lesson-v1" identifierref="res-v1"><title>Legacy Donor Lesson</title></item>
        </item>
        <item identifier="lesson-v2" identifierref="res-v2"><title>Source Donor Lesson</title></item>
      </organization></organizations>
      <resources>
        <resource identifier="res-v1" href="content/v1.html" />
        <resource identifier="res-v2" href="content/v2.html" />
      </resources>
    </manifest>`);
  zip.file("content/v1.html", "<html><body><h1>Legacy Donor Lesson</h1><p>ELA 10-1 Legacy wording.</p></body></html>");
  zip.file("content/v2.html", "<html><body><h1>Source Donor Lesson</h1><p>ELA 20-1 Donor wording.</p></body></html>");
  return await zip.generateAsync({ type: "nodebuffer" });
}

async function finalTargetCorrectionFixtureZip() {
  const zip = await JSZip.loadAsync(await fixtureZip());
  zip.file("content/v2.html", `<html><body>
    <h1>Source Donor Lesson</h1>
    <p>ELA 20-1 Donor wording.</p>
    <p>Discussion at the English Language Arts 30-1 level.</p>
    <p>In all probability, you viewed and critiqued movies as part of your English Language Arts 20-1 and 20-1 courses.</p>
  </body></html>`);
  return await zip.generateAsync({ type: "nodebuffer" });
}

async function withFixtureRepo(run: (repoRoot: string) => Promise<void>) {
  const repoRoot = await mkdtemp(path.join(tmpdir(), "english-v3-donor-test-"));
  try {
    await run(repoRoot);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
}

async function writeRecipe(repoRoot: string, projectSlug: string, recipe: EnglishUnitRecipeV1 | EnglishUnitRecipeV2) {
  const metaDir = path.join(repoRoot, "projects", projectSlug, "meta");
  await mkdir(metaDir, { recursive: true });
  await writeFile(path.join(metaDir, "english-unit.json"), `${JSON.stringify(recipe, null, 2)}\n`);
}

function curatedV1Donor(projectSlug: string, brightspaceZip: string): EnglishUnitRecipeV1 {
  const recipe = v1Recipe(projectSlug, brightspaceZip);
  recipe.readings = [
    {
      id: "donor-lamp",
      title: "The Lamp at Noon",
      author: "Sinclair Ross",
      kind: "short-fiction",
      group: "Short Fiction",
      readingFile: "donor-lamp.pdf",
      questionFile: "donor-lamp.pdf",
      questionPages: [9],
      questionPrompts: [{ id: "q1", prompt: "How does the storm shape the conflict?", sourcePage: 9 }]
    },
    {
      id: "donor-other",
      title: "A Different Work",
      author: "Donor Author",
      kind: "short-fiction",
      group: "Short Fiction",
      readingFile: "donor-other.pdf",
      questionFile: "donor-other-questions.pdf",
      questionPrompts: [{ id: "q1", prompt: "This prompt must not cross into another work." }]
    }
  ];
  recipe.analysisTerms = [{
    id: "setting",
    category: "Elements of Fiction",
    label: "Setting",
    definition: "How place and conditions shape conflict."
  }];
  recipe.analysisExamples = [
    {
      readingId: "donor-lamp",
      termId: "setting",
      term: "Setting",
      evidenceMoment: "The dust blocks the daylight.",
      analysis: "The setting acts as pressure on the family."
    },
    {
      readingId: "donor-other",
      termId: "setting",
      term: "Setting",
      evidenceMoment: "Unmatched evidence.",
      analysis: "This example must not be inherited."
    }
  ];
  recipe.placements = [
    {
      targetLesson: "Legacy Donor Lesson",
      readingIds: ["donor-lamp"],
      questionRefs: ["donor-lamp:q1"],
      purpose: "Connect setting to conflict."
    },
    {
      targetLesson: "Legacy Donor Lesson",
      readingIds: ["donor-lamp", "donor-other"],
      questionRefs: ["donor-lamp:q1", "donor-other:q1"],
      purpose: "This mixed-work placement is unsafe for a partial match."
    }
  ];
  return recipe;
}

function shortFictionHydrationTarget(projectSlug: string, donorSlug: string): EnglishUnitRecipeV3 {
  const recipe = v3Target(projectSlug, [donorSlug]);
  recipe.activityProfile = {
    schemaVersion: 1,
    kind: "short-fiction",
    readerMode: "text-bank",
    questionCollectionScope: "story",
    analysisExplorer: true,
    activities: [],
    evidencePolicies: []
  };
  recipe.lessonOrder = [`donor:${donorSlug}`];
  recipe.topLevelLessonOrder = [`donor:${donorSlug}`];
  recipe.lessonGroups = [{
    id: "unit-lessons",
    title: "Short Stories",
    lessonIds: [`donor:${donorSlug}`]
  }];
  recipe.readings = [
    {
      id: "target-lamp",
      title: "The Lamp at Noon",
      author: "Sinclair Ross",
      kind: "short-fiction",
      group: "Assigned Stories",
      readingFile: "target-lamp.pdf",
      questionFile: "target-lamp-questions.pdf"
    },
    {
      id: "target-other",
      title: "A Different Work",
      author: "Different Author",
      kind: "short-fiction",
      group: "Assigned Stories",
      readingFile: "target-other.pdf",
      questionFile: "target-other-questions.pdf"
    }
  ];
  recipe.placements = [];
  recipe.analysisTerms = [];
  recipe.analysisExamples = [];
  return recipe;
}

test("V3 donor data hydration inherits curated activity data only for exact work matches", async () => {
  await withFixtureRepo(async (repoRoot) => {
    const donorSlug = "ela20-1-curated-donor";
    const donorSource = path.join(repoRoot, "projects", donorSlug, "raw", "donor.zip");
    await mkdir(path.dirname(donorSource), { recursive: true });
    await writeFile(donorSource, "source data is not needed for recipe hydration");
    await writeRecipe(repoRoot, donorSlug, curatedV1Donor(donorSlug, "raw/donor.zip"));
    const donorWorkspace = path.join(repoRoot, "projects", donorSlug, "workspace");
    await mkdir(donorWorkspace, { recursive: true });
    await writeFile(path.join(donorWorkspace, "index.html"), "<p>Workspace-only prompt that must never be read.</p>");

    const result = await hydrateEnglishV3DonorData({
      repoRoot,
      recipe: shortFictionHydrationTarget("ela20-2-derived", donorSlug)
    });

    assert.equal(result.source?.kind, "recipe-v1");
    assert.equal(result.source?.recipePath, path.join(repoRoot, "projects", donorSlug, "meta", "english-unit.json"));
    assert.deepEqual(result.matchedReadings, [{ donorReadingId: "donor-lamp", targetReadingId: "target-lamp" }]);
    assert.deepEqual(result.recipe.readings[0]?.questionPages, [9]);
    assert.equal(result.recipe.readings[0]?.questionPrompts?.[0]?.prompt, "How does the storm shape the conflict?");
    assert.equal(result.recipe.readings[0]?.readingFile, "target-lamp.pdf");
    assert.equal(result.recipe.readings[1]?.questionPrompts, undefined);
    assert.deepEqual(result.recipe.lessonOrder, ["Legacy Donor Lesson"]);
    assert.deepEqual(result.recipe.topLevelLessonOrder, ["Legacy Donor Lesson"]);
    assert.deepEqual(result.recipe.lessonGroups[0]?.lessonIds, ["Legacy Donor Lesson"]);
    assert.deepEqual(result.recipe.analysisTerms.map((term) => term.id), ["setting"]);
    assert.deepEqual(result.recipe.analysisExamples.map((example) => example.readingId), ["target-lamp"]);
    assert.deepEqual(result.recipe.placements, [{
      targetLesson: "Legacy Donor Lesson",
      readingIds: ["target-lamp"],
      questionRefs: ["target-lamp:q1"],
      purpose: "Connect setting to conflict."
    }]);
    assert.deepEqual(result.recipe.fictionElementsHub, { hubLesson: "Legacy Donor Lesson", childLessons: [] });
    assert.deepEqual(result.inherited, {
      questionPromptReadings: 1,
      questionPrompts: 1,
      questionPageSelections: 1,
      analysisTerms: 1,
      analysisExamples: 1,
      placements: 1,
      fictionElementsHub: true,
      lessonStructure: true
    });
  });
});

test("V3 donor data hydration preserves explicit target activity decisions", async () => {
  await withFixtureRepo(async (repoRoot) => {
    const donorSlug = "ela20-1-curated-donor";
    const donorSource = path.join(repoRoot, "projects", donorSlug, "raw", "donor.zip");
    await mkdir(path.dirname(donorSource), { recursive: true });
    await writeFile(donorSource, "source data is not needed for recipe hydration");
    await writeRecipe(repoRoot, donorSlug, curatedV1Donor(donorSlug, "raw/donor.zip"));

    const target = shortFictionHydrationTarget("ela20-2-explicit", donorSlug);
    target.readings[0]!.questionPages = [4];
    target.readings[0]!.questionPrompts = [{ id: "custom", prompt: "Use the target question." }];
    target.analysisTerms = [{ id: "custom", category: "Target", label: "Target term", definition: "Target definition." }];
    target.analysisExamples = [{
      readingId: "target-lamp",
      termId: "custom",
      term: "Target term",
      evidenceMoment: "Target evidence.",
      analysis: "Target analysis."
    }];
    target.placements = [{
      targetLesson: "Legacy Donor Lesson",
      readingIds: ["target-lamp"],
      questionRefs: ["target-lamp:custom"],
      purpose: "Target placement."
    }];
    target.fictionElementsHub = { hubLesson: "Legacy Donor Lesson", childLessons: [] };

    const result = await hydrateEnglishV3DonorData({ repoRoot, recipe: target });

    assert.deepEqual(result.recipe.readings[0]?.questionPages, [4]);
    assert.deepEqual(result.recipe.readings[0]?.questionPrompts, [{ id: "custom", prompt: "Use the target question." }]);
    assert.deepEqual(result.recipe.analysisTerms, target.analysisTerms);
    assert.deepEqual(result.recipe.analysisExamples, target.analysisExamples);
    assert.deepEqual(result.recipe.placements, target.placements);
    assert.deepEqual(result.recipe.fictionElementsHub, target.fictionElementsHub);
    assert.deepEqual(result.inherited, {
      questionPromptReadings: 0,
      questionPrompts: 0,
      questionPageSelections: 0,
      analysisTerms: 0,
      analysisExamples: 0,
      placements: 0,
      fictionElementsHub: false,
      lessonStructure: true
    });
  });
});

test("V3 donor resolver loads a V2 recipe from source data and preserves donor cleanup decisions", async () => {
  await withFixtureRepo(async (repoRoot) => {
    const donorSlug = "ela20-1-source-donor";
    const sourcePath = path.join(repoRoot, "sources", "donor.zip");
    await mkdir(path.dirname(sourcePath), { recursive: true });
    await writeFile(sourcePath, await fixtureZip());
    await writeRecipe(repoRoot, donorSlug, v2Recipe(donorSlug, "sources/donor.zip"));

    const reportItems: EnglishBuildReportItem[] = [];
    const result = await resolveEnglishV3DonorLessons({
      repoRoot,
      recipe: v3Target("ela20-2-derived", [donorSlug]),
      workspaceDir: path.join(repoRoot, "workspace"),
      reportItems
    });

    assert.equal(result.sources[0]?.kind, "recipe-v2");
    assert.equal(result.lessons.length, 1);
    assert.equal(result.lessons[0]?.title, "Configured Donor Lesson");
    assert.match(result.lessons[0]?.html ?? "", /ELA 20-2 Reviewed wording/);
    assert.doesNotMatch(result.lessons[0]?.html ?? "", /ELA 20-1|Donor wording/);
    assert.ok(reportItems.some((item) => item.status === "placed" && item.destination === "Configured Donor Lesson"));
  });
});

test("V3 donor resolver reapplies target wording after donor cleanup and then normalizes course identity", async () => {
  await withFixtureRepo(async (repoRoot) => {
    const donorSlug = "ela20-1-final-correction-donor";
    const sourcePath = path.join(repoRoot, "sources", "donor.zip");
    await mkdir(path.dirname(sourcePath), { recursive: true });
    await writeFile(sourcePath, await finalTargetCorrectionFixtureZip());
    await writeRecipe(repoRoot, donorSlug, v2Recipe(donorSlug, "sources/donor.zip"));

    const target = v3Target("ela20-2-derived", [donorSlug]);
    target.wordingCorrections = [
      {
        find: "Discussion at the English Language Arts 20-1 level.",
        replace: "Use the ELA 20-2 discussion standard.",
        reason: "Apply the target decision after donor grade normalization."
      },
      {
        find: "In all probability, you viewed and critiqued movies as part of your English Language Arts 20-1 and 20-1 courses.",
        replace: "You have likely viewed and critiqued films in previous English Language Arts courses.",
        reason: "Remove contradictory donor-course codes."
      }
    ];

    const result = await resolveEnglishV3DonorLessons({
      repoRoot,
      recipe: target,
      workspaceDir: path.join(repoRoot, "workspace"),
      reportItems: []
    });
    const lesson = result.lessons[0];

    assert.match(lesson?.html ?? "", /Use the ELA 20-2 discussion standard\./);
    assert.match(lesson?.html ?? "", /You have likely viewed and critiqued films in previous English Language Arts courses\./);
    assert.match(lesson?.html ?? "", /ELA 20-2 Reviewed wording/);
    assert.doesNotMatch(lesson?.html ?? "", /ELA 20-1|English Language Arts 20-1|and 20-1 courses/);
    assert.doesNotMatch(lesson?.text ?? "", /ELA 20-1|English Language Arts 20-1|and 20-1 courses/);
  });
});

test("direct V3 Brightspace lessons use the same final target correction path", () => {
  const target = v3Target("ela20-2-direct", []);
  target.wordingCorrections = [{
    find: "Discussion at the English Language Arts 20-1 level.",
    replace: "Use the ELA 20-2 discussion standard.",
    reason: "Apply the target wording to directly loaded V3 lessons."
  }];

  const [lesson] = normalizeEnglishV3ResolvedLessons([{
    id: "source-lesson",
    title: "Direct Source Lesson",
    sourceHref: "content/direct.html",
    html: "<p>Discussion at the English Language Arts 20-1 level.</p><p>ELA 20-1 source identity.</p>",
    text: "Discussion at the English Language Arts 20-1 level. ELA 20-1 source identity.",
    supportingResources: []
  }], target);

  assert.match(lesson?.html ?? "", /Use the ELA 20-2 discussion standard\./);
  assert.match(lesson?.html ?? "", /ELA 20-2 source identity\./);
  assert.doesNotMatch(lesson?.html ?? "", /ELA 20-1|English Language Arts 20-1/);
  assert.doesNotMatch(lesson?.text ?? "", /ELA 20-1|English Language Arts 20-1/);
});

test("donor lesson fragments namespace repeated Brightspace IDs and local references", () => {
  const source = `<style>#container { color: red; } #content > p { margin: 0; }</style>
    <div id="container" aria-labelledby="heading content">
      <h2 id="heading">Lesson heading</h2>
      <a href="#content">Skip to content</a>
      <label for="answer">Answer</label>
      <textarea id="answer"></textarea>
      <div id="content" style="clip-path: url(#clip)">Lesson content</div>
      <svg><clipPath id="clip"><path d="M0 0h1v1z" /></clipPath></svg>
    </div>`;

  const first = englishV3DonorLessonInternals.namespaceLessonHtmlIds(source, "lesson-1-introduction");
  const second = englishV3DonorLessonInternals.namespaceLessonHtmlIds(source, "lesson-2-characteristics");

  assert.match(first, /id="lesson-1-introduction--container"/);
  assert.match(first, /href="#lesson-1-introduction--content"/);
  assert.match(first, /aria-labelledby="lesson-1-introduction--heading lesson-1-introduction--content"/);
  assert.match(first, /for="lesson-1-introduction--answer"/);
  assert.match(first, /url\(#lesson-1-introduction--clip\)/);
  assert.match(first, /#lesson-1-introduction--container\s*\{/);
  assert.doesNotMatch(first, /id="container"/);
  assert.match(second, /id="lesson-2-characteristics--container"/);
  assert.doesNotMatch(second, /lesson-1-introduction--container/);
});

test("V3 donor resolver loads a V1 short-fiction recipe by unit and lesson order", async () => {
  await withFixtureRepo(async (repoRoot) => {
    const donorSlug = "ela10-1-v1-donor";
    const projectSourcePath = path.join(repoRoot, "projects", donorSlug, "raw", "donor.zip");
    await mkdir(path.dirname(projectSourcePath), { recursive: true });
    await writeFile(projectSourcePath, await fixtureZip());
    await writeRecipe(repoRoot, donorSlug, v1Recipe(donorSlug, "raw/donor.zip"));

    const result = await resolveEnglishV3DonorLessons({
      repoRoot,
      recipe: v3Target("ela10-2-derived", [donorSlug], "ELA 10-2"),
      workspaceDir: path.join(repoRoot, "workspace"),
      reportItems: []
    });

    assert.equal(result.sources[0]?.kind, "recipe-v1");
    assert.deepEqual(result.lessons.map((lesson) => lesson.title), ["Legacy Donor Lesson"]);
    assert.match(result.lessons[0]?.html ?? "", /ELA 10-2 Reviewed legacy wording/);
    assert.doesNotMatch(result.lessons[0]?.html ?? "", /ELA 10-1|Legacy wording/);
  });
});

test("plan inspection exposes explicit source-data fallbacks for every legacy 30-1 donor", async () => {
  await withFixtureRepo(async (repoRoot) => {
    await writeRecipe(
      repoRoot,
      "ela20-1-novel-study-clean",
      v2Recipe("ela20-1-novel-study-clean", "sources/novel.zip", "novel-lesson")
    );
    await writeRecipe(
      repoRoot,
      "ela20-1-feature-film",
      v2Recipe("ela20-1-feature-film", "sources/film.zip", "film-lesson")
    );

    const plans = await inspectEnglishV3DonorLessonPlans({
      repoRoot,
      recipe: v3Target("ela30-2-all-legacy", [
        "ela30-1-short-stories",
        "ela30-1-modern-drama",
        "ela30-1-novel-study-legacy",
        "ela30-1-feature-film-legacy"
      ], "ELA 30-2")
    });

    assert.deepEqual(plans.map((plan) => plan.kind), [
      "legacy-brightspace",
      "imported-source-html",
      "recipe-alias-v2",
      "recipe-alias-v2"
    ]);
    assert.equal(plans[0]?.kind === "legacy-brightspace" ? plans[0].selectors.length : 0, 14);
    assert.deepEqual(
      plans[1]?.kind === "imported-source-html"
        ? plans[1].lessons.map((lesson) => ({ title: lesson.title, kind: lesson.kind ?? "html" }))
        : [],
      [
        { title: "A Streetcar Named Desire - Introduction", kind: "html" },
        { title: "Streetcar Overview and Characters", kind: "html" },
        { title: "A Streetcar Named Desire Questions", kind: "document" },
        { title: "Scene Overviews", kind: "html" },
        { title: "A Streetcar Named Desire Analysis", kind: "html" },
        { title: "The Streetcar", kind: "html" },
        { title: "Motifs", kind: "html" },
        { title: "Symbols", kind: "html" },
        { title: "Relationships", kind: "html" },
        { title: "Themes", kind: "html" },
        { title: "Song Symbolism", kind: "html" }
      ]
    );
    assert.equal(plans[2]?.resolvedProjectSlug, "ela20-1-novel-study-clean");
    assert.equal(plans[3]?.resolvedProjectSlug, "ela20-1-feature-film");
  });
});

test("unknown and chained donors fail with explicit unresolved cases", async () => {
  await withFixtureRepo(async (repoRoot) => {
    await assert.rejects(
      inspectEnglishV3DonorLessonPlans({
        repoRoot,
        recipe: v3Target("ela20-2-derived", ["ela20-1-unknown"])
      }),
      (error: unknown) => {
        assert.ok(error instanceof EnglishDonorLessonResolutionError);
        assert.match(error.unresolvedCases.join("\n"), /ela20-1-unknown.*no V1\/V2 donor recipe/i);
        return true;
      }
    );

    const chained = v3Target("ela20-2-chained-donor", ["ela20-1-source"]);
    const chainedDir = path.join(repoRoot, "projects", chained.projectSlug, "meta");
    await mkdir(chainedDir, { recursive: true });
    await writeFile(path.join(chainedDir, "english-unit.json"), `${JSON.stringify(chained, null, 2)}\n`);
    await assert.rejects(
      inspectEnglishV3DonorLessonPlans({
        repoRoot,
        recipe: v3Target("ela20-2-derived", [chained.projectSlug])
      }),
      (error: unknown) => {
        assert.ok(error instanceof EnglishDonorLessonResolutionError);
        assert.match(error.unresolvedCases.join("\n"), /is V3 rather than an approved -1 source recipe/i);
        return true;
      }
    );
  });
});

test("donor recipes cannot point lesson derivation at donor workspace output", async () => {
  await withFixtureRepo(async (repoRoot) => {
    const donorSlug = "ela20-1-workspace-backed";
    await writeRecipe(
      repoRoot,
      donorSlug,
      v2Recipe(donorSlug, `projects/${donorSlug}/workspace/content.zip`)
    );

    await assert.rejects(
      inspectEnglishV3DonorLessonPlans({
        repoRoot,
        recipe: v3Target("ela20-2-derived", [donorSlug])
      }),
      (error: unknown) => {
        assert.ok(error instanceof EnglishDonorLessonResolutionError);
        assert.match(error.unresolvedCases.join("\n"), /workspace output rather than recipe or imported source data/i);
        return true;
      }
    );
  });
});
