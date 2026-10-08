import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { load } from 'cheerio';

// Review-only derived HTML. Never writes to a learner workspace or raw manuscript.
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const relativeRoot = 'projects/biology30-unit-a-pilot-3/meta/teaching-overhaul/2026-10-02-browser-authoring';
const root = path.join(repo, relativeRoot);
const workspace = '../../../workspace';
const lessons = [
  { id: 'lesson-01', title: 'Nervous communication', source: 'CH11_Lesson01_Nervous_Communication_v2.md', page: 8,
    description: 'Detection, integration, response, homeostasis and nervous-system organization.' },
  { id: 'lesson-02', title: 'Neurons & myelin', source: 'CH11_Lesson02_Neurons_Myelin_v2.md', page: 13,
    description: 'Neuron structure and function, diagram reading, myelin and impulse conduction.' },
  { id: 'lesson-03', title: 'Pathways & reflexes', source: 'CH11_Lesson03_Pathways_Reflexes_v2.md', page: 11,
    description: 'Sensory and motor pathways, chosen responses and spinal withdrawal reflexes.' },
];
const mapFile = 'CH11_First_Batch_Source_Assets_Integration_v2.md';
const hash = value => createHash('sha256').update(value).digest('hex');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const manifest = { schemaVersion: 1, role: 'read-only manuscript review; not a learner course',
  renderer: 'scripts/render-biology30-teaching-review.mjs', sources: [], outputs: [] };

// Fail closed if externally authored Markdown contains active HTML or unsafe URLs.
function renderMarkdown(markdown, lesson) {
  const $ = load(marked.parse(markdown, { gfm: true }), {}, false);
  const tags = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'del',
    'ul', 'ol', 'li', 'details', 'summary', 'a', 'blockquote', 'hr', 'br', 'code', 'pre',
    'table', 'thead', 'tbody', 'tr', 'th', 'td']);
  const headings = new Map();
  $('*').each((_, node) => {
    if (!tags.has(node.name)) throw new Error(`Unsafe or unsupported Markdown tag: ${node.name}`);
    for (const name of Object.keys(node.attribs)) {
      const allowed = (node.name === 'a' && ['href', 'title'].includes(name))
        || (node.name === 'ol' && name === 'start')
        || (['th', 'td'].includes(node.name) && name === 'align');
      if (!allowed) throw new Error(`Unsafe or unsupported Markdown attribute: ${name}`);
    }
    if (node.name === 'a') {
      const href = $(node).attr('href') || '';
      if (/^[\s\S]*[\u0000-\u0020]/u.test(href) || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href) && !href.startsWith('https://')) {
        throw new Error(`Unsafe Markdown link: ${href}`);
      }
      if (/^#lesson-0[123]$/.test(href)) $(node).attr('href', `${href.slice(1)}.html`);
      else if (href === '#lesson-04') {
        $(node).attr('href', `${workspace}/index.html#lesson-04`).attr('title', 'Opens the unchanged current course, not a revised draft');
      } else if (href === '#textbook-library' && lesson) {
        $(node).attr('href', `attachments/Chapter11_Original_Textbook.pdf#page=${lesson.page}`);
      }
      $(node).attr('rel', 'noopener');
    }
    if (/^h[1-6]$/.test(node.name)) {
      const base = $(node).text().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'heading';
      const count = (headings.get(base) || 0) + 1;
      headings.set(base, count);
      $(node).attr('id', `${base}${count > 1 ? `-${count}` : ''}`);
    }
  });
  $('table').wrap('<div class="table-scroll" tabindex="0" role="region" aria-label="Lesson comparison table"></div>');
  return $.html();
}

const css = `
@font-face{font-family:"Hanken Grotesk";src:url("${workspace}/assets/fonts/HankenGrotesk-Variable.ttf") format("truetype");font-weight:100 900;font-display:swap}
@font-face{font-family:"Work Sans";src:url("${workspace}/assets/fonts/WorkSans-Variable.ttf") format("truetype");font-weight:100 900;font-display:swap}
:root{--ink:#171b1b;--muted:#5b635d;--canvas:#f7f8f5;--green:#154212;--teal:#146c60;--border:#d9ded8;--soft:#eef3ee}
*{box-sizing:border-box}body{margin:0;color:var(--ink);background:var(--canvas);font:17px/1.66 "Work Sans",Arial,sans-serif}
a{color:var(--teal);text-underline-offset:3px}a:hover{color:var(--green)}a:focus-visible,summary:focus-visible,.table-scroll:focus-visible{outline:3px solid #f2b84b;outline-offset:3px}
.skip{position:absolute;left:16px;top:-100px;background:#fff;padding:10px;z-index:10}.skip:focus{top:8px}
.topbar{height:64px;background:var(--ink);color:#fff;display:flex;align-items:center;justify-content:center;gap:32px;padding:8px 24px}
.topbar img{width:116px;max-height:50px;object-fit:contain}.topbar p{font-size:14px;margin:0}
.shell{display:grid;grid-template-columns:270px minmax(0,1fr);min-height:calc(100vh - 64px)}
.sidebar{background:var(--ink);color:#fff;padding:24px 18px;border-right:1px solid #303830}
.sidebar-title{font:800 24px/1.1 "Hanken Grotesk",sans-serif;margin:0 0 32px}.sidebar h2{font-size:18px;margin:24px 0 12px}
.sidebar nav a{display:block;padding:10px 14px;border-left:2px solid transparent;color:#e5ebe3;text-decoration:none;font-size:14px;line-height:1.5}
.sidebar nav a:hover{background:#232b24}.sidebar nav a[aria-current="page"]{border-color:#94bd85;font-weight:800;color:#fff}
.sidebar .reference-links{border-top:1px solid #303830;padding-top:20px;margin-top:28px}.sidebar .reference-links a{display:block;color:#c9ddc4;font-size:14px;margin-bottom:16px}
main{min-width:0;padding:32px 36px 64px}.reader{max-width:980px;margin:auto;background:#fff;border:1px solid var(--border);border-top:5px solid var(--green);border-radius:6px 6px 0 0;overflow:hidden}
.review-notice{padding:20px 54px;background:var(--soft);border-bottom:1px solid var(--border);font-size:14px;line-height:1.6}
.review-notice p{margin:0}.review-notice p+p{margin-top:8px}.manuscript,.overview,.teacher-notes{padding:32px 54px}
h1,h2,h3,h4,h5,h6,summary{font-family:"Hanken Grotesk",sans-serif}h1{font-size:clamp(34px,4.4vw,50px);font-weight:800;line-height:1.08;margin:8px 0 24px}
h2{font-size:28px;line-height:1.25;margin:42px 0 20px}h3{font-size:22px;line-height:1.35;margin:28px 0 14px}h4{font-size:19px}
p{margin:0 0 22px}strong{font-weight:760}li{margin:10px 0}ul,ol{padding-left:28px}hr{border:0;border-top:1px solid var(--border);margin:30px 0}
details{border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin:24px 0;padding:0 18px}
summary{cursor:pointer;color:var(--green);font-size:18px;font-weight:760;padding:14px 0}details[open]>summary{margin-bottom:12px}details>:last-child{margin-bottom:20px}
.manuscript>details:first-of-type{background:#eef6f3;border-left:4px solid var(--teal);border-top:0;border-bottom:0;padding:4px 24px}
.table-scroll{overflow-x:auto;margin:24px 0}table{border-collapse:collapse;width:100%;min-width:420px;font-size:16px}th,td{padding:14px;vertical-align:top;text-align:left;border:1px solid var(--border)}th{background:var(--soft)}
blockquote{border-left:4px solid var(--teal);margin:24px 0;padding:12px 20px;background:var(--soft)}code{overflow-wrap:anywhere;font-size:.86em}pre{white-space:pre-wrap}
.lesson-index{list-style:none;padding:0;margin:28px 0}.lesson-index li{border-top:1px solid var(--border);padding:22px 0;margin:0}.lesson-index a{font:760 24px/1.3 "Hanken Grotesk",sans-serif}.lesson-index p{color:var(--muted);margin:10px 0 0}
.teacher-notes{border-top:1px solid var(--border);font-size:15px}.teacher-notes>details{margin:0}.teacher-notes h1{font-size:30px}.teacher-notes h2{font-size:24px}.teacher-notes h3{font-size:20px}
.bottom-links{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;border-top:1px solid var(--border);margin-top:32px;padding-top:24px}
@media(max-width:760px){.shell{display:block}.topbar{justify-content:space-between;gap:16px}.sidebar{padding:20px}.sidebar-title{font-size:22px;margin-bottom:14px}.sidebar h2{margin:12px 0}.sidebar .reference-links{margin-top:14px;padding-top:12px}.sidebar .reference-links a{display:inline-block;margin:0 20px 8px 0}.sidebar nav a{padding:8px 12px}main{padding:20px 12px 40px}.review-notice,.manuscript,.overview,.teacher-notes{padding:24px}h2{font-size:25px}.table-scroll{max-width:100%}}
@media print{.sidebar,.topbar,.review-notice,.bottom-links,.teacher-notes,.skip{display:none}.shell{display:block}main{padding:0}.reader{border:0;max-width:none}.manuscript,.overview{padding:0}details{break-inside:avoid}.table-scroll{overflow:visible}table{min-width:0}}
`;

function page(title, current, content) {
  const navLink = (file, label, id) => `<a href="${file}"${id === current ? ' aria-current="page"' : ''}>${escape(label)}</a>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; font-src 'self' file:; img-src 'self' file:; base-uri 'none'; form-action 'none'">
<title>${escape(title)} · Biology 30 teaching review</title><style>${css}</style></head><body>
<a class="skip" href="#review-main">Skip to manuscript</a>
<header class="topbar"><img src="${workspace}/assets/brand/nxt-ce-logo-white-with-ce.png" alt="Next Step Continuing Education"><p>Chapter 11 · teaching draft review</p></header>
<div class="shell"><aside class="sidebar"><p class="sidebar-title">Biology 30 -<br>Chapter 11</p><h2>Review the drafts</h2>
<nav aria-label="Teaching review">${navLink('index.html', 'Review overview', 'overview')}${lessons.map((lesson, i) => navLink(`${lesson.id}.html`, `${i + 1}. ${lesson.title}`, lesson.id)).join('')}</nav>
<div class="reference-links"><a href="responses/CH11_First_Batch_Authoring_Draft_v2.zip">Download complete manuscripts</a><a href="source-notes.html">Teacher source and integration notes</a><a href="${workspace}/index.html">Open unchanged current course</a></div></aside>
<main id="review-main"><div class="reader"><div class="review-notice"><p><strong>Draft v2 — awaiting Dean’s approval.</strong> This is a read-only manuscript preview, not the live learner course.</p><p>Full lesson wording is preserved. Native hints and feedback can be opened. Diagrams, vocabulary pop-ups, response fields and saving are not integrated here.</p></div>${content}</div></main></div></body></html>\n`;
}

async function source(file) {
  const relative = `responses/v2/${file}`;
  const bytes = await readFile(path.join(root, relative));
  manifest.sources.push({ path: relative, bytes: bytes.length, sha256: hash(bytes) });
  return bytes.toString('utf8');
}
async function output(file, html) {
  await writeFile(path.join(root, file), html);
  manifest.outputs.push({ path: file, bytes: Buffer.byteLength(html), sha256: hash(html) });
}

for (const [i, lesson] of lessons.entries()) {
  const markdown = await source(lesson.source);
  const begin = '## BEGIN LEARNER MANUSCRIPT';
  const end = '## END LEARNER MANUSCRIPT';
  if (markdown.split(begin).length !== 2 || markdown.split(end).length !== 2) throw new Error(`Missing or repeated manuscript boundary: ${lesson.source}`);
  const learner = markdown.split(begin)[1].split(end)[0].trim();
  const teacher = markdown.split(end)[1].trim();
  const previous = i ? `<a href="${lessons[i - 1].id}.html">Previous draft</a>` : '<a href="index.html">Review overview</a>';
  const next = i < lessons.length - 1 ? `<a href="${lessons[i + 1].id}.html">Next draft</a>` : '<a href="index.html">Return to review overview</a>';
  await output(`${lesson.id}.html`, page(lesson.title, lesson.id,
    `<article class="manuscript">${renderMarkdown(learner, lesson)}<nav class="bottom-links" aria-label="Draft navigation">${previous}${next}</nav></article>
<section class="teacher-notes" aria-label="Teacher-only notes"><details><summary>Teacher notes and source references</summary><p><a href="responses/v2/${lesson.source}">Open the complete original Markdown manuscript</a></p>${renderMarkdown(teacher)}</details></section>`));
}
await output('source-notes.html', page('Teacher source and integration notes', 'sources',
  `<article class="teacher-notes"><p><strong>Teacher-only appendix.</strong> These notes are not learner copy and do not authorize course integration.</p>${renderMarkdown(await source(mapFile))}</article>`));
await output('index.html', page('First three lesson drafts', 'overview', `<article class="overview">
<h1>Review the first three lessons</h1><p>Choose a lesson below to read its complete revised teaching, examples, guided practice, independent practice and feedback.</p>
<ol class="lesson-index">${lessons.map((lesson, i) => `<li><a href="${lesson.id}.html">${i + 1}. ${escape(lesson.title)}</a><p>${escape(lesson.description)}</p></li>`).join('')}</ol>
<h2>What to review</h2><ul><li>Can a first-time learner understand why each step happens without depending on the textbook or video?</li><li>Does the wording sound like your Biology 30 teacher voice, with enough explanation and scientific depth?</li><li>Do examples and diagram directions teach useful reasoning, and is the practice fair after that teaching?</li><li>Are the instructions clear about notes, drawings, saving written responses and finishing the required check?</li></ul>
<p>Tell me your requested changes by lesson and heading, or explicitly approve this first batch’s teaching and wording. This preview does not record approval automatically.</p>
<h2>Review boundary</h2><p>All six original required prompts are retained in these drafts. New guided and independent items are notes/self-check practice, not new progress gates. The current course, learner saves, styling, runtime and release status are unchanged.</p>
<p>New media proposals remain separate from the manuscripts. This is a content review, not a fully integrated visual or interaction preview. After your decision, the next calibration is Chapter 19 lesson-04 before scaling to more lessons.</p>
<p><a href="source-notes.html">Read the source, media and integration map</a> · <a href="responses/CH11_First_Batch_Authoring_Draft_v2.zip">Download all four full manuscripts</a></p>
</article>`));
manifest.rendererSha256 = hash(await readFile(fileURLToPath(import.meta.url)));
await writeFile(path.join(root, 'HTML_REVIEW_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ reviewIndex: `${relativeRoot}/index.html`, renderedPages: manifest.outputs.length, sourceManuscripts: manifest.sources.length, learnerCourseChanged: false }));
