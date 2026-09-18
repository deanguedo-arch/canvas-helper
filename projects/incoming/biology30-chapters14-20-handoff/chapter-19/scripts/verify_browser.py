#!/usr/bin/env python3
"""DOM/interaction tests on an in-memory document with an explicit storage double.
This is NOT a test of real-origin localStorage, file:// launching or Brightspace.
"""
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import json,traceback,os
R=Path(__file__).resolve().parents[1];V=R/'verification';S=V/'screenshots';S.mkdir(exist_ok=True)
text=(R/'portable/Biology30_Chapter19.html').read_text()
shim="""<script>window.__testStorage=new Map();window.__testFailSave=false;Object.defineProperty(window,'localStorage',{value:{getItem:k=>__testStorage.get(k)||null,setItem:(k,v)=>{if(__testFailSave)throw new Error('Simulated quota failure');__testStorage.set(k,String(v));},removeItem:k=>__testStorage.delete(k)}});</script>"""
text=text.replace('<head>','<head>'+shim,1)
results={'environment':'Chromium, in-memory about:blank with explicit Map-backed storage test double. No true-origin persistence or LMS assertion.','tests':[],'pageErrors':[]}
def record(name,ok,details=''):
 results['tests'].append({'name':name,'status':'passed'if ok else'failed','details':details});print(name,ok,details[:150])
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('BIOLOGY_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1469,'height':902});page.on('pageerror',lambda err:results['pageErrors'].append(str(err)))
 page.set_default_timeout(4000)
 page.set_content(text,wait_until='domcontentloaded',timeout=45000);page.evaluate('document.fonts.ready');page.wait_for_timeout(600)
 try:
  conf=page.evaluate('BIOLOGY_HTML.getConfig()');record('runtime_initialises',conf['chapter']==19, str(len(conf['checks']))+' required checks')
  record('22_routes',page.locator('.course-page').count()==22)
  page.screenshot(path=str(S/'overview-1469.png'))
  routes=page.locator('.course-page').evaluate_all('(els)=>els.map(x=>x.id)');matrix=[]
  for id in routes:
   page.evaluate('(id)=>{location.hash=id;}',id);page.wait_for_timeout(50)
   visible=page.locator('.course-page:not([hidden])').get_attribute('id')
   matrix.append({'route':id,'visibleRoute':visible,'passed':visible==id})
  record('all_routes_open',all(x['passed']for x in matrix));(V/'surface-matrix.json').write_text(json.dumps(matrix,indent=2))
  # Scope/default option contracts and referenced vocabulary.
  unknown=page.evaluate('''()=>[...document.querySelectorAll('[data-term-id]')].filter(el=>!BIOLOGY_HTML.getConfig().words.some(w=>w.id===el.dataset.termId)).map(el=>el.dataset.termId)''');record('vocabulary_links_resolve',not unknown,str(unknown))
  # Required first lesson: blank, wrong, correct, written gate/save/draft/finish.
  page.evaluate("location.hash='lesson-01'");page.wait_for_timeout(80)
  sec=page.locator('[data-check-id="ch19-check-01"]');sec.evaluate('(el)=>el.closest("details").open=true')
  sec.locator('[data-start-check]').click();spec=conf['checks'][0]
  sec.locator('[data-check-answer]').first.click();record('blank_check_blocked',len(page.evaluate('BIOLOGY_HTML.getSnapshot().checks["ch19-check-01"].mc')[spec['mc'][0]['id']]['attempts'])==0)
  q=spec['mc'][0];wrong=next(x for x in q['options']if x!=q['answer']);page.locator(f'[data-check-choice="{q["id"]}"]').filter().evaluate_all('(els,answer)=>els.find(x=>x.value===answer).click()',wrong);page.locator(f'[data-check-answer="{q["id"]}"]').click()
  record('wrong_first_hint', 'Hint:'in sec.locator('[data-feedback]').first.inner_text())
  for q in spec['mc']:
   page.locator(f'[data-check-choice="{q["id"]}"]').evaluate_all('(els,answer)=>els.find(x=>x.value===answer).click()',q['answer']);page.locator(f'[data-check-answer="{q["id"]}"]').click()
  record('writing_unlocks',not sec.locator('[data-writing-gate]').is_disabled())
  for w in spec['writing']:
   page.locator('#'+w['id']).fill(w['model']);page.locator(f'[data-save-writing="{w["id"]}"]').click()
  first=spec['writing'][0];page.locator('#'+first['id']).fill(first['model']+' Additional explanation.');record('editing_saved_writing_is_draft','Draft' in page.locator('#'+first['id']+'-status').inner_text());page.locator(f'[data-save-writing="{first["id"]}"]').click();sec.locator('[data-finish-check]').click()
  snap=page.evaluate('BIOLOGY_HTML.getSnapshot()');record('required_completion_and_first_attempt',len(snap['history'])==1 and not snap['history'][0]['run']['mc'][spec['mc'][0]['id']]['attempts'][0]['correct'],page.locator('[data-progress-count]').inner_text())
  # Guided first/second wrong and correction do not add required credit.
  g=conf['guidedActivities'][0]['guided']['items'][0];node=page.locator(f'[data-guided-item="{g["id"]}"]');wrong=next(x for x in g['options']if x!=g['answer'])
  node.locator('select').select_option(wrong);node.locator('button').click();record('guided_wrong_first_hint','Hint:'in node.locator('[data-revision-feedback]').inner_text());node.locator('button').click();record('guided_second_explanation','Answer:'in node.locator('[data-revision-feedback]').inner_text());node.locator('select').select_option(g['answer']);node.locator('button').click();record('guided_correction_and_progress_isolation',node.locator('[data-revision-feedback]').inner_text().startswith('Correct.')and page.locator('[data-progress-count]').inner_text().startswith('1 of 10'))
  # Vocabulary drawer is current shared component.
  page.locator('.terms-line [data-term-id]').first.click();record('vocab_drawer_opens',page.locator('dialog[open]').count()==1);page.keyboard.press('Escape');record('vocab_escape_closes',page.locator('dialog[open]').count()==0)
  # Four practice modes start; full response lifecycle is tested through runtime data.
  for mode,route in [('flash','practice'),('blanks','fill-in-the-blanks'),('mc','multiple-choice'),('mixed','mixed-practice')]:
   page.evaluate('(id)=>location.hash=id',route);page.wait_for_timeout(60);psec=page.locator(f'[data-practice-mode="{mode}"]');psec.locator('[data-topic]').select_option('all');psec.locator('[data-set-size]').select_option('5');psec.locator('[data-practice-start]').click()
   run=page.evaluate(f'BIOLOGY_HTML.getSnapshot().practice.{mode}');record('start_'+mode,len(run['items'])==5);record('options_and_items_saved_'+mode,all(x.get('id')for x in run['items']))
   psec.screenshot(path=str(S/f'{mode}-running.png'))
  # Label maps render and correctly save each currently selected answer.
  page.evaluate("location.hash='labeling-practice'");page.wait_for_timeout(70)
  for d in conf['labelDiagrams']:
   page.locator('[data-diagram-select]').select_option(d['id']);page.locator('[data-start-labels]').click()
   for letter,answer in d['answers'].items():page.locator(f'[data-label-answer="{letter}"]').select_option(answer)
   page.locator('[data-label-check-all]').click();page.locator('[data-label-finish]').click();snap=page.evaluate('BIOLOGY_HTML.getSnapshot()');last=snap['history'][-1];record('labeling_'+d['id'],last['kind']=='labeling'and all(v['attempts'][-1]['correct']for v in last['run']['labels'].values()))
  # Transfer whole set and immutable first score.
  page.evaluate("location.hash='lesson-10'");page.wait_for_timeout(60);t=conf['transferChecks'][0];tn=page.locator('[data-transfer]')
  tn.locator('[data-transfer-submit]').click();record('transfer_blank_blocked',not page.evaluate('BIOLOGY_HTML.getSnapshot().transfer?.["ch19-transfer-01"]?.submissions?.length'))
  for q in t['mc']:page.locator(f'[data-transfer-choice="{q["id"]}"]').evaluate_all('(els,a)=>els.find(x=>x.value===a).click()',q['answer'])
  tn.locator('textarea').fill(t['writing']['model']);tn.locator('[data-transfer-submit]').click();first=page.evaluate('BIOLOGY_HTML.getSnapshot().transfer["ch19-transfer-01"].submissions[0]')
  q=t['mc'][0];wrong=next(x for x in q['options']if x!=q['answer']);page.locator(f'[data-transfer-choice="{q["id"]}"]').evaluate_all('(els,a)=>els.find(x=>x.value===a).click()',wrong);tn.locator('[data-transfer-submit]').click();later=page.evaluate('BIOLOGY_HTML.getSnapshot().transfer["ch19-transfer-01"]');record('transfer_first_submission_immutable',first==later['submissions'][0]and len(later['submissions'])==2)
  # Textbook example draft->save->edit. Source text never auto-graded.
  page.evaluate("location.hash='textbook-practice'");page.wait_for_timeout(100);page.locator('[data-book-text]').fill('Test explanation with part labels and a mechanism.');page.wait_for_timeout(750);record('textbook_draft_saved','Draft'in page.locator('[data-book-question-state]').inner_text());page.locator('[data-book-save]').click();page.wait_for_timeout(100);record('textbook_save','Saved'in page.locator('[data-book-question-state]').inner_text());page.locator('[data-book-text]').fill('An edited explanation.');page.wait_for_timeout(750);record('textbook_edit_returns_to_draft','Draft'in page.locator('[data-book-question-state]').inner_text());page.locator('[data-book-enlarge]').click();record('textbook_image_enlarge',page.locator('[data-book-enlarge-dialog][open]').count()==1);page.locator('[data-book-enlarge-close]').click()
  # Different surfaces / widths: no horizontal document overflow.
  sizes=[(1469,902),(1117,902),(980,902),(760,902),(390,844),(320,844)]
  over=[]
  for width,height in sizes:
   page.set_viewport_size({'width':width,'height':height})
   for route in ['lesson-02','lesson-08','core-vocabulary','textbook-practice','mixed-practice']:
    page.evaluate('(id)=>location.hash=id',route);page.wait_for_timeout(90)
    x=page.evaluate('({viewport:innerWidth,scroll:document.documentElement.scrollWidth})')
    if x['scroll']>width+2:over.append({'width':width,'route':route,**x})
   page.evaluate("location.hash='lesson-08'");page.wait_for_timeout(80);page.screenshot(path=str(S/f'lesson-08-{width}.png'))
  record('responsive_document_overflow',not over,str(over));results['overflow']=over
  page.set_viewport_size({'width':1469,'height':902});page.evaluate("location.hash='process-collection'");page.wait_for_timeout(100);page.screenshot(path=str(S/'all-my-work.png'))
  record('all_my_work_has_records',page.locator('#process-collection').inner_text().find('Written response')>=0 or page.locator('.history-run').count()>0)
  # Core images loaded (visible or lazy placeholders counted separately).
  broken=page.evaluate('''()=>[...document.images].filter(x=>x.getAttribute('src')?.startsWith('data:')&&x.complete&&x.naturalWidth===0).map(x=>x.alt)''');record('no_broken_loaded_embedded_images',not broken,str(broken))
  # Stored snapshot is small: stimulus URLs remain paths, not base64 snapshots.
  size=page.evaluate('JSON.stringify(BIOLOGY_HTML.getSnapshot()).length');record('state_no_embedded_image_payload',not page.evaluate('JSON.stringify(BIOLOGY_HTML.getSnapshot()).includes("data:image/")'),str(size)+' characters')
  # Quota failure preserves visible text and blocks overwrite.
  page.evaluate("location.hash='lesson-01';window.__testFailSave=true");page.wait_for_timeout(70);node.locator('select').select_option(wrong if wrong in g['options']else g['answer']);record('storage_failure_truthful','NOT SAVED'in page.locator('[data-local-status]').inner_text()or'failed'in page.locator('[data-local-status]').inner_text().lower(),page.locator('[data-local-status]').inner_text())
 except Exception as err:
  results['exception']=traceback.format_exc();print(results['exception']);page.screenshot(path=str(S/'failure.png'))
 results['pageErrors']=results['pageErrors'];record('no_javascript_page_errors',not results['pageErrors'],str(results['pageErrors']))
 (V/'browser-results.json').write_text(json.dumps(results,indent=2));b.close()
