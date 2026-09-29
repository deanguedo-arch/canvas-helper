const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const expected = { a: 32, b: 35, c: 29, d: 50 };
const allIds = new Set();

for (const [unit, expectedCount] of Object.entries(expected)) {
  const project = path.join(root, `projects/science24-unit-${unit}`);
  const workspace = path.join(project, 'workspace');
  const manifestPath = path.join(project, 'meta/textbook-question-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const html = fs.readFileSync(path.join(workspace, 'index.html'), 'utf8');
  const main = fs.readFileSync(path.join(workspace, 'main.js'), 'utf8');
  const overlay = fs.readFileSync(path.join(workspace, 'textbook-practice-data.js'), 'utf8');

  assert.equal(manifest.schemaVersion, 1, `Unit ${unit} manifest schema`);
  assert.equal(manifest.questions.length, expectedCount, `Unit ${unit} question count`);
  assert.match(overlay, /D\.legacyBookQuestions=Array\.isArray\(D\.bookQuestions\)\?D\.bookQuestions\.slice\(\):\[\]/);
  assert.match(main, /\.\.\.\(D\.legacyBookQuestions\|\|\[\]\)/, `Unit ${unit} must include legacy textbook work in All My Work`);
  assert.match(main, /Previous page-based Textbook Practice work/, `Unit ${unit} must label legacy textbook work`);

  const courseDataIndex = html.indexOf('src="course-data.js"');
  const overlayIndex = html.indexOf('src="textbook-practice-data.js"');
  const mainIndex = html.indexOf('src="main.js"');
  assert.ok(courseDataIndex >= 0 && courseDataIndex < overlayIndex && overlayIndex < mainIndex, `Unit ${unit} overlay load order`);
  assert.ok(html.indexOf('href="textbook-practice.css"') > html.indexOf(`href="unit-${unit}.css`), `Unit ${unit} question-level CSS load order`);

  for (const question of manifest.questions) {
    assert.ok(!allIds.has(question.id), `Duplicate question id ${question.id}`);
    allIds.add(question.id);
    assert.doesNotMatch(question.id, /-question-page$/, `Current question ${question.id} must not reuse a page-level id`);
    assert.match(question.legacyPageId, /-question-page$/, `Question ${question.id} must point to its frozen page record`);
    assert.ok(question.questionNumber, `Question ${question.id} needs a printed number`);
    assert.ok(question.group, `Question ${question.id} needs a source group`);
    assert.equal(question.cropBoxPixels.length, 4, `Question ${question.id} needs a four-value crop box`);
    const cropPath = path.join(workspace, question.image);
    const fullPagePath = path.join(workspace, question.fullPageImage);
    assert.ok(fs.statSync(cropPath).isFile(), `Missing crop ${question.image}`);
    assert.ok(fs.statSync(fullPagePath).isFile(), `Missing full-page source ${question.fullPageImage}`);
  }
}

const dWorkspace = path.join(root, 'projects/science24-unit-d/workspace');
const dHtml = fs.readFileSync(path.join(dWorkspace, 'index.html'), 'utf8');
const graphSection = dHtml.slice(dHtml.indexOf('class="science-figure source-figure motion-graph-source"'), dHtml.indexOf('</figure>', dHtml.indexOf('class="science-figure source-figure motion-graph-source"')) + 9);
assert.equal((graphSection.match(/<img\b/g) || []).length, 1, 'Unit D motion comparison must use one image element');
assert.match(graphSection, /<source media="\(max-width: 600px\)" srcset="assets\/figure-motion-graphs-mobile\.jpg">/);
assert.doesNotMatch(dHtml, /content-section video-support"/, 'Unit D lesson video wrappers must not reuse the inner card class');
assert.ok(fs.statSync(path.join(dWorkspace, 'assets/figure-motion-graphs-mobile.jpg')).isFile());

console.log('PASS: Science 24 A-D use 146 stable question-level textbook records with source crops, frozen page-level history, valid load order, and repaired Unit D media markup');
