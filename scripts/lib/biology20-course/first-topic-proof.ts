import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import type {TopicRenderInputs,TopicFigure} from '../biology30-course/v1/pilot2-render-topic.js';
import type {TopicLayout} from '../biology30-course/v1/topic-layout.js';
import type {TopicStateSchema} from '../biology30-course/v1/pilot2-state.js';
import {emptyTopicState,encodeTopicState} from '../biology30-course/v1/pilot2-state.js';
import {loadBiology20Vocabulary,addBiology20FrayerSchema} from './vocabulary.js';

/** Bounded internal composition proof. Not a complete module or release gate. */
export async function loadBiology20FirstTopicProof(repo:string){
 const base=path.join(repo,'projects/resources/biology20-production/v1/units/a');
 const json=async(name:string)=>JSON.parse(await readFile(path.join(base,name),'utf8'));
 const [design,core,instruction,queue]=await Promise.all(['first-topic-design.json','core-teaching.json','pilot2-instruction.json','visual-queue.json'].map(json));
 if(design.courseId!=='biology20'||design.unit!=='A'||core.courseId!==design.courseId||instruction.courseId!==design.courseId)throw Error('Cross-course proof source');
 const id=design.topicId;
 core.parts=core.parts.filter((p:{id:string})=>p.id.startsWith(id+'-'));
 instruction.parts=instruction.parts.filter((p:{partId:string})=>p.partId.startsWith(id+'-'));
 const parts=core.parts.map((p:{id:string;title:string})=>({id:p.id,title:p.title,outcomeIds:[],operation:'Draft operation; official evidence binding pending',concepts:[]}));
 if(parts.length!==3||instruction.parts.length!==3||parts.some((p:{id:string},i:number)=>instruction.parts[i].partId!==p.id))throw Error('First topic part inventory drift');
 core.parts.forEach((p:{id:string;termIntroductionIds:string[]})=>p.termIntroductionIds=design.terms.filter((t:{firstTeachingPartId:string})=>t.firstTeachingPartId===p.id).map((t:{id:string})=>t.id));
 const schema:TopicStateSchema={courseId:'biology20',unit:'A',routes:[id],responses:{},choices:{},flags:{},families:{fixed:[],selectable:[],responseIds:{}}};
 const {vocabulary,source:familySource}=await loadBiology20Vocabulary(base,design.terms);
 addBiology20FrayerSchema(schema,vocabulary);
 schema.routes.push('a-core-vocabulary');
 schema.routes.push('a-overview','a-all-my-work','a-advanced','a-glossary','a-sources-and-credits','a-chapter-1-practice','a-chapter-2-practice','a-review-seminar','a-final-practice','a-models','a-textbook','a-video-library');
 const topicMap=JSON.parse(await readFile(path.join(base,'../../topic-map.json'),'utf8')).modules.find((m:{module:string})=>m.module==='a');
 const vocabularyLayout:TopicLayout={courseId:'biology20',unit:'A',requiredMinutes:0,optionalMinutes:18,requiredRoutes:[id],topics:topicMap.topics.map((t:{id:string;title:string;chapter:number;slideNumbers:number[]})=>({...t,planRowId:'internal-vocabulary-routing',parts:t.id===id?parts:familySource.families.filter(f=>f.topicId===t.id).map(f=>({id:f.topicId+'-'+f.partSuffix,title:f.label,outcomeIds:[],operation:'Planned teaching destination; not authored evidence',concepts:[]}))}))};
 design.responses.forEach((r:{id:string;limit:number;example:string},i:number)=>{if(r.example.length*1.25>r.limit)throw Error(`Example lacks working room: ${r.id}`);schema.responses[r.id]={token:`r${i}`,limit:r.limit};});
 for(const [i,p] of design.practice.entries()){
  if(p.kind==='multiple-choice')schema.choices[p.id]={token:`c${i}`,values:['0','1','2','3']};
  else {if(p.modelResponse.length*1.25>p.responseLimit)throw Error('Practice example lacks working room');schema.responses[p.id]={token:`p${i}`,limit:p.responseLimit};}
  schema.flags[p.id+'-attempted']=`p${i}`;
 }
 schema.flags[id+'-evidence-collected']='ec';schema.flags[id+'-media-attempted']='ma';
 instruction.parts.forEach((p:{advanced:{id:string}},i:number)=>schema.flags[p.advanced.id+'-complete']=`ad${i}`);
 const figures:TopicFigure[]=[];
 const captions=['One jar, two selected system boundaries.','Equal incoming energy with different albedo: illustrative values.','Carbon inputs and energy sources in two producer pathways.'];
 const explanations=['The sealed-jar boundary permits energy exchange but approximately no matter exchange. The smaller plant boundary permits both. Evaporation inside the jar is an internal matter transfer.','Both equal areas receive 1,000 J. At albedo 0.80, 800 J is reflected and 200 J absorbed. At albedo 0.20, 200 J is reflected and 800 J absorbed. No transmission is assumed. These values do not determine final temperatures.','Both producers use inorganic carbon to build organic matter. The alga uses light energy; the specified bacterium uses energy from inorganic chemical reactions. Stylized cells and the generated vent inset are conceptual illustrations, not authentic microscopy or field observations. Other reactants and cellular steps are omitted.'];
 for(const [i,slot] of queue.slots.entries()){
  const selected=slot.candidates?.find((c:{id:string})=>c.id===slot.selected),file=selected?.file??slot.file;
  if(!file||!/^figures\/[a-z0-9-]+\.(svg|png)$/.test(file)||(!selected&&!slot.status.startsWith('authored-and-opened'))||(selected&&(!selected.opened||selected.disposition!=='provisional-local-review')))throw Error('Unreviewed proof figure');
  const bytes=await readFile(path.join(base,file)),sha256=createHash('sha256').update(bytes).digest('hex');
  if(selected&&sha256!==selected.sha256)throw Error('Selected generated image changed');
  figures.push({id:slot.id,src:'assets/'+path.basename(file),width:selected?.width??1200,height:selected?.height??(i===0?680:630),alt:captions[i],caption:captions[i],equivalentExplanation:explanations[i],scienceReview:'passed',useScope:'local-blocked-review',sha256});
 }
 const field=(suffix:string)=>design.responses.find((r:{id:string})=>r.id===id+'-'+suffix);
 const framing={unit:'A',topics:[{topicId:id,observableQuestion:design.observableQuestion,learningGoal:design.learningGoal,priorKnowledgeSupport:design.priorKnowledgeSupport,
  retrieval:{responseId:field('retrieval').id,prompt:field('retrieval').prompt,comparisonGuide:field('retrieval').example,requiredForCompletion:false},
  evidenceSlip:{responseId:field('evidence').id,prompt:field('evidence').prompt,criteria:['State the boundary and exchanges.','Distinguish carbon and energy inputs.','Conserve atoms and identify a model limitation.'],requiredSaveForCompletion:true},
  localWalkthrough:{frames:parts.map((p:{id:string;title:string},i:number)=>({partId:p.id,figureTarget:p.id+'-figure',scenario:p.title,orderedExplanation:[explanations[i]],conclusion:'Use the stated model boundary and limitations.'})),checkpoint:{responseId:field('media').id,prompt:field('media').prompt,comparisonGuide:field('media').example,sameForLocalAndVettedExternal:true,requiredAttemptForCompletion:true},completionEvidence:'Internal proof only; full course completion mapping is not established'},nextRequiredRouteId:null}]};
 const input:TopicRenderInputs<TopicLayout>={contract:{courseId:'biology20',unit:'A',requiredMinutes:0,optionalMinutes:18,requiredRoutes:[id],topics:[{id,title:design.title,chapter:1,planRowId:'internal-first-topic',slideNumbers:Array.from({length:17},(_,i)=>i+1),parts,...{anchorTermIds:design.anchorTermIds}}]},core,instruction,framing,state:schema,
 vocabulary,practice:design.practice,figures,timing:{routes:[],optionalAllocations:design.optionalAllocations}};
 const maximumProofStates=Object.fromEntries(['x','漢','\\'].map(character=>{
  let largest=0;
  for(let a=0;a<schema.families.selectable.length;a++)for(let b=a+1;b<schema.families.selectable.length;b++){
  const maximum=emptyTopicState(schema);
  maximum.frayerChoices=[schema.families.selectable[a],schema.families.selectable[b]];
  const inactive=new Set(schema.families.selectable.filter(f=>!maximum.frayerChoices.includes(f)).flatMap(f=>schema.families.responseIds[f]));
  for(const [key,value] of Object.entries(schema.responses))if(!inactive.has(key))maximum.responses[key]=character.repeat(value.limit);
  for(const [key,value] of Object.entries(schema.choices))maximum.choices[key]=value.values.at(-1)!;
  maximum.flags=Object.keys(schema.flags).filter(flag=>!schema.families.selectable.some(f=>flag===f+'-collected'&&!maximum.frayerChoices.includes(f)));maximum.visited=[...schema.routes];
  largest=Math.max(largest,encodeTopicState(maximum,schema).length);
  }
  return [character,largest];
 }));
 return {input,base,design,vocabulary,vocabularyLayout,maximumProofStates,maximumProofCharacters:Math.max(...Object.values(maximumProofStates)),limitations:'Internal first-topic and vocabulary proof: later lesson destinations are planning notices only. Full module counts, teacher pacing, textbook/media and curriculum evidence are incomplete.'};
}
