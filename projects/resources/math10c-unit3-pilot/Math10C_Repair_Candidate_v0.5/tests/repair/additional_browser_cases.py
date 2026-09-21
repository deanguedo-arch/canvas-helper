from controlled_browser import load,ROOT,html
from playwright.sync_api import sync_playwright
import json,traceback,sys
out=[]
def check(x,m='assertion failed'):
 if not x:raise AssertionError(m)
def t(name,cases,fn):
 if len(sys.argv)>1 and name not in sys.argv[1:]:return
 try:fn();out.append({'id':name,'cases':cases,'result':'passed'})
 except Exception as e:out.append({'id':name,'cases':cases,'result':'failed','detail':traceback.format_exc()});print('FAIL',name,str(e)[:250],flush=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 def page(**kw):
  p=b.new_page();p.set_default_timeout(5000);load(p,**kw);return p
 def resume():
  p=page();p.evaluate("location.hash='u3-35'");p.wait_for_timeout(60);i=p.locator('[data-answer="g35"]');i.fill('x^2+3x+4x+12');p.locator('[data-check="g35"]').click();i.fill('x^2+2x+5x+12');p.evaluate('Unit3Debug.retry()');s=p.evaluate('Unit3Debug.snapshot()');wire=p.evaluate('__lms.confirmed["cmi.suspend_data"]');p.close()
  q=page(prelude='window.TEST_INITIAL_LMS='+json.dumps({'cmi.suspend_data':wire})+';');now=q.evaluate('Unit3Debug.unpack(Unit3Debug.snapshot())');old=q.evaluate('(x)=>Unit3Debug.unpack(x)',s)
  for k in ['r','drafts','firsts','exposed','counts','skills','summaryRevision']:check(now[k]==old[k],k)
  check(q.locator('[data-answer="g35"]').input_value()=='x^2+2x+5x+12');check('not been checked' in q.locator('[data-feedback="g35"]').inner_text());q.close()
 def huge_backup():
  p=page();p.evaluate('Unit3Debug.retry()');before=p.evaluate('__lms.confirmed["cmi.suspend_data"]');last=p.evaluate('Unit3Debug.saving().lastConfirmed')
  raw=(ROOT/'tests/repair/fixtures/capacity/bmp.json').read_bytes();p.locator('#backup-file').set_input_files({'name':'big-work.json','mimeType':'application/json','buffer':raw});p.wait_for_timeout(50);p.locator('#decision-yes').click();p.wait_for_timeout(50)
  v=p.evaluate('Unit3Debug.saving()');check(v['dirty']);check(v['lastConfirmed']==last);check('budget' in v['currentError']);check(any(len(x['raw'])>40000 for x in v['branches']));p.evaluate('__canvasHelperScorm.save()');check(p.evaluate('__lms.confirmed["cmi.suspend_data"]')==before);check('Not saved' in p.locator('#save-message').inner_text());check(p.evaluate('Unit3Debug.stateChars()')>40000);p.close()
 def old_bridge():
  p=page(which='base');check(p.evaluate('Unit3Debug.saving().dirty'));check('receipt' in p.evaluate('Unit3Debug.saving().currentError'));p.evaluate('__canvasHelperScorm.save()');check(p.evaluate('__lms.commits')==0);check('Saved to Brightspace' not in p.locator('#save-message').inner_text());p.close()
 def preserved_protection():
  raw=(ROOT/'tests/repair/fixtures/ui-long-session.json').read_text();p=page(managed=False,prelude='__env.values["math10c-unit3-pilot:review:v2"]='+json.dumps(raw)+';');before=p.evaluate('Unit3Debug.unpack(Unit3Debug.snapshot())');pins={i:before['r'][i]for i in before['pins']};p.evaluate("location.hash='u3-practice'");p.wait_for_timeout(60);p.locator('#practice-next').click();after=p.evaluate('Unit3Debug.unpack(Unit3Debug.snapshot())');check(after['pins']==before['pins']);check(all(after['r'][i]==r for i,r in pins.items()));check(len(after['active'])==6);p.close()
 def selected_replace():
  raw=(ROOT/'tests/repair/fixtures/ui-long-session.json').read_text();p=page(managed=False,prelude='__env.values["math10c-unit3-pilot:review:v2"]='+json.dumps(raw)+';');before=p.evaluate('Unit3Debug.unpack(Unit3Debug.snapshot())');oldpins=before['pins'];p.evaluate("location.hash='u3-practice'");p.wait_for_timeout(60);p.locator('#pin-current').click();assert p.evaluate('Unit3Debug.unpack(Unit3Debug.snapshot()).pins')==oldpins
  p.evaluate("location.hash='u3-work'");p.wait_for_timeout(60);button=p.locator('[data-toggle-pin="'+oldpins[0]+'"]');button.click();p.locator('#decision-no').click();assert p.evaluate('Unit3Debug.unpack(Unit3Debug.snapshot()).pins')==oldpins
  button.click();p.locator('#decision-yes').click();p.wait_for_timeout(60);mid=p.evaluate('Unit3Debug.unpack(Unit3Debug.snapshot())');assert oldpins[0] in mid['recent']and oldpins[0]in mid['r'];assert mid['r'][oldpins[0]]==before['r'][oldpins[0]]
  p.evaluate("location.hash='u3-practice'");p.wait_for_timeout(60);p.locator('#pin-current').click();after=p.evaluate('Unit3Debug.unpack(Unit3Debug.snapshot())');assert len(after['pins'])==4;assert all(after['r'][i]==before['r'][i]for i in oldpins[1:]);p.close()
 def revealed_answer_evidence():
  p=page();p.evaluate("location.hash='u3-35'");p.wait_for_timeout(60);p.locator('[data-solution="c35"]').click();p.locator('[data-answer="c35"]').fill('(x+3)(x-4)');p.locator('[data-check="c35"]').click();a=p.evaluate("Unit3Debug.unpack(Unit3Debug.snapshot()).r['s-c35'].a[0]");assert a[2]=='correct'and a[3]&2
  p.locator('[data-paper="3.5"]').check();p.locator('[data-record="3.5"]').click();s=p.evaluate('Unit3Debug.unpack(Unit3Debug.snapshot())');assert '3.5' in s['done'];assert s['paper']['3.5'] and not s['reasons'].get('3.5');assert s['r']['s-c35']['a'][0]==a;p.close()
 def withdraw():
  p=page();p.evaluate("location.hash='u3-35'");p.wait_for_timeout(60);p.locator('[data-answer="g35"]').fill('x^2+3x+4x+12');p.locator('[data-check="g35"]').click();before=p.evaluate('Unit3Debug.unpack(Unit3Debug.snapshot())');p.evaluate("document.getElementById('u3-35').dataset.mathChecking='paused'");p.locator('[data-check="g35"]').click();after=p.evaluate('Unit3Debug.unpack(Unit3Debug.snapshot())');check({i:{k:v for k,v in r.items()if k!='s'}for i,r in after['r'].items()}=={i:{k:v for k,v in r.items()if k!='s'}for i,r in before['r'].items()},'withdrawal changed retained submissions or drafts');check(after['done']==before['done'],'completion changed');check('paused' in p.locator('#toast').inner_text(),'no withdrawal guidance: '+p.locator('#toast').inner_text());p.close()
 def canonical_hint():
  p=page();p.evaluate("location.hash='u3-35'");p.wait_for_timeout(60);p.evaluate("document.querySelector('[data-support-q=\"g35\"] [data-support-hint]').textContent='Teacher-owned hint sentinel.'")
  p.locator('[data-hint="g35"]').click();check('Teacher-owned hint sentinel.'in p.locator('[data-feedback="g35"]').inner_text());p.close()
 t('actual-wire-resume-retains-unchecked-and-provenance',['STATE-07','FEEDBACK-02','TRIG-05'],resume)
 t('oversized-import-preserves-both-and-last-save',['SAVE-03','CAP-05'],huge_backup)
 t('missing-receipt-capability-never-saved',['SAVE-13'],old_bridge)
 t('selected-and-active-survive-unrelated-navigation',['STATE-06'],preserved_protection)
 t('explicit-selected-replacement-preserves-detail',['STATE-06'],selected_replace)
 t('revealed-answer-supported-and-paper-route',['FEEDBACK-04','LEARNING-06'],revealed_answer_evidence)
 t('withdrawal-preserves-work-and-completion',['REPO-04'],withdraw)
 t('canonical-hint-is-live-source',['REPO-04'],canonical_hint)
 b.close()
file=ROOT/'evidence/repair-additional-browser-results.json'
if len(sys.argv)>1 and file.exists():
 prior=json.loads(file.read_text())['results'];names={x['id']for x in out};out=[x for x in prior if x['id']not in names]+out
file.write_text(json.dumps({'command':'python tests/repair/additional_browser_cases.py','environment':'Actual DOM and emitted bridge; controlled storage/locks/API, not live repository or tenant','results':out},indent=2));print(json.dumps({'passed':sum(x['result']=='passed'for x in out),'failed':sum(x['result']=='failed'for x in out)}))
raise SystemExit(any(x['result']=='failed'for x in out))
