import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';
const slugs=['marketing-10-20-online','marketing-30-online','legal-studies-30-online','tourism-10-20-online','tourism-30-online'];
const counts=[9,7,7,12,7];
for(const [index,slug] of slugs.entries()){
 test(slug+' state, draft, backup, and calculation contracts',()=>{
  const base=`projects/${slug}/workspace/`, html=load(readFileSync(base+'index.html','utf8'));
  const config=JSON.parse(html('#course-config').text());
  const mod={exports:{} as any};new Function('module',readFileSync(base+'course.js','utf8'))(mod);const api=mod.exports;
  assert.equal(config.ids.length,counts[index]);assert.equal(new Set(config.ids).size,counts[index]);
  const s=api.createState(config),id=config.ids[0];assert.equal(api.ready(s,config,id),false);
  assert.throws(()=>api.savePortfolio(s,config,id));
  s.drafts[id]={plan:'A justified plan',work:'Original work',evidence:'source.txt',reflection:'Revised after checking'};
  api.savePortfolio(s,config,id);assert.deepEqual(s.portfolioIds,[id]);api.savePortfolio(s,config,id);assert.deepEqual(s.portfolioIds,[id]);
  s.drafts[id].work='';assert.equal(api.ready(s,config,id),false);assert.deepEqual(s.portfolioIds,[id]);
  const good=api.serialize(s,config);assert.deepEqual(api.validateState(good,config),s);
  for(const mutate of [(v:any)=>v.projectSlug='other',(v:any)=>v.schemaVersion=2,(v:any)=>v.portfolioIds=[id,id],(v:any)=>v.portfolioIds=['UNKNOWN'],(v:any)=>v.drafts[id].plan='x'.repeat(601),(v:any)=>v.practice[id]={decision:4},(v:any)=>v.extra=true,(v:any)=>v.lastRoute='javascript:bad']){
   const invalid=JSON.parse(good);mutate(invalid);assert.throws(()=>api.validateState(JSON.stringify(invalid),config));assert.equal(api.serialize(s,config),good);
  }
  for(const raw of ['{bad','null','[]','x'.repeat(48001)])assert.throws(()=>api.validateState(raw,config));
  const worst=api.createState(config);for(const key of config.ids){worst.drafts[key]={};for(const f of config.projects.includes(key)?api.PROJECT_FIELDS:api.FIELDS)worst.drafts[key][f]='\\'.repeat(api.TEXT_LIMIT);worst.practice[key]={decision:2,transfer:2};}
  worst.reviewed=[...config.ids];worst.portfolioIds=[...config.ids];worst.lastRoute=config.routes.at(-1);
  // JSON escaping is part of the size budget, not only nominal field lengths.
  const size=JSON.stringify(worst).length;
  assert.equal(api.serialize(worst,config),JSON.stringify(worst));
  for(const bad of ['\u0001','\ud800']){const candidate=JSON.parse(good);candidate.drafts[id].plan=bad;assert.throws(()=>api.validateState(JSON.stringify(candidate),config));}
  assert.throws(()=>api.calculate('multiply',1e308,2));assert.throws(()=>api.calculate('unknown',1,2));
  assert.ok(size<=48000,`${slug} worst-case escaped state is ${size} characters`);
  assert.equal(api.calculate('percentage',10,40),25);assert.equal(api.calculate('margin',12,20),40);assert.equal(api.calculate('multiply',24,12),288);
  assert.throws(()=>api.calculate('percentage',1,0));assert.throws(()=>api.calculate('margin',20,12));assert.throws(()=>api.calculate('multiply',Infinity,2));
 });
 test(slug+' complete canonical content and release boundary',()=>{
  const base=`projects/${slug}/`, $=load(readFileSync(base+'workspace/index.html','utf8')),c=JSON.parse($('#course-config').text());
  for(const route of c.routes){assert.equal($(`[data-route-panel][id="${route}"]`).length,1);assert.ok($(`#${route} h1`).text());}
  for(const id of c.ids){assert.equal($(`[data-draft="${id}"]`).length,1);assert.equal($(`[data-module="${id}"][data-question]`).length,2);assert.equal($(`[data-save-portfolio="${id}"]`).length,1);assert.equal($(`[id^="lesson-${id}-"]`).length,3);assert.ok($(`[data-canvas-helper-edit-key="${id}-worked-example"]`).text().length>200);}
  assert.equal($('[data-brightspace-submit]').length,0);assert.equal($('script[src^="http"]').length,0);
  const editKeys=$('[data-canvas-helper-edit-key]').map((_,n)=>$(n).attr('data-canvas-helper-edit-key')).get();assert.equal(new Set(editKeys).size,editKeys.length,'Durable edit keys must be unique in canonical HTML');
  assert.doesNotMatch($('body').text(),/Replace this paragraph|50-hour|50\/50|Brightspace link not configured/);
  const m=JSON.parse(readFileSync(base+'meta/project.json','utf8'));assert.equal(m.authoringStatus,'blocked');assert.equal(m.authoring.studioEditing.enabled,false);assert.ok(m.exportTargets.every((t:any)=>!t.enabled));
 });
}
test('CTS original references remain content-addressed and outside learner workspaces',()=>{
 const root='projects/resources/cts-online/',inv=JSON.parse(readFileSync(root+'source-inventory.json','utf8'));
 for(const r of inv.originals){assert.equal(r.learnerExport,false);assert.ok(existsSync(root+r.path));assert.equal(createHash('sha256').update(readFileSync(root+r.path)).digest('hex'),r.sha256);}
 assert.equal(inv.originals.filter((r:any)=>r.origin.includes('/Downloads/')).length,7);
});
