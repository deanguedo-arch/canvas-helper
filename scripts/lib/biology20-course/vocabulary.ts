import {readFile} from 'node:fs/promises';
import path from 'node:path';
import type {RenderTopicVocabulary} from '../biology30-course/v1/pilot2-render-vocabulary.js';
import type {TopicStateSchema} from '../biology30-course/v1/pilot2-state.js';

type FamilySource={id:string;label:string;fixedFrayer:boolean;topicId:string;partSuffix:string;terms:string[];meaning:string;wordAnalysis:string;model:string[]};
/** Authored vocabulary, not generated etymology or a curriculum clearance. */
export async function loadBiology20Vocabulary(base:string,initialTerms:RenderTopicVocabulary['introducedTerms']){
 const source=JSON.parse(await readFile(path.join(base,'vocabulary-families.json'),'utf8')) as {courseId:string;unit:string;families:FamilySource[];termDefinitions:Record<string,string>};
 if(source.courseId!=='biology20'||source.unit!=='A')throw Error('Wrong vocabulary source identity');
 const terms=initialTerms.map(t=>({...t}));
 for(const [term,definition] of Object.entries(source.termDefinitions)){
  const family=source.families.find(f=>f.terms.includes(term));if(!family)throw Error('Unmapped authored term '+term);
  terms.push({id:'a-term-'+term.replaceAll(' ','-'),term,definition,firstTeachingTopicId:family.topicId,firstTeachingPartId:family.topicId+'-'+family.partSuffix,occurrences:[family.topicId+'-'+family.partSuffix]});
 }
 const keys=['contextualDefinition','essentialMechanism','unitEvidence','nonExampleOrConfusion'];
 const families=source.families.map(f=>{
  if(f.model.length!==4||f.model.some(text=>!text.trim()||text.length*1.25>240))throw Error('Frayer example capacity: '+f.id);
  return {id:f.id,label:f.label,fixedFrayer:f.fixedFrayer,meaning:f.meaning,mechanism:f.model[1],contrast:f.model[3],retrievalPrompt:'Explain this concept in a new example, then identify a limitation or common confusion.',wordAnalysis:{treatment:f.wordAnalysis,caution:'This is contextual word analysis, not a claim about historical word origins.'},
   termIds:f.terms.map(term=>{const found=terms.find(t=>t.term.toLowerCase()===term);if(!found)throw Error('Missing term definition: '+term);return found.id;}),teachingPartIds:[f.topicId+'-'+f.partSuffix],modelFrayer:Object.fromEntries(keys.map((key,i)=>[key,f.model[i]])),auditScores:{},auditTotal:0};
 });
 if(families.filter(f=>f.fixedFrayer).length!==6||new Set(families.map(f=>f.id)).size!==families.length)throw Error('Six-anchor inventory drift');
 const vocabulary:RenderTopicVocabulary={unit:'A',preservedGlossaryEntries:[],introducedTerms:terms,conceptFamilies:families,frayerContract:{fixedFamilyIds:families.filter(f=>f.fixedFrayer).map(f=>f.id),learnerChoiceCount:2,requiredForCompletion:false,requiredForScores:false}};
 return {vocabulary,source};
}

export function addBiology20FrayerSchema(schema:TopicStateSchema,vocabulary:RenderTopicVocabulary){
 if(schema.courseId!=='biology20')throw Error('Biology 20 schema required');
 for(const [i,f] of vocabulary.conceptFamilies.entries()){
  (f.fixedFrayer?schema.families.fixed:schema.families.selectable).push(f.id);
  schema.families.responseIds[f.id]=['definition','mechanism','evidence','confusion'].map((suffix,j)=>{
   const id=f.id+'-'+suffix;if(schema.responses[id])throw Error('Duplicate Frayer response');schema.responses[id]={token:`v${i}_${j}`,limit:240};return id;
  });
  schema.flags[f.id+'-collected']=`vf${i}`;
 }
}
