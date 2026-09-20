/* Scoped Issue 1 reader and vocabulary views. Visible content and real fields stay in HTML. */
(() => {
  'use strict';
  const SOURCES=[{"label":"Chapter 8","path":"assets/imported/unit2/Textbook/ch08.pdf","start":180,"end":203,"offset":179,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.9583333333333334},{"label":"Chapter 7","path":"assets/imported/unit2/Textbook/ch07.pdf","start":158,"end":179,"offset":157,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.9545454545454546},{"label":"Chapter 6","path":"assets/imported/unit2/Textbook/ch06.pdf","start":136,"end":157,"offset":135,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.9545454545454546},{"label":"Chapter 4","path":"assets/imported/unit2/Textbook/ch04.pdf","start":88,"end":109,"offset":87,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.9545454545454546},{"label":"Chapter 5","path":"assets/imported/unit2/Textbook/ch05.pdf","start":114,"end":135,"offset":113,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.9545454545454546},{"label":"Chapter 15","path":"assets/imported/unit4/Textbook/ch15.pdf","start":342,"end":365,"offset":341,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.9583333333333334},{"label":"Chapter 14","path":"assets/imported/unit4/Textbook/ch14.pdf","start":320,"end":341,"offset":319,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.9545454545454546},{"label":"Chapter 16","path":"assets/imported/unit4/Textbook/ch16.pdf","start":366,"end":387,"offset":365,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.9545454545454546},{"label":"Chapter 2","path":"assets/imported/unit4/Textbook/ch02.pdf","start":42,"end":65,"offset":41,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.9583333333333334},{"label":"Chapter 3","path":"assets/imported/unit4/Textbook/ch03.pdf","start":66,"end":87,"offset":65,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.9545454545454546},{"label":"Chapter 13","path":"assets/imported/unit4/Textbook/ch13.pdf","start":298,"end":319,"offset":297,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.9545454545454546},{"label":"Chapter 9","path":"assets/imported/unit3/Textbook/ch09.pdf","start":208,"end":229,"offset":207,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.9545454545454546},{"label":"Chapter 1","path":"assets/imported/unit1/Textbook/ch01.pdf","start":18,"end":41,"offset":17,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.9583333333333334},{"label":"Chapter 10","path":"assets/imported/unit3/Textbook/ch010.pdf","start":230,"end":251,"offset":229,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.9545454545454546},{"label":"Chapter 11","path":"assets/imported/unit3/Textbook/ch011.pdf","start":252,"end":271,"offset":251,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.95},{"label":"Chapter 12","path":"assets/imported/unit3/Textbook/ch012.pdf","start":272,"end":293,"offset":271,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.9545454545454546},{"label":"Related Issue 1","path":"assets/imported/d2l/Content/Exploring Nationalism Related Issue 1.pdf","start":14,"end":17,"offset":13,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.75},{"label":"Related Issue 2","path":"assets/imported/d2l/Content/Exploring Nationalism Related Issue 2.pdf","start":110,"end":113,"offset":109,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.75},{"label":"Related Issue 3","path":"assets/imported/d2l/Content/Exploring Nationalism Related Issue 3.pdf","start":204,"end":207,"offset":203,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.75},{"label":"Related Issue 4","path":"assets/imported/d2l/Content/Exploring Nationalism Related Issue 4.pdf","start":294,"end":297,"offset":293,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":0.75},{"label":"Prologue","path":"assets/imported/d2l/Exploring Nationalism Related Issue 1 - Prologue.pdf","start":1,"end":13,"offset":0,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1}];
  const reader=document.querySelector('.social-textbook-dialog');
  const vocabulary=document.querySelector('.social-vocabulary-dialog');
  const slot=vocabulary.querySelector('[data-vocabulary-frayer-slot]');
  let loan=null,marker=null;
  const states=new WeakMap();
  function open(dialog,trigger){
    if(dialog.open)return;
    states.set(dialog,{trigger:trigger||document.activeElement,x:scrollX,y:scrollY,overflow:document.documentElement.style.overflow});
    dialog.showModal();document.documentElement.style.overflow='hidden';
  }
  function restoreLoan(){if(loan&&marker){marker.replaceWith(loan);loan=null;marker=null;}}
  for(const dialog of [reader,vocabulary]){
    dialog.querySelector('[data-dialog-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>{
      if(dialog===vocabulary)restoreLoan();
      if(dialog===reader)reader.querySelector('iframe').removeAttribute('src');
      const state=states.get(dialog);if(!state)return;
      document.documentElement.style.overflow=state.overflow;window.scrollTo(state.x,state.y);
      if(state.trigger?.isConnected)state.trigger.focus({preventScroll:true});
    });
  }
  const available=SOURCES.slice().sort((a,b)=>a.start-b.start).reduce((out,source)=>{const last=out.at(-1);if(last&&source.start<=last.end+1)last.end=Math.max(last.end,source.end);else out.push({start:source.start,end:source.end});return out;},[]);
  const ranges=available.map(s=>s.start===s.end?String(s.start):`${s.start}–${s.end}`).join(', ');
  function goToPage(value,trigger){
    const page=Number(value),source=SOURCES.find(s=>Number.isInteger(page)&&page>=s.start&&page<=s.end);
    const message=reader.querySelector('[data-textbook-message]');
    if(!source){
      reader.querySelector('iframe').removeAttribute('src');
      reader.querySelector('[data-textbook-fallback]').hidden=true;
      reader.querySelector('[data-textbook-location]').textContent='No available page selected';
      message.textContent=`Page ${value||'—'} is not available in this issue. Available printed pages: ${ranges}.`;
      if(!reader.open)open(reader,trigger);
      return;
    }
    const physical=page-source.offset;
    reader.querySelector('[data-textbook-location]').textContent=`${source.label} · printed page ${page}`;
    reader.querySelector('[data-textbook-input]').value=page;
    const url=`${source.path}?readerPage=${physical}#page=${physical}&view=FitH`;
    reader.querySelector('[data-textbook-frame]').src=url;
    reader.querySelector('[data-textbook-fallback]').href=url;
    reader.querySelector('[data-textbook-fallback]').hidden=false;
    message.textContent=`Viewing PDF page ${physical}. Available printed pages: ${ranges}.`;
    if(!reader.open)open(reader,trigger);
  }
  reader.querySelector('form').addEventListener('submit',event=>{event.preventDefault();goToPage(reader.querySelector('input').value);});
  function showWord(wordId,trigger){
    const record=document.querySelector(`[data-vocabulary-record="${wordId}"]`);if(!record)return;
    restoreLoan();
    vocabulary.querySelector('h2').textContent=record.querySelector('h3').textContent;
    const meaning=record.querySelector('[data-vocabulary-definition]').cloneNode(true);meaning.removeAttribute('data-vocabulary-definition');
    vocabulary.querySelector('[data-vocabulary-meaning]').replaceChildren(meaning);
    loan=record.querySelector('[data-frayer-owner]');marker=document.createComment('Canonical Frayer home');loan.before(marker);slot.append(loan);
    if(!vocabulary.open)open(vocabulary,trigger);
  }
  const groups={overview:'overview',lessons:'student-work','issue-inquiry':'student-tools','core-vocabulary':'student-tools','source-analysis':'student-tools','position-builder':'student-tools','film-room':'student-tools','evidence-bank':'process-collection','textbook-practice':'student-tools',library:'resources','study-guide':'resources',resources:'resources'};
  function syncGroups(route){
    const active=groups[route]||(route.startsWith('lesson-')?'student-work':'overview');
    document.querySelectorAll('[data-social-nav-group]').forEach(group=>{
      const opened=group.dataset.socialNavGroup===active;group.classList.toggle('is-open',opened);
      const toggle=group.querySelector('[data-social-nav-toggle]');toggle.setAttribute('aria-expanded',String(opened));toggle.querySelector('span').textContent=opened?'−':'+';
    });
    document.querySelectorAll('.course-nav [data-page-target]').forEach(link=>{if(link.classList.contains('active'))link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
  }
  const originalShowPage=showPage;
  showPage=function(route){
    if(vocabulary.open)vocabulary.close();if(reader.open)reader.close();
    originalShowPage(route);syncGroups(route==='lessons'?lessonIds[0]:route||'overview');
  };
  document.addEventListener('click',event=>{
    const toggle=event.target.closest('[data-social-nav-toggle]');if(toggle){
      const group=toggle.closest('[data-social-nav-group]'),opened=!group.classList.contains('is-open');
      group.classList.toggle('is-open',opened);toggle.setAttribute('aria-expanded',String(opened));toggle.querySelector('span').textContent=opened?'−':'+';return;
    }
    const term=event.target.closest('[data-vocabulary-term]');if(term){event.preventDefault();showWord(term.dataset.vocabularyTerm,term);return;}
    const browse=event.target.closest('[data-textbook-browse]');if(browse){event.preventDefault();reader.querySelector('[data-textbook-input]').value='';reader.querySelector('iframe').removeAttribute('src');reader.querySelector('[data-textbook-fallback]').hidden=true;reader.querySelector('[data-textbook-location]').textContent='Choose a printed page';reader.querySelector('[data-textbook-message]').textContent=`Enter a printed page to open the textbook. Available printed pages: ${ranges}.`;open(reader,browse);reader.querySelector('[data-textbook-input]').focus();return;}
    const reading=event.target.closest('[data-textbook-page]');if(reading){event.preventDefault();goToPage(reading.dataset.textbookPage,reading);return;}
    if(event.target.closest('.course-nav [data-page-target]')&&matchMedia('(max-width:760px)').matches){document.body.classList.add('sidebar-collapsed');}
  });
  const core=document.querySelector('#core-vocabulary');
  const records=[...core.querySelectorAll('[data-vocabulary-record]')];
  const choices=[...core.querySelectorAll('[data-vocabulary-choose]')];
  const search=core.querySelector('[data-vocabulary-search]');
  const topic=core.querySelector('[data-vocabulary-topic]');
  let selectedWord=choices[0]?.dataset.vocabularyChoose;
  const normalize=value=>value.toLocaleLowerCase().replace(/\s+/g,' ').trim();
  function selectWord(wordId){
    selectedWord=wordId;
    records.forEach(record=>record.hidden=record.dataset.vocabularyRecord!==wordId);
    choices.forEach(choice=>choice.setAttribute('aria-pressed',String(choice.dataset.vocabularyChoose===wordId)));
    core.querySelector('[data-vocabulary-empty]').hidden=Boolean(wordId);
  }
  function filterWords(){
    const query=normalize(search.value),wanted=topic.value;
    let count=0;
    choices.forEach(choice=>{
      const record=records.find(record=>record.dataset.vocabularyRecord===choice.dataset.vocabularyChoose);
      const text=normalize(record.querySelector('h3').textContent+' '+record.querySelector('[data-vocabulary-definition]').textContent);
      choice.hidden=Boolean((query&&!text.includes(query))||(wanted!=='all'&&record.dataset.vocabularyRecordTopic!==wanted));
      if(!choice.hidden)count++;
    });
    core.querySelectorAll('[data-vocabulary-category]').forEach(category=>category.hidden=![...category.querySelectorAll('[data-vocabulary-choose]')].some(choice=>!choice.hidden));
    core.querySelector('[data-vocabulary-count]').textContent=`${count} matching terms`;
    if(!choices.some(choice=>!choice.hidden&&choice.dataset.vocabularyChoose===selectedWord))selectWord(choices.find(choice=>!choice.hidden)?.dataset.vocabularyChoose);
  }
  core.addEventListener('click',event=>{
    const choice=event.target.closest('[data-vocabulary-choose]');if(choice){
      selectWord(choice.dataset.vocabularyChoose);
      if(matchMedia('(max-width:1000px)').matches)records.find(record=>!record.hidden)?.scrollIntoView({block:'start'});
    }
  });
  search.addEventListener('input',filterWords);topic.addEventListener('change',filterWords);
  selectWord(selectedWord);filterWords();
  const sidebar=document.querySelector('.course-sidebar');
  const phone=matchMedia('(max-width:760px)');
  function syncDrawer(){
    const collapsed=document.body.classList.contains('sidebar-collapsed');
    sidebar.inert=phone.matches&&collapsed;
    document.querySelectorAll('#sidebar-toggle,#topbar-menu-toggle').forEach(button=>{
      button.setAttribute('aria-controls','course-sidebar');button.setAttribute('aria-expanded',String(!collapsed));
    });
  }
  new MutationObserver(syncDrawer).observe(document.body,{attributes:true,attributeFilter:['class']});
  phone.addEventListener('change',()=>{if(phone.matches)document.body.classList.add('sidebar-collapsed');syncDrawer();});
  syncDrawer();
  syncGroups((location.hash||'#overview').slice(1));
  if(matchMedia('(max-width:760px)').matches)document.body.classList.add('sidebar-collapsed');
})();
