/* FL2-03 only: formative support, not grading. Existing course.js owns persistence. */
(()=>{'use strict';
 const root=document.getElementById('fl2-03');if(!root)return;
 const attempts=[...root.querySelectorAll('[data-pilot-attempt]')];
 const first=root.querySelector('[data-pilot-first]');
 const independent=root.querySelector('#fl2-03-stage-7');
 const save=(field,value)=>{field.value=value;field.dispatchEvent(new Event('input',{bubbles:true}));};
 function showFirst(){const out=root.querySelector('[data-pilot-first-display]');if(!first.value){out.textContent='No first comparison saved yet.';return;}try{const copy=JSON.parse(first.value);out.textContent=`${copy.partial?'Partial':'Complete'} first comparison · ${copy.at}\n\n`+copy.entries.map(e=>`${e.label}\n${e.value||'[Not entered yet]'}`).join('\n\n');}catch{out.textContent='The saved first copy could not be displayed. Keep your browser backup; it has not been replaced.';}}
 function capture(){if(first.value)return;const entries=[...independent.querySelectorAll('[data-final-field]')].map(f=>({key:f.dataset.saveKey,label:root.querySelector(`label[for="${f.id}"]`).textContent,value:f.value}));save(first,JSON.stringify({at:new Date().toISOString(),partial:entries.some(e=>!e.value.trim()),entries}));showFirst();}
 independent.querySelector('.authored-model summary').addEventListener('click',capture);
 document.addEventListener('calm:restore',showFirst);showFirst();
 const numbers=JSON.parse(root.querySelector('#fl2-03-number-hints').content.textContent);
 const controls=[...root.querySelectorAll('[data-pilot-question], [data-pilot-number], [data-pilot-guided]')];
 function wire(control,index,read,output,correct,hint,steps,worked,onCheck=()=>{}){
  const storage=attempts[index];const button=control.matches('[data-pilot-question]')?control.querySelector('[data-pilot-choice]'):control.matches('select')?document.createElement('button'):control;
  if(control.matches('select')){button.type='button';button.textContent='Check my choice';control.after(button,output);}
  const reveal=document.createElement('button');reveal.type='button';reveal.textContent='Show worked reasoning';reveal.hidden=true;output.after(reveal);
  let revealed=false;
  function record(){try{return storage.value?JSON.parse(storage.value):{last:null,wrong:0};}catch{return {last:null,wrong:0};}}
  function restore(){revealed=false;reveal.hidden=record().wrong<2;output.textContent='';}document.addEventListener('calm:restore',restore);
  button.addEventListener('click',()=>{const value=read();if(value===null){output.textContent='Enter or choose an answer first; a blank is not zero.';return;}onCheck();const state=record();if(correct(value)){output.textContent='This fits the supplied case. '+worked();reveal.hidden=true;return;}
   const revised=state.last!==value;if(revised){state.wrong=Math.min(2,state.wrong+1);state.last=value;save(storage,JSON.stringify(state));}revealed=false;reveal.hidden=state.wrong<2;
   output.textContent=(state.wrong<2?'Hint: ':'Try this method: ')+(state.wrong<2?hint(value):steps(value))+(revised?'':' Revise your answer before another check; this unchanged click is not a new try.')+(state.wrong>=2?' You may revise again or choose Show worked reasoning.':' Revise, then check again.');
  });reveal.addEventListener('click',()=>{onCheck();output.textContent='Worked reasoning: '+worked();revealed=true;});
  const inputs=control.matches('[data-pilot-question]')?[...control.querySelectorAll('input')]:[control.matches('select')?control:control.closest('.authored-field').querySelector('input')];inputs.forEach(f=>f.addEventListener('input',()=>{if(revealed||output.textContent)output.textContent='Your revised answer is ready to check.';revealed=false;}));restore();
 }
 controls.forEach((control,index)=>{
  if(control.matches('[data-pilot-question]')){const feedback=JSON.parse(control.querySelector('template[data-authored-feedback]').content.textContent);const hints=JSON.parse(control.querySelector('[data-pilot-hints]').content.textContent);wire(control,index,()=>control.querySelector('input:checked')?.value??null,control.querySelector('[data-choice-result]'),v=>v===control.dataset.correct,v=>hints[v]||'Find the matching evidence in the supplied record.',()=> 'Return to the row or agreement: identify what each amount represents before choosing. '+(control.dataset.pilotQuestion.endsWith('q2')?'Payment = interest + principal repaid.':''),()=>feedback[control.dataset.correct]);
  }else if(control.matches('select')){const out=document.createElement('p');out.setAttribute('role','status');const hints=['','A smaller payment does not mean less interest overall. Compare how long the debt remains.','Keeping the same principal but allowing more months spreads repayment. Check the monthly amount.','The period changed. Compare both the monthly payment and total-interest columns.'];wire(control,index,()=>control.value||null,out,v=>v==='0',v=>hints[Number(v)]||'Compare monthly payment and whole-loan cost separately.',()=> 'Read the 12-month and 24-month payment figures, then compare their total interest.',()=> 'The 24-month schedule has a lower regular payment ($47.07 rather than $88.85), but higher total interest ($129.79 rather than $66.19).');
  }else{const field=control.closest('.authored-field').querySelector('input');const data=numbers[field.dataset.saveKey];wire(control,index,()=>field.value.trim()!==''&&Number.isFinite(Number(field.value))?field.value:null,control.closest('.authored-field').querySelector('.field-feedback'),v=>Math.abs(Number(v)-Number(field.dataset.answer))<=Number(field.dataset.tolerance||.005),v=>data.special[String(Number(v))]||data.hint,()=>data.steps,()=>data.worked,()=>{if(independent.contains(field))capture();});}
 });
})();
