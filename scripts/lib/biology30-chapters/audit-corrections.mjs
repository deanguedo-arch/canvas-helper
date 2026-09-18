/* Build-time presentation corrections: values/answer identities are unchanged. */
const hash=text=>[...text].reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261);
export function balanceOptions(items){
 const counts=new Map();
 for(const q of items){if(!q.options.includes(q.answer)||new Set(q.options).size!==q.options.length)throw Error('Invalid options '+q.id);const n=q.options.length,used=counts.get(n)||Array(n).fill(0);counts.set(n,used);const minimum=Math.min(...used),positions=used.map((v,i)=>v===minimum?i:-1).filter(i=>i>=0),position=positions[hash(q.id)%positions.length];used[position]++;
  const wrong=q.options.filter(x=>x!==q.answer).sort((a,b)=>hash(q.id+a)-hash(q.id+b));wrong.splice(position,0,q.answer);q.options=wrong;
 }
}
export function applyAuditCorrections(C){
 const replacements=C.chapter===12?[
  ['Transmission of retinal information toward the brain','Conversion of light into signals in rods and cones','Transfer of signals from photoreceptors to bipolar cells','Integration of incoming signals within the retina'],
  ['Both body region and contact pressure changed','Pressure is the responding variable and body region is controlled','Any difference must be due to receptor density alone','Repeating the same pressure difference isolates body region'],
  ['A semicircular-canal cupula','An otolith-bearing membrane in the utricle','An otolith-bearing membrane in the saccule','The basilar membrane within the cochlea']
 ]:[
  ['Thyroxine can be low because the stimulating signal is insufficient','Thyroxine rises because weak feedback guarantees increased TSH','Thyroxine stays normal because reduced TRH directly stimulates the thyroid','Thyroxine rises because low TSH directly stimulates thyroid cells'],
  ['Increased kidney sodium reabsorption rather than a direct increase in water permeability','A direct increase in collecting-duct water permeability rather than sodium reabsorption','Reduced kidney sodium reabsorption while potassium reabsorption increases','Reduced collecting-duct water permeability despite unchanged sodium handling'],
  ['Reduced target response to the hormone','Insufficient insulin release from pancreatic beta cells','Excessive insulin-driven glucose uptake by target tissues','Increased target sensitivity to insulin']
 ];
 C.transferLegacyChoices=C.transferChecks.flatMap(s=>s.mc.map(q=>({id:q.id,options:[...q.options]})));
 for(const spec of C.transferChecks)spec.mc.forEach((q,i)=>q.options=replacements[i]);
 balanceOptions(C.guidedActivities.flatMap(a=>a.guided.items));balanceOptions(C.transferChecks.flatMap(s=>s.mc));
 C.auditCorrectionVersion='2026-09-17.1';
 const ear=C.labelDiagrams.find(d=>d.id==='ch12-reviewed-package-3');if(ear)ear.legend='Detailed cochlear chambers: L, scala vestibuli, is the upper vestibular canal; M, scala media, is the middle cochlear duct containing endolymph and the organ of Corti; R, scala tympani, is the lower tympanic canal. The upper and lower canals contain perilymph. The round window (S) is a membrane at the base of the cochlea that allows pressure displacement; it is not the lower wall of this enlarged cross-section.';
 for(const d of C.labelDiagrams){const number=Number(d.id.split('-').at(-1));if([1,3,5,7,8].includes(number)){const corrected=d.src.replace(/(?:_corrected)?\.png$/,'_corrected.png');d.src=corrected;d.reviewNote=number===7?'Water moves from collecting-duct lumen toward the blood. ADH is released from the posterior pituitary and increases water permeability.':number===8?'TRH stimulates the anterior pituitary to release TSH. Thyroxine inhibits hypothalamic and anterior-pituitary signalling.':number===1?'The optic disc is where the optic nerve exits the retina; the iris surrounds the pupil.':number===3?'The oval window receives the stapes vibration. The round window is at the cochlear base, not on the wall of the enlarged inset.':'D identifies pink thyroid tissue; E identifies the parathyroid nodules.';}}
}
