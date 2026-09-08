import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import type { TopicContract } from "./pilot2-contract.js";
import type { TopicStateSchema } from "./pilot2-state.js";
import { topicIndexIdentity } from "./pilot2-state.js";
type Practice = { unit:string; counts:Record<string,number>; chapterCounts:Record<string,number>; items:{id:string;kind:string;role:string;routeId:string;prompt:string;stages?:string[];options?:string[];correctIndex?:number;rationale?:string;misconceptionFeedback?:string[];modelResponse?:string;comparisonFeedback?:string;responseLimit?:number;teachingTopicId:string;teachingPartIds:string[];prerequisitePartIds?:string[];componentIds:string[];outcomeIds:string[];componentEvidenceRole:string}[] };
type Vocabulary = { unit:string;preservedGlossaryEntries:{term:string;definition:string}[];introducedTerms:{id:string;term:string;definition:string;firstTeachingTopicId:string;firstTeachingPartId:string;occurrences:string[]}[];conceptFamilies:{id:string;termIds:string[];fixedFrayer:boolean;modelFrayer:Record<string,string>;auditScores:Record<string,number>;auditTotal:number;teachingPartIds:string[]}[];frayerContract:{fixedFamilyIds:string[];learnerChoiceCount:number;requiredForCompletion:boolean;requiredForScores:boolean} };
type Timing = {unit:string;requiredMinutes:number;optionalMinutes:number;routes:{routeId:string;requiredMinutes:number;components:Record<string,number>}[];optionalAllocations:{id:string;minutes:number;required:boolean}[]};
export type LearningInputs={practice:Practice;vocabulary:Vocabulary;timing:Timing;state:TopicStateSchema};
export function validateBiology30LearningInputs(contract:TopicContract,input:LearningInputs){
  const {practice,vocabulary,timing,state}=input;
  if(state.flagPacking && createHash("sha256").update(JSON.stringify(state.flagPacking.order)).digest("hex")!==state.flagPacking.sha256)throw new Error("Flag packing order identity has changed");
  if(state.responsePacking && createHash("sha256").update(JSON.stringify(state.responsePacking.order)).digest("hex")!==state.responsePacking.sha256)throw new Error("Response packing order identity has changed");
  if(state.indexPacking && createHash("sha256").update(topicIndexIdentity(state)).digest("hex")!==state.indexPacking.sha256)throw new Error("Choice/route packing identity has changed");
  if([practice.unit,vocabulary.unit,timing.unit,state.unit].some(u=>u!==contract.unit))throw new Error("Cross-unit learning contract");
  const topics=new Map(contract.topics.map(t=>[t.id,t])), parts=new Map(contract.topics.flatMap(t=>t.parts.map(p=>[p.id,t.id] as const)));
  const ids=new Set<string>();const counts:Record<string,number>={guided:0,chapter:0,final:0,challenge:0};
  for(const item of practice.items){
    if(ids.has(item.id)||!item.prompt.trim()||!topics.has(item.teachingTopicId)||!item.componentIds.length||!item.teachingPartIds.length||item.teachingPartIds.some(id=>parts.get(id)!==item.teachingTopicId))throw new Error(`Incomplete or duplicate practice mapping: ${item.id}`);
    ids.add(item.id);if(!Object.hasOwn(counts,item.role))throw new Error("Unknown practice role");counts[item.role]++;
    if(!state.routes.includes(item.routeId)||!state.flags[`${item.id}-attempted`])throw new Error(`Practice route/state missing: ${item.id}`);
    if(new Set(item.prerequisitePartIds??[]).size!==(item.prerequisitePartIds??[]).length)throw new Error(`Duplicate prerequisite part: ${item.id}`);
    for(const partId of [...item.teachingPartIds,...item.prerequisitePartIds??[]]){
      const topic=parts.get(partId), topicOrder=contract.requiredRoutes.indexOf(topic??"");
      const assessmentOrder=contract.requiredRoutes.indexOf(item.routeId);
      // Optional challenge follows the complete required sequence and does not
      // authorize moving a required topic behind its own guided/chapter work.
      if(topicOrder<0||(item.role!=="challenge"&&(assessmentOrder<0||topicOrder>assessmentOrder)))throw new Error(`Practice precedes required prerequisite: ${item.id}: ${partId}`);
    }
    if(item.stages !== undefined && (item.kind !== "constructed" || !Array.isArray(item.stages) || item.stages.length < 2 || item.stages.some(step => typeof step !== "string" || !step.trim()))) throw new Error(`Invalid staged practice: ${item.id}`);
    if(item.kind==="multiple-choice"){
      if(item.options?.length!==4||new Set(item.options).size!==4||!Number.isInteger(item.correctIndex)||item.correctIndex!<0||item.correctIndex!>=4||!item.rationale?.trim()||item.misconceptionFeedback?.length!==4||item.misconceptionFeedback.some(x=>!x.trim()))throw new Error(`Incomplete practice key: ${item.id}`);
      if(!state.choices[item.id]||JSON.stringify(state.choices[item.id].values)!==JSON.stringify(["0","1","2","3"]))throw new Error(`Choice state drift: ${item.id}`);
    }else if(item.kind==="constructed"){
      if(!item.modelResponse?.trim()||!item.comparisonFeedback?.trim()||!state.responses[item.id])throw new Error(`Missing constructed-operation guide/state: ${item.id}`);
      const limit=state.responses[item.id].limit;
      if(item.responseLimit!==limit||limit<Math.max(240,item.modelResponse.length*1.2+20))throw new Error(`Constructed response lacks exemplar working room: ${item.id}`);
    }else throw new Error(`Unknown practice kind: ${item.id}`);
  }
  if(Object.keys(counts).some(role=>counts[role]!==practice.counts[role]))throw new Error("Actual question counts differ from blueprint");
  for(const topic of contract.topics){const guided=practice.items.filter(i=>i.role==="guided"&&i.routeId===topic.id);if(guided.length!==2||!guided.some(i=>i.kind==="constructed"))throw new Error(`Guided operation inventory drift: ${topic.id}`);}
  for(const [chapter,count]of Object.entries(practice.chapterCounts))if(practice.items.filter(i=>i.role==="chapter"&&i.routeId===`${contract.unit.toLowerCase()}-chapter-${chapter}-practice`).length!==count)throw new Error("Chapter item count drift");
  const terms=new Map(vocabulary.introducedTerms.map(t=>[t.id,t]));if(terms.size!==vocabulary.introducedTerms.length)throw new Error("Duplicate vocabulary identity");
  for(const term of terms.values())if(!term.definition.trim()||parts.get(term.firstTeachingPartId)!==term.firstTeachingTopicId||!term.occurrences.includes(term.firstTeachingPartId)||term.occurrences.some(id=>!parts.has(id)))throw new Error(`Unresolved vocabulary first use: ${term.id}`);
  for(const topic of contract.topics){
    const enriched=topic as typeof topic & {anchorTermIds:string[];newTermIds:string[];reusedTermIds:string[]};
    if(enriched.anchorTermIds?.length!==4||new Set(enriched.anchorTermIds).size!==4||enriched.anchorTermIds.some(id=>!terms.has(id)||!terms.get(id)!.occurrences.some(part=>parts.get(part)===topic.id)))throw new Error(`Four taught topic anchors missing: ${topic.id}`);
    const introduced=vocabulary.introducedTerms.filter(term=>term.firstTeachingTopicId===topic.id).map(term=>term.id);
    const reused=vocabulary.introducedTerms.filter(term=>term.firstTeachingTopicId!==topic.id&&term.occurrences.some(part=>parts.get(part)===topic.id)).map(term=>term.id);
    if(JSON.stringify(enriched.newTermIds)!==JSON.stringify(introduced)||JSON.stringify(enriched.reusedTermIds)!==JSON.stringify(reused))throw new Error(`Topic new/reused vocabulary inventory drift: ${topic.id}`);
  }
  const familyIds=new Set<string>();for(const family of vocabulary.conceptFamilies){if(familyIds.has(family.id)||!family.termIds.length||family.termIds.some(id=>!terms.has(id))||Object.values(family.modelFrayer).length!==4||Object.values(family.modelFrayer).some(s=>!s.trim())||Object.values(family.auditScores).reduce((a,b)=>a+b,0)!==family.auditTotal)throw new Error(`Incomplete family/model: ${family.id}`);familyIds.add(family.id);}
  const fixed=vocabulary.conceptFamilies.filter(f=>f.fixedFrayer).map(f=>f.id);if(fixed.length!==6||JSON.stringify(fixed)!==JSON.stringify(vocabulary.frayerContract.fixedFamilyIds)||vocabulary.frayerContract.learnerChoiceCount!==2||vocabulary.frayerContract.requiredForCompletion||vocabulary.frayerContract.requiredForScores)throw new Error("Optional Frayer participation contract drift");
  if(JSON.stringify(state.families.fixed)!==JSON.stringify(fixed)||Object.keys(state.families.responseIds).some(id=>!familyIds.has(id)))throw new Error("Frayer state family drift");
  if(timing.requiredMinutes!==contract.requiredMinutes||timing.optionalMinutes!==contract.optionalMinutes||timing.routes.length!==contract.requiredRoutes.length||new Set(timing.routes.map(r=>r.routeId)).size!==timing.routes.length)throw new Error("Time route inventory drift");
  for(const route of timing.routes)if(!contract.requiredRoutes.includes(route.routeId)||Object.values(route.components).some(n=>!Number.isFinite(n)||n<0)||Object.values(route.components).reduce((a,b)=>a+b,0)!==route.requiredMinutes)throw new Error(`Route workload arithmetic drift: ${route.routeId}`);
  if(timing.routes.reduce((n,r)=>n+r.requiredMinutes,0)!==contract.requiredMinutes||timing.optionalAllocations.reduce((n,r)=>n+r.minutes,0)!==contract.optionalMinutes)throw new Error("Total time drift");
  const advancedIds=new Set([...parts.keys()].map(id=>`${id}-advanced`));for(const allocation of timing.optionalAllocations){if(allocation.required||allocation.minutes<=0)throw new Error("Optional time became required or nonpositive");advancedIds.delete(allocation.id);}
  if(advancedIds.size||timing.optionalAllocations.length!==parts.size+2||timing.optionalAllocations.find(a=>a.id.endsWith("review-seminar-extension"))?.minutes!==20||timing.optionalAllocations.find(a=>a.id.endsWith("diploma-challenge"))?.minutes!==30)throw new Error("Adjacent Advanced allocation or optional reserve drift");
  return {unit:contract.unit,practiceCounts:counts,terms:terms.size,conceptFamilies:familyIds.size,fixedFrayers:6,choiceFrayers:2,requiredMinutes:contract.requiredMinutes,optionalMinutes:contract.optionalMinutes,proof:"Authored topology and arithmetic only; item independence, instruction, scientific review, timing realism and rendered state remain separate gates."};
}
export async function auditBiology30LearningInputs(repoRoot:string,contract:TopicContract){
 const base=`projects/resources/biology30-production/v1/units/unit-${contract.unit.toLowerCase()}`;const names=["practice","vocabulary","time","state-schema"];const files=names.map(name=>`${base}/pilot2-${name}.json`);const bytes=await Promise.all(files.map(file=>readFile(path.join(repoRoot,file))));const [practice,vocabulary,timing,state]=bytes.map(b=>JSON.parse(b.toString("utf8")));const input:LearningInputs={practice,vocabulary,timing,state};return {input,report:validateBiology30LearningInputs(contract,input),files:files.map((file,i)=>({file,sha256:createHash("sha256").update(bytes[i]).digest("hex")}))};
}
