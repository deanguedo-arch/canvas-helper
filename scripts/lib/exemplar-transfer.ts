import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { repoRoot } from './paths.js';
import { validateProject } from './course-standards.js';

export class ExemplarTransferGateError extends Error { readonly code = 'exemplar-transfer-stop'; }

export const transferReviewChecks = ['missing-reasoning', 'prerequisite-jumps', 'repetition', 'unnecessary-qualifications', 'formulaic-practice', 'hidden-feedback-dependence', 'presentation-drift'] as const;
export const activityInteractionChecks = ['stimulus', 'response-entry', 'save', 'reload', 'collection', 'hint-model', 'feedback', 'progress-unchanged'] as const;
export type EvidenceFile = { path: string; sha256: string };
export type TransferPlan = { lesson: string; purpose: string; prerequisites: string[]; progression: string[]; subjectRequirements: string[]; deferred: string[]; activities: { id: string; purpose: string; changedInference: string; kind?: 'worked-example' | 'response' }[] };
export type ExemplarTransfer = {
  schemaVersion: 1; sourceBindings: EvidenceFile[]; strategy: EvidenceFile; exemplar: { id: string; version: string; files: EvidenceFile[] };
  decisions: { function: string; passage: EvidenceFile; locator: string; decision: string }[];
  plans: TransferPlan[]; sampleLessons: string[];
  sample?: { version: string; files: EvidenceFile[]; instructionalReview: EvidenceFile; technicalReview: EvidenceFile; interactionReview?: EvidenceFile; teacherDecision?: { teacher: 'Dean'; decision: 'accepted' | 'revise'; evidence: EvidenceFile; binding: string } };
  continuation?: { lessons: string[]; previousBatchReview: EvidenceFile; previousBatchFiles: EvidenceFile[]; acceptedBinding: string };
};
const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
export function sampleBinding(record: ExemplarTransfer) {
  return hash(JSON.stringify({ sourceBindings: record.sourceBindings, strategy: record.strategy, exemplar: record.exemplar, decisions: record.decisions, plans: record.plans.filter(p => record.sampleLessons.includes(p.lesson)), sampleLessons: record.sampleLessons, sample: record.sample && { version: record.sample.version, files: record.sample.files } }));
}
async function evidence(root: string, file: EvidenceFile) {
  if (!file || typeof file.path !== 'string' || !/^[a-f0-9]{64}$/.test(file.sha256)) throw new ExemplarTransferGateError('Invalid exemplar-transfer evidence identity.');
  if (path.isAbsolute(file.path) || file.path.split(/[\\/]/).some(p => p === '..' || p === '.')) throw new ExemplarTransferGateError('Evidence must be a repository-relative file.');
  const canonicalRoot = await realpath(root); const target = await realpath(path.resolve(root, file.path));
  if (!target.startsWith(canonicalRoot + path.sep)) throw new ExemplarTransferGateError('Evidence escapes repository.');
  const bytes = await readFile(target);
  if (hash(bytes) !== file.sha256) throw new ExemplarTransferGateError(`Stale exemplar-transfer evidence: ${file.path}`);
  return bytes.toString('utf8');
}
function nonempty(value: unknown): value is string { return typeof value === 'string' && Boolean(value.trim()); }
function strings(value: unknown, allowEmpty = false): value is string[] { return Array.isArray(value) && (allowEmpty || value.length > 0) && value.every(nonempty); }
async function review(root: string, file: EvidenceFile, kind: 'instructional' | 'technical', binding: string) {
  const report = JSON.parse(await evidence(root, file));
  if (report.kind !== kind || report.binding !== binding || !nonempty(report.reviewer) || !Array.isArray(report.unresolved) || report.unresolved.length) throw new ExemplarTransferGateError(`${kind} review missing, stale or unresolved.`);
  if (kind === 'instructional' && transferReviewChecks.some(check => !nonempty(report.checks?.[check]))) throw new ExemplarTransferGateError('Instructional review must cite findings for every drift check; technical passes are insufficient.');
}
/** Every response activity needs its own actual interaction evidence; prose/inertness and unrelated save checks do not suffice. */
export async function validateActivityInteractions(record: ExemplarTransfer, root: string, binding: string) {
  if (!record.sample?.interactionReview) throw new ExemplarTransferGateError('STOP: sample activity interaction review required; text-only prompts or unrelated save checks are insufficient.');
  const report = JSON.parse(await evidence(root, record.sample.interactionReview));
  const expected = record.plans.filter(p => record.sampleLessons.includes(p.lesson)).flatMap(p => p.activities.filter(a => a.kind !== 'worked-example').map(a => a.id));
  if (report.kind !== 'activity-interaction' || report.binding !== binding || !nonempty(report.reviewer) || !Array.isArray(report.unresolved) || report.unresolved.length || !Array.isArray(report.activities) || report.activities.length !== expected.length || new Set(report.activities.map((a: { id: string }) => a.id)).size !== expected.length) throw new ExemplarTransferGateError('Activity interaction review missing, stale, incomplete or unresolved.');
  for (const id of expected) {
    const activity = report.activities.find((a: { id: string }) => a.id === id);
    if (!activity || activityInteractionChecks.some(check => !nonempty(activity.checks?.[check])) || !Array.isArray(activity.evidence) || !activity.evidence.length) throw new ExemplarTransferGateError(`End-to-end learning interaction evidence required: ${id}`);
    for (const file of activity.evidence) await evidence(root, file);
  }
}
/** Read-only gate: identity and recorded review, never automatic teaching certification. */
async function readExemplarTransferContext(project: string, root = repoRoot, intent: 'sample' | 'continue' = 'continue') {
  validateProject(project);
  let record: ExemplarTransfer;
  try { record = JSON.parse(await readFile(path.join(root, 'projects', project, 'meta/exemplar-transfer.json'), 'utf8')); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return 'Exemplar transfer: unassessed (no deliberate adoption recorded).'; throw error; }
  if (record.schemaVersion !== 1 || !nonempty(record.exemplar?.id) || !nonempty(record.exemplar?.version) || !record.exemplar.files?.length || !record.decisions?.length || !strings(record.sampleLessons) || new Set(record.sampleLessons).size !== record.sampleLessons.length || !Array.isArray(record.plans)) throw new ExemplarTransferGateError('Incomplete exemplar-transfer contract.');
  if (!record.sourceBindings?.length) throw new ExemplarTransferGateError('Native and bounded source bindings required.');
  for (const file of record.sourceBindings) await evidence(root, file);
  await evidence(root, record.strategy);
  for (const file of record.exemplar.files) await evidence(root, file);
  for (const decision of record.decisions) {
    if (![decision.function, decision.locator, decision.decision].every(nonempty) || !record.exemplar.files.some(f => f.path === decision.passage.path && f.sha256 === decision.passage.sha256)) throw new ExemplarTransferGateError('Teaching decisions require exact exemplar passage evidence.');
  }
  if (new Set(record.plans.map(p => p.lesson)).size !== record.plans.length) throw new ExemplarTransferGateError('Duplicate lesson plans.');
  const lessons = intent === 'sample' ? record.sampleLessons : record.continuation?.lessons;
  if (!strings(lessons)) throw new ExemplarTransferGateError('STOP: pending representative sample acceptance; explicit bounded continuation lessons required.');
  for (const lesson of lessons) {
    const plan = record.plans.find(p => p.lesson === lesson);
    if (!plan || !nonempty(plan.purpose) || !strings(plan.prerequisites, true) || !strings(plan.progression) || !strings(plan.subjectRequirements) || !strings(plan.deferred, true) || !Array.isArray(plan.activities) || plan.activities.some(a => ![a.id, a.purpose, a.changedInference].every(nonempty)) || new Set(plan.activities.map(a => a.purpose)).size !== plan.activities.length) throw new ExemplarTransferGateError(`Purpose/prerequisite/progression/activity/deferral plan required: ${lesson}`);
  }
  if (intent === 'continue') {
    const sample = record.sample; const decision = sample?.teacherDecision; const binding = sampleBinding(record);
    if (!sample?.files.length || !nonempty(sample.version) || decision?.teacher !== 'Dean' || decision.decision !== 'accepted' || decision.binding !== binding || record.continuation?.acceptedBinding !== binding) throw new ExemplarTransferGateError('STOP: Dean must accept this exact representative sample before scaling.');
    for (const file of sample.files) await evidence(root, file);
    await review(root, sample.instructionalReview, 'instructional', binding);
    await review(root, sample.technicalReview, 'technical', binding);
    await validateActivityInteractions(record, root, binding);
    const approval = JSON.parse(await evidence(root, decision.evidence));
    if (approval.teacher !== 'Dean' || approval.decision !== 'accepted' || approval.binding !== binding || !nonempty(approval.exactWords) || !nonempty(approval.source)) throw new ExemplarTransferGateError('Exact teacher decision evidence required.');
    if (!record.continuation!.previousBatchFiles?.length) throw new ExemplarTransferGateError("Previous batch file evidence required.");
    for (const file of record.continuation!.previousBatchFiles) await evidence(root, file);
    const batchBinding = hash(JSON.stringify({ acceptedBinding: binding, files: record.continuation!.previousBatchFiles }));
    await review(root, record.continuation!.previousBatchReview, 'instructional', batchBinding);
  }
  return `Exemplar transfer ${record.exemplar.id}@${record.exemplar.version}; ${intent} scope: ${lessons.join(', ')}. Teach functions, not repeated boxes; no example-count or length targets. For this deliberately adopted workflow, the bound teaching strategy governs instructional depth; inherited grade, paragraph and blueprint metadata must not override its teaching decisions. Strategy: ${record.strategy.path}. Plans and decision evidence: projects/${project}/meta/exemplar-transfer.json. ${intent === 'sample' ? 'STOP before scaling: exact sample review and Dean acceptance pending.' : 'Accepted sample reference recorded; this is not automatic teaching certification or approval of this batch.'} Every new response activity needs stimulus, entry, save/reload/collection, hint/model, feedback and unchanged-required-progress evidence. Instructional review is distinct from technical checks: ${transferReviewChecks.join(', ')}. Capture corrections as proposed lesson-specific/reusable changes; reusable promotion requires explicit scoped approval through the existing standards queue and paired generation/review changes.`;
}

export async function exemplarTransferContext(project:string,root=repoRoot,intent:'sample'|'continue'='continue') {
 validateProject(project);
 try {return await readExemplarTransferContext(project,root,intent);}
 catch(error){if(error instanceof ExemplarTransferGateError)throw error;throw new ExemplarTransferGateError(error instanceof Error?error.message:String(error));}
}
