import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { load } from 'cheerio';

// Frozen authoring packet only. No workspace, previous candidate or runtime writes.
const repo = process.cwd();
const base = path.join(repo, 'projects/biology30-chapter-17/meta/teaching-overhaul/2026-10-04-exemplar-transfer');
const l02 = path.join(base, 'teacher-led-trial-v0.4.0');
const l05 = path.join(base, 'teacher-led-transfer-l05-v0.1.0');
const trial = path.join(base, 'teacher-led-batch-01-03-04-v0.1.0');
const packet = path.join(trial, 'source-handoff');
const owner = path.join(l05, 'evaluation/new/index.html');
const ownerDir = path.dirname(owner);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const html = fs.readFileSync(owner, 'utf8');
const ownerSha = hash(html);
if (ownerSha !== '0814977d9fb4ba41d611f2816e50e01d7950a0d5caaba9f422a410bf0f6e0783') throw Error('Current comparison owner drifted. Reconcile first.');
if (fs.existsSync(trial)) throw Error('Batch exists. Preserve it and choose a new version.');
const write = (file, bytes) => {
  const target = path.join(packet, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes, { flag: 'wx' });
};
const json = (file, value) => write(file, JSON.stringify(value, null, 2) + '\n');
const $ = load(html, { sourceCodeLocationInfo: true });
const raw = e => html.slice(e.sourceCodeLocation.startOffset, e.sourceCodeLocation.endOffset);
const numbers = ['01', '03', '04'];
const contracts = [];
write('current/index.html', html);
for (const n of ['01', '02', '03', '04', '05', '06']) write(`current/lesson-${n}.html`, raw($(`#lesson-${n}`)[0]));
for (const n of numbers) {
  const lesson = $(`#lesson-${n}`)[0];
  const parts = $(`#lesson-${n} > .p2-topic`).children().toArray();
  if (parts[0].tagName !== 'header' || parts[5].attribs.id !== `ch17-l${n}-guided`) throw Error(`Unexpected boundary lesson-${n}`);
  const teaching = parts.slice(1, 5);
  if (teaching.some(e => !e.attribs.id?.startsWith(`ch17-l${n}-`))) throw Error(`Unexpected teaching owner lesson-${n}`);
  const start = teaching[0].sourceCodeLocation.startOffset;
  const end = teaching.at(-1).sourceCodeLocation.endOffset;
  const fragment = html.slice(start, end);
  write(`current/lesson-${n}.teaching-fragment.html`, fragment);
  write(`current/lesson-${n}.protected-header.html`, raw(parts[0]));
  write(`current/lesson-${n}.protected-suffix.html`, html.slice(parts[5].sourceCodeLocation.startOffset, lesson.sourceCodeLocation.endOffset));
  contracts.push({
    lessonId: `lesson-${n}`, title: $(`#lesson-${n} h1`).first().text(),
    startCharacter: start, endCharacterExclusive: end,
    startByte: Buffer.byteLength(html.slice(0, start)), endByteExclusive: Buffer.byteLength(html.slice(0, end)),
    beforeSha256: hash(fragment), preservedOuterTags: teaching.map(e => raw(e).slice(0, raw(e).indexOf('>') + 1)),
    preserveIds: teaching.map(e => e.attribs.id),
    editKeyPairs: $(teaching).find('[data-canvas-helper-edit-key], [data-edit-key]').add($(teaching).filter('[data-canvas-helper-edit-key], [data-edit-key]')).toArray().map(e => ({ id: e.attribs.id, editKey: e.attribs['data-canvas-helper-edit-key'], nativeEditKey: e.attribs['data-edit-key'] })),
    existingVocabularyIds: [...new Set($(teaching).find('[data-term-id]').toArray().map(e => e.attribs['data-term-id']))],
    protectedNoteIds: $(`#lesson-${n} textarea[data-note-input]`).toArray().map(e => e.attribs.id),
    immutableTeachingSubsections: $(teaching).find('section[id]:has(textarea[data-note-input])').toArray().map(e => ({ id: e.attribs.id, sha256: hash(raw(e)), completeSection: raw(e) })),
    suffixSha256: hash(html.slice(parts[5].sourceCodeLocation.startOffset, lesson.sourceCodeLocation.endOffset))
  });
}
json('contracts/REPLACEMENT_BOUNDARIES.json', { version: 'batch-01-03-04-v0.1.0', owner, ownerSha256: ownerSha, lessons: contracts,
  protected: ['All bytes outside the three exact teaching intervals', 'All original outer tags/edit keys and any complete saved-task sections inside them', 'All headers, guided practice, optional responses, videos, required assessments, options, keys, feedback and native data', 'Lessons 02 and 05 references and all other lessons', 'Every runtime, CSS, font, reader, vocabulary, labeling, save/progress and print contract'],
  integrationScope: 'Isolated comparison only; no canonical integration or release', freshOriginRequired: true });
json('contracts/NATIVE_DATA.json', $('script[type="application/json"]').toArray().map(e => ({ id: e.attribs.id, text: $(e).text() })));
const assetPaths = new Set();
for (const n of ['01', '03', '04', '02', '05']) {
  for (const e of $(`#lesson-${n} img[src]`).toArray()) {
    const relative = e.attribs.src.replace(/^\.\//, '');
    if (relative.startsWith('assets/')) assetPaths.add(relative);
  }
}
for (const file of assetPaths) write(`current/${file}`, fs.readFileSync(path.join(ownerDir, file)));
write('reference/lesson-02.md', fs.readFileSync(path.join(l02, 'revision-r1/lesson-02.md')));
write('reference/lesson-02.teaching-fragment.html', fs.readFileSync(path.join(l02, 'revision-r1/lesson-02.teaching-fragment.html')));
write('reference/lesson-02-COPY_CHANGES.json', fs.readFileSync(path.join(l02, 'revision-r1/COPY_CHANGES.json')));
const return5 = path.join(l05, 'pro-return/Biology30_CH17_Lesson05_Teacher_Transfer_v0.1.0');
for (const file of ['manuscripts/lesson-05.md', 'lesson-05.teaching-fragment.html', 'TEACHING_SEQUENCE.md', 'SOURCE_VISUAL_MAP.json']) write(`reference/l05/${file}`, fs.readFileSync(path.join(return5, file)));
write('reference/l05/SCOUT_RETURN_REVIEW.md', fs.readFileSync(path.join(l05, 'SCOUT_RETURN_REVIEW.md')));
for (const file of ['02_TEACHING_STANDARD.md', 'CHAPTER11_TEACHING_STANDARD.md']) write(`standards/${file}`, fs.readFileSync(path.join(base, file)));
const source = path.join(l02, 'source-handoff/sources');
const ppt = path.join(source, 'original-114-slides.pptx');
write('sources/original-114-slides.pptx', fs.readFileSync(ppt));
write('sources/chapter-17.pdf', fs.readFileSync(path.join(source, 'chapter-17.pdf')));
const unzip = member => execFileSync('unzip', ['-p', ppt, member], { maxBuffer: 30 * 1024 * 1024 });
const slides = [];
for (const n of [...Array.from({ length: 12 }, (_, i) => i + 1), ...Array.from({ length: 8 }, (_, i) => i + 26)]) {
  const xml = unzip(`ppt/slides/slide${n}.xml`);
  const relBytes = unzip(`ppt/slides/_rels/slide${n}.xml.rels`);
  const x = load(xml.toString(), { xmlMode: true });
  const r = load(relBytes.toString(), { xmlMode: true });
  const rels = new Map(r('Relationship').toArray().map(e => [e.attribs.Id, e.attribs.Target]));
  const images = [];
  for (const e of x('a\\:blip').toArray()) {
    const target = rels.get(e.attribs['r:embed']);
    if (!target) continue;
    const member = path.posix.normalize(path.posix.join('ppt/slides', target));
    const file = `sources/slide-assets/slide-${n}-${path.basename(member)}`;
    const bytes = unzip(member);
    if (!fs.existsSync(path.join(packet, file))) write(file, bytes);
    images.push({ relationshipId: e.attribs['r:embed'], archiveMember: member, file, bytes: bytes.length, sha256: hash(bytes), pixelReviewStatus: 'not yet reviewed in this batch' });
  }
  write(`sources/slide-xml/slide-${n}.xml`, xml);
  write(`sources/slide-xml/slide-${n}.xml.rels`, relBytes);
  slides.push({ slide: n, text: x('a\\:t').toArray().map(e => x(e).text()), images });
}
json('sources/SELECTED_SLIDES.json', slides);
write('sources/SOURCE_LOCATORS.md', `# Batch 01/03/04 source locators\n\nOriginal PPT has114slides. Actual slides1–12 introduce selective breeding, why inheritance needs explanation, gene/allele, genotype/phenotype and allele combinations. Slides26–30 apply single-trait crosses to the defined mouse-fur model, including changed parental genotypes and a next-generation question. Slides31–32 introduce technical testcrosses and the evidence asymmetry;33 recaps. Slides13–25 belong to the retained lesson02 reference;34 onward begins the retained lesson05. Original OOXML relationships, extracted image bytes and text are supplied. Inspect actual pixels, not prior QuickLook image associations.\n\nPDF has38pages. Printed584 mapsPDF1, so printed page minus583 gives PDFpage. Lesson01's native reader links586/587; supporting explicit definitions and genotype rules occur590. Read584,586–590 for context and actual figures. Lesson03 reader589–591; reviewFigure17.7 on590 and its continuation591. Lesson04 reader590–591; technical testcrossFigure17.9 is591. Do not assign physical experiments, invent new observations, or expand to the cumulative review.\n\nHistorical slide7 uses human eye colour as a simple B/b Mendelian model and says dominance is always expressed. Do not teach that picture/example as verified actual single-gene human-eye inheritance. Preserve the teacher's concrete-comparison and parent-contribution functions using an accurately defined pea/mouse model and selected fitting source visual. Do not claim all traits have two allele versions, that every gene has complete dominance, or that dominant means common/stronger/preferentially inherited. Scope ordinary diploid autosomal locus statements. Slide8's phenotype includes physiological/behavioural expression, not only appearance. Do not reproduce private teacher/child biological claims or identify a child from photographs.\n\nMonohybrid terminology differs between textbook (one trait broadly) and slide28 (two heterozygotes). Define the actual cross/parental genotypes explicitly rather than infer a universal3:1 from the label. Slides27–30 introduce each symbol/parental change before calculation; native lesson03 also requires probability products for specified independent offspring and expected counts. Give additional explanatory reasoning where the slides omit it. Finite counts are not scheduled outcomes.\n\nSlide31's all-dominant expectation is not proof of homozygosity from a finite sample;32 explicitly qualifies this. A verified recessive offspring establishes contribution of the recessive allele under the stated model. Absence of such offspring only changes evidence strength. Current lesson04's teaching uses B_×bb but one paragraph says aaoffspring: correct to bb within the authorized teaching fragment and document it. Keep all protected original tasks, keys and IDs unchanged; flag any contradiction outside the boundary rather than editing it.\n\nEssential support must be visible at its point of use. Source visual specifications alone are not images. Native tables are permitted if they explain real allele contributions without introducing an interface or script. No new images generated in this batch; actual source bytes only, with precise source identity and pixel-review status.\n`);
json('CONTINUATION_AUTHORITY.json', {
  humanInstruction: 'ok so i like this method can we do this for the rest of the lessons?', recordedAt: new Date().toISOString(),
  scope: 'Remaining Chapter17 lessons in bounded authoring/review/comparison batches. This batch is01/03/04.',
  references: ['lesson02 v0.4.0-r1', 'lesson05 teacher-led transfer v0.1.0'], ownerSha256: ownerSha,
  methodAccepted: true, exactRemainingCopyAccepted: false, canonicalIntegrated: false, released: false, universalStandardPromoted: false,
  proposedFollowingBatches: [['06', '07'], ['08', '09'], ['10', '11'], ['12', '13'], ['14', '15']],
  clarification: 'Approval to proceed and use the teaching method; not automatic acceptance of every returned manuscript.'
});
json('CHAPTER_INVENTORY.json', Array.from({ length: 15 }, (_, i) => String(i + 1).padStart(2, '0')).map(n => ({ lessonId: `lesson-${n}`, title: $(`#lesson-${n} h1`).first().text(), sha256: hash(raw($(`#lesson-${n}`)[0])), status: numbers.includes(n) ? 'this authoring batch' : ['02', '05'].includes(n) ? 'retained reference' : 'later batch, not newly authored' })));
write('AUTHORING_TASK.md', `# Complete Chapter17 batch01/03/04 teacher-led manuscripts v0.1.0\n\nDean liked the complete lesson05 comparison and explicitly asked to use this method for the rest of the lessons. Author remaining Chapter17 only, in bounded batches. This packet owns the first batch: lesson01 Genes, alleles, genotype and phenotype; lesson03 Single-trait crosses and probability; lesson04 Test crosses and unknown genotypes. Supersede stale scopes and old owners in the conversation. Complete current native owner SHA256 ${ownerSha} contains unchanged corrected lesson02r1 and complete lesson05v010. Both are teaching references, not license to copy their openings/headings or start each lesson with an internal route code. No canonical integration/release.\n\nRead complete standards, full three current lessons, exact protected contracts, relevant source slides/assets/PDF and both references. First record the connected chapter progression and section-level sequence for each of the three lessons: prior knowledge, introduction and purpose, exact observation/noticing, explanation developed from it, independent demand now possible. Then return COMPLETE manuscripts/native fragments and every specified deliverable. No outline-only checkpoint or shortened later lesson to fit a response. If genuinely blocked, name exact evidence/boundary rather than writing from stale sources.\n\nTransfer the teacher's instructional functions: introduce the biological question, provide a meaningful concrete example/visual, guide noticing, then build the explanation. Keep respectful high-school Alberta Biology30 Canadian English, full causal and quantitative depth, natural transitions and conceptual chunks. Terms have meaningful first use and explanation in prose; popups support rather than substitute. Every important visual gets purpose, specific viewing instruction and interpreted significance. Essential learning stays visible. No generic 'in lesson01' language, forced excitement, slogan, audit/source/developer narration or copied hook template.\n\nLesson01: use selective breeding/contrasting organisms to explain why inheritance matters before introducing gene/allele distinctions. Scope the diploid autosomal model, connect chromosomes and corresponding loci to parental contributions without pre-teaching lesson02's experiment or later DNA mechanisms. Build genotype versus phenotype through an accurately defined concrete model and purposeful visual; distinguish gene identity, allele version and allele copy. Develop homozygous/heterozygous and the three two-allele genotypes; explain case notation, complete dominance as heterozygote expression, what phenotype can/cannot determine. Include full worked reasoning and preparation for every frozen native task. Use source eye-colour/child images only as historical evidence in developer notes, not accurate single-gene inheritance or private-person claims. Introduce Mendel's experimental question naturally at closure.\n\nLesson03: connect Mendel's allele contributions to a question about predicting new offspring, without retelling all lesson02. Use source mouse-fur model, define B/b and every parental genotype before the cross. Explain segregation/gamete type probabilities, sperm/egg grid orientation, each cell as a contribution pair, genotype grouping versus phenotype grouping. Progress from heterozygous×recessive to heterozygous×heterozygous and changed homozygous×heterozygous; interpret the teacher's children/grandchildren comparison explicitly. Teach required probability operations for specified independent births, non-overlapping alternatives, expected number from probability×sample size, finite-sample variation and independent trials before frozen practice. Ratios are model/cross-specific, not a magical consequence of 'monohybrid'. Avoid isomorphic answer leakage from current protected checks. Close with the question of what to do when a parent's genotype is unknown.\n\nLesson04: begin with dominant appearance leaving an unknown allele pair; show the two compatible hypotheses before introducing the technical testcross. Explain why a homozygous recessive tester supplies a known allele, build and compare both hypotheses visually, and trace a recessive offspring's contributions backward. Qualify why a finite all-dominant sample does not prove homozygosity; preserve useful probability evidence and current family-information reasoning. Repair the B/b versus aa teaching typo only inside authorized content. Reason from evidence before forward prediction; preserve fair preparation for frozen questions without answering them by letter-only substitution. Conclude why the test reveals an otherwise-hidden allele and connect naturally to examining two characteristics together in the already retained lesson05.\n\nRewrite ONLY the four outer teaching blocks per lesson in contracts/REPLACEMENT_BOUNDARIES.json. Preserve exact opening tags, IDs, edit-key pairs, native classes and existing vocabulary connections. Preserve byte-for-byte every complete saved-task subsection, if present, regardless of placement. EVERYTHING outside those intervals remains exact: headers, guided practice, videos, required and optional source assessments/responses, keys/feedback/data, other lessons including02/05, reader/vocab/labeling/runtime/style/font/navigation/save/progress/print. No new field, assessment, storage schema, grading, script/CSS, or API. Use only existing native vocabulary IDs where added links aid understanding. Do not copy disabled reading controls into native fragment. Keep approved native visuals and their locked controls/mappings; source-selected assets may be added at ./assets/teaching-batch1-v010/ with exact original bytes. New native tables may explain reasoning using existing styles. No generated graphics, invented media URLs or video changes. Do not mechanically reproduce the historical source errors.\n\nDeliver one complete downloadable ZIP named Biology30_CH17_Batch01_03_04_Teacher_Transfer_v0.1.0.zip containing manuscripts/lesson-01.md,lesson-03.md,lesson-04.md; three matching lesson-NN.teaching-fragment.html; TEACHING_SEQUENCE.md; SOURCE_VISUAL_MAP.json; actual selected assets/teaching-batch1-v010/*; CONTENT_REVIEW.md; PRACTICE_PREPARATION_MAP.json identifying where every frozen demand is taught without answer leakage; INTEGRATION_MAP.json against exact attached whole owner and all3 original intervals; CHANGELOG.md; OPEN_ISSUES.md; AUTHORING_EVIDENCE.md; MANIFEST.json with all payload sizes/SHA256 and CHECKSUMS.sha256. Complete reading manuscripts include relevant unchanged optional activities with all voluntary hint/model text, clearly outside authoring boundary when appropriate. Markdown inert controls are okay; native fragments remain functional. Keep learner copy separate from developer/source records.\n\nReview complete source fidelity, science, actual pixels, first-time-learner reasoning, definitions/symbols before independent use, all meaningful steps/results, no internal codes, fair current assessment preparation and byte-exact contracts. Record actual reviewed files and missing evidence honestly. Self/assistant review is not independent teacher acceptance. Verify finalZIPCRC/manifests and give actualsize/hash/downloadlink. Root owns receipt, full copy review, bounded isolated native assembly, focused saved-work compatibility checks and comparison. Scout provides independent read-only review. No Mac/GitHub/canonical/course edits, deployment, SCORM packaging or Brightspace acceptance.\n`);
const protection = [];
const walk = (root, visit) => {
  for (const e of fs.readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const f = path.join(root, e.name);
    if (e.isDirectory()) walk(f, visit);
    else if (e.isFile()) visit(f);
  }
};
for (const root of [path.join(repo, 'projects/biology30-chapter-17/workspace'), l02, l05]) walk(root, f => protection.push({ file: f, sha256: hash(fs.readFileSync(f)) }));
json('contracts/SOURCE_PROTECTION.json', protection);
const inventory = [];
walk(packet, f => { const bytes = fs.readFileSync(f); inventory.push({ file: path.relative(packet, f), bytes: bytes.length, sha256: hash(bytes) }); });
json('SOURCE_HANDOFF_MANIFEST.json', { version: 'batch-01-03-04-v0.1.0', createdAt: new Date().toISOString(), ownerSha256: ownerSha, files: inventory });
const archive = path.join(trial, 'Biology30_CH17_Batch01_03_04_Teacher_Transfer_v0.1.0_Source.zip');
execFileSync('python3', ['-c', 'import pathlib,sys,zipfile\np=pathlib.Path(sys.argv[1])\nwith zipfile.ZipFile(sys.argv[2],"x",zipfile.ZIP_DEFLATED) as z:\n for f in sorted(p.rglob("*")):\n  if f.is_file():z.write(f,f.relative_to(p))', packet, archive]);
const bytes = fs.readFileSync(archive);
if (bytes.length > 20 * 1024 * 1024) throw Error('Packet exceeds20MiB; split before upload.');
console.log(JSON.stringify({ packet, archive, bytes: bytes.length, sha256: hash(bytes), ownerSha256: ownerSha, files: inventory.length + 1, protectedFiles: protection.length, lessons: contracts.map(c => ({ id: c.lessonId, beforeSha256: c.beforeSha256, startByte: c.startByte, endByteExclusive: c.endByteExclusive })) }, null, 2));
