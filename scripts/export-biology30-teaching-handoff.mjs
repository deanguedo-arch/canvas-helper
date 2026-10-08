/** Stage 1 only: exact current sources and developer-only authoring handoff. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {load} from 'cheerio';
import {parse} from 'acorn';
import {transformSync} from 'esbuild';
import JSZip from 'jszip';

const sha = data => createHash('sha256').update(data).digest('hex');
const json = data => JSON.stringify(data, null, 2) + '\n';
const normalize = text => text.replace(/\s+/gu, ' ').trim();
const own = (value, key) => Object.hasOwn(value, key);
const slugFor = n => n === 11 ? 'biology30-unit-a-pilot-3' : `biology30-chapter-${n}`;

// Restricted static interpretation of literal bank data and its two authored
// array maps. No eval/vm/window or arbitrary source function execution.
export function literalValue(node, env = {}) {
  switch (node.type) {
    case 'Literal': return node.value;
    case 'Identifier': if (own(env, node.name)) return env[node.name]; break;
    case 'ArrayExpression': return node.elements.map(n => literalValue(n, env));
    case 'ObjectExpression': return Object.fromEntries(node.properties.map(p => {
      if (p.type !== 'Property' || p.computed || p.kind !== 'init') throw Error('Nonliteral property');
      return [p.key.name ?? p.key.value, literalValue(p.value, env)];
    }));
    case 'TemplateLiteral': return node.quasis.map((q, i) => q.value.cooked + (i < node.expressions.length ? String(literalValue(node.expressions[i], env)) : '')).join('');
    case 'MemberExpression': {
      const object = literalValue(node.object, env), key = node.computed ? literalValue(node.property, env) : node.property.name;
      if (own(object, key)) return object[key];
      break;
    }
    case 'BinaryExpression': {
      const left = literalValue(node.left, env), right = literalValue(node.right, env);
      if (node.operator === '+') return left + right;
      if (node.operator === '-' && typeof left === 'number' && typeof right === 'number') return left - right;
      break;
    }
    case 'CallExpression': {
      const callee = node.callee, fn = node.arguments[0];
      if (callee.type !== 'MemberExpression' || callee.computed || callee.property.name !== 'map' || node.arguments.length !== 1 || fn.type !== 'ArrowFunctionExpression' || fn.params.length !== 1 || fn.params[0].type !== 'ArrayPattern') break;
      return literalValue(callee.object, env).map(row => {
        const scoped = {...env};
        fn.params[0].elements.forEach((p, i) => {if (p?.type !== 'Identifier') throw Error('Nonliteral map binding'); scoped[p.name] = row[i];});
        return literalValue(fn.body, scoped);
      });
    }
  }
  throw Error(`Unsupported static bank expression: ${node.type}`);
}

export function readLiteralBank(text, expectedName) {
  const ast = parse(text, {ecmaVersion: 'latest', locations: true});
  if (ast.body.length !== 1) throw Error('Bank must have exactly one literal assignment');
  const assignment = ast.body[0].expression;
  if (assignment?.type !== 'AssignmentExpression' || assignment.operator !== '=' || assignment.left.object?.name !== 'window' || assignment.left.property?.name !== expectedName) throw Error('Unexpected bank assignment');
  return literalValue(assignment.right);
}

// Preserve paragraph/list/table order, links, alt text and native disclosure
// content. Exact original HTML and source locators accompany every extract.
export function readableMarkdown($, element) {
  function render(node, depth = 0) {
    if (node.type === 'text') return node.data.replace(/[ \t\r\n]+/g, ' ');
    if (!node.children) return '';
    const tag = node.tagName;
    if (['script', 'style'].includes(tag)) return '';
    const body = () => node.children.map(n => render(n, depth + 1)).join('');
    if (/^h[1-6]$/.test(tag)) return `\n\n${'#'.repeat(Number(tag[1]))} ${normalize(body())}\n\n`;
    if (tag === 'br') return '\n';
    if (tag === 'img') return `\n\n![${node.attribs.alt ?? ''}](${node.attribs.src ?? ''})\n\n`;
    if (tag === 'a') return `[${normalize(body())}](${node.attribs.href ?? ''})`;
    if (tag === 'strong' || tag === 'b') return `**${normalize(body())}**`;
    if (tag === 'em' || tag === 'i') return `*${normalize(body())}*`;
    if (tag === 'input') return node.attribs.value ? ` [option value: ${node.attribs.value}] ` : ' [response input] ';
    if (tag === 'textarea') return '\n\n[Written-response area; no learner data exported]\n\n';
    if (tag === 'option') return `${normalize(body())}; `;
    if (tag === 'li') {
      const siblings = node.parent.children.filter(n => n.tagName === 'li'), ordered = node.parent.tagName === 'ol';
      return `\n${ordered ? siblings.indexOf(node) + 1 + '.' : '-'} ${body().trim()}\n`;
    }
    if (tag === 'tr') return '\n' + node.children.filter(n => ['th', 'td'].includes(n.tagName)).map(n => normalize(render(n))).join(' | ') + '\n';
    if (tag === 'summary') return `\n\n**Disclosure: ${normalize(body())}**\n\n`;
    if (tag === 'iframe') return `\n\n[Embedded media: ${node.attribs.title ?? ''}](${node.attribs.src ?? ''})\n\n`;
    if (['p', 'div', 'section', 'header', 'figure', 'figcaption', 'fieldset', 'details', 'ul', 'ol', 'button'].includes(tag)) return '\n\n' + body().trim() + '\n\n';
    return body();
  }
  return render(element).replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

async function walk(root, prefix = '') {
  const entries = await fs.readdir(root, {withFileTypes: true}), out = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(root, entry.name), relative = path.posix.join(prefix, entry.name);
    if (entry.isSymbolicLink()) throw Error(`Unexpected symlink inside file inventory: ${full}`);
    if (entry.isDirectory()) out.push(...await walk(full, relative));
    else if (entry.isFile()) out.push(relative);
  }
  return out;
}

const slideMappings = {
  'lesson-01': [4, 5, 6, 7, 8, 14, 15, 16, 17], 'lesson-02': [7, 8, 9, 10, 11, 12, 13],
  'lesson-03': [14, 15, 16, 17, 18, 19, 20], 'lesson-04': [21, 22, 23],
  'lesson-05': [21, 24, 25, 26, 27, 28, 29, 30], 'lesson-06': [31, 32, 33, 34, 35, 36, 37, 38, 39],
  'lesson-07': [40, 41, 42], 'lesson-08': [43, 44, 45, 46, 47, 48],
  'lesson-09': [50, 51, 52, 53], 'lesson-10': [54, 55, 56, 57, 58, 59, 60, 61],
  'lesson-11': [], 'lesson-12': [66], 'lesson-13': [49, 62, 63, 64, 65],
};

export async function exportHandoff({repo, output, python, prompts}) {
  const relativeOutput = path.relative(repo, output);
  if (!relativeOutput.startsWith('..') && !path.isAbsolute(relativeOutput) && !relativeOutput.startsWith('projects/biology30-unit-a-pilot-3/meta/teaching-overhaul/')) throw Error('Repository output must be inside the dedicated teaching-overhaul metadata boundary.');
  if (await fs.stat(output).catch(() => null)) throw Error(`Refusing to overwrite an existing handoff: ${output}`);
  const chapters = [], preservePaths = new Set();
  const preserveRoots = new Set();
  const gaps = [];
  const addGuard = async relative => {
    preserveRoots.add(relative);
    const full = path.join(repo, relative), stat = await fs.stat(full).catch(() => null);
    if (!stat) {gaps.push({kind: 'missing-declared-owner', path: relative}); return;}
    if (stat.isDirectory()) for (const f of await walk(full)) preservePaths.add(path.posix.join(relative, f));
    else preservePaths.add(relative);
  };
  for (let chapter = 11; chapter <= 20; chapter++) {
    const slug = slugFor(chapter), base = `projects/${slug}`, entry = `${base}/workspace/index.html`;
    const html = await fs.readFile(path.join(repo, entry), 'utf8'), $ = load(html, {sourceCodeLocationInfo: true});
    const metadata = JSON.parse(await fs.readFile(path.join(repo, base, 'meta/project.json'), 'utf8'));
    const courseData = $('#course-data').length ? JSON.parse($('#course-data').text()) : null;
    const sourceOwners = chapter === 14 ? {
      teaching: `${base}/meta/external-generation/scripts/content.py`,
      assembly: `${base}/meta/external-generation/scripts/build_chapter.py`,
      labeling: `${base}/meta/external-generation/authoring/label-diagrams.json`,
      warning: 'index.html is the current assembled entry, not the only teaching owner. label-diagrams.json is an owner absent from canonicalSources.'
    } : chapter >= 15 ? {
      teaching: entry, interactions: `${base}/meta/external-generation/authoring/course-config.json`,
      assembly: `${base}/meta/external-generation/scripts/build.py`,
      warning: 'Historical lesson-content.json is NOT the current teaching owner; build.py retains current index.html teaching.'
    } : chapter === 11 ? {
      teaching: entry, runtime: 'scripts/lib/biology30-pilot3/runtime.ts',
      warning: 'Never regenerate this HTML with retired initializer, intake or Pilot 2 builders.'
    } : {
      teaching: entry, runtime: `${base}/workspace/main.js`,
      warning: 'Preserve inline non-executable data blocks and native runtime; portable HTML is derived.'
    };
    await addGuard(`${base}/workspace`);
    await addGuard(`${base}/meta/project.json`);
    for (const owner of metadata.canonicalSources ?? []) await addGuard(owner);
    for (const owner of Object.values(sourceOwners).filter(v => v.startsWith('projects/') || v.startsWith('scripts/'))) await addGuard(owner);
    if (chapter >= 14) {
      await addGuard(`${base}/meta/external-generation/authoring`);
      await addGuard(`${base}/meta/external-generation/scripts`);
    }
    const rawFragment = element => {
      const loc = element.sourceCodeLocation;
      if (!loc) throw Error(`Missing source offsets: ${entry}/${element.attribs.id}`);
      return html.slice(loc.startOffset, loc.endOffset);
    };
    const locator = element => ({path: entry, selector: element.attribs.id ? `#${element.attribs.id}` : null,
      startLine: element.sourceCodeLocation?.startLine, endLine: element.sourceCodeLocation?.endLine,
      startOffset: element.sourceCodeLocation?.startOffset, endOffset: element.sourceCodeLocation?.endOffset,
      offsetUnit: 'JavaScript UTF-16 code units', fragmentSha256: sha(rawFragment(element))});
    const bindings = section => $(section).find('[data-activity],[data-check-id],[data-revision-component],[data-question],[data-writing],[data-answer],[data-required-check]').toArray().map(e => ({
      tag: e.tagName, attrs: e.attribs, startLine: e.sourceCodeLocation?.startLine,
      questionText: e.attribs['data-question'] ? normalize($(e).text()) : undefined,
    }));
    const media = section => $(section).find('img,iframe,video,audio,source,[data-video-id],[data-video],a[href*="youtu"]').toArray().map(e => ({
      kind: e.tagName, attrs: Object.fromEntries(Object.entries(e.attribs).map(([key, value]) => [key, value.startsWith('data:') ? {embedded: true, sha256: sha(value), characters: value.length} : value])),
      caption: normalize($(e).closest('figure').find('figcaption').text()), locator: {path: entry, startLine: e.sourceCodeLocation?.startLine},
      status: 'existing source asset; no new visual/science acceptance or video playback asserted',
    }));
    const lessons = $('section[id]').toArray().filter(e => /^lesson-\d+$/.test(e.attribs.id)).map(e => ({
      id: e.attribs.id, title: normalize($(e).find('h1').first().text()), locator: locator(e),
      requiredCheckIds: $(e).find('[data-required-check]').toArray().map(n => n.attribs['data-activity'] ?? n.attribs['data-check-id']),
      activityIds: $(e).find('[data-activity],[data-check-id]').toArray().map(n => n.attribs['data-activity'] ?? n.attribs['data-check-id']),
      optional: !$(e).find('[data-required-check]').length,
      readingText: normalize($(e).find('.textbook-band').text()),
      textbookLinks: $(e).find('[data-book-page]').toArray().map(n => ({pdfPage: Number(n.attribs['data-book-page']), text: normalize($(n).text()), line: n.sourceCodeLocation?.startLine})),
      media: media(e), preservationBindings: bindings(e),
    }));
    const nav = $('nav.course-nav > details, nav.course-nav > .nav-group').toArray().map(e => ({
      group: normalize($(e).find('summary').first().text()), links: $(e).find('a[href]').toArray().map(n => ({route: n.attribs.href, label: normalize($(n).text())})),
    }));
    const status = {sourceInventory: 'discovered/current snapshot bound', authoring: 'not-started',
      contentReview: 'not-started', integration: 'not-started', technicalTesting: 'not-started', teacherAcceptance: 'not-requested'};
    const resourceDirectory = `${base}/meta/external-generation/authoring`;
    const provenanceFiles = chapter >= 14 ? ['source-inventory.json', 'lesson-source-map.json', 'source-assessment-catalogue.json', 'source-discrepancies.md', 'optional-source-responses.json'] : ['source-map.json', 'chapter11-intake.json', 'practice-handoff-integration.json', 'labeling-package-review.json'];
    const evidence = [];
    for (const f of provenanceFiles) {
      const relative = chapter >= 14 ? `${resourceDirectory}/${f}` : `${base}/meta/${f}`;
      const data = await fs.readFile(path.join(repo, relative)).catch(() => null);
      if (data) evidence.push({path: relative, sha256: sha(data), bytes: data.length, relation: 'historical/context; not acceptance of the planned teaching overhaul'});
    }
    for (const f of ['labeling-replacement-integration.json', 'labeling-pack-integration.json']) {
      const relative = `${base}/meta/${f}`;
      const data = await fs.readFile(path.join(repo, relative)).catch(() => null);
      if (data) evidence.push({path: relative, sha256: sha(data), bytes: data.length, relation: 'existing labeling integration/signoff context; preserve assets and keys, not new teaching acceptance'});
    }
    const pdf = `${base}/workspace/assets/textbook/chapter-${chapter}.pdf`, pdfBytes = await fs.readFile(path.join(repo, pdf));
    if (!pdfBytes.subarray(0, 8).toString().includes('%PDF')) throw Error(`Missing real PDF bytes: ${pdf}`);
    const wordData = chapter === 11 ? JSON.parse($('#pilot3-words').text()).data : courseData;
    const labelContract = chapter === 11 ? {
      owner: entry, catalogOwner: `${base}/workspace/assets/pilot3-catalog.js`,
      bindings: $('#labeling-practice').find('[data-activity],[data-question],[data-answer]').toArray().map(e => e.attribs),
    } : {owner: sourceOwners.labeling ?? (chapter >= 15 ? sourceOwners.interactions : `${entry}#course-data`),
      diagrams: courseData.labelDiagrams.map(d => ({id: d.id, lesson: d.lesson, src: d.src, answers: d.answers, options: d.options}))};
    chapters.push({chapter, slug, title: metadata.title ?? normalize($('.sidebar-title').first().text()),
      canonicalEntry: metadata.canonicalEntry, declaredCanonicalSources: metadata.canonicalSources, actualOwners: sourceOwners,
      generatedOutputs: metadata.generatedOutputs ?? [], regenerateCommand: metadata.regenerateCommand ?? null,
      originalAuthoringStatus: metadata.authoringStatus, authoringDriver: metadata.authoring?.driverId,
      sourceOfTruthNotes: metadata.sourceOfTruthNotes, lessons, sidebar: nav,
      legacyRoutes: chapter === 11 ? [{id: 'lesson-check', title: normalize($('#lesson-check h1').text()), purpose: 'hidden earlier foundation check for legacy saved work; excluded from new required progress'}] : [],
      requiredCheckIds: $('[data-required-check]').toArray().map(e => e.attribs['data-activity'] ?? e.attribs['data-check-id']),
      resources: {textbook: {path: pdf, sha256: sha(pdfBytes), bytes: pdfBytes.length}, historicalProvenance: evidence,
        videos: courseData?.videos ?? $('[data-video-id],[data-video],a[href*="youtu"]').toArray().map(e => ({attrs: e.attribs, text: normalize($(e).find('h2,h3').first().text() || $(e).text()).slice(0, 600), line: e.sourceCodeLocation?.startLine})),
        mediaCount: $('img,iframe,video,audio').length},
      preservation: {namespace: chapter === 11 ? 'biology30-unit-a-pilot-3:v1' : `biology30-chapter-${chapter}:html:v1`,
        storageOwner: chapter === 11 ? 'scripts/lib/biology30-pilot3/runtime.ts' : `${base}/workspace/main.js`,
        storage: chapter === 11 ? 'IndexedDB work/state, existing revision CAS and local Frayers/projection; LMS-scoped when connected' : 'native localStorage state, existing SCORM scope/flush/conflict/failure protections',
        labelContract, wordIds: (wordData.words ?? []).map(w => w.id),
        questionIds: $('[data-question]').toArray().map(e => e.attribs['data-question']),
        editKeysSha256: sha(json($('[data-canvas-helper-edit-key]').toArray().map(e => e.attribs['data-canvas-helper-edit-key']))),
        inlineData: $('script[type="application/json"]').toArray().map(e => ({id: e.attribs.id, sha256: sha($(e).text())})),
        absenceToPreserve: {globalSaveExitButtons: $('[data-save-exit]').length, newPhotoUploadInputs: $('input[type=file]').length},
        rules: ['Keep old attempts immutable; preserve IDs, option identities/order in saved attempts, namespaces and schema versions.',
          'Only existing required check IDs control completion. Optional practice/textbook work remains outside that denominator.',
          'Do not infer photo attachment cross-device support from text SCORM saving.',
          'Keep clickable bold vocabulary connected to existing word-owned Frayers and reader routes.',
          'Preserve design, fonts, spacing, collapse defaults and established navigation; no new UI/runtime.']},
      stageStatus: status,
      _html: html, _$: $, _rawFragment: rawFragment,
    });
  }
  await addGuard('scripts/lib/biology30-vocabulary');
  const snapshot = async () => {
    preservePaths.clear();
    for (const root of preserveRoots) await addGuard(root);
    const rows = [];
    for (const p of [...preservePaths].sort()) {const bytes = await fs.readFile(path.join(repo, p)); rows.push({path: p, bytes: bytes.length, sha256: sha(bytes)});}
    return {files: rows, treeSha256: sha(rows.map(r => `${r.path}\0${r.sha256}\n`).join(''))};
  };
  const before = await snapshot();
  for (const chapter of chapters) {
    const row = before.files.find(f => f.path === chapter.canonicalEntry);
    if (!row || row.sha256 !== sha(chapter._html)) throw Error(`Course changed while inventory was read: ${chapter.canonicalEntry}`);
  }
  const branch = execFileSync('git', ['branch', '--show-current'], {cwd: repo, encoding: 'utf8'}).trim();
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], {cwd: repo, encoding: 'utf8'}).trim();
  const scopedStatus = execFileSync('git', ['status', '--porcelain', '--', ...[...new Set(chapters.map(c => `projects/${c.slug}`))], 'scripts/lib/biology30-pilot3', 'scripts/lib/biology30-chapters', 'scripts/lib/biology30-vocabulary'], {cwd: repo, encoding: 'utf8'}).trim();
  await fs.mkdir(output, {recursive: true});
  const put = async (name, bytes) => {const destination = path.join(output, name); await fs.mkdir(path.dirname(destination), {recursive: true}); await fs.writeFile(destination, bytes);};
  const putJson = (name, value) => put(name, json(value));
  const copy = async (source, destination) => put(destination, await fs.readFile(path.join(repo, source)));
  const binding = {schemaVersion: 1, generatedAt: new Date().toISOString(), branch, revision,
    sourceTreeSha256: before.treeSha256, treeAlgorithm: 'sorted repo path + NUL + SHA256 + newline; see preservation/source-before.json',
    scopedGitStatusBefore: scopedStatus, note: 'HEAD is an anchor, not a clean-tree assertion. Current file bytes/hashes are authoritative; no browser/learner data exported.'};
  await putJson('REVISION_BINDING.json', binding);
  await putJson('preservation/source-before.json', before);
  await copy('scripts/export-biology30-teaching-handoff.mjs', 'reproduction/export-biology30-teaching-handoff.mjs');
  await copy('scripts/lib/biology30-teaching-handoff/extract_sources.py', 'reproduction/extract_sources.py');
  const publicChapters = chapters.map(({_html, _$, _rawFragment, ...c}) => c);
  await putJson('inventory/chapters-11-20.json', publicChapters);
  for (const c of chapters) {
    await copy(`projects/${c.slug}/meta/project.json`, `inventory/project-metadata/chapter-${c.chapter}.json`);
    for (const e of c.resources.historicalProvenance) await copy(e.path, `inventory/historical-context/chapter-${c.chapter}/${path.basename(e.path)}`);
  }
  const totalRequired = chapters.reduce((sum, c) => sum + c.requiredCheckIds.length, 0);
  if (totalRequired !== 120 || chapters[0].requiredCheckIds.length !== 12) throw Error('Unexpected required inventory: inspect the current source before proceeding.');
  await put('inventory/CHAPTER_INDEX.md', '# Current Biology 30 chapters 11–20\n\n' +
    `Revision ${revision}; ${totalRequired} required check IDs. IDs come from current HTML, not historical topic lists.\n\n` + chapters.map(c =>
      `## Chapter ${c.chapter}\n\nEntry: \`${c.canonicalEntry}\`\n\nStatus retained: ${c.originalAuthoringStatus}; driver ${c.authoringDriver}.\n\n` +
      c.lessons.map(l => `- \`${l.id}\` — ${l.title}${l.optional ? ' (optional extension)' : ''}`).join('\n') + '\n\n' +
      `Owner caution: ${c.actualOwners.warning}\n`).join('\n'));

  const ch11 = chapters[0], $ = ch11._$, base = `projects/${ch11.slug}`;
  // Developer-only runnable source reference, not an export/release candidate.
  for (const f of await walk(path.join(repo, base, 'workspace'))) {
    if (f === 'assets/textbook/chapter-12.pdf' || f === 'assets/textbook/chapter-13.pdf') continue;
    await copy(`${base}/workspace/${f}`, `current-course/workspace/${f}`);
  }
  const runtimeFiles = new Set(ch11.declaredCanonicalSources.filter(f => f.startsWith('scripts/')));
  for (const f of await walk(path.join(repo, 'scripts/lib/biology30-vocabulary'))) runtimeFiles.add(`scripts/lib/biology30-vocabulary/${f}`);
  for (const f of runtimeFiles) await copy(f, `current-course/owners/${f}`);
  const catalog = readLiteralBank(await fs.readFile(path.join(repo, base, 'workspace/assets/pilot3-catalog.js'), 'utf8'), 'PILOT3_CATALOG');
  const bank = readLiteralBank(await fs.readFile(path.join(repo, base, 'workspace/assets/pilot3-practice-bank.js'), 'utf8'), 'PILOT3_PRACTICE_BANK');
  const words = JSON.parse($('#pilot3-words').text()), textbook = JSON.parse($('#textbook-practice-data').text());
  await putJson('current-course/data/catalog-and-original-keys.json', catalog);
  await putJson('current-course/data/authored-practice-concepts-and-keys.json', bank);
  await putJson('current-course/data/vocabulary-and-schema.json', words);
  await putJson('current-course/data/textbook-practice-manifest.json', textbook);
  const engineText = await fs.readFile(path.join(repo, 'scripts/lib/biology30-pilot3/practice-engine.ts'), 'utf8');
  const engineCode = transformSync(engineText, {loader: 'ts', format: 'esm', target: 'es2022'}).code;
  const engine = await import('data:text/javascript;base64,' + Buffer.from(engineCode).toString('base64'));
  const bankErrors = engine.validatePracticeBank(bank);
  if (bankErrors.length) throw Error(bankErrors.join('\n'));
  const itemInventory = [];
  for (const concept of bank.concepts) {
    const definitions = [
      ['flashcards', ['card-term', 'card-definition', 'card-scenario', 'card-error']],
      ['blanks', ['blank-definition', 'blank-scenario', 'blank-sequence']],
      ['multiple-choice', concept.mcVariants.map(v => 'mc-' + v.id)],
      ['mixed-practice', ['mixed-typed', 'mixed-single', 'mixed-application', 'mixed-multiple', 'mixed-tf', 'mixed-order', ...concept.mcVariants.slice(0, 2).map(v => 'mc-' + v.id), ...(concept.id === 'neuron-parts' ? ['mixed-diagram'] : [])]],
    ];
    for (const [kind, ids] of definitions) for (const id of ids) {
      const item = engine.restoreGeneratedItem(bank, kind, `${concept.id}:${id}`);
      itemInventory.push({kind, ...item, optionOrderStatus: 'deterministic reference example only; learner session options depend on seed/peers and must be preserved from each saved session'});
    }
  }
  await putJson('current-course/data/all-generated-question-families-with-keys.json', itemInventory);
  const staticQuestions = $('[data-question]').toArray().map(e => ({
    id: e.attribs['data-question'], activityId: $(e).closest('[data-activity]').attr('data-activity'),
    lessonId: $(e).closest('section[id^="lesson-"]').attr('id') ?? null,
    attrs: e.attribs, originalHtml: ch11._rawFragment(e), completeText: normalize($(e).text()),
    locator: {path: ch11.canonicalEntry, line: e.sourceCodeLocation.startLine, endLine: e.sourceCodeLocation.endLine},
    answerFields: $(e).find('[data-answer],[data-writing],select option').toArray().map(n => ({tag: n.tagName, attrs: n.attribs, text: normalize($(n).text())})),
    authoredKey: catalog.questions.find(q => q.id === e.attribs['data-question']) ?? null,
  }));
  await putJson('current-course/data/all-static-questions-and-bindings.json', staticQuestions);
  await putJson('current-course/data/feedback-policy.json', {
    staticFeedback: {owner: 'scripts/lib/biology30-pilot3/runtime.ts', functions: ['render', 'complete', 'firstScore'],
      correct: 'Correct', incorrect: 'Not correct yet', writing: 'Written response saved; not automatically graded.',
      note: 'Existing static feedback is generic status rather than a complete scientific explanation. Paired correct response unlocks writing; writing is not auto-graded.'},
    generatedFeedback: {owner: 'scripts/lib/biology30-pilot3/practice-engine.ts', authoredConcepts: 'authored-practice-concepts-and-keys.json',
      allInstantiatedItemFamilies: 'all-generated-question-families-with-keys.json',
      policy: 'First incorrect attempt gives the authored cue; second reveals answer/explanation. Flashcards are self-assessment. Definitions are true teaching text; misconception fields are explicitly false statements.'},
    sourceAssessment: 'sources/teacher-only/chapter11-source-quiz-qti.xml; preserve original XML keys/feedback, never publish source assessments as generated practice',
    allExactRuntimeSources: 'current-course/owners/scripts/'
  });
  await copy(`${base}/meta/textbook-practice-manifest.json`, 'current-course/data/textbook-crop-provenance.json');
  for (const name of ['prompt-pack.md', 'source-map.json', 'chapter11-intake.json', 'teacher-voice-integration.json', 'labeling-pack-integration.json', 'integrated-content-review.json', 'multiple-choice-calibration.json', 'review-handoff.md']) {
    if (await fs.stat(path.join(repo, base, 'meta', name)).catch(() => null)) await copy(`${base}/meta/${name}`, `inventory/historical-context/chapter-11/${name}`);
  }

  const sourceSummary = JSON.parse(execFileSync(python, [path.join(repo, 'scripts/lib/biology30-teaching-handoff/extract_sources.py'), '--repo', repo, '--output', output, '--prompts', prompts], {cwd: repo, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024}));
  const slideIndex = JSON.parse(await fs.readFile(path.join(output, 'sources/extracted/chapter11-teacher-deck/slide-index.json'), 'utf8'));
  const lessonRecords = [];
  for (const lesson of ch11.lessons) {
    const element = $(`#${lesson.id}`)[0];
    const raw = ch11._rawFragment(element), md = readableMarkdown($, element);
    const folder = `chapter11-lessons/${lesson.id}`;
    await put(`${folder}/current-exact.html`, raw);
    await put(`${folder}/current-complete.md`, `# Current source extract — ${lesson.id}\n\nThis is unchanged existing learner copy, not a new manuscript or approval. Exact HTML is in current-exact.html.\n\n${md}`);
    const lessonSources = {lessonId: lesson.id, title: lesson.title, locator: lesson.locator,
      currentHtml: `${folder}/current-exact.html`, completeReadableCopy: `${folder}/current-complete.md`,
      chapterTextbook: 'sources/original/chapter-11.pdf', printedPageOffset: 359,
      textbookLinks: lesson.textbookLinks.map(l => ({...l, printedPage: l.pdfPage + 359, textExtract: `sources/extracted/chapter11-textbook/pdf-page-${String(l.pdfPage).padStart(3, '0')}.txt`})),
      teacherSlides: (slideMappings[lesson.id] ?? []).map(number => ({slide: number, textPath: slideIndex[number - 1].textPath, media: slideIndex[number - 1].relationships.filter(r => r.packageMediaPath)})),
      mappingStatus: 'Lead topic-based source locator from inspected slide titles/text; not teacher-certified outcome coverage. Consult full deck when context is needed.',
      caveat: lesson.id === 'lesson-11' ? 'No direct CT/MRI/EEG teaching slide identified; textbook pp. 393–395 is the primary source. Slides 54–61 provide anatomical context only.' : lesson.id === 'lesson-13' ? 'Historical extra slides concern sensitive psychological/clinical topics; source/currency review required before expanding them.' : null,
      questions: staticQuestions.filter(q => q.lessonId === lesson.id),
      optionalGeneratedPractice: bank.concepts.filter(c => c.lessonId === lesson.id),
      generatedItemFamilies: itemInventory.filter(q => q.lessonId === lesson.id),
      textbookPractice: textbook.questions.filter(q => q.topics?.includes(lesson.id)),
      media: lesson.media,
      vocabulary: {canonicalPayload: 'current-course/data/vocabulary-and-schema.json',
        inlineTermLinks: $(element).find('[data-bio-term],.bio-term').toArray().map(e => ({attrs: e.attribs, term: normalize($(e).text())})),
        visibleWords: $(element).find('.lesson-vocabulary-help').toArray().map(e => normalize($(e).text()))},
      immutablePreservationBindings: lesson.preservationBindings,
      status: {...ch11.stageStatus, sourceInventory: 'exported with exact locators; see explicit source gaps'},
    };
    await putJson(`${folder}/source-packet.json`, lessonSources);
    lessonRecords.push(lessonSources);
    if (['lesson-01', 'lesson-02', 'lesson-03'].includes(lesson.id)) {
      await put(`first-batch/${lesson.id}/CURRENT_LESSON.md`, `# ${lesson.id}: ${lesson.title}\n\nRead alongside the source documents; all current learner wording follows, including native collapsed content. This is not the proposed rewrite.\n\n${md}`);
      await putJson(`first-batch/${lesson.id}/SOURCE_AND_PRESERVATION.json`, lessonSources);
      await put(`first-batch/${lesson.id}/TEACHER_SLIDES.md`, '# Relevant original teacher slides\n\nHistorical statements must be reconciled, not copied uncritically.\n\n' + (await Promise.all(lessonSources.teacherSlides.map(s => fs.readFile(path.join(output, s.textPath), 'utf8')))).join('\n\n---\n\n'));
    }
  }
  await putJson('chapter11-lessons/lesson-source-index.json', lessonRecords.map(({questions, optionalGeneratedPractice, generatedItemFamilies, immutablePreservationBindings, ...rest}) => rest));
  await putJson('inventory/stale-and-missing-evidence.json', [
    ...gaps,
    {path: `${base}/meta/prompt-pack.md`, issue: 'Required textbook-first instruction is stale. Current lesson guides make embedded textbook reading optional; retain the current contract.', status: 'not edited'},
    {path: `${base}/meta/source-map.json`, issue: 'Explicitly Lesson 1 only; deck slides 1–20. It is not a complete current Chapter 11 source map.'},
    {path: `${base}/meta/chapter11-intake.json`, issue: 'Historical 14 topics/10 checks; current course has 12 required lessons plus one optional extension and a separate hidden legacy foundation check.'},
    {path: 'projects/resources/biology30-production/v1/curriculum-baseline.json', issue: 'Existing production baseline covers B–D, not A. Included official program pages 51–53 provide Unit A1 scope; do not infer A alignment from B–D JSON.'},
    {path: 'inventory/project-metadata', issue: 'Active/blocked and old approval/test fields are retained factual metadata, not new manuscript acceptance or current Brightspace certification.'},
    {path: 'inventory/chapters-11-20.json', issue: 'Chapter 14 labeling owner label-diagrams.json is missing from declared canonicalSources; current actual owner is recorded without altering metadata.'},
    {path: 'sources/extraction-gaps.json', issue: 'Additional missing/currency/text-extraction evidence recorded separately.'}
  ]);
  await put('PRESERVATION_CONTRACT.md', '# Preservation contract — teacher/developer only\n\n' +
    'This package authorizes source preparation only. It is not a new learner course, release artifact or curriculum certification.\n\n' +
    publicChapters.map(c => `## Chapter ${c.chapter}\n\nCanonical entry: \`${c.canonicalEntry}\`. Teaching owner: \`${c.actualOwners.teaching}\`.\n\n` +
      `State namespace: \`${c.preservation.namespace}\`; owner: \`${c.preservation.storageOwner}\`.\n\n` +
      `Required check IDs (${c.requiredCheckIds.length}): ${c.requiredCheckIds.map(id => '`' + id + '`').join(', ')}.\n\n` +
      `Label mappings/options, vocabulary IDs and all source bindings are captured in inventory/chapters-11-20.json. Retain current status ${c.originalAuthoringStatus}.\n\n${c.actualOwners.warning}\n`).join('\n') +
    '\nKeep old attempts immutable. Keep bold clickable words and word-owned Frayers, reader/page links, native conflict/failed-save protections and optional-practice rules. No new grade/completion gates. No global Save & Exit or new photo-upload UI. Do not overwrite generic reimport data blocks or approved labeling art/answer maps.\n\nChapter 13 lesson-07 worked/guided teaching must stay before its failure-analysis sections. Vocabulary distinction is true explanatory text; practice misconception is intentionally false text, never interchangeable.\n');
  await putJson('AUTHORING_TRACKER.json', {
    packageStage: 'stage-1-source-export', packageOnly: true, browserAuthoringStarted: false, courseIntegrationStarted: false,
    sourceReadiness: {inventoryBoundToCurrentBytes: true, sourceDocumentsIncluded: true, exactChapter11CopyIncluded: true,
      caveats: ['PDF extraction is not visual question certification.', 'Current web/2026 policy currency and video playback not verified.', 'Historical teacher statements require science reconciliation.', 'Ten-chapter inventory is not ten-chapter source export.']},
    lessons: ch11.lessons.map(l => ({id: l.id, ...ch11.stageStatus})),
    firstBatch: ['lesson-01', 'lesson-02', 'lesson-03'],
    approval: {owner: 'Dean', requiredBeforeHtmlChanges: true, currentDecision: null},
    contrastCalibration: {chapter: 19, lessonId: 'lesson-04', title: 'Calculating expected genotype frequencies', status: 'not-started; prepare prerequisites and source packet after first batch is reviewed'},
    release: {packaging: 'not-started', deployment: 'not-started', brightspace: 'not-tested'}
  });
  await put('NEXT_PHASE.md', '# Agreed next phase — not initiated\n\n' +
    '1. Use Dean’s signed-in Biology 30 ChatGPT project through ordinary visible browser interaction. Inspect the selected model and Extra High setting; report unavailable choices, do not substitute silently.\n' +
    '2. Attach bounded first-batch files and originals/excerpts; confirm attachment success before requesting writing. A local repository path alone is not an attachment.\n' +
    '3. Establish the central biological question, prerequisites and conceptual progression first. Treat these as proposed until reviewed. Then author full lesson-01 Nervous communication, lesson-02 Neurons & myelin and lesson-03 Pathways & reflexes.\n' +
    '4. Return complete student copy, not an outline: causal explanations, transitions, diagram-reading guidance, worked reasoning, guided and fresh independent practice, criteria and explanatory feedback. Teach all prerequisites for every task. No word-count shortening quota; preserve Alberta Biology 30 depth with accessible high-school teacher voice.\n' +
    '5. Separate learner manuscript from source notes, unresolved questions, asset specifications and integration instructions. Cite exact source IDs/page or slide locators. Distinguish existing approved media from a prompt or unreviewed new image.\n' +
    '6. Lead reviews against actual sources/teaching standard, requests targeted revisions, stores complete versioned manuscripts/source references/asset statuses/integration maps. Dean explicitly approves the batch before HTML integration; AI self-review is not approval.\n' +
    '7. Only after approval, test the standard on Chapter 19 lesson-04 with its prerequisite context, then scale in bounded batches. Integrate approved exact copy through recorded owners without summarizing or silently rewriting.\n' +
    '8. Keep source readiness, authorship, content review, integration, technical proof and teacher acceptance separate. Deployment, SCORM packaging and actual Brightspace testing require their own authorization and evidence.\n\nNo authoring prompt was sent during Stage 1. Supplied prompts are materials for the next phase, not automatic execution instructions.\n');
  await put('README_START_HERE.md', '# Biology 30 — Chapter 11 teaching source handoff\n\n' +
    `Current-source export anchored to \`${revision}\` on \`${branch}\`, plus exact file hashes. Stage 1 only; no learner-course changes or ChatGPT prompts.\n\n` +
    '## Read in this order\n\n' +
    '1. NEXT_PHASE.md — agreed boundary and next authoring/review process.\n' +
    '2. supplied-standard/02_TEACHING_STANDARD.md — supplied proposed teacher-voice/depth standard.\n' +
    '3. inventory/CHAPTER_INDEX.md, chapters-11-20.json and current-source-availability.json — actual routes, IDs, source owners, resources, fresh file availability and preservation records.\n' +
    '4. inventory/stale-and-missing-evidence.json and sources/extraction-gaps.json — stale metadata, source/currency limitations.\n' +
    '5. first-batch/ — complete current lesson-01/02/03 copy, questions, feedback/keys and source locators; source-excerpts holds bounded original PDFs.\n' +
    '6. chapter11-lessons/ — complete HTML and readable extracts for all 12 required lessons, optional lesson-13 and the hidden legacy lesson-check.\n' +
    '7. sources/source-register.json — original textbook, teacher deck, official cache and selected teacher documents with exact hashes/locators.\n' +
    '8. current-course/data/ — original catalogue, all generated question families and keys, vocabulary/schema, textbook crop provenance and feedback policy; current-course/owners holds exact runtime sources.\n' +
    '9. PRESERVATION_CONTRACT.md, AUTHORING_TRACKER.json and VERIFICATION.json — preserved state/design and truthful stage status.\n\n' +
    '## Important distinctions\n\n' +
    'The 11–20 map is an inventory, not rewritten courses or full source packages for every chapter. Chapter 11 exported text is the existing course, not an authored overhaul. Native collapsed text is included; runtime-generated questions/feedback are exported separately. No learner answers, browser storage or private student data were accessed.\n\n' +
    'Teacher-only answer/quiz files and quiz-media must not be copied into learner pages. Unit A review documents may also cover Chapters 12/13; use their Chapter 11 portions only. PDF text extraction cannot replace looking at the original figure or two-column question layout. See sources/pdf-extraction-warnings.json for parser limitations; originals are unchanged. Original source copyrights/redistribution boundaries remain unchanged.\n\n' +
    '## Optional local source-reference preview\n\n' +
    'Serve current-course/workspace with a local static server and open index.html. This is a developer-only source reference, not an uploadable SCORM or learner release. Its bundled runtime is derived/reference only; canonical runtime source is in current-course/owners. No source document availability, LMS saving or new teaching acceptance is implied by this preview.\n\n' +
    '## Routing and reproduction\n\n' +
    'Source/teacher judgment retained by lead; inventory/extraction/hash checks use deterministic local commands. No worker/delegation was used because the read-only public-source extraction is one bounded command and source authority/ownership acceptance must remain with the lead. Provider-cache telemetry and usage savings: unknown; no savings claim.\n\n' +
    'Reproduction source is in reproduction/. Run the repository exporter with --output pointing to a new directory, --python to a pypdf-enabled runtime and --prompts to the supplied ZIP. It refuses existing destinations and does not touch learner sources.\n');
  const after = await snapshot();
  if (before.treeSha256 !== after.treeSha256 || json(before.files) !== json(after.files)) throw Error('Protected Biology source changed during export; do not deliver as unchanged.');
  await putJson('preservation/source-after.json', after);
  const copiedHtml = await fs.readFile(path.join(output, 'current-course/workspace/index.html'));
  const originalHtml = await fs.readFile(path.join(repo, ch11.canonicalEntry));
  if (sha(copiedHtml) !== sha(originalHtml)) throw Error('Current HTML copy not byte-exact');
  const verification = {
    scope: 'source handoff only; no learner acceptance, rendering, SCORM or Brightspace certification',
    revision, sourceTreeSha256: before.treeSha256,
    protectedSourceFiles: before.files.length, protectedSourceBytesUnchanged: true,
    chaptersInventoried: chapters.length, requiredLessonChecks: totalRequired,
    chapter11: {requiredChecks: ch11.requiredCheckIds.length, optionalExtensions: ch11.lessons.filter(l => l.optional).length,
      legacyFoundationCheckIncluded: true, staticQuestionContainers: staticQuestions.length,
      authoredConcepts: bank.concepts.length, generatedItemFamilyRecords: itemInventory.length,
      textbookQuestionRecords: textbook.questions.length, words: words.data.words.length,
      exactHtmlCopyMatches: true, exactLessonFragments: ch11.lessons.length + 1, ...sourceSummary},
    checks: ['all current declared/actual canonical owners inventoried', 'real PDF bytes and printed/PDF map verified',
      'literal banks parsed without eval/window', 'pure practice-engine reference reconstruction and bank validation',
      'all current source HTML and native collapsed lesson text exported without truncation',
      'all supplied prompt Markdown files copied unchanged', 'before/after source hashes identical'],
    deferred: ['first-time learner scientific/content review', 'model/Extra High and successful browser attachments',
      'new manuscripts and targeted revision', 'Dean approval', 'rendered approved-copy parity',
      'affected interaction/save compatibility after integration', 'packaging/deployment/Brightspace rollout']
  };
  // The legacy section is not a numbered lesson but remains part of the full source corpus.
  const legacy = $('#lesson-check')[0];
  if (!legacy) throw Error('Legacy saved-work section unexpectedly missing');
  await put('chapter11-lessons/lesson-check/current-exact.html', ch11._rawFragment(legacy));
  await put('chapter11-lessons/lesson-check/current-complete.md', '# Hidden legacy foundation check — reference only\n\nDo not add to the new required progress denominator.\n\n' + readableMarkdown($, legacy));
  await putJson('VERIFICATION.json', verification);
  const members = [];
  for (const f of await walk(output)) {const bytes = await fs.readFile(path.join(output, f)); members.push({path: f, bytes: bytes.length, sha256: sha(bytes)});}
  await putJson('PACKAGE_MANIFEST.json', {schemaVersion: 1, revision, files: members,
    note: 'Every payload file except this self-referential manifest is listed. ZIP SHA256 is in the adjacent delivery receipt.'});
  const zip = new JSZip(), root = path.basename(output) + '/';
  for (const f of await walk(output)) zip.file(root + f, await fs.readFile(path.join(output, f)));
  const zipPath = output + '.zip';
  if (await fs.stat(zipPath).catch(() => null)) throw Error('Refusing to overwrite ZIP');
  const zipBytes = await zip.generateAsync({type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: {level: 6}});
  await fs.writeFile(zipPath, zipBytes, {flag: 'wx'});
  const receipt = {generatedAt: new Date().toISOString(), output, zipPath, zipSha256: sha(zipBytes), zipBytes: zipBytes.length,
    payloadFiles: members.length + 1, sourceTreeSha256: before.treeSha256, verification};
  await fs.writeFile(output + '.receipt.json', json(receipt), {flag: 'wx'});
  return receipt;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--help')) {
    console.log('node scripts/export-biology30-teaching-handoff.mjs --output <new-directory> --python <pypdf-python> --prompts <supplied-ZIP>\nStage 1 source preparation only. Refuses existing output; never regenerates or edits learner courses.');
  } else {
    const arg = name => {const i = process.argv.indexOf(name); if (i < 0 || !process.argv[i + 1]) throw Error(`Missing ${name}`); return process.argv[i + 1];};
    const receipt = await exportHandoff({repo: process.cwd(), output: path.resolve(arg('--output')), python: arg('--python'), prompts: path.resolve(arg('--prompts'))});
    console.log(json({zipPath: receipt.zipPath, zipBytes: receipt.zipBytes, zipSha256: receipt.zipSha256,
      payloadFiles: receipt.payloadFiles, verification: receipt.verification}));
  }
}
