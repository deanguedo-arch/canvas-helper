import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { load } from 'cheerio';

// Isolated authoring packet. Never writes a learner workspace or prior candidate.
const repo = process.cwd();
const base = path.join(repo, 'projects/biology30-chapter-17/meta/teaching-overhaul/2026-10-04-exemplar-transfer');
const previous = path.join(base, 'teacher-led-batch-01-03-04-v0.1.0');
const owner = path.join(previous, 'evaluation/new/index.html');
const html = fs.readFileSync(owner, 'utf8');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const ownerSha = sha(html);
if (ownerSha !== '31447f72550c68ceb4a7cfd444f85651908a86782096dff4e4847cff4ab9e3e4') throw Error('Candidate drift; reconcile before authoring.');
const trial = path.join(base, 'teacher-led-batch-06-07-v0.1.0');
if (fs.existsSync(trial)) throw Error('Preserve existing batch; choose a new version.');
const packet = path.join(trial, 'source-handoff');
const write = (f, b) => { const p = path.join(packet, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, b, { flag: 'wx' }); };
const json = (f, v) => write(f, JSON.stringify(v, null, 2) + '\n');
const $ = load(html, { sourceCodeLocationInfo: true });
const raw = e => html.slice(e.sourceCodeLocation.startOffset, e.sourceCodeLocation.endOffset);
const numbers = ['06', '07'];
const contracts = [];
write('current/index.html', html);
for (const n of ['01', '02', '03', '04', '05', '06', '07', '08']) write(`current/lesson-${n}.html`, raw($(`#lesson-${n}`)[0]));
for (const n of numbers) {
  const lesson = $(`#lesson-${n}`)[0];
  const parts = $(`#lesson-${n} > .p2-topic`).children().toArray();
  if (parts[0].tagName !== 'header' || parts[5].attribs.id !== `ch17-l${n}-guided`) throw Error(`Unexpected lesson-${n} owner`);
  const teaching = parts.slice(1, 5);
  const start = teaching[0].sourceCodeLocation.startOffset;
  const end = teaching.at(-1).sourceCodeLocation.endOffset;
  const fragment = html.slice(start, end);
  write(`current/lesson-${n}.teaching-fragment.html`, fragment);
  write(`current/lesson-${n}.protected-header.html`, raw(parts[0]));
  write(`current/lesson-${n}.protected-suffix.html`, html.slice(parts[5].sourceCodeLocation.startOffset, lesson.sourceCodeLocation.endOffset));
  const lockedFigures = $(teaching).find('figure[id], figure[data-figure-id], .figure-card[id]').toArray();
  contracts.push({ lessonId: `lesson-${n}`, title: $(`#lesson-${n} h1`).first().text(), startCharacter: start, endCharacterExclusive: end,
    startByte: Buffer.byteLength(html.slice(0, start)), endByteExclusive: Buffer.byteLength(html.slice(0, end)), beforeSha256: sha(fragment),
    preservedOuterTags: teaching.map(e => raw(e).slice(0, raw(e).indexOf('>') + 1)), preserveIds: teaching.map(e => e.attribs.id),
    editKeyPairs: $(teaching).find('[data-canvas-helper-edit-key], [data-edit-key]').add($(teaching).filter('[data-canvas-helper-edit-key], [data-edit-key]')).toArray().map(e => ({ id: e.attribs.id, editKey: e.attribs['data-canvas-helper-edit-key'], nativeEditKey: e.attribs['data-edit-key'] })),
    existingVocabularyIds: [...new Set($(teaching).find('[data-term-id]').toArray().map(e => e.attribs['data-term-id']))],
    protectedNoteIds: $(`#lesson-${n} textarea[data-note-input]`).toArray().map(e => e.attribs.id),
    immutableTeachingSubsections: [...$(teaching).find('section[id]:has(textarea[data-note-input])').toArray(), ...lockedFigures].map(e => ({ id: e.attribs.id || e.attribs['data-figure-id'], sha256: sha(raw(e)), completeSection: raw(e) })),
    suffixSha256: sha(html.slice(parts[5].sourceCodeLocation.startOffset, lesson.sourceCodeLocation.endOffset)) });
}
json('contracts/REPLACEMENT_BOUNDARIES.json', { version: 'batch-06-07-v0.1.0', owner, ownerSha256: ownerSha, lessons: contracts,
  protected: ['Every byte outside the two teaching intervals', 'Exact outer tags, IDs, edit keys and locked figure/save subsections', 'All assessments, choices, keys, feedback, optional notes, videos and native JSON', 'All other lessons and every runtime/style/font/resource/save/progress/print contract'],
  integrationScope: 'Isolated comparison only; no canonical integration or release', freshOriginRequired: true });
json('contracts/NATIVE_DATA.json', $('script[type="application/json"]').toArray().map(e => ({ id: e.attribs.id, text: $(e).text() })));
json('contracts/VOCABULARY_CONNECTIONS.json', [...new Set($('button.bio-term[data-term-id]').toArray().map(e => e.attribs['data-term-id']))]);
const assets = new Set();
for (const n of ['02', '05', ...numbers]) for (const e of $(`#lesson-${n} img[src]`).toArray()) {
  const f = e.attribs.src.replace(/^\.\//, ''); if (f.startsWith('assets/')) assets.add(f);
}
for (const f of assets) write(`current/${f}`, fs.readFileSync(path.join(path.dirname(owner), f)));
const l02 = path.join(base, 'teacher-led-trial-v0.4.0');
const l05 = path.join(base, 'teacher-led-transfer-l05-v0.1.0');
for (const f of ['lesson-02.md', 'lesson-02.teaching-fragment.html', 'COPY_CHANGES.json']) write(`reference/l02/${f}`, fs.readFileSync(path.join(l02, 'revision-r1', f)));
for (const f of ['manuscripts/lesson-05.md', 'lesson-05.teaching-fragment.html', 'TEACHING_SEQUENCE.md', 'SOURCE_VISUAL_MAP.json']) write(`reference/l05/${f}`, fs.readFileSync(path.join(l05, 'pro-return/Biology30_CH17_Lesson05_Teacher_Transfer_v0.1.0', f)));
for (const f of ['02_TEACHING_STANDARD.md', 'CHAPTER11_TEACHING_STANDARD.md']) write(`standards/${f}`, fs.readFileSync(path.join(base, f)));
const source = path.join(previous, 'source-handoff/sources');
const ppt = path.join(source, 'original-114-slides.pptx');
write('sources/original-114-slides.pptx', fs.readFileSync(ppt));
write('sources/chapter-17.pdf', fs.readFileSync(path.join(source, 'chapter-17.pdf')));
const unzip = f => execFileSync('unzip', ['-p', ppt, f], { maxBuffer: 30 * 1024 * 1024 });
const slides = [];
for (const n of [...Array.from({ length: 10 }, (_, i) => i + 49), ...Array.from({ length: 5 }, (_, i) => i + 67)]) {
  const xml = unzip(`ppt/slides/slide${n}.xml`), relBytes = unzip(`ppt/slides/_rels/slide${n}.xml.rels`);
  const x = load(xml.toString(), { xmlMode: true }), r = load(relBytes.toString(), { xmlMode: true });
  const rels = new Map(r('Relationship').toArray().map(e => [e.attribs.Id, e.attribs.Target]));
  const images = [];
  for (const e of x('a\\:blip').toArray()) {
    const target = rels.get(e.attribs['r:embed']); if (!target) continue;
    const member = path.posix.normalize(path.posix.join('ppt/slides', target));
    const f = `sources/slide-assets/slide-${n}-${path.basename(member)}`, b = unzip(member);
    if (!fs.existsSync(path.join(packet, f))) write(f, b);
    images.push({ relationshipId: e.attribs['r:embed'], archiveMember: member, file: f, bytes: b.length, sha256: sha(b), pixelReviewStatus: 'Pending actual pixel review; do not treat extraction as approval.' });
  }
  write(`sources/slide-xml/slide-${n}.xml`, xml); write(`sources/slide-xml/slide-${n}.xml.rels`, relBytes);
  slides.push({ slide: n, text: x('a\\:t').toArray().map(e => x(e).text()), images });
}
json('sources/SELECTED_SLIDES.json', slides);
write('sources/SOURCE_LOCATORS.md', `# Lessons 6 and 7 source locators\n\nOriginal deck:114slides. Selected49–58 cover departures from complete dominance and teacher examples;67–71 cover multiple alleles and blood groups. Confirm every slide's actual purpose from supplied text, XML and pixels, not this tentative grouping alone. PDF:38pages, printed584=PDF1; printed page minus583 gives PDFpage. Read printed594–598 for dominance models, multiple alleles and worked/sample questions, plus current native reader locations and full adjacent prerequisite lessons.\n\nPreserve teacher progression, not historical shorthand or errors. Contrast heterozygote expression with unchanged allele segregation. Incomplete dominance is intermediate phenotype, not irreversible allele blending; codominance is detectable expression of both contributions, not necessarily different cells. Ratios depend on parental genotypes and expression model. Multiple alleles means population diversity, while the ordinary diploid autosomal individual has two allele copies. Define superscripts/plain-text equivalents consistently before use. ABO I^A,I^B,i are three allele versions at one locus; distinguish four phenotypes from six unordered genotypes and preserve individual parental contribution logic. Do not treat actual human eye colour as a verified single-gene example.\n\nClinical/sickle-cell/transfusion source passages are historical classroom evidence, not current medical advice. Do not reproduce claims that all levels of sickle-cell expression have one dominance relationship or give classroom ABO squares as clinical instructions or definitive family-relationship tests. Flag science needing verification rather than inventing authority. Classroom inheritance is the scope. Preserve all protected questions and IDs, flag contradictions outside teaching rather than changing them.\n\nLesson06 optional source response has existing native save control, protected in suffix. Lesson07 native ABO figure, its ID/button/label mappings and complete figure container are locked; inspect and explain their labels without altering them. All meaningful image introductions, observation prompts and interpreted significance stay visible at the point of reference. Use only correct original source assets or native semantic tables; no generated graphics in this authoring batch.\n`);
write('AUTHORING_TASK.md', `# Complete Chapter17 lessons06/07 teacher-led manuscripts v0.1.0\n\nDean authorized completing the remaining Chapter17 lessons in bounded batches using the teacher-led method. Only lessons06 Incomplete dominance and codominance, and07 Multiple alleles and ABO blood groups are this batch. Attached proposal owner SHA256 ${ownerSha} contains corrected02r1,05v010 and reviewed01/03/04 proposals. Earlier manuscripts remain awaiting Dean's exact-copy acceptance; do not claim live integration or universal standard promotion.\n\nRead the full standards, complete current06/07 lessons including frozen questions/hints/feedback/optional tasks, relevant full source pages, selected slide text/XML/images and full02/05 references. First establish each section's prior understanding, introduced question/purpose, meaningful observation, developed explanation and independent demand now taught. Distinguish deliberate teacher wording from shorthand that needed spoken explanation. Do not start generically with 'in lesson06' or reuse an opening template. Preserve Alberta Biology30 depth and Canadian English; no shortening quota.\n\nLesson06: connect the known complete-dominance model to a concrete contrasting heterozygote observation. Define what students are comparing before naming incomplete dominance. Show exact source-supported parents, heterozygotes and next-generation results, guide noticing, explain why expression differs without alleles blending. Develop the contribution grid step by step and connect genotype grouping to phenotype grouping. Contrast codominance with a purposeful accurate roan/other source visual and explain both expressed versus an intermediate phenotype, including same-cell expression where relevant. Define notation before use. Retain full worked reasoning for changed parental crosses, probabilities, expected counts, distinctions and scientific qualifications required by frozen tasks, without simply reproducing their numerical answers. If source clinical examples are unsuitable, keep instructional function through an accurately stated non-clinical model and flag the source issue separately. Prepare the existing optional source response or explicitly sequence a later prerequisite before it.\n\nLesson07: introduce the apparent puzzle of several allele versions in a population but only two allele copies at the ordinary diploid autosomal locus in one person. Build standard ABO allele-to-antigen/phenotype relationships in ordinary language, connect to codominance and complete dominance over i, and introduce notation meaningfully. Account for all six unordered genotypes and four phenotypes; explain uncertain A/B genotypes and how parent information resolves them. Walk through the locked original ABO square visually, explaining each outside gamete and interior pair, phenotype interpretation and denominator. Work a genuinely taught second parental combination and evidence-constrained family example while preserving frozen assessment distinctness where feasible; flag unavoidable overlap honestly. Teach every current probability/conditional/expected-count demand before practice and specify assumptions. No clinical transfusion or definitive relationship conclusions. Conclude naturally towards inheritance where locus position on sex chromosomes changes the model.\n\nReturn COMPLETE learner copy separately from source notes, assets and integration instructions. Important visual: purpose, specific viewing prompt, explanation of significance. Definitions support causal teaching rather than glossary dumps. Essential learning is not hidden in accordions. Natural context/observation/explanation transitions, full quantitative reasoning, explanatory feedback and guided/independent preparation. No fabricated media URLs, source facts or private claims.\n\nRewrite ONLY the four outer blocks per lesson defined in contracts/REPLACEMENT_BOUNDARIES.json. Exact opening tags/IDs/edit-key pairs/classes and every locked nested figure/task stay byte-exact. Preserve existing vocabulary connections; only add native button.bio-term links to verified current data-term-id values. Everything outside teaching intervals remains unchanged: header, guided/independent practice, notes, videos, assessments/options/keys/feedback, course data, other lessons, styling/fonts/buttons, reader, labeling, storage/progress/print. No new runtime, style, script, form/save field, scoring, namespace or API. Native fragment uses existing layout components. Selected accurate original visual assets can be added at ./assets/teaching-batch2-v010/ with exact original bytes and source identity. Existing figure assets/controls remain exact. Native semantic tables may support explanation.\n\nDeliver one complete downloadable Biology30_CH17_Batch06_07_Teacher_Transfer_v0.1.0.zip containing manuscripts/lesson-06.md and lesson-07.md, matching lesson-06.teaching-fragment.html and lesson-07.teaching-fragment.html, TEACHING_SEQUENCE.md, SOURCE_VISUAL_MAP.json, actual assets/teaching-batch2-v010/*, CONTENT_REVIEW.md, PRACTICE_PREPARATION_MAP.json for every frozen demand, INTEGRATION_MAP.json with attached whole owner/interval hashes, CHANGELOG.md, OPEN_ISSUES.md, AUTHORING_EVIDENCE.md, MANIFEST.json (path/bytes/SHA256 for every payload) and CHECKSUMS.sha256. Full reading manuscripts include unchanged native optional activities with voluntary hint/model texts, clearly outside authoring boundary. No checkpoint-only outlines. Verify source fidelity, actual pixels, science, first-time-learner explanation, notation before use, protected contracts and ZIP/manifest integrity. Root independently receives/reviews/assembles an isolated comparison; Scout reviews read-only. Self-review is not teacher acceptance. No Mac/GitHub/canonical edits, packaging, deployment or Brightspace claims.\n`);
json('CONTINUATION_AUTHORITY.json', { humanInstruction: 'can you do all that?', scope: 'Remaining Chapter17 teaching in bounded isolated authoring/review/comparison batches', currentBatch: numbers, methodAccepted: true, exactCopyAccepted: false, canonicalIntegrated: false, released: false, ownerSha256: ownerSha });
const walk = (root, visit) => { for (const e of fs.readdirSync(root, { withFileTypes: true }).sort((a,b)=>a.name.localeCompare(b.name))) { const f=path.join(root,e.name); if(e.isDirectory())walk(f,visit);else if(e.isFile())visit(f); } };
const protection = [];
for (const root of [path.join(repo,'projects/biology30-chapter-17/workspace'),path.join(l02,'revision-r1'),path.join(l05,'evaluation'),path.join(previous,'evaluation')]) walk(root,f=>protection.push({file:f,sha256:sha(fs.readFileSync(f))}));
json('contracts/SOURCE_PROTECTION.json',protection);
const files=[]; walk(packet,f=>{const b=fs.readFileSync(f);files.push({file:path.relative(packet,f),bytes:b.length,sha256:sha(b)});});
json('SOURCE_HANDOFF_MANIFEST.json',{version:'batch-06-07-v0.1.0',createdAt:new Date().toISOString(),ownerSha256:ownerSha,files});
const archive=path.join(trial,'Biology30_CH17_Batch06_07_Teacher_Transfer_v0.1.0_Source.zip');
execFileSync('python3',['-c','import pathlib,sys,zipfile\np=pathlib.Path(sys.argv[1])\nwith zipfile.ZipFile(sys.argv[2],"x",zipfile.ZIP_DEFLATED) as z:\n for f in sorted(p.rglob("*")):\n  if f.is_file():z.write(f,f.relative_to(p))',packet,archive]);
const b=fs.readFileSync(archive); if(b.length>20*1024*1024)throw Error('Packet too large; split before upload.');
console.log(JSON.stringify({packet,archive,bytes:b.length,sha256:sha(b),ownerSha256:ownerSha,files:files.length+1,protectedFiles:protection.length,lessons:contracts.map(c=>({id:c.lessonId,beforeSha256:c.beforeSha256,startByte:c.startByte,endByteExclusive:c.endByteExclusive}))},null,2));
