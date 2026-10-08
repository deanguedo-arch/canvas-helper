import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {build} from 'esbuild';
import {spawnSync} from 'node:child_process';
import {buildVisualReview} from './lib/science24-games/review_visual_assets.mjs';
const root=path.resolve(import.meta.dirname,'..');
const meta=path.join(root,'projects/science24-unit-a/meta/science24-games-v2');
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const suite=await read(path.join(meta,'suite.json'));
// This packager owns the archived rc1 delivery, not the new gameplay candidate.
if(suite.gameplayRedesign)throw new Error('Gameplay redesign is in progress. The preserved v2.0.1-rc1 delivery cannot be overwritten. Accept the pilot and use a new candidate version with an updated packager at the release checkpoint.');
const fixture=await read(path.join(meta,'independent-fixtures.json'));
const dir=path.join(meta,'delivery','Science24_All_8_Games_Teacher_Review_v2.0.1-rc1');
const bundledPython='/Users/deanguedo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
 const python=process.env.S24_PYTHON || (await fs.access(bundledPython).then(()=>bundledPython).catch(()=>'python3')); 
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const write=async(p,s)=>{await fs.mkdir(path.dirname(p),{recursive:true});await fs.writeFile(p,s);};
async function files(dir){let out=[];for(const ent of await fs.readdir(dir,{withFileTypes:true})){if(ent.name.startsWith('.')||ent.name==='__pycache__')continue;const p=path.join(dir,ent.name);out.push(...ent.isDirectory()?await files(p):[p]);}return out;}
const json=x=>JSON.stringify(x).replaceAll('<','\\u003c');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reuse=process.argv.includes('--reuse-offline-evidence');
const previousPLAY={};
if(reuse)for(const g of suite.games)previousPLAY[g.id]=sha(await fs.readFile(path.join(dir,'games',g.id,'PLAY.html')));
const snapshot={};
// Source and A1 frozen parity are checked before generating any delivery.
const frozen=await read(path.join(meta,'a1-frozen-files.json'));
for(const [rel,h]of Object.entries(frozen)){if(sha(await fs.readFile(path.join(root,suite.games[0].canonical,rel)))!==h)throw Error('A1 drift: '+rel);}
for(const g of suite.games)for(const f of await files(path.join(root,g.canonical))){const rel=path.relative(root,f).split(path.sep).join('/');snapshot[rel]=sha(await fs.readFile(f));}
await fs.mkdir(dir,{recursive:true});
for(const g of suite.games){
 const src=path.join(root,g.canonical),target=path.join(dir,'games',g.id),source=path.join(dir,'sources',g.id);
 await fs.mkdir(target,{recursive:true});await fs.cp(src,source,{recursive:true});
 let html=await fs.readFile(path.join(src,'index.html'),'utf8');
 if(g.id==='A1'){
  html=html.replace('<link rel="stylesheet" href="styles.css">','<style>\n'+await fs.readFile(path.join(src,'styles.css'),'utf8')+'\n</style>');
  for(const name of ['scenarios.js','engine.js','game.js']){
   let code=await fs.readFile(path.join(src,name),'utf8');
   for(const [rel]of Object.entries(frozen).filter(([r])=>r.endsWith('.webp')))code=code.replaceAll(rel,'data:image/webp;base64,'+(await fs.readFile(path.join(src,rel))).toString('base64'));
   html=html.replace(`<script src="${name}"></script>`,'<script>\n'+code+'\n</script>');
  }
  const expected=(await read(path.join(root,'projects/science24-unit-a/meta/reaction-detective-review-2026-10-07/independent-validation.json'))).playSHA256;
  if(sha(Buffer.from(html))!==expected)throw Error('A1 rebuilt offline bytes differ from frozen accepted evidence');
 }else{
  const assets={};for(const f of await files(path.join(src,'assets'))){const ext=path.extname(f).toLowerCase();const mime={'.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.jpg':'image/jpeg'}[ext];if(mime)assets[path.relative(src,f).split(path.sep).join('/')]=`data:${mime};base64,`+(await fs.readFile(f)).toString('base64');}
  const result=await build({entryPoints:[path.join(src,'js/app.js')],bundle:true,format:'esm',write:false,target:'es2022',minify:false});
  const code=result.outputFiles[0].text;
  if(/\bimport\s.*?from\s/.test(code))throw Error('Offline bundle contains unresolved imports');
  html=html.replace(/<link rel="stylesheet" href="css\/([^" ]+)">/g,(match,name)=>`<!-- inline ${name} -->`);
  const css=await fs.readFile(path.join(src,'css/shell.css'),'utf8')+'\n'+await fs.readFile(path.join(src,'css/game.css'),'utf8');
  html=html.replace('</head>','<style>'+css+'</style></head>');
  html=html.replace(/<script type="module" src="js\/app.js"><\/script>/,'<script>globalThis.__S24_OFFLINE_DATA='+json(await read(path.join(src,'data/scenarios.json')))+';globalThis.__S24_ASSETS='+json(assets)+';(async()=>{\n'+code.replaceAll('</script','<\\/script')+'\n})().catch(e=>{document.querySelector("#app").textContent="Game could not start: "+e.message;});</script>');
  for(const [rel,uri]of Object.entries(assets))html=html.replaceAll(`src="${rel}"`,`src="${uri}"`);
 }
 if(/<script[^>]+src=|<link[^>]+stylesheet/.test(html))throw Error('External executable dependency in '+g.id);
 await write(path.join(target,'PLAY.html'),html);
}
const candidateHash=sha(Buffer.from(JSON.stringify(snapshot)));
const gameSourceSHA256=Object.fromEntries(suite.games.map(g=>[g.id,sha(Buffer.from(JSON.stringify(Object.fromEntries(Object.entries(snapshot).filter(([p])=>p.startsWith(g.canonical+'/'))))))]));
const candidate={id:'Science24-v2.0.1-rc1-'+candidateHash.slice(0,12),version:suite.version,sourceSnapshotSHA256:candidateHash,gameSourceSHA256,sourceFiles:snapshot,sourceArchiveSHA256:suite.sourceArchiveSHA256,teacherApproval:'pending',scope:suite.scope};
await write(path.join(meta,'candidate.json'),JSON.stringify(candidate,null,2)+'\n');
await write(path.join(dir,'candidate.json'),JSON.stringify(candidate,null,2)+'\n');
await write(path.join(dir,'CORRECTIONS.md'),await fs.readFile(path.join(meta,'CORRECTIONS.md')));
await fs.cp(path.join(root,'projects/resources/science24-games-v2/handoff/00_SHARED/ALBERTA_SCIENCE24_OUTCOMES_MATRIX.md'),path.join(dir,'SUPPLIED_CROSSWALK_REFERENCE.md'));
await write(path.join(dir,'INDEPENDENT_SOLUTIONS.json'),JSON.stringify(fixture,null,2)+'\n');
for(const g of suite.games){await write(path.join(dir,'approvals',g.id+'.json'),JSON.stringify({game:g.id,title:g.title,candidate:candidate.id,sourceSnapshotSHA256:candidateHash,gameSourceSHA256:gameSourceSHA256[g.id],decision:'pending',reviewerName:null,date:null,scienceJudgment:'Not reviewed',curriculumJudgment:'Not reviewed',usabilityFindings:null,accessibilityFindings:null,requiredRevisions:null,scope:'Standalone supplemental game only; placement/LMS/production separate',invalidateOn:'Any substantive game/content/source change'},null,2)+'\n');}
await write(path.join(dir,'README.txt'),`SCIENCE 24: EIGHT-GAME TEACHER REVIEW\nCandidate: ${candidate.id}\n\nDouble-click START_REVIEW.html, then choose a game. Each games/ID/PLAY.html also opens independently with no server or external services.\nAnonymous work is held only in memory. Closing or reloading clears a session. Print a learner review before closing if a record is needed. Do not enter personal information.\n\nRead TEACHER_GUIDE.html, VALIDATION_STATUS.json, CORRECTIONS.md and CURRICULUM_TASK_MAP.md before deciding. Use TEACHER_REVIEW.pdf or TEACHER_REVIEW_TEXT.txt to record approval. Approvals are pending. The candidate's visual exactness gate is recorded separately and may remain blocked; playable/technical checks do not constitute visual acceptance, teacher approval or release.\n\nReproduce in the originating Canvas Helper checkout with Node 22+, esbuild and Python/Playwright/Pillow/numpy/reportlab/pypdf available:\n npm run test:science24-games -- --game A2\n npm run test:science24-games\n npm run package:science24-games-review\nBundled copies of the scoped scripts are in tooling/. Source snapshots are in sources/; original references are in references/. The full immutable source handoff remains preserved in the repository; its SHA256 is in candidate.json. Do not edit PLAY.html; regenerate from canonical sources.\n\nNo secure course assessments or answer keys are delivered. These teacher solutions apply only to the original supplemental game cases. No SCORM, LMS save/resume, grades, publishing or course integration is included. Any substantive change invalidates affected approval and requires a new version/candidate.\n`);
const guide=[];
guide.push('<h1>Science 24 teacher guide</h1><p>Candidate '+esc(candidate.id)+'. Every explanation requires teacher judgment. Numeric/model checks do not automatically establish reasoning quality.</p>');
const generic={A2:['A coefficient changes the number of particles, never subscripts.','Balanced multiples may be accepted; distinguish them from the smallest ratio.'],B1:['Less-useful thermal/sound energy still belongs in the account.','Identify which output feeds the next converter. Matter is not energy.'],B2:['Required services must remain on for the specified quantity and hours.','Low power and high efficiency are different claims.'],C1:['Success concerns only the stated route; no real risk estimate.','Sanitation, prevention, treatment and immune response have different roles.'],C2:['Dominant phenotype does not determine AA versus Aa.','The fictional one-locus complete-dominance model is limited; each child has independent probabilities.'],D1:['Reaction distance and braking distance are separate.','Graph slope is speed. Zero clearance reaches the obstacle.'],D2:['Use the mass of the named system and signed velocity change.','Longer duration changes average force, not impulse. Average force is not peak force or injury probability.']};
const a1=await fs.readFile(path.join(root,'projects/science24-unit-a/meta/reaction-detective-review-2026-10-07/Teacher_Answer_Guide_and_Text_Form.txt'),'utf8');
guide.push('<h2>A1 Reaction Detective: all six original cases</h2><pre>'+esc(a1)+'</pre>');
for(const g of suite.games.slice(1)){
 const bank=await read(path.join(root,g.canonical,'data/scenarios.json'));
 guide.push('<h2>'+esc(g.id+' '+g.title)+'</h2>');
 bank.scenarios.forEach((s,i)=>{
  guide.push('<section><h3>'+esc(s.id+' · '+s.title+' · '+s.stage)+'</h3><p><strong>Task:</strong> '+esc(s.explanationPrompt)+'</p><p><strong>Supplied quantities/evidence:</strong></p><pre>'+esc(JSON.stringify(Object.fromEntries(Object.entries(s).filter(([k])=>!['teacherReasoning','initial','hints','predictions','pathOptions','scene','explanationPrompt','predictionPrompt','keyIdea'].includes(k))),null,2))+'</pre><p><strong>One independently solved response:</strong></p><pre>'+esc(JSON.stringify(fixture.games[g.id][i],null,2))+'</pre><p><strong>Alternatives:</strong> '+esc(g.id==='A2'?'Every positive integer balanced multiple; smallest ratio only when explicitly requested.':g.id==='C1'?'Any sufficient combination of relevant measures within the stated maximum budget; see the full map and combination checks.':g.id==='C2'?'Possible AA and Aa crosses may be listed in either order; equivalent fractions/percentages accepted.':g.id==='B2'?'Equivalent explanations with correct values and units. Supported equal-service plans may exceed minimum service if still under cap.':'Equivalent calculations and explanations with correct system, values, units and assumptions.')+'</p><p><strong>Misconceptions:</strong> '+esc(generic[g.id].join(' '))+'</p><p><strong>Hints:</strong> '+esc(s.hints.join(' / '))+'</p><p><strong>Explanation rubric:</strong> Model result and units; named evidence/calculation; causal reasoning; assumption, uncertainty or model limit. Teacher rates each criterion as Supported / Needs revision / Not reviewed, with written findings. The learner checklist records self-review only.</p></section>');
 });
}
const style='body{font:16px/1.55 system-ui,sans-serif;max-width:1100px;margin:32px auto;padding:0 24px;color:#172b23}h1,h2,h3{color:#123f2d}h2{border-top:2px solid #123f2d;padding-top:20px}a{color:#145c3d}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f2f6f3;padding:16px}section{margin:30px 0}li{margin:8px 0}button,a.game{min-height:44px;display:block;padding:12px;border:1px solid #123f2d;margin:10px 0}@media print{body{max-width:none}h2{break-before:page}pre{font-size:12px}}';
await write(path.join(dir,'TEACHER_GUIDE.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Science 24 teacher guide</title><style>'+style+'</style><body>'+guide.join('\n')+'</body></html>');
const launcher='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Science 24 game review</title><style>'+style+'</style><body><h1>Science 24: eight-game review</h1><p>'+esc(candidate.id)+'</p><p>Standalone supplemental practice. Teacher decisions pending. Work clears when you reload or close a game.</p><p><strong>Open acceptance gate:</strong> The premium visual candidate currently fails the supplied 99.25% pixel agreement / 4 px geometry requirement. This unsigned audit candidate is not a completed release.</p>'+suite.games.map(g=>'<a class="game" href="games/'+g.id+'/PLAY.html">'+esc(g.id+' · '+g.title)+'</a>').join('')+'<h2>Visual review</h2><ul><li><a href="VISUAL_REVIEW.html">Reference images, actual screens and component boards</a></li><li><a href="audit-records/premium-visual-v1/ASSET_MANIFEST.json">Exact premium asset manifest</a></li><li><a href="audit-records/premium-visual-v1/GENERATION_PROMPTS.json">Image generation prompts and tool mode</a></li><li><a href="audit-records/premium-visual-v1/PRODUCTION_HANDOFF.md">Premium visual production contract</a></li></ul><h2>Teacher audit</h2><p>Read the validation status and visual differences before approval. A complete playable flow is separate from visual acceptance and human curriculum judgment.</p><ul><li><a href="TEACHER_GUIDE.html">All 48 scenario solutions and reasoning rubrics</a></li><li><a href="TEACHER_REVIEW.pdf">Fillable teacher review PDF</a></li><li><a href="TEACHER_REVIEW_TEXT.txt">Accessible text review form</a></li><li><a href="CURRICULUM_TASK_MAP.md">Task and curriculum coverage map</a></li><li><a href="VALIDATION_STATUS.json">Validation status and open gates</a></li><li><a href="CORRECTIONS.md">Science and accessibility corrections</a></li><li><a href="candidate.json">Candidate identity and source hashes</a></li></ul></body></html>';
await write(path.join(dir,'START_REVIEW.html'),launcher);
for(const g of suite.games.slice(1)){await fs.mkdir(path.join(dir,'references',g.id),{recursive:true});await fs.cp(path.join(root,g.reference,'04_MOCKUPS'),path.join(dir,'references',g.id,'04_MOCKUPS'),{recursive:true});await fs.cp(path.join(root,g.reference,'03_ASSETS'),path.join(dir,'references',g.id,'03_ASSETS'),{recursive:true});}
for(const name of ['test-science24-games.mjs','package-science24-games-review.mjs','lib/science24-games/browser_qa.py','lib/science24-games/build_review_pdf.py','lib/science24-games/visual_qa.py','lib/science24-games/a1_browser.py','lib/science24-games/restore_review.py','lib/science24-games/correct_references.py','lib/science24-games/premium_qa.py','lib/science24-games/preview_server.py','lib/science24-games/review_visual_assets.mjs'])await fs.cp(path.join(root,'scripts',name),path.join(dir,'tooling',name),{recursive:true,force:true}).catch(async()=>{await fs.mkdir(path.dirname(path.join(dir,'tooling',name)),{recursive:true});await fs.copyFile(path.join(root,'scripts',name),path.join(dir,'tooling',name));});
for(const name of ['suite.json','a1-frozen-files.json','independent-fixtures.json','CORRECTIONS.md','CURRICULUM_TASK_MAP.md'])await write(path.join(dir,'audit-records',name),await fs.readFile(path.join(meta,name)));
await write(path.join(dir,'audit-records/A1_teacher_guide.txt'),a1);
await fs.cp(path.join(meta,'premium-visual-v1'),path.join(dir,'audit-records/premium-visual-v1'),{recursive:true});
await buildVisualReview({root,meta,dir,suite,candidate});
for(const g of suite.games){const approvalPath=path.join(meta,'approval-records',candidate.id,g.id+'.json');await fs.mkdir(path.dirname(approvalPath),{recursive:true});try{await fs.writeFile(approvalPath,await fs.readFile(path.join(dir,'approvals',g.id+'.json')),{flag:'wx'});}catch(error){if(error.code!=='EEXIST')throw error;}await fs.copyFile(approvalPath,path.join(dir,'approvals',g.id+'.json'));}
await write(path.join(dir,'REPRODUCE.txt'),`REPRODUCE THIS CANDIDATE\n\nUse Node 22+ and Python 3.10+. Offline PLAY.html needs only a browser; these dependencies are for developers running the source checks.\n\n1. Run python3 tooling/lib/science24-games/restore_review.py /absolute/path/to/NEW-empty-science24-review\n2. In that new directory: npm install\n3. In your Python environment: python3 -m pip install playwright pillow numpy reportlab pypdf\n4. python3 -m playwright install chromium\n5. Set S24_PYTHON to your environment's Python executable if needed. Set CHROMIUM only if using a separately installed Chromium executable. Otherwise Playwright's installed Chromium is used.\n6. npm run test:science24-games -- --game A2\n7. npm run test:science24-games\n8. npm run package:science24-games-review\n\nThe test command returns nonzero when the strict visual gate fails, even if science/state/browser flows pass. Reports retain that distinction. Packaging permits an unsigned teacher-review candidate with documented blocked visual acceptance; it does not approve or release it.\n\nRestore refuses a nonempty destination. It recreates the supplied candidate's canonical paths without changing your existing course checkout. Candidate and file hashes establish source parity. Generated PDF timestamps and ZIP metadata may differ on a later run; game source identity and deterministic PLAY.html bytes are the parity boundaries.\n`);
await fs.cp(path.join(meta,'CURRICULUM_TASK_MAP.md'),path.join(dir,'CURRICULUM_TASK_MAP.md'));
if(process.argv.includes('--build-only')){console.log('Built offline candidate: '+dir);process.exit(0);}
const canonical=await read(path.join(meta,'validation/browser/suite-results.json'));
if(canonical.failures.length)throw Error('Canonical browser failures remain; package not sealed.');
for(const [rel,h] of Object.entries(snapshot))if(canonical.sourceFiles?.[rel]!==h)throw Error('Canonical evidence invalidated by source change: '+rel);
const science=await read(path.join(meta,'validation/suite-science-state.json'));
if(!reuse){const run=spawnSync(python,[path.join(root,'scripts/lib/science24-games/browser_qa.py'),'--package',dir],{stdio:'inherit'});if(run.status!==0)throw Error('Offline browser check failed; package not sealed.');}
const offline=await read(path.join(meta,'validation/offline/suite-results.json'));
if(offline.failures.length)throw Error('Offline browser failures remain.');
if(reuse){for(const g of suite.games)if(previousPLAY[g.id]!==sha(await fs.readFile(path.join(dir,'games',g.id,'PLAY.html'))))throw Error('Offline evidence cannot be reused: PLAY changed '+g.id);for(const [rel,h]of Object.entries(snapshot))if(offline.sourceFiles[rel]!==h)throw Error('Offline source drift: '+rel);offline.byteIdenticalRebuild={verified:true,playFiles:previousPLAY};}
for(const g of suite.games)for(const f of await files(path.join(root,g.canonical))){const rel=path.relative(root,f).split(path.sep).join('/'),copy=path.join(dir,'sources',g.id,path.relative(path.join(root,g.canonical),f));if(sha(await fs.readFile(f))!==snapshot[rel]||sha(await fs.readFile(copy))!==snapshot[rel])throw Error('Source/package parity failed: '+rel);}
const visuals=await read(path.join(meta,'validation/browser/suite-visual-comparison.json'));
const status={candidate:candidate.id,scienceAndState:{status:'passed',assertions:science.checks},canonicalBrowser:canonical,offlineBrowser:offline,visualExactness:{status:visuals.passed?'passed':'blocked',requiredAgreementPercent:99.25,geometryTolerancePx:4,comparison:'Same Chromium; no masked pixels; full reports in validation/browser',failedStates:visuals.results.filter(x=>!x.passed).map(({game,stage,width,pixelAgreementPercent,geometry})=>({game,stage,width,pixelAgreementPercent,geometry}))},teacherDecisions:'All eight pending',release:'Not approved; standalone teacher review only',manualChecks:canonical.manualChecks};
await write(path.join(dir,'VALIDATION_STATUS.json'),JSON.stringify(status,null,2)+'\n');
await fs.cp(path.join(meta,'validation'),path.join(dir,'validation'),{recursive:true});
await fs.cp(path.join(meta,'comparison-references'),path.join(dir,'corrected-comparison-references'),{recursive:true});
await fs.cp(path.join(root,'projects/science24-unit-a/meta/reaction-detective-review-2026-10-07/independent-validation.json'),path.join(dir,'validation/A1-matching-prior-evidence.json'));
const pdf=spawnSync(python,[path.join(root,'scripts/lib/science24-games/build_review_pdf.py'),dir],{stdio:'inherit'});if(pdf.status!==0)throw Error('PDF verification failed');
const hashes={};for(const f of await files(dir))if(path.basename(f)!=='SHA256SUMS.txt')hashes[path.relative(dir,f).split(path.sep).join('/')]=sha(await fs.readFile(f));
await write(path.join(dir,'SHA256SUMS.txt'),Object.entries(hashes).map(([p,h])=>h+'  '+p).join('\n')+'\n');
const zip=path.join(path.dirname(dir),path.basename(dir)+'.zip');
const packed=spawnSync(python,['-c',`import pathlib,zipfile; root=pathlib.Path(${JSON.stringify(dir)}); z=zipfile.ZipFile(${JSON.stringify(zip)},'w',zipfile.ZIP_DEFLATED); [z.write(p,p.relative_to(root).as_posix()) for p in sorted(root.rglob('*')) if p.is_file() and '__pycache__' not in p.parts]; z.close(); z=zipfile.ZipFile(${JSON.stringify(zip)}); assert z.testzip() is None; print('ZIP integrity passed:',len(z.namelist()),'files')`],{stdio:'inherit'});if(packed.status!==0)throw Error('ZIP creation failed');
const receipt={candidate:candidate.id,zip,zipSHA256:sha(await fs.readFile(zip)),fileCount:Object.keys(hashes).length+1,sourceParity:'Canonical byte snapshots; A1 rebuilt PLAY matches previous validated SHA256; all offline game flows checked',visualGate:status.visualExactness.status,teacherApproval:'pending',packagedAt:new Date().toISOString()};
await write(path.join(meta,'package-receipt.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));
