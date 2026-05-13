import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const mainPath = path.resolve("projects/general-psychology-20-independent-studies-202633108/workspace/main.js");
const courseShellDataPath = path.resolve(
  "projects/general-psychology-20-independent-studies-202633108/workspace/course-shell-data.js",
);

async function readCourseShellData() {
  const source = await readFile(courseShellDataPath, "utf8");
  const jsonText = source.replace(/^\uFEFF/, "").replace(/^export default\s*/, "").replace(/;\s*$/, "");
  return JSON.parse(jsonText);
}

function extractRuntimeDecoder(source: string) {
  const start = source.indexOf("function normalizeCharsetLabel");
  const end = source.indexOf("function buildWorkspaceAssetUrl");
  assert.ok(start >= 0, "decoder start marker missing");
  assert.ok(end > start, "decoder end marker missing");

  const context = {
    TextDecoder,
    decodeFetchedArrayBuffer: undefined as undefined | ((buffer: ArrayBuffer, contentType?: string) => string),
  };
  vm.createContext(context);
  vm.runInContext(`${source.slice(start, end)}\nglobalThis.decodeFetchedArrayBuffer = decodeFetchedArrayBuffer;`, context);
  assert.equal(typeof context.decodeFetchedArrayBuffer, "function");
  return context.decodeFetchedArrayBuffer as (buffer: ArrayBuffer, contentType?: string) => string;
}

function extractDeadLinkPredicate(source: string) {
  const start = source.indexOf("const DEAD_LESSON_LINK_PATTERNS");
  const end = source.indexOf("function sanitizeHtmlContent");
  assert.ok(start >= 0, "dead-link predicate start marker missing");
  assert.ok(end > start, "dead-link predicate end marker missing");

  const context = {
    isDeadLessonLink: undefined as undefined | ((href: string) => boolean),
  };
  vm.createContext(context);
  vm.runInContext(`${source.slice(start, end)}\nglobalThis.isDeadLessonLink = isDeadLessonLink;`, context);
  assert.equal(typeof context.isDeadLessonLink, "function");
  return context.isDeadLessonLink as (href: string) => boolean;
}

test("general psychology quiz rows do not render conversion status pills", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(
    source,
    /const status = bucket === "assignments" && !isQuizLibraryItem\(activity\)\s+\? getActivityConversionStatus\(activity\)\s+: "";/,
  );
});

test("general psychology marks scanned dead lesson links as plain text candidates", async () => {
  const source = await readFile(mainPath, "utf8");
  const isDeadLessonLink = extractDeadLinkPredicate(source);

  assert.equal(
    isDeadLessonLink("http://moodle.eipsnextstep.ca/mod/glossary/showentry.php?courseid=330&eid=158&displayformat=dictionary"),
    true,
  );
  assert.equal(isDeadLessonLink("/d2l/common/dialogs/quickLink/quickLink.d2l?ou=6811&type=quiz&rCode=dead"), true);
  assert.equal(isDeadLessonLink("$@BOOKVIEWBYID*26616@$"), true);
  assert.equal(isDeadLessonLink("http://psychology.about.com/od/careersinpsychology/p/psychcareers.htm"), true);
  assert.equal(isDeadLessonLink("http://www.googleadservices.com/pagead/aclk?adurl=http://example.test"), true);
  assert.equal(isDeadLessonLink("http://mailto:admin@crisissupportcentre.com/"), true);
  assert.equal(isDeadLessonLink("https://www.youtube.com/watch?v=R-sVnmmw6WY"), false);
  assert.equal(isDeadLessonLink("content/unit/lesson.html"), false);
});

test("general psychology keeps default authoring-lock behavior", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /const AUTHORING_UNLOCK_ALL = false;/);
  assert.doesNotMatch(
    source,
    /function moduleCompletion\(module\)\s*\{[\s\S]*if \(AUTHORING_UNLOCK_ALL\) \{[\s\S]*isUnlocked: true/,
  );
  assert.doesNotMatch(
    source,
    /function buildUnlockedContentActivities\(content\)\s*\{[\s\S]*if \(AUTHORING_UNLOCK_ALL\) \{\s*return content;\s*\}/,
  );
  assert.match(source, /const moduleQuizzesUnlocked = module \? moduleCompletion\(module\)\.isUnlocked : false;/);
});

test("general psychology decodes UTF-16 lesson pages even when hosted as utf-8", async () => {
  const source = await readFile(mainPath, "utf8");
  const decodeFetchedArrayBuffer = extractRuntimeDecoder(source);
  const encoded = Buffer.from("Wundt\u2019s psychological laboratory", "utf16le");
  const buffer = encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength);

  assert.equal(
    decodeFetchedArrayBuffer(buffer, "text/html; charset=utf-8"),
    "Wundt\u2019s psychological laboratory",
  );
});

test("general psychology retries unavailable lesson images and removes failed media", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /function removeUnavailableImage\(/);
  assert.match(source, /function trySecureRemoteAssetUrl\(/);
  assert.match(source, /removeUnavailableImage\(image\);/);
  assert.match(source, /image\.complete && \(image\.naturalWidth === 0 \|\| image\.naturalHeight === 0\)/);
  assert.doesNotMatch(source, /Image unavailable from source\./);
});

test("general psychology does not render decorative telemetry cards", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.doesNotMatch(source, /Current latency/i);
  assert.doesNotMatch(source, /Active alerts/i);
  assert.doesNotMatch(source, /top-telemetry/);
  assert.doesNotMatch(source, /telemetry-card/);
});

test("general psychology exposes a persisted Next Step theme toggle", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /COURSE_THEME_MODES/);
  assert.match(source, /const DEFAULT_THEME_MODE = "next-step";/);
  assert.match(source, /THEME_PREFERENCE_VERSION/);
  assert.match(source, /parsed\.themePreferenceVersion === THEME_PREFERENCE_VERSION\s*\?\s*normalizeThemeMode\(parsed\.themeMode\)\s*:\s*DEFAULT_THEME_MODE/);
  assert.match(source, /state\.themePreferenceVersion = THEME_PREFERENCE_VERSION;/);
  assert.match(source, /data-theme-toggle="current"/);
  assert.match(source, /data-theme-toggle="next-step"/);
  assert.match(source, /aria-pressed="\$\{themeMode === "next-step"/);
  assert.match(source, /next-step-theme/);
  assert.match(source, /setThemeMode\(/);
  assert.match(source, /--ns-primary:\s*#1e6d0d/);
});

test("general psychology uses the forensics-style top menu on tablet and mobile", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /const SIDEBAR_COMPACT_QUERY = "\(max-width: 1023px\)";/);
  assert.match(source, /let compactSidebarOpen = false;/);
  assert.match(source, /function isSidebarCompactViewport\(\)/);
  assert.match(source, /class="sidebar-close"/);
  assert.match(source, /class="sidebar-scrim"/);
  assert.match(source, /data-close-sidebar/);
  assert.match(source, /compactSidebarOpen \? "compact-sidebar-open" : ""/);
  assert.match(source, /@media \(max-width: 1023px\)/);
  assert.match(source, /\.sidebar\s*\{[\s\S]*position: sticky;[\s\S]*width: 100%;[\s\S]*border-bottom: 1px solid var\(--line\);/);
  assert.match(source, /\.app\.compact-sidebar-open \.side-nav-ghost,\s*\n\s*\.app\.compact-sidebar-open \.module-list,\s*\n\s*\.app\.compact-sidebar-open \.library-list/);
  assert.match(source, /closeSidebarAfterCompactSelection\(\);/);
  assert.doesNotMatch(source, /\.app:not\(\.sidebar-hidden\) \.main::before/);
  assert.doesNotMatch(source, /\.app\.mobile-sidebar-open/);
  assert.doesNotMatch(source, /translateX\(-108%\)/);
});

test("general psychology quizzes use the forensics assessment format", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /data-quiz-layout="forensics-assessment"/);
  assert.match(source, /General Psychology 20 &bull; \$\{escapeHtml\(quizProfile\)\}/);
  assert.match(source, /Final Evaluation/);
  assert.match(source, /Section Breakdown/);
  assert.match(source, /Questions completed/);
  assert.match(source, /data-quiz-generate/);
  assert.match(source, /data-quiz-check-all/);
  assert.match(source, /class="quiz-choice-letter"/);
  assert.match(source, /data-testid="quiz-answer-choice"/);
  assert.match(source, /\.quiz-detail-surface \.quiz-action\.primary[\s\S]*background: #59A844;/);
  assert.match(source, /\.quiz-detail-surface \.quiz-choice\.selected,[\s\S]*background: #eef6eb;/);
  assert.match(source, /\.quiz-detail-surface \.quiz-choice\.incorrect[\s\S]*border-color: #ba1a1a;/);
  assert.match(source, /\.app\.next-step-theme \.quiz-detail-surface \.quiz-choice\.selected/);
  assert.doesNotMatch(source, /Forensic Studies 25/i);
});

test("general psychology does not show forensic course labels", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.doesNotMatch(source, /Digital forensics/i);
  assert.doesNotMatch(source, /Forensic Studies/i);
  assert.doesNotMatch(source, /Training phase/i);
  assert.doesNotMatch(source, /Case modules/i);
  assert.match(source, /General Psychology \/ \$\{escapeHtml\(moduleCode\)\} \/ Course module/);
  assert.match(source, /data-shell-nav="chapters"/);
});

test("general psychology uses the forensics35 course shell without assignments navigation", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /courseShellView/);
  assert.match(source, /data-shell-nav="home"/);
  assert.match(source, /data-shell-nav="chapters"/);
  assert.match(source, /data-shell-nav="quizzes"/);
  assert.doesNotMatch(source, /data-shell-nav="assignments"/);
  assert.match(source, /forensics35-home-library/);
  assert.match(source, /forensics35-chapters-library/);
  assert.match(source, /forensics35-quiz-library/);
  assert.match(source, /data-testid="forensics35-chapter-card"/);
  assert.match(source, /data-testid="forensics35-quiz-card"/);
  assert.match(source, /data-testid="chapter-sequence-list"/);
  assert.match(source, /data-testid="mark-complete-panel"/);
  assert.match(source, /data-open-shell-content/);
  assert.match(source, /data-open-shell-quiz/);
  assert.match(source, /SCHOLARLY ACCESS/);
});

test("general psychology module 6 excludes the social influence written response placeholder", async () => {
  const source = await readFile(courseShellDataPath, "utf8");

  assert.doesNotMatch(source, /chapter_15872\.html/);
  assert.match(source, /chapter_15853\.html/);
});

test("general psychology module 4 excludes the process of thinking written response placeholder", async () => {
  const source = await readFile(courseShellDataPath, "utf8");

  assert.doesNotMatch(source, /chapter_15812\.html/);
  assert.match(source, /chapter_15811\.html/);
});

test("general psychology module 2 excludes the principles of learning written response placeholder", async () => {
  const source = await readFile(courseShellDataPath, "utf8");

  assert.doesNotMatch(source, /chapter_15761\.html/);
  assert.match(source, /chapter_15760\.html/);
});

test("general psychology quiz assessments are backed by local quiz XML instead of missing-source placeholders", async () => {
  const courseShellData = await readCourseShellData();
  const mainSource = await readFile(mainPath, "utf8");

  const quizAssessments = courseShellData.modules
    .flatMap((module: { activities: Array<Record<string, unknown>> }) => module.activities)
    .filter((activity: Record<string, unknown>) => activity.kind === "assessment" && activity.resourceKind === "quiz");

  assert.ok(quizAssessments.length > 0, "expected quiz assessments in the shell");

  for (const activity of quizAssessments) {
    const sourceHref = String(activity.sourceHref || "");
    if (!sourceHref) {
      assert.match(
        mainSource,
        new RegExp(`"${String(activity.id).replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}"\\s*:`),
        `${activity.title} should be backed by a local quiz override when no sourceHref is present`,
      );
      continue;
    }

    assert.match(sourceHref, /^(content|сontent|quiz)\//, `${activity.title} should have a local sourceHref`);
    assert.doesNotMatch(
      String(activity.contentBody || ""),
      /did not include the source file/i,
      `${activity.title} should not use the missing-source fallback`,
    );
  }
});

test("general psychology keeps the final project pdf in content instead of classifying it as an assignment", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(
    source,
    /if \(resourceKind === "pdf" && \/\\bfinal\\s\+project\\b\/i\.test\(String\(activity\?\.title \|\| ""\)\)\) \{\s*return false;\s*\}/,
  );
});
