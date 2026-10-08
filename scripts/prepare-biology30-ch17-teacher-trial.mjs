import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { load } from 'cheerio';

const repo = process.cwd();
const base = path.join(repo, 'projects/biology30-chapter-17/meta/teaching-overhaul/2026-10-04-exemplar-transfer');
const trial = path.join(base, 'teacher-led-trial-v0.4.0');
const packet = path.join(trial, 'source-handoff');
const evaluation = '/Users/deanguedo/Documents/Codex/2026-10-04/task/source-assessment-trial-v0.3.0/evaluation';
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
const write = (relative, data) => {
  const target = path.join(packet, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, data, { flag: 'wx' });
};
if (fs.existsSync(packet)) throw new Error('Source packet exists; preserve it rather than overwrite.');
fs.mkdirSync(packet, { recursive: true });
const html = fs.readFileSync(path.join(evaluation, 'new/index.html'), 'utf8');
const nativeSha = sha(html);
if (nativeSha !== '20c22d6d80720d04a2924c1a161b35da9ec5d964fea32d1b6c480b96c76fdcf9') throw new Error('Current v0.3.0 index differs from verified comparison owner.');
const $ = load(html, { sourceCodeLocationInfo: true });
const raw = element => {
  const loc = element.sourceCodeLocation;
  if (!loc) throw new Error('Missing source locations.');
  return html.slice(loc.startOffset, loc.endOffset);
};
for (const number of ['01', '02', '03']) write(`current/lesson-${number}.html`, raw($(`#lesson-${number}`)[0]));
const parts = $('#lesson-02>.p2-topic').children().toArray();
const teachingParts = parts.slice(1, 5);
const start = teachingParts[0].sourceCodeLocation.startOffset;
const end = teachingParts.at(-1).sourceCodeLocation.endOffset;
write('current/lesson-02.teaching-fragment.html', html.slice(start, end));
write('current/lesson-02.manuscript.md', fs.readFileSync(path.join(base, 'source-assessment-trial-v0.3.0/pro-return/manuscripts/lesson-02.md')));
write('current/lesson-02.protected-suffix.html', html.slice(parts[5].sourceCodeLocation.startOffset, $('#lesson-02')[0].sourceCodeLocation.endOffset));
const optional = $('#lesson-02 textarea[id^="ch17-kinch-"]').toArray().map(e => ({ id: e.attribs.id, textarea: raw(e), container: raw($(e).closest('[data-note-id],.optional-source-response,.formative-response,.practice-response')[0] ?? e.parent) }));
write('contracts/OPTIONAL_NOTES.json', JSON.stringify(optional, null, 2));
const sectionData = $('script[type="application/json"]').toArray().map(e => ({ id: e.attribs.id, text: $(e).text() }));
write('contracts/NATIVE_DATA.json', JSON.stringify(sectionData, null, 2));
write('contracts/REPLACEMENT_BOUNDARY.json', JSON.stringify({ version: '0.4.0', baseline: nativeSha, owner: path.join(evaluation, 'new/index.html'), startCharacter: start, endCharacterExclusive: end, startByte: Buffer.byteLength(html.slice(0, start)), endByteExclusive: Buffer.byteLength(html.slice(0, end)), beforeSha256: sha(html.slice(start, end)), allowed: 'Only lesson-02 teaching between its unchanged header and protected guided practice.', preserveIds: teachingParts.map(e => e.attribs.id), optionalNoteIds: optional.map(e => e.id), protected: ['all other routes including lesson-05', 'all assessments, options, keys and native embedded data', 'both optional note IDs, titles, controls, prompts, hints and models', 'styles, fonts, runtime, reader, vocabulary and progress'], saveIsolation: 'Serve v0.4.0 on a fresh loopback origin; do not migrate prior saves.' }, null, 2));
write('sources/chapter-17.pdf', fs.readFileSync(path.join(evaluation, 'new/assets/textbook/chapter-17.pdf')));
const ppt = path.join(evaluation, 'source/original-114-slides.pptx');
const pptBytes = fs.readFileSync(ppt);
if (sha(pptBytes) !== 'da1ce1c0526da4da1aefd1fb6c0f23070f820ce24378c12f9699d1c700e1a985') throw new Error('Teacher deck hash mismatch.');
write('sources/original-114-slides.pptx', pptBytes);
const unzip = member => execFileSync('unzip', ['-p', ppt, member], { maxBuffer: 30 * 1024 * 1024 });
const slideRecords = [];
for (const number of [...Array.from({ length: 13 }, (_, i) => i + 13), 41]) {
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
    const relative = `sources/slide-assets/slide-${String(number).padStart(2, '0')}-${path.basename(member)}`;
    const bytes = unzip(member);
    write(relative, bytes);
    images.push({ archiveMember: member, file: relative, sha256: sha(bytes), bytes: bytes.length });
  }
  write(`sources/slide-xml/slide-${number}.xml`, xml);
  slideRecords.push({ slide: number, text: x('a\\:t').toArray().map(e => x(e).text()), images });
}
write('sources/SLIDES_13_25_AND_41.json', JSON.stringify(slideRecords, null, 2));
write('sources/SOURCE_LOCATORS.md', '# Lesson 2 sources\n\nOriginal teacher deck: actual slides 13–25, with slide 41 for the chromosome account. Slide 12 and current lesson 01 supply terminology context.\n\nTextbook: printed 587–591 = PDF pages 4–8; printed 597 = PDF page 14 for the chromosome account. The PDF begins at printed 584. Figure 17.5 on printed 589 supplies the 5474 round / 1850 wrinkled counts. Original source wording about “test crosses” must be interpreted carefully: a technical testcross uses a homozygous recessive tester; not every controlled cross is a testcross.\n\nSlide 14 visual verification must use its actual OOXML image25.png, not assume the Quick Look viewer has the correct image association. Do not use a human eye to illustrate Mendel’s pea traits.\n');
write('USER_COMMENTS.md', '# Dean’s lesson 2 comparison comments\n\nComment 1, actual slide 13: “this right here is the key difference. The idea of .... It starts to explain what we are doing, not just jumping into it. Its giving context to a title not just a paragraph of information with none.”\n\nComment 2, actual slide 14: “also here, some traits studied then they have a picture that makes it obvious and then context and information.”\n\nDean explicitly chose lesson 2 first and authorized the complete v0.4.0 teacher-led trial plan on 5 October 2026. His approval is for creating a comparison candidate, not acceptance of the eventual manuscript.\n');
for (const name of ['02_TEACHING_STANDARD.md', 'CHAPTER11_TEACHING_STANDARD.md']) write(`standards/${name}`, fs.readFileSync(path.join(base, name)));
write('SCOUT_AND_PRO_TASK.md', `# Authorized lesson 2 teacher-led trial v0.4.0\n\nDean has explicitly asked Codex to implement the attached plan using Scout to coordinate source review and regular signed-in ChatGPT Pro authoring. No additional permission is needed to produce this bounded comparison candidate. Codex will build the separate evaluation copy; do not change the live course or evaluation v0.3.0.\n\nRead the frozen current lesson and its exact controls, relevant original slides/pixels and textbook passages. Verify the deck’s actual slide14 image25.png against the eye seen in Quick Look. Report whether it is a source or renderer mismatch. Use actual scientifically relevant pea visuals in the new teaching.\n\nFirst establish a section-level teaching sequence recording prior understanding, orienting explanation, visual and noticing prompt, resulting explanation and what students can now attempt. The PowerPoint is the teacher voice/progression source; textbook verifies science. Preserve conversational orienting moves and expand what the teacher would explain aloud. Do not turn this into mechanical introductory phrases, repeated rhetorical questions, a glossary dump, arbitrary shortening or generic polish.\n\nUse the existing Biology project regular ChatGPT Pro conversation where available. Verify its visible selected model/reasoning setting and successful source attachment/read before requesting complete writing. Do not silently substitute Scout’s own writing for the requested ChatGPT manuscript. Keep observed model/submission/return evidence.\n\nRequest a COMPLETE lesson with this progression: connect to prior dominant/recessive teaching and introduce Mendel’s question; show real contrasting pea traits with explicit noticing guidance; introduce controlled crosses/starting plants and explain needed terms in context; follow P/F1/F2 visually in sequence; pose disappearance/reappearance and pattern questions at the right point; develop segregation/gametes/fertilisation with the DNA-copy/chromosome reasoning required by the existing assessment; explicitly transition flower colour to seed shape and explain symbols/grid entries/ratios; retain practice/feedback and expected-ratio versus actual-count interpretation. Every important visual needs introduction, viewing prompt and explanation of its significance. Retain the useful causal and quantitative depth in the current trial. No word-count limit.\n\nOnly teaching-fragment content is eligible for rewriting. Header, all assessments/keys, guided practice onward and all other lessons are exact protected source. The two saved optional notes within teaching keep EXACT IDs, titles, textarea/button attributes, prompts, hints and models. Their containers may move with their teaching purpose but may not be replaced by unsaved mock controls. Keep the four outer teaching/worked IDs in REPLACEMENT_BOUNDARY.json and existing native classes. Integrate image paths under ./assets/teaching-v040/ using supplied original asset bytes. No scripts, CSS, runtime changes, new assessment, new saved field or novel storage.\n\nReturn a versioned folder/ZIP with: manuscripts/lesson-02.md (complete learner text including unchanged embedded optional notes); lesson-02.teaching-fragment.html (native-class complete fragment for the exact boundary); TEACHING_SEQUENCE.md; SOURCE_VISUAL_MAP.json with exact slide/media/PDF locators, image placements/captions/alt and visual-read status; assets/teaching-v040/* only actual selected source images; CHANGELOG.md explaining what moved and why; CONTENT_REVIEW.md with first-time learner/science/task alignment read; INTEGRATION_MAP.json against the supplied v0.3.0 owner/boundary; MANIFEST.json with all hashes; PRO_AUTHORING_EVIDENCE.md with actual visible model and source/submission/return observations; OPEN_ISSUES.md. Learner copy must not contain implementation notes.\n\nReview the complete Pro manuscript against sources and Dean’s teaching concern before return; request specific corrections where necessary. Verify science, visual identity, first-use terms, notation and fair assessment preparation. Do not ask Dean to approve a headings-only plan or partly authored lesson. Teacher acceptance remains pending until he reviews the working comparison.\n\nLocal return destination: ${trial}/pro-return (new directory; never overwrite earlier returns). If cloud return cannot write here, return the downloadable ZIP and exact file path with SHA256 to Codex. Codex owns final native comparison assembly and technical checks.\n`);
const inventory = [];
const visit = dir => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) visit(file);
    else { const data = fs.readFileSync(file); inventory.push({ file: path.relative(packet, file), bytes: data.length, sha256: sha(data) }); }
  }
};
visit(packet);
write('SOURCE_HANDOFF_MANIFEST.json', JSON.stringify({ version: '0.4.0', createdAt: new Date().toISOString(), nativeV030: nativeSha, sourceDeck: sha(pptBytes), files: inventory }, null, 2));
const archive = path.join(trial, 'Biology30_CH17_Lesson02_Teacher_Trial_v0.4.0_Source.zip');
execFileSync('python3', ['-c', 'import pathlib,sys,zipfile\np=pathlib.Path(sys.argv[1])\nwith zipfile.ZipFile(sys.argv[2],"x",zipfile.ZIP_DEFLATED) as z:\n for f in sorted(p.rglob("*")):\n  if f.is_file():z.write(f,f.relative_to(p))', packet, archive]);
console.log(JSON.stringify({ packet, archive, files: inventory.length + 1, archiveSha256: sha(fs.readFileSync(archive)), nativeSha, replacementStart: start, replacementEnd: end }, null, 2));
