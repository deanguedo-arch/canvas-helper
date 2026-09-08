import type {KeyValueStorage,TopicLms} from './pilot2-state.js';
import type {TopicRestoreSource} from './pilot2-restore.js';
import {readTopicRecoveryArchive} from './pilot2-restore.js';
import type {LegacyRecord} from './pilot2-legacy-work.js';

type Scorm2004={Initialize(value:string):unknown;GetValue(name:string):unknown;GetLastError():unknown;SetValue(name:string,value:string):unknown;Commit(value:string):unknown;Terminate(value:string):unknown};
export type TopicHost={parent?:TopicHost;opener?:TopicHost|null;API_1484_11?:unknown;localStorage?:KeyValueStorage};
const succeeded=(value:unknown)=>value===true||value==='true';
const isApi=(value:unknown):value is Scorm2004=>!!value&&typeof value==='object'&&['Initialize','GetValue','GetLastError','SetValue','Commit','Terminate'].every(key=>typeof (value as Record<string,unknown>)[key]==='function');

/** Bound ancestor/opener discovery; cross-origin getters can be inaccessible.
 * Never use the old renderer's normalize-or-empty recovery path. */
export function findTopicLms(host:TopicHost):Scorm2004|null {
 const queue:TopicHost[]=[host],seen=new Set<TopicHost>();
 while(queue.length&&seen.size<32){const next=queue.shift()!;if(seen.has(next))continue;seen.add(next);
  try{if(isApi(next.API_1484_11))return next.API_1484_11;}catch{}
  for(const key of ['parent','opener'] as const)try{const related=next[key];if(related&&!seen.has(related))queue.push(related);}catch{}
 }
 return null;
}
export function connectTopicLms(host:TopicHost) {
 const api=findTopicLms(host);let active=false,raw:string|null=null;
 if(api){
  if(!succeeded(api.Initialize('')))throw new Error('The learning platform could not open the saved-work session. Reload before editing.');
  active=true;
  try{const value=api.GetValue('cmi.suspend_data');if(String(api.GetLastError())!=='0'||typeof value!=='string')throw new Error('The learning platform could not read the saved work.');raw=value;}
  catch(error){try{api.Terminate('');}catch{}active=false;throw error;}
 }
 const adapter:TopicLms|null=api?{setValue(name,value){return active?api.SetValue(name,value):false;},commit(){return active?api.Commit(''):false;}}:null;
 return{raw,adapter,close(){if(!api||!active)return null;active=false;return api.Terminate('');}};
}

/** Capture every known exact unit key before mounting any save listeners.
 * An unreadable storage channel is an error, not evidence of an empty course. */
export function captureTopicSources(unit:'B'|'C'|'D',local:KeyValueStorage|null,lmsRaw:string|null):TopicRestoreSource[] {
 const base=`biology30-unit-${unit.toLowerCase()}`,key=`${base}:pilot2-v3`,sources:TopicRestoreSource[]=[];
 const add=(id:string,label:string,raw:string|null,role:TopicRestoreSource['role'],legacyKind?:LegacyRecord['kind'])=>{if(raw!==null&&raw!=='')sources.push({id,label,raw,role,...(legacyKind?{legacyKind}:{})});};
 if(local){
  add(key,'This device',local.getItem(key),'current');
  add(`${key}:previous`,'Previous device save',local.getItem(`${key}:previous`),'previous');
  for(const [suffix,label,kind] of [['state:v1','Earlier course work','state-v1'],['responses','Earlier written responses','responses'],['complete','Earlier completion markers','completions'],['manual-evidence-notes','Earlier notebook entries','notes']] as const)add(`${base}:${suffix}`,label,local.getItem(`${base}:${suffix}`),'legacy',kind);
 }
 if(lmsRaw!==null&&lmsRaw!==''){
  let kind:LegacyRecord['kind']|undefined;
  try{const value=JSON.parse(lmsRaw);if(value&&typeof value==='object'){if(value.v===2)kind='compact-v2';else if(value.schemaVersion===1)kind='state-v1';}}catch{}
  add('lms','Learning platform save',lmsRaw,kind?'legacy':'current',kind);
 }
 // Old keys deliberately remain intact. Once their exact bytes have a verified
 // recovery archive and a current save exists, do not ask the same migration
 // question on every reload. Changed old bytes must re-enter recovery.
 const archive=local&&sources.some(source=>source.role==='current')?readTopicRecoveryArchive(local,{unit}):[];
 return sources.filter(source=>source.role!=='legacy'||!archive.some(entry=>entry.source===source.id&&entry.raw===source.raw));
}

export function captureTopicEnvironment(host:TopicHost,unit:'B'|'C'|'D') {
 // Access can throw in private/blocked storage environments. Do not mount an
 // empty session that could replace an unreadable earlier save on retry.
 const local=host.localStorage??null,connection=connectTopicLms(host);
 try{return{local,lms:connection.adapter,sources:captureTopicSources(unit,local,connection.raw),close:connection.close};}
 catch(error){try{connection.close();}catch{}throw error;}
}
