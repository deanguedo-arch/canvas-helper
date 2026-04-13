import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/calm-module-4/workspace/main.jsx");
const indexPath = path.resolve("projects/calm-module-4/workspace/index.html");
const careerPlannerPath = path.resolve("projects/calm-module-4/workspace/components/careerplanning.reference.jsx");

test("calm-module-4 sidebar header uses Career and Portfolio as the primary title", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(
    source,
    /\/\* Sidebar Header \*\/[\s\S]*?<h1[^>]*>\s*Career and Portfolio\s*<\/h1>/
  );
});

test("calm-module-4 workspace index uses the career title and a cache-busted main bundle", async () => {
  const source = await readFile(indexPath, "utf8");

  assert.match(source, /<title>\s*Career and Portfolio\s*<\/title>/);
  assert.match(source, /<script src="\.\/main\.js\?rev=career-portfolio-v3"><\/script>/);
});

test("career planner hoists helper components outside App so inputs do not remount on every keypress", async () => {
  const source = await readFile(careerPlannerPath, "utf8");

  const inputGroupIndex = source.indexOf("const InputGroup =");
  const sectionCardIndex = source.indexOf("const SectionCard =");
  const appIndex = source.indexOf("const App = (");

  assert.notEqual(inputGroupIndex, -1);
  assert.notEqual(sectionCardIndex, -1);
  assert.notEqual(appIndex, -1);
  assert.ok(inputGroupIndex < appIndex);
  assert.ok(sectionCardIndex < appIndex);
});

test("career planner header and topics layout can wrap instead of forcing cramped one-line buttons", async () => {
  const source = await readFile(careerPlannerPath, "utf8");

  assert.match(source, /flex flex-col gap-4 py-4 xl:flex-row xl:items-center xl:justify-between/);
  assert.match(source, /whitespace-normal/);
  assert.doesNotMatch(source, /whitespace-nowrap border/);
});

test("career planner report action delegates to the shared module report generator", async () => {
  const [mainSource, plannerSource] = await Promise.all([
    readFile(mainPath, "utf8"),
    readFile(careerPlannerPath, "utf8")
  ]);

  assert.match(mainSource, /case 'portfolio':\s*return <CareerPlanning onGenerateReport=\{handleGenerateReport\} \/>;/);
  assert.match(plannerSource, /const App = \(\{ onGenerateReport \}\) => \{/);
  assert.match(plannerSource, /if \(typeof onGenerateReport === 'function'\) \{\s*onGenerateReport\(\);\s*return;\s*\}/);
});

test("main teacher report exposes final reflection as its own report section", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /const finalReflectionQuestions = \[/);
  assert.match(source, /const finalReflectionEntries = finalReflectionQuestions/);
  assert.match(source, /title: 'Final Reflection Responses'/);
});
