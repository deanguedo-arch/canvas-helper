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
const sharedScaleJsPath = path.resolve("projects/sportswellness/workspace/performance/performance-game-scale.js");

test("sportswellness performance section exposes the Phase 1, Phase 2, Phase 3, and Phase 4 tool menu", async () => {
  const source = await readFile(mainPath, "utf8");

  const expectedSnippets = [
    "const PERFORMANCE_TOOLS = [",
    "activePerformanceView: 'menu'",
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
    "function closePerformanceTool()",
    "state.activePerformanceView = 'menu';",
    "state.activePerformanceView = 'player';",
    "data-performance-tool-id",
    "refs.sectionTitle.textContent = isPlayerView ? '' : 'Performance';",
    "refs.sectionTitle.style.display = isPlayerView ? 'none' : '';",
    "if (refs.progressShell) refs.progressShell.style.display = isPlayerView ? 'none' : '';",
    "performance-launcher",
    "performance-launcher-grid",
    "performance-tool-button",
    "performance-player-shell",
    "performance-player-layout",
    "performance-player-sidebar",
    "performance-player-menu",
    "performance-player-stage",
    "performance-player-nav",
    "performance-player-frame",
    "Back to training menu",
    "data-performance-frame",
    "setPerformanceFrameSource(performanceFrame, activeTool?.viewerSrc || '')",
    "renderPerformance()"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.doesNotMatch(source, /performance-player-head/);
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
    "performance-game-scale.js",
    "@babel/standalone",
    "<div id=\"root\"></div>"
  ];

  const expectedAppSnippets = [
    "Inverted-U Balancer v2.0",
    "IDEAL PERFORMANCE STATE",
    "Begin Simulation",
    "Regulation Failure",
    "Simulation Terminated",
    "flex flex-col md:flex-row md:flex-1 md:min-h-[680px]",
    "relative w-full aspect-[4/3] max-h-[260px] md:aspect-square md:max-h-none",
    "flex-1 bg-zinc-950 relative overflow-hidden cursor-none min-h-[360px] h-[52vh] max-h-[480px] md:min-h-0 md:h-auto md:max-h-none",
    "const triggerBreathe = useCallback(() => {",
    "const triggerActivate = useCallback(() => {",
    "onPointerMove={handleArenaPointer}",
    "onPointerDown={handleArenaPointer}",
    "touchAction: 'none'",
    "onClick={triggerBreathe}",
    "onClick={triggerActivate}",
    "const { useArenaScale, scaleValue } = window.PerformanceGameScale;",
    "const { stageRef: arenaRef, scale: arenaScale } = useArenaScale(ARENA_SIZE",
    "const targetDiameter = scaleValue(32, arenaScale",
    "const reticleSize = scaleValue(48, arenaScale",
    "w-full min-h-screen md:min-h-[calc(100vh-32px)] bg-zinc-900 md:rounded-xl shadow-2xl overflow-hidden border border-zinc-800 flex flex-col relative",
    "min-h-screen bg-zinc-950 text-zinc-100 font-sans p-0 md:p-4 xl:p-6 selection:bg-lime-400 selection:text-black"
  ];

  for (const snippet of expectedHtmlSnippets) {
    assert.match(html, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const snippet of expectedAppSnippets) {
    assert.match(app, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.doesNotMatch(app, /max-w-5xl/);
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
    "performance-game-scale.js",
    "@babel/standalone",
    "<div id=\"root\"></div>"
  ];

  const expectedAppSnippets = [
    "Commence Execution",
    "MAX_PROCESS_POINTS",
    "Failure Processing",
    "Integrated",
    "Discipline",
    "const { useArenaScale, scaleValue } = window.PerformanceGameScale;",
    "const { stageRef: arenaRef, scale: arenaScale } = useArenaScale({ w: 960, h: 650 }",
    "const targetDisplaySize = scaleValue(target.size, arenaScale",
    "w-full min-h-screen md:min-h-[calc(100vh-32px)] bg-zinc-900 md:rounded-xl shadow-2xl overflow-hidden border border-zinc-800 flex flex-col relative",
    "min-h-screen bg-zinc-950 text-zinc-100 font-sans p-0 md:p-4 xl:p-6 selection:bg-lime-400 selection:text-black",
    "relative w-full bg-zinc-950 overflow-hidden select-none transition-all duration-300 flex-1 min-h-[420px] md:min-h-[680px]"
  ];

  for (const snippet of expectedHtmlSnippets) {
    assert.match(html, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const snippet of expectedAppSnippets) {
    assert.match(app, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.doesNotMatch(app, /max-w-5xl/);
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
    "performance-game-scale.js",
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
    "transaction.movementProfile === 'erratic'",
    "const { useArenaScale, scaleValue } = window.PerformanceGameScale;",
    "const { stageRef: arenaRef, scale: arenaScale } = useArenaScale(ARENA_SIZE",
    "const outerRingSize = scaleValue(800, arenaScale",
    "const transactionScale = Math.max(0.92, Math.min(1.45, arenaScale));",
    "w-full min-h-screen md:min-h-[calc(100vh-32px)] bg-zinc-900 md:rounded-xl shadow-2xl overflow-hidden border border-zinc-800 flex flex-col relative",
    "min-h-screen bg-zinc-950 text-zinc-100 font-sans p-0 md:p-4 xl:p-6 selection:bg-lime-400 selection:text-black",
    "relative w-full bg-zinc-950 overflow-hidden select-none flex-1 min-h-[420px] md:min-h-[700px]"
  ];

  for (const snippet of expectedHtmlSnippets) {
    assert.match(html, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const snippet of expectedAppSnippets) {
    assert.match(app, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.doesNotMatch(app, /max-w-5xl/);
  assert.doesNotMatch(app, /h-\[650px\]/);
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
    "performance-game-scale.js",
    "@babel/standalone",
    "<div id=\"root\"></div>"
  ];

  const expectedAppSnippets = [
    "Initialize Session",
    "Performance = Potential - Interference",
    "SELF_1_THOUGHTS",
    "startGame",
    "timeElapsed",
    "const { useArenaScale, scaleValue } = window.PerformanceGameScale;",
    "const { stageRef: arenaRef, scale: arenaScale } = useArenaScale({ w: 960, h: 600 }",
    "const ballSize = scaleValue(48, arenaScale",
    "const thoughtCardScale = Math.max(0.95, Math.min(1.5, arenaScale));",
    "w-full min-h-screen md:min-h-[calc(100vh-32px)] bg-zinc-900 md:rounded-2xl shadow-2xl overflow-hidden border-t-4",
    "min-h-screen bg-zinc-950 text-zinc-100 font-sans p-0 md:p-4 xl:p-6 selection:bg-lime-400 selection:text-black",
    "p-8 md:p-16 space-y-10 bg-zinc-900 min-h-[420px] md:min-h-[680px] flex flex-col justify-center",
    "relative w-full overflow-hidden select-none shadow-inner border-y-8 border-black flex-1 min-h-[420px] md:min-h-[700px]"
  ];

  for (const snippet of expectedHtmlSnippets) {
    assert.match(html, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  for (const snippet of expectedAppSnippets) {
    assert.match(app, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.doesNotMatch(app, /max-w-5xl/);
  assert.doesNotMatch(app, /h-\[600px\]/);
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

test("sportswellness performance games share a measured arena-scale helper", async () => {
  await access(sharedScaleJsPath);

  const sharedScaleJs = await readFile(sharedScaleJsPath, "utf8");

  const expectedSnippets = [
    "window.PerformanceGameScale = {",
    "function useArenaScale(baseSize, options = {})",
    "const rawScale = Math.min(width / baseSize.w, height / baseSize.h);",
    "function scaleValue(value, scale, options = {})"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(sharedScaleJs, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
