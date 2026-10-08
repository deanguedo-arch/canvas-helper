import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { load } from 'cheerio';
import JSZip from 'jszip';

// Source export only. Never modifies learner owners, metadata status or prior returns.
const repo = process.cwd();
const relativeOwner = 'projects/biology30-chapter-13/workspace/index.html';
const owner = path.join(repo, relativeOwner);
const html = fs.readFileSync(owner, 'utf8');
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const folder = path.join(repo, 'projects/biology30-chapter-13/meta/teaching-overhaul/2026-10-08-teacher-led/batch-01-03-v0.1.0');
if (fs.existsSync(folder)) throw Error('Existing batch is immutable; select another version.');
const packet = path.join(folder, 'source-handoff');
const write = (name, bytes) => {
  const target = path.join(packet, name);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes, { flag: 'wx' });
};
const json = (name, value) => write(name, JSON.stringify(value, null, 2) + '\n');
const $ = load(html, { sourceCodeLocationInfo: true });
const raw = e => html.slice(e.sourceCodeLocation.startOffset, e.sourceCodeLocation.endOffset);
const targetNumbers = ['01', '02', '03'];
const routes = $('section[id^="lesson-"]').toArray().map(e => ({
  id: e.attribs.id, title: $(e).find('h1').first().text(),
  goal: $(e).find('.goal-strip').first().text().replace(/\s+/g, ' ').trim(),
  sha256: hash(raw(e)),
}));
write('current/index.html', html);
json('current/CHAPTER_ROUTES.json', routes);
write('current/CHAPTER_TEXT.txt', $('section[id^="lesson-"]').toArray().map(e => `\n\n## ${e.attribs.id}\n${$(e).text().replace(/\s+/g, ' ').trim()}`).join(''));
for (const n of [...targetNumbers, '04']) write(`current/lesson-${n}.html`, raw($(`#lesson-${n}`)[0]));
const boundaries = [];
const media = [];
for (const n of targetNumbers) {
  const e = $(`#lesson-${n}`)[0];
  const parts = $(`#lesson-${n} > .p2-topic`).children().toArray();
  if (parts[0]?.tagName !== 'header' || parts[5]?.attribs.id !== `ch13-l${n}-worked`) throw Error(`Unexpected teaching structure: ${n}`);
  const teaching = parts.slice(1, 6);
  const start = teaching[0].sourceCodeLocation.startOffset;
  const end = teaching.at(-1).sourceCodeLocation.endOffset;
  const fragment = html.slice(start, end);
  write(`current/lesson-${n}.teaching-fragment.html`, fragment);
  write(`current/lesson-${n}.protected-header.html`, raw(parts[0]));
  const suffix = html.slice(parts[6].sourceCodeLocation.startOffset, e.sourceCodeLocation.endOffset);
  write(`current/lesson-${n}.protected-suffix.html`, suffix);
  const figures = $(teaching).find('figure, .figure-card').toArray().filter(e => !$(e).parents('figure, .figure-card').length);
  const immutable = figures.map(e => ({ id: e.attribs.id, sha256: hash(raw(e)), html: raw(e) }));
  boundaries.push({ lessonId: `lesson-${n}`, title: $(e).find('h1').first().text(),
    startCharacter: start, endCharacterExclusive: end, beforeSha256: hash(fragment),
    outerTags: teaching.map(e => raw(e).slice(0, raw(e).indexOf('>') + 1)),
    ids: teaching.map(e => e.attribs.id), lockedFigures: immutable,
    protectedHeaderSha256: hash(raw(parts[0])), protectedSuffixSha256: hash(suffix),
    existingVocabularyIds: [...new Set($(teaching).find('[data-term-id]').toArray().map(e => e.attribs['data-term-id']))],
  });
  let i = 0;
  for (const img of $(e).find('img[src]').toArray()) {
    const src = img.attribs.src;
    const data = /^data:([^;]+);base64,(.+)$/s.exec(src);
    let name;
    if (data) {
      const extension = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/svg+xml': 'svg', 'image/webp': 'webp' }[data[1]];
      if (!extension) throw Error(`Unsupported embedded image ${data[1]}`);
      name = `current/decoded-images/lesson-${n}-${++i}.${extension}`;
      write(name, Buffer.from(data[2], 'base64'));
    } else if (!/^(https?:|\/\/)/.test(src)) {
      name = `current/${src.replace(/^\.\//, '')}`;
      if (!fs.existsSync(path.join(packet, name))) write(name, fs.readFileSync(path.resolve(path.dirname(owner), src)));
    }
    media.push({ lessonId: `lesson-${n}`, file: name, alt: img.attribs.alt, sourceKind: data ? 'embedded native image' : 'linked native image', reviewStatus: 'Existing source; extraction alone is not visual approval.' });
  }
}
json('contracts/REPLACEMENT_BOUNDARIES.json', { version: '0.1.0', owner: relativeOwner, ownerSha256: hash(html), lessons: boundaries,
  protected: ['Every byte outside specified teaching intervals', 'Outer classes, IDs and edit keys', 'All locked figure markup and assets', 'Existing guided practice, required checks, questions/options/keys/feedback, optional notes and native JSON', 'Styles, fonts, routes, labeling answers, runtime, save namespaces/history/progress/print'], integrationScope: 'Separate comparison only; no canonical integration or release' });
json('current/MEDIA.json', media);
json('contracts/NATIVE_DATA.json', $('script[type="application/json"]').toArray().map(e => ({ id: e.attribs.id, text: $(e).text() })));
json('contracts/VOCABULARY_IDS.json', [...new Set($('[data-term-id]').toArray().map(e => e.attribs['data-term-id']))]);
const protection = ['index.html', 'styles.css', 'main.js'].map(f => ({ file: `projects/biology30-chapter-13/workspace/${f}`, sha256: hash(fs.readFileSync(path.join(path.dirname(owner), f))) }));
const metadata = 'projects/biology30-chapter-13/meta/project.json';
protection.push({ file: metadata, sha256: hash(fs.readFileSync(path.join(repo, metadata))), note: 'Contains pre-existing uncommitted changes; do not overwrite.' });
json('contracts/SOURCE_PROTECTION.json', protection);
for (const f of ['styles.css', 'main.js']) write(`current/${f}`, fs.readFileSync(path.join(path.dirname(owner), f)));
const standards = [
  ['02_TEACHING_STANDARD.md', '2026-10-02-source-handoff/supplied-standard/02_TEACHING_STANDARD.md'],
  ['CHAPTER11_TEACHING_STANDARD.md', '2026-10-03-scout-standard/CHAPTER11_TEACHING_STANDARD.md'],
  ['SCOUT_CHAPTER_PASS_PROCESS.md', '2026-10-03-scout-standard/SCOUT_CHAPTER_PASS_PROCESS.md'],
];
for (const [name, source] of standards) write(`standards/${name}`, fs.readFileSync(path.join(repo, 'projects/biology30-unit-a-pilot-3/meta/teaching-overhaul', source)));
for (const [chapter, slug, numbers] of [[11, 'biology30-unit-a-pilot-3', ['01', '02']], [12, 'biology30-chapter-12', ['01', '06']]]) {
  const source = fs.readFileSync(path.join(repo, `projects/${slug}/workspace/index.html`), 'utf8');
  const doc = load(source, { sourceCodeLocationInfo: true });
  for (const n of numbers) {
    const e = doc(`#lesson-${n}`)[0];
    if (!e?.sourceCodeLocation) throw Error(`Missing exemplar ${chapter}/${n}`);
    write(`reference/chapter-${chapter}/lesson-${n}.html`, source.slice(e.sourceCodeLocation.startOffset, e.sourceCodeLocation.endOffset));
  }
}
const pdf = path.join(path.dirname(owner), 'assets/textbook/chapter-13.pdf');
write('sources/chapter-13.pdf', fs.readFileSync(pdf));
const python = '/Users/deanguedo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
write('sources/TEXTBOOK_TEXT.txt', execFileSync(python, ['-c', 'import pypdf,sys\nd=pypdf.PdfReader(sys.argv[1])\nfor i,p in enumerate(d.pages):\n print("\\n## PDF page %s / printed page %s\\n"%(i+1,i+434));print(p.extract_text())', pdf]));
const pptPath = 'projects/resources/biology30-unit-a-pilot/_sources/05947fe3a4712c7465e9bb370acbeef6897651eae7cac40c2af54d4839bcc482.pptx';
const pptBytes = fs.readFileSync(path.join(repo, pptPath));
write('sources/teacher-chapter-13.pptx', pptBytes);
const ppt = await JSZip.loadAsync(pptBytes);
const slideNumbers = Object.keys(ppt.files).map(s => /^ppt\/slides\/slide(\d+)\.xml$/.exec(s)).filter(Boolean).map(m => Number(m[1])).sort((a,b)=>a-b);
const slides = [];
for (const n of slideNumbers) {
  const xml = await ppt.file(`ppt/slides/slide${n}.xml`).async('string');
  const x = load(xml, { xmlMode: true });
  const relMember = `ppt/slides/_rels/slide${n}.xml.rels`;
  const relText = ppt.file(relMember) ? await ppt.file(relMember).async('string') : '<Relationships/>';
  const r = load(relText, { xmlMode: true });
  const rels = new Map(r('Relationship').toArray().map(e => [e.attribs.Id, e.attribs.Target]));
  const images = [];
  if (n >= 4 && n <= 13) {
    write(`sources/slide-xml/slide-${n}.xml`, xml);
    write(`sources/slide-xml/slide-${n}.xml.rels`, relText);
    for (const e of x('a\\:blip').toArray()) {
      const target = rels.get(e.attribs['r:embed']);
      if (!target) continue;
      const member = path.posix.normalize(path.posix.join('ppt/slides', target));
      const bytes = await ppt.file(member)?.async('nodebuffer');
      if (!bytes) throw Error(`Missing actual source media ${member}`);
      const file = `sources/slide-assets/slide-${n}-${path.basename(member)}`;
      if (!fs.existsSync(path.join(packet, file))) write(file, bytes);
      images.push({ file, archiveMember: member, relationshipId: e.attribs['r:embed'], sha256: hash(bytes), status: 'Source extraction; inspect actual image before reuse.' });
    }
  }
  slides.push({ slide: n, text: x('a\\:t').toArray().map(e => x(e).text()), images });
}
json('sources/TEACHER_SLIDES.json', slides);
json('sources/SOURCE_BINDING.json', { chapter: 13, teacherDeck: { source: pptPath, sha256: hash(pptBytes), slides: slides.length }, textbook: { sha256: hash(fs.readFileSync(pdf)), pages: 38, mapping: 'PDF page 1 = printed 434; printed = PDF + 433', verifiedBy: 'Extracted page text and actual rendered printed pages 440 and 441 inspected' }, curriculumStatus: 'Current assessment/scope retained; independently verified Alberta outcome-code evidence not supplied in this bounded packet. Do not invent codes.' });
write('sources/SOURCE_REVIEW.md', `# Source review and cautions\n\nRead teacher slides 4–13 for the first three lessons and the full adjacent context. Textbook printed 436–442 = PDF 3–9. The full PDF/deck and native full chapter are supplied for continuity. Native routes are authoritative identities, not proof that every existing explanation is complete.\n\nActual rendered printed pages 440 and 441 inspected by Codex. Page 440 lists thyroxine among water-soluble hormones: this conflicts with the current scientifically corrected lesson's intracellular thyroid-hormone mechanism. Do not regress the correction; independently verify through primary science/authoritative reference and document the source conflict separately. Slide shorthand about whole-body endocrine effects must retain target specificity. Do not imply all cells depend on insulin for glucose uptake or basal insulin secretion completely ceases. Oxytocin milk ejection differs from prolactin milk production. Positive feedback needs its endpoint, not a vague claim of being harmful. Hormone solubility is not identical to chemical origin. Steroid receptors can be cytoplasmic or nuclear. Timing contrasts are typical, not absolute. Historical procedures or clinical treatments are not at-home instructions.\n\nThe lesson 3 existing optional response asks about stimulating hormone versus target-gland hormone. Teach enough of that two-level relationship before the optional task without stealing the later detailed pituitary lesson. Preserve all frozen assessments; flag a conflict instead of changing an old key.\n\nAll native figures in the teaching interval are locked. Explain their actual labels/arrows near them, do not replace them with generic images. Other extracted slide assets still need actual pixel review. Missing visuals require explicit status rather than invisible placeholders.\n`);
write('AUTHORING_TASK.md', `# Chapter 13 teacher-led pass: lessons 01–03 v0.1.0\n\nDean requests continuing the remaining Biology chapters after the Chapter 11/12 teaching integration. This packet requests a separate comparison candidate for Chapter 13 only, first lessons 01–03; no canonical integration, source edits, SCORM, deployment or automatic approval.\n\nFirst read complete standards, current chapter progression and all three complete native lessons including tasks/feedback; inspect relevant teacher slides and actual images, and textbook printed 436–442 with precise locators. Establish the whole chapter central question, prerequisites and actual-route conceptual progression. Keep source notes, author instructions and asset concerns out of student copy. Explain the biology directly.\n\nAuthor FULL complete lesson manuscripts and matching HTML teaching fragments. Preserve depth; no word quota or summary substitute. The teacher move is introduce what we examine and why → concrete observation/visual → causal explanation → complete worked thinking → supported then independent transfer → interpret and connect forward. Natural classroom language, Canadian English, terms defined when needed. No generic 'In lesson01' reference, no repeated opening formula or information dump. The source deck supplies voice/progression, not permission to copy shorthand errors. Use current Chapter 11/12 excerpts as observed accepted teaching references, not to transplant nervous-system examples.\n\n01: show why cells need coordinated regulation even though internal conditions change. Build homeostasis as ongoing regulation of a named variable, compare nervous/endocrine delivery on shared dimensions, distinguish delivery from target response and endocrine from exocrine using a connected mechanism. Guide students through the locked gland visual with accurate spatial cues. Model gland/trigger/message/target/effect reasoning without teaching every future gland in advance. Prepare the neural-to-hormonal milk-ejection optional demand; explain production versus release/ejection accurately.\n\n02: introduce the puzzle of hormone in blood but only certain cells responding. Build receptor specificity and binding-to-response, teach lipid bilayer relevance before contrasting surface versus intracellular signalling. Explain amplification step by step and interpret its meaning without invented quantitative constants. Walk through the locked mechanism figure. Distinguish steroid origin from solubility, retain the correct thyroid exception with verified support, explain signalling termination and absent/defective receptor versus low secretion. A worked example must reason, check, and interpret, not list a predicted location.\n\n03: establish the monitored variable and original change first. Follow the locked glucose figure then a fresh opposing response starting from a decrease. Negative/positive describe direction relative to the initial change, not moral value, direction of movement alone or hormone presence. Explain positive labour feedback and endpoint; distinguish milk ejection if included. Introduce just enough tropic-hormone feedback to prepare the existing optional source response. Use fresh worked conditions to reduce leakage of the unchanged required glucagon check, while making every demand fair.\n\nRewrite ONLY the five outer blocks per lesson in contracts/REPLACEMENT_BOUNDARIES.json; exact opening tags, classes, IDs, edit keys and locked nested figure markup remain unchanged. No new scripts, CSS, runtime/state, save fields, grading, route/sidebar changes. Preserve native vocabulary buttons with valid data-term-id values and bold term styling. Keep all existing suffix guided/independent tasks, note/save controls, checks/options/IDs/keys/model feedback/video/readers exact; write their full text in reading manuscripts as retained material. If adding new explanatory prose or non-interactive voluntary reasoning in the five blocks, provide criteria/feedback without new state controls or auto-marking. Match existing components, never redesign. Any additional essential visual must be source-grounded, supplied as an actual asset and separately flagged for review; do not substitute a proposed specification for visible content.\n\nReturn downloadable Biology30_CH13_Batch01_03_Teacher_Transfer_v0.1.0.zip: CHAPTER_PROGRESSION.md, CONTINUITY_LEDGER.md, manuscripts/lesson-01.md, lesson-02.md, lesson-03.md; lesson-01.teaching-fragment.html, lesson-02.teaching-fragment.html, lesson-03.teaching-fragment.html; SOURCE_VISUAL_MAP.json with precise page/slide/asset locators; PRACTICE_PREPARATION_MAP.json covering every frozen demand; INTEGRATION_MAP.json bound to supplied owner/interval hashes; CONTENT_REVIEW.md; CHANGELOG.md; OPEN_ISSUES.md; AUTHORING_EVIDENCE.md; MANIFEST.json path/bytes/SHA256 and CHECKSUMS.sha256. Actual new assets separately if needed. Complete student copy separate from developer notes. Source/self-review is not Dean's teacher acceptance. If a genuine evidence gap prevents accurate teaching, identify it rather than invent content.\n`);
json('STATUS.json', { sourcePreparation: 'ready for bounded authoring, source conflicts recorded', authorship: 'not started', contentReview: 'not started', teacherAcceptance: 'not requested', integration: 'not started', technicalTesting: 'not applicable to source-only export', release: 'out of scope', ownerSha256: hash(html), createdAt: new Date().toISOString(), revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), scope: targetNumbers });
const files = [];
const walk = folder => { for (const e of fs.readdirSync(folder, { withFileTypes: true }).sort((a,b)=>a.name.localeCompare(b.name))) { const f=path.join(folder,e.name); if(e.isDirectory())walk(f);else { const bytes=fs.readFileSync(f); files.push({ file:path.relative(packet,f), bytes:bytes.length, sha256:hash(bytes) }); } } };
walk(packet);
json('SOURCE_HANDOFF_MANIFEST.json', { version: '0.1.0', files });
const zip = new JSZip();
for (const f of [...files, { file: 'SOURCE_HANDOFF_MANIFEST.json' }]) zip.file(f.file, fs.readFileSync(path.join(packet, f.file)));
const archive = path.join(folder, 'Biology30_CH13_Batch01_03_Teacher_Transfer_v0.1.0_Source.zip');
const bytes = await zip.generateAsync({ type:'nodebuffer', compression:'DEFLATE' });
fs.writeFileSync(archive, bytes, { flag:'wx' });
for (const p of protection) if (hash(fs.readFileSync(path.join(repo,p.file))) !== p.sha256) throw Error(`Protected source changed: ${p.file}`);
console.log(JSON.stringify({ packet, archive, files:files.length+1, bytes:bytes.length, sha256:hash(bytes), ownerSha256:hash(html), protectedSourcesUnchanged:true },null,2));
