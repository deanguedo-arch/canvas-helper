import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {prepareTopicWordProfile} from '../lib/biology30-course/v1/pilot2-word-profile.js';
import {emptyTopicState,migrateTopicWordFrayers,encodeTopicState,decodeTopicState,type TopicStateSchema} from '../lib/biology30-course/v1/pilot2-state.js';
for(const unit of ['b','c','d'])test(`${unit}: eight-word maximum and preserved legacy state fit unchanged target`,async()=>{
 const base=`projects/resources/biology30-production/v1/units/unit-${unit}/`,json=async(file:string)=>JSON.parse(await readFile(base+file,'utf8'));
 const schema:TopicStateSchema=await json('pilot2-state-schema.json');prepareTopicWordProfile(await json('word-details.json'),await json('pilot2-vocabulary.json'),schema);
 let maximum=0;
 for(const character of ['x','漢','🧬'])for(let i=0;i<schema.families.selectable.length;i++)for(let j=i+1;j<schema.families.selectable.length;j++){
  const state=emptyTopicState(schema);state.frayerChoices=[schema.families.selectable[i],schema.families.selectable[j]];state.updatedAt='2026-09-09T12:00:00.000Z';
  const active=[...schema.families.fixed,...state.frayerChoices],inactive=new Set(Object.entries(schema.families.responseIds).filter(([id])=>!active.includes(id)).flatMap(([,ids])=>ids));
  for(const [id,f]of Object.entries(schema.responses))if(!inactive.has(id))state.responses[id]=character.repeat(Math.floor(f.limit/character.length));
  for(const[id,c]of Object.entries(schema.choices))state.choices[id]=c.values.at(-1)!;
  state.flags=Object.keys(schema.flags);state.visited=[...schema.routes];state.vocabularyActiveId=Object.keys(schema.families.responseIds).sort((a,b)=>b.length-a.length)[0];
  const migrated=migrateTopicWordFrayers(state,schema),legacy=encodeTopicState(migrated,schema);maximum=Math.max(maximum,legacy.length);assert.ok(legacy.length<=44000);
  migrated.wordFrayers=schema.wordFrayers!.wordIds.slice(-8).map(id=>({kind:'word',id,answers:Array(4).fill(character.repeat(Math.floor(240/character.length))) as [string,string,string,string],collected:true}));
  const encoded=encodeTopicState(migrated,schema);maximum=Math.max(maximum,encoded.length);assert.ok(encoded.length<=44000,`${unit}: ${encoded.length}`);assert.deepEqual(decodeTopicState(encoded,schema).wordFrayers,migrated.wordFrayers);
 }
 console.log(`${unit}: maximum ${maximum} characters`);
});
