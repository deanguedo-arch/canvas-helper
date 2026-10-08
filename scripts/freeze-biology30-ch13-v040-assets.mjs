import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

// One bounded recovery operation: materialize this candidate's external asset
// links without changing any content. Retain original links as reference only.
const repo = process.cwd();
const root = path.join(repo, 'projects/biology30-chapter-13/meta/teaching-overhaul/2026-10-08-teacher-led/master-integration-v0.4.0');
const canonical = path.join(repo, 'projects/biology30-chapter-13/workspace');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const receipt = JSON.parse(fs.readFileSync(path.join(root, 'ASSEMBLY_RECEIPT.json')));
const backups = path.join(root, 'reference-only-original-links');
assert(!fs.existsSync(backups), 'Refuse repeated freeze operation');
const plans = [];
function inspect(folder, rel = '') {
  for (const entry of fs.readdirSync(path.join(folder, rel), {withFileTypes: true})) {
    const relative = path.join(rel, entry.name), file = path.join(folder, relative);
    if (entry.isSymbolicLink()) {
      const resolved = fs.realpathSync(file);
      assert(resolved.startsWith(canonical + path.sep), `Unexpected source link: ${relative}`);
      plans.push({file, resolved, relative, folder});
    } else if (entry.isDirectory()) inspect(folder, relative);
  }
}
for (const [name, inventory] of [['new', receipt.candidateTree], ['old', receipt.baseTree]]) {
  const folder = path.join(root, 'evaluation', name);
  for (const entry of inventory) assert.equal(sha(fs.readFileSync(path.join(folder, entry.path))), entry.sha256, `Pre-freeze drift ${name}/${entry.path}`);
  inspect(folder);
}
assert.equal(plans.length, 18, 'Expect nine known links in each snapshot');
assert.equal(sha(fs.readFileSync(path.join(canonical, 'index.html'))), '341c2f943c4178bc2abf3d56290f0d8f2cb31e6b78b2b89b187694385ebc62e6');
const stage = fs.mkdtempSync(path.join(root, 'asset-freeze-stage-'));
for (const [i, plan] of plans.entries()) {
  plan.staged = path.join(stage, String(i));
  fs.cpSync(plan.resolved, plan.staged, {recursive: true, dereference: true, errorOnExist: true, force: false});
}
// Revalidate immediately before replacing the exact links. No removal of
// canonical files; rename preserves each original link in reference metadata.
for (const [name, inventory] of [['new', receipt.candidateTree], ['old', receipt.baseTree]])
  for (const entry of inventory) assert.equal(sha(fs.readFileSync(path.join(root, 'evaluation', name, entry.path))), entry.sha256);
for (const plan of plans) {
  const backup = path.join(backups, path.basename(plan.folder), plan.relative);
  fs.mkdirSync(path.dirname(backup), {recursive: true});
  fs.renameSync(plan.file, backup);
  fs.renameSync(plan.staged, plan.file);
}
for (const [name, inventory] of [['new', receipt.candidateTree], ['old', receipt.baseTree]]) {
  const folder = path.join(root, 'evaluation', name);
  for (const entry of inventory) assert.equal(sha(fs.readFileSync(path.join(folder, entry.path))), entry.sha256, `Post-freeze drift ${name}/${entry.path}`);
  const oldCount = plans.length;
  inspect(folder);
  assert.equal(plans.length, oldCount, 'Frozen snapshot must contain zero symlinks');
}
fs.rmdirSync(stage); // Empty task-owned staging directory only.
fs.writeFileSync(path.join(root, 'ASSET_FREEZE_RECEIPT.json'), JSON.stringify({
  schemaVersion: 1, date: '2026-10-08', operation: 'Materialize verified bytes; preserve original links as reference only',
  candidateSha256: receipt.candidateSha256, allInventoryHashesUnchanged: true,
  linksMaterialized: plans.map(p => ({snapshot: path.basename(p.folder), path: p.relative, formerTarget: p.resolved})),
  activeSnapshotSymlinks: 0, canonicalUnchanged: true, referenceOnlyBackups: 'reference-only-original-links'
}, null, 2) + '\n');
console.log('18 asset links materialized; every old/new inventory hash unchanged; zero active snapshot links.');
