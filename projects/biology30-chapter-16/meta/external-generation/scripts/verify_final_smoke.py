from pathlib import Path
from playwright.sync_api import sync_playwright
import json,hashlib,traceback,sys
R=Path(__file__).resolve().parent.parent
with sync_playwright()as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for ch in [16]:
  root=R;fp=root/f'portable/Biology30_Chapter{ch}.html';txt=fp.read_text();out=dict(artifactSha256=hashlib.sha256(fp.read_bytes()).hexdigest(),environment='Chromium in-memory document with explicit storage double; external network blocked for core-offline test.',tests=[],errors=[])
  def rec(name,ok,details=''):out['tests'].append(dict(name=name,status='passed'if ok else'failed',details=details))
  page=b.new_page(viewport={'width':1117,'height':902});page.set_default_timeout(4000);page.on('pageerror',lambda e:out['errors'].append(str(e)));page.route('http://**/*',lambda r:r.abort());page.route('https://**/*',lambda r:r.abort())
  shim='<script>const store=new Map();Object.defineProperty(window,"localStorage",{value:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}});</script>'
  try:
   page.set_content(txt.replace('<head>','<head>'+shim,1),wait_until='domcontentloaded',timeout=45000);page.evaluate('document.fonts.ready')
   C=page.evaluate('BIOLOGY_HTML.getConfig()');rec('offline_runtime',C['chapter']==ch)
   counts=page.evaluate('''()=>{const C=BIOLOGY_HTML.getConfig(),p=BiologyRevisionPractice.pool;return C.lessons.slice(0,-1).map((_,i)=>({lesson:i+1,foundation:p(C,'mc',String(i+1),'foundation').length,application:p(C,'mc',String(i+1),'application').length}));}''');rec('every_lesson_foundation_and_application',all(x['foundation']and x['application']for x in counts),json.dumps(counts))
   page.evaluate("location.hash='multiple-choice'");page.wait_for_timeout(60);sec=page.locator('[data-practice-mode="mc"]');sec.locator('[data-difficulty]').select_option('foundation');sec.locator('[data-practice-start]').click();run=page.evaluate('BIOLOGY_HTML.getSnapshot().practice.mc');rec('foundation_start_uses_recall_bank',len(run['items'])>0 and all(x['difficulty']=='recall'for x in run['items']))
   q=run['items'][0];sec.locator('[data-practice-input]').evaluate_all('(els,a)=>els.find(x=>x.value===a).click()',q['answer']);sec.locator('[data-practice-check]').click();rec('foundation_check_works','Correct'in sec.inner_text())
   if C.get('unitReviewQuestions'):
    page.evaluate("location.hash='mixed-practice'");page.wait_for_timeout(60);sec=page.locator('[data-practice-mode="mixed"]');sec.locator('[data-topic]').select_option('unit-review');sec.locator('[data-practice-start]').click();run=page.evaluate('BIOLOGY_HTML.getSnapshot().practice.mixed');rec('cumulative_review_scoped',bool(run['items'])and all(q['family']=='unit-review'for q in run['items']));rec('cumulative_not_default',page.evaluate("BiologyRevisionPractice.pool(BIOLOGY_HTML.getConfig(),'mixed','all').every(x=>x.family!=='unit-review')"))
   page.evaluate("location.hash='textbook-practice'");page.wait_for_timeout(60);vals=page.locator('[data-book-topic] option').evaluate_all('(els)=>els.map(x=>x.value)');rec('textbook_topic_options_unique',len(vals)==len(set(vals)))
   M=json.loads((root/'authoring/textbook-question-manifest.json').read_text());tasks=[q for q in M['questions']if q.get('instructions')]
   if tasks:
    page.locator('[data-book-question-grid]').get_by_role('button',name=tasks[0]['label'],exact=True).click();page.wait_for_timeout(80);rec('original_task_scope_visible',tasks[0]['instructions']in page.locator('[data-book-images]').inner_text())
   page.locator('[data-book-text]').fill('A saved explanation of the supplied case.');page.locator('[data-book-save]').click();page.wait_for_timeout(80);rec('final_textbook_save','Saved'in page.locator('[data-book-question-state]').inner_text())
   # Compact visual sample for final-source reading and a narrow layout.
   page.evaluate("location.hash='lesson-03'");page.wait_for_timeout(60);page.locator('#lesson-03 .worked-example').scroll_into_view_if_needed();page.screenshot(path=str(root/'verification/screenshots/final-worked-example.png'))
   page.set_viewport_size({'width':390,'height':844});page.evaluate("location.hash='lesson-01'");page.wait_for_timeout(60);page.screenshot(path=str(root/'verification/screenshots/final-mobile.png'));rec('narrow_no_overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'))
  except Exception:out['exception']=traceback.format_exc();rec('final_smoke_exception',False,out['exception'])
  rec('no_script_errors',not out['errors'],str(out['errors']));(root/'verification/final-smoke-results.json').write_text(json.dumps(out,indent=2));print(ch,len(out['tests']),[x['name']for x in out['tests']if x['status']=='failed']);page.close()
 b.close()
