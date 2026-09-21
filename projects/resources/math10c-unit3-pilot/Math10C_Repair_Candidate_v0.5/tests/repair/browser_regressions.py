"""Executable changed-area regressions. Actual Chromium DOM and actual emitted bridge.
Storage, Web Locks and LMS API are explicit doubles; native same-origin tab/tenant
semantics, physical keyboards and assistive technology remain external gates.
"""
from controlled_browser import load,html,ROOT
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,traceback,sys
results=[]
def check(v,msg='assertion failed'):
 if not v:raise AssertionError(msg)
def run(name,cases,fn,managed=True,prelude='',width=1440):
 page=browser.new_page(viewport={'width':width,'height':950});page.set_default_timeout(5000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 try:
  load(page,managed=managed,prelude=prelude);fn(page);check(not errors,'Uncaught page errors: '+str(errors));results.append({'id':name,'cases':cases,'result':'passed'})
 except Exception as e:
  results.append({'id':name,'cases':cases,'result':'failed','detail':str(e),'stack':traceback.format_exc()});print('FAIL',name,str(e)[:350],flush=True)
 finally:
  page.close()
  file=ROOT/'evidence/repair-browser-results.json'
  prior=json.loads(file.read_text()).get('results',[]) if file.exists() else []
  names={r['id']for r in results}; prior=[r for r in prior if r['id']not in names]
  file.write_text(json.dumps({'environment':'Real Chromium DOM; actual emitted bridge; explicit storage/lock/LMS doubles; no native-origin acceptance.','command':'python tests/repair/browser_regressions.py','results':prior+results},indent=2))
def go(p,route):
 p.evaluate('(route)=>{location.hash=route}',route);p.wait_for_timeout(70)
def task(p,q):return p.locator('.inline-task[data-question="'+q+'"]')
def enter(p,q,raw,submit=False):
 t=task(p,q);t.locator('[data-answer]').fill(raw)
 if submit:t.locator('[data-check]').click()
 return t
def flush(p):return p.evaluate('Unit3Debug.retry()')
def state(p):return p.evaluate('Unit3Debug.unpack(Unit3Debug.snapshot())')
def saving(p):return p.evaluate('Unit3Debug.saving()')
def saved(p):check(flush(p) is True,'Retry did not commit');check(saving(p)['dirty'] is False,'Receipt did not clean current snapshot')
def dom_controls(p):
 p.evaluate("window.__savedButton=document.getElementById('save-retry');__canvasHelperScorm.failCourseSave(Error('injected'))")
 check(p.locator('#save-retry').count()==1);check(p.evaluate("__savedButton===document.getElementById('save-retry')"));check('Not saved' in p.locator('#save-message').inner_text());check(p.locator('#save-retry').is_visible())
 # One click owns one commit, despite the bridge and course both listening.
 n=p.evaluate('__lms.commits');p.locator('#save-retry').click();p.wait_for_timeout(50);check(p.evaluate('__lms.commits')==n+1,'duplicate retry commits')
def quota(p):
 saved(p);base=p.evaluate('__lms.confirmed["cmi.suspend_data"]');p.evaluate('__env.failWrite=true');go(p,'u3-35');enter(p,'g35','x^2+3x+4x+12');
 check(saving(p)['dirty']);check(saving(p)['currentError'] is not None)
 p.evaluate('__canvasHelperScorm.save()');check(p.evaluate('__lms.confirmed["cmi.suspend_data"]')==base);check('Not saved' in p.locator('#save-message').inner_text());check(p.locator('#save-retry').is_visible());check(saving(p)['lastConfirmed'] is not None);check(any('Open-tab' in b['label'] for b in saving(p)['branches']))
 p.evaluate('__env.failWrite=false');saved(p);check('x^2+3x+4x+12' in saving(p)['lastConfirmed'])
def rejected(p):
 saved(p);old=p.evaluate('__lms.confirmed["cmi.suspend_data"]');go(p,'u3-35');enter(p,'g35','x^2+3x+4x+12')
 for mode in ['key','commit']:
  p.evaluate("mode=>{__lms.rejectKey=mode==='key'?'cmi.suspend_data':null;__lms.rejectCommit=mode==='commit';}",mode)
  check(flush(p) is False);check(saving(p)['dirty']);check(p.evaluate('__lms.confirmed["cmi.suspend_data"]')==old);check('Not saved' in p.locator('#save-message').inner_text())
 p.evaluate('__lms.rejectKey=null;__lms.rejectCommit=false');saved(p)
def reentrant(p):
 saved(p);go(p,'u3-35');enter(p,'g35','x^2+3x+4x+12')
 # A is captured by the bridge; B is published by a real input event during SetValue.
 p.evaluate("""()=>{__lms.onSet=(k,v)=>{if(k!=='cmi.suspend_data')return;__lms.onSet=null;const i=document.querySelector('[data-answer="g35"]');i.value='x^2+2x+5x+12';i.dispatchEvent(new Event('input',{bubbles:true}));};__canvasHelperScorm.save();}""")
 v=saving(p);check(v['dirty'],'stale receipt cleaned B');check('x^2+3x+4x+12' in v['lastConfirmed']);check('x^2+2x+5x+12' in v['pendingPublication']['raw']);check('not yet confirmed' in p.locator('#save-message').inner_text());saved(p)
def external_conflict(p):
 saved(p);before=saving(p)['lastConfirmed'];key=saving(p)['localKey'];p.evaluate("key=>{__env.values[key]='other original bytes';window.dispatchEvent(new StorageEvent('storage',{key,newValue:'other original bytes'}));}",key)
 v=saving(p);check(v['blocked']);check(v['lastConfirmed']==before);check(any(b['raw']=='other original bytes' for b in v['branches']));check(flush(p) is False);check(p.evaluate('(k)=>__env.values[k]',key)=='other original bytes')
def no_locks(p):
 v=saving(p);check(not v['ownsWriterLock']);check(v['blocked']);p.evaluate('__canvasHelperScorm.save()');check(p.evaluate('__lms.commits')==0);check(v['localKey'] not in p.evaluate('__env.values'))
def writer_taken(p):
 check(not saving(p)['ownsWriterLock']);p.evaluate('__canvasHelperScorm.save()');check(p.evaluate('__lms.commits')==0);check(p.locator('[data-answer="g35"]').is_disabled())
def null_race(p):
 check(saving(p)['blocked']);check(any(b['raw']=='concurrent-null-baseline-write' for b in saving(p)['branches']));check(p.evaluate('__lms.commits')==0)
def feedback(p):
 go(p,'u3-35');t=enter(p,'g35','x^2+3x+4x+12',True);check(t.locator('[data-feedback]').get_attribute('data-status')=='intermediate');enter(p,'g35','nonsense');check('not been checked' in t.locator('[data-feedback]').inner_text());check('x^2+3x+4x+12' in t.locator('[data-history-status]').inner_text());go(p,'u3-overview');go(p,'u3-35');check('not been checked' in task(p,'g35').locator('[data-feedback]').inner_text());check(state(p)['drafts']['g35']=='nonsense');go(p,'u3-work');p.locator('[data-repair-report] summary').click();check('Current draft (not checked)' in p.locator('#work-list').inner_text())
def malformed(p):
 go(p,'u3-35');before=state(p)['summary']['attempts'];t=enter(p,'g35','(x+3)(x+4',True);check(t.locator('[data-answer]').input_value()=='(x+3)(x+4');check(state(p)['summary']['attempts']==before);check(t.locator('[data-answer]').get_attribute('aria-invalid')=='true');check(t.locator('[data-answer]').get_attribute('aria-describedby'))
def unlimited(p):
 go(p,'u3-35');
 for x in ['x^2+3x+4x+12','x^2+2x+5x+12','x^2+1x+6x+12','x^2+0x+7x+12','x^2+3x+4x+12','x^2+4x+3x+12']:enter(p,'g35',x,True)
 s=state(p);r=s['r']['s-g35'];check(r['n']==6);check([a[0] for a in r['a']]==[1,4,5,6]);check(s['skills']['3.5']['attempts']>=6);saved(p);go(p,'u3-work');p.locator('[data-repair-report] summary').click();check('Skill 3.5:' in p.locator('#work-list').inner_text())
def roots_faded(p):
 go(p,'u3-32');t=task(p,'g321');fs=t.locator('[data-structured-part]');fs.nth(0).fill('7');fs.nth(1).fill('8');t.locator('[data-check]').click();check(t.locator('[data-feedback]').get_attribute('data-status')=='correct');check(state(p)['drafts']['g321']=='7|8');
 go(p,'u3-35');t=task(p,'g351');t.locator('[data-structured-part]').nth(0).fill('4');t.locator('[data-structured-part]').nth(1).fill('5');t.locator('[data-check]').click();check(t.locator('[data-feedback]').get_attribute('data-status')=='correct');t=enter(p,'g352','x^2+4x+5x+20',True);check(t.locator('[data-feedback]').get_attribute('data-status')=='intermediate');check(task(p,'g354').count()==1)
def mixed(p):
 go(p,'u3-practice');p.locator('#practice-topic').select_option('mixed');p.locator('#start-independent').click();s=state(p);qs=[p.evaluate('(id)=>Unit3Debug.question(id)',s['r'][i]['q']) for i in s['active']];check(len(qs)==6);check(any(q['mode']=='expand' for q in qs));check(any(q['mode']=='factor' for q in qs));check(any(q['id'].startswith('e') for q in qs))
def trig(p):
 go(p,'u3-transfer');p.locator('#trig-side').select_option('BC');p.locator('#trig-adjacent').select_option('AB');p.locator('#trig-hypotenuse').select_option('AC');p.locator('#trig-ratio').select_option('sin');p.locator('#trig-angle-check').click();s=state(p)['trig'];check(s.get('an',0)==0);check(s['setupAttempts'][0][3]==0);check(s['setupAttempts'][0][4]['value']['status']=='not_attempted');
 p.locator('#trig-angle').fill('26.6 degrees');p.locator('#trig-angle-check').click();s=state(p)['trig'];check(s['aa'][0][3]==4);check(s['aa'][0][4]['setup']=='incorrect');check(s['aa'][0][4]['value']['status']=='correct');p.locator('#trig-ratio').select_option('tan');p.locator('#trig-angle-check').click();s=state(p)['trig'];check(s['aa'][1][4]['setup']=='correct');check(s['aa'][0][4]['setup']=='incorrect');
 for _ in range(4):p.locator('#trig-rotate').click()
 check(p.locator('#trig-side').input_value()=='BC');check(p.locator('#trig-adjacent').input_value()=='AB');check(p.locator('#trig-hypotenuse').input_value()=='AC');go(p,'u3-work');p.locator('[data-repair-report] summary').click();txt=p.locator('#work-list').inner_text();check('checker unit3-trig-2' in txt)
def first_trig_support(p):
 go(p,'u3-transfer');p.locator('#trig-side').select_option('BC');p.locator('#trig-adjacent').select_option('AB');p.locator('#trig-hypotenuse').select_option('AC');p.locator('#trig-ratio').select_option('tan');p.locator('#trig-angle').fill('120 degrees');p.locator('#trig-angle-check').click();a=state(p)['trig']['aa'][0];check(a[3]==0);check(state(p)['trig']['angleSupport']==4);p.locator('#trig-angle').fill('26.6 degrees');p.locator('#trig-angle-check').click();check(state(p)['trig']['aa'][1][3]==4)
def mobile(p):
 check(p.locator('#unit-sidebar').evaluate('(e)=>e.inert'));p.locator('#menu-open').click();check(p.locator('#main-content').evaluate('(e)=>e.inert'));check(p.locator('#unit-sidebar').evaluate('(e)=>!e.inert'));p.keyboard.press('Escape');check(p.evaluate('document.activeElement.id')=='menu-open');check(p.locator('#unit-sidebar').evaluate('(e)=>e.inert'));p.set_viewport_size({'width':1200,'height':900});p.wait_for_timeout(80);check(not p.locator('#unit-sidebar').evaluate('(e)=>e.inert'));check(not p.locator('#main-content').evaluate('(e)=>e.inert'));p.set_viewport_size({'width':320,'height':850});p.wait_for_timeout(80);check(p.locator('#unit-sidebar').evaluate('(e)=>e.inert'));go(p,'u3-35');check(p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
def release(p):
 saved(p);n=p.evaluate('__lms.commits');p.evaluate('Unit3Debug.releaseWriter()');check(not saving(p)['ownsWriterLock']);p.evaluate('__canvasHelperScorm.save()');check(p.evaluate('__lms.commits')==n);check(p.locator('[data-answer="g35"]').is_disabled());check(p.evaluate('Unit3Debug.requestWriter()') is False)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 jobs=[('native-save-controls-survive',['SAVE-01','SAVE-07'],dom_controls,{}),('quota-heartbeat-retry',['SAVE-02','SAVE-03','SAVE-05'],quota,{}),('rejected-setvalue-and-commit',['SAVE-06'],rejected,{}),('reentrant-stale-receipt',['SAVE-04','SAVE-05'],reentrant,{}),('external-conflict-preserves-both',['SAVE-11'],external_conflict,{}),('web-lock-unavailable',['SAVE-12'],no_locks,{'prelude':"Object.defineProperty(navigator,'locks',{value:undefined,configurable:true});"}),('second-writer-denied',['SAVE-10'],writer_taken,{'prelude':'__env.held=true;'}),('initial-null-race',['SAVE-09'],null_race,{'prelude':"const rq=navigator.locks.request.bind(navigator.locks);navigator.locks.request=(n,o,c)=>{const key=__canvasHelperScorm.scopeKey('math10c-unit3-pilot:review:v2');__env.values[key]='concurrent-null-baseline-write';return rq(n,o,c);};"}),('draft-invalidates-old-feedback',['FEEDBACK-01','FEEDBACK-02','FEEDBACK-04'],feedback,{}),('unreadable-input-preserved',['FEEDBACK-03','ACCESS-04'],malformed,{}),('attempts-not-capped',['STATE-05','STATE-04'],unlimited,{}),('root-and-faded-source-interaction',['LEARNING-01','LEARNING-05'],roots_faded,{}),('mixed-independent-strata',['LEARNING-03'],mixed,{}),('trig-setup-chronology-and-report',['TRIG-02','TRIG-03','TRIG-05','REPORT-02'],trig,{}),('trig-feedback-after-submission',['TRIG-01'],first_trig_support,{}),('mobile-menu-focus-and-resize',['ACCESS-01','ACCESS-02','ACCESS-03'],mobile,{'width':390}),('explicit-release-blocks-heartbeat',['SAVE-10','SAVE-11'],release,{})]
 selected=set(sys.argv[1:])
 for name,cases,fn,kw in jobs:
  if selected and name not in selected:continue
  print('RUN',name,flush=True);run(name,cases,fn,**kw)
 browser.close()
file=ROOT/'evidence/repair-browser-results.json';old=[]
if selected and file.exists():old=json.loads(file.read_text())['results'];names={r['id']for r in results};old=[r for r in old if r['id']not in names]
file.write_text(json.dumps({'environment':'Real Chromium DOM using page.set_content; actual emitted proposed bridge; explicit storage/lock/LMS doubles. URL navigation blocked by host policy.','command':'python tests/repair/browser_regressions.py','results':old+results},indent=2))
print(json.dumps({'passed':sum(r['result']=='passed'for r in results),'failed':sum(r['result']=='failed'for r in results)}));sys.exit(any(r['result']=='failed'for r in results))
