import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
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
    label: "AI-Resources",
    workspaceEdited: false
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

test("assessment pillars page has balanced assessment-weight sliders", async () => {
  const pagePath = path.join(projectDir, "workspace", "resources", "dean-ai-assessment-pillars.html");
  const html = await readUtf8(pagePath);

  assert.match(
    html,
    /Every major summative assessment is evaluated across three distinct buckets\. While the foundational model is 50\/25\/25, teachers use professional judgment to shift these weights based on course demands\. We do not change weights based on AI level, but rather on pedagogical intent\./
  );

  const pillarIcons = {
    product: "inventory_2",
    process: "call_merge",
    defence: "mic"
  };

  for (const [key, icon] of Object.entries(pillarIcons)) {
    assert.match(html, new RegExp(`id="${key}-weight"`));
    assert.match(html, new RegExp(`id="${key}-weight-label"`));
    assert.doesNotMatch(html, new RegExp(`id="${key}-weight-badge"`));
    assert.match(html, new RegExp(`oninput="updateAssessmentWeights\\('${key}'\\)"`));
    assert.match(html, new RegExp(`${key}-control`));
    assert.match(
      html,
      new RegExp(`<label for="${key}-weight" class="pillar-control weight-control ${key}-control">[\\s\\S]*<span class="material-symbols-outlined">${icon}</span>[\\s\\S]*<span>Weight</span>`)
    );
  }

  assert.doesNotMatch(html, /assessment-weight-meta/);
  assert.match(html, /pillar-control/);
  assert.doesNotMatch(html, /assessment-weight-panel/);
  assert.doesNotMatch(html, /weight-control-grid/);
  assert.doesNotMatch(html, /id="assessment-weight-total"/);
  assert.doesNotMatch(html, /<span class="material-symbols-outlined">tune<\/span>\s*<span>Weight<\/span>/);
  assert.match(html, /type="range"/);
  assert.match(html, /min="0"/);
  assert.match(html, /max="100"/);
  assert.match(html, /function updateAssessmentWeights\(activeKey\)/);
  assert.match(html, /const total = product \+ process \+ defence;/);
  assert.match(html, /const diff = 100 - total;/);
  assert.match(html, /sliders\[key\]\.value = weights\[key\];/);
  assert.match(html, /sliders\[key\]\.style\.setProperty\("--range-fill", `\$\{weights\[key\]\}%`\);/);
  assert.doesNotMatch(html, /badges\[key\]\.innerText/);
  assert.doesNotMatch(html, /totalLabel\.innerText = "100%";/);
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

  for (const level of [1, 2, 3]) {
    assert.match(html, new RegExp(`id="btn-game-ai-${level}"`));
    assert.match(html, new RegExp(`onclick="playScaleGame\\('ai', ${level}\\)"`));
  }

  assert.match(html, /onclick="playScaleGame\('evidence', 'add'\)"/);
  assert.match(html, /onclick="playScaleGame\('evidence', 'reset'\)"/);
  assert.match(html, /let scaleLeftWeight = 0;/);
  assert.match(html, /let scaleRightWeight = 0;/);
  assert.match(html, /function playScaleGame\(action, value\)/);
  assert.match(html, /function updateScaleVisuals\(\)/);
  assert.match(html, /const evidenceBlocks = \["Base Process", "Increased Evidence", "Maximum Evidence"\]\.slice\(0, scaleRightWeight\)\.reverse\(\);/);
  assert.match(html, /const diff = scaleLeftWeight - scaleRightWeight;/);
  assert.match(html, /beam\.style\.transform = `rotate\(\$\{angle\}deg\)`;/);
  assert.match(html, /Perfectly Balanced! The burden of proof matches the AI assistance level\./);
});

test("assessment pillars page places the intro framework video between hero and context", async () => {
  const pagePath = path.join(projectDir, "workspace", "resources", "dean-ai-assessment-pillars.html");
  const videoPath = path.join(projectDir, "workspace", "resources", "media", "ai-assessment-framework.mp4");
  const html = await readUtf8(pagePath);
  const videoSize = await fileSizeOrZero(videoPath);

  assert.ok(videoSize > 1_000_000, "expected the local intro video asset to be copied into workspace resources");
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

test("assessment pillars page attaches the presentation decks through an embedded viewer", async () => {
  const pagePath = path.join(projectDir, "workspace", "resources", "dean-ai-assessment-pillars.html");
  const deckDir = path.join(projectDir, "workspace", "resources", "decks");
  const manifestPath = path.join(projectDir, "meta", "project.json");
  const html = await readUtf8(pagePath);
  const manifest = JSON.parse(await readUtf8(manifestPath)) as ProjectManifest;
  const decks = [
    {
      id: "blueprint",
      title: "The AI-Aware Assessment Blueprint",
      pdf: "ai-assessment-blueprint.pdf",
      pptx: "ai-assessment-blueprint.pptx",
      pdfLinkId: "deck-blueprint-pdf",
      slide: "ai-assessment-blueprint/slide-001.jpg"
    },
    {
      id: "integrity",
      title: "Assessment Integrity Architecture",
      pdf: "assessment-integrity-architecture.pdf",
      pptx: "assessment-integrity-architecture.pptx",
      pdfLinkId: "deck-integrity-pdf",
      slide: "assessment-integrity-architecture/slide-001.jpg"
    },
    {
      id: "permit",
      title: "The AI Permit",
      pdf: "ai-permit.pdf",
      pptx: "ai-permit.pptx",
      pdfLinkId: "deck-permit-pdf",
      slide: "ai-permit/slide-001.jpg"
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
  assert.match(html, /sourceLink\.setAttribute\("href", pdfHref\);/);
  assert.match(html, /panel\.scrollIntoView\(\{ behavior: "smooth", block: "start" \}\);/);
  assert.match(html, /Download PDF/);
  assert.doesNotMatch(html, /Download PPTX/);

  for (const deck of decks) {
    const pdfPath = path.join(deckDir, deck.pdf);
    const pptxPath = path.join(deckDir, deck.pptx);
    const slidePath = path.join(deckDir, deck.slide);
    const pdfBytes = await readFile(pdfPath);
    const pptxBytes = await readFile(pptxPath);
    const slideBytes = await readFile(slidePath);

    assert.ok(pdfBytes.byteLength > 100_000, `${deck.pdf} should contain a real PDF preview`);
    assert.ok(pptxBytes.byteLength > 100_000, `${deck.pptx} should contain a real PowerPoint deck`);
    assert.ok(slideBytes.byteLength > 20_000, `${deck.slide} should contain a real slide image`);
    assert.ok(manifest.canonicalSources?.includes(pdfPath), `${deck.pdf} should be declared canonical`);
    assert.ok(manifest.canonicalSources?.includes(pptxPath), `${deck.pptx} should be declared canonical`);
    assert.match(html, new RegExp(escapeRegExp(deck.title)));
    assert.match(html, new RegExp(`onclick="openDeckViewer\\('${deck.id}'\\)"`));
    assert.match(html, new RegExp(`data-deck-card="${deck.id}"`));
    assert.match(html, new RegExp(`id="${deck.pdfLinkId}" href="\\./decks/${escapeRegExp(deck.pdf)}" data-inline-asset`));
    assert.match(html, new RegExp(`"\\./decks/${escapeRegExp(deck.slide)}"`));
    assert.match(html, new RegExp(`pdfLinkId: "${deck.pdfLinkId}"`));
    assert.match(html, /slides: \[/);
  }
});
