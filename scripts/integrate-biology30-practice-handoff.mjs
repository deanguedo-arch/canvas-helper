import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {load} from 'cheerio';
const ref='origin/chatgpt/ch12-ch13-practice-handoff';
const folder='handoff/biology30-ch12-ch13-practice';
const revision=execFileSync('git',['rev-parse',ref],{encoding:'utf8'}).trim();
const read=name=>execFileSync('git',['show',`${ref}:${folder}/${name}`],{encoding:'utf8'});
for(const chapter of [12,13]){
 const dir=`projects/biology30-chapter-${chapter}`;
 fs.mkdirSync(`${dir}/workspace/practice`,{recursive:true});
 for(const name of [`chapter${chapter}-practice-bank.js`,`chapter${chapter}-practice-bank.json`,'labeling-manifest.json','CODEX-HANDOFF.md','textbook-figure-inventory.md'])fs.writeFileSync(`${dir}/workspace/practice/${name}`,read(name));
 const context={window:{}};vm.runInNewContext(read(`chapter${chapter}-practice-bank.js`),context);
 const bank=context.window[`CH${chapter}_PRACTICE_BANK`];
 const authored=JSON.parse(read(`chapter${chapter}-practice-bank.json`));
 const $=load(fs.readFileSync(`${dir}/workspace/index.html`,'utf8'));
 const data=JSON.parse($('#course-data').text());
 const lesson=id=>Number(id.match(/(?:lesson-|l)(\d+)$/)?.[1]);
 const difficulty=n=>n===1?'recall':n===4?'challenge':'application';
 data.practiceConcepts=bank.concepts.map(c=>({id:c.id,lesson:lesson(c.lessonId),term:c.term,meaning:c.definition,example:c.scenario,confusion:c.misconception,aliases:c.aliases,cue:c.cue,source:c.sourceRefs.join('; ')}));
 const mc=authored.authoredQuestions.filter(q=>q.kind==='mc').map(q=>({id:q.id,lesson:lesson(q.lessonId),difficulty:difficulty(q.difficulty),prompt:q.prompt,options:q.choices,answer:q.answer,cue:q.cue,explanation:q.explanation,source:`Chapter ${chapter} authored formative handoff; ${q.lessonId}`}));
 // Definitions are explicitly authored; do not synthesize ambiguous scenario or sequence questions.
 for(const c of bank.concepts){
  const peers=bank.concepts.filter(p=>p.id!==c.id&&p.lessonId===c.lessonId&&!c.aliases.includes(p.term)&&!p.aliases.includes(c.term));
  const options=[c.term,...peers.map(p=>p.term).filter((t,i,a)=>a.indexOf(t)===i).slice(0,3)];
  if(options.length<3)continue;
  mc.push({id:c.id+'-recognize',lesson:lesson(c.lessonId),difficulty:'recall',prompt:`Which term matches this definition? ${c.definition}`,options,answer:c.term,cue:c.cue,explanation:c.explanation,source:c.sourceRefs.join('; ')});
 }
 if(mc.some(q=>!data.lessons[q.lesson-1]||q.options.filter(x=>x===q.answer).length!==1||new Set(q.options).size!==q.options.length))throw new Error('Invalid question mapping/options');
 data.practiceQuestions=mc;data.bankVersion=bank.bankVersion;
 $('#course-data').text(JSON.stringify(data));fs.writeFileSync(`${dir}/workspace/index.html`,$.html());
 let js=fs.readFileSync(`${dir}/workspace/main.js`,'utf8');
 js=js.replace('let words=C.words.filter(w=>topic', 'let words=(C.practiceConcepts||C.words).filter(w=>topic');
 js=js.replace('cue:`Use a term from “${C.lessons[w.lesson-1].title}”. ${w.confusion}`','cue:w.cue||`Use a term from “${C.lessons[w.lesson-1].title}”.`');
 fs.writeFileSync(`${dir}/workspace/main.js`,js);
 fs.writeFileSync(`${dir}/meta/practice-handoff-integration.json`,JSON.stringify({revision,branch:ref,bankVersion:bank.bankVersion,concepts:bank.concepts.length,multipleChoice:mc.length,ordering:'Existing reviewed course sequences retained; handoff sequences not blindly generated.',labeling:'Existing three activities retained pending individual manifest-to-image visual review.',progress:'Formative only; required check IDs and storage namespaces unchanged.',sourceOfTruth:'workspace/index.html course-data and workspace/main.js',deferred:['Full science/distractor review','Expanded labeling manifest integration','Rollout E2E','SCORM/Brightspace']},null,2)+'\n');
 console.log(`Chapter ${chapter}: ${bank.concepts.length} flash/blank concepts, ${mc.length} MC items.`);
}
