import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { marked } from 'marked';
import { load } from 'cheerio';

// An evaluation derivative, not a new canonical course or a promotion command.
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const project = path.join(repo, 'projects/biology30-unit-a-pilot-3');
const sourceRoot = path.join(project, 'workspace');
const reviewRoot = path.join(project, 'meta/teaching-overhaul/2026-10-02-browser-authoring');
const target = path.join(reviewRoot, 'working-copy');
const namespace = 'biology30-ch11:teaching-evaluation:2026-10-02:v2';
const projection = `${namespace}:generated-practice-resume`;
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const normalize = text => text.replace(/\s+/g, ' ').trim();
function manuscriptText(html) {
  const fragment = load(html, {}, false);
  fragment('[data-evaluation-extra]').remove();
  fragment('br').replaceWith(' ');
  // Block layout supplies word separation even when serialized tags are adjacent.
  fragment('p,h1,h2,h3,h4,li,ul,ol,tr,th,td,summary,details,blockquote,pre,section,fieldset,div').each((_, node) => {
    fragment(node).prepend(' ').append(' ');
  });
  return normalize(fragment.text());
}
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const lessons = [
  { id: 'lesson-01', file: 'CH11_Lesson01_Nervous_Communication_v2.md', hash: 'e01af0992d99da796d13f3213ae4b62389dad1968c395dd56ac4eadd3ba56837' },
  { id: 'lesson-02', file: 'CH11_Lesson02_Neurons_Myelin_v2.md', hash: 'cb5825fd0cb7e38ab1d8ac673d91e55a8f407e56165fbe3982399406fc18b2b9' },
  { id: 'lesson-03', file: 'CH11_Lesson03_Pathways_Reflexes_v2.md', hash: 'bf81c2a2f5278f67694b149fcc276d582686fdafa638360606a09a6812427e50' },
];

async function inventory(root, prefix = '') {
  const files = [];
  for (const item of (await readdir(path.join(root, prefix), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = path.posix.join(prefix, item.name);
    if (item.isSymbolicLink()) throw Error(`Symlinks are not permitted in the evaluation copy: ${relative}`);
    if (item.isDirectory()) files.push(...await inventory(root, relative));
    else if (item.isFile()) {
      const bytes = await readFile(path.join(root, relative));
      files.push({ path: relative, bytes: bytes.length, sha256: sha(bytes) });
    }
  }
  return files;
}

function safeMarkdown(markdown) {
  const $ = load(marked.parse(markdown, { gfm: true }), {}, false);
  const allowed = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'strong', 'em', 'ul', 'ol', 'li', 'details',
    'summary', 'a', 'blockquote', 'hr', 'br', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td']);
  $('*').each((_, node) => {
    assert(allowed.has(node.name), `Unsupported manuscript HTML: ${node.name}`);
    for (const attr of Object.keys(node.attribs)) assert(
      (node.name === 'a' && ['href', 'title'].includes(attr)) || (node.name === 'ol' && attr === 'start')
      || (['th', 'td'].includes(node.name) && attr === 'align'), `Unsupported manuscript attribute: ${attr}`);
    if (node.name === 'a') {
      const href = node.attribs.href || '';
      assert(!/[\u0000-\u0020]/u.test(href), 'Control characters in manuscript link');
      assert(!/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href) || href.startsWith('https://'), 'Unsafe manuscript link');
    }
  });
  return $;
}

const sourceFiles = await inventory(sourceRoot);
const sourceHtml = await readFile(path.join(sourceRoot, 'index.html'), 'utf8');
const $ = load(sourceHtml);
const baselineRequired = $('[data-required-check]').toArray().map(node => $(node).attr('data-activity'));
const nativeVocabulary = $('#pilot3-words').text();
const wordData = JSON.parse(nativeVocabulary).data;
const terms = [...new Set(wordData.words.map(word => word.term.toLocaleLowerCase()))].sort((a, b) => b.length - a.length);
const records = [];
const refreshGenerated = process.argv.includes('--refresh-generated');
if (refreshGenerated) {
  const previous = JSON.parse(await readFile(path.join(reviewRoot, 'WORKING_COPY_MANIFEST.json'), 'utf8'));
  assert.equal(previous.role, 'derived working teacher-evaluation copy; not canonical or approved');
  for (const file of previous.files) assert.equal(sha(await readFile(path.join(target, file.path))), file.sha256,
    `Evaluation file was edited; preserve it and create a new candidate rather than overwrite: ${file.path}`);
}

function extra(html) {
  const fragment = load(html, {}, false);
  fragment.root().children().attr('data-evaluation-extra', '');
  return fragment.html();
}
function serialize(md, nodes) { return nodes.map(node => md.html(node)).join('\n'); }
function nodesBetween(nodes, start, stop) { return nodes.slice(start + 1, stop); }

function wireTerms(fragment, route) {
  // Use only the existing word owners. Do not author or infer new definitions.
  const seen = new Set();
  const textNodes = [];
  const walk = node => {
    if (node.type === 'text') textNodes.push(node);
    else if (!['a', 'button', 'summary', 'h1', 'h2', 'h3', 'h4', 'label', 'textarea', 'script', 'style'].includes(node.name))
      for (const child of node.children || []) walk(child);
  };
  for (const node of fragment.root().children().toArray()) walk(node);
  for (const node of textNodes) {
    let result = '', position = 0;
    const text = node.data, lower = text.toLocaleLowerCase();
    const word = character => Boolean(character && /[\p{L}\p{N}_]/u.test(character));
    for (let i = 0; i < text.length;) {
      const term = terms.find(term => !seen.has(term) && lower.startsWith(term, i) && !word(text[i - 1]) && !word(text[i + term.length]));
      if (term) {
        result += esc(text.slice(position, i)) + `<button type="button" class="bio-term" data-bio-term="${esc(term)}" data-bio-term-route="${route}" aria-haspopup="dialog">${esc(text.slice(i, i + term.length))}</button>`;
        seen.add(term); i += term.length; position = i;
      } else i++;
    }
    if (position) fragment(node).replaceWith(result + esc(text.slice(position)));
  }
}

for (const lesson of lessons) {
  const bytes = await readFile(path.join(reviewRoot, 'responses/v2', lesson.file));
  assert.equal(sha(bytes), lesson.hash, `Manuscript drift: ${lesson.file}`);
  const raw = bytes.toString('utf8');
  assert.equal(raw.split('## BEGIN LEARNER MANUSCRIPT').length, 2);
  assert.equal(raw.split('## END LEARNER MANUSCRIPT').length, 2);
  const markdown = raw.split('## BEGIN LEARNER MANUSCRIPT')[1].split('## END LEARNER MANUSCRIPT')[0].trim();
  const md = safeMarkdown(markdown);
  const nodes = md.root().children().toArray();
  const firstBody = nodes.findIndex(node => node.name === 'h2');
  assert(firstBody > 0);
  const front = nodes.slice(0, firstBody).filter(node => node.name !== 'hr');
  const goalAt = front.findIndex(node => node.name === 'h3' && md(node).text() === 'Learning goal');
  const beginAt = front.findIndex(node => node.name === 'h3' && md(node).text() === 'Before you begin');
  const guideAt = front.findIndex(node => node.name === 'details');
  const readingAt = front.findIndex(node => node.name === 'h3' && md(node).text() === 'Optional embedded reading');
  assert(goalAt > 0 && beginAt > goalAt && guideAt > beginAt && readingAt > guideAt);
  const oldLesson = $(`#${lesson.id}`);
  const oldHeader = oldLesson.find('header.page-header').first();
  const vocabulary = oldHeader.find('.lesson-vocabulary-help').first().clone();
  const bookPage = oldHeader.find('.textbook-band [data-book-page]').attr('data-book-page');
  const guide = load(md.html(front[guideAt]), {}, false);
  guide('details').first().addClass('page-guide');
  const guideSummary = guide('summary').first();
  const guideText = guideSummary.text();
  const splitAt = guideText.indexOf(' — ');
  assert(splitAt > 0);
  // Native Biology guide typography: bold title, regular-weight process subtitle.
  guideSummary.html(`<strong>${esc(guideText.slice(0, splitAt))}</strong>${esc(guideText.slice(splitAt))}`);
  const reading = front.slice(readingAt + 1);
  assert.equal(reading.length, 2);
  const readLink = load(md.html(reading[0]), {}, false);
  readLink('a').attr('data-book-page', bookPage).addClass('text-link');
  const bookLabel = load(md.html(reading[0]), {}, false);
  bookLabel('a,br').remove();
  const header = load(`<header class="page-header">
${serialize(md, front.slice(0, goalAt))}
<div class="goal-strip"><div><p class="section-label">${md(front[goalAt]).text()}</p>${serialize(md, nodesBetween(front, goalAt, beginAt))}</div>
<div><p class="section-label">${md(front[beginAt]).text()}</p>${serialize(md, nodesBetween(front, beginAt, guideAt))}</div></div>
${guide.html()}
<div class="textbook-band"><div><p class="section-label">${md(front[readingAt]).text()}</p>${bookLabel.html()}</div>\n${readLink('a').prop('outerHTML')}</div>
${md.html(reading[1])}
</header>`, {}, false);
  header('header>p').first().addClass('eyebrow');
  header('header>h1+p').addClass('lesson-question');
  header('header>p').last().addClass('lesson-term-strip');
  wireTerms(header, lesson.id);
  header('header').append(extra($.html(vocabulary)));
  const groups = [];
  for (const node of nodes.slice(firstBody)) {
    if (node.name === 'hr') continue;
    if (node.name === 'h2') groups.push({ heading: md(node).text(), nodes: [] });
    assert(groups.length);
    groups.at(-1).nodes.push(node);
  }
  const content = [header.html()];
  for (const group of groups) {
    const checkAt = group.nodes.findIndex(node => node.name === 'h3' && md(node).text().startsWith('Open chapter check:'));
    if (checkAt >= 0) {
      content.push(`<section class="content-section" data-manuscript-fragment>${serialize(md, group.nodes.slice(0, checkAt))}</section>`);
      const activity = oldLesson.find('[data-required-check]').first().clone();
      assert(activity.length === 1);
      const instructions = group.nodes.slice(checkAt + 1).filter(node => node.name === 'p' && !md(node).find('strong').first().text().startsWith('Required prompt'));
      const promptNodes = group.nodes.slice(checkAt + 1).filter(node => node.name === 'p' && md(node).find('strong').first().text().startsWith('Required prompt'));
      const questions = activity.find('[data-question]').toArray();
      assert.equal(promptNodes.length, questions.length);
      const promptMap = [];
      activity.children('h2').attr('data-evaluation-extra', '');
      activity.children('p').first().replaceWith(serialize(md, instructions));
      activity.find('.save-row, [data-submit-run], [data-redo], [data-run-status]').attr('data-evaluation-extra', '');
      questions.forEach((question, i) => {
        const label = md(promptNodes[i]).find('strong').first().text();
        const prompt = load(md.html(promptNodes[i]), {}, false);
        prompt('strong').first().remove(); prompt('br').remove();
        const nativePrompt = $(question).children('p').first();
        assert.equal(normalize(prompt.text()), normalize(nativePrompt.text()), 'Native question prompt changed');
        $(question).before(`<p><strong>${esc(label)}</strong></p>`);
        $(question).children().not(nativePrompt).attr('data-evaluation-extra', '');
        promptMap.push({ id: $(question).attr('data-question'), writing: $(question).find('[data-writing]').attr('data-writing'), limit: $(question).find('[data-writing]').attr('data-answer-limit') });
      });
      content.push(`<details class="activity-disclosure" data-manuscript-fragment><summary>${esc(md(group.nodes[checkAt]).text())}</summary>${$.html(activity)}</details>`);
      lesson.required = promptMap;
      continue;
    }
    const section = load(`<section class="content-section" data-manuscript-fragment>${serialize(md, group.nodes)}</section>`, {}, false);
    wireTerms(section, lesson.id);
    if (lesson.id === 'lesson-02' && group.heading === 'Follow information through one neuron')
      section('h2').first().after(extra($.html(oldLesson.find('figure').eq(0))));
    if (lesson.id === 'lesson-02' && group.heading === 'Compare conduction in the myelin figure')
      section('h2').first().after(extra($.html(oldLesson.find('figure').eq(1))));
    if (lesson.id === 'lesson-03' && group.heading === 'Read the withdrawal diagram in the correct order')
      section('h2').first().after(extra($.html(oldLesson.find('figure').first())));
    // Keep the authored watch-for explanation and native inline video behaviour.
    section('a[href^="https://www.youtube.com/watch?v="]').each((i, link) => {
      const id = new URL(section(link).attr('href')).searchParams.get('v');
      assert(/^[\w-]{11}$/.test(id));
      section(link).parent().after(extra(`<section class="video-companion" data-video="${id}"><div class="media-learning-stage"><div class="video-stage" data-video-slot><p>Choose Load video when you are ready to watch.</p></div><button type="button" data-load-video>Load video</button></div></section>`));
    });
    section('table').wrap('<div class="comparison-table" tabindex="0" role="region" aria-label="Lesson comparison table"></div>');
    content.push(section.html());
  }
  const integrated = load(`<div class="p2-topic">${content.join('\n')}</div>`, {}, false);
  const actualText = manuscriptText(integrated.html()), expectedText = manuscriptText(md.html());
  const mismatch = [...expectedText].findIndex((character, index) => character !== actualText[index]);
  assert(actualText === expectedText, `Complete manuscript fidelity failed: ${lesson.id}; expected ${expectedText.slice(Math.max(0, mismatch - 50), mismatch + 90)}; got ${actualText.slice(Math.max(0, mismatch - 50), mismatch + 90)}`);
  oldLesson.empty().append(integrated.html()).attr('data-teaching-evaluation', 'v2');
  $(`.nav-link[href="#${lesson.id}"]`).attr('title', 'Revised draft for evaluation; not teacher approved');
  records.push({ id: lesson.id, manuscript: `responses/v2/${lesson.file}`, manuscriptSha256: lesson.hash,
    completeLearnerTextPreserved: true, required: lesson.required,
    reusedFigures: oldLesson.find('figure').map((_, node) => $(node).find('img').attr('src')).get(),
    vocabularyButtons: oldLesson.find('.bio-term').length });
}

assert.deepEqual($('[data-required-check]').toArray().map(node => $(node).attr('data-activity')), baselineRequired);
assert.equal($('#pilot3-words').text(), nativeVocabulary);
const ids = $('[id]').toArray().map(node => node.attribs.id);
assert.equal(ids.length, new Set(ids).size, 'Duplicate DOM IDs');
$('title').text('Biology 30 - Chapter 11 | Teaching evaluation copy');
$('.sidebar-heading-copy').append('<p class="sidebar-code">Teaching evaluation · lessons 1–3</p>');
$('#overview .p2-topic').prepend(`<section class="content-section evaluation-notice"><h2>Evaluate the revised lessons</h2><p>This is a separate working copy. Only lessons 1–3 contain the new teaching manuscripts. Other pages are unchanged context. Test writing and completion save only in this evaluation copy, not in your existing course.</p><p><a href="#lesson-01">1. Nervous communication</a> · <a href="#lesson-02">2. Neurons &amp; myelin</a> · <a href="#lesson-03">3. Pathways &amp; reflexes</a></p><p>Teacher approval, further chapter calibration and release are still pending.</p></section>`);
for (const lesson of lessons) $(`#${lesson.id} .page-header`).prepend('<p class="evaluation-notice">Working evaluation copy · revised draft · separate test saves</p>');
$('head').append('<link rel="stylesheet" href="teaching-evaluation.css">');

const runtimePath = path.join(repo, 'scripts/lib/biology30-pilot3/runtime.ts');
const nativeRuntime = await readFile(runtimePath, 'utf8');
assert(nativeRuntime.includes("const scorm=(window as any).__canvasHelperScorm;"));
assert(nativeRuntime.includes("const NS=lms?scorm.scopeKey('biology30-unit-a-pilot-3:v1'):'biology30-unit-a-pilot-3:v1';"));
const reviewRuntime = nativeRuntime
  .replace('const scorm=(window as any).__canvasHelperScorm;', 'const scorm:any=undefined; // Evaluation copy must never connect to an LMS.')
  .replace("const NS=lms?scorm.scopeKey('biology30-unit-a-pilot-3:v1'):'biology30-unit-a-pilot-3:v1';", `const NS=${JSON.stringify(namespace)};`)
  .replace("const PROJECTION_KEY='biology30-unit-a-pilot-3:generated-practice-resume:v1';", `const PROJECTION_KEY=${JSON.stringify(projection)};`);
const bundle = await build({ stdin: { contents: reviewRuntime, resolveDir: path.dirname(runtimePath), sourcefile: 'teaching-evaluation-runtime.ts', loader: 'ts' },
  bundle: true, platform: 'browser', format: 'iife', target: 'es2022', write: false, metafile: true,
  plugins: [{ name: 'evaluation-photo-isolation', setup(build) {
    build.onLoad({ filter: /biology30-chapters\/(textbook-practice|brightspace-photo-store)\.js$/ }, async args => {
      let contents = await readFile(args.path, 'utf8');
      if (args.path.endsWith('/textbook-practice.js')) {
        assert(contents.includes('biology30-chapter-${chapter}:textbook-photos:v1'));
        contents = contents.replace('biology30-chapter-${chapter}:textbook-photos:v1', `${namespace}:chapter-\${chapter}:textbook-photos`);
      }
      contents = contents.replaceAll('global.__canvasHelperScorm', 'undefined');
      return { contents, loader: 'js' };
    });
  } }] });
const bundled = bundle.outputFiles[0].text;
assert(!bundled.includes('biology30-unit-a-pilot-3:v1'));
assert(!bundled.includes('biology30-unit-a-pilot-3:generated-practice-resume:v1'));
assert(!bundled.includes('biology30-chapter-${chapter}:textbook-photos:v1'));

// An explicit refresh is allowed only when every existing derivative is untouched.
if (!refreshGenerated) {
  await mkdir(target);
  await cp(sourceRoot, target, { recursive: true, filter: source => !['index.html', 'pilot3-runtime.js', 'scorm-tracking.json'].includes(path.basename(source)) });
}
await writeFile(path.join(target, 'index.html'), $.html());
await writeFile(path.join(target, 'assets/pilot3-runtime.js'), bundled);
await writeFile(path.join(target, 'teaching-evaluation.css'), `.evaluation-notice{font-size:14px!important;line-height:1.5!important;color:#154212!important;background:#eef3ee;border-left:4px solid #146c60;padding:12px 16px;margin:0 0 24px!important}
.content-section details{margin:22px 0;border-block:1px solid #d9ded8;padding:0 18px}.content-section summary{padding:14px 0;color:#154212;font-weight:760;cursor:pointer}.content-section details[open]>summary{margin-bottom:14px}
.content-section .comparison-table table{min-width:540px}.content-section .comparison-table td,.content-section .comparison-table th{padding:12px;border:1px solid #d9ded8;text-align:left;vertical-align:top}
.content-section .comparison-table th{background:#eef3ee}.content-section .video-companion{display:block}
@media print{.evaluation-notice{display:none}}
`);
const copiedFiles = await inventory(target);
const dependencies = [];
for (const file of Object.keys(bundle.metafile.inputs)) {
  if (file.endsWith('teaching-evaluation-runtime.ts')) continue;
  const absolute = path.resolve(repo, file);
  if (await stat(absolute).catch(() => null)) dependencies.push({ path: path.relative(repo, absolute), sha256: sha(await readFile(absolute)) });
}
assert.deepEqual(await inventory(sourceRoot), sourceFiles, 'Canonical workspace changed during preview assembly');
const manifest = { schemaVersion: 1, role: 'derived working teacher-evaluation copy; not canonical or approved',
  entry: 'working-copy/index.html#lesson-01', sourceWorkspace: path.relative(repo, sourceRoot),
  sourceRuntime: path.relative(repo, runtimePath), nativeRuntimeSha256: sha(nativeRuntime),
  sourceWorkspaceFiles: sourceFiles, files: copiedFiles, dependencyBindings: dependencies, lessons: records,
  nativeCssUnchanged: true, nativeRequiredProgressUnchanged: true, localSaveNamespace: namespace,
  generatedPracticeProjection: projection, lmsConnection: 'disabled in this copy only',
  teacherAccepted: false, productionIntegrated: false, released: false,
  route: 'deterministic snapshot and compile; Sol lead content mapping, trust boundary and save isolation; no worker',
  rebuild: 'Initial output is exclusive. --refresh-generated first verifies every candidate file against its manifest and refuses teacher edits; choose a new candidate if a file has changed.',
};
await writeFile(path.join(reviewRoot, 'WORKING_COPY_MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ entry: path.join(target, 'index.html'), revisedLessons: records.length, nativeRequiredChecks: baselineRequired.length, copiedFiles: copiedFiles.length, namespace, canonicalCourseChanged: false }));
