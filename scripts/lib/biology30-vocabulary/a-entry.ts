import {mountVocabularyPanel,type VocabularyFamily,type VocabularyTerm} from './panel.js';
import {mountAWordVocabulary} from './a-word-runtime.js';
type Bridge={unlocked(id:string):boolean;refresh():void;status():string;selectedFamilies():string[]};
const host=window as Window&{biologyVocabulary?:Bridge};
const payload=document.getElementById('bio-inline-vocabulary-data');
if(payload&&host.biologyVocabulary&&!mountAWordVocabulary(host.biologyVocabulary as never)){
  const data=JSON.parse(payload.textContent!) as {families:VocabularyFamily[];terms:VocabularyTerm[]},bridge=host.biologyVocabulary;
  mountVocabularyPanel({root:document.body,...data,
    sections:()=>Array.from(document.querySelectorAll('.course-page[id^="lesson-"] .learn-block,.course-page[id^="lesson-"] .advanced-learning-block,.course-page[id^="lesson-"] .worked-example')),
    route:section=>section.closest<HTMLElement>('.course-page')!.id,
    unlocked:bridge.unlocked,
    frayer:id=>document.querySelector<HTMLElement>(`[data-frayer="${CSS.escape(id)}"]`),
    choices:()=>document.querySelector<HTMLElement>('[data-a-frayer-choices]'),
    refresh:bridge.refresh,status:bridge.status,
    selectedFamilies:bridge.selectedFamilies,
  });
}
