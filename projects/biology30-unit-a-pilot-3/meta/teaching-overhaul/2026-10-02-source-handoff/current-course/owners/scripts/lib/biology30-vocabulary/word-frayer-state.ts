/** Shared eight-word selection model. No browser storage or implicit replacement. */
export type WordFrayerSchema={identity:string;wordIds:string[];legacyIds:string[];limit:number};
export type WordFrayer={kind:'word'|'legacy';id:string;answers:[string,string,string,string];collected:boolean};
export type WordFrayerState=WordFrayer[];
export function validateWordFrayers(slots:WordFrayerState,schema:WordFrayerSchema){
 if(!/^[a-f0-9]{64}$/.test(schema.identity)||!Number.isInteger(schema.limit)||schema.limit<1)throw Error('Invalid word Frayer schema');
 if(new Set(schema.wordIds).size!==schema.wordIds.length||new Set(schema.legacyIds).size!==schema.legacyIds.length)throw Error('Duplicate word Frayer identity');
 if(!Array.isArray(slots)||slots.length>8)throw Error('Choose up to eight words');
 const seen=new Set<string>();
 for(const s of slots){
  if(!s||!['word','legacy'].includes(s.kind)||!(s.kind==='word'?schema.wordIds:schema.legacyIds).includes(s.id)||seen.has(s.kind+':'+s.id))throw Error('Unknown or duplicate Frayer owner');
  seen.add(s.kind+':'+s.id);
  if(!Array.isArray(s.answers)||s.answers.length!==4||s.answers.some(a=>typeof a!=='string'||a.length>schema.limit))throw Error('A Frayer response is oversized or invalid; writing was not truncated');
  if(typeof s.collected!=='boolean'||(s.kind==='word'&&s.collected&&!s.answers.every(a=>a.trim())))throw Error('Complete four fields before collecting');
 }
 return slots;
}
export function chooseWord(slots:WordFrayerState,schema:WordFrayerSchema,id:string){
 validateWordFrayers(slots,schema);
 if(!schema.wordIds.includes(id))throw Error('Unknown word');
 if(slots.some(s=>s.kind==='word'&&s.id===id))return slots;
 if(slots.length>=8)throw Error('All eight slots are occupied. Copy and remove a chosen Frayer before choosing another word.');
 return [...slots,{kind:'word' as const,id,answers:['','','',''] as WordFrayer['answers'],collected:false}];
}
/** Confirmation is scoped to the exact owner; callers must offer a copy first. */
export function removeWordFrayer(slots:WordFrayerState,schema:WordFrayerSchema,kind:WordFrayer['kind'],id:string,confirmed:boolean){
 validateWordFrayers(slots,schema);const found=slots.find(s=>s.kind===kind&&s.id===id);
 if(!found)throw Error('Frayer is not selected');
 if((found.answers.some(a=>a.length)||found.collected)&&!confirmed)throw Error('Copy your writing and explicitly confirm removal first');
 return slots.filter(s=>s!==found);
}
export function packWordFrayers(slots:WordFrayerState,schema:WordFrayerSchema){
 validateWordFrayers(slots,schema);
 return {m:schema.identity,s:slots.map(s=>[s.kind==='word'?schema.wordIds.indexOf(s.id):-1-schema.legacyIds.indexOf(s.id),s.collected?1:0,...s.answers])};
}
export function unpackWordFrayers(raw:unknown,schema:WordFrayerSchema):WordFrayerState{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid word Frayer payload');
 const p=raw as {m:unknown;s:unknown};
 if(Object.keys(p).sort().join(',')!=='m,s'||p.m!==schema.identity||!Array.isArray(p.s))throw Error('Word map changed; preserve the original save');
 const slots=p.s.map(row=>{
  if(!Array.isArray(row)||row.length!==6||!Number.isInteger(row[0])||![0,1].includes(row[1])||row.slice(2).some(a=>typeof a!=='string'))throw Error('Malformed word Frayer; preserve original save');
  const kind=row[0]<0?'legacy':'word',id=kind==='word'?schema.wordIds[row[0]]:schema.legacyIds[-1-row[0]];
  return {kind,id,answers:row.slice(2),collected:row[1]===1} as WordFrayer;
 });return validateWordFrayers(slots,schema);
}
