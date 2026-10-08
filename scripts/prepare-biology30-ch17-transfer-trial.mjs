import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { load } from 'cheerio';

// This exports a frozen proposal packet, never learner workspace or old trials.
const repo = process.cwd();
const base = path.join(repo, 'projects/biology30-chapter-17/meta/teaching-overhaul/2026-10-04-exemplar-transfer');
const reference = path.join(base, 'teacher-led-trial-v0.4.0');
const trial = path.join(base, 'teacher-led-transfer-l05-v0.1.0');
const packet = path.join(trial, 'source-handoff');
const owner = path.join(reference, 'evaluation/new/index.html');
const digest = data => crypto.createHash('sha256').update(data).digest('hex');
const html = fs.readFileSync(owner, 'utf8');
const ownerSha = digest(html);
if (ownerSha !== '71518705941a86809c7f28593664763e59c7867511e3ae699ec1007bfe109bad') throw new Error('Reference owner changed; reconcile before export.');
if (fs.existsSync(trial)) throw new Error('Preserve existing trial; export a new version rather than overwrite.');
const write = (file, bytes) => {
  const target = path.join(packet, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes, { flag: 'wx' });
};
const json = (file, value) => write(file, JSON.stringify(value, null, 2) + '\n');
const $ = load(html, { sourceCodeLocationInfo: true });
const raw = e => html.slice(e.sourceCodeLocation.startOffset, e.sourceCodeLocation.endOffset);
const parts = $('#lesson-05 > .p2-topic').children().toArray();
const teaching = parts.slice(1, 5);
const start = teaching[0].sourceCodeLocation.startOffset;
const end = teaching.at(-1).sourceCodeLocation.endOffset;
write('current/index.html', html);
for (const number of ['01', '02', '03', '04', '05', '06']) write(`current/lesson-${number}.html`, raw($(`#lesson-${number}`)[0]));
write('current/lesson-05.teaching-fragment.html', html.slice(start, end));
write('current/lesson-05.protected-header.html', raw(parts[0]));
write('current/lesson-05.protected-suffix.html', html.slice(parts[5].sourceCodeLocation.startOffset, $('#lesson-05')[0].sourceCodeLocation.endOffset));
write('reference/lesson-02.md', fs.readFileSync(path.join(reference, 'revision-r1/lesson-02.md')));
write('reference/lesson-02.teaching-fragment.html', fs.readFileSync(path.join(reference, 'revision-r1/lesson-02.teaching-fragment.html')));
write('reference/COPY_CHANGES.json', fs.readFileSync(path.join(reference, 'revision-r1/COPY_CHANGES.json')));
for (const file of fs.readdirSync(path.join(reference, 'assets/teaching-v040'))) write(`reference/assets/teaching-v040/${file}`, fs.readFileSync(path.join(reference, 'assets/teaching-v040', file)));
const optional = $('#lesson-05 textarea[data-note-input]').toArray().map(e => {
  const section = $(e).closest('section[id]')[0];
  return { id: e.attribs.id, sectionId: section.attribs.id, title: $(section).find('h2,h3').first().text(), textarea: raw(e), completeSection: raw(section) };
});
json('contracts/OPTIONAL_NOTES.json', optional);
json('contracts/NATIVE_DATA.json', $('script[type="application/json"]').toArray().map(e => ({ id: e.attribs.id, text: $(e).text() })));
json('contracts/REPLACEMENT_BOUNDARY.json', {
  version: 'l05-v0.1.0', owner, ownerSha256: ownerSha,
  startCharacter: start, endCharacterExclusive: end,
  startByte: Buffer.byteLength(html.slice(0, start)), endByteExclusive: Buffer.byteLength(html.slice(0, end)),
  beforeSha256: digest(html.slice(start, end)),
  preserveIds: teaching.map(e => e.attribs.id), optionalNoteIds: optional.map(e => e.id),
  protected: ['lesson-05 header and guided-practice onward, byte-identical', 'both complete optional saved-task sections, including every prompt, table, hint, model and control', 'all other lessons including accepted lesson-02 reference', 'all required assessments, options, keys, feedback and embedded native data', 'all runtime, CSS, fonts, reader, vocabulary, labeling and saving/progress behaviour'],
  freshOriginRequired: true, integrationScope: 'Separate lesson-05 working comparison only; no canonical integration or release.'
});
json('REFERENCE_ACCEPTANCE.json', {
  recordedAt: new Date().toISOString(), humanInstruction: 'ok lets do it then',
  precedingUserQuestion: 'Ok so how do we take what we did here and do it with all the lessons ?',
  leadInterpretationDisclosed: 'Approval to use revised lesson 2 as the authoring reference and proceed to lesson 5 as the next transfer trial.',
  referenceVersion: 'lesson-02 v0.4.0-r1', ownerSha256: ownerSha,
  fragmentSha256: digest(fs.readFileSync(path.join(reference, 'revision-r1/lesson-02.teaching-fragment.html'))),
  manuscriptSha256: digest(fs.readFileSync(path.join(reference, 'revision-r1/lesson-02.md'))),
  scope: 'Authoring reference and next isolated trial only.',
  canonicalIntegrated: false, released: false, universalStandardPromoted: false,
  newLessonTeacherAccepted: false
});
const progression = [
  ['01','Use allele pairs and phenotype rules to distinguish appearance from inherited combinations.'],
  ['02','Use the experiment and chromosome account to explain preservation and segregation of alleles.'],
  ['03','Turn single-locus contributions into justified probabilities and expected counts.'],
  ['04','Use recessive offspring evidence to constrain an unknown parental genotype.'],
  ['05','Combine two loci, justify independence, vary grid dimensions and infer parental alleles before prediction.'],
  ['06','Change the heterozygote phenotype rule without abandoning segregation.'],
  ['07','Distinguish population allele diversity from the two alleles carried by a diploid individual.'],
  ['08','Track sex-chromosome inheritance and its consequences for genotype and expression.'],
  ['09','Explain the limits of a simple one-gene phenotype model.'],
  ['10','Infer compatible autosomal inheritance models from family evidence.'],
  ['11','Evaluate sex-linked family patterns and limits of inference.'],
  ['12','Revisit the independence assumption using linked loci and recombinant offspring.'],
  ['13','Interpret recombination frequencies as evidence for relative gene positions.'],
  ['14','Use genetic evidence and its uncertainty in testing and counselling decisions.'],
  ['15','Bring the models together and select a justified method for a new inheritance problem.']
];
json('CHAPTER_PROGRESSION.json', {
  status: 'Lead proposed instructional map grounded in actual routes; not a verified all-lesson outcome audit.',
  centralQuestion: 'How can inherited allele contributions explain offspring patterns, and what can those patterns tell us about an inheritance model?',
  lessons: progression.map(([n, job]) => ({ id: `lesson-${n}`, actualTitle: $(`#lesson-${n} h1`).first().text(), instructionalJob: job, currentTextSha256: digest(raw($(`#lesson-${n}`)[0])) })),
  nextGate: 'Review complete lesson-05 transfer candidate before remaining chapter authoring.',
  proposedLaterBatches: [['lesson-01','lesson-03','lesson-04'],['lesson-06','lesson-07'],['lesson-08','lesson-09'],['lesson-10','lesson-11'],['lesson-12','lesson-13'],['lesson-14','lesson-15']],
  warning: 'Do not extend this trial automatically or claim those later batches are authored.'
});
const sourceRoot = path.join(reference, 'source-handoff/sources');
write('sources/chapter-17.pdf', fs.readFileSync(path.join(sourceRoot, 'chapter-17.pdf')));
const ppt = path.join(sourceRoot, 'original-114-slides.pptx');
const pptBytes = fs.readFileSync(ppt);
if (digest(pptBytes) !== 'da1ce1c0526da4da1aefd1fb6c0f23070f820ce24378c12f9699d1c700e1a985') throw new Error('Original deck mismatch.');
write('sources/original-114-slides.pptx', pptBytes);
const unzip = member => execFileSync('unzip', ['-p', ppt, member], { maxBuffer: 30 * 1024 * 1024 });
const slides = [];
for (let number = 34; number <= 48; number++) {
  const xml = unzip(`ppt/slides/slide${number}.xml`);
  const x = load(xml.toString(), { xmlMode: true });
  const relBytes = unzip(`ppt/slides/_rels/slide${number}.xml.rels`);
  const r = load(relBytes.toString(), { xmlMode: true });
  const rels = new Map(r('Relationship').toArray().map(e => [e.attribs.Id, e.attribs.Target]));
  const images = [];
  for (const e of x('a\\:blip').toArray()) {
    const target = rels.get(e.attribs['r:embed']);
    if (!target) continue;
    const member = path.posix.normalize(path.posix.join('ppt/slides', target));
    const file = `sources/slide-assets/slide-${number}-${path.basename(member)}`;
    const bytes = unzip(member);
    if (!fs.existsSync(path.join(packet, file))) write(file, bytes);
    images.push({ relationshipId: e.attribs['r:embed'], archiveMember: member, file, bytes: bytes.length, sha256: digest(bytes) });
  }
  write(`sources/slide-xml/slide-${number}.xml`, xml);
  write(`sources/slide-xml/slide-${number}.xml.rels`, relBytes);
  slides.push({ slide: number, text: x('a\\:t').toArray().map(e => x(e).text()), images });
}
json('sources/SLIDES_34_48.json', slides);
const nativeImages = [];
for (const e of $('#lesson-05 img[src]').toArray()) {
  const src = e.attribs.src;
  if (!src.startsWith('./assets/') && !src.startsWith('assets/')) continue;
  const relative = src.replace(/^\.\//, '');
  const bytes = fs.readFileSync(path.join(reference, 'evaluation/new', relative));
  write(`current/${relative}`, bytes);
  nativeImages.push({ src, file: `current/${relative}`, bytes: bytes.length, sha256: digest(bytes), alt: e.attribs.alt });
}
json('contracts/NATIVE_IMAGES.json', nativeImages);
write('sources/SOURCE_LOCATORS.md', `# Lesson 5 source locators and cautions\n\nActual teacher PowerPoint slides 34–48: two-trait question, tall/short and green/yellow pods; P/F1/F2; second law; chromosome orientations; tomato four-by-two cross; squash evidence followed by prediction; recap. Slide 49 introduces the next topic and is outside this lesson's authoring scope. Read actual OOXML relationships and pixels, not Quick Look image associations.\n\nTextbook PDF begins at printed584. Lesson's existing reader points to printed591–593 = PDF8–10. Independent assortment starts at bottom591 and continues593; printed592 and the continuation below593 contain a physical investigation, NOT new learner tasks. Printed596–597 = PDF13–14 supplies the chromosome explanation. Read the actual diagrams visually because extracted text has CID glyphs. The historical caption's “for any dihybrid cross” is overbroad:9:3:3:1 requires the specified heterozygote cross, complete dominance at both independent loci and the expression/survival assumptions. Underscores denote either allele at the SAME locus, not any of four alleles.\n\nSlide41 says notes on meiosisII while explicitly discussing metaphaseI. Independent orientation of homologous pairs occurs at metaphaseI; meiosisII separates sisters. In plants, meiosis produces haploid spores before stages leading to gametes. Explain the necessary connection without a premature life-cycle detour. Distinguish assortment within each parent from random fertilisation between parents.\n\nSlide47 accidentally switches fruit colour/shape to flowers. Retain fruit phenotypes, the original wwDd×Wwdd method and expected40white-fruit/20yellow-spherical among80plants, with finite-sample qualification. Do not silently alter the historical source.\n\nThe native branch diagram has allele letters AND bottom location letters; explain their different jobs, preserve locked label mappings. Current protected assessments are the revised v0.3.0 questions, not older historical prompts in this conversation. The exact current full owner and immutable contracts are attached.\n`);
for (const file of ['02_TEACHING_STANDARD.md', 'CHAPTER11_TEACHING_STANDARD.md']) write(`standards/${file}`, fs.readFileSync(path.join(base, file)));
write('AUTHORING_TASK.md', `# Chapter17 lesson5 teacher-led transfer trial v0.1.0\n\nDean authorized proceeding from the complete revised lesson2 reference to lesson5 and then, after evaluating transfer, bounded remaining-chapter passes. This packet supersedes earlier lesson5 and lesson2 message scopes. It is a proposal-only authoring trial, not canonical integration or release.\n\nRead the complete source packet and standards before writing. Inspect source slides/pixels and relevant PDF diagrams. Current index.html SHA256 ${ownerSha} is attached so you can verify the exact owner, boundary and protected bytes yourself. Existing full lesson5 is useful depth to preserve, NOT the desired voice to reproduce unchanged. Accepted lesson2 reference is v0.4.0-r1, with Dean's rejection of generic “In lesson01…” wording reflected in COPY_CHANGES.json. Use its teaching functions, not copied nervous-system/genetics paragraphs or identical section titles.\n\nFirst establish the teaching sequence: what students already understand; what the teacher introduces and why; exact visual/feature to notice; explanation justified by observation; independent task now possible. Follow the teacher's authentic progression: why study two characteristics together; concrete pea height/pod contrasts; controlled P cross then F1 then F2 observations in order; explanatory independence question; chromosome orientations and one allele per locus; gamete lists and weights; offspring grid and genotype-versus-phenotype groups; multiplication versus non-overlapping addition; switch explicitly to tomato and explain original four-by-two worked solution; change-parent optional task unchanged; switch explicitly to squash where offspring evidence resolves parental blanks before prediction; unchanged independent evidence task; return to the initial question and briefly introduce where this model changes. Use source caveats accurately where relevant without front-loading every qualification.\n\nNo word quota, abridgement, generic AI-polish, artificial excitement, glossary-first exposition or developer/internal route references in student prose. Do NOT write “in lesson01/lesson05” or mention slides, authoring, missing files, Scout, Pro or audit corrections to students. Name the biological idea or actual titled lesson naturally only if it helps. Every important visual gets an introduction, concrete viewing guidance and an interpreted conclusion. Every symbol, gamete edge, offspring cell and probability operation must have biological meaning before independent use. Essential teaching remains visible and self-contained.\n\nRewrite ONLY the four complete outer teaching blocks in REPLACEMENT_BOUNDARY.json; retain their IDs, edit keys and native classes. Native header and suffix, both COMPLETE original optional-task sections, assessments/options/feedback, all other lessons, course data, scripts, CSS, fonts, vocabulary/reader/label maps and saving/progress remain EXACT. Optional-task placement may follow teaching purpose, but every title, prompt, table, control, hint and model is immutable. No new saved fields, grading, assessment, interaction or runtime. Do not use disabled inert controls in the native fragment. Preserve native vocabulary buttons and use only existing term IDs where meaningful. Existing native image can remain; selected real PPT assets may be added at ./assets/teaching-l05-v010/ with exact original bytes and actual identity. No generated illustrations. If an essential source asset is unavailable, name the gap in developer notes instead of pretending a specification is an image.\n\nDeliver COMPLETE learner manuscript and native fragment, not an outline. Return a downloadable versioned ZIP containing manuscripts/lesson-05.md; lesson-05.teaching-fragment.html; TEACHING_SEQUENCE.md; SOURCE_VISUAL_MAP.json with exact slide/media/printed-PDF locators, original hashes, alt/caption/placement and pixel-review status; selected assets/teaching-l05-v010/*; CHANGELOG.md explaining what moved/why; CONTENT_REVIEW.md covering complete source/science/first-time-reader/assessment preparation review; INTEGRATION_MAP.json against this exact owner and teaching boundary; OPEN_ISSUES.md; MANIFEST.json with file sizes/hashes; CHECKSUMS.sha256; AUTHORING_EVIDENCE.md recording only observed model/source/attachment/return facts. Separate learner copy from developer notes. The Markdown reading copy may use inert note controls, but include every unchanged task and its complete voluntary hint/model.\n\nBefore return, compare the ENTIRE manuscript and native fragment: source fidelity, complete explanation, accurate images, no untaught demand, no internal-code openings, exact optional tasks/protected bytes, no leaked old assessment substitutions. Request targeted revisions where necessary. Do not claim independent review unless genuinely performed or teacher/LMS acceptance from self-review. Return actual ZIP size/SHA256. Codex owns local receipt, independent review, isolated native comparison and focused compatibility checks. No edits to GitHub, Mac paths, canonical course, old trials, deployment or course packaging.\n\nLocal proposed return destination: ${trial}/pro-return. This is a local receiver path, not a claim that browser ChatGPT can write it.\n`);
const protectedFiles = [];
for (const root of [path.join(repo, 'projects/biology30-chapter-17/workspace'), reference]) {
  const walk = dir => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, e.name);
      if (e.isDirectory()) walk(file);
      else if (e.isFile()) protectedFiles.push({ file, sha256: digest(fs.readFileSync(file)) });
    }
  };
  walk(root);
}
json('contracts/SOURCE_PROTECTION.json', protectedFiles);
const inventory = [];
const visit = dir => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(dir, e.name);
    if (e.isDirectory()) visit(file);
    else { const bytes = fs.readFileSync(file); inventory.push({ file: path.relative(packet, file), bytes: bytes.length, sha256: digest(bytes) }); }
  }
};
visit(packet);
json('SOURCE_HANDOFF_MANIFEST.json', { version: 'l05-v0.1.0', createdAt: new Date().toISOString(), ownerSha256: ownerSha, files: inventory });
const archive = path.join(trial, 'Biology30_CH17_Lesson05_Teacher_Transfer_v0.1.0_Source.zip');
execFileSync('python3', ['-c', 'import pathlib,sys,zipfile\np=pathlib.Path(sys.argv[1])\nwith zipfile.ZipFile(sys.argv[2],"x",zipfile.ZIP_DEFLATED) as z:\n for f in sorted(p.rglob("*")):\n  if f.is_file():z.write(f,f.relative_to(p))', packet, archive]);
const archiveBytes = fs.readFileSync(archive);
if (archiveBytes.length > 20 * 1024 * 1024) throw new Error('Archive exceeds 20MiB; split source handoff before uploading.');
console.log(JSON.stringify({ packet, archive, files: inventory.length + 1, bytes: archiveBytes.length, sha256: digest(archiveBytes), ownerSha, protectedFiles: protectedFiles.length }, null, 2));
