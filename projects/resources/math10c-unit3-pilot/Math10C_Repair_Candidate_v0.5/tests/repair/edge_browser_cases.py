from controlled_browser import load,ROOT,ENV
from playwright.sync_api import sync_playwright
import json,sys,traceback,subprocess,os
rows=[]
def t(id,cases,fn):
 try:fn();rows.append({'id':id,'cases':cases,'result':'passed'})
 except Exception as e:rows.append({'id':id,'cases':cases,'result':'failed','detail':traceback.format_exc()})
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 def new(width=390):
  p=b.new_page(viewport={'width':width,'height':844});p.set_default_timeout(3500);load(p);return p
 def c35():
  p=new(1200);p.evaluate("location.hash='u3-35'");i=p.locator('[data-answer="c35"]');i.fill('(x+3)(x-4)');p.locator('[data-check="c35"]').click();assert p.locator('[data-feedback="c35"]').get_attribute('data-status')=='correct'
  i.fill('(x+99)(x-4)');assert 'not been checked' in p.locator('[data-feedback="c35"]').inner_text();p.evaluate("location.hash='u3-overview'");p.wait_for_timeout(35);p.evaluate("location.hash='u3-35'");p.wait_for_timeout(35)
  assert 'not been checked' in p.locator('[data-feedback="c35"]').inner_text();assert '(x+3)(x-4)' in p.locator('.inline-task[data-question="c35"] [data-history-status]').inner_text();p.close()
 def mobile():
  p=new(320);p.locator('#menu-open').click();p.wait_for_timeout(20)
  selectors="[...document.querySelectorAll('#unit-sidebar a,#unit-sidebar button,#unit-sidebar summary')].filter(x=>x.getClientRects().length&&!x.disabled&&!x.closest('[hidden]')&&[...document.querySelectorAll('#unit-sidebar details:not([open])')].every(d=>!d.contains(x)||d.querySelector(':scope > summary')===x))"
  p.evaluate(f'()=>{{const f={selectors};f[0].focus();}}');p.keyboard.press('Shift+Tab');assert p.evaluate(f'()=>{{const f={selectors};return document.activeElement===f.at(-1);}}')
  p.keyboard.press('Tab');assert p.evaluate(f'()=>{{const f={selectors};return document.activeElement===f[0];}}')
  p.locator('#menu-scrim').dispatch_event('click');assert p.evaluate('document.activeElement.id')=='menu-open';assert p.locator('#unit-sidebar').evaluate('(e)=>e.inert')
  p.locator('#menu-open').click();p.locator('#unit-sidebar a[href="#u3-35"]').click();p.wait_for_timeout(35);assert p.locator('#unit-sidebar').evaluate('(e)=>e.inert');assert p.evaluate("document.getElementById('u3-35').contains(document.activeElement)")
  p.locator('#reference-open').click();assert p.locator('#reference-panel').is_visible();p.keyboard.press('Escape');assert p.locator('#reference-panel').is_hidden();assert p.evaluate('document.activeElement.id')=='reference-open'
  p.close()
 def framing():
  p=new(1200);p.evaluate('Unit3Debug.retry()');wire=p.evaluate('__lms.confirmed["cmi.suspend_data"]');p.close();env=json.loads(wire);env['scope']='attempt-'+'a'*92;env['learnerId']='learner-'+'z'*180
  keys=json.loads((ROOT/'workspace/scorm-tracking.json').read_text())['pageIds']
  env['tracking']['pageMs']={k:9876543210 for k in keys};env['tracking']['activeMs']=9876543210
  p=b.new_page();load(p,prelude='window.TEST_INITIAL_LMS='+json.dumps({'cmi.suspend_data':json.dumps(env),'cmi.learner_id':env['learnerId']})+';');assert p.evaluate('Unit3Debug.ready()');p.evaluate('Unit3Debug.retry()');actual=p.evaluate('__lms.confirmed["cmi.suspend_data"]');now=json.loads(actual)
  assert len(now['tracking']['pageMs'])>=22 and now['scope']==env['scope'] and now['learnerId']==env['learnerId']
  (ROOT/'evidence/tracking-framing-stress.json').write_text(json.dumps({'applicationCharacters':p.evaluate('JSON.stringify(Unit3Debug.snapshot()).length'),'actualEmittedEnvelopeCharacters':len(actual),'trackingPageRows':len(now['tracking']['pageMs']),'scopeCharacters':len(env['scope']),'learnerIdCharacters':len(env['learnerId']),'assumptions':'Controlled API restore with long scope/learner identifiers, 22 historical timing rows and long counters; not a tenant-config upper bound.'},indent=2));p.close()
 def legacy(version):
  code="const e=require('./tests/repair/emit_bridge.cjs');process.stdout.write(e.emit('proposed',{version:process.argv[1],projectSlug:'legacy',storageKeys:['legacy-work'],tracking:null}));"
  script=subprocess.check_output(['node','-e',code,version],cwd=ROOT,env={**os.environ,'NODE_PATH':subprocess.check_output(['npm','root','-g'],text=True).strip()}).decode()
  api=(ROOT/'tests/repair/lms_harness.js').read_text()+";window.API={LMSInitialize:API_1484_11.Initialize,LMSFinish:API_1484_11.Terminate,LMSGetValue:API_1484_11.GetValue,LMSSetValue:API_1484_11.SetValue,LMSCommit:API_1484_11.Commit,LMSGetLastError:API_1484_11.GetLastError,LMSGetDiagnostic:API_1484_11.GetDiagnostic};"
  p=b.new_page();p.set_content('<body data-scorm-save-mode="automatic"><p>Legacy caller</p><span id="save-status" data-local-status></span><script>'+ENV+api+script+'</script></body>');p.wait_for_timeout(60)
  assert p.evaluate("()=>{localStorage.setItem('legacy-work','original');return __canvasHelperScorm.save();}") is True
  assert p.evaluate('__canvasHelperScorm.saveAsync()') is True
  p.evaluate('__lms.rejectCommit=true');assert p.evaluate('__canvasHelperScorm.save()') is False
  assert p.locator('[data-scorm-status]').is_visible();p.evaluate('__lms.rejectCommit=false');assert p.evaluate('__canvasHelperScorm.saveAsync()') is True
  p.close()
 t('exact-c35-unchecked-after-success',['FEEDBACK-01'],c35)
 t('menu-wrap-scrim-route-reference',['ACCESS-01','ACCESS-02','ACCESS-03'],mobile)
 t('actual-bridge-full-tracking-framing',['CAP-01','CODEC-05'],framing)
 t('legacy-2004-boolean-and-automatic-controls',['SAVE-13'],lambda:legacy('2004'))
 t('legacy-12-boolean-and-automatic-controls',['SAVE-13'],lambda:legacy('1.2'))
 b.close()
(ROOT/'evidence/repair-edge-browser-results.json').write_text(json.dumps({'command':'python tests/repair/edge_browser_cases.py','environment':'Real Chromium DOM, actual emitted bridge, controlled storage/locks/LMS. Legacy source tests do not substitute for actual Social course regression.','results':rows},indent=2));print(json.dumps({'passed':sum(x['result']=='passed'for x in rows),'failed':[r for r in rows if r['result']=='failed']}));sys.exit(any(x['result']=='failed'for x in rows))
