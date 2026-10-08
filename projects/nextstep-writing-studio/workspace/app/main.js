import { APP_VERSION, draftWords, mutateWorkspace, newProject, newWorkspace, uid, validateWorkspace } from './model.js';
import { sha256, strictJSON } from './codec.js';
import { DraftEditor } from './editor.js';
import { SaveCoordinator, inspectBackup, makeBackup } from './persistence.js';
import guideContent from '../content/guides.json';
import { inspectLegacy } from './legacy.js';
import { NOTEBOOK_PROMPT, isLearningNotebook, isTeachingRoute } from './teaching.js';

import { CriticalEssayStudio, criticalHelp, revisionCategory } from './critical.js';

const main = document.querySelector('#main-content');
const rail = document.querySelector('#context-rail');
const indicator = document.querySelector('#save-indicator');
const nav = document.querySelector('#global-nav');
const announcer = document.querySelector('#announcement');
const shell = document.querySelector('.app-layout');
let workspace = null;
let boot = { kind: 'restoring' };
let editor = null;
let editorProjectId = null;
let inspectedImport = null;
let search = '';
let projectFilter = 'active';
let projectType = 'all';
let projectSort = 'modified';
let evidenceFilter = 'all';
let evidenceSearch = '';
let revisionPass = 'ideas';
let editingPlanId = null;
let addingPlan = false;
const save = new SaveCoordinator(status => {
  indicator.textContent = status.message;
  indicator.title = status.message;
  indicator.classList.toggle('is-warning', ['failed', 'capacity-blocked', 'recovery-required', 'unconfirmed'].includes(status.label));
});
const E = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const date = value => value ? new Date(value).toLocaleString() : 'Not set';
const route = () => decodeURI(location.hash.replace(/^#/, '') || '/home');
const go = path => { if (route() === path) render(); else location.hash = path; };
const activeProject = () => workspace?.projects.find(project => project.id === workspace.activeProjectId) || null;
const projectAt = id => workspace?.projects.find(project => project.id === id) || null;
const announce = message => { announcer.textContent = ''; requestAnimationFrame(() => { announcer.textContent = message; }); };
function mutation(change, action, projectId = null, repaint = true) {
  if (save.readOnly || !boot || ['restoring','recovery'].includes(boot.kind)) throw Error('This workspace is read-only.');
  const base = workspace || newWorkspace();
  const candidate = mutateWorkspace(base, change, action, projectId);
  workspace = candidate;
  save.notifyMutation(candidate);
  if (repaint) render();
}
const button = (label, action, cls = '') => `<button type="button" class="btn ${cls}" data-action="${E(action)}">${E(label)}</button>`;
const field = (name, label, value = '', type = 'text', extra = '') => `<div class="field"><label for="${E(name)}">${E(label)}</label>${type === 'textarea' ? `<textarea id="${E(name)}" name="${E(name)}" ${extra}>${E(value)}</textarea>` : `<input id="${E(name)}" name="${E(name)}" type="${E(type)}" value="${E(value)}" ${extra}>`}</div>`;
const option = (value, label, current) => `<option value="${E(value)}" ${value === current ? 'selected' : ''}>${E(label)}</option>`;
const icon = name => `<img class="ico" src="assets/icons/${name}.svg" alt="">`;
const card = body => `<section class="card">${body}</section>`;
const teaching = new CriticalEssayStudio({ main, getWorkspace: () => workspace,
  canSave: () => !save.readOnly && !['restoring','recovery','read-only'].includes(boot.kind),
  tabOnly: () => save.temp,
  announce, download, repaint: render,
  saveResponse: async (key, title, body) => {
    if (save.readOnly || ['restoring','recovery','read-only'].includes(boot.kind)) throw Error('Saved changes are unavailable in this launch.');
    if (save.temp && boot.kind === 'temporary-choice') {
      workspace = newWorkspace(); boot = { kind:'loaded', workspace, temporary:true }; save.acceptTemporary(workspace);
    }
    mutation(next => {
      let notebook = next.projects.find(isLearningNotebook);
      if (!notebook) { notebook = newProject({ title:'Critical Essay Studio practice notebook', type:'short-response', practiceMode:true, prompt:NOTEBOOK_PROMPT }); next.projects.push(notebook); }
      let note = notebook.notes.find(item => item.originLabel === key);
      const at = new Date().toISOString();
      if (!note) { note = { id:uid(), title, body:'', kind:'note', originLabel:key, dateReceived:null, blockId:null, addressed:false, createdAt:at, updatedAt:at }; notebook.notes.push(note); }
      Object.assign(note,{title,body,updatedAt:at}); notebook.updatedAt=at;
    }, 'save-practice');
    await save.flush('manual');
  },
  markReviewed: async id => {
    if (save.temp && boot.kind === 'temporary-choice') { workspace=newWorkspace(); boot={kind:'loaded',workspace,temporary:true}; save.acceptTemporary(workspace); }
    mutation(next => { const key=`lesson:${id}:reviewed`; next.library.bookmarks=next.library.bookmarks.includes(key)?next.library.bookmarks.filter(item=>item!==key):[...next.library.bookmarks,key]; },'review-lesson');
    await save.flush('manual');
  }
});
rail.addEventListener('click', event => {
  const button=event.target.closest('[data-study-scroll]');
  if(button){const target=main.querySelector(`#${button.dataset.studyScroll}`);if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});target.scrollIntoView({block:'start'});}}
});
function page(title, description, content, actions = '') {
  const heading=route().startsWith('/project/')?'h2':'h1';
  return `<header class="page-header"><${heading}>${E(title)}</${heading}><p>${E(description)}</p>${actions ? `<div class="page-actions">${actions}</div>` : ''}</header>${content}`;
}
function projectHeader(project, current) {
  const tabs = [['plan','Plan','plan'],['evidence','Evidence','evidence'],['draft','Draft','file'],['revision','Revision','revise'],['notes','Notes','feedback']];
  return `<div class="project-return"><a href="#/projects">${icon('arrow-left')}Back to My Work</a><a href="#/project/${E(project.id)}/overview">Assignment details</a></div><div class="project-heading"><div><h1>${E(project.title)}</h1><p class="project-subtitle">${project.type === 'critical-analysis' ? 'Critical Essay' : E(project.type.replaceAll('-',' '))} · ${project.track === 'english-30-1' ? 'English 30-1' : E(project.track)}${project.practiceMode ? ' · Practice' : ''}</p></div></div><nav class="tabs ws-project-tabs" aria-label="Project sections">${tabs.map(([id,label,glyph])=>`<a href="#/project/${E(project.id)}/${id}" ${current === id ? 'aria-current="page"' : ''}>${icon(glyph)}${label}</a>`).join('')}</nav>`;
}
function projectContext(project, current) {
  rail.hidden = false; shell.classList.remove('no-context');
  const reviewed=project.milestones.filter(item=>item.state==='reviewed').length;
  rail.innerHTML = `${card(`<div class="rail-heading"><h2>Your Progress</h2><a href="#/project/${E(project.id)}/overview">View all</a></div><p class="meta">Recorded by you · stages are optional</p><div class="ws-progress"><div class="ws-ring" style="--p:${reviewed/project.milestones.length*100}" aria-label="${reviewed} self-checks marked reviewed by you"><strong>${reviewed}<small>reviewed</small></strong></div><div class="ws-stage">${project.milestones.map(item=>`<span class="${item.state==='reviewed'?'done':''}"><i aria-hidden="true">${item.state==='reviewed'?'✓':''}</i>${E(item.id[0].toUpperCase()+item.id.slice(1))}<small>${item.state==='reviewed'?'Reviewed':item.state==='not-applicable'?'Not applicable':'Not recorded'}</small></span>`).join('')}</div></div><a href="#/project/${E(project.id)}/overview">Update my self-checks</a>`)}${card(`<h2 class="rail-icon-heading">${icon('plan')}Assignment Prompt</h2><p class="rail-prompt">${project.prompt ? E(project.prompt) : 'Add your own assignment when you are ready.'}</p><a href="#/project/${E(project.id)}/edit">Edit prompt &amp; details</a>`)}${card(`<h2 class="rail-icon-heading">${icon('edit')}Next Step</h2><p>Choose the stage that helps you today. Your plan can change as your interpretation develops.</p><a class="btn primary" href="#/project/${E(project.id)}/${current === 'draft' ? 'revision' : 'draft'}">${current==='draft'?'Open revision':'Open draft'}${icon('arrow-right')}</a>`)}<div class="ws-quote"><img src="assets/decoration/studio-leaf.svg" alt=""><blockquote>“A precise detail becomes evidence when you explain what it helps us understand.”</blockquote><p>Next Step English</p></div>`;
}
function clearContext() { rail.hidden = true; rail.innerHTML = ''; shell.classList.add('no-context'); }

function renderHome() {
  const projects = workspace?.projects.filter(project => !project.archived) || [];
  if (!projects.length) return page('Your writing starts here', 'Start with a blank page or a guided plan. Your work stays in this workspace until you export or remove it.',
    `<div class="empty"><h2>No projects yet</h2><p>Create a project for an assignment or for independent practice. You can add a prompt later.</p><div class="page-actions"><a class="btn primary" href="#/projects/new">New essay</a><a class="btn" href="#/settings">Import backup</a></div></div><div class="card-grid" style="margin-top:18px">${card('<h3>Plan</h3><p>Capture an idea and supporting points before drafting.</p>')}${card('<h3>Draft</h3><p>Write in a focused editor; your words remain yours.</p>')}${card('<h3>Revise</h3><p>Work through six self-review passes at your own pace.</p>')}</div>`);
  const recent = [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const latest = recent[0];
  return page('Welcome back', 'Continue your writing or start a new project.', `${card(`<p class="eyebrow">Continue writing</p><h2>${E(latest.title)}</h2><p>${draftWords(latest)} words · ${E(latest.status)} · Last edited ${E(date(latest.updatedAt))}</p><a class="btn primary" href="#/project/${E(latest.id)}/draft">Open draft</a>`)}<h2 style="margin-top:28px">Recent projects</h2><div class="card-grid">${recent.slice(0, 3).map(project => card(`<span class="pill">${E(project.type.replaceAll('-', ' '))}</span><h3 style="margin-top:12px">${E(project.title)}</h3><p class="meta">${draftWords(project)} words · ${E(date(project.updatedAt))}</p><a href="#/project/${E(project.id)}/overview">Open project</a>`)).join('')}</div>`, `<a class="btn primary" href="#/projects/new">New essay</a><a class="btn" href="#/projects">View all projects</a>`);
}
function renderProjects() {
  const items = (workspace?.projects || []).filter(project => !isLearningNotebook(project) && (projectFilter === 'all' || (projectFilter === 'archived') === project.archived) &&
    (projectType === 'all' || project.type === projectType) && `${project.title} ${project.prompt}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => projectSort === 'title' ? a.title.localeCompare(b.title) : projectSort === 'created' ? b.createdAt.localeCompare(a.createdAt) : b.updatedAt.localeCompare(a.updatedAt));
  return page('My Work', 'Each project holds its own plan, evidence, draft, revision work, and notes.',
    `<div class="filters"><input aria-label="Search projects" id="project-search" placeholder="Search title or prompt" value="${E(search)}"><select aria-label="Filter projects" id="project-filter">${option('active', 'Active', projectFilter)}${option('archived', 'Archived', projectFilter)}${option('all', 'All', projectFilter)}</select><select aria-label="Writing type" id="project-type">${[['all','All types'],['personal-response','Personal response'],['critical-analysis','Critical essay'],['argument','Argument'],['narrative','Narrative'],['short-response','Short response'],['blank','Blank']].map(([v,l])=>option(v,l,projectType)).join('')}</select><select aria-label="Sort projects" id="project-sort">${option('modified','Recently edited',projectSort)}${option('created','Recently created',projectSort)}${option('title','Title',projectSort)}</select></div>${items.length ? `<div class="card-grid">${items.map(project => card(`<p class="eyebrow">${E(project.type.replaceAll('-', ' '))}</p><h2>${E(project.title)}</h2><p class="meta">${project.archived ? 'Archived · ' : ''}${E(project.status)} · ${draftWords(project)} words</p><p class="meta">Edited ${E(date(project.updatedAt))}</p><a class="btn compact" href="#/project/${E(project.id)}/overview">Open project</a>`)).join('')}</div>` : `<div class="empty"><h2>No matching projects</h2><p>Try another search or create a new project.</p></div>`}`, `<a class="btn primary" href="#/projects/new">New essay</a>`);
}
function renderNewProject() {
  return page('New critical essay', 'Start a separate piece of work. New critical essays use English 30-1 and empty planning fields; bring your own assignment and text.',
    `<form id="new-project-form" class="card stack">${field('title', 'Essay title', '', 'text', 'required maxlength="160"')}
      <input id="type" name="type" type="hidden" value="critical-analysis"><p class="preset-label">Critical / Analytical Essay · English 30-1</p>
      ${field('prompt', 'Assignment prompt (optional)', '', 'textarea', 'maxlength="12000"')}
      <div class="field-row">${field('targetWords', 'Word goal (optional)', '', 'number', 'min="1" max="20000"')}${field('dueDate', 'Due date (optional)', '', 'date')}</div>
      <div class="checkbox-row"><input id="practiceMode" name="practiceMode" type="checkbox"><label for="practiceMode">This is independent practice</label></div>
      <div class="inline-actions"><button class="btn primary" type="submit">Create essay</button><a class="btn" href="#/projects">Cancel</a></div>
    </form>`);
}
function renderOverview(project) {
  return `${projectHeader(project, 'overview')}${page('Project overview', 'Keep the task and your progress together without turning self-checks into a grade.',
    `<div class="two-col">${card(`<h2>Assignment details</h2><p><strong>Prompt</strong><br>${project.prompt ? E(project.prompt) : 'No prompt yet.'}</p><p><strong>Word goal</strong><br>${project.targetWords ?? 'Not set'}</p><p><strong>Due date</strong><br>${project.dueDate ? E(project.dueDate) : 'Not set'}</p>${project.criteria.length ? `<p><strong>My criteria</strong></p><ul>${project.criteria.map(item => `<li>${E(item.text)}</li>`).join('')}</ul>` : ''}${button('Edit details', 'edit-project', 'compact')}`)}
    ${card(`<h2>Writing progress</h2><p>${draftWords(project)} words in draft</p><p>Status: <strong>${E(project.status)}</strong></p><a class="btn primary" href="#/project/${E(project.id)}/draft">Open draft</a>`)}</div>
    <section class="card" style="margin-top:16px"><h2>Self-check milestones</h2><p class="muted">These help you plan. They do not submit or mark an assignment complete in Brightspace.</p>${project.milestones.map(item => `<div class="list-row"><div><strong>${E(item.id[0].toUpperCase() + item.id.slice(1))}</strong>${item.reason ? `<p class="meta">${E(item.reason)}</p>` : ''}</div><select aria-label="${E(item.id)} state" data-milestone="${E(item.id)}" ${save.readOnly ? 'disabled' : ''}>${option('pending', 'Not started', item.state)}${option('reviewed', 'Reviewed', item.state)}${option('not-applicable', 'Not applicable', item.state)}</select></div>`).join('')}</section>
    <div class="page-actions">${button('Rename', 'rename-project')}${button(project.archived ? 'Restore project' : 'Archive project', 'archive-project')}${button('Duplicate project', 'duplicate-project')}${button('Export project backup', 'export-project')}</div>`)} `;
}
function renderProjectDetails(project) {
  return `${projectHeader(project, 'overview')}${page('Edit project details', 'Update the task without changing your draft or evidence.',
    `<form id="project-details-form" class="card">${field('title','Project title',project.title,'text','required maxlength="160"')}${field('prompt','Assignment prompt',project.prompt,'textarea','maxlength="12000"')}<div class="field-row">${field('targetWords','Word goal (optional)',project.targetWords ?? '','number','min="1" max="20000"')}${field('dueDate','Due date (optional)',project.dueDate ?? '','date')}</div><div class="field"><label for="projectStatus">Writing stage</label><select name="status" id="projectStatus">${[['planning','Planning'],['drafting','Drafting'],['revising','Revising'],['ready','Ready for your own submission steps']].map(([v,l])=>option(v,l,project.status)).join('')}</select><p class="helper">Ready does not submit this work to Brightspace.</p></div>${field('criteria','My criteria or reminders, one per line',project.criteria.map(item=>item.text).join('\n'),'textarea')}<div class="inline-actions"><button class="btn primary" type="submit">Save details</button><a class="btn" href="#/project/${E(project.id)}/overview">Cancel</a></div></form>`)} `;
}
function renderPlan(project) {
  const planCard = (section,index) => `<section class="ws-plan-card plan-card">${editingPlanId === section.id ? `<form class="plan-edit-form" data-id="${E(section.id)}"><h2>${E(section.label)}</h2><p class="muted">${E(section.prompt)}</p>${field('plan-value',section.kind==='list'?'One supporting point per line':section.label,section.kind==='list'?section.items.map(item=>item.text).join('\n'):section.value,'textarea',section.kind==='list'?'maxlength="16000"':'maxlength="16000"')}<div class="inline-actions"><button class="btn primary" type="submit">Save plan</button>${button('Cancel','cancel-plan','compact')}</div></form>` : `<div class="ws-plan-card-head"><div class="ws-plan-card-title"><span class="ws-round-icon ${index%2?'gold':''}">${icon(['lightbulb','target','list','book-open'][index%4])}</span><h2>${E(section.label)}</h2></div><button class="ws-edit-link" data-action="edit-plan:${E(section.id)}">Edit${icon('edit')}</button></div><div class="plan-value ${section.kind==='list'?'plan-list':''}">${section.kind==='list'?`<div class="ws-numbered">${section.items.length ? section.items.map((item,i)=>`<div><b>${i+1}</b><span>${E(item.text)}<span class="point-actions">${button('Move up',`plan-up:${section.id}:${item.id}`,'compact')}${button('Move down',`plan-down:${section.id}:${item.id}`,'compact')}</span></span></div>`).join(''):'<p class="muted">Add as many distinct points as your argument needs.</p>'}</div>`:section.value?E(section.value):'<p class="muted">Add your own thinking when you are ready.</p>'}</div><p class="ws-helper">${icon('info')}${E(section.prompt)}</p>`}</section>`;
  const closing = project.type==='critical-analysis' && project.plan.length===5 && project.plan[4].label==='Closing Insight';
  return `${projectHeader(project,'plan')}${page('Plan Your Essay','Turn ideas into a clear direction. Every field is optional.',`<div class="ws-plan-grid">${project.plan.slice(0,closing?4:project.plan.length).map(planCard).join('')}</div>${closing?`<details class="closing-plan" ${editingPlanId===project.plan[4].id?'open':''}><summary>Closing guidance &amp; my closing insight</summary>${planCard(project.plan[4],4)}</details>`:''}${criticalHelp(['task','interpretation','organization'],'Planning teaching & examples')}${criticalHelp(['openings'],'Openings & closing guidance')}${addingPlan?`<form id="add-plan-form" class="card">${field('plan-label','Planning note label','','text','required maxlength="160"')}<button class="btn primary" type="submit">Add note</button>${button('Cancel','cancel-plan','compact')}</form>`:''}<div class="page-actions">${button('Add planning note','add-plan')}<a class="btn primary" href="#/project/${E(project.id)}/draft">Open draft${icon('arrow-right')}</a></div>`)} `;
}
function renderEvidence(project) {
  const items = project.evidence.filter(item => (evidenceFilter === 'all' || item.type === evidenceFilter) &&
    `${item.content} ${item.analysis} ${item.tags.join(' ')} ${project.sources.find(source => source.id === item.sourceId)?.title || ''}`.toLowerCase().includes(evidenceSearch.toLowerCase()));
  return `${projectHeader(project, 'evidence')}${page('Evidence', 'Collect details and explain why they matter. Check quotations against your source yourself.',
    `${criticalHelp(['evidence','explain'],'Select & explain evidence')}<div class="filters"><input id="evidence-search" aria-label="Search evidence" placeholder="Search details, analysis, source or tags" value="${E(evidenceSearch)}"><select id="evidence-filter" aria-label="Filter evidence">${[['all', 'All evidence'], ['quote', 'Quotes'], ['paraphrase', 'Paraphrases'], ['scene', 'Scenes'], ['personal-example', 'Personal examples'], ['other', 'Other']].map(([v, label]) => option(v, label, evidenceFilter)).join('')}</select></div>${items.length ? `<div class="stack">${items.map(item => {
      const source = project.sources.find(source => source.id === item.sourceId);
      return card(`<p class="eyebrow">${E(item.type.replaceAll('-', ' '))}${item.verifiedByLearner ? ' · Checked by you' : ''}</p><blockquote>${E(item.content)}</blockquote>${item.analysis ? `<p><strong>Why it matters</strong><br>${E(item.analysis)}</p>` : ''}<p class="meta">${source ? E(source.title) : 'No source'}${item.locator ? ` · ${E(item.locator)}` : ''}</p>${source?.url ? `<p><a href="${E(source.url)}" target="_blank" rel="noopener noreferrer">Open source in a new tab</a></p>` : ''}<div class="inline-actions">${button('Edit', `edit-evidence:${item.id}`, 'compact')}${button('Use in draft', `use-evidence:${item.id}`, 'compact')}${button('Remove', `remove-evidence:${item.id}`, 'compact danger')}</div>`);
    }).join('')}</div>` : `<div class="empty"><h2>No evidence here yet</h2><p>Add a quotation, scene, example or idea when it helps your writing.</p></div>`}`, `${button('Add evidence', 'new-evidence', 'primary')}`)} `;
}
function renderEvidenceForm(project, id = null) {
  const item = id ? project.evidence.find(entry => entry.id === id) : null;
  return `${projectHeader(project, 'evidence')}${page(item ? 'Edit evidence' : 'Add evidence', 'Record the detail exactly. Check your sources and use the citation format required by your assignment.',
    `<form id="evidence-form" class="card" data-id="${E(id || '')}"><div class="field"><label for="evidenceType">Type</label><select name="type" id="evidenceType">${[['quote','Quote'],['paraphrase','Paraphrase'],['scene','Scene'],['personal-example','Personal example'],['other','Other']].map(([v,l]) => option(v,l,item?.type || 'quote')).join('')}</select></div>
    ${field('content', 'Detail or quotation', item?.content || '', 'textarea', 'required maxlength="8000"')}${field('analysis', 'Why it matters (optional)', item?.analysis || '', 'textarea', 'maxlength="8000"')}
    ${field('sourceTitle', 'Source title (optional)', project.sources.find(source => source.id === item?.sourceId)?.title || '', 'text', 'maxlength="250"')}${field('creator', 'Author or creator (optional)', project.sources.find(source => source.id === item?.sourceId)?.creator || '', 'text', 'maxlength="200"')}
    ${field('sourceUrl', 'Source link (optional)', project.sources.find(source => source.id === item?.sourceId)?.url || '', 'url', 'maxlength="2048" placeholder="https://…"')}${field('sourceNotes', 'Source notes (optional)', project.sources.find(source => source.id === item?.sourceId)?.notes || '', 'textarea', 'maxlength="2000"')}
    ${field('locator', 'Page, line or scene (optional)', item?.locator || '', 'text', 'maxlength="240"')}${field('tags', 'Tags, separated by commas (optional)', item?.tags.join(', ') || '', 'text', 'maxlength="500"')}
    <div class="checkbox-row"><input id="verifiedByLearner" name="verifiedByLearner" type="checkbox" ${item?.verifiedByLearner ? 'checked' : ''}><label for="verifiedByLearner">I checked this against my source</label></div><div class="page-actions"><button class="btn primary" type="submit">Save evidence</button><a class="btn" href="#/project/${E(project.id)}/evidence">Cancel</a></div></form>`)} `;
}
function renderDraft(project, focus = false) {
  const head = focus ? `<div class="page-actions no-print"><a class="btn" href="#/project/${E(project.id)}/draft">Exit focus</a><button class="btn" type="button" data-action="manual-save">Save now</button></div><h1>${E(project.title)}</h1>` : projectHeader(project, 'draft') + `<div class="project-heading"><div><h2>Draft</h2><p class="muted">Your writing stays editable until you choose to export it.</p></div><div class="inline-actions">${button('Focus', 'focus-mode')}${button('Export', 'export-draft')}${button('Save now', 'manual-save')}</div></div>`;
  return `${head}${focus?'':criticalHelp(['organization','explain','openings'],'Paragraph, opening & conclusion teaching')}<div class="editor-toolbar no-print" aria-label="Draft formatting toolbar">${[['bold','Bold'],['italic','Italic'],['underline','Underline'],['paragraph','Paragraph'],['heading','Heading'],['bullet','Bulleted list'],['numbered','Numbered list'],['undo','Undo'],['redo','Redo'],['link','Link']].map(([name,label]) => `<button type="button" data-editor-command="${name}" aria-label="${label}" title="${label}">${label}</button>`).join('')}</div><div id="editor-host" class="editor-host"></div><div class="editor-footer no-print"><span id="word-count">${draftWords(project)} words</span><span>Autosave uses the destination shown above.</span></div>`;
}
function renderRevision(project) {
  const pass = project.revision.find(pass => pass.id === revisionPass) || project.revision[0];
  return `${projectHeader(project, 'revision')}${page('Revision lab', 'Use six passes to review your own draft. Checked items are your own notes, not automatic marking.',
    `<nav class="tabs" aria-label="Revision passes">${project.revision.map(item => `<button type="button" class="btn compact" data-action="revision-pass:${E(item.id)}" ${item.id === pass.id ? 'aria-current="page"' : ''}>${E(item.id[0].toUpperCase() + item.id.slice(1))}</button>`).join('')}</nav>${card(`<p class="eyebrow">${E(pass.id)} review</p><h2>Look again with one purpose</h2>${revisionCategory(pass.id)}${pass.reviewedDraftHeadId && pass.reviewedDraftHeadId !== project.draft.headId ? '<div class="warning">Draft changed since this review. Revisit these checks when ready.</div>' : ''}${pass.checks.map(check => `<div class="revision-check"><select aria-label="${E(check.label)}" data-revision-check="${E(pass.id)}:${E(check.id)}">${option('pending','Not reviewed',check.state)}${option('reviewed','Reviewed',check.state)}${option('not-applicable','Not applicable',check.state)}</select><div><strong>${E(check.label)}</strong>${check.reason ? `<p class="meta">${E(check.reason)}</p>` : ''}</div></div>`).join('')}<div class="field"><label for="revision-notes">Notes for this pass</label><textarea id="revision-notes" data-revision-note="${E(pass.id)}">${E(pass.notes)}</textarea></div><div class="inline-actions">${button('Save revision notes', 'save-revision-notes', 'primary')}<a class="btn" href="#/project/${E(project.id)}/draft">Open draft</a></div>`)}`)} `;
}
function renderNotes(project) {
  return `${projectHeader(project, 'notes')}${page('Notes and feedback', 'Keep your own observations and feedback you received. All feedback here is entered by you.',
    `${criticalHelp(['revision'],'Practice, reflection & feedback guidance')}${project.notes.length ? `<div class="stack">${project.notes.map(note => card(`<p class="eyebrow">${note.kind === 'feedback' ? 'Feedback I received · Added by you' : 'My note'}</p><h2>${E(note.title)}</h2><p style="white-space:pre-wrap">${E(note.body)}</p>${note.originLabel ? `<p class="meta">Source entered by you: ${E(note.originLabel)}</p>` : ''}<p class="meta">${E(date(note.updatedAt))}${note.addressed ? ' · Addressed' : ''}</p><div class="inline-actions">${button('Edit', `edit-note:${note.id}`, 'compact')}${button(note.addressed ? 'Mark open' : 'Mark addressed', `address-note:${note.id}`, 'compact')}${button('Remove', `remove-note:${note.id}`, 'compact danger')}</div>`)).join('')}</div>` : `<div class="empty"><h2>No notes yet</h2><p>Add an idea to revisit or record feedback you received elsewhere.</p></div>`}`, `${button('Add note', 'new-note', 'primary')}`)} `;
}
function renderNoteForm(project, id = null) {
  const note = id ? project.notes.find(item => item.id === id) : null;
  return `${projectHeader(project, 'notes')}${page(note ? 'Edit note' : 'Add note', 'Feedback is entered by you. Record feedback you received and the revision it suggests.',
    `<form id="note-form" class="card" data-id="${E(id || '')}"><div class="field"><label for="kind">Kind</label><select id="kind" name="kind">${option('note','My note',note?.kind || 'note')}${option('feedback','Feedback I received',note?.kind || 'note')}</select></div>${field('title','Title',note?.title || '','text','required maxlength="160"')}${field('body','Note',note?.body || '','textarea','required maxlength="16000"')}${field('originLabel','Source of feedback (optional)',note?.originLabel || '','text','maxlength="250"')}<div class="page-actions"><button class="btn primary" type="submit">Save note</button><a class="btn" href="#/project/${E(project.id)}/notes">Cancel</a></div></form>`)} `;
}

const library = guideContent.guides;
function renderLibrary(id = null) {
  if (id) {
    const guide = library.find(item => item.id === id);
    if (!guide) return page('Guide not found', 'Return to the Writing Library.', '<a class="btn" href="#/library">Writing Library</a>');
    return `<a href="#/library">← Writing Library</a>${page(guide.title, 'A guide to use alongside your own writing.', `<div class="warning">Candidate teaching content — teacher review required before classroom release.</div><article class="card library-article" style="margin-top:16px"><p class="eyebrow">${E(guide.category)}</p><h2>What to notice</h2><p>${E(guide.explanation)}</p><h2>${E(guide.exampleLabel || 'Original fictional example')}</h2><p>${E(guide.workedExample)}</p><h2>Try it</h2><p>${E(guide.practice)}</p>${button(workspace?.library.bookmarks.includes(guide.id) ? 'Remove bookmark' : 'Bookmark guide', `bookmark:${guide.id}`)}</article>`)} `;
  }
  return page('Writing Library', 'Short original guides for planning, analysis, evidence, and revision.', `<div class="warning">These guides are original candidate teaching content. An English teacher must review them before classroom release.</div><div class="card-grid" style="margin-top:16px">${library.map(guide => card(`<p class="eyebrow">${E(guide.category)}</p><h2>${E(guide.title)}</h2><p>${E(guide.explanation)}</p><a href="#/library/${E(guide.id)}">Read guide</a>`)).join('')}</div>`);
}
function renderFeedback() {
  const items = (workspace?.projects || []).flatMap(project => project.notes.filter(note => note.kind === 'feedback').map(note => ({ project, note })));
  return page('Feedback notes', 'Feedback entered by you across your projects. This is not a teacher messaging inbox.',
    items.length ? `<div class="stack">${items.map(({project,note}) => card(`<p class="eyebrow">${E(project.title)} · Added by you</p><h2>${E(note.title)}</h2><p>${E(note.body)}</p><a href="#/project/${E(project.id)}/notes">Open project notes</a>`)).join('')}</div>` : '<div class="empty"><h2>No feedback notes yet</h2><p>Open a project to record feedback you received.</p></div>');
}
function renderHelp() {
  return page('Help and saving', 'Prepare and preserve your critical essay. Export the work you intend to submit through your teacher’s chosen process.',
    `<div class="stack">${card('<h2>Where is my work saved?</h2><p>Check the status in the top bar. “LMS player accepted save” reports the SCORM player response, not independent proof of server storage. In temporary mode, work stays in this browser tab. Export a backup regularly.</p>')}${card('<h2>What if saving fails?</h2><p>Keep this page open, use Retry save, and export a full backup from Settings. Do not assume another device has the latest copy until you reopen it there.</p>')}${card('<h2>Does Export submit my work?</h2><p>No. Export creates a file for you to review and upload where your teacher directed you.</p>')}${card('<h2>Can I use more than one device?</h2><p>Use one device at a time for the same SCORM attempt. Make a portable backup before changing devices. Simultaneous sessions can overwrite one another.</p>')}${card('<h2>Moving from the older Writing Studio</h2><p>Open the original course in the browser where that work was saved. An authorized administrator can run the read-only legacy exporter there. Then choose its .wstudio-legacy.json file in Settings. This app cannot search another page’s browser storage or pull it from Brightspace automatically.</p>')}</div>`);
}
function renderSettings() {
  const current=save.status, prefs=workspace?.preferences, selected=activeProject();
  return `<header class="settings-heading"><div><p class="settings-label">Settings</p><h1>Settings</h1><p>Manage your saves, preferences, and data.</p></div><blockquote>“A well-organized space<br>leads to a clearer mind.”<small>Next Step English</small></blockquote></header>
    <section class="settings-save"><span class="settings-status-mark">${icon(current.acceptedRevision ? 'check' : 'save')}</span><div class="settings-save-copy"><h2 class="storage-status">${E(current.message)}</h2><p class="storage-detail">Your work uses the save destination shown here. You can also create a portable backup anytime.</p></div><div class="settings-save-facts"><p>${icon('cloud')}<span><strong>Save destination</strong><small>${E(current.localDestination==='tab'?'This browser tab recovery copy':current.localDestination==='device'?'This device':'No local recovery copy')}</small></span></p><p>${icon('revise')}<span><strong>Current revision: ${current.currentRevision ?? 0}</strong><small>Player-accepted revision: ${current.acceptedRevision ?? 'none'}</small></span></p><div class="inline-actions">${button('Save now','manual-save')}${button('Retry save','retry-save')}</div></div></section>
    <div class="settings-grid">
    ${card(`<h2>${icon('download')}Export Project</h2><p>A portable copy of one project, including its plan, evidence, draft and notes.</p><p class="meta">Selected: ${selected?E(selected.title):'Choose a project in My Work'}</p>${selected?button('Export project backup','settings-export-project','primary'):'<a class="btn" href="#/projects">Choose project</a>'}`)}
    ${card(`<h2>${icon('archive')}Full Backup</h2><p>All projects, the practice notebook, and settings in the existing .wstudio format.</p><p class="meta">Keep a copy before changing devices.</p>${button('Export backup','export-backup','primary')}`)}
    ${card(`<h2>${icon('upload')}Import Backup</h2><p>Choose a backup, then review it before adding copies. Existing work stays in place.</p><label class="file-label" for="backup-file">Choose backup file<input type="file" id="backup-file" accept=".wstudio,.wstudio-project,.wstudio-legacy.json,application/json"></label>`)}
    ${card(`<h2>${icon('clock')}Save &amp; Recovery</h2><p>Your draft is saved through the destination shown above.</p><p class="meta">${current.wireChars?`Last player-accepted storage size: ${current.wireChars} / 56,000 characters.`:'No player-accepted storage size recorded.'}</p><a href="#/help">Read the saving guide</a>`)}
    ${prefs?`<form id="preferences-form" class="card"><h2>${icon('settings')}Display Preferences</h2><div class="field"><label for="editorFont">Draft font</label><select name="editorFont" id="editorFont">${option('serif','Serif',prefs.editorFont)}${option('sans','Sans serif',prefs.editorFont)}</select></div><div class="field-row"><div class="field"><label for="editorFontSize">Text size</label><select name="editorFontSize" id="editorFontSize">${[17,19,22,26].map(n=>option(String(n),`${n} px`,String(prefs.editorFontSize))).join('')}</select></div><div class="field"><label for="lineHeight">Line spacing</label><select name="lineHeight" id="lineHeight">${[1.5,1.7,2].map(n=>option(String(n),String(n),String(prefs.lineHeight))).join('')}</select></div></div><div class="checkbox-row"><input type="checkbox" name="highContrast" id="highContrast" ${prefs.highContrast?'checked':''}><label for="highContrast">High contrast</label></div><button class="btn primary" type="submit">Save preferences</button></form>`:''}
    ${card(`<h2>${icon('focus')}Focus Mode</h2><p>Hide surrounding panels when you want to concentrate on your draft. Your plan and evidence stay available when you return.</p>${selected?`<a class="btn" href="#/project/${E(selected.id)}/focus">Open selected draft in focus</a>`:'<a href="#/projects">Choose a draft</a>'}`)}</div>
    <section class="card accessibility-settings"><h2>${icon('eye')}Accessibility &amp; Draft Export</h2><p>Use keyboard navigation, resize text, or choose a higher contrast display. Motion follows your device preference.</p><p>Open the intended draft and choose Export for text, HTML, or Print / PDF. Export creates your file; follow your teacher’s submission instructions.</p><a href="#/projects">Open My Work</a></section>`;
}
function renderImport() {
  if (!inspectedImport) return page('No backup selected', 'Choose a backup file in Settings.', '<a class="btn" href="#/settings">Settings</a>');
  const legacy = inspectedImport.kind === 'legacy';
  const projects = legacy ? [inspectedImport.project] : inspectedImport.kind === 'studio' ? inspectedImport.payload.projects : [inspectedImport.payload];
  const checksum = legacy ? inspectedImport.fingerprint : inspectedImport.checksum.value;
  const repeated = workspace?.imports.some(item => item.checksum === checksum);
  return page('Review backup import', 'Nothing has been changed yet. Each project will be added as a new copy with fresh IDs.',
    `${repeated ? '<div class="warning">This exact source was imported before. Continuing will add another copy.</div>' : ''}${legacy ? `<div class="warning">Legacy import is off by default. Confirm that this is your own writing. Original raw data will be retained in the imported project.${inspectedImport.warnings.map(warning => `<p>${E(warning)}</p>`).join('')}</div>` : ''}<div class="card" style="margin-top:16px"><p class="eyebrow">${legacy ? 'Legacy export' : `Verified ${E(inspectedImport.kind)} backup · Schema ${inspectedImport.schemaVersion}`}</p><h2>${projects.length} project${projects.length === 1 ? '' : 's'} to add</h2><p class="meta">Exported ${E(date(legacy ? inspectedImport.exportFile.exportedAt : inspectedImport.exportedAt))}</p>${projects.map(project => `<div class="list-row"><div><strong>${E(project.title)}</strong><p class="meta">${E(project.type.replaceAll('-', ' '))} · ${draftWords(project)} draft words</p></div></div>`).join('')}<p class="helper">Existing projects will remain. Imported work may still be pending an LMS player save afterward.</p></div><div class="page-actions">${button(legacy ? 'This is my writing — import' : 'Import as new copies', 'confirm-import', 'primary')}<a class="btn" href="#/settings">Cancel</a></div>`);
}

function renderRecovery() {
  const cause = boot?.cause || 'The workspace could not be opened safely.';
  const local = boot?.local, remote = boot?.remote;
  return page('Recovery needed', 'Critical Essay Studio stopped before making changes. Review the available copies and export anything you need.',
    `<div class="error"><strong>${E(cause)}</strong><p>Nothing has been replaced automatically.</p></div>
      <div class="card-grid" style="margin-top:18px">${local ? card(`<h2>This-tab copy</h2><p>${local.projects.length} projects · Revision ${local.revision}</p>${button('Export this-tab copy', 'export-local-recovery')}`) : ''}
      ${remote ? card(`<h2>LMS player copy</h2><p>${remote.projects.length} projects · Revision ${remote.revision}</p>${button('Export LMS copy', 'export-remote-recovery')}`) : ''}
      ${boot?.rawLocal ? card(`<h2>Raw this-tab data</h2><p>Export the unreadable browser copy for support. This file may contain student writing.</p>${button('Export raw this-tab data', 'export-raw-local-recovery')}`) : ''}
      ${boot?.rawRemote ? card(`<h2>Raw LMS data</h2><p>Export the unreadable original for support. This file may contain student writing.</p>${button('Export raw data', 'export-raw-recovery')}`) : ''}</div>
      <div class="page-actions">${!save.readOnly && local && remote ? button('Continue with LMS copy', 'choose-remote', 'primary') : ''}${!save.readOnly && local ? button('Continue with this-tab copy', 'choose-local') : ''}</div>
      <p class="helper">If your teacher or administrator can reopen the original SCORM attempt, preserve a backup before changing it.</p>`);
}
function renderTemporaryChoice() {
  return page('Temporary writing space', 'No SCORM player was found. You can write in this tab and export a backup; this is separate from any Brightspace attempt.',
    `<div class="warning"><strong>No LMS connection</strong><p>Closing this tab or clearing browser data may remove your work. Importing into Brightspace later requires a backup file.</p></div><div class="page-actions">${button('Continue in this tab', 'start-temporary', 'primary')}</div>`);
}

function render() {
  if (!boot) return;
  const path = route();
  document.body.classList.toggle('focus-mode', /\/focus$/.test(path));
  document.body.classList.toggle('high-contrast', !!workspace?.preferences.highContrast);
  document.body.classList.toggle('editor-sans', workspace?.preferences.editorFont === 'sans');
  document.body.style.setProperty('--editor-size', `${workspace?.preferences.editorFontSize || 19}px`);
  document.body.style.setProperty('--editor-line', String(workspace?.preferences.lineHeight || 1.7));
  nav.querySelectorAll('a[data-nav]').forEach(link => {
    const active = path.startsWith(`/${link.dataset.nav}`) || (path.startsWith('/project/') && link.dataset.nav === 'projects') || (['/critical','/lessons','/explorer','/response','/library','/study-notes'].some(prefix=>path.startsWith(prefix)) && link.dataset.nav==='resources');
    if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
  clearContext();
  if (isTeachingRoute(path)) {
    main.innerHTML = teaching.render(path);
    rail.hidden=false; shell.classList.remove('no-context'); rail.innerHTML=teaching.context(path);
    teaching.afterRender();
    return;
  }
  if (boot.kind === 'restoring') { main.innerHTML='<div class="restore-screen" role="status"><h1>Opening your workspace…</h1><p>Checking the save location before editing starts.</p></div>'; return; }
  if (boot.kind === 'recovery') { main.innerHTML = renderRecovery(); return; }
  if (boot.kind === 'temporary-choice') { main.innerHTML = renderTemporaryChoice(); return; }
  if (boot.kind === 'read-only' && !workspace) { main.innerHTML = page('Read-only attempt', 'This LMS launch does not permit writing.', '<a class="btn" href="#/help">Saving guide</a>'); return; }
  let output;
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'project' && parts[1]) {
    const project = projectAt(parts[1]);
    if (!project) { output = page('Project not found', 'Choose another project.', '<a class="btn" href="#/projects">My Projects</a>'); }
    else {
      if (workspace?.activeProjectId !== project.id && !save.readOnly) mutation(next => { next.activeProjectId = project.id; }, 'open-project', project.id, false);
      const section = parts[2] || 'overview';
      if (section !== 'focus') projectContext(project, section);
      switch (section) {
        case 'overview': output = renderOverview(project); break;
        case 'edit': output = renderProjectDetails(project); break;
        case 'plan': output = renderPlan(project); break;
        case 'evidence': output = parts[3] === 'new' ? renderEvidenceForm(project) : parts[3] === 'edit' ? renderEvidenceForm(project, parts[4]) : renderEvidence(project); break;
        case 'draft': case 'focus': output = renderDraft(project, section === 'focus'); break;
        case 'revision': output = renderRevision(project); break;
        case 'notes': output = parts[3] === 'new' ? renderNoteForm(project) : parts[3] === 'edit' ? renderNoteForm(project, parts[4]) : renderNotes(project); break;
        default: output = renderOverview(project);
      }
    }
  } else if (path === '/projects/new') output = renderNewProject();
  else if (path === '/projects') output = renderProjects();
  else if (path === '/feedback') output = renderFeedback();
  else if (parts[0] === 'library') output = renderLibrary(parts[1]);
  else if (path === '/settings') output = renderSettings();
  else if (path === '/import') output = renderImport();
  else if (path === '/help') output = renderHelp();
  else output = teaching.home();
  main.innerHTML = output;
  const host = main.querySelector('#editor-host');
  if (host && parts[0] === 'project') {
    const project = projectAt(parts[1]);
    if (editor && editorProjectId === project.id) editor.move(host);
    else {
      editor?.destroy();
      editorProjectId = project.id;
      editor = new DraftEditor(host, project.draft.doc, doc => {
        mutation(next => {
          const target = next.projects.find(item => item.id === project.id);
          target.draft.doc = doc; target.draft.headId = uid(); target.status = 'drafting';
          const blockIds = new Set();
          const collect = node => { if (node.attrs?.id) blockIds.add(node.attrs.id); (node.content || []).forEach(collect); };
          collect(doc);
          target.evidenceUses.forEach(use => { if (use.blockId && !blockIds.has(use.blockId)) use.blockId = null; });
          target.notes.forEach(note => { if (note.blockId && !blockIds.has(note.blockId)) note.blockId = null; });
        }, 'draft-edit', project.id, false);
        main.querySelector('#word-count').textContent = `${draftWords(projectAt(project.id))} words`;
      }, message => announce(message));
    }
  }
  if (save.readOnly) main.querySelectorAll('form input,form textarea,form select,form button,[data-action],[data-editor-command],#editor-host .ProseMirror,#revision-notes,[data-revision-check],[data-milestone]').forEach(element => {
    if (element.matches('button,input,textarea,select') && !['export-backup','export-project','settings-export-project','export-draft'].includes(element.dataset.action) && !element.dataset.action?.startsWith('revision-pass:')) element.disabled = true;
    if (element.classList.contains('ProseMirror')) element.contentEditable = 'false';
  });
}

function download(name, value, type = 'application/json') {
  const blob = new Blob([value], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = name;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
async function exportBackup(value = workspace, kind = 'studio', project = null) {
  if (!value) throw Error('There is no workspace to export.');
  const envelope = await makeBackup(value, kind, project);
  download(`writing-studio-${new Date().toISOString().slice(0, 10)}.${kind === 'studio' ? 'wstudio' : 'wstudio-project'}`, JSON.stringify(envelope, null, 2));
  announce('Backup download started. Check that the file appears on your device.');
}
function cloneProject(source) {
  const project = structuredClone(source);
  const map = new Map();
  const replace = id => { if (!id) return id; if (!map.has(id)) map.set(id, uid()); return map.get(id); };
  const collect = object => {
    if (!object || typeof object !== 'object') return;
    if (Array.isArray(object)) return object.forEach(collect);
    if (typeof object.id === 'string' && !['ideas','organization','evidence','analysis','style','conventions','plan','draft','revision','ready'].includes(object.id)) replace(object.id);
    if (object.attrs?.id) replace(object.attrs.id);
    for (const value of Object.values(object)) collect(value);
  };
  collect(project);
  const remap = object => {
    if (!object || typeof object !== 'object') return;
    if (Array.isArray(object)) return object.forEach(remap);
    for (const [key, value] of Object.entries(object)) {
      if (['id','sourceId','evidenceId','blockId'].includes(key) && typeof value === 'string' && map.has(value)) object[key] = map.get(value);
      else remap(value);
    }
  };
  remap(project);
  project.id = replace(source.id);
  project.draft.headId = uid(); project.createdAt = project.updatedAt = new Date().toISOString();
  return project;
}
async function exportDraft(project, format) {
  if (editorProjectId !== project.id || !editor) throw Error('Open the draft first.');
  const safeName = project.title.replace(/[^\p{L}\p{N}._-]+/gu, '-').slice(0, 70) || 'draft';
  if (format === 'txt') download(`${safeName}.txt`, `${project.draft.title}\n\n${editor.text()}`, 'text/plain;charset=utf-8');
  else {
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>${E(project.draft.title)}</title><style>body{max-width:72ch;margin:3rem auto;padding:0 1rem;font:19px/1.7 Georgia,serif;color:#171c1a}h1{font:700 28px Arial,sans-serif}blockquote{border-left:3px solid #124b38;padding-left:1rem}a{color:#124b38}</style></head><body><h1>${E(project.draft.title)}</h1>${editor.html()}</body></html>`;
    if (format === 'html') download(`${safeName}.html`, html, 'text/html;charset=utf-8');
    else {
      const printWindow = window.open('about:blank', '_blank');
      if (!printWindow) throw Error('Pop-up blocked. Allow this print preview and try again.');
      printWindow.opener = null;
      printWindow.document.write(html); printWindow.document.close(); printWindow.focus(); printWindow.print();
    }
  }
}

async function action(name) {
  const parts = route().split('/').filter(Boolean);
  const project = parts[0] === 'project' ? projectAt(parts[1]) : null;
  if (name === 'start-temporary') { workspace = newWorkspace(); boot = { kind: 'loaded', workspace, temporary: true }; save.acceptTemporary(workspace); go(route() === '/projects/new' ? '/projects/new' : route()); return; }
  if (name.startsWith('bookmark:')) {
    const id = name.slice(9);
    mutation(next => { const marks = next.library.bookmarks; next.library.bookmarks = marks.includes(id) ? marks.filter(mark => mark !== id) : [...marks, id]; }, 'bookmark-guide');
    return;
  }
  if (name === 'settings-export-project') { if (!activeProject()) throw Error('Choose a project first.'); return exportBackup(workspace, 'project', activeProject()); }
  if (name === 'export-backup') return exportBackup();
  if (name === 'confirm-import') {
    if (!inspectedImport) return;
    const incoming = inspectedImport.kind === 'legacy' ? [inspectedImport.project] : inspectedImport.kind === 'studio' ? inspectedImport.payload.projects : [inspectedImport.payload];
    const copies = incoming.map(cloneProject);
    const checksum = inspectedImport.kind === 'legacy' ? inspectedImport.fingerprint : inspectedImport.checksum.value;
    const base = workspace || newWorkspace();
    const candidate = mutateWorkspace(base, next => { next.projects.push(...copies); next.activeProjectId ||= copies[0]?.id || null;
      next.imports.push({ checksum, kind: inspectedImport.kind, importedAt: new Date().toISOString() }); }, 'import-backup');
    await save.preflightCandidate(candidate);
    workspace = candidate; save.notifyMutation(candidate);
    inspectedImport = null;
    await save.flush('manual'); go('/projects'); announce('Backup projects imported as new copies. Check the save status.');
    return;
  }
  if (name === 'export-local-recovery') return exportBackup(boot.local);
  if (name === 'export-remote-recovery') return exportBackup(boot.remote);
  if (name === 'export-raw-local-recovery') return download('writing-studio-unreadable-tab.txt', boot.rawLocal, 'text/plain');
  if (name === 'export-raw-recovery') return download('writing-studio-unreadable-lms.txt', boot.rawRemote, 'text/plain');
  if (name === 'choose-local' || name === 'choose-remote') {
    if (save.readOnly) throw Error('This Brightspace attempt is view and export only.');
    const chosen = name === 'choose-local' ? boot.local : boot.remote;
    if (!chosen) return;
    if (!confirm('Continue with this copy? Export both copies first if you need them. No other copy will be deleted automatically.')) return;
    if (await save.acquireLock() !== true) throw Error('Another tab is editing this workspace, or a safe editing lock is unavailable. Export a backup instead.');
    workspace = chosen; boot = { kind: 'loaded', workspace };
    save.workspace = workspace;
    if (name === 'choose-local') save.notifyMutation(workspace);
    go('/home'); return;
  }
  if (name === 'manual-save') return save.flush('manual');
  if (name === 'retry-save') return save.retry();
  if (!project) return;
  if (name.startsWith('revision-pass:')) { revisionPass=name.slice(14); render(); return; }
  if (name === 'focus-mode') return go(`/project/${project.id}/focus`);
  if (name === 'export-draft') {
    await save.flush('export');
    const format = prompt('Export format: txt, html, or print', 'txt')?.trim().toLowerCase();
    if (['txt','html','print'].includes(format)) await exportDraft(project, format);
    return;
  }
  if (name === 'export-project') return exportBackup(workspace, 'project', project);
  if (save.readOnly) return;
  if (name === 'archive-project') { mutation(next => { const item = next.projects.find(p => p.id === project.id); item.archived = !item.archived; }, 'archive-project', project.id); return; }
  if (name === 'rename-project') {
    return go(`/project/${project.id}/edit`);
  }
  if (name === 'edit-project') {
    return go(`/project/${project.id}/edit`);
  }
  if (name === 'duplicate-project') {
    mutation(next => { const copy = cloneProject(project); copy.title += ' (copy)'; next.projects.push(copy); next.activeProjectId = copy.id; }, 'duplicate-project', project.id);
    go(`/project/${workspace.activeProjectId}/overview`); return;
  }
  if (name === 'add-plan') {
    addingPlan = true; render();
    return;
  }
  if (name === 'cancel-plan') { addingPlan = false; editingPlanId = null; render(); return; }
  if (name.startsWith('edit-plan:')) {
    editingPlanId = name.slice(10); render(); return;
  }
  if (name.startsWith('plan-up:') || name.startsWith('plan-down:')) {
    const [direction, sectionId, itemId] = name.split(':');
    mutation(next => { const items = next.projects.find(p => p.id === project.id).plan.find(section => section.id === sectionId).items;
      const index = items.findIndex(item => item.id === itemId), target = index + (direction === 'plan-up' ? -1 : 1);
      if (target >= 0 && target < items.length) [items[index], items[target]] = [items[target], items[index]];
    }, 'reorder-plan', project.id); return;
  }
  if (name === 'new-evidence') return go(`/project/${project.id}/evidence/new`);
  if (name.startsWith('edit-evidence:')) return go(`/project/${project.id}/evidence/edit/${name.slice(14)}`);
  if (name.startsWith('remove-evidence:')) {
    const id = name.slice(16); if (!confirm('Remove this evidence? Text already inserted in the draft will remain.')) return;
    mutation(next => {
      const target = next.projects.find(p => p.id === project.id);
      target.evidence = target.evidence.filter(item => item.id !== id);
      target.evidenceUses.forEach(use => { if (use.evidenceId === id) use.evidenceId = null; });
    }, 'remove-evidence', project.id); return;
  }
  if (name.startsWith('use-evidence:')) {
    const item = project.evidence.find(entry => entry.id === name.slice(13)); if (!item) return;
    go(`/project/${project.id}/draft`);
    requestAnimationFrame(async () => {
      if (!confirm(`Insert this ${item.type} into your draft exactly as recorded?\n\n${item.content.slice(0, 600)}`)) return;
      const blockId = editor.insertEvidence(item.content, item.type === 'quote');
      const hash = await sha256(new TextEncoder().encode(item.content));
      mutation(next => next.projects.find(p => p.id === project.id).evidenceUses.push({ id: uid(), evidenceId: item.id,
        blockId, sourceContentHash: hash, insertedAt: new Date().toISOString() }), 'use-evidence', project.id, false);
    }); return;
  }
  if (name.startsWith('revision-pass:')) { revisionPass = name.slice(14); render(); return; }
  if (name === 'save-revision-notes') {
    const value = main.querySelector('#revision-notes').value;
    mutation(next => { const pass = next.projects.find(p => p.id === project.id).revision.find(p => p.id === revisionPass); pass.notes = value; pass.reviewedDraftHeadId = project.draft.headId; }, 'revision-notes', project.id);
    announce('Revision notes saved'); return;
  }
  if (name === 'new-note') return go(`/project/${project.id}/notes/new`);
  if (name.startsWith('edit-note:')) return go(`/project/${project.id}/notes/edit/${name.slice(10)}`);
  if (name.startsWith('address-note:')) { const id = name.slice(13); mutation(next => { const note = next.projects.find(p => p.id === project.id).notes.find(n => n.id === id); note.addressed = !note.addressed; }, 'address-note', project.id); return; }
  if (name.startsWith('remove-note:')) { const id = name.slice(12); if (!confirm('Remove this note?')) return; mutation(next => { const target = next.projects.find(p => p.id === project.id); target.notes = target.notes.filter(n => n.id !== id); }, 'remove-note', project.id); return; }
}

main.addEventListener('click', async event => {
  const jump=event.target.closest('[data-study-scroll]');
  if(jump){const target=main.querySelector(`#${jump.dataset.studyScroll}`);if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});target.scrollIntoView({block:'start'});}}
  const editorButton = event.target.closest('[data-editor-command]');
  if (editorButton && editor) {
    event.preventDefault();
    const command = editorButton.dataset.editorCommand;
    if (command === 'link') { const href = prompt('Link URL (http or https)'); if (href) try { editor.link(href); } catch (error) { announce(String(error)); } }
    else editor.command(command);
  }
  const element = event.target.closest('[data-action]');
  if (element) try { await action(element.dataset.action); } catch (error) { announce(String(error)); alert(String(error)); }
});
main.addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const form = event.target;
    const data = new FormData(form);
    if (form.id === 'new-project-form') {
      const title = String(data.get('title') || '').trim(); if (!title) throw Error('Enter a project title.');
      const targetWords = data.get('targetWords') ? Number(data.get('targetWords')) : null;
      let id;
      mutation(next => {
        const project = newProject({ title, type: 'critical-analysis', track: 'english-30-1',
          prompt: String(data.get('prompt') || ''), targetWords, dueDate: data.get('dueDate') || null,
          practiceMode: data.has('practiceMode') });
        id = project.id; next.projects.push(project); next.activeProjectId = id;
      }, 'create-project');
      go(`/project/${id}/plan`);
    } else if (form.id === 'project-details-form') {
      const parts = route().split('/').filter(Boolean), id = parts[1], title = String(data.get('title') || '').trim();
      if (!title) throw Error('Enter a project title.');
      const criteriaLines = String(data.get('criteria') || '').split('\n').map(value => value.trim()).filter(Boolean);
      mutation(next => { const project = next.projects.find(p => p.id === id);
        Object.assign(project, { title, prompt: String(data.get('prompt') || ''), targetWords: data.get('targetWords') ? Number(data.get('targetWords')) : null,
          dueDate: data.get('dueDate') || null, status: String(data.get('status')) });
        project.criteria = criteriaLines.map((text, index) => ({ id: project.criteria[index]?.id || uid(), text }));
      }, 'edit-project', id);
      go(`/project/${id}/overview`);
    } else if (form.classList.contains('plan-edit-form')) {
      const parts = route().split('/').filter(Boolean), id = form.dataset.id, value = String(data.get('plan-value') || '');
      mutation(next => { const section = next.projects.find(p => p.id === parts[1]).plan.find(item => item.id === id);
        if (section.kind === 'list') section.items = value.split('\n').map((text, index) => ({ id: section.items[index]?.id || uid(), text: text.trim() })).filter(item => item.text);
        else section.value = value; }, 'edit-plan', parts[1]);
      editingPlanId = null; render();
    } else if (form.id === 'add-plan-form') {
      const parts = route().split('/').filter(Boolean), label = String(data.get('plan-label') || '').trim();
      mutation(next => next.projects.find(p => p.id === parts[1]).plan.push({ id: uid(), kind: 'text', label, prompt: '', value: '', items: [] }), 'add-plan', parts[1]);
      addingPlan = false; render();
    } else if (form.id === 'evidence-form') {
      const parts = route().split('/').filter(Boolean), id = form.dataset.id;
      mutation(next => {
        const project = next.projects.find(p => p.id === parts[1]);
        const at = new Date().toISOString();
        let item = id ? project.evidence.find(e => e.id === id) : null;
        if (!item) { item = { id: uid(), type: 'quote', sourceId: null, locator: '', content: '', analysis: '', tags: [], verifiedByLearner: false, createdAt: at, updatedAt: at }; project.evidence.push(item); }
        Object.assign(item, { type: String(data.get('type')), content: String(data.get('content')).trim(),
          analysis: String(data.get('analysis') || ''), locator: String(data.get('locator') || ''),
          tags: String(data.get('tags') || '').split(',').map(t => t.trim()).filter(Boolean),
          verifiedByLearner: data.has('verifiedByLearner'), updatedAt: at });
        const sourceTitle = String(data.get('sourceTitle') || '').trim();
        if (sourceTitle) {
          let source = item.sourceId ? project.sources.find(s => s.id === item.sourceId) : null;
          if (!source) { source = { id: uid(), title: '', creator: '', url: '', notes: '' }; project.sources.push(source); item.sourceId = source.id; }
          source.title = sourceTitle; source.creator = String(data.get('creator') || '');
          const rawUrl = String(data.get('sourceUrl') || '').trim();
          if (rawUrl && !/^https?:\/\/\S+$/i.test(rawUrl)) throw Error('Source link must begin with http:// or https://.');
          source.url = rawUrl; source.notes = String(data.get('sourceNotes') || '');
        }
      }, 'save-evidence', parts[1]);
      go(`/project/${parts[1]}/evidence`);
    } else if (form.id === 'note-form') {
      const parts = route().split('/').filter(Boolean), id = form.dataset.id;
      mutation(next => {
        const project = next.projects.find(p => p.id === parts[1]);
        const at = new Date().toISOString();
        let note = id ? project.notes.find(n => n.id === id) : null;
        if (!note) { note = { id: uid(), title: '', body: '', kind: 'note', originLabel: '', dateReceived: null,
          blockId: null, addressed: false, createdAt: at, updatedAt: at }; project.notes.push(note); }
        Object.assign(note, { title: String(data.get('title')).trim(), body: String(data.get('body')).trim(),
          kind: String(data.get('kind')), originLabel: String(data.get('originLabel') || ''), updatedAt: at });
      }, 'save-note', parts[1]);
      go(`/project/${parts[1]}/notes`);
    } else if (form.id === 'preferences-form') {
      mutation(next => { Object.assign(next.preferences, { editorFont: String(data.get('editorFont')),
        editorFontSize: Number(data.get('editorFontSize')), lineHeight: Number(data.get('lineHeight')),
        highContrast: data.has('highContrast') }); }, 'preferences');
      announce('Preferences saved');
    }
  } catch (error) { announce(String(error)); alert(String(error)); }
});
main.addEventListener('change', event => {
  const target = event.target;
  try {
    if (target.id === 'project-filter') { projectFilter = target.value; render(); }
    else if (target.id === 'project-type') { projectType = target.value; render(); }
    else if (target.id === 'project-sort') { projectSort = target.value; render(); }
    else if (target.id === 'evidence-filter') { evidenceFilter = target.value; render(); }
    else if (target.dataset.milestone) {
      const project = activeProject(), id = target.dataset.milestone, state = target.value;
      const reason = state === 'not-applicable' ? prompt('Why is this milestone not applicable?')?.trim() : '';
      if (state === 'not-applicable' && !reason) { render(); return; }
      mutation(next => { const item = next.projects.find(p => p.id === project.id).milestones.find(m => m.id === id); item.state = state; item.reason = reason; }, 'milestone', project.id);
    } else if (target.dataset.revisionCheck) {
      const project = activeProject(), [passId, checkId] = target.dataset.revisionCheck.split(':'), state = target.value;
      const reason = state === 'not-applicable' ? prompt('Why is this check not applicable?')?.trim() : '';
      if (state === 'not-applicable' && !reason) { render(); return; }
      mutation(next => { const pass = next.projects.find(p => p.id === project.id).revision.find(p => p.id === passId);
        const check = pass.checks.find(c => c.id === checkId); check.state = state; check.reason = reason; pass.reviewedDraftHeadId = project.draft.headId; }, 'revision-check', project.id);
    } else if (target.id === 'backup-file') void importFile(target.files?.[0]);
  } catch (error) { alert(String(error)); render(); }
});
main.addEventListener('input', event => {
  if (event.target.id === 'project-search') { search = event.target.value; render(); main.querySelector('#project-search')?.focus(); }
  if (event.target.id === 'evidence-search') { evidenceSearch = event.target.value; render(); main.querySelector('#evidence-search')?.focus(); }
});

async function importFile(file) {
  if (!file) return;
  try {
    if (file.size > 10485760) throw Error('Input file exceeds 10 MiB.');
    const text = await file.text();
    const header = strictJSON(text, 10485760);
    inspectedImport = header.format === 'nextstep.writing-studio.legacy'
      ? { kind: 'legacy', ...await inspectLegacy(text) } : await inspectBackup(text);
    go('/import');
  } catch (error) { alert(`Import stopped: ${String(error)}`); }
}

document.querySelector('#menu-toggle').addEventListener('click', () => {
  const opened = nav.classList.toggle('is-open'); document.querySelector('#menu-toggle').setAttribute('aria-expanded', String(opened));
});
nav.addEventListener('click', event => { if (event.target.closest('a')) { nav.classList.remove('is-open'); document.querySelector('#menu-toggle').setAttribute('aria-expanded', 'false'); } });
indicator.addEventListener('click', () => go('/settings'));
document.querySelector('.skip-link').addEventListener('click', event => { event.preventDefault(); main.focus(); });
window.addEventListener('hashchange', () => {
  if (workspace && !save.readOnly) void save.flush('navigation');
  render(); main.focus({ preventScroll: true }); window.scrollTo({ top: 0 });
});
window.addEventListener('visibilitychange', () => { if (document.hidden && workspace && !save.readOnly) void save.flush('hidden'); });
window.addEventListener('beforeunload', event => { if (save.status.pending && !save.temp) { event.preventDefault(); event.returnValue = ''; } });
window.addEventListener('pagehide', event => { if (!event.persisted) save.close(); });
window.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); void save.flush('manual'); }
  if (event.key === 'Escape' && route().endsWith('/focus') && !event.isComposing) {
    const parts = route().split('/'); go(`/project/${parts[2]}/draft`);
  }
});

render();
(async () => {
  try {
    boot = await save.load();
    workspace = boot.workspace || null;
    render();
  } catch (error) {
    boot = { kind: 'recovery', cause: `Startup stopped: ${String(error)}` };
    render();
  }
})();
