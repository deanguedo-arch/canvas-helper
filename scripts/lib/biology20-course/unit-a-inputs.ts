import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {loadBiology20FirstTopicProof} from './first-topic-proof.js';
import {emptyTopicState,encodeTopicState,decodeTopicState,migrateTopicWordFrayers} from '../biology30-course/v1/pilot2-state.js';
import type {TopicLayout} from '../biology30-course/v1/topic-layout.js';
import {renderBiology20Diagram,type Diagram} from './diagrams.js';
import type {TopicFigure} from '../biology30-course/v1/pilot2-render-topic.js';

/** Full A inventory, separate from the isolated first-topic test save. */
export async function loadBiology20UnitA(repo:string){
 const proof=await loadBiology20FirstTopicProof(repo),base=proof.base;
 const json=async(file:string)=>JSON.parse(await readFile(path.join(base,file),'utf8'));
 const [design,bank,integrated,core,instruction]=await Promise.all(['module-activity-design.json','module-practice.json','module-integrated-work.json','core-teaching.json','pilot2-instruction.json'].map(json));
 const schema=structuredClone(proof.input.state),practice=[...proof.design.practice,...bank.items];
 const examples=[...proof.design.responses,...design.topics.flatMap((t:any)=>t.responses),...integrated.examples,{id:proof.design.practice[1].id,limit:750,example:proof.design.practice[1].modelResponse}];
 for(const t of proof.vocabularyLayout.topics)if(!schema.routes.includes(t.id))schema.routes.push(t.id);
 for(const route of ['a-notes','a-investigations'])if(!schema.routes.includes(route))schema.routes.push(route);
 for(const [i,r] of examples.entries()){
  if(r.example.length*1.25>r.limit)throw Error('Example lacks working room: '+r.id);
  if(schema.responses[r.id]&&schema.responses[r.id].limit!==r.limit)throw Error('Existing capacity changed: '+r.id);
  if(!schema.responses[r.id])schema.responses[r.id]={token:'rfull'+i,limit:r.limit};
 }
 for(const [i,p] of practice.entries()){
  if(p.kind==='multiple-choice'&&!schema.choices[p.id])schema.choices[p.id]={token:'qfull'+i,values:['0','1','2','3']};
  if(!schema.flags[p.id+'-attempted'])schema.flags[p.id+'-attempted']='qf'+i;
 }
 for(const [i,t] of proof.vocabularyLayout.topics.entries())for(const suffix of ['evidence-collected','media-attempted'])if(!schema.flags[t.id+'-'+suffix])schema.flags[t.id+'-'+suffix]=`t${i}${suffix}`;
 for(const [i,p] of instruction.parts.entries())if(!schema.flags[p.advanced.id+'-complete'])schema.flags[p.advanced.id+'-complete']='af'+i;
 schema.flags[integrated.seminar.id+'-saved']='sem';
 for(const [i,inv] of integrated.investigations.entries())schema.flags[inv.id+'-saved']='inv'+i;
 for(const [i,m] of integrated.models.entries()){schema.choices[m.id]={token:'model'+i,values:m.options};schema.flags[m.testFlag]='mt'+i;schema.flags[m.collectionFlag]='mc'+i;}
 const sha=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
 const wordDetails=await json('word-details.json');
 const wordMap={wordIds:wordDetails.words.map((w:{id:string})=>w.id),legacyIds:Object.keys(schema.families.responseIds),limit:240};
 schema.wordFrayers={...wordMap,identity:sha(wordMap)};
 const flagOrder=Object.keys(schema.flags),responseOrder=Object.keys(schema.responses);
 schema.flagPacking={format:'hex-v1',order:flagOrder,sha256:sha(flagOrder)};
 schema.responsePacking={format:'ordered-text-v1',order:responseOrder,sha256:sha(responseOrder)};
 schema.indexPacking={format:'choices-routes-v1',sha256:sha({choices:schema.choices,routes:schema.routes})};
 const capacity=[];
 for(let a=0;a<schema.families.selectable.length;a++)for(let b=a+1;b<schema.families.selectable.length;b++)for(const character of ['x','漢','\\','😀']){
  const state=emptyTopicState(schema);state.frayerChoices=[schema.families.selectable[a],schema.families.selectable[b]];
  const inactive=new Set(schema.families.selectable.filter(f=>!state.frayerChoices.includes(f)).flatMap(f=>schema.families.responseIds[f]));
  for(const [id,r] of Object.entries(schema.responses))if(!inactive.has(id))state.responses[id]=character.repeat(Math.floor(r.limit/character.length));
  for(const [id,c] of Object.entries(schema.choices))state.choices[id]=c.values.at(-1)!;
  state.flags=Object.keys(schema.flags).filter(id=>!schema.families.selectable.some(f=>id===f+'-collected'&&!state.frayerChoices.includes(f)));state.visited=[...schema.routes];
  const encoded=encodeTopicState(state,schema);const decoded=decodeTopicState(encoded,schema);
  if(JSON.stringify(Object.entries(decoded.responses).sort())!==JSON.stringify(Object.entries(state.responses).sort()))throw Error('Maximum state changed writing');
  capacity.push({choices:state.frayerChoices,character,characters:encoded.length});
  const migrated=migrateTopicWordFrayers(state,schema);
  migrated.wordFrayers=schema.wordFrayers.wordIds.slice(-8).map(id=>({kind:'word' as const,id,answers:Array(4).fill(character.repeat(Math.floor(240/character.length))) as [string,string,string,string],collected:true}));
  const wordEncoded=encodeTopicState(migrated,schema),wordDecoded=decodeTopicState(wordEncoded,schema);
  if(JSON.stringify(wordDecoded.wordFrayers)!==JSON.stringify(migrated.wordFrayers))throw Error('Word Frayer maximum state changed writing');
  capacity.push({choices:migrated.wordFrayers.map(s=>s.id),character,characters:wordEncoded.length});
 }
 const maximum=Math.max(...capacity.map(c=>c.characters));
 if(maximum>44000)throw Error('Full Unit A exceeds unchanged target: '+maximum);
 const declared=await json('contract.json'),topicMap=proof.vocabularyLayout.topics;
 const requiredRoutes=[...topicMap.slice(0,3).map(t=>t.id),'a-chapter-1-practice',...topicMap.slice(3).map(t=>t.id),'a-chapter-2-practice','a-review-seminar','a-final-practice'];
 if(JSON.stringify(declared.requiredRoutes)!==JSON.stringify(requiredRoutes)||JSON.stringify(declared.topics)!==JSON.stringify(topicMap.map(t=>t.id)))throw Error('Declared Unit A inventory drift');
 const contract:TopicLayout={courseId:'biology20',unit:'A',requiredMinutes:declared.requiredMinutes,optionalMinutes:declared.optionalMinutes,requiredRoutes,topics:topicMap.map(t=>({...t,parts:core.parts.filter((p:any)=>p.id.startsWith(t.id+'-')).map((p:any)=>({id:p.id,title:p.title,outcomeIds:instruction.parts.find((i:any)=>i.partId===p.id).outcomeIds,operation:p.title,concepts:[]}))}))};
 const vocabulary=proof.vocabulary;
 for(const p of core.parts)p.termIntroductionIds=vocabulary.introducedTerms.filter(t=>t.firstTeachingPartId===p.id).map(t=>t.id);
 // Four entry words can include earlier concepts: no invented new definitions.
 const anchorNames=[['system','biosphere','albedo','autotroph'],['producer','consumer','decomposer','energy'],['biomass','energy','consumer','system'],['water','system','energy','biosphere'],['carbon','nitrogen','producer','decomposer'],['phosphorus','oxygen','system','biosphere']];
 for(const [i,t] of contract.topics.entries()){
  const available=anchorNames[i].map(n=>vocabulary.introducedTerms.find(x=>x.term.toLowerCase()===n));
  if(available.some(t=>!t))throw Error('Missing explicitly selected lesson anchor');
  Object.assign(t,{anchorTermIds:available.map(t=>t!.id),teacherTextbookAssignment:['pp. 9–15','pp. 16–19','pp. 20–31','pp. 32–40','pp. 42–46 and 49–51','pp. 47–48 and 52–65'][i]});
 }
 const specs=(await json('module-figures.json')).figures as Diagram[];
 const diagramFiles=specs.map(spec=>{const p=core.parts.find((p:any)=>p.id.endsWith('-'+spec.suffix));if(!p)throw Error('Diagram has no teaching owner');return{spec,id:p.id+'-figure',src:'assets/'+spec.suffix+'.svg',svg:renderBiology20Diagram(spec)};});
 const figures:TopicFigure[]=[...proof.input.figures,...diagramFiles.map(f=>({id:f.id,src:f.src,width:1100,height:590,alt:f.spec.title,caption:f.spec.title,equivalentExplanation:[...(f.spec.lines??[]),...(f.spec.rows??[]).map(r=>r.join(': ')),f.spec.units??'',f.spec.note].filter(Boolean).join('. '),scienceReview:'passed' as const,useScope:'local-blocked-review' as const,sha256:createHash('sha256').update(f.svg).digest('hex')}))];
 const sourceFigures=(await json('source-figure-bindings.json')).bindings;
 const reviewed=(await json('module-figure-review.json')).figures;
 if(reviewed.length!==figures.length||figures.some(f=>!reviewed.some((r:any)=>r.id===f.id&&r.sha256===f.sha256)))throw Error('A figure has changed since visual/science review');
 for(const binding of sourceFigures){const f=figures.find(f=>f.id.endsWith('-'+binding.suffix+'-figure'))!;const bytes=await readFile(path.join(base,'../../assets',binding.file)),hash=createHash('sha256').update(bytes).digest('hex');if(hash!==binding.file.split('.')[0])throw Error('Source figure drift');f.panels=[{...f,id:f.id+'-source',src:'assets/source-'+binding.suffix+'.png',width:binding.width,height:binding.height,caption:binding.caption,alt:binding.caption,equivalentExplanation:binding.explanation,sha256:hash},{...f}];f.comparisonGuide=binding.explanation;}
 const framing={unit:'A',topics:contract.topics.map((t,i)=>{
  if(i===0)return {...proof.input.framing.topics[0],nextRequiredRouteId:requiredRoutes[1]};
  const responses=design.topics.find((x:any)=>x.topicId===t.id)?.responses;if(!responses)throw Error('Missing topic response design '+t.id);
  const field=(suffix:string)=>responses.find((r:any)=>r.id===t.id+'-'+suffix);
  return {topicId:t.id,observableQuestion:field('evidence').prompt,learningGoal:t.parts.map(p=>p.title).join('; ')+'.',priorKnowledgeSupport:'Use the preceding lessons to distinguish a system boundary, a stored quantity and a transfer. Keep units and the observation interval visible.',retrieval:{responseId:field('retrieval').id,prompt:field('retrieval').prompt,comparisonGuide:field('retrieval').example,requiredForCompletion:false},evidenceSlip:{responseId:field('evidence').id,prompt:field('evidence').prompt,criteria:['Use scientifically accurate processes.','Show the requested evidence or calculation with units.','Explain the reasoning and limits required by the prompt.'],requiredSaveForCompletion:true},localWalkthrough:{frames:t.parts.map(p=>({partId:p.id,figureTarget:p.id+'-figure',scenario:p.title,orderedExplanation:instruction.parts.find((x:any)=>x.partId===p.id).workedExample.steps,conclusion:instruction.parts.find((x:any)=>x.partId===p.id).workedExample.conclusion})),checkpoint:{responseId:field('media').id,prompt:field('media').prompt,comparisonGuide:field('media').example,sameForLocalAndVettedExternal:true,requiredAttemptForCompletion:true},completionEvidence:'Attempt the checkpoint and guided questions; save the Evidence Slip. Completion records participation, not automatic mastery.'},nextRequiredRouteId:requiredRoutes[requiredRoutes.indexOf(t.id)+1]};
 })};
 const timing={routes:requiredRoutes.map(routeId=>({routeId,requiredMinutes:routeId.includes('-topic-')?50:routeId.includes('-chapter-')?20:30})),optionalAllocations:instruction.parts.map((p:any)=>({id:p.advanced.id,minutes:6}))};
 const textbookLinks=contract.topics.map((t,i)=>({topicId:t.id,pdf:'assets/'+(i<3?'textbook-chapter-1.pdf':i===3?'textbook-chapter-2a.pdf':'textbook-chapter-2b.pdf'),printedPage:[9,18,21,32,44,48][i],physicalPage:[8,17,20,1,4,8][i]}));
 const input={contract,core,instruction,framing,state:schema,vocabulary,practice,figures,timing,textbookLinks};
 const activities={contract,state:schema,framing,instruction,practice:{unit:'A',items:practice,counts:{},chapterCounts:{}},vocabulary,models:{models:integrated.models},investigations:{investigations:integrated.investigations},seminar:integrated.seminar,textbook:{groups:[]}};
 return {proof,base,design,practice,integrated,core,instruction,schema,examples,capacity,maximum,input,activities,diagramFiles,sourceFigures};
}
