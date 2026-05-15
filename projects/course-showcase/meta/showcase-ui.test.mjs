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

test("header uses the Next Step logo without admin controls", () => {
  assert.match(html, /class="brand brand-logo"/);
  assert.match(html, /<img class="brand-image" src="\.\/assets\/brand\/next-step-logo-transparent\.png"/);
  assert.match(css, /\.brand-logo\b/);
  assert.match(css, /\.brand-image\b/);

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
