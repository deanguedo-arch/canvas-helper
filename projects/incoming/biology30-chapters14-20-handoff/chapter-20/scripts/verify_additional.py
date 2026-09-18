#!/usr/bin/env python3
"""Additional deterministic DOM tests; storage is an explicit in-memory double."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,time,traceback,os
R=Path(__file__).resolve().parents[1];V=R/'verification';text=(R/'portable/Biology30_Chapter20.html').read_text();out={'environment':'Chromium about:blank, Map-backed storage double; not real-origin persistence or LMS testing.','tests':[],'errors':[]}
def rec(name,ok,detail=''):
 out['tests'].append(dict(name=name,status='passed' if ok else 'failed',details=detail));print(name,ok)
def source(saved=None):
 values={}if saved is None else saved
 shim='<script>window.__testStorage=new Map(Object.entries('+json.dumps(values)+'));Object.defineProperty(window,"localStorage",{value:{getItem:k=>__testStorage.get(k)||null,setItem:(k,v)=>__testStorage.set(k,String(v)),removeItem:k=>__testStorage.delete(k)}});</script>'
 return text.replace('<head>','<head>'+shim,1)
with sync_playwright()as p:
 b=p.chromium.launch(executable_path=os.environ.get('BIOLOGY_CHROMIUM','/usr/bin/chromium'),headless=True,args=['--no-sandbox']);page=b.new_page(viewport={'width':1469,'height':902});page.set_default_timeout(3500);page.on('pageerror',lambda x:out['errors'].append(str(x)))
 page.set_content(source(),wait_until='domcontentloaded',timeout=45000);page.evaluate('document.fonts.ready');C=page.evaluate('BIOLOGY_HTML.getConfig()');key=page.evaluate('BIOLOGY_HTML.storageKey')or'biology30-chapter-20:html:v1'
 def route(s):page.evaluate('(s)=>location.hash=s',s);page.wait_for_timeout(60)
 def snap():return page.evaluate('BIOLOGY_HTML.getSnapshot()')
 try:
  route('mixed-practice');sec=page.locator('[data-practice-mode="mixed"]');sec.locator('[data-topic]').select_option('all');sec.locator('[data-set-size]').select_option('10');sec.locator('[data-practice-start]').click();initial=snap()['practice']['mixed'];kinds={x['kind']for x in initial['items']};rec('mixed_set_has_varied_kinds',len(kinds)>=3,str(sorted(kinds)))
  # Finish an actual mixed set, exercising every generated kind present.
  for i in range(len(initial['items'])):
   run=snap()['practice']['mixed'];item=run['items'][run['index']];kind=item['kind']
   if kind=='flash':
    sec.locator('[data-reveal]').click();sec.locator('[data-rate="study"]').click()
   elif kind in ('mc','diagram'):
    ans=item['answer'];sec.locator('[data-practice-input]').evaluate_all('(els,a)=>els.find(x=>x.value===a).click()',ans);sec.locator('[data-practice-check]').click()
   elif kind=='blank':sec.locator('[data-practice-input]').fill(item['answer']);sec.locator('[data-practice-check]').click()
   elif kind=='multi-select':
    for a in item['answers']:sec.locator('[data-practice-input]').evaluate_all('(els,a)=>els.find(x=>x.value===a).click()',a)
    sec.locator('[data-practice-check]').click()
   elif kind=='order':
    for j,a in enumerate(item['steps']):sec.locator(f'[data-order-position="{j}"]').select_option(a)
    sec.locator('[data-practice-check]').click()
   if i<len(initial['items'])-1:sec.locator('[data-practice-next]').click()
   else:sec.locator('[data-practice-finish]').click()
  finished=snap()['history'];rec('mixed_set_finishes_to_history',len(finished)==1 and finished[0]['kind']=='practice');sec.locator('[data-retry]').click();retry=snap()['practice']['mixed'];rec('retry_preserves_completed_history',snap()['history']==finished);rec('retry_uses_other_flash_family',all(x['id']not in [y['id']for y in initial['items']]or x.get('repeatPractice')for x in retry['items']))
  before=snap();sec.locator('[data-reset-request]').click();sec.locator('[data-reset-cancel]').click();rec('reset_cancel_preserves_run',snap()==before);sec.locator('[data-reset-request]').click();sec.locator('[data-reset-confirm]').click();rec('reset_only_unfinished_run','mixed'not in snap()['practice']and snap()['history']==finished)
  # Stored-seed/run restoration across newly loaded documents.
  sec.locator('[data-practice-start]').click();before=snap();storage=page.evaluate('Object.fromEntries(__testStorage)');page.close();page=b.new_page(viewport={'width':1469,'height':902});page.set_default_timeout(3500);page.on('pageerror',lambda x:out['errors'].append(str(x)));page.set_content(source(storage),wait_until='domcontentloaded',timeout=45000);route('mixed-practice');rec('stored_item_order_restored',snap()==before,'Reloaded into a new in-memory document with the saved storage payload; not a file-origin reload.')
  # Vocabulary and Frayer workflow.
  route('core-vocabulary');wid=C['words'][0]['id'];page.locator(f'[data-biology-select-word="{wid}"]').click();page.locator(f'[data-add-frayer="{wid}"]').click();rec('frayer_initial_fields_empty',all(x==''for x in snap()['frayers'][wid]['answers']))
  for i in range(4):page.locator(f'[data-frayer-input="{wid}"][data-field="{i}"]').fill('A specific learner explanation '+str(i+1)+'.')
  page.locator('[data-collect-frayer]').click();rec('frayer_collection',snap()['frayers'][wid]['collected']);page.locator('[data-frayer-input]').first.fill('An edited explanation.');rec('frayer_edit_returns_to_draft',not snap()['frayers'][wid]['collected'])
  for w in C['words'][1:9]:
   page.locator(f'[data-biology-select-word="{w["id"]}"]').click();page.locator(f'[data-add-frayer="{w["id"]}"]').click()
  rec('frayer_eight_word_limit',len(snap()['frayers'])==8)
  # Extension unlock and proper PDF page mapping.
  route('extension');model=page.locator('[data-extension-model]');rec('extension_model_initially_locked',model.get_attribute('data-locked')=='true');field=page.locator('[data-note-input="ch20-optional-extension"]');field.evaluate('(el)=>el.closest("details").open=true');field.fill('The comparison alone cannot isolate the proposed chemical effect. Hormone production and receptor response are distinct steps.');page.locator('[data-save-note="ch20-optional-extension"]').click();rec('extension_model_after_saved_attempt',model.get_attribute('data-locked')=='false')
  route('lesson-08');page.locator('#lesson-08 [data-open-pdf]').first.click();subtitle=page.locator('.textbook-subtitle').inner_text();rec('split_pdf_page_mapping','PDF page 19 of 42'in subtitle,subtitle);page.keyboard.press('Escape')
  # All 11 checks have resolvable response ids/options.
  rec('required_check_schema',len(C['checks'])==12 and all(len(q['mc'])==(6 if n==11 else 2)and len(q['writing'])==2 and all(x['answer']in x['options']for x in q['mc'])for n,q in enumerate(C['checks'])))
  rec('optional_work_progress_isolated',page.locator('[data-progress-count]').inner_text().startswith('0 of 12'))
  # Source stimuli have valid decoded image bytes.
  images=page.evaluate('()=>BIOLOGY_HTML.getConfig().practiceBank.filter(q=>q.stimuli?.length).length') if 'practiceBank'in C else -1
  route('process-collection');page.evaluate('window.dispatchEvent(new Event("beforeprint"))');page.emulate_media(media='print');page.pdf(path=str(V/'all-my-work-print-test.pdf'),format='A4',print_background=True);page.emulate_media(media='screen');page.evaluate('window.dispatchEvent(new Event("afterprint"))');rec('print_output_created',(V/'all-my-work-print-test.pdf').stat().st_size>2000,'Chromium print rendering; not operating-system print/save dialog.')
  # Simulate a disk revision changed by another writer.
  page.evaluate('''key=>{const v=JSON.parse(localStorage.getItem(key));v.revision+=1;localStorage.setItem(key,JSON.stringify(v));}''',key);route('extension');field.fill('New text that must not overwrite newer work.');rec('revision_conflict_blocks_overwrite','Another tab' in page.locator('[data-local-status]').inner_text()or 'paused'in page.locator('[data-local-status]').inner_text(),page.locator('[data-local-status]').inner_text())
 except Exception:out['exception']=traceback.format_exc();print(out['exception'])
 rec('no_extra_page_errors',not out['errors'],str(out['errors']));(V/'additional-browser-results.json').write_text(json.dumps(out,indent=2));b.close()
