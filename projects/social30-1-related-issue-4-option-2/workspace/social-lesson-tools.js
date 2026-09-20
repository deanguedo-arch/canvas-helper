/* Scoped Issue 1 reader and vocabulary views. Visible content and real fields stay in HTML. */
(() => {
  'use strict';
  const SOURCES=[{"label":"Part 1","path":"assets/resources/textbook/Part1-69b54f35.pdf","start":2,"end":3,"offset":1,"mappingVerification":"Verified printed-to-physical offsets from the representative Issue 1 source receipt","copiedFrom":"projects/social30-1-related-issue-1-option-2/workspace/assets/resources/textbook/Part1-69b54f35.pdf","sha256":"b3d2b4e61af71059709eb0ee8dc603f3f8ed1172e9cab85bc0e55b6b01b4aa79"},{"label":"Introduction","path":"assets/resources/textbook/Intro-1548c73a.pdf","start":4,"end":19,"offset":3,"mappingVerification":"Verified printed-to-physical offsets from the representative Issue 1 source receipt","copiedFrom":"projects/social30-1-related-issue-1-option-2/workspace/assets/resources/textbook/Intro-1548c73a.pdf","sha256":"3305d86d4c7936e94d8be8408182411424a7c7b0742904d164c22e72db80ff24"},{"label":"Chapter 1","path":"assets/resources/textbook/Ch01-0ee8080c.pdf","start":20,"end":61,"offset":19,"mappingVerification":"Verified printed-to-physical offsets from the representative Issue 1 source receipt","copiedFrom":"projects/social30-1-related-issue-1-option-2/workspace/assets/resources/textbook/Ch01-0ee8080c.pdf","sha256":"4785f6e5caa0ea7159da08f4e2f06bc2d6edc0586c63ec699c1cfb179bccfe0e"},{"label":"Chapter 2","path":"assets/resources/textbook/Ch02-b98b4b3d.pdf","start":62,"end":99,"offset":61,"mappingVerification":"Verified printed-to-physical offsets from the representative Issue 1 source receipt","copiedFrom":"projects/social30-1-related-issue-1-option-2/workspace/assets/resources/textbook/Ch02-b98b4b3d.pdf","sha256":"0309ad1d371e3fd57dd9081f5c07dcab968b3d618aaf8e919283656b2122418f"},{"label":"Part 2","path":"assets/resources/textbook/Part2chpt3-96a917c8.pdf","start":100,"end":101,"offset":99,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1,"copiedFrom":"projects/social30-1-related-issue-2-option-2/workspace/assets/resources/textbook/Part2chpt3-96a917c8.pdf","sha256":"df986a55472131caf579f79a1e66d8fd8d9ba861eecd34aa9454d3e3588ccd91"},{"label":"Chapter 3","path":"assets/resources/textbook/Ch03-3d887cc3.pdf","start":102,"end":127,"offset":101,"mappingVerification":"Verified printed-to-physical offsets from the representative Issue 1 source receipt","copiedFrom":"projects/social30-1-related-issue-1-option-2/workspace/assets/resources/textbook/Ch03-3d887cc3.pdf","sha256":"ab3cca47c8071c90ea87d13d362b660c1a46feaa6d1c171ef567964c353c94b2"},{"label":"Chapter 4","path":"assets/resources/textbook/Ch04-311be6cc.pdf","start":128,"end":163,"offset":127,"mappingVerification":"Verified printed-to-physical offsets from the representative Issue 1 source receipt","copiedFrom":"projects/social30-1-related-issue-1-option-2/workspace/assets/resources/textbook/Ch04-311be6cc.pdf","sha256":"57d9242d9f097e4f68cad8d0d6b0a7be94fe12c480f9b759610f6a960bc424d7"},{"label":"Chapter 5","path":"assets/resources/textbook/Ch05-e17a6e76.pdf","start":164,"end":195,"offset":163,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1,"copiedFrom":"projects/social30-1-related-issue-2-option-2/workspace/assets/resources/textbook/Ch05-e17a6e76.pdf","sha256":"4517b72778f2bc2ffa19708bbeaa92094247eaf18ca20a4e7ccf98b6ba9fc407"},{"label":"Chapter 6","path":"assets/resources/textbook/Ch06-838e167a.pdf","start":196,"end":231,"offset":195,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1,"copiedFrom":"projects/social30-1-related-issue-2-option-2/workspace/assets/resources/textbook/Ch06-838e167a.pdf","sha256":"4fc74f7a1b5eb4692ffcb83b7383684c5c54d5728ee54fac12f45b2c57c08dc5"},{"label":"Chapter 7","path":"assets/resources/textbook/Ch07-79871d63.pdf","start":232,"end":271,"offset":231,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1,"copiedFrom":"projects/social30-1-related-issue-2-option-2/workspace/assets/resources/textbook/Ch07-79871d63.pdf","sha256":"2faa5bec618efaf484bcbb2a8bd832977d1a42b65cc31a4892165d045380fd41"},{"label":"Chapter 8","path":"assets/resources/textbook/Ch08-fad4035b.pdf","start":272,"end":299,"offset":271,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1,"copiedFrom":"projects/social30-1-related-issue-2-option-2/workspace/assets/resources/textbook/Ch08-fad4035b.pdf","sha256":"1dbda9e75b67ab490fd4d78a72979286036ceee67375d72d62462f2f39d61463"},{"label":"Part 3","path":"assets/resources/textbook/Part3-5d80e7a8.pdf","start":300,"end":301,"offset":299,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1,"copiedFrom":"projects/social30-1-related-issue-3-option-2/workspace/assets/resources/textbook/Part3-5d80e7a8.pdf","sha256":"bf5abdc5df515bd3a6dd0666bfb1f9bf45be41b56ca64fd6460a3d16c66effd8"},{"label":"Chapter 9","path":"assets/resources/textbook/Ch09-eb8720b8.pdf","start":302,"end":331,"offset":301,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1,"copiedFrom":"projects/social30-1-related-issue-3-option-2/workspace/assets/resources/textbook/Ch09-eb8720b8.pdf","sha256":"aa3dab7c0055e3ec1175b7677da0028ccb1b6c47fbe8b78b32732e8d28c5008f"},{"label":"Chapter 10","path":"assets/resources/textbook/Ch10-5bee649c.pdf","start":332,"end":367,"offset":331,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1,"copiedFrom":"projects/social30-1-related-issue-3-option-2/workspace/assets/resources/textbook/Ch10-5bee649c.pdf","sha256":"a84bd5dd8b862ee358c38e11a22dd7694fd6c3eb02672ee70ecd44421fee941b"},{"label":"Chapter 11","path":"assets/resources/textbook/Ch11-2ea02069.pdf","start":368,"end":405,"offset":367,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1,"copiedFrom":"projects/social30-1-related-issue-3-option-2/workspace/assets/resources/textbook/Ch11-2ea02069.pdf","sha256":"12aa11bac09f3680e698f93b24a3f1d8503a35e1540ed928ea4756c6ea15e6fa"},{"label":"Chapter 12","path":"assets/resources/textbook/Ch12-b8b054ec.pdf","start":406,"end":439,"offset":405,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1,"copiedFrom":"projects/social30-1-related-issue-3-option-2/workspace/assets/resources/textbook/Ch12-b8b054ec.pdf","sha256":"85b5a50108279afbe9e7792257f34d32377ea7d04d4581ca5a5e0c09023a93f6"},{"label":"Part 4","path":"assets/resources/textbook/Part4-c3052ae1.pdf","start":440,"end":441,"offset":439,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Chapter 13","path":"assets/resources/textbook/Ch13-11fec3d7.pdf","start":442,"end":475,"offset":441,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Chapter 14","path":"assets/resources/textbook/Ch14-8ef8eac7.pdf","start":476,"end":511,"offset":475,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Closing reflection","path":"assets/resources/textbook/Closer-3b7da5f7.pdf","start":512,"end":515,"offset":511,"mappingVerification":"Consistent printed header/footer numerals across PDF pages","matchingNumerals":1},{"label":"Glossary","path":"assets/resources/textbook/Glossary-c49b6308.pdf","start":516,"end":523,"offset":515,"mappingVerification":"All eight printed footer page numerals match physical PDF pages plus 515.","matchingNumerals":1}];
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
