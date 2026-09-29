/* R05 same-text comparison fixture generator (evidence only, not shipped).
 *
 * Emits, into projects/aboriginal-studies-30/meta/ab30-v2/evidence/R05/:
 * - fixture-candidate.html — real AB30 renderer output for a synthetic
 *   lesson (vm seam over workspace lesson-components.js + main.js slices).
 * - fixture-donor.html — the SAME text in the donor's native component
 *   markup under the donor stylesheet (structure re-expressed from
 *   references/bio/REFERENCE_LESSON_MARKUP.html; no donor content copied).
 * - same-text-fixture.json — frozen text lock + sha256 of both fixtures.
 *
 * Regeneration is deterministic; any renderer/markup drift changes hashes.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..', '..');
const WS = path.resolve(ROOT, 'projects', 'aboriginal-studies-30', 'workspace');
const OUT = path.resolve(ROOT, 'projects', 'aboriginal-studies-30', 'meta', 'ab30-v2', 'evidence', 'R05');

const mainSource = fs.readFileSync(path.resolve(WS, 'main.js'), 'utf8');

function sliceTopLevel(kind, name) {
  const anchor = kind === 'function' ? `function ${name}(` : `${kind} ${name} =`;
  const start = mainSource.indexOf(anchor);
  if (start < 0) throw new Error(`seam "${name}" missing (production drift?)`);
  const lineStart = mainSource.lastIndexOf('\n', start) + 1;
  const boundary = /^(?:function|const|let|var) [A-Za-z_$][\w$]*/gm;
  boundary.lastIndex = start + anchor.length;
  const next = boundary.exec(mainSource);
  return (next ? mainSource.slice(lineStart, next.index) : mainSource.slice(lineStart)).trim();
}

// Frozen sample text. Synthetic and clearly labelled; identical on both
// sides. Not donor course content, not AB30 lesson content.
const TEXT = {
  eyebrow: 'Learn · Theme 1 · Lesson 7 of 23',
  title: 'Sample lesson: how two sides heard one signing',
  question: 'When both sides signed, did they agree on what the signing meant?',
  goal: 'Compare what Ottawa sought from the numbered treaties with what First Nations understood signing to mean.',
  prior: 'Lessons 5–6: early treaties, the Royal Proclamation, and Confederation.',
  reading: 'Textbook Chapter 1, pages 24–28',
  terms: ['Numbered treaties', 'Oral tradition'],
  h2: 'Two purposes meet at the signing table',
  p1: 'Ottawa sent commissioners west with written instructions: secure land for settlement and a railway, at the lowest cost the Crown could defend. The commissioners carried printed treaty terms and the authority to promise reserves, schools, and annuities.',
  p2: 'First Nations leaders heard the same meetings through ceremony and oral record. Promises spoken at the table carried the weight of the agreement, whether or not a clerk wrote them into the printed text.',
  sourceTitle: 'Treaty commissioner’s report (sample)',
  sourceVoice: 'Lieutenant-Governor Morris',
  sourceContext: '1876 · Report · Sample pp. 1–2',
  sourceExtract: 'The Indians asked for many things, and we promised what the written terms allowed; what they carried home was what they heard spoken.',
  sourceLimits: 'A Crown record only; it cannot speak for what First Nations understood.',
  sourceAttribution: 'Sample archive, record S-1',
  workedTitle: 'Work the purpose question',
  workedStep: 'Name one thing each side wanted before you compare the signing.',
  workedResponse: 'Ottawa wanted secure land at low cost; First Nations wanted a relationship the spoken promises described.',
  supportedTitle: 'Practise with the method',
  supportedTask: 'Use the same two-column comparison on the second sample passage.',
  supportedFeedback: 'A strong answer names one purpose per side and cites the passage.',
  independentTitle: 'Try one on your own',
  independentTask: 'Compare the two purposes using the third sample passage as your evidence.',
  independentCriteria: 'Names one purpose per side; cites the passage; states the difference in one sentence.',
};

function buildSeam() {
  const dataContext = { window: {} };
  vm.createContext(dataContext);
  vm.runInContext(fs.readFileSync(path.resolve(WS, 'course-data.js'), 'utf8'), dataContext, { filename: 'course-data.js' });
  const DATA = JSON.parse(JSON.stringify(dataContext.window.ABORIGINAL_STUDIES_30_DATA));
  const context = {
    DATA,
    window: {},
    AB30LessonBlocks: null,
    AB30Store: undefined,
    console, URL, URLSearchParams,
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.resolve(WS, 'lesson-components.js'), 'utf8'), context, { filename: 'lesson-components.js' });
  context.AB30LessonBlocks = context.window.AB30LessonBlocks;
  const consts = ['units', 'assignments', 'coreVocabulary', 'themeActivities',
    'ASSIGNMENT_PROMPT_LESSONS', 'LESSON_DRAFTS', 'REQUIREMENT_ROLE_OVERRIDES', 'BOOKLET_SHELL_ASSIGNMENT_IDS'];
  const fns = ['lessonContentVersion', 'isV2Lesson', 'storeAvailable', 'lessonBlocksApi',
    'renderV2GoalStrip', 'renderV2Blocks', 'renderLessonGuide', 'lessonEyebrow', 'renderLessonArticle',
    'getUnitActivity', 'lessonStartPage', 'linkLessonTerms', 'findVocabularyTerm', 'escapeRegExp',
    'promptsForLesson', 'renderLessonQuestions', 'renderAssignmentDrafts', 'activityResponseKey',
    'promptFieldKey', 'tableFieldId', 'tableFieldLabel', 'escapeHtml', 'toEmbedUrl', 'renderConsentEmbed',
    'readCourseResponse', 'renderActivityPromptLabel', 'renderActivityPromptResources',
    'renderFillBlankPrompt', 'renderMultipleChoicePrompt', 'renderTablePrompt', 'renderActivityPrompt',
    'conflictOriginLabel', 'storeConflictsForKeys', 'renderConflictPanelsForKeys',
    'roleForRequirement', 'isKnownLegacyRequirement', 'requirementItems', 'requirementDenominator'];
  const script = [
    ...consts.map((n) => sliceTopLevel('const', n)),
    ...fns.map((n) => sliceTopLevel('function', n)),
  ].join('\n\n');
  vm.runInContext(script, context, { filename: 'ab30-r05-fixture-seam.js' });
  return { context, DATA };
}

function fixtureLesson() {
  return {
    id: 'r05-fixture',
    contentVersion: 'v2-fixture-r05',
    kicker: TEXT.eyebrow,
    title: TEXT.title,
    intro: 'Synthetic fixture prose for the R05 same-text comparison. Not a real lesson.',
    goal: TEXT.goal,
    prerequisite: TEXT.prior,
    essentialQuestion: TEXT.question,
    textbook: { label: TEXT.reading, file: './assets/library/chapter-1.pdf', title: 'Chapter 1' },
    terms: TEXT.terms.map((t) => ({ term: t, def: `Sample definition for ${t}.` })),
    blocks: [
      { type: 'explanation', heading: TEXT.h2, paragraphs: [TEXT.p1, TEXT.p2] },
      {
        type: 'source', title: TEXT.sourceTitle, speaker: TEXT.sourceVoice,
        date: '1876', sourceType: 'Report', locator: 'Sample pp. 1–2',
        extract: TEXT.sourceExtract, contextLimits: TEXT.sourceLimits,
        attribution: TEXT.sourceAttribution,
      },
      {
        type: 'workedExample', title: TEXT.workedTitle, directions: TEXT.workedStep,
        evidence: [{ ref: 'Sample', text: TEXT.p1.slice(0, 80) + '…' }],
        reasoning: [TEXT.workedStep], response: TEXT.workedResponse,
      },
      {
        type: 'supportedPractice', title: TEXT.supportedTitle,
        method: 'Two-column comparison.', task: TEXT.supportedTask, feedback: TEXT.supportedFeedback,
      },
      {
        type: 'independentTask', title: TEXT.independentTitle, task: TEXT.independentTask,
        differsFrom: { evidence: 'Uses the third sample passage.' },
        responseKey: 'r05-fixture-task', contentVersion: 'v2-fixture-r05', criteria: TEXT.independentCriteria,
      },
    ],
  };
}

function shell(pageTitle, cssHref, articleHtml, sideNote) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${pageTitle}</title>
<link rel="stylesheet" href="${cssHref}" />
</head>
<body>
<p class="fixture-note">${sideNote}</p>
<main class="course-main"><div class="course-frame"><div class="course-page">
${articleHtml}
</div></div></main>
</body>
</html>
`;
}

// Donor-native markup for the same frozen text. Structure follows the
// reference lesson anatomy (header, goal strip, guide, textbook band,
// teaching block, worked example, practice); class names are the donor's.
function donorArticle() {
  const t = TEXT;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return `<section class="course-page lesson-page" id="fixture-lesson">
<header class="page-header lesson-header">
<p class="eyebrow">${esc(t.eyebrow)}</p>
<h1>${esc(t.title)}</h1>
<p class="lesson-question">${esc(t.question)}</p>
<div class="goal-strip">
<div><p class="section-label">Learning goal</p><p>${esc(t.goal)}</p></div>
<div><p class="section-label">Before you begin</p><p>${esc(t.prior)}</p></div>
</div>
<details class="page-guide"><summary><strong>How to complete this lesson</strong></summary>
<div class="guide-body"><ol><li>Read the learning goal and the explanation.</li></ol></div></details>
<div class="textbook-band"><div><p class="section-label">Textbook reading</p><p><strong>${esc(t.reading)}</strong></p></div></div>
<p class="terms-line lesson-term-strip"><strong>Key terms:</strong> ${t.terms.map(esc).join(' · ')}</p>
</header>
<section class="lesson-block"><h2>${esc(t.h2)}</h2><p>${esc(t.p1)}</p><p>${esc(t.p2)}</p></section>
<figure class="source-card"><p class="source-head"><strong>${esc(t.sourceTitle)}</strong><br>${esc(t.sourceVoice)}<br>${esc(t.sourceContext)}</p>
<blockquote>${esc(t.sourceExtract)}</blockquote>
<p class="source-context"><strong>Context and limits:</strong> ${esc(t.sourceLimits)}</p>
<details class="source-details"><summary>Source details</summary><dl><div><dt>Attribution</dt><dd>${esc(t.sourceAttribution)}</dd></div></dl></details></figure>
<div class="worked-example"><h2>${esc(t.workedTitle)}</h2><p>${esc(t.workedStep)}</p><p>${esc(t.workedResponse)}</p></div>
<div class="practice-item"><p class="practice-number">Supported practice</p><h3>${esc(t.supportedTitle)}</h3><p>${esc(t.supportedTask)}</p><div class="practice-feedback"><p>${esc(t.supportedFeedback)}</p></div></div>
<div class="practice-item"><p class="practice-number">Independent practice</p><h3>${esc(t.independentTitle)}</h3><p>${esc(t.independentTask)}</p><p>${esc(t.independentCriteria)}</p></div>
</section>`;
}

function sha256File(p) {
  return 'sha256:' + crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const { context, DATA } = buildSeam();
  const lesson = fixtureLesson();
  const activity = context.getUnitActivity('theme-1');
  const article = context.renderLessonArticle(activity, lesson, 6);
  for (const [key, value] of Object.entries(TEXT)) {
    if (key === 'terms') {
      for (const term of value) {
        if (!article.includes(term)) throw new Error(`candidate render dropped fixture text: ${term}`);
      }
    } else if (!article.includes(value)) {
      throw new Error(`candidate render dropped fixture text (${key}): ${String(value).slice(0, 50)}`);
    }
  }
  const candidatePath = path.resolve(OUT, 'fixture-candidate.html');
  const donorPath = path.resolve(OUT, 'fixture-donor.html');
  fs.writeFileSync(candidatePath, shell(
    'R05 fixture — AB30 candidate',
    '../../../workspace/styles.css',
    article,
    'R05 SAME-TEXT FIXTURE — candidate side (real renderer output). Synthetic sample text; not a real lesson.'
  ));
  const donorHtml = donorArticle();
  for (const [key, value] of Object.entries(TEXT)) {
    const needles = key === 'terms' ? value : [value];
    for (const needle of needles) {
      if (!donorHtml.includes(needle)) throw new Error(`donor fixture dropped fixture text (${key})`);
    }
  }
  fs.writeFileSync(donorPath, shell(
    'R05 fixture — Biology donor styles',
    '../../../../biology30-unit-a-pilot-3/workspace/styles.css',
    donorHtml,
    'R05 SAME-TEXT FIXTURE — donor side (donor stylesheet, re-expressed structure). Synthetic sample text; no donor content.'
  ));
  const lock = {
    route: 'R05',
    note: 'Frozen same-text lock. Regeneration is deterministic; hash drift means renderer or fixture drift.',
    text: TEXT,
    files: {
      'fixture-candidate.html': sha256File(candidatePath),
      'fixture-donor.html': sha256File(donorPath),
    },
  };
  const lockPath = path.resolve(OUT, 'same-text-fixture.json');
  fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n');
  console.log(JSON.stringify({ candidate: candidatePath, donor: donorPath, lock: lockPath }, null, 2));
}

if (require.main === module) main();
module.exports = { main };
