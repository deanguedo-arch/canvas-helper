import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const workspaceDir = path.resolve("projects", "forensicstudiesoption2", "workspace");
const indexPath = path.join(workspaceDir, "index.html");
const stylesPath = path.join(workspaceDir, "styles.css");
const moduleStylesPath = path.join(workspaceDir, "content", "module-index.css");
const assignmentsDir = path.join(workspaceDir, "assignments");
const assignmentThemePath = path.join(assignmentsDir, "forensic-assignment-theme.css");
const assignmentPrintHelperPath = path.join(assignmentsDir, "forensic-assignment-print.js");
const moduleOneAssignmentPath = path.join(assignmentsDir, "module1assignment-app.jsx");
const moduleOneBundlePath = path.join(assignmentsDir, "module1assignment.bundle.js");
const moduleTwoAssetDir = path.join(assignmentsDir, "module2");
const moduleTwoAssignmentPath = path.join(assignmentsDir, "module2assignment-app.jsx");
const moduleTwoBundlePath = path.join(assignmentsDir, "module2assignment.bundle.js");
const moduleSevenAssignmentPath = path.join(assignmentsDir, "module7assignment-app.jsx");
const moduleSevenBundlePath = path.join(assignmentsDir, "module7assignment.bundle.js");

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

test("forensic studies option2 assignment runtimes share the forensic theme layer", async () => {
  const [themeSource, printHelperSource, assignmentEntries] = await Promise.all([
    readFile(assignmentThemePath, "utf8"),
    readFile(assignmentPrintHelperPath, "utf8"),
    readdir(assignmentsDir)
  ]);

  const htmlEntries = assignmentEntries.filter((entry) => /^module\dassignment\.html$/i.test(entry));
  assert.ok(htmlEntries.length >= 8, "expected module assignment entrypoints");

  await Promise.all(
    htmlEntries.map(async (entry) => {
      const source = await readFile(path.join(assignmentsDir, entry), "utf8");
      assert.match(source, /forensic-assignment-theme\.css\?rev=/i, `expected ${entry} to load shared assignment theme`);
      assert.match(source, /forensic-assignment-print\.js\?rev=/i, `expected ${entry} to load shared assignment print helper`);
      assert.match(source, /class="[^"]*forensic-assignment-theme/i, `expected ${entry} to opt into assignment theme scope`);
    })
  );

  assert.match(themeSource, /--assignment-bg:\s*#0c1324/i);
  assert.match(themeSource, /--assignment-surface:\s*#191f31/i);
  assert.match(themeSource, /--assignment-surface-strong:\s*#23293c/i);
  assert.match(themeSource, /--assignment-primary:\s*#8aebff/i);
  assert.match(themeSource, /--assignment-primary-strong:\s*#22d3ee/i);
  assert.match(themeSource, /font-family:\s*"Inter"/i);
  assert.match(themeSource, /font-family:\s*"Space Grotesk"/i);
  assert.match(printHelperSource, /window\.print\s*=\s*function forensicAssignmentPrintOverride/i);
  assert.match(printHelperSource, /textarea/i);
  assert.match(printHelperSource, /scrollHeight/i);
  assert.match(printHelperSource, /afterprint/i);
  assert.match(themeSource, /@media print/i);
  assert.match(themeSource, /textarea\s*\{/i);
  assert.match(themeSource, /overflow:\s*visible\s*!important/i);
});

test("forensic studies option2 preserves light fingerprint surfaces in module 2", async () => {
  const [themeSource, moduleTwoSource, moduleTwoBundle] = await Promise.all([
    readFile(assignmentThemePath, "utf8"),
    readFile(moduleTwoAssignmentPath, "utf8"),
    readFile(moduleTwoBundlePath, "utf8")
  ]);

  assert.match(moduleTwoSource, /assignment-fingerprint-surface/);
  assert.match(moduleTwoSource, /assignment-fingerprint-thumbnail/);
  assert.match(moduleTwoBundle, /assignment-fingerprint-surface/);
  assert.match(moduleTwoBundle, /assignment-fingerprint-thumbnail/);
  assert.match(themeSource, /\.assignment-fingerprint-surface/);
  assert.match(themeSource, /\.assignment-fingerprint-thumbnail/);
  assert.match(themeSource, /background:\s*linear-gradient\(180deg,\s*#edf2f7,\s*#cbd5e1\)\s*!important/i);
});

test("forensic studies option2 restores module 1 crime certification board icons", async () => {
  const [moduleOneSource, moduleOneBundle] = await Promise.all([
    readFile(moduleOneAssignmentPath, "utf8"),
    readFile(moduleOneBundlePath, "utf8")
  ]);

  assert.doesNotMatch(moduleOneSource, /const IconStub = \(\) => null;/);
  assert.match(moduleOneSource, /from 'lucide-react'/);
  assert.match(moduleOneSource, /\bShield\b/);
  assert.match(moduleOneSource, /\bCamera\b/);
  assert.match(moduleOneSource, /\bUsers\b/);
  assert.match(moduleOneSource, /\bSearch\b/);
  assert.match(moduleOneSource, /\bMap(?:2)?\b/);
  assert.match(moduleOneSource, /\bPackage\b/);
  assert.doesNotMatch(moduleOneBundle, /var Shield = IconStub;/);
  assert.doesNotMatch(moduleOneBundle, /var Camera = IconStub;/);
  assert.doesNotMatch(moduleOneBundle, /var Users = IconStub;/);
  assert.doesNotMatch(moduleOneBundle, /var Search = IconStub;/);
  assert.doesNotMatch(moduleOneBundle, /var Map2 = IconStub;/);
  assert.doesNotMatch(moduleOneBundle, /var Package = IconStub;/);
});

test("forensic studies option2 preserves the original yellow step-note modal styling in module 1", async () => {
  const [themeSource, moduleOneSource] = await Promise.all([
    readFile(assignmentThemePath, "utf8"),
    readFile(moduleOneAssignmentPath, "utf8")
  ]);

  assert.match(moduleOneSource, /assignment-step-note/);
  assert.match(moduleOneSource, /assignment-step-note-callout/);
  assert.match(moduleOneSource, /assignment-step-note-textarea/);
  assert.match(moduleOneSource, /assignment-step-note-close/);
  assert.match(moduleOneSource, /assignment-step-note-submit/);
  assert.match(themeSource, /\.assignment-step-note\s*\{/);
  assert.match(themeSource, /\.assignment-step-note-callout\s*\{/);
  assert.match(themeSource, /\.assignment-step-note-textarea\s*\{/);
  assert.match(themeSource, /\.assignment-step-note-close\s*\{/);
  assert.match(themeSource, /\.assignment-step-note-submit\s*\{/);
  assert.match(themeSource, /background:\s*#fef3c7\s*!important/i);
  assert.match(themeSource, /color:\s*#1f2937\s*!important/i);
  assert.match(themeSource, /background:\s*transparent\s*!important/i);
  assert.ok(
    themeSource.lastIndexOf(".assignment-step-note") > themeSource.lastIndexOf('[class*="bg-yellow-"]'),
    "expected note modal overrides after the generic yellow/background theme rules"
  );
});

test("forensic studies option2 uses local retained fingerprint assets for module 2", async () => {
  const [moduleTwoSource, moduleTwoBundle] = await Promise.all([
    readFile(moduleTwoAssignmentPath, "utf8"),
    readFile(moduleTwoBundlePath, "utf8")
  ]);

  const localFingerprintAssets = [
    path.join(moduleTwoAssetDir, "Whorl.png"),
    path.join(moduleTwoAssetDir, "Loop.png"),
    path.join(moduleTwoAssetDir, "PlainArch.png")
  ];

  for (const assetPath of localFingerprintAssets) {
    await access(assetPath);
  }

  assert.match(moduleTwoSource, /const MODULE2_ASSET_ROOT = '\.\/module2';/);
  assert.match(moduleTwoSource, /Whorl\.png/);
  assert.match(moduleTwoSource, /Loop\.png/);
  assert.match(moduleTwoSource, /PlainArch\.png/);
  assert.match(moduleTwoBundle, /MODULE2_ASSET_ROOT = "\.\/module2"/);
  assert.match(moduleTwoBundle, /Whorl\.png/);
  assert.match(moduleTwoBundle, /Loop\.png/);
  assert.match(moduleTwoBundle, /PlainArch\.png/);
  assert.doesNotMatch(moduleTwoSource, /upload\.wikimedia\.org/);
  assert.doesNotMatch(moduleTwoBundle, /upload\.wikimedia\.org/);
});

test("forensic studies option2 keeps module 7 crime-scene hitboxes invisible", async () => {
  const [themeSource, moduleSevenSource, moduleSevenBundle] = await Promise.all([
    readFile(assignmentThemePath, "utf8"),
    readFile(moduleSevenAssignmentPath, "utf8"),
    readFile(moduleSevenBundlePath, "utf8")
  ]);

  assert.match(moduleSevenSource, /assignment-scene-hitbox/);
  assert.match(moduleSevenBundle, /assignment-scene-hitbox/);
  assert.match(themeSource, /button:not\(\.assignment-scene-hitbox\)/);
  assert.match(themeSource, /\.assignment-scene-hitbox\s*\{/);
  assert.match(themeSource, /background:\s*transparent\s*!important/i);
  assert.match(themeSource, /border:\s*0\s*!important/i);
});

test("forensic studies option2 gives the module 7 handgun a lit contrast state", async () => {
  const [moduleSevenSource, moduleSevenBundle] = await Promise.all([
    readFile(moduleSevenAssignmentPath, "utf8"),
    readFile(moduleSevenBundlePath, "utf8")
  ]);

  assert.match(moduleSevenSource, /const gunVisible = isNear\(evidence\.gun\.x, evidence\.gun\.y\) \|\| discovered\.gun \|\| cabinLight;/);
  assert.match(moduleSevenSource, /fill=\{gunVisible \? "#cbd5e1" : "#1f2937"\}/);
  assert.match(moduleSevenSource, /stroke=\{gunVisible \? "#94a3b8" : "#020617"\}/);
  assert.match(moduleSevenBundle, /const gunVisible = isNear\(evidence\.gun\.x, evidence\.gun\.y\) \|\| discovered\.gun \|\| cabinLight;/);
  assert.match(moduleSevenBundle, /fill: gunVisible \? "#cbd5e1" : "#1f2937"/);
  assert.match(moduleSevenBundle, /stroke: gunVisible \? "#94a3b8" : "#020617"/);
});
