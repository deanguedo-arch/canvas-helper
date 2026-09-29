#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO_ROOT = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.join(REPO_ROOT, 'projects', 'aboriginal-studies-30');
const OUTPUT_ROOT = path.join(PROJECT_ROOT, 'exports', 'notebooklm');
const GENERATED_ON = new Date().toISOString().slice(0, 10);

const THEME_FILES = {
  1: 'Aboriginal_Studies_30_Theme_1_Rights_and_Self_Government.html',
  2: 'Aboriginal_Studies_30_Theme_2_Aboriginal_Land_Claims.html',
  3: 'Aboriginal_Studies_30_Theme_3_Aboriginal_Peoples_in_Canadian_Society.html',
  4: 'Aboriginal_Studies_30_Theme_4_Aboriginal_World_Issues.html',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function paragraphs(value, className = '') {
  const values = Array.isArray(value) ? value : [value];
  return values
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => `<p${className ? ` class="${className}"` : ''}>${escapeHtml(item)}</p>`)
    .join('\n');
}

function list(values, className = '') {
  if (!Array.isArray(values) || !values.length) return '';
  return `<ul${className ? ` class="${className}"` : ''}>${values
    .map((value) => `<li>${escapeHtml(typeof value === 'string' ? value : value.text || value.label || value.title || '')}</li>`)
    .join('')}</ul>`;
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(p|li|div|h[1-6])\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function loadTheme(themeNumber) {
  const workspace = path.join(REPO_ROOT, 'projects', `aboriginal-studies-30-theme-${themeNumber}`, 'workspace');
  const context = { window: {} };
  context.globalThis = context.window;
  vm.createContext(context);
  for (const file of ['course-data.js', 'practice-data.js']) {
    const sourcePath = path.join(workspace, file);
    vm.runInContext(fs.readFileSync(sourcePath, 'utf8'), context, { filename: sourcePath });
  }
  return {
    workspace,
    data: context.window.ABORIGINAL_STUDIES_30_DATA,
    practice: context.window.AB30PracticeData,
  };
}

function fileAsDataUri(workspace, source) {
  if (!source || /^(https?:|data:)/i.test(source)) return source || '';
  const absolutePath = path.resolve(workspace, source);
  if (!absolutePath.startsWith(workspace) || !fs.existsSync(absolutePath)) return '';
  const extension = path.extname(absolutePath).slice(1).toLowerCase();
  const mime = extension === 'webp' ? 'image/webp' : extension === 'png' ? 'image/png' : extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : '';
  if (!mime) return '';
  return `data:${mime};base64,${fs.readFileSync(absolutePath).toString('base64')}`;
}

function renderResourceLink(resource) {
  if (!resource) return '';
  const label = resource.title || resource.name || resource.label || 'Course resource';
  const target = resource.url || resource.file || resource.href || '';
  if (/^https?:\/\//i.test(target)) {
    return `<li><a href="${escapeHtml(target)}">${escapeHtml(label)}</a>${resource.kind ? ` <span class="muted">(${escapeHtml(resource.kind)})</span>` : ''}</li>`;
  }
  const fileName = target ? target.split('/').pop() : '';
  return `<li><strong>${escapeHtml(label)}</strong>${fileName ? ` <span class="muted">— original course file: ${escapeHtml(fileName)}</span>` : ''}</li>`;
}

function renderSource(block, level = 3) {
  const title = block.studentTitle || block.title || 'Reading';
  const metadata = [
    block.speaker && `Speaker: ${block.speaker}`,
    block.nation && `Nation or community: ${block.nation}`,
    block.date && `Date: ${block.date}`,
    block.creator && `Creator: ${block.creator}`,
    block.sourceType && `Type: ${block.sourceType}`,
    block.locator && `Location: ${block.locator}`,
    block.attribution && `Attribution: ${block.attribution}`,
  ].filter(Boolean);
  const details = [block.context, block.contextLimits].filter(Boolean);
  const extract = block.passages?.length
    ? block.passages.map((passage) => renderSource(passage, Math.min(level + 1, 5))).join('\n')
    : block.extract
      ? `<blockquote>${paragraphs(String(block.extract).split(/\n\s*\n/))}</blockquote>`
      : '';
  return `<section class="reading">
    <h${level}>${escapeHtml(title)}</h${level}>
    ${details.map((item) => `<p>${escapeHtml(item)}</p>`).join('')}
    ${extract}
    ${(block.annotations || []).length ? `<div class="annotations"><h${Math.min(level + 1, 6)}>What to notice</h${Math.min(level + 1, 6)}><dl>${block.annotations.map((annotation) => `<div><dt>${escapeHtml(annotation.phrase || '')}</dt><dd>${escapeHtml(annotation.note || '')}</dd></div>`).join('')}</dl></div>` : ''}
    ${metadata.length ? `<details open><summary>Source details</summary>${list(metadata)}</details>` : ''}
  </section>`;
}

function renderComparison(block) {
  const columns = block.columns || [];
  if (!columns.length) return '';
  const rows = Math.max(...columns.map((column) => (column.points || []).length), 0);
  return `<figure class="wide comparison">
    ${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}
    <table><thead><tr>${columns.map((column) => `<th>${escapeHtml(column.heading || '')}</th>`).join('')}</tr></thead>
    <tbody>${Array.from({ length: rows }, (_, index) => `<tr>${columns.map((column) => `<td>${escapeHtml(column.points?.[index] || '')}</td>`).join('')}</tr>`).join('')}</tbody></table>
  </figure>`;
}

function renderTimeline(block) {
  return `<section class="wide">
    <h3>${escapeHtml(block.title || 'Timeline')}</h3>
    <ol class="timeline">${(block.events || []).map((event) => `<li><strong>${escapeHtml(event.date || event.year || event.label || '')}</strong>${event.title ? ` — ${escapeHtml(event.title)}` : ''}${event.description || event.text ? `<p>${escapeHtml(event.description || event.text)}</p>` : ''}</li>`).join('')}</ol>
    ${(block.sourceLinks || []).length ? `<h4>Timeline sources</h4><ul>${block.sourceLinks.map(renderResourceLink).join('')}</ul>` : ''}
  </section>`;
}

function renderWorkedExample(block) {
  return `<section class="worked">
    <p class="eyebrow">See the thinking</p>
    <h3>${escapeHtml(block.title || 'Worked example')}</h3>
    ${paragraphs(block.directions)}
    ${(block.evidence || []).length ? `<h4>Evidence</h4><ul>${block.evidence.map((item) => `<li><strong>${escapeHtml(item.ref || '')}</strong>${item.text ? `: ${escapeHtml(item.text)}` : ''}</li>`).join('')}</ul>` : ''}
    ${(block.reasoning || []).length ? `<h4>Reasoning</h4>${list(block.reasoning)}` : ''}
    ${block.response ? `<h4>Model response</h4><p>${escapeHtml(block.response)}</p>` : ''}
  </section>`;
}

function renderSelection(block) {
  const optionById = new Map((block.options || []).map((option) => [option.id, option]));
  return `<section class="practice">
    <p class="eyebrow">Practice with feedback</p>
    <h3>${escapeHtml(block.title || 'Check your understanding')}</h3>
    ${paragraphs(block.method)}
    <p><strong>${escapeHtml(block.prompt || '')}</strong></p>
    <ol type="A">${(block.options || []).map((option) => `<li>${escapeHtml(option.text || '')}</li>`).join('')}</ol>
    ${block.key && optionById.get(block.key) ? `<details open><summary>Reviewed answer and feedback</summary><p><strong>Reviewed answer:</strong> ${escapeHtml(optionById.get(block.key).text)}</p>${Object.entries(block.feedbackByOption || {}).map(([id, feedback]) => `<p><strong>Option ${escapeHtml(id.toUpperCase())}:</strong> ${escapeHtml(feedback)}</p>`).join('')}</details>` : ''}
  </section>`;
}

function renderIndependentTask(block) {
  return `<section class="task">
    <p class="eyebrow">${escapeHtml(block.sectionLabel || 'Try it yourself')}</p>
    <h3>${escapeHtml(block.title || 'Independent task')}</h3>
    ${paragraphs(block.task)}
    ${block.criteria ? `<p><strong>Success criteria:</strong> ${escapeHtml(block.criteria)}</p>` : ''}
  </section>`;
}

function renderFigure(block, workspace) {
  const dataUri = fileAsDataUri(workspace, block.src);
  if (!dataUri) return '';
  return `<figure class="lesson-figure"><img src="${dataUri}" alt="${escapeHtml(block.alt || '')}">${block.captionDisplay !== 'hidden' && block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}</figure>`;
}

function renderBlock(block, workspace) {
  switch (block.type) {
    case 'explanation':
      return `<section>${block.heading ? `<h3>${escapeHtml(block.heading)}</h3>` : ''}${paragraphs(block.paragraphs)}</section>`;
    case 'figure':
      return renderFigure(block, workspace);
    case 'source':
      return renderSource(block);
    case 'comparison':
      return renderComparison(block);
    case 'timeline':
      return renderTimeline(block);
    case 'workedExample':
      return renderWorkedExample(block);
    case 'supportedSelection':
      return renderSelection(block);
    case 'independentTask':
      return renderIndependentTask(block);
    case 'assignmentConnection':
      return `<aside class="connection"><strong>Assignment connection:</strong> ${escapeHtml(block.note || '')}</aside>`;
    case 'reflection':
      return `<aside class="reflection"><strong>Reflection:</strong> ${escapeHtml(block.prompt || '')}</aside>`;
    default:
      return `<section>${paragraphs(Object.values(block).filter((value) => typeof value === 'string' && value !== block.type))}</section>`;
  }
}

function renderLesson(lesson, workspace, index) {
  const reading = lesson.textbook || lesson.readingFocus;
  return `<article class="lesson" id="${escapeHtml(lesson.id)}">
    <header class="lesson-header">
      <p class="eyebrow">Lesson ${index + 1}</p>
      <h2>${escapeHtml(lesson.title)}</h2>
      ${lesson.essentialQuestion ? `<p class="essential">${escapeHtml(lesson.essentialQuestion)}</p>` : ''}
      ${paragraphs(lesson.intro)}
      <div class="goal-grid"><div><strong>Learning goal</strong><p>${escapeHtml(lesson.goal || '')}</p></div><div><strong>Starting point</strong><p>${escapeHtml(lesson.prerequisite || '')}</p></div></div>
      ${reading ? `<p class="reading-focus"><strong>Read with a purpose:</strong> ${escapeHtml(reading.label || reading.title || String(reading))}${reading.file ? ` <span class="muted">(original course file: ${escapeHtml(reading.file.split('/').pop())})</span>` : ''}</p>` : ''}
      ${(lesson.terms || []).length ? `<dl class="lesson-terms">${lesson.terms.map((entry) => typeof entry === 'string' ? `<div><dt>${escapeHtml(entry)}</dt></div>` : `<div><dt>${escapeHtml(entry.term || entry.label || '')}</dt>${entry.def || entry.definition ? `<dd>${escapeHtml(entry.def || entry.definition)}</dd>` : ''}</div>`).join('')}</dl>` : ''}
    </header>
    <div class="lesson-body">${(lesson.blocks || []).map((block) => renderBlock(block, workspace)).join('\n')}</div>
    <p class="back"><a href="#contents">Back to contents</a></p>
  </article>`;
}

function renderPrompt(prompt) {
  const number = prompt.number ? `Question ${prompt.number}` : 'Prompt';
  const rows = Array.isArray(prompt.rows) ? prompt.rows : [];
  const columns = Array.isArray(prompt.columns) ? prompt.columns : [];
  return `<section class="prompt">
    <p class="prompt-number">${escapeHtml(number)}</p>
    <h4>${escapeHtml(prompt.label || '')}</h4>
    ${rows.length && columns.length ? `<table><thead><tr><th>Area</th>${columns.map((column) => `<th>${escapeHtml(column.label || '')}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr><th>${escapeHtml(row.label || '')}</th>${columns.map(() => '<td class="blank">Response</td>').join('')}</tr>`).join('')}</tbody></table>` : ''}
    ${(prompt.choices || []).length ? `<ul>${prompt.choices.map((choice) => `<li>${escapeHtml(choice.label || choice.text || choice)}</li>`).join('')}</ul>` : ''}
    ${(prompt.resources || []).length ? `<ul class="resources">${prompt.resources.map(renderResourceLink).join('')}</ul>` : ''}
    ${prompt.locator ? `<p class="muted">Textbook location: printed page ${escapeHtml(prompt.locator.printedPage || '')}</p>` : ''}
  </section>`;
}

function renderActivities(activities) {
  if (!activities.length) return '';
  return `<section class="major-section" id="booklet">
    <header><p class="eyebrow">Student work</p><h2>Theme questions and booklet work</h2></header>
    ${activities.map((activity) => `<section><h3>${escapeHtml(activity.title)}</h3>${paragraphs(activity.intro)}${(activity.resources || []).length ? `<ul>${activity.resources.map(renderResourceLink).join('')}</ul>` : ''}${(activity.sections || []).map((section) => `<section class="activity-section"><h3>${escapeHtml(section.title || '')}</h3>${paragraphs(section.instructions)}${section.sourceRef ? `<p class="muted"><strong>Use:</strong> ${escapeHtml(section.sourceRef)}</p>` : ''}${(section.prompts || []).map(renderPrompt).join('')}</section>`).join('')}</section>`).join('')}
    <p class="back"><a href="#contents">Back to contents</a></p>
  </section>`;
}

function renderAssignments(assignments) {
  return `<section class="major-section" id="assignments"><header><p class="eyebrow">Student work</p><h2>Assignments</h2></header>${assignments.map((assignment) => `<article class="assignment"><h3>${escapeHtml(assignment.title)}</h3>${paragraphs(assignment.summary)}${stripHtml(assignment.instructionsHtml).map((part) => `<p>${escapeHtml(part)}</p>`).join('')}${assignment.textbook ? `<p><strong>Textbook:</strong> ${escapeHtml(assignment.textbook.label || assignment.textbook.title || '')}</p>` : ''}${(assignment.links || []).length ? `<h4>Resources</h4><ul>${assignment.links.map(renderResourceLink).join('')}</ul>` : ''}</article>`).join('')}<p class="back"><a href="#contents">Back to contents</a></p></section>`;
}

function renderVocabulary(entries) {
  return `<section class="major-section" id="vocabulary"><header><p class="eyebrow">Reference</p><h2>Core vocabulary</h2></header><dl class="vocabulary">${entries.map((entry) => `<div><dt>${escapeHtml(entry.term)}</dt><dd>${escapeHtml(entry.meaning)}</dd></div>`).join('')}</dl><p class="back"><a href="#contents">Back to contents</a></p></section>`;
}

function renderLibrary(items) {
  return `<section class="major-section" id="library"><header><p class="eyebrow">Reference</p><h2>Course library</h2></header><ul class="library-list">${items.map((item) => renderResourceLink({ title: item.title, file: item.file, kind: item.kind })).join('')}</ul><p class="back"><a href="#contents">Back to contents</a></p></section>`;
}

function watchUrl(url) {
  const match = String(url || '').match(/youtube\.com\/embed\/([^?&/]+)/i);
  return match ? `https://www.youtube.com/watch?v=${match[1]}` : url;
}

function renderFilmRoom(items) {
  return `<section class="major-section" id="films"><header><p class="eyebrow">Media</p><h2>Film Room</h2></header>${items.map((item) => `<article class="film"><h3>${escapeHtml(item.title)}</h3>${paragraphs(item.description)}<p><a href="${escapeHtml(watchUrl(item.url))}">Open video source</a></p></article>`).join('')}<p class="back"><a href="#contents">Back to contents</a></p></section>`;
}

function renderPractice(practice, lessonById) {
  const items = practice?.ITEMS || [];
  return `<section class="major-section" id="practice"><header><p class="eyebrow">Review bank</p><h2>Reviewed practice questions</h2><p>This section preserves the course’s reviewed practice prompts, options, and feedback for teacher or content review.</p></header>${items.map((item) => {
    const options = item.options || [];
    const correct = options.find((option) => option.id === item.correctOptionId);
    return `<article class="practice-item"><p class="muted">${escapeHtml(lessonById.get(item.lessonId)?.title || item.lessonId || 'Course practice')}</p><h3>${escapeHtml(item.prompt)}</h3>${options.length ? `<ol type="A">${options.map((option) => `<li>${escapeHtml(option.text || '')}</li>`).join('')}</ol>` : ''}${item.criteria ? `<p><strong>Criteria:</strong> ${escapeHtml(item.criteria)}</p>` : ''}${correct || item.model ? `<details open><summary>Reviewed answer and feedback</summary>${correct ? `<p><strong>Reviewed answer:</strong> ${escapeHtml(correct.text)}</p>` : ''}${item.model ? `<p><strong>Model:</strong> ${escapeHtml(item.model)}</p>` : ''}${Object.entries(item.feedbackByOption || {}).map(([id, feedback]) => `<p><strong>Option ${escapeHtml(id.toUpperCase())}:</strong> ${escapeHtml(feedback)}</p>`).join('')}</details>` : ''}</article>`;
  }).join('')}<p class="back"><a href="#contents">Back to contents</a></p></section>`;
}

function renderDocument(themeNumber, loaded) {
  const { workspace, data, practice } = loaded;
  const unit = data.units[0];
  const lessonById = new Map(unit.lessons.map((lesson) => [lesson.id, lesson]));
  const title = data.course.title.replace(/\s*·\s*Theme\s+\d+$/i, '');
  const themeTitle = unit.title.replace(/^Theme\s+\d+\s*-\s*/i, '');
  const counts = {
    lessons: unit.lessons.length,
    prompts: data.themeActivities.reduce((total, activity) => total + (activity.responsePromptCount || 0), 0),
    assignments: data.assignments.length,
    vocabulary: data.coreVocabulary.length,
    films: data.filmRoomItems.length,
    practice: practice.ITEMS.length,
  };
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} — Theme ${themeNumber}: ${escapeHtml(themeTitle)}</title>
  <style>
    :root{--ink:#1b2420;--muted:#5c6761;--green:#174f2a;--teal:#08736a;--line:#cfd8d1;--paper:#fff;--wash:#f3f7f4;--warm:#f8f5ee}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#edf1ee;color:var(--ink);font:17px/1.65 Georgia,"Times New Roman",serif}.page{max-width:980px;margin:0 auto;background:var(--paper);box-shadow:0 0 0 1px #d9dfda}.course-header{padding:64px clamp(28px,7vw,80px);background:#17201c;color:#fff;border-top:8px solid #80b251}.course-header h1{max-width:800px;margin:.1em 0;font:750 clamp(2.2rem,6vw,4.6rem)/1.02 Arial,sans-serif;letter-spacing:-.04em}.course-header .theme-name{max-width:760px;font-size:1.45rem;color:#dce9df}.course-header .meta{color:#b9c8bd}.content{padding:0 clamp(24px,7vw,76px) 70px}.notice{margin:36px 0;padding:20px 24px;background:var(--warm);border-left:4px solid #a67c33}.summary-grid,.goal-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line)}.summary-grid>div,.goal-grid>div{background:#fff;padding:18px 20px}.toc{margin:48px 0;padding:30px;background:var(--wash);border-top:3px solid var(--green)}.toc h2{margin-top:0}.toc ol{columns:2;column-gap:40px}.toc li{break-inside:avoid;margin:.35em 0}a{color:#075f58;text-decoration-thickness:.08em;text-underline-offset:.16em}h2,h3,h4,.eyebrow,strong,summary,th{font-family:Arial,sans-serif}h2{font-size:2rem;line-height:1.15;letter-spacing:-.025em}h3{font-size:1.28rem;line-height:1.25}h4{font-size:1rem}.eyebrow,.prompt-number{margin:0;color:var(--teal);font:700 .76rem/1.2 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase}.lesson,.major-section{padding-top:64px;border-top:1px solid var(--line);margin-top:52px}.lesson-header h2{font-size:clamp(1.9rem,5vw,3rem);margin:.2em 0}.essential{font-size:1.3rem;font-weight:700;color:var(--green)}.goal-grid{margin:28px 0}.goal-grid strong{color:var(--teal);font-size:.8rem;text-transform:uppercase;letter-spacing:.05em}.lesson-terms{display:flex;flex-wrap:wrap;gap:8px 18px;margin:22px 0}.lesson-terms div{max-width:48%}.lesson-terms dt{font:700 .9rem Arial,sans-serif;color:var(--green)}.lesson-terms dd{margin:2px 0;color:var(--muted);font-size:.9rem}.reading-focus,.connection,.reflection{padding:18px 22px;background:var(--wash);border-left:4px solid var(--teal)}.lesson-body>section,.lesson-body>figure,.lesson-body>aside{margin:34px 0}.reading{padding:22px 26px;background:var(--wash);border-left:3px solid var(--teal)}blockquote{margin:20px 0;padding:4px 0 4px 20px;border-left:3px solid #7aa49c;font-size:1.08rem}.annotations{margin:20px 0;padding:16px 18px;background:#fff}.annotations dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.annotations dt{font:700 .9rem Arial,sans-serif;color:var(--teal)}.annotations dd{margin:3px 0}.worked,.practice,.task{padding:24px 28px;border:1px solid var(--line);border-top:4px solid var(--green)}.task{background:var(--warm)}details{margin-top:18px;border-top:1px solid var(--line);padding-top:12px}summary{cursor:pointer;color:var(--green);font-weight:700}.lesson-figure{margin:32px 0}.lesson-figure img{display:block;width:100%;height:auto;max-height:520px;object-fit:cover}.lesson-figure figcaption,figcaption{font-size:.88rem;color:var(--muted);padding-top:8px}.wide{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:.94rem}th,td{padding:12px 14px;border:1px solid var(--line);text-align:left;vertical-align:top}th{background:var(--wash)}.blank{color:var(--muted);font-style:italic}.activity-section,.assignment,.film,.practice-item{margin:28px 0;padding:22px 26px;border:1px solid var(--line)}.prompt{margin:22px 0;padding:18px 0;border-top:1px solid var(--line)}.prompt h4{margin:.35em 0}.vocabulary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line)}.vocabulary div{background:#fff;padding:16px}.vocabulary dt{font:700 1rem Arial,sans-serif;color:var(--green)}.vocabulary dd{margin:5px 0 0}.muted{color:var(--muted);font-size:.92rem}.back{text-align:right;font-family:Arial,sans-serif;font-size:.86rem}.document-footer{padding:35px clamp(24px,7vw,76px);background:#17201c;color:#dce9df}.document-footer p{margin:0}@media(max-width:700px){body{font-size:16px}.course-header{padding:44px 24px}.content{padding:0 20px 48px}.summary-grid,.goal-grid,.vocabulary{grid-template-columns:1fr}.lesson-terms{display:block}.lesson-terms div{max-width:none;margin:12px 0}.annotations dl{grid-template-columns:1fr}.toc{padding:22px}.toc ol{columns:1}.reading,.worked,.practice,.task,.activity-section,.assignment,.film,.practice-item{padding:18px}.lesson,.major-section{padding-top:44px;margin-top:40px}}@media print{body{background:#fff}.page{box-shadow:none;max-width:none}.lesson,.major-section{break-before:page}.course-header{-webkit-print-color-adjust:exact;print-color-adjust:exact}.back{display:none}details{display:block}details>*{display:block}}
  </style>
</head>
<body>
<main class="page">
  <header class="course-header">
    <p class="eyebrow">${escapeHtml(title)}</p>
    <h1>Theme ${themeNumber}</h1>
    <p class="theme-name">${escapeHtml(themeTitle)}</p>
    <p class="meta">Static course source · Generated ${GENERATED_ON}</p>
  </header>
  <div class="content">
    <aside class="notice"><strong>About this file</strong><p>This is a self-contained, readable copy prepared for Gemini or NotebookLM. It includes the theme’s lessons, questions, assignments, vocabulary, library references, film links, and reviewed practice. Learner responses, saved progress, and interactive controls are omitted.</p></aside>
    <section class="summary-grid" aria-label="Document inventory">
      <div><strong>${counts.lessons}</strong><br>lessons</div><div><strong>${counts.prompts}</strong><br>booklet prompts</div><div><strong>${counts.assignments}</strong><br>assignments</div><div><strong>${counts.vocabulary}</strong><br>vocabulary terms</div><div><strong>${counts.films}</strong><br>film references</div><div><strong>${counts.practice}</strong><br>reviewed practice items</div>
    </section>
    <nav class="toc" id="contents" aria-label="Contents"><h2>Contents</h2><ol>${unit.lessons.map((lesson, index) => `<li><a href="#${escapeHtml(lesson.id)}">${index + 1}. ${escapeHtml(lesson.title)}</a></li>`).join('')}</ol><ul><li><a href="#booklet">Theme questions and booklet work</a></li><li><a href="#assignments">Assignments</a></li><li><a href="#vocabulary">Core vocabulary</a></li><li><a href="#library">Course library</a></li><li><a href="#films">Film Room</a></li><li><a href="#practice">Reviewed practice questions</a></li></ul></nav>
    ${unit.lessons.map((lesson, index) => renderLesson(lesson, workspace, index)).join('\n')}
    ${renderActivities(data.themeActivities)}
    ${renderAssignments(data.assignments)}
    ${renderVocabulary(data.coreVocabulary)}
    ${renderLibrary(data.libraryItems)}
    ${renderFilmRoom(data.filmRoomItems)}
    ${renderPractice(practice, lessonById)}
  </div>
  <footer class="document-footer"><p>${escapeHtml(title)} · Theme ${themeNumber}: ${escapeHtml(themeTitle)} · Source project: aboriginal-studies-30-theme-${themeNumber}</p></footer>
</main>
</body>
</html>`;
}

function verifyOutput(filePath, html, themeNumber, loaded) {
  const unit = loaded.data.units[0];
  const required = [
    '<!doctype html>',
    `<h1>Theme ${themeNumber}</h1>`,
    ...unit.lessons.map((lesson) => escapeHtml(lesson.title)),
    ...loaded.data.themeActivities.flatMap((activity) => (activity.sections || []).flatMap((section) => (section.prompts || []).map((prompt) => escapeHtml(prompt.label)))),
    ...loaded.data.assignments.map((assignment) => escapeHtml(assignment.title)),
    ...loaded.data.coreVocabulary.map((entry) => escapeHtml(entry.term)),
    ...loaded.data.filmRoomItems.map((item) => escapeHtml(item.title)),
    ...(loaded.practice.ITEMS || []).map((item) => escapeHtml(item.prompt)),
  ];
  const missing = required.filter((needle) => !html.includes(needle));
  const forbidden = ['<script', '<iframe', '[object Object]', '>undefined<'];
  const foundForbidden = forbidden.filter((needle) => html.includes(needle));
  if (missing.length || foundForbidden.length) {
    const context = foundForbidden.map((needle) => {
      const index = html.indexOf(needle);
      return html.slice(Math.max(0, index - 120), index + needle.length + 120);
    }).join('\n');
    throw new Error(`${path.basename(filePath)} failed verification. Missing: ${missing.join(', ') || 'none'}. Forbidden: ${foundForbidden.join(', ') || 'none'}.\n${context}`);
  }
  if (!html.includes('data:image/')) throw new Error(`${path.basename(filePath)} has no embedded lesson images.`);
  const expectedImages = unit.lessons.flatMap((lesson) => lesson.blocks || []).filter((block) => block.type === 'figure').length;
  const embeddedImages = (html.match(/<img src="data:image\//g) || []).length;
  if (embeddedImages !== expectedImages) throw new Error(`${path.basename(filePath)} embedded ${embeddedImages} of ${expectedImages} lesson images.`);
  if (/<(?:a|img)[^>]+(?:href|src)="(?:\.\.?\/|\/)/i.test(html)) throw new Error(`${path.basename(filePath)} contains a relative file dependency.`);
}

fs.rmSync(OUTPUT_ROOT, { recursive: true, force: true });
fs.mkdirSync(OUTPUT_ROOT, { recursive: true });

const manifest = [];
for (let themeNumber = 1; themeNumber <= 4; themeNumber += 1) {
  const loaded = loadTheme(themeNumber);
  const html = renderDocument(themeNumber, loaded);
  const filePath = path.join(OUTPUT_ROOT, THEME_FILES[themeNumber]);
  verifyOutput(filePath, html, themeNumber, loaded);
  fs.writeFileSync(filePath, html);
  manifest.push({
    theme: themeNumber,
    file: THEME_FILES[themeNumber],
    bytes: Buffer.byteLength(html),
    lessons: loaded.data.units[0].lessons.length,
    prompts: loaded.data.themeActivities.reduce((total, activity) => total + (activity.responsePromptCount || 0), 0),
    practiceItems: loaded.practice.ITEMS.length,
  });
}

fs.writeFileSync(path.join(OUTPUT_ROOT, 'manifest.json'), `${JSON.stringify({ generatedOn: GENERATED_ON, files: manifest }, null, 2)}\n`);
console.log(JSON.stringify({ outputRoot: OUTPUT_ROOT, files: manifest }, null, 2));
