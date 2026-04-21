import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/sportswellness/workspace/main.js");
const phase1GameHtmlPath = path.resolve("projects/sportswellness/workspace/performance/phase1-performance-state-simulator-game.html");
const phase1GameAppPath = path.resolve("projects/sportswellness/workspace/performance/phase1-performance-state-simulator-game.app.js");
const disciplineGameHtmlPath = path.resolve("projects/sportswellness/workspace/performance/phase2-discipline-game.html");
const disciplineGameAppPath = path.resolve("projects/sportswellness/workspace/performance/phase2-discipline-game.app.js");
const gameHtmlPath = path.resolve("projects/sportswellness/workspace/performance/phase3-focus-game.html");
const gameAppPath = path.resolve("projects/sportswellness/workspace/performance/phase3-focus-game.app.js");
const phase4GameHtmlPath = path.resolve("projects/sportswellness/workspace/performance/phase4-mental-filter-simulator-game.html");
const phase4GameAppPath = path.resolve("projects/sportswellness/workspace/performance/phase4-mental-filter-simulator-game.app.js");
const sharedThemeCssPath = path.resolve("projects/sportswellness/workspace/performance/performance-game-theme.css");

test("sportswellness performance section exposes the Phase 1, Phase 2, Phase 3, and Phase 4 tool menu", async () => {
  const source = await readFile(mainPath, "utf8");

  const expectedSnippets = [
    "const PERFORMANCE_TOOLS = [",
    "id: 'phase1-performance-state-simulator-game'",
    "title: 'Phase 1 Performance State Simulator Game'",
    "viewerSrc: './performance/phase1-performance-state-simulator-game.html'",
    "id: 'phase2-discipline-game'",
    "title: 'Phase 2 Architecture of Discipline Game'",
    "viewerSrc: './performance/phase2-discipline-game.html'",
    "id: 'phase3-focus-game'",
    "title: 'Phase 3 Focus Game'",
    "viewerSrc: './performance/phase3-focus-game.html'",
    "id: 'phase4-mental-filter-simulator-game'",
    "title: 'Phase 4 Mental Filter Simulator Game'",
    "viewerSrc: './performance/phase4-mental-filter-simulator-game.html'",
    "activePerformanceToolId",
    "function openPerformanceTool(id)",
    "data-performance-tool-id",
    "performance-tool-button",
    "performance-tool-frame",
    "src=\"${activeTool?.viewerSrc || ''}\"",
    "renderPerformance()"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("sportswellness phase 1 performance state simulator files exist and carry the imported simulator identity", async () => {
  await access(phase1GameHtmlPath);
  await access(phase1GameAppPath);

  const [html, app] = await Promise.all([
    readFile(phase1GameHtmlPath, "utf8"),
    readFile(phase1GameAppPath, "utf8")
  ]);

  const expectedHtmlSnippets = [
    "Phase 1 Performance State Simulator Game",
    "phase1-performance-state-simulator-game.app.js",
    "@babel/standalone",
    "<div id=\"root\"></div>"
  ];

  const expectedAppSnippets = [
    "Inverted-U Balancer v2.0",
    "IDEAL PERFORMANCE STATE",
    "Begin Simulation",
    "Regulation Failure",
    "Simulation Terminated"
  ];

  for (const snippet of expectedHtmlSnippets) {
    assert.match(html, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const snippet of expectedAppSnippets) {
    assert.match(app, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("sportswellness phase 2 discipline game page files exist and carry the imported discipline-game identity", async () => {
  await access(disciplineGameHtmlPath);
  await access(disciplineGameAppPath);

  const [html, app] = await Promise.all([
    readFile(disciplineGameHtmlPath, "utf8"),
    readFile(disciplineGameAppPath, "utf8")
  ]);

  const expectedHtmlSnippets = [
    "Phase 2 Architecture of Discipline Game",
    "phase2-discipline-game.app.js",
    "@babel/standalone",
    "<div id=\"root\"></div>"
  ];

  const expectedAppSnippets = [
    "Commence Execution",
    "MAX_PROCESS_POINTS",
    "Failure Processing",
    "Integrated",
    "Discipline"
  ];

  for (const snippet of expectedHtmlSnippets) {
    assert.match(html, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const snippet of expectedAppSnippets) {
    assert.match(app, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("sportswellness phase 4 mental filter simulator files exist and carry the imported simulator identity", async () => {
  await access(phase4GameHtmlPath);
  await access(phase4GameAppPath);

  const [html, app] = await Promise.all([
    readFile(phase4GameHtmlPath, "utf8"),
    readFile(phase4GameAppPath, "utf8")
  ]);

  const expectedHtmlSnippets = [
    "Phase 4 Mental Filter Simulator Game",
    "phase4-mental-filter-simulator-game.app.js",
    "@babel/standalone",
    "<div id=\"root\"></div>"
  ];

  const expectedAppSnippets = [
    "Mental Filter System v1.0",
    "Identity Collapse",
    "Initialize Filter",
    "Robust Confidence",
    "Confidence Account",
    "WITHDRAWAL_DIRECT_CHANCE",
    "movementProfile",
    "transaction.movementProfile === 'erratic'"
  ];

  for (const snippet of expectedHtmlSnippets) {
    assert.match(html, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const snippet of expectedAppSnippets) {
    assert.match(app, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("sportswellness performance game page files exist and carry the imported focus-game identity", async () => {
  await access(gameHtmlPath);
  await access(gameAppPath);

  const [html, app] = await Promise.all([
    readFile(gameHtmlPath, "utf8"),
    readFile(gameAppPath, "utf8")
  ]);

  const expectedHtmlSnippets = [
    "Phase 3 Focus Game",
    "phase3-focus-game.app.js",
    "@babel/standalone",
    "<div id=\"root\"></div>"
  ];

  const expectedAppSnippets = [
    "Initialize Session",
    "Performance = Potential - Interference",
    "SELF_1_THOUGHTS",
    "startGame",
    "timeElapsed"
  ];

  for (const snippet of expectedHtmlSnippets) {
    assert.match(html, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const snippet of expectedAppSnippets) {
    assert.match(app, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("sportswellness performance games share the course palette contract", async () => {
  await access(sharedThemeCssPath);

  const [sharedThemeCss, phase1Html, phase2Html, phase3Html, phase4Html, phase3App] = await Promise.all([
    readFile(sharedThemeCssPath, "utf8"),
    readFile(phase1GameHtmlPath, "utf8"),
    readFile(disciplineGameHtmlPath, "utf8"),
    readFile(gameHtmlPath, "utf8"),
    readFile(phase4GameHtmlPath, "utf8"),
    readFile(gameAppPath, "utf8")
  ]);

  const expectedThemeSnippets = [
    "--performance-game-bg: #0b111a",
    "--performance-game-panel: #151b25",
    "--performance-game-primary: #00ffca",
    "--performance-game-line: #2a3748",
    ".performance-game-theme .bg-zinc-950",
    ".performance-game-theme .text-lime-400",
    ".performance-game-theme .bg-cyan-400"
  ];

  const expectedHtmlSnippets = [
    "performance-game-theme.css",
    "class=\"performance-game-theme\""
  ];

  for (const snippet of expectedThemeSnippets) {
    assert.match(sharedThemeCss, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const html of [phase1Html, phase2Html, phase3Html, phase4Html]) {
    for (const snippet of expectedHtmlSnippets) {
      assert.match(html, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  }

  assert.doesNotMatch(phase3App, /bg-\[#2d4c32\]/);
  assert.doesNotMatch(phase3App, /bg-\[#bd4f3e\]/);
});
