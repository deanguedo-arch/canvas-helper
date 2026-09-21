from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from assemble import ROOT,assemble
R=[];E=[];KEY='math10c-unit3-pilot:review:v2'
def check(name,fn):
 try:fn();R.append({'id':name,'status':'pass'});print('PASS',name,flush=True)
 except Exception as e:R.append({'id':name,'status':'fail','detail':str(e)});print('FAIL',name,str(e)[:250])
def need(x,msg):
 if not x:raise AssertionError(msg)
def route(p,id):p.evaluate('(id)=>location.hash=id',id);p.locator('#'+id).wait_for(state='visible');p.wait_for_timeout(80)
def state(p):return p.evaluate('Unit3Debug.unpack(Unit3Debug.snapshot())')
def rec(p,q):return state(p)['r'].get('s-'+q)
def answer(p,q,v):
 t=p.locator('.inline-task[data-question="'+q+'"]:visible').first;t.locator('[data-answer]').fill(v);t.locator('[data-check]').click()
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 def fresh(seed=None,width=1440,remote=False):
  inject='<script>window.__store='+json.dumps(seed or {})+';window.__fail=false;Object.defineProperty(window,"localStorage",{value:{getItem:k=>Object.hasOwn(__store,k)?__store[k]:null,setItem:(k,v)=>{if(__fail)throw Error("SIMULATED storage failure");__store[k]=String(v)},removeItem:k=>delete __store[k]}});window.print=()=>window.__print=true;</script>'
  if remote is not False:inject+='''<script>window.__remote=%s;window.__published=null;window.__registered=0;window.__saveFail=false;window.__canvasHelperScorm={connectionState:()=>"connected",scopeKey:k=>k+":lms:test",readCourseState:()=>__remote,registerCourse:({flush})=>{__registered++;window.__flush=flush},publishCourseState:(s,ids)=>{__published=JSON.parse(JSON.stringify(s));window.__completed=ids},failCourseSave:()=>{},lastError:()=>"SIMULATED commit failure",saveAsync:async()=>{await __flush();if(!__saveFail)__remote=__published;window.dispatchEvent(new CustomEvent('canvas-helper:scorm-status',{detail:{message:__saveFail?'SIMULATED commit failure':'Saved to Brightspace at test time',error:__saveFail}}));return !__saveFail;}};</script>'''%json.dumps(remote)
  p=b.new_page(viewport={'width':width,'height':960});p.set_default_timeout(3500);p.on('pageerror',lambda e:E.append(str(e)));p.set_content(assemble().replace('<head>','<head>'+inject,1));p.wait_for_timeout(150);return p
 p=fresh()
 check('22-destinations-8-lessons',lambda:need(p.locator('.course-page').count()==22 and p.locator('.course-page[id^="u3-3"]').count()==8,'Unit inventory wrong'))
 check('Unique-DOM-IDs',lambda:need(p.evaluate('(()=>{let a=[...document.querySelectorAll("[id]")].map(e=>e.id);return new Set(a).size===a.length})()'),'Duplicate IDs'))
 def nav():
  for n in range(31,39):route(p,'u3-'+str(n));need(p.locator('#u3-'+str(n)).is_visible(),'Lesson missing')
 check('All-eight-lesson-routes',nav)
 route(p,'u3-overview');p.get_by_role('link',name='Already confident? Try the unit review').click();p.locator('#u3-review').wait_for(state='visible')
 check('Learner-1-fast-route-without-gating',lambda:need(p.locator('#u3-review').is_visible() and not state(p)['done'],'Forced prerequisite'))
 route(p,'u3-35');answer(p,'g35','x^2+3x+4x+12')
 check('M09-literal-intermediate',lambda:need(rec(p,'g35')['a'][-1][1:3]==['x^2+3x+4x+12','intermediate'],'Literal contract lost'))
 answer(p,'g35','x^2+2x+5x+12')
 check('Equivalent-split-not-false-algebra',lambda:need(rec(p,'g35')['a'][-1][2]=='equivalent','False algebra verdict'))
 def malformed():
  n=rec(p,'g35')['n'];answer(p,'g35','(x+3)(x+4');need(rec(p,'g35')['n']==n and rec(p,'g35')['d']=='(x+3)(x+4','Input erased or attempt consumed')
 check('M05-entry-repair-keeps-draft',malformed)
 def repair():
  t=p.locator('#u3-35 .inline-task[data-question="g35"]');t.locator('[data-repair-return]').click();p.locator('#u3-ready').wait_for(state='visible');need(p.locator('#u3-ready').is_visible(),'No repair');p.locator('#return-to-problem').click();p.locator('#u3-35').wait_for(state='visible');p.wait_for_function("q => document.activeElement?.dataset.answer === q", arg="g35");need(t.locator('[data-answer]').input_value()=='(x+3)(x+4','Draft lost');need(t.locator('[data-answer]').evaluate('(e)=>e===document.activeElement'),'Focus lost')
 check('Learner-2-repair-return-and-focus',repair)
 answer(p,'e35','(x+2)(x+6)')
 check('Learner-3-specific-middle-term-feedback',lambda:need('middle coefficient is 8' in p.locator('#u3-35 [data-feedback="e35"]').inner_text(),'No specific feedback'))
 answer(p,'g35','x(x+3)+4(x+3)')
 check('Learner-4-alternate-method-retained',lambda:need(rec(p,'g35')['a'][-1][2]=='ungraded','Alternate marked wrong'))
 for i in range(6):answer(p,'c35','(x-4)(x+3)')
 check('Unlimited-attempts-bounded-first-latest-three',lambda:need(rec(p,'c35')['n']==6 and [x[0] for x in rec(p,'c35')['a']]==[1,4,5,6],'Retention incorrect'))
 first=rec(p,'c35')['a'][0][3];p.locator('#u3-35 [data-solution="c35"]').click();answer(p,'c35','(x-4)(x+3)')
 check('Learner-6-M14-support-not-retroactively-rewritten',lambda:need(rec(p,'c35')['a'][0][3]==first and rec(p,'c35')['a'][-1][3]&2,'Support lost'))
 def wording():
  p.locator('[data-support-q="g35"] [data-support-hint]').evaluate('(e)=>e.textContent="Canonical teacher-edited hint."');p.locator('#u3-35 [data-hint="g35"]').click();need('Canonical teacher-edited' in p.locator('#u3-35 [data-feedback="g35"]').inner_text(),'Canonical edit overwritten')
 check('Canonical-hint-used-by-runtime',wording)
 route(p,'u3-31');answer(p,'c31','72');p.locator('[data-reason="3.1"]').fill('A common multiple gives the next shared flash.');p.locator('[data-record="3.1"]').click()
 check('Reasoning-and-completion-not-grade',lambda:need(state(p)['done']==['3.1'] and 'not a grade' in p.locator('#toast').inner_text(),'False completion/grade'))
 def restore():
  o=fresh(p.evaluate('__store'));need(state(o)['done']==['3.1'],'Completion lost');route(o,'u3-35');need(rec(o,'c35')['a'][-1][3]&2,'Support lost');o.close()
 check('M15-restore-in-new-controlled-document',restore)
 route(p,'u3-practice');p.locator('#practice-topic').select_option('core-positive');p.locator('#start-independent').click()
 check('Six-generated-frozen-instances',lambda:need(len(state(p)['active'])==6 and len({state(p)['r'][i]['q'] for i in state(p)['active']})==6,'Not six distinct'))
 check('Fresh-means-unexposed-mathematics',lambda:need(all(state(p)['r'][i]['q'] not in state(p)['exposed'] for i in state(p)['active']),'Exposed target'))
 def selection():
  for i in range(5):
   s=state(p);r=s['r'][s['active'][s['pos']]];answer(p,r['q'],p.evaluate('(id)=>Unit3Debug.question(id).answer',r['q']));p.locator('#pin-current').click()
   if i<4:p.locator('#practice-next').click()
  need(len(state(p)['pins'])==4 and p.locator('#practice-answer').is_enabled(),'Selection blocked practice')
 check('Four-protected-records-do-not-block-practice',selection)
 def frozen():
  a=state(p);o=fresh(p.evaluate('__store'));z=state(o);need(a['active']==z['active'] and a['runSeed']==z['runSeed'] and a['pins']==z['pins'],'Resume changed run');o.close()
 check('Frozen-seed-parameters-pins-restore',frozen)
 def cancel():
  a=state(p)['active'];p.locator('#start-practice').click();need(p.locator('#decision-dialog').is_visible(),'Native or missing confirmation');p.locator('#decision-no').click();need(state(p)['active']==a,'Cancel lost set')
 check('On-page-cancel-protects-unfinished-set',cancel)
 def pause():
  route(p,'u3-35');p.locator('#u3-35').evaluate('(e)=>e.dataset.mathChecking="paused"');n=rec(p,'c35')['n'];answer(p,'c35','0');need(rec(p,'c35')['n']==n,'Paused evidence changed');p.locator('[data-record="3.5"]').click();need('3.5' not in state(p)['done'],'Pause awarded completion');p.locator('#u3-35').evaluate('(e)=>e.dataset.mathChecking="enabled"')
 check('Teacher-withdrawal-keeps-work-no-credit',pause)
 route(p,'u3-transfer');p.locator('#trig-side').select_option('BC');p.locator('#trig-ratio').select_option('tan');p.locator('#trig-setup').click()
 def rotations():
  for _ in range(4):p.locator('#trig-rotate').click();p.locator('#trig-setup').click();need('Your side and tangent' in p.locator('#trig-setup-feedback').inner_text(),'Screen-position grading')
 check('M13-labels-under-four-rotations',rotations)
 p.locator('#trig-angle').fill('0.464 radians');p.locator('#trig-angle-check').click()
 check('M12-radians-different-requested-unit',lambda:need(state(p)['trig']['angle']=='different_requested_unit','Wrong unit reasoning'))
 p.locator('#trig-angle').fill('26.6 degrees');p.locator('#trig-angle-check').click()
 check('M11-angle-correct',lambda:need(state(p)['trig']['angle']=='correct','Correct answer rejected'))
 p.locator('#trig-length-ratio').select_option('sin');p.locator('#trig-length').fill('5.0 m');p.locator('#trig-length-check').click();p.locator('#trig-reason').fill('Sine relates opposite to hypotenuse.')
 check('Trig-setup-reason-and-value-separate',lambda:need(state(p)['trig']['lengthStatus']=='correct' and state(p)['trig']['length']=='sin' and state(p)['trig']['reason'],'Setup missing'))
 route(p,'u3-work');check('Process-preview-includes-trig',lambda:need('Triangle contrast' in p.locator('#work-list').inner_text(),'Missing contrast evidence'))
 p.locator('#report-print').click();check('Printable-report-not-submission',lambda:need(p.evaluate('window.__print===true'),'No printable report'))
 check('Print-expands-retained-evidence',lambda:need(p.locator('#u3-work details:not([open])').count()==0,'Printed report hides retained work'))
 p.evaluate('dispatchEvent(new Event("afterprint"))')
 def failed():
  route(p,'u3-31');old=p.evaluate('__store');p.evaluate('__fail=true');answer(p,'c31','7');need(p.evaluate('__store')==old and 'Not saved' in p.locator('#save-message').inner_text(),'False save');need(p.locator('#u3-31 [data-answer="c31"]').input_value()=='7','Draft lost');p.evaluate('__fail=false');p.locator('#save-retry').click();need('Saved in this browser' in p.locator('#save-message').inner_text(),'Retry failed')
 check('Failed-storage-preserves-last-copy-draft-retry',failed)
 def corrupt():
  o=fresh({KEY:'{broken'});need(o.evaluate('__store')[KEY]=='{broken' and o.locator('input[data-answer]').first.is_disabled(),'Invalid state overwritten');o.close()
 check('Invalid-restore-fails-closed',corrupt)
 def managed():
  initial=p.evaluate('Unit3Debug.snapshot()');o=fresh(remote=initial);need(o.evaluate('__registered')==1,'Multiple/missing owner');route(o,'u3-31');answer(o,'c31','72');need('pending' in o.locator('#save-message').inner_text(),'Publication called commit');o.evaluate('__canvasHelperScorm.saveAsync()');need('Saved to Brightspace' in o.locator('#save-message').inner_text(),'No acknowledgment');old=o.evaluate('__remote');o.evaluate('__saveFail=true');answer(o,'c31','99');o.evaluate('__canvasHelperScorm.saveAsync()');need(o.evaluate('__remote')==old and 'failure' in o.locator('#save-message').inner_text(),'Failed commit lost record');o.close()
 check('Shared-owner-registration-acknowledgment-commit-failure',managed)
 def conflict():
  local=p.evaluate('Unit3Debug.snapshot()');remote=dict(local);remote['rev']=local['rev']-1;o=fresh({KEY+':lms:test':json.dumps(local)},remote=remote);need(o.locator('#recovery-panel').is_visible() and o.evaluate('__published') is None,'Conflict automatically replaced');o.close()
 check('Managed-conflict-requires-choice',conflict)
 def mobile():
  o=fresh(width=390);o.locator('#menu-open').click();o.locator('a.nav-link[href="#u3-35"]').click();answer(o,'g35','x^2+3x+4x+12');need(rec(o,'g35')['a'][-1][2]=='intermediate','Narrow input failed');need(o.evaluate('document.documentElement.scrollWidth<=innerWidth'),'Page overflow');o.locator('#reference-open').click();o.keyboard.press('Escape');need(o.locator('#reference-open').evaluate('(e)=>e===document.activeElement'),'Focus lost');o.screenshot(path=str(ROOT/'evidence/lesson-mobile.png'));o.close()
 check('Learner-5-narrow-native-entry-and-focus',mobile)
 def narrow():
  o=fresh(width=320);route(o,'u3-transfer');need(o.evaluate('document.documentElement.scrollWidth<=innerWidth'),'320px overflow');o.screenshot(path=str(ROOT/'evidence/transfer-mobile.png'));o.close()
 check('320px-diagram-and-controls-reflow',narrow)
 def seen_examples():
  o=fresh();route(o,'u3-35');e=o.locator('[data-solved-expressions]').filter(has_text='Build a positive factor pair').first;e.scroll_into_view_if_needed();o.wait_for_timeout(150);q='gen-positive-3_8_1';need(q in state(o)['exposed'],'Visible solved target not recorded');o.close()
 check('Visible-worked-example-exposure-persists',seen_examples)
 def legacy():
  o=fresh({'math10c-unit3-pilot:review:v1':'earlier-copy'});need(o.locator('#legacy-preview-note').is_visible() and o.evaluate('__store["math10c-unit3-pilot:review:v1"]')=='earlier-copy','Earlier work lost or silently migrated');o.close()
 check('Earlier-preview-retained-with-recovery-route',legacy)
 def seen_own_work():
  o=fresh();route(o,'u3-practice');o.locator('#practice-topic').select_option('core-positive');o.locator('#start-independent').click();old=[state(o)['r'][i]['q'] for i in state(o)['active']];answer(o,old[0],o.evaluate('(q)=>Unit3Debug.question(q).answer',old[0]));o.locator('#start-independent').click();o.locator('#decision-yes').click();new=[state(o)['r'][i]['q'] for i in state(o)['active']];need(not set(old)&set(new),'Fresh set recycled seen question');need(all(q in state(o)['seen'] for q in old),'Seen markers missing');o.close()
 check('Previously-seen-mathematics-excluded-from-fresh-checks',seen_own_work)

 clean=fresh();clean.screenshot(path=str(ROOT/'evidence/overview-desktop.png'));route(clean,'u3-36');clean.screenshot(path=str(ROOT/'evidence/worked-example-desktop.png'));route(clean,'u3-transfer');clean.screenshot(path=str(ROOT/'evidence/triangle-desktop.png'));clean.close();p.close();b.close()
out={'suite':'Focused learner, state and canonical-source scenarios','environment':'Chromium set_content with explicit storage and bridge doubles. Direct browser navigation is blocked by host policy. Not real Studio, ordinary-origin storage, physical-device accessibility, or live Brightspace acceptance.','passed':sum(x['status']=='pass' for x in R),'failed':sum(x['status']=='fail' for x in R),'uncaughtErrors':E,'results':R}
(ROOT/'evidence/preview-results.json').write_text(json.dumps(out,indent=2));print(json.dumps({k:out[k] for k in ['passed','failed','uncaughtErrors']}))
if out['failed'] or E:raise SystemExit(1)
