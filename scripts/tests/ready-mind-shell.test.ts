import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const projectRoot = path.resolve("projects/ready-mind");
const workspaceRoot = path.join(projectRoot, "workspace");
const resourcesMetaRoot = path.resolve("projects/resources/ready-mind/meta");

const mainPath = path.join(workspaceRoot, "main.js");
const indexPath = path.join(workspaceRoot, "index.html");
const stylesPath = path.join(workspaceRoot, "styles.css");
const assignmentRuntimePath = path.join(workspaceRoot, "assignment-runtime-main.js");
const assignmentRuntimeHtmlPath = path.join(workspaceRoot, "assignment-runtime.html");
const manifestPath = path.join(projectRoot, "meta", "project.json");
const e2eContractPath = path.join(projectRoot, "meta", "e2e-contract.json");

const requiredResourceControlDocs = [
  "ready-mind-course-brief.md",
  "sport-to-life-translation-guide.md",
  "ready-mind-scenario-library.md",
  "ready-mind-tool-library.md",
  "scope-and-safety-boundaries.md",
  "source-map.md"
];

const forbiddenShellTerms = [
  /\bSports\s+Wellness\b/i,
  /\bWhat is Sports Psychology\?\b/i,
  /\bThe Engine\b/,
  /\bThe Drive\b/,
  /\bThe Focus\b/,
  /\bThe Toolkit\b/,
  /\bathlete\b/i,
  /\bsport-specific\b/i,
  /\bcompetition\b/i,
  /\btraining modules\b/i,
  /sportswellness/i,
  /diag_data/,
  /vb_data/,
  /mb_data/,
  /p3_data/,
  /athlete_visualization_master_v1/
];

test("ready-mind project metadata, storage keys, and e2e contract are isolated from sportswellness", async () => {
  const [manifestSource, e2eContractSource, mainSource, runtimeSource] = await Promise.all([
    readFile(manifestPath, "utf8"),
    readFile(e2eContractPath, "utf8"),
    readFile(mainPath, "utf8"),
    readFile(assignmentRuntimePath, "utf8")
  ]);

  const manifest = JSON.parse(manifestSource) as {
    slug: string;
    projectType: string;
    preferredWorkflows: string[];
    canonicalEntry: string;
    canonicalSources: string[];
    googleHosted?: { trackedStorageKeys?: string[] };
  };
  const e2eContract = JSON.parse(e2eContractSource) as { projectSlug: string };

  assert.equal(manifest.slug, "ready-mind");
  assert.equal(manifest.projectType, "generated-course");
  assert.deepEqual(manifest.preferredWorkflows, ["generated-course"]);
  assert.match(manifest.canonicalEntry, /projects[\\/]ready-mind[\\/]workspace[\\/]index\.html$/);
  assert.ok(manifest.canonicalSources.some((entry) => /projects[\\/]ready-mind[\\/]workspace[\\/]main\.js$/.test(entry)));
  assert.equal(e2eContract.projectSlug, "ready-mind");

  const expectedStorageKeys = [
    "readymind.course-progress.v1",
    "readymind.ui-state.v1",
    "readymind.sidebarCollapsed",
    "readymind.baseline.v1",
    "readymind.stress-reset-plan.v1",
    "readymind.values-blueprint.v1",
    "readymind.sustainable-routine.v1",
    "readymind.focus-system.v1",
    "readymind.confidence-evidence.v1",
    "readymind.mental-rehearsal.v1"
  ];

  for (const key of expectedStorageKeys) {
    assert.match(`${mainSource}\n${runtimeSource}\n${manifestSource}`, new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.deepEqual(manifest.googleHosted?.trackedStorageKeys, expectedStorageKeys);
});

test("ready-mind workspace exposes Ready Mind placeholders without old sport-specific catalogs", async () => {
  const [indexSource, mainSource, runtimeSource, runtimeHtmlSource, stylesSource] = await Promise.all([
    readFile(indexPath, "utf8"),
    readFile(mainPath, "utf8"),
    readFile(assignmentRuntimePath, "utf8"),
    readFile(assignmentRuntimeHtmlPath, "utf8"),
    readFile(stylesPath, "utf8")
  ]);
  const combinedShellSource = `${indexSource}\n${mainSource}\n${runtimeSource}\n${runtimeHtmlSource}`;

  const expectedSnippets = [
    "The Ready Mind",
    "Practical tools for stress, focus, confidence, and performance in everyday life",
    "What Is Mental Readiness?",
    "The Ready State",
    "Sustainable Discipline",
    "Focused Action",
    "Confidence Before the Moment",
    "Ready Mind Baseline",
    "Stress Reset Plan",
    "Values-to-Action Blueprint",
    "Sustainable Routine Builder",
    "Focus System Blueprint",
    "Confidence Evidence Plan",
    "Mental Rehearsal Plan",
    "Stress State Simulator",
    "Focus Reset Simulator",
    "viewerSrc: ''",
    "const FILM_ROOM_VIDEOS = [];",
    "Quiz 00",
    "Ready Mind Baseline Check",
    "questions: []",
    "Questions will be added after lesson content is finalized",
    "Materials coming soon",
    "Performance tools will be added here after the Ready Mind lessons are finalized.",
    "Video resources will be added after the Ready Mind source list is finalized.",
    "Quiz coming soon"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(combinedShellSource, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(indexSource, /fonts\.googleapis\.com\/css2\?family=Inter/);
  assert.doesNotMatch(indexSource, /cdn\.tailwindcss\.com/);
  assert.match(stylesSource, /--surface: #f7f9fb;/);
  assert.match(stylesSource, /--surface-container-lowest: #ffffff;/);
  assert.match(stylesSource, /--on-surface: #191c1e;/);
  assert.match(stylesSource, /--primary: #006b5f;/);
  assert.match(stylesSource, /--primary-container: #14b8a6;/);
  assert.match(stylesSource, /--secondary: #4648d4;/);
  assert.match(stylesSource, /--amber: #f59e0b;/);
  assert.match(stylesSource, /\.glass-panel/);
  assert.match(stylesSource, /backdrop-filter: blur\(24px\)/);

  for (const forbidden of forbiddenShellTerms) {
    assert.doesNotMatch(combinedShellSource, forbidden);
  }
});

test("ready-mind resource-control documents exist and declare content boundaries", async () => {
  for (const docName of requiredResourceControlDocs) {
    const docPath = path.join(resourcesMetaRoot, docName);
    const source = await readFile(docPath, "utf8");
    assert.match(source, /Ready Mind|ready-mind/i);
    assert.match(source, /placeholder|source|boundary|translation|scenario|tool|scope/i);
  }
});
