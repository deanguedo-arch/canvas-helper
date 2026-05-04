import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { repoRoot } from "../lib/paths.js";
import type { ProjectManifest } from "../lib/types.js";

const slug = "ai-course-building-resources";
const projectDir = path.join(repoRoot, "projects", slug);
const sourceDir = path.join(repoRoot, "canvas code and references", "AICOURSEBUILDING");

const sourceFiles = [
  {
    sourceName: "DEANAIASSESSMENTPILLARS",
    resourceName: "dean-ai-assessment-pillars.html",
    title: "DEANAIASSESSMENTPILLARS",
    label: "Assessment Pillars",
    workspaceEdited: true
  },
  {
    sourceName: "JONAIRESOURCE",
    resourceName: "jon-ai-resource.html",
    title: "JONAIRESOURCE",
    label: "AI resources",
    workspaceEdited: true
  }
];

async function readUtf8(filePath: string) {
  return readFile(filePath, "utf8");
}

async function fileSizeOrZero(filePath: string) {
  try {
    const file = await stat(filePath);
    return file.size;
  } catch {
    return 0;
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sliceBetween(value: string, startMarker: string, endMarker: string) {
  const start = value.indexOf(startMarker);
  const end = value.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0, `missing start marker: ${startMarker}`);
  assert.ok(end > start, `missing end marker after ${startMarker}: ${endMarker}`);
  return value.slice(start, end);
}

test("ai course building package preserves both source HTML pages behind one hub", async () => {
  const manifestPath = path.join(projectDir, "meta", "project.json");
  const hubPath = path.join(projectDir, "workspace", "index.html");
  const manifest = JSON.parse(await readUtf8(manifestPath)) as ProjectManifest;
  const hub = await readUtf8(hubPath);

  assert.equal(manifest.slug, slug);
  assert.equal(manifest.migrationState, "migrated");
  assert.equal(manifest.projectType, "conversion");
  assert.deepEqual(manifest.preferredWorkflows, ["conversion"]);
  assert.equal(manifest.authoringStatus, "active");
  assert.equal(manifest.canonicalEntry, path.join(projectDir, "workspace", "index.html"));
  assert.deepEqual(manifest.exportTargets, [
    {
      target: "html",
      enabled: true,
      notes: "Primary teacher-facing meeting package as one standalone HTML file."
    },
    {
      target: "google-hosted",
      enabled: true,
      notes: "Firebase Hosted digital presentation at https://digitalpresentation.web.app."
    }
  ]);

  assert.match(hub, /data-testid="resource-selector"/);
  assert.match(hub, /data-testid="resource-frame"/);
  assert.match(hub, /src="about:blank"/);
  assert.match(hub, /selectResource\("assessment"\);/);
  assert.match(hub, /class="resource-switcher"/);
  assert.match(hub, /data-active-resource="assessment"/);
  assert.match(hub, /--switch-active-bg: #00957E;/);
  assert.match(hub, /--switch-focus: #A4D55F;/);
  assert.match(hub, /body\[data-active-resource="assessment"\],\s*body\[data-active-resource="ai-resources"\]/);
  assert.doesNotMatch(hub, /#2563eb|#4f46e5|#111827|#374151|#a5b4fc/);
  assert.doesNotMatch(hub, /<h1>AI Course Building Resources<\/h1>/);

  for (const sourceFile of sourceFiles) {
    const sourcePath = path.join(sourceDir, sourceFile.sourceName);
    const workspaceResourcePath = path.join(projectDir, "workspace", "resources", sourceFile.resourceName);
    const rawResourcePath = path.join(projectDir, "raw", sourceFile.resourceName);
    const sourceHtml = await readUtf8(sourcePath);

    assert.match(sourceHtml, /<!DOCTYPE html>|<html[\s>]/i, `${sourceFile.sourceName} should be an HTML document`);
    assert.equal(await readUtf8(rawResourcePath), sourceHtml);
    if (!sourceFile.workspaceEdited) {
      assert.equal(await readUtf8(workspaceResourcePath), sourceHtml);
    } else {
      assert.notEqual(await readUtf8(workspaceResourcePath), sourceHtml);
    }
    assert.ok(
      manifest.canonicalSources?.includes(workspaceResourcePath),
      `expected ${sourceFile.resourceName} to be declared canonical`
    );
    assert.match(hub, new RegExp(sourceFile.resourceName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(hub, new RegExp(sourceFile.title));
    assert.match(hub, new RegExp(sourceFile.label));
  }
});

test("ai course building resources follow EIPS brand colours and typography", async () => {
  const themePath = path.join(projectDir, "workspace", "resources", "ai-course-theme.css");
  const hubPath = path.join(projectDir, "workspace", "index.html");
  const assessmentPath = path.join(projectDir, "workspace", "resources", "dean-ai-assessment-pillars.html");
  const resourcePath = path.join(projectDir, "workspace", "resources", "jon-ai-resource.html");
  const theme = await readUtf8(themePath);
  const hub = await readUtf8(hubPath);
  const assessment = await readUtf8(assessmentPath);
  const resource = await readUtf8(resourcePath);

  assert.match(theme, /--eips-green: 0 149 126;/);
  assert.match(theme, /--eips-lime: 164 213 95;/);
  assert.match(theme, /--eips-purple: 92 11 138;/);
  assert.match(theme, /--eips-orange: 255 107 0;/);
  assert.match(theme, /--color-primary: var\(--eips-green\);/);
  assert.match(theme, /--color-secondary: var\(--eips-lime\);/);
  assert.match(theme, /--color-tertiary: var\(--eips-orange\);/);
  assert.match(theme, /font-family: Calibri, Aptos, Arial, sans-serif;/);
  assert.match(theme, /font-family: "Times New Roman", Times, serif;/);
  assert.match(theme, /\.text-indigo-600 \{ color: rgb\(var\(--color-primary\)\) !important; \}/);
  assert.match(theme, /\.bg-indigo-700 \{ background-color: rgb\(var\(--color-primary\)\) !important; \}/);

  assert.match(hub, /--switch-active-bg: #00957E;/);
  assert.match(hub, /--switch-focus: #A4D55F;/);
  assert.match(hub, /font-family: Calibri, Aptos, Arial, sans-serif;/);
  assert.match(hub, />AI resources<\/button>/);
  assert.doesNotMatch(hub, /#2563eb|#07131f|#0f172a/);
  assert.doesNotMatch(hub, />AI-Resources<\/button>/);

  assert.doesNotMatch(assessment, /fonts\.googleapis\.com\/css2\?family=Inter|fonts\.googleapis\.com\/css2\?family=Montserrat/);
  assert.match(assessment, /"body-md": \["Calibri", "Aptos", "Arial", "sans-serif"\]/);
  assert.match(assessment, /"display": \["Times New Roman", "Times", "serif"\]/);
  assert.doesNotMatch(assessment, /font-family: 'Montserrat'/);
  assert.match(assessment, /Presentations and resources/);
  assert.match(assessment, /Proposed AI-Assessment Architecture/);
  assert.doesNotMatch(assessment, /Presentations & Resources/);
  assert.doesNotMatch(assessment, /AI-Assement|disclosure & self-advocacy|tracking-tight|tracking-wider|tracking-widest|tracking-\[/);

  assert.doesNotMatch(resource, /fonts\.googleapis\.com\/css2\?family=Inter/);
  assert.match(resource, /fontFamily: \{ sans: \['Calibri', 'Aptos', 'Arial', 'sans-serif'\] \}/);
  assert.match(resource, /font-family="Calibri, Aptos, Arial, sans-serif"/);
  assert.match(resource, /References and works cited/);
  assert.doesNotMatch(resource, /References & Works Cited/);
  assert.doesNotMatch(resource, /Practice & Apply|Action & Expression|&amp;|e\.g\.|tracking-tight|tracking-wider|tracking-widest/);
});

test("ai course building resources use readable presentation-scale sizing", async () => {
  const themePath = path.join(projectDir, "workspace", "resources", "ai-course-theme.css");
  const hubPath = path.join(projectDir, "workspace", "index.html");
  const assessmentPath = path.join(projectDir, "workspace", "resources", "dean-ai-assessment-pillars.html");
  const resourcePath = path.join(projectDir, "workspace", "resources", "jon-ai-resource.html");
  const theme = await readUtf8(themePath);
  const hub = await readUtf8(hubPath);
  const assessment = await readUtf8(assessmentPath);
  const resource = await readUtf8(resourcePath);

  assert.match(theme, /--readable-body-size: 18px;/);
  assert.match(theme, /--readable-body-line: 1\.62;/);
  assert.match(theme, /\.font-body-md \{[\s\S]*font-size: var\(--readable-body-size\);/);
  assert.match(theme, /\.assessment-page \.section-slide p,/);
  assert.match(theme, /\.ai-resource-page #content-area p,/);
  assert.match(theme, /font-size: 1\.125rem;/);
  assert.match(theme, /\.ai-resource-page \.nav-btn \{[\s\S]*font-size: 1rem !important;/);
  assert.match(theme, /body\.presentation-active\.ai-resource-page #content-area \{[\s\S]*max-width: 1180px;/);

  assert.match(hub, /grid-template-rows: 58px minmax\(0, 1fr\);/);
  assert.match(hub, /min-height: 40px;/);
  assert.match(hub, /font-size: 15px;/);

  assert.match(assessment, /<body class="assessment-page bg-surface text-on-surface font-body-md min-h-screen">/);
  assert.match(assessment, /"body-md": \["18px", \{"lineHeight": "1\.62"/);
  assert.match(assessment, /"body-lg": \["20px", \{"lineHeight": "1\.6"/);
  assert.match(assessment, /"h2": \["32px", \{"lineHeight": "1\.25"/);
  assert.match(assessment, /"display": \["56px", \{"lineHeight": "1\.08"/);

  assert.match(resource, /<body class="ai-resource-page bg-surface text-on-surface font-body-md/);
});

test("assessment pillars page has balanced assessment-weight sliders", async () => {
  const pagePath = path.join(projectDir, "workspace", "resources", "dean-ai-assessment-pillars.html");
  const html = await readUtf8(pagePath);

  assert.match(
    html,
    /Every major summative assessment is evaluated across three distinct buckets\. Teachers use professional judgment to shift these weights based on course demands\. We do not change weights based on AI level, but rather on pedagogical intent\./
  );

  const pillarIcons = {
    product: "inventory_2",
    process: "call_merge",
    defence: "mic"
  };

  for (const [key, icon] of Object.entries(pillarIcons)) {
    assert.match(html, new RegExp(`id="${key}-weight"`));
    assert.match(html, new RegExp(`id="${key}-weight-label"`));
    assert.match(html, new RegExp(`id="${key}-mark"`));
    assert.match(html, new RegExp(`id="${key}-score-segment"`));
    assert.match(html, new RegExp(`id="${key}-score-label"`));
    assert.doesNotMatch(html, new RegExp(`id="${key}-weight-badge"`));
    assert.match(html, new RegExp(`oninput="updateAssessmentWeights\\('${key}'\\)"`));
    assert.match(html, new RegExp(`oninput="updateAssessmentMarks\\(\\)"`));
    assert.match(html, new RegExp(`${key}-control`));
    assert.match(
      html,
      new RegExp(`<label for="${key}-weight" class="pillar-control weight-control ${key}-control">[\\s\\S]*<span class="material-symbols-outlined">${icon}</span>[\\s\\S]*<span>Weight</span>`)
    );
    assert.match(
      html,
      new RegExp(`<label for="${key}-mark" class="pillar-control mark-control ${key}-control">[\\s\\S]*<span>Mark</span>[\\s\\S]*<input id="${key}-mark" type="number" min="0" max="100" step="1" value="100"`)
    );
  }

  assert.doesNotMatch(html, /assessment-weight-meta/);
  assert.match(html, /pillar-control/);
  assert.match(html, /id="assessment-score-panel"/);
  assert.match(html, /id="assessment-score-panel" class="flex flex-col justify-end gap-3 lg:pl-6"/);
  assert.doesNotMatch(html, /id="assessment-score-panel" class="[^"]*(bg-surface-container|border|rounded-xl|p-5)/);
  assert.doesNotMatch(html, /<h3[^>]*>Assessment Score<\/h3>/);
  assert.doesNotMatch(html, />Weighted mix across the three evidence buckets\.</);
  assert.match(html, /id="assessment-score-total"/);
  assert.match(html, /id="assessment-score-total" class="self-end text-3xl font-black text-on-surface/);
  assert.match(html, /id="assessment-score-bar"/);
  assert.match(html, /id="assessment-score-bar" class="h-9 w-full overflow-hidden rounded-lg bg-surface-container-highest flex/);
  assert.match(html, /aria-label="Weighted assessment score: 100%\. Product earned 50% of the total, Process earned 25% of the total, Defence earned 25% of the total\."/);
  assert.match(html, /\.score-segment \{/);
  assert.match(html, /\.score-segment::before \{/);
  assert.match(html, /repeating-linear-gradient/);
  assert.match(html, /mix-blend-mode: screen/);
  assert.match(html, /score-segment-product/);
  assert.match(html, /score-segment-process/);
  assert.match(html, /score-segment-defence/);
  assert.match(html, /\.mark-control-field \{[\s\S]*min-width: 8rem;/);
  assert.match(html, /\.mark-control-field input \{[\s\S]*width: 5\.25rem;/);
  assert.match(html, /id="product-score-segment" class="score-segment score-segment-product[^"]*"/);
  assert.match(html, /id="process-score-segment" class="score-segment score-segment-process[^"]*"/);
  assert.match(html, /id="defence-score-segment" class="score-segment score-segment-defence[^"]*"/);
  assert.doesNotMatch(html, /id="product-score-segment" class="h-full bg-primary/);
  assert.doesNotMatch(html, /id="process-score-segment" class="h-full bg-secondary/);
  assert.doesNotMatch(html, /id="defence-score-segment" class="h-full bg-tertiary/);
  assert.match(html, /style="width: 50%"/);
  assert.match(html, /style="width: 25%"/);
  assert.doesNotMatch(html, /assessment-weight-panel/);
  assert.doesNotMatch(html, /weight-control-grid/);
  assert.doesNotMatch(html, /id="assessment-weight-total"/);
  assert.doesNotMatch(html, /<span class="material-symbols-outlined">tune<\/span>\s*<span>Weight<\/span>/);
  assert.match(html, /type="range"/);
  assert.match(html, /min="0"/);
  assert.match(html, /max="100"/);
  assert.match(html, /function updateAssessmentWeights\(activeKey\)/);
  assert.match(html, /function updateAssessmentMarks\(\)/);
  assert.match(html, /function calculateWeightedAssessment\(weights, marks\)/);
  assert.match(html, /const contributions = \{/);
  assert.match(html, /product: weights\.product \* marks\.product \/ 100,/);
  assert.match(html, /const totalScore = contributions\.product \+ contributions\.process \+ contributions\.defence;/);
  assert.match(html, /const total = product \+ process \+ defence;/);
  assert.match(html, /const diff = 100 - total;/);
  assert.match(html, /sliders\[key\]\.value = weights\[key\];/);
  assert.match(html, /sliders\[key\]\.style\.setProperty\("--range-fill", `\$\{weights\[key\]\}%`\);/);
  assert.match(html, /function updateAssessmentScoreBar\(weights\)/);
  assert.match(html, /const marks = readAssessmentMarks\(\);/);
  assert.match(html, /const earnedScores = calculateWeightedAssessment\(weights, marks\);/);
  assert.match(html, /scoreSegments\[key\]\.style\.width = `\$\{earnedScores\.contributions\[key\]\}%`;/);
  assert.match(html, /scoreLabels\[key\]\.innerText = `\$\{formatScore\(earnedScores\.contributions\[key\]\)\}% \/ \$\{weights\[key\]\}%`;/);
  assert.match(html, /scoreTotal\.innerText = `\$\{formatScore\(earnedScores\.total\)\}%`;/);
  assert.match(html, /scoreBar\.setAttribute\("aria-label", `Weighted assessment score: \$\{formatScore\(earnedScores\.total\)\}%\. Product earned \$\{formatScore\(earnedScores\.contributions\.product\)\}% of the total, Process earned \$\{formatScore\(earnedScores\.contributions\.process\)\}% of the total, Defence earned \$\{formatScore\(earnedScores\.contributions\.defence\)\}% of the total\.`\);/);
  assert.match(html, /updateAssessmentScoreBar\(weights\);/);
  assert.doesNotMatch(html, /badges\[key\]\.innerText/);
  assert.doesNotMatch(html, /totalLabel\.innerText = "100%";/);
});

test("assessment pillars page removes retired make-it-stronger workflow and multiple-choice sections", async () => {
  const pagePath = path.join(projectDir, "workspace", "resources", "dean-ai-assessment-pillars.html");
  const html = await readUtf8(pagePath);

  assert.doesNotMatch(html, /href="#toolbox"/);
  assert.doesNotMatch(html, /href="#workflow"/);
  assert.doesNotMatch(html, /href="#multiple-choice"/);
  assert.doesNotMatch(html, /href="#framework-stress-test"/);
  assert.doesNotMatch(html, /id="toolbox"/);
  assert.doesNotMatch(html, /id="workflow"/);
  assert.doesNotMatch(html, /id="multiple-choice"/);
  assert.doesNotMatch(html, /data-testid="framework-stress-test"/);
  assert.doesNotMatch(html, /How do we make this stronger\?/);
  assert.doesNotMatch(html, /A strong framework is not one that avoids criticism\./);
  assert.doesNotMatch(html, /Bring teachers and staff into the build/);
  assert.doesNotMatch(html, /data-stress-card="blue-team"/);
  assert.doesNotMatch(html, /data-stress-card="red-team"/);
  assert.doesNotMatch(html, /data-stress-card="consensus"/);
  assert.doesNotMatch(html, /Argument We Present/);
  assert.doesNotMatch(html, /The Defence is a Mathematical Scaling Nightmare/);
  assert.doesNotMatch(html, /Evidence Burden May Incentivize Concealment/);
  assert.doesNotMatch(html, /function toggleStressCard\(card\)/);
  assert.doesNotMatch(html, /Teacher Toolbox/);
  assert.doesNotMatch(html, /Syllabus Outline/);
  assert.doesNotMatch(html, /copyText\(/);
  assert.doesNotMatch(html, /id="copy-syllabus"/);
  assert.doesNotMatch(html, /Summative Workflow & Validity/);
  assert.doesNotMatch(html, /Validity Decision Engine/);
  assert.doesNotMatch(html, /Multiple Choice/);
  assert.doesNotMatch(html, /Multiple choice validation/);
  assert.doesNotMatch(html, /Validating Multiple-Choice/);
  assert.doesNotMatch(html, /Friction vs\. Integrity Layers/);
  assert.doesNotMatch(html, /function engineAnswer\(step, answer\)/);
  assert.doesNotMatch(html, /function showEngineResult/);
  assert.doesNotMatch(html, /function resetEngine/);
  assert.doesNotMatch(html, /href="#competency-gate"/);
  assert.doesNotMatch(html, /id="competency-gate"/);
  assert.doesNotMatch(html, /Permit Course/);
  assert.doesNotMatch(html, /The AI Permit Gate/);
  assert.doesNotMatch(html, /Student-Centered Learning 15/);
  assert.doesNotMatch(html, /Effective Prompting \(Interactive Demo\)/);
  assert.doesNotMatch(html, /The Ghostwriter Prompt/);
  assert.doesNotMatch(html, /The Tutor Prompt/);
  assert.doesNotMatch(html, /Google Gemini/);
  assert.doesNotMatch(html, /Google NotebookLM/);
  assert.ok(
    html.indexOf('id="validity-gate-simulator"') < html.indexOf('id="resources"'),
    "expected resources to follow the remaining assessment sections after retired sections are removed"
  );
});

test("assessment pillars page does not embed the staff collaboration workshop tool", async () => {
  const pagePath = path.join(projectDir, "workspace", "resources", "dean-ai-assessment-pillars.html");
  const componentSourcePath = path.join(projectDir, "workspace", "resources", "decks", "redteamblueteam.jsx");
  const manifestPath = path.join(projectDir, "meta", "project.json");
  const html = await readUtf8(pagePath);
  const manifest = JSON.parse(await readUtf8(manifestPath)) as ProjectManifest & {
    injectedComponents?: Array<Record<string, string>>;
    referenceOnly?: string[];
  };
  const sourceSize = await fileSizeOrZero(componentSourcePath);

  assert.equal(sourceSize, 0, "expected the removed staff collaboration source file to be absent");
  assert.doesNotMatch(html, /What We Are Trying To Replicate/);
  assert.doesNotMatch(html, /data-testid="red-blue-team-workshop"/);
  assert.doesNotMatch(html, /AI Framework Stress-Test Workshop/);
  assert.doesNotMatch(html, /stress-workshop/);
  assert.doesNotMatch(html, /STRESS_WORKSHOP_STORAGE_KEY/);
  assert.doesNotMatch(html, /function loadStressWorkshopState\(\)/);
  assert.doesNotMatch(html, /function saveStressWorkshopState\(\)/);
  assert.doesNotMatch(html, /function setStressWorkshopPhase/);
  assert.doesNotMatch(html, /function exportStressWorkshopSummary/);
  assert.doesNotMatch(JSON.stringify(manifest.injectedComponents ?? []), /redteamblueteam-workshop/);
  assert.doesNotMatch(JSON.stringify(manifest.googleHosted?.trackedStorageKeys ?? []), /stress-workshop/);
  assert.doesNotMatch(JSON.stringify(manifest.referenceOnly ?? []), new RegExp(escapeRegExp(componentSourcePath)));
});

test("ai course resource pages share the assessment pillars theme base", async () => {
  const resourcesDir = path.join(projectDir, "workspace", "resources");
  const themePath = path.join(resourcesDir, "ai-course-theme.css");
  const deanPath = path.join(resourcesDir, "dean-ai-assessment-pillars.html");
  const jonPath = path.join(resourcesDir, "jon-ai-resource.html");
  const manifestPath = path.join(projectDir, "meta", "project.json");
  const theme = await readUtf8(themePath);
  const deanHtml = await readUtf8(deanPath);
  const jonHtml = await readUtf8(jonPath);
  const manifest = JSON.parse(await readUtf8(manifestPath)) as ProjectManifest;

  assert.match(theme, /--color-surface:/);
  assert.match(theme, /body\.presentation-active/);
  assert.match(theme, /\.ai-resource-page/);
  assert.match(theme, /\.dark \.ai-resource-page/);
  assert.match(theme, /\.dark \.ai-resource-page \[class~="to-blue-50\/40"\]/);
  assert.match(theme, /\.dark \.ai-resource-page \[class~="bg-indigo-100\/50"\]/);
  assert.match(deanHtml, /<link rel="stylesheet" href="\.\/ai-course-theme\.css"\/>/);
  assert.match(jonHtml, /<link rel="stylesheet" href="\.\/ai-course-theme\.css"\/>/);
  assert.ok(manifest.canonicalSources?.includes(themePath), "expected the shared theme file to be declared canonical");

  assert.match(deanHtml, /<html class="dark scroll-smooth" lang="en">/);
  assert.match(deanHtml, /<body class="assessment-page bg-surface text-on-surface font-body-md min-h-screen">/);
  assert.match(deanHtml, /id="assessment-topbar-controls" class="[^"]*fixed[^"]*top-5[^"]*right-4[^"]*sm:right-8[^"]*justify-end/);
  assert.doesNotMatch(deanHtml, /Generate Board Report/);
  assert.match(jonHtml, /<html class="dark scroll-smooth" lang="en">/);
  assert.match(jonHtml, /<body class="ai-resource-page bg-surface text-on-surface font-body-md min-h-screen/);
  assert.match(jonHtml, /<header class="lg:hidden[^"]*bg-surface\/80[^"]*border-surface-variant/);
  assert.match(jonHtml, /<aside id="sidebar" class="[^"]*bg-surface-container-low[^"]*border-surface-variant/);
  assert.match(jonHtml, /<main class="[^"]*bg-surface[^"]*text-on-surface/);
  assert.match(jonHtml, /id="ai-resource-topbar"/);
  assert.match(jonHtml, /id="theme-toggle-mobile"[^>]*onclick="toggleDarkMode\(\)"/);
  assert.match(jonHtml, /id="theme-toggle-desktop"[^>]*onclick="toggleDarkMode\(\)"/);
  assert.match(jonHtml, /id="ai-resource-mobile-controls" class="[^"]*ml-auto[^"]*justify-end/);
  assert.match(jonHtml, /id="ai-resource-topbar-controls" class="[^"]*ml-auto[^"]*justify-end/);
  assert.match(jonHtml, /id="presentation-toggle-desktop"[^>]*onclick="togglePresentationMode\(\)"/);
  assert.match(jonHtml, /id="presentation-toggle-mobile"[^>]*onclick="togglePresentationMode\(\)"/);
  assert.match(jonHtml, /id="exit-pres-btn"[^>]*onclick="togglePresentationMode\(\)"/);
  assert.match(jonHtml, /const AI_COURSE_THEME_STORAGE_KEY = "ai-course-theme";/);
  assert.match(jonHtml, /function applyStoredTheme\(\)/);
  assert.match(jonHtml, /window\.matchMedia\("\(prefers-color-scheme: dark\)"\)/);
  assert.match(jonHtml, /localStorage\.setItem\(AI_COURSE_THEME_STORAGE_KEY, nextTheme\);/);
  assert.match(jonHtml, /function syncThemeIcons\(\)/);
  assert.match(jonHtml, /function togglePresentationMode\(\)/);
  assert.match(jonHtml, /document\.body\.classList\.toggle\("presentation-active"/);
  assert.doesNotMatch(jonHtml, /<body class="bg-slate-100 text-slate-900/);
  assert.doesNotMatch(jonHtml, /<main class="[^"]*bg-slate-50/);
});

test("assessment pillars page has interactive evidence scale simulator", async () => {
  const pagePath = path.join(projectDir, "workspace", "resources", "dean-ai-assessment-pillars.html");
  const html = await readUtf8(pagePath);

  assert.match(html, /id="evidence-scale-simulator"/);
  assert.match(html, /INTERACTIVE SCALE SIMULATOR/);
  assert.match(html, /Same outcome\. Same weights\. Different evidence burden\./);
  assert.match(html, /id="game-message"/);
  assert.match(html, /id="scale-beam"/);
  assert.match(html, /id="left-pan-container"/);
  assert.match(html, /id="right-pan-container"/);
  assert.match(html, /id="left-items"/);
  assert.match(html, /id="right-items"/);
  assert.match(html, /id="evidence-count"/);
  assert.match(html, /id="game-explanation"/);

  for (const level of [1, 2]) {
    assert.match(html, new RegExp(`id="btn-game-ai-${level}"`));
    assert.match(html, new RegExp(`onclick="playScaleGame\\('ai', ${level}\\)"`));
  }
  assert.doesNotMatch(html, /id="btn-game-ai-3"/);
  assert.doesNotMatch(html, /onclick="playScaleGame\('ai', 3\)"/);
  assert.doesNotMatch(html, /Level 2: AI-Assisted/);
  assert.doesNotMatch(html, /Active AI drafting\/editing/);
  assert.doesNotMatch(html, /AI-Assisted/);
  assert.doesNotMatch(html, /Maximum Evidence/);
  assert.doesNotMatch(html, /scaleLeftWeight === 3/);
  assert.doesNotMatch(html, /Level 2 requires maximum defence evidence/);

  assert.match(html, /onclick="playScaleGame\('evidence', 'add'\)"/);
  assert.match(html, /onclick="playScaleGame\('evidence', 'reset'\)"/);
  assert.match(html, /let scaleLeftWeight = 0;/);
  assert.match(html, /let scaleRightWeight = 0;/);
  assert.match(html, /function playScaleGame\(action, value\)/);
  assert.match(html, /function updateScaleVisuals\(\)/);
  assert.match(html, /const evidenceBlocks = \["Base Process", "Increased Evidence"\]\.slice\(0, scaleRightWeight\)\.reverse\(\);/);
  assert.match(html, /const diff = scaleLeftWeight - scaleRightWeight;/);
  assert.match(html, /beam\.style\.transform = `rotate\(\$\{angle\}deg\)`;/);
  assert.match(html, /Perfectly Balanced! The burden of proof matches the AI assistance level\./);
  assert.match(html, /Potential Evidence/);
  assert.doesNotMatch(html, /Required Evidence Bucket/);
  assert.match(html, /Loom video walkthrough/);
  assert.match(html, /Google Doc edit access and version history/);
  assert.match(html, /Gemini conversation logs/);
  assert.match(html, /NotebookLM source access/);
  assert.match(html, /Rough draft/);
  assert.match(html, /Brainstorming page/);
  assert.match(html, /Research plan for information gathering/);
});

test("assessment pillars page embeds the validity gate simulator after AI levels", async () => {
  const pagePath = path.join(projectDir, "workspace", "resources", "dean-ai-assessment-pillars.html");
  const sourcePath = path.join(sourceDir, "decks", "validitygatecode");
  const videoPath = path.join(projectDir, "workspace", "resources", "media", "oral-defense-overview.mp4");
  const manifestPath = path.join(projectDir, "meta", "project.json");
  const html = await readUtf8(pagePath);
  const sourceSize = await fileSizeOrZero(sourcePath);
  const videoSize = await fileSizeOrZero(videoPath);
  const manifest = JSON.parse(await readUtf8(manifestPath)) as ProjectManifest & {
    injectedComponents?: Array<Record<string, string>>;
  };

  assert.ok(sourceSize > 20_000, "expected the source validity gate simulator to contain real HTML bytes");
  assert.ok(videoSize > 10_000_000, "expected the oral defense overview video to be packaged");
  assert.match(html, /href="#validity-gate-simulator"/);
  assert.match(html, /Validity Gates/);
  assert.match(html, /id="validity-gate-simulator"/);
  assert.match(html, /data-testid="validity-gate-simulator"/);
  assert.match(html, /Establishing Validity Gates/);
  assert.match(html, /Interactive Training Simulator/);
  assert.match(html, /Navigate real-world scenarios to practice applying the assessment integrity workflow/);
  assert.match(html, /id="oral-defense-overview"/);
  assert.match(html, /Oral Defense Overview/);
  assert.match(html, /<video[\s\S]*controls[\s\S]*preload="metadata"[\s\S]*src="\.\/media\/oral-defense-overview\.mp4"/);
  assert.match(html, /Your browser does not support embedded video playback\./);
  assert.match(html, /id="validity-progress-header"/);
  assert.match(html, /id="validity-flowchart-container"/);
  assert.match(html, /id="validity-game-content"/);
  assert.match(html, /id="validity-scenario-counter"/);
  assert.match(html, /id="validity-scenario-subject"/);
  assert.match(html, /const VALIDITY_GATE_SCENARIOS = \[/);
  assert.match(html, /student: "Alex"/);
  assert.match(html, /student: "Maya"/);
  assert.match(html, /anthropogenic radiative forcing/);
  assert.match(html, /Big O notation/);
  assert.match(html, /function setValidityGateStep\(newStep\)/);
  assert.match(html, /function handleValidityGateDecision\(decision\)/);
  assert.match(html, /function renderValidityGateFlowchart\(\)/);
  assert.match(html, /function renderValidityGateContent\(\)/);
  assert.match(html, /function restartValidityGateSimulation\(\)/);
  assert.match(html, /renderValidityGateSimulator\(\);/);
  assert.match(html, /hidden md:flex items-start justify-center w-full gap-4 text-sm font-extrabold text-center/);
  assert.match(html, /min-h-\[56px\] px-5 py-4 rounded-lg border-2/);
  assert.match(html, /min-w-\[160px\]/);
  assert.match(html, /bg-surface-container text-on-surface border-outline opacity-95/);
  assert.match(html, /text-outline mt-4 text-\[24px\]/);
  assert.doesNotMatch(html, /bg-surface text-on-surface-variant border-outline-variant opacity-70/);
  assert.doesNotMatch(html, /Interactive Simulator - Validity Gates/);
  assert.doesNotMatch(sliceBetween(html, 'id="validity-gate-simulator"', 'id="resources"'), /<script src="https:\/\/cdn\.tailwindcss\.com/);
  assert.ok(
    html.indexOf('href="#ai-levels"') < html.indexOf('href="#validity-gate-simulator"'),
    "expected validity gates nav to appear after AI levels"
  );
  assert.ok(
    html.indexOf('href="#validity-gate-simulator"') < html.indexOf('href="#resources"'),
    "expected validity gates nav to appear before resources"
  );
  assert.ok(
    html.indexOf('id="ai-levels"') < html.indexOf('id="validity-gate-simulator"'),
    "expected validity gate simulator to appear after AI levels"
  );
  assert.ok(
    html.indexOf('id="validity-gate-simulator"') < html.indexOf('id="resources"'),
    "expected validity gate simulator to appear before resources"
  );
  assert.ok(
    html.indexOf("Navigate real-world scenarios to practice applying the assessment integrity workflow") <
      html.indexOf('id="oral-defense-overview"'),
    "expected the oral defense video to appear after the validity gates subheading"
  );
  assert.ok(
    html.indexOf('id="oral-defense-overview"') < html.indexOf('id="validity-progress-header"'),
    "expected the oral defense video to appear before the simulator panel"
  );
  assert.match(JSON.stringify(manifest.injectedComponents ?? []), /validitygatecode-simulator/);
  assert.ok(manifest.canonicalSources?.includes(videoPath), "oral defense overview video should be declared canonical");
});

test("assessment pillars page places the intro framework video between hero and context", async () => {
  const pagePath = path.join(projectDir, "workspace", "resources", "dean-ai-assessment-pillars.html");
  const videoPath = path.join(projectDir, "workspace", "resources", "media", "ai-assessment-framework.mp4");
  const html = await readUtf8(pagePath);
  const videoSize = await fileSizeOrZero(videoPath);

  assert.ok(videoSize > 30_000_000, "expected the Next Step Assessment Overview video to replace the previous intro asset");
  assert.match(html, /id="framework-intro"/);
  assert.match(html, /Start Here: The Assessment Framework/);
  assert.match(html, /max-w-5xl mx-auto w-full flex flex-col items-center gap-6 text-center/);
  assert.match(html, /w-full max-w-4xl bg-surface-container border border-surface-variant rounded-xl p-3/);
  assert.doesNotMatch(html, /framework-intro"[\s\S]{0,500}lg:grid-cols/);
  assert.match(html, /<video[\s\S]*controls[\s\S]*preload="metadata"[\s\S]*src="\.\/media\/ai-assessment-framework\.mp4"/);
  assert.match(html, /Your browser does not support embedded video playback\./);
  assert.ok(
    html.indexOf("Product. Process. Defence.") < html.indexOf('id="framework-intro"'),
    "expected the intro video to appear after the hero"
  );
  assert.ok(
    html.indexOf('id="framework-intro"') < html.indexOf('id="context"'),
    "expected the intro video to appear before the context section"
  );
});

test("assessment pillars page offers a playable framework audio overview in the resources section", async () => {
  const pagePath = path.join(projectDir, "workspace", "resources", "dean-ai-assessment-pillars.html");
  const audioPath = path.join(projectDir, "workspace", "resources", "media", "product-process-defence-overview.m4a");
  const manifestPath = path.join(projectDir, "meta", "project.json");
  const html = await readUtf8(pagePath);
  const manifest = JSON.parse(await readUtf8(manifestPath)) as ProjectManifest;
  const audioSize = await fileSizeOrZero(audioPath);

  assert.ok(audioSize > 3_000_000, "expected the Product, Process, and Defence audio overview to be packaged");
  assert.match(html, /id="framework-audio-overview"/);
  assert.match(html, /Product, Process, and Defence Overview/);
  assert.match(html, /<audio[\s\S]*controls[\s\S]*preload="metadata"[\s\S]*src="\.\/media\/product-process-defence-overview\.m4a"/);
  assert.match(html, /Your browser does not support embedded audio playback\./);
  assert.ok(
    html.indexOf("Presentations and resources") < html.indexOf('id="framework-audio-overview"'),
    "expected audio overview to appear inside the resources section after its heading"
  );
  assert.ok(
    html.indexOf('id="framework-audio-overview"') < html.indexOf('data-deck-card="proposed"'),
    "expected audio overview to appear before the deck cards"
  );
  assert.ok(manifest.canonicalSources?.includes(audioPath), "audio overview should be declared canonical");
});

test("assessment pillars page attaches the current presentation deck through an embedded viewer", async () => {
  const pagePath = path.join(projectDir, "workspace", "resources", "dean-ai-assessment-pillars.html");
  const deckDir = path.join(projectDir, "workspace", "resources", "decks");
  const manifestPath = path.join(projectDir, "meta", "project.json");
  const html = await readUtf8(pagePath);
  const manifest = JSON.parse(await readUtf8(manifestPath)) as ProjectManifest;
  const currentDecks = [
    {
      id: "proposed",
      title: "Proposed AI-Assessment Architecture",
      pptx: "proposed-ai-assessment-architecture.pptx",
      sourceLinkId: "deck-proposed-pptx",
      slideDir: "proposed-ai-assessment-architecture"
    },
    {
      id: "retrieval",
      title: "Retrieval Practice: Oral Assessment",
      pptx: "retrieval-practice-oral-assessment.pptx",
      sourceLinkId: "deck-retrieval-pptx",
      slideDir: "retrieval-practice-oral-assessment"
    }
  ];
  const retiredDecks = [
    {
      id: "blueprint",
      title: "The AI-Aware Assessment Blueprint",
      pdf: "ai-assessment-blueprint.pdf",
      pptx: "ai-assessment-blueprint.pptx",
      sourceLinkId: "deck-blueprint-pdf",
      slideDir: "ai-assessment-blueprint"
    },
    {
      id: "integrity",
      title: "Assessment Integrity Architecture",
      pdf: "assessment-integrity-architecture.pdf",
      pptx: "assessment-integrity-architecture.pptx",
      sourceLinkId: "deck-integrity-pdf",
      slideDir: "assessment-integrity-architecture"
    },
    {
      id: "permit",
      title: "The AI Permit",
      pdf: "ai-permit.pdf",
      pptx: "ai-permit.pptx",
      sourceLinkId: "deck-permit-pdf",
      slideDir: "ai-permit"
    }
  ];
  assert.match(html, /id="deck-viewer-panel"/);
  assert.match(html, /id="deck-slide-image"/);
  assert.match(html, /id="deck-slide-count"/);
  assert.match(html, /id="deck-slide-prev"/);
  assert.match(html, /id="deck-slide-next"/);
  assert.doesNotMatch(html, /id="deck-viewer-frame"/);
  assert.match(html, /id="deck-source-link"/);
  assert.match(html, /Slide Deck Preview/);
  assert.match(html, /function openDeckViewer\(deckId\)/);
  assert.match(html, /function showDeckSlide\(direction\)/);
  assert.match(html, /function renderDeckSlide\(\)/);
  assert.match(html, /function closeDeckViewer\(\)/);
  assert.doesNotMatch(html, /frame\.setAttribute\("src", pdfHref\);/);
  assert.match(html, /slideImage\.setAttribute\("src", currentSlide\.href\);/);
  assert.match(html, /sourceLink\.setAttribute\("href", sourceHref\);/);
  assert.match(html, /panel\.scrollIntoView\(\{ behavior: "smooth", block: "start" \}\);/);
  assert.match(html, /Download PowerPoint/);
  assert.doesNotMatch(html, /Download PDF/);

  assert.equal([...html.matchAll(/data-deck-card="[^"]+"/g)].length, currentDecks.length);

  for (const deck of currentDecks) {
    const slideDir = path.join(deckDir, deck.slideDir);
    const slideFiles = (await readdir(slideDir).catch(() => []))
      .filter((fileName) => /^slide-\d+\.jpg$/i.test(fileName))
      .sort();
    const pptxPath = path.join(deckDir, deck.pptx);
    const pptxBytes = await readFile(pptxPath);

    assert.ok(pptxBytes.byteLength > 100_000, `${deck.pptx} should contain a real PowerPoint deck`);
    assert.ok(slideFiles.length > 0, `expected generated slide previews for ${deck.title}`);
    assert.ok(manifest.canonicalSources?.includes(pptxPath), `${deck.pptx} should be declared canonical`);
    assert.ok(
      manifest.generatedOutputs?.some((outputPath) =>
        outputPath.endsWith(path.join(deck.slideDir, "slide-*.jpg"))
      ),
      `expected ${deck.title} slide previews to be declared generated outputs`
    );
    assert.match(html, new RegExp(escapeRegExp(deck.title)));
    assert.match(html, new RegExp(`onclick="openDeckViewer\\('${deck.id}'\\)"`));
    assert.match(html, new RegExp(`data-deck-card="${deck.id}"`));
    assert.match(html, new RegExp(`id="${deck.sourceLinkId}" href="\\./decks/${escapeRegExp(deck.pptx)}" data-inline-asset`));
    assert.match(html, new RegExp(`sourceLinkId: "${deck.sourceLinkId}"`));
    assert.match(html, new RegExp(`downloadName: "${deck.pptx}"`));
    assert.match(html, /slides: \[/);

    for (const slideFile of slideFiles) {
      const slidePath = path.join(slideDir, slideFile);
      const slideBytes = await readFile(slidePath);
      assert.ok(slideBytes.byteLength > 20_000, `${deck.slideDir}/${slideFile} should contain a real slide image`);
      assert.match(html, new RegExp(`"\\./decks/${deck.slideDir}/${escapeRegExp(slideFile)}"`));
    }
  }

  for (const retiredDeck of retiredDecks) {
    assert.doesNotMatch(html, new RegExp(escapeRegExp(retiredDeck.title)));
    assert.doesNotMatch(html, new RegExp(`openDeckViewer\\('${retiredDeck.id}'\\)`));
    assert.doesNotMatch(html, new RegExp(`data-deck-card="${retiredDeck.id}"`));
    assert.doesNotMatch(html, new RegExp(escapeRegExp(retiredDeck.sourceLinkId)));
    assert.doesNotMatch(html, new RegExp(escapeRegExp(retiredDeck.pptx)));
    assert.doesNotMatch(html, new RegExp(escapeRegExp(retiredDeck.pdf)));
    assert.doesNotMatch(html, new RegExp(escapeRegExp(retiredDeck.slideDir)));
    assert.equal(await fileSizeOrZero(path.join(deckDir, retiredDeck.pptx)), 0, `${retiredDeck.pptx} should be removed`);
    assert.equal(await fileSizeOrZero(path.join(deckDir, retiredDeck.pdf)), 0, `${retiredDeck.pdf} should be removed`);
    assert.doesNotMatch(JSON.stringify(manifest.canonicalSources ?? []), new RegExp(escapeRegExp(retiredDeck.pptx)));
    assert.doesNotMatch(JSON.stringify(manifest.canonicalSources ?? []), new RegExp(escapeRegExp(retiredDeck.pdf)));
  }
});
