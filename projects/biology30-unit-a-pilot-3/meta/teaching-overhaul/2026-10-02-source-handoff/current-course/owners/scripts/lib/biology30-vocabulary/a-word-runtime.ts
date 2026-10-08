import {mountWordFrayerControls} from './word-frayer-runtime.js';
import {packWordFrayers,unpackWordFrayers,validateWordFrayers,type WordFrayerState,type WordFrayerSchema} from './word-frayer-state.js';
import {mountVocabularyPanel} from './panel.js';
import type {BiologyWordPageData} from './word-page.js';
type ABridge={wordState():{responses:Record<string,string>;vocabulary:{choiceIds:string[];collectedIds:string[]};wordFrayers?:unknown};saveWords():{saved:boolean;message:string};refresh():void;status():string};
export function mountAWordVocabulary(bridge:ABridge){
 const payload=document.getElementById('biology-word-data');if(!payload)return false;
 const {data,schema}=JSON.parse(payload.textContent!) as {data:BiologyWordPageData;schema:WordFrayerSchema};
 const raw=bridge.wordState(),prefix='biology30-unit-a-pilot-2:core-vocabulary:',fields=['definition','characteristics','example','non-example'];
 const host=window as Window&{biologyWordBeforeSave?:()=>void;biologyWordCollectionText?:()=>string};
 let slots:WordFrayerState=[];
 try{
  if(raw.wordFrayers)slots=unpackWordFrayers(raw.wordFrayers,schema);
  else{
   slots=schema.legacyIds.flatMap(id=>{const answers=fields.map(f=>raw.responses[prefix+id+':'+f]??'') as [string,string,string,string];
    return answers.some(Boolean)||raw.vocabulary.collectedIds.includes(id)?[{kind:'legacy' as const,id,answers,collected:raw.vocabulary.collectedIds.includes(id)}]:[];
   });validateWordFrayers(slots,schema);
  }
 }catch(error){
  host.biologyWordBeforeSave=()=>{throw error};
  const warning=document.createElement('p');warning.setAttribute('role','alert');warning.textContent='Saved vocabulary could not be safely loaded. Your original save has not been replaced. '+String(error);
  document.getElementById('core-vocabulary')!.prepend(warning);return true;
 }
 const oldPayload=raw.wordFrayers;
 host.biologyWordBeforeSave=()=>{
  raw.wordFrayers=packWordFrayers(slots,schema);
  schema.legacyIds.forEach(id=>fields.forEach(f=>delete raw.responses[prefix+id+':'+f]));
  raw.vocabulary.choiceIds=[];raw.vocabulary.collectedIds=[];
 };
 let message='Writing saves as you type. Each field allows 240 characters.';
 host.biologyWordCollectionText=()=>slots.filter(s=>s.collected||s.answers.some(Boolean)).map(s=>[
  (s.kind==='word'?data.words.find(w=>w.id===s.id)!.term:data.categories.find(c=>c.id===s.id)!.label+' (earlier category)'),
  s.collected?'Status: Collected vocabulary':'Status: Vocabulary draft',
  ...s.answers.map((a,i)=>fields[i]+': '+a)
 ].join('\n')).join('\n\n');
 const collection=document.createElement('section');collection.className='collection-section';collection.dataset.aWordCollection='';
 document.getElementById('process-collection')!.append(collection);
 const updateCollection=()=>{
  collection.replaceChildren();const title=document.createElement('h2');title.textContent='My word Frayers';collection.append(title);
  for(const s of slots.filter(s=>s.collected||s.answers.some(Boolean))){const article=document.createElement('article'),h=document.createElement('h3');
   h.textContent=s.kind==='word'?data.words.find(w=>w.id===s.id)!.term:data.categories.find(c=>c.id===s.id)!.label+' (earlier category)';
   article.append(h);const status=document.createElement('p');status.textContent=s.collected?'Collected vocabulary':'Vocabulary draft';article.append(status);s.answers.forEach((a,i)=>{const p=document.createElement('p');p.textContent=fields[i]+': '+a;article.append(p)});
   const a=document.createElement('a');a.href='#core-vocabulary';a.textContent='Return to this Frayer';a.addEventListener('click',()=>setTimeout(()=>{const node=document.querySelector<HTMLElement>(s.kind==='word'?'[data-word-frayer="'+s.id+'"]':'[data-word-legacy-record="'+s.id+'"]');if(node){document.body.dispatchEvent(new CustomEvent('pilot2-reveal-target',{detail:node}));node.scrollIntoView({block:'start'});}},0));article.append(a);collection.append(article);
  }
 };
 const save=()=>{try{host.biologyWordBeforeSave!();const result=bridge.saveWords();message=result.message;updateCollection();return result}catch(error){message='Not saved. '+String(error)+'. Your draft remains available; copy or revise it.';return {saved:false,message}}};
 if(!oldPayload){try{const old=localStorage.getItem('biology30-unit-a-pilot-2:state:v1');if(old)localStorage.setItem('biology30-unit-a-pilot-2:state:v1:before-word-frayers',old)}catch{ /* No replacement occurs until the owner confirms a save. */ }}
 mountWordFrayerControls(document.body,data,schema,{get:()=>slots,set:value=>{slots=value},save});
 mountVocabularyPanel({root:document.body,
  families:data.categories.map(c=>({id:c.id,label:c.label,meaning:'',wordAnalysis:[],routes:[]})),
  words:data.words,wordFrayers:Object.fromEntries(data.words.map(w=>[w.id,w.id])),
  terms:data.words.map(w=>({term:w.term,definition:w.definition,familyIds:w.categoryIds})),
  sections:()=>Array.from(document.querySelectorAll('.course-page[id^="lesson-"] .learn-block,.course-page[id^="lesson-"] .advanced-learning-block,.course-page[id^="lesson-"] .worked-example')),
  route:section=>section.closest<HTMLElement>('.course-page')!.id,unlocked:()=>true,
  frayer:id=>document.querySelector<HTMLElement>('[data-word-frayer="'+CSS.escape(id)+'"]'),choices:()=>null,refresh:()=>{},status:()=>message,selectedFamilies:()=>[],
 });
 updateCollection();return true;
}
