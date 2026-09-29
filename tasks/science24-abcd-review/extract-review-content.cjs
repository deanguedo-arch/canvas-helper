const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');

const repository = path.resolve(__dirname, '../..');
const output = process.argv[2];
if (!output) throw new Error('Usage: node extract-review-content.cjs <output-directory>');
fs.mkdirSync(output, { recursive: true });

const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const answer = q => {
  if (q.options) return q.options.find(option => option.id === q.answer)?.text ?? JSON.stringify(q.answer);
  return JSON.stringify(q.answer ?? q.answers ?? 'Written response');
};
const write = (name, value) => fs.writeFileSync(path.join(output, name), value);
const inventory = { generatedAt: new Date().toISOString(), note: 'Counts locate possible outliers; they do not establish quality, correctness, accessibility or completeness.', units: {} };

for (const unit of 'abcd') {
  const workspace = path.join(repository, `projects/science24-unit-${unit}/workspace`);
  const html = fs.readFileSync(path.join(workspace, 'index.html'), 'utf8');
  const $ = cheerio.load(html);
  const data = unit === 'a'
    ? JSON.parse(fs.readFileSync(path.join(workspace, 'course-data.js'), 'utf8').replace(/^\s*window\.S24_DATA\s*=\s*/, '').replace(/;\s*$/, ''))
    : JSON.parse(fs.readFileSync(path.join(workspace, 'course-data.json'), 'utf8'));
  const pages = [];
  const transcript = [`# Unit ${unit.toUpperCase()} · learner page text`, '', 'Static learner copy is extracted from canonical HTML. Runtime practice, Frayer fields and check prompts are in the separate catalog review files. Consult the actual HTML and screenshots for layout and interactions.', ''];
  $('.course-page').each((_, element) => {
    const route = $(element).attr('id') || 'unnamed';
    const title = clean($(element).find('h1').first().text()) || route;
    const parts = [];
    $(element).find('h1,h2,h3,p,li,figcaption,summary,label').each((__, node) => {
      const text = clean($(node).text());
      if (!text) return;
      const level = { h1: '#', h2: '##', h3: '###' }[node.tagName];
      parts.push(level ? `${level} ${text}` : node.tagName === 'li' ? `- ${text}` : text);
    });
    $(element).find('figure img').each((__, image) => parts.push(`[Figure asset: ${$(image).attr('src') || ''}; alt: ${$(image).attr('alt') || ''}]`));
    transcript.push(`\n---\n\n## Route #${route} · ${title}\n`, ...parts, '');
    const text = clean($(element).text());
    pages.push({ route, title, wordCount: text ? text.split(/\s+/).length : 0,
      workedExamples: $(element).find('.worked-example').length,
      practiceSlots: $(element).find('[data-exercise]').length,
      requiredChecks: $(element).find('[data-required]').length,
      savedNoteSlots: $(element).find('[data-note-id]').length,
      inlineFigures: $(element).find('figure.science-figure').length,
      videoCards: $(element).find('.video-card').length });
  });
  write(`UNIT_${unit.toUpperCase()}_LESSON_TEXT.md`, transcript.join('\n'));

  const assessment = [`# Unit ${unit.toUpperCase()} · authored checks and lesson practice`, '', 'These are the learner course’s authored formative items. They are separate from original Brightspace hidden assessments. Verify answers and feedback against the source and the actual lesson context.', ''];
  for (const topic of data.topics || []) {
    assessment.push(`\n## Lesson ${topic.id} · ${topic.label || topic.title || ''}`);
    const exercises = Object.entries(data.exercises || {}).filter(([_, q]) => q.topic === topic.id);
    for (const [id, q] of exercises) {
      assessment.push(`\n### ${id} · ${q.role || q.difficulty || 'practice'}`, `Prompt: ${q.prompt}`, `Correct answer: ${answer(q)}`);
      if (q.options) assessment.push('Options: ' + q.options.map(option => `${option.text}${option.id === q.answer ? ' [KEY]' : ''}`).join(' | '));
      for (const field of ['unit', 'hint', 'explanation', 'feedback', 'model']) if (q[field]) assessment.push(`${field}: ${q[field]}`);
    }
    const checks = Object.values(data.checks || {}).filter(check => check.route === `lesson-${topic.id}` || check.topic === topic.id);
    for (const check of checks) {
      assessment.push(`\n### Required check ${check.id}`);
      for (const q of check.questions || []) {
        assessment.push(`- ${q.id}: ${q.prompt}`, `  Correct: ${answer(q)}`);
        if (q.options) assessment.push(`  Options: ${q.options.map(option => option.text + (option.id === q.answer ? ' [KEY]' : '')).join(' | ')}`);
        if (q.explanation) assessment.push(`  Explanation: ${q.explanation}`);
      }
      for (const q of check.writing || []) assessment.push(`- Written ${q.id}: ${q.prompt}`);
    }
  }
  const final = Object.values(data.checks || {}).find(check => !String(check.route || '').match(/^lesson-\d+$/));
  if (final) {
    assessment.push(`\n## Integrated review · ${final.id}`);
    for (const q of final.questions || []) assessment.push(`- ${q.prompt}\n  Correct: ${answer(q)}\n  Explanation: ${q.explanation || ''}`);
    for (const q of final.writing || []) assessment.push(`- Written: ${q.prompt}`);
  }
  write(`UNIT_${unit.toUpperCase()}_CHECKS_AND_LESSON_PRACTICE.md`, assessment.join('\n') + '\n');

  const optional = [`# Unit ${unit.toUpperCase()} · optional practice bank`, '', 'Practice is optional and must remain separate from required completion.', ''];
  for (const [mode, questions] of Object.entries(data.banks || {})) {
    optional.push(`\n## ${mode} · ${questions.length} items`);
    for (const q of questions) {
      optional.push(`- ${q.id} [lesson ${q.topic || '?'}; ${q.difficulty || '?'}]: ${q.prompt || q.front || q.question || ''}`,
        `  Correct: ${answer(q)}`);
      if (q.explanation) optional.push(`  Explanation: ${q.explanation}`);
    }
  }
  write(`UNIT_${unit.toUpperCase()}_OPTIONAL_PRACTICE.md`, optional.join('\n') + '\n');

  const vocabulary = [`# Unit ${unit.toUpperCase()} · vocabulary and media`, '', 'Check whether the meanings, examples, distinctions, Frayer models and written video alternatives are substantive and tied to lessons.', ''];
  for (const term of data.vocabulary || []) vocabulary.push(`\n## ${term.term} · lesson ${term.topic}`, `Meaning: ${term.meaning}`, `Example: ${term.example}`, `Distinction: ${term.distinction}`, `Frayer model: ${JSON.stringify(term.model || {})}`);
  vocabulary.push('\n# Optional video library');
  for (const video of data.videos || []) vocabulary.push(`\n## ${video.title} · lesson ${video.topic || video.lesson || '?'}`, ...Object.entries(video).map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`));
  write(`UNIT_${unit.toUpperCase()}_VOCABULARY_AND_MEDIA.md`, vocabulary.join('\n') + '\n');

  inventory.units[unit] = { contentVersion: data.contentVersion, title: data.title, teachingLessons: data.topics?.length || 0,
    requiredChecks: Object.keys(data.checks || {}).length, vocabularyTerms: data.vocabulary?.length || 0,
    textbookPracticePages: data.bookQuestions?.length || 0, optionalVideos: data.videos?.length || 0,
    labelingActivities: data.labeling?.length || 0, lessonPracticeItems: Object.keys(data.exercises || {}).length,
    optionalBankItems: Object.fromEntries(Object.entries(data.banks || {}).map(([key, value]) => [key, value.length])),
    routes: pages };
}
write('COMPARATIVE_INVENTORY.json', JSON.stringify(inventory, null, 2) + '\n');
console.log('Extracted A–D route text, authored question catalogs, vocabulary/media and a neutral inventory.');
