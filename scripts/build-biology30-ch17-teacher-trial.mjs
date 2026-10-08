import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { load } from 'cheerio';

const repo = process.cwd();
const trial = path.join(repo, 'projects/biology30-chapter-17/meta/teaching-overhaul/2026-10-04-exemplar-transfer/teacher-led-trial-v0.4.0');
const packet = path.join(trial, 'source-handoff');
const prior = '/Users/deanguedo/Documents/Codex/2026-10-04/task/source-assessment-trial-v0.3.0/evaluation';
const canonical = path.join(repo, 'projects/biology30-chapter-17/workspace');
const output = path.join(trial, 'evaluation');
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
const inventory = root => {
  const files = [];
  const visit = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Unexpected symlink ${file}`);
      if (entry.isDirectory()) visit(file);
      else files.push({ file: path.relative(root, file), sha256: sha(fs.readFileSync(file)) });
    }
  };
  visit(root); return files;
};
const save = (name, value) => fs.writeFileSync(path.join(trial, name), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
const protectedRoots = [canonical, packet];
const v030OwnerFiles = ['index.html', 'main.js', 'styles.css', 'assets/revision-activities.js', 'assets/revision-practice.js', 'assets/textbook-practice.js', 'assets/textbook-practice.css'];
const protectedFiles = [path.join(prior, 'index.html'), path.join(prior, 'source/viewer.html'), ...v030OwnerFiles.map(file => path.join(prior, 'new', file))];
if (process.argv.includes('--prepare')) {
  save('SOURCE_PROTECTION.json', { directories: protectedRoots.map(root => ({ root, files: inventory(root) })), files: protectedFiles.map(file => ({ file, sha256: sha(fs.readFileSync(file)) })) });
  console.log('Recorded complete canonical workspace, current v0.3.0 index/runtime/style owners, comparison/source viewer and frozen source packet hashes.');
  process.exit(0);
}
if (fs.existsSync(output)) throw new Error('Evaluation exists; preserve the versioned candidate.');
const protection = JSON.parse(fs.readFileSync(path.join(trial, 'SOURCE_PROTECTION.json')));
const verifyProtected = () => {
  for (const record of protection.directories) if (JSON.stringify(inventory(record.root)) !== JSON.stringify(record.files)) throw new Error(`Protected source changed: ${record.root}`);
  for (const record of protection.files) if (sha(fs.readFileSync(record.file)) !== record.sha256) throw new Error(`Protected owner changed: ${record.file}`);
};
verifyProtected();
const returnRoot = path.join(trial, 'pro-return');
const packagedReturn = path.join(returnRoot, 'Biology30_CH17_Lesson02_Teacher_Trial_v0.4.0');
const returned = fs.existsSync(packagedReturn) ? packagedReturn : returnRoot;
for (const name of ['manuscripts/lesson-02.md', 'lesson-02.teaching-fragment.html', 'TEACHING_SEQUENCE.md', 'SOURCE_VISUAL_MAP.json', 'CHANGELOG.md', 'CONTENT_REVIEW.md', 'PRO_AUTHORING_EVIDENCE.md']) {
  if (!fs.existsSync(path.join(returned, name))) throw new Error(`Complete reviewed Pro return missing ${name}`);
}
const boundary = JSON.parse(fs.readFileSync(path.join(packet, 'contracts/REPLACEMENT_BOUNDARY.json')));
const original = fs.readFileSync(path.join(prior, 'new/index.html'), 'utf8');
if (sha(original) !== boundary.baseline) throw new Error('v0.3.0 owner mismatch.');
let fragment = fs.readFileSync(path.join(returned, 'lesson-02.teaching-fragment.html'), 'utf8');
const f = load(fragment, { sourceCodeLocationInfo: true }, false);
if (f('script,style,iframe,object,embed,link').length) throw new Error('Pro teaching includes an active or styling element.');
for (const e of f('*').toArray()) {
  for (const [name, value] of Object.entries(e.attribs ?? {})) {
    if (name.startsWith('on') || name === 'style' || /javascript:/i.test(value)) throw new Error(`Unauthorized attribute ${name}`);
  }
}
for (const id of boundary.preserveIds) if (f(`[id="${id}"]`).length !== 1) throw new Error(`Missing/duplicate native teaching identity ${id}`);
const originalDom = load(original, { sourceCodeLocationInfo: true });
const normalizedText = el => el.text().replace(/\s+/g, ' ').trim();
const noteReplacements = [];
for (const id of ['ch17-kinch-v020-l02-arrow-task', 'ch17-kinch-v020-l02-cross-task']) {
  const before = originalDom(`[id="${id}"]`), after = f(`[id="${id}"]`);
  if (before.length !== 1 || after.length !== 1 || normalizedText(before) !== normalizedText(after)) throw new Error(`Protected optional task text changed: ${id}`);
  const controls = ($, el) => el.find('textarea,button,input,label,[data-note-status]').toArray().map(e => ({ tag: e.tagName, attrs: Object.entries(e.attribs).sort(), text: normalizedText($(e)) }));
  if (JSON.stringify(controls(originalDom, before)) !== JSON.stringify(controls(f, after))) throw new Error(`Protected optional controls changed: ${id}`);
  const a = after[0].sourceCodeLocation, b = before[0].sourceCodeLocation;
  noteReplacements.push({ start: a.startOffset, end: a.endOffset, bytes: original.slice(b.startOffset, b.endOffset) });
}
for (const edit of noteReplacements.sort((a, b) => b.start - a.start)) fragment = fragment.slice(0, edit.start) + edit.bytes + fragment.slice(edit.end);
const selected = load(fragment, {}, false);
if (selected('input,select,form').length || selected('textarea').length !== 2 || selected('[data-save-note]').length !== 2) throw new Error('New form, assessment or saved-field controls are outside this teaching-only boundary.');
for (const button of selected('button').toArray()) {
  if (!('data-term-id' in button.attribs) && !('data-save-note' in button.attribs) && !('data-enlarge-figure' in button.attribs)) throw new Error('Unrecognized new teaching behavior.');
}
const config = JSON.parse(originalDom('#course-data').text());
const wordIds = new Set(config.words.map(word => word.id));
for (const button of selected('[data-term-id]').toArray()) {
  if (button.tagName !== 'button' || button.attribs.class !== 'bio-term' || button.attribs.type !== 'button' || button.attribs['aria-haspopup'] !== 'dialog' || !wordIds.has(button.attribs['data-term-id'])) throw new Error('Invalid native vocabulary connection.');
}
const previousTerms = new Set(load(original.slice(boundary.startCharacter, boundary.endCharacterExclusive), {}, false)('[data-term-id]').toArray().map(e => e.attribs['data-term-id']));
const currentTerms = new Set(selected('[data-term-id]').toArray().map(e => e.attribs['data-term-id']));
for (const term of previousTerms) if (!currentTerms.has(term)) throw new Error(`Previously clickable vocabulary was lost: ${term}`);
const sourceAssets = JSON.parse(fs.readFileSync(path.join(packet, 'sources/SLIDES_13_25_AND_41.json'))).flatMap(s => s.images);
const allowedHashes = new Set(sourceAssets.map(i => i.sha256));
const referencedAssets = [...new Set(selected('img').toArray().map(e => e.attribs.src))];
if (!referencedAssets.length) throw new Error('The trial must show meaningful source visuals.');
for (const src of referencedAssets) {
  if (!/^\.\/assets\/teaching-v040\/[a-zA-Z0-9._-]+$/.test(src)) throw new Error(`Unbound teaching image ${src}`);
  const file = path.join(returned, src);
  if (!fs.existsSync(file) || !allowedHashes.has(sha(fs.readFileSync(file)))) throw new Error(`Image is not exact verified teacher source ${src}`);
  const img = selected(`img[src="${src}"]`);
  if (!img.attr('alt')?.trim()) throw new Error(`Image lacks alt text ${src}`);
}
const candidate = original.slice(0, boundary.startCharacter) + fragment + original.slice(boundary.endCharacterExclusive);
const $ = load(candidate);
const ids = $('*[id]').toArray().map(e => e.attribs.id);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate candidate IDs.');
fs.mkdirSync(output, { recursive: true });
// v0.3.0 records verify its native resources were copied from this unchanged
// canonical workspace. Use these materialized bytes rather than blocking on
// iCloud-offloaded duplicate question images, then overlay the current owners.
fs.cpSync(canonical, path.join(output, 'baseline'), { recursive: true, errorOnExist: true });
for (const file of v030OwnerFiles) fs.copyFileSync(path.join(prior, 'new', file), path.join(output, 'baseline', file));
fs.cpSync(path.join(output, 'baseline'), path.join(output, 'new'), { recursive: true, errorOnExist: true });
fs.writeFileSync(path.join(output, 'new/index.html'), candidate);
for (const src of referencedAssets) {
  const target = path.join(output, 'new', src);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(returned, src), target, fs.constants.COPYFILE_EXCL);
}
// Correct the disposable source viewer using the original picture relationships
// and placements. Keep the previous Quick Look comparison untouched.
fs.mkdirSync(path.join(output, 'source'));
fs.copyFileSync(path.join(packet, 'sources/original-114-slides.pptx'), path.join(output, 'source/original-114-slides.pptx'));
fs.copyFileSync(path.join(prior, 'source/Attachment51.png'), path.join(output, 'source/Attachment51.png'));
const source = load(fs.readFileSync(path.join(prior, 'source/viewer.html'), 'utf8'));
const sourceRecords = JSON.parse(fs.readFileSync(path.join(packet, 'sources/SLIDES_13_25_AND_41.json')));
const retainedSlides = new Set(sourceRecords.map(record => String(record.slide)));
source('div.slide[data-slide]').each((_, e) => { if (!retainedSlides.has(e.attribs['data-slide'])) source(e).remove(); });
const repairs = [];
for (const record of sourceRecords) {
  const slide = source(`div.slide[data-slide="${record.slide}"]`);
  const xml = load(fs.readFileSync(path.join(packet, `sources/slide-xml/slide-${record.slide}.xml`), 'utf8'), { xmlMode: true });
  const pictures = xml('p\\:pic').toArray();
  const oldSources = slide.find('img').toArray().map(e => e.attribs.src);
  slide.find('img').each((_, e) => { if (e.attribs.src !== 'Attachment51.png') source(e).remove(); });
  for (const [index, pic] of pictures.entries()) {
    const asset = record.images[index];
    if (!asset) throw new Error(`Source picture relationship missing on slide ${record.slide}`);
    const transform = xml(pic).find('a\\:xfrm').first();
    const off = transform.find('a\\:off')[0]?.attribs, ext = transform.find('a\\:ext')[0]?.attribs;
    if (!off || !ext) throw new Error(`Missing picture placement on original slide ${record.slide}`);
    const filename = path.basename(asset.file);
    fs.copyFileSync(path.join(packet, asset.file), path.join(output, 'source', filename), fs.constants.COPYFILE_EXCL);
    const left = Number(off.x) / 12700, top = Number(off.y) / 12700, width = Number(ext.cx) / 12700, height = Number(ext.cy) / 12700;
    slide.append(`<img src="${filename}" alt="Original embedded illustration from PowerPoint slide ${record.slide}" style="position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;">`);
  }
  repairs.push({ slide: record.slide, oldSources, verifiedImages: record.images });
}
source('.render-note').text('Original PowerPoint text/layout from Quick Look, with lesson 2 picture associations corrected from the original PPTX. Static preview; animations and fonts may differ. Download the original deck for the complete presentation.');
fs.writeFileSync(path.join(output, 'source/viewer.html'), source.html().replace("const lesson=new URL(location.href).searchParams.get('lesson')==='05'?'05':'02'", "const lesson='02'"));
let wrapper = fs.readFileSync(path.join(prior, 'index.html'), 'utf8');
wrapper = wrapper.replace('<title>Chapter 17 — older and latest side by side</title>', '<title>Chapter 17 lesson 2 — teacher-led trial v0.4.0 comparison</title>')
  .replace('<option value="05">05 · Two-trait crosses and independent assortment</option>', '')
  .replace('Older · original completed handoff', 'Previous · trial v0.3.0')
  .replace('2026-09-17-completed-handoff · ch17-complete-v1', 'Current lesson 2 baseline')
  .replace('Latest · source-assessment trial v0.3.0', 'New · teacher-led trial v0.4.0')
  .replace('Reviewed two-lesson candidate · teacher decision pending', 'Lesson 2 teaching revision · awaiting Dean’s review')
  .replace('aria-label="Older and latest lessons side by side"', 'aria-label="Trial v0.3.0, teacher-led v0.4.0 and original PowerPoint side by side"')
  .replace('114 original slides · matching slide groups', 'Lesson 2 slide groups · complete 114-slide deck downloadable')
  .replaceAll('57201', '57211').replaceAll('57202', '57212')
  .replace("const number=value==='05'?'05':'02'", "const number='02'")
  .replaceAll('Latest v0.3.0', 'New v0.4.0')
  .replaceAll('Older original', 'Previous v0.3.0')
  .replace('</header>', '<a href="http://127.0.0.1:57200/?lesson=02" target="_blank" rel="noopener">Earlier original comparison</a></header>');
fs.writeFileSync(path.join(output, 'index.html'), wrapper);
verifyProtected();
const baselineFiles = inventory(path.join(output, 'baseline'));
for (const file of v030OwnerFiles) if (sha(fs.readFileSync(path.join(output, 'baseline', file))) !== sha(fs.readFileSync(path.join(prior, 'new', file)))) throw new Error(`Baseline owner drift ${file}`);
const afterFiles = inventory(path.join(output, 'new'));
const changed = baselineFiles.filter(b => afterFiles.find(a => a.file === b.file)?.sha256 !== b.sha256).map(b => b.file);
if (JSON.stringify(changed) !== '["index.html"]') throw new Error(`Unexpected native changes ${changed}`);
const report = { version: '0.4.0', sourceOwner: boundary.baseline, candidateSha256: sha(candidate), authoredFragmentSha256: sha(fs.readFileSync(path.join(returned, 'lesson-02.teaching-fragment.html'))), integratedFragmentSha256: sha(fragment), optionalNoteSourceFormattingRestored: true, prefixExact: candidate.startsWith(original.slice(0, boundary.startCharacter)), suffixExact: candidate.endsWith(original.slice(boundary.endCharacterExclusive)), onlyChangedNativeFile: changed, newImages: referencedAssets, protectedRootsExact: true, assessmentDataRuntimeStylesExact: true, otherRoutesExact: true, nativeAssetsSource: 'Complete current canonical workspace; v0.3.0 records confirm unchanged copied native assets. Current index/runtime/styles reread from exact v0.3.0 owners.', teacherAccepted: false, released: false, sourceViewerRepairs: repairs };
fs.writeFileSync(path.join(output, 'preservation-report.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
save('BUILD_REPORT.json', report);
console.log(JSON.stringify({ output, candidateSha256: report.candidateSha256, images: referencedAssets.length, preservedNativeFiles: baselineFiles.length, changed }, null, 2));
