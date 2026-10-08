import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const trial = path.resolve('projects/biology30-chapter-17/meta/teaching-overhaul/2026-10-04-exemplar-transfer/teacher-led-trial-v0.4.0');
const revision = path.join(trial, 'revision-r1');
const returned = path.join(trial, 'pro-return/Biology30_CH17_Lesson02_Teacher_Trial_v0.4.0');
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
const read = file => fs.readFileSync(file, 'utf8');
const changes = JSON.parse(read(path.join(revision, 'COPY_CHANGES.json'))).changes;
const revise = text => changes.reduce((value, [before, after]) => {
  if (value.split(before).length !== 2) throw new Error('Copy change must occur exactly once.');
  return value.replace(before, after);
}, text);
const beforeFragment = read(path.join(returned, 'lesson-02.teaching-fragment.html'));
const fragment = read(path.join(revision, 'lesson-02.teaching-fragment.html'));
const expectedFragment = revise(beforeFragment);
if (fragment !== expectedFragment && fragment !== expectedFragment + '\n') throw new Error('Revision includes changes beyond the three authorized paragraphs and an optional terminal newline.');
const manuscript = read(path.join(revision, 'lesson-02.md'));
const expectedManuscript = revise(read(path.join(returned, 'manuscripts/lesson-02.md')));
if (manuscript !== expectedManuscript && manuscript !== expectedManuscript + '\n') throw new Error('Manuscript and HTML copy differ.');
const boundary = JSON.parse(read(path.join(trial, 'source-handoff/contracts/REPLACEMENT_BOUNDARY.json')));
const baseline = read(path.join(trial, 'evaluation/baseline/index.html'));
if (sha(baseline) !== boundary.baseline) throw new Error('Baseline drift.');
const previous = baseline.slice(0, boundary.startCharacter) + beforeFragment + baseline.slice(boundary.endCharacterExclusive);
if (sha(previous) !== JSON.parse(read(path.join(trial, 'BUILD_REPORT.json'))).candidateSha256) throw new Error('Initial candidate drift.');
const candidate = baseline.slice(0, boundary.startCharacter) + fragment + baseline.slice(boundary.endCharacterExclusive);
const target = path.join(trial, 'evaluation/new/index.html');
const current = read(target);
if (current !== previous && current !== candidate) throw new Error('Working candidate contains an unreviewed edit.');
const protection = JSON.parse(read(path.join(trial, 'SOURCE_PROTECTION.json')));
let protectedCount = 0;
for (const directory of protection.directories) for (const record of directory.files) {
  if (sha(fs.readFileSync(path.join(directory.root, record.file))) !== record.sha256) throw new Error('Protected source drift.');
  protectedCount++;
}
for (const record of protection.files) {
  if (sha(fs.readFileSync(record.file)) !== record.sha256) throw new Error('Protected owner drift.');
  protectedCount++;
}
const backup = path.join(revision, 'before-index.html');
if (!fs.existsSync(backup)) fs.writeFileSync(backup, previous, { flag: 'wx' });
else if (read(backup) !== previous) throw new Error('Revision archive drift.');
fs.writeFileSync(target, candidate);
// Preserve the manuscript's relative image links without changing source copy.
const manuscriptAssets = path.join(trial, 'assets/teaching-v040');
fs.mkdirSync(manuscriptAssets, { recursive: true });
for (const image of fs.readdirSync(path.join(returned, 'assets/teaching-v040'))) {
  const source = path.join(returned, 'assets/teaching-v040', image);
  const destination = path.join(manuscriptAssets, image);
  if (!fs.existsSync(destination)) fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL);
  if (sha(fs.readFileSync(destination)) !== sha(fs.readFileSync(source))) throw new Error('Manuscript asset drift.');
}
const report = { revision: 'v0.4.0-r1', userRequestedCopyOnly: true, changedTeachingParagraphs: 3, beforeSha256: sha(previous), afterSha256: sha(candidate), fragmentSha256: sha(fragment), manuscriptSha256: sha(manuscript), protectedFilesVerified: protectedCount, protectedAssessmentAndRuntimeUnchanged: true, originalProReturnUnchanged: true, teacherAccepted: false };
fs.writeFileSync(path.join(revision, 'preservation-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
