/** Assemble bounded, byte-verified inputs from the frozen teaching handoff. No course writes. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import JSZip from 'jszip';

const repo = process.cwd();
const parent = path.join(repo, 'projects/biology30-unit-a-pilot-3/meta/teaching-overhaul');
const source = path.join(parent, '2026-10-02-source-handoff');
const output = path.join(parent, '2026-10-02-browser-authoring');
const sha = value => createHash('sha256').update(value).digest('hex');
const manifest = JSON.parse(await fs.readFile(path.join(source, 'PACKAGE_MANIFEST.json'), 'utf8'));
const members = new Map(manifest.files.map(f => [f.path, f]));
const used = [];
async function read(relative) {
  const bytes = await fs.readFile(path.join(source, relative));
  const expected = members.get(relative);
  assert.ok(expected, `Not in frozen source manifest: ${relative}`);
  assert.equal(sha(bytes), expected.sha256, `Frozen source changed: ${relative}`);
  if (!used.some(f => f.path === relative)) used.push({path: relative, sha256: expected.sha256, bytes: bytes.length});
  return bytes;
}
const text = async relative => (await read(relative)).toString('utf8');
const json = async relative => JSON.parse(await text(relative));
await fs.mkdir(path.dirname(output), {recursive: true});
await fs.mkdir(output); // Refuse to overwrite an existing authoring session.
await fs.mkdir(path.join(output, 'attachments'));
await fs.mkdir(path.join(output, 'prompts'));
await fs.mkdir(path.join(output, 'responses'));
await fs.mkdir(path.join(output, 'evidence'));
const attachments = [];
async function attach(name, bytes, provenance) {
  const absolute = path.join(output, 'attachments', name);
  await fs.writeFile(absolute, bytes, {flag: 'wx'});
  const reread = await fs.readFile(absolute);
  assert.equal(sha(reread), sha(bytes));
  attachments.push({name, path: absolute, bytes: bytes.length, sha256: sha(bytes), provenance});
}
const revision = await json('REVISION_BINDING.json');
const index = await text('inventory/CHAPTER_INDEX.md');
const chapter11Index = index.slice(index.indexOf('## Chapter 11'), index.indexOf('## Chapter 12'));
let context = `# Chapter 11 first-batch authoring context\n\nTeacher/developer source evidence, not learner copy.\n\n## Current source binding\n\n${JSON.stringify(revision, null, 2)}\n\n${chapter11Index}\n`;
context += `\n## Current-course constraints override obsolete instructions\n\n- Author only lesson-01 Nervous communication, lesson-02 Neurons & myelin, lesson-03 Pathways & reflexes. Establish progression first; no HTML or code generation.\n- Current online lessons must teach essential biology themselves. Textbook reading and videos are optional support, not required prerequisite reading. The old prompt-pack's required-reading statement is stale.\n- Preserve original side-by-side Learning goal / Before you begin, guide below, current typography, navigation, vocabulary IDs, reader targets, existing media, checks, save namespaces and history. Do not add gates, grade policy, runtime, photo uploads, global Save & Exit, or deploy.\n- All three preserved checks are written responses, NOT multiple-choice-gated items. Model answers for new formative work must be separately identified; do not expose or alter a required check's grading behaviour.\n- lesson-01: practice-overview, source-checkpoint-1/-2/-3; lesson-02: practice-neuron-structure, source-checkpoint-7; lesson-03: practice-reflexes, source-checkpoint-4/-6. Written field IDs, prompts and limits remain unchanged.\n- The lesson-01 systems-table prompt needs an explicit taught hierarchy. Identify whether a concise CNS/PNS, sensory/motor, somatic/autonomic, sympathetic/parasympathetic orientation is needed now while detailed physiology remains in lesson-08. Do not silently narrow the preserved prompt or change its ID.\n- lesson-02 drawing instruction has a written box but no new photo-upload UI. State a workable paper-drawing + typed labelled-structure/function account; do not invent attachment controls.\n- New formative items need distinct proposed IDs, complete criteria/model answers and explanatory feedback. Integration still requires teacher approval.\n- Preserve contextual bold clickable words, current core vocabulary and word-owned Frayers. A popup is support, not the primary explanation.\n- Treat teacher slides as historical evidence: inspect slide 10's Schwann-cell generalization and jumping shorthand, slide 12's grey/white matter and regeneration comparisons, slide 14's MS claims and slide 20's spinal-reflex generalization. Textbook pp. 368/372 also contain older simplifications. Resolve or flag; never copy an error because it appears in a source. Keep reconciliation notes outside student copy.\n- Do not invent URLs, outcome codes, verified video playback or timestamps. Exact existing URLs are in the evidence packet.\n- No learner data, live browser state, credentials or private student material is included.\n\n## Complete supplied teaching standard\n\n`;
context += await text('supplied-standard/02_TEACHING_STANDARD.md');
context += '\n\n## Complete supplied authoring prompt\n\n' + await text('supplied-standard/03_CHATGPT_AUTHOR_CHAPTER.md');
const packets = [];
for (const id of ['lesson-01', 'lesson-02', 'lesson-03']) {
  const prefix = `first-batch/${id}/`;
  context += '\n\n---\n\n## COMPLETE CURRENT COPY — ' + id + '\n\n' + await text(prefix + 'CURRENT_LESSON.md');
  context += '\n\n## ORIGINAL TEACHER SLIDE TEXT — ' + id + '\n\n' + await text(prefix + 'TEACHER_SLIDES.md');
  packets.push(await json(prefix + 'SOURCE_AND_PRESERVATION.json'));
}
await attach('CH11_FIRST_BATCH_CONTEXT.md', Buffer.from(context), 'Verbatim source text and supplied standard, with clearly separated lead preservation notes.');
await attach('CH11_FIRST_BATCH_EVIDENCE.json', Buffer.from(JSON.stringify({schemaVersion: 1, revision, packets, vocabulary: await json('current-course/data/vocabulary-and-schema.json')}, null, 2) + '\n'), 'Complete original per-lesson source/preservation records, keys and vocabulary payload; no learner state.');
for (const [name, relative] of [
  ['Chapter11_Original_Textbook.pdf', 'sources/original/chapter-11.pdf'],
  ['Chapter11_Original_Teacher_Notes.pptx', 'sources/original/Unit-A-Chapter-11-Teacher-Notes.pptx'],
  ['Alberta_Program_Unit_A1_Original_Excerpt.pdf', 'first-batch/source-excerpts/alberta-program-unit-a1.pdf'],
  ['Chapter11_Teacher_Only_Comprehension_Key.pdf', 'sources/teacher-only/chapter11-comprehension-key.pdf'],
  ['integrated-neuron.png', 'current-course/workspace/assets/source/integrated-neuron.png'],
  ['integrated-myelin.png', 'current-course/workspace/assets/source/integrated-myelin.png']
]) await attach(name, await read(relative), `Byte-exact copy of ${relative}`);
const diagrams = new JSZip();
const svgPath = 'current-course/workspace/assets/source/integrated-withdrawal.svg';
diagrams.file('assets/source/integrated-withdrawal.svg', await read(svgPath));
diagrams.file('SOURCE_NOTE.txt', 'Existing withdrawal SVG, unchanged. Exact caption, alt text, placement and mappings are in CH11_FIRST_BATCH_EVIDENCE.json. A source SVG is not a newly reviewed replacement.\n');
await attach('CH11_EXISTING_WITHDRAWAL_DIAGRAM.zip', await diagrams.generateAsync({type: 'nodebuffer', compression: 'DEFLATE'}), `Original source SVG packaged without editing: ${svgPath}`);
await fs.writeFile(path.join(output, 'ATTACHMENT_MANIFEST.json'), JSON.stringify({
  schemaVersion: 1, preparedAt: new Date().toISOString(), revision,
  route: {assembly: 'Existing deterministic hash-bound source assembly, executed by Sol lead.', browserAuthoring: 'Sol lead: signed-in ordinary browser; no API service.', reviewAndAcceptance: 'Sol lead content/source review; Dean alone grants teacher approval.', delegation: 'None: source ownership and instructional judgment retained by lead; no independent implementation slice.', savings: 'Unknown; no provider-cache or usage-savings claims.'},
  sourceFolder: source, sourceInputs: used, attachments,
  stages: {sourceReady: true, browserAttached: false, progressionAuthored: false, manuscriptsAuthored: false, contentReviewed: false, teacherAccepted: false, courseIntegrated: false, technicallyTested: false}
}, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify({output, attachmentCount: attachments.length, totalBytes: attachments.reduce((n, a) => n + a.bytes, 0), sourceHashesVerified: used.length, courseFilesChanged: false}, null, 2));
