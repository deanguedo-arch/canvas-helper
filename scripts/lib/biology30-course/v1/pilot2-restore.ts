import {decodeTopicState,encodeTopicState,emptyTopicState,type TopicState,type TopicStateSchema,type KeyValueStorage} from './pilot2-state.js';
import {validateLegacyRecord,type LegacyRecord} from './pilot2-legacy-work.js';
import {biologyRuntimeStorageKey,type BiologyRuntimeIdentity} from './course-identity.js';
export type TopicRestoreSource={id:string;label:string;raw:string;role:'current'|'previous'|'legacy';legacyKind?:LegacyRecord['kind']};
export type TopicRestoreCandidate={id:string;label:string;state:TopicState;sources:string[]};
export type TopicRestoreInspection={sources:TopicRestoreSource[];candidates:TopicRestoreCandidate[];automaticId:string|null;requiresChoice:boolean;issues:{source:string;message:string}[]};
/** Inspect first. A date alone never resolves conflicting local and LMS work. */
export function inspectTopicRestore(sources:TopicRestoreSource[],schema:TopicStateSchema):TopicRestoreInspection {
 if(new Set(sources.map(source=>source.id)).size!==sources.length||sources.some(source=>!source.id||!source.label||typeof source.raw!=='string'))throw new Error('Invalid restore source inventory');
 const present=sources.filter(source=>source.raw.length>0),candidates:TopicRestoreCandidate[]=[],issues:TopicRestoreInspection['issues']=[];
 for(const source of present.filter(source=>source.role!=='legacy')){
  try{const state=decodeTopicState(source.raw,schema),identity=encodeTopicState(state,schema),same=candidates.find(candidate=>encodeTopicState(candidate.state,schema)===identity);
   if(same)same.sources.push(source.id);else candidates.push({id:source.id,label:source.label,state,sources:[source.id]});
  }catch(error){issues.push({source:source.id,message:String(error)});}
 }
 const legacy=present.filter(source=>source.role==='legacy');
 if(legacy.length){
  try{const state=emptyTopicState(schema);state.legacy=legacy.map(source=>{if(!source.legacyKind)throw new Error('Earlier source kind is missing');validateLegacyRecord({source:source.id,original:source.raw,kind:source.legacyKind});return {source:source.label,original:source.raw};});encodeTopicState(state,schema);candidates.push({id:'preserved-earlier-work',label:'Preserve earlier work in the rebuilt course',state,sources:legacy.map(source=>source.id)});}
  catch(error){issues.push({source:'earlier-work',message:String(error)});}
 }
 const current=candidates.filter(candidate=>candidate.sources.some(id=>present.some(source=>source.id===id&&source.role==='current')));
 const automatic=current.length===1&&issues.length===0&&legacy.length===0?current[0]:null;
 // Different previous bytes also need preservation before the usual save channel
 // rotates its previous-state slot. Nothing is overwritten during inspection.
 return {sources:present,candidates,automaticId:automatic?.id??null,requiresChoice:present.length>0&&!automatic,issues};
}

type ArchiveEntry={source:string;label:string;key:string};
function readArchive(storage:KeyValueStorage,key:string):ArchiveEntry[]{
 const raw=storage.getItem(key);if(raw===null)return[];const data:unknown=JSON.parse(raw);
 if(!Array.isArray(data)||data.some(entry=>!entry||typeof entry.source!=='string'||typeof entry.label!=='string'||typeof entry.key!=='string')||new Set(data.map(entry=>entry.key)).size!==data.length)throw new Error('Recovery archive index is unreadable; preserve it before proceeding');
 return data;
}
export function readTopicRecoveryArchive(storage:KeyValueStorage,schema:BiologyRuntimeIdentity) {
 const prefix=`${biologyRuntimeStorageKey(schema)}:recovery`;
 return readArchive(storage,`${prefix}:index`).map(entry=>{if(!entry.key.startsWith(prefix+':source:'))throw new Error('Recovery key outside the unit archive');const raw=storage.getItem(entry.key);if(raw===null)throw new Error('Recovery archive entry is missing');return {...entry,raw};});
}
/** A learner explicitly chooses recovery. Verify every original backup before
 * activating the chosen local payload; LMS writing remains a separate channel. */
export function activateTopicRestore(inspection:TopicRestoreInspection,candidateId:string,schema:TopicStateSchema,storage:KeyValueStorage,confirmed:boolean) {
 if(inspection.requiresChoice&&!confirmed)throw new Error('Choose and confirm the recovery version first');
 const candidate=inspection.candidates.find(candidate=>candidate.id===candidateId);if(!candidate)throw new Error('Unknown recovery candidate');
 const payload=encodeTopicState(candidate.state,schema),prefix=`${biologyRuntimeStorageKey(schema)}:recovery`,indexKey=`${prefix}:index`,originalIndex=storage.getItem(indexKey);
 const archive=readTopicRecoveryArchive(storage,schema).map(({source,label,key})=>({source,label,key}));
 for(const source of inspection.sources){
  let key='';for(let slot=0;slot<1000;slot++){const proposed=`${prefix}:source:${encodeURIComponent(source.id)}:${slot}`,existing=storage.getItem(proposed);if(existing===null||existing===source.raw){key=proposed;break;}}
  if(!key)throw new Error('Recovery archive capacity reached; original work remains in place');
  if(storage.getItem(key)===null)storage.setItem(key,source.raw);if(storage.getItem(key)!==source.raw)throw new Error('Recovery backup was not verified');
  if(!archive.some(entry=>entry.key===key))archive.push({source:source.id,label:source.label,key});
 }
 if(storage.getItem(indexKey)!==originalIndex)throw new Error('Recovery archive changed during preparation');
 const archived=JSON.stringify(archive);storage.setItem(indexKey,archived);if(storage.getItem(indexKey)!==archived)throw new Error('Recovery archive index was not verified');
 const active=biologyRuntimeStorageKey(schema);
 const local=inspection.sources.find(source=>source.id===active);
 if(local&&storage.getItem(active)!==local.raw)throw new Error('Local work changed while recovery was open; inspect it again');
 if(!local&&storage.getItem(active)!==null)throw new Error('Local work appeared while recovery was open; inspect it again');
 storage.setItem(active,payload);if(storage.getItem(active)!==payload)throw new Error('Chosen recovery version was not verified; original backups remain');
 return {state:structuredClone(candidate.state),archive};
}
