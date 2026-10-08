/** Package integrity and unchanged-source checks; NOT learner/LMS certification. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import JSZip from 'jszip';
import {load} from 'cheerio';

const sha = value => createHash('sha256').update(value).digest('hex');

export async function verifyHandoff(repo, receiptPath) {
  const receipt = JSON.parse(await fs.readFile(receiptPath, 'utf8'));
  const bytes = await fs.readFile(receipt.zipPath);
  assert.equal(sha(bytes), receipt.zipSha256, 'ZIP differs from delivery receipt');
  const zip = await JSZip.loadAsync(bytes, {checkCRC32: true});
  const files = Object.values(zip.files).filter(f => !f.dir);
  assert.ok(files.every(f => !f.name.split('/').includes('..')), 'Unexpected ZIP path');
  const roots = new Set(files.map(f => f.name.split('/')[0]));
  assert.equal(roots.size, 1, 'One top-level handoff folder expected');
  const root = [...roots][0] + '/';
  const read = async name => {const member = zip.file(root + name); assert.ok(member, `Missing member: ${name}`); return member.async('nodebuffer');};
  const readJson = async name => JSON.parse((await read(name)).toString('utf8'));
  const manifest = await readJson('PACKAGE_MANIFEST.json');
  assert.equal(files.length, manifest.files.length + 1, 'Unmanifested payload member');
  for (const member of manifest.files) {
    const content = await read(member.path);
    assert.equal(content.length, member.bytes, member.path + ' size');
    assert.equal(sha(content), member.sha256, member.path + ' hash');
    if (!/\.(png|jpg|jpeg|ttf|pdf|pptx|doc|wmf|emf|mp4|mp3|gif|tif)$/i.test(member.path)) {
      assert.ok(!content.subarray(0, 100).toString().startsWith('version https://git-lfs.github.com/spec/v1'), 'LFS pointer: ' + member.path);
    }
  }
  const before = await readJson('preservation/source-before.json'), after = await readJson('preservation/source-after.json');
  assert.deepEqual(before, after, 'Export mutated protected sources');
  for (const f of before.files) assert.equal(sha(await fs.readFile(path.join(repo, f.path))), f.sha256, 'Current source drift: ' + f.path);
  const current = (await read('current-course/workspace/index.html')).toString('utf8');
  const $ = load(current, {sourceCodeLocationInfo: true});
  const chapters = await readJson('inventory/chapters-11-20.json');
  assert.equal(chapters.length, 10);
  assert.equal(chapters.reduce((total, c) => total + c.requiredCheckIds.length, 0), 120);
  for (const chapter of chapters) {
    const source = await fs.readFile(path.join(repo, chapter.canonicalEntry), 'utf8'), dom = load(source);
    const required = dom('[data-required-check]').toArray().map(e => e.attribs['data-activity'] ?? e.attribs['data-check-id']);
    assert.deepEqual(required, chapter.requiredCheckIds, 'Required IDs: Chapter ' + chapter.chapter);
    for (const lesson of chapter.lessons) {
      assert.equal(dom(`#${lesson.id}`).length, 1, 'Lesson route exists exactly once');
      const title = dom(`#${lesson.id} h1`).first().text().replace(/\s+/gu, ' ').trim();
      assert.equal(title, lesson.title, 'Lesson title: ' + lesson.id);
    }
  }
  let exactFragments = 0;
  for (const lesson of [...chapters[0].lessons, {id: 'lesson-check'}]) {
    const element = $(`#${lesson.id}`)[0], location = element.sourceCodeLocation;
    const original = current.slice(location.startOffset, location.endOffset);
    assert.equal((await read(`chapter11-lessons/${lesson.id}/current-exact.html`)).toString(), original, 'Exact lesson fragment: ' + lesson.id);
    exactFragments++;
  }
  for (const id of ['lesson-01', 'lesson-02', 'lesson-03']) {
    const packet = await readJson(`first-batch/${id}/SOURCE_AND_PRESERVATION.json`);
    assert.equal(packet.lessonId, id);
    assert.ok(packet.questions.length > 0);
    assert.ok(packet.vocabulary.inlineTermLinks.length > 0);
    for (const slide of packet.teacherSlides) await read(slide.textPath);
    for (const ref of packet.textbookLinks) await read(ref.textExtract);
    for (const media of packet.media) {
      const src = media.attrs.src;
      if (typeof src === 'string' && src.startsWith('assets/')) await read('current-course/workspace/' + src);
    }
  }
  const textbook = await readJson('current-course/data/textbook-practice-manifest.json');
  assert.equal(textbook.questions.length, 93);
  for (const q of textbook.questions) for (const crop of q.crops) if (crop.src) await read('current-course/workspace/' + crop.src.replace(/^\.\//, ''));
  const sources = await readJson('sources/source-register.json');
  for (const source of sources) assert.equal(sha(await read(source.packagePath)), source.sha256, 'Source document hash: ' + source.id);
  const slides = await readJson('sources/extracted/chapter11-teacher-deck/slide-index.json');
  assert.equal(slides.length, 66);
  for (const slide of slides) for (const rel of slide.relationships) if (rel.packageMediaPath) await read(rel.packageMediaPath);
  const quizMedia = await readJson('sources/teacher-only/quiz-media-index.json');
  for (const media of quizMedia) if (media.packagePath) await read(media.packagePath);
  const tracker = await readJson('AUTHORING_TRACKER.json');
  assert.equal(tracker.browserAuthoringStarted, false);
  assert.equal(tracker.courseIntegrationStarted, false);
  assert.equal(tracker.approval.currentDecision, null);
  const availability = await readJson('inventory/current-source-availability.json');
  assert.equal(availability.length, 10);
  const unresolved = availability.flatMap(c => c.otherSources.filter(s => s.availability !== 'available').map(s => ({chapter: c.chapter, ...s})));
  return {scope: 'Source package only; no content/learner/LMS certification', zipSha256: receipt.zipSha256,
    zipCrcPassed: true, payloadHashesVerified: manifest.files.length, chaptersInventoried: 10,
    requiredCheckIdsReconciled: 120, protectedSourcesStillUnchanged: before.files.length,
    exactLessonFragmentsMatched: exactFragments, originalTextbookQuestions: textbook.questions.length,
    teacherSlides: slides.length, sourceQuizMedia: quizMedia.length,
    browserAuthoringStarted: false, courseChangesStarted: false, explicitUnresolvedSourceDeclarations: unresolved};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = name => {const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1];};
  const receipt = arg('--receipt');
  if (!receipt) throw Error('Usage: node scripts/verify-biology30-teaching-handoff.mjs --receipt <receipt.json> [--report <new-report.json>]');
  const report = await verifyHandoff(process.cwd(), receipt);
  if (arg('--report')) await fs.writeFile(arg('--report'), JSON.stringify(report, null, 2) + '\n', {flag: 'wx'});
  console.log(JSON.stringify({...report, explicitUnresolvedSourceDeclarations: report.explicitUnresolvedSourceDeclarations.length}, null, 2));
}
