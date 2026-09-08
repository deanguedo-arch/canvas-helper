import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {estimateWorstCaseState} from '../lib/biology30-unit-a-pilot-2/build-full.js';
import {emptyTopicState,encodeTopicState,decodeTopicState} from '../lib/biology30-course/v1/pilot2-state.js';

test('current candidate state budgets retain the 44000-character target',async()=>{
  const results:any[]=[];
  for(const u of ['a','b','c','d']){
    const slug=u==='a'?'biology30-unit-a-pilot-2':`biology30-unit-${u}`;
    const html=await readFile(`projects/${slug}/workspace/index.html`,'utf8');
    const base={unit:u,workspaceSha256:createHash('sha256').update(html).digest('hex'),target:44000};
    if(u==='a'){
      const vocab=JSON.parse(await readFile(`projects/${slug}/meta/core-vocabulary.json`,'utf8'));
      const estimate=estimateWorstCaseState(html,vocab.fixedMilestones.map((x:any)=>x.entryId));
      assert.ok(estimate.characters<=44000);results.push({...base,...estimate,method:'owning full-state estimator; ordinary-character fixture'});continue;
    }
    const schema=JSON.parse(await readFile(`projects/resources/biology30-production/v1/units/unit-${u}/pilot2-state-schema.json`,'utf8'));
    const pick=schema.families.selectable,maxima:Record<string,number>={};let cases=0;
    for(const char of ['x','漢','🧬'])for(let a=0;a<pick.length;a++)for(let b=a+1;b<pick.length;b++){
      const s=emptyTopicState(schema);s.frayerChoices=[pick[a],pick[b]];s.updatedAt='2026-09-08T00:00:00.000Z';
      s.route=[...schema.routes].sort((a,b)=>b.length-a.length)[0];s.vocabularyActiveId=Object.keys(schema.families.responseIds).sort((a,b)=>b.length-a.length)[0];
      const inactive=new Set(Object.entries(schema.families.responseIds).filter(([id])=>!schema.families.fixed.includes(id)&&!s.frayerChoices.includes(id)).flatMap(([,ids]:any)=>ids));
      for(const[id,f]of Object.entries(schema.responses)as any)if(!inactive.has(id))s.responses[id]=char.repeat(Math.floor(f.limit/char.length));
      for(const[id,c]of Object.entries(schema.choices)as any)s.choices[id]=c.values.at(-1);s.flags=Object.keys(schema.flags);s.visited=[...schema.routes];
      const raw=encodeTopicState(s,schema);assert.ok(raw.length<=44000,`${u}: ${raw.length}`);assert.deepEqual(decodeTopicState(raw,schema).responses,s.responses);
      maxima[char]=Math.max(maxima[char]??0,raw.length);cases++;
    }
    results.push({...base,maxima,cases,method:'all optional-family pairs; maximum responses, choices, flags, visits and longest route; ordinary and Unicode round trips'});
  }
  await writeFile('projects/resources/biology30-production/v1/pilot2/verification/2026-09-08-inline-vocabulary/final-state-budgets.json',JSON.stringify(results,null,2)+'\n');
});
