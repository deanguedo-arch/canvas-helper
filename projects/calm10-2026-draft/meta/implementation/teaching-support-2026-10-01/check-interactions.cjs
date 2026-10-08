const {chromium}=require('playwright'),fs=require('fs'),assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch(),context=await browser.newContext({viewport:{width:1280,height:850}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));const url='http://127.0.0.1:4193/after/index.html#ce1-01';
 try {
  await page.goto(url);await page.waitForTimeout(200);
  const result=await page.evaluate(()=>{
   let checks=0,itemsChecked=0;const failures=[];
   const ok=(v,m)=>{checks++;if(!v)failures.push(m);};
   for(const template of document.querySelectorAll('template[data-learning-support]')) {
    const root=template.parentElement,config=JSON.parse(template.content.textContent);
    for(const [index,item] of config.items.entries()) {
     itemsChecked++;const control=root.querySelector(`[data-support-item="${index}"]`),attempt=[...root.querySelectorAll('[data-learning-support-fields] input')].find(f=>f.dataset.saveKey===item.attempt);
     let button,output,fields;
     if(item.kind==='choice'){button=control.querySelector('[data-check-choice],[data-support-check]');output=control.querySelector('[data-choice-result],[data-review-feedback],[data-feedback]');fields=[...control.querySelectorAll('input[type=radio]')];}
     else if(item.kind==='select'){fields=[control];button=root.id==='co1-01'?root.querySelector('#co1-01-review-check-match'):control.nextElementSibling;output=root.id==='co1-01'?root.querySelector('#co1-01-review-match-feedback'):button.nextElementSibling;}
     else {button=control;fields=(item.fields||[item.field]).map(id=>root.querySelector(`[id="${id}"]`));output=item.output?root.querySelector(`[id="${item.output}"]`):control.nextElementSibling?.matches('[data-support-number-output]')?control.nextElementSibling:control.closest('.authored-field')?.querySelector('.field-feedback');}
     const reveal=output.nextElementSibling;
     const change=(values)=>{fields.forEach((f,i)=>{if(item.kind==='choice'){f.checked=f.value===values;f.dispatchEvent(new Event('change',{bubbles:true}));}else {f.value=String(Array.isArray(values)?values[i]:values);f.dispatchEvent(new Event(f.tagName==='SELECT'?'change':'input',{bubbles:true}));}})};
     let wrong,second,good;
     if(item.kind==='choice'){const bad=fields.filter(f=>f.value!==String(item.correct)).map(f=>f.value);[wrong,second]=bad;good=String(item.correct);}
     else if(item.kind==='select'){const bad=[...control.options].filter(o=>o.value&&o.value!==String(item.correct)).map(o=>o.value);[wrong,second]=bad;good=String(item.correct);}
     else if(item.kind==='number'){wrong=item.correct+10;second=item.correct+20;good=item.correct;}
     else if(item.kind==='flexible'){wrong=[70,35];second=[60,30];good=[30,20];}
     else {good=item.answers.map(a=>a===null?'The given model is conditional.':a);wrong=good.map((v,i)=>typeof item.answers[i]==='number'?v+10:v);second=good.map((v,i)=>typeof item.answers[i]==='number'?v+20:v);}
     change(wrong);button.click();ok(output.textContent.startsWith('Hint: '),'First hint '+item.key);ok(!output.textContent.includes('undefined'),'Hint defined '+item.key);ok(reveal.hidden,'No immediate worked answer '+item.key);ok(JSON.parse(attempt.value).wrong===1,'First count '+item.key);
     button.click();ok(JSON.parse(attempt.value).wrong===1,'Same answer unchanged '+item.key);ok(output.textContent.startsWith('Hint: '),'Same answer hint '+item.key);
     if(second!==undefined){change(second);button.click();ok(output.textContent.startsWith('Use this method: '),'Revised method '+item.key);ok(JSON.parse(attempt.value).wrong===2,'Second count '+item.key);ok(!reveal.hidden,'Explicit worked button '+item.key);reveal.click();ok(output.textContent===item.worked,'Worked reasoning '+item.key);}
     change(good);button.click();ok(output.textContent===item.worked,'Correct explanation '+item.key);ok(output.classList.contains('good'),'Correct status '+item.key);
    }
   }
   return {checks,itemsChecked,failures};
  });
  assert.deepEqual(result.failures,[]);assert.equal(result.itemsChecked,396);
  await page.waitForTimeout(400);
  const namespace='calm10-2026-draft:review-after:learning:v3';
  let saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),namespace);
  assert(saved);assert.equal(Object.keys(saved.responses).filter(k=>k.startsWith('support:')&&k.includes(':attempt:')).length,396);
  // Existing completion/history records coexist with new attempt fields.
  await page.evaluate(key=>{
   const root=document.getElementById('co1-01');root.querySelectorAll('[data-final-field]').forEach(f=>{f.value=f.tagName==='SELECT'?[...f.options].find(o=>o.value)?.value:'At the school fundraiser, Rowan divided tasks and the team finished before the doors opened.';f.dispatchEvent(new Event('input',{bubbles:true}));});root.querySelectorAll('[data-signoff]').forEach(f=>{f.checked=true;f.dispatchEvent(new Event('input',{bubbles:true}));});root.querySelector('[data-complete-lesson]').click();
   const s=JSON.parse(localStorage.getItem(key));s.responses['previous:retained']='Retain this unknown earlier entry';s.responseHistory['evidence:co1-01']=[{version:'prior-wording',value:'Earlier answer',prompt:'Prior wording',label:'Earlier response'}];localStorage.setItem(key,JSON.stringify(s));
  },namespace);
  await page.reload();await page.waitForTimeout(200);
  assert.equal(await page.locator('.nav-link[data-page-target="co1-01"]').evaluate(e=>e.classList.contains('lesson-complete')),true);
  assert.equal(await page.locator('[data-save-key="support:ce1-01:attempt:practice:ce1-01:q1"]').inputValue(),saved.responses['support:ce1-01:attempt:practice:ce1-01:q1']);
  // First copy is explicit, captures partial work and never overwrites it.
  const copyResult=await page.evaluate(()=>{
   let checks=0;const failures=[],ok=(v,m)=>{checks++;if(!v)failures.push(m)};
   for(const template of document.querySelectorAll('template[data-learning-support]')) {
    const root=template.parentElement,fields=[...root.querySelectorAll('[data-final-field]')],first=root.querySelector('[data-support-first]');
    first.value='';fields.forEach(f=>{f.value='';f.dispatchEvent(new Event('input',{bubbles:true}))});root.querySelector('[data-support-review]').click();ok(!first.value,'No empty copy '+root.id);
    const f=fields[0];f.value=f.tagName==='SELECT'?[...f.options].find(o=>o.value)?.value:f.type==='number'?'1':'First attempt text';f.dispatchEvent(new Event('input',{bubbles:true}));root.querySelector('[data-support-review]').click();
    const copy=JSON.parse(first.value),original=first.value;ok(copy.entries.length===fields.length,'All final entries '+root.id);ok(copy.entries[0].value===f.value,'Current value '+root.id);ok(copy.partial===(fields.length>1),'Partial label '+root.id);
    f.value=f.tagName==='SELECT'?f.value:f.type==='number'?'2':'A revised independent response';f.dispatchEvent(new Event('input',{bubbles:true}));root.querySelector('[data-support-review]').click();ok(first.value===original,'Copy immutable '+root.id);ok(root.querySelector('[data-support-first-display]').textContent.includes(copy.entries[0].display),'Copy displayed '+root.id);
   }
   return {checks,failures};
  });assert.deepEqual(copyResult.failures,[]);
  await page.waitForTimeout(400);await page.reload();await page.waitForTimeout(150);
  saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),namespace);
  assert.equal(saved.responses['previous:retained'],'Retain this unknown earlier entry');assert.equal(saved.responseHistory['evidence:co1-01'][0].value,'Earlier answer');
  assert.equal(await page.locator('[data-support-first]').evaluateAll(fields=>fields.filter(f=>!!f.value).length),39);
  const isolation=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('calm10-2026-draft:')&&!k.includes(':review-after:')));assert.deepEqual(isolation,[]);
  assert.deepEqual(errors,[]);
  const report={supportChecks:result.checks,controls:result.itemsChecked,firstCopyChecks:copyResult.checks,restoreAndHistoryChecks:9,runtimeErrors:errors,reviewStorageIsolated:true};fs.writeFileSync(__dirname+'/interactions.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
