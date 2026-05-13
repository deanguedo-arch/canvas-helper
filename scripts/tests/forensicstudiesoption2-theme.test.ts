import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const workspaceDir = path.resolve("projects", "forensicstudiesoption2", "workspace");
const indexPath = path.join(workspaceDir, "index.html");
const mainPath = path.join(workspaceDir, "main.js");
const pdfViewerPath = path.join(workspaceDir, "pdf-viewer.html");
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

test("forensic studies option2 shell loads the next-step theme fonts", async () => {
  const indexSource = await readFile(indexPath, "utf8");

  assert.match(indexSource, /Rubik/);
  assert.match(indexSource, /Open\+Sans/);
  assert.match(indexSource, /Next Step/);
  assert.match(indexSource, /Student User/);
  assert.doesNotMatch(indexSource, /Space\+Grotesk|Noto\+Serif/);
});

test("forensic studies option2 shell css uses the next-step palette", async () => {
  const stylesSource = await readFile(stylesPath, "utf8");

  assert.match(stylesSource, /--bg:\s*#f3f4f3/i);
  assert.match(stylesSource, /--surface:\s*#ffffff/i);
  assert.match(stylesSource, /--primary:\s*#59a844/i);
  assert.match(stylesSource, /--primary-strong:\s*#4b8d39/i);
  assert.match(stylesSource, /--line:\s*#d9dad9/i);
  assert.match(stylesSource, /\.nextstep-topbar/);
  const topbarBlock = stylesSource.match(/\.nextstep-topbar\s*\{(?<body>[\s\S]*?)\n\}/)?.groups?.body ?? "";
  assert.doesNotMatch(topbarBlock, /position:\s*sticky/i);
  assert.match(stylesSource, /font-family:\s*"Open Sans"/i);
  assert.match(stylesSource, /font-family:\s*"Rubik"/i);
  assert.doesNotMatch(stylesSource, /#0c1324|#191f31|#22d3ee|#8aebff|Space Grotesk|Noto Serif|font-family:\s*"Inter"|family=Inter|backdrop-filter:\s*blur/i);
});

test("forensic studies option2 sidebar mirrors the forensics35 navigation treatment", async () => {
  const [stylesSource, mainSource] = await Promise.all([
    readFile(stylesPath, "utf8"),
    readFile(mainPath, "utf8")
  ]);

  assert.match(stylesSource, /\.sidebar\s*\{[\s\S]*background:\s*#3c3f3e/i);
  assert.match(stylesSource, /\.nav-item,\s*\n\.home-tab\s*\{[\s\S]*color:\s*#e7e7e5/i);
  assert.match(stylesSource, /\.nav-item\.active,\s*\n\.home-tab\.active\s*\{[\s\S]*background:\s*var\(--primary\)/i);
  assert.match(stylesSource, /\.nav-item\.active i,\s*\n\.home-tab\.active i\s*\{[\s\S]*color:\s*#ffffff/i);
  assert.match(mainSource, /const hasActiveHomeTab = state\.section === "home" && \["chapters", "quizzes", "assignments"\]\.includes\(state\.tab\);/);
  assert.match(mainSource, /refs\.navHome\?\.classList\.toggle\("active", state\.section === "home" && !hasActiveHomeTab\);/);
});

test("forensic studies option2 keeps the desktop preview out of the compact mobile shell", async () => {
  const stylesSource = await readFile(stylesPath, "utf8");

  assert.match(stylesSource, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*?\.app-shell,\s*\n\s*body\.sidebar-collapsed \.app-shell/i);
  assert.match(stylesSource, /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*?\.nextstep-topbar/i);
  assert.doesNotMatch(stylesSource, /@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?\.app-shell,\s*\n\s*body\.sidebar-collapsed \.app-shell/i);
});

test("forensic studies option2 generated chapter pages share the next-step theme system", async () => {
  const moduleStylesSource = await readFile(moduleStylesPath, "utf8");

  assert.match(moduleStylesSource, /--page-bg:\s*#f3f4f3/i);
  assert.match(moduleStylesSource, /--paper:\s*#ffffff/i);
  assert.match(moduleStylesSource, /--primary:\s*#59a844/i);
  assert.match(moduleStylesSource, /--text:\s*#1a1c1a/i);
  assert.match(moduleStylesSource, /font-family:\s*"Open Sans"/i);
  assert.match(moduleStylesSource, /font-family:\s*"Rubik"/i);
  assert.doesNotMatch(moduleStylesSource, /#0c1324|#191f31|#22d3ee|#8aebff|Space Grotesk|font-family:\s*"Inter"|family=Inter|backdrop-filter:\s*blur/i);
});

test("forensic studies option2 pdf viewer follows the next-step shell palette", async () => {
  const pdfViewerSource = await readFile(pdfViewerPath, "utf8");

  assert.match(pdfViewerSource, /Rubik/);
  assert.match(pdfViewerSource, /Open\+Sans/);
  assert.match(pdfViewerSource, /--background:\s*#f3f4f3/i);
  assert.match(pdfViewerSource, /--primary:\s*#59a844/i);
  assert.doesNotMatch(pdfViewerSource, /#0c1324|#191f31|#22d3ee|#8aebff|Space Grotesk|font-family:\s*"Inter"|family=Inter|backdrop-filter:\s*blur/i);
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

  assert.match(themeSource, /--assignment-bg:\s*#f3f4f3/i);
  assert.match(themeSource, /--assignment-surface:\s*#ffffff/i);
  assert.match(themeSource, /--assignment-primary:\s*#59a844/i);
  assert.match(themeSource, /--assignment-primary-strong:\s*#4b8d39/i);
  assert.match(themeSource, /font-family:\s*"Open Sans"/i);
  assert.match(themeSource, /font-family:\s*"Rubik"/i);
  assert.doesNotMatch(themeSource, /#0c1324|#191f31|#22d3ee|#8aebff|Space Grotesk|font-family:\s*"Inter"|family=Inter|backdrop-filter:\s*blur/i);
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
