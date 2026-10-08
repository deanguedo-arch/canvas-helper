import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { load } from 'cheerio';

// Bounded comparison only: never write canonical workspace or historical owner.
const repo = process.cwd();
const project = path.join(repo, 'projects/biology30-chapter-14');
const through = Number(process.argv.find(a=>a.startsWith('--through='))?.split('=')[1] ?? 2);
assert([2,4,6,8,10].includes(through),'Supported reviewed boundary: 2, 4, 6, 8 or 10');
const firstRoot = path.join(project, 'meta/teaching-overhaul/2026-10-08-teacher-led/first-pair-v0.1.0');
const roots = Object.fromEntries([[2,'first-pair'],[4,'first-four'],[6,'first-six'],[8,'first-eight'],[10,'first-ten']].map(([n,name])=>[n,path.join(project,`meta/teaching-overhaul/2026-10-08-teacher-led/${name}-v0.1.0`)]));
const root = roots[through];
const intakes = [path.join(firstRoot,'intake/Biology30_CH14_Lessons01-02_Conditional_Content_v0.1.0')];
if(through>=4)intakes.push(path.join(roots[4],'intake/Biology30_CH14_Lessons03-04_Conditional_Content_v0.1.0'));
if(through>=6)intakes.push(path.join(roots[6],'intake/Biology30_CH14_Lessons05-06_Conditional_Content_v0.1.0'));
if(through>=8)intakes.push(path.join(roots[8],'intake/Biology30_CH14_Lessons07-08_Conditional_Content_v0.1.0'));
if(through>=10)intakes.push(path.join(roots[10],'intake/Biology30_CH14_Lessons09-10_Conditional_Content_v0.1.0'));
const numbers = Array.from({length:through},(_,i)=>i+1);
const routesInScope = numbers.map(n=>`lesson-${String(n).padStart(2,'0')}`);
const sourceOwner = path.join(project, 'meta/external-generation');
const owner = path.join(root, 'owner');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const read = p => fs.readFileSync(p, 'utf8');
const write = (p, b) => { fs.mkdirSync(path.dirname(p), {recursive:true}); fs.writeFileSync(p,b,{flag:'wx'}); };
const json = (p,v) => write(p,JSON.stringify(v,null,2)+'\n');
const raw = (s,e) => s.slice(e.sourceCodeLocation.startOffset,e.sourceCodeLocation.endOffset);
// Exactly two inert teaching placements; no changes to original figure bytes or controls.
const figurePlacements = through>=10 ? {
  'ch14-l09-teaching-01': {asset:'assets/figures/cycle-coordination.svg',sha256:'67822d2123a1b97d4d5af600f2980d996cc630ee1f6a39879c5c95af875f6b8f',html:'<figure class="science-figure"><img alt="Paired ovarian and uterine stages showing simultaneous events and hormonal links." decoding="async" loading="lazy" src="./assets/figures/cycle-coordination.svg"><figcaption>Baseline cycle without pregnancy, reused unchanged from lesson07. Compare the normal regression step with the altered hormone cases in this lesson.</figcaption></figure>'},
  'ch14-l10-teaching-02': {asset:'assets/figures/female-anatomy.png',sha256:'aeddd3a1c334fc4fa16e213a0ea8967c25e541afd991a2fb04ec20bc8f7f03f2',html:'<figure class="science-figure"><img alt="Side view of female reproductive anatomy showing the ovary and oviduct near the uterus, cervix and vagina." decoding="async" loading="lazy" src="./assets/figures/female-anatomy.png"><figcaption>Normal anatomy, reused unchanged from lesson05 and textbook p482. Locate the oviduct; infection and scarring are not drawn here.</figcaption></figure>'}
} : {};
const copy = (a,b) => {
  assert(!fs.existsSync(b),`Preserve existing ${b}`);
  if(fs.statSync(a).isDirectory()) {
    fs.mkdirSync(b,{recursive:true});
    for(const name of fs.readdirSync(a))copy(path.join(a,name),path.join(b,name));
  } else { fs.mkdirSync(path.dirname(b),{recursive:true}); fs.copyFileSync(a,b,fs.constants.COPYFILE_EXCL); }
};
const tree = dir => {
  const result=[];
  function walk(d,p='') { for(const name of fs.readdirSync(d).sort()) {
    const f=path.join(d,name), r=path.posix.join(p,name);
    assert(!fs.lstatSync(f).isSymbolicLink(),`Mutable link ${f}`);
    if(fs.statSync(f).isDirectory())walk(f,r);else result.push({path:r,sha256:sha(fs.readFileSync(f))});
  }} walk(dir);return result;
};
const expected = {
  'scripts/content.py':'15f3e496a739a40f7de85ccfa8a8dcaadfb0a4ebb4274f4c36c272244d542a2e',
  'scripts/build_chapter.py':'f389fa6ace53dd19e2e3f4c7d336d32f7391656e0d66799404a90695883d06e0',
  'authoring/course-config.json':'d3467ba67cc5b2bbbf8cc26fb3b8e0a8f8754102ebe545fd607ef2180149c74d'
};
function checkCurrent() {
  for(const [p,h]of Object.entries(expected))assert.equal(sha(fs.readFileSync(path.join(sourceOwner,p))),h,p);
  assert.equal(sha(fs.readFileSync(path.join(project,'workspace/index.html'))),'054b823d5758a702041f24fd06b15a77d69cdfff63323cd5ffd7e803bf8936b8');
  assert.equal(sha(fs.readFileSync(path.join(project,'workspace/main.js'))),'295522cb7ae3dbc4bd845b8916b41605c6c771dc9b11d041e01af7565b173d0b');
}
function payloads(intake) {
  const lines=read(path.join(intake,'SHA256SUMS.txt')).trim().split(/\r?\n/);
  for(const line of lines) {
    const m=/^([a-f0-9]{64})\s+\*?(.+)$/.exec(line);assert(m,line);
    assert(!m[2].startsWith('/')&&!m[2].split('/').includes('..'));
    assert.equal(sha(fs.readFileSync(path.join(intake,m[2]))),m[1],m[2]);
  } return lines.length;
}
checkCurrent();const verifiedPayloads=intakes.reduce((n,intake)=>n+payloads(intake),0);
if(process.argv.includes('--prepare')) {
  assert(!fs.existsSync(owner),'Preserve existing candidate owner');
  fs.mkdirSync(owner);
  for(const name of fs.readdirSync(sourceOwner))if(!['workspace','portable'].includes(name))copy(path.join(sourceOwner,name),path.join(owner,name));
  // Native runtime is copied from current editable workspace, NOT patch_runtime.py.
  copy(path.join(project,'workspace'),path.join(root,'evaluation/old'));
  copy(path.join(project,'workspace'),path.join(owner,'workspace'));
  const combined={};
  for(const intake of intakes) {
    const incoming=JSON.parse(read(path.join(intake,'teaching-copy.json')));
    for(const route of Object.keys(incoming))assert(!(route in combined),'Overlapping manuscripts');
    Object.assign(combined,incoming);
    for(const name of fs.readdirSync(path.join(intake,'candidate')))copy(path.join(intake,'candidate',name),path.join(owner,'authoring/reviewed-fragments',name));
  }
  assert.deepEqual(Object.keys(combined).sort(),routesInScope);
  json(path.join(owner,'authoring/reviewed-teaching-copy.json'),combined);
  copy('/Users/deanguedo/Downloads/Course_Production_Standards.txt',path.join(root,'standards/Course_Production_Standards_v0.4.txt'));
  const base=read(path.join(project,'workspace/index.html')),$=load(base,{sourceCodeLocationInfo:true});
  const historical=read(path.join(intakes[0],'frozen/workspace/index.html')),h=load(historical,{sourceCodeLocationInfo:true});
  const routes=$('.course-page[id]').toArray().map(e=>({route:e.attribs.id,currentSha256:sha(raw(base,e)),historicalSha256:sha(raw(historical,h('#'+e.attribs.id)[0]))}));
  for(const route of routesInScope)assert.equal(routes.find(r=>r.route===route).currentSha256,routes.find(r=>r.route===route).historicalSha256);
  for(const intake of intakes) {
    const localHistorical=read(path.join(intake,'frozen/workspace/index.html')),lh=load(localHistorical,{sourceCodeLocationInfo:true});
    for(const route of Object.keys(JSON.parse(read(path.join(intake,'teaching-copy.json')))))assert.equal(raw(base,$('#'+route)[0]),raw(localHistorical,lh('#'+route)[0]),`Actual route drift ${route}`);
  }
  json(path.join(root,'RECONCILIATION.json'),{verifiedPayloads,currentOwner:expected,currentHTML:sha(base),currentRuntime:sha(fs.readFileSync(path.join(project,'workspace/main.js'))),routes,
    retainedRepairs:['overview-current template','lesson04 approved PNG pointer','legend normalization','760px navigation breakpoint','synchronous textbook save callback'],
    manuscriptConsumedStandards:intakes.map((intake,i)=>({intake:path.basename(intake),standard:i<2?'v0.3 native-read with local byte corroboration; original signed-standard-byte download unavailable at authoring':'v0.4 exact source bytes verified at authoring'})),
    integrationReconciliationStandard:'v0.4',integrationStandardSha256:sha(fs.readFileSync(path.join(root,'standards/Course_Production_Standards_v0.4.txt'))),
    protectedDecisionsApplied:false,canonicalChanged:false,assets:tree(path.join(root,'evaluation/old'))});
  console.log(JSON.stringify({prepared:owner,verifiedPayloads,sourceRoutesMatch:true}));
} else if(process.argv.includes('--build')) {
  assert(fs.existsSync(owner));assert(!fs.existsSync(path.join(root,'evaluation/new')),'Do not overwrite candidate');
  const python='/Users/deanguedo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
  const lessons=JSON.parse(execFileSync(python,['-c','import json,sys;sys.path.insert(0,sys.argv[1]);from content import LESSONS;print(json.dumps(LESSONS,ensure_ascii=False))',path.join(owner,'scripts')],{encoding:'utf8',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}}));
  const teaching=JSON.parse(read(path.join(owner,'authoring/reviewed-teaching-copy.json')));
  const base=read(path.join(root,'evaluation/old/index.html')),$=load(base,{sourceCodeLocationInfo:true});
  const config=JSON.parse($('#course-data').text()), originalConfig=structuredClone(config), edits=[], replacements=[];
  for(const n of numbers) {
    const padded=String(n).padStart(2,'0'), route=`lesson-${padded}`, j=teaching[route], l=lessons[n-1];
    assert.deepEqual(l.sections,j.sections.map(s=>[s.title,s.paragraphs]));
    assert.deepEqual(l.worked,[j.worked.title,j.worked.scenario,j.worked.steps]);
    assert.deepEqual(l.readingApplication,j.optional);
    const text=read(path.join(owner,'authoring/reviewed-fragments',`${route}.teaching-fragments.html`));
    const q=load(text,{sourceCodeLocationInfo:true},false);
    const targets=q('div[id]').toArray().filter(e=>new RegExp(`^ch14-l${padded}-(teaching-\\d\\d|worked)$`).test(e.attribs.id));assert.equal(targets.length,5);
    for(const node of targets) {
      const id=node.attribs.id, old=$('#'+id);assert.equal(old.length,1);
      let replacement=raw(text,node);
      const priorFigures=old.find('figure').toArray(), reviewedFigures=q('#'+id).find('figure').toArray();
      const placement=figurePlacements[id];
      assert.equal(reviewedFigures.length,priorFigures.length+(placement?1:0),`${id} figure inventory`);
      if(placement) {
        assert.equal(priorFigures.length,0,`${id} additions must not obscure an original figure`);
        assert.equal(raw(text,reviewedFigures[0]),placement.html,`${id} undeclared figure markup`);
        assert.equal(sha(fs.readFileSync(path.join(root,'evaluation/old',placement.asset))),placement.sha256,`${id} image drift`);
      }
      for(let f=0;f<priorFigures.length;f++) {
        assert.equal(q.html(reviewedFigures[f]),$.html(priorFigures[f]),`${id} figure DOM changed`);
        // Package serializer drops XHTML void-element slash; retain actual owner bytes.
        replacement=replacement.replace(raw(text,reviewedFigures[f]),raw(base,priorFigures[f]));
      }
      assert.equal(q('#'+id).find('input,textarea,select,form,script').length,0);
      const beforeTerms=new Set(old.find('[data-term-id]').toArray().map(e=>e.attribs['data-term-id']));
      const afterTerms=new Set(q('#'+id).find('[data-term-id]').toArray().map(e=>e.attribs['data-term-id']));
      // Vocabulary may move within the lesson, but no existing connection is lost.
      replacements.push({id,beforeSha256:sha(raw(base,old[0])),afterSha256:sha(replacement),beforeTerms:[...beforeTerms],afterTerms:[...afterTerms]});
      edits.push({start:old[0].sourceCodeLocation.startOffset,end:old[0].sourceCodeLocation.endOffset,text:replacement});
    }
    config.guidedActivities.find(g=>g.route===route).worked={...config.guidedActivities.find(g=>g.route===route).worked,...j.worked};
  }
  const data=$('#course-data')[0];const ds=data.sourceCodeLocation.startTag.endOffset,de=data.sourceCodeLocation.endTag.startOffset;
  edits.push({start:ds,end:de,text:JSON.stringify(config).replace(/<\//g,'<\\/')});
  let output=base;for(const edit of edits.sort((a,b)=>b.start-a.start))output=output.slice(0,edit.start)+edit.text+output.slice(edit.end);
  const out=load(output,{sourceCodeLocationInfo:true});
  const masked=structuredClone(config);for(const n of numbers)masked.guidedActivities[n-1].worked=originalConfig.guidedActivities[n-1].worked;
  assert.deepEqual(masked,originalConfig,'Non-worked configuration changed');
  for(const route of routesInScope) {
    for(const selector of ['[data-check-question]','[data-writing-question]','[data-guided-item]','figure','[data-note-input]'])
      assert.deepEqual(out('#'+route).find(selector).toArray().filter(e=>selector!=='figure'||!figurePlacements[e.parent.attribs?.id]).map(e=>raw(output,e)),$('#'+route).find(selector).toArray().map(e=>raw(base,e)),`${route} protected ${selector}`);
    const oldTerms=new Set($('#'+route).find('[data-term-id]').toArray().map(e=>e.attribs['data-term-id']));
    const newTerms=new Set(out('#'+route).find('[data-term-id]').toArray().map(e=>e.attribs['data-term-id']));
    for(const term of oldTerms)assert(newTerms.has(term),`Lost vocabulary ${term}`);
  }
  for(const [id,placement] of Object.entries(figurePlacements))assert.equal(raw(output,out('#'+id).find('figure')[0]),placement.html,`${id} final placement`);
  for(const e of $('.course-page[id]').toArray())if(!routesInScope.includes(e.attribs.id))assert.equal(raw(output,out('#'+e.attribs.id)[0]),raw(base,e),`Unrelated route ${e.attribs.id}`);
  if(through>2) {
    const previous=read(path.join(roots[through-2],'evaluation/new/index.html')),previousDOM=load(previous,{sourceCodeLocationInfo:true});
    for(const route of routesInScope.slice(0,through-2))assert.equal(raw(output,out('#'+route)[0]),raw(previous,previousDOM('#'+route)[0]),`Previous candidate changed ${route}`);
  }
  const ids=out('[id]').toArray().map(e=>e.attribs.id);assert.equal(new Set(ids).size,ids.length,'Duplicate IDs');
  assert.deepEqual(ids,$('[id]').toArray().map(e=>e.attribs.id),'Original ID sequence changed');
  const normalizeText=s=>load(`<p>${s}</p>`).text().replace(/\s+/g,' ').trim();
  let manuscriptStrings=0;
  for(const [route,j]of Object.entries(teaching)) {
    const rendered=normalizeText(out('#'+route).text());
    for(const s of [...j.sections.flatMap(section=>[section.title,...section.paragraphs]),j.worked.title,j.worked.scenario,...j.worked.steps,j.optional.question,j.optional.answer]) {
      assert(rendered.includes(normalizeText(s)),`Missing manuscript ${route}: ${s}`);manuscriptStrings++;
    }
    for(const attr of ['data-canvas-helper-edit-key','data-canvas-edit-key']) {
      const newKeys=new Set(out('#'+route).find(`[${attr}]`).toArray().map(e=>e.attribs[attr]));
      for(const e of $('#'+route).find(`[${attr}]`).toArray())assert(newKeys.has(e.attribs[attr]),`Lost edit key ${e.attribs[attr]}`);
    }
  }
  let reverted=output;
  const reverseEdits=replacements.map(r=>{const e=out('#'+r.id)[0];return {start:e.sourceCodeLocation.startOffset,end:e.sourceCodeLocation.endOffset,text:raw(base,$('#'+r.id)[0])};});
  const outputData=out('#course-data')[0];reverseEdits.push({start:outputData.sourceCodeLocation.startOffset,end:outputData.sourceCodeLocation.endOffset,text:raw(base,data)});
  for(const e of reverseEdits.sort((a,b)=>b.start-a.start))reverted=reverted.slice(0,e.start)+e.text+reverted.slice(e.end);
  assert.equal(reverted,base,'Replacement reversal did not recover exact original');
  // Owner output must exist only in isolated copy; copying frozen assets never makes symlinks.
  fs.writeFileSync(path.join(owner,'workspace/index.html'),output);
  fs.writeFileSync(path.join(owner,'authoring/course-config.json'),JSON.stringify(config,null,2)+'\n');
  copy(path.join(owner,'workspace'),path.join(root,'evaluation/new'));
  const oldTree=tree(path.join(root,'evaluation/old')),newTree=tree(path.join(root,'evaluation/new'));
  for(const f of oldTree)if(f.path!=='index.html')assert.equal(newTree.find(n=>n.path===f.path)?.sha256,f.sha256,`Asset ${f.path}`);
  json(path.join(root,'BUILD_RECEIPT.json'),{replacements,addedFigurePlacements:figurePlacements,changedConfigurationPaths:numbers.map(n=>`guidedActivities[${n-1}].worked`),candidateHTML:sha(output),canonicalHTML:sha(fs.readFileSync(path.join(project,'workspace/index.html'))),frozenFiles:newTree.length,allAssetsByteExact:true,assessmentContractsByteExact:true,manuscriptStrings,reversalByteExact:true,originalIDSequenceExact:true,canonicalChanged:false,teacherAccepted:false,firstPairApprovalRetained:through>2,previousCandidateRoutesRetained:routesInScope.slice(0,Math.max(0,through-2)),releaseStatus:'Needs decision',limitations:['Protected paired-duct/timing ambiguity unchanged','Clinical optional-bank ambiguity and typo unchanged','Protected lesson04 numeric-stimulus target ambiguity unchanged','Native runtime checks pending for new scope','Source/learner review evidence is supplied bounded review, not a new blind review']});
  console.log(JSON.stringify({candidateHTML:sha(output),blocks:replacements.length,frozenFiles:newTree.length,canonicalChanged:false}));
} else throw Error('Use --prepare or --build');
