/**
 * AB30 Bio-parity visual regression suite — R05.
 *
 * Guards the owned component set against drift back into the T08
 * placeholders (single-column bold goal strip, h4-everywhere headings,
 * metadata wall, system-font fallback): real @font-face + local binaries,
 * two-column goal strip, semantic headings, per-lesson guide in all 50
 * lessons, compact source cards, frozen same-text fixture. Structural
 * preconditions only — pixel/browser proof lives in evidence/R05/
 * (Playwright: fonts, geometry, screenshots at 5 widths).
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const workspaceDir = path.resolve("projects", "aboriginal-studies-30", "workspace");
const mainPath = path.resolve(workspaceDir, "main.js");
const dataPath = path.resolve(workspaceDir, "course-data.js");
const componentsPath = path.resolve(workspaceDir, "lesson-components.js");
const stylesPath = path.resolve(workspaceDir, "styles.css");
const indexPath = path.resolve(workspaceDir, "index.html");
const evidenceDir = path.resolve("projects", "aboriginal-studies-30", "meta", "ab30-v2", "evidence", "R05");
const donorDir = path.resolve("projects", "biology30-unit-a-pilot-3", "workspace");

const mainSource = readFileSync(mainPath, "utf8");
const stylesSource = readFileSync(stylesPath, "utf8");

function sha256File(p: string): string {
  return "sha256:" + createHash("sha256").update(readFileSync(p)).digest("hex");
}

function sliceTopLevel(source: string, kind: "const" | "function", name: string): string {
  const anchor = kind === "function" ? `function ${name}(` : `${kind} ${name} =`;
  const start = source.indexOf(anchor);
  assert.ok(start >= 0, `seam "${name}" missing (production drift?)`);
  const lineStart = source.lastIndexOf("\n", start) + 1;
  const boundary = /^(?:function|const|let|var) [A-Za-z_$][\w$]*/gm;
  boundary.lastIndex = start + anchor.length;
  const next = boundary.exec(source);
  const slice = (next ? source.slice(lineStart, next.index) : source.slice(lineStart)).trim();
  new vm.Script(slice, { filename: `seam-${name}.js` });
  return slice;
}

function buildRuntime(): {
  seam: Record<string, (...args: never[]) => unknown>;
  blocks: Record<string, (...args: never[]) => unknown>;
  DATA: { units: Array<Record<string, unknown>> };
} {
  const dataContext = { window: {} as Record<string, unknown> };
  vm.createContext(dataContext);
  vm.runInContext(readFileSync(dataPath, "utf8"), dataContext, { filename: "course-data.js" });
  const DATA = JSON.parse(JSON.stringify(dataContext.window.ABORIGINAL_STUDIES_30_DATA)) as {
    units: Array<Record<string, unknown>>;
  };
  const context = { DATA, window: {} as Record<string, unknown>, console, URL, URLSearchParams } as Record<
    string,
    unknown
  >;
  vm.createContext(context);
  vm.runInContext(readFileSync(componentsPath, "utf8"), context, { filename: "lesson-components.js" });
  context.AB30LessonBlocks = (context.window as Record<string, unknown>).AB30LessonBlocks;
  const consts = [
    "units", "assignments", "coreVocabulary", "themeActivities",
    "ASSIGNMENT_PROMPT_LESSONS", "LESSON_DRAFTS", "REQUIREMENT_ROLE_OVERRIDES", "BOOKLET_SHELL_ASSIGNMENT_IDS",
  ];
  const fns = [
    "lessonContentVersion", "isV2Lesson", "storeAvailable", "lessonBlocksApi",
    "renderV2GoalStrip", "renderV2Blocks", "renderLessonGuide", "lessonEyebrow", "renderLessonArticle",
    "getUnitActivity", "lessonStartPage", "linkLessonTerms", "findVocabularyTerm", "escapeRegExp",
    "promptsForLesson", "renderLessonQuestions", "renderAssignmentDrafts", "activityResponseKey",
    "promptFieldKey", "tableFieldId", "tableFieldLabel", "escapeHtml", "toEmbedUrl", "renderConsentEmbed",
    "readCourseResponse", "renderActivityPromptLabel", "renderActivityPromptResources",
    "renderFillBlankPrompt", "renderMultipleChoicePrompt", "renderTablePrompt", "renderActivityPrompt",
    "conflictOriginLabel", "storeConflictsForKeys", "renderConflictPanelsForKeys",
    "roleForRequirement", "isKnownLegacyRequirement", "requirementItems", "requirementDenominator",
  ];
  const script = [
    ...consts.map((n) => sliceTopLevel(mainSource, "const", n)),
    ...fns.map((n) => sliceTopLevel(mainSource, "function", n)),
  ].join("\n\n");
  vm.runInContext(script, context, { filename: "ab30-visual-seam.js" });
  return {
    seam: context as unknown as Record<string, (...args: never[]) => unknown>,
    blocks: context.AB30LessonBlocks as unknown as Record<string, (...args: never[]) => unknown>,
    DATA,
  };
}

test("R05-VIS01: local variable fonts load from workspace assets, no remote dependency", () => {
  assert.match(
    stylesSource,
    /@font-face\s*{[^}]*font-family:\s*"Work Sans"[^}]*url\("\.\/assets\/fonts\/WorkSans-Variable\.ttf"\)/s
  );
  assert.match(
    stylesSource,
    /@font-face\s*{[^}]*font-family:\s*"Hanken Grotesk"[^}]*url\("\.\/assets\/fonts\/HankenGrotesk-Variable\.ttf"\)/s
  );
  assert.match(stylesSource, /font-weight:\s*100 900/);
  for (const file of ["WorkSans-Variable.ttf", "HankenGrotesk-Variable.ttf"]) {
    const target = path.resolve(workspaceDir, "assets", "fonts", file);
    const donor = path.resolve(donorDir, "assets", "fonts", file);
    assert.ok(existsSync(target), `workspace ships ${file}`);
    assert.equal(sha256File(target), sha256File(donor), `${file} byte-identical to donor`);
  }
  for (const file of ["OFL-Work-Sans.txt", "OFL-Hanken-Grotesk.txt"]) {
    assert.ok(existsSync(path.resolve(workspaceDir, "assets", "fonts", file)), `license kept: ${file}`);
  }
  assert.doesNotMatch(stylesSource, /fonts\.googleapis|fonts\.gstatic|base64/);
  assert.doesNotMatch(readFileSync(indexPath, "utf8"), /fonts\.googleapis|fonts\.gstatic/);
  const lock = JSON.parse(readFileSync(path.resolve(evidenceDir, "reference-lock.json"), "utf8")) as {
    assets: Array<{ targetHash: string; donorHash: string }>;
  };
  for (const asset of lock.assets) {
    assert.equal(asset.targetHash, asset.donorHash, "locked font hashes match donor");
  }
});

test("R05-VIS02: goal strip is two-column with normal-weight explanation", () => {
  assert.match(stylesSource, /\.lesson-goal-strip\s*{[^}]*grid-template-columns:\s*1fr 1fr/s);
  assert.match(stylesSource, /\.lesson-goal-strip--solo\s*{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(
    stylesSource,
    /\.lesson-goal-strip > div > p:not\(\.section-label\)\s*{[^}]*font-weight:\s*400/s
  );
  const { blocks } = buildRuntime();
  const renderGoalStrip = blocks.renderGoalStrip as (goal: unknown) => string;
  const html = renderGoalStrip({ goal: "SYNTH goal text.", prerequisite: "SYNTH prior." });
  assert.ok(html.includes("Learning goal"), "Learning goal column");
  assert.ok(html.includes("Before you begin"), "Before-you-begin column");
  assert.ok(!html.includes("<strong>SYNTH goal"), "goal text is not all-bold");
  assert.ok(!html.includes("Essential question"), "essential question is not buried in the goal card");
  const solo = renderGoalStrip({ goal: "SYNTH goal text." });
  assert.ok(solo.includes("lesson-goal-strip--solo"), "absent prerequisite renders no invented text");
  assert.ok(!solo.includes("Before you begin"), "absent prerequisite renders no empty column");
});

test("R05-VIS03: teaching headings are semantic; styling never depends on h4", () => {
  const { blocks } = buildRuntime();
  const renderBlock = blocks.renderBlock as (block: unknown, index: number, ctx: unknown) => string;
  const probes: Array<[unknown, string]> = [
    [{ type: "explanation", heading: "SYNTH H", paragraphs: ["SYNTH p."] }, "<h2>SYNTH H</h2>"],
    [{
      type: "workedExample", title: "SYNTH W", evidence: [{ ref: "R", text: "T" }],
      reasoning: ["S"], response: "SYNTH done.",
    }, "<h2>SYNTH W</h2>"],
    [{ type: "supportedPractice", title: "SYNTH S", method: "M", task: "T", feedback: "F" }, "<h2>SYNTH S</h2>"],
    [{
      type: "independentTask", title: "SYNTH I", task: "T",
      differsFrom: { evidence: "E" },
    }, "<h2>SYNTH I</h2>"],
  ];
  for (const [block, needle] of probes) {
    const html = renderBlock(block, 0, {});
    assert.ok(html.includes(needle), `headed section renders h2: ${needle}`);
    assert.ok(!html.includes("<h4"), "no h4 in headed teaching blocks");
    assert.ok(!html.includes("<h5"), "no h5 in headed teaching blocks");
  }
  const worked = renderBlock(probes[1][0], 0, {});
  assert.ok(worked.includes("<h3>Evidence</h3>"), "worked subheads are h3");
  assert.match(
    stylesSource,
    /\.teaching-block > h2,\s*\.worked-example > h2/s
  );
  assert.match(stylesSource, /\.theme-lesson \.social-document-header h1\s*{[^}]*clamp\(30px/s);
  assert.doesNotMatch(stylesSource, /teaching-block[^\n]*h4/);
});

test("R05-VIS04: lesson h1 names the topic; essential question sits below it", () => {
  const { seam, DATA } = buildRuntime();
  const renderLessonArticle = seam.renderLessonArticle as (
    activity: unknown, lesson: unknown, index: number) => string;
  const getUnitActivity = seam.getUnitActivity as (unitId: string) => unknown;
  const unit = DATA.units.find((u) => u.id === "theme-1") as { lessons: Array<Record<string, unknown>> };
  const lesson = unit.lessons.find((l) => l.id === "t1-l07-numbered-treaties") as Record<string, unknown>;
  const html = renderLessonArticle(getUnitActivity("theme-1"), lesson, 6);
  assert.ok(html.includes('data-testid="lesson-heading"'), "heading hook kept");
  assert.ok(
    /<h1[^>]*data-lesson-heading[^>]*>/.test(html),
    "lesson title is exactly one h1"
  );
  assert.equal((html.match(/<h1/g) || []).length, 1, "exactly one h1 per lesson article");
  const h1At = html.indexOf("<h1");
  const eqAt = html.indexOf('class="lesson-question"');
  assert.ok(eqAt > h1At, "essential question renders below the h1");
  assert.ok(html.includes('class="lesson-question"'), "question styling hook");
});

test("R05-VIS05: every lesson carries a truthful completion guide after the goal strip", () => {
  const { seam, DATA } = buildRuntime();
  const renderLessonArticle = seam.renderLessonArticle as (
    activity: unknown, lesson: unknown, index: number) => string;
  const getUnitActivity = seam.getUnitActivity as (unitId: string) => unknown;
  let count = 0;
  for (const unit of DATA.units) {
    const lessons = (unit.lessons || []) as Array<Record<string, unknown>>;
    lessons.forEach((lesson, index) => {
      const html = renderLessonArticle(getUnitActivity(String(unit.id)), lesson, index);
      count += 1;
      assert.ok(html.includes("How to complete this lesson"), `${lesson.id}: guide present`);
      assert.ok(
        html.includes('<details class="page-guide lesson-guide" data-testid="lesson-guide">'),
        `${lesson.id}: guide uses the page-guide component`
      );
      assert.ok(html.includes('<div class="guide-body">'), `${lesson.id}: guide body hook`);
      const goalAt = html.indexOf('data-testid="learning-goal"');
      const guideAt = html.indexOf("How to complete this lesson");
      if (goalAt >= 0) assert.ok(guideAt > goalAt, `${lesson.id}: guide sits after the complete goal strip`);
      const blocks = Array.isArray(lesson.blocks) ? (lesson.blocks as Array<Record<string, unknown>>) : [];
      const hasIndependentResponse = blocks.some(
        (block) => block["type"] === "independentTask" && typeof block["responseKey"] === "string"
      );
      if (hasIndependentResponse) {
        assert.ok(html.includes("Save first response"), `${lesson.id}: v2 independent names its real controls`);
        assert.ok(html.includes("Save revision"), `${lesson.id}: v2 revision names its real control`);
      } else {
        assert.ok(
          !html.includes("Save first response"),
          `${lesson.id}: guide must not name a control the lesson lacks`
        );
      }
      assert.ok(html.includes("All My Work"), `${lesson.id}: guide ends at the real collection`);
    });
  }
  assert.equal(count, 50, "all 50 lessons covered");
});

test("R05-VIS06: source cards stay compact; full record disclosed, never walled", () => {
  const { blocks } = buildRuntime();
  const renderBlock = blocks.renderBlock as (block: unknown, index: number, ctx: unknown) => string;
  const full = renderBlock({
    type: "source", title: "SYNTH title", speaker: "SYNTH Speaker", date: "1876",
    sourceType: "Report", locator: "SYNTH pp. 1-2", extract: "SYNTH extract text.",
    contextLimits: "SYNTH limits.", attribution: "SYNTH Archive",
  }, 0, {});
  assert.ok(full.includes('class="source-head"'), "compact visible head line");
  assert.ok(full.includes("<blockquote>SYNTH extract text.</blockquote>"), "extract stays a bare blockquote");
  assert.ok(full.includes("<summary>Source details</summary>"), "extended record disclosed");
  assert.ok(full.includes("SYNTH Archive"), "attribution kept in details");
  const bare = renderBlock({ type: "source", extract: "SYNTH bare extract." }, 0, {});
  assert.ok(!bare.includes("<dl>"), "bare extract renders no metadata list");
  assert.ok(!bare.includes("Source details"), "bare extract renders no empty disclosure");
  assert.match(stylesSource, /@media \(max-width:\s*640px\)[\s\S]*?\.source-card dl > div/s);
});

test("R05-VIS07: same-text fixture is frozen and covers both stylesheets", () => {
  const lockPath = path.resolve(evidenceDir, "same-text-fixture.json");
  assert.ok(existsSync(lockPath), "fixture lock exists");
  const lock = JSON.parse(readFileSync(lockPath, "utf8")) as {
    text: Record<string, unknown>; files: Record<string, string>;
  };
  for (const [file, hash] of Object.entries(lock.files)) {
    assert.equal(sha256File(path.resolve(evidenceDir, file)), hash, `${file} matches the frozen hash`);
  }
  const candidate = readFileSync(path.resolve(evidenceDir, "fixture-candidate.html"), "utf8");
  const donor = readFileSync(path.resolve(evidenceDir, "fixture-donor.html"), "utf8");
  assert.ok(candidate.includes("workspace/styles.css"), "candidate side uses candidate styles");
  assert.ok(
    donor.includes("biology30-unit-a-pilot-3/workspace/styles.css"),
    "donor side uses authorized donor styles"
  );
  const needles = [lock.text.title, lock.text.h2, lock.text.sourceExtract, lock.text.workedResponse];
  for (const needle of needles) {
    assert.ok(candidate.includes(String(needle)), "candidate fixture holds the locked text");
    assert.ok(donor.includes(String(needle)), "donor fixture holds the same locked text");
  }
});

test("R05-VIS08: shell-pinned lesson selectors survive the rebuild", () => {
  for (const pattern of [
    /\.theme-lesson-body/, /\.textbook-band/, /\.key-terms/, /\.key-terms > summary/,
    /\.terms-line\s*{/, /\.lesson-words dl/, /\.lesson-words h2/, /\.page-guide > summary span/,
    /\.page-guide/, /\.page-guide > summary/, /\.key-terms\.vocab-help\[open\]/,
    /\.page-guide > summary strong::before/, /\.page-guide\[open\] > summary::after/,
    /\.goal-strip/, /\.stop-check/, /\.check-source/, /\.terms-line button\.bio-term/,
  ]) {
    assert.match(stylesSource, pattern, `shell contract keeps ${pattern}`);
  }
  for (const needle of [
    "theme-lesson", "key-terms", "<summary>Vocabulary help</summary>", "Words for this lesson",
    "lesson-term-strip", "<strong>Key terms:</strong>", 'class="bio-term"', "data-vocab-term",
    "function linkLessonTerms", "page-guide", "check-source", "guide-body", "stop-check",
    "Check your understanding", "Show the explanation",
  ]) {
    assert.ok(mainSource.includes(needle), `main.js keeps ${needle}`);
  }
  for (const needle of ["lesson-check", "vocab-term-button", "vocab-row"]) {
    assert.ok(!mainSource.includes(needle), `main.js still avoids ${needle}`);
  }
});

test("R05-VIS09: lesson navigation attaches cleanly to the page edges", () => {
  assert.match(mainSource, /<p class="lesson-overview-return"><button/);
  assert.match(stylesSource, /\.course-page\.lesson-page\s*{[^}]*padding:\s*0;/s);
  assert.match(stylesSource, /\.lesson-overview-return\s*{[^}]*margin:\s*0;/s);
  assert.match(stylesSource, /\.lesson-overview-return \.lesson-jump\s*{[^}]*border-left:\s*0;[^}]*border-radius:\s*0;/s);
  assert.match(stylesSource, /\.lesson-pager\s*{[^}]*margin-top:\s*0;[^}]*background:\s*#f7f8f5;/s);
  assert.match(stylesSource, /\.lesson-pager \.lesson-jump:first-child\s*{[^}]*border-left:\s*0;/s);
  assert.match(stylesSource, /\.lesson-pager \.lesson-jump:last-child\s*{[^}]*border-right:\s*0;/s);
});
