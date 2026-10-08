// Review derivative owner. Never writes the canonical workspace or baseline.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),c=require('cheerio');
const root=__dirname,baseline=path.join(root,'baseline'),refresh=process.argv.includes('--refresh');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const before=fs.readFileSync(path.join(baseline,'index.html'),'utf8');
const article=fs.readFileSync(path.join(root,'lesson-b.html'),'utf8');
const $=c.load(before,{sourceCodeLocationInfo:true}),el=$('#ce1-03')[0],loc=el.sourceCodeLocation;
const candidate=before.slice(0,loc.startOffset)+article+before.slice(loc.endOffset);

// Full learner manuscript, including the original tasks and intentional reveals.
const doc=c.load(article), normalize=s=>s.replace(/\s+/g,' ').trim();
function md(node,depth=0){
 if(node.type==='text')return node.data;
 if(node.type!=='tag')return '';
 const tag=node.tagName,children=()=> (node.children||[]).map(n=>md(n,depth)).join('');
 if(['input','button','textarea','select'].includes(tag)){
  if(tag==='button'&&doc(node).hasClass('vocab-term'))return doc(node).text();
  if(tag==='button')return '\n[Control: '+doc(node).text()+']\n';
  if(tag==='select')return '\n[Selection options: '+normalize(doc(node).text())+']\n';
  return tag==='textarea'?'\n[Response field: '+(doc(node).attr('placeholder')||'write here')+']\n':'';
 }
 if(['script','template'].includes(tag))return '';
 if(/^h[1-6]$/.test(tag))return '\n\n'+'#'.repeat(Math.min(6,Number(tag[1])+1))+' '+normalize(doc(node).text())+'\n\n';
 if(tag==='p')return '\n\n'+children().trim()+'\n\n';
 if(tag==='br')return '\n';
 if(tag==='a')return '['+normalize(doc(node).text())+']('+doc(node).attr('href')+')';
 if(tag==='strong')return '**'+children().trim()+'**';
 if(tag==='em')return '*'+children().trim()+'*';
 if(tag==='li')return '\n- '+children().trim()+'\n';
 if(tag==='summary')return '\n\n**Disclosure: '+normalize(doc(node).text())+'**\n\n';
 if(tag==='dt')return '\n\n**'+normalize(doc(node).text())+'** — ';
 if(tag==='dd')return children().trim()+'\n';
 if(tag==='legend')return '\n\n**Question: '+normalize(doc(node).text())+'**\n\n';
 if(tag==='label')return '\n\n'+children().trim()+'\n';
 if(tag==='blockquote')return '\n\n> '+normalize(doc(node).text())+'\n\n';
 if(tag==='video')return '\n\n[Video: '+doc(node).find('source').attr('src')+']\n\n';
 if(tag==='table'){
  const rows=doc(node).find('tr').toArray().map(r=>doc(r).children('th,td').toArray().map(cell=>normalize(doc(cell).text())));
  return '\n\n'+rows.map((r,i)=>'| '+r.join(' | ')+' |'+(i===0?'\n| '+r.map(()=>'---').join(' | ')+' |':'')).join('\n')+'\n\n';
 }
 return children();
}
const manuscript='# CE1-03 complete proposed learner manuscript — B v1\n\nReview proposal; current course is unchanged. Native disclosures are labelled below; their solutions remain intentional reveals in the working review.\n\n'+md(doc('#ce1-03')[0]).replace(/\n{3,}/g,'\n\n');
fs.writeFileSync(path.join(root,'manuscript.md'),manuscript,{flag:refresh?'w':'wx'});
const review=path.join(root,'review');fs.mkdirSync(review,{recursive:true});
for(const [version,html] of [['a',before],['b',candidate]]){
 const dest=path.join(review,version);fs.mkdirSync(dest,{recursive:refresh});
 for(const f of fs.readdirSync(baseline))if(f!=='index.html'&&f!=='ce1-03.html'){
  const content=fs.readFileSync(path.join(baseline,f));
  fs.writeFileSync(path.join(dest,f),f.endsWith('.js')?content.toString().replaceAll('calm10-2026-draft:',`calm10-2026-draft:ce1-03-teacher-v1:${version}:`):content);
 }
 const nav=`<nav class="review-switch" aria-label="CE1-03 comparison"><strong>Version ${version.toUpperCase()} · ${version==='a'?'current lesson':'proposed teacher narration'}</strong><a href="../${version==='a'?'b':'a'}/index.html#ce1-03">Read version ${version==='a'?'B':'A'}</a><a href="../../">Compare A and B</a><span>Review work saves separately from the course.</span></nav>`;
 const framed=html.replace('</head>','<link rel="stylesheet" href="../../review.css"></head>').replace('<main class="course-frame">','<main class="course-frame">'+nav);
 fs.writeFileSync(path.join(dest,'index.html'),framed);
}
const points=[['opening','Opening and lesson journey','ce1-03-foundations'],['vocabulary','Core vocabulary','vocabulary'],['worked','Worked Route A example','ce1-03-worked'],['practice','Supported Route B practice','ce1-03-practice'],['independent','Independent Owen task','ce1-03-apply']];
const quotes={
 opening:['“A route is the learning and work steps toward a possible role.”','“Two training options can lead toward the same kind of work, yet one may fit your situation much better.”'],
 vocabulary:['Four definitions in one FINLIT paragraph.','The shared CALM disclosure with one term and definition per entry.'],
 worked:['“Listed cost: $300 fees + $200 supplies + ($120 × 4 travel months) = $980.”','“If I add only one travel charge, I leave out three months of a cost Leah would still need to cover.”'],
 practice:['“Leah has Practical Mathematics 1, not Mathematics 2. Start by counting all ten travel months.”','“Now test the alternative instead of simply calling it ‘Plan B.’ … A useful backup is one she could actually prepare to use.”'],
 independent:['“Owen is a different learner. Do not reuse Leah’s budget, courses or dates.”','“The comparison questions stay the same, but the person, work, courses, budget and dates change.”']
};
const escape=x=>x.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
fs.writeFileSync(path.join(root,'review.css'),`.review-switch{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px 20px;padding:16px 24px;border-bottom:1px solid var(--border);background:#fff;font-size:14px;line-height:1.5}.review-switch span{width:100%;color:var(--muted);font-size:13px}.review-main{max-width:1160px;margin:0 auto;padding:30px 24px 60px}.review-main h1{font-size:34px}.review-main h2{margin-top:40px;font-size:26px}.review-links{display:flex;flex-wrap:wrap;gap:12px 24px;margin:20px 0}.review-pair{display:grid;grid-template-columns:1fr 1fr;gap:24px}.review-pair figure{min-width:0;margin:0}.review-pair img{display:block;width:100%;height:auto;border:1px solid var(--border);margin-top:10px}.review-pair figcaption{font-weight:750}.review-pair blockquote{margin:14px 0;padding-left:14px;border-left:3px solid var(--teal);font-size:16px}.review-main details{margin:20px 0}.review-main summary{cursor:pointer;font-weight:750}.review-mobile img{max-width:390px}.review-note-panel{border-bottom:1px solid var(--border);padding-bottom:20px}.review-main table{width:100%;border-collapse:collapse;margin:20px 0}.review-main th,.review-main td{padding:12px;border:1px solid var(--border);text-align:left;vertical-align:top}.review-main p{max-width:80ch}@media(max-width:760px){.review-pair{grid-template-columns:1fr}.review-main{padding:20px 16px}.review-switch{padding:14px 18px}.review-main h1{font-size:28px}}`);
const comparisons=points.map(([id,title,anchor])=>`<section id="${id}"><h2>${title}</h2><div class="review-links"><a href="review/a/index.html#${anchor==='vocabulary'?'ce1-03':anchor}">Try A at this point</a><a href="review/b/index.html#${anchor==='vocabulary'?'ce1-03':anchor}">Try B at this point</a></div><div class="review-pair">${['a','b'].map((v,i)=>`<figure><figcaption>${v.toUpperCase()} · ${v==='a'?'Current':'Proposed'}</figcaption><blockquote>${escape(quotes[id][i])}</blockquote><a href="screens/${v}-${id}-desktop.png"><img src="screens/${v}-${id}-desktop.png" alt="Version ${v.toUpperCase()} desktop view of ${title.toLowerCase()}" loading="lazy"></a></figure>`).join('')}</div><details><summary>Compare the mobile views</summary><div class="review-pair review-mobile">${['a','b'].map(v=>`<figure><figcaption>${v.toUpperCase()} · Mobile</figcaption><a href="screens/${v}-${id}-mobile.png"><img src="screens/${v}-${id}-mobile.png" alt="Version ${v.toUpperCase()} mobile view of ${title.toLowerCase()}" loading="lazy"></a></figure>`).join('')}</div></details></section>`).join('\n');
fs.writeFileSync(path.join(root,'index.html'),`<!doctype html><html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CE1-03 · Compare A and B</title><link rel="stylesheet" href="review/a/styles.css"><link rel="stylesheet" href="review.css"></head><body><main class="review-main"><h1>Compare routes into a career: A and B</h1><div class="review-note-panel"><p><strong>A is the current lesson. B is the proposed complete teaching rewrite.</strong> Read B from the beginning to judge the flow, then use the paired views below to compare individual points.</p><p>Both full versions use the course’s sidebar, vocabulary, videos, practice and completion controls. Entries save separately in each review version. The current course and its saved work are unchanged.</p><div class="review-links"><a href="review/b/index.html#ce1-03"><strong>Read and try the complete B lesson</strong></a><a href="review/a/index.html#ce1-03">Read and try A</a><a href="manuscript.md">Read the complete proposed manuscript</a></div><p>B introduces the question and learning journey, teaches document reading in context, explains the Route A reasoning, connects Route B practice to the decision and prepares students for Owen’s new facts. It also restores the shared vocabulary presentation and corrects the model’s description of Owen’s time preference.</p></div>${comparisons}<section><h2>Your decision</h2><p>After trying the flow, tell me <strong>A</strong>, <strong>B</strong>, or the specific changes you want. Your choice will determine the next canonical edit. This review does not apply the rewrite to other lessons.</p></section></main></body></html>`);
fs.writeFileSync(path.join(root,'COMPARISON_MANIFEST.json'),JSON.stringify({schemaVersion:1,lesson:'ce1-03',version:'teacher-narrative-v1',status:'awaiting-teacher-review',teacherAccepted:false,canonicalIntegrated:false,originalIndexSHA256:sha(before),proposedArticleSHA256:sha(article),manuscriptSHA256:sha(manuscript),points:points.map(([id,title,anchor])=>({id,title,anchor})),storagePrefixes:{a:'calm10-2026-draft:ce1-03-teacher-v1:a:',b:'calm10-2026-draft:ce1-03-teacher-v1:b:'}},null,2)+'\n');
console.log('Complete manuscript and isolated native A/B review assembled.');
