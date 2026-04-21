import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const workspaceDir = path.resolve("projects", "forensicstudiesoption2", "workspace");
const indexPath = path.join(workspaceDir, "index.html");
const stylesPath = path.join(workspaceDir, "styles.css");
const moduleStylesPath = path.join(workspaceDir, "content", "module-index.css");

test("forensic studies option2 shell loads the forensic theme fonts", async () => {
  const indexSource = await readFile(indexPath, "utf8");

  assert.match(indexSource, /Space\+Grotesk/);
  assert.match(indexSource, /Inter/);
  assert.match(indexSource, /Noto\+Serif/);
});

test("forensic studies option2 shell css uses the dark forensic palette", async () => {
  const stylesSource = await readFile(stylesPath, "utf8");

  assert.match(stylesSource, /--bg:\s*#0c1324/i);
  assert.match(stylesSource, /--surface:\s*#191f31/i);
  assert.match(stylesSource, /--surface-strong:\s*#23293c/i);
  assert.match(stylesSource, /--primary:\s*#8aebff/i);
  assert.match(stylesSource, /--primary-strong:\s*#22d3ee/i);
  assert.match(stylesSource, /--text:\s*#dce1fb/i);
  assert.match(stylesSource, /font-family:\s*"Inter"/i);
  assert.match(stylesSource, /font-family:\s*"Space Grotesk"/i);
  assert.match(stylesSource, /backdrop-filter:\s*blur/i);
});

test("forensic studies option2 generated chapter pages share the new theme system", async () => {
  const moduleStylesSource = await readFile(moduleStylesPath, "utf8");

  assert.match(moduleStylesSource, /--page-bg:\s*#0c1324/i);
  assert.match(moduleStylesSource, /--paper:\s*#191f31/i);
  assert.match(moduleStylesSource, /--paper-strong:\s*#23293c/i);
  assert.match(moduleStylesSource, /--primary:\s*#8aebff/i);
  assert.match(moduleStylesSource, /--text:\s*#dce1fb/i);
  assert.match(moduleStylesSource, /font-family:\s*"Inter"/i);
  assert.match(moduleStylesSource, /font-family:\s*"Space Grotesk"/i);
});
