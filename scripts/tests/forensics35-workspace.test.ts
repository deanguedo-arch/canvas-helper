import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import ts from "typescript";

const workspaceMainJsxPath = path.resolve("projects/forensics35/workspace/main.jsx");
const workspaceMainJsPath = path.resolve("projects/forensics35/workspace/main.js");

function extractNamedFunction(source: string, functionName: string) {
  const marker = `function ${functionName}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `expected to find ${functionName}`);

  const bodyMarker = source.indexOf(") {", start);
  assert.notEqual(bodyMarker, -1, `expected to find ${functionName} body marker`);

  const bodyStart = source.indexOf("{", bodyMarker);
  assert.notEqual(bodyStart, -1, `expected to find ${functionName} body start`);

  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  throw new Error(`unable to extract function ${functionName}`);
}

test("forensics35 workspace main.jsx transpiles cleanly as React JSX", async () => {
  const source = await readFile(workspaceMainJsxPath, "utf8");
  const transpileResult = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ES2020,
      target: ts.ScriptTarget.ES2020
    },
    fileName: "main.jsx",
    reportDiagnostics: true
  });

  const diagnostics = (transpileResult.diagnostics ?? []).filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
  );
  assert.equal(diagnostics.length, 0);
});

test("forensics35 workspace runtime stays bound to the forensics35 storage key", async () => {
  const source = await readFile(workspaceMainJsxPath, "utf8");

  assert.match(source, /forensics35::workspace-state::v1/);
  assert.match(source, /module-assignments-view/);
  assert.match(source, /module-content-view/);
});

test("forensics35 sidebar carries the Forensic Studies 25 shell pattern", async () => {
  const source = await readFile(workspaceMainJsxPath, "utf8");

  assert.match(source, /data-testid="forensics35-fs25-sidebar-brand"/);
  assert.match(source, /SCHOLARLY ACCESS/);
  assert.match(source, /data-testid="forensics35-sidebar-progress"/);
  assert.match(source, /role="progressbar"/);
  assert.match(source, /data-shell-nav="home"/);
  assert.match(source, /data-library-view="modules"[\s\S]*Chapters/);
  assert.match(source, /data-library-view="quizzes"[\s\S]*Quizzes/);
  assert.doesNotMatch(source, /data-library-view="assignments"[\s\S]*Assignments/);
});

test("forensics35 top navigation renders Forensic Studies 25 style library pages without assignments", async () => {
  const source = await readFile(workspaceMainJsxPath, "utf8");

  assert.match(source, /courseShellView/);
  assert.match(source, /setCourseShellView\("home"\)/);
  assert.match(source, /setCourseShellView\("chapters"\)/);
  assert.match(source, /setCourseShellView\("quizzes"\)/);
  assert.doesNotMatch(source, /setCourseShellView\("assignments"\)/);
  assert.match(source, /forensics35-home-library/);
  assert.match(source, /forensics35-chapters-library/);
  assert.match(source, /forensics35-quiz-library/);
  assert.doesNotMatch(source, /forensics35-assignment-library/);
  assert.match(source, /data-open-shell-content/);
  assert.match(source, /data-open-shell-quiz/);
  assert.doesNotMatch(source, /data-open-shell-assignment/);
});

test("forensics35 library cards do not expose D2L manifest scaffolding copy", async () => {
  const jsxSource = await readFile(workspaceMainJsxPath, "utf8");
  const jsSource = await readFile(workspaceMainJsPath, "utf8");
  const scaffoldingCopy =
    /Mapped from the D2L manifest hierarchy|Manifest-derived lesson title|Source path preserved for traceability|renderer mappings|mapped from the course manifest/i;

  assert.doesNotMatch(jsxSource, scaffoldingCopy);
  assert.doesNotMatch(jsSource, scaffoldingCopy);
  assert.doesNotMatch(jsxSource, /firstUnlocked\?\.learn\?\.excerpt/);
});

test("forensics35 keeps one sticky mobile course toolbar and no duplicate menu buttons", async () => {
  const source = await readFile(workspaceMainJsxPath, "utf8");

  assert.match(source, /data-testid="forensics35-mobile-menu-toggle"/);
  assert.match(source, /data-testid="forensics35-fs25-sidebar-top"/);
  assert.match(source, /sticky top-0 z-30/);
  assert.match(source, /aria-label=\{isMobileMenuOpen \? "Close chapter menu" : "Open chapter menu"\}/);
  assert.doesNotMatch(source, /data-testid="mobile-menu-open-topbar"/);
  assert.doesNotMatch(source, /renderNextStepTopBar/);
  assert.doesNotMatch(source, /MODULES:/);
  assert.doesNotMatch(source, /Student User/);
});

test("forensics35 uses the option2 sticky mobile sidebar pattern instead of an off-canvas drawer", async () => {
  const source = await readFile(workspaceMainJsxPath, "utf8");

  assert.match(source, /data-sidebar-responsive-mode="option2-sticky"/);
  assert.match(source, /flex min-h-screen flex-col lg:flex-row/);
  assert.match(source, /data-testid="forensics35-fs25-sidebar-top"/);
  assert.match(source, /sticky top-0 z-30/);
  assert.match(source, /data-testid="forensics35-fs25-sidebar-body"/);
  assert.match(source, /isMobileMenuOpen \? "grid" : "hidden"/);
  assert.match(source, /lg:grid/);
  assert.doesNotMatch(source, /fixed inset-0 z-30 bg-black\/65|-translate-x-full lg:translate-x-0|fixed inset-y-0 left-0 z-40|title="Close menu overlay"/);
});

test("forensics35 applies the next-step theme across shell and reader chrome", async () => {
  const source = await readFile(workspaceMainJsxPath, "utf8");

  assert.match(source, /#59A844/i);
  assert.match(source, /#f3f4f3/i);
  assert.match(source, /#3c3f3e/i);
  assert.match(source, /#d9dad9/i);
  assert.doesNotMatch(source, /Student User/);
  assert.doesNotMatch(source, /ASSIGNMENTS:/);
  assert.doesNotMatch(source, /border-\[#403c38\] bg-\[#23211f\]/);
  assert.doesNotMatch(source, /#0e1729|#141d31|#2bd4ee|#69da5f|#95ff8f|#12380f|#b07a58|#8a5a3c/i);
  assert.doesNotMatch(source, /isReaderView \? "bg-\[#f7f8f5\] text-\[#171b18\]"/);
});

test("forensics35 quiz renderer uses the Forensic Studies 25 light assessment structure", async () => {
  const source = await readFile(workspaceMainJsxPath, "utf8");
  const quizRenderer = extractNamedFunction(source, "QuizRenderer");

  assert.match(quizRenderer, /data-quiz-layout="fs25-option2"/);
  assert.match(quizRenderer, /Forensic Studies 35/);
  assert.match(quizRenderer, /Module Assessment/);
  assert.match(quizRenderer, /Final Evaluation/);
  assert.match(quizRenderer, /Section Breakdown/);
  assert.match(quizRenderer, /Generate Results/);
  assert.match(quizRenderer, /Back to quizzes/);
  assert.match(quizRenderer, /data-testid="quiz-section-breakdown"/);
  assert.match(quizRenderer, /data-testid="quiz-question-row"/);
  assert.match(quizRenderer, /bg-\[#59A844\]/);
  assert.match(quizRenderer, /border-\[#d9dad9\]/);
  assert.match(quizRenderer, /data-testid="quiz-question-nav"/);
  assert.match(quizRenderer, /data-testid="quiz-answer-choice"/);
  assert.doesNotMatch(quizRenderer, /Clear answer|Next question|data-testid="quiz-next-question"|setQuestionIndex|activeQuestion|Assignments Report|<h1>Assignments Report|bg-\[#1a1215\]|text-\[#fecaca\]|border-white\/\[0\.12\]|bg-white\/\[0\.02\]|text-\[#d1d5db\]/);
});

test("forensics35 quiz reader route suppresses the old module-reader header", async () => {
  const source = await readFile(workspaceMainJsxPath, "utf8");

  assert.match(source, /const isQuizReaderView = isReaderView && sidebarLibraryView === "quizzes"/);
  assert.match(source, /!isQuizReaderView \? \(/);
  assert.match(source, /isQuizReaderView \? "max-w-6xl" : "max-w-5xl"/);
  assert.match(source, /data-quiz-reader-direct/);
  assert.doesNotMatch(source, /LegacyQuizRenderer|data-testid="quiz-next-question"/);
});

test("forensics35 reader sidebar hides reader blocks and chapter or quiz listings", async () => {
  const source = await readFile(workspaceMainJsxPath, "utf8");

  assert.doesNotMatch(source, /data-testid="sidebar-reader-summary"/);
  assert.doesNotMatch(source, /data-testid="module-list"/);
  assert.doesNotMatch(source, /data-testid="sidebar-quizzes-library"/);
  assert.doesNotMatch(source, /data-testid="module-panel"/);
  assert.doesNotMatch(source, /data-testid="module-content-item-btn"/);
  assert.doesNotMatch(source, /data-testid="library-item-btn"/);
});

test("forensics35 module reader supports authoring unlock while retaining locked-card styling", async () => {
  const source = await readFile(workspaceMainJsxPath, "utf8");

  assert.match(source, /const AUTHORING_UNLOCK_ALL = true;/);
  assert.match(source, /if \(AUTHORING_UNLOCK_ALL\) return lessons;/);
  assert.match(source, /if \(AUTHORING_UNLOCK_ALL\) return index < completedCount \? "complete" : "active";/);
  assert.match(source, /data-testid="chapter-sequence-list"/);
  assert.match(source, /lessonProgressStateAtIndex/);
  assert.match(source, /data-progress-state=\{progressState\}/);
  assert.match(source, /forensic-sequence-card\[data-progress-state="locked"\] \.forensic-sequence-card-body/);
  assert.match(source, /forensic-sequence-card \.forensic-sequence-card-body :where\(img, video, object, embed, canvas, svg\)/);
  assert.match(source, /forensic-sequence-card \.forensic-sequence-card-body :where\(iframe\)/);
  assert.match(source, /forensic-sequence-card \.forensic-sequence-card-body :where\(table\)/);
  assert.match(source, /filter:\s*blur\(3px\)/);
  assert.match(source, /Mark complete \+ next/);
});

test("forensics35 workspace transpiled main.js does not contain bare React module specifiers", async () => {
  const source = await readFile(workspaceMainJsPath, "utf8");

  assert.doesNotMatch(source, /from "react\/jsx-runtime"/);
  assert.doesNotMatch(source, /from "react-dom\/client"/);
  assert.match(source, /https:\/\/esm\.sh\/react@19\.1\.1\/jsx-runtime/);
});
