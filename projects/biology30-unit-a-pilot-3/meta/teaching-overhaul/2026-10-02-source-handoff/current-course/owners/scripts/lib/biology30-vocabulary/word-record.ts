/** Word-owned content. Categories deliberately have no definition or morphology. */
export type BiologyWordRecord={
 id:string;term:string;categoryIds:string[];definition:string;
 structure:{status:'contextual-analysis'|'verified-morphology'|'not-verified';text:string;parts?:{text:string;meaning:string}[];caution?:string};
 whatItDoes:string;relatedTermIds:string[];commonConfusion:string;retrievalPrompt:string;
 sourceRefs:string[];
 /** Only a model authored for this exact word; never inherit a category model. */
 modelFrayer?:[string,string,string,string];
};
export type BiologyWordCategory={id:string;label:string;wordIds:string[]};
export function validateBiologyWordRecords(words:BiologyWordRecord[],categories:BiologyWordCategory[]){
 const byId=new Map(words.map(w=>[w.id,w]));if(byId.size!==words.length)throw Error('Duplicate word identity');
 const groups=new Map(categories.map(c=>[c.id,c]));if(groups.size!==categories.length)throw Error('Duplicate category identity');
 for(const c of categories){if(Object.keys(c).some(k=>!['id','label','wordIds'].includes(k)))throw Error('Categories organize words only: '+c.id);if(!c.label.trim()||!c.wordIds.length||new Set(c.wordIds).size!==c.wordIds.length||c.wordIds.some(id=>!byId.get(id)?.categoryIds.includes(c.id)))throw Error('Invalid category '+c.id);}
 for(const w of words){
  if(![w.id,w.term,w.definition,w.structure?.text,w.whatItDoes,w.commonConfusion,w.retrievalPrompt].every(x=>typeof x==='string'&&x.trim()))throw Error('Incomplete word '+w.id);
  if(!['contextual-analysis','verified-morphology','not-verified'].includes(w.structure.status))throw Error('Unreviewed structure status '+w.id);
  if(!w.categoryIds.length||w.categoryIds.some(id=>!groups.get(id)?.wordIds.includes(w.id)))throw Error('Invalid word category '+w.id);
  if(!w.sourceRefs.length||w.relatedTermIds.some(id=>!byId.has(id)||id===w.id))throw Error('Unresolved word evidence/relationship '+w.id);
  if(w.modelFrayer&&(w.modelFrayer.length!==4||w.modelFrayer.some(v=>typeof v!=='string'||!v.trim())))throw Error('Incomplete word-specific model '+w.id);
 }
}
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
/** Shared by the future page and popup adapters; never substitute category prose. */
export function renderBiologyWordDetails(word:BiologyWordRecord,words:BiologyWordRecord[],categories:Pick<BiologyWordCategory,'id'|'label'>[]=[]){
 const section=(title:string,text:string)=>`<section><h3 class="section-label">${title}</h3><p>${escape(text)}</p></section>`;
 const labels=word.categoryIds.map(id=>categories.find(c=>c.id===id)?.label).filter(Boolean).join(' · ');
 const related=word.relatedTermIds.map(id=>{const related=words.find(w=>w.id===id);if(!related)throw Error('Unknown related word '+id);return related.term;}).join(' · ');
 const structure=word.structure.parts?.length?'<section><h3 class="section-label">Word structure</h3><dl class="word-parts">'+word.structure.parts.map(p=>'<div><dt>'+escape(p.text)+'</dt><dd>'+escape(p.meaning)+'</dd></div>').join('')+'</dl>'+(word.structure.caution?'<p class="caution-line"><strong>Use with care:</strong> '+escape(word.structure.caution)+'</p>':'')+'</section>':section('Word structure',word.structure.text);
 return `<div data-biology-word-details="${escape(word.id)}">${labels?`<p class="eyebrow">${escape(labels)}</p>`:''}<h2 tabindex="-1">${escape(word.term)}</h2>${section('Meaning',word.definition)}${structure}${section('What it does',word.whatItDoes)}<section class="concept-contrast"><div><h3>Related ideas</h3><p>${escape(related)}</p></div><div><h3>Common confusion</h3><p>${escape(word.commonConfusion)}</p></div></section><section class="retrieval-mini"><h3>Retrieve the idea</h3><p>${escape(word.retrievalPrompt)}</p></section></div>`;
}
