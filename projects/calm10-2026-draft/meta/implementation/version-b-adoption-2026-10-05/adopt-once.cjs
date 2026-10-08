// One-time authorized promotion. Historical operation, never a course regeneration owner.
const fs = require('fs'), path = require('path'), crypto = require('crypto'), assert = require('assert/strict'), cheerio = require('cheerio');
const project = path.resolve(__dirname, '../../..'), workspace = path.join(project, 'workspace');
const review = path.join(project, 'meta/teaching-overhaul/calm-standard-v1');
const sha = x => crypto.createHash('sha256').update(x).digest('hex');
const reportPath = path.join(__dirname, 'ADOPTION.json');
assert.ok(!fs.existsSync(reportPath), 'Already adopted; edit canonical sources directly.');
const baseline = JSON.parse(fs.readFileSync(path.join(review, 'BASELINE.json')));
for (const [file, hash] of Object.entries(baseline.files)) assert.equal(sha(fs.readFileSync(path.join(workspace, file))), hash, 'Canonical drift: ' + file);
const old = fs.readFileSync(path.join(workspace, 'index.html'), 'utf8');
const approved = fs.readFileSync(path.join(review, 'review/b/index.html'), 'utf8');
assert.equal(sha(approved), '189d17b63a87887b4fe17b7c56ea329fdb2a53a7b1507cdf75450713ee6dbd7a', 'Approved B changed');
const a = cheerio.load(old), b = cheerio.load(approved, {sourceCodeLocationInfo: true});
const before = path.join(__dirname, 'before'); fs.mkdirSync(before, {recursive:true});
for (const file of Object.keys(baseline.files)) fs.copyFileSync(path.join(workspace, file), path.join(before, file));
fs.writeFileSync(path.join(__dirname, 'approved-b.html'), approved);
const registry = JSON.parse(b('#historical-task-registry').text());
const oldRegistry = JSON.parse(a('#historical-task-registry').text());
const groups = $ => { const m = new Map(); $('[data-save-key]').each((i,e) => { const key = $(e).attr('data-save-key'); if (!m.has(key)) m.set(key,e); }); return m; };
const oldGroups = groups(a), nextGroups = groups(b);
assert.deepEqual([...nextGroups.keys()].sort(), [...oldGroups.keys()].sort(), 'Response IDs changed');
const changed = [];
const promptId = 'ce1-05-canonical-before-2026-10-05';
registry.versionPrompts[promptId] = a('#ce1-05').text().replace(/\s+/g, ' ').trim();
for (const [key, element] of nextGroups) {
  const previous = oldGroups.get(key), previousVersion = a(previous).attr('data-task-version'), version = b(element).attr('data-task-version');
  if (previousVersion === version) continue;
  assert.equal(b(element).closest('article[data-lesson-id]').attr('id'), 'ce1-05', 'Unexpected task change');
  const prior = previousVersion || oldRegistry.fields[key]?.version || 'pre-repair';
  const label = registry.versions?.[prior]?.[key]?.label || oldRegistry.fields[key]?.label || a(previous).attr('aria-label') || key;
  registry.versions[prior] ||= {};
  registry.versions[prior][key] = {label, promptId};
  changed.push({key, before: previousVersion || null, after: version, historyVersion:prior});
}
// Preserve all existing historical associations while completing the changed-task record.
for (const [version, entries] of Object.entries(oldRegistry.versions)) for (const [key, entry] of Object.entries(entries))
  assert.deepEqual(registry.versions[version][key], entry, 'Prior history changed: '+key);
const edits = [];
for (const selector of ['nav.review-switch', 'link[href="../../review.css"]']) {
  assert.equal(b(selector).length, 1, selector);
  const loc = b(selector)[0].sourceCodeLocation; edits.push({start:loc.startOffset, end:loc.endOffset, text:''});
}
const loc = b('#historical-task-registry')[0].sourceCodeLocation;
edits.push({start:loc.startTag.endOffset, end:loc.endTag.startOffset, text:JSON.stringify(registry).replace(/</g,'\\u003c')});
let promoted = approved;
for (const edit of edits.sort((x,y)=>y.start-x.start)) promoted = promoted.slice(0,edit.start)+edit.text+promoted.slice(edit.end);
promoted = promoted.replace('Your review work saves automatically in this browser.', 'Your work saves automatically in this browser.');
promoted = promoted.replace(/\n[ \t]+\n/g, '\n\n');
assert.ok(!promoted.includes('Choose a lesson to compare'));
fs.writeFileSync(path.join(workspace, 'index.html'), promoted);
for (const file of ['stage-headings.css','course-shell.css']) fs.copyFileSync(path.join(review,'review/b',file), path.join(workspace,file));
const metadataPath = path.join(project,'meta/project.json'), metadata = JSON.parse(fs.readFileSync(metadataPath));
fs.copyFileSync(metadataPath,path.join(before,'project.json'));
for (const file of ['stage-headings.css','course-shell.css']) {
  const source = 'projects/calm10-2026-draft/workspace/'+file;
  if (!metadata.canonicalSources.includes(source)) metadata.canonicalSources.push(source);
}
const note = '2026-10-05: Dean approved course-wide Version B revision 4 as the sole active course. Canonical workspace HTML and styles own future edits; meta review assemblies and Before snapshots are historical, not regeneration owners. Existing course storage/runtime retained; changed CE1-05 responses retain canonical prior wording.';
if (Array.isArray(metadata.sourceOfTruthNotes)) metadata.sourceOfTruthNotes.push(note);
else metadata.sourceOfTruthNotes = (metadata.sourceOfTruthNotes || '')+'\n'+note;
fs.writeFileSync(metadataPath,JSON.stringify(metadata,null,2)+'\n');
fs.writeFileSync(reportPath,JSON.stringify({schemaVersion:1,adoptedAt:new Date().toISOString(),authorization:'Dean: alright can we just make version be the only version?',scope:'CALM 10 only; all 40 approved B lessons become canonical',approvedSha256:sha(approved),canonicalSha256:sha(promoted),beforeFiles:baseline.files,changedTaskFields:changed,namespace:'calm10-2026-draft:learning:v3',reviewAnswersImported:false,previousVersions:'Archived; no active comparison chooser',releasePerformed:false},null,2)+'\n');
console.log('Adopted 40 lessons; retained 1284 response IDs and canonical save namespace; '+changed.length+' CE1-05 task-version associations preserved.');
