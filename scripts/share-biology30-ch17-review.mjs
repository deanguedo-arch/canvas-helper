import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { load } from 'cheerio';

// Derived teacher-review snapshot, using the chapter's existing portable pattern.
// No project approval, live integration, learner-state export or SCORM packaging.
const base = path.resolve('projects/biology30-chapter-17/meta/teaching-overhaul/2026-10-04-exemplar-transfer/teacher-led-batch-01-03-04-v0.1.0');
const source = path.join(base, 'evaluation/new');
const owner = path.join(source, 'index.html');
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const original = fs.readFileSync(owner, 'utf8');
const sourceSha = hash(original);
if (sourceSha !== '31447f72550c68ceb4a7cfd444f85651908a86782096dff4e4847cff4ab9e3e4') throw Error('Review candidate drifted; reconcile before sharing.');
const output = path.join(base, 'teacher-review-share-v1.0.0');
if (fs.existsSync(output)) throw Error('Review snapshot exists; preserve and version anew.');
const name = 'Biology 30 - Chapter 17 - Teacher Review.html';
const downloads = '/Users/deanguedo/Downloads';
for (const f of [name, name.replace(/\.html$/, '.zip')]) if (fs.existsSync(path.join(downloads, f))) throw Error(`Preserve existing download: ${f}`);
const $ = load(original);
$('html').attr('data-portable', '');
const readLocal = ref => {
  const file = path.resolve(source, ref);
  if (!file.startsWith(source + path.sep) || !fs.realpathSync(file).startsWith(fs.realpathSync(source) + path.sep)) throw Error(`Outside review root: ${ref}`);
  return fs.readFileSync(file);
};
let cssCount = 0, scriptCount = 0;
for (const e of $('link[rel=stylesheet]').toArray()) {
  const ref = e.attribs.href; const css = readLocal(ref).toString();
  if (/url\((?!["']?data:)[^)]*\)/i.test(css)) throw Error('Unexpected non-embedded stylesheet asset; use an explicit resolver.');
  $(e).replaceWith($('<style>').attr('data-inline-source', ref).text(css)); cssCount++;
}
for (const e of $('script[src]').toArray()) {
  const ref = e.attribs.src, script = readLocal(ref).toString();
  if (/<\/script\b/i.test(script)) throw Error('Inline closing-script delimiter requires explicit escaping.');
  $(e).removeAttr('src').attr('data-inline-source', ref).text(script); scriptCount++;
}
const originalData = Object.fromEntries(['course-data','textbook-practice-data','textbook-data'].map(id => [id, $('#' + id).text()]));
if (!originalData['textbook-data'] || Buffer.from(originalData['textbook-data'], 'base64').subarray(0,5).toString() !== '%PDF-') throw Error('Embedded textbook missing.');
const paths = new Set();
const collect = value => {
  if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') for (const [k,v] of Object.entries(value)) {
    if (k === 'src' && typeof v === 'string' && /^(\.\/)?assets\//.test(v) && !v.endsWith('.pdf')) paths.add(v);
    else collect(v);
  }
};
collect(JSON.parse(originalData['course-data'])); collect(JSON.parse(originalData['textbook-practice-data']));
for (const e of $('img[src]').toArray()) if (/^(\.\/)?assets\//.test(e.attribs.src)) paths.add(e.attribs.src);
const mime = {'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml','.webp':'image/webp'};
const records = {};
for (const ref of [...paths].sort()) {
  const type = mime[path.extname(ref).toLowerCase()]; if (!type) throw Error(`Unexpected image format: ${ref}`);
  records[ref] = `data:${type};base64,${readLocal(ref).toString('base64')}`;
}
const first = $('#textbook-practice-runtime'); if (first.length !== 1) throw Error('Missing native portable bootstrap insertion point.');
first.before($('<script type="application/json" id="chapter-assets">').text(JSON.stringify(records)));
first.before($('<script>').text("(()=>{'use strict';const assets=JSON.parse(document.getElementById('chapter-assets').textContent);const resolve=p=>assets[p]||assets['./'+String(p).replace(/^\\.\\//,'')]||p;window.BiologyChapterAssets=Object.freeze({resolve});document.querySelectorAll('img[src]').forEach(img=>{const p=img.getAttribute('src');if(assets[p])img.src=resolve(p);});})();"));
// Same blank-frame/embedded-PDF setup used by the original portable owner.
$('[data-library-textbook]').attr('src', 'about:blank');
$('[data-library-fullscreen],[data-library-download]').attr('href','#textbook-library');
const html = $.html(); const after = load(html);
for (const [id,text] of Object.entries(originalData)) if (after('#'+id).text() !== text) throw Error(`Protected data changed: ${id}`);
const old = load(original);
for (let n=1;n<=15;n++) {
  const id = '#lesson-'+String(n).padStart(2,'0');
  if (old(id).html() !== after(id).html()) throw Error(`Lesson changed: ${id}`);
}
if (after('script[src],link[rel=stylesheet]').length) throw Error('External runtime/style dependency left.');
const beforeControls=old('[data-check-id],[data-check-question],[data-writing-question],[data-note-input],[data-save-note]').toArray().map(e=>e.attribs);
const afterControls=after('[data-check-id],[data-check-question],[data-writing-question],[data-note-input],[data-save-note]').toArray().map(e=>e.attribs);
if(JSON.stringify(beforeControls)!==JSON.stringify(afterControls))throw Error('Control contracts drifted.');
fs.mkdirSync(output);
fs.writeFileSync(path.join(output,name),html,{flag:'wx'});
const readme = 'Biology 30 - Chapter 17 - teacher review\n\nOpen the HTML in a desktop browser (Chrome, Edge or Safari). No installation or local server is required. Images, fonts, textbook, questions and course scripts are included. YouTube videos need internet access. Browser privacy settings can limit saving from a local file.\n\nThis is the exact current isolated teaching candidate, not a deployed or SCORM course. New teacher-led revisions cover lessons 1-5 (including the retained lesson-2 and lesson-5 trials). Lessons 6-15 are still their previous versions in this snapshot; the next pair is being authored separately.\n\nReview the lesson explanations, progression, diagrams and practice. Some existing checks deliberately overlap worked examples: they are supported review/completion, not certified fresh independent assessment. Advanced optional applications may need later topics. Teacher approval is pending. No student answers or browser save data are included. Work you enter stays in your own browser and is not sent to Dean or the teacher automatically.\n\nDo not use this file as a Brightspace/SCORM release.\n';
fs.writeFileSync(path.join(output,'READ ME.txt'),readme,{flag:'wx'});
const archive=path.join(output,name.replace(/\.html$/,'.zip'));
execFileSync('python3',['-c','import zipfile,sys,pathlib\np=pathlib.Path(sys.argv[1])\nwith zipfile.ZipFile(sys.argv[2],"x",zipfile.ZIP_DEFLATED) as z:\n z.write(p/sys.argv[3],sys.argv[3]);z.write(p/"READ ME.txt","READ ME.txt")\nwith zipfile.ZipFile(sys.argv[2]) as z:assert z.testzip() is None',output,archive,name]);
fs.copyFileSync(path.join(output,name),path.join(downloads,name),fs.constants.COPYFILE_EXCL);
fs.copyFileSync(archive,path.join(downloads,path.basename(archive)),fs.constants.COPYFILE_EXCL);
const report={source:owner,sourceSha256:sourceSha,output: path.join(downloads,name),outputSha256:hash(html),bytes:Buffer.byteLength(html),zip:path.join(downloads,path.basename(archive)),zipBytes:fs.statSync(archive).size,images:paths.size,stylesheets:cssCount,scripts:scriptCount,all15LessonsExact:true,protectedJsonAndControlsExact:true,sourceUnchanged:hash(fs.readFileSync(owner))===sourceSha,browserVerification:'Pending',teacherAccepted:false,canonicalIntegrated:false,released:false};
fs.writeFileSync(path.join(output,'SHARE_REPORT.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report,null,2));
