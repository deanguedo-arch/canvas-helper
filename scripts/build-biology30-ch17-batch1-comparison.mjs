import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { load } from 'cheerio';

const parent = path.resolve('projects/biology30-chapter-17/meta/teaching-overhaul/2026-10-04-exemplar-transfer');
const trial = path.join(parent, 'teacher-led-batch-01-03-04-v0.1.0');
const packet = path.join(trial, 'source-handoff');
const returned = path.join(trial, 'pro-return');
const prior = path.join(parent, 'teacher-led-transfer-l05-v0.1.0/evaluation');
const originalViewer = '/Users/deanguedo/Documents/Codex/2026-10-04/task/source-assessment-trial-v0.3.0/evaluation/source';
const output = path.join(trial, 'evaluation');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const read = (root, file) => fs.readFileSync(path.join(root, file));
const json = (root, file) => JSON.parse(read(root, file));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const write = (file, data) => fs.writeFileSync(file, data, { flag: 'wx' });
assert(!fs.existsSync(output), 'Existing comparison must remain unchanged.');
const protections = json(packet, 'contracts/SOURCE_PROTECTION.json');
const protect = () => { for (const r of protections) assert(sha(fs.readFileSync(r.file)) === r.sha256, `Protected file changed: ${r.file}`); };
protect();
for (const r of json(returned, 'MANIFEST.json').files) {
  assert(!path.isAbsolute(r.path) && !r.path.split('/').includes('..'), 'Unsafe manifest path.');
  const b = read(returned, r.path);
  assert(b.length === r.bytes && sha(b) === r.sha256, `Return payload mismatch: ${r.path}`);
}
for (const line of read(returned, 'CHECKSUMS.sha256').toString().trim().split('\n')) {
  const m = /^([a-f0-9]{64})\s+\*?(.+)$/.exec(line);
  assert(m && !path.isAbsolute(m[2]) && !m[2].split('/').includes('..'), 'Invalid checksum entry.');
  assert(sha(read(returned, m[2])) === m[1], `Checksum mismatch: ${m[2]}`);
}
const boundaries = json(packet, 'contracts/REPLACEMENT_BOUNDARIES.json');
const original = read(prior, 'new/index.html');
assert(sha(original) === boundaries.ownerSha256 && original.equals(read(packet,'current/index.html')), 'Current owner differs from frozen packet.');
const ownerDom = load(original.toString());
const nativeData = JSON.parse(ownerDom('#course-data').text());
const vocabulary = new Set(nativeData.words.map(w => w.id));
const sources = json(packet, 'sources/SELECTED_SLIDES.json');
const sourceHashes = new Set(sources.flatMap(s => s.images.map(i => i.sha256)));
const exact = ($, el, text) => { const l = el.sourceCodeLocation; return text.slice(l.startOffset,l.endOffset); };
const parts = [], assets = new Set(), checked = []; let cursor = 0;
for (const boundary of boundaries.lessons) {
  parts.push(original.subarray(cursor,boundary.startByte));
  const before = original.subarray(boundary.startByte,boundary.endByteExclusive).toString();
  assert(sha(before) === boundary.beforeSha256, 'Teaching boundary differs.');
  const fragment = read(returned, `${boundary.lessonId}.teaching-fragment.html`).toString();
  const b = load(before, { sourceCodeLocationInfo:true }, false), f = load(fragment, { sourceCodeLocationInfo:true }, false);
  assert(f('script,style,iframe,object,embed,link,input,select,textarea,form,[data-save-note]').length === 0, 'Unexpected active/style/save element.');
  for (const e of f('*').toArray()) for (const [name,value] of Object.entries(e.attribs ?? {})) assert(!/^on/i.test(name) && name !== 'style' && !/javascript:/i.test(value), `Unsupported attribute ${name}`);
  for (const tag of boundary.preservedOuterTags) assert(fragment.includes(tag), 'Exact outer tag lost.');
  for (const e of b('[data-canvas-helper-edit-key]').toArray()) {
    const key = e.attribs['data-canvas-helper-edit-key'], next = f(`[data-canvas-helper-edit-key="${key}"]`);
    assert(next.length === 1 && next.attr('data-canvas-edit-key') === e.attribs['data-canvas-edit-key'], `Edit key lost: ${key}`);
  }
  const terms = new Set(f('[data-term-id]').toArray().map(e => e.attribs['data-term-id']));
  for (const e of b('[data-term-id]').toArray()) assert(terms.has(e.attribs['data-term-id']), 'Existing term link lost.');
  for (const e of f('[data-term-id]').toArray()) assert(e.tagName === 'button' && e.attribs.class === 'bio-term' && e.attribs.type === 'button' && e.attribs['aria-haspopup'] === 'dialog' && vocabulary.has(e.attribs['data-term-id']), 'Unbound term link.');
  for (const e of b('figure[data-figure-id]').toArray()) {
    const n = f(`figure[data-figure-id="${e.attribs['data-figure-id']}"]`);
    assert(n.length === 1 && exact(b,e,before) === exact(f,n[0],fragment), 'Native figure/control changed.');
  }
  for (const e of f('button').toArray()) assert(['data-term-id','data-enlarge-figure'].some(a => a in e.attribs), 'New behavior outside scope.');
  for (const e of f('img').toArray()) {
    const src = e.attribs.src; assets.add(src);
    assert(e.attribs.alt?.trim(), 'Missing image alternative.');
    assert(/^\.\/assets\/teaching-batch1-v010\/[a-zA-Z0-9._-]+$/.test(src) || src === './assets/figures/ch17-punnett.svg', `Unsupported asset ${src}`);
    assert(src.includes('/figures/') ? sha(read(returned,src)) === sha(read(prior,`new/${src}`)) : sourceHashes.has(sha(read(returned,src))), `Source image changed: ${src}`);
  }
  parts.push(Buffer.from(fragment)); cursor = boundary.endByteExclusive;
  checked.push({lesson:boundary.lessonId, beforeSha256:sha(before), afterSha256:sha(fragment), noteIdsUnchanged:boundary.protectedNoteIds});
}
parts.push(original.subarray(cursor));
const teachingOnly = Buffer.concat(parts).toString();
const needle = 'One aa offspring from B_ × bb';
assert(teachingOnly.split(needle).length-1 === 2, 'Notation correction target count changed.');
// Dean authorized resolving the specific repeated typo. This is the only
// additional exception to frozen suffix/data byte preservation; no key changes.
const candidate = teachingOnly.replaceAll(needle, 'One bb offspring from B_ × bb');
const c = load(candidate);
const ids = c('[id]').toArray().map(e => e.attribs.id);
assert(new Set(ids).size === ids.length, 'Duplicate candidate ID.');
const expectedData = structuredClone(nativeData);
let correctedData = 0;
for (const video of expectedData.videos) if (typeof video.fallback === 'string' && video.fallback.includes(needle)) { video.fallback = video.fallback.replaceAll(needle,'One bb offspring from B_ × bb'); correctedData++; }
assert(correctedData === 1 && JSON.stringify(expectedData) === JSON.stringify(JSON.parse(c('#course-data').text())), 'Native data changed beyond approved fallback typo.');
for (const number of ['02','05','06','07','08','09','10','11','12','13','14','15']) assert(ownerDom(`#lesson-${number}`).toString() === c(`#lesson-${number}`).toString(), `Other lesson changed: ${number}`);
for (const e of ownerDom('[data-note-id], [data-save-note]').toArray()) {
  for (const attr of ['data-note-id','data-save-note']) if (e.attribs[attr]) assert(c(`[${attr}="${e.attribs[attr]}"]`).length === ownerDom(`[${attr}="${e.attribs[attr]}"]`).length, 'Note binding inventory changed.');
}
fs.mkdirSync(output);
fs.cpSync(path.join(prior,'new'),path.join(output,'baseline'),{recursive:true,errorOnExist:true});
fs.cpSync(path.join(output,'baseline'),path.join(output,'new'),{recursive:true,errorOnExist:true});
fs.writeFileSync(path.join(output,'new/index.html'),candidate);
for (const src of assets) if (src.includes('/teaching-batch1-v010/')) { const dest = path.join(output,'new',src); fs.mkdirSync(path.dirname(dest),{recursive:true}); fs.copyFileSync(path.join(returned,src),dest,fs.constants.COPYFILE_EXCL); }
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const native = walk(path.join(output,'baseline'));
for (const file of native) { const r = path.relative(path.join(output,'baseline'),file); if(r !== 'index.html') assert(sha(fs.readFileSync(file)) === sha(read(output,`new/${r}`)), `Native file drift: ${r}`); }
const sourceDir = path.join(output,'source'); fs.mkdirSync(sourceDir);
fs.copyFileSync(path.join(packet,'sources/original-114-slides.pptx'),path.join(sourceDir,'original-114-slides.pptx'));
fs.copyFileSync(path.join(originalViewer,'Attachment51.png'),path.join(sourceDir,'Attachment51.png'));
const s = load(read(originalViewer,'viewer.html').toString()), keep = new Set(sources.map(r=>String(r.slide)));
s('div.slide[data-slide]').each((_,e)=>{if(!keep.has(e.attribs['data-slide']))s(e).remove();});
for (const record of sources) {
  const slide = s(`div.slide[data-slide="${record.slide}"]`); assert(slide.length === 1,'Original slide layout missing.');
  slide.find('img').each((_,e)=>{if(e.attribs.src !== 'Attachment51.png')s(e).remove();});
  const xml = load(read(packet,`sources/slide-xml/slide-${record.slide}.xml`).toString(),{xmlMode:true});
  for (const pic of xml('p\\:pic').toArray()) {
    const relationship = xml(pic).find('a\\:blip').attr('r:embed'), asset = record.images.find(i=>i.relationshipId === relationship);
    assert(asset,'Unresolved original picture.');
    const transform = xml(pic).find('a\\:xfrm').first(), off = transform.find('a\\:off')[0]?.attribs, ext = transform.find('a\\:ext')[0]?.attribs;
    assert(off && ext,'Missing source placement.');
    const name = path.basename(asset.file), target = path.join(sourceDir,name);
    if(!fs.existsSync(target))fs.copyFileSync(path.join(packet,asset.file),target,fs.constants.COPYFILE_EXCL);
    slide.append(`<img src="${name}" alt="Original embedded illustration from PowerPoint slide ${record.slide}" style="position:absolute;left:${Number(off.x)/12700}px;top:${Number(off.y)/12700}px;width:${Number(ext.cx)/12700}px;height:${Number(ext.cy)/12700}px;">`);
  }
}
s('.render-note').text('Original PowerPoint text/layout from Quick Look; image identities and placements restored from original PPTX relationships. Static preview; animations and fonts may differ. Historical source wording is unchanged.');
const groups = {'01':[[1,6,'1–6 · Inheritance and selective breeding'],[7,12,'7–12 · Genes, alleles and expression']],'03':[[26,28,'26–28 · Single-trait contributions'],[29,30,'29–30 · Changing parents and generations']],'04':[[31,33,'31–33 · Testcross evidence and limits']]};
const sourceHtml = s.html().replace(/const groups=.*?;\n/,`const groups=${JSON.stringify(groups)};\n`).replace(/const lesson=new URL.*?;const ranges=/,"const requestedLesson=new URL(location.href).searchParams.get('lesson');const lesson=groups[requestedLesson]?requestedLesson:'01';const ranges=");
write(path.join(sourceDir,'viewer.html'),sourceHtml);
let wrapper = read(prior,'index.html').toString();
wrapper = wrapper.replace(/<title>.*?<\/title>/,'<title>Chapter 17 lessons 1, 3 and 4 — teaching comparison</title>')
  .replace(/<select id="lesson">.*?<\/select>/,`<select id="lesson">${boundaries.lessons.map(b=>`<option value="${b.lessonId.slice(-2)}">${b.lessonId.slice(-2)} · ${b.title}</option>`).join('')}</select>`)
  .replaceAll('57221','57231').replaceAll('57222','57232').replaceAll('lesson-05','lesson-01').replaceAll('lesson=05','lesson=01')
  .replace('Previous · lesson 5 baseline','Previous · unchanged teaching').replace('Unchanged lesson 5 from the previous trial','Baseline before this three-lesson batch')
  .replaceAll('New · teacher-led lesson 5 trial v0.1.0','New · teacher-led batch 1').replaceAll('New lesson 5 trial','New teacher-led batch 1')
  .replaceAll('lesson 05','lesson 01').replace('Lesson 5 slide groups','Matching lesson slide groups')
  .replace('aria-label="Trial v0.3.0, teacher-led v0.4.0 and original PowerPoint side by side"','aria-label="Previous teaching, new teacher-led batch and original PowerPoint side by side"')
  .replace("const number='05';lesson.value=number;","const number=['01','03','04'].includes(value)?value:'01';lesson.value=number;");
wrapper = wrapper.replace('</header>','<details class="note" style="padding:8px 16px;border-bottom:1px solid #cbd2cb"><summary>Review notes: existing checks and notation correction</summary><p>The source mouse examples in lesson 3 overlap two existing checks. Those checks are retained with their original IDs, scoring and progress rules; use them to review understanding, not as proof of fresh independent transfer. The two repeated aa → bb video/data typos in lesson 4 are corrected in this candidate only. Advanced optional source tasks remain available with later-return guidance. No assessment bank was redesigned.</p></details></header>');
write(path.join(output,'index.html'),wrapper);
protect();
const report = {version:'batch1-v0.1.0-r1-comparison',sourceOwnerSha256:sha(original),candidateSha256:sha(candidate),replacements:checked,exactNonTeachingBytesExceptApprovedTypo:true,notationCorrection:{before:needle,after:'One bb offspring from B_ × bb',count:2,scope:['lesson04 video summary','course-data video fallback'],authority:'Dean: can you do all that? following explicit flagged-issues resolution plan'},nativeDataOtherwiseExact:true,otherLessonsExact:true,unchangedNativeFiles:native.length-1,protectedSourceFilesUnchanged:protections.length,sourceImages:[...assets],assessmentDistinctnessAccepted:false,teacherAccepted:false,released:false};
write(path.join(output,'preservation-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({output,...report},null,2));
