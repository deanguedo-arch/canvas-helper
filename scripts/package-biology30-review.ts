import { createHash } from 'node:crypto';
import { readFile, readdir, mkdir, writeFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import JSZip from 'jszip';

export const REVIEW_PROJECTS = { A: 'biology30-unit-a-pilot-2', B: 'biology30-unit-b', C: 'biology30-unit-c', D: 'biology30-unit-d' } as const;
type Unit = keyof typeof REVIEW_PROJECTS;
const units: Unit[] = ['A', 'B', 'C', 'D'];
const resource = 'projects/resources/biology30-production/v1';
const repairRoot = resource + '/pilot2/verification/2026-09-07-instructional-repairs';
const digest = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n';
async function readJson(file: string) { return JSON.parse(await readFile(file, 'utf8')); }
async function files(root: string, relative = ''): Promise<string[]> {
  const result: string[] = [];
  for (const entry of (await readdir(path.join(root, relative))).sort()) {
    const name = path.posix.join(relative, entry), s = await lstat(path.join(root, name));
    if (s.isSymbolicLink()) throw new Error('Symlink in review input: ' + name);
    if (s.isDirectory()) result.push(...await files(root, name));
    else if (s.isFile()) result.push(name);
    else throw new Error('Unsupported review input: ' + name);
  }
  return result;
}
function safeItem(item: any) {
  const record = { ...item, choices: item.choices ?? item.options };
  return Object.fromEntries(['id', 'routeId', 'kind', 'role', 'required', 'prompt', 'stages', 'choices', 'cognitiveLevel', 'outcomeIds', 'componentIds', 'componentEvidenceRole', 'performanceBehaviourIds', 'responseLimit'].filter(key => record[key] !== undefined).map(key => [key, record[key]]));
}
export function parseReviewUnits(args: string[]): Unit[] {
  const i = args.indexOf('--units');
  if (i >= 0 && (!args[i + 1] || args[i + 1].startsWith('--'))) throw new Error('--units requires a value');
  const selected = i < 0 ? units : args[i + 1].split(',').map(x => x.trim().toUpperCase()) as Unit[];
  if (!selected.length || selected.some(x => !units.includes(x))) throw new Error('Units must be A, B, C or D');
  return [...new Set(selected)];
}

export async function prepareReviewUnit(repo: string, unit: Unit) {
  const project = REVIEW_PROJECTS[unit], meta = 'projects/' + project + '/meta', workspace = 'projects/' + project + '/workspace';
  const html = await readFile(path.join(repo, workspace, 'index.html'), 'utf8'), $ = load(html);
  const entries = new Map<string, Buffer>();
  const add = async (destination: string, source: string) => entries.set(destination, await readFile(path.join(repo, source)));
  const dataFiles: { path: string; sha256: string; size: number }[] = [];
  for (const name of (await files(path.join(repo, workspace))).filter(x => x === 'index.html' || x.startsWith('assets/'))) {
    const bytes = await readFile(path.join(repo, workspace, name));
    entries.set('course/' + name, bytes); dataFiles.push({ path: name, sha256: digest(bytes), size: bytes.length });
  }
  const entrySha256 = digest(html);
  const candidateTreeSha256 = digest(dataFiles.map(x => x.path + '\0' + x.sha256 + '\n').join(''));
  let contract: any, items: any[], reading: any, responses: any[], teaching: {id: string; title: string}[], contractPath: string;
  const evidence: any[] = [];
  const includeEvidence = async (source: string, destination: string) => {
    const bytes = await readFile(path.join(repo, source));
    let recorded: string | null = null, schemaRelation: string | null = null;
    if (source.endsWith('.json')) {
      const report = JSON.parse(bytes.toString());
      recorded = report.workspaceSha256 ?? report.buildSha256 ?? report.entrySha256 ?? null;
      if (unit !== 'A' && report.schemaSha256) {
        const currentSchema = digest(await readFile(path.join(repo, resource, 'units/unit-' + unit.toLowerCase(), 'pilot2-state-schema.json')));
        schemaRelation = report.schemaSha256 === currentSchema ? 'matches-current-state-schema; browser status is historical, see review-results/verification.json' : 'historical-state-schema; superseded by review-results/verification.json';
      }
    }
    evidence.push({ source, destination, sha256: digest(bytes), recordedBuildHash: recorded,
      relation: schemaRelation ?? (recorded === entrySha256 || recorded === candidateTreeSha256 ? 'matches-current-candidate' : recorded ? 'historical-or-different-hash-scope; not current acceptance evidence' : 'context-only; no exact-current build assertion') });
    entries.set(destination, bytes);
  };
  if (unit === 'A') {
    contractPath = meta + '/pilot-2-contract.json'; contract = await readJson(path.join(repo, contractPath));
    if (contract.project !== project || contract.profileId !== 'biology30-unit-a-pilot-2-topic-sequence-v1' || contract.lessons.length !== 13) throw new Error('Unit A must be the 13-lesson Pilot 2');
    teaching = contract.lessons.map((x: any) => ({ id: x.id, title: x.title }));
    if (teaching.some(x => $('[id]').filter((_, el) => $(el).attr('id') === x.id).length !== 1)) throw new Error('A contract/rendered lesson mismatch');
    const blueprint = await readJson(path.join(repo, meta, 'practice-blueprint.json'));
    const planned = [...blueprint.lessonItems, ...blueprint.chapterItems, ...blueprint.finalCoreItems, ...blueprint.challengeItems];
    const byId = new Map(planned.map((x: any) => [x.id, x]));
    items = $('[data-practice-id]').toArray().map(el => {
      const node = $(el), id = node.attr('data-practice-id')!, mapping = byId.get(id) as any;
      if (!mapping) throw new Error('Unmapped A learner question: ' + id);
      return safeItem({ ...mapping, kind: 'multiple-choice', prompt: node.find('h3').first().text(), choices: node.find('label.choice-row span').map((_, choice) => $(choice).text()).get() });
    });
    if (new Set(items.map(x => x.id)).size !== items.length || items.length !== planned.length || planned.some(x => !items.some(i => i.id === x.id))) throw new Error('A learner/blueprint inventory mismatch');
    responses = $('textarea[data-response-id]').toArray().map(el => ({ id: $(el).attr('data-response-id'), limit: Number($(el).attr('maxlength')) || null }));
    reading = await readJson(path.join(repo, meta, 'reading-level-report.json'));
    for (const name of ['pilot-2-contract.json', 'curriculum-performance-map.json', 'atomic-curriculum-map.json', 'reading-level-report.json', 'route-response-map.json', 'state-budget.json', 'core-vocabulary.json', 'practice-blueprint.json', 'final-academic-review.json', 'final-academic-verification.json']) await includeEvidence(meta + '/' + name, 'metadata/canonical/' + name);
  } else {
    const base = resource + '/units/unit-' + unit.toLowerCase();
    const embedded = $('#pilot2-course-data').text();
    if (!embedded) throw new Error('Missing topic learner data for ' + unit);
    const activities = JSON.parse(embedded).activities;
    contractPath = base + '/pilot2-contract.json'; contract = await readJson(path.join(repo, contractPath));
    const practice = await readJson(path.join(repo, base, 'pilot2-practice.json'));
    if (JSON.stringify(activities.contract) !== JSON.stringify(contract) || JSON.stringify(activities.practice.items) !== JSON.stringify(practice.items)) throw new Error(unit + ' authored inputs do not match learner snapshot; rebuild before packaging');
    teaching = contract.topics.map((x: any) => ({ id: x.id, title: x.title }));
    if (teaching.length !== ({ B: 8, C: 18, D: 4 }[unit]) || teaching.some(x => $('[id]').filter((_, el) => $(el).attr('id') === x.id).length !== 1)) throw new Error(unit + ' topic inventory mismatch');
    items = activities.practice.items.map(safeItem);
    responses = Object.entries(activities.state.responses).map(([id, value]: [string, any]) => ({ id, limit: value.limit }));
    reading = await readJson(path.join(repo, base, 'pilot2-reading-report.json'));
    for (const name of ['pilot2-contract.json', 'pilot2-academic-contract.json', 'pilot2-content.json', 'pilot2-instruction.json', 'pilot2-topic-teaching.json', 'pilot2-outcome-targets.json', 'pilot2-reading-report.json', 'pilot2-vocabulary.json', 'pilot2-models.json', 'pilot2-investigations.json', 'pilot2-review-seminar.json', 'pilot2-time.json', 'pilot2-activity-index.json', 'pilot2-state-budget.json']) await includeEvidence(base + '/' + name, 'metadata/canonical/' + name);
    await includeEvidence(base + '/production-contract.json', 'metadata/historical/production-contract.json');
  }
  const summary = { unit, project, title: $('head > title').first().text(), teachingUnit: unit === 'A' ? 'lessons' : 'teaching topics', teachingCount: teaching.length, teaching,
    requiredMinutes: contract.requiredMinutes, optionalMinutes: contract.optionalMinutes, practiceItemCount: items.length,
    requiredPracticeItemCount: items.filter(x => x.required !== false && x.role !== 'challenge').length,
    interpretation: 'Current learner inventory. Counts are not a rigor score; other written and practical tasks exist outside the practice bank.' };
  await add('metadata/project.json', meta + '/project.json');
  entries.set('metadata/assessment-review.json', Buffer.from(json({ items, itemCount: items.length, note: 'Prompt and mapping inventory; answer keys omitted here. Functional learner feedback remains in course files.' })));
  entries.set('metadata/response-capacities.json', Buffer.from(json(responses)));
  entries.set('metadata/learning-level-report.json', Buffer.from(json({ ...reading, reviewCaution: 'Prose diagnostic only. Methods and sampled surfaces must be compared explicitly; this does not measure learning or pacing.' })));
  entries.set('metadata/evidence-provenance.json', Buffer.from(json(evidence)));
  const manifest = { schemaVersion: 2, unit, project, candidateStatus: 'blocked / preview-only', sourceWorkspacePath: workspace, sourceContractPath: contractPath,
    entrySha256, candidateTreeSha256, candidateTreeHashAlgorithm: 'path\\0fileSha256\\n; sorted traversal; index.html and assets only', files: dataFiles, summary };
  entries.set('metadata/review-manifest.json', Buffer.from(json(manifest)));
  entries.set('metadata/current-build-verification.json', Buffer.from(json(manifest)));
  entries.set('LOCAL_PREVIEW.md', Buffer.from('Serve the extracted course folder locally: python3 -m http.server 8080 --directory course\nOpen http://127.0.0.1:8080/. A localhost address on the author computer is not remotely accessible to ChatGPT.\n'));
  return { unit, project, entries, manifest, summary };
}

export async function packageReviews(repo: string, selected: Unit[], checkOnly = false) {
  const prepared = [];
  for (const unit of selected) prepared.push(await prepareReviewUnit(repo, unit));
  if (checkOnly) return prepared.map(x => x.manifest);
  const complete = units.every(u => selected.includes(u));
  const comparison = '# Current Biology 30 review inventory\n\n' + (complete ? 'Full A–D set. Unit A is the 13-lesson Pilot 2.\n' : 'Partial set; no full A–D comparison is asserted.\n') +
    '\n| Unit | Current structure | Practice bank | Required bank items |\n|---|---|---:|---:|\n' + prepared.map(x => '| ' + x.unit + ' | ' + x.summary.teachingCount + ' ' + x.summary.teachingUnit + ' | ' + x.summary.practiceItemCount + ' | ' + x.summary.requiredPracticeItemCount + ' |').join('\n') +
    '\n\nInspect actual prompts and independent opportunities across all activity types. Historical production contracts describe earlier planning, not current topic counts. Reading diagnostics describe selected prose, not student achievement. Check A→B feedback mechanisms, B→C gamete/chromosome concepts and C→D allele-frequency prerequisites. Outcome-by-outcome curriculum certification has not been completed.\n';
  const master = new JSZip();
  const records = [];
  for (const p of prepared) {
    p.entries.set('PROGRAM_ALIGNMENT_REVIEW.md', Buffer.from(comparison));
    p.entries.set('REVIEW_BRIEF.md', Buffer.from('# Unit ' + p.unit + ' review\n\nSource: ' + p.project + '. Current structure: ' + p.summary.teachingCount + ' ' + p.summary.teachingUnit + '.\n\nRead PROGRAM_ALIGNMENT_REVIEW.md, course/index.html and metadata/evidence-provenance.json. Review response capacity, independent practice, scientific reasoning and prerequisite handoffs. Separate verified defects from design hypotheses and optional enhancements. Check existing coverage before suggesting more work. Completion measures participation; it is not a proficiency score. The candidate remains blocked and preview-only.\n'));
    const zip = new JSZip(), root = 'biology30-unit-' + p.unit.toLowerCase() + '/';
    for (const [name, bytes] of p.entries) { zip.file(name, bytes); if (complete) master.file(root + name, bytes); }
    const outputPath = path.join(repo, 'projects', p.project, 'meta', p.project + '-chatgpt-review-package.zip');
    await writeFile(outputPath, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } }));
    records.push({ unit: p.unit, project: p.project, masterArchiveRoot: root, outputPath, entrySha256: p.manifest.entrySha256, candidateTreeSha256: p.manifest.candidateTreeSha256, summary: p.summary });
  }
  const index = { schemaVersion: 2, generatedAt: new Date().toISOString(), completeADSet: complete, packages: records };
  if (complete) {
    master.file('MASTER_REVIEW_INDEX.json', json({ ...index, packages: records.map(({ outputPath: _path, ...record }) => record) }));
    master.file('MASTER_REVIEW_README.md', '# Biology 30 A–D review\n\nUnit A is Pilot 2 (13 lessons). B/C/D have 8/18/4 teaching topics. Start with PROGRAM_ALIGNMENT_REVIEW.md and each unit’s REVIEW_BRIEF.md. These current inventories supersede the earlier package containing 17-lesson Unit A.\n');
    master.file('PROGRAM_ALIGNMENT_REVIEW.md', comparison);
    for (const name of ['gap-and-repair.md', 'verification.json', 'response-fixtures.json', 'repair-decisions.json', 'coverage-review.json', 'browser-results.json', 'repair-map.json', 'human-review.md']) {
      const source = path.join(repo, repairRoot, name);
      if (await lstat(source).catch(() => null)) master.file('review-results/' + name, await readFile(source));
    }
    const out = path.join(repo, 'projects/biology30-unit-a/meta');
    await mkdir(out, { recursive: true });
    await writeFile(path.join(out, 'biology30-a-d-chatgpt-review-index.json'), json(index));
    await writeFile(path.join(out, 'biology30-a-d-chatgpt-review-packages.zip'), await master.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } }));
  }
  return index;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--help')) console.log('package:biology30-review [--units a,b,c,d] [--check]. Partial selections produce individual ZIPs only; --check writes nothing.');
  else console.log(json(await packageReviews(process.cwd(), parseReviewUnits(process.argv.slice(2)), process.argv.includes('--check'))));
}
