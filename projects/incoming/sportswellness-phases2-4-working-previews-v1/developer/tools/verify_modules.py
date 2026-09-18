from pathlib import Path
import sys,json,csv,time,hashlib,re
from bs4 import BeautifulSoup
from PIL import Image,ImageDraw
from playwright.sync_api import sync_playwright
sys.path.insert(0,str(Path(__file__).resolve().parent))
from test_harness import start_page,OUT,inline_html
E=OUT/'developer/tests';(E/'routes').mkdir(parents=True,exist_ok=True)
def dumpcsv(path,rows):
 if not rows:return
 with open(path,'w',newline='')as f:
  w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
def sc(page,path):page.screenshot(path=str(path),type='jpeg',quality=55)
def routes(browser,n):
 d=OUT/f'sportswellness-phase-{n}';s=BeautifulSoup((d/'index.html').read_text(),'html.parser');rs=[x['id']for x in s.select('.chapter-section')];rows=[]
 for width,height in [(1117,902),(390,844)]:
  page=start_page(browser,n,viewport={'width':width,'height':height});page.wait_for_timeout(220)
  for route in rs:
   errors=[]
   page.evaluate('(r)=>SportsWellness.navigate(r)',route);page.wait_for_timeout(110)
   for im in page.locator(f'#{route} img').all():
    im.scroll_into_view_if_needed();page.wait_for_function('(e)=>e.complete&&e.naturalWidth>0',arg=im.element_handle(),timeout=2500)
   page.evaluate('window.scrollTo(0,0)');page.wait_for_timeout(30)
   metrics=page.evaluate('''()=>{const s=document.querySelector('.chapter-section.active'),r=s.getBoundingClientRect();return {active:s.id,w:innerWidth,scrollW:document.documentElement.scrollWidth,heading:s.querySelector('h2').getBoundingClientRect().top,images:[...s.querySelectorAll('img')].map(i=>({alt:!!i.alt,ok:i.complete&&i.naturalWidth>0})),guideClosed:!s.querySelector('.section-completion-guide')?.open,current:[...document.querySelectorAll('.course-nav a[aria-current=page]')].map(a=>a.hash),footer:!!s.querySelector('.lesson-footer')}}''')
   if metrics['active']!=route:errors.append('wrong route')
   if metrics['scrollW']>width+1:errors.append('document overflow')
   if any(not i['ok']or not i['alt'] for i in metrics['images']):errors.append('image absent or no alt')
   if not metrics['guideClosed']:errors.append('guide did not start closed')
   prefix=f'p{n}-{width}-{route}';sc(page,E/'routes'/f'{prefix}-top.jpg')
   guide=page.locator(f'#{route} > .section-completion-guide')
   if guide.count():
    guide.locator('summary').click();page.wait_for_timeout(30)
    if not guide.evaluate('(e)=>e.open'):errors.append('guide did not open')
    guide.locator('summary').click()
   jump=page.locator(f'#{route}-jump a')
   if jump.count():
    target=jump.get_attribute('href')[1:];jump.click();page.wait_for_timeout(60)
    activity=page.locator('#'+target)
    if not activity.is_visible():errors.append('activity jump target hidden')
    if activity.evaluate('(e)=>e.tagName')=='DETAILS' and not activity.evaluate('(e)=>e.open'):errors.append('activity disclosure stayed closed')
   else:
    body=page.locator(f'#{route} textarea:visible, #{route} .checkpoint-question, #{route} .my-work-body, #{route} .course-guide-body').first
    if body.count():body.scroll_into_view_if_needed()
   sc(page,E/'routes'/f'{prefix}-activity.jpg')
   page.evaluate('window.scrollTo(0,document.documentElement.scrollHeight)');page.wait_for_timeout(30);sc(page,E/'routes'/f'{prefix}-bottom.jpg')
   if guide.count():guide.evaluate('(e)=>e.open=false')
   rows.append({'phase':n,'route':route,'viewport':f'{width}x{height}','active_correct':metrics['active']==route,'document_overflow_px':max(0,metrics['scrollW']-width),'all_images_loaded':all(i['ok']for i in metrics['images']),'guide_started_closed':metrics['guideClosed'],'top_activity_bottom_captured':True,'result':'PASS'if not errors else'; '.join(errors),'notes':'Component fixture; HTTP launch and actual reload not run.'})
  page.close()
 dumpcsv(E/f'phase{n}-route-results.csv',rows)
 print('routes',n,len(rows),[x for x in rows if x['result']!='PASS'])
 return rows

def interact(browser,n):
 logs=[]
 def log(name,ok,detail=''):logs.append({'phase':n,'test':name,'result':'PASS'if ok else'FAIL','detail':detail})
 def state(p):return p.evaluate('SportsWellness.getState()')
 def nav(p,r):p.evaluate('(r)=>SportsWellness.navigate(r)',r);p.wait_for_timeout(50)
 def fill(p,id,text):nav(p,id);p.locator('#'+id).fill(text)
 def storenow(p):p.evaluate('SportsWellness.flush()');return p.evaluate('__testStore')
 p=start_page(browser,n);p.wait_for_timeout(120);cfg=json.loads((OUT/f'sportswellness-phase-{n}/review/phase-config.json').read_text());key=f'canvas-helper:sportswellness-phase-{n}:state';opening=cfg['openingField'];lesson=cfg['lessonFields'][0]
 try:
  fill(p,opening,'Fictional test response <b>kept as text</b> & "quotes".');nav(p,'process-collection')
  log('Latest keystroke reaches My Work','Fictional test response <b>' in p.locator('#process-summary').inner_text())
  ret=p.locator(f'#process-summary a[href="#{opening}"]').first;ret.click();p.wait_for_timeout(80)
  log('My Work return opens exact field',p.locator('#'+opening).is_visible()and p.evaluate('document.activeElement.id')==opening)
  saved=storenow(p);p.close();p=start_page(browser,n,state=saved);p.wait_for_timeout(80)
  log('State reconstructed from captured storage',state(p)['drafts'][opening].startswith('Fictional'))
  log('Safe collected HTML', '&lt;b&gt;' in p.evaluate('SportsWellness.workHTML()') and '<b>kept' not in p.evaluate('SportsWellness.workHTML()'))
  fill(p,lesson,'The case evidence supports this specific choice, not a general label.')
  nav(p,'playbook');b=p.locator(f'[data-reuse-source="{opening}"]').first
  b.click();target=b.get_attribute('data-reuse-target');log('Explicit reuse copies lesson response',p.locator('#'+target).input_value().startswith('Fictional'))
  p.locator('#'+target).fill('Edited Build work to preserve.');p.once('dialog',lambda x:x.dismiss());b.click();log('Reuse protects edited response on Cancel',p.locator('#'+target).input_value()=='Edited Build work to preserve.')
  for i in range(5):p.locator(f'[data-build-go="{i}"]').click();log(f'Build step {i+1} selectable',p.locator('.build-step.active-step').get_attribute('data-build-step')==str(i))
  nav(p,cfg['buildFields'][-1]);log('Deep link selects correct Build step',p.locator('#'+cfg['buildFields'][-1]).is_visible())
  fill(p,'review-1-first','My first reasoning before seeing the model answer.');p.locator('[data-reveal="1"]').click();snapshot=state(p)['firstChecks']['1']['text'];p.locator('#review-1-first').fill('Edited after comparing.');p.locator('[data-reveal="1"]').click();p.locator('#review-1-revision').fill('I clarified the distinction and explained the evidence.');log('First-answer snapshot immutable',state(p)['firstChecks']['1']['text']==snapshot)
  nav(p,'review-4-revision');log('Deep link selects correct written review',p.locator('#review-4-revision').is_visible())
  p.locator('#quick-notes').click();p.locator('#notebook-notes').fill('First separate note');p.locator('#save-note-entry').click();p.locator('#notebook-notes').fill('Second separate note');p.locator('#save-note-entry').click();log('Separate timestamped notes',len(state(p)['noteEntries'])==2 and all(x['at']for x in state(p)['noteEntries']))
  p.locator('[data-delete-note]').first.click();log('Delete single note',len(state(p)['noteEntries'])==1);p.locator('#undo-note-delete').click();log('Undo note deletion',len(state(p)['noteEntries'])==2);p.locator('#notebook-dialog [data-close]').first.click()
  nav(p,'checkpoint');p.locator('#phase1-checkpoint-form button[type=submit]').click();log('Incomplete checkpoint rejected',len(state(p)['checkpoint']['attempts'])==0)
  firstq=p.locator('.checkpoint-question').first;firstq.locator('input').first.check();saved=storenow(p);p.close();p=start_page(browser,n,state=saved);nav(p,'checkpoint');log('Partial checkpoint reconstructed',p.locator('.checkpoint-question input:checked').count()==1)
  p.evaluate('''()=>document.querySelectorAll('.checkpoint-question').forEach(q=>{const r=q.querySelector('input[value="'+q.dataset.correct+'"]');r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}));})''');p.locator('#phase1-checkpoint-form button[type=submit]').click();log('Complete checkpoint scores all keys',state(p)['checkpoint']['attempts'][-1]['score']==p.locator('.checkpoint-question').count())
  p.locator('#phase1-checkpoint-form button[type=submit]').click();log('Unchanged duplicate not recorded',len(state(p)['checkpoint']['attempts'])==1)
  nav(p,cfg['topics'][1]);nav(p,'checkpoint');log('Checkpoint feedback survives study return',p.locator('.checkpoint-feedback:visible').count()==p.locator('.checkpoint-question').count())
  saved=storenow(p);p.close();p=start_page(browser,n,state=saved);nav(p,'checkpoint');log('Submitted feedback reconstructed',p.locator('.checkpoint-feedback:visible').count()==p.locator('.checkpoint-question').count())
  p.locator('#checkpoint-clear').click();log('New attempt clears DOM and state',p.locator('.checkpoint-question input:checked').count()==0 and not state(p)['checkpoint']['selections']);log('Best attempt retained',len(state(p)['checkpoint']['attempts'])==1)
  p.locator('[data-review-attempt]').first.click();log('Historical attempt can be reviewed',p.locator('.checkpoint-feedback:visible').count()==p.locator('.checkpoint-question').count())
  nav(p,'performance-lab');p.locator('#lab-case-picker').select_option('2');p.locator('#lab-prev').click();log('Guided case revisiting works',state(p)['labRound']==1)
  for mode in ['guided','untimed']:
   for i in range(3):
    fill(p,f'{mode}-case-{i+1}-reason',f'Test case {i+1}: evidence, fitting response and next observation.')
    panel=p.locator(f'[data-lab-mode="{mode}"][data-round="{i}"]');panel.locator(f'input[value="{panel.get_attribute("data-correct")}"]').check();panel.locator('[data-lab-check]').click()
   fill(p,mode+'-transfer','A different task has a different demand, so the plan is adapted with a reason.');p.evaluate('SportsWellness.flush()');log(mode+' three cases and transfer collected',len(state(p)['lab'][mode]['attempts'])==3 and bool(state(p)['drafts'][mode+'-transfer']))
  nav(p,'process-collection');log('Both decision formats collected','Guided case 3' in p.locator('#process-summary').inner_text() and 'Untimed case 3' in p.locator('#process-summary').inner_text())
  # All wrong-input cases must leave live work unchanged.
  nav(p,'course-guide');p.locator('#recovery-tools').evaluate('(e)=>e.open=true') if p.locator('#recovery-tools').count()else p.locator('#backup-load').evaluate('(e)=>{for(let a=e.parentElement;a;a=a.parentElement)if(a.tagName==="DETAILS")a.open=true}')
  before=state(p)['drafts'].copy();valid=state(p)
  for name,data in [('Malformed','{'),('Unrelated',json.dumps({'unrelated':True})),('Cross phase',json.dumps(dict(valid,courseId='sportswellness-phase-9'))),('Wrong field type',json.dumps(dict(valid,drafts={opening:12})))]:
   p.locator('#backup-load').set_input_files({'name':'test.json','mimeType':'application/json','buffer':data.encode()});p.wait_for_timeout(100);log(name+' backup rejected safely',state(p)['drafts']==before and 'not loaded' in p.locator('#import-message').inner_text().lower())
  imported=json.loads(json.dumps(valid));imported['drafts'][opening]='Valid imported response.'
  p.once('dialog',lambda x:x.dismiss());p.locator('#backup-load').set_input_files({'name':'valid.json','mimeType':'application/json','buffer':json.dumps(imported).encode()});p.wait_for_timeout(100);log('Valid import Cancel preserves work',state(p)['drafts']==before)
  p.once('dialog',lambda x:x.accept());p.locator('#backup-load').set_input_files({'name':'valid.json','mimeType':'application/json','buffer':json.dumps(imported).encode()});p.wait_for_timeout(130);log('Valid import replacement',state(p)['drafts'][opening]=='Valid imported response.')
  nav(p,'course-guide');p.locator('#backup-load').evaluate('(e)=>{for(let a=e.parentElement;a;a=a.parentElement)if(a.tagName==="DETAILS")a.open=true}');p.once('dialog',lambda x:x.accept());p.locator('#undo-import').click();log('Prior work recoverable after import',state(p)['drafts'][opening]==before[opening])
  long='A'*20000;fill(p,opening,long);p.evaluate('SportsWellness.flush()');log('Full permitted 20000-character response preserved',len(state(p)['drafts'][opening])==20000)
  nav(p,'performance-game');p.wait_for_timeout(50)
  guard=p.evaluate('''()=>{const f=document.querySelector('#game-host iframe'),session=decodeURIComponent(f.src.split('session=')[1]),record={id:'test-record',activityId:JSON.parse(document.querySelector('#phase-config').textContent).gameId,version:1,at:new Date().toISOString(),status:'ended',reason:'Synthetic protocol test',elapsed:2,score:1},base={channel:'sportswellness-game',activityId:record.activityId,version:1,session,type:'summary',record};const test=(changes,source=f.contentWindow,origin=location.origin)=>SportsWellness.acceptGameMessage({source,origin,data:{...base,...changes}});return {wrongWindow:test({},window),wrongOrigin:test({},f.contentWindow,'https://invalid.example'),wrongActivity:test({activityId:'other'}),wrongVersion:test({version:2}),wrongSession:test({session:'wrong'}),badPayload:test({record:{...record,score:'not number'}}),valid:test({}),duplicate:test({})};}''')
  log('Game messages reject wrong source origin identity version payload',all(not v for k,v in guard.items()if k not in ['valid','duplicate']),str(guard));log('Valid game summary accepted once',guard['valid']and not guard['duplicate'])
  saved=storenow(p);log('Writes isolated to own phase key',all(k.startswith(key)for k in saved));p.close()
  p=start_page(browser,n,fail_storage=True);fill(p,opening,'Recoverable unsaved open-page work');p.locator('#school-save-exit').click();log('Storage failure does not claim saved',not p.evaluate('SportsWellness.storageAvailable()') and 'unavailable' in p.locator('#runtime-status').inner_text());log('Storage failure retains live text',state(p)['drafts'][opening]=='Recoverable unsaved open-page work');p.close()
 except Exception as ex:
  log('Harness execution',False,str(ex));print('EXCEPTION',n,str(ex));
  try:p.screenshot(path=str(E/f'phase{n}-test-failure.png'))
  except:pass
  try:p.close()
  except:pass
 dumpcsv(E/f'phase{n}-interaction-results.csv',logs);print('interaction',n,len(logs),[x for x in logs if x['result']!='PASS'])
 return logs
if __name__=='__main__':
 with sync_playwright()as pw:
  browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for n in list(map(int,sys.argv[1:]))or[2,3,4]:routes(browser,n);interact(browser,n)
  browser.close()
