/* Scoped Issue 1 reader and vocabulary views. Visible content and real fields stay in HTML. */
(() => {
  'use strict';
  const SOURCES=[{"label":"Chapter 18","path":"assets/imported/course/сontent/ic59edce5-277c-4da3-a0c9-ba2eed67a671/SS101GlobalTextPDF/Chap18_Civic.pdf","start":376,"end":397,"offset":375,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Chapter 6","path":"assets/imported/course/сontent/ibc1973ba-70da-43f3-a32d-724044cd0c97/SS101GlobalTextPDF/Chap6_Contact.pdf","start":116,"end":133,"offset":115,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Chapter 2","path":"assets/imported/course/сontent/i2f5e9c7f-07c5-4d28-bdc5-1ace0498c469/SS101GlobalTextPDF/Chap2_Identity.pdf","start":26,"end":45,"offset":25,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Chapter 13","path":"assets/imported/course/сontent/i31447cd0-fd56-4e8f-9c24-2908bfb0af22/SS101GlobalTextPDF/Chap13_Impacts.pdf","start":268,"end":287,"offset":267,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Chapter 16","path":"assets/imported/course/сontent/ica468936-689b-4a4d-a9d5-525577bd0e54/SS101GlobalTextPDF/Chap16_Society.pdf","start":336,"end":353,"offset":335,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Chapter 8","path":"assets/imported/course/сontent/i6fd0ba73-878c-4db5-bbbe-85097cb47177/SS101GlobalTextPDF/Chap8_Practices.pdf","start":158,"end":179,"offset":157,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Chapter 12","path":"assets/imported/course/сontent/i4b91665f-30b4-4cef-b02d-1246be1061bc/SS101GlobalTextPDF/Chap12_Economic.pdf","start":248,"end":267,"offset":247,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Chapter 4","path":"assets/imported/course/сontent/ia7e80143-0254-47e7-b388-3901d29d8a6c/SS101GlobalTextPDF/Chap4_Challenges.pdf","start":70,"end":91,"offset":69,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Chapter 9","path":"assets/imported/course/сontent/i7570556a-6fb5-4bf9-8a70-9ee74a1537b5/SS101GlobalTextPDF/Chap9_Historical.pdf","start":180,"end":201,"offset":179,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Chapter 11","path":"assets/imported/course/сontent/i45aa9efe-31bc-4949-bf28-772bc6742125/SS101GlobalTextPDF/Chap11_Expansion.pdf","start":226,"end":247,"offset":225,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Chapter 7","path":"assets/imported/course/сontent/i3eb8e80a-b9be-44c5-a25f-3fef6c4fb9e7/SS101GlobalTextPDF/Chap7_Imperialism.pdf","start":134,"end":157,"offset":133,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Chapter 14","path":"assets/imported/course/сontent/idfad8fc4-7a89-4bae-be8f-7e78a9f4173d/SS101GlobalTextPDF/Chap14_Prosperity.pdf","start":288,"end":309,"offset":287,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Chapter 3","path":"assets/imported/course/сontent/ie3df63e5-cbed-4242-a6e9-5acb03e8ffc1/SS101GlobalTextPDF/Chap3_Technologies.pdf","start":46,"end":69,"offset":45,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Chapter 17","path":"assets/imported/course/сontent/i35c70e63-2fdc-473a-9f2b-94ea1119fb09/SS101GlobalTextPDF/Chap17_Communities.pdf","start":354,"end":375,"offset":353,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Chapter 19","path":"assets/imported/course/сontent/i9a04f6f8-34f1-4063-9593-c8fb14885b37/SS101GlobalTextPDF/Chap19_Citizenship.pdf","start":398,"end":421,"offset":397,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Chapter 5","path":"assets/imported/course/сontent/i2a20b375-2379-4fc9-b8a1-bb31b4893ca7/SS101GlobalTextPDF/Chap5_Opportunities.pdf","start":92,"end":111,"offset":91,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Chapter 1","path":"assets/imported/course/сontent/i0cc582a3-d2e6-47e3-8c5c-1bb2e74f274e/SS101GlobalTextPDF/Chap1_Understandings.pdf","start":6,"end":25,"offset":5,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1.05},{"label":"Chapter 10","path":"assets/imported/course/сontent/i9a54c164-56e3-456c-94a2-310151fcf438/SS101GlobalTextPDF/Chap10_Globalization.pdf","start":206,"end":225,"offset":205,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Chapter 15","path":"assets/imported/course/сontent/ia3683a36-c53b-4403-8e51-a415a96e8ea3/SS101GlobalTextPDF/Chap15_Democratization.pdf","start":316,"end":335,"offset":315,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1}];
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
