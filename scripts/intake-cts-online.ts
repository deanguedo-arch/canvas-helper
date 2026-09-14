/** Resource intake only. Never writes learner workspaces or rebuilds authored courses. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('projects/resources/cts-online');
const python = '/Users/deanguedo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
await mkdir(path.join(root, '_sources'), { recursive: true });
await mkdir(path.join(root, '_extracted'), { recursive: true });
const digest = (b: Buffer) => createHash('sha256').update(b).digest('hex');
const records: any[] = [];
async function preserve(name: string, bytes: Buffer, origin: string, role: string) {
  const sha256 = digest(bytes);
  const relative = `_sources/${sha256}${path.extname(name)}`;
  await writeFile(path.join(root, relative), bytes);
  const record = { name, origin, sha256, bytes: bytes.length, path: relative, role, learnerExport: false };
  records.push(record);
  return path.join(root, relative);
}
const archive = '/Users/deanguedo/Downloads/CTS.zip';
await preserve('CTS.zip', await readFile(archive), archive, 'original-authoring-archive');
const expected = ['2026 Marketing 10-20.pdf', '2026 Marketing 30.pdf', '2026 Legal 30.pdf', '2026 Tourism 10-20.pdf', '2026 Tourism 30.pdf'];
for (const name of expected) {
  const bytes = execFileSync('unzip', ['-p', archive, name], { maxBuffer: 10_000_000 });
  const file = await preserve(name, bytes, `${archive}#${name}`, 'authoring-reference');
  const pages = JSON.parse(execFileSync(python, ['-c', 'import json,sys; from pypdf import PdfReader; print(json.dumps([p.extract_text() or "" for p in PdfReader(sys.argv[1]).pages]))', file], { maxBuffer: 10_000_000 }).toString());
  await writeFile(path.join(root, '_extracted', name.replace('.pdf', '.json')), JSON.stringify({ name, pages }, null, 2));
}
const rubric = '/Users/deanguedo/Downloads/CTS Rubric for Gr. 10-12.docx';
const rubricFile = await preserve(path.basename(rubric), await readFile(rubric), rubric, 'shared-assessment-reference');
const rubricRows = JSON.parse(execFileSync(python, ['-c', 'import json,sys; from zipfile import ZipFile; from lxml import etree; z=ZipFile(sys.argv[1]); r=etree.fromstring(z.read("word/document.xml")); ns={"w":"http://schemas.openxmlformats.org/wordprocessingml/2006/main"}; print(json.dumps([[" ".join(c.xpath(".//w:t/text()",namespaces=ns)) for c in row.findall("w:tc",ns)] for row in r.findall(".//w:tr",ns)]))', rubricFile]).toString());
await writeFile(path.join(root, '_extracted/rubric.json'), JSON.stringify(rubricRows, null, 2));
const urls = [
  ['authorized-codes.pdf','https://curriculum.learnalberta.ca/cdn/cia/provincially-authorized-senior-high-school-courses-and-codes/course-listing-2026-en.pdf'],
  ['lgs.pdf','https://education.alberta.ca/media/3272986/lgs_pos.pdf'],
  ['mam-summary.pdf','https://education.alberta.ca/media/159484/mam_sum.pdf'],
  ['tou-summary.pdf','https://education.alberta.ca/media/160527/tou_sum.pdf'],
  ['cts-course-guidance.html','https://curriculum.learnalberta.ca/cdn/resources/m/ctsg/wi/wi_courses.html'],
  ['cts-project-guidance.html','https://curriculum.learnalberta.ca/cdn/resources/m/ctsg/imp/imp_teach.html']
];
const official: any[] = [];
for (const [name,url] of urls) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const file = await preserve(name, bytes, url, 'official-reference-pending-content-verification');
    let text = bytes.toString();
    if (name.endsWith('.pdf')) text = execFileSync(python, ['-c','import sys; from pypdf import PdfReader; print("\\n".join(p.extract_text() or "" for p in PdfReader(sys.argv[1]).pages))',file], {maxBuffer:10_000_000}).toString();
    await writeFile(path.join(root,'_extracted',`${name}.txt`),text);
    official.push({url,source:file,characters:text.length,status:/moved|new LearnAlberta/i.test(text) && text.length < 5000 ? 'migration-notice-not-outcomes' : 'retrieved-awaiting-curriculum-reconciliation'});
  } catch (error) { official.push({url,status:'unresolved',error:String(error)}); }
}
await writeFile(path.join(root,'source-inventory.json'),JSON.stringify({schemaVersion:1,retrievedAt:new Date().toISOString(),originals:records,official,rights:'User-supplied and government sources retained for authoring and verification only. Do not ship source booklets, government PDFs or extracted text to learners.',dispositions:[
 {item:'CTS codes and subject coverage',action:'retained',reason:'Preserve 42 registered modules in five local bundles.'},
 {item:'Lessons, examples and assessments',action:'rewritten',reason:'Original independent scenarios and assessable practical products.'},
 {item:'Generic shared rubric',action:'retained-and-contextualized',reason:'Four reference categories and four achievement levels; no automatic score conversions.'},
 {item:'Legal-project text in Marketing/Tourism introductions',action:'excluded-contradictory',reason:'Copied administrative text does not describe these courses.'},
 {item:'Duplicate Project B/C and D/E tasks',action:'rewritten',reason:'Separate learning, planning and evidence required for every project code.'},
 {item:'Found advertisements and copied itinerary links',action:'rewritten',reason:'Students create and evaluate original products.'},
 {item:'Old court names, $50,000 civil limit, Fair Trading Act and Stinchcomb reference',action:'outdated-replaced',reason:'Use current Alberta primary sources and accurate case citations.'},
 {item:'FOIP and PIPED statements in Tourism booklet',action:'outdated-replaced',reason:'Teach jurisdiction distinctions with current primary-source privacy guidance.'},
 {item:'Named staff, withdrawal policies and contact collection',action:'excluded',reason:'Not authorized course configuration.'},
 {item:'Third-party source images and scans',action:'rights-restricted',reason:'No republication; locally authored teaching diagrams instead.'}
]},null,2));
console.log(`Preserved ${records.length} sources; ${official.length} official retrieval records. No workspace changed.`);
