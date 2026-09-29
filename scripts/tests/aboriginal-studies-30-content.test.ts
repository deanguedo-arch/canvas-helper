/**
 * AB30 teaching-block content suite — T08 (CONTENT01–CONTENT04, UI01–UI05).
 *
 * Asserts the versioned lesson renderer against the real production files
 * (workspace course-data.js + main.js + lesson-components.js): schema v2
 * with byte-faithful v1 fallback, all nine block types, goal strip,
 * worked-example/practice/task completeness rules, figure/comparison text
 * equivalents, URL policy, safe text handling, editorial invisibility, and
 * the lesson-review manifest. Same vm-seam execution model as the parity
 * and route suites (slices asserted present and syntax-checked).
 *
 * Human/browser halves NOT RUN here by construction (recorded, never
 * mocked): whether prose actually teaches (CONTENT01–04 human), screenshots
 * and reflow (UI01), manual keyboard/focus/dialog/announcement/reduced-motion
 * checks (UI04), and conformance certification (UI05 — this suite plus its
 * record explicitly scope what was and was not checked). NO all-course prose
 * generation in T08: v2 components are proven on synthetic fixtures; all 50
 * real lessons stay v1 and prove the fallback.
 *
 * T10 extends this suite with the Lesson 7 exemplar halves: CONTENT01 keeps
 * 49 lessons on v1 while t1-l07-numbered-treaties goes v2; CONTENT05–CONTENT08
 * gain automated halves over the real exemplar (source attribution, textbook
 * quote verification, interpretation-not-agreement language, Q28–31 record
 * integrity with zero new compulsory work); STATE07-auto proves the formative
 * save/reload loop; FORMATIVE-GATE proves save-gated criteria rendering.
 *
 * Runners: `node --test <this file>` (sandbox-usable, import-free) and
 * `npx tsx --test <this file>` (repo convention for lead/CI).
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const workspaceDir = path.resolve("projects", "aboriginal-studies-30", "workspace");
const mainPath = path.resolve(workspaceDir, "main.js");
const dataPath = path.resolve(workspaceDir, "course-data.js");
const adapterPath = path.resolve(workspaceDir, "learning-store.js");
const componentsPath = path.resolve(workspaceDir, "lesson-components.js");
const manifestPath = path.resolve(
  "projects",
  "aboriginal-studies-30",
  "meta",
  "ab30-parity",
  "lesson-review-manifest.json"
);

const mainSource = readFileSync(mainPath, "utf8");
const dataSource = readFileSync(dataPath, "utf8");
const adapterSource = readFileSync(adapterPath, "utf8");
const componentsSource = readFileSync(componentsPath, "utf8");

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

console.log(
  `[ab30-content] tested inputs: ${JSON.stringify({
    "main.js": sha256Hex(mainSource),
    "course-data.js": sha256Hex(dataSource),
    "lesson-components.js": sha256Hex(componentsSource),
  })}`
);

type JsonRecord = Record<string, unknown>;
type Lesson = JsonRecord & { id: string; title?: string };
type Unit = JsonRecord & { id: string; lessons?: Lesson[] };

function loadCourseData(source: string): JsonRecord {
  const context = { window: {} as { ABORIGINAL_STUDIES_30_DATA?: JsonRecord } };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "course-data.js" });
  const data = context.window.ABORIGINAL_STUDIES_30_DATA;
  assert.ok(data && typeof data === "object", "course-data.js must assign window.ABORIGINAL_STUDIES_30_DATA");
  return data;
}

const DATA = JSON.parse(JSON.stringify(loadCourseData(dataSource))) as JsonRecord;
const units = DATA["units"] as Unit[];
const themeActivities = DATA["themeActivities"] as Array<JsonRecord & { id: string; unitId?: string }>;

function activityOf(unitId: string): JsonRecord | null {
  return themeActivities.find((item) => item.unitId === unitId) ?? null;
}

function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function sliceTopLevel(source: string, kind: "function" | "const", name: string): string {
  const anchor = kind === "function" ? `function ${name}(` : `const ${name} =`;
  const start = source.indexOf(anchor);
  assert.ok(start >= 0, `seam "${name}" must exist in main.js (production drift?)`);
  const lineStart = source.lastIndexOf("\n", start) + 1;
  const boundaryPattern = /^(?:function|const|let|var) [A-Za-z_$][\w$]*/gm;
  boundaryPattern.lastIndex = start + anchor.length;
  const next = boundaryPattern.exec(source);
  const slice = (next ? source.slice(lineStart, next.index) : source.slice(lineStart)).trim();
  assert.ok(slice.length > anchor.length, `seam "${name}" slice must be non-empty`);
  new vm.Script(slice, { filename: `seam-${name}.js` });
  return slice;
}

const SLICE_CONSTS = [
  "units",
  "assignments",
  "coreVocabulary",
  "themeActivities",
  "ASSIGNMENT_PROMPT_LESSONS",
  "LESSON_DRAFTS",
  "REQUIREMENT_ROLE_OVERRIDES",
  "BOOKLET_SHELL_ASSIGNMENT_IDS",
];
const SLICE_FUNCTIONS = [
  "lessonContentVersion",
  "isV2Lesson",
  "storeAvailable",
  "lessonBlocksApi",
  "renderV2GoalStrip",
  "renderV2Blocks",
  "renderLessonGuide",
  "lessonEyebrow",
  "renderLessonArticle",
  "getUnitActivity",
  "lessonStartPage",
  "linkLessonTerms",
  "findVocabularyTerm",
  "escapeRegExp",
  "promptsForLesson",
  "renderLessonQuestions",
  "renderAssignmentDrafts",
  "activityResponseKey",
  "promptFieldKey",
  "tableFieldId",
  "tableFieldLabel",
  "escapeHtml",
  "toEmbedUrl",
  "renderConsentEmbed",
  "readCourseResponse",
  "renderActivityPromptLabel",
  "renderActivityPromptResources",
  "renderFillBlankPrompt",
  "renderMultipleChoicePrompt",
  "renderTablePrompt",
  "renderActivityPrompt",
  "conflictOriginLabel",
  "storeConflictsForKeys",
  "renderConflictPanelsForKeys",
  "roleForRequirement",
  "isKnownLegacyRequirement",
  "requirementItems",
  "requirementDenominator",
];

const seamSource = [
  ...SLICE_CONSTS.map((name) => sliceTopLevel(mainSource, "const", name)),
  ...SLICE_FUNCTIONS.map((name) => sliceTopLevel(mainSource, "function", name)),
].join("\n\n");

type BlocksApi = {
  KNOWN_TYPES: string[];
  escapeHtml: (value: unknown) => string;
  isApprovedAssetUrl: (src: unknown) => boolean;
  validateBlock: (block: unknown, index?: number) => Array<{ code: string }>;
  validateLessonBlocks: (blocks: unknown) => Array<{ code: string; index: number }>;
  renderGoalStrip: (goal: unknown) => string;
  renderBlock: (block: unknown, index: number, context: Record<string, unknown>) => string;
  renderBlocks: (blocks: unknown, context: Record<string, unknown>) => string;
};

type Seam = {
  lessonContentVersion: (lesson: unknown) => string;
  isV2Lesson: (lesson: unknown) => boolean;
  renderLessonArticle: (activity: unknown, lesson: unknown, index: number) => string;
  readLogicalResponse: (viewKey: string) => string;
  writeLogicalResponse: (viewKey: string, value: string) => { ok: boolean; code?: string; candidate?: string };
  roleForRequirement: (id: string) => string;
  requirementDenominator: (items?: unknown[]) => number;
  getStore: () => any;
  reboot: () => unknown;
};

function buildRuntime(): { seam: Seam; blocks: BlocksApi } {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: (key: string): string | null => (store.has(String(key)) ? (store.get(String(key)) as string) : null),
    setItem: (key: string, value: string): void => {
      store.set(String(key), String(value));
    },
    removeItem: (key: string): void => {
      store.delete(String(key));
    },
    clear: (): void => {
      store.clear();
    },
  };
  const context = { DATA, localStorage, console, TextEncoder, URL, URLSearchParams } as Record<string, unknown>;
  vm.createContext(context);
  const script = [
    adapterSource,
    componentsSource,
    "let progress = { completedUnits: [], completedAssignments: [] };",
    "let activityResponses = {};",
    "let storeBoot = { ok: true, mode: 'envelope' };",
    seamSource,
    "storeBoot = AB30Store.init({ storage: localStorage });",
    `globalThis.__seam = {
      lessonContentVersion, isV2Lesson, renderLessonArticle,
      readLogicalResponse, writeLogicalResponse,
      roleForRequirement, requirementDenominator,
      getStore() { return AB30Store; },
      reboot() { return AB30Store.init({ storage: localStorage }); },
    };`,
  ].join("\n\n");
  vm.runInContext(script, context, { filename: "ab30-content-seam.js" });
  const seam = (context as { __seam: Seam }).__seam;
  const blocks = (context as { AB30LessonBlocks: BlocksApi }).AB30LessonBlocks;
  assert.ok(blocks, "lesson-components.js must export AB30LessonBlocks");
  return { seam, blocks };
}

function allLessons(): Array<{ unit: Unit; lesson: Lesson; index: number }> {
  const out: Array<{ unit: Unit; lesson: Lesson; index: number }> = [];
  for (const unit of units) {
    for (const [index, lesson] of (unit.lessons ?? []).entries()) out.push({ unit, lesson, index });
  }
  return out;
}

const V2_FIXTURE_LESSON: Record<string, unknown> = {
  id: "synth-v2-lesson",
  contentVersion: "v2-synth-1",
  kicker: "SYNTH",
  title: "SYNTH_AB30_CONTENT_V2",
  intro: "Synthetic v2 lesson for component proofs.",
  goal: "SYNTH goal: explain the treaty relationship.",
  prerequisite: "SYNTH prereq: read the timeline.",
  essentialQuestion: "SYNTH essential: what did each party promise?",
  textbook: { label: "Textbook p. 1", file: "./assets/library/chapter-1.pdf", title: "Chapter 1" },
  terms: [{ term: "Treaty", def: "A formal agreement." }],
  blocks: [
    { type: "explanation", heading: "SYNTH heading", paragraphs: ["SYNTH paragraph one.", "SYNTH paragraph two."] },
    {
      type: "source",
      extract: "SYNTH extract text.",
      speaker: "SYNTH Speaker",
      nation: "SYNTH Nation",
      date: "2024",
      sourceType: "Testimony",
      locator: "p. 9",
      attribution: "SYNTH Archive",
      contextLimits: "SYNTH context note.",
    },
    {
      type: "comparison",
      caption: "SYNTH comparison caption.",
      columns: [
        { heading: "SYNTH side A", points: ["SYNTH a1", "SYNTH a2"] },
        { heading: "SYNTH side B", points: ["SYNTH b1"] },
      ],
    },
    {
      type: "figure",
      src: "./assets/theme-1/readings/indigenous-worldviews.pdf",
      alt: "SYNTH alt teaching the relationship.",
      caption: "SYNTH caption teaching the relationship.",
    },
    {
      type: "workedExample",
      title: "SYNTH worked",
      directions: "SYNTH directions.",
      evidence: [{ ref: "SYNTH-E1", text: "SYNTH evidence text." }],
      reasoning: ["SYNTH step one.", "SYNTH step two."],
      response: "SYNTH finished response.",
    },
    {
      type: "supportedPractice",
      title: "SYNTH supported",
      method: "SYNTH method.",
      task: "SYNTH supported task.",
      feedback: "SYNTH feedback.",
    },
    {
      type: "independentTask",
      title: "SYNTH independent",
      task: "SYNTH independent task.",
      differsFrom: { evidence: "SYNTH new evidence.", example: "SYNTH new example." },
    },
    { type: "reflection", prompt: "SYNTH reflection prompt." },
    { type: "assignmentConnection", assignmentId: "oral-tradition", note: "SYNTH connection note." },
  ],
};

test("CONTENT01-auto: v2 teaches goal+terms+blocks; every v1 lesson carries inline teaching", () => {
  const { seam, blocks } = buildRuntime();
  assert.equal(DATA["schemaVersion"], 2, "course data declares reader schema v2");
  assert.equal(seam.isV2Lesson(V2_FIXTURE_LESSON), true);
  assert.equal(seam.lessonContentVersion(V2_FIXTURE_LESSON), "v2-synth-1");
  assert.deepEqual(plain(blocks.validateLessonBlocks(V2_FIXTURE_LESSON["blocks"])), []);
  const html = seam.renderLessonArticle(activityOf("theme-1"), V2_FIXTURE_LESSON, 0);
  for (const needle of [
    "SYNTH goal",
    "SYNTH prereq",
    "SYNTH essential",
    "SYNTH heading",
    "SYNTH paragraph one",
    "SYNTH extract",
    "SYNTH Speaker",
    "SYNTH side A",
    "SYNTH alt teaching",
    "SYNTH-E1",
    "SYNTH step one",
    "SYNTH finished response",
    "SYNTH method",
    "SYNTH feedback",
    "SYNTH reflection",
    "connected assignment",
  ]) {
    assert.ok(html.includes(needle), `v2 article must teach: ${needle}`);
  }
  assert.ok(!html.includes("SYNTH new evidence"), "teacher presentation hides authoring rationale");
  // Minimal source: extract only — no manufactured metadata, no placeholders.
  const minimalSource = blocks.renderBlock({ type: "source", extract: "SYNTH bare extract." }, 0, {});
  assert.ok(minimalSource.includes("SYNTH bare extract."), "extract renders");
  assert.ok(!minimalSource.includes("<dl>"), "absent attribution renders nothing");
  assert.ok(!minimalSource.includes("Unknown"), "no manufactured placeholders");
  // Minimal goal strip: goal only.
  const minimalGoal = blocks.renderGoalStrip({ goal: "SYNTH bare goal." });
  assert.ok(minimalGoal.includes("SYNTH bare goal."), "goal renders");
  assert.ok(!minimalGoal.includes("Before you start"), "absent prerequisite renders nothing");

  const lessons = allLessons();
  assert.equal(lessons.length, 50, "all 50 real lessons covered");
  const v2Versions: Record<string, string> = {
    "t1-l01-oral-tradition": "ab30-v2-l01.2",
    "t1-l02-nations-peoples": "ab30-v2-l02.2",
    "t1-l03-rights-distinctions": "ab30-v2-l03.1",
    "t1-l04-worldview": "ab30-v2-l04.1",
    "t1-l05-early-treaties": "ab30-v2-l05.1",
    "t1-l06-colonization-proclamation": "ab30-v2-l06.1",
    "t1-l07-numbered-treaties": "ab30-v2-l7.1",
    "t1-l08-treaty-promises-alberta": "ab30-v2-l08.1",
    "t1-l09-geography-governance": "ab30-v2-l09.1",
    "t1-l10-land-law-knowledge": "ab30-v2-l10.1",
    "t1-l11-metis-governance-elders": "ab30-v2-l11.1",
    "t1-l12-first-nations-inuit-relations": "ab30-v2-l12.1",
    "t1-l13-scrip-road-allowances": "ab30-v2-l13.1",
    "t1-l14-indian-act": "ab30-v2-l14.1",
    "t1-l15-resistance-1951": "ab30-v2-l15.1",
    "t1-l16-policy-councils-devolution": "ab30-v2-l16.1",
    "t1-l17-land-knowledge-constitution": "ab30-v2-l17.1",
    "t1-l18-constitutional-negotiations": "ab30-v2-l18.1",
    "t1-l19-title-treaties-constraints": "ab30-v2-l19.1",
    "t1-l20-harvesting-rights": "ab30-v2-l20.1",
    "t1-l21-rebuilding-goals": "ab30-v2-l21.1",
    "t1-l22-models": "ab30-v2-l22.1",
    "t1-l23-synthesis": "ab30-v2-l23.1",
    "t2-l01-why-land-matters": "ab30-v2-l24.2",
    "t2-l05-land-values": "ab30-v2-l25.1",
    "t2-l02-two-kinds-of-claims": "ab30-v2-l26.1",
    "t2-l06-claims-machine": "ab30-v2-l27.1",
    "t2-l07-bigstone-specific": "ab30-v2-l28.1",
    "t2-l08-paths-resolution": "ab30-v2-l29.1",
    "t2-l03-metis-non-status-claims": "ab30-v2-l30.1",
    "t2-l09-first-modern-treaties": "ab30-v2-l31.1",
    "t2-l10-north-and-west": "ab30-v2-l32.1",
    "t2-l04-resolving-claims": "ab30-v2-l33.1",
    "t3-l01-stereotypes-media": "ab30-v2-l34.1",
    "t3-l05-words-that-wound": "ab30-v2-l35.1",
    "t3-l06-screens-punchlines": "ab30-v2-l36.1",
    "t3-l02-breaking-barriers": "ab30-v2-l37.1",
    "t3-l03-community-life": "ab30-v2-l38.1",
    "t3-l07-running-own-show": "ab30-v2-l39.1",
    "t3-l08-city-test": "ab30-v2-l40.1",
    "t3-l09-friendship-success": "ab30-v2-l41.1",
    "t3-l10-devolution": "ab30-v2-l42.1",
    "t3-l04-urban-life-services": "ab30-v2-l43.1",
    "t4-l01-one-world-many-peoples": "ab30-v2-l44.1",
    "t4-l05-nine-issues": "ab30-v2-l45.1",
    "t4-l02-colonial-wounds": "ab30-v2-l46.1",
    "t4-l06-resources-conflict": "ab30-v2-l47.1",
    "t4-l03-land-resources-un": "ab30-v2-l48.1",
    "t4-l07-education-odds": "ab30-v2-l49.1",
    "t4-l04-youth-future-response": "ab30-v2-l50.1",
  };
  for (const { unit, lesson, index } of lessons) {
    if (lesson.id in v2Versions) {
      assert.equal(seam.isV2Lesson(lesson), true, `${lesson.id} is a v2 rebuild`);
      assert.equal(seam.lessonContentVersion(lesson), v2Versions[lesson.id]);
      continue;
    }
    assert.equal(seam.isV2Lesson(lesson), false, `${lesson.id} stays v1 (no bulk conversion outside batch tickets)`);
    assert.equal(seam.lessonContentVersion(lesson), "v1-legacy");
    const body = lesson["body"] as string[] | undefined;
    assert.ok(
      (Array.isArray(body) && body.length > 0) || lesson["example"] || lesson["check"],
      `${lesson.id} must carry inline teaching content`
    );
    const rendered = seam.renderLessonArticle(activityOf(unit.id), lesson, index);
    assert.ok(rendered.includes(lesson.title ?? lesson.id), `${lesson.id} renders its title`);
    if (Array.isArray(body) && body.length > 0 && typeof body[0] === "string") {
      const text = rendered
        .replace(/<[^>]*>/g, "")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
      assert.ok(text.includes(body[0]), `${lesson.id} renders its own prose inline`);
    }
  }
});

test("CONTENT02-auto: worked examples need evidence, reasoning, and a finished response", () => {
  const { blocks } = buildRuntime();
  const full = (V2_FIXTURE_LESSON["blocks"] as unknown[])[4];
  assert.deepEqual(plain(blocks.validateBlock(full, 4)), []);
  const html = blocks.renderBlock(full, 4, {});
  for (const needle of [
    "SYNTH-E1",
    "SYNTH evidence text",
    "SYNTH step one",
    "SYNTH finished response",
    "Finished response",
  ]) {
    assert.ok(html.includes(needle), `worked example must show: ${needle}`);
  }
  const directionsOnly = { type: "workedExample", title: "SYNTH thin", directions: "SYNTH just do it." };
  assert.deepEqual(
    plain(blocks.validateBlock(directionsOnly, 0)).map((item) => item.code),
    ["missing-evidence", "missing-reasoning", "missing-response"]
  );
  const thinHtml = blocks.renderBlock(directionsOnly, 0, {});
  assert.ok(thinHtml.includes("Incomplete workedExample"), "directions alone must badge incomplete");
  assert.ok(thinHtml.includes("SYNTH just do it."), "present directions still render");
});

test("CONTENT03-auto: supported practice carries feedback; independent tasks declare their difference", () => {
  const { blocks } = buildRuntime();
  const supported = (V2_FIXTURE_LESSON["blocks"] as unknown[])[5];
  assert.deepEqual(plain(blocks.validateBlock(supported, 5)), []);
  const sHtml = blocks.renderBlock(supported, 5, {});
  assert.ok(sHtml.includes("SYNTH method") && sHtml.includes("SYNTH supported task."), "method + task render");
  assert.ok(sHtml.includes("<details") && sHtml.includes("SYNTH feedback."), "feedback renders usefully");
  const independent = (V2_FIXTURE_LESSON["blocks"] as unknown[])[6];
  assert.deepEqual(plain(blocks.validateBlock(independent, 6)), []);
  assert.ok(
    blocks.renderBlock(independent, 6, {}).includes("SYNTH new evidence."),
    "declared difference renders"
  );
  const noDiff = { type: "independentTask", title: "SYNTH vague", task: "SYNTH do it again." };
  assert.deepEqual(
    plain(blocks.validateBlock(noDiff, 0)).map((item) => item.code),
    ["missing-difference"]
  );
  assert.ok(
    blocks.renderBlock(noDiff, 0, {}).includes("Incomplete independentTask"),
    "missing difference badges visibly"
  );
});

test("CONTENT04-auto: all 50 lessons have versioned review records; structure never implies reviewed", () => {
  const { seam } = buildRuntime();
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    entries: Array<{ lessonId: string; contentVersion: string; status: string }>;
  };
  const lessons = allLessons();
  assert.equal(manifest.entries.length, 50, "manifest covers all 50 lessons");
  const byId = new Map(manifest.entries.map((entry) => [entry.lessonId, entry]));
  assert.equal(byId.size, 50, "each lesson exactly once");
  for (const { lesson } of lessons) {
    const entry = byId.get(lesson.id);
    assert.ok(entry, `${lesson.id} must have a review record`);
    assert.equal(
      entry?.contentVersion,
      seam.lessonContentVersion(lesson),
      `${lesson.id} version must match the renderer`
    );
    assert.ok(
      entry?.status === "unreviewed" || entry?.status === "reviewed",
      `${lesson.id} status must be explicit`
    );
  }
  assert.equal(
    manifest.entries.filter((entry) => entry.status === "reviewed").length,
    0,
    "no review may be claimed without a teacher record"
  );
});

test("UI02-auto: every control has an accessible name; headings and landmarks are meaningful", () => {
  const { seam } = buildRuntime();
  const escapeRegExpLocal = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const articles: string[] = [];
  for (const { unit, lesson, index } of allLessons()) {
    articles.push(seam.renderLessonArticle(activityOf(unit.id), lesson, index));
  }
  articles.push(seam.renderLessonArticle(activityOf("theme-1"), V2_FIXTURE_LESSON, 0));
  articles.forEach((html, i) => {
    const label = i < 50 ? `lesson ${i}` : "v2-fixture";
    for (const match of html.matchAll(/<(textarea|input)\b([^>]*)>/g)) {
      const attrs = match[2];
      if (/aria-label="[^"]+"/.test(attrs)) continue;
      const id = /id="([^"]+)"/.exec(attrs)?.[1];
      assert.ok(id, `${label}: ${match[1]} without aria-label must have an id`);
      assert.ok(
        new RegExp(`<label[^>]*for="${escapeRegExpLocal(id ?? "")}"`).test(html),
        `${label}: control #${id} must have an accessible name`
      );
    }
    for (const match of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
      const named = /aria-label="[^"]+"/.test(match[1]) || match[2].trim().length > 0;
      assert.ok(named, `${label}: button must have text or aria-label`);
    }
    for (const match of html.matchAll(/<img\b([^>]*)>/g)) {
      assert.ok(/alt="[^"]+"/.test(match[1]), `${label}: img must carry alt text`);
    }
    for (const chunk of html.split("<details").slice(1)) {
      assert.ok(chunk.includes("<summary"), `${label}: details must have a summary`);
    }
    for (const match of html.matchAll(/<label[^>]*for="([^"]+)"[^>]*>/g)) {
      assert.ok(html.includes(`id="${match[1]}"`), `${label}: label for=${match[1]} must resolve`);
    }
    assert.equal(
      (html.match(/data-lesson-heading/g) || []).length,
      1,
      `${label}: exactly one lesson heading hook`
    );
  });
  const lessonSlice = sliceTopLevel(mainSource, "function", "renderLesson");
  assert.ok(lessonSlice.includes('aria-label="Lesson navigation"'), "pager nav must be labelled");
});

test("UI03-auto: figures need alt+caption; comparisons render headed tables; URLs are policed", () => {
  const { blocks } = buildRuntime();
  const figure = (V2_FIXTURE_LESSON["blocks"] as unknown[])[3];
  assert.deepEqual(plain(blocks.validateBlock(figure, 3)), []);
  const fHtml = blocks.renderBlock(figure, 3, {});
  assert.ok(fHtml.includes("<figure") && fHtml.includes("SYNTH caption"), "figure + caption render");
  assert.ok(fHtml.includes('alt="SYNTH alt teaching the relationship."'), "alt teaches");
  const noAlt = { type: "figure", src: "./assets/a.png", alt: "", caption: "SYNTH cap." };
  assert.deepEqual(
    plain(blocks.validateBlock(noAlt, 0)).map((item) => item.code),
    ["missing-alt"]
  );
  const noCap = { type: "figure", src: "./assets/a.png", alt: "SYNTH alt.", caption: "" };
  assert.deepEqual(
    plain(blocks.validateBlock(noCap, 0)).map((item) => item.code),
    ["missing-caption"]
  );
  for (const url of ["./assets/library/chapter-1.pdf", "./assets/a/b.png", "#fig-1", "https://example.com/x.png"]) {
    assert.equal(blocks.isApprovedAssetUrl(url), true, `approved: ${url}`);
  }
  for (const url of [
    "",
    "javascript:alert(1)",
    "data:text/html,<b>x</b>",
    "http://example.com/x.png",
    "/etc/passwd",
    "./assets/../../secret.txt",
    "  ",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
  ]) {
    assert.equal(blocks.isApprovedAssetUrl(url), false, `rejected: ${JSON.stringify(url)}`);
  }
  const evil = { type: "figure", src: "javascript:alert(1)", alt: "SYNTH alt.", caption: "SYNTH cap." };
  assert.deepEqual(
    plain(blocks.validateBlock(evil, 0)).map((item) => item.code),
    ["unapproved-src"]
  );
  const evilHtml = blocks.renderBlock(evil, 0, {});
  assert.ok(!evilHtml.includes("javascript:"), "unapproved URL must never be emitted");
  assert.ok(evilHtml.includes("Incomplete figure"), "unapproved src badges visibly");
  const comparison = (V2_FIXTURE_LESSON["blocks"] as unknown[])[2];
  assert.deepEqual(plain(blocks.validateBlock(comparison, 2)), []);
  const cHtml = blocks.renderBlock(comparison, 2, {});
  assert.ok(cHtml.includes("<table>") && cHtml.includes('<th scope="col">SYNTH side A</th>'), "headed table");
  assert.ok(cHtml.includes("SYNTH comparison caption."), "caption present");
  const oneCol = { type: "comparison", columns: [{ heading: "SYNTH solo", points: ["x"] }] };
  assert.deepEqual(
    plain(blocks.validateBlock(oneCol, 0)).map((item) => item.code),
    ["missing-columns"]
  );
});

test("SAFE-TEXT: learner writing never executes; editorial notes never render; links stay canonical", () => {
  const { seam, blocks } = buildRuntime();
  const payload = "<script>alert(1)</script><img src=x onerror=alert(2)>";
  seam.writeLogicalResponse("assignment-draft::2-1-land-stewardship", `SYNTH_AB30_SAFE ${payload}`);
  const theme2 = units.find((unit) => unit.id === "theme-2") as Unit;
  const draftLesson = (theme2.lessons ?? []).find((lesson) => lesson.id === "t2-l04-resolving-claims") as Lesson;
  const draftHtml = seam.renderLessonArticle(activityOf("theme-2"), draftLesson, 0);
  assert.ok(!draftHtml.includes("<script"), "raw script must never render");
  assert.ok(!draftHtml.includes("<img src=x"), "raw image payload must never render");
  assert.doesNotMatch(draftHtml, /<img[^>]*\sonerror=/i, "raw image handlers must never render");
  assert.ok(draftHtml.includes("&lt;script&gt;"), "payload must render escaped");
  seam.writeLogicalResponse("theme-1-online-booklet::q1.blank-1", `SYNTH_AB30_SAFE ${payload}`);
  const q1Home = allLessons().find(({ lesson }) =>
    ((lesson["bookletQuestionIds"] as string[] | undefined) ?? []).includes("q1")
  );
  assert.ok(q1Home, "q1 must belong to a lesson");
  const q1Html = seam.renderLessonArticle(
    activityOf((q1Home as { unit: Unit }).unit.id),
    (q1Home as { lesson: Lesson }).lesson,
    (q1Home as { index: number }).index
  );
  assert.ok(!q1Html.includes("<script"), "question payload must never render raw");
  assert.ok(q1Html.includes("&lt;script&gt;"), "question payload must render escaped");
  const trapped = {
    type: "explanation",
    heading: "SYNTH trap",
    paragraphs: ["SYNTH trap body."],
    editorial: { hold: "SYNTH_HOLD_SECRET", note: "SYNTH_NOTE_SECRET" },
  };
  const trappedHtml = blocks.renderBlock(trapped, 0, {});
  assert.ok(
    !trappedHtml.includes("SYNTH_HOLD_SECRET") && !trappedHtml.includes("SYNTH_NOTE_SECRET"),
    "editorial notes must never render"
  );
  const weird = { type: "hologram", text: "SYNTH weird." };
  assert.deepEqual(
    plain(blocks.validateBlock(weird, 0)).map((item) => item.code),
    ["unknown-type"]
  );
  assert.ok(
    blocks.renderBlock(weird, 0, {}).includes("Unsupported teaching block: hologram."),
    "unknown types badge visibly"
  );
  const conn = (V2_FIXTURE_LESSON["blocks"] as unknown[])[8];
  assert.deepEqual(plain(blocks.validateBlock(conn, 8)), []);
  const connHtml = blocks.renderBlock(conn, 8, {
    assignmentHref: (id: unknown) => `?section=assignment&assignment=${String(id)}`,
    assignmentExists: () => true,
  });
  assert.ok(
    connHtml.includes("?section=assignment&amp;assignment=oral-tradition"),
    "canonical assignment href"
  );
  const connBadHtml = blocks.renderBlock(conn, 8, {
    assignmentHref: (id: unknown) => `?x=${String(id)}`,
    assignmentExists: () => false,
  });
  assert.ok(connBadHtml.includes("unknown-assignment"), "unknown assignments badge, not dead links");
  assert.ok(!connBadHtml.includes("?x="), "no dead link emitted");
});

// ---------------- T10 Lesson 7 exemplar halves ----------------

const textbookFixturePath = path.resolve(
  "scripts",
  "tests",
  "fixtures",
  "ab30-parity",
  "textbook-ch1-pp24-28.txt"
);

function lesson7(): { unit: Unit; lesson: Lesson; index: number } {
  const found = allLessons().find((entry) => entry.lesson.id === "t1-l07-numbered-treaties");
  assert.ok(found, "Lesson 7 must exist in course data");
  return found as { unit: Unit; lesson: Lesson; index: number };
}

function lesson7Blocks(): Array<Record<string, unknown>> {
  const blocks = lesson7().lesson["blocks"];
  assert.ok(Array.isArray(blocks) && blocks.length > 0, "Lesson 7 must carry v2 blocks");
  return blocks as Array<Record<string, unknown>>;
}

/** Quote-tolerant normalization: diacritics, quote glyphs, hyphenation, case, spacing. */
function quoteNorm(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[‘’“”«»"']/g, "")
    .replace(/[–—]/g, " ")
    .replace(/-\s+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

test("CONTENT05-auto(T10): exemplar sources carry full attribution; quotes hold only source text", () => {
  const { blocks } = buildRuntime();
  const real = lesson7Blocks();
  assert.deepEqual(plain(blocks.validateLessonBlocks(real)), [], "exemplar blocks must validate clean");
  const types = real.map((block) => block["type"]);
  for (const needed of [
    "explanation",
    "source",
    "comparison",
    "workedExample",
    "supportedSelection",
    "independentTask",
    "reflection",
  ]) {
    assert.ok(types.includes(needed), `exemplar must include a ${needed} block`);
  }
  const figures = real.filter((block) => block["type"] === "figure");
  assert.equal(figures.length, 1, "reviewed lesson visual is present exactly once");
  assert.match(String(figures[0]?.["src"] ?? ""), /^\.\/assets\/course-visuals\/generated\/L07-/);
  assert.equal(figures[0]?.["captionDisplay"], "hidden", "generated-media limitation stays visually quiet");
  assert.ok(!types.includes("supportedPractice"), "R08: the answerable control replaces the static reveal");
  const sources = real.filter((block) => block["type"] === "source");
  assert.deepEqual(
    sources.map((source) => source["title"]),
    ["Source A", "Source B", "Source N", "Source C"],
    "exactly the four specimen source cards, in teaching order"
  );
  for (const source of sources) {
    for (const field of ["extract", "sourceType", "locator", "attribution"]) {
      assert.ok(
        typeof source[field] === "string" && (source[field] as string).trim().length > 0,
        `source block needs ${field}`
      );
    }
    const sourceType = source["sourceType"];
    if (sourceType === "Textbook narration") {
      assert.ok(
        typeof source["creator"] === "string" && (source["creator"] as string).trim().length > 0,
        "textbook narration must name its creator voice"
      );
    } else if (sourceType !== "Textbook summary" && sourceType !== "Textbook explanation") {
      assert.ok(
        typeof source["speaker"] === "string" && (source["speaker"] as string).trim().length > 0,
        "non-textbook sources must name a speaker"
      );
      assert.ok(
        typeof source["contextLimits"] === "string" && (source["contextLimits"] as string).trim().length > 0,
        "non-textbook sources must state context and limits"
      );
    }
  }
  const { seam } = buildRuntime();
  const { unit, lesson, index } = lesson7();
  const html = seam.renderLessonArticle(activityOf(unit.id), lesson, index);
  assert.ok(html.includes("Lesson goal"), "goal strip renders");
  assert.ok(html.includes('class="lesson-question"'), "essential question renders as a readable question");
  const extracts = sources.map((source) => quoteNorm(source["extract"] as string));
  const quotes = [...html.matchAll(/<blockquote>([\s\S]*?)<\/blockquote>/g)].map((match) =>
    quoteNorm(
      match[1].replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    )
  );
  assert.equal(quotes.length, 4, `expected exactly the 4 specimen quotes, got ${quotes.length}`);
  for (const quote of quotes) {
    assert.ok(extracts.includes(quote), "every blockquote holds exactly one source extract, never teaching prose");
  }
});

test("CONTENT06-auto(T10): every exemplar quotation verifies against the textbook band", () => {
  const fixture = readFileSync(textbookFixturePath, "utf8");
  const band = quoteNorm(fixture);
  assert.ok(band.includes("numbered treaties 24"), "fixture must hold printed p.24");
  assert.ok(band.includes("inherent rights 25"), "fixture must hold printed p.25");
  assert.ok(band.includes("paulette"), "fixture must hold the p.28 Paulette statement");
  assert.ok(band.length > 5000, "fixture must hold the full band text");
  const sources = lesson7Blocks().filter((block) => block["type"] === "source");
  for (const source of sources) {
    const extract = quoteNorm(source["extract"] as string);
    assert.ok(extract.length > 40, "extracts must be substantial quotations");
    assert.ok(band.includes(extract), `extract must verify verbatim: ${(source["extract"] as string).slice(0, 60)}…`);
  }
  const mutated = quoteNorm(`${sources[0]["extract"] as string} The council then adjourned for lunch.`);
  assert.ok(!band.includes(mutated), "mutation control: invented wording must NOT verify (the check bites)");
  assert.ok(
    !band.includes(quoteNorm("Elder Moostoos testified at the council fire")),
    "fabricated testimony must be absent from the band"
  );
});

test("CONTENT07-auto(T10): exemplar assesses evidence and reasoning, never agreement or identity", () => {
  const real = lesson7Blocks();
  const prose: string[] = [];
  const collect = (value: unknown): void => {
    if (typeof value === "string") prose.push(value);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === "object") {
      for (const [key, entry] of Object.entries(value)) {
        if (key === "editorial") continue;
        collect(entry);
      }
    }
  };
  collect({ goal: lesson7().lesson["goal"], blocks: real });
  const text = prose.join("\n").toLowerCase();
  for (const banned of [
    "you must agree",
    "correct opinion",
    "wrong opinion",
    "rank the policies",
    "state your identity",
    "disclose",
    "your ancestry",
    "family history",
    "required political agreement",
  ]) {
    assert.ok(!text.includes(banned), `exemplar must not contain: ${banned}`);
  }
  const feedback = real
    .filter(
      (block) =>
        block["type"] === "supportedPractice" ||
        block["type"] === "supportedSelection" ||
        block["type"] === "independentTask"
    )
    .map((block) => {
      const optionFeedback =
        block["type"] === "supportedSelection" && block["feedbackByOption"]
          ? Object.values(block["feedbackByOption"] as Record<string, string>).join(" ")
          : "";
      return `${block["feedback"] ?? ""} ${optionFeedback} ${block["criteria"] ?? ""}`;
    })
    .join("\n")
    .toLowerCase();
  for (const needed of ["evidence", "source", "detail", "inference"]) {
    assert.ok(feedback.includes(needed), `feedback/criteria must teach ${needed}`);
  }
});

test("CONTENT08-auto(T10): Q28-31 records byte-identical; formative adds zero compulsory work", () => {
  const { seam } = buildRuntime();
  const { unit, lesson, index } = lesson7();
  assert.deepEqual(lesson["bookletQuestionIds"], ["q28", "q29", "q30", "q31"]);
  const activity = activityOf(unit.id) as unknown as {
    sections: Array<{ prompts: Array<Record<string, unknown>> }>;
  };
  const prompts = (activity.sections ?? []).flatMap((section) => section.prompts ?? []);
  const expected: Record<string, { label: string; rows: number; kind: string; number: string }> = {
    q28: { label: "Why did the government negotiate numbered treaties?", rows: 4, kind: "shortAnswer", number: "28" },
    q29: {
      label: "What was the difference between First Nations views of treaty agreements and European views?",
      rows: 5,
      kind: "shortAnswer",
      number: "29",
    },
    q30: {
      label: "What did First Nations want in exchange for allowing settlers on their land?",
      rows: 4,
      kind: "shortAnswer",
      number: "30",
    },
    q31: {
      label: "What were some of the problems with the treaty interpreters?",
      rows: 4,
      kind: "shortAnswer",
      number: "31",
    },
  };
  for (const [id, want] of Object.entries(expected)) {
    const prompt = prompts.find((entry) => entry["id"] === id);
    assert.ok(prompt, `${id} must exist`);
    assert.equal(prompt?.["label"], want.label, `${id} wording pinned`);
    assert.equal(prompt?.["rows"], want.rows, `${id} rows pinned`);
    assert.equal(prompt?.["kind"], want.kind, `${id} kind pinned`);
    assert.equal(prompt?.["number"], want.number, `${id} number pinned`);
  }
  const formativeKey = "t1-l07-numbered-treaties::independent-language-gap";
  assert.equal(seam.roleForRequirement(formativeKey), "formative", "formative key never enters the denominator");
  assert.equal(
    seam.roleForRequirement("booklet:theme-1-online-booklet:q28"),
    "legacyAssigned",
    "assigned role preserved"
  );
  const html = seam.renderLessonArticle(activityOf(unit.id), lesson, index);
  for (const id of ["q28", "q29", "q30", "q31"]) {
    assert.ok(html.includes(id), `${id} response surface renders inside the v2 lesson`);
  }
  assert.ok(html.includes(formativeKey), "formative response box renders with its save key");
});

test("STATE07-auto(T10): formative work saves, reloads, and gates the model honestly", () => {
  const { seam } = buildRuntime();
  const { unit, lesson, index } = lesson7();
  const key = "t1-l07-numbered-treaties::independent-language-gap";
  const before = seam.renderLessonArticle(activityOf(unit.id), lesson, index);
  assert.ok(before.includes("task-criteria-locked"), "criteria locked before any save");
  assert.ok(!before.includes('data-testid="comparison-toggle"'), "no comparison toggle before a save");
  assert.ok(!before.includes('data-testid="comparison-criteria"'), "no criteria body before a save");
  const saved = plain(seam.writeLogicalResponse(key, "SYNTH first paragraph on Paulette."));
  assert.equal(saved["ok"], true, "formative save succeeds");
  const afterDraft = seam.renderLessonArticle(activityOf(unit.id), lesson, index);
  assert.ok(afterDraft.includes("SYNTH first paragraph on Paulette."), "saved text replays in the box");
  assert.ok(afterDraft.includes("task-criteria-locked"), "R03: draft alone keeps the model locked");
  const submitted = plain(seam.getStore().submitFirstResponse(
    { id: key, contentVersion: "ab30-v2-l7-test", sourceIds: [], stimulusId: "" },
    "cmd-state07", "SYNTH first paragraph on Paulette."));
  assert.equal(submitted["ok"], true, "explicit first-save succeeds");
  const after = seam.renderLessonArticle(activityOf(unit.id), lesson, index);
  assert.ok(after.includes('data-testid="comparison-toggle"'), "comparison toggle after first submission");
  assert.ok(after.includes('data-testid="comparison-criteria"'), "criteria body after first submission");
  assert.ok(after.includes("SYNTH first paragraph on Paulette."), "frozen first text renders");
  seam.reboot();
  assert.equal(
    seam.readLogicalResponse(key),
    "SYNTH first paragraph on Paulette.",
    "reload restores the latest confirmed draft"
  );
  const reloaded = seam.renderLessonArticle(activityOf(unit.id), lesson, index);
  assert.ok(reloaded.includes('data-testid="comparison-toggle"'), "toggle stays after reload");
  assert.ok(reloaded.includes('data-testid="comparison-criteria"'), "criteria stay unlocked after reload");
});

test("FORMATIVE-GATE: criteria gating validates, locks, unlocks, and escapes", () => {
  const { blocks } = buildRuntime();
  const valid = {
    type: "independentTask",
    task: "SYNTH task.",
    differsFrom: { evidence: "SYNTH new evidence." },
    responseKey: "SYNTH-key",
    criteria: "SYNTH criteria.",
  };
  assert.deepEqual(plain(blocks.validateBlock(valid, 0)), [], "keyed criteria validate clean");
  assert.deepEqual(
    plain(blocks.validateBlock({ ...valid, responseKey: "  " }, 0)).map((item) => item.code),
    ["invalid-response-key", "criteria-without-response"]
  );
  const { responseKey: _dropped, ...unkeyed } = valid;
  assert.deepEqual(
    plain(blocks.validateBlock(unkeyed, 0)).map((item) => item.code),
    ["criteria-without-response"]
  );
  const locked = blocks.renderBlock(valid, 0, {});
  assert.ok(locked.includes("task-criteria-locked"), "locked note without a save");
  assert.ok(!locked.includes('data-testid="comparison-criteria"'), "no criteria body without a save");
  assert.ok(locked.includes('data-testid="save-first-response"'), "explicit first-save control");
  assert.ok(locked.includes('data-activity-response="SYNTH-key"'), "save key on the box");
  assert.ok(/<label[^>]*for="formative-0-SYNTH-key"/.test(locked), "box labelled");
  // R03: a mere draft no longer unlocks; only a durable first submission does.
  const draftOnly = blocks.renderBlock(valid, 0, { formativeResponse: () => "SYNTH saved." });
  assert.ok(draftOnly.includes("SYNTH saved."), "saved text prefilled");
  assert.ok(draftOnly.includes("task-criteria-locked"), "draft alone keeps criteria locked");
  assert.ok(!draftOnly.includes('data-testid="comparison-criteria"'), "draft alone reveals no criteria body");
  const unlocked = blocks.renderBlock(valid, 0, {
    formativeResponse: () => "SYNTH saved.",
    submissionsForTask: () => [{ id: "sub:1", text: "SYNTH first.", parentAttemptId: null }],
  });
  assert.ok(unlocked.includes("SYNTH criteria."), "criteria revealed after first submission");
  assert.ok(unlocked.includes('data-testid="comparison-toggle"'), "explicit comparison toggle");
  assert.ok(unlocked.includes("SYNTH first."), "frozen first submission rendered");
  const xss = blocks.renderBlock(valid, 0, { formativeResponse: () => "<script>alert(1)</script>" });
  assert.ok(xss.includes("&lt;script&gt;"), "saved writing escaped");
  assert.ok(!xss.includes("<script>alert"), "saved writing never executes");
  const xssSub = blocks.renderBlock(valid, 0, {
    submissionsForTask: () => [{ id: "sub:1", text: "<script>alert(2)</script>", parentAttemptId: null }],
  });
  assert.ok(xssSub.includes("&lt;script&gt;"), "submitted writing escaped");
  assert.ok(!xssSub.includes("<script>alert"), "submitted writing never executes");
  const throwing = blocks.renderBlock(valid, 0, {
    formativeResponse: () => {
      throw new Error("SYNTH store failure");
    },
    submissionsForTask: () => {
      throw new Error("SYNTH store failure");
    },
  });
  assert.ok(throwing.includes("task-criteria-locked"), "store failure locks, never leaks the model");
  const open = blocks.renderBlock(unkeyed, 0, {});
  assert.ok(open.includes("SYNTH criteria."), "criteria without a key render openly, never gated theater");
});
