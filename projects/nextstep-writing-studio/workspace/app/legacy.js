import { canonical, sha256, strictJSON } from './codec.js';
import { newProject, uid, validateLegacy } from './model.js';

const keyPrefix = 'personal-response:';
const now = () => new Date().toISOString();
const textBytes = value => new TextEncoder().encode(value);
function parseRaw(raw, label, warnings) {
  if (raw === null) return null;
  try { return strictJSON(raw, 500000); }
  catch (error) { warnings.push(`${label} could not be mapped; the exact raw text will remain in the imported project.`); return null; }
}
function addNote(project, title, body, originLabel = 'Legacy Writing Studio') {
  if (!body) return;
  project.notes.push({ id: uid(), title: title.slice(0, 160), body: String(body).slice(0, 20000), kind: 'note',
    originLabel: originLabel.slice(0, 250), dateReceived: null, blockId: null, addressed: false,
    createdAt: now(), updatedAt: now() });
}

export async function inspectLegacy(text) {
  const exportFile = validateLegacy(strictJSON(text, 1048576));
  const warnings = ['Legacy ownership was not recorded. Confirm this writing is yours before importing.'];
  const responses = parseRaw(exportFile.raw.responsesRaw, 'Responses', warnings);
  const notes = parseRaw(exportFile.raw.notesRaw, 'Notes', warnings);
  const fingerprint = await sha256(textBytes(canonical({ responsesRaw: exportFile.raw.responsesRaw, notesRaw: exportFile.raw.notesRaw })));
  const project = newProject({ title: 'Imported response — review your work', type: 'personal-response' });
  project.legacyRaw = { responsesRaw: exportFile.raw.responsesRaw || '', notesRaw: exportFile.raw.notesRaw || '' };
  project.provenance = { sourceFormat: 'nextstep.writing-studio.legacy', sourceAppVersion: 'legacy',
    sourceChecksum: fingerprint, importedAt: now(), originalProjectId: 'legacy-writing-studio' };
  if (responses && typeof responses === 'object' && !Array.isArray(responses)) {
    const value = key => typeof responses[`${keyPrefix}${key}`] === 'string' ? responses[`${keyPrefix}${key}`] : '';
    const idea = project.plan.find(section => section.label === 'Controlling idea');
    const connection = project.plan.find(section => section.label === 'Meaningful connection');
    if (idea) idea.value = value('idea');
    if (connection) connection.value = value('connection');
    addNote(project, 'Imported form or purpose', value('form'));
    addNote(project, 'Imported text selections', value('texts'));
    const evidence = value('evidence');
    if (evidence) project.evidence.push({ id: uid(), type: 'other', sourceId: null, locator: '', content: evidence,
      analysis: '', tags: [], verifiedByLearner: false, createdAt: now(), updatedAt: now() });
    const draft = value('draft');
    if (draft) project.draft.doc.content = draft.split('\n').map(line => ({ type: 'paragraph', attrs: { id: uid() }, content: line ? [{ type: 'text', text: line }] : [] }));
    for (const [key, rawValue] of Object.entries(responses)) {
      if (key.startsWith('evidence-draft') && typeof rawValue === 'string' && rawValue) {
        addNote(project, 'Unfinished evidence capture', rawValue);
        project.evidence.push({ id: uid(), type: 'other', sourceId: null, locator: '', content: rawValue,
          analysis: '', tags: [], verifiedByLearner: false, createdAt: now(), updatedAt: now() });
      }
    }
  } else if (exportFile.raw.responsesRaw) warnings.push('Responses were not an object; only the raw copy can be retained.');
  if (Array.isArray(notes)) {
    notes.forEach((entry, index) => {
      if (entry && typeof entry === 'object') {
        const body = typeof entry.answer === 'string' ? entry.answer : typeof entry.detail === 'string' ? entry.detail : canonical(entry);
        addNote(project, String(entry.source || `Legacy note ${index + 1}`), body, String(entry.source || 'Legacy Writing Studio'));
      }
    });
  } else if (exportFile.raw.notesRaw) warnings.push('Notes were not an array; only the raw copy can be retained.');
  if (Object.keys(responses || {}).some(key => !key.startsWith(keyPrefix) && !key.startsWith('evidence-draft'))) {
    addNote(project, 'Additional imported data', 'Additional legacy fields are preserved exactly in the project raw record.');
  }
  return { exportFile, project, fingerprint, warnings };
}
