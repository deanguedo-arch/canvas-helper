import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const metaDir = dirname(fileURLToPath(import.meta.url));
const workspaceDir = resolve(metaDir, "../workspace");

const html = readFileSync(resolve(workspaceDir, "index.html"), "utf8");
const css = readFileSync(resolve(workspaceDir, "styles.css"), "utf8");
const js = readFileSync(resolve(workspaceDir, "main.js"), "utf8");

function courseBlock(id) {
  const match = js.match(new RegExp(`id: "${id}",[\\s\\S]*?version: "[^"]+"`));
  assert.ok(match, `expected ${id} to be present in the course list`);
  return match[0];
}

test("header uses the Next Step runner mark and site menu without admin controls", () => {
  assert.match(html, /<img class="runner-brand-image" src="\.\/assets\/brand\/green-lilguy-colour\.png"/);
  assert.match(html, /class="site-menu-toggle"/);
  assert.match(html, /aria-controls="siteMenu"/);
  assert.match(html, /class="site-menu-panel"/);
  assert.match(html, /class="showcase-title-lockup"/);
  assert.match(css, /\.runner-brand-image\b/);
  assert.match(css, /\.site-menu-toggle\b/);
  assert.match(css, /\.site-menu-panel\b/);

  assert.doesNotMatch(html, /top-actions|admin-button|icon-button|avatar-button|Admin/);
  assert.doesNotMatch(css, /\.top-actions|\.admin-button|\.icon-button|\.avatar-button|\.avatar-face|\.notification-dot/);
});

test("course rail renders flat round green buttons with titles underneath", () => {
  assert.match(js, /class="course-selector/);
  assert.match(js, /class="course-button/);
  assert.match(js, /class="course-title"/);
  assert.match(js, /\$\{course\.shortTitle\}/);
  assert.match(css, /\.course-button\b/);
  assert.match(css, /\.course-title\b/);
  assert.match(css, /\.course-selector\b[\s\S]*?padding:\s*0;/);
  assert.match(css, /\.course-selector\b[\s\S]*?background:\s*transparent;/);
  assert.match(css, /\.course-selector\.is-active \.course-button/);
  assert.match(css, /--course-button-bg/);
  assert.match(css, /border-radius:\s*50%/);

  assert.doesNotMatch(js, /class="course-orb/);
  assert.doesNotMatch(js, /course\.code/);
  assert.doesNotMatch(js, /class="course-button-mark/);
  assert.doesNotMatch(js, /<svg viewBox/);
  assert.doesNotMatch(js, /class="course-live/);
  assert.doesNotMatch(css, /\.course-button-mark|\.course-code|\.course-name|\.course-live/);
  assert.doesNotMatch(js, /<img src="\$\{course\.image\}"/);
  assert.doesNotMatch(css, /\.course-orb|\.orb-face/);
});

test("course selector keyboard focus stays on the round orb", () => {
  const buttonFocusBlocks = [...css.matchAll(/\.course-selector:focus-visible\s*{(?<body>[\s\S]*?)}/g)]
    .map((match) => match.groups.body);

  assert.ok(buttonFocusBlocks.length > 0, "expected a course selector focus reset block");
  for (const body of buttonFocusBlocks) {
    const outlineValues = [...body.matchAll(/outline:\s*([^;]+);/g)].map((match) => match[1].trim());
    assert.deepEqual(outlineValues, ["none"], "selector focus must clear the native outline without drawing a rectangle");
  }
  assert.match(css, /\.course-selector:focus-visible \.course-button\s*{[\s\S]*?animation:\s*none;/);
  assert.match(css, /\.course-selector\.is-active:focus-visible \.course-button\s*{[\s\S]*?animation:\s*none;/);
  assert.match(css, /\.course-selector:focus-visible \.course-button\s*{[\s\S]*?0 0 0 4px rgba\(11,\s*143,\s*51,\s*0\.22\)/);
  assert.match(css, /\.course-selector:focus \.course-button\s*{[\s\S]*?0 0 0 4px rgba\(11,\s*143,\s*51,\s*0\.22\)/);
  assert.match(css, /\.course-selector\.is-active:focus \.course-button\s*{[\s\S]*?animation:\s*none;/);
});

test("desktop preview renders at a fixed desktop viewport and scales into the frame", () => {
  assert.match(html, /id="desktopViewportShell"/);
  assert.match(html, /<iframe id="desktopFrame" class="desktop-viewport-frame"/);

  assert.match(css, /--desktop-preview-width:\s*1440px/);
  assert.match(css, /--desktop-preview-height:\s*900px/);
  assert.match(css, /\.desktop-viewport-shell\b[\s\S]*?overflow:\s*hidden;/);
  assert.match(css, /\.desktop-viewport-frame\b[\s\S]*?width:\s*var\(--desktop-preview-width\);/);
  assert.match(css, /\.desktop-viewport-frame\b[\s\S]*?height:\s*var\(--desktop-preview-height\);/);
  assert.match(css, /transform:\s*translate\(var\(--desktop-preview-offset-x\),\s*var\(--desktop-preview-offset-y\)\)\s*scale\(var\(--desktop-preview-scale\)\);/);
  assert.match(css, /transform-origin:\s*top left;/);

  assert.match(js, /DESKTOP_PREVIEW_WIDTH\s*=\s*1440/);
  assert.match(js, /DESKTOP_PREVIEW_HEIGHT\s*=\s*900/);
  assert.match(js, /function updateDesktopPreviewScale\(\)/);
  assert.match(js, /const rawScale = rect\.width \/ DESKTOP_PREVIEW_WIDTH;/);
  assert.doesNotMatch(js, /rect\.height \/ DESKTOP_PREVIEW_HEIGHT/);
  assert.match(js, /ResizeObserver/);
  assert.match(js, /--desktop-preview-scale/);
});

test("mobile title lockup scales within hamburger clearance", () => {
  assert.match(html, /class="showcase-title-lockup"[^>]*>\s*<img class="runner-brand-image"/);
  assert.match(css, /@media \(max-width: 900px\)\s*{[\s\S]*\.showcase-title-lockup\s*{[\s\S]*max-width:\s*calc\(100vw - 112px\)/);
  assert.match(css, /@media \(max-width: 900px\)\s*{[\s\S]*\.showcase-nextstep\s*{[\s\S]*font-size:\s*clamp\(38px,\s*10\.8vw,\s*60px\)/);
  assert.match(css, /@media \(max-width: 900px\)\s*{[\s\S]*\.showcase-kicker\s*{[\s\S]*font-size:\s*clamp\(13px,\s*3\.4vw,\s*21px\)/);
  assert.doesNotMatch(css, /@media \(max-width: 780px\)\s*{[\s\S]*\.showcase-title-lockup\s*{[\s\S]*translateX\(-10px\)/);
});

test("filters group CALM courses and Options courses without Humanities or Science", () => {
  const filters = [...html.matchAll(/<button class="filter-button(?: is-active)?" type="button" data-filter="([^"]+)">([^<]+)<\/button>/g)]
    .map((match) => ({ value: match[1], label: match[2] }));
  const expectedFilters = [
    { value: "all", label: "All" },
    { value: "calm", label: "CALM" },
    { value: "options", label: "Options" },
    { value: "wellness", label: "Wellness" },
    { value: "resources", label: "Resources" }
  ];

  assert.deepEqual(filters.slice(0, 5), expectedFilters);
  assert.deepEqual(filters.slice(5), expectedFilters);
  assert.match(html, /class="site-menu-filters"/);

  assert.doesNotMatch(html, /data-filter="humanities"|>Humanities</);
  assert.doesNotMatch(html, /data-filter="science"|>Science</);
  assert.doesNotMatch(html, /data-filter="career"|>Career</);

  const calmOne = courseBlock("calm-module-one");
  assert.match(calmOne, /title: "CALM Module 1"/);
  assert.match(calmOne, /url: "https:\/\/calm-module-one\.web\.app"/);

  for (const id of ["calm-module-one", "calm-module-two", "calm-module-three", "career-portfolio"]) {
    const block = courseBlock(id);
    assert.match(block, /category: "calm"/);
    assert.match(block, /area: "CALM"/);
  }

  for (const id of ["forensic-studies", "forensics-thirty-five", "general-psychology", "experimental-psychology", "world-religions"]) {
    const block = courseBlock(id);
    assert.match(block, /category: "options"/);
    assert.match(block, /area: "Options"/);
  }

  const wellnessBlock = courseBlock("sports-wellness");
  assert.match(wellnessBlock, /category: "wellness"/);
  assert.match(wellnessBlock, /area: "Wellness"/);
});
