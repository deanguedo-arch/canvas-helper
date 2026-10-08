import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import workspaceSchema from '../schemas/workspace.schema.json';
import persistedSchema from '../schemas/persisted-workspace.schema.json';
import backupSchema from '../schemas/backup.schema.json';
import legacySchema from '../schemas/legacy-export.schema.json';
import templates from '../content/project-templates.json';
import revisionContent from '../content/revision-checks.json';
import { canonical, wordCount } from './codec.js';

export const APP_VERSION = '2.0.0-build';
export const PASSES = ['ideas', 'organization', 'evidence', 'analysis', 'style', 'conventions'];
export const MILESTONES = ['plan', 'evidence', 'draft', 'revision', 'ready'];
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(workspaceSchema);
ajv.addSchema(persistedSchema);
ajv.addSchema(backupSchema);
ajv.addSchema(legacySchema);
const validateWorkspaceShape = ajv.getSchema(workspaceSchema.$id);
const validatePersistedShape = ajv.getSchema(persistedSchema.$id);
const validateBackupShape = ajv.getSchema(backupSchema.$id);
const validateLegacyShape = ajv.getSchema(legacySchema.$id);

const now = () => new Date().toISOString();
export const uid = () => crypto.randomUUID();
export function newWorkspace() {
  const at = now();
  return { workspaceId: uid(), revision: 0, headId: uid(), createdAt: at, updatedAt: at,
    activeProjectId: null, projects: [], preferences: { track: 'general', editorFont: 'serif', editorFontSize: 19,
      lineHeight: 1.7, highContrast: false, reduceMotion: 'system', localRecovery: 'session' },
    library: { bookmarks: [] }, activity: [], imports: [] };
}

export function newProject({ title, type = 'blank', track = 'general', prompt = '', targetWords = null, dueDate = null, practiceMode = false }) {
  const at = now();
  const fields = templates.templates.find(item => item.id === type)?.sections || [];
  return { id: uid(), title: title.trim(), type, track, practiceMode, status: 'planning', archived: false, prompt,
    targetWords, dueDate, criteria: [], plan: fields.map(({ label, prompt: hint, kind }) => ({ id: uid(), kind, label,
      prompt: hint, value: '', items: [] })), sources: [], evidence: [],
    draft: { title: title.trim(), doc: { type: 'doc', content: [{ type: 'paragraph', attrs: { id: uid() }, content: [] }] }, headId: uid() },
    evidenceUses: [], revision: revisionContent.passes.map(pass => ({ id: pass.id, reviewedDraftHeadId: null,
      checks: pass.checks.map(({ label }) => ({ id: uid(), label, state: 'pending', reason: '' })), notes: '' })),
    notes: [], milestones: MILESTONES.map(id => ({ id, state: 'pending', reason: '' })),
    legacyRaw: null, provenance: null, createdAt: at, updatedAt: at };
}

export function documentText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.text || '';
  if (node.type === 'hard_break') return '\n';
  return (node.content || []).map(documentText).join(['paragraph', 'heading', 'blockquote', 'list_item'].includes(node.type) ? '' : '\n');
}
export const draftWords = project => wordCount(documentText(project.draft.doc));

function shape(validator, value, label) {
  if (!validator(value)) throw Error(`${label}: ${ajv.errorsText(validator.errors, { separator: '; ' })}`);
}
export function validateWorkspace(value) {
  shape(validateWorkspaceShape, value, 'Workspace shape');
  canonical(value); // also rejects unsafe/prototype keys and unsupported values
  const projectIds = new Set();
  for (const project of value.projects) {
    if (projectIds.has(project.id)) throw Error('Duplicate project ID');
    projectIds.add(project.id);
    if (!project.title.trim()) throw Error('Project title is empty');
    if (new Set(project.revision.map(pass => pass.id)).size !== 6 || PASSES.some(id => !project.revision.some(pass => pass.id === id))) throw Error('Revision pass set invalid');
    if (new Set(project.milestones.map(m => m.id)).size !== 5 || MILESTONES.some(id => !project.milestones.some(m => m.id === id))) throw Error('Milestone set invalid');
    const childIds = new Set();
    const add = id => { if (childIds.has(id)) throw Error('Duplicate child ID'); childIds.add(id); };
    for (const item of project.criteria) add(item.id);
    for (const section of project.plan) {
      add(section.id);
      if (section.kind === 'text' && section.items.length) throw Error('Text plan contains list items');
      if (section.kind === 'list' && section.value) throw Error('List plan contains text value');
      section.items.forEach(item => add(item.id));
    }
    project.sources.forEach(item => add(item.id));
    project.evidence.forEach(item => {
      add(item.id);
      if (item.sourceId && !project.sources.some(source => source.id === item.sourceId)) throw Error('Missing evidence source');
      if (new Set(item.tags.map(tag => tag.trim().toLocaleLowerCase())).size !== item.tags.length) throw Error('Duplicate evidence tag');
    });
    project.evidenceUses.forEach(item => add(item.id));
    project.notes.forEach(item => add(item.id));
    project.revision.forEach(pass => pass.checks.forEach(item => add(item.id)));
    const blockIds = new Set(); let visible = 0;
    const visit = (node, depth = 0, listDepth = 0) => {
      if (depth > 12 || listDepth > 4) throw Error('Draft nesting bound');
      if (node.attrs?.id) { add(node.attrs.id); blockIds.add(node.attrs.id); }
      if (node.type === 'text') visible += [...node.text].length;
      (node.content || []).forEach(child => visit(child, depth + 1, listDepth + (['bullet_list', 'ordered_list'].includes(node.type) ? 1 : 0)));
    };
    visit(project.draft.doc);
    if (visible > 200000) throw Error('Draft character bound');
    for (const use of project.evidenceUses) {
      if (use.evidenceId && !project.evidence.some(item => item.id === use.evidenceId)) throw Error('Missing evidence use target');
      if (use.blockId && !blockIds.has(use.blockId)) throw Error('Missing evidence block');
    }
    for (const note of project.notes) if (note.blockId && !blockIds.has(note.blockId)) throw Error('Missing note block');
    for (const item of [...project.milestones, ...project.revision.flatMap(pass => pass.checks)]) {
      if (item.state === 'not-applicable' && !item.reason.trim()) throw Error('Not-applicable item needs a reason');
    }
    if (Date.parse(project.createdAt) > Date.parse(project.updatedAt)) throw Error('Project timestamps invalid');
  }
  if (value.activeProjectId && !projectIds.has(value.activeProjectId)) throw Error('Missing active project');
  for (const activity of value.activity) if (activity.projectId && !projectIds.has(activity.projectId)) throw Error('Missing activity project');
  return value;
}
export function validatePersisted(value, binding) {
  shape(validatePersistedShape, value, 'Persisted shape');
  if (binding && (value.binding.deploymentScope !== binding.deploymentScope || value.binding.learnerKey !== binding.learnerKey)) throw Error('Workspace belongs to another launch');
  validateWorkspace(value.workspace);
  return value;
}
export function validateBackup(value) {
  shape(validateBackupShape, value, 'Backup shape');
  if (value.kind === 'studio') validateWorkspace(value.payload);
  return value;
}
export function validateLegacy(value) {
  shape(validateLegacyShape, value, 'Legacy export shape');
  canonical(value);
  return value;
}
export function mutateWorkspace(workspace, change, action = 'edit', projectId = null) {
  const candidate = structuredClone(workspace);
  change(candidate);
  candidate.revision++;
  candidate.headId = uid();
  candidate.updatedAt = now();
  if (projectId) {
    const project = candidate.projects.find(p => p.id === projectId);
    if (project) project.updatedAt = candidate.updatedAt;
  }
  const activityAction = ({ 'create-project': 'project-created', 'draft-edit': 'draft-updated',
    'save-evidence': 'evidence-added', 'revision-check': 'revision-reviewed',
    'save-note': 'feedback-added', 'import-backup': 'import-applied',
    'archive-project': 'project-archived' })[action];
  if (activityAction && action !== 'draft-edit') candidate.activity.unshift({ id: uid(), action: activityAction, projectId, at: candidate.updatedAt });
  candidate.activity = candidate.activity.slice(0, 30);
  return validateWorkspace(candidate);
}
