import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { load } from 'cheerio';

const parent = path.resolve('projects/biology30-chapter-17/meta/teaching-overhaul/2026-10-04-exemplar-transfer');
const trial = path.join(parent, 'teacher-led-transfer-l05-v0.1.0');
const packet = path.join(trial, 'source-handoff');
const returned = path.join(trial, 'pro-return/Biology30_CH17_Lesson05_Teacher_Transfer_v0.1.0');
const prior = path.join(parent, 'teacher-led-trial-v0.4.0/evaluation');
const originalViewer = '/Users/deanguedo/Documents/Codex/2026-10-04/task/source-assessment-trial-v0.3.0/evaluation/source';
const output = path.join(trial, 'evaluation');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const read = (root, file) => fs.readFileSync(path.join(root, file));
const json = (root, file) => JSON.parse(read(root, file));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const write = (file, content) => fs.writeFileSync(file, content, { flag: 'wx' });
assert(!fs.existsSync(output), 'Existing comparison must remain unchanged.');
const protections = json(packet, 'contracts/SOURCE_PROTECTION.json');
const protect = () => { for (const record of protections) assert(sha(fs.readFileSync(record.file)) === record.sha256, `Protected file changed: ${record.file}`); };
protect();
const manifest = json(returned, 'MANIFEST.json');
for (const record of manifest.payloads) {
  assert(!path.isAbsolute(record.file) && !record.file.split('/').includes('..'), 'Unsafe manifest path.');
  const bytes = read(returned, record.file);
  assert(bytes.length === record.bytes && sha(bytes) === record.sha256, `Return payload mismatch: ${record.file}`);
}
for (const line of read(returned, 'CHECKSUMS.sha256').toString().trim().split('\n')) {
  const match = /^([a-f0-9]{64})\s+\*?(.+)$/.exec(line);
  assert(match && !path.isAbsolute(match[2]) && !match[2].split('/').includes('..'), 'Invalid checksum entry.');
  assert(sha(read(returned, match[2])) === match[1], `Checksum mismatch: ${match[2]}`);
}
const boundary = json(packet, 'contracts/REPLACEMENT_BOUNDARY.json');
const original = read(prior, 'new/index.html');
assert(sha(original) === boundary.ownerSha256, 'Current owner differs from attached baseline.');
const before = original.subarray(boundary.startByte, boundary.endByteExclusive).toString();
assert(sha(before) === boundary.beforeSha256, 'Teaching boundary differs.');
const fragment = read(returned, 'lesson-05.teaching-fragment.html').toString();
const b = load(before, { sourceCodeLocationInfo: true }, false);
const f = load(fragment, { sourceCodeLocationInfo: true }, false);
assert(f('script,style,iframe,object,embed,link,input,select,form').length === 0, 'Unsupported active/style/form elements.');
for (const e of f('*').toArray()) for (const [name, value] of Object.entries(e.attribs ?? {})) assert(!/^on/i.test(name) && name !== 'style' && !/javascript:/i.test(value), `Unsupported attribute ${name}`);
for (const id of boundary.preserveIds) {
  const old = b(`[id="${id}"]`), next = f(`[id="${id}"]`);
  assert(old.length === 1 && next.length === 1, `Teaching ID lost: ${id}`);
  for (const attr of ['class', 'data-canvas-edit-key', 'data-canvas-helper-edit-key']) assert(old.attr(attr) === next.attr(attr), `Native outer identity changed: ${id}`);
}
const exactElement = ($, id, text) => { const el = $(`[id="${id}"]`); assert(el.length === 1, `Missing identity ${id}`); const loc = el[0].sourceCodeLocation; return text.slice(loc.startOffset, loc.endOffset); };
const taskIds = ['ch17-kinch-v020-l05-change-task', 'ch17-kinch-v020-l05-evidence-task'];
for (const id of taskIds) assert(exactElement(b, id, before) === exactElement(f, id, fragment), `Whole optional activity changed: ${id}`);
const oldFigure = b('figure[data-figure-id="ch17-two-trait"]')[0].sourceCodeLocation;
const newFigure = f('figure[data-figure-id="ch17-two-trait"]')[0].sourceCodeLocation;
assert(before.slice(oldFigure.startOffset, oldFigure.endOffset) === fragment.slice(newFigure.startOffset, newFigure.endOffset), 'Native branch figure/control changed.');
for (const el of b('[data-canvas-helper-edit-key]').toArray()) {
  const key = el.attribs['data-canvas-helper-edit-key'];
  const next = f(`[data-canvas-helper-edit-key="${key}"]`);
  assert(next.length === 1 && next.attr('data-canvas-edit-key') === el.attribs['data-canvas-edit-key'], `Edit key lost: ${key}`);
}
const ownerDom = load(original.toString());
const vocabulary = new Set(JSON.parse(ownerDom('#course-data').text()).words.map(w => w.id));
for (const el of f('[data-term-id]').toArray()) assert(el.tagName === 'button' && el.attribs.class === 'bio-term' && el.attribs.type === 'button' && el.attribs['aria-haspopup'] === 'dialog' && vocabulary.has(el.attribs['data-term-id']), 'Unbound vocabulary button.');
const terms = new Set(f('[data-term-id]').toArray().map(e => e.attribs['data-term-id']));
for (const el of b('[data-term-id]').toArray()) assert(terms.has(el.attribs['data-term-id']), 'Existing vocabulary connection lost.');
assert(f('textarea').length === 2 && f('[data-save-note]').length === 2, 'Saved field inventory changed.');
for (const el of f('button').toArray()) assert(['data-term-id','data-save-note','data-enlarge-figure'].some(a => a in el.attribs), 'New behavior outside scope.');
const sourceRecords = json(packet, 'sources/SLIDES_34_48.json');
const hashes = new Set(sourceRecords.flatMap(s => s.images.map(i => i.sha256)));
const assets = [...new Set(f('img').toArray().map(e => e.attribs.src))];
for (const src of assets) {
  assert(src === './assets/figures/ch17-two-trait.svg' || /^\.\/assets\/teaching-l05-v010\/[a-zA-Z0-9._-]+$/.test(src), `Unsupported asset ${src}`);
  assert(f(`img[src="${src}"]`).attr('alt')?.trim(), `Missing image alternative: ${src}`);
  const bytes = read(returned, src);
  assert(src.includes('/figures/') ? sha(bytes) === sha(read(prior, `new/${src}`)) : hashes.has(sha(bytes)), `Asset differs from original: ${src}`);
}
const candidate = Buffer.concat([original.subarray(0, boundary.startByte), Buffer.from(fragment), original.subarray(boundary.endByteExclusive)]);
const c = load(candidate.toString());
const ids = c('[id]').toArray().map(e => e.attribs.id);
assert(new Set(ids).size === ids.length, 'Duplicate candidate ID.');
fs.mkdirSync(output);
fs.cpSync(path.join(prior, 'new'), path.join(output, 'baseline'), { recursive: true, errorOnExist: true });
fs.cpSync(path.join(output, 'baseline'), path.join(output, 'new'), { recursive: true, errorOnExist: true });
fs.writeFileSync(path.join(output, 'new/index.html'), candidate);
for (const src of assets.filter(s => s.includes('/teaching-l05-v010/'))) {
  const target = path.join(output, 'new', src); fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(returned, src), target, fs.constants.COPYFILE_EXCL);
}
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
const native = walk(path.join(output,'baseline'));
for (const file of native) {
  const relative = path.relative(path.join(output,'baseline'), file);
  if (relative !== 'index.html') assert(sha(fs.readFileSync(file)) === sha(read(output, `new/${relative}`)), `Native asset/runtime/style drift: ${relative}`);
}
// Reuse the existing static source layout, restoring actual lesson05 picture
// relationships and placements from the frozen original OOXML.
const sourceDir = path.join(output, 'source'); fs.mkdirSync(sourceDir);
fs.copyFileSync(path.join(packet,'sources/original-114-slides.pptx'), path.join(sourceDir,'original-114-slides.pptx'));
fs.copyFileSync(path.join(originalViewer,'Attachment51.png'), path.join(sourceDir,'Attachment51.png'));
const s = load(read(originalViewer,'viewer.html').toString());
const keep = new Set(sourceRecords.map(r => String(r.slide)));
s('div.slide[data-slide]').each((_, e) => { if (!keep.has(e.attribs['data-slide'])) s(e).remove(); });
for (const record of sourceRecords) {
  const slide = s(`div.slide[data-slide="${record.slide}"]`);
  assert(slide.length === 1, 'Original slide layout missing.');
  slide.find('img').each((_, e) => { if (e.attribs.src !== 'Attachment51.png') s(e).remove(); });
  const xml = load(read(packet, `sources/slide-xml/slide-${record.slide}.xml`).toString(), { xmlMode: true });
  for (const pic of xml('p\\:pic').toArray()) {
    const relationship = xml(pic).find('a\\:blip').attr('r:embed');
    const asset = record.images.find(i => i.relationshipId === relationship);
    assert(asset, `Unresolved original picture on slide ${record.slide}`);
    const transform = xml(pic).find('a\\:xfrm').first();
    const off = transform.find('a\\:off')[0]?.attribs, ext = transform.find('a\\:ext')[0]?.attribs;
    assert(off && ext, 'Original picture placement missing.');
    const name = path.basename(asset.file); const target = path.join(sourceDir,name);
    if (!fs.existsSync(target)) fs.copyFileSync(path.join(packet,asset.file), target, fs.constants.COPYFILE_EXCL);
    slide.append(`<img src="${name}" alt="Original embedded illustration from PowerPoint slide ${record.slide}" style="position:absolute;left:${Number(off.x)/12700}px;top:${Number(off.y)/12700}px;width:${Number(ext.cx)/12700}px;height:${Number(ext.cy)/12700}px;">`);
  }
}
s('.render-note').text('Original PowerPoint text/layout from Quick Look, with lesson 5 picture associations restored from the original PPTX. Static preview; animations and fonts may differ. Download the original deck for the complete presentation.');
write(path.join(sourceDir,'viewer.html'), s.html().replace("const lesson=new URL(location.href).searchParams.get('lesson')==='05'?'05':'02'", "const lesson='05'"));
let wrapper = read(prior,'index.html').toString();
wrapper = wrapper.replaceAll('lesson 2','lesson 5').replaceAll('Lesson 2','Lesson 5')
  .replaceAll('teacher-led trial v0.4.0','teacher-led lesson 5 trial v0.1.0')
  .replace('02 · Mendel’s experiments and segregation','05 · Two-trait crosses and independent assortment')
  .replaceAll('value="02"','value="05"').replaceAll('lesson-02','lesson-05').replaceAll('lesson=02','lesson=05')
  .replaceAll('lesson 02','lesson 05').replaceAll('Previous · trial v0.3.0','Previous · lesson 5 baseline')
  .replaceAll('Previous v0.3.0','Previous baseline').replaceAll('New v0.4.0','New lesson 5 trial')
  .replace("const number='02'", "const number='05'")
  .replaceAll('57211','57221').replaceAll('57212','57222')
  .replace('Current lesson 5 baseline','Unchanged lesson 5 from the previous trial')
  .replace('Lesson 5 teaching revision · awaiting Dean’s review','Complete teaching revision · awaiting Dean’s review');
write(path.join(output,'index.html'), wrapper);
protect();
const report = { sourceOwnerSha256: sha(original), candidateSha256: sha(candidate), fragmentSha256: sha(fragment), exactPrefix: true, exactSuffix: true, wholeOptionalTasksExact: taskIds, editKeysPreserved: true, branchFigureExact: true, vocabularyConnectionsPreserved: true, unchangedNativeFiles: native.length-1, protectedSourceFilesUnchanged: protections.length, newImages: assets.filter(s => s.includes('/teaching-l05-v010/')), teacherAccepted: false, released: false };
write(path.join(output,'preservation-report.json'), JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({output,...report},null,2));
